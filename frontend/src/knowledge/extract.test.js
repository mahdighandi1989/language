import { describe, it, expect } from 'vitest';
import { extractLocal, verifyAiItems, markAgainstKb, mergeCandidates, addToKb, categoryFromHint } from './extract.js';

const notes = [
  '## verbs — صرف فعل',
  '| فعل | تلفظ | فارسی |',
  '|---|---|---|',
  '| حَبّ | ḥabb | دوست داشتن |',
  '| خاف | khāf | ترسیدن |',
  '',
  '## adj for human',
  '| عربی | فارسی |',
  '|---|---|',
  '| شاطر | زرنگ |',
  '| حنون | مهربان |',
  '',
  'متعوِّد هیک : اینجوری عادت کردم',
  'یُعطیک العافیه = خسته نباشید',
  'توضیحِ فارسیِ بی‌جفت',
].join('\n');

describe('knowledge extraction', () => {
  it('reads tables (tab from heading/header) and pair lines, exactly', () => {
    const c = extractLocal(notes, { lessonTitle: '3 - ریتا' });
    const by = Object.fromEntries(c.map((x) => [x.term, x]));
    expect(by['حَبّ']).toMatchObject({ definition: 'دوست داشتن', category: 'verbs', pronunciation: 'ḥabb', source: 'درس: 3 - ریتا' });
    expect(by['شاطر']).toMatchObject({ definition: 'زرنگ', category: 'adjectives' });
    expect(by['متعوِّد هیک']).toMatchObject({ definition: 'اینجوری عادت کردم', category: 'adjectives' }); // heading still «adj»
    expect(by['یُعطیک العافیه'].definition).toBe('خسته نباشید');
    expect(c).toHaveLength(6);
    expect(categoryFromHint('صرف فعل')).toBe('verbs');
  });
  it('AI items are kept only if the term is in the text; marks duplicates; merges; adds with lesson ref', () => {
    const ai = verifyAiItems([{ term: 'حنون', definition: 'مهربان', category: 'adjectives' }, { term: 'مسجيز', definition: 'ساختگی' }, { term: 'شاطر', definition: 'زرنگ' }], notes);
    expect(ai.map((i) => i.term)).toEqual(['حنون', 'شاطر']);
    const merged = mergeCandidates([{ term: 'حنون', definition: 'مهربان' }], ai);
    expect(merged).toHaveLength(2);
    const kb = { vocabulary: [{ term: 'شاطر', definition: 'زرنگ' }, { term: 'حنون', definition: 'دلسوز' }] };
    const m = markAgainstKb([{ term: 'شاطر', definition: 'زرنگ' }, { term: 'حنون', definition: 'مهربان' }, { term: 'خاف', definition: 'ترسیدن' }], kb);
    expect(m.map((x) => x.status)).toEqual(['duplicate', 'other-meaning', 'new']);
    const next = addToKb(kb, [{ term: 'خاف', definition: 'ترسیدن', category: 'verbs' }], { id: 3, title: '3 - ریتا' }, 1000);
    expect(next.verbs[0]).toMatchObject({ term: 'خاف', lessonId: 3, source: 'درس: 3 - ریتا' });
    expect(kb.verbs).toBeUndefined();
  });
});

describe('tab-separated rows (PDF/Excel text)', () => {
  it('reads them like a table', () => {
    const c = extractLocal('صفات\nعربی\tفارسی\nشاطر\tزرنگ\nحنون\tمهربان');
    expect(c.map((x) => `${x.term}=${x.definition}`)).toEqual(['شاطر=زرنگ', 'حنون=مهربان']);
    expect(c[0].category).toBe('adjectives');
  });
});
