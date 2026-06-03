/**
 * HTTP + WebSocket composition root for the Lebanese-dialect backend. Holds no
 * handler bodies — only global wiring (env validation, security stack, rate
 * limiting, /api router, Gemini Live WS proxy, Telegram, SPA). Domain logic
 * lives in ./controllers, ./services, ./routes, ./middleware, ./utils, ./config.
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
import { firebaseConfig } from './config/bootstrap.js';
import { PORT } from './config/env.js';
// Layer barrels — each folder exposes its public API through index.js.
import { decrypt, redactSensitiveData as sharedRedact } from './utils/index.js';
import { applySecurity, generalLimiter } from './middleware/index.js';
import { apiRouter } from './routes/index.js';
import { mountFallbacks } from './controllers/index.js';
import { attachLiveProxy, attachLiveWsObserver, attachTelegram } from './services/index.js';

// Load .env, then fail fast on any missing/invalid required variable.
dotenv.config();
validateEnv();
// GEMINI_API_KEY may be AES-256-GCM encrypted (decrypt() handles plaintext too);
// redactSensitiveData() is the safe sink that scrubs the key before stderr.
const GEMINI_API_KEY = decrypt(process.env.GEMINI_API_KEY);
const redactSensitiveData = sharedRedact;
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', redactSensitiveData(reason?.message || String(reason)));
});
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.set('trust proxy', 1); // req.ip / rate limiting use the real client address.
const server = createServer(app); // HTTP + WS server (Live API proxy on /ws/live).
const wss = new WebSocketServer({ server, path: '/ws/live' });
attachLiveWsObserver(wss); // Live-socket lifecycle + metrics (proxy attached later).
// Security stack (order matters): helmet() headers, then a strict no-wildcard
// CORS allow-list, then applySecurity() (relaxed CSP + CORS-rejection -> 403).
const DEV_ORIGIN = 'http://localhost:5173';
const allowedOrigins = Array.from(
  new Set(
    `${process.env.CORS_ORIGIN || ''},${process.env.FRONTEND_URL || ''},${DEV_ORIGIN}`
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean)
  )
);
app.use(helmet());
// Same-origin requests are always permitted, so the deployed SPA can call its
// own /api without listing every host in CORS_ORIGIN.
app.use(
  cors((req, callback) => {
    const { origin, host } = req.headers;
    let allowed;
    if (!origin) {
      allowed = true; // same-origin GET / non-browser / server-to-server
    } else if (allowedOrigins.includes(origin)) {
      allowed = true;
    } else {
      try {
        allowed = Boolean(host) && new URL(origin).host === host;
      } catch {
        allowed = false; // malformed Origin header
      }
    }
    callback(allowed ? null : new Error('Not allowed by CORS'), {
      origin: allowed,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
      optionsSuccessStatus: 204,
    });
  })
);
applySecurity(app);
app.use(express.json({ limit: '10mb' }));
const serverStartedAt = Date.now(); // Telegram link/status before the rate limiter.
attachTelegram(app, {
  getStatus: () => ({
    ok: true,
    geminiConfigured: Boolean(GEMINI_API_KEY),
    firebaseConfigured: Boolean(firebaseConfig.projectId),
    uptimeSec: (Date.now() - serverStartedAt) / 1000,
  }),
});
app.use('/api', generalLimiter); // Rate-limit /api/* (the WS path is not under /api).
// SPA static assets, then /api routes, then the fallback layer (404 / SPA / errors).
app.use(express.static(join(__dirname, '../frontend/dist')));
app.use(apiRouter);
mountFallbacks(app); // Terminal 404 / SPA index / JSON error handlers.
attachLiveProxy(wss); // Gemini Live API WebSocket proxy.
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket Live API available at ws://localhost:${PORT}/ws/live`);
});
