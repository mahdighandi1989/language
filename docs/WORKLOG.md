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

## 2026-11-02 (۳) — بازرسیِ ذخیره‌سازی و امنیت، رفعِ مسیرِ ورود/ادمین، بازبینیِ نهایی

- **[OWNER]** ذخیره‌سازی و امنیت فقط بررسی و گزارش (تغییرِ ساختار ممنوع)؛ مسیرِ ورود و نقشِ ادمین سر تا ته تست و رفع؛
  بازبینیِ نهاییِ همهٔ بخش‌ها و رفع؛ تست.
- **[DECISION]** «تغییرِ ساختار ممنوع» = همان سندِ واحدِ Firestore، همان مسیرها و کلیدهای localStorage؛ فقط باگ‌هایی رفع شد
  که بی‌تغییرِ ساختار داده را خراب یا ناسینک می‌کردند. ردشده: شکستنِ سند به زیرمجموعه‌ها و انتقالِ رسانه به Storage
  (ساختاری؛ گزارش شد).

### ذخیره‌سازی — یافته‌ها
- **[FINDING][CRITICAL→رفع]** خطرِ پاک‌شدنِ داده: پس از «خروج ⇒ ورودِ دوباره» در همان تب، `isAuthReady` از قبل true بود و
  effect ِ ذخیره (debounce ۱ ثانیه) state ِ خالیِ اولیه را با `merge:true` می‌نوشت؛ merge آرایه‌ها را **جایگزین** می‌کند ⇒ اگر
  snapshot دیرتر از ۱ ثانیه می‌رسید (شبکهٔ کند)، درس‌ها/دانش/ژورنال با خالی بازنویسی می‌شد. رفع: ذخیره فقط پس از بارگذاریِ سندِ
  همین uid (`frontend/src/storage/sync.js`، `loadedUidRef`).
- **[FINDING][رفع]** حلقهٔ نوشتن: هر snapshot (از جمله پژواکِ نوشتنِ خودِ برنامه) شیءِ تازه ⇒ ذخیرهٔ تازه ⇒ snapshot ِ تازه.
  رفع: نادیده‌گرفتنِ `hasPendingWrites` و مقایسهٔ JSON با آخرین بارگذاری/ذخیره.
- **[FINDING][رفع]** `merge:true` کلیدِ حذف‌شدهٔ map را پاک نمی‌کرد ⇒ «بازنشانیِ پرامپت» (و هر حذفِ کلید در `chatHistories`/
  `customPrompts`) برمی‌گشت. رفع: نوشتنِ کاملِ سند (state همان سند است؛ بعد از نگهبانِ بارگذاری امن است).
- **[FINDING][رفع]** «انتقال از مسیرِ قدیمی» در تنظیمات در سندِ مشترکِ قدیمی (`users/shared-user-mahdi`) می‌نوشت، نه در سندِ
  کاربر؛ برای کاربرِ غیرادمین هم قوانین ردش می‌کرد. اکنون در `users/{uid}/data/main`.
- **[FINDING][رفع جزئی، ساختار گزارش]** خطای ذخیره فقط `console.error` بود. اکنون بنرِ قرمز در صفحه + `reportError`. **ریشهٔ
  محتمل (گزارش، رفع نشد چون ساختاری است):** همهٔ داده در **یک سند** با سقفِ ۱MiB است، و `lesson.mediaItems` صوت/ویدیوی تا
  ۱۰MB و تصویرِ تا ۵MB را base64 در همان سند می‌گذارد، و تماس‌های زنده صوتِ PCM ِ ۲۰ پیامِ آخر را در `chatHistories`/
  `archivedConversations`. یک ویدیوی کوچک کافی است تا **هیچ ذخیره‌ای دیگر موفق نشود** و تغییرها فقط در مرورگر بماند.
  پیشنهاد (نیازمندِ تصمیمِ مالک): رسانه به Firebase Storage و فقط ارجاع در سند؛ یا سند به زیرمجموعه‌های درس.
- **[FINDING][گزارش]** پشتیبانِ localStorage (`lebanese_dialect_app_backup`) uid ندارد: روی دستگاهِ مشترک، «بازیابی از
  پشتیبان» دادهٔ کاربرِ قبلی را به حسابِ کاربرِ فعلی می‌ریزد (حریم خصوصی) و سقفِ ~۵MB ِ localStorage با رسانه پر می‌شود
  (خطا فقط لاگ). رفعش کلیدهای ذخیره را عوض می‌کند ⇒ منتظرِ مالک.
- **[FINDING][گزارش]** `flowState` در هر گامِ نمودار یک `setDoc` می‌زند (هزینه/سهمیه)؛ مسیرش `artifacts/{uid}/flowState`
  است (uid به‌جای appId) — با قوانین هم‌خوان ولی ناهم‌شکل با بقیه.
- **[FINDING][گزارش]** دادهٔ ربات تلگرام (`backend/data/telegram-store.json`) و analytics (حافظه) روی Render با هر دیپلوی پاک
  می‌شوند؛ `POST /api/analytics` بی‌احراز است و KPIها را می‌شود مسموم کرد.
- **[FINDING]** هیچ اتصالی به گوگل‌درایو در کدِ برنامه نیست (`grep -i drive` خالی)؛ «حافظهٔ پروژه» ِ درایو ابزارِ
  هماهنگ‌کنندهٔ مالک است، نه بخشی از برنامه. چیزی برای ناسینک‌شدن با درایو وجود ندارد.

### امنیت — یافته‌ها
- **[FINDING][CRITICAL→رفعِ مشروط]** پراکسیِ Gemini/TTS/تحلیل/آپلود/صوت و `/ws/live` برای هر کسی در اینترنت باز است
  (`FIREBASE_PROJECT_ID` روی Render نیست ⇒ `optionalAuth` بی‌اثر). رفع: `requireAuthIfConfigured` + `verifyWsClient`؛ فرانت
  توکن را خودکار می‌فرستد (`utils/apiAuth.js`). **به محضِ اینکه مالک `FIREBASE_PROJECT_ID=labaneseapp` را بگذارد بسته می‌شود.**
  محدودیت: سرور «تأییدشده‌بودن» را نمی‌بیند.
- **[FINDING][رفع]** Inspector Bridge: `postMessage` از هر پنجره/مبدأیی فرمانِ click/navigate می‌پذیرفت (کلیکِ «تأیید» در پنلِ
  مدیر از یک صفحهٔ بیرونیِ بازکننده). اکنون فقط همان پنجره و همان مبدأ. (مسائلِ حریمِ ردیابِ قدیمی طبقِ
  `docs/inspector-bridge-audit.md` در کدِ فعلی نیست؛ دوباره تأیید شد: تست‌های `test_inspector_bridge*` سبز.)
- **[FINDING][رفع]** نامِ فایلِ آپلود مستقیم در مسیرِ دیسک (`${Date.now()}-${originalname}`) ⇒ `safeUploadName`.
- **[FINDING][رفع، انتشارِ دستی]** `firestore.rules`: ادعای ایمیلِ مدیر بی‌`email_verified` و حساس به حروف. اصلاح شد — **مالک باید
  در کنسولِ Firebase › Firestore › Rules منتشر کند.**
- **[FINDING][رفع]** CORS در `server.js` و `security.js` دو بار تعریف شده بود ⇒ یک منبع (`buildAllowedOrigins`).
- **[FINDING][رفع]** کدِ اتصالِ تلگرام منقضی نمی‌شد (پیام می‌گفت «منقضی»). اکنون ۱۵ دقیقه. **گزارش:** با فهرستِ مجازِ خالی،
  دستورهای نوشتنیِ ربات برای همه باز است؛ callback ِ `topic:` مالکیتِ جلسه را چک نمی‌کند (ربات خاموش است).
- **[FINDING][گزارش]** `ENCRYPTION_KEY` روی Render نیست و کلید plaintext است (کار می‌کند؛ رمزنگاری اختیاری است). rate limit
  ۱۰۰/۱۵ دقیقه برای `/api/*` و `trust proxy 1` درست است؛ WebSocket محدودیتِ نرخ ندارد. `chatSchema` با `passthrough` هر فیلدی را
  به Gemini می‌فرستد (مدل ثابت است).
- **[FINDING]** لاگِ Firestore در production روی `debug` بود ⇒ فقط در توسعه.

### ورود و نقشِ ادمین — مسیرِ کامل و رفع‌ها
- مسیر: «ورود با گوگل» (popup) ⇒ `onAuthStateChanged` ⇒ `getDoc(accessControl/{uid})` ⇒ مالک: `setDoc` ِ admin/approved (قانون:
  `isAdminByEmail`) / دیگران: رکوردِ pending ⇒ `onSnapshot` ⇒ دروازه ⇒ مهاجرتِ یک‌بارهٔ سندِ مشترکِ قدیمی برای ادمین ⇒ همگام‌سازیِ داده.
- **[FINDING][رفع]** ادمین‌بودن فقط به `VITE_ADMIN_EMAILS` ِ زمانِ build وابسته بود و باید دستی با `firestore.rules` یکی می‌ماند؛
  اگر نبود/غلط بود، مالک «در انتظارِ تأییدِ مدیر» می‌ماند و کسی نبود تأیید کند. اکنون ایمیلِ مالک همیشه در فهرست است
  (همان ایمیلِ rules). روی Render مقدارش درست است (سنجیده شد: برابر).
- **[FINDING][رفع]** هر خطای Firestore در این مسیر (قوانینِ منتشرنشده، شبکه) به «در انتظارِ تأیید» ختم می‌شد. اکنون صفحهٔ
  «بررسیِ دسترسی ناموفق بود» با علت و «تلاشِ دوباره».
- **[FINDING][رفع]** مسدودشدنِ popup در موبایل/مرورگرِ درون‌برنامه‌ای ⇒ پیامِ کلی. اکنون fallback به redirect و پیامِ دقیق؛
  `prompt=select_account` برای انتخابِ حساب.
- **[VERIFY]** `frontend/src/components/AuthFlow.test.jsx`: خودِ `<App/>` با Firebase ِ ماک: مالک بی‌`VITE_ADMIN_EMAILS` ادمین
  می‌شود؛ خطای permission صفحهٔ توضیح می‌دهد؛ کاربرِ عادی pending؛ هیچ ذخیره‌ای پیش از بارگذاری و هیچ ذخیرهٔ تکراری پس از
  بارگذاری/پژواک. ورودِ واقعیِ گوگل در production از این‌جا ممکن نیست (حسابِ مالک) ⇒ **مالک باید یک بار بیازماید.**

### بازبینیِ نهایی
- **[FINDING][گزارش، حذف نشد]** کدِ مرده: `backend/config/bootstrap.js#runStartupChecks` (هیچ‌جا صدا زده نمی‌شود)،
  `backend/app/*.py` (فقط تست‌های پایتون از آن استفاده می‌کنند)، `authLimiter` (استفاده‌نشده)، `splitVideoIntoSegments`. طبقِ
  قاعدهٔ ۵ قرنطینه‌اند (نگه داشته شدند) و این‌جا ثبت شدند.
- **[CHANGE]** README (ریشهٔ واقعیِ برنامه `components/App.jsx`، دستورهای تست)، `docs/security.md` §۷، درسِ
  `firestore-merge-never-deletes-map-keys`.
- **[CHANGE]** تست‌های تازه: `AuthFlow.test.jsx` (۴)، `storage/sync.test.js` (۴)، `utils/apiAuth.test.js` (۲)، `access` (۳)،
  `InspectorBridge` (ردِ مبدأ)، `backend/tests/securityGuards.test.js` (۴).
- **[VERIFY]** node ‏۱۶۳/۱۶۳، vitest همه سبز، pytest ‏۶۹+۱۱، build سبز (اجرای ship.sh).
- **[TODO][OWNER]** (۱) `FIREBASE_PROJECT_ID=labaneseapp` و `SUPERVISOR_PASSWORD` روی Render؛ (۲) `FIREBASE_SERVICE_ACCOUNT`؛
  (۳) انتشارِ `firestore.rules` در کنسول؛ (۴) یک بار ورود و تستِ ادمین/ذخیره در production؛ (۵) تصمیم دربارهٔ رسانه در سندِ ۱MiB
  و پشتیبانِ بی‌uid؛ (۶) وصلِ مخزن به دو روتین و روشن‌کردنِ روتینِ ساعتی.
> **امضا:** `Claude Code` · 2026-11-02 · node ‏۱۶۳/۱۶۳ + vitest + pytest + build در ship.sh؛ جریانِ ورود با App ِ واقعی و Firebase ِ ماک

## 2026-11-02 (۴) — ثبتِ hook ِ Stop در `.claude/settings.json`

- **[OWNER]** مالک صریحاً اجازه داد `.claude/settings.json` با همان محتوای `docs/claude/settings.example.json` (hook ِ Stop و
  مجوزهای ship) فقط در همین ریپو ساخته و ارسال شود.
- **[CHANGE]** `.claude/settings.json` = کپیِ عینیِ `docs/claude/settings.example.json`. هشدارِ docs_gate دربارهٔ hook برطرف شد.
- **[VERIFY]** JSON معتبر؛ `python3 scripts/docs_gate.py` بی‌هشدار؛ ship.sh همهٔ تست‌ها را اجرا کرد.
> **امضا:** `Claude Code` · 2026-11-02 · docs_gate OK بدونِ هشدار + ship.sh

## 2026-11-02 (۵) — راستی‌آزماییِ پس از تنظیمِ مالک، تأییدِ سمتِ سرور، بازبینیِ نهایی

- **[OWNER]** قوانینِ Firestore منتشر شد؛ `SUPERVISOR_PASSWORD`، `FIREBASE_SERVICE_ACCOUNT`، `FIREBASE_PROJECT_ID` روی Render؛
  روتینِ ساعتی روشن. خواست: پایداریِ ذخیرهٔ نظارت با برگهٔ آزمایشی، بررسیِ Gemini/Live پس از بستنِ پراکسی، بازبینیِ نهایی.
- **[VERIFY]** Render: نام‌ِ متغیرها خوانده شد (نه مقدار)؛ دیپلویِ دستیِ 21:10 (`9cfef86`) live. `inspection.py whoami` ⇒
  `store.kind=firestore, durable=true`. برگهٔ آزمایشیِ ۱ (ثبتِ هماهنگ‌کننده با اجازهٔ مالک، 21:33Z) با `pull` خوانده شد و ناظر
  پاسخ داد: «دریافت شد»، نتیجهٔ `fixed` با تصویرِ بعد (داشبوردِ برنامهٔ واقعی) و `noChangeReason` (برگه صریحاً گفته بود کد عوض نشود).
- **[VERIFY]** پراکسی در production: بی‌توکن ⇒ ۴۰۱ برای `gemini/chat`، `gemini/tts`، `list-models`، `test-gemini`، `live-model-check`،
  `upload`، `audio/process`، `analyze-files`؛ توکنِ جعلی ⇒ ۴۰۱؛ `/ws/live` بی‌توکن و با توکنِ جعلی ⇒ ۴۰۱. لاگِ Render: مرورگرِ مالک
  21:32:37 `POST /api/gemini/chat` ‏۲۰۰ (۱۰۸۱ms) و 21:32:39 `POST /api/gemini/tts` ‏۲۰۰ ⇒ کاربرِ واردشده کار می‌کند.
  **سنجیده‌نشده:** Live با کاربرِ واقعی (اتصالِ مرورگری در لاگ نیست) — OPEN_ITEMS ۶.
- **[FINDING][رفع]** سرور فقط «واردشده» را چک می‌کرد؛ کاربرِ pending/rejected هم می‌توانست Gemini را مصرف کند. اکنون که حسابِ سرویس
  هست، `requireAuthIfConfigured` و `verifyWsClient` رکوردِ `artifacts/{appId}/accessControl/{uid}` را می‌خوانند (کش ۶۰ ثانیه):
  تأییدشده/ادمین ⇒ عبور، دیگران ⇒ ۴۰۳، خطای Firestore ⇒ ۵۰۳؛ ایمیلِ مالک همیشه عبور. بی‌حسابِ سرویس رفتارِ قبلی.
- **[FINDING][رفع]** `/api/analytics` (GET/POST) بی‌احراز بود (KPIها خوانا و مسموم‌شدنی) ⇒ همان نگهبان.
- **[FINDING][رفع]** rate limit ِ عمومی ۱۰۰/۱۵ دقیقه: هر پیامِ چت = چت + TTS + analytics ⇒ پس از ~۳۳ پیام ۴۲۹. اکنون ۳۰۰
  (دسترسی را خودِ احراز کنترل می‌کند؛ سقف فقط ضدِ سیل است). [DECISION] ردشده: کلیدِ محدودکننده بر اساسِ uid (نیازمندِ احراز پیش از
  limiter و تغییرِ ترتیبِ middlewareها برای همهٔ مسیرها).
- **[FINDING][رفع]** لاگ نشان داد مالک `/inspection` را مستقیم باز کرده؛ برنامه فقط hash را می‌فهمید و به داشبورد می‌رفت. اکنون مسیرِ
  مستقیم پذیرفته و به `#/…` بازنویسی می‌شود (Chromium: `/lessons` ⇒ `#/lessons`، «لیست دروس»، بی‌خطا).
- **[FINDING]** `CORS_ORIGIN`/`FRONTEND_URL` = دامنهٔ واقعی؛ منطقِ CORS یک‌جا (`buildAllowedOrigins`). `ENCRYPTION_KEY` تنظیم نیست و
  کلید plaintext است (اختیاری؛ در `render.yaml` توضیح داده شد). `render.yaml` با نامِ `language` هم‌خوان است (از WORKLOG ۱).
- **[CHANGE]** `backend/middleware/firebaseAuth.js`، `rateLimiter.js`، `routes/index.js`، `frontend/src/components/App.jsx`،
  `render.yaml`، `docs/security.md`، `OPEN_ITEMS` (۱ و ۴ بسته، ۵ نیمه، ۶ و ۷ تازه)؛ تستِ تازه در `securityGuards.test.js`.
- **[TODO]** پس از این دیپلوی: برگهٔ ۱ و پاسخش باید هنوز در Firestore باشند (RUNLOG).
> **امضا:** `Claude Code` · 2026-11-02 · node ‏۱۶۴/۱۶۴، vitest ‏۹۵، pytest ‏۸۰، build؛ production با curl/WS/لاگِ Render

## 2026-11-03 (۶) — هم‌سطح‌سازیِ «نظارت و سرکشی» با Detective-1

- **[OWNER]** (از هماهنگ‌کننده) مقایسه با Detective-1 (`InspectionBoard.tsx`، `InspectionGroup.tsx`، `routers/inspection.py`) کمبودها را
  نشان داد: (۱) درخواستِ عمومی، (۲) ویرایشِ متن با حفظِ متنِ اولیه، (۳) رد با دلیل + ایمیل در پذیرش/رد، (۴) پیوستِ هر نوع با دانلود،
  برداشتن و درصدِ خواندنِ ناظر، (۵) نوارِ وضعیتِ ناظر و زمانِ تخمینیِ برگهٔ فوری، (۶) رفتن به همان‌جا، (۷) جستجو، (۸) تازه‌سازیِ خودکار
  و پیامِ «ناظر روی موردهای فوری کار کرد»، (۹) `inspection_view.py` و `requirements.txt`.
- **[FINDING]** مرجع کامل خوانده شد: `InspectionBoard.tsx` (۹۰۷ خط)، `InspectionGroup.tsx`، `lib/nextRound.ts`، `services/supervisor_rounds.py`،
  و در `routers/inspection.py` مسیرهای rounds، edit_note، triage + `notify_submitter`، delete_file، mark_urgent.
- **[DECISION]** «برداشتنِ پیوست» = جداکردن از برگه (`detachedAt`)، نه حذف — بایت و متن می‌مانند و دانلود‌شدنی‌اند؛ برداشته‌ها بدهیِ خواندن
  ندارند. ردشده: حذفِ واقعی مثلِ مرجع (قاعدهٔ مالک در این پروژه: هیچ داده‌ای حذف نمی‌شود)، و «نه» گفتن به خواسته.
- **[DECISION]** ایمیل با `nodemailer` و SMTP فقط از متغیرهای Render؛ بی‌SMTP نتیجه روی برگه ثبت می‌شود («ایمیل نشد — SMTP تنظیم نیست»)
  و هیچ‌چیز نمی‌شکند. ردشده: Gmail API ِ مرجع (OAuth و توکن‌های تازه)، ارسال از مرورگر (افشای اعتبار).
- **[DECISION]** دورهای ناظر **اندازه‌گیری** می‌شوند (پورتِ `supervisor_rounds`): هر `urgent/claim` ِ ناظر = سرزدنِ فوری، هر `queue` ِ ناظر = سرزدنِ
  کامل؛ observed/assumed/stale. پیش‌فرض‌ها هم‌خوان با روتین‌ها (`:37` ساعتی، `23 2 * * 1,4`). ردشده: نوشتنِ زمان‌بندی در کد بی‌اندازه‌گیری.
- **[DECISION]** «دستهٔ منتخب و اشراف» (`InspectionGroup.tsx`) پورت نشد: مدلِ مجوزِ مرجع (permission override + امتیازِ اشراف) در این
  برنامه وجود ندارد؛ دروازهٔ معادل = تأییدِ کاربر در «مدیریتِ کاربران» + پذیرش/ردِ هر برگه. اگر مالک بخواهد، کارِ جدا.
- **[CHANGE]** بک‌اند: `services/inspection/rounds.js` (تازه)، `mailer.js` (تازه)، `model.js` (`editNote`، `detachFile`، `readProgress`،
  `general`)، `store.js` (`knock`/`getKnocks` در هر دو ذخیره‌ساز)، `routes/inspection.js` (`GET /rounds`، `PATCH …/notes/:noteId`،
  `POST /files/:id/detach`، triage با ایمیل و ثبتِ `mail`، ⚡ با `position` و `nextRound`، `general` در ساخت)؛ وابستگیِ `nodemailer`.
- **[CHANGE]** فرانت: `InspectionBoard.jsx` بازنویسی (همهٔ ۸ قابلیت، بی‌دکمهٔ حذف)، `nextRound.js`، `focus.js`، `api.js`، و چشمک‌زدنِ کادر
  در `InspectionLayer.jsx`. ناظر: `scripts/supervisor/inspection_view.py` (از Detective-1)، `requirements.txt`، `inspection.py pull` خطِ `👁`.
- **[CHANGE]** `docs/supervisor/PROMPT.md` نسخهٔ ۲ (نسخهٔ ۱ در `archive/PROMPT-v1-2026-11-02.md`)، `docs/supervisor/README.md`، `render.yaml`،
  `backend/.env.example`.
- **[VERIFY]** node ‏۱۶۹/۱۶۹ (۵ تستِ تازه: rounds، ویرایش، درصدِ خواندن، ایمیل، و چرخهٔ API: عمومی → ویرایش → درصد → برداشتن (۴۰۳ برای ناظر،
  بایت هنوز ۲۰۰) → ⚡ با نوبت → سرزدن‌ها → رد با دلیل + ثبتِ ایمیل → پذیرش)؛ vitest با ۱۱ تستِ تازه (`InspectionParity.test.jsx`)؛
  آزمونِ سرتاسریِ محلی: درخواستِ عمومی + ZIP ⇒ `pull` خطِ «👁 همهٔ محتوای آرشیو باز شد»؛ `/rounds` ⇒ assumed/scheduled با lastSeen.
- **[TODO][OWNER]** برای ایمیل: `SMTP_HOST`، `SMTP_USER`، `SMTP_PASSWORD` (و `SMTP_PORT`، `MAIL_FROM`) روی Render — OPEN_ITEMS ۸.
> **امضا:** `Claude Code` · 2026-11-03 · node ‏۱۶۹ + vitest + pytest + build در ship.sh؛ آزمونِ سرتاسریِ محلیِ ابزارِ ناظر

## 2026-11-03 (۷) — ایمپورتِ دسته‌ای درس، متنِ درس بیرون از سندِ ۱MiB، لیستِ دروسِ ۱۰۰+

- **[OWNER]** (از Claude Cowork به دستورِ مالک) انتقالِ کاملِ درس‌ها (ریتا، الخنسا ترم ۱–۳، سریال‌ها، پراکنده) بی‌خلاصه‌سازی:
  (۱) ایمپورتِ JSON ِ نسخه‌دار فقط برای ادمین، ادغامی و idempotent با `sourceKey`، بی‌بازنویسی/حذفِ درس‌های موجود، پیش‌نمایش، پشتیبان،
  گزارش؛ (۲) راهِ امن برای سقفِ ۱MiB؛ (۳) لیستِ دروس برای ۱۰۰+ درس؛ (۴) مستندِ قالب.
- **[FINDING]** `archivedNotes` در جستجو، آزمون، فلش‌کارت، چت، پیشرفت و جستجوی کلی خوانده می‌شود ⇒ بارگذاریِ فقط-هنگامِ-باز-کردن
  همهٔ آن‌ها را برای درس‌های باز‌نشده خالی می‌کرد.
- **[FINDING]** `MarkdownRenderer` روی **هر** `---` بخش را می‌شکست ⇒ ردیفِ جداکنندهٔ جدول (`|---|`) جدول‌ها را می‌برید؛ جدول اصلاً رندر نمی‌شد.
- **[DECISION]** متنِ درسِ ایمپورتی در `users/{uid}/lessonBodies/{key}` + `chunks/{i}` (≤۲۵۰هزار نویسه، head + همهٔ تکه‌ها در **یک**
  batch ِ اتمیک، هش برای راستی‌آزمایی). در حافظه متن کامل است (همهٔ قابلیت‌ها مثلِ قبل)؛ فقط «شکلِ ابری» ِ سندِ اصلی ارجاع دارد
  (`toCloudDoc`). پس از ورود، متن‌ها در پس‌زمینه بارگذاری می‌شوند؛ درسِ «در حالِ بارگذاری/خطا» هرگز نوشته نمی‌شود و ویرایشِ متنش
  قفل است (نگهبان در `updateLesson`). ترتیبِ نوشتن: بدنه‌ها اول، بعد سندِ اصلی. ردشده‌ها: فشرده‌سازی در همان سند (سقفِ ۱MiB را فقط
  عقب می‌اندازد)، بارگذاریِ تنبل هنگامِ باز کردن (قابلیت‌های دیگر متن را نمی‌دیدند)، مهاجرتِ خودکارِ درس‌های inline ِ فعلی (مخرب‌پذیر؛
  درس‌های موجود دست نخوردند)، Firebase Storage (قوانین و پیکربندیِ جدا).
- **[DECISION]** `serializeForSync` اکنون JSON ِ پایدار (کلیدهای مرتب) می‌سازد تا ترتیبِ فیلدهای Firestore ذخیرهٔ بی‌دلیل نسازد.
- **[DECISION]** تداخلِ عنوان (درسِ موجود با همان عنوان و بی‌همان sourceKey، مثل «1 - ریتا») = رد و گزارش، نه ادغام. ردشده: ادغام در درسِ
  موجود (خطرِ بازنویسیِ چت/یادداشت).
- **[CHANGE]** `frontend/src/lessons/` (تازه): `lessonImport.js`، `lessonBodies.js`، `sortLessons.js`، `markdown.jsx`، `LessonImportPanel.jsx`،
  `lessons.test.jsx`؛ `components/App.jsx` (مسیرِ همگام‌سازی با بدنه‌ها، `hydrateBodies`، نگهبانِ `updateLesson`، پنلِ ایمپورت در مدیریت،
  لیست: جستجوی بی‌حساس به اعراب/ارقام/ي‌ك، فیلترِ دوره، مرتب‌سازیِ «دوره و شماره» پیش‌فرض و عنوانِ طبیعی، `MarkdownRenderer` ← نمایشگرِ تازه)؛
  `storage/sync.js`؛ `firestore.rules` (فقط توضیح — انتشارِ دوباره لازم نیست)؛ `docs/lessons-import.md`.
- **[VERIFY]** vitest: ۱۲ تستِ `lessons.test.jsx` + ۲ تستِ App ِ واقعی در `AuthFlow.test.jsx` (بارگذاریِ بدنه بی‌ذخیرهٔ دوباره؛ ایمپورت از پنلِ
  مدیریت ⇒ یک batch با ۲ تکه + head، سپس سندِ اصلی با `archivedNotes: ''` و `bodyRef.chars` درست، درسِ «1 - ریتا» و چتش عیناً همان، سندِ
  اصلی < ۲۰KB). Chromium (حالتِ محلی): فایلِ ۱۵ درسی ⇒ پیش‌نمایش ⇒ پشتیبان دانلود شد ⇒ «۱۵ درس و ۱۲ آیتمِ دانش» ⇒ لیست به ترتیبِ
  ۱، ۲، ۱۰ ⇒ جدولِ عربی/فارسی/لاتین درست ⇒ اجرای دوباره: «افزوده می‌شود: ۰ · قبلاً ایمپورت‌شده: ۱۵»؛ بی‌خطای کنسول.
- **[TODO]** سنجشِ واقعی در production با فایلِ مالک (Chrome)؛ اگر دانشِ ایمپورتی سندِ اصلی را از ۹۰۰KB بگذراند، پیش‌نمایش جلویش را می‌گیرد —
  آن‌وقت دانش هم باید جدا شود (کارِ بعدی).
> **امضا:** `Claude Code` · 2026-11-03 · vitest (۱۲۰) + node + pytest + build در ship.sh؛ Chromium با فایلِ ۱۵ درسی

## 2026-11-03 (۸) — ایمپورت: افزودن به «1 - ریتا»/«2 - ریتا» و فیلدِ sources

- **[OWNER]** نسخهٔ کاملِ پیام (قبلی خالی رسیده بود): `lessons_v1.json` ‏۵۴ درس (~۱٫۱MB)؛ برای درس‌های موجودِ «1 - ریتا» و «2 - ریتا» «بخشِ جزوه
  فقط افزوده شود»؛ فیلدِ `sources`؛ بندهای ۴–۷ (آپلودِ هوشمند + Drive، نیمه‌کاری‌ها، باگ‌های بصری و خروجی‌ها، شادوینگ) پس از ۱–۳.
- **[CORRECTION]** WORKLOG (۷): «تداخلِ عنوان = رد» با خواستهٔ مالک نمی‌خواند. اکنون: هم‌نام ⇒ **افزودن** به انتهای درسِ موجود زیرِ
  «📥 جزوهٔ واردشده (sourceKey)»، متنِ قبلی پیشوندِ دقیق، `importedSourceKeys` برای idempotency؛ درسِ هم‌نامِ بارگذاری‌نشده ⇒ رد.
- **[DECISION]** درسِ inline ِ موجود که پس از افزودن از ۲۰هزار نویسه بگذرد، **کلِ** متنش (قدیم + تازه) به ذخیره‌گاهِ جدا می‌رود (`bodyRef`)؛
  ترتیبِ نوشتن «بدنه اول، سندِ اصلی بعد» است و پشتیبانِ JSON پیش از اعمال دانلود می‌شود ⇒ چیزی گم نمی‌شود. ردشده: نگه داشتنِ متنِ بلند
  inline (سندِ اصلی را به سقف نزدیک می‌کرد).
- **[CHANGE]** `lessons/lessonImport.js` (appends، `sources`، `EXTERNALIZE_CHARS`، `appendHeading`)، `LessonImportPanel.jsx` (پیش‌نمایش/گزارشِ
  «افزوده به درسِ موجود»)، `docs/lessons-import.md`؛ تست‌ها به قاعدهٔ تازه به‌روز شدند.
- **[VERIFY]** vitest ‏۱۲۱/۱۲۱: افزودن پیشوندِ دقیق را نگه می‌دارد، چت و درسِ دیگر یکسان، اجرای دوباره صفر، رشد از ۲۰k ⇒ `bodyRef`، درسِ
  pending ⇒ رد؛ App ِ واقعی: سندِ ذخیره‌شده برای «1 - ریتا» همهٔ فیلدها + متنِ قدیمی به‌عنوانِ پیشوند.
> **امضا:** `Claude Code` · 2026-11-03 · vitest ‏۱۲۱ + node + pytest + build در ship.sh

## 2026-11-03 (۹) — باگِ production: ایمپورت «موفق» بود ولی پس از رفرش برگشت

- **[OWNER]** (Cowork، ۲۲:۱۷ دبی) `lessons_v3.json` (۵۴ درس، ۱٫۲MB) در `#/admin`: پیش‌نمایش درست (۵۲ تازه + افزودن به ۲؛ سندِ اصلی ۸۱KB)،
  پیامِ «✅ ۵۲ درسِ تازه …»، لیست ۵۴؛ پس از رفرش فقط ۲ درس و بی «جزوهٔ واردشده». کنسول بی‌خطا.
- **[FINDING][ROOT CAUSE]** (از کد، `19a3ca6`) پیامِ موفقیت در `LessonImportPanel.apply` بلافاصله پس از `setData` نشان داده می‌شد — **پیش از هر
  نوشتن در Firestore**. ذخیره ۱ ثانیه بعد (debounce) شروع می‌شد، بدنه‌ها را **یکی‌یکی** (۵۲ batch ِ پشتِ‌سرِهم) و سندِ اصلی را **آخر** می‌نوشت.
  رفرش در این فاصله ⇒ سندِ اصلی هرگز نوشته نشد ⇒ پس از ورود همان ۲ درس. خطایی هم رخ نداده بود که بنر نشان دهد؛ هشدارِ ترکِ صفحه هم نبود.
- **[FINDING]** `firestore.rules` ِ ریپو مسیرِ `lessonBodies` را با `match /artifacts/{appId}/users/{uid}/{document=**}` پوشش می‌دهد (ادمین/تأییدشده)؛
  قاعدهٔ تازه‌ای لازم نیست. **سنجیده‌نشده:** نسخهٔ منتشرشده روی labaneseapp و اینکه بدنه‌ها نوشته شدند یا نه — خواندنِ مستقیمِ Firestore با حسابِ
  سرویس را سامانهٔ مجوزِ این محیط («Production Reads») رد کرد؛ دور زده نشد. روشِ بررسیِ دستی در گزارش به مالک.
- **[CHANGE]** `lessons/lessonBodies.js#writeCloudDoc`: همهٔ بدنه‌های تغییرکرده **و** سندِ اصلی در **یک batch ِ اتمیک** (≤۴۵۰ عملیات و ≤۸MB؛
  ۱٫۲MB جا می‌شود)؛ بزرگ‌تر ⇒ batch‌های بسته‌بندی‌شده و سندِ اصلی آخر. `App.jsx`: `persistCloud` ِ مشترک (قفل، resolve فقط پس از تأییدِ backend،
  خطا ⇒ بنرِ قرمز و reject)، ذخیرهٔ خودکار از همان می‌گذرد؛ `beforeunload` هنگامِ تغییرِ ذخیره‌نشده/در جریان. `LessonImportPanel`: «⏳ در حالِ ذخیره —
  صفحه را نبندید» ⇒ موفقیت فقط پس از تأییدِ Firestore («ذخیره در فضای ابری تأیید شد ✔») ⇒ خطا: پیامِ قرمز با علت + «تلاشِ دوباره»؛ ذخیرهٔ صریح
  وقتی سندِ کاربر بارگذاری نشده خطای روشن می‌دهد (نه بی‌صدا).
- **[VERIFY]** vitest ‏۱۲۴/۱۲۴، از جمله App ِ واقعی: commit عمداً معطل ⇒ «در حالِ ذخیره» دیده می‌شود و «تأیید شد» **نه**؛ پس از آزادسازی ⇒ «تأیید شد»،
  دقیقاً **یک** batch شامل ۲ تکه + head + سندِ اصلی، `setDoc` جدا صفر؛ commit ِ ردشده (permission-denied) ⇒ پیامِ قرمز با نامِ firestore.rules و
  «تلاشِ دوباره»، بی‌موفقیت؛ واحد: حالتِ >۸MB ⇒ چند batch و سندِ اصلی آخرین.
- **[TODO][OWNER]** دوباره ایمپورت (idempotent) و منتظرِ «ذخیره در فضای ابری تأیید شد ✔» پیش از رفرش.
> **امضا:** `Claude Code` · 2026-11-03 · vitest ‏۱۲۴ + node + pytest + build در ship.sh
