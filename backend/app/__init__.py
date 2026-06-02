"""Backend monitoring & analytics package.

purpose: Houses the cross-cutting observability features of the app — the
notification service that alerts operators about critical events (e.g.
``verify_failed``) and the analytics collector that turns raw conversation
events into product KPIs (chat success rate, average response time, user
engagement rate, conversion rate).

upstream: standalone Python package; depends only on the standard library and
``NOTIFY_*`` environment variables for the (optional) Telegram channel.
downstream: imported by the monitoring/verify jobs and by the end-to-end tests
in ``tests/e2e`` that measure the project's effectiveness outcome.
"""
from __future__ import annotations

__all__ = ["analytics", "notifications"]
