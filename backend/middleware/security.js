// Security middleware helpers. server.js wires the first two layers of the
// baseline protection stack directly (helmet() headers + the strict no-wildcard
// CORS allow-list), so this module owns the two remaining, error-handling-shaped
// concerns and keeps them documented in one place:
//   3. A relaxed Content-Security-Policy that still lets the SPA reach the
//      Gemini and Firebase APIs while keeping helmet's other protections.
//   4. The CORS-rejection -> 403 JSON translator that turns the
//      'Not allowed by CORS' error (thrown by the CORS layer in server.js) into
//      a uniform JSON response.
//
// buildAllowedOrigins() is exported as the shared, single source of truth for
// the CORS allow-list logic (CORS_ORIGIN / FRONTEND_URL + the always-permitted
// Vite dev origin) so it can be reused/tested independently of server.js.

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

// applySecurity(app) completes the baseline security stack started in server.js
// (helmet() + the strict no-wildcard CORS allow-list). It is registered right
// after the CORS layer so its 403 translator sits downstream of it and catches
// the 'Not allowed by CORS' error.
export function applySecurity(app) {
  // 3. Relax the Content-Security-Policy so the SPA can still reach the Gemini
  //    and Firebase APIs while keeping the rest of helmet's protections.
  app.use((req, res, next) => {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; " +
        "script-src 'self' https://apis.google.com; " +
        "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://apis.google.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' data: https://fonts.gstatic.com; " +
        "img-src 'self' data: blob: https://*.googleusercontent.com; " +
        "media-src 'self' data: blob:; " +
        "connect-src 'self' https://*.googleapis.com wss://*.googleapis.com " +
        'https://*.firebaseio.com https://*.firebaseapp.com https://firestore.googleapis.com ' +
        'https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://accounts.google.com;'
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
