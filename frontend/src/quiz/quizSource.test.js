import { describe, it, expect } from 'vitest';
import { recentLessons, sampleLessonText, QUIZ_CHAR_BUDGET } from './quizSource.js';

const big = (i) => Array.from({ length: 3000 }, (_, k) => (k % 2 ? `| كلمة${i}_${k} | معنی ${k} |` : `توضیحِ فارسیِ ${k}`)).join('\n');

describe('quiz source', () => {
  it('picks the most recent lessons with content', () => {
    const ls = [
      { id: 1, title: 'a', archivedNotes: 'x'.repeat(60), createdAt: '2026-01-01' },
      { id: 2, title: 'b', archivedNotes: '', createdAt: '2026-12-01' },
      { id: 3, title: 'c', archivedNotes: 'y'.repeat(60), createdAt: '2026-10-01' },
      { id: 4, title: 'd', archivedNotes: 'z'.repeat(60) },
    ];
    expect(recentLessons(ls, 2).map((l) => l.id)).toEqual([3, 1]);
    expect(recentLessons(ls, 5).map((l) => l.id)).toEqual([3, 1, 4]);
  });
  it('190 big lessons stay within the budget, each represented, Arabic lines preferred, different each time', () => {
    const ls = Array.from({ length: 190 }, (_, i) => ({ id: i, title: `${i} - ریتا`, archivedNotes: big(i) }));
    const t0 = Date.now();
    const s1 = sampleLessonText(ls);
    expect(Date.now() - t0).toBeLessThan(2000);
    expect(s1.length).toBeLessThanOrEqual(QUIZ_CHAR_BUDGET + 400);
    const five = ls.slice(0, 5);
    const a = sampleLessonText(five);
    const b = sampleLessonText(five);
    for (const l of five) expect(a).toContain(`### ${l.title}`);
    const lines = a.split('\n').filter((x) => x && !x.startsWith('###'));
    expect(lines.filter((x) => x.includes('كلمة')).length / lines.length).toBeGreaterThan(0.6);
    expect(a).not.toBe(b);
    expect(sampleLessonText([{ title: 's', archivedNotes: 'کوتاه ولی بیش از پنجاه نویسه برای این آزمونِ کوچک است!!' }])).toContain('کوتاه');
  });
});
