---
task_id: task_0193aa4e943f
title: 'امن‌سازی متغیرهای محیطی: اعتبارسنجی و رمزنگاری'
type: other
priority: critical
execution_priority: 1300
status: pending
external_status: pending
verification_status: partial
watched_id: 6b04f8bd-b562-4fb9-9cd9-0c27458ced59
project: mahdighandi1989/language
created_at: '2026-06-01T19:17:50.430047+00:00'
updated_at: '2026-06-02T23:10:24.600013+00:00'
tags:
- consolidated
- post_verify_merge
---

# امن‌سازی متغیرهای محیطی: اعتبارسنجی و رمزنگاری

## Raw Idea

🧬 این یک تسک تلفیقی است — از 7 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این تسک‌ها همگی بر روی جنبه‌های مختلف امنیت برنامه تمرکز دارند، از جمله جلوگیری از افشای اطلاعات حساس، پیکربندی امنیتی Firebase، و اعمال مکانیزم‌های دفاعی مانند CORS و هدرهای امنیتی. این موارد نیازمند هماهنگی بین فرانت‌اند و بک‌اند هستند.
🎯 theme: تقویت امنیت سیستم از طریق مدیریت صحیح متغیرهای محیطی، کلیدهای API و Firebase، و پیاده‌سازی هدرهای امنیتی و CORS.
💎 estimated_difficulty: large

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 7
  id: 47bfef80-d77a-4386-9dca-fb1a533ca20b
  عنوان اصلی: امن‌سازی متغیرهای محیطی
  اولویت اصلی: critical
  وضعیت verify قبلی: partial
  فایل‌های دخیل: backend/.env.example, backend/server.js

📋 acceptance_criteria کامل:
  - زمانی که فایل `.env` وجود ندارد یا `GEMINI_API_KEY` در آن تعریف نشده، برنامه با خطای واضح 'FATAL: متغیر محیطی GEMINI_API_KEY معتبر نیست' متوقف شود و process.exit(1) فراخوانی شود. [verify_method=backend_test] [verify_plan={"test_node": "", "timeout_seconds": 60, "test_path": "backend/tests/test_validateEnv.js::test_missing_gemini_key", "marker": "verify"}]
  - زمانی که `GEMINI_API_KEY` با فرمت نامعتبر (مثلاً 'abc' بدون پیشوند AIza) تنظیم شده، برنامه با خطا متوقف شود. [verify_method=backend_test] [verify_plan={"test_node": "", "timeout_seconds": 60, "test_path": "backend/tests/test_validateEnv.js::test_invalid_gemini_key_format", "marker": "verify"}]
  - زمانی که `PORT` با مقدار غیرعددی (مثلاً 'abc') تنظیم شده، برنامه با خطا متوقف شود. [verify_method=backend_test] [verify_plan={"test_node": "", "timeout_seconds": 60, "test_path": "backend/tests/test_validateEnv.js::test_invalid_port", "marker": "verify"}]
  - زمانی که همه متغیرهای محیطی معتبر هستند، برنامه بدون خطا startup شود و endpoint `/api/health` در خط 167 همچنان کار کند. [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/health", "headers": null, "json_body": null, "expected_status": 200, "required_fields": ["status"], "json_contains": null}]
  - فایل `backend/config/validateEnv.js` ایجاد شده و تابع `validateEnv` در `backend/server.js` بعد از `dotenv.config()` در خط 14 فراخوانی شود. [verify_method=static] [verify_plan={"grep_patterns": ["validateEnv", "import.*validateEnv", "from './config/validateEnv'"], "files_hint": ["backend/server.js", "backend/config/validateEnv.js"]}]
  - فایل backend/utils/encryption.js باید وجود داشته باشد و شامل توابع encrypt و decrypt با AES-256-GCM باشد [verify_method=static] [verify_plan={"grep_patterns": ["function encrypt", "function decrypt", "aes-256-gcm", "createCipheriv", "createDecipheriv"], "files_hint": ["backend/utils/encryption.js"]}]
  - کلید رمزنگاری (ENCRYPTION_KEY) نباید در کد منبع hard-coded شده باشد — باید از process.env.ENCRYPTION_KEY خوانده شود [verify_method=static] [verify_plan={"grep_patterns": ["process.env.ENCRYPTION_KEY"], "files_hint": ["backend/utils/encryption.js", "backend/server.js"]}]
  - مقدار GEMINI_API_KEY در backend/server.js باید از تابع decrypt عبور کند، نه مستقیم از process.env [verify_method=static] [verify_plan={"grep_patterns": ["decrypt\\(process.env.GEMINI_API_KEY", "decrypt\\(encryptedKey"], "files_hint": ["backend/server.js"]}]
  - فایل backend/.env.example باید شامل ENCRYPTION_KEY باشد [verify_method=static] [verify_plan={"grep_patterns": ["ENCRYPTION_KEY"], "files_hint": ["backend/.env.example"]}]
  - سرور باید با کلید رمزنگاری‌شده در .env راه‌اندازی شود و endpoint /api/health پاسخ 200 بدهد [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/health", "headers": null, "json_body": null, "expected_status": 200, "required_fields": ["status"], "json_contains": null}]
  - هیچ occurrence از GEMINI_API_KEY در console.log یا console.error نباید مقدار واقعی را نشان دهد — فقط '[REDACTED]' یا '***' [verify_method=static] [verify_plan={"grep_patterns": ["console\\.(log|error|warn)\\(.*GEMINI_API_KEY", "console\\.(log|error|warn)\\(.*apiKey", "console\\.(log|error|warn)\\(.*process\\.env"], "files_hint": ["backend/server.js"]}]
  - هیچ endpoint API نباید keyPrefix یا بخشی از API key را در response برگرداند — همه باید با '[REDACTED]' جایگزین شوند [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/list-models", "headers": null, "json_body": null, "expected_status": 200, "required_fields": ["models", "count"], "json_contains": null, "forbidden_fields": ["keyPrefix]
  - هیچ error message در throw new Error نباید حاوی مقدار واقعی API key باشد — پیام‌های خطا باید عمومی و امن باشند [verify_method=static] [verify_plan={"grep_patterns": ["throw new Error\\(`.*\\$\\{.*apiKey.*\\}`", "throw new Error\\(`.*\\$\\{.*GEMINI.*\\}`"], "files_hint": ["backend/server.js"]}]
  - تابع کمکی redactSensitiveData باید در backend/server.js تعریف شده باشد و تمام occurrenceهای API key را در رشته‌ها redact کند [verify_method=static] [verify_plan={"grep_patterns": ["function redactSensitiveData", "const redactSensitiveData"], "files_hint": ["backend/server.js"]}]
  - تماس با console.log در خط 207 باید از تابع امن استفاده کند و apiUrl.replace(GEMINI_API_KEY, 'HIDDEN') حذف شود [verify_method=static] [verify_plan={"grep_patterns": ["apiUrl\\.replace\\(GEMINI_API_KEY, 'HIDDEN'\\)"], "files_hint": ["backend/server.js"]}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

📖 **خواندن کامل + اجرای مو-به-مو (بسیار مهم):**

این پرامپت — از این یادداشت تا انتها — یک سند واحد است که هر بخشش
حاوی الزام یا context منحصربه‌فرد است. خواندن سطحی یا skim کردن **ممنوع**
است.

- پرامپت را **سطر به سطر** بخوان، نه head/tail/فقط-بخش-اصلی.
- اگر بخشی به‌نظر طولانی یا تکراری آمد، **حتماً** بخوان — تفاوت‌های
  ریز ممکن است در آن جا اساسی باشند.
- هر جمله، URL، نام فایل، نام تابع، یا مقدار عددی که در پرامپت آمده،
  دقیقاً همان است که کاربر می‌خواهد — تغییرش نده، رندش نکن، خلاصه‌اش
  نکن.
- اگر پرامپت چندین درخواست/مرحله/زیرتسک دارد، **همه** را پیاده کن. حتی
  یکی را نه به‌عنوان "خارج از scope" حذف کن.

❌ ممنوعات صریح:
- خلاصه‌سازی متن کاربر در commit message یا response
- "این بخش اصلی نیست، رد می‌کنم"
- "کاربر احتمالاً منظورش این بود..." — منظورش همان است که نوشته
- "این URL/نام به نظر قدیمی است، آپدیتش کردم" — تغییر بدون درخواست ممنوع
- پیاده‌سازی فقط بخشی از پرامپت و تظاهر به کامل بودن
- "همه آیتم‌های لیست A را بررسی کردم، B و C مشابه بودند" — نه؛
  هرکدام را جداگانه

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در
  repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های
  مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط
  موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که
  چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.

🔍 **مسئولیت تو (مدل اجراکننده):**
- پیش از هر تغییر، خودت ساختار repo، فایل‌های ذکرشده، و وابستگی‌های آن‌ها را
  مستقل بررسی کن.
- اگر تشخیص دادی موقعیت ذکرشده در پرامپت اشتباه است یا فایل دیگری مناسب‌تر
  است، بر اساس قضاوت خودت عمل کن — این پرامپت نمی‌تواند بهانهٔ کار اشتباه
  باشد ("خودت گفتی" قابل قبول نیست).
- اگر معیارهای پذیرش (AC) مبهم/ناقص بودند، بهترین تفسیر را انتخاب کن و در
  commit message توضیح بده.

🔗 **وابستگی‌ها و همگام‌سازی (بسیار حیاتی — هرگز skip نکن):**

این بخش از همهٔ بخش‌های دیگرِ این یادداشت **مهم‌تر** است. اگر نقض شود،
نتیجهٔ کار ممکن است مشروع به‌نظر برسد ولی در عمل بخش‌های دیگر سیستم را عقب
بیندازد، broken reference تولید کند، یا منجر به data corruption شود.

پیش از و حین تغییر، تمام وابستگی‌ها را در **چهار جهت** به‌طور **کامل و
بدون هیچ خلاصه‌سازی** شناسایی و همگام کن:

**۱. وابستگی‌های upstream (این تسک به چه چیزهایی متکی است):**
- چه فایل‌ها، توابع، کلاس‌ها، API endpoint ها، schema های دیتابیس،
  env vars، یا config هایی که این تسک نیاز دارد؟
- آیا قرار است چیزی را ویرایش/حذف کنی که جای دیگر (signature، رفتار،
  return type، side effect) از آن انتظار خاصی می‌رود؟
- اگر dependency جدیدی اضافه می‌کنی، آیا با dependencyهای موجود تداخل
  دارد (نسخه، compat، lock file)؟

**۲. وابستگی‌های downstream (چه چیزهایی به این تسک متکی‌اند):**
- چه فایل‌ها، توابع، تست‌ها، migrations، docs، یا UI component هایی از
  کدی که داری ویرایش/اضافه/حذف می‌کنی **استفاده می‌کنند**؟
- با grep و reference search **همه‌ی** call sites، importها، subclassها،
  reference های مستقیم و غیرمستقیم را پیدا کن — نه فقط چند مورد اصلی.
- خصوصاً برای حذف یا rename: هیچ broken reference نباید باقی بماند.

**۳. وابستگی‌های cross-tier (بسیار مهم — هرگز فقط یک لایه را نبین):**

تسک شما ممکن است از backend، frontend، database، worker، یا هر tier
دیگری شروع شده باشد. ولی تغییرات تقریباً همیشه روی tier های دیگر هم
اثر می‌گذارند. **مستقل از اینکه تسک از کدام tier است**، این چک‌های دو
طرفه را همیشه انجام بده:

🔁 **اگر backend را تغییر دادی** (API، service، model، route):
  → frontend: کدام component/page/hook این endpoint یا data shape را
    مصرف می‌کند؟ type definition، state shape، error handling، loading
    state، form validation، URL routing همگی باید همگام شوند.
  → mobile/SDK/client library (اگر پروژه دارد): همان داستان frontend.
  → database: آیا migration لازم است؟ آیا rollback امن است؟
  → background workers: آیا event producer/consumer ها تحت تأثیرند؟
  → rate limit، auth، CORS، CSP: آیا رفتار جدید پشتیبانی می‌شود؟

🔁 **اگر frontend را تغییر دادی** (component، form، state، route):
  → backend: آیا endpoint جدید/تغییریافته لازم است؟ آیا data shape ای
    که ارسال می‌شود با schema سرور سازگار است؟
  → backend validation: آیا برای ورودی‌های جدید UI کافی است؟
  → permissions/RBAC: آیا feature جدید نیاز به role check جدید دارد؟
  → analytics/tracking: آیا event های جدید باید در backend log شوند؟
  → SEO/SSR: آیا تغییر route نیاز به sitemap/meta tags جدید دارد؟

🔁 **اگر database/migration را تغییر دادی**:
  → backend models (ORM، Pydantic، dataclasses) همگی به‌روزند؟
  → query های raw SQL یا ORM queries با schema جدید سازگارند؟
  → seed data، fixtures، factory functions تست‌ها به‌روزند؟
  → frontend: آیا data shape جدید در UI به‌درستی render می‌شود؟
  → rollback migration نوشته شده و امن است؟

🔁 **اگر API contract یا event schema را تغییر دادی** (REST، GraphQL،
   WebSocket، gRPC، Kafka، …):
  → OpenAPI/GraphQL schema/proto file آپدیت شد؟
  → همه‌ی consumer ها (client، subscriber، webhook، external API
    user) با version جدید سازگارند؟
  → backward compatibility حفظ شده یا migration path روشن است؟
  → versioning header/path اگر breaking change است؟

🔁 **اگر infrastructure یا config را تغییر دادی** (Dockerfile، CI، Render
   config، env، secrets):
  → README setup/installation section به‌روزه؟
  → `.env.example` با env vars جدید آپدیت شد؟
  → deploy script یا CI workflow هم تغییر کرد؟
  → docs/architecture یا diagram های infrastructure به‌روزند؟

⚠️ **هرگز فقط یک tier را تغییر نده و فرض کنی بقیه خودکار همگام می‌شوند.**
   حتی برای تغییرات به‌ظاهر «کوچک»، چک کن.

**۴. وابستگی‌های جانبی (artifacts که همیشه چک شوند):**

تغییرات کد همیشه روی این artifact ها اثر دارند. **همه را** بررسی و
به‌روز کن — مستندات اولویت **بالا** دارد چون فراموش‌شدنی‌ترین است.

  📝 **مستندات** (همیشه چک کن — حتی برای تغییر کوچک کد):
    - README.md (شرح، setup، نمونه‌های استفاده، badge ها)
    - CHANGELOG.md / RELEASE_NOTES.md
    - docs/ folder (architecture، API reference، user guides، runbooks)
    - inline docstrings/کامنت‌های توابع و کلاس‌های تغییریافته
    - OpenAPI/Swagger annotations، JSDoc/TSDoc
    - architecture diagrams (اگر component اضافه/حذف شد)
    - migration guides (اگر breaking change است)

  🌍 **مستندات کاربر**:
    - i18n files و translation keys
    - UI labels، tooltip ها، help text، error messages
    - in-app onboarding (اگر flow جدید است)

  🧪 **تست‌ها**:
    - unit tests (همه‌ی فایل‌های مرتبط — حتی اگر «بی‌ربط» به‌نظر می‌رسد)
    - integration tests
    - e2e tests (Playwright/Cypress/Selenium)
    - snapshot tests (اگر UI تغییر کرد)
    - contract tests (Pact یا مشابه)
    - performance benchmarks (اگر behavior performance-sensitive تغییر کرد)

  🧬 **type definitions و contracts**:
    - .d.ts files
    - Pydantic models، dataclasses
    - Protobuf/Avro/Thrift schemas
    - GraphQL schema definitions
    - JSON Schemas

  🏗 **infrastructure و config**:
    - Dockerfile، docker-compose.yml
    - Kubernetes manifests
    - Render/Vercel/Netlify config
    - GitHub Actions / GitLab CI workflows
    - environment templates (.env.example، .env.sample)
    - feature flags (LaunchDarkly، GrowthBook، config)

  📊 **monitoring و observability**:
    - logging keys (اگر اضافه/حذف شد، log parser ها هم به‌روز شوند)
    - metric names (Prometheus، Datadog)
    - tracing spans
    - alert rules و dashboards
    - error tracking (Sentry rules، groupings)

  🔐 **security**:
    - auth rules (rate limit، CORS، CSP، HSTS)
    - permissions/RBAC config
    - secrets rotation policies
    - audit log events (اگر action جدید اضافه شد)

  💾 **caches و serialization**:
    - cache keys و TTL (اگر data shape یا lifecycle تغییر کرد)
    - serializer formats (Redis، session storage)
    - browser storage (localStorage، IndexedDB schemas)

**قانون مطلق همگام‌سازی:**
- هر چیزی که در (۱)، (۲)، (۳)، یا (۴) شناسایی شد، در **همان workflow
  این تسک** همگام و به‌روز شود. هرگز برای بعد رها نکن.
- اگر یک فایل/تست/docs نسبت به تغییر شما عقب بماند، در بهترین حالت bug،
  در بدترین حالت مشکل امنیتی یا data corruption تولید می‌کند.
- تغییرات همگام‌سازی می‌توانند در commit جداگانه باشند (در همان task)،
  ولی نباید skip شوند یا به «refactor آینده» سپرده شوند.

**هرگز این جمله‌ها قابل قبول نیست:**
- ❌ «بعداً پیداش می‌کنم»
- ❌ «احتمالاً جای دیگه‌ای استفاده نمی‌شه»
- ❌ «این یه refactor جداگانه‌ست — out of scope»
- ❌ «فقط فایل‌های اصلی رو بررسی کردم»
- ❌ «حدس می‌زنم چیزی بهش وابسته نیست»
- ❌ «دامنه‌ی وابستگی‌ها رو خلاصه کردم» — هرگز خلاصه نکن
- ❌ «این task فقط backend است؛ frontend مشکل خودش» — هرگز
- ❌ «این task فقط frontend است؛ backend از قبل کار می‌کند» — هرگز ثابت نکرده
- ❌ «مستندات بعداً به‌روز می‌شن» — همیشه same-task همگام شوند
- ❌ «testها رو نگاه نکردم چون فقط یه تغییر کوچیک بود»

**در commit message یا PR description**، دامنهٔ وابستگی‌های شناسایی‌شده و
همگام‌شده را به‌طور explicit و **per-tier** بنویس. مثال:
```
Dependencies synced:
- upstream: User model schema, auth middleware
- downstream: 3 API endpoints, 5 frontend components, 12 tests
- cross-tier (backend → frontend): UserProfile.tsx, useUser.ts hook,
  api-types.ts (TS definitions)
- cross-tier (backend → infra): .env.example added NEW_AUTH_SCOPES
- side artifacts: OpenAPI spec, README API section, i18n keys for
  new errors, Sentry alert rule for new error code
```
اگر هیچ وابستگی پیدا نکردی در هر کدام از چهار جهت، صریحاً بنویس:
«بررسی شد — هیچ وابستگی upstream / downstream / cross-tier (backend↔
frontend↔db↔infra) / side شناسایی نشد» تا مشخص باشد بررسی **انجام شده**
نه اینکه فراموش شده.

📋 **مدیریت TO-DO برای اقدامات دستی کاربر (همیشه چک کن):**

⚠️ **هشدار بحرانی — قاعدهٔ ضد-فرار:** TO-DO فقط برای کارهایی است که
**واقعاً غیرممکن** برای agent است (نیاز به انسان مطلق)، نه برای کارهایی
که «بزرگ‌اند»، «وقت می‌برند»، یا «نیازمند fixture/setup» هستند. اگر یک
agent در یک سشن بیش از **۲۰٪ از تسک‌ها** را با TO-DO ببندد، یعنی از کار
فرار می‌کند — این الگو در سشن‌های قبلی **مشاهده** شده و الان ممنوع است.

✅ **فقط برای این موارد TO-DO بساز** (لیست بسته — هرچه خارج این لیست
ممنوع است):

  ۱. **Credential/secret که فقط کاربر دارد**:
     - تنظیم API key واقعی در پنل ادمین خارجی (Render، AWS، Stripe، …)
     - تأیید OAuth client روی console آن سرویس
     - paste کردن webhook secret که فقط بعد از ساخت در dashboard ظاهر می‌شود

  ۲. **Account/billing روی سرویس خارجی که کاربر باید عضو شود**:
     - ساخت account جدید روی Stripe/SendGrid/Twilio/Google Cloud
     - تأیید verification شماره یا ID
     - فعال‌سازی subscription پولی

  ۳. **داده/asset خصوصی که فقط کاربر دارد**:
     - آپلود لوگو/تصویر/فونت برند
     - paste کردن داده‌ای که در محل کار کاربر است
     - import داده‌ای که فقط روی device کاربر است

  ۴. **تصمیم سلیقه‌ای/حقوقی/کسب‌وکار**:
     - انتخاب رنگ‌بندی نهایی یا تم
     - متن دقیق Terms of Service / Privacy Policy
     - تعرفهٔ قیمت‌گذاری
     - نام نهایی برند یا دامنه

⛔ **هرگز TO-DO نکن برای** (لیست سیاه — هر چیزی که در این لیست است
**قابل اجرا** توسط agent است، حتی اگر بزرگ یا چندبخشی باشد):

  ❌ UI component / page / dashboard (هر فریم‌ورک: React, Vue, Angular,
     Svelte، حتی اگر معماری بزرگ دارد) — می‌توانی stub اولیه + state
     management + layout + استایل بسازی
  ❌ "نیازمند Google Drive / Stripe / Twilio API" — می‌توانی **client
     stub** با abstraction layer بسازی که با env var واقعی plug-in شود؛
     کد integration یعنی پیاده‌سازی، نه TO-DO
  ❌ "feature بزرگ، چند روز کار می‌برد" — اندازه دلیل defer نیست؛ کوچک
     شروع کن، iterate کن، در همین سشن کامل کن
  ❌ Celery / background worker / scheduler — یک task ساده + register
     می‌توانی بسازی
  ❌ Migration / model / schema — حتی اگر فیلد جدید نیاز دارد، اضافه کن
  ❌ REST endpoint / GraphQL resolver / WebSocket route — هرگز TO-DO
  ❌ test (unit/integration/e2e) — همیشه قابل نوشتن
  ❌ Documentation / README / API docs — همیشه قابل نوشتن
  ❌ Config file / .env.example / Dockerfile / CI workflow — همیشه قابل
     نوشتن
  ❌ "می‌توانستی .tsx ولی repo .jsx است" — از .jsx استفاده کن، TO-DO نکن
  ❌ "نیازمند فیلد X در مدل دیگر" — اضافه کن فیلد را، TO-DO نکن
  ❌ "تصمیم admin-vs-user-scoped" — پرامپت اولیه scope را معلوم کرده،
     یا با محتاطانه‌ترین تفسیر پیش برو
  ❌ "credential در production هنوز ست نیست" — این TO-DO ساده برای
     تنظیم env var است (مورد ۱ بالا)، نه دلیل برای defer کردن کد
  ❌ "نیازمند verification از کاربر" — اگر اقدام واقعی غیرممکن نیست،
     پیش برو
  ❌ هر چیزی که در یک کامنت `# TODO` معمولی نوشته می‌شد — این فایل
     TO-DO نیست، کامنت inline است

🔬 **قاعدهٔ «حداقل تلاش» قبل از TO-DO**: قبل از TO-DO کردن یک AC، **اثبات
کن** که قابل انجام نیست:

  ۱. آیا می‌توانم یک stub/placeholder بسازم که با env واقعی plug-in شود؟
     → اگر بله، بساز و TO-DO نکن
  ۲. آیا می‌توانم برای این بخش یک test (حتی mock-based) بنویسم؟
     → اگر بله، بنویس و TO-DO نکن
  ۳. آیا می‌توانم abstraction/interface را تعریف کنم، حتی اگر backend
     واقعی نیست؟ → اگر بله، تعریف کن و TO-DO نکن
  ۴. آیا فقط یک حالت سلیقه‌ای/decision کاربر در میان است؟
     → فقط آن یک decision را TO-DO کن، نه کل feature را

اگر یکی از این چهار راه‌حل ممکن بود ولی به TO-DO رفتی، **اعتبار شما از
بین می‌رود**.

📊 **آستانهٔ TO-DO per session**: در یک حلقهٔ اجرای N تسک، اگر بیشتر از
**۲۰٪** تسک‌ها فایل TO-DO ساختی، خودت در گزارش پایانی صریحاً اعلام کن:

  "⚠️ نسبت TO-DO من {K}/{N} = {%} است که از آستانهٔ ۲۰٪ بالاتر است.
   احتمالاً برخی از این TO-DO ها قابل اجرا بودند ولی من فرار کردم.
   لیست TO-DO ها را کاربر باید بازبینی کند که آیا واقعاً Manual-required
   بودند یا agent ضعیف کار کرده."

**یادآوری همیشگی:** اگر در آینده قابلیت‌های شما گسترش پیدا کرد و توانستید
یکی از موارد لیست سفید را خودکار انجام دهید (مثلاً managed credential
injection، یا integration پولی automate شود)، انجام دهید و TO-DO نسازید.
لیست سفید بسته است ولی **بسته از پایین** (می‌تواند کوچک‌تر شود اگر
قابلیت‌ها رشد کنند، ولی هرگز بزرگ‌تر نشود برای فرار).

**اگر هیچ بخش Manual-required نبود (تمام تسک Auto-capable است)**:
  → فایل TO-DO **نساز**. فولدر TO-DO/ باید پاک و معنادار بماند.
  → اگر برای این task از قبل `TO-DO/todo-task-{task_id_first_8}.md` بود
     (یعنی در run قبلی نیاز به دخالت کاربر بود ولی الان نه): فایل قدیمی
     را پاک کن و entry را از `TO-DO/_index.json` حذف کن.

**اگر بخش Manual-required دارد** (همه‌جانبه یا hybrid):
  1. فولدر TO-DO/ را در ریشه ریپو ایجاد کن اگر نیست
  2. فایل `TO-DO/todo-task-{task_id_first_8}.md` بساز با front-matter
     شامل: task_id, task_title, execution_priority, created_at,
     updated_at, status: "pending"
     و در بدنه: «چرا این فایل ساخته شد»، «وضعیت بخش‌های خودکار»
     (commit ها reference)، «کارهایی که باید انجام دهی» با اولویت
     بالا/متوسط/پایین به ترتیب، «وقتی این کارها را تمام کردی»
  3. `TO-DO/_index.json` را با **merge** آپدیت کن (نه overwrite):
     - فایل موجود را بخوان
     - entry های orphan (فایلشان پاک شده) را حذف کن
     - entry این task را اضافه/replace کن
     - بر اساس execution_priority صعودی مرتب کن
     - ساختار: `{"version":1, "generated_at": ISO, "total": N, "items": [...]}`
  4. این تغییرات TO-DO را در **همان commit کد** شامل کن (نه commit جداگانه)

⛔ **ممنوعات مطلق TO-DO**:
  ❌ ساختن TO-DO برای کاری که می‌توانستی خودت انجام دهی (شلوغی فولدر)
  ❌ overwrite کردن `TO-DO/_index.json` بدون merge (data loss)
  ❌ نگه‌داشتن entry هایی که فایل‌شان پاک شده (broken reference)
  ❌ فراموش کردن نوشتن «خروجی مورد انتظار» در هر آیتم TO-DO

این بخش الزامی است. حتی اگر فکر می‌کنی "این تسک کاملاً auto است و نیازی
به TO-DO نیست"، صریحاً در commit message یا report بنویس:
"بررسی شد — این تسک هیچ بخش Manual-required ندارد، TO-DO ساخته نشد."

📦 **اگر کار طولانی است:**
- **خلاصه‌اش نکن.** همه را به‌طور کامل انجام بده.
- اگر یک کامیت گنجایش ندارد، در **چندین کامیت متوالی** انجام بده — ولی
  هیچ بخشی را skip نکن.
- ترتیب کامیت‌ها را منطقی نگه‌دار (foundation → core → integration → tests).
- در آخر یک checklist از همه‌ی کامیت‌ها در PR description بنویس.

🔁 **Commit + Push فوری per-task (بسیار مهم برای جریان کار صحیح):**

پس از اتمام پیاده‌سازی این تسک، **بلافاصله** commit کن و **همان موقع**
به default branch (main/master) push کن. سپس به تسک بعدی برو.

✓ چرا این قانون حیاتی است:
  - تسک‌های بعدی ممکن است به فایل‌ها/تغییراتی که این تسک ایجاد کرده
    نیاز داشته باشند. اگر push نکنی، `git pull` بعدی آن‌ها را نمی‌بیند.
  - جمع‌کردن تغییرات چند تسک منجر به conflict های بزرگ می‌شود.
  - اگر در میانه fail کنی، task های push شده ضایع نمی‌شوند.

⛔ ممنوع: "همه task ها را تمام می‌کنم بعد یک‌جا push می‌زنم"
⛔ ممنوع: branch جدا برای task — مستقیم به default branch
⛔ ممنوع: task بعدی بدون push کامل task قبلی

---


---

## 📥 درخواست خام کاربر (verbatim — همان متنی که کاربر نوشت)
_(همهٔ URL ها، آدرس‌ها، نام‌ها، و کلمات کلیدی در این متن دست‌نخورده هستند.)_

```
وجود فایل .env.example نشان‌دهنده استفاده از متغیرهای محیطی است، اما عدم وجود validation، encryption و proper handling این متغیرها خطر امنیتی جدی ایجاد می‌کند. API keys مربوط به Gemini AI و سایر سرویس‌ها در معرض خطر قرار دارند.
```

## 📋 چک‌لیست مراحل (3 مرحله)

این تسک به مراحل کوچک‌تر تقسیم شده. **در هر verify خودکار، وضعیت هر مرحله به‌صورت `[ ]` (انجام نشده)، `[~]` (ناقص)، یا `[x]` (انجام شده) به‌روز می‌شود.**
وقتی تمام مراحل `[x]` شدند، تسک به‌طور خودکار به «انجام شده» منتقل می‌شود.

- [x] **مرحله 1: پیاده‌سازی اعتبارسنجی (Validation) برای تمام متغیرهای محیطی در زمان راه‌اندازی برنامه** — این مرحله شامل ایجاد یک مکانیزم مرکزی برای اعتبارسنجی تمام متغیرهای محیطی (مانند API keys، URLs، و سایر تنظیمات) در زمان startup برنامه است. باید بررسی کند که متغیرهای ضروری وجود دارند، خالی نیستند، و در صورت امکان فرمت صحیح دارند (مثلاً URL معتبر). این مرحله شامل encryption یا handling امنیتی دیگر 
- [x] **مرحله 2: پیاده‌سازی رمزنگاری (Encryption) برای ذخیره‌سازی امن API keys و متغیرهای حساس** — این مرحله شامل پیاده‌سازی یک مکانیزم برای رمزنگاری متغیرهای محیطی حساس (مانند API keys) در زمان ذخیره‌سازی (مثلاً در فایل .env یا دیتابیس) است. باید از یک الگوریتم رمزنگاری استاندارد (مانند AES-256) استفاده کند. کلید رمزنگاری باید خودش از یک متغیر محیطی دیگر (مانند ENCRYPTION_KEY) خوانده شود. این مر
- [~] **مرحله 3: پیاده‌سازی مدیریت امن (Proper Handling) برای متغیرهای محیطی شامل لاگینگ امن و خطاهای مناسب** — این مرحله شامل پیاده‌سازی یک لایه مدیریت امن برای متغیرهای محیطی است. این شامل: ۱) هرگز لاگ نکردن مقادیر واقعی API keys یا متغیرهای حساس در console یا فایل‌های لاگ (فقط نشانگرهایی مانند '***' یا '[REDACTED]'). ۲) ارائه خطاهای کاربرپسند و امن که اطلاعات حساس را فاش نکنند. ۳) اطمینان از اینکه متغیرهای

---

# 🔹 مرحله 1: پیاده‌سازی اعتبارسنجی (Validation) برای تمام متغیرهای محیطی در زمان راه‌اندازی برنامه

**Scope:** این مرحله شامل ایجاد یک مکانیزم مرکزی برای اعتبارسنجی تمام متغیرهای محیطی (مانند API keys، URLs، و سایر تنظیمات) در زمان startup برنامه است. باید بررسی کند که متغیرهای ضروری وجود دارند، خالی نیستند، و در صورت امکان فرمت صحیح دارند (مثلاً URL معتبر). این مرحله شامل encryption یا handling امنیتی دیگر نمی‌شود. نکته حیاتی: اعتبارسنجی باید fail-fast باشد، یعنی اگر متغیری معتبر نباشد، برنامه با خطای واضح متوقف شود.
**Key terms:** .env.example, validation, API keys, Gemini AI, متغیرهای محیطی

**بخش مربوط از متن کاربر:**
```
وجود فایل .env.example نشان‌دهنده استفاده از متغیرهای محیطی است، اما عدم وجود validation، encryption و proper handling این متغیرها خطر امنیتی جدی ایجاد می‌کند. API keys مربوط به Gemini AI و سایر سرویس‌ها در معرض خطر قرار دارند.
```

## 🎯 هدف (خلاصه ساختاریافته)
پیاده‌سازی اعتبارسنجی fail-fast برای متغیرهای محیطی در startup

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/server.js:53-53` — `GEMINI_API_KEY` — این خط متغیر محیطی را می‌خواند اما هیچ اعتبارسنجی fail-fast ندارد. فقط در endpointها با if ساده بررسی می‌شود.
  ```jsx
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  ```
- `backend/server.js:38-39` — `PORT` — PORT با مقدار پیش‌فرض استفاده شده اما اگر کاربر مقدار نامعتبر (مثلاً 'abc') بدهد، برنامه بدون خطا اجرا می‌شود.
  ```jsx
  const app = express();
  const PORT = process.env.PORT || 3001;
  ```
- `backend/server.js:14-14` — `dotenv.config()` — بعد از این خط باید تابع validateEnv() فراخوانی شود تا قبل از شروع سرویس، متغیرها بررسی شوند.
  ```jsx
  dotenv.config();
  ```
- `backend/.env.example:1-8` — `کل فایل` — این فایل نشان‌دهنده متغیرهای مورد نیاز است. validation باید بر اساس این فایل طراحی شود.
  ```
  # Gemini API Key - Get from https://aistudio.google.com/apikey
  GEMINI_API_KEY=your_gemini_api_key_here
  
  # Port (optional, default 3001)
  PORT=3001
  
  # Firebase config (optional - for data persistence)
  # VITE_FIREBASE_CONFIG={"apiKey":"...","authDomain":"...","projectId":"...","storageBucket":"...","messagingSenderId":"...","appId":"..."}
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
JavaScript (Node.js) با Express.js، dotenv برای مدیریت متغیرهای محیطی، WebSocket (ws)، multer برای آپلود فایل، fluent-ffmpeg برای پردازش ویدیو/صوت. Stack: backend با Express.js، frontend با React/Vite.

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `backend/server.js` (سطر 14) — فایل اصلی که متغیرهای محیطی را می‌خواند و باید تابع validateEnv را import و فراخوانی کند.
- `backend/.env.example` (سطر 1) — مرجع تعریف متغیرهای محیطی مورد نیاز پروژه. validation باید با این فایل هماهنگ باشد.
- `backend/package.json` (سطر 1) — برای اطمینان از اینکه وابستگی `dotenv` در dependencies وجود دارد (در package-lock.json دیده می‌شود).
- `render.yaml` (سطر 1) — فایل کانفیگ deployment که ممکن است متغیرهای محیطی در آن تعریف شده باشند. validation باید با deployment هماهنگ باشد.

## 🌐 نقشهٔ وابستگی‌ها
این تغییر یک فایل جدید `backend/config/validateEnv.js` ایجاد می‌کند که توسط `backend/server.js` import می‌شود. `backend/server.js` تنها فایلی است که مستقیماً از `process.env` می‌خواند (خطوط ۳۹، ۵۳). هیچ فایل دیگری در پروژه مستقیماً از `process.env` استفاده نمی‌کند (frontend از `__firebase_config` در index.html استفاده می‌کند). تابع `validateEnv` هیچ وابستگی خارجی به جز `dotenv` (که قبلاً نصب است) ندارد. تغییر در `backend/server.js` روی endpointهای `/api/gemini/chat`، `/api/gemini/tts`، `/api/list-models`، `/api/test-gemini` و `/api/analyze-files` تأثیر می‌گذارد زیرا این endpointها دیگر نیازی به بررسی `if (!GEMINI_API_KEY)` نخواهند داشت (چون در startup بررسی شده).

## 🔍 Context و وضعیت فعلی
کاربر درخواست پیاده‌سازی یک مکانیزم مرکزی برای اعتبارسنجی تمام متغیرهای محیطی (مانند API keys، URLs، و سایر تنظیمات) در زمان startup برنامه را دارد. این اعتبارسنجی باید بررسی کند که متغیرهای ضروری وجود دارند، خالی نیستند، و در صورت امکان فرمت صحیح دارند (مثلاً URL معتبر). نکته حیاتی: اعتبارسنجی باید fail-fast باشد، یعنی اگر متغیری معتبر نباشد، برنامه با خطای واضح متوقف شود. کاربر به فایل `backend/.env.example` اشاره کرده که حاوی متغیرهای `GEMINI_API_KEY`، `PORT` و `VITE_FIREBASE_CONFIG` است. در کد واقعی `backend/server.js`، متغیر `GEMINI_API_KEY` در خط ۵۳ با `process.env.GEMINI_API_KEY` خوانده می‌شود و در endpointهای `/api/gemini/chat` (خط ۵۶)، `/api/gemini/tts` (خط ۱۱۷)، `/api/list-models` (خط ۱۷۲)، `/api/test-gemini` (خط ۱۹۵) و `/api/analyze-files` (خط ۶۹۸) فقط با یک `if (!GEMINI_API_KEY)` ساده بررسی می‌شود که منجر به بازگشت error 500 می‌شود، نه توقف برنامه. همچنین متغیر `PORT` در خط ۳۹ با مقدار پیش‌فرض ۳۰۰۱ استفاده شده اما اعتبارسنجی نشده. عدم وجود validation، encryption و proper handling این متغیرها خطر امنیتی جدی ایجاد می‌کند. API keys مربوط به Gemini AI و سایر سرویس‌ها در معرض خطر قرار دارند. کاربر خواستار fail-fast validation است، یعنی اگر متغیری معتبر نباشد، برنامه با خطای واضح متوقف شود.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] زمانی که فایل `.env` وجود ندارد یا `GEMINI_API_KEY` در آن تعریف نشده، برنامه با خطای واضح 'FATAL: متغیر محیطی GEMINI_API_KEY معتبر نیست' متوقف شود و process.exit(1) فراخوانی شود.
- [ ] زمانی که `GEMINI_API_KEY` با فرمت نامعتبر (مثلاً 'abc' بدون پیشوند AIza) تنظیم شده، برنامه با خطا متوقف شود.
- [ ] زمانی که `PORT` با مقدار غیرعددی (مثلاً 'abc') تنظیم شده، برنامه با خطا متوقف شود.
- [ ] زمانی که همه متغیرهای محیطی معتبر هستند، برنامه بدون خطا startup شود و endpoint `/api/health` در خط 167 همچنان کار کند.
- [ ] فایل `backend/config/validateEnv.js` ایجاد شده و تابع `validateEnv` در `backend/server.js` بعد از `dotenv.config()` در خط 14 فراخوانی شود.
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. ۱. ایجاد فایل جدید `backend/config/validateEnv.js` با یک تابع `validateEnv()` که در زمان startup فراخوانی شود.
۲. در این تابع، ابتدا متغیر `GEMINI_API_KEY` از `process.env` خوانده شود و بررسی شود که وجود دارد و خالی نیست. اگر وجود نداشت یا خالی بود، `console.error` با پیام واضح چاپ کند و `process.exit(1)` فراخوانی شود.
۳. متغیر `PORT` بررسی شود: اگر تعریف شده، باید یک عدد صحیح بین ۱ تا ۶۵۵۳۵ باشد. اگر تعریف نشده، مقدار پیش‌فرض ۳۰۰۱ استفاده شود (نیاز به fail-fast ندارد).
۴. متغیر `VITE_FIREBASE_CONFIG` (اختیاری) بررسی شود: اگر تعریف شده، باید یک JSON معتبر باشد. اگر نامعتبر بود، warning چاپ شود اما برنامه fail نشود.
۵. در `backend/server.js`، در خطوط ابتدایی (بعد از `dotenv.config()` در خط ۱۴)، تابع `validateEnv()` فراخوانی شود.
۶. پیام خطاها باید به فارسی و انگلیسی باشد و دقیقاً مشخص کند کدام متغیر مشکل دارد و چه مقداری انتظار می‌رود.
۷. برای `GEMINI_API_KEY`، یک validation ساده فرمت (شروع با 'AIza') اضافه شود تا از اشتباهات تایپی جلوگیری کند.

## 💡 نمونه‌های قبل/بعد
**اعتبارسنجی GEMINI_API_KEY در startup**

_قبل:_
```
// backend/server.js خط 53
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// سپس در هر endpoint:
if (!GEMINI_API_KEY) {
  return res.status(500).json({ error: 'API key not configured' });
}
```

_بعد:_
```
// backend/config/validateEnv.js (فایل جدید)
export function validateEnv() {
  const requiredVars = [
    { name: 'GEMINI_API_KEY', validator: (v) => v && v.startsWith('AIza') }
  ];
  
  for (const { name, validator } of requiredVars) {
    const value = process.env[name];
    if (!value || !validator(value)) {
      console.error(`❌ FATAL: متغیر محیطی ${name} معتبر نیست. مقدار فعلی: '${value?.substring(0, 10)}...'`);
      console.error(`   لطفاً یک API key معتبر از https://aistudio.google.com/apikey دریافت کنید.`);
      process.exit(1);
    }
  }
  
  // PORT validation (optional but warn if invalid)
  const port = process.env.PORT;
  if (port) {
    const portNum = parseInt(port, 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      console.error(`❌ FATAL: PORT=${port} معتبر نیست. باید یک عدد بین 1 تا 65535 باشد.`);
      process.exit(1);
    }
  }
}

// backend/server.js خط 14 (بعد از dotenv.config)
import { validateEnv } from './config/validateEnv.js';
dotenv.config();
validateEnv();
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `cd backend && node -e "process.env.GEMINI_API_KEY=''; import('./config/validateEnv.js').then(m => m.validateEnv())"`
- `cd backend && node -e "process.env.GEMINI_API_KEY='AIzaValidKey'; process.env.PORT='abc'; import('./config/validateEnv.js').then(m => m.validateEnv())"`
- `cd backend && npm test -- --grep 'validateEnv'`

## ⚠️ ریسک‌ها و موارد احتیاط
۱. اگر `validateEnv()` قبل از `dotenv.config()` فراخوانی شود، متغیرها از فایل `.env` بارگذاری نشده‌اند و برنامه همیشه fail می‌شود. باید ترتیب فراخوانی رعایت شود (خط ۱۴ `backend/server.js`). ۲. تغییر در `backend/server.js` ممکن است با deployment pipeline (فایل `render.yaml`) تداخل داشته باشد اگر متغیرهای محیطی در Render تنظیم شده باشند. ۳. اگر کاربر از متغیر `GEMINI_API_KEY` با فرمت غیراستاندارد (اما معتبر) استفاده کند، validation با `startsWith('AIza')` ممکن است false positive ایجاد کند. باید validator انعطاف‌پذیرتر باشد.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: critical
- تخمین زمان: small

---

# 🔹 مرحله 2: پیاده‌سازی رمزنگاری (Encryption) برای ذخیره‌سازی امن API keys و متغیرهای حساس

**Scope:** این مرحله شامل پیاده‌سازی یک مکانیزم برای رمزنگاری متغیرهای محیطی حساس (مانند API keys) در زمان ذخیره‌سازی (مثلاً در فایل .env یا دیتابیس) است. باید از یک الگوریتم رمزنگاری استاندارد (مانند AES-256) استفاده کند. کلید رمزنگاری باید خودش از یک متغیر محیطی دیگر (مانند ENCRYPTION_KEY) خوانده شود. این مرحله شامل validation یا handling لاگینگ نمی‌شود. نکته حیاتی: کلید رمزنگاری نباید در کد منبع hard-coded شود.
**Key terms:** .env.example, encryption, API keys, Gemini AI, AES-256, ENCRYPTION_KEY

**بخش مربوط از متن کاربر:**
```
وجود فایل .env.example نشان‌دهنده استفاده از متغیرهای محیطی است، اما عدم وجود validation، encryption و proper handling این متغیرها خطر امنیتی جدی ایجاد می‌کند. API keys مربوط به Gemini AI و سایر سرویس‌ها در معرض خطر قرار دارند.
```

## 🎯 هدف (خلاصه ساختاریافته)
پیاده‌سازی رمزنگاری AES-256 برای API Keys

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/server.js:53-54` — `GEMINI_API_KEY` — API key مستقیم از env خوانده می‌شود — باید رمزگشایی شود
  ```jsx
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  ```
- `backend/.env.example:1-5` — `GEMINI_API_KEY` — فایل example باید شامل ENCRYPTION_KEY هم باشد
  ```
  # Gemini API Key - Get from https://aistudio.google.com/apikey
  GEMINI_API_KEY=your_gemini_api_key_here
  
  # Port (optional, default 3001)
  PORT=3001
  ```
- `backend/server.js:84` — `apiUrl` — استفاده مستقیم از API key در URL — باید از متغیر رمزگشایی‌شده استفاده کند
  ```jsx
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
JavaScript (Node.js) — backend با Express.js و WebSocket. رمزنگاری با crypto (built-in Node.js) یا کتابخانه crypto-js. الگوریتم AES-256-GCM.

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `backend/package.json` (سطر 1) — برای اضافه کردن وابستگی crypto (built-in) نیاز به تغییر ندارد، اما ممکن است نیاز به نصب crypto-js یا @noble/ciphers باشد
- `frontend/index.html` (سطر 11) — Firebase config به صورت plain text در HTML ذخیره شده — نیاز به رمزنگاری در سمت کلاینت دارد (اما خارج از scope این تسک)
- `backend/server.js` (سطر 84) — تمام endpoint‌هایی که از GEMINI_API_KEY استفاده می‌کنند (خطوط 84, 124, 178, 205, 274, 304, 376, 396, 434) باید از متغیر رمزگشایی‌شده استفاده کنند

## 🌐 نقشهٔ وابستگی‌ها
این تغییر یک فایل جدید (backend/utils/encryption.js) ایجاد می‌کند که توسط backend/server.js import می‌شود. تابع encrypt/decrypt در زمان راه‌اندازی سرور (خط 53 server.js) فراخوانی می‌شود. تمام endpointهای API که از GEMINI_API_KEY استفاده می‌کنند (خطوط 84, 124, 178, 205, 274, 304, 376, 396, 434) به صورت غیرمستقیم تحت تأثیر قرار می‌گیرند چون از یک متغیر سراسری استفاده می‌کنند. فایل .env.example نیز به‌روزرسانی می‌شود.

## 🔍 Context و وضعیت فعلی
کاربر درخواست پیاده‌سازی رمزنگاری (Encryption) برای ذخیره‌سازی امن API keys و متغیرهای حساس را دارد. این مرحله شامل پیاده‌سازی یک مکانیزم برای رمزنگاری متغیرهای محیطی حساس (مانند API keys) در زمان ذخیره‌سازی (مثلاً در فایل .env یا دیتابیس) است. باید از یک الگوریتم رمزنگاری استاندارد (مانند AES-256) استفاده کند. کلید رمزنگاری باید خودش از یک متغیر محیطی دیگر (مانند ENCRYPTION_KEY) خوانده شود. این مرحله شامل validation یا handling لاگینگ نمی‌شود. نکته حیاتی: کلید رمزنگاری نباید در کد منبع hard-coded شود.

--- بخش مربوط از درخواست اصلی کاربر ---
وجود فایل .env.example نشان‌دهنده استفاده از متغیرهای محیطی است، اما عدم وجود validation، encryption و proper handling این متغیرها خطر امنیتی جدی ایجاد می‌کند. API keys مربوط به Gemini AI و سایر سرویس‌ها در معرض خطر قرار دارند.

--- کلیدواژه‌ها ---
.env.example, encryption, API keys, Gemini AI, AES-256, ENCRYPTION_KEY

شواهد در کد واقعی پروژه:
- فایل backend/.env.example (خط 1-5): حاوی GEMINI_API_KEY و PORT و Firebase config است.
- فایل backend/server.js (خط 53): const GEMINI_API_KEY = process.env.GEMINI_API_KEY; — API key مستقیم از env خوانده می‌شود.
- فایل backend/server.js (خط 57-58): if (!GEMINI_API_KEY) { return res.status(500).json({ error: 'API key not configured' }); } — عدم وجود رمزنگاری.
- فایل backend/server.js (خط 84, 124, 178, 205, 274, 304, 376, 396, 434): استفاده مستقیم از GEMINI_API_KEY در URL‌های API.
- فایل frontend/index.html (خط 11-18): Firebase config به صورت plain text در HTML ذخیره شده است.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فایل backend/utils/encryption.js باید وجود داشته باشد و شامل توابع encrypt و decrypt با AES-256-GCM باشد
- [ ] کلید رمزنگاری (ENCRYPTION_KEY) نباید در کد منبع hard-coded شده باشد — باید از process.env.ENCRYPTION_KEY خوانده شود
- [ ] مقدار GEMINI_API_KEY در backend/server.js باید از تابع decrypt عبور کند، نه مستقیم از process.env
- [ ] فایل backend/.env.example باید شامل ENCRYPTION_KEY باشد
- [ ] سرور باید با کلید رمزنگاری‌شده در .env راه‌اندازی شود و endpoint /api/health پاسخ 200 بدهد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. 1. ایجاد فایل جدید backend/utils/encryption.js با توابع encrypt و decrypt با استفاده از الگوریتم AES-256-GCM.
2. خواندن کلید رمزنگاری از متغیر محیطی ENCRYPTION_KEY (نه hard-code).
3. اصلاح فایل backend/server.js برای استفاده از توابع رمزنگاری هنگام خواندن GEMINI_API_KEY از process.env.
4. به‌روزرسانی فایل backend/.env.example برای اضافه کردن ENCRYPTION_KEY.
5. رمزنگاری مقدار GEMINI_API_KEY در فایل .env واقعی (نه example).
6. عدم تغییر در frontend/index.html فعلاً (چون Firebase config عمومی است).

## 💡 نمونه‌های قبل/بعد
**خواندن API key بدون رمزنگاری**

_قبل:_
```
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
```

_بعد:_
```
const encryptedKey = process.env.GEMINI_API_KEY;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const GEMINI_API_KEY = decrypt(encryptedKey, ENCRYPTION_KEY);
```

**فایل .env.example قبل و بعد**

_قبل:_
```
GEMINI_API_KEY=your_gemini_api_key_here
```

_بعد:_
```
# Encryption key (32 characters for AES-256)
ENCRYPTION_KEY=your_32_char_encryption_key_here

# Encrypted API key (use encryption utility to generate)
GEMINI_API_KEY=encrypted_value_here
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `node -e "const { encrypt, decrypt } = require('./backend/utils/encryption.js'); const key = '12345678901234567890123456789012'; const encrypted = encrypt('test-key', key); console.log(decrypt(encrypted, key) === 'test-key' ? 'PASS' : 'FAIL');"`
- `grep -r 'process.env.GEMINI_API_KEY' backend/server.js | grep -v 'decrypt' && echo 'WARNING: Direct usage found' || echo 'OK: No direct usage'`
- `grep 'ENCRYPTION_KEY' backend/.env.example || echo 'FAIL: ENCRYPTION_KEY not in .env.example'`

## ⚠️ ریسک‌ها و موارد احتیاط
ریسک اصلی: اگر ENCRYPTION_KEY گم شود، تمام API keys غیرقابل بازیابی می‌شوند. همچنین، رمزنگاری در سمت سرور باعث افزایش latency در زمان راه‌اندازی می‌شود (حدود 10-50ms). تغییر در backend/server.js (خط 53) روی تمام endpointهایی که از GEMINI_API_KEY استفاده می‌کنند (حداقل 9 endpoint) تأثیر می‌گذارد. اگر رمزگشایی fail شود، سرور باید graceful shutdown انجام دهد نه crash.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: critical
- تخمین زمان: medium

---

# 🔹 مرحله 3: پیاده‌سازی مدیریت امن (Proper Handling) برای متغیرهای محیطی شامل لاگینگ امن و خطاهای مناسب

**Scope:** این مرحله شامل پیاده‌سازی یک لایه مدیریت امن برای متغیرهای محیطی است. این شامل: ۱) هرگز لاگ نکردن مقادیر واقعی API keys یا متغیرهای حساس در console یا فایل‌های لاگ (فقط نشانگرهایی مانند '***' یا '[REDACTED]'). ۲) ارائه خطاهای کاربرپسند و امن که اطلاعات حساس را فاش نکنند. ۳) اطمینان از اینکه متغیرهای محیطی در حافظه (memory) بیش از حد لازم نگهداری نشوند. این مرحله شامل validation یا encryption نمی‌شود. نکته حیاتی: هیچ متغیر حساسی نباید در stack trace یا error message ظاهر شود.
**Key terms:** .env.example, proper handling, API keys, Gemini AI, logging, error handling

**بخش مربوط از متن کاربر:**
```
وجود فایل .env.example نشان‌دهنده استفاده از متغیرهای محیطی است، اما عدم وجود validation، encryption و proper handling این متغیرها خطر امنیتی جدی ایجاد می‌کند. API keys مربوط به Gemini AI و سایر سرویس‌ها در معرض خطر قرار دارند.
```

## 🎯 هدف (خلاصه ساختاریافته)
پیاده‌سازی مدیریت امن متغیرهای محیطی در backend/server.js

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/server.js:53-53` — `GEMINI_API_KEY` — نقطه ورود متغیر محیطی حساس — باید از اینجا به بعد مدیریت امن اعمال شود
  ```jsx
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  ```
- `backend/server.js:207-207` — `console.log('Testing Gemini API with URL:', apiUrl.replace(GEMINI_API_KEY, 'HIDDEN'))` — لاگینگ ناقص — اگر replace شکست بخورد، کلید فاش می‌شود. باید با تابع امن جایگزین شود
  ```jsx
  console.log('Testing Gemini API with URL:', apiUrl.replace(GEMINI_API_KEY, 'HIDDEN'));
  ```
- `backend/server.js:183-183` — `keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...'` — فاش کردن ۱۰ کاراکتر اول کلید در پاسخ API — خطر امنیتی جدی
  ```jsx
  return res.status(response.status).json({ error: data, keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...' });
  ```
- `backend/server.js:188-188` — `keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...'` — فاش کردن ۱۰ کاراکتر اول کلید در پاسخ API — خطر امنیتی جدی
  ```jsx
  res.json({ models: modelNames, count: modelNames.length, keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...' });
  ```
- `backend/server.js:224-224` — `keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...'` — فاش کردن ۱۰ کاراکتر اول کلید در پاسخ API — خطر امنیتی جدی
  ```jsx
  keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...'
  ```
- `backend/server.js:234-234` — `keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...'` — فاش کردن ۱۰ کاراکتر اول کلید در پاسخ API — خطر امنیتی جدی
  ```jsx
  keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...'
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Stack تشخیص داده شده: JavaScript (Node.js backend با Express، frontend با React/Vite). کتابخانه‌های مرتبط: dotenv (برای بارگذاری .env)، winston یا pino (برای لاگینگ امن — در صورت نیاز).

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `backend/.env.example` (سطر 2) — فایل نمونه که نشان‌دهنده متغیرهای محیطی مورد استفاده است — باید مستندات مربوط به مدیریت امن را نیز شامل شود
- `frontend/index.html` (سطر 11) — حاوی Firebase config در خطوط 11-18 که شامل apiKey است — این config نیز باید از لاگینگ امن برخوردار باشد
- `backend/package.json` (سطر 1) — وابستگی‌های پروژه backend — ممکن است نیاز به افزودن کتابخانه‌ای برای مدیریت امن متغیرهای محیطی باشد
- `frontend/src/App.jsx` (سطر 1) — فایل اصلی frontend که ممکن است از API keyها استفاده کند — باید بررسی شود که آیا متغیرهای محیطی در frontend نیز نیاز به مدیریت امن دارند

## 🌐 نقشهٔ وابستگی‌ها
این تغییرات عمدتاً بر فایل backend/server.js متمرکز است که نقطه مرکزی مدیریت API keyهاست. متغیر GEMINI_API_KEY در 8 نقطه مختلف در این فایل استفاده می‌شود: خط 53 (تعریف)، خطوط 84, 124, 178, 205, 274, 304, 376, 396, 434 (استفاده در URLها). همچنین در خطوط 183, 188, 224, 234 (keyPrefix) و خط 207 (لاگینگ). فایل frontend/index.html حاوی Firebase config است که باید جداگانه بررسی شود. فایل backend/.env.example به عنوان مرجع مستندات باید به‌روزرسانی شود.

## 🔍 Context و وضعیت فعلی
کاربر درخواست پیاده‌سازی مدیریت امن (Proper Handling) برای متغیرهای محیطی شامل لاگینگ امن و خطاهای مناسب را داده است. این شامل: ۱) هرگز لاگ نکردن مقادیر واقعی API keys یا متغیرهای حساس در console یا فایل‌های لاگ (فقط نشانگرهایی مانند '***' یا '[REDACTED]'). ۲) ارائه خطاهای کاربرپسند و امن که اطلاعات حساس را فاش نکنند. ۳) اطمینان از اینکه متغیرهای محیطی در حافظه (memory) بیش از حد لازم نگهداری نشوند. این مرحله شامل validation یا encryption نمی‌شود. نکته حیاتی: هیچ متغیر حساسی نباید در stack trace یا error message ظاهر شود. --- بخش مربوط از درخواست اصلی کاربر --- وجود فایل .env.example نشان‌دهنده استفاده از متغیرهای محیطی است، اما عدم وجود validation، encryption و proper handling این متغیرها خطر امنیتی جدی ایجاد می‌کند. API keys مربوط به Gemini AI و سایر سرویس‌ها در معرض خطر قرار دارند. --- کلیدواژه‌ها --- .env.example, proper handling, API keys, Gemini AI, logging, error handling. شواهد در کد واقعی پروژه: در فایل backend/server.js، خط 53: const GEMINI_API_KEY = process.env.GEMINI_API_KEY; این متغیر در 8 نقطه مختلف مستقیماً استفاده شده و در console.log خط 207: console.log('Testing Gemini API with URL:', apiUrl.replace(GEMINI_API_KEY, 'HIDDEN')); و خط 183: keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...' و خط 188: keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...' و خط 224: keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...' و خط 234: keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...' که بخشی از کلید را فاش می‌کند. همچنین در خط 94: console.error('Gemini API error:', errorData); و خط 111: console.error('Chat API error:', error); و خط 146: console.error('TTS API error:', errorData); و خط 161: console.error('TTS API error:', error); و خط 190: res.status(500).json({ error: error.message }); و خط 237: console.error('Test error:', error); و خط 289: throw new Error(`Gemini API error: ${error}`); و خط 322: throw new Error(`Failed to start upload: ${error}`); و خط 354: throw new Error(`Failed to upload file: ${error}`); و خط 417: throw new Error(`Gemini API error: ${error}`); که ممکن است error message حاوی اطلاعات حساس باشد.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] هیچ occurrence از GEMINI_API_KEY در console.log یا console.error نباید مقدار واقعی را نشان دهد — فقط '[REDACTED]' یا '***'
- [ ] هیچ endpoint API نباید keyPrefix یا بخشی از API key را در response برگرداند — همه باید با '[REDACTED]' جایگزین شوند
- [ ] هیچ error message در throw new Error نباید حاوی مقدار واقعی API key باشد — پیام‌های خطا باید عمومی و امن باشند
- [ ] تابع کمکی redactSensitiveData باید در backend/server.js تعریف شده باشد و تمام occurrenceهای API key را در رشته‌ها redact کند
- [ ] تماس با console.log در خط 207 باید از تابع امن استفاده کند و apiUrl.replace(GEMINI_API_KEY, 'HIDDEN') حذف شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. ۱. ایجاد یک ماژول امن برای مدیریت متغیرهای محیطی در فایل backend/server.js یا یک فایل جداگانه مانند backend/config/secureEnv.js. ۲. تعریف یک تابع کمکی به نام `getSecureEnv(key)` که مقدار متغیر محیطی را برمی‌گرداند و یک تابع `logSecure(key)` که فقط '[REDACTED]' را لاگ می‌کند. ۳. جایگزینی تمام console.log و console.error که مستقیماً از GEMINI_API_KEY استفاده می‌کنند با توابع امن. ۴. در خط 207، apiUrl.replace(GEMINI_API_KEY, 'HIDDEN') را با یک تابع امن جایگزین کن که هر occurrence از API key را در URL یا پیام‌ها redact کند. ۵. در خطوط 183, 188, 224, 234 که keyPrefix را با substring(0, 10) + '...' نشان می‌دهند، این عمل را حذف کن و فقط از '[REDACTED]' استفاده کن. ۶. اطمینان حاصل کن که در تمام throw new Errorها، پیام خطا حاوی اطلاعات حساس نباشد و در صورت نیاز، خطاهای کاربرپسند و امن برگردانده شوند. ۷. متغیر GEMINI_API_KEY را پس از استفاده در memory پاک نکن (چون درخواست شامل encryption/validation نیست)، اما اطمینان حاصل کن که در scopeهای غیرضروری در دسترس نباشد.

## 💡 نمونه‌های قبل/بعد
**جایگزینی keyPrefix با '[REDACTED]' در endpoint /api/list-models**

_قبل:_
```
res.json({ models: modelNames, count: modelNames.length, keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...' });
```

_بعد:_
```
res.json({ models: modelNames, count: modelNames.length, keyPrefix: '[REDACTED]' });
```

**جایگزینی لاگینگ ناقص با تابع امن**

_قبل:_
```
console.log('Testing Gemini API with URL:', apiUrl.replace(GEMINI_API_KEY, 'HIDDEN'));
```

_بعد:_
```
console.log('Testing Gemini API with URL:', redactSensitiveData(apiUrl, [GEMINI_API_KEY]));
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `grep -n 'GEMINI_API_KEY' backend/server.js | grep -E 'console\.(log|error|warn)'`
- `grep -n 'keyPrefix' backend/server.js`
- `grep -n 'substring' backend/server.js | grep -E 'GEMINI_API_KEY|apiKey'`
- `grep -n 'throw new Error' backend/server.js | grep -E 'apiKey|GEMINI|API'`

## ⚠️ ریسک‌ها و موارد احتیاط
ریسک اصلی: تغییر لاگینگ ممکن است باعث از دست رفتن اطلاعات دیباگینگ شود. در خطوط 94, 146, 289, 322, 354, 417 که errorData از API برگشتی گرفته می‌شود، اگر errorData حاوی اطلاعات حساس باشد، باید redact شود. همچنین در خط 207 که apiUrl.replace(GEMINI_API_KEY, 'HIDDEN') استفاده شده، اگر replace به درستی کار نکند (مثلاً key در URL نباشد)، کلید فاش می‌شود. تغییر keyPrefix در خطوط 183, 188, 224, 234 ممکن است ابزارهای مانیتورینگ خارجی را که به این فیلد وابسته هستند، مختل کند.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: critical
- تخمین زمان: medium

---

## ✅ معیارهای پذیرش کلی (همهٔ مراحل)
- [ ] {'text': "زمانی که فایل `.env` وجود ندارد یا `GEMINI_API_KEY` در آن تعریف نشده، برنامه با خطای واضح 'FATAL: متغیر محیطی GEMINI_API_KEY معتبر نیست' متوقف شود و process.exit(1) فراخوانی شود.", 'verify_method': 'backend_test', 'verify_plan': {'test_path': 'backend/tests/test_validateEnv.js::test_missing_gemini_key', 'marker': 'verify'}}
- [ ] {'text': "زمانی که `GEMINI_API_KEY` با فرمت نامعتبر (مثلاً 'abc' بدون پیشوند AIza) تنظیم شده، برنامه با خطا متوقف شود.", 'verify_method': 'backend_test', 'verify_plan': {'test_path': 'backend/tests/test_validateEnv.js::test_invalid_gemini_key_format', 'marker': 'verify'}}
- [ ] {'text': "زمانی که `PORT` با مقدار غیرعددی (مثلاً 'abc') تنظیم شده، برنامه با خطا متوقف شود.", 'verify_method': 'backend_test', 'verify_plan': {'test_path': 'backend/tests/test_validateEnv.js::test_invalid_port', 'marker': 'verify'}}
- [ ] {'text': 'زمانی که همه متغیرهای محیطی معتبر هستند، برنامه بدون خطا startup شود و endpoint `/api/health` در خط 167 همچنان کار کند.', 'verify_method': 'api_response', 'verify_plan': {'method': 'GET', 'path': '/api/health', 'expected_status': 200, 'required_fields': ['status']}}
- [ ] {'text': 'فایل `backend/config/validateEnv.js` ایجاد شده و تابع `validateEnv` در `backend/server.js` بعد از `dotenv.config()` در خط 14 فراخوانی شود.', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['validateEnv', 'import.*validateEnv', "from './config/validateEnv'"], 'files_hint': ['backend/server.js', 'backend/config/validateEnv.js']}}
- [ ] {'text': 'فایل backend/utils/encryption.js باید وجود داشته باشد و شامل توابع encrypt و decrypt با AES-256-GCM باشد', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['function encrypt', 'function decrypt', 'aes-256-gcm', 'createCipheriv', 'createDecipheriv'], 'files_hint': ['backend/utils/encryption.js']}}
- [ ] {'text': 'کلید رمزنگاری (ENCRYPTION_KEY) نباید در کد منبع hard-coded شده باشد — باید از process.env.ENCRYPTION_KEY خوانده شود', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['process.env.ENCRYPTION_KEY'], 'files_hint': ['backend/utils/encryption.js', 'backend/server.js']}}
- [ ] {'text': 'مقدار GEMINI_API_KEY در backend/server.js باید از تابع decrypt عبور کند، نه مستقیم از process.env', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['decrypt\\(process.env.GEMINI_API_KEY', 'decrypt\\(encryptedKey'], 'files_hint': ['backend/server.js']}}
- [ ] {'text': 'فایل backend/.env.example باید شامل ENCRYPTION_KEY باشد', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['ENCRYPTION_KEY'], 'files_hint': ['backend/.env.example']}}
- [ ] {'text': 'سرور باید با کلید رمزنگاری\u200cشده در .env راه\u200cاندازی شود و endpoint /api/health پاسخ 200 بدهد', 'verify_method': 'api_response', 'verify_plan': {'method': 'GET', 'path': '/api/health', 'expected_status': 200, 'required_fields': ['status']}}
- [ ] {'text': "هیچ occurrence از GEMINI_API_KEY در console.log یا console.error نباید مقدار واقعی را نشان دهد — فقط '[REDACTED]' یا '***'", 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['console\\.(log|error|warn)\\(.*GEMINI_API_KEY', 'console\\.(log|error|warn)\\(.*apiKey', 'console\\.(log|error|warn)\\(.*process\\.env'], 'files_hint': ['backend/server.js']}}
- [ ] {'text': "هیچ endpoint API نباید keyPrefix یا بخشی از API key را در response برگرداند — همه باید با '[REDACTED]' جایگزین شوند", 'verify_method': 'api_response', 'verify_plan': {'method': 'GET', 'path': '/api/list-models', 'expected_status': 200, 'required_fields': ['models', 'count'], 'forbidden_fields': ['keyPrefix']}}
- [ ] {'text': 'هیچ error message در throw new Error نباید حاوی مقدار واقعی API key باشد — پیام\u200cهای خطا باید عمومی و امن باشند', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['throw new Error\\(`.*\\$\\{.*apiKey.*\\}`', 'throw new Error\\(`.*\\$\\{.*GEMINI.*\\}`'], 'files_hint': ['backend/server.js']}}
- [ ] {'text': 'تابع کمکی redactSensitiveData باید در backend/server.js تعریف شده باشد و تمام occurrenceهای API key را در رشته\u200cها redact کند', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['function redactSensitiveData', 'const redactSensitiveData'], 'files_hint': ['backend/server.js']}}
- [ ] {'text': "تماس با console.log در خط 207 باید از تابع امن استفاده کند و apiUrl.replace(GEMINI_API_KEY, 'HIDDEN') حذف شود", 'verify_method': 'static', 'verify_plan': {'grep_patterns': ["apiUrl\\.replace\\(GEMINI_API_KEY, 'HIDDEN'\\)"], 'files_hint': ['backend/server.js']}}

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  - پیاده‌سازی اعتبارسنجی (Validation) برای تمام متغیرهای محیطی در زمان راه‌اندازی برنامه
  - پیاده‌سازی رمزنگاری (Encryption) برای ذخیره‌سازی امن API keys و متغیرهای حساس

🔧 مراحل remaining که در super-task باید انجام شوند:
  - پیاده‌سازی مدیریت امن (Proper Handling) برای متغیرهای محیطی شامل لاگینگ امن و خطاهای مناسب — برخی endpointها و error messageها هنوز keyPrefix یا API key را فاش می‌کنند

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 2 از 7
  id: cf9e7da4-37c4-463e-99dd-bd6707edcce3
  عنوان اصلی: انتقال Firebase credentials به متغیرهای محیطی
  اولویت اصلی: critical
  وضعیت verify قبلی: pending
  فایل‌های دخیل: frontend/index.html

📋 acceptance_criteria کامل:
  - هیچ credential Firebase در index.html وجود نداشته باشد [verify_method=static] [verify_plan={"grep_patterns": ["apiKey", "authDomain", "projectId", "storageBucket", "messagingSenderId", "appId"], "files_hint": ["frontend/index.html"]}]
  - تمامی credentials از متغیرهای محیطی VITE_ خوانده شوند [verify_method=static] [verify_plan={"grep_patterns": ["import.meta.env.VITE_"], "files_hint": ["frontend/index.html"]}]
  - فایل .env.example با placeholderها ایجاد شود [verify_method=static] [verify_plan={"grep_patterns": ["VITE_API_KEY", "VITE_AUTH_DOMAIN", "VITE_PROJECT_ID", "VITE_STORAGE_BUCKET", "VITE_MESSAGING_SENDER_ID", "VITE_APP_ID"], "files_hint": [".env.example"]}]
  - اپلیکیشن بعد از تغییرات بدون خطا initialize شود [verify_method=ui_interaction] [verify_plan={"base": "frontend", "ui_steps": [{"action": "navigate", "url": "/"}, {"action": "wait_for_load", "state": "networkidle"}, {"action": "assert_visible", "selector": "[data-testid='app-root']"}], "expec]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در
  repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های
  مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط
  موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که
  چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.

🔍 **مسئولیت تو (مدل اجراکننده):**
- پیش از هر تغییر، خودت ساختار repo، فایل‌های ذکرشده، و وابستگی‌های آن‌ها را
  مستقل بررسی کن.
- اگر تشخیص دادی موقعیت ذکرشده در پرامپت اشتباه است یا فایل دیگری مناسب‌تر
  است، بر اساس قضاوت خودت عمل کن — این پرامپت نمی‌تواند بهانهٔ کار اشتباه
  باشد ("خودت گفتی" قابل قبول نیست).
- اگر معیارهای پذیرش (AC) مبهم/ناقص بودند، بهترین تفسیر را انتخاب کن و در
  commit message توضیح بده.

📦 **اگر کار طولانی است:**
- **خلاصه‌اش نکن.** همه را به‌طور کامل انجام بده.
- اگر یک کامیت گنجایش ندارد، در **چندین کامیت متوالی** انجام بده — ولی
  هیچ بخشی را skip نکن.
- ترتیب کامیت‌ها را منطقی نگه‌دار (foundation → core → integration → tests).
- در آخر یک checklist از همه‌ی کامیت‌ها در PR description بنویس.

---


## 🎯 هدف (خلاصه ساختاریافته)
Firebase credentials در frontend/index.html به صورت plain text و hardcoded قرار دارد

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/index.html:11-18` — `__firebase_config` — Firebase credentials در HTML عمومی
  ```
  var __firebase_config = JSON.stringify({
    apiKey: "AIzaSyAMFtV0zIMKKe0bIr68Z1wTORQ1jQpsv9Q",
    authDomain: "labaneseapp.firebaseapp.com",
    projectId: "labaneseapp",
    storageBucket: "labaneseapp.firebasestorage.app",
    messagingSenderId: "951874597795",
    appId: "1:951874597795:web:00745327993adad760a016"
  });
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Firebase Web SDK v10 + Vite

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `frontend/src/main.jsx` (سطر 1) — محل فعلی استفاده از __firebase_config
- `frontend/.env.example` (سطر 1) — برای ایجاد نمونه env
- `frontend/vite.config.js` (سطر 1) — برای اطمینان از پشتیبانی env

## 🌐 نقشهٔ وابستگی‌ها
این config در index.html تعریف شده و در main.jsx (یا App.jsx) برای initializeApp استفاده می‌شود. تغییر آن نیازمند تغییر در نحوه initialize کردن Firebase است.

## 🔍 Context و وضعیت فعلی
در frontend/index.html خطوط 11-18، Firebase configuration شامل apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId به صورت plain text در یک تگ script قرار دارد. این اطلاعات حساس به راحتی توسط هر بازدیدکننده‌ای قابل مشاهده است. اگرچه apiKey Firebase ذاتاً برای استفاده client-side طراحی شده، اما همراه با سایر اطلاعات (projectId, storageBucket) می‌تواند برای سوءاستفاده‌های محدود استفاده شود. همچنین این اطلاعات در GitHub عمومی (مشخصات ریپو: mahdighandi1989/language) قرار دارد.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] هیچ credential Firebase در index.html وجود نداشته باشد
- [ ] تمامی credentials از متغیرهای محیطی VITE_ خوانده شوند
- [ ] فایل .env.example با placeholderها ایجاد شود
- [ ] اپلیکیشن بعد از تغییرات بدون خطا initialize شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. Firebase config را به متغیرهای محیطی Vite (VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, ...) منتقل کنید و از import.meta.env در main.jsx یا یک فایل config مجزا استفاده کنید. همچنین یک فایل .env.example با placeholderها ایجاد کنید.

## 💡 نمونه‌های قبل/بعد
**Firebase config**

_قبل:_
```
<!-- index.html -->
var __firebase_config = JSON.stringify({...credentials...});
```

_بعد:_
```
// .env
VITE_FIREBASE_API_KEY=your_key_here
// main.jsx
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  ...
}
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `grep -r 'AIzaSyAMFtV0zIMKKe0bIr68Z1wTORQ1jQpsv9Q' frontend/`
- `grep -r 'VITE_FIREBASE' frontend/src/`

## ⚠️ ریسک‌ها و موارد احتیاط
کم - فقط تغییر نحوه خواندن config

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: critical
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 3 از 7
  id: f1a8e5dd-c1fa-4558-8603-d9200b6a5ce4
  عنوان اصلی: Secure Firebase config and verify backend tokens
  اولویت اصلی: critical
  وضعیت verify قبلی: partial
  فایل‌های دخیل: backend/server.js, frontend/index.html

📋 acceptance_criteria کامل:
  - Backend verifies Firebase ID tokens on /api/gemini/* endpoints [verify_method=backend_test] [verify_plan={"test_node": "tests/test_firebase_auth.py::test_verify_id_token_on_gemini_endpoints", "timeout_seconds": 60}]
  - Firebase config is loaded from environment variables, not hardcoded [verify_method=static] [verify_plan={"grep_patterns": ["process\\.env\\.FIREBASE_API_KEY", "process\\.env\\.FIREBASE_AUTH_DOMAIN", "process\\.env\\.FIREBASE_PROJECT_ID", "process\\.env\\.FIREBASE_STORAGE_BUCKET", "process\\.env\\.FIREBA]
  - Unauthenticated requests to backend return 401 [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/gemini/status", "headers": null, "json_body": null, "expected_status": 401, "required_fields": ["error"], "json_contains": null}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در
  repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های
  مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط
  موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که
  چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.

🔍 **مسئولیت تو (مدل اجراکننده):**
- پیش از هر تغییر، خودت ساختار repo، فایل‌های ذکرشده، و وابستگی‌های آن‌ها را
  مستقل بررسی کن.
- اگر تشخیص دادی موقعیت ذکرشده در پرامپت اشتباه است یا فایل دیگری مناسب‌تر
  است، بر اساس قضاوت خودت عمل کن — این پرامپت نمی‌تواند بهانهٔ کار اشتباه
  باشد ("خودت گفتی" قابل قبول نیست).
- اگر معیارهای پذیرش (AC) مبهم/ناقص بودند، بهترین تفسیر را انتخاب کن و در
  commit message توضیح بده.

📦 **اگر کار طولانی است:**
- **خلاصه‌اش نکن.** همه را به‌طور کامل انجام بده.
- اگر یک کامیت گنجایش ندارد، در **چندین کامیت متوالی** انجام بده — ولی
  هیچ بخشی را skip نکن.
- ترتیب کامیت‌ها را منطقی نگه‌دار (foundation → core → integration → tests).
- در آخر یک checklist از همه‌ی کامیت‌ها در PR description بنویس.

---


## 🎯 هدف (خلاصه ساختاریافته)
Frontend uses Firebase API keys exposed in index.html, backend lacks Firebase integration

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/index.html:11-18` — `__firebase_config` — Firebase credentials exposed in HTML; should be loaded from env
  ```
  var __firebase_config = JSON.stringify({
    apiKey: "AIzaSyAMFtV0zIMKKe0bIr68Z1wTORQ1jQpsv9Q",
    authDomain: "labaneseapp.firebaseapp.com",
    ...
  });
  ```
- `backend/server.js:1-14` — `imports` — No Firebase Admin SDK import; backend has no Firebase integration
  ```jsx
  import express from 'express';
  import cors from 'cors';
  ...
  import ffmpeg from 'fluent-ffmpeg';
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Firebase Web SDK on frontend, Express backend without Firebase Admin

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `backend/.env.example` (سطر 1) — Missing Firebase environment variables
- `frontend/src/App.jsx` (سطر 137) — Uses Firebase auth and Firestore

## 🌐 نقشهٔ وابستگی‌ها
Frontend uses Firebase for auth and Firestore; backend has no Firebase validation, making APIs vulnerable to unauthorized access.

## 🔍 Context و وضعیت فعلی
Firebase configuration (apiKey, authDomain, etc.) is hardcoded in frontend/index.html (lines 11-18) and exposed to all users. While Firebase API keys are technically public, the presence of a full Firebase config suggests authentication and database features are used. However, the backend (server.js) has no Firebase integration—no Firebase Admin SDK, no token verification, no Firestore access. This means any Firebase authentication performed on the frontend is not validated on the backend, creating a security gap where unauthenticated requests could be made to backend APIs. Additionally, the backend's .env.example does not include Firebase-related variables.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] Backend verifies Firebase ID tokens on /api/gemini/* endpoints
- [ ] Firebase config is loaded from environment variables, not hardcoded
- [ ] Unauthenticated requests to backend return 401
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. Add Firebase Admin SDK to backend for verifying Firebase ID tokens on protected endpoints. Move Firebase config to environment variables and remove hardcoded values from index.html. Update backend/.env.example with Firebase service account credentials.

## 💡 نمونه‌های قبل/بعد
**Add Firebase Admin to backend**

_قبل:_
```
// No Firebase imports in backend
```

_بعد:_
```
import admin from 'firebase-admin';
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `curl -X POST /api/gemini/chat -H 'Authorization: Bearer invalid-token' should return 401`
- `Check that index.html does not contain Firebase keys`

## ⚠️ ریسک‌ها و موارد احتیاط
Adding auth may break existing frontend calls that don't send tokens; requires frontend changes to attach auth headers

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: critical
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 4 از 7
  id: fdba8076-dc5d-470c-b7af-049761996be5
  عنوان اصلی: حذف hardcode کلیدهای Firebase از frontend
  اولویت اصلی: critical
  وضعیت verify قبلی: partial
  فایل‌های دخیل: frontend/index.html

📋 acceptance_criteria کامل:
  - هیچ credential فایربیس در فایل‌های HTML یا JS به صورت plain text وجود نداشته باشد [verify_method=static] [verify_plan={"grep_patterns": ["HTML", "credential", "plain", "فایربیس", "فایل", "صورت", "وجود", "نداشته"], "files_hint": []}]
  - Firebase config از متغیرهای محیطی (VITE_*) خوانده شود [verify_method=static] [verify_plan={"grep_patterns": ["Firebase", "config", "متغیرهای", "محیطی", "خوانده"], "files_hint": []}]
  - کلید API در Firebase Console محدود به دامنه مجاز شده باشد [verify_method=static] [verify_plan={"grep_patterns": ["Firebase", "Console", "کلید", "محدود", "دامنه", "مجاز", "باشد"], "files_hint": []}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در
  repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های
  مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط
  موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که
  چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.

🔍 **مسئولیت تو (مدل اجراکننده):**
- پیش از هر تغییر، خودت ساختار repo، فایل‌های ذکرشده، و وابستگی‌های آن‌ها را
  مستقل بررسی کن.
- اگر تشخیص دادی موقعیت ذکرشده در پرامپت اشتباه است یا فایل دیگری مناسب‌تر
  است، بر اساس قضاوت خودت عمل کن — این پرامپت نمی‌تواند بهانهٔ کار اشتباه
  باشد ("خودت گفتی" قابل قبول نیست).
- اگر معیارهای پذیرش (AC) مبهم/ناقص بودند، بهترین تفسیر را انتخاب کن و در
  commit message توضیح بده.

📦 **اگر کار طولانی است:**
- **خلاصه‌اش نکن.** همه را به‌طور کامل انجام بده.
- اگر یک کامیت گنجایش ندارد، در **چندین کامیت متوالی** انجام بده — ولی
  هیچ بخشی را skip نکن.
- ترتیب کامیت‌ها را منطقی نگه‌دار (foundation → core → integration → tests).
- در آخر یک checklist از همه‌ی کامیت‌ها در PR description بنویس.

---


## 🎯 هدف (خلاصه ساختاریافته)
Firebase API key و سایر credentials در frontend index.html به صورت hardcoded قرار دارند

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/index.html:11-18` — `__firebase_config` — کلید API و سایر credentials به صورت hardcoded در HTML
  ```
  var __firebase_config = JSON.stringify({
    apiKey: "AIzaSyAMFtV0zIMKKe0bIr68Z1wTORQ1jQpsv9Q",
    authDomain: "labaneseapp.firebaseapp.com",
    projectId: "labaneseapp",
    storageBucket: "labaneseapp.firebasestorage.app",
    messagingSenderId: "951874597795",
    appId: "1:951874597795:web:00745327993adad760a016"
  });
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Vite + React + Firebase

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `frontend/src/App.jsx` (سطر 137) — این فایل از Firebase استفاده می‌کند و ممکن است config را import کند
- `frontend/.env` — فایل env که باید این مقادیر در آن ذخیره شوند (فعلاً وجود ندارد)

## 🌐 نقشهٔ وابستگی‌ها
این یافته مربوط به کل پروژه frontend است و تمام کاربرانی که به صفحه دسترسی دارند می‌توانند این اطلاعات را ببینند.

## 🔍 Context و وضعیت فعلی
در فایل frontend/index.html، خطوط 11-18، کلید API فایربیس (AIzaSyAMFtV0zIMKKe0bIr68Z1wTORQ1jQpsv9Q) و سایر اطلاعات احراز هویت (authDomain، projectId، storageBucket، messagingSenderId، appId) به صورت plain text در کد HTML جاسازی شده‌اند. این اطلاعات در client bundle قرار می‌گیرند و هر کاربری می‌تواند با مشاهده سورس صفحه به آنها دسترسی پیدا کند. این یک نقض امنیتی جدی است زیرا مهاجم می‌تواند از این کلیدها برای دسترسی غیرمجاز به Firebase project استفاده کند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] هیچ credential فایربیس در فایل‌های HTML یا JS به صورت plain text وجود نداشته باشد
- [ ] Firebase config از متغیرهای محیطی (VITE_*) خوانده شود
- [ ] کلید API در Firebase Console محدود به دامنه مجاز شده باشد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. Firebase config را از کد frontend حذف کرده و از متغیرهای محیطی (environment variables) استفاده کنید. در Vite، می‌توانید از VITE_FIREBASE_API_KEY و غیره استفاده کنید و در زمان build این مقادیر جایگزین شوند. همچنین، محدودیت‌های دسترسی (API key restrictions) را در Firebase Console فعال کنید تا کلید فقط از دامنه‌های مجاز قابل استفاده باشد.

## 💡 نمونه‌های قبل/بعد
**حذف hardcoded config از HTML**

_قبل:_
```
var __firebase_config = JSON.stringify({ apiKey: "...", ... });
```

_بعد:_
```
// Firebase config از متغیرهای محیطی خوانده می‌شود
import.meta.env.VITE_FIREBASE_API_KEY
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `grep -r "AIzaSyAMFtV0zIMKKe0bIr68Z1wTORQ1jQpsv9Q" frontend/`
- `npm run build && grep -r "AIzaSyAMFtV0zIMKKe0bIr68Z1wTORQ1jQpsv9Q" frontend/dist/`

## ⚠️ ریسک‌ها و موارد احتیاط
اگر کلید API محدود نشود، مهاجم می‌تواند از سرویس‌های Firebase (مانند Firestore, Auth) سوءاستفاده کند و هزینه‌های غیرمجاز ایجاد کند.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: critical
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 5 از 7
  id: c7474d4f-8730-4531-b8ec-50de5a444b82
  عنوان اصلی: پیاده‌سازی هدرهای امنیتی و CORS
  اولویت اصلی: high
  وضعیت verify قبلی: pending
  فایل‌های دخیل: backend/.env.example, backend/server.js, frontend/vite.config.js

📋 acceptance_criteria کامل:
  - کتابخانه helmet در `backend/package.json` به عنوان وابستگی اضافه شده باشد. [verify_method=static] [verify_plan={"grep_patterns": ["\"helmet\":"], "files_hint": ["backend/package.json"]}]
  - import helmet در فایل `backend/server.js` در بخش importها (خطوط 1-12) اضافه شده باشد. [verify_method=static] [verify_plan={"grep_patterns": ["import helmet from 'helmet';"], "files_hint": ["backend/server.js"]}]
  - middleware `app.use(helmet())` به عنوان اولین middleware بعد از ایجاد `app` و قبل از `app.use(cors())` در فایل `backend/server.js` قرار گرفته باشد. [verify_method=static] [verify_plan={"grep_patterns": ["app.use\\(helmet\\(\\)\\)"], "files_hint": ["backend/server.js"]}]
  - هدر `X-Content-Type-Options: nosniff` در پاسخ‌های HTTP سرور (مثلاً GET /api/health) حضور داشته باشد. [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/health", "headers": null, "json_body": null, "expected_status": 200, "required_fields": [], "json_contains": null, "headers_to_check": ["x-content-type-options"]}]
  - هدر `X-Frame-Options: SAMEORIGIN` در پاسخ‌های HTTP سرور حضور داشته باشد. [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/health", "headers": null, "json_body": null, "expected_status": 200, "required_fields": [], "json_contains": null, "headers_to_check": ["x-frame-options"]}]
  - هدر `Strict-Transport-Security` در پاسخ‌های HTTP سرور حضور داشته باشد (در صورت استفاده از HTTPS). [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/health", "headers": null, "json_body": null, "expected_status": 200, "required_fields": [], "json_contains": null, "headers_to_check": ["strict-transport-security"]}]
  - CORS middleware باید originهای خاص (نه wildcard) را پشتیبانی کند: http://localhost:5173 برای توسعه و دامنه تولیدی از متغیر FRONTEND_URL [verify_method=static] [verify_plan={"grep_patterns": ["origin:", "FRONTEND_URL", "localhost:5173"], "files_hint": ["backend/server.js"]}]
  - متدهای مجاز باید شامل GET, POST, PUT, DELETE, OPTIONS باشند [verify_method=static] [verify_plan={"grep_patterns": ["methods:", "GET", "POST", "PUT", "DELETE", "OPTIONS"], "files_hint": ["backend/server.js"]}]
  - هدرهای مجاز باید شامل Content-Type و Authorization باشند [verify_method=static] [verify_plan={"grep_patterns": ["allowedHeaders:", "Content-Type", "Authorization"], "files_hint": ["backend/server.js"]}]
  - credentials باید true باشد (برای ارسال کوکی‌ها/توکن‌ها) [verify_method=static] [verify_plan={"grep_patterns": ["credentials: true"], "files_hint": ["backend/server.js"]}]
  - درخواست OPTIONS (preflight) باید پاسخ 204 با هدرهای مناسب بدهد [verify_method=api_response] [verify_plan={"method": "OPTIONS", "path": "/api/health", "headers": null, "json_body": null, "expected_status": 204, "required_fields": [], "json_contains": null}]
  - درخواست از origin غیرمجاز (مثلاً http://evil.com) باید با خطای CORS مسدود شود [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/health", "headers": null, "json_body": null, "expected_status": 403, "required_fields": [], "json_contains": null}]
  - rate limiter عمومی (100 req/15min) روی همه routeهای /api/* اعمال شود و headerهای X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset در response موجود باشند [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/health", "headers": null, "json_body": null, "expected_status": 200, "required_fields": [], "json_contains": null, "check_headers": ["x-ratelimit-limit", "x-ratelimit-r]
  - بعد از 100 درخواست به /api/health در 15 دقیقه، پاسخ 429 (Too Many Requests) برگردد [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/health", "headers": null, "json_body": null, "expected_status": 429, "required_fields": ["error"], "json_contains": null}]
  - WebSocket server در path /ws/live تحت تأثیر rate limiting قرار نگیرد و اتصال WebSocket برقرار شود [verify_method=manual_only] [verify_plan={"reason": "نیاز به تست دستی WebSocket connection — می‌توان با ابزار wscat یا کد کلاینت تست کرد"}]
  - فایل backend/middleware/rateLimiter.js ایجاد شود و configهای rate limiting را export کند [verify_method=static] [verify_plan={"grep_patterns": ["export const generalLimiter", "export const authLimiter", "export const analysisLimiter", "rateLimit"], "files_hint": ["backend/middleware/rateLimiter.js"]}]
  - endpoint /api/analyze-files محدودیت 10 req/15min داشته باشد و بعد از 10 درخواست خطای 429 برگرداند [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/analyze-files", "headers": null, "json_body": null, "expected_status": 429, "required_fields": ["error"], "json_contains": null}]
  - فایل backend/validators/schemas.js باید شامل schemaهای chatSchema، ttsSchema، analyzeFilesSchema باشد [verify_method=static] [verify_plan={"grep_patterns": ["chatSchema", "ttsSchema", "analyzeFilesSchema", "export const"], "files_hint": ["backend/validators/schemas.js"]}]
  - فایل backend/middleware/validate.js باید تابع validate(schema) را export کند که در صورت خطا، پاسخ 400 با پیام خطا برگرداند [verify_method=static] [verify_plan={"grep_patterns": ["export function validate", "export const validate", "res.status(400)", "ZodError"], "files_hint": ["backend/middleware/validate.js"]}]
  - POST /api/gemini/tts با body خالی یا نامعتبر باید status 400 برگرداند [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/gemini/tts", "headers": null, "json_body": null, "expected_status": 400, "required_fields": ["error"], "json_contains": null}]
  - POST /api/gemini/chat با body فاقد contents باید status 400 برگرداند [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/gemini/chat", "headers": null, "json_body": null, "expected_status": 400, "required_fields": ["error"], "json_contains": null}]
  - POST /api/analyze-files با بیش از 10 فایل باید status 400 برگرداند (multer خودش این کار را می‌کند، اما validation اضافی نباید تداخل ایجاد کند) [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/analyze-files", "headers": null, "json_body": null, "expected_status": 400, "required_fields": ["error"], "json_contains": null}]
  - POST /api/gemini/tts با voice نامعتبر (مثلاً 'InvalidVoice') باید status 400 برگرداند [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/gemini/tts", "headers": null, "json_body": null, "expected_status": 400, "required_fields": ["error"], "json_contains": null}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در
  repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های
  مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط
  موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که
  چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.

🔍 **مسئولیت تو (مدل اجراکننده):**
- پیش از هر تغییر، خودت ساختار repo، فایل‌های ذکرشده، و وابستگی‌های آن‌ها را
  مستقل بررسی کن.
- اگر تشخیص دادی موقعیت ذکرشده در پرامپت اشتباه است یا فایل دیگری مناسب‌تر
  است، بر اساس قضاوت خودت عمل کن — این پرامپت نمی‌تواند بهانهٔ کار اشتباه
  باشد ("خودت گفتی" قابل قبول نیست).
- اگر معیارهای پذیرش (AC) مبهم/ناقص بودند، بهترین تفسیر را انتخاب کن و در
  commit message توضیح بده.

📦 **اگر کار طولانی است:**
- **خلاصه‌اش نکن.** همه را به‌طور کامل انجام بده.
- اگر یک کامیت گنجایش ندارد، در **چندین کامیت متوالی** انجام بده — ولی
  هیچ بخشی را skip نکن.
- ترتیب کامیت‌ها را منطقی نگه‌دار (foundation → core → integration → tests).
- در آخر یک checklist از همه‌ی کامیت‌ها در PR description بنویس.

---


---

## 📥 درخواست خام کاربر (verbatim — همان متنی که کاربر نوشت)
_(همهٔ URL ها، آدرس‌ها، نام‌ها، و کلمات کلیدی در این متن دست‌نخورده هستند.)_

```
فقدان security middleware مانند helmet، CORS configuration، rate limiting و input validation باعث آسیب‌پذیری‌های امنیتی جدی می‌شود. برای یک اپلیکیشن که با AI API ارتباط برقرار می‌کند، این موارد حیاتی هستند.
```

## 📋 چک‌لیست مراحل (4 مرحله)

این تسک به مراحل کوچک‌تر تقسیم شده. **در هر verify خودکار، وضعیت هر مرحله به‌صورت `[ ]` (انجام نشده)، `[~]` (ناقص)، یا `[x]` (انجام شده) به‌روز می‌شود.**
وقتی تمام مراحل `[x]` شدند، تسک به‌طور خودکار به «انجام شده» منتقل می‌شود.

- [ ] **مرحله 1: اضافه کردن middleware امنیتی helmet برای تنظیم هدرهای HTTP امنیتی** — این مرحله شامل نصب و پیکربندی کتابخانه helmet (یا معادل آن در فریم‌ورک مورد استفاده) به عنوان middleware در اپلیکیشن است. هدف تنظیم خودکار هدرهای امنیتی مانند X-Content-Type-Options، X-Frame-Options، Strict-Transport-Security و غیره است. خارج از این مرحله: پیکربندی CORS، rate limiting، یا input vali
- [ ] **مرحله 2: پیکربندی CORS middleware برای کنترل دسترسی cross-origin** — این مرحله شامل نصب و پیکربندی middleware CORS (مانند cors در Express یا معادل آن در فریم‌ورک) است. باید دامنه‌های مجاز (allow origins)، متدهای مجاز (GET, POST, PUT, DELETE, OPTIONS)، و هدرهای مجاز مشخص شوند. خارج از این مرحله: helmet، rate limiting، یا input validation. نکته حیاتی: برای اپلیکیشنی که
- [ ] **مرحله 3: پیاده‌سازی rate limiting middleware برای جلوگیری از حملات brute force و DoS** — این مرحله شامل نصب و پیکربندی middleware rate limiting (مانند express-rate-limit یا معادل آن) است. باید محدودیت تعداد درخواست‌ها در بازه زمانی مشخص (مثلاً 100 درخواست در 15 دقیقه) برای هر IP تعریف شود. همچنین باید مسیرهای حساس مانند /api/auth/login محدودیت سخت‌تری داشته باشند. خارج از این مرحله: hel
- [ ] **مرحله 4: پیاده‌سازی input validation middleware برای تمام ورودی‌های کاربر** — این مرحله شامل نصب و پیکربندی کتابخانه validation (مانند Joi، express-validator، یا Zod) و ایجاد middleware برای اعتبارسنجی تمام ورودی‌های دریافتی از کاربر (body، query parameters، URL parameters) است. باید قوانین validation برای هر endpoint تعریف شود (مثلاً نوع داده، طول، الگو). خارج از این مرحله: 

---

# 🔹 مرحله 1: اضافه کردن middleware امنیتی helmet برای تنظیم هدرهای HTTP امنیتی

**Scope:** این مرحله شامل نصب و پیکربندی کتابخانه helmet (یا معادل آن در فریم‌ورک مورد استفاده) به عنوان middleware در اپلیکیشن است. هدف تنظیم خودکار هدرهای امنیتی مانند X-Content-Type-Options، X-Frame-Options، Strict-Transport-Security و غیره است. خارج از این مرحله: پیکربندی CORS، rate limiting، یا input validation. نکته حیاتی: helmet باید به عنوان اولین middleware در زنجیره middlewareها قرار گیرد تا هدرها برای تمام پاسخ‌ها تنظیم شوند.
**Key terms:** helmet, security middleware, HTTP headers, X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security

**بخش مربوط از متن کاربر:**
```
فقدان security middleware مانند helmet، CORS configuration، rate limiting و input validation باعث آسیب‌پذیری‌های امنیتی جدی می‌شود. برای یک اپلیکیشن که با AI API ارتباط برقرار می‌کند، این موارد حیاتی هستند.
```

## 🎯 هدف (خلاصه ساختاریافته)
افزودن middleware امنیتی helmet به اپلیکیشن Express

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/server.js:38-48` — `app initialization and middleware setup` — این بخش از کد نشان‌دهنده محل فعلی middlewareهاست. helmet باید به عنوان اولین middleware بعد از ایجاد `app` و قبل از `app.use(cors())` اضافه شود.
  ```jsx
  const app = express();
  const PORT = process.env.PORT || 3001;
  
  // Create HTTP server
  const server = createServer(app);
  
  // Create WebSocket server
  const wss = new WebSocketServer({ server, path: '/ws/live' });
  
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  ```
- `backend/server.js:1-12` — `import statements` — import جدید برای helmet باید به این بخش اضافه شود.
  ```jsx
  import express from 'express';
  import cors from 'cors';
  import { fileURLToPath } from 'url';
  import { dirname, join } from 'path';
  import dotenv from 'dotenv';
  import { createServer } from 'http';
  import { WebSocketServer, WebSocket } from 'ws';
  import multer from 'multer';
  import fs from 'fs';
  import os from 'os';
  import ffmpeg from 'fluent-ffmpeg';
  import ffmpegStatic from 'ffmpeg-static';
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Stack تشخیص داده شده: JavaScript (Node.js) با فریم‌ورک Express. کتابخانه‌های مرتبط: cors, express, helmet (جدید).

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `backend/package.json` (سطر 10) — برای نصب وابستگی helmet باید در این فایل ثبت شود.
- `backend/package-lock.json` (سطر 1) — پس از نصب helmet، این فایل به‌روزرسانی می‌شود.
- `frontend/vite.config.js` (سطر 8) — تنظیمات proxy در Vite ممکن است تحت تأثیر هدرهای امنیتی جدید قرار گیرد (مثلاً X-Frame-Options).

## 🌐 نقشهٔ وابستگی‌ها
این تغییر فقط فایل `backend/server.js` را به‌طور مستقیم تغییر می‌دهد. وابستگی جدید `helmet` به `backend/package.json` و `backend/package-lock.json` اضافه می‌شود. هیچ فایل دیگری در frontend یا backend به‌طور مستقیم تحت تأثیر قرار نمی‌گیرد، اما هدرهای امنیتی تنظیم‌شده توسط helmet بر تمام پاسخ‌های HTTP سرور تأثیر می‌گذارند، از جمله پاسخ‌های API و فایل‌های استاتیک. فایل `frontend/vite.config.js` ممکن است در محیط توسعه نیاز به تنظیمات اضافی برای هماهنگی با هدرهای امنیتی داشته باشد.

## 🔍 Context و وضعیت فعلی
کاربر درخواست اضافه کردن middleware امنیتی helmet برای تنظیم هدرهای HTTP امنیتی مانند X-Content-Type-Options، X-Frame-Options، Strict-Transport-Security و غیره را دارد. این درخواست از نوع bug با اولویت high است. بر اساس تحلیل کد واقعی در فایل `backend/server.js` (خطوط 38-48)، اپلیکیشن Express در حال حاضر فقط از middleware `cors()` و `express.json()` استفاده می‌کند و هیچ middleware امنیتی مانند helmet وجود ندارد. کاربر تأکید کرده که helmet باید به عنوان اولین middleware در زنجیره middlewareها قرار گیرد تا هدرها برای تمام پاسخ‌ها تنظیم شوند. همچنین اشاره شده که خارج از این مرحله: پیکربندی CORS، rate limiting، یا input validation است. کلیدواژه‌های اصلی: helmet, security middleware, HTTP headers, X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security. در فایل `backend/server.js` خط 47: `app.use(cors());` و خط 48: `app.use(express.json({ limit: '10mb' }));` نشان‌دهنده ترتیب فعلی middlewareهاست که helmet باید قبل از آن‌ها قرار گیرد.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] کتابخانه helmet در `backend/package.json` به عنوان وابستگی اضافه شده باشد.
- [ ] import helmet در فایل `backend/server.js` در بخش importها (خطوط 1-12) اضافه شده باشد.
- [ ] middleware `app.use(helmet())` به عنوان اولین middleware بعد از ایجاد `app` و قبل از `app.use(cors())` در فایل `backend/server.js` قرار گرفته باشد.
- [ ] هدر `X-Content-Type-Options: nosniff` در پاسخ‌های HTTP سرور (مثلاً GET /api/health) حضور داشته باشد.
- [ ] هدر `X-Frame-Options: SAMEORIGIN` در پاسخ‌های HTTP سرور حضور داشته باشد.
- [ ] هدر `Strict-Transport-Security` در پاسخ‌های HTTP سرور حضور داشته باشد (در صورت استفاده از HTTPS).
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. 1. نصب کتابخانه helmet با دستور `npm install helmet` در پوشه `backend/`.
2. در فایل `backend/server.js`، بعد از خط 46 (ایجاد WebSocket server) و قبل از خط 47 (`app.use(cors())`)، import کتابخانه helmet را اضافه کن: `import helmet from 'helmet';`.
3. بلافاصله بعد از import، خط `app.use(helmet());` را به عنوان اولین middleware اضافه کن تا هدرهای امنیتی مانند X-Content-Type-Options، X-Frame-Options، Strict-Transport-Security برای تمام پاسخ‌ها تنظیم شوند.
4. اطمینان حاصل کن که helmet قبل از `cors()` و `express.json()` قرار گرفته است.
5. تست کن که هدرهای امنیتی در پاسخ‌های HTTP حضور دارند.

## 💡 نمونه‌های قبل/بعد
**اضافه کردن import و middleware helmet**

_قبل:_
```
import express from 'express';
import cors from 'cors';
...
app.use(cors());
app.use(express.json({ limit: '10mb' }));
```

_بعد:_
```
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
...
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `cd backend && npm install helmet`
- `cd backend && npm test`
- `curl -I http://localhost:3001/api/health | grep -i 'x-content-type-options'`
- `curl -I http://localhost:3001/api/health | grep -i 'x-frame-options'`

## ⚠️ ریسک‌ها و موارد احتیاط
تنظیم هدر `X-Frame-Options: SAMEORIGIN` توسط helmet ممکن است باعث شود که اپلیکیشن در iframeهای خارجی (مثلاً در Inspector Bridge Script که در `frontend/index.html` خطوط 31-201 تعبیه شده) به درستی کار نکند. این اسکریپت از `window.parent.postMessage` برای ارتباط با parent استفاده می‌کند و ممکن است تحت تأثیر این هدر قرار گیرد. همچنین، هدر `Content-Security-Policy` پیش‌فرض helmet ممکن است اسکریپت‌های inline (مانند Firebase config در `frontend/index.html` خطوط 9-20) را مسدود کند. باید پیکربندی helmet به‌گونه‌ای انجام شود که با نیازهای خاص پروژه (مانند اسکریپت‌های inline و iframe) سازگار باشد.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: high
- تخمین زمان: small

---

# 🔹 مرحله 2: پیکربندی CORS middleware برای کنترل دسترسی cross-origin

**Scope:** این مرحله شامل نصب و پیکربندی middleware CORS (مانند cors در Express یا معادل آن در فریم‌ورک) است. باید دامنه‌های مجاز (allow origins)، متدهای مجاز (GET, POST, PUT, DELETE, OPTIONS)، و هدرهای مجاز مشخص شوند. خارج از این مرحله: helmet، rate limiting، یا input validation. نکته حیاتی: برای اپلیکیشنی که با AI API ارتباط دارد، باید originهای خاص (نه wildcard) تعریف شوند و credentials در صورت نیاز فعال شوند.
**Key terms:** CORS configuration, cross-origin, allow origins, cors middleware, credentials

**بخش مربوط از متن کاربر:**
```
فقدان security middleware مانند helmet، CORS configuration، rate limiting و input validation باعث آسیب‌پذیری‌های امنیتی جدی می‌شود. برای یک اپلیکیشن که با AI API ارتباط برقرار می‌کند، این موارد حیاتی هستند.
```

## 🎯 هدف (خلاصه ساختاریافته)
پیکربندی CORS middleware با originهای خاص در Express

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/server.js:47` — `app.use(cors())` — خط فعلی CORS با پیکربندی پیش‌فرض (wildcard) که باید به originهای خاص محدود شود. این خط در فایل اصلی backend قرار دارد و تمام درخواست‌های API را تحت تأثیر قرار می‌دهد.
  ```jsx
  app.use(cors());
  ```
- `backend/server.js:48` — `app.use(express.json({ limit: '10mb' }))` — این خط مربوط به JSON body parser است. اگرچه مستقیماً به CORS مربوط نیست، اما input validation در اینجا انجام نمی‌شود که کاربر به آن اشاره کرده است. برای CORS نیازی به تغییر نیست.
- `backend/.env.example:1-8` — `GEMINI_API_KEY, PORT, VITE_FIREBASE_CONFIG` — فایل نمونه متغیرهای محیطی. باید FRONTEND_URL به آن اضافه شود تا دامنه تولیدی برای CORS قابل تنظیم باشد.
- `frontend/vite.config.js:8-14` — `proxy configuration` — پیکربندی proxy در Vite که درخواست‌های /api را به backend هدایت می‌کند. این تنظیم در توسعه کار می‌کند اما در production باید CORS به درستی پیکربندی شود.
  ```jsx
  server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        }
      }
    }
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Express.js (backend)، React/Vite (frontend)، پکیج cors (^2.8.5)، WebSocket (ws) برای ارتباط live، Gemini AI API

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `backend/package.json` (سطر 11) — شامل وابستگی cors است (خط 11: "cors": "^2.8.5") که باید نصب شده باشد.
- `frontend/src/App.jsx` (سطر 1) — کامپوننت اصلی frontend که درخواست‌های API به backend را از طریق fetch/axios انجام می‌دهد. تغییر CORS روی این درخواست‌ها تأثیر می‌گذارد.
- `frontend/index.html` (سطر 65) — فایل HTML اصلی که شامل Inspector Bridge Script است. این اسکریپت از postMessage برای ارتباط cross-origin استفاده می‌کند (خط 65: window.parent.postMessage).
- `render.yaml` (سطر 1) — فایل کانفیگ deployment در Render. ممکن است نیاز به تنظیم env vars برای FRONTEND_URL در اینجا باشد.

## 🌐 نقشهٔ وابستگی‌ها
این تغییر مستقیماً روی فایل backend/server.js (خط 47) اعمال می‌شود. وابستگی cors در backend/package.json (خط 11) باید نصب باشد. frontend/vite.config.js (خطوط 8-14) proxy را برای توسعه تنظیم می‌کند که با CORS تداخل ندارد. frontend/src/App.jsx درخواست‌های API را ارسال می‌کند که تحت تأثیر CORS قرار می‌گیرند. frontend/index.html شامل Inspector Bridge Script است که از postMessage استفاده می‌کند (خط 65) و ممکن است نیاز به تنظیم origin در CORS داشته باشد. render.yaml برای deployment استفاده می‌شود و باید متغیر FRONTEND_URL در آن تنظیم شود.

## 🔍 Context و وضعیت فعلی
کاربر درخواست پیکربندی CORS middleware برای کنترل دسترسی cross-origin در اپلیکیشن آموزش لهجه لبنانی را داده است. این درخواست از نوع bug با اولویت high ثبت شده است. متن کامل درخواست: "پیکربندی CORS middleware برای کنترل دسترسی cross-origin. این مرحله شامل نصب و پیکربندی middleware CORS (مانند cors در Express یا معادل آن در فریم‌ورک) است. باید دامنه‌های مجاز (allow origins)، متدهای مجاز (GET, POST, PUT, DELETE, OPTIONS)، و هدرهای مجاز مشخص شوند. خارج از این مرحله: helmet، rate limiting، یا input validation. نکته حیاتی: برای اپلیکیشنی که با AI API ارتباط دارد، باید originهای خاص (نه wildcard) تعریف شوند و credentials در صورت نیاز فعال شوند." همچنین کاربر به فقدان security middleware مانند helmet، CORS configuration، rate limiting و input validation اشاره کرده که باعث آسیب‌پذیری‌های امنیتی جدی می‌شود. کلیدواژه‌ها: CORS configuration, cross-origin, allow origins, cors middleware, credentials.

شواهد در کد واقعی پروژه: در فایل backend/server.js خط 47، CORS با پیکربندی پیش‌فرض و بدون هیچ محدودیتی تنظیم شده است: `app.use(cors());`. این یعنی همه originها (wildcard) اجازه دسترسی دارند که برای اپلیکیشنی که با AI API (Gemini) ارتباط دارد، ناامن است. همچنین در خط 48، `app.use(express.json({ limit: '10mb' }));` برای parsing JSON استفاده شده اما هیچ validation روی input انجام نمی‌شود. اپلیکیشن از Express.js در backend و React/Vite در frontend استفاده می‌کند و backend در پورت 3001 و frontend در پورت 5173 (توسعه) اجرا می‌شود.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] CORS middleware باید originهای خاص (نه wildcard) را پشتیبانی کند: http://localhost:5173 برای توسعه و دامنه تولیدی از متغیر FRONTEND_URL
- [ ] متدهای مجاز باید شامل GET, POST, PUT, DELETE, OPTIONS باشند
- [ ] هدرهای مجاز باید شامل Content-Type و Authorization باشند
- [ ] credentials باید true باشد (برای ارسال کوکی‌ها/توکن‌ها)
- [ ] درخواست OPTIONS (preflight) باید پاسخ 204 با هدرهای مناسب بدهد
- [ ] درخواست از origin غیرمجاز (مثلاً http://evil.com) باید با خطای CORS مسدود شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. 1. نصب پکیج cors در backend (اگر نصب نیست): در backend/package.json خط 11 وابستگی cors وجود دارد (`"cors": "^2.8.5"`) اما باید مطمئن شویم نصب شده است.
2. در فایل backend/server.js خط 47، پیکربندی فعلی `app.use(cors());` را با پیکربندی امن‌تر جایگزین کنیم:
   - origin: آرایه‌ای از originهای مجاز شامل:
     - `http://localhost:5173` (برای توسعه frontend)
     - `http://localhost:3001` (خود backend)
     - دامنه تولیدی (مثلاً از متغیر محیطی `FRONTEND_URL`)
   - methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
   - allowedHeaders: ['Content-Type', 'Authorization']
   - credentials: true (برای ارسال کوکی‌ها/توکن‌ها)
3. اضافه کردن پشتیبانی از preflight requests (OPTIONS) به صورت خودکار توسط cors middleware انجام می‌شود.
4. تنظیم متغیر محیطی FRONTEND_URL در backend/.env.example برای دامنه تولید.
5. اطمینان از اینکه frontend/vite.config.js (خطوط 8-14) proxy را به درستی تنظیم کرده است: `target: 'http://localhost:3001'`.

## 💡 نمونه‌های قبل/بعد
**پیکربندی CORS در backend/server.js**

_قبل:_
```
app.use(cors());
```

_بعد:_
```
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3001',
    process.env.FRONTEND_URL || 'https://labaneseapp.onrender.com'
  ].filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
```

**اضافه کردن FRONTEND_URL به backend/.env.example**

_قبل:_
```
# Port (optional, default 3001)
PORT=3001
```

_بعد:_
```
# Port (optional, default 3001)
PORT=3001

# Frontend URL for CORS (production)
FRONTEND_URL=https://labaneseapp.onrender.com
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `cd backend && node -e "const cors = require('cors'); console.log('cors module loaded');"`
- `cd backend && node server.js & sleep 2 && curl -H "Origin: http://localhost:5173" -I http://localhost:3001/api/health`
- `cd backend && node server.js & sleep 2 && curl -H "Origin: http://evil.com" -I http://localhost:3001/api/health`
- `cd frontend && npm run build && echo 'Frontend build successful'`

## ⚠️ ریسک‌ها و موارد احتیاط
تنظیم originهای اشتباه می‌تواند دسترسی frontend به backend را قطع کند. اگر credentials: true فعال شود، origin نمی‌تواند wildcard باشد (الزام مرورگر). WebSocket در خط 45 (wss = new WebSocketServer({ server, path: '/ws/live' })) ممکن است تحت تأثیر CORS قرار نگیرد چون WebSocket پروتکل متفاوتی دارد، اما باید تست شود. Inspector Bridge Script در frontend/index.html (خط 65) از postMessage استفاده می‌کند که تحت تأثیر CORS نیست اما origin فرستنده باید بررسی شود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: high
- تخمین زمان: small

---

# 🔹 مرحله 3: پیاده‌سازی rate limiting middleware برای جلوگیری از حملات brute force و DoS

**Scope:** این مرحله شامل نصب و پیکربندی middleware rate limiting (مانند express-rate-limit یا معادل آن) است. باید محدودیت تعداد درخواست‌ها در بازه زمانی مشخص (مثلاً 100 درخواست در 15 دقیقه) برای هر IP تعریف شود. همچنین باید مسیرهای حساس مانند /api/auth/login محدودیت سخت‌تری داشته باشند. خارج از این مرحله: helmet، CORS، یا input validation. نکته حیاتی: rate limiting باید برای endpointهای عمومی و حساس به طور جداگانه پیکربندی شود.
**Key terms:** rate limiting, express-rate-limit, brute force, DoS, IP-based limiting, /api/auth/login

**بخش مربوط از متن کاربر:**
```
فقدان security middleware مانند helmet، CORS configuration، rate limiting و input validation باعث آسیب‌پذیری‌های امنیتی جدی می‌شود. برای یک اپلیکیشن که با AI API ارتباط برقرار می‌کند، این موارد حیاتی هستند.
```

## 🎯 هدف (خلاصه ساختاریافته)
افزودن rate limiting middleware برای API endpoints

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/server.js:38-48` — `app definition and middleware setup` — محل فعلی middlewareها. rate limiter عمومی باید بعد از cors() و قبل از routeها اضافه شود. WebSocket server نباید rate limit شود.
  ```jsx
  const app = express();
  const PORT = process.env.PORT || 3001;
  
  // Create HTTP server
  const server = createServer(app);
  
  // Create WebSocket server
  const wss = new WebSocketServer({ server, path: '/ws/live' });
  
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  ```
- `backend/server.js:56-114` — `POST /api/gemini/chat endpoint` — این endpoint با AI API خارجی ارتباط دارد و باید محدودیت 20 req/15min داشته باشد تا از مصرف بیش از حد API key جلوگیری شود.
  ```jsx
  app.post('/api/gemini/chat', async (req, res) => {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }
  
    try {
      const payload = req.body;
      const includeAudio = payload.includeAudio;
      delete payload.includeAudio;
  ```
- `backend/server.js:698-715` — `POST /api/analyze-files endpoint` — این endpoint فایل آپلود می‌کند و منابع سرور را مصرف می‌کند. باید محدودیت 10 req/15min داشته باشد.
  ```jsx
  app.post('/api/analyze-files', upload.array('files', 10), handleMulterError, async (req, res) => {
    console.log('Received file analysis request');
  
    if (!GEMINI_API_KEY) {
      console.error('API key not configured');
      return res.status(500).json({ error: 'API key not configured' });
    }
  
    try {
      const files = req.files || [];
      const textContent = req.body.textContent || '';
      const userInstructions = req.body.userInstructions || '';
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
JavaScript, Express.js, WebSocket (ws), multer, fluent-ffmpeg, dotenv, cors

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `backend/package.json` (سطر 10) — برای نصب وابستگی express-rate-limit باید package.json به‌روز شود
- `backend/package-lock.json` (سطر 1) — بعد از نصب express-rate-limit، package-lock.json به‌طور خودکار به‌روز می‌شود
- `frontend/vite.config.js` (سطر 8) — Vite proxy در خط 8-12 درخواست‌های /api را به backend هدایت می‌کند. rate limiting در backend اعمال می‌شود و frontend تحت تأثیر نیست.
- `frontend/src/App.jsx` (سطر 1) — کامپوننت‌های frontend که API calls می‌کنند ممکن است با خطاهای 429 (Too Many Requests) مواجه شوند. باید handling مناسب اضافه شود.

## 🌐 نقشهٔ وابستگی‌ها
این تغییر به فایل backend/server.js اعمال می‌شود که فایل اصلی Express.js backend است. یک فایل جدید backend/middleware/rateLimiter.js ایجاد می‌شود. وابستگی express-rate-limit به backend/package.json اضافه می‌شود. WebSocket server (wss در خط 45) نباید rate limit شود. frontend/src/App.jsx ممکن است نیاز به handling خطاهای 429 داشته باشد. frontend/vite.config.js تحت تأثیر نیست چون proxy فقط مسیریابی می‌کند.

## 🔍 Context و وضعیت فعلی
کاربر درخواست پیاده‌سازی rate limiting middleware برای جلوگیری از حملات brute force و DoS داده است. این درخواست با اولویت high و نوع bug ثبت شده. کاربر مشخص کرده که باید از express-rate-limit یا معادل آن استفاده شود و محدودیت تعداد درخواست‌ها در بازه زمانی مشخص (مثلاً 100 درخواست در 15 دقیقه) برای هر IP تعریف شود. همچنین مسیرهای حساس مانند /api/auth/login باید محدودیت سخت‌تری داشته باشند. کاربر تأکید کرده که helmet، CORS، یا input validation خارج از این مرحله هستند. نکته حیاتی: rate limiting باید برای endpointهای عمومی و حساس به طور جداگانه پیکربندی شود.

بر اساس کد واقعی پروژه (backend/server.js)، این اپلیکیشن یک backend Express.js است که در خطوط 38-48 تعریف شده و شامل endpointهای زیر است:
- POST /api/gemini/chat (خط 56)
- POST /api/gemini/tts (خط 117)
- GET /api/health (خط 167)
- GET /api/list-models (خط 172)
- GET /api/test-gemini (خط 195)
- POST /api/analyze-files (خط 698)

همچنین یک WebSocket server در خط 45 (wss) روی path /ws/live وجود دارد. کاربر به طور خاص به /api/auth/login اشاره کرده که در حال حاضر در کد وجود ندارد، اما باید برای توسعه آینده در نظر گرفته شود.

کلیدواژه‌های کاربر: rate limiting, express-rate-limit, brute force, DoS, IP-based limiting, /api/auth/login

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] rate limiter عمومی (100 req/15min) روی همه routeهای /api/* اعمال شود و headerهای X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset در response موجود باشند
- [ ] بعد از 100 درخواست به /api/health در 15 دقیقه، پاسخ 429 (Too Many Requests) برگردد
- [ ] WebSocket server در path /ws/live تحت تأثیر rate limiting قرار نگیرد و اتصال WebSocket برقرار شود
- [ ] فایل backend/middleware/rateLimiter.js ایجاد شود و configهای rate limiting را export کند
- [ ] endpoint /api/analyze-files محدودیت 10 req/15min داشته باشد و بعد از 10 درخواست خطای 429 برگرداند
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. 1. نصب پکیج express-rate-limit با دستور npm install express-rate-limit در backend
2. ایجاد یک فایل جدید backend/middleware/rateLimiter.js برای تعریف configهای rate limiting
3. تعریف rate limiter عمومی: 100 درخواست در 15 دقیقه برای هر IP
4. تعریف rate limiter سخت‌گیرانه برای endpointهای حساس: 5 درخواست در 15 دقیقه برای /api/auth/login (برای آینده)
5. تعریف rate limiter ملایم‌تر برای endpointهای تحلیلی: 20 درخواست در 15 دقیقه برای /api/analyze-files
6. اعمال rate limiter عمومی روی همه routeها در backend/server.js بعد از خط 48 (app.use(cors()))
7. اعمال rate limiter اختصاصی روی routeهای حساس با استفاده از app.use('/api/auth', authLimiter)
8. اطمینان از اینکه WebSocket server (خط 45) تحت تأثیر rate limiting قرار نگیرد
9. اضافه کردن headerهای X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset در response
10. لاگ کردن درخواست‌های rate limited برای مانیتورینگ

## 💡 نمونه‌های قبل/بعد
**اعمال rate limiter عمومی روی همه routeها**

_قبل:_
```
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static files from frontend build
app.use(express.static(join(__dirname, '../frontend/dist')));
```

_بعد:_
```
import rateLimit from 'express-rate-limit';

// General rate limiter: 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(generalLimiter);

// Serve static files from frontend build
app.use(express.static(join(__dirname, '../frontend/dist')));
```

**rate limiter اختصاصی برای endpointهای حساس**

_قبل:_
```
// No rate limiting for specific endpoints
```

_بعد:_
```
// Strict rate limiter for auth endpoints (future use)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later.' },
  skipSuccessfulRequests: true
});

// Apply to auth routes (when implemented)
// app.use('/api/auth', authLimiter);

// Moderate rate limiter for analysis endpoints
const analysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many analysis requests, please try again later.' }
});

app.use('/api/analyze-files', analysisLimiter);
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `cd backend && npm install express-rate-limit`
- `cd backend && node server.js &`
- `curl -I http://localhost:3001/api/health | grep -i x-ratelimit`
- `for i in $(seq 1 101); do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/api/health; done | sort | uniq -c`
- `node -e "const WebSocket = require('ws'); const ws = new WebSocket('ws://localhost:3001/ws/live'); ws.on('open', () => { console.log('WebSocket connected'); ws.close(); }); ws.on('error', (e) => console.error('WS error:', e.message));"`

## ⚠️ ریسک‌ها و موارد احتیاط
1. WebSocket server (wss در خط 45 backend/server.js) نباید rate limit شود — باید middleware فقط روی Express routeها اعمال شود. 2. rate limiter عمومی ممکن است health check endpoint (/api/health در خط 167) را محدود کند که برای monitoring حیاتی است —可以考虑 استثنا. 3. frontend/src/App.jsx ممکن است handling خطاهای 429 را نداشته باشد و کاربر خطای غیرمنتظره ببیند. 4. در محیط development با proxy Vite (frontend/vite.config.js خط 8-12)، rate limiting ممکن است IP کلاینت را اشتباه تشخیص دهد (همیشه localhost). باید trust proxy تنظیم شود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: high
- تخمین زمان: small

---

# 🔹 مرحله 4: پیاده‌سازی input validation middleware برای تمام ورودی‌های کاربر

**Scope:** این مرحله شامل نصب و پیکربندی کتابخانه validation (مانند Joi، express-validator، یا Zod) و ایجاد middleware برای اعتبارسنجی تمام ورودی‌های دریافتی از کاربر (body، query parameters، URL parameters) است. باید قوانین validation برای هر endpoint تعریف شود (مثلاً نوع داده، طول، الگو). خارج از این مرحله: helmet، CORS، rate limiting. نکته حیاتی: validation باید در سطح middleware انجام شود و قبل از رسیدن به handler اصلی اجرا گردد.
**Key terms:** input validation, Joi, express-validator, Zod, body validation, query parameters, URL parameters

**بخش مربوط از متن کاربر:**
```
فقدان security middleware مانند helmet، CORS configuration، rate limiting و input validation باعث آسیب‌پذیری‌های امنیتی جدی می‌شود. برای یک اپلیکیشن که با AI API ارتباط برقرار می‌کند، این موارد حیاتی هستند.
```

## 🎯 هدف (خلاصه ساختاریافته)
افزودن middleware اعتبارسنجی ورودی با Joi/Zod

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/server.js:56-114` — `POST /api/gemini/chat` — این endpoint payload.contents را بدون validation پردازش می‌کند. نیاز به validation schema برای ساختار contents، role، parts، inline_data
  ```jsx
  app.post('/api/gemini/chat', async (req, res) => {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }
    try {
      const payload = req.body;
      const includeAudio = payload.includeAudio;
      delete payload.includeAudio;
      if (payload.contents) {
        payload.contents = payload.contents.map(content => ({
          role: content.role,
          parts: content.parts.map(part => {
            if (part.inline_data && includeAudio) {
              return { inline_data: part.inline_data };
            }
            if (part.text !== undefined) {
              return { text: part.text };
            }
            return null;
          }).filter(p => p !== null)
        }));
      }
  ```
- `backend/server.js:117-164` — `POST /api/gemini/tts` — prompt و voice بدون validation دریافت می‌شوند. voice باید از لیست مجاز باشد و prompt نباید خالی باشد
  ```jsx
  app.post('/api/gemini/tts', async (req, res) => {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }
    try {
      const { prompt, voice = 'Kore' } = req.body;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`;
  ```
- `backend/server.js:698-715` — `POST /api/analyze-files` — فایل‌ها و textContent بدون validation دقیق دریافت می‌شوند. نیاز به validation برای تعداد فایل‌ها، نوع MIME، حداکثر طول textContent
  ```jsx
  app.post('/api/analyze-files', upload.array('files', 10), handleMulterError, async (req, res) => {
    console.log('Received file analysis request');
    if (!GEMINI_API_KEY) {
      console.error('API key not configured');
      return res.status(500).json({ error: 'API key not configured' });
    }
    try {
      const files = req.files || [];
      const textContent = req.body.textContent || '';
      const userInstructions = req.body.userInstructions || '';
      console.log(`Files received: ${files.length}, Text length: ${textContent.length}`);
      if (files.length === 0 && !textContent.trim()) {
        return res.status(400).json({ error: 'هیچ فایل یا متنی برای تحلیل ارسال نشده است' });
      }
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Stack تشخیص داده شده: JavaScript (Node.js backend با Express، فرانت‌اند React با Vite). کتابخانه‌های مرتبط: express (نسخه 4.22.1 در backend/package-lock.json خط ۲۶۱-۳۰۶)، multer برای آپلود فایل (خط ۸-۳۳ در server.js)، ws برای WebSocket (خط ۷ در server.js). کتابخانه پیشنهادی برای validation: Zod (نسخه 3.x) یا Joi (نسخه 17.x).

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `backend/package.json` (سطر 10) — نیاز به اضافه کردن وابستگی zod یا joi در dependencies
- `backend/.env.example` (سطر 1) — ممکن است نیاز به اضافه کردن متغیر محیطی برای فعال/غیرفعال کردن validation باشد
- `frontend/src/App.jsx` (سطر 1) — فرانت‌اند این endpointها را call می‌کند و ممکن است نیاز به تطبیق با خطاهای validation جدید داشته باشد
- `render.yaml` (سطر 1) — اگر validation نیاز به متغیر محیطی جدید داشته باشد، باید در render.yaml نیز اضافه شود

## 🌐 نقشهٔ وابستگی‌ها
این تغییرات روی backend/server.js تأثیر مستقیم دارد. فایل‌های جدید backend/validators/schemas.js و backend/middleware/validate.js ایجاد می‌شوند. وابستگی zod به backend/package.json اضافه می‌شود. فرانت‌اند (frontend/src/App.jsx) که این endpointها را از طریق proxy Vite (frontend/vite.config.js خط ۸-۱۲) call می‌کند، ممکن است نیاز به مدیریت خطاهای ۴۰۰ جدید داشته باشد. فایل render.yaml برای استقرار در Render استفاده می‌شود و اگر متغیر محیطی جدیدی اضافه شود باید آنجا نیز ثبت شود.

## 🔍 Context و وضعیت فعلی
پیاده‌سازی input validation middleware برای تمام ورودی‌های کاربر در backend/server.js. این تسک شامل نصب و پیکربندی کتابخانه validation (مانند Joi، express-validator، یا Zod) و ایجاد middleware برای اعتبارسنجی تمام ورودی‌های دریافتی از کاربر (body، query parameters، URL parameters) است. باید قوانین validation برای هر endpoint تعریف شود (مثلاً نوع داده، طول، الگو). خارج از این مرحله: helmet، CORS، rate limiting. نکته حیاتی: validation باید در سطح middleware انجام شود و قبل از رسیدن به handler اصلی اجرا گردد.

بخش مربوط از درخواست اصلی کاربر: فقدان security middleware مانند helmet، CORS configuration، rate limiting و input validation باعث آسیب‌پذیری‌های امنیتی جدی می‌شود. برای یک اپلیکیشن که با AI API ارتباط برقرار می‌کند، این موارد حیاتی هستند.

کلیدواژه‌ها: input validation, Joi, express-validator, Zod, body validation, query parameters, URL parameters

شواهد در کد واقعی: backend/server.js شامل ۱۴۰۳ خط کد است و endpointهای متعددی دارد که مستقیماً ورودی کاربر را پردازش می‌کنند بدون validation:
- خط ۵۶-۱۱۴: POST /api/gemini/chat - payload.contents را مستقیماً پردازش می‌کند
- خط ۱۱۷-۱۶۴: POST /api/gemini/tts - prompt و voice را بدون validation می‌گیرد
- خط ۱۷۲-۱۹۲: GET /api/list-models - بدون validation
- خط ۱۹۵-۲۴۰: GET /api/test-gemini - بدون validation
- خط ۶۹۸-۸۰۰: POST /api/analyze-files - فایل‌ها و textContent را بدون validation می‌گیرد

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فایل backend/validators/schemas.js باید شامل schemaهای chatSchema، ttsSchema، analyzeFilesSchema باشد
- [ ] فایل backend/middleware/validate.js باید تابع validate(schema) را export کند که در صورت خطا، پاسخ 400 با پیام خطا برگرداند
- [ ] POST /api/gemini/tts با body خالی یا نامعتبر باید status 400 برگرداند
- [ ] POST /api/gemini/chat با body فاقد contents باید status 400 برگرداند
- [ ] POST /api/analyze-files با بیش از 10 فایل باید status 400 برگرداند (multer خودش این کار را می‌کند، اما validation اضافی نباید تداخل ایجاد کند)
- [ ] POST /api/gemini/tts با voice نامعتبر (مثلاً 'InvalidVoice') باید status 400 برگرداند
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. ۱. نصب کتابخانه Zod (یا Joi) در backend: `npm install zod` در مسیر backend/
۲. ایجاد فایل جدید backend/validators/schemas.js با تمام schemaهای اعتبارسنجی:
   - chatSchema: validation برای POST /api/gemini/chat (بررسی ساختار contents، role، parts، inline_data)
   - ttsSchema: validation برای POST /api/gemini/tts (prompt باید string و voice باید یکی از مقادیر مجاز باشد)
   - analyzeFilesSchema: validation برای POST /api/analyze-files (files باید array با حداکثر ۱۰ آیتم، textContent باید string)
۳. ایجاد فایل backend/middleware/validate.js با middleware تابع validate(schema) که:
   - body، query، params را بر اساس schema بررسی کند
   - در صورت خطا، خطای ۴۰۰ با پیام خطای فارسی برگرداند
۴. import و اعمال middleware روی هر route در backend/server.js:
   - خط ۵۶: app.post('/api/gemini/chat', validate(chatSchema), async (req, res) => {...})
   - خط ۱۱۷: app.post('/api/gemini/tts', validate(ttsSchema), async (req, res) => {...})
   - خط ۶۹۸: app.post('/api/analyze-files', upload.array('files', 10), handleMulterError, validate(analyzeFilesSchema), async (req, res) => {...})
۵. اضافه کردن validation برای query parameters در GET endpoints (api/list-models و api/test-gemini)
۶. تست با ارسال درخواست‌های نامعتبر و بررسی پاسخ ۴۰۰

## 💡 نمونه‌های قبل/بعد
**POST /api/gemini/tts - قبل و بعد از اضافه کردن validation**

_قبل:_
```
app.post('/api/gemini/tts', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }
  try {
    const { prompt, voice = 'Kore' } = req.body;
```

_بعد:_
```
import { validate } from './middleware/validate.js';
import { ttsSchema } from './validators/schemas.js';

app.post('/api/gemini/tts', validate(ttsSchema), async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }
  try {
    const { prompt, voice = 'Kore' } = req.body;
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `cd backend && npm install zod`
- `cd backend && node -e "import('./middleware/validate.js').then(m => console.log('Module loaded'))"`
- `curl -X POST http://localhost:3001/api/gemini/tts -H 'Content-Type: application/json' -d '{}'`
- `curl -X POST http://localhost:3001/api/gemini/chat -H 'Content-Type: application/json' -d '{"invalid": true}'`

## ⚠️ ریسک‌ها و موارد احتیاط
تغییر در backend/server.js خطوط ۵۶-۱۱۴، ۱۱۷-۱۶۴، ۶۹۸-۸۰۰: این endpointها توسط فرانت‌اند (frontend/src/App.jsx) از طریق proxy Vite (frontend/vite.config.js خط ۸-۱۲) call می‌شوند. اگر validation بیش از حد سخت‌گیرانه باشد، درخواست‌های معتبر فرانت‌اند ممکن است با خطای ۴۰۰ مواجه شوند. همچنین، validation نباید با middleware multer (خط ۶۸۶-۶۹۵) تداخل ایجاد کند. ریسک دیگر: اگر از Zod استفاده شود و schemaها به‌درستی type inference را انجام ندهند، ممکن است داده‌های معتبر رد شوند.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: high
- تخمین زمان: medium

---

## ✅ معیارهای پذیرش کلی (همهٔ مراحل)
- [ ] {'text': 'کتابخانه helmet در `backend/package.json` به عنوان وابستگی اضافه شده باشد.', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['"helmet":'], 'files_hint': ['backend/package.json']}}
- [ ] {'text': 'import helmet در فایل `backend/server.js` در بخش importها (خطوط 1-12) اضافه شده باشد.', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ["import helmet from 'helmet';"], 'files_hint': ['backend/server.js']}}
- [ ] {'text': 'middleware `app.use(helmet())` به عنوان اولین middleware بعد از ایجاد `app` و قبل از `app.use(cors())` در فایل `backend/server.js` قرار گرفته باشد.', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['app.use\\(helmet\\(\\)\\)'], 'files_hint': ['backend/server.js']}}
- [ ] {'text': 'هدر `X-Content-Type-Options: nosniff` در پاسخ\u200cهای HTTP سرور (مثلاً GET /api/health) حضور داشته باشد.', 'verify_method': 'api_response', 'verify_plan': {'method': 'GET', 'path': '/api/health', 'expected_status': 200, 'required_fields': [], 'headers_to_check': ['x-content-type-options']}}
- [ ] {'text': 'هدر `X-Frame-Options: SAMEORIGIN` در پاسخ\u200cهای HTTP سرور حضور داشته باشد.', 'verify_method': 'api_response', 'verify_plan': {'method': 'GET', 'path': '/api/health', 'expected_status': 200, 'required_fields': [], 'headers_to_check': ['x-frame-options']}}
- [ ] {'text': 'هدر `Strict-Transport-Security` در پاسخ\u200cهای HTTP سرور حضور داشته باشد (در صورت استفاده از HTTPS).', 'verify_method': 'api_response', 'verify_plan': {'method': 'GET', 'path': '/api/health', 'expected_status': 200, 'required_fields': [], 'headers_to_check': ['strict-transport-security']}}
- [ ] {'text': 'CORS middleware باید originهای خاص (نه wildcard) را پشتیبانی کند: http://localhost:5173 برای توسعه و دامنه تولیدی از متغیر FRONTEND_URL', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['origin:', 'FRONTEND_URL', 'localhost:5173'], 'files_hint': ['backend/server.js']}}
- [ ] {'text': 'متدهای مجاز باید شامل GET, POST, PUT, DELETE, OPTIONS باشند', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['methods:', 'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 'files_hint': ['backend/server.js']}}
- [ ] {'text': 'هدرهای مجاز باید شامل Content-Type و Authorization باشند', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['allowedHeaders:', 'Content-Type', 'Authorization'], 'files_hint': ['backend/server.js']}}
- [ ] {'text': 'credentials باید true باشد (برای ارسال کوکی\u200cها/توکن\u200cها)', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['credentials: true'], 'files_hint': ['backend/server.js']}}
- [ ] {'text': 'درخواست OPTIONS (preflight) باید پاسخ 204 با هدرهای مناسب بدهد', 'verify_method': 'api_response', 'verify_plan': {'method': 'OPTIONS', 'path': '/api/health', 'expected_status': 204, 'required_fields': []}}
- [ ] {'text': 'درخواست از origin غیرمجاز (مثلاً http://evil.com) باید با خطای CORS مسدود شود', 'verify_method': 'api_response', 'verify_plan': {'method': 'GET', 'path': '/api/health', 'expected_status': 403, 'required_fields': []}}
- [ ] {'text': 'rate limiter عمومی (100 req/15min) روی همه routeهای /api/* اعمال شود و headerهای X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset در response موجود باشند', 'verify_method': 'api_response', 'verify_plan': {'method': 'GET', 'path': '/api/health', 'expected_status': 200, 'required_fields': [], 'check_headers': ['x-ratelimit-limit', 'x-ratelimit-remaining', 'x-ratelimit-reset']}}
- [ ] {'text': 'بعد از 100 درخواست به /api/health در 15 دقیقه، پاسخ 429 (Too Many Requests) برگردد', 'verify_method': 'api_response', 'verify_plan': {'method': 'GET', 'path': '/api/health', 'expected_status': 429, 'required_fields': ['error']}}
- [ ] {'text': 'WebSocket server در path /ws/live تحت تأثیر rate limiting قرار نگیرد و اتصال WebSocket برقرار شود', 'verify_method': 'manual_only', 'verify_plan': {'reason': 'نیاز به تست دستی WebSocket connection — می\u200cتوان با ابزار wscat یا کد کلاینت تست کرد'}}
- [ ] {'text': 'فایل backend/middleware/rateLimiter.js ایجاد شود و configهای rate limiting را export کند', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['export const generalLimiter', 'export const authLimiter', 'export const analysisLimiter', 'rateLimit'], 'files_hint': ['backend/middleware/rateLimiter.js']}}
- [ ] {'text': 'endpoint /api/analyze-files محدودیت 10 req/15min داشته باشد و بعد از 10 درخواست خطای 429 برگرداند', 'verify_method': 'api_response', 'verify_plan': {'method': 'POST', 'path': '/api/analyze-files', 'expected_status': 429, 'required_fields': ['error']}}
- [ ] {'text': 'فایل backend/validators/schemas.js باید شامل schemaهای chatSchema، ttsSchema، analyzeFilesSchema باشد', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['chatSchema', 'ttsSchema', 'analyzeFilesSchema', 'export const'], 'files_hint': ['backend/validators/schemas.js']}}
- [ ] {'text': 'فایل backend/middleware/validate.js باید تابع validate(schema) را export کند که در صورت خطا، پاسخ 400 با پیام خطا برگرداند', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['export function validate', 'export const validate', 'res.status(400)', 'ZodError'], 'files_hint': ['backend/middleware/validate.js']}}
- [ ] {'text': 'POST /api/gemini/tts با body خالی یا نامعتبر باید status 400 برگرداند', 'verify_method': 'api_response', 'verify_plan': {'method': 'POST', 'path': '/api/gemini/tts', 'expected_status': 400, 'required_fields': ['error']}}

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  - اضافه کردن middleware امنیتی helmet برای تنظیم هدرهای HTTP امنیتی — helmet نصب نشده و middleware آن در server.js اضافه نشده است
  - پیکربندی CORS middleware برای کنترل دسترسی cross-origin — CORS با originهای خاص و credentials پیکربندی نشده است
  - پیاده‌سازی rate limiting middleware برای جلوگیری از حملات brute force و DoS — فایل rateLimiter.js ایجاد نشده و rate limiting اعمال نشده است
  - پیاده‌سازی input validation middleware برای تمام ورودی‌های کاربر — فایل‌های schemas.js و validate.js ایجاد نشده‌اند

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 6 از 7
  id: b4991688-efec-4865-9aff-88d71d9a0127
  عنوان اصلی: پیکربندی CORS با دامنه‌های مجاز
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: backend/server.js

📋 acceptance_criteria کامل:
  - CORS فقط به دامنه‌های مشخص شده در متغیر محیطی CORS_ORIGIN اجازه دسترسی دهد [verify_method=static] [verify_plan={"grep_patterns": ["CORS", "دامنه", "مشخص", "متغیر", "محیطی", "اجازه", "دسترسی"], "files_hint": []}]
  - درخواست از دامنه‌های دیگر با خطای CORS مواجه شود [verify_method=static] [verify_plan={"grep_patterns": ["CORS", "درخواست", "دامنه", "دیگر", "خطای", "مواجه"], "files_hint": []}]
  - متغیر CORS_ORIGIN در فایل .env.example و render.yaml اضافه شود [verify_method=static] [verify_plan={"grep_patterns": ["example", "render", "متغیر", "فایل", "اضافه"], "files_hint": []}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در
  repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های
  مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط
  موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که
  چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.

🔍 **مسئولیت تو (مدل اجراکننده):**
- پیش از هر تغییر، خودت ساختار repo، فایل‌های ذکرشده، و وابستگی‌های آن‌ها را
  مستقل بررسی کن.
- اگر تشخیص دادی موقعیت ذکرشده در پرامپت اشتباه است یا فایل دیگری مناسب‌تر
  است، بر اساس قضاوت خودت عمل کن — این پرامپت نمی‌تواند بهانهٔ کار اشتباه
  باشد ("خودت گفتی" قابل قبول نیست).
- اگر معیارهای پذیرش (AC) مبهم/ناقص بودند، بهترین تفسیر را انتخاب کن و در
  commit message توضیح بده.

📦 **اگر کار طولانی است:**
- **خلاصه‌اش نکن.** همه را به‌طور کامل انجام بده.
- اگر یک کامیت گنجایش ندارد، در **چندین کامیت متوالی** انجام بده — ولی
  هیچ بخشی را skip نکن.
- ترتیب کامیت‌ها را منطقی نگه‌دار (foundation → core → integration → tests).
- در آخر یک checklist از همه‌ی کامیت‌ها در PR description بنویس.

---


## 🎯 هدف (خلاصه ساختاریافته)
CORS به صورت wildcard (*) تنظیم شده و هیچ محدودیتی ندارد

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/server.js:47` — `app.use(cors())` — CORS بدون هیچ محدودیتی فعال است
  ```jsx
  app.use(cors());
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Express.js + CORS middleware

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `backend/.env.example` (سطر 1) — فایل env که باید متغیر CORS_ORIGIN به آن اضافه شود
- `render.yaml` (سطر 8) — فایل کانفیگ deployment که باید متغیر محیطی جدید به آن اضافه شود

## 🌐 نقشهٔ وابستگی‌ها
این تنظیم روی تمام endpointهای backend تأثیر می‌گذارد.

## 🔍 Context و وضعیت فعلی
در فایل backend/server.js، خط 47، CORS با مقدار پیش‌فرض (که معادل '*' است) فعال شده است. این بدان معناست که هر دامنه‌ای می‌تواند به API backend درخواست ارسال کند. این یک vulnerability امنیتی است زیرا مهاجمان می‌توانند از دامنه‌های مخرب به API دسترسی پیدا کنند و عملیات‌هایی مانند خواندن داده‌ها، ارسال درخواست‌های مخرب (CSRF) و یا سوءاستفاده از API key را انجام دهند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] CORS فقط به دامنه‌های مشخص شده در متغیر محیطی CORS_ORIGIN اجازه دسترسی دهد
- [ ] درخواست از دامنه‌های دیگر با خطای CORS مواجه شود
- [ ] متغیر CORS_ORIGIN در فایل .env.example و render.yaml اضافه شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. CORS را به دامنه‌های مجاز محدود کنید. از متغیر محیطی برای تعریف originهای مجاز استفاده کنید. مثلاً: `app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }))`. در production، origin باید دقیقاً دامنه frontend (مثلاً https://yourdomain.com) باشد.

## 💡 نمونه‌های قبل/بعد
**محدود کردن CORS به دامنه مجاز**

_قبل:_
```
app.use(cors());
```

_بعد:_
```
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `curl -H "Origin: https://evil.com" -I http://localhost:3001/api/health | grep -i access-control`
- `curl -H "Origin: http://localhost:5173" -I http://localhost:3001/api/health | grep -i access-control`

## ⚠️ ریسک‌ها و موارد احتیاط
احتمال حملات CSRF و دسترسی غیرمجاز به API از دامنه‌های مخرب.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: high
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 7 از 7
  id: 60221f9c-c1b1-4274-9512-9c022c1dd65c
  عنوان اصلی: یکپارچه‌سازی اعتبارسنجی GEMINI_API_KEY در endpointها
  اولویت اصلی: medium
  وضعیت verify قبلی: pending
  فایل‌های دخیل: backend/server.js

📋 acceptance_criteria کامل:
  - اعمال تغییر بدون شکستن تست‌های موجود [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]
  - linter بدون warning عبور می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["eslint", "lint"], "files_hint": ["backend/server.js"]}]
  - type-check موفق است [verify_method=static] [verify_plan={"grep_patterns": ["tsc", "type-check"], "files_hint": ["backend/server.js"]}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در
  repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های
  مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط
  موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که
  چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.

🔍 **مسئولیت تو (مدل اجراکننده):**
- پیش از هر تغییر، خودت ساختار repo، فایل‌های ذکرشده، و وابستگی‌های آن‌ها را
  مستقل بررسی کن.
- اگر تشخیص دادی موقعیت ذکرشده در پرامپت اشتباه است یا فایل دیگری مناسب‌تر
  است، بر اساس قضاوت خودت عمل کن — این پرامپت نمی‌تواند بهانهٔ کار اشتباه
  باشد ("خودت گفتی" قابل قبول نیست).
- اگر معیارهای پذیرش (AC) مبهم/ناقص بودند، بهترین تفسیر را انتخاب کن و در
  commit message توضیح بده.

📦 **اگر کار طولانی است:**
- **خلاصه‌اش نکن.** همه را به‌طور کامل انجام بده.
- اگر یک کامیت گنجایش ندارد، در **چندین کامیت متوالی** انجام بده — ولی
  هیچ بخشی را skip نکن.
- ترتیب کامیت‌ها را منطقی نگه‌دار (foundation → core → integration → tests).
- در آخر یک checklist از همه‌ی کامیت‌ها در PR description بنویس.

---


## 🎯 هدف (خلاصه ساختاریافته)
کد تکراری برای اعتبارسنجی GEMINI_API_KEY در چندین endpoint

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/server.js:57-59, 118-120, 173-175, 196-198` — `GEMINI_API_KEY check` — کد تکراری در 4 endpoint
  ```jsx
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Express middleware

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `backend/server.js` (سطر 57) — تمام endpointهایی که این اعتبارسنجی را دارند

## 🌐 نقشهٔ وابستگی‌ها
این middleware بر تمام endpointهای Gemini تأثیر می‌گذارد.

## 🔍 Context و وضعیت فعلی
در backend/server.js، اعتبارسنجی GEMINI_API_KEY در 4 endpoint تکرار شده است: خطوط 57-59 (chat), 118-120 (TTS), 173-175 (list-models), 196-198 (test-gemini). این کد تکراری باعث افزایش حجم کد و کاهش قابلیت نگهداری می‌شود. همچنین اگر نحوه اعتبارسنجی تغییر کند، باید در همه جا اعمال شود.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] اعمال تغییر بدون شکستن تست‌های موجود
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. یک middleware برای اعتبارسنجی GEMINI_API_KEY ایجاد کنید و آن را به routeهای مربوطه اضافه کنید. این کار کد را تمیزتر و نگهداری آن را آسان‌تر می‌کند.

## 💡 نمونه‌های قبل/بعد
**ایجاد middleware**

_قبل:_
```
app.post('/api/gemini/chat', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }
  ...
```

_بعد:_
```
const requireGeminiKey = (req, res, next) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## ⚠️ ریسک‌ها و موارد احتیاط
پیش از merge، تست‌های موجود اجرا شوند تا رگرشن ایجاد نشود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: refactor
- اولویت: medium
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 نکات استاندارد (همان bullet هایی که در ساخت پرامپت‌های معمولی پروژه رعایت می‌شود — وراثت کامل، نه کپی):
- ساختار AC ها: acceptance_criteria با verify_method و verify_plan و evidence_locations برای هر AC
- edge cases را در نظر بگیر و در پرامپت ذکر کن
- وابستگی‌ها را اول حل کن (dependency-aware ordering)
- اگر بخشی از یکی از تسک‌ها قبلاً done است (pre_done در بالا)، تکرار نکن — فقط روی remaining_parts تمرکز کن
- در commit message: `merged-from: 47bfef80-d77a-4386-9dca-fb1a533ca20b, cf9e7da4-37c4-463e-99dd-bd6707edcce3, f1a8e5dd-c1fa-4558-8603-d9200b6a5ce4, fdba8076-dc5d-470c-b7af-049761996be5, c7474d4f-8730-4531-b8ec-50de5a444b82, b4991688-efec-4865-9aff-88d71d9a0127, 60221f9c-c1b1-4274-9512-9c022c1dd65c`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Prompt

## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

📖 **خواندن کامل + اجرای مو-به-مو (بسیار مهم):**

این پرامپت — از این یادداشت تا انتها — یک سند واحد است که هر بخشش
حاوی الزام یا context منحصربه‌فرد است. خواندن سطحی یا skim کردن **ممنوع**
است.

- پرامپت را **سطر به سطر** بخوان، نه head/tail/فقط-بخش-اصلی.
- اگر بخشی به‌نظر طولانی یا تکراری آمد، **حتماً** بخوان — تفاوت‌های
  ریز ممکن است در آن جا اساسی باشند.
- هر جمله، URL، نام فایل، نام تابع، یا مقدار عددی که در پرامپت آمده،
  دقیقاً همان است که کاربر می‌خواهد — تغییرش نده، رندش نکن، خلاصه‌اش
  نکن.
- اگر پرامپت چندین درخواست/مرحله/زیرتسک دارد، **همه** را پیاده کن. حتی
  یکی را نه به‌عنوان "خارج از scope" حذف کن.

❌ ممنوعات صریح:
- خلاصه‌سازی متن کاربر در commit message یا response
- "این بخش اصلی نیست، رد می‌کنم"
- "کاربر احتمالاً منظورش این بود..." — منظورش همان است که نوشته
- "این URL/نام به نظر قدیمی است، آپدیتش کردم" — تغییر بدون درخواست ممنوع
- پیاده‌سازی فقط بخشی از پرامپت و تظاهر به کامل بودن
- "همه آیتم‌های لیست A را بررسی کردم، B و C مشابه بودند" — نه؛
  هرکدام را جداگانه

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در
  repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های
  مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط
  موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که
  چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.

🔍 **مسئولیت تو (مدل اجراکننده):**
- پیش از هر تغییر، خودت ساختار repo، فایل‌های ذکرشده، و وابستگی‌های آن‌ها را
  مستقل بررسی کن.
- اگر تشخیص دادی موقعیت ذکرشده در پرامپت اشتباه است یا فایل دیگری مناسب‌تر
  است، بر اساس قضاوت خودت عمل کن — این پرامپت نمی‌تواند بهانهٔ کار اشتباه
  باشد ("خودت گفتی" قابل قبول نیست).
- اگر معیارهای پذیرش (AC) مبهم/ناقص بودند، بهترین تفسیر را انتخاب کن و در
  commit message توضیح بده.

🔗 **وابستگی‌ها و همگام‌سازی (بسیار حیاتی — هرگز skip نکن):**

این بخش از همهٔ بخش‌های دیگرِ این یادداشت **مهم‌تر** است. اگر نقض شود،
نتیجهٔ کار ممکن است مشروع به‌نظر برسد ولی در عمل بخش‌های دیگر سیستم را عقب
بیندازد، broken reference تولید کند، یا منجر به data corruption شود.

پیش از و حین تغییر، تمام وابستگی‌ها را در **چهار جهت** به‌طور **کامل و
بدون هیچ خلاصه‌سازی** شناسایی و همگام کن:

**۱. وابستگی‌های upstream (این تسک به چه چیزهایی متکی است):**
- چه فایل‌ها، توابع، کلاس‌ها، API endpoint ها، schema های دیتابیس،
  env vars، یا config هایی که این تسک نیاز دارد؟
- آیا قرار است چیزی را ویرایش/حذف کنی که جای دیگر (signature، رفتار،
  return type، side effect) از آن انتظار خاصی می‌رود؟
- اگر dependency جدیدی اضافه می‌کنی، آیا با dependencyهای موجود تداخل
  دارد (نسخه، compat، lock file)؟

**۲. وابستگی‌های downstream (چه چیزهایی به این تسک متکی‌اند):**
- چه فایل‌ها، توابع، تست‌ها، migrations، docs، یا UI component هایی از
  کدی که داری ویرایش/اضافه/حذف می‌کنی **استفاده می‌کنند**؟
- با grep و reference search **همه‌ی** call sites، importها، subclassها،
  reference های مستقیم و غیرمستقیم را پیدا کن — نه فقط چند مورد اصلی.
- خصوصاً برای حذف یا rename: هیچ broken reference نباید باقی بماند.

**۳. وابستگی‌های cross-tier (بسیار مهم — هرگز فقط یک لایه را نبین):**

تسک شما ممکن است از backend، frontend، database، worker، یا هر tier
دیگری شروع شده باشد. ولی تغییرات تقریباً همیشه روی tier های دیگر هم
اثر می‌گذارند. **مستقل از اینکه تسک از کدام tier است**، این چک‌های دو
طرفه را همیشه انجام بده:

🔁 **اگر backend را تغییر دادی** (API، service، model، route):
  → frontend: کدام component/page/hook این endpoint یا data shape را
    مصرف می‌کند؟ type definition، state shape، error handling، loading
    state، form validation، URL routing همگی باید همگام شوند.
  → mobile/SDK/client library (اگر پروژه دارد): همان داستان frontend.
  → database: آیا migration لازم است؟ آیا rollback امن است؟
  → background workers: آیا event producer/consumer ها تحت تأثیرند؟
  → rate limit، auth، CORS، CSP: آیا رفتار جدید پشتیبانی می‌شود؟

🔁 **اگر frontend را تغییر دادی** (component، form، state، route):
  → backend: آیا endpoint جدید/تغییریافته لازم است؟ آیا data shape ای
    که ارسال می‌شود با schema سرور سازگار است؟
  → backend validation: آیا برای ورودی‌های جدید UI کافی است؟
  → permissions/RBAC: آیا feature جدید نیاز به role check جدید دارد؟
  → analytics/tracking: آیا event های جدید باید در backend log شوند؟
  → SEO/SSR: آیا تغییر route نیاز به sitemap/meta tags جدید دارد؟

🔁 **اگر database/migration را تغییر دادی**:
  → backend models (ORM، Pydantic، dataclasses) همگی به‌روزند؟
  → query های raw SQL یا ORM queries با schema جدید سازگارند؟
  → seed data، fixtures، factory functions تست‌ها به‌روزند؟
  → frontend: آیا data shape جدید در UI به‌درستی render می‌شود؟
  → rollback migration نوشته شده و امن است؟

🔁 **اگر API contract یا event schema را تغییر دادی** (REST، GraphQL،
   WebSocket، gRPC، Kafka، …):
  → OpenAPI/GraphQL schema/proto file آپدیت شد؟
  → همه‌ی consumer ها (client، subscriber، webhook، external API
    user) با version جدید سازگارند؟
  → backward compatibility حفظ شده یا migration path روشن است؟
  → versioning header/path اگر breaking change است؟

🔁 **اگر infrastructure یا config را تغییر دادی** (Dockerfile، CI، Render
   config، env، secrets):
  → README setup/installation section به‌روزه؟
  → `.env.example` با env vars جدید آپدیت شد؟
  → deploy script یا CI workflow هم تغییر کرد؟
  → docs/architecture یا diagram های infrastructure به‌روزند؟

⚠️ **هرگز فقط یک tier را تغییر نده و فرض کنی بقیه خودکار همگام می‌شوند.**
   حتی برای تغییرات به‌ظاهر «کوچک»، چک کن.

**۴. وابستگی‌های جانبی (artifacts که همیشه چک شوند):**

تغییرات کد همیشه روی این artifact ها اثر دارند. **همه را** بررسی و
به‌روز کن — مستندات اولویت **بالا** دارد چون فراموش‌شدنی‌ترین است.

  📝 **مستندات** (همیشه چک کن — حتی برای تغییر کوچک کد):
    - README.md (شرح، setup، نمونه‌های استفاده، badge ها)
    - CHANGELOG.md / RELEASE_NOTES.md
    - docs/ folder (architecture، API reference، user guides، runbooks)
    - inline docstrings/کامنت‌های توابع و کلاس‌های تغییریافته
    - OpenAPI/Swagger annotations، JSDoc/TSDoc
    - architecture diagrams (اگر component اضافه/حذف شد)
    - migration guides (اگر breaking change است)

  🌍 **مستندات کاربر**:
    - i18n files و translation keys
    - UI labels، tooltip ها، help text، error messages
    - in-app onboarding (اگر flow جدید است)

  🧪 **تست‌ها**:
    - unit tests (همه‌ی فایل‌های مرتبط — حتی اگر «بی‌ربط» به‌نظر می‌رسد)
    - integration tests
    - e2e tests (Playwright/Cypress/Selenium)
    - snapshot tests (اگر UI تغییر کرد)
    - contract tests (Pact یا مشابه)
    - performance benchmarks (اگر behavior performance-sensitive تغییر کرد)

  🧬 **type definitions و contracts**:
    - .d.ts files
    - Pydantic models، dataclasses
    - Protobuf/Avro/Thrift schemas
    - GraphQL schema definitions
    - JSON Schemas

  🏗 **infrastructure و config**:
    - Dockerfile، docker-compose.yml
    - Kubernetes manifests
    - Render/Vercel/Netlify config
    - GitHub Actions / GitLab CI workflows
    - environment templates (.env.example، .env.sample)
    - feature flags (LaunchDarkly، GrowthBook، config)

  📊 **monitoring و observability**:
    - logging keys (اگر اضافه/حذف شد، log parser ها هم به‌روز شوند)
    - metric names (Prometheus، Datadog)
    - tracing spans
    - alert rules و dashboards
    - error tracking (Sentry rules، groupings)

  🔐 **security**:
    - auth rules (rate limit، CORS، CSP، HSTS)
    - permissions/RBAC config
    - secrets rotation policies
    - audit log events (اگر action جدید اضافه شد)

  💾 **caches و serialization**:
    - cache keys و TTL (اگر data shape یا lifecycle تغییر کرد)
    - serializer formats (Redis، session storage)
    - browser storage (localStorage، IndexedDB schemas)

**قانون مطلق همگام‌سازی:**
- هر چیزی که در (۱)، (۲)، (۳)، یا (۴) شناسایی شد، در **همان workflow
  این تسک** همگام و به‌روز شود. هرگز برای بعد رها نکن.
- اگر یک فایل/تست/docs نسبت به تغییر شما عقب بماند، در بهترین حالت bug،
  در بدترین حالت مشکل امنیتی یا data corruption تولید می‌کند.
- تغییرات همگام‌سازی می‌توانند در commit جداگانه باشند (در همان task)،
  ولی نباید skip شوند یا به «refactor آینده» سپرده شوند.

**هرگز این جمله‌ها قابل قبول نیست:**
- ❌ «بعداً پیداش می‌کنم»
- ❌ «احتمالاً جای دیگه‌ای استفاده نمی‌شه»
- ❌ «این یه refactor جداگانه‌ست — out of scope»
- ❌ «فقط فایل‌های اصلی رو بررسی کردم»
- ❌ «حدس می‌زنم چیزی بهش وابسته نیست»
- ❌ «دامنه‌ی وابستگی‌ها رو خلاصه کردم» — هرگز خلاصه نکن
- ❌ «این task فقط backend است؛ frontend مشکل خودش» — هرگز
- ❌ «این task فقط frontend است؛ backend از قبل کار می‌کند» — هرگز ثابت نکرده
- ❌ «مستندات بعداً به‌روز می‌شن» — همیشه same-task همگام شوند
- ❌ «testها رو نگاه نکردم چون فقط یه تغییر کوچیک بود»

**در commit message یا PR description**، دامنهٔ وابستگی‌های شناسایی‌شده و
همگام‌شده را به‌طور explicit و **per-tier** بنویس. مثال:
```
Dependencies synced:
- upstream: User model schema, auth middleware
- downstream: 3 API endpoints, 5 frontend components, 12 tests
- cross-tier (backend → frontend): UserProfile.tsx, useUser.ts hook,
  api-types.ts (TS definitions)
- cross-tier (backend → infra): .env.example added NEW_AUTH_SCOPES
- side artifacts: OpenAPI spec, README API section, i18n keys for
  new errors, Sentry alert rule for new error code
```
اگر هیچ وابستگی پیدا نکردی در هر کدام از چهار جهت، صریحاً بنویس:
«بررسی شد — هیچ وابستگی upstream / downstream / cross-tier (backend↔
frontend↔db↔infra) / side شناسایی نشد» تا مشخص باشد بررسی **انجام شده**
نه اینکه فراموش شده.

📋 **مدیریت TO-DO برای اقدامات دستی کاربر (همیشه چک کن):**

⚠️ **هشدار بحرانی — قاعدهٔ ضد-فرار:** TO-DO فقط برای کارهایی است که
**واقعاً غیرممکن** برای agent است (نیاز به انسان مطلق)، نه برای کارهایی
که «بزرگ‌اند»، «وقت می‌برند»، یا «نیازمند fixture/setup» هستند. اگر یک
agent در یک سشن بیش از **۲۰٪ از تسک‌ها** را با TO-DO ببندد، یعنی از کار
فرار می‌کند — این الگو در سشن‌های قبلی **مشاهده** شده و الان ممنوع است.

✅ **فقط برای این موارد TO-DO بساز** (لیست بسته — هرچه خارج این لیست
ممنوع است):

  ۱. **Credential/secret که فقط کاربر دارد**:
     - تنظیم API key واقعی در پنل ادمین خارجی (Render، AWS، Stripe، …)
     - تأیید OAuth client روی console آن سرویس
     - paste کردن webhook secret که فقط بعد از ساخت در dashboard ظاهر می‌شود

  ۲. **Account/billing روی سرویس خارجی که کاربر باید عضو شود**:
     - ساخت account جدید روی Stripe/SendGrid/Twilio/Google Cloud
     - تأیید verification شماره یا ID
     - فعال‌سازی subscription پولی

  ۳. **داده/asset خصوصی که فقط کاربر دارد**:
     - آپلود لوگو/تصویر/فونت برند
     - paste کردن داده‌ای که در محل کار کاربر است
     - import داده‌ای که فقط روی device کاربر است

  ۴. **تصمیم سلیقه‌ای/حقوقی/کسب‌وکار**:
     - انتخاب رنگ‌بندی نهایی یا تم
     - متن دقیق Terms of Service / Privacy Policy
     - تعرفهٔ قیمت‌گذاری
     - نام نهایی برند یا دامنه

⛔ **هرگز TO-DO نکن برای** (لیست سیاه — هر چیزی که در این لیست است
**قابل اجرا** توسط agent است، حتی اگر بزرگ یا چندبخشی باشد):

  ❌ UI component / page / dashboard (هر فریم‌ورک: React, Vue, Angular,
     Svelte، حتی اگر معماری بزرگ دارد) — می‌توانی stub اولیه + state
     management + layout + استایل بسازی
  ❌ "نیازمند Google Drive / Stripe / Twilio API" — می‌توانی **client
     stub** با abstraction layer بسازی که با env var واقعی plug-in شود؛
     کد integration یعنی پیاده‌سازی، نه TO-DO
  ❌ "feature بزرگ، چند روز کار می‌برد" — اندازه دلیل defer نیست؛ کوچک
     شروع کن، iterate کن، در همین سشن کامل کن
  ❌ Celery / background worker / scheduler — یک task ساده + register
     می‌توانی بسازی
  ❌ Migration / model / schema — حتی اگر فیلد جدید نیاز دارد، اضافه کن
  ❌ REST endpoint / GraphQL resolver / WebSocket route — هرگز TO-DO
  ❌ test (unit/integration/e2e) — همیشه قابل نوشتن
  ❌ Documentation / README / API docs — همیشه قابل نوشتن
  ❌ Config file / .env.example / Dockerfile / CI workflow — همیشه قابل
     نوشتن
  ❌ "می‌توانستی .tsx ولی repo .jsx است" — از .jsx استفاده کن، TO-DO نکن
  ❌ "نیازمند فیلد X در مدل دیگر" — اضافه کن فیلد را، TO-DO نکن
  ❌ "تصمیم admin-vs-user-scoped" — پرامپت اولیه scope را معلوم کرده،
     یا با محتاطانه‌ترین تفسیر پیش برو
  ❌ "credential در production هنوز ست نیست" — این TO-DO ساده برای
     تنظیم env var است (مورد ۱ بالا)، نه دلیل برای defer کردن کد
  ❌ "نیازمند verification از کاربر" — اگر اقدام واقعی غیرممکن نیست،
     پیش برو
  ❌ هر چیزی که در یک کامنت `# TODO` معمولی نوشته می‌شد — این فایل
     TO-DO نیست، کامنت inline است

🔬 **قاعدهٔ «حداقل تلاش» قبل از TO-DO**: قبل از TO-DO کردن یک AC، **اثبات
کن** که قابل انجام نیست:

  ۱. آیا می‌توانم یک stub/placeholder بسازم که با env واقعی plug-in شود؟
     → اگر بله، بساز و TO-DO نکن
  ۲. آیا می‌توانم برای این بخش یک test (حتی mock-based) بنویسم؟
     → اگر بله، بنویس و TO-DO نکن
  ۳. آیا می‌توانم abstraction/interface را تعریف کنم، حتی اگر backend
     واقعی نیست؟ → اگر بله، تعریف کن و TO-DO نکن
  ۴. آیا فقط یک حالت سلیقه‌ای/decision کاربر در میان است؟
     → فقط آن یک decision را TO-DO کن، نه کل feature را

اگر یکی از این چهار راه‌حل ممکن بود ولی به TO-DO رفتی، **اعتبار شما از
بین می‌رود**.

📊 **آستانهٔ TO-DO per session**: در یک حلقهٔ اجرای N تسک، اگر بیشتر از
**۲۰٪** تسک‌ها فایل TO-DO ساختی، خودت در گزارش پایانی صریحاً اعلام کن:

  "⚠️ نسبت TO-DO من {K}/{N} = {%} است که از آستانهٔ ۲۰٪ بالاتر است.
   احتمالاً برخی از این TO-DO ها قابل اجرا بودند ولی من فرار کردم.
   لیست TO-DO ها را کاربر باید بازبینی کند که آیا واقعاً Manual-required
   بودند یا agent ضعیف کار کرده."

**یادآوری همیشگی:** اگر در آینده قابلیت‌های شما گسترش پیدا کرد و توانستید
یکی از موارد لیست سفید را خودکار انجام دهید (مثلاً managed credential
injection، یا integration پولی automate شود)، انجام دهید و TO-DO نسازید.
لیست سفید بسته است ولی **بسته از پایین** (می‌تواند کوچک‌تر شود اگر
قابلیت‌ها رشد کنند، ولی هرگز بزرگ‌تر نشود برای فرار).

**اگر هیچ بخش Manual-required نبود (تمام تسک Auto-capable است)**:
  → فایل TO-DO **نساز**. فولدر TO-DO/ باید پاک و معنادار بماند.
  → اگر برای این task از قبل `TO-DO/todo-task-{task_id_first_8}.md` بود
     (یعنی در run قبلی نیاز به دخالت کاربر بود ولی الان نه): فایل قدیمی
     را پاک کن و entry را از `TO-DO/_index.json` حذف کن.

**اگر بخش Manual-required دارد** (همه‌جانبه یا hybrid):
  1. فولدر TO-DO/ را در ریشه ریپو ایجاد کن اگر نیست
  2. فایل `TO-DO/todo-task-{task_id_first_8}.md` بساز با front-matter
     شامل: task_id, task_title, execution_priority, created_at,
     updated_at, status: "pending"
     و در بدنه: «چرا این فایل ساخته شد»، «وضعیت بخش‌های خودکار»
     (commit ها reference)، «کارهایی که باید انجام دهی» با اولویت
     بالا/متوسط/پایین به ترتیب، «وقتی این کارها را تمام کردی»
  3. `TO-DO/_index.json` را با **merge** آپدیت کن (نه overwrite):
     - فایل موجود را بخوان
     - entry های orphan (فایلشان پاک شده) را حذف کن
     - entry این task را اضافه/replace کن
     - بر اساس execution_priority صعودی مرتب کن
     - ساختار: `{"version":1, "generated_at": ISO, "total": N, "items": [...]}`
  4. این تغییرات TO-DO را در **همان commit کد** شامل کن (نه commit جداگانه)

⛔ **ممنوعات مطلق TO-DO**:
  ❌ ساختن TO-DO برای کاری که می‌توانستی خودت انجام دهی (شلوغی فولدر)
  ❌ overwrite کردن `TO-DO/_index.json` بدون merge (data loss)
  ❌ نگه‌داشتن entry هایی که فایل‌شان پاک شده (broken reference)
  ❌ فراموش کردن نوشتن «خروجی مورد انتظار» در هر آیتم TO-DO

این بخش الزامی است. حتی اگر فکر می‌کنی "این تسک کاملاً auto است و نیازی
به TO-DO نیست"، صریحاً در commit message یا report بنویس:
"بررسی شد — این تسک هیچ بخش Manual-required ندارد، TO-DO ساخته نشد."

📦 **اگر کار طولانی است:**
- **خلاصه‌اش نکن.** همه را به‌طور کامل انجام بده.
- اگر یک کامیت گنجایش ندارد، در **چندین کامیت متوالی** انجام بده — ولی
  هیچ بخشی را skip نکن.
- ترتیب کامیت‌ها را منطقی نگه‌دار (foundation → core → integration → tests).
- در آخر یک checklist از همه‌ی کامیت‌ها در PR description بنویس.

🔁 **Commit + Push فوری per-task (بسیار مهم برای جریان کار صحیح):**

پس از اتمام پیاده‌سازی این تسک، **بلافاصله** commit کن و **همان موقع**
به default branch (main/master) push کن. سپس به تسک بعدی برو.

✓ چرا این قانون حیاتی است:
  - تسک‌های بعدی ممکن است به فایل‌ها/تغییراتی که این تسک ایجاد کرده
    نیاز داشته باشند. اگر push نکنی، `git pull` بعدی آن‌ها را نمی‌بیند.
  - جمع‌کردن تغییرات چند تسک منجر به conflict های بزرگ می‌شود.
  - اگر در میانه fail کنی، task های push شده ضایع نمی‌شوند.

⛔ ممنوع: "همه task ها را تمام می‌کنم بعد یک‌جا push می‌زنم"
⛔ ممنوع: branch جدا برای task — مستقیم به default branch
⛔ ممنوع: task بعدی بدون push کامل task قبلی

---

🧬 این یک تسک تلفیقی است — از 7 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این تسک‌ها همگی بر روی جنبه‌های مختلف امنیت برنامه تمرکز دارند، از جمله جلوگیری از افشای اطلاعات حساس، پیکربندی امنیتی Firebase، و اعمال مکانیزم‌های دفاعی مانند CORS و هدرهای امنیتی. این موارد نیازمند هماهنگی بین فرانت‌اند و بک‌اند هستند.
🎯 theme: تقویت امنیت سیستم از طریق مدیریت صحیح متغیرهای محیطی، کلیدهای API و Firebase، و پیاده‌سازی هدرهای امنیتی و CORS.
💎 estimated_difficulty: large

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 7
  id: 47bfef80-d77a-4386-9dca-fb1a533ca20b
  عنوان اصلی: امن‌سازی متغیرهای محیطی
  اولویت اصلی: critical
  وضعیت verify قبلی: partial
  فایل‌های دخیل: backend/.env.example, backend/server.js

📋 acceptance_criteria کامل:
  - زمانی که فایل `.env` وجود ندارد یا `GEMINI_API_KEY` در آن تعریف نشده، برنامه با خطای واضح 'FATAL: متغیر محیطی GEMINI_API_KEY معتبر نیست' متوقف شود و process.exit(1) فراخوانی شود. [verify_method=backend_test] [verify_plan={"test_node": "", "timeout_seconds": 60, "test_path": "backend/tests/test_validateEnv.js::test_missing_gemini_key", "marker": "verify"}]
  - زمانی که `GEMINI_API_KEY` با فرمت نامعتبر (مثلاً 'abc' بدون پیشوند AIza) تنظیم شده، برنامه با خطا متوقف شود. [verify_method=backend_test] [verify_plan={"test_node": "", "timeout_seconds": 60, "test_path": "backend/tests/test_validateEnv.js::test_invalid_gemini_key_format", "marker": "verify"}]
  - زمانی که `PORT` با مقدار غیرعددی (مثلاً 'abc') تنظیم شده، برنامه با خطا متوقف شود. [verify_method=backend_test] [verify_plan={"test_node": "", "timeout_seconds": 60, "test_path": "backend/tests/test_validateEnv.js::test_invalid_port", "marker": "verify"}]
  - زمانی که همه متغیرهای محیطی معتبر هستند، برنامه بدون خطا startup شود و endpoint `/api/health` در خط 167 همچنان کار کند. [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/health", "headers": null, "json_body": null, "expected_status": 200, "required_fields": ["status"], "json_contains": null}]
  - فایل `backend/config/validateEnv.js` ایجاد شده و تابع `validateEnv` در `backend/server.js` بعد از `dotenv.config()` در خط 14 فراخوانی شود. [verify_method=static] [verify_plan={"grep_patterns": ["validateEnv", "import.*validateEnv", "from './config/validateEnv'"], "files_hint": ["backend/server.js", "backend/config/validateEnv.js"]}]
  - فایل backend/utils/encryption.js باید وجود داشته باشد و شامل توابع encrypt و decrypt با AES-256-GCM باشد [verify_method=static] [verify_plan={"grep_patterns": ["function encrypt", "function decrypt", "aes-256-gcm", "createCipheriv", "createDecipheriv"], "files_hint": ["backend/utils/encryption.js"]}]
  - کلید رمزنگاری (ENCRYPTION_KEY) نباید در کد منبع hard-coded شده باشد — باید از process.env.ENCRYPTION_KEY خوانده شود [verify_method=static] [verify_plan={"grep_patterns": ["process.env.ENCRYPTION_KEY"], "files_hint": ["backend/utils/encryption.js", "backend/server.js"]}]
  - مقدار GEMINI_API_KEY در backend/server.js باید از تابع decrypt عبور کند، نه مستقیم از process.env [verify_method=static] [verify_plan={"grep_patterns": ["decrypt\\(process.env.GEMINI_API_KEY", "decrypt\\(encryptedKey"], "files_hint": ["backend/server.js"]}]
  - فایل backend/.env.example باید شامل ENCRYPTION_KEY باشد [verify_method=static] [verify_plan={"grep_patterns": ["ENCRYPTION_KEY"], "files_hint": ["backend/.env.example"]}]
  - سرور باید با کلید رمزنگاری‌شده در .env راه‌اندازی شود و endpoint /api/health پاسخ 200 بدهد [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/health", "headers": null, "json_body": null, "expected_status": 200, "required_fields": ["status"], "json_contains": null}]
  - هیچ occurrence از GEMINI_API_KEY در console.log یا console.error نباید مقدار واقعی را نشان دهد — فقط '[REDACTED]' یا '***' [verify_method=static] [verify_plan={"grep_patterns": ["console\\.(log|error|warn)\\(.*GEMINI_API_KEY", "console\\.(log|error|warn)\\(.*apiKey", "console\\.(log|error|warn)\\(.*process\\.env"], "files_hint": ["backend/server.js"]}]
  - هیچ endpoint API نباید keyPrefix یا بخشی از API key را در response برگرداند — همه باید با '[REDACTED]' جایگزین شوند [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/list-models", "headers": null, "json_body": null, "expected_status": 200, "required_fields": ["models", "count"], "json_contains": null, "forbidden_fields": ["keyPrefix]
  - هیچ error message در throw new Error نباید حاوی مقدار واقعی API key باشد — پیام‌های خطا باید عمومی و امن باشند [verify_method=static] [verify_plan={"grep_patterns": ["throw new Error\\(`.*\\$\\{.*apiKey.*\\}`", "throw new Error\\(`.*\\$\\{.*GEMINI.*\\}`"], "files_hint": ["backend/server.js"]}]
  - تابع کمکی redactSensitiveData باید در backend/server.js تعریف شده باشد و تمام occurrenceهای API key را در رشته‌ها redact کند [verify_method=static] [verify_plan={"grep_patterns": ["function redactSensitiveData", "const redactSensitiveData"], "files_hint": ["backend/server.js"]}]
  - تماس با console.log در خط 207 باید از تابع امن استفاده کند و apiUrl.replace(GEMINI_API_KEY, 'HIDDEN') حذف شود [verify_method=static] [verify_plan={"grep_patterns": ["apiUrl\\.replace\\(GEMINI_API_KEY, 'HIDDEN'\\)"], "files_hint": ["backend/server.js"]}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

📖 **خواندن کامل + اجرای مو-به-مو (بسیار مهم):**

این پرامپت — از این یادداشت تا انتها — یک سند واحد است که هر بخشش
حاوی الزام یا context منحصربه‌فرد است. خواندن سطحی یا skim کردن **ممنوع**
است.

- پرامپت را **سطر به سطر** بخوان، نه head/tail/فقط-بخش-اصلی.
- اگر بخشی به‌نظر طولانی یا تکراری آمد، **حتماً** بخوان — تفاوت‌های
  ریز ممکن است در آن جا اساسی باشند.
- هر جمله، URL، نام فایل، نام تابع، یا مقدار عددی که در پرامپت آمده،
  دقیقاً همان است که کاربر می‌خواهد — تغییرش نده، رندش نکن، خلاصه‌اش
  نکن.
- اگر پرامپت چندین درخواست/مرحله/زیرتسک دارد، **همه** را پیاده کن. حتی
  یکی را نه به‌عنوان "خارج از scope" حذف کن.

❌ ممنوعات صریح:
- خلاصه‌سازی متن کاربر در commit message یا response
- "این بخش اصلی نیست، رد می‌کنم"
- "کاربر احتمالاً منظورش این بود..." — منظورش همان است که نوشته
- "این URL/نام به نظر قدیمی است، آپدیتش کردم" — تغییر بدون درخواست ممنوع
- پیاده‌سازی فقط بخشی از پرامپت و تظاهر به کامل بودن
- "همه آیتم‌های لیست A را بررسی کردم، B و C مشابه بودند" — نه؛
  هرکدام را جداگانه

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در
  repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های
  مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط
  موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که
  چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.

🔍 **مسئولیت تو (مدل اجراکننده):**
- پیش از هر تغییر، خودت ساختار repo، فایل‌های ذکرشده، و وابستگی‌های آن‌ها را
  مستقل بررسی کن.
- اگر تشخیص دادی موقعیت ذکرشده در پرامپت اشتباه است یا فایل دیگری مناسب‌تر
  است، بر اساس قضاوت خودت عمل کن — این پرامپت نمی‌تواند بهانهٔ کار اشتباه
  باشد ("خودت گفتی" قابل قبول نیست).
- اگر معیارهای پذیرش (AC) مبهم/ناقص بودند، بهترین تفسیر را انتخاب کن و در
  commit message توضیح بده.

🔗 **وابستگی‌ها و همگام‌سازی (بسیار حیاتی — هرگز skip نکن):**

این بخش از همهٔ بخش‌های دیگرِ این یادداشت **مهم‌تر** است. اگر نقض شود،
نتیجهٔ کار ممکن است مشروع به‌نظر برسد ولی در عمل بخش‌های دیگر سیستم را عقب
بیندازد، broken reference تولید کند، یا منجر به data corruption شود.

پیش از و حین تغییر، تمام وابستگی‌ها را در **چهار جهت** به‌طور **کامل و
بدون هیچ خلاصه‌سازی** شناسایی و همگام کن:

**۱. وابستگی‌های upstream (این تسک به چه چیزهایی متکی است):**
- چه فایل‌ها، توابع، کلاس‌ها، API endpoint ها، schema های دیتابیس،
  env vars، یا config هایی که این تسک نیاز دارد؟
- آیا قرار است چیزی را ویرایش/حذف کنی که جای دیگر (signature، رفتار،
  return type، side effect) از آن انتظار خاصی می‌رود؟
- اگر dependency جدیدی اضافه می‌کنی، آیا با dependencyهای موجود تداخل
  دارد (نسخه، compat، lock file)؟

**۲. وابستگی‌های downstream (چه چیزهایی به این تسک متکی‌اند):**
- چه فایل‌ها، توابع، تست‌ها، migrations، docs، یا UI component هایی از
  کدی که داری ویرایش/اضافه/حذف می‌کنی **استفاده می‌کنند**؟
- با grep و reference search **همه‌ی** call sites، importها، subclassها،
  reference های مستقیم و غیرمستقیم را پیدا کن — نه فقط چند مورد اصلی.
- خصوصاً برای حذف یا rename: هیچ broken reference نباید باقی بماند.

**۳. وابستگی‌های cross-tier (بسیار مهم — هرگز فقط یک لایه را نبین):**

تسک شما ممکن است از backend، frontend، database، worker، یا هر tier
دیگری شروع شده باشد. ولی تغییرات تقریباً همیشه روی tier های دیگر هم
اثر می‌گذارند. **مستقل از اینکه تسک از کدام tier است**، این چک‌های دو
طرفه را همیشه انجام بده:

🔁 **اگر backend را تغییر دادی** (API، service، model، route):
  → frontend: کدام component/page/hook این endpoint یا data shape را
    مصرف می‌کند؟ type definition، state shape، error handling، loading
    state، form validation، URL routing همگی باید همگام شوند.
  → mobile/SDK/client library (اگر پروژه دارد): همان داستان frontend.
  → database: آیا migration لازم است؟ آیا rollback امن است؟
  → background workers: آیا event producer/consumer ها تحت تأثیرند؟
  → rate limit، auth، CORS، CSP: آیا رفتار جدید پشتیبانی می‌شود؟

🔁 **اگر frontend را تغییر دادی** (component، form، state، route):
  → backend: آیا endpoint جدید/تغییریافته لازم است؟ آیا data shape ای
    که ارسال می‌شود با schema سرور سازگار است؟
  → backend validation: آیا برای ورودی‌های جدید UI کافی است؟
  → permissions/RBAC: آیا feature جدید نیاز به role check جدید دارد؟
  → analytics/tracking: آیا event های جدید باید در backend log شوند؟
  → SEO/SSR: آیا تغییر route نیاز به sitemap/meta tags جدید دارد؟

🔁 **اگر database/migration را تغییر دادی**:
  → backend models (ORM، Pydantic، dataclasses) همگی به‌روزند؟
  → query های raw SQL یا ORM queries با schema جدید سازگارند؟
  → seed data، fixtures، factory functions تست‌ها به‌روزند؟
  → frontend: آیا data shape جدید در UI به‌درستی render می‌شود؟
  → rollback migration نوشته شده و امن است؟

🔁 **اگر API contract یا event schema را تغییر دادی** (REST، GraphQL،
   WebSocket، gRPC، Kafka، …):
  → OpenAPI/GraphQL schema/proto file آپدیت شد؟
  → همه‌ی consumer ها (client، subscriber، webhook، external API
    user) با version جدید سازگارند؟
  → backward compatibility حفظ شده یا migration path روشن است؟
  → versioning header/path اگر breaking change است؟

🔁 **اگر infrastructure یا config را تغییر دادی** (Dockerfile، CI، Render
   config، env، secrets):
  → README setup/installation section به‌روزه؟
  → `.env.example` با env vars جدید آپدیت شد؟
  → deploy script یا CI workflow هم تغییر کرد؟
  → docs/architecture یا diagram های infrastructure به‌روزند؟

⚠️ **هرگز فقط یک tier را تغییر نده و فرض کنی بقیه خودکار همگام می‌شوند.**
   حتی برای تغییرات به‌ظاهر «کوچک»، چک کن.

**۴. وابستگی‌های جانبی (artifacts که همیشه چک شوند):**

تغییرات کد همیشه روی این artifact ها اثر دارند. **همه را** بررسی و
به‌روز کن — مستندات اولویت **بالا** دارد چون فراموش‌شدنی‌ترین است.

  📝 **مستندات** (همیشه چک کن — حتی برای تغییر کوچک کد):
    - README.md (شرح، setup، نمونه‌های استفاده، badge ها)
    - CHANGELOG.md / RELEASE_NOTES.md
    - docs/ folder (architecture، API reference، user guides، runbooks)
    - inline docstrings/کامنت‌های توابع و کلاس‌های تغییریافته
    - OpenAPI/Swagger annotations، JSDoc/TSDoc
    - architecture diagrams (اگر component اضافه/حذف شد)
    - migration guides (اگر breaking change است)

  🌍 **مستندات کاربر**:
    - i18n files و translation keys
    - UI labels، tooltip ها، help text، error messages
    - in-app onboarding (اگر flow جدید است)

  🧪 **تست‌ها**:
    - unit tests (همه‌ی فایل‌های مرتبط — حتی اگر «بی‌ربط» به‌نظر می‌رسد)
    - integration tests
    - e2e tests (Playwright/Cypress/Selenium)
    - snapshot tests (اگر UI تغییر کرد)
    - contract tests (Pact یا مشابه)
    - performance benchmarks (اگر behavior performance-sensitive تغییر کرد)

  🧬 **type definitions و contracts**:
    - .d.ts files
    - Pydantic models، dataclasses
    - Protobuf/Avro/Thrift schemas
    - GraphQL schema definitions
    - JSON Schemas

  🏗 **infrastructure و config**:
    - Dockerfile، docker-compose.yml
    - Kubernetes manifests
    - Render/Vercel/Netlify config
    - GitHub Actions / GitLab CI workflows
    - environment templates (.env.example، .env.sample)
    - feature flags (LaunchDarkly، GrowthBook، config)

  📊 **monitoring و observability**:
    - logging keys (اگر اضافه/حذف شد، log parser ها هم به‌روز شوند)
    - metric names (Prometheus، Datadog)
    - tracing spans
    - alert rules و dashboards
    - error tracking (Sentry rules، groupings)

  🔐 **security**:
    - auth rules (rate limit، CORS، CSP، HSTS)
    - permissions/RBAC config
    - secrets rotation policies
    - audit log events (اگر action جدید اضافه شد)

  💾 **caches و serialization**:
    - cache keys و TTL (اگر data shape یا lifecycle تغییر کرد)
    - serializer formats (Redis، session storage)
    - browser storage (localStorage، IndexedDB schemas)

**قانون مطلق همگام‌سازی:**
- هر چیزی که در (۱)، (۲)، (۳)، یا (۴) شناسایی شد، در **همان workflow
  این تسک** همگام و به‌روز شود. هرگز برای بعد رها نکن.
- اگر یک فایل/تست/docs نسبت به تغییر شما عقب بماند، در بهترین حالت bug،
  در بدترین حالت مشکل امنیتی یا data corruption تولید می‌کند.
- تغییرات همگام‌سازی می‌توانند در commit جداگانه باشند (در همان task)،
  ولی نباید skip شوند یا به «refactor آینده» سپرده شوند.

**هرگز این جمله‌ها قابل قبول نیست:**
- ❌ «بعداً پیداش می‌کنم»
- ❌ «احتمالاً جای دیگه‌ای استفاده نمی‌شه»
- ❌ «این یه refactor جداگانه‌ست — out of scope»
- ❌ «فقط فایل‌های اصلی رو بررسی کردم»
- ❌ «حدس می‌زنم چیزی بهش وابسته نیست»
- ❌ «دامنه‌ی وابستگی‌ها رو خلاصه کردم» — هرگز خلاصه نکن
- ❌ «این task فقط backend است؛ frontend مشکل خودش» — هرگز
- ❌ «این task فقط frontend است؛ backend از قبل کار می‌کند» — هرگز ثابت نکرده
- ❌ «مستندات بعداً به‌روز می‌شن» — همیشه same-task همگام شوند
- ❌ «testها رو نگاه نکردم چون فقط یه تغییر کوچیک بود»

**در commit message یا PR description**، دامنهٔ وابستگی‌های شناسایی‌شده و
همگام‌شده را به‌طور explicit و **per-tier** بنویس. مثال:
```
Dependencies synced:
- upstream: User model schema, auth middleware
- downstream: 3 API endpoints, 5 frontend components, 12 tests
- cross-tier (backend → frontend): UserProfile.tsx, useUser.ts hook,
  api-types.ts (TS definitions)
- cross-tier (backend → infra): .env.example added NEW_AUTH_SCOPES
- side artifacts: OpenAPI spec, README API section, i18n keys for
  new errors, Sentry alert rule for new error code
```
اگر هیچ وابستگی پیدا نکردی در هر کدام از چهار جهت، صریحاً بنویس:
«بررسی شد — هیچ وابستگی upstream / downstream / cross-tier (backend↔
frontend↔db↔infra) / side شناسایی نشد» تا مشخص باشد بررسی **انجام شده**
نه اینکه فراموش شده.

📋 **مدیریت TO-DO برای اقدامات دستی کاربر (همیشه چک کن):**

⚠️ **هشدار بحرانی — قاعدهٔ ضد-فرار:** TO-DO فقط برای کارهایی است که
**واقعاً غیرممکن** برای agent است (نیاز به انسان مطلق)، نه برای کارهایی
که «بزرگ‌اند»، «وقت می‌برند»، یا «نیازمند fixture/setup» هستند. اگر یک
agent در یک سشن بیش از **۲۰٪ از تسک‌ها** را با TO-DO ببندد، یعنی از کار
فرار می‌کند — این الگو در سشن‌های قبلی **مشاهده** شده و الان ممنوع است.

✅ **فقط برای این موارد TO-DO بساز** (لیست بسته — هرچه خارج این لیست
ممنوع است):

  ۱. **Credential/secret که فقط کاربر دارد**:
     - تنظیم API key واقعی در پنل ادمین خارجی (Render، AWS، Stripe، …)
     - تأیید OAuth client روی console آن سرویس
     - paste کردن webhook secret که فقط بعد از ساخت در dashboard ظاهر می‌شود

  ۲. **Account/billing روی سرویس خارجی که کاربر باید عضو شود**:
     - ساخت account جدید روی Stripe/SendGrid/Twilio/Google Cloud
     - تأیید verification شماره یا ID
     - فعال‌سازی subscription پولی

  ۳. **داده/asset خصوصی که فقط کاربر دارد**:
     - آپلود لوگو/تصویر/فونت برند
     - paste کردن داده‌ای که در محل کار کاربر است
     - import داده‌ای که فقط روی device کاربر است

  ۴. **تصمیم سلیقه‌ای/حقوقی/کسب‌وکار**:
     - انتخاب رنگ‌بندی نهایی یا تم
     - متن دقیق Terms of Service / Privacy Policy
     - تعرفهٔ قیمت‌گذاری
     - نام نهایی برند یا دامنه

⛔ **هرگز TO-DO نکن برای** (لیست سیاه — هر چیزی که در این لیست است
**قابل اجرا** توسط agent است، حتی اگر بزرگ یا چندبخشی باشد):

  ❌ UI component / page / dashboard (هر فریم‌ورک: React, Vue, Angular,
     Svelte، حتی اگر معماری بزرگ دارد) — می‌توانی stub اولیه + state
     management + layout + استایل بسازی
  ❌ "نیازمند Google Drive / Stripe / Twilio API" — می‌توانی **client
     stub** با abstraction layer بسازی که با env var واقعی plug-in شود؛
     کد integration یعنی پیاده‌سازی، نه TO-DO
  ❌ "feature بزرگ، چند روز کار می‌برد" — اندازه دلیل defer نیست؛ کوچک
     شروع کن، iterate کن، در همین سشن کامل کن
  ❌ Celery / background worker / scheduler — یک task ساده + register
     می‌توانی بسازی
  ❌ Migration / model / schema — حتی اگر فیلد جدید نیاز دارد، اضافه کن
  ❌ REST endpoint / GraphQL resolver / WebSocket route — هرگز TO-DO
  ❌ test (unit/integration/e2e) — همیشه قابل نوشتن
  ❌ Documentation / README / API docs — همیشه قابل نوشتن
  ❌ Config file / .env.example / Dockerfile / CI workflow — همیشه قابل
     نوشتن
  ❌ "می‌توانستی .tsx ولی repo .jsx است" — از .jsx استفاده کن، TO-DO نکن
  ❌ "نیازمند فیلد X در مدل دیگر" — اضافه کن فیلد را، TO-DO نکن
  ❌ "تصمیم admin-vs-user-scoped" — پرامپت اولیه scope را معلوم کرده،
     یا با محتاطانه‌ترین تفسیر پیش برو
  ❌ "credential در production هنوز ست نیست" — این TO-DO ساده برای
     تنظیم env var است (مورد ۱ بالا)، نه دلیل برای defer کردن کد
  ❌ "نیازمند verification از کاربر" — اگر اقدام واقعی غیرممکن نیست،
     پیش برو
  ❌ هر چیزی که در یک کامنت `# TODO` معمولی نوشته می‌شد — این فایل
     TO-DO نیست، کامنت inline است

🔬 **قاعدهٔ «حداقل تلاش» قبل از TO-DO**: قبل از TO-DO کردن یک AC، **اثبات
کن** که قابل انجام نیست:

  ۱. آیا می‌توانم یک stub/placeholder بسازم که با env واقعی plug-in شود؟
     → اگر بله، بساز و TO-DO نکن
  ۲. آیا می‌توانم برای این بخش یک test (حتی mock-based) بنویسم؟
     → اگر بله، بنویس و TO-DO نکن
  ۳. آیا می‌توانم abstraction/interface را تعریف کنم، حتی اگر backend
     واقعی نیست؟ → اگر بله، تعریف کن و TO-DO نکن
  ۴. آیا فقط یک حالت سلیقه‌ای/decision کاربر در میان است؟
     → فقط آن یک decision را TO-DO کن، نه کل feature را

اگر یکی از این چهار راه‌حل ممکن بود ولی به TO-DO رفتی، **اعتبار شما از
بین می‌رود**.

📊 **آستانهٔ TO-DO per session**: در یک حلقهٔ اجرای N تسک، اگر بیشتر از
**۲۰٪** تسک‌ها فایل TO-DO ساختی، خودت در گزارش پایانی صریحاً اعلام کن:

  "⚠️ نسبت TO-DO من {K}/{N} = {%} است که از آستانهٔ ۲۰٪ بالاتر است.
   احتمالاً برخی از این TO-DO ها قابل اجرا بودند ولی من فرار کردم.
   لیست TO-DO ها را کاربر باید بازبینی کند که آیا واقعاً Manual-required
   بودند یا agent ضعیف کار کرده."

**یادآوری همیشگی:** اگر در آینده قابلیت‌های شما گسترش پیدا کرد و توانستید
یکی از موارد لیست سفید را خودکار انجام دهید (مثلاً managed credential
injection، یا integration پولی automate شود)، انجام دهید و TO-DO نسازید.
لیست سفید بسته است ولی **بسته از پایین** (می‌تواند کوچک‌تر شود اگر
قابلیت‌ها رشد کنند، ولی هرگز بزرگ‌تر نشود برای فرار).

**اگر هیچ بخش Manual-required نبود (تمام تسک Auto-capable است)**:
  → فایل TO-DO **نساز**. فولدر TO-DO/ باید پاک و معنادار بماند.
  → اگر برای این task از قبل `TO-DO/todo-task-{task_id_first_8}.md` بود
     (یعنی در run قبلی نیاز به دخالت کاربر بود ولی الان نه): فایل قدیمی
     را پاک کن و entry را از `TO-DO/_index.json` حذف کن.

**اگر بخش Manual-required دارد** (همه‌جانبه یا hybrid):
  1. فولدر TO-DO/ را در ریشه ریپو ایجاد کن اگر نیست
  2. فایل `TO-DO/todo-task-{task_id_first_8}.md` بساز با front-matter
     شامل: task_id, task_title, execution_priority, created_at,
     updated_at, status: "pending"
     و در بدنه: «چرا این فایل ساخته شد»، «وضعیت بخش‌های خودکار»
     (commit ها reference)، «کارهایی که باید انجام دهی» با اولویت
     بالا/متوسط/پایین به ترتیب، «وقتی این کارها را تمام کردی»
  3. `TO-DO/_index.json` را با **merge** آپدیت کن (نه overwrite):
     - فایل موجود را بخوان
     - entry های orphan (فایلشان پاک شده) را حذف کن
     - entry این task را اضافه/replace کن
     - بر اساس execution_priority صعودی مرتب کن
     - ساختار: `{"version":1, "generated_at": ISO, "total": N, "items": [...]}`
  4. این تغییرات TO-DO را در **همان commit کد** شامل کن (نه commit جداگانه)

⛔ **ممنوعات مطلق TO-DO**:
  ❌ ساختن TO-DO برای کاری که می‌توانستی خودت انجام دهی (شلوغی فولدر)
  ❌ overwrite کردن `TO-DO/_index.json` بدون merge (data loss)
  ❌ نگه‌داشتن entry هایی که فایل‌شان پاک شده (broken reference)
  ❌ فراموش کردن نوشتن «خروجی مورد انتظار» در هر آیتم TO-DO

این بخش الزامی است. حتی اگر فکر می‌کنی "این تسک کاملاً auto است و نیازی
به TO-DO نیست"، صریحاً در commit message یا report بنویس:
"بررسی شد — این تسک هیچ بخش Manual-required ندارد، TO-DO ساخته نشد."

📦 **اگر کار طولانی است:**
- **خلاصه‌اش نکن.** همه را به‌طور کامل انجام بده.
- اگر یک کامیت گنجایش ندارد، در **چندین کامیت متوالی** انجام بده — ولی
  هیچ بخشی را skip نکن.
- ترتیب کامیت‌ها را منطقی نگه‌دار (foundation → core → integration → tests).
- در آخر یک checklist از همه‌ی کامیت‌ها در PR description بنویس.

🔁 **Commit + Push فوری per-task (بسیار مهم برای جریان کار صحیح):**

پس از اتمام پیاده‌سازی این تسک، **بلافاصله** commit کن و **همان موقع**
به default branch (main/master) push کن. سپس به تسک بعدی برو.

✓ چرا این قانون حیاتی است:
  - تسک‌های بعدی ممکن است به فایل‌ها/تغییراتی که این تسک ایجاد کرده
    نیاز داشته باشند. اگر push نکنی، `git pull` بعدی آن‌ها را نمی‌بیند.
  - جمع‌کردن تغییرات چند تسک منجر به conflict های بزرگ می‌شود.
  - اگر در میانه fail کنی، task های push شده ضایع نمی‌شوند.

⛔ ممنوع: "همه task ها را تمام می‌کنم بعد یک‌جا push می‌زنم"
⛔ ممنوع: branch جدا برای task — مستقیم به default branch
⛔ ممنوع: task بعدی بدون push کامل task قبلی

---


---

## 📥 درخواست خام کاربر (verbatim — همان متنی که کاربر نوشت)
_(همهٔ URL ها، آدرس‌ها، نام‌ها، و کلمات کلیدی در این متن دست‌نخورده هستند.)_

```
وجود فایل .env.example نشان‌دهنده استفاده از متغیرهای محیطی است، اما عدم وجود validation، encryption و proper handling این متغیرها خطر امنیتی جدی ایجاد می‌کند. API keys مربوط به Gemini AI و سایر سرویس‌ها در معرض خطر قرار دارند.
```

## 📋 چک‌لیست مراحل (3 مرحله)

این تسک به مراحل کوچک‌تر تقسیم شده. **در هر verify خودکار، وضعیت هر مرحله به‌صورت `[ ]` (انجام نشده)، `[~]` (ناقص)، یا `[x]` (انجام شده) به‌روز می‌شود.**
وقتی تمام مراحل `[x]` شدند، تسک به‌طور خودکار به «انجام شده» منتقل می‌شود.

- [x] **مرحله 1: پیاده‌سازی اعتبارسنجی (Validation) برای تمام متغیرهای محیطی در زمان راه‌اندازی برنامه** — این مرحله شامل ایجاد یک مکانیزم مرکزی برای اعتبارسنجی تمام متغیرهای محیطی (مانند API keys، URLs، و سایر تنظیمات) در زمان startup برنامه است. باید بررسی کند که متغیرهای ضروری وجود دارند، خالی نیستند، و در صورت امکان فرمت صحیح دارند (مثلاً URL معتبر). این مرحله شامل encryption یا handling امنیتی دیگر 
- [x] **مرحله 2: پیاده‌سازی رمزنگاری (Encryption) برای ذخیره‌سازی امن API keys و متغیرهای حساس** — این مرحله شامل پیاده‌سازی یک مکانیزم برای رمزنگاری متغیرهای محیطی حساس (مانند API keys) در زمان ذخیره‌سازی (مثلاً در فایل .env یا دیتابیس) است. باید از یک الگوریتم رمزنگاری استاندارد (مانند AES-256) استفاده کند. کلید رمزنگاری باید خودش از یک متغیر محیطی دیگر (مانند ENCRYPTION_KEY) خوانده شود. این مر
- [x] **مرحله 3: پیاده‌سازی مدیریت امن (Proper Handling) برای متغیرهای محیطی شامل لاگینگ امن و خطاهای مناسب** — این مرحله شامل پیاده‌سازی یک لایه مدیریت امن برای متغیرهای محیطی است. این شامل: ۱) هرگز لاگ نکردن مقادیر واقعی API keys یا متغیرهای حساس در console یا فایل‌های لاگ (فقط نشانگرهایی مانند '***' یا '[REDACTED]'). ۲) ارائه خطاهای کاربرپسند و امن که اطلاعات حساس را فاش نکنند. ۳) اطمینان از اینکه متغیرهای

---

# 🔹 مرحله 1: پیاده‌سازی اعتبارسنجی (Validation) برای تمام متغیرهای محیطی در زمان راه‌اندازی برنامه

**Scope:** این مرحله شامل ایجاد یک مکانیزم مرکزی برای اعتبارسنجی تمام متغیرهای محیطی (مانند API keys، URLs، و سایر تنظیمات) در زمان startup برنامه است. باید بررسی کند که متغیرهای ضروری وجود دارند، خالی نیستند، و در صورت امکان فرمت صحیح دارند (مثلاً URL معتبر). این مرحله شامل encryption یا handling امنیتی دیگر نمی‌شود. نکته حیاتی: اعتبارسنجی باید fail-fast باشد، یعنی اگر متغیری معتبر نباشد، برنامه با خطای واضح متوقف شود.
**Key terms:** .env.example, validation, API keys, Gemini AI, متغیرهای محیطی

**بخش مربوط از متن کاربر:**
```
وجود فایل .env.example نشان‌دهنده استفاده از متغیرهای محیطی است، اما عدم وجود validation، encryption و proper handling این متغیرها خطر امنیتی جدی ایجاد می‌کند. API keys مربوط به Gemini AI و سایر سرویس‌ها در معرض خطر قرار دارند.
```

## 🎯 هدف (خلاصه ساختاریافته)
پیاده‌سازی اعتبارسنجی fail-fast برای متغیرهای محیطی در startup

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/server.js:53-53` — `GEMINI_API_KEY` — این خط متغیر محیطی را می‌خواند اما هیچ اعتبارسنجی fail-fast ندارد. فقط در endpointها با if ساده بررسی می‌شود.
  ```jsx
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  ```
- `backend/server.js:38-39` — `PORT` — PORT با مقدار پیش‌فرض استفاده شده اما اگر کاربر مقدار نامعتبر (مثلاً 'abc') بدهد، برنامه بدون خطا اجرا می‌شود.
  ```jsx
  const app = express();
  const PORT = process.env.PORT || 3001;
  ```
- `backend/server.js:14-14` — `dotenv.config()` — بعد از این خط باید تابع validateEnv() فراخوانی شود تا قبل از شروع سرویس، متغیرها بررسی شوند.
  ```jsx
  dotenv.config();
  ```
- `backend/.env.example:1-8` — `کل فایل` — این فایل نشان‌دهنده متغیرهای مورد نیاز است. validation باید بر اساس این فایل طراحی شود.
  ```
  # Gemini API Key - Get from https://aistudio.google.com/apikey
  GEMINI_API_KEY=your_gemini_api_key_here
  
  # Port (optional, default 3001)
  PORT=3001
  
  # Firebase config (optional - for data persistence)
  # VITE_FIREBASE_CONFIG={"apiKey":"...","authDomain":"...","projectId":"...","storageBucket":"...","messagingSenderId":"...","appId":"..."}
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
JavaScript (Node.js) با Express.js، dotenv برای مدیریت متغیرهای محیطی، WebSocket (ws)، multer برای آپلود فایل، fluent-ffmpeg برای پردازش ویدیو/صوت. Stack: backend با Express.js، frontend با React/Vite.

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `backend/server.js` (سطر 14) — فایل اصلی که متغیرهای محیطی را می‌خواند و باید تابع validateEnv را import و فراخوانی کند.
- `backend/.env.example` (سطر 1) — مرجع تعریف متغیرهای محیطی مورد نیاز پروژه. validation باید با این فایل هماهنگ باشد.
- `backend/package.json` (سطر 1) — برای اطمینان از اینکه وابستگی `dotenv` در dependencies وجود دارد (در package-lock.json دیده می‌شود).
- `render.yaml` (سطر 1) — فایل کانفیگ deployment که ممکن است متغیرهای محیطی در آن تعریف شده باشند. validation باید با deployment هماهنگ باشد.

## 🌐 نقشهٔ وابستگی‌ها
این تغییر یک فایل جدید `backend/config/validateEnv.js` ایجاد می‌کند که توسط `backend/server.js` import می‌شود. `backend/server.js` تنها فایلی است که مستقیماً از `process.env` می‌خواند (خطوط ۳۹، ۵۳). هیچ فایل دیگری در پروژه مستقیماً از `process.env` استفاده نمی‌کند (frontend از `__firebase_config` در index.html استفاده می‌کند). تابع `validateEnv` هیچ وابستگی خارجی به جز `dotenv` (که قبلاً نصب است) ندارد. تغییر در `backend/server.js` روی endpointهای `/api/gemini/chat`، `/api/gemini/tts`، `/api/list-models`، `/api/test-gemini` و `/api/analyze-files` تأثیر می‌گذارد زیرا این endpointها دیگر نیازی به بررسی `if (!GEMINI_API_KEY)` نخواهند داشت (چون در startup بررسی شده).

## 🔍 Context و وضعیت فعلی
کاربر درخواست پیاده‌سازی یک مکانیزم مرکزی برای اعتبارسنجی تمام متغیرهای محیطی (مانند API keys، URLs، و سایر تنظیمات) در زمان startup برنامه را دارد. این اعتبارسنجی باید بررسی کند که متغیرهای ضروری وجود دارند، خالی نیستند، و در صورت امکان فرمت صحیح دارند (مثلاً URL معتبر). نکته حیاتی: اعتبارسنجی باید fail-fast باشد، یعنی اگر متغیری معتبر نباشد، برنامه با خطای واضح متوقف شود. کاربر به فایل `backend/.env.example` اشاره کرده که حاوی متغیرهای `GEMINI_API_KEY`، `PORT` و `VITE_FIREBASE_CONFIG` است. در کد واقعی `backend/server.js`، متغیر `GEMINI_API_KEY` در خط ۵۳ با `process.env.GEMINI_API_KEY` خوانده می‌شود و در endpointهای `/api/gemini/chat` (خط ۵۶)، `/api/gemini/tts` (خط ۱۱۷)، `/api/list-models` (خط ۱۷۲)، `/api/test-gemini` (خط ۱۹۵) و `/api/analyze-files` (خط ۶۹۸) فقط با یک `if (!GEMINI_API_KEY)` ساده بررسی می‌شود که منجر به بازگشت error 500 می‌شود، نه توقف برنامه. همچنین متغیر `PORT` در خط ۳۹ با مقدار پیش‌فرض ۳۰۰۱ استفاده شده اما اعتبارسنجی نشده. عدم وجود validation، encryption و proper handling این متغیرها خطر امنیتی جدی ایجاد می‌کند. API keys مربوط به Gemini AI و سایر سرویس‌ها در معرض خطر قرار دارند. کاربر خواستار fail-fast validation است، یعنی اگر متغیری معتبر نباشد، برنامه با خطای واضح متوقف شود.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] زمانی که فایل `.env` وجود ندارد یا `GEMINI_API_KEY` در آن تعریف نشده، برنامه با خطای واضح 'FATAL: متغیر محیطی GEMINI_API_KEY معتبر نیست' متوقف شود و process.exit(1) فراخوانی شود.
- [ ] زمانی که `GEMINI_API_KEY` با فرمت نامعتبر (مثلاً 'abc' بدون پیشوند AIza) تنظیم شده، برنامه با خطا متوقف شود.
- [ ] زمانی که `PORT` با مقدار غیرعددی (مثلاً 'abc') تنظیم شده، برنامه با خطا متوقف شود.
- [ ] زمانی که همه متغیرهای محیطی معتبر هستند، برنامه بدون خطا startup شود و endpoint `/api/health` در خط 167 همچنان کار کند.
- [ ] فایل `backend/config/validateEnv.js` ایجاد شده و تابع `validateEnv` در `backend/server.js` بعد از `dotenv.config()` در خط 14 فراخوانی شود.
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. ۱. ایجاد فایل جدید `backend/config/validateEnv.js` با یک تابع `validateEnv()` که در زمان startup فراخوانی شود.
۲. در این تابع، ابتدا متغیر `GEMINI_API_KEY` از `process.env` خوانده شود و بررسی شود که وجود دارد و خالی نیست. اگر وجود نداشت یا خالی بود، `console.error` با پیام واضح چاپ کند و `process.exit(1)` فراخوانی شود.
۳. متغیر `PORT` بررسی شود: اگر تعریف شده، باید یک عدد صحیح بین ۱ تا ۶۵۵۳۵ باشد. اگر تعریف نشده، مقدار پیش‌فرض ۳۰۰۱ استفاده شود (نیاز به fail-fast ندارد).
۴. متغیر `VITE_FIREBASE_CONFIG` (اختیاری) بررسی شود: اگر تعریف شده، باید یک JSON معتبر باشد. اگر نامعتبر بود، warning چاپ شود اما برنامه fail نشود.
۵. در `backend/server.js`، در خطوط ابتدایی (بعد از `dotenv.config()` در خط ۱۴)، تابع `validateEnv()` فراخوانی شود.
۶. پیام خطاها باید به فارسی و انگلیسی باشد و دقیقاً مشخص کند کدام متغیر مشکل دارد و چه مقداری انتظار می‌رود.
۷. برای `GEMINI_API_KEY`، یک validation ساده فرمت (شروع با 'AIza') اضافه شود تا از اشتباهات تایپی جلوگیری کند.

## 💡 نمونه‌های قبل/بعد
**اعتبارسنجی GEMINI_API_KEY در startup**

_قبل:_
```
// backend/server.js خط 53
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// سپس در هر endpoint:
if (!GEMINI_API_KEY) {
  return res.status(500).json({ error: 'API key not configured' });
}
```

_بعد:_
```
// backend/config/validateEnv.js (فایل جدید)
export function validateEnv() {
  const requiredVars = [
    { name: 'GEMINI_API_KEY', validator: (v) => v && v.startsWith('AIza') }
  ];
  
  for (const { name, validator } of requiredVars) {
    const value = process.env[name];
    if (!value || !validator(value)) {
      console.error(`❌ FATAL: متغیر محیطی ${name} معتبر نیست. مقدار فعلی: '${value?.substring(0, 10)}...'`);
      console.error(`   لطفاً یک API key معتبر از https://aistudio.google.com/apikey دریافت کنید.`);
      process.exit(1);
    }
  }
  
  // PORT validation (optional but warn if invalid)
  const port = process.env.PORT;
  if (port) {
    const portNum = parseInt(port, 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      console.error(`❌ FATAL: PORT=${port} معتبر نیست. باید یک عدد بین 1 تا 65535 باشد.`);
      process.exit(1);
    }
  }
}

// backend/server.js خط 14 (بعد از dotenv.config)
import { validateEnv } from './config/validateEnv.js';
dotenv.config();
validateEnv();
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `cd backend && node -e "process.env.GEMINI_API_KEY=''; import('./config/validateEnv.js').then(m => m.validateEnv())"`
- `cd backend && node -e "process.env.GEMINI_API_KEY='AIzaValidKey'; process.env.PORT='abc'; import('./config/validateEnv.js').then(m => m.validateEnv())"`
- `cd backend && npm test -- --grep 'validateEnv'`

## ⚠️ ریسک‌ها و موارد احتیاط
۱. اگر `validateEnv()` قبل از `dotenv.config()` فراخوانی شود، متغیرها از فایل `.env` بارگذاری نشده‌اند و برنامه همیشه fail می‌شود. باید ترتیب فراخوانی رعایت شود (خط ۱۴ `backend/server.js`). ۲. تغییر در `backend/server.js` ممکن است با deployment pipeline (فایل `render.yaml`) تداخل داشته باشد اگر متغیرهای محیطی در Render تنظیم شده باشند. ۳. اگر کاربر از متغیر `GEMINI_API_KEY` با فرمت غیراستاندارد (اما معتبر) استفاده کند، validation با `startsWith('AIza')` ممکن است false positive ایجاد کند. باید validator انعطاف‌پذیرتر باشد.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: critical
- تخمین زمان: small

---

# 🔹 مرحله 2: پیاده‌سازی رمزنگاری (Encryption) برای ذخیره‌سازی امن API keys و متغیرهای حساس

**Scope:** این مرحله شامل پیاده‌سازی یک مکانیزم برای رمزنگاری متغیرهای محیطی حساس (مانند API keys) در زمان ذخیره‌سازی (مثلاً در فایل .env یا دیتابیس) است. باید از یک الگوریتم رمزنگاری استاندارد (مانند AES-256) استفاده کند. کلید رمزنگاری باید خودش از یک متغیر محیطی دیگر (مانند ENCRYPTION_KEY) خوانده شود. این مرحله شامل validation یا handling لاگینگ نمی‌شود. نکته حیاتی: کلید رمزنگاری نباید در کد منبع hard-coded شود.
**Key terms:** .env.example, encryption, API keys, Gemini AI, AES-256, ENCRYPTION_KEY

**بخش مربوط از متن کاربر:**
```
وجود فایل .env.example نشان‌دهنده استفاده از متغیرهای محیطی است، اما عدم وجود validation، encryption و proper handling این متغیرها خطر امنیتی جدی ایجاد می‌کند. API keys مربوط به Gemini AI و سایر سرویس‌ها در معرض خطر قرار دارند.
```

## 🎯 هدف (خلاصه ساختاریافته)
پیاده‌سازی رمزنگاری AES-256 برای API Keys

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/server.js:53-54` — `GEMINI_API_KEY` — API key مستقیم از env خوانده می‌شود — باید رمزگشایی شود
  ```jsx
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  ```
- `backend/.env.example:1-5` — `GEMINI_API_KEY` — فایل example باید شامل ENCRYPTION_KEY هم باشد
  ```
  # Gemini API Key - Get from https://aistudio.google.com/apikey
  GEMINI_API_KEY=your_gemini_api_key_here
  
  # Port (optional, default 3001)
  PORT=3001
  ```
- `backend/server.js:84` — `apiUrl` — استفاده مستقیم از API key در URL — باید از متغیر رمزگشایی‌شده استفاده کند
  ```jsx
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
JavaScript (Node.js) — backend با Express.js و WebSocket. رمزنگاری با crypto (built-in Node.js) یا کتابخانه crypto-js. الگوریتم AES-256-GCM.

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `backend/package.json` (سطر 1) — برای اضافه کردن وابستگی crypto (built-in) نیاز به تغییر ندارد، اما ممکن است نیاز به نصب crypto-js یا @noble/ciphers باشد
- `frontend/index.html` (سطر 11) — Firebase config به صورت plain text در HTML ذخیره شده — نیاز به رمزنگاری در سمت کلاینت دارد (اما خارج از scope این تسک)
- `backend/server.js` (سطر 84) — تمام endpoint‌هایی که از GEMINI_API_KEY استفاده می‌کنند (خطوط 84, 124, 178, 205, 274, 304, 376, 396, 434) باید از متغیر رمزگشایی‌شده استفاده کنند

## 🌐 نقشهٔ وابستگی‌ها
این تغییر یک فایل جدید (backend/utils/encryption.js) ایجاد می‌کند که توسط backend/server.js import می‌شود. تابع encrypt/decrypt در زمان راه‌اندازی سرور (خط 53 server.js) فراخوانی می‌شود. تمام endpointهای API که از GEMINI_API_KEY استفاده می‌کنند (خطوط 84, 124, 178, 205, 274, 304, 376, 396, 434) به صورت غیرمستقیم تحت تأثیر قرار می‌گیرند چون از یک متغیر سراسری استفاده می‌کنند. فایل .env.example نیز به‌روزرسانی می‌شود.

## 🔍 Context و وضعیت فعلی
کاربر درخواست پیاده‌سازی رمزنگاری (Encryption) برای ذخیره‌سازی امن API keys و متغیرهای حساس را دارد. این مرحله شامل پیاده‌سازی یک مکانیزم برای رمزنگاری متغیرهای محیطی حساس (مانند API keys) در زمان ذخیره‌سازی (مثلاً در فایل .env یا دیتابیس) است. باید از یک الگوریتم رمزنگاری استاندارد (مانند AES-256) استفاده کند. کلید رمزنگاری باید خودش از یک متغیر محیطی دیگر (مانند ENCRYPTION_KEY) خوانده شود. این مرحله شامل validation یا handling لاگینگ نمی‌شود. نکته حیاتی: کلید رمزنگاری نباید در کد منبع hard-coded شود.

--- بخش مربوط از درخواست اصلی کاربر ---
وجود فایل .env.example نشان‌دهنده استفاده از متغیرهای محیطی است، اما عدم وجود validation، encryption و proper handling این متغیرها خطر امنیتی جدی ایجاد می‌کند. API keys مربوط به Gemini AI و سایر سرویس‌ها در معرض خطر قرار دارند.

--- کلیدواژه‌ها ---
.env.example, encryption, API keys, Gemini AI, AES-256, ENCRYPTION_KEY

شواهد در کد واقعی پروژه:
- فایل backend/.env.example (خط 1-5): حاوی GEMINI_API_KEY و PORT و Firebase config است.
- فایل backend/server.js (خط 53): const GEMINI_API_KEY = process.env.GEMINI_API_KEY; — API key مستقیم از env خوانده می‌شود.
- فایل backend/server.js (خط 57-58): if (!GEMINI_API_KEY) { return res.status(500).json({ error: 'API key not configured' }); } — عدم وجود رمزنگاری.
- فایل backend/server.js (خط 84, 124, 178, 205, 274, 304, 376, 396, 434): استفاده مستقیم از GEMINI_API_KEY در URL‌های API.
- فایل frontend/index.html (خط 11-18): Firebase config به صورت plain text در HTML ذخیره شده است.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فایل backend/utils/encryption.js باید وجود داشته باشد و شامل توابع encrypt و decrypt با AES-256-GCM باشد
- [ ] کلید رمزنگاری (ENCRYPTION_KEY) نباید در کد منبع hard-coded شده باشد — باید از process.env.ENCRYPTION_KEY خوانده شود
- [ ] مقدار GEMINI_API_KEY در backend/server.js باید از تابع decrypt عبور کند، نه مستقیم از process.env
- [ ] فایل backend/.env.example باید شامل ENCRYPTION_KEY باشد
- [ ] سرور باید با کلید رمزنگاری‌شده در .env راه‌اندازی شود و endpoint /api/health پاسخ 200 بدهد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. 1. ایجاد فایل جدید backend/utils/encryption.js با توابع encrypt و decrypt با استفاده از الگوریتم AES-256-GCM.
2. خواندن کلید رمزنگاری از متغیر محیطی ENCRYPTION_KEY (نه hard-code).
3. اصلاح فایل backend/server.js برای استفاده از توابع رمزنگاری هنگام خواندن GEMINI_API_KEY از process.env.
4. به‌روزرسانی فایل backend/.env.example برای اضافه کردن ENCRYPTION_KEY.
5. رمزنگاری مقدار GEMINI_API_KEY در فایل .env واقعی (نه example).
6. عدم تغییر در frontend/index.html فعلاً (چون Firebase config عمومی است).

## 💡 نمونه‌های قبل/بعد
**خواندن API key بدون رمزنگاری**

_قبل:_
```
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
```

_بعد:_
```
const encryptedKey = process.env.GEMINI_API_KEY;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const GEMINI_API_KEY = decrypt(encryptedKey, ENCRYPTION_KEY);
```

**فایل .env.example قبل و بعد**

_قبل:_
```
GEMINI_API_KEY=your_gemini_api_key_here
```

_بعد:_
```
# Encryption key (32 characters for AES-256)
ENCRYPTION_KEY=your_32_char_encryption_key_here

# Encrypted API key (use encryption utility to generate)
GEMINI_API_KEY=encrypted_value_here
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `node -e "const { encrypt, decrypt } = require('./backend/utils/encryption.js'); const key = '12345678901234567890123456789012'; const encrypted = encrypt('test-key', key); console.log(decrypt(encrypted, key) === 'test-key' ? 'PASS' : 'FAIL');"`
- `grep -r 'process.env.GEMINI_API_KEY' backend/server.js | grep -v 'decrypt' && echo 'WARNING: Direct usage found' || echo 'OK: No direct usage'`
- `grep 'ENCRYPTION_KEY' backend/.env.example || echo 'FAIL: ENCRYPTION_KEY not in .env.example'`

## ⚠️ ریسک‌ها و موارد احتیاط
ریسک اصلی: اگر ENCRYPTION_KEY گم شود، تمام API keys غیرقابل بازیابی می‌شوند. همچنین، رمزنگاری در سمت سرور باعث افزایش latency در زمان راه‌اندازی می‌شود (حدود 10-50ms). تغییر در backend/server.js (خط 53) روی تمام endpointهایی که از GEMINI_API_KEY استفاده می‌کنند (حداقل 9 endpoint) تأثیر می‌گذارد. اگر رمزگشایی fail شود، سرور باید graceful shutdown انجام دهد نه crash.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: critical
- تخمین زمان: medium

---

# 🔹 مرحله 3: پیاده‌سازی مدیریت امن (Proper Handling) برای متغیرهای محیطی شامل لاگینگ امن و خطاهای مناسب

**Scope:** این مرحله شامل پیاده‌سازی یک لایه مدیریت امن برای متغیرهای محیطی است. این شامل: ۱) هرگز لاگ نکردن مقادیر واقعی API keys یا متغیرهای حساس در console یا فایل‌های لاگ (فقط نشانگرهایی مانند '***' یا '[REDACTED]'). ۲) ارائه خطاهای کاربرپسند و امن که اطلاعات حساس را فاش نکنند. ۳) اطمینان از اینکه متغیرهای محیطی در حافظه (memory) بیش از حد لازم نگهداری نشوند. این مرحله شامل validation یا encryption نمی‌شود. نکته حیاتی: هیچ متغیر حساسی نباید در stack trace یا error message ظاهر شود.
**Key terms:** .env.example, proper handling, API keys, Gemini AI, logging, error handling

**بخش مربوط از متن کاربر:**
```
وجود فایل .env.example نشان‌دهنده استفاده از متغیرهای محیطی است، اما عدم وجود validation، encryption و proper handling این متغیرها خطر امنیتی جدی ایجاد می‌کند. API keys مربوط به Gemini AI و سایر سرویس‌ها در معرض خطر قرار دارند.
```

## 🎯 هدف (خلاصه ساختاریافته)
پیاده‌سازی مدیریت امن متغیرهای محیطی در backend/server.js

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/server.js:53-53` — `GEMINI_API_KEY` — نقطه ورود متغیر محیطی حساس — باید از اینجا به بعد مدیریت امن اعمال شود
  ```jsx
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  ```
- `backend/server.js:207-207` — `console.log('Testing Gemini API with URL:', apiUrl.replace(GEMINI_API_KEY, 'HIDDEN'))` — لاگینگ ناقص — اگر replace شکست بخورد، کلید فاش می‌شود. باید با تابع امن جایگزین شود
  ```jsx
  console.log('Testing Gemini API with URL:', apiUrl.replace(GEMINI_API_KEY, 'HIDDEN'));
  ```
- `backend/server.js:183-183` — `keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...'` — فاش کردن ۱۰ کاراکتر اول کلید در پاسخ API — خطر امنیتی جدی
  ```jsx
  return res.status(response.status).json({ error: data, keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...' });
  ```
- `backend/server.js:188-188` — `keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...'` — فاش کردن ۱۰ کاراکتر اول کلید در پاسخ API — خطر امنیتی جدی
  ```jsx
  res.json({ models: modelNames, count: modelNames.length, keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...' });
  ```
- `backend/server.js:224-224` — `keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...'` — فاش کردن ۱۰ کاراکتر اول کلید در پاسخ API — خطر امنیتی جدی
  ```jsx
  keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...'
  ```
- `backend/server.js:234-234` — `keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...'` — فاش کردن ۱۰ کاراکتر اول کلید در پاسخ API — خطر امنیتی جدی
  ```jsx
  keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...'
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Stack تشخیص داده شده: JavaScript (Node.js backend با Express، frontend با React/Vite). کتابخانه‌های مرتبط: dotenv (برای بارگذاری .env)، winston یا pino (برای لاگینگ امن — در صورت نیاز).

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `backend/.env.example` (سطر 2) — فایل نمونه که نشان‌دهنده متغیرهای محیطی مورد استفاده است — باید مستندات مربوط به مدیریت امن را نیز شامل شود
- `frontend/index.html` (سطر 11) — حاوی Firebase config در خطوط 11-18 که شامل apiKey است — این config نیز باید از لاگینگ امن برخوردار باشد
- `backend/package.json` (سطر 1) — وابستگی‌های پروژه backend — ممکن است نیاز به افزودن کتابخانه‌ای برای مدیریت امن متغیرهای محیطی باشد
- `frontend/src/App.jsx` (سطر 1) — فایل اصلی frontend که ممکن است از API keyها استفاده کند — باید بررسی شود که آیا متغیرهای محیطی در frontend نیز نیاز به مدیریت امن دارند

## 🌐 نقشهٔ وابستگی‌ها
این تغییرات عمدتاً بر فایل backend/server.js متمرکز است که نقطه مرکزی مدیریت API keyهاست. متغیر GEMINI_API_KEY در 8 نقطه مختلف در این فایل استفاده می‌شود: خط 53 (تعریف)، خطوط 84, 124, 178, 205, 274, 304, 376, 396, 434 (استفاده در URLها). همچنین در خطوط 183, 188, 224, 234 (keyPrefix) و خط 207 (لاگینگ). فایل frontend/index.html حاوی Firebase config است که باید جداگانه بررسی شود. فایل backend/.env.example به عنوان مرجع مستندات باید به‌روزرسانی شود.

## 🔍 Context و وضعیت فعلی
کاربر درخواست پیاده‌سازی مدیریت امن (Proper Handling) برای متغیرهای محیطی شامل لاگینگ امن و خطاهای مناسب را داده است. این شامل: ۱) هرگز لاگ نکردن مقادیر واقعی API keys یا متغیرهای حساس در console یا فایل‌های لاگ (فقط نشانگرهایی مانند '***' یا '[REDACTED]'). ۲) ارائه خطاهای کاربرپسند و امن که اطلاعات حساس را فاش نکنند. ۳) اطمینان از اینکه متغیرهای محیطی در حافظه (memory) بیش از حد لازم نگهداری نشوند. این مرحله شامل validation یا encryption نمی‌شود. نکته حیاتی: هیچ متغیر حساسی نباید در stack trace یا error message ظاهر شود. --- بخش مربوط از درخواست اصلی کاربر --- وجود فایل .env.example نشان‌دهنده استفاده از متغیرهای محیطی است، اما عدم وجود validation، encryption و proper handling این متغیرها خطر امنیتی جدی ایجاد می‌کند. API keys مربوط به Gemini AI و سایر سرویس‌ها در معرض خطر قرار دارند. --- کلیدواژه‌ها --- .env.example, proper handling, API keys, Gemini AI, logging, error handling. شواهد در کد واقعی پروژه: در فایل backend/server.js، خط 53: const GEMINI_API_KEY = process.env.GEMINI_API_KEY; این متغیر در 8 نقطه مختلف مستقیماً استفاده شده و در console.log خط 207: console.log('Testing Gemini API with URL:', apiUrl.replace(GEMINI_API_KEY, 'HIDDEN')); و خط 183: keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...' و خط 188: keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...' و خط 224: keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...' و خط 234: keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...' که بخشی از کلید را فاش می‌کند. همچنین در خط 94: console.error('Gemini API error:', errorData); و خط 111: console.error('Chat API error:', error); و خط 146: console.error('TTS API error:', errorData); و خط 161: console.error('TTS API error:', error); و خط 190: res.status(500).json({ error: error.message }); و خط 237: console.error('Test error:', error); و خط 289: throw new Error(`Gemini API error: ${error}`); و خط 322: throw new Error(`Failed to start upload: ${error}`); و خط 354: throw new Error(`Failed to upload file: ${error}`); و خط 417: throw new Error(`Gemini API error: ${error}`); که ممکن است error message حاوی اطلاعات حساس باشد.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] هیچ occurrence از GEMINI_API_KEY در console.log یا console.error نباید مقدار واقعی را نشان دهد — فقط '[REDACTED]' یا '***'
- [ ] هیچ endpoint API نباید keyPrefix یا بخشی از API key را در response برگرداند — همه باید با '[REDACTED]' جایگزین شوند
- [ ] هیچ error message در throw new Error نباید حاوی مقدار واقعی API key باشد — پیام‌های خطا باید عمومی و امن باشند
- [ ] تابع کمکی redactSensitiveData باید در backend/server.js تعریف شده باشد و تمام occurrenceهای API key را در رشته‌ها redact کند
- [ ] تماس با console.log در خط 207 باید از تابع امن استفاده کند و apiUrl.replace(GEMINI_API_KEY, 'HIDDEN') حذف شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. ۱. ایجاد یک ماژول امن برای مدیریت متغیرهای محیطی در فایل backend/server.js یا یک فایل جداگانه مانند backend/config/secureEnv.js. ۲. تعریف یک تابع کمکی به نام `getSecureEnv(key)` که مقدار متغیر محیطی را برمی‌گرداند و یک تابع `logSecure(key)` که فقط '[REDACTED]' را لاگ می‌کند. ۳. جایگزینی تمام console.log و console.error که مستقیماً از GEMINI_API_KEY استفاده می‌کنند با توابع امن. ۴. در خط 207، apiUrl.replace(GEMINI_API_KEY, 'HIDDEN') را با یک تابع امن جایگزین کن که هر occurrence از API key را در URL یا پیام‌ها redact کند. ۵. در خطوط 183, 188, 224, 234 که keyPrefix را با substring(0, 10) + '...' نشان می‌دهند، این عمل را حذف کن و فقط از '[REDACTED]' استفاده کن. ۶. اطمینان حاصل کن که در تمام throw new Errorها، پیام خطا حاوی اطلاعات حساس نباشد و در صورت نیاز، خطاهای کاربرپسند و امن برگردانده شوند. ۷. متغیر GEMINI_API_KEY را پس از استفاده در memory پاک نکن (چون درخواست شامل encryption/validation نیست)، اما اطمینان حاصل کن که در scopeهای غیرضروری در دسترس نباشد.

## 💡 نمونه‌های قبل/بعد
**جایگزینی keyPrefix با '[REDACTED]' در endpoint /api/list-models**

_قبل:_
```
res.json({ models: modelNames, count: modelNames.length, keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...' });
```

_بعد:_
```
res.json({ models: modelNames, count: modelNames.length, keyPrefix: '[REDACTED]' });
```

**جایگزینی لاگینگ ناقص با تابع امن**

_قبل:_
```
console.log('Testing Gemini API with URL:', apiUrl.replace(GEMINI_API_KEY, 'HIDDEN'));
```

_بعد:_
```
console.log('Testing Gemini API with URL:', redactSensitiveData(apiUrl, [GEMINI_API_KEY]));
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `grep -n 'GEMINI_API_KEY' backend/server.js | grep -E 'console\.(log|error|warn)'`
- `grep -n 'keyPrefix' backend/server.js`
- `grep -n 'substring' backend/server.js | grep -E 'GEMINI_API_KEY|apiKey'`
- `grep -n 'throw new Error' backend/server.js | grep -E 'apiKey|GEMINI|API'`

## ⚠️ ریسک‌ها و موارد احتیاط
ریسک اصلی: تغییر لاگینگ ممکن است باعث از دست رفتن اطلاعات دیباگینگ شود. در خطوط 94, 146, 289, 322, 354, 417 که errorData از API برگشتی گرفته می‌شود، اگر errorData حاوی اطلاعات حساس باشد، باید redact شود. همچنین در خط 207 که apiUrl.replace(GEMINI_API_KEY, 'HIDDEN') استفاده شده، اگر replace به درستی کار نکند (مثلاً key در URL نباشد)، کلید فاش می‌شود. تغییر keyPrefix در خطوط 183, 188, 224, 234 ممکن است ابزارهای مانیتورینگ خارجی را که به این فیلد وابسته هستند، مختل کند.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: critical
- تخمین زمان: medium

---

## ✅ معیارهای پذیرش کلی (همهٔ مراحل)
- [ ] {'text': "زمانی که فایل `.env` وجود ندارد یا `GEMINI_API_KEY` در آن تعریف نشده، برنامه با خطای واضح 'FATAL: متغیر محیطی GEMINI_API_KEY معتبر نیست' متوقف شود و process.exit(1) فراخوانی شود.", 'verify_method': 'backend_test', 'verify_plan': {'test_path': 'backend/tests/test_validateEnv.js::test_missing_gemini_key', 'marker': 'verify'}}
- [ ] {'text': "زمانی که `GEMINI_API_KEY` با فرمت نامعتبر (مثلاً 'abc' بدون پیشوند AIza) تنظیم شده، برنامه با خطا متوقف شود.", 'verify_method': 'backend_test', 'verify_plan': {'test_path': 'backend/tests/test_validateEnv.js::test_invalid_gemini_key_format', 'marker': 'verify'}}
- [ ] {'text': "زمانی که `PORT` با مقدار غیرعددی (مثلاً 'abc') تنظیم شده، برنامه با خطا متوقف شود.", 'verify_method': 'backend_test', 'verify_plan': {'test_path': 'backend/tests/test_validateEnv.js::test_invalid_port', 'marker': 'verify'}}
- [ ] {'text': 'زمانی که همه متغیرهای محیطی معتبر هستند، برنامه بدون خطا startup شود و endpoint `/api/health` در خط 167 همچنان کار کند.', 'verify_method': 'api_response', 'verify_plan': {'method': 'GET', 'path': '/api/health', 'expected_status': 200, 'required_fields': ['status']}}
- [ ] {'text': 'فایل `backend/config/validateEnv.js` ایجاد شده و تابع `validateEnv` در `backend/server.js` بعد از `dotenv.config()` در خط 14 فراخوانی شود.', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['validateEnv', 'import.*validateEnv', "from './config/validateEnv'"], 'files_hint': ['backend/server.js', 'backend/config/validateEnv.js']}}
- [ ] {'text': 'فایل backend/utils/encryption.js باید وجود داشته باشد و شامل توابع encrypt و decrypt با AES-256-GCM باشد', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['function encrypt', 'function decrypt', 'aes-256-gcm', 'createCipheriv', 'createDecipheriv'], 'files_hint': ['backend/utils/encryption.js']}}
- [ ] {'text': 'کلید رمزنگاری (ENCRYPTION_KEY) نباید در کد منبع hard-coded شده باشد — باید از process.env.ENCRYPTION_KEY خوانده شود', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['process.env.ENCRYPTION_KEY'], 'files_hint': ['backend/utils/encryption.js', 'backend/server.js']}}
- [ ] {'text': 'مقدار GEMINI_API_KEY در backend/server.js باید از تابع decrypt عبور کند، نه مستقیم از process.env', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['decrypt\\(process.env.GEMINI_API_KEY', 'decrypt\\(encryptedKey'], 'files_hint': ['backend/server.js']}}
- [ ] {'text': 'فایل backend/.env.example باید شامل ENCRYPTION_KEY باشد', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['ENCRYPTION_KEY'], 'files_hint': ['backend/.env.example']}}
- [ ] {'text': 'سرور باید با کلید رمزنگاری\u200cشده در .env راه\u200cاندازی شود و endpoint /api/health پاسخ 200 بدهد', 'verify_method': 'api_response', 'verify_plan': {'method': 'GET', 'path': '/api/health', 'expected_status': 200, 'required_fields': ['status']}}
- [ ] {'text': "هیچ occurrence از GEMINI_API_KEY در console.log یا console.error نباید مقدار واقعی را نشان دهد — فقط '[REDACTED]' یا '***'", 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['console\\.(log|error|warn)\\(.*GEMINI_API_KEY', 'console\\.(log|error|warn)\\(.*apiKey', 'console\\.(log|error|warn)\\(.*process\\.env'], 'files_hint': ['backend/server.js']}}
- [ ] {'text': "هیچ endpoint API نباید keyPrefix یا بخشی از API key را در response برگرداند — همه باید با '[REDACTED]' جایگزین شوند", 'verify_method': 'api_response', 'verify_plan': {'method': 'GET', 'path': '/api/list-models', 'expected_status': 200, 'required_fields': ['models', 'count'], 'forbidden_fields': ['keyPrefix']}}
- [ ] {'text': 'هیچ error message در throw new Error نباید حاوی مقدار واقعی API key باشد — پیام\u200cهای خطا باید عمومی و امن باشند', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['throw new Error\\(`.*\\$\\{.*apiKey.*\\}`', 'throw new Error\\(`.*\\$\\{.*GEMINI.*\\}`'], 'files_hint': ['backend/server.js']}}
- [ ] {'text': 'تابع کمکی redactSensitiveData باید در backend/server.js تعریف شده باشد و تمام occurrenceهای API key را در رشته\u200cها redact کند', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['function redactSensitiveData', 'const redactSensitiveData'], 'files_hint': ['backend/server.js']}}
- [ ] {'text': "تماس با console.log در خط 207 باید از تابع امن استفاده کند و apiUrl.replace(GEMINI_API_KEY, 'HIDDEN') حذف شود", 'verify_method': 'static', 'verify_plan': {'grep_patterns': ["apiUrl\\.replace\\(GEMINI_API_KEY, 'HIDDEN'\\)"], 'files_hint': ['backend/server.js']}}

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  - پیاده‌سازی اعتبارسنجی (Validation) برای تمام متغیرهای محیطی در زمان راه‌اندازی برنامه
  - پیاده‌سازی رمزنگاری (Encryption) برای ذخیره‌سازی امن API keys و متغیرهای حساس

🔧 مراحل remaining که در super-task باید انجام شوند:
  - پیاده‌سازی مدیریت امن (Proper Handling) برای متغیرهای محیطی شامل لاگینگ امن و خطاهای مناسب — برخی endpointها و error messageها هنوز keyPrefix یا API key را فاش می‌کنند

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 2 از 7
  id: cf9e7da4-37c4-463e-99dd-bd6707edcce3
  عنوان اصلی: انتقال Firebase credentials به متغیرهای محیطی
  اولویت اصلی: critical
  وضعیت verify قبلی: pending
  فایل‌های دخیل: frontend/index.html

📋 acceptance_criteria کامل:
  - هیچ credential Firebase در index.html وجود نداشته باشد [verify_method=static] [verify_plan={"grep_patterns": ["apiKey", "authDomain", "projectId", "storageBucket", "messagingSenderId", "appId"], "files_hint": ["frontend/index.html"]}]
  - تمامی credentials از متغیرهای محیطی VITE_ خوانده شوند [verify_method=static] [verify_plan={"grep_patterns": ["import.meta.env.VITE_"], "files_hint": ["frontend/index.html"]}]
  - فایل .env.example با placeholderها ایجاد شود [verify_method=static] [verify_plan={"grep_patterns": ["VITE_API_KEY", "VITE_AUTH_DOMAIN", "VITE_PROJECT_ID", "VITE_STORAGE_BUCKET", "VITE_MESSAGING_SENDER_ID", "VITE_APP_ID"], "files_hint": [".env.example"]}]
  - اپلیکیشن بعد از تغییرات بدون خطا initialize شود [verify_method=ui_interaction] [verify_plan={"base": "frontend", "ui_steps": [{"action": "navigate", "url": "/"}, {"action": "wait_for_load", "state": "networkidle"}, {"action": "assert_visible", "selector": "[data-testid='app-root']"}], "expec]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در
  repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های
  مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط
  موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که
  چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.

🔍 **مسئولیت تو (مدل اجراکننده):**
- پیش از هر تغییر، خودت ساختار repo، فایل‌های ذکرشده، و وابستگی‌های آن‌ها را
  مستقل بررسی کن.
- اگر تشخیص دادی موقعیت ذکرشده در پرامپت اشتباه است یا فایل دیگری مناسب‌تر
  است، بر اساس قضاوت خودت عمل کن — این پرامپت نمی‌تواند بهانهٔ کار اشتباه
  باشد ("خودت گفتی" قابل قبول نیست).
- اگر معیارهای پذیرش (AC) مبهم/ناقص بودند، بهترین تفسیر را انتخاب کن و در
  commit message توضیح بده.

📦 **اگر کار طولانی است:**
- **خلاصه‌اش نکن.** همه را به‌طور کامل انجام بده.
- اگر یک کامیت گنجایش ندارد، در **چندین کامیت متوالی** انجام بده — ولی
  هیچ بخشی را skip نکن.
- ترتیب کامیت‌ها را منطقی نگه‌دار (foundation → core → integration → tests).
- در آخر یک checklist از همه‌ی کامیت‌ها در PR description بنویس.

---


## 🎯 هدف (خلاصه ساختاریافته)
Firebase credentials در frontend/index.html به صورت plain text و hardcoded قرار دارد

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/index.html:11-18` — `__firebase_config` — Firebase credentials در HTML عمومی
  ```
  var __firebase_config = JSON.stringify({
    apiKey: "AIzaSyAMFtV0zIMKKe0bIr68Z1wTORQ1jQpsv9Q",
    authDomain: "labaneseapp.firebaseapp.com",
    projectId: "labaneseapp",
    storageBucket: "labaneseapp.firebasestorage.app",
    messagingSenderId: "951874597795",
    appId: "1:951874597795:web:00745327993adad760a016"
  });
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Firebase Web SDK v10 + Vite

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `frontend/src/main.jsx` (سطر 1) — محل فعلی استفاده از __firebase_config
- `frontend/.env.example` (سطر 1) — برای ایجاد نمونه env
- `frontend/vite.config.js` (سطر 1) — برای اطمینان از پشتیبانی env

## 🌐 نقشهٔ وابستگی‌ها
این config در index.html تعریف شده و در main.jsx (یا App.jsx) برای initializeApp استفاده می‌شود. تغییر آن نیازمند تغییر در نحوه initialize کردن Firebase است.

## 🔍 Context و وضعیت فعلی
در frontend/index.html خطوط 11-18، Firebase configuration شامل apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId به صورت plain text در یک تگ script قرار دارد. این اطلاعات حساس به راحتی توسط هر بازدیدکننده‌ای قابل مشاهده است. اگرچه apiKey Firebase ذاتاً برای استفاده client-side طراحی شده، اما همراه با سایر اطلاعات (projectId, storageBucket) می‌تواند برای سوءاستفاده‌های محدود استفاده شود. همچنین این اطلاعات در GitHub عمومی (مشخصات ریپو: mahdighandi1989/language) قرار دارد.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] هیچ credential Firebase در index.html وجود نداشته باشد
- [ ] تمامی credentials از متغیرهای محیطی VITE_ خوانده شوند
- [ ] فایل .env.example با placeholderها ایجاد شود
- [ ] اپلیکیشن بعد از تغییرات بدون خطا initialize شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. Firebase config را به متغیرهای محیطی Vite (VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, ...) منتقل کنید و از import.meta.env در main.jsx یا یک فایل config مجزا استفاده کنید. همچنین یک فایل .env.example با placeholderها ایجاد کنید.

## 💡 نمونه‌های قبل/بعد
**Firebase config**

_قبل:_
```
<!-- index.html -->
var __firebase_config = JSON.stringify({...credentials...});
```

_بعد:_
```
// .env
VITE_FIREBASE_API_KEY=your_key_here
// main.jsx
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  ...
}
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `grep -r 'AIzaSyAMFtV0zIMKKe0bIr68Z1wTORQ1jQpsv9Q' frontend/`
- `grep -r 'VITE_FIREBASE' frontend/src/`

## ⚠️ ریسک‌ها و موارد احتیاط
کم - فقط تغییر نحوه خواندن config

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: critical
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 3 از 7
  id: f1a8e5dd-c1fa-4558-8603-d9200b6a5ce4
  عنوان اصلی: Secure Firebase config and verify backend tokens
  اولویت اصلی: critical
  وضعیت verify قبلی: partial
  فایل‌های دخیل: backend/server.js, frontend/index.html

📋 acceptance_criteria کامل:
  - Backend verifies Firebase ID tokens on /api/gemini/* endpoints [verify_method=backend_test] [verify_plan={"test_node": "tests/test_firebase_auth.py::test_verify_id_token_on_gemini_endpoints", "timeout_seconds": 60}]
  - Firebase config is loaded from environment variables, not hardcoded [verify_method=static] [verify_plan={"grep_patterns": ["process\\.env\\.FIREBASE_API_KEY", "process\\.env\\.FIREBASE_AUTH_DOMAIN", "process\\.env\\.FIREBASE_PROJECT_ID", "process\\.env\\.FIREBASE_STORAGE_BUCKET", "process\\.env\\.FIREBA]
  - Unauthenticated requests to backend return 401 [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/gemini/status", "headers": null, "json_body": null, "expected_status": 401, "required_fields": ["error"], "json_contains": null}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در
  repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های
  مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط
  موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که
  چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.

🔍 **مسئولیت تو (مدل اجراکننده):**
- پیش از هر تغییر، خودت ساختار repo، فایل‌های ذکرشده، و وابستگی‌های آن‌ها را
  مستقل بررسی کن.
- اگر تشخیص دادی موقعیت ذکرشده در پرامپت اشتباه است یا فایل دیگری مناسب‌تر
  است، بر اساس قضاوت خودت عمل کن — این پرامپت نمی‌تواند بهانهٔ کار اشتباه
  باشد ("خودت گفتی" قابل قبول نیست).
- اگر معیارهای پذیرش (AC) مبهم/ناقص بودند، بهترین تفسیر را انتخاب کن و در
  commit message توضیح بده.

📦 **اگر کار طولانی است:**
- **خلاصه‌اش نکن.** همه را به‌طور کامل انجام بده.
- اگر یک کامیت گنجایش ندارد، در **چندین کامیت متوالی** انجام بده — ولی
  هیچ بخشی را skip نکن.
- ترتیب کامیت‌ها را منطقی نگه‌دار (foundation → core → integration → tests).
- در آخر یک checklist از همه‌ی کامیت‌ها در PR description بنویس.

---


## 🎯 هدف (خلاصه ساختاریافته)
Frontend uses Firebase API keys exposed in index.html, backend lacks Firebase integration

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/index.html:11-18` — `__firebase_config` — Firebase credentials exposed in HTML; should be loaded from env
  ```
  var __firebase_config = JSON.stringify({
    apiKey: "AIzaSyAMFtV0zIMKKe0bIr68Z1wTORQ1jQpsv9Q",
    authDomain: "labaneseapp.firebaseapp.com",
    ...
  });
  ```
- `backend/server.js:1-14` — `imports` — No Firebase Admin SDK import; backend has no Firebase integration
  ```jsx
  import express from 'express';
  import cors from 'cors';
  ...
  import ffmpeg from 'fluent-ffmpeg';
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Firebase Web SDK on frontend, Express backend without Firebase Admin

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `backend/.env.example` (سطر 1) — Missing Firebase environment variables
- `frontend/src/App.jsx` (سطر 137) — Uses Firebase auth and Firestore

## 🌐 نقشهٔ وابستگی‌ها
Frontend uses Firebase for auth and Firestore; backend has no Firebase validation, making APIs vulnerable to unauthorized access.

## 🔍 Context و وضعیت فعلی
Firebase configuration (apiKey, authDomain, etc.) is hardcoded in frontend/index.html (lines 11-18) and exposed to all users. While Firebase API keys are technically public, the presence of a full Firebase config suggests authentication and database features are used. However, the backend (server.js) has no Firebase integration—no Firebase Admin SDK, no token verification, no Firestore access. This means any Firebase authentication performed on the frontend is not validated on the backend, creating a security gap where unauthenticated requests could be made to backend APIs. Additionally, the backend's .env.example does not include Firebase-related variables.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] Backend verifies Firebase ID tokens on /api/gemini/* endpoints
- [ ] Firebase config is loaded from environment variables, not hardcoded
- [ ] Unauthenticated requests to backend return 401
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. Add Firebase Admin SDK to backend for verifying Firebase ID tokens on protected endpoints. Move Firebase config to environment variables and remove hardcoded values from index.html. Update backend/.env.example with Firebase service account credentials.

## 💡 نمونه‌های قبل/بعد
**Add Firebase Admin to backend**

_قبل:_
```
// No Firebase imports in backend
```

_بعد:_
```
import admin from 'firebase-admin';
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `curl -X POST /api/gemini/chat -H 'Authorization: Bearer invalid-token' should return 401`
- `Check that index.html does not contain Firebase keys`

## ⚠️ ریسک‌ها و موارد احتیاط
Adding auth may break existing frontend calls that don't send tokens; requires frontend changes to attach auth headers

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: critical
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 4 از 7
  id: fdba8076-dc5d-470c-b7af-049761996be5
  عنوان اصلی: حذف hardcode کلیدهای Firebase از frontend
  اولویت اصلی: critical
  وضعیت verify قبلی: partial
  فایل‌های دخیل: frontend/index.html

📋 acceptance_criteria کامل:
  - هیچ credential فایربیس در فایل‌های HTML یا JS به صورت plain text وجود نداشته باشد [verify_method=static] [verify_plan={"grep_patterns": ["HTML", "credential", "plain", "فایربیس", "فایل", "صورت", "وجود", "نداشته"], "files_hint": []}]
  - Firebase config از متغیرهای محیطی (VITE_*) خوانده شود [verify_method=static] [verify_plan={"grep_patterns": ["Firebase", "config", "متغیرهای", "محیطی", "خوانده"], "files_hint": []}]
  - کلید API در Firebase Console محدود به دامنه مجاز شده باشد [verify_method=static] [verify_plan={"grep_patterns": ["Firebase", "Console", "کلید", "محدود", "دامنه", "مجاز", "باشد"], "files_hint": []}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در
  repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های
  مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط
  موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که
  چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.

🔍 **مسئولیت تو (مدل اجراکننده):**
- پیش از هر تغییر، خودت ساختار repo، فایل‌های ذکرشده، و وابستگی‌های آن‌ها را
  مستقل بررسی کن.
- اگر تشخیص دادی موقعیت ذکرشده در پرامپت اشتباه است یا فایل دیگری مناسب‌تر
  است، بر اساس قضاوت خودت عمل کن — این پرامپت نمی‌تواند بهانهٔ کار اشتباه
  باشد ("خودت گفتی" قابل قبول نیست).
- اگر معیارهای پذیرش (AC) مبهم/ناقص بودند، بهترین تفسیر را انتخاب کن و در
  commit message توضیح بده.

📦 **اگر کار طولانی است:**
- **خلاصه‌اش نکن.** همه را به‌طور کامل انجام بده.
- اگر یک کامیت گنجایش ندارد، در **چندین کامیت متوالی** انجام بده — ولی
  هیچ بخشی را skip نکن.
- ترتیب کامیت‌ها را منطقی نگه‌دار (foundation → core → integration → tests).
- در آخر یک checklist از همه‌ی کامیت‌ها در PR description بنویس.

---


## 🎯 هدف (خلاصه ساختاریافته)
Firebase API key و سایر credentials در frontend index.html به صورت hardcoded قرار دارند

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/index.html:11-18` — `__firebase_config` — کلید API و سایر credentials به صورت hardcoded در HTML
  ```
  var __firebase_config = JSON.stringify({
    apiKey: "AIzaSyAMFtV0zIMKKe0bIr68Z1wTORQ1jQpsv9Q",
    authDomain: "labaneseapp.firebaseapp.com",
    projectId: "labaneseapp",
    storageBucket: "labaneseapp.firebasestorage.app",
    messagingSenderId: "951874597795",
    appId: "1:951874597795:web:00745327993adad760a016"
  });
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Vite + React + Firebase

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `frontend/src/App.jsx` (سطر 137) — این فایل از Firebase استفاده می‌کند و ممکن است config را import کند
- `frontend/.env` — فایل env که باید این مقادیر در آن ذخیره شوند (فعلاً وجود ندارد)

## 🌐 نقشهٔ وابستگی‌ها
این یافته مربوط به کل پروژه frontend است و تمام کاربرانی که به صفحه دسترسی دارند می‌توانند این اطلاعات را ببینند.

## 🔍 Context و وضعیت فعلی
در فایل frontend/index.html، خطوط 11-18، کلید API فایربیس (AIzaSyAMFtV0zIMKKe0bIr68Z1wTORQ1jQpsv9Q) و سایر اطلاعات احراز هویت (authDomain، projectId، storageBucket، messagingSenderId، appId) به صورت plain text در کد HTML جاسازی شده‌اند. این اطلاعات در client bundle قرار می‌گیرند و هر کاربری می‌تواند با مشاهده سورس صفحه به آنها دسترسی پیدا کند. این یک نقض امنیتی جدی است زیرا مهاجم می‌تواند از این کلیدها برای دسترسی غیرمجاز به Firebase project استفاده کند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] هیچ credential فایربیس در فایل‌های HTML یا JS به صورت plain text وجود نداشته باشد
- [ ] Firebase config از متغیرهای محیطی (VITE_*) خوانده شود
- [ ] کلید API در Firebase Console محدود به دامنه مجاز شده باشد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. Firebase config را از کد frontend حذف کرده و از متغیرهای محیطی (environment variables) استفاده کنید. در Vite، می‌توانید از VITE_FIREBASE_API_KEY و غیره استفاده کنید و در زمان build این مقادیر جایگزین شوند. همچنین، محدودیت‌های دسترسی (API key restrictions) را در Firebase Console فعال کنید تا کلید فقط از دامنه‌های مجاز قابل استفاده باشد.

## 💡 نمونه‌های قبل/بعد
**حذف hardcoded config از HTML**

_قبل:_
```
var __firebase_config = JSON.stringify({ apiKey: "...", ... });
```

_بعد:_
```
// Firebase config از متغیرهای محیطی خوانده می‌شود
import.meta.env.VITE_FIREBASE_API_KEY
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `grep -r "AIzaSyAMFtV0zIMKKe0bIr68Z1wTORQ1jQpsv9Q" frontend/`
- `npm run build && grep -r "AIzaSyAMFtV0zIMKKe0bIr68Z1wTORQ1jQpsv9Q" frontend/dist/`

## ⚠️ ریسک‌ها و موارد احتیاط
اگر کلید API محدود نشود، مهاجم می‌تواند از سرویس‌های Firebase (مانند Firestore, Auth) سوءاستفاده کند و هزینه‌های غیرمجاز ایجاد کند.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: critical
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 5 از 7
  id: c7474d4f-8730-4531-b8ec-50de5a444b82
  عنوان اصلی: پیاده‌سازی هدرهای امنیتی و CORS
  اولویت اصلی: high
  وضعیت verify قبلی: pending
  فایل‌های دخیل: backend/.env.example, backend/server.js, frontend/vite.config.js

📋 acceptance_criteria کامل:
  - کتابخانه helmet در `backend/package.json` به عنوان وابستگی اضافه شده باشد. [verify_method=static] [verify_plan={"grep_patterns": ["\"helmet\":"], "files_hint": ["backend/package.json"]}]
  - import helmet در فایل `backend/server.js` در بخش importها (خطوط 1-12) اضافه شده باشد. [verify_method=static] [verify_plan={"grep_patterns": ["import helmet from 'helmet';"], "files_hint": ["backend/server.js"]}]
  - middleware `app.use(helmet())` به عنوان اولین middleware بعد از ایجاد `app` و قبل از `app.use(cors())` در فایل `backend/server.js` قرار گرفته باشد. [verify_method=static] [verify_plan={"grep_patterns": ["app.use\\(helmet\\(\\)\\)"], "files_hint": ["backend/server.js"]}]
  - هدر `X-Content-Type-Options: nosniff` در پاسخ‌های HTTP سرور (مثلاً GET /api/health) حضور داشته باشد. [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/health", "headers": null, "json_body": null, "expected_status": 200, "required_fields": [], "json_contains": null, "headers_to_check": ["x-content-type-options"]}]
  - هدر `X-Frame-Options: SAMEORIGIN` در پاسخ‌های HTTP سرور حضور داشته باشد. [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/health", "headers": null, "json_body": null, "expected_status": 200, "required_fields": [], "json_contains": null, "headers_to_check": ["x-frame-options"]}]
  - هدر `Strict-Transport-Security` در پاسخ‌های HTTP سرور حضور داشته باشد (در صورت استفاده از HTTPS). [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/health", "headers": null, "json_body": null, "expected_status": 200, "required_fields": [], "json_contains": null, "headers_to_check": ["strict-transport-security"]}]
  - CORS middleware باید originهای خاص (نه wildcard) را پشتیبانی کند: http://localhost:5173 برای توسعه و دامنه تولیدی از متغیر FRONTEND_URL [verify_method=static] [verify_plan={"grep_patterns": ["origin:", "FRONTEND_URL", "localhost:5173"], "files_hint": ["backend/server.js"]}]
  - متدهای مجاز باید شامل GET, POST, PUT, DELETE, OPTIONS باشند [verify_method=static] [verify_plan={"grep_patterns": ["methods:", "GET", "POST", "PUT", "DELETE", "OPTIONS"], "files_hint": ["backend/server.js"]}]
  - هدرهای مجاز باید شامل Content-Type و Authorization باشند [verify_method=static] [verify_plan={"grep_patterns": ["allowedHeaders:", "Content-Type", "Authorization"], "files_hint": ["backend/server.js"]}]
  - credentials باید true باشد (برای ارسال کوکی‌ها/توکن‌ها) [verify_method=static] [verify_plan={"grep_patterns": ["credentials: true"], "files_hint": ["backend/server.js"]}]
  - درخواست OPTIONS (preflight) باید پاسخ 204 با هدرهای مناسب بدهد [verify_method=api_response] [verify_plan={"method": "OPTIONS", "path": "/api/health", "headers": null, "json_body": null, "expected_status": 204, "required_fields": [], "json_contains": null}]
  - درخواست از origin غیرمجاز (مثلاً http://evil.com) باید با خطای CORS مسدود شود [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/health", "headers": null, "json_body": null, "expected_status": 403, "required_fields": [], "json_contains": null}]
  - rate limiter عمومی (100 req/15min) روی همه routeهای /api/* اعمال شود و headerهای X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset در response موجود باشند [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/health", "headers": null, "json_body": null, "expected_status": 200, "required_fields": [], "json_contains": null, "check_headers": ["x-ratelimit-limit", "x-ratelimit-r]
  - بعد از 100 درخواست به /api/health در 15 دقیقه، پاسخ 429 (Too Many Requests) برگردد [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/health", "headers": null, "json_body": null, "expected_status": 429, "required_fields": ["error"], "json_contains": null}]
  - WebSocket server در path /ws/live تحت تأثیر rate limiting قرار نگیرد و اتصال WebSocket برقرار شود [verify_method=manual_only] [verify_plan={"reason": "نیاز به تست دستی WebSocket connection — می‌توان با ابزار wscat یا کد کلاینت تست کرد"}]
  - فایل backend/middleware/rateLimiter.js ایجاد شود و configهای rate limiting را export کند [verify_method=static] [verify_plan={"grep_patterns": ["export const generalLimiter", "export const authLimiter", "export const analysisLimiter", "rateLimit"], "files_hint": ["backend/middleware/rateLimiter.js"]}]
  - endpoint /api/analyze-files محدودیت 10 req/15min داشته باشد و بعد از 10 درخواست خطای 429 برگرداند [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/analyze-files", "headers": null, "json_body": null, "expected_status": 429, "required_fields": ["error"], "json_contains": null}]
  - فایل backend/validators/schemas.js باید شامل schemaهای chatSchema، ttsSchema، analyzeFilesSchema باشد [verify_method=static] [verify_plan={"grep_patterns": ["chatSchema", "ttsSchema", "analyzeFilesSchema", "export const"], "files_hint": ["backend/validators/schemas.js"]}]
  - فایل backend/middleware/validate.js باید تابع validate(schema) را export کند که در صورت خطا، پاسخ 400 با پیام خطا برگرداند [verify_method=static] [verify_plan={"grep_patterns": ["export function validate", "export const validate", "res.status(400)", "ZodError"], "files_hint": ["backend/middleware/validate.js"]}]
  - POST /api/gemini/tts با body خالی یا نامعتبر باید status 400 برگرداند [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/gemini/tts", "headers": null, "json_body": null, "expected_status": 400, "required_fields": ["error"], "json_contains": null}]
  - POST /api/gemini/chat با body فاقد contents باید status 400 برگرداند [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/gemini/chat", "headers": null, "json_body": null, "expected_status": 400, "required_fields": ["error"], "json_contains": null}]
  - POST /api/analyze-files با بیش از 10 فایل باید status 400 برگرداند (multer خودش این کار را می‌کند، اما validation اضافی نباید تداخل ایجاد کند) [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/analyze-files", "headers": null, "json_body": null, "expected_status": 400, "required_fields": ["error"], "json_contains": null}]
  - POST /api/gemini/tts با voice نامعتبر (مثلاً 'InvalidVoice') باید status 400 برگرداند [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/gemini/tts", "headers": null, "json_body": null, "expected_status": 400, "required_fields": ["error"], "json_contains": null}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در
  repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های
  مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط
  موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که
  چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.

🔍 **مسئولیت تو (مدل اجراکننده):**
- پیش از هر تغییر، خودت ساختار repo، فایل‌های ذکرشده، و وابستگی‌های آن‌ها را
  مستقل بررسی کن.
- اگر تشخیص دادی موقعیت ذکرشده در پرامپت اشتباه است یا فایل دیگری مناسب‌تر
  است، بر اساس قضاوت خودت عمل کن — این پرامپت نمی‌تواند بهانهٔ کار اشتباه
  باشد ("خودت گفتی" قابل قبول نیست).
- اگر معیارهای پذیرش (AC) مبهم/ناقص بودند، بهترین تفسیر را انتخاب کن و در
  commit message توضیح بده.

📦 **اگر کار طولانی است:**
- **خلاصه‌اش نکن.** همه را به‌طور کامل انجام بده.
- اگر یک کامیت گنجایش ندارد، در **چندین کامیت متوالی** انجام بده — ولی
  هیچ بخشی را skip نکن.
- ترتیب کامیت‌ها را منطقی نگه‌دار (foundation → core → integration → tests).
- در آخر یک checklist از همه‌ی کامیت‌ها در PR description بنویس.

---


---

## 📥 درخواست خام کاربر (verbatim — همان متنی که کاربر نوشت)
_(همهٔ URL ها، آدرس‌ها، نام‌ها، و کلمات کلیدی در این متن دست‌نخورده هستند.)_

```
فقدان security middleware مانند helmet، CORS configuration، rate limiting و input validation باعث آسیب‌پذیری‌های امنیتی جدی می‌شود. برای یک اپلیکیشن که با AI API ارتباط برقرار می‌کند، این موارد حیاتی هستند.
```

## 📋 چک‌لیست مراحل (4 مرحله)

این تسک به مراحل کوچک‌تر تقسیم شده. **در هر verify خودکار، وضعیت هر مرحله به‌صورت `[ ]` (انجام نشده)، `[~]` (ناقص)، یا `[x]` (انجام شده) به‌روز می‌شود.**
وقتی تمام مراحل `[x]` شدند، تسک به‌طور خودکار به «انجام شده» منتقل می‌شود.

- [ ] **مرحله 1: اضافه کردن middleware امنیتی helmet برای تنظیم هدرهای HTTP امنیتی** — این مرحله شامل نصب و پیکربندی کتابخانه helmet (یا معادل آن در فریم‌ورک مورد استفاده) به عنوان middleware در اپلیکیشن است. هدف تنظیم خودکار هدرهای امنیتی مانند X-Content-Type-Options، X-Frame-Options، Strict-Transport-Security و غیره است. خارج از این مرحله: پیکربندی CORS، rate limiting، یا input vali
- [ ] **مرحله 2: پیکربندی CORS middleware برای کنترل دسترسی cross-origin** — این مرحله شامل نصب و پیکربندی middleware CORS (مانند cors در Express یا معادل آن در فریم‌ورک) است. باید دامنه‌های مجاز (allow origins)، متدهای مجاز (GET, POST, PUT, DELETE, OPTIONS)، و هدرهای مجاز مشخص شوند. خارج از این مرحله: helmet، rate limiting، یا input validation. نکته حیاتی: برای اپلیکیشنی که
- [ ] **مرحله 3: پیاده‌سازی rate limiting middleware برای جلوگیری از حملات brute force و DoS** — این مرحله شامل نصب و پیکربندی middleware rate limiting (مانند express-rate-limit یا معادل آن) است. باید محدودیت تعداد درخواست‌ها در بازه زمانی مشخص (مثلاً 100 درخواست در 15 دقیقه) برای هر IP تعریف شود. همچنین باید مسیرهای حساس مانند /api/auth/login محدودیت سخت‌تری داشته باشند. خارج از این مرحله: hel
- [x] **مرحله 4: پیاده‌سازی input validation middleware برای تمام ورودی‌های کاربر** — این مرحله شامل نصب و پیکربندی کتابخانه validation (مانند Joi، express-validator، یا Zod) و ایجاد middleware برای اعتبارسنجی تمام ورودی‌های دریافتی از کاربر (body، query parameters، URL parameters) است. باید قوانین validation برای هر endpoint تعریف شود (مثلاً نوع داده، طول، الگو). خارج از این مرحله: 

---

# 🔹 مرحله 1: اضافه کردن middleware امنیتی helmet برای تنظیم هدرهای HTTP امنیتی

**Scope:** این مرحله شامل نصب و پیکربندی کتابخانه helmet (یا معادل آن در فریم‌ورک مورد استفاده) به عنوان middleware در اپلیکیشن است. هدف تنظیم خودکار هدرهای امنیتی مانند X-Content-Type-Options، X-Frame-Options، Strict-Transport-Security و غیره است. خارج از این مرحله: پیکربندی CORS، rate limiting، یا input validation. نکته حیاتی: helmet باید به عنوان اولین middleware در زنجیره middlewareها قرار گیرد تا هدرها برای تمام پاسخ‌ها تنظیم شوند.
**Key terms:** helmet, security middleware, HTTP headers, X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security

**بخش مربوط از متن کاربر:**
```
فقدان security middleware مانند helmet، CORS configuration، rate limiting و input validation باعث آسیب‌پذیری‌های امنیتی جدی می‌شود. برای یک اپلیکیشن که با AI API ارتباط برقرار می‌کند، این موارد حیاتی هستند.
```

## 🎯 هدف (خلاصه ساختاریافته)
افزودن middleware امنیتی helmet به اپلیکیشن Express

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/server.js:38-48` — `app initialization and middleware setup` — این بخش از کد نشان‌دهنده محل فعلی middlewareهاست. helmet باید به عنوان اولین middleware بعد از ایجاد `app` و قبل از `app.use(cors())` اضافه شود.
  ```jsx
  const app = express();
  const PORT = process.env.PORT || 3001;
  
  // Create HTTP server
  const server = createServer(app);
  
  // Create WebSocket server
  const wss = new WebSocketServer({ server, path: '/ws/live' });
  
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  ```
- `backend/server.js:1-12` — `import statements` — import جدید برای helmet باید به این بخش اضافه شود.
  ```jsx
  import express from 'express';
  import cors from 'cors';
  import { fileURLToPath } from 'url';
  import { dirname, join } from 'path';
  import dotenv from 'dotenv';
  import { createServer } from 'http';
  import { WebSocketServer, WebSocket } from 'ws';
  import multer from 'multer';
  import fs from 'fs';
  import os from 'os';
  import ffmpeg from 'fluent-ffmpeg';
  import ffmpegStatic from 'ffmpeg-static';
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Stack تشخیص داده شده: JavaScript (Node.js) با فریم‌ورک Express. کتابخانه‌های مرتبط: cors, express, helmet (جدید).

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `backend/package.json` (سطر 10) — برای نصب وابستگی helmet باید در این فایل ثبت شود.
- `backend/package-lock.json` (سطر 1) — پس از نصب helmet، این فایل به‌روزرسانی می‌شود.
- `frontend/vite.config.js` (سطر 8) — تنظیمات proxy در Vite ممکن است تحت تأثیر هدرهای امنیتی جدید قرار گیرد (مثلاً X-Frame-Options).

## 🌐 نقشهٔ وابستگی‌ها
این تغییر فقط فایل `backend/server.js` را به‌طور مستقیم تغییر می‌دهد. وابستگی جدید `helmet` به `backend/package.json` و `backend/package-lock.json` اضافه می‌شود. هیچ فایل دیگری در frontend یا backend به‌طور مستقیم تحت تأثیر قرار نمی‌گیرد، اما هدرهای امنیتی تنظیم‌شده توسط helmet بر تمام پاسخ‌های HTTP سرور تأثیر می‌گذارند، از جمله پاسخ‌های API و فایل‌های استاتیک. فایل `frontend/vite.config.js` ممکن است در محیط توسعه نیاز به تنظیمات اضافی برای هماهنگی با هدرهای امنیتی داشته باشد.

## 🔍 Context و وضعیت فعلی
کاربر درخواست اضافه کردن middleware امنیتی helmet برای تنظیم هدرهای HTTP امنیتی مانند X-Content-Type-Options، X-Frame-Options، Strict-Transport-Security و غیره را دارد. این درخواست از نوع bug با اولویت high است. بر اساس تحلیل کد واقعی در فایل `backend/server.js` (خطوط 38-48)، اپلیکیشن Express در حال حاضر فقط از middleware `cors()` و `express.json()` استفاده می‌کند و هیچ middleware امنیتی مانند helmet وجود ندارد. کاربر تأکید کرده که helmet باید به عنوان اولین middleware در زنجیره middlewareها قرار گیرد تا هدرها برای تمام پاسخ‌ها تنظیم شوند. همچنین اشاره شده که خارج از این مرحله: پیکربندی CORS، rate limiting، یا input validation است. کلیدواژه‌های اصلی: helmet, security middleware, HTTP headers, X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security. در فایل `backend/server.js` خط 47: `app.use(cors());` و خط 48: `app.use(express.json({ limit: '10mb' }));` نشان‌دهنده ترتیب فعلی middlewareهاست که helmet باید قبل از آن‌ها قرار گیرد.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] کتابخانه helmet در `backend/package.json` به عنوان وابستگی اضافه شده باشد.
- [ ] import helmet در فایل `backend/server.js` در بخش importها (خطوط 1-12) اضافه شده باشد.
- [ ] middleware `app.use(helmet())` به عنوان اولین middleware بعد از ایجاد `app` و قبل از `app.use(cors())` در فایل `backend/server.js` قرار گرفته باشد.
- [ ] هدر `X-Content-Type-Options: nosniff` در پاسخ‌های HTTP سرور (مثلاً GET /api/health) حضور داشته باشد.
- [ ] هدر `X-Frame-Options: SAMEORIGIN` در پاسخ‌های HTTP سرور حضور داشته باشد.
- [ ] هدر `Strict-Transport-Security` در پاسخ‌های HTTP سرور حضور داشته باشد (در صورت استفاده از HTTPS).
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. 1. نصب کتابخانه helmet با دستور `npm install helmet` در پوشه `backend/`.
2. در فایل `backend/server.js`، بعد از خط 46 (ایجاد WebSocket server) و قبل از خط 47 (`app.use(cors())`)، import کتابخانه helmet را اضافه کن: `import helmet from 'helmet';`.
3. بلافاصله بعد از import، خط `app.use(helmet());` را به عنوان اولین middleware اضافه کن تا هدرهای امنیتی مانند X-Content-Type-Options، X-Frame-Options، Strict-Transport-Security برای تمام پاسخ‌ها تنظیم شوند.
4. اطمینان حاصل کن که helmet قبل از `cors()` و `express.json()` قرار گرفته است.
5. تست کن که هدرهای امنیتی در پاسخ‌های HTTP حضور دارند.

## 💡 نمونه‌های قبل/بعد
**اضافه کردن import و middleware helmet**

_قبل:_
```
import express from 'express';
import cors from 'cors';
...
app.use(cors());
app.use(express.json({ limit: '10mb' }));
```

_بعد:_
```
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
...
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `cd backend && npm install helmet`
- `cd backend && npm test`
- `curl -I http://localhost:3001/api/health | grep -i 'x-content-type-options'`
- `curl -I http://localhost:3001/api/health | grep -i 'x-frame-options'`

## ⚠️ ریسک‌ها و موارد احتیاط
تنظیم هدر `X-Frame-Options: SAMEORIGIN` توسط helmet ممکن است باعث شود که اپلیکیشن در iframeهای خارجی (مثلاً در Inspector Bridge Script که در `frontend/index.html` خطوط 31-201 تعبیه شده) به درستی کار نکند. این اسکریپت از `window.parent.postMessage` برای ارتباط با parent استفاده می‌کند و ممکن است تحت تأثیر این هدر قرار گیرد. همچنین، هدر `Content-Security-Policy` پیش‌فرض helmet ممکن است اسکریپت‌های inline (مانند Firebase config در `frontend/index.html` خطوط 9-20) را مسدود کند. باید پیکربندی helmet به‌گونه‌ای انجام شود که با نیازهای خاص پروژه (مانند اسکریپت‌های inline و iframe) سازگار باشد.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: high
- تخمین زمان: small

---

# 🔹 مرحله 2: پیکربندی CORS middleware برای کنترل دسترسی cross-origin

**Scope:** این مرحله شامل نصب و پیکربندی middleware CORS (مانند cors در Express یا معادل آن در فریم‌ورک) است. باید دامنه‌های مجاز (allow origins)، متدهای مجاز (GET, POST, PUT, DELETE, OPTIONS)، و هدرهای مجاز مشخص شوند. خارج از این مرحله: helmet، rate limiting، یا input validation. نکته حیاتی: برای اپلیکیشنی که با AI API ارتباط دارد، باید originهای خاص (نه wildcard) تعریف شوند و credentials در صورت نیاز فعال شوند.
**Key terms:** CORS configuration, cross-origin, allow origins, cors middleware, credentials

**بخش مربوط از متن کاربر:**
```
فقدان security middleware مانند helmet، CORS configuration، rate limiting و input validation باعث آسیب‌پذیری‌های امنیتی جدی می‌شود. برای یک اپلیکیشن که با AI API ارتباط برقرار می‌کند، این موارد حیاتی هستند.
```

## 🎯 هدف (خلاصه ساختاریافته)
پیکربندی CORS middleware با originهای خاص در Express

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/server.js:47` — `app.use(cors())` — خط فعلی CORS با پیکربندی پیش‌فرض (wildcard) که باید به originهای خاص محدود شود. این خط در فایل اصلی backend قرار دارد و تمام درخواست‌های API را تحت تأثیر قرار می‌دهد.
  ```jsx
  app.use(cors());
  ```
- `backend/server.js:48` — `app.use(express.json({ limit: '10mb' }))` — این خط مربوط به JSON body parser است. اگرچه مستقیماً به CORS مربوط نیست، اما input validation در اینجا انجام نمی‌شود که کاربر به آن اشاره کرده است. برای CORS نیازی به تغییر نیست.
- `backend/.env.example:1-8` — `GEMINI_API_KEY, PORT, VITE_FIREBASE_CONFIG` — فایل نمونه متغیرهای محیطی. باید FRONTEND_URL به آن اضافه شود تا دامنه تولیدی برای CORS قابل تنظیم باشد.
- `frontend/vite.config.js:8-14` — `proxy configuration` — پیکربندی proxy در Vite که درخواست‌های /api را به backend هدایت می‌کند. این تنظیم در توسعه کار می‌کند اما در production باید CORS به درستی پیکربندی شود.
  ```jsx
  server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        }
      }
    }
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Express.js (backend)، React/Vite (frontend)، پکیج cors (^2.8.5)، WebSocket (ws) برای ارتباط live، Gemini AI API

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `backend/package.json` (سطر 11) — شامل وابستگی cors است (خط 11: "cors": "^2.8.5") که باید نصب شده باشد.
- `frontend/src/App.jsx` (سطر 1) — کامپوننت اصلی frontend که درخواست‌های API به backend را از طریق fetch/axios انجام می‌دهد. تغییر CORS روی این درخواست‌ها تأثیر می‌گذارد.
- `frontend/index.html` (سطر 65) — فایل HTML اصلی که شامل Inspector Bridge Script است. این اسکریپت از postMessage برای ارتباط cross-origin استفاده می‌کند (خط 65: window.parent.postMessage).
- `render.yaml` (سطر 1) — فایل کانفیگ deployment در Render. ممکن است نیاز به تنظیم env vars برای FRONTEND_URL در اینجا باشد.

## 🌐 نقشهٔ وابستگی‌ها
این تغییر مستقیماً روی فایل backend/server.js (خط 47) اعمال می‌شود. وابستگی cors در backend/package.json (خط 11) باید نصب باشد. frontend/vite.config.js (خطوط 8-14) proxy را برای توسعه تنظیم می‌کند که با CORS تداخل ندارد. frontend/src/App.jsx درخواست‌های API را ارسال می‌کند که تحت تأثیر CORS قرار می‌گیرند. frontend/index.html شامل Inspector Bridge Script است که از postMessage استفاده می‌کند (خط 65) و ممکن است نیاز به تنظیم origin در CORS داشته باشد. render.yaml برای deployment استفاده می‌شود و باید متغیر FRONTEND_URL در آن تنظیم شود.

## 🔍 Context و وضعیت فعلی
کاربر درخواست پیکربندی CORS middleware برای کنترل دسترسی cross-origin در اپلیکیشن آموزش لهجه لبنانی را داده است. این درخواست از نوع bug با اولویت high ثبت شده است. متن کامل درخواست: "پیکربندی CORS middleware برای کنترل دسترسی cross-origin. این مرحله شامل نصب و پیکربندی middleware CORS (مانند cors در Express یا معادل آن در فریم‌ورک) است. باید دامنه‌های مجاز (allow origins)، متدهای مجاز (GET, POST, PUT, DELETE, OPTIONS)، و هدرهای مجاز مشخص شوند. خارج از این مرحله: helmet، rate limiting، یا input validation. نکته حیاتی: برای اپلیکیشنی که با AI API ارتباط دارد، باید originهای خاص (نه wildcard) تعریف شوند و credentials در صورت نیاز فعال شوند." همچنین کاربر به فقدان security middleware مانند helmet، CORS configuration، rate limiting و input validation اشاره کرده که باعث آسیب‌پذیری‌های امنیتی جدی می‌شود. کلیدواژه‌ها: CORS configuration, cross-origin, allow origins, cors middleware, credentials.

شواهد در کد واقعی پروژه: در فایل backend/server.js خط 47، CORS با پیکربندی پیش‌فرض و بدون هیچ محدودیتی تنظیم شده است: `app.use(cors());`. این یعنی همه originها (wildcard) اجازه دسترسی دارند که برای اپلیکیشنی که با AI API (Gemini) ارتباط دارد، ناامن است. همچنین در خط 48، `app.use(express.json({ limit: '10mb' }));` برای parsing JSON استفاده شده اما هیچ validation روی input انجام نمی‌شود. اپلیکیشن از Express.js در backend و React/Vite در frontend استفاده می‌کند و backend در پورت 3001 و frontend در پورت 5173 (توسعه) اجرا می‌شود.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] CORS middleware باید originهای خاص (نه wildcard) را پشتیبانی کند: http://localhost:5173 برای توسعه و دامنه تولیدی از متغیر FRONTEND_URL
- [ ] متدهای مجاز باید شامل GET, POST, PUT, DELETE, OPTIONS باشند
- [ ] هدرهای مجاز باید شامل Content-Type و Authorization باشند
- [ ] credentials باید true باشد (برای ارسال کوکی‌ها/توکن‌ها)
- [ ] درخواست OPTIONS (preflight) باید پاسخ 204 با هدرهای مناسب بدهد
- [ ] درخواست از origin غیرمجاز (مثلاً http://evil.com) باید با خطای CORS مسدود شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. 1. نصب پکیج cors در backend (اگر نصب نیست): در backend/package.json خط 11 وابستگی cors وجود دارد (`"cors": "^2.8.5"`) اما باید مطمئن شویم نصب شده است.
2. در فایل backend/server.js خط 47، پیکربندی فعلی `app.use(cors());` را با پیکربندی امن‌تر جایگزین کنیم:
   - origin: آرایه‌ای از originهای مجاز شامل:
     - `http://localhost:5173` (برای توسعه frontend)
     - `http://localhost:3001` (خود backend)
     - دامنه تولیدی (مثلاً از متغیر محیطی `FRONTEND_URL`)
   - methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
   - allowedHeaders: ['Content-Type', 'Authorization']
   - credentials: true (برای ارسال کوکی‌ها/توکن‌ها)
3. اضافه کردن پشتیبانی از preflight requests (OPTIONS) به صورت خودکار توسط cors middleware انجام می‌شود.
4. تنظیم متغیر محیطی FRONTEND_URL در backend/.env.example برای دامنه تولید.
5. اطمینان از اینکه frontend/vite.config.js (خطوط 8-14) proxy را به درستی تنظیم کرده است: `target: 'http://localhost:3001'`.

## 💡 نمونه‌های قبل/بعد
**پیکربندی CORS در backend/server.js**

_قبل:_
```
app.use(cors());
```

_بعد:_
```
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3001',
    process.env.FRONTEND_URL || 'https://labaneseapp.onrender.com'
  ].filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
```

**اضافه کردن FRONTEND_URL به backend/.env.example**

_قبل:_
```
# Port (optional, default 3001)
PORT=3001
```

_بعد:_
```
# Port (optional, default 3001)
PORT=3001

# Frontend URL for CORS (production)
FRONTEND_URL=https://labaneseapp.onrender.com
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `cd backend && node -e "const cors = require('cors'); console.log('cors module loaded');"`
- `cd backend && node server.js & sleep 2 && curl -H "Origin: http://localhost:5173" -I http://localhost:3001/api/health`
- `cd backend && node server.js & sleep 2 && curl -H "Origin: http://evil.com" -I http://localhost:3001/api/health`
- `cd frontend && npm run build && echo 'Frontend build successful'`

## ⚠️ ریسک‌ها و موارد احتیاط
تنظیم originهای اشتباه می‌تواند دسترسی frontend به backend را قطع کند. اگر credentials: true فعال شود، origin نمی‌تواند wildcard باشد (الزام مرورگر). WebSocket در خط 45 (wss = new WebSocketServer({ server, path: '/ws/live' })) ممکن است تحت تأثیر CORS قرار نگیرد چون WebSocket پروتکل متفاوتی دارد، اما باید تست شود. Inspector Bridge Script در frontend/index.html (خط 65) از postMessage استفاده می‌کند که تحت تأثیر CORS نیست اما origin فرستنده باید بررسی شود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: high
- تخمین زمان: small

---

# 🔹 مرحله 3: پیاده‌سازی rate limiting middleware برای جلوگیری از حملات brute force و DoS

**Scope:** این مرحله شامل نصب و پیکربندی middleware rate limiting (مانند express-rate-limit یا معادل آن) است. باید محدودیت تعداد درخواست‌ها در بازه زمانی مشخص (مثلاً 100 درخواست در 15 دقیقه) برای هر IP تعریف شود. همچنین باید مسیرهای حساس مانند /api/auth/login محدودیت سخت‌تری داشته باشند. خارج از این مرحله: helmet، CORS، یا input validation. نکته حیاتی: rate limiting باید برای endpointهای عمومی و حساس به طور جداگانه پیکربندی شود.
**Key terms:** rate limiting, express-rate-limit, brute force, DoS, IP-based limiting, /api/auth/login

**بخش مربوط از متن کاربر:**
```
فقدان security middleware مانند helmet، CORS configuration، rate limiting و input validation باعث آسیب‌پذیری‌های امنیتی جدی می‌شود. برای یک اپلیکیشن که با AI API ارتباط برقرار می‌کند، این موارد حیاتی هستند.
```

## 🎯 هدف (خلاصه ساختاریافته)
افزودن rate limiting middleware برای API endpoints

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/server.js:38-48` — `app definition and middleware setup` — محل فعلی middlewareها. rate limiter عمومی باید بعد از cors() و قبل از routeها اضافه شود. WebSocket server نباید rate limit شود.
  ```jsx
  const app = express();
  const PORT = process.env.PORT || 3001;
  
  // Create HTTP server
  const server = createServer(app);
  
  // Create WebSocket server
  const wss = new WebSocketServer({ server, path: '/ws/live' });
  
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  ```
- `backend/server.js:56-114` — `POST /api/gemini/chat endpoint` — این endpoint با AI API خارجی ارتباط دارد و باید محدودیت 20 req/15min داشته باشد تا از مصرف بیش از حد API key جلوگیری شود.
  ```jsx
  app.post('/api/gemini/chat', async (req, res) => {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }
  
    try {
      const payload = req.body;
      const includeAudio = payload.includeAudio;
      delete payload.includeAudio;
  ```
- `backend/server.js:698-715` — `POST /api/analyze-files endpoint` — این endpoint فایل آپلود می‌کند و منابع سرور را مصرف می‌کند. باید محدودیت 10 req/15min داشته باشد.
  ```jsx
  app.post('/api/analyze-files', upload.array('files', 10), handleMulterError, async (req, res) => {
    console.log('Received file analysis request');
  
    if (!GEMINI_API_KEY) {
      console.error('API key not configured');
      return res.status(500).json({ error: 'API key not configured' });
    }
  
    try {
      const files = req.files || [];
      const textContent = req.body.textContent || '';
      const userInstructions = req.body.userInstructions || '';
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
JavaScript, Express.js, WebSocket (ws), multer, fluent-ffmpeg, dotenv, cors

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `backend/package.json` (سطر 10) — برای نصب وابستگی express-rate-limit باید package.json به‌روز شود
- `backend/package-lock.json` (سطر 1) — بعد از نصب express-rate-limit، package-lock.json به‌طور خودکار به‌روز می‌شود
- `frontend/vite.config.js` (سطر 8) — Vite proxy در خط 8-12 درخواست‌های /api را به backend هدایت می‌کند. rate limiting در backend اعمال می‌شود و frontend تحت تأثیر نیست.
- `frontend/src/App.jsx` (سطر 1) — کامپوننت‌های frontend که API calls می‌کنند ممکن است با خطاهای 429 (Too Many Requests) مواجه شوند. باید handling مناسب اضافه شود.

## 🌐 نقشهٔ وابستگی‌ها
این تغییر به فایل backend/server.js اعمال می‌شود که فایل اصلی Express.js backend است. یک فایل جدید backend/middleware/rateLimiter.js ایجاد می‌شود. وابستگی express-rate-limit به backend/package.json اضافه می‌شود. WebSocket server (wss در خط 45) نباید rate limit شود. frontend/src/App.jsx ممکن است نیاز به handling خطاهای 429 داشته باشد. frontend/vite.config.js تحت تأثیر نیست چون proxy فقط مسیریابی می‌کند.

## 🔍 Context و وضعیت فعلی
کاربر درخواست پیاده‌سازی rate limiting middleware برای جلوگیری از حملات brute force و DoS داده است. این درخواست با اولویت high و نوع bug ثبت شده. کاربر مشخص کرده که باید از express-rate-limit یا معادل آن استفاده شود و محدودیت تعداد درخواست‌ها در بازه زمانی مشخص (مثلاً 100 درخواست در 15 دقیقه) برای هر IP تعریف شود. همچنین مسیرهای حساس مانند /api/auth/login باید محدودیت سخت‌تری داشته باشند. کاربر تأکید کرده که helmet، CORS، یا input validation خارج از این مرحله هستند. نکته حیاتی: rate limiting باید برای endpointهای عمومی و حساس به طور جداگانه پیکربندی شود.

بر اساس کد واقعی پروژه (backend/server.js)، این اپلیکیشن یک backend Express.js است که در خطوط 38-48 تعریف شده و شامل endpointهای زیر است:
- POST /api/gemini/chat (خط 56)
- POST /api/gemini/tts (خط 117)
- GET /api/health (خط 167)
- GET /api/list-models (خط 172)
- GET /api/test-gemini (خط 195)
- POST /api/analyze-files (خط 698)

همچنین یک WebSocket server در خط 45 (wss) روی path /ws/live وجود دارد. کاربر به طور خاص به /api/auth/login اشاره کرده که در حال حاضر در کد وجود ندارد، اما باید برای توسعه آینده در نظر گرفته شود.

کلیدواژه‌های کاربر: rate limiting, express-rate-limit, brute force, DoS, IP-based limiting, /api/auth/login

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] rate limiter عمومی (100 req/15min) روی همه routeهای /api/* اعمال شود و headerهای X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset در response موجود باشند
- [ ] بعد از 100 درخواست به /api/health در 15 دقیقه، پاسخ 429 (Too Many Requests) برگردد
- [ ] WebSocket server در path /ws/live تحت تأثیر rate limiting قرار نگیرد و اتصال WebSocket برقرار شود
- [ ] فایل backend/middleware/rateLimiter.js ایجاد شود و configهای rate limiting را export کند
- [ ] endpoint /api/analyze-files محدودیت 10 req/15min داشته باشد و بعد از 10 درخواست خطای 429 برگرداند
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. 1. نصب پکیج express-rate-limit با دستور npm install express-rate-limit در backend
2. ایجاد یک فایل جدید backend/middleware/rateLimiter.js برای تعریف configهای rate limiting
3. تعریف rate limiter عمومی: 100 درخواست در 15 دقیقه برای هر IP
4. تعریف rate limiter سخت‌گیرانه برای endpointهای حساس: 5 درخواست در 15 دقیقه برای /api/auth/login (برای آینده)
5. تعریف rate limiter ملایم‌تر برای endpointهای تحلیلی: 20 درخواست در 15 دقیقه برای /api/analyze-files
6. اعمال rate limiter عمومی روی همه routeها در backend/server.js بعد از خط 48 (app.use(cors()))
7. اعمال rate limiter اختصاصی روی routeهای حساس با استفاده از app.use('/api/auth', authLimiter)
8. اطمینان از اینکه WebSocket server (خط 45) تحت تأثیر rate limiting قرار نگیرد
9. اضافه کردن headerهای X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset در response
10. لاگ کردن درخواست‌های rate limited برای مانیتورینگ

## 💡 نمونه‌های قبل/بعد
**اعمال rate limiter عمومی روی همه routeها**

_قبل:_
```
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static files from frontend build
app.use(express.static(join(__dirname, '../frontend/dist')));
```

_بعد:_
```
import rateLimit from 'express-rate-limit';

// General rate limiter: 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(generalLimiter);

// Serve static files from frontend build
app.use(express.static(join(__dirname, '../frontend/dist')));
```

**rate limiter اختصاصی برای endpointهای حساس**

_قبل:_
```
// No rate limiting for specific endpoints
```

_بعد:_
```
// Strict rate limiter for auth endpoints (future use)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later.' },
  skipSuccessfulRequests: true
});

// Apply to auth routes (when implemented)
// app.use('/api/auth', authLimiter);

// Moderate rate limiter for analysis endpoints
const analysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many analysis requests, please try again later.' }
});

app.use('/api/analyze-files', analysisLimiter);
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `cd backend && npm install express-rate-limit`
- `cd backend && node server.js &`
- `curl -I http://localhost:3001/api/health | grep -i x-ratelimit`
- `for i in $(seq 1 101); do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/api/health; done | sort | uniq -c`
- `node -e "const WebSocket = require('ws'); const ws = new WebSocket('ws://localhost:3001/ws/live'); ws.on('open', () => { console.log('WebSocket connected'); ws.close(); }); ws.on('error', (e) => console.error('WS error:', e.message));"`

## ⚠️ ریسک‌ها و موارد احتیاط
1. WebSocket server (wss در خط 45 backend/server.js) نباید rate limit شود — باید middleware فقط روی Express routeها اعمال شود. 2. rate limiter عمومی ممکن است health check endpoint (/api/health در خط 167) را محدود کند که برای monitoring حیاتی است —可以考虑 استثنا. 3. frontend/src/App.jsx ممکن است handling خطاهای 429 را نداشته باشد و کاربر خطای غیرمنتظره ببیند. 4. در محیط development با proxy Vite (frontend/vite.config.js خط 8-12)، rate limiting ممکن است IP کلاینت را اشتباه تشخیص دهد (همیشه localhost). باید trust proxy تنظیم شود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: high
- تخمین زمان: small

---

# 🔹 مرحله 4: پیاده‌سازی input validation middleware برای تمام ورودی‌های کاربر

**Scope:** این مرحله شامل نصب و پیکربندی کتابخانه validation (مانند Joi، express-validator، یا Zod) و ایجاد middleware برای اعتبارسنجی تمام ورودی‌های دریافتی از کاربر (body، query parameters، URL parameters) است. باید قوانین validation برای هر endpoint تعریف شود (مثلاً نوع داده، طول، الگو). خارج از این مرحله: helmet، CORS، rate limiting. نکته حیاتی: validation باید در سطح middleware انجام شود و قبل از رسیدن به handler اصلی اجرا گردد.
**Key terms:** input validation, Joi, express-validator, Zod, body validation, query parameters, URL parameters

**بخش مربوط از متن کاربر:**
```
فقدان security middleware مانند helmet، CORS configuration، rate limiting و input validation باعث آسیب‌پذیری‌های امنیتی جدی می‌شود. برای یک اپلیکیشن که با AI API ارتباط برقرار می‌کند، این موارد حیاتی هستند.
```

## 🎯 هدف (خلاصه ساختاریافته)
افزودن middleware اعتبارسنجی ورودی با Joi/Zod

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/server.js:56-114` — `POST /api/gemini/chat` — این endpoint payload.contents را بدون validation پردازش می‌کند. نیاز به validation schema برای ساختار contents، role، parts، inline_data
  ```jsx
  app.post('/api/gemini/chat', async (req, res) => {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }
    try {
      const payload = req.body;
      const includeAudio = payload.includeAudio;
      delete payload.includeAudio;
      if (payload.contents) {
        payload.contents = payload.contents.map(content => ({
          role: content.role,
          parts: content.parts.map(part => {
            if (part.inline_data && includeAudio) {
              return { inline_data: part.inline_data };
            }
            if (part.text !== undefined) {
              return { text: part.text };
            }
            return null;
          }).filter(p => p !== null)
        }));
      }
  ```
- `backend/server.js:117-164` — `POST /api/gemini/tts` — prompt و voice بدون validation دریافت می‌شوند. voice باید از لیست مجاز باشد و prompt نباید خالی باشد
  ```jsx
  app.post('/api/gemini/tts', async (req, res) => {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }
    try {
      const { prompt, voice = 'Kore' } = req.body;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${GEMINI_API_KEY}`;
  ```
- `backend/server.js:698-715` — `POST /api/analyze-files` — فایل‌ها و textContent بدون validation دقیق دریافت می‌شوند. نیاز به validation برای تعداد فایل‌ها، نوع MIME، حداکثر طول textContent
  ```jsx
  app.post('/api/analyze-files', upload.array('files', 10), handleMulterError, async (req, res) => {
    console.log('Received file analysis request');
    if (!GEMINI_API_KEY) {
      console.error('API key not configured');
      return res.status(500).json({ error: 'API key not configured' });
    }
    try {
      const files = req.files || [];
      const textContent = req.body.textContent || '';
      const userInstructions = req.body.userInstructions || '';
      console.log(`Files received: ${files.length}, Text length: ${textContent.length}`);
      if (files.length === 0 && !textContent.trim()) {
        return res.status(400).json({ error: 'هیچ فایل یا متنی برای تحلیل ارسال نشده است' });
      }
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Stack تشخیص داده شده: JavaScript (Node.js backend با Express، فرانت‌اند React با Vite). کتابخانه‌های مرتبط: express (نسخه 4.22.1 در backend/package-lock.json خط ۲۶۱-۳۰۶)، multer برای آپلود فایل (خط ۸-۳۳ در server.js)، ws برای WebSocket (خط ۷ در server.js). کتابخانه پیشنهادی برای validation: Zod (نسخه 3.x) یا Joi (نسخه 17.x).

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `backend/package.json` (سطر 10) — نیاز به اضافه کردن وابستگی zod یا joi در dependencies
- `backend/.env.example` (سطر 1) — ممکن است نیاز به اضافه کردن متغیر محیطی برای فعال/غیرفعال کردن validation باشد
- `frontend/src/App.jsx` (سطر 1) — فرانت‌اند این endpointها را call می‌کند و ممکن است نیاز به تطبیق با خطاهای validation جدید داشته باشد
- `render.yaml` (سطر 1) — اگر validation نیاز به متغیر محیطی جدید داشته باشد، باید در render.yaml نیز اضافه شود

## 🌐 نقشهٔ وابستگی‌ها
این تغییرات روی backend/server.js تأثیر مستقیم دارد. فایل‌های جدید backend/validators/schemas.js و backend/middleware/validate.js ایجاد می‌شوند. وابستگی zod به backend/package.json اضافه می‌شود. فرانت‌اند (frontend/src/App.jsx) که این endpointها را از طریق proxy Vite (frontend/vite.config.js خط ۸-۱۲) call می‌کند، ممکن است نیاز به مدیریت خطاهای ۴۰۰ جدید داشته باشد. فایل render.yaml برای استقرار در Render استفاده می‌شود و اگر متغیر محیطی جدیدی اضافه شود باید آنجا نیز ثبت شود.

## 🔍 Context و وضعیت فعلی
پیاده‌سازی input validation middleware برای تمام ورودی‌های کاربر در backend/server.js. این تسک شامل نصب و پیکربندی کتابخانه validation (مانند Joi، express-validator، یا Zod) و ایجاد middleware برای اعتبارسنجی تمام ورودی‌های دریافتی از کاربر (body، query parameters، URL parameters) است. باید قوانین validation برای هر endpoint تعریف شود (مثلاً نوع داده، طول، الگو). خارج از این مرحله: helmet، CORS، rate limiting. نکته حیاتی: validation باید در سطح middleware انجام شود و قبل از رسیدن به handler اصلی اجرا گردد.

بخش مربوط از درخواست اصلی کاربر: فقدان security middleware مانند helmet، CORS configuration، rate limiting و input validation باعث آسیب‌پذیری‌های امنیتی جدی می‌شود. برای یک اپلیکیشن که با AI API ارتباط برقرار می‌کند، این موارد حیاتی هستند.

کلیدواژه‌ها: input validation, Joi, express-validator, Zod, body validation, query parameters, URL parameters

شواهد در کد واقعی: backend/server.js شامل ۱۴۰۳ خط کد است و endpointهای متعددی دارد که مستقیماً ورودی کاربر را پردازش می‌کنند بدون validation:
- خط ۵۶-۱۱۴: POST /api/gemini/chat - payload.contents را مستقیماً پردازش می‌کند
- خط ۱۱۷-۱۶۴: POST /api/gemini/tts - prompt و voice را بدون validation می‌گیرد
- خط ۱۷۲-۱۹۲: GET /api/list-models - بدون validation
- خط ۱۹۵-۲۴۰: GET /api/test-gemini - بدون validation
- خط ۶۹۸-۸۰۰: POST /api/analyze-files - فایل‌ها و textContent را بدون validation می‌گیرد

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فایل backend/validators/schemas.js باید شامل schemaهای chatSchema، ttsSchema، analyzeFilesSchema باشد
- [ ] فایل backend/middleware/validate.js باید تابع validate(schema) را export کند که در صورت خطا، پاسخ 400 با پیام خطا برگرداند
- [ ] POST /api/gemini/tts با body خالی یا نامعتبر باید status 400 برگرداند
- [ ] POST /api/gemini/chat با body فاقد contents باید status 400 برگرداند
- [ ] POST /api/analyze-files با بیش از 10 فایل باید status 400 برگرداند (multer خودش این کار را می‌کند، اما validation اضافی نباید تداخل ایجاد کند)
- [ ] POST /api/gemini/tts با voice نامعتبر (مثلاً 'InvalidVoice') باید status 400 برگرداند
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. ۱. نصب کتابخانه Zod (یا Joi) در backend: `npm install zod` در مسیر backend/
۲. ایجاد فایل جدید backend/validators/schemas.js با تمام schemaهای اعتبارسنجی:
   - chatSchema: validation برای POST /api/gemini/chat (بررسی ساختار contents، role، parts، inline_data)
   - ttsSchema: validation برای POST /api/gemini/tts (prompt باید string و voice باید یکی از مقادیر مجاز باشد)
   - analyzeFilesSchema: validation برای POST /api/analyze-files (files باید array با حداکثر ۱۰ آیتم، textContent باید string)
۳. ایجاد فایل backend/middleware/validate.js با middleware تابع validate(schema) که:
   - body، query، params را بر اساس schema بررسی کند
   - در صورت خطا، خطای ۴۰۰ با پیام خطای فارسی برگرداند
۴. import و اعمال middleware روی هر route در backend/server.js:
   - خط ۵۶: app.post('/api/gemini/chat', validate(chatSchema), async (req, res) => {...})
   - خط ۱۱۷: app.post('/api/gemini/tts', validate(ttsSchema), async (req, res) => {...})
   - خط ۶۹۸: app.post('/api/analyze-files', upload.array('files', 10), handleMulterError, validate(analyzeFilesSchema), async (req, res) => {...})
۵. اضافه کردن validation برای query parameters در GET endpoints (api/list-models و api/test-gemini)
۶. تست با ارسال درخواست‌های نامعتبر و بررسی پاسخ ۴۰۰

## 💡 نمونه‌های قبل/بعد
**POST /api/gemini/tts - قبل و بعد از اضافه کردن validation**

_قبل:_
```
app.post('/api/gemini/tts', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }
  try {
    const { prompt, voice = 'Kore' } = req.body;
```

_بعد:_
```
import { validate } from './middleware/validate.js';
import { ttsSchema } from './validators/schemas.js';

app.post('/api/gemini/tts', validate(ttsSchema), async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }
  try {
    const { prompt, voice = 'Kore' } = req.body;
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `cd backend && npm install zod`
- `cd backend && node -e "import('./middleware/validate.js').then(m => console.log('Module loaded'))"`
- `curl -X POST http://localhost:3001/api/gemini/tts -H 'Content-Type: application/json' -d '{}'`
- `curl -X POST http://localhost:3001/api/gemini/chat -H 'Content-Type: application/json' -d '{"invalid": true}'`

## ⚠️ ریسک‌ها و موارد احتیاط
تغییر در backend/server.js خطوط ۵۶-۱۱۴، ۱۱۷-۱۶۴، ۶۹۸-۸۰۰: این endpointها توسط فرانت‌اند (frontend/src/App.jsx) از طریق proxy Vite (frontend/vite.config.js خط ۸-۱۲) call می‌شوند. اگر validation بیش از حد سخت‌گیرانه باشد، درخواست‌های معتبر فرانت‌اند ممکن است با خطای ۴۰۰ مواجه شوند. همچنین، validation نباید با middleware multer (خط ۶۸۶-۶۹۵) تداخل ایجاد کند. ریسک دیگر: اگر از Zod استفاده شود و schemaها به‌درستی type inference را انجام ندهند، ممکن است داده‌های معتبر رد شوند.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: high
- تخمین زمان: medium

---

## ✅ معیارهای پذیرش کلی (همهٔ مراحل)
- [ ] {'text': 'کتابخانه helmet در `backend/package.json` به عنوان وابستگی اضافه شده باشد.', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['"helmet":'], 'files_hint': ['backend/package.json']}}
- [ ] {'text': 'import helmet در فایل `backend/server.js` در بخش importها (خطوط 1-12) اضافه شده باشد.', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ["import helmet from 'helmet';"], 'files_hint': ['backend/server.js']}}
- [ ] {'text': 'middleware `app.use(helmet())` به عنوان اولین middleware بعد از ایجاد `app` و قبل از `app.use(cors())` در فایل `backend/server.js` قرار گرفته باشد.', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['app.use\\(helmet\\(\\)\\)'], 'files_hint': ['backend/server.js']}}
- [ ] {'text': 'هدر `X-Content-Type-Options: nosniff` در پاسخ\u200cهای HTTP سرور (مثلاً GET /api/health) حضور داشته باشد.', 'verify_method': 'api_response', 'verify_plan': {'method': 'GET', 'path': '/api/health', 'expected_status': 200, 'required_fields': [], 'headers_to_check': ['x-content-type-options']}}
- [ ] {'text': 'هدر `X-Frame-Options: SAMEORIGIN` در پاسخ\u200cهای HTTP سرور حضور داشته باشد.', 'verify_method': 'api_response', 'verify_plan': {'method': 'GET', 'path': '/api/health', 'expected_status': 200, 'required_fields': [], 'headers_to_check': ['x-frame-options']}}
- [ ] {'text': 'هدر `Strict-Transport-Security` در پاسخ\u200cهای HTTP سرور حضور داشته باشد (در صورت استفاده از HTTPS).', 'verify_method': 'api_response', 'verify_plan': {'method': 'GET', 'path': '/api/health', 'expected_status': 200, 'required_fields': [], 'headers_to_check': ['strict-transport-security']}}
- [ ] {'text': 'CORS middleware باید originهای خاص (نه wildcard) را پشتیبانی کند: http://localhost:5173 برای توسعه و دامنه تولیدی از متغیر FRONTEND_URL', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['origin:', 'FRONTEND_URL', 'localhost:5173'], 'files_hint': ['backend/server.js']}}
- [ ] {'text': 'متدهای مجاز باید شامل GET, POST, PUT, DELETE, OPTIONS باشند', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['methods:', 'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 'files_hint': ['backend/server.js']}}
- [ ] {'text': 'هدرهای مجاز باید شامل Content-Type و Authorization باشند', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['allowedHeaders:', 'Content-Type', 'Authorization'], 'files_hint': ['backend/server.js']}}
- [ ] {'text': 'credentials باید true باشد (برای ارسال کوکی\u200cها/توکن\u200cها)', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['credentials: true'], 'files_hint': ['backend/server.js']}}
- [ ] {'text': 'درخواست OPTIONS (preflight) باید پاسخ 204 با هدرهای مناسب بدهد', 'verify_method': 'api_response', 'verify_plan': {'method': 'OPTIONS', 'path': '/api/health', 'expected_status': 204, 'required_fields': []}}
- [ ] {'text': 'درخواست از origin غیرمجاز (مثلاً http://evil.com) باید با خطای CORS مسدود شود', 'verify_method': 'api_response', 'verify_plan': {'method': 'GET', 'path': '/api/health', 'expected_status': 403, 'required_fields': []}}
- [ ] {'text': 'rate limiter عمومی (100 req/15min) روی همه routeهای /api/* اعمال شود و headerهای X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset در response موجود باشند', 'verify_method': 'api_response', 'verify_plan': {'method': 'GET', 'path': '/api/health', 'expected_status': 200, 'required_fields': [], 'check_headers': ['x-ratelimit-limit', 'x-ratelimit-remaining', 'x-ratelimit-reset']}}
- [ ] {'text': 'بعد از 100 درخواست به /api/health در 15 دقیقه، پاسخ 429 (Too Many Requests) برگردد', 'verify_method': 'api_response', 'verify_plan': {'method': 'GET', 'path': '/api/health', 'expected_status': 429, 'required_fields': ['error']}}
- [ ] {'text': 'WebSocket server در path /ws/live تحت تأثیر rate limiting قرار نگیرد و اتصال WebSocket برقرار شود', 'verify_method': 'manual_only', 'verify_plan': {'reason': 'نیاز به تست دستی WebSocket connection — می\u200cتوان با ابزار wscat یا کد کلاینت تست کرد'}}
- [ ] {'text': 'فایل backend/middleware/rateLimiter.js ایجاد شود و configهای rate limiting را export کند', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['export const generalLimiter', 'export const authLimiter', 'export const analysisLimiter', 'rateLimit'], 'files_hint': ['backend/middleware/rateLimiter.js']}}
- [ ] {'text': 'endpoint /api/analyze-files محدودیت 10 req/15min داشته باشد و بعد از 10 درخواست خطای 429 برگرداند', 'verify_method': 'api_response', 'verify_plan': {'method': 'POST', 'path': '/api/analyze-files', 'expected_status': 429, 'required_fields': ['error']}}
- [ ] {'text': 'فایل backend/validators/schemas.js باید شامل schemaهای chatSchema، ttsSchema، analyzeFilesSchema باشد', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['chatSchema', 'ttsSchema', 'analyzeFilesSchema', 'export const'], 'files_hint': ['backend/validators/schemas.js']}}
- [ ] {'text': 'فایل backend/middleware/validate.js باید تابع validate(schema) را export کند که در صورت خطا، پاسخ 400 با پیام خطا برگرداند', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['export function validate', 'export const validate', 'res.status(400)', 'ZodError'], 'files_hint': ['backend/middleware/validate.js']}}
- [ ] {'text': 'POST /api/gemini/tts با body خالی یا نامعتبر باید status 400 برگرداند', 'verify_method': 'api_response', 'verify_plan': {'method': 'POST', 'path': '/api/gemini/tts', 'expected_status': 400, 'required_fields': ['error']}}

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  - اضافه کردن middleware امنیتی helmet برای تنظیم هدرهای HTTP امنیتی — helmet نصب نشده و middleware آن در server.js اضافه نشده است
  - پیکربندی CORS middleware برای کنترل دسترسی cross-origin — CORS با originهای خاص و credentials پیکربندی نشده است
  - پیاده‌سازی rate limiting middleware برای جلوگیری از حملات brute force و DoS — فایل rateLimiter.js ایجاد نشده و rate limiting اعمال نشده است
  - پیاده‌سازی input validation middleware برای تمام ورودی‌های کاربر — فایل‌های schemas.js و validate.js ایجاد نشده‌اند

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 6 از 7
  id: b4991688-efec-4865-9aff-88d71d9a0127
  عنوان اصلی: پیکربندی CORS با دامنه‌های مجاز
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: backend/server.js

📋 acceptance_criteria کامل:
  - CORS فقط به دامنه‌های مشخص شده در متغیر محیطی CORS_ORIGIN اجازه دسترسی دهد [verify_method=static] [verify_plan={"grep_patterns": ["CORS", "دامنه", "مشخص", "متغیر", "محیطی", "اجازه", "دسترسی"], "files_hint": []}]
  - درخواست از دامنه‌های دیگر با خطای CORS مواجه شود [verify_method=static] [verify_plan={"grep_patterns": ["CORS", "درخواست", "دامنه", "دیگر", "خطای", "مواجه"], "files_hint": []}]
  - متغیر CORS_ORIGIN در فایل .env.example و render.yaml اضافه شود [verify_method=static] [verify_plan={"grep_patterns": ["example", "render", "متغیر", "فایل", "اضافه"], "files_hint": []}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در
  repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های
  مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط
  موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که
  چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.

🔍 **مسئولیت تو (مدل اجراکننده):**
- پیش از هر تغییر، خودت ساختار repo، فایل‌های ذکرشده، و وابستگی‌های آن‌ها را
  مستقل بررسی کن.
- اگر تشخیص دادی موقعیت ذکرشده در پرامپت اشتباه است یا فایل دیگری مناسب‌تر
  است، بر اساس قضاوت خودت عمل کن — این پرامپت نمی‌تواند بهانهٔ کار اشتباه
  باشد ("خودت گفتی" قابل قبول نیست).
- اگر معیارهای پذیرش (AC) مبهم/ناقص بودند، بهترین تفسیر را انتخاب کن و در
  commit message توضیح بده.

📦 **اگر کار طولانی است:**
- **خلاصه‌اش نکن.** همه را به‌طور کامل انجام بده.
- اگر یک کامیت گنجایش ندارد، در **چندین کامیت متوالی** انجام بده — ولی
  هیچ بخشی را skip نکن.
- ترتیب کامیت‌ها را منطقی نگه‌دار (foundation → core → integration → tests).
- در آخر یک checklist از همه‌ی کامیت‌ها در PR description بنویس.

---


## 🎯 هدف (خلاصه ساختاریافته)
CORS به صورت wildcard (*) تنظیم شده و هیچ محدودیتی ندارد

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/server.js:47` — `app.use(cors())` — CORS بدون هیچ محدودیتی فعال است
  ```jsx
  app.use(cors());
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Express.js + CORS middleware

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `backend/.env.example` (سطر 1) — فایل env که باید متغیر CORS_ORIGIN به آن اضافه شود
- `render.yaml` (سطر 8) — فایل کانفیگ deployment که باید متغیر محیطی جدید به آن اضافه شود

## 🌐 نقشهٔ وابستگی‌ها
این تنظیم روی تمام endpointهای backend تأثیر می‌گذارد.

## 🔍 Context و وضعیت فعلی
در فایل backend/server.js، خط 47، CORS با مقدار پیش‌فرض (که معادل '*' است) فعال شده است. این بدان معناست که هر دامنه‌ای می‌تواند به API backend درخواست ارسال کند. این یک vulnerability امنیتی است زیرا مهاجمان می‌توانند از دامنه‌های مخرب به API دسترسی پیدا کنند و عملیات‌هایی مانند خواندن داده‌ها، ارسال درخواست‌های مخرب (CSRF) و یا سوءاستفاده از API key را انجام دهند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] CORS فقط به دامنه‌های مشخص شده در متغیر محیطی CORS_ORIGIN اجازه دسترسی دهد
- [ ] درخواست از دامنه‌های دیگر با خطای CORS مواجه شود
- [ ] متغیر CORS_ORIGIN در فایل .env.example و render.yaml اضافه شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. CORS را به دامنه‌های مجاز محدود کنید. از متغیر محیطی برای تعریف originهای مجاز استفاده کنید. مثلاً: `app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }))`. در production، origin باید دقیقاً دامنه frontend (مثلاً https://yourdomain.com) باشد.

## 💡 نمونه‌های قبل/بعد
**محدود کردن CORS به دامنه مجاز**

_قبل:_
```
app.use(cors());
```

_بعد:_
```
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `curl -H "Origin: https://evil.com" -I http://localhost:3001/api/health | grep -i access-control`
- `curl -H "Origin: http://localhost:5173" -I http://localhost:3001/api/health | grep -i access-control`

## ⚠️ ریسک‌ها و موارد احتیاط
احتمال حملات CSRF و دسترسی غیرمجاز به API از دامنه‌های مخرب.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: high
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 7 از 7
  id: 60221f9c-c1b1-4274-9512-9c022c1dd65c
  عنوان اصلی: یکپارچه‌سازی اعتبارسنجی GEMINI_API_KEY در endpointها
  اولویت اصلی: medium
  وضعیت verify قبلی: pending
  فایل‌های دخیل: backend/server.js

📋 acceptance_criteria کامل:
  - اعمال تغییر بدون شکستن تست‌های موجود [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]
  - linter بدون warning عبور می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["eslint", "lint"], "files_hint": ["backend/server.js"]}]
  - type-check موفق است [verify_method=static] [verify_plan={"grep_patterns": ["tsc", "type-check"], "files_hint": ["backend/server.js"]}]

📝 idea_prompt اصلی (بدون تغییر و بدون خلاصه‌سازی):
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در
  repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های
  مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط
  موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که
  چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.

🔍 **مسئولیت تو (مدل اجراکننده):**
- پیش از هر تغییر، خودت ساختار repo، فایل‌های ذکرشده، و وابستگی‌های آن‌ها را
  مستقل بررسی کن.
- اگر تشخیص دادی موقعیت ذکرشده در پرامپت اشتباه است یا فایل دیگری مناسب‌تر
  است، بر اساس قضاوت خودت عمل کن — این پرامپت نمی‌تواند بهانهٔ کار اشتباه
  باشد ("خودت گفتی" قابل قبول نیست).
- اگر معیارهای پذیرش (AC) مبهم/ناقص بودند، بهترین تفسیر را انتخاب کن و در
  commit message توضیح بده.

📦 **اگر کار طولانی است:**
- **خلاصه‌اش نکن.** همه را به‌طور کامل انجام بده.
- اگر یک کامیت گنجایش ندارد، در **چندین کامیت متوالی** انجام بده — ولی
  هیچ بخشی را skip نکن.
- ترتیب کامیت‌ها را منطقی نگه‌دار (foundation → core → integration → tests).
- در آخر یک checklist از همه‌ی کامیت‌ها در PR description بنویس.

---


## 🎯 هدف (خلاصه ساختاریافته)
کد تکراری برای اعتبارسنجی GEMINI_API_KEY در چندین endpoint

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/server.js:57-59, 118-120, 173-175, 196-198` — `GEMINI_API_KEY check` — کد تکراری در 4 endpoint
  ```jsx
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Express middleware

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `backend/server.js` (سطر 57) — تمام endpointهایی که این اعتبارسنجی را دارند

## 🌐 نقشهٔ وابستگی‌ها
این middleware بر تمام endpointهای Gemini تأثیر می‌گذارد.

## 🔍 Context و وضعیت فعلی
در backend/server.js، اعتبارسنجی GEMINI_API_KEY در 4 endpoint تکرار شده است: خطوط 57-59 (chat), 118-120 (TTS), 173-175 (list-models), 196-198 (test-gemini). این کد تکراری باعث افزایش حجم کد و کاهش قابلیت نگهداری می‌شود. همچنین اگر نحوه اعتبارسنجی تغییر کند، باید در همه جا اعمال شود.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] اعمال تغییر بدون شکستن تست‌های موجود
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. یک middleware برای اعتبارسنجی GEMINI_API_KEY ایجاد کنید و آن را به routeهای مربوطه اضافه کنید. این کار کد را تمیزتر و نگهداری آن را آسان‌تر می‌کند.

## 💡 نمونه‌های قبل/بعد
**ایجاد middleware**

_قبل:_
```
app.post('/api/gemini/chat', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }
  ...
```

_بعد:_
```
const requireGeminiKey = (req, res, next) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## ⚠️ ریسک‌ها و موارد احتیاط
پیش از merge، تست‌های موجود اجرا شوند تا رگرشن ایجاد نشود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: refactor
- اولویت: medium
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 نکات استاندارد (همان bullet هایی که در ساخت پرامپت‌های معمولی پروژه رعایت می‌شود — وراثت کامل، نه کپی):
- ساختار AC ها: acceptance_criteria با verify_method و verify_plan و evidence_locations برای هر AC
- edge cases را در نظر بگیر و در پرامپت ذکر کن
- وابستگی‌ها را اول حل کن (dependency-aware ordering)
- اگر بخشی از یکی از تسک‌ها قبلاً done است (pre_done در بالا)، تکرار نکن — فقط روی remaining_parts تمرکز کن
- در commit message: `merged-from: 47bfef80-d77a-4386-9dca-fb1a533ca20b, cf9e7da4-37c4-463e-99dd-bd6707edcce3, f1a8e5dd-c1fa-4558-8603-d9200b6a5ce4, fdba8076-dc5d-470c-b7af-049761996be5, c7474d4f-8730-4531-b8ec-50de5a444b82, b4991688-efec-4865-9aff-88d71d9a0127, 60221f9c-c1b1-4274-9512-9c022c1dd65c`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Acceptance Criteria

1. زمانی که فایل `.env` وجود ندارد یا `GEMINI_API_KEY` در آن تعریف نشده، برنامه با خطای واضح 'FATAL: متغیر محیطی GEMINI_API_KEY معتبر نیست' متوقف شود و process.exit(1) فراخوانی شود. _(verify: backend_test)_
2. زمانی که `GEMINI_API_KEY` با فرمت نامعتبر (مثلاً 'abc' بدون پیشوند AIza) تنظیم شده، برنامه با خطا متوقف شود. _(verify: backend_test)_
3. زمانی که `PORT` با مقدار غیرعددی (مثلاً 'abc') تنظیم شده، برنامه با خطا متوقف شود. _(verify: backend_test)_
4. زمانی که همه متغیرهای محیطی معتبر هستند، برنامه بدون خطا startup شود و endpoint `/api/health` در خط 167 همچنان کار کند. _(verify: api_response)_
5. فایل `backend/config/validateEnv.js` ایجاد شده و تابع `validateEnv` در `backend/server.js` بعد از `dotenv.config()` در خط 14 فراخوانی شود. _(verify: static)_
6. فایل backend/utils/encryption.js باید وجود داشته باشد و شامل توابع encrypt و decrypt با AES-256-GCM باشد _(verify: static)_
7. کلید رمزنگاری (ENCRYPTION_KEY) نباید در کد منبع hard-coded شده باشد — باید از process.env.ENCRYPTION_KEY خوانده شود _(verify: static)_
8. مقدار GEMINI_API_KEY در backend/server.js باید از تابع decrypt عبور کند، نه مستقیم از process.env _(verify: static)_
9. فایل backend/.env.example باید شامل ENCRYPTION_KEY باشد _(verify: static)_
10. سرور باید با کلید رمزنگاری‌شده در .env راه‌اندازی شود و endpoint /api/health پاسخ 200 بدهد _(verify: api_response)_
11. هیچ occurrence از GEMINI_API_KEY در console.log یا console.error نباید مقدار واقعی را نشان دهد — فقط '[REDACTED]' یا '***' _(verify: static)_
12. هیچ endpoint API نباید keyPrefix یا بخشی از API key را در response برگرداند — همه باید با '[REDACTED]' جایگزین شوند _(verify: api_response)_
13. هیچ error message در throw new Error نباید حاوی مقدار واقعی API key باشد — پیام‌های خطا باید عمومی و امن باشند _(verify: static)_
14. تابع کمکی redactSensitiveData باید در backend/server.js تعریف شده باشد و تمام occurrenceهای API key را در رشته‌ها redact کند _(verify: static)_
15. تماس با console.log در خط 207 باید از تابع امن استفاده کند و apiUrl.replace(GEMINI_API_KEY, 'HIDDEN') حذف شود _(verify: static)_
16. هیچ credential Firebase در index.html وجود نداشته باشد _(verify: static)_
17. تمامی credentials از متغیرهای محیطی VITE_ خوانده شوند _(verify: static)_
18. فایل .env.example با placeholderها ایجاد شود _(verify: static)_
19. اپلیکیشن بعد از تغییرات بدون خطا initialize شود _(verify: ui_interaction)_
20. کتابخانه helmet در `backend/package.json` به عنوان وابستگی اضافه شده باشد. _(verify: static)_
21. import helmet در فایل `backend/server.js` در بخش importها (خطوط 1-12) اضافه شده باشد. _(verify: static)_
22. middleware `app.use(helmet())` به عنوان اولین middleware بعد از ایجاد `app` و قبل از `app.use(cors())` در فایل `backend/server.js` قرار گرفته باشد. _(verify: static)_
23. هدر `X-Content-Type-Options: nosniff` در پاسخ‌های HTTP سرور (مثلاً GET /api/health) حضور داشته باشد. _(verify: api_response)_
24. هدر `X-Frame-Options: SAMEORIGIN` در پاسخ‌های HTTP سرور حضور داشته باشد. _(verify: api_response)_
25. هدر `Strict-Transport-Security` در پاسخ‌های HTTP سرور حضور داشته باشد (در صورت استفاده از HTTPS). _(verify: api_response)_
26. CORS middleware باید originهای خاص (نه wildcard) را پشتیبانی کند: http://localhost:5173 برای توسعه و دامنه تولیدی از متغیر FRONTEND_URL _(verify: static)_
27. متدهای مجاز باید شامل GET, POST, PUT, DELETE, OPTIONS باشند _(verify: static)_
28. هدرهای مجاز باید شامل Content-Type و Authorization باشند _(verify: static)_
29. credentials باید true باشد (برای ارسال کوکی‌ها/توکن‌ها) _(verify: static)_
30. درخواست OPTIONS (preflight) باید پاسخ 204 با هدرهای مناسب بدهد _(verify: api_response)_
31. درخواست از origin غیرمجاز (مثلاً http://evil.com) باید با خطای CORS مسدود شود _(verify: api_response)_
32. rate limiter عمومی (100 req/15min) روی همه routeهای /api/* اعمال شود و headerهای X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset در response موجود باشند _(verify: api_response)_
33. بعد از 100 درخواست به /api/health در 15 دقیقه، پاسخ 429 (Too Many Requests) برگردد _(verify: api_response)_
34. WebSocket server در path /ws/live تحت تأثیر rate limiting قرار نگیرد و اتصال WebSocket برقرار شود _(verify: manual_only)_
35. فایل backend/middleware/rateLimiter.js ایجاد شود و configهای rate limiting را export کند _(verify: static)_
36. endpoint /api/analyze-files محدودیت 10 req/15min داشته باشد و بعد از 10 درخواست خطای 429 برگرداند _(verify: api_response)_
37. فایل backend/validators/schemas.js باید شامل schemaهای chatSchema، ttsSchema، analyzeFilesSchema باشد _(verify: static)_
38. فایل backend/middleware/validate.js باید تابع validate(schema) را export کند که در صورت خطا، پاسخ 400 با پیام خطا برگرداند _(verify: static)_
39. POST /api/gemini/tts با body خالی یا نامعتبر باید status 400 برگرداند _(verify: api_response)_
40. POST /api/gemini/chat با body فاقد contents باید status 400 برگرداند _(verify: api_response)_
41. POST /api/analyze-files با بیش از 10 فایل باید status 400 برگرداند (multer خودش این کار را می‌کند، اما validation اضافی نباید تداخل ایجاد کند) _(verify: api_response)_
42. POST /api/gemini/tts با voice نامعتبر (مثلاً 'InvalidVoice') باید status 400 برگرداند _(verify: api_response)_
43. Backend verifies Firebase ID tokens on /api/gemini/* endpoints _(verify: backend_test)_
44. Firebase config is loaded from environment variables, not hardcoded _(verify: static)_
45. Unauthenticated requests to backend return 401 _(verify: api_response)_
46. هیچ credential فایربیس در فایل‌های HTML یا JS به صورت plain text وجود نداشته باشد _(verify: static)_
47. Firebase config از متغیرهای محیطی (VITE_*) خوانده شود _(verify: static)_
48. کلید API در Firebase Console محدود به دامنه مجاز شده باشد _(verify: static)_
49. CORS فقط به دامنه‌های مشخص شده در متغیر محیطی CORS_ORIGIN اجازه دسترسی دهد _(verify: static)_
50. درخواست از دامنه‌های دیگر با خطای CORS مواجه شود _(verify: static)_
51. متغیر CORS_ORIGIN در فایل .env.example و render.yaml اضافه شود _(verify: static)_
52. اعمال تغییر بدون شکستن تست‌های موجود _(verify: backend_test)_
53. linter بدون warning عبور می‌کند _(verify: static)_
54. type-check موفق است _(verify: static)_

## Task Steps

### Step 1: پیاده‌سازی اعتبارسنجی (Validation) برای تمام متغیرهای محیطی در زمان راه‌اندازی برنامه
**Status:** `done` (100%)
**Scope:** این مرحله شامل ایجاد یک مکانیزم مرکزی برای اعتبارسنجی تمام متغیرهای محیطی (مانند API keys، URLs، و سایر تنظیمات) در زمان startup برنامه است. باید بررسی کند که متغیرهای ضروری وجود دارند، خالی نیستند، و در صورت امکان فرمت صحیح دارند (مثلاً URL معتبر). این مرحله شامل encryption یا handling امنیتی دیگر نمی‌شود. نکته حیاتی: اعتبارسنجی باید fail-fast باشد، یعنی اگر متغیری معتبر نباشد، برنامه با خطای واضح متوقف شود. فایل‌های هدف: backend/config/validateEnv.js (ایجاد شود)، backend/server.js (ویرایش شود)، backend/tests/test_validateEnv.js (ایجاد شود).
**Excerpt:**
```
وجود فایل .env.example نشان‌دهنده استفاده از متغیرهای محیطی است، اما عدم وجود validation، encryption و proper handling این متغیرها خطر امنیتی جدی ایجاد می‌کند. API keys مربوط به Gemini AI و سایر سرویس‌ها در معرض خطر قرار دارند.
```

### Step 2: پیاده‌سازی اعتبارسنجی fail-fast برای متغیرهای محیطی در startup
**Status:** `done` (100%)
**Scope:** این مرحله شامل ایجاد فایل جدید `backend/config/validateEnv.js` برای اعتبارسنجی مرکزی متغیرهای محیطی (GEMINI_API_KEY، PORT، VITE_FIREBASE_CONFIG) در زمان startup است. تابع validateEnv باید بررسی کند که متغیرهای ضروری وجود دارند، خالی نیستند و در صورت امکان فرمت صحیح دارند (مثلاً PORT عددی باشد). اعتبارسنجی باید fail-fast باشد: اگر متغیری معتبر نباشد، برنامه با خطای واضح متوقف شود. این مرحله شامل حذف بررسی‌های پراکنده `if (!GEMINI_API_KEY)` از endpointها نمی‌شود (آن مرحله بعدی است). همچنین شامل رمزنگاری متغیرها یا تغییر نحوه ذخیره‌سازی آن‌ها نمی‌شود.
**Excerpt:**
```
کاربر درخواست پیاده‌سازی یک مکانیزم مرکزی برای اعتبارسنجی تمام متغیرهای محیطی (مانند API keys، URLs، و سایر تنظیمات) در زمان startup برنامه را دارد. این اعتبارسنجی باید بررسی کند که متغیرهای ضروری وجود دارند، خالی نیستند، و در صورت امکان فرمت صحیح دارند (مثلاً URL معتبر). نکته حیاتی: اعتبارسنجی باید fail-fast باشد، یعنی اگر متغیری معتبر نباشد، برنامه با خطای واضح متوقف شود. کاربر به فایل `backend/.env.example` اشاره کرده که حاوی متغیرهای `GEMINI_API_KEY`، `PORT` و `VITE_FIREBASE_CONFIG` است. در کد واقعی `backend/server.js`، متغیر `GEMINI_API_KEY` در خط ۵۳ با `process.env.GEMINI_API_KEY` خوانده می‌شود و در endpointهای `/api/gemini/chat` (خط ۵۶)، `/api/gemini/tts` (خط ۱۱۷)، `/api/list-models` (خط ۱۷۲)، `/api/test-gemini` (خط ۱۹۵) و `/api/analyze-files` (خط ۶۹۸) فقط با یک `if (!GEMINI_API_KEY)` ساده بررسی می‌شود که منجر به بازگشت error 500 می‌شود، نه توقف برنامه. همچنین متغیر `PORT` در خط ۳۹ با مقدار پیش‌فرض ۳۰۰۱ استفاده شده اما اعتبارسنجی نشده.
```

### Step 3: ایجاد و پیاده‌سازی اعتبارسنجی متغیرهای محیطی در startup برنامه
**Status:** `done` (100%)
**Scope:** این بخش شامل ایجاد فایل `backend/config/validateEnv.js` با تابع `validateEnv()` و فراخوانی آن در `backend/server.js` بعد از `dotenv.config()` است. اعتبارسنجی شامل: وجود و فرمت `GEMINI_API_KEY` (شروع با 'AIza')، اعتبار عددی `PORT` (اختیاری با پیش‌فرض 3001)، و اعتبار JSON برای `VITE_FIREBASE_CONFIG` (اختیاری با warning). خطاهای بحرانی باعث `process.exit(1)` می‌شوند. پیام‌های خطا دو زبانه (فارسی/انگلیسی) هستند. خارج از scope: پیاده‌سازی endpoint `/api/health`، تست‌ها، linting، type-checking.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] زمانی که فایل `.env` وجود ندارد یا `GEMINI_API_KEY` در آن تعریف نشده، برنامه با خطای واضح 'FATAL: متغیر محیطی GEMINI_API_KEY معتبر نیست' متوقف شود و process.exit(1) فراخوانی شود.
- [ ] زمانی که `GEMINI_API_KEY` با فرمت نامعتبر (مثلاً 'abc' بدون پیشوند AIza) تنظیم شده، برنامه با خطا متوقف شود.
- [ ] زمانی که `PORT` با مقدار غیرعددی (مثلاً 'abc') تنظیم شده، برنامه با خطا متوقف شود.
- [ ] زمانی که همه متغیرهای محیطی معتبر هستند، برنامه بدون خطا startup شود و endpoint `/api/health` در خط 167 همچنان کار کند.
- [ ] فایل `backend/config/validateEnv.js` ایجاد شده و تابع `validateEnv` در `backend/server.js` بعد از `dotenv.config()` در خط 14 فراخوانی شود.
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. ۱. ایجاد فایل جدید `backend/config/validateEnv.js` با یک تابع `validateEnv()` که در زمان startup فراخوانی شود.
۲. در این تابع، ابتدا متغیر `GEMINI_API_KEY` از `process.env` خوانده شود و بررسی شود که وجود دارد و خالی نیست. اگر وجود نداشت یا خالی بود، `console.error` با پیام واضح چاپ کند و `process.exit(1)` فراخوانی شود.
۳. متغیر `PORT` بررسی شود: اگر تعریف شده، باید یک عدد صحیح بین ۱ تا ۶۵۵۳۵ باشد. اگر تعریف نشده، مقدار پیش‌فرض ۳۰۰۱ استفاده شود (نیاز به fail-fast ندارد).
۴. متغیر `VITE_FIREBASE_CONFIG` (اختیاری) بررسی شود: اگر تعریف شده، باید یک JSON معتبر باشد. اگر نامعتبر بود، warning چاپ شود اما برنامه fail نشود.
۵. در `backend/server.js`، در خطوط ابتدایی (بعد از `dotenv.config()` در خط ۱۴)، تابع `validateEnv()` فراخوانی شود.
۶. پیام خطاها باید به فارسی و انگلیسی باشد و دقیقاً مشخص کند کدام متغیر مشکل دارد و چه مقداری انتظار می‌رود.
۷. برای `GEMINI_API_KEY`، یک validation ساده فرمت (شروع با 'AIza') اضافه شود تا از اشتباهات تایپی جلوگیری کند.
```

### Step 4: اعتبارسنجی GEMINI_API_KEY در زمان startup با تابع validateEnv
**Status:** `done` (100%)
**Scope:** این بخش شامل ایجاد فایل جدید backend/config/validateEnv.js با تابع validateEnv است که GEMINI_API_KEY را از نظر وجود و شروع با 'AIza' اعتبارسنجی می‌کند و در صورت نامعتبر بودن با خطای fatal متوقف می‌شود. همچنین PORT را از نظر عددی بودن و محدوده معتبر بررسی می‌کند. سپس در backend/server.js بعد از dotenv.config، این تابع import و فراخوانی می‌شود. خارج از scope: تغییر endpointها، تست‌ها، یا سایر متغیرهای محیطی.
**Excerpt:**
```
## 💡 نمونه‌های قبل/بعد
**اعتبارسنجی GEMINI_API_KEY در startup**

_قبل:_
```
// backend/server.js خط 53
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// سپس در هر endpoint:
if (!GEMINI_API_KEY) {
  return res.status(500).json({ error: 'API key not configured' });
}
```

_بعد:_
```
// backend/config/validateEnv.js (فایل جدید)
export function validateEnv() {
  const requiredVars = [
    { name: 'GEMINI_API_KEY', validator: (v) => v && v.startsWith('AIza') }
  ];
  
  for (const { name, validator } of requiredVars) {
    const value = process.env[name];
    if (!value || !validator(value)) {
      console.error(`❌ FATAL: متغیر محیطی ${name} معتبر نیست. مقدار فعلی: '${value?.substring(0, 10)}...'`);
      console.error(`   لطفاً یک API key معتبر از https://aistudio.google.com/apikey دریافت کنید.`);
      process.exit(1);
    }
  }
  
  // PORT validation (optional but warn if invalid)
  const port = process.env.PORT;
  if (port) {
    const portNum = parseInt(port, 10);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      console.error(`❌ FATAL: PORT=${port} معتبر نیست. باید یک عدد بین 1 تا 65535 باشد.`);
      process.exit(1);
    }
  }
}

// backend/server.js خط 14 (بعد از dotenv.config)
import { validateEnv } from './config/validateEnv.js';
dotenv.config();
validateEnv();
```
```

### Step 5: اجرای دستورات اعتبارسنجی پیکربندی متغیرهای محیطی
**Status:** `pending` (0%)
**Scope:** این بخش شامل اجرای سه دستور اعتبارسنجی است: (1) تست validateEnv با کلید API خالی، (2) تست validateEnv با کلید API معتبر اما پورت نامعتبر، و (3) اجرای تست‌های واحد مرتبط با validateEnv. این مرحله صرفاً اجرای دستورات است و شامل طراحی یا پیاده‌سازی نمی‌شود. خروجی مورد انتظار: خطا برای حالت اول، خطا برای حالت دوم، و موفقیت برای تست‌ها.
**Excerpt:**
```
## 🧪 دستورات اعتبارسنجی
- `cd backend && node -e "process.env.GEMINI_API_KEY=''; import('./config/validateEnv.js').then(m => m.validateEnv())"`
- `cd backend && node -e "process.env.GEMINI_API_KEY='AIzaValidKey'; process.env.PORT='abc'; import('./config/validateEnv.js').then(m => m.validateEnv())"`
- `cd backend && npm test -- --grep 'validateEnv'`
```

### Step 6: پیاده‌سازی رمزنگاری AES-256 برای ذخیره‌سازی امن API Keys و متغیرهای حساس
**Status:** `pending` (0%)
**Scope:** این مرحله شامل پیاده‌سازی یک ماژول رمزنگاری (AES-256) در فایل `backend/utils/encryption.js` است. این ماژول باید دو تابع `encrypt(text)` و `decrypt(encryptedText)` را ارائه دهد. کلید رمزنگاری از متغیر محیطی `ENCRYPTION_KEY` خوانده می‌شود و نباید در کد منبع hard-coded شود. این مرحله شامل validation، logging، یا ذخیره‌سازی خودکار در فایل `.env` نیست. خروجی این ماژول برای استفاده در مراحل بعدی (مانند ذخیره‌سازی امن API keys در دیتابیس یا فایل پیکربندی) آماده خواهد بود.
**Excerpt:**
```
وجود فایل .env.example نشان‌دهنده استفاده از متغیرهای محیطی است، اما عدم وجود validation، encryption و proper handling این متغیرها خطر امنیتی جدی ایجاد می‌کند. API keys مربوط به Gemini AI و سایر سرویس‌ها در معرض خطر قرار دارند.

## 🔹 مرحله 2: پیاده‌سازی رمزنگاری (Encryption) برای ذخیره‌سازی امن API keys و متغیرهای حساس

**Scope:** این مرحله شامل پیاده‌سازی یک مکانیزم برای رمزنگاری متغیرهای محیطی حساس (مانند API keys) در زمان ذخیره‌سازی (مثلاً در فایل .env یا دیتابیس) است. باید از یک الگوریتم رمزنگاری استاندارد (مانند AES-256) استفاده کند. کلید رمزنگاری باید خودش از یک متغیر محیطی دیگر (مانند ENCRYPTION_KEY) خوانده شود. این مرحله شامل validation یا handling لاگینگ نمی‌شود. نکته حیاتی: کلید رمزنگاری نباید در کد منبع hard-coded شود.
**Key terms:** .env.example, encryption, API keys, Gemini AI, AES-256, ENCRYPTION_KEY
```

### Step 7: پیاده‌سازی رمزنگاری AES-256-GCM برای API Key در backend/server.js
**Status:** `pending` (0%)
**Scope:** این مرحله شامل ایجاد یک ماژول رمزنگاری (backend/utils/encryption.js) با الگوریتم AES-256-GCM، اصلاح backend/server.js برای رمزگشایی GEMINI_API_KEY از ENCRYPTION_KEY در زمان راه‌اندازی، و به‌روزرسانی backend/.env.example برای اضافه کردن ENCRYPTION_KEY است. تمام endpointهایی که از GEMINI_API_KEY استفاده می‌کنند (خطوط 84, 124, 178, 205, 274, 304, 376, 396, 434) به صورت خودکار از متغیر رمزگشایی‌شده استفاده خواهند کرد. خارج از scope: رمزنگاری Firebase config در frontend، validation، logging، و hard-coding کلید رمزنگاری.
**Excerpt:**
```
پیاده‌سازی رمزنگاری AES-256 برای API Keys

- `backend/server.js:53-54` — `GEMINI_API_KEY` — API key مستقیم از env خوانده می‌شود — باید رمزگشایی شود
  ```jsx
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  ```
- `backend/.env.example:1-5` — `GEMINI_API_KEY` — فایل example باید شامل ENCRYPTION_KEY هم باشد
  ```
  # Gemini API Key - Get from https://aistudio.google.com/apikey
  GEMINI_API_KEY=your_gemini_api_key_here
  
  # Port (optional, default 3001)
  PORT=3001
  ```
- `backend/server.js:84` — `apiUrl` — استفاده مستقیم از API key در URL — باید از متغیر رمزگشایی‌شده استفاده کند
  ```jsx
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  ```

فایل جدید (backend/utils/encryption.js) ایجاد می‌کند که توسط backend/server.js import می‌شود. تابع encrypt/decrypt در زمان راه‌اندازی سرور (خط 53 server.js) فراخوانی می‌شود. تمام endpointهای API که از GEMINI_API_KEY استفاده می‌کنند (خطوط 84, 124, 178, 205, 274, 304, 376, 396, 434) به صورت غیرمستقیم تحت تأثیر قرار می‌گیرند چون از یک متغیر سراسری استفاده می‌کنند. فایل .env.example نیز به‌روزرسانی می‌شود.
```

### Step 8: پیاده‌سازی رمزنگاری AES-256-GCM برای متغیرهای محیطی حساس
**Status:** `pending` (0%)
**Scope:** این بخش شامل ایجاد ماژول رمزنگاری (encryption.js)، خواندن کلید از متغیر محیطی، رمزنگاری GEMINI_API_KEY در server.js، به‌روزرسانی .env.example و رمزنگاری مقدار واقعی در .env است. frontend و فایل‌های تست خارج از این scope هستند. نکته حیاتی: کلید رمزنگاری نباید در کد hard-code شود و باید از process.env.ENCRYPTION_KEY خوانده شود.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فایل backend/utils/encryption.js باید وجود داشته باشد و شامل توابع encrypt و decrypt با AES-256-GCM باشد
- [ ] کلید رمزنگاری (ENCRYPTION_KEY) نباید در کد منبع hard-coded شده باشد — باید از process.env.ENCRYPTION_KEY خوانده شود
- [ ] مقدار GEMINI_API_KEY در backend/server.js باید از تابع decrypt عبور کند، نه مستقیم از process.env
- [ ] فایل backend/.env.example باید شامل ENCRYPTION_KEY باشد
- [ ] سرور باید با کلید رمزنگاری‌شده در .env راه‌اندازی شود و endpoint /api/health پاسخ 200 بدهد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. 1. ایجاد فایل جدید backend/utils/encryption.js با توابع encrypt و decrypt با استفاده از الگوریتم AES-256-GCM.
2. خواندن کلید رمزنگاری از متغیر محیطی ENCRYPTION_KEY (نه hard-code).
3. اصلاح فایل backend/server.js برای استفاده از توابع رمزنگاری هنگام خواندن GEMINI_API_KEY از process.env.
4. به‌روزرسانی فایل backend/.env.example برای اضافه کردن ENCRYPTION_KEY.
5. رمزنگاری مقدار GEMINI_API_KEY در فایل .env واقعی (نه example).
6. عدم تغییر در frontend/index.html فعلاً (چون Firebase config عمومی است).
```

### Step 9: پیاده‌سازی رمزنگاری API Key در متغیرهای محیطی
**Status:** `pending` (0%)
**Scope:** این بخش شامل تغییر نحوه خواندن و ذخیره‌سازی GEMINI_API_KEY است. API key باید به صورت رمزنگاری‌شده در فایل .env ذخیره شود و در زمان اجرا با کلید رمزگشایی (ENCRYPTION_KEY) رمزگشایی گردد. فایل .env.example نیز باید به‌روزرسانی شود تا شامل هر دو متغیر باشد. این بخش شامل پیاده‌سازی تابع decrypt نیست (فرض بر وجود آن در backend/utils/encryption.js است) و صرفاً نحوه استفاده از آن را مشخص می‌کند.
**Excerpt:**
```
## 💡 نمونه‌های قبل/بعد
**خواندن API key بدون رمزنگاری**

_قبل:_
```
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
```

_بعد:_
```
const encryptedKey = process.env.GEMINI_API_KEY;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const GEMINI_API_KEY = decrypt(encryptedKey, ENCRYPTION_KEY);
```

**فایل .env.example قبل و بعد**

_قبل:_
```
GEMINI_API_KEY=your_gemini_api_key_here
```

_بعد:_
```
# Encryption key (32 characters for AES-256)
ENCRYPTION_KEY=your_32_char_encryption_key_here

# Encrypted API key (use encryption utility to generate)
GEMINI_API_KEY=encrypted_value_here
```
```

### Step 10: اجرای دستورات اعتبارسنجی امنیتی برای رمزنگاری و متغیرهای محیطی
**Status:** `pending` (0%)
**Scope:** این بخش شامل اجرای سه دستور اعتبارسنجی مشخص است: تست صحت توابع encrypt/decrypt در encryption.js، بررسی عدم استفاده مستقیم از process.env.GEMINI_API_KEY در server.js، و اطمینان از وجود ENCRYPTION_KEY در فایل .env.example. هیچ تغییری در کد ایجاد نمی‌شود و صرفاً اجرای دستورات خط فرمان برای تأیید وضعیت فعلی است.
**Excerpt:**
```
## 🧪 دستورات اعتبارسنجی
- `node -e "const { encrypt, decrypt } = require('./backend/utils/encryption.js'); const key = '12345678901234567890123456789012'; const encrypted = encrypt('test-key', key); console.log(decrypt(encrypted, key) === 'test-key' ? 'PASS' : 'FAIL');"`
- `grep -r 'process.env.GEMINI_API_KEY' backend/server.js | grep -v 'decrypt' && echo 'WARNING: Direct usage found' || echo 'OK: No direct usage'`
- `grep 'ENCRYPTION_KEY' backend/.env.example || echo 'FAIL: ENCRYPTION_KEY not in .env.example'`
```

### Step 11: پیاده‌سازی مدیریت امن متغیرهای محیطی شامل لاگینگ امن و خطاهای مناسب
**Status:** `done` (100%)
**Scope:** این مرحله شامل پیاده‌سازی یک لایه مدیریت امن برای متغیرهای محیطی است. شامل: ۱) هرگز لاگ نکردن مقادیر واقعی API keys یا متغیرهای حساس در console یا فایل‌های لاگ (فقط نشانگرهایی مانند '***' یا '[REDACTED]'). ۲) ارائه خطاهای کاربرپسند و امن که اطلاعات حساس را فاش نکنند. ۳) اطمینان از اینکه متغیرهای محیطی در حافظه (memory) بیش از حد لازم نگهداری نشوند. این مرحله شامل validation یا encryption نمی‌شود. نکته حیاتی: هیچ متغیر حساسی نباید در stack trace یا error message ظاهر شود.
**Excerpt:**
```
وجود فایل .env.example نشان‌دهنده استفاده از متغیرهای محیطی است، اما عدم وجود validation، encryption و proper handling این متغیرها خطر امنیتی جدی ایجاد می‌کند. API keys مربوط به Gemini AI و سایر سرویس‌ها در معرض خطر قرار دارند.
```

### Step 12: پیاده‌سازی مدیریت امن متغیرهای محیطی در backend/server.js
**Status:** `done` (100%)
**Scope:** این مرحله شامل اصلاح فایل backend/server.js برای مدیریت امن متغیر GEMINI_API_KEY است. اقدامات شامل: 1) جایگزینی console.log ناقص در خط 207 با یک تابع لاگینگ امن که کلید را به طور کامل مخفی می‌کند. 2) حذف یا جایگزینی تمام موارد keyPrefix که 10 کاراکتر اول کلید را فاش می‌کنند (خطوط 183, 188, 224, 234) با یک نشانگر امن مانند '[REDACTED]'. 3) اطمینان از اینکه هیچ error message یا stack trace حاوی مقدار واقعی کلید نیست. این مرحله شامل validation، encryption، یا تغییر در فایل‌های دیگر نمی‌شود. نکته حیاتی: هیچ متغیر حساسی نباید در console.log، console.error، یا پاسخ‌های API ظاهر شود.
**Excerpt:**
```
## 🎯 هدف (خلاصه ساختاریافته)
پیاده‌سازی مدیریت امن متغیرهای محیطی در backend/server.js

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/server.js:53-53` — `GEMINI_API_KEY` — نقطه ورود متغیر محیطی حساس — باید از اینجا به بعد مدیریت امن اعمال شود
  ```jsx
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  ```
- `backend/server.js:207-207` — `console.log('Testing Gemini API with URL:', apiUrl.replace(GEMINI_API_KEY, 'HIDDEN'))` — لاگینگ ناقص — اگر replace شکست بخورد، کلید فاش می‌شود. باید با تابع امن جایگزین شود
  ```jsx
  console.log('Testing Gemini API with URL:', apiUrl.replace(GEMINI_API_KEY, 'HIDDEN'));
  ```
- `backend/server.js:183-183` — `keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...'` — فاش کردن ۱۰ کاراکتر اول کلید در پاسخ API — خطر امنیتی جدی
  ```jsx
  return res.status(response.status).json({ error: data, keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...' });
  ```
- `backend/server.js:188-188` — `keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...'` — فاش کردن ۱۰ کاراکتر اول کلید در پاسخ API — خطر امنیتی جدی
  ```jsx
  res.json({ models: modelNames, count: modelNames.length, keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...' });
  ```
- `backend/server.js:224-224` — `keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...'` — فاش کردن ۱۰ کاراکتر اول کلید در پاسخ API — خطر امنیتی جدی
  ```jsx
  keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...'
  ```
- `backend/server.js:234-234` — `keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...'` — فاش کردن ۱۰ کاراکتر اول کلید در پاسخ API — خطر امنیتی جدی
  ```jsx
  keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...'
  ```
```

### Step 13: پیاده‌سازی توابع امن برای مدیریت و لاگ‌گیری متغیرهای محیطی و حذف API Key از خروجی‌ها
**Status:** `done` (100%)
**Scope:** این مرحله شامل ایجاد یک ماژول امن (backend/config/secureEnv.js) با توابع getSecureEnv و logSecure، جایگزینی تمام console.log/console.error مستقیم GEMINI_API_KEY با توابع امن، اصلاح خط 207 (apiUrl.replace(...))، حذف keyPrefix از خطوط 183, 188, 224, 234، و اطمینان از عدم افشای API Key در throw new Error است. خارج از scope: رمزگذاری، اعتبارسنجی، پاک کردن memory، و تست‌نویسی.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] هیچ occurrence از GEMINI_API_KEY در console.log یا console.error نباید مقدار واقعی را نشان دهد — فقط '[REDACTED]' یا '***'
- [ ] هیچ endpoint API نباید keyPrefix یا بخشی از API key را در response برگرداند — همه باید با '[REDACTED]' جایگزین شوند
- [ ] هیچ error message در throw new Error نباید حاوی مقدار واقعی API key باشد — پیام‌های خطا باید عمومی و امن باشند
- [ ] تابع کمکی redactSensitiveData باید در backend/server.js تعریف شده باشد و تمام occurrenceهای API key را در رشته‌ها redact کند
- [ ] تماس با console.log در خط 207 باید از تابع امن استفاده کند و apiUrl.replace(GEMINI_API_KEY, 'HIDDEN') حذف شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. ۱. ایجاد یک ماژول امن برای مدیریت متغیرهای محیطی در فایل backend/server.js یا یک فایل جداگانه مانند backend/config/secureEnv.js. ۲. تعریف یک تابع کمکی به نام `getSecureEnv(key)` که مقدار متغیر محیطی را برمی‌گرداند و یک تابع `logSecure(key)` که فقط '[REDACTED]' را لاگ می‌کند. ۳. جایگزینی تمام console.log و console.error که مستقیماً از GEMINI_API_KEY استفاده می‌کنند با توابع امن. ۴. در خط 207، apiUrl.replace(GEMINI_API_KEY, 'HIDDEN') را با یک تابع امن جایگزین کن که هر occurrence از API key را در URL یا پیام‌ها redact کند. ۵. در خطوط 183, 188, 224, 234 که keyPrefix را با substring(0, 10) + '...' نشان می‌دهند، این عمل را حذف کن و فقط از '[REDACTED]' استفاده کن. ۶. اطمینان حاصل کن که در تمام throw new Errorها، پیام خطا حاوی اطلاعات حساس نباشد و در صورت نیاز، خطاهای کاربرپسند و امن برگردانده شوند. ۷. متغیر GEMINI_API_KEY را پس از استفاده در memory پاک نکن (چون درخواست شامل encryption/validation نیست)، اما اطمینان حاصل کن که در scopeهای غیرضروری در دسترس نباشد.
```

### Step 14: جایگزینی keyPrefix با '[REDACTED]' و لاگینگ ناقص با تابع امن
**Status:** `done` (100%)
**Scope:** این بخش شامل دو تغییر مجزا در backend/server.js است: (1) جایگزینی مقدار keyPrefix که بخشی از کلید API را فاش می‌کرد با رشته ثابت '[REDACTED]' در endpoint /api/list-models. (2) جایگزینی console.log که با replace ساده کار می‌کرد با فراخوانی تابع redactSensitiveData برای لاگ کردن URL. خارج از scope: ایجاد تابع redactSensitiveData (فرض می‌شود وجود دارد)، تغییرات در فایل‌های دیگر، تست‌ها.
**Excerpt:**
```
**جایگزینی keyPrefix با '[REDACTED]' در endpoint /api/list-models**

_قبل:_
```
res.json({ models: modelNames, count: modelNames.length, keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...' });
```

_بعد:_
```
res.json({ models: modelNames, count: modelNames.length, keyPrefix: '[REDACTED]' });
```

**جایگزینی لاگینگ ناقص با تابع امن**

_قبل:_
```
console.log('Testing Gemini API with URL:', apiUrl.replace(GEMINI_API_KEY, 'HIDDEN'));
```

_بعد:_
```
console.log('Testing Gemini API with URL:', redactSensitiveData(apiUrl, [GEMINI_API_KEY]));
```
```

### Step 15: اجرای دستورات اعتبارسنجی برای بررسی نشت API Key در backend/server.js
**Status:** `done` (100%)
**Scope:** این بخش شامل اجرای چهار دستور grep مشخص بر روی فایل backend/server.js است. هدف از این دستورات، یافتن مواردی است که ممکن است منجر به نشت یا افشای ناخواسته کلید API (GEMINI_API_KEY) در خروجی‌های کنسول، خطاها، یا عملیات‌های رشته‌ای شود. این یک مرحله بازرسی و اعتبارسنجی کد است و شامل هیچ تغییری در فایل‌ها نمی‌شود.
**Excerpt:**
```
## 🧪 دستورات اعتبارسنجی
- `grep -n 'GEMINI_API_KEY' backend/server.js | grep -E 'console\.(log|error|warn)'`
- `grep -n 'keyPrefix' backend/server.js`
- `grep -n 'substring' backend/server.js | grep -E 'GEMINI_API_KEY|apiKey'`
- `grep -n 'throw new Error' backend/server.js | grep -E 'apiKey|GEMINI|API'`
```

### Step 16: مدیریت ریسک‌های امنیتی در لاگینگ و ریداکت اطلاعات حساس
**Status:** `done` (100%)
**Scope:** این مرحله شامل شناسایی و ریداکت کردن اطلاعات حساس در errorData برگشتی از API در خطوط مشخص شده (94, 146, 289, 322, 354, 417) و اطمینان از عملکرد صحیح replace کلید API در خط 207 است. همچنین بررسی وابستگی‌های مانیتورینگ خارجی به keyPrefix در خطوط 183, 188, 224, 234 انجام می‌شود. تغییرات لاگینگ نباید اطلاعات دیباگینگ را از بین ببرد.
**Excerpt:**
```
ریسک اصلی: تغییر لاگینگ ممکن است باعث از دست رفتن اطلاعات دیباگینگ شود. در خطوط 94, 146, 289, 322, 354, 417 که errorData از API برگشتی گرفته می‌شود، اگر errorData حاوی اطلاعات حساس باشد، باید redact شود. همچنین در خط 207 که apiUrl.replace(GEMINI_API_KEY, 'HIDDEN') استفاده شده، اگر replace به درستی کار نکند (مثلاً key در URL نباشد)، کلید فاش می‌شود. تغییر keyPrefix در خطوط 183, 188, 224, 234 ممکن است ابزارهای مانیتورینگ خارجی را که به این فیلد وابسته هستند، مختل کند.
```

### Step 17: انتقال Firebase credentials به متغیرهای محیطی در frontend/index.html
**Status:** `done` (100%)
**Scope:** این بخش شامل حذف تمام Firebase credentials (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId) از فایل frontend/index.html و جایگزینی آن‌ها با متغیرهای محیطی VITE_ است. همچنین شامل ایجاد فایل .env.example با placeholderهای مربوطه و اطمینان از initialize شدن اپلیکیشن بدون خطا پس از تغییرات می‌شود. فایل‌های دخیل: frontend/index.html و .env.example.
— [merged] این مرحله شامل حذف Firebase credentials از frontend/index.html و انتقال آن به فایل .env و استفاده از import.meta.env در frontend/src/main.jsx است. فایل‌های frontend/index.html, frontend/src/main.jsx, frontend/.env.example و frontend/vite.config.js تحت تأثیر قرار می‌گیرند. نکته حیاتی: apiKey Firebase ذاتاً عمومی است اما همراه با سایر اطلاعات حساس (projectId, storageBucket) باید از hardcoding جلوگیری شود. این مرحله صرفاً به frontend مربوط است و backend/server.js یا سایر فایل‌های backend را شامل نمی‌شود.
— [merged] این مرحله شامل حذف مقادیر hardcoded Firebase از frontend/index.html و جایگزینی آنها با متغیرهای محیطی از طریق Vite است. فایل‌های مرتبط: frontend/index.html, frontend/.env (ایجاد), frontend/vite.config.js (بررسی), frontend/src/App.jsx (بررسی import). خارج از scope: تغییرات در backend، تست‌ها، یا سایر بخش‌های امنیتی.
**Excerpt:**
```
📋 acceptance_criteria کامل:
  - هیچ credential Firebase در index.html وجود نداشته باشد [verify_method=static] [verify_plan={"grep_patterns": ["apiKey", "authDomain", "projectId", "storageBucket", "messagingSenderId", "appId"], "files_hint": ["frontend/index.html"]}]
  - تمامی credentials از متغیرهای محیطی VITE_ خوانده شوند [verify_method=static] [verify_plan={"grep_patterns": ["import.meta.env.VITE_"], "files_hint": ["frontend/index.html"]}]
  - فایل .env.example با placeholderها ایجاد شود [verify_method=static] [verify_plan={"grep_patterns": ["VITE_API_KEY", "VITE_AUTH_DOMAIN", "VITE_PROJECT_ID", "VITE_STORAGE_BUCKET", "VITE_MESSAGING_SENDER_ID", "VITE_APP_ID"], "files_hint": [".env.example"]}]
  - اپلیکیشن بعد از تغییرات بدون خطا initialize شود [verify_method=ui_interaction] [verify_plan={"base": "frontend", "ui_steps": [{"action": "navigate", "url": "/"}, {"action": "wait_for_load", "state": "networkidle"}, {"action": "assert_visible", "selector": "[data-testid='app-root']"}]}]
```

### Step 18: بررسی اولیه و تحلیل پیش‌نیازهای اجرایی از یادداشت مهم
**Status:** `done` (100%)
**Scope:** این بخش شامل تحلیل یادداشت هشداردهنده ابتدایی پرامپت است که به مدل اجراکننده دستورالعمل‌های کلی برای بررسی repo، شناسایی پیاده‌سازی‌های قبلی، و جلوگیری از بازسازی غیرضروری می‌دهد. این یک مرحله تحلیلی-آماده‌سازی است و شامل هیچ تغییر کدی نمی‌شود. خروجی این مرحله یک تصمیم (ادامه/رد) و یک نقشه اجرایی است.
**Excerpt:**
```
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.

🔍 **مسئولیت تو (مدل اجراکننده):**
- پیش از هر تغییر، خودت ساختار repo، فایل‌های ذکرشده، و وابستگی‌های آن‌ها را مستقل بررسی کن.
- اگر تشخیص دادی موقعیت ذکرشده در پرامپت اشتباه است یا فایل دیگری مناسب‌تر است، بر اساس قضاوت خودت عمل کن — این پرامپت نمی‌تواند بهانهٔ کار اشتباه باشد ("خودت گفتی" قابل قبول نیست).
- اگر معیارهای پذیرش (AC) مبهم/ناقص بودند، بهترین تفسیر را انتخاب کن و در commit message توضیح بده.

📦 **اگر کار طولانی است:**
- **خلاصه‌اش نکن.** همه را به‌طور کامل انجام بده.
- اگر یک کامیت گنجایش ندارد، در **چندین کامیت متوالی** انجام بده — ولی هیچ بخشی را skip نکن.
- ترتیب کامیت‌ها را منطقی نگه‌دار (foundation → core → integration → tests).
- در آخر یک checklist از همه‌ی کامیت‌ها در PR description بنویس.
```

### Step 19: انتقال Firebase Config به متغیرهای محیطی Vite و ایجاد .env.example
**Status:** `done` (100%)
**Scope:** این مرحله شامل انتقال Firebase credentials از فایل index.html به متغیرهای محیطی VITE_ در frontend است. فایل .env.example با placeholderها باید ایجاد شود. تمامی credentials باید از import.meta.env در main.jsx یا یک فایل config مجزا خوانده شوند. این مرحله شامل backend نمی‌شود و فقط مربوط به frontend است.
**Excerpt:**
```
1. Firebase config را به متغیرهای محیطی Vite (VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, ...) منتقل کنید و از import.meta.env در main.jsx یا یک فایل config مجزا استفاده کنید. همچنین یک فایل .env.example با placeholderها ایجاد کنید.
```

### Step 20: مهاجرت Firebase Config از hardcode به متغیر محیطی با Vite
**Status:** `done` (100%)
**Scope:** این بخش شامل انتقال Firebase credentials از فایل index.html (که به صورت JSON.stringify درون کد جاوااسکریپت قرار داشت) به فایل .env و استفاده از import.meta.env.VITE_* در main.jsx است. فقط تغییرات مربوط به Firebase config را پوشش می‌دهد و شامل سایر متغیرهای محیطی یا هدرها نمی‌شود. نکته حیاتی: فایل index.html در لیست مسیرها نیست، بنابراین باید فرض شود که کد قبلاً در index.html بوده و حالا باید به main.jsx منتقل شود.
**Excerpt:**
```
## 💡 نمونه‌های قبل/بعد
**Firebase config**

_قبل:_
```
<!-- index.html -->
var __firebase_config = JSON.stringify({...credentials...});
```

_بعد:_
```
// .env
VITE_FIREBASE_API_KEY=your_key_here
// main.jsx
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  ...
}
```
```

### Step 21: بارگیری Firebase config از متغیرهای محیطی به جای مقادیر سخت‌کد شده
**Status:** `done` (100%)
**Scope:** این مرحله صرفاً به تغییر نحوه خواندن پیکربندی Firebase در فایل backend/server.js مربوط می‌شود. هدف این است که مقادیر سخت‌کد شده (hardcoded) با متغیرهای محیطی (process.env.FIREBASE_*) جایگزین شوند. هیچ تغییری در frontend، middleware، یا سایر فایل‌ها در این مرحله انجام نمی‌شود. ریسک این تغییر کم است و فقط بر نحوه بارگیری config تأثیر می‌گذارد.
**Excerpt:**
```
## ⚠️ ریسک‌ها و موارد احتیاط
کم - فقط تغییر نحوه خواندن config

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: critical
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 3 از 7
  id: f1a8e5dd-c1fa-4558-8603-d9200b6a5ce4
  عنوان اصلی: Secure Firebase config and verify backend tokens
  اولویت اصلی: critical
  وضعیت verify قبلی: partial
  فایل‌های دخیل: backend/server.js, frontend/index.html

📋 acceptance_criteria کامل:
  - Backend verifies Firebase ID tokens on /api/gemini/* endpoints [verify_method=backend_test] [verify_plan={"test_node": "tests/test_firebase_auth.py::test_verify_id_token_on_gemini_endpoints", "timeout_seconds": 60}]
  - Firebase config is loaded from environment variables, not hardcoded [verify_method=static] [verify_plan={"grep_patterns": ["process\\.env\\.FIREBASE_API_KEY", "process\\.env\\.FIREBASE_AUTH_DOMAIN", "process\\.env\\.FIREBASE_PROJECT_ID", "process\\.env\\.FIREBASE_STORAGE_BUCKET", "process\\.env\\.FIREBA]
  - Unauthenticated requests to backend return 401 [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/gemini/status", "headers": null, "json_body": null, "expected_status": 401, "required_fields": ["error"], "json_contains": null}]
```

### Step 22: بررسی اولیه و تحلیل پیش‌نیازها قبل از اجرای تغییرات امنیتی
**Status:** `pending` (0%)
**Scope:** این بخش یک یادداشت راهنمایی برای مدل اجراکننده است و شامل دستورالعمل‌های اجرایی مستقیم نیست. وظیفه آن تعیین رویکرد صحیح برای پیاده‌سازی است: بررسی وجود پیاده‌سازی‌های قبلی، تحلیل مستقل ساختار repo، و تصمیم‌گیری بر اساس قضاوت شخصی. این بخش هیچ کد یا تغییری را مشخص نمی‌کند و صرفاً چارچوب رفتاری را تعریف می‌کند.
**Excerpt:**
```
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در
  repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های
  مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط
  موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که
  چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.

🔍 **مسئولیت تو (مدل اجراکننده):**
- پیش از هر تغییر، خودت ساختار repo، فایل‌های ذکرشده، و وابستگی‌های آن‌ها را
  مستقل بررسی کن.
- اگر تشخیص دادی موقعیت ذکرشده در پرامپت اشتباه است یا فایل دیگری مناسب‌تر
  است، بر اساس قضاوت خودت عمل کن — این پرامپت نمی‌تواند بهانهٔ کار اشتباه
  باشد ("خودت گفتی" قابل قبول نیست).
- اگر معیارهای پذیرش (AC) مبهم/ناقص بودند، بهترین تفسیر را انتخاب کن و در
  commit message توضیح بده.

📦 **اگر کار طولانی است:**
- **خلاصه‌اش نکن.** همه را به‌طور کامل انجام بده.
- اگر یک کامیت گنجایش ندارد، در **چندین کامیت متوالی** انجام بده — ولی
  هیچ بخشی را skip نکن.
- ترتیب کامیت‌ها را منطقی نگه‌دار (foundation → core → integration → tests).
- در آخر یک checklist از همه‌ی کامیت‌ها در PR description بنویس.
```

### Step 23: انتقال Firebase Config از index.html به متغیر محیطی و یکپارچه‌سازی Firebase Admin در بک‌اند
**Status:** `done` (100%)
**Scope:** این مرحله شامل دو بخش اصلی است: (1) حذف Firebase credentials از frontend/index.html و بارگذاری آن از متغیر محیطی از طریق Vite، (2) افزودن Firebase Admin SDK به backend/server.js و تنظیم متغیرهای محیطی مربوطه در backend/.env.example. موارد خارج از scope: تغییر منطق احراز هویت، اضافه کردن middleware جدید، یا تغییر frontend/src/App.jsx.
**Excerpt:**
```
Frontend uses Firebase API keys exposed in index.html, backend lacks Firebase integration

- `frontend/index.html:11-18` — `__firebase_config` — Firebase credentials exposed in HTML; should be loaded from env
  ```
  var __firebase_config = JSON.stringify({
    apiKey: "AIzaSyAMFtV0zIMKKe0bIr68Z1wTORQ1jQpsv9Q",
    authDomain: "labaneseapp.firebaseapp.com",
    ...
  });
  ```
- `backend/server.js:1-14` — `imports` — No Firebase Admin SDK import; backend has no Firebase integration
  ```jsx
  import express from 'express';
  import cors from 'cors';
  ...
  import ffmpeg from 'fluent-ffmpeg';
  ```

- `backend/.env.example` (سطر 1) — Missing Firebase environment variables
- `frontend/src/App.jsx` (سطر 137) — Uses Firebase auth and Firestore
```

### Step 24: اعتبارسنجی توکن Firebase در اندپوینت‌های محافظت‌شده و بارگیری پیکربندی از متغیرهای محیطی
**Status:** `done` (100%)
**Scope:** این بخش شامل افزودن Firebase Admin SDK به بک‌اند برای اعتبارسنجی توکن‌های Firebase ID در اندپوینت‌های /api/gemini/*، انتقال پیکربندی Firebase از کد سخت (hardcoded) به متغیرهای محیطی، و به‌روزرسانی backend/.env.example با اعتبارنامه‌های سرویس Firebase است. تست‌ها و لینترها باید بدون خطا عبور کنند. خارج از scope: تغییرات در فرانت‌اند (index.html) یا سایر اندپوینت‌ها.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] Backend verifies Firebase ID tokens on /api/gemini/* endpoints
- [ ] Firebase config is loaded from environment variables, not hardcoded
- [ ] Unauthenticated requests to backend return 401
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. Add Firebase Admin SDK to backend for verifying Firebase ID tokens on protected endpoints. Move Firebase config to environment variables and remove hardcoded values from index.html. Update backend/.env.example with Firebase service account credentials.
```

### Step 25: افزودن Firebase Admin به بک‌اند برای احراز هویت
**Status:** `done` (100%)
**Scope:** این مرحله شامل افزودن import و مقداردهی اولیه Firebase Admin SDK در فایل backend/server.js است. متغیر محیطی FIREBASE_SERVICE_ACCOUNT باید از قبل در محیط وجود داشته باشد. این مرحله شامل نصب پکیج firebase-admin یا تغییرات در package.json نیست.
**Excerpt:**
```
## 💡 نمونه‌های قبل/بعد
**Add Firebase Admin to backend**

_قبل:_
```
// No Firebase imports in backend
```

_بعد:_
```
import admin from 'firebase-admin';
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
```
```

### Step 26: حذف hardcode کلیدهای Firebase از frontend
**Status:** `done` (100%)
**Scope:** این تسک شامل حذف تمام credentialهای Firebase از فایل frontend/index.html و جایگزینی آن‌ها با متغیرهای محیطی VITE_* است. همچنین شامل محدود کردن کلید API در Firebase Console به دامنه مجاز می‌شود. فایل‌های دخیل: frontend/index.html, frontend/vite.config.js, frontend/src/main.jsx. خارج از scope: تغییرات backend، تست‌های backend، یا تغییرات rate limiter.
**Excerpt:**
```
تسک 4 از 7
  id: fdba8076-dc5d-470c-b7af-049761996be5
  عنوان اصلی: حذف hardcode کلیدهای Firebase از frontend
  اولویت اصلی: critical
  وضعیت verify قبلی: partial
  فایل‌های دخیل: frontend/index.html

📋 acceptance_criteria کامل:
  - هیچ credential فایربیس در فایل‌های HTML یا JS به صورت plain text وجود نداشته باشد [verify_method=static] [verify_plan={"grep_patterns": ["HTML", "credential", "plain", "فایربیس", "فایل", "صورت", "وجود", "نداشته"], "files_hint": []}]
  - Firebase config از متغیرهای محیطی (VITE_*) خوانده شود [verify_method=static] [verify_plan={"grep_patterns": ["Firebase", "config", "متغیرهای", "محیطی", "خوانده"], "files_hint": []}]
  - کلید API در Firebase Console محدود به دامنه مجاز شده باشد [verify_method=static] [verify_plan={"grep_patterns": ["Firebase", "Console", "کلید", "محدود", "دامنه", "مجاز", "باشد"], "files_hint": []}]
```

### Step 27: بررسی اولیه و تحلیل وضعیت موجود پیش از اجرا
**Status:** `pending` (0%)
**Scope:** این بخش یک یادداشت هشداردهنده برای مدل اجراکننده است و شامل هیچ دستور اجرایی مستقیمی نیست. وظیفه آن الزام مدل به بررسی مستقل مخزن، شناسایی پیاده‌سازی‌های قبلی، و جلوگیری از بازسازی موارد موجود است. همچنین بر مسئولیت مدل در قبال تصمیم‌گیری در صورت ابهام یا خطا در پرامپت تأکید دارد. این بخش هیچ تغییری در کد ایجاد نمی‌کند و صرفاً یک مرحله تحلیلی-تصمیم‌گیری است.
**Excerpt:**
```
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در
  repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های
  مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط
  موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که
  چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.

🔍 **مسئولیت تو (مدل اجراکننده):**
- پیش از هر تغییر، خودت ساختار repo، فایل‌های ذکرشده، و وابستگی‌های آن‌ها را
  مستقل بررسی کن.
- اگر تشخیص دادی موقعیت ذکرشده در پرامپت اشتباه است یا فایل دیگری مناسب‌تر
  است، بر اساس قضاوت خودت عمل کن — این پرامپت نمی‌تواند بهانهٔ کار اشتباه
  باشد ("خودت گفتی" قابل قبول نیست).
- اگر معیارهای پذیرش (AC) مبهم/ناقص بودند، بهترین تفسیر را انتخاب کن و در
  commit message توضیح بده.

📦 **اگر کار طولانی است:**
- **خلاصه‌اش نکن.** همه را به‌طور کامل انجام بده.
- اگر یک کامیت گنجایش ندارد، در **چندین کامیت متوالی** انجام بده — ولی
  هیچ بخشی را skip نکن.
- ترتیب کامیت‌ها را منطقی نگه‌دار (foundation → core → integration → tests).
- در آخر یک checklist از همه‌ی کامیت‌ها در PR description بنویس.
```

### Step 28: حذف Firebase credentials از کد frontend و جایگزینی با متغیرهای محیطی Vite
**Status:** `done` (100%)
**Scope:** این مرحله شامل حذف مقادیر plain text Firebase config از فایل‌های frontend (HTML/JS) و جایگزینی با متغیرهای محیطی VITE_* است. همچنین شامل تنظیم محدودیت API key در Firebase Console برای دامنه مجاز می‌شود. خارج از scope: تغییرات backend، تست‌های backend، یا هرگونه تغییر در ساختار دیتابیس.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] هیچ credential فایربیس در فایل‌های HTML یا JS به صورت plain text وجود نداشته باشد
- [ ] Firebase config از متغیرهای محیطی (VITE_*) خوانده شود
- [ ] کلید API در Firebase Console محدود به دامنه مجاز شده باشد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. Firebase config را از کد frontend حذف کرده و از متغیرهای محیطی (environment variables) استفاده کنید. در Vite، می‌توانید از VITE_FIREBASE_API_KEY و غیره استفاده کنید و در زمان build این مقادیر جایگزین شوند. همچنین، محدودیت‌های دسترسی (API key restrictions) را در Firebase Console فعال کنید تا کلید فقط از دامنه‌های مجاز قابل استفاده باشد.
```

### Step 29: حذف hardcoded Firebase config از HTML و جایگزینی با متغیرهای محیطی
**Status:** `done` (100%)
**Scope:** این بخش شامل حذف پیکربندی سخت‌کد شده Firebase از فایل‌های HTML و جایگزینی آن با متغیرهای محیطی (VITE_FIREBASE_API_KEY) در کد فرانت‌اند است. فایل‌های مرتبط: frontend/src/App.jsx و frontend/src/main.jsx. خارج از scope: تغییرات بک‌اند، تست‌ها، یا پیکربندی سرور.
**Excerpt:**
```
## 💡 نمونه‌های قبل/بعد
**حذف hardcoded config از HTML**

_قبل:_
```
var __firebase_config = JSON.stringify({ apiKey: "...", ... });
```

_بعد:_
```
// Firebase config از متغیرهای محیطی خوانده می‌شود
import.meta.env.VITE_FIREBASE_API_KEY
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.
```

### Step 30: پیاده‌سازی هدرهای امنیتی و CORS با helmet و rate limiter
**Status:** `pending` (0%)
**Scope:** این بخش شامل پیاده‌سازی کامل هدرهای امنیتی با کتابخانه helmet، پیکربندی CORS با originهای مشخص (localhost:5173 و FRONTEND_URL)، اعمال rate limiter عمومی روی مسیرهای /api/*، ایجاد rate limiter اختصاصی برای /api/analyze-files، و ایجاد middlewareهای rateLimiter.js و validate.js و validators/schemas.js است. خارج از scope: پیاده‌سازی WebSocket، تست‌های دستی WebSocket، و پیکربندی متغیرهای محیطی.
**Excerpt:**
```
## ⚠️ ریسک‌ها و موارد احتیاط
اگر کلید API محدود نشود، مهاجم می‌تواند از سرویس‌های Firebase (مانند Firestore, Auth) سوءاستفاده کند و هزینه‌های غیرمجاز ایجاد کند.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: critical
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 5 از 7
  id: c7474d4f-8730-4531-b8ec-50de5a444b82
  عنوان اصلی: پیاده‌سازی هدرهای امنیتی و CORS
  اولویت اصلی: high
  وضعیت verify قبلی: pending
  فایل‌های دخیل: backend/.env.example, backend/server.js, frontend/vite.config.js

📋 acceptance_criteria کامل:
  - کتابخانه helmet در `backend/package.json` به عنوان وابستگی اضافه شده باشد. [verify_method=static] [verify_plan={"grep_patterns": ["\"helmet\":"], "files_hint": ["backend/package.json"]}]
  - import helmet در فایل `backend/server.js` در بخش importها (خطوط 1-12) اضافه شده باشد. [verify_method=static] [verify_plan={"grep_patterns": ["import helmet from 'helmet';"], "files_hint": ["backend/server.js"]}]
  - middleware `app.use(helmet())` به عنوان اولین middleware بعد از ایجاد `app` و قبل از `app.use(cors())` در فایل `backend/server.js` قرار گرفته باشد. [verify_method=static] [verify_plan={"grep_patterns": ["app.use\\(helmet\\(\\)\\)"], "files_hint": ["backend/server.js"]}]
  - هدر `X-Content-Type-Options: nosniff` در پاسخ‌های HTTP سرور (مثلاً GET /api/health) حضور داشته باشد. [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/health", "headers": null, "json_body": null, "expected_status": 200, "required_fields": [], "json_contains": null, "headers_to_check": ["x-content-type-options"]}]
  - هدر `X-Frame-Options: SAMEORIGIN` در پاسخ‌های HTTP سرور حضور داشته باشد. [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/health", "headers": null, "json_body": null, "expected_status": 200, "required_fields": [], "json_contains": null, "headers_to_check": ["x-frame-options"]}]
  - هدر `Strict-Transport-Security` در پاسخ‌های HTTP سرور حضور داشته باشد (در صورت استفاده از HTTPS). [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/health", "headers": null, "json_body": null, "expected_status": 200, "required_fields": [], "json_contains": null, "headers_to_check": ["strict-transport-security"]}]
  - CORS middleware باید originهای خاص (نه wildcard) را پشتیبانی کند: http://localhost:5173 برای توسعه و دامنه تولیدی از متغیر FRONTEND_URL [verify_method=static] [verify_plan={"grep_patterns": ["origin:", "FRONTEND_URL", "localhost:5173"], "files_hint": ["backend/server.js"]}]
  - متدهای مجاز باید شامل GET, POST, PUT, DELETE, OPTIONS باشند [verify_method=static] [verify_plan={"grep_patterns": ["methods:", "GET", "POST", "PUT", "DELETE", "OPTIONS"], "files_hint": ["backend/server.js"]}]
  - هدرهای مجاز باید شامل Content-Type و Authorization باشند [verify_method=static] [verify_plan={"grep_patterns": ["allowedHeaders:", "Content-Type", "Authorization"], "files_hint": ["backend/server.js"]}]
  - credentials باید true باشد (برای ارسال کوکی‌ها/توکن‌ها) [verify_method=static] [verify_plan={"grep_patterns": ["credentials: true"], "files_hint": ["backend/server.js"]}]
  - درخواست OPTIONS (preflight) باید پاسخ 204 با هدرهای مناسب بدهد [verify_method=api_response] [verify_plan={"method": "OPTIONS", "path": "/api/health", "headers": null, "json_body": null, "expected_status": 204, "required_fields": [], "json_contains": null}]
  - درخواست از origin غیرمجاز (مثلاً http://evil.com) باید با خطای CORS مسدود شود [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/health", "headers": null, "json_body": null, "expected_status": 403, "required_fields": [], "json_contains": null}]
  - rate limiter عمومی (100 req/15min) روی همه routeهای /api/* اعمال شود و headerهای X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset در response موجود باشند [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/health", "headers": null, "json_body": null, "expected_status": 200, "required_fields": [], "json_contains": null, "check_headers": ["x-ratelimit-limit", "x-ratelimit-r]
  - بعد از 100 درخواست به /api/health در 15 دقیقه، پاسخ 429 (Too Many Requests) برگردد [verify_method=api_response] [verify_plan={"method": "GET", "path": "/api/health", "headers": null, "json_body": null, "expected_status": 429, "required_fields": ["error"], "json_contains": null}]
  - WebSocket server در path /ws/live تحت تأثیر rate limiting قرار نگیرد و اتصال WebSocket برقرار شود [verify_method=manual_only] [verify_plan={"reason": "نیاز به تست دستی WebSocket connection — می‌توان با ابزار wscat یا کد کلاینت تست کرد"}]
  - فایل backend/middleware/rateLimiter.js ایجاد شود و configهای rate limiting را export کند [verify_method=static] [verify_plan={"grep_patterns": ["export const generalLimiter", "export const authLimiter", "export const analysisLimiter", "rateLimit"], "files_hint": ["backend/middleware/rateLimiter.js"]}]
  - endpoint /api/analyze-files محدودیت 10 req/15min داشته باشد و بعد از 10 درخواست خطای 429 برگرداند [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/analyze-files", "headers": null, "json_body": null, "expected_status": 429, "required_fields": ["error"], "json_contains": null}]
  - فایل backend/validators/schemas.js باید شامل schemaهای chatSchema، ttsSchema، analyzeFilesSchema باشد [verify_method=static] [verify_plan={"grep_patterns": ["chatSchema", "ttsSchema", "analyzeFilesSchema", "export const"], "files_hint": ["backend/validators/schemas.js"]}]
  - فایل backend/middleware/validate.js باید تابع validate(schema) را export کند که در صورت خطا، پاسخ 400 با پیام خطا برگرداند [verify_method=static] [verify_plan={"grep_patterns": ["export function validate", "export const validate", "res.status(400)", "ZodError"], "files_hint": ["backend/middleware/validate.js"]}]
  - POST /api/gemini/tts با body خالی یا نامعتبر باید status 400 برگرداند [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/gemini/tts", "headers": null, "json_body": null, "expected_status": 400, "required_fields": ["error"], "json_contains": null}]
  - POST /api/gemini/chat با body فاقد contents باید status 400 برگرداند [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/gemini/chat", "headers": null, "json_body": null, "expected_status": 400, "required_fields": ["error"], "json_contains": null}]
  - POST /api/analyze-files با بیش از 10 فایل باید status 400 برگرداند (multer خودش این کار را می‌کند، اما validation اضافی نباید تداخل ایجاد کند) [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/analyze-files", "headers": null, "json_body": null, "expected_status": 400, "required_fields": ["error"], "json_contains": null}]
  - POST /api/gemini/tts با voice نامعتبر (مثلاً 'InvalidVoice') باید status 400 برگرداند [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/gemini/tts", "headers": null, "json_body": null, "expected_status": 400, "required_fields": ["error"], "json_contains": null}]
```

### Step 31: اضافه کردن middleware امنیتی helmet برای تنظیم هدرهای HTTP امنیتی
**Status:** `done` (100%)
**Scope:** این مرحله شامل نصب و پیکربندی کتابخانه helmet (یا معادل آن در فریم‌ورک مورد استفاده) به عنوان middleware در اپلیکیشن است. هدف تنظیم خودکار هدرهای امنیتی مانند X-Content-Type-Options، X-Frame-Options، Strict-Transport-Security و غیره است. خارج از این مرحله: پیکربندی CORS، rate limiting، یا input validation. نکته حیاتی: helmet باید به عنوان اولین middleware در زنجیره middlewareها قرار گیرد تا هدرها برای تمام پاسخ‌ها تنظیم شوند.
**Excerpt:**
```
فقدان security middleware مانند helmet، CORS configuration، rate limiting و input validation باعث آسیب‌پذیری‌های امنیتی جدی می‌شود. برای یک اپلیکیشن که با AI API ارتباط برقرار می‌کند، این موارد حیاتی هستند.
```

### Step 32: افزودن middleware امنیتی helmet به اپلیکیشن Express
**Status:** `done` (100%)
**Scope:** این مرحله شامل نصب کتابخانه helmet، اضافه کردن import آن در فایل backend/server.js، و افزودن app.use(helmet()) به عنوان اولین middleware بعد از ایجاد app و قبل از app.use(cors()) است. خارج از این مرحله: پیکربندی دقیق گزینه‌های helmet (تنظیمات پیش‌فرض استفاده می‌شود)، تغییر در تنظیمات CORS، rate limiting، یا input validation. نکته حیاتی: helmet باید دقیقاً قبل از cors() قرار گیرد تا هدرهای امنیتی برای تمام پاسخ‌ها تنظیم شوند.
**Excerpt:**
```
افزودن middleware امنیتی helmet به اپلیکیشن Express

موقعیت دقیق در پروژه:
- backend/server.js:38-48 — app initialization and middleware setup — این بخش از کد نشان‌دهنده محل فعلی middlewareهاست. helmet باید به عنوان اولین middleware بعد از ایجاد `app` و قبل از `app.use(cors())` اضافه شود.
  ```jsx
  const app = express();
  const PORT = process.env.PORT || 3001;
  
  // Create HTTP server
  const server = createServer(app);
  
  // Create WebSocket server
  const wss = new WebSocketServer({ server, path: '/ws/live' });
  
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  ```
- backend/server.js:1-12 — import statements — import جدید برای helmet باید به این بخش اضافه شود.
  ```jsx
  import express from 'express';
  import cors from 'cors';
  ...
  ```

فایل‌های مرتبط:
- backend/package.json (سطر 10) — برای نصب وابستگی helmet باید در این فایل ثبت شود.
- backend/package-lock.json (سطر 1) — پس از نصب helmet، این فایل به‌روزرسانی می‌شود.
- frontend/vite.config.js (سطر 8) — تنظیمات proxy در Vite ممکن است تحت تأثیر هدرهای امنیتی جدید قرار گیرد.
```

### Step 33: افزودن کتابخانه helmet و پیکربندی middleware امنیتی در backend/server.js
**Status:** `done` (100%)
**Scope:** این مرحله شامل نصب کتابخانه helmet در backend، افزودن import و middleware helmet به فایل backend/server.js قبل از middlewareهای دیگر (cors, express.json) و اطمینان از حضور هدرهای امنیتی X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security در پاسخ‌های HTTP است. خارج از scope این مرحله: تست‌های واحد، linting، type-checking و سایر بخش‌های پروژه.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] کتابخانه helmet در `backend/package.json` به عنوان وابستگی اضافه شده باشد.
- [ ] import helmet در فایل `backend/server.js` در بخش importها (خطوط 1-12) اضافه شده باشد.
- [ ] middleware `app.use(helmet())` به عنوان اولین middleware بعد از ایجاد `app` و قبل از `app.use(cors())` در فایل `backend/server.js` قرار گرفته باشد.
- [ ] هدر `X-Content-Type-Options: nosniff` در پاسخ‌های HTTP سرور (مثلاً GET /api/health) حضور داشته باشد.
- [ ] هدر `X-Frame-Options: SAMEORIGIN` در پاسخ‌های HTTP سرور حضور داشته باشد.
- [ ] هدر `Strict-Transport-Security` در پاسخ‌های HTTP سرور حضور داشته باشد (در صورت استفاده از HTTPS).
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. 1. نصب کتابخانه helmet با دستور `npm install helmet` در پوشه `backend/`.
2. در فایل `backend/server.js`، بعد از خط 46 (ایجاد WebSocket server) و قبل از خط 47 (`app.use(cors())`)، import کتابخانه helmet را اضافه کن: `import helmet from 'helmet';`.
3. بلافاصله بعد از import، خط `app.use(helmet());` را به عنوان اولین middleware اضافه کن تا هدرهای امنیتی مانند X-Content-Type-Options، X-Frame-Options، Strict-Transport-Security برای تمام پاسخ‌ها تنظیم شوند.
4. اطمینان حاصل کن که helmet قبل از `cors()` و `express.json()` قرار گرفته است.
5. تست کن که هدرهای امنیتی در پاسخ‌های HTTP حضور دارند.
```

### Step 34: اضافه کردن middleware helmet به اپلیکیشن Express
**Status:** `done` (100%)
**Scope:** این بخش شامل افزودن import و استفاده از middleware helmet در فایل backend/server.js است. هدف تنظیم هدرهای امنیتی HTTP با استفاده از helmet است. این بخش شامل تغییرات در فایل server.js و نصب پکیج helmet (در صورت نیاز) می‌شود. خارج از scope این بخش: تغییرات در سایر فایل‌ها، پیکربندی خاص helmet (فقط استفاده از پیش‌فرض‌ها)، یا تست‌های مرتبط.
**Excerpt:**
```
## 💡 نمونه‌های قبل/بعد
**اضافه کردن import و middleware helmet**

_قبل:_
```
import express from 'express';
import cors from 'cors';
...
app.use(cors());
app.use(express.json({ limit: '10mb' }));
```

_بعد:_
```
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
...
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.
```

### Step 35: نصب و اعتبارسنجی هدرهای امنیتی Helmet در بک‌اند
**Status:** `done` (100%)
**Scope:** این بخش شامل نصب پکیج helmet در بک‌اند، اجرای تست‌های موجود، و اعتبارسنجی دو هدر امنیتی خاص (X-Content-Type-Options و X-Frame-Options) از طریق curl است. خارج از scope: پیکربندی خاص helmet، تغییر کد، یا تست‌های unit مربوط به هدرها.
**Excerpt:**
```
## 🧪 دستورات اعتبارسنجی
- `cd backend && npm install helmet`
- `cd backend && npm test`
- `curl -I http://localhost:3001/api/health | grep -i 'x-content-type-options'`
- `curl -I http://localhost:3001/api/health | grep -i 'x-frame-options'`
```

### Step 36: پیکربندی CORS middleware برای کنترل دسترسی cross-origin
**Status:** `done` (100%)
**Scope:** این مرحله شامل نصب و پیکربندی middleware CORS (مانند cors در Express) است. باید دامنه‌های مجاز (allow origins)، متدهای مجاز (GET, POST, PUT, DELETE, OPTIONS)، و هدرهای مجاز مشخص شوند. خارج از این مرحله: helmet، rate limiting، یا input validation. نکته حیاتی: برای اپلیکیشنی که با AI API ارتباط دارد، باید originهای خاص (نه wildcard) تعریف شوند و credentials در صورت نیاز فعال شوند.
**Excerpt:**
```
فقدان security middleware مانند helmet، CORS configuration، rate limiting و input validation باعث آسیب‌پذیری‌های امنیتی جدی می‌شود. برای یک اپلیکیشن که با AI API ارتباط برقرار می‌کند، این موارد حیاتی هستند.
```

### Step 37: پیکربندی CORS middleware با originهای خاص در Express
**Status:** `done` (100%)
**Scope:** این مرحله شامل نصب و پیکربندی middleware CORS در فایل backend/server.js است. دامنه‌های مجاز (allow origins) باید به جای wildcard به originهای خاص (FRONTEND_URL از متغیر محیطی) محدود شوند. متدهای مجاز (GET, POST, PUT, DELETE, OPTIONS) و هدرهای مجاز (Content-Type, Authorization) مشخص می‌شوند. credentials در صورت نیاز فعال می‌شوند. خارج از این مرحله: helmet، rate limiting، input validation، و تغییرات در frontend یا deployment.
**Excerpt:**
```
پیکربندی CORS middleware برای کنترل دسترسی cross-origin. این مرحله شامل نصب و پیکربندی middleware CORS (مانند cors در Express یا معادل آن در فریم‌ورک) است. باید دامنه‌های مجاز (allow origins)، متدهای مجاز (GET, POST, PUT, DELETE, OPTIONS)، و هدرهای مجاز مشخص شوند. خارج از این مرحله: helmet، rate limiting، یا input validation. نکته حیاتی: برای اپلیکیشنی که با AI API ارتباط دارد، باید originهای خاص (نه wildcard) تعریف شوند و credentials در صورت نیاز فعال شوند.
```

### Step 38: پیکربندی امن CORS middleware با originهای خاص و پشتیبانی از preflight
**Status:** `done` (100%)
**Scope:** این بخش شامل پیکربندی CORS در backend/server.js برای پشتیبانی از originهای خاص (localhost:5173، localhost:3001، و FRONTEND_URL از متغیر محیطی) با متدها و هدرهای مجاز مشخص، فعال‌سازی credentials، و اطمینان از پاسخ 204 به درخواست‌های OPTIONS است. خارج از scope: نصب پکیج cors (فقط بررسی وجود آن)، تنظیم proxy در frontend/vite.config.js، یا تغییرات در فایل‌های تست. نکته حیاتی: originهای مجاز باید به‌صورت آرایه تعریف شوند و از wildcard استفاده نشود.
**Excerpt:**
```
در فایل backend/server.js خط 47، پیکربندی فعلی `app.use(cors());` را با پیکربندی امن‌تر جایگزین کنیم:
   - origin: آرایه‌ای از originهای مجاز شامل:
     - `http://localhost:5173` (برای توسعه frontend)
     - `http://localhost:3001` (خود backend)
     - دامنه تولیدی (مثلاً از متغیر محیطی `FRONTEND_URL`)
   - methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
   - allowedHeaders: ['Content-Type', 'Authorization']
   - credentials: true (برای ارسال کوکی‌ها/توکن‌ها)
3. اضافه کردن پشتیبانی از preflight requests (OPTIONS) به صورت خودکار توسط cors middleware انجام می‌شود.
4. تنظیم متغیر محیطی FRONTEND_URL در backend/.env.example برای دامنه تولید.
```

### Step 39: پیکربندی CORS با دامنه‌های مجاز و متغیر محیطی FRONTEND_URL
**Status:** `done` (100%)
**Scope:** این بخش شامل دو تغییر است: (1) پیکربندی CORS در backend/server.js با استفاده از آرایه origin شامل localhost و متغیر محیطی FRONTEND_URL، (2) اضافه کردن متغیر FRONTEND_URL به فایل backend/.env.example. سایر فایل‌ها یا تنظیمات امنیتی خارج از این بخش هستند.
**Excerpt:**
```
**پیکربندی CORS در backend/server.js**

_قبل:_
```
app.use(cors());
```

_بعد:_
```
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3001',
    process.env.FRONTEND_URL || 'https://labaneseapp.onrender.com'
  ].filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
```

**اضافه کردن FRONTEND_URL به backend/.env.example**

_قبل:_
```
# Port (optional, default 3001)
PORT=3001
```

_بعد:_
```
# Port (optional, default 3001)
PORT=3001

# Frontend URL for CORS (production)
FRONTEND_URL=https://labaneseapp.onrender.com
```
```

### Step 40: اجرای دستورات اعتبارسنجی CORS و build فرانت‌اند
**Status:** `done` (100%)
**Scope:** این بخش شامل اجرای ۴ دستور اعتبارسنجی است: ۱) بارگذاری ماژول cors در بک‌اند، ۲) تست CORS با Origin مجاز (localhost:5173)، ۳) تست CORS با Origin غیرمجاز (evil.com)، ۴) build فرانت‌اند. این مرحله صرفاً اجرای دستورات است و شامل تغییر کد یا پیکربندی نمی‌شود.
**Excerpt:**
```
## 🧪 دستورات اعتبارسنجی
- `cd backend && node -e "const cors = require('cors'); console.log('cors module loaded');"`
- `cd backend && node server.js & sleep 2 && curl -H "Origin: http://localhost:5173" -I http://localhost:3001/api/health`
- `cd backend && node server.js & sleep 2 && curl -H "Origin: http://evil.com" -I http://localhost:3001/api/health`
- `cd frontend && npm run build && echo 'Frontend build successful'`
```

### Step 41: پیاده‌سازی rate limiting middleware برای جلوگیری از حملات brute force و DoS
**Status:** `done` (100%)
**Scope:** این مرحله شامل نصب و پیکربندی middleware rate limiting (express-rate-limit) است. محدودیت 100 درخواست در 15 دقیقه برای هر IP برای endpointهای عمومی، و محدودیت سخت‌تر برای مسیر حساس /api/auth/login (مثلاً 5 تلاش در 15 دقیقه) تعریف می‌شود. خارج از این مرحله: helmet، CORS، input validation، و WebSocket. نکته حیاتی: rate limiting باید برای endpointهای عمومی و حساس به طور جداگانه پیکربندی شود.
**Excerpt:**
```
فقدان security middleware مانند helmet، CORS configuration، rate limiting و input validation باعث آسیب‌پذیری‌های امنیتی جدی می‌شود. برای یک اپلیکیشن که با AI API ارتباط برقرار می‌کند، این موارد حیاتی هستند.

---

# 🔹 مرحله 3: پیاده‌سازی rate limiting middleware برای جلوگیری از حملات brute force و DoS

**Scope:** این مرحله شامل نصب و پیکربندی middleware rate limiting (مانند express-rate-limit یا معادل آن) است. باید محدودیت تعداد درخواست‌ها در بازه زمانی مشخص (مثلاً 100 درخواست در 15 دقیقه) برای هر IP تعریف شود. همچنین باید مسیرهای حساس مانند /api/auth/login محدودیت سخت‌تری داشته باشند. خارج از این مرحله: helmet، CORS، یا input validation. نکته حیاتی: rate limiting باید برای endpointهای عمومی و حساس به طور جداگانه پیکربندی شود.
**Key terms:** rate limiting, express-rate-limit, brute force, DoS, IP-based limiting, /api/auth/login
```

### Step 42: افزودن rate limiting middleware برای API endpoints با استفاده از express-rate-limit
**Status:** `done` (100%)
**Scope:** این مرحله شامل ایجاد فایل middleware جدید backend/middleware/rateLimiter.js، نصب وابستگی express-rate-limit در backend/package.json، و اعمال rate limiting بر روی endpointهای مشخص شده در backend/server.js است. محدودیت‌ها: POST /api/gemini/chat با 20 req/15min، POST /api/analyze-files با 10 req/15min. WebSocket server (wss) نباید rate limit شود. endpoint /api/auth/login که در حال حاضر وجود ندارد برای توسعه آینده در نظر گرفته می‌شود. frontend/src/App.jsx ممکن است نیاز به handling خطاهای 429 داشته باشد اما این بخش از scope خارج است.
**Excerpt:**
```
افزودن rate limiting middleware برای API endpoints

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/server.js:38-48` — `app definition and middleware setup` — محل فعلی middlewareها. rate limiter عمومی باید بعد از cors() و قبل از routeها اضافه شود. WebSocket server نباید rate limit شود.
  ```jsx
  const app = express();
  const PORT = process.env.PORT || 3001;
  
  // Create HTTP server
  const server = createServer(app);
  
  // Create WebSocket server
  const wss = new WebSocketServer({ server, path: '/ws/live' });
  
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  ```
- `backend/server.js:56-114` — `POST /api/gemini/chat endpoint` — این endpoint با AI API خارجی ارتباط دارد و باید محدودیت 20 req/15min داشته باشد تا از مصرف بیش از حد API key جلوگیری شود.
  ```jsx
  app.post('/api/gemini/chat', async (req, res) => {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }
  
    try {
      const payload = req.body;
      const includeAudio = payload.includeAudio;
      delete payload.includeAudio;
  ```
- `backend/server.js:698-715` — `POST /api/analyze-files endpoint` — این endpoint فایل آپلود می‌کند و منابع سرور را مصرف می‌کند. باید محدودیت 10 req/15min داشته باشد.
  ```jsx
  app.post('/api/analyze-files', upload.array('files', 10), handleMulterError, async (req, res) => {
    console.log('Received file analysis request');
  
    if (!GEMINI_API_KEY) {
      console.error('API key not configured');
      return res.status(500).json({ error: 'API key not configured' });
    }
  
    try {
      const files = req.files || [];
      const textContent = req.body.textContent || '';
      const userInstructions = req.body.userInstructions || '';
  ```
```

### Step 43: پیاده‌سازی Rate Limiting عمومی و اختصاصی برای APIهای backend
**Status:** `done` (100%)
**Scope:** این مرحله شامل نصب پکیج express-rate-limit، ایجاد فایل backend/middleware/rateLimiter.js با configهای عمومی (100 req/15min) و اختصاصی (10 req/15min برای /api/analyze-files)، اعمال rate limiter عمومی روی همه routeهای /api/* در backend/server.js، و اطمینان از عدم تأثیر rate limiting روی WebSocket server در path /ws/live است. خارج از scope: rate limiter برای /api/auth/login (برای آینده ذکر شده)، تست‌ها، linter و type-check (فقط در معیار پذیرش ذکر شده‌اند). نکته حیاتی: WebSocket server باید قبل از middleware rate limiter تعریف شود یا مسیر /ws/live از rate limiting معاف شود.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] rate limiter عمومی (100 req/15min) روی همه routeهای /api/* اعمال شود و headerهای X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset در response موجود باشند
- [ ] بعد از 100 درخواست به /api/health در 15 دقیقه، پاسخ 429 (Too Many Requests) برگردد
- [ ] WebSocket server در path /ws/live تحت تأثیر rate limiting قرار نگیرد و اتصال WebSocket برقرار شود
- [ ] فایل backend/middleware/rateLimiter.js ایجاد شود و configهای rate limiting را export کند
- [ ] endpoint /api/analyze-files محدودیت 10 req/15min داشته باشد و بعد از 10 درخواست خطای 429 برگرداند

## 🪜 مراحل اجرایی پیشنهادی
1. 1. نصب پکیج express-rate-limit با دستور npm install express-rate-limit در backend
2. ایجاد یک فایل جدید backend/middleware/rateLimiter.js برای تعریف configهای rate limiting
3. تعریف rate limiter عمومی: 100 درخواست در 15 دقیقه برای هر IP
4. تعریف rate limiter سخت‌گیرانه برای endpointهای حساس: 5 درخواست در 15 دقیقه برای /api/auth/login (برای آینده)
5. تعریف rate limiter ملایم‌تر برای endpointهای تحلیلی: 20 درخواست در 15 دقیقه برای /api/analyze-files
6. اعمال rate limiter عمومی روی همه routeها در backend/server.js بعد از خط 48 (app.use(cors()))
7. اعمال rate limiter اختصاصی روی routeهای حساس با استفاده از app.use('/api/auth', authLimiter)
8. اطمینان از اینکه WebSocket server (خط 45) تحت تأثیر rate limiting قرار نگیرد
9. اضافه کردن headerهای X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset در response
10. لاگ کردن درخواست‌های rate limited برای مانیتورینگ
```

### Step 44: اعمال rate limiter عمومی و اختصاصی روی routeهای حساس
**Status:** `done` (100%)
**Scope:** این بخش شامل افزودن rate limiter عمومی (100 درخواست/15 دقیقه) برای همه routeها و rate limiter اختصاصی (10 درخواست/15 دقیقه) برای endpoint تحلیل فایل‌ها است. rate limiter احراز هویت (5 درخواست/15 دقیقه) تعریف اما کامنت شده است. خارج از scope: پیاده‌سازی احراز هویت، تغییرات در frontend، یا اعمال rate limiter روی routeهای دیگر. نکته حیاتی: import کتابخانه express-rate-limit باید به فایل backend/server.js اضافه شود.
**Excerpt:**
```
**اعمال rate limiter عمومی روی همه routeها**

_قبل:_
```
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static files from frontend build
app.use(express.static(join(__dirname, '../frontend/dist')));
```

_بعد:_
```
import rateLimit from 'express-rate-limit';

// General rate limiter: 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(generalLimiter);

// Serve static files from frontend build
app.use(express.static(join(__dirname, '../frontend/dist')));
```

**rate limiter اختصاصی برای endpointهای حساس**

_قبل:_
```
// No rate limiting for specific endpoints
```

_بعد:_
```
// Strict rate limiter for auth endpoints (future use)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later.' },
  skipSuccessfulRequests: true
});

// Apply to auth routes (when implemented)
// app.use('/api/auth', authLimiter);

// Moderate rate limiter for analysis endpoints
const analysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many analysis requests, please try again later.' }
});

app.use('/api/analyze-files', analysisLimiter);
```
```

### Step 45: اعتبارسنجی نصب و عملکرد rate limiter و WebSocket
**Status:** `pending` (0%)
**Scope:** این بخش شامل اجرای دستورات خط فرمان برای نصب express-rate-limit، راه‌اندازی سرور، تست محدودیت نرخ (rate limit) با curl و تست اتصال WebSocket است. خارج از این بخش: کدنویسی، پیکربندی، یا تغییر فایل‌ها. نکته حیاتی: دستورات باید به‌ترتیب و در مسیر backend اجرا شوند.
**Excerpt:**
```
## 🧪 دستورات اعتبارسنجی
- `cd backend && npm install express-rate-limit`
- `cd backend && node server.js &`
- `curl -I http://localhost:3001/api/health | grep -i x-ratelimit`
- `for i in $(seq 1 101); do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3001/api/health; done | sort | uniq -c`
- `node -e "const WebSocket = require('ws'); const ws = new WebSocket('ws://localhost:3001/ws/live'); ws.on('open', () => { console.log('WebSocket connected'); ws.close(); }); ws.on('error', (e) => console.error('WS error:', e.message));"`
```

### Step 46: پیاده‌سازی input validation middleware برای تمام ورودی‌های کاربر
**Status:** `pending` (0%)
**Scope:** این مرحله شامل نصب کتابخانه validation (express-validator) و ایجاد middleware اختصاصی برای اعتبارسنجی body، query parameters و URL parameters در تمام routeهای Express است. قوانین validation برای هر endpoint باید در فایل backend/validators/schemas.js تعریف شود. middleware باید قبل از handler اصلی اجرا شود. خارج از این مرحله: helmet، CORS، rate limiting، WebSocket، health check endpoint. نکته حیاتی: validation باید در سطح middleware انجام شود و خطاهای 400 با پیام مناسب برگرداند.
**Excerpt:**
```
فقدان security middleware مانند helmet، CORS configuration، rate limiting و input validation باعث آسیب‌پذیری‌های امنیتی جدی می‌شود. برای یک اپلیکیشن که با AI API ارتباط برقرار می‌کند، این موارد حیاتی هستند.
```

### Step 47: افزودن middleware اعتبارسنجی ورودی با Joi/Zod برای endpointهای اصلی
**Status:** `done` (100%)
**Scope:** این مرحله شامل ایجاد فایل‌های جدید backend/validators/schemas.js و backend/middleware/validate.js، نصب وابستگی zod در backend/package.json، و افزودن middleware اعتبارسنجی به سه endpoint مشخص در backend/server.js (POST /api/gemini/chat، POST /api/gemini/tts، POST /api/analyze-files) است. خارج از این مرحله: validation برای endpointهای GET /api/list-models و GET /api/test-gemini، تغییرات در فرانت‌اند (frontend/src/App.jsx)، و اضافه کردن متغیر محیطی جدید در render.yaml یا .env.example. نکته حیاتی: validation باید در سطح middleware انجام شود و قبل از رسیدن به handler اصلی اجرا گردد.
**Excerpt:**
```
افزودن middleware اعتبارسنجی ورودی با Joi/Zod

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/server.js:56-114` — `POST /api/gemini/chat` — این endpoint payload.contents را بدون validation پردازش می‌کند. نیاز به validation schema برای ساختار contents، role، parts، inline_data
- `backend/server.js:117-164` — `POST /api/gemini/tts` — prompt و voice بدون validation دریافت می‌شوند. voice باید از لیست مجاز باشد و prompt نباید خالی باشد
- `backend/server.js:698-715` — `POST /api/analyze-files` — فایل‌ها و textContent بدون validation دقیق دریافت می‌شوند. نیاز به validation برای تعداد فایل‌ها، نوع MIME، حداکثر طول textContent

## 🧱 پشتهٔ فناوری و معماری
کتابخانه پیشنهادی برای validation: Zod (نسخه 3.x) یا Joi (نسخه 17.x).

## 🔗 فایل‌های مرتبط (Cross-references)
- `backend/package.json` (سطر 10) — نیاز به اضافه کردن وابستگی zod یا joi در dependencies
- فایل‌های جدید backend/validators/schemas.js و backend/middleware/validate.js ایجاد می‌شوند.

## 🔍 Context و وضعیت فعلی
validation باید در سطح middleware انجام شود و قبل از رسیدن به handler اصلی اجرا گردد.
```

### Step 48: پیاده‌سازی اعتبارسنجی ورودی با Zod برای APIهای backend
**Status:** `done` (100%)
**Scope:** این بخش شامل ایجاد فایل‌های backend/validators/schemas.js و backend/middleware/validate.js، نصب کتابخانه Zod، و اعمال middleware validate روی سه endpoint مشخص (chat، tts، analyze-files) در backend/server.js است. همچنین اضافه کردن validation برای query parameters در GET endpoints (api/list-models و api/test-gemini) جزو این بخش است. خارج از scope: تغییر در frontend، تست‌های Python، یا هر فایل دیگری غیر از موارد ذکر شده.
**Excerpt:**
```
## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فایل backend/validators/schemas.js باید شامل schemaهای chatSchema، ttsSchema، analyzeFilesSchema باشد
- [ ] فایل backend/middleware/validate.js باید تابع validate(schema) را export کند که در صورت خطا، پاسخ 400 با پیام خطا برگرداند
- [ ] POST /api/gemini/tts با body خالی یا نامعتبر باید status 400 برگرداند
- [ ] POST /api/gemini/chat با body فاقد contents باید status 400 برگرداند
- [ ] POST /api/analyze-files با بیش از 10 فایل باید status 400 برگرداند (multer خودش این کار را می‌کند، اما validation اضافی نباید تداخل ایجاد کند)
- [ ] POST /api/gemini/tts با voice نامعتبر (مثلاً 'InvalidVoice') باید status 400 برگرداند
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. ۱. نصب کتابخانه Zod (یا Joi) در backend: `npm install zod` در مسیر backend/
۲. ایجاد فایل جدید backend/validators/schemas.js با تمام schemaهای اعتبارسنجی:
   - chatSchema: validation برای POST /api/gemini/chat (بررسی ساختار contents، role، parts، inline_data)
   - ttsSchema: validation برای POST /api/gemini/tts (prompt باید string و voice باید یکی از مقادیر مجاز باشد)
   - analyzeFilesSchema: validation برای POST /api/analyze-files (files باید array با حداکثر ۱۰ آیتم، textContent باید string)
۳. ایجاد فایل backend/middleware/validate.js با middleware تابع validate(schema) که:
   - body، query، params را بر اساس schema بررسی کند
   - در صورت خطا، خطای ۴۰۰ با پیام خطای فارسی برگرداند
۴. import و اعمال middleware روی هر route در backend/server.js:
   - خط ۵۶: app.post('/api/gemini/chat', validate(chatSchema), async (req, res) => {...})
   - خط ۱۱۷: app.post('/api/gemini/tts', validate(ttsSchema), async (req, res) => {...})
   - خط ۶۹۸: app.post('/api/analyze-files', upload.array('files', 10), handleMulterError, validate(analyzeFilesSchema), async (req, res) => {...})
۵. اضافه کردن validation برای query parameters در GET endpoints (api/list-models و api/test-gemini)
۶. تست با ارسال درخواست‌های نامعتبر و بررسی پاسخ ۴۰۰
```

### Step 49: افزودن middleware اعتبارسنجی به endpoint POST /api/gemini/tts
**Status:** `done` (100%)
**Scope:** این بخش صرفاً تغییر endpoint POST /api/gemini/tts در فایل backend/server.js را پوشش می‌دهد: import کردن تابع validate از './middleware/validate.js' و schema ttsSchema از './validators/schemas.js' و اضافه کردن validate(ttsSchema) به عنوان middleware در route. هیچ تغییری در فایل‌های middleware/validate.js یا validators/schemas.js ایجاد نمی‌شود (فرض بر وجود آن‌هاست).
**Excerpt:**
```
**POST /api/gemini/tts - قبل و بعد از اضافه کردن validation**

_قبل:_
```
app.post('/api/gemini/tts', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }
  try {
    const { prompt, voice = 'Kore' } = req.body;
```

_بعد:_
```
import { validate } from './middleware/validate.js';
import { ttsSchema } from './validators/schemas.js';

app.post('/api/gemini/tts', validate(ttsSchema), async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }
  try {
    const { prompt, voice = 'Kore' } = req.body;
```

### Step 50: اعتبارسنجی ماژول zod و middleware validate.js با دو endpoint تستی
**Status:** `done` (100%)
**Scope:** این بخش شامل نصب کتابخانه zod در backend، بارگذاری ماژول middleware/validate.js و اجرای دو درخواست curl برای تست اعتبارسنجی است. endpoint اول (tts) با body خالی باید خطای اعتبارسنجی بدهد و endpoint دوم (chat) با داده نامعتبر باید خطای 400 برگرداند. این بخش فقط دستورات تست را مشخص می‌کند و شامل پیاده‌سازی خود middleware نیست.
**Excerpt:**
```
## 🧪 دستورات اعتبارسنجی
- `cd backend && npm install zod`
- `cd backend && node -e "import('./middleware/validate.js').then(m => console.log('Module loaded'))"`
- `curl -X POST http://localhost:3001/api/gemini/tts -H 'Content-Type: application/json' -d '{}'`
- `curl -X POST http://localhost:3001/api/gemini/chat -H 'Content-Type: application/json' -d '{"invalid": true}'`
```

### Step 51: مدیریت ریسک‌های اعتبارسنجی در endpointهای backend/server.js
**Status:** `pending` (0%)
**Scope:** این بخش به تحلیل ریسک‌های ناشی از اعتبارسنجی سخت‌گیرانه در endpointهای مشخص شده (خطوط ۵۶-۱۱۴، ۱۱۷-۱۶۴، ۶۹۸-۸۰۰) می‌پردازد. شامل بررسی تداخل با middleware multer (خط ۶۸۶-۶۹۵) و اطمینان از سازگاری با proxy Vite (frontend/vite.config.js خط ۸-۱۲) است. همچنین ریسک استفاده از Zod و type inference ناقص را پوشش می‌دهد. خارج از scope: پیاده‌سازی validation یا تغییر کد.
**Excerpt:**
```
## ⚠️ ریسک‌ها و موارد احتیاط
تغییر در backend/server.js خطوط ۵۶-۱۱۴، ۱۱۷-۱۶۴، ۶۹۸-۸۰۰: این endpointها توسط فرانت‌اند (frontend/src/App.jsx) از طریق proxy Vite (frontend/vite.config.js خط ۸-۱۲) call می‌شوند. اگر validation بیش از حد سخت‌گیرانه باشد، درخواست‌های معتبر فرانت‌اند ممکن است با خطای ۴۰۰ مواجه شوند. همچنین، validation نباید با middleware multer (خط ۶۸۶-۶۹۵) تداخل ایجاد کند. ریسک دیگر: اگر از Zod استفاده شود و schemaها به‌درستی type inference را انجام ندهند، ممکن است داده‌های معتبر رد شوند.
```

### Step 52: پیکربندی CORS با دامنه‌های مجاز
**Status:** `done` (100%)
**Scope:** این مرحله شامل پیکربندی CORS middleware در فایل backend/server.js است به گونه‌ای که فقط دامنه‌های مشخص شده در متغیر محیطی CORS_ORIGIN (و همچنین http://localhost:5173 برای توسعه) مجاز به دسترسی باشند. همچنین باید متغیر CORS_ORIGIN در فایل‌های .env.example و render.yaml اضافه شود. این مرحله شامل پیاده‌سازی rate limiting یا input validation نمی‌شود.
**Excerpt:**
```
📋 acceptance_criteria کامل:
  - CORS فقط به دامنه‌های مشخص شده در متغیر محیطی CORS_ORIGIN اجازه دسترسی دهد [verify_method=static] [verify_plan={"grep_patterns": ["CORS", "دامنه", "مشخص", "متغیر", "محیطی", "اجازه", "دسترسی"], "files_hint": []}]
  - درخواست از دامنه‌های دیگر با خطای CORS مواجه شود [verify_method=static] [verify_plan={"grep_patterns": ["CORS", "درخواست", "دامنه", "دیگر", "خطای", "مواجه"], "files_hint": []}]
  - متغیر CORS_ORIGIN در فایل .env.example و render.yaml اضافه شود [verify_method=static] [verify_plan={"grep_patterns": ["example", "render", "متغیر", "فایل", "اضافه"], "files_hint": []}]
```

### Step 53: یادداشت مهم برای مدل اجراکننده — بررسی اولیه و جلوگیری از پیاده‌سازی مجدد
**Status:** `pending` (0%)
**Scope:** این بخش یک یادداشت هشداردهنده برای مدل اجراکننده است که قبل از شروع هر تغییری باید خوانده شود. شامل دستورالعمل‌هایی برای بررسی وجود پیاده‌سازی قبلی، مسئولیت مدل در قبال تشخیص صحیح، و نحوه برخورد با کارهای طولانی است. این بخش خود یک مرحله اجرایی نیست، بلکه یک پیش‌نیاز متدولوژیک برای تمام مراحل بعدی است. هیچ فایل یا کدی در این بخش ذکر نشده که نیاز به تغییر داشته باشد.
**Excerpt:**
```
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است
حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به
آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در
  repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های
  مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط
  موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که
  چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.

🔍 **مسئولیت تو (مدل اجراکننده):**
- پیش از هر تغییر، خودت ساختار repo، فایل‌های ذکرشده، و وابستگی‌های آن‌ها را
  مستقل بررسی کن.
- اگر تشخیص دادی موقعیت ذکرشده در پرامپت اشتباه است یا فایل دیگری مناسب‌تر
  است، بر اساس قضاوت خودت عمل کن — این پرامپت نمی‌تواند بهانهٔ کار اشتباه
  باشد ("خودت گفتی" قابل قبول نیست).
- اگر معیارهای پذیرش (AC) مبهم/ناقص بودند، بهترین تفسیر را انتخاب کن و در
  commit message توضیح بده.

📦 **اگر کار طولانی است:**
- **خلاصه‌اش نکن.** همه را به‌طور کامل انجام بده.
- اگر یک کامیت گنجایش ندارد، در **چندین کامیت متوالی** انجام بده — ولی
  هیچ بخشی را skip نکن.
- ترتیب کامیت‌ها را منطقی نگه‌دار (foundation → core → integration → tests).
- در آخر یک checklist از همه‌ی کامیت‌ها در PR description بنویس.
```

### Step 54: محدود کردن CORS به دامنه‌های مجاز با استفاده از متغیر محیطی
**Status:** `done` (100%)
**Scope:** این مرحله شامل تغییر تنظیمات CORS در backend/server.js از حالت wildcard به حالت محدود با استفاده از متغیر محیطی CORS_ORIGIN است. همچنین شامل افزودن این متغیر به فایل‌های backend/.env.example و render.yaml می‌شود. خارج از scope این مرحله: تغییرات در frontend، تست‌ها، یا سایر تنظیمات امنیتی.
— [merged] این بخش شامل پیاده‌سازی محدودیت CORS در backend/server.js با خواندن متغیر محیطی CORS_ORIGIN است. همچنین شامل افزودن این متغیر به فایل‌های .env.example و render.yaml می‌شود. خارج از scope: پیاده‌سازی تست‌ها، linter، type-check (این‌ها در بخش‌های دیگر پروژه بررسی می‌شوند). نکته حیاتی: مقدار پیش‌فرض باید http://localhost:5173 باشد و در production باید دقیقاً دامنه frontend تنظیم شود.
— [merged] این بخش صرفاً به تغییر کد در فایل backend/server.js برای جایگزینی app.use(cors()) با app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' })) محدود می‌شود. هیچ تغییر دیگری در سایر فایل‌ها یا پیکربندی‌های CORS (مانند middleware یا هدرهای اضافی) در این مرحله انجام نمی‌شود. نکته حیاتی: متغیر محیطی CORS_ORIGIN باید در فایل .env تعریف شده باشد یا مقدار پیش‌فرض localhost:5173 استفاده شود.
**Excerpt:**
```
CORS به صورت wildcard (*) تنظیم شده و هیچ محدودیتی ندارد

- `backend/server.js:47` — `app.use(cors())` — CORS بدون هیچ محدودیتی فعال است
  ```jsx
  app.use(cors());
  ```

- `backend/.env.example` (سطر 1) — فایل env که باید متغیر CORS_ORIGIN به آن اضافه شود
- `render.yaml` (سطر 8) — فایل کانفیگ deployment که باید متغیر محیطی جدید به آن اضافه شود

این تنظیم روی تمام endpointهای backend تأثیر می‌گذارد.

در فایل backend/server.js، خط 47، CORS با مقدار پیش‌فرض (که معادل '*' است) فعال شده است. این بدان معناست که هر دامنه‌ای می‌تواند به API backend درخواست ارسال کند. این یک vulnerability امنیتی است زیرا مهاجمان می‌توانند از دامنه‌های مخرب به API دسترسی پیدا کنند و عملیات‌هایی مانند خواندن داده‌ها، ارسال درخواست‌های مخرب (CSRF) و یا سوءاستفاده از API key را انجام دهند.
```

### Step 55: اجرای دستورات اعتبارسنجی CORS با curl
**Status:** `pending` (0%)
**Scope:** این بخش شامل اجرای دو دستور curl برای اعتبارسنجی تنظیمات CORS است. دستور اول از یک origin مخرب (evil.com) و دستور دوم از origin مجاز (localhost:5173) استفاده می‌کند. خروجی هر دستور باید هدرهای access-control مربوطه را نشان دهد. این مرحله صرفاً اجرای دستورات و مشاهده خروجی است و شامل تغییر کد یا پیکربندی نمی‌شود.
**Excerpt:**
```
## 🧪 دستورات اعتبارسنجی
- `curl -H "Origin: https://evil.com" -I http://localhost:3001/api/health | grep -i access-control`
- `curl -H "Origin: http://localhost:5173" -I http://localhost:3001/api/health | grep -i access-control`
```

### Step 56: اعمال تغییرات یکپارچه‌سازی اعتبارسنجی GEMINI_API_KEY در endpointها بدون شکستن تست‌ها و عبور از linter و type-check
**Status:** `done` (100%)
**Scope:** این مرحله شامل اعمال تغییرات در فایل backend/server.js برای یکپارچه‌سازی اعتبارسنجی GEMINI_API_KEY در endpointها است. تغییرات باید به‌گونه‌ای انجام شوند که تست‌های موجود (در tests/) شکسته نشوند، linter بدون warning عبور کند و type-check موفق باشد. هیچ مرحله‌ای قبلاً انجام نشده و این تسک هفتم از هفت تسک است.
**Excerpt:**
```
تسک 7 از 7
  id: 60221f9c-c1b1-4274-9512-9c022c1dd65c
  عنوان اصلی: یکپارچه‌سازی اعتبارسنجی GEMINI_API_KEY در endpointها
  اولویت اصلی: medium
  وضعیت verify قبلی: pending
  فایل‌های دخیل: backend/server.js

📋 acceptance_criteria کامل:
  - اعمال تغییر بدون شکستن تست‌های موجود [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]
  - linter بدون warning عبور می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["eslint", "lint"], "files_hint": ["backend/server.js"]}]
  - type-check موفق است [verify_method=static] [verify_plan={"grep_patterns": ["tsc", "type-check"], "files_hint": ["backend/server.js"]}]
```

### Step 57: بررسی اولیه و تحلیل پیش از اجرا — یادداشت مهم برای مدل اجراکننده
**Status:** `pending` (0%)
**Scope:** این بخش یک یادداشت هشداردهنده برای مدل اجراکننده است و شامل هیچ دستور اجرایی مستقیمی نیست. هدف آن جلوگیری از پیاده‌سازی مجدد، تشویق به بررسی مستقل repo، و تعیین مسئولیت مدل در تفسیر و اجرای صحیح درخواست است. این بخش هیچ مرحله فنی یا کدنویسی را مشخص نمی‌کند و صرفاً یک راهنمای رفتاری برای مدل است.
**Excerpt:**
```
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.

🔍 **مسئولیت تو (مدل اجراکننده):**
- پیش از هر تغییر، خودت ساختار repo، فایل‌های ذکرشده، و وابستگی‌های آن‌ها را مستقل بررسی کن.
- اگر تشخیص دادی موقعیت ذکرشده در پرامپت اشتباه است یا فایل دیگری مناسب‌تر است، بر اساس قضاوت خودت عمل کن — این پرامپت نمی‌تواند بهانهٔ کار اشتباه باشد ("خودت گفتی" قابل قبول نیست).
- اگر معیارهای پذیرش (AC) مبهم/ناقص بودند، بهترین تفسیر را انتخاب کن و در commit message توضیح بده.

📦 **اگر کار طولانی است:**
- **خلاصه‌اش نکن.** همه را به‌طور کامل انجام بده.
- اگر یک کامیت گنجایش ندارد، در **چندین کامیت متوالی** انجام بده — ولی هیچ بخشی را skip نکن.
- ترتیب کامیت‌ها را منطقی نگه‌دار (foundation → core → integration → tests).
- در آخر یک checklist از همه‌ی کامیت‌ها در PR description بنویس.
```

### Step 58: رفع تکرار اعتبارسنجی GEMINI_API_KEY با middleware اختصاصی
**Status:** `done` (100%)
**Scope:** این مرحله شامل ایجاد یک middleware اختصاصی برای اعتبارسنجی GEMINI_API_KEY در فایل backend/server.js است. تمام endpointهای Gemini (chat, TTS, list-models, test-gemini) باید از این middleware استفاده کنند. کد تکراری موجود در خطوط 57-59, 118-120, 173-175, 196-198 حذف می‌شود. این مرحله فقط به backend/server.js مربوط است و فایل‌های دیگر را تغییر نمی‌دهد.
**Excerpt:**
```
کد تکراری برای اعتبارسنجی GEMINI_API_KEY در چندین endpoint

- `backend/server.js:57-59, 118-120, 173-175, 196-198` — `GEMINI_API_KEY check` — کد تکراری در 4 endpoint
  ```jsx
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }
  ```

این middleware بر تمام endpointهای Gemini تأثیر می‌گذارد.

در backend/server.js، اعتبارسنجی GEMINI_API_KEY در 4 endpoint تکرار شده است: خطوط 57-59 (chat), 118-120 (TTS), 173-175 (list-models), 196-198 (test-gemini). این کد تکراری باعث افزایش حجم کد و کاهش قابلیت نگهداری می‌شود.
```

### Step 59: ایجاد middleware برای اعتبارسنجی GEMINI_API_KEY و افزودن به routeهای مربوطه
**Status:** `done` (100%)
**Scope:** این بخش شامل ایجاد یک middleware جدید برای اعتبارسنجی کلید API گوگل جمینای (GEMINI_API_KEY) و اعمال آن بر روی routeهای backend است. فایل‌های مرتبط شامل backend/middleware/rateLimiter.js (برای الگو) و backend/server.js (برای ثبت middleware) هستند. نکته حیاتی: middleware باید قبل از routeهای هدف اجرا شود و در صورت نامعتبر بودن کلید، خطای مناسب (مثلاً 401 یا 403) برگرداند. این مرحله شامل تغییر در تست‌ها یا فایل‌های config نمی‌شود.
**Excerpt:**
```
1. یک middleware برای اعتبارسنجی GEMINI_API_KEY ایجاد کنید و آن را به routeهای مربوطه اضافه کنید. این کار کد را تمیزتر و نگهداری آن را آسان‌تر می‌کند.
```

### Step 60: ایجاد middleware برای بررسی وجود GEMINI_API_KEY
**Status:** `done` (100%)
**Scope:** این بخش شامل ایجاد یک middleware به نام requireGeminiKey در فایل backend/server.js است که قبل از هندلر مسیر /api/gemini/chat قرار می‌گیرد. middleware باید بررسی کند که متغیر محیطی GEMINI_API_KEY مقداردهی شده باشد و در صورت نبودن، خطای 500 با پیام مناسب برگرداند. خارج از scope این بخش: تغییرات در سایر فایل‌ها، تست‌ها، یا پیکربندی هدرها.
**Excerpt:**
```
**ایجاد middleware**

_قبل:_
```
app.post('/api/gemini/chat', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }
  ...
```

_بعد:_
```
const requireGeminiKey = (req, res, next) => {
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API
```

### Step 61: ریسک‌ها و موارد احتیاط پیش از merge: اجرای تست‌های موجود برای جلوگیری از رگرشن
**Status:** `done` (100%)
**Scope:** این بخش صرفاً یک هشدار/یادآوری است و شامل هیچ کار اجرایی جدیدی نمی‌شود. محتوای آن صرفاً بیانگر نیاز به اجرای تست‌های موجود (که در جای دیگر تعریف شده‌اند) پیش از ادغام (merge) تغییرات است. هیچ مرحله‌ای برای انجام دادن وجود ندارد و این بخش به‌عنوان یک نکته احتیاطی (cautionary note) در نظر گرفته شده است.
**Excerpt:**
```
## ⚠️ ریسک‌ها و موارد احتیاط
پیش از merge، تست‌های موجود اجرا شوند تا رگرشن ایجاد نشود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: refactor
- اولویت: medium
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)
```
