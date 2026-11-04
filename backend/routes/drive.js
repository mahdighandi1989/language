/**
 * Purpose: /api/drive/* — owner-only Google Drive connection and copies of
 * lesson originals. Status/connect/disconnect/sync need the owner's Firebase
 * token; the OAuth callback is protected by the signed, short-lived state.
 * Uploads to Drive never block or fail a lesson upload (copy, best effort).
 * Upstream: services/drive/drive.js, services/lessonFiles/store.js.
 */
import { Router } from 'express';
import { resolveActor } from '../services/inspection/auth.js';
import * as drive from '../services/drive/drive.js';
import { listLessonFiles, readLessonFile, updateLessonFile } from '../services/lessonFiles/store.js';

export const driveRouter = Router();

const owner = async (req, res, next) => {
  try {
    const actor = await resolveActor(req);
    if (actor.role !== 'owner') return res.status(403).json({ error: 'فقط مالک می‌تواند Google Drive را وصل کند' });
    req.actor = actor;
    return next();
  } catch (e) {
    return res.status(e.status || 401).json({ error: e.message });
  }
};

driveRouter.get('/api/drive/status', owner, async (req, res) => res.json(await drive.status()));

driveRouter.post('/api/drive/connect', owner, (req, res) => {
  if (!drive.isConfigured()) return res.status(409).json({ error: 'متغیرهای Render کامل نیست', missing: drive.driveConfig().clientId ? [] : ['GOOGLE_OAUTH_CLIENT_ID'] });
  return res.json({ url: drive.authUrl(req.actor.uid) });
});

const back = (res, result, detail = '') => res.redirect(302, `/?drive=${result}${detail ? `&reason=${encodeURIComponent(detail.slice(0, 160))}` : ''}#/admin`);

driveRouter.get('/api/drive/callback', async (req, res) => {
  if (req.query.error) return back(res, 'denied', String(req.query.error));
  if (!drive.checkState(req.query.state)) return back(res, 'error', 'state نامعتبر یا منقضی — دوباره «اتصال» را بزنید');
  try {
    await drive.finishConnect(String(req.query.code || ''));
    return back(res, 'ok');
  } catch (e) {
    console.error('drive connect failed:', e.message);
    return back(res, 'error', e.message);
  }
});

driveRouter.post('/api/drive/disconnect', owner, async (req, res) => res.json({ disconnected: await drive.disconnect() }));

/** Copy one stored file to Drive and remember the link on its metadata. Never throws. */
export async function copyToDrive(uid, lessonId, lessonTitle, meta) {
  try {
    if (!drive.isConfigured() || !(await drive.readConnection())) return null;
    const bytes = await readLessonFile(meta.id);
    if (!bytes) return null;
    const folderId = await drive.lessonFolder(lessonId, lessonTitle);
    const up = await drive.uploadFile({ buffer: bytes, name: meta.name, mime: meta.type, folderId });
    await updateLessonFile(uid, lessonId, meta.id, (x) => { x.drive = { id: up.id, link: up.link, at: new Date().toISOString() }; delete x.driveError; });
    return up;
  } catch (e) {
    await updateLessonFile(uid, lessonId, meta.id, (x) => { x.driveError = String(e.message || e).slice(0, 200); }).catch(() => {});
    return null;
  }
}

/** «انتقالِ فایل‌های قبلی»: copy this lesson's stored files that have no Drive copy yet. */
driveRouter.post('/api/drive/sync/:lessonId', owner, async (req, res) => {
  if (!(await drive.readConnection())) return res.status(409).json({ error: 'Google Drive وصل نیست' });
  const lessonId = String(req.params.lessonId).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40);
  const title = String(req.body?.lessonTitle || '').slice(0, 120);
  const files = (await listLessonFiles(req.actor.uid, lessonId)).filter((f) => !f.removedAt && !f.drive);
  let copied = 0;
  for (const f of files) {
    // eslint-disable-next-line no-await-in-loop
    if (await copyToDrive(req.actor.uid, lessonId, title, f)) copied += 1;
  }
  return res.json({ copied, total: files.length });
});

export default driveRouter;
