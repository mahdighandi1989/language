import { describe, it, expect, afterEach } from 'vitest';
import { installConsoleTap, recentConsole, resetConsoleTap, MAX_ENTRIES, MAX_TEXT } from './consoleTap.js';
import { captureEnv, describeConsole } from './capture.js';

describe('consoleTap', () => {
  let uninstall = () => {};
  afterEach(() => { uninstall(); resetConsoleTap(); });

  it('records console errors/warnings and still calls the original', () => {
    const seen = [];
    const fakeWin = { console: { error: (...a) => seen.push(['e', ...a]), warn: (...a) => seen.push(['w', ...a]), log: () => {} } };
    uninstall = installConsoleTap(fakeWin);
    fakeWin.console.error('boom', new Error('bad'));
    fakeWin.console.warn({ a: 1 });
    fakeWin.console.log('ignored');
    expect(seen.length).toBe(2);
    const list = recentConsole();
    expect(list.map((e) => e.level)).toEqual(['error', 'warn']);
    expect(list[0].text).toBe('boom Error: bad');
    expect(list[1].text).toBe('{"a":1}');
  });

  it('is bounded in count and length', () => {
    const fakeWin = { console: { error: () => {}, warn: () => {} } };
    uninstall = installConsoleTap(fakeWin);
    for (let i = 0; i < MAX_ENTRIES + 5; i += 1) fakeWin.console.error(`e${i}`, 'x'.repeat(500));
    const list = recentConsole();
    expect(list.length).toBe(MAX_ENTRIES);
    expect(list[0].text.startsWith('e5 ')).toBe(true);
    expect(list.every((e) => e.text.length <= MAX_TEXT)).toBe(true);
  });

  it('flows into captureEnv and the form/board rows; env stays under the server cap', () => {
    const fakeWin = { console: { error: () => {}, warn: () => {} } };
    uninstall = installConsoleTap(fakeWin);
    for (let i = 0; i < MAX_ENTRIES; i += 1) fakeWin.console.error('y'.repeat(500));
    const env = captureEnv(window);
    expect(env.console.length).toBe(MAX_ENTRIES);
    expect(JSON.stringify(env).length).toBeLessThan(8000);
    expect(describeConsole(env)[0][0]).toBe('کنسول 1 (error)');
    expect(describeConsole(null)).toEqual([]);
  });

  it('uninstall restores the original console functions', () => {
    const orig = () => {};
    const fakeWin = { console: { error: orig, warn: orig } };
    const un = installConsoleTap(fakeWin);
    expect(fakeWin.console.error).not.toBe(orig);
    un();
    expect(fakeWin.console.error).toBe(orig);
  });
});
