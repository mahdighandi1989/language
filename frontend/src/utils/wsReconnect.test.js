import { describe, it, expect } from 'vitest';
import {
  nextReconnectDelay,
  shouldReconnect,
  BASE_RECONNECT_DELAY_MS,
  MAX_RECONNECT_DELAY_MS,
  MAX_RECONNECT_ATTEMPTS,
} from './wsReconnect.js';

describe('nextReconnectDelay', () => {
  it('doubles the delay on each attempt: 1s, 2s, 4s, 8s, 16s', () => {
    expect(nextReconnectDelay(1)).toBe(1000);
    expect(nextReconnectDelay(2)).toBe(2000);
    expect(nextReconnectDelay(3)).toBe(4000);
    expect(nextReconnectDelay(4)).toBe(8000);
    expect(nextReconnectDelay(5)).toBe(16000);
  });

  it('clamps to the 30s ceiling for later attempts', () => {
    expect(nextReconnectDelay(6)).toBe(MAX_RECONNECT_DELAY_MS);
    expect(nextReconnectDelay(50)).toBe(MAX_RECONNECT_DELAY_MS);
  });

  it('treats non-positive / invalid attempts as the first attempt', () => {
    expect(nextReconnectDelay(0)).toBe(BASE_RECONNECT_DELAY_MS);
    expect(nextReconnectDelay(-3)).toBe(BASE_RECONNECT_DELAY_MS);
    expect(nextReconnectDelay(NaN)).toBe(BASE_RECONNECT_DELAY_MS);
    expect(nextReconnectDelay(undefined)).toBe(BASE_RECONNECT_DELAY_MS);
  });

  it('never returns a delay below the base or above the cap', () => {
    for (let attempt = 1; attempt <= 20; attempt += 1) {
      const delay = nextReconnectDelay(attempt);
      expect(delay).toBeGreaterThanOrEqual(BASE_RECONNECT_DELAY_MS);
      expect(delay).toBeLessThanOrEqual(MAX_RECONNECT_DELAY_MS);
    }
  });
});

describe('shouldReconnect', () => {
  it('allows retries up to the attempt cap', () => {
    expect(shouldReconnect(0)).toBe(true);
    expect(shouldReconnect(MAX_RECONNECT_ATTEMPTS - 1)).toBe(true);
  });

  it('stops once the attempt cap is reached', () => {
    expect(shouldReconnect(MAX_RECONNECT_ATTEMPTS)).toBe(false);
    expect(shouldReconnect(MAX_RECONNECT_ATTEMPTS + 5)).toBe(false);
  });
});
