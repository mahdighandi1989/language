import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { redactSensitiveData } from '../utils/redact.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Absolute path to the built frontend (one level up from backend/).
const FRONTEND_DIST = join(__dirname, '../../frontend/dist');

// Any /api/* request that reached here matched no route. Return a consistent
// JSON 404 instead of falling through to the SPA catch-all (which would answer
// an API call with index.html).
export function apiNotFound(req, res) {
  res.status(404).json({ error: 'یافت نشد (Not Found)' });
}

// Serve the SPA entry point for all non-API routes (client-side routing).
export function serveSpa(req, res) {
  res.sendFile(join(FRONTEND_DIST, 'index.html'));
}

// Terminal error handler: turns any forwarded error into a redacted JSON
// response so clients never receive an HTML stack trace.
//
// Anti-pattern justification: the previous CORS-only error middleware acted on
// a single condition (`err.message === 'Not allowed by CORS'`) and forwarded
// every other error with nothing downstream to catch it — the response shape
// depended on which branch an error hit. This terminal catch-all is registered
// after applySecurity() so EVERY forwarded error, regardless of message, ends
// in a uniform JSON body. The `res.headersSent` guard covers the edge where a
// response was already started. Ground truth for the contract lives in
// tests/test_error_handling.py and tests/test_anti_pattern_edge_case.py.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  console.error('Unhandled error:', redactSensitiveData(err?.stack || err?.message || String(err)));
  if (res.headersSent) {
    return next(err);
  }
  const status = Number.isInteger(err?.status) ? err.status : 500;
  res.status(status).json({ error: 'خطای داخلی سرور (Internal Server Error)' });
}

// Mount the fallback layer (in order): JSON 404 for unmatched /api/* requests,
// the SPA catch-all for every other path, and the terminal error handler. Kept
// here so the entry point registers no route handlers of its own.
export function mountFallbacks(app) {
  app.use('/api', apiNotFound);
  app.get('*', serveSpa);
  app.use(errorHandler);
}
