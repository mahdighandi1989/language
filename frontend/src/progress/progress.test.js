import { describe, it, expect } from 'vitest';
import { progressReport } from './progress.js';

describe('progressReport', () => {
  it('groups by course, counts knowledge, shadowing, 30-day activity and attention list', () => {
    const now = new Date('2026-11-04T12:00:00Z');
    const data = {
      lessons: [
        { id: 1, title: '1 - ریتا', archivedNotes: 'x'.repeat(60), progress: { quizzesTaken: 2, chatPracticeCount: 1 } },
        { id: 2, title: '2 - ریتا', bodyRef: { key: 'k' }, archivedNotes: '' },
        { id: 3, title: 'خالی' },
      ],
      knowledgeBase: { vocabulary: [{ term: 'a' }, { term: 'b' }], grammar: [{ term: 'c' }] },
      journal: [{ date: '2026-11-04T08:00:00Z' }, { date: '2026-09-01T08:00:00Z' }],
      shadowing: { 2: { k1: { best: 90, attempts: 3, at: '2026-11-03T10:00:00Z' }, k2: { best: 40, attempts: 1, at: '2026-11-03T11:00:00Z' } } },
    };
    const r = progressReport(data, now);
    const rita = r.courses.find((c) => c.course === 'ریتا');
    expect(rita).toMatchObject({ lessons: 2, withContent: 2, quizzes: 2, chats: 1, shadowed: 2, mastered: 1 });
    expect(r.knowledgeTotal).toBe(3);
    expect(r.knowledge[0]).toEqual({ label: 'لغات', count: 2 });
    expect(r.activity).toHaveLength(30);
    expect(r.activity.at(-1)).toEqual({ day: '2026-11-04', count: 1 });
    expect(r.activity.at(-2).count).toBe(2);
    expect(r.activeDays30).toBe(2);
    expect(r.attention.map((a) => a.id)).toEqual([2, 1]);
    expect(r.shadow).toEqual({ practiced: 2, mastered: 1, attempts: 4 });
  });
});
