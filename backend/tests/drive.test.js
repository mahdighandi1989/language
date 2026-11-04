// Google Drive copy of lesson originals: signed state, owner-only routes,
// encrypted refresh token, upload copies best-effort (never fails an upload).
// Google is faked (setDriveFetch); temp file store; no network.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import express from 'express';
import { FileStore, setInspectionStore } from '../services/inspection/store.js';

const KEY = 'a'.repeat(64);
let server; let base; let dir; let drive; let calls = [];
const fakeGoogle = async (url, opts = {}) => {
  calls.push({ url: String(url), method: opts.method || 'GET', body: opts.body });
  const u = String(url);
  const json = (status, body, headers = {}) => ({ ok: status < 300, status, json: async () => body, headers: { get: (h) => headers[h.toLowerCase()] } });
  if (u.startsWith('https://oauth2.googleapis.com/token')) {
    const p = new URLSearchParams(opts.body);
    if (p.get('grant_type') === 'authorization_code') return json(200, { access_token: 'at1', expires_in: 3600, refresh_token: 'rt-SECRET', id_token: `x.${Buffer.from(JSON.stringify({ email: 'owner@gmail.com' })).toString('base64url')}.y` });
    return json(200, { access_token: 'at2', expires_in: 3600 });
  }
  if (u.includes('/drive/v3/files?q=')) return json(200, { files: [] });
  if (u.includes('/drive/v3/files?fields=id')) return json(200, { id: `folder-${calls.length}` });
  if (u.includes('/upload/drive/v3/files?uploadType=resumable')) return json(200, {}, { location: 'https://upload.example/session1' });
  if (u === 'https://upload.example/session1') return json(200, { id: 'file-1', webViewLink: 'https://drive.google.com/file/d/file-1/view' });
  if (u.startsWith('https://oauth2.googleapis.com/revoke')) return json(200, {});
  return json(404, {});
};

before(async () => {
  Object.assign(process.env, { GOOGLE_OAUTH_CLIENT_ID: 'cid', GOOGLE_OAUTH_CLIENT_SECRET: 'csecret', ENCRYPTION_KEY: KEY, GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'AIzaSyDUMMYDUMMYDUMMYDUMMY' });
  delete process.env.FIREBASE_PROJECT_ID;
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'drive-'));
  setInspectionStore(new FileStore({ dir }));
  drive = await import('../services/drive/drive.js');
  drive.setDriveFetch(fakeGoogle);
  const auth = await import('../services/inspection/auth.js');
  auth.setIdTokenVerifier(async (t) => (t === 'owner' ? { uid: 'u1', email: 'mohamad.mahdi1988@gmail.com' } : { uid: 'u2', email: 'someone@example.com' }));
  const { driveRouter } = await import('../routes/drive.js');
  const { lessonFilesRouter, setLessonFilesAi } = await import('../routes/lessonFiles.js');
  setLessonFilesAi({ transcribe: async () => 'متن', review: async () => [] });
  const app = express();
  app.use(express.json());
  app.use(driveRouter);
  app.use(lessonFilesRouter);
  await new Promise((r) => { server = app.listen(0, r); });
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => { server?.close(); fs.rmSync(dir, { recursive: true, force: true }); });

const as = (who) => ({ headers: { Authorization: `Bearer ${who}`, 'Content-Type': 'application/json' } });

test('state is signed, bound and short-lived', () => {
  const s = drive.makeState('u1', process.env, 1_000_000);
  assert.equal(drive.checkState(s, process.env, 1_000_000 + 60_000).uid, 'u1');
  assert.equal(drive.checkState(s, process.env, 1_000_000 + 11 * 60_000), null);
  assert.equal(drive.checkState(s.replace(/.$/, s.endsWith('A') ? 'B' : 'A'), process.env, 1_000_000), null);
  assert.equal(drive.checkState('garbage'), null);
});

test('only the owner can see status or start the connection', async () => {
  assert.equal((await fetch(`${base}/api/drive/status`)).status, 401);
  assert.equal((await fetch(`${base}/api/drive/status`, as('user'))).status, 403);
  const st = await (await fetch(`${base}/api/drive/status`, as('owner'))).json();
  assert.equal(st.configured, true);
  assert.equal(st.connected, false);
  const { url } = await (await fetch(`${base}/api/drive/connect`, { method: 'POST', ...as('owner') })).json();
  assert.match(url, /^https:\/\/accounts\.google\.com\/o\/oauth2\/v2\/auth\?/);
  assert.match(url, /drive\.file/);
  assert.match(url, /access_type=offline/);
});

test('callback: bad state refused; good state stores the refresh token ENCRYPTED, never sent back', async () => {
  const bad = await fetch(`${base}/api/drive/callback?code=x&state=nope`, { redirect: 'manual' });
  assert.match(bad.headers.get('location'), /drive=error/);
  const ok = await fetch(`${base}/api/drive/callback?code=c1&state=${encodeURIComponent(drive.makeState('u1'))}`, { redirect: 'manual' });
  assert.match(ok.headers.get('location'), /drive=ok.*#\/admin/);
  const raw = fs.readdirSync(dir, { recursive: true }).map((f) => { try { return fs.readFileSync(path.join(dir, f), 'utf8'); } catch { return ''; } }).join('\n');
  assert.doesNotMatch(raw, /rt-SECRET/); // encrypted at rest
  const st = await (await fetch(`${base}/api/drive/status`, as('owner'))).json();
  assert.equal(st.connected, true);
  assert.equal(st.email, 'owner@gmail.com');
  assert.doesNotMatch(JSON.stringify(st), /rt-SECRET|refresh/);
});

test('an uploaded lesson file is copied to Drive (زبان/درس‌ها/<lesson>) and the link recorded; sync copies the rest', async () => {
  calls = [];
  const form = new FormData();
  form.append('files', new Blob(['درس']), 'a.txt');
  form.append('review', '0');
  form.append('lessonTitle', '5 - ریتا');
  const up = await (await fetch(`${base}/api/lesson-files/55`, { method: 'POST', body: form })).json();
  assert.equal(up.results.length, 1);
  await new Promise((r) => setTimeout(r, 200)); // copy runs after the reply
  const list = await (await fetch(`${base}/api/lesson-files/55`)).json();
  assert.equal(list.files[0].drive.link, 'https://drive.google.com/file/d/file-1/view');
  const folderNames = calls.filter((c) => c.url.includes('/drive/v3/files?fields=id')).map((c) => JSON.parse(c.body).name);
  assert.deepEqual(folderNames, ['زبان', 'درس‌ها', '5 - ریتا']);
  const sync = await (await fetch(`${base}/api/drive/sync/55`, { method: 'POST', ...as('owner'), body: JSON.stringify({ lessonTitle: '5 - ریتا' }) })).json();
  assert.deepEqual(sync, { copied: 0, total: 0 }); // already copied
});

test('a Drive failure never fails the upload: the error is noted on the file', async () => {
  drive.setDriveFetch(async (u, o) => (String(u).includes('/upload/') ? { ok: false, status: 500, json: async () => ({}), headers: { get: () => null } } : fakeGoogle(u, o)));
  const form = new FormData();
  form.append('files', new Blob(['x']), 'b.txt');
  form.append('review', '0');
  const res = await fetch(`${base}/api/lesson-files/56`, { method: 'POST', body: form });
  assert.equal(res.status, 200);
  await new Promise((r) => setTimeout(r, 200));
  const list = await (await fetch(`${base}/api/lesson-files/56`)).json();
  assert.match(list.files[0].driveError, /Drive/);
  drive.setDriveFetch(fakeGoogle);
});

test('disconnect revokes and forgets', async () => {
  assert.equal((await (await fetch(`${base}/api/drive/disconnect`, { method: 'POST', ...as('owner') })).json()).disconnected, true);
  assert.equal((await (await fetch(`${base}/api/drive/status`, as('owner'))).json()).connected, false);
});
