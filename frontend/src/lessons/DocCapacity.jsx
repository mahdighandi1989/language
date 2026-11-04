// Purpose: «ظرفیتِ سندِ اصلی» in the admin panel — how full the main Firestore
// document is (cap 1 MiB), warning from 80%, red from 95%, plus the biggest
// parts and the sections stored separately (./sections.js).
import React, { useMemo } from 'react';
import { toCloudDoc, lessonExtrasOf } from './lessonBodies.js';
import { docUsage, lessonFieldUsage } from './sections.js';

const kb = (n) => (n < 1024 ? `${Math.round(n).toLocaleString('fa-IR')} بایت` : `${Math.round(n / 1024).toLocaleString('fa-IR')}KB`);
const LABELS = { lessonExtras: 'افزوده‌های درس (تحلیل، اصلاحات، رسانه، منابع)', lessons: 'درس‌ها (بی‌متن)', knowledgeBase: 'مرکزِ دانش', chatHistories: 'گفت‌وگوها', archivedConversations: 'بایگانیِ گفت‌وگو', journal: 'ژورنال', pronunciationCorrections: 'اصلاحاتِ تلفظ', culturalInsights: 'فرهنگ', kbReview: 'فلش‌کارت', kbMergeLog: 'سابقهٔ ادغام', shadowing: 'شادوینگ', studyPlan: 'برنامهٔ مطالعه', sectionRefs: 'نشانیِ بخش‌ها', customPrompts: 'پرامپت‌ها' };

export default function DocCapacity({ data }) {
  const cloud = useMemo(() => toCloudDoc(data), [data]);
  const u = useMemo(() => docUsage(cloud, { ...data, lessonExtras: lessonExtrasOf(data.lessons || []) }), [cloud, data]);
  const lf = useMemo(() => lessonFieldUsage(cloud.lessons || []), [cloud]);
  const pct = Math.round(u.ratio * 100);
  const level = pct >= 95 ? 'red' : pct >= 80 ? 'amber' : 'green';
  const bar = { red: 'bg-red-500', amber: 'bg-amber-500', green: 'bg-teal-500' }[level];
  const top = Object.entries(u.parts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const sections = Object.entries(u.sections).sort((a, b) => b[1] - a[1]);
  const pending = (data?._sectionsPending || []).length;
  return (
    <section dir="rtl" className="bg-white rounded-xl shadow-sm border p-4 space-y-3" data-testid="doc-capacity">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h2 className="font-bold text-slate-800">💾 ظرفیتِ سندِ اصلی</h2>
        <span className="text-sm text-slate-600">{kb(u.bytes)} از {kb(u.limit)} — <b>{pct.toLocaleString('fa-IR')}٪</b></span>
      </div>
      <div className="h-3 rounded-full bg-slate-200 overflow-hidden" role="meter" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="درصدِ پر بودنِ سند">
        <div className={`h-3 ${bar}`} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      {level !== 'green' && (
        <p role="alert" className={`text-sm rounded-lg p-2 ${level === 'red' ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-800'}`}>
          ⚠️ سندِ اصلی {pct.toLocaleString('fa-IR')}٪ پر است (سقفِ Firestore یک مگابایت است). بزرگ‌ترین بخش‌ها را در زیر ببینید؛ متنِ درس‌ها و بخش‌های جدا در این عدد نیستند.
        </p>
      )}
      {pending > 0 && <p className="text-xs text-slate-500">⏳ {pending.toLocaleString('fa-IR')} بخش هنوز در حالِ بارگذاری است.</p>}
      <div className="grid sm:grid-cols-2 gap-3 text-xs">
        <div>
          <p className="font-bold text-slate-600 mb-1">بزرگ‌ترین بخش‌های سندِ اصلی</p>
          <ul className="space-y-0.5">{top.map(([k, v]) => <li key={k} className="flex justify-between"><span>{LABELS[k] || k}</span><span className="text-slate-500">{kb(v)}</span></li>)}</ul>
        </div>
        <div>
          <p className="font-bold text-slate-600 mb-1">بخش‌هایی که جدا ذخیره می‌شوند (بی‌سقف)</p>
          <ul className="space-y-0.5">{sections.map(([k, v]) => <li key={k} className="flex justify-between"><span>{LABELS[k] || k}</span><span className="text-slate-500">{kb(v)}</span></li>)}</ul>
        </div>
      </div>
      <details className="text-xs">
        <summary className="cursor-pointer font-bold text-slate-600">درس‌ها در سندِ اصلی: {lf.count.toLocaleString('fa-IR')} درس، میانگین {kb(lf.avg)} برای هر درس</summary>
        <div className="grid sm:grid-cols-2 gap-3 mt-2">
          <ul className="space-y-0.5">{Object.entries(lf.totals).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => <li key={k} className="flex justify-between"><span dir="ltr">{k}</span><span className="text-slate-500">{kb(v)}</span></li>)}</ul>
          <ul className="space-y-0.5">{lf.top.map((t) => <li key={t.id} className="flex justify-between gap-2"><span className="truncate">{t.title}</span><span className="text-slate-500 shrink-0">{kb(t.bytes)}</span></li>)}</ul>
        </div>
      </details>
    </section>
  );
}
