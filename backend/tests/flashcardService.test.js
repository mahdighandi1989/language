/**
 * Unit tests for the SM-2 flashcard scheduler.
 *
 * A fresh store per test (`beforeEach`) keeps every case isolated, and a fixed
 * `NOW` timestamp makes the scheduling maths deterministic. Fully offline.
 */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  new_store,
  create_flashcard,
  review_flashcard,
  get_due_cards,
  update_card_rating,
} from '../services/flashcardService.js';

const NOW = 1_700_000_000_000; // fixed epoch ms
const DAY_MS = 24 * 60 * 60 * 1000;

let store;
beforeEach(() => {
  store = new_store();
});

// --- create_flashcard -----------------------------------------------------

test('test_create_flashcard_defaults', () => {
  const c = create_flashcard(store, { front: 'مرحبا', back: 'hello' }, NOW);
  assert.equal(c.id, 1);
  assert.equal(c.easeFactor, 2.5);
  assert.equal(c.interval, 0);
  assert.equal(c.repetitions, 0);
  assert.equal(c.nextReview, NOW);
  assert.equal(store.length, 1);
});

test('test_create_flashcard_unique_ids', () => {
  const a = create_flashcard(store, {}, NOW);
  const b = create_flashcard(store, {}, NOW);
  assert.notEqual(a.id, b.id);
});

// --- review_flashcard ------------------------------------------------------

test('test_review_flashcard_quality_high_grows', () => {
  const c = create_flashcard(store, {}, NOW);
  review_flashcard(store, c.id, 5, NOW); // rep 1 -> interval 1
  assert.equal(c.repetitions, 1);
  assert.equal(c.interval, 1);
  review_flashcard(store, c.id, 5, NOW); // rep 2 -> interval 6
  assert.equal(c.interval, 6);
  assert.equal(c.nextReview, NOW + 6 * DAY_MS);
  review_flashcard(store, c.id, 5, NOW); // rep 3 -> interval * ease
  assert.ok(c.interval > 6);
  assert.ok(c.easeFactor >= 2.5);
});

test('test_review_flashcard_quality_low_resets', () => {
  const c = create_flashcard(store, {}, NOW);
  review_flashcard(store, c.id, 5, NOW);
  review_flashcard(store, c.id, 5, NOW);
  const easeBefore = c.easeFactor;
  review_flashcard(store, c.id, 1, NOW); // wrong
  assert.equal(c.repetitions, 0);
  assert.equal(c.interval, 1);
  assert.ok(c.easeFactor < easeBefore && c.easeFactor >= 1.3);
});

test('test_review_flashcard_unknown_card', () => {
  assert.throws(() => review_flashcard(store, 999, 4, NOW), /Card not found/);
});

test('test_review_flashcard_invalid_quality', () => {
  const c = create_flashcard(store, {}, NOW);
  assert.throws(() => review_flashcard(store, c.id, 7, NOW), /quality must be/);
});

// --- get_due_cards ---------------------------------------------------------

test('test_get_due_cards_filters_and_limits', () => {
  const a = create_flashcard(store, {}, NOW);
  const b = create_flashcard(store, {}, NOW);
  const c = create_flashcard(store, {}, NOW);
  // Push b into the future; a and c stay due at NOW.
  update_card_rating(store, b.id, { nextReview: NOW + 10 * DAY_MS });
  const due = get_due_cards(store, NOW, 5);
  assert.deepEqual(due.map((x) => x.id).sort(), [a.id, c.id].sort());
  // limit caps the result set.
  assert.equal(get_due_cards(store, NOW, 1).length, 1);
});

test('test_get_due_cards_rejects_bad_limit', () => {
  assert.throws(() => get_due_cards(store, NOW, -1), /non-negative integer/);
});

// --- update_card_rating ----------------------------------------------------

test('test_update_card_rating_sets_fields', () => {
  const c = create_flashcard(store, {}, NOW);
  update_card_rating(store, c.id, {
    easeFactor: 2.0,
    interval: 15,
    repetitions: 4,
    nextReview: NOW + 15 * DAY_MS,
  });
  assert.equal(c.easeFactor, 2.0);
  assert.equal(c.interval, 15);
  assert.equal(c.repetitions, 4);
  assert.equal(c.nextReview, NOW + 15 * DAY_MS);
});

test('test_update_card_rating_floors_ease_factor', () => {
  const c = create_flashcard(store, {}, NOW);
  update_card_rating(store, c.id, { easeFactor: 0.5 });
  assert.equal(c.easeFactor, 1.3);
});

test('test_update_card_rating_unknown_card', () => {
  assert.throws(() => update_card_rating(store, 42, { interval: 3 }), /Card not found/);
});
