/**
 * Unit tests for the Telegram service building blocks (step 23): the store,
 * client, logger, notification service and practice manager. Everything runs
 * in-memory with injected fakes — no network, no real bot token, no Gemini.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { TelegramStore, DEFAULT_SETTINGS } from '../services/telegram/store.js';
import { TelegramClient, TelegramApiError } from '../services/telegram/client.js';
import { TelegramLogger } from '../services/telegram/logger.js';
import { NotificationService, EventBus, EVENTS } from '../services/telegram/notifications.js';
import { PracticeManager, getTopic } from '../services/telegram/practice.js';
import { loadTelegramConfig, isAdmin, isAllowed } from '../services/telegram/config.js';
import { FakeClient, FakeAiProvider } from './telegram_test_helpers.js';

function newStore() {
  return new TelegramStore({ persist: false });
}

// --- config ----------------------------------------------------------------
test('config: disabled without a token, enabled with one', () => {
  assert.equal(loadTelegramConfig({}).enabled, false);
  const cfg = loadTelegramConfig({ TELEGRAM_BOT_TOKEN: '123:abc', TELEGRAM_ADMIN_IDS: '7,8' });
  assert.equal(cfg.enabled, true);
  assert.ok(isAdmin(cfg, '7'));
  assert.ok(!isAdmin(cfg, '9'));
});

test('config: NOTIFY_TELEGRAM_BOT_TOKEN is a fallback token', () => {
  const cfg = loadTelegramConfig({ NOTIFY_TELEGRAM_BOT_TOKEN: 'x:y' });
  assert.equal(cfg.enabled, true);
});

test('config: allow-list gates write access; open when empty', () => {
  const open = loadTelegramConfig({ TELEGRAM_BOT_TOKEN: 't' });
  assert.ok(isAllowed(open, 'anyone'));
  const gated = loadTelegramConfig({ TELEGRAM_BOT_TOKEN: 't', TELEGRAM_ALLOWED_USER_IDS: '500' });
  assert.ok(isAllowed(gated, '500'));
  assert.ok(!isAllowed(gated, '999'));
});

// --- store: account linking ------------------------------------------------
test('store: link code round-trip binds chat to user', () => {
  const store = newStore();
  const code = store.createLinkCode('100', '500');
  assert.match(code, /^[0-9A-F]{6}$/);
  assert.equal(store.getLink('100'), null);
  const link = store.confirmLinkCode(code, 'user-uid');
  assert.equal(link.chatId, '100');
  assert.equal(store.getLink('100').userId, 'user-uid');
});

test('store: a fresh link code invalidates the previous one', () => {
  const store = newStore();
  const first = store.createLinkCode('100', '500');
  const second = store.createLinkCode('100', '500');
  assert.notEqual(first, second);
  assert.equal(store.confirmLinkCode(first, 'u'), null);
  assert.ok(store.confirmLinkCode(second, 'u'));
});

test('store: unlink removes the binding', () => {
  const store = newStore();
  store.confirmLinkCode(store.createLinkCode('100', '500'), 'u');
  assert.ok(store.unlink('100'));
  assert.equal(store.getLink('100'), null);
  assert.ok(!store.unlink('100'));
});

// --- store: courses & content ---------------------------------------------
test('store: course CRUD with cascade delete of content', () => {
  const store = newStore();
  const c = store.addCourse({ title: 'درس ۱', description: 'd' });
  assert.equal(store.listCourses().length, 1);
  store.addContent({ courseId: c.id, type: 'document', fileName: 'a.pdf', fileId: 'f1' });
  store.addContent({ courseId: c.id, type: 'photo', fileName: 'b.jpg', fileId: 'f2' });
  assert.equal(store.listContent(c.id).length, 2);

  store.updateCourse(c.id, { title: 'درس جدید', active: false });
  assert.equal(store.getCourse(c.id).title, 'درس جدید');
  assert.equal(store.getCourse(c.id).active, false);

  assert.ok(store.deleteCourse(c.id));
  assert.equal(store.listCourses().length, 0);
  assert.equal(store.listContent(c.id).length, 0); // cascaded
});

test('store: findCourseByTitle is case/space-insensitive', () => {
  const store = newStore();
  store.addCourse({ title: 'Greetings' });
  assert.ok(store.findCourseByTitle('  greetings '));
  assert.equal(store.findCourseByTitle('nope'), null);
});

// --- store: settings -------------------------------------------------------
test('store: settings default on and toggle individual categories', () => {
  const store = newStore();
  const s = store.getSettings('100');
  assert.deepEqual(s.notifications, DEFAULT_SETTINGS.notifications);
  assert.equal(store.toggleNotification('100', 'error'), false);
  assert.equal(store.getSettings('100').notifications.error, false);
  assert.equal(store.toggleNotification('100', 'unknown'), null);
});

// --- client ----------------------------------------------------------------
test('client: requires a token', () => {
  assert.throws(() => new TelegramClient({ fetch: () => {} }), /requires a bot token/);
});

test('client: call() unwraps result and throws on ok:false', async () => {
  const fetchOk = async () => ({ json: async () => ({ ok: true, result: { id: 1 } }) });
  const okClient = new TelegramClient({ token: 't', fetch: fetchOk });
  assert.deepEqual(await okClient.call('getMe'), { id: 1 });

  const fetchErr = async () => ({ status: 400, json: async () => ({ ok: false, description: 'bad', error_code: 400 }) });
  const errClient = new TelegramClient({ token: 't', fetch: fetchErr });
  await assert.rejects(() => errClient.call('sendMessage'), TelegramApiError);
});

test('client: sendMessage posts HTML to the bot endpoint', async () => {
  const calls = [];
  const fetchImpl = async (url, opts) => {
    calls.push({ url, body: JSON.parse(opts.body) });
    return { json: async () => ({ ok: true, result: {} }) };
  };
  const client = new TelegramClient({ token: 'SECRET', fetch: fetchImpl });
  await client.sendMessage('100', 'hi');
  assert.match(calls[0].url, /\/botSECRET\/sendMessage$/);
  assert.equal(calls[0].body.parse_mode, 'HTML');
  assert.equal(calls[0].body.chat_id, '100');
});

// --- logger ----------------------------------------------------------------
test('logger: records, bounds, and redacts secrets', () => {
  const sink = { log() {}, error() {} };
  const logger = new TelegramLogger({ max: 3, sink });
  for (let i = 0; i < 5; i++) logger.record({ chatId: i, command: `/c${i}` });
  assert.equal(logger.recent(10).length, 3); // bounded ring buffer
  logger.recordError('ctx', new Error('token bot123456:ABCdef_secret leaked AIzaSyABCDEFGHITESTKEY'));
  const last = logger.recent(1)[0];
  assert.ok(!last.message.includes('ABCdef_secret'));
  assert.ok(last.message.includes('bot[REDACTED]'));
  assert.ok(!last.message.includes('AIzaSyABCDEFGHITESTKEY'));
});

// --- notifications ---------------------------------------------------------
test('notifications: delivers to linked chats honoring settings', async () => {
  const store = newStore();
  store.confirmLinkCode(store.createLinkCode('100', '500'), 'u');
  const client = new FakeClient();
  const svc = new NotificationService({ client, store, config: { rateLimitSeconds: 0 } });
  await svc.handle(EVENTS.REGISTRATION, { name: 'علی' });
  assert.equal(client.sent.length, 1);
  assert.match(client.sent[0].text, /کاربر جدید/);

  // Disable the 'error' category for this chat -> no delivery.
  store.toggleNotification('100', 'error');
  const rec = await svc.handle(EVENTS.ERROR, {});
  assert.equal(rec.targets.length, 0);
});

test('notifications: explicit chatId target bypasses link lookup', async () => {
  const client = new FakeClient();
  const svc = new NotificationService({ client, store: newStore(), config: { rateLimitSeconds: 0 } });
  await svc.handle(EVENTS.PRACTICE, { chatId: '777', detail: 'x' });
  assert.equal(client.sent[0].chatId, '777');
});

test('notifications: rate limit suppresses rapid duplicates', async () => {
  const client = new FakeClient();
  const svc = new NotificationService({ client, store: newStore(), config: { rateLimitSeconds: 60, defaultChatId: '1' } });
  const first = await svc.handle(EVENTS.ERROR, {});
  const second = await svc.handle(EVENTS.ERROR, {});
  assert.equal(first.delivered, true);
  assert.equal(second.delivered, false);
  assert.equal(second.reason, 'rate_limited');
});

test('notifications: EventBus emit reaches the service asynchronously', async () => {
  const client = new FakeClient();
  const bus = new EventBus();
  const svc = new NotificationService({ client, store: newStore(), config: { rateLimitSeconds: 0, defaultChatId: '1' }, bus });
  svc.notifyUpload({ detail: 'file' });
  await new Promise((r) => setImmediate(r));
  await new Promise((r) => setImmediate(r));
  assert.ok(svc.SENT.some((n) => n.category === 'upload'));
});

// --- practice --------------------------------------------------------------
test('practice: start, text turn, summary and history', async () => {
  const store = newStore();
  const ai = new FakeAiProvider({ reply: 'أهلا' });
  const pm = new PracticeManager({ store, aiProvider: ai });

  const session = pm.startSession('100', 'greetings');
  assert.equal(session.topic, getTopic('greetings').title);

  const reply = await pm.sendText(session.id, 'مرحبا');
  assert.equal(reply, 'أهلا');
  const stored = store.getSession(session.id);
  assert.equal(stored.messages.length, 2);

  const summary = pm.summarize(session.id);
  assert.equal(summary.userTurns, 1);
  assert.equal(summary.aiTurns, 1);

  pm.endSession(session.id);
  assert.equal(store.getSession(session.id).status, 'ended');
  assert.equal(pm.history('100').length, 1);
});

test('practice: starting a new session ends the previous active one', () => {
  const store = newStore();
  const pm = new PracticeManager({ store, aiProvider: new FakeAiProvider() });
  const a = pm.startSession('100');
  const b = pm.startSession('100');
  assert.equal(store.getSession(a.id).status, 'ended');
  assert.equal(store.getActiveSession('100').id, b.id);
});

test('practice: voice turn transcribes then replies', async () => {
  const store = newStore();
  const ai = new FakeAiProvider({ reply: 'تمام', transcript: 'كيفك' });
  const pm = new PracticeManager({ store, aiProvider: ai });
  const session = pm.startSession('100');
  const { transcript, reply } = await pm.sendVoice(session.id, Buffer.from('audio'), 'audio/ogg');
  assert.equal(transcript, 'كيفك');
  assert.equal(reply, 'تمام');
  assert.equal(ai.transcribeCalls.length, 1);
});

test('practice: sendText on an ended session throws no_active_session', async () => {
  const store = newStore();
  const pm = new PracticeManager({ store, aiProvider: new FakeAiProvider() });
  const session = pm.startSession('100');
  pm.endSession(session.id);
  await assert.rejects(() => pm.sendText(session.id, 'hi'), /no_active_session/);
});
