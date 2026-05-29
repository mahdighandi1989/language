---
task_id: cf9e7da4-37c4-463e-99dd-bd6707edcce3
title: انتقال Firebase credentials به متغیرهای محیطی
type: security
priority: critical
execution_priority: 1300
status: awaiting_review
external_status: pending
verification_status: partial
watched_id: 6b04f8bd-b562-4fb9-9cd9-0c27458ced59
project: mahdighandi1989/language
created_at: '2026-05-16T07:39:58.690012+00:00'
updated_at: '2026-05-29T20:15:39.172090+00:00'
target_files:
- frontend/index.html
---

# انتقال Firebase credentials به متغیرهای محیطی

## Raw Idea

در frontend/index.html خطوط 11-18، Firebase configuration شامل apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId به صورت plain text در یک تگ script قرار دارد. این اطلاعات حساس به راحتی توسط هر بازدیدکننده‌ای قابل مشاهده است. اگرچه apiKey Firebase ذاتاً برای استفاده client-side طراحی شده، اما همراه با سایر اطلاعات (projectId, storageBucket) می‌تواند برای سوءاستفاده‌های محدود استفاده شود. همچنین این اطلاعات در GitHub عمومی (مشخصات ریپو: mahdighandi1989/language) قرار دارد.
---
[scan #2 at 2026-05-16T07:39:58.697704+00:00]
در frontend/index.html خطوط 11-18، Firebase configuration شامل apiKey، authDomain، projectId، storageBucket و appId به صورت plain text در کد HTML قرار گرفته است. این اطلاعات حساس در معرض دید همه کاربران قرار دارد و امکان سوءاستفاده از سرویس Firebase را فراهم می‌کند. همچنین در frontend/src/App.jsx خط

## Prompt

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

## Acceptance Criteria

1. هیچ credential Firebase در index.html وجود نداشته باشد _(verify: static)_
2. تمامی credentials از متغیرهای محیطی VITE_ خوانده شوند _(verify: static)_
3. فایل .env.example با placeholderها ایجاد شود _(verify: static)_
4. اپلیکیشن بعد از تغییرات بدون خطا initialize شود _(verify: ui_interaction)_
