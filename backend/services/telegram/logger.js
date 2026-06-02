/**
 * Purpose: Structured, in-memory + console logging for every Telegram
 * interaction (commands, callbacks, errors, response times). Keeps a bounded
 * ring buffer so the /admin_logs command can surface recent activity without a
 * database, and so tests can assert that an interaction was recorded.
 *
 * Upstream (inputs): the bot/command layer calls record()/recordError().
 * Downstream (outputs): console (greppable single lines) + recent() for
 * /admin_logs. Sensitive substrings (bot tokens, Google API keys, key= query
 * params) are stripped inline so they never land in a log line. Redaction is
 * self-contained here (no config/env import) so the logger stays importable in
 * unit tests without environment validation.
 */

const MAX_ENTRIES = 500;

// Strip secrets from a log string: Telegram bot tokens, Google API keys, and
// any `key=` query parameter value.
function redactSecrets(text) {
  return String(text)
    .replace(/bot\d+:[A-Za-z0-9_-]+/g, 'bot[REDACTED]')
    .replace(/AIza[0-9A-Za-z_-]{10,}/g, '[REDACTED]')
    .replace(/([?&]key=)[^&\s"']+/g, '$1[REDACTED]');
}

export class TelegramLogger {
  constructor({ max = MAX_ENTRIES, sink = console } = {}) {
    this.max = max;
    this.sink = sink;
    this.entries = [];
  }

  _push(entry) {
    this.entries.push(entry);
    if (this.entries.length > this.max) this.entries.shift();
  }

  // Redact the token inside any Telegram API URL as well as Gemini keys.
  _redact(text) {
    if (text == null) return text;
    return redactSecrets(text);
  }

  record({ chatId, command, durationMs = null, ok = true, meta = {} }) {
    const entry = {
      ts: new Date().toISOString(),
      chatId: chatId != null ? String(chatId) : null,
      command: this._redact(command),
      durationMs,
      ok,
      meta,
    };
    this._push(entry);
    const dur = durationMs != null ? ` ${durationMs}ms` : '';
    this.sink.log(`[telegram] chat=${entry.chatId} cmd=${entry.command} ok=${ok}${dur}`);
    return entry;
  }

  recordError(context, error) {
    const message = this._redact(error?.stack || error?.message || String(error));
    const entry = {
      ts: new Date().toISOString(),
      level: 'error',
      context: this._redact(context),
      message,
    };
    this._push(entry);
    this.sink.error(`[telegram:error] ${context}: ${message}`);
    return entry;
  }

  recent(limit = 20) {
    return this.entries.slice(-limit);
  }
}

export default TelegramLogger;
