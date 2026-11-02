// Tests for the «نظارت و سرکشی» client: box geometry round-trip, hash routes,
// and the API client (token on every call, server errors surfaced).
import { describe, it, expect, vi } from 'vitest';
import { buildSelector, captureGeometry, resolveRect, rectFromPoints, routeFromHash, hashFor, coveredText } from './geometry.js';
import { createInspectionApi } from './api.js';

function stubRect(el, r) {
  el.getBoundingClientRect = () => ({ left: r.x, top: r.y, width: r.w, height: r.h, right: r.x + r.w, bottom: r.y + r.h });
}

describe('geometry', () => {
  it('builds a selector that resolves back to the same element', () => {
    document.body.innerHTML = '<main><section><p>a</p><p id="x">b</p><p>c</p></section><div data-testid="card"><span>s</span></div></main>';
    const third = document.querySelectorAll('p')[2];
    const sel = buildSelector(third);
    expect(document.querySelector(sel)).toBe(third);
    expect(buildSelector(document.getElementById('x'))).toBe('#x');
    expect(buildSelector(document.querySelector('[data-testid="card"]'))).toBe('[data-testid="card"]');
  });

  it('records the box as fractions of its anchor and replays it after layout moves', () => {
    document.body.innerHTML = '<div id="card">hello</div>';
    const el = document.getElementById('card');
    stubRect(el, { x: 100, y: 200, w: 400, h: 100 });
    const g = captureGeometry({ x: 200, y: 225, w: 100, h: 50 }, el, window);
    expect(g.anchor).toEqual({ selector: '#card', fx: 0.25, fy: 0.25, fw: 0.25, fh: 0.5 });
    stubRect(el, { x: 0, y: 0, w: 800, h: 200 }); // the card moved and grew
    expect(resolveRect(g, window)).toMatchObject({ x: 200, y: 50, w: 200, h: 100, via: 'anchor' });
  });

  it('falls back to document coordinates when the anchor is gone', () => {
    const g = { doc: { x: 10, y: 20, w: 30, h: 40 } };
    expect(resolveRect(g, window)).toMatchObject({ x: 10, y: 20, w: 30, h: 40, via: 'doc' });
    expect(resolveRect(null, window)).toBeNull();
  });

  it('normalises drags in any direction', () => {
    expect(rectFromPoints({ x: 50, y: 60 }, { x: 10, y: 20 })).toEqual({ x: 10, y: 20, w: 40, h: 40 });
  });

  it('round-trips hash routes', () => {
    expect(routeFromHash(hashFor('lesson', 1712))).toEqual({ view: 'lesson', id: '1712' });
    expect(routeFromHash('#/inspection')).toEqual({ view: 'inspection', id: null });
    expect(routeFromHash('')).toBeNull();
  });

  it('collects bounded covered text', () => {
    const el = document.createElement('div');
    el.textContent = '  a   b  '.repeat(200);
    expect(coveredText(el).length).toBeLessThanOrEqual(600);
  });
});

describe('inspection api client', () => {
  it('sends the ID token and surfaces the server error message', async () => {
    const fetchImpl = vi.fn(async () => ({ ok: false, status: 403, json: async () => ({ error: 'تیکِ تأیید فقط کارِ مالک است' }) }));
    const api = createInspectionApi(async () => 'tok', fetchImpl);
    await expect(api.approve('7')).rejects.toThrow('فقط کارِ مالک');
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe('/api/inspection/7/approve');
    expect(init.headers.Authorization).toBe('Bearer tok');
  });

  it('refuses to call without a signed-in user', async () => {
    const api = createInspectionApi(async () => null, vi.fn());
    await expect(api.list()).rejects.toThrow('وارد شوید');
  });

  it('builds list queries and JSON bodies', async () => {
    const fetchImpl = vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ sheets: [] }) }));
    const api = createInspectionApi(async () => 't', fetchImpl);
    await api.list({ page: 'lessons', status: '' });
    expect(fetchImpl.mock.calls[0][0]).toBe('/api/inspection?page=lessons');
    await api.note('3', { text: 'x' });
    expect(JSON.parse(fetchImpl.mock.calls[1][1].body)).toEqual({ text: 'x' });
  });
});
