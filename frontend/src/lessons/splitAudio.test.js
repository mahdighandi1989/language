import { describe, it, expect } from 'vitest';
import { mp3FrameLength, splitMp3, splitWav, splitAudioFile } from './splitAudio.js';

// A synthetic MPEG-1 Layer III 128kbps 44.1kHz stream: frame length 417 bytes.
function fakeMp3(frames, id3 = true) {
  const frame = new Uint8Array(417); frame.set([0xff, 0xfb, 0x90, 0x00]);
  const tag = id3 ? [0x49, 0x44, 0x33, 3, 0, 0, 0, 0, 0, 5, 1, 2, 3, 4, 5] : [];
  const out = new Uint8Array(tag.length + frames * 417);
  out.set(tag);
  for (let i = 0; i < frames; i += 1) out.set(frame, tag.length + i * 417);
  return out.buffer;
}

function fakeWav(samples) {
  const data = samples * 2; const b = new ArrayBuffer(44 + data); const v = new DataView(b);
  const put = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  put(0, 'RIFF'); v.setUint32(4, 36 + data, true); put(8, 'WAVE'); put(12, 'fmt '); v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, 16000, true); v.setUint32(28, 32000, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  put(36, 'data'); v.setUint32(40, data, true);
  return b;
}

describe('splitAudio', () => {
  it('reads MP3 frame lengths and cuts only at frame boundaries (ID3 skipped)', () => {
    const buf = fakeMp3(100);
    expect(mp3FrameLength(new Uint8Array(buf), 15)).toBe(417);
    const parts = splitMp3(buf, 417 * 30 + 100);
    expect(parts.length).toBe(4);
    for (const p of parts) { expect(p[0]).toBe(0xff); expect(p.length % 417).toBe(0); }
    expect(parts.reduce((a, p) => a + p.length, 0)).toBe(417 * 100);
  });
  it('splits WAV with a valid header per part and no lost samples', () => {
    const parts = splitWav(fakeWav(10000), 6000);
    const total = parts.reduce((a, p) => a + new DataView(p.buffer).getUint32(40, true), 0);
    expect(total).toBe(20000);
    for (const p of parts) {
      expect(String.fromCharCode(...p.slice(0, 4))).toBe('RIFF');
      expect(new DataView(p.buffer).getUint32(40, true) % 2).toBe(0);
    }
  });
  it('splitAudioFile: small files untouched, mp3 named in order, m4a refused', async () => {
    const small = new File([new Uint8Array(10)], 'a.mp3', { type: 'audio/mpeg' });
    expect(await splitAudioFile(small, 1000)).toEqual([small]);
    const big = new File([fakeMp3(100, false)], '25 - ریتا.mp3', { type: 'audio/mpeg' });
    const out = await splitAudioFile(big, 417 * 40);
    expect(out.map((f) => f.name)).toEqual(['25 - ریتا - بخش 1 از 3.mp3', '25 - ریتا - بخش 2 از 3.mp3', '25 - ریتا - بخش 3 از 3.mp3']);
    expect(await splitAudioFile(new File([new Uint8Array(5000)], 'x.m4a', { type: 'audio/mp4' }), 1000)).toBeNull();
  });
});
