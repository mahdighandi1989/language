/**
 * Purpose: HTTP + WebSocket entry point for the Lebanese-dialect backend. It
 * wires global configuration: env validation, the baseline security stack
 * (helmet + strict no-wildcard CORS + relaxed CSP + CORS->403 translator),
 * per-IP rate limiting, the /api router, the Gemini Live WebSocket proxy, the
 * Telegram integration and the built frontend SPA. Domain logic lives in
 * ./controllers, ./services, ./routes, ./middleware, ./utils and ./config.
 *
 * The security wiring (helmet(), the strict CORS allow-list and the CORS->403
 * translator) is kept inline here — rather than hidden behind a helper — so the
 * full request-entry security contract is visible in one place at the process
 * entry point. buildAllowedOrigins() from middleware/security.js is reused to
 * build the de-duplicated allow-list.
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
import { decrypt } from './utils/encryption.js';
import { redactSensitiveData as sharedRedact } from './utils/redact.js';
import { buildAllowedOrigins } from './middleware/security.js';
import { firebaseConfig } from './config/bootstrap.js';
import { PORT } from './config/env.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { apiRouter } from './routes/index.js';
import { mountFallbacks } from './controllers/fallbackController.js';
import { attachLiveProxy } from './services/liveProxyService.js';
import { attachLiveWsObserver } from './services/liveWsObserver.js';
import { attachTelegram } from './services/telegram/index.js';

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

// ---------------------------------------------------------------------------
// Baseline security stack (inline so the entry point documents the full
// request-security contract). Order matters: helmet() first so every response
// carries security headers, then the strict CORS allow-list, then the CSP
// override, then the CORS-rejection -> 403 translator.
// ---------------------------------------------------------------------------

// 1. helmet() must be the first middleware: it sets X-Content-Type-Options:
//    nosniff, X-Frame-Options: SAMEORIGIN, Strict-Transport-Security, etc.
app.use(helmet());

// 2. Strict, no-wildcard CORS allow-list. Production origins come from
//    CORS_ORIGIN / FRONTEND_URL (comma-separated); the Vite dev server origin
//    http://localhost:5173 is always permitted. Disallowed origins are rejected
//    and translated to a 403 by the handler below.
const allowedOrigins = buildAllowedOrigins(); // includes FRONTEND_URL + localhost:5173
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

// 4. Translate CORS rejections into a uniform 403 JSON response.
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
