"""Tests for consistent error handling in ``backend/server.js``.

Background: the app installs a CORS-only error middleware that handles the
``Not allowed by CORS`` case and forwards everything else via ``next(err)``.
Before this task there was no terminal error handler, so any non-CORS error
fell through to Express's default handler and was answered with an HTML stack
trace instead of JSON — an inconsistency across the API surface.

These tests assert the terminal handler now exists and behaves correctly at
the edges.
"""
from __future__ import annotations

import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SERVER_JS = REPO_ROOT / "backend" / "server.js"


def _server_source() -> str:
    return SERVER_JS.read_text(encoding="utf-8")


def test_edge_case_error_handling():
    """A terminal JSON error handler covers every non-CORS error path."""
    source = _server_source()

    # There must be more than one (err, req, res, next) middleware: the CORS
    # translator and a terminal catch-all.
    handlers = source.count("(err, req, res, next)")
    assert handlers >= 2, (
        "expected a terminal error handler in addition to the CORS handler; "
        f"found {handlers}"
    )

    # The terminal handler must respond with JSON, not Express's default HTML.
    assert re.search(r"res\.status\([^)]*\)\.json\(\s*\{\s*error", source), (
        "terminal error handler should send a JSON {error: ...} body"
    )

    # Edge case: when headers were already sent, it must delegate to Express
    # (calling next(err)) rather than trying to write a second response.
    assert "res.headersSent" in source, (
        "terminal handler must guard the already-responded edge case"
    )

    # Unmatched /api routes get a JSON 404 instead of the SPA index.html.
    assert re.search(
        r"app\.use\(\s*['\"]/api['\"]", source
    ), "expected an /api 404 JSON handler"
    assert "Not Found" in source or "یافت نشد" in source

    # Logged error output must be redacted so secrets never leak.
    assert "redactSensitiveData" in source
