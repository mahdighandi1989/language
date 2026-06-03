/**
 * Controllers layer barrel.
 *
 * Single public entry point for the HTTP handler layer so the rest of the app
 * (routes, server composition) can `import { … } from './controllers'` instead
 * of reaching into individual handler files. Each controller owns the
 * request/response shape for one slice of the API; this index simply re-exports
 * their public handlers. Default exports are intentionally not forwarded — the
 * named handlers are the stable contract.
 */
export * from './analysisController.js';
export * from './analyticsController.js';
export * from './audioController.js';
export * from './fallbackController.js';
export * from './geminiController.js';
export * from './uploadController.js';
