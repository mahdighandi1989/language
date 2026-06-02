import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RUNNER = join(__dirname, '_validateEnvRunner.js');

// Runs the validateEnv runner in a clean child process with the given env
// overrides and returns { status, stderr, stdout }. Inherited GEMINI_API_KEY /
// PORT / ENCRYPTION_KEY are stripped so each case is deterministic.
function runValidate(overrides) {
  const env = { ...process.env };
  delete env.GEMINI_API_KEY;
  delete env.PORT;
  delete env.ENCRYPTION_KEY;
  Object.assign(env, overrides);

  const result = spawnSync(process.execPath, [RUNNER], {
    env,
    encoding: 'utf8',
  });
  return result;
}

// AC: missing GEMINI_API_KEY -> clear FATAL message + process.exit(1)
test('test_missing_gemini_key', () => {
  const { status, stderr } = runValidate({});
  assert.equal(status, 1, 'process should exit with code 1 when GEMINI_API_KEY is missing');
  assert.match(stderr, /FATAL: متغیر محیطی GEMINI_API_KEY معتبر نیست/);
});

// AC: invalid GEMINI_API_KEY format (no AIza prefix) -> exit(1)
test('test_invalid_gemini_key_format', () => {
  const { status, stderr } = runValidate({ GEMINI_API_KEY: 'abc' });
  assert.equal(status, 1, 'process should exit with code 1 for an invalid key format');
  assert.match(stderr, /FATAL: متغیر محیطی GEMINI_API_KEY معتبر نیست/);
});

// AC: non-numeric PORT -> exit(1)
test('test_invalid_port', () => {
  const { status, stderr } = runValidate({
    GEMINI_API_KEY: 'AIzaSyValidLookingKey1234567890',
    PORT: 'abc',
  });
  assert.equal(status, 1, 'process should exit with code 1 for a non-numeric PORT');
  assert.match(stderr, /FATAL: متغیر محیطی PORT معتبر نیست/);
});

// Sanity: a fully valid environment passes without exiting non-zero.
test('test_valid_env_passes', () => {
  const { status, stdout } = runValidate({
    GEMINI_API_KEY: 'AIzaSyValidLookingKey1234567890',
    PORT: '3001',
  });
  assert.equal(status, 0, 'process should exit 0 when all env vars are valid');
  assert.match(stdout, /VALIDATE_ENV_OK/);
});
