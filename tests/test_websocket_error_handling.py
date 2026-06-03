"""Tests for WebSocket error handling in the backend.

Background: ``backend/server.js`` created the ``WebSocketServer`` without an
``'error'`` listener, so a server-level WebSocket failure (a failed upgrade or
an unexpected handshake response) would surface as an unhandled 'error' event
and crash the Node process. The per-connection proxy in
``services/liveProxyService.js`` handled the paired Gemini socket's ``'error'``
and ``'close'`` events but not ``'unexpected-response'``, so a non-101 handshake
(e.g. a 401 from a bad API key) reached the client only as a generic socket
error with no HTTP status.

These tests assert the WebSocket error paths are now handled.
"""
from __future__ import annotations

from pathlib import Path

import pytest

from _backend_helpers import boot_backend, node_available

REPO_ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = REPO_ROOT / "backend"
SERVER_JS = BACKEND_DIR / "server.js"
LIVE_PROXY_JS = BACKEND_DIR / "services" / "liveProxyService.js"
LIVE_WS_OBSERVER_JS = BACKEND_DIR / "services" / "liveWsObserver.js"


def test_ws_server_has_error_handler():
    """The WebSocketServer registers an 'error' listener so a server-level
    failure is logged (and redacted) instead of crashing the process.

    After the layered refactor the lifecycle/metrics observer — including the
    server-level ``wss.on('error')`` listener — lives in
    services/liveWsObserver.js, and server.js wires it via
    ``attachLiveWsObserver(wss)``."""
    observer = LIVE_WS_OBSERVER_JS.read_text(encoding="utf-8")
    assert "wss.on('error'" in observer, (
        "WebSocketServer must register an 'error' handler so server-level "
        "WebSocket failures do not crash the Node process"
    )
    # The logged error must be redacted so secrets never leak into logs.
    assert "redactSensitiveData" in observer

    # server.js must actually attach the observer to its WebSocketServer.
    server = SERVER_JS.read_text(encoding="utf-8")
    assert "attachLiveWsObserver(wss)" in server, (
        "server.js must wire the Live WS observer so the 'error' handler is "
        "registered on the running WebSocketServer"
    )


def test_gemini_socket_handles_unexpected_response():
    """The upstream Gemini socket handles 'unexpected-response' so a non-101
    handshake is relayed to the client with its HTTP status."""
    source = LIVE_PROXY_JS.read_text(encoding="utf-8")
    assert "unexpected-response" in source, (
        "the Gemini Live socket must handle 'unexpected-response' to surface a "
        "failed handshake (e.g. a bad API key) with an actionable message"
    )
    # The existing per-connection error/close handlers must remain in place.
    assert "geminiWs.on('error'" in source
    assert "geminiWs.on('close'" in source
    assert "clientWs.on('error'" in source


@pytest.mark.skipif(not node_available(), reason="node is not installed")
def test_server_still_boots_with_ws_error_handler():
    """Adding the WebSocket error handlers must not break server startup."""
    result = boot_backend(timeout=30)
    assert result.returncode == 0, (
        f"Server failed to start (exit {result.returncode}).\n"
        f"STDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}"
    )
    assert "Server running on port" in result.stdout
