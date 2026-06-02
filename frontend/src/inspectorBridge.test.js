import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  installGlobalErrorTracking,
  reportError,
  resetErrorStats,
  getErrorStats,
  currentErrorRate,
  trackInteraction,
} from './inspectorBridge.js';

describe('inspectorBridge error tracking', () => {
  let uninstall;

  beforeEach(() => {
    resetErrorStats();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    if (uninstall) uninstall();
    uninstall = undefined;
    vi.restoreAllMocks();
  });

  it('counts runtime, promise and firebase errors separately', () => {
    reportError(new Error('boom'), { source: 'runtime' });
    reportError('rejected', { source: 'promise' });
    reportError(new Error('firestore down'), { source: 'firebase' });

    const stats = getErrorStats();
    expect(stats.total).toBe(3);
    expect(stats.runtime).toBe(1);
    expect(stats.promise).toBe(1);
    expect(stats.firebase).toBe(1);
  });

  it('emits an error_rate metric line on each report', () => {
    reportError(new Error('boom'));
    const lines = console.error.mock.calls.map((c) => String(c[0]));
    // logger.logMetric emits via console.error at error level for error_rate.
    expect(lines.some((l) => l.includes('metric_name=error_rate'))).toBe(true);
  });

  it('computes error_rate as errors per interaction, clamped to 1', () => {
    trackInteraction(); // interactions = 2
    reportError(new Error('a'));
    expect(currentErrorRate()).toBeCloseTo(0.5, 5);
    reportError(new Error('b'));
    reportError(new Error('c'));
    // total=3, interactions=2 -> clamped to 1
    expect(currentErrorRate()).toBe(1);
  });

  it('captures window error and unhandledrejection events once installed', () => {
    uninstall = installGlobalErrorTracking(window);

    window.dispatchEvent(new ErrorEvent('error', { error: new Error('window boom') }));
    expect(getErrorStats().runtime).toBe(1);

    // jsdom may not implement PromiseRejectionEvent; build a plain event.
    const rejection = new Event('unhandledrejection');
    rejection.reason = new Error('promise boom');
    window.dispatchEvent(rejection);
    expect(getErrorStats().promise).toBe(1);
  });

  it('is a no-op when no event target is available', () => {
    const fn = installGlobalErrorTracking(undefined);
    expect(typeof fn).toBe('function');
    expect(() => fn()).not.toThrow();
  });
});
