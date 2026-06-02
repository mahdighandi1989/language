"""Smoke tests that verify the pytest infrastructure itself is wired up.

These keep `cd backend && python -m pytest` green even before feature-specific
suites are added, and confirm the conftest fixtures resolve. They also assert
the infrastructure contract (config files, test tree, gitignore entries) so the
"pytest infrastructure is correctly set up" claim is self-verifying.
"""
from __future__ import annotations

import os
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
REPO_ROOT = BACKEND_DIR.parent


def test_pytest_is_configured():
    assert (BACKEND_DIR / "pytest.ini").is_file()
    assert (BACKEND_DIR / "requirements.txt").is_file()


def test_requirements_declare_pytest_tooling():
    requirements = (BACKEND_DIR / "requirements.txt").read_text(encoding="utf-8")
    for package in ("pytest", "pytest-cov", "pytest-mock"):
        assert package in requirements, f"{package} missing from requirements.txt"


def test_pytest_ini_points_testpaths_at_tests():
    config = (BACKEND_DIR / "pytest.ini").read_text(encoding="utf-8")
    assert "testpaths = tests" in config


def test_backend_entrypoint_exists():
    assert (BACKEND_DIR / "server.js").is_file()
    assert (BACKEND_DIR / "package.json").is_file()


def test_tests_package_is_importable():
    assert (BACKEND_DIR / "tests" / "__init__.py").is_file()
    assert (BACKEND_DIR / "tests" / "conftest.py").is_file()


def test_repo_test_tree_is_present():
    tests_dir = REPO_ROOT / "tests"
    assert (tests_dir / "__init__.py").is_file()
    assert (tests_dir / "conftest.py").is_file()
    assert (tests_dir / "unit" / "__init__.py").is_file()
    assert (tests_dir / "integration" / "__init__.py").is_file()


def test_gitignore_excludes_pytest_artifacts():
    gitignore = (REPO_ROOT / ".gitignore").read_text(encoding="utf-8")
    assert "__pycache__" in gitignore
    assert ".pytest_cache" in gitignore


def test_mock_gemini_api_key_fixture(mock_gemini_api_key):
    assert os.environ["GEMINI_API_KEY"] == mock_gemini_api_key
    assert mock_gemini_api_key.startswith("AIza")


def test_gemini_env_fixture_provides_full_dummy_env(gemini_env):
    assert gemini_env["GEMINI_API_KEY"].startswith("AIza")
    assert gemini_env["NODE_ENV"] == "test"
    assert os.environ["GEMINI_API_KEY"] == gemini_env["GEMINI_API_KEY"]
