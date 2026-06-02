// Unit tests for the frontend monitoring logger that mirrors
// backend/app/monitoring.py. Verifies the metric line format and that the
// dependency-consistency outcome is logged at the right severity.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import logger, {
  METRIC_NAMES,
  LEVELS,
  logMetric,
  logDependencyOutcome,
} from './logger.js';

describe('logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps canonical metric names in sync with the backend', () => {
    expect(METRIC_NAMES.outcome_rate).toBe('outcome_rate');
    expect(METRIC_NAMES.dependency_inconsistency).toBe('dependency_inconsistency');
  });

  it('emits a greppable metric_name=value line at info by default', () => {
    const line = logMetric('outcome_rate', 1);
    expect(line).toBe('monitoring_log level=info metric_name=outcome_rate value=1');
    expect(console.info).toHaveBeenCalledWith(line);
  });

  it('routes the given level to the matching console method', () => {
    logMetric('x', 1, LEVELS.warn);
    expect(console.warn).toHaveBeenCalled();
    logMetric('y', 1, LEVELS.error);
    expect(console.error).toHaveBeenCalled();
  });

  it('logs a healthy dependency outcome entirely at info', () => {
    const lines = logDependencyOutcome({ outcomeRate: 1, dependencyInconsistency: 0 });
    expect(lines).toHaveLength(2);
    expect(console.error).not.toHaveBeenCalled();
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining('metric_name=outcome_rate value=1'),
    );
  });

  it('escalates dependency_inconsistency to error when non-zero', () => {
    logDependencyOutcome({ outcomeRate: 0.66, dependencyInconsistency: 1 });
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('metric_name=dependency_inconsistency value=1'),
    );
  });

  it('exposes the same API on the default export', () => {
    expect(logger.logMetric).toBe(logMetric);
    expect(logger.logDependencyOutcome).toBe(logDependencyOutcome);
  });
});
