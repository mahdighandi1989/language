/**
 * Purpose: Persistence layer for the Telegram integration. The app has no
 * database, so this is a small JSON-file-backed store with an in-memory cache.
 * It is deliberately an abstraction (TelegramStore) rather than raw file access
 * so it can later be swapped for a real DB without touching the command/bot
 * code, and so tests can run fully in-memory (persist=false).
 *
 * Upstream (inputs): a data directory from services/telegram/config.js.
 * Downstream (outputs): consumed by courses.js, commands.js, notifications.js,
 * auth/linking, settings and practice-session bookkeeping. Writes a single
 * JSON document to <dataDir>/telegram-store.json (atomic temp-file rename).
 *
 * Data shape (telegram-store.json):
 * {
 *   links:    { [chatId]: { userId, linkedAt } },
 *   pending:  { [code]: { chatId, telegramUserId, createdAt } },
 *   courses:  { [courseId]: { id, title, description, active, createdAt, updatedAt } },
 *   content:  { [contentId]: { id, courseId, type, fileName, fileId, size, createdAt } },
 *   settings: { [chatId]: { notifications: {..}, ... } },
 *   sessions: { [sessionId]: { id, chatId, topic, status, messages:[], startedAt, endedAt } },
 *   seq: { course, content, session }
 * }
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const EMPTY = () => ({
  links: {},
  pending: {},
  courses: {},
  content: {},
  settings: {},
  sessions: {},
  seq: { course: 0, content: 0, session: 0 },
});

// Default per-chat notification settings. Every event category defaults to on.
export const DEFAULT_SETTINGS = {
  notifications: {
    registration: true,
    practice: true,
    error: true,
    upload: true,
  },
  voiceReplies: true,
};

export class TelegramStore {
  constructor({ dataDir = null, persist = true } = {}) {
    this.dataDir = dataDir;
    this.persist = persist && Boolean(dataDir);
    this.file = dataDir ? path.join(dataDir, 'telegram-store.json') : null;
    this.data = EMPTY();
    if (this.persist) this._load();
  }

  _load() {
    try {
      if (fs.existsSync(this.file)) {
        const raw = fs.readFileSync(this.file, 'utf8');
        const parsed = JSON.parse(raw);
        this.data = { ...EMPTY(), ...parsed, seq: { ...EMPTY().seq, ...(parsed.seq || {}) } };
      }
    } catch {
      // Corrupt/unreadable store must never crash the bot: start clean.
      this.data = EMPTY();
    }
  }

  _save() {
    if (!this.persist) return;
    try {
      fs.mkdirSync(this.dataDir, { recursive: true });
      const tmp = `${this.file}.${process.pid}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(this.data, null, 2));
      fs.renameSync(tmp, this.file);
    } catch {
      // Persistence is best-effort; in-memory state remains authoritative.
    }
  }

  _nextId(kind, prefix) {
    this.data.seq[kind] = (this.data.seq[kind] || 0) + 1;
    return `${prefix}${this.data.seq[kind]}`;
  }

  // --- account linking / auth -----------------------------------------
  // Create a one-time verification code the user enters on the website to link
  // their Telegram chat to a system account.
  createLinkCode(chatId, telegramUserId) {
    const code = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 hex chars
    // Drop any previous pending code for this chat so only the latest is valid.
    for (const [c, v] of Object.entries(this.data.pending)) {
      if (v.chatId === String(chatId)) delete this.data.pending[c];
    }
    this.data.pending[code] = {
      chatId: String(chatId),
      telegramUserId: String(telegramUserId),
      createdAt: Date.now(),
    };
    this._save();
    return code;
  }

  // Confirm a code (called from the website side) -> establishes the link.
  confirmLinkCode(code, userId) {
    const pending = this.data.pending[String(code).toUpperCase()];
    if (!pending) return null;
    delete this.data.pending[String(code).toUpperCase()];
    this.data.links[pending.chatId] = { userId: String(userId), linkedAt: Date.now() };
    this._save();
    return { chatId: pending.chatId, userId: String(userId) };
  }

  getLink(chatId) {
    return this.data.links[String(chatId)] || null;
  }

  unlink(chatId) {
    const existed = Boolean(this.data.links[String(chatId)]);
    delete this.data.links[String(chatId)];
    this._save();
    return existed;
  }

  // --- courses ---------------------------------------------------------
  listCourses() {
    return Object.values(this.data.courses).sort((a, b) => a.createdAt - b.createdAt);
  }

  getCourse(courseId) {
    return this.data.courses[courseId] || null;
  }

  findCourseByTitle(title) {
    const norm = String(title).trim().toLowerCase();
    return this.listCourses().find((c) => c.title.trim().toLowerCase() === norm) || null;
  }

  addCourse({ title, description = '', active = true }) {
    const id = this._nextId('course', 'c');
    const now = Date.now();
    const course = { id, title, description, active, createdAt: now, updatedAt: now };
    this.data.courses[id] = course;
    this._save();
    return course;
  }

  updateCourse(courseId, patch) {
    const course = this.data.courses[courseId];
    if (!course) return null;
    Object.assign(course, patch, { updatedAt: Date.now() });
    this._save();
    return course;
  }

  deleteCourse(courseId) {
    if (!this.data.courses[courseId]) return false;
    delete this.data.courses[courseId];
    // Cascade: remove all content rows belonging to the course.
    for (const [cid, c] of Object.entries(this.data.content)) {
      if (c.courseId === courseId) delete this.data.content[cid];
    }
    this._save();
    return true;
  }

  // --- content ---------------------------------------------------------
  listContent(courseId) {
    return Object.values(this.data.content)
      .filter((c) => c.courseId === courseId)
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  getContent(contentId) {
    return this.data.content[contentId] || null;
  }

  addContent({ courseId, type, fileName, fileId, size = 0 }) {
    const id = this._nextId('content', 'm');
    const row = { id, courseId, type, fileName, fileId, size, createdAt: Date.now() };
    this.data.content[id] = row;
    this._save();
    return row;
  }

  deleteContent(contentId) {
    if (!this.data.content[contentId]) return false;
    delete this.data.content[contentId];
    this._save();
    return true;
  }

  // --- per-chat settings ----------------------------------------------
  getSettings(chatId) {
    const stored = this.data.settings[String(chatId)];
    return {
      notifications: { ...DEFAULT_SETTINGS.notifications, ...(stored?.notifications || {}) },
      voiceReplies: stored?.voiceReplies ?? DEFAULT_SETTINGS.voiceReplies,
    };
  }

  setSettings(chatId, patch) {
    const current = this.getSettings(chatId);
    const next = {
      notifications: { ...current.notifications, ...(patch.notifications || {}) },
      voiceReplies: patch.voiceReplies ?? current.voiceReplies,
    };
    this.data.settings[String(chatId)] = next;
    this._save();
    return next;
  }

  // Toggle a single notification category and return the new boolean value.
  toggleNotification(chatId, category) {
    const current = this.getSettings(chatId);
    if (!(category in current.notifications)) return null;
    const value = !current.notifications[category];
    this.setSettings(chatId, { notifications: { [category]: value } });
    return value;
  }

  // --- practice sessions ----------------------------------------------
  listSessions(chatId) {
    return Object.values(this.data.sessions)
      .filter((s) => s.chatId === String(chatId))
      .sort((a, b) => b.startedAt - a.startedAt);
  }

  getSession(sessionId) {
    return this.data.sessions[sessionId] || null;
  }

  // The single active (status==='active') session for a chat, if any.
  getActiveSession(chatId) {
    return this.listSessions(chatId).find((s) => s.status === 'active') || null;
  }

  createSession(chatId, topic = null) {
    const id = this._nextId('session', 's');
    const session = {
      id,
      chatId: String(chatId),
      topic,
      status: 'active',
      messages: [],
      startedAt: Date.now(),
      endedAt: null,
    };
    this.data.sessions[id] = session;
    this._save();
    return session;
  }

  appendSessionMessage(sessionId, role, text) {
    const session = this.data.sessions[sessionId];
    if (!session) return null;
    session.messages.push({ role, text, at: Date.now() });
    this._save();
    return session;
  }

  updateSession(sessionId, patch) {
    const session = this.data.sessions[sessionId];
    if (!session) return null;
    Object.assign(session, patch);
    this._save();
    return session;
  }

  endSession(sessionId) {
    return this.updateSession(sessionId, { status: 'ended', endedAt: Date.now() });
  }
}

export default TelegramStore;
