"""Product analytics & KPI collection.

purpose: Turn raw conversation/interaction events into the product KPIs that
measure real effectiveness — not just technical health (error_rate, warn_count,
info_count) but whether users are actually succeeding: chat success rate,
average response time, user engagement rate, and conversion rate. These are
aggregated into a single ``outcome_rate`` so the project's outcome is
observable in production logs.

upstream: backend request handlers and the frontend (via the
``POST /api/analytics`` endpoint) feed events into :class:`AnalyticsCollector`.
downstream: :meth:`AnalyticsCollector.outcome` produces the metrics dict logged
through the ``analytics_log`` logger; the end-to-end test
``tests/e2e/test_outcome_metrics.py`` consumes these to assert the outcome is
measured.
"""
from __future__ import annotations

import logging
from collections import deque
from dataclasses import dataclass, field
from typing import Any, Deque, Dict, List, Optional

# Dedicated logger so analytics lines are greppable/parseable in production.
analytics_log = logging.getLogger("analytics_log")

# Canonical metric names. Keeping them in one place avoids typos diverging the
# log key from the dashboard query.
METRIC_NAMES = {
    "chat_success_rate": "chat_success_rate",
    "avg_response_time": "avg_response_time",
    "user_engagement_rate": "user_engagement_rate",
    "conversion_rate": "conversion_rate",
    "outcome_rate": "outcome_rate",
}

# Conversation is considered "successful" when it has at least this many
# assistant turns (i.e. the user engaged in a real back-and-forth, not a bounce).
SUCCESS_MIN_ASSISTANT_TURNS = 2

# A user "engaged" when their session contains at least this many user messages.
ENGAGEMENT_MIN_USER_MESSAGES = 2


@dataclass
class ConversationEvent:
    """A single tracked conversation/session.

    Fields are intentionally simple so both the backend and the frontend
    tracker can produce them from a JSON payload.
    """

    session_id: str
    user_messages: int = 0
    assistant_messages: int = 0
    response_times_ms: List[float] = field(default_factory=list)
    converted: bool = False  # e.g. clicked a suggested lesson / completed a goal
    extra: Dict[str, Any] = field(default_factory=dict)

    @property
    def successful(self) -> bool:
        return self.assistant_messages >= SUCCESS_MIN_ASSISTANT_TURNS

    @property
    def engaged(self) -> bool:
        return self.user_messages >= ENGAGEMENT_MIN_USER_MESSAGES


class AnalyticsCollector:
    """Accumulates conversation events and computes product KPIs.

    The collector keeps a bounded window of recent events so memory stays flat
    in a long-running process while still giving a representative rate.
    """

    def __init__(self, window: int = 1000) -> None:
        self._events: Deque[ConversationEvent] = deque(maxlen=window)

    # -- ingestion -------------------------------------------------------
    def record(self, event: ConversationEvent) -> None:
        self._events.append(event)

    def record_payload(self, payload: Dict[str, Any]) -> ConversationEvent:
        """Build and record an event from a (JSON-ish) payload dict."""
        event = ConversationEvent(
            session_id=str(payload.get("session_id", "anonymous")),
            user_messages=int(payload.get("user_messages", 0)),
            assistant_messages=int(payload.get("assistant_messages", 0)),
            response_times_ms=[float(x) for x in payload.get("response_times_ms", [])],
            converted=bool(payload.get("converted", False)),
            extra=dict(payload.get("extra", {})),
        )
        self.record(event)
        return event

    def reset(self) -> None:
        self._events.clear()

    @property
    def total(self) -> int:
        return len(self._events)

    # -- individual KPIs -------------------------------------------------
    def chat_success_rate(self) -> float:
        """Fraction of conversations that reached a real back-and-forth."""
        if not self._events:
            return 0.0
        return sum(1 for e in self._events if e.successful) / len(self._events)

    def avg_response_time(self) -> float:
        """Average assistant response time in milliseconds across all turns."""
        samples = [t for e in self._events for t in e.response_times_ms]
        if not samples:
            return 0.0
        return sum(samples) / len(samples)

    def user_engagement_rate(self) -> float:
        """Fraction of sessions where the user sent multiple messages."""
        if not self._events:
            return 0.0
        return sum(1 for e in self._events if e.engaged) / len(self._events)

    def conversion_rate(self) -> float:
        """Fraction of sessions that completed a desired goal (conversion)."""
        if not self._events:
            return 0.0
        return sum(1 for e in self._events if e.converted) / len(self._events)

    # -- aggregate outcome ----------------------------------------------
    def outcome_rate(self) -> float:
        """Blend the product KPIs into a single effectiveness score in [0, 1].

        Response time is normalised to a 0–1 "speed" score (faster is better,
        clamped at a 5s ceiling) so it can be averaged with the rate metrics.
        With no data the outcome is undefined-as-zero (a clean baseline rather
        than an inflated score from an empty-but-"fast" response time).
        """
        if not self._events:
            return 0.0
        speed_score = max(0.0, 1.0 - min(self.avg_response_time(), 5000.0) / 5000.0)
        components = [
            self.chat_success_rate(),
            self.user_engagement_rate(),
            self.conversion_rate(),
            speed_score,
        ]
        return sum(components) / len(components)

    def outcome(self) -> Dict[str, Any]:
        """Return all KPIs as a metrics dict and log them for observability."""
        metrics = {
            METRIC_NAMES["chat_success_rate"]: round(self.chat_success_rate(), 4),
            METRIC_NAMES["avg_response_time"]: round(self.avg_response_time(), 2),
            METRIC_NAMES["user_engagement_rate"]: round(self.user_engagement_rate(), 4),
            METRIC_NAMES["conversion_rate"]: round(self.conversion_rate(), 4),
            METRIC_NAMES["outcome_rate"]: round(self.outcome_rate(), 4),
            "sample_size": self.total,
        }
        log_metrics(metrics)
        return metrics


def log_metrics(metrics: Dict[str, Any]) -> None:
    """Emit each KPI on its own line so log parsers can extract metric_name=value."""
    for metric_name, value in metrics.items():
        analytics_log.info("metric_name=%s value=%s", metric_name, value)


# Module-level singleton used by the backend request path. Tests construct their
# own :class:`AnalyticsCollector` for isolation.
collector = AnalyticsCollector()


def record_event(payload: Dict[str, Any]) -> ConversationEvent:
    """Convenience wrapper recording into the shared module-level collector."""
    return collector.record_payload(payload)


def current_outcome() -> Dict[str, Any]:
    """Return (and log) the current outcome metrics from the shared collector."""
    return collector.outcome()
