"""Canonical (ground-truth) contract for the ``ai_llm`` pipeline.

The coherence audit that produced this module asked three questions of the
pipeline:

  1. Is the prompt format compatible with the AI model and the output parser?
  2. Is there validation on the AI response?
  3. Are hallucination guards active?

inconsistency identified
=========================
The audit found two *sides* that held incompatible assumptions about how the
pipeline works:

* **Side A — the audit/spec expectation.** It assumed the pipeline was a
  structured, schema-validated flow: the model returns a typed object, an
  output *parser* deserialises it, a *validation* layer rejects malformed data,
  and dedicated *hallucination guards* run as a post-processing step. None of
  that was written down anywhere, so the expectation was unverifiable.

* **Side B — the running implementation** (``backend/services/geminiService.js``,
  ``backend/services/prompts.js`` and ``backend/controllers/geminiController.js``).
  It calls Google Gemini ``generateContent``; the prompt is a *system
  instruction* plus user *parts* (text + inline/file data); the "parser" is the
  plain extraction ``candidates[0].content.parts[0].text`` with an empty-string
  fallback; validation is the structural ``isValidGeminiResponse`` guard plus a
  ``sanitizeGeminiResponse`` projection; and the only hallucination guards are
  prompt-level (the Lebanese-Arabic correction rules) plus a few output
  heuristics (chunk-merge dedup, empty-frame filtering).

ناسازگاری شناسایی شد: طرف ناسازگاری (the two sides of the inconsistency) و
فرض‌هایشان / فرضیات (their assumptions) — assumptions documented:

  - طرف A (انتظارِ ممیزی): خروجی ساختاریافته/typed، پارسرِ deserialize، لایهٔ
    validation مبتنی بر schema، و گاردهای hallucination به‌صورت یک مرحلهٔ مجزا.
  - طرف B (پیاده‌سازیِ واقعی): خروجیِ متنِ آزادِ Markdown از Gemini، پارس با
    استخراجِ ساده، validation ساختاری (نه schema)، و گاردهای hallucination در
    سطحِ prompt + چند heuristic روی خروجی.

ground truth
============
The running backend (Side B) is the ground truth: it is the behaviour shipped
to users, exercised by ``tests/test_gemini.py`` and ``tests/test_*`` and proven
in production. The reason this side was chosen is documented at length in
``docs/design/ai_llm_pipeline.md`` and ``docs/architecture/ai_llm_pipeline.md``.
This module *codifies* Side B so that Side A's expectation is realigned to the
truth instead of the other way around. Where Side B genuinely lacks a guard
(e.g. there is no schema parser because outputs are free-form Markdown), that
gap is recorded as a known limitation rather than faked.

The constants and functions below mirror the Node implementation field-for-field
so an automated test can prove the Python contract and the JS source agree.
"""
from __future__ import annotations

from typing import Any

GEMINI_API_BASE = "https://generativelanguage.googleapis.com"

# Models actually called by the backend. Kept in lock-step with the JS source:
#   - gemini-2.0-flash            geminiService.analyzeWithGemini / controller chat
#   - gemini-2.0-flash-exp        geminiService.analyzeWithGeminiFileAPI (extended)
#   - gemini-2.5-flash-preview-tts geminiController.tts
MODEL_DEFAULT = "gemini-2.0-flash"
MODEL_EXTENDED = "gemini-2.0-flash-exp"
MODEL_TTS = "gemini-2.5-flash-preview-tts"

SUPPORTED_MODELS = frozenset({MODEL_DEFAULT, MODEL_EXTENDED, MODEL_TTS})

# Hallucination guards in force on the ground-truth side. These are prompt-level
# and heuristic, NOT a schema validator — that distinction is the heart of the
# resolved inconsistency.
HALLUCINATION_GUARDS = (
    # Prompt engineering: the Lebanese-Arabic correction ruleset constrains the
    # model to a known dialect mapping (prompts.js LEBANESE_CORRECTION_PROMPT).
    "lebanese_correction_ruleset",
    # Output heuristic: empty/"no text found" frame results are dropped before
    # merge (analysisService.js frame analysis).
    "empty_frame_filtering",
    # Output heuristic: multi-chunk results are re-merged with a dedup prompt.
    "chunk_merge_dedup",
    # Structural validation: malformed upstream payloads are rejected (502)
    # instead of forwarded (geminiController.isValidGeminiResponse).
    "structural_response_validation",
)

# The machine-readable ground-truth descriptor. Tests assert the Node source
# agrees with every load-bearing value here.
GROUND_TRUTH: dict[str, Any] = {
    "name": "ai_llm",
    "provider": "google-gemini",
    "api_base": GEMINI_API_BASE,
    "models": {
        "default": MODEL_DEFAULT,
        "extended": MODEL_EXTENDED,
        "tts": MODEL_TTS,
    },
    "prompt_format": {
        # system instruction + user parts; parts are text and/or inline/file data
        "system_instruction_field": "systemInstruction",
        "user_role": "user",
        "part_kinds": ("text", "inline_data", "file_data"),
    },
    "output_parser": {
        # free-form text extracted from the first candidate's first part,
        # empty-string fallback — there is no structured/JSON parser.
        "text_path": ("candidates", 0, "content", "parts", 0, "text"),
        "empty_fallback": "",
        "structured": False,
    },
    "validation": {
        # structural, not schema-based
        "guard": "isValidGeminiResponse",
        "rule": "candidates is a non-empty array",
        "on_invalid_status": 502,
        "sanitizer": "sanitizeGeminiResponse",
    },
    "hallucination_guards": HALLUCINATION_GUARDS,
}


class InvalidResponseError(ValueError):
    """Raised when a Gemini response fails the structural validation guard.

    Mirrors the 502 ``"Invalid response from AI service"`` branch in
    ``geminiController.chat``.
    """


def build_request_payload(parts: list[dict], system_prompt: str) -> dict:
    """Build a Gemini ``generateContent`` payload.

    Mirrors ``geminiService.analyzeWithGemini``: a single ``user`` turn carrying
    the supplied ``parts`` plus a ``systemInstruction`` wrapping the system
    prompt. ``parts`` are passed through untouched so callers may mix text with
    ``inline_data``/``file_data`` exactly as the Node code does.
    """
    return {
        "contents": [{"role": GROUND_TRUTH["prompt_format"]["user_role"], "parts": parts}],
        "systemInstruction": {"parts": [{"text": system_prompt}]},
    }


def is_valid_response(result: Any) -> bool:
    """Structural validity guard — mirror of JS ``isValidGeminiResponse``.

    A genuine response is an object carrying a non-empty ``candidates`` list.
    Anything else (None, error envelope, unexpected shape) is invalid and must
    not be forwarded verbatim.
    """
    return (
        isinstance(result, dict)
        and isinstance(result.get("candidates"), list)
        and len(result["candidates"]) > 0
    )


def extract_text(result: Any) -> str:
    """Extract the generated text, mirroring the JS optional-chain extraction.

    Equivalent to ``result.candidates?.[0]?.content?.parts?.[0]?.text || ''`` —
    returns the empty string when any link in the chain is missing. This is the
    whole "output parser": the pipeline produces free-form Markdown text, not a
    structured object.
    """
    try:
        candidates = result["candidates"]
        parts = candidates[0]["content"]["parts"]
        text = parts[0].get("text")
    except (TypeError, KeyError, IndexError, AttributeError):
        return ""
    return text or ""


def parse_validated_output(result: Any) -> str:
    """Validate then parse — the terminal step of the ground-truth pipeline.

    Raises :class:`InvalidResponseError` for a structurally invalid payload
    (the 502 branch), otherwise returns the extracted text. An empty extracted
    text from an otherwise-valid payload maps to the controller's
    ``"No text in response"`` 500 branch, so it is also rejected here.
    """
    if not is_valid_response(result):
        raise InvalidResponseError("Invalid response from AI service")
    text = extract_text(result)
    if not text:
        raise InvalidResponseError("No text in response")
    return text


def run_pipeline(parts: list[dict], system_prompt: str, transport) -> str:
    """End-to-end pipeline: build payload → call ``transport`` → validate+parse.

    ``transport`` is any callable taking the request payload (a dict) and
    returning the raw Gemini response (a dict). Injecting it keeps this function
    pure and testable: production wiring passes a real HTTP client, tests pass a
    stub. This is the Python expression of the orchestration in
    ``analysisService.analyzeUploads`` reduced to its essential contract.
    """
    payload = build_request_payload(parts, system_prompt)
    result = transport(payload)
    return parse_validated_output(result)
