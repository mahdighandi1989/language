// Purpose: knowledge-center tools for large collections — «بازبینی» (duplicates
// with reversible merge, quality flags, category suggestions), «فلش‌کارت»
// (Leitner, progress in data.kbReview) and «آزمونِ سریع» (local MCQ, no AI).
import React, { useMemo, useState } from 'react';
import { findDuplicates, qualityIssues, mergeGroup, undoMerge, moveItem } from './review.js';
import { dueCards, gradeCard, buildQuiz, allItems } from './practice.js';
import { categoryList } from './kb.js';

const PAGE = 30;

function Review({ kb, labels, setData, log }) {
  const dups = useMemo(() => findDuplicates(kb), [kb]);
  const issues = useMemo(() => qualityIssues(kb), [kb]);
  const [showD, setShowD] = useState(PAGE);
  const [showQ, setShowQ] = useState(PAGE);
  const [flag, setFlag] = useState('all');
  const merge = (g) => setData((prev) => {
    const { kb: next, log: entry } = mergeGroup(prev.knowledgeBase, g);
    return { ...prev, knowledgeBase: next, kbMergeLog: [...(prev.kbMergeLog || []), entry] };
  });
  const mergeAll = () => {
    if (!window.confirm(`${dups.length} گروهِ تکراری ادغام شود؟ (معنی‌ها و منبع‌ها نگه داشته می‌شوند؛ هر ادغام قابلِ برگشت است)`)) return;
    setData((prev) => {
      let k = prev.knowledgeBase; const entries = [];
      for (const g of findDuplicates(k)) { const r = mergeGroup(k, g); k = r.kb; entries.push(r.log); }
      return { ...prev, knowledgeBase: k, kbMergeLog: [...(prev.kbMergeLog || []), ...entries] };
    });
  };
  const undoLast = () => setData((prev) => {
    const l = [...(prev.kbMergeLog || [])]; const last = l.pop();
    return last ? { ...prev, knowledgeBase: undoMerge(prev.knowledgeBase, last), kbMergeLog: l } : prev;
  });
  const move = (x) => setData((prev) => ({ ...prev, knowledgeBase: moveItem(prev.knowledgeBase, x.category, x.item, x.suggest) }));
  const codes = [...new Set(issues.flatMap((i) => i.flags.map((f) => f.label)))];
  const shown = issues.filter((i) => flag === 'all' || (flag === 'suggest' ? i.suggest : i.flags.some((f) => f.label === flag)));

  return (
    <div className="space-y-5 text-sm">
      <div className="p-3 rounded-lg bg-slate-50 border">
        <b>{allItems(kb).length}</b> مورد با معنی · <b>{dups.length}</b> گروهِ تکراری · <b>{issues.length}</b> موردِ نیازمندِ بازبینی
        {log.length > 0 && <button onClick={undoLast} className="ms-3 text-teal-700 underline">↩ برگرداندنِ آخرین ادغام ({log.length})</button>}
      </div>
      <section className="space-y-2">
        <div className="flex items-center justify-between"><h4 className="font-bold">🔁 تکراری‌ها (بی‌اعراب و با یکسان‌سازیِ املا)</h4>
          {dups.length > 1 && <button onClick={mergeAll} className="px-3 py-1 rounded bg-teal-600 text-white">ادغامِ همه</button>}</div>
        {dups.length === 0 && <p className="text-slate-500">تکراری پیدا نشد.</p>}
        {dups.slice(0, showD).map((g) => (
          <div key={g.key} className="p-2 border rounded-lg flex items-start justify-between gap-2">
            <ul className="space-y-1 min-w-0">{g.members.map((m, i) => <li key={i} className="break-words"><b dir="auto">{m.item.term}</b> — {m.item.definition || <i className="text-red-600">بی‌معنی</i>} <span className="text-xs text-slate-400">[{labels[m.category] || m.category}{m.item.source ? ` · ${m.item.source}` : ''}]</span></li>)}</ul>
            <button onClick={() => merge(g)} className="shrink-0 px-2 py-1 rounded bg-slate-200 hover:bg-teal-100">ادغام</button>
          </div>
        ))}
        {dups.length > showD && <button onClick={() => setShowD((n) => n + PAGE)} className="text-teal-700">نمایشِ بیشتر ({dups.length - showD})</button>}
      </section>
      <section className="space-y-2">
        <div className="flex flex-wrap items-center gap-2"><h4 className="font-bold">🩺 کیفیت و دسته‌بندی</h4>
          <select value={flag} onChange={(e) => setFlag(e.target.value)} className="p-1 border rounded text-xs">
            <option value="all">همه ({issues.length})</option><option value="suggest">پیشنهادِ تغییرِ تب</option>{codes.map((c) => <option key={c} value={c}>{c}</option>)}
          </select></div>
        {shown.slice(0, showQ).map((x, i) => (
          <div key={i} className="p-2 border rounded-lg flex items-start justify-between gap-2">
            <div className="min-w-0"><b dir="auto">{x.item.term || '—'}</b> — {x.item.definition || '—'} <span className="text-xs text-slate-400">[{labels[x.category] || x.category}]</span>
              <div className="flex flex-wrap gap-1 mt-1">{x.flags.map((f) => <span key={f.code} className="text-xs px-2 rounded-full bg-amber-100 text-amber-800">{f.label}</span>)}</div></div>
            {x.suggest && <button onClick={() => move(x)} className="shrink-0 px-2 py-1 rounded bg-slate-200 hover:bg-teal-100 text-xs">انتقال به «{labels[x.suggest] || x.suggest}»</button>}
          </div>
        ))}
        {shown.length > showQ && <button onClick={() => setShowQ((n) => n + PAGE)} className="text-teal-700">نمایشِ بیشتر ({shown.length - showQ})</button>}
        <p className="text-xs text-slate-400">ویرایش یا حذفِ هر مورد: در «فهرست» با ✏️ و 🗑️.</p>
      </section>
    </div>
  );
}

function Flashcards({ kb, review, setData, cats }) {
  const [tab, setTab] = useState('all');
  const [flipped, setFlipped] = useState(false);
  const categories = tab === 'all' ? null : [tab];
  const due = useMemo(() => dueCards(kb, review, { categories, limit: 50 }), [kb, review, tab]);
  const card = due[0];
  const grade = (known) => { setData((prev) => ({ ...prev, kbReview: gradeCard(prev.kbReview, card.key, known) })); setFlipped(false); };
  const total = allItems(kb, categories).length;
  const learned = Object.entries(review || {}).filter(([k, v]) => v.box >= 3 && (!categories || k.startsWith(`${tab}:`))).length;
  return (
    <div className="space-y-3 text-center">
      <div className="flex items-center justify-between text-sm">
        <select value={tab} onChange={(e) => { setTab(e.target.value); setFlipped(false); }} className="p-1 border rounded">
          <option value="all">همهٔ تب‌ها</option>{cats.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>
        <span className="text-slate-500">امروز: {due.length >= 50 ? '۵۰+' : due.length} کارت · آموخته (جعبهٔ ۳+): {learned} از {total}</span>
      </div>
      {!card ? <p className="py-8 text-slate-500">🎉 کارتِ موعدداری نمانده؛ فردا برگردید.</p> : (
        <>
          <button onClick={() => setFlipped((f) => !f)} className="w-full min-h-[9rem] p-6 rounded-2xl border-2 border-teal-300 bg-teal-50 text-2xl leading-loose" aria-label="برگرداندنِ کارت">
            {flipped ? <span className="text-lg">{card.item.definition}</span> : <span dir="auto" lang="ar">{card.item.term}</span>}
          </button>
          <p className="text-xs text-slate-400">جعبهٔ {card.state.box} · {card.item.source || ''}</p>
          {flipped ? (
            <div className="flex gap-2 justify-center">
              <button onClick={() => grade(false)} className="px-4 py-2 rounded-lg bg-red-100 text-red-800">✗ بلد نبودم</button>
              <button onClick={() => grade(true)} className="px-4 py-2 rounded-lg bg-green-600 text-white">✓ بلد بودم</button>
            </div>
          ) : <button onClick={() => setFlipped(true)} className="px-4 py-2 rounded-lg bg-teal-500 text-white">نمایشِ معنی</button>}
        </>
      )}
    </div>
  );
}

function QuickQuiz({ kb, cats, addJournalEntry }) {
  const [tab, setTab] = useState('all');
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const start = () => { setQuiz(buildQuiz(kb, { n: 10, categories: tab === 'all' ? null : [tab] })); setAnswers({}); };
  const done = quiz && quiz.length > 0 && Object.keys(answers).length === quiz.length;
  const score = quiz ? quiz.filter((q, i) => answers[i] === q.correct).length : 0;
  React.useEffect(() => { if (done) addJournalEntry?.(`آزمونِ سریعِ مرکزِ دانش: ${score} از ${quiz.length}`); }, [done]);
  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center gap-2">
        <select value={tab} onChange={(e) => setTab(e.target.value)} className="p-1 border rounded"><option value="all">همهٔ تب‌ها</option>{cats.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}</select>
        <button onClick={start} className="px-4 py-1.5 rounded-lg bg-teal-500 text-white">{quiz ? '🔄 آزمونِ تازه' : '▶️ شروعِ آزمونِ ۱۰ سؤالی'}</button>
      </div>
      {quiz && quiz.length === 0 && <p className="text-slate-500">برای آزمون دست‌کم ۴ مورد با معنیِ متفاوت لازم است.</p>}
      {quiz?.map((q, i) => (
        <div key={q.key + i} className="p-3 border rounded-xl space-y-2">
          <p className="text-lg" dir="auto" lang="ar">{i + 1}. {q.term}</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {q.options.map((o) => {
              const picked = answers[i] === o; const show = answers[i] != null;
              return <button key={o} disabled={show} onClick={() => setAnswers((a) => ({ ...a, [i]: o }))} className={`p-2 rounded-lg border text-start ${show && o === q.correct ? 'border-green-500 bg-green-50' : picked ? 'border-red-500 bg-red-50' : 'hover:border-teal-400'}`}>{o}</button>;
            })}
          </div>
        </div>
      ))}
      {done && <p className="text-center font-bold text-lg">امتیاز: {score} از {quiz.length}</p>}
    </div>
  );
}

export default function KbTools({ mode, knowledgeBase, kbCategories, data, setData, addJournalEntry }) {
  const cats = categoryList(knowledgeBase, kbCategories).filter((c) => !c.hidden);
  const labels = Object.fromEntries(categoryList(knowledgeBase, kbCategories).map((c) => [c.key, c.label]));
  if (mode === 'review') return <Review kb={knowledgeBase} labels={labels} setData={setData} log={data?.kbMergeLog || []} />;
  if (mode === 'cards') return <Flashcards kb={knowledgeBase} review={data?.kbReview || {}} setData={setData} cats={cats} />;
  if (mode === 'quiz') return <QuickQuiz kb={knowledgeBase} cats={cats} addJournalEntry={addJournalEntry} />;
  return null;
}
