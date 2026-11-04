import { describe, it, expect } from 'vitest';
import { normalizeArabic, findDuplicates, qualityIssues, mergeGroup, undoMerge, moveItem } from './review.js';
import { dueCards, gradeCard, buildQuiz } from './practice.js';

const kb = {
  vocabulary: [
    { id: 1, term: 'بَيْت', definition: 'خانه', source: 'درس: 1 - ریتا', lessonId: 1 },
    { id: 2, term: 'بيت', definition: 'منزل', source: 'درس: 3 - ریتا', lessonId: 3 },
    { id: 3, term: 'شو بدّك تعمل اليوم', definition: 'امروز می‌خواهی چه کنی' },
    { id: 4, term: 'خانه', definition: '' },
  ],
  phrases: [{ id: 5, term: 'بَيت!', definition: 'خانه' }, { id: 6, term: 'يلّا', definition: 'بزن بریم' }],
};

describe('knowledge review', () => {
  it('normalises Arabic and finds duplicates across tabs', () => {
    expect(normalizeArabic('أَهْلاً')).toBe(normalizeArabic('اهلا'));
    const d = findDuplicates(kb);
    expect(d).toHaveLength(1);
    expect(d[0].members.map((m) => m.id)).toEqual([1, 2, 5]);
  });
  it('flags quality problems and suggests categories', () => {
    const q = qualityIssues(kb);
    const byId = Object.fromEntries(q.map((x) => [x.item.id, x]));
    expect(byId[3].suggest).toBe('phrases');
    expect(byId[4].flags.map((f) => f.code)).toEqual(expect.arrayContaining(['no-def', 'term-not-arabic']));
    expect(byId[6].suggest).toBe('vocabulary');
    expect(byId[1]).toBeUndefined();
  });
  it('merges a group reversibly (definitions/sources/lessons kept)', () => {
    const [g] = findDuplicates(kb);
    const { kb: merged, log } = mergeGroup(kb, g, 'T');
    expect(merged.vocabulary.map((i) => i.id)).toEqual([1, 3, 4]);
    expect(merged.phrases.map((i) => i.id)).toEqual([6]);
    expect(merged.vocabulary[0]).toMatchObject({ definition: 'خانه / منزل', lessonIds: ['1', '3'] });
    const back = undoMerge(merged, log);
    expect(back.vocabulary.map((i) => i.id).sort()).toEqual([1, 2, 3, 4]);
    expect(back.vocabulary.find((i) => i.id === 1).definition).toBe('خانه');
    expect(back.phrases.map((i) => i.id).sort()).toEqual([5, 6]);
    expect(moveItem(kb, 'vocabulary', kb.vocabulary[2], 'phrases').phrases).toHaveLength(3);
  });
});

describe('knowledge practice', () => {
  it('Leitner: new cards due, known moves up a box and out of today, again goes to box 1', () => {
    const now = 1_000_000_000_000;
    const due = dueCards(kb, {}, { now });
    expect(due.length).toBe(5); // item 4 has no definition
    let r = gradeCard({}, due[0].key, true, now);
    expect(r[due[0].key]).toMatchObject({ box: 1, due: now + 86400000 });
    expect(dueCards(kb, r, { now }).some((c) => c.key === due[0].key)).toBe(false);
    r = gradeCard(r, due[0].key, false, now);
    expect(r[due[0].key].box).toBe(1);
  });
  it('quiz: 4 distinct options with the correct meaning', () => {
    let seed = 1; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const q = buildQuiz(kb, { n: 3, rnd });
    expect(q).toHaveLength(3);
    for (const x of q) { expect(new Set(x.options).size).toBe(4); expect(x.options).toContain(x.correct); }
    expect(buildQuiz({ vocabulary: [{ term: 'a', definition: 'b' }] })).toEqual([]);
  });
});
