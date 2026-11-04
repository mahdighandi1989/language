// Purpose: «🎧 صوت و ویدیوی درس» — play the lesson's stored audio/video
// originals (fetched with the user's token from /api/lesson-files/…/raw) and
// linked media (YouTube, Google Drive /preview, direct https audio/video).
// Nothing autoplays; utils/singleMedia.js keeps one playing at a time.
// Links live in lesson.mediaLinks [{id, url, title, kind}] (removal = confirm).
import React, { useEffect, useRef, useState } from 'react';
import { parseMediaLink, isPlayableFile } from './mediaLinks.js';

function StoredPlayer({ lessonId, file, kind }) {
  const [url, setUrl] = useState(null);
  const [state, setState] = useState('idle');
  const urlRef = useRef(null);
  useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current); }, []);
  const load = async () => {
    setState('loading');
    try {
      const res = await fetch(`/api/lesson-files/${lessonId}/${file.id}/raw`);
      if (!res.ok) throw new Error(String(res.status));
      urlRef.current = URL.createObjectURL(await res.blob());
      setUrl(urlRef.current);
      setState('ready');
    } catch {
      setState('error');
    }
  };
  if (url) return kind === 'video'
    ? <video controls preload="metadata" playsInline className="w-full rounded-lg bg-black max-h-[60vh]" src={url} />
    : <audio controls preload="metadata" className="w-full" src={url} />;
  return (
    <button onClick={load} disabled={state === 'loading'} className="px-3 py-2 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 disabled:opacity-60 text-sm">
      {state === 'loading' ? '⏳ در حالِ آماده‌سازی…' : state === 'error' ? '⚠️ اصلِ فایل در دسترس نیست — دوباره' : `▶️ پخش ${kind === 'video' ? 'ویدیو' : 'صوت'}`}
    </button>
  );
}

function LinkPlayer({ link }) {
  const p = parseMediaLink(link.url);
  if (!p) return <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-teal-700 underline text-sm break-all">{link.url}</a>;
  if (p.kind === 'audio') return <audio controls preload="none" className="w-full" src={p.url} />;
  if (p.kind === 'video') return <video controls preload="none" playsInline className="w-full rounded-lg bg-black max-h-[60vh]" src={p.url} />;
  return (
    <div className="relative w-full overflow-hidden rounded-lg bg-black" style={{ paddingTop: '56.25%' }}>
      <iframe title={link.title || p.kind} src={p.embed} className="absolute inset-0 w-full h-full" loading="lazy"
        allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
    </div>
  );
}

export default function LessonMedia({ lesson, updateLesson }) {
  const [input, setInput] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const files = (lesson.files || []).map((f) => ({ f, kind: isPlayableFile(f) })).filter((x) => x.kind);
  const links = lesson.mediaLinks || [];

  const add = () => {
    const p = parseMediaLink(input);
    if (!p) { setError('لینک پشتیبانی نمی‌شود: یوتیوب، فایلِ گوگل‌درایو، یا آدرسِ مستقیمِ https ِ صوت/ویدیو.'); return; }
    if (links.some((l) => parseMediaLink(l.url)?.url === p.url)) { setError('این لینک قبلاً اضافه شده است.'); return; }
    updateLesson(lesson.id, { mediaLinks: [...links, { id: `m${Date.now().toString(36)}`, url: p.url, kind: p.kind, title: title.trim(), addedAt: new Date().toISOString() }] });
    setInput(''); setTitle(''); setError('');
  };
  const remove = (l) => {
    if (!window.confirm(`«${l.title || l.url}» از رسانه‌های این درس برداشته شود؟`)) return;
    updateLesson(lesson.id, { mediaLinks: links.filter((x) => x.id !== l.id) });
  };

  return (
    <section dir="rtl" className="bg-white p-6 rounded-2xl shadow-md space-y-4" data-testid="lesson-media">
      <h3 className="text-xl font-bold text-slate-800">🎧 صوت و ویدیوی درس</h3>
      {files.length === 0 && links.length === 0 && <p className="text-sm text-slate-500">هنوز صوت/ویدیویی برای این درس نیست. فایل را با «آپلودِ هوشمند» بفرستید یا لینکِ یوتیوب/درایو بگذارید.</p>}
      {files.map(({ f, kind }) => (
        <div key={f.id} className="space-y-2 border-b pb-3 last:border-b-0">
          <p className="text-sm font-medium text-slate-700 break-all">{kind === 'video' ? '🎬' : '🎵'} {f.name}</p>
          {f.stored ? <StoredPlayer lessonId={lesson.id} file={f} kind={kind} /> : <p className="text-xs text-slate-500">اصلِ این فایل ذخیره نشده بود (فقط برای تحلیل فرستاده شد)؛ برای پخش، دوباره با «آپلودِ هوشمند» بفرستید.</p>}
        </div>
      ))}
      {links.map((l) => (
        <div key={l.id} className="space-y-2 border-b pb-3 last:border-b-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-700 truncate">{l.kind === 'youtube' ? '▶️' : l.kind === 'drive' ? '📁' : '🔗'} {l.title || l.url}</p>
            <button onClick={() => remove(l)} className="text-xs text-red-600 hover:underline shrink-0">برداشتن</button>
          </div>
          <LinkPlayer link={l} />
        </div>
      ))}
      <div className="flex flex-col sm:flex-row gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="لینکِ یوتیوب، گوگل‌درایو یا فایلِ صوت/ویدیو" className="flex-1 p-2 border rounded-lg text-sm" dir="ltr" />
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان (اختیاری)" className="sm:w-48 p-2 border rounded-lg text-sm" />
        <button onClick={add} disabled={!input.trim()} className="px-4 py-2 rounded-lg bg-teal-500 text-white disabled:opacity-50 text-sm">افزودن</button>
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-slate-400">فایلِ درایو باید با همین حسابِ گوگل قابلِ دیدن باشد (یا «هر کس با لینک»). اتصالِ مستقیمِ پوشهٔ درایو پس از ساختنِ OAuth توسطِ مالک (docs/drive-plan.md).</p>
    </section>
  );
}
