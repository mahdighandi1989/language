/**
 * Flashcard scheduling with the SM-2 spaced-repetition algorithm.
 *
 * Dependency-free and in-memory: a "store" is just an array of card objects the
 * caller owns, so the unit suite is fully isolated (a fresh store per test) and
 * offline. `now` is injectable everywhere a timestamp is needed, keeping the
 * scheduling maths deterministic under test.
 *
 * Card shape:
 *   { id, front, back, easeFactor, interval, repetitions, nextReview }
 */

let _nextId = 0;

/** Fresh, empty card store. Tests call this in `beforeEach`. */
export function new_store() {
  _nextId = 0;
  return [];
}

function _find(store, id) {
  const card = store.find((c) => c.id === id);
  if (!card) throw new Error('Card not found');
  return card;
}

/**
 * Create a flashcard with SM-2 defaults and append it to the store.
 * @returns {object} the new card (with a unique id)
 */
export function create_flashcard(store, { front = '', back = '' } = {}, now = Date.now()) {
  if (!Array.isArray(store)) throw new Error('store must be an array');
  _nextId += 1;
  const card = {
    id: _nextId,
    front,
    back,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: now,
  };
  store.push(card);
  return card;
}

/**
 * Apply an SM-2 review of `quality` in [0, 5] to one card.
 *  - quality >= 3: interval grows (1, 6, then round(interval * easeFactor)),
 *    repetitions++, easeFactor adjusted upward by the SM-2 formula.
 *  - quality < 3: repetitions reset to 0, interval to 1, easeFactor decreased
 *    (floored at 1.3).
 * `nextReview` advances by `interval` days from `now`.
 */
export function review_flashcard(store, id, quality, now = Date.now()) {
  if (!Number.isInteger(quality) || quality < 0 || quality > 5) {
    throw new Error('quality must be an integer in [0, 5]');
  }
  const card = _find(store, id);
  if (quality < 3) {
    card.repetitions = 0;
    card.interval = 1;
    card.easeFactor = Math.max(1.3, card.easeFactor - 0.2);
  } else {
    if (card.repetitions === 0) card.interval = 1;
    else if (card.repetitions === 1) card.interval = 6;
    else card.interval = Math.round(card.interval * card.easeFactor);
    card.repetitions += 1;
    card.easeFactor = Math.max(
      1.3,
      card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
    );
  }
  const DAY_MS = 24 * 60 * 60 * 1000;
  card.nextReview = now + card.interval * DAY_MS;
  return card;
}

/**
 * Cards whose `nextReview` is due (<= now), oldest first, capped at `limit`.
 */
export function get_due_cards(store, now = Date.now(), limit = 20) {
  if (!Number.isInteger(limit) || limit < 0) {
    throw new Error('limit must be a non-negative integer');
  }
  return store
    .filter((c) => c.nextReview <= now)
    .sort((a, b) => a.nextReview - b.nextReview)
    .slice(0, limit);
}

/**
 * Directly set a card's scheduling fields (e.g. after an external grade sync).
 */
export function update_card_rating(store, id, { easeFactor, interval, repetitions, nextReview } = {}) {
  const card = _find(store, id);
  if (easeFactor !== undefined) card.easeFactor = Math.max(1.3, easeFactor);
  if (interval !== undefined) card.interval = interval;
  if (repetitions !== undefined) card.repetitions = repetitions;
  if (nextReview !== undefined) card.nextReview = nextReview;
  return card;
}
