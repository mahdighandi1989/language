/**
 * Shared test doubles for the Telegram service tests. A FakeClient records every
 * outbound call so tests can assert on what the bot sent without any network,
 * and a FakeAiProvider gives deterministic practice replies/transcriptions.
 */

// Captures all outbound Telegram API calls. Methods mirror TelegramClient so the
// bot/commands talk to it identically to the real client.
export class FakeClient {
  constructor({ files = {} } = {}) {
    this.sent = [];
    this.actions = [];
    this.callbackAnswers = [];
    this.edits = [];
    this.voices = [];
    this.calls = [];
    this.files = files; // file_id -> Buffer (for downloadFile)
  }

  sendMessage(chatId, text, extra = {}) {
    const msg = { chatId: String(chatId), text, extra };
    this.sent.push(msg);
    return Promise.resolve({ message_id: this.sent.length, chat: { id: chatId } });
  }

  editMessageText(chatId, messageId, text, extra = {}) {
    this.edits.push({ chatId: String(chatId), messageId, text, extra });
    return Promise.resolve({ message_id: messageId });
  }

  sendChatAction(chatId, action) {
    this.actions.push({ chatId: String(chatId), action });
    return Promise.resolve(true);
  }

  answerCallbackQuery(id, extra = {}) {
    this.callbackAnswers.push({ id, extra });
    return Promise.resolve(true);
  }

  call(method, params) {
    this.calls.push({ method, params });
    return Promise.resolve(true);
  }

  getFile(fileId) {
    return Promise.resolve({ file_id: fileId, file_path: `path/${fileId}` });
  }

  downloadFile(filePath) {
    const fileId = filePath.replace(/^path\//, '');
    return Promise.resolve(this.files[fileId] || Buffer.from('fake-audio'));
  }

  sendVoice(chatId, voice) {
    this.voices.push({ chatId: String(chatId), voice });
    return Promise.resolve({ message_id: 999 });
  }

  // Helpers for assertions.
  lastText() {
    return this.sent.length ? this.sent[this.sent.length - 1].text : null;
  }

  allText() {
    return this.sent.map((m) => m.text).join('\n');
  }
}

// Deterministic AI provider for the practice flow.
export class FakeAiProvider {
  constructor({ reply = 'مرحبا! أهلا فيك.', transcript = 'سلام استاد', audio = null } = {}) {
    this.reply = reply;
    this.transcript = transcript;
    this.audio = audio;
    this.chatCalls = [];
    this.transcribeCalls = [];
    this.synthCalls = [];
  }

  async chat(messages, opts) {
    this.chatCalls.push({ messages: messages.map((m) => ({ ...m })), opts });
    return this.reply;
  }

  async transcribe(buffer, mimeType) {
    this.transcribeCalls.push({ size: buffer.length, mimeType });
    return this.transcript;
  }

  async synthesize(text, voice) {
    this.synthCalls.push({ text, voice });
    return this.audio; // null -> caller falls back to text only
  }
}

// Build a message update for the bot.
export function messageUpdate({ id = 1, chatId = 100, userId = 500, text, voice, document, photo } = {}) {
  const message = { message_id: id, chat: { id: chatId }, from: { id: userId } };
  if (text != null) message.text = text;
  if (voice) message.voice = voice;
  if (document) message.document = document;
  if (photo) message.photo = photo;
  return { update_id: id, message };
}

// Build a callback-query update for the bot.
export function callbackUpdate({ id = 1, chatId = 100, userId = 500, data, messageId = 50 } = {}) {
  return {
    update_id: id,
    callback_query: {
      id: String(id),
      from: { id: userId },
      data,
      message: { message_id: messageId, chat: { id: chatId } },
    },
  };
}
