// Purpose: pure logic of «تمرینِ تقلید (شادوینگ)»: pick the Lebanese/Arabic
// sentences of a lesson (verbatim, from tables and lines), record attempts and
// parse the AI's score. Upstream: lesson.archivedNotes. Downstream: Shadowing.jsx.

const ARABIC_ONLY = /[ً-ْةيكىإأؤئ]/; // harakat or letters Persian does not use
const PERSIAN_ONLY = /[پچژگکی]/;
const ARABIC_SCRIPT = /[؀-ۿ]/;

/** Is this text (mostly) Arabic rather than Persian? */
export function isArabicText(s) {
  const t = String(s || '').trim();
  if (!t || !ARABIC_SCRIPT.test(t)) return false;
  const words = t.split(/\s+/).filter((w) => ARABIC_SCRIPT.test(w));
  if (!words.length) return false;
  const arabic = words.filter((w) => ARABIC_ONLY.test(w) && !PERSIAN_ONLY.test(w)).length;
  const persian = words.filter((w) => PERSIAN_ONLY.test(w)).length;
  return arabic > 0 && arabic >= persian;
}

const clean = (s) => String(s || '').replace(/\*\*|__|~~|`/g, '').replace(/^[#>\-*\d.)\s]+/, '').replace(/\s+/g, ' ').trim();

/**
 * Practice sentences from the lesson text, in order, deduplicated. Table rows:
 * the first Arabic cell, with the first Persian cell as meaning. Other lines:
 * Arabic segments split on «:», «=», «—», « - » or parentheses.
 */
export function extractPracticeSentences(text, max = 300) {
  const out = [];
  const seen = new Set();
  const push = (arabic, meaning = '') => {
    const a = clean(arabic);
    if (a.length < 2 || a.length > 160 || !isArabicText(a) || seen.has(a)) return;
    seen.add(a);
    out.push({ text: a, meaning: clean(meaning).slice(0, 160) });
  };
  for (const raw of String(text || '').split('\n')) {
    if (out.length >= max) break;
    const line = raw.trim();
    if (!line || /^\|?\s*:?-{2,}/.test(line)) continue;
    if (line.startsWith('|')) {
      const cells = line.split('|').slice(1, -1).map((c) => c.trim());
      const ar = cells.find(isArabicText);
      const fa = cells.find((c) => c && c !== ar && !isArabicText(c) && ARABIC_SCRIPT.test(c));
      if (ar) push(ar, fa);
      continue;
    }
    const parts = line.split(/[:=—()«»]| - /).map((p) => p.trim()).filter(Boolean);
    const ar = parts.filter(isArabicText);
    const fa = parts.find((p) => !isArabicText(p) && ARABIC_SCRIPT.test(p));
    for (const a of ar) push(a, ar.length === 1 ? fa : '');
  }
  return out.slice(0, max);
}

export function sentenceKey(s) {
  let h = 0;
  for (const ch of String(s)) h = (h * 31 + ch.codePointAt(0)) >>> 0;
  return h.toString(36);
}

/** Record one scored attempt in data.shadowing[lessonId][key] (immutable). */
export function recordAttempt(shadowing = {}, lessonId, sentence, score, at = new Date().toISOString()) {
  const lid = String(lessonId);
  const key = sentenceKey(sentence);
  const lesson = { ...(shadowing[lid] || {}) };
  const prev = lesson[key] || { text: sentence, attempts: 0, best: 0 };
  const s = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
  lesson[key] = { text: sentence, attempts: prev.attempts + 1, best: Math.max(prev.best, s), last: s, at };
  return { ...shadowing, [lid]: lesson };
}

export function lessonShadowStats(shadowing = {}, lessonId, total) {
  const rows = Object.values(shadowing[String(lessonId)] || {});
  const mastered = rows.filter((r) => r.best >= 80).length;
  const avg = rows.length ? Math.round(rows.reduce((a, r) => a + r.best, 0) / rows.length) : 0;
  return { practiced: rows.length, mastered, avg, total };
}

/** Parse the model's JSON verdict; tolerant of code fences and bad fields. */
export function parseVerdict(raw) {
  let v = raw;
  if (typeof raw === 'string') {
    const m = raw.match(/\{[\s\S]*\}/);
    try { v = JSON.parse(m ? m[0] : raw); } catch { v = null; }
  }
  if (!v || typeof v !== 'object') return null;
  const score = Math.max(0, Math.min(100, Math.round(Number(v.score))));
  if (!Number.isFinite(score)) return null;
  return {
    score,
    heard: String(v.heard || v.transcript || ''),
    feedback: String(v.feedback || ''),
    issues: (Array.isArray(v.issues) ? v.issues : []).map((i) => (typeof i === 'string' ? { word: i, tip: '' } : { word: String(i?.word || ''), tip: String(i?.tip || '') })).filter((i) => i.word).slice(0, 10),
  };
}

export const VERDICT_SCHEMA = {
  type: 'OBJECT',
  properties: {
    score: { type: 'NUMBER' }, heard: { type: 'STRING' }, feedback: { type: 'STRING' },
    issues: { type: 'ARRAY', items: { type: 'OBJECT', properties: { word: { type: 'STRING' }, tip: { type: 'STRING' } } } },
  },
  required: ['score', 'heard', 'feedback'],
};

export function verdictPrompt(target) {
  return `زبان‌آموزِ فارسی‌زبان این جملهٔ لهجهٔ لبنانی را تقلید کرده است:\n«${target}»\n`
    + 'صدای پیوست را دقیق گوش کن. فقط تلفظ را بسنج (نه صدای شخص). خروجی JSON: '
    + 'score (۰ تا ۱۰۰؛ ۸۰+ یعنی قابلِ فهم برای لبنانی)، heard (آنچه واقعاً شنیدی به عربی)، '
    + 'feedback (یک یا دو جملهٔ فارسیِ کوتاه و مشخص)، issues (کلمه‌های مشکل‌دار با tip ِ فارسی). '
    + 'اگر صدا خالی یا نامفهوم بود score=0 و در feedback بگو.';
}
