// Purpose: export buttons (PDF/print, Word, Anki CSV, JSON) for one lesson or
// a whole course. Logic: ./exports.js. Bodies still loading from the cloud
// are refused (the export would be partial).
import React from 'react';
import { exportLessons } from './exports.js';

const FORMATS = [
  { key: 'pdf', label: '🖨️ PDF / چاپ' },
  { key: 'word', label: '📄 Word' },
  { key: 'anki', label: '🃏 Anki (CSV)' },
  { key: 'json', label: '💾 JSON' },
];

export default function ExportMenu({ title, lessons, knowledgeBase, setModalConfig, compact = false }) {
  const pending = (lessons || []).filter((l) => l._bodyPending || l._bodyError).length;
  const run = (format) => {
    if (!lessons?.length) return;
    if (pending) {
      setModalConfig?.({ title: 'کمی صبر کنید', message: `متنِ ${pending} درس هنوز از فضای ابری بارگذاری نشده؛ پس از بارگذاری دوباره امتحان کنید.` });
      return;
    }
    const r = exportLessons(format, { title, lessons, knowledgeBase });
    if (format === 'pdf' && r === false) setModalConfig?.({ title: 'پنجره باز نشد', message: 'مرورگر پنجرهٔ چاپ را مسدود کرد؛ اجازهٔ popup را برای این سایت بدهید.' });
    if (format === 'anki' && r === 0) setModalConfig?.({ title: 'فایل خالی است', message: 'برای این درس/دوره هنوز موردی در مرکزِ دانش (با ارجاع به درس) نیست.' });
  };
  return (
    <div dir="rtl" className={`flex flex-wrap items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`} data-testid="export-menu">
      <span className="text-slate-500">خروجی{lessons?.length > 1 ? ` (${lessons.length} درس)` : ''}:</span>
      {FORMATS.map((f) => (
        <button key={f.key} onClick={() => run(f.key)} disabled={!lessons?.length} className="px-2 py-1 rounded-lg border border-slate-300 bg-white hover:bg-teal-50 hover:border-teal-400 disabled:opacity-50">{f.label}</button>
      ))}
    </div>
  );
}
