/**
 * Purpose: One-time startup bootstrap for the backend entry point. Loads the
 * .env file, validates every required environment variable, runs the Gemini key
 * decryption self-check, and exposes the server-side Firebase configuration.
 * Extracted from server.js so the entry point stays focused on HTTP/WS wiring.
 *
 * Upstream (inputs): process.env (GEMINI_API_KEY, ENCRYPTION_KEY, FIREBASE_*),
 * ./env.js (GEMINI_API_KEY export), ./validateEnv.js, ../utils/encryption.js.
 * Downstream (outputs): runStartupChecks() is called once by server.js before
 * routes are wired; firebaseConfig is consumed by the Telegram status handler.
 */
import dotenv from 'dotenv';
import { validateEnv } from './validateEnv.js';
import { GEMINI_API_KEY } from './env.js';
import { decrypt } from '../utils/encryption.js';

// Backend-side Firebase configuration, sourced exclusively from environment
// variables (never hard-coded). FIREBASE_PROJECT_ID is consumed by the Admin
// SDK in middleware/firebaseAuth.js to verify ID tokens; the remaining values
// document the project for any other server-side Firebase usage.
export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

/**
 * Load .env and validate every required environment variable at the entry
 * point. validateEnv() prints a clear FATAL message and calls process.exit(1)
 * on any missing/invalid value, so the server never boots into an insecure
 * state. The Gemini key may be stored AES-256-GCM encrypted; decrypt()
 * transparently handles encrypted or plaintext values. Confirming it yields the
 * same key the rest of the app consumes makes a misconfigured ENCRYPTION_KEY
 * fail fast instead of surfacing as opaque upstream errors.
 */
export function runStartupChecks() {
  dotenv.config();
  validateEnv();

  const decryptedGeminiKey = decrypt(process.env.GEMINI_API_KEY);
  if (decryptedGeminiKey !== GEMINI_API_KEY) {
    // Note: this log line never includes the secret value itself — only a
    // generic mismatch notice — so no key material is leaked to stdout/stderr.
    console.error('FATAL: Gemini API key decryption mismatch — check ENCRYPTION_KEY');
    process.exit(1);
  }
}
