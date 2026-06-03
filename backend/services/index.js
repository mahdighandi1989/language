/**
 * Services layer barrel.
 *
 * Single public entry point for the domain/service layer so callers can
 * `import { … } from './services'`. Covers analytics collection, file analysis,
 * the Gemini REST + File API client, audio/video ffmpeg helpers, PDF text
 * extraction, the Live API WebSocket proxy/observer and the Telegram
 * integration. Named exports are the stable contract; per-file default exports
 * are not forwarded.
 */
export * from './analysisService.js';
export * from './analyticsService.js';
export * from './audioService.js';
export * from './geminiService.js';
export * from './liveProxyService.js';
export * from './liveWsObserver.js';
export * from './pdfService.js';
export * from './prompts.js';
export * from './videoService.js';
export * from './telegram/index.js';
