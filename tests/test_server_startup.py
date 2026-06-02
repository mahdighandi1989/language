"""Server startup test for the refactored backend.

After backend/server.js was split into config/middleware/routes/controllers/
services modules, this test confirms the slimmed-down entrypoint still wires
everything together and the HTTP + WebSocket server reaches its listening state
without error.
"""
from __future__ import annotations

import pytest

from _backend_helpers import boot_backend, node_available


@pytest.mark.skipif(not node_available(), reason="node is not installed")
def test_server_starts():
    result = boot_backend(timeout=30)
    assert result.returncode == 0, (
        f"Server failed to start (exit {result.returncode}).\n"
        f"STDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}"
    )
    assert "Server running on port" in result.stdout, (
        "Server did not reach its listening state.\n"
        f"STDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}"
    )
