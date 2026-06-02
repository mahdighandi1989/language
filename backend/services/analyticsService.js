// Purpose: server-side product analytics. Accumulates conversation/session
// events posted by the frontend tracker and computes the product KPIs —
// chat_success_rate, avg_response_time, user_engagement_rate and
// conversion_rate — blended into a single outcome_rate so the real
// effectiveness of the app (not just technical health) is measurable.
//
// Upstream (what this depends on): events arrive from frontend/src/analytics.js
// via the POST /api/analytics route (backend/controllers/analyticsController.js).
// Downstream (what depends on this): the controller returns these metrics to the
// client; the same metric names mirror backend/app/analytics.py so logs and
// dashboards agree across tiers.

// Canonical metric names, kept in sync with backend/app/analytics.py and
// frontend/src/analytics.js so a metric_name means the same thing everywhere.
export const METRIC_NAMES = {
  chat_success_rate: 'chat_success_rate',
  avg_response_time: 'avg_response_time',
  user_engagement_rate: 'user_engagement_rate',
  conversion_rate: 'conversion_rate',
  outcome_rate: 'outcome_rate',
};

const SUCCESS_MIN_ASSISTANT_TURNS = 2;
const ENGAGEMENT_MIN_USER_MESSAGES = 2;
const RESPONSE_TIME_CEILING_MS = 5000;

// Bounded in-memory window of recent sessions so memory stays flat.
export class AnalyticsCollector {
  constructor(window = 1000) {
    this.window = window;
    this.events = [];
  }

  record(payload) {
    const event = {
      session_id: String(payload.session_id ?? 'anonymous'),
      user_messages: Number(payload.user_messages ?? 0),
      assistant_messages: Number(payload.assistant_messages ?? 0),
      response_times_ms: (payload.response_times_ms ?? []).map(Number),
      converted: Boolean(payload.converted ?? false),
    };
    this.events.push(event);
    if (this.events.length > this.window) this.events.shift();
    return event;
  }

  reset() {
    this.events = [];
  }

  get total() {
    return this.events.length;
  }

  chatSuccessRate() {
    if (!this.events.length) return 0;
    const ok = this.events.filter((e) => e.assistant_messages >= SUCCESS_MIN_ASSISTANT_TURNS).length;
    return ok / this.events.length;
  }

  avgResponseTime() {
    const samples = this.events.flatMap((e) => e.response_times_ms);
    if (!samples.length) return 0;
    return samples.reduce((a, b) => a + b, 0) / samples.length;
  }

  userEngagementRate() {
    if (!this.events.length) return 0;
    const engaged = this.events.filter((e) => e.user_messages >= ENGAGEMENT_MIN_USER_MESSAGES).length;
    return engaged / this.events.length;
  }

  conversionRate() {
    if (!this.events.length) return 0;
    const converted = this.events.filter((e) => e.converted).length;
    return converted / this.events.length;
  }

  outcomeRate() {
    if (!this.events.length) return 0;
    const speedScore = Math.max(0, 1 - Math.min(this.avgResponseTime(), RESPONSE_TIME_CEILING_MS) / RESPONSE_TIME_CEILING_MS);
    const components = [this.chatSuccessRate(), this.userEngagementRate(), this.conversionRate(), speedScore];
    return components.reduce((a, b) => a + b, 0) / components.length;
  }

  outcome() {
    const round = (n, d = 4) => Number(n.toFixed(d));
    const metrics = {
      [METRIC_NAMES.chat_success_rate]: round(this.chatSuccessRate()),
      [METRIC_NAMES.avg_response_time]: round(this.avgResponseTime(), 2),
      [METRIC_NAMES.user_engagement_rate]: round(this.userEngagementRate()),
      [METRIC_NAMES.conversion_rate]: round(this.conversionRate()),
      [METRIC_NAMES.outcome_rate]: round(this.outcomeRate()),
      sample_size: this.total,
    };
    logMetrics(metrics);
    return metrics;
  }
}

// Emit each KPI on its own line so log parsers can extract metric_name=value,
// mirroring the analytics_log logger in backend/app/analytics.py.
export function logMetrics(metrics) {
  for (const [metric_name, value] of Object.entries(metrics)) {
    // eslint-disable-next-line no-console
    console.info(`analytics_log metric_name=${metric_name} value=${value}`);
  }
}

// Shared module-level collector used by the request path.
export const collector = new AnalyticsCollector();

export default { AnalyticsCollector, collector, METRIC_NAMES, logMetrics };
