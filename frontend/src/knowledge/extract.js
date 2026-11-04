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

const clean = (s) => String(s || '').replace(/\*\*|__|`/g, '').replace(/\s+/g, ' ').trim();
const words = (s) => clean(s).split(' ').filter(Boolean).length;
const byLength = (term) => (words(term) <= 2 ? 'vocabulary' : 'phrases');
const ARABIC_SCRIPT = /[\u0600-\u06FF]/;

/** Local, exact extraction from tables and pair lines. */
export function extractLocal(text, { lessonTitle = '' } = {}) {
  const out = [];
  let heading = '';
  let header = null; // { arCol, faCol, hint }
  const lines = String(text || '').split('\n');
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { header = null; continue; }
    const h = line.match(/^#{1,6}\s+(.*)$/);
    if (h) { heading = h[1]; header = null; continue; }
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
          header = { arCol, faCol, hint: categoryFromHint(cells.join(' ')) };
          continue;
        }
        header = { arCol: -1, faCol: -1, hint: null };
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
      if (ar && fa) out.push({ term: ar, definition: fa, pronunciation: pron || '', category: header.hint || categoryFromHint(heading) || byLength(ar), from: 'table' });
      continue;
    }
    header = null;
    const parts = line.replace(/^[-*•\d.)\s]+/, '').split(/\s[=:]\s?|\s?[=:]\s|\s?=\\?>\s?/).map(clean).filter(Boolean);
    if (parts.length === 2) {
      const [a, b] = parts;
      const sa = langScore(a); const sb = langScore(b);
      const [ar, fa] = sa > sb && sb <= 0 ? [a, b] : sb > sa && sa <= 0 ? [b, a] : [null, null];
      if (ar && fa && ar.length <= 80 && fa.length <= 160) out.push({ term: ar, definition: fa, pronunciation: '', category: categoryFromHint(heading) || byLength(ar), from: 'line' });
    }
  }
  // de-duplicate inside the lesson
  const seen = new Set();
  return out.filter((c) => { const k = `${exactKey(c.term)}\u0000${exactKey(c.definition)}`; if (seen.has(k)) return false; seen.add(k); return true; })
    .map((c) => ({ ...c, source: lessonTitle ? `درس: ${lessonTitle}` : '' }));
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
      source: `درس: ${lesson.title}`, lessonId: lesson.id, extractedAt: new Date(now).toISOString(),
    }];
  });
  return next;
}
