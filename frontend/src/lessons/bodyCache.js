// Purpose: a LOCAL copy of lesson bodies in this browser (IndexedDB), so a
// sign-in does not re-download millions of characters: a body is used only if
// its hash equals the one in the main document (stale copies are ignored and
// replaced). Everything is best-effort — private mode / blocked storage just
// means «no cache». Keys are scoped by user id. Downstream: components/App.jsx.

const DB = 'lesson-bodies';
const STORE = 'bodies';

function open(idb = (typeof indexedDB !== 'undefined' ? indexedDB : null)) {
  return new Promise((resolve) => {
    if (!idb) return resolve(null);
    try {
      const req = idb.open(DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export function createBodyCache(uid, idb) {
  const ready = open(idb);
  const id = (key) => `${uid}/${key}`;
  return {
    /** Map key → { text, hash } for the keys whose cached hash matches. */
    async getFresh(refs) {
      const db = await ready;
      const out = new Map();
      if (!db || !refs.length) return out;
      await new Promise((resolve) => {
        try {
          const tx = db.transaction(STORE, 'readonly');
          const st = tx.objectStore(STORE);
          for (const r of refs) {
            const req = st.get(id(r.key));
            req.onsuccess = () => { const v = req.result; if (v && v.hash === r.hash && typeof v.text === 'string') out.set(r.key, v); };
          }
          tx.oncomplete = resolve;
          tx.onerror = resolve;
          tx.onabort = resolve;
        } catch { resolve(); }
      });
      return out;
    },
    async put(key, text, hash) {
      const db = await ready;
      if (!db) return;
      try {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put({ text, hash, at: Date.now() }, id(key));
      } catch { /* quota or blocked: no cache */ }
    },
  };
}
