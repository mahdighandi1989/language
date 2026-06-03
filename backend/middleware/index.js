/**
 * Middleware layer barrel.
 *
 * Single public entry point for the cross-cutting middleware so callers can
 * `import { … } from './middleware'` rather than referencing each file. Covers
 * the security stack, auth guards, rate limiters, the multer upload pipeline,
 * request validation and the Gemini-key guard. Named exports are the stable
 * contract; per-file default exports are not forwarded.
 */
export * from './firebaseAuth.js';
export * from './rateLimiter.js';
export * from './requireGeminiKey.js';
export * from './security.js';
export * from './upload.js';
export * from './validate.js';
