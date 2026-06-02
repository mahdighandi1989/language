# طراحی پایپ‌لاین AI/LLM — رفع ناسازگاری مدل و پارسر خروجی

این سند نتیجهٔ یک **coherence audit** روی پایپ‌لاین `ai_llm` است. ممیزی سه
پرسش را مطرح کرد:

1. آیا فرمت prompt با مدل AI و output parser سازگار است؟
2. آیا روی پاسخ AI، validation وجود دارد؟
3. آیا hallucination guards فعال‌اند؟

## inconsistency identified — ناسازگاری شناسایی شد

ممیزی دو **طرف** را یافت که فرض‌های ناسازگار دربارهٔ کارکرد پایپ‌لاین داشتند.
هیچ‌جا مستند نشده بود مدل واقعی چیست، فرمت ورودی/خروجی چیست، پارسر چه می‌کند،
و گاردها کجا هستند — به همین دلیل انتظارِ یک طرف قابل راستی‌آزمایی نبود.

### فرضیات / assumptions

**طرف A — انتظارِ ممیزی (spec):**
- فرض: مدل یک شیء *typed* برمی‌گرداند.
- فرض: یک *output parser* آن را deserialize می‌کند.
- فرض: یک لایهٔ *validation* مبتنی بر schema داده‌های نامعتبر را رد می‌کند.
- فرض: *hallucination guards* به‌صورت یک مرحلهٔ پس‌پردازش مجزا اجرا می‌شوند.

**طرف B — پیاده‌سازی واقعی (runtime):**
- واقعیت: مدل، Google **Gemini** است (`gemini-2.0-flash`، نسخهٔ extended
  `gemini-2.0-flash-exp`، و برای TTS مدل `gemini-2.5-flash-preview-tts`).
- واقعیت: prompt = یک `systemInstruction` + `parts` کاربر (متن و/یا
  `inline_data`/`file_data`).
- واقعیت: «پارسر» همان استخراج سادهٔ
  `candidates[0].content.parts[0].text` با fallback رشتهٔ خالی است — خروجی،
  **متنِ آزادِ Markdown** است، نه شیء ساختاریافته.
- واقعیت: validation، گاردِ **ساختاری** `isValidGeminiResponse` است (آرایهٔ
  `candidates` ناتهی) به‌علاوهٔ projection با `sanitizeGeminiResponse`؛ نه
  schema validation.
- واقعیت: hallucination guards فقط در سطح prompt (قواعد تصحیح عربی لبنانی) +
  چند heuristic روی خروجی (حذف فریم خالی، merge با dedup) هستند.

## ground truth — تصمیم گرفته شد

**reason for decision (دلیل تصمیم):** طرف B (بک‌اند در حال اجرا) به‌عنوان
**ground truth** انتخاب شد، چون این رفتاری است که به کاربر تحویل داده می‌شود،
در `tests/test_gemini.py` و سایر تست‌ها تمرین می‌شود و در production اثبات شده
است. بنابراین به‌جای آنکه واقعیت را به انتظارِ ممیزی برسانیم، انتظارِ طرف A را
با واقعیتِ طرف B **align** کردیم.

این تصمیم گرفته شد که:
- مدل‌ها، فرمت prompt، پارسر، validation و گاردها در یک منبعِ واحدِ حقیقت کد
  شوند: `backend/app/ai_llm/pipeline.py` (constant ‏`GROUND_TRUTH`).
- شکاف‌های واقعی (مثلاً نبودِ schema parser چون خروجی free-form است) به‌عنوان
  «محدودیتِ شناخته‌شده» ثبت شوند، نه اینکه وانمود شود وجود دارند.

## نقشهٔ پایپ‌لاین (ground truth)

| جزء | محل واقعی (JS) | معادل پایتونیِ کدشده |
|-----|----------------|----------------------|
| ساخت prompt | `geminiService.analyzeWithGemini` | `build_request_payload` |
| فراخوانی مدل | `geminiService` / `geminiController.chat` | تزریقِ `transport` در `run_pipeline` |
| validation | `geminiController.isValidGeminiResponse` | `is_valid_response` |
| پارس خروجی | `candidates[0].content.parts[0].text` | `extract_text` |
| validate+parse نهایی | branchهای 502/500 در `chat` | `parse_validated_output` |
| sanitize | `geminiController.sanitizeGeminiResponse` | (ثبت در `GROUND_TRUTH["validation"]`) |
| گاردهای hallucination | `prompts.js` + heuristicها | `HALLUCINATION_GUARDS` |

## محدودیت‌های شناخته‌شده (شکاف‌های باز)

- خروجی structured/JSON نیست؛ بنابراین schema-validation ممکن نیست. اگر در
  آینده خروجیِ typed لازم شد، باید `responseSchema` به `generationConfig`
  اضافه شود و `extract_text` به یک parser واقعی ارتقا یابد.
- گاردهای hallucination عمدتاً prompt-level‌اند؛ یک گاردِ post-hoc (مثلاً
  بررسی واقعیت در برابر منبع) وجود ندارد.

## دستورات اعتبارسنجی

```bash
pytest tests/integration/test_ai_llm_pipeline.py
pytest tests/backend/ai_llm/
npm run test
```
