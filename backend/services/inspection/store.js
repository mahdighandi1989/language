/**
 * Purpose: persistence for «نظارت و سرکشی». Two interchangeable stores with the
 * SAME interface and NO delete operation (sheets and files are never deleted):
 *
 *   FirestoreStore — durable. Used when FIREBASE_SERVICE_ACCOUNT (the JSON of a
 *     Firebase service account, raw or base64) is set on the server. Writes under
 *     artifacts/{appId}/inspection* with the Admin SDK (rules do not apply to it;
 *     firestore.rules keeps browsers out of these collections). Binary blobs are
 *     chunked (700 KB per document) because a Firestore document is capped at 1 MiB.
 *   FileStore — a JSON file + blob folder. Used in development/tests and as the
 *     fallback. On Render the container disk is wiped on every deploy, so this
 *     store reports durable:false and the UI shows that loudly — never silent.
 *
 * Upstream: firebase-admin, env (FIREBASE_SERVICE_ACCOUNT, FIREBASE_PROJECT_ID,
 * INSPECTION_DATA_DIR). Downstream: routes/inspection.js.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOB_CHUNK = 700 * 1024;

function safeKey(key) {
  return String(key).replace(/[^A-Za-z0-9_.-]/g, '_').slice(0, 200);
}

// Serialise async critical sections (read-modify-write) inside one process.
function createMutex() {
  let tail = Promise.resolve();
  return (fn) => {
    const run = tail.then(fn, fn);
    tail = run.catch(() => {});
    return run;
  };
}

export class FileStore {
  constructor({ dir, durable = false, note = '' } = {}) {
    this.dir = dir;
    this.file = path.join(dir, 'inspection-state.json');
    this.blobDir = path.join(dir, 'blobs');
    this.durableFlag = durable;
    this.noteText = note;
    this.lock = createMutex();
    fs.mkdirSync(this.blobDir, { recursive: true });
    this.state = this._load();
  }

  describe() {
    return { kind: 'file', durable: this.durableFlag, note: this.noteText };
  }

  _load() {
    try {
      if (fs.existsSync(this.file)) {
        const parsed = JSON.parse(fs.readFileSync(this.file, 'utf8'));
        return { seq: 0, fileSeq: 0, sheets: {}, files: {}, binders: [], ...parsed };
      }
    } catch (e) {
      // A corrupt state file is preserved (renamed), never overwritten blindly.
      try { fs.renameSync(this.file, `${this.file}.corrupt-${Date.now()}`); } catch { /* ignore */ }
      console.error('inspection store: state file unreadable, kept a copy:', e.message);
    }
    return { seq: 0, fileSeq: 0, sheets: {}, files: {}, binders: [] };
  }

  _save() {
    const tmp = `${this.file}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(this.state));
    fs.renameSync(tmp, this.file);
  }

  async createSheet(build) {
    return this.lock(async () => {
      this.state.seq += 1;
      const sheet = build(this.state.seq);
      this.state.sheets[sheet.id] = sheet;
      this._save();
      return structuredClone(sheet);
    });
  }

  async listSheets() {
    return Object.values(this.state.sheets).map((s) => structuredClone(s)).sort((a, b) => a.number - b.number);
  }

  async getSheet(id) {
    const s = this.state.sheets[id];
    return s ? structuredClone(s) : null;
  }

  async updateSheet(id, mutate) {
    return this.lock(async () => {
      const current = this.state.sheets[id];
      if (!current) return null;
      const copy = structuredClone(current);
      const result = await mutate(copy);
      this.state.sheets[id] = copy;
      this._save();
      return result === undefined ? structuredClone(copy) : result;
    });
  }

  /** Run a mutation over ALL sheets + binders atomically (urgent claim, filing). */
  async updateAll(mutate) {
    return this.lock(async () => {
      const sheets = Object.values(this.state.sheets).map((s) => structuredClone(s));
      const binders = structuredClone(this.state.binders || []);
      const { result, changed } = await mutate(sheets, binders);
      for (const s of changed || []) this.state.sheets[s.id] = s;
      this.state.binders = binders;
      this._save();
      return result;
    });
  }

  async listBinders() {
    return structuredClone(this.state.binders || []);
  }

  async createFile(build) {
    return this.lock(async () => {
      this.state.fileSeq += 1;
      const meta = build(this.state.fileSeq);
      this.state.files[meta.id] = meta;
      this._save();
      return structuredClone(meta);
    });
  }

  async listFiles(sheetId) {
    return Object.values(this.state.files).filter((f) => f.sheetId === sheetId).map((f) => structuredClone(f))
      .sort((a, b) => a.number - b.number);
  }

  async getFile(id) {
    const f = this.state.files[id];
    return f ? structuredClone(f) : null;
  }

  async updateFile(id, mutate) {
    return this.lock(async () => {
      const current = this.state.files[id];
      if (!current) return null;
      const copy = structuredClone(current);
      await mutate(copy);
      this.state.files[id] = copy;
      this._save();
      return structuredClone(copy);
    });
  }

  async putBlob(key, buffer) {
    fs.writeFileSync(path.join(this.blobDir, safeKey(key)), buffer);
  }

  async getBlob(key) {
    const p = path.join(this.blobDir, safeKey(key));
    return fs.existsSync(p) ? fs.readFileSync(p) : null;
  }
}

export class FirestoreStore {
  constructor({ db, appId, FieldValue }) {
    this.db = db;
    this.base = db.collection('artifacts').doc(appId);
    this.sheets = this.base.collection('inspectionSheets');
    this.files = this.base.collection('inspectionFiles');
    this.blobs = this.base.collection('inspectionBlobs');
    this.meta = this.base.collection('inspectionMeta').doc('state');
    this.FieldValue = FieldValue;
  }

  describe() {
    return { kind: 'firestore', durable: true, note: 'Firestore (حسابِ سرویس) — ماندگار' };
  }

  async createSheet(build) {
    return this.db.runTransaction(async (tx) => {
      const meta = await tx.get(this.meta);
      const seq = (meta.exists ? meta.data().seq || 0 : 0) + 1;
      const sheet = build(seq);
      tx.set(this.meta, { seq }, { merge: true });
      tx.set(this.sheets.doc(sheet.id), sheet);
      return sheet;
    });
  }

  async listSheets() {
    const snap = await this.sheets.get();
    return snap.docs.map((d) => d.data()).sort((a, b) => a.number - b.number);
  }

  async getSheet(id) {
    const d = await this.sheets.doc(String(id)).get();
    return d.exists ? d.data() : null;
  }

  async updateSheet(id, mutate) {
    const ref = this.sheets.doc(String(id));
    return this.db.runTransaction(async (tx) => {
      const d = await tx.get(ref);
      if (!d.exists) return null;
      const copy = d.data();
      const result = await mutate(copy);
      tx.set(ref, copy);
      return result === undefined ? copy : result;
    });
  }

  async updateAll(mutate) {
    return this.db.runTransaction(async (tx) => {
      const snap = await tx.get(this.sheets);
      const meta = await tx.get(this.meta);
      const sheets = snap.docs.map((d) => d.data());
      const binders = meta.exists ? meta.data().binders || [] : [];
      const { result, changed } = await mutate(sheets, binders);
      for (const s of changed || []) tx.set(this.sheets.doc(s.id), s);
      tx.set(this.meta, { binders }, { merge: true });
      return result;
    });
  }

  async listBinders() {
    const meta = await this.meta.get();
    return meta.exists ? meta.data().binders || [] : [];
  }

  async createFile(build) {
    return this.db.runTransaction(async (tx) => {
      const meta = await tx.get(this.meta);
      const fileSeq = (meta.exists ? meta.data().fileSeq || 0 : 0) + 1;
      const file = build(fileSeq);
      tx.set(this.meta, { fileSeq }, { merge: true });
      tx.set(this.files.doc(file.id), file);
      return file;
    });
  }

  async listFiles(sheetId) {
    const snap = await this.files.where('sheetId', '==', sheetId).get();
    return snap.docs.map((d) => d.data()).sort((a, b) => a.number - b.number);
  }

  async getFile(id) {
    const d = await this.files.doc(String(id)).get();
    return d.exists ? d.data() : null;
  }

  async updateFile(id, mutate) {
    const ref = this.files.doc(String(id));
    return this.db.runTransaction(async (tx) => {
      const d = await tx.get(ref);
      if (!d.exists) return null;
      const copy = d.data();
      await mutate(copy);
      tx.set(ref, copy);
      return copy;
    });
  }

  async putBlob(key, buffer) {
    const ref = this.blobs.doc(safeKey(key));
    const count = Math.max(1, Math.ceil(buffer.length / BLOB_CHUNK));
    for (let i = 0; i < count; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await ref.collection('chunks').doc(String(i).padStart(5, '0'))
        .set({ seq: i, data: buffer.subarray(i * BLOB_CHUNK, (i + 1) * BLOB_CHUNK) });
    }
    await ref.set({ size: buffer.length, chunks: count, createdAt: new Date().toISOString() });
  }

  async getBlob(key) {
    const ref = this.blobs.doc(safeKey(key));
    const head = await ref.get();
    if (!head.exists) return null;
    const snap = await ref.collection('chunks').orderBy('seq').get();
    return Buffer.concat(snap.docs.map((d) => Buffer.from(d.data().data)));
  }
}

/** Parse FIREBASE_SERVICE_ACCOUNT (raw JSON or base64 JSON). Never logs it. */
export function parseServiceAccount(raw) {
  if (!raw || !String(raw).trim()) return null;
  const text = String(raw).trim();
  const candidates = [text];
  try { candidates.push(Buffer.from(text, 'base64').toString('utf8')); } catch { /* ignore */ }
  for (const c of candidates) {
    try {
      const obj = JSON.parse(c);
      if (obj && obj.client_email && obj.private_key) return obj;
    } catch { /* try next */ }
  }
  return null;
}

let singleton = null;

/** Pick the store from the environment (once per process). */
export async function getInspectionStore(env = process.env) {
  if (singleton) return singleton;
  const account = parseServiceAccount(env.FIREBASE_SERVICE_ACCOUNT);
  if (account) {
    try {
      const admin = (await import('firebase-admin')).default;
      const app = admin.apps.find((a) => a?.name === 'inspection')
        || admin.initializeApp({ credential: admin.credential.cert(account), projectId: account.project_id }, 'inspection');
      const { getFirestore, FieldValue } = await import('firebase-admin/firestore');
      const appId = env.INSPECTION_APP_ID || env.VITE_PROJECT_ID || env.FIREBASE_PROJECT_ID || account.project_id;
      singleton = new FirestoreStore({ db: getFirestore(app), appId, FieldValue });
      return singleton;
    } catch (e) {
      console.error('inspection store: Firestore init failed, falling back to the file store:', e.message);
    }
  }
  const dir = env.INSPECTION_DATA_DIR || path.join(__dirname, '../../data/inspection');
  const onRender = Boolean(env.RENDER);
  singleton = new FileStore({
    dir,
    // INSPECTION_DATA_DIR is set only for a persistent disk (e.g. a Render disk mount).
    durable: Boolean(env.INSPECTION_DATA_DIR),
    note: env.INSPECTION_DATA_DIR
      ? `ذخیرهٔ فایلی روی دیسکِ ماندگار (${env.INSPECTION_DATA_DIR})`
      : env.FIREBASE_SERVICE_ACCOUNT
        ? 'FIREBASE_SERVICE_ACCOUNT خوانا نیست یا Firestore وصل نشد — ذخیره موقت است (لاگِ سرور را ببینید)'
      : onRender
        ? 'ذخیره موقت: دیسکِ Render با هر دیپلوی پاک می‌شود. برای ماندگاری FIREBASE_SERVICE_ACCOUNT را روی Render بگذارید.'
        : 'ذخیرهٔ فایلیِ محلی (توسعه)',
  });
  return singleton;
}

/** Tests: replace the process-wide store. */
export function setInspectionStore(store) {
  singleton = store;
}
