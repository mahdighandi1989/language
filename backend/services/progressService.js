/**
 * Progress-tracking domain logic (in-memory, dependency-free).
 *
 * Pure functions over a plain progress object and activity-date lists so the
 * unit suite can assert streak and mastery maths offline. Dates are ISO
 * 'YYYY-MM-DD' strings, which keeps tests deterministic (no wall-clock).
 *
 * Progress shape: { wordsLearned, sessionsCompleted, scores: number[] }
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** A fresh, zeroed progress record. */
export function new_progress() {
  return { wordsLearned: 0, sessionsCompleted: 0, scores: [] };
}

/**
 * Apply a delta to a progress record.
 * @param {object} progress
 * @param {{wordsLearned?:number, sessionsCompleted?:number, score?:number}} delta
 */
export function update_progress(progress, delta = {}) {
  if (!progress) throw new Error('progress is required');
  if (delta.wordsLearned !== undefined) {
    if (delta.wordsLearned < 0) throw new Error('wordsLearned delta must be >= 0');
    progress.wordsLearned += delta.wordsLearned;
  }
  if (delta.sessionsCompleted !== undefined) {
    if (delta.sessionsCompleted < 0) throw new Error('sessionsCompleted delta must be >= 0');
    progress.sessionsCompleted += delta.sessionsCompleted;
  }
  if (delta.score !== undefined) {
    if (delta.score < 0 || delta.score > 100) throw new Error('score must be in [0, 100]');
    progress.scores.push(delta.score);
  }
  return progress;
}

/**
 * Current learning streak: the count of consecutive days (ending at the most
 * recent activity date) on which there was activity.
 * @param {string[]} activityDates - ISO 'YYYY-MM-DD' strings
 */
export function get_learning_streak(activityDates = []) {
  if (!Array.isArray(activityDates)) throw new Error('activityDates must be an array');
  const days = [...new Set(activityDates)]
    .map((d) => Date.parse(d))
    .filter((t) => !Number.isNaN(t))
    .sort((a, b) => b - a); // most recent first
  if (days.length === 0) return 0;
  let streak = 1;
  for (let i = 1; i < days.length; i += 1) {
    const gap = Math.round((days[i - 1] - days[i]) / DAY_MS);
    if (gap === 1) streak += 1;
    else break;
  }
  return streak;
}

/**
 * Mastery level from the average of recorded scores.
 *  avg > 80 -> 'advanced', avg > 60 -> 'intermediate', else 'beginner'.
 */
export function get_mastery_level(progress) {
  if (!progress) throw new Error('progress is required');
  const scores = progress.scores ?? [];
  if (scores.length === 0) return 'beginner';
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  if (avg > 80) return 'advanced';
  if (avg > 60) return 'intermediate';
  return 'beginner';
}

/**
 * Achievement keys unlocked by the current progress + streak.
 */
export function get_achievements(progress, activityDates = []) {
  if (!progress) throw new Error('progress is required');
  const achievements = [];
  if (progress.wordsLearned >= 1) achievements.push('first_word');
  if (progress.wordsLearned >= 100) achievements.push('century');
  if (progress.sessionsCompleted >= 10) achievements.push('dedicated_learner');
  if (get_learning_streak(activityDates) >= 7) achievements.push('week_streak');
  return achievements;
}
