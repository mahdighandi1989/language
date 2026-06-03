---
task_id: task_410fe171a0cb
title: پیکربندی Inspector Bridge و پیاده‌سازی ردیابی خطا
type: other
priority: critical
execution_priority: 1500
status: done
external_status: done
verification_status: done
watched_id: 6b04f8bd-b562-4fb9-9cd9-0c27458ced59
project: mahdighandi1989/language
created_at: '2026-06-01T19:22:56.705850+00:00'
updated_at: '2026-06-03T02:33:44.820527+00:00'
archived: true
archived_at: '2026-06-03T02:33:44.820525+00:00'
tags:
- consolidated
- post_verify_merge
---

# پیکربندی Inspector Bridge و پیاده‌سازی ردیابی خطا

## Raw Idea

🧬 این یک تسک تلفیقی است — از 5 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این تسک‌ها به طور خاص به ویژگی Inspector Bridge و نحوه تعامل آن با WebSocket می‌پردازند. از پیکربندی URL گرفته تا مدیریت خطاها و افزودن قابلیت‌های جدید مانند صدای زنده، همگی حول این ماژول خاص می‌چرخند.
🎯 theme: توسعه، پیکربندی و بهبود عملکرد Inspector Bridge و ارتباطات WebSocket آن، شامل مدیریت خطاها و قابلیت‌های جدید.
💎 estimated_difficulty: large

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 5
  id: 755e8cbd-c769-415e-8372-b625eb716a5c
  عنوان اصلی: Make Inspector Bridge WebSocket URL configurable
  اولویت اصلی: critical
  وضعیت verify قبلی: pending
  فایل‌های دخیل: frontend/src/App.jsx

📋 acceptance_criteria کامل:
  - Inspector Bridge WebSocket URL is configurable via environment variable [verify_method=static] [verify_plan={"grep_patterns": ["import.meta.env.VITE_WS_URL", "process.env.WS_URL", "WS_URL"], "files_hint": ["frontend/src/App.jsx"]}]
  - No hardcoded third-party URLs remain in the codebase [verify_method=static] [verify_plan={"grep_patterns": ["wss://ai-creator-backend-q677.onrender.com", "render.com"], "files_hint": ["frontend/src/App.jsx"]}]
  - Inspector Bridge either works with a valid WS_URL or is gracefully disabled [verify_method=ui_interaction] [verify_plan={"base": "frontend", "ui_steps": [{"action": "navigate", "url": "/"}, {"action": "wait_for_load", "state": "networkidle"}, {"action": "screenshot", "label": "initial_state"}, {"action": "assert_visibl]

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
WebSocket URL hardcoded to non-existent production endpoint in frontend/src/App.jsx

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/src/App.jsx:8-9` — `WS_URL` — Hardcoded URL that prevents connection
  ```jsx
  const WS_URL = 'wss://ai-creator-backend-q677.onrender.com/api/render/ws/bridge/gh_mahdighandi1989_language';
  ```
- `frontend/src/App.jsx:17-18` — `connectWS` — Guard clause that always returns early, disabling the feature
  ```jsx
  if (!WS_URL || WS_URL === 'wss://ai-creator-backend-q677.onrender.com/api/render/ws/bridge/gh_mahdighandi1989_language') return;
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
React 18 + Vite frontend, WebSocket connection to external service

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `frontend/index.html` (سطر 32) — Contains a duplicate Inspector Bridge script (lines 32-201) that also has the same hardcoded URL issue
- `backend/.env.example` (سطر 1) — Should document the expected environment variable for the WebSocket URL

## 🌐 نقشهٔ وابستگی‌ها
This affects the Inspector Bridge debugging feature which is duplicated in both index.html and App.jsx, both non-functional.

## 🔍 Context و وضعیت فعلی
In frontend/src/App.jsx line 8, the Inspector Bridge WebSocket URL is hardcoded to 'wss://ai-creator-backend-q677.onrender.com/api/render/ws/bridge/gh_mahdighandi1989_language'. This URL points to a third-party Render service that is not part of this project's infrastructure. The conditional check on line 17 (if (!WS_URL || WS_URL === 'wss://ai-creator-backend-q677.onrender.com/api/render/ws/bridge/gh_mahdighandi1989_language') return;) effectively disables the entire Inspector Bridge functionality because the condition is always true, preventing any WebSocket connection from being established. This means the Inspector Bridge feature is completely non-functional in production.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] Inspector Bridge WebSocket URL is configurable via environment variable
- [ ] No hardcoded third-party URLs remain in the codebase
- [ ] Inspector Bridge either works with a valid WS_URL or is gracefully disabled
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. Replace the hardcoded WebSocket URL with a configurable environment variable or remove the Inspector Bridge entirely if it's not needed. If the feature is required, add a VITE_INSPECTOR_WS_URL variable to frontend/.env and use it. Otherwise, remove the entire Inspector Bridge script block (lines 2-126) from App.jsx.

## 💡 نمونه‌های قبل/بعد
**Fix WS_URL to use env variable**

_قبل:_
```
const WS_URL = 'wss://ai-creator-backend-q677.onrender.com/api/render/ws/bridge/gh_mahdighandi1989_language';
```

_بعد:_
```
const WS_URL = import.meta.env.VITE_INSPECTOR_WS_URL || '';
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `grep -r 'ai-creator-backend-q677' frontend/`
- `grep -r 'VITE_INSPECTOR_WS_URL' frontend/`

## ⚠️ ریسک‌ها و موارد احتیاط
Low risk; the feature is currently broken, any fix is an improvement

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: bug
- اولویت: critical
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 2 از 5
  id: ba60df37-44e8-426e-8bf8-4a48cbedb11b
  عنوان اصلی: پوشش سناریوهای خطا در Inspector Bridge
  اولویت اصلی: critical
  وضعیت verify قبلی: pending
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - outcome target به‌صورت measurable بازنویسی شد [verify_method=static] [verify_plan={"grep_patterns": ["outcome target", "measurable", "error_rate"], "files_hint": ["README.md", "docs/"]}]
  - کد تغییر کرد تا outcome target محقق شود [verify_method=static] [verify_plan={"grep_patterns": ["window.addEventListener\\('error'", "window.addEventListener\\('unhandledrejection'", "firebase.*error", "error.*report", "postMessage.*error"], "files_hint": ["frontend/src/inspec]
  - test E2E که outcome را اندازه می‌گیرد عبور می‌کند [verify_method=backend_test] [verify_plan={"test_node": "tests/e2e/test_inspector_bridge.py::test_error_tracking", "timeout_seconds": 60}]
  - metric/log اضافه شد تا در production outcome rate قابل تشخیص باشد [verify_method=static] [verify_plan={"grep_patterns": ["metric", "log", "error_rate", "outcome_rate", "console\\.log.*error", "firebase.*analytics.*error"], "files_hint": ["frontend/src/inspectorBridge.js", "backend/app/monitoring.py"]}]

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
[Effectiveness] عدم پوشش سناریوهای خطا در Inspector Bridge

## 📍 موقعیت دقیق در پروژه
_(فایل‌های دقیق توسط مجری شناسایی شوند — هیچ موقعیت مشخصی استخراج نشد)_

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🔍 Context و وضعیت فعلی
## 🎯 هدف مطلوب (outcome target)
100% از رویدادهای خطای کاربر (مانند خطاهای شبکه، خطاهای Firebase، خطاهای رندر) باید توسط Inspector Bridge رهگیری و به والد iframe گزارش شوند تا بتوان میزان خطاهای واقعی کاربر را اندازه‌گیری کرد.

## 📊 وضعیت فعلی
Inspector Bridge رویدادهای کلیک، اسکرول و تایپ را رهگیری می‌کند، اما هیچ رهگیری صریحی برای خطاهای runtime (مانند catch نشدن خطاها در Promiseها یا خطاهای Firebase) وجود ندارد. outcome data نیز error_rate=0 را نشان می‌دهد که احتمالاً نادرست است.

## 🛠 اقدام پیشنهادی
یک Error Boundary در سطح App.jsx اضافه کنید و تمام خطاهای catch نشده را از طریق Inspector Bridge به والد iframe ارسال کنید. همچنین خطاهای Firebase را در catch بلاک‌ها رهگیری کنید.

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
- اولویت: critical
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  - بررسی وضعیت فعلی Inspector Bridge و Error Boundary در repo
  - ایجاد Error Boundary در سطح App.jsx برای رهگیری خطاهای catch نشده
  - رهگیری خطاهای Promise (unhandled rejection) و ارسال به Inspector Bridge
  - رهگیری خطاهای Firebase در catch بلاک‌ها و ارسال به Inspector Bridge
  - به‌روزرسانی Inspector Bridge برای پشتیبانی از رویدادهای خطا
  - به‌روزرسانی metric/logging برای ثبت error_rate واقعی

🔧 مراحل remaining که در super-task باید انجام شوند:
  - به‌روزرسانی والد iframe برای دریافت و پردازش رویدادهای خطا — والد iframe برای دریافت رویدادهای خطا به‌روزرسانی نشده است
  - نوشتن تست E2E برای رهگیری خطاهای runtime — تست E2E برای رهگیری خطاهای runtime نوشته نشده است
  - نوشتن تست E2E برای رهگیری خطاهای Promise — تست E2E برای رهگیری خطاهای Promise نوشته نشده است
  - نوشتن تست E2E برای رهگیری خطاهای Firebase — تست E2E برای رهگیری خطاهای Firebase نوشته نشده است

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 3 از 5
  id: 8cebc933-b60e-42f6-9f49-5dbb6e2c203a
  عنوان اصلی: Correct frontend WebSocket endpoint connection
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: backend/server.js, frontend/src/App.jsx

📋 acceptance_criteria کامل:
  - Inspector Bridge connects to backend's /ws/live endpoint [verify_method=static] [verify_plan={"grep_patterns": ["wss://ai-creator-backend", "/ws/live"], "files_hint": ["frontend/src/App.jsx"]}]
  - No hardcoded external URLs in frontend WebSocket code [verify_method=static] [verify_plan={"grep_patterns": ["wss://"], "files_hint": ["frontend/src/App.jsx"]}]
  - Backend WebSocket server receives connections from frontend [verify_method=static] [verify_plan={"grep_patterns": ["/ws/live"], "files_hint": ["backend/server.js"]}]

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
WebSocket endpoint mismatch: frontend connects to external URL instead of backend's /ws/live

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/src/App.jsx:8-9` — `WS_URL` — Hardcoded external WebSocket URL, should use backend's /ws/live
  ```jsx
  const WS_URL = 'wss://ai-creator-backend-q677.onrender.com/api/render/ws/bridge/gh_mahdighandi1989_language';
  ```
- `backend/server.js:45` — `wss` — Backend WebSocket server defined but not consumed by frontend
  ```jsx
  const wss = new WebSocketServer({ server, path: '/ws/live' });
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Node.js Express backend with 'ws' library, React frontend with Vite

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `frontend/src/App.jsx` (سطر 8) — Contains the Inspector Bridge WebSocket connection logic
- `backend/server.js` (سطر 45) — Defines the WebSocket server

## 🌐 نقشهٔ وابستگی‌ها
The Inspector Bridge script in App.jsx is the only WebSocket client; the backend's WebSocket server is orphaned.

## 🔍 Context و وضعیت فعلی
In frontend/src/App.jsx (line 8), the Inspector Bridge WebSocket connects to a hardcoded external URL 'wss://ai-creator-backend-q677.onrender.com/api/render/ws/bridge/gh_mahdighandi1989_language' instead of the backend's own WebSocket server at path '/ws/live' (backend/server.js line 45). Additionally, the backend's WebSocket server is defined but never used by any frontend feature; the frontend's live voice chat (LiveChatProvider) likely expects a different WebSocket endpoint. This causes the Inspector Bridge to fail silently (line 17: 'if (!WS_URL || WS_URL === ...) return;') and the backend's live voice WebSocket remains unused.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] Inspector Bridge connects to backend's /ws/live endpoint
- [ ] No hardcoded external URLs in frontend WebSocket code
- [ ] Backend WebSocket server receives connections from frontend
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. Update the Inspector Bridge WebSocket URL in frontend/src/App.jsx to point to the backend's WebSocket endpoint (e.g., 'ws://localhost:3001/ws/live' in dev, or a configurable environment variable). Also, ensure the backend's WebSocket server is properly integrated with the frontend's live voice chat feature, or remove the unused WebSocket server if not needed.

## 💡 نمونه‌های قبل/بعد
**Fix WS_URL to use backend endpoint**

_قبل:_
```
const WS_URL = 'wss://ai-creator-backend-q677.onrender.com/api/render/ws/bridge/gh_mahdighandi1989_language';
```

_بعد:_
```
const WS_URL = process.env.VITE_WS_URL || `ws://${window.location.hostname}:3001/ws/live`;
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `Check browser console for 'Inspector Bridge: WebSocket connected' message`
- `Verify backend logs show WebSocket connection established`

## ⚠️ ریسک‌ها و موارد احتیاط
Low risk; changing URL may break existing Inspector Bridge functionality if external service is required

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
تسک 4 از 5
  id: bca62f9c-0e65-448c-99e1-3ffcfb473a34
  عنوان اصلی: پیاده‌سازی هندلر WebSocket برای صدای زنده
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: backend/server.js

📋 acceptance_criteria کامل:
  - WebSocket server اتصالات را می‌پذیرد [verify_method=static] [verify_plan={"grep_patterns": ["wss.on('connection'", "wss.on(\"connection\"", "wss.on(`connection`", "wss.on('connection',", "wss.on(\"connection\","], "files_hint": ["backend/server.js"]}]
  - پیام‌های دریافتی (صوتی/متنی) پردازش می‌شوند [verify_method=static] [verify_plan={"grep_patterns": ["ws.on('message'", "ws.on(\"message\"", "ws.on(`message`", "ws.on('message',", "ws.on(\"message\","], "files_hint": ["backend/server.js"]}]
  - اتصال به‌درستی بسته می‌شود [verify_method=static] [verify_plan={"grep_patterns": ["ws.on('close'", "ws.on(\"close\"", "ws.on(`close`", "ws.on('close',", "ws.on(\"close\","], "files_hint": ["backend/server.js"]}]

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
WebSocket server در backend تعریف شده اما هیچ handler یا route برای live voice پیاده‌سازی نشده است

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/server.js:45-46` — `wss (WebSocketServer)` — WebSocket server بدون handler
  ```jsx
  const wss = new WebSocketServer({ server, path: '/ws/live' });
  
  app.use(cors());
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Express.js + ws library

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `frontend/src/App.jsx` (سطر 159) — frontend از WebSocket برای live voice استفاده می‌کند (خط 159-164)
- `backend/package.json` (سطر 1) — وابستگی ws در package.json تعریف شده

## 🌐 نقشهٔ وابستگی‌ها
این تغییر فقط backend/server.js را تحت تأثیر قرار می‌دهد.

## 🔍 Context و وضعیت فعلی
در backend/server.js خط 45، یک WebSocketServer ایجاد شده است (const wss = new WebSocketServer({ server, path: '/ws/live' });). اما در ادامه فایل (تا خط 400 که قابل مشاهده است)، هیچ event listener یا handler برای اتصالات WebSocket (مانند connection, message, close) وجود ندارد. این یعنی WebSocket server فقط ایجاد شده اما هیچ عملکردی ندارد. با توجه به اینکه frontend از live voice استفاده می‌کند (طبق FLOW_NODES در App.jsx)، این یک feature ناقص است.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] WebSocket server اتصالات را می‌پذیرد
- [ ] پیام‌های دریافتی (صوتی/متنی) پردازش می‌شوند
- [ ] اتصال به‌درستی بسته می‌شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. WebSocket handler را برای مدیریت اتصالات live voice پیاده‌سازی کنید. این شامل مدیریت اتصال، دریافت و ارسال پیام‌های صوتی، و قطع اتصال است. از کتابخانه ws برای مدیریت events استفاده کنید.

## 💡 نمونه‌های قبل/بعد
**اضافه کردن WebSocket handler**

_قبل:_
```
const wss = new WebSocketServer({ server, path: '/ws/live' });

app.use(cors());
```

_بعد:_
```
const wss = new WebSocketServer({ server, path: '/ws/live' });

wss.on('connection', (ws, req) => {
  console.log('WebSocket client connected');
  ws.on('message', (data) => {
    // Handle audio data or text messages
  });
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

app.use(cors());
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `node -e "const WebSocket = require('ws'); const ws = new WebSocket('ws://localhost:3001/ws/live'); ws.on('open', () => console.log('connected'));"`
- `grep -n 'wss.on' backend/server.js`

## ⚠️ ریسک‌ها و موارد احتیاط
نیاز به هماهنگی با frontend برای پروتکل پیام‌ها

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: feature_request
- اولویت: high
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 5 از 5
  id: 01a42a22-f6da-4ba2-90e5-2ac7d1e55eae
  عنوان اصلی: Configure frontend WebSocket bridge endpoint
  اولویت اصلی: medium
  وضعیت verify قبلی: pending
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - اعمال تغییر بدون شکستن تست‌های موجود [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]
  - linter بدون warning عبور می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["no-unused-vars", "no-console"], "files_hint": ["frontend/"]}]
  - type-check موفق است [verify_method=static] [verify_plan={"grep_patterns": ["TypeScript", "type-check"], "files_hint": ["frontend/"]}]

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
WebSocket bridge در frontend به یک endpoint خارجی متصل می‌شود که hardcoded شده است

## 📍 موقعیت دقیق در پروژه
_(فایل‌های دقیق توسط مجری شناسایی شوند — هیچ موقعیت مشخصی استخراج نشد)_

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🔍 Context و وضعیت فعلی
در فایل frontend/src/App.jsx، خط 8، یک WebSocket به آدرس 'wss://ai-creator-backend-q677.onrender.com/api/render/ws/bridge/gh_mahdighandi1989_language' متصل می‌شود. این آدرس به صورت hardcoded در کد frontend قرار دارد و به یک سرویس خارجی (احتمالاً یک inspector/debug

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
- نوع: security
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
- در commit message: `merged-from: 755e8cbd-c769-415e-8372-b625eb716a5c, ba60df37-44e8-426e-8bf8-4a48cbedb11b, 8cebc933-b60e-42f6-9f49-5dbb6e2c203a, bca62f9c-0e65-448c-99e1-3ffcfb473a34, 01a42a22-f6da-4ba2-90e5-2ac7d1e55eae`
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
📌 دلیل تلفیق (rationale توسط AI): این تسک‌ها به طور خاص به ویژگی Inspector Bridge و نحوه تعامل آن با WebSocket می‌پردازند. از پیکربندی URL گرفته تا مدیریت خطاها و افزودن قابلیت‌های جدید مانند صدای زنده، همگی حول این ماژول خاص می‌چرخند.
🎯 theme: توسعه، پیکربندی و بهبود عملکرد Inspector Bridge و ارتباطات WebSocket آن، شامل مدیریت خطاها و قابلیت‌های جدید.
💎 estimated_difficulty: large

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 5
  id: 755e8cbd-c769-415e-8372-b625eb716a5c
  عنوان اصلی: Make Inspector Bridge WebSocket URL configurable
  اولویت اصلی: critical
  وضعیت verify قبلی: pending
  فایل‌های دخیل: frontend/src/App.jsx

📋 acceptance_criteria کامل:
  - Inspector Bridge WebSocket URL is configurable via environment variable [verify_method=static] [verify_plan={"grep_patterns": ["import.meta.env.VITE_WS_URL", "process.env.WS_URL", "WS_URL"], "files_hint": ["frontend/src/App.jsx"]}]
  - No hardcoded third-party URLs remain in the codebase [verify_method=static] [verify_plan={"grep_patterns": ["wss://ai-creator-backend-q677.onrender.com", "render.com"], "files_hint": ["frontend/src/App.jsx"]}]
  - Inspector Bridge either works with a valid WS_URL or is gracefully disabled [verify_method=ui_interaction] [verify_plan={"base": "frontend", "ui_steps": [{"action": "navigate", "url": "/"}, {"action": "wait_for_load", "state": "networkidle"}, {"action": "screenshot", "label": "initial_state"}, {"action": "assert_visibl]

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
WebSocket URL hardcoded to non-existent production endpoint in frontend/src/App.jsx

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/src/App.jsx:8-9` — `WS_URL` — Hardcoded URL that prevents connection
  ```jsx
  const WS_URL = 'wss://ai-creator-backend-q677.onrender.com/api/render/ws/bridge/gh_mahdighandi1989_language';
  ```
- `frontend/src/App.jsx:17-18` — `connectWS` — Guard clause that always returns early, disabling the feature
  ```jsx
  if (!WS_URL || WS_URL === 'wss://ai-creator-backend-q677.onrender.com/api/render/ws/bridge/gh_mahdighandi1989_language') return;
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
React 18 + Vite frontend, WebSocket connection to external service

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `frontend/index.html` (سطر 32) — Contains a duplicate Inspector Bridge script (lines 32-201) that also has the same hardcoded URL issue
- `backend/.env.example` (سطر 1) — Should document the expected environment variable for the WebSocket URL

## 🌐 نقشهٔ وابستگی‌ها
This affects the Inspector Bridge debugging feature which is duplicated in both index.html and App.jsx, both non-functional.

## 🔍 Context و وضعیت فعلی
In frontend/src/App.jsx line 8, the Inspector Bridge WebSocket URL is hardcoded to 'wss://ai-creator-backend-q677.onrender.com/api/render/ws/bridge/gh_mahdighandi1989_language'. This URL points to a third-party Render service that is not part of this project's infrastructure. The conditional check on line 17 (if (!WS_URL || WS_URL === 'wss://ai-creator-backend-q677.onrender.com/api/render/ws/bridge/gh_mahdighandi1989_language') return;) effectively disables the entire Inspector Bridge functionality because the condition is always true, preventing any WebSocket connection from being established. This means the Inspector Bridge feature is completely non-functional in production.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] Inspector Bridge WebSocket URL is configurable via environment variable
- [ ] No hardcoded third-party URLs remain in the codebase
- [ ] Inspector Bridge either works with a valid WS_URL or is gracefully disabled
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. Replace the hardcoded WebSocket URL with a configurable environment variable or remove the Inspector Bridge entirely if it's not needed. If the feature is required, add a VITE_INSPECTOR_WS_URL variable to frontend/.env and use it. Otherwise, remove the entire Inspector Bridge script block (lines 2-126) from App.jsx.

## 💡 نمونه‌های قبل/بعد
**Fix WS_URL to use env variable**

_قبل:_
```
const WS_URL = 'wss://ai-creator-backend-q677.onrender.com/api/render/ws/bridge/gh_mahdighandi1989_language';
```

_بعد:_
```
const WS_URL = import.meta.env.VITE_INSPECTOR_WS_URL || '';
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `grep -r 'ai-creator-backend-q677' frontend/`
- `grep -r 'VITE_INSPECTOR_WS_URL' frontend/`

## ⚠️ ریسک‌ها و موارد احتیاط
Low risk; the feature is currently broken, any fix is an improvement

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: bug
- اولویت: critical
- تخمین زمان: small

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 2 از 5
  id: ba60df37-44e8-426e-8bf8-4a48cbedb11b
  عنوان اصلی: پوشش سناریوهای خطا در Inspector Bridge
  اولویت اصلی: critical
  وضعیت verify قبلی: pending
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - outcome target به‌صورت measurable بازنویسی شد [verify_method=static] [verify_plan={"grep_patterns": ["outcome target", "measurable", "error_rate"], "files_hint": ["README.md", "docs/"]}]
  - کد تغییر کرد تا outcome target محقق شود [verify_method=static] [verify_plan={"grep_patterns": ["window.addEventListener\\('error'", "window.addEventListener\\('unhandledrejection'", "firebase.*error", "error.*report", "postMessage.*error"], "files_hint": ["frontend/src/inspec]
  - test E2E که outcome را اندازه می‌گیرد عبور می‌کند [verify_method=backend_test] [verify_plan={"test_node": "tests/e2e/test_inspector_bridge.py::test_error_tracking", "timeout_seconds": 60}]
  - metric/log اضافه شد تا در production outcome rate قابل تشخیص باشد [verify_method=static] [verify_plan={"grep_patterns": ["metric", "log", "error_rate", "outcome_rate", "console\\.log.*error", "firebase.*analytics.*error"], "files_hint": ["frontend/src/inspectorBridge.js", "backend/app/monitoring.py"]}]

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
[Effectiveness] عدم پوشش سناریوهای خطا در Inspector Bridge

## 📍 موقعیت دقیق در پروژه
_(فایل‌های دقیق توسط مجری شناسایی شوند — هیچ موقعیت مشخصی استخراج نشد)_

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🔍 Context و وضعیت فعلی
## 🎯 هدف مطلوب (outcome target)
100% از رویدادهای خطای کاربر (مانند خطاهای شبکه، خطاهای Firebase، خطاهای رندر) باید توسط Inspector Bridge رهگیری و به والد iframe گزارش شوند تا بتوان میزان خطاهای واقعی کاربر را اندازه‌گیری کرد.

## 📊 وضعیت فعلی
Inspector Bridge رویدادهای کلیک، اسکرول و تایپ را رهگیری می‌کند، اما هیچ رهگیری صریحی برای خطاهای runtime (مانند catch نشدن خطاها در Promiseها یا خطاهای Firebase) وجود ندارد. outcome data نیز error_rate=0 را نشان می‌دهد که احتمالاً نادرست است.

## 🛠 اقدام پیشنهادی
یک Error Boundary در سطح App.jsx اضافه کنید و تمام خطاهای catch نشده را از طریق Inspector Bridge به والد iframe ارسال کنید. همچنین خطاهای Firebase را در catch بلاک‌ها رهگیری کنید.

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
- اولویت: critical
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  - بررسی وضعیت فعلی Inspector Bridge و Error Boundary در repo
  - ایجاد Error Boundary در سطح App.jsx برای رهگیری خطاهای catch نشده
  - رهگیری خطاهای Promise (unhandled rejection) و ارسال به Inspector Bridge
  - رهگیری خطاهای Firebase در catch بلاک‌ها و ارسال به Inspector Bridge
  - به‌روزرسانی Inspector Bridge برای پشتیبانی از رویدادهای خطا
  - به‌روزرسانی metric/logging برای ثبت error_rate واقعی

🔧 مراحل remaining که در super-task باید انجام شوند:
  - به‌روزرسانی والد iframe برای دریافت و پردازش رویدادهای خطا — والد iframe برای دریافت رویدادهای خطا به‌روزرسانی نشده است
  - نوشتن تست E2E برای رهگیری خطاهای runtime — تست E2E برای رهگیری خطاهای runtime نوشته نشده است
  - نوشتن تست E2E برای رهگیری خطاهای Promise — تست E2E برای رهگیری خطاهای Promise نوشته نشده است
  - نوشتن تست E2E برای رهگیری خطاهای Firebase — تست E2E برای رهگیری خطاهای Firebase نوشته نشده است

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 3 از 5
  id: 8cebc933-b60e-42f6-9f49-5dbb6e2c203a
  عنوان اصلی: Correct frontend WebSocket endpoint connection
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: backend/server.js, frontend/src/App.jsx

📋 acceptance_criteria کامل:
  - Inspector Bridge connects to backend's /ws/live endpoint [verify_method=static] [verify_plan={"grep_patterns": ["wss://ai-creator-backend", "/ws/live"], "files_hint": ["frontend/src/App.jsx"]}]
  - No hardcoded external URLs in frontend WebSocket code [verify_method=static] [verify_plan={"grep_patterns": ["wss://"], "files_hint": ["frontend/src/App.jsx"]}]
  - Backend WebSocket server receives connections from frontend [verify_method=static] [verify_plan={"grep_patterns": ["/ws/live"], "files_hint": ["backend/server.js"]}]

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
WebSocket endpoint mismatch: frontend connects to external URL instead of backend's /ws/live

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/src/App.jsx:8-9` — `WS_URL` — Hardcoded external WebSocket URL, should use backend's /ws/live
  ```jsx
  const WS_URL = 'wss://ai-creator-backend-q677.onrender.com/api/render/ws/bridge/gh_mahdighandi1989_language';
  ```
- `backend/server.js:45` — `wss` — Backend WebSocket server defined but not consumed by frontend
  ```jsx
  const wss = new WebSocketServer({ server, path: '/ws/live' });
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Node.js Express backend with 'ws' library, React frontend with Vite

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `frontend/src/App.jsx` (سطر 8) — Contains the Inspector Bridge WebSocket connection logic
- `backend/server.js` (سطر 45) — Defines the WebSocket server

## 🌐 نقشهٔ وابستگی‌ها
The Inspector Bridge script in App.jsx is the only WebSocket client; the backend's WebSocket server is orphaned.

## 🔍 Context و وضعیت فعلی
In frontend/src/App.jsx (line 8), the Inspector Bridge WebSocket connects to a hardcoded external URL 'wss://ai-creator-backend-q677.onrender.com/api/render/ws/bridge/gh_mahdighandi1989_language' instead of the backend's own WebSocket server at path '/ws/live' (backend/server.js line 45). Additionally, the backend's WebSocket server is defined but never used by any frontend feature; the frontend's live voice chat (LiveChatProvider) likely expects a different WebSocket endpoint. This causes the Inspector Bridge to fail silently (line 17: 'if (!WS_URL || WS_URL === ...) return;') and the backend's live voice WebSocket remains unused.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] Inspector Bridge connects to backend's /ws/live endpoint
- [ ] No hardcoded external URLs in frontend WebSocket code
- [ ] Backend WebSocket server receives connections from frontend
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. Update the Inspector Bridge WebSocket URL in frontend/src/App.jsx to point to the backend's WebSocket endpoint (e.g., 'ws://localhost:3001/ws/live' in dev, or a configurable environment variable). Also, ensure the backend's WebSocket server is properly integrated with the frontend's live voice chat feature, or remove the unused WebSocket server if not needed.

## 💡 نمونه‌های قبل/بعد
**Fix WS_URL to use backend endpoint**

_قبل:_
```
const WS_URL = 'wss://ai-creator-backend-q677.onrender.com/api/render/ws/bridge/gh_mahdighandi1989_language';
```

_بعد:_
```
const WS_URL = process.env.VITE_WS_URL || `ws://${window.location.hostname}:3001/ws/live`;
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `Check browser console for 'Inspector Bridge: WebSocket connected' message`
- `Verify backend logs show WebSocket connection established`

## ⚠️ ریسک‌ها و موارد احتیاط
Low risk; changing URL may break existing Inspector Bridge functionality if external service is required

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
تسک 4 از 5
  id: bca62f9c-0e65-448c-99e1-3ffcfb473a34
  عنوان اصلی: پیاده‌سازی هندلر WebSocket برای صدای زنده
  اولویت اصلی: high
  وضعیت verify قبلی: partial
  فایل‌های دخیل: backend/server.js

📋 acceptance_criteria کامل:
  - WebSocket server اتصالات را می‌پذیرد [verify_method=static] [verify_plan={"grep_patterns": ["wss.on('connection'", "wss.on(\"connection\"", "wss.on(`connection`", "wss.on('connection',", "wss.on(\"connection\","], "files_hint": ["backend/server.js"]}]
  - پیام‌های دریافتی (صوتی/متنی) پردازش می‌شوند [verify_method=static] [verify_plan={"grep_patterns": ["ws.on('message'", "ws.on(\"message\"", "ws.on(`message`", "ws.on('message',", "ws.on(\"message\","], "files_hint": ["backend/server.js"]}]
  - اتصال به‌درستی بسته می‌شود [verify_method=static] [verify_plan={"grep_patterns": ["ws.on('close'", "ws.on(\"close\"", "ws.on(`close`", "ws.on('close',", "ws.on(\"close\","], "files_hint": ["backend/server.js"]}]

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
WebSocket server در backend تعریف شده اما هیچ handler یا route برای live voice پیاده‌سازی نشده است

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `backend/server.js:45-46` — `wss (WebSocketServer)` — WebSocket server بدون handler
  ```jsx
  const wss = new WebSocketServer({ server, path: '/ws/live' });
  
  app.use(cors());
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Express.js + ws library

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `frontend/src/App.jsx` (سطر 159) — frontend از WebSocket برای live voice استفاده می‌کند (خط 159-164)
- `backend/package.json` (سطر 1) — وابستگی ws در package.json تعریف شده

## 🌐 نقشهٔ وابستگی‌ها
این تغییر فقط backend/server.js را تحت تأثیر قرار می‌دهد.

## 🔍 Context و وضعیت فعلی
در backend/server.js خط 45، یک WebSocketServer ایجاد شده است (const wss = new WebSocketServer({ server, path: '/ws/live' });). اما در ادامه فایل (تا خط 400 که قابل مشاهده است)، هیچ event listener یا handler برای اتصالات WebSocket (مانند connection, message, close) وجود ندارد. این یعنی WebSocket server فقط ایجاد شده اما هیچ عملکردی ندارد. با توجه به اینکه frontend از live voice استفاده می‌کند (طبق FLOW_NODES در App.jsx)، این یک feature ناقص است.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] WebSocket server اتصالات را می‌پذیرد
- [ ] پیام‌های دریافتی (صوتی/متنی) پردازش می‌شوند
- [ ] اتصال به‌درستی بسته می‌شود
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. WebSocket handler را برای مدیریت اتصالات live voice پیاده‌سازی کنید. این شامل مدیریت اتصال، دریافت و ارسال پیام‌های صوتی، و قطع اتصال است. از کتابخانه ws برای مدیریت events استفاده کنید.

## 💡 نمونه‌های قبل/بعد
**اضافه کردن WebSocket handler**

_قبل:_
```
const wss = new WebSocketServer({ server, path: '/ws/live' });

app.use(cors());
```

_بعد:_
```
const wss = new WebSocketServer({ server, path: '/ws/live' });

wss.on('connection', (ws, req) => {
  console.log('WebSocket client connected');
  ws.on('message', (data) => {
    // Handle audio data or text messages
  });
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

app.use(cors());
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `node -e "const WebSocket = require('ws'); const ws = new WebSocket('ws://localhost:3001/ws/live'); ws.on('open', () => console.log('connected'));"`
- `grep -n 'wss.on' backend/server.js`

## ⚠️ ریسک‌ها و موارد احتیاط
نیاز به هماهنگی با frontend برای پروتکل پیام‌ها

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: feature_request
- اولویت: high
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 5 از 5
  id: 01a42a22-f6da-4ba2-90e5-2ac7d1e55eae
  عنوان اصلی: Configure frontend WebSocket bridge endpoint
  اولویت اصلی: medium
  وضعیت verify قبلی: pending
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - اعمال تغییر بدون شکستن تست‌های موجود [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]
  - linter بدون warning عبور می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["no-unused-vars", "no-console"], "files_hint": ["frontend/"]}]
  - type-check موفق است [verify_method=static] [verify_plan={"grep_patterns": ["TypeScript", "type-check"], "files_hint": ["frontend/"]}]

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
WebSocket bridge در frontend به یک endpoint خارجی متصل می‌شود که hardcoded شده است

## 📍 موقعیت دقیق در پروژه
_(فایل‌های دقیق توسط مجری شناسایی شوند — هیچ موقعیت مشخصی استخراج نشد)_

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🔍 Context و وضعیت فعلی
در فایل frontend/src/App.jsx، خط 8، یک WebSocket به آدرس 'wss://ai-creator-backend-q677.onrender.com/api/render/ws/bridge/gh_mahdighandi1989_language' متصل می‌شود. این آدرس به صورت hardcoded در کد frontend قرار دارد و به یک سرویس خارجی (احتمالاً یک inspector/debug

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
- نوع: security
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
- در commit message: `merged-from: 755e8cbd-c769-415e-8372-b625eb716a5c, ba60df37-44e8-426e-8bf8-4a48cbedb11b, 8cebc933-b60e-42f6-9f49-5dbb6e2c203a, bca62f9c-0e65-448c-99e1-3ffcfb473a34, 01a42a22-f6da-4ba2-90e5-2ac7d1e55eae`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Acceptance Criteria

1. Inspector Bridge WebSocket URL is configurable via environment variable _(verify: static)_
2. No hardcoded third-party URLs remain in the codebase _(verify: static)_
3. Inspector Bridge either works with a valid WS_URL or is gracefully disabled _(verify: ui_interaction)_
4. outcome target به‌صورت measurable بازنویسی شد _(verify: static)_
5. کد تغییر کرد تا outcome target محقق شود _(verify: static)_
6. test E2E که outcome را اندازه می‌گیرد عبور می‌کند _(verify: backend_test)_
7. metric/log اضافه شد تا در production outcome rate قابل تشخیص باشد _(verify: static)_
8. Inspector Bridge connects to backend's /ws/live endpoint _(verify: static)_
9. No hardcoded external URLs in frontend WebSocket code _(verify: static)_
10. Backend WebSocket server receives connections from frontend _(verify: static)_
11. WebSocket server اتصالات را می‌پذیرد _(verify: static)_
12. پیام‌های دریافتی (صوتی/متنی) پردازش می‌شوند _(verify: static)_
13. اتصال به‌درستی بسته می‌شود _(verify: static)_
14. اعمال تغییر بدون شکستن تست‌های موجود _(verify: backend_test)_
15. linter بدون warning عبور می‌کند _(verify: static)_
16. type-check موفق است _(verify: static)_

## Task Steps

### Step 1: Replace hardcoded WebSocket URL with environment variable in App.jsx
**Status:** `done` (100%)
**Scope:** This step focuses on modifying frontend/src/App.jsx to replace the hardcoded WebSocket URL with a configurable environment variable. The change must ensure the Inspector Bridge WebSocket URL is configurable via environment variable (VITE_INSPECTOR_WS_URL or similar). The guard clause that disables the feature must be updated to check for the new variable. This step does NOT include removing the Inspector Bridge entirely, modifying backend files, or adding tests.
**Excerpt:**
```
In frontend/src/App.jsx line 8, the Inspector Bridge WebSocket URL is hardcoded to 'wss://ai-creator-backend-q677.onrender.com/api/render/ws/bridge/gh_mahdighandi1989_language'. This URL points to a third-party Render service that is not part of this project's infrastructure. The conditional check on line 17 (if (!WS_URL || WS_URL === 'wss://ai-creator-backend-q677.onrender.com/api/render/ws/bridge/gh_mahdighandi1989_language') return;) effectively disables the entire Inspector Bridge functionality because the condition is always true, preventing any WebSocket connection from being established.
```

### Step 2: Remove duplicate Inspector Bridge script from index.html
**Status:** `done` (100%)
**Scope:** This step focuses on removing the duplicate Inspector Bridge script block (lines 32-201) from frontend/index.html that also contains the same hardcoded URL issue. The script block should be removed entirely to eliminate redundancy and potential conflicts. This step does NOT modify App.jsx or any other files.
**Excerpt:**
```
frontend/index.html (سطر 32) — Contains a duplicate Inspector Bridge script (lines 32-201) that also has the same hardcoded URL issue
```

### Step 3: Document expected environment variable in backend/.env.example
**Status:** `done` (100%)
**Scope:** This step focuses on updating backend/.env.example to document the expected environment variable for the WebSocket URL (e.g., VITE_INSPECTOR_WS_URL or WS_URL). This ensures developers know what variable to set. This step does NOT modify any code files or add validation logic.
**Excerpt:**
```
backend/.env.example (سطر 1) — Should document the expected environment variable for the WebSocket URL
```

### Step 4: Rewrite outcome target as measurable for error coverage
**Status:** `done` (100%)
**Scope:** This step focuses on rewriting the outcome target for error coverage in Inspector Bridge to be measurable (e.g., '100% of runtime errors are tracked and reported to parent iframe'). The target should be documented in README.md or docs/. This step does NOT modify any code or add tests.
**Excerpt:**
```
outcome target به‌صورت measurable بازنویسی شد [verify_method=static] [verify_plan={"grep_patterns": ["outcome target", "measurable", "error_rate"], "files_hint": ["README.md", "docs/"]}]
```

### Step 5: Add Error Boundary in App.jsx for catching runtime errors
**Status:** `done` (100%)
**Scope:** This step focuses on adding an Error Boundary component in frontend/src/App.jsx to catch all uncaught runtime errors (including Promise rejections) and report them via Inspector Bridge to the parent iframe. The Error Boundary should wrap the main application component. This step does NOT modify backend files or add tests.
**Excerpt:**
```
یک Error Boundary در سطح App.jsx اضافه کنید و تمام خطاهای catch نشده را از طریق Inspector Bridge به والد iframe ارسال کنید.
```

### Step 6: Add global error event listeners for unhandled rejections
**Status:** `done` (100%)
**Scope:** This step focuses on adding window-level event listeners for 'error' and 'unhandledrejection' events in frontend/src/App.jsx or a separate module. These listeners should capture all uncaught JavaScript errors and Promise rejections and report them via Inspector Bridge. This step does NOT modify backend files or add tests.
**Excerpt:**
```
کد تغییر کرد تا outcome target محقق شود [verify_method=static] [verify_plan={"grep_patterns": ["window.addEventListener\\('error'", "window.addEventListener\\('unhandledrejection'", "firebase.*error", "error.*report", "postMessage.*error"], "files_hint": ["frontend/src/inspec]
```

### Step 7: Add Firebase error tracking in catch blocks
**Status:** `done` (100%)
**Scope:** This step focuses on adding error tracking in Firebase-related catch blocks throughout the frontend codebase. Errors from Firebase operations should be caught and reported via Inspector Bridge to the parent iframe. This step does NOT modify backend files or add tests.
**Excerpt:**
```
همچنین خطاهای Firebase را در catch بلاک‌ها رهگیری کنید.
```

### Step 8: Update Inspector Bridge to support error events
**Status:** `done` (100%)
**Scope:** This step focuses on updating the Inspector Bridge module (frontend/src/inspectorBridge.js) to support error events. The bridge should be able to receive error data from the Error Boundary, global listeners, and Firebase catch blocks, and forward them to the parent iframe. This step does NOT modify backend files or add tests.
**Excerpt:**
```
به‌روزرسانی Inspector Bridge برای پشتیبانی از رویدادهای خطا
```

### Step 9: Add metrics/logging for error_rate in production
**Status:** `done` (100%)
**Scope:** This step focuses on adding metrics or logging to track error_rate in production. This could include console.log statements, Firebase analytics events, or custom metrics. The logging should be added to frontend/src/inspectorBridge.js and/or backend/app/monitoring.py. This step does NOT add E2E tests.
**Excerpt:**
```
metric/log اضافه شد تا در production outcome rate قابل تشخیص باشد [verify_method=static] [verify_plan={"grep_patterns": ["metric", "log", "error_rate", "outcome_rate", "console\\.log.*error", "firebase.*analytics.*error"], "files_hint": ["frontend/src/inspectorBridge.js", "backend/app/monitoring.py"]}]
```

### Step 10: Update parent iframe to receive and process error events
**Status:** `done` (100%)
**Scope:** This step focuses on updating the parent iframe (the page that embeds the Inspector Bridge) to receive and process error events sent via postMessage. The parent iframe should handle error events and potentially display or log them. This step does NOT modify the frontend application code or add tests.
**Excerpt:**
```
به‌روزرسانی والد iframe برای دریافت و پردازش رویدادهای خطا — والد iframe برای دریافت رویدادهای خطا به‌روزرسانی نشده است
```

### Step 11: Write E2E test for runtime error tracking
**Status:** `done` (100%)
**Scope:** This step focuses on writing an end-to-end test in tests/e2e/test_inspector_bridge.py that verifies runtime errors are tracked and reported. The test should simulate a runtime error and verify it is captured by the Inspector Bridge and reported to the parent iframe. This step does NOT modify application code.
— [merged] This step focuses on writing an end-to-end test in tests/e2e/test_inspector_bridge.py that verifies unhandled Promise rejections are tracked and reported. The test should simulate an unhandled Promise rejection and verify it is captured by the Inspector Bridge. This step does NOT modify application code.
— [merged] This step focuses on writing an end-to-end test in tests/e2e/test_inspector_bridge.py that verifies Firebase operation errors are tracked and reported. The test should simulate a Firebase error and verify it is captured by the Inspector Bridge. This step does NOT modify application code.
**Excerpt:**
```
نوشتن تست E2E برای رهگیری خطاهای runtime — تست E2E برای رهگیری خطاهای runtime نوشته نشده است
```

### Step 12: Update Inspector Bridge WebSocket URL to point to backend /ws/live
**Status:** `done` (100%)
**Scope:** This step focuses on updating the Inspector Bridge WebSocket URL in frontend/src/App.jsx to point to the backend's /ws/live endpoint. The URL should use a configurable environment variable with a fallback to the local development URL (e.g., ws://localhost:3001/ws/live). This step does NOT modify backend files or add tests.
**Excerpt:**
```
Inspector Bridge connects to backend's /ws/live endpoint [verify_method=static] [verify_plan={"grep_patterns": ["wss://ai-creator-backend", "/ws/live"], "files_hint": ["frontend/src/App.jsx"]}]
```

### Step 13: Remove all hardcoded external URLs from frontend WebSocket code
**Status:** `done` (100%)
**Scope:** This step focuses on removing all hardcoded external URLs (specifically 'wss://ai-creator-backend-q677.onrender.com') from frontend WebSocket code. This includes App.jsx and any other files that may contain similar hardcoded URLs. This step does NOT modify backend files or add tests.
**Excerpt:**
```
No hardcoded external URLs in frontend WebSocket code [verify_method=static] [verify_plan={"grep_patterns": ["wss://"], "files_hint": ["frontend/src/App.jsx"]}]
```

### Step 14: Verify backend WebSocket server receives connections from frontend
**Status:** `done` (100%)
**Scope:** This step focuses on verifying that the backend WebSocket server at /ws/live receives connections from the frontend. This may involve adding logging to backend/server.js to confirm connections are established. This step does NOT modify frontend files or add tests.
**Excerpt:**
```
Backend WebSocket server receives connections from frontend [verify_method=static] [verify_plan={"grep_patterns": ["/ws/live"], "files_hint": ["backend/server.js"]}]
```

### Step 15: Add WebSocket connection handler for live voice
**Status:** `done` (100%)
**Scope:** This step focuses on adding a 'connection' event handler to the WebSocket server in backend/server.js. The handler should log new connections and set up listeners for messages and close events. This step does NOT add message processing logic or close handlers.
**Excerpt:**
```
WebSocket server اتصالات را می‌پذیرد [verify_method=static] [verify_plan={"grep_patterns": ["wss.on('connection'", "wss.on(\"connection\"", "wss.on(`connection`", "wss.on('connection',", "wss.on(\"connection\","], "files_hint": ["backend/server.js"]}]
```

### Step 16: Add WebSocket message handler for audio/text processing
**Status:** `done` (100%)
**Scope:** This step focuses on adding a 'message' event handler to the WebSocket server in backend/server.js. The handler should process incoming audio or text messages from the frontend. This step does NOT add connection or close handlers.
**Excerpt:**
```
پیام‌های دریافتی (صوتی/متنی) پردازش می‌شوند [verify_method=static] [verify_plan={"grep_patterns": ["ws.on('message'", "ws.on(\"message\"", "ws.on(`message`", "ws.on('message',", "ws.on(\"message\","], "files_hint": ["backend/server.js"]}]
```

### Step 17: Add WebSocket close handler for clean disconnection
**Status:** `done` (100%)
**Scope:** This step focuses on adding a 'close' event handler to the WebSocket server in backend/server.js. The handler should log disconnections and clean up resources. This step does NOT add connection or message handlers.
**Excerpt:**
```
اتصال به‌درستی بسته می‌شود [verify_method=static] [verify_plan={"grep_patterns": ["ws.on('close'", "ws.on(\"close\"", "ws.on(`close`", "ws.on('close',", "ws.on(\"close\","], "files_hint": ["backend/server.js"]}]
```

### Step 18: Apply changes without breaking existing tests
**Status:** `done` (100%)
**Scope:** This step focuses on ensuring all changes made in previous steps do not break existing tests. Run the full test suite (npm run test / pytest) and fix any regressions. This step does NOT add new tests or modify application logic.
**Excerpt:**
```
اعمال تغییر بدون شکستن تست‌های موجود [verify_method=backend_test] [verify_plan={"test_node": "tests/", "timeout_seconds": 120}]
```

### Step 19: Ensure linter passes without warnings
**Status:** `done` (100%)
**Scope:** This step focuses on ensuring the linter passes without warnings after all changes. Run the linter (e.g., ESLint) and fix any warnings related to unused variables or console.log statements. This step does NOT modify application logic or add tests.
**Excerpt:**
```
linter بدون warning عبور می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["no-unused-vars", "no-console"], "files_hint": ["frontend/"]}]
```

### Step 20: Ensure type-check passes successfully
**Status:** `done` (100%)
**Scope:** This step focuses on ensuring type-check passes successfully after all changes. Run the type checker (e.g., tsc --noEmit for TypeScript or mypy for Python) and fix any type errors. This step does NOT modify application logic or add tests.
**Excerpt:**
```
type-check موفق است [verify_method=static] [verify_plan={"grep_patterns": ["TypeScript", "type-check"], "files_hint": ["frontend/"]}]
```

### Step 21: Verify no hardcoded external URLs remain in frontend WebSocket code (Task 5)
**Status:** `done` (100%)
**Scope:** This step focuses on verifying that no hardcoded external URLs remain in the frontend WebSocket code, specifically in frontend/src/App.jsx. This is a verification step that should be performed after all changes are made. This step does NOT modify any code.
**Excerpt:**
```
WebSocket bridge در frontend به یک endpoint خارجی متصل می‌شود که hardcoded شده است
```

### Step 22: Verify linter passes without warnings (Task 5)
**Status:** `done` (100%)
**Scope:** This step focuses on verifying the linter passes without warnings after all changes. This is a verification step that should be performed after all changes are made. This step does NOT modify any code.
**Excerpt:**
```
linter بدون warning عبور می‌کند [verify_method=static] [verify_plan={"grep_patterns": ["no-unused-vars", "no-console"], "files_hint": ["frontend/"]}]
```

### Step 23: Verify type-check passes successfully (Task 5)
**Status:** `done` (100%)
**Scope:** This step focuses on verifying type-check passes successfully after all changes. This is a verification step that should be performed after all changes are made. This step does NOT modify any code.
— [merged] This step focuses on verifying type-check passes successfully after all changes. This is a duplicate verification step from Task 5. This step does NOT modify any code.
**Excerpt:**
```
type-check موفق است [verify_method=static] [verify_plan={"grep_patterns": ["TypeScript", "type-check"], "files_hint": ["frontend/"]}]
```

### Step 24: Verify no tests fail after all changes (Task 5)
**Status:** `done` (100%)
**Scope:** This step focuses on verifying no tests fail after all changes. This is a verification step that should be performed after all changes are made. This step does NOT modify any code.
**Excerpt:**
```
هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
```

### Step 25: Verify Inspector Bridge WebSocket URL is configurable via environment variable
**Status:** `done` (100%)
**Scope:** This step focuses on verifying that the Inspector Bridge WebSocket URL is configurable via environment variable. This is a verification step that should be performed after all changes are made. This step does NOT modify any code.
**Excerpt:**
```
Inspector Bridge WebSocket URL is configurable via environment variable [verify_method=static] [verify_plan={"grep_patterns": ["import.meta.env.VITE_WS_URL", "process.env.WS_URL", "WS_URL"], "files_hint": ["frontend/src/App.jsx"]}]
```

### Step 26: Verify no hardcoded third-party URLs remain in the codebase
**Status:** `done` (100%)
**Scope:** This step focuses on verifying that no hardcoded third-party URLs remain in the codebase. This is a verification step that should be performed after all changes are made. This step does NOT modify any code.
**Excerpt:**
```
No hardcoded third-party URLs remain in the codebase [verify_method=static] [verify_plan={"grep_patterns": ["wss://ai-creator-backend-q677.onrender.com", "render.com"], "files_hint": ["frontend/src/App.jsx"]}]
```

### Step 27: Verify Inspector Bridge works with valid WS_URL or is gracefully disabled
**Status:** `done` (100%)
**Scope:** This step focuses on verifying that the Inspector Bridge either works with a valid WS_URL or is gracefully disabled. This is a verification step that should be performed after all changes are made. This step does NOT modify any code.
**Excerpt:**
```
Inspector Bridge either works with a valid WS_URL or is gracefully disabled [verify_method=ui_interaction] [verify_plan={"base": "frontend", "ui_steps": [{"action": "navigate", "url": "/"}, {"action": "wait_for_load", "state": "networkidle"}, {"action": "screenshot", "label": "initial_state"}, {"action": "assert_visibl]
```

### Step 28: Verify no tests fail after all changes (final check)
**Status:** `done` (100%)
**Scope:** This step focuses on verifying no tests fail after all changes. This is a final verification step that should be performed after all changes are made. This step does NOT modify any code.
**Excerpt:**
```
هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
```
