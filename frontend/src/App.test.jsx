// Unit tests for the historical entry module src/App.jsx itself (distinct from
// src/components/App.jsx, whose getPrompt/MarkdownRenderer logic is covered in
// src/components/App.test.jsx). src/App.jsx is a thin compatibility shim: it
// re-exports the real root component plus the WebSocket-URL resolver and the
// validated AI-command handlers so the legacy `./App` import path keeps working
// after the components/ restructure. These tests lock that public re-export
// surface — a regression here silently breaks every legacy `import ... from
// './App'` consumer, which no other test would catch.
//
// Firebase SDK modules are mocked so importing the (large) App module does not
// touch any real Firebase wiring (mirrors src/components/App.test.jsx).
import { describe, it, expect, vi } from 'vitest';

vi.mock('firebase/app', () => ({ initializeApp: vi.fn(() => ({})) }));
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  signInAnonymously: vi.fn(() => Promise.resolve()),
  signInWithCustomToken: vi.fn(() => Promise.resolve()),
  onAuthStateChanged: vi.fn(() => () => {}),
}));
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  setLogLevel: vi.fn(),
  doc: vi.fn(() => ({})),
  onSnapshot: vi.fn(() => () => {}),
  setDoc: vi.fn(() => Promise.resolve()),
}));

import App, {
  resolveLiveWsUrl,
  LIVE_WS_PATH,
  isValidSelector,
  isValidUrl,
  handleCommand,
  startPostMessageBridge,
} from './App.jsx';
// Source modules, to prove the shim re-exports the *same* references and not
// accidental copies/shadows.
import RealApp from './components/App.jsx';
import * as wsUrl from './utils/wsUrl.js';
import * as inspectorBridge from './components/InspectorBridge.jsx';

describe('src/App.jsx re-export shim', () => {
  it('re-exports the real root component as its default export', () => {
    expect(App).toBe(RealApp);
    expect(typeof App).toBe('function');
  });

  it('re-exports the Live WebSocket URL resolver and path from utils/wsUrl', () => {
    expect(resolveLiveWsUrl).toBe(wsUrl.resolveLiveWsUrl);
    expect(LIVE_WS_PATH).toBe(wsUrl.LIVE_WS_PATH);
    expect(LIVE_WS_PATH).toBe('/ws/live');
  });

  it('re-exports the validated AI-command handlers from InspectorBridge', () => {
    expect(isValidSelector).toBe(inspectorBridge.isValidSelector);
    expect(isValidUrl).toBe(inspectorBridge.isValidUrl);
    expect(handleCommand).toBe(inspectorBridge.handleCommand);
    expect(startPostMessageBridge).toBe(inspectorBridge.startPostMessageBridge);
  });

  it('exposes every name the legacy import path relied on', () => {
    for (const fn of [
      resolveLiveWsUrl,
      isValidSelector,
      isValidUrl,
      handleCommand,
      startPostMessageBridge,
    ]) {
      expect(typeof fn).toBe('function');
    }
  });
});

describe('logic reachable through src/App.jsx', () => {
  it('resolveLiveWsUrl falls back to the backend /ws/live path on this origin', () => {
    expect(resolveLiveWsUrl({ protocol: 'http:', host: 'localhost:5173' })).toBe(
      'ws://localhost:5173/ws/live',
    );
    expect(resolveLiveWsUrl({ protocol: 'https:', host: 'app.example.com' })).toBe(
      'wss://app.example.com/ws/live',
    );
  });

  it('command guards reject hostile selectors and javascript: URLs', () => {
    expect(isValidSelector('#valid-id .btn')).toBe(true);
    expect(isValidSelector('body *')).toBe(false);
    expect(isValidUrl('https://example.com/page')).toBe(true);
    expect(isValidUrl('javascript:alert(1)')).toBe(false);
  });

  it('handleCommand never acts on a click carrying an invalid selector', () => {
    const click = vi.fn();
    const acted = handleCommand({ command: 'click', selector: 'body *' }, { click });
    expect(acted).toBe(false);
    expect(click).not.toHaveBeenCalled();
  });

  it('handleCommand dispatches a click with a valid selector', () => {
    const click = vi.fn();
    const acted = handleCommand({ command: 'click', selector: '#submit' }, { click });
    expect(acted).toBe(true);
    expect(click).toHaveBeenCalledWith('#submit');
  });
});
