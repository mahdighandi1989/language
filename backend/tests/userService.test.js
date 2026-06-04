/**
 * Unit tests for the user-account service.
 *
 * A fresh in-memory store per test keeps cases isolated; no database, no
 * network. Covers validation, permission checks and success/failure paths.
 */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  new_store,
  add_user,
  update_profile,
  change_password,
  delete_account,
  get_user_settings,
  is_valid_email,
  is_strong_password,
} from '../services/userService.js';

let store;
beforeEach(() => {
  store = new_store();
  add_user(store, { id: 'u1', email: 'a@example.com', name: 'A', password: 'Secret123' });
  add_user(store, { id: 'admin', email: 'admin@example.com', role: 'admin', password: 'Admin123x' });
});

// --- validation helpers ---------------------------------------------------

test('test_is_valid_email', () => {
  assert.equal(is_valid_email('x@y.com'), true);
  assert.equal(is_valid_email('bad'), false);
  assert.equal(is_valid_email(''), false);
});

test('test_is_strong_password', () => {
  assert.equal(is_strong_password('Secret123'), true);
  assert.equal(is_strong_password('short'), false);
  assert.equal(is_strong_password('alllettersonly'), false);
});

// --- update_profile -------------------------------------------------------

test('test_update_profile_success', () => {
  const u = update_profile(store, 'u1', 'u1', { name: 'New Name' });
  assert.equal(u.name, 'New Name');
});

test('test_update_profile_rejects_empty_name', () => {
  assert.throws(() => update_profile(store, 'u1', 'u1', { name: '  ' }), /must not be empty/);
});

test('test_update_profile_rejects_bad_email', () => {
  assert.throws(() => update_profile(store, 'u1', 'u1', { email: 'nope' }), /invalid email/);
});

test('test_update_profile_forbidden_for_other_user', () => {
  add_user(store, { id: 'u2', email: 'b@example.com' });
  assert.throws(() => update_profile(store, 'u1', 'u2', { name: 'X' }), /forbidden/);
});

test('test_update_profile_admin_can_edit_others', () => {
  const u = update_profile(store, 'admin', 'u1', { name: 'By Admin' });
  assert.equal(u.name, 'By Admin');
});

// --- change_password ------------------------------------------------------

test('test_change_password_success', () => {
  assert.equal(change_password(store, 'u1', 'Secret123', 'NewPass99'), true);
});

test('test_change_password_wrong_current', () => {
  assert.throws(() => change_password(store, 'u1', 'wrong', 'NewPass99'), /incorrect/);
});

test('test_change_password_weak_new', () => {
  assert.throws(() => change_password(store, 'u1', 'Secret123', 'weak'), /too weak/);
});

// --- delete_account -------------------------------------------------------

test('test_delete_account_success', () => {
  assert.equal(delete_account(store, 'u1', 'u1'), true);
  assert.equal(store.has('u1'), false);
});

test('test_delete_account_forbidden', () => {
  add_user(store, { id: 'u2', email: 'b@example.com' });
  assert.throws(() => delete_account(store, 'u1', 'u2'), /forbidden/);
});

test('test_delete_account_missing_user', () => {
  assert.throws(() => delete_account(store, 'admin', 'ghost'), /user not found/);
});

// --- get_user_settings ----------------------------------------------------

test('test_get_user_settings', () => {
  assert.deepEqual(get_user_settings(store, 'u1'), {});
});

test('test_get_user_settings_missing', () => {
  assert.throws(() => get_user_settings(store, 'ghost'), /user not found/);
});
