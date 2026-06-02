/**
 * Purpose: The AI seam for the Telegram practice flow ("تمرین با استاد هوش
 * مصنوعی"). It defines the small interface the practice manager depends on —
 * chat(), transcribe() (speech-to-text) and synthesize() (text-to-speech) — and
 * a default implementation backed by the existing Gemini integration.
 *
 * Why a separate seam: services/geminiService.js imports config/env.js at module
 * load, which validates env vars and exits the process when GEMINI_API_KEY is
 * missing. To keep the practice manager and its unit tests free of that hard
 * dependency, the Gemini modules are *lazy-imported* only inside the default
 * provider's methods; tests inject a fake provider and never touch Gemini.
 *
 * Upstream (inputs): Gemini REST API (generateContent + TTS model).
 * Downstream (outputs): consumed by services/telegram/practice.js.
 */

// The Lebanese-Arabic teacher persona shared by every practice reply.
const TEACHER_SYSTEM_PROMPT =
  'You are a friendly Lebanese Arabic dialect teacher. Keep replies short, ' +
  'encouraging and practical. When the learner makes a mistake, gently correct ' +
  'it and give the natural Lebanese phrasing. Reply in the language the learner ' +
  'used, and include Lebanese expressions with a short transliteration.';

// Default, network-backed provider. Each method lazy-imports the Gemini modules
// so importing this file never triggers env validation.
export function createGeminiProvider() {
  return {
    // Turn a session's message history into a single reply string.
    async chat(messages, { topic } = {}) {
      const { analyzeWithGemini } = await import('../geminiService.js');
      const history = messages
        .map((m) => `${m.role === 'assistant' ? 'Teacher' : 'Learner'}: ${m.text}`)
        .join('\n');
      const topicLine = topic ? `Practice topic: ${topic}\n` : '';
      const parts = [{ text: `${topicLine}Conversation so far:\n${history}\n\nTeacher:` }];
      return analyzeWithGemini(parts, TEACHER_SYSTEM_PROMPT);
    },

    // Speech-to-text: send the (ogg/opus) voice bytes to Gemini for transcription.
    async transcribe(buffer, mimeType = 'audio/ogg') {
      const { analyzeWithGemini } = await import('../geminiService.js');
      const parts = [
        { text: 'Transcribe this voice message verbatim. Return only the transcription text.' },
        { inline_data: { mime_type: mimeType, data: buffer.toString('base64') } },
      ];
      return analyzeWithGemini(parts, 'You are an accurate speech-to-text transcriber.');
    },

    // Text-to-speech via the Gemini TTS model. Returns { audio: Buffer, mimeType }
    // or null when synthesis is unavailable (callers then fall back to text-only).
    async synthesize(text, voice = 'Kore') {
      const { GEMINI_API_KEY } = await import('../../config/env.js');
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`;
      const payload = {
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
        },
      };
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return null;
      const result = await res.json();
      const part = result?.candidates?.[0]?.content?.parts?.[0];
      const data = part?.inlineData?.data;
      const mimeType = part?.inlineData?.mimeType;
      if (data && mimeType?.startsWith('audio/')) {
        return { audio: Buffer.from(data, 'base64'), mimeType };
      }
      return null;
    },
  };
}

export { TEACHER_SYSTEM_PROMPT };
export default createGeminiProvider;
