// Security middleware helpers. The baseline protections — helmet() (security
// HTTP headers) and the strict, no-wildcard CORS allow-list — are wired at the
// entry point in server.js so the security contract is visible there. This
// module supplies the two pieces that stay decoupled from that wiring:
//   1. A relaxed Content-Security-Policy that still lets the SPA reach the
//      Gemini and Firebase APIs while keeping helmet's other protections.
//   2. The CORS-rejection -> 403 JSON translator that turns the
//      'Not allowed by CORS' error (thrown by the cors() origin callback in
//      server.js) into a uniform JSON response.
// applySecurity(app) must run after app.use(cors(...)) so the translator sits
// downstream of the CORS middleware.
export function applySecurity(app) {
  // Relax the Content-Security-Policy so the SPA can still reach the Gemini and
  // Firebase APIs while keeping the rest of helmet's protections.
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

  // Translate CORS rejections into a 403 JSON response.
  app.use((err, req, res, next) => {
    if (err && err.message === 'Not allowed by CORS') {
      return res.status(403).json({ error: 'دسترسی از این دامنه مجاز نیست (CORS)' });
    }
    return next(err);
  });
}

export default applySecurity;
