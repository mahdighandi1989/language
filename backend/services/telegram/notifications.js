/**
 * Purpose: Async, event-driven notification delivery to Telegram. A lightweight
 * EventBus (Node EventEmitter) decouples event *producers* (request handlers,
 * the practice flow, error handlers) from *delivery*: producers just emit, and
 * the NotificationService formats a Persian message and sends it via the
 * Telegram client without blocking the producer. Delivery respects each chat's
 * notification settings and a per-event rate limit so a noisy event can't spam
 * the channel.
 *
 * Upstream (inputs): producers call eventBus.emitEvent(name, payload); the
 * service is constructed with a TelegramClient, a TelegramStore and config.
 * Downstream (outputs): Telegram sendMessage; every emitted notification is
 * also pushed to SENT (bounded) so tests can assert delivery without a network.
 */
import { EventEmitter } from 'events';

// System event names. Categories map 1:1 to per-chat settings.notifications keys.
export const EVENTS = {
  REGISTRATION: 'registration',
  PRACTICE: 'practice',
  ERROR: 'error',
  UPLOAD: 'upload',
};

// Persian, human-meaningful templates. `ctx` is interpolated at send time.
const TEMPLATES = {
  registration: (c) => `👤 <b>کاربر جدید</b>\n${c.name || 'یک کاربر'} به سیستم پیوست.`,
  practice: (c) => `🎓 <b>تمرین</b>\n${c.detail || 'رویداد تمرین با استاد هوش مصنوعی رخ داد.'}`,
  error: (c) => `❌ <b>خطای سیستمی</b>\n${c.detail || 'یک خطای غیرمنتظره رخ داد.'}`,
  upload: (c) => `📤 <b>آپلود محتوا</b>\n${c.detail || 'محتوای جدیدی آپلود شد.'}`,
};

export class EventBus extends EventEmitter {
  // Fire-and-forget: emitting never throws into the producer's call stack.
  emitEvent(name, payload = {}) {
    setImmediate(() => {
      try {
        this.emit(name, payload);
      } catch {
        /* listener errors must never reach the producer */
      }
    });
  }
}

export class NotificationService {
  constructor({ client = null, store = null, config = {}, bus = new EventBus(), logger = null } = {}) {
    this.client = client;
    this.store = store;
    this.config = config;
    this.bus = bus;
    this.logger = logger;
    this.rateLimitSeconds = config.rateLimitSeconds || 60;
    this._lastSent = new Map();
    this.SENT = [];
    this._maxSent = 200;
    this._wire();
  }

  _wire() {
    for (const event of Object.values(EVENTS)) {
      this.bus.on(event, (payload) => {
        // Listener runs async; swallow errors so alerting never crashes callers.
        Promise.resolve(this.handle(event, payload)).catch((err) => {
          this.logger?.recordError(`notify:${event}`, err);
        });
      });
    }
  }

  // Resolve which chats should receive an event: explicit payload.chatId, else
  // every linked chat that has the matching category enabled, else the
  // configured default chat (backward-compatible single-channel behaviour).
  _targets(category, payload) {
    if (payload.chatId) return [String(payload.chatId)];
    const targets = [];
    if (this.store) {
      for (const chatId of Object.keys(this.store.data.links)) {
        if (this.store.getSettings(chatId).notifications[category]) targets.push(chatId);
      }
    }
    if (targets.length === 0 && this.config.defaultChatId) {
      targets.push(String(this.config.defaultChatId));
    }
    return targets;
  }

  _rateLimited(category) {
    const now = Date.now();
    const last = this._lastSent.get(category);
    if (last != null && now - last < this.rateLimitSeconds * 1000) return true;
    this._lastSent.set(category, now);
    return false;
  }

  async handle(category, payload = {}) {
    if (this._rateLimited(category)) return { delivered: false, reason: 'rate_limited' };
    const template = TEMPLATES[category] || ((c) => `رویداد: ${category} — ${JSON.stringify(c)}`);
    const message = template(payload);
    const targets = this._targets(category, payload);
    const record = { category, message, targets: [...targets], at: Date.now(), delivered: false };

    if (this.client && targets.length > 0) {
      for (const chatId of targets) {
        try {
          await this.client.sendMessage(chatId, message);
          record.delivered = true;
        } catch (err) {
          this.logger?.recordError(`notify-send:${category}`, err);
        }
      }
    }
    this.SENT.push(record);
    if (this.SENT.length > this._maxSent) this.SENT.shift();
    return record;
  }

  // Convenience emitters used across the app.
  notifyRegistration(payload) { this.bus.emitEvent(EVENTS.REGISTRATION, payload); }
  notifyPractice(payload) { this.bus.emitEvent(EVENTS.PRACTICE, payload); }
  notifyError(payload) { this.bus.emitEvent(EVENTS.ERROR, payload); }
  notifyUpload(payload) { this.bus.emitEvent(EVENTS.UPLOAD, payload); }
}

export default NotificationService;
