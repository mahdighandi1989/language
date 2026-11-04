/**
 * Purpose: keep the ORIGINAL bytes of every file uploaded to a lesson, in the
 * same durable store as the inspection sheets (Firestore with the service
 * account, or the file store in development): blob `lessonfile-<id>`, and a
 * per-lesson index blob `lessonfiles-<uid>-<lessonId>` (JSON list of metadata).
 * Nothing is ever deleted: «removing» a file from a lesson sets `removedAt`.
 * Upstream: services/inspection/store.js (getInspectionStore). Downstream: routes/lessonFiles.js.
 */
import { getInspectionStore } from '../inspection/store.js';

const locks = new Map();
function lock(key, fn) {
  const tail = locks.get(key) || Promise.resolve();
  const run = tail.then(fn, fn);
  locks.set(key, run.catch(() => {}));
  return run;
}

const safe = (s) => String(s).replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 120);
const indexKey = (uid, lessonId) => `lessonfiles-${safe(uid)}-${safe(lessonId)}`;

export async function listLessonFiles(uid, lessonId) {
  const store = await getInspectionStore();
  const raw = await store.getBlob(indexKey(uid, lessonId));
  return raw ? JSON.parse(raw.toString('utf8')) : [];
}

export async function saveLessonFile(uid, lessonId, meta, buffer) {
  const store = await getInspectionStore();
  await store.putBlob(`lessonfile-${meta.id}`, buffer);
  return lock(indexKey(uid, lessonId), async () => {
    const list = await listLessonFiles(uid, lessonId);
    list.push(meta);
    await store.putBlob(indexKey(uid, lessonId), Buffer.from(JSON.stringify(list), 'utf8'));
    return meta;
  });
}

export async function updateLessonFile(uid, lessonId, fileId, mutate) {
  const store = await getInspectionStore();
  return lock(indexKey(uid, lessonId), async () => {
    const list = await listLessonFiles(uid, lessonId);
    const f = list.find((x) => x.id === fileId);
    if (!f) return null;
    mutate(f);
    await store.putBlob(indexKey(uid, lessonId), Buffer.from(JSON.stringify(list), 'utf8'));
    return f;
  });
}

export async function readLessonFile(fileId) {
  const store = await getInspectionStore();
  return store.getBlob(`lessonfile-${safe(fileId)}`);
}

/** The extraction result of a file (text, marked text, corrections, notes) — kept so a closed tab never loses it. */
export async function saveLessonExtract(fileId, extract) {
  const store = await getInspectionStore();
  await store.putBlob(`lessonfile-${safe(fileId)}-extract`, Buffer.from(JSON.stringify(extract), 'utf8'));
}

export async function readLessonExtract(fileId) {
  const store = await getInspectionStore();
  const raw = await store.getBlob(`lessonfile-${safe(fileId)}-extract`);
  return raw ? JSON.parse(raw.toString('utf8')) : null;
}

export async function storeInfo() {
  return (await getInspectionStore()).describe();
}
