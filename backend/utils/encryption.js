import crypto from 'crypto';

// AES-256-GCM authenticated encryption for sensitive config values
// (e.g. the Gemini API key stored in the environment).
//
// The encryption key MUST be provided via process.env.ENCRYPTION_KEY and is
// never hard-coded in source. It is expected to be 32 bytes encoded as 64 hex
// characters (generate with: `openssl rand -hex 32`).

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // GCM standard nonce length
const ENCRYPTED_PARTS = 3; // iv:authTag:ciphertext

function getKey() {
  const keyHex = process.env.ENCRYPTION_KEY;
  if (!keyHex) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  const key = Buffer.from(keyHex, 'hex');
  if (key.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
  }
  return key;
}

// Returns true when the given value matches our `iv:authTag:ciphertext` hex format.
function looksEncrypted(value) {
  const parts = String(value).split(':');
  if (parts.length !== ENCRYPTED_PARTS) return false;
  return parts.every((p) => p.length > 0 && /^[0-9a-fA-F]+$/.test(p));
}

export function encrypt(plainText) {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(String(plainText), 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(value) {
  if (value === undefined || value === null) return value;
  const str = String(value);

  // Plaintext convenience: if the value is not in our encrypted format,
  // return it unchanged so unencrypted dev/CI values keep working.
  if (!looksEncrypted(str)) {
    return str;
  }

  const key = getKey();
  const [ivHex, tagHex, dataHex] = str.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(tagHex, 'hex');
  const encrypted = Buffer.from(dataHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

export { looksEncrypted };
