# دفتر کار (Work Log) — ثبتِ جزئیِ همهٔ کارها

ثبتِ پیوستهٔ هر یافته، تصمیم، تغییر، راستی‌آزمایی و بازگشت در پروژهٔ «زبان».
**جدیدترین ورودی در انتهای فایل است.** هر کس (Claude یا هر هوش مصنوعی/انسانِ دیگر) پس از **هر کار**
یک بخش به انتها اضافه می‌کند — هیچ ورودیِ قبلی پاک یا بازنویسی نمی‌شود؛ اصلاح = ورودیِ تازه با برچسبِ
`[REVERT]` یا `[CORRECTION]`.

**قالبِ هر سطر:** `- **[نوع]** شرح — دلیل/مدرک (فایل، کامیت، خروجیِ تست)`
**انواع:** `[FINDING]` یافته · `[DECISION]` تصمیم (همراهِ گزینه‌های ردشده) · `[CHANGE]` تغییرِ کد/پیکربندی ·
`[VERIFY]` راستی‌آزمایی · `[REVERT]` بازگشت · `[CORRECTION]` اصلاحِ ثبتِ قبلی · `[OWNER]` دستور/درخواستِ مالک ·
`[TODO]` کارِ باز · `[BLOCKED]` مسدود

**امضا الزامی است:** آخرین خطِ هر بخش —
`> **امضا:** \`<agent-id>\` · YYYY-MM-DD · <یک خط: چطور راستی‌آزمایی شد>`.
`scripts/docs_gate.py` اگر **جدیدترین** بخش امضا نداشته باشد، یا کد عوض شده ولی این فایل نه، ارسال را رد می‌کند.
جزئیات: `AGENTS.md` §4. هر بخش با `## تاریخ (شماره) — عنوان` شروع می‌شود.

---

## 2026-11-02 (۱) — بازرسیِ اولیه، ابزارِ ارسال و مستندسازیِ چندعاملی

- **[OWNER]** هماهنگ‌کنندهٔ مالک چهار بخش خواست: (۱) مستندسازی و ارسالِ خودکار به الگوی Detective-1؛
  (۲) «نظارت و سرکشی» به الگوی Detective-1/ALLIN1؛ (۳) فقط بررسی و گزارشِ ذخیره‌سازی و امنیت، به‌علاوهٔ رفعِ
  مسیرِ ورود و نقشِ ادمین و بازبینیِ نهایی؛ (۴) گزارشِ مرحله‌به‌مرحله با کامیت. فرمانِ ثابت: پس از هر کار خودت
  ship کن، مستقیم به main؛ PR نه؛ `prompt/` و `TO-DO/` دست نخورد؛ هیچ قابلیتی حذف نشود.
- **[FINDING]** خطِ پایه (پیش از هر تغییر): vitest ‏۶۹/۶۹، `node --test` ‏۱۴۱/۱۴۱، pytest ریشه ۶۹، pytest بک‌اند ۱۱،
  `npm run build` سبز (هشدارِ اندازهٔ بسته ۹۶۹KB).
- **[FINDING][CRITICAL]** آخرین دیپلویِ live ِ Render کامیتِ `25316ff` (2026-06-05) است؛ ۱۵۹ کامیتِ بعدی همه
  `chore(prompt): sync …` با `[skip render]` در بدنه‌اند ⇒ هیچ‌کدام دیپلوی نشدند. از آن کامیت تا `main` فقط
  `prompt/`، `TO-DO/` و حذفِ `.github/workflows/claude-auto-task.yml` عوض شده ⇒ کدِ live با کدِ فعلی یکی است
  (مدرک: `git diff --stat 25316ff origin/main -- . ':!prompt' ':!TO-DO'`، Render API `/deploys`).
- **[FINDING]** سرویسِ واقعیِ Render ‏`language` (srv-d5mhvkh4tr6s73clvkog، frankfurt، starter، autoDeploy، شاخهٔ main،
  build: `cd frontend && npm install && npm run build && cd ../backend && npm install`، start: `cd backend && npm start`)
  با `render.yaml` (`lebanese-dialect-app`، build/start ِ متفاوت، بی‌region) نمی‌خواند. Blueprint ِ متصلی برای این
  ریپو وجود ندارد (`/v1/blueprints`) ⇒ `render.yaml` فقط مستند است و داشبورد مرجع است.
- **[FINDING][SECURITY]** متغیرهای محیطیِ تنظیم‌شده روی Render (فقط نام‌ها خوانده شد، نه مقدار): `GEMINI_API_KEY`،
  `CORS_ORIGIN`/`FRONTEND_URL` (= `https://language-k4q9.onrender.com`)، `VITE_*` (هفت مورد؛ `VITE_ADMIN_EMAILS` با
  ایمیلِ مالک برابر است). **نیست:** `FIREBASE_PROJECT_ID` ⇒ `requireAuth` همیشه ۴۰۱ «پیکربندی نشده» و `optionalAuth`
  توکن را نادیده می‌گیرد ⇒ پراکسیِ Gemini، TTS، تحلیلِ فایل و `/ws/live` بدونِ هیچ احرازِ هویتی برای هر کسی در اینترنت
  باز است (هزینهٔ کلیدِ Gemini). `ENCRYPTION_KEY` هم نیست (کلید plaintext است؛ کار می‌کند). `TELEGRAM_*` نیست ⇒ ربات خاموش.
  جزئیات و رفع در مرحلهٔ ۳.
- **[FINDING]** production فقط‌خواندنی (HTTPS): `/api/health` ‏۲۰۰؛ `/api/gemini/status` بی‌توکن ۴۰۱؛
  `/api/telegram/status` ‏`enabled:false`؛ `/api/analytics` بدونِ احراز هویت KPIها را به همه نشان می‌دهد
  (`sample_size:22`). هدرهای CSP/COOP/HSTS حاضرند.
- **[FINDING]** هشدارِ «Payment failed» ِ داشبورد از Render API قابلِ خواندن نیست (API صورت‌حساب را نمی‌دهد)؛
  همهٔ سرویس‌های حساب `not_suspended` هستند.
- **[CHANGE]** `scripts/ship.sh` (بررسیِ منبعِ پنهان با .gitignore → docs gate → `npm ci` در صورتِ نبودِ
  node_modules → `node --test` → pytest بک‌اند و ریشه → vitest → build → commit → push شاخه با retry ِ ۲/۴/۸/۱۶ ثانیه
  → ادغام در main و push؛ بی force-push؛ ردِ پیامِ دارای `[skip render]`/`[skip ci]`).
- **[CHANGE]** `.claude/hooks/ensure-shipped.sh` (hook ِ Stop: کارِ کامیت‌نشده یا جلوتر از origin/main ⇒ block).
- **[BLOCKED]** نوشتنِ `.claude/settings.json` (ثبتِ همان hook) را سامانهٔ مجوزِ این محیط به‌عنوانِ
  «Self-Modification» رد کرد؛ دور زده نشد. محتوای آماده در `docs/claude/settings.example.json` است؛ مالک باید یک‌بار
  اجازه دهد/کپی کند. docs_gate تا آن زمان فقط هشدار می‌دهد.
- **[CHANGE]** `scripts/docs_gate.py`: فایل‌های ورودی (AGENTS/CLAUDE/GEMINI/copilot)، نام‌بردنِ همهٔ دستورهای ship در
  AGENTS.md، حلِ مسیرهای جدولِ «ساختار» ِ CLAUDE.md، امضای جدیدترین بخشِ WORKLOG، frontmatter و بی‌نامِ‌پروژه بودنِ
  درس‌ها، **به‌روزبودن** (تغییرِ کد بی‌تغییرِ WORKLOG/PROGRESS ⇒ رد)، دست‌نخوردنِ `prompt/` و `TO-DO/`، نسخه‌دار بودنِ
  پرامپتِ ناظر.
- **[CHANGE]** `CLAUDE.md`، `AGENTS.md`، `GEMINI.md`، `.github/copilot-instructions.md`، `docs/handbook/HANDBOOK.md`،
  `docs/handbook/PROGRESS.md`، این فایل؛ `experiences/README.md` (فیلدهای الزامیِ `resolution_status`،
  `recurrence_count`، `user_confirmed`، `agents`) و سه درس: `render-skip-marker-hides-undeployed-work`،
  `health-ping-is-not-proof`، `gitignore-hides-source-from-deploy`.
- **[CHANGE]** `render.yaml` با سرویسِ واقعی هم‌خوان شد (نام `language`، region، plan، build/start ِ داشبورد) — بی‌اثر
  روی Render چون Blueprint نیست؛ فقط حقیقتِ مستند.
- **[DECISION]** مستنداتِ پروژه به الگوی Detective-1 (AGENTS انگلیسی برای همهٔ ابزارها + CLAUDE فارسی). ردشده‌ها:
  (الف) فقط CLAUDE.md — ابزارهای دیگر نمی‌خوانند؛ (ب) گذاشتنِ قواعد در README — با مستنداتِ معماری قاطی می‌شود و
  دروازه‌ای ندارد.
- **[DECISION]** «به‌روزبودنِ» مستندات = هر تغییرِ کد نسبت به `origin/main` باید WORKLOG و PROGRESS را هم در همان
  ارسال تغییر دهد. ردشده: مقایسهٔ تاریخ (mtime در کلونِ تازه معنا ندارد) و شمارشِ کامیت‌ها (کامیتِ صرفاً مستند را
  جریمه می‌کند).
- **[VERIFY]** `bash -n scripts/ship.sh`، `python3 scripts/docs_gate.py` ⇒ OK (با هشدارِ settings)، hook با ورودیِ
  نمونه `decision: block` داد، `tests/test_render_yaml.py` ‏۴/۴. ship.sh خودش همهٔ تست‌ها را پیش از ارسال اجرا می‌کند.
- **[TODO]** مرحلهٔ ۲ (نظارت و سرکشی) و مرحلهٔ ۳ (ذخیره‌سازی/امنیت/ورود).
> **امضا:** `Claude Code` · 2026-11-02 · ship.sh (همهٔ تست‌ها + build + docs gate) پیش از ارسال اجرا شد

## 2026-11-02 (۲) — «نظارت و سرکشی» و ناظرِ خودکار

- **[OWNER]** پیاده‌سازیِ همان قابلیتِ Detective-1/ALLIN1 متناسب با React/Vite + Express + Gemini + Firestore: کادرکشی روی
  هر صفحه + متن + پیوست؛ استخراج و خواندنِ پیوست؛ وضعیت جدا از نتیجه؛ `fixed` بی‌تصویرِ بعد رد؛ تیک فقط مالک؛ برگهٔ
  غیرادمین با تأییدِ ادمین؛ حذف ممنوع؛ صفِ فوری؛ حسابِ ناظر با `SUPERVISOR_PASSWORD` فقط روی Render؛ دو روتین؛
  پرامپتِ نسخه‌دار با archive/RUNLOG/OPEN_ITEMS؛ شش قاعده؛ بازرسیِ بدبینانه و اجرایی.
- **[FINDING]** مرجع از ریپوی Detective-1 خوانده شد (`CLAUDE.md`، `AGENTS.md`، `scripts/ship.sh`، `scripts/docs_gate.py`،
  `.claude/`، `docs/supervisor/README|PROMPT|OPEN_ITEMS`، `backend/detective/models_inspection.py` کامل،
  `routers/inspection.py` بخشِ یادداشت/نگهبان‌ها و فهرستِ مسیرها). ALLIN1 در دسترس بود ولی باز نشد (Detective-1 نسخهٔ
  کامل‌ترِ همان الگوست).
- **[FINDING]** بک‌اند هیچ اعتبارنامهٔ نوشتن در Firestore ندارد (فقط `verifyIdToken` با `projectId`) و دیسکِ Render
  با هر دیپلوی پاک می‌شود ⇒ ذخیرهٔ ماندگار بدونِ اقدامِ مالک ممکن نیست.
- **[DECISION]** ذخیره‌سازِ دوگانه با یک رابط و **بی‌عملیاتِ حذف**: `FirestoreStore` (Admin SDK با `FIREBASE_SERVICE_ACCOUNT`،
  مسیرِ `artifacts/{appId}/inspection*`، بایت‌ها در تکه‌های ۷۰۰KB) یا `FileStore` (JSON + blobs) با برچسبِ `durable:false`
  که در صفحه هشدارِ قرمز و در `prod_check` P1 می‌شود. ردشده‌ها: نوشتن از مرورگر با قوانینِ Firestore (نگهبان‌هایی مثلِ
  «پیوستِ ناخوانده» در rules قابلِ بیان نیست و ناظر حسابِ Firebase می‌خواست)؛ فایلِ بی‌هشدار (پاک‌شدنِ بی‌صدا)؛ مسدودکردنِ
  کاملِ ثبت تا حسابِ سرویس (مالک نمی‌توانست بیازماید).
- **[DECISION]** حسابِ ناظر = ورود با `SUPERVISOR_PASSWORD` (≥۱۶ نویسه، مقایسهٔ زمان‌ثابت، ۱۰ تلاش/۱۵ دقیقه) و توکنِ HMAC
  ۱۲ ساعته `sup.<exp>.<sig>`. مالک = ایمیلِ تأییدشدهٔ گوگل در `ADMIN_EMAILS ∪ VITE_ADMIN_EMAILS ∪ ایمیلِ مالک در firestore.rules`.
  ردشده: حسابِ گوگلِ جدا برای ناظر (ورودِ تعاملی)، کلیدِ ثابت در ریپو.
- **[DECISION]** مسیرِ صفحه‌ها در hash (`#/lessons`، `#/lesson/<id>`) تا «بازگشت» و عکسِ ناظر ممکن شود. ردشده: react-router.
- **[CHANGE]** بک‌اند: `services/inspection/{model,store,extract,auth}.js`، `routes/inspection.js` (پیش از محدودکنندهٔ
  عمومی، با محدودکنندهٔ خودش ۶۰۰/۱۵ دقیقه)، اتصال در `server.js`. استخراج: متن/کد، PDF، docx/xlsx/pptx، ODF، EPUB، ZIP
  (تودرتو)، رونویسیِ کاملِ صوت/ویدیو با Gemini (≤۱۵MB)؛ وضعیت‌های ok/empty/unsupported/failed/image/pending.
- **[CHANGE]** فرانت: `frontend/src/inspection/` (لایهٔ کادرکشی + فرم + هایلایت، صفحهٔ مالک بی‌دکمهٔ حذف، geometry با
  گره و کسرها، کلاینتِ API با توکنِ ID)؛ `App.jsx`: مسیرِ hash، منوی «نظارت و سرکشی»، نمای `inspection`، لایه روی همهٔ صفحه‌ها.
- **[CHANGE]** ناظر: `scripts/supervisor/{client,inspection,deploys,prod_check}.py`، `screenshot.mjs`؛ مستندات
  `docs/supervisor/{README,PROMPT,URGENT_PROMPT,RUNLOG,OPEN_ITEMS}.md`، `archive/`، `inspection/README.md`؛ `.gitignore` برای
  پوشهٔ کاری؛ `render.yaml` و `backend/.env.example` (متغیرهای تازه)؛ درسِ `machine-reviewer-guards-belong-in-the-api`.
- **[VERIFY]** `node --test tests/inspection.test.js` ‏۱۸/۱۸ (قواعد + API ِ واقعی روی سرورِ موقت: چرخهٔ کامل، ۴۲۲ ِ پیوستِ
  ناخوانده و پریدن به جلو، ۴۲۲ ِ fixed بی‌تصویر، ۴۰۳ ِ تیک/فوری/claim برای ناظر/کاربر، ۴۰۵ ِ حذف، پنهان‌بودنِ برگهٔ کاربر از ناظر
  تا پذیرش، صفِ فوری)؛ vitest ‏۱۲ تستِ تازه (geometry، API client، صفحه و لایه). آزمونِ سرتاسریِ ابزارها روی سرورِ محلی
  (`RUNLOG` 2026-11-02)؛ `screenshot.mjs '#/lessons'` صفحهٔ درست را بی‌خطای کنسول نشان داد (تصویر دیده شد).
- **[BLOCKED]** تنظیمِ `FIREBASE_PROJECT_ID=labaneseapp` و `SUPERVISOR_PASSWORD` (تصادفی) روی Render از این نشست توسطِ
  سامانهٔ مجوز («Modify Shared Resources») رد شد؛ دور زده نشد ⇒ اقدامِ مالک (OPEN_ITEMS ۴). `FIREBASE_SERVICE_ACCOUNT` را
  فقط مالک می‌تواند بسازد (OPEN_ITEMS ۱).
- **[TODO]** ساختنِ دو روتین پس از دیپلوی؛ اولین اجرای واقعی (OPEN_ITEMS ۲).
> **امضا:** `Claude Code` · 2026-11-02 · node ‏۱۸/۱۸ + vitest نظارت ۱۲/۱۲ + آزمونِ سرتاسریِ محلیِ ابزارها؛ ship.sh همهٔ تست‌ها را اجرا کرد
