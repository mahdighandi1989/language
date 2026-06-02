// Unit tests for the client analytics tracker that App.jsx uses to instrument
// the chat flow (module-level `chatAnalytics`). Covers the session counters,
// response-time capture, payload snapshot and the best-effort flush behaviour.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AnalyticsTracker, { METRIC_NAMES, analytics_log } from './analytics.js';

describe('AnalyticsTracker', () => {
  it('counts user/assistant messages and records response times', () => {
    const t = new AnalyticsTracker({ sessionId: 's1' });
    t.trackUserMessage();
    t.trackAssistantMessage();
    t.trackUserMessage();
    t.trackAssistantMessage();

    const p = t.payload();
    expect(p.session_id).toBe('s1');
    expect(p.user_messages).toBe(2);
    expect(p.assistant_messages).toBe(2);
    expect(p.response_times_ms).toHaveLength(2);
    for (const ms of p.response_times_ms) {
      expect(ms).toBeGreaterThanOrEqual(0);
    }
  });

  it('marks conversion only after trackConversion', () => {
    const t = new AnalyticsTracker({ sessionId: 's2' });
    expect(t.payload().converted).toBe(false);
    t.trackConversion();
    expect(t.payload().converted).toBe(true);
  });

  it('does not record a response time for an assistant message with no pending user turn', () => {
    const t = new AnalyticsTracker({ sessionId: 's3' });
    t.trackAssistantMessage();
    expect(t.payload().response_times_ms).toHaveLength(0);
  });

  it('generates a session id when none is provided', () => {
    const t = new AnalyticsTracker();
    expect(t.payload().session_id).toMatch(/^s_/);
  });

  describe('flush', () => {
    afterEach(() => {
      vi.restoreAllMocks();
      delete globalThis.fetch;
    });

    it('posts the payload and surfaces outcome_rate on success', async () => {
      const fetchMock = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ metrics: { outcome_rate: 0.83 } }),
        }),
      );
      globalThis.fetch = fetchMock;

      const t = new AnalyticsTracker({ endpoint: '/api/analytics', sessionId: 's4' });
      t.trackUserMessage();
      const data = await t.flush();

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, opts] = fetchMock.mock.calls[0];
      expect(url).toBe('/api/analytics');
      expect(opts.method).toBe('POST');
      expect(JSON.parse(opts.body).session_id).toBe('s4');
      expect(data.metrics.outcome_rate).toBe(0.83);
    });

    it('returns null and never throws when the network fails', async () => {
      globalThis.fetch = vi.fn(() => Promise.reject(new Error('offline')));
      const t = new AnalyticsTracker({ sessionId: 's5' });
      await expect(t.flush()).resolves.toBeNull();
    });

    it('returns null on a non-ok response', async () => {
      globalThis.fetch = vi.fn(() => Promise.resolve({ ok: false }));
      const t = new AnalyticsTracker({ sessionId: 's6' });
      await expect(t.flush()).resolves.toBeNull();
    });
  });
});

describe('analytics_log + METRIC_NAMES', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('emits a greppable metric line', () => {
    analytics_log('outcome_rate', 0.5);
    expect(console.info).toHaveBeenCalledWith(
      expect.stringContaining('metric_name=outcome_rate value=0.5'),
    );
  });

  it('keeps canonical metric names', () => {
    expect(METRIC_NAMES.outcome_rate).toBe('outcome_rate');
    expect(METRIC_NAMES.chat_success_rate).toBe('chat_success_rate');
  });
});
