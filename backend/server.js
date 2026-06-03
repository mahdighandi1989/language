/**
 * Purpose: HTTP + WebSocket entry point for the Lebanese-dialect backend. This
 * file is pure composition — it registers no handler body of its own. It wires
 * only global configuration: env validation, the baseline security stack
 * (helmet + strict no-wildcard CORS + relaxed CSP + CORS->403 translator, wired
 * inline below and mirrored as applySecurity() in middleware/security.js for
 * reuse/tests), per-IP rate limiting, the
 * /api router, the Gemini Live WebSocket proxy, the Telegram integration and the
 * built frontend SPA. Domain logic lives in ./controllers, ./services, ./routes,
 * ./middleware, ./utils and ./config.
 *
 * Upstream (inputs): process.env (GEMINI_API_KEY, ENCRYPTION_KEY, PORT,
 * CORS_ORIGIN, FRONTEND_URL, FIREBASE_*); the compiled frontend in
 * ../frontend/dist; the Google Gemini API (REST + Live API).
 * Downstream (outputs): the SPA and JSON /api/* endpoints consumed by
 * frontend/src/App.jsx, plus the /ws/live socket for real-time voice.
 */
import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import { validateEnv } from './config/validateEnv.js';
import { firebaseConfig } from './config/bootstrap.js';
import { PORT } from './config/env.js';
// Layer barrels — each folder exposes its public API through an index.js, so the
// composition root pulls in whole layers rather than reaching into single files:
//   import { … } from './controllers'   → HTTP request/response handlers
//   import { … } from './services'      → domain logic (Gemini, audio, telegram)
//   import { … } from './routes'        → the aggregated /api router table
//   import { … } from './middleware'    → security, rate-limit, auth, upload, validate
//   import { … } from './utils'         → pure helpers (encryption, redact, chunking)
import { decrypt, redactSensitiveData as sharedRedact } from './utils/index.js';
// applySecurity is the reusable mirror of the inline security stack below
// (kept in middleware/security.js for reuse/tests); generalLimiter is the
// per-IP /api/* rate limiter.
import { generalLimiter } from './middleware/index.js';
import { apiRouter } from './routes/index.js';
import { mountFallbacks } from './controllers/index.js';
import { attachLiveProxy, attachLiveWsObserver, attachTelegram } from './services/index.js';

// Load .env, then fail fast on any missing/invalid required variable.
dotenv.config();
validateEnv();
// GEMINI_API_KEY may be AES-256-GCM encrypted; decrypt() handles plaintext too.
const GEMINI_API_KEY = decrypt(process.env.GEMINI_API_KEY);
// Redact stray secrets before they reach stderr. redactSensitiveData() replaces
// any occurrence of the real API key with [REDACTED]; it is the single safe sink
// for anything that might embed a secret (never log process.env or the raw key).
const redactSensitiveData = sharedRedact;
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', redactSensitiveData(reason?.message || String(reason)));
});

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
// Trust the first proxy so req.ip / rate limiting use the real client address.
app.set('trust proxy', 1);
// HTTP + WebSocket server (Live API proxy lives on /ws/live).
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws/live' });
attachLiveWsObserver(wss); // Live-socket lifecycle + metrics (proxy attached later).

// Baseline security stack, wired directly here as the first middlewares so the
// whole security posture is auditable at the entry point (registered before
// mountFallbacks() so forwarded errors reach the terminal handler). The same
// stack is kept as the reusable applySecurity(app) helper in
// middleware/security.js — a mirror of this wiring, for reuse/tests.
//   1. helmet() first so every response carries the security headers
//      (X-Content-Type-Options: nosniff, X-Frame-Options: SAMEORIGIN,
//      Strict-Transport-Security, ...).
app.use(helmet());
//   2. Strict, no-wildcard CORS allow-list. Production origins come from
//      CORS_ORIGIN / FRONTEND_URL (comma-separated); the Vite dev origin
//      (http://localhost:5173) is always permitted. Same-origin / non-browser
//      requests (no Origin header) are allowed; any other origin is rejected.
const allowedOrigins = Array.from(
  new Set(
    `${process.env.CORS_ORIGIN || ''},${process.env.FRONTEND_URL || ''},http://localhost:5173`
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean)
  )
);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);
//   3. Relaxed Content-Security-Policy so the SPA can still reach the Gemini
//      and Firebase APIs while keeping helmet's other protections.
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
//   4. Translate CORS rejections into a uniform 403 JSON response.
app.use((err, req, res, next) => {
  if (err && err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'دسترسی از این دامنه مجاز نیست (CORS)' });
  }
  return next(err);
});
app.use(express.json({ limit: '10mb' }));

// Telegram integration before the rate limiter (no bot token => link/status only).
const serverStartedAt = Date.now();
attachTelegram(app, {
  getStatus: () => ({
    ok: true,
    geminiConfigured: Boolean(GEMINI_API_KEY),
    firebaseConfigured: Boolean(firebaseConfig.projectId),
    uptimeSec: (Date.now() - serverStartedAt) / 1000,
  }),
});

app.use('/api', generalLimiter); // Rate-limit /api/* (the WebSocket path is not under /api).
// Serve the SPA, then /api routes, then the fallback layer (404/SPA/errors).
app.use(express.static(join(__dirname, '../frontend/dist')));
app.use(apiRouter);
mountFallbacks(app);
attachLiveProxy(wss); // Gemini Live API WebSocket proxy.

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket Live API available at ws://localhost:${PORT}/ws/live`);
});
