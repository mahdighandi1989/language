// Purpose: Inspector Bridge error-tracking layer. The Inspector Bridge already
// guards AI-issued DOM commands (see components/InspectorBridge.jsx); this module
// adds the *observability* half: it captures user-facing runtime errors so the
// real error rate is measurable in production instead of silently reading zero.
//
// It tracks three error sources:
//   1. Uncaught runtime errors        -> window.addEventListener('error', ...)
//   2. Unhandled promise rejections   -> window.addEventListener('unhandledrejection', ...)
//   3. Firebase / network failures    -> reportError(err, { source: 'firebase' })
//      called from catch blocks (see hooks/useFirebase.js).
//
// Design note (deliberate, do NOT "fix" by adding an iframe bridge): errors are
// reported to the app's own structured logger (utils/logger.js) as
// `metric_name=error_rate` / `outcome_rate` lines — they are NOT posted to a
// parent window and NOT sent over an external socket. The legacy Inspector
// Bridge tracking script that phoned home to a cross-origin parent was removed
// on purpose (guarded by tests/test_inspector_bridge_no_iframe.py), so the
// "report error events for measurement" requirement is satisfied here by an
// in-app metric sink that any monitoring/log scraper can read.
//
// Upstream (what this depends on): the browser `window` error events, and
// utils/logger.js for metric emission.
// Downstream (what depends on this): src/components/App.jsx installs the tracker
// on mount and calls reportError from Firebase/network catch blocks; the emitted
// `error_rate`/`outcome_rate` metric lines mirror backend/app/monitoring.py.

import { logMetric, METRIC_NAMES, LEVELS } from './utils/logger.js';

// In-memory counters for the current session. `interactions` is the denominator
// for error_rate (errors per tracked interaction); it starts at 1 so a single
// early error does not divide by zero. The counters are exported via
// getErrorStats() so tests and debugging can assert on them.
const stats = {
  total: 0,
  runtime: 0,
  promise: 0,
  firebase: 0,
  interactions: 1,
};

// Return a snapshot of the current error counters.
export function getErrorStats() {
  return { ...stats };
}

// Reset counters (used by tests).
export function resetErrorStats() {
  stats.total = 0;
  stats.runtime = 0;
  stats.promise = 0;
  stats.firebase = 0;
  stats.interactions = 1;
}

// Count a successful user interaction so error_rate is errors-per-interaction
// rather than an unbounded absolute count.
export function trackInteraction() {
  stats.interactions += 1;
}

// The current error rate: total errors / tracked interactions, clamped to [0,1].
export function currentErrorRate() {
  const denom = stats.interactions > 0 ? stats.interactions : 1;
  return Math.min(1, stats.total / denom);
}

// Emit the error_rate and the complementary outcome_rate (= 1 - error_rate, the
// fraction of interactions that did NOT error) so the outcome is observable in
// production logs exactly like backend/app/monitoring.py emits its metrics.
function emitErrorMetrics(level = LEVELS.error) {
  const errorRate = currentErrorRate();
  const outcomeRate = Math.max(0, 1 - errorRate);
  logMetric('error_rate', errorRate.toFixed(4), level);
  logMetric(METRIC_NAMES.outcome_rate, outcomeRate.toFixed(4));
}

// Normalise an arbitrary thrown value into a short, loggable message without
// leaking large payloads or secrets into the console.
function describeError(err) {
  if (err == null) return 'unknown';
  if (typeof err === 'string') return err.slice(0, 200);
  if (err instanceof Error) return `${err.name}: ${err.message}`.slice(0, 200);
  try {
    return String(err.message || err).slice(0, 200);
  } catch {
    return 'unserialisable error';
  }
}

// Central error sink. Every captured error — runtime, promise or firebase —
// funnels through here so counting and metric emission happen in one place.
// `source` is one of 'runtime' | 'promise' | 'firebase' (defaults to 'runtime').
export function reportError(err, { source = 'runtime' } = {}) {
  stats.total += 1;
  if (source === 'promise') stats.promise += 1;
  else if (source === 'firebase') stats.firebase += 1;
  else stats.runtime += 1;

  // eslint-disable-next-line no-console
  console.error(`inspector_bridge error source=${source} detail=${describeError(err)}`);
  emitErrorMetrics();
  return getErrorStats();
}

// Guard so we only attach the global listeners once even if called repeatedly
// (e.g. React StrictMode double-invokes effects in development).
let installed = false;

// Install the global error listeners. Returns an uninstall function that removes
// them (useful for tests and hot-module reloads). Safe to call when `window` is
// undefined (e.g. SSR / unit tests without jsdom): it becomes a no-op.
export function installGlobalErrorTracking(target = (typeof window !== 'undefined' ? window : undefined)) {
  if (!target || typeof target.addEventListener !== 'function') {
    return () => {};
  }
  if (installed) {
    return () => {};
  }
  installed = true;

  const onError = (event) => {
    reportError(event?.error || event?.message || event, { source: 'runtime' });
  };
  const onRejection = (event) => {
    reportError(event?.reason, { source: 'promise' });
  };

  target.addEventListener('error', onError);
  target.addEventListener('unhandledrejection', onRejection);

  return function uninstall() {
    target.removeEventListener('error', onError);
    target.removeEventListener('unhandledrejection', onRejection);
    installed = false;
  };
}

export default installGlobalErrorTracking;
