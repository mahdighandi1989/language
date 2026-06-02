// Purpose: resolve the Live Voice WebSocket endpoint used by the SPA. The
// endpoint is configurable via the build-time env var `import.meta.env.VITE_WS_URL`
// so the frontend can point at a backend running on a different host/port (e.g.
// `ws://localhost:3001/ws/live` during local dev, where Vite serves on :5173).
// When unset it falls back to the app's own origin and the backend's `/ws/live`
// path, so production (frontend + backend served together) needs no extra config
// and no third-party URL is ever hard-coded.
//
// Upstream (what this depends on): the runtime `window.location` (origin) and the
// `VITE_WS_URL` env var injected at build time by Vite.
// Downstream (what depends on this): src/components/App.jsx opens the Live Voice
// socket with the resolved URL; re-exported from src/App.jsx for the historical
// import path.

// The backend Live API socket path (see backend/server.js: new WebSocketServer
// `{ path: '/ws/live' }`). Kept as a named constant so the path is referenced in
// one place on the client.
export const LIVE_WS_PATH = '/ws/live';

// Read VITE_WS_URL defensively: import.meta.env is always present under Vite, but
// guarding keeps the helper usable from plain unit tests / non-Vite contexts.
function configuredWsUrl() {
  try {
    const env = import.meta.env;
    const value = env && env.VITE_WS_URL;
    return typeof value === 'string' && value.trim() ? value.trim() : '';
  } catch {
    return '';
  }
}

// Resolve the Live Voice WebSocket URL.
// - If `VITE_WS_URL` is configured, it wins (full ws(s):// URL).
// - Otherwise derive it from the current page origin, choosing the secure
//   `wss:` scheme on HTTPS pages and `ws:` otherwise, and appending `/ws/live`.
// `loc` is injectable for testing; it defaults to the browser's window.location.
export function resolveLiveWsUrl(loc = (typeof window !== 'undefined' ? window.location : undefined)) {
  const configured = configuredWsUrl();
  if (configured) return configured;
  if (!loc || !loc.host) return LIVE_WS_PATH;
  const secureScheme = 'wss:';
  const plainScheme = 'ws:';
  const scheme = loc.protocol === 'https:' ? secureScheme : plainScheme;
  return `${scheme}//${loc.host}${LIVE_WS_PATH}`;
}

export default resolveLiveWsUrl;
