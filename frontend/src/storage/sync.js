// Purpose: the two guards of the Firestore auto-save in components/App.jsx.
// 1) Never save before THIS user's document has been loaded: after a sign-out →
//    sign-in in the same tab, a 1 s debounced save of the empty initial state
//    could otherwise overwrite the real lessons before the snapshot arrived.
// 2) Never re-save exactly what was just loaded or saved: every snapshot used
//    to produce a new state object → a new save → a new snapshot (a write loop).
// Upstream: none (pure). Downstream: components/App.jsx.

export function serializeForSync(data) {
  try {
    return JSON.stringify(data);
  } catch {
    return null;
  }
}

export function shouldSaveToCloud({ loadedUid, userId, json, lastSyncedJson }) {
  if (!userId || loadedUid !== userId) return false;
  if (json == null) return false;
  return json !== lastSyncedJson;
}
