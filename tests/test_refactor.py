"""End-to-end checks for the layered backend refactor.

``backend/server.js`` was split from a single ~1400-line file into
config/middleware/routes/controllers/services/models/utils modules. These
tests confirm three things the static grep checks cannot:

* ``test_endpoints_work`` boots the real server and issues an HTTP request to
  ``/api/health`` so we know the reassembled route → controller → service wiring
  actually serves requests (i.e. "every previous endpoint still works").
* ``test_upload_endpoint_returns_file_handle`` boots the server and POSTs to
  ``/api/upload`` (no credential, no body), asserting the credential-free intake
  endpoint answers 200 with the stable ``{ fileId, message }`` contract.
* ``test_layered_structure`` asserts the entry point is now a slim wiring file
  and that the expected layer directories exist and are populated.
"""
from __future__ import annotations

import http.client
import json
import os
import shutil
import socket
import subprocess
import time
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[1]
BACKEND_DIR = REPO_ROOT / "backend"

# Shaped like a real Gemini key so config/env.js validation accepts it; not a
# real credential. /api/health does not use it but the server exits early on an
# invalid configuration, so a syntactically valid value is required to boot.
DUMMY_GEMINI_KEY = "AIzaSyDummyKey1234567890abcdefXYZ"


def _node_available() -> bool:
    return shutil.which("node") is not None


def _free_port() -> int:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(("127.0.0.1", 0))
    port = s.getsockname()[1]
    s.close()
    return port


def _start_server(port: int) -> subprocess.Popen:
    """Boot backend/server.js on ``port`` with a valid dummy configuration."""
    env = {
        "PATH": os.environ.get("PATH", ""),
        "GEMINI_API_KEY": DUMMY_GEMINI_KEY,
        "PORT": str(port),
        "NODE_ENV": "test",
    }
    return subprocess.Popen(
        ["node", "server.js"],
        cwd=BACKEND_DIR,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
    )


def _stop_server(proc: subprocess.Popen) -> None:
    proc.terminate()
    try:
        proc.wait(timeout=10)
    except subprocess.TimeoutExpired:
        proc.kill()
        proc.wait(timeout=10)


@pytest.mark.skipif(not _node_available(), reason="node is not installed")
def test_endpoints_work():
    """The refactored server boots and answers a real request on /api/health."""
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
                conn.request("GET", "/api/health")
                resp = conn.getresponse()
                status = resp.status
                body = resp.read().decode("utf-8", "replace")
                conn.close()
                break
            except (ConnectionRefusedError, OSError) as exc:
                last_err = exc
                time.sleep(0.4)

        assert status == 200, (
            "GET /api/health did not return 200 after the refactor "
            f"(status={status}, last connection error={last_err}, "
            f"process exited={proc.poll()})."
        )
        assert '"status"' in body and "ok" in body, (
            f"/api/health returned an unexpected body: {body!r}"
        )
    finally:
        _stop_server(proc)


@pytest.mark.skipif(not _node_available(), reason="node is not installed")
def test_upload_endpoint_returns_file_handle():
    """POST /api/upload answers 200 with the { fileId, message } contract.

    The credential-free intake endpoint must respond even with no body (no
    multipart file, no Gemini key), returning a JSON object that carries both a
    ``fileId`` handle and a human-readable ``message`` — the api_response
    acceptance criterion for the layered backend.
    """
    port = _free_port()
    proc = _start_server(port)
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
                conn.request("POST", "/api/upload")
                resp = conn.getresponse()
                status = resp.status
                body = resp.read().decode("utf-8", "replace")
                conn.close()
                break
            except (ConnectionRefusedError, OSError) as exc:
                last_err = exc
                time.sleep(0.4)

        assert status == 200, (
            "POST /api/upload did not return 200 "
            f"(status={status}, last connection error={last_err}, "
            f"process exited={proc.poll()})."
        )
        payload = json.loads(body)
        assert payload.get("fileId"), f"/api/upload response missing fileId: {body!r}"
        assert payload.get("message"), f"/api/upload response missing message: {body!r}"
    finally:
        _stop_server(proc)


def test_layered_structure():
    """server.js is a slim wiring file and the layer directories are populated."""
    server_src = (BACKEND_DIR / "server.js").read_text(encoding="utf-8")
    # The entry point must pull its pieces from the extracted layers rather than
    # defining route handlers and business logic inline.
    assert "./routes/index.js" in server_src, "server.js no longer mounts the router"
    assert "apiRouter" in server_src, "server.js does not use the extracted apiRouter"
    assert server_src.count("\n") < 250, (
        "server.js is still large; it should only contain wiring after the refactor"
    )

    expected_dirs = [
        "controllers",
        "models",
        "services",
        "routes",
        "middleware",
        "utils",
        "config",
    ]
    for name in expected_dirs:
        layer = BACKEND_DIR / name
        assert layer.is_dir(), f"expected backend/{name}/ to exist"
        assert any(layer.glob("*.js")), f"backend/{name}/ has no modules"
