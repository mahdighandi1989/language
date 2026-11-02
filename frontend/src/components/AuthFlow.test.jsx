// End-to-end sign-in and cloud-sync flow of the real <App/> with the Firebase
// SDK mocked at the module boundary. Covers: the owner becomes admin even when
// VITE_ADMIN_EMAILS is absent; a Firestore permission error shows an
// explanation instead of «waiting for approval»; a normal user lands on pending;
// the auto-save never runs before the user's document is loaded and never
// re-saves what was just loaded.
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';

const h = vi.hoisted(() => ({
  authCb: null,
  snapCbs: {},
  getDocImpl: null,
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
