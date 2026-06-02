"""Behavioural test for the credential-free audio processing endpoint.

``POST /api/audio/process`` confirms that the ffmpeg-backed audio pipeline
(``fluent-ffmpeg`` + ``ffmpeg-static``, the runtime deps declared in
``backend/package.json``) is wired and works. With no uploaded file it returns a
deterministic 200 readiness snapshot under the stable ``{status, result}``
contract, so the check needs no Gemini credential and no external service.
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
# real credential. The audio endpoint does not use it, but the server exits
# early on an invalid configuration, so a syntactically valid value is required.
DUMMY_GEMINI_KEY = "AIzaSyDummyKey1234567890abcdefXYZ"


def _node_available() -> bool:
    return shutil.which("node") is not None


def _free_port() -> int:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(("127.0.0.1", 0))
    port = s.getsockname()[1]
    s.close()
    return port


@pytest.mark.skipif(not _node_available(), reason="node is not installed")
def test_audio_process_endpoint_works():
    """POST /api/audio/process returns 200 with {status, result}."""
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
                conn.request("POST", "/api/audio/process")
                resp = conn.getresponse()
                status = resp.status
                body = resp.read().decode("utf-8", "replace")
                conn.close()
                break
            except (ConnectionRefusedError, OSError) as exc:
                last_err = exc
                time.sleep(0.4)

        assert status == 200, (
            "POST /api/audio/process did not return 200 "
            f"(status={status}, last connection error={last_err}, "
            f"process exited={proc.poll()})."
        )
        payload = json.loads(body)
        assert "status" in payload and "result" in payload, (
            f"response missing required fields: {body!r}"
        )
        assert payload["status"] == "ok", f"unexpected status: {payload!r}"
        assert payload["result"].get("ffmpegAvailable") is True, (
            f"ffmpeg should be available via ffmpeg-static: {payload!r}"
        )
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=10)
        except subprocess.TimeoutExpired:
            proc.kill()
            proc.wait(timeout=10)
