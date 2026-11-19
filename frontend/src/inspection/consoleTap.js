// Purpose: keep the last few console errors/warnings of THIS tab in memory so a
// «نظارت» sheet can carry them (env.console). Bug-report tools record what the
// browser complained about right before the report; without it the supervisor
// only sees a picture of a symptom whose cause was printed in the console.
//
// It only observes: the original console.error/warn still run unchanged, and
// nothing leaves the tab except inside a sheet the person files themselves.
// Bounded: MAX_ENTRIES entries of MAX_TEXT chars each.
//
// Uncaught errors/rejections arrive here too: inspectorBridge.js reports them
// with console.error (installed first in main.jsx), so no extra listeners —
// listening as well would record each one twice in an 8-slot buffer.
//
// Upstream: window.console (+ inspectorBridge.js for uncaught errors).
// Downstream: capture.js captureEnv() → env.console → backend envOf() →
// InspectionBoard «📐 مختصات و محیط» and scripts/supervisor/inspection.py pull.

export const MAX_ENTRIES = 8;
export const MAX_TEXT = 200;

const buffer = [];
let installedOn = null;

function textOf(v) {
  if (v == null) return String(v);
  if (typeof v === 'string') return v;
  if (v instanceof Error) return `${v.name}: ${v.message}`;
  try { return JSON.stringify(v); } catch { return String(v); }
}

export function record(level, args) {
  const text = Array.from(args || []).map(textOf).join(' ').replace(/\s+/g, ' ').trim().slice(0, MAX_TEXT);
  if (!text) return;
  buffer.push({ level, text, at: new Date().toISOString() });
  while (buffer.length > MAX_ENTRIES) buffer.shift();
}

/** The last console errors/warnings (oldest first), as plain objects. */
export function recentConsole() {
  return buffer.map((e) => ({ ...e }));
}

export function resetConsoleTap() {
  buffer.length = 0;
}

/** Wrap console.error/warn (observe only). Idempotent. */
export function installConsoleTap(win = (typeof window !== 'undefined' ? window : undefined)) {
  if (!win || installedOn === win) return () => {};
  installedOn = win;
  const con = win.console || {};
  const orig = { error: con.error, warn: con.warn };
  ['error', 'warn'].forEach((level) => {
    if (typeof orig[level] !== 'function') return;
    con[level] = function tapped(...args) {
      try { record(level, args); } catch { /* never break logging */ }
      return orig[level].apply(this, args);
    };
  });
  return () => {
    if (orig.error) con.error = orig.error;
    if (orig.warn) con.warn = orig.warn;
    installedOn = null;
  };
}
