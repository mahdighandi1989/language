"""Integration test for the `ai_llm` prompt pipeline.

The `ai_llm` pipeline is the set of prompt task-files that drive the AI/LLM
features of this repo (the Gemini-backed endpoints in ``backend/server.js``).
Those prompt files used to be ambiguous: empty definition fields and no shared
marker tying them together. This test pins down the standardised shape so the
pipeline stays coherent and regressions are caught:

- every file marked ``pipeline: ai_llm`` carries the five definition fields,
  each non-empty;
- the backend the pipeline targets still exposes its Gemini entry point and a
  terminal error handler.
"""
from __future__ import annotations

from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
PROMPT_DIR = REPO_ROOT / "prompt"
SERVER_JS = REPO_ROOT / "backend" / "server.js"

REQUIRED_FIELDS = (
    "purpose",
    "responsibility",
    "expected_inputs",
    "expected_outputs",
    "interacts_with",
)

# The prompt files that make up the ai_llm pipeline (standardised in this task).
PIPELINE_FILES = (
    "archive/task-2d1f95e8-b5ea-413f-b1ec-11b7bed6eeb7.md",
    "archive/task-59cbc244-8dbe-4b9d-9a39-a3633ffd0464.md",
    "archive/task-7599ae4a-1d12-4c87-80c2-b16e5876d9d4.md",
    "archive/task-8ac8249d-e1de-40f8-ad4b-36e271a1b237.md",
    "task-92c9dd21-d951-426b-9f25-709bbff53ef8.md",
)


def _parse_frontmatter(text: str) -> dict[str, str]:
    """Parse a leading ``---`` YAML-ish frontmatter block into flat key/values.

    Only the flat ``key: value`` lines are needed here, so a tiny hand parser
    keeps this test free of any third-party dependency.
    """
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return {}
    fields: dict[str, str] = {}
    for line in lines[1:]:
        if line.strip() == "---":
            break
        if line.startswith((" ", "\t", "-")) or ":" not in line:
            continue
        key, _, value = line.partition(":")
        fields[key.strip()] = value.strip()
    return fields


def test_pipeline_runs_successfully():
    """The ai_llm pipeline is well-defined end to end."""
    # 1. Every declared pipeline file exists and is fully defined.
    for rel in PIPELINE_FILES:
        path = PROMPT_DIR / rel
        assert path.is_file(), f"missing pipeline prompt file: {rel}"

        fields = _parse_frontmatter(path.read_text(encoding="utf-8"))
        assert fields.get("pipeline") == "ai_llm", (
            f"{rel} is not tagged 'pipeline: ai_llm'"
        )
        for field in REQUIRED_FIELDS:
            value = fields.get(field, "")
            assert value, f"{rel}: field '{field}' is empty or missing"

    # 2. Every file carrying the ai_llm marker is one we know about (no
    #    half-defined stragglers leaking into the pipeline).
    tagged = {
        p.relative_to(PROMPT_DIR).as_posix()
        for p in PROMPT_DIR.rglob("*.md")
        if _parse_frontmatter(p.read_text(encoding="utf-8")).get("pipeline")
        == "ai_llm"
    }
    assert tagged == set(PIPELINE_FILES), (
        f"ai_llm pipeline membership drifted: {tagged ^ set(PIPELINE_FILES)}"
    )

    # 3. The backend the pipeline targets still exposes its Gemini entry point
    #    and a terminal error handler, so the pipeline can actually run.
    server = SERVER_JS.read_text(encoding="utf-8")
    assert "/api/gemini/chat" in server, "Gemini chat endpoint missing"
    assert server.count("(err, req, res, next)") >= 2, (
        "expected both the CORS and the terminal error handlers"
    )
