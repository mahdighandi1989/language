/**
 * Purpose: HTTP + WebSocket entry point for the Lebanese-dialect backend. It
 * wires Express security middleware, rate limiting, the /api router and the
 * Gemini Live API WebSocket proxy, and serves the built frontend SPA. All
 * domain logic lives in ./controllers, ./services, ./routes, ./middleware,
 * ./utils and ./config; this file only composes them.
 *
 * Upstream (inputs): environment validated by ./config/bootstrap.js and
 * ./config/env.js (GEMINI_API_KEY, PORT, CORS_ORIGIN, FIREBASE_*); the compiled
 * frontend in ../frontend/dist; the Google Gemini API (REST + Live API).
 * Downstream (outputs): serves the SPA and the JSON /api/* endpoints consumed
 * by frontend/src/App.jsx, plus the /ws/live socket for real-time voice.
 */
import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { WebSocketServer } from 'ws';

import { PORT, GEMINI_API_KEY } from './config/env.js';
import { runStartupChecks, firebaseConfig } from './config/bootstrap.js';
import { applySecurity } from './middleware/security.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { apiRouter } from './routes/index.js';
import { mountFallbacks } from './controllers/fallbackController.js';
import { attachLiveProxy } from './services/liveProxyService.js';
import { attachLiveWsObserver } from './services/liveWsObserver.js';
import { attachTelegram } from './services/telegram/index.js';

// Load .env, validate required env vars, and run the Gemini key self-check
// before anything else boots.
runStartupChecks();

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

// Trust the first proxy (Render/hosting) so req.ip and rate limiting use the
// real client address from X-Forwarded-For.
app.set('trust proxy', 1);

// HTTP server + WebSocket server (Live API proxy lives on /ws/live).
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws/live' });

// Lifecycle + metrics observability for the Live socket (implementation in
// services/liveWsObserver.js). Separate from the message proxy below.
attachLiveWsObserver(wss);

// Baseline security stack (middleware/security.js): helmet() security headers,
// the strict no-wildcard CORS allow-list, the relaxed CSP for Gemini/Firebase,
// and the CORS-rejection -> 403 JSON translator. Wired first, before the body
// parser and routes.
applySecurity(app);

app.use(express.json({ limit: '10mb' }));

// Two-way Telegram integration (notifications + remote control + AI practice).
// Wired before the rate limiter so the inbound webhook is not throttled by the
// per-IP general limiter. With no bot token it only registers the link/status
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

// Serve the built frontend.
app.use(express.static(join(__dirname, '../frontend/dist')));

// All /api routes. Inbound validation (zod schemas in validators/schemas.js)
// and outbound sanitization live next to each handler in controllers/, so this
// stays pure wiring.
app.use(apiRouter);

// JSON 404 for unmatched /api/*, SPA catch-all for everything else, and the
// terminal redacted-JSON error handler (all in controllers/fallbackController.js).
mountFallbacks(app);

// Wire up the Gemini Live API WebSocket proxy.
attachLiveProxy(wss);

// Use server.listen instead of app.listen for WebSocket support.
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket Live API available at ws://localhost:${PORT}/ws/live`);
});
