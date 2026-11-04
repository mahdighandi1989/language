/**
 * Purpose: HTTP surface of «نظارت و سرکشی» under /api/inspection. Every rule is
 * enforced HERE (server), not in the UI: the supervisor account cannot approve,
 * triage, rush or delete; `fixed` without an after-picture is refused; an answer
 * is refused while an attached file is unread; nothing is ever deleted (DELETE
 * answers 405). Rules live in services/inspection/model.js (pure, unit-tested).
 *
 * Upstream: services/inspection/{model,store,auth,extract}.js, multer, express.
 * Downstream: mounted in server.js BEFORE the general /api limiter (it has its
 * own); consumed by frontend/src/inspection/* and scripts/supervisor/*.
 */
import crypto from 'crypto';
import { Router } from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import {
  STATUS, OUTCOMES, MAX_FILE_BYTES, MAX_SHOT_BYTES, TEXT_SLICE_MAX,
  InspectionError, cleanText, validateNote, applyNote, approve, triage, reopen,
  setUrgent, urgentQueue, claimUrgent, fileApproved, initialStatus, present, canSee,
  needsSupervisor, editNote, detachFile, urgentQueue as fastQueue,
} from '../services/inspection/model.js';
import { recordKnock, nextRound, nextFullRound } from '../services/inspection/rounds.js';
import { notifySubmitter } from '../services/inspection/mailer.js';
import { getInspectionStore } from '../services/inspection/store.js';
import { resolveActor, supervisorLogin, supervisorConfigured } from '../services/inspection/auth.js';
import { extractText, transcribeMedia } from '../services/inspection/extract.js';

export const inspectionRouter = Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: true,
  message: { error: 'تعداد درخواست‌های نظارت بیش از حد مجاز است.' },
});
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: true,
  message: { error: 'تلاش‌های ورودِ ناظر بیش از حد مجاز است.' },
});
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_FILE_BYTES, files: 10 } });

inspectionRouter.use('/api/inspection', limiter);

// When the supervisor comes next — measured from its own knocks (rounds.js).
const URGENT_MINUTE = Number(process.env.SUPERVISOR_URGENT_MINUTE || 37);
const FULL_CRON = process.env.SUPERVISOR_FULL_CRON || '23 2 * * 1,4';
async function roundsOf(store, now = new Date()) {
  const k = await store.getKnocks();
  return { urgent: nextRound(now, k.urgent, URGENT_MINUTE), full: nextFullRound(now, k.full, FULL_CRON) };
}
async function knock(store, kind) {
  try { await store.knock(kind, (list) => recordKnock(list)); } catch (e) { console.error('knock failed:', e?.message); }
}

const wrap = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (e) {
    const status = Number.isInteger(e?.status) ? e.status : 500;
    if (status >= 500) console.error('inspection error:', e?.stack || e);
    res.status(status).json({ error: status >= 500 && !(e instanceof InspectionError) ? 'خطای داخلیِ نظارت' : e.message });
  }
};

const authed = (fn) => wrap(async (req, res) => {
  req.actor = await resolveActor(req);
  await fn(req, res);
});

function newId() {
  return crypto.randomBytes(8).toString('hex');
}

/** Parse a data-URL screenshot; returns { mime, buffer } or null. */
export function parseShot(dataUrl) {
  if (!dataUrl) return null;
  const m = /^data:(image\/(png|jpeg|webp));base64,([A-Za-z0-9+/=\s]+)$/.exec(String(dataUrl));
  if (!m) throw new InspectionError(415, 'تصویر باید PNG/JPEG/WebP به‌صورتِ data-URL باشد');
  const buffer = Buffer.from(m[3], 'base64');
  if (buffer.length > MAX_SHOT_BYTES) throw new InspectionError(413, 'تصویر بیش از ۶ مگابایت است');
  return { mime: m[1], buffer };
}

async function storeShot(store, sheetId, noteId, kind, dataUrl) {
  const shot = parseShot(dataUrl);
  if (!shot) return null;
  const id = `${sheetId}-${noteId}-${kind}`;
  await store.putBlob(`shot-${id}`, Buffer.concat([Buffer.from(`${shot.mime}\n`), shot.buffer]));
  return id;
}

function geometryOf(body) {
  const g = body?.geometry;
  if (!g || typeof g !== 'object') return null;
  // Keep only plain JSON (bounded) — it is replayed by the highlight layer.
  const json = JSON.stringify(g);
  return json.length > 8000 ? null : JSON.parse(json);
}

/** Browser snapshot sent with a sheet (url, viewport, UA…) — plain bounded JSON. */
export function envOf(body) {
  const e = body?.env;
  if (!e || typeof e !== 'object' || Array.isArray(e)) return null;
  const json = JSON.stringify(e);
  return json.length > 3000 ? null : JSON.parse(json);
}

async function loadVisible(store, actor, id) {
  const sheet = await store.getSheet(String(id));
  if (!sheet || !canSee(actor, sheet)) throw new InspectionError(404, 'برگه پیدا نشد');
  return sheet;
}

async function presentFull(store, sheet) {
  return present(sheet, await store.listFiles(sheet.id));
}

// --- auth / identity ---------------------------------------------------------
inspectionRouter.post('/api/inspection/auth/supervisor', loginLimiter, wrap(async (req, res) => {
  if (!supervisorConfigured()) {
    return res.status(503).json({ error: 'حسابِ ناظر فعال نیست: SUPERVISOR_PASSWORD (دست‌کم ۱۶ نویسه) روی سرور تنظیم نشده' });
  }
  const result = supervisorLogin(req.body?.password);
  if (!result) return res.status(401).json({ error: 'رمزِ ناظر نادرست است' });
  return res.json(result);
}));

inspectionRouter.get('/api/inspection/me', authed(async (req, res) => {
  const store = await getInspectionStore();
  res.json({ ...req.actor, store: store.describe(), supervisorConfigured: supervisorConfigured() });
}));

// --- lists -------------------------------------------------------------------
inspectionRouter.get('/api/inspection', authed(async (req, res) => {
  const store = await getInspectionStore();
  const status = req.query.status ? String(req.query.status) : null;
  const page = req.query.page ? String(req.query.page) : null;
  let sheets = (await store.listSheets()).filter((s) => canSee(req.actor, s));
  if (status) sheets = sheets.filter((s) => s.status === status);
  if (page) sheets = sheets.filter((s) => s.page === page);
  const out = [];
  for (const s of sheets) out.push(await presentFull(store, s)); // eslint-disable-line no-await-in-loop
  res.json({ me: req.actor, store: store.describe(), sheets: out });
}));

inspectionRouter.get('/api/inspection/queue', authed(async (req, res) => {
  if (!['owner', 'supervisor'].includes(req.actor.role)) {
    return res.status(403).json({ error: 'صفِ ناظر فقط برای مالک و ناظر است' });
  }
  const store = await getInspectionStore();
  if (req.actor.role === 'supervisor') await knock(store, 'full');
  const sheets = (await store.listSheets()).filter(needsSupervisor);
  const out = [];
  for (const s of sheets) out.push(await presentFull(store, s)); // eslint-disable-line no-await-in-loop
  return res.json({ store: store.describe(), sheets: out });
}));

inspectionRouter.get('/api/inspection/urgent', authed(async (req, res) => {
  if (!['owner', 'supervisor'].includes(req.actor.role)) {
    return res.status(403).json({ error: 'صفِ فوری فقط برای مالک و ناظر است' });
  }
  const store = await getInspectionStore();
  res.json({ sheets: urgentQueue(await store.listSheets()) });
}));

inspectionRouter.post('/api/inspection/urgent/claim', authed(async (req, res) => {
  const store = await getInspectionStore();
  if (req.actor.role === 'supervisor') await knock(store, 'urgent');
  const claimed = await store.updateAll(async (sheets) => {
    const s = claimUrgent(req.actor, sheets, req.body?.runId || '');
    return { result: s, changed: s ? [s] : [] };
  });
  if (!claimed) return res.json({ sheet: null });
  return res.json({ sheet: await presentFull(store, claimed) });
}));

inspectionRouter.post('/api/inspection/file-approved', authed(async (req, res) => {
  const store = await getInspectionStore();
  const filed = await store.updateAll(async (sheets, binders) => {
    const done = fileApproved(req.actor, sheets, binders);
    return { result: done, changed: done };
  });
  res.json({ filed: filed.map((s) => ({ id: s.id, number: s.number, binder: s.binderNumber, page: s.binderPage })) });
}));

inspectionRouter.get('/api/inspection/rounds', authed(async (req, res) => {
  const store = await getInspectionStore();
  res.json(await roundsOf(store));
}));

inspectionRouter.get('/api/inspection/binders', authed(async (req, res) => {
  const store = await getInspectionStore();
  res.json({ binders: await store.listBinders() });
}));

// --- files -------------------------------------------------------------------
async function loadFileVisible(store, actor, fileId) {
  const file = await store.getFile(String(fileId));
  if (!file) throw new InspectionError(404, 'فایل پیدا نشد');
  await loadVisible(store, actor, file.sheetId);
  return file;
}

inspectionRouter.get('/api/inspection/files/:fileId', authed(async (req, res) => {
  const store = await getInspectionStore();
  res.json({ file: await loadFileVisible(store, req.actor, req.params.fileId) });
}));

inspectionRouter.get('/api/inspection/files/:fileId/text', authed(async (req, res) => {
  const store = await getInspectionStore();
  const file = await loadFileVisible(store, req.actor, req.params.fileId);
  const text = (await store.getBlob(`text-${file.id}`))?.toString('utf8') || '';
  const offset = Math.max(0, parseInt(req.query.offset, 10) || 0);
  const limit = Math.min(TEXT_SLICE_MAX, Math.max(1, parseInt(req.query.limit, 10) || TEXT_SLICE_MAX));
  const end = Math.min(text.length, offset + limit);
  let updated = file;
  // Contiguous reading only: skipping ahead does not discharge the debt.
  if (req.actor.role === 'supervisor' && offset <= (file.readChars || 0) && end > (file.readChars || 0)) {
    updated = await store.updateFile(file.id, (f) => {
      f.readChars = end;
      f.readAt = new Date().toISOString();
    });
  }
  res.json({ fileId: file.id, offset, end, total: text.length, done: end >= text.length, readChars: updated.readChars || 0,
    text: text.slice(offset, end) });
}));

inspectionRouter.get('/api/inspection/files/:fileId/raw', authed(async (req, res) => {
  const store = await getInspectionStore();
  const file = await loadFileVisible(store, req.actor, req.params.fileId);
  const bytes = await store.getBlob(`file-${file.id}`);
  if (!bytes) return res.status(410).json({ error: 'بایت‌های این فایل در دسترس نیست' });
  if (req.actor.role === 'supervisor') {
    await store.updateFile(file.id, (f) => { f.viewedAt = new Date().toISOString(); });
  }
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(file.filename)}`);
  return res.send(bytes);
}));

async function runMediaTranscription(store, file, buffer) {
  if (process.env.INSPECTION_TRANSCRIBE === '0') return;
  const result = await transcribeMedia({ buffer, filename: file.filename, mime: file.mime });
  if (result.status === 'ok') await store.putBlob(`text-${file.id}`, Buffer.from(result.text, 'utf8'));
  await store.updateFile(file.id, (f) => {
    f.extractStatus = result.status;
    f.extractNote = result.note || '';
    f.textChars = result.status === 'ok' ? result.text.length : 0;
    f.textTruncated = Boolean(result.truncated);
  });
}

inspectionRouter.post('/api/inspection/files/:fileId/extract', authed(async (req, res) => {
  const store = await getInspectionStore();
  const file = await loadFileVisible(store, req.actor, req.params.fileId);
  if (!['owner', 'supervisor'].includes(req.actor.role)) return res.status(403).json({ error: 'فقط مالک یا ناظر' });
  const bytes = await store.getBlob(`file-${file.id}`);
  if (!bytes) return res.status(410).json({ error: 'بایت‌های این فایل در دسترس نیست' });
  if (/^(audio|video)\//.test(file.mime)) await runMediaTranscription(store, file, bytes);
  res.json({ file: await store.getFile(file.id) });
}));

inspectionRouter.post('/api/inspection/:id/files', authed(async (req, res) => {
  await new Promise((resolve, reject) => upload.array('files', 10)(req, res, (e) => (e ? reject(e) : resolve())))
    .catch((e) => {
      if (e?.code === 'LIMIT_FILE_SIZE') throw new InspectionError(413, `حجمِ هر فایل حداکثر ${MAX_FILE_BYTES / 1024 / 1024}MB است`);
      throw new InspectionError(400, `خطای آپلود: ${e.message}`);
    });
  const store = await getInspectionStore();
  const sheet = await loadVisible(store, req.actor, req.params.id);
  if ([STATUS.FILED, STATUS.DECLINED].includes(sheet.status)) throw new InspectionError(422, 'برگهٔ بسته فایلِ تازه نمی‌گیرد');
  if (req.actor.role === 'supervisor' && sheet.status === STATUS.PENDING) throw new InspectionError(422, 'این برگه هنوز تأییدِ مدیر را ندارد');
  const files = req.files || [];
  if (!files.length) throw new InspectionError(422, 'فایلی نیامد');
  const captions = [].concat(req.body?.captions || req.body?.caption || []);
  const created = [];
  for (const [i, f] of files.entries()) {
    if (!f.size) throw new InspectionError(422, `فایلِ «${f.originalname}» خالی است`);
    const filename = Buffer.from(f.originalname, 'latin1').toString('utf8');
    // eslint-disable-next-line no-await-in-loop
    const extracted = await extractText({ buffer: f.buffer, filename, mime: f.mimetype });
    // eslint-disable-next-line no-await-in-loop
    const meta = await store.createFile((n) => ({
      id: `f${n}`,
      number: n,
      sheetId: sheet.id,
      noteId: cleanText(req.body?.noteId, 40),
      filename,
      mime: f.mimetype || 'application/octet-stream',
      byteSize: f.size,
      sha256: crypto.createHash('sha256').update(f.buffer).digest('hex'),
      caption: cleanText(captions[i] || '', 2000),
      uploadedBy: req.actor.email,
      createdAt: new Date().toISOString(),
      extractStatus: extracted.status,
      extractNote: extracted.note || '',
      textChars: extracted.status === 'ok' ? extracted.text.length : 0,
      textTruncated: Boolean(extracted.truncated),
      pageCount: extracted.pageCount || 0,
      readChars: 0,
      readAt: null,
      viewedAt: null,
    }));
    // eslint-disable-next-line no-await-in-loop
    await store.putBlob(`file-${meta.id}`, f.buffer);
    // eslint-disable-next-line no-await-in-loop
    if (extracted.status === 'ok') await store.putBlob(`text-${meta.id}`, Buffer.from(extracted.text, 'utf8'));
    if (extracted.status === 'pending') {
      runMediaTranscription(store, meta, f.buffer).catch((e) => console.error('transcription failed:', e?.message));
    }
    created.push(meta);
  }
  // A new attachment from the owner re-opens an answered sheet (there is something new to read).
  if (req.actor.role !== 'supervisor' && sheet.status === STATUS.ANSWERED) {
    await store.updateSheet(sheet.id, (s) => { s.status = req.actor.role === 'owner' ? STATUS.OPEN : STATUS.PENDING; });
  }
  res.status(201).json({ files: created });
}));

inspectionRouter.get('/api/inspection/shots/:shotId', authed(async (req, res) => {
  const store = await getInspectionStore();
  const shotId = String(req.params.shotId);
  await loadVisible(store, req.actor, shotId.split('-')[0]);
  const blob = await store.getBlob(`shot-${shotId}`);
  if (!blob) return res.status(404).json({ error: 'تصویر پیدا نشد' });
  const nl = blob.indexOf(10);
  res.setHeader('Content-Type', blob.subarray(0, nl).toString('utf8'));
  return res.send(blob.subarray(nl + 1));
}));

// --- one sheet -----------------------------------------------------------------
inspectionRouter.get('/api/inspection/:id', authed(async (req, res) => {
  const store = await getInspectionStore();
  res.json({ sheet: await presentFull(store, await loadVisible(store, req.actor, req.params.id)) });
}));

inspectionRouter.post('/api/inspection', authed(async (req, res) => {
  const store = await getInspectionStore();
  const text = cleanText(req.body?.text);
  if (!text) throw new InspectionError(422, 'متنِ برگه خالی است');
  if (req.actor.role === 'user') {
    const mine = (await store.listSheets()).filter((s) => s.createdByUid === req.actor.uid);
    if (mine.filter((s) => s.status === STATUS.PENDING).length >= 5) {
      throw new InspectionError(429, '۵ برگهٔ شما هنوز منتظرِ تأییدِ مدیر است — پس از بررسیِ آن‌ها برگهٔ تازه بدهید');
    }
  }
  const noteId = newId();
  const now = new Date().toISOString();
  const sheet = await store.createSheet((number) => ({
    id: String(number),
    number,
    title: text.split('\n')[0].slice(0, 200),
    status: initialStatus(req.actor),
    createdAt: now,
    updatedAt: now,
    createdBy: req.actor.email,
    createdByUid: req.actor.uid,
    page: cleanText(req.body?.page, 200),
    pageLabel: cleanText(req.body?.pageLabel, 200),
    reopen: cleanText(req.body?.reopen, 240),
    domPath: cleanText(req.body?.domPath, 400),
    coveredText: cleanText(req.body?.coveredText, 4000),
    // «درخواستِ عمومی»: a request tied to no place on any page — same queue,
    // colours, ⚡ and binder; it simply has no box/highlight.
    general: Boolean(req.body?.general),
    geometry: req.body?.general ? null : geometryOf(req.body),
    env: envOf(req.body),
    notes: [{ id: noteId, by: req.actor.role === 'supervisor' ? 'reviewer' : req.actor.role, author: req.actor.email, at: now, text, shotId: null }],
    deps: [],
    urgentAt: null,
    urgentDoneAt: null,
    urgentClaimedAt: null,
    urgentClaimedBy: '',
  }));
  const shotId = await storeShot(store, sheet.id, noteId, 'before', req.body?.shot);
  let final = sheet;
  if (shotId || (req.body?.urgent && req.actor.role === 'owner')) {
    final = await store.updateSheet(sheet.id, (s) => {
      if (shotId) s.notes[0].shotId = shotId;
      if (req.body?.urgent && req.actor.role === 'owner') setUrgent(req.actor, s, true);
    });
  }
  res.status(201).json({ sheet: await presentFull(store, final) });
}));

inspectionRouter.post('/api/inspection/:id/notes', authed(async (req, res) => {
  const store = await getInspectionStore();
  const sheet = await loadVisible(store, req.actor, req.params.id);
  const body = req.body || {};
  const files = await store.listFiles(sheet.id);
  const text = validateNote(req.actor, sheet, body, files);
  const noteId = newId();
  const shotId = await storeShot(store, sheet.id, noteId, 'before', body.shot);
  const afterShotId = req.actor.role === 'supervisor' ? await storeShot(store, sheet.id, noteId, 'after', body.afterShot) : null;
  const reviewer = req.actor.role === 'supervisor';
  const note = {
    id: noteId,
    by: reviewer ? 'reviewer' : req.actor.role,
    author: req.actor.email,
    at: new Date().toISOString(),
    text,
    shotId,
  };
  const spot = geometryOf(body);
  if (spot) note.geometry = spot;
  if (reviewer) {
    Object.assign(note, {
      outcome: body.outcome,
      afterShotId,
      deps: body.deps.slice(0, 60).map((d) => ({ name: cleanText(d.name, 160), status: d.status, note: cleanText(d.note, 300) })),
      commits: (body.commits || []).slice(0, 20).map((c) => cleanText(c, 60)),
      place: cleanText(body.place, 400),
      noChangeReason: cleanText(body.noChangeReason, 2000),
    });
  }
  const updated = await store.updateSheet(sheet.id, (s) => applyNote(req.actor, s, note));
  res.status(201).json({ sheet: await presentFull(store, updated) });
}));

const ownerAction = (fn) => authed(async (req, res) => {
  const store = await getInspectionStore();
  await loadVisible(store, req.actor, req.params.id);
  const updated = await store.updateSheet(String(req.params.id), (s) => fn(req, s));
  res.json({ sheet: await presentFull(store, updated) });
});

inspectionRouter.post('/api/inspection/:id/approve', ownerAction((req, s) => { approve(req.actor, s); }));
inspectionRouter.post('/api/inspection/:id/reopen', ownerAction((req, s) => { reopen(req.actor, s); }));
// Accept/decline a user's sheet; the submitter is e-mailed (with the reason on a
// decline — an empty reason is allowed). The mail result is stored on the sheet.
inspectionRouter.post('/api/inspection/:id/triage', authed(async (req, res) => {
  const store = await getInspectionStore();
  await loadVisible(store, req.actor, req.params.id);
  const updated = await store.updateSheet(String(req.params.id), (s) => { triage(req.actor, s, req.body?.decision, req.body?.note); });
  const mail = await notifySubmitter(updated);
  const final = await store.updateSheet(updated.id, (s) => { s.mail = [...(s.mail || []), mail]; });
  res.json({ sheet: await presentFull(store, final), mail });
}));
// ⚡: the answer also says WHERE in the fast queue and WHEN the round comes.
inspectionRouter.post('/api/inspection/:id/urgent', authed(async (req, res) => {
  const store = await getInspectionStore();
  await loadVisible(store, req.actor, req.params.id);
  const updated = await store.updateSheet(String(req.params.id), (s) => { setUrgent(req.actor, s, true); });
  const queue = fastQueue(await store.listSheets());
  const position = Math.max(1, queue.findIndex((x) => x.id === updated.id) + 1);
  res.json({ sheet: await presentFull(store, updated), position, nextRound: (await roundsOf(store)).urgent });
}));
// Edit the text of a note; the first text is kept as originalText.
inspectionRouter.patch('/api/inspection/:id/notes/:noteId', authed(async (req, res) => {
  const store = await getInspectionStore();
  await loadVisible(store, req.actor, req.params.id);
  const updated = await store.updateSheet(String(req.params.id), (s) => { editNote(req.actor, s, String(req.params.noteId), req.body?.text); });
  res.json({ sheet: await presentFull(store, updated) });
}));
// Take an attachment off a sheet (owner only). NOT a delete: bytes and text stay.
inspectionRouter.post('/api/inspection/files/:fileId/detach', authed(async (req, res) => {
  const store = await getInspectionStore();
  const file = await store.getFile(String(req.params.fileId));
  if (!file) throw new InspectionError(404, 'فایل پیدا نشد');
  const sheet = await loadVisible(store, req.actor, file.sheetId);
  const updated = await store.updateFile(file.id, (f) => { detachFile(req.actor, sheet, f); });
  res.json({ file: updated, sheet: await presentFull(store, await store.getSheet(sheet.id)) });
}));
inspectionRouter.delete('/api/inspection/:id/urgent', ownerAction((req, s) => { setUrgent(req.actor, s, false); }));

// Deleting a sheet or a file is not a capability of this system (rule 6).
const noDelete = (req, res) => res.status(405).json({ error: 'حذفِ برگه یا پیوست ممنوع است — برگهٔ ناخواسته را «رد» یا بایگانی کنید' });
inspectionRouter.delete('/api/inspection/files/:fileId', noDelete);
inspectionRouter.delete('/api/inspection/:id', noDelete);

export { OUTCOMES };
export default inspectionRouter;
