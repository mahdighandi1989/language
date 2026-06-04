---
task_id: task_78af588c4541
title: مدیریت وابستگی‌ها و بازآرایی کد بک‌اند
type: other
priority: high
execution_priority: 2450
status: pending
external_status: claimed
verification_status: partial
watched_id: 6b04f8bd-b562-4fb9-9cd9-0c27458ced59
project: mahdighandi1989/language
created_at: '2026-06-01T19:20:22.192691+00:00'
updated_at: '2026-06-04T17:09:59.164151+00:00'
tags:
- consolidated
- post_verify_merge
---

# مدیریت وابستگی‌ها و بازآرایی کد بک‌اند

## Raw Idea

🧬 این یک تسک تلفیقی است — از 3 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این تسک‌ها به بهبود ساختار و پایداری بک‌اند، به ویژه فایل مرکزی server.js و مدیریت وابستگی‌های پروژه در package.json، می‌پردازند. این اقدامات برای نگهداری و توسعه آینده ضروری هستند.
🎯 theme: بازسازی و بهینه‌سازی ساختار کد بک‌اند، با تمرکز بر فایل server.js و مدیریت وابستگی‌های پروژه.
💎 estimated_difficulty: medium

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 3
  id: f921cce0-892b-4da2-b499-b9db9b2f27f0
  عنوان اصلی: Update backend package.json dependencies
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: backend/package.json

📋 acceptance_criteria کامل:
  - npm install installs fluent-ffmpeg, ffmpeg-static, and multer [verify_method=static] [verify_plan={"grep_patterns": ["\"fluent-ffmpeg\"", "\"ffmpeg-static\"", "\"multer\""], "files_hint": ["backend/package.json"]}]
  - Backend starts without module not found errors [verify_method=backend_test] [verify_plan={"test_node": "tests/test_backend_startup.py::test_no_module_not_found_errors", "timeout_seconds": 30}]
  - Audio processing endpoints work correctly [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/audio/process", "headers": null, "json_body": null, "expected_status": 200, "required_fields": ["status", "result"], "json_contains": null}]

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
Backend package.json missing several runtime dependencies declared in imports

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/package.json:1-15` — `dependencies` — Missing fluent-ffmpeg, ffmpeg-static, and multer
  ```json
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "ws": "^8.19.0"
  }
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Node.js backend with Express, audio processing via ffmpeg

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `backend/server.js` (سطر 8) — Imports and uses all missing dependencies

## 🌐 نقشهٔ وابستگی‌ها
Missing dependencies will cause runtime crashes when audio/file processing features are used.

## 🔍 Context و وضعیت فعلی
The backend/package.json (from package-lock.json lines 10-14) only lists dependencies: cors, dotenv, express, and ws. However, backend/server.js imports several additional packages that are not declared as dependencies: multer (line 8), fs (line 9 - built-in, OK), os (line 10 - built-in, OK), ffmpeg (line 11 - fluent-ffmpeg), ffmpeg-static (line 12). The 'fluent-ffmpeg' and 'ffmpeg-static' packages are critical for audio processing functionality but are missing from package.json. This means npm install will not install them, causing runtime errors when audio features are used. The package-lock.json confirms these are not in the dependency tree.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] npm install installs fluent-ffmpeg, ffmpeg-static, and multer
- [ ] Backend starts without module not found errors
- [ ] Audio processing endpoints work correctly
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. Add 'fluent-ffmpeg' and 'ffmpeg-static' to backend/package.json dependencies. Also add 'multer' if it's not already there (it's imported but not in the listed dependencies). Run npm install to update package-lock.json.

## 💡 نمونه‌های قبل/بعد
**Add missing dependencies**

_قبل:_
```
"dependencies": {
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "express": "^4.18.2",
  "ws": "^8.19.0"
}
```

_بعد:_
```
"dependencies": {
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "express": "^4.18.2",
  "fluent-ffmpeg": "^2.1.2",
  "ffmpeg-static": "^5.2.0",
  "multer": "^1.4.5-lts.1",
  "ws": "^8.19.0"
}
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `cd backend && npm ls fluent-ffmpeg`
- `cd backend && npm ls ffmpeg-static`
- `cd backend && npm ls multer`

## ⚠️ ریسک‌ها و موارد احتیاط
Low risk; adding missing dependencies only fixes runtime errors

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: bug
- اولویت: high
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 2 از 3
  id: 29816f08-1985-4c0b-960d-8c99039fd3d6
  عنوان اصلی: بازسازی server.js: رفع قطعی، انتقال مسیرها
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: backend/server.js

📋 acceptance_criteria کامل:
  - فایل server.js کمتر از 300 خط شود [verify_method=static] [verify_plan={"grep_patterns": [], "files_hint": ["backend/server.js"]}]
  - همه routeها به فایل‌های جداگانه منتقل شوند [verify_method=static] [verify_plan={"grep_patterns": ["require\\(.*routes", "app\\.use\\(.*routes", "import.*router"], "files_hint": ["backend/server.js", "backend/routes/"]}]
  - برنامه بعد از refactoring بدون خطا اجرا شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_server_startup.py::test_server_starts", "timeout_seconds": 30}]

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
فایل backend/server.js در خط 400 قطع شده و ادامه فایل (شامل endpointهای تحلیل فایل) ناقص است

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/server.js:1-1403` — `کل فایل` — فایل بسیار بزرگ با 1403 خط
  ```jsx
  ... [TRUNCATED at line 400 of 1403]
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Node.js + Express + ES Modules

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `backend/server.js` (سطر 1) — فایل اصلی که باید refactor شود
- `backend/package.json` (سطر 1) — برای اضافه کردن ماژول‌های جدید

## 🌐 نقشهٔ وابستگی‌ها
این فایل شامل تمام منطق backend است: chat, TTS, file analysis, health check, model listing.

## 🔍 Context و وضعیت فعلی
محتوای فایل backend/server.js در خط 400 با علامت [TRUNCATED] قطع شده است. این فایل 1403 خط دارد و بخش‌های مهمی مانند endpointهای تحلیل فایل (file analysis API) که از خط 242 شروع شده‌اند، کامل نمایش داده نشده‌اند. این می‌تواند نشان‌دهنده این باشد که فایل بسیار بزرگ است و نیاز به refactoring به ماژول‌های کوچک‌تر دارد. همچنین احتمال دارد که برخی از این endpointها ناقص یا دارای bug باشند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فایل server.js کمتر از 300 خط شود
- [ ] همه routeها به فایل‌های جداگانه منتقل شوند
- [ ] برنامه بعد از refactoring بدون خطا اجرا شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. فایل backend/server.js را به ماژول‌های کوچک‌تر تقسیم کنید: routes/chat.js, routes/tts.js, routes/fileAnalysis.js, services/gemini.js, services/upload.js. این کار خوانایی، تست‌پذیری و نگهداری کد را بهبود می‌بخشد. همچنین از فایل‌های خیلی بزرگ (بیش از 500 خط) جلوگیری می‌کند.

## 💡 نمونه‌های قبل/بعد
**ساختار ماژولار**

_قبل:_
```
backend/server.js (1403 lines)
```

_بعد:_
```
backend/
  server.js (import routes)
  routes/
    chat.js
    tts.js
    fileAnalysis.js
  services/
    gemini.js
    upload.js
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `اجرای npm start و تست endpointهای اصلی`
- `اجرای linter برای بررسی ساختار`

## ⚠️ ریسک‌ها و موارد احتیاط
Refactoring ممکن است باعث شکستن importها و مسیرها شود. نیاز به تست کامل بعد از تغییرات.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: other
- اولویت: medium
- تخمین زمان: large

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 3 از 3
  id: dd2427f0-2f36-4f38-82f1-94e419c20d77
  عنوان اصلی: یکپارچه‌سازی dependency در ریشه و زیرپروژه‌ها
  اولویت اصلی: medium
  وضعیت verify قبلی: pending
  فایل‌های دخیل: package.json

📋 acceptance_criteria کامل:
  - اعمال تغییر بدون شکستن تست‌های موجود [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]
  - linter بدون warning عبور می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["no warnings", "lint"], "files_hint": ["backend/", "frontend/"]}]
  - type-check موفق است [verify_method=static] [verify_plan={"grep_patterns": ["type-check", "tsc"], "files_hint": ["backend/", "frontend/"]}]

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
فایل‌های dependency package-lock.json و package.json در ریشه و frontend/backend تکراری و ناهماهنگ هستند

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `package.json:1-15` — `package.json ریشه`
  ```json
  {
    "name": "lebanese-dialect-learning",
    "version": "1.0.0",
    "description": "Lebanese Arabic Learning App with AI",
    "scripts": {
      "install:all": "
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🔍 Context و وضعیت فعلی
سه فایل package.json و سه فایل package-lock.json در پروژه وجود دارد: یکی در ریشه (package.json و package-lock.json)، یکی در backend/ و یکی در frontend/. package.json ریشه فقط اسکریپت‌های orchestration دارد (install:all, dev, build, start) اما وابستگی‌های خود را تعریف نکرده است. این ساختار باعث می‌شود که npm install در ریشه هیچ وابستگی‌ای نصب نکند و کاربر مجبور باشد به‌صورت دستی به backend و frontend برود. همچنین package-lock.json ریشه با package-lock.json frontend همپوشانی دارد (هر دو firebase, react, lucide-react را لیست کرده‌اند).

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] اعمال تغییر بدون شکستن تست‌های موجود
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. package.json ریشه را به‌عنوان یک workspace تعریف کنید تا npm install در ریشه تمام وابستگی‌های زیرپروژه‌ها را نصب کند. از npm workspaces استفاده کنید. همچنین package-lock.json ریشه را حذف کنید و اجازه دهید npm workspace یک lockfile واحد در ریشه ایجاد کند.

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
- در commit message: `merged-from: f921cce0-892b-4da2-b499-b9db9b2f27f0, 29816f08-1985-4c0b-960d-8c99039fd3d6, dd2427f0-2f36-4f38-82f1-94e419c20d77`
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

🧬 این یک تسک تلفیقی است — از 3 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این تسک‌ها به بهبود ساختار و پایداری بک‌اند، به ویژه فایل مرکزی server.js و مدیریت وابستگی‌های پروژه در package.json، می‌پردازند. این اقدامات برای نگهداری و توسعه آینده ضروری هستند.
🎯 theme: بازسازی و بهینه‌سازی ساختار کد بک‌اند، با تمرکز بر فایل server.js و مدیریت وابستگی‌های پروژه.
💎 estimated_difficulty: medium

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 3
  id: f921cce0-892b-4da2-b499-b9db9b2f27f0
  عنوان اصلی: Update backend package.json dependencies
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: backend/package.json

📋 acceptance_criteria کامل:
  - npm install installs fluent-ffmpeg, ffmpeg-static, and multer [verify_method=static] [verify_plan={"grep_patterns": ["\"fluent-ffmpeg\"", "\"ffmpeg-static\"", "\"multer\""], "files_hint": ["backend/package.json"]}]
  - Backend starts without module not found errors [verify_method=backend_test] [verify_plan={"test_node": "tests/test_backend_startup.py::test_no_module_not_found_errors", "timeout_seconds": 30}]
  - Audio processing endpoints work correctly [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/audio/process", "headers": null, "json_body": null, "expected_status": 200, "required_fields": ["status", "result"], "json_contains": null}]

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
Backend package.json missing several runtime dependencies declared in imports

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/package.json:1-15` — `dependencies` — Missing fluent-ffmpeg, ffmpeg-static, and multer
  ```json
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "ws": "^8.19.0"
  }
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Node.js backend with Express, audio processing via ffmpeg

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `backend/server.js` (سطر 8) — Imports and uses all missing dependencies

## 🌐 نقشهٔ وابستگی‌ها
Missing dependencies will cause runtime crashes when audio/file processing features are used.

## 🔍 Context و وضعیت فعلی
The backend/package.json (from package-lock.json lines 10-14) only lists dependencies: cors, dotenv, express, and ws. However, backend/server.js imports several additional packages that are not declared as dependencies: multer (line 8), fs (line 9 - built-in, OK), os (line 10 - built-in, OK), ffmpeg (line 11 - fluent-ffmpeg), ffmpeg-static (line 12). The 'fluent-ffmpeg' and 'ffmpeg-static' packages are critical for audio processing functionality but are missing from package.json. This means npm install will not install them, causing runtime errors when audio features are used. The package-lock.json confirms these are not in the dependency tree.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] npm install installs fluent-ffmpeg, ffmpeg-static, and multer
- [ ] Backend starts without module not found errors
- [ ] Audio processing endpoints work correctly
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. Add 'fluent-ffmpeg' and 'ffmpeg-static' to backend/package.json dependencies. Also add 'multer' if it's not already there (it's imported but not in the listed dependencies). Run npm install to update package-lock.json.

## 💡 نمونه‌های قبل/بعد
**Add missing dependencies**

_قبل:_
```
"dependencies": {
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "express": "^4.18.2",
  "ws": "^8.19.0"
}
```

_بعد:_
```
"dependencies": {
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "express": "^4.18.2",
  "fluent-ffmpeg": "^2.1.2",
  "ffmpeg-static": "^5.2.0",
  "multer": "^1.4.5-lts.1",
  "ws": "^8.19.0"
}
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `cd backend && npm ls fluent-ffmpeg`
- `cd backend && npm ls ffmpeg-static`
- `cd backend && npm ls multer`

## ⚠️ ریسک‌ها و موارد احتیاط
Low risk; adding missing dependencies only fixes runtime errors

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: bug
- اولویت: high
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 2 از 3
  id: 29816f08-1985-4c0b-960d-8c99039fd3d6
  عنوان اصلی: بازسازی server.js: رفع قطعی، انتقال مسیرها
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: backend/server.js

📋 acceptance_criteria کامل:
  - فایل server.js کمتر از 300 خط شود [verify_method=static] [verify_plan={"grep_patterns": [], "files_hint": ["backend/server.js"]}]
  - همه routeها به فایل‌های جداگانه منتقل شوند [verify_method=static] [verify_plan={"grep_patterns": ["require\\(.*routes", "app\\.use\\(.*routes", "import.*router"], "files_hint": ["backend/server.js", "backend/routes/"]}]
  - برنامه بعد از refactoring بدون خطا اجرا شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_server_startup.py::test_server_starts", "timeout_seconds": 30}]

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
فایل backend/server.js در خط 400 قطع شده و ادامه فایل (شامل endpointهای تحلیل فایل) ناقص است

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/server.js:1-1403` — `کل فایل` — فایل بسیار بزرگ با 1403 خط
  ```jsx
  ... [TRUNCATED at line 400 of 1403]
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Node.js + Express + ES Modules

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `backend/server.js` (سطر 1) — فایل اصلی که باید refactor شود
- `backend/package.json` (سطر 1) — برای اضافه کردن ماژول‌های جدید

## 🌐 نقشهٔ وابستگی‌ها
این فایل شامل تمام منطق backend است: chat, TTS, file analysis, health check, model listing.

## 🔍 Context و وضعیت فعلی
محتوای فایل backend/server.js در خط 400 با علامت [TRUNCATED] قطع شده است. این فایل 1403 خط دارد و بخش‌های مهمی مانند endpointهای تحلیل فایل (file analysis API) که از خط 242 شروع شده‌اند، کامل نمایش داده نشده‌اند. این می‌تواند نشان‌دهنده این باشد که فایل بسیار بزرگ است و نیاز به refactoring به ماژول‌های کوچک‌تر دارد. همچنین احتمال دارد که برخی از این endpointها ناقص یا دارای bug باشند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فایل server.js کمتر از 300 خط شود
- [ ] همه routeها به فایل‌های جداگانه منتقل شوند
- [ ] برنامه بعد از refactoring بدون خطا اجرا شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. فایل backend/server.js را به ماژول‌های کوچک‌تر تقسیم کنید: routes/chat.js, routes/tts.js, routes/fileAnalysis.js, services/gemini.js, services/upload.js. این کار خوانایی، تست‌پذیری و نگهداری کد را بهبود می‌بخشد. همچنین از فایل‌های خیلی بزرگ (بیش از 500 خط) جلوگیری می‌کند.

## 💡 نمونه‌های قبل/بعد
**ساختار ماژولار**

_قبل:_
```
backend/server.js (1403 lines)
```

_بعد:_
```
backend/
  server.js (import routes)
  routes/
    chat.js
    tts.js
    fileAnalysis.js
  services/
    gemini.js
    upload.js
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `اجرای npm start و تست endpointهای اصلی`
- `اجرای linter برای بررسی ساختار`

## ⚠️ ریسک‌ها و موارد احتیاط
Refactoring ممکن است باعث شکستن importها و مسیرها شود. نیاز به تست کامل بعد از تغییرات.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: other
- اولویت: medium
- تخمین زمان: large

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 3 از 3
  id: dd2427f0-2f36-4f38-82f1-94e419c20d77
  عنوان اصلی: یکپارچه‌سازی dependency در ریشه و زیرپروژه‌ها
  اولویت اصلی: medium
  وضعیت verify قبلی: pending
  فایل‌های دخیل: package.json

📋 acceptance_criteria کامل:
  - اعمال تغییر بدون شکستن تست‌های موجود [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]
  - linter بدون warning عبور می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["no warnings", "lint"], "files_hint": ["backend/", "frontend/"]}]
  - type-check موفق است [verify_method=static] [verify_plan={"grep_patterns": ["type-check", "tsc"], "files_hint": ["backend/", "frontend/"]}]

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
فایل‌های dependency package-lock.json و package.json در ریشه و frontend/backend تکراری و ناهماهنگ هستند

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `package.json:1-15` — `package.json ریشه`
  ```json
  {
    "name": "lebanese-dialect-learning",
    "version": "1.0.0",
    "description": "Lebanese Arabic Learning App with AI",
    "scripts": {
      "install:all": "
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🔍 Context و وضعیت فعلی
سه فایل package.json و سه فایل package-lock.json در پروژه وجود دارد: یکی در ریشه (package.json و package-lock.json)، یکی در backend/ و یکی در frontend/. package.json ریشه فقط اسکریپت‌های orchestration دارد (install:all, dev, build, start) اما وابستگی‌های خود را تعریف نکرده است. این ساختار باعث می‌شود که npm install در ریشه هیچ وابستگی‌ای نصب نکند و کاربر مجبور باشد به‌صورت دستی به backend و frontend برود. همچنین package-lock.json ریشه با package-lock.json frontend همپوشانی دارد (هر دو firebase, react, lucide-react را لیست کرده‌اند).

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] اعمال تغییر بدون شکستن تست‌های موجود
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. package.json ریشه را به‌عنوان یک workspace تعریف کنید تا npm install در ریشه تمام وابستگی‌های زیرپروژه‌ها را نصب کند. از npm workspaces استفاده کنید. همچنین package-lock.json ریشه را حذف کنید و اجازه دهید npm workspace یک lockfile واحد در ریشه ایجاد کند.

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
- در commit message: `merged-from: f921cce0-892b-4da2-b499-b9db9b2f27f0, 29816f08-1985-4c0b-960d-8c99039fd3d6, dd2427f0-2f36-4f38-82f1-94e419c20d77`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Acceptance Criteria

1. npm install installs fluent-ffmpeg, ffmpeg-static, and multer _(verify: static)_
2. Backend starts without module not found errors _(verify: backend_test)_
3. Audio processing endpoints work correctly _(verify: api_response)_
4. فایل server.js کمتر از 300 خط شود _(verify: static)_
5. همه routeها به فایل‌های جداگانه منتقل شوند _(verify: static)_
6. برنامه بعد از refactoring بدون خطا اجرا شود _(verify: backend_test)_
7. اعمال تغییر بدون شکستن تست‌های موجود _(verify: backend_test)_
8. linter بدون warning عبور می‌کند _(verify: static)_
9. type-check موفق است _(verify: static)_

## Task Steps

### Step 1: اضافه کردن وابستگی‌های گمشده به backend/package.json
**Status:** `done` (100%)
**Scope:** این مرحله شامل افزودن سه وابستگی 'fluent-ffmpeg'، 'ffmpeg-static' و 'multer' به بخش dependencies فایل backend/package.json است. خارج از این مرحله: نصب وابستگی‌ها (npm install)، به‌روزرسانی package-lock.json، یا تغییرات در server.js. نکته حیاتی: فقط فایل package.json را ویرایش کنید، نه چیز دیگر.
**Excerpt:**
```
Add 'fluent-ffmpeg' and 'ffmpeg-static' to backend/package.json dependencies. Also add 'multer' if it's not already there (it's imported but not in the listed dependencies). Run npm install to update package-lock.json.
```

### Step 2: اجرای npm install برای به‌روزرسانی package-lock.json
**Status:** `done` (100%)
**Scope:** این مرحله شامل اجرای دستور npm install در دایرکتوری backend برای نصب وابستگی‌های جدید (fluent-ffmpeg، ffmpeg-static، multer) و به‌روزرسانی فایل package-lock.json است. خارج از این مرحله: تغییرات در کد منبع یا تست‌ها. نکته حیاتی: مطمئن شوید که npm install بدون خطا اجرا می‌شود.
**Excerpt:**
```
Run npm install to update package-lock.json.
```

### Step 3: تأیید عدم وجود خطاهای module not found در startup بک‌اند
**Status:** `done` (100%)
**Scope:** این مرحله شامل اجرای تست test_no_module_not_found_errors از فایل tests/test_backend_startup.py برای اطمینان از عدم وجود خطاهای module not found در زمان startup بک‌اند است. خارج از این مرحله: تست endpointهای صوتی یا تغییرات در کد. نکته حیاتی: تست باید با timeout 30 ثانیه اجرا شود.
**Excerpt:**
```
Backend starts without module not found errors [verify_method=backend_test] [verify_plan={"test_node": "tests/test_backend_startup.py::test_no_module_not_found_errors", "timeout_seconds": 30}]
```

### Step 4: تأیید عملکرد صحیح endpoint پردازش صوتی
**Status:** `done` (100%)
**Scope:** این مرحله شامل ارسال یک درخواست POST به endpoint /api/audio/process و بررسی پاسخ است. خارج از این مرحله: تست endpointهای دیگر یا تغییرات در کد. نکته حیاتی: پاسخ باید شامل فیلدهای status و result باشد و status کد 200 برگرداند.
**Excerpt:**
```
Audio processing endpoints work correctly [verify_method=api_response] [verify_plan={"method": "POST", "path": "/api/audio/process", "headers": null, "json_body": null, "expected_status": 200, "required_fields": ["status", "result"], "json_contains": null}]
```

### Step 5: ایجاد دایرکتوری routes و فایل‌های مسیریاب جداگانه
**Status:** `done` (100%)
**Scope:** این مرحله شامل ایجاد دایرکتوری backend/routes و فایل‌های مسیریاب جداگانه برای chat، tts و fileAnalysis است. خارج از این مرحله: انتقال منطق از server.js به این فایل‌ها یا تغییرات در server.js. نکته حیاتی: فقط ساختار دایرکتوری و فایل‌های خالی ایجاد کنید.
**Excerpt:**
```
فایل backend/server.js را به ماژول‌های کوچک‌تر تقسیم کنید: routes/chat.js, routes/tts.js, routes/fileAnalysis.js, services/gemini.js, services/upload.js.
```

### Step 6: ایجاد دایرکتوری services و فایل‌های سرویس جداگانه
**Status:** `done` (100%)
**Scope:** این مرحله شامل ایجاد دایرکتوری backend/services و فایل‌های سرویس جداگانه برای gemini و upload است. خارج از این مرحله: انتقال منطق از server.js به این فایل‌ها یا تغییرات در server.js. نکته حیاتی: فقط ساختار دایرکتوری و فایل‌های خالی ایجاد کنید.
**Excerpt:**
```
فایل backend/server.js را به ماژول‌های کوچک‌تر تقسیم کنید: routes/chat.js, routes/tts.js, routes/fileAnalysis.js, services/gemini.js, services/upload.js.
```

### Step 7: انتقال routeهای chat از server.js به routes/chat.js
**Status:** `done` (100%)
**Scope:** این مرحله شامل شناسایی و انتقال تمام routeهای مربوط به chat از فایل backend/server.js به فایل backend/routes/chat.js است. خارج از این مرحله: انتقال routeهای tts یا fileAnalysis. نکته حیاتی: اطمینان حاصل کنید که importها و exportها به درستی تنظیم شده‌اند.
**Excerpt:**
```
همه routeها به فایل‌های جداگانه منتقل شوند [verify_method=static] [verify_plan={"grep_patterns": ["require\\(.*routes", "app\\.use\\(.*routes", "import.*router"], "files_hint": ["backend/server.js", "backend/routes/"]}]
```

### Step 8: انتقال routeهای tts از server.js به routes/tts.js
**Status:** `done` (100%)
**Scope:** این مرحله شامل شناسایی و انتقال تمام routeهای مربوط به tts از فایل backend/server.js به فایل backend/routes/tts.js است. خارج از این مرحله: انتقال routeهای chat یا fileAnalysis. نکته حیاتی: اطمینان حاصل کنید که importها و exportها به درستی تنظیم شده‌اند.
**Excerpt:**
```
همه routeها به فایل‌های جداگانه منتقل شوند [verify_method=static] [verify_plan={"grep_patterns": ["require\\(.*routes", "app\\.use\\(.*routes", "import.*router"], "files_hint": ["backend/server.js", "backend/routes/"]}]
```

### Step 9: انتقال routeهای fileAnalysis از server.js به routes/fileAnalysis.js
**Status:** `done` (100%)
**Scope:** این مرحله شامل شناسایی و انتقال تمام routeهای مربوط به file analysis از فایل backend/server.js به فایل backend/routes/fileAnalysis.js است. خارج از این مرحله: انتقال routeهای chat یا tts. نکته حیاتی: اطمینان حاصل کنید که importها و exportها به درستی تنظیم شده‌اند.
**Excerpt:**
```
همه routeها به فایل‌های جداگانه منتقل شوند [verify_method=static] [verify_plan={"grep_patterns": ["require\\(.*routes", "app\\.use\\(.*routes", "import.*router"], "files_hint": ["backend/server.js", "backend/routes/"]}]
```

### Step 10: انتقال سرویس gemini از server.js به services/gemini.js
**Status:** `done` (100%)
**Scope:** این مرحله شامل شناسایی و انتقال منطق مربوط به سرویس gemini از فایل backend/server.js به فایل backend/services/gemini.js است. خارج از این مرحله: انتقال سرویس upload یا routeها. نکته حیاتی: اطمینان حاصل کنید که importها و exportها به درستی تنظیم شده‌اند.
**Excerpt:**
```
فایل backend/server.js را به ماژول‌های کوچک‌تر تقسیم کنید: routes/chat.js, routes/tts.js, routes/fileAnalysis.js, services/gemini.js, services/upload.js.
```

### Step 11: انتقال سرویس upload از server.js به services/upload.js
**Status:** `done` (100%)
**Scope:** این مرحله شامل شناسایی و انتقال منطق مربوط به سرویس upload از فایل backend/server.js به فایل backend/services/upload.js است. خارج از این مرحله: انتقال سرویس gemini یا routeها. نکته حیاتی: اطمینان حاصل کنید که importها و exportها به درستی تنظیم شده‌اند.
**Excerpt:**
```
فایل backend/server.js را به ماژول‌های کوچک‌تر تقسیم کنید: routes/chat.js, routes/tts.js, routes/fileAnalysis.js, services/gemini.js, services/upload.js.
```

### Step 12: به‌روزرسانی server.js برای import و استفاده از routeها و سرویس‌های جدید
**Status:** `done` (100%)
**Scope:** این مرحله شامل به‌روزرسانی فایل backend/server.js برای import و استفاده از routeها و سرویس‌های جدید است. خارج از این مرحله: تغییرات در routeها یا سرویس‌های جدید. نکته حیاتی: اطمینان حاصل کنید که تمام importها و app.useها به درستی تنظیم شده‌اند و فایل server.js کمتر از 300 خط است.
**Excerpt:**
```
فایل server.js کمتر از 300 خط شود [verify_method=static] [verify_plan={"grep_patterns": [], "files_hint": ["backend/server.js"]}]
```

### Step 13: تأیید اجرای بدون خطای برنامه پس از refactoring
**Status:** `done` (100%)
**Scope:** این مرحله شامل اجرای تست test_server_starts از فایل tests/test_server_startup.py برای اطمینان از اجرای بدون خطای برنامه پس از refactoring است. خارج از این مرحله: تست endpointهای خاص یا تغییرات در کد. نکته حیاتی: تست باید با timeout 30 ثانیه اجرا شود.
**Excerpt:**
```
برنامه بعد از refactoring بدون خطا اجرا شود [verify_method=backend_test] [verify_plan={"test_node": "tests/test_server_startup.py::test_server_starts", "timeout_seconds": 30}]
```

### Step 14: تبدیل package.json ریشه به npm workspace
**Status:** `done` (100%)
**Scope:** این مرحله شامل به‌روزرسانی فایل package.json ریشه برای تعریف backend و frontend به‌عنوان workspace است. خارج از این مرحله: حذف package-lock.json ریشه یا تغییرات در package.json زیرپروژه‌ها. نکته حیاتی: از ویژگی workspaces npm استفاده کنید.
**Excerpt:**
```
package.json ریشه را به‌عنوان یک workspace تعریف کنید تا npm install در ریشه تمام وابستگی‌های زیرپروژه‌ها را نصب کند. از npm workspaces استفاده کنید.
```

### Step 15: حذف package-lock.json ریشه و ایجاد یک lockfile واحد
**Status:** `done` (100%)
**Scope:** این مرحله شامل حذف فایل package-lock.json ریشه و اجرای npm install در ریشه برای ایجاد یک lockfile واحد است. خارج از این مرحله: تغییرات در package.json ریشه یا زیرپروژه‌ها. نکته حیاتی: مطمئن شوید که npm install در ریشه بدون خطا اجرا می‌شود.
**Excerpt:**
```
package-lock.json ریشه را حذف کنید و اجازه دهید npm workspace یک lockfile واحد در ریشه ایجاد کند.
```

### Step 16: تأیید عدم شکستن تست‌های موجود پس از تغییرات workspace
**Status:** `partial` (80%)
**Scope:** این مرحله شامل اجرای تمام تست‌های موجود (در دایرکتوری tests/) برای اطمینان از عدم شکستن آن‌ها پس از تغییرات workspace است. خارج از این مرحله: تغییرات در کد منبع. نکته حیاتی: تست‌ها باید با timeout 120 ثانیه اجرا شوند.
**Excerpt:**
```
اعمال تغییر بدون شکستن تست‌های موجود [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]
```
