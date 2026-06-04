/**
 * Study-session domain logic (in-memory, dependency-free).
 *
 * The production backend is a Node/Express + Gemini service; this module is a
 * pure, side-effect-free model of a "study session" so the unit suite can
 * exercise the spaced-repetition flow with no database and no network. State
 * is held in plain objects that the caller owns, which keeps every test fully
 * isolated (no shared globals to reset).
 *
 * A session groups the words a learner is reviewing in one sitting and tracks,
 * per word, the SM-2-style scheduling fields that drive spaced repetition.
 */

let _nextSessionId = 0;
let _nextItemId = 0;

/** Reset the internal id counters. Tests call this in `beforeEach` for
 * deterministic ids; production code never needs it. */
export function reset_ids() {
  _nextSessionId = 0;
  _nextItemId = 0;
}

/**
 * Create a new, empty study session for a user.
 * @param {string|number} userId
 * @returns {object} session
 */
export function create_session(userId) {
  if (userId === undefined || userId === null || userId === '') {
    throw new Error('userId is required');
  }
  _nextSessionId += 1;
  return {
    id: _nextSessionId,
    userId,
    status: 'active',
    words: [],
  };
}

/**
 * Add a word to an active session. Rejects duplicates and completed sessions.
 * @param {object} session
 * @param {object} word - must have a unique `wordId`
 * @returns {object} the session item that was created
 */
export function add_word_to_session(session, word) {
  if (!session) throw new Error('session is required');
  if (session.status !== 'active') {
    throw new Error('cannot add words to a completed session');
  }
  if (!word || word.wordId === undefined || word.wordId === null) {
    throw new Error('word.wordId is required');
  }
  if (session.words.some((w) => w.wordId === word.wordId)) {
    throw new Error(`word already in session: ${word.wordId}`);
  }
  _nextItemId += 1;
  const item = {
    itemId: _nextItemId,
    wordId: word.wordId,
    text: word.text ?? '',
    // SM-2 scheduling state.
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    reviewed: false,
    lastQuality: null,
  };
  session.words.push(item);
  return item;
}

/**
 * Update one word's scheduling state given a review `quality` in [0, 5].
 *
 * Spaced-repetition rules (SM-2), covering three scenarios:
 *  - correct (quality >= 4): repetitions++ and interval grows (1, 6, then
 *    interval * easeFactor); easeFactor nudges up.
 *  - partially correct (quality === 3): still a pass, interval grows but
 *    easeFactor is unchanged.
 *  - wrong (quality < 3): repetitions reset to 0, interval back to 1 and
 *    easeFactor decreases (floored at 1.3).
 */
export function review_word(session, wordId, quality) {
  if (!session) throw new Error('session is required');
  if (!Number.isInteger(quality) || quality < 0 || quality > 5) {
    throw new Error('quality must be an integer in [0, 5]');
  }
  const item = session.words.find((w) => w.wordId === wordId);
  if (!item) throw new Error(`word not in session: ${wordId}`);

  if (quality < 3) {
    item.repetitions = 0;
    item.interval = 1;
    item.easeFactor = Math.max(1.3, item.easeFactor - 0.2);
  } else {
    if (item.repetitions === 0) item.interval = 1;
    else if (item.repetitions === 1) item.interval = 6;
    else item.interval = Math.round(item.interval * item.easeFactor);
    item.repetitions += 1;
    if (quality >= 4) {
      item.easeFactor = Math.min(
        2.7,
        item.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
      );
    }
  }
  item.reviewed = true;
  item.lastQuality = quality;
  return item;
}

/**
 * Summarise progress over a session's words.
 * @returns {{total:number, reviewed:number, correct:number, percent:number}}
 */
export function get_session_progress(session) {
  if (!session) throw new Error('session is required');
  const total = session.words.length;
  const reviewed = session.words.filter((w) => w.reviewed).length;
  const correct = session.words.filter(
    (w) => w.reviewed && w.lastQuality >= 3,
  ).length;
  const percent = total === 0 ? 0 : Math.round((reviewed / total) * 100);
  return { total, reviewed, correct, percent };
}

/**
 * Mark a session complete. Idempotent guard: a session can only be completed
 * once.
 */
export function complete_session(session) {
  if (!session) throw new Error('session is required');
  if (session.status === 'completed') {
    throw new Error('session already completed');
  }
  session.status = 'completed';
  session.progress = get_session_progress(session);
  return session;
}
