// Purpose: what part of a LONG lesson goes to Gemini with each chat message.
// Short notes (≤ maxChars) go whole, as before. Long ones (a 50k-char episode)
// are cut into sections (headings / blank lines); the opening section is always
// kept, then the sections that best match the recent conversation, in their
// ORIGINAL order, verbatim, until the budget — never a rewritten summary.
// Omitted stretches are marked «[…]». Pure, tested.
import { searchKey } from './sortLessons.js';

function sections(text) {
  const parts = String(text).split(/\n(?=#{1,6}\s)|\n\s*\n/);
  return parts.map((t) => t.trim()).filter(Boolean);
}

function tokens(s) {
  return new Set(searchKey(s).split(/[^\p{L}\p{N}]+/u).filter((w) => w.length > 1));
}

export function lessonContextExcerpt(notes, query = '', maxChars = 16000) {
  const text = String(notes ?? '');
  if (text.length <= maxChars) return text;
  const secs = sections(text);
  const q = tokens(query);
  const scored = secs.map((t, i) => {
    let score = 0;
    if (q.size) for (const w of tokens(t)) if (q.has(w)) score += 1;
    return { i, t, score };
  });
  const keep = new Set([0]);
  let used = Math.min(secs[0]?.length || 0, maxChars);
  const ranked = [...scored].sort((a, b) => b.score - a.score || a.i - b.i);
  for (const s of ranked) {
    if (keep.has(s.i)) continue;
    if (used + s.t.length + 4 > maxChars) continue;
    keep.add(s.i);
    used += s.t.length + 4;
  }
  const out = [];
  let prev = -1;
  for (const i of [...keep].sort((a, b) => a - b)) {
    if (i !== prev + 1) out.push('[…]');
    out.push(i === 0 ? secs[0].slice(0, maxChars) : secs[i]);
    prev = i;
  }
  if (prev !== secs.length - 1) out.push('[…]');
  return out.join('\n\n');
}
