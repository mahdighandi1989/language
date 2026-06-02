/**
 * Purpose: Every Telegram command + conversational flow for two-way control of
 * the system (steps 3–22 of the feature): system control (/status, /help),
 * account linking (/login, /verify, /logout), course management (/courses,
 * /course_content, /upload, /add_course, /edit_course, /delete_content,
 * /delete_course), AI practice (/practice, /practice_topic, /practice_chat,
 * voice in chat, /practice_end, /practice_history, /practice_details),
 * preferences (/settings) and operations (/admin_logs).
 *
 * Upstream (inputs): a deps bag — { client, store, config, practice,
 * notifications, logger, getStatus } — injected by services/telegram/bot.js.
 * Each handler receives a per-update `ctx` (chatId, userId, args, text,
 * message/callback, conversation-state helpers, reply helpers).
 * Downstream (outputs): Telegram messages/keyboards via the client; reads/writes
 * the TelegramStore; drives PracticeManager. No business logic lives in bot.js —
 * it only routes updates here.
 */
import { isAdmin, isAllowed } from './config.js';
import { PRACTICE_TOPICS } from './practice.js';

const PAGE_SIZE = 5;

// Escape user/content text for Telegram's HTML parse mode.
export function esc(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Build an inline-keyboard pagination row plus the page slice for a list.
function paginate(items, page, prefix) {
  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const current = Math.min(Math.max(0, page), pages - 1);
  const slice = items.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);
  const row = [];
  if (current > 0) row.push({ text: '« قبلی', callback_data: `pg:${prefix}:${current - 1}` });
  if (current < pages - 1) row.push({ text: 'بعدی »', callback_data: `pg:${prefix}:${current + 1}` });
  const keyboard = row.length ? { inline_keyboard: [row] } : undefined;
  return { slice, current, pages, keyboard };
}

// Command metadata. `category` drives the grouped /help output; `access` gates
// who may run it: 'public' (any linked/allowed chat), 'write' (allow-list/admin),
// 'admin' (admins only).
export const COMMAND_META = [
  { name: 'start', category: 'عمومی', access: 'public', desc: 'شروع و معرفی ربات' },
  { name: 'help', category: 'عمومی', access: 'public', desc: 'نمایش راهنمای دستورات' },
  { name: 'status', category: 'عمومی', access: 'public', desc: 'وضعیت سیستم' },
  { name: 'login', category: 'حساب کاربری', access: 'public', desc: 'دریافت کد اتصال حساب' },
  { name: 'verify', category: 'حساب کاربری', access: 'public', desc: 'هم‌معنی /login' },
  { name: 'logout', category: 'حساب کاربری', access: 'public', desc: 'قطع اتصال حساب' },
  { name: 'courses', category: 'دروس', access: 'public', desc: 'لیست دروس' },
  { name: 'course_content', category: 'دروس', access: 'public', desc: 'محتوای یک درس: /course_content <id>' },
  { name: 'add_course', category: 'دروس', access: 'write', desc: 'افزودن درس جدید' },
  { name: 'edit_course', category: 'دروس', access: 'write', desc: 'ویرایش درس: /edit_course <id>' },
  { name: 'delete_course', category: 'دروس', access: 'write', desc: 'حذف درس: /delete_course <id>' },
  { name: 'upload', category: 'دروس', access: 'write', desc: 'آپلود محتوا: /upload <course_id>' },
  { name: 'delete_content', category: 'دروس', access: 'write', desc: 'حذف محتوا: /delete_content <course_id> <content_id>' },
  { name: 'practice', category: 'تمرین با استاد', access: 'public', desc: 'اتصال به تمرین با استاد هوش مصنوعی' },
  { name: 'practice_topic', category: 'تمرین با استاد', access: 'public', desc: 'انتخاب موضوع: /practice_topic <session_id>' },
  { name: 'practice_chat', category: 'تمرین با استاد', access: 'public', desc: 'شروع گفتگو: /practice_chat <session_id>' },
  { name: 'practice_end', category: 'تمرین با استاد', access: 'public', desc: 'پایان جلسه: /practice_end <session_id>' },
  { name: 'practice_history', category: 'تمرین با استاد', access: 'public', desc: 'تاریخچهٔ جلسات' },
  { name: 'practice_details', category: 'تمرین با استاد', access: 'public', desc: 'جزئیات جلسه: /practice_details <session_id>' },
  { name: 'settings', category: 'تنظیمات', access: 'public', desc: 'تنظیمات نوتیفیکیشن و ربات' },
  { name: 'cancel', category: 'تنظیمات', access: 'public', desc: 'لغو عملیات جاری' },
  { name: 'admin_logs', category: 'مدیریت', access: 'admin', desc: 'آخرین لاگ‌های ربات (فقط ادمین)' },
];

export class Commands {
  constructor(deps) {
    this.client = deps.client;
    this.store = deps.store;
    this.config = deps.config;
    this.practice = deps.practice;
    this.notifications = deps.notifications;
    this.logger = deps.logger;
    this.getStatus = deps.getStatus || (() => ({ ok: true }));

    // name -> method. Aliases (verify->login) share an implementation.
    this.handlers = {
      start: this.cmdStart,
      help: this.cmdHelp,
      status: this.cmdStatus,
      login: this.cmdLogin,
      verify: this.cmdLogin,
      logout: this.cmdLogout,
      courses: this.cmdCourses,
      course_content: this.cmdCourseContent,
      add_course: this.cmdAddCourse,
      edit_course: this.cmdEditCourse,
      delete_course: this.cmdDeleteCourse,
      upload: this.cmdUpload,
      delete_content: this.cmdDeleteContent,
      practice: this.cmdPractice,
      practice_topic: this.cmdPracticeTopic,
      practice_chat: this.cmdPracticeChat,
      practice_end: this.cmdPracticeEnd,
      practice_history: this.cmdPracticeHistory,
      practice_details: this.cmdPracticeDetails,
      settings: this.cmdSettings,
      cancel: this.cmdCancel,
      admin_logs: this.cmdAdminLogs,
    };
  }

  meta(name) {
    return COMMAND_META.find((m) => m.name === name) || null;
  }

  // Access gate shared by command dispatch.
  _authorize(ctx, access) {
    if (access === 'admin') return isAdmin(this.config, ctx.userId);
    if (access === 'write') return isAllowed(this.config, ctx.userId);
    return true; // public
  }

  // --- dispatch entry points ------------------------------------------
  async handleCommand(name, ctx) {
    const handler = this.handlers[name];
    if (!handler) {
      await ctx.reply('دستور ناشناخته است. /help را ببینید.');
      return;
    }
    const meta = this.meta(name);
    if (meta && !this._authorize(ctx, meta.access)) {
      await ctx.reply('⛔ شما اجازهٔ اجرای این دستور را ندارید.');
      return;
    }
    await handler.call(this, ctx);
  }

  // Free-form text: either feeds an active conversation flow or the practice chat.
  async handleText(ctx) {
    const state = ctx.state;
    if (state?.mode === 'add_course') return this._addCourseStep(ctx);
    if (state?.mode === 'edit_course') return this._editCourseStep(ctx);
    if (state?.mode === 'practice_chat') return this._practiceTurn(ctx, ctx.text);
    if (state?.mode === 'upload') {
      return ctx.reply('در حال انتظار برای یک فایل هستم. لطفاً یک فایل بفرستید یا /cancel بزنید.');
    }
    await ctx.reply('متوجه نشدم. برای دیدن دستورات /help را بزنید.');
  }

  // Voice note: only meaningful inside an active practice chat (steps 15/16).
  async handleVoice(ctx) {
    if (ctx.state?.mode !== 'practice_chat') {
      return ctx.reply('برای گفتگوی صوتی ابتدا با /practice یک جلسه را شروع کنید.');
    }
    return this._practiceVoiceTurn(ctx);
  }

  // File/document/photo: only meaningful during an /upload flow (step 7).
  async handleFile(ctx) {
    if (ctx.state?.mode !== 'upload') {
      return ctx.reply('برای آپلود محتوا از دستور /upload <course_id> استفاده کنید.');
    }
    return this._uploadReceive(ctx);
  }

  // --- general ---------------------------------------------------------
  async cmdStart(ctx) {
    await ctx.reply(
      '👋 <b>به ربات کنترل اپلیکیشن لهجهٔ لبنانی خوش آمدید.</b>\n\n' +
        'از این‌جا می‌توانید نوتیفیکیشن دریافت کنید، دروس را مدیریت کنید و با ' +
        '«استاد هوش مصنوعی» تمرین کنید (حتی با پیام صوتی).\n\n' +
        'برای دیدن همهٔ دستورات /help را بزنید.\n' +
        'برای اتصال حساب کاربری‌تان /login را بزنید.'
    );
  }

  async cmdHelp(ctx) {
    const admin = isAdmin(this.config, ctx.userId);
    const write = isAllowed(this.config, ctx.userId);
    const visible = COMMAND_META.filter((m) => {
      if (m.access === 'admin') return admin;
      if (m.access === 'write') return write;
      return true;
    });
    const byCat = new Map();
    for (const m of visible) {
      if (!byCat.has(m.category)) byCat.set(m.category, []);
      byCat.get(m.category).push(m);
    }
    let out = '📖 <b>راهنمای دستورات</b>\n';
    for (const [cat, items] of byCat) {
      out += `\n<b>${esc(cat)}</b>\n`;
      for (const m of items) out += `/${m.name} — ${esc(m.desc)}\n`;
    }
    await ctx.reply(out.trim());
  }

  async cmdStatus(ctx) {
    const s = this.getStatus();
    const link = this.store.getLink(ctx.chatId);
    const active = this.store.getActiveSession(ctx.chatId);
    const lines = [
      '🩺 <b>وضعیت سیستم</b>',
      `سرویس: ${s.ok ? '✅ سالم' : '⚠️ مشکل'}`,
      `Gemini: ${s.geminiConfigured ? 'پیکربندی‌شده' : 'پیکربندی‌نشده'}`,
      `تعداد دروس: ${this.store.listCourses().length}`,
      `حساب متصل: ${link ? `بله (#${esc(link.userId)})` : 'خیر'}`,
      `جلسهٔ تمرین فعال: ${active ? `بله (${esc(active.id)})` : 'خیر'}`,
    ];
    if (s.uptimeSec != null) lines.push(`آپ‌تایم: ${Math.round(s.uptimeSec)} ثانیه`);
    await ctx.reply(lines.join('\n'));
  }

  // --- account linking (step 4) ---------------------------------------
  async cmdLogin(ctx) {
    const existing = this.store.getLink(ctx.chatId);
    if (existing) {
      await ctx.reply(`✅ این چت از قبل به حساب #${esc(existing.userId)} متصل است. برای قطع، /logout را بزنید.`);
      return;
    }
    const code = this.store.createLinkCode(ctx.chatId, ctx.userId);
    await ctx.reply(
      '🔐 <b>اتصال حساب کاربری</b>\n\n' +
        'این کد یک‌بارمصرف را در وب‌سایت، بخش «اتصال تلگرام» وارد کنید:\n\n' +
        `<code>${esc(code)}</code>\n\n` +
        'پس از تأیید در وب‌سایت، حساب شما به این چت متصل می‌شود.'
    );
  }

  async cmdLogout(ctx) {
    const removed = this.store.unlink(ctx.chatId);
    await ctx.reply(removed ? '🔓 اتصال حساب قطع شد.' : 'این چت به حسابی متصل نیست.');
  }

  // --- courses (steps 5, 6) -------------------------------------------
  async cmdCourses(ctx) {
    const courses = this.store.listCourses();
    if (courses.length === 0) {
      await ctx.reply('هنوز درسی ثبت نشده است. با /add_course یک درس بسازید.');
      return;
    }
    const { slice, keyboard, current, pages } = paginate(courses, 0, 'courses');
    await ctx.reply(this._renderCourses(slice, current, pages), keyboard ? { reply_markup: keyboard } : {});
  }

  _renderCourses(slice, current, pages) {
    let out = `📚 <b>دروس</b> (صفحهٔ ${current + 1}/${pages})\n\n`;
    for (const c of slice) {
      const count = this.store.listContent(c.id).length;
      out += `${c.active ? '🟢' : '⚪️'} <b>${esc(c.title)}</b> — <code>${esc(c.id)}</code>\n`;
      out += `   ${count} محتوا · آخرین به‌روزرسانی: ${new Date(c.updatedAt).toLocaleDateString('fa-IR')}\n`;
    }
    out += '\nبرای دیدن محتوای یک درس: /course_content &lt;id&gt;';
    return out;
  }

  async cmdCourseContent(ctx) {
    const courseId = ctx.args[0];
    if (!courseId) {
      await ctx.reply('استفاده: /course_content &lt;course_id&gt;');
      return;
    }
    const course = this.store.getCourse(courseId);
    if (!course) {
      await ctx.reply('درسی با این شناسه پیدا نشد.');
      return;
    }
    const content = this.store.listContent(courseId);
    const { slice, keyboard, current, pages } = paginate(content, 0, `content:${courseId}`);
    await ctx.reply(this._renderContent(course, slice, current, pages), keyboard ? { reply_markup: keyboard } : {});
  }

  _renderContent(course, slice, current, pages) {
    let out = `📂 <b>${esc(course.title)}</b>\n${esc(course.description || 'بدون توضیح')}\n\n`;
    if (slice.length === 0) {
      out += 'هنوز محتوایی برای این درس آپلود نشده است.\n';
    } else {
      out += `محتوا (صفحهٔ ${current + 1}/${pages}):\n`;
      for (const m of slice) {
        out += `• [${esc(m.type)}] ${esc(m.fileName)} — <code>${esc(m.id)}</code>\n`;
      }
    }
    out += `\nآپلود محتوای جدید: /upload ${esc(course.id)}`;
    return out;
  }

  // --- add course (step 10) -------------------------------------------
  async cmdAddCourse(ctx) {
    ctx.setState({ mode: 'add_course', step: 'title', data: {} });
    await ctx.reply('➕ <b>درس جدید</b>\n\nنام درس را بفرستید (یا /cancel برای لغو):');
  }

  async _addCourseStep(ctx) {
    const state = ctx.state;
    const value = (ctx.text || '').trim();
    if (state.step === 'title') {
      if (!value) return ctx.reply('نام درس نمی‌تواند خالی باشد. دوباره بفرستید:');
      if (this.store.findCourseByTitle(value)) {
        return ctx.reply('درسی با این نام از قبل وجود دارد. نام دیگری بفرستید:');
      }
      state.data.title = value;
      state.step = 'description';
      ctx.setState(state);
      return ctx.reply('توضیح کوتاهی برای درس بفرستید (یا «-» برای خالی):');
    }
    if (state.step === 'description') {
      state.data.description = value === '-' ? '' : value;
      const course = this.store.addCourse(state.data);
      ctx.clearState();
      return ctx.reply(`✅ درس ساخته شد: <b>${esc(course.title)}</b> (<code>${esc(course.id)}</code>)`);
    }
  }

  // --- edit course (step 9) -------------------------------------------
  async cmdEditCourse(ctx) {
    const course = this.store.getCourse(ctx.args[0]);
    if (!course) {
      await ctx.reply('استفاده: /edit_course &lt;course_id&gt; — درس پیدا نشد.');
      return;
    }
    ctx.setState({ mode: 'edit_course', step: 'field', data: { courseId: course.id } });
    await ctx.reply(
      `✏️ ویرایش <b>${esc(course.title)}</b>\nکدام فیلد؟ یکی را بفرستید: <code>name</code> / <code>description</code> / <code>status</code> (یا /cancel)`
    );
  }

  async _editCourseStep(ctx) {
    const state = ctx.state;
    const value = (ctx.text || '').trim();
    if (state.step === 'field') {
      const field = value.toLowerCase();
      if (!['name', 'description', 'status'].includes(field)) {
        return ctx.reply('فیلد نامعتبر. یکی از name/description/status را بفرستید:');
      }
      state.data.field = field;
      state.step = 'value';
      ctx.setState(state);
      if (field === 'status') return ctx.reply('وضعیت جدید را بفرستید: <code>active</code> یا <code>inactive</code>');
      return ctx.reply('مقدار جدید را بفرستید:');
    }
    if (state.step === 'value') {
      const { courseId, field } = state.data;
      let patch;
      if (field === 'name') {
        if (!value) return ctx.reply('نام نمی‌تواند خالی باشد:');
        patch = { title: value };
      } else if (field === 'description') {
        patch = { description: value === '-' ? '' : value };
      } else {
        const v = value.toLowerCase();
        if (!['active', 'inactive'].includes(v)) return ctx.reply('فقط active یا inactive مجاز است:');
        patch = { active: v === 'active' };
      }
      const updated = this.store.updateCourse(courseId, patch);
      ctx.clearState();
      return ctx.reply(updated ? '✅ درس به‌روزرسانی شد.' : 'درس پیدا نشد.');
    }
  }

  // --- delete course (step 11) ----------------------------------------
  async cmdDeleteCourse(ctx) {
    const course = this.store.getCourse(ctx.args[0]);
    if (!course) {
      await ctx.reply('استفاده: /delete_course &lt;course_id&gt; — درس پیدا نشد.');
      return;
    }
    const keyboard = {
      inline_keyboard: [[
        { text: '🗑 بله، حذف کن', callback_data: `confirm:delcourse:${course.id}` },
        { text: 'انصراف', callback_data: 'cancel:' },
      ]],
    };
    await ctx.reply(
      `⚠️ <b>حذف درس</b>\nدرس «${esc(course.title)}» و <b>تمام محتوای آن</b> برای همیشه حذف می‌شود. این عمل غیرقابل بازگشت است.`,
      { reply_markup: keyboard }
    );
  }

  // --- upload (step 7) ------------------------------------------------
  async cmdUpload(ctx) {
    const course = this.store.getCourse(ctx.args[0]);
    if (!course) {
      await ctx.reply('استفاده: /upload &lt;course_id&gt; — درس پیدا نشد.');
      return;
    }
    ctx.setState({ mode: 'upload', data: { courseId: course.id } });
    await ctx.reply(
      `📤 برای درس «${esc(course.title)}» یک فایل (PDF، تصویر یا ویدئو) بفرستید.\n` +
        `حداکثر حجم قابل دریافت: ${Math.round(this.config.maxFileBytes / 1024 / 1024)}MB. برای لغو /cancel.`
    );
  }

  // Called from bot.js when a document/photo/video arrives during upload mode.
  async _uploadReceive(ctx) {
    const file = ctx.file; // { type, fileId, fileName, size }
    const { courseId } = ctx.state.data;
    if (!file) return ctx.reply('فایلی دریافت نشد. دوباره تلاش کنید یا /cancel.');
    if (file.size && file.size > this.config.maxFileBytes) {
      return ctx.reply('حجم فایل بیشتر از حد مجاز تلگرام برای ربات‌هاست (۲۰MB).');
    }
    const row = this.store.addContent({
      courseId,
      type: file.type,
      fileName: file.fileName || `${file.type}-${Date.now()}`,
      fileId: file.fileId,
      size: file.size || 0,
    });
    ctx.clearState();
    this.notifications?.notifyUpload({ detail: `محتوای «${row.fileName}» به درس ${courseId} اضافه شد.` });
    return ctx.reply(`✅ محتوا ذخیره شد: <code>${esc(row.id)}</code> (${esc(row.type)})`);
  }

  // --- delete content (step 8) ----------------------------------------
  async cmdDeleteContent(ctx) {
    const [courseId, contentId] = ctx.args;
    if (!courseId || !contentId) {
      await ctx.reply('استفاده: /delete_content &lt;course_id&gt; &lt;content_id&gt;');
      return;
    }
    const content = this.store.getContent(contentId);
    if (!content || content.courseId !== courseId) {
      await ctx.reply('محتوا پیدا نشد.');
      return;
    }
    const keyboard = {
      inline_keyboard: [[
        { text: '🗑 حذف', callback_data: `confirm:delcontent:${contentId}` },
        { text: 'انصراف', callback_data: 'cancel:' },
      ]],
    };
    await ctx.reply(`حذف محتوای «${esc(content.fileName)}»؟`, { reply_markup: keyboard });
  }

  // --- practice (steps 12–19) -----------------------------------------
  async cmdPractice(ctx) {
    const active = this.store.getActiveSession(ctx.chatId);
    const recent = this.store.listSessions(ctx.chatId).slice(0, 3);
    let out = '🎓 <b>تمرین با استاد هوش مصنوعی</b>\n\n';
    if (active) {
      out += `جلسهٔ فعال: <code>${esc(active.id)}</code> — موضوع: ${esc(active.topic || 'تعیین‌نشده')}\n`;
      out += `ادامه: /practice_chat ${esc(active.id)}\n`;
      out += `پایان: /practice_end ${esc(active.id)}\n\n`;
    } else {
      const session = this.practice.startSession(ctx.chatId);
      out += `یک جلسهٔ جدید ساخته شد: <code>${esc(session.id)}</code>\n`;
      out += `یک موضوع انتخاب کنید سپس گفتگو را شروع کنید.\n`;
    }
    if (recent.length) {
      out += '\nجلسات اخیر:\n';
      for (const s of recent) out += `• <code>${esc(s.id)}</code> — ${esc(s.topic || 'بدون موضوع')} (${s.status})\n`;
    }
    const current = this.store.getActiveSession(ctx.chatId);
    const keyboard = current
      ? { inline_keyboard: this._topicButtons(current.id) }
      : undefined;
    await ctx.reply(out.trim(), keyboard ? { reply_markup: keyboard } : {});
  }

  _topicButtons(sessionId) {
    const rows = [];
    for (let i = 0; i < PRACTICE_TOPICS.length; i += 2) {
      rows.push(
        PRACTICE_TOPICS.slice(i, i + 2).map((t) => ({
          text: t.title,
          callback_data: `topic:${sessionId}:${t.id}`,
        }))
      );
    }
    rows.push([{ text: '💬 شروع گفتگو', callback_data: `chat:${sessionId}` }]);
    return rows;
  }

  async cmdPracticeTopic(ctx) {
    const sessionId = ctx.args[0] || this.store.getActiveSession(ctx.chatId)?.id;
    const session = sessionId && this.store.getSession(sessionId);
    if (!session) {
      await ctx.reply('جلسه پیدا نشد. ابتدا /practice را بزنید.');
      return;
    }
    await ctx.reply('یک موضوع را انتخاب کنید:', { reply_markup: { inline_keyboard: this._topicButtons(session.id) } });
  }

  async cmdPracticeChat(ctx) {
    const sessionId = ctx.args[0] || this.store.getActiveSession(ctx.chatId)?.id;
    const session = sessionId && this.store.getSession(sessionId);
    if (!session || session.status !== 'active') {
      await ctx.reply('جلسهٔ فعالی پیدا نشد. ابتدا /practice را بزنید.');
      return;
    }
    ctx.setState({ mode: 'practice_chat', data: { sessionId: session.id } });
    await ctx.reply(
      `💬 وارد حالت گفتگو با استاد شدید (جلسهٔ <code>${esc(session.id)}</code>).\n` +
        'هر پیام متنی یا صوتی شما به استاد فرستاده می‌شود. برای خروج /practice_end یا /cancel.'
    );
  }

  // One text turn inside a practice chat.
  async _practiceTurn(ctx, text) {
    const sessionId = ctx.state.data.sessionId;
    if (ctx.typing) await ctx.typing();
    let reply;
    try {
      reply = await this.practice.sendText(sessionId, text);
    } catch (err) {
      if (err.message === 'no_active_session') {
        ctx.clearState();
        return ctx.reply('جلسه دیگر فعال نیست. /practice را بزنید.');
      }
      this.logger?.recordError('practice_turn', err);
      return ctx.reply('در ارتباط با استاد خطایی رخ داد. کمی بعد دوباره تلاش کنید.');
    }
    await ctx.reply(`👨‍🏫 ${esc(reply)}`);
    await this._maybeVoiceReply(ctx, reply);
  }

  // One voice turn: download -> STT -> teacher reply -> (echo + optional TTS).
  async _practiceVoiceTurn(ctx) {
    const sessionId = ctx.state.data.sessionId;
    if (ctx.typing) await ctx.typing();
    let buffer;
    try {
      buffer = await ctx.downloadVoice();
    } catch (err) {
      this.logger?.recordError('voice_download', err);
      return ctx.reply('دریافت پیام صوتی ناموفق بود.');
    }
    let result;
    try {
      result = await this.practice.sendVoice(sessionId, buffer, ctx.voice?.mimeType || 'audio/ogg');
    } catch (err) {
      this.logger?.recordError('practice_voice', err);
      return ctx.reply('پردازش پیام صوتی با خطا مواجه شد.');
    }
    await ctx.reply(`📝 <i>${esc(result.transcript || '—')}</i>\n\n👨‍🏫 ${esc(result.reply)}`);
    await this._maybeVoiceReply(ctx, result.reply);
  }

  // Send the teacher reply as a voice note when the chat has voice replies on
  // and TTS is available (step 16). Failure degrades silently to text-only.
  async _maybeVoiceReply(ctx, text) {
    if (!this.store.getSettings(ctx.chatId).voiceReplies) return;
    let audio;
    try {
      audio = await this.practice.synthesizeReply(text);
    } catch {
      audio = null;
    }
    if (audio?.audio && ctx.sendVoice) {
      try {
        await ctx.sendVoice(audio.audio);
      } catch (err) {
        this.logger?.recordError('voice_reply', err);
      }
    }
  }

  async cmdPracticeEnd(ctx) {
    const sessionId = ctx.args[0] || ctx.state?.data?.sessionId || this.store.getActiveSession(ctx.chatId)?.id;
    const session = sessionId && this.store.getSession(sessionId);
    if (!session) {
      await ctx.reply('جلسه پیدا نشد.');
      return;
    }
    const summary = this.practice.endSession(session.id);
    if (ctx.state?.mode === 'practice_chat') ctx.clearState();
    await ctx.reply(this._renderSummary(summary, '🏁 جلسه پایان یافت'));
  }

  _renderSummary(s, title) {
    return (
      `${title}\n` +
      `شناسه: <code>${esc(s.id)}</code>\n` +
      `موضوع: ${esc(s.topic)}\n` +
      `پیام‌های شما: ${s.userTurns} · پاسخ‌های استاد: ${s.aiTurns}\n` +
      `مدت: ${s.durationMin} دقیقه`
    );
  }

  async cmdPracticeHistory(ctx) {
    const sessions = this.practice.history(ctx.chatId);
    if (sessions.length === 0) {
      await ctx.reply('هنوز جلسهٔ تمرینی ندارید. با /practice شروع کنید.');
      return;
    }
    const { slice, keyboard, current, pages } = paginate(sessions, 0, 'phist');
    await ctx.reply(this._renderHistory(slice, current, pages), keyboard ? { reply_markup: keyboard } : {});
  }

  _renderHistory(slice, current, pages) {
    let out = `🗂 <b>تاریخچهٔ جلسات</b> (صفحهٔ ${current + 1}/${pages})\n\n`;
    for (const s of slice) {
      out += `• <code>${esc(s.id)}</code> — ${esc(s.topic)} — ${s.status} — ${s.totalMessages} پیام\n`;
    }
    out += '\nجزئیات: /practice_details &lt;session_id&gt;';
    return out;
  }

  async cmdPracticeDetails(ctx) {
    const session = this.store.getSession(ctx.args[0]);
    if (!session || session.chatId !== String(ctx.chatId)) {
      await ctx.reply('استفاده: /practice_details &lt;session_id&gt; — جلسه پیدا نشد.');
      return;
    }
    const summary = this.practice.summarize(session.id);
    await ctx.reply(this._renderSummary(summary, '🔎 جزئیات جلسه'));
  }

  // --- settings (step 20) ---------------------------------------------
  async cmdSettings(ctx) {
    await ctx.reply('⚙️ <b>تنظیمات</b>\nبرای تغییر هر مورد روی آن بزنید:', {
      reply_markup: { inline_keyboard: this._settingsButtons(ctx.chatId) },
    });
  }

  _settingsButtons(chatId) {
    const s = this.store.getSettings(chatId);
    const mark = (v) => (v ? '✅' : '❌');
    return [
      [{ text: `${mark(s.notifications.registration)} ثبت‌نام`, callback_data: 'set:registration' }],
      [{ text: `${mark(s.notifications.practice)} تمرین`, callback_data: 'set:practice' }],
      [{ text: `${mark(s.notifications.error)} خطاها`, callback_data: 'set:error' }],
      [{ text: `${mark(s.notifications.upload)} آپلود`, callback_data: 'set:upload' }],
      [{ text: `${mark(s.voiceReplies)} پاسخ صوتی استاد`, callback_data: 'set:voiceReplies' }],
    ];
  }

  // --- cancel ----------------------------------------------------------
  async cmdCancel(ctx) {
    if (ctx.state) {
      ctx.clearState();
      await ctx.reply('✖️ عملیات جاری لغو شد.');
    } else {
      await ctx.reply('عملیات فعالی برای لغو وجود ندارد.');
    }
  }

  // --- admin (step 22) -------------------------------------------------
  async cmdAdminLogs(ctx) {
    const entries = this.logger ? this.logger.recent(15) : [];
    if (entries.length === 0) {
      await ctx.reply('لاگی ثبت نشده است.');
      return;
    }
    let out = '🧾 <b>آخرین لاگ‌ها</b>\n\n';
    for (const e of entries) {
      if (e.level === 'error') out += `❌ ${esc(e.ts)} ${esc(e.context)}: ${esc(e.message).slice(0, 120)}\n`;
      else out += `• ${esc(e.ts)} chat=${esc(e.chatId)} ${esc(e.command)} ${e.ok ? 'ok' : 'fail'}\n`;
    }
    await ctx.reply(out.trim());
  }

  // --- callback queries (inline keyboards) ----------------------------
  async handleCallback(ctx) {
    const data = ctx.callbackData || '';
    const [action, ...rest] = data.split(':');

    if (action === 'cancel') {
      ctx.clearState();
      await ctx.answerCallback('لغو شد');
      await ctx.editText('✖️ لغو شد.');
      return;
    }

    if (action === 'set') {
      const category = rest[0];
      if (category === 'voiceReplies') {
        const current = this.store.getSettings(ctx.chatId).voiceReplies;
        this.store.setSettings(ctx.chatId, { voiceReplies: !current });
      } else {
        this.store.toggleNotification(ctx.chatId, category);
      }
      await ctx.answerCallback('ذخیره شد');
      await ctx.editKeyboard({ inline_keyboard: this._settingsButtons(ctx.chatId) });
      return;
    }

    if (action === 'pg') {
      const prefix = rest[0];
      const page = Number(rest[rest.length - 1]) || 0;
      await this._handlePageCallback(ctx, prefix, rest, page);
      await ctx.answerCallback();
      return;
    }

    if (action === 'topic') {
      const [sessionId, topicId] = rest;
      const updated = this.practice.setTopic(sessionId, topicId);
      await ctx.answerCallback('موضوع تنظیم شد');
      if (updated) {
        await ctx.reply(`✅ موضوع تنظیم شد: <b>${esc(updated.topic)}</b>\nبرای گفتگو: /practice_chat ${esc(sessionId)}`);
      }
      return;
    }

    if (action === 'chat') {
      const sessionId = rest[0];
      const session = this.store.getSession(sessionId);
      if (session && session.status === 'active') {
        ctx.setState({ mode: 'practice_chat', data: { sessionId } });
        await ctx.answerCallback('حالت گفتگو فعال شد');
        await ctx.reply('💬 حالت گفتگو فعال شد. پیام متنی یا صوتی بفرستید. خروج: /practice_end');
      } else {
        await ctx.answerCallback('جلسه فعال نیست', { show_alert: true });
      }
      return;
    }

    if (action === 'confirm') {
      await this._handleConfirm(ctx, rest);
      return;
    }

    await ctx.answerCallback();
  }

  async _handlePageCallback(ctx, prefix, rest, page) {
    if (prefix === 'courses') {
      const { slice, keyboard, current, pages } = paginate(this.store.listCourses(), page, 'courses');
      await ctx.editText(this._renderCourses(slice, current, pages), keyboard);
    } else if (prefix === 'content') {
      const courseId = rest[1];
      const course = this.store.getCourse(courseId);
      if (!course) return;
      const { slice, keyboard, current, pages } = paginate(this.store.listContent(courseId), page, `content:${courseId}`);
      await ctx.editText(this._renderContent(course, slice, current, pages), keyboard);
    } else if (prefix === 'phist') {
      const { slice, keyboard, current, pages } = paginate(this.practice.history(ctx.chatId), page, 'phist');
      await ctx.editText(this._renderHistory(slice, current, pages), keyboard);
    }
  }

  async _handleConfirm(ctx, rest) {
    const [kind, id] = rest;
    // Re-check authorization: destructive confirmations require write access.
    if (!isAllowed(this.config, ctx.userId)) {
      await ctx.answerCallback('اجازه ندارید', { show_alert: true });
      return;
    }
    if (kind === 'delcourse') {
      const ok = this.store.deleteCourse(id);
      await ctx.answerCallback(ok ? 'حذف شد' : 'پیدا نشد');
      await ctx.editText(ok ? '🗑 درس و محتوای آن حذف شد.' : 'درس پیدا نشد.');
    } else if (kind === 'delcontent') {
      const ok = this.store.deleteContent(id);
      await ctx.answerCallback(ok ? 'حذف شد' : 'پیدا نشد');
      await ctx.editText(ok ? '🗑 محتوا حذف شد.' : 'محتوا پیدا نشد.');
    } else {
      await ctx.answerCallback();
    }
  }
}

export default Commands;
