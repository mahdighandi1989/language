// Purpose: what text a quiz is built from. A lesson can be 100k+ characters and
// the whole course millions — sending it all made the request hang. Here:
// pick lessons (one, or the N most recent with content) and SAMPLE their text
// to a fixed budget, preferring lines that carry Arabic (tables, examples),
// randomly so a second quiz asks different things. Pure; rnd injectable.

export const QUIZ_CHAR_BUDGET = 24000;
const hasContent = (l) => String(l?.archivedNotes || '').trim().length >= 50;
const when = (l) => Date.parse(l?.updatedAt || l?.createdAt || '') || 0;

/** The N most recently created/updated lessons that have text (ties: later in the list first). */
export function recentLessons(lessons = [], n = 5) {
  return lessons
    .map((l, i) => ({ l, i }))
    .filter(({ l }) => hasContent(l))
    .sort((a, b) => when(b.l) - when(a.l) || b.i - a.i)
    .slice(0, n)
    .map(({ l }) => l);
}

import { isArabicText } from "../shadowing/shadowing.js";

/** Lebanese/Arabic content (tables, examples) — not just any Arabic-script (Persian) line. */
const lebanese = (t) => t.split("|").some((c) => isArabicText(c));

/**
 * Sample lines from the lessons' texts up to `budget` characters, keeping
 * original order inside each lesson and giving every lesson a fair share.
 */
export function sampleLessonText(lessons, budget = QUIZ_CHAR_BUDGET, rnd = Math.random) {
  const usable = lessons.filter(hasContent);
  if (!usable.length) return '';
  const share = Math.floor(budget / usable.length);
  const parts = usable.map((l) => {
    const text = String(l.archivedNotes);
    const head = `### ${l.title}\n`;
    if (text.length + head.length <= share) return head + text;
    const lines = text.split('\n').map((t, i) => ({ t, i })).filter((x) => x.t.trim() && x.t.length < share);
    // Random order; Lebanese/Arabic lines (vocabulary rows, examples) first,
    // other lines only to fill. Stops as soon as the share is full (fast even
    // for 190 lessons × thousands of lines).
    for (let k = lines.length - 1; k > 0; k -= 1) { const j = Math.floor(rnd() * (k + 1)); [lines[k], lines[j]] = [lines[j], lines[k]]; }
    const picked = [];
    const backup = [];
    let size = head.length;
    for (const x of lines) {
      if (size > share - 40) break;
      if (lebanese(x.t)) { if (size + x.t.length + 1 <= share) { picked.push(x); size += x.t.length + 1; } } else if (backup.length < 200) backup.push(x);
    }
    for (const x of backup) {
      if (size > share - 40) break;
      if (size + x.t.length + 1 <= share) { picked.push(x); size += x.t.length + 1; }
    }
    picked.sort((a, b) => a.i - b.i);
    return head + picked.map((x) => x.t).join('\n');
  });
  return parts.join('\n\n');
}
