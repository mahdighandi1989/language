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
