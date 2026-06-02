"""End-to-end check that the project's frontend builds without error.

This guards the security fix that removed the Inspector Bridge scripts: after
removing code from index.html / main.jsx / App.jsx the production build must
still succeed and emit a clean dist/.
"""
from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[2]
FRONTEND_DIR = REPO_ROOT / "frontend"
DIST_DIR = FRONTEND_DIR / "dist"


def _npm_available() -> bool:
    return shutil.which("npm") is not None


def _ensure_node_modules() -> None:
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


@pytest.mark.skipif(not _npm_available(), reason="npm is not installed")
def test_project_build_succeeds():
    _ensure_node_modules()
    result = subprocess.run(
        ["npm", "run", "build"],
        cwd=FRONTEND_DIR,
        capture_output=True,
        text=True,
        timeout=300,
    )
    assert result.returncode == 0, (
        f"`npm run build` failed (exit {result.returncode}).\n"
        f"STDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}"
    )
    assert (DIST_DIR / "index.html").is_file(), "build did not produce dist/index.html"

    # The removed Inspector Bridge must not reappear in the production bundle.
    leaked = []
    for path in DIST_DIR.rglob("*"):
        if path.suffix in {".html", ".js"} and path.is_file():
            text = path.read_text(encoding="utf-8", errors="ignore")
            if "inspector-bridge" in text or "window.parent.postMessage" in text:
                leaked.append(path.name)
    assert not leaked, f"Inspector Bridge tracking code leaked into build: {leaked}"
