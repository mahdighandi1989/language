/**
 * Unit tests for the language-management service. Fully offline — no external
 * detection/translation API.
 */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  new_store,
  add_language,
  get_supported_languages,
  detect_language,
  get_language_pairs,
  isValidISOCode,
} from '../services/languageService.js';

let store;
beforeEach(() => {
  store = new_store();
});

test('test_add_language_success', () => {
  const lang = add_language(store, { code: 'fr', name: 'French' });
  assert.deepEqual(lang, { code: 'fr', name: 'French' });
  assert.ok(store.has('fr'));
});

test('test_add_language_duplicate_code', () => {
  assert.throws(() => add_language(store, { code: 'ar', name: 'Arabic' }), /already exists/);
});

test('test_detect_language_arabic', () => {
  assert.equal(detect_language('مرحبا كيف حالك'), 'ar');
});

test('test_detect_language_english', () => {
  assert.equal(detect_language('hello world'), 'en');
});

test('test_detect_language_empty', () => {
  assert.equal(detect_language('   '), null);
  assert.equal(detect_language(123), null);
});

test('test_valid_iso_code', () => {
  assert.equal(isValidISOCode('en'), true);
  assert.equal(isValidISOCode('ar'), true);
});

test('test_invalid_iso_code', () => {
  assert.equal(isValidISOCode('eng'), false); // three letters
  assert.equal(isValidISOCode('E'), false);
  assert.equal(isValidISOCode('EN'), false); // uppercase not allowed
  assert.equal(isValidISOCode(''), false);
});

test('test_add_language_rejects_bad_code', () => {
  assert.throws(() => add_language(store, { code: 'eng', name: 'English' }), /invalid ISO/);
});

test('test_get_supported_languages_sorted', () => {
  const codes = get_supported_languages(store).map((l) => l.code);
  assert.deepEqual(codes, ['ar', 'en', 'fa']);
});

test('test_get_language_pairs', () => {
  const pairs = get_language_pairs(store);
  // 3 languages -> 3 * 2 = 6 ordered pairs, none self-paired.
  assert.equal(pairs.length, 6);
  assert.ok(pairs.every((p) => p.from !== p.to));
});
