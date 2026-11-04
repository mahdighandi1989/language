import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CorrectionsPanel } from './SmartUpload.jsx';

function H({ onList }) {
  const [list, setList] = useState([{ quote: 'كِيفَك', kind: 'اعراب', issue: 'AI', verifiedQuote: true }]);
  onList(list);
  return <CorrectionsPanel corrections={list} onChange={setList} lessonText="كِيفَك يا خيي" author="ناظر" />;
}

describe('CorrectionsPanel (manual entries)', () => {
  it('adds a manual finding with quote check, marks done, filters, deletes with confirm', () => {
    let list;
    window.confirm = vi.fn(() => true);
    render(<H onList={(l) => { list = l; }} />);
    fireEvent.click(screen.getByText('➕ افزودنِ مورد'));
    fireEvent.change(screen.getByLabelText('تکهٔ متن'), { target: { value: 'يا خيي' } });
    fireEvent.change(screen.getByLabelText('مشکل'), { target: { value: 'معنی غلط' } });
    fireEvent.click(screen.getByText('ثبت'));
    expect(list[1]).toMatchObject({ quote: 'يا خيي', issue: 'معنی غلط', verifiedQuote: true, source: 'manual', author: 'ناظر' });
    fireEvent.click(screen.getAllByText('✓ انجام شد')[0]);
    expect(list[0].resolved).toBe(true);
    expect(screen.queryByText(/«كِيفَك»/)).toBeNull(); // filter = open
    fireEvent.click(screen.getAllByLabelText('حذفِ مورد')[0]);
    expect(list).toHaveLength(1);
  });
});
