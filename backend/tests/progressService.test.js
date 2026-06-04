/**
 * Unit tests for the progress-tracking service. Fully offline and
 * deterministic (fixed ISO date strings, no wall-clock).
 */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  new_progress,
  update_progress,
  get_learning_streak,
  get_mastery_level,
  get_achievements,
} from '../services/progressService.js';

let progress;
beforeEach(() => {
  progress = new_progress();
});

// --- update_progress ------------------------------------------------------

test('test_update_progress_accumulates', () => {
  update_progress(progress, { wordsLearned: 3, score: 90 });
  update_progress(progress, { wordsLearned: 2, sessionsCompleted: 1, score: 70 });
  assert.equal(progress.wordsLearned, 5);
  assert.equal(progress.sessionsCompleted, 1);
  assert.deepEqual(progress.scores, [90, 70]);
});

test('test_update_progress_rejects_bad_score', () => {
  assert.throws(() => update_progress(progress, { score: 150 }), /score must be in/);
});

// --- get_learning_streak --------------------------------------------------

test('test_streak_single_day', () => {
  assert.equal(get_learning_streak(['2026-06-01']), 1);
});

test('test_streak_five_consecutive_days', () => {
  assert.equal(
    get_learning_streak([
      '2026-06-01',
      '2026-06-02',
      '2026-06-03',
      '2026-06-04',
      '2026-06-05',
    ]),
    5,
  );
});

test('test_streak_breaks_on_gap', () => {
  // 06-05 and 06-04 are consecutive; the gap before 06-01 breaks the streak.
  assert.equal(get_learning_streak(['2026-06-01', '2026-06-04', '2026-06-05']), 2);
});

test('test_streak_empty', () => {
  assert.equal(get_learning_streak([]), 0);
});

test('test_streak_dedupes', () => {
  assert.equal(get_learning_streak(['2026-06-01', '2026-06-01']), 1);
});

// --- get_mastery_level ----------------------------------------------------

test('test_mastery_advanced', () => {
  update_progress(progress, { score: 90 });
  update_progress(progress, { score: 95 });
  assert.equal(get_mastery_level(progress), 'advanced');
});

test('test_mastery_intermediate', () => {
  update_progress(progress, { score: 70 });
  update_progress(progress, { score: 65 });
  assert.equal(get_mastery_level(progress), 'intermediate');
});

test('test_mastery_beginner', () => {
  update_progress(progress, { score: 40 });
  assert.equal(get_mastery_level(progress), 'beginner');
  assert.equal(get_mastery_level(new_progress()), 'beginner'); // no scores
});

// --- get_achievements -----------------------------------------------------

test('test_achievements', () => {
  update_progress(progress, { wordsLearned: 100, sessionsCompleted: 10 });
  const dates = ['2026-06-01', '2026-06-02', '2026-06-03', '2026-06-04',
    '2026-06-05', '2026-06-06', '2026-06-07'];
  const a = get_achievements(progress, dates);
  assert.ok(a.includes('first_word'));
  assert.ok(a.includes('century'));
  assert.ok(a.includes('dedicated_learner'));
  assert.ok(a.includes('week_streak'));
});

test('test_achievements_none', () => {
  assert.deepEqual(get_achievements(new_progress(), []), []);
});
