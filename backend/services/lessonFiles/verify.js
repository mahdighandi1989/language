/**
 * Purpose: multi-pass verification of AI transcriptions (pure, tested).
 * Two independent verbatim transcriptions of the same file are aligned WORD by
 * word (LCS on normalised words; timestamps and line breaks ignored — the
 * passes segment sentences differently). Lines of pass 1 that pass 2 does not confirm
 * are SUSPECT; the agreement ratio says how much was confirmed. Exact
 * extractions (docx/pdf text/xlsx/…) never go through here — they are copied as is.
 */

// Any timestamp shape the two passes may use: [00:12], (0:12), 00:12 -, [00:01:23], [00:12 - 00:15], **[00:12]**.
const TIMESTAMP = /[[(]?\s*\d{1,2}:\d{2}(?::\d{2})?(?:[.,]\d+)?\s*(?:[-–—]\s*\d{1,2}:\d{2}(?::\d{2})?)?\s*[\])]?/g;

/** Normalise for comparison only: timestamps, diacritics, tatweel, ی/ي ک/ك, digits, spaces, punctuation. */
export function normLine(s) {
  return String(s ?? '')
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(TIMESTAMP, ' ')
    .replace(/[ً-ْٰـ]/g, '')
    .replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/[ىئ]/g, 'ی').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه')
    .replace(/[.,،؛;:!?؟«»"'()[\]\-–—*_#|…]/g, ' ')
    .replace(/\s+/g, ' ').trim().toLowerCase();
}

/** Similarity of two normalised lines in [0,1] (token overlap, order-insensitive). */
export function lineSimilarity(a, b) {
  const ta = a.split(' ').filter(Boolean);
  const tb = b.split(' ').filter(Boolean);
  if (!ta.length && !tb.length) return 1;
  if (!ta.length || !tb.length) return 0;
  const count = new Map();
  for (const t of tb) count.set(t, (count.get(t) || 0) + 1);
  let common = 0;
  for (const t of ta) if (count.get(t)) { common += 1; count.set(t, count.get(t) - 1); }
  return (2 * common) / (ta.length + tb.length);
}

/** Same word, allowing one-letter spelling noise in longer words (بدی/بدّي after normalising, etc.). */
function sameToken(x, y) {
  if (x === y) return true;
  if (x.length < 4 || y.length < 4 || Math.abs(x.length - y.length) > 1) return false;
  // edit distance ≤ 1
  let i = 0; let j = 0; let edits = 0;
  while (i < x.length && j < y.length) {
    if (x[i] === y[j]) { i += 1; j += 1; continue; }
    edits += 1;
    if (edits > 1) return false;
    if (x.length > y.length) i += 1; else if (y.length > x.length) j += 1; else { i += 1; j += 1; }
  }
  return edits + (x.length - i) + (y.length - j) <= 1;
}

/**
 * Word-level alignment of two token lists (LCS), done in overlapping windows so
 * an hour-long class stays fast. Returns a boolean array: was token i of A
 * matched in B (in order)? Line breaks and timestamps play no role — the two
 * passes may split sentences differently.
 */
export function alignTokens(A, B, { chunk = 400, slack = 400 } = {}) {
  const matched = new Array(A.length).fill(false);
  let p = 0; // B position (monotonic)
  for (let start = 0; start < A.length; start += chunk) {
    const a = A.slice(start, start + chunk);
    const expected = Math.round((start / Math.max(1, A.length)) * B.length);
    const from = Math.max(0, Math.min(p, expected) - 50);
    const b = B.slice(from, Math.min(B.length, Math.max(p, expected) + a.length + slack));
    const n = a.length; const m = b.length;
    if (!n || !m) continue;
    const dp = new Uint16Array((n + 1) * (m + 1));
    for (let i = n - 1; i >= 0; i -= 1) {
      for (let j = m - 1; j >= 0; j -= 1) {
        const k = i * (m + 1) + j;
        dp[k] = sameToken(a[i], b[j]) ? dp[k + m + 2] + 1 : Math.max(dp[k + m + 1], dp[k + 1]);
      }
    }
    let i = 0; let j = 0; let last = -1;
    while (i < n && j < m) {
      if (sameToken(a[i], b[j]) && dp[i * (m + 1) + j] === dp[(i + 1) * (m + 1) + j + 1] + 1) {
        matched[start + i] = true; last = j; i += 1; j += 1;
      } else if (dp[(i + 1) * (m + 1) + j] >= dp[i * (m + 1) + j + 1]) i += 1; else j += 1;
    }
    if (last >= 0) p = Math.max(p, from + last + 1);
  }
  return matched;
}

/**
 * Compare two transcriptions. Returns { lines: [{ text, confirmed, similarity }],
 * agreement, suspectCount }. Agreement = share of pass-1 WORDS that pass 2
 * also has, in order (timestamps and line breaks ignored). A line is suspect
 * only when a real part of it is not confirmed: fewer than `threshold` of its
 * words matched (a 1–3 word line must match fully).
 */
export function compareTranscripts(pass1, pass2, threshold = 0.7) {
  const a = String(pass1 ?? '').split('\n');
  const B = normLine(String(pass2 ?? '').replace(/\n/g, ' ')).split(' ').filter(Boolean);
  const perLine = a.map((text) => normLine(text).split(' ').filter(Boolean));
  const A = perLine.flat();
  const matched = alignTokens(A, B);
  let k = 0;
  const lines = a.map((text, li) => {
    const toks = perLine[li];
    if (!toks.length) return { text, confirmed: true, similarity: 1, blank: true };
    let ok = 0;
    for (let t = 0; t < toks.length; t += 1) if (matched[k + t]) ok += 1;
    k += toks.length;
    const sim = ok / toks.length;
    // Up to ~30% of a line's words may differ (fillers, spelling noise); a
    // 1–3 word line must match fully — there one word IS the meaning.
    const confirmed = toks.length - ok <= Math.floor(toks.length * (1 - threshold));
    return { text, confirmed, similarity: Math.round(sim * 100) / 100 };
  });
  const real = lines.filter((l) => !l.blank);
  const words = A.length;
  const ok = matched.filter(Boolean).length;
  return {
    lines,
    agreement: words ? Math.round((ok / words) * 100) / 100 : 1,
    suspectCount: real.filter((l) => !l.confirmed).length,
  };
}

/** Text with suspect lines marked, for the unified notes (only AI transcriptions). */
export function markSuspect(cmp) {
  return cmp.lines.map((l) => (l.blank || l.confirmed ? l.text : `⚠️ [مشکوک] ${l.text}`)).join('\n');
}
