// Purpose: lightweight client-side analytics tracker. It records user
// interactions during a chat session (messages sent, assistant replies,
// response latency, and conversions such as clicking a suggested lesson) and
// flushes them to the backend so the product KPIs — chat_success_rate,
// avg_response_time, user_engagement_rate and conversion_rate — can be
// computed and the overall outcome_rate observed in production.
//
// Upstream (what this depends on): the backend analytics endpoint
// (POST /api/analytics) exposed by backend/server.js; called by the chat UI in
// frontend/src/App.jsx.
// Downstream (what depends on this): App.jsx imports the tracker to instrument
// the chat flow; the recorded metrics feed backend/app/analytics.py.

// Canonical metric names, kept in sync with backend/app/analytics.py METRIC_NAMES
// so a given metric_name means the same thing on both tiers.
export const METRIC_NAMES = {
  chat_success_rate: 'chat_success_rate',
  avg_response_time: 'avg_response_time',
  user_engagement_rate: 'user_engagement_rate',
  conversion_rate: 'conversion_rate',
  outcome_rate: 'outcome_rate',
};

// Minimal structured logger so client analytics lines are greppable in the
// browser console the same way analytics_log lines are on the backend.
export function analytics_log(metric_name, value) {
  // eslint-disable-next-line no-console
  console.info(`analytics_log metric_name=${metric_name} value=${value}`);
}

function newSessionId() {
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

// Tracks a single chat session in memory, then flushes a summary to the backend.
export class AnalyticsTracker {
  constructor({ endpoint = '/api/analytics', sessionId } = {}) {
    this.endpoint = endpoint;
    this.sessionId = sessionId || newSessionId();
    this.userMessages = 0;
    this.assistantMessages = 0;
    this.responseTimesMs = [];
    this.converted = false;
    this._pendingStart = null;
  }

  // Call when the user sends a message; also starts the response-time clock.
  trackUserMessage() {
    this.userMessages += 1;
    this._pendingStart = (typeof performance !== 'undefined' ? performance.now() : Date.now());
  }

  // Call when the assistant reply arrives; records the elapsed response time.
  trackAssistantMessage() {
    this.assistantMessages += 1;
    if (this._pendingStart != null) {
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      this.responseTimesMs.push(Math.max(0, now - this._pendingStart));
      this._pendingStart = null;
    }
  }

  // Call when the user completes a desired goal (e.g. opens a suggested lesson).
  trackConversion() {
    this.converted = true;
  }

  // Snapshot of what will be sent — also useful for tests/debugging.
  payload() {
    return {
      session_id: this.sessionId,
      user_messages: this.userMessages,
      assistant_messages: this.assistantMessages,
      response_times_ms: this.responseTimesMs,
      converted: this.converted,
    };
  }

  // Send the accumulated session to the backend. Best-effort: analytics must
  // never break the chat UX, so failures are swallowed (and logged locally).
  async flush() {
    const body = this.payload();
    analytics_log('session_flush', JSON.stringify(body));
    try {
      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) return null;
      const data = await res.json();
      // Surface the computed outcome_rate for quick visibility in the console.
      if (data && data.metrics && data.metrics.outcome_rate != null) {
        analytics_log(METRIC_NAMES.outcome_rate, data.metrics.outcome_rate);
      }
      return data;
    } catch (err) {
      analytics_log('flush_error', String(err));
      return null;
    }
  }
}

export default AnalyticsTracker;
