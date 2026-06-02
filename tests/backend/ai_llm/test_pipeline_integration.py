"""Integration test for the ground-truth ``ai_llm`` pipeline.

Drives the pipeline end to end through ``run_pipeline`` with an injected
transport (a stub standing in for the Gemini HTTP call), proving the
orchestration build → call → validate → parse behaves as the resolved
ground-truth contract specifies — both on the happy path and when the model
returns a malformed payload.
"""
from __future__ import annotations

import importlib.util
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[3]
PIPELINE_PY = REPO_ROOT / "backend" / "app" / "ai_llm" / "pipeline.py"


def _load_pipeline():
    spec = importlib.util.spec_from_file_location("ai_llm_pipeline_integ", PIPELINE_PY)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_pipeline_happy_path():
    """A well-formed Gemini response flows through to extracted text."""
    pipeline = _load_pipeline()

    captured = {}

    def transport(payload):
        # The pipeline must hand the transport the canonical payload shape.
        captured["payload"] = payload
        return {"candidates": [{"content": {"parts": [{"text": "كيفك؟"}]}}]}

    out = pipeline.run_pipeline([{"text": "أهلا"}], "system instruction", transport)

    assert out == "كيفك؟"
    assert captured["payload"]["contents"][0]["role"] == "user"
    assert captured["payload"]["contents"][0]["parts"] == [{"text": "أهلا"}]
    assert captured["payload"]["systemInstruction"]["parts"][0]["text"] == "system instruction"


def test_pipeline_rejects_malformed_response():
    """A malformed upstream payload is rejected (the 502 branch), not relayed."""
    pipeline = _load_pipeline()

    def transport(_payload):
        return {"error": "quota exceeded"}

    with pytest.raises(pipeline.InvalidResponseError):
        pipeline.run_pipeline([{"text": "x"}], "sys", transport)


def test_pipeline_rejects_empty_text():
    """A valid envelope with no text is rejected (the 'No text' 500 branch)."""
    pipeline = _load_pipeline()

    def transport(_payload):
        return {"candidates": [{"content": {"parts": [{}]}}]}

    with pytest.raises(pipeline.InvalidResponseError):
        pipeline.run_pipeline([{"text": "x"}], "sys", transport)


def test_pipeline_supports_multimodal_parts():
    """Inline/file data parts pass through the payload untouched."""
    pipeline = _load_pipeline()

    parts = [
        {"text": "این تصویر را تحلیل کن"},
        {"inline_data": {"mime_type": "image/jpeg", "data": "BASE64"}},
    ]

    def transport(payload):
        assert payload["contents"][0]["parts"] == parts
        return {"candidates": [{"content": {"parts": [{"text": "نتیجه"}]}}]}

    assert pipeline.run_pipeline(parts, "sys", transport) == "نتیجه"
