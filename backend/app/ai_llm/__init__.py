"""ai_llm — canonical contract for the Gemini-backed AI/LLM pipeline.

This package is the single source of truth (ground truth) describing how the
repo's AI/LLM pipeline is wired: which models it calls, how prompts are built,
how the model's response is parsed and validated, and which hallucination
guards are in force. The runtime implementation lives in the Node backend
(``backend/services/*.js`` + ``backend/controllers/geminiController.js``); this
package mirrors that implementation in pure Python so the architecture can be
documented and regression-tested without booting Node or calling Gemini.
"""
from __future__ import annotations

from .pipeline import (
    GEMINI_API_BASE,
    GROUND_TRUTH,
    HALLUCINATION_GUARDS,
    MODEL_DEFAULT,
    MODEL_EXTENDED,
    MODEL_TTS,
    SUPPORTED_MODELS,
    InvalidResponseError,
    build_request_payload,
    extract_text,
    is_valid_response,
    parse_validated_output,
    run_pipeline,
)

__all__ = [
    "GEMINI_API_BASE",
    "GROUND_TRUTH",
    "HALLUCINATION_GUARDS",
    "MODEL_DEFAULT",
    "MODEL_EXTENDED",
    "MODEL_TTS",
    "SUPPORTED_MODELS",
    "InvalidResponseError",
    "build_request_payload",
    "extract_text",
    "is_valid_response",
    "parse_validated_output",
    "run_pipeline",
]
