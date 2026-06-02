"""End-to-end measurement of the documentation outcome.

The documentation effort has a measurable outcome target: every key component
file must carry a purpose header so its role is understandable without
reverse-engineering. This test turns that into an objective check by computing
the documentation-coverage rate (the ``outcome_rate`` metric) over the key
files and asserting it reaches 100%. The rate is logged so it is observable in
CI / production test logs, mirroring how an effectiveness metric would be
emitted in production.
"""
from __future__ import annotations

import logging
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]

logger = logging.getLogger(__name__)

# Key component files and the markers a valid purpose header must contain. Each
# file is "documented" when its first lines declare its purpose AND describe its
# upstream/downstream relationships, matching the project's documentation
# acceptance criteria.
KEY_FILES = {
    "frontend/src/App.jsx": ("purpose", "upstream", "downstream"),
    "backend/server.js": ("purpose", "upstream", "downstream"),
    "frontend/index.html": ("purpose", "upstream", "downstream"),
}

# Number of header lines to inspect; a purpose header lives at the top of a file.
_HEADER_LINES = 40


def _is_documented(path: Path, required_markers: tuple[str, ...]) -> bool:
    """Return True when the file's header contains every required marker."""
    if not path.is_file():
        return False
    header = "\n".join(path.read_text(encoding="utf-8").splitlines()[:_HEADER_LINES])
    header_lower = header.lower()
    return all(marker.lower() in header_lower for marker in required_markers)


def test_outcome_measurable():
    documented = 0
    missing: list[str] = []
    for rel_path, markers in KEY_FILES.items():
        if _is_documented(REPO_ROOT / rel_path, markers):
            documented += 1
        else:
            missing.append(rel_path)

    total = len(KEY_FILES)
    outcome_rate = documented / total if total else 0.0

    # Emit the metric so the documentation outcome_rate is observable in logs.
    logger.info("outcome_rate (documentation coverage): %.2f", outcome_rate)
    print(f"outcome_rate (documentation coverage): {outcome_rate:.2f}")

    assert outcome_rate == 1.0, (
        "Documentation coverage outcome not met: "
        f"outcome_rate={outcome_rate:.2f} ({documented}/{total} key files "
        f"documented). Missing or incomplete purpose headers in: {missing}"
    )
