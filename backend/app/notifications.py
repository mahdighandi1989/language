"""Notification service for critical system events.

purpose: Emit user-facing notifications for critical backend events so an
operator learns about an outage immediately instead of discovering it days
later in the logs. The flagship case is ``verify_failed`` — a critical event
that previously had no notification, meaning a broken verification pipeline
could stay silent indefinitely.

upstream: event producers in the monitoring pipeline (the verify job, the
analytics collector) call :func:`notify_event` / :func:`notify_verify_failed`.
Delivery uses the ``NOTIFY_TELEGRAM_BOT_TOKEN`` and ``NOTIFY_TELEGRAM_CHAT_ID``
environment variables when present.
downstream: when a Telegram channel is configured the message is delivered
there; otherwise it is logged via the ``analytics_log`` logger so the event is
still observable in CI/production logs. Every emitted notification is also
recorded in :data:`SENT_NOTIFICATIONS` so tests can make a synthetic trigger
and assert the notification was produced.
"""
from __future__ import annotations

import logging
import os
import time
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

logger = logging.getLogger("analytics_log.notifications")

# Persian, human-meaningful message templates keyed by event name. Each template
# is formatted with the event context (``**context``) at send time.
EVENT_TEMPLATES: Dict[str, str] = {
    "verify_failed": (
        "❌ هشدار بحرانی: مرحلهٔ راستی‌آزمایی (verify) با شکست مواجه شد.\n"
        "تسک: {task}\n"
        "علت: {reason}\n"
        "زمان: {when}\n"
        "لطفاً هرچه سریع‌تر بررسی کنید — تا رفع مشکل، خروجی سیستم قابل اعتماد نیست."
    ),
    "verify_passed": (
        "✅ راستی‌آزمایی تسک «{task}» با موفقیت انجام شد."
    ),
}

# Priority levels ordered from least to most urgent. ``high`` events are never
# delivered silently regardless of the ``silent`` flag.
PRIORITIES = ("low", "normal", "high")

# Minimum seconds between two notifications of the same event, to avoid spamming
# the channel when a high-frequency event fires repeatedly (see task risk note).
RATE_LIMIT_SECONDS = 60

# In-memory record of what was sent, used by tests and for local introspection.
SENT_NOTIFICATIONS: List["Notification"] = []

# Timestamp of the last notification per event, for rate limiting.
_LAST_SENT: Dict[str, float] = {}


@dataclass
class Notification:
    """A single emitted notification."""

    event: str
    message: str
    priority: str = "normal"
    silent: bool = False
    delivered: bool = False
    context: Dict[str, Any] = field(default_factory=dict)
    created_at: float = field(default_factory=time.time)


def _render(event: str, context: Dict[str, Any]) -> str:
    """Render the Persian template for ``event`` with ``context``."""
    template = EVENT_TEMPLATES.get(event)
    if template is None:
        # Unknown event: still produce a meaningful Persian message.
        return f"رویداد سیستمی: {event} — جزئیات: {context}"
    safe_context = {
        "task": context.get("task", "نامشخص"),
        "reason": context.get("reason", "نامشخص"),
        "when": context.get("when", time.strftime("%Y-%m-%d %H:%M:%S")),
        **context,
    }
    try:
        return template.format(**safe_context)
    except (KeyError, IndexError):
        return template


def _deliver(notification: "Notification") -> bool:
    """Deliver to Telegram when configured; otherwise log. Returns delivered."""
    token = os.environ.get("NOTIFY_TELEGRAM_BOT_TOKEN")
    chat_id = os.environ.get("NOTIFY_TELEGRAM_CHAT_ID")
    if token and chat_id:
        # Real delivery is intentionally lazy-imported so the module has no hard
        # dependency on an HTTP client and stays importable in tests/CI.
        try:  # pragma: no cover - network path exercised only in production
            import json
            import urllib.request

            payload = json.dumps(
                {
                    "chat_id": chat_id,
                    "text": notification.message,
                    "disable_notification": notification.silent,
                }
            ).encode("utf-8")
            req = urllib.request.Request(
                f"https://api.telegram.org/bot{token}/sendMessage",
                data=payload,
                headers={"Content-Type": "application/json"},
            )
            urllib.request.urlopen(req, timeout=10)
            return True
        except Exception:  # pragma: no cover - never let alerting crash callers
            logger.exception("Failed to deliver Telegram notification for %s", notification.event)
            return False
    # No channel configured: log so the event is still observable.
    log_level = logging.ERROR if notification.priority == "high" else logging.INFO
    logger.log(log_level, "[notify:%s/%s] %s", notification.event, notification.priority, notification.message)
    return False


def notify_event(
    event: str,
    context: Optional[Dict[str, Any]] = None,
    *,
    silent: bool = False,
    priority: str = "normal",
) -> Optional["Notification"]:
    """Emit a notification for ``event``.

    Returns the :class:`Notification` that was produced, or ``None`` when the
    event was suppressed by rate limiting. ``high`` priority events are forced
    non-silent so a critical alert is never delivered quietly.
    """
    if priority not in PRIORITIES:
        priority = "normal"

    now = time.time()
    last = _LAST_SENT.get(event)
    if last is not None and (now - last) < RATE_LIMIT_SECONDS and priority != "high":
        # Suppress duplicate non-critical events within the rate-limit window.
        return None

    context = dict(context or {})
    message = _render(event, context)
    effective_silent = silent and priority != "high"

    notification = Notification(
        event=event,
        message=message,
        priority=priority,
        silent=effective_silent,
        context=context,
    )
    notification.delivered = _deliver(notification)

    _LAST_SENT[event] = now
    SENT_NOTIFICATIONS.append(notification)
    return notification


def notify_verify_failed(
    task: str,
    reason: str,
    *,
    when: Optional[str] = None,
) -> Optional["Notification"]:
    """Notify that the critical ``verify_failed`` event occurred.

    This is the dedicated entry point producers call at the point of failure in
    the verification pipeline. The underlying critical event is always delivered
    loudly (``silent=False``) at ``priority="high"``.
    """
    context = {"task": task, "reason": reason}
    if when is not None:
        context["when"] = when
    return notify_event("verify_failed", context, silent=False, priority="high")
