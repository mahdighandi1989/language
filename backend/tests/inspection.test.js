// Tests for «نظارت و سرکشی»: the pure rules (model.js) and the real HTTP API
// (routes/inspection.js) on an ephemeral Express server with a temp FileStore.
// No network, no Firebase: ID tokens are verified by a stub.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import os from 'os';
import path from 'path';
import zlib from 'zlib';
import express from 'express';

import {
  STATUS, sheetGlow, fileReadDebt, validateNote, approve, triage, claimUrgent, setUrgent,
  fileApproved, initialStatus, needsSupervisor, URGENT_CLAIM_TTL_MS,
} from '../services/inspection/model.js';
import { FileStore, setInspectionStore, parseServiceAccount } from '../services/inspection/store.js';
import { setIdTokenVerifier, supervisorLogin, verifySupervisorToken, adminEmails } from '../services/inspection/auth.js';
import { extractText, readZip, xmlToText } from '../services/inspection/extract.js';

const OWNER = { role: 'owner', email: 'mohamad.mahdi1988@gmail.com', uid: 'o1' };
const SUP = { role: 'supervisor', email: 'supervisor@inspection.local', uid: 'supervisor' };
const USER = { role: 'user', email: 'u@example.com', uid: 'u1' };
const PNG = `data:image/png;base64,${Buffer.from('fake-png-bytes').toString('base64')}`;
const DEPS = [{ name: 'API', status: 'ok' }];

// ---------------------------------------------------------------- pure rules
test('owner sheets open; other users wait for the owner (pending)', () => {
  assert.equal(initialStatus(OWNER), STATUS.OPEN);
  assert.equal(initialStatus(SUP), STATUS.OPEN);
  assert.equal(initialStatus(USER), STATUS.PENDING);
});

test('fixed without an after-picture is refused', () => {
  const sheet = { status: STATUS.OPEN, notes: [] };
  assert.throws(() => validateNote(SUP, sheet, { text: 'done', outcome: 'fixed', deps: DEPS, commits: ['abc'] }), /تصویرِ بعدش/);
  assert.doesNotThrow(() => validateNote(SUP, sheet, { text: 'done', outcome: 'fixed', afterShot: PNG, deps: DEPS, commits: ['abc'] }));
});

test('fixed needs a commit or a long no-change reason', () => {
  const sheet = { status: STATUS.OPEN, notes: [] };
  assert.throws(() => validateNote(SUP, sheet, { text: 'x', outcome: 'fixed', afterShot: PNG, deps: DEPS }), /کامیت/);
  assert.throws(() => validateNote(SUP, sheet, { text: 'x', outcome: 'fixed', afterShot: PNG, deps: DEPS, noChangeReason: 'short' }), /۴۰/);
});

test('every supervisor answer needs an outcome and a dependency chain', () => {
  const sheet = { status: STATUS.OPEN, notes: [] };
  assert.throws(() => validateNote(SUP, sheet, { text: 'x' }), /نتیجه/);
  assert.throws(() => validateNote(SUP, sheet, { text: 'x', outcome: 'partial' }), /وابستگی/);
  assert.throws(() => validateNote(SUP, sheet, { text: 'x', outcome: 'partial', deps: [{ name: 'a', status: 'meh' }] }), /وابستگی/);
});

test('needs-owner must name alternatives', () => {
  const sheet = { status: STATUS.OPEN, notes: [] };
  assert.throws(() => validateNote(SUP, sheet, { text: 'نمی‌شود', outcome: 'needs-owner', deps: DEPS }), /جایگزین/);
  assert.doesNotThrow(() => validateNote(SUP, sheet, { text: 'دو گزینه: الف یا ب', outcome: 'needs-owner', deps: DEPS }));
});

test('only the supervisor records an outcome', () => {
  assert.throws(() => validateNote(OWNER, { status: STATUS.OPEN }, { text: 'x', outcome: 'fixed' }), /فقط ناظر/);
});

test('unread attachments block the answer (contiguous text, unopened image, pending media)', () => {
  const sheet = { status: STATUS.OPEN, notes: [] };
  const body = { text: 'x', outcome: 'partial', deps: DEPS };
  const half = [{ id: 'f1', filename: 'a.txt', extractStatus: 'ok', textChars: 100, readChars: 50 }];
  assert.throws(() => validateNote(SUP, sheet, body, half), /50 نویسه/);
  assert.throws(() => validateNote(SUP, sheet, body, [{ id: 'f2', filename: 'p.png', extractStatus: 'image' }]), /باز نشده/);
  assert.throws(() => validateNote(SUP, sheet, body, [{ id: 'f3', filename: 'v.mp4', extractStatus: 'pending' }]), /رونویسی/);
  assert.deepEqual(fileReadDebt([{ extractStatus: 'ok', textChars: 10, readChars: 10 }, { extractStatus: 'image', viewedAt: 'x' }]), []);
});

test('only the owner ticks, triages and rushes — the supervisor is refused', () => {
  const answered = { status: STATUS.ANSWERED, notes: [] };
  assert.throws(() => approve(SUP, { ...answered }), /ناظر رد می‌شود/);
  assert.throws(() => approve(USER, { ...answered }), /فقط کارِ مالک/);
  assert.equal(approve(OWNER, { ...answered }).status, STATUS.APPROVED);
  assert.throws(() => approve(OWNER, { status: STATUS.OPEN }), /ناظر پاسخ داد/);
  assert.throws(() => triage(SUP, { status: STATUS.PENDING }, 'accept'), /ناظر/);
  assert.equal(triage(OWNER, { status: STATUS.PENDING }, 'decline').status, STATUS.DECLINED);
  assert.throws(() => setUrgent(SUP, { status: STATUS.OPEN }, true), /ناظر/);
});

test('glow: green only for fixed WITH after-picture; approved wins', () => {
  const s = (outcome, afterShotId) => ({ status: STATUS.ANSWERED, notes: [{ by: 'reviewer', outcome, afterShotId }] });
  assert.equal(sheetGlow(s('fixed', 'x')).key, 'fixed');
  assert.equal(sheetGlow(s('fixed', null)).key, 'partial');
  assert.equal(sheetGlow({ status: STATUS.ANSWERED, notes: [{ by: 'reviewer' }] }).key, 'stale');
  assert.equal(sheetGlow({ status: STATUS.APPROVED, notes: [] }).key, 'approved');
  assert.equal(needsSupervisor(s('not-done')), true);
  assert.equal(needsSupervisor(s('fixed', 'x')), false);
});

test('urgent queue: order of pressing, one claim at a time, expired claims are re-taken', () => {
  const now = new Date('2026-11-02T10:00:00Z');
  const a = { id: 'a', status: STATUS.OPEN, urgentAt: '2026-11-02T09:00:00Z' };
  const b = { id: 'b', status: STATUS.OPEN, urgentAt: '2026-11-02T08:00:00Z' };
  const p = { id: 'p', status: STATUS.PENDING, urgentAt: '2026-11-02T07:00:00Z' };
  assert.throws(() => claimUrgent(OWNER, [a, b], '', now), /فقط حسابِ ناظر/);
  assert.equal(claimUrgent(SUP, [a, b, p], 'r1', now).id, 'b');
  assert.equal(claimUrgent(SUP, [a, b, p], 'r2', now).id, 'a');
  assert.equal(claimUrgent(SUP, [a, b, p], 'r3', now), null);
  const later = new Date(now.getTime() + URGENT_CLAIM_TTL_MS + 1000);
  assert.equal(claimUrgent(SUP, [a, b], 'r4', later).id, 'b');
});

test('filing: approved sheets go to binders of 40', () => {
  const sheets = Array.from({ length: 41 }, (_, i) => ({ id: String(i + 1), number: i + 1, status: STATUS.APPROVED }));
  const binders = [];
  const filed = fileApproved(SUP, sheets, binders);
  assert.equal(filed.length, 41);
  assert.equal(binders.length, 2);
  assert.equal(sheets[40].binderNumber, 2);
  assert.throws(() => fileApproved(USER, sheets, []), /بایگانی/);
});

test('supervisor token: valid, tamper-proof, expires; disabled without a long password', () => {
  const env = { SUPERVISOR_PASSWORD: 'x'.repeat(24) };
  assert.equal(supervisorLogin('wrong', env), null);
  const { token } = supervisorLogin('x'.repeat(24), env, 1_000);
  assert.equal(verifySupervisorToken(token, env, 2_000), true);
  assert.equal(verifySupervisorToken(token.replace(/.$/, (c) => (c === 'a' ? 'b' : 'a')), env, 2_000), false);
  assert.equal(verifySupervisorToken(token, env, 1_000 + 13 * 3600 * 1000), false);
  assert.equal(supervisorLogin('short', { SUPERVISOR_PASSWORD: 'short' }), null);
});

test('admin e-mails always include the owner address in firestore.rules', () => {
  assert.ok(adminEmails({}).includes('mohamad.mahdi1988@gmail.com'));
  assert.ok(adminEmails({ ADMIN_EMAILS: 'A@B.C' }).includes('a@b.c'));
});

test('service account parsing accepts raw and base64 JSON, rejects junk', () => {
  const sa = { client_email: 'x@y', private_key: 'k', project_id: 'p' };
  assert.equal(parseServiceAccount(JSON.stringify(sa)).client_email, 'x@y');
  assert.equal(parseServiceAccount(Buffer.from(JSON.stringify(sa)).toString('base64')).project_id, 'p');
  assert.equal(parseServiceAccount('nope'), null);
});

// ---------------------------------------------------------------- extraction
function makeZip(files) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const [name, content] of Object.entries(files)) {
    const data = zlib.deflateRawSync(Buffer.from(content));
    const nameBuf = Buffer.from(name);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(8, 8);
    local.writeUInt32LE(data.length, 18); local.writeUInt16LE(nameBuf.length, 26);
    locals.push(local, nameBuf, data);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(8, 10);
    central.writeUInt32LE(data.length, 20); central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt32LE(offset, 42);
    centrals.push(central, nameBuf);
    offset += 30 + nameBuf.length + data.length;
  }
  const cd = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); eocd.writeUInt16LE(Object.keys(files).length, 10);
  eocd.writeUInt32LE(cd.length, 12); eocd.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cd, eocd]);
}

test('extraction: text, docx, zip-in-zip, image, media and unknown binaries', async () => {
  assert.equal((await extractText({ buffer: Buffer.from('سلام'), filename: 'a.txt', mime: 'text/plain' })).text, 'سلام');
  const docx = makeZip({ 'word/document.xml': '<w:document><w:p><w:r><w:t>خط یک</w:t></w:r></w:p><w:p><w:t>خط دو</w:t></w:p></w:document>' });
  const d = await extractText({ buffer: docx, filename: 'x.docx', mime: 'application/octet-stream' });
  assert.equal(d.status, 'ok');
  assert.match(d.text, /خط یک\n+خط دو/);
  const zip = makeZip({ 'inner/readme.txt': 'hello zip', 'nested.zip': makeZip({ 'deep.md': '# deep' }).toString('latin1') });
  assert.equal(readZip(zip).length, 2);
  const z = await extractText({ buffer: zip, filename: 'a.zip', mime: 'application/zip' });
  assert.match(z.text, /hello zip/);
  assert.equal((await extractText({ buffer: Buffer.from([1, 2]), filename: 'p.png', mime: 'image/png' })).status, 'image');
  assert.equal((await extractText({ buffer: Buffer.from([1, 2]), filename: 'v.mp4', mime: 'video/mp4' })).status, 'pending');
  assert.equal((await extractText({ buffer: Buffer.from([0, 0, 0, 1, 2]), filename: 'x.bin', mime: 'application/octet-stream' })).status, 'unsupported');
  assert.equal((await extractText({ buffer: Buffer.from('%PDF-broken'), filename: 'x.pdf', mime: 'application/pdf' })).status, 'failed');
  assert.equal(xmlToText('<p>a &amp; b</p>'), 'a & b');
});

// ---------------------------------------------------------------- HTTP API
let server;
let base;
let dir;
const tokens = { owner: 'tok-owner', user: 'tok-user' };

before(async () => {
  process.env.SUPERVISOR_PASSWORD = 'p'.repeat(24);
  process.env.INSPECTION_TRANSCRIBE = '0';
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'insp-'));
  setInspectionStore(new FileStore({ dir }));
  setIdTokenVerifier(async (t) => {
    if (t === tokens.owner) return { uid: 'o1', email: 'mohamad.mahdi1988@gmail.com', email_verified: true };
    if (t === tokens.user) return { uid: 'u1', email: 'u@example.com', email_verified: true };
    throw new Error('bad token');
  });
  const { inspectionRouter } = await import('../routes/inspection.js');
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use(inspectionRouter);
  await new Promise((r) => { server = app.listen(0, r); });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server?.close();
  fs.rmSync(dir, { recursive: true, force: true });
});

async function call(method, url, token, body, raw = false) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  let payload;
  if (body instanceof FormData) payload = body;
  else if (body !== undefined) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }
  const res = await fetch(base + url, { method, headers, body: payload });
  return { status: res.status, body: raw ? Buffer.from(await res.arrayBuffer()) : await res.json() };
}

test('API: full life of a sheet — create, read files, answer, tick, file; nothing deletable', async () => {
  assert.equal((await call('GET', '/api/inspection', null)).status, 401);
  const login = await call('POST', '/api/inspection/auth/supervisor', null, { password: 'wrong' });
  assert.equal(login.status, 401);
  const sup = (await call('POST', '/api/inspection/auth/supervisor', null, { password: 'p'.repeat(24) })).body.token;
  assert.match(sup, /^sup\./);

  const me = await call('GET', '/api/inspection/me', tokens.owner);
  assert.equal(me.body.role, 'owner');
  assert.equal(me.body.store.kind, 'file');

  const created = await call('POST', '/api/inspection', tokens.owner, {
    text: 'دکمهٔ ذخیره کار نمی‌کند\nجزئیات', page: 'lessons', reopen: 'lessons', shot: PNG,
    geometry: { anchor: { selector: '#x', fx: 0.1, fy: 0.2, fw: 0.5, fh: 0.5 } },
  });
  assert.equal(created.status, 201);
  const sheet = created.body.sheet;
  assert.equal(sheet.status, 'open');
  assert.equal(sheet.title, 'دکمهٔ ذخیره کار نمی‌کند');
  assert.ok(sheet.notes[0].shotId);
  const shot = await call('GET', `/api/inspection/shots/${sheet.notes[0].shotId}`, sup, undefined, true);
  assert.equal(shot.body.toString(), 'fake-png-bytes');

  const form = new FormData();
  form.append('files', new Blob(['a'.repeat(300)], { type: 'text/plain' }), 'notes.txt');
  form.append('caption', 'نمونهٔ خطا');
  const up = await call('POST', `/api/inspection/${sheet.id}/files`, tokens.owner, form);
  assert.equal(up.status, 201);
  const fileId = up.body.files[0].id;
  assert.equal(up.body.files[0].extractStatus, 'ok');

  const answer = { text: 'درست شد با کامیت', outcome: 'fixed', afterShot: PNG, deps: DEPS, commits: ['abc1234'] };
  const blocked = await call('POST', `/api/inspection/${sheet.id}/notes`, sup, answer);
  assert.equal(blocked.status, 422);
  assert.match(blocked.body.error, /notes\.txt/);

  // Skipping ahead does not count; contiguous slices do.
  await call('GET', `/api/inspection/files/${fileId}/text?offset=100&limit=200`, sup);
  assert.equal((await call('POST', `/api/inspection/${sheet.id}/notes`, sup, answer)).status, 422);
  const s1 = await call('GET', `/api/inspection/files/${fileId}/text?offset=0&limit=150`, sup);
  assert.equal(s1.body.readChars, 150);
  const s2 = await call('GET', `/api/inspection/files/${fileId}/text?offset=150&limit=1000`, sup);
  assert.equal(s2.body.done, true);

  const noShot = await call('POST', `/api/inspection/${sheet.id}/notes`, sup, { ...answer, afterShot: undefined });
  assert.equal(noShot.status, 422);
  const ok = await call('POST', `/api/inspection/${sheet.id}/notes`, sup, answer);
  assert.equal(ok.status, 201);
  assert.equal(ok.body.sheet.status, 'answered');
  assert.equal(ok.body.sheet.glow.key, 'fixed');

  assert.equal((await call('POST', `/api/inspection/${sheet.id}/approve`, sup)).status, 403);
  assert.equal((await call('POST', `/api/inspection/${sheet.id}/approve`, tokens.user)).status, 404); // user cannot even see it
  const ticked = await call('POST', `/api/inspection/${sheet.id}/approve`, tokens.owner);
  assert.equal(ticked.body.sheet.status, 'approved');

  assert.equal((await call('DELETE', `/api/inspection/${sheet.id}`, tokens.owner)).status, 405);
  assert.equal((await call('DELETE', `/api/inspection/files/${fileId}`, tokens.owner)).status, 405);

  const filed = await call('POST', '/api/inspection/file-approved', sup);
  assert.equal(filed.body.filed[0].binder, 1);
  assert.equal((await call('GET', `/api/inspection/${sheet.id}`, tokens.owner)).body.sheet.status, 'filed');
});

test('API: a non-admin sheet waits for the owner; the supervisor cannot see it until accepted', async () => {
  const sup = (await call('POST', '/api/inspection/auth/supervisor', null, { password: 'p'.repeat(24) })).body.token;
  const created = await call('POST', '/api/inspection', tokens.user, { text: 'پیشنهاد', page: 'quiz' });
  const id = created.body.sheet.id;
  assert.equal(created.body.sheet.status, 'pending');
  assert.equal((await call('GET', `/api/inspection/${id}`, sup)).status, 404);
  assert.equal((await call('POST', `/api/inspection/${id}/triage`, sup, { decision: 'accept' })).status, 404);
  const accepted = await call('POST', `/api/inspection/${id}/triage`, tokens.owner, { decision: 'accept' });
  assert.equal(accepted.body.sheet.status, 'open');
  assert.equal((await call('GET', `/api/inspection/${id}`, sup)).status, 200);
  const queue = await call('GET', '/api/inspection/queue', sup);
  assert.ok(queue.body.sheets.some((s) => s.id === id));
  assert.equal((await call('GET', '/api/inspection/queue', tokens.user)).status, 403);
});

test('API: urgent — owner presses, supervisor claims, answer discharges', async () => {
  const sup = (await call('POST', '/api/inspection/auth/supervisor', null, { password: 'p'.repeat(24) })).body.token;
  const id = (await call('POST', '/api/inspection', tokens.owner, { text: 'فوری' })).body.sheet.id;
  assert.equal((await call('POST', `/api/inspection/${id}/urgent`, sup)).status, 403);
  assert.equal((await call('POST', `/api/inspection/${id}/urgent`, tokens.owner)).status, 200);
  assert.equal((await call('POST', '/api/inspection/urgent/claim', tokens.owner)).status, 403);
  const claim = await call('POST', '/api/inspection/urgent/claim', sup, { runId: 'test' });
  assert.equal(claim.body.sheet.id, id);
  assert.equal((await call('POST', '/api/inspection/urgent/claim', sup)).body.sheet, null);
  const ans = await call('POST', `/api/inspection/${id}/notes`, sup, { text: 'نشد؛ دلیل…', outcome: 'not-done', deps: DEPS });
  assert.ok(ans.body.sheet.urgentDoneAt);
  assert.equal(ans.body.sheet.needsSupervisor, true); // not-done comes back next round
});

// ---------------------------------------------------------------- v2 parity with the reference project
import { recordKnock, nextRound, nextFullRound } from '../services/inspection/rounds.js';
import { composeMail, notifySubmitter, setTransportFactory } from '../services/inspection/mailer.js';
import { editNote, readProgress } from '../services/inspection/model.js';

test('rounds: assumed → observed hourly minute → stale; full round from cron', () => {
  const now = new Date('2026-11-03T10:05:00Z');
  const a = nextRound(now, [], 37);
  assert.equal(a.basis, 'assumed');
  assert.equal(a.at, '2026-11-03T10:37:00.000Z');
  let log = [];
  for (const t of ['07:41', '08:41', '09:42']) log = recordKnock(log, new Date(`2026-11-03T${t}:00Z`));
  const o = nextRound(now, log, 37);
  assert.equal(o.basis, 'observed');
  assert.equal(o.at, '2026-11-03T10:41:00.000Z');
  assert.equal(nextRound(new Date('2026-11-03T15:00:00Z'), log).basis, 'stale');
  const f = nextFullRound(new Date('2026-11-03T10:00:00Z'), [], '23 2 * * 1,4'); // Tuesday
  assert.equal(f.at, '2026-11-05T02:23:00.000Z'); // Thursday (matches the routine's own next_run_at)
  assert.equal(nextFullRound(new Date('2026-11-20T10:00:00Z'), ['2026-11-03T02:23:00Z'], '23 2 * * 1,4').basis, 'stale');
  assert.equal(recordKnock(Array.from({ length: 20 }, (_, i) => new Date(Date.UTC(2026, 0, 1, i)).toISOString())).length, 12);
});

test('edit keeps the original text; sides and closed sheets are protected', () => {
  const sheet = { status: STATUS.OPEN, title: 'old', notes: [{ id: 'n1', by: 'owner', author: OWNER.email, text: 'old' }, { id: 'n2', by: 'reviewer', text: 'r' }] };
  editNote(OWNER, sheet, 'n1', 'new title\nmore');
  editNote(OWNER, sheet, 'n1', 'newer');
  assert.equal(sheet.notes[0].originalText, 'old');
  assert.equal(sheet.notes[0].text, 'newer');
  assert.equal(sheet.title, 'newer');
  assert.throws(() => editNote(OWNER, sheet, 'n2', 'x'), /طرفِ مقابل/);
  assert.throws(() => editNote(SUP, sheet, 'n1', 'x'), /طرفِ مقابل/);
  assert.throws(() => editNote(USER, { status: STATUS.OPEN, notes: [{ id: 'u', by: 'user', author: 'other@x' }] }, 'u', 'x'), /خودت/);
  assert.throws(() => editNote(OWNER, { ...sheet, status: STATUS.FILED }, 'n1', 'x'), /بسته/);
});

test('read progress per file', () => {
  assert.deepEqual(readProgress({ extractStatus: 'ok', textChars: 200, readChars: 50 }), { readPercent: 25, fullyRead: false });
  assert.deepEqual(readProgress({ extractStatus: 'ok', textChars: 200, readChars: 200 }), { readPercent: 100, fullyRead: true });
  assert.deepEqual(readProgress({ extractStatus: 'image' }), { readPercent: 0, fullyRead: false });
  assert.deepEqual(readProgress({ extractStatus: 'image', viewedAt: 'x' }), { readPercent: 100, fullyRead: true });
});

test('mail: decline carries the reason; no SMTP ⇒ not-configured; transport used when configured', async () => {
  const sheet = { number: 7, title: 'عنوان', status: 'declined', triageNote: 'تکراری است', createdBy: 'u@example.com' };
  assert.match(composeMail(sheet).text, /دلیلِ رد: تکراری است/);
  assert.doesNotMatch(composeMail({ ...sheet, triageNote: '' }).text, /دلیلِ رد/);
  assert.equal((await notifySubmitter(sheet, {})).status, 'not-configured');
  const sent = [];
  setTransportFactory(() => ({ sendMail: async (m) => { sent.push(m); } }));
  const env = { SMTP_HOST: 'h', SMTP_USER: 'u', SMTP_PASSWORD: 'p', MAIL_FROM: 'f@x' };
  assert.equal((await notifySubmitter({ ...sheet, status: 'open' }, env)).status, 'sent');
  assert.equal(sent[0].to, 'u@example.com');
  assert.match(sent[0].subject, /پذیرفته/);
  setTransportFactory(() => ({ sendMail: async () => { throw new Error('smtp down'); } }));
  assert.equal((await notifySubmitter(sheet, env)).status, 'failed');
  setTransportFactory(null);
});

test('API: general request, edit, decline with reason + mail record, detach (not delete), read %, rounds, rush position', async () => {
  const sup = (await call('POST', '/api/inspection/auth/supervisor', null, { password: 'p'.repeat(24) })).body.token;
  const g = await call('POST', '/api/inspection', tokens.owner, { text: 'درخواستِ عمومی', general: true, page: 'general', geometry: { doc: { x: 1 } } });
  assert.equal(g.body.sheet.general, true);
  assert.equal(g.body.sheet.geometry, null);
  const id = g.body.sheet.id;
  const ed = await call('PATCH', `/api/inspection/${id}/notes/${g.body.sheet.notes[0].id}`, tokens.owner, { text: 'متنِ ویرایش‌شده' });
  assert.equal(ed.body.sheet.notes[0].originalText, 'درخواستِ عمومی');
  assert.equal(ed.body.sheet.title, 'متنِ ویرایش‌شده');

  const form = new FormData();
  form.append('files', new Blob(['x'.repeat(100)], { type: 'text/plain' }), 'a.txt');
  const fid = (await call('POST', `/api/inspection/${id}/files`, tokens.owner, form)).body.files[0].id;
  await call('GET', `/api/inspection/files/${fid}/text?offset=0&limit=40`, sup);
  const seen = (await call('GET', `/api/inspection/${id}`, tokens.owner)).body.sheet.files[0];
  assert.equal(seen.readPercent, 40);
  assert.equal(seen.fullyRead, false);
  assert.equal((await call('POST', `/api/inspection/files/${fid}/detach`, sup)).status, 403);
  const det = await call('POST', `/api/inspection/files/${fid}/detach`, tokens.owner);
  assert.equal(det.body.sheet.files.length, 0);
  assert.equal(det.body.sheet.detachedFiles, 1);
  assert.equal(det.body.sheet.readDebt.length, 0);
  assert.equal((await call('GET', `/api/inspection/files/${fid}/raw`, tokens.owner, undefined, true)).status, 200); // bytes kept

  const r1 = await call('POST', `/api/inspection/${id}/urgent`, tokens.owner);
  assert.ok(r1.body.position >= 1);
  assert.ok(['assumed', 'observed', 'stale'].includes(r1.body.nextRound.basis));
  await call('POST', '/api/inspection/urgent/claim', sup, { runId: 't' });
  await call('GET', '/api/inspection/queue', sup);
  const rounds = (await call('GET', '/api/inspection/rounds', tokens.owner)).body;
  assert.ok(rounds.urgent.lastSeen && rounds.full.lastSeen);

  const u = (await call('POST', '/api/inspection', tokens.user, { text: 'پیشنهادِ کاربر' })).body.sheet.id;
  const dec = await call('POST', `/api/inspection/${u}/triage`, tokens.owner, { decision: 'decline', note: 'تکراری' });
  assert.equal(dec.body.sheet.status, 'declined');
  assert.equal(dec.body.sheet.triageNote, 'تکراری');
  assert.equal(dec.body.mail.status, 'not-configured');
  const u2 = (await call('POST', '/api/inspection', tokens.user, { text: 'دومی' })).body.sheet.id;
  const acc = await call('POST', `/api/inspection/${u2}/triage`, tokens.owner, { decision: 'accept', note: '' });
  assert.equal(acc.body.sheet.mail[0].for, 'open');
});
