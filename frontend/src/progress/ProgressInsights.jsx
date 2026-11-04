// Purpose: the «پیشرفتِ واقعی» panel at the top of مرکزِ پیشرفت (./progress.js).
import React, { useMemo } from 'react';
import { progressReport } from './progress.js';

const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

export default function ProgressInsights({ data, navigateTo }) {
  const r = useMemo(() => progressReport(data), [data]);
  const max = Math.max(1, ...r.activity.map((a) => a.count));
  return (
    <div dir="rtl" className="space-y-6" data-testid="progress-insights">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        <div className="bg-white rounded-2xl shadow-md p-4"><p className="text-2xl font-bold text-teal-700">{r.knowledgeTotal}</p><p className="text-xs text-slate-500">مورد در مرکزِ دانش</p></div>
        <div className="bg-white rounded-2xl shadow-md p-4"><p className="text-2xl font-bold text-teal-700">{r.activeDays30}</p><p className="text-xs text-slate-500">روزِ فعال در ۳۰ روز</p></div>
        <div className="bg-white rounded-2xl shadow-md p-4"><p className="text-2xl font-bold text-teal-700">{r.shadow.practiced}</p><p className="text-xs text-slate-500">جملهٔ تقلیدشده ({r.shadow.attempts} تلاش)</p></div>
        <div className="bg-white rounded-2xl shadow-md p-4"><p className="text-2xl font-bold text-teal-700">{r.shadow.mastered}</p><p className="text-xs text-slate-500">جملهٔ مسلط (۸۰+)</p></div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-5">
        <h3 className="font-bold text-slate-800 mb-3">🗓️ فعالیتِ ۳۰ روزِ اخیر</h3>
        <div className="flex items-end gap-1 h-24" dir="ltr" aria-label="نمودارِ فعالیت">
          {r.activity.map((a) => (
            <div key={a.day} title={`${new Date(a.day).toLocaleDateString('fa-IR')}: ${a.count}`} className="flex-1 rounded-t bg-teal-400" style={{ height: `${Math.max(4, (a.count / max) * 100)}%`, opacity: a.count ? 1 : 0.2 }} />
          ))}
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-1"><span>امروز</span><span>۳۰ روز پیش</span></div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-5 overflow-x-auto">
        <h3 className="font-bold text-slate-800 mb-3">📚 پیشرفتِ هر دوره</h3>
        <table className="min-w-full text-sm">
          <thead><tr className="text-slate-500 border-b"><th className="text-start py-1">دوره</th><th>درس</th><th>با محتوا</th><th>آزمون</th><th>مکالمه</th><th>تقلید (مسلط)</th></tr></thead>
          <tbody>
            {r.courses.map((c) => (
              <tr key={c.course} className="border-b last:border-b-0 text-center">
                <td className="text-start py-2 font-medium">{c.course}
                  <div className="h-1.5 bg-slate-200 rounded mt-1"><div className="h-1.5 bg-teal-500 rounded" style={{ width: `${pct(c.withContent, c.lessons)}%` }} /></div>
                </td>
                <td>{c.lessons}</td><td>{c.withContent}</td><td>{c.quizzes}</td><td>{c.chats}</td><td>{c.shadowed} ({c.mastered})</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-md p-5">
          <h3 className="font-bold text-slate-800 mb-3">🧠 مرکزِ دانش</h3>
          <ul className="space-y-2 text-sm">
            {r.knowledge.map((k) => (
              <li key={k.label} className="flex items-center gap-2"><span className="w-24 shrink-0">{k.label}</span>
                <div className="flex-1 h-2 bg-slate-200 rounded"><div className="h-2 bg-blue-500 rounded" style={{ width: `${pct(k.count, Math.max(1, ...r.knowledge.map((x) => x.count)))}%` }} /></div>
                <span className="w-10 text-left text-slate-500">{k.count}</span></li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-5">
          <h3 className="font-bold text-slate-800 mb-3">🎯 درس‌هایی که کمتر تمرین شده‌اند</h3>
          {r.attention.length === 0 ? <p className="text-sm text-slate-500">درسی با محتوا نیست.</p> : (
            <ul className="space-y-2 text-sm">
              {r.attention.map((a) => (
                <li key={a.id}><button onClick={() => navigateTo?.('lesson', { id: a.id })} className="text-teal-700 hover:underline text-start">{a.title}</button> <span className="text-xs text-slate-400">({a.score ? `امتیازِ تمرین ${a.score}` : 'بی‌تمرین'})</span></li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
