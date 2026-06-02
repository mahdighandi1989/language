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
SERVER_JS = REPO_ROOT / "backend" / "server.js"


def test_edge_case_scenario():
    """A non-CORS error is not left without a JSON response."""
    source = SERVER_JS.read_text(encoding="utf-8")

    # The conditional CORS handler still exists (we didn't regress it)...
    assert "Not allowed by CORS" in source

    # ...but it is no longer the *only* error middleware: a terminal catch-all
    # follows it, so the "message != CORS sentinel" branch can't fall through.
    error_handlers = [
        m.start() for m in re.finditer(r"\(err, req, res, next\)", source)
    ]
    assert len(error_handlers) >= 2, (
        "anti-pattern not resolved: no terminal handler after the conditional "
        "CORS handler"
    )

    cors_pos = source.index("Not allowed by CORS")
    terminal_pos = error_handlers[-1]
    assert terminal_pos > cors_pos, (
        "terminal error handler must be registered after the CORS handler so "
        "forwarded errors are caught"
    )

    # The terminal handler returns JSON for the general case — uniform shape
    # regardless of error type.
    tail = source[terminal_pos:]
    assert re.search(r"res\.status\([^)]*\)\.json\(", tail), (
        "terminal handler should answer with JSON for any error type"
    )
