// End-to-end sign-in and cloud-sync flow of the real <App/> with the Firebase
// SDK mocked at the module boundary. Covers: the owner becomes admin even when
// VITE_ADMIN_EMAILS is absent; a Firestore permission error shows an
// explanation instead of «waiting for approval»; a normal user lands on pending;
// the auto-save never runs before the user's document is loaded and never
// re-saves what was just loaded.
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';

const h = vi.hoisted(() => ({
  authCb: null,
  snapCbs: {},
  getDocImpl: null,
  batches: [],
  setDocCalls: [],
}));

vi.mock('firebase/app', () => ({ initializeApp: vi.fn(() => ({})) }));
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({ currentUser: null })),
  GoogleAuthProvider: vi.fn(function GoogleAuthProvider() { this.setCustomParameters = () => {}; }),
  signInWithPopup: vi.fn(() => Promise.resolve()),
  signInWithRedirect: vi.fn(() => Promise.resolve()),
  signOut: vi.fn(() => Promise.resolve()),
  onAuthStateChanged: vi.fn((auth, cb) => { h.authCb = cb; return () => {}; }),
}));
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  setLogLevel: vi.fn(),
  doc: vi.fn((db, path) => ({ path })),
  collection: vi.fn((db, path) => ({ path })),
  serverTimestamp: vi.fn(() => 'ts'),
  updateDoc: vi.fn(() => Promise.resolve()),
  getDoc: vi.fn((ref) => h.getDocImpl(ref)),
  setDoc: vi.fn((ref, data, opts) => { h.setDocCalls.push({ path: ref.path, data, opts }); return Promise.resolve(); }),
  onSnapshot: vi.fn((ref, next) => { h.snapCbs[ref.path] = next; return () => {}; }),
  writeBatch: vi.fn(() => { const ops = []; return { set: (r, d) => ops.push({ path: r.path, data: d }), commit: () => { h.batches.push(ops); return Promise.resolve(); } }; }),
}));

import App from './App.jsx';

const snap = (data, pending = false) => ({ exists: () => data != null, data: () => data, metadata: { hasPendingWrites: pending } });
const ACCESS = '/artifacts/proj/accessControl/u1';
const DATA = '/artifacts/proj/users/u1/data/main';

beforeEach(() => {
  // jsdom has no element scrolling; the dashboard chat calls it on mount.
  Element.prototype.scrollTo = Element.prototype.scrollTo || (() => {});
  Element.prototype.scrollIntoView = Element.prototype.scrollIntoView || (() => {});
  h.authCb = null;
  h.snapCbs = {};
  h.setDocCalls = [];
  h.batches = [];
  h.getDocImpl = async () => snap(null);
  window.__firebase_config = JSON.stringify({ apiKey: 'k', projectId: 'proj' });
  window.__app_id = 'proj';
});
afterEach(() => {
  delete window.__firebase_config;
  delete window.__app_id;
  vi.useRealTimers();
});

describe('sign-in flow', () => {
  it('the owner e-mail is bootstrapped as admin even without VITE_ADMIN_EMAILS', async () => {
    render(<App />);
    await act(async () => { await h.authCb({ uid: 'u1', email: 'Mohamad.Mahdi1988@gmail.com', displayName: 'M' }); });
    const access = h.setDocCalls.find((c) => c.path === ACCESS);
    expect(access.data).toMatchObject({ role: 'admin', status: 'approved' });
  });

  it('a Firestore permission error explains itself instead of «waiting for approval»', async () => {
    h.getDocImpl = async () => { const e = new Error('denied'); e.code = 'permission-denied'; throw e; };
    const { onSnapshot } = await import('firebase/firestore');
    onSnapshot.mockImplementationOnce((ref, next, error) => { error(Object.assign(new Error('x'), { code: 'permission-denied' })); return () => {}; });
    render(<App />);
    await act(async () => { await h.authCb({ uid: 'u1', email: 'someone@example.com' }); });
    expect(await screen.findByText('بررسیِ دسترسی ناموفق بود')).toBeTruthy();
    expect(screen.getByText(/firestore\.rules/)).toBeTruthy();
    expect(screen.queryByText('در انتظار تأیید مدیر')).toBeNull();
  });

  it('a normal user without a record gets a pending request and the waiting screen', async () => {
    render(<App />);
    await act(async () => { await h.authCb({ uid: 'u1', email: 'someone@example.com' }); });
    expect(h.setDocCalls.find((c) => c.path === ACCESS).data).toMatchObject({ role: 'user', status: 'pending' });
    await act(async () => { h.snapCbs[ACCESS](snap({ role: 'user', status: 'pending' })); });
    expect(await screen.findByText('در انتظار تأیید مدیر')).toBeTruthy();
  });
});

describe('cloud sync', () => {
  it('does not save before the document loads, then saves only real changes (no merge, no echo loop)', async () => {
    render(<App />);
    await act(async () => { await h.authCb({ uid: 'u1', email: 'mohamad.mahdi1988@gmail.com' }); });
    await act(async () => { await h.snapCbs[ACCESS](snap({ role: 'admin', status: 'approved', permissions: {} })); });
    // Nothing loaded yet: no data save may happen, however long we wait.
    await new Promise((r) => setTimeout(r, 1200));
    expect(h.setDocCalls.filter((c) => c.path === DATA)).toHaveLength(0);
    // The document arrives; loading it must not trigger a save of the same data.
    const stored = { lessons: [{ id: 1, title: 'درسِ موجود', files: [], progress: {} }], customPrompts: { a: 'x' } };
    await act(async () => { h.snapCbs[DATA](snap(stored)); });
    await new Promise((r) => setTimeout(r, 1200));
    expect(h.setDocCalls.filter((c) => c.path === DATA)).toHaveLength(0);
    // Our own pending-write echo is ignored (would otherwise loop).
    await act(async () => { h.snapCbs[DATA](snap({ ...stored, lessons: [] }, true)); });
    await waitFor(() => expect(screen.getAllByText(/لهجه لبنانی/).length).toBeGreaterThan(0));
    expect(h.setDocCalls.filter((c) => c.path === DATA)).toHaveLength(0);
  });
});

describe('lesson bodies outside the 1 MiB document', () => {
  it('loads a stored body without re-saving anything', async () => {
    const { textHash } = await import('../lessons/lessonBodies.js');
    const body = 'متنِ کاملِ درسِ ۳ — '.repeat(50);
    h.getDocImpl = async (ref) => {
      if (ref.path.endsWith('/lessonBodies/L3')) return snap({ chunks: 1, chars: body.length, hash: textHash(body) });
      if (ref.path.endsWith('/lessonBodies/L3/chunks/0000')) return snap({ i: 0, text: body });
      return snap(null);
    };
    render(<App />);
    await act(async () => { await h.authCb({ uid: 'u1', email: 'mohamad.mahdi1988@gmail.com' }); });
    await act(async () => { await h.snapCbs[ACCESS](snap({ role: 'admin', status: 'approved', permissions: {} })); });
    await act(async () => { h.snapCbs[DATA](snap({ lessons: [{ id: 3, title: '3 - ریتا', summary: '', archivedNotes: '', files: [], bodyRef: { key: 'L3', chars: body.length, hash: textHash(body) } }] })); });
    const { getDoc } = await import('firebase/firestore');
    await waitFor(() => expect(getDoc.mock.calls.some(([r]) => r.path.endsWith('/lessonBodies/L3/chunks/0000'))).toBe(true));
    await new Promise((r) => setTimeout(r, 1300));
    expect(h.setDocCalls.filter((c) => c.path === DATA)).toHaveLength(0);
    expect(h.batches).toHaveLength(0);
  });

  const importSetup = async () => {
    URL.createObjectURL = URL.createObjectURL || (() => 'blob:x');
    URL.revokeObjectURL = URL.revokeObjectURL || (() => {});
    window.location.hash = '#/admin';
    render(<App />);
    await act(async () => { await h.authCb({ uid: 'u1', email: 'mohamad.mahdi1988@gmail.com' }); });
    await act(async () => { await h.snapCbs[ACCESS](snap({ role: 'admin', status: 'approved', permissions: {} })); });
    const old = { id: 1, title: '1 - ریتا', summary: 's', archivedNotes: 'یادداشتِ قدیمی', files: [], progress: {} };
    await act(async () => { h.snapCbs[DATA](snap({ lessons: [old], chatHistories: { 'lesson-1': [{ role: 'user', parts: [{ text: 'سلام' }] }] } })); });
    const longText = '| عربی | فارسی |\n|---|---|\n| مرحبا | سلام |\n' + 'ن'.repeat(300000);
    const file = new File([JSON.stringify({ format: 'lebanese-lessons', version: 1, lessons: [
      { sourceKey: 'rita/1', title: '1 - ریتا', archivedNotes: 'x' },
      { sourceKey: 'rita/3', title: '3 - ریتا', course: 'ریتا', order: 3, archivedNotes: longText },
    ] })], 'rita.json', { type: 'application/json' });
    fireEvent.change(await screen.findByLabelText('فایلِ ایمپورت'), { target: { files: [file] } });
    return { old, longText };
  };

  it('admin import: ONE atomic batch (bodies + main), success shown only after Firestore acknowledged', async () => {
    const { writeBatch } = await import('firebase/firestore');
    let release;
    writeBatch.mockImplementationOnce(() => { const ops = []; return { set: (r, d) => ops.push({ path: r.path, data: d }), commit: () => new Promise((res) => { release = () => { h.batches.push(ops); res(); }; }) }; });
    const { old, longText } = await importSetup();
    fireEvent.click(await screen.findByText(/پشتیبان‌گیری و اعمال/));
    expect(await screen.findByText(/در حالِ ذخیره در فضای ابری/)).toBeTruthy();
    expect(screen.queryByText(/ذخیره در فضای ابری تأیید شد/)).toBeNull(); // no success before the backend says so
    await waitFor(() => expect(typeof release).toBe('function'));
    await act(async () => { release(); });
    expect(await screen.findByText(/ذخیره در فضای ابری تأیید شد/)).toBeTruthy();
    expect(h.batches).toHaveLength(1);
    const ops = h.batches[0];
    expect(ops.filter((o) => o.path.includes('/lessonBodies/') && o.path.includes('/chunks/'))).toHaveLength(2);
    expect(ops.filter((o) => o.path.includes('/chunks/')).map((o) => o.data.text).join('')).toBe(longText);
    const main = ops.find((o) => o.path === DATA).data;
    expect(main.lessons[0]).toMatchObject({ ...old, archivedNotes: expect.stringMatching(/^یادداشتِ قدیمی/), importedSourceKeys: ['rita/1'] });
    expect(main.lessons[1]).toMatchObject({ title: '3 - ریتا', archivedNotes: '', sourceKey: 'rita/3' });
    expect(main.lessons[1].bodyRef.chars).toBe(longText.length);
    expect(main.chatHistories['lesson-1']).toHaveLength(1);
    expect(JSON.stringify(main).length).toBeLessThan(20000);
    expect(h.setDocCalls.filter((c) => c.path === DATA)).toHaveLength(0); // the main doc went in the batch
    window.location.hash = '';
  });

  it('admin import: a rejected write shows a red error and a retry, never a success', async () => {
    const { writeBatch } = await import('firebase/firestore');
    writeBatch.mockImplementation(() => ({ set: () => {}, commit: () => Promise.reject(Object.assign(new Error('Missing or insufficient permissions.'), { code: 'permission-denied' })) }));
    await importSetup();
    fireEvent.click(await screen.findByText(/پشتیبان‌گیری و اعمال/));
    expect(await screen.findByText(/ذخیره در فضای ابری ناموفق بود/)).toBeTruthy();
    expect(screen.getByText('تلاشِ دوباره برای ذخیره')).toBeTruthy();
    expect(screen.queryByText(/ذخیره در فضای ابری تأیید شد/)).toBeNull();
    expect(screen.getAllByText(/firestore\.rules/).length).toBeGreaterThan(0); // the explanation names the rules
    writeBatch.mockReset();
    writeBatch.mockImplementation(() => { const o = []; return { set: (r, d) => o.push({ path: r.path, data: d }), commit: () => { h.batches.push(o); return Promise.resolve(); } }; });
    window.location.hash = '';
  });
});
