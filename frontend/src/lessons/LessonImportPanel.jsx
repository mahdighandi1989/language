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

export default function LessonImportPanel({ data, setData, externalize = true, download = downloadJson }) {
  const [plan, setPlan] = useState(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [mainBytes, setMainBytes] = useState(null);

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
      setResult({ added: out.added, knowledgeAdded: out.knowledgeAdded, skipped: plan.already.length, conflicts: plan.conflicts.length });
      setPlan(null);
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
          <p>درس در فایل: {fa(plan.total)} · <span className="text-emerald-700">افزوده می‌شود: {fa(plan.toAdd.length)}</span> · قبلاً ایمپورت‌شده (رد): {fa(plan.already.length)} · تداخلِ عنوان (رد): {fa(plan.conflicts.length)}</p>
          <p>نویسه‌های متنِ درس‌های تازه: {fa(plan.chars)} · آیتمِ دانشِ تازه: {fa(plan.knowledgeNew)} · تکراری (رد): {fa(plan.knowledgeDup)}</p>
          {mainBytes != null && (
            <p className={tooBig ? 'text-red-700' : 'text-slate-600'}>
              حجمِ سندِ اصلی پس از ایمپورت: {fa(Math.round(mainBytes / 1024))}KB از سقفِ ۱۰۲۴KB
              {externalize ? ' (متنِ درس‌های تازه جدا ذخیره می‌شود)' : ''}{tooBig ? ' — بیش از حدِ امن؛ اعمال نمی‌شود' : ''}
            </p>
          )}
          {plan.conflicts.length > 0 && (
            <details><summary className="text-amber-700 cursor-pointer">تداخل‌ها ({fa(plan.conflicts.length)}) — درسی با همین عنوان هست؛ دست نمی‌خورد</summary>
              <ul className="list-disc ps-5">{plan.conflicts.map((c) => <li key={c.sourceKey}>{c.title} <span className="text-slate-400">({c.sourceKey})</span></li>)}</ul>
            </details>
          )}
          {plan.already.length > 0 && (
            <details><summary className="cursor-pointer">قبلاً ایمپورت‌شده ({fa(plan.already.length)})</summary>
              <ul className="list-disc ps-5">{plan.already.map((c) => <li key={c.sourceKey}>{c.title}</li>)}</ul>
            </details>
          )}
          <button disabled={!plan.toAdd.length || tooBig} onClick={apply} className="mt-2 px-4 py-2 rounded-lg bg-teal-600 text-white disabled:bg-slate-300">
            پشتیبان‌گیری و اعمال ({fa(plan.toAdd.length)} درس)
          </button>
        </div>
      )}
      {result && (
        <div role="status" className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-900">
          ✅ {fa(result.added)} درس و {fa(result.knowledgeAdded)} آیتمِ دانش افزوده شد · رد: {fa(result.skipped)} تکراری، {fa(result.conflicts)} تداخل.
          پشتیبان دانلود شد. ذخیره در فضای ابری چند ثانیه طول می‌کشد (اگر خطایی رخ دهد، بنرِ قرمز بالای صفحه می‌گوید).
        </div>
      )}
    </section>
  );
}
