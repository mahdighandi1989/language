// Purpose: lesson page — «🧩 استخراجِ آیتمِ دانش از متنِ درس». Local exact pass
// (tables + «X : Y» lines) at once; optional «+ Gemini» pass (items verified to
// appear in the text). Preview with tick / edit / tab per item; duplicates of
// the knowledge center are unticked. Adds with lessonId + «درس: …» source.
// The lesson text itself is never changed. Logic: ./extract.js.
import React, { useMemo, useState } from 'react';
import { extractLocal, verifyAiItems, markAgainstKb, mergeCandidates, addToKb, CATEGORIES } from './extract.js';
import { cleanForQuiz } from '../quiz/quizSource.js';

const LABEL = { vocabulary: 'لغات', phrases: 'اصطلاحات', verbs: 'افعال', adjectives: 'صفات', pronouns: 'ضمایر', grammar: 'گرامر' };
const STATUS = { new: ['تازه', 'bg-emerald-100 text-emerald-800'], duplicate: ['تکراری', 'bg-slate-200 text-slate-600'], 'other-meaning': ['موجود با معنیِ دیگر', 'bg-amber-100 text-amber-800'] };
const AI_CHUNK = 12000;

export default function KnowledgeExtract({ lesson, data, setData, callAI, addJournalEntry }) {
  const [rows, setRows] = useState(null);
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  const kbPending = (data?._sectionsPending || []).includes('knowledgeBase');
  const blocked = Boolean(lesson._bodyPending || lesson._bodyError || kbPending);

  const withMarks = (cands) => markAgainstKb(cands, data?.knowledgeBase).map((c) => ({ ...c, pick: c.status === 'new' }));
  const runLocal = () => { setMsg(''); setRows(withMarks(extractLocal(lesson.archivedNotes, { lessonTitle: lesson.title }))); };
  const runAi = async () => {
    if (!callAI) return;
    setBusy('در حالِ خواندنِ متن با Gemini…'); setMsg('');
    const text = cleanForQuiz(lesson.archivedNotes);
    const parts = [];
    for (let i = 0; i < text.length && parts.length < 3; i += AI_CHUNK) parts.push(text.slice(i, i + AI_CHUNK));
    const schema = { type: 'ARRAY', items: { type: 'OBJECT', properties: { term: { type: 'STRING' }, definition: { type: 'STRING' }, category: { type: 'STRING', enum: CATEGORIES }, pronunciation: { type: 'STRING' } }, required: ['term', 'definition', 'category'] } };
    const found = [];
    try {
      for (const part of parts) {
        // eslint-disable-next-line no-await-in-loop
        const out = await callAI({
          contents: [{ parts: [{ text: part }] }],
          systemInstruction: { parts: [{ text: 'از جزوهٔ درسِ لهجهٔ لبنانیِ زیر، آیتم‌های یادگیری را فهرست کن: term = عبارتِ لبنانی **عیناً همان‌طور که در متن آمده** (هیچ کلمه‌ای نساز و اصلاح نکن)، definition = معنیِ فارسی (از متن اگر هست)، category یکی از: vocabulary، phrases، verbs، adjectives، pronouns، grammar، و pronunciation ِ لاتین اگر در متن هست. فقط آرایهٔ JSON.' }] },
          generationConfig: { responseMimeType: 'application/json', responseSchema: schema, temperature: 0.1, thinkingConfig: { thinkingBudget: 0 }, maxOutputTokens: 8192 },
        });
        let arr = [];
        try { arr = JSON.parse(out); } catch { arr = []; }
        found.push(...verifyAiItems(arr, lesson.archivedNotes));
      }
      const base = rows || extractLocal(lesson.archivedNotes, { lessonTitle: lesson.title });
      const merged = mergeCandidates(base.map(({ status, pick, existing, ...c }) => c), found);
      setRows(withMarks(merged));
      setMsg(`Gemini ${found.length} آیتمِ تأییدشده (در متن هست) یافت؛ ${merged.length - base.length} تازه افزوده شد.`);
    } catch (e) {
      setMsg(`Gemini پاسخ نداد (${e?.status || e?.message || e}) — نتیجهٔ استخراجِ دقیق بی‌تغییر ماند.`);
    } finally { setBusy(''); }
  };
  const patch = (i, p) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...p } : x)));
  const chosen = useMemo(() => (rows || []).filter((r) => r.pick && r.term && r.definition), [rows]);
  const apply = () => {
    setData((prev) => ({ ...prev, knowledgeBase: addToKb(prev.knowledgeBase, chosen, lesson) }));
    addJournalEntry?.(`${chosen.length} آیتمِ دانش از درسِ «${lesson.title}» استخراج و افزوده شد.`);
    setMsg(`✅ ${chosen.length} آیتم به مرکزِ دانش افزوده شد (با ارجاع به این درس).`);
    setRows(null);
  };
  const counts = (rows || []).reduce((a, r) => ({ ...a, [r.status]: (a[r.status] || 0) + 1 }), {});

  return (
    <section dir="rtl" className="bg-white p-6 rounded-2xl shadow-md space-y-3" data-testid="kb-extract">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xl font-bold text-slate-800">🧩 استخراجِ آیتمِ دانش از متنِ درس</h3>
        <div className="flex gap-2">
          <button onClick={runLocal} disabled={blocked || !!busy} className="px-3 py-1.5 rounded-lg bg-teal-500 text-white disabled:opacity-50 text-sm">استخراجِ دقیق (جدول‌ها و «X : Y»)</button>
          {callAI && <button onClick={runAi} disabled={blocked || !!busy} className="px-3 py-1.5 rounded-lg bg-indigo-500 text-white disabled:opacity-50 text-sm">+ تکمیل با Gemini</button>}
        </div>
      </div>
      <p className="text-xs text-slate-500">متنِ درس تغییر نمی‌کند. آیتم‌های تکراریِ مرکزِ دانش تیک ندارند؛ تب و معنی را پیش از افزودن می‌توانید عوض کنید.</p>
      {blocked && <p className="text-xs text-amber-700">{kbPending ? 'مرکزِ دانش هنوز از فضای ابری بارگذاری نشده (برای تشخیصِ تکراری لازم است).' : 'متنِ این درس هنوز بارگذاری نشده است.'}</p>}
      {busy && <p role="status" className="text-sm text-indigo-700">⏳ {busy}</p>}
      {msg && <p role="status" className="text-sm text-slate-700">{msg}</p>}
      {rows && (
        rows.length === 0 ? <p className="text-sm text-slate-500">در این متن جدول یا سطرِ «عبارت : معنی» پیدا نشد؛ «تکمیل با Gemini» را امتحان کنید.</p> : (
          <>
            <p className="text-xs text-slate-600">{rows.length} آیتم: {counts.new || 0} تازه، {counts.duplicate || 0} تکراری، {counts['other-meaning'] || 0} با معنیِ دیگر — {chosen.length} انتخاب‌شده.</p>
            <div className="max-h-96 overflow-auto border rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 sticky top-0"><tr><th className="p-1"><input type="checkbox" aria-label="انتخابِ همه" checked={rows.every((r) => r.pick)} onChange={(e) => setRows((r) => r.map((x) => ({ ...x, pick: e.target.checked })))} /></th><th className="p-1 text-start">عبارت</th><th className="p-1 text-start">معنی</th><th className="p-1">تب</th><th className="p-1">وضعیت</th></tr></thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-1 text-center"><input type="checkbox" aria-label={`انتخابِ ${r.term}`} checked={r.pick} onChange={(e) => patch(i, { pick: e.target.checked })} /></td>
                      <td className="p-1" dir="auto"><input value={r.term} onChange={(e) => patch(i, { term: e.target.value })} className="w-full bg-transparent" dir="auto" aria-label="عبارت" />{r.pronunciation && <span className="text-xs text-slate-400" dir="ltr">{r.pronunciation}</span>}</td>
                      <td className="p-1"><input value={r.definition} onChange={(e) => patch(i, { definition: e.target.value })} className="w-full bg-transparent" aria-label="معنی" />{r.existing && <span className="block text-xs text-amber-700">موجود: {r.existing}</span>}</td>
                      <td className="p-1"><select value={r.category} onChange={(e) => patch(i, { category: e.target.value })} className="border rounded p-0.5 text-xs" aria-label="تب">{CATEGORIES.map((c) => <option key={c} value={c}>{LABEL[c]}</option>)}</select></td>
                      <td className="p-1 text-center"><span className={`text-xs px-2 rounded-full ${STATUS[r.status][1]}`}>{STATUS[r.status][0]}{r.from === 'ai' ? ' · AI' : ''}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setRows(null)} className="px-4 py-2 rounded-lg bg-slate-200">انصراف</button>
              <button onClick={apply} disabled={!chosen.length} className="px-4 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-50">افزودنِ {chosen.length} آیتم به مرکزِ دانش</button>
            </div>
          </>
        )
      )}
    </section>
  );
}
