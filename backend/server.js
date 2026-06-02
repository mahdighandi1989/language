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

// Security headers, CSP and CORS allow-list.
applySecurity(app);

app.use(express.json({ limit: '10mb' }));

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
