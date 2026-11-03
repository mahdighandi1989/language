// Parity features with the reference project: general request, edit with the
// original kept, decline with reason, attachments (read %, download, detach),
// supervisor round bar, search, «رفتن به همان‌جا», auto-refresh notice.
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import InspectionBoard, { RoundsBar, urgentChanges, sheetText } from './InspectionBoard.jsx';
import InspectionLayer from './InspectionLayer.jsx';
import { rushMessage, humanGap, localClock } from './nextRound.js';
import { requestFocus, takeFocus } from './focus.js';

const base = (over = {}) => ({
  id: '4', number: 4, title: 'دکمه', status: 'open', statusLabel: 'در انتظارِ ناظر', createdBy: 'o@x',
  createdAt: '2026-11-02T10:00:00Z', page: 'lessons', pageLabel: 'لیست دروس', reopen: '#/lessons',
  glow: { tone: 'open', label: 'در انتظارِ ناظر' },
  notes: [{ id: 'a', by: 'owner', author: 'o@x', at: '2026-11-02T10:00:00Z', text: 'متنِ اول' }],
  files: [{ id: 'f1', filename: 'گزارش.docx', byteSize: 2048, extractStatus: 'ok', textChars: 100, readChars: 40, readPercent: 40, fullyRead: false, extractLabel: 'متن استخراج شد' }],
  readDebt: [], ...over,
});

function fakeApi(sheets, role = 'owner') {
  return {
    list: vi.fn(async () => ({ me: { role, email: 'o@x' }, store: { durable: true }, sheets })),
    rounds: vi.fn(async () => ({
      urgent: { at: new Date(Date.now() + 19 * 60000).toISOString(), basis: 'observed', lastSeen: new Date(Date.now() - 41 * 60000).toISOString(), everyMinutes: 60 },
      full: { at: new Date(Date.now() + 86400000).toISOString(), basis: 'scheduled', lastSeen: null, schedule: '23 2 * * 1,4' },
    })),
    editNote: vi.fn(async () => ({})), triage: vi.fn(async () => ({ mail: { status: 'sent' } })),
    detachFile: vi.fn(async () => ({})), download: vi.fn(async () => {}), urgent: vi.fn(async () => ({ position: 2, nextRound: null })),
    create: vi.fn(async (b) => ({ sheet: { id: '9', number: 9, statusLabel: 'در انتظارِ ناظر', ...b } })),
    upload: vi.fn(async () => ({})), approve: vi.fn(), reopen: vi.fn(), note: vi.fn(), blobUrl: vi.fn(),
  };
}

afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

describe('board parity', () => {
  it('shows the supervisor round bar, read %, and searches', async () => {
    render(<InspectionBoard api={fakeApi([base(), base({ id: '5', number: 5, title: 'دیگری', notes: [], files: [] })])} onReopenPage={() => {}} />);
    await screen.findByText(/#4/);
    expect(await screen.findByText(/آخرین دورِ ناظر/)).toBeTruthy();
    expect(screen.getByText(/دورِ بعدی/)).toBeTruthy();
    expect(screen.getByText(/آخرین دورِ کامل/)).toBeTruthy();
    expect(screen.getByText(/ناظر ۴۰٪ خوانده/)).toBeTruthy();
    fireEvent.change(screen.getByPlaceholderText(/جستجو در برگه‌ها/), { target: { value: 'دیگری' } });
    expect(screen.queryByText(/#4/)).toBeNull();
    expect(screen.getByText(/#5/)).toBeTruthy();
  });

  it('edits a note (original kept server-side), downloads and detaches an attachment', async () => {
    const api = fakeApi([base()]);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<InspectionBoard api={api} onReopenPage={() => {}} />);
    await screen.findByText(/#4/);
    fireEvent.click(screen.getByText('✏ ویرایش'));
    fireEvent.change(screen.getByDisplayValue('متنِ اول'), { target: { value: 'متنِ دوم' } });
    fireEvent.click(screen.getByText('ذخیرهٔ ویرایش'));
    await waitFor(() => expect(api.editNote).toHaveBeenCalledWith('4', 'a', 'متنِ دوم'));
    fireEvent.click(screen.getByText('دانلود'));
    await waitFor(() => expect(api.download).toHaveBeenCalledWith('f1', 'گزارش.docx'));
    fireEvent.click(screen.getByText('✕ برداشتن'));
    await waitFor(() => expect(api.detachFile).toHaveBeenCalledWith('f1'));
  });

  it('declines with a reason (empty allowed) and accepts', async () => {
    const api = fakeApi([base({ status: 'pending', statusLabel: 'در انتظارِ تأییدِ مدیر' })]);
    render(<InspectionBoard api={api} onReopenPage={() => {}} />);
    fireEvent.click(await screen.findByText(/^منتظرِ تأییدِ مدیر/));
    vi.spyOn(window, 'prompt').mockReturnValue('');
    fireEvent.click(screen.getByText(/رد با دلیل/));
    await waitFor(() => expect(api.triage).toHaveBeenCalledWith('4', 'decline', ''));
    fireEvent.click(screen.getByText('پذیرش و ارسال به ناظر'));
    await waitFor(() => expect(api.triage).toHaveBeenCalledWith('4', 'accept', ''));
  });

  it('files a general request (no box) with attachments', async () => {
    const api = fakeApi([]);
    render(<InspectionBoard api={api} onReopenPage={() => {}} />);
    fireEvent.click(await screen.findByText('＋ درخواستِ عمومی'));
    fireEvent.change(screen.getByPlaceholderText('چه می‌خواهید؟'), { target: { value: 'یک خواستهٔ کلی' } });
    fireEvent.click(screen.getByText('ثبتِ درخواست'));
    await waitFor(() => expect(api.create).toHaveBeenCalled());
    expect(api.create.mock.calls[0][0]).toMatchObject({ general: true, text: 'یک خواستهٔ کلی' });
    expect(api.create.mock.calls[0][0].geometry).toBeUndefined();
  });

  it('«رفتن به همان‌جا» asks the page layer to focus that sheet', async () => {
    const onReopen = vi.fn();
    render(<InspectionBoard api={fakeApi([base()])} onReopenPage={onReopen} />);
    fireEvent.click(await screen.findByText('↗ رفتن به همان‌جا'));
    expect(onReopen).toHaveBeenCalled();
    expect(takeFocus()).toBe('4');
    expect(takeFocus()).toBeNull();
  });
});

describe('auto-refresh and notices', () => {
  it('detects urgent sheets the supervisor answered between polls', () => {
    const s = (status, n) => ({ id: '1', number: 1, title: 't', status, urgentAt: 'x', urgentDoneAt: status === 'answered' ? 'y' : null, notes: Array(n).fill({}), glow: { label: '✓ درست شد' } });
    const first = urgentChanges({}, [s('open', 1)]);
    expect(first.changed).toEqual([]);
    const second = urgentChanges(first.states, [s('answered', 2)]);
    expect(second.changed[0]).toMatchObject({ number: 1, label: '✓ درست شد' });
  });

  it('polls only while an urgent sheet waits, and shows «ناظر روی موردهای فوری کار کرد»', async () => {
    let call = 0;
    const urgent = base({ urgentAt: '2026-11-02T10:00:00Z', urgentDoneAt: null });
    const answered = base({ urgentAt: '2026-11-02T10:00:00Z', urgentDoneAt: '2026-11-02T11:00:00Z', status: 'answered', glow: { tone: 'fixed', label: '✓ درست شد' }, notes: [...urgent.notes, { id: 'b', by: 'reviewer', at: '2026-11-02T11:00:00Z', text: 'انجام شد', outcome: 'fixed', afterShotId: 'x' }] });
    const api = fakeApi([]);
    api.list = vi.fn(async () => { call += 1; return { me: { role: 'owner' }, store: { durable: true }, sheets: [call === 1 ? urgent : answered] }; });
    render(<InspectionBoard api={api} onReopenPage={() => {}} pollMs={30} />);
    expect(await screen.findByText(/ناظر روی موردهای فوری کار کرد/, {}, { timeout: 2000 })).toBeTruthy();
  });
});

describe('helpers', () => {
  it('rush message and gaps read naturally and say «تخمینی» when assumed', () => {
    const now = new Date('2026-11-03T10:00:00');
    expect(humanGap(19)).toBe('۱۹ دقیقهٔ دیگر');
    expect(rushMessage(2, { at: new Date('2026-11-03T10:19:00').toISOString(), basis: 'assumed' }, now)).toMatch(/نفرِ ۲.*۱۰:۱۹.*تخمینی/);
    expect(rushMessage(1, { at: now.toISOString(), basis: 'stale', lastSeen: now.toISOString() }, now)).toMatch(/سر نزده/);
    expect(localClock(new Date('2026-11-04T09:05:00').toISOString(), now)).toMatch(/فردا/);
  });
  it('stale rounds warn instead of counting down', () => {
    render(<RoundsBar rounds={{ urgent: { basis: 'stale', at: new Date().toISOString(), lastSeen: new Date().toISOString() }, full: { basis: 'stale', at: new Date().toISOString() } }} />);
    expect(screen.getByText(/ناظرِ فوری مدتی است سر نزده/)).toBeTruthy();
    expect(screen.getByText(/دورِ کاملِ ناظر مدتی است نیامده/)).toBeTruthy();
  });
  it('search text covers notes and file names', () => {
    expect(sheetText(base())).toMatch(/متنِ اول/);
    expect(sheetText(base())).toMatch(/گزارش\.docx/);
  });
});

describe('layer focus', () => {
  it('flashes the focused sheet after navigation', async () => {
    document.body.innerHTML = '<div id="card">x</div>';
    const el = document.getElementById('card');
    el.getBoundingClientRect = () => ({ left: 10, top: 10, width: 100, height: 50 });
    window.scrollBy = vi.fn();
    requestFocus('4');
    const api = { list: vi.fn(async () => ({ sheets: [base({ geometry: { anchor: { selector: '#card', fx: 0, fy: 0, fw: 1, fh: 1 } } })] })) };
    await act(async () => { render(<InspectionLayer api={api} isOwner page="lessons" pageLabel="x" reopen="#/lessons" onOpenBoard={() => {}} />); });
    await waitFor(() => expect(document.querySelector('[data-flash="1"]')).toBeTruthy());
    expect(window.scrollBy).toHaveBeenCalled();
  });
});
