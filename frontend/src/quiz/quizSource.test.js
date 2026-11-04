import { describe, it, expect } from 'vitest';
import { recentLessons, sampleLessonText, cleanForQuiz, QUIZ_CHAR_BUDGET } from './quizSource.js';

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

describe('cleanForQuiz', () => {
  it('drops suspect/unreadable/loop lines, timestamps, metadata and repeats; keeps the real lesson', () => {
    const t = ['> روش: رونویسیِ دوبار‌سنجیده · توافق ۴۲٪', '[00:12] لازم تكتب فروضتك', '⚠️ [مشکوک] شي ما بينفهم', 'كان [ناخوانا] هون',
      'اماراتيه ⟲ [تکرارِ ماشینی حذف شد ×480]', 'لا لا لا لا لا لا لا', '(0:20 - 0:25) بس للأسف لازم', 'بس للأسف لازم', 'متعوِّد هیک : اینجوری عادت کردم'].join('\n');
    expect(cleanForQuiz(t)).toBe('لازم تكتب فروضتك\nبس للأسف لازم\nمتعوِّد هیک : اینجوری عادت کردم');
  });
  it('a lesson that is only noise counts as having no content', () => {
    expect(recentLessons([{ id: 1, archivedNotes: '⚠️ [مشکوک] ' + 'x'.repeat(80) }])).toEqual([]);
  });
});

describe('quiz quality helpers', async () => {
  const { isTranscriptOnly, lessonKnowledge, pickQuizLessons, glossaryFor } = await import('./quizSource.js');
  const transcript = { id: 25, title: '25 - ریتا', createdAt: '2026-11-03', archivedNotes: Array.from({ length: 40 }, (_, k) => (k % 2 ? `⚠️ [مشکوک] [00:${10 + k}] مسجيز` : `[00:${10 + k}] لازم تكتب فروضتك ${k}`)).join('\n') };
  const handout = { id: 3, title: '3 - ریتا', createdAt: '2026-05-01', archivedNotes: [1, 2, 3, 4, 5].map((k) => `متعوِّد هیک ${k} : اینجوری عادت کردم`).join('\n') };
  const transcriptWithKb = { id: 26, title: '26 - ریتا', createdAt: '2026-11-04', archivedNotes: transcript.archivedNotes };
  const kb = { vocabulary: [{ term: 'بَيْت', definition: 'خانه', lessonId: 26 }, { term: 'شُبّاك', definition: 'پنجره', source: 'درس: 3 - ریتا' }, { term: 'خانه', definition: 'فارسی است' }, { term: 'مَيّ', definition: 'آب' }] };
  it('tells transcriptions from handouts and finds lesson knowledge', () => {
    expect(isTranscriptOnly(transcript)).toBe(true);
    expect(isTranscriptOnly(handout)).toBe(false);
    expect(lessonKnowledge(kb, handout).map((i) => i.term)).toEqual(['شُبّاك']);
  });
  it('prefers handouts and lessons with knowledge over transcription-only ones', () => {
    expect(pickQuizLessons([handout, transcript, transcriptWithKb], kb, 2).map((l) => l.id)).toEqual([26, 3]);
    expect(pickQuizLessons([transcript], kb, 5).map((l) => l.id)).toEqual([25]); // still usable when nothing else
  });
  it('transcriptions get a smaller share of the text than handouts', () => {
    const bigT = { ...transcript, archivedNotes: Array.from({ length: 3000 }, (_, k) => `[00:${k % 60}] لازم تكتب ${k}`).join('\n') };
    const bigH = { ...handout, archivedNotes: Array.from({ length: 3000 }, (_, k) => `متعوِّد هیک ${k} : عادت کردم`).join('\n') };
    const out = sampleLessonText([bigT, bigH], 6000, () => 0.3);
    const [, t, h] = out.split(/### .+\n/);
    expect(h.length).toBeGreaterThan(t.length * 1.6);
  });
  it('glossary: own items first, then others; only Lebanese terms', () => {
    const g = glossaryFor([handout], kb, 10, () => 0.5);
    expect(g[0]).toBe('شُبّاك — پنجره');
    expect(g).toContain('مَيّ — آب');
    expect(g.some((l) => l.startsWith('خانه'))).toBe(false);
  });
});
