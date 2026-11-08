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

## 2026-11-03 (۱۰) — بندِ ۴: آپلودِ هوشمند (بخشِ بی‌Drive) + پنلِ چتِ پهن‌تر (بخشی از بندِ ۶)

- **[OWNER]** (Cowork) ایمپورتِ ۵۴ درس در production ماندگار شد (تأیید). سپس بندهای ۴→۷: آپلودِ هوشمندِ چندفایلی، اصلِ فایل در Drive + دیتابیس،
  استخراجِ دقیق با اعتبارسنجیِ چندمرحله‌ای و علامتِ مشکوک، جزوهٔ یکپارچه، بخشِ جدای «اصلاحات و هشدارهای اعراب و معنا»؛ پنلِ «تمرین مکالمه» باریک (~۲۸۰px).
- **[FINDING]** موجود: آپلودِ چندفایلی و «تحلیلِ محتوا» (`/api/analyze-files`) — خروجی **تحلیل/خلاصهٔ Gemini** است، نه متنِ دقیق؛ «افزودن به درس»
  کلِ جزوه را با Gemini **بازنویسی** می‌کند؛ اصلِ فایل‌ها هیچ‌جا ذخیره نمی‌شد (فقط فراداده در `lesson.files`). هیچ اتصالِ Drive در برنامه نیست.
- **[DECISION]** قابلیتِ تازه **کنارِ** «تحلیلِ محتوا» (که دست نخورد): `POST /api/lesson-files/:lessonId` — اصلِ هر فایل در ذخیره‌سازِ ماندگار
  (همان Firestore ِ حسابِ سرویس؛ `lessonfile-<id>` + فهرستِ هر درس)، متن: (۱) **دقیق** برای txt/docx/xlsx/pptx/ODF/EPUB/ZIP و PDF ِ متنی با
  استخراج‌کنندهٔ قطعیِ موجود (بی‌AI، بایت‌به‌بایت)؛ (۲) **دوبار‌سنجیده** برای عکس/صوت/ویدیو/PDF ِ اسکن: دو رونویسیِ مستقل (پرامپت و دمای متفاوت)،
  مقایسهٔ سطربه‌سطر پس از نرمال‌سازی (اعراب، ي/ی، ارقام، برچسبِ زمان)، سطرهای تأییدنشده «⚠️ [مشکوک]» و درصدِ توافق؛ (۳) بازبینیِ جدا:
  `{quote, kind: اعراب|معنا|املا, issue, suggestion}` و نقلی که عیناً در متن نیست «نقلِ نایافته» علامت می‌خورد. جزوهٔ یکپارچه فقط **افزوده**
  می‌شود؛ اصلاحات در `lesson.corrections` و پنلِ جدا. «برداشتنِ فایل» = `removedAt`، نه حذف. ردشده‌ها: تغییرِ «تحلیلِ محتوا» (رفتارِ موجود
  را می‌شکست)، OCR ِ محلی (tesseract برای عربی/فارسی با اعراب دقیق نیست و وابستگیِ سنگین است)، یک‌بار رونویسی (بی‌اعتبارسنجی).
- **[DECISION]** Drive: حسابِ سرویس در Drive ِ شخصی سهمیه ندارد ⇒ OAuth ِ یک‌بارهٔ مالک لازم است؛ طرح در `docs/drive-plan.md`؛ ساخته نشد تا مالک
  OAuth client را بسازد (رمزی در چت لازم نیست).
- **[CHANGE]** بک‌اند: `services/lessonFiles/{verify,pipeline,store}.js`، `routes/lessonFiles.js` (در `routes/index.js`)، `geminiService.analyzeWithGemini`
  با `options.generationConfig` (سازگار با قبل). فرانت: `lessons/{SmartUpload.jsx,unifiedNotes.js}`، `CorrectionsPanel` در صفحهٔ درس؛ چیدمانِ صفحهٔ درس
  `xl:grid-cols-5` (محتوا ۳، چت ۲، چسبان) — چت در ۱۴۴۰px از ~۲۸۰ به ۴۱۶px؛ موبایل تمام‌عرض.
- **[VERIFY]** node ‏۱۷۲/۱۷۲ (تازه: نرمال‌سازی/مقایسه، متنِ دقیق بایت‌به‌بایت بی‌AI، دو رونویسی ⇒ سطرِ مشکوک، نقلِ نایافته، پاک‌شدنِ کلید از خطا،
  API: دو فایل ⇒ دقیق + دوبار‌سنجیده، فهرست، دانلودِ بایت‌به‌بایت، «برداشتن» ⇒ بایت هنوز ۲۰۰، درسِ دیگر ۴۰۴)؛ vitest ‏۱۲۹/۱۲۹ (جزوهٔ یکپارچه،
  افزودن بی‌بازنویسی، اصلاحاتِ جدا، کامپوننت). Chromium: صفحهٔ درس دسکتاپ/موبایل بی‌خطا، عرضِ کارتِ چت ۴۱۶/۳۵۸.
- **[TODO]** Drive پس از اقدامِ مالک؛ بندِ ۵ (باگ‌های نیازها.docx)، بقیهٔ ۶ (خروجی‌ها، موبایل/مودال‌ها)، ۷ (شادوینگ).
> **امضا:** `Claude Code` · 2026-11-03 · node ‏۱۷۲ + vitest ‏۱۲۹ + pytest + build در ship.sh؛ Chromium دسکتاپ/موبایل

## 2026-11-04 (۱۱) — عملکرد با ۱۸۸ درس / ~۳٫۲ میلیون نویسه

- **[OWNER]** (Cowork، ۴ نوامبر ~۰۱:۱۵ دبی) همهٔ ورودی‌ها ماندگار: ۱۸۸ درس (۵۴ + ریتا ۲۱ + ۳۷ PDF ِ الخنسا افزوده به ۱۵ درس + ۱۳۳ قسمتِ سریال).
  مشکل‌ها: (۱) متنِ درس‌ها پس از ورود ۶۰–۷۰ ثانیه دیر می‌آید و درسِ بازشده خالی است؛ (۲) ذخیره حتی برای درسِ کوچک ۴۵–۱۰۰ ثانیه؛ (۳) جستجو/
  دانش/آزمون/چت با ۴ میلیون نویسه کند نشوند و چتِ درس سقفِ توکن را نشکند.
- **[FINDING][ROOT CAUSE ۱]** `hydrateBodies` بدنه‌ها را **یکی‌یکی** می‌خواند (هر درس: head و سپس تکه‌ها پشتِ‌سرِهم) و پس از **هر** درس `setData`
  ⇒ ۱۸۸ رندرِ کاملِ برنامه؛ درسِ باز اولویت نداشت.
- **[FINDING][ROOT CAUSE ۲ — محتمل‌ترین]** تایمرِ ذخیرهٔ خودکار با **هر** تغییرِ داده از نو شروع می‌شد (`clearTimeout` در cleanup ِ effect)؛ در ۶۰–۷۰ ثانیهٔ
  بارگذاری، هر بدنهٔ رسیده تایمر را عقب می‌انداخت ⇒ ذخیرهٔ ویرایشِ کاربر تا پایانِ بارگذاری انجام نمی‌شد (۴۵–۱۰۰ ثانیه). حدسِ «بازنویسیِ همهٔ
  بدنه‌ها» در کد تأیید نشد (`bodiesToWrite` فقط بدنه‌های با هشِ متفاوت) — برای اندازه‌گیریِ واقعی، هر ذخیره اکنون در کنسول می‌گوید
  `cloud save: N lesson bodies + main (KB) in ms`.
- **[FINDING]** چتِ درس با **هر** پیام کلِ متنِ درس (تا ۵۰هزار+ نویسه) را در systemInstruction می‌فرستاد (Gemini 2.5 Flash سقفِ ۱M توکن دارد پس
  نمی‌شکند، ولی کند و پرهزینه بود). تماسِ زنده فقط عنوان + ۱۵ پیام را می‌فرستد (مشکلی ندارد). جستجوی لیست و جستجوی کلی در هر حرف کلِ متن‌ها را
  دوباره نرمال/lowercase می‌کردند.
- **[CHANGE]** `lessons/bodyLoader.js` (تازه): ۶ هم‌زمان، `prioritize` برای درسِ باز، تحویلِ دسته‌ای هر ۲۵۰ms، پیشرفت؛ `lessonBodies.read`: تکه‌ها
  موازی؛ `textHash` با حافظهٔ رشته‌های اخیر. `App.jsx`: نوارِ «⏳ در حالِ بارگذاریِ متنِ درس‌ها N از M»، اولویتِ درسِ باز (effect روی درسِ انتخاب‌شده)،
  ذخیرهٔ خودکار **حداکثر ۱ ثانیه پس از اولین تغییر** (دیگر با تغییرهای بعدی عقب نمی‌افتد)، لاگِ زمانِ ذخیره و بارگذاری. `lessons/excerpt.js` (تازه):
  برای متنِ بلندتر از ۱۶هزار نویسه، بخشِ آغازین + بخش‌های مرتبط با ۶ پیامِ اخیر، **عیناً** و به ترتیبِ اصلی، با «[…]» برای جاهای حذف‌شده — نه خلاصه.
  `sortLessons.lessonSearchText` (WeakMap روی شیءِ درس) برای جستجوی لیست و جستجوی کلی.
- **[DECISION]** «بارگذاریِ فقط هنگامِ باز کردن» رد شد: جستجو، آزمون، فلش‌کارت و چت متنِ همهٔ درس‌ها را لازم دارند؛ به‌جایش پس‌زمینهٔ موازی + اولویتِ درسِ
  باز. ردشده هم: کاهشِ قطعیِ متن برای چت (خلاصه‌سازیِ دائمی — خلافِ خواستهٔ مالک).
- **[VERIFY]** vitest ‏۱۳۳/۱۳۳ (تازه: هم‌زمانی ≤۳، اولویت، دسته‌ای، ادامه پس از خطا، پیشرفت؛ گزیدهٔ چت: کوتاه بی‌تغییر، بلند: آغاز + بخشِ مرتبط عیناً،
  در بودجه، «[…]»؛ memo ِ جستجو و هش). تست‌های App (ذخیره پیش از بارگذاری نه، بی‌حلقه، ایمپورت اتمیک) با تایمرِ تازه سبز ماندند.
  **سنجیده‌نشده:** زمانِ واقعی روی production — پس از دیپلوی، کنسول باید `lesson bodies loaded: …ms` و `cloud save: … ms` را نشان دهد.
> **امضا:** `Claude Code` · 2026-11-04 · vitest ‏۱۳۳ + node + pytest + build در ship.sh

## 2026-11-04 (۱۲) — بارگذاری: کشِ محلی + یک رفت‌وبرگشت + کوچک‌ها اول

- **[OWNER]** اندازه‌گیریِ production پس از `4966cc7`: `lesson bodies loaded: 187/187 in 46956ms` و `cloud save: 3 lesson bodies + main (138KB) in 6857ms`؛
  خواسته: کمترکردنِ ۴۷ ثانیه. سپس فهرستِ A–I (نارضایتیِ مالک: «فقط درس‌ها ریخته شد، ارتقا و رفعِ نواقص نیست»). ترتیب: I → A → C+D → E → B+H → G → F.
- **[CHANGE]** `lessons/bodyCache.js` (تازه، IndexedDB، کلید `uid/key`): بدنه فقط اگر هشش با `bodyRef.hash` برابر باشد استفاده می‌شود؛ پس از هر خواندن/نوشتن به‌روز.
  `lessonBodies.read(key, known)`: شمارِ تکه‌ها از `chars` محاسبه و تکه‌ها مستقیم خوانده می‌شوند (بی‌head)، با بررسیِ هش؛ ناهم‌خوانی ⇒ مسیرِ head.
  `App.hydrateBodies`: اول کشِ محلی، بعد باقی از Firestore با هم‌زمانیِ ۱۲، کوچک‌ترها اول (درسِ باز همیشه اول)؛ لاگِ `lesson bodies: N from this browser, M from the cloud`.
- **[DECISION]** کشِ خودِ Firestore (`persistentLocalCache`) رد شد: کلِ SDK و چندتبی را عوض می‌کند؛ کشِ جدا فقط برای بدنه‌ها و با هش امن‌تر است.
  حریم: مثلِ پشتیبانِ localStorage ِ موجود روی همین مرورگر می‌ماند (OPEN: پاک‌کردن هنگامِ خروج در دستگاهِ مشترک — تصمیمِ مالک).
- **[VERIFY]** vitest ‏۱۳۴ (تازه: مسیرِ سریع ۲ خواندن به‌جای ۳ و بی‌head، بازگشت به head با مرجعِ کهنه). انتظار: ورودِ اول ~نصف، ورودهای بعد چند ثانیه — با
  لاگ‌های کنسول در production بسنجید.
> **امضا:** `Claude Code` · 2026-11-04 · vitest ‏۱۳۴ + node + pytest + build در ship.sh

## 2026-11-04 (۱۳) — A: باگ‌های needs.docx (نه مورد)

- **[OWNER]** فهرستِ A: قفلِ ضبط در چت؛ ویدیوی چت خودکار پخش نشود و فقط یکی هم‌زمان؛ حذف/دانلودِ فایل‌های درس؛ تحلیلِ pdf/صوت/عکس/لینکِ یوتیوب؛
  صفحهٔ سفیدِ آزمون در اجرای دوم؛ ویرایش/حذفِ تب‌ها و آیتم‌های مرکزِ دانش؛ صفحهٔ به‌هم‌ریختهٔ ویرایشِ نکات؛ پرت‌شدنِ ناخواسته به ورود؛ صدای استاد در
  مکالماتِ بایگانی‌شده. شرط: هیچ قابلیتِ موجودی نشکند.
- **[FINDING][ROOT CAUSE] ضبط:** پس از توقفِ ضبط، حالتِ «ارسال به‌صورتِ متن» دوباره SpeechRecognition را روشن می‌کرد (میکروفون باز می‌ماند و ضبط دور
  ریخته می‌شد)؛ و هنگامِ پاسخ‌دادنِ استاد، کلیک بی‌صدا نادیده گرفته می‌شد ⇒ «قفل». **[CHANGE]** ضبط همیشه به‌صورتِ صوت فرستاده می‌شود، پیامِ «کمی صبر کنید»،
  توقفِ ایمنیِ ۳ دقیقه‌ای، بستنِ trackها حتی وقتی recorder غیرفعال است.
- **[FINDING] ویدیو/صوت:** هیچ `autoPlay` ِ ویدیو نبود؛ پخشِ هم‌زمان از چند عنصر بود. **[CHANGE]** `utils/singleMedia.js`: با شروعِ هر media بقیه pause؛
  ویدیوی درس `preload="metadata" playsInline`.
- **[CHANGE] فایل‌های درس:** دکمهٔ دانلود (`/raw` با توکن) و حذف با تأیید؛ برای فایلِ ذخیره‌شده `/remove` (بایت‌ها روی سرور می‌مانند — قاعدهٔ «بی‌حذف»).
- **[FINDING] تحلیل:** PDF ِ اسکن‌شده متنِ خالی به Gemini می‌داد (پاسخِ بی‌ربط)؛ فایلِ صوت/عکسِ گوشی با نوعِ خالی یا `octet-stream` رد می‌شد؛ لینکِ یوتیوب
  اصلاً پشتیبانی نمی‌شد؛ پاسخِ HTML ِ خطای 502/timeout در فرانت «Unexpected token <» نشان می‌داد. **[CHANGE]** PDF ِ بی‌لایهٔ متن خودِ فایل را به Gemini
  می‌دهد (OCR)؛ `inferMimeType` از پسوند؛ `extractYouTubeUrls` + `file_data.file_uri` (فقط ویدیوی عمومی، با پیامِ روشن)؛ پیامِ خطای فارسی بر اساسِ کدِ HTTP.
  **سنجیده‌نشده:** لاگِ Render برای خطاهای قبلیِ تحلیل خالی بود (نگهداریِ لاگ کوتاه) — علتِ دقیقِ گزارشِ مالک از لاگ تأیید نشد؛ پس از دیپلوی با یک PDF ِ اسکن‌شده،
  یک فایلِ m4a و یک لینکِ یوتیوب بسنجید.
- **[FINDING][ROOT CAUSE] آزمون:** Gemini گاهی `correctAnswer` را عدد/آرایه و گزینه را شیء برمی‌گرداند؛ `.trim()` روی عدد یا رندرِ شیء کلِ برنامه را
  می‌انداخت (ErrorBoundary ِ ریشه ⇒ صفحهٔ سفید). شناسهٔ درس‌های ایمپورتی رشته است و `parseInt` پیشرفت را ثبت نمی‌کرد. **[CHANGE]** `quiz/normalizeQuiz.js`
  (همه‌چیز رشته، پاسخِ عددی ⇒ گزینهٔ همان اندیس، آیتمِ نامعتبر حذف)؛ مقایسهٔ شناسه با `String`؛ **ErrorBoundary برای هر صفحه** با «تلاشِ دوباره» (خطای یک صفحه
  دیگر کلِ برنامه را سفید نمی‌کند و به Inspector Bridge گزارش می‌شود).
- **[CHANGE] مرکزِ دانش:** `knowledge/kb.js` + `KnowledgeCenter.jsx`: ویرایشِ کلمه/معنی/منبع، انتقال به تبِ دیگر، حذف با تأیید؛ تب: افزودن، تغییرِ نام، حذف
  فقط وقتی خالی است (تب‌های پیش‌فرض پنهان می‌شوند نه حذف)؛ برچسب‌ها در `data.kbCategories`. `KnowledgeBase` ِ قدیم قرنطینه (بی‌مصرف، باقی). جستجوها در برابرِ آیتمِ
  بی‌`term` ایمن شدند.
- **[DECISION]** حذفِ تبِ پُر رد شد (دادهٔ مالک بی‌صدا می‌رفت)؛ گزینه‌های ردشده: انتقالِ خودکار به «لغات»، حذفِ آبشاری.
- **[CHANGE] ویرایشِ نکات:** ویرایشگرِ تمام‌صفحه با پیش‌نمایشِ زنده کنارِ متن؛ `unicode-bidi: plaintext` (هر سطر جهتِ خودش)، فونتِ غیرِ monospace (اعراب و
  اتصالِ حروف درست)، شمارِ نویسه. ردشده: ویرایشگرِ WYSIWYG (وابستگیِ تازه و خطرِ تغییرِ markdown ِ موجود).
- **[FINDING][ROOT CAUSE] پرت‌شدن به ورود:** هر خطای گذرای listener ِ `accessControl` (قطعیِ شبکه، تازه‌شدنِ توکن) کاربرِ تأییدشده را به صفحهٔ «بررسیِ دسترسی»
  (با همان قابِ صفحهٔ ورود) می‌برد و دیگر برنمی‌گشت. **[CHANGE]** نشستِ تأییدشده ادامه می‌یابد و listener با backoff (۲…۳۰ ثانیه) دوباره وصل می‌شود؛ صفحهٔ خطا فقط
  برای کاربری که هنوز تأیید نشده یا پس از ۶ تلاش.
- **[FINDING][ROOT CAUSE] صدای استاد در بایگانی:** صدای پاسخ‌ها به‌صورتِ `blob:` URL ذخیره می‌شد که فقط در همان تب زنده است؛ نمایشگرِ بایگانی هم `audioData`/نوعِ پیام را
  نمی‌فرستاد و پیامِ صوتیِ بی‌متن آن را می‌انداخت. **[CHANGE]** `TTSButton`: اگر URL ِ ذخیره مرده بود، صدا از متن دوباره ساخته می‌شود (یک بار، کش در همان دکمه)؛
  دکمهٔ صدا برای همهٔ پاسخ‌های متنیِ استاد؛ نمایشگرِ بایگانی همان propsِ چتِ زنده را می‌گیرد و صدای انتخاب‌شده در تنظیمات.
- **[VERIFY]** vitest ‏۱۴۲ (تازه: normalizeQuiz، kb ۳ تست، KnowledgeCenter ویرایش/حذف/تب، «کاربرِ تأییدشده با خطای گذرا بیرون نمی‌افتد»)، node: یوتیوب و
  inferMimeType؛ build سبز. **سنجیده‌نشده در production:** ضبط روی گوشیِ واقعی، تحلیلِ واقعیِ Gemini برای PDF ِ اسکن/یوتیوب.
> **امضا:** `Claude Code` · 2026-11-04 · vitest ‏۱۴۲ + node + pytest + build در ship.sh

## 2026-11-04 (۱۴) — B: ممیزیِ بصری (دسکتاپ + موبایل + تیره)

- **[OWNER]** (Cowork) ترتیبِ تازه: B → E → F → G → H → D → I؛ هر ارسال همان لحظه اعلام شود.
- **[VERIFY]** ۱۰ صفحه × (۱۳۶۶px، ۳۹۰px) با Chromium و دادهٔ نمونه: اسکرولِ افقی ۰، خطای کنسول ۰. تصاویرِ قبل/بعد: `docs/visual-audit/`.
- **[FINDING→CHANGE]** دکمهٔ شناورِ دستیار و پنل‌های تماسِ صوتی روی نوارِ کناری ⇒ گوشهٔ چپ؛ انتخاب‌گرِ فایلِ انگلیسی ⇒ دکمهٔ فارسی؛ نکاتِ درس اول؛
  حالتِ تیره (`utils/theme.js` + لایهٔ CSS، دکمه در نوارِ کناری)؛ فاصلهٔ سطرِ متنِ درس برای اعراب.
- **[DECISION]** تیره با بازنگاشتِ کلاس‌های روشن در CSS، نه افزودنِ `dark:` به ۸۰۰۰ سطر (خطرِ شکستن و حجمِ تغییر). ردشده: `darkMode: 'class'` ِ Tailwind با
  ویرایشِ دستیِ همهٔ عناصر؛ فیلترِ `invert` (رنگِ عکس‌ها و پرچم‌ها را خراب می‌کند). دام: `[class*="from-teal-50"]` روی `from-teal-500` هم می‌خورد ⇒ `class~=`.
> **امضا:** `Claude Code` · 2026-11-04 · vitest + node + pytest + build در ship.sh؛ Chromium دسکتاپ/موبایل

## 2026-11-04 (۱۵) — E: خروجیِ درس و دوره (PDF/چاپ، Word، Anki CSV، JSON)

- **[FINDING]** موجود: فقط خروجیِ JSON ِ کلِ داده با `data:` URI (برای داده‌ی چندمگابایتی در برخی مرورگرها بی‌صدا شکست می‌خورد). خروجیِ درس/دوره، PDF، Word، Anki نبود.
- **[CHANGE]** `exports/exports.js` + `ExportMenu.jsx`: در صفحهٔ درس (همان درس) و پایینِ لیستِ درس‌ها (هر چه فیلترها نشان می‌دهند ⇒ یک دوره یا همه).
  PDF = پنجرهٔ چاپ با Vazirmatn/Noto Naskh، RTL، جدول با شکستِ صفحهٔ سالم، پس از بارگذاریِ فونت؛ Word = HTML ِ Office (`.doc`) با RTL؛ Anki = CSV ِ `;`-جدا با BOM و
  سرآیندِ `#columns` و برچسبِ درس/دسته از آیتم‌های مرکزِ دانشِ همان درس (`lessonId` یا منبعِ «درس: …»)؛ JSON = درس‌ها + دانشِ مرتبط. متنِ درس **عیناً** رندر
  می‌شود؛ اصلاحاتِ اعراب/معنا بخشِ جدا. درسِ در حالِ بارگذاری رد می‌شود (خروجیِ ناقص نه). JSON ِ کامل اکنون با Blob.
- **[DECISION]** PDF با چاپِ مرورگر نه کتابخانهٔ PDF (jsPDF/pdfmake شکل‌دهیِ عربی و اعراب را خراب می‌کنند و فونتِ چندمگابایتی می‌خواهند). Word با HTML نه docx-js
  (وابستگیِ سنگین؛ Word این قالب را با RTL باز می‌کند). ردشده هر دو.
- **[VERIFY]** vitest ‏۳ تستِ تازه؛ Chromium: دانلودِ Word/CSV/JSON با محتوای درست، چاپ ⇒ PDF با اعرابِ درست (`docs/visual-audit/export-print-pdf.jpg`).
  **سنجیده‌نشده:** Chromium ِ headless نامِ فایلِ فارسی را «download» گذاشت (نامِ لاتین درست بود) — در Chrome ِ واقعی بسنجید؛ بازکردنِ `.doc` در Word و ایمپورت در Anki.
> **امضا:** `Claude Code` · 2026-11-04 · vitest ‏۱۴۷ + node + pytest + build در ship.sh؛ Chromium

## 2026-11-04 (۱۶) — F: تمرینِ تقلید (شادوینگ/میرور)

- **[FINDING]** چیزی مشابه نبود (فقط TTS ِ پیام‌ها و تصحیحِ تلفظِ تماسِ زنده).
- **[CHANGE]** `shadowing/shadowing.js` + `Shadowing.jsx` در صفحهٔ درس (زیرِ نکات): جمله‌های عربیِ درس **عیناً** از جدول‌ها و سطرها (تشخیصِ عربی از فارسی با اعراب و
  حروفِ خاص؛ معنیِ فارسیِ همان سطر)، یا جملهٔ دلخواه؛ «🔊 صدای استاد» (TTS، کش برای هر جمله) و «🐢 آهسته» (۰٫۷ با حفظِ زیر و بمی)؛ «🎙️ ضبطِ من» (توقفِ ایمنیِ ۲۰ ثانیه)؛
  «▶️ صدای من»؛ سنجش با Gemini (صوت + جملهٔ هدف ⇒ JSON ِ schema‌دار: امتیاز، آنچه شنید، بازخوردِ فارسی، کلمه‌های مشکل‌دار)؛ پیشرفت در `data.shadowing[lessonId]`
  (تلاش، بهترین، آخرین) و آمارِ «تمرین‌شده/مسلط/میانگین».
- **[DECISION]** سنجش با خودِ Gemini روی صوت، نه SpeechRecognition ِ مرورگر (ar-LB در اغلب مرورگرها نیست و لهجه را به فصحی برمی‌گرداند)؛ ردشده هم: مقایسهٔ موجِ صوت
  (صدای شخص را می‌سنجد نه تلفظ را).
- **[VERIFY]** vitest ‏۵ تستِ تازه (تشخیصِ عربی/فارسی، استخراج، ثبتِ تلاش، تجزیهٔ پاسخ، UI با کشِ TTS). **سنجیده‌نشده:** امتیازدهیِ واقعیِ Gemini و ضبط روی گوشی.
> **امضا:** `Claude Code` · 2026-11-04 · vitest + node + pytest + build در ship.sh

## 2026-11-04 (۱۷) — G: پخشِ صوت/ویدیوی درس

- **[FINDING]** فایل‌های صوت/ویدیوی درس فقط نام داشتند (پخش نمی‌شدند)؛ فقط «رسانه‌های استخراج‌شده» (تصویر/صوتِ کوچکِ base64) پخش می‌شد. CSP هر iframe ِ بیرونی و
  media ِ https را می‌بست.
- **[CHANGE]** `media/LessonMedia.jsx` + `mediaLinks.js` در صفحهٔ درس: فایل‌های صوت/ویدیوی ذخیره‌شده (آپلودِ هوشمند) با «▶️ پخش» (دریافت با توکن از `/raw`، بی‌پخشِ خودکار)؛
  افزودنِ لینک (یوتیوب ⇒ youtube-nocookie، فایلِ گوگل‌درایو ⇒ پخش‌کنندهٔ `/preview`، صوت/ویدیوی مستقیمِ https) در `lesson.mediaLinks` با عنوان، برداشتن با تأیید.
  CSP: `frame-src` + youtube-nocookie و drive.google.com؛ `media-src` + `https:` (تستِ node).
- **[DECISION]** درایو فعلاً با لینکِ هر فایل (پخش‌کنندهٔ خودِ گوگل با حسابِ بیننده)، نه OAuth ِ برنامه — OAuth منتظرِ ساختِ کلاینت توسطِ مالک است (`docs/drive-plan.md`).
  ردشده: پراکسیِ فایلِ درایو از سرور (حسابِ سرویس به درایوِ شخصیِ مالک دسترسی ندارد)؛ پذیرشِ هر URL در iframe (خطرِ فیشینگ).
- **[VERIFY]** vitest (لینک‌ها: یوتیوب/درایو/مستقیم/ردِ http و javascript:؛ UI: افزودن، رد، پخشِ فایلِ ذخیره‌شده)، node ِ CSP، Chromium: iframe ساخته شد و خطای CSP صفر.
> **امضا:** `Claude Code` · 2026-11-04 · vitest + node + pytest + build در ship.sh؛ Chromium

## 2026-11-04 (۱۸) — H: قالب‌های ناقص (مرکزِ پیشرفت، فرهنگِ لبنان)

- **[FINDING]** «فرهنگِ لبنان» تا کلیک و پاسخِ Gemini خالی بود و پاسخ هم با ترکِ صفحه از دست می‌رفت. «مرکزِ پیشرفت» فقط چند عددِ کلی و نمودارِ ۷ روزهٔ ژورنال داشت؛
  برنامهٔ مطالعه با ترکِ صفحه پاک می‌شد؛ با تبِ بی‌آرایه (`knowledgeBase.vocabulary` نبود) می‌افتاد.
- **[CHANGE]** `culture/cultureGuide.js`: برای ۸ دسته خلاصهٔ فارسی، «انجام دهید/ندهید» و عبارت‌های رایجِ لبنانی با معنی (صدا + «➕ به مرکزِ دانش»)، همیشه و بی‌اینترنت؛
  پاسخِ AI ِ هر موضوع در `data.culturalInsights` ذخیره و دوباره نشان داده می‌شود (دکمهٔ «↻ توضیحِ تازه»). `progress/progress.js` + `ProgressInsights.jsx` بالای «نمای کلی»:
  شمارِ دانش، روزهای فعالِ ۳۰ روز، تقلیدِ تمرین‌شده/مسلط، نمودارِ ۳۰ روزه (ژورنال + تلاش‌های تقلید)، جدولِ پیشرفتِ هر دوره، دانش به تفکیکِ تب (با تب‌های سفارشی)،
  «درس‌های کمتر تمرین‌شده» با لینک. برنامهٔ مطالعه در `data.studyPlan` می‌ماند. شمارش‌ها در برابرِ تبِ غایب ایمن.
- **[DECISION]** راهنمای فرهنگی آماده (نوشتهٔ Claude از دانشِ عمومی — **بازبینیِ مالک پیشنهاد می‌شود**، روی صفحه هم گفته شده) + AI ِ اختیاری؛ ردشده: فقط AI (صفحهٔ خالی و
  هزینهٔ هر بار)، تولیدِ دسته‌جمعیِ AI و ذخیره بی‌بازبینی.
- **[VERIFY]** vitest ‏۱۵۸ (گزارشِ پیشرفت، راهنمای فرهنگی کامل، کش)؛ Chromium دسکتاپ/موبایل بی‌خطای کنسول؛ تصاویر در `docs/visual-audit/afterH-*`.
> **امضا:** `Claude Code` · 2026-11-04 · vitest ‏۱۵۸ + node + pytest + build در ship.sh؛ Chromium

## 2026-11-04 (۱۹) — D: بازبینیِ مرکزِ دانش + فلش‌کارت و آزمون از همان آیتم‌ها

- **[OWNER]** (Cowork) ۱۲۴۵ آیتمِ تازه وارد شده؛ کیفیت/تکراری/دسته‌بندی بازبینی شود و فلش‌کارت/آزمون از آن‌ها ساخته شود.
- **[FINDING]** خواندنِ مستقیمِ Firestore ِ production از این نشست مجاز نیست (پیش‌تر رد شد) ⇒ بازبینی به‌صورتِ ابزارِ داخلِ برنامه ساخته شد که روی دادهٔ خودِ مالک کار
  می‌کند؛ هیچ تغییری خودکار اعمال نمی‌شود.
- **[CHANGE]** `knowledge/review.js` + `practice.js` + `KbTools.jsx`، چهار حالت در مرکزِ دانش: «📋 فهرست | 🩺 بازبینی | 🃏 فلش‌کارت | ❓ آزمونِ سریع».
  بازبینی: تکراری‌ها در همهٔ تب‌ها (بی‌اعراب، یکسانیِ ا/أ/إ، ي/ى/ی، ك/ک، ة/ه)، «ادغام» یا «ادغامِ همه» (معنی‌ها و منبع‌ها و lessonIdها نگه داشته می‌شوند، حذف‌شده‌ها
  در `data.kbMergeLog` ⇒ «↩ برگرداندن»)؛ کیفیت: بی‌معنی، بی‌عبارت، عبارتِ غیرعربی، معنیِ غیرفارسی، بیش از حد بلند، معنی = عبارت؛ پیشنهادِ تب (لغتِ ۳+ کلمه ⇒ اصطلاحات،
  اصطلاحِ تک‌کلمه ⇒ لغات) با دکمهٔ انتقال. فلش‌کارت: لایتنر ۵ جعبه (۱/۳/۷/۱۶/۳۵ روز) در `data.kbReview`، فیلترِ تب، «آموخته = جعبهٔ ۳+». آزمونِ سریع: ۱۰ سؤالِ
  چهارگزینه‌ای بی‌AI، گزینه‌های غلط از همان تب، ثبت در ژورنال.
- **[DECISION]** ادغامِ دستی/دسته‌ای با برگشت، نه حذفِ خودکارِ تکراری‌ها (قاعدهٔ «دادهٔ موجود مقدس»)؛ آزمون/فلش‌کارتِ محلی نه AI (سریع، رایگان، بی‌خطای JSON).
  ردشده: dedup هنگامِ ایمپورت (دادهٔ واردشده دست نمی‌خورد)، تشخیصِ دسته با AI (هزینه و خطا روی ۱۲۴۵ مورد).
- **[VERIFY]** vitest ‏۱۳ تست (نرمال‌سازی، تکراری، کیفیت، ادغام و برگشت، لایتنر، آزمون، UI)؛ Chromium با ۱۳۰۰ آیتم: بازبینی ۲۵۵ms، فلش‌کارت ۹۵ms، بی‌خطا.
  **سنجیده‌نشده:** شمارِ واقعیِ تکراری‌های ۱۲۴۵ آیتمِ مالک (فقط در مرورگرِ مالک دیده می‌شود: مرکزِ دانش ← 🩺 بازبینی).
> **امضا:** `Claude Code` · 2026-11-04 · vitest + node + pytest + build در ship.sh؛ Chromium

## 2026-11-04 (۲۰) — C: ورودِ دستیِ «اصلاحات و هشدارهای اعراب/معنا» برای هر درس

- **[FINDING]** بخشِ اصلاحات فقط یافته‌های آپلودِ هوشمند را نشان می‌داد و فقط وقتی موردی بود؛ هماهنگ‌کننده/ناظر راهی برای ثبتِ یافتهٔ بازبینی نداشت.
- **[CHANGE]** `CorrectionsPanel` (lessons/SmartUpload.jsx) همیشه در صفحهٔ درس: «➕ افزودنِ مورد» (تکهٔ دقیقِ متن، نوع: اعراب/معنا/املا/تلفظ/دیگر، مشکل، شکلِ درست)،
  بررسیِ «تکه عیناً در متن هست؟» (`verifiedQuote`)، «✓ انجام شد / ↩ باز»، فیلترِ باز/انجام‌شده/همه، حذف فقط با تأیید؛ ذخیره در `lesson.corrections` (منبع: manual، تاریخ).
  متنِ درس هرگز تغییر نمی‌کند؛ در خروجی‌های PDF/Word بخشِ جدا (ورودی ۱۵).
- **[VERIFY]** vitest ‏۱۶۷ (افزودن، بررسیِ نقل، انجام‌شده، فیلتر، حذف با تأیید).
> **امضا:** `Claude Code` · 2026-11-04 · vitest ‏۱۶۷ + node + pytest + build در ship.sh

## 2026-11-04 (۲۱) — [CORRECTION] تکراری‌های مرکزِ دانش: فقط «همان عبارت با همان اعراب و همان معنی»

- **[OWNER]** (Cowork، روی production: ۱۳۳۴ مورد، ۶۰ گروهِ تکراری، ۴۰۱ نیازمندِ بازبینی) «وصل» (رسید) و «وصّل» (رساند) و «كيفك (مرد)/كيفك (زن)» تکراری پیشنهاد شدند.
  خواسته: تشدید/اعراب یا معنای متفاوت = تکراری نیست؛ «ادغامِ همه» با تأیید و پیش‌نمایش و فقط روی موردِ مطمئن؛ برگشت‌پذیر بماند.
- **[CORRECTION]** ورودیِ (۱۹): کلیدِ تکراری اعراب و تشدید را حذف می‌کرد و معنی را نمی‌دید ⇒ فعل‌ها و صیغه‌های متفاوت یکی شمرده می‌شدند (و «ادغامِ همه» فقط یک confirm داشت).
- **[CHANGE]** `review.findDuplicates`: **مطمئن** = عبارتِ نوشته‌شده با اعراب/تشدید (`exactKey`: فقط NFC، کشیده، فاصله، ی/ي و ک/ك ِ صفحه‌کلید، نقطه‌گذاریِ پایانی) **و** معنیِ یکسان.
  `findSimilar` (تازه): هم‌حروف بی‌اعراب ولی متفاوت ⇒ بخشِ «👀 شبیه ولی متفاوت» فقط برای دیدن، **بی‌دکمهٔ ادغام**. «پیش‌نمایشِ ادغامِ همه» فهرستِ کاملِ گروه‌ها و شمارِ موردهای
  برداشتنی را نشان می‌دهد و فقط با «تأیید و ادغام» اعمال می‌شود؛ ادغام معنی‌های هم‌ارز را تکرار نمی‌کند؛ «↩ برگرداندن» مثلِ قبل.
- **[VERIFY]** vitest: وصل/وصّل و كيفك (مرد)/(زن) تکراری نیستند و در «شبیه» می‌آیند؛ «بَيْت/بَيْت » با «خانه/خانه.» تکراری است؛ ی/ي یکی؛ پیش از تأیید هیچ تغییری؛ برگشت کامل.
> **امضا:** `Claude Code` · 2026-11-04 · vitest + node + pytest + build در ship.sh

## 2026-11-04 (۲۲) — آزمونِ درسِ واقعی (Chromium) + سه باگِ واقعی + آپلودِ هوشمندِ کلاس‌های بلند

- **[OWNER]** (Cowork) خروجی‌ها و شادوینگ با درسِ واقعی («صرف فعل - الخنسا»، «2 - ریتا») با Chromium، موبایل و تیره با اسکرین‌شات؛ سپس ایمپورت/تحلیلِ صوت و ویدیوی ریتا ۲۵–۲۶ با
  آپلودِ هوشمند روی production.
- **[VERIFY] دادهٔ واقعی:** «جزوه - ریتا.docx» از درایوِ مالک (جلسه‌های ۲ تا ۵، همان‌طور که تایپ شده) به‌عنوانِ «2 - ریتا»، و درسِ «صرف فعل - الخنسا» با جدولِ صرفِ حبّ و ویدیوی
  «حب.mp4» از پوشهٔ درایوِ «صرف فعل» — روی سرورِ محلی (۱۳۶۶px، ۳۹۰px، ۳۹۰px تیره): اسکرولِ افقی ۰، خطای کنسول ۰؛ Word/JSON متنِ کامل + بخشِ اصلاحات، PDF ۱۴۷KB با اعراب درست؛
  آپلودِ یک mp3 ⇒ اصلِ فایل ذخیره و در «صوت و ویدیوی درس» پخش شد (مدت ۲s خوانده شد)؛ iframe ِ درایو `/preview`. تصاویر: `docs/visual-audit/real-*.jpg`.
- **[FINDING][ROOT CAUSE ۱] شادوینگ روی جزوهٔ واقعی فقط ۴ جمله از ~۲۵ می‌یافت:** جزوه لبنانی را با **صفحه‌کلیدِ فارسی** (ی، ک) می‌نویسد و تشخیص آن‌ها را «فارسی» می‌دانست.
  **[CHANGE]** `langScore`: ی/ک خنثی؛ فقط پ/چ/ژ/گ و نیم‌فاصله فارسی؛ امتیازِ کلمه‌ای (عم، بدّی، هیک، شو، ما، مش، کان، رح، ال‌… در برابرِ می‌/نمی‌، است، را، که، داره…)؛ در
  سطرِ «X = Y» / «X : Y» طرفِ لبنانی‌تر جمله و طرفِ دیگر معنی. نتیجه: **۲۳ جمله با معنیِ درست**. همین تشخیص در «بازبینیِ دانش» (پرچمِ «عبارت عربی نیست») هم به کار می‌رود ⇒ پرچم‌های
  غلط کمتر می‌شوند (۴۰۱ موردِ گزارش‌شده احتمالاً کم می‌شود — سنجیده‌نشده روی دادهٔ مالک).
- **[FINDING][ROOT CAUSE ۲] آپلودِ هوشمند:** اگر رونویسی شکست می‌خورد، اصلِ فایل روی سرور ذخیره می‌شد ولی **به درس وصل نمی‌شد** (دکمهٔ «افزودن» فقط با متن) ⇒ پخش/دانلود ممکن نبود.
  **[CHANGE]** اصلِ فایل‌ها بلافاصله به درس وصل می‌شوند؛ «افزودن به جزوه» فقط متن و اصلاحات را می‌افزاید و `appliedExtracts` را ثبت می‌کند.
- **[FINDING][ROOT CAUSE ۳] کلاسِ بلند (۲۵–۲۶):** (الف) استخراج در همان درخواستِ HTTP و چند دقیقه طول می‌کشد؛ با بستنِ تب یا قطعِ شبکه، متن فقط در پاسخ بود و **از دست می‌رفت**؛
  (ب) فقط `parts[0]` ِ پاسخِ Gemini خوانده می‌شد و `finishReason` دیده نمی‌شد ⇒ رونویسیِ بریده (MAX_TOKENS) کامل نمایش داده می‌شد؛ «thinking» ِ پیش‌فرضِ 2.5 Flash بودجهٔ خروجی را می‌خورد.
  **[CHANGE]** سرور اول اصلِ فایل را ذخیره می‌کند، بعد استخراج، و نتیجه را در `lessonfile-<id>-extract` نگه می‌دارد (`GET …/extract`)؛ آپلودِ هوشمند «📥 N فایل استخراج شده ولی به جزوه
  افزوده نشده — بازیابی» نشان می‌دهد. `candidateText` همهٔ بخش‌ها را می‌خواند (بی thought)؛ رونویسی با `maxOutputTokens: 65536` و `thinkingBudget: 0`؛ MAX_TOKENS ⇒ هشدارِ «انتها ممکن است بریده
  باشد؛ به بخش‌های ~۲۰ دقیقه تقسیم کنید». `/raw` نوعِ واقعیِ صوت/ویدیو را می‌فرستد (+ nosniff) تا پخش در Safari هم کار کند. حالتِ تیره: چند رنگِ متن/حاشیهٔ کم‌کنتراست.
- **[FINDING] سنجیده‌نشده روی production:** این نشست نه ورودِ گوگلِ مالک دارد نه کلیدِ Gemini (فقط روی Render) ⇒ تحلیلِ واقعیِ ۲۵/۲۶ از اینجا ممکن نیست. فایل‌های «25.MP3» (۷٫۳MB) و
  «26.mp3» (۷٫۲MB) در درایو پیدا شد ولی در پوشه‌ای با نامِ دیگر — اینکه همان ریتا ۲۵–۲۶ باشند تأیید نشد. محدودیتِ موجود: هر فایل حداکثر **۲۵MB** (ویدیوی کلاس معمولاً بزرگ‌تر ⇒ ۴۱۳ با پیامِ روشن).
- **[DECISION]** سقفِ ۲۵MB فعلاً می‌ماند (حافظهٔ Render و ذخیرهٔ تکه‌ای در Firestore)؛ ردشده: بالا بردنِ کور به ۵۰۰MB (خطرِ OOM)؛ جایگزینِ پیشنهادی: صوتِ کلاس جدا (mp3) یا لینکِ درایو برای پخش.
> **امضا:** `Claude Code` · 2026-11-04 · vitest + node ‏۷ تستِ lessonFiles + pytest + build در ship.sh؛ Chromium با دادهٔ واقعیِ درایو

## 2026-11-04 (۲۳) — [CORRECTION] «توافقِ دو رونویسی» + تقسیمِ خودکارِ صوتِ بلند

- **[OWNER]** (Cowork، production، «25 - ریتا»، تکه‌های ۱۰ دقیقه‌ای mp3): توافق ۷۳٪، ۲۶٪، ۰٪ (۱۷۵ سطرِ مشکوک)، ۰٪ (۱۶۷) در حالی که متنِ تکهٔ ۲ کاملاً درست بود
  («لازم تكتب فروضتك… ما لازم، بس للأسف لازم»). خواسته: مقایسه بی‌برچسبِ زمان و بر پایهٔ شباهتِ متن؛ فقط اختلافِ واقعی علامت بخورد؛ تقسیمِ خودکارِ صوتِ ۶۲ دقیقه‌ای؛ پس از ارسال خبر.
- **[CORRECTION][ROOT CAUSE]** ورودیِ (۱۰): `compareTranscripts` سطر‌به‌سطر بود (Dice ≥ ۰٫۸ در پنجرهٔ ۸ سطر). رونویسیِ دوم (پرامپتِ دیگر، دمای ۰٫۷) جمله‌ها را **طورِ دیگری می‌شکند/ادغام
  می‌کند** ⇒ سطرِ ادغام‌شده زیرِ ۰٫۸ و پس از چند جابه‌جایی همه‌چیز «مشکوک»؛ برچسب‌های زمانِ غیر از `[mm:ss]` (`(0:00 - 0:05)`، `00:06`، `**[00:13]**`) هم حذف نمی‌شد.
- **[CHANGE]** `verify.js`: هم‌ترازیِ **کلمه‌ای** کلِ متن (LCS در پنجره‌های ۴۰۰ کلمه‌ای، یکنوا؛ کلمهٔ هم‌ارز با یک حرف اختلاف در کلماتِ ۴+ حرفی)، شکستِ سطر و همهٔ شکل‌های برچسبِ زمان بی‌اثر؛
  توافق = سهمِ کلمه‌های رونویسیِ اول که دومی به همان ترتیب دارد؛ سطر فقط وقتی «مشکوک» که بیش از ۳۰٪ کلمه‌هایش تأیید نشود (سطرِ ۱–۳ کلمه‌ای باید کامل بخواند — آنجا یک کلمه = معنا).
- **[CHANGE]** `lessons/splitAudio.js` + آپلودِ هوشمند: فایلِ صوتیِ بزرگ‌تر از ۸MB در **مرورگر** بی‌رمزگشایی تقسیم می‌شود — MP3 دقیقاً روی مرزِ فریم (فریمِ Xing/Info که طولِ کلِ فایل را دارد حذف)،
  WAV با هدرِ تازه برای هر بخش — نام‌ها «… - بخش i از n»؛ درخواست‌ها ≤ ~۹MB، پشتِ‌سرِهم، با پیشرفت؛ نتیجهٔ هر بخش همان لحظه به درس وصل و روی سرور ماندگار. m4a/mp4/ogg ِ بزرگ‌تر از ۲۵MB:
  پیامِ «به mp3 تبدیل کنید» (بی‌رمزگشایی قابلِ تقسیمِ امن نیستند).
- **[DECISION]** تقسیم در مرورگر، نه ffmpeg روی Render (باینریِ ۷۰MB، CPU/حافظهٔ سرویس، و آپلودِ ۶۰MB یکجا که خودش مشکل است)؛ ردشده هم: رمزگشاییِ WebAudio (~۱٫۳GB PCM برای ۶۲ دقیقه روی گوشی).
- **[VERIFY]** node: موردِ واقعیِ ریتا ۲۵ (سطرشکنی و برچسب‌های زمانِ متفاوت) ⇒ ۰ مشکوک، توافق ≥ ۰٫۸۵؛ اختلافِ معنایی («قهوة/شاي») هنوز گرفته می‌شود؛ ۲۰۰۰ سطر زیرِ ۳ ثانیه. vitest: مرزِ فریم، ID3، WAV،
  نام‌گذاری، ردِ m4a، آپلودِ ۲۰MB ⇒ ۳ درخواستِ ≤۹MB. ffmpeg/ffprobe روی mp3 ِ واقعیِ ۱۸۰ ثانیه‌ای: سه بخشِ ۶۵٫۵ + ۶۵٫۵ + ۴۹٫۰ = ۱۸۰ ثانیه، صفر خطای رمزگشایی؛ WAV شش بخش، صفر خطا.
  **سنجیده‌نشده:** امتیازِ واقعیِ Gemini روی تکه‌های ۲–۳ (Cowork دوباره می‌گیرد).
> **امضا:** `Claude Code` · 2026-11-04 · node ‏۹ تستِ lessonFiles + vitest + pytest + build در ship.sh؛ ffmpeg/ffprobe

## 2026-11-04 (۲۴) — رونویسی: «حلقهٔ تکرار»، دمای پایین‌تر، تلاشِ دوباره با تکه‌های کوتاه‌تر

- **[OWNER]** (Cowork، ریتا ۲۶) تکهٔ ۱۰ دقیقه‌ای: «اماراتیه» ~۴۸۰ بار پشتِ‌سرِهم، توافق ۳٪. خواسته: ۱) تکرارِ متوالی تشخیص/حذف، ۲) دمای پایین‌تر، ۳) با توافقِ خیلی پایین
  خودکار با تکه‌های کوتاه‌تر دوباره. و تأییدِ زندهٔ رفعِ «وصل/وصّل» (f96e24d) در تبِ بازبینی.
- **[FINDING]** «حلقهٔ تکرار» خطای شناخته‌شدهٔ مدل‌های رونویسی روی صوتِ بلند/سکوت/نویز است؛ پرامپت منعش نمی‌کرد، رونویسیِ دوم دمای ۰٫۷ داشت، و هیچ پس‌پردازشی نبود ⇒ متنِ حلقه‌دار
  مستقیم به مقایسه و جزوه می‌رفت.
- **[CHANGE]** `lessonFiles/repeats.js` (تازه): ۳+ سطرِ یکسانِ پیاپی، یا عبارتِ ۱ تا ۶ کلمه‌ایِ ۵+ بار پیاپی ⇒ یک بار + نشانِ «⟲ [تکرارِ ماشینی حذف شد ×N]» (مقایسه بی‌اعراب و بی‌برچسبِ زمان؛
  «لا لا لا» ِ گفتاری می‌ماند). `pipeline.js`: هر دو رونویسی پیش از مقایسه پاک می‌شوند؛ دما: اول ۰، دوم ۰٫۲ (به‌جای ۰٫۷)؛ پرامپت‌ها: «هر کلمه فقط به تعدادی که گفته شده؛ سکوت/نویزِ طولانی یک بار
  [ناخوانا]»؛ اگر توافق < ۵۰٪ یا حلقه پیدا شد و فایل mp3/wav است ⇒ سرور (`lessonFiles/splitAudio.js` = همان الگوریتمِ مرورگر) آن را به تکه‌های ~۲٫۵MB (~۲٫۵ دقیقه) می‌برد، هر تکه دو بار
  (هم‌زمانی ۲)، متن‌ها به ترتیب وصل و دوباره مقایسه؛ **نتیجهٔ بهتر** نگه داشته و در یادداشت گزارش می‌شود (توافقِ قبل ⇒ بعد). قالب‌های غیرقابلِ‌تقسیم: فقط حذفِ حلقه + پیشنهادِ mp3.
- **[DECISION]** حذفِ حلقه با نشانِ دیدنی، نه حذفِ بی‌صدا (مالک باید بداند آنجا چیزی نامطمئن بوده)؛ ردشده: `frequencyPenalty`/`presencePenalty` ِ API (پشتیبانیِ مدل نامطمئن و خطرِ ۴۰۰)، تلاشِ دوباره
  همیشگی (هزینهٔ ۴ برابر بی‌دلیل).
- **[VERIFY]** node ‏۱۲ تستِ lessonFiles: «اماراتیه» ×۴۸۰ در یک سطر و ×۳۰ در سطرهای جدا، عبارتِ ۳ کلمه‌ایِ ×۱۲، «لا لا لا» دست‌نخورده؛ فایلِ mp3 ِ حلقه‌دار ⇒ ۴ تکه × ۲ گذر، توافق ۱، حلقه حذف، یادداشتِ 🔁؛
  m4a ⇒ حذفِ حلقه + گزارش. **سنجیده‌نشده:** رونویسیِ واقعیِ Gemini روی ریتا ۲۶. **رفعِ وصل/وصّل:** کدِ f96e24d در bundle ِ production هست؛ دیدنِ تبِ بازبینی با دادهٔ مالک از این نشست ممکن نیست (ورودِ گوگل).
> **امضا:** `Claude Code` · 2026-11-04 · node ‏۱۲ تستِ lessonFiles + vitest + pytest + build در ship.sh

## 2026-11-04 (۲۵) — مرکزِ آزمون: نمونه‌برداریِ متن با سقف، مهلت و لغو، پیش‌فرضِ «۵ درسِ اخیر»

- **[OWNER]** (Cowork) تأیید: حذفِ حلقهٔ تکرار و رفعِ «وصل/وصّل» در برنامهٔ زنده دیده شد (تکراری‌ها ۶۰ ← ۴ گروه). باگ: «ایجاد آزمون هوشمند» با ۱۹۰ درس بیش از ۴۰ ثانیه روی
  «در حال ساخت سوالات…» می‌ماند و درخواستِ /api دیده نشد. خواسته: نمونه‌برداری با سقف، مهلت و پیامِ روشن، پیش‌فرضِ چند درسِ اخیر، بررسیِ دو آزمونِ پشتِ‌سرِهم.
- **[FINDING][ROOT CAUSE]** انتخابِ چنددرسی در کد نیست: پیش‌فرض `lessons[0]` بود و **کلِ** متنِ آن درس (بی‌سقف) در systemInstruction می‌رفت؛ `callGeminiAPI` مهلت و لغو نداشت و
  با ۴۲۹ تا سه بار دوباره می‌کوشید ⇒ برای درسِ بزرگ، انتظارِ بی‌پایان. اینکه «درخواستی دیده نشد» را بازتولید نکردم (احتمالاً درخواستِ طولانی هنوز باز بود)؛ هر دو حالت اکنون مهلت دارند.
- **[CHANGE]** `quiz/quizSource.js`: `recentLessons` (۵ درسِ اخیرِ دارای محتوا بر پایهٔ updatedAt/createdAt) و `sampleLessonText` (سقفِ ~۲۴هزار نویسه، سهمِ برابر برای هر درس، اولویتِ سطرهای
  لبنانی/عربی، تصادفی ⇒ آزمونِ دوم سؤال‌های دیگر، توقفِ زود برای سرعت). `QuizCenter`: گزینهٔ پیش‌فرضِ «🕒 ۵ درسِ اخیر»، ردِ درسِ هنوز‌بارگذاری‌نشده، `AbortController` با مهلتِ ۷۵ ثانیه
  و دکمهٔ «لغو»، پیام‌های فارسیِ جدا برای مهلت/۴۰۱/۴۲۹/۵xx/پاسخِ بد.
- **[FINDING→CHANGE]** تشخیصِ لبنانی/فارسی (`langScore`): کسرهٔ پایانیِ کلمه (اضافهٔ فارسی، «توضیحِ فارسیِ») به‌اشتباه «اعرابِ عربی» شمرده می‌شد ⇒ حذف از امتیاز؛ استخراجِ جزوهٔ واقعیِ ریتا همچنان ۲۳ جمله.
- **[DECISION]** نمونه‌برداریِ محلی نه «خلاصه‌سازی با AI» (یک فراخوانِ اضافه و از دست رفتنِ متنِ عینی)؛ مهلتِ ۷۵ ثانیه (پاسخِ schema‌دارِ ۱۵ سؤال معمولاً < ۳۰ ثانیه).
- **[VERIFY]** vitest: ۱۹۰ درسِ بزرگ ⇒ زیرِ سقف، هر درس حاضر، سطرهای عربی ترجیح، دو نمونهٔ متفاوت، < ۲ ثانیه. Chromium (سرورِ محلی، پاسخِ Gemini شبیه‌سازی‌شده، ۱۹۰ درس): پیش‌فرض «۵ درسِ اخیر»،
  آزمونِ ۱ و ۲ پشتِ‌سرِهم ساخته و ثبت شدند (درخواستِ ~۲۷KB)، «لغو» بی‌درنگ برگشت، خطای صفحه ۰. **سنجیده‌نشده:** زمانِ واقعیِ Gemini روی production.
> **امضا:** `Claude Code` · 2026-11-04 · vitest + node + pytest + build در ship.sh؛ Chromium

## 2026-11-04 (۲۶) — آزمون: متنِ تمیز، تلاشِ دوباره با قالبِ ساده، مهلتِ ۴۵ ثانیه، سقفِ کمتر

- **[OWNER]** (Cowork، production، ea2f949) گیرِ بی‌پایان رفع شد؛ ولی با «۵ درسِ اخیر» (ریتا ۲۵ و ۲۶، صرف فعل، غالبون ۷۵/۷۶ — رونویسی با سطرهای «⚠️ [مشکوک]»):
  بار اول «پاسخِ مدل قابلِ استفاده نبود»، بار دوم بیش از ۴۰ ثانیه در حالِ ساخت. خواسته: حذفِ سطرهای مشکوک/ناخوانا/تکرار پیش از ارسال، تلاشِ دوباره با دمای پایین‌تر/قالبِ ساده‌تر،
  مهلتِ واقعیِ ۴۵ ثانیه، سقفِ کمترِ سؤال/ورودی؛ تست با درسِ معمولی.
- **[FINDING]** درس‌های تازه رونویسیِ صوت‌اند: نشان‌های «⚠️ [مشکوک]»، «[ناخوانا]»، «⟲»، برچسبِ زمان و سطرِ «> روش…» بخشِ بزرگی از نمونهٔ ۲۴هزار نویسه را می‌گرفتند و مدل را گیج می‌کردند؛
  «thinking» ِ پیش‌فرضِ 2.5 Flash با schema ِ ۶ نوعی و ۱۵ سؤال کند بود؛ پاسخِ JSON ِ ناقص فقط خطا می‌داد. سرور هم در `/api/gemini/chat` فقط `parts[0]` را برمی‌گرداند.
- **[CHANGE]** `quiz/quizSource.js`: `cleanLine`/`cleanForQuiz` (حذفِ سطرهای ⚠️/[مشکوک]/[ناخوانا]/⟲، متادیتای آپلود، برچسبِ زمان، سطرِ تکراری، تکرارِ کلمه) — **فقط برای ارسال به مدل**، متنِ درس
  دست نمی‌خورد؛ درسی که فقط نویز دارد «بی‌محتوا» است؛ سقفِ ورودی ۲۴هزار ← **۱۲هزار** نویسه؛ سقفِ سؤال ۱۵ ← **۱۰**. `QuizCenter`: یک مهلتِ کلِ **۴۵ ثانیه** برای همه‌چیز؛ تلاشِ ۱ با
  `thinkingBudget: 0`، `maxOutputTokens: 8192`، دمای ۰٫۴؛ اگر JSON قابلِ استفاده نبود، تلاشِ ۲ در همان مهلت: دمای ۰٫۱، فقط چهارگزینه‌ای، ≤۵ سؤال، ۸هزار نویسه؛ `parseQuizResponse`
  (JSON ِ ساده/داخلِ code fence/`{questions}`). سرور: `/api/gemini/chat` همهٔ بخش‌های متن را برمی‌گرداند (`candidateText`).
- **[DECISION]** حذفِ سطرهای مشکوک به‌جای «پاک‌کردنِ نشان و نگه‌داشتنِ متن» (سطرِ مشکوک ممکن است غلط باشد و سؤالِ غلط بسازد)؛ ردشده: مهلتِ جدا برای هر تلاش (کاربر بیش از ۴۵ ثانیه منتظر می‌ماند).
- **[VERIFY]** vitest (پاکسازی، درسِ فقط‌نویز، پارسِ JSON ِ خراب/fence/wrapped، ۱۹۰ درس < ۲ ثانیه)؛ node ‏۱۸۳. Chromium (سرورِ محلی، Gemini شبیه‌سازی: پاسخِ اول JSON ِ بریده): ۵ درسِ اخیر شاملِ جزوهٔ
  واقعیِ ریتا + دو رونویسیِ پر از ⚠️ ⇒ درخواست ~۸٫۵هزار نویسه، **بی ⚠️/[مشکوک]/⟲/برچسبِ زمان**، سطرِ ریتا حاضر، thinkingBudget 0؛ تلاشِ دوم (دمای ۰٫۱) آزمون ساخت؛ آزمونِ ۱ و ۲ پشتِ‌سرِهم؛
  پاسخِ آویزان ⇒ پیامِ «بیش از ۴۵ ثانیه» دقیقاً پس از ۴۵s؛ سقفِ سؤال ۱۰. **سنجیده‌نشده:** زمانِ واقعیِ Gemini روی production.
> **امضا:** `Claude Code` · 2026-11-04 · vitest + node ‏۱۸۳ + pytest + build در ship.sh؛ Chromium

## 2026-11-04 (۲۷) — کیفیتِ آزمون: لبنانیِ عامیانه، درس‌های جزوه‌دار اول، واژه‌نامه از مرکزِ دانش

- **[OWNER]** (Cowork) تأییدِ 884b10e روی production (دو آزمون پشتِ‌سرِهم، ثبت بی‌صفحهٔ سفید). پیشنهادِ کیفیت: سؤال‌ها بیشتر فصیح‌اند نه لبنانی؛ گزینه‌های مشکوک («مسجيز») از
  رونویسی؛ خواسته: پرامپتِ «لبنانیِ عامیانه، نوشتارِ عربی + تلفظِ لاتین/فارسی در توضیح»، ترجیحِ درس‌های جزوه‌دار (با لغت در مرکزِ دانش) بر فقط‌رونویسی، گزینه‌ها از ۱۳۳۴ آیتمِ مرکزِ دانش.
- **[CHANGE]** `quiz/quizSource.js`: `isTranscriptOnly` (بیش از ۳۰٪ سطرها برچسبِ زمان/⚠️/[ناخوانا]/⟲)، `lessonKnowledge` (lessonId/lessonIds یا منبعِ «درس: …»)، `pickQuizLessons` (از ۲۰ درسِ اخیر: جزوه‌دارها
  و درس‌های دارای آیتمِ دانش اول، فقط‌رونویسی برای پر کردن)، `glossaryFor` (تا ۶۰ «عبارت — معنی»: اول آیتم‌های همان درس‌ها، بعد تصادفی از کلِ مرکزِ دانش برای گزینه‌های غلط؛ فقط عبارتِ لبنانی)،
  سهمِ متنِ درسِ رونویسی نصفِ جزوه؛ `LEBANESE_QUIZ_RULES` (ثابت، روی پرامپت‌های قابلِ ویرایشِ مالک افزوده می‌شود): عامیانه نه فصیح (شو/بدّي/هيك/كتير)، نوشتارِ عربی، `explanation` با تلفظِ لاتین و
  توضیحِ فارسی، «هیچ کلمه‌ای نساز — فقط از متنِ درس یا واژه‌نامه»، ترجیحِ واژه‌نامه بر رونویسی. پیش‌فرضِ `quizSystem`: «لهجهٔ لبنانیِ عامیانه (نه فصیح)». پس از ثبت، «💡 توضیح» زیرِ پاسخِ صحیح.
- **[FINDING→CHANGE]** `langScore`: «مَيّ» (آب) به «می» ِ فارسی نرمال می‌شد و منفی می‌گرفت ⇒ کلمه‌ای که حروفِ فقط‌عربی (ي ك ة ى) یا اعراب دارد جریمهٔ واژهٔ فارسی نمی‌گیرد.
- **[DECISION]** گزینه‌ها با واژه‌نامه در پرامپت «زمین‌گیر» می‌شوند، نه جایگزینیِ پس‌ازپاسخِ گزینه‌ها (سؤال و گزینه‌ها باید هم‌خوان بمانند)؛ ردشده: حذفِ کاملِ درس‌های رونویسی (مالک تازه‌ترین کلاس‌ها را
  می‌خواهد تمرین کند).
- **[VERIFY]** vitest ‏۱۸۱+ (تشخیصِ رونویسی، دانشِ درس، ترتیبِ انتخاب، واژه‌نامه، سهمِ نصف، «مَيّ»). Chromium (Gemini شبیه‌سازی، ۱۳۳۴ آیتمِ دانش): ترتیبِ ارسال «صرف فعل (با آیتمِ دانش) | ۱ - ریتا (جزوه) |
  ۲۶ | ۲۵»، ۶۰ سطرِ واژه‌نامه، قواعدِ لبنانی و فیلدِ explanation در schema، توضیح پس از ثبت نمایش داده شد، دو آزمون پشتِ‌سرِهم. **سنجیده‌نشده:** کیفیتِ واقعیِ سؤال‌های Gemini (قضاوتِ مالک).
> **امضا:** `Claude Code` · 2026-11-04 · vitest + node + pytest + build در ship.sh؛ Chromium

## 2026-11-04 (۲۸) — برگهٔ فوری #2: دکمهٔ «نظارت» روی دایرهٔ دستیارِ هوش مصنوعی می‌افتاد

- **[OWNER]** برگهٔ ۲ (⚡): دکمهٔ نظارت روی دایرهٔ دستیار می‌آید.
- **[FINDING]** هر دو `fixed bottom-6 left-6` بودند (`App.jsx` دستیار، `InspectionLayer.jsx` نظارت).
- **[CHANGE]** `InspectionLayer.jsx`: کانتینرِ نظارت `left-6` ← `left-24` (کنارِ دایرهٔ دستیار).
- **[DECISION]** جابه‌جایی دکمهٔ نظارت (ابزارِ ناظر) نه دستیار؛ ردشده: بالا بردنِ نظارت (روی پنلِ دستیار bottom-24 می‌افتاد).
> **امضا:** `ناظرِ خودکار (Claude Code routine)` · 2026-11-04 · vitest + build در ship.sh

## 2026-11-04 (۲۹) — آزمون: سهم‌بندیِ درس‌ها، سؤال‌های قطعی از مرکزِ دانش، حذفِ سؤالِ ناهم‌زمان

- **[CORRECTION]** ورودیِ (۱۴): انتقالِ دکمهٔ دستیار به `left-6` با دکمهٔ «نظارت» هم‌پوشانی داشت — ناظرِ خودکار در (۲۸) دکمهٔ نظارت را به `left-24` برد (پذیرفته؛ این ادغام آن را نگه می‌دارد).
- **[OWNER]** (Cowork، e35c4da روی production: ۳۵ ثانیه، لبنانی) هر ۵ سؤال از «صرف فعل» بود؛ تناقض در خودِ سؤال: «فعل امر برای «تو یاد گرفتی»»، «مضارع التزامی برای «آنها آمدند»».
  خواسته: زمانِ فعل از جدولِ درس + معنیِ هم‌زمان در سؤال («امر: بیاموز»)، پخشِ سؤال بین درس‌ها/دسته‌ها، سؤالِ واژه/عبارت از مرکزِ دانش با وزنِ بیشتر.
- **[CHANGE]** `quiz/quizPlan.js` (تازه): **نیمی** از سؤال‌ها مستقیم از مرکزِ دانش و **بی‌AI** ساخته می‌شوند (معنیِ «X» چیست؟ / «Y» به لبنانی کدام است؟، گزینه‌های غلط آیتم‌های واقعیِ همان تب ⇒
  گزینهٔ ساختگی ممکن نیست؛ آیتم‌های خودِ درس‌ها اول)؛ بقیه بین درس‌های انتخاب‌شده گردشی تقسیم و سهمِ هر درس در پرامپت آمده؛ مدل ۲ سؤالِ اضافه می‌سازد؛ `isContradictory` سؤالی را که
  «امر/مضارع/التزامی/آینده» می‌خواهد ولی معنیِ فارسیِ داخلِ «…» گذشته است (…تی، …دند، شد…) حذف می‌کند؛ `mergeQuiz` سؤال‌ها را یک‌درمیان می‌چیند و سهمِ مرکزِ دانش را نگه می‌دارد؛ اگر مدل کاملاً
  شکست بخورد، آزمونِ فقط‌مرکزِ‌دانش. `LEBANESE_QUIZ_RULES`: قواعدِ سؤالِ فعل (زمان از جدول، «زمان: معنیِ هم‌زمان» در متنِ سؤال، همهٔ گزینه‌ها هم‌زمان، فیلدِ `lesson`).
- **[DECISION]** سؤالِ واژگان محلی ساخته می‌شود نه با مدل (درستیِ قطعی، سرعت، بی‌هزینه)؛ ناسازگاریِ زمان با قاعدهٔ ساده حذف می‌شود نه اصلاح (اصلاحِ ماشینیِ سؤالِ غلط خطرِ پاسخِ غلط دارد).
  ردشده: یک درخواستِ جدا به مدل برای هر درس (زمان ×N و احتمالِ گذشتن از ۴۵ ثانیه).
- **[VERIFY]** vitest ‏۱۴ (استخر، سهم‌بندی، سؤالِ دانشِ ۴ گزینهٔ یکتا در دو جهت، تناقض‌ها: دو مثالِ مالک حذف، «امر: بیاموز»/«مضارع: می‌آموزی»/«ماضی: یاد گرفتی» نگه، چینش و سهم). Chromium (Gemini شبیه‌سازی
  با همان دو سؤالِ متناقض): هر دو حذف، آزمونِ ۵ سؤالی = ۲ سؤالِ مدل + ۳ سؤالِ مرکزِ دانش یک‌درمیان، سهمِ درس‌ها در پرامپت. **سنجیده‌نشده:** کیفیتِ واقعیِ سؤال‌های Gemini.
> **امضا:** `Claude Code` · 2026-11-04 · vitest + node + pytest + build در ship.sh؛ Chromium

## 2026-11-04 (۳۰) — آزمون: نوعِ ناشناختهٔ سؤال، فهرستِ صریحِ انواع، گزینهٔ غلطِ هم‌نوع

- **[OWNER]** (Cowork، 8af29c4 روی production) سؤال‌های ۱ و ۳ با نوعِ «verb_conjugation» فقط «نوع سوال نامشخص» بی‌گزینه نشان دادند (مثلاً «صرف فعل «أخد» برای «إنتِ» در زمان ماضی؟»).
  خواسته: نوعِ ناشناخته ⇒ چهارگزینه‌ای یا حذف اگر گزینه ندارد؛ فهرستِ صریحِ انواعِ مجاز در پرامپت؛ تستِ مرورگر با type ِ نامعتبر. سؤال‌های مرکزِ دانش درست بودند ولی گزینهٔ غلط گاهی از نوعِ دیگر
  («تخم می‌گذارد» کنارِ «خداوند این خانه را…») ⇒ کلمه با کلمه، عبارت با عبارت.
- **[FINDING][ROOT CAUSE]** `normalizeQuiz` نوعِ ناشناخته را همان‌طور نگه می‌داشت و رندر به `default` («نوع سوال نامشخص») می‌رسید؛ پرامپت انواع را با نام‌های داخلی (`fillInBlank`) و نمونه‌ها را با
  نام‌های دیگر (`fill_in_blank`) می‌گفت و schema ِ `type` آزاد بود ⇒ مدل نوع می‌ساخت. مسیرِ تلاشِ دوم هم `{type:'mcq', ...q}` می‌نوشت که نوعِ ساختگیِ مدل آن را بازنویسی می‌کرد.
- **[CHANGE]** `normalizeQuiz.renderableType`: فقط `QUIZ_TYPES` (mcq، fill_in_blank، translate_to_persian، translate_to_arabic، word_order، matching)؛ نوعِ ناشناخته از **شکلش**: options ⇒ mcq، pairs ⇒ matching،
  words ⇒ word_order، وگرنه حذف؛ mcq ِ بی‌پاسخِ درست در گزینه‌ها حذف، گزینهٔ تکراری یکی. پرامپت: نام‌های واقعی + «type فقط یکی از … ؛ verb_conjugation/grammar ممنوع؛ صرفِ فعل = mcq ِ ۴ گزینه»؛
  schema: `enum` برای `type` (تلاشِ دوم `["mcq"]`، و `{...q, type:'mcq'}`). `quizPlan.pickDistractors`: گزینهٔ غلط هم‌شکلِ پاسخ (کلمه/عبارتِ کوتاه/جمله)، اول از همان تب، بعد تب‌های دیگر، آخر هر چیز.
  `scripts/e2e/quiz-invalid-types.cjs` (تازه): تستِ مرورگر با پاسخِ شبیه‌سازی‌شدهٔ مدل.
- **[VERIFY]** vitest (نگاشت/حذفِ انواعِ ناشناخته، پاسخِ بیرون از گزینه‌ها، گزینه‌های هم‌شکل و هم‌تب). Chromium (`scripts/e2e/quiz-invalid-types.cjs`): verb_conjugation ِ گزینه‌دار ⇒ چهارگزینه‌ای، سه سؤالِ
  بی‌شکل/بی‌پاسخ حذف، «نوع سوال نامشخص» ۰، همهٔ سؤال‌ها ۴ گزینه، دو آزمون پشتِ‌سرِهم ⇒ OK. **سنجیده‌نشده:** پاسخِ واقعیِ Gemini با enum.
> **امضا:** `Claude Code` · 2026-11-04 · vitest + node + pytest + build در ship.sh؛ Chromium

## 2026-11-04 (۳۱) — ظرفیتِ سندِ اصلی: دانش، چت، ژورنال… در سندهای جدا + نشانگرِ درصد

- **[OWNER]** (Cowork) پس از ایمپورت‌ها سندِ اصلی ~۸۲۳KB از ۱۰۲۴KB (۱۳۳۴+ آیتمِ دانش، چت و بقیه درون‌خطی). خواسته: انتقالِ knowledgeBase و تاریخچهٔ چت/ژورنال به زیرمجموعه مثلِ lessonBodies
  با مهاجرتِ امن و بی‌از‌دست‌رفتن، و نشانگرِ درصد در پنلِ ادمین با هشدار از ۸۰٪.
- **[CHANGE]** `lessons/sections.js` (تازه): ۱۰ بخش (knowledgeBase، chatHistories، archivedConversations، journal، pronunciationCorrections، culturalInsights، kbReview، kbMergeLog، shadowing، studyPlan)
  به‌صورتِ JSON ِ پایدار در `users/{uid}/lessonBodies/S_<name>` (+ تکه‌ها؛ همان سازوکار و قوانینِ بدنهٔ درس)؛ سندِ اصلی فقط `sectionRefs {key, chars, hash}`. `toCloudDoc` بخش‌ها را برمی‌دارد؛
  `persistCloud` بخش‌های عوض‌شده را با بدنه‌ها و سندِ اصلی در **همان batch ِ اتمیک** می‌نویسد (memo روی هویتِ شیء ⇒ بی‌stringify ِ تکراری). بارگذاری: از حافظه/IndexedDB اگر هش بخواند، وگرنه
  `_sectionsPending` و دریافت؛ **بخشِ pending هرگز نوشته نمی‌شود** (نشانیِ ذخیره‌شده‌اش می‌ماند)؛ رسیدنِ بخش = `mergeSection` (اجتماعِ آرایه‌ها با id، دانش تب‌به‌تب، نقشه‌ها کلید به کلید) با هر چه
  در حافظه یا درون‌خطی (تبِ قدیمیِ باز) بود؛ خطای بارگذاری ⇒ نوارِ قرمز و بی‌ذخیره. **مهاجرتِ خودکار**: سندِ قدیمی با بخش‌های درون‌خطی ⇒ اول نسخهٔ پشتیبانِ کامل در
  `data/premigration-sections-v1`، سپس یک ذخیرهٔ اتمیک (بخش‌ها + سندِ اصلیِ بی‌آن‌ها). `migrateFromOldPath` (تنظیمات) دیگر مستقیم `setDoc(main, …, merge)` نمی‌کند (همه‌چیز را دوباره درون‌خطی
  می‌کرد) — ذخیرهٔ عادی می‌نویسد. `DocCapacity.jsx` در «مدیریتِ کاربران»: درصد و KB ِ سندِ اصلی، هشدارِ کهربایی از ۸۰٪ و قرمز از ۹۵٪، ۵ بخشِ بزرگ و اندازهٔ بخش‌های جدا.
- **[DECISION]** همان کالکشنِ `lessonBodies` با پیشوندِ `S_` (قوانین و کدِ تکه/هش/batch ِ آزموده، بی‌قانونِ تازه)؛ ردشده: یک سند برای هر آیتمِ دانش (۱۳۳۴ نوشتن در مهاجرت و خواندنِ گران)، فشرده‌سازی
  (سقف را فقط عقب می‌اندازد)، Cloud Storage (قوانین/دسترسیِ جدا). درس‌ها (فهرست، بی‌متن) فعلاً در سندِ اصلی می‌مانند.
- **[VERIFY]** vitest ‏۱۹۵: واحد (نشانی به‌جای بخش، pending نشانی را نگه می‌دارد، فقط بخش‌های عوض‌شده نوشته می‌شوند، ادغامِ بی‌اتلاف، تشخیصِ سندِ قدیمی، اندازه ۵۰KB+ ⇒ <۲KB)؛ App ِ واقعی با SDK ِ
  شبیه‌سازی: سندِ قدیمی با ۱۳۳۴ آیتم ⇒ پشتیبانِ کامل **پیش از** batch، سندِ اصلی بی‌دانش/ژورنال و <۵KB، متنِ بخش‌ها کامل؛ بخشِ در حالِ بارگذاری ⇒ هیچ نوشتنی روی `S_knowledgeBase` و نشانی دست‌نخورده،
  پس از رسیدن ۱۳۳۴ در داشبورد و بی‌بازنویسی؛ تستِ ایمپورتِ اتمیک به شکلِ تازه (چت در `S_chatHistories` در همان batch). **سنجیده‌نشده:** مهاجرتِ واقعیِ سندِ ۸۲۳KB ِ مالک روی production (پس از
  اولین ورود؛ لاگ: `sections migration: backup copy…` و `cloud save: … sections`).
> **امضا:** `Claude Code` · 2026-11-04 · vitest ‏۱۹۵ + node + pytest + build در ship.sh

## 2026-11-04 (۳۲) — برگهٔ فوریِ #3: کادرِ نظارت مختصات، اسکرین‌شات و محیط را ثبت/نشان بدهد

- **[OWNER]** برگهٔ ۳ (درخواستِ عمومی، ⚡): وقتی روی همین «نظارت و سرکشی» کادر می‌کشد و ثبت می‌کند، فرم مختصات و اسکرین و چیزهای دیگر را (مثلِ پروژه‌های الگو) نشان نمی‌دهد/ثبت نمی‌کند.
- **[FINDING]** مختصات (`geometry`) ثبت می‌شد ولی نه در فرم و نه در کارتابل دیده می‌شد؛ تصویر فقط اگر کاربر دستی Ctrl+V می‌کرد ثبت می‌شد؛ هیچ اطلاعاتِ محیط (URL، پنجره، dpr، تم، مرورگر) نبود.
- **[CHANGE]** `frontend/src/inspection/capture.js` (تازه): `captureEnv`، `describeGeometry`، `captureViewportShot` (html2canvas ِ ۱.۴.۱ با import ِ تنبل؛ رابطِ نظارت را حذف و کادر را نارنجی روی عکس می‌کشد؛ هرگز throw نمی‌کند). فرم: پنلِ «📐 مختصات و محیط» + پیش‌نمایشِ اسکرین‌شاتِ خودکار با «حذف»؛ اگر عکسِ دستی چسبانده شود آن اولویت دارد. کارتابل همان مختصات/محیط را زیرِ هر برگه نشان می‌دهد. بک‌اند: فیلدِ `env` (JSON کران‌دار، ≤۳KB) ذخیره می‌شود؛ `inspection.py pull` آن را در QUEUE می‌نویسد.
- **[DECISION]** html2canvas (DOM→canvas بی‌اجازهٔ کاربر)؛ ردشده: `getDisplayMedia` (هر بار پنجرهٔ اجازه، موبایل پشتیبانی ندارد)، فقط مختصات (وضعِ قبل).
- **[VERIFY]** vitest تازه برای capture. **سنجیده‌نشده:** کیفیتِ اسکرین‌شات روی production (SVGهای پیچیده/عکسِ cross-origin ممکن است ناقص رندر شوند) — پس از دیپلوی سنجیده و جواب زیرِ برگه ثبت می‌شود.
> **امضا:** `ناظرِ خودکار (Claude Code routine)` · 2026-11-04 · vitest + node + pytest + build در ship.sh

## 2026-11-04 (۳۳) — [CORRECTION] سندِ اصلی هنوز ۵۵٪: متنِ درس‌های زیرِ ۲۰هزار نویسه درون‌خطی بود

- **[OWNER]** (Cowork) مهاجرتِ (۳۱) در حسابِ ادمین انجام شد (دانش ۲۱۱KB، ۱۳۳۴ آیتم، گفت‌وگو ۴۱KB، ژورنال جدا)، ولی نشانگر ۵۶۶KB (۵۵٪) و «درس‌ها (بی‌متن)» = ۵۶۵KB (~۳KB هر درس).
  خواسته: بیرون بردنِ هر چه در شیءِ درس مانده یا فشرده‌سازی تا ۳۰۰ درس جا شود، و توضیحِ «۴٪ ِ مالک» در برابرِ «۵۵٪».
- **[CORRECTION][ROOT CAUSE]** ورودیِ (۷)/(۳۱): ایمپورت متنِ درس را فقط وقتی **بلندتر از ۲۰هزار نویسه** بود بیرون می‌برد (`EXTERNALIZE_CHARS`) و درس‌های ساخته/ویرایش‌شده در برنامه هرگز؛ پس ۱۹۰ درسِ
  چندهزارنویسه‌ای متنشان درون‌خطی ماند ⇒ ~۵۶۵KB. عددِ «چند درصد» در گزارشِ (۳۱) **برآوردِ من** بود با این فرضِ غلط که همهٔ متن‌ها بیرون‌اند — اندازه‌گیری نبود؛ حسابِ ادمین همان حسابِ مالک است و ۵۵٪
  عددِ واقعی بود.
- **[CHANGE]** `lessonBodies.effectiveBodyRef`: **هر** متنِ درسِ بلندتر از ۱۰۰۰ نویسه (`INLINE_NOTES_MAX`) سندِ خودش را می‌گیرد (`L<id>`، همان تکه/هش/batch)، با اولین ذخیره؛ `bodiesToWrite` درس‌های
  تازه‌بیرون‌رفته را هم می‌نویسد. فیلدهای سنگینِ هر درس (`pendingAnalysis`، `corrections`، `mediaItems` — تصویرِ base64 —، `sources`) به بخشِ مجازیِ `lessonExtras` (S_lessonExtras) می‌روند و پس از بارگذاری
  با `applyLessonExtras` روی درس‌ها برمی‌گردند (ویرایشِ حینِ بارگذاری نگه داشته، آرایه‌ها اجتماع). مهاجرتِ خودکار: سندِ دارای درسِ درون‌خطیِ بلند یا افزوده ⇒ پشتیبانِ کامل در `data/premigration-lessons-v1`
  و سپس ذخیره (در batch ِ اتمیک اگر ≤ ۴۵۰ نوشتن، وگرنه بدنه‌ها اول و سندِ اصلی آخر — نشانی هرگز به جای خالی). `DocCapacity`: جزئیاتِ «درس‌ها در سندِ اصلی» (جمعِ هر فیلد، ۵ درسِ بزرگ، میانگین)، اندازه‌های
  زیرِ ۱KB به بایت.
- **[DECISION]** آستانهٔ ۱۰۰۰ نویسه (متنِ کوتاه خواندنِ اضافه نمی‌ارزد)؛ ردشده: فشرده‌سازیِ فهرست (پیچیده و بی‌اثر روی متن)، انتقالِ کلِ فهرستِ درس‌ها به بخشِ جدا (فهرست برای نمایشِ اولیه لازم است؛ با ~۱۰۰ بایت هر درس
  ۳۰۰ درس ≈ ۳۰KB).
- **[VERIFY]** vitest ‏۱۹۸+: واحد (متنِ ۵۰۰۰ نویسه ⇒ بدنه، کوتاه درون‌خطی، افزوده‌ها بیرون، بازگشت و اجتماع، تشخیصِ سندِ قدیمی)؛ App ِ واقعی با SDK ِ شبیه‌سازی: ۳ درسِ درون‌خطی با اصلاحات ⇒ پشتیبان،
  سندِ اصلی < ۴KB با `archivedNotes: ''` و `bodyRef`، سپس **بارگذاریِ دوباره از همان نوشته‌ها**: متن‌ها از `L*` و اصلاحات از `S_lessonExtras` خوانده شدند و هیچ‌چیز با خالی بازنویسی نشد. Chromium (حالتِ
  محلی، ۱۹۰ درس × ~۳KB + ۱۳۳۴ آیتم): نشانگر **۲۷KB (۳٪)**، میانگینِ هر درس ۷۳ بایت؛ e2e ِ آزمون OK. **سنجیده‌نشده:** مهاجرتِ واقعیِ سندِ ۵۶۶KB روی production (پس از اولین ورود).
> **امضا:** `Claude Code` · 2026-11-04 · vitest + node + pytest + build در ship.sh؛ Chromium

## 2026-11-04 (۳۴) — استخراجِ آیتمِ دانش از متنِ درس (دقیق + Gemini ِ اعتبارسنجی‌شده)

- **[OWNER]** (Cowork) تأیید: ظرفیت ۹٪، آزمون و مهاجرت سالم، دانش ۱۳۳۴، چت سرِ جا؛ PDFهای ریتا (جلسه ۱، ۳، ۵، ۸، ۱۰، ۱۲، ۱۵) افزوده شد. خواسته: آیتم‌های دانش از جدول‌های ریتا (فعل‌ها در verbs،
  صفات در adj for human) با دستهٔ افعال/صفات؛ اگر ابزاری نیست، دکمهٔ «استخراج آیتم دانش از متن درس» با Gemini + پیش‌نمایش + حذفِ تکراری. و راهنمای ۵ قدمیِ Drive اگر کد آماده است.
- **[FINDING]** ابزارِ موجود فقط نتیجهٔ «تحلیلِ محتوا» را با Gemini دسته‌بندی می‌کرد (`addAnalyzedContentToLesson`) و فلش‌کارت ۵ لغت؛ استخراج از متنِ درس نبود. کدِ Drive فقط طرح است (`docs/drive-plan.md`).
- **[CHANGE]** `knowledge/extract.js` + `KnowledgeExtract.jsx` در صفحهٔ درس: «استخراجِ دقیق» بی‌AI از جدول‌های markdown، سطرهای tab‌دار (متنِ PDF/Excel) و «X : Y»/«X = Y» — تب از عنوان/سرستون/خطِ عنوانِ کوتاه
  (فعل/verbs/صرف ⇒ افعال، صفت/adj ⇒ صفات، ضمیر، اصطلاح، گرامر) وگرنه با طول؛ ستونِ لبنانی/فارسی با سرستون یا مقایسهٔ نسبیِ `langScore` (کلمهٔ بی‌اعرابِ «شاطر» به‌تنهایی مبهم است)؛ «+ تکمیل با Gemini»
  (تا ۳ تکهٔ ۱۲هزارنویسه‌ای از متنِ پاک‌شده، schema با enum ِ تب، بی‌thinking) و **فقط آیتمی که عیناً در متن هست** پذیرفته می‌شود؛ پیش‌نمایش با تیک/ویرایش/تب، وضعیتِ «تازه / تکراری / موجود با معنیِ دیگر»
  (تکراری‌ها بی‌تیک)؛ افزودن با `lessonId` و منبعِ «درس: …»؛ تا مرکزِ دانش بارگذاری نشده، غیرفعال. متنِ درس تغییر نمی‌کند.
- **[DECISION]** اول استخراجِ دقیق (درست، رایگان، فوری)، Gemini فقط برای تکمیل و با اعتبارسنجیِ نقل؛ ردشده: افزودنِ خودکارِ بی‌پیش‌نمایش (۱۳۳۴ آیتمِ موجود و خطرِ تکراری)، تشخیصِ تکراریِ بی‌اعراب (همان باگِ وصل/وصّل).
- **[VERIFY]** vitest ‏۱۹ در knowledge (جدول با تب از عنوان/سرستون، سطرهای جفت، tab‌دار با عنوانِ کوتاه، ردِ آیتمِ AI ِ بیرون از متن، تکراری/معنیِ دیگر، افزودن با ارجاع، انتظار برای بارگذاری). جزوهٔ واقعیِ ریتا
  (جلسه‌های ۲–۵): ۲۰ آیتم با معنیِ درست. **سنجیده‌نشده:** روی PDFهای تازهٔ ریتا در production (ساختارِ متنِ استخراج‌شدهٔ آن‌ها را ندیده‌ام).
> **امضا:** `Claude Code` · 2026-11-04 · vitest + node + pytest + build در ship.sh

## 2026-11-04 (۳۵) — استخراجِ دانش: کنار گذاشتنِ بلوکِ اصلاحات، تیکِ محافظه‌کار، جدا کردنِ «،»؛ و اتصالِ Google Drive

- **[OWNER]** (Cowork، cd22f81 روی «5 - ریتا»: ۷۰ آیتم = ۴۷ تازه، ۲۰ تکراری، ۳ معنیِ دیگر؛ تشخیصِ تکراری «عالی») ولی در تازه‌های تیک‌خورده زباله بود: (۱) ردیف‌های بخشِ «⚠️ اصلاحات و هشدارهای
  پیشنهادی» با خودِ هشدار به‌عنوانِ معنی («مِعَدتی | حرکت‌گذاری نادرست…»، «تبنل | غلط تایپی / اطمینان متوسط»)؛ (۲) جملهٔ توضیحیِ فارسی در سمتِ چپ («توصیه خانم ریتا…»، «مثالی | کمال گرا»)؛
  (۳) «مبسوط ، فرحان» و «شاکر ، محمود» به‌عنوانِ phrases؛ (۴) پیش‌فرضِ تیکِ محافظه‌کارتر. و از قبل: راهنمای ۵ قدمیِ Drive.
- **[CHANGE] استخراج** (`knowledge/extract.js`): بلوکِ «⚠️ اصلاحات/هشدار» (عنوان یا خطِ ⚠️) تا عنوانِ بعد یا `---` کنار گذاشته می‌شود؛ سطرهای ⚠️/[مشکوک]/[ناخوانا]/⟲/«اطمینان کم/متوسط» حذف؛
  عبارتِ چندکلمه‌ایِ جداشده با «،» (هر بخش ≤ ۲ کلمه) ⇒ چند آیتمِ لغت (معنی‌ها جفت‌به‌جفت اگر به همان تعداد جدا شوند)؛ `quality()`: تیکِ خودکار فقط اگر چپ لبنانی (حروفِ فقط‌عربی/اعراب/امتیازِ مثبت —
  یا ستونِ «عربی» در جدولِ سرستون‌دار برای کلمهٔ بی‌اعراب مثلِ «زعلان»)، ≤ ۶ کلمه، و راست فارسی و نه یادداشتِ اصلاح («غلط/باید/حرکت‌گذاری/اطمینان…»)؛ بقیه نمایش با «نامطمئن: علت» و **بی‌تیک**.
- **[CHANGE] Drive** (طرحِ `docs/drive-plan.md` اجرا شد): `services/drive/drive.js` + `routes/drive.js` — OAuth ِ یک‌بارهٔ مالک با scope ِ `drive.file`، state ِ HMAC‌دارِ ۱۰ دقیقه‌ای، refresh token **رمزشده با
  ENCRYPTION_KEY** در ذخیره‌سازِ ماندگار (هرگز به مرورگر نمی‌رود)، status/connect/disconnect/sync فقط مالک (`resolveActor` ⇒ owner)؛ پس از هر آپلودِ هوشمند (بعد از پاسخ، best effort) کپی در
  `زبان/درس‌ها/‹عنوانِ درس›` با آپلودِ resumable و ثبتِ `drive.link` روی فایل؛ شکستِ Drive آپلود را خراب نمی‌کند (`driveError`). `DrivePanel.jsx` در «مدیریتِ کاربران»: متغیرهای کم، اتصال، ایمیلِ وصل،
  «انتقالِ فایل‌های قبلی»، قطعِ اتصال. `render.yaml`: `GOOGLE_OAUTH_CLIENT_ID/SECRET` (بی‌مقدار). راهنمای مالک: `docs/drive-setup.md` (۵ قدم).
- **[DECISION]** Drive نسخهٔ **دوم** است (منبعِ اصلی همان دیتابیس می‌ماند)؛ ردشده: حسابِ سرویس (سهمیه ندارد — `storageQuotaExceeded`)، scope ِ کاملِ `drive` (دسترسی به همهٔ Drive ِ مالک)، کتابخانهٔ googleapis (حجم؛ REST ِ ساده کافی است).
- **[VERIFY]** vitest ‏۲۱۰ (اصلاحاتِ استخراج با همان نمونه‌های مالک: بلوکِ اصلاحات حذف، «مبسوط/فرحان» دو لغت، «شاكر/محمود» با معنیِ جفتی، «توصیه…»/«مثالی» بی‌تیک، «زعلان/تِعبان/هو حاقد علی» تیک؛ پنلِ Drive)؛
  node: ۶ تستِ Drive (state ِ امضاشده/منقضی/دست‌کاری‌شده، فقط مالک، callback ِ بد ردّ، refresh token روی دیسک رمزشده و در پاسخ نیست، کپیِ آپلود در «زبان/درس‌ها/5 - ریتا» و لینک، شکستِ Drive ⇒ آپلود ۲۰۰ و
  `driveError`، قطعِ اتصال)؛ pytest ‏۶۹. جزوهٔ واقعیِ ریتا: ۲۰ آیتم، ۱۸ تیک. **سنجیده‌نشده:** OAuth ِ واقعیِ گوگل (منتظرِ قدم‌های ۱–۴ ِ مالک).
> **امضا:** `Claude Code` · 2026-11-04 · vitest ‏۲۱۰ + node + pytest + build در ship.sh

## 2026-11-04 (۳۶) — [CORRECTION] استخراجِ دانش: بلوکِ اصلاحات به هر شکل، یادداشتِ اعراب/املا، توضیح، سقفِ ۱۵۰ نویسه، املای مشکوک

- **[OWNER]** (تستر، پس از 23a7df9 — که از 20:21 UTC زنده بود — روی «5 - ریتا») ۴۷ تیکِ پیش‌فرض، ۱۳ زباله: ردیف‌های بخشِ اصلاحات (یادداشتِ «tbnl»، اعرابِ غلط)، جمله‌های توصیهٔ تکلیفِ ریتا، نکتهٔ گرامری
  (نزل در برابرِ وطی)، و یک آیتم که کلِ متنِ جدول در آن بود. خواسته: بی‌تیکِ پیش‌فرض برای ردیف‌های زیرِ عنوانِ اصلاحات، معنی‌ای که با یادداشتِ اعراب/غلطِ تایپی شروع شود، و هر آیتمِ بلندتر از ~۱۵۰ نویسه؛
  غلطِ داده‌ای («متفاجئ = غافلگیر شده» با حرفِ غلط) دست‌نخورده ولی «مشکوک». تستر ۳۴ آیتمِ سالم را دستی افزود.
- **[CORRECTION][ROOT CAUSE]** ورودیِ (۳۵): تشخیصِ بلوکِ اصلاحات فقط شکل‌های «⚠️ … اصلاحات» یا عنوانِ `#` با عبارتِ دقیق را می‌شناخت؛ در جزوه‌های ایمپورتی عنوان شکل‌های دیگر دارد (خطِ **پررنگ**، عنوانِ
  کوتاهِ بی‌`#`، جدولی با ستون‌های «مشکل/پیشنهاد»). یادداشت فقط با «کلمه‌های یادداشت» سنجیده می‌شد، نه «شروع با» آن‌ها؛ طول و ردیفِ حاویِ `|` سقف نداشت؛ توضیحِ گرامری/توصیه شناخته نمی‌شد.
- **[CHANGE]** `knowledge/extract.js`: بلوکِ اصلاحات = هر عنوان/خطِ پررنگ/⚠️/عنوانِ کوتاهِ بی‌جداکننده با «اصلاح/هشدار/تصحیح/غلط‌نامه/خطاها/corrections» تا عنوانِ بعدیِ غیرِاصلاحی یا `---` (کاملاً کنار)؛ جدولی
  که سرستونش «مشکل/ایراد/پیشنهاد/اصلاح/نوعِ خطا/اطمینان» دارد کنار؛ آیتمِ حاویِ `|` یا بیش از ۴۵۰ نویسه حذف؛ `quality`: بیش از ۱۵۰ نویسه، معنیِ شروع‌شده با «حرکت‌گذاری/اعراب/غلط/تایپ/اشتباه/املا/اصلاح/
  پیشنهاد/نادرست/باید…»، و توضیح/توصیه («استفاده می‌شود»، «فرق»، «توصیه»، «تکلیف»…) ⇒ بی‌تیک با علت؛ `spellingDoubt`: معنیِ فارسی با حرفِ عربی (ي ك ة) ⇒ نشانِ «⚠ املای معنی مشکوک» (متن دست‌نخورده، تیک
  می‌ماند).
- **[VERIFY]** vitest ‏۲۱ در knowledge — تستِ تازه با همهٔ موردهای گزارش: عنوانِ **پررنگ** ِ «اصلاحات پیشنهادی»، جدولِ «مشکل/پیشنهاد»، «تبنل»، «مِعَدتی»، «فرق نزل با وطی…»، «توصیه خانم ریتا…»، معنیِ ۳۰۰ نویسه‌ای، جدولِ
  یک‌خطی ⇒ هیچ‌کدام تیک ندارد یا اصلاً نیست؛ «زعلان»، «مجنون»، «مِتفاجِئ»، «راسی عم یوجعنی» تیک؛ «غافلگير» (ي ِ عربی) با نشانِ مشکوک و متنِ اصلی. جزوهٔ واقعیِ ریتا همچنان ۲۰ آیتم / ۱۸ تیک.
  **سنجیده‌نشده:** متنِ واقعیِ «5 - ریتا» (به آن دسترسی ندارم) — نمونه‌ها از گزارش بازسازی شدند.
> **امضا:** `Claude Code` · 2026-11-04 · vitest + node + pytest + build در ship.sh

## 2026-11-04 (۳۷) — املای مشکوکِ «ع/غ»، لینکِ Drive کنارِ هر فایل، جدولِ صرفِ فعل

- **[OWNER]** (تستر) 9258d01 زنده و سالم (api 200، ۱۹۱ درس). [CORRECTION] غلطِ «متفاجئ» حرفِ **ع به‌جای غ** است («عافلگیر» به‌جای «غافلگیر»)، نه ي ِ عربی ⇒ قاعدهٔ ع/غ (متنِ اصلی دست‌نخورده).
  همچنان مانده: لینکِ فایلِ Drive کنارِ هر فایل در صفحهٔ درس. کم‌اولویت: درسِ ۱۵ (کتابِ افعال) فقط ۱ آیتمِ زباله می‌دهد چون جدولِ صرف پشتیبانی نمی‌شود.
- **[CHANGE]** `extract.spellingDoubt`: فهرستِ کوتاهِ واژه‌های رایجِ فارسی با «غ» (غافلگیر، غذا، غمگین، غلط، باغ، دروغ، شلوغ، لغت…) و با «ع» (عادت، عشق، عصبانی، ساعت، معنی…)؛ کلمه‌ای که با جابه‌جاییِ ع↔غ یکی
  از آن‌ها می‌شود (یا با آن شروع می‌شود، مثلِ «عافلگیرشدن») ⇒ «⚠ املای معنی مشکوک: «عافلگیر» احتمالاً «غافلگیر» (ع به‌جای غ)»؛ تیک می‌ماند، متن دست نمی‌خورد. قاعدهٔ ي/ك/ة ِ عربی هم می‌ماند.
  `lessons/useDriveLinks.js` + صفحهٔ درس: پیوندِ «☁️» (بازکردن در Drive) یا «⚠☁️» (علتِ ناکامی) کنارِ هر فایلِ ذخیره‌شده؛ چون کپی پس از پاسخِ آپلود ساخته می‌شود، فهرست ۸ ثانیه بعد دوباره خوانده می‌شود.
  جدولِ صرف: سرستونی با دست‌کم دو ستونِ زمان (ماضی/مضارع/امر/آینده/اسمِ فاعل/نهی یا past/present/imperative) ⇒ برای هر خانه یک آیتمِ «افعال»: عبارت = همان صیغه، معنی = «‹زمان› برای «‹ضمیرِ فارسی›» — ‹معنیِ فعل›»
  (ضمیر از ستونِ «ضمیر» با نگاشتِ انا ⇒ من، إنتَ ⇒ تو (مذکر)، هي ⇒ او (مؤنث)…؛ معنیِ فعل از ستونِ «فارسی/معنی» یا عنوانِ جدول: «صرفِ فعلِ حبّ (دوست داشتن)»، «خاف = ترسیدن»)؛ خانهٔ «-» رد؛ سطرهای tab‌دار هم.
- **[VERIFY]** vitest ‏۲۱۶: «عافلگیر شده»/«عافلگیرشدن»/«عذا» ⇒ ع به‌جای غ، «غادت» ⇒ غ به‌جای ع، «غافلگیر شده/عادت کردم/عصبانی/ساعت/باغ بزرگ/ناراحت» بی‌نشان، متن و تیکِ «مِتفاجِئ» دست‌نخورده؛ جدولِ صرفِ
  حبّ (markdown) و خاف (tab‌دار) ⇒ صیغه‌ها با زمان/ضمیر/معنی، همه تیک؛ پیوندهای Drive از سرور. **سنجیده‌نشده:** جدولِ واقعیِ درسِ ۱۵ (ساختارِ متنِ PDF ِ آن را ندیده‌ام).
> **امضا:** `Claude Code` · 2026-11-04 · vitest ‏۲۱۶ + node + pytest + build در ship.sh

## 2026-11-08 (۳۸) — درسِ ۱۵ (VERBS in Lebanese)، رونویسیِ دوباره با راهنمای زبان، ترتیبِ فهرستِ آزمون، شماره‌های غایب

- **[OWNER]** (تستر، 42ec533 زنده؛ سلامت/چت/آزمون OK، ۱۹۱ درس) (۱) درسِ ۱۵ جدولِ صرف ندارد؛ «VERBS in Lebanese» بلوک‌های تکراری دارد: جملهٔ عربی / حرف‌نویسی / انگلیسی / فارسی؛ استخراج فقط یک زباله
  («ymash-she» = «to walk something or» — بریده در شکستِ سطر) ⇒ پارسرِ بلوکِ ۴ سطری (یک آیتمِ جمله) و پیوستنِ سطرهای شکستهٔ «Note». (۲) رونویسیِ ضبطِ جلسهٔ ۱۵ فارسیِ ضعیف و سطرهای اول انگلیسی
  («Good. Marhaba Mahdi») ⇒ نشانه‌گذاریِ بخشِ کم‌اعتماد یا رونویسیِ دوباره با زبانِ fa/ar. (۳) در فهرستِ درسِ آزمون «21 - Rita» پس از «24 - Rita». (۴) شکافِ شماره‌ها (غالبون ۶۹، لو ۹/۲۳/۲۷) — تستر با منبع می‌سنجد.
- **[CHANGE] (۱)** `extract.exampleBlocks`: چهار سطرِ پیاپی با یک سطرِ عربی، یک فارسی و دو لاتین (حرف‌نویسی با ۲/۳/۷/خط‌تیره/واژه‌های رایج، و انگلیسی) به هر ترتیب ⇒ یک آیتمِ «اصطلاحات» (عبارت = جملهٔ عربی،
  تلفظ = حرف‌نویسی، معنی = فارسی، `english` نگه داشته و در مرکزِ دانش ذخیره)؛ سه سطرِ بی‌عربی ⇒ نمایش بی‌تیک؛ «Note/نکته/توجه» با سطرهای ادامه‌اش یکی و از استخراج کنار؛ عبارتِ سطرِ «X = Y» باید حروفِ
  عربی داشته باشد (دیگر «ymash-she» آیتم نمی‌شود).
- **[CHANGE] (۲)** `pipeline`: هر دو رونویسی با راهنمای زبان («عمدتاً عربیِ لبنانی و فارسی؛ عربی با حروفِ عربی، فارسی با حروفِ فارسی، هرگز لاتین؛ فقط انگلیسیِ واقعی به انگلیسی»)؛ `flagLatinLines`: در رونویسیِ
  عمدتاً عربی‌خط، سطرِ لاتینِ ۲+ کلمه‌ای ⇒ مشکوک + یادداشت (ضبطِ انگلیسی‌زبان دست نمی‌خورد). `POST /api/lesson-files/:lessonId/:fileId/reextract` + دکمهٔ «🔁» کنارِ صوت/ویدیو/عکسِ ذخیره‌شده:
  رونویسیِ دوباره، ذخیره به‌عنوانِ استخراجِ تازهٔ فایل (`extractVersion`)، و پیشنهاد در «بازیابی و پیش‌نمایش» (افزودنی؛ متنِ فعلی دست نمی‌خورد). قاعدهٔ «legacy» ِ بازیابی فقط وقتی `appliedExtracts` اصلاً تعریف نشده.
- **[CHANGE] (۳/۴)** `sortLessons`: `courseOf` یکسان‌سازِ ي/ی، ك/ک، اعراب، نیم‌فاصله؛ شمارهٔ درس = `order` یا عددِ آغازِ عنوان (حتی وقتی فقط یکی `order` دارد)؛ فهرستِ درسِ مرکزِ آزمون با `compareLessons`؛
  `courseGaps` ⇒ «⚠ شماره‌های غایب در «‹دوره›»» زیرِ لیستِ درس‌ها وقتی دوره‌ای فیلتر شده.
- **[VERIFY]** vitest ‏۲۲۰ (بلوک‌های ۴ سطری با Note ِ شکسته، بلوکِ بی‌عربی بی‌تیک، `english` در دانش؛ ترتیبِ «3 ⇒ 21 (ي ِ عربی) ⇒ 24 (order)»؛ شکاف‌ها)؛ node ‏۱۴ تستِ lessonFiles (سطرِ لاتین در گفتارِ عربی مشکوک،
  ضبطِ انگلیسی نه، راهنمای زبان، رونویسیِ دوباره نسخه ۲ و ۴۰۴ برای درسِ دیگر)؛ جزوهٔ واقعیِ ریتا همچنان ۲۰/۱۸. **سنجیده‌نشده:** متنِ واقعیِ درسِ ۱۵ و کیفیتِ رونویسیِ دوبارهٔ Gemini روی production.
> **امضا:** `Claude Code` · 2026-11-08 · vitest ‏۲۲۰ + node + pytest + build در ship.sh

## 2026-11-08 (۳۹) — [CORRECTION] شماره‌های غایب، و بلوک‌های درسِ ۱۵ (زمان‌نما، انگلیسیِ شکسته، مذکر/مؤنث، بلوکِ بی‌عربی)

- **[OWNER]** (تستر، d7fa53f زنده) (۳) ترتیبِ فهرستِ آزمون درست شد (۱..۲۶ ریتا). باگ‌ها: (A) «شماره‌های غایب» برای «مسلسل لو» **همهٔ** شماره‌ها را نشان می‌داد؛ باید فقط ۹، ۲۳، ۲۷ (عنوان‌ها «مسلسل لو - قسمت N»؛
  عددِ پس از «قسمت»، فقط درونِ کمینه..بیشینهٔ موجود). (B) درسِ ۱۵ ⇒ ۶۷ آیتم با زباله: سطرهای زمان‌دار («[3:15] كسره بري»، «[3:19] i»)؛ انگلیسیِ شکسته در دو سطر («She drinks coffee in the / morning.») بلوک را
  جابه‌جا می‌کرد (عبارتِ «)مونث(» یا «قهوه» با معنیِ انگلیسی)، «(مذکر)/(مؤنث)» عبارت می‌شد؛ آیتم‌های بی‌عربی («(Ana)»، «tisma3/tisma3e?»، «musii2a.»).
- **[CORRECTION][ROOT CAUSE] (A)** ورودیِ (۳۸): `lessonNumber` اول `order` (شمارهٔ ترتیبِ ایمپورت، نه شمارهٔ قسمت) را می‌گرفت و «قسمت N» را نمی‌شناخت؛ شکاف از ۱ تا بیشینه حساب می‌شد. **(B)** بلوک‌یاب پنجرهٔ
  ۴ سطریِ خام را می‌دید.
- **[CHANGE]** `sortLessons`: `titleNumber` (عددِ پس از قسمت/بخش/جلسه/حلقه/part/episode، وگرنه عددِ آغاز)؛ `courseOf` برای «‹دوره› - قسمت N» دوره را پیش از خط‌تیره می‌گیرد؛ `courseGaps` با شمارهٔ عنوان، فقط
  درونِ کمینه..بیشینه، و هیچ اگر بیش از نیمِ بازه خالی باشد (سری ِ شماره‌دار نیست). `extract`: `normalizeBlockLines` پیش از بلوک‌یابی — سطرِ `[m:ss]`/`(m:ss)` حذف (در گذرِ خط‌به‌خط هم)، خطِ انگلیسیِ بی‌نقطهٔ
  پایانی + خطِ بعدیِ کوچک‌حرف ⇒ یکی، «(مذکر)/(مؤنث)» (حتی «)مونث(») به سطرِ قبلی چسبیده؛ در پنجره دو سطرِ عربی‌خط و دو لاتین، سطرِ لبنانی = امتیازِ بیشتر و در تساوی سطرِ اول؛ بلوکِ بی‌عربی آیتم **نیست**
  (سطرهایش مصرف می‌شود تا زباله نشود).
- **[VERIFY]** vitest: «مسلسل لو - قسمت 1..30» بی ۹/۲۳/۲۷ با `order` ِ ۵۰۰+ ⇒ دقیقاً [۹، ۲۳، ۲۷]، غالبون ۶۸/۷۰/۷۱ ⇒ [۶۹]، سری ِ پراکنده ⇒ هیچ؛ درسِ ۱۵ ِ بازسازی‌شده (زمان‌نما، انگلیسیِ شکسته، «)مونث(»، «(مذکر)»،
  بلوک‌های بی‌عربی) ⇒ فقط دو جملهٔ عربی با معنیِ فارسیِ «… (مؤنث)/(مذکر)» و انگلیسیِ کامل؛ ریتای واقعی ۲۰/۱۸. **سنجیده‌نشده:** متنِ واقعیِ درسِ ۱۵.
> **امضا:** `Claude Code` · 2026-11-08 · vitest + node + pytest + build در ship.sh

## 2026-11-08 (۴۰) — درسِ ۱۵: نویسه‌های بیگانهٔ PDF، سطرهای شکستهٔ عربی/حرف‌نویسی، جدول‌های تمرین

- **[OWNER]** (تستر، 7454234 زنده) (A) شماره‌های غایب درست (لو ۹/۲۳/۲۷، غالبون ۶۹، ریتا/خنسا هیچ). (B) درسِ ۱۵: ۶۸ آیتم (۴۶ تیک، ۲۱ نامطمئن). مانده روی متنِ واقعی:
  (۱) فارسیِ این PDF نویسه‌های خطوطِ بی‌ربط دارد (U+1587، U+18E4، «خواᵗش ᮤ برد») ⇒ «متنِ غیرقابلِ‌اعتماد»، بی‌تیک، متن دست‌نخورده؛ (۲) سطرهای شکسته هنوز چند بلوک را جابه‌جا می‌کنند
  («.كل ويكند» دمِ سطرِ عربی که معنی شد؛ «Hiyye b-tiţbu5 samak yom el-» بریده؛ «الصوفا.» تکه)؛ (۳) آخرین آیتم‌ها خانه‌های جدولِ تمرین‌اند («El-basar»، «Smell»، «[Ana.....]») ⇒ نامطمئن.
- **[CHANGE]** `extract.quality`: نویسهٔ بیرون از عربی/فارسی، لاتین (با ţ ş ā…)، ارقام، نقطه‌گذاری و فاصله ⇒ «متنِ غیرقابلِ‌اعتماد (نویسه‌های بیگانه از استخراجِ PDF) — دستی اصلاح کنید» (بی‌تیک)؛ جای‌خالیِ «.....»/«……»/
  «[… .....]» ⇒ «جای‌خالیِ تمرین»؛ هر آیتم باید عبارتِ عربی‌خط داشته باشد (El-basar/Smell دیگر آیتم نیستند). `normalizeBlockLines`: خطِ لاتینِ بی‌پایانِ جمله که با «-» تمام می‌شود یا خطِ بعدش با کوچک‌حرف/رقم
  شروع می‌شود ⇒ یکی (حرف‌نویسی هم). `joinArabicTails` (پیشنهادِ تستر): سطرِ عربی کم‌کلمه‌تر از حرف‌نویسیِ پس از آن + تکهٔ کوتاهِ عربی‌خطِ بعدی ⇒ یک سطر؛ «.» ِ جابه‌جاشدهٔ RTL به آخر می‌رود («.كل ويكند» ⇒ «كل ويكند.»).
- **[VERIFY]** vitest ‏۲۲۵ (نویسهٔ U+1D57/U+1BA4/U+1587 ⇒ بی‌تیک و ş سالم؛ برغر/کل ویکند و طبخِ سمک/الأحد با حرف‌نویسیِ شکسته ⇒ دو جملهٔ کامل با معنیِ درست؛ «.....» بی‌تیک؛ عبارتِ لاتین نه)؛ ریتای واقعی ۲۰/۱۸.
  **سنجیده‌نشده:** متنِ واقعیِ درسِ ۱۵.
> **امضا:** `Claude Code` · 2026-11-08 · vitest ‏۲۲۵ + node + pytest + build در ship.sh

## 2026-11-08 (۴۱) — دکمهٔ شناورِ «نظارت» دیگر روی دکمه‌های پایینِ صفحه نمی‌افتد

- **[OWNER]** (تستر، 4fc1bce زنده) درسِ ۱۵: ۷۰ آیتم، ۴۴ تیک، ۲۶ با نشانِ نویسهٔ بیگانه — «خوب»؛ همهٔ صفحه‌ها بی‌خطای کنسول. باگِ دیداری: تراشهٔ شناورِ «نظارت» (پایین‌چپ) روی دکمه‌های اصلیِ پایینِ
  صفحه می‌افتد (مثلاً روی «ایجاد آزمون هوشمند»).
- **[FINDING]** `<main>` در دسکتاپ فقط `pb-8` (۲rem) داشت؛ تراشه `fixed bottom-6` با ارتفاعِ ~۴۸px ⇒ آخرین دکمهٔ صفحه زیرِ آن.
- **[CHANGE]** `App.jsx`: فضای پایینِ `<main>` در همهٔ اندازه‌ها `pb-32` (۸rem = ۱۲۸px) ⇒ وقتی تا ته اسکرول شود، آخرین دکمه بالاتر از تراشهٔ نظارت و دایرهٔ دستیار است.
- **[DECISION]** فاصلهٔ پایین نه پنهان‌سازیِ خودکارِ تراشه (پنهان‌سازی با تشخیصِ هم‌پوشانی شکننده است و مالک تراشه را برای ثبتِ برگه لازم دارد).
- **[VERIFY]** Chromium ۱۳۶۶ و ۳۹۰px: دکمهٔ «ایجاد آزمون هوشمند» با ابزارک‌های fixed هم‌پوشانی ندارد. **محدودیت:** تراشهٔ نظارت در حالتِ محلی (بی‌ورودِ گوگل) دیده نمی‌شود؛ روی production بسنجید.
> **امضا:** `Claude Code` · 2026-11-08 · vitest + node + pytest + build در ship.sh؛ Chromium
