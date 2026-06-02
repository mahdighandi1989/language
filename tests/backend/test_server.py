"""Backend startup verification — no module-resolution failures.

Acceptance criterion (consolidated task ``task_2c28ca0737f1`` / sub-task
"رفع عدم تطابق وابستگی‌های backend/package.json"): running ``node backend/server``
must boot the server without ``MODULE_NOT_FOUND`` / ``Cannot find module``
errors. The original bug was that ``backend/server.js`` imported packages
(``multer``, ``fluent-ffmpeg``, ``ffmpeg-static``, ``pdf-parse``) that were not
declared in ``backend/package.json``, so the process crashed at import time.

This test boots the real Express + WebSocket entrypoint with a syntactically
valid dummy configuration (no real Gemini credential, no network) and asserts it
reaches its listening state with a clean exit and no module-resolution error on
either stream. It reuses the shared backend boot helper so the probe stays
identical to the rest of the startup suite.
"""
from __future__ import annotations

import pytest

from _backend_helpers import boot_backend, node_available


@pytest.mark.skipif(not node_available(), reason="node is not installed")
def test_server_starts_without_module_not_found_errors():
    result = boot_backend(timeout=45)
    combined = f"{result.stdout}\n{result.stderr}"

    assert "Cannot find module" not in combined, (
        "Backend failed to resolve a module on startup.\n"
        f"STDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}"
    )
    assert "MODULE_NOT_FOUND" not in combined, (
        "Backend reported MODULE_NOT_FOUND on startup.\n"
        f"STDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}"
    )
    assert result.returncode == 0, (
        f"Backend exited non-zero ({result.returncode}) on startup.\n"
        f"STDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}"
    )
    assert "Server running on port" in result.stdout, (
        "Server did not reach its listening state.\n"
        f"STDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}"
    )
