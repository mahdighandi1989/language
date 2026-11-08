// Purpose: «🪞 تمرینِ تقلید (شادوینگ)» on the lesson page: pick a sentence of
// the lesson (verbatim), hear the teacher (normal or slow), record yourself,
// hear yourself, get a Gemini score + Persian tips, progress saved per lesson
// in data.shadowing. AI/TTS are injected (App.jsx passes its helpers).
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { extractPracticeSentences, stripTimestamp, recordAttempt, lessonShadowStats, parseVerdict, verdictPrompt, VERDICT_SCHEMA, sentenceKey } from './shadowing.js';

const blobToBase64 = (blob) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onloadend = () => resolve(String(r.result).split(',')[1] || '');
  r.onerror = reject;
  r.readAsDataURL(blob);
});

export default function Shadowing({ lesson, data, setData, callAI, tts, toWavUrl, voice = 'Charon', setModalConfig }) {
  const sentences = useMemo(() => extractPracticeSentences(lesson.archivedNotes), [lesson.archivedNotes]);
  const [index, setIndex] = useState(0);
  const [custom, setCustom] = useState('');
  const [busy, setBusy] = useState('');
  const [recording, setRecording] = useState(false);
  const [myUrl, setMyUrl] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [error, setError] = useState('');
  const teacherCache = useRef(new Map());
  const recRef = useRef(null);
  const audioRef = useRef(null);
  const blobRef = useRef(null);

  // Never a timestamp in what is shown, spoken or compared (also for a pasted sentence).
  const target = stripTimestamp(custom) || sentences[index]?.text || '';
  const time = custom.trim() ? '' : sentences[index]?.time || '';
  const meaning = custom.trim() ? '' : sentences[index]?.meaning || '';
  const progress = data?.shadowing?.[String(lesson.id)] || {};
  const row = target ? progress[sentenceKey(target)] : null;
  const stats = lessonShadowStats(data?.shadowing, lesson.id, sentences.length);

  useEffect(() => () => { recRef.current?.stream?.getTracks().forEach((t) => t.stop()); }, []);
  useEffect(() => { setVerdict(null); setMyUrl(null); setError(''); blobRef.current = null; }, [target]);

  const play = (url, rate = 1) => {
    audioRef.current?.pause();
    const a = new Audio(url);
    a.playbackRate = rate;
    a.preservesPitch = true;
    audioRef.current = a;
    return a.play().catch(() => setError('پخش ممکن نشد؛ یک بار روی صفحه بزنید و دوباره امتحان کنید.'));
  };

  const playTeacher = async (rate) => {
    if (!target) return;
    setError('');
    let url = teacherCache.current.get(target);
    if (!url) {
      setBusy('در حالِ ساختنِ صدای استاد…');
      try {
        const r = await tts(`Say clearly in Lebanese Arabic: ${target}`, voice);
        if (!r) throw new Error('no audio');
        url = toWavUrl(r.audioData, r.mimeType);
        teacherCache.current.set(target, url);
      } catch {
        setBusy('');
        setError('صدای استاد ساخته نشد (اتصال یا سهمیهٔ Gemini). دوباره امتحان کنید.');
        return;
      }
      setBusy('');
    }
    play(url, rate);
  };

  const startRec = async () => {
    setError(''); setVerdict(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('این مرورگر ضبطِ صدا را پشتیبانی نمی‌کند.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks = [];
      rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: rec.mimeType || 'audio/webm' });
        blobRef.current = blob;
        setMyUrl((old) => { if (old) URL.revokeObjectURL(old); return URL.createObjectURL(blob); });
        setRecording(false);
        score(blob);
      };
      rec.stream = stream;
      recRef.current = rec;
      rec.start();
      setRecording(true);
      setTimeout(() => { if (rec.state === 'recording') rec.stop(); }, 20000); // safety stop
    } catch {
      setError('دسترسی به میکروفون داده نشد.');
    }
  };
  const stopRec = () => { if (recRef.current?.state === 'recording') recRef.current.stop(); };

  const score = async (blob) => {
    if (!blob || blob.size < 1000) { setError('صدایی ضبط نشد؛ کمی بلندتر و طولانی‌تر بگویید.'); return; }
    setBusy('در حالِ سنجشِ تلفظ…');
    try {
      const raw = await callAI({
        contents: [{ role: 'user', parts: [{ text: verdictPrompt(target) }, { inline_data: { mime_type: (blob.type || 'audio/webm').split(';')[0], data: await blobToBase64(blob) } }] }],
        generationConfig: { temperature: 0, responseMimeType: 'application/json', responseSchema: VERDICT_SCHEMA },
      });
      const v = parseVerdict(raw);
      if (!v) throw new Error('bad verdict');
      setVerdict(v);
      setData?.((prev) => ({ ...prev, shadowing: recordAttempt(prev.shadowing, lesson.id, target, v.score) }));
    } catch {
      setError('سنجش ناموفق بود؛ دوباره امتحان کنید.');
    } finally {
      setBusy('');
    }
  };

  const go = (d) => { setCustom(''); setIndex((i) => Math.max(0, Math.min(sentences.length - 1, i + d))); };
  const color = (s) => (s >= 80 ? 'text-green-700 bg-green-50 border-green-200' : s >= 50 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-red-700 bg-red-50 border-red-200');

  return (
    <section dir="rtl" className="bg-white p-6 rounded-2xl shadow-md space-y-4" data-testid="shadowing">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xl font-bold text-slate-800">🪞 تمرینِ تقلید (شادوینگ)</h3>
        <span className="text-xs text-slate-500">{stats.practiced} از {stats.total} جمله تمرین شده · {stats.mastered} مسلط (۸۰+) · میانگینِ بهترین‌ها {stats.avg}</span>
      </div>
      {sentences.length === 0 && !custom && <p className="text-sm text-slate-500">در متنِ این درس جملهٔ عربیِ قابلِ‌تمرین پیدا نشد؛ جمله‌ای را در کادرِ زیر بنویسید.</p>}
      {sentences.length > 0 && (
        <div className="flex items-center gap-2">
          <button onClick={() => go(-1)} disabled={index === 0 || !!custom} className="px-3 py-1 rounded-lg bg-slate-100 disabled:opacity-40" aria-label="جملهٔ قبلی">→</button>
          <select value={index} onChange={(e) => { setCustom(''); setIndex(Number(e.target.value)); }} className="flex-1 min-w-0 p-2 border rounded-lg text-sm" aria-label="انتخابِ جمله">
            {sentences.map((s, i) => {
              const r = progress[sentenceKey(s.text)];
              return <option key={i} value={i}>{i + 1}. {s.text}{s.time ? ` (${s.time})` : ''}{r ? ` — ${r.best}` : ''}</option>;
            })}
          </select>
          <button onClick={() => go(1)} disabled={index >= sentences.length - 1 || !!custom} className="px-3 py-1 rounded-lg bg-slate-100 disabled:opacity-40" aria-label="جملهٔ بعدی">←</button>
        </div>
      )}
      <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="یا جملهٔ دلخواه را بنویسید…" className="w-full p-2 border rounded-lg text-sm" dir="auto" />
      {target && (
        <div className="p-4 rounded-xl bg-slate-50 border text-center space-y-1">
          <p className="text-2xl leading-loose" dir="rtl" lang="ar" style={{ fontFamily: "'Noto Naskh Arabic','Vazirmatn',serif" }}>{target}</p>
          {meaning && <p className="text-sm text-slate-600">{meaning}</p>}
          {time && <p className="text-xs text-slate-400" dir="ltr">⏱ {time}</p>}
          {row && <p className="text-xs text-slate-500">{row.attempts} تلاش · بهترین {row.best} · آخرین {row.last}</p>}
        </div>
      )}
      <div className="flex flex-wrap gap-2 justify-center">
        <button onClick={() => playTeacher(1)} disabled={!target || !!busy} className="px-4 py-2 rounded-lg bg-teal-500 text-white disabled:opacity-50">🔊 صدای استاد</button>
        <button onClick={() => playTeacher(0.7)} disabled={!target || !!busy} className="px-4 py-2 rounded-lg bg-teal-100 text-teal-800 disabled:opacity-50">🐢 آهسته</button>
        {!recording
          ? <button onClick={startRec} disabled={!target || !!busy} className="px-4 py-2 rounded-lg bg-red-500 text-white disabled:opacity-50">🎙️ ضبطِ من</button>
          : <button onClick={stopRec} className="px-4 py-2 rounded-lg bg-red-700 text-white animate-pulse">⏹️ پایان و سنجش</button>}
        {myUrl && <button onClick={() => play(myUrl)} disabled={recording} className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800">▶️ صدای من</button>}
        {myUrl && !busy && !recording && blobRef.current && <button onClick={() => score(blobRef.current)} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700">↻ سنجشِ دوباره</button>}
      </div>
      {busy && <p role="status" className="text-center text-sm text-teal-700">{busy}</p>}
      {error && <p role="alert" className="text-center text-sm text-red-600">{error}</p>}
      {verdict && (
        <div className={`p-4 rounded-xl border space-y-2 ${color(verdict.score)}`} data-testid="shadow-verdict">
          <p className="text-lg font-bold">امتیاز: {verdict.score} از ۱۰۰</p>
          {verdict.heard && <p className="text-sm">شنیده شد: <span dir="rtl" lang="ar">{verdict.heard}</span></p>}
          {verdict.feedback && <p className="text-sm">{verdict.feedback}</p>}
          {verdict.issues.length > 0 && <ul className="text-sm list-disc ps-5">{verdict.issues.map((i, k) => <li key={k}><b dir="auto">{i.word}</b>{i.tip ? `: ${i.tip}` : ''}</li>)}</ul>}
          {verdict.score < 80 && <p className="text-xs">پیشنهاد: «🐢 آهسته» را گوش کنید و دوباره ضبط کنید.</p>}
        </div>
      )}
    </section>
  );
}
