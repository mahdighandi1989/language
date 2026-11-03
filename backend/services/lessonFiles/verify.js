/**
 * Purpose: multi-pass verification of AI transcriptions (pure, tested).
 * Two independent verbatim transcriptions of the same file are compared line by
 * line (LCS on normalised lines). Lines of pass 1 that pass 2 does not confirm
 * are SUSPECT; the agreement ratio says how much was confirmed. Exact
 * extractions (docx/pdf text/xlsx/…) never go through here — they are copied as is.
 */

/** Normalise for comparison only: diacritics, tatweel, ی/ي ک/ك, digits, spaces, punctuation. */
export function normLine(s) {
  return String(s ?? '')
    .replace(/[ً-ْٰـ]/g, '')
    .replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/[ىئ]/g, 'ی').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه')
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/\[[0-9:.\s]+\]/g, '') // timestamps like [00:12]
    .replace(/[.,،؛;:!?؟«»"'()\-–—*_#|]/g, ' ')
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

/**
 * Compare two transcriptions. Returns { lines: [{ text, confirmed, similarity }],
 * agreement, suspectCount }. A line is confirmed when the best match in pass 2
 * (searched in order, LCS-style window) reaches `threshold`.
 */
export function compareTranscripts(pass1, pass2, threshold = 0.8) {
  const a = String(pass1 ?? '').split('\n');
  const bNorm = String(pass2 ?? '').split('\n').map(normLine).filter(Boolean);
  let j = 0;
  const lines = a.map((text) => {
    const n = normLine(text);
    if (!n) return { text, confirmed: true, similarity: 1, blank: true };
    let best = 0;
    let bestAt = -1;
    for (let k = j; k < Math.min(bNorm.length, j + 8); k += 1) {
      const sim = lineSimilarity(n, bNorm[k]);
      if (sim > best) { best = sim; bestAt = k; }
    }
    if (best >= threshold) j = bestAt + 1;
    return { text, confirmed: best >= threshold, similarity: Math.round(best * 100) / 100 };
  });
  const real = lines.filter((l) => !l.blank);
  const confirmed = real.filter((l) => l.confirmed).length;
  return {
    lines,
    agreement: real.length ? Math.round((confirmed / real.length) * 100) / 100 : 1,
    suspectCount: real.length - confirmed,
  };
}

/** Text with suspect lines marked, for the unified notes (only AI transcriptions). */
export function markSuspect(cmp) {
  return cmp.lines.map((l) => (l.blank || l.confirmed ? l.text : `⚠️ [مشکوک] ${l.text}`)).join('\n');
}
