/**
 * Routes layer barrel.
 *
 * Single public entry point for the HTTP routing layer so the server
 * composition root can `import { … } from './routes'` instead of wiring each
 * route inline. This module assembles the single `/api` Express Router from the
 * controller handlers and the shared middleware (auth, validation, rate
 * limiting, multer upload). The named `apiRouter` export is the stable
 * contract; the default export forwards the same router for convenience.
 */
import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { requireAuth, optionalAuth } from '../middleware/firebaseAuth.js';
import { requireGeminiKey } from '../middleware/requireGeminiKey.js';
import { analysisLimiter } from '../middleware/rateLimiter.js';
import { upload, handleMulterError, MAX_FILES } from '../middleware/upload.js';
import { chatSchema, ttsSchema, analyzeFilesSchema, analyticsSchema } from '../validators/schemas.js';
import {
  chat,
  tts,
  health,
  status,
  listModels,
  testGemini,
  liveModelCheck,
} from '../controllers/geminiController.js';
import { analyzeFiles } from '../controllers/analysisController.js';
import { ingestAnalytics, getAnalytics } from '../controllers/analyticsController.js';
import { processAudio } from '../controllers/audioController.js';
import { uploadFile } from '../controllers/uploadController.js';

// Aggregates every /api route. Mounted at the app root so the absolute paths
// below match the original API contract exactly.
export const apiRouter = Router();

// Gemini chat & TTS
apiRouter.post('/api/gemini/chat', validate(chatSchema), optionalAuth, requireGeminiKey, chat);
apiRouter.post('/api/gemini/tts', validate(ttsSchema), optionalAuth, requireGeminiKey, tts);

// Health & status
apiRouter.get('/api/health', health);
apiRouter.get('/api/gemini/status', requireAuth, status);

// Model utilities
apiRouter.get('/api/list-models', requireGeminiKey, listModels);
apiRouter.get('/api/live-model-check', requireGeminiKey, liveModelCheck);
apiRouter.get('/api/test-gemini', requireGeminiKey, testGemini);

// File analysis
apiRouter.post(
  '/api/analyze-files',
  analysisLimiter,
  upload.array('files', MAX_FILES),
  handleMulterError,
  validate(analyzeFilesSchema),
  optionalAuth,
  requireGeminiKey,
  analyzeFiles
);

// Generic file intake: credential-free upload endpoint. Accepts a single
// multipart `file`, stores it via the shared multer disk storage and returns a
// stable { fileId, message } handle. With no file it still answers 200 with a
// generated handle, so it doubles as a dependency-only readiness signal.
apiRouter.post(
  '/api/upload',
  upload.single('file'),
  handleMulterError,
  optionalAuth,
  uploadFile
);

// Audio processing: credential-free ffmpeg-backed endpoint. With no body it
// returns a readiness snapshot; with an uploaded `file` it probes the audio and
// returns its metadata. Both answer with the stable { status, result } shape.
apiRouter.post(
  '/api/audio/process',
  upload.single('file'),
  handleMulterError,
  optionalAuth,
  processAudio
);

// Product analytics: the frontend tracker posts session summaries here so the
// backend can compute and expose the product KPIs / outcome_rate.
apiRouter.post('/api/analytics', validate(analyticsSchema), optionalAuth, ingestAnalytics);
apiRouter.get('/api/analytics', optionalAuth, getAnalytics);

export default apiRouter;
