/**
 * Language-management domain logic (in-memory, dependency-free).
 *
 * Models the small catalogue of supported languages plus simple, offline
 * heuristics for language detection (script-based) and ISO 639-1 validation.
 * No database, no external translation/detection API.
 */

const ISO_639_1_RE = /^[a-z]{2}$/;

const DEFAULT_LANGUAGES = [
  { code: 'ar', name: 'Arabic' },
  { code: 'en', name: 'English' },
  { code: 'fa', name: 'Persian' },
];

/** Validate an ISO 639-1 code: exactly two lowercase letters. */
export function isValidISOCode(code) {
  return typeof code === 'string' && ISO_639_1_RE.test(code);
}

/** Fresh catalogue store, seeded with the default languages. */
export function new_store() {
  return new Map(DEFAULT_LANGUAGES.map((l) => [l.code, { ...l }]));
}

/** Add a language. Rejects invalid codes and duplicates. */
export function add_language(store, { code, name }) {
  if (!isValidISOCode(code)) throw new Error('invalid ISO 639-1 code');
  if (!name || !name.trim()) throw new Error('name is required');
  if (store.has(code)) throw new Error('language already exists');
  const lang = { code, name: name.trim() };
  store.set(code, lang);
  return lang;
}

/** List supported languages, sorted by code. */
export function get_supported_languages(store) {
  return [...store.values()].sort((a, b) => a.code.localeCompare(b.code));
}

/**
 * Detect the language of a string by script.
 * Returns an ISO 639-1 code ('ar' for Arabic script, 'en' for Latin) or null.
 */
export function detect_language(text) {
  if (typeof text !== 'string' || !text.trim()) return null;
  if (/[؀-ۿ]/.test(text)) return 'ar'; // Arabic block
  if (/[A-Za-z]/.test(text)) return 'en';
  return null;
}

/** All ordered (source, target) pairs of distinct supported languages. */
export function get_language_pairs(store) {
  const codes = [...store.keys()].sort();
  const pairs = [];
  for (const from of codes) {
    for (const to of codes) {
      if (from !== to) pairs.push({ from, to });
    }
  }
  return pairs;
}
