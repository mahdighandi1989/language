// Unit tests for the AI-command guard logic that App.jsx mounts via
// <InspectorBridge/>. These guards (isValidSelector / isValidUrl / handleCommand)
// were extracted from the former monolithic App.jsx and are the security-critical
// "logic in App.jsx" the test task targets: they decide whether an AI-issued
// click/navigate command is allowed to touch the live page.
import { describe, it, expect, vi } from 'vitest';
import {
  isValidSelector,
  isValidUrl,
  handleCommand,
  defaultCommandActions,
  startPostMessageBridge,
  BRIDGE_COMMAND_SOURCE,
} from './InspectorBridge.jsx';

describe('isValidSelector', () => {
  it('accepts a plain, short CSS selector', () => {
    expect(isValidSelector('.btn-primary')).toBe(true);
    expect(isValidSelector('#submit')).toBe(true);
    expect(isValidSelector('button.save')).toBe(true);
  });

  it('rejects non-strings and empty/oversized input', () => {
    expect(isValidSelector(null)).toBe(false);
    expect(isValidSelector(123)).toBe(false);
    expect(isValidSelector('')).toBe(false);
    expect(isValidSelector('   ')).toBe(false);
    expect(isValidSelector('a'.repeat(201))).toBe(false);
  });

  it('rejects whole-document / universal selectors', () => {
    expect(isValidSelector('*')).toBe(false);
    expect(isValidSelector('body *')).toBe(false);
    expect(isValidSelector('div  *  ')).toBe(false);
  });

  it('rejects characters common in injection attempts', () => {
    expect(isValidSelector('div<script>')).toBe(false);
    expect(isValidSelector('a();')).toBe(false);
    expect(isValidSelector('x{y}')).toBe(false);
  });
});

describe('isValidUrl', () => {
  it('accepts http(s) URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://localhost:3000/path')).toBe(true);
  });

  it('rejects dangerous and non-http schemes', () => {
    expect(isValidUrl('javascript:alert(1)')).toBe(false);
    expect(isValidUrl('data:text/html,<h1>x')).toBe(false);
    expect(isValidUrl('file:///etc/passwd')).toBe(false);
  });

  it('rejects non-strings, empty and oversized input', () => {
    expect(isValidUrl(undefined)).toBe(false);
    expect(isValidUrl('')).toBe(false);
    expect(isValidUrl('https://x.com/' + 'a'.repeat(2048))).toBe(false);
  });
});

describe('handleCommand', () => {
  it('dispatches a valid click command to the injected action', () => {
    const click = vi.fn();
    const ok = handleCommand({ command: 'click', selector: '.go' }, { click });
    expect(ok).toBe(true);
    expect(click).toHaveBeenCalledWith('.go');
  });

  it('rejects a click with an invalid selector and does not act', () => {
    const click = vi.fn();
    const ok = handleCommand({ command: 'click', selector: '*' }, { click });
    expect(ok).toBe(false);
    expect(click).not.toHaveBeenCalled();
  });

  it('dispatches a valid navigate command and rejects bad URLs', () => {
    const navigate = vi.fn();
    expect(
      handleCommand({ command: 'navigate', url: 'https://ok.com' }, { navigate }),
    ).toBe(true);
    expect(navigate).toHaveBeenCalledWith('https://ok.com');

    navigate.mockClear();
    expect(
      handleCommand({ command: 'navigate', url: 'javascript:1' }, { navigate }),
    ).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('returns false for malformed or unknown commands', () => {
    expect(handleCommand(null)).toBe(false);
    expect(handleCommand('nope')).toBe(false);
    expect(handleCommand({ command: 'explode' })).toBe(false);
  });

  it('exposes default DOM actions that click a matched element', () => {
    const el = document.createElement('button');
    el.id = 'target';
    const clickSpy = vi.fn();
    el.click = clickSpy;
    document.body.appendChild(el);

    defaultCommandActions.click('#target');
    expect(clickSpy).toHaveBeenCalled();

    document.body.removeChild(el);
  });
});

describe('startPostMessageBridge', () => {
  // A minimal stand-in for a window: records listeners and lets us fire a
  // synthetic "message" event without touching the real jsdom window.
  function makeTarget() {
    const listeners = {};
    return {
      addEventListener: (type, fn) => {
        (listeners[type] ||= []).push(fn);
      },
      removeEventListener: (type, fn) => {
        listeners[type] = (listeners[type] || []).filter((f) => f !== fn);
      },
      emit: (type, event) => (listeners[type] || []).forEach((f) => f(event)),
      count: (type) => (listeners[type] || []).length,
    };
  }

  it('routes a tagged postMessage envelope through handleCommand', () => {
    const target = makeTarget();
    const click = vi.fn();
    startPostMessageBridge({ click }, target);

    target.emit('message', {
      data: { source: BRIDGE_COMMAND_SOURCE, command: 'click', selector: '.go' },
    });
    expect(click).toHaveBeenCalledWith('.go');
  });

  it('ignores messages that are not tagged for the bridge', () => {
    const target = makeTarget();
    const click = vi.fn();
    const navigate = vi.fn();
    startPostMessageBridge({ click, navigate }, target);

    target.emit('message', { data: { command: 'click', selector: '.go' } });
    target.emit('message', { data: 'not-an-object' });
    target.emit('message', { data: null });
    expect(click).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('still validates commands received over postMessage', () => {
    const target = makeTarget();
    const navigate = vi.fn();
    startPostMessageBridge({ navigate }, target);

    // A javascript: URL must be rejected even when it arrives via postMessage.
    target.emit('message', {
      data: { source: BRIDGE_COMMAND_SOURCE, command: 'navigate', url: 'javascript:1' },
    });
    expect(navigate).not.toHaveBeenCalled();
  });

  it('unsubscribes the listener when the returned cleanup runs', () => {
    const target = makeTarget();
    const click = vi.fn();
    const stop = startPostMessageBridge({ click }, target);
    expect(target.count('message')).toBe(1);

    stop();
    expect(target.count('message')).toBe(0);
    target.emit('message', {
      data: { source: BRIDGE_COMMAND_SOURCE, command: 'click', selector: '.go' },
    });
    expect(click).not.toHaveBeenCalled();
  });

  it('is a no-op for a target without addEventListener', () => {
    expect(() => startPostMessageBridge({}, {})()).not.toThrow();
  });
});
