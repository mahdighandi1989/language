"""Backend auth tests for the protected /api/gemini/* endpoints.

The backend protects /api/gemini/status with Firebase ID token verification:
unauthenticated requests must receive 401. These tests boot the real Express
server with a dummy (well-formed) Gemini key and assert the auth behavior.
"""
from __future__ import annotations

import os
import shutil
import socket
import subprocess
import time
import urllib.error
import urllib.request
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[1]
BACKEND_DIR = REPO_ROOT / "backend"
SERVER_JS = BACKEND_DIR / "server.js"


def _have(cmd: str) -> bool:
    return shutil.which(cmd) is not None


def _free_port() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def _ensure_node_modules() -> None:
    if (BACKEND_DIR / "node_modules").is_dir():
        return
    subprocess.run(
        ["npm", "install", "--no-audit", "--no-fund"],
        cwd=BACKEND_DIR,
        check=True,
        capture_output=True,
        text=True,
        timeout=600,
    )


def _wait_for_health(base_url: str, timeout: float = 20.0) -> bool:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(f"{base_url}/api/health", timeout=2) as resp:
                if resp.status == 200:
                    return True
        except (urllib.error.URLError, ConnectionError, OSError):
            time.sleep(0.4)
    return False


def _status_code(url: str, headers: dict | None = None) -> int:
    req = urllib.request.Request(url, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            return resp.status
    except urllib.error.HTTPError as exc:
        return exc.code


@pytest.fixture(scope="module")
def server():
    if not _have("node") or not _have("npm"):
        pytest.skip("node/npm not available")
    _ensure_node_modules()

    port = _free_port()
    env = dict(os.environ)
    env["GEMINI_API_KEY"] = "AIzaSyDummyTestKey1234567890abcdef"
    env["PORT"] = str(port)
    # Intentionally leave FIREBASE_PROJECT_ID unset so verification cannot
    # succeed; the guard must still reject unauthenticated requests with 401.
    env.pop("FIREBASE_PROJECT_ID", None)

    proc = subprocess.Popen(
        ["node", str(SERVER_JS)],
        cwd=BACKEND_DIR,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )
    base_url = f"http://127.0.0.1:{port}"
    try:
        if not _wait_for_health(base_url):
            proc.terminate()
            out = proc.stdout.read() if proc.stdout else ""
            pytest.fail(f"backend server did not become healthy.\n{out}")
        yield base_url
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=10)
        except subprocess.TimeoutExpired:
            proc.kill()


def test_verify_id_token_on_gemini_endpoints(server):
    # No Authorization header -> 401
    assert _status_code(f"{server}/api/gemini/status") == 401
    # Malformed bearer token -> still 401
    assert (
        _status_code(
            f"{server}/api/gemini/status",
            headers={"Authorization": "Bearer not-a-real-token"},
        )
        == 401
    )


def test_health_is_public(server):
    assert _status_code(f"{server}/api/health") == 200
