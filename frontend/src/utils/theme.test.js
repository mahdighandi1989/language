import { describe, it, expect } from 'vitest';
import { resolveTheme, applyTheme } from './theme.js';

describe('theme', () => {
  it('stored choice wins, else system preference', () => {
    expect(resolveTheme('dark', false)).toBe('dark');
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme(null, true)).toBe('dark');
    expect(resolveTheme(null, false)).toBe('light');
  });
  it('toggles the dark class', () => {
    const root = document.createElement('html');
    applyTheme('dark', root); expect(root.classList.contains('dark')).toBe(true);
    applyTheme('light', root); expect(root.classList.contains('dark')).toBe(false);
  });
});
