import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import {
  TelegramApiService,
  TelegramCallbackQuery,
  TelegramUpdate,
  TelegramUser,
} from './telegram-api.service';
import {
  ACCEPT_CALLBACK_PREFIX,
  TelegramAlertsService,
} from './telegram-alerts.service';
import { isConfigured, telegramSettings } from './telegram.settings';

/** Telegram holds the request open this long when there's nothing to report. */
const POLL_TIMEOUT_S = 30;
const BACKOFF_MIN_MS = 1000;
const BACKOFF_MAX_MS = 60000;

/**
 * Long-polls Telegram for button taps.
 *
 * Chosen over a webhook so the group's Accept button behaves identically on a
 * laptop and on the server — no public URL, no webhook registration, no tunnel
 * needed to test it. This assumes a SINGLE API process: Telegram rejects
 * concurrent getUpdates on one token with HTTP 409, which the log will name
 * plainly if a second instance ever appears.
 */
@Injectable()
export class TelegramPollerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramPollerService.name);
  private readonly abort = new AbortController();
  private stopped = false;
  private offset = 0;

  constructor(
    private readonly api: TelegramApiService,
    private readonly alerts: TelegramAlertsService,
  ) {}

  onModuleInit() {
    const settings = telegramSettings();
    if (!settings.enabled) return;
    if (!isConfigured(settings)) {
      this.logger.warn(
        'TELEGRAM_ALERTS_ENABLED is on but TELEGRAM_BOT_TOKEN/TELEGRAM_ALERT_CHAT_ID is unset; not polling.',
      );
      return;
    }
    // Deliberately not awaited — boot must not wait on Telegram.
    void this.run();
  }

  onModuleDestroy() {
    this.stopped = true;
    this.abort.abort();
  }

  private async run(): Promise<void> {
    // getUpdates is refused while a webhook is registered. Clearing it makes the
    // poller work even if one was set by hand or by an earlier deployment;
    // pending updates are kept so a tap during a restart is not lost.
    await this.api.call('deleteWebhook', { drop_pending_updates: false });
    this.logger.log('Polling Telegram for escalation button taps');

    let backoff = BACKOFF_MIN_MS;
    while (!this.stopped) {
      const updates = await this.api.call<TelegramUpdate[]>(
        'getUpdates',
        {
          offset: this.offset,
          timeout: POLL_TIMEOUT_S,
          allowed_updates: ['callback_query'],
        },
        {
          // Outlive the server-side long poll, or every cycle would abort.
          timeoutMs: (POLL_TIMEOUT_S + 15) * 1000,
          signal: this.abort.signal,
        },
      );

      if (this.stopped) break;

      if (updates === null) {
        await this.sleep(backoff);
        backoff = Math.min(backoff * 2, BACKOFF_MAX_MS);
        continue;
      }
      backoff = BACKOFF_MIN_MS;

      for (const update of updates) {
        // Advance the offset before handling: a poison update must not wedge
        // the loop into replaying it forever.
        this.offset = Math.max(this.offset, update.update_id + 1);
        if (update.callback_query) {
          await this.onCallback(update.callback_query);
        }
      }
    }
    this.logger.log('Stopped polling Telegram');
  }

  private async onCallback(query: TelegramCallbackQuery): Promise<void> {
    try {
      const data = query.data ?? '';
      if (!data.startsWith(ACCEPT_CALLBACK_PREFIX)) {
        // Unknown button (an alert from an older deploy, say) — still answer it,
        // or the tapper sits watching a spinner.
        await this.api.answerCallbackQuery(query.id);
        return;
      }

      const handoffId = Number(data.slice(ACCEPT_CALLBACK_PREFIX.length));
      if (!Number.isInteger(handoffId)) {
        await this.api.answerCallbackQuery(query.id);
        return;
      }

      const result = await this.alerts.claimFromTelegram(
        handoffId,
        displayName(query.from),
      );
      await this.api.answerCallbackQuery(
        query.id,
        result.text,
        result.showAlert,
      );
    } catch (err) {
      this.logger.error(
        `Callback handling failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      const timer = setTimeout(resolve, ms);
      // Don't hold shutdown open for a full backoff window.
      this.abort.signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timer);
          resolve();
        },
        { once: true },
      );
    });
  }
}

/** How the claimer is named in the group: "Farid Javadov (@fcvdv)". */
function displayName(user: TelegramUser): string {
  const full = [user.first_name, user.last_name]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');
  const name = full || user.username || `user ${user.id}`;
  return user.username && full ? `${name} (@${user.username})` : name;
}
