"""Unit tests for the vocabulary CRUD layer.

Every test runs against an in-memory store (see ``_vocabulary``); there is no
real database and no external (e.g. Gemini) API call, so the suite is fully
deterministic and offline.
"""
from __future__ import annotations

import pytest

from unit._vocabulary import (
    DuplicateWordError,
    VocabularyStore,
    WordNotFoundError,
)


@pytest.fixture
def store() -> VocabularyStore:
    return VocabularyStore()


def test_add_word(store: VocabularyStore) -> None:
    word = store.add_word("مرحبا", "hello")
    assert word["id"] >= 1
    assert word["text"] == "مرحبا"
    assert word["translation"] == "hello"

    # A duplicate word is rejected.
    with pytest.raises(DuplicateWordError):
        store.add_word("مرحبا", "hi")


def test_get_word(store: VocabularyStore) -> None:
    added = store.add_word("كتاب", "book")
    assert store.get_word(added["id"]) == added

    # An unknown id yields None rather than raising.
    assert store.get_word(9999) is None


def test_delete_word(store: VocabularyStore) -> None:
    added = store.add_word("قلم", "pen")
    removed = store.delete_word(added["id"])
    assert removed == added
    assert store.get_word(added["id"]) is None

    # Deleting a missing word raises.
    with pytest.raises(WordNotFoundError):
        store.delete_word(added["id"])


def test_search_words(store: VocabularyStore) -> None:
    store.add_word("school", "مدرسة")
    store.add_word("schoolbag", "حقيبة")
    store.add_word("house", "بيت")

    exact = store.search_words("house")
    assert [w["text"] for w in exact] == ["house"]

    partial = sorted(w["text"] for w in store.search_words("school"))
    assert partial == ["school", "schoolbag"]

    assert store.search_words("nonexistent") == []
