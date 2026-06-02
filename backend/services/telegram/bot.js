/**
 * Purpose: The async orchestrator that turns raw Telegram updates into command
 * invocations and back into replies. It owns per-chat conversation state,
 * builds the `ctx` each handler uses, and runs either the long-polling loop or
 * the webhook handler. All business logic lives in commands.js / practice.js —
 * bot.js only routes and adapts.
 *
 * Upstream (inputs): updates from Telegram (polling getUpdates, or the
 * POST /api/telegram/webhook endpoint wired in index.js); a TelegramClient,
 * Commands instance, store, config and logger.
 * Downstream (outputs): replies/keyboards/voice via the client; interaction
 * logs via the logger. Designed so processUpdate() can be driven directly by
 * tests with a fake client (no network, no real bot).
 */

// Extract a downloadable file descriptor from a message, if any.
function extractFile(message) {
  if (message.document) {
    return {
      type: 'document',
      fileId: message.document.file_id,
      fileName: message.document.file_name,
      size: message.document.file_size,
    };
  }
  if (message.video) {
    return { type: 'video', fileId: message.video.file_id, fileName: message.video.file_name, size: message.video.file_size };
  }
  if (message.photo && message.photo.length) {
    const best = message.photo[message.photo.length - 1];
    return { type: 'photo', fileId: best.file_id, fileName: `photo-${best.file_unique_id}.jpg`, size: best.file_size };
  }
  if (message.audio) {
    return { type: 'audio', fileId: message.audio.file_id, fileName: message.audio.file_name, size: message.audio.file_size };
  }
  return null;
}

export class TelegramBot {
  constructor({ client, commands, store, config, logger }) {
    this.client = client;
    this.commands = commands;
    this.store = store;
    this.config = config;
    this.logger = logger;
    this.states = new Map(); // chatId -> conversation state
    this._offset = 0;
    this._polling = false;
    this._pollAbort = null;
  }

  getState(chatId) {
    return this.states.get(String(chatId)) || null;
  }

  setState(chatId, state) {
    this.states.set(String(chatId), state);
  }

  clearState(chatId) {
    this.states.delete(String(chatId));
  }

  // Build the per-update ctx handed to command handlers.
  _buildCtx({ chatId, userId, message, callbackQuery }) {
    const self = this;
    const ctx = {
      chatId: String(chatId),
      userId: String(userId),
      message,
      callbackQuery,
      callbackData: callbackQuery?.data,
      get state() {
        return self.getState(chatId);
      },
      setState: (s) => self.setState(chatId, s),
      clearState: () => self.clearState(chatId),
      reply: (text, extra = {}) => self.client.sendMessage(chatId, text, extra),
      typing: () => self.client.sendChatAction(chatId, 'typing').catch(() => {}),
      answerCallback: (text, extra = {}) =>
        callbackQuery ? self.client.answerCallbackQuery(callbackQuery.id, { text, ...extra }).catch(() => {}) : Promise.resolve(),
      // Edit the text of the message that carried the inline keyboard.
      editText: (text, replyMarkup) =>
        callbackQuery
          ? self.client
              .editMessageText(chatId, callbackQuery.message.message_id, text, replyMarkup ? { reply_markup: replyMarkup } : {})
              .catch(() => {})
          : Promise.resolve(),
      editKeyboard: (replyMarkup) =>
        callbackQuery
          ? self.client
              .call('editMessageReplyMarkup', {
                chat_id: chatId,
                message_id: callbackQuery.message.message_id,
                reply_markup: replyMarkup,
              })
              .catch(() => {})
          : Promise.resolve(),
      sendVoice: (buffer) => self.client.sendVoice(chatId, buffer),
      downloadVoice: () => self._downloadVoice(message),
    };
    return ctx;
  }

  // Download a voice note's raw bytes (getFile -> download).
  async _downloadVoice(message) {
    const voice = message?.voice || message?.audio;
    if (!voice) throw new Error('no voice in message');
    const fileInfo = await this.client.getFile(voice.file_id);
    return this.client.downloadFile(fileInfo.file_path);
  }

  // Parse "/command@bot arg1 arg2" -> { name, args }.
  _parseCommand(text) {
    const match = text.match(/^\/([A-Za-z0-9_]+)(?:@\w+)?(?:\s+([\s\S]*))?$/);
    if (!match) return null;
    const name = match[1].toLowerCase();
    const args = (match[2] || '').trim();
    return { name, args: args ? args.split(/\s+/) : [] };
  }

  // Main entry: route one update. Never throws — errors are logged and (when
  // possible) surfaced to the user, so the polling loop / webhook stays alive.
  async processUpdate(update) {
    const started = Date.now();
    try {
      if (update.callback_query) {
        return await this._processCallback(update.callback_query, started);
      }
      if (update.message) {
        return await this._processMessage(update.message, started);
      }
    } catch (err) {
      this.logger?.recordError('processUpdate', err);
      const chatId = update.message?.chat?.id || update.callback_query?.message?.chat?.id;
      if (chatId) {
        this.client.sendMessage(chatId, '⚠️ خطایی رخ داد. لطفاً دوباره تلاش کنید.').catch(() => {});
      }
    }
  }

  async _processMessage(message, started) {
    const chatId = message.chat?.id;
    const userId = message.from?.id;
    if (chatId == null) return;
    const ctx = this._buildCtx({ chatId, userId, message });

    // Attach file/voice descriptors for the relevant handlers.
    ctx.file = extractFile(message);
    ctx.voice = message.voice ? { mimeType: message.voice.mime_type, fileId: message.voice.file_id } : null;

    const text = message.text || message.caption || '';
    const command = text.startsWith('/') ? this._parseCommand(text) : null;

    let label = 'text';
    if (command) {
      label = `/${command.name}`;
      ctx.args = command.args;
      ctx.text = text;
      await this.commands.handleCommand(command.name, ctx);
    } else if (ctx.voice) {
      label = 'voice';
      await this.commands.handleVoice(ctx);
    } else if (ctx.file) {
      label = 'file';
      await this.commands.handleFile(ctx);
    } else {
      ctx.text = text;
      await this.commands.handleText(ctx);
    }

    this.logger?.record({ chatId, command: label, durationMs: Date.now() - started, ok: true });
  }

  async _processCallback(callbackQuery, started) {
    const chatId = callbackQuery.message?.chat?.id;
    const userId = callbackQuery.from?.id;
    if (chatId == null) return;
    const ctx = this._buildCtx({ chatId, userId, message: callbackQuery.message, callbackQuery });
    await this.commands.handleCallback(ctx);
    this.logger?.record({
      chatId,
      command: `cb:${callbackQuery.data || ''}`,
      durationMs: Date.now() - started,
      ok: true,
    });
  }

  // --- polling ---------------------------------------------------------
  async startPolling() {
    if (this._polling) return;
    this._polling = true;
    // Remove any webhook so getUpdates is allowed.
    try {
      await this.client.deleteWebhook({ drop_pending_updates: false });
    } catch (err) {
      this.logger?.recordError('deleteWebhook', err);
    }
    this._loop();
  }

  async _loop() {
    while (this._polling) {
      try {
        const updates = await this.client.getUpdates(this._offset, this.config.pollTimeoutSec);
        for (const update of updates) {
          this._offset = update.update_id + 1;
          await this.processUpdate(update);
        }
      } catch (err) {
        this.logger?.recordError('poll', err);
        // Back off briefly so a transient failure doesn't busy-loop.
        await new Promise((r) => setTimeout(r, 2000));
      }
      if (this.config.pollIntervalMs > 0) {
        await new Promise((r) => setTimeout(r, this.config.pollIntervalMs));
      }
    }
  }

  stopPolling() {
    this._polling = false;
  }

  // --- webhook ---------------------------------------------------------
  async setupWebhook() {
    if (!this.config.webhookUrl) return false;
    const extra = this.config.webhookSecret ? { secret_token: this.config.webhookSecret } : {};
    await this.client.setWebhook(this.config.webhookUrl, extra);
    return true;
  }

  // Validate the secret header (if configured) and process the update.
  async handleWebhook(update, secretHeader) {
    if (this.config.webhookSecret && secretHeader !== this.config.webhookSecret) {
      return { ok: false, reason: 'bad_secret' };
    }
    await this.processUpdate(update);
    return { ok: true };
  }
}

export default TelegramBot;
