"""End-to-end measurement of the product effectiveness outcome.

The project's effectiveness outcome is no longer "the code runs" but "users
actually succeed": the system must expose product KPIs — chat success rate,
average response time, user engagement rate and conversion rate — blended into a
single ``outcome_rate``. This test feeds a synthetic batch of conversation
sessions through the analytics collector and asserts every KPI is computed, the
``outcome_rate`` is observable, and a synthetic ``verify_failed`` trigger
produces a high-priority, non-silent Persian notification.

It mirrors how the metric would be emitted in production (logged via the
``analytics_log`` logger) so the outcome is regression-guarded in CI.
"""
from __future__ import annotations

import importlib.util
import logging
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]

logger = logging.getLogger(__name__)


def _load(module_name: str, rel_path: str):
    """Load a module directly from its file path (no package config needed)."""
    spec = importlib.util.spec_from_file_location(module_name, REPO_ROOT / rel_path)
    module = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    # Register before exec so @dataclass (which looks the module up in
    # sys.modules to resolve annotations) works for file-loaded modules.
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    return module


analytics = _load("app_analytics", "backend/app/analytics.py")
notifications = _load("app_notifications", "backend/app/notifications.py")


def _synthetic_sessions():
    """A representative batch: some successful/engaged/converted, some bounces."""
    return [
        # Engaged, successful, fast, converted.
        {"session_id": "a", "user_messages": 4, "assistant_messages": 4,
         "response_times_ms": [800, 900, 1100], "converted": True},
        # Engaged, successful, slower, not converted.
        {"session_id": "b", "user_messages": 3, "assistant_messages": 3,
         "response_times_ms": [1500, 1700], "converted": False},
        # Bounce: one message, no real back-and-forth.
        {"session_id": "c", "user_messages": 1, "assistant_messages": 1,
         "response_times_ms": [600], "converted": False},
        # Engaged, successful, converted.
        {"session_id": "d", "user_messages": 5, "assistant_messages": 4,
         "response_times_ms": [700, 750, 800, 950], "converted": True},
    ]


def test_outcome_metrics_collected():
    collector = analytics.AnalyticsCollector()
    for payload in _synthetic_sessions():
        collector.record_payload(payload)

    metrics = collector.outcome()

    # All four product KPIs plus the blended outcome_rate must be present.
    for key in (
        "chat_success_rate",
        "avg_response_time",
        "user_engagement_rate",
        "conversion_rate",
        "outcome_rate",
    ):
        assert key in metrics, f"missing KPI: {key}"

    # 3 of 4 sessions reached >=2 assistant turns -> success rate 0.75.
    assert metrics["chat_success_rate"] == 0.75
    # 3 of 4 sessions had >=2 user messages -> engagement 0.75.
    assert metrics["user_engagement_rate"] == 0.75
    # 2 of 4 sessions converted -> conversion 0.5.
    assert metrics["conversion_rate"] == 0.5
    # Average response time is positive and within the synthetic range.
    assert 0 < metrics["avg_response_time"] < 5000
    # The blended outcome is a real fraction in (0, 1).
    assert 0.0 < metrics["outcome_rate"] < 1.0
    assert metrics["sample_size"] == 4

    # The outcome is observable in logs (production parity).
    logger.info("outcome_rate (product effectiveness): %.4f", metrics["outcome_rate"])
    print(f"outcome_rate (product effectiveness): {metrics['outcome_rate']:.4f}")


def test_outcome_rate_zero_when_no_data():
    """With no sessions every KPI is 0 (no division-by-zero, defined baseline)."""
    collector = analytics.AnalyticsCollector()
    metrics = collector.outcome()
    assert metrics["outcome_rate"] == 0.0
    assert metrics["sample_size"] == 0


def test_verify_failed_notification_triggered():
    """Synthetic trigger of the critical verify_failed event produces a loud,
    high-priority Persian notification (AC for the notification sub-task)."""
    notifications.SENT_NOTIFICATIONS.clear()
    notifications._LAST_SENT.clear()

    note = notifications.notify_verify_failed(
        task="task_demo", reason="۲ مورد از معیارهای پذیرش رد شد"
    )

    assert note is not None
    assert note.event == "verify_failed"
    assert note.priority == "high"
    assert note.silent is False
    # The message is Persian and meaningful (mentions the failure + the task).
    assert "راستی‌آزمایی" in note.message
    assert "task_demo" in note.message
    assert note in notifications.SENT_NOTIFICATIONS


def test_high_priority_notification_never_silent():
    """Even if a caller asks for silent delivery, a high-priority alert is loud."""
    notifications.SENT_NOTIFICATIONS.clear()
    notifications._LAST_SENT.clear()

    note = notifications.notify_event(
        "verify_failed",
        {"task": "t", "reason": "r"},
        silent=True,
        priority="high",
    )
    assert note is not None
    assert note.silent is False
