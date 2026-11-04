import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Shadowing from './Shadowing.jsx';

const lesson = { id: 3, title: 'ریتا', archivedNotes: '| عربی | فارسی |\n|---|---|\n| كِيفَك؟ | حالت چطوره؟ |\n| شُو بَدَّك؟ | چی می‌خوای؟ |' };

describe('Shadowing', () => {
  it('lists the lesson sentences and plays the teacher (TTS once, cached)', async () => {
    const tts = vi.fn(async () => ({ audioData: 'AAAA', mimeType: 'audio/pcm;rate=24000' }));
    const play = vi.fn(() => Promise.resolve());
    global.Audio = vi.fn(function A() { this.play = play; this.pause = () => {}; });
    render(<Shadowing lesson={lesson} data={{}} setData={() => {}} callAI={vi.fn()} tts={tts} toWavUrl={() => 'blob:x'} />);
    expect(screen.getByText('كِيفَك؟', { selector: 'p' })).toBeTruthy();
    expect(screen.getByText('حالت چطوره؟')).toBeTruthy();
    fireEvent.click(screen.getByText('🔊 صدای استاد'));
    await waitFor(() => expect(play).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByText('🐢 آهسته'));
    await waitFor(() => expect(play).toHaveBeenCalledTimes(2));
    expect(tts).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByLabelText('جملهٔ بعدی'));
    expect(screen.getByText('شُو بَدَّك؟', { selector: 'p' })).toBeTruthy();
  });
});
