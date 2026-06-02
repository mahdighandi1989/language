// Purpose: HTTP handler for product analytics. Accepts a session summary from
// the frontend tracker, records it, and returns the freshly computed KPIs
// (chat_success_rate, avg_response_time, user_engagement_rate, conversion_rate,
// outcome_rate) so the client can surface the current outcome_rate.
//
// Upstream (what this depends on): backend/services/analyticsService.js for the
// KPI computation; events originate in frontend/src/analytics.js.
// Downstream (what depends on this): mounted at POST /api/analytics in
// backend/routes/index.js.
import { collector } from '../services/analyticsService.js';

// POST /api/analytics — record one session and return the current metrics.
export function ingestAnalytics(req, res) {
  collector.record(req.body || {});
  const metrics = collector.outcome();
  res.json({ status: 'ok', metrics });
}

// GET /api/analytics — current product outcome metrics (for dashboards/probes).
export function getAnalytics(req, res) {
  res.json({ status: 'ok', metrics: collector.outcome() });
}

export default { ingestAnalytics, getAnalytics };
