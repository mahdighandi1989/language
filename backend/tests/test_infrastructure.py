"""Smoke tests that verify the pytest infrastructure itself is wired up.

These keep `cd backend && python -m pytest` green even before feature-specific
suites are added, and confirm the conftest fixtures resolve.
"""
from __future__ import annotations

import os
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]


def test_pytest_is_configured():
    assert (BACKEND_DIR / "pytest.ini").is_file()
    assert (BACKEND_DIR / "requirements.txt").is_file()


def test_backend_entrypoint_exists():
    assert (BACKEND_DIR / "server.js").is_file()
    assert (BACKEND_DIR / "package.json").is_file()


def test_mock_gemini_api_key_fixture(mock_gemini_api_key):
    assert os.environ["GEMINI_API_KEY"] == mock_gemini_api_key
    assert mock_gemini_api_key.startswith("AIza")
