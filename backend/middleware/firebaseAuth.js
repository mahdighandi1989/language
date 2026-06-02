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

export default { requireAuth, optionalAuth };
