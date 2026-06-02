"""Dev-server check: the backend (started by the root ``npm run dev``) serves
the built frontend SPA.

The root ``package.json`` defines ``dev`` as ``npm run dev --workspace backend``
which runs ``node --watch server.js``. ``backend/server.js`` serves the compiled
frontend from ``../frontend/dist`` via ``express.static`` and the SPA fallback.
This test builds the frontend, boots the server (using ``node server.js`` — the
same entry point ``npm run dev`` runs, without the file watcher) and confirms
the root document is served, i.e. the frontend is wired up correctly behind the
backend dev server.
"""
from __future__ import annotations

import http.client
import os
import shutil
import socket
import subprocess
import time
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[1]
BACKEND_DIR = REPO_ROOT / "backend"
FRONTEND_DIR = REPO_ROOT / "frontend"
DIST_DIR = FRONTEND_DIR / "dist"

DUMMY_GEMINI_KEY = "AIzaSyDummyKey1234567890abcdefXYZ"


def _have(cmd: str) -> bool:
    return shutil.which(cmd) is not None


def _free_port() -> int:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(("127.0.0.1", 0))
    port = s.getsockname()[1]
    s.close()
    return port


def _ensure_node_modules() -> None:
    if (REPO_ROOT / "node_modules").is_dir() or (FRONTEND_DIR / "node_modules").is_dir():
        return
    subprocess.run(
        ["npm", "install", "--no-audit", "--no-fund"],
        cwd=REPO_ROOT,
        check=True,
        capture_output=True,
        text=True,
        timeout=600,
    )


def _build_frontend() -> None:
    _ensure_node_modules()
    result = subprocess.run(
        ["npm", "run", "build"],
        cwd=FRONTEND_DIR,
        capture_output=True,
        text=True,
        timeout=180,
    )
    assert result.returncode == 0, (
        f"frontend build failed.\nSTDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}"
    )


@pytest.mark.skipif(not _have("npm") or not _have("node"), reason="node/npm not installed")
def test_dev_server():
    _build_frontend()
    assert (DIST_DIR / "index.html").is_file(), "build did not produce dist/index.html"

    port = _free_port()
    env = {
        "PATH": os.environ.get("PATH", ""),
        "GEMINI_API_KEY": DUMMY_GEMINI_KEY,
        "PORT": str(port),
        "NODE_ENV": "test",
    }
    proc = subprocess.Popen(
        ["node", "server.js"],
        cwd=BACKEND_DIR,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )
    try:
        status = None
        body = ""
        last_err = None
        deadline = time.time() + 25
        while time.time() < deadline:
            if proc.poll() is not None:
                break
            try:
                conn = http.client.HTTPConnection("127.0.0.1", port, timeout=2)
                conn.request("GET", "/")
                resp = conn.getresponse()
                status = resp.status
                body = resp.read().decode("utf-8", "replace")
                conn.close()
                break
            except (ConnectionRefusedError, OSError) as exc:
                last_err = exc
                time.sleep(0.4)

        assert status == 200, (
            "the dev server did not serve the SPA root document "
            f"(status={status}, last connection error={last_err}, "
            f"process exited={proc.poll()})."
        )
        assert 'id="root"' in body or "<!doctype html" in body.lower(), (
            f"served document does not look like the SPA shell: {body[:200]!r}"
        )
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=10)
        except subprocess.TimeoutExpired:
            proc.kill()
            proc.wait(timeout=10)
