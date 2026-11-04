import { describe, it, expect } from 'vitest';
import { lessonHtml, documentHtml, ankiCsv, knowledgeOfLesson, lessonsOfCourse, safeFileName } from './exports.js';

const lesson = { id: 7, title: '3 - ریتا', summary: 'خلاصه', archivedNotes: '## واژه\n\n| عربی | فارسی |\n|---|---|\n| كِيفَك | حالت؟ |\n\nمتنِ <b>اصلی</b>', corrections: [{ quote: 'كِيفَك', kind: 'اعراب', issue: 'کسره', suggestion: 'كيفِك' }] };

describe('exports', () => {
  it('renders the exact lesson text with tables, RTL, escapes HTML, corrections separate', () => {
    const h = lessonHtml(lesson);
    expect(h).toContain('<table');
    expect(h).toContain('كِيفَك');
    expect(h).not.toContain('<b>اصلی</b>');
    expect(h).toContain('اصلاحات و هشدارهای اعراب/معنا');
    const doc = documentHtml('t', [lesson]);
    expect(doc).toMatch(/dir="rtl"/);
    expect(doc).toContain('Noto+Naskh+Arabic');
    expect(documentHtml('t', [lesson], { forWord: true })).toContain('urn:schemas-microsoft-com:office:word');
  });
  it('Anki CSV: BOM, header, quoting, tags', () => {
    const csv = ankiCsv([{ term: 'بيت "x"', definition: 'خانه\nمنزل', category: 'vocabulary' }, { term: 'بی‌معنی' }], '3 - ریتا');
    expect(csv.startsWith('﻿#separator:Semicolon')).toBe(true);
    const lines = csv.trim().split('\n');
    expect(lines).toHaveLength(4);
    expect(lines[3]).toBe('"بيت ""x""";"خانه<br>منزل";"3_-_ریتا vocabulary"');
  });
  it('finds a lesson\'s knowledge by lessonId or source, and course lessons in order', () => {
    const kb = { vocabulary: [{ term: 'a', definition: 'b', source: 'درس: 3 - ریتا' }, { term: 'c', definition: 'd', lessonId: 7 }, { term: 'e', definition: 'f', source: 'چت' }], _meta: {} };
    expect(knowledgeOfLesson(kb, lesson).map((i) => i.term)).toEqual(['a', 'c']);
    const ls = [{ id: 1, title: '10 - ریتا' }, { id: 2, title: '2 - ریتا' }, { id: 3, title: '1 - الخنسا' }];
    expect(lessonsOfCourse(ls, 'ریتا').map((l) => l.id)).toEqual([2, 1]);
    expect(safeFileName('a/b:c')).toBe('a_b_c');
  });
});
