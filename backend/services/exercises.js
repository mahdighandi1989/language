/**
 * Exercise-generation and grading logic (in-memory, dependency-free).
 *
 * Supports three exercise types — multiple_choice, fill_in_blank and
 * matching — with pure generation, answer-checking and scoring functions so
 * the unit suite can exercise every type and its error cases offline.
 */

const EXERCISE_TYPES = ['multiple_choice', 'fill_in_blank', 'matching'];

/** The supported exercise type identifiers. */
export function get_exercise_types() {
  return [...EXERCISE_TYPES];
}

/**
 * Build an exercise descriptor from a spec.
 * @param {string} type - one of get_exercise_types()
 * @param {object} spec - { prompt, answer, options?, pairs? }
 */
export function generate_exercise(type, spec = {}) {
  if (!EXERCISE_TYPES.includes(type)) {
    throw new Error(`invalid exercise type: ${type}`);
  }
  const { prompt = '', answer, options, pairs } = spec;
  if (type === 'multiple_choice') {
    if (!Array.isArray(options) || options.length < 2) {
      throw new Error('multiple_choice requires at least 2 options');
    }
    if (!options.includes(answer)) {
      throw new Error('answer must be one of the options');
    }
    return { type, prompt, options: [...options], answer };
  }
  if (type === 'fill_in_blank') {
    if (answer === undefined || answer === null || `${answer}`.trim() === '') {
      throw new Error('fill_in_blank requires a non-empty answer');
    }
    return { type, prompt, answer: `${answer}` };
  }
  // matching
  if (!pairs || typeof pairs !== 'object' || Object.keys(pairs).length === 0) {
    throw new Error('matching requires a non-empty pairs map');
  }
  return { type, prompt, pairs: { ...pairs } };
}

/**
 * Check a learner's answer against an exercise. Returns true/false.
 * Throws on a missing/empty answer.
 */
export function check_answer(exercise, given) {
  if (!exercise || !exercise.type) throw new Error('invalid exercise');
  if (given === undefined || given === null) {
    throw new Error('answer must not be empty');
  }
  if (exercise.type === 'matching') {
    if (typeof given !== 'object') throw new Error('matching answer must be a map');
    const keys = Object.keys(exercise.pairs);
    return keys.every((k) => given[k] === exercise.pairs[k]) &&
      Object.keys(given).length === keys.length;
  }
  const normalize = (v) => `${v}`.trim().toLowerCase();
  if (normalize(given) === '') throw new Error('answer must not be empty');
  return normalize(given) === normalize(exercise.answer);
}

/**
 * Score a batch of results.
 * @param {Array<boolean>} results
 * @returns {{correct:number, total:number, percent:number}}
 */
export function calculate_score(results = []) {
  if (!Array.isArray(results)) throw new Error('results must be an array');
  const total = results.length;
  const correct = results.filter(Boolean).length;
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);
  return { correct, total, percent };
}
