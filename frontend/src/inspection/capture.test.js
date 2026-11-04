import { describe, it, expect } from 'vitest';
import { captureEnv, describeGeometry } from './capture.js';

describe('capture', () => {
  it('records the browser environment', () => {
    const e = captureEnv(window);
    expect(e.viewport.w).toBe(window.innerWidth);
    expect(e.url).toContain('http');
    expect(['light', 'dark']).toContain(e.theme);
  });
  it('describes coordinates for the form and the board', () => {
    const rows = describeGeometry({ doc: { x: 10.4, y: 20, w: 100, h: 50 }, viewport: { w: 800, h: 600 }, dpr: 2, scroll: { x: 0, y: 5 }, anchor: { selector: '#a', fx: 0.1, fy: 0.2, fw: 0.3, fh: 0.4 } });
    expect(rows.map((r) => r[0])).toEqual(['مختصاتِ سند', 'پنجره', 'اسکرول', 'گرهٔ زیرِ کادر', 'جای کادر داخلِ گره']);
    expect(describeGeometry(null)).toEqual([]);
  });
});
