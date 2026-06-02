"""Shared helpers for frontend build-system tests.

These tests exercise the real Vite/PostCSS/Tailwind build pipeline so that a
broken build configuration (missing plugin, bad config) is caught in CI rather
than at deploy time.
"""
from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
FRONTEND_DIR = REPO_ROOT / "frontend"
DIST_DIR = FRONTEND_DIR / "dist"


def _have(cmd: str) -> bool:
    return shutil.which(cmd) is not None


def npm_available() -> bool:
    return _have("npm")


def node_available() -> bool:
    return _have("node")


def ensure_node_modules() -> None:
    """Install frontend dependencies if they are not already present."""
    if (FRONTEND_DIR / "node_modules").is_dir():
        return
    subprocess.run(
        ["npm", "install", "--no-audit", "--no-fund"],
        cwd=FRONTEND_DIR,
        check=True,
        capture_output=True,
        text=True,
        timeout=600,
    )


def run_build(timeout: int = 300) -> subprocess.CompletedProcess:
    """Run `npm run build` in the frontend directory and return the result."""
    ensure_node_modules()
    return subprocess.run(
        ["npm", "run", "build"],
        cwd=FRONTEND_DIR,
        capture_output=True,
        text=True,
        timeout=timeout,
    )
