// Purpose: what the «نظارت» form records AUTOMATICALLY when the owner/user
// draws a box — a screenshot of the visible page with the box drawn on it, and
// an environment snapshot (URL, viewport, dpr, UA, language). Without these the
// supervisor only had coordinates and had to guess what the person saw.
//
// Upstream: html2canvas (loaded lazily — it is big), the DOM. Downstream:
// InspectionLayer.jsx (form preview + submit), backend stores `shot` and `env`.

const MAX_DATA_URL = 5 * 1024 * 1024; // server cap is 6MB of decoded bytes

/** Plain, bounded facts about the browser at the moment of filing. */
export function captureEnv(win = window) {
  const nav = win.navigator || {};
  return {
    url: String(win.location?.href || '').slice(0, 400),
    userAgent: String(nav.userAgent || '').slice(0, 300),
    language: String(nav.language || '').slice(0, 20),
    viewport: { w: win.innerWidth, h: win.innerHeight },
    screen: { w: win.screen?.width || 0, h: win.screen?.height || 0 },
    dpr: win.devicePixelRatio || 1,
    scroll: { x: win.scrollX || 0, y: win.scrollY || 0 },
    theme: win.document?.documentElement?.classList?.contains('dark') ? 'dark' : 'light',
    capturedAt: new Date().toISOString(),
  };
}

/** One readable line for the coordinates panel. */
export function describeGeometry(g) {
  if (!g) return [];
  const rows = [];
  if (g.doc) rows.push(['مختصاتِ سند', `x=${Math.round(g.doc.x)} y=${Math.round(g.doc.y)} · ${Math.round(g.doc.w)}×${Math.round(g.doc.h)}`]);
  if (g.viewport) rows.push(['پنجره', `${g.viewport.w}×${g.viewport.h} · dpr ${g.dpr || 1}`]);
  if (g.scroll) rows.push(['اسکرول', `x=${Math.round(g.scroll.x)} y=${Math.round(g.scroll.y)}`]);
  if (g.anchor) {
    rows.push(['گرهٔ زیرِ کادر', g.anchor.selector]);
    rows.push(['جای کادر داخلِ گره', `x=${g.anchor.fx} y=${g.anchor.fy} w=${g.anchor.fw} h=${g.anchor.fh}`]);
  }
  return rows;
}

/**
 * Screenshot the visible viewport (our own inspection UI left out) and outline
 * the box in red. Returns a data-URL, or null when capture is impossible
 * (never throws — the sheet can still be filed without it).
 */
export async function captureViewportShot(rect, win = window) {
  try {
    const { default: html2canvas } = await import('html2canvas');
    const doc = win.document;
    const canvas = await html2canvas(doc.body, {
      x: win.scrollX || 0,
      y: win.scrollY || 0,
      width: win.innerWidth,
      height: win.innerHeight,
      windowWidth: win.innerWidth,
      windowHeight: win.innerHeight,
      scale: 1,
      logging: false,
      useCORS: true,
      backgroundColor: null,
      ignoreElements: (el) => Boolean(el.getAttribute && el.getAttribute('data-inspection-ui')),
    });
    const ctx = canvas.getContext('2d');
    if (ctx && rect) {
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#f97316';
      ctx.fillStyle = 'rgba(249,115,22,0.15)';
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    }
    let url = canvas.toDataURL('image/png');
    if (url.length > MAX_DATA_URL) url = canvas.toDataURL('image/jpeg', 0.85);
    return url.length > MAX_DATA_URL ? null : url;
  } catch {
    return null;
  }
}
