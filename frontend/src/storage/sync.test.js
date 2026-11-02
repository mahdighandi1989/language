import { describe, it, expect } from 'vitest';
import { shouldSaveToCloud, serializeForSync } from './sync.js';

describe('cloud-sync guards', () => {
  const json = serializeForSync({ lessons: [1] });
  it('never saves before this user\'s document was loaded', () => {
    expect(shouldSaveToCloud({ loadedUid: null, userId: 'u1', json, lastSyncedJson: null })).toBe(false);
    expect(shouldSaveToCloud({ loadedUid: 'old', userId: 'u1', json, lastSyncedJson: null })).toBe(false);
  });
  it('does not re-save what was just loaded/saved', () => {
    expect(shouldSaveToCloud({ loadedUid: 'u1', userId: 'u1', json, lastSyncedJson: json })).toBe(false);
  });
  it('saves a real change', () => {
    expect(shouldSaveToCloud({ loadedUid: 'u1', userId: 'u1', json, lastSyncedJson: '{}' })).toBe(true);
  });
  it('refuses unserialisable state', () => {
    const a = {}; a.self = a;
    expect(serializeForSync(a)).toBeNull();
    expect(shouldSaveToCloud({ loadedUid: 'u1', userId: 'u1', json: null, lastSyncedJson: '{}' })).toBe(false);
  });
});
