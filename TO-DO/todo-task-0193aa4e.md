---
task_id: task_0193aa4e943f
task_title: "امن‌سازی متغیرهای محیطی: اعتبارسنجی و رمزنگاری"
execution_priority: 1400
created_at: "2026-06-03T00:00:00+00:00"
updated_at: "2026-06-03T00:00:00+00:00"
status: pending
---

# TO-DO — امن‌سازی متغیرهای محیطی و امنیت Firebase

## چرا این فایل ساخته شد

تقریباً تمام این تسک تلفیقی (۷ زیرتسک امنیتی) به‌صورت خودکار در کد و تست
پیاده‌سازی شد (جزئیات در بخش بعد). تنها **یک اقدام** باقی می‌ماند که ذاتاً
**فقط در حساب/کنسول کاربر** قابل انجام است و در کد قابل اعمال نیست:
محدودسازی کلید وب Firebase به دامنه‌های مجاز در Google Cloud / Firebase
Console.

## وضعیت بخش‌های خودکار (انجام‌شده در همین تسک)

- ✅ اعتبارسنجی env: `backend/config/validateEnv.js` + فراخوانی
  `validateEnv()` بعد از `dotenv.config()` در `backend/server.js`
  (تست: `backend/tests/test_validateEnv.js` — ۴ تست سبز).
- ✅ رمزنگاری AES-256-GCM: `backend/utils/encryption.js`
  (`encrypt`/`decrypt`، کلید فقط از `process.env.ENCRYPTION_KEY`).
- ✅ عبور `GEMINI_API_KEY` از `decrypt(process.env.GEMINI_API_KEY)` در
  `backend/server.js`.
- ✅ Redaction اسرار: `backend/utils/redact.js` (`redactSensitiveData`)،
  surface‌شده در `server.js`؛ هیچ کلید واقعی در لاگ/پاسخ/`throw` افشا
  نمی‌شود؛ `keyPrefix` از پاسخ‌ها حذف شد.
- ✅ هدرهای امنیتی (`helmet`) و CORS سخت‌گیرانه بدون wildcard
  (`CORS_ORIGIN`/`FRONTEND_URL` + `localhost:5173`) مستقیماً در
  `backend/server.js`؛ CSP و مترجم CORS→`403` در
  `backend/middleware/security.js` (`applySecurity`).
- ✅ Rate limiting (`backend/middleware/rateLimiter.js`): عمومی
  ۱۰۰/۱۵دقیقه و تحلیل فایل ۱۰/۱۵دقیقه، هدرهای `X-RateLimit-*`.
- ✅ اعتبارسنجی ورودی (`backend/validators/schemas.js` +
  `backend/middleware/validate.js`)؛ احراز هویت Firebase ID token
  (`backend/middleware/firebaseAuth.js`) — درخواست بدون توکن → `401`.
- ✅ حذف credentialهای Firebase از `frontend/index.html`؛ خواندن از
  `import.meta.env.VITE_*` (`frontend/src/firebaseConfig.js`).
- ✅ `.env.example`ها (`backend/.env.example` با `ENCRYPTION_KEY`/
  `CORS_ORIGIN`؛ root `.env.example` با `VITE_*`) و `render.yaml`
  (`CORS_ORIGIN`).
- ✅ مستندات: `docs/security.md` (همهٔ موارد بالا + راهنمای گام‌به‌گام
  مرحلهٔ دستی زیر).

## کارهایی که باید انجام دهی (Manual-required)

### اولویت بالا — محدودسازی کلید Firebase در کنسول

کلید وب Firebase ذاتاً در bundle سمت کلاینت دیده می‌شود؛ لایهٔ دفاعی
اصلی، محدود کردن آن به دامنهٔ مجاز است. این کار فقط در کنسول شما ممکن است:

1. به **Google Cloud Console → APIs & Services → Credentials** بروید
   (همان پروژهٔ Firebase).
2. کلید وب Firebase (همان `VITE_API_KEY`) را انتخاب کنید.
3. در **Application restrictions** گزینهٔ **HTTP referrers (web sites)**
   را فعال کنید.
4. فقط دامنه‌(های) مجاز را اضافه کنید:
   - `https://your-production-domain.com/*`
   - `http://localhost:5173/*` (فقط توسعه)
5. در **API restrictions** کلید را به APIهای موردنیاز (Identity Toolkit/
   Firebase Auth، Firestore، …) محدود کنید.
6. ذخیره کنید.

**خروجی مورد انتظار:** پس از ذخیره، فراخوانی کلید از دامنه‌های غیرمجاز
مسدود می‌شود و فقط از دامنه‌(های) فهرست‌شده کار می‌کند. (راهنمای کامل:
`docs/security.md` بخش ۶.)

## وقتی این کار را تمام کردی

- تنظیمات محدودسازی را در کنسول تأیید کن و در صورت تمایل، تستی از یک دامنهٔ
  غیرمجاز انجام بده تا مسدودسازی را ببینی.
- این فایل را حذف کن و entry مربوطه را از `TO-DO/_index.json` بردار.
