"""Firebase ID token verification on the backend Gemini endpoints.

The backend (Node/Express) protects its API with Firebase ID token
verification: middleware/firebaseAuth.js initialises the Firebase Admin SDK and
calls admin.auth().verifyIdToken() to validate a caller's Bearer token, and
routes/index.js wires that guard onto the /api/gemini/* endpoints.

These tests verify that contract at the source level, so they are deterministic
and do not require a running Node server, installed node_modules, or any real
Firebase credential. The companion api_response acceptance criterion exercises
the live 401 behaviour against a booted server.
"""
from __future__ import annotations

import re
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
FIREBASE_AUTH = BACKEND_DIR / "middleware" / "firebaseAuth.js"
ROUTES = BACKEND_DIR / "routes" / "index.js"


def _read(path: Path) -> str:
    assert path.is_file(), f"expected file is missing: {path}"
    return path.read_text(encoding="utf-8")


def test_verify_id_token_on_gemini_endpoints():
    """Every /api/gemini/* route must be guarded by Firebase ID token auth.

    The guard middleware (requireAuth / optionalAuth) is responsible for
    validating the Firebase ID token; a route with no guard would accept
    unauthenticated requests, so the test fails if any /api/gemini/* route is
    missing one.
    """
    auth_src = _read(FIREBASE_AUTH)

    # The auth middleware must actually verify Firebase ID tokens (not just
    # check for a token's presence) and reject missing/invalid tokens with 401.
    assert "verifyIdToken" in auth_src, (
        "firebaseAuth.js must verify Firebase ID tokens via admin.auth().verifyIdToken()"
    )
    assert "admin.auth()" in auth_src, (
        "firebaseAuth.js must use the Firebase Admin SDK to verify tokens"
    )
    assert re.search(r"requireAuth", auth_src), "requireAuth guard must be defined"
    assert re.search(r"status\(401\)", auth_src), (
        "the auth guard must respond 401 when a token is missing or invalid"
    )

    routes_src = _read(ROUTES)
    guard_names = ("requireAuth", "optionalAuth")
    assert any(g in routes_src for g in guard_names), (
        "routes/index.js must import a Firebase auth guard"
    )

    # Find every router registration whose path is under /api/gemini/ and assert
    # the middleware chain for that route includes an auth guard.
    route_calls = re.findall(
        r"apiRouter\.\w+\(\s*'(/api/gemini/[^']+)'([^;]*)\)",
        routes_src,
        flags=re.DOTALL,
    )
    gemini_routes = [path for path, _ in route_calls]
    assert gemini_routes, "expected at least one /api/gemini/* route to be registered"

    unguarded = [
        path
        for path, chain in route_calls
        if not any(g in chain for g in guard_names)
    ]
    assert not unguarded, (
        "these /api/gemini/* routes are missing a Firebase auth guard "
        f"(requireAuth/optionalAuth): {unguarded}"
    )


def test_unauthenticated_gemini_status_is_rejected():
    """GET /api/gemini/status must use the hard requireAuth guard (401 path).

    Mirrors the api_response acceptance criterion: an unauthenticated request to
    /api/gemini/status returns 401. requireAuth returns 401 whenever a valid
    Bearer token is absent.
    """
    routes_src = _read(ROUTES)
    match = re.search(
        r"apiRouter\.get\(\s*'/api/gemini/status'([^;]*)\)",
        routes_src,
        flags=re.DOTALL,
    )
    assert match, "GET /api/gemini/status route must be registered"
    assert "requireAuth" in match.group(1), (
        "GET /api/gemini/status must be protected by the hard requireAuth guard "
        "so unauthenticated requests get 401"
    )

    auth_src = _read(FIREBASE_AUTH)
    # requireAuth must short-circuit with 401 when no Bearer token is supplied.
    require_auth_block = re.search(
        r"export async function requireAuth\([^)]*\)\s*{(.*?)\n}",
        auth_src,
        flags=re.DOTALL,
    )
    assert require_auth_block, "requireAuth must be an exported async function"
    body = require_auth_block.group(1)
    assert "status(401)" in body, (
        "requireAuth must return 401 when the Firebase ID token is missing/invalid"
    )
