/**
 * Unit tests for the study-session domain logic.
 *
 * Fully offline and deterministic: no database, no network, no Gemini API.
 * `reset_ids` runs before each test so session/item ids are predictable and
 * every test is independent of the others.
 */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  create_session,
  add_word_to_session,
  review_word,
  get_session_progress,
  complete_session,
  reset_ids,
} from '../services/studySessions.js';

beforeEach(() => reset_ids());

// --- create_session -------------------------------------------------------

test('test_create_session_success', () => {
  const s = create_session('user-1');
  assert.equal(s.id, 1);
  assert.equal(s.userId, 'user-1');
  assert.equal(s.status, 'active');
  assert.deepEqual(s.words, []);
});

test('test_create_session_requires_user', () => {
  assert.throws(() => create_session(''), /userId is required/);
  assert.throws(() => create_session(null), /userId is required/);
});

// --- add_word_to_session --------------------------------------------------

test('test_add_word_success', () => {
  const s = create_session('u');
  const item = add_word_to_session(s, { wordId: 10, text: 'مرحبا' });
  assert.equal(item.wordId, 10);
  assert.equal(item.easeFactor, 2.5);
  assert.equal(s.words.length, 1);
});

test('test_add_word_rejects_duplicate', () => {
  const s = create_session('u');
  add_word_to_session(s, { wordId: 10 });
  assert.throws(() => add_word_to_session(s, { wordId: 10 }), /already in session/);
});

test('test_add_word_requires_word_id', () => {
  const s = create_session('u');
  assert.throws(() => add_word_to_session(s, {}), /wordId is required/);
});

test('test_add_word_rejected_on_completed_session', () => {
  const s = create_session('u');
  complete_session(s);
  assert.throws(() => add_word_to_session(s, { wordId: 1 }), /completed session/);
});

// --- review_word: spaced repetition (3 scenarios) -------------------------

test('test_review_word_correct_grows_interval', () => {
  const s = create_session('u');
  add_word_to_session(s, { wordId: 1 });
  const a = review_word(s, 1, 5); // first correct
  assert.equal(a.repetitions, 1);
  assert.equal(a.interval, 1);
  const b = review_word(s, 1, 5); // second correct
  assert.equal(b.repetitions, 2);
  assert.equal(b.interval, 6);
  const c = review_word(s, 1, 5); // third correct -> interval * easeFactor
  assert.equal(c.repetitions, 3);
  assert.ok(c.interval > 6);
  assert.ok(c.easeFactor >= 2.5);
});

test('test_review_word_partial_keeps_ease_factor', () => {
  const s = create_session('u');
  add_word_to_session(s, { wordId: 1 });
  const r = review_word(s, 1, 3); // partial pass
  assert.equal(r.repetitions, 1);
  assert.equal(r.interval, 1);
  assert.equal(r.easeFactor, 2.5); // unchanged for quality === 3
});

test('test_review_word_wrong_resets', () => {
  const s = create_session('u');
  add_word_to_session(s, { wordId: 1 });
  review_word(s, 1, 5);
  const easeBefore = review_word(s, 1, 5).easeFactor;
  const r = review_word(s, 1, 1); // wrong answer
  assert.equal(r.repetitions, 0);
  assert.equal(r.interval, 1);
  assert.ok(r.easeFactor < easeBefore);
  assert.ok(r.easeFactor >= 1.3);
});

test('test_review_word_invalid_quality', () => {
  const s = create_session('u');
  add_word_to_session(s, { wordId: 1 });
  assert.throws(() => review_word(s, 1, 9), /quality must be/);
});

test('test_review_word_unknown_word', () => {
  const s = create_session('u');
  assert.throws(() => review_word(s, 99, 4), /word not in session/);
});

// --- get_session_progress -------------------------------------------------

test('test_get_session_progress', () => {
  const s = create_session('u');
  assert.deepEqual(get_session_progress(s), {
    total: 0,
    reviewed: 0,
    correct: 0,
    percent: 0,
  });
  add_word_to_session(s, { wordId: 1 });
  add_word_to_session(s, { wordId: 2 });
  review_word(s, 1, 5); // correct
  review_word(s, 2, 1); // wrong
  const p = get_session_progress(s);
  assert.equal(p.total, 2);
  assert.equal(p.reviewed, 2);
  assert.equal(p.correct, 1);
  assert.equal(p.percent, 100);
});

// --- complete_session -----------------------------------------------------

test('test_complete_session_success', () => {
  const s = create_session('u');
  add_word_to_session(s, { wordId: 1 });
  review_word(s, 1, 4);
  const done = complete_session(s);
  assert.equal(done.status, 'completed');
  assert.equal(done.progress.correct, 1);
});

test('test_complete_session_twice_fails', () => {
  const s = create_session('u');
  complete_session(s);
  assert.throws(() => complete_session(s), /already completed/);
});
