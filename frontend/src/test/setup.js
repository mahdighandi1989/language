// Vitest global setup: adds jest-dom matchers (toBeInTheDocument, etc.) and
// cleans up the rendered React tree between tests so unit tests stay isolated.
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
