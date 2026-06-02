"""End-to-end measurement of the dependency-consistency outcome.

The effectiveness outcome here is not "a lock file exists" but "dependencies
stay consistent": the committed ``package-lock.json`` must be valid, every
registry-resolved package must be checksum-verifiable, and every workspace
manifest must be represented in the lock. This test turns that into an objective
check by computing the dependency-consistency ``outcome_rate`` (fraction of the
invariants that hold) via :mod:`backend.app.monitoring` and asserting it reaches
100% (``dependency_inconsistency == 0``). The rate is logged so it is observable
in CI/production test logs, mirroring how the metric is emitted in production by
``backend/app/monitoring.py`` and ``frontend/src/utils/logger.js``.
"""
from __future__ import annotations

import importlib.util
import json
import logging
import sys
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent

logger = logging.getLogger(__name__)


def _load_monitoring():
    """Load backend/app/monitoring.py directly from its path (no package config)."""
    spec = importlib.util.spec_from_file_location(
        "app_monitoring", REPO_ROOT / "backend" / "app" / "monitoring.py"
    )
    module = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    sys.modules["app_monitoring"] = module
    spec.loader.exec_module(module)
    return module


monitoring = _load_monitoring()


def test_e2e_outcome():
    """The dependency-consistency outcome is measured AND met (outcome_rate == 1.0).

    This is the end-to-end outcome check the task asks for: it does not assert a
    file/line exists, it measures the effectiveness rate of the dependency
    invariants over the real repo and requires the outcome target (zero
    inconsistency) to be reached.
    """
    metrics = monitoring.check_dependency_consistency(REPO_ROOT)

    # The metric must be produced and observable.
    assert "outcome_rate" in metrics
    assert "dependency_inconsistency" in metrics
    assert metrics["total_checks"] >= 3, "expected at least the 3 core invariants"

    outcome_rate = metrics["outcome_rate"]

    # Emit the metric so the dependency-consistency outcome_rate is observable.
    logger.info("outcome_rate (dependency consistency): %.2f", outcome_rate)
    print(f"outcome_rate (dependency consistency): {outcome_rate:.2f}")

    assert outcome_rate == 1.0, (
        "dependency-consistency outcome not met: "
        f"outcome_rate={outcome_rate:.2f}, failed checks="
        f"{metrics['failed_checks']}"
    )
    assert metrics["dependency_inconsistency"] == 0, (
        "dependency inconsistency detected: "
        f"{metrics['failed_checks']}"
    )


def test_outcome_rate_degrades_on_inconsistency(tmp_path):
    """A broken lock file pushes outcome_rate below 1.0 and raises the
    dependency_inconsistency count — proving the metric actually measures the
    outcome rather than always reporting success."""
    # A repo with a malformed lock file and no workspace manifests.
    (tmp_path / "package-lock.json").write_text("{ not valid json", encoding="utf-8")

    metrics = monitoring.check_dependency_consistency(tmp_path)

    assert metrics["outcome_rate"] < 1.0
    assert metrics["dependency_inconsistency"] > 0
    assert "lockfile_valid_json" in metrics["failed_checks"]


def test_every_resolved_package_has_integrity():
    """Guard the core invariant directly against the real lock file: a
    registry-resolved tarball without an integrity hash is an inconsistency."""
    lock = json.loads((REPO_ROOT / "package-lock.json").read_text(encoding="utf-8"))
    offenders = [
        name
        for name, meta in lock["packages"].items()
        if name
        and not meta.get("link")
        and meta.get("resolved")
        and not meta.get("integrity")
    ]
    assert not offenders, (
        "these locked packages are resolved but have no integrity hash:\n  "
        + "\n  ".join(sorted(offenders))
    )


@pytest.mark.parametrize("workspace", ["backend", "frontend"])
def test_workspace_present_in_lockfile(workspace):
    """Each workspace manifest must be represented in the root lock file."""
    lock = json.loads((REPO_ROOT / "package-lock.json").read_text(encoding="utf-8"))
    assert (REPO_ROOT / workspace / "package.json").is_file()
    assert workspace in lock["packages"], (
        f"workspace {workspace!r} is missing from package-lock.json"
    )
