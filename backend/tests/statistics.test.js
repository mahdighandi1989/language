/**
 * Unit tests for the learning-statistics module.
 *
 * Uses only mock review records — no database, no Gemini API, fully offline.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  get_user_stats,
  get_learning_progress,
  get_weak_words,
} from '../services/statistics.js';

const MOCK = [
  { wordId: 1, score: 90 },
  { wordId: 1, score: 70 },
  { wordId: 2, score: 40 },
  { wordId: 3, score: 85 },
];

// --- get_user_stats -------------------------------------------------------

test('test_get_user_stats_counts_and_average', () => {
  const s = get_user_stats(MOCK);
  assert.equal(s.totalReviews, 4);
  assert.equal(s.learnedWords, 2); // words 1 and 3 hit >= 80
  assert.equal(s.averageScore, 71.25);
});

test('test_get_user_stats_empty', () => {
  assert.deepEqual(get_user_stats([]), {
    totalReviews: 0,
    learnedWords: 0,
    averageScore: 0,
  });
});

test('test_get_user_stats_rejects_non_array', () => {
  assert.throws(() => get_user_stats('nope'), /must be an array/);
});

// --- get_learning_progress ------------------------------------------------

test('test_get_learning_progress_percent', () => {
  const p = get_learning_progress(MOCK, 4);
  assert.equal(p.learned, 2);
  assert.equal(p.goal, 4);
  assert.equal(p.percent, 50);
});

test('test_get_learning_progress_zero_goal', () => {
  assert.equal(get_learning_progress(MOCK, 0).percent, 0);
});

test('test_get_learning_progress_rejects_negative_goal', () => {
  assert.throws(() => get_learning_progress(MOCK, -1), /non-negative/);
});

// --- get_weak_words -------------------------------------------------------

test('test_get_weak_words_sorted_ascending', () => {
  const weak = get_weak_words(MOCK, 2);
  assert.equal(weak.length, 2);
  assert.equal(weak[0].wordId, 2); // avg 40 -> weakest
  assert.equal(weak[0].averageScore, 40);
  assert.equal(weak[1].wordId, 1); // avg 80
  assert.equal(weak[1].averageScore, 80);
});

test('test_get_weak_words_rejects_bad_limit', () => {
  assert.throws(() => get_weak_words(MOCK, -3), /non-negative integer/);
});
