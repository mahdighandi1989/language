/**
 * Purpose: «آپلودِ هوشمند» HTTP surface.
 *   POST /api/lesson-files/:lessonId          multipart `files` (≤10 × 25MB) [+ review=0]
 *        → keeps every ORIGINAL file, extracts its text exactly / verified, returns
 *          per-file results (text, suspect lines, agreement, corrections).
 *   GET  /api/lesson-files/:lessonId          the lesson's stored files (metadata)
 *   GET  /api/lesson-files/:lessonId/:fileId/raw   download the original
 *   POST /api/lesson-files/:lessonId/:fileId/remove  take it off the lesson (kept, not deleted)
 * Files are scoped to the signed-in user (uid); approval is enforced by
 * requireAuthIfConfigured. Upstream: services/lessonFiles/*. Downstream: frontend/src/lessons/SmartUpload.jsx.
 */
import crypto from 'crypto';
import { Router } from 'express';
import multer from 'multer';
import { requireAuthIfConfigured } from '../middleware/firebaseAuth.js';
import { extractLessonFile } from '../services/lessonFiles/pipeline.js';
import { copyToDrive } from './drive.js';
import { saveLessonFile, listLessonFiles, readLessonFile, updateLessonFile, storeInfo, saveLessonExtract, readLessonExtract } from '../services/lessonFiles/store.js';

export const MAX_LESSON_FILE = 25 * 1024 * 1024;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_LESSON_FILE, files: 10 } });

let aiOverride = null;
/** Test seam: inject a fake AI for the pipeline. */
export function setLessonFilesAi(ai) { aiOverride = ai; }

export const lessonFilesRouter = Router();
const uidOf = (req) => req.user?.uid || 'local';
const lessonIdOf = (req) => String(req.params.lessonId).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40);

lessonFilesRouter.post('/api/lesson-files/:lessonId', requireAuthIfConfigured, (req, res) => {
  upload.array('files', 10)(req, res, async (err) => {
    if (err) {
      const msg = err.code === 'LIMIT_FILE_SIZE' ? 'حجمِ هر فایل حداکثر ۲۵MB است' : `خطای آپلود: ${err.message}`;
      return res.status(err.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ error: msg });
    }
    const files = req.files || [];
    if (!files.length) return res.status(400).json({ error: 'فایلی نیامد' });
    const uid = uidOf(req);
    const lessonId = lessonIdOf(req);
    const review = String(req.body?.review ?? '1') !== '0';
    try {
      const results = [];
      for (const f of files) {
        const filename = Buffer.from(f.originalname, 'latin1').toString('utf8');
        // 1) The original is stored FIRST: a long extraction (a 30–60 minute class
        //    takes minutes) that fails or whose tab is closed never loses the upload.
        const meta = {
          id: crypto.randomBytes(9).toString('hex'),
          name: filename,
          type: f.mimetype || 'application/octet-stream',
          size: f.size,
          sha256: crypto.createHash('sha256').update(f.buffer).digest('hex'),
          status: 'processing',
          uploadedAt: new Date().toISOString(),
          stored: 'db',
        };
        // eslint-disable-next-line no-await-in-loop
        await saveLessonFile(uid, lessonId, meta, f.buffer);
        // 2) Extract, then keep the result on the server too (GET …/extract).
        // eslint-disable-next-line no-await-in-loop
        const ex = await extractLessonFile({ buffer: f.buffer, filename, mime: f.mimetype }, { ai: aiOverride || undefined, review });
        const done = { method: ex.method, status: ex.status, agreement: ex.agreement, suspectCount: ex.suspectCount, textChars: ex.text.length, extractedAt: new Date().toISOString(), hasExtract: true };
        // eslint-disable-next-line no-await-in-loop
        await saveLessonExtract(meta.id, { text: ex.text, markedText: ex.markedText, corrections: ex.corrections, notes: ex.notes, suspectLines: ex.suspectLines, method: ex.method, status: ex.status, agreement: ex.agreement });
        // eslint-disable-next-line no-await-in-loop
        await updateLessonFile(uid, lessonId, meta.id, (x) => Object.assign(x, done));
        results.push({ ...ex, file: { ...meta, ...done } });
      }
      // A copy in the owner's Google Drive (if connected) — after the reply, best effort.
      const lessonTitle = String(req.body?.lessonTitle || '').slice(0, 120);
      setImmediate(async () => { for (const r of results) await copyToDrive(uid, lessonId, lessonTitle, r.file); });
      return res.json({ results, store: await storeInfo() });
    } catch (e) {
      console.error('lesson file upload failed:', e?.message);
      return res.status(500).json({ error: 'ذخیره یا استخراجِ فایل ناموفق بود' });
    }
  });
});

lessonFilesRouter.get('/api/lesson-files/:lessonId', requireAuthIfConfigured, async (req, res) => {
  const list = await listLessonFiles(uidOf(req), lessonIdOf(req));
  res.json({ files: list.filter((f) => !f.removedAt), removed: list.filter((f) => f.removedAt).length, store: await storeInfo() });
});

lessonFilesRouter.get('/api/lesson-files/:lessonId/:fileId/raw', requireAuthIfConfigured, async (req, res) => {
  const list = await listLessonFiles(uidOf(req), lessonIdOf(req));
  const meta = list.find((f) => f.id === req.params.fileId);
  if (!meta) return res.status(404).json({ error: 'فایل پیدا نشد' });
  const bytes = await readLessonFile(meta.id);
  if (!bytes) return res.status(410).json({ error: 'بایت‌های فایل در دسترس نیست' });
  // The real type for media (so <audio>/<video> from the blob play everywhere);
  // anything else stays a plain download.
  const playable = /^(audio|video|image)\//.test(meta.type || '') || meta.type === 'application/pdf';
  res.setHeader('Content-Type', playable ? meta.type : 'application/octet-stream');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(meta.name)}`);
  return res.send(bytes);
});

lessonFilesRouter.get('/api/lesson-files/:lessonId/:fileId/extract', requireAuthIfConfigured, async (req, res) => {
  const list = await listLessonFiles(uidOf(req), lessonIdOf(req));
  const meta = list.find((f) => f.id === req.params.fileId);
  if (!meta) return res.status(404).json({ error: 'فایل پیدا نشد' });
  const extract = await readLessonExtract(meta.id);
  if (!extract) return res.status(404).json({ error: 'برای این فایل متنِ استخراج‌شده‌ای ذخیره نشده' });
  return res.json({ file: meta, extract });
});

lessonFilesRouter.post('/api/lesson-files/:lessonId/:fileId/remove', requireAuthIfConfigured, async (req, res) => {
  const f = await updateLessonFile(uidOf(req), lessonIdOf(req), String(req.params.fileId), (x) => { x.removedAt = new Date().toISOString(); });
  if (!f) return res.status(404).json({ error: 'فایل پیدا نشد' });
  return res.json({ file: f });
});

export default lessonFilesRouter;
