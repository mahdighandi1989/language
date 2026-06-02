import { GEMINI_API_KEY } from '../config/env.js';

// Replaces any occurrence of the real API key (or other Google API keys) in a
// string with [REDACTED] so secrets never end up in logs or responses.
export function redactSensitiveData(input) {
  if (input === undefined || input === null) return input;
  let str = typeof input === 'string' ? input : JSON.stringify(input);
  if (GEMINI_API_KEY) {
    str = str.split(GEMINI_API_KEY).join('[REDACTED]');
  }
  str = str.replace(/AIza[0-9A-Za-z_-]{10,}/g, '[REDACTED]');
  str = str.replace(/([?&]key=)[^&\s"']+/g, '$1[REDACTED]');
  return str;
}

export default redactSensitiveData;
