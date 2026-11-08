// Purpose: «استخراجِ آیتمِ دانش از متنِ درس» — candidates for the knowledge
// center from a lesson's handout, WITHOUT changing the lesson:
//   1. local, exact: markdown tables (Arabic cell + Persian cell) and «X : Y» /
//      «X = Y» lines; the tab comes from the nearest heading / table header /
//      column names (فعل/verbs/صرف ⇒ افعال، صفت/adj ⇒ صفات، ضمیر ⇒ ضمایر،
//      اصطلاح/عبارت ⇒ اصطلاحات، گرامر/قاعده ⇒ گرامر), else by length;
//   2. optional Gemini pass (verified: a term must appear verbatim in the text);
//   3. duplicates against the knowledge center (same written term + meaning ⇒
//      «تکراری», same term other meaning ⇒ «موجود با معنیِ دیگر»).
// Pure. Upstream: lesson.archivedNotes. Downstream: KnowledgeExtract.jsx.
import { isArabicText, langScore } from '../shadowing/shadowing.js';
import { exactKey } from './review.js';

const CATEGORY_HINTS = [
  [/فعل|افعال|صرف|verb|conjug|ماضی|مضارع|امر/i, 'verbs'],
  [/صفت|صفات|adj/i, 'adjectives'],
  [/ضمیر|ضمایر|pronoun/i, 'pronouns'],
  [/اصطلاح|عبارت|جمله|phrase|expression|idiom/i, 'phrases'],
  [/گرامر|قاعده|grammar|نکته/i, 'grammar'],
  [/لغت|لغات|واژه|vocab|word|کلمه/i, 'vocabulary'],
];
export function categoryFromHint(text) {
  for (const [re, cat] of CATEGORY_HINTS) if (re.test(String(text || ''))) return cat;
  return null;
}

// The corrections/warnings part of a handout, in any form: a heading, a bold or
// short title line («⚠️ اصلاحات و هشدارهای پیشنهادی», «**اصلاحات**», «تصحیحات», «غلط‌نامه»…).
const CORRECTIONS_WORD = /اصلاح|هشدار|تصحیح|غلط‌?\s?نامه|غلط‌های|خطاهای|corrections?|warnings?|errata/i;
const CORRECTIONS_HEAD = /^(#{1,6}\s+.*|\*\*.*\*\*|⚠️.*)$/;
// A table header that describes problems, not vocabulary.
const CORRECTIONS_COLS = /مشکل|ایراد|پیشنهاد|اصلاح|نوعِ?\s*خطا|اطمینان|توضیحِ?\s*خطا|issue|suggestion|confidence/i;
const NOISE_LINE = /⚠️|\[مشکوک\]|\[ناخوانا\]|⟲|اطمینان\s*(کم|متوسط|بالا)/;
// A «meaning» that is really a review note (starts with, or is about, harakat/typos).
const NOTE_START = /^\s*(حرکت‌?\s?گذاری|اعراب|غلط|تایپ|اشتباه|املا|اصلاح|پیشنهاد|درست(ش)?\s|صحیح|نادرست|با ضمیر|باید)/;
const NOTE_WORDS = /غلط|اشتباه|باید\s|حرکت‌?گذاری|اعراب|تایپی|اطمینان|اصلاح|پیشنهاد|درستش|صحیح\s+آن|نادرست/;
// A grammar/usage explanation rather than a meaning.
const EXPLANATION = /(استفاده\s*می|به\s*کار\s*می|به‌کار\s*می|یعنی\s|فرق\s|تفاوت\s|برای\s+گفتن|توصیه|تکلیف|تمرین\s*کن)/;
export const MAX_ITEM_CHARS = 150;
const clean = (s) => String(s || '').replace(/\*\*|__|`/g, '').replace(/\s+/g, ' ').trim();
const words = (s) => clean(s).split(' ').filter(Boolean).length;
const byLength = (term) => (words(term) <= 2 ? 'vocabulary' : 'phrases');
const ARABIC_SCRIPT = /[\u0600-\u06FF]/;

/** Local, exact extraction from tables and pair lines. */
export function extractLocal(text, { lessonTitle = '' } = {}) {
  const out = [];
  let heading = '';
  let header = null; // { arCol, faCol, hint }
  // Example-sentence blocks (Arabic / transliteration / English / Persian) are read
  // first; their lines and «Note …» paragraphs (which wrap over several lines) are
  // then skipped by the line-by-line pass below.
  const pre = exampleBlocks(text);
  out.push(...pre.items.map(({ heading: _h, ...it }) => ({ ...it, category: 'phrases' }))); // example sentences ⇒ اصطلاحات/جمله‌ها
  const lines = String(text || '').split('\n').map((l, i) => (pre.used.has(i) ? '' : l));
  let skipping = false; // inside a «⚠️ اصلاحات و هشدارها» block
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { header = null; continue; }
    const h = line.match(/^#{1,6}\s+(.*)$/);
    // The corrections/warnings block (smart upload, review) is ABOUT the text, not
    // vocabulary: skip it up to the next heading or «---».
    const isTitle = CORRECTIONS_HEAD.test(line) || (line.length <= 60 && !/[|=:\t]/.test(raw));
    if (isTitle && CORRECTIONS_WORD.test(line)) { skipping = true; header = null; continue; }
    if (skipping) { if ((h && !CORRECTIONS_WORD.test(line)) || /^-{3,}$/.test(line)) skipping = false; else continue; }
    if (h) { heading = h[1]; header = null; continue; }
    if (NOISE_LINE.test(line)) continue;
    // A short title line without separators (PDF headings: «صفات», «verbs») sets the tab hint too.
    if (line.length <= 40 && !/[|=:\t]/.test(raw) && categoryFromHint(line)) { heading = line; header = null; continue; }
    // Markdown tables, and tab-separated rows (what PDF/Excel text extraction gives).
    if (line.startsWith('|') || raw.includes('\t')) {
      const cells = line.startsWith('|') ? line.split('|').slice(1, -1).map((c) => clean(c)) : raw.split('\t').map((c) => clean(c)).filter(Boolean);
      if (/^:?-{2,}/.test(cells[0] || '')) continue;
      if (!header) {
        // First row = header when it names columns (no Lebanese text in it) — remember the hint.
        const looksHeader = cells.every((c) => !isArabicText(c) || /عربی|لبنانی|فارسی|معنی/.test(c));
        if (looksHeader) {
          const arCol = cells.findIndex((c) => /عربی|لبنانی|arab|leb|فعل|صفت|ضمیر|لغت|کلمه|عبارت/i.test(c));
          const faCol = cells.findIndex((c) => /فارسی|معنی|ترجمه|persian|meaning/i.test(c));
          header = { arCol, faCol, hint: categoryFromHint(cells.join(' ')), skip: CORRECTIONS_COLS.test(cells.join(' ')), conj: conjugationColumns(cells) };
          if (header.conj) header.hint = 'verbs';
          continue;
        }
        header = { arCol: -1, faCol: -1, hint: null };
      }
      if (header.skip) continue; // a problems/suggestions table
      // Verb-conjugation table: ضمیر | ماضی | مضارع | امر … ⇒ one item per form.
      if (header.conj) {
        for (const item of conjugationRow(cells, header.conj, heading)) out.push({ ...item, from: 'conjugation', trusted: true });
        continue;
      }
      // Columns named in the header decide; otherwise the most Lebanese cell vs the
      // most Persian one (a bare word like «شاطر» is ambiguous on its own).
      const scripted = cells.filter((c) => ARABIC_SCRIPT.test(c));
      let ar = header.arCol >= 0 && ARABIC_SCRIPT.test(cells[header.arCol] || '') ? cells[header.arCol] : null;
      let fa = header.faCol >= 0 && ARABIC_SCRIPT.test(cells[header.faCol] || '') ? cells[header.faCol] : null;
      if (!ar || !fa) {
        const ranked = [...scripted].sort((x, y) => langScore(y) - langScore(x));
        if (!ar) ar = ranked.find((c) => c !== fa) || null;
        if (!fa) fa = [...ranked].reverse().find((c) => c !== ar) || null;
        if (ar && fa && !(langScore(ar) > langScore(fa) || header.arCol >= 0 || header.faCol >= 0)) { ar = null; fa = null; }
      }
      const pron = cells.find((c) => /^[A-Za-zāīūʿʾḥṣḍṭẓ'\s-]{2,}$/.test(c));
      if (ar && fa) out.push({ term: ar, definition: fa, pronunciation: pron || '', category: header.hint || categoryFromHint(heading) || byLength(ar), from: 'table', trusted: header.arCol >= 0 && header.faCol >= 0 });
      continue;
    }
    header = null;
    const parts = line.replace(/^[-*•\d.)\s]+/, '').split(/\s[=:]\s?|\s?[=:]\s|\s?=\\?>\s?/).map(clean).filter(Boolean);
    if (parts.length === 2) {
      const [a, b] = parts;
      const sa = langScore(a); const sb = langScore(b);
      const [ar, fa] = sa > sb && sb <= 0 ? [a, b] : sb > sa && sa <= 0 ? [b, a] : [null, null];
      // A term must be written in Arabic script («ymash-she = to walk…» is not one).
      if (ar && fa && ARABIC_SCRIPT.test(ar) && ARABIC_SCRIPT.test(fa) && ar.length <= 80 && fa.length <= 160) out.push({ term: ar, definition: fa, pronunciation: '', category: categoryFromHint(heading) || byLength(ar), from: 'line' });
    }
  }
  // «مبسوط ، فرحان» = two words, not a phrase: split (meanings pairwise when they split the same way).
  const split = [];
  for (const c of out) {
    const terms = c.term.split(/\s*[،,]\s*/).filter(Boolean);
    if (terms.length >= 2 && terms.every((t) => words(t) <= 2)) {
      const defs = c.definition.split(/\s*[،,]\s*/).filter(Boolean);
      terms.forEach((t, k) => split.push({ ...c, term: t, definition: defs.length === terms.length ? defs[k] : c.definition, category: c.category === 'phrases' ? 'vocabulary' : c.category }));
    } else split.push(c);
  }
  // de-duplicate inside the lesson; a «row» holding a whole table (pipes, very long) is not an item
  const seen = new Set();
  return split.filter((c) => !/\|/.test(c.term + c.definition) && c.term.length + c.definition.length <= MAX_ITEM_CHARS * 3).filter((c) => { const k = `${exactKey(c.term)}\u0000${exactKey(c.definition)}`; if (seen.has(k)) return false; seen.add(k); return true; })
    .map((c) => ({ ...c, source: lessonTitle ? `درس: ${lessonTitle}` : '' }));
}

// ---- verb-conjugation tables ----
const TENSES = [
  [/ماضی|گذشته|past|perfect/i, 'ماضی'],
  [/مضارع|حال|present|imperfect/i, 'مضارع'],
  [/امر|imperative/i, 'امر'],
  [/آینده|مستقبل|future/i, 'آینده'],
  [/اسم\s*فاعل|participle/i, 'اسمِ فاعل'],
  [/نهی|منفی|negative/i, 'نهی'],
];
const PRONOUNS = {
  'انا': 'من', 'أنا': 'من', 'إنتَ': 'تو (مذکر)', 'انتَ': 'تو (مذکر)', 'انت': 'تو', 'إنت': 'تو', 'إنتِ': 'تو (مؤنث)', 'انتِ': 'تو (مؤنث)', 'انتی': 'تو (مؤنث)', 'إنتي': 'تو (مؤنث)',
  'هو': 'او (مذکر)', 'هوّ': 'او (مذکر)', 'هي': 'او (مؤنث)', 'هی': 'او (مؤنث)', 'هيّ': 'او (مؤنث)', 'نحنا': 'ما', 'نحن': 'ما', 'إحنا': 'ما', 'انتو': 'شما', 'إنتو': 'شما', 'انتوا': 'شما',
  'هنّي': 'آن‌ها', 'هني': 'آن‌ها', 'هنی': 'آن‌ها', 'هم': 'آن‌ها', 'هن': 'آن‌ها',
};
/** Columns of a conjugation table: { pron, forms: [{ col, tense }], meaning } or null. */
export function conjugationColumns(cells) {
  const forms = [];
  cells.forEach((c, i) => { const t = TENSES.find(([re]) => re.test(c)); if (t) forms.push({ col: i, tense: t[1] }); });
  if (forms.length < 2) return null;
  const pron = cells.findIndex((c) => /ضمیر|شخص|pronoun|person/i.test(c));
  const meaning = cells.findIndex((c, i) => !forms.some((f) => f.col === i) && /فارسی|معنی|ترجمه|meaning/i.test(c));
  return { pron, forms, meaning };
}
/** The verb's meaning from the table's heading: «صرفِ فعلِ حبّ (دوست داشتن)», «حبّ = دوست داشتن». */
export function verbMeaningFromHeading(heading) {
  const h = String(heading || '');
  const m = h.match(/\(([^)]+)\)/) || h.match(/[:=–—-]\s*([^:=]+)$/);
  const cand = m ? m[1].trim() : '';
  return cand && langScore(cand) <= 0 ? cand : '';
}
function conjugationRow(cells, conj, heading) {
  const pronAr = conj.pron >= 0 ? cells[conj.pron] : '';
  const pronFa = PRONOUNS[pronAr.replace(/[\u064B-\u0652]/g, (x) => x)] || PRONOUNS[pronAr.replace(/[\u064B-\u0650\u0652]/g, '')] || (pronAr && langScore(pronAr) <= 0 ? pronAr : pronAr);
  const verb = verbMeaningFromHeading(heading);
  const rowMeaning = conj.meaning >= 0 ? cells[conj.meaning] : '';
  const out = [];
  for (const f of conj.forms) {
    const form = cells[f.col];
    if (!form || !ARABIC_SCRIPT.test(form) || form === '-' || form === '—') continue;
    const who = pronFa ? `«${pronFa}»` : '';
    const what = rowMeaning || verb;
    out.push({ term: form, definition: [`${f.tense}${who ? ` برای ${who}` : ''}`, what].filter(Boolean).join(' — '), pronunciation: '', category: 'verbs' });
  }
  return out;
}

// ---- example-sentence blocks (e.g. «VERBS in Lebanese»): Arabic / translit / English / Persian ----
const LATIN = /[A-Za-z]/;
const isLatinLine = (l) => LATIN.test(l) && !ARABIC_SCRIPT.test(l);
const isTranslit = (l) => isLatinLine(l) && (/[A-Za-z][2378]|[2378][A-Za-z]|-[a-z]|\b(3am|3a|el|il|ana|enta|enti|huwwe|hiyye|ne7na|nehna|ma|mesh|shu|ktir|bi|baddi|fi)\b|[āīūʿʾḥṣ]/i.test(l));
const isPersianLine = (l) => ARABIC_SCRIPT.test(l) && (langScore(l) < 0 || /[پچژگ]|\u200c/.test(l));
const isArabicLine = (l) => ARABIC_SCRIPT.test(l) && !isPersianLine(l);
const NOTE_START_LINE = /^\s*(note|notes|نکته|توجه|یادداشت)\b\s*[:：-]?/i;

/** Lines that form example blocks, and «Note …» paragraphs joined across wrapped lines. */
export function exampleBlocks(text) {
  const all = String(text || '').split('\n');
  const used = new Set();
  const items = [];
  const notes = [];
  // Notes: a «Note» line plus following lines until a blank line or a new block start.
  for (let i = 0; i < all.length; i += 1) {
    if (!NOTE_START_LINE.test(all[i].trim())) continue;
    const parts = [all[i].trim()];
    used.add(i);
    let j = i + 1;
    while (j < all.length && all[j].trim() && !isArabicLine(all[j].trim()) && !NOTE_START_LINE.test(all[j].trim()) && !/^#{1,6}\s/.test(all[j].trim())) { parts.push(all[j].trim()); used.add(j); j += 1; }
    notes.push(parts.join(' '));
    i = j - 1;
  }
  const idx = all.map((l, i) => ({ l: clean(l), i })).filter((x) => x.l && !used.has(x.i) && !x.l.startsWith('|'));
  let heading = '';
  for (let k = 0; k < idx.length; k += 1) {
    const h = idx[k].l.match(/^#{1,6}\s+(.*)$/);
    if (h) { heading = h[1]; continue; }
    // 4 lines: one Arabic, one Persian, two Latin (translit + English), in any order
    const w4 = idx.slice(k, k + 4);
    if (w4.length === 4 && consecutive(w4)) {
      const ar = w4.filter((x) => isArabicLine(x.l));
      const fa = w4.filter((x) => isPersianLine(x.l));
      const lat = w4.filter((x) => isLatinLine(x.l));
      if (ar.length === 1 && fa.length === 1 && lat.length === 2) {
        const tr = lat.find((x) => isTranslit(x.l)) || lat[0];
        const en = lat.find((x) => x !== tr);
        items.push({ term: ar[0].l, pronunciation: tr.l, english: en.l, definition: fa[0].l, from: 'block', trusted: true, heading });
        w4.forEach((x) => used.add(x.i));
        k += 3;
        continue;
      }
    }
    // 3 lines without the Arabic script: translit / English / Persian ⇒ shown, unticked
    const w3 = idx.slice(k, k + 3);
    if (w3.length === 3 && consecutive(w3)) {
      const fa = w3.filter((x) => isPersianLine(x.l));
      const lat = w3.filter((x) => isLatinLine(x.l));
      if (fa.length === 1 && lat.length === 2 && lat.some((x) => isTranslit(x.l))) {
        const tr = lat.find((x) => isTranslit(x.l));
        const en = lat.find((x) => x !== tr);
        items.push({ term: tr.l, pronunciation: tr.l, english: en.l, definition: fa[0].l, from: 'block-latin', heading });
        w3.forEach((x) => used.add(x.i));
        k += 2;
      }
    }
  }
  return { items, used, notes };
}
function consecutive(win) {
  // no blank-line gap inside the window (lines are adjacent in the original text)
  for (let t = 1; t < win.length; t += 1) if (win[t].i !== win[t - 1].i + 1) return false;
  return true;
}

export const CATEGORIES = ['vocabulary', 'phrases', 'verbs', 'adjectives', 'pronouns', 'grammar'];

/** Keep only AI items whose term is literally in the lesson text (anti-hallucination). */
export function verifyAiItems(items, text) {
  const hay = exactKey(text);
  return (Array.isArray(items) ? items : [])
    .filter((i) => i && i.term && i.definition)
    .map((i) => ({ term: clean(i.term), definition: clean(i.definition), pronunciation: clean(i.pronunciation || ''), category: CATEGORIES.includes(i.category) ? i.category : byLength(i.term), from: 'ai' }))
    .filter((i) => ARABIC_SCRIPT.test(i.term) && langScore(i.term) >= 0 && hay.includes(exactKey(i.term)));
}

/** Mark candidates against the knowledge center: 'new' | 'duplicate' | 'other-meaning'. */
export function markAgainstKb(cands, kb = {}) {
  const exact = new Set();
  const terms = new Map();
  for (const items of Object.values(kb || {})) if (Array.isArray(items)) for (const i of items) {
    if (!i?.term) continue;
    exact.add(`${exactKey(i.term)}\u0000${exactKey(i.definition)}`);
    terms.set(exactKey(i.term), i.definition);
  }
  return cands.map((c) => {
    const k = exactKey(c.term);
    const status = exact.has(`${k}\u0000${exactKey(c.definition)}`) ? 'duplicate' : terms.has(k) ? 'other-meaning' : 'new';
    return { ...c, status, existing: status === 'other-meaning' ? terms.get(k) : undefined };
  });
}

/** Merge local + AI candidates (local first; AI adds what local missed). */
export function mergeCandidates(local, ai) {
  const seen = new Set(local.map((c) => exactKey(c.term)));
  return [...local, ...ai.filter((c) => !seen.has(exactKey(c.term)))];
}

/** Add the chosen candidates to the knowledge base (immutable), with the lesson reference. */
export function addToKb(kb = {}, chosen, lesson, now = Date.now()) {
  const next = { ...kb };
  chosen.forEach((c, i) => {
    const cat = CATEGORIES.includes(c.category) ? c.category : 'vocabulary';
    next[cat] = [...(next[cat] || []), {
      id: `${now}-${i}`, term: c.term, definition: c.definition,
      ...(c.pronunciation ? { pronunciation: c.pronunciation } : {}),
      ...(c.english ? { english: c.english } : {}),
      source: `درس: ${lesson.title}`, lessonId: lesson.id, extractedAt: new Date(now).toISOString(),
    }];
  });
  return next;
}

/**
 * Conservative auto-tick: Lebanese/Arabic on the left (Arabic-only letters,
 * harakat or a positive score, ≤ 6 words) and a Persian meaning on the right
 * that is not a review note. Everything else is shown but unticked, with why.
 */
export function quality(c) {
  const term = String(c.term || '');
  const def = String(c.definition || '');
  const arabicMarks = /[\u064B-\u0652يكةىإأ]/.test(term);
  if (term.length > MAX_ITEM_CHARS || def.length > MAX_ITEM_CHARS) return { ok: false, reason: 'بیش از ۱۵۰ نویسه' };
  if (words(term) > 6) return { ok: false, reason: 'سمتِ چپ جملهٔ بلند است' };
  if (NOTE_START.test(def)) return { ok: false, reason: 'معنی یادداشتِ اعراب/املاست' };
  if (EXPLANATION.test(term) || (EXPLANATION.test(def) && words(def) > 5)) return { ok: false, reason: 'توضیح/توصیه است نه معنی' };
  // A table whose header names the Arabic and the Persian column is trusted for
  // bare words («زعلان»); a loose «X : Y» line needs positive evidence.
  const lebanese = arabicMarks || langScore(term) > 0 || (c.trusted && langScore(term) >= 0 && !/[پچژگ]/.test(term));
  if (!lebanese) return { ok: false, reason: 'سمتِ چپ عربی/لبنانی به نظر نمی‌رسد' };
  if (NOTE_WORDS.test(def)) return { ok: false, reason: 'معنی شبیهِ یادداشتِ اصلاح است' };
  if (langScore(def) > 0 && !/[پچژگ]/.test(def)) return { ok: false, reason: 'معنی فارسی به نظر نمی‌رسد' };
  if (words(def) > 14) return { ok: false, reason: 'معنی بیش از حد بلند است' };
  return { ok: true, reason: '', warn: spellingDoubt(def) };
}

/**
 * The original is kept as written, but a Persian meaning typed with Arabic
 * letters (ي ك ة) or with a letter Persian rarely puts there is shown as doubtful.
 */
// Common Persian words written with غ / with ع — a word that becomes one of them
// when ع↔غ is swapped is most likely a typo («عافلگیر» ⇒ «غافلگیر»). Cheap, no dictionary.
const GHAIN_WORDS = ['غافلگیر', 'غافل', 'غذا', 'غمگین', 'غم', 'غریب', 'غلط', 'غیر', 'غایب', 'غیب', 'غرور', 'غصه', 'غروب', 'غرب', 'غار', 'غول', 'غریبه', 'غرق', 'غنی', 'غوغا', 'غلتیدن', 'غر', 'باغ', 'دروغ', 'شلوغ', 'چراغ', 'مرغ', 'تیغ', 'سراغ', 'جیغ', 'داغ', 'دماغ', 'روغن', 'لغت', 'مغز', 'آغاز', 'آغوش', 'تبلیغ', 'دریغ', 'بلوغ', 'چاق', 'شغل', 'مشغول', 'بغل', 'تغییر', 'فراغت', 'یغما'];
const AIN_WORDS = ['عادت', 'علم', 'عشق', 'عصبانی', 'عجیب', 'عزیز', 'عکس', 'عمو', 'عمه', 'عید', 'عروس', 'عروسی', 'عقب', 'عصر', 'عمر', 'عجله', 'عوض', 'عالی', 'عیب', 'علت', 'عذر', 'عهد', 'عصا', 'جمع', 'شمع', 'نوع', 'شروع', 'ممنوع', 'موقع', 'واقعا', 'معنی', 'معلم', 'تعطیل', 'بعد', 'بعدا', 'جعبه', 'دعوا', 'دعوت', 'ساعت', 'شعر', 'طعم', 'قطعه', 'لعنت', 'مبلغ'];
const GHAIN_SET = new Set(GHAIN_WORDS);
const AIN_SET = new Set(AIN_WORDS);
const normFa = (w) => w.replace(/[ي]/g, 'ی').replace(/[ك]/g, 'ک').replace(/[ً-ْ‌]/g, '').replace(/[.,،:;!؟?()«»"]/g, '');

/**
 * The original is kept as written, but a meaning that looks mistyped is shown
 * as doubtful: ع written for غ (or the reverse) in a common Persian word, or a
 * Persian meaning typed with Arabic letters (ي ك ة).
 */
export function spellingDoubt(def) {
  const d = String(def || '');
  for (const raw of d.split(/\s+/)) {
    const w = normFa(raw);
    if (w.length < 2) continue;
    // whole word, or a known word as the start (compound: «غافلگیر» in «غافلگیرشده»)
    const swapToGhain = w.replace(/ع/g, 'غ');
    if (w.includes('ع') && !AIN_SET.has(w) && (GHAIN_SET.has(swapToGhain) || GHAIN_WORDS.some((g) => g.length >= 4 && swapToGhain.startsWith(g) && !w.startsWith(g)))) return `املای معنی مشکوک: «${raw}» احتمالاً «${raw.replace(/ع/g, 'غ')}» (ع به‌جای غ)`;
    const swapToAin = w.replace(/غ/g, 'ع');
    if (w.includes('غ') && !GHAIN_SET.has(w) && AIN_SET.has(swapToAin)) return `املای معنی مشکوک: «${raw}» احتمالاً «${raw.replace(/غ/g, 'ع')}» (غ به‌جای ع)`;
  }
  if (/[يكة]/.test(d) && /[پچژگی]|‌/.test(d + 'ی')) return 'املای معنی مشکوک (حرفِ عربی در متنِ فارسی)';
  return '';
}
