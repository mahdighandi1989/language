// The auto-screenshot of a drawn box resolves asynchronously. Its result must
// never land (a) after the layer is gone, or (b) on a NEWER box than the one it
// was taken for — otherwise a sheet is filed with the wrong picture.
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

const pending = [];
vi.mock('./capture.js', async (orig) => ({
  ...(await orig()),
  captureViewportShot: vi.fn(() => new Promise((resolve) => { pending.push(resolve); })),
}));

import InspectionLayer from './InspectionLayer.jsx';

const api = () => ({ list: vi.fn(async () => ({ sheets: [] })), create: vi.fn(), upload: vi.fn(), blobUrl: vi.fn() });

function drawBox() {
  fireEvent.click(screen.getByText(/نظارت/));
  const overlay = document.querySelector('[style*="crosshair"]');
  fireEvent.mouseDown(overlay, { clientX: 10, clientY: 10 });
  fireEvent.mouseMove(overlay, { clientX: 110, clientY: 60 });
  fireEvent.mouseUp(overlay, { clientX: 110, clientY: 60 });
}

describe('InspectionLayer auto-screenshot', () => {
  beforeEach(() => { pending.length = 0; document.elementFromPoint = () => document.body; });

  it('a late screenshot of an abandoned box does not replace the newer box’s screenshot', async () => {
    render(<InspectionLayer api={api()} isOwner page="lessons" pageLabel="لیست دروس" reopen="#/lessons" onOpenBoard={() => {}} />);
    drawBox();
    fireEvent.click(await screen.findByText('انصراف'));
    drawBox();
    expect(pending.length).toBe(2);
    await act(async () => { pending[1]('data:image/png;base64,NEW'); });
    expect(screen.getByAltText('اسکرین‌شاتِ خودکار').getAttribute('src')).toBe('data:image/png;base64,NEW');
    await act(async () => { pending[0]('data:image/png;base64,OLD'); });
    expect(screen.getByAltText('اسکرین‌شاتِ خودکار').getAttribute('src')).toBe('data:image/png;base64,NEW');
  });

  it('a screenshot that resolves after unmount touches no state', async () => {
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { unmount } = render(<InspectionLayer api={api()} isOwner page="lessons" pageLabel="لیست دروس" reopen="#/lessons" onOpenBoard={() => {}} />);
    drawBox();
    await screen.findByText('انصراف');
    unmount();
    await act(async () => { pending[0]('data:image/png;base64,LATE'); });
    expect(err).not.toHaveBeenCalled();
    err.mockRestore();
  });
});
