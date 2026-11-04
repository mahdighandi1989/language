import React, { useState } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import KnowledgeCenter from './KnowledgeCenter.jsx';

function Harness({ onData }) {
  const [data, setData] = useState({ knowledgeBase: { vocabulary: [{ id: 1, term: 'بيت', definition: 'خانه' }], grammar: [] }, kbCategories: {} });
  const [modal, setModal] = useState(null);
  onData(data);
  return (
    <>
      <KnowledgeCenter knowledgeBase={data.knowledgeBase} kbCategories={data.kbCategories} setData={setData} setModalConfig={setModal} />
      {modal && <div>{modal.message}{(modal.buttons || []).map((b) => <button key={b.label} onClick={b.onClick}>{b.label}</button>)}</div>}
    </>
  );
}

describe('KnowledgeCenter', () => {
  it('edits and deletes an item', () => {
    let data;
    render(<Harness onData={(d) => { data = d; }} />);
    fireEvent.click(screen.getByLabelText('ویرایشِ بيت'));
    fireEvent.change(screen.getByLabelText('معنی'), { target: { value: 'منزل' } });
    fireEvent.click(screen.getByText('ذخیره'));
    expect(data.knowledgeBase.vocabulary[0].definition).toBe('منزل');
    fireEvent.click(screen.getByLabelText('حذفِ بيت'));
    fireEvent.click(screen.getByText('حذف'));
    expect(data.knowledgeBase.vocabulary).toHaveLength(0);
  });
  it('adds and renames a tab', () => {
    let data;
    render(<Harness onData={(d) => { data = d; }} />);
    fireEvent.click(screen.getByLabelText('مدیریتِ تب‌ها'));
    fireEvent.change(screen.getByPlaceholderText('نامِ تبِ تازه'), { target: { value: 'اعداد' } });
    fireEvent.click(screen.getByText('افزودن'));
    expect(Object.values(data.kbCategories.labels)).toContain('اعداد');
    fireEvent.click(screen.getByLabelText('تغییرِ نامِ گرامر'));
    fireEvent.change(screen.getByDisplayValue('گرامر'), { target: { value: 'دستور' } });
    fireEvent.click(screen.getByLabelText('ذخیرهٔ نام'));
    expect(data.kbCategories.labels.grammar).toBe('دستور');
  });
});
