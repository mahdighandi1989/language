import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DocCapacity from './DocCapacity.jsx';

describe('DocCapacity', () => {
  it('shows the fill ratio, no warning when small', () => {
    render(<DocCapacity data={{ lessons: [{ id: 1, title: 't' }], knowledgeBase: { vocabulary: [{ term: 'a', definition: 'b' }] } }} />);
    expect(screen.getByRole('meter')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.getByText('مرکزِ دانش')).toBeTruthy(); // listed as a separate section
  });
  it('warns from 80%', () => {
    const lessons = Array.from({ length: 1000 }, (_, i) => ({ id: i, title: "x".repeat(900) }));
    render(<DocCapacity data={{ lessons }} />);
    expect(screen.getByRole('alert').textContent).toMatch(/پر است/);
    expect(Number(screen.getByRole('meter').getAttribute('aria-valuenow'))).toBeGreaterThanOrEqual(80);
  });
});
