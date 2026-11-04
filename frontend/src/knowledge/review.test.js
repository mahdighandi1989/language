import { describe, it, expect } from 'vitest';
import { normalizeArabic, findDuplicates, findSimilar, qualityIssues, mergeGroup, undoMerge, moveItem } from './review.js';
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
  it('certain duplicates = same written term AND same meaning; look-alikes are only «similar»', () => {
    expect(normalizeArabic('أَهْلاً')).toBe(normalizeArabic('اهلا'));
    const k = { verbs: [
      { id: 1, term: 'وصل', definition: 'رسید' }, { id: 2, term: 'وصّل', definition: 'رساند' },
      { id: 3, term: 'كيفك (مرد)', definition: 'حالت چطوره' }, { id: 4, term: 'كيفك (زن)', definition: 'حالت چطوره' },
      { id: 5, term: 'بَيْت', definition: 'خانه' }, { id: 6, term: 'بَيْت ', definition: 'خانه.' }, { id: 7, term: 'بَيت', definition: 'خانه' },
      { id: 8, term: 'یلّا', definition: 'بزن بریم' }, { id: 9, term: 'يلّا', definition: 'بزن  بریم' },
    ] };
    expect(findDuplicates(k).map((g) => g.members.map((m) => m.id))).toEqual([[5, 6], [8, 9]]);
    const sim = findSimilar(k).map((g) => g.members.map((m) => m.id));
    expect(sim).toEqual(expect.arrayContaining([[1, 2], [3, 4], [5, 6, 7]]));
    expect(sim).not.toContainEqual([8, 9]);
  });
  it('flags quality problems and suggests categories', () => {
    const q = qualityIssues(kb);
    const byId = Object.fromEntries(q.map((x) => [x.item.id, x]));
    expect(byId[3].suggest).toBe('phrases');
    expect(byId[4].flags.map((f) => f.code)).toEqual(expect.arrayContaining(['no-def', 'term-not-arabic']));
    expect(byId[6].suggest).toBe('vocabulary');
    expect(byId[1]).toBeUndefined();
  });
  it('merges a certain group reversibly (sources/lessons kept)', () => {
    const k = { vocabulary: [{ id: 1, term: 'بَيْت', definition: 'خانه', source: 'درس: 1', lessonId: 1 }, { id: 3, term: 'x', definition: 'y' }], phrases: [{ id: 2, term: 'بَيْت', definition: 'خانه', source: 'درس: 3', lessonId: 3 }] };
    const [g] = findDuplicates(k);
    const { kb: merged, log } = mergeGroup(k, g, 'T');
    expect(merged.vocabulary[0]).toMatchObject({ definition: 'خانه', source: 'درس: 1 ، درس: 3', lessonIds: ['1', '3'] });
    expect(merged.phrases).toHaveLength(0);
    const back = undoMerge(merged, log);
    expect(back.vocabulary.find((i) => i.id === 1)).toEqual(k.vocabulary[0]);
    expect(back.phrases).toEqual(k.phrases);
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
