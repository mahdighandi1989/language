import { describe, it, expect } from 'vitest';
import { installSingleMedia } from './singleMedia.js';

describe('single media playback', () => {
  it('starting one media element pauses the previous one', async () => {
    const proto = { play() { this.paused = false; return Promise.resolve(); }, pause() { this.paused = true; } };
    const undo = installSingleMedia(proto);
    const a = Object.create(proto); a.paused = true;
    const b = Object.create(proto); b.paused = true;
    await a.play();
    expect(a.paused).toBe(false);
    await b.play();
    expect(a.paused).toBe(true);
    expect(b.paused).toBe(false);
    undo();
  });
});
