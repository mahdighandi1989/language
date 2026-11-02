// Security guards added in the 2026-11-02 review: AI/upload endpoints and the
// Live socket close as soon as server-side auth is configured; upload names
// can never become paths.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { requireAuthIfConfigured, verifyWsClient } from '../middleware/firebaseAuth.js';
import { safeUploadName } from '../middleware/upload.js';

function run(mw, headers = {}) {
  return new Promise((resolve) => {
    const res = { status(c) { this.code = c; return this; }, json(b) { resolve({ code: this.code, body: b }); } };
    mw({ headers }, res, () => resolve({ next: true }));
  });
}

test('without FIREBASE_PROJECT_ID the guard passes (and only warns)', async () => {
  delete process.env.FIREBASE_PROJECT_ID;
  assert.deepEqual(await run(requireAuthIfConfigured), { next: true });
  await new Promise((r) => verifyWsClient({ req: { url: '/ws/live' } }, (ok) => { assert.equal(ok, true); r(); }));
});

test('with FIREBASE_PROJECT_ID a missing token is refused (HTTP and WebSocket)', async () => {
  process.env.FIREBASE_PROJECT_ID = 'demo-project';
  const r = await run(requireAuthIfConfigured);
  assert.equal(r.code, 401);
  await new Promise((done) => verifyWsClient({ req: { url: '/ws/live' } }, (ok, code) => {
    assert.equal(ok, false);
    assert.equal(code, 401);
    done();
  }));
  delete process.env.FIREBASE_PROJECT_ID;
});

test('upload names are reduced to a safe basename', () => {
  assert.equal(safeUploadName('../../etc/passwd'), 'passwd');
  assert.equal(safeUploadName('..\\..\\win.ini'), 'win.ini');
  assert.equal(safeUploadName('درس ۱.mp3'), 'درس_۱.mp3');
  assert.equal(safeUploadName('..'), 'file');
});

import { TelegramStore, LINK_CODE_TTL_MS } from '../services/telegram/store.js';
test('telegram link codes expire', () => {
  const store = new TelegramStore({ persist: false });
  const code = store.createLinkCode('c1', 't1');
  const created = store.data.pending[code].createdAt;
  assert.equal(store.confirmLinkCode(code, 'u1', created + LINK_CODE_TTL_MS + 1), null);
  const fresh = store.createLinkCode('c1', 't1');
  assert.equal(store.confirmLinkCode(fresh, 'u1').userId, 'u1');
});

import { setTokenVerifier, setApprovalLookup, approvalOf } from '../middleware/firebaseAuth.js';
test('with auth configured: approved user passes, pending is 403, owner always passes, lookup failure is 503', async () => {
  process.env.FIREBASE_PROJECT_ID = 'demo-project';
  setTokenVerifier(async (t) => {
    if (t === 'owner') return { uid: 'o', email: 'mohamad.mahdi1988@gmail.com', email_verified: true };
    if (t === 'ok') return { uid: 'u-ok', email: 'a@b.c' };
    if (t === 'pending') return { uid: 'u-pending', email: 'p@b.c' };
    if (t === 'boom') return { uid: 'u-boom', email: 'x@b.c' };
    throw new Error('bad');
  });
  setApprovalLookup(async (uid) => {
    if (uid === 'u-boom') throw new Error('firestore down');
    return { 'u-ok': { status: 'approved', role: 'user' }, 'u-pending': { status: 'pending', role: 'user' } }[uid] || null;
  });
  const auth = (t) => ({ authorization: `Bearer ${t}` });
  assert.deepEqual(await run(requireAuthIfConfigured, auth('ok')), { next: true });
  assert.deepEqual(await run(requireAuthIfConfigured, auth('owner')), { next: true });
  assert.equal((await run(requireAuthIfConfigured, auth('pending'))).code, 403);
  assert.equal((await run(requireAuthIfConfigured, auth('boom'))).code, 503);
  assert.equal((await run(requireAuthIfConfigured, auth('forged'))).code, 401);
  assert.equal(await approvalOf({ uid: 'nobody', email: 'n@b.c' }), 'denied');
  const ws = (q) => new Promise((r) => verifyWsClient({ req: { url: `/ws/live${q}` } }, (ok, code) => r(ok ? 200 : code)));
  assert.equal(await ws('?token=ok'), 200);
  assert.equal(await ws('?token=pending'), 403);
  assert.equal(await ws('?token=forged'), 401);
  delete process.env.FIREBASE_PROJECT_ID;
});
