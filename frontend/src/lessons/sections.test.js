import { describe, it, expect } from 'vitest';
import { sectionsToCloud, sectionsToWrite, mergeSection, hasInlineSections, docUsage, sectionKey, SECTIONS } from './sections.js';
import { textHash } from './lessonBodies.js';

const defaults = { knowledgeBase: { vocabulary: [], grammar: [] }, journal: [], chatHistories: { global: [] } };
const kb = { vocabulary: Array.from({ length: 1334 }, (_, i) => ({ id: i, term: `كلمة ${i}`, definition: `معنی ${i}` })), grammar: [] };

describe('sections out of the main document', () => {
  it('replaces sections by refs, strips transient fields, keeps the stored ref of a PENDING section', () => {
    const data = { lessons: [], knowledgeBase: kb, journal: [{ id: 1, entry: 'x' }], _sectionsPending: ['chatHistories'], chatHistories: { global: [] }, sectionRefs: { chatHistories: { key: 'S_chatHistories', chars: 99, hash: 'old' } } };
    const doc = sectionsToCloud({ ...data }, data);
    expect(doc.knowledgeBase).toBeUndefined();
    expect(doc.journal).toBeUndefined();
    expect(doc._sectionsPending).toBeUndefined();
    expect(doc.sectionRefs.chatHistories.hash).toBe('old'); // not loaded ⇒ never re-pointed to the empty default
    expect(doc.sectionRefs.knowledgeBase.key).toBe('S_knowledgeBase');
    const writes = sectionsToWrite(data, new Map([[sectionKey('journal'), doc.sectionRefs.journal.hash]]));
    expect(writes.map((w) => w.section)).toEqual(['knowledgeBase']); // journal unchanged, chat pending
    expect(textHash(writes[0].archivedNotes)).toBe(doc.sectionRefs.knowledgeBase.hash);
    expect(JSON.parse(writes[0].archivedNotes).vocabulary).toHaveLength(1334);
  });
  it('merging never loses data: default ⇒ stored; edits while loading are unioned', () => {
    expect(mergeSection('knowledgeBase', kb, defaults.knowledgeBase, defaults.knowledgeBase)).toBe(kb);
    const local = { vocabulary: [{ id: 'new', term: 'جديد', definition: 'تازه' }], grammar: [] };
    const m = mergeSection('knowledgeBase', kb, local, defaults.knowledgeBase);
    expect(m.vocabulary).toHaveLength(1335);
    expect(mergeSection('journal', [{ id: 1 }, { id: 2 }], [{ id: 2 }, { id: 3 }], [])).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
    expect(mergeSection('chatHistories', { a: [1] }, { b: [2] }, { global: [] })).toEqual({ a: [1], b: [2] });
    expect(mergeSection('studyPlan', { text: 'x' }, undefined, undefined)).toEqual({ text: 'x' });
  });
  it('detects a legacy (inline) document, and measures usage', () => {
    expect(hasInlineSections({ knowledgeBase: kb }, defaults)).toBe(true);
    expect(hasInlineSections({ knowledgeBase: defaults.knowledgeBase }, defaults)).toBe(false);
    expect(hasInlineSections({ knowledgeBase: kb, sectionRefs: { knowledgeBase: {} } }, defaults)).toBe(false);
    const data = { lessons: [{ id: 1, title: 't' }], knowledgeBase: kb };
    const before = docUsage(data, data);
    const after = docUsage(sectionsToCloud(data, data), data);
    expect(before.bytes).toBeGreaterThan(50000);
    expect(after.bytes).toBeLessThan(2000);
    expect(after.sections.knowledgeBase).toBeGreaterThan(50000);
    expect(SECTIONS).toContain('journal');
  });
});
