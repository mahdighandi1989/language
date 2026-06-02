import dotenv from 'dotenv';
import { validateEnv } from './validateEnv.js';

// Centralised runtime configuration. Loading this module loads the .env file
// and validates required environment variables exactly once; on any invalid
// value validateEnv() logs a FATAL message and exits the process, so the rest
// of the app can rely on these exports always being present and valid.

dotenv.config();

const validated = validateEnv();

// validateEnv() returns the already-decrypted Gemini key (it transparently
// handles both encrypted AES-256-GCM values and plaintext) and the resolved
// port, so consumers never have to decrypt or parse these again.
export const GEMINI_API_KEY = validated.GEMINI_API_KEY;
export const PORT = validated.PORT;
