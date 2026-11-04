// Purpose: the on-page half of «نظارت و سرکشی». A floating «📝 نظارت» button
// (for any signed-in, approved user) turns on drawing: drag a box over anything
// on any page, write what is wrong, paste a picture, attach files, and file the
// sheet. Existing sheets of the current page are shown as highlights:
// orange = waiting for the supervisor · green = fixed (with proof) · yellow =
// partial/not-done/needs-owner · blue = the owner's tick.
//
// Upstream: ./api.js, ./geometry.js. Downstream: mounted by components/App.jsx.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { captureGeometry, coveredText, rectFromPoints, resolveRect, buildSelector } from './geometry.js';
import { takeFocus } from './focus.js';
import { captureEnv, captureViewportShot, describeGeometry } from './capture.js';

export const TONE_COLOR = {
  open: '#f97316', pending: '#f59e0b', stale: '#f97316',
  fixed: '#16a34a', partial: '#eab308', 'not-done': '#dc2626', 'needs-owner': '#a855f7',
  approved: '#2563eb', filed: '#64748b', declined: '#94a3b8',
};

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function SheetForm({ isOwner, draft, autoShot, shotPending, onCancel, onSubmit, busy, error }) {
  const [text, setText] = useState('');
  const [dropAuto, setDropAuto] = useState(false);
  const [files, setFiles] = useState([]);
  const [shot, setShot] = useState(null);
  const [urgent, setUrgent] = useState(false);
  const onPaste = async (e) => {
    const item = Array.from(e.clipboardData?.items || []).find((i) => i.type.startsWith('image/'));
    if (item) {
      e.preventDefault();
      setShot(await readAsDataUrl(item.getAsFile()));
    }
  };
  return (
    <div dir="rtl" className="fixed inset-0 z-[10001] bg-black/40 flex items-center justify-center p-4" data-inspection-ui="1">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-5 space-y-3">
        <h3 className="text-lg font-bold text-slate-800">برگهٔ نظارت — {draft.pageLabel || draft.page}</h3>
        {draft.coveredText && <p className="text-xs text-slate-500 line-clamp-2">زیرِ کادر: «{draft.coveredText.slice(0, 160)}»</p>}
        {draft.geometry && (
          <details open className="text-[11px] text-slate-600 bg-slate-50 rounded-lg p-2" data-testid="inspection-coords">
            <summary className="cursor-pointer font-bold">📐 مختصات و محیط (خودکار ثبت می‌شود)</summary>
            <dl className="mt-1 space-y-0.5">
              {describeGeometry(draft.geometry).map(([k, v]) => <div key={k} className="flex gap-2"><dt className="font-medium shrink-0">{k}:</dt><dd className="break-all" dir="ltr">{v}</dd></div>)}
              <div className="flex gap-2"><dt className="font-medium shrink-0">مسیر:</dt><dd className="break-all" dir="ltr">{draft.reopen}</dd></div>
            </dl>
          </details>
        )}
        {!shot && !dropAuto && (shotPending || autoShot) && (
          <div className="text-xs text-slate-600 space-y-1" data-testid="inspection-autoshot">
            {shotPending && !autoShot ? <p>در حالِ گرفتنِ اسکرین‌شاتِ صفحه…</p> : (
              <>
                <img src={autoShot} alt="اسکرین‌شاتِ خودکار" className="max-h-40 rounded border" />
                <button onClick={() => setDropAuto(true)} className="text-red-600">حذفِ اسکرین‌شاتِ خودکار</button>
              </>
            )}
          </div>
        )}
        <textarea
          autoFocus value={text} onChange={(e) => setText(e.target.value)} onPaste={onPaste} rows={5}
          placeholder="چه چیزی اشتباه است یا چه می‌خواهید؟ (برای افزودنِ تصویر، Ctrl+V)"
          className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
        {shot && (
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <img src={shot} alt="تصویرِ پیوست" className="h-16 rounded border" />
            <button onClick={() => setShot(null)} className="text-red-600">حذفِ تصویر</button>
          </div>
        )}
        <label className="block text-sm text-slate-700">
          پیوست (هر نوع فایل، هرکدام تا ۲۵MB — متنش هنگامِ آپلود استخراج و برای ناظر الزامیِ خواندن می‌شود):
          <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} className="block mt-1 text-xs" />
        </label>
        {isOwner && (
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} /> ⚡ فوری (روتینِ ساعتی برمی‌دارد)
          </label>
        )}
        {!isOwner && <p className="text-xs text-amber-700">برگهٔ شما پس از تأییدِ مدیر به ناظر می‌رسد.</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-sm">انصراف</button>
          <button
            disabled={busy || !text.trim()} onClick={() => onSubmit({ text, files, shot: shot || (dropAuto ? null : autoShot), urgent })}
            className="px-4 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:bg-slate-300 text-sm"
          >{busy ? 'در حالِ ثبت…' : 'ثبتِ برگه'}</button>
        </div>
      </div>
    </div>
  );
}

export default function InspectionLayer({ api, isOwner, page, pageLabel, reopen, onOpenBoard }) {
  const [drawing, setDrawing] = useState(false);
  const [drag, setDrag] = useState(null);
  const [draft, setDraft] = useState(null);
  const [autoShot, setAutoShot] = useState(null);
  const [shotPending, setShotPending] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [showHighlights, setShowHighlights] = useState(true);
  const [, setTick] = useState(0);
  const [flashId, setFlashId] = useState(null);
  const overlayRef = useRef(null);
  const focusRef = useRef(takeFocus()); // «رفتن به همان‌جا» from the board

  const load = useCallback(async () => {
    try {
      const data = await api.list({ page });
      setSheets((data.sheets || []).filter((s) => !['filed', 'declined'].includes(s.status)));
    } catch {
      setSheets([]);
    }
  }, [api, page]);

  useEffect(() => { load(); }, [load]);

  // Bring the requested sheet's box into view and flash it for a few seconds.
  useEffect(() => {
    const id = focusRef.current;
    if (!id || !sheets.length) return undefined;
    const s = sheets.find((x) => String(x.id) === String(id));
    if (!s) return undefined;
    focusRef.current = null;
    setShowHighlights(true);
    const r = resolveRect(s.geometry, window);
    if (r) window.scrollBy({ top: r.y - window.innerHeight / 3, behavior: 'smooth' });
    setFlashId(s.id);
    const t = setTimeout(() => setFlashId(null), 4000);
    return () => clearTimeout(t);
  }, [sheets]);

  // Re-place highlights on scroll/resize.
  useEffect(() => {
    if (!sheets.length || !showHighlights) return undefined;
    const bump = () => setTick((t) => t + 1);
    window.addEventListener('scroll', bump, true);
    window.addEventListener('resize', bump);
    const iv = setInterval(bump, 1500);
    return () => { window.removeEventListener('scroll', bump, true); window.removeEventListener('resize', bump); clearInterval(iv); };
  }, [sheets.length, showHighlights]);

  const point = (e) => {
    const t = e.touches?.[0] || e.changedTouches?.[0] || e;
    return { x: t.clientX, y: t.clientY };
  };
  const onDown = (e) => { e.preventDefault(); const p = point(e); setDrag({ a: p, b: p }); };
  const onMove = (e) => { if (drag) setDrag({ ...drag, b: point(e) }); };
  const onUp = (e) => {
    if (!drag) return;
    const rect = rectFromPoints(drag.a, point(e));
    setDrag(null);
    if (rect.w < 8 || rect.h < 8) return;
    // Look UNDER the overlay for the element the box covers.
    if (overlayRef.current) overlayRef.current.style.pointerEvents = 'none';
    const anchor = document.elementFromPoint(rect.x + rect.w / 2, rect.y + rect.h / 2);
    if (overlayRef.current) overlayRef.current.style.pointerEvents = 'auto';
    const geometry = captureGeometry(rect, anchor, window);
    setDrawing(false);
    setAutoShot(null);
    setShotPending(true);
    setDraft({ page, pageLabel, reopen, geometry, env: captureEnv(window), domPath: anchor ? buildSelector(anchor) : '', coveredText: coveredText(anchor) });
    // The screenshot is taken now (the page is exactly as the person saw it).
    captureViewportShot(rect, window).then((u) => { setAutoShot(u); setShotPending(false); });
  };

  const submit = async ({ text, files, shot, urgent }) => {
    setBusy(true);
    setError(null);
    try {
      const { sheet } = await api.create({ ...draft, text, shot, urgent });
      if (files.length) await api.upload(sheet.id, files);
      setDraft(null);
      setNotice(`برگهٔ ${sheet.number} ثبت شد — ${sheet.statusLabel}`);
      setTimeout(() => setNotice(null), 5000);
      load();
    } catch (e) {
      setError(e.message || 'ثبت نشد');
    } finally {
      setBusy(false);
    }
  };

  const live = drag ? rectFromPoints(drag.a, drag.b) : null;
  return (
    <>
      {showHighlights && sheets.map((s) => {
        const r = resolveRect(s.geometry, window);
        if (!r) return null;
        const color = TONE_COLOR[s.glow?.tone] || TONE_COLOR.open;
        return (
          <div key={s.id} data-inspection-ui="1" title={`برگهٔ ${s.number}: ${s.title} — ${s.glow?.label || ''}`}
            onClick={onOpenBoard}
            data-flash={flashId === s.id ? '1' : undefined}
            style={{ position: 'fixed', left: r.x, top: r.y, width: r.w, height: r.h, border: `${flashId === s.id ? 4 : 2}px solid ${color}`, background: `${color}${flashId === s.id ? '40' : '14'}`, borderRadius: 6, zIndex: 9990, cursor: 'pointer', boxShadow: flashId === s.id ? `0 0 0 6px ${color}55` : 'none', transition: 'all .3s' }}>
            <span style={{ position: 'absolute', top: -10, right: -10, background: color, color: '#fff', fontSize: 11, borderRadius: 9999, padding: '0 6px' }}>{s.number}</span>
          </div>
        );
      })}
      <div dir="rtl" data-inspection-ui="1" className="fixed bottom-6 left-24 z-[9995] flex flex-col items-start gap-2">
        {notice && <div className="bg-slate-800 text-white text-sm px-3 py-2 rounded-lg shadow">{notice}</div>}
        <div className="flex gap-2">
          <button onClick={() => setDrawing((d) => !d)} aria-pressed={drawing}
            className={`px-4 py-2 rounded-full shadow-lg text-sm font-bold ${drawing ? 'bg-orange-500 text-white' : 'bg-white text-slate-800 border'}`}>
            📝 {drawing ? 'کادر بکشید… (لغو)' : 'نظارت'}
          </button>
          {sheets.length > 0 && (
            <button onClick={() => setShowHighlights((v) => !v)} className="px-3 py-2 rounded-full shadow bg-white border text-xs">
              {showHighlights ? 'پنهانِ کادرها' : `نمایشِ ${sheets.length} کادر`}
            </button>
          )}
        </div>
      </div>
      {drawing && (
        <div ref={overlayRef} data-inspection-ui="1" onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp}
          onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
          style={{ position: 'fixed', inset: 0, zIndex: 10000, cursor: 'crosshair', background: 'rgba(15,23,42,0.08)', touchAction: 'none' }}>
          {live && <div style={{ position: 'fixed', left: live.x, top: live.y, width: live.w, height: live.h, border: '2px dashed #f97316', background: 'rgba(249,115,22,0.12)' }} />}
        </div>
      )}
      {draft && <SheetForm isOwner={isOwner} draft={draft} autoShot={autoShot} shotPending={shotPending} busy={busy} error={error} onCancel={() => { setDraft(null); setError(null); }} onSubmit={submit} />}
    </>
  );
}
