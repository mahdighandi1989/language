/**
 * Purpose: the OWNER's Google Drive as a second home for lesson originals
 * (the database copy stays the source; Drive is a copy). One-time OAuth with
 * the narrow `drive.file` scope (only files this app creates). The refresh
 * token is stored ENCRYPTED (ENCRYPTION_KEY) in the durable store; nothing
 * secret is ever sent to the browser.
 *
 * Env: GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, ENCRYPTION_KEY,
 * optional DRIVE_REDIRECT_URI (default https://language-k4q9.onrender.com/api/drive/callback).
 * `fetch` and the store are injectable (tests). Upstream: routes/drive.js.
 */
import crypto from 'crypto';
import { encrypt, decrypt } from '../../utils/encryption.js';
import { getInspectionStore } from '../inspection/store.js';

export const SCOPES = ['openid', 'email', 'https://www.googleapis.com/auth/drive.file'];
const TOKEN_BLOB = 'drive-oauth';
const ROOT_NAME = 'زبان';
const LESSONS_NAME = 'درس‌ها';

let fetchImpl = (...a) => fetch(...a);
let storeOverride = null;
export function setDriveFetch(fn) { fetchImpl = fn; }
export function setDriveStore(s) { storeOverride = s; }
const store = async () => storeOverride || getInspectionStore();

export function driveConfig(env = process.env) {
  return {
    clientId: env.GOOGLE_OAUTH_CLIENT_ID || '',
    clientSecret: env.GOOGLE_OAUTH_CLIENT_SECRET || '',
    redirectUri: env.DRIVE_REDIRECT_URI || 'https://language-k4q9.onrender.com/api/drive/callback',
    canEncrypt: /^[0-9a-fA-F]{64}$/.test(env.ENCRYPTION_KEY || ''),
  };
}
export const isConfigured = (env = process.env) => { const c = driveConfig(env); return Boolean(c.clientId && c.clientSecret && c.canEncrypt); };

// ---- state: HMAC-signed, 10 minutes, bound to the owner who started it ----
const stateKey = (env) => crypto.createHash('sha256').update(`drive-state:${env.ENCRYPTION_KEY || ''}:${env.GOOGLE_OAUTH_CLIENT_SECRET || ''}`).digest();
export function makeState(uid, env = process.env, now = Date.now()) {
  const body = Buffer.from(JSON.stringify({ uid, t: now, n: crypto.randomBytes(8).toString('hex') })).toString('base64url');
  const sig = crypto.createHmac('sha256', stateKey(env)).update(body).digest('base64url');
  return `${body}.${sig}`;
}
export function checkState(state, env = process.env, now = Date.now()) {
  const [body, sig] = String(state || '').split('.');
  if (!body || !sig) return null;
  const want = crypto.createHmac('sha256', stateKey(env)).update(body).digest('base64url');
  if (sig.length !== want.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(want))) return null;
  try {
    const v = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    return now - v.t <= 10 * 60 * 1000 && now >= v.t - 60000 ? v : null;
  } catch { return null; }
}

export function authUrl(uid, env = process.env) {
  const c = driveConfig(env);
  const q = new URLSearchParams({
    client_id: c.clientId, redirect_uri: c.redirectUri, response_type: 'code', scope: SCOPES.join(' '),
    access_type: 'offline', prompt: 'consent', include_granted_scopes: 'true', state: makeState(uid, env),
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${q}`;
}

async function tokenRequest(params) {
  const res = await fetchImpl('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(params).toString() });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(`Google: ${body.error_description || body.error || res.status}`), { status: 502 });
  return body;
}

function emailFromIdToken(idToken) {
  try { return JSON.parse(Buffer.from(String(idToken).split('.')[1], 'base64url').toString('utf8')).email || ''; } catch { return ''; }
}

export async function readConnection() {
  const raw = await (await store()).getBlob(TOKEN_BLOB);
  if (!raw) return null;
  try { const v = JSON.parse(raw.toString('utf8')); return v.disconnectedAt ? null : v; } catch { return null; }
}
async function writeConnection(v) { await (await store()).putBlob(TOKEN_BLOB, Buffer.from(JSON.stringify(v), 'utf8')); }

/** OAuth callback: exchange the code, keep the refresh token encrypted. */
export async function finishConnect(code, env = process.env) {
  const c = driveConfig(env);
  const t = await tokenRequest({ code, client_id: c.clientId, client_secret: c.clientSecret, redirect_uri: c.redirectUri, grant_type: 'authorization_code' });
  if (!t.refresh_token) throw Object.assign(new Error('Google refresh token نداد — در myaccount.google.com/permissions دسترسیِ قبلی را بردارید و دوباره وصل کنید'), { status: 502 });
  const v = { refresh: encrypt(t.refresh_token), email: emailFromIdToken(t.id_token), scope: t.scope || '', connectedAt: new Date().toISOString(), folders: {} };
  await writeConnection(v);
  accessCache = { token: t.access_token, until: Date.now() + (Number(t.expires_in || 3600) - 60) * 1000 };
  return { email: v.email };
}

let accessCache = { token: null, until: 0 };
async function accessToken(env = process.env) {
  if (accessCache.token && Date.now() < accessCache.until) return accessCache.token;
  const conn = await readConnection();
  if (!conn) throw Object.assign(new Error('Google Drive وصل نیست'), { status: 409 });
  const c = driveConfig(env);
  const t = await tokenRequest({ refresh_token: decrypt(conn.refresh), client_id: c.clientId, client_secret: c.clientSecret, grant_type: 'refresh_token' });
  accessCache = { token: t.access_token, until: Date.now() + (Number(t.expires_in || 3600) - 60) * 1000 };
  return accessCache.token;
}

async function api(path, { method = 'GET', body, headers = {}, raw = false, base = 'https://www.googleapis.com' } = {}, env = process.env) {
  const token = await accessToken(env);
  const res = await fetchImpl(`${base}${path}`, { method, headers: { Authorization: `Bearer ${token}`, ...headers }, body });
  if (raw) return res;
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(`Drive: ${out.error?.message || res.status}`), { status: 502 });
  return out;
}

const q = (s) => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
async function ensureFolder(name, parent, env) {
  const parentQ = parent ? ` and '${q(parent)}' in parents` : " and 'root' in parents";
  const found = await api(`/drive/v3/files?q=${encodeURIComponent(`name='${q(name)}' and mimeType='application/vnd.google-apps.folder' and trashed=false${parentQ}`)}&fields=files(id)`, {}, env);
  if (found.files?.[0]?.id) return found.files[0].id;
  const made = await api('/drive/v3/files?fields=id', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, mimeType: 'application/vnd.google-apps.folder', ...(parent ? { parents: [parent] } : {}) }) }, env);
  return made.id;
}

export const safeFolderName = (s) => String(s || '').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '_').trim().slice(0, 100) || 'درس';

/** زبان/درس‌ها/<lesson title>/ — folder ids cached in the connection record. */
export async function lessonFolder(lessonId, lessonTitle, env = process.env) {
  const conn = await readConnection();
  if (!conn) throw Object.assign(new Error('Google Drive وصل نیست'), { status: 409 });
  conn.folders = conn.folders || {};
  if (conn.folders[`lesson:${lessonId}`]) return conn.folders[`lesson:${lessonId}`];
  conn.folders.root = conn.folders.root || await ensureFolder(ROOT_NAME, null, env);
  conn.folders.lessons = conn.folders.lessons || await ensureFolder(LESSONS_NAME, conn.folders.root, env);
  const id = await ensureFolder(safeFolderName(lessonTitle || `درس ${lessonId}`), conn.folders.lessons, env);
  conn.folders[`lesson:${lessonId}`] = id;
  await writeConnection(conn);
  return id;
}

/** Upload one file (resumable, any size up to the 25MB upload limit). */
export async function uploadFile({ buffer, name, mime, folderId }, env = process.env) {
  const start = await api('/upload/drive/v3/files?uploadType=resumable&fields=id,webViewLink', {
    method: 'POST', raw: true,
    headers: { 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': mime || 'application/octet-stream', 'X-Upload-Content-Length': String(buffer.length) },
    body: JSON.stringify({ name, parents: [folderId] }),
  }, env);
  const location = start.headers.get('location');
  if (!start.ok || !location) throw Object.assign(new Error(`Drive: شروعِ آپلود ناموفق (${start.status})`), { status: 502 });
  const res = await fetchImpl(location, { method: 'PUT', headers: { 'Content-Type': mime || 'application/octet-stream', 'Content-Length': String(buffer.length) }, body: buffer });
  const out = await res.json().catch(() => ({}));
  if (!res.ok || !out.id) throw Object.assign(new Error(`Drive: آپلود ناموفق (${res.status})`), { status: 502 });
  return { id: out.id, link: out.webViewLink || `https://drive.google.com/file/d/${out.id}/view` };
}

export async function disconnect() {
  const conn = await readConnection();
  if (!conn) return false;
  try { await fetchImpl(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(decrypt(conn.refresh))}`, { method: 'POST' }); } catch { /* still mark disconnected */ }
  await writeConnection({ disconnectedAt: new Date().toISOString(), email: conn.email });
  accessCache = { token: null, until: 0 };
  return true;
}

export async function status(env = process.env) {
  const conn = isConfigured(env) ? await readConnection() : null;
  const c = driveConfig(env);
  return {
    configured: isConfigured(env),
    missing: [!c.clientId && 'GOOGLE_OAUTH_CLIENT_ID', !c.clientSecret && 'GOOGLE_OAUTH_CLIENT_SECRET', !c.canEncrypt && 'ENCRYPTION_KEY'].filter(Boolean),
    connected: Boolean(conn), email: conn?.email || '', connectedAt: conn?.connectedAt || null, redirectUri: c.redirectUri,
  };
}
