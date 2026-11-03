// Purpose: keep the main Firestore user document under its 1 MiB cap. The long
// text (archivedNotes) of an imported lesson lives in its own documents:
//   artifacts/{appId}/users/{uid}/lessonBodies/{key}            { chunks, chars, hash, updatedAt }
//   artifacts/{appId}/users/{uid}/lessonBodies/{key}/chunks/{i} { i, text }
// written with ONE batch (atomic: head + all chunks), read back after sign-in.
// In memory the lesson carries its full text again, so every feature that reads
// archivedNotes keeps working; only the CLOUD form of the main document holds a
// stub (archivedNotes '' + bodyRef). Existing inline lessons are not touched.
//
// Transient fields start with «_» (_bodyPending, _bodyError) and are never saved.
// Rules: covered by match /artifacts/{appId}/users/{uid}/{document=**}.

export const BODY_CHUNK_CHARS = 250000; // ≤ ~750 KB UTF-8 per chunk document

/** FNV-1a 32-bit + length: cheap change detection, not security. */
export function textHash(s) {
  const str = String(s ?? '');
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return `${h.toString(16)}-${str.length}`;
}

export function chunkText(text, size = BODY_CHUNK_CHARS) {
  const s = String(text ?? '');
  if (!s) return [''];
  const out = [];
  for (let i = 0; i < s.length; i += size) out.push(s.slice(i, i + size));
  return out;
}

export function bodyKeyFor(lesson) {
  return `L${String(lesson.id).replace(/[^A-Za-z0-9_-]/g, '_')}`;
}

/** A lesson whose body is in memory (and therefore may be written). */
export function bodyLoaded(lesson) {
  return Boolean(lesson?.bodyRef) && !lesson._bodyPending && !lesson._bodyError;
}

function stripTransient(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) if (!k.startsWith('_')) out[k] = v;
  return out;
}

/** The main document as it is written to Firestore (bodies replaced by refs). */
export function toCloudDoc(data) {
  const lessons = (data.lessons || []).map((l) => {
    if (!l.bodyRef) return stripTransient(l);
    const base = stripTransient(l);
    if (bodyLoaded(l)) {
      const text = String(l.archivedNotes ?? '');
      return { ...base, archivedNotes: '', bodyRef: { key: l.bodyRef.key, chars: text.length, hash: textHash(text) } };
    }
    return { ...base, archivedNotes: '' }; // not in memory: keep the stored ref as is
  });
  return { ...data, lessons };
}

/** Loaded lessons whose text differs from what is known to be stored. */
export function bodiesToWrite(data, persistedHashes) {
  return (data.lessons || []).filter((l) => bodyLoaded(l) && textHash(l.archivedNotes) !== persistedHashes.get(l.bodyRef.key));
}

/**
 * After a snapshot: put cached bodies back; lessons whose body is not cached
 * (or changed elsewhere) become _bodyPending and must be fetched.
 */
export function mergeCachedBodies(lessons, cache) {
  return (lessons || []).map((l) => {
    if (!l.bodyRef) return l;
    const hit = cache.get(l.bodyRef.key);
    if (hit && (!l.bodyRef.hash || hit.hash === l.bodyRef.hash)) return { ...l, archivedNotes: hit.text };
    return { ...l, archivedNotes: '', _bodyPending: true };
  });
}

/** Firestore I/O with injected SDK functions ({ doc, getDoc, getDocs, collection, writeBatch }). */
export function createBodyStore(fs, db, basePath) {
  const head = (key) => fs.doc(db, `${basePath}/lessonBodies/${key}`);
  return {
    async write(key, text) {
      const parts = chunkText(text);
      const batch = fs.writeBatch(db);
      parts.forEach((t, i) => batch.set(fs.doc(db, `${basePath}/lessonBodies/${key}/chunks/${String(i).padStart(4, '0')}`), { i, text: t }));
      const hash = textHash(text);
      batch.set(head(key), { chunks: parts.length, chars: String(text ?? '').length, hash, updatedAt: new Date().toISOString() });
      await batch.commit();
      return hash;
    },
    async read(key) {
      const h = await fs.getDoc(head(key));
      if (!h.exists()) throw new Error('متنِ این درس در فضای ابری پیدا نشد');
      const { chunks, hash } = h.data();
      const parts = [];
      for (let i = 0; i < chunks; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        const c = await fs.getDoc(fs.doc(db, `${basePath}/lessonBodies/${key}/chunks/${String(i).padStart(4, '0')}`));
        if (!c.exists()) throw new Error(`تکهٔ ${i + 1} از ${chunks} ِ متنِ درس پیدا نشد`);
        parts.push(c.data().text || '');
      }
      const text = parts.join('');
      if (textHash(text) !== hash) throw new Error('متنِ خوانده‌شده با نشانهٔ ذخیره نمی‌خواند');
      return { text, hash };
    },
  };
}
