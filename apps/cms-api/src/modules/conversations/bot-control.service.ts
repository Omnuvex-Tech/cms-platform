import { Injectable, Logger } from '@nestjs/common';

interface BotControlSettings {
  enabled: boolean;
  url: string;
  apiKey: string;
  timeoutMs: number;
  maxAttempts: number;
}

/**
 * Pushes the panel's "Pause bot" / "Resume bot" toggle to the bot so it
 * actually stops/resumes replying on a thread, instead of just flipping the
 * DB column. Mirrors BotSyncService's fire-and-forget push pattern; the bot's
 * receiver is `POST <BOT_BASE_URL>/internal/conversations/bot-state`, keyed by
 * the same threadId the panel stores on Conversation.
 *
 * OFF by default (SYNC_ENABLED / BOT_CONTROL_ENABLED unset) — until then this
 * is a no-op and setBot behaves exactly as before (DB-only).
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
    const settings = this.settings();
    if (!settings.enabled || !threadId) return;
    if (!settings.url || !settings.apiKey) {
      this.logger.warn(
        'SYNC_ENABLED is on but BOT_BASE_URL/BOT_SYNC_API_KEY is unset; skipping bot-state push',
      );
      return;
    }

    let lastError = '';
    for (let attempt = 1; attempt <= settings.maxAttempts; attempt += 1) {
      try {
        const res = await fetch(`${settings.url}/internal/conversations/bot-state`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': settings.apiKey,
          },
          body: JSON.stringify({ thread_id: threadId, active }),
          signal: AbortSignal.timeout(settings.timeoutMs),
        });

        if (res.ok) {
          this.logger.log(`Bot-state push thread=${threadId} active=${active} -> HTTP ${res.status}`);
          return;
        }

        // 4xx (bad request / auth) is permanent — retrying won't help.
        if (res.status >= 400 && res.status < 500) {
          const body = (await res.text().catch(() => '')).slice(0, 300);
          this.logger.error(`Bot-state push rejected: HTTP ${res.status} ${body}`);
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

    this.logger.error(
      `Bot-state push thread=${threadId} failed after ${settings.maxAttempts} attempts: ${lastError}`,
    );
  }
}
