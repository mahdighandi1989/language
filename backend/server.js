/**
 * Purpose: HTTP + WebSocket entry point for the Lebanese-dialect backend. This
 * file is pure composition — it registers no handler body of its own. It wires
 * only global configuration: env validation, the baseline security stack
 * (applySecurity: helmet + strict no-wildcard CORS + relaxed CSP + CORS->403
 * translator, implemented in middleware/security.js), per-IP rate limiting, the
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
import { validateEnv } from './config/validateEnv.js';
import { decrypt } from './utils/encryption.js';
import { redactSensitiveData as sharedRedact } from './utils/redact.js';
import { firebaseConfig } from './config/bootstrap.js';
import { PORT } from './config/env.js';
import { applySecurity } from './middleware/security.js';
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
// Redact stray secrets before they reach stderr.
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

// Baseline security stack (helmet + strict CORS + CSP + CORS->403 translator).
// Registered before mountFallbacks() so forwarded errors reach the terminal handler.
applySecurity(app);
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
