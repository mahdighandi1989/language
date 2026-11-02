/**
 * Purpose: turn an attached file into the text the supervisor MUST read, at
 * upload time. Statuses never collapse «nothing to read» into «read nothing»:
 *   ok · empty · unsupported · failed · image · pending (audio/video awaiting a
 *   transcript). Supported without extra dependencies: any UTF-8 text/code/CSV/
 *   JSON/HTML/SVG; PDF (pdf-parse); Office Open XML (.docx/.xlsx/.pptx); OpenDocument
 *   (.odt/.ods/.odp); EPUB; ZIP (every inner file with its own reader). Audio and
 *   video are transcribed in full with Gemini (when the key is configured).
 *
 * Upstream: pdf-parse, zlib, services/geminiService.js (lazy). Downstream:
 * routes/inspection.js.
 */
import zlib from 'zlib';

export const MAX_TEXT_CHARS = 2_000_000;

const TEXT_EXT = /\.(txt|md|markdown|csv|tsv|json|jsonl|xml|html?|svg|css|js|jsx|mjs|cjs|ts|tsx|py|rb|go|rs|java|kt|c|h|cpp|hpp|cs|php|sh|bash|yml|yaml|toml|ini|cfg|conf|env|log|sql|srt|vtt|tex|rtf)$/i;
const IMAGE = /^image\//;
const AV = /^(audio|video)\//;

function decodeEntities(s) {
  return s
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, '&');
}

/** Strip XML to text, turning paragraph/row/cell ends into breaks. */
export function xmlToText(xml) {
  return decodeEntities(
    String(xml)
      .replace(/<(w:tab|text:tab)\b[^>]*\/>/g, '\t')
      .replace(/<\/(w:p|a:p|text:p|text:h|row|w:tr|table:table-row|p|div|li|h[1-6]|tr)>/g, '\n')
      .replace(/<(w:br|text:line-break|br)\b[^>]*\/?>/g, '\n')
      .replace(/<\/(c|w:tc|table:table-cell|td|th)>/g, '\t')
      .replace(/<[^>]+>/g, ''),
  ).replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

/** Minimal ZIP reader (stored + deflate). Returns [{ name, data }]. */
export function readZip(buf) {
  const out = [];
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i -= 1) {
    if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('not a zip archive');
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  for (let n = 0; n < count && p + 46 <= buf.length; n += 1) {
    if (buf.readUInt32LE(p) !== 0x02014b50) break;
    const method = buf.readUInt16LE(p + 10);
    const compSize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localOff = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen);
    p += 46 + nameLen + extraLen + commentLen;
    if (name.endsWith('/')) continue;
    const lNameLen = buf.readUInt16LE(localOff + 26);
    const lExtraLen = buf.readUInt16LE(localOff + 28);
    const start = localOff + 30 + lNameLen + lExtraLen;
    const raw = buf.subarray(start, start + compSize);
    let data;
    if (method === 0) data = raw;
    else if (method === 8) data = zlib.inflateRawSync(raw);
    else { out.push({ name, data: null, note: `روشِ فشرده‌سازیِ ${method} پشتیبانی نمی‌شود` }); continue; }
    out.push({ name, data });
  }
  return out;
}

function looksLikeText(buf) {
  const head = buf.subarray(0, 8192);
  if (head.includes(0)) return false;
  const s = head.toString('utf8');
  const bad = (s.match(/�/g) || []).length;
  return bad <= Math.max(2, s.length / 200);
}

function byName(entries, re) {
  return entries.filter((e) => e.data && re.test(e.name)).sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }));
}

function officeText(name, entries) {
  const lower = name.toLowerCase();
  if (lower.endsWith('.docx')) {
    return byName(entries, /^word\/(document|header\d*|footer\d*|footnotes|endnotes)\.xml$/).map((e) => xmlToText(e.data.toString('utf8'))).join('\n\n');
  }
  if (lower.endsWith('.xlsx')) {
    const shared = byName(entries, /^xl\/sharedStrings\.xml$/).map((e) => xmlToText(e.data.toString('utf8'))).join('\n');
    const sheets = byName(entries, /^xl\/worksheets\/sheet\d+\.xml$/).map((e) => `# ${e.name}\n${xmlToText(e.data.toString('utf8'))}`).join('\n\n');
    return `${shared}\n\n${sheets}`.trim();
  }
  if (lower.endsWith('.pptx')) {
    return byName(entries, /^ppt\/(slides\/slide\d+|notesSlides\/notesSlide\d+)\.xml$/).map((e) => `# ${e.name}\n${xmlToText(e.data.toString('utf8'))}`).join('\n\n');
  }
  if (/\.(odt|ods|odp)$/.test(lower)) {
    return byName(entries, /^content\.xml$/).map((e) => xmlToText(e.data.toString('utf8'))).join('\n');
  }
  if (lower.endsWith('.epub')) {
    return byName(entries, /\.(x?html?)$/i).map((e) => `# ${e.name}\n${xmlToText(e.data.toString('utf8'))}`).join('\n\n');
  }
  return null;
}

function finish(text, extra = {}) {
  const t = String(text || '');
  if (!t.trim()) return { status: 'empty', text: '', note: 'فایل باز شد ولی متنی نداشت', ...extra };
  const truncated = t.length > MAX_TEXT_CHARS;
  return { status: 'ok', text: truncated ? t.slice(0, MAX_TEXT_CHARS) : t, truncated, note: '', ...extra };
}

/**
 * Extract text from a buffer. Returns { status, text, truncated, note, pageCount }.
 * Never throws: a failure is a status with its reason.
 */
export async function extractText({ buffer, filename = '', mime = '' }, depth = 0) {
  const name = String(filename);
  const type = String(mime || '').toLowerCase();
  try {
    if (IMAGE.test(type) && !/svg/.test(type)) return { status: 'image', text: '', note: 'تصویر — باید دیده شود' };
    if (AV.test(type)) return { status: 'pending', text: '', note: 'صوت/ویدیو — در صفِ رونویسیِ کامل' };
    if (type === 'application/pdf' || /\.pdf$/i.test(name)) {
      const pdfParse = (await import('pdf-parse')).default;
      const data = await pdfParse(buffer);
      return finish(data.text, { pageCount: data.numpages || 0 });
    }
    const isZip = buffer.length > 4 && buffer.readUInt32LE(0) === 0x04034b50;
    if (isZip) {
      const entries = readZip(buffer);
      const office = officeText(name, entries);
      if (office !== null) return finish(office);
      if (depth > 2) return { status: 'unsupported', text: '', note: 'آرشیوِ تودرتوی عمیق' };
      const parts = [];
      for (const e of entries) {
        if (!e.data) { parts.push(`## ${e.name}\n(${e.note})`); continue; }
        // eslint-disable-next-line no-await-in-loop
        const inner = await extractText({ buffer: e.data, filename: e.name, mime: guessMime(e.name) }, depth + 1);
        parts.push(`## ${e.name} — ${inner.status}\n${inner.text || inner.note || ''}`);
      }
      return finish(parts.join('\n\n'));
    }
    if (type.startsWith('text/') || /json|xml|javascript|csv|yaml|svg/.test(type) || TEXT_EXT.test(name) || looksLikeText(buffer)) {
      return finish(buffer.toString('utf8'));
    }
    return { status: 'unsupported', text: '', note: `برای «${type || 'نامشخص'}» استخراجِ متن نداریم — خودِ فایل باید باز شود` };
  } catch (e) {
    return { status: 'failed', text: '', note: `استخراج شکست خورد: ${String(e?.message || e).slice(0, 300)}` };
  }
}

export function guessMime(name) {
  const n = String(name).toLowerCase();
  if (/\.(png)$/.test(n)) return 'image/png';
  if (/\.(jpe?g)$/.test(n)) return 'image/jpeg';
  if (/\.(gif|webp|bmp|tiff?|heic|avif|ico)$/.test(n)) return `image/${n.split('.').pop()}`;
  if (/\.(mp3|wav|m4a|ogg|opus|flac|aac|amr)$/.test(n)) return 'audio/mpeg';
  if (/\.(mp4|mov|mkv|webm|avi|3gp)$/.test(n)) return 'video/mp4';
  if (n.endsWith('.pdf')) return 'application/pdf';
  if (n.endsWith('.zip')) return 'application/zip';
  return 'application/octet-stream';
}

/**
 * Full transcription of audio/video with Gemini (inline, ≤ 15 MB). Returns an
 * extractText-shaped result. Without a key or for larger media: failed + reason.
 */
export async function transcribeMedia({ buffer, filename, mime }) {
  if (buffer.length > 15 * 1024 * 1024) {
    return { status: 'failed', text: '', note: 'رسانهٔ بزرگ‌تر از ۱۵MB رونویسی نمی‌شود — ناظر باید خودِ فایل را ببیند/بشنود' };
  }
  try {
    const { analyzeWithGemini } = await import('../geminiService.js');
    const isVideo = /^video\//.test(mime);
    const prompt = isVideo
      ? 'این ویدیو را کامل رونویسی کن: همهٔ گفتارها با برچسبِ زمان، و شرحِ هر صحنه و هر نوشتهٔ روی تصویر. خلاصه نکن.'
      : 'این فایلِ صوتی را کامل و کلمه‌به‌کلمه با برچسبِ زمان رونویسی کن. خلاصه نکن.';
    const text = await analyzeWithGemini(
      [{ text: `${prompt} (فایل: ${filename})` }, { inline_data: { mime_type: mime, data: buffer.toString('base64') } }],
      'You are an exact transcriber. Never summarise.',
    );
    return finish(text);
  } catch (e) {
    return { status: 'failed', text: '', note: `رونویسی شکست خورد: ${String(e?.message || e).replace(/AIza[0-9A-Za-z_-]{10,}/g, '[REDACTED]').replace(/([?&]key=)[^&\s"']+/g, '$1[REDACTED]').slice(0, 300)}` };
  }
}
