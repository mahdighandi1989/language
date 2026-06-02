"""Validation tests for ``render.yaml`` (Render.com deployment config).

``render.yaml`` carries no application logic, but it is the source of truth for
how the app is built and started on Render.com and which environment variables
the service expects. A malformed structure, a missing build/start command, or a
dropped ``GEMINI_API_KEY`` entry would surface only as a failed deploy. These
tests pin the structural invariants so such breakage is caught in CI instead.
"""
from __future__ import annotations

from pathlib import Path

import pytest

yaml = pytest.importorskip("yaml", reason="PyYAML is required to parse render.yaml")

REPO_ROOT = Path(__file__).resolve().parent.parent
RENDER_YAML = REPO_ROOT / "render.yaml"


def _load_render_config() -> dict:
    # Parsing here doubles as the YAML-validity check: a malformed file raises
    # yaml.YAMLError and fails the suite.
    return yaml.safe_load(RENDER_YAML.read_text(encoding="utf-8"))


def _web_service(config: dict) -> dict:
    services = config["services"]
    web = [s for s in services if s.get("type") == "web"]
    assert web, "render.yaml defines no 'web' service"
    return web[0]


def test_render_yaml_exists():
    assert RENDER_YAML.is_file(), f"expected deployment config at {RENDER_YAML}"


def test_render_yaml_is_valid_structure():
    """The file parses as YAML and exposes the expected top-level shape."""
    config = _load_render_config()
    assert isinstance(config, dict), "render.yaml must parse to a mapping"
    assert isinstance(config.get("services"), list) and config["services"], (
        "render.yaml must define a non-empty 'services' list"
    )
    service = _web_service(config)
    assert service.get("name"), "web service must declare a 'name'"
    assert service.get("runtime") == "node", (
        f"expected node runtime, got {service.get('runtime')!r}"
    )


def test_build_and_start_commands_defined():
    """Render needs both a build and a start command to deploy the service."""
    service = _web_service(_load_render_config())
    build = service.get("buildCommand")
    start = service.get("startCommand")
    assert isinstance(build, str) and build.strip(), (
        "web service must define a non-empty 'buildCommand'"
    )
    assert isinstance(start, str) and start.strip(), (
        "web service must define a non-empty 'startCommand'"
    )


def test_env_vars_include_gemini_api_key():
    """GEMINI_API_KEY must be declared so the deploy prompts for/syncs it."""
    service = _web_service(_load_render_config())
    env_vars = service.get("envVars")
    assert isinstance(env_vars, list) and env_vars, (
        "web service must declare an 'envVars' list"
    )
    keys = {e.get("key") for e in env_vars if isinstance(e, dict)}
    assert "GEMINI_API_KEY" in keys, (
        "render.yaml envVars must include GEMINI_API_KEY; "
        f"found keys: {sorted(k for k in keys if k)}"
    )
    gemini = next(e for e in env_vars if e.get("key") == "GEMINI_API_KEY")
    assert gemini.get("sync") is False, (
        "GEMINI_API_KEY is a secret and must use 'sync: false' so it is set "
        "in the dashboard rather than committed"
    )
