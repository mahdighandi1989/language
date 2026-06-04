/**
 * Learning-statistics domain logic (in-memory, dependency-free).
 *
 * Pure functions over plain "review record" arrays so the unit suite can
 * assert the maths (averages, progress %, weak-word selection) with mock data
 * and no database or network.
 *
 * A review record looks like:
 *   { wordId, score (0..100), reviewedAt (ISO string or epoch ms) }
 */

/** Average of a numeric array, 0 for empty input. */
function _avg(nums) {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/**
 * Aggregate per-user stats from their review records.
 * @returns {{totalReviews:number, learnedWords:number, averageScore:number}}
 */
export function get_user_stats(records = []) {
  if (!Array.isArray(records)) throw new Error('records must be an array');
  const totalReviews = records.length;
  // A word is "learned" once any review scores it >= 80.
  const learned = new Set(
    records.filter((r) => r.score >= 80).map((r) => r.wordId),
  );
  return {
    totalReviews,
    learnedWords: learned.size,
    averageScore: Math.round(_avg(records.map((r) => r.score)) * 100) / 100,
  };
}

/**
 * Progress toward a goal: fraction of the goal's words that are learned.
 * @returns {{learned:number, goal:number, percent:number}}
 */
export function get_learning_progress(records = [], goal = 0) {
  if (!Number.isFinite(goal) || goal < 0) {
    throw new Error('goal must be a non-negative number');
  }
  const { learnedWords } = get_user_stats(records);
  const percent = goal === 0 ? 0 : Math.min(100, Math.round((learnedWords / goal) * 100));
  return { learned: learnedWords, goal, percent };
}

/**
 * The `limit` lowest-average-scoring words (the learner's weakest), ascending
 * by average score.
 */
export function get_weak_words(records = [], limit = 5) {
  if (!Number.isInteger(limit) || limit < 0) {
    throw new Error('limit must be a non-negative integer');
  }
  const byWord = new Map();
  for (const r of records) {
    if (!byWord.has(r.wordId)) byWord.set(r.wordId, []);
    byWord.get(r.wordId).push(r.score);
  }
  return [...byWord.entries()]
    .map(([wordId, scores]) => ({
      wordId,
      averageScore: Math.round(_avg(scores) * 100) / 100,
    }))
    .sort((a, b) => a.averageScore - b.averageScore)
    .slice(0, limit);
}
