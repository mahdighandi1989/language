// Purpose: compute the Live Voice WebSocket reconnect delay using bounded
// exponential backoff. The legacy Inspector Bridge socket reconnected with a
// fixed `setTimeout(connectWS, 3000)`, which could flood the server with retry
// storms when the backend was unreachable. The Live Voice socket
// (src/components/App.jsx) instead schedules reconnects through this helper so a
// dropped connection retries on a 1s, 2s, 4s, 8s, 16s, 30s (capped) curve
// instead of a tight loop, and gives up after a bounded number of attempts.
//
// Upstream (what this depends on): nothing — it is a pure function of the attempt
// index, so it is trivially unit-testable (see wsReconnect.test.js).
// Downstream (what depends on this): src/components/App.jsx's Live Voice
// `onclose` handler uses nextReconnectDelay() to schedule each retry and
// MAX_RECONNECT_ATTEMPTS to stop retrying.

// First retry waits this long; each subsequent attempt doubles up to the cap.
export const BASE_RECONNECT_DELAY_MS = 1000;

// Hard ceiling so the backoff never grows without bound (1s, 2s, 4s, 8s, 16s,
// then 30s for every later attempt).
export const MAX_RECONNECT_DELAY_MS = 30000;

// Stop retrying after this many consecutive failures so a permanently-down
// backend does not produce an endless background reconnect loop.
export const MAX_RECONNECT_ATTEMPTS = 6;

// Delay (ms) before reconnect attempt number `attempt` (1-based: attempt 1 is the
// first retry). Returns BASE * 2^(attempt-1) clamped to [BASE, MAX]. Non-positive
// or non-finite inputs are treated as the first attempt so callers never schedule
// a zero/NaN-delay retry storm.
export function nextReconnectDelay(attempt) {
  const n = Number.isFinite(attempt) && attempt > 0 ? Math.floor(attempt) : 1;
  const delay = BASE_RECONNECT_DELAY_MS * 2 ** (n - 1);
  return Math.min(MAX_RECONNECT_DELAY_MS, delay);
}

// Whether another reconnect should be scheduled given how many attempts have
// already been made. Keeps the give-up rule in one place alongside the delay.
export function shouldReconnect(attemptsSoFar) {
  const n = Number.isFinite(attemptsSoFar) && attemptsSoFar > 0 ? attemptsSoFar : 0;
  return n < MAX_RECONNECT_ATTEMPTS;
}

export default nextReconnectDelay;
