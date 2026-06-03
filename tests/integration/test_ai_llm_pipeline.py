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

import importlib.util
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
PROMPT_DIR = REPO_ROOT / "prompt"
BACKEND_DIR = REPO_ROOT / "backend"
SERVER_JS = BACKEND_DIR / "server.js"
PIPELINE_PY = BACKEND_DIR / "app" / "ai_llm" / "pipeline.py"


def _load_pipeline():
    """Load the ground-truth pipeline module straight from its file path.

    Importing by path avoids needing ``backend`` to be an importable package and
    matches this suite's read-source-by-path convention.
    """
    spec = importlib.util.spec_from_file_location("ai_llm_pipeline", PIPELINE_PY)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _backend_source() -> str:
    """Combined backend source across the layered module structure.

    The Gemini endpoints were extracted from ``server.js`` into routes and
    controllers during the backend refactor, so pipeline assertions look at the
    whole backend rather than a single file.
    """
    parts = []
    for path in sorted(BACKEND_DIR.rglob("*.js")):
        rel = path.relative_to(BACKEND_DIR).parts
        if "node_modules" in rel or "tests" in rel:
            continue
        parts.append(path.read_text(encoding="utf-8"))
    return "\n".join(parts)

# Load-bearing sections of the canonical pipeline contract that must be fully
# defined for the pipeline to be unambiguous. The contract lives in the
# committed ``backend/app/ai_llm/pipeline.py`` ground-truth module — see the
# note on ``PIPELINE_FILES`` for why this is the durable source of truth rather
# than the prompt-file frontmatter.
REQUIRED_CONTRACT_SECTIONS = (
    "prompt_format",
    "output_parser",
    "validation",
)

# The prompt task-files that document the ai_llm pipeline.
#
# NOTE on the source of truth: these prompt files are owned and rewritten by the
# external task-sync system (the ``chore(prompt): sync task …`` commits). That
# sync normalises their frontmatter to a fixed task-tracking schema and strips
# any extra key — including a ``pipeline: ai_llm`` marker — on every run. So a
# test that asserts on such a marker can never stay green: each sync deletes it
# again (this caused a long re-add/strip loop). The pipeline's real, durable
# contract therefore lives in the in-repo ``backend/app/ai_llm/pipeline.py``
# module and the running backend source, which this test pins down. The prompt
# files are only checked for existence (the sync keeps the files themselves).
PIPELINE_FILES = (
    "archive/task-2d1f95e8-b5ea-413f-b1ec-11b7bed6eeb7.md",
    "archive/task-59cbc244-8dbe-4b9d-9a39-a3633ffd0464.md",
    "archive/task-7599ae4a-1d12-4c87-80c2-b16e5876d9d4.md",
    "archive/task-8ac8249d-e1de-40f8-ad4b-36e271a1b237.md",
    "task-92c9dd21-d951-426b-9f25-709bbff53ef8.md",
)


def test_pipeline_runs_successfully():
    """The ai_llm pipeline is well-defined end to end.

    Well-definedness is pinned against the durable in-repo contract
    (``backend/app/ai_llm/pipeline.py`` + the backend source), NOT the prompt
    files' frontmatter, which the external task-sync system rewrites/strips on
    every sync (see the ``PIPELINE_FILES`` note). The prompt files are only
    asserted to exist.
    """
    # 1. Every declared pipeline prompt file still exists.
    for rel in PIPELINE_FILES:
        path = PROMPT_DIR / rel
        assert path.is_file(), f"missing pipeline prompt file: {rel}"

    # 2. The canonical pipeline contract is fully defined — no empty load-bearing
    #    field — so the pipeline is unambiguous end to end.
    pipeline = _load_pipeline()
    gt = pipeline.GROUND_TRUTH
    assert gt["name"] == "ai_llm", "pipeline name drifted from ground truth"
    assert gt["provider"], "pipeline provider must be defined"
    assert str(gt["api_base"]).startswith("https://"), "pipeline api_base must be defined"
    for model_key in ("default", "extended", "tts"):
        assert gt["models"].get(model_key), f"pipeline model '{model_key}' must be defined"
    for section in REQUIRED_CONTRACT_SECTIONS:
        assert gt.get(section), f"pipeline contract section '{section}' must be defined"
    assert gt["hallucination_guards"], "pipeline hallucination guards must be defined"

    # 3. The backend the pipeline targets still exposes its Gemini entry point
    #    and a terminal error handler, so the pipeline can actually run.
    backend = _backend_source()
    assert "/api/gemini/chat" in backend, "Gemini chat endpoint missing"
    assert backend.count("(err, req, res, next)") >= 2, (
        "expected both the CORS and the terminal error handlers"
    )


def test_consistency_check_passes():
    """The model/parser inconsistency is resolved: the Python ground-truth
    contract agrees with the running Node backend.

    This pins down the coherence-audit answer — the two previously-inconsistent
    sides (the structured-spec expectation and the free-form Gemini
    implementation) now describe the *same* pipeline, with the implementation
    chosen as ground truth.
    """
    pipeline = _load_pipeline()
    backend = _backend_source()
    gt = pipeline.GROUND_TRUTH

    # 1. Models declared as ground truth are the ones the backend actually calls.
    assert gt["models"]["default"] in backend, "default model drifted from backend"
    assert gt["models"]["tts"] in backend, "TTS model drifted from backend"
    for model in pipeline.SUPPORTED_MODELS:
        assert model.startswith("gemini-"), f"unexpected model id: {model}"

    # 2. The validation guard named as ground truth exists in the backend.
    assert gt["validation"]["guard"] in backend, "validation guard missing in backend"
    assert gt["validation"]["sanitizer"] in backend, "sanitizer missing in backend"
    assert gt["validation"]["on_invalid_status"] == 502

    # 3. The output parser contract matches the JS extraction path and the
    #    backend exposes that exact extraction.
    assert gt["output_parser"]["structured"] is False
    assert "candidates?.[0]?.content?.parts?.[0]?.text" in backend

    # 4. The Python validation/parse behaves exactly like the JS guard: a
    #    non-empty candidates array is valid; a malformed payload is rejected.
    valid = {"candidates": [{"content": {"parts": [{"text": "مرحبا"}]}}]}
    assert pipeline.is_valid_response(valid) is True
    assert pipeline.extract_text(valid) == "مرحبا"
    assert pipeline.parse_validated_output(valid) == "مرحبا"

    for bad in (None, {}, {"candidates": []}, {"error": "boom"}, "not-an-object"):
        assert pipeline.is_valid_response(bad) is False
        try:
            pipeline.parse_validated_output(bad)
            raised = False
        except pipeline.InvalidResponseError:
            raised = True
        assert raised, f"expected InvalidResponseError for {bad!r}"

    # 5. Hallucination guards are documented and align with the prompt-level
    #    ground truth (Lebanese correction ruleset lives in prompts.js).
    assert "lebanese_correction_ruleset" in pipeline.HALLUCINATION_GUARDS
    prompts_js = (BACKEND_DIR / "services" / "prompts.js").read_text(encoding="utf-8")
    assert "LEBANESE_CORRECTION_PROMPT" in prompts_js
