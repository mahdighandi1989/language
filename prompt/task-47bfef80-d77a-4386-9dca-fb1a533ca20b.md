---
task_id: 47bfef80-d77a-4386-9dca-fb1a533ca20b
title: امن‌سازی متغیرهای محیطی
type: bug
priority: critical
execution_priority: 1000
status: pending
external_status: pending
verification_status: pending
watched_id: 6b04f8bd-b562-4fb9-9cd9-0c27458ced59
project: mahdighandi1989/language
created_at: '2026-05-09T07:29:40.376160+00:00'
updated_at: '2026-05-30T07:45:40.110513+00:00'
target_files:
- backend/server.js
- backend/.env.example
---

# امن‌سازی متغیرهای محیطی

## Raw Idea

وجود فایل .env.example نشان‌دهنده استفاده از متغیرهای محیطی است، اما عدم وجود validation، encryption و proper handling این متغیرها خطر امنیتی جدی ایجاد می‌کند. API keys مربوط به Gemini AI و سایر سرویس‌ها در معرض خطر قرار دارند.

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


---

## 📥 درخواست خام کاربر (verbatim — همان متنی که کاربر نوشت)
_(همهٔ URL ها، آدرس‌ها، نام‌ها، و کلمات کلیدی در این متن دست‌نخورده هستند.)_

```
وجود فایل .env.example نشان‌دهنده استفاده از متغیرهای محیطی است، اما عدم وجود validation، encryption و proper handling این متغیرها خطر امنیتی جدی ایجاد می‌کند. API keys مربوط به Gemini AI و سایر سرویس‌ها در معرض خطر قرار دارند.
```

## 📋 چک‌لیست مراحل (3 مرحله)

این تسک به مراحل کوچک‌تر تقسیم شده. **در هر verify خودکار، وضعیت هر مرحله به‌صورت `[ ]` (انجام نشده)، `[~]` (ناقص)، یا `[x]` (انجام شده) به‌روز می‌شود.**
وقتی تمام مراحل `[x]` شدند، تسک به‌طور خودکار به «انجام شده» منتقل می‌شود.

- [ ] **مرحله 1: پیاده‌سازی اعتبارسنجی (Validation) برای تمام متغیرهای محیطی در زمان راه‌اندازی برنامه** — این مرحله شامل ایجاد یک مکانیزم مرکزی برای اعتبارسنجی تمام متغیرهای محیطی (مانند API keys، URLs، و سایر تنظیمات) در زمان startup برنامه است. باید بررسی کند که متغیرهای ضروری وجود دارند، خالی نیستند، و در صورت امکان فرمت صحیح دارند (مثلاً URL معتبر). این مرحله شامل encryption یا handling امنیتی دیگر 
- [ ] **مرحله 2: پیاده‌سازی رمزنگاری (Encryption) برای ذخیره‌سازی امن API keys و متغیرهای حساس** — این مرحله شامل پیاده‌سازی یک مکانیزم برای رمزنگاری متغیرهای محیطی حساس (مانند API keys) در زمان ذخیره‌سازی (مثلاً در فایل .env یا دیتابیس) است. باید از یک الگوریتم رمزنگاری استاندارد (مانند AES-256) استفاده کند. کلید رمزنگاری باید خودش از یک متغیر محیطی دیگر (مانند ENCRYPTION_KEY) خوانده شود. این مر
- [ ] **مرحله 3: پیاده‌سازی مدیریت امن (Proper Handling) برای متغیرهای محیطی شامل لاگینگ امن و خطاهای مناسب** — این مرحله شامل پیاده‌سازی یک لایه مدیریت امن برای متغیرهای محیطی است. این شامل: ۱) هرگز لاگ نکردن مقادیر واقعی API keys یا متغیرهای حساس در console یا فایل‌های لاگ (فقط نشانگرهایی مانند '***' یا '[REDACTED]'). ۲) ارائه خطاهای کاربرپسند و امن که اطلاعات حساس را فاش نکنند. ۳) اطمینان از اینکه متغیرهای

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

## Task Steps

### Step 1: پیاده‌سازی اعتبارسنجی (Validation) برای تمام متغیرهای محیطی در زمان راه‌اندازی برنامه
**Status:** `pending` (0%)
**Scope:** این مرحله شامل ایجاد یک مکانیزم مرکزی برای اعتبارسنجی تمام متغیرهای محیطی (مانند API keys، URLs، و سایر تنظیمات) در زمان startup برنامه است. باید بررسی کند که متغیرهای ضروری وجود دارند، خالی نیستند، و در صورت امکان فرمت صحیح دارند (مثلاً URL معتبر). این مرحله شامل encryption یا handling امنیتی دیگر نمی‌شود. نکته حیاتی: اعتبارسنجی باید fail-fast باشد، یعنی اگر متغیری معتبر نباشد، برنامه با خطای واضح متوقف شود.
**Excerpt:**
```
وجود فایل .env.example نشان‌دهنده استفاده از متغیرهای محیطی است، اما عدم وجود validation، encryption و proper handling این متغیرها خطر امنیتی جدی ایجاد می‌کند. API keys مربوط به Gemini AI و سایر سرویس‌ها در معرض خطر قرار دارند.
```

### Step 2: پیاده‌سازی رمزنگاری (Encryption) برای ذخیره‌سازی امن API keys و متغیرهای حساس
**Status:** `pending` (0%)
**Scope:** این مرحله شامل پیاده‌سازی یک مکانیزم برای رمزنگاری متغیرهای محیطی حساس (مانند API keys) در زمان ذخیره‌سازی (مثلاً در فایل .env یا دیتابیس) است. باید از یک الگوریتم رمزنگاری استاندارد (مانند AES-256) استفاده کند. کلید رمزنگاری باید خودش از یک متغیر محیطی دیگر (مانند ENCRYPTION_KEY) خوانده شود. این مرحله شامل validation یا handling لاگینگ نمی‌شود. نکته حیاتی: کلید رمزنگاری نباید در کد منبع hard-coded شود.
**Excerpt:**
```
وجود فایل .env.example نشان‌دهنده استفاده از متغیرهای محیطی است، اما عدم وجود validation، encryption و proper handling این متغیرها خطر امنیتی جدی ایجاد می‌کند. API keys مربوط به Gemini AI و سایر سرویس‌ها در معرض خطر قرار دارند.
```

### Step 3: پیاده‌سازی مدیریت امن (Proper Handling) برای متغیرهای محیطی شامل لاگینگ امن و خطاهای مناسب
**Status:** `pending` (0%)
**Scope:** این مرحله شامل پیاده‌سازی یک لایه مدیریت امن برای متغیرهای محیطی است. این شامل: ۱) هرگز لاگ نکردن مقادیر واقعی API keys یا متغیرهای حساس در console یا فایل‌های لاگ (فقط نشانگرهایی مانند '***' یا '[REDACTED]'). ۲) ارائه خطاهای کاربرپسند و امن که اطلاعات حساس را فاش نکنند. ۳) اطمینان از اینکه متغیرهای محیطی در حافظه (memory) بیش از حد لازم نگهداری نشوند. این مرحله شامل validation یا encryption نمی‌شود. نکته حیاتی: هیچ متغیر حساسی نباید در stack trace یا error message ظاهر شود.
**Excerpt:**
```
وجود فایل .env.example نشان‌دهنده استفاده از متغیرهای محیطی است، اما عدم وجود validation، encryption و proper handling این متغیرها خطر امنیتی جدی ایجاد می‌کند. API keys مربوط به Gemini AI و سایر سرویس‌ها در معرض خطر قرار دارند.
```
