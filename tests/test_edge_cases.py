"""Edge-case test for the resolved 'AI command without validation' anti-pattern.

The anti-pattern: an AI-issued command (e.g. a ``click`` carrying a CSS
selector, or a ``navigate`` carrying a URL) was, per the original review, acted
on with no validation. A hostile/malformed selector such as ``body *`` can lock
up the main thread, and an untrusted ``javascript:`` URL can trigger script
execution or an open redirect.

The fix adds ``isValidSelector`` / ``isValidUrl`` guards and routes every
AI-issued command through ``handleCommand``. After the frontend was split into
modules these guards live in ``frontend/src/components/InspectorBridge.jsx`` so
an invalid selector or URL is rejected instead of executed.

These assertions read the frontend source (the project's test convention -- see
``test_anti_pattern_edge_case.py``) and confirm the guards exist and are wired
into the command path. They also execute the pure validator functions in Node,
when available, to prove the edge behavior: an invalid selector/URL is rejected
while a valid one is accepted.
"""
from __future__ import annotations

import json
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
# The AI-command guards were extracted from src/App.jsx into a dedicated module.
GUARD_SOURCE = REPO_ROOT / "frontend" / "src" / "components" / "InspectorBridge.jsx"

# The npm lockfile that pins the backend's dependencies. The original finding
# pointed at ``backend/package-lock.json``; this repo keeps a single root
# lockfile (``package-lock.json``) that pins those same backend dependencies, so
# the test checks whichever lockfile(s) actually exist.
_LOCKFILE_CANDIDATES = (
    REPO_ROOT / "package-lock.json",
    REPO_ROOT / "backend" / "package-lock.json",
)


def _app_source() -> str:
    return GUARD_SOURCE.read_text(encoding="utf-8")


def test_invalid_selector_or_url():
    """Invalid AI command input is rejected; valid input is accepted."""
    source = _app_source()

    # The validation helpers and the command dispatcher must exist.
    assert "isValidSelector" in source, "missing isValidSelector guard"
    assert "isValidUrl" in source, "missing isValidUrl guard"
    assert "handleCommand" in source, "missing handleCommand dispatcher"

    # The dispatcher must look at the AI-issued selector/url fields.
    assert "msg.selector" in source, "handleCommand should read msg.selector"
    assert "msg.url" in source, "handleCommand should read msg.url"

    # The command path must run those values through validation before acting:
    # both validators are called inside the dispatcher.
    assert re.search(r"isValidSelector\(\s*msg\.selector\s*\)", source), (
        "click command must validate msg.selector via isValidSelector"
    )
    assert re.search(r"isValidUrl\(\s*msg\.url\s*\)", source), (
        "navigate command must validate msg.url via isValidUrl"
    )

    # Behavioral check: run the pure validators in Node to confirm the edge
    # cases actually behave. Skips cleanly when Node is unavailable.
    _assert_validator_behavior(source)


def _existing_lockfiles() -> list[Path]:
    return [p for p in _LOCKFILE_CANDIDATES if p.is_file()]


def _resolved_without_integrity(lockfile: Path) -> list[str]:
    """Return registry-``resolved`` packages in *lockfile* that lack an
    ``integrity`` hash — exactly the threshold-outcome mismatch under test."""
    data = json.loads(lockfile.read_text(encoding="utf-8"))
    packages = data.get("packages", {})
    offenders: list[str] = []
    for name, meta in packages.items():
        # The workspace root ("") and linked workspaces resolve from disk, not
        # the registry, so they legitimately carry no integrity hash.
        if not name or not isinstance(meta, dict) or meta.get("link"):
            continue
        if meta.get("resolved") and not meta.get("integrity"):
            offenders.append(name)
    return offenders


def test_integrity_mismatch():
    """Lockfile edge case: ``resolved`` (condition) must imply ``integrity``
    (outcome).

    The reported anti-pattern was a threshold-outcome mismatch: some packages
    pinned with a ``resolved`` registry URL carried no ``integrity`` hash, so
    npm could install those tarballs without Subresource-Integrity verification
    while others were verified. This test pins the invariant — every
    registry-resolved package must also carry an integrity hash — so the
    mismatch cannot silently reappear. It also re-checks the two packages named
    in the original report (``accepts`` and ``array-flatten``).
    """
    lockfiles = _existing_lockfiles()
    assert lockfiles, (
        "no package-lock.json found; expected the root (or backend) lockfile to "
        "pin dependencies with integrity hashes"
    )

    for lockfile in lockfiles:
        # A malformed lockfile raises here, doubling as the JSON-validity check
        # the task asked for.
        data = json.loads(lockfile.read_text(encoding="utf-8"))
        assert isinstance(data.get("packages"), dict) and data["packages"], (
            f"{lockfile.name} has no 'packages' map"
        )

        offenders = _resolved_without_integrity(lockfile)
        assert not offenders, (
            "threshold-outcome mismatch in "
            f"{lockfile.name}: these packages are pinned with a 'resolved' URL "
            "but have no 'integrity' hash, so their install is unverifiable:\n  "
            + "\n  ".join(sorted(offenders))
        )

        # Guard the exact packages from the original report when present.
        for pkg in ("node_modules/accepts", "node_modules/array-flatten"):
            meta = data["packages"].get(pkg)
            if meta is None:
                continue
            assert meta.get("integrity", "").startswith("sha"), (
                f"{pkg} in {lockfile.name} must carry a Subresource-Integrity "
                f"hash (got {meta.get('integrity')!r})"
            )


def _extract_function(source: str, name: str) -> str:
    """Return the source text of a top-level ``export function <name>(...) {...}``
    by brace-matching from its opening brace."""
    marker = f"export function {name}"
    start = source.index(marker)
    brace = source.index("{", start)
    depth = 0
    i = brace
    while i < len(source):
        ch = source[i]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return source[start : i + 1]
        i += 1
    raise AssertionError(f"could not brace-match function {name}")


def _assert_validator_behavior(source: str) -> None:
    node = shutil.which("node")
    if node is None:
        return  # environment without Node: static assertions above still apply

    is_valid_selector = _extract_function(source, "isValidSelector")
    is_valid_url = _extract_function(source, "isValidUrl")

    harness = (
        is_valid_selector
        + "\n"
        + is_valid_url
        + "\n"
        + r"""
const checks = [
  // invalid selectors are rejected
  isValidSelector('body *') === false,
  isValidSelector('*') === false,
  isValidSelector('') === false,
  isValidSelector('<script>') === false,
  // a plain selector is accepted
  isValidSelector('.lesson-card') === true,
  // invalid / hostile URLs are rejected
  isValidUrl('javascript:alert(1)') === false,
  isValidUrl('data:text/html,x') === false,
  isValidUrl('') === false,
  // an http(s) URL is accepted
  isValidUrl('https://example.com/path') === true,
];
if (checks.every(Boolean)) {
  console.log('OK');
} else {
  console.log('FAIL:' + JSON.stringify(checks));
  process.exit(1);
}
"""
    )

    with tempfile.NamedTemporaryFile(
        "w", suffix=".mjs", delete=False, encoding="utf-8"
    ) as fh:
        fh.write(harness)
        tmp = fh.name
    try:
        result = subprocess.run(
            [node, tmp], capture_output=True, text=True, timeout=30
        )
    finally:
        Path(tmp).unlink(missing_ok=True)

    assert result.returncode == 0, (
        "validator behavior check failed:\n"
        f"stdout={result.stdout}\nstderr={result.stderr}"
    )
    assert "OK" in result.stdout
