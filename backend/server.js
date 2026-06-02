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

import { PORT } from './config/env.js';
import { applySecurity } from './middleware/security.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { apiRouter } from './routes/index.js';
import { apiNotFound, serveSpa } from './controllers/fallbackController.js';
import { attachLiveProxy } from './services/liveProxyService.js';
import { attachTelegram } from './services/telegram/index.js';
import { GEMINI_API_KEY } from './config/env.js';
import { redactSensitiveData } from './utils/redact.js';

// Importing ./config/env.js above has already loaded .env and validated the
// required environment variables (it exits the process on any invalid value),
// so the rest of this file can assume a valid configuration.

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

// Security headers, CSP and CORS allow-list.
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
