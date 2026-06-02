"""Repo-root pytest configuration.

The tests/ directory is a package (it ships __init__.py files), but several test
modules import sibling helpers by bare name (e.g. ``from _backend_helpers import
boot_backend``). Keeping tests/ on sys.path lets those imports resolve no matter
which import mode pytest picks.
"""
from __future__ import annotations

import sys
from pathlib import Path

_TESTS_DIR = Path(__file__).resolve().parent / "tests"
if _TESTS_DIR.is_dir():
    sys.path.insert(0, str(_TESTS_DIR))
