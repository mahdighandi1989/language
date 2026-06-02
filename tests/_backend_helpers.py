"""Shared helpers for backend startup tests.

These tests boot the real Express/WebSocket server (backend/server.js) so that a
missing runtime dependency or a broken module wiring is caught in CI rather than
at deploy time. The backend reads its configuration from environment variables
and exits early on an invalid one, so the helpers below supply a syntactically
valid dummy configuration that lets the server reach its listening state without
contacting any external service.
"""
from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
BACKEND_DIR = REPO_ROOT / "backend"

# A key shaped like a real Gemini key (AIza + >=10 url-safe chars) so that
# validateEnv() accepts it. It is not a real credential.
DUMMY_GEMINI_KEY = "AIzaSyDummyKey1234567890abcdefXYZ"


def _have(cmd: str) -> bool:
    return shutil.which(cmd) is not None


def node_available() -> bool:
    return _have("node")


def npm_available() -> bool:
    return _have("npm")


def ensure_node_modules() -> None:
    """Install workspace dependencies if they are not already present.

    Dependencies are hoisted to the repo-root node_modules by npm workspaces, so
    Node resolves backend imports by walking up from backend/ to the root.
    """
    if (REPO_ROOT / "node_modules").is_dir() or (BACKEND_DIR / "node_modules").is_dir():
        return
    subprocess.run(
        ["npm", "install", "--no-audit", "--no-fund"],
        cwd=REPO_ROOT,
        check=True,
        capture_output=True,
        text=True,
        timeout=600,
    )


def boot_backend(timeout: int = 30) -> subprocess.CompletedProcess:
    """Boot backend/server.js with a valid dummy config on an ephemeral port.

    The probe imports server.js, waits briefly for the listen callback, then
    exits 0. Any module-resolution or import-time error surfaces on stderr and a
    non-zero exit code.
    """
    ensure_node_modules()
    probe = (
        "import('./server.js')"
        ".then(() => { setTimeout(() => process.exit(0), 600); })"
        ".catch((e) => { console.error(e && (e.stack || e.message) || e); "
        "process.exit(1); });"
    )
    env = {
        "PATH": __import__("os").environ.get("PATH", ""),
        "GEMINI_API_KEY": DUMMY_GEMINI_KEY,
        "PORT": "0",
        "NODE_ENV": "test",
    }
    return subprocess.run(
        ["node", "--input-type=module", "-e", probe],
        cwd=BACKEND_DIR,
        capture_output=True,
        text=True,
        timeout=timeout,
        env=env,
    )
