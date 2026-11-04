/**
 * Purpose: detect and collapse a model «repetition loop» in a transcription —
 * the same word/phrase or line emitted hundreds of times (e.g. «اماراتیه» ×480).
 * Real speech repeats a little («لا لا لا»); a loop repeats far more. Rules:
 *   • 3+ identical consecutive LINES      ⇒ one line + a marker
 *   • a 1–6 word phrase repeated 5+ times in a row (inside or across lines) ⇒ once + marker
 * Comparison uses normLine (harakat/timestamps ignored); output keeps the
 * original words. Pure. Upstream: pipeline.js. Downstream: verify.js compare.
 */
import { normLine } from './verify.js';

export const MARK = (n) => `⟲ [تکرارِ ماشینی حذف شد ×${n}]`;

function collapseTokens(tokens, minReps = 5, maxN = 6) {
  const norm = tokens.map((t) => normLine(t));
  const out = [];
  const runs = [];
  let i = 0;
  while (i < tokens.length) {
    let done = false;
    for (let n = 1; n <= maxN && i + n * minReps <= tokens.length; n += 1) {
      const unit = norm.slice(i, i + n);
      if (unit.some((u) => !u)) continue;
      let reps = 1;
      while (i + (reps + 1) * n <= tokens.length && unit.every((u, k) => norm[i + reps * n + k] === u)) reps += 1;
      if (reps >= minReps) {
        out.push(...tokens.slice(i, i + n), MARK(reps));
        runs.push({ unit: tokens.slice(i, i + n).join(' '), times: reps });
        i += reps * n;
        done = true;
        break;
      }
    }
    if (!done) { out.push(tokens[i]); i += 1; }
  }
  return { tokens: out, runs };
}

export function collapseRepeats(text) {
  const lines = String(text ?? '').split('\n');
  const runs = [];
  // 1) whole-line loops
  const kept = [];
  for (let i = 0; i < lines.length;) {
    const n = normLine(lines[i]);
    let j = i + 1;
    while (n && j < lines.length && normLine(lines[j]) === n) j += 1;
    if (n && j - i >= 3) {
      kept.push(lines[i], MARK(j - i));
      runs.push({ unit: lines[i].trim(), times: j - i });
    } else kept.push(...lines.slice(i, j));
    i = j;
  }
  // 2) phrase loops inside lines
  const out = kept.map((line) => {
    if (line.startsWith('⟲')) return line;
    const toks = line.split(/(\s+)/); // keep spacing
    const words = toks.filter((t, k) => k % 2 === 0);
    if (words.length < 5) return line;
    const r = collapseTokens(words);
    if (!r.runs.length) return line;
    runs.push(...r.runs);
    return r.tokens.join(' ');
  });
  // 3) phrase loops spread one-word-per-line across lines (e.g. 480 lines «اماراتیه» already caught by 1)
  const removed = runs.reduce((a, r) => a + r.times - 1, 0);
  return { text: out.join('\n'), runs, removed };
}

/** Share of the text taken by loops (0..1) — high means the transcription is unusable as is. */
export function loopShare(original, collapsed) {
  const a = String(original || '').length;
  return a ? Math.max(0, (a - String(collapsed || '').length) / a) : 0;
}
