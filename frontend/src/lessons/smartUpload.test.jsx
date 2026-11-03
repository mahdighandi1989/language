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
    expect(fetchImpl.mock.calls[0][0]).toBe('/api/lesson-files/7');
    expect(fetchImpl.mock.calls[0][1].body.getAll('files')).toHaveLength(2);
    fireEvent.click(screen.getByText(/افزودن به جزوهٔ درس/));
    const patch = updateLesson.mock.calls[0][1];
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
