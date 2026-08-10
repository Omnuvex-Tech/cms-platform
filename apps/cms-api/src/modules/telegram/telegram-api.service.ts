import { Injectable, Logger } from '@nestjs/common';
import { telegramSettings } from './telegram.settings';

export interface TelegramUser {
  id: number;
  is_bot?: boolean;
  first_name?: string;
  last_name?: string;
  username?: string;
}

export interface TelegramMessage {
  message_id: number;
  chat?: { id: number; title?: string; type?: string };
}

export interface TelegramCallbackQuery {
  id: string;
  from: TelegramUser;
  data?: string;
  message?: TelegramMessage;
}

export interface TelegramUpdate {
  update_id: number;
  callback_query?: TelegramCallbackQuery;
}

export interface InlineButton {
  text: string;
  callback_data?: string;
  url?: string;
}

export interface InlineKeyboard {
  inline_keyboard: InlineButton[][];
}

interface CallOptions {
  timeoutMs?: number;
  signal?: AbortSignal;
  /** Suppress the error log — used for calls whose failure is expected/benign. */
  quiet?: boolean;
}

const DEFAULT_TIMEOUT_MS = 15000;

/**
 * Thin Telegram Bot API client.
 *
 * Every call resolves to the `result` payload or `null` — it never throws, so a
 * Telegram outage can never break the panel action that triggered the alert.
 * Callers that need to know whether a send landed check for null.
 */
@Injectable()
export class TelegramApiService {
  private readonly logger = new Logger(TelegramApiService.name);

  async call<T>(
    method: string,
    payload: Record<string, unknown> = {},
    options: CallOptions = {},
  ): Promise<T | null> {
    const { token, apiBaseUrl } = telegramSettings();
    if (!token) return null;

    // One retry, and only for a 429 whose retry_after we can honour. Anything
    // else (bad chat id, message-not-found, network) is either permanent or
    // will be picked up by the next escalation anyway.
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const signal = options.signal
        ? AbortSignal.any([
            options.signal,
            AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS),
          ])
        : AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

      try {
        const res = await fetch(`${apiBaseUrl}/bot${token}/${method}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal,
        });

        const body = (await res.json().catch(() => null)) as {
          ok?: boolean;
          result?: T;
          description?: string;
          parameters?: { retry_after?: number };
        } | null;

        if (body?.ok) return body.result as T;

        const retryAfter = body?.parameters?.retry_after;
        if (res.status === 429 && retryAfter && attempt === 0) {
          await new Promise((resolve) =>
            setTimeout(resolve, Math.min(retryAfter, 30) * 1000),
          );
          continue;
        }

        if (!options.quiet) {
          this.logger.error(
            `${method} failed: HTTP ${res.status} ${body?.description ?? ''}`.trim(),
          );
        }
        return null;
      } catch (err) {
        // A long poll aborted by shutdown is expected, not a failure.
        if (!options.quiet && !options.signal?.aborted) {
          const message = err instanceof Error ? err.message : String(err);
          this.logger.error(`${method} failed: ${message}`);
        }
        return null;
      }
    }
    return null;
  }

  /** Returns the sent message (for its `message_id`) or null. */
  sendMessage(
    chatId: string,
    text: string,
    keyboard?: InlineKeyboard,
  ): Promise<TelegramMessage | null> {
    return this.call<TelegramMessage>('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...(keyboard ? { reply_markup: keyboard } : {}),
    });
  }

  /**
   * Rewrite an already-posted alert in place. Telegram answers with
   * "message is not modified" when the text and markup are byte-identical;
   * that's benign, so it is logged quietly.
   */
  editMessage(
    chatId: string,
    messageId: number,
    text: string,
    keyboard?: InlineKeyboard,
  ): Promise<TelegramMessage | null> {
    return this.call<TelegramMessage>('editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      // An explicit empty keyboard is what removes the Accept button; omitting
      // reply_markup would leave the old one attached.
      reply_markup: keyboard ?? { inline_keyboard: [] },
    });
  }

  /**
   * Close the loading spinner on the tapped button. `showAlert` turns the
   * ephemeral toast into a modal — used to tell a late tapper who beat them.
   * Callback ids expire after ~1 minute, so a failure here is not worth logging.
   */
  answerCallbackQuery(
    callbackQueryId: string,
    text?: string,
    showAlert = false,
  ): Promise<true | null> {
    return this.call<true>(
      'answerCallbackQuery',
      {
        callback_query_id: callbackQueryId,
        ...(text ? { text, show_alert: showAlert } : {}),
      },
      { quiet: true },
    );
  }
}
