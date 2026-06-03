---
task_id: task_9172abbf97f5
title: مستندسازی جامع پروژه و بهبود فرآیند راه‌اندازی
type: other
priority: high
execution_priority: 2150
status: pending
external_status: pending
verification_status: partial
watched_id: 6b04f8bd-b562-4fb9-9cd9-0c27458ced59
project: mahdighandi1989/language
created_at: '2026-06-01T19:26:36.892083+00:00'
updated_at: '2026-06-03T18:42:32.882926+00:00'
tags:
- consolidated
- post_verify_merge
---

# مستندسازی جامع پروژه و بهبود فرآیند راه‌اندازی

## Raw Idea

🧬 این یک تسک تلفیقی است — از 9 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این تسک‌ها همگی به مستندسازی پروژه، از جمله ایجاد فایل‌های ضروری مانند .env.example و LICENSE، و همچنین افزودن توضیحات و مستندات داخلی برای فهم بهتر کد و معماری، مربوط می‌شوند. این کار به onboarding توسعه‌دهندگان جدید و نگهداری پروژه کمک می‌کند.
🎯 theme: ایجاد و بهبود مستندات پروژه، شامل فایل‌های پیکربندی، لایسنس و روشن‌سازی هدف کامپوننت‌های کلیدی و معماری کلی.
💎 estimated_difficulty: large

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 9
  id: 7c1da858-e52e-4791-9121-82794c82c52a
  عنوان اصلی: مستندسازی هدف کامپوننت‌های کلیدی و معماری
  اولویت اصلی: high
  وضعیت verify قبلی: pending
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - outcome target به‌صورت measurable بازنویسی شد [verify_method=static] [verify_plan={"grep_patterns": ["outcome target", "measurable", "effectiveness"], "files_hint": ["README.md", "docs/"]}]
  - کد تغییر کرد تا outcome target محقق شود [verify_method=static] [verify_plan={"grep_patterns": ["purpose of this component", "role of this file", "component purpose"], "files_hint": ["frontend/src/App.jsx", "backend/server.js", "frontend/index.html"]}]
  - test E2E که outcome را اندازه می‌گیرد عبور می‌کند [verify_method=backend_test] [verify_plan={"test_node": "tests/e2e/test_outcome_measurement.py::test_outcome_measurable", "timeout_seconds": 60}]
  - metric/log اضافه شد تا در production outcome rate قابل تشخیص باشد [verify_method=static] [verify_plan={"grep_patterns": ["outcome_rate", "metric", "log.*outcome"], "files_hint": ["backend/app.py", "backend/logging_config.py"]}]

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
[Effectiveness] عدم شفافیت در هدف اصلی کامپوننت‌های کلیدی

## 📍 موقعیت دقیق در پروژه
_(فایل‌های دقیق توسط مجری شناسایی شوند — هیچ موقعیت مشخصی استخراج نشد)_

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🔍 Context و وضعیت فعلی
## 🎯 هدف مطلوب (outcome target)
مستندسازی هدف هر کامپوننت (App.jsx, server.js, index.html) تا پایان هفته آینده

## 📊 وضعیت فعلی
هدف اصلی فایل‌های frontend/src/App.jsx، backend/server.js و frontend/index.html مشخص نیست و این موضوع باعث کاهش قابلیت نگهداری و توسعه تیمی می‌شود.

## 🛠 اقدام پیشنهادی
اضافه کردن کامنت‌های توضیحی در ابتدای هر فایل و به‌روزرسانی README پروژه با توضیح معماری و نقش هر کامپوننت.

## ⚙️ ماهیت این finding
این یک effectiveness issue است — کد ممکن است syntactically کار کند ولی **outcome مطلوب** (مثل: «فرم باید ایمیل ارسال کند») حاصل نمی‌شود. verify باید outcome را اندازه بگیرد، نه فقط وجود فایل/خط.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] outcome target به‌صورت measurable بازنویسی شد
- [ ] کد تغییر کرد تا outcome target محقق شود
- [ ] test E2E که outcome را اندازه می‌گیرد عبور می‌کند
- [ ] metric/log اضافه شد تا در production outcome rate قابل تشخیص باشد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: outcome target را به‌صورت قابل اندازه‌گیری بازنویسی کن (مثلاً: «email send rate > 95% در ۱۰۰ تلاش»).
گام ۲: کد را تغییر بده تا outcome محقق شود.
گام ۳: یک end-to-end test که outcome را اندازه می‌گیرد بنویس.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest -k 'outcome or e2e'`

## ⚠️ ریسک‌ها و موارد احتیاط
بهبود outcome ممکن است latency یا cost را افزایش دهد — قبل/بعد metric ها را compare کن.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: logic_audit
- اولویت: high
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  - مستندسازی هدف کامپوننت App.jsx با کامنت توضیحی و به‌روزرسانی README — افزودن کامنت توضیحی در App.jsx و به‌روزرسانی README
  - مستندسازی هدف کامپوننت server.js با کامنت توضیحی و به‌روزرسانی README — افزودن کامنت توضیحی در server.js و به‌روزرسانی README
  - مستندسازی هدف کامپوننت index.html با کامنت توضیحی و به‌روزرسانی README — افزودن کامنت توضیحی در index.html و به‌روزرسانی README
  - به‌روزرسانی README پروژه با توضیح معماری کلی و نقش هر کامپوننت — به‌روزرسانی README با بخش معماری و نقش کامپوننت‌ها
  - نوشتن تست E2E که outcome مستندسازی را اندازه‌گیری می‌کند — نوشتن تست E2E برای بررسی وجود کامنت‌های توضیحی
  - اضافه کردن metric/log برای تشخیص outcome rate در production — افزودن metric/log برای تشخیص outcome rate در production
  - اجرای تست‌های موجود و linter/type-check برای اطمینان از عدم شکست — اجرای تست‌های موجود و linter/type-check

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 2 از 9
  id: e00a1855-25c4-483d-b3b6-465d34383e3f
  عنوان اصلی: Create .env.example for frontend variables
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: frontend/.env.example

📋 acceptance_criteria کامل:
  - frontend/.env.example exists with all required variables [verify_method=static] [verify_plan={"grep_patterns": ["VITE_API_URL", "VITE_FIREBASE_", "VITE_INSPECTOR_WS_URL"], "files_hint": ["frontend/.env.example"]}]
  - Each variable has a comment explaining its purpose [verify_method=static] [verify_plan={"grep_patterns": ["#.*VITE_API_URL", "#.*VITE_FIREBASE", "#.*VITE_INSPECTOR_WS_URL"], "files_hint": ["frontend/.env.example"]}]
  - Variables use VITE_ prefix as required by Vite [verify_method=static] [verify_plan={"grep_patterns": ["^VITE_"], "files_hint": ["frontend/.env.example"]}]

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
Missing .env.example for frontend environment variables

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/.env.example:1-10` — `N/A (file doesn't exist)` — File needs to be created
  ```
  # This file should be created with:
  # VITE_API_URL=http://localhost:3001
  # VITE_FIREBASE_API_KEY=your_firebase_api_key
  # ...
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Vite uses VITE_ prefix for environment variables exposed to client code

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `backend/.env.example` (سطر 1) — Existing example file that should be mirrored for frontend
- `frontend/src/App.jsx` (سطر 137) — Uses Firebase config that should come from env vars

## 🌐 نقشهٔ وابستگی‌ها
Affects developer onboarding and configuration management.

## 🔍 Context و وضعیت فعلی
The project has a backend/.env.example file but no corresponding frontend/.env.example. The frontend uses several environment variables that should be documented: VITE_API_URL (implied by API calls), VITE_FIREBASE_* variables (for Firebase config), and potentially VITE_INSPECTOR_WS_URL. Without a .env.example, new developers have no documentation of what environment variables are required to run the frontend, leading to configuration errors and runtime failures.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] frontend/.env.example exists with all required variables
- [ ] Each variable has a comment explaining its purpose
- [ ] Variables use VITE_ prefix as required by Vite
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. Create frontend/.env.example with all required environment variables documented. Include VITE_API_URL (defaulting to http://localhost:3001), VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID, and any other variables used by the frontend.

## 💡 نمونه‌های قبل/بعد
**Create frontend .env.example**

_قبل:_
```
// No frontend/.env.example exists
```

_بعد:_
```
# frontend/.env.example
VITE_API_URL=http://localhost:3001
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `test -f frontend/.env.example`
- `grep -c 'VITE_' frontend/.env.example`

## ⚠️ ریسک‌ها و موارد احتیاط
No risk; adding documentation only improves the project

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: docs
- اولویت: medium
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 3 از 9
  id: c826e12b-dc51-42a4-8c4c-61f446ddccca
  عنوان اصلی: Add license file to repository
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: LICENSE, package.json

📋 acceptance_criteria کامل:
  - اعمال تغییر بدون شکستن تست‌های موجود [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]
  - linter بدون warning عبور می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["no-license", "license-not-found", "missing-license"], "files_hint": ["backend/app/", "frontend/src/"]}]
  - type-check موفق است [verify_method=static] [verify_plan={"grep_patterns": ["type-check", "tsc --noEmit", "mypy"], "files_hint": ["backend/app/", "frontend/src/"]}]

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
No license file found in repository

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `LICENSE:1-21` — `N/A` — No LICENSE file in repository root
  ```
  File does not exist
  ```
- `package.json:1-12` — `license` — Missing license field in root package.json
  ```json
  {
    "name": "lebanese-dialect-learning",
    "version": "1.0.0",
    "description": "Lebanese Arabic Learning App with AI",
    "scripts": { ... },
    "keywords": [...],
    "license": "MIT"
  }
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🔍 Context و وضعیت فعلی
The repository does not contain a LICENSE file. The package.json files (root, backend, frontend) do not specify a license field. This is a legal risk because without a license, the default copyright laws apply, meaning others cannot legally use, modify, or distribute the code. The project uses dependencies with various licenses (MIT for most, but Firebase has its own terms), and the absence of a project license creates uncertainty about how the project can be used or contributed to.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] اعمال تغییر بدون شکستن تست‌های موجود
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. Add a LICENSE file to the repository root. Choose an appropriate open-source license (MIT is recommended for most projects) or specify proprietary rights. Update all package.json files to include the 'license' field. Ensure the chosen license is compatible with the dependencies' licenses.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## ⚠️ ریسک‌ها و موارد احتیاط
پیش از merge، تست‌های موجود اجرا شوند تا رگرشن ایجاد نشود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: docs
- اولویت: medium
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 4 از 9
  id: 5564037e-a6ff-4ad6-a190-ec9a7783c825
  عنوان اصلی: Add LICENSE file and resolve dependency conflicts
  اولویت اصلی: medium
  وضعیت verify قبلی: pending
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - اعمال تغییر بدون شکستن تست‌های موجود [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]
  - linter بدون warning عبور می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["lint", "eslint", "pylint", "ruff"], "files_hint": ["Makefile", "package.json", "pyproject.toml"]}]
  - type-check موفق است [verify_method=static] [verify_plan={"grep_patterns": ["type-check", "mypy", "tsc", "typecheck"], "files_hint": ["Makefile", "package.json", "pyproject.toml"]}]

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
Missing LICENSE file and potential dependency license conflicts

## 📍 موقعیت دقیق در پروژه
_(فایل‌های دقیق توسط مجری شناسایی شوند — هیچ موقعیت مشخصی استخراج نشد)_

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🔍 Context و وضعیت فعلی
The project does not include a LICENSE file. The root package.json specifies 'MIT' as the license, but no

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] اعمال تغییر بدون شکستن تست‌های موجود
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
_(مجری بر اساس Context و معیارهای پذیرش، مراحل را تعیین کند)_

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## ⚠️ ریسک‌ها و موارد احتیاط
پیش از merge، تست‌های موجود اجرا شوند تا رگرشن ایجاد نشود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: docs
- اولویت: medium
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 5 از 9
  id: dfc945a2-9d3b-4808-9e4b-2c93b8d8b00e
  عنوان اصلی: مستندسازی و تغییر نام server.js
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: backend/server.js

📋 acceptance_criteria کامل:
  - فایل docstring/header comment ۳-۵ خطی دارد که purpose را روشن می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["^\\s*\\/\\*\\*", "^\\s*\\/\\/\\s*Purpose", "^\\s*\\/\\/\\s*Description"], "files_hint": ["backend/server.js"]}]
  - اگر فایل بخشی از pipeline است، در docstring به upstream/downstream اشاره شده [verify_method=static] [verify_plan={"grep_patterns": ["upstream", "downstream", "pipeline", "input", "output"], "files_hint": ["backend/server.js"]}]
  - نام فایل (اگر مبهم) به نام معنادار rename شده [verify_method=static] [verify_plan={"grep_patterns": ["backend/server.js"], "files_hint": ["backend/server.js"]}]

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
فایل با هدف مبهم: server.js

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/server.js`

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🌐 نقشهٔ وابستگی‌ها
این مورد در پایپ‌لاین کدبیس به فایل‌های اطراف وابسته است؛ قبل از تغییر، grep روی نام symbol/path اصلی انجام شود.

## 🔍 Context و وضعیت فعلی
## 📋 شرح
فایل `backend/server.js` هیچ docstring/comment توضیحی در بالای فایل ندارد و نام آن purpose را روشن نمی‌کند.

## 🤔 چرا مهم است
کد بدون purpose maintenance hell ایجاد می‌کند — هر developer جدید باید reverse-engineer کند.

## 🔍 جزئیات
- علت: هدف این فایل از کد یا comments قابل استخراج نیست — نیاز به documentation یا حذف اگر unused

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فایل docstring/header comment ۳-۵ خطی دارد که purpose را روشن می‌کند
- [ ] اگر فایل بخشی از pipeline است، در docstring به upstream/downstream اشاره شده
- [ ] نام فایل (اگر مبهم) به نام معنادار rename شده
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: بخوان فایل و معنی واقعی‌اش را بفهم.
گام ۲: docstring/comment ۳-۵ خطی در بالای فایل اضافه کن: purpose، inputs، outputs، side effects.
گام ۳: اگر فایل dead است، حذف کن.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `npm run lint`
- `npm run build`

## ⚠️ ریسک‌ها و موارد احتیاط
rename فایل ممکن است imports زیادی را break کند — قبل از rename همه usages را پیدا و یکجا update کن.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: audit
- اولویت: medium
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 6 از 9
  id: ac140bf8-b8db-4a11-83fe-5816b110603b
  عنوان اصلی: مستندسازی و نامگذاری index.html
  اولویت اصلی: medium
  وضعیت verify قبلی: pending
  فایل‌های دخیل: frontend/index.html

📋 acceptance_criteria کامل:
  - فایل docstring/header comment ۳-۵ خطی دارد که purpose را روشن می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["docstring", "header", "comment", "purpose", "فایل", "دارد", "روشن"], "files_hint": []}]
  - اگر فایل بخشی از pipeline است، در docstring به upstream/downstream اشاره شده [verify_method=static] [verify_plan={"grep_patterns": ["pipeline", "docstring", "upstream", "downstream", "فایل", "بخشی", "است،", "اشاره"], "files_hint": []}]
  - نام فایل (اگر مبهم) به نام معنادار rename شده [verify_method=static] [verify_plan={"grep_patterns": ["rename", "فایل", "مبهم", "معنادار"], "files_hint": []}]

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
فایل با هدف مبهم: index.html

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/index.html`

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🌐 نقشهٔ وابستگی‌ها
این مورد در پایپ‌لاین کدبیس به فایل‌های اطراف وابسته است؛ قبل از تغییر، grep روی نام symbol/path اصلی انجام شود.

## 🔍 Context و وضعیت فعلی
## 📋 شرح
فایل `frontend/index.html` هیچ docstring/comment توضیحی در بالای فایل ندارد و نام آن purpose را روشن نمی‌کند.

## 🤔 چرا مهم است
کد بدون purpose maintenance hell ایجاد می‌کند — هر developer جدید باید reverse-engineer کند.

## 🔍 جزئیات
- علت: هدف این فایل از کد یا comments قابل استخراج نیست — نیاز به documentation یا حذف اگر unused

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فایل docstring/header comment ۳-۵ خطی دارد که purpose را روشن می‌کند
- [ ] اگر فایل بخشی از pipeline است، در docstring به upstream/downstream اشاره شده
- [ ] نام فایل (اگر مبهم) به نام معنادار rename شده
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: بخوان فایل و معنی واقعی‌اش را بفهم.
گام ۲: docstring/comment ۳-۵ خطی در بالای فایل اضافه کن: purpose، inputs، outputs، side effects.
گام ۳: اگر فایل dead است، حذف کن.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## ⚠️ ریسک‌ها و موارد احتیاط
rename فایل ممکن است imports زیادی را break کند — قبل از rename همه usages را پیدا و یکجا update کن.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: audit
- اولویت: medium
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 7 از 9
  id: cae62312-11d9-47af-bc8e-9c0fadd3caf1
  عنوان اصلی: مستندسازی هدف package-lock.json
  اولویت اصلی: medium
  وضعیت verify قبلی: pending
  فایل‌های دخیل: backend/package-lock.json

📋 acceptance_criteria کامل:
  - فایل docstring/header comment ۳-۵ خطی دارد که purpose را روشن می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["#.*purpose", "#.*package-lock", "#.*lock file", "#.*dependency"], "files_hint": ["backend/package-lock.json"]}]
  - اگر فایل بخشی از pipeline است، در docstring به upstream/downstream اشاره شده [verify_method=static] [verify_plan={"grep_patterns": ["upstream", "downstream", "pipeline", "build", "deploy"], "files_hint": ["backend/package-lock.json"]}]
  - نام فایل (اگر مبهم) به نام معنادار rename شده [verify_method=static] [verify_plan={"grep_patterns": ["backend/package-lock.json"], "files_hint": ["backend/"]}]

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
فایل با هدف مبهم: package-lock.json

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/package-lock.json`

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🌐 نقشهٔ وابستگی‌ها
این مورد در پایپ‌لاین کدبیس به فایل‌های اطراف وابسته است؛ قبل از تغییر، grep روی نام symbol/path اصلی انجام شود.

## 🔍 Context و وضعیت فعلی
## 📋 شرح
فایل `backend/package-lock.json` هیچ docstring/comment توضیحی در بالای فایل ندارد و نام آن purpose را روشن نمی‌کند.

## 🤔 چرا مهم است
کد بدون purpose maintenance hell ایجاد می‌کند — هر developer جدید باید reverse-engineer کند.

## 🔍 جزئیات
- علت: هدف این فایل از کد یا comments قابل استخراج نیست — نیاز به documentation یا حذف اگر unused

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فایل docstring/header comment ۳-۵ خطی دارد که purpose را روشن می‌کند
- [ ] اگر فایل بخشی از pipeline است، در docstring به upstream/downstream اشاره شده
- [ ] نام فایل (اگر مبهم) به نام معنادار rename شده
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: بخوان فایل و معنی واقعی‌اش را بفهم.
گام ۲: docstring/comment ۳-۵ خطی در بالای فایل اضافه کن: purpose، inputs، outputs، side effects.
گام ۳: اگر فایل dead است، حذف کن.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `python -c "import json; json.load(open('backend/package-lock.json'))"`

## ⚠️ ریسک‌ها و موارد احتیاط
rename فایل ممکن است imports زیادی را break کند — قبل از rename همه usages را پیدا و یکجا update کن.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: audit
- اولویت: medium
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 8 از 9
  id: f101ec5e-3bdd-474c-9dcc-99d3b92f27b7
  عنوان اصلی: روشن کردن هدف App.jsx
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: frontend/src/App.jsx

📋 acceptance_criteria کامل:
  - فایل docstring/header comment ۳-۵ خطی دارد که purpose را روشن می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["\"\"\"", "'''", "// purpose", "// Purpose"], "files_hint": ["frontend/src/App.jsx"]}]
  - اگر فایل بخشی از pipeline است، در docstring به upstream/downstream اشاره شده [verify_method=static] [verify_plan={"grep_patterns": ["upstream", "downstream", "pipeline"], "files_hint": ["frontend/src/App.jsx"]}]
  - نام فایل (اگر مبهم) به نام معنادار rename شده [verify_method=static] [verify_plan={"grep_patterns": ["frontend/src/"], "files_hint": ["frontend/src/"]}]

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
فایل با هدف مبهم: App.jsx

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/src/App.jsx`

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🌐 نقشهٔ وابستگی‌ها
این مورد در پایپ‌لاین کدبیس به فایل‌های اطراف وابسته است؛ قبل از تغییر، grep روی نام symbol/path اصلی انجام شود.

## 🔍 Context و وضعیت فعلی
## 📋 شرح
فایل `frontend/src/App.jsx` هیچ docstring/comment توضیحی در بالای فایل ندارد و نام آن purpose را روشن نمی‌کند.

## 🤔 چرا مهم است
کد بدون purpose maintenance hell ایجاد می‌کند — هر developer جدید باید reverse-engineer کند.

## 🔍 جزئیات
- علت: هدف این فایل از کد یا comments قابل استخراج نیست — نیاز به documentation یا حذف اگر unused

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فایل docstring/header comment ۳-۵ خطی دارد که purpose را روشن می‌کند
- [ ] اگر فایل بخشی از pipeline است، در docstring به upstream/downstream اشاره شده
- [ ] نام فایل (اگر مبهم) به نام معنادار rename شده
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: بخوان فایل و معنی واقعی‌اش را بفهم.
گام ۲: docstring/comment ۳-۵ خطی در بالای فایل اضافه کن: purpose، inputs، outputs، side effects.
گام ۳: اگر فایل dead است، حذف کن.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `npm run lint`
- `npm run build`

## ⚠️ ریسک‌ها و موارد احتیاط
rename فایل ممکن است imports زیادی را break کند — قبل از rename همه usages را پیدا و یکجا update کن.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: audit
- اولویت: medium
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 9 از 9
  id: 60b4eaa6-6812-4e1b-976a-84e47016dddc
  عنوان اصلی: تعریف GEMINI_API_KEY در .env.example
  اولویت اصلی: low
  وضعیت verify قبلی: partial
  فایل‌های دخیل: backend/.env.example, backend/server.js

📋 acceptance_criteria کامل:
  - اعمال تغییر بدون شکستن تست‌های موجود [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]
  - linter بدون warning عبور می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["no-unused-vars", "no-undef"], "files_hint": ["backend/"]}]
  - type-check موفق است [verify_method=static] [verify_plan={"grep_patterns": ["TypeScript", "Flow"], "files_hint": ["backend/"]}]

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
متغیر محیطی GEMINI_API_KEY در backend/server.js خط 53 خوانده می‌شود اما در .env.example تعریف نشده است

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/.env.example:1-10` — `.env.example` — فایل .env.example موجود است اما محتوای آن مشخص نیست
  ```
  (محتوای فایل نمایش داده نشده است)
  ```
- `backend/server.js:53` — `GEMINI_API_KEY` — متغیر محیطی استفاده شده
  ```jsx
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🔍 Context و وضعیت فعلی
فایل backend/.env.example وجود دارد اما محتوای آن نمایش داده نشده است. با این حال، در backend/server.js خط 53 از متغیر محیطی GEMINI_API_KEY استفاده شده است. اگر این متغیر در .env.example تعریف نشده باشد، توسعه‌دهندگان جدید نمی‌دانند چه متغیرهایی باید تنظیم کنند. همچنین در render.yaml خط 8 این متغیر به عنوان sync: false تعریف شده که به معنی عدم همگام‌سازی با repository است.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] اعمال تغییر بدون شکستن تست‌های موجود
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. فایل backend/.env.example را با تمام متغیرهای محیطی مورد نیاز (GEMINI_API_KEY, PORT, NODE_ENV) به‌روزرسانی کنید. همچنین یک توضیح کوتاه درباره نحوه دریافت API Key از Google AI Studio اضافه کنید.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## ⚠️ ریسک‌ها و موارد احتیاط
پیش از merge، تست‌های موجود اجرا شوند تا رگرشن ایجاد نشود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: docs
- اولویت: low
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
- در commit message: `merged-from: 7c1da858-e52e-4791-9121-82794c82c52a, e00a1855-25c4-483d-b3b6-465d34383e3f, c826e12b-dc51-42a4-8c4c-61f446ddccca, 5564037e-a6ff-4ad6-a190-ec9a7783c825, dfc945a2-9d3b-4808-9e4b-2c93b8d8b00e, ac140bf8-b8db-4a11-83fe-5816b110603b, cae62312-11d9-47af-bc8e-9c0fadd3caf1, f101ec5e-3bdd-474c-9dcc-99d3b92f27b7, 60b4eaa6-6812-4e1b-976a-84e47016dddc`
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

🧬 این یک تسک تلفیقی است — از 9 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این تسک‌ها همگی به مستندسازی پروژه، از جمله ایجاد فایل‌های ضروری مانند .env.example و LICENSE، و همچنین افزودن توضیحات و مستندات داخلی برای فهم بهتر کد و معماری، مربوط می‌شوند. این کار به onboarding توسعه‌دهندگان جدید و نگهداری پروژه کمک می‌کند.
🎯 theme: ایجاد و بهبود مستندات پروژه، شامل فایل‌های پیکربندی، لایسنس و روشن‌سازی هدف کامپوننت‌های کلیدی و معماری کلی.
💎 estimated_difficulty: large

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 9
  id: 7c1da858-e52e-4791-9121-82794c82c52a
  عنوان اصلی: مستندسازی هدف کامپوننت‌های کلیدی و معماری
  اولویت اصلی: high
  وضعیت verify قبلی: pending
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - outcome target به‌صورت measurable بازنویسی شد [verify_method=static] [verify_plan={"grep_patterns": ["outcome target", "measurable", "effectiveness"], "files_hint": ["README.md", "docs/"]}]
  - کد تغییر کرد تا outcome target محقق شود [verify_method=static] [verify_plan={"grep_patterns": ["purpose of this component", "role of this file", "component purpose"], "files_hint": ["frontend/src/App.jsx", "backend/server.js", "frontend/index.html"]}]
  - test E2E که outcome را اندازه می‌گیرد عبور می‌کند [verify_method=backend_test] [verify_plan={"test_node": "tests/e2e/test_outcome_measurement.py::test_outcome_measurable", "timeout_seconds": 60}]
  - metric/log اضافه شد تا در production outcome rate قابل تشخیص باشد [verify_method=static] [verify_plan={"grep_patterns": ["outcome_rate", "metric", "log.*outcome"], "files_hint": ["backend/app.py", "backend/logging_config.py"]}]

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
[Effectiveness] عدم شفافیت در هدف اصلی کامپوننت‌های کلیدی

## 📍 موقعیت دقیق در پروژه
_(فایل‌های دقیق توسط مجری شناسایی شوند — هیچ موقعیت مشخصی استخراج نشد)_

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🔍 Context و وضعیت فعلی
## 🎯 هدف مطلوب (outcome target)
مستندسازی هدف هر کامپوننت (App.jsx, server.js, index.html) تا پایان هفته آینده

## 📊 وضعیت فعلی
هدف اصلی فایل‌های frontend/src/App.jsx، backend/server.js و frontend/index.html مشخص نیست و این موضوع باعث کاهش قابلیت نگهداری و توسعه تیمی می‌شود.

## 🛠 اقدام پیشنهادی
اضافه کردن کامنت‌های توضیحی در ابتدای هر فایل و به‌روزرسانی README پروژه با توضیح معماری و نقش هر کامپوننت.

## ⚙️ ماهیت این finding
این یک effectiveness issue است — کد ممکن است syntactically کار کند ولی **outcome مطلوب** (مثل: «فرم باید ایمیل ارسال کند») حاصل نمی‌شود. verify باید outcome را اندازه بگیرد، نه فقط وجود فایل/خط.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] outcome target به‌صورت measurable بازنویسی شد
- [ ] کد تغییر کرد تا outcome target محقق شود
- [ ] test E2E که outcome را اندازه می‌گیرد عبور می‌کند
- [ ] metric/log اضافه شد تا در production outcome rate قابل تشخیص باشد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: outcome target را به‌صورت قابل اندازه‌گیری بازنویسی کن (مثلاً: «email send rate > 95% در ۱۰۰ تلاش»).
گام ۲: کد را تغییر بده تا outcome محقق شود.
گام ۳: یک end-to-end test که outcome را اندازه می‌گیرد بنویس.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `pytest -k 'outcome or e2e'`

## ⚠️ ریسک‌ها و موارد احتیاط
بهبود outcome ممکن است latency یا cost را افزایش دهد — قبل/بعد metric ها را compare کن.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: logic_audit
- اولویت: high
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  - مستندسازی هدف کامپوننت App.jsx با کامنت توضیحی و به‌روزرسانی README — افزودن کامنت توضیحی در App.jsx و به‌روزرسانی README
  - مستندسازی هدف کامپوننت server.js با کامنت توضیحی و به‌روزرسانی README — افزودن کامنت توضیحی در server.js و به‌روزرسانی README
  - مستندسازی هدف کامپوننت index.html با کامنت توضیحی و به‌روزرسانی README — افزودن کامنت توضیحی در index.html و به‌روزرسانی README
  - به‌روزرسانی README پروژه با توضیح معماری کلی و نقش هر کامپوننت — به‌روزرسانی README با بخش معماری و نقش کامپوننت‌ها
  - نوشتن تست E2E که outcome مستندسازی را اندازه‌گیری می‌کند — نوشتن تست E2E برای بررسی وجود کامنت‌های توضیحی
  - اضافه کردن metric/log برای تشخیص outcome rate در production — افزودن metric/log برای تشخیص outcome rate در production
  - اجرای تست‌های موجود و linter/type-check برای اطمینان از عدم شکست — اجرای تست‌های موجود و linter/type-check

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 2 از 9
  id: e00a1855-25c4-483d-b3b6-465d34383e3f
  عنوان اصلی: Create .env.example for frontend variables
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: frontend/.env.example

📋 acceptance_criteria کامل:
  - frontend/.env.example exists with all required variables [verify_method=static] [verify_plan={"grep_patterns": ["VITE_API_URL", "VITE_FIREBASE_", "VITE_INSPECTOR_WS_URL"], "files_hint": ["frontend/.env.example"]}]
  - Each variable has a comment explaining its purpose [verify_method=static] [verify_plan={"grep_patterns": ["#.*VITE_API_URL", "#.*VITE_FIREBASE", "#.*VITE_INSPECTOR_WS_URL"], "files_hint": ["frontend/.env.example"]}]
  - Variables use VITE_ prefix as required by Vite [verify_method=static] [verify_plan={"grep_patterns": ["^VITE_"], "files_hint": ["frontend/.env.example"]}]

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
Missing .env.example for frontend environment variables

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/.env.example:1-10` — `N/A (file doesn't exist)` — File needs to be created
  ```
  # This file should be created with:
  # VITE_API_URL=http://localhost:3001
  # VITE_FIREBASE_API_KEY=your_firebase_api_key
  # ...
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Vite uses VITE_ prefix for environment variables exposed to client code

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `backend/.env.example` (سطر 1) — Existing example file that should be mirrored for frontend
- `frontend/src/App.jsx` (سطر 137) — Uses Firebase config that should come from env vars

## 🌐 نقشهٔ وابستگی‌ها
Affects developer onboarding and configuration management.

## 🔍 Context و وضعیت فعلی
The project has a backend/.env.example file but no corresponding frontend/.env.example. The frontend uses several environment variables that should be documented: VITE_API_URL (implied by API calls), VITE_FIREBASE_* variables (for Firebase config), and potentially VITE_INSPECTOR_WS_URL. Without a .env.example, new developers have no documentation of what environment variables are required to run the frontend, leading to configuration errors and runtime failures.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] frontend/.env.example exists with all required variables
- [ ] Each variable has a comment explaining its purpose
- [ ] Variables use VITE_ prefix as required by Vite
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. Create frontend/.env.example with all required environment variables documented. Include VITE_API_URL (defaulting to http://localhost:3001), VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_STORAGE_BUCKET, VITE_FIREBASE_MESSAGING_SENDER_ID, VITE_FIREBASE_APP_ID, and any other variables used by the frontend.

## 💡 نمونه‌های قبل/بعد
**Create frontend .env.example**

_قبل:_
```
// No frontend/.env.example exists
```

_بعد:_
```
# frontend/.env.example
VITE_API_URL=http://localhost:3001
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `test -f frontend/.env.example`
- `grep -c 'VITE_' frontend/.env.example`

## ⚠️ ریسک‌ها و موارد احتیاط
No risk; adding documentation only improves the project

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: docs
- اولویت: medium
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 3 از 9
  id: c826e12b-dc51-42a4-8c4c-61f446ddccca
  عنوان اصلی: Add license file to repository
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: LICENSE, package.json

📋 acceptance_criteria کامل:
  - اعمال تغییر بدون شکستن تست‌های موجود [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]
  - linter بدون warning عبور می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["no-license", "license-not-found", "missing-license"], "files_hint": ["backend/app/", "frontend/src/"]}]
  - type-check موفق است [verify_method=static] [verify_plan={"grep_patterns": ["type-check", "tsc --noEmit", "mypy"], "files_hint": ["backend/app/", "frontend/src/"]}]

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
No license file found in repository

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `LICENSE:1-21` — `N/A` — No LICENSE file in repository root
  ```
  File does not exist
  ```
- `package.json:1-12` — `license` — Missing license field in root package.json
  ```json
  {
    "name": "lebanese-dialect-learning",
    "version": "1.0.0",
    "description": "Lebanese Arabic Learning App with AI",
    "scripts": { ... },
    "keywords": [...],
    "license": "MIT"
  }
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🔍 Context و وضعیت فعلی
The repository does not contain a LICENSE file. The package.json files (root, backend, frontend) do not specify a license field. This is a legal risk because without a license, the default copyright laws apply, meaning others cannot legally use, modify, or distribute the code. The project uses dependencies with various licenses (MIT for most, but Firebase has its own terms), and the absence of a project license creates uncertainty about how the project can be used or contributed to.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] اعمال تغییر بدون شکستن تست‌های موجود
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. Add a LICENSE file to the repository root. Choose an appropriate open-source license (MIT is recommended for most projects) or specify proprietary rights. Update all package.json files to include the 'license' field. Ensure the chosen license is compatible with the dependencies' licenses.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## ⚠️ ریسک‌ها و موارد احتیاط
پیش از merge، تست‌های موجود اجرا شوند تا رگرشن ایجاد نشود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: docs
- اولویت: medium
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 4 از 9
  id: 5564037e-a6ff-4ad6-a190-ec9a7783c825
  عنوان اصلی: Add LICENSE file and resolve dependency conflicts
  اولویت اصلی: medium
  وضعیت verify قبلی: pending
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - اعمال تغییر بدون شکستن تست‌های موجود [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]
  - linter بدون warning عبور می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["lint", "eslint", "pylint", "ruff"], "files_hint": ["Makefile", "package.json", "pyproject.toml"]}]
  - type-check موفق است [verify_method=static] [verify_plan={"grep_patterns": ["type-check", "mypy", "tsc", "typecheck"], "files_hint": ["Makefile", "package.json", "pyproject.toml"]}]

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
Missing LICENSE file and potential dependency license conflicts

## 📍 موقعیت دقیق در پروژه
_(فایل‌های دقیق توسط مجری شناسایی شوند — هیچ موقعیت مشخصی استخراج نشد)_

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🔍 Context و وضعیت فعلی
The project does not include a LICENSE file. The root package.json specifies 'MIT' as the license, but no

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] اعمال تغییر بدون شکستن تست‌های موجود
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
_(مجری بر اساس Context و معیارهای پذیرش، مراحل را تعیین کند)_

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## ⚠️ ریسک‌ها و موارد احتیاط
پیش از merge، تست‌های موجود اجرا شوند تا رگرشن ایجاد نشود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: docs
- اولویت: medium
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 5 از 9
  id: dfc945a2-9d3b-4808-9e4b-2c93b8d8b00e
  عنوان اصلی: مستندسازی و تغییر نام server.js
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: backend/server.js

📋 acceptance_criteria کامل:
  - فایل docstring/header comment ۳-۵ خطی دارد که purpose را روشن می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["^\\s*\\/\\*\\*", "^\\s*\\/\\/\\s*Purpose", "^\\s*\\/\\/\\s*Description"], "files_hint": ["backend/server.js"]}]
  - اگر فایل بخشی از pipeline است، در docstring به upstream/downstream اشاره شده [verify_method=static] [verify_plan={"grep_patterns": ["upstream", "downstream", "pipeline", "input", "output"], "files_hint": ["backend/server.js"]}]
  - نام فایل (اگر مبهم) به نام معنادار rename شده [verify_method=static] [verify_plan={"grep_patterns": ["backend/server.js"], "files_hint": ["backend/server.js"]}]

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
فایل با هدف مبهم: server.js

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/server.js`

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🌐 نقشهٔ وابستگی‌ها
این مورد در پایپ‌لاین کدبیس به فایل‌های اطراف وابسته است؛ قبل از تغییر، grep روی نام symbol/path اصلی انجام شود.

## 🔍 Context و وضعیت فعلی
## 📋 شرح
فایل `backend/server.js` هیچ docstring/comment توضیحی در بالای فایل ندارد و نام آن purpose را روشن نمی‌کند.

## 🤔 چرا مهم است
کد بدون purpose maintenance hell ایجاد می‌کند — هر developer جدید باید reverse-engineer کند.

## 🔍 جزئیات
- علت: هدف این فایل از کد یا comments قابل استخراج نیست — نیاز به documentation یا حذف اگر unused

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فایل docstring/header comment ۳-۵ خطی دارد که purpose را روشن می‌کند
- [ ] اگر فایل بخشی از pipeline است، در docstring به upstream/downstream اشاره شده
- [ ] نام فایل (اگر مبهم) به نام معنادار rename شده
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: بخوان فایل و معنی واقعی‌اش را بفهم.
گام ۲: docstring/comment ۳-۵ خطی در بالای فایل اضافه کن: purpose، inputs، outputs، side effects.
گام ۳: اگر فایل dead است، حذف کن.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `npm run lint`
- `npm run build`

## ⚠️ ریسک‌ها و موارد احتیاط
rename فایل ممکن است imports زیادی را break کند — قبل از rename همه usages را پیدا و یکجا update کن.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: audit
- اولویت: medium
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 6 از 9
  id: ac140bf8-b8db-4a11-83fe-5816b110603b
  عنوان اصلی: مستندسازی و نامگذاری index.html
  اولویت اصلی: medium
  وضعیت verify قبلی: pending
  فایل‌های دخیل: frontend/index.html

📋 acceptance_criteria کامل:
  - فایل docstring/header comment ۳-۵ خطی دارد که purpose را روشن می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["docstring", "header", "comment", "purpose", "فایل", "دارد", "روشن"], "files_hint": []}]
  - اگر فایل بخشی از pipeline است، در docstring به upstream/downstream اشاره شده [verify_method=static] [verify_plan={"grep_patterns": ["pipeline", "docstring", "upstream", "downstream", "فایل", "بخشی", "است،", "اشاره"], "files_hint": []}]
  - نام فایل (اگر مبهم) به نام معنادار rename شده [verify_method=static] [verify_plan={"grep_patterns": ["rename", "فایل", "مبهم", "معنادار"], "files_hint": []}]

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
فایل با هدف مبهم: index.html

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/index.html`

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🌐 نقشهٔ وابستگی‌ها
این مورد در پایپ‌لاین کدبیس به فایل‌های اطراف وابسته است؛ قبل از تغییر، grep روی نام symbol/path اصلی انجام شود.

## 🔍 Context و وضعیت فعلی
## 📋 شرح
فایل `frontend/index.html` هیچ docstring/comment توضیحی در بالای فایل ندارد و نام آن purpose را روشن نمی‌کند.

## 🤔 چرا مهم است
کد بدون purpose maintenance hell ایجاد می‌کند — هر developer جدید باید reverse-engineer کند.

## 🔍 جزئیات
- علت: هدف این فایل از کد یا comments قابل استخراج نیست — نیاز به documentation یا حذف اگر unused

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فایل docstring/header comment ۳-۵ خطی دارد که purpose را روشن می‌کند
- [ ] اگر فایل بخشی از pipeline است، در docstring به upstream/downstream اشاره شده
- [ ] نام فایل (اگر مبهم) به نام معنادار rename شده
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: بخوان فایل و معنی واقعی‌اش را بفهم.
گام ۲: docstring/comment ۳-۵ خطی در بالای فایل اضافه کن: purpose، inputs، outputs، side effects.
گام ۳: اگر فایل dead است، حذف کن.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## ⚠️ ریسک‌ها و موارد احتیاط
rename فایل ممکن است imports زیادی را break کند — قبل از rename همه usages را پیدا و یکجا update کن.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: audit
- اولویت: medium
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 7 از 9
  id: cae62312-11d9-47af-bc8e-9c0fadd3caf1
  عنوان اصلی: مستندسازی هدف package-lock.json
  اولویت اصلی: medium
  وضعیت verify قبلی: pending
  فایل‌های دخیل: backend/package-lock.json

📋 acceptance_criteria کامل:
  - فایل docstring/header comment ۳-۵ خطی دارد که purpose را روشن می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["#.*purpose", "#.*package-lock", "#.*lock file", "#.*dependency"], "files_hint": ["backend/package-lock.json"]}]
  - اگر فایل بخشی از pipeline است، در docstring به upstream/downstream اشاره شده [verify_method=static] [verify_plan={"grep_patterns": ["upstream", "downstream", "pipeline", "build", "deploy"], "files_hint": ["backend/package-lock.json"]}]
  - نام فایل (اگر مبهم) به نام معنادار rename شده [verify_method=static] [verify_plan={"grep_patterns": ["backend/package-lock.json"], "files_hint": ["backend/"]}]

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
فایل با هدف مبهم: package-lock.json

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/package-lock.json`

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🌐 نقشهٔ وابستگی‌ها
این مورد در پایپ‌لاین کدبیس به فایل‌های اطراف وابسته است؛ قبل از تغییر، grep روی نام symbol/path اصلی انجام شود.

## 🔍 Context و وضعیت فعلی
## 📋 شرح
فایل `backend/package-lock.json` هیچ docstring/comment توضیحی در بالای فایل ندارد و نام آن purpose را روشن نمی‌کند.

## 🤔 چرا مهم است
کد بدون purpose maintenance hell ایجاد می‌کند — هر developer جدید باید reverse-engineer کند.

## 🔍 جزئیات
- علت: هدف این فایل از کد یا comments قابل استخراج نیست — نیاز به documentation یا حذف اگر unused

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فایل docstring/header comment ۳-۵ خطی دارد که purpose را روشن می‌کند
- [ ] اگر فایل بخشی از pipeline است، در docstring به upstream/downstream اشاره شده
- [ ] نام فایل (اگر مبهم) به نام معنادار rename شده
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: بخوان فایل و معنی واقعی‌اش را بفهم.
گام ۲: docstring/comment ۳-۵ خطی در بالای فایل اضافه کن: purpose، inputs، outputs، side effects.
گام ۳: اگر فایل dead است، حذف کن.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `python -c "import json; json.load(open('backend/package-lock.json'))"`

## ⚠️ ریسک‌ها و موارد احتیاط
rename فایل ممکن است imports زیادی را break کند — قبل از rename همه usages را پیدا و یکجا update کن.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: audit
- اولویت: medium
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 8 از 9
  id: f101ec5e-3bdd-474c-9dcc-99d3b92f27b7
  عنوان اصلی: روشن کردن هدف App.jsx
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: frontend/src/App.jsx

📋 acceptance_criteria کامل:
  - فایل docstring/header comment ۳-۵ خطی دارد که purpose را روشن می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["\"\"\"", "'''", "// purpose", "// Purpose"], "files_hint": ["frontend/src/App.jsx"]}]
  - اگر فایل بخشی از pipeline است، در docstring به upstream/downstream اشاره شده [verify_method=static] [verify_plan={"grep_patterns": ["upstream", "downstream", "pipeline"], "files_hint": ["frontend/src/App.jsx"]}]
  - نام فایل (اگر مبهم) به نام معنادار rename شده [verify_method=static] [verify_plan={"grep_patterns": ["frontend/src/"], "files_hint": ["frontend/src/"]}]

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
فایل با هدف مبهم: App.jsx

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/src/App.jsx`

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🌐 نقشهٔ وابستگی‌ها
این مورد در پایپ‌لاین کدبیس به فایل‌های اطراف وابسته است؛ قبل از تغییر، grep روی نام symbol/path اصلی انجام شود.

## 🔍 Context و وضعیت فعلی
## 📋 شرح
فایل `frontend/src/App.jsx` هیچ docstring/comment توضیحی در بالای فایل ندارد و نام آن purpose را روشن نمی‌کند.

## 🤔 چرا مهم است
کد بدون purpose maintenance hell ایجاد می‌کند — هر developer جدید باید reverse-engineer کند.

## 🔍 جزئیات
- علت: هدف این فایل از کد یا comments قابل استخراج نیست — نیاز به documentation یا حذف اگر unused

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فایل docstring/header comment ۳-۵ خطی دارد که purpose را روشن می‌کند
- [ ] اگر فایل بخشی از pipeline است، در docstring به upstream/downstream اشاره شده
- [ ] نام فایل (اگر مبهم) به نام معنادار rename شده
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. گام ۱: بخوان فایل و معنی واقعی‌اش را بفهم.
گام ۲: docstring/comment ۳-۵ خطی در بالای فایل اضافه کن: purpose، inputs، outputs، side effects.
گام ۳: اگر فایل dead است، حذف کن.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `npm run lint`
- `npm run build`

## ⚠️ ریسک‌ها و موارد احتیاط
rename فایل ممکن است imports زیادی را break کند — قبل از rename همه usages را پیدا و یکجا update کن.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: audit
- اولویت: medium
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 9 از 9
  id: 60b4eaa6-6812-4e1b-976a-84e47016dddc
  عنوان اصلی: تعریف GEMINI_API_KEY در .env.example
  اولویت اصلی: low
  وضعیت verify قبلی: partial
  فایل‌های دخیل: backend/.env.example, backend/server.js

📋 acceptance_criteria کامل:
  - اعمال تغییر بدون شکستن تست‌های موجود [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]
  - linter بدون warning عبور می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["no-unused-vars", "no-undef"], "files_hint": ["backend/"]}]
  - type-check موفق است [verify_method=static] [verify_plan={"grep_patterns": ["TypeScript", "Flow"], "files_hint": ["backend/"]}]

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
متغیر محیطی GEMINI_API_KEY در backend/server.js خط 53 خوانده می‌شود اما در .env.example تعریف نشده است

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/.env.example:1-10` — `.env.example` — فایل .env.example موجود است اما محتوای آن مشخص نیست
  ```
  (محتوای فایل نمایش داده نشده است)
  ```
- `backend/server.js:53` — `GEMINI_API_KEY` — متغیر محیطی استفاده شده
  ```jsx
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🔍 Context و وضعیت فعلی
فایل backend/.env.example وجود دارد اما محتوای آن نمایش داده نشده است. با این حال، در backend/server.js خط 53 از متغیر محیطی GEMINI_API_KEY استفاده شده است. اگر این متغیر در .env.example تعریف نشده باشد، توسعه‌دهندگان جدید نمی‌دانند چه متغیرهایی باید تنظیم کنند. همچنین در render.yaml خط 8 این متغیر به عنوان sync: false تعریف شده که به معنی عدم همگام‌سازی با repository است.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] اعمال تغییر بدون شکستن تست‌های موجود
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. فایل backend/.env.example را با تمام متغیرهای محیطی مورد نیاز (GEMINI_API_KEY, PORT, NODE_ENV) به‌روزرسانی کنید. همچنین یک توضیح کوتاه درباره نحوه دریافت API Key از Google AI Studio اضافه کنید.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## ⚠️ ریسک‌ها و موارد احتیاط
پیش از merge، تست‌های موجود اجرا شوند تا رگرشن ایجاد نشود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: docs
- اولویت: low
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
- در commit message: `merged-from: 7c1da858-e52e-4791-9121-82794c82c52a, e00a1855-25c4-483d-b3b6-465d34383e3f, c826e12b-dc51-42a4-8c4c-61f446ddccca, 5564037e-a6ff-4ad6-a190-ec9a7783c825, dfc945a2-9d3b-4808-9e4b-2c93b8d8b00e, ac140bf8-b8db-4a11-83fe-5816b110603b, cae62312-11d9-47af-bc8e-9c0fadd3caf1, f101ec5e-3bdd-474c-9dcc-99d3b92f27b7, 60b4eaa6-6812-4e1b-976a-84e47016dddc`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Acceptance Criteria

1. frontend/.env.example exists with all required variables _(verify: static)_
2. Each variable has a comment explaining its purpose _(verify: static)_
3. Variables use VITE_ prefix as required by Vite _(verify: static)_
4. اعمال تغییر بدون شکستن تست‌های موجود _(verify: backend_test)_
5. linter بدون warning عبور می‌کند _(verify: static)_
6. type-check موفق است _(verify: static)_
7. outcome target به‌صورت measurable بازنویسی شد _(verify: static)_
8. کد تغییر کرد تا outcome target محقق شود _(verify: static)_
9. test E2E که outcome را اندازه می‌گیرد عبور می‌کند _(verify: backend_test)_
10. metric/log اضافه شد تا در production outcome rate قابل تشخیص باشد _(verify: static)_
11. فایل docstring/header comment ۳-۵ خطی دارد که purpose را روشن می‌کند _(verify: static)_
12. اگر فایل بخشی از pipeline است، در docstring به upstream/downstream اشاره شده _(verify: static)_
13. نام فایل (اگر مبهم) به نام معنادار rename شده _(verify: static)_

## Task Steps

### Step 1: بررسی اولیه repo برای وجود مستندات قبلی (یادداشت مهم)
**Status:** `done` (100%)
**Scope:** این مرحله شامل بررسی کامل repo با grep/search برای یافتن هرگونه مستندات، کامنت، یا فایل‌های مرتبط با هدف کامپوننت‌ها است. قبل از هر تغییری، باید مشخص شود که چه چیزی از قبل وجود دارد. این مرحله شامل هیچ تغییری در کد نیست، فقط بررسی و مستندسازی وضعیت فعلی است. نکته حیاتی: اگر همه چیز از قبل به درستی انجام شده، یک کامیت توضیحی (no-op) ثبت شود.
**Excerpt:**
```
## ⚠️ یادداشت مهم برای مدل اجراکننده — قبل از شروع بخوان

این پرامپت بر اساس یک **بررسی اولیهٔ خودکار** از repo ساخته شده — ممکن است حاوی اشتباه، تشخیص نادرست، یا حذف موارد مهم باشد. به‌عنوان منبع نهایی به آن استناد نکن.

♻️ **احتمال پیاده‌سازی قبلی (مهم):**
- ممکن است **بخشی یا تمامِ** این درخواست قبلاً (به صورت کامل یا ناقص) در repo پیاده‌سازی شده باشد. پیش از شروع، با grep/search و خواندن فایل‌های مرتبط بررسی کن که چه چیزی **از قبل وجود دارد**.
- اگر یک قابلیت/فایل/تابع از قبل موجود است: آن را **دوباره نساز**؛ فقط موارد ناقص یا اشتباه را اصلاح/تکمیل کن.
- اگر همه چیز از قبل به‌درستی انجام شده: یک کامیت توضیحی (no-op) ثبت کن که چرا تغییری لازم نبود و دقیقاً کدام فایل‌ها این درخواست را پوشش می‌دهند.
```

### Step 2: بازنویسی outcome target به صورت measurable (تسک 1)
**Status:** `done` (100%)
**Scope:** این مرحله شامل بازنویسی هدف (outcome target) برای مستندسازی کامپوننت‌ها به صورت قابل اندازه‌گیری است. هدف باید به صورت کمی و قابل سنجش تعریف شود، مثلاً 'email send rate > 95% در ۱۰۰ تلاش'. این مرحله فقط شامل بازنویسی هدف است و شامل تغییر کد نمی‌شود. فایل‌های هدف: README.md و docs/.
**Excerpt:**
```
- [ ] outcome target به‌صورت measurable بازنویسی شد [verify_method=static] [verify_plan={"grep_patterns": ["outcome target", "measurable", "effectiveness"], "files_hint": ["README.md", "docs/"]}]
```

### Step 3: تغییر کد برای محقق شدن outcome target (تسک 1)
**Status:** `partial` (60%)
**Scope:** این مرحله شامل تغییر کد در فایل‌های frontend/src/App.jsx، backend/server.js و frontend/index.html برای محقق شدن outcome target است. باید کامنت‌های توضیحی در ابتدای هر فایل اضافه شود که purpose، inputs، outputs و side effects را توضیح دهد. این مرحله شامل به‌روزرسانی README نیست.
**Excerpt:**
```
- [ ] کد تغییر کرد تا outcome target محقق شود [verify_method=static] [verify_plan={"grep_patterns": ["purpose of this component", "role of this file", "component purpose"], "files_hint": ["frontend/src/App.jsx", "backend/server.js", "frontend/index.html"]}]
```

### Step 4: نوشتن تست E2E برای اندازه‌گیری outcome (تسک 1)
**Status:** `not_done` (0%)
**Scope:** این مرحله شامل نوشتن یک تست End-to-End (E2E) است که outcome مستندسازی را اندازه‌گیری می‌کند. تست باید در فایل tests/e2e/test_outcome_measurement.py و با نام test_outcome_measurable نوشته شود. این تست باید بررسی کند که کامنت‌های توضیحی در فایل‌های هدف وجود دارند.
**Excerpt:**
```
- [ ] test E2E که outcome را اندازه می‌گیرد عبور می‌کند [verify_method=backend_test] [verify_plan={"test_node": "tests/e2e/test_outcome_measurement.py::test_outcome_measurable", "timeout_seconds": 60}]
```

### Step 5: اضافه کردن metric/log برای تشخیص outcome rate در production (تسک 1)
**Status:** `done` (100%)
**Scope:** این مرحله شامل اضافه کردن metric یا log به فایل‌های backend/app.py و backend/logging_config.py است تا در production، outcome rate قابل تشخیص باشد. باید از کلماتی مانند 'outcome_rate'، 'metric' یا 'log.*outcome' استفاده شود. این مرحله شامل تغییر frontend نیست.
— [merged] این مرحله شامل اضافه کردن metric یا log به فایل‌های backend/app.py و backend/logging_config.py است تا در production، outcome rate قابل تشخیص باشد. باید از کلماتی مانند 'outcome_rate'، 'metric' یا 'log.*outcome' استفاده شود.
**Excerpt:**
```
- [ ] metric/log اضافه شد تا در production outcome rate قابل تشخیص باشد [verify_method=static] [verify_plan={"grep_patterns": ["outcome_rate", "metric", "log.*outcome"], "files_hint": ["backend/app.py", "backend/logging_config.py"]}]
```

### Step 6: مستندسازی هدف کامپوننت App.jsx با کامنت توضیحی (تسک 1 - remaining)
**Status:** `partial` (50%)
**Scope:** این مرحله شامل افزودن یک کامنت توضیحی در ابتدای فایل frontend/src/App.jsx است که purpose اصلی این کامپوننت را توضیح می‌دهد. کامنت باید ۳-۵ خطی باشد و شامل purpose، inputs، outputs و side effects باشد. این مرحله شامل به‌روزرسانی README نیست.
**Excerpt:**
```
- مستندسازی هدف کامپوننت App.jsx با کامنت توضیحی و به‌روزرسانی README — افزودن کامنت توضیحی در App.jsx و به‌روزرسانی README
```

### Step 7: مستندسازی هدف کامپوننت server.js با کامنت توضیحی (تسک 1 - remaining)
**Status:** `done` (100%)
**Scope:** این مرحله شامل افزودن یک کامنت توضیحی در ابتدای فایل backend/server.js است که purpose اصلی این فایل را توضیح می‌دهد. کامنت باید ۳-۵ خطی باشد و شامل purpose، inputs، outputs و side effects باشد. این مرحله شامل به‌روزرسانی README نیست.
**Excerpt:**
```
- مستندسازی هدف کامپوننت server.js با کامنت توضیحی و به‌روزرسانی README — افزودن کامنت توضیحی در server.js و به‌روزرسانی README
```

### Step 8: مستندسازی هدف کامپوننت index.html با کامنت توضیحی (تسک 1 - remaining)
**Status:** `not_done` (0%)
**Scope:** این مرحله شامل افزودن یک کامنت توضیحی در ابتدای فایل frontend/index.html است که purpose اصلی این فایل را توضیح می‌دهد. کامنت باید ۳-۵ خطی باشد و شامل purpose، inputs، outputs و side effects باشد. این مرحله شامل به‌روزرسانی README نیست.
**Excerpt:**
```
- مستندسازی هدف کامپوننت index.html با کامنت توضیحی و به‌روزرسانی README — افزودن کامنت توضیحی در index.html و به‌روزرسانی README
```

### Step 9: به‌روزرسانی README پروژه با توضیح معماری کلی و نقش هر کامپوننت (تسک 1 - remaining)
**Status:** `partial` (30%)
**Scope:** این مرحله شامل به‌روزرسانی فایل README.md پروژه با اضافه کردن یک بخش جدید برای توضیح معماری کلی و نقش هر کامپوننت (App.jsx, server.js, index.html) است. این بخش باید شامل توضیح ارتباط بین کامپوننت‌ها و نقش هر کدام در کل سیستم باشد.
**Excerpt:**
```
- به‌روزرسانی README پروژه با توضیح معماری کلی و نقش هر کامپوننت — به‌روزرسانی README با بخش معماری و نقش کامپوننت‌ها
```

### Step 10: نوشتن تست E2E برای بررسی وجود کامنت‌های توضیحی (تسک 1 - remaining)
**Status:** `not_done` (0%)
**Scope:** این مرحله شامل نوشتن یک تست E2E است که وجود کامنت‌های توضیحی در فایل‌های frontend/src/App.jsx، backend/server.js و frontend/index.html را بررسی می‌کند. این تست باید در فایل tests/e2e/test_outcome_measurement.py اضافه شود و با دستور pytest -k 'outcome or e2e' قابل اجرا باشد.
**Excerpt:**
```
- نوشتن تست E2E که outcome مستندسازی را اندازه‌گیری می‌کند — نوشتن تست E2E برای بررسی وجود کامنت‌های توضیحی
```

### Step 11: اجرای تست‌های موجود و linter/type-check برای اطمینان از عدم شکست (تسک 1 - remaining)
**Status:** `done` (100%)
**Scope:** این مرحله شامل اجرای تمام تست‌های موجود (npm run test / pytest)، linter (بدون warning) و type-check (tsc --noEmit / mypy) برای اطمینان از اینکه تغییرات ایجاد شده باعث شکست هیچکدام نمی‌شود. این مرحله شامل هیچ تغییری در کد نیست.
**Excerpt:**
```
- اجرای تست‌های موجود و linter/type-check برای اطمینان از عدم شکست — اجرای تست‌های موجود و linter/type-check
```

### Step 12: ایجاد فایل frontend/.env.example با تمام متغیرهای مورد نیاز (تسک 2)
**Status:** `done` (100%)
**Scope:** این مرحله شامل ایجاد فایل frontend/.env.example در مسیر ریشه frontend است. این فایل باید شامل تمام متغیرهای محیطی مورد نیاز frontend باشد: VITE_API_URL (پیش‌فرض http://localhost:3001)، VITE_FIREBASE_API_KEY، VITE_FIREBASE_AUTH_DOMAIN، VITE_FIREBASE_PROJECT_ID، VITE_FIREBASE_STORAGE_BUCKET، VITE_FIREBASE_MESSAGING_SENDER_ID، VITE_FIREBASE_APP_ID و VITE_INSPECTOR_WS_URL. هر متغیر باید یک کامنت توضیحی داشته باشد.
**Excerpt:**
```
## 🎯 هدف (خلاصه ساختاریافته)
Missing .env.example for frontend environment variables

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/.env.example:1-10` — `N/A (file doesn't exist)` — File needs to be created
  ```
  # This file should be created with:
  # VITE_API_URL=http://localhost:3001
  # VITE_FIREBASE_API_KEY=your_firebase_api_key
  # ...
  ```
```

### Step 13: اضافه کردن کامنت توضیحی برای هر متغیر در frontend/.env.example (تسک 2)
**Status:** `partial` (60%)
**Scope:** این مرحله شامل اضافه کردن یک کامنت توضیحی برای هر متغیر در فایل frontend/.env.example است. کامنت‌ها باید purpose هر متغیر را توضیح دهند. مثلاً '# Base URL for the backend API' برای VITE_API_URL. این مرحله شامل ایجاد فایل نیست (فرض بر این است که فایل در مرحله قبل ایجاد شده).
**Excerpt:**
```
- [ ] Each variable has a comment explaining its purpose [verify_method=static] [verify_plan={"grep_patterns": ["#.*VITE_API_URL", "#.*VITE_FIREBASE", "#.*VITE_INSPECTOR_WS_URL"], "files_hint": ["frontend/.env.example"]}]
```

### Step 14: اطمینان از استفاده از پیشوند VITE_ برای متغیرها در frontend/.env.example (تسک 2)
**Status:** `done` (100%)
**Scope:** این مرحله شامل بررسی و اطمینان از اینکه تمام متغیرهای تعریف شده در frontend/.env.example از پیشوند VITE_ استفاده می‌کنند، است. این پیشوند توسط Vite برای متغیرهای محیطی که در معرض کد کلاینت قرار می‌گیرند، الزامی است. این مرحله شامل تغییر کد frontend نیست.
**Excerpt:**
```
- [ ] Variables use VITE_ prefix as required by Vite [verify_method=static] [verify_plan={"grep_patterns": ["^VITE_"], "files_hint": ["frontend/.env.example"]}]
```

### Step 15: اضافه کردن فایل LICENSE به ریشه repository (تسک 3)
**Status:** `done` (100%)
**Scope:** این مرحله شامل ایجاد فایل LICENSE در ریشه repository است. باید یک مجوز متن‌باز مناسب (MIT توصیه می‌شود) انتخاب شود. محتوای فایل LICENSE باید متن کامل مجوز MIT باشد. این مرحله شامل به‌روزرسانی package.json نیست.
**Excerpt:**
```
## 🎯 هدف (خلاصه ساختاریافته)
No license file found in repository

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `LICENSE:1-21` — `N/A` — No LICENSE file in repository root
  ```
  File does not exist
  ```
```

### Step 16: به‌روزرسانی فایل package.json با فیلد license (تسک 3)
**Status:** `pending` (0%)
**Scope:** این مرحله شامل به‌روزرسانی فایل package.json در ریشه repository برای اضافه کردن فیلد 'license' با مقدار 'MIT' است. این مرحله شامل به‌روزرسانی package.json در مسیرهای backend یا frontend نیست.
**Excerpt:**
```
- `package.json:1-12` — `license` — Missing license field in root package.json
  ```json
  {
    "name": "lebanese-dialect-learning",
    "version": "1.0.0",
    "description": "Lebanese Arabic Learning App with AI",
    "scripts": { ... },
    "keywords": [...],
    "license": "MIT"
  }
  ```
```

### Step 17: اجرای تست‌های موجود برای اطمینان از عدم شکست (تسک 3)
**Status:** `done` (100%)
**Scope:** این مرحله شامل اجرای تمام تست‌های موجود (npm run test / pytest) برای اطمینان از اینکه اضافه کردن فایل LICENSE و به‌روزرسانی package.json باعث شکست هیچکدام نمی‌شود. این مرحله شامل هیچ تغییری در کد نیست.
— [merged] این مرحله شامل اجرای تمام تست‌های موجود (npm run test / pytest) برای اطمینان از اینکه اضافه کردن فایل LICENSE و به‌روزرسانی package.json باعث شکست هیچکدام نمی‌شود. این مرحله شامل هیچ تغییری در کد نیست.
**Excerpt:**
```
- [ ] اعمال تغییر بدون شکستن تست‌های موجود [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]
```

### Step 18: اجرای linter بدون warning (تسک 3)
**Status:** `done` (100%)
**Scope:** این مرحله شامل اجرای linter (eslint, pylint, ruff) برای اطمینان از اینکه تغییرات ایجاد شده باعث هیچ warning جدیدی نمی‌شود. این مرحله شامل هیچ تغییری در کد نیست.
— [merged] این مرحله شامل اجرای linter (eslint, pylint, ruff) برای اطمینان از اینکه تغییرات ایجاد شده باعث هیچ warning جدیدی نمی‌شود. این مرحله شامل هیچ تغییری در کد نیست.
**Excerpt:**
```
- [ ] linter بدون warning عبور می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["no-license", "license-not-found", "missing-license"], "files_hint": ["backend/app/", "frontend/src/"]}]
```

### Step 19: اجرای type-check موفق (تسک 3)
**Status:** `done` (100%)
**Scope:** این مرحله شامل اجرای type-check (tsc --noEmit / mypy) برای اطمینان از اینکه تغییرات ایجاد شده باعث هیچ خطای type جدیدی نمی‌شود. این مرحله شامل هیچ تغییری در کد نیست.
— [merged] این مرحله شامل اجرای type-check (tsc --noEmit / mypy) برای اطمینان از اینکه تغییرات ایجاد شده باعث هیچ خطای type جدیدی نمی‌شود. این مرحله شامل هیچ تغییری در کد نیست.
**Excerpt:**
```
- [ ] type-check موفق است [verify_method=static] [verify_plan={"grep_patterns": ["type-check", "tsc --noEmit", "mypy"], "files_hint": ["backend/app/", "frontend/src/"]}]
```

### Step 20: اضافه کردن فایل LICENSE و به‌روزرسانی package.json (تسک 4)
**Status:** `pending` (0%)
**Scope:** این مرحله مشابه تسک 3 است اما با اولویت بالاتر برای resolve dependency conflicts. شامل ایجاد فایل LICENSE در ریشه repository با مجوز MIT و به‌روزرسانی فایل package.json در ریشه با فیلد 'license': 'MIT'. این مرحله شامل بررسی compatibility مجوز با dependencyها است.
**Excerpt:**
```
## 🎯 هدف (خلاصه ساختاریافته)
Missing LICENSE file and potential dependency license conflicts

## 📍 موقعیت دقیق در پروژه
_(فایل‌های دقیق توسط مجری شناسایی شوند — هیچ موقعیت مشخصی استخراج نشد)_
```

### Step 21: خواندن فایل backend/server.js و فهمیدن purpose واقعی آن (تسک 5)
**Status:** `done` (100%)
**Scope:** این مرحله شامل خواندن کامل فایل backend/server.js برای فهمیدن purpose واقعی آن است. باید مشخص شود که این فایل چه کاری انجام می‌دهد، چه inputs و outputs دارد، و آیا بخشی از یک pipeline است یا خیر. این مرحله شامل هیچ تغییری در کد نیست.
**Excerpt:**
```
1. گام ۱: بخوان فایل و معنی واقعی‌اش را بفهم.
گام ۲: docstring/comment ۳-۵ خطی در بالای فایل اضافه کن: purpose، inputs، outputs، side effects.
گام ۳: اگر فایل dead است، حذف کن.
```

### Step 22: اضافه کردن docstring/comment ۳-۵ خطی به backend/server.js (تسک 5)
**Status:** `done` (100%)
**Scope:** این مرحله شامل اضافه کردن یک docstring یا header comment ۳-۵ خطی در بالای فایل backend/server.js است. این کامنت باید purpose، inputs، outputs و side effects فایل را توضیح دهد. اگر فایل بخشی از pipeline است، باید به upstream/downstream اشاره کند.
**Excerpt:**
```
- [ ] فایل docstring/header comment ۳-۵ خطی دارد که purpose را روشن می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["^\\s*\\/\\*\\*", "^\\s*\\/\\/\\s*Purpose", "^\\s*\\/\\/\\s*Description"], "files_hint": ["backend/server.js"]}]
```

### Step 23: بررسی و اشاره به upstream/downstream در docstring server.js (تسک 5)
**Status:** `pending` (0%)
**Scope:** این مرحله شامل بررسی اینکه آیا فایل backend/server.js بخشی از یک pipeline است یا خیر، و در صورت مثبت بودن، اضافه کردن اشاره به upstream/downstream در docstring است. این مرحله شامل تغییر کد نیست مگر برای به‌روزرسانی docstring.
**Excerpt:**
```
- [ ] اگر فایل بخشی از pipeline است، در docstring به upstream/downstream اشاره شده [verify_method=static] [verify_plan={"grep_patterns": ["upstream", "downstream", "pipeline", "input", "output"], "files_hint": ["backend/server.js"]}]
```

### Step 24: تغییر نام backend/server.js به نام معنادار (تسک 5)
**Status:** `done` (100%)
**Scope:** این مرحله شامل تغییر نام فایل backend/server.js به یک نام معنادارتر است، اگر نام فعلی purpose را روشن نمی‌کند. قبل از rename، باید تمام usages فایل در سراسر پروژه پیدا و یکجا به‌روزرسانی شوند. این مرحله شامل به‌روزرسانی تمام importها و ارجاعات است.
**Excerpt:**
```
- [ ] نام فایل (اگر مبهم) به نام معنادار rename شده [verify_method=static] [verify_plan={"grep_patterns": ["backend/server.js"], "files_hint": ["backend/server.js"]}]
```

### Step 25: خواندن فایل frontend/index.html و فهمیدن purpose واقعی آن (تسک 6)
**Status:** `done` (100%)
**Scope:** این مرحله شامل خواندن کامل فایل frontend/index.html برای فهمیدن purpose واقعی آن است. باید مشخص شود که این فایل چه کاری انجام می‌دهد، چه inputs و outputs دارد، و آیا بخشی از یک pipeline است یا خیر. این مرحله شامل هیچ تغییری در کد نیست.
**Excerpt:**
```
1. گام ۱: بخوان فایل و معنی واقعی‌اش را بفهم.
گام ۲: docstring/comment ۳-۵ خطی در بالای فایل اضافه کن: purpose، inputs، outputs، side effects.
گام ۳: اگر فایل dead است، حذف کن.
```

### Step 26: اضافه کردن docstring/comment ۳-۵ خطی به frontend/index.html (تسک 6)
**Status:** `pending` (0%)
**Scope:** این مرحله شامل اضافه کردن یک docstring یا header comment ۳-۵ خطی در بالای فایل frontend/index.html است. این کامنت باید purpose، inputs، outputs و side effects فایل را توضیح دهد. اگر فایل بخشی از pipeline است، باید به upstream/downstream اشاره کند.
**Excerpt:**
```
- [ ] فایل docstring/header comment ۳-۵ خطی دارد که purpose را روشن می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["docstring", "header", "comment", "purpose", "فایل", "دارد", "روشن"], "files_hint": []}]
```

### Step 27: بررسی و اشاره به upstream/downstream در docstring index.html (تسک 6)
**Status:** `pending` (0%)
**Scope:** این مرحله شامل بررسی اینکه آیا فایل frontend/index.html بخشی از یک pipeline است یا خیر، و در صورت مثبت بودن، اضافه کردن اشاره به upstream/downstream در docstring است. این مرحله شامل تغییر کد نیست مگر برای به‌روزرسانی docstring.
**Excerpt:**
```
- [ ] اگر فایل بخشی از pipeline است، در docstring به upstream/downstream اشاره شده [verify_method=static] [verify_plan={"grep_patterns": ["pipeline", "docstring", "upstream", "downstream", "فایل", "بخشی", "است،", "اشاره"], "files_hint": []}]
```

### Step 28: تغییر نام frontend/index.html به نام معنادار (تسک 6)
**Status:** `pending` (0%)
**Scope:** این مرحله شامل تغییر نام فایل frontend/index.html به یک نام معنادارتر است، اگر نام فعلی purpose را روشن نمی‌کند. قبل از rename، باید تمام usages فایل در سراسر پروژه پیدا و یکجا به‌روزرسانی شوند. این مرحله شامل به‌روزرسانی تمام importها و ارجاعات است.
**Excerpt:**
```
- [ ] نام فایل (اگر مبهم) به نام معنادار rename شده [verify_method=static] [verify_plan={"grep_patterns": ["rename", "فایل", "مبهم", "معنادار"], "files_hint": []}]
```

### Step 29: خواندن فایل backend/package-lock.json و فهمیدن purpose واقعی آن (تسک 7)
**Status:** `done` (100%)
**Scope:** این مرحله شامل خواندن کامل فایل backend/package-lock.json برای فهمیدن purpose واقعی آن است. باید مشخص شود که این فایل چه کاری انجام می‌دهد، چه inputs و outputs دارد، و آیا بخشی از یک pipeline است یا خیر. این مرحله شامل هیچ تغییری در کد نیست.
**Excerpt:**
```
1. گام ۱: بخوان فایل و معنی واقعی‌اش را بفهم.
گام ۲: docstring/comment ۳-۵ خطی در بالای فایل اضافه کن: purpose، inputs، outputs، side effects.
گام ۳: اگر فایل dead است، حذف کن.
```

### Step 30: اضافه کردن docstring/comment ۳-۵ خطی به backend/package-lock.json (تسک 7)
**Status:** `pending` (0%)
**Scope:** این مرحله شامل اضافه کردن یک docstring یا header comment ۳-۵ خطی در بالای فایل backend/package-lock.json است. این کامنت باید purpose، inputs، outputs و side effects فایل را توضیح دهد. اگر فایل بخشی از pipeline است، باید به upstream/downstream اشاره کند.
**Excerpt:**
```
- [ ] فایل docstring/header comment ۳-۵ خطی دارد که purpose را روشن می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["#.*purpose", "#.*package-lock", "#.*lock file", "#.*dependency"], "files_hint": ["backend/package-lock.json"]}]
```

### Step 31: بررسی و اشاره به upstream/downstream در docstring package-lock.json (تسک 7)
**Status:** `pending` (0%)
**Scope:** این مرحله شامل بررسی اینکه آیا فایل backend/package-lock.json بخشی از یک pipeline است یا خیر، و در صورت مثبت بودن، اضافه کردن اشاره به upstream/downstream در docstring است. این مرحله شامل تغییر کد نیست مگر برای به‌روزرسانی docstring.
**Excerpt:**
```
- [ ] اگر فایل بخشی از pipeline است، در docstring به upstream/downstream اشاره شده [verify_method=static] [verify_plan={"grep_patterns": ["upstream", "downstream", "pipeline", "build", "deploy"], "files_hint": ["backend/package-lock.json"]}]
```

### Step 32: تغییر نام backend/package-lock.json به نام معنادار (تسک 7)
**Status:** `pending` (0%)
**Scope:** این مرحله شامل تغییر نام فایل backend/package-lock.json به یک نام معنادارتر است، اگر نام فعلی purpose را روشن نمی‌کند. قبل از rename، باید تمام usages فایل در سراسر پروژه پیدا و یکجا به‌روزرسانی شوند. این مرحله شامل به‌روزرسانی تمام importها و ارجاعات است.
**Excerpt:**
```
- [ ] نام فایل (اگر مبهم) به نام معنادار rename شده [verify_method=static] [verify_plan={"grep_patterns": ["backend/package-lock.json"], "files_hint": ["backend/"]}]
```

### Step 33: خواندن فایل frontend/src/App.jsx و فهمیدن purpose واقعی آن (تسک 8)
**Status:** `done` (100%)
**Scope:** این مرحله شامل خواندن کامل فایل frontend/src/App.jsx برای فهمیدن purpose واقعی آن است. باید مشخص شود که این فایل چه کاری انجام می‌دهد، چه inputs و outputs دارد، و آیا بخشی از یک pipeline است یا خیر. این مرحله شامل هیچ تغییری در کد نیست.
**Excerpt:**
```
1. گام ۱: بخوان فایل و معنی واقعی‌اش را بفهم.
گام ۲: docstring/comment ۳-۵ خطی در بالای فایل اضافه کن: purpose، inputs، outputs، side effects.
گام ۳: اگر فایل dead است، حذف کن.
```

### Step 34: اضافه کردن docstring/comment ۳-۵ خطی به frontend/src/App.jsx (تسک 8)
**Status:** `done` (100%)
**Scope:** این مرحله شامل اضافه کردن یک docstring یا header comment ۳-۵ خطی در بالای فایل frontend/src/App.jsx است. این کامنت باید purpose، inputs، outputs و side effects فایل را توضیح دهد. اگر فایل بخشی از pipeline است، باید به upstream/downstream اشاره کند.
**Excerpt:**
```
- [ ] فایل docstring/header comment ۳-۵ خطی دارد که purpose را روشن می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["""", "'''", "// purpose", "// Purpose"], "files_hint": ["frontend/src/App.jsx"]}]
```

### Step 35: بررسی و اشاره به upstream/downstream در docstring App.jsx (تسک 8)
**Status:** `done` (100%)
**Scope:** این مرحله شامل بررسی اینکه آیا فایل frontend/src/App.jsx بخشی از یک pipeline است یا خیر، و در صورت مثبت بودن، اضافه کردن اشاره به upstream/downstream در docstring است. این مرحله شامل تغییر کد نیست مگر برای به‌روزرسانی docstring.
**Excerpt:**
```
- [ ] اگر فایل بخشی از pipeline است، در docstring به upstream/downstream اشاره شده [verify_method=static] [verify_plan={"grep_patterns": ["upstream", "downstream", "pipeline"], "files_hint": ["frontend/src/App.jsx"]}]
```

### Step 36: تغییر نام frontend/src/App.jsx به نام معنادار (تسک 8)
**Status:** `pending` (0%)
**Scope:** این مرحله شامل تغییر نام فایل frontend/src/App.jsx به یک نام معنادارتر است، اگر نام فعلی purpose را روشن نمی‌کند. قبل از rename، باید تمام usages فایل در سراسر پروژه پیدا و یکجا به‌روزرسانی شوند. این مرحله شامل به‌روزرسانی تمام importها و ارجاعات است.
**Excerpt:**
```
- [ ] نام فایل (اگر مبهم) به نام معنادار rename شده [verify_method=static] [verify_plan={"grep_patterns": ["frontend/src/"], "files_hint": ["frontend/src/"]}]
```

### Step 37: بررسی محتوای فعلی backend/.env.example (تسک 9)
**Status:** `done` (100%)
**Scope:** این مرحله شامل خواندن و بررسی محتوای فعلی فایل backend/.env.example است تا مشخص شود چه متغیرهایی از قبل تعریف شده‌اند و آیا GEMINI_API_KEY در آن وجود دارد یا خیر. این مرحله شامل هیچ تغییری در کد نیست.
**Excerpt:**
```
## 🎯 هدف (خلاصه ساختاریافته)
متغیر محیطی GEMINI_API_KEY در backend/server.js خط 53 خوانده می‌شود اما در .env.example تعریف نشده است

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/.env.example:1-10` — `.env.example` — فایل .env.example موجود است اما محتوای آن مشخص نیست
  ```
  (محتوای فایل نمایش داده نشده است)
```
