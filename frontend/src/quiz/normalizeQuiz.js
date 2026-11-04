// Purpose: make an AI-generated quiz safe to render. Gemini sometimes returns
// numbers, arrays or objects where the UI expects strings (correctAnswer: 3,
// options: [{text}], pairs with missing fields); rendering an object or calling
// .trim() on a number threw and blanked the whole page — the «white screen on
// the second quiz». Every field is coerced to a string here, invalid items are
// dropped. Upstream: QuizCenter (components/App.jsx). Downstream: none.

function str(v) {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return v.map(str).filter(Boolean).join(' ');
  if (typeof v === 'object') return str(v.text ?? v.value ?? v.answer ?? v.label ?? '');
  return '';
}

const TYPE_ALIASES = { fillinblank: 'fill_in_blank', translatetopersian: 'translate_to_persian', translatetoarabic: 'translate_to_arabic', wordorder: 'word_order', multiplechoice: 'mcq' };

export function normalizeType(t) {
  const k = str(t).toLowerCase().replace(/[^a-z]/g, '');
  return TYPE_ALIASES[k] || (k === 'mcq' || k === 'matching' ? k : str(t).toLowerCase());
}

export function normalizeQuiz(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const q of raw) {
    if (!q || typeof q !== 'object') continue;
    const type = normalizeType(q.type);
    const item = { type, question: str(q.question), correctAnswer: str(q.correctAnswer), ...(q.explanation ? { explanation: str(q.explanation).slice(0, 400) } : {}) };
    if (type === 'mcq') {
      item.options = (Array.isArray(q.options) ? q.options : []).map(str).filter(Boolean);
      // A numeric answer may be an index into the options.
      if (/^\d+$/.test(item.correctAnswer) && !item.options.includes(item.correctAnswer)) {
        item.correctAnswer = item.options[Number(item.correctAnswer)] || item.correctAnswer;
      }
      if (item.options.length < 2) continue;
    }
    if (type === 'word_order') {
      item.words = (Array.isArray(q.words) ? q.words : str(q.words).split(/\s+/)).map(str).filter(Boolean);
      if (item.words.length < 2 || !item.correctAnswer) continue;
      out.push(item);
      continue;
    }
    if (type === 'matching') {
      item.pairs = (Array.isArray(q.pairs) ? q.pairs : [])
        .map((p) => ({ arabic: str(p?.arabic), persian: str(p?.persian) }))
        .filter((p) => p.arabic && p.persian);
      if (item.pairs.length < 3) continue;
      out.push(item);
      continue;
    }
    if (!item.question || !item.correctAnswer) continue;
    out.push(item);
  }
  return out;
}

/** Model text ⇒ valid questions, or [] (bad JSON, empty, nothing usable). Tolerates code fences / prose around the array. */
export function parseQuizResponse(text) {
  const s = String(text || '');
  let raw = null;
  try { raw = JSON.parse(s); } catch {
    const m = s.match(/\[[\s\S]*\]/);
    if (m) { try { raw = JSON.parse(m[0]); } catch { raw = null; } }
  }
  if (raw && !Array.isArray(raw) && Array.isArray(raw.questions)) raw = raw.questions;
  return normalizeQuiz(Array.isArray(raw) ? raw : []);
}
