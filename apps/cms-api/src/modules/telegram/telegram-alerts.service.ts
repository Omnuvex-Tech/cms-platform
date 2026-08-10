import { Injectable, Logger } from '@nestjs/common';
import {
  TelegramApiService,
  InlineButton,
  InlineKeyboard,
} from './telegram-api.service';
import { HandoffForAlert, TelegramRepository } from './telegram.repository';
import {
  isButtonSafeUrl,
  isConfigured,
  panelConversationUrl,
  telegramSettings,
  TelegramSettings,
} from './telegram.settings';

/** Who performed the action — a panel user id, or a raw Telegram display name. */
export interface AlertActor {
  userId?: number | null;
  label?: string | null;
}

/** Prefix of the Accept button's callback_data. Must stay <= 64 bytes total. */
export const ACCEPT_CALLBACK_PREFIX = 'handoff:accept:';

const REASON_MAX = 400;

const CHANNEL_LABELS: Record<string, string> = {
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  webchat: 'Web chat',
  phone: 'Phone',
};

/**
 * Posts escalation alerts into the Telegram ops group and keeps that one message
 * current: the Accept button is what stops two reps working the same escalation,
 * so every state change (claimed here, accepted in the panel, resolved anywhere)
 * edits the original message in place rather than adding a new one.
 *
 * Nothing here throws. An alert is a notification — a Telegram outage must never
 * fail the escalation, accept or resolve that triggered it.
 */
@Injectable()
export class TelegramAlertsService {
  private readonly logger = new Logger(TelegramAlertsService.name);

  constructor(
    private readonly api: TelegramApiService,
    private readonly repository: TelegramRepository,
  ) {}

  /**
   * A handoff was just created or reopened — announce it. Called only from
   * IngestService.handleEscalation, which already suppresses repeat pushes for
   * an episode that is still open, so this fires once per escalation.
   */
  async notifyEscalation(handoffId: number): Promise<void> {
    const settings = telegramSettings();
    if (!isConfigured(settings)) return;

    try {
      const handoff = await this.repository.findHandoffForAlert(handoffId);
      if (!handoff) return;

      // A re-escalation reuses the handoff row, so render as a fresh alert
      // rather than from the previous episode's (resolved) state.
      const body = this.renderBody(handoff, settings);
      const sent = await this.api.sendMessage(
        settings.chatId,
        this.compose(body, null, settings),
        this.keyboard(handoff.id, handoff.conversation.id, settings, null),
      );
      if (!sent) return;

      await this.repository.saveAlert(
        handoffId,
        settings.chatId,
        sent.message_id,
        body,
      );
      this.logger.log(
        `Escalation alert posted for handoff ${handoffId} (message ${sent.message_id})`,
      );
    } catch (err) {
      this.logError('notifyEscalation', err);
    }
  }

  /**
   * Someone accepted the handoff in the panel. Mirror it into the group so the
   * Accept button disappears there too — otherwise a rep in Telegram would tap
   * into work already under way.
   */
  async markClaimed(handoffId: number, actor: AlertActor): Promise<void> {
    if (!isConfigured(telegramSettings())) return;
    try {
      const label = await this.label(actor);
      // Loses to an existing claim on purpose: the first name recorded is the
      // one the group already saw.
      if (!(await this.repository.claimAlert(handoffId, label))) return;
      await this.refresh(handoffId);
    } catch (err) {
      this.logError('markClaimed', err);
    }
  }

  /**
   * The handoff was resolved — from the Handoff Queue, from "return to bot", or
   * by resuming the bot on the Conversations page. All three end the episode, so
   * all three land here.
   */
  async markResolved(handoffId: number, actor: AlertActor): Promise<void> {
    if (!isConfigured(telegramSettings())) return;
    try {
      const label = await this.label(actor);
      if (!(await this.repository.resolveAlert(handoffId, label))) return;
      await this.refresh(handoffId);
    } catch (err) {
      this.logError('markResolved', err);
    }
  }

  /**
   * A group member tapped Accept. Returns the toast to show them — a plain
   * confirmation for the winner, a modal naming the owner for anyone who was
   * beaten to it.
   */
  async claimFromTelegram(
    handoffId: number,
    label: string,
  ): Promise<{ text: string; showAlert: boolean }> {
    try {
      const alert = await this.repository.findAlert(handoffId);
      if (!alert) {
        return {
          text: 'This escalation is no longer tracked.',
          showAlert: true,
        };
      }
      if (alert.resolvedAt) {
        return {
          text: `Already resolved${alert.resolvedBy ? ` by ${alert.resolvedBy}` : ''}.`,
          showAlert: true,
        };
      }
      if (alert.claimedAt) {
        return {
          text: `Already taken by ${alert.claimedBy ?? 'someone else'}.`,
          showAlert: true,
        };
      }

      if (!(await this.repository.claimAlert(handoffId, label))) {
        // Lost the race between the read above and the write.
        const current = await this.repository.findAlert(handoffId);
        return {
          text: `Already taken by ${current?.claimedBy ?? 'someone else'}.`,
          showAlert: true,
        };
      }

      await this.repository.markHandoffActive(handoffId);
      await this.refresh(handoffId);
      this.logger.log(`Handoff ${handoffId} claimed in Telegram by ${label}`);
      return {
        text: "It's yours — open the panel to see the transcript and reply.",
        showAlert: false,
      };
    } catch (err) {
      this.logError('claimFromTelegram', err);
      return { text: 'Could not claim it, try again.', showAlert: true };
    }
  }

  /** Setup helper: is the token valid, and can the bot post to the group? */
  async selfTest(): Promise<Record<string, unknown>> {
    const settings = telegramSettings();
    const base = {
      enabled: settings.enabled,
      hasToken: !!settings.token,
      chatId: settings.chatId || null,
      panelUrl: settings.panelUrl || null,
    };
    if (!isConfigured(settings)) {
      return {
        ...base,
        ok: false,
        error:
          'Set TELEGRAM_ALERTS_ENABLED=1, TELEGRAM_BOT_TOKEN and TELEGRAM_ALERT_CHAT_ID, then restart the API.',
      };
    }

    const me = await this.api.call<{ username?: string }>('getMe');
    const sent = await this.api.sendMessage(
      settings.chatId,
      '🔔 <b>Test alert</b>\nEscalation notifications are wired up correctly.',
    );
    return {
      ...base,
      ok: !!sent,
      bot: me?.username ? `@${me.username}` : null,
      messageId: sent?.message_id ?? null,
      ...(sent
        ? {}
        : {
            error:
              'Telegram refused the send — check the chat id and that the bot is a member of the group.',
          }),
    };
  }

  /**
   * Re-post the frozen body under a new status footer. Only the footer and the
   * keyboard change — what the group already read stays word for word.
   */
  private async refresh(handoffId: number): Promise<void> {
    const settings = telegramSettings();
    const handoff = await this.repository.findHandoffForAlert(handoffId);
    const alert = handoff?.telegramAlert;
    if (!handoff || !alert) return;
    await this.api.editMessage(
      alert.chatId,
      alert.messageId,
      this.compose(alert.body, alert, settings),
      this.keyboard(handoff.id, handoff.conversation.id, settings, alert),
    );
  }

  /** A panel actor's display name, or the raw Telegram one. */
  private async label(actor: AlertActor): Promise<string> {
    const explicit = actor.label?.trim();
    if (explicit) return explicit;
    const looked = await this.repository.findUserLabel(actor.userId);
    return looked ?? 'the panel';
  }

  /** Who escalated and why — written once, never re-derived. */
  private renderBody(
    handoff: HandoffForAlert,
    settings: TelegramSettings,
  ): string {
    const conversation = handoff.conversation;
    const channel =
      CHANNEL_LABELS[conversation.channel] ?? conversation.channel;
    const who =
      conversation.customerHandle?.trim() ||
      conversation.customerPhone?.trim() ||
      conversation.threadId;

    const lines: string[] = [];
    lines.push(`🚨 <b>Human requested</b> · ${esc(channel)}`);
    lines.push(`👤 <b>${esc(who)}</b>`);

    const phone = conversation.customerPhone?.trim();
    if (phone && phone !== who) lines.push(`📞 <code>${esc(phone)}</code>`);

    const facts = [
      conversation.topProject,
      conversation.budget,
      conversation.stage,
    ]
      .map((value) => value?.trim())
      .filter((value): value is string => !!value);
    if (facts.length) lines.push(`🏷 ${esc(facts.join(' · '))}`);

    const reason = handoff.reason?.trim();
    if (reason) {
      const trimmed =
        reason.length > REASON_MAX ? `${reason.slice(0, REASON_MAX)}…` : reason;
      lines.push('', `💬 <i>${esc(trimmed)}</i>`);
    }

    // The button carries the link when Telegram will accept the URL; in dev
    // (localhost panel) it won't, so put the address in the text instead.
    const url = panelConversationUrl(settings, conversation.id);
    if (url && !isButtonSafeUrl(url)) lines.push('', `🔗 ${esc(url)}`);

    return lines.join('\n');
  }

  /** The frozen body plus the one line that changes as the episode moves on. */
  private compose(
    body: string,
    alert: {
      claimedAt: Date | null;
      claimedBy: string | null;
      resolvedAt: Date | null;
      resolvedBy: string | null;
    } | null,
    settings: TelegramSettings,
  ): string {
    let footer: string;
    if (alert?.resolvedAt) {
      footer =
        `✔️ <b>Resolved</b>${alert.resolvedBy ? ` by ${esc(alert.resolvedBy)}` : ''}` +
        ` · ${this.time(alert.resolvedAt, settings)}`;
    } else if (alert?.claimedAt) {
      footer =
        `✅ <b>Taken by ${esc(alert.claimedBy ?? 'someone')}</b>` +
        ` · ${this.time(alert.claimedAt, settings)}`;
    } else {
      footer = '⏳ <b>Unclaimed</b> — first to tap Accept owns it.';
    }
    return `${body}\n\n${footer}`;
  }

  /**
   * Both ids are needed and they are NOT interchangeable: the Accept button
   * round-trips the HANDOFF id (what the tap acts on), the link addresses the
   * CONVERSATION (what the panel opens).
   */
  private keyboard(
    handoffId: number,
    conversationId: number,
    settings: TelegramSettings,
    alert: { claimedAt: Date | null; resolvedAt: Date | null } | null,
  ): InlineKeyboard | undefined {
    const buttons: InlineButton[] = [];
    if (!alert?.claimedAt && !alert?.resolvedAt) {
      buttons.push({
        text: '✅ Accept',
        callback_data: `${ACCEPT_CALLBACK_PREFIX}${handoffId}`,
      });
    }
    const url = panelConversationUrl(settings, conversationId);
    if (isButtonSafeUrl(url)) buttons.push({ text: '💬 Open in panel', url });
    return buttons.length ? { inline_keyboard: [buttons] } : undefined;
  }

  private time(date: Date, settings: TelegramSettings): string {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: settings.timezone,
      }).format(date);
    } catch {
      // Unknown IANA zone — fall back rather than lose the whole edit.
      return `${date.toISOString().slice(11, 16)} UTC`;
    }
  }

  private logError(where: string, err: unknown) {
    this.logger.error(
      `${where} failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

/** Escape the three characters Telegram's HTML parse mode reserves. */
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
