// Purpose: the owner's «نظارت و سرکشی» board. Lists every sheet (a normal user
// sees only their own), shows the conversation under each sheet with the
// supervisor's OUTCOME (separate from the conversation status), the dependency
// chain, attachments with their read state, and the owner-only actions: tick
// (approve), reopen, accept/decline a user's sheet, ⚡ urgent. There is no
// delete button — sheets are never deleted.
//
// Upstream: ./api.js. Downstream: rendered by components/App.jsx (view 'inspection').
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { TONE_COLOR } from './InspectionLayer.jsx';

const TABS = [
  { key: 'active', label: 'فعال', match: (s) => ['open', 'answered', 'approved'].includes(s.status) },
  { key: 'pending', label: 'منتظرِ تأییدِ مدیر', match: (s) => s.status === 'pending' },
  { key: 'urgent', label: '⚡ فوری', match: (s) => s.urgentAt && !s.urgentDoneAt },
  { key: 'filed', label: 'بایگانی', match: (s) => s.status === 'filed' },
  { key: 'declined', label: 'ردشده', match: (s) => s.status === 'declined' },
];

const WHO = { owner: 'مالک', user: 'کاربر', reviewer: 'ناظر' };
const DEP_ICON = { ok: '✅', missing: '❌', risk: '⚠️' };

function Badge({ tone, children }) {
  const color = TONE_COLOR[tone] || '#64748b';
  return <span style={{ background: `${color}22`, color, border: `1px solid ${color}55` }} className="text-xs px-2 py-0.5 rounded-full whitespace-nowrap">{children}</span>;
}

function ShotButton({ api, id, label }) {
  const [url, setUrl] = useState(null);
  if (!id) return null;
  return url
    ? <img src={url} alt={label} className="max-h-60 rounded border mt-1" />
    : <button className="text-xs text-teal-700 underline" onClick={async () => setUrl(await api.blobUrl(`/api/inspection/shots/${id}`))}>{label}</button>;
}

function SheetCard({ api, sheet, isOwner, onChanged, onReopenPage }) {
  const [reply, setReply] = useState('');
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const act = async (fn) => {
    setBusy(true);
    setError(null);
    try { await fn(); onChanged(); } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  const sendNote = () => act(async () => {
    if (reply.trim()) await api.note(sheet.id, { text: reply });
    if (files.length) await api.upload(sheet.id, files);
    setReply('');
    setFiles([]);
  });
  const closed = ['filed', 'declined'].includes(sheet.status);
  return (
    <article className="bg-white rounded-2xl shadow-sm border p-4 space-y-3" style={{ borderRightWidth: 4, borderRightColor: TONE_COLOR[sheet.glow?.tone] || '#cbd5e1' }}>
      <header className="flex flex-wrap items-center gap-2 justify-between">
        <h3 className="font-bold text-slate-800">#{sheet.number} — {sheet.title}</h3>
        <div className="flex flex-wrap gap-1">
          <Badge tone={sheet.status}>{sheet.statusLabel}</Badge>
          {sheet.status === 'answered' && <Badge tone={sheet.glow?.tone}>{sheet.glow?.label}</Badge>}
          {sheet.urgentAt && !sheet.urgentDoneAt && <Badge tone="not-done">⚡ فوری</Badge>}
          {sheet.binderNumber ? <Badge tone="filed">زونکن {sheet.binderNumber} / برگ {sheet.binderPage}</Badge> : null}
        </div>
      </header>
      <p className="text-xs text-slate-500">
        {sheet.createdBy} · {new Date(sheet.createdAt).toLocaleString('fa-IR')} · صفحه:{' '}
        <button className="underline text-teal-700" onClick={() => onReopenPage(sheet)}>{sheet.pageLabel || sheet.page || '—'}</button>
      </p>
      {sheet.glow?.hint && <p className="text-xs bg-slate-50 rounded p-2 text-slate-600">{sheet.glow.hint}</p>}
      <ol className="space-y-2">
        {(sheet.notes || []).map((n) => (
          <li key={n.id} className={`rounded-xl p-3 text-sm ${n.by === 'reviewer' ? 'bg-emerald-50' : 'bg-slate-50'}`}>
            <div className="flex flex-wrap gap-2 items-center text-xs text-slate-500 mb-1">
              <b>{WHO[n.by] || n.by}</b><span>{new Date(n.at).toLocaleString('fa-IR')}</span>
              {n.outcome && <Badge tone={n.outcome === 'fixed' && !n.afterShotId ? 'partial' : n.outcome}>{n.outcome}</Badge>}
            </div>
            <p className="whitespace-pre-wrap text-slate-800">{n.text}</p>
            {n.place && <p className="text-xs text-slate-600 mt-1">📍 {n.place}</p>}
            {n.commits?.length > 0 && <p className="text-xs text-slate-600 mt-1">کامیت: {n.commits.join('، ')}</p>}
            {n.noChangeReason && <p className="text-xs text-slate-600 mt-1">بی‌تغییر چون: {n.noChangeReason}</p>}
            {n.deps?.length > 0 && (
              <ul className="text-xs mt-1 space-y-0.5">{n.deps.map((d, i) => <li key={i}>{DEP_ICON[d.status]} {d.name}{d.note ? ` — ${d.note}` : ''}</li>)}</ul>
            )}
            <div className="flex gap-3"><ShotButton api={api} id={n.shotId} label="تصویرِ پیوست" /><ShotButton api={api} id={n.afterShotId} label="تصویرِ بعد (مدرک)" /></div>
          </li>
        ))}
      </ol>
      {sheet.files?.length > 0 && (
        <ul className="text-xs space-y-1">
          {sheet.files.map((f) => (
            <li key={f.id} className="flex flex-wrap gap-2 items-center">
              📎 <span className="font-medium">{f.filename}</span>
              <span className="text-slate-500">{Math.ceil(f.byteSize / 1024)}KB</span>
              <span className="text-slate-500">{f.extractLabel}</span>
              {f.extractStatus === 'ok' && <span className="text-slate-500">خوانده‌شده توسطِ ناظر: {f.readChars || 0}/{f.textChars}</span>}
              {f.extractNote && <span className="text-amber-700">{f.extractNote}</span>}
            </li>
          ))}
        </ul>
      )}
      {sheet.readDebt?.length > 0 && <p className="text-xs text-amber-700">ناظر هنوز {sheet.readDebt.length} پیوست را کامل نخوانده — پاسخش پذیرفته نمی‌شود.</p>}
      {!closed && (
        <div className="space-y-2">
          <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={2} placeholder="یادداشتِ تازه زیرِ این برگه…" className="w-full border rounded-xl p-2 text-sm" />
          <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} className="text-xs" />
          <div className="flex flex-wrap gap-2">
            <button disabled={busy || (!reply.trim() && !files.length)} onClick={sendNote} className="px-3 py-1.5 rounded-lg text-sm bg-slate-700 text-white disabled:bg-slate-300">ثبتِ یادداشت</button>
            {isOwner && sheet.status === 'answered' && <button disabled={busy} onClick={() => act(() => api.approve(sheet.id))} className="px-3 py-1.5 rounded-lg text-sm bg-blue-600 text-white">✔ تیکِ تأیید</button>}
            {isOwner && ['answered', 'approved'].includes(sheet.status) && <button disabled={busy} onClick={() => act(() => api.reopen(sheet.id))} className="px-3 py-1.5 rounded-lg text-sm bg-amber-500 text-white">بازکردنِ دوباره</button>}
            {isOwner && sheet.status === 'pending' && (
              <>
                <button disabled={busy} onClick={() => act(() => api.triage(sheet.id, 'accept'))} className="px-3 py-1.5 rounded-lg text-sm bg-green-600 text-white">پذیرش و ارسال به ناظر</button>
                <button disabled={busy} onClick={() => act(() => api.triage(sheet.id, 'decline', reply))} className="px-3 py-1.5 rounded-lg text-sm bg-red-500 text-white">رد (نگه داشته می‌شود)</button>
              </>
            )}
            {isOwner && sheet.status !== 'pending' && (
              <button disabled={busy} onClick={() => act(() => api.urgent(sheet.id, !(sheet.urgentAt && !sheet.urgentDoneAt)))} className="px-3 py-1.5 rounded-lg text-sm bg-orange-100 text-orange-800">
                {sheet.urgentAt && !sheet.urgentDoneAt ? 'لغوِ فوری' : '⚡ فوری'}
              </button>
            )}
          </div>
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </article>
  );
}

export default function InspectionBoard({ api, onReopenPage }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('active');
  const load = useCallback(async () => {
    try {
      setData(await api.list());
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, [api]);
  useEffect(() => { load(); }, [load]);
  const isOwner = data?.me?.role === 'owner';
  const shown = useMemo(() => {
    const t = TABS.find((x) => x.key === tab) || TABS[0];
    return (data?.sheets || []).filter(t.match).sort((a, b) => b.number - a.number);
  }, [data, tab]);
  return (
    <div dir="rtl" className="max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">نظارت و سرکشی</h1>
      <p className="text-sm text-slate-600">
        با دکمهٔ «📝 نظارت» (پایینِ صفحه) روی هر صفحه کادر بکشید و بنویسید. ناظرِ خودکار برگه‌ها را می‌خواند، کار را انجام
        می‌دهد و زیرِ برگه با «نتیجه» و مدرک جواب می‌دهد؛ تیکِ تأیید فقط با شماست.
      </p>
      {data?.store && !data.store.durable && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-sm">⚠️ {data.store.note}</div>
      )}
      {error && <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm">{error}</div>}
      <nav className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-3 py-1.5 rounded-full text-sm ${tab === t.key ? 'bg-slate-800 text-white' : 'bg-white border'}`}>
            {t.label} ({(data?.sheets || []).filter(t.match).length})
          </button>
        ))}
        <button onClick={load} className="px-3 py-1.5 rounded-full text-sm bg-white border">↻ تازه‌سازی</button>
      </nav>
      {!data && !error && <p className="text-slate-500">در حالِ بارگذاری…</p>}
      {data && shown.length === 0 && <p className="text-slate-500">برگه‌ای در این بخش نیست.</p>}
      {shown.map((s) => <SheetCard key={s.id} api={api} sheet={s} isOwner={isOwner} onChanged={load} onReopenPage={onReopenPage} />)}
    </div>
  );
}
