---
task_id: a0dab50d-cbd0-42ef-bcc7-a23f8c846e5f
title: افزودن تست‌های اعتبارسنجی render.yaml
type: docs
priority: low
execution_priority: 4400
status: done
external_status: done
verification_status: done
watched_id: 6b04f8bd-b562-4fb9-9cd9-0c27458ced59
project: mahdighandi1989/language
created_at: '2026-05-23T07:38:10.294582+00:00'
updated_at: '2026-06-04T18:12:20.949432+00:00'
archived: true
archived_at: '2026-06-04T18:12:14.934450+00:00'
target_files:
- backend/pytest.ini
- requirements.txt
- package.json
---

# افزودن تست‌های اعتبارسنجی render.yaml

## Raw Idea

فایل render.yaml شامل deployment configuration برای Render.com است. اگرچه این فایل logic ندارد، اما به عنوان reference برای deployment مهم است. عدم وجود تست برای validation این configuration می‌تواند منجر به خطاهای deployment شود.

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
فایل render.yaml شامل deployment configuration برای Render.com است. اگرچه این فایل logic ندارد، اما به عنوان reference برای deployment مهم است. عدم وجود تست برای validation این configuration می‌تواند منجر به خطاهای deployment شود.
```

## 📋 چک‌لیست مراحل (1 مرحله)

این تسک به مراحل کوچک‌تر تقسیم شده. **در هر verify خودکار، وضعیت هر مرحله به‌صورت `[ ]` (انجام نشده)، `[~]` (ناقص)، یا `[x]` (انجام شده) به‌روز می‌شود.**
وقتی تمام مراحل `[x]` شدند، تسک به‌طور خودکار به «انجام شده» منتقل می‌شود.

- [x] **مرحله 1: نوشتن تست validation برای render.yaml** — این مرحله شامل نوشتن یک تست است که فایل render.yaml را پارس می‌کند و صحت ساختار آن را به‌عنوان deployment configuration برای Render.com بررسی می‌کند. باید YAML را load کرده و وجود کلیدهای ضروری (مثل services، نوع service، runtime، buildCommand، startCommand و envVars در صورت وجود) و معتبر بودن synta

---

# 🔹 مرحله 1: نوشتن تست validation برای render.yaml

**Scope:** این مرحله شامل نوشتن یک تست است که فایل render.yaml را پارس می‌کند و صحت ساختار آن را به‌عنوان deployment configuration برای Render.com بررسی می‌کند. باید YAML را load کرده و وجود کلیدهای ضروری (مثل services، نوع service، runtime، buildCommand، startCommand و envVars در صورت وجود) و معتبر بودن syntax YAML را verify کند. خارج از این مرحله: تغییر دادن منطق deployment، deploy واقعی روی Render.com، یا اضافه کردن feature جدید به اپلیکیشن. نکتهٔ حیاتی: خود render.yaml logic ندارد ولی به‌عنوان reference برای deployment مهم است و عدم وجود تست می‌تواند منجر به deployment errors شود.
**Key terms:** render.yaml, Render.com, deployment configuration, YAML validation

**بخش مربوط از متن کاربر:**
```
فایل render.yaml شامل deployment configuration برای Render.com است. اگرچه این فایل logic ندارد، اما به عنوان reference برای deployment مهم است. عدم وجود تست برای validation این configuration می‌تواند منجر به خطاهای deployment شود.
```

## 🎯 هدف (خلاصه ساختاریافته)
افزودن تست validation برای render.yaml deployment config

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/pytest.ini:1-6` — `pytest config` — پیکربندی pytest پروژه — testpaths=tests و python_files=test_*.py یعنی فایل تست جدید باید نام test_render_yaml.py در فولدر tests/ داشته باشد تا توسط pytest کشف شود.
  ```
  [pytest]
  testpaths = tests
  python_files = test_*.py
  python_classes = Test*
  python_functions = test_*
  addopts = -ra
  ```
- `requirements.txt:1-6` — `test tooling deps` — اینجا باید PyYAML اضافه شود؛ فعلاً هیچ YAML parser در dependencies نیست و تست بدون آن نمی‌تواند render.yaml را load کند.
  ```
  # Python test tooling for the backend.
  # The backend runtime is Node/Express; these packages power the pytest suite
  # that boots the real server and exercises it (see tests/ and backend/tests/).
  pytest>=8.0
  pytest-cov>=5.0
  pytest-mock>=3.14
  ```
- `package.json:11-13` — `deps:check script` — اسکریپت deps:check نشان می‌دهد تست‌های validation موجود در tests/ ریشه با pytest اجرا می‌شوند — تست جدید render.yaml نیز در همان فولدر و با همان ابزار اجرا خواهد شد. این فایل deep-read نشده — مجری باید مسیر را خود تأیید کند.
  ```json
  "audit:ci": "npm audit --omit=dev --audit-level=critical || true",
      "deps:check": "npm ci && python -m pytest tests/test_dependency_consistency.py"
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Stack: Node/Express backend + React (Vite) frontend؛ test tooling برای backend = Python pytest (pytest>=8.0, pytest-cov, pytest-mock طبق requirements.txt). برای این تسک نیاز به PyYAML جهت پارس render.yaml. هیچ کتابخانهٔ JS برای این validation لازم نیست.

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `conftest.py` (سطر 1) — conftest ریشه که fixtureها و مسیر import را برای pytest suite ریشه فراهم می‌کند؛ تست جدید tests/test_render_yaml.py تحت همین conftest اجرا می‌شود.
- `backend/tests/test_validateEnv.js` (سطر 1) — نمونهٔ موجود تست validation در پروژه (اعتبارسنجی env)؛ به‌عنوان الگوی سبک تست validation قابل ارجاع است.
- `backend/pytest.ini` (سطر 1) — پیکربندی discovery تست‌ها؛ نام و محل فایل تست جدید باید با testpaths و python_files آن سازگار باشد.

## 🌐 نقشهٔ وابستگی‌ها
این تسک به infrastructure تست Python پروژه متصل است نه به کد runtime (Node/Express). فایل `backend/pytest.ini` قواعد discovery (testpaths=tests, python_files=test_*.py) را تعیین می‌کند و فایل تست جدید باید با آن منطبق باشد. `requirements.txt` ریشه فهرست dependencyهای تست (pytest, pytest-cov, pytest-mock) را دارد و باید PyYAML به آن افزوده شود چون هیچ YAML parser موجود نیست. اسکریپت `deps:check` در `package.json` ریشه (`python -m pytest tests/test_dependency_consistency.py`) نشان می‌دهد تست‌های validation در فولدر tests/ ریشه اجرا می‌شوند؛ پس test_render_yaml.py نیز در همان مسیر قرار می‌گیرد. `conftest.py` ریشه نیز روی این تست اثر دارد چون fixtures و sys.path را برای pytest فراهم می‌کند. هیچ‌یک از فایل‌های runtime backend (server.js, services/*) تحت تأثیر این تغییر قرار نمی‌گیرند چون تست صرفاً یک فایل config را پارس می‌کند.

## 🔍 Context و وضعیت فعلی
هدف این تسک نوشتن یک تست خودکار است که فایل `render.yaml` (deployment configuration برای Render.com) را پارس کرده و صحت ساختار آن را verify کند. طبق درخواست کاربر: فایل render.yaml شامل deployment configuration برای Render.com است؛ اگرچه این فایل logic ندارد، اما به‌عنوان reference برای deployment مهم است و عدم وجود تست برای validation این configuration می‌تواند منجر به خطاهای deployment (deployment errors) شود. تست باید YAML را load کرده و موارد زیر را بررسی کند: (۱) معتبر بودن syntax YAML، (۲) وجود کلیدهای ضروری مانند `services`، نوع service (`type`)، `runtime`/`env`، `buildCommand`، `startCommand` و `envVars` (در صورت وجود). کلیدواژه‌های اصلی: render.yaml, Render.com, deployment configuration, YAML validation. خارج از scope این تسک: تغییر دادن منطق deployment، deploy واقعی روی Render.com، یا اضافه کردن feature جدید به اپلیکیشن. 

از نظر grounding در کد واقعی پروژه: این repository یک suite تست Python مبتنی بر pytest دارد که در `backend/pytest.ini` پیکربندی شده (testpaths=tests, python_files=test_*.py) و `requirements.txt` ریشه شامل `pytest>=8.0`, `pytest-cov>=5.0`, `pytest-mock>=3.14` است. الگوی موجود تست‌های validation در پروژه را می‌توان از `backend/tests/test_validateEnv.js` و کامیت اخیر `505d05c chore(prompt): sync task ... — افزودن تست‌های اعتبارسنجی render.yaml` دید — یعنی این کار با رویکرد تست‌محور پروژه همخوان است. توجه: فایل `render.yaml` و فولدر `tests/` ریشه در «محتوای فایل‌های کلیدی» deep-read نشده‌اند؛ مجری باید ابتدا وجود/مسیر دقیق `render.yaml` را تأیید کند (ممکن است در ریشه یا backend/ باشد) و اگر وجود نداشت، تست باید آن را با skip شفاف یا یک fixture نمونه مدیریت کند. برای پارس YAML در Python نیاز به `PyYAML` است که در `requirements.txt` فعلی نیست و باید اضافه شود.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فایل تست tests/test_render_yaml.py ایجاد شده و شامل توابع تست با prefix test_ است (سازگار با python_functions=test_* در backend/pytest.ini).
- [ ] PyYAML به requirements.txt ریشه اضافه شده است.
- [ ] تست syntax معتبر YAML و وجود کلید services را با yaml.safe_load بررسی می‌کند.
- [ ] تست وجود کلیدهای ضروری service (type, buildCommand, startCommand, runtime/env) را verify می‌کند.
- [ ] اجرای python -m pytest tests/test_render_yaml.py بدون خطا (سبز یا skip شفاف در نبود فایل) تمام می‌شود.
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. ۱) ابتدا وجود و مسیر دقیق فایل `render.yaml` را تأیید کن (ریشهٔ ریپو یا `backend/`). اگر وجود ندارد، آن را به‌عنوان بخشی از این تسک نساز مگر اینکه scope اجازه دهد — در غیر این صورت تست را طوری بنویس که در نبود فایل به‌طور شفاف `pytest.skip` کند.
۲) `PyYAML` را به `requirements.txt` ریشه اضافه کن (مثلاً `PyYAML>=6.0`) چون فعلاً فقط pytest/pytest-cov/pytest-mock موجود است و YAML parser وجود ندارد.
۳) یک فایل تست جدید بساز: `tests/test_render_yaml.py` (هم‌راستا با `backend/pytest.ini` که `testpaths=tests` و `python_files=test_*.py` دارد و conftest.py ریشه موجود است).
۴) در تست: مسیر `render.yaml` را resolve کن، فایل را با `yaml.safe_load` بخوان (assert اینکه syntax معتبر است و exception نمی‌دهد)، سپس assert کن که کلید `services` وجود دارد و یک list غیرخالی است؛ برای هر service وجود کلیدهای ضروری (`type`, `runtime` یا `env`, `buildCommand`, `startCommand`) را بررسی کن؛ و اگر `envVars` موجود بود، ساختار آن (list از dictهای دارای `key`) را verify کن.
۵) تست را با `python -m pytest tests/test_render_yaml.py` اجرا کن و مطمئن شو سبز می‌شود. این رویکرد با pattern موجود `npm run deps:check` که از pytest استفاده می‌کند سازگار است.

## 💡 نمونه‌های قبل/بعد
**افزودن PyYAML به requirements.txt**

_قبل:_
```
pytest>=8.0
pytest-cov>=5.0
pytest-mock>=3.14
```

_بعد:_
```
pytest>=8.0
pytest-cov>=5.0
pytest-mock>=3.14
PyYAML>=6.0
```

**تست جدید tests/test_render_yaml.py**

_قبل:_
```
(فایلی وجود ندارد)
```

_بعد:_
```
import os
import yaml
import pytest

REPO_ROOT = os.path.dirname(os.path.abspath(__file__)) + '/..'
RENDER_YAML = os.path.join(REPO_ROOT, 'render.yaml')


def _load():
    if not os.path.exists(RENDER_YAML):
        pytest.skip('render.yaml not found at repo root')
    with open(RENDER_YAML, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)


def test_render_yaml_is_valid_yaml():
    data = _load()
    assert isinstance(data, dict), 'render.yaml must parse to a mapping'


def test_render_yaml_has_services():
    data = _load()
    assert 'services' in data, 'render.yaml must define services'
    assert isinstance(data['services'], list) and data['services'], 'services must be a non-empty list'


def test_each_service_has_required_keys():
    data = _load()
    for svc in data['services']:
        assert 'type' in svc, f'service missing type: {svc}'
        assert ('runtime' in svc) or ('env' in svc), f'service missing runtime/env: {svc}'
        assert 'buildCommand' in svc, f'service missing buildCommand: {svc}'
        assert 'startCommand' in svc, f'service missing startCommand: {svc}'


def test_env_vars_structure_when_present():
    data = _load()
    for svc in data['services']:
        if 'envVars' in svc:
            assert isinstance(svc['envVars'], list)
            for ev in svc['envVars']:
                assert 'key' in ev, f'envVar missing key: {ev}'
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pip install -r requirements.txt`
- `python -m pytest tests/test_render_yaml.py -v`

## ⚠️ ریسک‌ها و موارد احتیاط
ریسک اصلی: فایل `render.yaml` ممکن است اصلاً در ریپو وجود نداشته باشد یا در مسیر متفاوتی (ریشه vs backend/) باشد — در «ساختار کامل پروژه» فهرست‌شده نیست، پس تست باید با pytest.skip در نبود فایل، fail نشود. ریسک دوم: schema واقعی render.yaml ممکن است از کلیدهای camelCase (buildCommand/startCommand) یا snake_case یا فرمت جدید Render (runtime به‌جای env) استفاده کند؛ assertها باید با schema واقعی فایل تطبیق داده شوند تا false-negative ندهند. ریسک سوم: افزودن PyYAML به requirements.txt روی pipeline `deps:check` و CI workflow `.github/workflows/claude-auto-task.yml` که `npm ci && python -m pytest` اجرا می‌کنند اثر می‌گذارد — باید مطمئن شد نصب dependency جدید build را نمی‌شکند.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: docs
- اولویت: low
- تخمین زمان: small

---

## ✅ معیارهای پذیرش کلی (همهٔ مراحل)
- [ ] {'text': 'فایل تست tests/test_render_yaml.py ایجاد شده و شامل توابع تست با prefix test_ است (سازگار با python_functions=test_* در backend/pytest.ini).', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['def test_render_yaml', 'yaml.safe_load', 'services'], 'files_hint': ['tests/test_render_yaml.py']}}
- [ ] {'text': 'PyYAML به requirements.txt ریشه اضافه شده است.', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['PyYAML', 'pyyaml'], 'files_hint': ['requirements.txt']}}
- [ ] {'text': 'تست syntax معتبر YAML و وجود کلید services را با yaml.safe_load بررسی می\u200cکند.', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['safe_load', "'services'", 'assert'], 'files_hint': ['tests/test_render_yaml.py']}}
- [ ] {'text': 'تست وجود کلیدهای ضروری service (type, buildCommand, startCommand, runtime/env) را verify می\u200cکند.', 'verify_method': 'static', 'verify_plan': {'grep_patterns': ['buildCommand', 'startCommand', 'type'], 'files_hint': ['tests/test_render_yaml.py']}}
- [ ] {'text': 'اجرای python -m pytest tests/test_render_yaml.py بدون خطا (سبز یا skip شفاف در نبود فایل) تمام می\u200cشود.', 'verify_method': 'backend_test', 'verify_plan': {'test_path': 'tests/test_render_yaml.py', 'marker': 'verify'}}

## Acceptance Criteria

1. فایل تست tests/test_render_yaml.py ایجاد شده و شامل توابع تست با prefix test_ است (سازگار با python_functions=test_* در backend/pytest.ini). _(verify: static)_
2. PyYAML به requirements.txt ریشه اضافه شده است. _(verify: static)_
3. تست syntax معتبر YAML و وجود کلید services را با yaml.safe_load بررسی می‌کند. _(verify: static)_
4. تست وجود کلیدهای ضروری service (type, buildCommand, startCommand, runtime/env) را verify می‌کند. _(verify: static)_
5. اجرای python -m pytest tests/test_render_yaml.py بدون خطا (سبز یا skip شفاف در نبود فایل) تمام می‌شود. _(verify: backend_test)_

## Task Steps

### Step 1: نوشتن تست validation برای render.yaml
**Status:** `done` (100%)
**Scope:** این مرحله شامل نوشتن یک تست است که فایل render.yaml را پارس می‌کند و صحت ساختار آن را به‌عنوان deployment configuration برای Render.com بررسی می‌کند. باید YAML را load کرده و وجود کلیدهای ضروری (مثل services، نوع service، runtime، buildCommand، startCommand و envVars در صورت وجود) و معتبر بودن syntax YAML را verify کند. خارج از این مرحله: تغییر دادن منطق deployment، deploy واقعی روی Render.com، یا اضافه کردن feature جدید به اپلیکیشن. نکتهٔ حیاتی: خود render.yaml logic ندارد ولی به‌عنوان reference برای deployment مهم است و عدم وجود تست می‌تواند منجر به deployment errors شود.
**Excerpt:**
```
فایل render.yaml شامل deployment configuration برای Render.com است. اگرچه این فایل logic ندارد، اما به عنوان reference برای deployment مهم است. عدم وجود تست برای validation این configuration می‌تواند منجر به خطاهای deployment شود.
```
