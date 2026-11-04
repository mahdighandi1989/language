// Purpose: what text a quiz is built from. A lesson can be 100k+ characters and
// the whole course millions — sending it all made the request hang. Here:
// pick lessons (one, or the N most recent with content) and SAMPLE their text
// to a fixed budget, preferring lines that carry Arabic (tables, examples),
// randomly so a second quiz asks different things. Pure; rnd injectable.

export const QUIZ_CHAR_BUDGET = 12000;
export const QUIZ_MAX_QUESTIONS = 10;

const NOISE = /⚠️|\[مشکوک\]|\[ناخوانا\]|⟲|\[تکرار/;
const TS = /[[(]?\s*\d{1,2}:\d{2}(?::\d{2})?\s*(?:[-–—]\s*\d{1,2}:\d{2}(?::\d{2})?)?\s*[\])]?/g;
const META = /^\s*(>|---|\*\*روش|روش:|📎|منبع:|\(فایل:)/;

/**
 * Lesson text fit for questions: no suspect/unreadable/loop lines from AI
 * transcriptions, no timestamps or upload metadata, no repeated lines, no
 * runaway word repetition. Never written back — only what is sent to the model.
 */
export function cleanLine(raw) {
  if (NOISE.test(raw) || META.test(raw)) return '';
  const line = raw.replace(TS, ' ').replace(/\s+/g, ' ').trim();
  if (!line) return '';
  const words = line.split(' ');
  if (words.length >= 6 && new Set(words).size / words.length < 0.3) return ''; // «x x x x x x»
  return line;
}

export function cleanForQuiz(text) {
  const out = [];
  let prev = '';
  for (const raw of String(text || '').split('\n')) {
    const line = cleanLine(raw);
    if (!line || line === prev) continue;
    out.push(line); prev = line;
  }
  return out.join('\n');
}

// Cheap: only the first 20k characters are cleaned to decide.
const hasContent = (l) => String(l?.archivedNotes || '').length >= 50 && cleanForQuiz(String(l.archivedNotes).slice(0, 20000)).length >= 50;
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
    const raw = String(l.archivedNotes);
    const head = `### ${l.title}\n`;
    if (raw.length + head.length <= share) return head + cleanForQuiz(raw);
    // Big lesson: lines are cleaned lazily while sampling (fast), same rules.
    const lines = raw.split('\n').map((t, i) => ({ t, i })).filter((x) => x.t.trim() && x.t.length < share);
    // Random order; Lebanese/Arabic lines (vocabulary rows, examples) first,
    // other lines only to fill. Stops as soon as the share is full (fast even
    // for 190 lessons × thousands of lines).
    for (let k = lines.length - 1; k > 0; k -= 1) { const j = Math.floor(rnd() * (k + 1)); [lines[k], lines[j]] = [lines[j], lines[k]]; }
    const picked = [];
    const backup = [];
    let size = head.length;
    const seen = new Set();
    for (const x of lines) {
      if (size > share - 40) break;
      x.t = cleanLine(x.t);
      if (!x.t || seen.has(x.t)) continue;
      seen.add(x.t);
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
