// Purpose: «ایمپورتِ دسته‌ای درس» — admin only (rendered inside the admin panel).
// Steps: pick a JSON file → preview (lessons to add, already imported, title
// conflicts, characters, new/duplicate knowledge, size of the main document
// after the import) → «پشتیبان‌گیری و اعمال»: first a JSON backup of the CURRENT
// data is downloaded, then the lessons are merged in (pure applyImport) →
// result report. Nothing existing is overwritten or removed.
// Upstream: ./lessonImport.js, ./lessonBodies.js. Downstream: components/App.jsx (AdminPanel).
import React, { useState } from 'react';
import { planImport, applyImport, jsonBytes, MAIN_DOC_SOFT_LIMIT, IMPORT_FORMAT, IMPORT_VERSION } from './lessonImport.js';
import { toCloudDoc, bodyKeyFor } from './lessonBodies.js';

const fa = (n) => Number(n || 0).toLocaleString('fa-IR');

function readText(f) {
  if (typeof f.text === 'function') return f.text();
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsText(f, 'utf-8');
  });
}

export function downloadJson(obj, filename) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// `persist(data, onProgress)` (Firestore mode) resolves only after the backend
// acknowledged the write; the success report waits for it. Without it (local
// mode) the data is saved to this browser's storage by the app as before.
export default function LessonImportPanel({ data, setData, externalize = true, download = downloadJson, persist = null }) {
  const [plan, setPlan] = useState(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [mainBytes, setMainBytes] = useState(null);
  const [saving, setSaving] = useState(null); // { done, total } while writing to Firestore
  const [saveError, setSaveError] = useState(null);
  const [pendingResult, setPendingResult] = useState(null);

  const save = async (snapshot, summary) => {
    if (!persist) { setResult({ ...summary, where: 'local' }); return; }
    setSaving({ done: 0, total: 1 });
    setSaveError(null);
    setPendingResult(summary);
    try {
      await persist(snapshot, (p) => setSaving(p));
      setResult({ ...summary, where: 'cloud' });
      setPendingResult(null);
    } catch (err) {
      setSaveError(err?.message || String(err));
    } finally {
      setSaving(null);
    }
  };

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    setPlan(null); setResult(null); setError(null);
    if (!f) return;
    setFileName(f.name);
    try {
      const parsed = JSON.parse(await readText(f));
      const p = planImport(data, parsed);
      setPlan(p);
      if (p.valid) {
        const after = applyImport(data, p, { externalize, bodyKey: bodyKeyFor }).data;
        setMainBytes(jsonBytes(externalize ? toCloudDoc(after) : after));
      }
    } catch (err) {
      setError(`فایل خوانده نشد: ${err.message}`);
    }
  };

  const apply = () => {
    try {
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      download(data, `lessons-backup-before-import-${stamp}.json`);
      const out = applyImport(data, plan, { externalize, bodyKey: bodyKeyFor });
      setData(out.data);
      setPlan(null);
      save(out.data, { added: out.added, appended: out.appended, knowledgeAdded: out.knowledgeAdded, skipped: plan.already.length, conflicts: plan.conflicts.length });
    } catch (err) {
      setError(err.message);
    }
  };

  const tooBig = mainBytes != null && mainBytes > MAIN_DOC_SOFT_LIMIT;
  return (
    <section dir="rtl" className="bg-white rounded-2xl shadow-sm border p-4 space-y-3" data-testid="lesson-import">
      <h2 className="font-bold text-slate-800">📥 ایمپورتِ دسته‌ای درس (فقط مدیر)</h2>
      <p className="text-xs text-slate-600">
        فایلِ JSON با <code>format: "{IMPORT_FORMAT}"</code> و <code>version: {IMPORT_VERSION}</code>. ادغامی و تکرارناپذیر: درسی که
        sourceKey اش قبلاً آمده رد می‌شود؛ درس‌های موجود هرگز بازنویسی یا حذف نمی‌شوند. پیش از اعمال، پشتیبانِ JSON ِ وضعیتِ فعلی دانلود می‌شود.
      </p>
      <input type="file" accept=".json,application/json" onChange={onFile} className="text-sm" aria-label="فایلِ ایمپورت" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {plan && !plan.valid && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-800">
          <b>فایلِ «{fileName}» معتبر نیست ({fa(plan.errors.length)} خطا):</b>
          <ul className="list-disc ps-5 mt-1 max-h-48 overflow-y-auto">{plan.errors.slice(0, 50).map((e, i) => <li key={i}>{e}</li>)}</ul>
        </div>
      )}
      {plan?.valid && (
        <div className="bg-slate-50 rounded-xl p-3 text-sm space-y-1" data-testid="import-preview">
          <b>پیش‌نمایشِ «{fileName}»</b>
          <p>درس در فایل: {fa(plan.total)} · <span className="text-emerald-700">درسِ تازه: {fa(plan.toAdd.length)}</span> · <span className="text-sky-700">جزوه به درسِ موجود افزوده می‌شود: {fa(plan.appends.length)}</span> · قبلاً ایمپورت‌شده (رد): {fa(plan.already.length)} · درسِ موجودِ بارگذاری‌نشده (رد): {fa(plan.conflicts.length)}</p>
          <p>نویسه‌های متنِ درس‌های تازه: {fa(plan.chars)} · آیتمِ دانشِ تازه: {fa(plan.knowledgeNew)} · تکراری (رد): {fa(plan.knowledgeDup)}</p>
          {mainBytes != null && (
            <p className={tooBig ? 'text-red-700' : 'text-slate-600'}>
              حجمِ سندِ اصلی پس از ایمپورت: {fa(Math.round(mainBytes / 1024))}KB از سقفِ ۱۰۲۴KB
              {externalize ? ' (متنِ درس‌های تازه جدا ذخیره می‌شود)' : ''}{tooBig ? ' — بیش از حدِ امن؛ اعمال نمی‌شود' : ''}
            </p>
          )}
          {plan.appends.length > 0 && (
            <details open><summary className="text-sky-700 cursor-pointer">افزودن به درس‌های موجود ({fa(plan.appends.length)}) — متنِ قبلی، چت و دانششان دست نمی‌خورد؛ جزوه زیرِ «📥 جزوهٔ واردشده» به انتها اضافه می‌شود</summary>
              <ul className="list-disc ps-5">{plan.appends.map((c) => <li key={c.sourceKey}>{c.title} <span className="text-slate-400">({c.sourceKey} · {fa(c.archivedNotes.length)} نویسه)</span></li>)}</ul>
            </details>
          )}
          {plan.conflicts.length > 0 && (
            <details><summary className="text-amber-700 cursor-pointer">رد ({fa(plan.conflicts.length)}) — درسِ هم‌نامِ موجود هنوز از فضای ابری بارگذاری نشده؛ بعداً دوباره ایمپورت کنید</summary>
              <ul className="list-disc ps-5">{plan.conflicts.map((c) => <li key={c.sourceKey}>{c.title} <span className="text-slate-400">({c.sourceKey})</span></li>)}</ul>
            </details>
          )}
          {plan.already.length > 0 && (
            <details><summary className="cursor-pointer">قبلاً ایمپورت‌شده ({fa(plan.already.length)})</summary>
              <ul className="list-disc ps-5">{plan.already.map((c) => <li key={c.sourceKey}>{c.title}</li>)}</ul>
            </details>
          )}
          <button disabled={!(plan.toAdd.length + plan.appends.length) || tooBig} onClick={apply} className="mt-2 px-4 py-2 rounded-lg bg-teal-600 text-white disabled:bg-slate-300">
            پشتیبان‌گیری و اعمال ({fa(plan.toAdd.length + plan.appends.length)} درس)
          </button>
        </div>
      )}
      {saving && (
        <div role="status" className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-900">
          ⏳ در حالِ ذخیره در فضای ابری… {saving.total > 1 ? `(${fa(saving.done)} از ${fa(saving.total)})` : ''} — صفحه را نبندید و رفرش نکنید.
        </div>
      )}
      {saveError && (
        <div role="alert" className="bg-red-50 border border-red-300 rounded-xl p-3 text-sm text-red-800 space-y-2">
          <p>❌ ذخیره در فضای ابری ناموفق بود: {saveError}</p>
          <p>درس‌ها فعلاً فقط در همین صفحه‌اند (پشتیبانِ JSON هم دانلود شده). صفحه را نبندید و دوباره تلاش کنید.</p>
          <button onClick={() => save(data, pendingResult || {})} className="px-3 py-1.5 rounded-lg bg-red-600 text-white">تلاشِ دوباره برای ذخیره</button>
        </div>
      )}
      {result && (
        <div role="status" className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-900">
          ✅ {fa(result.added)} درسِ تازه، جزوه به {fa(result.appended)} درسِ موجود افزوده شد، {fa(result.knowledgeAdded)} آیتمِ دانش · رد: {fa(result.skipped)} تکراری، {fa(result.conflicts)} بارگذاری‌نشده.
          پشتیبان دانلود شد. {result.where === 'cloud' ? 'ذخیره در فضای ابری تأیید شد ✔ (Firestore پذیرفت).' : 'در حالتِ محلی در همین مرورگر ذخیره می‌شود.'}
        </div>
      )}
    </section>
  );
}
