"""Pytest fixtures for the backend test suite.

The backend is a Node/Express service that refuses to boot without a
syntactically valid GEMINI_API_KEY (see backend/config/validateEnv.js). The
fixtures here provide a dummy, non-real key so tests can boot or import the
backend without touching any external service or requiring a real credential.
"""
from __future__ import annotations

import os

import pytest

# Shaped like a real Gemini key (AIza + url-safe chars) so validateEnv() accepts
# it. It is NOT a real credential and never reaches the network in tests.
DUMMY_GEMINI_API_KEY = "AIzaSyDummyKey1234567890abcdefXYZ"


@pytest.fixture
def mock_gemini_api_key(monkeypatch):
    """Set a dummy GEMINI_API_KEY for the duration of a test."""
    monkeypatch.setenv("GEMINI_API_KEY", DUMMY_GEMINI_API_KEY)
    return DUMMY_GEMINI_API_KEY


@pytest.fixture
def gemini_env(monkeypatch):
    """A full dummy environment that lets backend/server.js reach listen()."""
    monkeypatch.setenv("GEMINI_API_KEY", DUMMY_GEMINI_API_KEY)
    monkeypatch.setenv("PORT", "0")
    monkeypatch.setenv("NODE_ENV", "test")
    return {
        "GEMINI_API_KEY": DUMMY_GEMINI_API_KEY,
        "PORT": "0",
        "NODE_ENV": "test",
        "PATH": os.environ.get("PATH", ""),
    }
