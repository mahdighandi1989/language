import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import KnowledgeCenter from './KnowledgeCenter.jsx';

function H({ init, onData }) {
  const [data, setData] = useState(init);
  onData(data);
  return <KnowledgeCenter data={data} knowledgeBase={data.knowledgeBase} kbCategories={data.kbCategories} setData={setData} setModalConfig={() => {}} />;
}
const init = () => ({ knowledgeBase: { vocabulary: [
  { id: 1, term: 'بَيْت', definition: 'خانه' }, { id: 2, term: 'بيت', definition: 'منزل' },
  { id: 3, term: 'مَيّ', definition: 'آب' }, { id: 4, term: 'شُبّاك', definition: 'پنجره' }, { id: 5, term: 'باب', definition: 'در' },
] }, kbCategories: {} });

describe('KbTools via KnowledgeCenter', () => {
  it('review: merges a duplicate and can undo it', () => {
    let data;
    window.confirm = vi.fn(() => true);
    render(<H init={init()} onData={(d) => { data = d; }} />);
    fireEvent.click(screen.getByRole('tab', { name: '🩺 بازبینی' }));
    expect(screen.getByText('گروهِ تکراری', { exact: false })).toBeTruthy();
    fireEvent.click(screen.getByText('ادغام'));
    expect(data.knowledgeBase.vocabulary).toHaveLength(4);
    expect(data.knowledgeBase.vocabulary[0].definition).toBe('خانه / منزل');
    fireEvent.click(screen.getByText(/برگرداندنِ آخرین ادغام/));
    expect(data.knowledgeBase.vocabulary).toHaveLength(5);
    expect(data.kbMergeLog).toHaveLength(0);
  });
  it('flashcards: grading moves the card and is saved in kbReview', () => {
    let data;
    render(<H init={init()} onData={(d) => { data = d; }} />);
    fireEvent.click(screen.getByRole('tab', { name: '🃏 فلش‌کارت' }));
    fireEvent.click(screen.getByText('نمایشِ معنی'));
    fireEvent.click(screen.getByText('✓ بلد بودم'));
    expect(Object.values(data.kbReview)[0]).toMatchObject({ box: 1, seen: 1 });
  });
  it('quick quiz builds 4-option questions', () => {
    render(<H init={init()} onData={() => {}} />);
    fireEvent.click(screen.getByRole('tab', { name: '❓ آزمونِ سریع' }));
    fireEvent.click(screen.getByText(/شروعِ آزمون/));
    expect(screen.getAllByText(/^\d+\. /).length).toBe(5);
  });
});
