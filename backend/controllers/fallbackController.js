import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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
