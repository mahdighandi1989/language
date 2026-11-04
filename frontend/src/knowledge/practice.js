// Purpose: practice straight from the knowledge center, without AI —
// Leitner flashcards (5 boxes; due dates in data.kbReview, keyed per item) and a
// quick multiple-choice quiz (term ⇒ meaning, distractors from the same tab).
const BOX_DAYS = [0, 1, 3, 7, 16, 35];

export const reviewKey = (category, item) => `${category}:${item.id ?? item.term}`;

export function allItems(kb = {}, categories = null) {
  const out = [];
  for (const [category, items] of Object.entries(kb)) {
    if (!Array.isArray(items) || (categories && !categories.includes(category))) continue;
    for (const item of items) if (item?.term && item?.definition) out.push({ category, item, key: reviewKey(category, item) });
  }
  return out;
}

/** Cards due now (new cards included), oldest due first, capped. */
export function dueCards(kb, review = {}, { now = Date.now(), limit = 20, categories = null } = {}) {
  return allItems(kb, categories)
    .map((c) => ({ ...c, state: review[c.key] || { box: 0, due: 0 } }))
    .filter((c) => (c.state.due || 0) <= now)
    .sort((a, b) => (a.state.due || 0) - (b.state.due || 0) || a.state.box - b.state.box)
    .slice(0, limit);
}

/** Grade a card: known ⇒ next box, else back to box 1. */
export function gradeCard(review = {}, key, known, now = Date.now()) {
  const prev = review[key] || { box: 0, due: 0, seen: 0 };
  const box = known ? Math.min(5, (prev.box || 0) + 1) : 1;
  return { ...review, [key]: { box, due: now + BOX_DAYS[box] * 86400000, seen: (prev.seen || 0) + 1, last: known ? 'known' : 'again' } };
}

function shuffle(arr, rnd) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/** n MCQ questions (term ⇒ meaning) with 3 distinct distractors each. */
export function buildQuiz(kb, { n = 10, categories = null, rnd = Math.random } = {}) {
  const pool = allItems(kb, categories);
  const meanings = [...new Set(pool.map((p) => String(p.item.definition).trim()))];
  if (meanings.length < 4) return [];
  return shuffle(pool, rnd).slice(0, n).map((p) => {
    const correct = String(p.item.definition).trim();
    const sameTab = meanings.filter((m) => m !== correct && pool.some((q) => q.category === p.category && String(q.item.definition).trim() === m));
    const others = shuffle(sameTab.length >= 3 ? sameTab : meanings.filter((m) => m !== correct), rnd).slice(0, 3);
    return { key: p.key, category: p.category, term: p.item.term, correct, options: shuffle([correct, ...others], rnd) };
  });
}
