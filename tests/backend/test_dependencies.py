"""Backend dependency-installation verification.

Acceptance criterion (consolidated task ``task_2c28ca0737f1`` / sub-task
"رفع عدم تطابق وابستگی‌های backend/package.json"): running ``npm install`` for
the backend must complete without errors. The original failure was a mismatch
between ``backend/package.json`` and the modules imported by the backend
(``multer``, ``fluent-ffmpeg``, ``ffmpeg-static``, ``pdf-parse`` were missing),
which made dependency installation / runtime resolution fail.

This module turns that criterion into an objective check: it actually runs
``npm install`` against the real repo (npm workspaces hoist ``backend`` and
``frontend`` deps to the repo-root ``node_modules``) and asserts the command
exits 0 with no ``npm error`` lines. It also guards that every module the
backend imports is declared as a dependency, so the manifest can never silently
drift from the code again.
"""
from __future__ import annotations

import json
import re
import shutil
import subprocess
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = REPO_ROOT / "backend"


def _npm_available() -> bool:
    return shutil.which("npm") is not None


@pytest.mark.skipif(not _npm_available(), reason="npm is not installed")
def test_npm_install_completes_without_errors():
    """``npm install`` for the backend completes successfully.

    Run at the repo root because the backend is an npm workspace, so its
    dependencies are installed/hoisted from there. A missing or mismatched
    dependency surfaces as a non-zero exit code and an ``npm error`` line.
    """
    result = subprocess.run(
        ["npm", "install", "--no-audit", "--no-fund"],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        timeout=600,
    )
    combined = f"{result.stdout}\n{result.stderr}"
    assert result.returncode == 0, (
        f"npm install failed (exit {result.returncode}).\n"
        f"STDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}"
    )
    # `npm warn` (deprecations) is fine; `npm error` is not.
    assert "npm error" not in combined, (
        "npm install reported an error.\n"
        f"STDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}"
    )


def test_backend_imports_are_declared_dependencies():
    """Every bare module imported by the backend is a declared dependency.

    This is the root-cause guard for the original bug: the manifest must stay in
    sync with the imports so installation/runtime never hits MODULE_NOT_FOUND.
    Node built-ins and relative imports are ignored; only external packages are
    checked against ``backend/package.json`` dependencies.
    """
    pkg = json.loads((BACKEND_DIR / "package.json").read_text(encoding="utf-8"))
    declared = set(pkg.get("dependencies", {})) | set(pkg.get("devDependencies", {}))

    node_builtins = {
        "http", "https", "fs", "os", "path", "url", "crypto", "stream",
        "util", "events", "child_process", "buffer", "zlib", "net", "tls",
        "dns", "assert", "querystring", "string_decoder", "timers",
    }

    import_re = re.compile(
        r"""(?:import[^'"]*from\s*|import\s*|require\(\s*)['"]([^'".][^'"]*)['"]""",
    )

    missing: dict[str, str] = {}
    for js_file in BACKEND_DIR.rglob("*.js"):
        if "node_modules" in js_file.parts:
            continue
        text = js_file.read_text(encoding="utf-8")
        for spec in import_re.findall(text):
            if spec.startswith((".", "/", "node:")):
                continue
            # Bare specifier: take the package name (handle scoped @scope/name).
            parts = spec.split("/")
            name = "/".join(parts[:2]) if spec.startswith("@") else parts[0]
            if name in node_builtins:
                continue
            if name not in declared:
                missing.setdefault(name, str(js_file.relative_to(REPO_ROOT)))

    assert not missing, (
        "these imported packages are not declared in backend/package.json "
        "dependencies:\n  "
        + "\n  ".join(f"{name}  (first seen in {src})" for name, src in sorted(missing.items()))
    )
