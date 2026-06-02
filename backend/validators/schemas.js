import { z } from 'zod';

// Known Gemini prebuilt TTS voice names. Anything outside this set is rejected.
export const VALID_VOICES = [
  'Aoede',
  'Charon',
  'Fenrir',
  'Kore',
  'Leda',
  'Puck',
  'Zephyr',
  'Orus',
  'Autonoe',
  'Enceladus',
  'Iapetus',
  'Umbriel',
  'Algieba',
  'Despina',
  'Erinome',
  'Algenib',
  'Rasalgethi',
  'Laomedeia',
  'Achernar',
  'Alnilam',
  'Schedar',
  'Gacrux',
  'Pulcherrima',
  'Achird',
  'Zubenelgenubi',
  'Vindemiatrix',
  'Sadachbia',
  'Sadaltager',
  'Sulafat',
];

// POST /api/gemini/chat — must include a non-empty contents array. Other Gemini
// payload fields (generationConfig, systemInstruction, includeAudio, ...) pass
// through untouched.
export const chatSchema = z
  .object({
    contents: z.array(z.any()).min(1, 'فیلد contents الزامی است'),
    includeAudio: z.boolean().optional(),
  })
  .passthrough();

// POST /api/gemini/tts — needs a prompt; voice (when provided) must be valid.
export const ttsSchema = z.object({
  prompt: z.string().min(1, 'فیلد prompt الزامی است'),
  voice: z.enum(VALID_VOICES).optional(),
});

// POST /api/analyze-files — multipart form fields. Files are validated by multer
// (count/size/type); this only guards the text fields and must not interfere.
export const analyzeFilesSchema = z
  .object({
    textContent: z.string().optional(),
    userInstructions: z.string().optional(),
  })
  .passthrough();

export default { chatSchema, ttsSchema, analyzeFilesSchema, VALID_VOICES };
