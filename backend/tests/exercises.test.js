/**
 * Unit tests for the exercise generation/grading service. Fully offline.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  get_exercise_types,
  generate_exercise,
  check_answer,
  calculate_score,
} from '../services/exercises.js';

// --- get_exercise_types ---------------------------------------------------

test('test_get_exercise_types', () => {
  assert.deepEqual(get_exercise_types(), [
    'multiple_choice',
    'fill_in_blank',
    'matching',
  ]);
});

// --- multiple_choice ------------------------------------------------------

test('test_generate_multiple_choice', () => {
  const ex = generate_exercise('multiple_choice', {
    prompt: 'hello in Arabic?',
    options: ['مرحبا', 'وداعا'],
    answer: 'مرحبا',
  });
  assert.equal(ex.type, 'multiple_choice');
  assert.equal(check_answer(ex, 'مرحبا'), true);
  assert.equal(check_answer(ex, 'وداعا'), false);
});

test('test_multiple_choice_answer_must_be_option', () => {
  assert.throws(
    () => generate_exercise('multiple_choice', { options: ['a', 'b'], answer: 'c' }),
    /must be one of the options/,
  );
});

test('test_multiple_choice_needs_two_options', () => {
  assert.throws(
    () => generate_exercise('multiple_choice', { options: ['a'], answer: 'a' }),
    /at least 2 options/,
  );
});

// --- fill_in_blank --------------------------------------------------------

test('test_generate_fill_in_blank', () => {
  const ex = generate_exercise('fill_in_blank', { prompt: 'book = ___', answer: 'كتاب' });
  assert.equal(check_answer(ex, 'كتاب'), true);
  assert.equal(check_answer(ex, 'قلم'), false);
});

test('test_fill_in_blank_case_insensitive', () => {
  const ex = generate_exercise('fill_in_blank', { answer: 'Hello' });
  assert.equal(check_answer(ex, '  hello '), true);
});

test('test_fill_in_blank_requires_answer', () => {
  assert.throws(() => generate_exercise('fill_in_blank', { answer: '  ' }), /non-empty answer/);
});

// --- matching -------------------------------------------------------------

test('test_generate_and_check_matching', () => {
  const ex = generate_exercise('matching', { pairs: { book: 'كتاب', pen: 'قلم' } });
  assert.equal(check_answer(ex, { book: 'كتاب', pen: 'قلم' }), true);
  assert.equal(check_answer(ex, { book: 'كتاب', pen: 'خطأ' }), false);
});

test('test_matching_requires_pairs', () => {
  assert.throws(() => generate_exercise('matching', { pairs: {} }), /non-empty pairs/);
});

// --- error cases ----------------------------------------------------------

test('test_generate_invalid_type', () => {
  assert.throws(() => generate_exercise('essay', {}), /invalid exercise type/);
});

test('test_check_answer_empty', () => {
  const ex = generate_exercise('fill_in_blank', { answer: 'x' });
  assert.throws(() => check_answer(ex, null), /must not be empty/);
  assert.throws(() => check_answer(ex, '   '), /must not be empty/);
});

// --- calculate_score ------------------------------------------------------

test('test_calculate_score', () => {
  assert.deepEqual(calculate_score([true, true, false, true]), {
    correct: 3,
    total: 4,
    percent: 75,
  });
  assert.deepEqual(calculate_score([]), { correct: 0, total: 0, percent: 0 });
});

test('test_calculate_score_rejects_non_array', () => {
  assert.throws(() => calculate_score('nope'), /must be an array/);
});
