// Purpose: the two guards of the Firestore auto-save in components/App.jsx.
// 1) Never save before THIS user's document has been loaded: after a sign-out →
//    sign-in in the same tab, a 1 s debounced save of the empty initial state
//    could otherwise overwrite the real lessons before the snapshot arrived.
// 2) Never re-save exactly what was just loaded or saved: every snapshot used
//    to produce a new state object → a new save → a new snapshot (a write loop).
// Upstream: none (pure). Downstream: components/App.jsx.

// Stable (key-sorted) JSON: Firestore returns map fields in its own order, so
// the same content must serialise identically whatever the key order.
function stable(value, seen = new Set()) {
  if (value === null || typeof value !== 'object') return value;
  if (seen.has(value)) throw new TypeError('circular');
  seen.add(value);
  const out = Array.isArray(value)
    ? value.map((v) => stable(v, seen))
    : Object.fromEntries(Object.keys(value).sort().filter((k) => value[k] !== undefined).map((k) => [k, stable(value[k], seen)]));
  seen.delete(value);
  return out;
}

export function serializeForSync(data) {
  try {
    return JSON.stringify(stable(data));
  } catch {
    return null;
  }
}

export function shouldSaveToCloud({ loadedUid, userId, json, lastSyncedJson }) {
  if (!userId || loadedUid !== userId) return false;
  if (json == null) return false;
  return json !== lastSyncedJson;
}
