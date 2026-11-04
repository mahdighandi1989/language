/**
 * Purpose: server-side copy of frontend/src/lessons/splitAudio.js (MP3 split at
 * frame boundaries, WAV with new headers — no decoding). Used to RE-TRY a bad
 * transcription with shorter parts. Keep both copies identical (tests on both).
 */
export const PART_BYTES = 8 * 1024 * 1024;

const BITRATES = { // kbps, [version][layer]
  1: { 1: [0, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448], 2: [0, 32, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 384], 3: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320] },
  2: { 1: [0, 32, 48, 56, 64, 80, 96, 112, 128, 144, 160, 176, 192, 224, 256], 2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160], 3: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160] },
};
const RATES = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] };

export function mp3FrameLength(u8, i) {
  if (i + 4 > u8.length || u8[i] !== 0xff || (u8[i + 1] & 0xe0) !== 0xe0) return 0;
  const verBits = (u8[i + 1] >> 3) & 3; // 0: 2.5, 2: 2, 3: 1
  const layerBits = (u8[i + 1] >> 1) & 3; // 1: III, 2: II, 3: I
  const brIdx = u8[i + 2] >> 4;
  const srIdx = (u8[i + 2] >> 2) & 3;
  const pad = (u8[i + 2] >> 1) & 1;
  if (verBits === 1 || layerBits === 0 || brIdx === 0 || brIdx === 15 || srIdx === 3) return 0;
  const layer = 4 - layerBits;
  const v = verBits === 3 ? 1 : 2;
  const kbps = BITRATES[v][layer][brIdx];
  const rate = RATES[verBits][srIdx];
  if (layer === 1) return Math.floor((12 * kbps * 1000) / rate + pad) * 4;
  const coef = layer === 3 && v === 2 ? 72 : 144;
  return Math.floor((coef * kbps * 1000) / rate) + pad;
}

/** First offset ≥ from where two consecutive valid frames start. */
function nextFrame(u8, from) {
  for (let i = from; i < u8.length - 4; i += 1) {
    const len = mp3FrameLength(u8, i);
    if (len > 0 && (i + len >= u8.length || mp3FrameLength(u8, i + len) > 0)) return i;
  }
  return -1;
}

export function splitMp3(buffer, maxBytes = PART_BYTES) {
  const u8 = new Uint8Array(buffer);
  let start = 0;
  if (u8[0] === 0x49 && u8[1] === 0x44 && u8[2] === 0x33) { // ID3v2 tag: skip it
    start = 10 + ((u8[6] & 0x7f) << 21 | (u8[7] & 0x7f) << 14 | (u8[8] & 0x7f) << 7 | (u8[9] & 0x7f));
  }
  start = nextFrame(u8, start);
  if (start < 0) return null;
  // A first «Xing»/«Info»/«VBRI» frame holds the WHOLE file's length and seek
  // table — kept in part 1 it makes players (and the model) see the full
  // duration. It carries no audio: drop it.
  const first = mp3FrameLength(u8, start);
  const head = String.fromCharCode(...u8.subarray(start, Math.min(u8.length, start + Math.min(first, 64))));
  if (/Xing|Info|VBRI/.test(head)) start += first;
  // Walk the frames (each header gives its length) and cut before the frame
  // that would overflow the part; resync after any garbage.
  const parts = [];
  let partStart = start;
  let i = start;
  while (i < u8.length) {
    let len = mp3FrameLength(u8, i);
    let next;
    if (len > 0) next = Math.min(u8.length, i + len);
    else { const r = nextFrame(u8, i + 1); next = r < 0 ? u8.length : r; len = next - i; }
    if (next - partStart > maxBytes && i > partStart) {
      parts.push(u8.subarray(partStart, i));
      partStart = i;
    }
    i = next;
  }
  if (partStart < u8.length) parts.push(u8.subarray(partStart));
  return parts;
}

export function splitWav(buffer, maxBytes = PART_BYTES) {
  const dv = new DataView(buffer);
  const tag = (o) => String.fromCharCode(dv.getUint8(o), dv.getUint8(o + 1), dv.getUint8(o + 2), dv.getUint8(o + 3));
  if (buffer.byteLength < 44 || tag(0) !== 'RIFF' || tag(8) !== 'WAVE') return null;
  let o = 12; let fmt = null; let data = null;
  while (o + 8 <= buffer.byteLength) {
    const id = tag(o); const size = dv.getUint32(o + 4, true);
    if (id === 'fmt ') fmt = { o: o + 8, size };
    if (id === 'data') { data = { o: o + 8, size: Math.min(size, buffer.byteLength - o - 8) }; break; }
    o += 8 + size + (size & 1);
  }
  if (!fmt || !data) return null;
  const blockAlign = dv.getUint16(fmt.o + 12, true) || 1;
  const fmtBytes = new Uint8Array(buffer, fmt.o, fmt.size);
  const per = Math.max(blockAlign, Math.floor((maxBytes - 64) / blockAlign) * blockAlign);
  const parts = [];
  for (let s = 0; s < data.size; s += per) {
    const len = Math.min(per, data.size - s);
    const out = new Uint8Array(12 + 8 + fmt.size + 8 + len);
    const w = new DataView(out.buffer);
    const put = (at, str) => { for (let k = 0; k < 4; k += 1) out[at + k] = str.charCodeAt(k); };
    put(0, 'RIFF'); w.setUint32(4, out.length - 8, true); put(8, 'WAVE');
    put(12, 'fmt '); w.setUint32(16, fmt.size, true); out.set(fmtBytes, 20);
    const d = 20 + fmt.size;
    put(d, 'data'); w.setUint32(d + 4, len, true);
    out.set(new Uint8Array(buffer, data.o + s, len), d + 8);
    parts.push(out);
  }
  return parts;
}

