"""Import-graph integrity test for the App.jsx component extraction.

After ``frontend/src/App.jsx`` was split into a thin orchestrator that
re-exports ``frontend/src/components/App.jsx`` (which in turn composes the
providers in ``frontend/src/contexts/`` and mounts
``frontend/src/components/InspectorBridge.jsx``), this test proves the whole
module graph still resolves and the application builds without error.

A production ``vite build`` resolves every import reachable from
``frontend/src/main.jsx``, so a broken, missing or renamed import anywhere in
the extracted tree fails the build — and therefore this test. This is the
behavioural equivalent of "the app runs without error".

The test is self-contained (it does not import the repo-level helpers) so it
keeps working regardless of how the nested ``tests/frontend`` package is
collected.
"""
from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[2]
FRONTEND_DIR = REPO_ROOT / "frontend"
SRC_DIR = FRONTEND_DIR / "src"
DIST_DIR = FRONTEND_DIR / "dist"


def _have(cmd: str) -> bool:
    return shutil.which(cmd) is not None


def _ensure_node_modules() -> None:
    """Install dependencies if neither the root nor the frontend tree has them.

    npm workspaces hoist dependencies to the repo-root ``node_modules``, so a
    present root tree is enough for Vite to resolve the frontend imports.
    """
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


@pytest.mark.skipif(not _have("npm"), reason="npm is not installed")
def test_imports():
    # The thin orchestrator and every extracted module it pulls in must exist.
    assert (SRC_DIR / "App.jsx").is_file(), "src/App.jsx orchestrator is missing"
    assert (SRC_DIR / "components" / "App.jsx").is_file(), (
        "the real root component was not moved to src/components/App.jsx"
    )
    assert (SRC_DIR / "contexts" / "ExecutionFlowContext.jsx").is_file(), (
        "ExecutionFlowContext was not extracted to src/contexts/"
    )
    assert (SRC_DIR / "contexts" / "LiveChatContext.jsx").is_file(), (
        "LiveChatContext was not extracted to src/contexts/"
    )
    assert (SRC_DIR / "components" / "InspectorBridge.jsx").is_file(), (
        "InspectorBridge was not extracted to its own component"
    )

    # The entry point must import the relocated component, not the old flat path.
    main_src = (SRC_DIR / "main.jsx").read_text(encoding="utf-8")
    assert "./components/App" in main_src, (
        "main.jsx still imports the pre-refactor './App' path"
    )

    # A real build resolves the entire import graph reachable from main.jsx.
    _ensure_node_modules()
    result = subprocess.run(
        ["npm", "run", "build"],
        cwd=FRONTEND_DIR,
        capture_output=True,
        text=True,
        timeout=180,
    )
    assert result.returncode == 0, (
        "frontend build failed — an import in the extracted module tree does "
        f"not resolve.\nSTDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}"
    )
    assert (DIST_DIR / "index.html").is_file(), "build did not produce dist/index.html"
