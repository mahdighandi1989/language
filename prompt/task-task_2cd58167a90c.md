---
task_id: task_2cd58167a90c
title: بازسازی معماری بک‌اند
type: other
priority: high
execution_priority: 2200
status: pending
external_status: pending
verification_status: partial
watched_id: 6b04f8bd-b562-4fb9-9cd9-0c27458ced59
project: mahdighandi1989/language
created_at: '2026-06-01T19:19:25.307394+00:00'
updated_at: '2026-06-02T22:31:24.320602+00:00'
tags:
- consolidated
- post_verify_merge
---

# بازسازی معماری بک‌اند

## Raw Idea

🧬 این یک تسک تلفیقی است — از 5 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این تسک‌ها به طور مستقیم به بهبود معماری و خوانایی کد فرانت‌اند، به ویژه در فایل‌های اصلی React مانند App.jsx، می‌پردازند. هدف، ایجاد یک ساختار ماژولارتر و قابل نگهداری‌تر است.
🎯 theme: بازسازی و بهینه‌سازی ساختار کد فرانت‌اند، با تمرکز بر جداسازی نگرانی‌ها، استخراج کامپوننت‌ها از App.jsx و حذف کدهای زائد.
💎 estimated_difficulty: large

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 5
  id: 8e301658-c941-415b-9489-9a76397d2d13
  عنوان اصلی: استخراج کامپوننت‌ها از App.jsx
  اولویت اصلی: high
  وضعیت verify قبلی: pending
  فایل‌های دخیل: frontend/src/App.jsx

📋 acceptance_criteria کامل:
  - App.jsx حداکثر 100 خط باشد و فقط providers را ترکیب کند [verify_method=static] [verify_plan={"grep_patterns": ["^.{0,100}$"], "files_hint": ["frontend/src/App.jsx"]}]
  - هر context در فایل مجزای خود در پوشه contexts/ قرار گیرد [verify_method=static] [verify_plan={"grep_patterns": ["contexts/"], "files_hint": ["frontend/src/contexts/"]}]
  - Inspector Bridge به یک کامپوننت مجزا منتقل شود [verify_method=static] [verify_plan={"grep_patterns": ["InspectorBridge"], "files_hint": ["frontend/src/components/InspectorBridge.jsx"]}]
  - همه importها به درستی کار کنند و اپلیکیشن بدون خطا اجرا شود [verify_method=backend_test] [verify_plan={"test_node": "tests/frontend/test_app_imports.py::test_imports", "timeout_seconds": 60}]

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
کامپوننت App.jsx بیش از 1500 خط است و قابلیت نگهداری پایینی دارد

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/src/App.jsx:1-1542` — `App component` — کل فایل نیاز به refactoring دارد
  ```jsx
  import React, { useState, useEffect, useRef, useMemo, createContext, useContext, useCallback } from 'react';
  ... (1542 lines total)
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
React 18 + Context API + Firebase

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `frontend/src/main.jsx` (سطر 1) — وارد کننده App.jsx
- `frontend/src/index.css` (سطر 1) — استایل‌های global

## 🌐 نقشهٔ وابستگی‌ها
این فایل توسط main.jsx import می‌شود و تمام state management و routing اپلیکیشن را در خود دارد. هر تغییری در ساختار نیازمند تغییر در main.jsx نیست.

## 🔍 Context و وضعیت فعلی
فایل frontend/src/App.jsx در خط 400 قطع شده و مجموعاً 1542 خط دارد. این فایل شامل: Inspector Bridge Script (خطوط 1-126)، importهای متعدد (خط 132-133)، Firebase initialization (خطوط 136-139)، ExecutionFlowContext (خطوط 141-349)، LiveChatContext (خطوط 352-400+)، و ادامه آن شامل کامپوننت‌های اصلی (Chat, Quiz, FileAnalysis, VoiceChat) است. این حجم بالا باعث می‌شود درک جریان داده، debug کردن و اضافه کردن featureهای جدید بسیار دشوار باشد. همچنین multiple context providers در یک فایل باعث tight coupling شده است.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] App.jsx حداکثر 100 خط باشد و فقط providers را ترکیب کند
- [ ] هر context در فایل مجزای خود در پوشه contexts/ قرار گیرد
- [ ] Inspector Bridge به یک کامپوننت مجزا منتقل شود
- [ ] همه importها به درستی کار کنند و اپلیکیشن بدون خطا اجرا شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. فایل App.jsx را به چندین فایل مجزا تقسیم کنید: 1) contexts/ExecutionFlowContext.jsx 2) contexts/LiveChatContext.jsx 3) components/InspectorBridge.jsx 4) hooks/useFirebase.js 5) App.jsx فقط به عنوان orchestrator باقی بماند.

## 💡 نمونه‌های قبل/بعد
**ساختار فایل‌ها**

_قبل:_
```
frontend/src/App.jsx (1542 lines)
```

_بعد:_
```
frontend/src/App.jsx (50 lines orchestrator)
frontend/src/contexts/ExecutionFlowContext.jsx
frontend/src/contexts/LiveChatContext.jsx
frontend/src/components/InspectorBridge.jsx
frontend/src/hooks/useFirebase.js
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `wc -l frontend/src/App.jsx`
- `npm run build --prefix frontend`

## ⚠️ ریسک‌ها و موارد احتیاط
متوسط - ممکن است برخی importها در حین انتقال broken شوند. نیاز به تست کامل manual.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: refactor
- اولویت: high
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  - استخراج Inspector Bridge Script به فایل جداگانه — Inspector Bridge Script (خطوط 1-126) هنوز در App.jsx است و به فایل جدا منتقل نشده
  - استخراج Firebase initialization به فایل جداگانه — Firebase initialization (خطوط 136-139) هنوز در App.jsx است
  - استخراج ExecutionFlowContext به فایل جداگانه — ExecutionFlowContext (خطوط 141-349) هنوز در App.jsx است
  - استخراج LiveChatContext به فایل جداگانه — LiveChatContext (خطوط 352+) هنوز در App.jsx است
  - استخراج کامپوننت Chat به فایل جداگانه — کامپوننت Chat هنوز در App.jsx است
  - استخراج کامپوننت Quiz به فایل جداگانه — کامپوننت Quiz هنوز در App.jsx است
  - استخراج کامپوننت FileAnalysis به فایل جداگانه — کامپوننت FileAnalysis هنوز در App.jsx است
  - استخراج کامپوننت VoiceChat به فایل جداگانه — کامپوننت VoiceChat هنوز در App.jsx است
  - بازسازی App.jsx با importهای جدید و ساختار تمیز — App.jsx بازسازی نشده و همچنان 8150 خط دارد

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 2 از 5
  id: 9129c3f0-3212-454b-80ae-dd043a36db18
  عنوان اصلی: حذف کد مرده Inspector Bridge
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: frontend/index.html, frontend/src/App.jsx

📋 acceptance_criteria کامل:
  - هیچ لاگی با پیشوند '🌉 Inspector Bridge' در کنسول مرورگر ظاهر نشود [verify_method=static] [verify_plan={"grep_patterns": ["Inspector", "Bridge", "لاگی", "پیشوند", "کنسول", "مرورگر", "ظاهر", "نشود"], "files_hint": []}]
  - برنامه بدون خطا لود شود و عملکرد عادی داشته باشد [verify_method=static] [verify_plan={"grep_patterns": ["برنامه", "بدون", "عملکرد", "عادی", "داشته", "باشد"], "files_hint": []}]
  - هیچ تلاشی برای اتصال WebSocket به آدرس خارجی صورت نگیرد [verify_method=static] [verify_plan={"grep_patterns": ["WebSocket", "تلاشی", "برای", "اتصال", "آدرس", "خارجی", "صورت", "نگیرد"], "files_hint": []}]

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
حذف کد مرده Inspector Bridge از frontend/index.html و frontend/src/App.jsx

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/index.html:31-201` — `Inspector Bridge Script` — کل اسکریپت Inspector Bridge در index.html باید حذف شود
  ```
  <!-- Inspector Bridge Script - Auto-injected -->
  <script>
  (function() {
    console.log('🌉 Inspector Bridge: Script starting...');
    ...
  })();
  </script>
  ```
- `frontend/src/App.jsx:1-126` — `Inspector Bridge Script (WebSocket mode)` — کل بلوک Inspector Bridge در App.jsx باید حذف شود
  ```jsx
  // 🌉 Inspector Bridge Script - Auto-injected
  // ارتباط با Inspector از طریق WebSocket (حل مشکل cross-origin)
  if (typeof window !== 'undefined' && !window.__inspectorBridgeLoaded) {
    window.__inspectorBridgeLoaded = true;
    ...
  }
  // 🌉 End of Inspector Bridge Script
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
React 18 + Vite + Tailwind CSS

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `frontend/src/main.jsx` (سطر 1) — فایل ورودی که App.jsx را رندر می‌کند و ممکن است به متغیرهای سراسری وابسته باشد

## 🌐 نقشهٔ وابستگی‌ها
این کد مرده هیچ وابستگی به ماژول‌های npm ندارد و کاملاً مستقل است. حذف آن بر هیچ عملکرد دیگری تأثیر نمی‌گذارد.

## 🔍 Context و وضعیت فعلی
در frontend/index.html (خطوط 31-201) و frontend/src/App.jsx (خطوط 1-126) دو نسخه تقریباً یکسان از اسکریپت Inspector Bridge وجود دارد. اسکریپت index.html از postMessage برای ارتباط با iframe استفاده می‌کند، در حالی که اسکریپت App.jsx از WebSocket به آدرس wss://ai-creator-backend-q677.onrender.com/api/render/ws/bridge/gh_mahdighandi1989_language استفاده می‌کند. این کدها برای دیباگ و مانیتورینگ خارجی (احتمالاً یک پلتفرم no-code) هستند و در نسخه نهایی برنامه کاربردی ندارند. وجود آنها حجم باندل را افزایش می‌دهد، باعث ایجاد لاگ‌های اضافی در کنسول می‌شود و ممکن است با خطاهای WebSocket (زمانی که سرور در دسترس نیست) تجربه کاربری را خراب کند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] هیچ لاگی با پیشوند '🌉 Inspector Bridge' در کنسول مرورگر ظاهر نشود
- [ ] برنامه بدون خطا لود شود و عملکرد عادی داشته باشد
- [ ] هیچ تلاشی برای اتصال WebSocket به آدرس خارجی صورت نگیرد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. هر دو اسکریپت Inspector Bridge را حذف کنید. در frontend/index.html، کل تگ <script> از خط 31 تا 201 را بردارید. در frontend/src/App.jsx، بلوک کد از خط 1 تا 126 را حذف کنید. اطمینان حاصل کنید که هیچ وابستگی به متغیرهای سراسری مانند window.__inspectorBridgeLoaded در جای دیگری وجود ندارد.

## 💡 نمونه‌های قبل/بعد
**حذف اسکریپت از index.html**

_قبل:_
```
<!DOCTYPE html>
<html lang="fa" dir="rtl">
  <head>
    ...
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

_بعد:_
```
<!DOCTYPE html>
<html lang="fa" dir="rtl">
  <head>
    ...
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `cd frontend && npm run build`
- `cd frontend && grep -r 'Inspector Bridge' src/ index.html`

## ⚠️ ریسک‌ها و موارد احتیاط
بسیار کم. این کد کاملاً مجزا و بدون وابستگی است.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: refactor
- اولویت: high
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 3 از 5
  id: 59cbc244-8dbe-4b9d-9a39-a3633ffd0464
  عنوان اصلی: بازسازی معماری برای جداسازی نگرانی‌ها
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: backend/server.js, frontend/index.html, frontend/src/App.jsx, frontend/src/main.jsx

📋 acceptance_criteria کامل:
  - 1. پوشه‌های backend/controllers/، backend/models/، backend/services/، backend/routes/، backend/middleware/، backend/utils/ و backend/config/ ایجاد شده باشند. [verify_method=static] [verify_plan={"grep_patterns": [], "files_hint": ["backend/controllers/", "backend/models/", "backend/services/", "backend/routes/", "backend/middleware/", "backend/utils/", "backend/config/"]}]
  - 2. تمام مسیرهای HTTP (مانند /api/gemini/chat، /api/analyze-files، /api/health) از backend/server.js به فایل‌های جداگانه در backend/routes/ منتقل شده باشند. [verify_method=static] [verify_plan={"grep_patterns": ["app\\.(get|post|put|delete|patch)\\(\\s*['\"]/api/"], "files_hint": ["backend/server.js", "backend/routes/"]}]
  - 3. منطق کنترلرها (callbackهای مسیرها) از backend/server.js به فایل‌های backend/controllers/ منتقل شده باشند. [verify_method=static] [verify_plan={"grep_patterns": ["module\\.exports\\s*=", "exports\\."], "files_hint": ["backend/controllers/"]}]
  - 4. منطق تجاری و تعامل با APIهای خارجی (مانند توابع analyzeWithGemini، uploadToGeminiFileAPI) به فایل‌های backend/services/ منتقل شده باشند. [verify_method=static] [verify_plan={"grep_patterns": ["analyzeWithGemini", "uploadToGeminiFileAPI"], "files_hint": ["backend/services/"]}]
  - 5. ثابت‌ها و پرامپت‌های سیستمی (مانند LEBANESE_CORRECTION_PROMPT، ANALYSIS_SYSTEM_PROMPT) به فایل‌های backend/models/ یا backend/config/ منتقل شده باشند. [verify_method=static] [verify_plan={"grep_patterns": ["LEBANESE_CORRECTION_PROMPT", "ANALYSIS_SYSTEM_PROMPT"], "files_hint": ["backend/models/", "backend/config/"]}]
  - 6. میان‌افزارها (مانند handleMulterError) به فایل‌های backend/middleware/ منتقل شده باشند. [verify_method=static] [verify_plan={"grep_patterns": ["handleMulterError"], "files_hint": ["backend/middleware/"]}]
  - 7. توابع کمکی (مانند splitIntoChunks) به فایل‌های backend/utils/ منتقل شده باشند. [verify_method=static] [verify_plan={"grep_patterns": ["splitIntoChunks"], "files_hint": ["backend/utils/"]}]
  - 8. فایل backend/server.js پس از refactor فقط شامل importها، تنظیمات middlewareهای global، و استفاده از routeها باشد و طول آن به طور قابل توجهی کاهش یافته باشد. [verify_method=static] [verify_plan={"grep_patterns": ["require\\(|import\\s", "app\\.use\\(", "app\\.(get|post|put|delete|patch)\\("], "files_hint": ["backend/server.js"]}]
  - 9. برنامه پس از refactor بدون خطا اجرا شود و تمام endpointهای قبلی به درستی کار کنند. [verify_method=backend_test] [verify_plan={"test_node": "tests/test_refactor.py::test_endpoints_work", "timeout_seconds": 60}]
  - 10. هیچ تغییری در منطق برنامه، endpointها، یا frontend ایجاد نشده باشد. [verify_method=static] [verify_plan={"grep_patterns": [], "files_hint": ["frontend/"]}]
  - 1. پوشه‌های frontend/src/components، frontend/src/hooks و frontend/src/utils ایجاد شده باشند. [verify_method=static] [verify_plan={"grep_patterns": [], "files_hint": ["frontend/src/components/", "frontend/src/hooks/", "frontend/src/utils/"]}]
  - 2. فایل frontend/src/App.jsx به frontend/src/components/App.jsx منتقل شده باشد. [verify_method=static] [verify_plan={"grep_patterns": [], "files_hint": ["frontend/src/components/App.jsx"]}]
  - 3. import در frontend/src/main.jsx از './App' به './components/App' تغییر کرده باشد. [verify_method=static] [verify_plan={"grep_patterns": ["from\\s+['\"]\\./components/App['\"]"], "files_hint": ["frontend/src/main.jsx"]}]
  - 4. دستور npm run build در frontend بدون خطا اجرا شود و فایل‌های build در frontend/dist ایجاد شوند. [verify_method=backend_test] [verify_plan={"test_node": "tests/test_build.py::test_frontend_build", "timeout_seconds": 120}]
  - 5. دستور npm run dev در ریشه پروژه (که backend را اجرا می‌کند) بدون خطا اجرا شود و frontend به درستی سرو شود. [verify_method=backend_test] [verify_plan={"test_node": "tests/test_dev.py::test_dev_server", "timeout_seconds": 60}]
  - 6. محتوای فایل‌ها تغییری نکرده باشد (فقط مسیرها تغییر کرده باشند). [verify_method=static] [verify_plan={"grep_patterns": [], "files_hint": ["frontend/src/components/App.jsx", "frontend/src/main.jsx"]}]
  - 7. backend/server.js و backend/package.json تغییری نکرده باشند. [verify_method=static] [verify_plan={"grep_patterns": [], "files_hint": ["backend/server.js", "backend/package.json"]}]

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
بر اساس ساختار فایل‌ها، معماری پروژه مشخص نیست. عدم وجود folders مانند controllers، models، services در backend و components، hooks، utils در frontend نشان‌دهنده عدم رعایت best practices است.
```

## 📋 چک‌لیست مراحل (2 مرحله)

این تسک به مراحل کوچک‌تر تقسیم شده. **در هر verify خودکار، وضعیت هر مرحله به‌صورت `[ ]` (انجام نشده)، `[~]` (ناقص)، یا `[x]` (انجام شده) به‌روز می‌شود.**
وقتی تمام مراحل `[x]` شدند، تسک به‌طور خودکار به «انجام شده» منتقل می‌شود.

- [x] **مرحله 1: ایجاد ساختار پوشه‌های backend بر اساس معماری لایه‌ای (controllers, models, services)** — این مرحله شامل ایجاد پوشه‌های اصلی backend شامل controllers، models، services و انتقال فایل‌های موجود به پوشه‌های مناسب است. فایل‌های مربوط به مسیرها (routes) باید به پوشه controllers، مدل‌های داده به پوشه models، و منطق کسب‌وکار به پوشه services منتقل شوند. این مرحله شامل تغییر محتوای فایل‌ها یا با
- [ ] **مرحله 2: ایجاد ساختار پوشه‌های frontend بر اساس معماری کامپوننتی (components, hooks, utils)** — این مرحله شامل ایجاد پوشه‌های اصلی frontend شامل components، hooks، utils و انتقال فایل‌های موجود به پوشه‌های مناسب است. کامپوننت‌های React به پوشه components، هوک‌های سفارشی به پوشه hooks، و توابع کمکی به پوشه utils منتقل می‌شوند. این مرحله شامل تغییر محتوای فایل‌ها یا بازنویسی کد نیست، فقط سازماند

---

# 🔹 مرحله 1: ایجاد ساختار پوشه‌های backend بر اساس معماری لایه‌ای (controllers, models, services)

**Scope:** این مرحله شامل ایجاد پوشه‌های اصلی backend شامل controllers، models، services و انتقال فایل‌های موجود به پوشه‌های مناسب است. فایل‌های مربوط به مسیرها (routes) باید به پوشه controllers، مدل‌های داده به پوشه models، و منطق کسب‌وکار به پوشه services منتقل شوند. این مرحله شامل تغییر محتوای فایل‌ها یا بازنویسی کد نیست، فقط سازماندهی مجدد ساختار فایل‌ها. خارج از این مرحله: ایجاد فایل‌های جدید، تغییر منطق برنامه، یا تغییر در frontend.
**Key terms:** backend, controllers, models, services, routes

**بخش مربوط از متن کاربر:**
```
عدم وجود folders مانند controllers، models، services در backend و components، hooks، utils در frontend نشان‌دهنده عدم رعایت best practices است.
```

## 🎯 هدف (خلاصه ساختاریافته)
سازماندهی مجدد ساختار پوشه‌های backend بر اساس معماری لایه‌ای (controllers, models, services)

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/server.js:1-1403` — `کل فایل` — این فایل تمام منطق backend را در خود دارد. پس از refactor، به یک فایل راه‌انداز (entry point) تبدیل می‌شود که فقط routeها را import و middlewareهای global را تنظیم می‌کند.
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
- `backend/server.js:56-114` — `app.post('/api/gemini/chat', ...)` — این مسیر و کنترلر آن باید به ترتیب به backend/routes/geminiRoutes.js و backend/controllers/geminiController.js منتقل شود.
  ```jsx
  app.post('/api/gemini/chat', async (req, res) => {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }
    try {
      const payload = req.body;
      const includeAudio = payload.includeAudio;
      delete payload.includeAudio;
      // ...
    } catch (error) {
      console.error('Chat API error:', error);
      res.status(500).json({ error: error.message });
    }
  });
  ```
- `backend/server.js:698-800` — `app.post('/api/analyze-files', ...)` — این مسیر و کنترلر آن باید به ترتیب به backend/routes/fileRoutes.js و backend/controllers/fileController.js منتقل شود. همچنین middlewareهای upload و handleMulterError به backend/middleware/uploadMiddleware.js منتقل شوند.
  ```jsx
  app.post('/api/analyze-files', upload.array('files', 10), handleMulterError, async (req, res) => {
    console.log('Received file analysis request');
    if (!GEMINI_API_KEY) {
      console.error('API key not configured');
      return res.status(500).json({ error: 'API key not configured' });
    }
    // ...
  });
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Stack تشخیص داده شده: JavaScript (Node.js) با Express.js برای backend. کتابخانه‌های اصلی: express, cors, ws (WebSocket), multer (آپلود فایل), fluent-ffmpeg (پردازش ویدیو/صدا), dotenv (مدیریت متغیرهای محیطی). frontend با React + Vite + Tailwind CSS ساخته شده است.

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `backend/package.json` (سطر 1) — این فایل وابستگی‌های پروژه backend را مشخص می‌کند. پس از refactor، نیازی به تغییر ندارد مگر اینکه ماژول‌های جدیدی اضافه شود (که خارج از scope این تسک است).
- `backend/.env.example` (سطر 1) — این فایل نمونه متغیرهای محیطی را نشان می‌دهد. پس از refactor، اگر مسیر فایل‌های config تغییر کند، ممکن است نیاز به به‌روزرسانی مسیر dotenv در server.js باشد.
- `frontend/vite.config.js` (سطر 10) — این فایل پروکسی سرور را برای API calls تنظیم می‌کند. اگر endpointهای backend تغییر کنند (که در این تسک نباید تغییر کنند)، این فایل باید به‌روزرسانی شود. اما در این تسک فقط ساختار فایل‌ها تغییر می‌کند، نه endpointها.
- `frontend/src/App.jsx` (سطر 1) — این فایل احتمالاً از APIهای backend استفاده می‌کند. اگر endpointها تغییر نکنند، نیازی به تغییر ندارد.
- `render.yaml` (سطر 1) — این فایل کانفیگ استقرار در Render را مشخص می‌کند. اگر مسیر فایل اصلی backend تغییر کند (مثلاً از server.js به app.js)، باید این فایل به‌روزرسانی شود.

## 🌐 نقشهٔ وابستگی‌ها
این refactor عمدتاً بر فایل backend/server.js تأثیر می‌گذارد که تمام منطق backend را در خود دارد. پس از تغییر، این فایل به یک فایل راه‌انداز (entry point) تبدیل می‌شود که routeها را import می‌کند. فایل‌های جدیدی در پوشه‌های backend/routes/، backend/controllers/، backend/services/، backend/models/، backend/middleware/، backend/utils/ و backend/config/ ایجاد می‌شوند. فایل‌های frontend (مانند frontend/vite.config.js و frontend/src/App.jsx) تحت تأثیر قرار نمی‌گیرند مگر اینکه endpointها تغییر کنند (که در این تسک نباید تغییر کنند). فایل render.yaml ممکن است نیاز به به‌روزرسانی داشته باشد اگر مسیر فایل اصلی backend تغییر کند. وابستگی‌های npm در backend/package.json نیازی به تغییر ندارند.

## 🔍 Context و وضعیت فعلی
درخواست کاربر با اولویت medium و نوع refactor است. کاربر می‌خواهد ساختار پوشه‌های backend را بر اساس معماری لایه‌ای (controllers, models, services) ایجاد کند. این مرحله شامل ایجاد پوشه‌های اصلی backend شامل controllers، models، services و انتقال فایل‌های موجود به پوشه‌های مناسب است. فایل‌های مربوط به مسیرها (routes) باید به پوشه controllers، مدل‌های داده به پوشه models، و منطق کسب‌وکار به پوشه services منتقل شوند. این مرحله شامل تغییر محتوای فایل‌ها یا بازنویسی کد نیست، فقط سازماندهی مجدد ساختار فایل‌ها. خارج از این مرحله: ایجاد فایل‌های جدید، تغییر منطق برنامه، یا تغییر در frontend. کاربر به عدم وجود folders مانند controllers، models، services در backend و components، hooks، utils در frontend اشاره کرده که نشان‌دهنده عدم رعایت best practices است. کلیدواژه‌های اصلی: backend, controllers, models, services, routes. در پروژه فعلی، تمام منطق backend در یک فایل واحد به نام backend/server.js (1403 خط) متمرکز شده است. این فایل شامل تعریف مسیرها (routes)، منطق تجاری (business logic)، تعامل با APIهای خارجی (مانند Gemini API)، پردازش فایل‌ها (multer, ffmpeg)، و مدیریت WebSocket است. هیچ جداسازی لایه‌ای وجود ندارد. فایل‌های مرتبط دیگر شامل backend/package.json (وابستگی‌ها) و backend/.env.example (تنظیمات محیطی) هستند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] 1. پوشه‌های backend/controllers/، backend/models/، backend/services/، backend/routes/، backend/middleware/، backend/utils/ و backend/config/ ایجاد شده باشند.
- [ ] 2. تمام مسیرهای HTTP (مانند /api/gemini/chat، /api/analyze-files، /api/health) از backend/server.js به فایل‌های جداگانه در backend/routes/ منتقل شده باشند.
- [ ] 3. منطق کنترلرها (callbackهای مسیرها) از backend/server.js به فایل‌های backend/controllers/ منتقل شده باشند.
- [ ] 4. منطق تجاری و تعامل با APIهای خارجی (مانند توابع analyzeWithGemini، uploadToGeminiFileAPI) به فایل‌های backend/services/ منتقل شده باشند.
- [ ] 5. ثابت‌ها و پرامپت‌های سیستمی (مانند LEBANESE_CORRECTION_PROMPT، ANALYSIS_SYSTEM_PROMPT) به فایل‌های backend/models/ یا backend/config/ منتقل شده باشند.
- [ ] 6. میان‌افزارها (مانند handleMulterError) به فایل‌های backend/middleware/ منتقل شده باشند.
- [ ] 7. توابع کمکی (مانند splitIntoChunks) به فایل‌های backend/utils/ منتقل شده باشند.
- [ ] 8. فایل backend/server.js پس از refactor فقط شامل importها، تنظیمات middlewareهای global، و استفاده از routeها باشد و طول آن به طور قابل توجهی کاهش یافته باشد.
- [ ] 9. برنامه پس از refactor بدون خطا اجرا شود و تمام endpointهای قبلی به درستی کار کنند.
- [ ] 10. هیچ تغییری در منطق برنامه، endpointها، یا frontend ایجاد نشده باشد.
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. با توجه به ساختار فعلی پروژه که تمام منطق در backend/server.js متمرکز شده است، مراحل زیر برای سازماندهی مجدد پیشنهاد می‌شود:

1. **ایجاد پوشه‌های اصلی**: در مسیر `backend/` پوشه‌های `controllers/`، `models/`، `services/`، `routes/`، `middleware/`، `utils/` و `config/` ایجاد شود.

2. **انتقال مسیرها (Routes) به پوشه routes**: تمام تعاریف `app.post(...)` و `app.get(...)` از `backend/server.js` (خطوط 56-698) به فایل‌های جداگانه در `backend/routes/` منتقل شوند. مثلاً:
   - `backend/routes/geminiRoutes.js` برای مسیرهای `/api/gemini/chat` (خط 56) و `/api/gemini/tts` (خط 117)
   - `backend/routes/healthRoutes.js` برای `/api/health` (خط 167)
   - `backend/routes/fileRoutes.js` برای `/api/analyze-files` (خط 698)

3. **انتقال منطق کنترلرها به پوشه controllers**: منطق داخل هر مسیر (که در حال حاضر داخل callback تابع در `server.js` است) به فایل‌های جداگانه در `backend/controllers/` منتقل شود. مثلاً:
   - `backend/controllers/geminiController.js` شامل توابع `chatHandler` و `ttsHandler`
   - `backend/controllers/fileController.js` شامل `analyzeFilesHandler`

4. **انتقال سرویس‌ها به پوشه services**: منطق تجاری و تعامل با APIهای خارجی به فایل‌های `backend/services/` منتقل شود:
   - `backend/services/geminiService.js` شامل توابع `analyzeWithGemini` (خط 273)، `uploadToGeminiFileAPI` (خط 297)، `analyzeWithGeminiFileAPIWithModel` (خط 395)
   - `backend/services/fileService.js` شامل توابع `splitIntoChunks` (خط 247)، `extractPdfText` (خط 565)، `getVideoDuration` (خط 445)، `splitVideoIntoSegments` (خط 455)، `extractAudioFromVideo` (خط 504)، `extractKeyFrames` (خط 531)

5. **انتقال مدل‌ها به پوشه models**: اگر ساختار داده‌ای وجود دارد (مانند ثابت‌های `LEBANESE_CORRECTION_PROMPT` در خط 582 و `ANALYSIS_SYSTEM_PROMPT` در خط 617)، به `backend/models/` منتقل شود.

6. **انتقال میان‌افزارها به پوشه middleware**: تابع `handleMulterError` (خط 686) به `backend/middleware/uploadMiddleware.js` منتقل شود.

7. **انتقال ابزارها به پوشه utils**: توابع کمکی مانند `splitIntoChunks` (خط 247) به `backend/utils/helpers.js` منتقل شوند.

8. **به‌روزرسانی server.js**: فایل اصلی `backend/server.js` فقط شامل importها، تنظیمات middlewareهای global، و استفاده از routeها باشد.

توجه: این تغییرات فقط شامل جابجایی کد است و هیچ تغییری در منطق برنامه ایجاد نمی‌کند.

## 💡 نمونه‌های قبل/بعد
**ساختار فعلی backend (قبل از refactor)**

_قبل:_
```
backend/
├── .env.example
├── package-lock.json
├── package.json
└── server.js  (همه چیز در این فایل)
```

_بعد:_
```
backend/
├── config/
│   └── index.js
├── controllers/
│   ├── geminiController.js
│   └── fileController.js
├── middleware/
│   └── uploadMiddleware.js
├── models/
│   └── prompts.js
├── routes/
│   ├── geminiRoutes.js
│   ├── healthRoutes.js
│   └── fileRoutes.js
├── services/
│   ├── geminiService.js
│   └── fileService.js
├── utils/
│   └── helpers.js
├── .env.example
├── package-lock.json
├── package.json
└── server.js  (فقط import و تنظیمات)
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `cd backend && node server.js  # برای تست اجرای backend`
- `curl -X POST http://localhost:3001/api/gemini/chat -H "Content-Type: application/json" -d '{"contents": [{"role": "user", "parts": [{"text": "hello"}]}]}'  # تست endpoint چت`
- `curl http://localhost:3001/api/health  # تست endpoint health`
- `cd frontend && npm run build  # برای اطمینان از عدم تأثیر بر frontend`

## ⚠️ ریسک‌ها و موارد احتیاط
ریسک اصلی این refactor، ایجاد خطاهای import در فایل backend/server.js است. اگر مسیر فایل‌های import شده به درستی تنظیم نشود، برنامه با خطای 'MODULE_NOT_FOUND' مواجه می‌شود. همچنین، اگر توابع به درستی export/import نشوند، ممکن است برخی endpointها کار نکنند. ریسک دیگر این است که فایل render.yaml ممکن است نیاز به به‌روزرسانی داشته باشد اگر مسیر فایل اصلی backend تغییر کند (مثلاً اگر server.js به app.js تغییر نام دهد). برای کاهش ریسک، توصیه می‌شود پس از هر مرحله از refactor، برنامه تست شود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: refactor
- اولویت: medium
- تخمین زمان: medium

---

# 🔹 مرحله 2: ایجاد ساختار پوشه‌های frontend بر اساس معماری کامپوننتی (components, hooks, utils)

**Scope:** این مرحله شامل ایجاد پوشه‌های اصلی frontend شامل components، hooks، utils و انتقال فایل‌های موجود به پوشه‌های مناسب است. کامپوننت‌های React به پوشه components، هوک‌های سفارشی به پوشه hooks، و توابع کمکی به پوشه utils منتقل می‌شوند. این مرحله شامل تغییر محتوای فایل‌ها یا بازنویسی کد نیست، فقط سازماندهی مجدد ساختار فایل‌ها. خارج از این مرحله: ایجاد فایل‌های جدید، تغییر منطق برنامه، یا تغییر در backend.
**Key terms:** frontend, components, hooks, utils, React

**بخش مربوط از متن کاربر:**
```
عدم وجود folders مانند controllers، models، services در backend و components، hooks، utils در frontend نشان‌دهنده عدم رعایت best practices است.
```

## 🎯 هدف (خلاصه ساختاریافته)
سازماندهی مجدد ساختار پوشه‌های frontend بر اساس معماری کامپوننتی (components, hooks, utils)

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/src/App.jsx:1-? (کل فایل)` — `App (کامپوننت پیش‌فرض React)` — این فایل یک کامپوننت React است و باید به frontend/src/components/App.jsx منتقل شود. محتوای فایل تغییر نمی‌کند.
  ```jsx
  فایل frontend/src/App.jsx در deep context موجود نیست، اما طبق ساختار پروژه در frontend/src/ قرار دارد.
  ```
- `frontend/src/main.jsx:1-? (کل فایل)` — `main (نقطه ورود React)` — این فایل باید import خود را از './App' به './components/App' تغییر دهد.
  ```jsx
  فایل frontend/src/main.jsx در deep context موجود نیست، اما طبق نقشه Importها، App.jsx را import می‌کند.
  ```
- `frontend/index.html:206` — `script (نقطه ورود ماژول)` — این خط نیازی به تغییر ندارد چون main.jsx در ریشه src باقی می‌ماند.
  ```
  <script type="module" src="/src/main.jsx"></script>
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Stack تشخیص داده شده: JavaScript (ES Modules), React 18, Vite 5, Tailwind CSS 3, PostCSS, Autoprefixer. کتابخانه‌های مرتبط: react, react-dom, @vitejs/plugin-react, tailwindcss, postcss, autoprefixer. فایل‌های تنظیمات: frontend/vite.config.js, frontend/tailwind.config.js, frontend/postcss.config.js.

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `frontend/src/main.jsx` (سطر 1) — این فایل App.jsx را import می‌کند و پس از انتقال باید مسیر import به‌روزرسانی شود.
- `frontend/vite.config.js` (سطر 12) — این فایل تنظیمات build و proxy را مشخص می‌کند. با انتقال فایل‌ها، مسیر build (outDir: 'dist') تغییری نمی‌کند، اما باید بررسی شود که مسیرهای import در build صحیح باشند.
- `frontend/index.html` (سطر 206) — این فایل main.jsx را به عنوان نقطه ورود مشخص می‌کند. با انتقال App.jsx، این فایل تغییری نمی‌کند.
- `frontend/src/index.css` (سطر 1) — این فایل توسط main.jsx import می‌شود. اگر استایل‌های عمومی در آن است، می‌تواند در ریشه src باقی بماند یا به components/App.css منتقل شود.

## 🌐 نقشهٔ وابستگی‌ها
این refactor فقط frontend را تحت تأثیر قرار می‌دهد. فایل frontend/src/main.jsx (نقطه ورود React) App.jsx را import می‌کند و پس از انتقال باید مسیر import به‌روزرسانی شود. فایل frontend/index.html (خط 206) به /src/main.jsx اشاره دارد که تغییری نمی‌کند. فایل frontend/vite.config.js تنظیمات build را مشخص می‌کند و با انتقال فایل‌ها، مسیر build (outDir: 'dist') تغییری نمی‌کند. فایل frontend/src/index.css توسط main.jsx import می‌شود و می‌تواند در ریشه src باقی بماند. backend/server.js و backend/package.json تحت تأثیر قرار نمی‌گیرند. فایل‌های package.json و package-lock.json در ریشه و frontend نیازی به تغییر ندارند چون وابستگی‌ها تغییر نمی‌کنند.

## 🔍 Context و وضعیت فعلی
کاربر درخواست ایجاد ساختار پوشه‌های frontend بر اساس معماری کامپوننتی شامل پوشه‌های components، hooks، utils و انتقال فایل‌های موجود به پوشه‌های مناسب را دارد. این یک refactor با اولویت medium است. کاربر تأکید کرده که این مرحله شامل تغییر محتوای فایل‌ها یا بازنویسی کد نیست، فقط سازماندهی مجدد ساختار فایل‌ها. خارج از این مرحله: ایجاد فایل‌های جدید، تغییر منطق برنامه، یا تغییر در backend. کاربر اشاره کرده که عدم وجود folders مانند controllers، models، services در backend و components، hooks، utils در frontend نشان‌دهنده عدم رعایت best practices است. کلیدواژه‌ها: frontend, components, hooks, utils, React.

شواهد در کد واقعی پروژه: در ساختار کامل پروژه، فایل‌های frontend به صورت تخت در frontend/src/ قرار دارند:
- frontend/src/App.jsx
- frontend/src/index.css
- frontend/src/main.jsx
هیچ پوشه‌ای با نام components، hooks یا utils در frontend/src/ وجود ندارد. فایل frontend/src/App.jsx توسط frontend/src/main.jsx import می‌شود (طبق نقشه Importهای داخلی). فایل frontend/src/index.css نیز توسط frontend/src/main.jsx import می‌شود. فایل frontend/vite.config.js در خط 12-16 یک proxy برای /api به http://localhost:3001 تنظیم کرده است.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] 1. پوشه‌های frontend/src/components، frontend/src/hooks و frontend/src/utils ایجاد شده باشند.
- [ ] 2. فایل frontend/src/App.jsx به frontend/src/components/App.jsx منتقل شده باشد.
- [ ] 3. import در frontend/src/main.jsx از './App' به './components/App' تغییر کرده باشد.
- [ ] 4. دستور npm run build در frontend بدون خطا اجرا شود و فایل‌های build در frontend/dist ایجاد شوند.
- [ ] 5. دستور npm run dev در ریشه پروژه (که backend را اجرا می‌کند) بدون خطا اجرا شود و frontend به درستی سرو شود.
- [ ] 6. محتوای فایل‌ها تغییری نکرده باشد (فقط مسیرها تغییر کرده باشند).
- [ ] 7. backend/server.js و backend/package.json تغییری نکرده باشند.
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. مراحل پیاده‌سازی:
1. ایجاد پوشه‌های frontend/src/components، frontend/src/hooks و frontend/src/utils.
2. انتقال فایل frontend/src/App.jsx به frontend/src/components/App.jsx (چون App یک کامپوننت React است).
3. به‌روزرسانی مسیر import در frontend/src/main.jsx از './App' به './components/App'.
4. انتقال فایل frontend/src/index.css به frontend/src/components/App.css (اختیاری - اگر استایل‌های App در index.css است) یا نگه‌داشتن index.css در ریشه src.
5. ایجاد فایل‌های خالی index.js در هر پوشه برای export (اختیاری).
6. اطمینان از اینکه vite.config.js و tailwind.config.js نیازی به تغییر ندارند چون مسیر src تغییر نکرده است.
7. تست build با دستور npm run build در frontend.
8. بررسی اینکه frontend/index.html (خط 206) به /src/main.jsx اشاره دارد که تغییری نمی‌کند.

توجه: کاربر تأکید کرده که این مرحله فقط سازماندهی مجدد است و شامل تغییر منطق برنامه نمی‌شود.

## 💡 نمونه‌های قبل/بعد
**ساختار فعلی frontend/src (قبل از refactor)**

_قبل:_
```
frontend/src/
├── App.jsx
├── index.css
└── main.jsx
```

_بعد:_
```
frontend/src/
├── components/
│   ├── App.jsx
│   └── App.css (اختیاری)
├── hooks/
│   └── (خالی)
├── utils/
│   └── (خالی)
├── index.css
└── main.jsx
```

**import در main.jsx (قبل و بعد)**

_قبل:_
```
import App from './App'
```

_بعد:_
```
import App from './components/App'
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `cd frontend && npm run build`
- `cd frontend && npm run dev (بررسی در مرورگر)`
- `ls frontend/src/components/App.jsx (بررسی وجود فایل)`
- `grep -r "from './App'" frontend/src/main.jsx (بررسی عدم وجود import قدیمی)`
- `grep "from './components/App'" frontend/src/main.jsx (بررسی وجود import جدید)`

## ⚠️ ریسک‌ها و موارد احتیاط
ریسک اصلی این است که اگر فایل‌های دیگری (مانند frontend/src/App.jsx) توسط فایل‌های دیگر import شده باشند (که طبق نقشه Importهای داخلی فقط توسط frontend/src/main.jsx import می‌شود)، تغییر مسیر import در main.jsx کافی است. اما اگر در آینده فایل‌های دیگری به App.jsx وابسته شوند، باید مسیر آن‌ها نیز به‌روزرسانی شود. همچنین اگر frontend/src/index.css حاوی استایل‌های عمومی باشد و به components/App.css منتقل شود، باید import آن در main.jsx نیز تغییر کند. ریسک دیگر این است که اگر پوشه‌های components، hooks، utils از قبل وجود داشته باشند (که در ساختار پروژه دیده نمی‌شوند)، دستور mkdir با خطا مواجه می‌شود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: refactor
- اولویت: medium
- تخمین زمان: small

---

## ✅ معیارهای پذیرش کلی (همهٔ مراحل)
- [ ] 1. پوشه‌های backend/controllers/، backend/models/، backend/services/، backend/routes/، backend/middleware/، backend/utils/ و backend/config/ ایجاد شده باشند.
- [ ] 2. تمام مسیرهای HTTP (مانند /api/gemini/chat، /api/analyze-files، /api/health) از backend/server.js به فایل‌های جداگانه در backend/routes/ منتقل شده باشند.
- [ ] 3. منطق کنترلرها (callbackهای مسیرها) از backend/server.js به فایل‌های backend/controllers/ منتقل شده باشند.
- [ ] 4. منطق تجاری و تعامل با APIهای خارجی (مانند توابع analyzeWithGemini، uploadToGeminiFileAPI) به فایل‌های backend/services/ منتقل شده باشند.
- [ ] 5. ثابت‌ها و پرامپت‌های سیستمی (مانند LEBANESE_CORRECTION_PROMPT، ANALYSIS_SYSTEM_PROMPT) به فایل‌های backend/models/ یا backend/config/ منتقل شده باشند.
- [ ] 6. میان‌افزارها (مانند handleMulterError) به فایل‌های backend/middleware/ منتقل شده باشند.
- [ ] 7. توابع کمکی (مانند splitIntoChunks) به فایل‌های backend/utils/ منتقل شده باشند.
- [ ] 8. فایل backend/server.js پس از refactor فقط شامل importها، تنظیمات middlewareهای global، و استفاده از routeها باشد و طول آن به طور قابل توجهی کاهش یافته باشد.
- [ ] 9. برنامه پس از refactor بدون خطا اجرا شود و تمام endpointهای قبلی به درستی کار کنند.
- [ ] 10. هیچ تغییری در منطق برنامه، endpointها، یا frontend ایجاد نشده باشد.
- [ ] 1. پوشه‌های frontend/src/components، frontend/src/hooks و frontend/src/utils ایجاد شده باشند.
- [ ] 2. فایل frontend/src/App.jsx به frontend/src/components/App.jsx منتقل شده باشد.
- [ ] 3. import در frontend/src/main.jsx از './App' به './components/App' تغییر کرده باشد.
- [ ] 4. دستور npm run build در frontend بدون خطا اجرا شود و فایل‌های build در frontend/dist ایجاد شوند.
- [ ] 5. دستور npm run dev در ریشه پروژه (که backend را اجرا می‌کند) بدون خطا اجرا شود و frontend به درستی سرو شود.
- [ ] 6. محتوای فایل‌ها تغییری نکرده باشد (فقط مسیرها تغییر کرده باشند).
- [ ] 7. backend/server.js و backend/package.json تغییری نکرده باشند.

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  - ایجاد ساختار پوشه‌های backend بر اساس معماری لایه‌ای (controllers, models, services)

🔧 مراحل remaining که در super-task باید انجام شوند:
  - ایجاد ساختار پوشه‌های frontend بر اساس معماری کامپوننتی (components, hooks, utils) — ایجاد پوشه‌های frontend/src/components, hooks, utils و انتقال فایل‌ها

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 4 از 5
  id: 5e62b869-2d97-4688-a4f2-eccb39f844ae
  عنوان اصلی: استانداردسازی ساختار پوشه و کامپوننت‌های React
  اولویت اصلی: medium
  وضعیت verify قبلی: pending
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - اعمال تغییر بدون شکستن تست‌های موجود [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]
  - linter بدون warning عبور می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["no-unused-vars", "no-undef"], "files_hint": ["frontend/src/"]}]
  - type-check موفق است [verify_method=static] [verify_plan={"grep_patterns": ["tsc", "type-check"], "files_hint": ["frontend/tsconfig.json"]}]

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
پروژه فاقد فایل‌های کامپوننت مجزا و ساختار پوشه‌ای استاندارد React است

## 📍 موقعیت دقیق در پروژه
_(فایل‌های دقیق توسط مجری شناسایی شوند — هیچ موقعیت مشخصی استخراج نشد)_

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🔍 Context و وضعیت فعلی
بر اساس لیست فایل‌ها، در frontend/src/ تنها سه فایل وجود دارد: App.jsx, index.css, main.jsx. هیچ پوشه components/, pages/, hooks/, services/, utils/ وجود ندارد. این lack of structure باعث می‌شود: 1) همه منطق اپلیکیشن در یک فایل 1500+ خطی متمرکز شود 2) قابلیت استفاده مجدد از کد پایین است 3) تست‌نویسی غیرممکن است 4) همکاری تیمی دشوار است. همچنین فایل‌های config مانند postcss.config.js و tailwind.config.js در ریشه frontend هستند که استاندارد است.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] اعمال تغییر بدون شکستن تست‌های موجود
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. ساختار پوشه‌ای استاندارد React

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
تسک 5 از 5
  id: 8d5aac8c-2e65-4d59-b4d1-0a8661a45644
  عنوان اصلی: جداسازی WebSocket از Inspector Bridge
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: backend/server.js, frontend/src/App.jsx

📋 acceptance_criteria کامل:
  - Inspector Bridge فقط از postMessage استفاده کند [verify_method=static] [verify_plan={"grep_patterns": ["postMessage"], "files_hint": ["frontend/src/App.jsx"]}]
  - WebSocket سرور برای Live Voice یا قابلیت دیگر باقی بماند [verify_method=static] [verify_plan={"grep_patterns": ["/ws/live", "WebSocket.Server"], "files_hint": ["backend/server.js"]}]
  - هیچ خطای WebSocket در کنسول ظاهر نشود [verify_method=ui_interaction] [verify_plan={"base": "frontend", "ui_steps": [{"action": "navigate", "url": "/"}, {"action": "wait_for_load", "state": "networkidle"}, {"action": "assert_no_console_errors", "pattern": "WebSocket"}], "expected_ap]

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
WebSocket Server در backend/server.js تعریف شده اما در Inspector Bridge استفاده نمی‌شود

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/server.js:45` — `WebSocketServer` — WebSocket سرور با مسیر /ws/live
  ```jsx
  const wss = new WebSocketServer({ server, path: '/ws/live' });
  ```
- `frontend/src/App.jsx:8` — `WS_URL` — WebSocket URL اشتباه
  ```jsx
  const WS_URL = 'wss://ai-creator-backend-q677.onrender.com/api/render/ws/bridge/gh_mahdighandi1989_language';
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Express + ws library

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `frontend/index.html` (سطر 32) — Inspector Bridge که از postMessage استفاده می‌کند
- `backend/server.js` (سطر 45) — سرور WebSocket

## 🌐 نقشهٔ وابستگی‌ها
WebSocket سرور در بک‌اند تعریف شده اما در فرانت‌اند استفاده نمی‌شود.

## 🔍 Context و وضعیت فعلی
در backend/server.js خط 45، یک WebSocket Server با مسیر '/ws/live' ایجاد شده است. اما در Inspector Bridge فرانت‌اند (frontend/src/App.jsx خط 8) از یک WebSocket URL کاملاً متفاوت و خارجی استفاده می‌شود. این نشان می‌دهد که WebSocket سرور بک‌اند یا استفاده نمی‌شود یا برای قابلیت دیگری (احتمالاً Live Voice) در نظر گرفته شده است. این عدم تطابق باعث سردرگمی و نگهداری دشوار کد می‌شود.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] Inspector Bridge فقط از postMessage استفاده کند
- [ ] WebSocket سرور برای Live Voice یا قابلیت دیگر باقی بماند
- [ ] هیچ خطای WebSocket در کنسول ظاهر نشود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. مشخص کنید که WebSocket سرور برای چه قابلیتی استفاده می‌شود (احتمالاً Live Voice). اگر برای Inspector Bridge نیست، Inspector Bridge را به طور کامل به postMessage تغییر دهید. اگر قرار است Inspector Bridge از WebSocket استفاده کند، مسیر صحیح را در فرانت‌اند تنظیم کنید.

## 💡 نمونه‌های قبل/بعد
**حذف WebSocket از Inspector Bridge**

_قبل:_
```
const WS_URL = 'wss://ai-creator-backend-q677.onrender.com/api/render/ws/bridge/gh_mahdighandi1989_language';
let ws = null;
...
```

_بعد:_
```
// فقط postMessage استفاده شود
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `بررسی Network tab برای درخواست‌های WebSocket`
- `console.log برای نمایش روش ارتباطی`

## ⚠️ ریسک‌ها و موارد احتیاط
تغییر ممکن است Inspector Bridge را در برخی محیط‌ها از کار بیندازد

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: refactor
- اولویت: medium
- تخمین زمان: small

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
- در commit message: `merged-from: 8e301658-c941-415b-9489-9a76397d2d13, 9129c3f0-3212-454b-80ae-dd043a36db18, 59cbc244-8dbe-4b9d-9a39-a3633ffd0464, 5e62b869-2d97-4688-a4f2-eccb39f844ae, 8d5aac8c-2e65-4d59-b4d1-0a8661a45644`
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

🧬 این یک تسک تلفیقی است — از 5 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این تسک‌ها به طور مستقیم به بهبود معماری و خوانایی کد فرانت‌اند، به ویژه در فایل‌های اصلی React مانند App.jsx، می‌پردازند. هدف، ایجاد یک ساختار ماژولارتر و قابل نگهداری‌تر است.
🎯 theme: بازسازی و بهینه‌سازی ساختار کد فرانت‌اند، با تمرکز بر جداسازی نگرانی‌ها، استخراج کامپوننت‌ها از App.jsx و حذف کدهای زائد.
💎 estimated_difficulty: large

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 5
  id: 8e301658-c941-415b-9489-9a76397d2d13
  عنوان اصلی: استخراج کامپوننت‌ها از App.jsx
  اولویت اصلی: high
  وضعیت verify قبلی: pending
  فایل‌های دخیل: frontend/src/App.jsx

📋 acceptance_criteria کامل:
  - App.jsx حداکثر 100 خط باشد و فقط providers را ترکیب کند [verify_method=static] [verify_plan={"grep_patterns": ["^.{0,100}$"], "files_hint": ["frontend/src/App.jsx"]}]
  - هر context در فایل مجزای خود در پوشه contexts/ قرار گیرد [verify_method=static] [verify_plan={"grep_patterns": ["contexts/"], "files_hint": ["frontend/src/contexts/"]}]
  - Inspector Bridge به یک کامپوننت مجزا منتقل شود [verify_method=static] [verify_plan={"grep_patterns": ["InspectorBridge"], "files_hint": ["frontend/src/components/InspectorBridge.jsx"]}]
  - همه importها به درستی کار کنند و اپلیکیشن بدون خطا اجرا شود [verify_method=backend_test] [verify_plan={"test_node": "tests/frontend/test_app_imports.py::test_imports", "timeout_seconds": 60}]

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
کامپوننت App.jsx بیش از 1500 خط است و قابلیت نگهداری پایینی دارد

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/src/App.jsx:1-1542` — `App component` — کل فایل نیاز به refactoring دارد
  ```jsx
  import React, { useState, useEffect, useRef, useMemo, createContext, useContext, useCallback } from 'react';
  ... (1542 lines total)
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
React 18 + Context API + Firebase

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `frontend/src/main.jsx` (سطر 1) — وارد کننده App.jsx
- `frontend/src/index.css` (سطر 1) — استایل‌های global

## 🌐 نقشهٔ وابستگی‌ها
این فایل توسط main.jsx import می‌شود و تمام state management و routing اپلیکیشن را در خود دارد. هر تغییری در ساختار نیازمند تغییر در main.jsx نیست.

## 🔍 Context و وضعیت فعلی
فایل frontend/src/App.jsx در خط 400 قطع شده و مجموعاً 1542 خط دارد. این فایل شامل: Inspector Bridge Script (خطوط 1-126)، importهای متعدد (خط 132-133)، Firebase initialization (خطوط 136-139)، ExecutionFlowContext (خطوط 141-349)، LiveChatContext (خطوط 352-400+)، و ادامه آن شامل کامپوننت‌های اصلی (Chat, Quiz, FileAnalysis, VoiceChat) است. این حجم بالا باعث می‌شود درک جریان داده، debug کردن و اضافه کردن featureهای جدید بسیار دشوار باشد. همچنین multiple context providers در یک فایل باعث tight coupling شده است.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] App.jsx حداکثر 100 خط باشد و فقط providers را ترکیب کند
- [ ] هر context در فایل مجزای خود در پوشه contexts/ قرار گیرد
- [ ] Inspector Bridge به یک کامپوننت مجزا منتقل شود
- [ ] همه importها به درستی کار کنند و اپلیکیشن بدون خطا اجرا شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. فایل App.jsx را به چندین فایل مجزا تقسیم کنید: 1) contexts/ExecutionFlowContext.jsx 2) contexts/LiveChatContext.jsx 3) components/InspectorBridge.jsx 4) hooks/useFirebase.js 5) App.jsx فقط به عنوان orchestrator باقی بماند.

## 💡 نمونه‌های قبل/بعد
**ساختار فایل‌ها**

_قبل:_
```
frontend/src/App.jsx (1542 lines)
```

_بعد:_
```
frontend/src/App.jsx (50 lines orchestrator)
frontend/src/contexts/ExecutionFlowContext.jsx
frontend/src/contexts/LiveChatContext.jsx
frontend/src/components/InspectorBridge.jsx
frontend/src/hooks/useFirebase.js
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `wc -l frontend/src/App.jsx`
- `npm run build --prefix frontend`

## ⚠️ ریسک‌ها و موارد احتیاط
متوسط - ممکن است برخی importها در حین انتقال broken شوند. نیاز به تست کامل manual.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: refactor
- اولویت: high
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  - استخراج Inspector Bridge Script به فایل جداگانه — Inspector Bridge Script (خطوط 1-126) هنوز در App.jsx است و به فایل جدا منتقل نشده
  - استخراج Firebase initialization به فایل جداگانه — Firebase initialization (خطوط 136-139) هنوز در App.jsx است
  - استخراج ExecutionFlowContext به فایل جداگانه — ExecutionFlowContext (خطوط 141-349) هنوز در App.jsx است
  - استخراج LiveChatContext به فایل جداگانه — LiveChatContext (خطوط 352+) هنوز در App.jsx است
  - استخراج کامپوننت Chat به فایل جداگانه — کامپوننت Chat هنوز در App.jsx است
  - استخراج کامپوننت Quiz به فایل جداگانه — کامپوننت Quiz هنوز در App.jsx است
  - استخراج کامپوننت FileAnalysis به فایل جداگانه — کامپوننت FileAnalysis هنوز در App.jsx است
  - استخراج کامپوننت VoiceChat به فایل جداگانه — کامپوننت VoiceChat هنوز در App.jsx است
  - بازسازی App.jsx با importهای جدید و ساختار تمیز — App.jsx بازسازی نشده و همچنان 8150 خط دارد

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 2 از 5
  id: 9129c3f0-3212-454b-80ae-dd043a36db18
  عنوان اصلی: حذف کد مرده Inspector Bridge
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: frontend/index.html, frontend/src/App.jsx

📋 acceptance_criteria کامل:
  - هیچ لاگی با پیشوند '🌉 Inspector Bridge' در کنسول مرورگر ظاهر نشود [verify_method=static] [verify_plan={"grep_patterns": ["Inspector", "Bridge", "لاگی", "پیشوند", "کنسول", "مرورگر", "ظاهر", "نشود"], "files_hint": []}]
  - برنامه بدون خطا لود شود و عملکرد عادی داشته باشد [verify_method=static] [verify_plan={"grep_patterns": ["برنامه", "بدون", "عملکرد", "عادی", "داشته", "باشد"], "files_hint": []}]
  - هیچ تلاشی برای اتصال WebSocket به آدرس خارجی صورت نگیرد [verify_method=static] [verify_plan={"grep_patterns": ["WebSocket", "تلاشی", "برای", "اتصال", "آدرس", "خارجی", "صورت", "نگیرد"], "files_hint": []}]

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
حذف کد مرده Inspector Bridge از frontend/index.html و frontend/src/App.jsx

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/index.html:31-201` — `Inspector Bridge Script` — کل اسکریپت Inspector Bridge در index.html باید حذف شود
  ```
  <!-- Inspector Bridge Script - Auto-injected -->
  <script>
  (function() {
    console.log('🌉 Inspector Bridge: Script starting...');
    ...
  })();
  </script>
  ```
- `frontend/src/App.jsx:1-126` — `Inspector Bridge Script (WebSocket mode)` — کل بلوک Inspector Bridge در App.jsx باید حذف شود
  ```jsx
  // 🌉 Inspector Bridge Script - Auto-injected
  // ارتباط با Inspector از طریق WebSocket (حل مشکل cross-origin)
  if (typeof window !== 'undefined' && !window.__inspectorBridgeLoaded) {
    window.__inspectorBridgeLoaded = true;
    ...
  }
  // 🌉 End of Inspector Bridge Script
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
React 18 + Vite + Tailwind CSS

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `frontend/src/main.jsx` (سطر 1) — فایل ورودی که App.jsx را رندر می‌کند و ممکن است به متغیرهای سراسری وابسته باشد

## 🌐 نقشهٔ وابستگی‌ها
این کد مرده هیچ وابستگی به ماژول‌های npm ندارد و کاملاً مستقل است. حذف آن بر هیچ عملکرد دیگری تأثیر نمی‌گذارد.

## 🔍 Context و وضعیت فعلی
در frontend/index.html (خطوط 31-201) و frontend/src/App.jsx (خطوط 1-126) دو نسخه تقریباً یکسان از اسکریپت Inspector Bridge وجود دارد. اسکریپت index.html از postMessage برای ارتباط با iframe استفاده می‌کند، در حالی که اسکریپت App.jsx از WebSocket به آدرس wss://ai-creator-backend-q677.onrender.com/api/render/ws/bridge/gh_mahdighandi1989_language استفاده می‌کند. این کدها برای دیباگ و مانیتورینگ خارجی (احتمالاً یک پلتفرم no-code) هستند و در نسخه نهایی برنامه کاربردی ندارند. وجود آنها حجم باندل را افزایش می‌دهد، باعث ایجاد لاگ‌های اضافی در کنسول می‌شود و ممکن است با خطاهای WebSocket (زمانی که سرور در دسترس نیست) تجربه کاربری را خراب کند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] هیچ لاگی با پیشوند '🌉 Inspector Bridge' در کنسول مرورگر ظاهر نشود
- [ ] برنامه بدون خطا لود شود و عملکرد عادی داشته باشد
- [ ] هیچ تلاشی برای اتصال WebSocket به آدرس خارجی صورت نگیرد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. هر دو اسکریپت Inspector Bridge را حذف کنید. در frontend/index.html، کل تگ <script> از خط 31 تا 201 را بردارید. در frontend/src/App.jsx، بلوک کد از خط 1 تا 126 را حذف کنید. اطمینان حاصل کنید که هیچ وابستگی به متغیرهای سراسری مانند window.__inspectorBridgeLoaded در جای دیگری وجود ندارد.

## 💡 نمونه‌های قبل/بعد
**حذف اسکریپت از index.html**

_قبل:_
```
<!DOCTYPE html>
<html lang="fa" dir="rtl">
  <head>
    ...
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

_بعد:_
```
<!DOCTYPE html>
<html lang="fa" dir="rtl">
  <head>
    ...
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `cd frontend && npm run build`
- `cd frontend && grep -r 'Inspector Bridge' src/ index.html`

## ⚠️ ریسک‌ها و موارد احتیاط
بسیار کم. این کد کاملاً مجزا و بدون وابستگی است.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: refactor
- اولویت: high
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 3 از 5
  id: 59cbc244-8dbe-4b9d-9a39-a3633ffd0464
  عنوان اصلی: بازسازی معماری برای جداسازی نگرانی‌ها
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: backend/server.js, frontend/index.html, frontend/src/App.jsx, frontend/src/main.jsx

📋 acceptance_criteria کامل:
  - 1. پوشه‌های backend/controllers/، backend/models/، backend/services/، backend/routes/، backend/middleware/، backend/utils/ و backend/config/ ایجاد شده باشند. [verify_method=static] [verify_plan={"grep_patterns": [], "files_hint": ["backend/controllers/", "backend/models/", "backend/services/", "backend/routes/", "backend/middleware/", "backend/utils/", "backend/config/"]}]
  - 2. تمام مسیرهای HTTP (مانند /api/gemini/chat، /api/analyze-files، /api/health) از backend/server.js به فایل‌های جداگانه در backend/routes/ منتقل شده باشند. [verify_method=static] [verify_plan={"grep_patterns": ["app\\.(get|post|put|delete|patch)\\(\\s*['\"]/api/"], "files_hint": ["backend/server.js", "backend/routes/"]}]
  - 3. منطق کنترلرها (callbackهای مسیرها) از backend/server.js به فایل‌های backend/controllers/ منتقل شده باشند. [verify_method=static] [verify_plan={"grep_patterns": ["module\\.exports\\s*=", "exports\\."], "files_hint": ["backend/controllers/"]}]
  - 4. منطق تجاری و تعامل با APIهای خارجی (مانند توابع analyzeWithGemini، uploadToGeminiFileAPI) به فایل‌های backend/services/ منتقل شده باشند. [verify_method=static] [verify_plan={"grep_patterns": ["analyzeWithGemini", "uploadToGeminiFileAPI"], "files_hint": ["backend/services/"]}]
  - 5. ثابت‌ها و پرامپت‌های سیستمی (مانند LEBANESE_CORRECTION_PROMPT، ANALYSIS_SYSTEM_PROMPT) به فایل‌های backend/models/ یا backend/config/ منتقل شده باشند. [verify_method=static] [verify_plan={"grep_patterns": ["LEBANESE_CORRECTION_PROMPT", "ANALYSIS_SYSTEM_PROMPT"], "files_hint": ["backend/models/", "backend/config/"]}]
  - 6. میان‌افزارها (مانند handleMulterError) به فایل‌های backend/middleware/ منتقل شده باشند. [verify_method=static] [verify_plan={"grep_patterns": ["handleMulterError"], "files_hint": ["backend/middleware/"]}]
  - 7. توابع کمکی (مانند splitIntoChunks) به فایل‌های backend/utils/ منتقل شده باشند. [verify_method=static] [verify_plan={"grep_patterns": ["splitIntoChunks"], "files_hint": ["backend/utils/"]}]
  - 8. فایل backend/server.js پس از refactor فقط شامل importها، تنظیمات middlewareهای global، و استفاده از routeها باشد و طول آن به طور قابل توجهی کاهش یافته باشد. [verify_method=static] [verify_plan={"grep_patterns": ["require\\(|import\\s", "app\\.use\\(", "app\\.(get|post|put|delete|patch)\\("], "files_hint": ["backend/server.js"]}]
  - 9. برنامه پس از refactor بدون خطا اجرا شود و تمام endpointهای قبلی به درستی کار کنند. [verify_method=backend_test] [verify_plan={"test_node": "tests/test_refactor.py::test_endpoints_work", "timeout_seconds": 60}]
  - 10. هیچ تغییری در منطق برنامه، endpointها، یا frontend ایجاد نشده باشد. [verify_method=static] [verify_plan={"grep_patterns": [], "files_hint": ["frontend/"]}]
  - 1. پوشه‌های frontend/src/components، frontend/src/hooks و frontend/src/utils ایجاد شده باشند. [verify_method=static] [verify_plan={"grep_patterns": [], "files_hint": ["frontend/src/components/", "frontend/src/hooks/", "frontend/src/utils/"]}]
  - 2. فایل frontend/src/App.jsx به frontend/src/components/App.jsx منتقل شده باشد. [verify_method=static] [verify_plan={"grep_patterns": [], "files_hint": ["frontend/src/components/App.jsx"]}]
  - 3. import در frontend/src/main.jsx از './App' به './components/App' تغییر کرده باشد. [verify_method=static] [verify_plan={"grep_patterns": ["from\\s+['\"]\\./components/App['\"]"], "files_hint": ["frontend/src/main.jsx"]}]
  - 4. دستور npm run build در frontend بدون خطا اجرا شود و فایل‌های build در frontend/dist ایجاد شوند. [verify_method=backend_test] [verify_plan={"test_node": "tests/test_build.py::test_frontend_build", "timeout_seconds": 120}]
  - 5. دستور npm run dev در ریشه پروژه (که backend را اجرا می‌کند) بدون خطا اجرا شود و frontend به درستی سرو شود. [verify_method=backend_test] [verify_plan={"test_node": "tests/test_dev.py::test_dev_server", "timeout_seconds": 60}]
  - 6. محتوای فایل‌ها تغییری نکرده باشد (فقط مسیرها تغییر کرده باشند). [verify_method=static] [verify_plan={"grep_patterns": [], "files_hint": ["frontend/src/components/App.jsx", "frontend/src/main.jsx"]}]
  - 7. backend/server.js و backend/package.json تغییری نکرده باشند. [verify_method=static] [verify_plan={"grep_patterns": [], "files_hint": ["backend/server.js", "backend/package.json"]}]

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
بر اساس ساختار فایل‌ها، معماری پروژه مشخص نیست. عدم وجود folders مانند controllers، models، services در backend و components، hooks، utils در frontend نشان‌دهنده عدم رعایت best practices است.
```

## 📋 چک‌لیست مراحل (2 مرحله)

این تسک به مراحل کوچک‌تر تقسیم شده. **در هر verify خودکار، وضعیت هر مرحله به‌صورت `[ ]` (انجام نشده)، `[~]` (ناقص)، یا `[x]` (انجام شده) به‌روز می‌شود.**
وقتی تمام مراحل `[x]` شدند، تسک به‌طور خودکار به «انجام شده» منتقل می‌شود.

- [x] **مرحله 1: ایجاد ساختار پوشه‌های backend بر اساس معماری لایه‌ای (controllers, models, services)** — این مرحله شامل ایجاد پوشه‌های اصلی backend شامل controllers، models، services و انتقال فایل‌های موجود به پوشه‌های مناسب است. فایل‌های مربوط به مسیرها (routes) باید به پوشه controllers، مدل‌های داده به پوشه models، و منطق کسب‌وکار به پوشه services منتقل شوند. این مرحله شامل تغییر محتوای فایل‌ها یا با
- [x] **مرحله 2: ایجاد ساختار پوشه‌های frontend بر اساس معماری کامپوننتی (components, hooks, utils)** — این مرحله شامل ایجاد پوشه‌های اصلی frontend شامل components، hooks، utils و انتقال فایل‌های موجود به پوشه‌های مناسب است. کامپوننت‌های React به پوشه components، هوک‌های سفارشی به پوشه hooks، و توابع کمکی به پوشه utils منتقل می‌شوند. این مرحله شامل تغییر محتوای فایل‌ها یا بازنویسی کد نیست، فقط سازماند

---

# 🔹 مرحله 1: ایجاد ساختار پوشه‌های backend بر اساس معماری لایه‌ای (controllers, models, services)

**Scope:** این مرحله شامل ایجاد پوشه‌های اصلی backend شامل controllers، models، services و انتقال فایل‌های موجود به پوشه‌های مناسب است. فایل‌های مربوط به مسیرها (routes) باید به پوشه controllers، مدل‌های داده به پوشه models، و منطق کسب‌وکار به پوشه services منتقل شوند. این مرحله شامل تغییر محتوای فایل‌ها یا بازنویسی کد نیست، فقط سازماندهی مجدد ساختار فایل‌ها. خارج از این مرحله: ایجاد فایل‌های جدید، تغییر منطق برنامه، یا تغییر در frontend.
**Key terms:** backend, controllers, models, services, routes

**بخش مربوط از متن کاربر:**
```
عدم وجود folders مانند controllers، models، services در backend و components، hooks، utils در frontend نشان‌دهنده عدم رعایت best practices است.
```

## 🎯 هدف (خلاصه ساختاریافته)
سازماندهی مجدد ساختار پوشه‌های backend بر اساس معماری لایه‌ای (controllers, models, services)

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/server.js:1-1403` — `کل فایل` — این فایل تمام منطق backend را در خود دارد. پس از refactor، به یک فایل راه‌انداز (entry point) تبدیل می‌شود که فقط routeها را import و middlewareهای global را تنظیم می‌کند.
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
- `backend/server.js:56-114` — `app.post('/api/gemini/chat', ...)` — این مسیر و کنترلر آن باید به ترتیب به backend/routes/geminiRoutes.js و backend/controllers/geminiController.js منتقل شود.
  ```jsx
  app.post('/api/gemini/chat', async (req, res) => {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }
    try {
      const payload = req.body;
      const includeAudio = payload.includeAudio;
      delete payload.includeAudio;
      // ...
    } catch (error) {
      console.error('Chat API error:', error);
      res.status(500).json({ error: error.message });
    }
  });
  ```
- `backend/server.js:698-800` — `app.post('/api/analyze-files', ...)` — این مسیر و کنترلر آن باید به ترتیب به backend/routes/fileRoutes.js و backend/controllers/fileController.js منتقل شود. همچنین middlewareهای upload و handleMulterError به backend/middleware/uploadMiddleware.js منتقل شوند.
  ```jsx
  app.post('/api/analyze-files', upload.array('files', 10), handleMulterError, async (req, res) => {
    console.log('Received file analysis request');
    if (!GEMINI_API_KEY) {
      console.error('API key not configured');
      return res.status(500).json({ error: 'API key not configured' });
    }
    // ...
  });
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Stack تشخیص داده شده: JavaScript (Node.js) با Express.js برای backend. کتابخانه‌های اصلی: express, cors, ws (WebSocket), multer (آپلود فایل), fluent-ffmpeg (پردازش ویدیو/صدا), dotenv (مدیریت متغیرهای محیطی). frontend با React + Vite + Tailwind CSS ساخته شده است.

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `backend/package.json` (سطر 1) — این فایل وابستگی‌های پروژه backend را مشخص می‌کند. پس از refactor، نیازی به تغییر ندارد مگر اینکه ماژول‌های جدیدی اضافه شود (که خارج از scope این تسک است).
- `backend/.env.example` (سطر 1) — این فایل نمونه متغیرهای محیطی را نشان می‌دهد. پس از refactor، اگر مسیر فایل‌های config تغییر کند، ممکن است نیاز به به‌روزرسانی مسیر dotenv در server.js باشد.
- `frontend/vite.config.js` (سطر 10) — این فایل پروکسی سرور را برای API calls تنظیم می‌کند. اگر endpointهای backend تغییر کنند (که در این تسک نباید تغییر کنند)، این فایل باید به‌روزرسانی شود. اما در این تسک فقط ساختار فایل‌ها تغییر می‌کند، نه endpointها.
- `frontend/src/App.jsx` (سطر 1) — این فایل احتمالاً از APIهای backend استفاده می‌کند. اگر endpointها تغییر نکنند، نیازی به تغییر ندارد.
- `render.yaml` (سطر 1) — این فایل کانفیگ استقرار در Render را مشخص می‌کند. اگر مسیر فایل اصلی backend تغییر کند (مثلاً از server.js به app.js)، باید این فایل به‌روزرسانی شود.

## 🌐 نقشهٔ وابستگی‌ها
این refactor عمدتاً بر فایل backend/server.js تأثیر می‌گذارد که تمام منطق backend را در خود دارد. پس از تغییر، این فایل به یک فایل راه‌انداز (entry point) تبدیل می‌شود که routeها را import می‌کند. فایل‌های جدیدی در پوشه‌های backend/routes/، backend/controllers/، backend/services/، backend/models/، backend/middleware/، backend/utils/ و backend/config/ ایجاد می‌شوند. فایل‌های frontend (مانند frontend/vite.config.js و frontend/src/App.jsx) تحت تأثیر قرار نمی‌گیرند مگر اینکه endpointها تغییر کنند (که در این تسک نباید تغییر کنند). فایل render.yaml ممکن است نیاز به به‌روزرسانی داشته باشد اگر مسیر فایل اصلی backend تغییر کند. وابستگی‌های npm در backend/package.json نیازی به تغییر ندارند.

## 🔍 Context و وضعیت فعلی
درخواست کاربر با اولویت medium و نوع refactor است. کاربر می‌خواهد ساختار پوشه‌های backend را بر اساس معماری لایه‌ای (controllers, models, services) ایجاد کند. این مرحله شامل ایجاد پوشه‌های اصلی backend شامل controllers، models، services و انتقال فایل‌های موجود به پوشه‌های مناسب است. فایل‌های مربوط به مسیرها (routes) باید به پوشه controllers، مدل‌های داده به پوشه models، و منطق کسب‌وکار به پوشه services منتقل شوند. این مرحله شامل تغییر محتوای فایل‌ها یا بازنویسی کد نیست، فقط سازماندهی مجدد ساختار فایل‌ها. خارج از این مرحله: ایجاد فایل‌های جدید، تغییر منطق برنامه، یا تغییر در frontend. کاربر به عدم وجود folders مانند controllers، models، services در backend و components، hooks، utils در frontend اشاره کرده که نشان‌دهنده عدم رعایت best practices است. کلیدواژه‌های اصلی: backend, controllers, models, services, routes. در پروژه فعلی، تمام منطق backend در یک فایل واحد به نام backend/server.js (1403 خط) متمرکز شده است. این فایل شامل تعریف مسیرها (routes)، منطق تجاری (business logic)، تعامل با APIهای خارجی (مانند Gemini API)، پردازش فایل‌ها (multer, ffmpeg)، و مدیریت WebSocket است. هیچ جداسازی لایه‌ای وجود ندارد. فایل‌های مرتبط دیگر شامل backend/package.json (وابستگی‌ها) و backend/.env.example (تنظیمات محیطی) هستند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] 1. پوشه‌های backend/controllers/، backend/models/، backend/services/، backend/routes/، backend/middleware/، backend/utils/ و backend/config/ ایجاد شده باشند.
- [ ] 2. تمام مسیرهای HTTP (مانند /api/gemini/chat، /api/analyze-files، /api/health) از backend/server.js به فایل‌های جداگانه در backend/routes/ منتقل شده باشند.
- [ ] 3. منطق کنترلرها (callbackهای مسیرها) از backend/server.js به فایل‌های backend/controllers/ منتقل شده باشند.
- [ ] 4. منطق تجاری و تعامل با APIهای خارجی (مانند توابع analyzeWithGemini، uploadToGeminiFileAPI) به فایل‌های backend/services/ منتقل شده باشند.
- [ ] 5. ثابت‌ها و پرامپت‌های سیستمی (مانند LEBANESE_CORRECTION_PROMPT، ANALYSIS_SYSTEM_PROMPT) به فایل‌های backend/models/ یا backend/config/ منتقل شده باشند.
- [ ] 6. میان‌افزارها (مانند handleMulterError) به فایل‌های backend/middleware/ منتقل شده باشند.
- [ ] 7. توابع کمکی (مانند splitIntoChunks) به فایل‌های backend/utils/ منتقل شده باشند.
- [ ] 8. فایل backend/server.js پس از refactor فقط شامل importها، تنظیمات middlewareهای global، و استفاده از routeها باشد و طول آن به طور قابل توجهی کاهش یافته باشد.
- [ ] 9. برنامه پس از refactor بدون خطا اجرا شود و تمام endpointهای قبلی به درستی کار کنند.
- [ ] 10. هیچ تغییری در منطق برنامه، endpointها، یا frontend ایجاد نشده باشد.
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. با توجه به ساختار فعلی پروژه که تمام منطق در backend/server.js متمرکز شده است، مراحل زیر برای سازماندهی مجدد پیشنهاد می‌شود:

1. **ایجاد پوشه‌های اصلی**: در مسیر `backend/` پوشه‌های `controllers/`، `models/`، `services/`، `routes/`، `middleware/`، `utils/` و `config/` ایجاد شود.

2. **انتقال مسیرها (Routes) به پوشه routes**: تمام تعاریف `app.post(...)` و `app.get(...)` از `backend/server.js` (خطوط 56-698) به فایل‌های جداگانه در `backend/routes/` منتقل شوند. مثلاً:
   - `backend/routes/geminiRoutes.js` برای مسیرهای `/api/gemini/chat` (خط 56) و `/api/gemini/tts` (خط 117)
   - `backend/routes/healthRoutes.js` برای `/api/health` (خط 167)
   - `backend/routes/fileRoutes.js` برای `/api/analyze-files` (خط 698)

3. **انتقال منطق کنترلرها به پوشه controllers**: منطق داخل هر مسیر (که در حال حاضر داخل callback تابع در `server.js` است) به فایل‌های جداگانه در `backend/controllers/` منتقل شود. مثلاً:
   - `backend/controllers/geminiController.js` شامل توابع `chatHandler` و `ttsHandler`
   - `backend/controllers/fileController.js` شامل `analyzeFilesHandler`

4. **انتقال سرویس‌ها به پوشه services**: منطق تجاری و تعامل با APIهای خارجی به فایل‌های `backend/services/` منتقل شود:
   - `backend/services/geminiService.js` شامل توابع `analyzeWithGemini` (خط 273)، `uploadToGeminiFileAPI` (خط 297)، `analyzeWithGeminiFileAPIWithModel` (خط 395)
   - `backend/services/fileService.js` شامل توابع `splitIntoChunks` (خط 247)، `extractPdfText` (خط 565)، `getVideoDuration` (خط 445)، `splitVideoIntoSegments` (خط 455)، `extractAudioFromVideo` (خط 504)، `extractKeyFrames` (خط 531)

5. **انتقال مدل‌ها به پوشه models**: اگر ساختار داده‌ای وجود دارد (مانند ثابت‌های `LEBANESE_CORRECTION_PROMPT` در خط 582 و `ANALYSIS_SYSTEM_PROMPT` در خط 617)، به `backend/models/` منتقل شود.

6. **انتقال میان‌افزارها به پوشه middleware**: تابع `handleMulterError` (خط 686) به `backend/middleware/uploadMiddleware.js` منتقل شود.

7. **انتقال ابزارها به پوشه utils**: توابع کمکی مانند `splitIntoChunks` (خط 247) به `backend/utils/helpers.js` منتقل شوند.

8. **به‌روزرسانی server.js**: فایل اصلی `backend/server.js` فقط شامل importها، تنظیمات middlewareهای global، و استفاده از routeها باشد.

توجه: این تغییرات فقط شامل جابجایی کد است و هیچ تغییری در منطق برنامه ایجاد نمی‌کند.

## 💡 نمونه‌های قبل/بعد
**ساختار فعلی backend (قبل از refactor)**

_قبل:_
```
backend/
├── .env.example
├── package-lock.json
├── package.json
└── server.js  (همه چیز در این فایل)
```

_بعد:_
```
backend/
├── config/
│   └── index.js
├── controllers/
│   ├── geminiController.js
│   └── fileController.js
├── middleware/
│   └── uploadMiddleware.js
├── models/
│   └── prompts.js
├── routes/
│   ├── geminiRoutes.js
│   ├── healthRoutes.js
│   └── fileRoutes.js
├── services/
│   ├── geminiService.js
│   └── fileService.js
├── utils/
│   └── helpers.js
├── .env.example
├── package-lock.json
├── package.json
└── server.js  (فقط import و تنظیمات)
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `cd backend && node server.js  # برای تست اجرای backend`
- `curl -X POST http://localhost:3001/api/gemini/chat -H "Content-Type: application/json" -d '{"contents": [{"role": "user", "parts": [{"text": "hello"}]}]}'  # تست endpoint چت`
- `curl http://localhost:3001/api/health  # تست endpoint health`
- `cd frontend && npm run build  # برای اطمینان از عدم تأثیر بر frontend`

## ⚠️ ریسک‌ها و موارد احتیاط
ریسک اصلی این refactor، ایجاد خطاهای import در فایل backend/server.js است. اگر مسیر فایل‌های import شده به درستی تنظیم نشود، برنامه با خطای 'MODULE_NOT_FOUND' مواجه می‌شود. همچنین، اگر توابع به درستی export/import نشوند، ممکن است برخی endpointها کار نکنند. ریسک دیگر این است که فایل render.yaml ممکن است نیاز به به‌روزرسانی داشته باشد اگر مسیر فایل اصلی backend تغییر کند (مثلاً اگر server.js به app.js تغییر نام دهد). برای کاهش ریسک، توصیه می‌شود پس از هر مرحله از refactor، برنامه تست شود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: refactor
- اولویت: medium
- تخمین زمان: medium

---

# 🔹 مرحله 2: ایجاد ساختار پوشه‌های frontend بر اساس معماری کامپوننتی (components, hooks, utils)

**Scope:** این مرحله شامل ایجاد پوشه‌های اصلی frontend شامل components، hooks، utils و انتقال فایل‌های موجود به پوشه‌های مناسب است. کامپوننت‌های React به پوشه components، هوک‌های سفارشی به پوشه hooks، و توابع کمکی به پوشه utils منتقل می‌شوند. این مرحله شامل تغییر محتوای فایل‌ها یا بازنویسی کد نیست، فقط سازماندهی مجدد ساختار فایل‌ها. خارج از این مرحله: ایجاد فایل‌های جدید، تغییر منطق برنامه، یا تغییر در backend.
**Key terms:** frontend, components, hooks, utils, React

**بخش مربوط از متن کاربر:**
```
عدم وجود folders مانند controllers، models، services در backend و components، hooks، utils در frontend نشان‌دهنده عدم رعایت best practices است.
```

## 🎯 هدف (خلاصه ساختاریافته)
سازماندهی مجدد ساختار پوشه‌های frontend بر اساس معماری کامپوننتی (components, hooks, utils)

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/src/App.jsx:1-? (کل فایل)` — `App (کامپوننت پیش‌فرض React)` — این فایل یک کامپوننت React است و باید به frontend/src/components/App.jsx منتقل شود. محتوای فایل تغییر نمی‌کند.
  ```jsx
  فایل frontend/src/App.jsx در deep context موجود نیست، اما طبق ساختار پروژه در frontend/src/ قرار دارد.
  ```
- `frontend/src/main.jsx:1-? (کل فایل)` — `main (نقطه ورود React)` — این فایل باید import خود را از './App' به './components/App' تغییر دهد.
  ```jsx
  فایل frontend/src/main.jsx در deep context موجود نیست، اما طبق نقشه Importها، App.jsx را import می‌کند.
  ```
- `frontend/index.html:206` — `script (نقطه ورود ماژول)` — این خط نیازی به تغییر ندارد چون main.jsx در ریشه src باقی می‌ماند.
  ```
  <script type="module" src="/src/main.jsx"></script>
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Stack تشخیص داده شده: JavaScript (ES Modules), React 18, Vite 5, Tailwind CSS 3, PostCSS, Autoprefixer. کتابخانه‌های مرتبط: react, react-dom, @vitejs/plugin-react, tailwindcss, postcss, autoprefixer. فایل‌های تنظیمات: frontend/vite.config.js, frontend/tailwind.config.js, frontend/postcss.config.js.

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `frontend/src/main.jsx` (سطر 1) — این فایل App.jsx را import می‌کند و پس از انتقال باید مسیر import به‌روزرسانی شود.
- `frontend/vite.config.js` (سطر 12) — این فایل تنظیمات build و proxy را مشخص می‌کند. با انتقال فایل‌ها، مسیر build (outDir: 'dist') تغییری نمی‌کند، اما باید بررسی شود که مسیرهای import در build صحیح باشند.
- `frontend/index.html` (سطر 206) — این فایل main.jsx را به عنوان نقطه ورود مشخص می‌کند. با انتقال App.jsx، این فایل تغییری نمی‌کند.
- `frontend/src/index.css` (سطر 1) — این فایل توسط main.jsx import می‌شود. اگر استایل‌های عمومی در آن است، می‌تواند در ریشه src باقی بماند یا به components/App.css منتقل شود.

## 🌐 نقشهٔ وابستگی‌ها
این refactor فقط frontend را تحت تأثیر قرار می‌دهد. فایل frontend/src/main.jsx (نقطه ورود React) App.jsx را import می‌کند و پس از انتقال باید مسیر import به‌روزرسانی شود. فایل frontend/index.html (خط 206) به /src/main.jsx اشاره دارد که تغییری نمی‌کند. فایل frontend/vite.config.js تنظیمات build را مشخص می‌کند و با انتقال فایل‌ها، مسیر build (outDir: 'dist') تغییری نمی‌کند. فایل frontend/src/index.css توسط main.jsx import می‌شود و می‌تواند در ریشه src باقی بماند. backend/server.js و backend/package.json تحت تأثیر قرار نمی‌گیرند. فایل‌های package.json و package-lock.json در ریشه و frontend نیازی به تغییر ندارند چون وابستگی‌ها تغییر نمی‌کنند.

## 🔍 Context و وضعیت فعلی
کاربر درخواست ایجاد ساختار پوشه‌های frontend بر اساس معماری کامپوننتی شامل پوشه‌های components، hooks، utils و انتقال فایل‌های موجود به پوشه‌های مناسب را دارد. این یک refactor با اولویت medium است. کاربر تأکید کرده که این مرحله شامل تغییر محتوای فایل‌ها یا بازنویسی کد نیست، فقط سازماندهی مجدد ساختار فایل‌ها. خارج از این مرحله: ایجاد فایل‌های جدید، تغییر منطق برنامه، یا تغییر در backend. کاربر اشاره کرده که عدم وجود folders مانند controllers، models، services در backend و components، hooks، utils در frontend نشان‌دهنده عدم رعایت best practices است. کلیدواژه‌ها: frontend, components, hooks, utils, React.

شواهد در کد واقعی پروژه: در ساختار کامل پروژه، فایل‌های frontend به صورت تخت در frontend/src/ قرار دارند:
- frontend/src/App.jsx
- frontend/src/index.css
- frontend/src/main.jsx
هیچ پوشه‌ای با نام components، hooks یا utils در frontend/src/ وجود ندارد. فایل frontend/src/App.jsx توسط frontend/src/main.jsx import می‌شود (طبق نقشه Importهای داخلی). فایل frontend/src/index.css نیز توسط frontend/src/main.jsx import می‌شود. فایل frontend/vite.config.js در خط 12-16 یک proxy برای /api به http://localhost:3001 تنظیم کرده است.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] 1. پوشه‌های frontend/src/components، frontend/src/hooks و frontend/src/utils ایجاد شده باشند.
- [ ] 2. فایل frontend/src/App.jsx به frontend/src/components/App.jsx منتقل شده باشد.
- [ ] 3. import در frontend/src/main.jsx از './App' به './components/App' تغییر کرده باشد.
- [ ] 4. دستور npm run build در frontend بدون خطا اجرا شود و فایل‌های build در frontend/dist ایجاد شوند.
- [ ] 5. دستور npm run dev در ریشه پروژه (که backend را اجرا می‌کند) بدون خطا اجرا شود و frontend به درستی سرو شود.
- [ ] 6. محتوای فایل‌ها تغییری نکرده باشد (فقط مسیرها تغییر کرده باشند).
- [ ] 7. backend/server.js و backend/package.json تغییری نکرده باشند.
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. مراحل پیاده‌سازی:
1. ایجاد پوشه‌های frontend/src/components، frontend/src/hooks و frontend/src/utils.
2. انتقال فایل frontend/src/App.jsx به frontend/src/components/App.jsx (چون App یک کامپوننت React است).
3. به‌روزرسانی مسیر import در frontend/src/main.jsx از './App' به './components/App'.
4. انتقال فایل frontend/src/index.css به frontend/src/components/App.css (اختیاری - اگر استایل‌های App در index.css است) یا نگه‌داشتن index.css در ریشه src.
5. ایجاد فایل‌های خالی index.js در هر پوشه برای export (اختیاری).
6. اطمینان از اینکه vite.config.js و tailwind.config.js نیازی به تغییر ندارند چون مسیر src تغییر نکرده است.
7. تست build با دستور npm run build در frontend.
8. بررسی اینکه frontend/index.html (خط 206) به /src/main.jsx اشاره دارد که تغییری نمی‌کند.

توجه: کاربر تأکید کرده که این مرحله فقط سازماندهی مجدد است و شامل تغییر منطق برنامه نمی‌شود.

## 💡 نمونه‌های قبل/بعد
**ساختار فعلی frontend/src (قبل از refactor)**

_قبل:_
```
frontend/src/
├── App.jsx
├── index.css
└── main.jsx
```

_بعد:_
```
frontend/src/
├── components/
│   ├── App.jsx
│   └── App.css (اختیاری)
├── hooks/
│   └── (خالی)
├── utils/
│   └── (خالی)
├── index.css
└── main.jsx
```

**import در main.jsx (قبل و بعد)**

_قبل:_
```
import App from './App'
```

_بعد:_
```
import App from './components/App'
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `cd frontend && npm run build`
- `cd frontend && npm run dev (بررسی در مرورگر)`
- `ls frontend/src/components/App.jsx (بررسی وجود فایل)`
- `grep -r "from './App'" frontend/src/main.jsx (بررسی عدم وجود import قدیمی)`
- `grep "from './components/App'" frontend/src/main.jsx (بررسی وجود import جدید)`

## ⚠️ ریسک‌ها و موارد احتیاط
ریسک اصلی این است که اگر فایل‌های دیگری (مانند frontend/src/App.jsx) توسط فایل‌های دیگر import شده باشند (که طبق نقشه Importهای داخلی فقط توسط frontend/src/main.jsx import می‌شود)، تغییر مسیر import در main.jsx کافی است. اما اگر در آینده فایل‌های دیگری به App.jsx وابسته شوند، باید مسیر آن‌ها نیز به‌روزرسانی شود. همچنین اگر frontend/src/index.css حاوی استایل‌های عمومی باشد و به components/App.css منتقل شود، باید import آن در main.jsx نیز تغییر کند. ریسک دیگر این است که اگر پوشه‌های components، hooks، utils از قبل وجود داشته باشند (که در ساختار پروژه دیده نمی‌شوند)، دستور mkdir با خطا مواجه می‌شود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: refactor
- اولویت: medium
- تخمین زمان: small

---

## ✅ معیارهای پذیرش کلی (همهٔ مراحل)
- [ ] 1. پوشه‌های backend/controllers/، backend/models/، backend/services/، backend/routes/، backend/middleware/، backend/utils/ و backend/config/ ایجاد شده باشند.
- [ ] 2. تمام مسیرهای HTTP (مانند /api/gemini/chat، /api/analyze-files، /api/health) از backend/server.js به فایل‌های جداگانه در backend/routes/ منتقل شده باشند.
- [ ] 3. منطق کنترلرها (callbackهای مسیرها) از backend/server.js به فایل‌های backend/controllers/ منتقل شده باشند.
- [ ] 4. منطق تجاری و تعامل با APIهای خارجی (مانند توابع analyzeWithGemini، uploadToGeminiFileAPI) به فایل‌های backend/services/ منتقل شده باشند.
- [ ] 5. ثابت‌ها و پرامپت‌های سیستمی (مانند LEBANESE_CORRECTION_PROMPT، ANALYSIS_SYSTEM_PROMPT) به فایل‌های backend/models/ یا backend/config/ منتقل شده باشند.
- [ ] 6. میان‌افزارها (مانند handleMulterError) به فایل‌های backend/middleware/ منتقل شده باشند.
- [ ] 7. توابع کمکی (مانند splitIntoChunks) به فایل‌های backend/utils/ منتقل شده باشند.
- [ ] 8. فایل backend/server.js پس از refactor فقط شامل importها، تنظیمات middlewareهای global، و استفاده از routeها باشد و طول آن به طور قابل توجهی کاهش یافته باشد.
- [ ] 9. برنامه پس از refactor بدون خطا اجرا شود و تمام endpointهای قبلی به درستی کار کنند.
- [ ] 10. هیچ تغییری در منطق برنامه، endpointها، یا frontend ایجاد نشده باشد.
- [ ] 1. پوشه‌های frontend/src/components، frontend/src/hooks و frontend/src/utils ایجاد شده باشند.
- [ ] 2. فایل frontend/src/App.jsx به frontend/src/components/App.jsx منتقل شده باشد.
- [ ] 3. import در frontend/src/main.jsx از './App' به './components/App' تغییر کرده باشد.
- [ ] 4. دستور npm run build در frontend بدون خطا اجرا شود و فایل‌های build در frontend/dist ایجاد شوند.
- [ ] 5. دستور npm run dev در ریشه پروژه (که backend را اجرا می‌کند) بدون خطا اجرا شود و frontend به درستی سرو شود.
- [ ] 6. محتوای فایل‌ها تغییری نکرده باشد (فقط مسیرها تغییر کرده باشند).
- [ ] 7. backend/server.js و backend/package.json تغییری نکرده باشند.

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  - ایجاد ساختار پوشه‌های backend بر اساس معماری لایه‌ای (controllers, models, services)

🔧 مراحل remaining که در super-task باید انجام شوند:
  - ایجاد ساختار پوشه‌های frontend بر اساس معماری کامپوننتی (components, hooks, utils) — ایجاد پوشه‌های frontend/src/components, hooks, utils و انتقال فایل‌ها

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 4 از 5
  id: 5e62b869-2d97-4688-a4f2-eccb39f844ae
  عنوان اصلی: استانداردسازی ساختار پوشه و کامپوننت‌های React
  اولویت اصلی: medium
  وضعیت verify قبلی: pending
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - اعمال تغییر بدون شکستن تست‌های موجود [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]
  - linter بدون warning عبور می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["no-unused-vars", "no-undef"], "files_hint": ["frontend/src/"]}]
  - type-check موفق است [verify_method=static] [verify_plan={"grep_patterns": ["tsc", "type-check"], "files_hint": ["frontend/tsconfig.json"]}]

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
پروژه فاقد فایل‌های کامپوننت مجزا و ساختار پوشه‌ای استاندارد React است

## 📍 موقعیت دقیق در پروژه
_(فایل‌های دقیق توسط مجری شناسایی شوند — هیچ موقعیت مشخصی استخراج نشد)_

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🔍 Context و وضعیت فعلی
بر اساس لیست فایل‌ها، در frontend/src/ تنها سه فایل وجود دارد: App.jsx, index.css, main.jsx. هیچ پوشه components/, pages/, hooks/, services/, utils/ وجود ندارد. این lack of structure باعث می‌شود: 1) همه منطق اپلیکیشن در یک فایل 1500+ خطی متمرکز شود 2) قابلیت استفاده مجدد از کد پایین است 3) تست‌نویسی غیرممکن است 4) همکاری تیمی دشوار است. همچنین فایل‌های config مانند postcss.config.js و tailwind.config.js در ریشه frontend هستند که استاندارد است.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] اعمال تغییر بدون شکستن تست‌های موجود
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. ساختار پوشه‌ای استاندارد React

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
تسک 5 از 5
  id: 8d5aac8c-2e65-4d59-b4d1-0a8661a45644
  عنوان اصلی: جداسازی WebSocket از Inspector Bridge
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: backend/server.js, frontend/src/App.jsx

📋 acceptance_criteria کامل:
  - Inspector Bridge فقط از postMessage استفاده کند [verify_method=static] [verify_plan={"grep_patterns": ["postMessage"], "files_hint": ["frontend/src/App.jsx"]}]
  - WebSocket سرور برای Live Voice یا قابلیت دیگر باقی بماند [verify_method=static] [verify_plan={"grep_patterns": ["/ws/live", "WebSocket.Server"], "files_hint": ["backend/server.js"]}]
  - هیچ خطای WebSocket در کنسول ظاهر نشود [verify_method=ui_interaction] [verify_plan={"base": "frontend", "ui_steps": [{"action": "navigate", "url": "/"}, {"action": "wait_for_load", "state": "networkidle"}, {"action": "assert_no_console_errors", "pattern": "WebSocket"}], "expected_ap]

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
WebSocket Server در backend/server.js تعریف شده اما در Inspector Bridge استفاده نمی‌شود

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/server.js:45` — `WebSocketServer` — WebSocket سرور با مسیر /ws/live
  ```jsx
  const wss = new WebSocketServer({ server, path: '/ws/live' });
  ```
- `frontend/src/App.jsx:8` — `WS_URL` — WebSocket URL اشتباه
  ```jsx
  const WS_URL = 'wss://ai-creator-backend-q677.onrender.com/api/render/ws/bridge/gh_mahdighandi1989_language';
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Express + ws library

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `frontend/index.html` (سطر 32) — Inspector Bridge که از postMessage استفاده می‌کند
- `backend/server.js` (سطر 45) — سرور WebSocket

## 🌐 نقشهٔ وابستگی‌ها
WebSocket سرور در بک‌اند تعریف شده اما در فرانت‌اند استفاده نمی‌شود.

## 🔍 Context و وضعیت فعلی
در backend/server.js خط 45، یک WebSocket Server با مسیر '/ws/live' ایجاد شده است. اما در Inspector Bridge فرانت‌اند (frontend/src/App.jsx خط 8) از یک WebSocket URL کاملاً متفاوت و خارجی استفاده می‌شود. این نشان می‌دهد که WebSocket سرور بک‌اند یا استفاده نمی‌شود یا برای قابلیت دیگری (احتمالاً Live Voice) در نظر گرفته شده است. این عدم تطابق باعث سردرگمی و نگهداری دشوار کد می‌شود.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] Inspector Bridge فقط از postMessage استفاده کند
- [ ] WebSocket سرور برای Live Voice یا قابلیت دیگر باقی بماند
- [ ] هیچ خطای WebSocket در کنسول ظاهر نشود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. مشخص کنید که WebSocket سرور برای چه قابلیتی استفاده می‌شود (احتمالاً Live Voice). اگر برای Inspector Bridge نیست، Inspector Bridge را به طور کامل به postMessage تغییر دهید. اگر قرار است Inspector Bridge از WebSocket استفاده کند، مسیر صحیح را در فرانت‌اند تنظیم کنید.

## 💡 نمونه‌های قبل/بعد
**حذف WebSocket از Inspector Bridge**

_قبل:_
```
const WS_URL = 'wss://ai-creator-backend-q677.onrender.com/api/render/ws/bridge/gh_mahdighandi1989_language';
let ws = null;
...
```

_بعد:_
```
// فقط postMessage استفاده شود
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `بررسی Network tab برای درخواست‌های WebSocket`
- `console.log برای نمایش روش ارتباطی`

## ⚠️ ریسک‌ها و موارد احتیاط
تغییر ممکن است Inspector Bridge را در برخی محیط‌ها از کار بیندازد

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: refactor
- اولویت: medium
- تخمین زمان: small

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
- در commit message: `merged-from: 8e301658-c941-415b-9489-9a76397d2d13, 9129c3f0-3212-454b-80ae-dd043a36db18, 59cbc244-8dbe-4b9d-9a39-a3633ffd0464, 5e62b869-2d97-4688-a4f2-eccb39f844ae, 8d5aac8c-2e65-4d59-b4d1-0a8661a45644`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Acceptance Criteria

1. 1. پوشه‌های backend/controllers/، backend/models/، backend/services/، backend/routes/، backend/middleware/، backend/utils/ و backend/config/ ایجاد شده باشند. _(verify: static)_
2. 2. تمام مسیرهای HTTP (مانند /api/gemini/chat، /api/analyze-files، /api/health) از backend/server.js به فایل‌های جداگانه در backend/routes/ منتقل شده باشند. _(verify: static)_
3. 3. منطق کنترلرها (callbackهای مسیرها) از backend/server.js به فایل‌های backend/controllers/ منتقل شده باشند. _(verify: static)_
4. 4. منطق تجاری و تعامل با APIهای خارجی (مانند توابع analyzeWithGemini، uploadToGeminiFileAPI) به فایل‌های backend/services/ منتقل شده باشند. _(verify: static)_
5. 5. ثابت‌ها و پرامپت‌های سیستمی (مانند LEBANESE_CORRECTION_PROMPT، ANALYSIS_SYSTEM_PROMPT) به فایل‌های backend/models/ یا backend/config/ منتقل شده باشند. _(verify: static)_
6. 6. میان‌افزارها (مانند handleMulterError) به فایل‌های backend/middleware/ منتقل شده باشند. _(verify: static)_
7. 7. توابع کمکی (مانند splitIntoChunks) به فایل‌های backend/utils/ منتقل شده باشند. _(verify: static)_
8. 8. فایل backend/server.js پس از refactor فقط شامل importها، تنظیمات middlewareهای global، و استفاده از routeها باشد و طول آن به طور قابل توجهی کاهش یافته باشد. _(verify: static)_
9. 9. برنامه پس از refactor بدون خطا اجرا شود و تمام endpointهای قبلی به درستی کار کنند. _(verify: backend_test)_
10. 10. هیچ تغییری در منطق برنامه، endpointها، یا frontend ایجاد نشده باشد. _(verify: static)_
11. 1. پوشه‌های frontend/src/components، frontend/src/hooks و frontend/src/utils ایجاد شده باشند. _(verify: static)_
12. 2. فایل frontend/src/App.jsx به frontend/src/components/App.jsx منتقل شده باشد. _(verify: static)_
13. 3. import در frontend/src/main.jsx از './App' به './components/App' تغییر کرده باشد. _(verify: static)_
14. 4. دستور npm run build در frontend بدون خطا اجرا شود و فایل‌های build در frontend/dist ایجاد شوند. _(verify: backend_test)_
15. 5. دستور npm run dev در ریشه پروژه (که backend را اجرا می‌کند) بدون خطا اجرا شود و frontend به درستی سرو شود. _(verify: backend_test)_
16. 6. محتوای فایل‌ها تغییری نکرده باشد (فقط مسیرها تغییر کرده باشند). _(verify: static)_
17. 7. backend/server.js و backend/package.json تغییری نکرده باشند. _(verify: static)_
18. App.jsx حداکثر 100 خط باشد و فقط providers را ترکیب کند _(verify: static)_
19. هر context در فایل مجزای خود در پوشه contexts/ قرار گیرد _(verify: static)_
20. Inspector Bridge به یک کامپوننت مجزا منتقل شود _(verify: static)_
21. همه importها به درستی کار کنند و اپلیکیشن بدون خطا اجرا شود _(verify: backend_test)_
22. اعمال تغییر بدون شکستن تست‌های موجود _(verify: backend_test)_
23. linter بدون warning عبور می‌کند _(verify: static)_
24. type-check موفق است _(verify: static)_
25. هیچ لاگی با پیشوند '🌉 Inspector Bridge' در کنسول مرورگر ظاهر نشود _(verify: static)_
26. برنامه بدون خطا لود شود و عملکرد عادی داشته باشد _(verify: static)_
27. هیچ تلاشی برای اتصال WebSocket به آدرس خارجی صورت نگیرد _(verify: static)_
28. Inspector Bridge فقط از postMessage استفاده کند _(verify: static)_
29. WebSocket سرور برای Live Voice یا قابلیت دیگر باقی بماند _(verify: static)_
30. هیچ خطای WebSocket در کنسول ظاهر نشود _(verify: ui_interaction)_

## Task Steps

### Step 1: استخراج Inspector Bridge Script از App.jsx به فایل مجزا
**Status:** `done` (100%)
**Scope:** این مرحله شامل استخراج بلوک کد Inspector Bridge Script (خطوط 1-126) از frontend/src/App.jsx و انتقال آن به یک فایل مجزا در frontend/src/components/InspectorBridge.jsx است. خارج از این مرحله: تغییر در منطق اسکریپت، حذف اسکریپت، یا تغییر در فایل‌های دیگر. نکته حیاتی: اسکریپت باید دقیقاً با همان منطق و وابستگی‌ها به فایل جدید منتقل شود و import آن در App.jsx اضافه گردد.
**Excerpt:**
```
🔧 مراحل remaining که در super-task باید انجام شوند:
  - استخراج Inspector Bridge Script به فایل جداگانه — Inspector Bridge Script (خطوط 1-126) هنوز در App.jsx است و به فایل جدا منتقل نشده
```

### Step 2: استخراج Firebase initialization از App.jsx به فایل مجزا
**Status:** `done` (100%)
**Scope:** این مرحله شامل استخراج بلوک Firebase initialization (خطوط 136-139) از frontend/src/App.jsx و انتقال آن به یک فایل مجزا در frontend/src/hooks/useFirebase.js است. خارج از این مرحله: تغییر در منطق Firebase، تغییر در سایر contextها، یا تغییر در فایل‌های دیگر. نکته حیاتی: تابع useFirebase باید به عنوان یک hook سفارشی React پیاده‌سازی شود و در App.jsx استفاده گردد.
**Excerpt:**
```
🔧 مراحل remaining که در super-task باید انجام شوند:
  - استخراج Firebase initialization به فایل جداگانه — Firebase initialization (خطوط 136-139) هنوز در App.jsx است
```

### Step 3: استخراج ExecutionFlowContext از App.jsx به فایل مجزا
**Status:** `done` (100%)
**Scope:** این مرحله شامل استخراج بلوک ExecutionFlowContext (خطوط 141-349) از frontend/src/App.jsx و انتقال آن به یک فایل مجزا در frontend/src/contexts/ExecutionFlowContext.jsx است. خارج از این مرحله: تغییر در منطق context، تغییر در سایر contextها، یا تغییر در فایل‌های دیگر. نکته حیاتی: context باید با تمام provider logic و state management خود به فایل جدید منتقل شود و در App.jsx import گردد.
**Excerpt:**
```
🔧 مراحل remaining که در super-task باید انجام شوند:
  - استخراج ExecutionFlowContext به فایل جداگانه — ExecutionFlowContext (خطوط 141-349) هنوز در App.jsx است
```

### Step 4: استخراج LiveChatContext از App.jsx به فایل مجزا
**Status:** `done` (100%)
**Scope:** این مرحله شامل استخراج بلوک LiveChatContext (خطوط 352+) از frontend/src/App.jsx و انتقال آن به یک فایل مجزا در frontend/src/contexts/LiveChatContext.jsx است. خارج از این مرحله: تغییر در منطق context، تغییر در سایر contextها، یا تغییر در فایل‌های دیگر. نکته حیاتی: context باید با تمام provider logic و state management خود به فایل جدید منتقل شود و در App.jsx import گردد.
**Excerpt:**
```
🔧 مراحل remaining که در super-task باید انجام شوند:
  - استخراج LiveChatContext به فایل جداگانه — LiveChatContext (خطوط 352+) هنوز در App.jsx است
```

### Step 5: استخراج کامپوننت Chat از App.jsx به فایل مجزا
**Status:** `done` (100%)
**Scope:** این مرحله شامل استخراج کامپوننت Chat از frontend/src/App.jsx و انتقال آن به یک فایل مجزا در frontend/src/components/Chat.jsx است. خارج از این مرحله: تغییر در منطق کامپوننت، تغییر در سایر کامپوننت‌ها، یا تغییر در فایل‌های دیگر. نکته حیاتی: کامپوننت باید با تمام props و state management خود به فایل جدید منتقل شود و در App.jsx import گردد.
— [merged] این مرحله شامل استخراج کامپوننت Quiz از frontend/src/App.jsx و انتقال آن به یک فایل مجزا در frontend/src/components/Quiz.jsx است. خارج از این مرحله: تغییر در منطق کامپوننت، تغییر در سایر کامپوننت‌ها، یا تغییر در فایل‌های دیگر. نکته حیاتی: کامپوننت باید با تمام props و state management خود به فایل جدید منتقل شود و در App.jsx import گردد.
— [merged] این مرحله شامل استخراج کامپوننت FileAnalysis از frontend/src/App.jsx و انتقال آن به یک فایل مجزا در frontend/src/components/FileAnalysis.jsx است. خارج از این مرحله: تغییر در منطق کامپوننت، تغییر در سایر کامپوننت‌ها، یا تغییر در فایل‌های دیگر. نکته حیاتی: کامپوننت باید با تمام props و state management خود به فایل جدید منتقل شود و در App.jsx import گردد.
— [merged] این مرحله شامل استخراج کامپوننت VoiceChat از frontend/src/App.jsx و انتقال آن به یک فایل مجزا در frontend/src/components/VoiceChat.jsx است. خارج از این مرحله: تغییر در منطق کامپوننت، تغییر در سایر کامپوننت‌ها، یا تغییر در فایل‌های دیگر. نکته حیاتی: کامپوننت باید با تمام props و state management خود به فایل جدید منتقل شود و در App.jsx import گردد.
**Excerpt:**
```
🔧 مراحل remaining که در super-task باید انجام شوند:
  - استخراج کامپوننت Chat به فایل جداگانه — کامپوننت Chat هنوز در App.jsx است
```

### Step 6: بازسازی App.jsx با importهای جدید و ساختار تمیز
**Status:** `done` (100%)
**Scope:** این مرحله شامل بازسازی فایل frontend/src/App.jsx به عنوان یک orchestrator است که فقط providers را ترکیب می‌کند و کامپوننت‌های اصلی را import می‌کند. خارج از این مرحله: تغییر در منطق برنامه، تغییر در فایل‌های دیگر، یا ایجاد قابلیت جدید. نکته حیاتی: App.jsx باید حداکثر 100 خط باشد و فقط شامل importها، providerها و رندر کامپوننت‌های اصلی باشد.
**Excerpt:**
```
🔧 مراحل remaining که در super-task باید انجام شوند:
  - بازسازی App.jsx با importهای جدید و ساختار تمیز — App.jsx بازسازی نشده و همچنان 8150 خط دارد
```

### Step 7: حذف اسکریپت Inspector Bridge از frontend/index.html
**Status:** `pending` (0%)
**Scope:** این مرحله شامل حذف کامل تگ <script> مربوط به Inspector Bridge (خطوط 31-201) از فایل frontend/index.html است. خارج از این مرحله: تغییر در سایر بخش‌های index.html، تغییر در فایل‌های دیگر، یا تغییر در منطق برنامه. نکته حیاتی: اطمینان حاصل شود که هیچ وابستگی به متغیرهای سراسری مانند window.__inspectorBridgeLoaded در جای دیگری وجود ندارد.
**Excerpt:**
```
## 🎯 هدف (خلاصه ساختاریافته)
حذف کد مرده Inspector Bridge از frontend/index.html و frontend/src/App.jsx

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/index.html:31-201` — `Inspector Bridge Script` — کل اسکریپت Inspector Bridge در index.html باید حذف شود
```

### Step 8: حذف بلوک Inspector Bridge از frontend/src/App.jsx
**Status:** `done` (100%)
**Scope:** این مرحله شامل حذف کامل بلوک کد Inspector Bridge (خطوط 1-126) از فایل frontend/src/App.jsx است. خارج از این مرحله: تغییر در سایر بخش‌های App.jsx، تغییر در فایل‌های دیگر، یا تغییر در منطق برنامه. نکته حیاتی: اطمینان حاصل شود که هیچ وابستگی به متغیرهای سراسری مانند window.__inspectorBridgeLoaded در جای دیگری وجود ندارد.
**Excerpt:**
```
## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/src/App.jsx:1-126` — `Inspector Bridge Script (WebSocket mode)` — کل بلوک Inspector Bridge در App.jsx باید حذف شود
```

### Step 9: ایجاد پوشه‌های backend بر اساس معماری لایه‌ای
**Status:** `done` (100%)
**Scope:** این مرحله شامل ایجاد پوشه‌های backend/controllers/، backend/models/، backend/services/، backend/routes/، backend/middleware/، backend/utils/ و backend/config/ است. خارج از این مرحله: انتقال فایل‌ها به این پوشه‌ها، تغییر در منطق برنامه، یا تغییر در frontend. نکته حیاتی: فقط پوشه‌ها ایجاد می‌شوند و هیچ فایلی منتقل یا تغییر نمی‌کند.
**Excerpt:**
```
📋 acceptance_criteria کامل:
  - 1. پوشه‌های backend/controllers/، backend/models/، backend/services/، backend/routes/، backend/middleware/، backend/utils/ و backend/config/ ایجاد شده باشند.
```

### Step 10: انتقال مسیرهای HTTP از backend/server.js به فایل‌های routes
**Status:** `done` (100%)
**Scope:** این مرحله شامل انتقال تمام تعاریف مسیرهای HTTP (مانند app.post('/api/gemini/chat', ...)، app.post('/api/analyze-files', ...)، app.get('/api/health', ...)) از backend/server.js به فایل‌های جداگانه در backend/routes/ است. خارج از این مرحله: انتقال منطق کنترلرها، تغییر در منطق برنامه، یا تغییر در frontend. نکته حیاتی: مسیرها باید به فایل‌های مجزا مانند geminiRoutes.js، fileRoutes.js و healthRoutes.js منتقل شوند.
**Excerpt:**
```
📋 acceptance_criteria کامل:
  - 2. تمام مسیرهای HTTP (مانند /api/gemini/chat، /api/analyze-files، /api/health) از backend/server.js به فایل‌های جداگانه در backend/routes/ منتقل شده باشند.
```

### Step 11: انتقال منطق کنترلرها از backend/server.js به فایل‌های controllers
**Status:** `done` (100%)
**Scope:** این مرحله شامل انتقال منطق کنترلرها (callbackهای مسیرها) از backend/server.js به فایل‌های backend/controllers/ است. خارج از این مرحله: انتقال مسیرها، تغییر در منطق برنامه، یا تغییر در frontend. نکته حیاتی: کنترلرها باید به فایل‌های مجزا مانند geminiController.js و fileController.js منتقل شوند و به صورت module.exports صادر شوند.
**Excerpt:**
```
📋 acceptance_criteria کامل:
  - 3. منطق کنترلرها (callbackهای مسیرها) از backend/server.js به فایل‌های backend/controllers/ منتقل شده باشند.
```

### Step 12: انتقال منطق تجاری و سرویس‌ها از backend/server.js به فایل‌های services
**Status:** `done` (100%)
**Scope:** این مرحله شامل انتقال منطق تجاری و تعامل با APIهای خارجی (مانند توابع analyzeWithGemini، uploadToGeminiFileAPI) از backend/server.js به فایل‌های backend/services/ است. خارج از این مرحله: انتقال کنترلرها، تغییر در منطق برنامه، یا تغییر در frontend. نکته حیاتی: سرویس‌ها باید به فایل‌های مجزا مانند geminiService.js و fileService.js منتقل شوند.
**Excerpt:**
```
📋 acceptance_criteria کامل:
  - 4. منطق تجاری و تعامل با APIهای خارجی (مانند توابع analyzeWithGemini، uploadToGeminiFileAPI) به فایل‌های backend/services/ منتقل شده باشند.
```

### Step 13: انتقال ثابت‌ها و پرامپت‌های سیستمی از backend/server.js به فایل‌های models/config
**Status:** `done` (100%)
**Scope:** این مرحله شامل انتقال ثابت‌ها و پرامپت‌های سیستمی (مانند LEBANESE_CORRECTION_PROMPT، ANALYSIS_SYSTEM_PROMPT) از backend/server.js به فایل‌های backend/models/ یا backend/config/ است. خارج از این مرحله: انتقال سایر بخش‌ها، تغییر در منطق برنامه، یا تغییر در frontend. نکته حیاتی: ثابت‌ها باید به فایل‌های مجزا مانند prompts.js در backend/models/ یا config.js در backend/config/ منتقل شوند.
**Excerpt:**
```
📋 acceptance_criteria کامل:
  - 5. ثابت‌ها و پرامپت‌های سیستمی (مانند LEBANESE_CORRECTION_PROMPT، ANALYSIS_SYSTEM_PROMPT) به فایل‌های backend/models/ یا backend/config/ منتقل شده باشند.
```

### Step 14: انتقال میان‌افزارها از backend/server.js به فایل‌های middleware
**Status:** `done` (100%)
**Scope:** این مرحله شامل انتقال میان‌افزارها (مانند handleMulterError) از backend/server.js به فایل‌های backend/middleware/ است. خارج از این مرحله: انتقال سایر بخش‌ها، تغییر در منطق برنامه، یا تغییر در frontend. نکته حیاتی: میان‌افزارها باید به فایل‌های مجزا مانند uploadMiddleware.js در backend/middleware/ منتقل شوند.
**Excerpt:**
```
📋 acceptance_criteria کامل:
  - 6. میان‌افزارها (مانند handleMulterError) به فایل‌های backend/middleware/ منتقل شده باشند.
```

### Step 15: انتقال توابع کمکی از backend/server.js به فایل‌های utils
**Status:** `done` (100%)
**Scope:** این مرحله شامل انتقال توابع کمکی (مانند splitIntoChunks) از backend/server.js به فایل‌های backend/utils/ است. خارج از این مرحله: انتقال سایر بخش‌ها، تغییر در منطق برنامه، یا تغییر در frontend. نکته حیاتی: توابع کمکی باید به فایل‌های مجزا مانند helpers.js در backend/utils/ منتقل شوند.
**Excerpt:**
```
📋 acceptance_criteria کامل:
  - 7. توابع کمکی (مانند splitIntoChunks) به فایل‌های backend/utils/ منتقل شده باشند.
```

### Step 16: بازسازی backend/server.js به عنوان entry point سبک
**Status:** `done` (100%)
**Scope:** این مرحله شامل بازسازی فایل backend/server.js به عنوان یک entry point است که فقط شامل importها، تنظیمات middlewareهای global، و استفاده از routeها باشد. خارج از این مرحله: تغییر در منطق برنامه، تغییر در frontend، یا ایجاد قابلیت جدید. نکته حیاتی: طول فایل باید به طور قابل توجهی کاهش یابد و فقط شامل importها، تنظیمات middlewareهای global، و استفاده از routeها باشد.
**Excerpt:**
```
📋 acceptance_criteria کامل:
  - 8. فایل backend/server.js پس از refactor فقط شامل importها، تنظیمات middlewareهای global، و استفاده از routeها باشد و طول آن به طور قابل توجهی کاهش یافته باشد.
```

### Step 17: ایجاد پوشه‌های frontend بر اساس معماری کامپوننتی
**Status:** `pending` (0%)
**Scope:** این مرحله شامل ایجاد پوشه‌های frontend/src/components، frontend/src/hooks و frontend/src/utils است. خارج از این مرحله: انتقال فایل‌ها به این پوشه‌ها، تغییر در منطق برنامه، یا تغییر در backend. نکته حیاتی: فقط پوشه‌ها ایجاد می‌شوند و هیچ فایلی منتقل یا تغییر نمی‌کند.
**Excerpt:**
```
📋 acceptance_criteria کامل:
  - 1. پوشه‌های frontend/src/components، frontend/src/hooks و frontend/src/utils ایجاد شده باشند.
```

### Step 18: انتقال فایل App.jsx به frontend/src/App.jsx
**Status:** `done` (100%)
**Scope:** این مرحله شامل انتقال فایل frontend/src/App.jsx به frontend/src/App.jsx است. خارج از این مرحله: تغییر در محتوای فایل، تغییر در فایل‌های دیگر، یا تغییر در منطق برنامه. نکته حیاتی: محتوای فایل تغییری نمی‌کند و فقط مسیر آن تغییر می‌کند.
**Excerpt:**
```
📋 acceptance_criteria کامل:
  - 2. فایل frontend/src/App.jsx به frontend/src/App.jsx منتقل شده باشد.
```

### Step 19: به‌روزرسانی import در frontend/src/main.jsx
**Status:** `pending` (0%)
**Scope:** این مرحله شامل تغییر مسیر import در frontend/src/main.jsx از './App' به './components/App' است. خارج از این مرحله: تغییر در سایر بخش‌های main.jsx، تغییر در فایل‌های دیگر، یا تغییر در منطق برنامه. نکته حیاتی: فقط مسیر import تغییر می‌کند و محتوای فایل تغییری نمی‌کند.
**Excerpt:**
```
📋 acceptance_criteria کامل:
  - 3. import در frontend/src/main.jsx از './App' به './components/App' تغییر کرده باشد.
```

### Step 20: اجرای npm run build در frontend برای تایید build
**Status:** `pending` (0%)
**Scope:** این مرحله شامل اجرای دستور npm run build در پوشه frontend برای اطمینان از build بدون خطا و ایجاد فایل‌های build در frontend/dist است. خارج از این مرحله: تغییر در کد، تغییر در فایل‌های دیگر، یا تغییر در منطق برنامه. نکته حیاتی: build باید بدون خطا اجرا شود و فایل‌های build در frontend/dist ایجاد شوند.
**Excerpt:**
```
📋 acceptance_criteria کامل:
  - 4. دستور npm run build در frontend بدون خطا اجرا شود و فایل‌های build در frontend/dist ایجاد شوند.
```

### Step 21: اجرای npm run dev در ریشه پروژه برای تایید سرویس‌دهی
**Status:** `done` (100%)
**Scope:** این مرحله شامل اجرای دستور npm run dev در ریشه پروژه برای اطمینان از اجرای backend و سرویس‌دهی frontend بدون خطا است. خارج از این مرحله: تغییر در کد، تغییر در فایل‌های دیگر، یا تغییر در منطق برنامه. نکته حیاتی: dev server باید بدون خطا اجرا شود و frontend به درستی سرو شود.
**Excerpt:**
```
📋 acceptance_criteria کامل:
  - 5. دستور npm run dev در ریشه پروژه (که backend را اجرا می‌کند) بدون خطا اجرا شود و frontend به درستی سرو شود.
```

### Step 22: تایید عدم تغییر محتوای فایل‌ها (فقط مسیرها تغییر کرده‌اند)
**Status:** `pending` (0%)
**Scope:** این مرحله شامل بررسی و تایید این است که محتوای فایل‌های منتقل شده تغییری نکرده است و فقط مسیرها تغییر کرده‌اند. خارج از این مرحله: تغییر در کد، تغییر در فایل‌های دیگر، یا تغییر در منطق برنامه. نکته حیاتی: محتوای فایل‌های frontend/src/App.jsx و frontend/src/main.jsx باید با نسخه اصلی یکسان باشد.
**Excerpt:**
```
📋 acceptance_criteria کامل:
  - 6. محتوای فایل‌ها تغییری نکرده باشد (فقط مسیرها تغییر کرده باشند).
```

### Step 23: تایید عدم تغییر backend/server.js و backend/package.json
**Status:** `pending` (0%)
**Scope:** این مرحله شامل بررسی و تایید این است که فایل‌های backend/server.js و backend/package.json تغییری نکرده‌اند. خارج از این مرحله: تغییر در کد، تغییر در فایل‌های دیگر، یا تغییر در منطق برنامه. نکته حیاتی: این فایل‌ها باید بدون تغییر باقی بمانند.
**Excerpt:**
```
📋 acceptance_criteria کامل:
  - 7. backend/server.js و backend/package.json تغییری نکرده باشند.
```

### Step 24: اجرای تست‌های موجود برای تایید عدم رگرشن
**Status:** `pending` (0%)
**Scope:** این مرحله شامل اجرای تمام تست‌های موجود (npm run test / pytest) برای اطمینان از عدم شکستن تست‌ها پس از تغییرات است. خارج از این مرحله: تغییر در کد، تغییر در فایل‌های دیگر، یا تغییر در منطق برنامه. نکته حیاتی: تمام تست‌ها باید با موفقیت عبور کنند.
**Excerpt:**
```
📋 acceptance_criteria کامل:
  - اعمال تغییر بدون شکستن تست‌های موجود [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]
```

### Step 25: اجرای linter برای تایید عدم وجود warning
**Status:** `pending` (0%)
**Scope:** این مرحله شامل اجرای linter (مانند ESLint) برای اطمینان از عبور بدون warning است. خارج از این مرحله: تغییر در کد، تغییر در فایل‌های دیگر، یا تغییر در منطق برنامه. نکته حیاتی: linter باید بدون warning عبور کند.
**Excerpt:**
```
📋 acceptance_criteria کامل:
  - linter بدون warning عبور می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["no-unused-vars", "no-undef"], "files_hint": ["frontend/src/"]}]
```

### Step 26: اجرای type-check برای تایید موفقیت
**Status:** `pending` (0%)
**Scope:** این مرحله شامل اجرای type-check (مانند tsc --noEmit) برای اطمینان از موفقیت type-check است. خارج از این مرحله: تغییر در کد، تغییر در فایل‌های دیگر، یا تغییر در منطق برنامه. نکته حیاتی: type-check باید با موفقیت عبور کند.
**Excerpt:**
```
📋 acceptance_criteria کامل:
  - type-check موفق است [verify_method=static] [verify_plan={"grep_patterns": ["tsc", "type-check"], "files_hint": ["frontend/tsconfig.json"]}]
```

### Step 27: تغییر Inspector Bridge به استفاده از postMessage به جای WebSocket
**Status:** `pending` (0%)
**Scope:** این مرحله شامل تغییر Inspector Bridge در frontend/src/App.jsx (یا فایل مجزای آن) به استفاده از postMessage به جای WebSocket است. خارج از این مرحله: حذف WebSocket سرور از backend، تغییر در منطق برنامه، یا تغییر در فایل‌های دیگر. نکته حیاتی: Inspector Bridge باید فقط از postMessage استفاده کند و هیچ تلاشی برای اتصال WebSocket به آدرس خارجی صورت نگیرد.
**Excerpt:**
```
📋 acceptance_criteria کامل:
  - Inspector Bridge فقط از postMessage استفاده کند [verify_method=static] [verify_plan={"grep_patterns": ["postMessage"], "files_hint": ["frontend/src/App.jsx"]}]
```

### Step 28: تایید باقی ماندن WebSocket سرور برای Live Voice
**Status:** `done` (100%)
**Scope:** این مرحله شامل بررسی و تایید این است که WebSocket سرور در backend/server.js برای قابلیت Live Voice یا قابلیت دیگر باقی مانده است. خارج از این مرحله: تغییر در کد، تغییر در فایل‌های دیگر، یا تغییر در منطق برنامه. نکته حیاتی: WebSocket سرور باید با مسیر '/ws/live' باقی بماند.
**Excerpt:**
```
📋 acceptance_criteria کامل:
  - WebSocket سرور برای Live Voice یا قابلیت دیگر باقی بماند [verify_method=static] [verify_plan={"grep_patterns": ["/ws/live", "WebSocket.Server"], "files_hint": ["backend/server.js"]}]
```

### Step 29: تایید عدم وجود خطای WebSocket در کنسول
**Status:** `pending` (0%)
**Scope:** این مرحله شامل بررسی و تایید این است که هیچ خطای WebSocket در کنسول مرورگر ظاهر نمی‌شود. خارج از این مرحله: تغییر در کد، تغییر در فایل‌های دیگر، یا تغییر در منطق برنامه. نکته حیاتی: با استفاده از ui_interaction، باید اطمینان حاصل شود که هیچ خطای WebSocket در کنسول ظاهر نمی‌شود.
**Excerpt:**
```
📋 acceptance_criteria کامل:
  - هیچ خطای WebSocket در کنسول ظاهر نشود [verify_method=ui_interaction] [verify_plan={"base": "frontend", "ui_steps": [{"action": "navigate", "url": "/"}, {"action": "wait_for_load", "state": "networkidle"}, {"action": "assert_no_console_errors", "pattern": "WebSocket"}], "expected_ap"]
```
