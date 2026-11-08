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
import { collapseRepeats } from './repeats.js';
import { splitMp3, splitWav } from './splitAudio.js';

/** Retry a bad transcription (loop or low agreement) with parts of about this size. */
export const RETRY_PART_BYTES = 2.5 * 1024 * 1024;
export const LOW_AGREEMENT = 0.5;

export const INLINE_MAX = 15 * 1024 * 1024;
const REVIEW_CHUNK = 20000;
const REVIEW_MAX_CHUNKS = 15;

// The speech in these classes is Lebanese Arabic + Persian (+ a little English/French).
// Saying so stops the model from writing Arabic/Persian in Latin letters or as English.
export const LANGUAGE_HINT_FA = 'زبانِ گفتار عمدتاً عربیِ لبنانی و فارسی است (گاهی انگلیسی/فرانسوی). عربی را با حروفِ عربی و فارسی را با حروفِ فارسی بنویس — هرگز با حروفِ لاتین؛ فقط جمله‌ای را که واقعاً انگلیسی گفته شده به انگلیسی بنویس. ';
export const LANGUAGE_HINT_EN = 'The speech is mostly Lebanese Arabic and Persian (sometimes English/French). Write Arabic in Arabic script and Persian in Persian script — never romanised; only sentences actually spoken in English are written in English. ';
const PROMPT_A = 'متنِ این فایل را کلمه‌به‌کلمه و کامل رونویسی کن. هیچ خلاصه، ترجمه، اصلاح یا توضیحی نده. هر کلمه یا جمله را فقط به تعدادی که واقعاً گفته شده بنویس و هرگز تکرار نکن؛ سکوت یا صدای نامفهومِ طولانی را یک بار با [ناخوانا] مشخص کن. اعراب، املا و ترتیبِ سطرها را همان‌طور که هست نگه دار. جای ناخوانا یا نامفهوم را دقیقاً با [ناخوانا] مشخص کن. برای صوت/ویدیو هر جمله را با برچسبِ زمان [mm:ss] در سطرِ جدا بنویس و نوشته‌های روی تصویر را هم جدا بیاور.';
const PROMPT_B = 'Transcribe this file verbatim, line by line, exactly as written or spoken — no summary, no translation, no corrections, keep all diacritics and spelling. Write each word only as many times as it is actually spoken — never loop or repeat; mark long silence or unclear noise once as [ناخوانا]. Mark anything unreadable or unclear as [ناخوانا]. For audio/video put each sentence on its own line with a [mm:ss] timestamp; include on-screen text.';

function isMedia(mime, name) {
  return /^(image|audio|video)\//.test(mime || '') || /\.(png|jpe?g|webp|gif|heic|tiff?|mp3|wav|m4a|ogg|opus|flac|aac|mp4|mov|mkv|webm|avi)$/i.test(name || '');
}

/** Default Gemini-backed AI (lazy import: importing this file never needs a key). */
export function geminiAi() {
  return {
    async transcribe(buffer, mime, filename, variant) {
      const g = await import('../geminiService.js');
      const prompt = variant === 'b' ? LANGUAGE_HINT_EN + PROMPT_B : LANGUAGE_HINT_FA + PROMPT_A;
      // Verbatim transcription: no «thinking» (it spends the output budget) and
      // the largest output budget, so a 30–60 minute class is not cut short.
      let finish = null;
      const options = {
        generationConfig: { temperature: variant === 'b' ? 0.2 : 0, maxOutputTokens: 65536, thinkingConfig: { thinkingBudget: 0 } },
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

const unwrap = (r) => (r && typeof r === 'object' ? { text: String(r.text || ''), finish: r.finish || null } : { text: String(r || ''), finish: null });

/** Two independent transcriptions, loops collapsed, compared. */
async function transcribePair(ai, buffer, mime, filename) {
  const [ra, rb] = await Promise.all([ai.transcribe(buffer, mime, filename, 'a'), ai.transcribe(buffer, mime, filename, 'b')]);
  const A = unwrap(ra); const B = unwrap(rb);
  const ca = collapseRepeats(A.text); const cb = collapseRepeats(B.text);
  return {
    a: ca.text, b: cb.text, cmp: compareTranscripts(ca.text, cb.text),
    loops: ca.runs.filter((r) => r.times >= 5).length,
    loopSample: ca.runs.slice(0, 2).map((r) => `«${r.unit.slice(0, 30)}» ×${r.times}`).join('، '),
    finish: [A.finish, B.finish],
  };
}

/** Parts transcribed one by one (bounded parallelism 2), texts joined in order. */
async function transcribeParts(ai, parts, mime, filename) {
  const out = new Array(parts.length);
  let next = 0;
  const worker = async () => {
    while (next < parts.length) {
      const i = next; next += 1;
      // eslint-disable-next-line no-await-in-loop
      out[i] = await transcribePair(ai, Buffer.from(parts[i]), mime, `${filename} (تکهٔ ${i + 1} از ${parts.length})`);
    }
  };
  await Promise.all([worker(), worker()]);
  const a = out.map((r) => r.a).join('\n');
  const b = out.map((r) => r.b).join('\n');
  return {
    a, b, cmp: compareTranscripts(a, b),
    loops: out.reduce((n, r) => n + r.loops, 0),
    loopSample: out.map((r) => r.loopSample).filter(Boolean).slice(0, 2).join('، '),
    finish: out.flatMap((r) => r.finish),
  };
}

function splitForRetry(buffer, mime, filename) {
  if (buffer.length < 2 * RETRY_PART_BYTES) return null;
  const ab = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.length);
  if (/mpeg|mp3/.test(mime) || /\.mp3$/i.test(filename)) return splitMp3(ab, RETRY_PART_BYTES);
  if (/wav/.test(mime) || /\.wav$/i.test(filename)) return splitWav(ab, RETRY_PART_BYTES);
  return null;
}

/**
 * In a mostly Arabic-script transcript, a Latin-letter line of 2+ words is
 * likely a wrong-language guess («Good. Marhaba Mahdi») ⇒ marked suspect too.
 */
export function flagLatinLines(cmp) {
  const real = cmp.lines.filter((l) => !l.blank);
  const arabicShare = real.length ? real.filter((l) => /[\u0600-\u06FF]/.test(l.text)).length / real.length : 0;
  if (arabicShare < 0.5) return { ...cmp, latinFlagged: 0 };
  let n = 0;
  const lines = cmp.lines.map((l) => {
    const t = String(l.text).replace(/\[[^\]]*\]/g, ' ').trim();
    if (!l.blank && l.confirmed && /[A-Za-z]/.test(t) && !/[\u0600-\u06FF]/.test(t) && t.split(/\s+/).filter(Boolean).length >= 2) { n += 1; return { ...l, confirmed: false, latin: true }; }
    return l;
  });
  return { ...cmp, lines, suspectCount: lines.filter((l) => !l.blank && !l.confirmed).length, latinFlagged: n };
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
      const mimeOut = mime || 'application/pdf';
      let best = await transcribePair(ai, buffer, mimeOut, filename);
      // Loop or very low agreement: try again with shorter parts (MP3/WAV can be
      // cut without decoding). The better of the two attempts is kept.
      const bad = (r) => r.cmp.agreement < LOW_AGREEMENT || r.loops > 0;
      if (bad(best)) {
        const parts = splitForRetry(buffer, mimeOut, filename);
        if (parts && parts.length > 1) {
          const retry = await transcribeParts(ai, parts, mimeOut, filename);
          result.notes.push(`🔁 توافقِ دو رونویسی ${Math.round(best.cmp.agreement * 100)}٪${best.loops ? ` و ${best.loops} حلقهٔ تکرار` : ''} بود؛ دوباره با ${parts.length} تکهٔ کوتاه‌تر رونویسی شد ⇒ ${Math.round(retry.cmp.agreement * 100)}٪${retry.cmp.agreement >= best.cmp.agreement ? ' (این نتیجه نگه داشته شد)' : ' (نتیجهٔ اول بهتر بود و نگه داشته شد)'}`);
          if (retry.cmp.agreement >= best.cmp.agreement) best = retry;
        } else if (best.loops) {
          result.notes.push('این قالب را نمی‌شود بی‌رمزگشایی تکه کرد؛ برای رونویسیِ بهتر mp3 بفرستید');
        }
      }
      const { a } = best;
      const cmp = flagLatinLines(best.cmp);
      if (cmp.latinFlagged) result.notes.push(`⚠️ ${cmp.latinFlagged} سطر با حروفِ لاتین در میانِ گفتارِ عربی/فارسی — احتمالاً زبان اشتباه تشخیص داده شده؛ «🔁 رونویسیِ دوباره» را امتحان کنید`);
      if (best.loops) result.notes.push(`⟲ ${best.loops} «حلقهٔ تکرارِ» ماشینی در رونویسی پیدا و حذف شد (${best.loopSample}) — جای آن در متن علامت دارد`);
      if (best.finish.includes('MAX_TOKENS')) result.notes.push('⚠️ رونویسی به سقفِ خروجیِ Gemini رسید و انتهایش ممکن است بریده باشد؛ فایل را به بخش‌های کوتاه‌تر (حدودِ ۲۰ دقیقه) تقسیم کنید');
      const odd = best.finish.find((f) => f && !['STOP', 'MAX_TOKENS'].includes(f));
      if (odd) result.notes.push(`⚠️ Gemini رونویسی را با وضعیتِ «${odd}» تمام کرد`);
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
