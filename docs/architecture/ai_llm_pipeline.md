# معماری پایپ‌لاین AI/LLM و ارکستراسیون

این سند، معماری و ارکستراسیونِ پایپ‌لاین `ai_llm` را به‌صورت سطح‌بالا توصیف
می‌کند و مکملِ سند طراحی (`docs/design/ai_llm_pipeline.md`) است.

## inconsistency identified

پیش از این تسک، یک ناسازگاری منطقی میان «انتظارِ یک پایپ‌لاینِ ساختاریافته و
schema-validated» و «پیاده‌سازیِ واقعیِ مبتنی بر متنِ آزادِ Gemini» وجود داشت.
هیچ تعریف واحدی از ارکستراسیون، مدل‌ها، و قراردادِ ورودی/خروجی نبود.

## طرف ناسازگاری و فرض‌هایشان — assumptions documented

دو **طرف ناسازگاری** و **فرض‌هایشان** به‌طور کامل ثبت می‌شوند (assumptions
documented):

- **طرف ۱ (انتظار/spec):** فرض می‌کرد یک orchestrator مرکزی، خروجیِ typed را
  از مدل می‌گیرد، با یک parser رسمی deserialize می‌کند، با schema validate
  می‌کند و گاردهای hallucination را به‌صورت مرحلهٔ مجزا اجرا می‌کند.
- **طرف ۲ (پیاده‌سازی):** ارکستراسیون در `analysisService.analyzeUploads`
  پراکنده است؛ هر نوع فایل (PDF/audio/video/image/text) مسیر خودش را دارد،
  خروجی متنِ Markdown است، validation ساختاری است و گاردها prompt-level‌اند.

طرفِ ۲ (پیاده‌سازی) به‌عنوان **ground truth** پذیرفته شد و طرفِ ۱ با آن
هماهنگ گردید — جزئیات و دلیل در سند طراحی آمده است.

## دیاگرام جریان (ارکستراسیون)

```
ورودی (files[] + textContent + userInstructions)
        │
        ▼
analyzeUploads  ──►  انتخاب مسیر بر اساس mimeType
        │                 ├─ PDF   → extractPdfText → (chunk اگر >50k) → analyzeWithGemini
        │                 ├─ audio → (File API اگر >15MB) → analyzeWithGemini(File)API
        │                 ├─ video → (ffmpeg: audio + key frames اگر >50MB) → batch analyze
        │                 ├─ image → inline_data → analyzeWithGemini
        │                 └─ text  → (chunk اگر >50k) → analyzeWithGemini
        ▼
build_request_payload   (systemInstruction + parts)
        ▼
Gemini generateContent   (gemini-2.0-flash | -exp)
        ▼
is_valid_response        (candidates ناتهی؟ → وگرنه 502)
        ▼
extract_text             (candidates[0].content.parts[0].text || '')
        ▼
merge/dedup چند منبع     (اگر بیش از یک نتیجه)
        ▼
خروجی نهاییِ Markdown
```

## اجزای کلیدی

| جزء | مسئولیت | فایل |
|-----|---------|------|
| مدل | تولید متن/صوت | Gemini `gemini-2.0-flash`, `-exp`, `-tts` |
| orchestrator | انتخاب مسیر و merge | `backend/services/analysisService.js` |
| client مدل | فراخوانی REST و File API | `backend/services/geminiService.js` |
| prompts | system instruction و قواعد لهجه | `backend/services/prompts.js` |
| validation/parser | گارد ساختاری + استخراج متن | `backend/controllers/geminiController.js` |
| قراردادِ ground-truth | منبعِ واحدِ حقیقت (پایتون) | `backend/app/ai_llm/pipeline.py` |

## نقاطِ تماس با سایر لایه‌ها (cross-tier)

- **frontend:** خروجیِ Markdown را مستقیماً render می‌کند؛ شکلِ پاسخِ
  `/api/gemini/chat` یا `{ text }` است یا (در حالت `includeAudio`) شیءِ
  sanitize‌شدهٔ `{ candidates: [...] }`.
- **infra/env:** نیازمند `GEMINI_API_KEY` (در `.env.example` موجود است).
- **tests:** قرارداد در `tests/backend/ai_llm/` و `tests/integration/` پین شده.
