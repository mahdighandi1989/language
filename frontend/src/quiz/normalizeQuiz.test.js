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
