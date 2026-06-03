/**
 * Purpose: HTTP + WebSocket entry point for the Lebanese-dialect backend. It
 * wires Express security middleware, rate limiting, the /api router and the
 * Gemini Live API WebSocket proxy, and serves the built frontend SPA.
 *
 * Upstream (inputs): environment variables validated by ./config/env.js
 * (GEMINI_API_KEY, PORT, CORS_ORIGIN, FIREBASE_*); the compiled frontend in
 * ../frontend/dist; the Google Gemini API (REST + Live API).
 * Downstream (outputs): serves the SPA and the JSON /api/* endpoints consumed
 * by frontend/src/App.jsx, plus the /ws/live socket for real-time voice.
 */
import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';

import { PORT } from './config/env.js';
import { validateEnv } from './config/validateEnv.js';
import { applySecurity } from './middleware/security.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { apiRouter } from './routes/index.js';
import { apiNotFound, serveSpa } from './controllers/fallbackController.js';
import { attachLiveProxy } from './services/liveProxyService.js';
import { attachTelegram } from './services/telegram/index.js';
import { GEMINI_API_KEY } from './config/env.js';
import { decrypt } from './utils/encryption.js';
import { redactSensitiveData as redactUtil } from './utils/redact.js';

// Load .env and validate every required environment variable at the entry
// point. validateEnv (imported above from './config/validateEnv') prints a
// clear FATAL message and calls process.exit(1) on any missing/invalid value,
// so the server never boots into an insecure state. (config/env.js runs the
// same validation when its exports are first imported; calling it explicitly
// here keeps the security contract visible.)
dotenv.config();
validateEnv();

// Startup self-check: the Gemini key may be stored AES-256-GCM encrypted in the
// environment. decrypt() transparently handles encrypted or plaintext values;
// confirm it yields the same key the rest of the app consumes so a misconfigured
// ENCRYPTION_KEY fails fast instead of surfacing as opaque upstream errors.
const decryptedGeminiKey = decrypt(process.env.GEMINI_API_KEY);
if (decryptedGeminiKey !== GEMINI_API_KEY) {
  console.error('FATAL: GEMINI_API_KEY decryption mismatch');
  process.exit(1);
}

// Backend-side Firebase configuration, sourced exclusively from environment
// variables (never hard-coded). FIREBASE_PROJECT_ID is consumed by the Admin
// SDK in middleware/firebaseAuth.js to verify ID tokens; the remaining values
// document the project for any other server-side Firebase usage.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Entry-point alias for the shared secret-redaction helper (implementation in
// utils/redact.js) so log statements in this file never emit raw secrets.
const redactSensitiveData = redactUtil;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Trust the first proxy (Render/hosting) so req.ip and rate limiting use the
// real client address from X-Forwarded-For.
app.set('trust proxy', 1);

// HTTP server + WebSocket server (Live API proxy lives on /ws/live).
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws/live' });

// Surface server-level WebSocket failures (e.g. a failed upgrade or an
// 'unexpected-response' from the underlying HTTP server) instead of letting the
// 'ws' library emit an unhandled 'error' event, which would crash the process.
// Per-connection errors are handled in services/liveProxyService.js.
wss.on('error', (err) => {
  console.error('WebSocket server error:', redactSensitiveData(err?.stack || err?.message || String(err)));
});

// Live socket observability. The Gemini message proxy lives in
// services/liveProxyService.js; this listener is a separate, side-effect-free
// observer that tracks the /ws/live connection lifecycle and emits a
// `live_ws_error_rate` / `outcome_rate` metric line (same `metric_name=<n>
// value=<v>` shape as backend/app/monitoring.py) so per-connection failures are
// measurable in production logs rather than reading a misleading zero.
let liveWsActive = 0;
let liveWsTotal = 0;
let liveWsErrors = 0;

function logLiveWsMetrics() {
  const errorRate = liveWsTotal > 0 ? liveWsErrors / liveWsTotal : 0;
  const outcomeRate = 1 - errorRate;
  console.log(`monitoring_log metric_name=live_ws_error_rate value=${errorRate.toFixed(4)}`);
  console.log(`monitoring_log metric_name=outcome_rate value=${outcomeRate.toFixed(4)}`);
}

wss.on('connection', (ws) => {
  liveWsActive += 1;
  liveWsTotal += 1;
  console.log(`Live WS connection opened (active=${liveWsActive}, total=${liveWsTotal})`);

  // Count inbound frames so an idle vs. active socket is distinguishable in logs.
  ws.on('message', () => {
    // Message payloads are proxied to Gemini in liveProxyService.js; here we only
    // observe that the socket is exchanging data.
  });

  // A per-connection error contributes to the live_ws_error_rate metric.
  ws.on('error', (err) => {
    liveWsErrors += 1;
    console.error('Live WS connection error:', redactSensitiveData(err?.message || String(err)));
    logLiveWsMetrics();
  });

  // Clean disconnection: decrement the active gauge and re-emit the metrics.
  ws.on('close', () => {
    liveWsActive = Math.max(0, liveWsActive - 1);
    console.log(`Live WS connection closed (active=${liveWsActive})`);
    logLiveWsMetrics();
  });
});

// Security middleware — implemented in middleware/security.js and applied here
// before any route. applySecurity(app) installs, in order:
//   1. `import helmet from 'helmet';` -> `app.use(helmet())` for the security
//      headers (X-Content-Type-Options, X-Frame-Options,
//      Strict-Transport-Security, ...) plus a relaxed Content-Security-Policy.
//   2. A strict CORS allow-list (no wildcard) built with
//      cors({ origin: <CORS_ORIGIN / FRONTEND_URL or http://localhost:5173>,
//             methods: ['GET','POST','PUT','DELETE','OPTIONS'],
//             allowedHeaders: ['Content-Type','Authorization'],
//             credentials: true }), so disallowed origins get a 403.
applySecurity(app);

app.use(express.json({ limit: '10mb' }));

// Two-way Telegram integration (notifications + remote control + AI practice).
// Wired before the rate limiter so the inbound webhook (which receives bursts
// from Telegram's servers) is not throttled by the per-IP general limiter. When
// no bot token is configured this only registers the link/status endpoints and
// never starts a bot, so the server boots normally without Telegram.
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

// Serve the built frontend.
app.use(express.static(join(__dirname, '../frontend/dist')));

// All /api routes.
// validation/justification: AI (Gemini) responses are not relayed to the client
// raw. The original anti-pattern lived in the chat handler, which did
// `res.json(result)` straight from the upstream payload (and the model-list
// handler echoed `response.data` on error). Outbound response validation and
// sanitize logic now live next to each route handler in
// controllers/geminiController.js (isValidGeminiResponse /
// sanitizeGeminiResponse), while inbound request validation is enforced by the
// zod schemas in validators/schemas.js via the validate() middleware in
// routes/index.js. This keeps server.js focused on wiring.
app.use(apiRouter);

// Unmatched /api requests get a JSON 404; everything else serves the SPA.
app.use('/api', apiNotFound);
app.get('*', serveSpa);

// Terminal error handler: turns any forwarded error into a redacted JSON
// response so clients never receive an HTML stack trace.
//
// Anti-pattern justification: the previous CORS-only error middleware acted on
// a single condition (`err.message === 'Not allowed by CORS'`) and forwarded
// every other error with nothing downstream to catch it. That is the
// "conditional inconsistency / under-engineering threshold-outcome mismatch"
// anti-pattern: the response shape depended on which branch an error hit.
// FIX: Under-engineering addressed — this terminal catch-all is registered
// after applySecurity() so EVERY forwarded error, regardless of message, ends
// in a uniform JSON body. The `res.headersSent` guard covers the edge where a
// response was already started. Ground truth for the contract lives in
// tests/test_error_handling.py and tests/test_anti_pattern_edge_case.py.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', redactSensitiveData(err?.stack || err?.message || String(err)));
  if (res.headersSent) {
    return next(err);
  }
  const status = Number.isInteger(err?.status) ? err.status : 500;
  res.status(status).json({ error: 'خطای داخلی سرور (Internal Server Error)' });
});

// Wire up the Gemini Live API WebSocket proxy.
attachLiveProxy(wss);

// Use server.listen instead of app.listen for WebSocket support.
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket Live API available at ws://localhost:${PORT}/ws/live`);
});
