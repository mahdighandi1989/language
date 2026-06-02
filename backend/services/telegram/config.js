/**
 * Purpose: Centralised, env-driven configuration for the two-way Telegram
 * integration. Reading this module never throws and never exits the process —
 * the Telegram bot is an *optional* feature, so when no bot token is configured
 * the rest of the system keeps working and the bot simply stays dormant.
 *
 * Upstream (inputs): environment variables (TELEGRAM_BOT_TOKEN,
 * TELEGRAM_WEBHOOK_URL, TELEGRAM_ADMIN_IDS, TELEGRAM_ALLOWED_USER_IDS,
 * TELEGRAM_DATA_DIR, TELEGRAM_MODE, NOTIFY_TELEGRAM_BOT_TOKEN/CHAT_ID for
 * backward-compatible notification delivery).
 * Downstream (outputs): consumed by services/telegram/* (client, bot, store,
 * notifications) and wired into server.js via services/telegram/index.js.
 */
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse a comma/space separated list of numeric Telegram ids into a Set of
// strings (Telegram ids are 64-bit and safer compared as strings).
function parseIdList(raw) {
  if (!raw) return new Set();
  return new Set(
    String(raw)
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

// Build the immutable runtime config from the current environment. Exposed as a
// function (not a frozen singleton) so tests can mutate process.env and re-read.
export function loadTelegramConfig(env = process.env) {
  // Prefer the dedicated bot token, but fall back to the pre-existing
  // NOTIFY_TELEGRAM_BOT_TOKEN so an operator who only configured notifications
  // still gets a working (notification-only) bot.
  const token = env.TELEGRAM_BOT_TOKEN || env.NOTIFY_TELEGRAM_BOT_TOKEN || '';
  const adminIds = parseIdList(env.TELEGRAM_ADMIN_IDS);
  // Allowed user ids gate every interactive command. When empty, the bot is
  // "open" (any chat may use read-only commands) but write/admin commands still
  // require either an allow-list entry or admin membership.
  const allowedUserIds = parseIdList(env.TELEGRAM_ALLOWED_USER_IDS);

  return {
    token,
    enabled: Boolean(token),
    mode: (env.TELEGRAM_MODE || (env.TELEGRAM_WEBHOOK_URL ? 'webhook' : 'polling')).toLowerCase(),
    webhookUrl: env.TELEGRAM_WEBHOOK_URL || '',
    // Secret token Telegram echoes back in the X-Telegram-Bot-Api-Secret-Token
    // header so the webhook endpoint can reject forged requests.
    webhookSecret: env.TELEGRAM_WEBHOOK_SECRET || '',
    apiBase: env.TELEGRAM_API_BASE || 'https://api.telegram.org',
    adminIds,
    allowedUserIds,
    // Default notification target for system events when a user has not linked
    // their own chat (keeps backward compatibility with NOTIFY_TELEGRAM_CHAT_ID).
    defaultChatId: env.TELEGRAM_CHAT_ID || env.NOTIFY_TELEGRAM_CHAT_ID || '',
    dataDir: env.TELEGRAM_DATA_DIR || join(__dirname, '../../data'),
    // Telegram bots cannot download files larger than 20 MB via getFile.
    maxFileBytes: Number(env.TELEGRAM_MAX_FILE_BYTES || 20 * 1024 * 1024),
    pollIntervalMs: Number(env.TELEGRAM_POLL_INTERVAL_MS || 0), // 0 -> long poll
    pollTimeoutSec: Number(env.TELEGRAM_POLL_TIMEOUT_SEC || 30),
    rateLimitSeconds: Number(env.TELEGRAM_NOTIFY_RATE_LIMIT_SEC || 60),
  };
}

export function isAdmin(config, telegramUserId) {
  return config.adminIds.has(String(telegramUserId));
}

// A user may use *interactive* (write) commands when the allow-list is empty
// (open mode) or when they are explicitly allow-listed / an admin.
export function isAllowed(config, telegramUserId) {
  if (isAdmin(config, telegramUserId)) return true;
  if (config.allowedUserIds.size === 0) return true;
  return config.allowedUserIds.has(String(telegramUserId));
}

export default loadTelegramConfig;
