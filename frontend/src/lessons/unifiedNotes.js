// Purpose: build ONE unified lesson handout from several extracted files, and
// keep corrections SEPARATE (pure, tested). Exact extractions are copied
// byte-for-byte; AI transcriptions carry their suspect-line marks. Nothing in
// the owner's existing notes is touched — the handout is APPENDED.

const METHOD = {
  exact: 'استخراجِ دقیق (بی‌هوشِ مصنوعی)',
  'ai-verified': 'رونویسیِ دوبار‌سنجیده',
  none: 'بی‌متن',
};
const fa = (n) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

export function methodLabel(r) {
  if (r.method === 'ai-verified') {
    return `${METHOD['ai-verified']} — توافقِ دو رونویسی ${fa(Math.round((r.agreement ?? 0) * 100))}٪${r.suspectCount ? `، ${fa(r.suspectCount)} سطرِ مشکوک (⚠️)` : ''}`;
  }
  return METHOD[r.method] || r.method;
}

/** Markdown of the unified handout (only files that yielded text). */
export function buildUnifiedNotes(results, now = new Date()) {
  const usable = (results || []).filter((r) => r.status === 'ok' && String(r.text || '').trim());
  if (!usable.length) return '';
  const head = `## 📥 جزوهٔ یکپارچه از ${fa(usable.length)} فایل — ${now.toLocaleDateString('fa-IR')}`;
  const parts = usable.map((r) => `### 📄 ${r.filename}\n> ${methodLabel(r)}\n\n${r.method === 'ai-verified' ? r.markedText : r.text}`);
  return `${head}\n\n${parts.join('\n\n')}`;
}

/** Append to existing notes without touching them. */
export function appendUnified(existing, unified) {
  if (!unified) return existing || '';
  return existing && existing.length ? `${existing}\n\n---\n${unified}` : unified;
}

/** Corrections to store on the lesson (separate list, capped). */
export function collectCorrections(results, existing = [], now = new Date(), cap = 1000) {
  const add = [];
  for (const r of results || []) {
    for (const c of r.corrections || []) add.push({ ...c, fileName: r.filename, at: now.toISOString() });
    for (const line of r.suspectLines || []) add.push({ quote: line, kind: 'مشکوک', issue: 'دو رونویسیِ مستقل این سطر را یکسان نخواندند — با اصلِ فایل مقایسه کنید', suggestion: '', verifiedQuote: true, fileName: r.filename, at: now.toISOString() });
  }
  return [...(existing || []), ...add].slice(-cap);
}
