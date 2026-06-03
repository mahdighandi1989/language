# امنیت برنامه (Security)

این سند جنبه‌های امنیتی برنامه را توضیح می‌دهد: اعتبارسنجی متغیرهای محیطی،
رمزنگاری کلید API، هدرهای امنیتی، CORS، rate limiting، و محدودسازی کلید
Firebase در کنسول. (Security overview: environment validation, API-key
encryption, security headers, CORS, rate limiting, and Firebase API key
restriction.)

## ۱. اعتبارسنجی متغیرهای محیطی (Environment validation)

در زمان راه‌اندازی، `backend/config/validateEnv.js` همه‌ی متغیرهای محیطی
الزامی را بررسی می‌کند و در صورت نامعتبر بودن، با یک پیام `FATAL` واضح و
`process.exit(1)` متوقف می‌شود تا سرور هرگز در حالت ناامن بالا نیاید:

- اگر `GEMINI_API_KEY` تعریف نشده یا فرمت آن نامعتبر باشد (بدون پیشوند
  `AIza`): پیام `FATAL: متغیر محیطی GEMINI_API_KEY معتبر نیست`.
- اگر `PORT` غیرعددی باشد: پیام `FATAL: متغیر محیطی PORT معتبر نیست`.

تابع `validateEnv()` بلافاصله بعد از `dotenv.config()` در
`backend/server.js` فراخوانی می‌شود.

## ۲. رمزنگاری کلید API (AES-256-GCM)

`backend/utils/encryption.js` توابع `encrypt`/`decrypt` را با الگوریتم
احرازشده‌ی `aes-256-gcm` فراهم می‌کند. کلید رمزنگاری **هرگز** در کد
hard-code نمی‌شود و فقط از `process.env.ENCRYPTION_KEY` خوانده می‌شود
(۳۲ بایت = ۶۴ کاراکتر هگز؛ با `openssl rand -hex 32` تولید کنید).

مقدار `GEMINI_API_KEY` می‌تواند به‌صورت رمزنگاری‌شده
(`iv:authTag:ciphertext`) یا plaintext ذخیره شود؛ `decrypt()` هر دو حالت
را به‌صورت شفاف مدیریت می‌کند و کلید در زمان startup از این تابع عبور
می‌کند، نه مستقیم از `process.env`.

## ۳. عدم افشای اسرار در لاگ‌ها و پاسخ‌ها (Secret redaction)

`backend/utils/redact.js` تابع `redactSensitiveData` را فراهم می‌کند که در
`backend/server.js` نیز در دسترس است و هر occurrence از کلید API را در
رشته‌ها با `[REDACTED]` جایگزین می‌کند. هیچ `console.log`/`console.error`،
هیچ پیام `throw new Error`، و هیچ پاسخ API نباید مقدار واقعی کلید (یا
`keyPrefix`) را افشا کند.

## ۴. هدرهای امنیتی، CORS و Rate limiting

- **هدرهای امنیتی:** `app.use(helmet())` به‌عنوان اولین middleware در
  `backend/server.js` (قبل از CORS) اعمال می‌شود و هدرهایی مانند
  `X-Content-Type-Options: nosniff`، `X-Frame-Options: SAMEORIGIN` و
  `Strict-Transport-Security` را تنظیم می‌کند. یک
  `Content-Security-Policy` نرم‌شده در `backend/middleware/security.js`
  اجازه‌ی اتصال SPA به APIهای Gemini و Firebase را می‌دهد.
- **CORS:** فهرست مجاز سخت‌گیرانه (بدون wildcard). originهای تولیدی از
  `CORS_ORIGIN`/`FRONTEND_URL` خوانده می‌شوند و `http://localhost:5173`
  برای توسعه همیشه مجاز است. متدهای مجاز
  `GET, POST, PUT, DELETE, OPTIONS`، هدرهای مجاز `Content-Type` و
  `Authorization`، و `credentials: true`. درخواست از origin غیرمجاز با
  پاسخ `403` رد می‌شود و preflight (`OPTIONS`) پاسخ `204` می‌گیرد.
- **Rate limiting:** `backend/middleware/rateLimiter.js` محدودکننده‌ی
  عمومی (۱۰۰ درخواست / ۱۵ دقیقه) روی همه‌ی `/api/*` و محدودکننده‌ی
  ۱۰ درخواست / ۱۵ دقیقه برای `/api/analyze-files` را export می‌کند؛
  هدرهای `X-RateLimit-Limit/Remaining/Reset` در پاسخ حاضرند و پس از
  عبور از سقف، پاسخ `429` برمی‌گردد. اتصال WebSocket روی `/ws/live`
  (خارج از `/api`) تحت rate limiting قرار نمی‌گیرد.

## ۵. اعتبارسنجی ورودی (Input validation)

`backend/validators/schemas.js` شامل `chatSchema`، `ttsSchema` و
`analyzeFilesSchema` (zod) است و `backend/middleware/validate.js` تابع
`validate(schema)` را export می‌کند که در صورت ورودی نامعتبر پاسخ `400`
با پیام امن برمی‌گرداند.

## ۶. محدودسازی کلید API در Firebase Console (اقدام دستی کاربر)

پیکربندی Firebase در frontend از طریق متغیرهای `VITE_*` تزریق می‌شود و
هیچ credential ای به‌صورت plain text در `frontend/index.html` یا فایل‌های
JS وجود ندارد. با این حال، کلید وب Firebase ذاتاً در bundle سمت کلاینت
قابل مشاهده است؛ بنابراین لایه‌ی دفاعی اصلی، **محدود کردن کلید API در
Firebase Console به دامنه‌ی مجاز** است.

برای اینکه کلید API در Firebase Console محدود به دامنه مجاز شده باشد،
مراحل زیر را در کنسول انجام دهید (این یک اقدام دستی در حساب کاربر است):

1. به Google Cloud Console > **APIs & Services** > **Credentials** بروید
   (همان پروژه‌ی Firebase).
2. کلید وب Firebase (همان `VITE_API_KEY`) را انتخاب کنید.
3. در بخش **Application restrictions**، گزینه‌ی **HTTP referrers (web
   sites)** را فعال کنید.
4. فقط دامنه‌(های) مجاز خود را اضافه کنید، مثلاً:
   - `https://your-production-domain.com/*`
   - `http://localhost:5173/*` (فقط برای توسعه)
5. در بخش **API restrictions**، دسترسی کلید را به APIهای موردنیاز
   (Identity Toolkit / Firebase Auth, Firestore, …) محدود کنید.
6. ذخیره کنید. پس از این تنظیم، کلید فقط از دامنه‌های مجاز کار می‌کند و
   استفاده از آن از دامنه‌های دیگر مسدود می‌شود.

> توجه: این محدودسازی فقط در کنسول کاربر قابل انجام است و در کد قابل
> اعمال نیست؛ کد و مستندات فوق تمام پیش‌نیازهای آن را فراهم کرده‌اند.
