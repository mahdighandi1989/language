"""Edge-case test for the 'threshold-outcome mismatch' anti-pattern in the
npm lockfile.

The anti-pattern (as flagged): some packages carried an ``integrity`` hash
while others did not, so the *condition* (a dependency is pinned with a
``resolved`` registry URL) did not reliably map to the *outcome* (that pin is
verifiable via Subresource-Integrity). A missing ``integrity`` means npm can
install that tarball without checksum verification, which weakens the whole
point of committing a lockfile.

Investigation result: in the current ``package-lock.json`` the mismatch does
NOT exist — every package with a ``resolved`` registry URL also has an
``integrity`` hash (including both packages named in the original report,
``accepts`` and ``array-flatten``). No lockfile edit was therefore required.

This test pins that invariant so the mismatch cannot silently reappear, and
double-checks the exact edge that was reported as broken.
"""
from __future__ import annotations

import json
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent
LOCKFILE = REPO_ROOT / "package-lock.json"


def _load_lockfile() -> dict:
    # Also serves as the JSON-validity check the task asked for: a malformed
    # lockfile raises here and fails the suite.
    return json.loads(LOCKFILE.read_text(encoding="utf-8"))


def test_lockfile_is_valid_json():
    data = _load_lockfile()
    assert data.get("lockfileVersion") == 3, (
        "unexpected lockfileVersion; integrity expectations below assume v3 "
        "where each package entry carries its own integrity hash"
    )
    assert isinstance(data.get("packages"), dict) and data["packages"], (
        "lockfile has no 'packages' map"
    )


def test_every_resolved_package_has_integrity():
    """The core edge: condition (resolved) must imply outcome (integrity).

    A registry-resolved tarball without an integrity hash is exactly the
    threshold-outcome mismatch the finding describes.
    """
    data = _load_lockfile()
    offenders: list[str] = []
    for name, meta in data["packages"].items():
        # Local workspace roots ("" and linked workspaces) are resolved from
        # disk, not the registry, and legitimately have no integrity hash.
        if not name or meta.get("link"):
            continue
        if meta.get("resolved") and not meta.get("integrity"):
            offenders.append(name)

    assert not offenders, (
        "threshold-outcome mismatch: these lockfile packages are pinned with a "
        "'resolved' URL but have no 'integrity' hash, so their install is "
        f"unverifiable:\n  " + "\n  ".join(sorted(offenders))
    )


@pytest.mark.parametrize("pkg", ["node_modules/accepts", "node_modules/array-flatten"])
def test_reported_packages_have_integrity(pkg):
    """Guard the exact packages named in the original report."""
    data = _load_lockfile()
    meta = data["packages"].get(pkg)
    assert meta is not None, f"expected lockfile entry for {pkg!r}"
    assert meta.get("resolved"), f"{pkg} should be resolved from the registry"
    integrity = meta.get("integrity", "")
    assert integrity.startswith("sha"), (
        f"{pkg} must carry a Subresource-Integrity hash (got {integrity!r})"
    )
