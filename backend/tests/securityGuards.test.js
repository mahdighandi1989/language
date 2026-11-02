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
