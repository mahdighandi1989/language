import { describe, it, expect, afterEach, vi } from 'vitest';
import { resolveLiveWsUrl, LIVE_WS_PATH } from './wsUrl.js';

describe('resolveLiveWsUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('prefers VITE_WS_URL when configured', () => {
    vi.stubEnv('VITE_WS_URL', 'ws://localhost:3001/ws/live');
    expect(resolveLiveWsUrl({ protocol: 'https:', host: 'example.com' })).toBe(
      'ws://localhost:3001/ws/live',
    );
  });

  it('trims surrounding whitespace from VITE_WS_URL', () => {
    vi.stubEnv('VITE_WS_URL', '  wss://api.example.com/ws/live  ');
    expect(resolveLiveWsUrl({ protocol: 'https:', host: 'example.com' })).toBe(
      'wss://api.example.com/ws/live',
    );
  });

  it('falls back to wss:// on https pages', () => {
    vi.stubEnv('VITE_WS_URL', '');
    expect(resolveLiveWsUrl({ protocol: 'https:', host: 'app.example.com' })).toBe(
      'wss://app.example.com/ws/live',
    );
  });

  it('falls back to ws:// on http pages', () => {
    vi.stubEnv('VITE_WS_URL', '');
    expect(resolveLiveWsUrl({ protocol: 'http:', host: 'localhost:5173' })).toBe(
      'ws://localhost:5173/ws/live',
    );
  });

  it('returns the bare path when no location is available', () => {
    vi.stubEnv('VITE_WS_URL', '');
    expect(resolveLiveWsUrl(null)).toBe(LIVE_WS_PATH);
  });

  it('derives the fallback from the given host, not a third-party host', () => {
    vi.stubEnv('VITE_WS_URL', '');
    const url = resolveLiveWsUrl({ protocol: 'https:', host: 'mysite.dev' });
    // The fallback uses only the provided origin host and the backend path.
    expect(url).toBe('wss://mysite.dev/ws/live');
  });
});
