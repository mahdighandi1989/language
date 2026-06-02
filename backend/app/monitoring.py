"""Dependency-consistency monitoring & metric emission.

purpose: Turn the project's dependency-consistency outcome target ("reduce
dependency-inconsistency errors to zero") into a measurable, observable signal.
This module inspects the committed ``package-lock.json`` against the workspace
``package.json`` manifests, computes a single ``outcome_rate`` (fraction of
consistency invariants that hold) plus a ``dependency_inconsistency`` count, and
logs each metric on its own line so it is greppable in CI/production logs.

upstream: the repo's ``package-lock.json`` and the workspace ``package.json``
files (root + ``backend`` + ``frontend``); mirrors the CI/CD ``npm ci`` /
``npm audit`` dependency check.
downstream: the end-to-end test
``tests/test_dependency_consistency.py::test_e2e_outcome`` consumes
:func:`check_dependency_consistency` to assert the outcome is measured and the
``outcome_rate`` reaches 100%. The frontend mirror lives in
``frontend/src/utils/logger.js``.
"""
from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any, Dict, List

# Dedicated logger so dependency-monitoring lines are greppable/parseable in
# production the same way analytics_log lines are (metric_name=<name> value=<v>).
monitoring_log = logging.getLogger("monitoring_log")

# Canonical metric names. Keeping them in one place avoids a log key drifting
# from the dashboard/alert query that reads it.
METRIC_NAMES = {
    "outcome_rate": "outcome_rate",
    "dependency_inconsistency": "dependency_inconsistency",
}

# Repo root: backend/app/monitoring.py -> parents[2] is the repo root.
_REPO_ROOT = Path(__file__).resolve().parents[2]

# Workspaces that must each be represented in the root lock file.
_WORKSPACES = ("backend", "frontend")


def _load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def check_dependency_consistency(repo_root: Path | None = None) -> Dict[str, Any]:
    """Evaluate the dependency-consistency invariants and return a metrics dict.

    The invariants (each contributes equally to ``outcome_rate``):

    1. ``package-lock.json`` exists and is valid JSON (lockfileVersion + a
       non-empty ``packages`` map).
    2. Every registry-resolved package in the lock carries an ``integrity`` hash
       (so installs are checksum-verifiable — no unverifiable tarballs).
    3. Each workspace ``package.json`` is represented in the lock file.

    ``dependency_inconsistency`` is the number of invariants that FAILED, so the
    outcome target ("errors to zero") maps directly to
    ``dependency_inconsistency == 0`` / ``outcome_rate == 1.0``.
    """
    root = Path(repo_root) if repo_root is not None else _REPO_ROOT
    lockfile = root / "package-lock.json"

    checks: Dict[str, bool] = {}
    failures: List[str] = []

    # --- Invariant 1: lock file is valid JSON with the expected shape. -------
    lock_data: Dict[str, Any] | None = None
    try:
        lock_data = _load_json(lockfile)
        lock_valid = (
            isinstance(lock_data, dict)
            and lock_data.get("lockfileVersion") is not None
            and isinstance(lock_data.get("packages"), dict)
            and bool(lock_data["packages"])
        )
    except (OSError, ValueError):
        lock_valid = False
    checks["lockfile_valid_json"] = lock_valid
    if not lock_valid:
        failures.append("lockfile_valid_json")

    # --- Invariant 2: every resolved package has an integrity hash. ---------
    integrity_ok = True
    if lock_valid and lock_data is not None:
        for name, meta in lock_data["packages"].items():
            if not name or not isinstance(meta, dict) or meta.get("link"):
                # Workspace roots / linked workspaces resolve from disk, not the
                # registry, and legitimately have no integrity hash.
                continue
            if meta.get("resolved") and not meta.get("integrity"):
                integrity_ok = False
                break
    else:
        integrity_ok = False
    checks["all_resolved_have_integrity"] = integrity_ok
    if not integrity_ok:
        failures.append("all_resolved_have_integrity")

    # --- Invariant 3: each workspace package.json is in the lock file. -------
    workspaces_ok = True
    if lock_valid and lock_data is not None:
        lock_packages = lock_data["packages"]
        for ws in _WORKSPACES:
            manifest = root / ws / "package.json"
            if not manifest.is_file() or ws not in lock_packages:
                workspaces_ok = False
                break
    else:
        workspaces_ok = False
    checks["workspaces_represented_in_lock"] = workspaces_ok
    if not workspaces_ok:
        failures.append("workspaces_represented_in_lock")

    total = len(checks)
    consistent = sum(1 for ok in checks.values() if ok)
    outcome_rate = consistent / total if total else 0.0

    metrics: Dict[str, Any] = {
        METRIC_NAMES["outcome_rate"]: round(outcome_rate, 4),
        METRIC_NAMES["dependency_inconsistency"]: len(failures),
        "checks": checks,
        "failed_checks": failures,
        "total_checks": total,
    }
    log_metrics(metrics)
    return metrics


def log_metrics(metrics: Dict[str, Any]) -> None:
    """Emit the scalar metrics on their own lines so log parsers can extract
    ``metric_name=<name> value=<value>`` (dicts/lists are skipped for clarity)."""
    for metric_name, value in metrics.items():
        if isinstance(value, (dict, list)):
            continue
        monitoring_log.info("metric_name=%s value=%s", metric_name, value)


def current_dependency_outcome() -> Dict[str, Any]:
    """Return (and log) the current dependency-consistency outcome metrics."""
    return check_dependency_consistency()
