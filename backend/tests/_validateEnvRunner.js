// Helper executed in a child process by test_validateEnv.js. It calls
// validateEnv() with whatever environment the parent set, so the test can
// observe the resulting process exit code and stderr.
import { validateEnv } from '../config/validateEnv.js';

validateEnv();
// If validateEnv did not exit, the environment was considered valid.
console.log('VALIDATE_ENV_OK');
process.exit(0);
