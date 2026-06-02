"""Logic tests for the ground-truth ``ai_llm`` pipeline contract.

These prove the resolved inconsistency: the canonical Python contract in
``backend/app/ai_llm/pipeline.py`` (the chosen ground truth) is internally
coherent and the previously-inconsistent "structured spec" side has been
realigned to the free-form-Gemini implementation it actually runs on.
"""
from __future__ import annotations

import importlib.util
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]
BACKEND_DIR = REPO_ROOT / "backend"
PIPELINE_PY = BACKEND_DIR / "app" / "ai_llm" / "pipeline.py"


def _load_pipeline():
    spec = importlib.util.spec_from_file_location("ai_llm_pipeline_logic", PIPELINE_PY)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _backend_source() -> str:
    parts = []
    for path in sorted(BACKEND_DIR.rglob("*.js")):
        rel = path.relative_to(BACKEND_DIR).parts
        if "node_modules" in rel or "tests" in rel:
            continue
        parts.append(path.read_text(encoding="utf-8"))
    return "\n".join(parts)


def test_ground_truth_alignment():
    """The ground-truth contract and the running backend agree on every
    load-bearing value, so the two sides of the inconsistency are aligned."""
    pipeline = _load_pipeline()
    gt = pipeline.GROUND_TRUTH
    backend = _backend_source()

    # The contract names the implementation as ground truth, not the spec.
    assert gt["provider"] == "google-gemini"
    assert gt["output_parser"]["structured"] is False, (
        "ground truth is the free-form-text implementation, not a typed schema"
    )

    # Every model in the contract is a real model the backend invokes.
    assert gt["models"]["default"] == pipeline.MODEL_DEFAULT
    assert gt["models"]["extended"] == pipeline.MODEL_EXTENDED
    assert gt["models"]["tts"] == pipeline.MODEL_TTS
    assert pipeline.MODEL_DEFAULT in backend
    assert pipeline.MODEL_EXTENDED in backend
    assert pipeline.MODEL_TTS in backend
    assert pipeline.SUPPORTED_MODELS == {
        pipeline.MODEL_DEFAULT,
        pipeline.MODEL_EXTENDED,
        pipeline.MODEL_TTS,
    }

    # Validation contract mirrors isValidGeminiResponse (structural, status 502).
    assert gt["validation"]["guard"] == "isValidGeminiResponse"
    assert gt["validation"]["on_invalid_status"] == 502
    assert gt["validation"]["guard"] in backend
    assert gt["validation"]["sanitizer"] in backend

    # Prompt-format contract matches the JS payload shape.
    payload = pipeline.build_request_payload([{"text": "hi"}], "sys")
    assert payload["contents"][0]["role"] == "user"
    assert payload["contents"][0]["parts"] == [{"text": "hi"}]
    assert payload["systemInstruction"]["parts"][0]["text"] == "sys"


def test_validation_guard_matches_js_semantics():
    """is_valid_response accepts exactly what isValidGeminiResponse accepts."""
    pipeline = _load_pipeline()

    assert pipeline.is_valid_response({"candidates": [{"x": 1}]}) is True
    # Rejections: None, non-dict, missing/empty/non-list candidates.
    for bad in (None, "x", 5, {}, {"candidates": None}, {"candidates": []}):
        assert pipeline.is_valid_response(bad) is False


def test_extract_text_empty_fallback():
    """extract_text returns '' for any broken chain (JS `|| ''` parity)."""
    pipeline = _load_pipeline()

    assert pipeline.extract_text({"candidates": [{"content": {"parts": [{}]}}]}) == ""
    assert pipeline.extract_text({"candidates": []}) == ""
    assert pipeline.extract_text({}) == ""
    full = {"candidates": [{"content": {"parts": [{"text": "ok"}]}}]}
    assert pipeline.extract_text(full) == "ok"


def test_hallucination_guards_are_documented():
    """The guards are prompt-level/heuristic and explicitly enumerated."""
    pipeline = _load_pipeline()
    assert "lebanese_correction_ruleset" in pipeline.HALLUCINATION_GUARDS
    assert "structural_response_validation" in pipeline.HALLUCINATION_GUARDS
    assert pipeline.GROUND_TRUTH["hallucination_guards"] == pipeline.HALLUCINATION_GUARDS
