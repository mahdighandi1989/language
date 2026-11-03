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
  assert.equal(cmp.agreement, 0.67);
  assert.match(markSuspect(cmp), /⚠️ \[مشکوک\] بدّي قهوة/);
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
