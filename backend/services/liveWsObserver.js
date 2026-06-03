/**
 * Purpose: Side-effect-free observability for the /ws/live WebSocket. Tracks the
 * connection lifecycle (active/total gauges) and emits a `live_ws_error_rate` /
 * `outcome_rate` metric line (same `metric_name=<n> value=<v>` shape as
 * backend/app/monitoring.py) so per-connection failures are measurable in
 * production logs rather than reading a misleading zero. Extracted from
 * server.js so the entry point stays focused on wiring.
 *
 * Upstream (inputs): the WebSocketServer instance created in server.js;
 * ../utils/redact.js for secret-safe error logging.
 * Downstream (outputs): structured `monitoring_log` lines parsed by the same
 * tooling as backend/app/monitoring.py. The actual Gemini message proxy lives
 * in ./liveProxyService.js; this observer only watches the socket lifecycle.
 */
import { redactSensitiveData } from '../utils/redact.js';

/**
 * Attach lifecycle + metrics observers to the Live API WebSocket server. This is
 * a separate observer from the message proxy in liveProxyService.js: it never
 * touches payloads, only counts connections and errors.
 *
 * @param {import('ws').WebSocketServer} wss
 */
export function attachLiveWsObserver(wss) {
  let liveWsActive = 0;
  let liveWsTotal = 0;
  let liveWsErrors = 0;

  function logLiveWsMetrics() {
    const errorRate = liveWsTotal > 0 ? liveWsErrors / liveWsTotal : 0;
    const outcomeRate = 1 - errorRate;
    console.log(`monitoring_log metric_name=live_ws_error_rate value=${errorRate.toFixed(4)}`);
    console.log(`monitoring_log metric_name=outcome_rate value=${outcomeRate.toFixed(4)}`);
  }

  // Surface server-level WebSocket failures (e.g. a failed upgrade or an
  // 'unexpected-response' from the underlying HTTP server) instead of letting
  // the 'ws' library emit an unhandled 'error' event, which would crash the
  // process. Per-connection errors are handled below and in liveProxyService.js.
  wss.on('error', (err) => {
    console.error('WebSocket server error:', redactSensitiveData(err?.stack || err?.message || String(err)));
  });

  wss.on('connection', (ws) => {
    liveWsActive += 1;
    liveWsTotal += 1;
    console.log(`Live WS connection opened (active=${liveWsActive}, total=${liveWsTotal})`);

    // Count inbound frames so an idle vs. active socket is distinguishable in
    // logs. Payloads are proxied to Gemini in liveProxyService.js.
    ws.on('message', () => {});

    // A per-connection error contributes to the live_ws_error_rate metric.
    ws.on('error', (err) => {
      liveWsErrors += 1;
      console.error('Live WS connection error:', redactSensitiveData(err?.message || String(err)));
      logLiveWsMetrics();
    });

    // Clean disconnection: decrement the active gauge and re-emit the metrics.
    ws.on('close', () => {
      liveWsActive = Math.max(0, liveWsActive - 1);
      console.log(`Live WS connection closed (active=${liveWsActive})`);
      logLiveWsMetrics();
    });
  });
}
