// UI tests for «نظارت و سرکشی»: the board shows outcome separately from status,
// gives owner-only actions only to the owner, never offers delete; the layer
// turns a drag into a sheet with geometry and uploads attachments.
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InspectionBoard from './InspectionBoard.jsx';
import InspectionLayer from './InspectionLayer.jsx';

const answered = {
  id: '4', number: 4, title: 'دکمه', status: 'answered', statusLabel: 'ناظر پاسخ داد', createdBy: 'o@x', createdAt: '2026-11-02T10:00:00Z',
  page: 'lessons', pageLabel: 'لیست دروس', reopen: '#/lessons',
  glow: { tone: 'fixed', label: '✓ درست شد', hint: 'تصویرِ بعدش روی برگه است.' },
  notes: [
    { id: 'a', by: 'owner', at: '2026-11-02T10:00:00Z', text: 'کار نمی‌کند' },
    { id: 'b', by: 'reviewer', at: '2026-11-02T11:00:00Z', text: 'درست شد', outcome: 'fixed', afterShotId: '4-b-after', deps: [{ name: 'API', status: 'ok' }], commits: ['abc'] },
  ],
  files: [], readDebt: [],
};

function fakeApi(role, sheets = [answered]) {
  return {
    list: vi.fn(async () => ({ me: { role }, store: { durable: false, note: 'ذخیره موقت' }, sheets })),
    approve: vi.fn(async () => ({})), reopen: vi.fn(), triage: vi.fn(), urgent: vi.fn(), note: vi.fn(), upload: vi.fn(),
    create: vi.fn(async (body) => ({ sheet: { id: '9', number: 9, statusLabel: 'در انتظارِ ناظر', ...body } })),
    blobUrl: vi.fn(),
  };
}

describe('InspectionBoard', () => {
  it('owner sees the tick and the outcome; no delete anywhere; ephemeral store is loud', async () => {
    const api = fakeApi('owner');
    render(<InspectionBoard api={api} onReopenPage={() => {}} />);
    await screen.findByText(/#4/);
    expect(screen.getByText('ذخیره موقت', { exact: false })).toBeTruthy();
    expect(screen.getAllByText('✓ درست شد').length).toBeGreaterThan(0);
    expect(screen.getByText(/API/)).toBeTruthy();
    expect(screen.queryByText(/حذف/)).toBeNull();
    fireEvent.click(screen.getByText('✔ تیکِ تأیید'));
    await waitFor(() => expect(api.approve).toHaveBeenCalledWith('4'));
  });

  it('a normal user gets no owner actions', async () => {
    render(<InspectionBoard api={fakeApi('user')} onReopenPage={() => {}} />);
    await screen.findByText(/#4/);
    expect(screen.queryByText('✔ تیکِ تأیید')).toBeNull();
    expect(screen.queryByText('⚡ فوری')).toBeNull();
  });
});

describe('InspectionLayer', () => {
  it('drag → form → sheet with geometry, page and reopen; then attachments', async () => {
    const api = fakeApi('owner', []);
    document.elementFromPoint = () => document.body;
    render(<InspectionLayer api={api} isOwner page="lessons" pageLabel="لیست دروس" reopen="#/lessons" onOpenBoard={() => {}} />);
    fireEvent.click(screen.getByText(/نظارت/));
    const overlay = document.querySelector('[style*="crosshair"]');
    fireEvent.mouseDown(overlay, { clientX: 10, clientY: 10 });
    fireEvent.mouseMove(overlay, { clientX: 110, clientY: 60 });
    fireEvent.mouseUp(overlay, { clientX: 110, clientY: 60 });
    fireEvent.change(await screen.findByPlaceholderText(/چه چیزی اشتباه است/), { target: { value: 'این‌جا مشکل دارد' } });
    const file = new File(['x'], 'a.txt', { type: 'text/plain' });
    fireEvent.change(document.querySelector('input[type="file"]'), { target: { files: [file] } });
    fireEvent.click(screen.getByText('ثبتِ برگه'));
    await waitFor(() => expect(api.create).toHaveBeenCalled());
    const body = api.create.mock.calls[0][0];
    expect(body).toMatchObject({ page: 'lessons', reopen: '#/lessons', text: 'این‌جا مشکل دارد' });
    expect(body.geometry.doc).toMatchObject({ w: 100, h: 50 });
    await waitFor(() => expect(api.upload).toHaveBeenCalledWith('9', [file]));
  });
});
