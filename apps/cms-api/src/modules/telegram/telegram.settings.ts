/**
 * Config for the Telegram ops-group alerts.
 *
 * Deliberately NOT behind `SYNC_ENABLED` — that switch governs the panel <-> bot
 * data flows (KB pushes, pause/resume, manual replies). This is a separate
 * concern: notifying humans in a group chat. Either can run without the other.
 *
 * OFF by default: with TELEGRAM_ALERTS_ENABLED unset nothing is sent and the
 * long-poll loop never starts.
 */
export interface TelegramSettings {
  enabled: boolean;
  /** Bot token from @BotFather. */
  token: string;
  /** The ops group's chat id (a supergroup looks like `-1001234567890`). */
  chatId: string;
  /** Panel origin used to build the "Open in panel" deep link. */
  panelUrl: string;
  /** IANA zone for the timestamps rendered into the alert. */
  timezone: string;
  /**
   * Bot API origin. Overridable for a local Bot API server / egress proxy —
   * and for tests, which point it at a stub instead of the real Telegram.
   */
  apiBaseUrl: string;
}

const TRUTHY = ['1', 'true', 'yes', 'on'];

export function telegramSettings(): TelegramSettings {
  return {
    enabled: TRUTHY.includes(
      (process.env.TELEGRAM_ALERTS_ENABLED ?? '').trim().toLowerCase(),
    ),
    token: (process.env.TELEGRAM_BOT_TOKEN ?? '').trim(),
    chatId: (process.env.TELEGRAM_ALERT_CHAT_ID ?? '').trim(),
    panelUrl: (process.env.PANEL_BASE_URL ?? '').trim().replace(/\/+$/, ''),
    timezone: (process.env.TELEGRAM_ALERT_TIMEZONE ?? 'Asia/Baku').trim(),
    apiBaseUrl: (
      process.env.TELEGRAM_API_BASE_URL ?? 'https://api.telegram.org'
    )
      .trim()
      .replace(/\/+$/, ''),
  };
}

/** True once a token and a target chat exist — i.e. we can actually send. */
export function isConfigured(settings: TelegramSettings): boolean {
  return settings.enabled && !!settings.token && !!settings.chatId;
}

/**
 * Deep link to the conversation, or null when it can't be used as an inline
 * button URL. Telegram rejects the whole sendMessage if a button URL is not a
 * reachable http(s) address, so a bare `localhost` panel (dev) yields null and
 * the link is written into the message text instead.
 */
export function panelConversationUrl(
  settings: TelegramSettings,
  conversationId: number,
): string | null {
  if (!settings.panelUrl) return null;
  let parsed: URL;
  try {
    parsed = new URL(settings.panelUrl);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
  return `${settings.panelUrl}/conversations?open=${conversationId}`;
}

/** Whether Telegram will accept `url` on an inline button. */
export function isButtonSafeUrl(url: string | null): url is string {
  if (!url) return false;
  try {
    const { protocol, hostname } = new URL(url);
    if (protocol !== 'https:' && protocol !== 'http:') return false;
    // Telegram's servers have to resolve the host themselves — a loopback or
    // bare hostname is rejected with BUTTON_URL_INVALID.
    return !['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(hostname);
  } catch {
    return false;
  }
}
