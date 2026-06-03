"""Ground-truth contract for the ai_llm backend's app-level error handling.

purpose: Document and pin down the resolution of the *conditional inconsistency*
anti-pattern in the Express error-handling middleware. The Node implementation
lives in ``backend/server.js`` (wiring) and
``backend/controllers/fallbackController.js`` (the terminal handler); this module
is the Python-side ground-truth mirror — the same convention used by the other
``backend/app/*.py`` contract modules (analytics, monitoring, notifications,
ai_llm/pipeline). It carries no runtime logic for the Node server; it records
the agreed contract so the inconsistency cannot silently drift back.

upstream: ``backend/middleware/security.js`` (the conditional CORS error
translator) and ``backend/server.js`` (which calls ``applySecurity`` then
``mountFallbacks``).
downstream: the edge-case tests ``tests/test_error_handling.py`` and
``tests/test_anti_pattern_edge_case.py`` assert the Node side matches this
contract.

----------------------------------------------------------------------------
Anti-pattern justification (conditional inconsistency, error_handling_middleware)
----------------------------------------------------------------------------
The original error middleware acted on a single condition
(``err.message === 'Not allowed by CORS'``) and forwarded every other error with
nothing downstream to catch it, so the response shape depended on which branch an
error hit — a conditional inconsistency. The fix registers a terminal catch-all
``error_handling_middleware`` at the **app level** (after ``applySecurity`` so it
covers every route) that answers any forwarded error with a uniform JSON body and
guards the ``res.headersSent`` edge. This is the justification for the chosen
ground truth: the implementation (uniform terminal handler) is authoritative, and
the structured contract below is aligned to it.
"""
from __future__ import annotations

# Ground-truth contract for the app-level terminal error handler. The Node
# implementation must agree with every field here.
ERROR_HANDLING_CONTRACT = {
    # The terminal handler is mounted at app level (covers all routes), after
    # the security/CORS middleware, so no error branch can fall through.
    "scope": "app level",
    # Registration order invariant: applySecurity (CORS translator) is wired
    # before mountFallbacks (terminal error_handling_middleware).
    "registered_after": "applySecurity",
    "registered_by": "mountFallbacks",
    # Every forwarded error — regardless of message — ends in a uniform JSON
    # body. This is what resolves the conditional inconsistency.
    "uniform_response": "json",
    "default_status": 500,
    # The already-responded edge: delegate to Express via next(err) instead of
    # writing a second response.
    "headers_sent_guard": "res.headersSent",
    # Logged error output is redacted so secrets never leak.
    "redactor": "redactSensitiveData",
}

# Number of (err, req, res, next) middlewares the resolved design requires: the
# conditional CORS translator plus the terminal catch-all.
EXPECTED_ERROR_MIDDLEWARES = 2

__all__ = ["ERROR_HANDLING_CONTRACT", "EXPECTED_ERROR_MIDDLEWARES"]
