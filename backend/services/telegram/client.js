/**
 * Purpose: A thin async wrapper around the Telegram Bot API. It is the single
 * outbound seam to Telegram so every other module (bot, commands,
 * notifications) talks to Telegram through one mockable surface — the unit
 * tests inject a fake transport here instead of hitting the network.
 *
 * Upstream (inputs): the bot token + apiBase from services/telegram/config.js;
 * an optional `fetch` implementation (injected in tests).
 * Downstream (outputs): performs HTTPS calls to https://api.telegram.org and
 * returns the parsed `result` field; throws TelegramApiError on failure so
 * callers can decide whether to retry, log, or surface the error.
 */

export class TelegramApiError extends Error {
  constructor(method, description, code) {
    super(`Telegram API ${method} failed: ${description}`);
    this.name = 'TelegramApiError';
    this.method = method;
    this.code = code;
  }
}

export class TelegramClient {
  /**
   * @param {object} opts
   * @param {string} opts.token   bot token
   * @param {string} [opts.apiBase]
   * @param {typeof fetch} [opts.fetch] injectable transport (defaults to global fetch)
   */
  constructor({ token, apiBase = 'https://api.telegram.org', fetch: fetchImpl } = {}) {
    if (!token) throw new Error('TelegramClient requires a bot token');
    this.token = token;
    this.apiBase = apiBase;
    this._fetch = fetchImpl || globalThis.fetch;
    if (typeof this._fetch !== 'function') {
      throw new Error('No fetch implementation available for TelegramClient');
    }
  }

  get _base() {
    return `${this.apiBase}/bot${this.token}`;
  }

  // Core JSON request. Returns the unwrapped `result` on success.
  async call(method, params = {}) {
    const res = await this._fetch(`${this._base}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    let data;
    try {
      data = await res.json();
    } catch {
      throw new TelegramApiError(method, `non-JSON response (HTTP ${res.status})`, res.status);
    }
    if (!data || data.ok !== true) {
      throw new TelegramApiError(method, data?.description || `HTTP ${res.status}`, data?.error_code || res.status);
    }
    return data.result;
  }

  // --- message helpers -------------------------------------------------
  sendMessage(chatId, text, extra = {}) {
    return this.call('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...extra,
    });
  }

  editMessageText(chatId, messageId, text, extra = {}) {
    return this.call('editMessageText', {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML',
      ...extra,
    });
  }

  sendChatAction(chatId, action = 'typing') {
    return this.call('sendChatAction', { chat_id: chatId, action });
  }

  answerCallbackQuery(callbackQueryId, extra = {}) {
    return this.call('answerCallbackQuery', { callback_query_id: callbackQueryId, ...extra });
  }

  // --- updates / webhook ----------------------------------------------
  getUpdates(offset, timeout = 30) {
    return this.call('getUpdates', { offset, timeout, allowed_updates: ['message', 'callback_query'] });
  }

  setWebhook(url, extra = {}) {
    return this.call('setWebhook', { url, allowed_updates: ['message', 'callback_query'], ...extra });
  }

  deleteWebhook(extra = {}) {
    return this.call('deleteWebhook', extra);
  }

  getMe() {
    return this.call('getMe');
  }

  // --- files -----------------------------------------------------------
  getFile(fileId) {
    return this.call('getFile', { file_id: fileId });
  }

  // Download a file's bytes given the file_path returned by getFile.
  async downloadFile(filePath) {
    const url = `${this.apiBase}/file/bot${this.token}/${filePath}`;
    const res = await this._fetch(url);
    if (!res.ok) {
      throw new TelegramApiError('downloadFile', `HTTP ${res.status}`, res.status);
    }
    const buf = await res.arrayBuffer();
    return Buffer.from(buf);
  }

  // --- voice -----------------------------------------------------------
  // Sends a voice note. `voice` may be a Buffer (uploaded as multipart) or a
  // remote file_id/URL string. Multipart upload uses FormData/Blob (Node 18+).
  async sendVoice(chatId, voice, extra = {}) {
    if (Buffer.isBuffer(voice)) {
      const form = new FormData();
      form.append('chat_id', String(chatId));
      for (const [k, v] of Object.entries(extra)) form.append(k, String(v));
      form.append('voice', new Blob([voice], { type: 'audio/ogg' }), 'voice.ogg');
      const res = await this._fetch(`${this._base}/sendVoice`, { method: 'POST', body: form });
      const data = await res.json();
      if (!data || data.ok !== true) {
        throw new TelegramApiError('sendVoice', data?.description || `HTTP ${res.status}`, data?.error_code);
      }
      return data.result;
    }
    return this.call('sendVoice', { chat_id: chatId, voice, ...extra });
  }
}

export default TelegramClient;
