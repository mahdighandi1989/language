"""Edge-case test for the resolved 'AI response without validation' anti-pattern.

The anti-pattern: the Gemini chat endpoint forwarded the upstream ``result``
straight to the client (``res.json(result)``) in the ``includeAudio`` path with
no structural validation, so a malformed or unexpected upstream payload would
be relayed verbatim.

The fix (in ``backend/controllers/geminiController.js``) validates the response
shape with ``isValidGeminiResponse`` before returning it, answers a 502 when the
shape is unexpected, and forwards a sanitized projection
(``sanitizeGeminiResponse``) rather than the raw payload.

These assertions read the backend source (the project's test convention) and,
when Node is available, execute the pure ``isValidGeminiResponse`` guard to
prove the edge behavior.
"""
from __future__ import annotations

import re
import shutil
import subprocess
import tempfile
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
GEMINI_CONTROLLER = (
    REPO_ROOT / "backend" / "controllers" / "geminiController.js"
)


def _controller_source() -> str:
    return GEMINI_CONTROLLER.read_text(encoding="utf-8")


def test_edge_case():
    """A malformed AI response is validated and not forwarded raw."""
    source = _controller_source()

    # The validation + sanitize guards must exist.
    assert "isValidGeminiResponse" in source, "missing response validation guard"
    assert "sanitizeGeminiResponse" in source, "missing response sanitize step"

    # The includeAudio branch must no longer forward the raw upstream result.
    assert not re.search(r"res\.json\(\s*result\s*\)", source), (
        "anti-pattern not resolved: raw result is still forwarded to the client"
    )

    # The validated result is what gets sanitized and returned.
    assert re.search(r"res\.json\(\s*sanitizeGeminiResponse\(", source), (
        "sanitized response should be returned in the audio path"
    )

    # An unexpected shape must produce an explicit error response, not a relay.
    assert "isValidGeminiResponse(result)" in source, (
        "result must be passed through the validation guard"
    )
    assert re.search(r"return res\.status\(\s*502\s*\)\.json\(", source), (
        "invalid upstream responses should yield a 502 error, not be forwarded"
    )

    _assert_guard_behavior(source)


def _extract_function(source: str, name: str) -> str:
    """Return the source of a ``function <name>(...) {...}`` via brace-matching."""
    marker = f"function {name}"
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


def _assert_guard_behavior(source: str) -> None:
    node = shutil.which("node")
    if node is None:
        return

    is_valid = _extract_function(source, "isValidGeminiResponse")
    harness = (
        is_valid
        + "\n"
        + r"""
const checks = [
  // valid: non-empty candidates array
  isValidGeminiResponse({ candidates: [{ content: { parts: [{ text: 'hi' }] } }] }) === true,
  // invalid: empty candidates
  isValidGeminiResponse({ candidates: [] }) === false,
  // invalid: missing candidates / unexpected shape
  isValidGeminiResponse({ error: 'boom' }) === false,
  isValidGeminiResponse(null) === false,
  isValidGeminiResponse('a string') === false,
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
        "guard behavior check failed:\n"
        f"stdout={result.stdout}\nstderr={result.stderr}"
    )
    assert "OK" in result.stdout
