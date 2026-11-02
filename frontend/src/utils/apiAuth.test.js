import { describe, it, expect, vi } from 'vitest';
import { installApiAuth, isApiRequest, withLiveToken } from './apiAuth.js';

describe('apiAuth', () => {
  it('adds the ID token to same-origin /api calls only', async () => {
    const calls = [];
    const win = { location: { origin: 'https://app.example' }, fetch: vi.fn(async (input, init) => { calls.push([input, init]); return { ok: true }; }) };
    const auth = { currentUser: { getIdToken: async () => 'tok' } };
    const undo = installApiAuth(auth, win);
    await win.fetch('/api/gemini/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
    await win.fetch('https://fonts.googleapis.com/css');
    await win.fetch('/api/inspection', { headers: { Authorization: 'Bearer own' } });
    expect(calls[0][1].headers.get('Authorization')).toBe('Bearer tok');
    expect(calls[0][1].headers.get('Content-Type')).toBe('application/json');
    expect(calls[1][1]?.headers).toBeUndefined();
    expect(calls[2][1].headers.get('Authorization')).toBe('Bearer own');
    undo();
  });
  it('classifies URLs and appends the WS token', () => {
    expect(isApiRequest('/api/x', 'https://a.b')).toBe(true);
    expect(isApiRequest('https://evil.c/api/x', 'https://a.b')).toBe(false);
    expect(withLiveToken('wss://a.b/ws/live', 't k')).toBe('wss://a.b/ws/live?token=t%20k');
    expect(withLiveToken('wss://a.b/ws/live', null)).toBe('wss://a.b/ws/live');
  });
});
