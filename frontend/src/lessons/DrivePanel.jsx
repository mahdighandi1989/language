// Purpose: «☁️ Google Drive» in the admin panel — status, connect (owner's
// one-time Google consent, scope drive.file), disconnect, and «copy earlier
// files». The browser never sees a token. Server: backend/routes/drive.js.
import React, { useEffect, useState } from 'react';

export default function DrivePanel({ lessons = [], fetchImpl = (...a) => fetch(...a) }) {
  const [st, setSt] = useState(null);
  const [msg, setMsg] = useState(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const r = p.get('drive');
      if (!r) return '';
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.hash}`);
      return r === 'ok' ? '✅ Google Drive وصل شد.' : `⚠️ اتصال انجام نشد: ${p.get('reason') || r}`;
    } catch { return ''; }
  });
  const [busy, setBusy] = useState('');
  const load = async () => {
    try {
      const res = await fetchImpl('/api/drive/status');
      setSt(res.ok ? await res.json() : { error: (await res.json().catch(() => ({}))).error || res.status });
    } catch (e) { setSt({ error: e.message }); }
  };
  useEffect(() => { load(); }, []);
  const connect = async () => {
    setBusy('connect');
    const res = await fetchImpl('/api/drive/connect', { method: 'POST' });
    const body = await res.json().catch(() => ({}));
    if (body.url) window.location.assign(body.url); else { setMsg(`⚠️ ${body.error || res.status}`); setBusy(''); }
  };
  const disconnect = async () => {
    if (!window.confirm('اتصالِ Google Drive قطع شود؟ (فایل‌هایی که در Drive هست می‌مانند)')) return;
    await fetchImpl('/api/drive/disconnect', { method: 'POST' });
    setMsg('اتصال قطع شد.'); load();
  };
  const sync = async () => {
    const withFiles = lessons.filter((l) => (l.files || []).some((f) => f.stored));
    let copied = 0;
    for (let i = 0; i < withFiles.length; i += 1) {
      setBusy(`انتقالِ فایل‌های درسِ ${i + 1} از ${withFiles.length}…`);
      // eslint-disable-next-line no-await-in-loop
      const res = await fetchImpl(`/api/drive/sync/${withFiles[i].id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lessonTitle: withFiles[i].title }) });
      // eslint-disable-next-line no-await-in-loop
      if (res.ok) copied += (await res.json()).copied || 0;
    }
    setBusy(''); setMsg(`✅ ${copied} فایلِ قبلی در Drive کپی شد (نسخهٔ دیتابیس می‌ماند).`);
  };

  return (
    <section dir="rtl" className="bg-white rounded-xl shadow-sm border p-4 space-y-2 text-sm" data-testid="drive-panel">
      <h2 className="font-bold text-slate-800">☁️ Google Drive (نسخهٔ دوم از اصلِ فایل‌های درس)</h2>
      {!st && <p className="text-slate-500">در حالِ بررسی…</p>}
      {st?.error && <p className="text-red-600">وضعیت خوانده نشد: {String(st.error)}</p>}
      {st && !st.error && !st.configured && (
        <p className="text-amber-800 bg-amber-50 rounded p-2">هنوز آماده نیست: روی Render این متغیرها لازم است: <b dir="ltr">{st.missing.join(', ')}</b> — راهنما: <code>docs/drive-setup.md</code></p>
      )}
      {st?.configured && !st.connected && <button onClick={connect} disabled={!!busy} className="px-4 py-2 rounded-lg bg-teal-600 text-white disabled:opacity-50">🔗 اتصالِ Google Drive</button>}
      {st?.connected && (
        <div className="space-y-2">
          <p>✅ وصل به <b dir="ltr">{st.email}</b>{st.connectedAt ? ` از ${new Date(st.connectedAt).toLocaleDateString('fa-IR')}` : ''}. فایل‌های تازهٔ «آپلودِ هوشمند» خودکار در «زبان/درس‌ها/‹درس›» کپی می‌شوند.</p>
          <div className="flex gap-2 flex-wrap">
            <button onClick={sync} disabled={!!busy} className="px-3 py-1.5 rounded-lg bg-teal-500 text-white disabled:opacity-50">انتقالِ فایل‌های قبلی به Drive</button>
            <button onClick={disconnect} disabled={!!busy} className="px-3 py-1.5 rounded-lg bg-slate-200">قطعِ اتصال</button>
          </div>
        </div>
      )}
      {busy && busy !== 'connect' && <p role="status" className="text-teal-700">⏳ {busy}</p>}
      {msg && <p role="status">{msg}</p>}
    </section>
  );
}
