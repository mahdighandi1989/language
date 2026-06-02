import { decrypt } from '../utils/encryption.js';

// Validates required environment variables at startup. On any invalid value the
// process logs a clear FATAL message and exits with code 1 so the server never
// boots into a broken/insecure state.

const GEMINI_KEY_PATTERN = /^AIza[0-9A-Za-z_-]{10,}$/;

function fail(message) {
  // eslint-disable-next-line no-console
  console.error(message);
  process.exit(1);
}

export function validateEnv(env = process.env) {
  const encryptedKey = env.GEMINI_API_KEY;

  if (!encryptedKey || !String(encryptedKey).trim()) {
    fail('FATAL: متغیر محیطی GEMINI_API_KEY معتبر نیست');
    return undefined;
  }

  // The key may be stored encrypted (AES-256-GCM) or as plaintext. decrypt()
  // transparently handles both. A decryption failure means the value/key pair
  // is invalid.
  let geminiKey;
  try {
    geminiKey = decrypt(encryptedKey);
  } catch {
    fail('FATAL: متغیر محیطی GEMINI_API_KEY معتبر نیست');
    return undefined;
  }

  if (!GEMINI_KEY_PATTERN.test(geminiKey)) {
    fail('FATAL: متغیر محیطی GEMINI_API_KEY معتبر نیست');
    return undefined;
  }

  let port = 3001;
  if (env.PORT !== undefined && String(env.PORT).trim() !== '') {
    if (!/^\d+$/.test(String(env.PORT).trim())) {
      fail('FATAL: متغیر محیطی PORT معتبر نیست');
      return undefined;
    }
    port = parseInt(String(env.PORT), 10);
  }

  return { GEMINI_API_KEY: geminiKey, PORT: port };
}

export default validateEnv;
