import admin from 'firebase-admin';

// Firebase ID token verification for protected backend endpoints.
//
// The Firebase Admin SDK is initialized lazily using FIREBASE_PROJECT_ID from
// the environment. verifyIdToken() validates a token's signature against
// Google's public keys, so no service-account private key is required for
// verification alone.

let initAttempted = false;
let adminReady = false;

function ensureAdmin() {
  if (initAttempted) return adminReady;
  initAttempted = true;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    adminReady = false;
    return false;
  }

  try {
    if (!admin.apps.length) {
      admin.initializeApp({ projectId });
    }
    adminReady = true;
  } catch {
    adminReady = false;
  }
  return adminReady;
}

function extractToken(req) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

// Hard auth guard: a valid Firebase ID token is required, otherwise 401.
export async function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'احراز هویت لازم است' });
  }

  if (!ensureAdmin()) {
    return res.status(401).json({ error: 'سرویس احراز هویت پیکربندی نشده است' });
  }

  try {
    req.user = await admin.auth().verifyIdToken(token);
    next();
  } catch {
    return res.status(401).json({ error: 'توکن احراز هویت نامعتبر است' });
  }
}

// Soft auth guard: when an Authorization token is present it is verified (and
// rejected with 401 if invalid); when absent the request is allowed through.
// This keeps public-but-authenticatable endpoints working for unauthenticated
// clients while still verifying tokens that are supplied.
export async function optionalAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return next();
  }

  if (!ensureAdmin()) {
    // Cannot verify the supplied token; ignore it rather than blocking.
    return next();
  }

  try {
    req.user = await admin.auth().verifyIdToken(token);
  } catch {
    return res.status(401).json({ error: 'توکن احراز هویت نامعتبر است' });
  }
  next();
}

// Guard for endpoints that spend the Gemini key, CPU or disk: once server-side
// auth is configured (FIREBASE_PROJECT_ID), a valid Firebase ID token is
// REQUIRED; until then the request passes and a one-time warning is logged (so
// a missing env var never locks the owner out, but is visible in the logs).
let warnedOpen = false;
export async function requireAuthIfConfigured(req, res, next) {
  if (!process.env.FIREBASE_PROJECT_ID) {
    if (!warnedOpen) {
      warnedOpen = true;
      console.warn('SECURITY: FIREBASE_PROJECT_ID is not set — Gemini/upload endpoints and /ws/live are open to anonymous callers.');
    }
    return next();
  }
  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: 'احراز هویت لازم است' });
  if (!ensureAdmin()) return res.status(401).json({ error: 'سرویس احراز هویت پیکربندی نشده است' });
  try {
    req.user = await tokenVerifier(token);
  } catch {
    return res.status(401).json({ error: 'توکن احراز هویت نامعتبر است' });
  }
  const verdict = await approvalOf(req.user);
  if (verdict === 'error') return res.status(503).json({ error: 'بررسیِ دسترسی ممکن نشد؛ کمی بعد دوباره تلاش کنید' });
  if (verdict !== 'approved') return res.status(403).json({ error: 'دسترسیِ شما هنوز توسطِ مدیر تأیید نشده است' });
  return next();
}

// --- server-side approval (the same accessControl record the SPA and
// firestore.rules use). Needs FIREBASE_SERVICE_ACCOUNT; without it the check
// cannot be made and only a valid sign-in is required (previous behaviour). ---
let tokenVerifier = (token) => admin.auth().verifyIdToken(token);
let approvalLookup = null; // (uid) => Promise<record|null>; null = not available
let approvalInit = false;
const approvalCache = new Map(); // uid -> { verdict, at }
const APPROVAL_TTL_MS = 60 * 1000;

/** Test seams. */
export function setTokenVerifier(fn) { tokenVerifier = fn; initAttempted = true; adminReady = true; }
export function setApprovalLookup(fn) { approvalLookup = fn; approvalInit = true; approvalCache.clear(); }

async function initApprovalLookup() {
  if (approvalInit) return approvalLookup;
  approvalInit = true;
  const { parseServiceAccount } = await import('../services/inspection/store.js');
  const account = parseServiceAccount(process.env.FIREBASE_SERVICE_ACCOUNT);
  if (!account) return null;
  try {
    const app = admin.apps.find((a) => a?.name === 'inspection')
      || admin.initializeApp({ credential: admin.credential.cert(account), projectId: account.project_id }, 'inspection');
    const { getFirestore } = await import('firebase-admin/firestore');
    const db = getFirestore(app);
    const appId = process.env.VITE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || account.project_id;
    approvalLookup = async (uid) => {
      const snap = await db.doc(`artifacts/${appId}/accessControl/${uid}`).get();
      return snap.exists ? snap.data() : null;
    };
  } catch (e) {
    console.error('approval check unavailable:', e.message);
    approvalLookup = null;
  }
  return approvalLookup;
}

/** 'approved' | 'denied' | 'error' for a verified token. Admin e-mails always pass. */
export async function approvalOf(decoded) {
  const { adminEmails } = await import('../services/inspection/auth.js');
  const email = String(decoded?.email || '').toLowerCase();
  if (email && decoded.email_verified !== false && adminEmails().includes(email)) return 'approved';
  const lookup = await initApprovalLookup();
  if (!lookup) return 'approved';
  const hit = approvalCache.get(decoded.uid);
  if (hit && Date.now() - hit.at < APPROVAL_TTL_MS) return hit.verdict;
  let verdict;
  try {
    const rec = await lookup(decoded.uid);
    verdict = rec && (rec.role === 'admin' || rec.status === 'approved') ? 'approved' : 'denied';
  } catch (e) {
    console.error('approval check failed:', e.message);
    return 'error';
  }
  approvalCache.set(decoded.uid, { verdict, at: Date.now() });
  return verdict;
}

// WebSocket upgrade check for /ws/live (ws `verifyClient`, async form). The
// browser cannot set headers on a WebSocket, so the ID token travels as the
// `token` query parameter. Same policy as requireAuthIfConfigured.
export function verifyWsClient(info, done) {
  if (!process.env.FIREBASE_PROJECT_ID) return done(true);
  let token = null;
  try {
    token = new URL(info.req.url, 'http://x').searchParams.get('token');
  } catch {
    token = null;
  }
  if (!token || !ensureAdmin()) return done(false, 401, 'Unauthorized');
  Promise.resolve()
    .then(() => tokenVerifier(token))
    .then(async (decoded) => {
      const verdict = await approvalOf(decoded);
      if (verdict === 'approved') return done(true);
      return done(false, verdict === 'error' ? 503 : 403, verdict === 'error' ? 'Unavailable' : 'Forbidden');
    }, () => done(false, 401, 'Unauthorized'));
}

export default { requireAuth, optionalAuth, requireAuthIfConfigured, verifyWsClient };
