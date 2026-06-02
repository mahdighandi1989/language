"""Edge-case test for the resolved 'over-engineering / broken edge' anti-pattern.

The anti-pattern: an inline "Inspector Bridge" tracking script in
``frontend/index.html`` unconditionally posted page events to ``window.parent``
and opened an external ``wss://`` connection — even when the page was opened
directly (``isInIframe === false``), where ``window.parent === window`` and the
posts are meaningless noise (or throw under a cross-origin parent). The fix
removed the inline script entirely; the only remaining bridge,
``src/components/InspectorBridge.jsx``, does NO cross-origin messaging and opens
NO external socket.

The edge this guards: when the page is NOT inside an iframe, nothing should
attempt to message a parent window or phone home. We assert that statically
because that behaviour lives at the page/document boundary, not behind a code
path a unit test can drive.
"""
from __future__ import annotations

import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
FRONTEND_DIR = REPO_ROOT / "frontend"
INDEX_HTML = FRONTEND_DIR / "index.html"
INSPECTOR_BRIDGE = FRONTEND_DIR / "src" / "components" / "InspectorBridge.jsx"

# Patterns that characterise the removed tracking script: posting to a parent
# window and dialing an external socket. None of these should survive in the
# entry document, regardless of iframe state.
_PARENT_POST_RE = re.compile(r"window\.parent\s*\.\s*postMessage")
_WSS_RE = re.compile(r"wss?://")


def test_entry_html_has_no_iframe_parent_messaging():
    """The HTML shell must not post to window.parent or open an external socket."""
    html = INDEX_HTML.read_text(encoding="utf-8")

    assert not _PARENT_POST_RE.search(html), (
        "frontend/index.html still posts to window.parent — the no-iframe edge "
        "(window.parent === window) would emit meaningless messages again."
    )
    assert "isInIframe" not in html, (
        "frontend/index.html still branches on isInIframe — the legacy Inspector "
        "Bridge tracking script should be gone entirely."
    )
    assert not _WSS_RE.search(html), (
        "frontend/index.html still references a wss:// endpoint — the external "
        "tracking connection should have been removed."
    )


def test_inspector_bridge_component_does_not_phone_home():
    """The surviving bridge component does no cross-origin / external messaging."""
    bridge = INSPECTOR_BRIDGE.read_text(encoding="utf-8")

    # The guard helpers should exist (we didn't delete the safe replacement)...
    assert "handleCommand" in bridge

    # ...but it must not post to a parent window or open an external socket,
    # which is exactly what made the old script misbehave outside an iframe.
    assert not _PARENT_POST_RE.search(bridge), (
        "InspectorBridge.jsx must not post to window.parent."
    )
    assert "new WebSocket(" not in bridge, (
        "InspectorBridge.jsx must not open its own external WebSocket; commands "
        "arrive over the app's existing Live Voice channel."
    )
