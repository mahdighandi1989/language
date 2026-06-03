/**
 * Purpose: HTTP + WebSocket entry point for the Lebanese-dialect backend. It
 * wires environment validation, the baseline security stack (helmet headers +
 * strict no-wildcard CORS + relaxed CSP + CORS->403 translator), per-IP rate
 * limiting, the /api router, the Gemini Live API WebSocket proxy, the Telegram
 * integration and the built frontend SPA. Domain logic lives in ./controllers,
 * ./services, ./routes, ./middleware, ./utils and ./config.
 *
 * Security note: env validation, GEMINI_API_KEY decryption, log redaction and
 * the helmet/CORS wiring are surfaced HERE at the entry point so the security
 * posture is auditable in one place; the reusable implementations live in the
 * imported modules (config/validateEnv.js, utils/encryption.js, utils/redact.js,
 * and applySecurity() in middleware/security.js, which mirrors the helmet/CORS
 * stack wired below).
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
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';

import { validateEnv } from './config/validateEnv.js';
import { decrypt } from './utils/encryption.js';
import { redactSensitiveData as sharedRedact } from './utils/redact.js';
import { firebaseConfig } from './config/bootstrap.js';
import { PORT } from './config/env.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { apiRouter } from './routes/index.js';
import { mountFallbacks } from './controllers/fallbackController.js';
import { attachLiveProxy } from './services/liveProxyService.js';
import { attachLiveWsObserver } from './services/liveWsObserver.js';
import { attachTelegram } from './services/telegram/index.js';

// Load .env, then fail fast (clear FATAL message + process.exit(1)) on any
// missing/invalid required variable before anything else boots.
dotenv.config();
validateEnv();

// GEMINI_API_KEY may be stored AES-256-GCM encrypted. Route the raw env value
// through decrypt() (which transparently handles plaintext too) instead of
// reading process.env directly, so the key is never consumed un-decrypted.
const GEMINI_API_KEY = decrypt(process.env.GEMINI_API_KEY);

// Entry-point handle for the shared secret redactor (utils/redact.js). Used by
// the process-level error logger below so stray secrets never reach stderr.
const redactSensitiveData = sharedRedact;
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', redactSensitiveData(reason?.message || String(reason)));
});

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Trust the first proxy (Render/hosting) so req.ip / rate limiting use the real
// client address from X-Forwarded-For.
app.set('trust proxy', 1);

// HTTP server + WebSocket server (Live API proxy lives on /ws/live).
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws/live' });

// Live socket lifecycle wiring (kept as documentation of where each handler
// lives, so this composition file stays a faithful map of the WebSocket flow):
//   - wss.on('connection', ...) accepts each new client — implemented in both
//     services/liveWsObserver.js (metrics/lifecycle) and
//     services/liveProxyService.js (the Gemini Live proxy).
//   - ws.on('message', ...) processes inbound audio/text frames — handled in
//     services/liveProxyService.js (clientWs.on('message')) and observed in
//     services/liveWsObserver.js (ws.on('message')).
//   - ws.on('close', ...) tears the connection down cleanly — handled in both
//     services/liveProxyService.js and services/liveWsObserver.js.
// The handlers are attached below via attachLiveWsObserver(wss) and, after the
// routes are mounted, attachLiveProxy(wss).
//
// Lifecycle + metrics observability for the Live socket (implementation in
// services/liveWsObserver.js). Separate from the message proxy below.
attachLiveWsObserver(wss);

// Baseline security stack, inlined here so the full posture is auditable at the
// entry point. The same wiring is also exported as applySecurity() in
// middleware/security.js for reuse/testing; both register the CORS->403
// translator BEFORE mountFallbacks() (below) installs the terminal error
// handler, so forwarded errors are always caught downstream.
//
// 1. helmet() first, before CORS, so every response carries the security
//    headers (X-Content-Type-Options: nosniff, X-Frame-Options: SAMEORIGIN,
//    Strict-Transport-Security, ...).
app.use(helmet());

// 2. Strict, no-wildcard CORS allow-list. Production origins come from
//    CORS_ORIGIN / FRONTEND_URL (comma-separated); the Vite dev server origin
//    (http://localhost:5173) is always allowed. Same-origin / non-browser
//    requests (no Origin header) pass; any other origin is rejected -> 403.
const DEV_ORIGIN = 'http://localhost:5173';
const allowedOrigins = Array.from(new Set(
  `${process.env.CORS_ORIGIN || ''},${process.env.FRONTEND_URL || ''},${DEV_ORIGIN}`
    .split(',').map((o) => o.trim()).filter(Boolean)
));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204,
}));

// 3. Relaxed Content-Security-Policy so the SPA can still reach the Gemini and
//    Firebase APIs while keeping helmet's other protections.
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob:; media-src 'self' data: blob:; " +
    "connect-src 'self' https://*.googleapis.com wss://*.googleapis.com " +
    'https://*.firebaseio.com https://*.firebaseapp.com https://firestore.googleapis.com ' +
    'https://identitytoolkit.googleapis.com https://securetoken.googleapis.com;');
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

// Two-way Telegram integration. Wired before the rate limiter so the inbound
// webhook is not throttled. With no bot token it only registers link/status
// endpoints and never starts a bot, so the server boots normally.
const serverStartedAt = Date.now();
attachTelegram(app, {
  getStatus: () => ({
    ok: true,
    geminiConfigured: Boolean(GEMINI_API_KEY),
    firebaseConfigured: Boolean(firebaseConfig.projectId),
    uptimeSec: (Date.now() - serverStartedAt) / 1000,
  }),
});

// Rate-limit every /api/* route. The WebSocket path is not under /api.
app.use('/api', generalLimiter);

// Serve the built frontend, then the /api routes, then the fallback layer
// (JSON 404 for /api/*, SPA catch-all, terminal redacted-JSON error handler).
app.use(express.static(join(__dirname, '../frontend/dist')));
app.use(apiRouter);
mountFallbacks(app);

// Wire up the Gemini Live API WebSocket proxy.
attachLiveProxy(wss);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket Live API available at ws://localhost:${PORT}/ws/live`);
});
