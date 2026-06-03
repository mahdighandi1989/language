"""Oversight edge-case tests for the resolved Inspector Bridge anti-pattern.

Background
----------
The legacy *Inspector Bridge* tracking script was injected inline into
``frontend/index.html`` and, on every page, branched on::

    const isInIframe = window !== window.parent;

It then unconditionally streamed click/scroll/input/focus events plus the page
URL to ``window.parent.postMessage(..., '*')`` and opened an external socket —
*even when the page was not inside an iframe* (``isInIframe === false``). In
that case ``window.parent === window``, so the messages were meaningless noise
(or threw under a cross-origin parent) and the external connection was pure
overhead. That over/under-engineered edge is the anti-pattern this task tracks.

The resolution removed the inline script entirely (the strongest possible form
of "skip when there is no iframe"). The only surviving bridge,
``frontend/src/components/InspectorBridge.jsx``, does NO cross-origin
messaging and opens NO external socket — it merely validates AI-issued commands
that arrive over the browser's own ``postMessage`` channel.

These tests assert that no-iframe edge statically, because the behaviour lives
at the page/document boundary rather than behind a code path a unit test could
drive. They are referenced by the task's ``backend_test`` verify plan as
``tests/test_oversight.py::test_no_iframe_skip``.
"""
from __future__ import annotations

import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
FRONTEND_DIR = REPO_ROOT / "frontend"
INDEX_HTML = FRONTEND_DIR / "index.html"
INSPECTOR_BRIDGE = FRONTEND_DIR / "src" / "components" / "InspectorBridge.jsx"

# Signatures of the removed tracking script: branching on iframe state, posting
# to a parent window, dialing an external socket, and the noisy debug logging it
# emitted on every event. None of these should survive in the entry document,
# regardless of iframe state.
_PARENT_POST_RE = re.compile(r"window\.parent\s*\.\s*postMessage")
_WSS_RE = re.compile(r"wss?://")
_CONSOLE_LOG_RE = re.compile(r"console\.log")


def test_no_iframe_skip():
    """No-iframe edge: the entry HTML must not phone a parent or socket home.

    When the page is opened directly (not embedded), ``window.parent === window``
    and the legacy script's per-event ``window.parent.postMessage`` calls were
    meaningless. The fix is that the entry document carries no such tracking at
    all, so the no-iframe case is skipped by construction.
    """
    html = INDEX_HTML.read_text(encoding="utf-8")

    assert not _PARENT_POST_RE.search(html), (
        "frontend/index.html still posts to window.parent — in the no-iframe "
        "edge (window.parent === window) that re-emits meaningless messages."
    )
    assert "isInIframe" not in html, (
        "frontend/index.html still branches on isInIframe — the legacy Inspector "
        "Bridge tracking script (which mishandled the no-iframe edge) should be "
        "gone entirely."
    )
    assert not _WSS_RE.search(html), (
        "frontend/index.html still references a wss:// endpoint — the external "
        "tracking connection should have been removed."
    )
    assert not _CONSOLE_LOG_RE.search(html), (
        "frontend/index.html still contains console.log — the removed tracking "
        "script's production debug logging should not have come back."
    )


def test_surviving_bridge_does_not_phone_home():
    """The replacement bridge component does no cross-origin / external I/O.

    Removing the inline script must not have pushed the same anti-pattern into
    the React component. The surviving bridge listens only on the browser's own
    ``postMessage`` channel and never opens an external socket nor blindly posts
    to a parent frame.
    """
    bridge = INSPECTOR_BRIDGE.read_text(encoding="utf-8")

    # The safe replacement is still present (we did not delete the guards).
    assert "handleCommand" in bridge
    assert "isValidSelector" in bridge
    assert "isValidUrl" in bridge

    # ...but it must not actually open a socket nor post to a parent window,
    # which is exactly what made the old script misbehave outside an iframe.
    # (A doc comment may *mention* the removed wss:// connection; what matters is
    # that no live `new WebSocket(...)` call survives.)
    assert "new WebSocket" not in bridge, (
        "InspectorBridge.jsx opens a WebSocket — the bridge must not open an "
        "external tracking socket."
    )
    assert not _PARENT_POST_RE.search(bridge), (
        "InspectorBridge.jsx posts to window.parent — the bridge must not phone "
        "home to a parent frame."
    )
