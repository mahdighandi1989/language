/**
 * User-account domain logic (in-memory, dependency-free).
 *
 * Pure functions over an in-memory user map so the unit suite can assert
 * validation, permission checks and success/failure paths with no database.
 * Passwords are never stored or returned in plaintext beyond a trivial,
 * non-cryptographic hash marker — this module models behaviour, not a real
 * credential store.
 *
 * User shape: { id, email, name, passwordHash, role, settings }
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Fresh, empty user store keyed by id. */
export function new_store() {
  return new Map();
}

function _hash(password) {
  // Deterministic, non-cryptographic marker — sufficient for unit logic.
  return `h:${password.length}:${password.split('').reduce((a, c) => a + c.charCodeAt(0), 0)}`;
}

export function is_valid_email(email) {
  return typeof email === 'string' && EMAIL_RE.test(email);
}

export function is_strong_password(password) {
  return typeof password === 'string' && password.length >= 8 &&
    /[A-Za-z]/.test(password) && /[0-9]/.test(password);
}

/** Seed a user into the store (test/helper convenience). */
export function add_user(store, { id, email, name = '', password = 'Passw0rd', role = 'member' }) {
  if (!is_valid_email(email)) throw new Error('invalid email');
  store.set(id, { id, email, name, passwordHash: _hash(password), role, settings: {} });
  return store.get(id);
}

function _require(store, id) {
  const user = store.get(id);
  if (!user) throw new Error('user not found');
  return user;
}

/**
 * Update a user's profile. Only the user themselves (or an admin) may do so.
 */
export function update_profile(store, actorId, targetId, { name, email } = {}) {
  const actor = _require(store, actorId);
  if (actorId !== targetId && actor.role !== 'admin') {
    throw new Error('forbidden');
  }
  const user = _require(store, targetId);
  if (name !== undefined) {
    if (!name || !name.trim()) throw new Error('name must not be empty');
    user.name = name.trim();
  }
  if (email !== undefined) {
    if (!is_valid_email(email)) throw new Error('invalid email');
    user.email = email;
  }
  return user;
}

/**
 * Change a user's password after verifying the current one and the new
 * password's strength.
 */
export function change_password(store, id, currentPassword, newPassword) {
  const user = _require(store, id);
  if (user.passwordHash !== _hash(currentPassword)) {
    throw new Error('current password is incorrect');
  }
  if (!is_strong_password(newPassword)) {
    throw new Error('new password is too weak');
  }
  user.passwordHash = _hash(newPassword);
  return true;
}

/** Delete an account. Only the owner or an admin may delete it. */
export function delete_account(store, actorId, targetId) {
  const actor = _require(store, actorId);
  if (actorId !== targetId && actor.role !== 'admin') {
    throw new Error('forbidden');
  }
  _require(store, targetId);
  store.delete(targetId);
  return true;
}

/** Return a user's settings object. */
export function get_user_settings(store, id) {
  return _require(store, id).settings;
}
