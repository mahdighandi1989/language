"""Global fixtures shared across the project test suite.

The application under test is the Node/Express backend in backend/. These
fixtures expose it to Python tests without requiring a real Gemini credential or
any network access:

* ``app``             - metadata about the backend app (paths, dummy env).
* ``client``          - a thin client that boots backend/server.js on an
                        ephemeral port and yields a probe result, or skips when
                        Node is unavailable.
* ``mock_gemini_api`` - patches GEMINI_API_KEY with a dummy key so code paths
                        that require it can run offline.
"""
from __future__ import annotations

import os
import shutil
import subprocess
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[1]
BACKEND_DIR = REPO_ROOT / "backend"

# Shaped like a real Gemini key so validateEnv() accepts it; not a real secret.
DUMMY_GEMINI_API_KEY = "AIzaSyDummyKey1234567890abcdefXYZ"


@pytest.fixture
def mock_gemini_api(monkeypatch):
    """Patch GEMINI_API_KEY with a dummy value for the duration of a test."""
    monkeypatch.setenv("GEMINI_API_KEY", DUMMY_GEMINI_API_KEY)
    return DUMMY_GEMINI_API_KEY


@pytest.fixture
def app():
    """Describe the backend application under test (no process started)."""
    return {
        "root": REPO_ROOT,
        "backend_dir": BACKEND_DIR,
        "entrypoint": BACKEND_DIR / "server.js",
        "env": {
            "GEMINI_API_KEY": DUMMY_GEMINI_API_KEY,
            "PORT": "0",
            "NODE_ENV": "test",
        },
    }


@pytest.fixture
def client(app):
    """Boot backend/server.js with a dummy config and return the probe result.

    Skips the test cleanly when Node is not installed so the suite stays green
    in minimal environments.
    """
    if shutil.which("node") is None:
        pytest.skip("node is not installed")

    probe = (
        "import('./server.js')"
        ".then(() => { setTimeout(() => process.exit(0), 600); })"
        ".catch((e) => { console.error(e && (e.stack || e.message) || e); "
        "process.exit(1); });"
    )
    env = {
        "PATH": os.environ.get("PATH", ""),
        **app["env"],
    }
    return subprocess.run(
        ["node", "--input-type=module", "-e", probe],
        cwd=app["backend_dir"],
        capture_output=True,
        text=True,
        timeout=30,
        env=env,
    )
