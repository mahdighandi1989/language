"""Backend dependency / startup smoke tests.

Guards the runtime dependencies declared in backend/package.json (notably
fluent-ffmpeg, ffmpeg-static and multer, which power audio/file processing): if
any imported package is missing, Node fails to resolve the module and the server
never boots.
"""
from __future__ import annotations

import pytest

from _backend_helpers import boot_backend, node_available


@pytest.mark.skipif(not node_available(), reason="node is not installed")
def test_no_module_not_found_errors():
    result = boot_backend(timeout=30)
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
