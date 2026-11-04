import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import useDriveLinks, { driveInfoMap } from './useDriveLinks.js';

function Probe({ fetchImpl }) {
  const info = useDriveLinks(5, 2, fetchImpl);
  return <ul>{Object.entries(info).map(([id, v]) => <li key={id}>{id}:{v.link || v.error}</li>)}</ul>;
}

describe('Drive links', () => {
  it('maps files with a Drive copy or error', () => {
    expect(driveInfoMap([{ id: 'a', drive: { link: 'L' } }, { id: 'b', driveError: 'E' }, { id: 'c' }])).toEqual({ a: { link: 'L', error: '' }, b: { link: '', error: 'E' } });
  });
  it('reads them from the server', async () => {
    const fetchImpl = vi.fn(async () => ({ ok: true, json: async () => ({ files: [{ id: 'f1', drive: { link: 'https://drive.google.com/file/d/x/view' } }] }) }));
    render(<Probe fetchImpl={fetchImpl} />);
    await waitFor(() => expect(screen.getByText(/f1:https:\/\/drive/)).toBeTruthy());
    expect(fetchImpl).toHaveBeenCalledWith('/api/lesson-files/5');
  });
});
