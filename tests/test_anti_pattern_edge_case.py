"""Edge-case test for the resolved 'conditional inconsistency' anti-pattern.

The anti-pattern: error-handling middleware that only acts on one condition
(``err.message === 'Not allowed by CORS'``) and forwards every other error,
with nothing downstream to catch it — so the response shape depended on which
branch an error happened to hit. The fix adds a terminal handler so every
error, regardless of type, ends in a uniform JSON response.

This test guards the edge that originally broke: an error whose message is NOT
the CORS sentinel must still be caught and answered as JSON.
"""
from __future__ import annotations

import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = REPO_ROOT / "backend"
SERVER_JS = BACKEND_DIR / "server.js"
SECURITY_JS = BACKEND_DIR / "middleware" / "security.js"
FALLBACK_JS = BACKEND_DIR / "controllers" / "fallbackController.js"


def test_edge_case_scenario():
    """A non-CORS error is not left without a JSON response."""
    # After the layered refactor the conditional CORS handler lives in
    # middleware/security.js and the terminal catch-all lives in
    # controllers/fallbackController.js (mounted by mountFallbacks). server.js is
    # now pure wiring and registers no handler body of its own.
    security = SECURITY_JS.read_text(encoding="utf-8")
    fallback = FALLBACK_JS.read_text(encoding="utf-8")
    server = SERVER_JS.read_text(encoding="utf-8")

    # The conditional CORS handler still exists (we didn't regress it)...
    assert "Not allowed by CORS" in security

    # ...but it is no longer the *only* error middleware: a terminal catch-all
    # in fallbackController.js follows it, so the "message != CORS sentinel"
    # branch can't fall through. The CORS handler is itself an
    # (err, req, res, next) middleware, and fallbackController registers another
    # one as the terminal handler.
    assert "(err, req, res, next)" in security, (
        "CORS error middleware should remain an (err, req, res, next) handler"
    )
    error_handlers = [
        m.start() for m in re.finditer(r"\(err, req, res, next\)", fallback)
    ]
    assert len(error_handlers) >= 1, (
        "anti-pattern not resolved: no terminal handler in fallbackController.js"
    )

    # server.js installs the security middleware (which registers the CORS
    # handler) before it mounts the fallback layer (which registers the terminal
    # handler), so forwarded errors are caught downstream.
    security_pos = server.index("applySecurity")
    fallback_mount_pos = server.index("mountFallbacks")
    assert fallback_mount_pos > security_pos, (
        "terminal error handler (mountFallbacks) must be registered after the "
        "security/CORS middleware so forwarded errors are caught"
    )

    # The terminal handler returns JSON for the general case — uniform shape
    # regardless of error type.
    terminal_pos = error_handlers[-1]
    tail = fallback[terminal_pos:]
    assert re.search(r"res\.status\([^)]*\)\.json\(", tail), (
        "terminal handler should answer with JSON for any error type"
    )
