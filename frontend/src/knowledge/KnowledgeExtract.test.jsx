import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import KnowledgeExtract from './KnowledgeExtract.jsx';

const lesson = { id: 3, title: '3 - ریتا', archivedNotes: '## verbs\n| فعل | فارسی |\n|---|---|\n| حَبّ | دوست داشتن |\n| خاف | ترسیدن |\n\n## adj for human\n| عربی | فارسی |\n|---|---|\n| شاطر | زرنگ |\n| حنون | مهربان |' };

function H({ init, onData, callAI }) {
  const [data, setData] = useState(init);
  onData(data);
  return <KnowledgeExtract lesson={lesson} data={data} setData={setData} callAI={callAI} />;
}

describe('KnowledgeExtract', () => {
  it('extracts, unticks duplicates, lets the tab change, adds with the lesson reference', async () => {
    let data;
    render(<H init={{ knowledgeBase: { vocabulary: [{ term: 'شاطر', definition: 'زرنگ' }] } }} onData={(d) => { data = d; }} />);
    fireEvent.click(screen.getByText(/استخراجِ دقیق/));
    expect(screen.getByText(/4 آیتم: 3 تازه، 1 تکراری/)).toBeTruthy();
    expect(screen.getByLabelText('انتخابِ شاطر').checked).toBe(false);
    fireEvent.change(screen.getAllByLabelText('تب')[0], { target: { value: 'vocabulary' } });
    fireEvent.click(screen.getByText(/افزودنِ 3 آیتم/));
    expect(data.knowledgeBase.vocabulary.map((i) => i.term)).toEqual(['شاطر', 'حَبّ']);
    expect(data.knowledgeBase.verbs.map((i) => i.term)).toEqual(['خاف']);
    expect(data.knowledgeBase.adjectives[0]).toMatchObject({ term: 'حنون', lessonId: 3, source: 'درس: 3 - ریتا' });
  });
  it('Gemini items not present in the text are rejected', async () => {
    const callAI = vi.fn(async () => JSON.stringify([{ term: 'حنون', definition: 'مهربان', category: 'adjectives' }, { term: 'مسجيز', definition: 'ساختگی', category: 'vocabulary' }]));
    render(<H init={{ knowledgeBase: {} }} onData={() => {}} callAI={callAI} />);
    fireEvent.click(screen.getByText('+ تکمیل با Gemini'));
    await waitFor(() => expect(screen.getByText(/Gemini 1 آیتمِ تأییدشده/)).toBeTruthy());
    expect(screen.queryByDisplayValue('مسجيز')).toBeNull();
  });
  it('waits while the knowledge center is still loading', () => {
    render(<H init={{ knowledgeBase: {}, _sectionsPending: ['knowledgeBase'] }} onData={() => {}} />);
    expect(screen.getByText(/استخراجِ دقیق/).closest('button').disabled).toBe(true);
  });
});
