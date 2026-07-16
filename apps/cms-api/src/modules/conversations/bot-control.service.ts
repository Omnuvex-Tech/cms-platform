import { Injectable, Logger } from '@nestjs/common';

interface BotControlSettings {
  enabled: boolean;
  url: string;
  apiKey: string;
  timeoutMs: number;
  maxAttempts: number;
}

/**
 * Pushes panel->bot conversation-control actions (pause/resume, manual send)
 * to the bot instead of leaving them as DB-only writes. Mirrors BotSyncService's
 * fire-and-forget push pattern; the bot's receivers live under
 * `<BOT_BASE_URL>/internal/conversations/*`, keyed by the same threadId the
 * panel stores on Conversation.
 *
 * OFF by default (SYNC_ENABLED / BOT_CONTROL_ENABLED unset) — until then this
 * is a no-op and setBot/reply behave exactly as before (DB-only).
 */
@Injectable()
export class BotControlService {
  private readonly logger = new Logger(BotControlService.name);

  private settings(): BotControlSettings {
    // Same precedence as BotSyncService: the shared SYNC_ENABLED master switch
    // wins; BOT_CONTROL_ENABLED lets this flow be toggled independently; and
    // BOT_SYNC_ENABLED (the panel's existing legacy flag for bot-related
    // pushes) is the last-resort fallback so setups that only set that one
    // still pick this feature up.
    const raw =
      process.env.SYNC_ENABLED ??
      process.env.BOT_CONTROL_ENABLED ??
      process.env.BOT_SYNC_ENABLED ??
      '';
    const flag = raw.trim().toLowerCase();
    return {
      enabled: ['1', 'true', 'yes', 'on'].includes(flag),
      url: (process.env.BOT_BASE_URL ?? '').trim().replace(/\/+$/, ''),
      apiKey: (process.env.BOT_SYNC_API_KEY ?? '').trim(),
      timeoutMs: Number(process.env.BOT_SYNC_TIMEOUT_MS ?? 15000) || 15000,
      maxAttempts: Number(process.env.BOT_SYNC_MAX_ATTEMPTS ?? 3) || 3,
    };
  }

  /** Never throws — a bot outage must never break the "pause bot" panel action. */
  async setBotActive(threadId: string | null | undefined, active: boolean): Promise<void> {
    if (!threadId) return;
    await this.postToBot('/internal/conversations/bot-state', { thread_id: threadId, active });
  }

  /**
   * Push a manual reply to the bot so it actually reaches the customer.
   * Telegram-only for now — other channels are silently skipped until their
   * bot-side receivers exist.
   */
  async sendMessage(
    threadId: string | null | undefined,
    channel: string,
    text: string,
  ): Promise<void> {
    if (!threadId || channel !== 'telegram') return;
    await this.postToBot('/internal/conversations/send-message', { thread_id: threadId, text });
  }

  /** Never throws — a bot outage must never break the panel action that triggered it. */
  private async postToBot(path: string, body: Record<string, unknown>): Promise<void> {
    const settings = this.settings();
    if (!settings.enabled) return;
    if (!settings.url || !settings.apiKey) {
      this.logger.warn(
        `SYNC_ENABLED is on but BOT_BASE_URL/BOT_SYNC_API_KEY is unset; skipping push to ${path}`,
      );
      return;
    }

    let lastError = '';
    for (let attempt = 1; attempt <= settings.maxAttempts; attempt += 1) {
      try {
        const res = await fetch(`${settings.url}${path}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': settings.apiKey,
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(settings.timeoutMs),
        });

        if (res.ok) {
          this.logger.log(`Push to ${path} -> HTTP ${res.status}`);
          return;
        }

        // 4xx (bad request / auth) is permanent — retrying won't help.
        if (res.status >= 400 && res.status < 500) {
          const resBody = (await res.text().catch(() => '')).slice(0, 300);
          this.logger.error(`Push to ${path} rejected: HTTP ${res.status} ${resBody}`);
          return;
        }

        lastError = `HTTP ${res.status}`; // 5xx — transient, fall through to retry
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err); // network/timeout
      }

      if (attempt < settings.maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, Math.min(500 * 2 ** (attempt - 1), 5000)));
      }
    }

    this.logger.error(`Push to ${path} failed after ${settings.maxAttempts} attempts: ${lastError}`);
  }
}
