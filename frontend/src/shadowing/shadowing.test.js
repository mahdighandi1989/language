import { describe, it, expect } from 'vitest';
import { isArabicText, extractPracticeSentences, recordAttempt, lessonShadowStats, parseVerdict, sentenceKey } from './shadowing.js';

describe('shadowing logic', () => {
  it('tells Arabic from Persian', () => {
    expect(isArabicText('كِيفَك؟')).toBe(true);
    expect(isArabicText('شو بدّك')).toBe(true);
    expect(isArabicText('حالت چطوره؟')).toBe(false);
    expect(isArabicText('خانه')).toBe(false);
    expect(isArabicText('hello')).toBe(false);
  });
  it('extracts sentences verbatim from tables and lines, with meaning, deduplicated', () => {
    const notes = '## واژه‌ها\n\n| عربی | تلفظ | فارسی |\n|---|---|---|\n| كِيفَك؟ | kīfak | حالت چطوره؟ |\n| كِيفَك؟ | kīfak | تکراری |\n\n- **بِدّي روح عَالبَيت** : می‌خواهم بروم خانه\nیک خطِ فارسی';
    const s = extractPracticeSentences(notes);
    expect(s).toEqual([{ text: 'كِيفَك؟', meaning: 'حالت چطوره؟' }, { text: 'بِدّي روح عَالبَيت', meaning: 'می‌خواهم بروم خانه' }]);
  });
  it('real notes typed with a Persian keyboard (ی/ک): Lebanese side found, Persian side = meaning', () => {
    const notes = [
      'متعوِّد هیک : اینجوری عادت کردم',
      'منکَوِّن : بسازیم',
      'هی ما کان بدا شای = او چایی نمی خواست',
      'راسی عم یوجعنی = سرم داره درد میکنه',
      'برای حفظ و تثیت یک کلمه باید تا قبل از 24 ساعت تمرین کنیم',
      'ما فیکی تجیبی البنطلون معک؟',
    ].join('\n');
    expect(extractPracticeSentences(notes)).toEqual([
      { text: 'متعوِّد هیک', meaning: 'اینجوری عادت کردم' },
      { text: 'منکَوِّن', meaning: 'بسازیم' },
      { text: 'هی ما کان بدا شای', meaning: 'او چایی نمی خواست' },
      { text: 'راسی عم یوجعنی', meaning: 'سرم داره درد میکنه' },
      { text: 'ما فیکی تجیبی البنطلون معک؟', meaning: '' },
    ]);
    expect(isArabicText('یک خطِ فارسی')).toBe(false);
    expect(isArabicText('توضیحِ فارسیِ 2')).toBe(false);
    expect(isArabicText('مِعَدتی عم توجعنی')).toBe(true);
  });
  it('records attempts with best/last and computes stats', () => {
    let sh = recordAttempt({}, 7, 'كيفك', 60, 't1');
    sh = recordAttempt(sh, 7, 'كيفك', 90, 't2');
    sh = recordAttempt(sh, 7, 'منيح', 150, 't3');
    const row = sh['7'][sentenceKey('كيفك')];
    expect(row).toMatchObject({ attempts: 2, best: 90, last: 90 });
    expect(sh['7'][sentenceKey('منيح')].best).toBe(100);
    expect(lessonShadowStats(sh, 7, 5)).toEqual({ practiced: 2, mastered: 2, avg: 95, total: 5 });
  });
  it('parses verdicts tolerantly', () => {
    expect(parseVerdict('```json\n{"score": 72.4, "heard": "كيفك", "feedback": "خوب", "issues": ["ك"]}\n```')).toEqual({ score: 72, heard: 'كيفك', feedback: 'خوب', issues: [{ word: 'ك', tip: '' }] });
    expect(parseVerdict('nonsense')).toBeNull();
    expect(parseVerdict({ score: 'x' })).toBeNull();
  });
});
