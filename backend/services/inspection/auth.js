/**
 * Purpose: who is calling the inspection API.
 *   owner      — a Firebase-signed-in user whose verified e-mail is an admin e-mail
 *   user       — any other Firebase-signed-in user (their sheets wait for the owner)
 *   supervisor — the automated supervisor account: logs in with SUPERVISOR_PASSWORD
 *                (set ONLY as a Render env var, never in the repo) and receives a
 *                short-lived HMAC token «sup.<exp>.<sig>».
 *
 * Admin e-mails: ADMIN_EMAILS (server) ∪ VITE_ADMIN_EMAILS ∪ the owner address that
 * firestore.rules also hard-codes, so the server, the SPA and the rules can never
 * disagree about who the owner is.
 *
 * Upstream: firebase-admin (verifyIdToken, needs FIREBASE_PROJECT_ID), env.
 * Downstream: routes/inspection.js.
 */
import crypto from 'crypto';
import admin from 'firebase-admin';

export const OWNER_EMAIL = 'mohamad.mahdi1988@gmail.com';
export const SUPERVISOR_EMAIL = 'supervisor@inspection.local';
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

export function adminEmails(env = process.env) {
  return Array.from(new Set(
    `${env.ADMIN_EMAILS || ''},${env.VITE_ADMIN_EMAILS || ''},${OWNER_EMAIL}`
      .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean),
  ));
}

function signingKey(env) {
  const pw = env.SUPERVISOR_PASSWORD;
  if (!pw) return null;
  return crypto.createHash('sha256').update(`inspection-supervisor:${pw}`).digest();
}

export function supervisorConfigured(env = process.env) {
  return Boolean(env.SUPERVISOR_PASSWORD && String(env.SUPERVISOR_PASSWORD).length >= 16);
}

/** Constant-time password check; returns a token or null. */
export function supervisorLogin(password, env = process.env, now = Date.now()) {
  if (!supervisorConfigured(env)) return null;
  const a = Buffer.from(String(password || ''));
  const b = Buffer.from(String(env.SUPERVISOR_PASSWORD));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  const exp = now + TOKEN_TTL_MS;
  const sig = crypto.createHmac('sha256', signingKey(env)).update(`sup.${exp}`).digest('hex');
  return { token: `sup.${exp}.${sig}`, expiresAt: new Date(exp).toISOString() };
}

export function verifySupervisorToken(token, env = process.env, now = Date.now()) {
  const key = signingKey(env);
  const m = /^sup\.(\d{1,16})\.([0-9a-f]{64})$/.exec(String(token || ''));
  if (!key || !m) return false;
  if (Number(m[1]) < now) return false;
  const want = crypto.createHmac('sha256', key).update(`sup.${m[1]}`).digest();
  const got = Buffer.from(m[2], 'hex');
  return got.length === want.length && crypto.timingSafeEqual(got, want);
}

let firebaseReady = null;
function ensureFirebase(env) {
  if (firebaseReady !== null) return firebaseReady;
  const projectId = env.FIREBASE_PROJECT_ID;
  if (!projectId) { firebaseReady = false; return false; }
  try {
    if (!admin.apps.some((a) => a?.name === '[DEFAULT]')) admin.initializeApp({ projectId });
    firebaseReady = true;
  } catch {
    firebaseReady = false;
  }
  return firebaseReady;
}

/** Test seam: replace ID-token verification. */
let verifyIdToken = async (token) => admin.auth().verifyIdToken(token);
export function setIdTokenVerifier(fn) { verifyIdToken = fn; firebaseReady = true; }

/**
 * Resolve the actor from the Authorization header. Returns
 * { role, email, uid } or throws { status, message }.
 */
export async function resolveActor(req, env = process.env) {
  const header = String(req.headers.authorization || '');
  const m = /^Bearer\s+(.+)$/i.exec(header);
  if (!m) throw Object.assign(new Error('احراز هویت لازم است'), { status: 401 });
  const token = m[1].trim();
  if (token.startsWith('sup.')) {
    if (!verifySupervisorToken(token, env)) {
      throw Object.assign(new Error('توکنِ ناظر نامعتبر یا منقضی است'), { status: 401 });
    }
    return { role: 'supervisor', email: SUPERVISOR_EMAIL, uid: 'supervisor' };
  }
  if (!ensureFirebase(env)) {
    throw Object.assign(new Error('سرور احرازِ هویت را پیکربندی نکرده است (FIREBASE_PROJECT_ID)'), { status: 503 });
  }
  let decoded;
  try {
    decoded = await verifyIdToken(token);
  } catch {
    throw Object.assign(new Error('توکنِ احرازِ هویت نامعتبر است'), { status: 401 });
  }
  const email = String(decoded.email || '').toLowerCase();
  const verified = decoded.email_verified !== false;
  const isOwner = verified && adminEmails(env).includes(email);
  return { role: isOwner ? 'owner' : 'user', email, uid: decoded.uid };
}
