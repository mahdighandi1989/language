import { GEMINI_API_KEY } from '../config/env.js';

// Shared guard so the API-key check is defined once instead of duplicated in
// every Gemini endpoint.
export const requireGeminiKey = (req, res, next) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }
  next();
};

export default requireGeminiKey;
