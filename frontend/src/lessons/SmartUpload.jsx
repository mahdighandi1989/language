// Purpose: «آپلودِ هوشمند» on a lesson page — several files at once (audio,
// video, PDF, image, text, Word, Excel…). Every original is kept (download
// later); text is extracted EXACTLY or double-transcribed with suspect lines
// marked; possible اعراب/معنا issues go to a SEPARATE list. «افزودن به جزوه»
// APPENDS one unified handout — the existing notes are never rewritten.
// Upstream: POST /api/lesson-files/:lessonId, ./unifiedNotes.js, ./markdown.jsx.
import React, { useState } from 'react';
import { buildUnifiedNotes, appendUnified, collectCorrections, methodLabel } from './unifiedNotes.js';
import { MarkdownRenderer } from './markdown.jsx';

export default function SmartUpload({ lesson, updateLesson, fetchImpl = (...a) => fetch(...a) }) {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(null);
  const [review, setReview] = useState(true);
  const blocked = Boolean(lesson._bodyPending || lesson._bodyError);

  const run = async () => {
    setBusy(true); setError(null); setDone(null); setResults(null);
    try {
      const form = new FormData();
      files.forEach((f) => form.append('files', f, f.name));
      form.append('review', review ? '1' : '0');
      const res = await fetchImpl(`/api/lesson-files/${lesson.id}`, { method: 'POST', body: form });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `خطای ${res.status}`);
      setResults(body.results || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const unified = results ? buildUnifiedNotes(results) : '';
  const apply = () => {
    const stored = results.map((r) => ({ id: r.file.id, name: r.file.name, type: r.file.type, size: r.file.size, stored: true, method: r.method }));
    updateLesson(lesson.id, {
      archivedNotes: appendUnified(lesson.archivedNotes, unified),
      corrections: collectCorrections(results, lesson.corrections),
      files: [...(lesson.files || []), ...stored],
    });
    setDone(`جزوهٔ یکپارچه از ${results.length} فایل افزوده شد؛ اصلِ فایل‌ها نگه داشته شد.`);
    setResults(null);
    setFiles([]);
  };

  return (
    <section dir="rtl" className="bg-white p-6 rounded-2xl shadow-md space-y-3" data-testid="smart-upload">
      <h3 className="text-xl font-bold text-slate-800">📥 آپلودِ هوشمند (استخراجِ دقیق)</h3>
      <p className="text-xs text-slate-600">
        چند فایل با هم: صوت، ویدیو، PDF، عکس، متن، Word، Excel. اصلِ هر فایل نگه داشته می‌شود. Word/PDF ِ متنی/Excel <b>عیناً</b> و بی‌هوشِ مصنوعی
        استخراج می‌شوند؛ عکس/صوت/ویدیو/PDF ِ اسکن‌شده <b>دو بار مستقل</b> رونویسی و مقایسه می‌شوند و سطرهای ناهم‌خوان «⚠️ مشکوک» علامت می‌خورند.
        پیشنهادهای اعراب و معنا جدا نگه داشته می‌شوند و متن را عوض نمی‌کنند.
      </p>
      {/* Native picker text is in the browser's language («Choose Files») — a Persian label instead. */}
      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-teal-300 text-teal-700 bg-teal-50 hover:bg-teal-100 cursor-pointer text-sm font-medium">
        📎 انتخابِ فایل‌ها
        <input type="file" multiple aria-label="فایل‌های درس" accept="audio/*,video/*,image/*,application/pdf,text/*,.docx,.xlsx,.pptx,.odt,.ods,.odp,.epub,.zip,.srt,.vtt,.md,.csv,.json"
          onChange={(e) => setFiles(Array.from(e.target.files || []))} className="sr-only" />
      </label>
      {!files.length && <span className="text-xs text-slate-400 ms-2">فایلی انتخاب نشده</span>}
      {files.length > 0 && <p className="text-xs text-slate-500">{files.length} فایل: {files.map((f) => f.name).join('، ')}</p>}
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={review} onChange={(e) => setReview(e.target.checked)} /> بازبینیِ اعراب و معنا (فهرستِ جدا)
      </label>
      <button disabled={busy || !files.length || blocked} onClick={run} className="px-4 py-2 rounded-lg bg-teal-600 text-white disabled:bg-slate-300">
        {busy ? 'در حالِ استخراج و اعتبارسنجی… (ممکن است چند دقیقه طول بکشد)' : 'استخراجِ دقیق'}
      </button>
      {blocked && <p className="text-xs text-amber-700">متنِ این درس هنوز از فضای ابری بارگذاری نشده است.</p>}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {done && <p role="status" className="text-sm text-emerald-700">✅ {done}</p>}
      {results && (
        <div className="space-y-3" data-testid="smart-results">
          {results.map((r) => (
            <div key={r.file.id} className="border rounded-xl p-3 text-sm space-y-1">
              <div className="flex flex-wrap gap-2 items-center">
                <b>{r.filename}</b>
                <span className="text-xs text-slate-500">{methodLabel(r)}</span>
                {r.status !== 'ok' && <span className="text-xs text-red-600">{r.status === 'empty' ? 'بی‌متن' : r.status === 'failed' ? 'ناموفق' : 'بی‌استخراج'}</span>}
              </div>
              {r.notes?.map((n, i) => <p key={i} className="text-xs text-amber-700">{n}</p>)}
              {r.suspectLines?.length > 0 && <p className="text-xs text-amber-700">⚠️ {r.suspectLines.length} سطرِ مشکوک — در متن علامت خورده و در فهرستِ اصلاحات آمده.</p>}
              {r.corrections?.length > 0 && <p className="text-xs text-slate-600">{r.corrections.length} پیشنهادِ اعراب/معنا (جدا ذخیره می‌شود)</p>}
            </div>
          ))}
          {unified ? (
            <>
              <details className="border rounded-xl p-3"><summary className="cursor-pointer text-sm font-bold">پیش‌نمایشِ جزوهٔ یکپارچه</summary>
                <div className="max-h-96 overflow-y-auto mt-2"><MarkdownRenderer text={unified} /></div>
              </details>
              <button onClick={apply} className="px-4 py-2 rounded-lg bg-emerald-600 text-white">افزودن به جزوهٔ درس (متنِ فعلی دست نمی‌خورد)</button>
            </>
          ) : <p className="text-sm text-slate-500">از این فایل‌ها متنی به دست نیامد؛ اصلِ آن‌ها نگه داشته شده است.</p>}
        </div>
      )}
    </section>
  );
}

/** Separate section: corrections and warnings (diacritics / meaning / suspect lines). */
const KINDS = ['اعراب', 'معنا', 'املا', 'تلفظ', 'دیگر'];

/**
 * «اصلاحات و هشدارهای اعراب/معنا» — a separate section per lesson. Findings
 * from smart upload AND entries typed by the owner/reviewer; the lesson text
 * itself is never edited. Entries can be marked done (never silently deleted;
 * «حذف» needs a confirm). `onChange(nextCorrections)` saves (lesson.corrections).
 */
export function CorrectionsPanel({ corrections, onChange, lessonText = '', author = '' }) {
  const list = corrections || [];
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ quote: '', kind: 'اعراب', issue: '', suggestion: '' });
  const [filter, setFilter] = useState('open');
  const editable = typeof onChange === 'function';
  if (!list.length && !editable) return null;
  const shown = list.map((c, i) => ({ c, i })).filter(({ c }) => filter === 'all' || (filter === 'open' ? !c.resolved : c.resolved));
  const add = () => {
    if (!form.quote.trim() || !form.issue.trim()) return;
    const quote = form.quote.trim();
    onChange([...list, { ...form, quote, issue: form.issue.trim(), suggestion: form.suggestion.trim(), verifiedQuote: lessonText.includes(quote), source: 'manual', author, at: new Date().toISOString() }]);
    setForm({ quote: '', kind: form.kind, issue: '', suggestion: '' });
  };
  const patch = (i, p) => onChange(list.map((c, j) => (j === i ? { ...c, ...p } : c)));
  const remove = (i) => { if (window.confirm('این مورد از فهرستِ اصلاحات حذف شود؟')) onChange(list.filter((_, j) => j !== i)); };
  return (
    <section dir="rtl" className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-2" data-testid="corrections">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-bold text-amber-900">⚠️ اصلاحات و هشدارهای اعراب و معنا ({list.filter((c) => !c.resolved).length} باز از {list.length})</h3>
        <div className="flex gap-2 text-xs">
          {list.length > 0 && <select value={filter} onChange={(e) => setFilter(e.target.value)} className="p-1 border rounded" aria-label="فیلترِ اصلاحات"><option value="open">باز</option><option value="done">انجام‌شده</option><option value="all">همه</option></select>}
          {editable && <button onClick={() => setOpen((v) => !v)} className="px-2 py-1 rounded bg-amber-600 text-white">{open ? 'بستن' : '➕ افزودنِ مورد'}</button>}
        </div>
      </div>
      <p className="text-xs text-amber-800">پیشنهاد است، نه تغییر: متنِ جزوه دست‌نخورده می‌ماند. «نقلِ نایافته» یعنی این تکه عیناً در متن نبود — با احتیاط.</p>
      {open && editable && (
        <div className="bg-white rounded-lg p-3 space-y-2 text-sm">
          <input value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} placeholder="تکهٔ دقیقِ متن (همان‌طور که در جزوه است)" className="w-full p-2 border rounded" dir="auto" aria-label="تکهٔ متن" />
          <div className="flex gap-2">
            <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} className="p-2 border rounded" aria-label="نوع">{KINDS.map((k) => <option key={k}>{k}</option>)}</select>
            <input value={form.issue} onChange={(e) => setForm({ ...form, issue: e.target.value })} placeholder="مشکل چیست؟" className="flex-1 p-2 border rounded" aria-label="مشکل" />
          </div>
          <input value={form.suggestion} onChange={(e) => setForm({ ...form, suggestion: e.target.value })} placeholder="شکلِ درست (اختیاری)" className="w-full p-2 border rounded" dir="auto" aria-label="پیشنهاد" />
          {form.quote.trim() && !lessonText.includes(form.quote.trim()) && <p className="text-xs text-red-600">این تکه عیناً در متنِ درس پیدا نشد (با «نقلِ نایافته» ثبت می‌شود).</p>}
          <button onClick={add} disabled={!form.quote.trim() || !form.issue.trim()} className="px-4 py-1.5 rounded bg-amber-600 text-white disabled:opacity-50">ثبت</button>
        </div>
      )}
      <ul className="space-y-1 max-h-96 overflow-y-auto text-sm">
        {shown.map(({ c, i }) => (
          <li key={i} className={`bg-white rounded-lg p-2 flex items-start gap-2 ${c.resolved ? 'opacity-60' : ''}`}>
            <div className="flex-1 min-w-0">
              <span className="text-xs px-1.5 rounded bg-amber-100 text-amber-900 ml-1">{c.kind || 'هشدار'}</span>
              <span dir="auto" className="font-medium">«{c.quote}»</span>
              {c.verifiedQuote === false && <span className="text-xs text-red-600"> (نقلِ نایافته)</span>}
              <span className="text-slate-700"> — {c.issue}</span>
              {c.suggestion && <span dir="auto" className="text-emerald-800"> ⇐ {c.suggestion}</span>}
              {c.fileName && <span className="text-xs text-slate-400"> · {c.fileName}</span>}
              {c.source === 'manual' && <span className="text-xs text-slate-400"> · دستی{c.author ? ` (${c.author})` : ''}</span>}
            </div>
            {editable && (
              <div className="flex gap-1 shrink-0 text-xs">
                <button onClick={() => patch(i, { resolved: !c.resolved, resolvedAt: c.resolved ? null : new Date().toISOString() })} className="px-2 py-0.5 rounded bg-slate-100 hover:bg-emerald-100">{c.resolved ? '↩ باز' : '✓ انجام شد'}</button>
                <button onClick={() => remove(i)} className="px-2 py-0.5 rounded bg-slate-100 hover:bg-red-100 text-red-700" aria-label="حذفِ مورد">🗑️</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
