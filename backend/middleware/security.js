import helmet from 'helmet';
import cors from 'cors';

// Applies the baseline security middleware to the app: security HTTP headers
// (helmet), a relaxed Content-Security-Policy that still lets the SPA reach the
// Gemini and Firebase APIs, and a strict CORS allow-list. Must run before the
// route handlers.
export function applySecurity(app) {
  // Security HTTP headers (X-Content-Type-Options, X-Frame-Options,
  // Strict-Transport-Security, etc.). Must be the first middleware.
  app.use(helmet());

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

  // CORS: allow only explicitly configured origins (no wildcard). Production
  // origins come from CORS_ORIGIN / FRONTEND_URL (comma-separated); the Vite dev
  // server origin is always permitted.
  const DEV_ORIGIN = 'http://localhost:5173';
  const allowedOrigins = Array.from(
    new Set(
      `${process.env.CORS_ORIGIN || ''},${process.env.FRONTEND_URL || ''},${DEV_ORIGIN}`
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean)
    )
  );

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

  // Translate CORS rejections into a 403 JSON response.
  app.use((err, req, res, next) => {
    if (err && err.message === 'Not allowed by CORS') {
      return res.status(403).json({ error: 'دسترسی از این دامنه مجاز نیست (CORS)' });
    }
    return next(err);
  });
}

export default applySecurity;
