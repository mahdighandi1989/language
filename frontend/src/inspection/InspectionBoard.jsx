// Purpose: the owner's «نظارت و سرکشی» board (parity with the reference project).
// Lists every sheet (a normal user sees only their own), the conversation with
// the supervisor's OUTCOME (separate from the conversation status), the
// dependency chain, attachments with how much the supervisor has read, and the
// owner-only actions: tick, reopen, accept / decline WITH a reason (the
// submitter is e-mailed), ⚡ urgent with the expected time, take an attachment
// off a sheet (kept, not deleted). Also: «درخواستِ عمومی» (a request tied to no
// place), editing a sheet's text (the original is kept), text search, the
// supervisor's round status, «رفتن به همان‌جا», and auto-refresh while ⚡ sheets
// are waiting with a «ناظر روی موردهای فوری کار کرد» notice.
// There is no delete button — sheets are never deleted.
//
// Upstream: ./api.js, ./nextRound.js, ./focus.js. Downstream: components/App.jsx (view 'inspection').
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TONE_COLOR } from './InspectionLayer.jsx';
import { localClock, humanGap, minutesUntil, rushMessage, fa } from './nextRound.js';
import { requestFocus } from './focus.js';
import { describeGeometry } from './capture.js';

const TABS = [
  { key: 'active', label: 'فعال', match: (s) => ['open', 'answered', 'approved'].includes(s.status) },
  { key: 'pending', label: 'منتظرِ تأییدِ مدیر', match: (s) => s.status === 'pending' },
  { key: 'urgent', label: '⚡ فوری', match: (s) => s.urgentAt && !s.urgentDoneAt },
  { key: 'general', label: 'درخواستِ عمومی', match: (s) => s.general },
  { key: 'filed', label: 'بایگانی', match: (s) => s.status === 'filed' },
  { key: 'declined', label: 'ردشده', match: (s) => s.status === 'declined' },
  { key: 'all', label: 'همه', match: () => true },
];

const WHO = { owner: 'مالک', user: 'کاربر', reviewer: 'ناظر' };
const DEP_ICON = { ok: '✅', missing: '❌', risk: '⚠️' };
const MAIL_LABEL = { sent: 'ایمیل شد', 'not-configured': 'ایمیل نشد — SMTP روی سرور تنظیم نیست', failed: 'ارسالِ ایمیل ناموفق', skipped: '' };

/** Lower-cased searchable text of a sheet (number, title, notes, author, files). */
export function sheetText(s) {
  return [s.number, s.title, s.createdBy, s.pageLabel, s.triageNote,
    ...(s.notes || []).map((n) => n.text), ...(s.files || []).map((f) => f.filename)]
    .filter(Boolean).join(' ').toLowerCase();
}

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

/** «آخرین دورِ ناظر / دورِ بعدی (تخمینی) / آخرین دورِ کامل» + stale warnings. */
export function RoundsBar({ rounds, now = new Date() }) {
  if (!rounds) return null;
  const { urgent, full } = rounds;
  return (
    <div dir="rtl" className="flex flex-wrap gap-2 text-xs" data-testid="rounds-bar">
      {urgent?.basis === 'stale' ? (
        <span className="rounded-lg border border-red-300 bg-red-50 text-red-800 px-2.5 py-1.5">
          ⚡ ناظرِ فوری مدتی است سر نزده (آخرین: {localClock(urgent.lastSeen, now)}) — روتینش را بررسی کنید
        </span>
      ) : urgent && (
        <span className="rounded-lg border border-amber-300 bg-amber-50 text-amber-900 px-2.5 py-1.5">
          ⚡ آخرین دورِ ناظر: {urgent.lastSeen ? localClock(urgent.lastSeen, now) : 'هنوز ثبت نشده'}
          {' · '}دورِ بعدی{urgent.basis === 'assumed' ? ' (تخمینی)' : ''}: {localClock(urgent.at, now)} ({humanGap(minutesUntil(urgent.at, now))})
        </span>
      )}
      {full?.basis === 'stale' ? (
        <span className="rounded-lg border border-red-300 bg-red-50 text-red-800 px-2.5 py-1.5">
          🔍 دورِ کاملِ ناظر مدتی است نیامده — روتینش را بررسی کنید
        </span>
      ) : full && (
        <span className="rounded-lg border border-slate-300 bg-white text-slate-700 px-2.5 py-1.5" title={`زمان‌بندی (UTC): ${full.schedule}`}>
          🔍 آخرین دورِ کامل: {full.lastSeen ? new Date(full.lastSeen).toLocaleString('fa-IR') : 'هنوز ثبت نشده'}
          {' · '}بعدی: {localClock(full.at, now)}
        </span>
      )}
    </div>
  );
}

function SheetCard({ api, sheet, isOwner, me, rounds, onChanged, onReopenPage, onNotice }) {
  const [reply, setReply] = useState('');
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null); // { noteId, text }
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
  const decline = () => {
    const reason = window.prompt('دلیلِ رد (برای کاربر ایمیل می‌شود؛ می‌تواند خالی بماند):', reply || '');
    if (reason === null) return;
    act(async () => {
      const r = await api.triage(sheet.id, 'decline', reason);
      onNotice(`برگهٔ ${fa(sheet.number)} رد شد${r?.mail?.status === 'sent' ? ' — به کاربر ایمیل شد' : ''}`);
    });
  };
  const accept = () => act(async () => {
    const r = await api.triage(sheet.id, 'accept', '');
    onNotice(`برگهٔ ${fa(sheet.number)} پذیرفته شد${r?.mail?.status === 'sent' ? ' — به کاربر ایمیل شد' : ''}`);
  });
  const rush = () => act(async () => {
    const on = !(sheet.urgentAt && !sheet.urgentDoneAt);
    const r = await api.urgent(sheet.id, on);
    onNotice(on ? rushMessage(r?.position || 1, r?.nextRound) : 'از صفِ فوری بیرون آمد');
  });
  const canEdit = (n) => !closed && ((me?.role === 'owner' && n.by !== 'reviewer') || (me?.role === 'user' && n.by === 'user' && n.author === me.email));
  const closed = ['filed', 'declined'].includes(sheet.status);
  const urgentWaiting = sheet.urgentAt && !sheet.urgentDoneAt;
  const lastMail = (sheet.mail || [])[sheet.mail?.length - 1];
  return (
    <article id={`sheet-${sheet.id}`} className="bg-white rounded-2xl shadow-sm border p-4 space-y-3" style={{ borderRightWidth: 4, borderRightColor: TONE_COLOR[sheet.glow?.tone] || '#cbd5e1' }}>
      <header className="flex flex-wrap items-center gap-2 justify-between">
        <h3 className="font-bold text-slate-800">#{sheet.number} — {sheet.title}</h3>
        <div className="flex flex-wrap gap-1">
          {sheet.general && <Badge tone="needs-owner">درخواستِ عمومی</Badge>}
          <Badge tone={sheet.status}>{sheet.statusLabel}</Badge>
          {sheet.status === 'answered' && <Badge tone={sheet.glow?.tone}>{sheet.glow?.label}</Badge>}
          {urgentWaiting && <Badge tone="not-done">⚡ فوری</Badge>}
          {sheet.urgentDoneAt && !urgentWaiting && <Badge tone="fixed">⚡ جواب گرفت</Badge>}
          {sheet.binderNumber ? <Badge tone="filed">زونکن {sheet.binderNumber} / برگ {sheet.binderPage}</Badge> : null}
        </div>
      </header>
      <p className="text-xs text-slate-500">
        {sheet.createdBy} · {new Date(sheet.createdAt).toLocaleString('fa-IR')}
        {!sheet.general && (
          <> · صفحه: {sheet.pageLabel || sheet.page || '—'} ·{' '}
            <button className="underline text-teal-700" onClick={() => { requestFocus(sheet.id); onReopenPage(sheet); }}>↗ رفتن به همان‌جا</button>
          </>
        )}
      </p>
      {!sheet.general && (sheet.geometry || sheet.env) && (
        <details className="text-[11px] text-slate-600 bg-slate-50 rounded p-2" data-testid="sheet-coords">
          <summary className="cursor-pointer">📐 مختصات و محیط</summary>
          <dl className="mt-1 space-y-0.5">
            {describeGeometry(sheet.geometry).map(([k, v]) => <div key={k} className="flex gap-2"><dt className="font-medium shrink-0">{k}:</dt><dd className="break-all" dir="ltr">{v}</dd></div>)}
            {sheet.env && <div className="flex gap-2"><dt className="font-medium shrink-0">مرورگر:</dt><dd className="break-all" dir="ltr">{sheet.env.viewport?.w}×{sheet.env.viewport?.h} · dpr {sheet.env.dpr} · {sheet.env.theme} · {sheet.env.language}</dd></div>}
          </dl>
        </details>
      )}
      {urgentWaiting && rounds?.urgent && (
        <p className="text-xs text-orange-800 bg-orange-50 rounded p-2">{rushMessage(1, rounds.urgent).replace(/^در صفِ فوری، نفرِ اول · /, '⚡ ')}</p>
      )}
      {sheet.status === 'declined' && (
        <p className="text-xs text-red-700">ردِ مدیر{sheet.triageNote ? `: ${sheet.triageNote}` : ' (بدونِ دلیل)'}</p>
      )}
      {lastMail && MAIL_LABEL[lastMail.status] && <p className="text-[11px] text-slate-500">✉ {MAIL_LABEL[lastMail.status]}</p>}
      {sheet.glow?.hint && <p className="text-xs bg-slate-50 rounded p-2 text-slate-600">{sheet.glow.hint}</p>}
      <ol className="space-y-2">
        {(sheet.notes || []).map((n) => (
          <li key={n.id} className={`rounded-xl p-3 text-sm ${n.by === 'reviewer' ? 'bg-emerald-50' : 'bg-slate-50'}`}>
            <div className="flex flex-wrap gap-2 items-center text-xs text-slate-500 mb-1">
              <b>{WHO[n.by] || n.by}</b><span>{new Date(n.at).toLocaleString('fa-IR')}</span>
              {n.outcome && <Badge tone={n.outcome === 'fixed' && !n.afterShotId ? 'partial' : n.outcome}>{n.outcome}</Badge>}
              {n.editedAt && <span title={n.originalText ? `متنِ اول: ${n.originalText}` : ''}>(ویرایش شد)</span>}
              {canEdit(n) && editing?.noteId !== n.id && (
                <button className="text-teal-700" onClick={() => setEditing({ noteId: n.id, text: n.text })}>✏ ویرایش</button>
              )}
            </div>
            {editing?.noteId === n.id ? (
              <div className="space-y-1">
                <textarea value={editing.text} rows={3} onChange={(e) => setEditing({ ...editing, text: e.target.value })} className="w-full border rounded-lg p-2 text-sm" />
                <div className="flex gap-2 items-center text-xs">
                  <button disabled={busy || !editing.text.trim()} onClick={() => act(async () => { await api.editNote(sheet.id, n.id, editing.text); setEditing(null); })} className="px-3 py-1 rounded bg-teal-600 text-white disabled:bg-slate-300">ذخیرهٔ ویرایش</button>
                  <button onClick={() => setEditing(null)} className="text-slate-600">انصراف</button>
                  <span className="text-slate-400">متنِ اولیه نگه داشته می‌شود</span>
                </div>
              </div>
            ) : (
              <p className="whitespace-pre-wrap text-slate-800">{n.text}</p>
            )}
            {n.editedAt && n.originalText && <details className="text-[11px] text-slate-500 mt-1"><summary>متنِ اولیه</summary><p className="whitespace-pre-wrap">{n.originalText}</p></details>}
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
      <section className="rounded-xl border border-sky-200 bg-sky-50/50 p-2 space-y-1">
        <div className="text-xs font-bold text-sky-900">📎 پیوست‌ها {sheet.files?.length ? `(${fa(sheet.files.length)})` : ''}
          {sheet.detachedFiles ? <span className="font-normal text-slate-500"> · {fa(sheet.detachedFiles)} پیوستِ برداشته‌شده (نگه داشته شده)</span> : null}
        </div>
        {!sheet.files?.length && <p className="text-[11px] text-slate-500">فایلی پیوست نشده — هر نوعی می‌شود: ورد، PDF، عکس، اکسل…</p>}
        {(sheet.files || []).map((f) => (
          <div key={f.id} className="flex flex-wrap gap-2 items-center text-xs bg-white rounded-lg px-2 py-1">
            <span className="font-medium">{f.filename}</span>
            <span className="text-slate-500">{Math.ceil(f.byteSize / 1024)}KB</span>
            <span className={f.fullyRead ? 'text-emerald-700' : 'text-amber-700'}>
              {f.fullyRead ? '✓ ناظر کامل خواند' : f.extractStatus === 'ok' ? `ناظر ${fa(f.readPercent ?? 0)}٪ خوانده` : 'ناظر هنوز بازش نکرده'}
            </span>
            <span className="text-slate-400">{f.extractLabel}</span>
            {f.extractNote && <span className="text-amber-700">{f.extractNote}</span>}
            <span className="flex-1" />
            <button className="text-sky-700 underline" onClick={() => act(() => api.download(f.id, f.filename))}>دانلود</button>
            {isOwner && !closed && (
              <button className="text-red-600" title="از برگه برداشته می‌شود؛ خودِ فایل نگه داشته می‌شود"
                onClick={() => { if (window.confirm(`«${f.filename}» از این برگه برداشته شود؟ (فایل نگه داشته می‌شود)`)) act(() => api.detachFile(f.id)); }}>✕ برداشتن</button>
            )}
          </div>
        ))}
        {sheet.readDebt?.length > 0 && <p className="text-xs text-amber-700">ناظر تا این‌ها را کامل نخواند نمی‌تواند جواب بدهد: {sheet.readDebt.map((d) => d.filename).join('، ')}</p>}
      </section>
      {!closed && (
        <div className="space-y-2">
          <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={2} placeholder="یادداشتِ تازه زیرِ این برگه… (برای اصلاحِ خودِ متن، ✏ ویرایش)" className="w-full border rounded-xl p-2 text-sm" />
          <label className="text-xs text-slate-600 block">📎 پیوستِ فایل (هر نوعی): <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} className="text-xs" /></label>
          <div className="flex flex-wrap gap-2">
            <button disabled={busy || (!reply.trim() && !files.length)} onClick={sendNote} className="px-3 py-1.5 rounded-lg text-sm bg-slate-700 text-white disabled:bg-slate-300">ثبتِ یادداشت / پیوست</button>
            {isOwner && sheet.status === 'answered' && <button disabled={busy} onClick={() => act(() => api.approve(sheet.id))} className="px-3 py-1.5 rounded-lg text-sm bg-blue-600 text-white">✔ تیکِ تأیید</button>}
            {isOwner && ['answered', 'approved'].includes(sheet.status) && <button disabled={busy} onClick={() => act(() => api.reopen(sheet.id))} className="px-3 py-1.5 rounded-lg text-sm bg-amber-500 text-white">بازکردنِ دوباره</button>}
            {isOwner && sheet.status === 'pending' && (
              <>
                <button disabled={busy} onClick={accept} className="px-3 py-1.5 rounded-lg text-sm bg-green-600 text-white">پذیرش و ارسال به ناظر</button>
                <button disabled={busy} onClick={decline} className="px-3 py-1.5 rounded-lg text-sm bg-red-500 text-white">رد با دلیل (نگه داشته می‌شود)</button>
              </>
            )}
            {isOwner && sheet.status !== 'pending' && (
              <button disabled={busy} onClick={rush} className="px-3 py-1.5 rounded-lg text-sm bg-orange-100 text-orange-800">
                {urgentWaiting ? 'لغوِ فوری' : '⚡ فوری'}
              </button>
            )}
          </div>
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </article>
  );
}

function GeneralRequestForm({ api, isOwner, onDone, onCancel }) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [urgent, setUrgent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const { sheet } = await api.create({ text, general: true, page: 'general', pageLabel: 'درخواستِ عمومی', reopen: '#/inspection', urgent: isOwner && urgent });
      if (files.length) await api.upload(sheet.id, files);
      onDone(`درخواستِ عمومیِ ${fa(sheet.number)} ثبت شد — ${sheet.statusLabel}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="rounded-2xl border border-violet-300 bg-violet-50 p-3 space-y-2">
      <div className="text-sm font-bold text-violet-900">درخواستِ عمومی</div>
      <p className="text-xs text-violet-800">خواسته‌ای که به جای مشخصی از صفحه‌ها گره نخورده — همان صف، رنگ‌ها، ⚡ فوری و بایگانی؛ فقط کادری روی صفحه ندارد.</p>
      <textarea value={text} autoFocus rows={4} onChange={(e) => setText(e.target.value)} placeholder="چه می‌خواهید؟" className="w-full border rounded-xl p-2 text-sm" />
      <label className="text-xs text-slate-700 block">📎 پیوست (هر نوعی): <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} /></label>
      {isOwner && <label className="flex items-center gap-2 text-sm text-orange-800"><input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} /> ⚡ فوری</label>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button disabled={busy || !text.trim()} onClick={submit} className="px-4 py-1.5 rounded-lg bg-violet-700 text-white text-sm disabled:bg-slate-300">ثبتِ درخواست</button>
        <button onClick={onCancel} className="px-3 py-1.5 rounded-lg bg-slate-200 text-sm">انصراف</button>
      </div>
    </div>
  );
}

/** Which urgent-watched sheets changed (answered/discharged) between two polls. */
export function urgentChanges(prevStates, sheets) {
  const changed = [];
  const next = {};
  for (const s of sheets) {
    if (!(s.urgentAt || s.urgentDoneAt)) continue;
    const now = `${s.status}|${s.notes?.length || 0}`;
    const before = prevStates[s.id];
    if (before && before !== now && (s.urgentDoneAt || s.status === 'answered')) {
      changed.push({ number: s.number, title: s.title, label: s.glow?.label || s.status });
    }
    next[s.id] = now;
  }
  return { changed, states: next };
}

export default function InspectionBoard({ api, onReopenPage, pollMs = 20000 }) {
  const [data, setData] = useState(null);
  const [rounds, setRounds] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('active');
  const [query, setQuery] = useState('');
  const [general, setGeneral] = useState(false);
  const [notice, setNotice] = useState(null);
  const [done, setDone] = useState([]);
  const [, setTick] = useState(0);
  const states = useRef({});

  const load = useCallback(async ({ quiet = false } = {}) => {
    try {
      const d = await api.list();
      const { changed, states: next } = urgentChanges(states.current, d.sheets || []);
      states.current = next;
      if (quiet && changed.length) setDone((prev) => [...changed, ...prev].slice(0, 5));
      setData(d);
      setError(null);
    } catch (e) {
      if (!quiet) setError(e.message);
    }
    try { if (api.rounds) setRounds(await api.rounds()); } catch { /* the countdown is a courtesy */ }
  }, [api]);
  useEffect(() => { load(); }, [load]);

  // Auto-refresh while something is waiting in the fast queue (and on focus);
  // an idle board does not poll. The clock text refreshes every 30 s.
  const watching = useMemo(() => (data?.sheets || []).some((s) => s.urgentAt && !s.urgentDoneAt), [data]);
  useEffect(() => {
    if (!watching) return undefined;
    const t = setInterval(() => load({ quiet: true }), pollMs);
    const onFocus = () => load({ quiet: true });
    window.addEventListener('focus', onFocus);
    return () => { clearInterval(t); window.removeEventListener('focus', onFocus); };
  }, [watching, load, pollMs]);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30000);
    return () => clearInterval(t);
  }, []);

  const isOwner = data?.me?.role === 'owner';
  const shown = useMemo(() => {
    const t = TABS.find((x) => x.key === tab) || TABS[0];
    const q = query.trim().toLowerCase();
    return (data?.sheets || []).filter(t.match).filter((s) => !q || sheetText(s).includes(q)).sort((a, b) => b.number - a.number);
  }, [data, tab, query]);
  const say = (msg) => { setNotice(msg); setTimeout(() => setNotice(null), 8000); };
  return (
    <div dir="rtl" className="max-w-4xl mx-auto space-y-4">
      {done.length > 0 && (
        <div role="status" className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900">
          <div className="flex justify-between"><b>⚡ ناظر روی موردهای فوری کار کرد:</b><button onClick={() => setDone([])}>✕</button></div>
          <ul className="mt-1">{done.map((d) => <li key={d.number}>برگهٔ {fa(d.number)} — {d.title} · {d.label}</li>)}</ul>
          <p className="text-xs mt-1">صفحه خودش به‌روز شد.</p>
        </div>
      )}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h1 className="text-2xl font-bold text-slate-800">نظارت و سرکشی</h1>
        <button onClick={() => setGeneral((g) => !g)} className="px-3 py-1.5 rounded-lg bg-violet-700 text-white text-sm">＋ درخواستِ عمومی</button>
      </div>
      <p className="text-sm text-slate-600">
        با دکمهٔ «📝 نظارت» (پایینِ صفحه) روی هر صفحه کادر بکشید و بنویسید؛ برای خواسته‌ای که جای مشخصی ندارد «درخواستِ عمومی».
        ناظرِ خودکار برگه‌ها را می‌خواند، کار را انجام می‌دهد و زیرِ برگه با «نتیجه» و مدرک جواب می‌دهد؛ تیکِ تأیید فقط با شماست.
      </p>
      <RoundsBar rounds={rounds} />
      {notice && <div role="status" className="bg-slate-800 text-white rounded-xl p-2 text-sm">{notice}</div>}
      {general && <GeneralRequestForm api={api} isOwner={isOwner} onCancel={() => setGeneral(false)} onDone={(m) => { setGeneral(false); say(m); load(); }} />}
      {data?.store && !data.store.durable && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-sm">⚠️ {data.store.note}</div>
      )}
      {error && <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm">{error}</div>}
      <nav className="flex flex-wrap gap-2 items-center">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-3 py-1.5 rounded-full text-sm ${tab === t.key ? 'bg-slate-800 text-white' : 'bg-white border'}`}>
            {t.label} ({(data?.sheets || []).filter(t.match).length})
          </button>
        ))}
        <button onClick={() => load()} className="px-3 py-1.5 rounded-full text-sm bg-white border">↻ تازه‌سازی</button>
      </nav>
      <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="جستجو در برگه‌ها (شماره، متن، یادداشت‌ها، فایل‌ها)…" className="w-full border rounded-xl p-2 text-sm" />
      {!data && !error && <p className="text-slate-500">در حالِ بارگذاری…</p>}
      {data && shown.length === 0 && <p className="text-slate-500">{query ? 'چیزی با این جستجو پیدا نشد.' : 'برگه‌ای در این بخش نیست.'}</p>}
      {shown.map((s) => (
        <SheetCard key={s.id} api={api} sheet={s} isOwner={isOwner} me={data?.me} rounds={rounds}
          onChanged={() => load()} onReopenPage={onReopenPage} onNotice={say} />
      ))}
    </div>
  );
}
