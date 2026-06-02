import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { requireAuth, optionalAuth } from '../middleware/firebaseAuth.js';
import { requireGeminiKey } from '../middleware/requireGeminiKey.js';
import { analysisLimiter } from '../middleware/rateLimiter.js';
import { upload, handleMulterError, MAX_FILES } from '../middleware/upload.js';
import { chatSchema, ttsSchema, analyzeFilesSchema } from '../validators/schemas.js';
import {
  chat,
  tts,
  health,
  status,
  listModels,
  testGemini,
} from '../controllers/geminiController.js';
import { analyzeFiles } from '../controllers/analysisController.js';

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

export default apiRouter;
