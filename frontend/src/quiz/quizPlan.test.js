import { describe, it, expect } from 'vitest';
import { knowledgePool, planQuiz, knowledgeQuestions, isContradictory, mergeQuiz } from './quizPlan.js';

let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const kb = { vocabulary: [
  { term: 'بَيْت', definition: 'خانه' }, { term: 'شُبّاك', definition: 'پنجره' }, { term: 'مَيّ', definition: 'آب' }, { term: 'باب', definition: 'در' },
  { term: 'سيّارة', definition: 'ماشین' }, { term: 'كتير', definition: 'خیلی' }, { term: 'هيك', definition: 'این‌جوری' }, { term: 'شو', definition: 'چی' },
  { term: 'خانه', definition: 'فارسی' }, { term: 'حَبّيت', definition: 'دوست داشتم', lessonId: 7 },
] };

describe('quiz plan', () => {
  it('pool: Lebanese items only, the lesson\'s own items first', () => {
    const pool = knowledgePool(kb, [{ id: 7, title: 'صرف فعل' }], rnd);
    expect(pool[0].term).toBe('حَبّيت');
    expect(pool.some((p) => p.term === 'خانه')).toBe(false);
  });
  it('spreads questions: ~half knowledge, the rest round-robin over lessons', () => {
    const pool = knowledgePool(kb, [], rnd);
    const p = planQuiz(10, [{ id: 1 }, { id: 2 }, { id: 3 }], pool);
    expect(p.kbCount).toBe(5);
    expect(p.slots.map((s) => s.count)).toEqual([2, 2, 1]);
    expect(planQuiz(5, [{ id: 1 }], [{}, {}]).kbCount).toBe(0); // too few items
  });
  it('knowledge questions are correct by construction (4 distinct options, both directions)', () => {
    const qs = knowledgeQuestions(knowledgePool(kb, [], rnd), 4, rnd);
    expect(qs).toHaveLength(4);
    for (const q of qs) { expect(new Set(q.options).size).toBe(4); expect(q.options).toContain(q.correctAnswer); }
    expect(qs[1].question).toMatch(/به لبنانی کدام است/);
  });
  it('drops tense-contradictory questions, keeps consistent ones', () => {
    expect(isContradictory({ question: 'کدام گزینه فعل امر برای «تو (مذکر) یاد گرفتی» است؟' })).toBe(true);
    expect(isContradictory({ question: 'فعل مضارع التزامی برای «آنها آمدند»؟' })).toBe(true);
    expect(isContradictory({ question: 'امر: «بیاموز» به لبنانی کدام است؟' })).toBe(false);
    expect(isContradictory({ question: 'مضارع: «می‌آموزی» کدام است؟' })).toBe(false);
    expect(isContradictory({ question: 'ماضی: «یاد گرفتی» کدام است؟' })).toBe(false);
    const { quiz, dropped } = mergeQuiz([{ question: 'امر برای «آمدند»' }, { question: 'a' }, { question: 'b' }], [{ question: 'k1' }, { question: 'k2' }], 4);
    expect(dropped).toBe(1);
    expect(quiz.map((q) => q.question)).toEqual(['a', 'k1', 'b', 'k2']);
    // planned knowledge share is kept even when the model sends spares
    const m = mergeQuiz([{ question: 'a' }, { question: 'b' }, { question: 'c' }, { question: 'd' }], [{ question: 'k1' }, { question: 'k2' }, { question: 'k3' }], 5);
    expect(m.quiz.filter((q) => q.question.startsWith('k'))).toHaveLength(3);
    expect(m.quiz).toHaveLength(5);
    // model failed entirely: knowledge-only quiz
    expect(mergeQuiz([], [{ question: 'k1' }, { question: 'k2' }], 5).quiz).toHaveLength(2);
  });
});
