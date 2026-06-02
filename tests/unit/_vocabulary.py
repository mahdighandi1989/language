"""In-memory vocabulary store used by the unit-test layer.

The production backend is a Node/Express service; this small, dependency-free
Python store exists purely so the pytest unit suite has a deterministic,
fully-mocked subject to exercise (no database, no network). It mirrors the CRUD
shape a vocabulary service would expose: add, get, delete and search.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from itertools import count
from typing import Optional


class DuplicateWordError(ValueError):
    """Raised when adding a word whose text already exists in the store."""


class WordNotFoundError(KeyError):
    """Raised when deleting a word that is not present in the store."""


@dataclass
class VocabularyStore:
    """A tiny in-memory vocabulary store keyed by integer id."""

    _words: dict = field(default_factory=dict)
    _ids: "count[int]" = field(default_factory=lambda: count(1))

    def add_word(self, text: str, translation: str = "") -> dict:
        normalized = text.strip()
        if not normalized:
            raise ValueError("word text must not be empty")
        if any(w["text"] == normalized for w in self._words.values()):
            raise DuplicateWordError(f"word already exists: {normalized}")
        word_id = next(self._ids)
        record = {"id": word_id, "text": normalized, "translation": translation}
        self._words[word_id] = record
        return record

    def get_word(self, word_id: int) -> Optional[dict]:
        return self._words.get(word_id)

    def delete_word(self, word_id: int) -> dict:
        if word_id not in self._words:
            raise WordNotFoundError(word_id)
        return self._words.pop(word_id)

    def search_words(self, pattern: str) -> list:
        needle = pattern.strip().lower()
        if not needle:
            return []
        return [
            w
            for w in self._words.values()
            if needle in w["text"].lower()
        ]
