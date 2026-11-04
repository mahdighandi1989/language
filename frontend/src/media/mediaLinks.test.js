import { describe, it, expect } from 'vitest';
import { parseMediaLink, isPlayableFile } from './mediaLinks.js';

describe('media links', () => {
  it('YouTube (watch/short/youtu.be with t), Drive, direct files; rejects the rest', () => {
    expect(parseMediaLink('https://www.youtube.com/watch?v=abcDEF12345&t=30')).toMatchObject({ kind: 'youtube', embed: 'https://www.youtube-nocookie.com/embed/abcDEF12345?start=30' });
    expect(parseMediaLink('https://youtu.be/abcDEF12345').id).toBe('abcDEF12345');
    expect(parseMediaLink('https://youtube.com/shorts/XYZ_987654').id).toBe('XYZ_987654');
    expect(parseMediaLink('https://drive.google.com/file/d/1AbCdEfGhIjKlMn/view?usp=sharing')).toMatchObject({ kind: 'drive', embed: 'https://drive.google.com/file/d/1AbCdEfGhIjKlMn/preview' });
    expect(parseMediaLink('https://example.com/a/lesson.MP3').kind).toBe('audio');
    expect(parseMediaLink('https://example.com/v.mp4').kind).toBe('video');
    expect(parseMediaLink('http://example.com/a.mp3')).toBeNull();
    expect(parseMediaLink('javascript:alert(1)')).toBeNull();
    expect(parseMediaLink('https://example.com/page')).toBeNull();
    expect(parseMediaLink('https://www.youtube.com/watch?v=<script>')).toBeNull();
  });
  it('recognises playable lesson files', () => {
    expect(isPlayableFile({ type: 'audio/mpeg' })).toBe('audio');
    expect(isPlayableFile({ name: 'x.MP4' })).toBe('video');
    expect(isPlayableFile({ name: 'x.pdf', type: 'application/pdf' })).toBeNull();
  });
});
