/**
 * Purpose: «آپلودِ هوشمند» — extract a lesson file's text EXACTLY, verify it,
 * and list possible diacritic/meaning problems SEPARATELY (never editing the text).
 *
 *  1. exact   — text/docx/xlsx/pptx/ODF/EPUB/ZIP and PDFs with a text layer go
 *               through the deterministic extractor (no AI): copied as is.
 *  2. ai-verified — images, audio, video and scanned PDFs: two INDEPENDENT
 *               verbatim transcriptions (different prompt + temperature), compared
 *               line by line; lines pass 2 does not confirm are SUSPECT, with an
 *               agreement ratio. Pass 1 is the text; nothing is «fixed».
 *  3. review  — optional: a third pass lists possible اعراب/معنا/املا issues as
 *               { quote, kind, issue, suggestion }; an item whose quote is not
 *               literally in the text is flagged as unverified (anti-hallucination).
 *
 * The AI is injected (tests use a fake). Upstream: inspection/extract.js,
 * geminiService.js. Downstream: routes/lessonFiles.js.
 */
import { extractText } from '../inspection/extract.js';
import { compareTranscripts, markSuspect } from './verify.js';

export const INLINE_MAX = 15 * 1024 * 1024;
const REVIEW_CHUNK = 20000;
const REVIEW_MAX_CHUNKS = 15;

const PROMPT_A = 'متنِ این فایل را کلمه‌به‌کلمه و کامل رونویسی کن. هیچ خلاصه، ترجمه، اصلاح یا توضیحی نده. اعراب، املا و ترتیبِ سطرها را همان‌طور که هست نگه دار. جای ناخوانا یا نامفهوم را دقیقاً با [ناخوانا] مشخص کن. برای صوت/ویدیو هر جمله را با برچسبِ زمان [mm:ss] در سطرِ جدا بنویس و نوشته‌های روی تصویر را هم جدا بیاور.';
const PROMPT_B = 'Transcribe this file verbatim, line by line, exactly as written or spoken — no summary, no translation, no corrections, keep all diacritics and spelling. Mark anything unreadable or unclear as [ناخوانا]. For audio/video put each sentence on its own line with a [mm:ss] timestamp; include on-screen text.';

function isMedia(mime, name) {
  return /^(image|audio|video)\//.test(mime || '') || /\.(png|jpe?g|webp|gif|heic|tiff?|mp3|wav|m4a|ogg|opus|flac|aac|mp4|mov|mkv|webm|avi)$/i.test(name || '');
}

/** Default Gemini-backed AI (lazy import: importing this file never needs a key). */
export function geminiAi() {
  return {
    async transcribe(buffer, mime, filename, variant) {
      const g = await import('../geminiService.js');
      const prompt = variant === 'b' ? PROMPT_B : PROMPT_A;
      // Verbatim transcription: no «thinking» (it spends the output budget) and
      // the largest output budget, so a 30–60 minute class is not cut short.
      let finish = null;
      const options = {
        generationConfig: { temperature: variant === 'b' ? 0.7 : 0, maxOutputTokens: 65536, thinkingConfig: { thinkingBudget: 0 } },
        onFinish: (r) => { finish = r; },
      };
      const sys = 'You are an exact transcriber. Never summarise, never correct.';
      let text;
      if (buffer.length <= INLINE_MAX) {
        text = await g.analyzeWithGemini([{ text: `${prompt}\n(فایل: ${filename})` }, { inline_data: { mime_type: mime, data: buffer.toString('base64') } }], sys, options);
      } else {
        const uploaded = await g.uploadToGeminiFileAPI(buffer, mime, filename, buffer.length);
        try {
          text = await g.analyzeWithGeminiFileAPIWithModel(uploaded, `${prompt}\n(فایل: ${filename})`, sys, 'gemini-2.5-flash', options);
        } finally {
          await g.deleteGeminiFile(uploaded);
        }
      }
      return { text, finish };
    },
    async review(text) {
      const g = await import('../geminiService.js');
      const schema = { type: 'ARRAY', items: { type: 'OBJECT', properties: { quote: { type: 'STRING' }, kind: { type: 'STRING' }, issue: { type: 'STRING' }, suggestion: { type: 'STRING' } }, required: ['quote', 'kind', 'issue'] } };
      const out = await g.analyzeWithGemini(
        [{ text: `متنِ زیر جزوهٔ درسِ لهجهٔ لبنانی است. آن را **بازنویسی نکن**. فقط مشکلاتِ احتمالیِ مشخص را فهرست کن: اعرابِ غلط یا ناقص (kind: «اعراب»)، معنای فارسیِ نادرست (kind: «معنا»)، غلطِ املایی (kind: «املا»). «quote» باید دقیقاً همان تکه از متن باشد. اگر مشکلی نیست، آرایهٔ خالی.\n\n${text}` }],
        'You are a careful Lebanese Arabic and Persian proofreader. Report, never rewrite.',
        { generationConfig: { temperature: 0, responseMimeType: 'application/json', responseSchema: schema } },
      );
      try { return JSON.parse(out); } catch { return []; }
    },
  };
}

function chunks(text, size) {
  const out = [];
  for (let i = 0; i < text.length && out.length < REVIEW_MAX_CHUNKS; i += size) out.push(text.slice(i, i + size));
  return out;
}

/** Extract one file. Never throws: failures are statuses with reasons. */
export async function extractLessonFile({ buffer, filename = '', mime = '' }, { ai = geminiAi(), review = true } = {}) {
  const result = { filename, mime, size: buffer.length, method: 'none', status: 'unsupported', text: '', markedText: '', agreement: null, suspectCount: 0, suspectLines: [], corrections: [], notes: [] };
  const det = await extractText({ buffer, filename, mime });
  const isPdf = mime === 'application/pdf' || /\.pdf$/i.test(filename);
  const scanned = isPdf && det.status === 'ok' && det.text.replace(/\s/g, '').length < 40 * Math.max(1, det.pageCount || 1);
  if (det.status === 'ok' && !scanned) {
    Object.assign(result, { method: 'exact', status: 'ok', text: det.text, markedText: det.text, agreement: 1 });
    if (det.truncated) result.notes.push('متن از سقفِ ۲ میلیون نویسه بلندتر بود و بریده شد');
  } else if (det.status === 'empty' && !isMedia(mime, filename) && !isPdf) {
    Object.assign(result, { method: 'exact', status: 'empty', notes: ['فایل متنی نداشت'] });
  } else if (isMedia(mime, filename) || isPdf) {
    if (scanned) result.notes.push('PDF ِ اسکن‌شده (لایهٔ متن ندارد یا ناچیز است) — با دو رونویسیِ مستقل خوانده شد');
    try {
      let [a, b] = await Promise.all([
        ai.transcribe(buffer, mime || 'application/pdf', filename, 'a'),
        ai.transcribe(buffer, mime || 'application/pdf', filename, 'b'),
      ]);
      // transcribe() may return a string (tests) or { text, finish }.
      const finishA = typeof a === 'object' && a ? a.finish : null;
      const finishB = typeof b === 'object' && b ? b.finish : null;
      if (a && typeof a === 'object') a = a.text;
      if (b && typeof b === 'object') b = b.text;
      if (finishA === 'MAX_TOKENS' || finishB === 'MAX_TOKENS') result.notes.push('⚠️ رونویسی به سقفِ خروجیِ Gemini رسید و انتهایش ممکن است بریده باشد؛ فایل را به بخش‌های کوتاه‌تر (حدودِ ۲۰ دقیقه) تقسیم کنید');
      if (finishA && !['STOP', 'MAX_TOKENS'].includes(finishA)) result.notes.push(`⚠️ Gemini رونویسی را با وضعیتِ «${finishA}» تمام کرد`);
      const cmp = compareTranscripts(a, b);
      Object.assign(result, {
        method: 'ai-verified',
        status: String(a || '').trim() ? 'ok' : 'empty',
        text: String(a || ''),
        markedText: markSuspect(cmp),
        agreement: cmp.agreement,
        suspectCount: cmp.suspectCount,
        suspectLines: cmp.lines.filter((l) => !l.blank && !l.confirmed).map((l) => l.text).slice(0, 500),
      });
      if ((a || '').includes('[ناخوانا]')) result.notes.push('بخش‌هایی ناخوانا علامت خورده‌اند');
    } catch (e) {
      Object.assign(result, { status: 'failed', notes: [`رونویسی ناموفق: ${String(e?.message || e).replace(/AIza[0-9A-Za-z_-]{10,}/g, '[REDACTED]').slice(0, 300)}`] });
    }
  } else {
    result.notes.push(det.note || 'برای این نوع فایل استخراجِ متن نداریم؛ اصلِ فایل نگه داشته شد');
  }
  if (review && result.status === 'ok' && result.text.trim()) {
    for (const part of chunks(result.text, REVIEW_CHUNK)) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const items = await ai.review(part);
        for (const it of Array.isArray(items) ? items : []) {
          if (!it || !it.quote || !it.issue) continue;
          result.corrections.push({
            quote: String(it.quote).slice(0, 300),
            kind: String(it.kind || '').slice(0, 20),
            issue: String(it.issue).slice(0, 600),
            suggestion: String(it.suggestion || '').slice(0, 300),
            verifiedQuote: result.text.includes(String(it.quote)),
          });
        }
      } catch (e) {
        result.notes.push(`بازبینیِ اعراب/معنا برای بخشی ناموفق بود: ${String(e?.message || e).slice(0, 120)}`);
      }
    }
    if (result.text.length > REVIEW_CHUNK * REVIEW_MAX_CHUNKS) result.notes.push('بازبینیِ اعراب/معنا فقط برای ۳۰۰هزار نویسهٔ اول انجام شد');
  }
  return result;
}
