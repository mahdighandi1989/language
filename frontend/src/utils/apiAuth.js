// Purpose: attach the signed-in user's Firebase ID token to every same-origin
// /api/* request (and to the Live WebSocket URL), so the server can require
// authentication on the endpoints that spend the Gemini key. One interceptor
// instead of editing every fetch call site in components/App.jsx.
//
// Upstream: firebase/auth (currentUser.getIdToken). Downstream: installed once
// by components/App.jsx after Firebase init; withLiveToken() wraps the WS URL.

let latestToken = null;
let installed = false;

export function isApiRequest(url, origin = (typeof window !== 'undefined' ? window.location.origin : '')) {
  try {
    const u = new URL(url, origin || 'http://localhost');
    return (!origin || u.origin === origin) && u.pathname.startsWith('/api/');
  } catch {
    return false;
  }
}

export function installApiAuth(auth, win = window) {
  if (installed || !auth || !win?.fetch) return () => {};
  installed = true;
  const original = win.fetch.bind(win);
  win.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input?.url;
    const user = auth.currentUser;
    if (user && url && isApiRequest(url, win.location?.origin)) {
      const headers = new Headers(init.headers || (typeof input !== 'string' ? input.headers : undefined) || {});
      if (!headers.has('Authorization')) {
        try {
          latestToken = await user.getIdToken();
          headers.set('Authorization', `Bearer ${latestToken}`);
        } catch { /* send without; the server decides */ }
      }
      return original(input, { ...init, headers });
    }
    return original(input, init);
  };
  return () => { win.fetch = original; installed = false; };
}

/** Refresh and remember the token (call before opening the Live socket). */
export async function refreshLiveToken(auth) {
  try {
    latestToken = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
  } catch {
    latestToken = null;
  }
  return latestToken;
}

/** Append ?token=<id token> to the Live WebSocket URL when signed in. */
export function withLiveToken(url, token = latestToken) {
  if (!token) return url;
  return `${url}${url.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`;
}
