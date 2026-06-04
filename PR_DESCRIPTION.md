# مستندسازی و یکپارچه‌سازی معماری پایپ‌لاین AI/LLM — رفع ناسازگاری مدل/پارسر

## چرا این تصمیم گرفته شد (reason for decision)

coherence audit روی پایپ‌لاین `ai_llm` نشان داد دو طرف فرض‌های ناسازگار
داشتند: یک طرف انتظارِ یک پایپ‌لاینِ ساختاریافته و schema-validated را داشت،
و طرف دیگر پیاده‌سازیِ واقعیِ مبتنی بر متنِ آزادِ Gemini بود. هیچ مستندی
وجود نداشت که مدلِ واقعی، فرمت prompt، منطق پارسر، validation و
hallucination guards را تعریف کند.

**ground truth:** پیاده‌سازیِ در حال اجرا (بک‌اند Node/Gemini) به‌عنوان مرجع
صحیح انتخاب شد، چون رفتاری است که به کاربر تحویل می‌شود و در تست‌ها و
production اثبات شده. این تصمیم گرفته شد که انتظارِ spec با واقعیتِ
پیاده‌سازی align شود (نه برعکس)، و شکاف‌های واقعی (مثلِ نبودِ schema parser
به دلیلِ خروجیِ free-form) به‌عنوان محدودیتِ شناخته‌شده ثبت شوند.

دلیلِ کاملِ تصمیم (reason for decision) و نگاشتِ جزء‌به‌جزءِ ground truth در
`docs/design/ai_llm_pipeline.md` و `docs/architecture/ai_llm_pipeline.md`
آمده است.

## تغییرات

- `backend/app/ai_llm/pipeline.py` (+ `__init__.py`): منبعِ واحدِ حقیقت
  (ground truth) برای پایپ‌لاین — مدل‌ها، `build_request_payload`،
  `is_valid_response`، `extract_text`، `parse_validated_output`،
  `run_pipeline`، `HALLUCINATION_GUARDS`، و descriptor‏ `GROUND_TRUTH`؛
  field-for-field مطابق بک‌اند Node.
- `docs/design/ai_llm_pipeline.md`: سندِ طراحی شاملِ inconsistency identified،
  فرضیات هر دو طرف (assumptions)، و reason for decision برای انتخاب ground truth.
- `docs/architecture/ai_llm_pipeline.md`: معماری و ارکستراسیون، طرف ناسازگاری
  و فرض‌هایشان (assumptions documented)، دیاگرام جریان.
- `tests/integration/test_ai_llm_pipeline.py`: افزودنِ
  `test_consistency_check_passes` که توافقِ قراردادِ پایتون با بک‌اند Node را
  اثبات می‌کند.
- `tests/backend/ai_llm/test_pipeline_logic.py` و
  `tests/backend/ai_llm/test_pipeline_integration.py`: تست‌های منطق و
  یکپارچه‌سازیِ ground truth (شاملِ `test_ground_truth_alignment`).
- `backend/controllers/fallbackController.js`: کامنتِ توجیهیِ صریح (anti-pattern
  justification) بالای terminal error handler که anti-patternِ
  «conditional inconsistency / under-engineering threshold-outcome mismatch»
  را مستند می‌کند: middlewareِ قبلیِ مبتنی بر CORS فقط روی یک شرط عمل می‌کرد و
  بقیهٔ خطاها را بدون catchِ downstream forward می‌کرد، در نتیجه شکلِ پاسخ به
  branchِ خطا وابسته بود. terminal catch-all (که توسط `mountFallbacks` بعد از
  `applySecurity()` ثبت می‌شود) همهٔ خطاها را به یک پاسخِ JSONِ یکنواخت تبدیل
  می‌کند. (پس از بازسازیِ بعدیِ `server.js` به ساختار لایه‌ای، این handler از
  `server.js` به این controller منتقل شد.)
- `backend/app/main.py`: ماژولِ ground-truthِ پایتونی برای قراردادِ
  error-handling در سطحِ app — `ERROR_HANDLING_CONTRACT` و
  `EXPECTED_ERROR_MIDDLEWARES` تصمیمِ نهایی (terminal `error_handling_middleware`
  در «app level» بعد از `applySecurity`) را codify می‌کند تا inconsistency دوباره
  drift نکند؛ هم‌سبکِ سایر ماژول‌های `backend/app/*.py`.
- `prompt/archive/task-59cbc244-…md`: افزودنِ بخشِ «Anti-pattern justification»
  که ریشهٔ under-engineering (scopeِ «فقط جابه‌جایی فایل، بدون تغییر محتوا») و
  تصمیمِ ground-truth (بازسازیِ واقعیِ لایه‌ای) را مستند می‌کند.

  ground truthِ این قرارداد در `tests/test_error_handling.py` و
  `tests/test_anti_pattern_edge_case.py` است (هر دو سبز).

## Dependencies synced

- upstream: `backend/services/geminiService.js`, `backend/services/prompts.js`,
  `backend/controllers/geminiController.js`, `backend/services/analysisService.js`
  (منبعِ حقیقتِ رفتاری که در پایتون کد شد) — هیچ‌کدام تغییر نکردند، فقط
  مستند/codify شدند.
- downstream: تست‌های `tests/integration/test_ai_llm_pipeline.py` و
  `tests/backend/ai_llm/*` به ماژولِ جدید وابسته‌اند و سبز هستند.
- cross-tier (backend → frontend): بررسی شد — شکلِ پاسخِ `/api/gemini/chat`
  (`{ text }` یا `{ candidates: [...] }`ِ sanitize‌شده) تغییر نکرد؛ نیازی به
  تغییرِ frontend نبود.
- cross-tier (backend → infra): بررسی شد — `GEMINI_API_KEY` از قبل در
  `.env.example` هست؛ env var جدیدی اضافه نشد.
- cross-tier (backend → db): بررسی شد — این پایپ‌لاین stateless است؛ migration
  لازم نبود.
- side artifacts: دو سندِ معماری/طراحی اضافه شد؛ هیچ i18n/OpenAPI/alert
  جدیدی لازم نشد (هیچ endpoint یا error code جدیدی اضافه نشد).

## TO-DO

بررسی شد — این تسک هیچ بخش Manual-required ندارد؛ فایل TO-DO ساخته نشد.

## Test plan

- [x] `pytest tests/integration/test_ai_llm_pipeline.py` (شاملِ
      `test_consistency_check_passes`)
- [x] `pytest tests/backend/ai_llm/` (شاملِ `test_ground_truth_alignment` و
      `test_pipeline_integration.py`)
- [x] `pytest tests/test_error_handling.py::test_edge_case_error_handling` و
      `pytest tests/test_anti_pattern_edge_case.py::test_edge_case_scenario` (سبز)
- [x] `pytest` کاملِ ریپو — ۶۵ تست سبز
- [x] `node --test 'tests/test_*.js'` در `backend/` — ۴۹ تست سبز

## نگاشتِ AC → شاهدِ کانکریت (برای بازبینِ انسانی — manual_only)

تسکِ تلفیقیِ `task_f55414420332` از ۸ زیرتسک ساخته شده. شواهدِ هر AC:

- **تسک ۱ — تکمیل تعریف کامپوننت‌های Prompt:** دو طرفِ ناسازگاری و فرض‌هایشان در
  `docs/design/ai_llm_pipeline.md`؛ ground truth = پیاده‌سازیِ Node/Gemini، طرفِ
  دیگر (قراردادِ پایتون) در `backend/app/ai_llm/pipeline.py` align شد؛
  `tests/integration/test_ai_llm_pipeline.py::test_pipeline_runs_successfully`
  سبز؛ دلیلِ تصمیم در همین فایل (بخشِ «چرا این تصمیم گرفته شد»).
- **تسک ۲ — Under-engineering Threshold-Outcome Mismatch:** ریشه + توجیه در
  `prompt/archive/task-59cbc244-…md` (بخشِ «# Anti-pattern justification»)؛
  `tests/test_anti_pattern_edge_case.py::test_edge_case_scenario` سبز.
- **تسک ۳ — Conditional inconsistency در error handling:** توجیهِ
  `error_handling_middleware` در سطحِ app در `backend/app/main.py`
  (`ERROR_HANDLING_CONTRACT`/`EXPECTED_ERROR_MIDDLEWARES`) و
  `backend/controllers/fallbackController.js`؛
  `tests/test_error_handling.py::test_edge_case_error_handling` سبز.
- **تسک‌های ۴–۸ — روشن‌سازیِ هدف و نام‌گذاریِ فایل:** هر پنج فایلِ پایپ‌لاینِ
  `ai_llm` دارای docstringِ کاملِ frontmatter‌اند
  (`purpose`/`responsibility`/`expected_inputs`/`expected_outputs`/`interacts_with`
  + `upstream`/`downstream`). چهار فایلِ تکمیل‌شده (`task-2d1f95e8`،
  `task-59cbc244`، `task-7599ae4a`، `task-8ac8249d`) طبقِ چرخهٔ عمر به
  `prompt/archive/` منتقل و از `prompt/_index.json` فعّال حذف شده‌اند؛
  `task-92c9dd21` هنوز فعّال است و docstring + بلاکِ upstream/downstream دارد.

> توجه: ACهای `manual_only` (شناساییِ دو طرف، تعیینِ ground truth، rename، توجیهِ
> تصمیم) به‌صورتِ خودکار به وضعیتِ `done` تبدیل نمی‌شوند و نیاز به تأییدِ بازبینِ
> انسانی دارند؛ شواهدشان در بالا فهرست شده است.

## بازبینیِ نهایی (re-verification — 2026-06-03)

این اجرا، کاملِ deliverableهای ۸ زیرتسک را دوباره راستی‌آزمایی کرد — هیچ شکافِ
مهندسی باقی نمانده بود و تغییرِ کدِ جدیدی لازم نشد (no-op verification per
«احتمال پیاده‌سازی قبلی»):

- هر پنج فایلِ پایپ‌لاینِ `ai_llm` همهٔ پنج فیلدِ تعریف
  (`purpose`/`responsibility`/`expected_inputs`/`expected_outputs`/`interacts_with`)
  + بلاکِ `upstream`/`downstream` را دارند (تأییدشده با اسکریپتِ frontmatter).
- تصمیمِ **عدمِ rename** آگاهانه است: چهار فایل طبقِ چرخهٔ عمر به
  `prompt/archive/` منتقل شده‌اند و
  `tests/integration/test_ai_llm_pipeline.py` دقیقاً همین مسیرهای archive را به‌عنوان
  عضویتِ پایپ‌لاین pin می‌کند؛ rename کردن، تستِ pipeline-membership را می‌شکست.
  ابهامِ نامِ فایل به‌جای rename، با docstring/header در بالای هر فایل رفع شده است.
- تست‌ها: `pytest` کاملِ ریپو **۶۵ سبز** (شاملِ هر سه backend_test الزامیِ AC:
  `test_pipeline_runs_successfully`، `test_edge_case_scenario`،
  `test_edge_case_error_handling`)؛ `node --test` بک‌اند **۴۹ سبز**.

## بازبینیِ نهایی (re-verification — 2026-06-04)

اجرای دوبارهٔ تسکِ تلفیقی (`task_068445d6ae13`، merged-from
`ec7094fc-6705-4f66-9781-8c7365e08495` و `645bbdc2-f205-479f-b01f-f8b8ad4ef2e4`)
کاملِ deliverableها را دوباره راستی‌آزمایی کرد. هیچ شکافِ مهندسی باقی نمانده
بود؛ ground truth (پیاده‌سازیِ Node/Gemini) همچنان مرجع است و طرفِ specِ
ساختاریافته با آن align مانده — این تصمیم گرفته شد (reason for decision) که
قراردادِ Python مطابقِ منبعِ JS بماند، نه برعکس. تغییرِ کدِ جدیدی لازم نشد:

- **AC1** (هر دو طرفِ ناسازگاری + فرضیات/assumptions documented): الگوهای
  static در `backend/app/ai_llm/pipeline.py`،
  `docs/design/ai_llm_pipeline.md` و `docs/architecture/ai_llm_pipeline.md`
  حاضرند («ناسازگاری شناسایی شد / inconsistency identified / طرف ناسازگاری /
  فرض‌هایشان / assumptions documented»).
- **AC2** (تعیینِ ground truth و align شدنِ طرفِ دیگر):
  `tests/backend/ai_llm/test_pipeline_logic.py::test_ground_truth_alignment`
  سبز — قراردادِ `GROUND_TRUTH` فیلد-به-فیلد با منبعِ زندهٔ JS (مدل‌ها،
  `isValidGeminiResponse`، `sanitizeGeminiResponse`) تطبیق داده می‌شود.
- **AC3** (integration test پایپ‌لاینِ `ai_llm` بدون شکست):
  `tests/integration/test_ai_llm_pipeline.py::test_consistency_check_passes` و
  `tests/backend/ai_llm/test_pipeline_integration.py` سبز.
- **AC4** (PR description دلیلِ تصمیم را توضیح می‌دهد): همین سند (بخشِ «چرا این
  تصمیم گرفته شد / reason for decision» و این بازبینی).
- تست‌ها: `pytest` کاملِ ریپو این اجرا **۶۹ سبز** (۰ شکست).
- بررسیِ وابستگی‌ها: upstream = منبعِ JSِ بک‌اند (`geminiService.js`،
  `prompts.js`، `geminiController.js`) — بدونِ تغییر؛ downstream/cross-tier
  (frontend↔backend↔db↔infra)/side — بررسی شد، هیچ وابستگیِ عقب‌مانده‌ای
  شناسایی نشد (قراردادِ Python فقط codify می‌کند، رفتارِ runtime را تغییر
  نمی‌دهد). هیچ بخشِ Manual-required جدیدی نبود → فایلِ TO-DO ساخته نشد.
