// Lessons at scale: natural sort, search key, markdown (tables/RTL/sections),
// import validation/preview/idempotent merge, and the separate body store.
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { naturalCompare, compareLessons, courseOf, courseList, searchKey } from './sortLessons.js';
import { parseMarkdown, MarkdownRenderer } from './markdown.jsx';
import { validateImport, planImport, applyImport, IMPORT_FORMAT } from './lessonImport.js';
import { toCloudDoc, bodiesToWrite, mergeCachedBodies, chunkText, textHash, createBodyStore, bodyKeyFor } from './lessonBodies.js';
import LessonImportPanel from './LessonImportPanel.jsx';

const existing = () => ({
  lessons: [
    { id: 1, title: '1 - ریتا', summary: 's', archivedNotes: 'یادداشتِ موجود', files: [], progress: {} },
    { id: 2, title: '2 - ریتا', summary: 's', archivedNotes: '', files: [], progress: {} },
  ],
  knowledgeBase: { vocabulary: [{ id: 9, term: 'كيفك', definition: 'حالت چطوره' }], phrases: [], grammar: [], verbs: [], pronouns: [], adjectives: [] },
  journal: [],
  chatHistories: { 'lesson-1': [{ role: 'user', parts: [{ text: 'سلام' }] }] },
});
const file = (lessons) => ({ format: IMPORT_FORMAT, version: 1, lessons });
const L = (n, extra = {}) => ({ sourceKey: `rita/${n}`, title: `${n} - ریتا`, course: 'ریتا', order: n, summary: 'خلاصه', archivedNotes: `  متنِ درسِ ${n}\n\n| a | b |\n|---|---|\n| 1 | 2 |  `, ...extra });

describe('sorting and search', () => {
  it('orders 2 before 10, in any digit script, by course then order', () => {
    expect(naturalCompare('2 - ریتا', '10 - ریتا')).toBeLessThan(0);
    expect(naturalCompare('۲ - ریتا', '۱۰ - ریتا')).toBeLessThan(0);
    const ls = [{ title: '10 - ریتا' }, { title: 'ترم ۱ - درس ۴ - الخنسا', course: 'الخنسا', order: 4 }, { title: '2 - ریتا' }, { title: 'ترم ۱ - درس ۱۲ - الخنسا', course: 'الخنسا', order: 12 }];
    expect([...ls].sort(compareLessons).map((l) => l.title)).toEqual(['ترم ۱ - درس ۴ - الخنسا', 'ترم ۱ - درس ۱۲ - الخنسا', '2 - ریتا', '10 - ریتا']);
    expect(courseOf({ title: '3 - ریتا' })).toBe('ریتا');
    expect(courseList(ls)).toEqual(['الخنسا', 'ریتا']);
  });
  it('search ignores diacritics, digit script and ي/ك', () => {
    expect(searchKey('مَرْحَبًا كيفك ١٢')).toBe('مرحبا کیفک 12');
  });
});

describe('markdown', () => {
  it('renders GFM tables without breaking on their --- separator, and sections only on a bare ---', () => {
    const md = '# عنوان\n| عربی | فارسی |\n|---|:---:|\n| مرحبا | سلام |\n---\n* بند\n1. یک';
    const secs = parseMarkdown(md);
    expect(secs).toHaveLength(2);
    expect(secs[0][1]).toMatchObject({ type: 'table', header: ['عربی', 'فارسی'], rows: [['مرحبا', 'سلام']] });
    expect(secs[1].map((b) => b.type)).toEqual(['list', 'list']);
    const { container } = render(<MarkdownRenderer text={md} />);
    expect(container.querySelector('table td').textContent).toBe('مرحبا');
    expect(container.querySelector('td').getAttribute('dir')).toBe('auto');
  });
  it('never injects HTML', () => {
    const { container } = render(<MarkdownRenderer text={'<img src=x onerror=alert(1)> **ok**'} />);
    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toContain('<img');
  });
});

describe('import', () => {
  it('validates the versioned schema with readable errors', () => {
    expect(validateImport({}).ok).toBe(false);
    const bad = validateImport(file([{ title: 'x' }, L(3), L(3), { sourceKey: 'k', title: 't', knowledge: { nouns: [] } }]));
    expect(bad.errors.join('\n')).toMatch(/sourceKey .*لازم/);
    expect(bad.errors.join('\n')).toMatch(/تکراری در همین فایل/);
    expect(bad.errors.join('\n')).toMatch(/ناشناختهٔ دانش «nouns»/);
    expect(validateImport({ ...file([L(3)]), version: 2 }).ok).toBe(false);
  });

  it('preview: new, already-imported, and appends into an existing same-title lesson («1 - ریتا»)', () => {
    const data = existing();
    const p = planImport(data, file([L(1), L(3), L(4, { knowledge: { vocabulary: [{ term: 'كيفك', definition: 'x' }, { term: 'شو', definition: 'چه' }] } })]));
    expect(p.valid).toBe(true);
    expect(p.toAdd.map((l) => l.title)).toEqual(['3 - ریتا', '4 - ریتا']);
    expect(p.appends.map((c) => c.title)).toEqual(['1 - ریتا']);
    expect(p.conflicts).toEqual([]);
    expect(p.knowledgeNew).toBe(1);
    expect(p.knowledgeDup).toBe(1);
    expect(p.chars).toBe(L(1).archivedNotes.length + L(3).archivedNotes.length + L(4).archivedNotes.length);
    const pending = existing();
    pending.lessons[0]._bodyPending = true;
    expect(planImport(pending, file([L(1)])).conflicts.map((c) => c.title)).toEqual(['1 - ریتا']); // not loaded ⇒ never touched
  });

  it('append keeps the old text as the exact prefix, records the key, keeps chat, and is idempotent', async () => {
    const { appendHeading } = await import('./lessonImport.js');
    const data = existing();
    const before = JSON.parse(JSON.stringify(data));
    const f = file([L(1, { sources: ['D:/درس‌ها/ریتا/1.docx', { name: '1.pdf', page: 3 }] })]);
    const once = applyImport(data, planImport(data, f), { now: 5000 });
    expect(once.appended).toBe(1);
    const l1 = once.data.lessons[0];
    expect(l1.archivedNotes).toBe(before.lessons[0].archivedNotes + appendHeading('rita/1') + L(1).archivedNotes);
    expect(l1.archivedNotes.startsWith(before.lessons[0].archivedNotes)).toBe(true);
    expect(l1).toMatchObject({ id: 1, title: '1 - ریتا', summary: 's', importedSourceKeys: ['rita/1'], sources: ['D:/درس‌ها/ریتا/1.docx', { name: '1.pdf', page: 3 }] });
    expect(l1.bodyRef).toBeUndefined(); // small: stays inline
    expect(once.data.chatHistories).toEqual(before.chatHistories);
    expect(once.data.lessons[1]).toEqual(before.lessons[1]);
    const again = applyImport(once.data, planImport(once.data, f), { now: 6000 });
    expect(again.appended).toBe(0);
    expect(again.data.lessons[0].archivedNotes).toBe(l1.archivedNotes);
    const big = applyImport(data, planImport(data, file([L(1, { archivedNotes: 'ک'.repeat(30000) })])), { now: 7000 });
    expect(big.data.lessons[0].bodyRef).toEqual({ key: 'L1' }); // grows past 20k ⇒ whole text moves to the body store
    expect(big.data.lessons[0].archivedNotes.startsWith('یادداشتِ موجود')).toBe(true);
  });

  it('apply is additive, keeps text byte-for-byte, and is idempotent', () => {
    const data = existing();
    const before = JSON.parse(JSON.stringify(data));
    const f = file([L(3), L(4, { knowledge: { vocabulary: [{ term: 'شو', definition: 'چه', example: 'شو بدك؟' }] } })]);
    const once = applyImport(data, planImport(data, f), { now: 1000 }).data;
    expect(once.lessons.slice(0, 2)).toEqual(before.lessons);
    expect(once.chatHistories).toEqual(before.chatHistories);
    expect(once.knowledgeBase.vocabulary[0]).toEqual(before.knowledgeBase.vocabulary[0]);
    expect(once.lessons[2]).toMatchObject({ title: '3 - ریتا', sourceKey: 'rita/3', course: 'ریتا', order: 3, archivedNotes: L(3).archivedNotes, bodyRef: { key: 'L1000' } });
    expect(once.knowledgeBase.vocabulary[1]).toMatchObject({ term: 'شو', example: 'شو بدك؟', source: 'درس: 4 - ریتا' });
    const twice = applyImport(once, planImport(once, f), { now: 2000 });
    expect(twice.added).toBe(0);
    expect(twice.data.lessons).toHaveLength(4);
    expect(applyImport(once, planImport(data, f), { now: 3000 }).added).toBe(0); // stale plan still safe
    expect(data).toEqual(before); // input not mutated
  });
});

describe('body store (1 MiB cap)', () => {
  it('cloud doc strips loaded bodies to refs, keeps pending refs, never saves transient fields', () => {
    const data = { lessons: [
      { id: 1, title: 'inline', archivedNotes: 'x' },
      { id: 2, title: 'loaded', archivedNotes: 'متنِ بلند', bodyRef: { key: 'L2' } },
      { id: 3, title: 'pending', archivedNotes: '', bodyRef: { key: 'L3', chars: 9, hash: 'h' }, _bodyPending: true },
    ] };
    const c = toCloudDoc(data);
    expect(c.lessons[0]).toEqual({ id: 1, title: 'inline', archivedNotes: 'x' });
    expect(c.lessons[1]).toEqual({ id: 2, title: 'loaded', archivedNotes: '', bodyRef: { key: 'L2', chars: 9, hash: textHash('متنِ بلند') } });
    expect(c.lessons[2]).toEqual({ id: 3, title: 'pending', archivedNotes: '', bodyRef: { key: 'L3', chars: 9, hash: 'h' } });
    expect(bodiesToWrite(data, new Map()).map((l) => l.id)).toEqual([2]); // never the pending one
    expect(bodiesToWrite(data, new Map([['L2', textHash('متنِ بلند')]]))).toEqual([]);
  });
  it('merges cached bodies back and marks the rest pending', () => {
    const cache = new Map([['L2', { text: 't', hash: textHash('t') }]]);
    const out = mergeCachedBodies([{ id: 2, bodyRef: { key: 'L2', hash: textHash('t') } }, { id: 3, bodyRef: { key: 'L3' } }, { id: 4 }], cache);
    expect(out[0].archivedNotes).toBe('t');
    expect(out[1]._bodyPending).toBe(true);
    expect(out[2]).toEqual({ id: 4 });
    expect(chunkText('a'.repeat(600000)).length).toBe(3);
    expect(bodyKeyFor({ id: 12 })).toBe('L12');
  });
  it('writes head + chunks in one batch and reads them back verified', async () => {
    const docs = new Map();
    const fs = {
      doc: (db, path) => ({ path }),
      getDoc: async (ref) => ({ exists: () => docs.has(ref.path), data: () => docs.get(ref.path) }),
      writeBatch: () => { const ops = []; return { set: (r, d) => ops.push([r.path, d]), commit: async () => ops.forEach(([p, d]) => docs.set(p, d)) }; },
    };
    const store = createBodyStore(fs, {}, '/artifacts/a/users/u');
    const text = 'ب'.repeat(600001);
    await store.write('L1', text);
    expect(docs.get('/artifacts/a/users/u/lessonBodies/L1').chunks).toBe(3);
    expect((await store.read('L1')).text).toBe(text);
    docs.delete('/artifacts/a/users/u/lessonBodies/L1/chunks/0001');
    await expect(store.read('L1')).rejects.toThrow(/تکهٔ ۲|تکهٔ 2/);
  });
});

describe('import panel', () => {
  it('preview → backup download → additive apply → report', async () => {
    const data = existing();
    const setData = vi.fn();
    const download = vi.fn();
    render(<LessonImportPanel data={data} setData={setData} download={download} />);
    const f = new File([JSON.stringify(file([L(1), L(3)]))], 'rita.json', { type: 'application/json' });
    fireEvent.change(screen.getByLabelText('فایلِ ایمپورت'), { target: { files: [f] } });
    expect(await screen.findByTestId('import-preview')).toBeTruthy();
    expect(screen.getByText(/درسِ تازه: ۱/)).toBeTruthy();
    expect(screen.getByText(/جزوه به درسِ موجود افزوده می‌شود: ۱/)).toBeTruthy();
    fireEvent.click(screen.getByText(/پشتیبان‌گیری و اعمال/));
    expect(download).toHaveBeenCalledWith(data, expect.stringMatching(/^lessons-backup-before-import-.*\.json$/));
    const next = setData.mock.calls[0][0];
    expect(next.lessons).toHaveLength(3);
    expect(next.lessons[0].archivedNotes.startsWith(data.lessons[0].archivedNotes)).toBe(true);
    expect(next.lessons[1]).toBe(data.lessons[1]);
    await waitFor(() => expect(screen.getByRole('status').textContent).toMatch(/۱ درسِ تازه، جزوه به ۱ درسِ موجود/));
  });
  it('shows validation errors and never applies an invalid file', async () => {
    const setData = vi.fn();
    render(<LessonImportPanel data={existing()} setData={setData} download={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('فایلِ ایمپورت'), { target: { files: [new File(['{"format":"x"}'], 'bad.json')] } });
    expect(await screen.findByText(/معتبر نیست/)).toBeTruthy();
    expect(screen.queryByText(/پشتیبان‌گیری و اعمال/)).toBeNull();
    expect(setData).not.toHaveBeenCalled();
  });
});
