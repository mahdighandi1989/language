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

describe('owner feedback on «5 - ریتا»', async () => {
  const { quality } = await import('./extract.js');
  const notes = [
    '| عربی | فارسی |', '|---|---|', '| زعلان | ناراحت |', '| مجنون | ديوانه |', '| تِعبان | خسته |',
    '| مبسوط ، فرحان | خوشحال |', '| شاكر ، محمود | سپاسگزار ، ستوده |',
    '',
    '## ⚠️ اصلاحات و هشدارهای پیشنهادی',
    '| متن | مشکل |', '|---|---|', '| مِعَدتی | حرکت‌گذاری نادرست: مَعِدَة |', '| تبنل | غلط تایپی / اطمینان متوسط |',
    'حاقد عليّ : با ضمیر من باید علیّ باشد',
    '---',
    'توصیه خانم ریتا برای انجام تکالیف و ترجمه جملات : اول جملات را بنویسم ولو اینکه بلد نباشم',
    'مثالی : کمال گرا',
    'هو حاقد علی = اون از من کینه داره',
  ].join('\n');
  it('skips the corrections block, splits comma lists, and ticks only clear Lebanese ⇒ Persian rows', () => {
    const c = extractLocal(notes);
    const terms = c.map((x) => x.term);
    expect(terms).not.toContain('مِعَدتی');
    expect(terms).not.toContain('تبنل');
    expect(terms).not.toContain('حاقد عليّ');
    expect(c.filter((x) => ['مبسوط', 'فرحان'].includes(x.term)).map((x) => `${x.term}=${x.definition}=${x.category}`)).toEqual(['مبسوط=خوشحال=vocabulary', 'فرحان=خوشحال=vocabulary']);
    expect(c.find((x) => x.term === 'محمود').definition).toBe('ستوده');
    const ok = (t) => { const x = c.find((y) => y.term.startsWith(t)); return x ? quality(x).ok : false; }; // absent = not ticked either
    expect(ok('زعلان')).toBe(true);
    expect(ok('تِعبان')).toBe(true);
    expect(ok('هو حاقد')).toBe(true);
    expect(ok('توصیه خانم')).toBe(false);
    expect(ok('مثالی')).toBe(false);
    expect(quality({ term: 'مِعَدتی', definition: 'حرکت‌گذاری نادرست: مَعِدَة' }).ok).toBe(false);
  });
});

describe('tester report after 23a7df9 («5 - ریتا»)', async () => {
  const { quality, spellingDoubt } = await import('./extract.js');
  const rita5 = [
    '| عربی | فارسی |', '|---|---|',
    '| زعلان | ناراحت |', '| مجنون | دیوانه |', '| مِتفاجِئ | غافلگير شده |',
    '',
    '**اصلاحات پیشنهادی**',
    '| عبارت | فارسی |', '|---|---|', '| تبنل | غلط تایپی: تنبل |', '| مِعَدتی | حرکت‌گذاری درست: مَعِدَتي |',
    '',
    '## بخشِ بعد',
    '| متن | مشکل | پیشنهاد |', '|---|---|---|', '| حاقد عليّ | ضمیر | عليّي |',
    'راسی عم یوجعنی = سرم داره درد میکنه',
    'فرق نزل با وطی = وطی برای گفتن پایین تر و نزل برای گفتن پایین استفاده میشود',
    'توصیه خانم ریتا برای انجام تکالیف و ترجمه جملات = اول جملات را بنویسم ولو اینکه بلد نباشم بعد با چت جی پی تی کنترل کنم',
    'كتير منيح = ' + 'خیلی خوب '.repeat(30),
    'كيفك | منيح | تعبان = جدولِ یک‌خطی',
  ].join('\n');
  it('drops the corrections block/table, unticks notes, advice, grammar notes and >150 chars; flags the typo but keeps it', () => {
    const c = extractLocal(rita5);
    const terms = c.map((x) => x.term);
    for (const t of ['تبنل', 'مِعَدتی', 'حاقد عليّ']) expect(terms).not.toContain(t);
    expect(terms.some((t) => t.includes('|'))).toBe(false);
    const ticked = c.filter((x) => quality(x).ok).map((x) => x.term);
    expect(ticked).toEqual(expect.arrayContaining(['زعلان', 'مجنون', 'مِتفاجِئ', 'راسی عم یوجعنی']));
    for (const bad of ['فرق نزل با وطی', 'توصیه خانم', 'كتير منيح']) expect(ticked.some((t) => t.startsWith(bad))).toBe(false);
    const typo = c.find((x) => x.term === 'مِتفاجِئ');
    expect(typo.definition).toBe('غافلگير شده'); // original kept
    expect(quality(typo).warn).toMatch(/مشکوک/);
    expect(spellingDoubt('ناراحت')).toBe('');
    expect(quality({ term: 'مِعَدتی', definition: 'حرکت‌گذاری نادرست: مَعِدَة' }).ok).toBe(false);
  });
});
