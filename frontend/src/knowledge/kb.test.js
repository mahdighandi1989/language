import { describe, it, expect } from 'vitest';
import { categoryList, updateItem, deleteItem, addCategory, renameCategory, removeCategory, matches } from './kb.js';

const kb = { vocabulary: [{ id: 1, term: 'بيت', definition: 'خانه' }, { term: 'باب', definition: 'در' }], grammar: [] };

describe('knowledge center edits', () => {
  it('edits, moves and deletes items (by id, or by term for old items)', () => {
    const a = updateItem(kb, 'vocabulary', { id: 1 }, { definition: 'منزل' });
    expect(a.vocabulary[0].definition).toBe('منزل');
    expect(kb.vocabulary[0].definition).toBe('خانه'); // immutable
    const b = updateItem(kb, 'vocabulary', { term: 'باب' }, {}, 'phrases');
    expect(b.vocabulary).toHaveLength(1);
    expect(b.phrases[0].term).toBe('باب');
    expect(deleteItem(kb, 'vocabulary', { id: 1 }).vocabulary).toHaveLength(1);
  });
  it('adds/renames tabs and refuses to remove a non-empty tab', () => {
    const { kb: k2, meta, key } = addCategory(kb, {}, 'اعداد');
    expect(categoryList(k2, meta).find((c) => c.key === key).label).toBe('اعداد');
    expect(categoryList(k2, renameCategory(meta, 'vocabulary', 'واژه‌ها'))[0].label).toBe('واژه‌ها');
    expect(removeCategory(k2, meta, 'vocabulary')).toBeNull();
    const r = removeCategory(k2, meta, key);
    expect(r.kb[key]).toBeUndefined();
    const g = removeCategory(k2, meta, 'grammar');
    expect(g.kb.grammar).toEqual([]);
    expect(categoryList(g.kb, g.meta).find((c) => c.key === 'grammar').hidden).toBe(true);
  });
  it('search tolerates items without fields', () => {
    expect(matches({}, 'x')).toBe(false);
    expect(matches({ source: 'درس: ریتا' }, 'ریتا')).toBe(true);
  });
});
