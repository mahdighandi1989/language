// Purpose: lightweight client-side structured logger for monitoring/observability
// metrics. It mirrors the backend monitoring layer (backend/app/monitoring.py)
// so the same metric names — notably `outcome_rate` and `dependency_inconsistency`
// — are emitted on both tiers and a regression is greppable in the browser
// console exactly like `metric_name=... value=...` lines are in production logs.
//
// Upstream (what this depends on): nothing app-specific; uses the browser/Node
// `console`. Metric names are kept in sync with backend/app/monitoring.py.
// Downstream (what depends on this): frontend code that wants to record a
// monitoring metric/log line; the dependency-consistency metric is also computed
// in CI by tests/test_dependency_consistency.py.

// Canonical metric names, kept in sync with backend/app/monitoring.py METRIC_NAMES
// so a given metric_name means the same thing on both tiers.
export const METRIC_NAMES = {
  outcome_rate: 'outcome_rate',
  dependency_inconsistency: 'dependency_inconsistency',
};

// Severity levels for log lines. Mirrors typical logger levels so log parsers /
// dashboards can filter by level.
export const LEVELS = {
  info: 'info',
  warn: 'warn',
  error: 'error',
};

function emit(level, message) {
  const line = `monitoring_log level=${level} ${message}`;
  // eslint-disable-next-line no-console
  const sink = level === LEVELS.error
    ? console.error
    : level === LEVELS.warn
      ? console.warn
      : console.info;
  sink(line);
  return line;
}

// Emit a single metric line: `monitoring_log level=info metric_name=<name> value=<v>`.
export function logMetric(metricName, value, level = LEVELS.info) {
  return emit(level, `metric_name=${metricName} value=${value}`);
}

// Record the dependency-consistency outcome. `dependencyInconsistency` is the
// number of failed consistency invariants (0 == healthy); a non-zero value is
// logged at error level so it stands out, and `outcome_rate` is always emitted.
export function logDependencyOutcome({ outcomeRate, dependencyInconsistency }) {
  const lines = [];
  lines.push(logMetric(METRIC_NAMES.outcome_rate, outcomeRate));
  lines.push(
    logMetric(
      METRIC_NAMES.dependency_inconsistency,
      dependencyInconsistency,
      dependencyInconsistency > 0 ? LEVELS.error : LEVELS.info,
    ),
  );
  return lines;
}

export default { METRIC_NAMES, LEVELS, logMetric, logDependencyOutcome };
