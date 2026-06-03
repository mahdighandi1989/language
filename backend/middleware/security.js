// Security middleware helpers. The full baseline protection contract lives here
// so it is documented in one place and server.js stays pure composition:
//   1. helmet() — security HTTP headers (X-Content-Type-Options: nosniff,
//      X-Frame-Options: SAMEORIGIN, Strict-Transport-Security, ...). Must be the
//      first middleware so every response carries the headers.
//   2. A strict, no-wildcard CORS allow-list. Production origins come from
//      CORS_ORIGIN / FRONTEND_URL (comma-separated); the Vite dev server origin
//      (http://localhost:5173) is always permitted. Same-origin / non-browser
//      requests (no Origin header) are allowed; any other origin is rejected.
//   3. A relaxed Content-Security-Policy that still lets the SPA reach the
//      Gemini and Firebase APIs while keeping helmet's other protections.
//   4. The CORS-rejection -> 403 JSON translator that turns the
//      'Not allowed by CORS' error into a uniform JSON response.
import helmet from 'helmet';
import cors from 'cors';

const DEV_ORIGIN = 'http://localhost:5173';

// Build the de-duplicated CORS allow-list from CORS_ORIGIN / FRONTEND_URL plus
// the always-permitted Vite dev origin. Read at call time so runtime env
// changes are honoured.
export function buildAllowedOrigins() {
  return Array.from(
    new Set(
      `${process.env.CORS_ORIGIN || ''},${process.env.FRONTEND_URL || ''},${DEV_ORIGIN}`
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean)
    )
  );
}

// applySecurity(app) wires the complete baseline security stack. helmet() and
// cors() are added first; the CSP override and the CORS-rejection -> 403
// translator are added after cors() so the translator sits downstream of it.
export function applySecurity(app) {
  // 1. helmet() first, before CORS, so every response carries security headers.
  app.use(helmet());

  // 2. Strict CORS allow-list (no wildcard). Disallowed origins are rejected and
  //    translated to a 403 by the handler below.
  const allowedOrigins = buildAllowedOrigins();
  const corsOptions = {
    origin: (origin, callback) => {
      // Allow same-origin / non-browser requests (no Origin header).
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204,
  };
  app.use(cors(corsOptions));

  // 3. Relax the Content-Security-Policy so the SPA can still reach the Gemini
  //    and Firebase APIs while keeping the rest of helmet's protections.
  app.use((req, res, next) => {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; " +
        "script-src 'self'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: blob:; " +
        "media-src 'self' data: blob:; " +
        "connect-src 'self' https://*.googleapis.com wss://*.googleapis.com " +
        'https://*.firebaseio.com https://*.firebaseapp.com https://firestore.googleapis.com ' +
        'https://identitytoolkit.googleapis.com https://securetoken.googleapis.com;'
    );
    next();
  });

  // 4. Translate CORS rejections into a 403 JSON response.
  app.use((err, req, res, next) => {
    if (err && err.message === 'Not allowed by CORS') {
      return res.status(403).json({ error: 'دسترسی از این دامنه مجاز نیست (CORS)' });
    }
    return next(err);
  });
}

export default applySecurity;
