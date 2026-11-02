// Purpose: pure geometry for «نظارت و سرکشی» boxes. A box is recorded three ways
// so the supervisor (and the highlight layer) can find it again: document
// coordinates, the viewport/scroll/dpr at the time, and an ANCHOR — a verified
// CSS selector of the element under the box with the box as FRACTIONS of that
// element (horizontal fractions from the anchor's LEFT edge, even in RTL).
//
// Upstream: the DOM (passed in, so tests can use jsdom). Downstream:
// InspectionLayer.jsx (capture + highlights), the supervisor's screenshot tool.

const ESC = (s) => (typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(s) : String(s).replace(/[^a-zA-Z0-9_-]/g, '\\$&'));

/** Build a selector that resolves back to exactly `el` (round-trip verified). */
export function buildSelector(el, root = document) {
  if (!el || el.nodeType !== 1) return '';
  if (el.id && root.querySelectorAll(`#${ESC(el.id)}`).length === 1) return `#${ESC(el.id)}`;
  const testId = el.getAttribute && el.getAttribute('data-testid');
  if (testId && root.querySelectorAll(`[data-testid="${testId}"]`).length === 1) return `[data-testid="${testId}"]`;
  const parts = [];
  let node = el;
  while (node && node.nodeType === 1 && node !== root.documentElement) {
    const parent = node.parentElement;
    if (!parent) break;
    const tag = node.tagName.toLowerCase();
    const same = Array.from(parent.children).filter((c) => c.tagName === node.tagName);
    parts.unshift(same.length > 1 ? `${tag}:nth-of-type(${same.indexOf(node) + 1})` : tag);
    if (node.id && root.querySelectorAll(`#${ESC(node.id)}`).length === 1) {
      parts[0] = `#${ESC(node.id)}`;
      break;
    }
    node = parent;
  }
  const selector = parts.join(' > ');
  try {
    return root.querySelector(selector) === el ? selector : '';
  } catch {
    return '';
  }
}

/** Normalise two drag points (viewport px) to a rect { x, y, w, h }. */
export function rectFromPoints(a, b) {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return { x, y, w: Math.abs(a.x - b.x), h: Math.abs(a.y - b.y) };
}

const clamp01 = (n) => Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
const round = (n) => Math.round(n * 10000) / 10000;

/**
 * Record a viewport rect. `anchorEl` is the element under the box centre.
 * Returns the geometry object stored on the sheet.
 */
export function captureGeometry(rect, anchorEl, win = window) {
  const scroll = { x: win.scrollX || 0, y: win.scrollY || 0 };
  const geometry = {
    doc: { x: rect.x + scroll.x, y: rect.y + scroll.y, w: rect.w, h: rect.h },
    viewport: { w: win.innerWidth, h: win.innerHeight },
    scroll,
    dpr: win.devicePixelRatio || 1,
  };
  const selector = anchorEl ? buildSelector(anchorEl, win.document) : '';
  if (selector) {
    const a = anchorEl.getBoundingClientRect();
    if (a.width > 0 && a.height > 0) {
      geometry.anchor = {
        selector,
        fx: round(clamp01((rect.x - a.left) / a.width)),
        fy: round(clamp01((rect.y - a.top) / a.height)),
        fw: round(clamp01(rect.w / a.width)),
        fh: round(clamp01(rect.h / a.height)),
      };
    }
  }
  return geometry;
}

/** Where to draw a stored box NOW (viewport px), or null when it cannot be placed. */
export function resolveRect(geometry, win = window) {
  if (!geometry) return null;
  const anchor = geometry.anchor;
  if (anchor?.selector) {
    let el = null;
    try { el = win.document.querySelector(anchor.selector); } catch { el = null; }
    if (el) {
      const a = el.getBoundingClientRect();
      if (a.width > 0 && a.height > 0) {
        return { x: a.left + anchor.fx * a.width, y: a.top + anchor.fy * a.height, w: anchor.fw * a.width, h: anchor.fh * a.height, via: 'anchor' };
      }
    }
  }
  if (geometry.doc) {
    return { x: geometry.doc.x - (win.scrollX || 0), y: geometry.doc.y - (win.scrollY || 0), w: geometry.doc.w, h: geometry.doc.h, via: 'doc' };
  }
  return null;
}

/** Visible text covered by the anchor (bounded) — helps the supervisor find it. */
export function coveredText(anchorEl, max = 600) {
  if (!anchorEl) return '';
  return String(anchorEl.innerText || anchorEl.textContent || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

/** Hash route helpers so a sheet can say «put me back here». */
export function routeFromHash(hash) {
  const m = /^#\/([A-Za-z]+)(?:\/([^/?#]+))?/.exec(String(hash || ''));
  return m ? { view: m[1], id: m[2] ? decodeURIComponent(m[2]) : null } : null;
}

export function hashFor(view, id = null) {
  return id != null ? `#/${view}/${encodeURIComponent(id)}` : `#/${view}`;
}
