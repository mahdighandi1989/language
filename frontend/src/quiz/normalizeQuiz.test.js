import { describe, it, expect } from 'vitest';
import { normalizeQuiz } from './normalizeQuiz.js';

describe('normalizeQuiz', () => {
  it('coerces numbers/objects to strings and maps numeric MCQ answers to options', () => {
    const q = normalizeQuiz([
      { type: 'mcq', question: 'کیف؟', options: [{ text: 'منیح' }, 'تعبان', 3], correctAnswer: 0 },
      { type: 'fillInBlank', question: { text: 'أنا ___' }, correctAnswer: ['منیح'] },
      { type: 'matching', pairs: [{ arabic: 'بيت', persian: 'خانه' }, { arabic: 'باب', persian: 'در' }, { arabic: 'مي', persian: 'آب' }, { arabic: 1 }] },
      null, 'x', { type: 'mcq', question: 'بی‌گزینه', correctAnswer: 'a' },
    ]);
    expect(q).toHaveLength(3);
    expect(q[0]).toMatchObject({ type: 'mcq', options: ['منیح', 'تعبان', '3'], correctAnswer: 'منیح' });
    expect(q[1]).toMatchObject({ type: 'fill_in_blank', question: 'أنا ___', correctAnswer: 'منیح' });
    expect(q[2].pairs).toHaveLength(3);
  });
});

describe('parseQuizResponse', () => {
  it('accepts plain, fenced, wrapped JSON; rejects broken output', async () => {
    const { parseQuizResponse } = await import('./normalizeQuiz.js');
    const q = [{ type: 'mcq', question: 'كيفك؟', options: ['a', 'b', 'c', 'd'], correctAnswer: 'a' }];
    expect(parseQuizResponse(JSON.stringify(q))).toHaveLength(1);
    expect(parseQuizResponse('```json\n' + JSON.stringify(q) + '\n```')).toHaveLength(1);
    expect(parseQuizResponse(JSON.stringify({ questions: q }))).toHaveLength(1);
    expect(parseQuizResponse('[{"type":"mcq","question":"x","options":["a","b"')).toEqual([]);
    expect(parseQuizResponse('')).toEqual([]);
  });
});

describe('unknown question types', () => {
  it('maps invented types by shape (options ⇒ mcq) and drops what cannot be rendered', async () => {
    const { normalizeQuiz } = await import('./normalizeQuiz.js');
    const q = normalizeQuiz([
      { type: 'verb_conjugation', question: 'صرف فعل «أخد» برای «إنتِ» در زمان ماضی؟', options: ['أخدتي', 'أخدت', 'أخد', 'بتاخدي'], correctAnswer: 'أخدتي' },
      { type: 'verb_conjugation', question: 'صرف فعل «أخد» برای «هو»؟', correctAnswer: 'أخد' },
      { type: 'pairs_game', pairs: [{ arabic: 'a', persian: 'b' }, { arabic: 'c', persian: 'd' }, { arabic: 'e', persian: 'f' }] },
      { type: 'mcq', question: 'x', options: ['a', 'b', 'c'], correctAnswer: 'z' },
      { type: 'something', question: 'بی‌گزینه' },
    ]);
    expect(q.map((x) => x.type)).toEqual(['mcq', 'matching']);
    expect(q[0].options).toContain('أخدتي');
  });
});
