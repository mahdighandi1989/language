// Purpose: pure logic of «تمرینِ تقلید (شادوینگ)»: pick the Lebanese/Arabic
// sentences of a lesson (verbatim, from tables and lines), record attempts and
// parse the AI's score. Upstream: lesson.archivedNotes. Downstream: Shadowing.jsx.

// Real notes type Lebanese with a PERSIAN keyboard (ی، ک): those letters are
// neutral. Only پ چ ژ گ are truly Persian. The decision is a word-level score:
// Lebanese/Arabic function words and Arabic-only marks vs Persian ones.
const ARABIC_SCRIPT = /[\u0600-\u06FF]/;
const HARAKAT = /[\u064B-\u0652]/;
const ARABIC_LETTERS = /[ةىإأؤئ]/;
const PERSIAN_LETTERS = /[پچژگ]/;
const norm = (w) => w.replace(/[\u064B-\u0652\u0640]/g, '').replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/[؟?!.,،؛:«»"'()]/g, '');
const AR_WORDS = new Set('عم بد بدی بدک بدو بدا بدکن ما مش هو هی هنی انا انتی انت انتو نحنا لیش شو شی هیک هیدا هیدی هیدول هون هونیک کتیر کمان علی عل ع فی فیک فیکی فیو فیا مع معک عند عندی عندک عندا عندو کان کنت رح یا بس لما وین ایمتی قدیش کیف کیفک کیفیک منیح حلو حلوه هلق هلا یلا بکرا مبارح ولا لا ایه اکید متل عشان مشان بتحب بحب بعرف بدی تروح یروح روح تعا جیب جابت ازا بیکون یکون'.split(' '));
const FA_WORDS = new Set('می نمی است هست نیست را رو که این اون آن داره دارد دارم داری کرد کردم کردن کنید میکنه میکنی میکنم شد شدن شده برای با از به در تا هم یک یه خیلی چه چرا چی کجا وقتی اگر باید نباید میشود میشه بود بودن خود خودم من تو ما شما او ایشان آنها اینجوری باهات بهت بهش ازم دلم'.split(' '));

/** >0 Lebanese/Arabic, <0 Persian, 0 unknown. */
export function langScore(s) {
  const t = String(s || '');
  if (!ARABIC_SCRIPT.test(t)) return 0;
  let score = 0;
  // Harakat count, except a word-final kasra: that is the Persian ezafe (توضیحِ فارسیِ).
  if (HARAKAT.test(t.replace(/\u0650(?=[\s،,.:؛!؟?)\]|]|$)/g, ''))) score += 1;
  if (ARABIC_LETTERS.test(t)) score += 2;
  if (PERSIAN_LETTERS.test(t)) score -= 3;
  if (/\u200c/.test(t)) score -= 2; // ZWNJ (نیم‌فاصله) is Persian typing
  for (const raw of t.split(/\s+/)) {
    const w = norm(raw);
    if (!w) continue;
    if (AR_WORDS.has(w)) score += 1;
    // A word written with Arabic-only letters or harakat (مَيّ «water») is not the
    // Persian word it normalises to (می).
    const arabicForm = /[\u064B-\u0652يكةى]/.test(raw);
    if (FA_WORDS.has(w) && !arabicForm) score -= 1.5;
    if (/^(می|نمی)[^\s]{2,}/.test(w) && !arabicForm) score -= 1.5;
    if (/^ال[^\s]{2,}/.test(w)) score += 1;
  }
  return score;
}

/** Is this text (mostly) Lebanese/Arabic rather than Persian? */
export function isArabicText(s) {
  return langScore(s) > 0;
}

const clean = (s) => String(s || '').replace(/\*\*|__|~~|`/g, '').replace(/^[#>\-*\d.)\s]+/, '').replace(/\s+/g, ' ').trim();

/**
 * Practice sentences from the lesson text, in order, deduplicated. Table rows:
 * the first Arabic cell, with the first Persian cell as meaning. Other lines:
 * Arabic segments split on «:», «=», «—», « - » or parentheses.
 */
// «[0:15]», «[00:00]», «[1:02:03]», «(0:15)», «0:15 -» at the start of a line.
export const LEADING_TIMESTAMP = /^[[(]?\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*[\])]?\s*[-–—:]?\s*/;

/** A sentence without its leading timestamp (also used before TTS / scoring). */
export function stripTimestamp(s) {
  return String(s || '').trim().replace(LEADING_TIMESTAMP, '').trim();
}

export function extractPracticeSentences(text, max = 300) {
  const out = [];
  const seen = new Set();
  let time = '';
  const push = (arabic, meaning = '') => {
    const a = clean(arabic);
    if (a.length < 2 || a.length > 160 || !isArabicText(a) || seen.has(a)) return;
    seen.add(a);
    out.push({ text: a, meaning: clean(meaning).slice(0, 160), ...(time ? { time } : {}) });
  };
  for (const raw of String(text || '').split('\n')) {
    if (out.length >= max) break;
    // Transcript lines: «[00:00] الحمد لله.» — the timestamp is only a label (kept apart),
    // never part of the sentence shown, spoken by the teacher or compared. Taken off
    // BEFORE splitting on «:». Suspect/unreadable lines are not practice material.
    if (/⚠️|\[مشکوک\]|\[ناخوانا\]|⟲/.test(raw)) continue;
    const ts = raw.trim().match(LEADING_TIMESTAMP);
    time = ts ? ts[1] : '';
    const line = ts ? raw.trim().slice(ts[0].length).trim() : raw.trim();
    if (!line || /^\|?\s*:?-{2,}/.test(line)) continue;
    if (line.startsWith('|')) {
      const cells = line.split('|').slice(1, -1).map((c) => c.trim());
      const ar = cells.find(isArabicText);
      const fa = cells.find((c) => c && c !== ar && !isArabicText(c) && ARABIC_SCRIPT.test(c));
      if (ar) push(ar, fa);
      continue;
    }
    // «X = Y» / «X : Y»: the notes put Lebanese on one side, Persian on the
    // other — take the more Lebanese side, the other as its meaning.
    const pair = line.split(/\s[=:]\s?|\s?[=:]\s|\s?=\\?>\s?|\s[–—-]{1,2}\s/).map((p) => p.trim()).filter(Boolean);
    if (pair.length >= 2) {
      const scored = pair.map((p) => ({ p, s: langScore(p) }));
      const best = scored.reduce((a, b) => (b.s > a.s ? b : a));
      const meaning = scored.filter((x) => x !== best && x.s < best.s && x.s <= 0).map((x) => x.p).join(' — ');
      if (best.s > 0 && best.s > Math.min(...scored.map((x) => x.s))) push(best.p, meaning);
      continue;
    }
    if (isArabicText(line)) push(line);
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
