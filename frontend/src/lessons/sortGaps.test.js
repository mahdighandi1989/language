import { describe, it, expect } from 'vitest';
import { compareLessons, courseOf, courseGaps, lessonNumber } from './sortLessons.js';

describe('course + number order', () => {
  it('«21 - ریتا» before «24 - ریتا» even when only one has an explicit order or the course is typed with Arabic ي', () => {
    const ls = [{ title: '24 - ریتا', order: 24 }, { title: '21 - ريتا' }, { title: '3 - ریتا' }, { title: '1 - غالبون' }];
    expect([...ls].sort(compareLessons).map((l) => l.title)).toEqual(['3 - ریتا', '21 - ريتا', '24 - ریتا', '1 - غالبون']);
    expect(courseOf({ title: '21 - ريتا' })).toBe(courseOf({ title: '24 - ریتا' }));
    expect(lessonNumber({ title: '۷ - لو' })).toBe(7);
  });
  it('reports missing parts of a series', () => {
    const ls = [1, 2, 3, 5, 6, 8].map((n) => ({ title: `${n} - لو` }));
    expect(courseGaps(ls, 'لو')).toEqual([4, 7]);
    expect(courseGaps([{ title: '1 - x' }], 'x')).toEqual([]);
  });
});
