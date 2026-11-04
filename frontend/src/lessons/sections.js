// Purpose: keep the main user document far below Firestore's 1 MiB cap. Like
// lesson bodies (./lessonBodies.js), the big shared parts of the data live in
// their own chunked documents, stored as JSON text:
//   artifacts/{appId}/users/{uid}/lessonBodies/S_<name>  (+ chunks/{i})
// and the main document only keeps `sectionRefs: { <name>: { key, chars, hash } }`.
// In memory nothing changes: data.knowledgeBase etc. are full objects again.
//
// Safety rules (data is sacred):
//   • a section that has not been loaded yet (`_sectionsPending`) is NEVER
//     written — its stored ref is kept, so an empty default can't overwrite it;
//   • edits made while a section was still loading are MERGED into it when it
//     arrives (union; never a blind replace);
//   • a legacy document (sections inline) is migrated on the next save, in one
//     atomic batch (sections + main without them) — a backup copy is written first.
import { textHash } from './lessonBodies.js';
import { serializeForSync } from '../storage/sync.js';

export const SECTIONS = ['knowledgeBase', 'chatHistories', 'archivedConversations', 'journal', 'pronunciationCorrections', 'culturalInsights', 'kbReview', 'kbMergeLog', 'shadowing', 'studyPlan', 'lessonExtras'];
// «lessonExtras» is virtual: derived from the lessons (lessonBodies.lessonExtrasOf), applied back by applyLessonExtras.
export const sectionKey = (name) => `S_${name}`;
export const DOC_LIMIT_BYTES = 1048576;

// Same object ⇒ same text (state updates are immutable): no re-stringify of
// an unchanged 800 KB knowledge base on every save check.
const textMemo = new WeakMap();
export function sectionText(value) {
  if (value && typeof value === 'object') {
    const hit = textMemo.get(value);
    if (hit !== undefined) return hit;
    const t = serializeForSync(value) ?? 'null';
    textMemo.set(value, t);
    return t;
  }
  return JSON.stringify(value ?? null);
}

/** Main-document form: sections replaced by refs (pending ones keep their stored ref). */
export function sectionsToCloud(doc, data) {
  const pending = new Set(data._sectionsPending || []);
  const stored = data.sectionRefs || {};
  const refs = {};
  const out = { ...doc };
  for (const name of SECTIONS) {
    delete out[name];
    if (pending.has(name)) { if (stored[name]) refs[name] = stored[name]; continue; }
    if (data[name] === undefined) { if (stored[name]) refs[name] = stored[name]; continue; }
    const text = sectionText(data[name]);
    refs[name] = { key: sectionKey(name), chars: text.length, hash: textHash(text) };
  }
  out.sectionRefs = refs;
  for (const k of Object.keys(out)) if (k.startsWith('_')) delete out[k];
  return out;
}

/** Loaded sections whose text differs from what is stored — as «bodies» for writeCloudDoc. */
export function sectionsToWrite(data, persistedHashes) {
  const pending = new Set(data._sectionsPending || []);
  const out = [];
  for (const name of SECTIONS) {
    if (pending.has(name) || data[name] === undefined) continue;
    const text = sectionText(data[name]);
    const key = sectionKey(name);
    if (textHash(text) !== persistedHashes.get(key)) out.push({ bodyRef: { key }, archivedNotes: text, section: name });
  }
  return out;
}

const idOf = (x) => (x && typeof x === 'object' && x.id != null ? `id:${x.id}` : `j:${JSON.stringify(x)}`);
function unionArray(a = [], b = []) {
  const seen = new Set(a.map(idOf));
  return [...a, ...b.filter((x) => !seen.has(idOf(x)))];
}

/**
 * The stored section arrived; `local` is what memory had meanwhile (the
 * default, or edits made while loading, or an inline copy written by an older
 * tab). Never loses either side: arrays are unioned by id, the knowledge base
 * per tab, maps key by key (local wins only for keys it actually has).
 */
export function mergeSection(name, stored, local, defaults) {
  if (local === undefined || serializeForSync(local) === serializeForSync(defaults)) return stored;
  if (stored == null) return local;
  if (Array.isArray(stored) && Array.isArray(local)) return unionArray(stored, local);
  if (name === 'knowledgeBase' && typeof stored === 'object' && typeof local === 'object') {
    const out = { ...stored };
    for (const [cat, items] of Object.entries(local)) out[cat] = Array.isArray(items) && Array.isArray(out[cat]) ? unionArray(out[cat], items) : (out[cat] ?? items);
    return out;
  }
  if (typeof stored === 'object' && typeof local === 'object') return { ...stored, ...local };
  return local;
}

/** Does this (legacy) document still carry sections inline? */
export function hasInlineSections(raw, defaults) {
  return SECTIONS.filter((n) => n !== 'lessonExtras').some((n) => raw[n] !== undefined && serializeForSync(raw[n]) !== serializeForSync(defaults[n]) && !(raw.sectionRefs || {})[n]);
}

const utf8 = (s) => (typeof TextEncoder !== 'undefined' ? new TextEncoder().encode(String(s)).length : String(s).length * 3);

/** Size of the main document as written, and of each section — for the admin gauge. */
export function docUsage(cloudDoc, data) {
  const bytes = utf8(serializeForSync(cloudDoc) || '') + 64;
  const parts = {};
  for (const [k, v] of Object.entries(cloudDoc)) parts[k] = utf8(serializeForSync(v) || '');
  const sections = {};
  for (const name of SECTIONS) if (data[name] !== undefined) sections[name] = utf8(sectionText(data[name]));
  return { bytes, limit: DOC_LIMIT_BYTES, ratio: bytes / DOC_LIMIT_BYTES, parts, sections };
}

const unionBy = (a = [], b = []) => {
  const key = (x) => (x && typeof x === 'object' ? (x.id != null ? `id:${x.id}` : JSON.stringify(x)) : String(x));
  const seen = new Set(a.map(key));
  return [...a, ...b.filter((x) => !seen.has(key(x)))];
};

/**
 * Put the stored lesson extras back on the lessons. A field the lesson got
 * meanwhile (edit while loading) is kept: arrays are unioned, other values: local wins.
 */
export function applyLessonExtras(lessons = [], extras = {}) {
  return lessons.map((l) => {
    const e = extras?.[String(l.id)];
    if (!e) return l;
    const next = { ...l };
    for (const [f, v] of Object.entries(e)) {
      const local = l[f];
      if (local === undefined || local === null || local === '' || (Array.isArray(local) && !local.length)) next[f] = v;
      else if (Array.isArray(local) && Array.isArray(v)) next[f] = unionBy(v, local);
    }
    return next;
  });
}

/** Legacy lessons that still carry long inline text or heavy extras in the main document. */
export function hasInlineLessonData(raw, inlineMax = 1000, fields = ['pendingAnalysis', 'corrections', 'mediaItems', 'sources']) {
  return (raw?.lessons || []).some((l) => (!l.bodyRef && String(l.archivedNotes ?? '').length > inlineMax) || fields.some((f) => l[f] !== undefined && !(Array.isArray(l[f]) && !l[f].length) && l[f] !== '' && l[f] !== null));
}

/** Per-field totals over all lessons in the main document — what fills it. */
export function lessonFieldUsage(cloudLessons = []) {
  const totals = {};
  const perLesson = [];
  for (const l of cloudLessons) {
    let size = 0;
    for (const [k, v] of Object.entries(l)) { const b = utf8(serializeForSync(v) || ''); totals[k] = (totals[k] || 0) + b; size += b; }
    perLesson.push({ id: l.id, title: l.title, bytes: size });
  }
  perLesson.sort((a, b) => b.bytes - a.bytes);
  return { totals, top: perLesson.slice(0, 5), count: cloudLessons.length, avg: cloudLessons.length ? Math.round(perLesson.reduce((n, x) => n + x.bytes, 0) / cloudLessons.length) : 0 };
}
