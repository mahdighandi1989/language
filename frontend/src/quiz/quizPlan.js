// Purpose: a quiz PLAN made locally before asking the model, so questions are
// spread and grounded:
//  • ~half of the questions come straight from the knowledge center — built here,
//    no AI (term ⇒ meaning, meaning ⇒ term), distractors are real items of the
//    same tab ⇒ no invented options;
//  • the rest is split over the chosen lessons (each lesson gets its share);
//  • a model question that mixes tenses («امر» … «یاد گرفتی») is dropped.
// Pure; rnd injectable. Upstream: quizSource.js. Downstream: QuizCenter (App.jsx).
import { lessonKnowledge } from './quizSource.js';
import { isArabicText } from '../shadowing/shadowing.js';

export const KB_SHARE = 0.5;

function shuffle(a, rnd) {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i -= 1) { const j = Math.floor(rnd() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; }
  return x;
}

/** Usable knowledge items: Lebanese term + meaning; the chosen lessons' own items first. */
export function knowledgePool(kb = {}, lessons = [], rnd = Math.random) {
  const ok = (i) => i?.term && i?.definition && String(i.term).length <= 60 && isArabicText(String(i.term)) && !isArabicText(String(i.definition));
  const own = lessons.flatMap((l) => lessonKnowledge(kb, l)).filter(ok);
  const ownTerms = new Set(own.map((i) => i.term));
  const all = [];
  for (const [category, items] of Object.entries(kb || {})) if (Array.isArray(items)) for (const i of items) if (ok(i) && !ownTerms.has(i.term)) all.push({ ...i, category });
  return [...shuffle(own, rnd), ...shuffle(all, rnd)];
}

/** How many questions from the knowledge center and from each lesson. */
export function planQuiz(n, lessons, pool) {
  const kbCount = pool.length >= 8 ? Math.min(pool.length, Math.max(1, Math.round(n * KB_SHARE))) : 0;
  const rest = n - kbCount;
  const slots = lessons.map((l) => ({ lesson: l, count: 0 }));
  for (let k = 0; k < rest && slots.length; k += 1) slots[k % slots.length].count += 1;
  return { kbCount, slots: slots.filter((s) => s.count > 0) };
}

/** Local multiple-choice questions from knowledge items (half each direction), distractors from the same tab. */
export function knowledgeQuestions(pool, count, rnd = Math.random) {
  const out = [];
  const meaningsBy = (cat) => [...new Set(pool.filter((p) => p.category === cat).map((p) => String(p.definition).trim()))];
  const allMeanings = [...new Set(pool.map((p) => String(p.definition).trim()))];
  const allTerms = [...new Set(pool.map((p) => String(p.term).trim()))];
  for (const it of pool) {
    if (out.length >= count) break;
    const term = String(it.term).trim();
    const meaning = String(it.definition).trim();
    const reverse = out.length % 2 === 1;
    if (!reverse) {
      let others = meaningsBy(it.category).filter((m) => m !== meaning);
      if (others.length < 3) others = allMeanings.filter((m) => m !== meaning);
      if (others.length < 3) continue;
      out.push({ type: 'mcq', question: `معنیِ «${term}» چیست؟`, options: shuffle([meaning, ...shuffle(others, rnd).slice(0, 3)], rnd), correctAnswer: meaning, explanation: `از مرکزِ دانش${it.source ? ` (${it.source})` : ''}`, source: 'knowledge' });
    } else {
      const others = allTerms.filter((t) => t !== term);
      if (others.length < 3) continue;
      out.push({ type: 'mcq', question: `«${meaning}» به لبنانی کدام است؟`, options: shuffle([term, ...shuffle(others, rnd).slice(0, 3)], rnd), correctAnswer: term, explanation: `از مرکزِ دانش${it.source ? ` (${it.source})` : ''}`, source: 'knowledge' });
    }
  }
  return out;
}

// «امر/مضارع/التزامی» asked for, but the Persian meaning in «…» is a past form (…تی، …دند) ⇒ contradictory.
const NON_PAST = /(امر|مضارع|التزامی|آینده|مستقبل)/;
const PERSIAN_PAST = /^(?!می|نمی|ب)[؀-ۿ‌\s]*?(تم|تی|ت|تیم|تید|تند|دم|دی|دیم|دید|دند|شد|شدم|شدی|شدند)$/;
export function isContradictory(q) {
  const text = String(q?.question || '');
  if (!NON_PAST.test(text)) return false;
  return [...text.matchAll(/«([^»]{2,40})»/g)].some((m) => {
    const fa = m[1].trim();
    if (isArabicText(fa)) return false;
    const verb = fa.split(/\s+/).pop();
    return PERSIAN_PAST.test(verb);
  });
}

/** Merge model + knowledge questions in a fair order (interleaved, not «all from one lesson»). */
export function mergeQuiz(modelQs, kbQs, n) {
  const clean = modelQs.filter((q) => !isContradictory(q));
  // The knowledge questions keep their planned share; model questions fill the rest.
  const k = Math.min(kbQs.length, n);
  const a = clean.slice(0, Math.max(0, n - k));
  kbQs = kbQs.slice(0, n - a.length);
  const out = [];
  let i = 0; let j = 0;
  while (out.length < n && (i < a.length || j < kbQs.length)) {
    if (i < a.length && (out.length % 2 === 0 || j >= kbQs.length)) out.push(a[i++]);
    else if (j < kbQs.length) out.push(kbQs[j++]);
  }
  return { quiz: out, dropped: modelQs.length - clean.length };
}
