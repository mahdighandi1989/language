// Purpose: light/dark theme. Choice per browser (localStorage, try/catch —
// private windows may block it); default follows the system. Applies
// <html class="dark">; the colours live in index.css.
const KEY = 'ui_theme';

export function storedTheme() {
  try { return localStorage.getItem(KEY); } catch { return null; }
}

export function resolveTheme(stored = storedTheme(), prefersDark = typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
  return stored === 'dark' || stored === 'light' ? stored : (prefersDark ? 'dark' : 'light');
}

export function applyTheme(theme, root = typeof document !== 'undefined' ? document.documentElement : null) {
  if (!root) return;
  root.classList.toggle('dark', theme === 'dark');
}

export function setTheme(theme) {
  try { localStorage.setItem(KEY, theme); } catch { /* ignore */ }
  applyTheme(theme);
  return theme;
}
