/**
 * Integration tests for the Telegram command surface (step 24): drive the real
 * TelegramBot + Commands + PracticeManager + store through simulated Telegram
 * updates and assert on what the (fake) client sent back. No network/bot token.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { TelegramStore } from '../services/telegram/store.js';
import { TelegramLogger } from '../services/telegram/logger.js';
import { NotificationService, EventBus } from '../services/telegram/notifications.js';
import { PracticeManager } from '../services/telegram/practice.js';
import { Commands } from '../services/telegram/commands.js';
import { TelegramBot } from '../services/telegram/bot.js';
import { loadTelegramConfig } from '../services/telegram/config.js';
import { FakeClient, FakeAiProvider, messageUpdate, callbackUpdate } from './telegram_test_helpers.js';

// Assemble a full bot wired to fakes. `env` customises config (admins, allow-list).
function makeBot(env = {}) {
  const config = loadTelegramConfig({ TELEGRAM_BOT_TOKEN: 't', ...env });
  const store = new TelegramStore({ persist: false });
  const client = new FakeClient();
  const logger = new TelegramLogger({ sink: { log() {}, error() {} } });
  const ai = new FakeAiProvider({ reply: 'أهلا فيك', transcript: 'مرحبا' });
  const practice = new PracticeManager({ store, aiProvider: ai });
  const notifications = new NotificationService({ client, store, config, bus: new EventBus() });
  const commands = new Commands({
    client,
    store,
    config,
    practice,
    notifications,
    logger,
    getStatus: () => ({ ok: true, geminiConfigured: true, uptimeSec: 5 }),
  });
  const bot = new TelegramBot({ client, commands, store, config, logger });
  return { bot, client, store, config, ai, practice };
}

// --- basics ----------------------------------------------------------------
test('/start and /help respond', async () => {
  const { bot, client } = makeBot();
  await bot.processUpdate(messageUpdate({ text: '/start' }));
  assert.match(client.lastText(), /خوش آمدید/);
  await bot.processUpdate(messageUpdate({ text: '/help' }));
  assert.match(client.lastText(), /راهنمای دستورات/);
});

test('/help hides admin commands from non-admins, shows them to admins', async () => {
  const open = makeBot();
  await open.bot.processUpdate(messageUpdate({ text: '/help', userId: 1 }));
  assert.ok(!open.client.lastText().includes('admin_logs'));

  const admin = makeBot({ TELEGRAM_ADMIN_IDS: '1' });
  await admin.bot.processUpdate(messageUpdate({ text: '/help', userId: 1 }));
  assert.ok(admin.client.lastText().includes('admin_logs'));
});

test('/status reports system + link + session state', async () => {
  const { bot, client } = makeBot();
  await bot.processUpdate(messageUpdate({ text: '/status' }));
  assert.match(client.lastText(), /وضعیت سیستم/);
  assert.match(client.lastText(), /Gemini/);
});

test('unknown text nudges toward /help', async () => {
  const { bot, client } = makeBot();
  await bot.processUpdate(messageUpdate({ text: 'سلام' }));
  assert.match(client.lastText(), /help/);
});

// --- account linking -------------------------------------------------------
test('/login issues a code; /logout when not linked', async () => {
  const { bot, client, store } = makeBot();
  await bot.processUpdate(messageUpdate({ text: '/login', chatId: 100, userId: 500 }));
  assert.match(client.lastText(), /کد یک‌بارمصرف|اتصال حساب|<code>/);
  // The code was persisted as pending.
  assert.equal(Object.keys(store.data.pending).length, 1);

  await bot.processUpdate(messageUpdate({ text: '/logout', chatId: 100 }));
  assert.match(client.lastText(), /متصل نیست/);
});

// --- courses ---------------------------------------------------------------
test('add_course conversational flow creates a course', async () => {
  const { bot, client, store } = makeBot();
  await bot.processUpdate(messageUpdate({ text: '/add_course' }));
  assert.match(client.lastText(), /نام درس/);
  await bot.processUpdate(messageUpdate({ text: 'مکالمه روزمره' }));
  assert.match(client.lastText(), /توضیح/);
  await bot.processUpdate(messageUpdate({ text: 'تمرین روزانه' }));
  assert.match(client.lastText(), /درس ساخته شد/);
  assert.equal(store.listCourses().length, 1);
  assert.equal(store.listCourses()[0].title, 'مکالمه روزمره');
});

test('add_course rejects duplicate titles', async () => {
  const { bot, client, store } = makeBot();
  store.addCourse({ title: 'تکراری' });
  await bot.processUpdate(messageUpdate({ text: '/add_course' }));
  await bot.processUpdate(messageUpdate({ text: 'تکراری' }));
  assert.match(client.lastText(), /از قبل وجود دارد/);
});

test('/courses lists courses; /course_content shows content', async () => {
  const { bot, client, store } = makeBot();
  const c = store.addCourse({ title: 'درس آزمایشی', description: 'توضیح' });
  store.addContent({ courseId: c.id, type: 'document', fileName: 'lesson.pdf', fileId: 'f1' });

  await bot.processUpdate(messageUpdate({ text: '/courses' }));
  assert.match(client.lastText(), /درس آزمایشی/);

  await bot.processUpdate(messageUpdate({ text: `/course_content ${c.id}` }));
  assert.match(client.lastText(), /lesson\.pdf/);
});

test('edit_course updates a field step-by-step', async () => {
  const { bot, client, store } = makeBot();
  const c = store.addCourse({ title: 'قدیمی' });
  await bot.processUpdate(messageUpdate({ text: `/edit_course ${c.id}` }));
  await bot.processUpdate(messageUpdate({ text: 'name' }));
  await bot.processUpdate(messageUpdate({ text: 'جدید' }));
  assert.match(client.lastText(), /به‌روزرسانی شد/);
  assert.equal(store.getCourse(c.id).title, 'جدید');
});

test('delete_course requires confirmation then cascades', async () => {
  const { bot, client, store } = makeBot();
  const c = store.addCourse({ title: 'حذفی' });
  store.addContent({ courseId: c.id, type: 'photo', fileName: 'p.jpg', fileId: 'f' });
  await bot.processUpdate(messageUpdate({ text: `/delete_course ${c.id}` }));
  assert.match(client.lastText(), /غیرقابل بازگشت/);
  // Confirm via the inline button callback.
  await bot.processUpdate(callbackUpdate({ data: `confirm:delcourse:${c.id}` }));
  assert.equal(store.getCourse(c.id), null);
  assert.equal(store.listContent(c.id).length, 0);
});

// --- upload (file flow) ----------------------------------------------------
test('/upload accepts a document and stores content metadata', async () => {
  const { bot, client, store } = makeBot();
  const c = store.addCourse({ title: 'برای آپلود' });
  await bot.processUpdate(messageUpdate({ text: `/upload ${c.id}` }));
  assert.match(client.lastText(), /یک فایل/);
  await bot.processUpdate(
    messageUpdate({ document: { file_id: 'doc1', file_name: 'note.pdf', file_size: 1234 } })
  );
  assert.match(client.lastText(), /محتوا ذخیره شد/);
  const content = store.listContent(c.id);
  assert.equal(content.length, 1);
  assert.equal(content[0].fileName, 'note.pdf');
});

test('delete_content confirmation removes a single item', async () => {
  const { bot, client, store } = makeBot();
  const c = store.addCourse({ title: 'x' });
  const m = store.addContent({ courseId: c.id, type: 'document', fileName: 'a.pdf', fileId: 'f' });
  await bot.processUpdate(messageUpdate({ text: `/delete_content ${c.id} ${m.id}` }));
  await bot.processUpdate(callbackUpdate({ data: `confirm:delcontent:${m.id}` }));
  assert.equal(store.getContent(m.id), null);
});

// --- authorization ---------------------------------------------------------
test('write commands are blocked for non-allow-listed users', async () => {
  const { bot, client } = makeBot({ TELEGRAM_ALLOWED_USER_IDS: '999' });
  await bot.processUpdate(messageUpdate({ text: '/add_course', userId: 500 }));
  assert.match(client.lastText(), /اجازه/);
});

test('admin_logs is admin-only', async () => {
  const denied = makeBot();
  await denied.bot.processUpdate(messageUpdate({ text: '/admin_logs', userId: 5 }));
  assert.match(denied.client.lastText(), /اجازه/);

  const allowed = makeBot({ TELEGRAM_ADMIN_IDS: '5' });
  await allowed.bot.processUpdate(messageUpdate({ text: '/status', userId: 5 })); // produce a log line
  await allowed.bot.processUpdate(messageUpdate({ text: '/admin_logs', userId: 5 }));
  assert.match(allowed.client.lastText(), /لاگ/);
});

// --- practice flow (steps 12-19) -------------------------------------------
test('/practice creates a session and offers topic buttons', async () => {
  const { bot, client, store } = makeBot();
  await bot.processUpdate(messageUpdate({ text: '/practice', chatId: 100 }));
  assert.match(client.lastText(), /تمرین با استاد/);
  const last = client.sent[client.sent.length - 1];
  assert.ok(last.extra.reply_markup.inline_keyboard.length > 0);
  assert.ok(store.getActiveSession('100'));
});

test('topic selection + chat callback + text turn talks to the AI', async () => {
  const { bot, client, store, ai } = makeBot();
  await bot.processUpdate(messageUpdate({ text: '/practice', chatId: 100 }));
  const session = store.getActiveSession('100');

  await bot.processUpdate(callbackUpdate({ data: `topic:${session.id}:food`, chatId: 100 }));
  assert.equal(store.getSession(session.id).topic, 'غذا و رستوران');

  await bot.processUpdate(callbackUpdate({ data: `chat:${session.id}`, chatId: 100 }));
  assert.equal(bot.getState(100).mode, 'practice_chat');

  await bot.processUpdate(messageUpdate({ text: 'كيف الحال؟', chatId: 100 }));
  assert.equal(ai.chatCalls.length, 1);
  assert.match(client.lastText(), /أهلا فيك/);
});

test('voice message in chat mode is transcribed and answered', async () => {
  const { bot, client, store, ai } = makeBot();
  await bot.processUpdate(messageUpdate({ text: '/practice', chatId: 100 }));
  const session = store.getActiveSession('100');
  await bot.processUpdate(callbackUpdate({ data: `chat:${session.id}`, chatId: 100 }));

  await bot.processUpdate(
    messageUpdate({ chatId: 100, voice: { file_id: 'v1', mime_type: 'audio/ogg', duration: 2 } })
  );
  assert.equal(ai.transcribeCalls.length, 1);
  assert.match(client.lastText(), /أهلا فيك/);
  // Transcript is echoed back to the user.
  assert.ok(client.allText().includes('مرحبا'));
});

test('voice reply is sent when TTS is available and enabled', async () => {
  const { bot, store } = makeBot();
  // Swap in an AI provider that returns synthesized audio.
  const audio = { audio: Buffer.from('ogg-bytes'), mimeType: 'audio/ogg' };
  store.addCourse({ title: 'noop' });
  const fresh = makeBot();
  fresh.ai.audio = audio;
  await fresh.bot.processUpdate(messageUpdate({ text: '/practice', chatId: 100 }));
  const session = fresh.store.getActiveSession('100');
  await fresh.bot.processUpdate(callbackUpdate({ data: `chat:${session.id}`, chatId: 100 }));
  await fresh.bot.processUpdate(messageUpdate({ text: 'hi', chatId: 100 }));
  assert.equal(fresh.client.voices.length, 1);
});

test('practice_end ends the session and prints a summary', async () => {
  const { bot, client, store } = makeBot();
  await bot.processUpdate(messageUpdate({ text: '/practice', chatId: 100 }));
  const session = store.getActiveSession('100');
  await bot.processUpdate(messageUpdate({ text: `/practice_end ${session.id}`, chatId: 100 }));
  assert.match(client.lastText(), /پایان یافت/);
  assert.equal(store.getSession(session.id).status, 'ended');
});

test('practice_history and practice_details list sessions', async () => {
  const { bot, client, store } = makeBot();
  await bot.processUpdate(messageUpdate({ text: '/practice', chatId: 100 }));
  const session = store.getActiveSession('100');
  await bot.processUpdate(messageUpdate({ text: '/practice_history', chatId: 100 }));
  assert.match(client.lastText(), /تاریخچهٔ جلسات/);
  await bot.processUpdate(messageUpdate({ text: `/practice_details ${session.id}`, chatId: 100 }));
  assert.match(client.lastText(), /جزئیات جلسه/);
});

// --- settings --------------------------------------------------------------
test('/settings toggles a notification category via callback', async () => {
  const { bot, client, store } = makeBot();
  await bot.processUpdate(messageUpdate({ text: '/settings', chatId: 100 }));
  assert.match(client.lastText(), /تنظیمات/);
  assert.equal(store.getSettings('100').notifications.error, true);
  await bot.processUpdate(callbackUpdate({ data: 'set:error', chatId: 100 }));
  assert.equal(store.getSettings('100').notifications.error, false);
});

// --- cancel ----------------------------------------------------------------
test('/cancel exits an in-progress flow', async () => {
  const { bot, client } = makeBot();
  await bot.processUpdate(messageUpdate({ text: '/add_course', chatId: 100 }));
  assert.ok(bot.getState(100));
  await bot.processUpdate(messageUpdate({ text: '/cancel', chatId: 100 }));
  assert.equal(bot.getState(100), null);
  assert.match(client.lastText(), /لغو شد/);
});

// --- webhook ---------------------------------------------------------------
test('webhook rejects a bad secret and processes a good one', async () => {
  const { bot, client } = makeBot({ TELEGRAM_WEBHOOK_SECRET: 's3cr3t' });
  const bad = await bot.handleWebhook(messageUpdate({ text: '/start' }), 'wrong');
  assert.equal(bad.ok, false);
  assert.equal(client.sent.length, 0);
  const good = await bot.handleWebhook(messageUpdate({ text: '/start' }), 's3cr3t');
  assert.equal(good.ok, true);
  assert.equal(client.sent.length, 1);
});

// --- resilience ------------------------------------------------------------
test('processUpdate never throws on a malformed update', async () => {
  const { bot } = makeBot();
  await bot.processUpdate({ update_id: 1 }); // no message/callback
  await bot.processUpdate({ update_id: 2, message: {} }); // no chat
  assert.ok(true);
});
