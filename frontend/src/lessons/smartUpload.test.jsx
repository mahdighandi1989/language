import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { buildUnifiedNotes, appendUnified, collectCorrections } from './unifiedNotes.js';
import SmartUpload, { CorrectionsPanel } from './SmartUpload.jsx';

const exact = { filename: 'a.docx', method: 'exact', status: 'ok', text: '  متنِ دقیق\n| a | b |\n|---|---|\n| 1 | 2 |', markedText: 'X', corrections: [], suspectLines: [], file: { id: 'f1', name: 'a.docx', type: 't', size: 1 } };
const ai = { filename: 'p.jpg', method: 'ai-verified', status: 'ok', text: 'سطر یک\nسطر دو', markedText: 'سطر یک\n⚠️ [مشکوک] سطر دو', agreement: 0.5, suspectCount: 1, suspectLines: ['سطر دو'],
  corrections: [{ quote: 'سطر یک', kind: 'اعراب', issue: 'بی‌اعراب', suggestion: 'سَطر', verifiedQuote: true }], file: { id: 'f2', name: 'p.jpg', type: 'image/jpeg', size: 2 } };

describe('unified notes', () => {
  it('exact text byte-for-byte, AI text with suspect marks, nothing else rewritten', () => {
    const u = buildUnifiedNotes([exact, ai, { ...ai, status: 'failed', filename: 'z' }]);
    expect(u).toContain(exact.text);
    expect(u).toContain('⚠️ [مشکوک] سطر دو');
    expect(u).toMatch(/توافقِ دو رونویسی ۵۰٪/);
    expect(u).not.toContain('### 📄 z');
    expect(appendUnified('قدیمی', u).startsWith('قدیمی\n\n---\n')).toBe(true);
    expect(appendUnified('', u)).toBe(u);
  });
  it('corrections are separate: AI review + suspect lines, with file names', () => {
    const c = collectCorrections([ai], [{ quote: 'old' }]);
    expect(c.map((x) => x.kind)).toEqual([undefined, 'اعراب', 'مشکوک']);
    expect(c[2].fileName).toBe('p.jpg');
  });
});

describe('SmartUpload', () => {
  it('uploads several files, previews, and APPENDS (existing notes kept) with corrections + stored files', async () => {
    const fetchImpl = vi.fn(async () => ({ ok: true, json: async () => ({ results: [exact, ai] }) }));
    const updateLesson = vi.fn();
    const lesson = { id: 7, archivedNotes: 'جزوهٔ مالک', files: [{ id: 'old' }], corrections: [] };
    render(<SmartUpload lesson={lesson} updateLesson={updateLesson} fetchImpl={fetchImpl} />);
    fireEvent.change(screen.getByLabelText('فایل‌های درس'), { target: { files: [new File(['x'], 'a.docx'), new File(['y'], 'p.jpg')] } });
    fireEvent.click(screen.getByText('استخراجِ دقیق'));
    await screen.findByTestId('smart-results');
    const post = fetchImpl.mock.calls.find((c) => c[1]?.method === 'POST');
    expect(post[0]).toBe('/api/lesson-files/7');
    expect(post[1].body.getAll('files')).toHaveLength(2);
    // Stored originals are attached at once (playable even without text).
    expect(updateLesson.mock.calls[0][1]).toEqual({ files: [{ id: 'old' }, ...updateLesson.mock.calls[0][1].files.slice(1)] });
    expect(updateLesson.mock.calls[0][1].files.map((f) => f.id)).toEqual(['old', 'f1', 'f2']);
    fireEvent.click(screen.getByText(/افزودن به جزوهٔ درس/));
    const patch = updateLesson.mock.calls.at(-1)[1];
    expect(patch.archivedNotes.startsWith('جزوهٔ مالک\n\n---\n')).toBe(true);
    expect(patch.files.map((f) => f.id)).toEqual(['old', 'f1', 'f2']);
    expect(patch.corrections).toHaveLength(2);
    await waitFor(() => expect(screen.getByRole('status').textContent).toMatch(/افزوده شد/));
  });
  it('shows a server error and blocks while the lesson body is loading', async () => {
    const fetchImpl = vi.fn(async () => ({ ok: false, status: 413, json: async () => ({ error: 'حجمِ هر فایل حداکثر ۲۵MB است' }) }));
    const { rerender } = render(<SmartUpload lesson={{ id: 1 }} updateLesson={vi.fn()} fetchImpl={fetchImpl} />);
    fireEvent.change(screen.getByLabelText('فایل‌های درس'), { target: { files: [new File(['x'], 'big.mp4')] } });
    fireEvent.click(screen.getByText('استخراجِ دقیق'));
    expect(await screen.findByRole('alert')).toHaveTextContent('۲۵MB');
    rerender(<SmartUpload lesson={{ id: 1, _bodyPending: true }} updateLesson={vi.fn()} fetchImpl={fetchImpl} />);
    expect(screen.getByText('استخراجِ دقیق').closest('button').disabled).toBe(true);
  });
  it('corrections panel lists kind, quote, unverified flag', () => {
    render(<CorrectionsPanel corrections={[{ quote: 'q', kind: 'معنا', issue: 'i', verifiedQuote: false }]} />);
    expect(screen.getByText('(نقلِ نایافته)')).toBeTruthy();
  });
});

describe('SmartUpload restore', () => {
  it('offers server-side extractions that never reached the notes, and appends them', async () => {
    const { render: r, screen: sc, fireEvent: fe, waitFor: wf } = await import('@testing-library/react');
    const fetchImpl = vi.fn(async (url) => {
      if (url === '/api/lesson-files/9') return { ok: true, json: async () => ({ files: [{ id: 'old', name: 'x.mp3', hasExtract: true, status: 'ok' }, { id: 'f1', name: 'in.mp3', hasExtract: true, status: 'ok' }, { id: 'bad', name: 'b.mp3', hasExtract: true, status: 'failed' }] }) };
      if (url === '/api/lesson-files/9/old/extract') return { ok: true, json: async () => ({ file: { id: 'old', name: 'x.mp3', type: 'audio/mpeg' }, extract: { text: 'رونویسیِ کلاس', markedText: 'رونویسیِ کلاس', method: 'ai-verified', status: 'ok', corrections: [], notes: [] } }) };
      return { ok: false, json: async () => ({}) };
    });
    const updateLesson = vi.fn();
    r(<SmartUpload lesson={{ id: 9, archivedNotes: 'قدیمی', files: [{ id: 'f1', stored: true }], appliedExtracts: ['f1'] }} updateLesson={updateLesson} fetchImpl={fetchImpl} />);
    await wf(() => expect(sc.getByText(/1 فایل روی سرور استخراج شده/)).toBeTruthy());
    fe.click(sc.getByText('بازیابی و پیش‌نمایش'));
    await wf(() => expect(sc.getByTestId('smart-results')).toBeTruthy());
    fe.click(sc.getByText(/افزودن به جزوه/));
    const patch = updateLesson.mock.calls[0][1];
    expect(patch.archivedNotes.startsWith('قدیمی')).toBe(true);
    expect(patch.archivedNotes).toContain('رونویسیِ کلاس');
    expect(patch.files.map((f) => f.id)).toEqual(['f1', 'old']);
    expect(patch.appliedExtracts).toEqual(['f1', 'old']);
  });
});
