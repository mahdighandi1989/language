"""End-to-end measurement of the Inspector Bridge error-tracking outcome.

Outcome target (measurable): every user-facing runtime error source must be
captured by the Inspector Bridge error tracker so the real ``error_rate`` is
observable in production instead of silently reading zero. The three sources
that must be covered are:

  1. Uncaught runtime errors        -> window.addEventListener('error', ...)
  2. Unhandled promise rejections   -> window.addEventListener('unhandledrejection', ...)
  3. Firebase / network failures    -> reportError(..., { source: 'firebase' })

Because that behaviour lives in the browser at the window/document boundary,
these tests measure it the same way the other e2e outcome tests in this repo do:
by statically computing a coverage ``outcome_rate`` over the required capture
hooks and asserting it reaches 100%. The rate is logged so it is observable in
CI / production test logs, mirroring how an effectiveness metric is emitted in
production. Each source also has its own focused test so a regression points at
the exact gap (runtime / promise / firebase).

Design note: the tracker reports to the app's own structured logger as
``error_rate`` / ``outcome_rate`` metric lines, NOT to a parent iframe and NOT
over an external WebSocket — the legacy "phone home" Inspector Bridge was removed
on purpose (see tests/test_inspector_bridge_no_iframe.py). These tests therefore
assert the in-app metric sink, not any cross-origin messaging.
"""
from __future__ import annotations

import logging
import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
FRONTEND_SRC = REPO_ROOT / "frontend" / "src"
INSPECTOR_BRIDGE_JS = FRONTEND_SRC / "inspectorBridge.js"
APP_JSX = FRONTEND_SRC / "components" / "App.jsx"
MAIN_JSX = FRONTEND_SRC / "main.jsx"

logger = logging.getLogger(__name__)


def _read(path: Path) -> str:
    return path.read_text(encoding="utf-8") if path.is_file() else ""


# Each capture hook is a (label, predicate) pair. The predicate returns True when
# the corresponding error source is wired into the tracker.
_BRIDGE_SRC = _read(INSPECTOR_BRIDGE_JS)
_APP_SRC = _read(APP_JSX)

_RUNTIME_RE = re.compile(r"addEventListener\(\s*['\"]error['\"]")
_PROMISE_RE = re.compile(r"addEventListener\(\s*['\"]unhandledrejection['\"]")
_FIREBASE_RE = re.compile(r"reportError\([^)]*source:\s*['\"]firebase['\"]")
_METRIC_RE = re.compile(r"metric_name=|logMetric\(|error_rate|outcome_rate")


def _coverage_hooks() -> dict[str, bool]:
    return {
        "runtime_error_listener": bool(_RUNTIME_RE.search(_BRIDGE_SRC)),
        "promise_rejection_listener": bool(_PROMISE_RE.search(_BRIDGE_SRC)),
        "firebase_error_reporting": bool(_FIREBASE_RE.search(_APP_SRC)),
        "error_rate_metric": bool(_METRIC_RE.search(_BRIDGE_SRC)),
    }


def test_error_tracking():
    """The error-tracking outcome_rate over the required capture hooks is 100%."""
    hooks = _coverage_hooks()
    covered = sum(1 for ok in hooks.values() if ok)
    total = len(hooks)
    outcome_rate = covered / total if total else 0.0

    logger.info("outcome_rate (error-tracking coverage): %.2f", outcome_rate)
    print(f"outcome_rate (error-tracking coverage): {outcome_rate:.2f}")

    missing = [name for name, ok in hooks.items() if not ok]
    assert outcome_rate == 1.0, (
        "Inspector Bridge error-tracking outcome not met: "
        f"outcome_rate={outcome_rate:.2f} ({covered}/{total} hooks). "
        f"Missing capture hooks: {missing}"
    )


def test_runtime_error_tracking():
    """Uncaught runtime errors are captured via a window 'error' listener."""
    assert _RUNTIME_RE.search(_BRIDGE_SRC), (
        "frontend/src/inspectorBridge.js must register window.addEventListener"
        "('error', ...) so uncaught runtime errors count toward error_rate"
    )
    # And every captured error funnels through the central reportError sink.
    assert "reportError" in _BRIDGE_SRC


def test_promise_error_tracking():
    """Unhandled promise rejections are captured via 'unhandledrejection'."""
    assert _PROMISE_RE.search(_BRIDGE_SRC), (
        "frontend/src/inspectorBridge.js must register window.addEventListener"
        "('unhandledrejection', ...) so unhandled rejections count toward error_rate"
    )


def test_firebase_error_tracking():
    """Firebase/Firestore failures are reported with source='firebase'."""
    assert _FIREBASE_RE.search(_APP_SRC), (
        "frontend/src/components/App.jsx must call reportError(err, "
        "{ source: 'firebase' }) in its Firebase auth/Firestore catch paths so "
        "Firebase failures count toward error_rate"
    )


def test_tracker_installed_at_entry():
    """The tracker is installed from the app entry so the whole session is covered."""
    main_src = _read(MAIN_JSX)
    assert "installGlobalErrorTracking" in main_src, (
        "frontend/src/main.jsx must call installGlobalErrorTracking() so error "
        "capture starts at the earliest point of the session"
    )


def test_error_reporting_stays_in_app_no_iframe():
    """Errors are reported in-app (metrics/log), never to a parent iframe."""
    assert _METRIC_RE.search(_BRIDGE_SRC), (
        "the tracker must emit an error_rate/outcome_rate metric so the outcome "
        "is observable in production logs"
    )
    assert "window.parent.postMessage" not in _BRIDGE_SRC, (
        "error events must not be posted to a parent iframe — the legacy phone-"
        "home bridge was removed on purpose (see test_inspector_bridge_no_iframe)"
    )
