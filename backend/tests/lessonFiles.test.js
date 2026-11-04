// «آپلودِ هوشمند»: exact extraction, two-pass verification with suspect lines,
// corrections kept separate (quotes verified), original files kept + downloadable,
// «remove» never deletes. Fake AI; temp file store; no network.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import express from 'express';
import { compareTranscripts, markSuspect, normLine } from '../services/lessonFiles/verify.js';
import { extractLessonFile } from '../services/lessonFiles/pipeline.js';
import { FileStore, setInspectionStore } from '../services/inspection/store.js';

const fakeAi = (a, b, review = []) => ({
  transcribe: async (buf, mime, name, variant) => (variant === 'b' ? b : a),
  review: async () => review,
});

test('verification: confirmed vs suspect lines, normalisation ignores diacritics/timestamps', () => {
  assert.equal(normLine('[00:12] مَرحَبًا، كيفك؟'), 'مرحبا کیفک');
  const cmp = compareTranscripts('مرحبا كيفك\nشو اسمك؟\nبدّي قهوة', 'مَرحبا كيفك\nشو اسمك\nبدي شاي');
  assert.deepEqual(cmp.lines.map((l) => l.confirmed), [true, true, false]);
  assert.equal(cmp.suspectCount, 1);
  assert.equal(cmp.agreement, 0.83); // word-level: 5 of 6 words confirmed
  assert.match(markSuspect(cmp), /⚠️ \[مشکوک\] بدّي قهوة/);
});

test('verification: different line breaks and timestamp styles do NOT make a correct transcript «suspect»', () => {
  // Pass 1 (one sentence per line, [mm:ss]) vs pass 2 (merged lines, other timestamp style) — the real Rita 25 failure.
  const p1 = '[00:00] لازم تكتب فروضتك\n[00:04] ما لازم\n[00:06] بس للأسف لازم\n[00:09] شو عملت اليوم بالمدرسة؟\n[00:13] رحت عند رفيقي وأكلنا سوا';
  const p2 = '(0:00 - 0:05) لازم تكتب فروضَك، ما لازم.\n00:06 بس للأسف لازم! شو عملت اليوم بالمدرسة\n**[00:13]** رحت لعند رفيقي و أكلنا سوا';
  const cmp = compareTranscripts(p1, p2);
  assert.equal(cmp.suspectCount, 0, JSON.stringify(cmp.lines));
  assert.ok(cmp.agreement >= 0.85, String(cmp.agreement));
  // A real difference in meaning is still caught.
  const diff = compareTranscripts('بدي قهوة هلق\nرايح عالبيت', 'بدي شاي هلق رايح عالبيت');
  assert.deepEqual(diff.lines.map((l) => l.confirmed), [false, true]);
});

test('verification: an hour-long transcript aligns fast', () => {
  const words = 'لازم تكتب فروضك ما لازم بس للأسف شو عملت اليوم بالمدرسة رحت عند رفيقي'.split(' ');
  const lines = Array.from({ length: 2000 }, (_, i) => `[${String(Math.floor(i / 60)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}] ${words.slice(i % 5, (i % 5) + 7).join(' ')} ${i}`);
  const t0 = Date.now();
  const cmp = compareTranscripts(lines.join('\n'), lines.map((l) => l.replace(/^\[[^\]]+\] /, '')).join(' '));
  assert.ok(Date.now() - t0 < 3000, `took ${Date.now() - t0}ms`);
  assert.equal(cmp.suspectCount, 0);
});

test('pipeline: text files are exact (no AI), media is double-transcribed, corrections are separate', async () => {
  const neverAi = { transcribe: async () => { throw new Error('must not be called'); }, review: async () => [] };
  const t = await extractLessonFile({ buffer: Buffer.from('  متنِ دقیقِ مالک\nبا اعرابِ مَرحَبا  '), filename: 'n.txt', mime: 'text/plain' }, { ai: neverAi });
  assert.equal(t.method, 'exact');
  assert.equal(t.text, '  متنِ دقیقِ مالک\nبا اعرابِ مَرحَبا  '); // byte-for-byte
  const img = await extractLessonFile({ buffer: Buffer.from([1, 2, 3]), filename: 'p.jpg', mime: 'image/jpeg' },
    { ai: fakeAi('سطر یک\nسطر دو', 'سطر یک\nچیزِ دیگر', [{ quote: 'سطر یک', kind: 'اعراب', issue: 'بی‌اعراب', suggestion: 'سَطر' }, { quote: 'ساختگی', kind: 'معنا', issue: 'x' }]) });
  assert.equal(img.method, 'ai-verified');
  assert.equal(img.text, 'سطر یک\nسطر دو'); // pass 1, unchanged
  assert.equal(img.suspectCount, 1);
  assert.deepEqual(img.suspectLines, ['سطر دو']);
  assert.equal(img.corrections.length, 2);
  assert.equal(img.corrections[0].verifiedQuote, true);
  assert.equal(img.corrections[1].verifiedQuote, false); // quote not in the text ⇒ flagged
  const bad = await extractLessonFile({ buffer: Buffer.from([1]), filename: 'v.mp4', mime: 'video/mp4' },
    { ai: { transcribe: async () => { throw new Error('quota AIzaSyDUMMYDUMMYDUMMYDUMMY'); }, review: async () => [] } });
  assert.equal(bad.status, 'failed');
  assert.doesNotMatch(bad.notes.join(' '), /AIza/);
  const bin = await extractLessonFile({ buffer: Buffer.from([0, 0, 0]), filename: 'x.bin', mime: 'application/octet-stream' }, { ai: neverAi });
  assert.equal(bin.method, 'none');
});

let server; let base; let dir;
before(async () => {
  process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDUMMYDUMMYDUMMYDUMMY';
  delete process.env.FIREBASE_PROJECT_ID;
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lf-'));
  setInspectionStore(new FileStore({ dir }));
  const { lessonFilesRouter, setLessonFilesAi } = await import('../routes/lessonFiles.js');
  setLessonFilesAi(fakeAi('رونویسی', 'رونویسی'));
  const app = express();
  app.use(lessonFilesRouter);
  await new Promise((r) => { server = app.listen(0, r); });
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => { server?.close(); fs.rmSync(dir, { recursive: true, force: true }); });

test('API: multi-file upload keeps originals, lists, downloads, removes without deleting', async () => {
  const form = new FormData();
  form.append('files', new Blob(['درسِ یک']), 'a.txt');
  form.append('files', new Blob([Buffer.from([9, 9, 9])], { type: 'audio/mpeg' }), 'b.mp3');
  form.append('review', '0');
  const up = await (await fetch(`${base}/api/lesson-files/1712`, { method: 'POST', body: form })).json();
  assert.equal(up.results.length, 2);
  assert.equal(up.results[0].method, 'exact');
  assert.equal(up.results[0].text, 'درسِ یک');
  assert.equal(up.results[1].method, 'ai-verified');
  const list = await (await fetch(`${base}/api/lesson-files/1712`)).json();
  assert.equal(list.files.length, 2);
  const id = list.files[1].id;
  const raw = Buffer.from(await (await fetch(`${base}/api/lesson-files/1712/${id}/raw`)).arrayBuffer());
  assert.deepEqual([...raw], [9, 9, 9]);
  assert.equal((await fetch(`${base}/api/lesson-files/1712/${id}/remove`, { method: 'POST' })).status, 200);
  const after = await (await fetch(`${base}/api/lesson-files/1712`)).json();
  assert.equal(after.files.length, 1);
  assert.equal(after.removed, 1);
  assert.equal((await fetch(`${base}/api/lesson-files/1712/${id}/raw`)).status, 200); // bytes kept
  assert.equal((await fetch(`${base}/api/lesson-files/999/${id}/raw`)).status, 404); // other lesson: not found
});

test('YouTube links are found in pasted text (watch, youtu.be, shorts), deduplicated', async () => {
  const { extractYouTubeUrls, stripYouTubeUrls } = await import('../services/analysisService.js');
  const t = 'ببین https://www.youtube.com/watch?v=abcDEF12345 و https://youtu.be/abcDEF12345 و https://youtube.com/shorts/XYZ_987654 و https://example.com/x';
  assert.deepEqual(extractYouTubeUrls(t), ['https://www.youtube.com/watch?v=abcDEF12345', 'https://youtu.be/abcDEF12345', 'https://youtube.com/shorts/XYZ_987654']);
  assert.equal(stripYouTubeUrls('درس https://youtu.be/abcDEF12345'), 'درس');
  assert.deepEqual(extractYouTubeUrls('بدونِ لینک'), []);
});

test('API: extraction result is kept on the server (closed tab loses nothing); media served with its real type', async () => {
  const form = new FormData();
  form.append('files', new Blob([Buffer.from([7, 7])], { type: 'audio/mpeg' }), '25.mp3');
  form.append('review', '0');
  const up = await (await fetch(`${base}/api/lesson-files/2525`, { method: 'POST', body: form })).json();
  const f = up.results[0].file;
  assert.equal(f.hasExtract, true);
  assert.equal(f.status, 'ok');
  const ex = await (await fetch(`${base}/api/lesson-files/2525/${f.id}/extract`)).json();
  assert.equal(ex.extract.text, 'رونویسی');
  assert.equal((await fetch(`${base}/api/lesson-files/9999/${f.id}/extract`)).status, 404);
  const raw = await fetch(`${base}/api/lesson-files/2525/${f.id}/raw`);
  assert.equal(raw.headers.get('content-type'), 'audio/mpeg');
  assert.equal(raw.headers.get('x-content-type-options'), 'nosniff');
});

test('pipeline: a transcript cut by the output limit (MAX_TOKENS) is flagged, not presented as complete', async () => {
  const ai = { transcribe: async () => ({ text: 'سطر\nسطر دو', finish: 'MAX_TOKENS' }), review: async () => [] };
  const r = await extractLessonFile({ buffer: Buffer.from([1]), filename: 'long.mp3', mime: 'audio/mpeg' }, { ai, review: false });
  assert.equal(r.text, 'سطر\nسطر دو');
  assert.match(r.notes.join(' '), /سقفِ خروجی/);
});

test('candidateText joins every text part and skips thoughts', async () => {
  const { candidateText } = await import('../services/geminiService.js');
  let fin;
  assert.equal(candidateText({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: 'a' }, { text: 'x', thought: true }, { text: 'b' }] } }] }, { onFinish: (r) => { fin = r; } }), 'ab');
  assert.equal(fin, 'STOP');
  assert.equal(candidateText({}), '');
});
