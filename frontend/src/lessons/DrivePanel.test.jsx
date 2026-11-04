import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DrivePanel from './DrivePanel.jsx';

const ok = (body) => ({ ok: true, json: async () => body });
describe('DrivePanel', () => {
  it('not configured: names the missing Render variables', async () => {
    render(<DrivePanel fetchImpl={vi.fn(async () => ok({ configured: false, connected: false, missing: ['GOOGLE_OAUTH_CLIENT_ID', 'GOOGLE_OAUTH_CLIENT_SECRET'] }))} />);
    await waitFor(() => expect(screen.getByText(/GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET/)).toBeTruthy());
  });
  it('configured: connect button; connected: email + copy earlier files', async () => {
    const { unmount } = render(<DrivePanel fetchImpl={vi.fn(async () => ok({ configured: true, connected: false, missing: [] }))} />);
    await waitFor(() => expect(screen.getByText('🔗 اتصالِ Google Drive')).toBeTruthy());
    unmount();
    render(<DrivePanel fetchImpl={vi.fn(async () => ok({ configured: true, connected: true, email: 'owner@gmail.com', missing: [] }))} />);
    await waitFor(() => expect(screen.getByText('owner@gmail.com')).toBeTruthy());
    expect(screen.getByText('انتقالِ فایل‌های قبلی به Drive')).toBeTruthy();
  });
});
