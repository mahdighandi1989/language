import { describe, it, expect } from 'vitest';
import { createBodyLoader } from './bodyLoader.js';
import { lessonContextExcerpt } from './excerpt.js';
import { lessonSearchText } from './sortLessons.js';
import { textHash } from './lessonBodies.js';

const tick = () => new Promise((r) => setTimeout(r, 0));

describe('body loader', () => {
  it('runs N at a time, honours priority, batches results, reports progress, survives errors', async () => {
    const started = [];
    const resolvers = new Map();
    let peak = 0; let running = 0;
    const read = (key) => { started.push(key); running += 1; peak = Math.max(peak, running);
      return new Promise((res, rej) => resolvers.set(key, (ok) => { running -= 1; ok ? res({ text: `t-${key}`, hash: 'h' }) : rej(new Error('x')); })); };
    const batches = []; const progress = [];
    const keys = Array.from({ length: 10 }, (_, i) => `L${i}`);
    const loader = createBodyLoader({ read, keys, concurrency: 3, flushMs: 0, onBatch: (b) => batches.push(b), onProgress: (p) => progress.push(p), setTimer: (fn) => setTimeout(fn, 0) });
    await tick();
    expect(started).toEqual(['L0', 'L1', 'L2']);
    loader.prioritize('L9'); // the lesson the user just opened
    resolvers.get('L0')(true);
    await tick(); await tick();
    expect(started[3]).toBe('L9');
    resolvers.get('L1')(false); // a failure does not stop the rest
    for (let round = 0; round < 10; round += 1) { for (const [k, r] of resolvers) { if (!['L0', 'L1'].includes(k)) r(true); } await tick(); await tick(); }
    const res = await loader.finished;
    expect(res).toEqual({ done: 10, total: 10, failed: 1 });
    expect(peak).toBeLessThanOrEqual(3);
    expect(batches.flat().find((b) => b.key === 'L1').error).toBeTruthy();
    expect(batches.flat().filter((b) => b.text)).toHaveLength(9);
    expect(progress[progress.length - 1]).toEqual({ done: 10, total: 10, failed: 1 });
  });
});

describe('chat excerpt for long lessons', () => {
  it('short notes pass through unchanged', () => {
    expect(lessonContextExcerpt('متن کوتاه', 'x', 100)).toBe('متن کوتاه');
  });
  it('long notes: opening + the related section verbatim, within budget, gaps marked', () => {
    const sec = (n, w) => `## بخش ${n}\n${(`${w} `).repeat(400)}`;
    const notes = [sec(0, 'مقدمه'), sec(1, 'قهوة'), sec(2, 'سيارة'), sec(3, 'مطعم')].join('\n\n');
    const out = lessonContextExcerpt(notes, 'بدّي سيارة جديدة', 6000);
    expect(out.length).toBeLessThanOrEqual(6200);
    expect(out.startsWith('## بخش 0')).toBe(true);
    expect(out).toContain(sec(2, 'سيارة').trim());
    expect(out).not.toContain('## بخش 1');
    expect(out).toContain('[…]');
  });
});

describe('memoised work', () => {
  it('search text is computed once per lesson object; hash memo returns the same value', () => {
    const l = { title: 'كيفك', summary: '', archivedNotes: 'مَرحبا' };
    const a = lessonSearchText(l);
    expect(a).toBe(lessonSearchText(l));
    expect(a).toContain('کیفک');
    const big = 'ع'.repeat(10000);
    expect(textHash(big)).toBe(textHash(`${'ع'.repeat(10000)}`));
    expect(textHash(big)).not.toBe(textHash(`${'ع'.repeat(9999)}غ`));
  });
});
