import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LessonMedia from './LessonMedia.jsx';

function H({ init, onLesson }) {
  const [lesson, setLesson] = useState(init);
  onLesson?.(lesson);
  return <LessonMedia lesson={lesson} updateLesson={(id, patch) => setLesson((l) => ({ ...l, ...patch }))} />;
}

describe('LessonMedia', () => {
  it('adds a YouTube link as an embed, rejects bad links, and plays a stored audio on demand', async () => {
    global.fetch = vi.fn(async () => ({ ok: true, blob: async () => new Blob(['x'], { type: 'audio/mpeg' }) }));
    global.URL.createObjectURL = vi.fn(() => 'blob:a');
    global.URL.revokeObjectURL = vi.fn();
    let lesson;
    const { container } = render(<H init={{ id: 5, files: [{ id: 'f1', name: 'درس.mp3', type: 'audio/mpeg', stored: true }, { id: 'f2', name: 'x.pdf', type: 'application/pdf' }] }} onLesson={(l) => { lesson = l; }} />);
    expect(screen.getByText(/درس\.mp3/)).toBeTruthy();
    expect(screen.queryByText(/x\.pdf/)).toBeNull();
    fireEvent.change(screen.getByPlaceholderText(/لینکِ یوتیوب/), { target: { value: 'https://example.com/page' } });
    fireEvent.click(screen.getByText('افزودن'));
    expect(screen.getByRole('alert')).toBeTruthy();
    fireEvent.change(screen.getByPlaceholderText(/لینکِ یوتیوب/), { target: { value: 'https://youtu.be/abcDEF12345' } });
    fireEvent.click(screen.getByText('افزودن'));
    expect(lesson.mediaLinks).toHaveLength(1);
    expect(container.querySelector('iframe').getAttribute('src')).toBe('https://www.youtube-nocookie.com/embed/abcDEF12345');
    fireEvent.click(screen.getByText('▶️ پخش صوت'));
    await waitFor(() => expect(container.querySelector('audio')?.getAttribute('src')).toBe('blob:a'));
    expect(global.fetch).toHaveBeenCalledWith('/api/lesson-files/5/f1/raw');
  });
});
