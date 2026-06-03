---
task_id: task_a0da99345fb0
title: رفع anti-pattern در سیستم ردیابی Inspector Bridge
type: other
priority: high
execution_priority: 2050
status: pending
external_status: claimed
verification_status: pending
watched_id: 6b04f8bd-b562-4fb9-9cd9-0c27458ced59
project: mahdighandi1989/language
created_at: '2026-06-03T16:58:13.819081+00:00'
updated_at: '2026-06-03T23:50:38.326166+00:00'
tags:
- consolidated
- post_verify_merge
---

# رفع anti-pattern در سیستم ردیابی Inspector Bridge

## Raw Idea

🧬 این یک تسک تلفیقی است — از 2 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): هر دو تسک به طور مستقیم به 'Inspector Bridge' مربوط می‌شوند. تسک اول (e4229cce-5083-4ed9-b7d7-4275cf77ec8e) در مورد جایگزینی مکانیزم ردیابی قدیمی است، در حالی که تسک دوم (92c9dd21-d951-426b-9f25-709bbff53ef8) ممیزی کامیت‌های مربوط به آن را شامل می‌شود. اشتراک فایل‌های 'frontend/index.html' نیز این ارتباط را تقویت می‌کند. این یک پیوند موضوعی و عملیاتی قوی است.
🎯 theme: مدیریت و ممیزی سیستم ردیابی Inspector Bridge
💎 estimated_difficulty: large

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 2
  id: e4229cce-5083-4ed9-b7d7-4275cf77ec8e
  عنوان اصلی: Replace legacy Inspector Bridge tracking with metric sink
  اولویت اصلی: high
  وضعیت verify قبلی: applied_externally_pending_verify
  فایل‌های دخیل: frontend/index.html

📋 acceptance_criteria کامل:
  - ریشه anti-pattern تشخیص داده شد [verify_method=static] [verify_plan={"grep_patterns": ["isInIframe\\s*=\\s*false", "window\\.parent\\.postMessage"], "files_hint": ["frontend/index.html"]}]
  - یا کد اصلاح شد، یا کامنت توجیهی اضافه شد [verify_method=static] [verify_plan={"grep_patterns": ["isInIframe\\s*=\\s*false", "//.*(?:not in iframe|no iframe|skip)"], "files_hint": ["frontend/index.html"]}]
  - تست edge case نوشته شد [verify_method=backend_test] [verify_plan={"test_node": "tests/test_oversight.py::test_no_iframe_skip", "timeout_seconds": 30}]

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
Anti-pattern: Over/under-engineering

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/index.html:30`

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🔍 Context و وضعیت فعلی
اسکریپت Inspector Bridge با وجود اینکه در iframe نیست (isInIframe=false)، همچنان به ارسال پیام به window.parent ادامه می‌دهد. این باعث ایجاد خطاهای بی‌فایده و مصرف منابع می‌شود. بهتر است کل اسکریپت در صورت عدم وجود iframe غیرفعال شود.

📁 file: frontend/index.html (line 30)

🎯 پیشنهاد: این الگو معمولاً منطق سیستم را در شرایط لبه می‌شکند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] ریشه anti-pattern تشخیص داده شد
- [ ] یا کد اصلاح شد، یا کامنت توجیهی اضافه شد
- [ ] تست edge case نوشته شد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. بازنگری منطق در این نقطه و اضافه‌کردن guard/comment مناسب.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## ⚠️ ریسک‌ها و موارد احتیاط
پیش از merge، تست‌های موجود اجرا شوند تا رگرشن ایجاد نشود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: bug_fix
- اولویت: high
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 2 از 2
  id: 92c9dd21-d951-426b-9f25-709bbff53ef8
  عنوان اصلی: ممیزی commit‌های Inspector Bridge Script
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: backend/server.js, frontend/index.html

📋 acceptance_criteria کامل:
  - 1. لیست کامل commit‌های دارای پیام 'Add Inspector Bridge Script' استخراج شده باشد (حداقل 5 commit). [verify_method=static] [verify_plan={"grep_patterns": ["Add Inspector Bridge Script"], "files_hint": ["git log output"]}]
  - 2. برای هر commit، diff کامل تغییرات در یک فایل جداگانه ذخیره شده باشد. [verify_method=static] [verify_plan={"grep_patterns": [], "files_hint": ["git diff output for each commit"]}]
  - 3. گزارش تحلیلی شامل تعداد commit‌های تکراری، محتوای تغییرات، و ارزیابی خطر تهیه شده باشد. [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی"}]
  - 4. هیچ تغییری در کد پروژه ایجاد نشده باشد (صرفاً تشخیصی). [verify_method=static] [verify_plan={"grep_patterns": [], "files_hint": ["no changes to project code"]}]
  - 5. مستندات یافته‌ها در فایل docs/inspector-bridge-audit.md ذخیره شده باشد. [verify_method=static] [verify_plan={"grep_patterns": [], "files_hint": ["docs/inspector-bridge-audit.md"]}]
  - 6. پیشنهاد برای رعایت conventional commits در آینده ارائه شده باشد. [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی"}]
  - 1. اسکریپت Inspector Bridge در frontend/index.html (خطوط 31-201) به طور کامل شناسایی و مستند شده باشد. [verify_method=static] [verify_plan={"grep_patterns": ["Inspector Bridge", "sendToInspector"], "files_hint": ["frontend/index.html"]}]
  - 2. تمام event listeners (click, scroll, input, focus) و تابع sendToInspector بررسی شده باشند. [verify_method=static] [verify_plan={"grep_patterns": ["addEventListener", "click", "scroll", "input", "focus", "sendToInspector"], "files_hint": ["frontend/index.html"]}]
  - 3. مشخص شود که آیا این اسکریپت به API خارجی متصل است یا خیر (در حال حاضر فقط به window.parent.postMessage ارسال می‌کند). [verify_method=static] [verify_plan={"grep_patterns": ["postMessage", "window.parent.postMessage"], "files_hint": ["frontend/index.html"]}]
  - 4. گزارش نهایی شامل الگوهای خطرناک (ارسال داده به سرورهای خارجی، لاگ کردن اطلاعات حساس، تغییر رفتار سیستم) تهیه شود. [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی"}]
  - 5. توصیه‌های امنیتی برای حذف یا غیرفعال کردن اسکریپت در production ارائه شود. [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی"}]
  - ۱. اجرای git log --oneline --format='%h %s' و استخراج حداقل ۱۰۰ commit آخر از تاریخچه پروژه. [verify_method=static] [verify_plan={"grep_patterns": [], "files_hint": ["git log output"]}]
  - ۲. اسکن خودکار پیام‌های commit با regex: ^(feat|fix|chore|docs|refactor|test|style|perf|ci|build|revert)(\(.+\))?: .+ [verify_method=static] [verify_plan={"grep_patterns": ["^(feat|fix|chore|docs|refactor|test|style|perf|ci|build|revert)(\\(.+\\))?: .+"], "files_hint": ["git log output"]}]
  - ۳. شناسایی و لیست کردن تمام commit‌هایی که با الگوی conventional commits مطابقت ندارند، به ویژه commit‌های با پیام 'Add Inspector Bridge Script'. [verify_method=static] [verify_plan={"grep_patterns": ["Add Inspector Bridge Script"], "files_hint": ["git log output"]}]
  - ۴. ارائه گزارش شامل: تعداد کل commit‌های بررسی‌شده، تعداد commit‌های معتبر، تعداد commit‌های نامعتبر، و لیست commit‌های نامعتبر با هش و پیام کامل. [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی"}]
  - ۵. تأیید اینکه commit‌های تکراری 'Add Inspector Bridge Script' (b9494e5, 4b6a071, e374c41, f90cee1, d214ff5, 65ae85c) در لیست نقض‌کنندگان قرار دارند. [verify_method=static] [verify_plan={"grep_patterns": ["b9494e5", "4b6a071", "e374c41", "f90cee1", "d214ff5", "65ae85c"], "files_hint": ["git log output"]}]
  - ۶. ارائه پیشنهاد برای بهبود فرآیند commit در آینده (مانند استفاده از ابزار commitlint یا husky). [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی"}]
  - تأیید شود که اسکریپت Inspector Bridge در frontend/index.html (خطوط 31-201) در production غیرفعال است یا با شرط environment variable (مانند process.env.NODE_ENV !== 'production') محافظت می‌شود. [verify_method=static] [verify_plan={"grep_patterns": ["process.env.NODE_ENV", "NODE_ENV !== 'production'"], "files_hint": ["frontend/index.html"]}]
  - تأیید شود که WebSocket server در backend/server.js خط 45 (مسیر '/ws/live') در production غیرفعال است یا فقط برای اتصالات مجاز باز است. [verify_method=static] [verify_plan={"grep_patterns": ["/ws/live", "WebSocket"], "files_hint": ["backend/server.js"]}]
  - تأیید شود که هیچ console.log در frontend/index.html (خطوط 34, 38, 45, 46, 67, 193, 198, 199) در production وجود ندارد. [verify_method=static] [verify_plan={"grep_patterns": ["console.log"], "files_hint": ["frontend/index.html"]}]
  - تأیید شود که GEMINI_API_KEY در backend/server.js خطوط 183, 188, 224, 234 در responseها برگردانده نمی‌شود. [verify_method=static] [verify_plan={"grep_patterns": ["backend", "server", "تأیید", "خطوط", "برگردانده"], "files_hint": []}]
  - تأیید شود که هیچ داده‌ای به دامنه‌های خارجی از طریق window.parent.postMessage یا fetch در frontend/index.html ارسال نمی‌شود. [verify_method=static] [verify_plan={"grep_patterns": ["window", "parent", "fetch", "frontend", "index", "تأیید", "داده", "دامنه"], "files_hint": []}]
  - تأیید شود که commit‌های با پیام 'Add Inspector Bridge Script' (b9494e5, 4b6a071, e374c41, f90cee1, d214ff5) بررسی شده و کد اضافی در production وجود ندارد. [verify_method=static] [verify_plan={"grep_patterns": ["Inspector", "Bridge", "Script", "commit", "b9494e5", "e374c41", "f90cee1", "d214ff5"], "files_hint": []}]
  - 1. یک فایل گزارش جامع (مثلاً docs/audit-report.md) در ریشه پروژه ایجاد شود که شامل لیست commit‌های مشکوک، تحلیل محتوای فایل‌ها، موارد نقض conventional commits، و وجود debugging/monitoring code باشد. [verify_method=static] [verify_plan={"grep_patterns": ["audit", "report", "commit", "conventional", "commits", "debugging", "monitoring", "فایل"], "files_hint": []}]
  - 2. گزارش شامل حداقل 3 توصیه عملی (revert, squash, حذف کد) با جزئیات اجرایی باشد. [verify_method=static] [verify_plan={"grep_patterns": ["revert", "squash", "گزارش", "شامل", "حداقل", "توصیه", "عملی", "جزئیات"], "files_hint": []}]
  - 3. پس از تصمیم تیم، اقدام مربوطه (مثلاً حذف اسکریپت از frontend/index.html) در یک کامیت جدید با پیام مناسب انجام شود. [verify_method=static] [verify_plan={"grep_patterns": ["frontend", "index", "تصمیم", "تیم،", "اقدام", "مربوطه", "مثلاً", "اسکریپت"], "files_hint": []}]
  - 4. پس از اجرای اقدام، اسکریپت Inspector Bridge دیگر در فایل frontend/index.html وجود نداشته باشد و برای کاربران ارسال نشود. [verify_method=static] [verify_plan={"grep_patterns": ["Inspector", "Bridge", "frontend", "index", "اجرای", "اقدام،", "اسکریپت", "دیگر"], "files_hint": []}]
  - 5. تاریخچه کامیت‌ها تمیز شود (مثلاً با squash کردن کامیت‌های مربوطه) تا پیام‌های تکراری و غیراستاندارد حذف شوند. [verify_method=static] [verify_plan={"grep_patterns": ["squash", "تاریخچه", "کامیت", "تمیز", "مثلاً", "کردن", "مربوطه", "پیام"], "files_hint": []}]

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
تمام commit های اخیر دارای پیام یکسان 'Add Inspector Bridge Script' هستند که نشان‌دهنده عدم رعایت conventional commits و احتمال وجود debugging code یا monitoring scripts مشکوک در production است. این pattern غیرطبیعی است.
```

## 📋 چک‌لیست مراحل (5 مرحله)

این تسک به مراحل کوچک‌تر تقسیم شده. **در هر verify خودکار، وضعیت هر مرحله به‌صورت `[ ]` (انجام نشده)، `[~]` (ناقص)، یا `[x]` (انجام شده) به‌روز می‌شود.**
وقتی تمام مراحل `[x]` شدند، تسک به‌طور خودکار به «انجام شده» منتقل می‌شود.

- [~] **مرحله 1: بررسی و تحلیل تمام commit‌های اخیر با پیام یکسان** — این مرحله شامل بررسی کامل تاریخچه commit‌های اخیر (مثلاً ۳۰ روز گذشته یا ۵۰ commit آخر) در مخزن فعلی است. باید تمام commit‌هایی که پیام 'Add Inspector Bridge Script' دارند شناسایی شوند. این مرحله شامل تحلیل محتوای تغییرات (diff) هر commit برای یافتن debugging code، monitoring scripts، یا هر کد مشکوک
- [~] **مرحله 2: بررسی محتوای فایل‌های تغییر یافته در commit‌های مشکوک** — این مرحله شامل بررسی دقیق محتوای فایل‌هایی است که در commit‌های با پیام 'Add Inspector Bridge Script' تغییر کرده‌اند. باید مشخص شود که آیا این فایل‌ها حاوی اسکریپت‌های مانیتورینگ، debugging code، یا دسترسی به API‌های خارجی هستند. خارج از این مرحله: اجرای اسکریپت‌ها یا تغییر آنها. نکته حیاتی: تمرکز ب
- [x] **مرحله 3: بررسی وجود conventional commits در تاریخچه و شناسایی موارد نقض** — این مرحله شامل بررسی تمام commit‌های اخیر (مثلاً ۱۰۰ commit آخر) برای اطمینان از رعایت استاندارد conventional commits (مانند feat:, fix:, chore:, docs:, refactor:, test:). باید commit‌هایی که از این استاندارد پیروی نمی‌کنند شناسایی و لیست شوند. خارج از این مرحله: اصلاح commit‌ها یا بازنویسی تاریخچه.
- [~] **مرحله 4: بررسی احتمال وجود debugging code یا monitoring scripts در production** — این مرحله شامل تحلیل عمیق‌تر کد موجود در commit‌های مشکوک برای یافتن الگوهای رایج debugging code (مانند console.log, print, var_dump, debugger) یا monitoring scripts (مانند ارسال داده به endpoint خارجی، tracking pixels, analytics بدون consent). خارج از این مرحله: حذف کد یا تغییر آن. نکته حیاتی: باید
- [~] **مرحله 5: ارائه گزارش نهایی و توصیه‌های اقدام** — این مرحله شامل جمع‌بندی تمام یافته‌های مراحل قبل در یک گزارش جامع است. گزارش باید شامل: لیست commit‌های مشکوک، تحلیل محتوای فایل‌ها، موارد نقض conventional commits، و وجود debugging/monitoring code. همچنین باید توصیه‌های عملی برای اقدامات بعدی ارائه دهد (مانند revert commit‌ها، squash کردن، بازنویسی

---

# 🔹 مرحله 1: بررسی و تحلیل تمام commit‌های اخیر با پیام یکسان

**Scope:** این مرحله شامل بررسی کامل تاریخچه commit‌های اخیر (مثلاً ۳۰ روز گذشته یا ۵۰ commit آخر) در مخزن فعلی است. باید تمام commit‌هایی که پیام 'Add Inspector Bridge Script' دارند شناسایی شوند. این مرحله شامل تحلیل محتوای تغییرات (diff) هر commit برای یافتن debugging code، monitoring scripts، یا هر کد مشکوک دیگر است. خارج از این مرحله: اصلاح commit‌ها، حذف کد، یا تغییر تاریخچه. نکته حیاتی: این مرحله صرفاً تشخیصی است و هیچ تغییری در کد ایجاد نمی‌کند.
**Key terms:** commit, Add Inspector Bridge Script, conventional commits, debugging code, monitoring scripts, production

**بخش مربوط از متن کاربر:**
```
تمام commit های اخیر دارای پیام یکسان 'Add Inspector Bridge Script' هستند که نشان‌دهنده عدم رعایت conventional commits و احتمال وجود debugging code یا monitoring scripts مشکوک در production است. این pattern غیرطبیعی است.
```

## 🎯 هدف (خلاصه ساختاریافته)
تحلیل و مستندسازی commit‌های تکراری 'Add Inspector Bridge Script' در تاریخچه مخزن

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/index.html:31-201` — `Inspector Bridge Script (IIFE)` — این اسکریپت کامل Inspector Bridge است که در frontend/index.html تزریق شده. رویدادهای click, scroll, input, focus کاربر را رهگیری کرده و از طریق postMessage به parent (پنل مدیریت) ارسال می‌کند. این کد در 5 commit متوالی با پیام یکسان اضافه شده است.
  ```
  <!-- Inspector Bridge Script - Auto-injected -->
  <script>
  (function() {
    console.log('🌉 Inspector Bridge: Script starting...');
  
    // جلوگیری از اجرای چندباره
    if (window.__inspectorBridgeLoaded) {
      console.log('🌉 Inspector Bridge: Already loaded, skipping');
      return;
    }
    window.__inspectorBridgeLoaded = true;
  
    // بررسی اینکه آیا در iframe هستیم
    const isInIframe = window !== window.parent;
    console.log('🌉 Inspector Bridge: In iframe?', isInIframe);
    console.log('🌉 Inspector Bridge: Page URL:', window.location.href);
  
    // تنظیمات
    const DEBOUNCE_MS = 100;
    let lastEventTime = 0;
    let messagesSent = 0;
  
    // تابع ارسال پیام به parent (پنل مدیریت)
    function sendToInspector(action, data) {
      try {
        const message = {
          type: 'inspector-bridge-event',
          action: action,
          target: data.target || '',
          elementInfo: data.elementInfo || '',
          position: data.position || { xPercent: 50, yPercent: 50 },
          pageUrl: window.location.href,
          timestamp: Date.now()
        };
        window.parent.postMessage(message, '*');
        messagesSent++;
        console.log('🌉 Inspector Bridge: Sent message #' + messagesSent, action, data.elementInfo);
      } catch (e) {
        console.warn('Inspector bridge: failed to send message', e);
      }
    }
  ```
- `frontend/index.html:136-144` — `click event listener` — رهگیری کلیک‌های کاربر با ارسال اطلاعات المنت و موقعیت به پنل مدیریت. این یک monitoring script است که در production اجرا می‌شود.
  ```
  // کلیک
    document.addEventListener('click', function(e) {
      if (!shouldSend()) return;
      sendToInspector('click', {
        target: e.target?.tagName,
        elementInfo: getElementInfo(e.target),
        position: getPositionPercent(e)
      });
    }, true);
  ```
- `frontend/index.html:146-159` — `scroll event listener` — رهگیری اسکرول کاربر با ارسال درصد موقعیت اسکرول. این داده‌ها به پنل مدیریت ارسال می‌شود.
  ```
  // اسکرول
    let scrollTimeout;
    document.addEventListener('scroll', function(e) {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(function() {
        sendToInspector('scroll', {
          elementInfo: 'صفحه',
          position: {
            xPercent: (window.scrollX / (document.body.scrollWidth - window.innerWidth)) * 100 || 0,
            yPercent: (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100 || 0
          }
        });
      }, 200);
    }, true);
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Stack شناسایی‌شده: JavaScript (ES6+), Express.js (backend), React 18 (frontend), Vite (build tool), Tailwind CSS, Firebase (احراز هویت), WebSocket (ws), Gemini API, ffmpeg. اسکریپت Inspector Bridge از vanilla JavaScript استفاده می‌کند و وابستگی به فریم‌ورک خاصی ندارد.

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `backend/server.js` (سطر 51) — سرور بک‌اند که فایل‌های استاتیک frontend/dist را سرو می‌کند (خط 51). این اسکریپت در production از طریق همین مسیر اجرا می‌شود.
- `frontend/vite.config.js` (سطر 12) — تنظیمات Vite که build نهایی را در frontend/dist قرار می‌دهد. اسکریپت Inspector Bridge در index.html نهایی قرار دارد و در build نهایی وجود خواهد داشت.
- `frontend/src/App.jsx` (سطر 1) — کامپوننت اصلی React که درون #root رندر می‌شود. اسکریپت Inspector Bridge در index.html قبل از mount شدن React اجرا می‌شود و رویدادهای داخل App.jsx را نیز رهگیری می‌کند.
- `render.yaml` (سطر 1) — فایل کانفیگ deployment که مشخص می‌کند این اپلیکیشن در production چگونه مستقر می‌شود. اسکریپت Inspector Bridge در production فعال خواهد بود.

## 🌐 نقشهٔ وابستگی‌ها
این تسک صرفاً تشخیصی است و نیازی به تغییر کد ندارد. اما اسکریپت Inspector Bridge در frontend/index.html (خطوط 31-201) به صورت مستقیم در HTML تزریق شده و وابسته به هیچ ماژول خارجی نیست. این اسکریپت از طریق window.parent.postMessage با پنل مدیریت ارتباط برقرار می‌کند. فایل‌های backend/server.js (خط 51) و frontend/vite.config.js (خط 12) در فرآیند build و deployment نقش دارند و اسکریپت مذکور در build نهایی قرار می‌گیرد. فایل frontend/src/App.jsx به صورت غیرمستقیم تحت تأثیر است زیرا رویدادهای داخل آن توسط این اسکریپت رهگیری می‌شود.

## 🔍 Context و وضعیت فعلی
بررسی و تحلیل تمام commit‌های اخیر با پیام یکسان 'Add Inspector Bridge Script' در مخزن فعلی. این درخواست شامل تحلیل کامل تاریخچه commit‌های اخیر (مثلاً ۳۰ روز گذشته یا ۵۰ commit آخر) است. باید تمام commit‌هایی که پیام 'Add Inspector Bridge Script' دارند شناسایی شوند. این مرحله شامل تحلیل محتوای تغییرات (diff) هر commit برای یافتن debugging code، monitoring scripts، یا هر کد مشکوک دیگر است. خارج از این مرحله: اصلاح commit‌ها، حذف کد، یا تغییر تاریخچه. نکته حیاتی: این مرحله صرفاً تشخیصی است و هیچ تغییری در کد ایجاد نمی‌کند.

--- بخش مربوط از درخواست اصلی کاربر ---
تمام commit های اخیر دارای پیام یکسان 'Add Inspector Bridge Script' هستند که نشان‌دهنده عدم رعایت conventional commits و احتمال وجود debugging code یا monitoring scripts مشکوک در production است. این pattern غیرطبیعی است.

--- کلیدواژه‌ها ---
commit, Add Inspector Bridge Script, conventional commits, debugging code, monitoring scripts, production

شواهد در کد واقعی پروژه: در فایل frontend/index.html از خط 31 تا 201 یک اسکریپت کامل به نام 'Inspector Bridge Script' وجود دارد که رویدادهای کلیک، اسکرول، تایپ و فوکوس کاربر را از طریق window.parent.postMessage به یک پنل مدیریت ارسال می‌کند. این اسکریپت در 5 commit متوالی (b9494e5, 4b6a071, e374c41, f90cee1, d214ff5) با پیام یکسان اضافه شده است. همچنین commit‌های 9d61c99 و e16892d این اسکریپت را حذف کرده‌اند که نشان‌دهنده سردرگمی در مدیریت این کد است.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] 1. لیست کامل commit‌های دارای پیام 'Add Inspector Bridge Script' استخراج شده باشد (حداقل 5 commit).
- [ ] 2. برای هر commit، diff کامل تغییرات در یک فایل جداگانه ذخیره شده باشد.
- [ ] 3. گزارش تحلیلی شامل تعداد commit‌های تکراری، محتوای تغییرات، و ارزیابی خطر تهیه شده باشد.
- [ ] 4. هیچ تغییری در کد پروژه ایجاد نشده باشد (صرفاً تشخیصی).
- [ ] 5. مستندات یافته‌ها در فایل docs/inspector-bridge-audit.md ذخیره شده باشد.
- [ ] 6. پیشنهاد برای رعایت conventional commits در آینده ارائه شده باشد.
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. مرحله ۱: اجرای دستور git log --oneline --since="30 days ago" یا git log --oneline -50 برای استخراج لیست commit‌های اخیر.
مرحله ۲: فیلتر کردن commit‌هایی که پیام آن‌ها دقیقاً 'Add Inspector Bridge Script' است.
مرحله ۳: برای هر commit شناسایی‌شده، دستور git diff <commit-hash>^! را اجرا کرده و خروجی را در فایل‌های جداگانه ذخیره کن.
مرحله ۴: تحلیل diff هر commit برای یافتن:
   - کدهای debugging (مانند console.log اضافی، alert، debugger)
   - monitoring scripts (مانند ارسال داده به سرور خارجی)
   - کدهای تکراری یا متناقض بین commit‌ها
مرحله ۵: مستندسازی یافته‌ها در یک فایل گزارش (مثلاً docs/inspector-bridge-audit.md) بدون تغییر در کد.
مرحله ۶: بررسی فایل frontend/index.html (خطوط 31-201) برای تطبیق با diffهای استخراج‌شده.
مرحله ۷: ارائه گزارش نهایی شامل:
   - تعداد commit‌های تکراری
   - محتوای تغییرات هر commit
   - ارزیابی خطر (risk assessment) برای production
   - پیشنهاد برای رعایت conventional commits در آینده

## 💡 نمونه‌های قبل/بعد
**تغییرات commit‌های تکراری (نمونه diff)**

_قبل:_
```
frontend/index.html قبل از commit b9494e5:
(بدون اسکریپت Inspector Bridge - فقط تگ‌های استاندارد HTML)
```

_بعد:_
```
frontend/index.html بعد از commit b9494e5:
(اضافه شدن اسکریپت Inspector Bridge از خط 31 تا 201 با تمام event listeners)
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `git log --oneline --grep="Add Inspector Bridge Script"`
- `git log --oneline -50`
- `git diff b9494e5^! > /tmp/commit_b9494e5.diff`
- `git diff 4b6a071^! > /tmp/commit_4b6a071.diff`
- `git diff e374c41^! > /tmp/commit_e374c41.diff`
- `git diff f90cee1^! > /tmp/commit_f90cee1.diff`
- `git diff d214ff5^! > /tmp/commit_d214ff5.diff`
- `git diff 9d61c99^! > /tmp/commit_9d61c99.diff`
- `git diff e16892d^! > /tmp/commit_e16892d.diff`

## ⚠️ ریسک‌ها و موارد احتیاط
این تسک صرفاً تشخیصی است و خطری برای کدبیس ندارد. اما اسکریپت Inspector Bridge موجود در frontend/index.html (خطوط 31-201) یک risk امنیتی جدی است: (1) تمام رویدادهای کاربر (کلیک، اسکرول، تایپ، فوکوس) را به یک پنل مدیریت خارجی ارسال می‌کند که نقض حریم خصوصی کاربران است. (2) از window.parent.postMessage با target '*' استفاده می‌کند که امکان شنود توسط هر iframe والد را فراهم می‌کند. (3) این اسکریپت در production فعال است و هیچ شرطی برای غیرفعال شدن در محیط production ندارد. (4) تابع sendToInspector اطلاعات حساس مانند pageUrl و محتوای المنت‌ها را ارسال می‌کند.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: other
- اولویت: medium
- تخمین زمان: small

---

# 🔹 مرحله 2: بررسی محتوای فایل‌های تغییر یافته در commit‌های مشکوک

**Scope:** این مرحله شامل بررسی دقیق محتوای فایل‌هایی است که در commit‌های با پیام 'Add Inspector Bridge Script' تغییر کرده‌اند. باید مشخص شود که آیا این فایل‌ها حاوی اسکریپت‌های مانیتورینگ، debugging code، یا دسترسی به API‌های خارجی هستند. خارج از این مرحله: اجرای اسکریپت‌ها یا تغییر آنها. نکته حیاتی: تمرکز بر شناسایی الگوهای خطرناک مانند ارسال داده به سرورهای خارجی، لاگ کردن اطلاعات حساس، یا تغییر رفتار سیستم.
**Key terms:** Add Inspector Bridge Script, debugging code, monitoring scripts, production, API, external server

**بخش مربوط از متن کاربر:**
```
تمام commit های اخیر دارای پیام یکسان 'Add Inspector Bridge Script' هستند که نشان‌دهنده عدم رعایت conventional commits و احتمال وجود debugging code یا monitoring scripts مشکوک در production است.
```

## 🎯 هدف (خلاصه ساختاریافته)
بررسی و تحلیل اسکریپت‌های مانیتورینگ (Inspector Bridge Script) در commit‌های اخیر

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/index.html:31-201` — `Inspector Bridge Script` — این اسکریپت کامل Inspector Bridge است که در frontend/index.html تزریق شده. تمام تعاملات کاربر را به parent iframe ارسال می‌کند.
  ```
  31: <!-- Inspector Bridge Script - Auto-injected -->
  32: <script>
  33: (function() {
  34:   console.log('🌉 Inspector Bridge: Script starting...');
  35: 
  36:   // جلوگیری از اجرای چندباره
  37:   if (window.__inspectorBridgeLoaded) {
  38:     console.log('🌉 Inspector Bridge: Already loaded, skipping');
  39:     return;
  40:   }
  41:   window.__inspectorBridgeLoaded = true;
  42: 
  43:   // بررسی اینکه آیا در iframe هستیم
  44:   const isInIframe = window !== window.parent;
  45:   console.log('🌉 Inspector Bridge: In iframe?', isInIframe);
  46:   console.log('🌉 Inspector Bridge: Page URL:', window.location.href);
  47: 
  48:   // تنظیمات
  49:   const DEBOUNCE_MS = 100;
  50:   let lastEventTime = 0;
  51:   let messagesSent = 0;
  52: 
  53:   // تابع ارسال پیام به parent (پنل مدیریت)
  54:   function sendToInspector(action, data) {
  55:     try {
  56:       const message = {
  57:         type: 'inspector-bridge-event',
  58:         action: action,
  59:         target: data.target || '',
  60:         elementInfo: data.elementInfo || '',
  61:         position: data.position || { xPercent: 50, yPercent: 50 },
  62:         pageUrl: window.location.href,
  63:         timestamp: Date.now()
  64:       };
  65:       window.parent.postMessage(message, '*');
  66:       messagesSent++;
  67:       console.log('🌉 Inspector Bridge: Sent message #' + messagesSent, action, data.elementInfo);
  68:     } catch (e) {
  69:       console.warn('Inspector bridge: failed to send message', e);
  70:     }
  71:   }
  ```
- `frontend/index.html:137-144` — `click event listener` — Event listener برای کلیک که اطلاعات کلیک را به parent ارسال می‌کند.
  ```
  137:   // کلیک
  138:   document.addEventListener('click', function(e) {
  139:     if (!shouldSend()) return;
  140:     sendToInspector('click', {
  141:       target: e.target?.tagName,
  142:       elementInfo: getElementInfo(e.target),
  143:       position: getPositionPercent(e)
  144:     });
  145:   }, true);
  ```
- `frontend/index.html:148-159` — `scroll event listener` — Event listener برای اسکرول که موقعیت اسکرول را به parent ارسال می‌کند.
  ```
  148:   // اسکرول
  149:   let scrollTimeout;
  150:   document.addEventListener('scroll', function(e) {
  151:     clearTimeout(scrollTimeout);
  152:     scrollTimeout = setTimeout(function() {
  153:       sendToInspector('scroll', {
  154:         elementInfo: 'صفحه',
  155:         position: {
  156:           xPercent: (window.scrollX / (document.body.scrollWidth - window.innerWidth)) * 100 || 0,
  157:           yPercent: (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100 || 0
  158:         }
  159:       });
  160:     }, 200);
  161:   }, true);
  ```
- `frontend/index.html:162-171` — `input event listener` — Event listener برای input که اطلاعات فیلدهای ورودی را به parent ارسال می‌کند.
  ```
  162:   // تایپ در فیلدها
  163:   document.addEventListener('input', function(e) {
  164:     if (!shouldSend()) return;
  165:     if (e.target?.tagName === 'INPUT' || e.target?.tagName === 'TEXTAREA') {
  166:       sendToInspector('input', {
  167:         target: e.target?.tagName,
  168:         elementInfo: getElementInfo(e.target),
  169:         position: { xPercent: 50, yPercent: 50 }
  170:       });
  171:     }
  172:   }, true);
  ```
- `frontend/index.html:186-196` — `inspector-bridge-ready message` — پیام آماده بودن که به parent ارسال می‌شود.
  ```
  186:   // اعلام آماده بودن
  187:   try {
  188:     window.parent.postMessage({
  189:       type: 'inspector-bridge-ready',
  190:       pageUrl: window.location.href,
  191:       isInIframe: isInIframe,
  192:       timestamp: Date.now()
  193:     }, '*');
  194:     console.log('🌉 Inspector Bridge: Ready message sent to parent');
  195:   } catch (readyErr) {
  196:     console.warn('🌉 Inspector Bridge: Failed to send ready message', readyErr);
  197:   }
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Stack تشخیص داده شده: JavaScript (ES6+), React (از طریق Vite), Express (backend), WebSocket (ws), Firebase (احتمالی). اسکریپت Inspector Bridge به صورت pure JavaScript نوشته شده و از هیچ کتابخانه خارجی استفاده نمی‌کند.

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `frontend/index.html` (سطر 31) — فایل اصلی که اسکریپت Inspector Bridge در آن تزریق شده است. تمام event listeners و تابع sendToInspector در این فایل قرار دارند.
- `frontend/src/App.jsx` (سطر 1) — کامپوننت اصلی React که ممکن است تحت تأثیر اسکریپت Inspector Bridge قرار گیرد. اگر App.jsx در iframe بارگذاری شود، اسکریپت فعال می‌شود.
- `frontend/src/main.jsx` (سطر 1) — نقطه ورود React که App.jsx را رندر می‌کند. ممکن است اسکریپت Inspector Bridge قبل از بارگذاری React اجرا شود.
- `backend/server.js` (سطر 1) — سرور backend که ممکن است برای دریافت داده‌های ارسالی از Inspector Bridge استفاده شود. در حال حاضر هیچ endpoint خاصی برای این کار وجود ندارد.
- `render.yaml` (سطر 1) — فایل کانفیگ deployment که ممکن است شامل تنظیمات مربوط به iframe یا proxy باشد.

## 🌐 نقشهٔ وابستگی‌ها
اسکریپت Inspector Bridge در frontend/index.html (خطوط 31-201) به صورت مستقیم به هیچ فایل دیگری وابسته نیست و به صورت خودکار در HTML تزریق شده است. این اسکریپت از window.parent.postMessage برای ارسال داده به parent iframe استفاده می‌کند. event listeners (click, scroll, input, focus) به document اضافه شده‌اند و تمام تعاملات کاربر را مانیتور می‌کنند. تابع sendToInspector (خط 54) داده‌ها را به صورت JSON با ساختار مشخص به parent ارسال می‌کند. اسکریپت از debounce (DEBOUNCE_MS = 100) برای کاهش تعداد پیام‌ها استفاده می‌کند. هیچ وابستگی به کتابخانه‌های خارجی ندارد و به صورت pure JavaScript نوشته شده است.

## 🔍 Context و وضعیت فعلی
بر اساس درخواست کاربر، نیاز به بررسی دقیق محتوای فایل‌هایی است که در commit‌های با پیام 'Add Inspector Bridge Script' تغییر کرده‌اند. این commit‌ها شامل: b9494e5, 4b6a071, e374c41, f90cee1, d214ff5, 65ae85c هستند. کاربر خواسته است که مشخص شود آیا این فایل‌ها حاوی اسکریپت‌های مانیتورینگ، debugging code، یا دسترسی به API‌های خارجی هستند. نکته حیاتی: تمرکز بر شناسایی الگوهای خطرناک مانند ارسال داده به سرورهای خارجی، لاگ کردن اطلاعات حساس، یا تغییر رفتار سیستم. خارج از این مرحله: اجرای اسکریپت‌ها یا تغییر آنها. کلیدواژه‌های اصلی: Add Inspector Bridge Script, debugging code, monitoring scripts, production, API, external server.

شواهد در کد واقعی پروژه:
- در فایل frontend/index.html (خطوط 31-201) یک اسکریپت کامل با عنوان 'Inspector Bridge Script' وجود دارد که:
  - در خط 34: `console.log('🌉 Inspector Bridge: Script starting...');`
  - در خط 44: `const isInIframe = window !== window.parent;`
  - در خط 54-71: تابع `sendToInspector` که با `window.parent.postMessage` داده‌ها را ارسال می‌کند.
  - در خطوط 137-144: Event listener برای کلیک که اطلاعات کلیک را به parent ارسال می‌کند.
  - در خطوط 148-159: Event listener برای اسکرول.
  - در خطوط 162-171: Event listener برای input.
  - در خطوط 174-183: Event listener برای focus.
  - در خطوط 186-196: ارسال پیام 'inspector-bridge-ready'.

این اسکریپت به وضوح یک monitoring/debugging script است که تمام تعاملات کاربر (کلیک، اسکرول، تایپ، فوکوس) را به یک iframe parent ارسال می‌کند. این رفتار در production می‌تواند خطرناک باشد زیرا اطلاعات حساس کاربر را بدون رضایت به سرورهای خارجی ارسال می‌کند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] 1. اسکریپت Inspector Bridge در frontend/index.html (خطوط 31-201) به طور کامل شناسایی و مستند شده باشد.
- [ ] 2. تمام event listeners (click, scroll, input, focus) و تابع sendToInspector بررسی شده باشند.
- [ ] 3. مشخص شود که آیا این اسکریپت به API خارجی متصل است یا خیر (در حال حاضر فقط به window.parent.postMessage ارسال می‌کند).
- [ ] 4. گزارش نهایی شامل الگوهای خطرناک (ارسال داده به سرورهای خارجی، لاگ کردن اطلاعات حساس، تغییر رفتار سیستم) تهیه شود.
- [ ] 5. توصیه‌های امنیتی برای حذف یا غیرفعال کردن اسکریپت در production ارائه شود.
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. 1. بررسی کامل اسکریپت Inspector Bridge در frontend/index.html (خطوط 31-201) برای شناسایی الگوهای خطرناک.
2. شناسایی اینکه آیا این اسکریپت به API خارجی متصل است یا خیر (در حال حاضر فقط به window.parent.postMessage ارسال می‌کند).
3. بررسی commit‌های مرتبط (b9494e5, 4b6a071, e374c41, f90cee1, d214ff5, 65ae85c) برای مشاهده تغییرات دقیق.
4. مستندسازی الگوهای خطرناک مانند:
   - ارسال داده به سرورهای خارجی (از طریق postMessage)
   - لاگ کردن اطلاعات حساس (console.log)
   - تغییر رفتار سیستم (مانند debounce و event listeners)
5. ارائه گزارش نهایی با توصیه‌های امنیتی.

## 💡 نمونه‌های قبل/بعد
**Inspector Bridge Script - تابع sendToInspector**

_قبل:_
```
function sendToInspector(action, data) {
  try {
    const message = {
      type: 'inspector-bridge-event',
      action: action,
      target: data.target || '',
      elementInfo: data.elementInfo || '',
      position: data.position || { xPercent: 50, yPercent: 50 },
      pageUrl: window.location.href,
      timestamp: Date.now()
    };
    window.parent.postMessage(message, '*');
    messagesSent++;
    console.log('🌉 Inspector Bridge: Sent message #' + messagesSent, action, data.elementInfo);
  } catch (e) {
    console.warn('Inspector bridge: failed to send message', e);
  }
}
```

_بعد:_
```
// این تابع باید حذف شود یا با یک تابع امن جایگزین شود که داده‌های حساس را ارسال نکند.
// پیشنهاد: حذف کامل اسکریپت Inspector Bridge از production.
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `grep -r 'Inspector Bridge' frontend/index.html`
- `grep -r 'sendToInspector' frontend/index.html`
- `grep -r 'inspector-bridge' frontend/index.html`
- `git log --oneline | grep 'Add Inspector Bridge Script'`
- `git show b9494e5 --stat`
- `git show 4b6a071 --stat`
- `git show e374c41 --stat`
- `git show f90cee1 --stat`
- `git show d214ff5 --stat`
- `git show 65ae85c --stat`

## ⚠️ ریسک‌ها و موارد احتیاط
این اسکریپت Inspector Bridge در frontend/index.html (خطوط 31-201) یک risk امنیتی جدی است زیرا:
1. تمام تعاملات کاربر (کلیک، اسکرول، تایپ، فوکوس) را به parent iframe ارسال می‌کند (خطوط 137-183).
2. از window.parent.postMessage با target '*' استفاده می‌کند که به هر parent اجازه دریافت داده را می‌دهد (خط 65).
3. اطلاعات حساس مانند pageUrl و elementInfo را لاگ می‌کند (خط 67).
4. اگر این اسکریپت در production فعال باشد، می‌تواند حریم خصوصی کاربران را نقض کند.
5. هیچ مکانیزم احراز هویت یا مجوز برای ارسال داده وجود ندارد.
6. اسکریپت به صورت خودکار در HTML تزریق شده و بدون اطلاع کاربر اجرا می‌شود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: high
- تخمین زمان: medium

---

# 🔹 مرحله 3: بررسی وجود conventional commits در تاریخچه و شناسایی موارد نقض

**Scope:** این مرحله شامل بررسی تمام commit‌های اخیر (مثلاً ۱۰۰ commit آخر) برای اطمینان از رعایت استاندارد conventional commits (مانند feat:, fix:, chore:, docs:, refactor:, test:). باید commit‌هایی که از این استاندارد پیروی نمی‌کنند شناسایی و لیست شوند. خارج از این مرحله: اصلاح commit‌ها یا بازنویسی تاریخچه. نکته حیاتی: تمرکز بر commit‌های با پیام تکراری و غیراستاندارد مانند 'Add Inspector Bridge Script'.
**Key terms:** conventional commits, commit message, Add Inspector Bridge Script, feat:, fix:, chore:

**بخش مربوط از متن کاربر:**
```
تمام commit های اخیر دارای پیام یکسان 'Add Inspector Bridge Script' هستند که نشان‌دهنده عدم رعایت conventional commits و احتمال وجود debugging code یا monitoring scripts مشکوک در production است.
```

## 🎯 هدف (خلاصه ساختاریافته)
بررسی و گزارش نقض استاندارد Conventional Commits در تاریخچه پروژه

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/index.html:31-201` — `Inspector Bridge Script` — این فایل deep-read شده است. اسکریپت Inspector Bridge در production (index.html) تزریق شده و commit‌های مرتبط با آن تکراری و غیراستاندارد هستند.
  ```
  <!-- Inspector Bridge Script - Auto-injected -->
  <script>
  (function() {
    console.log('🌉 Inspector Bridge: Script starting...');
  
    // جلوگیری از اجرای چندباره
    if (window.__inspectorBridgeLoaded) {
      console.log('🌉 Inspector Bridge: Already loaded, skipping');
      return;
    }
    window.__inspectorBridgeLoaded = true;
  
    // بررسی اینکه آیا در iframe هستیم
    const isInIframe = window !== window.parent;
    console.log('🌉 Inspector Bridge: In iframe?', isInIframe);
    console.log('🌉 Inspector Bridge: Page URL:', window.location.href);
  
    // تنظیمات
    const DEBOUNCE_MS = 100;
    let lastEventTime = 0;
    let messagesSent = 0;
  
    // تابع ارسال پیام به parent (پنل مدیریت)
    function sendToInspector(action, data) {
      try {
        const message = {
          type: 'inspector-bridge-event',
          action: action,
          target: data.target || '',
          elementInfo: data.elementInfo || '',
          position: data.position || { xPercent: 50, yPercent: 50 },
          pageUrl: window.location.href,
          timestamp: Date.now()
        };
        window.parent.postMessage(message, '*');
        messagesSent++;
        console.log('🌉 Inspector Bridge: Sent message #' + messagesSent, action, data.elementInfo);
      } catch (e) {
        console.warn('Inspector bridge: failed to send message', e);
      }
    }
  ```
- `backend/server.js:1-1403` — `کل فایل` — فایل اصلی backend. commit‌های مرتبط با تغییرات آن باید دارای پیام‌های استاندارد باشند.
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
Stack تشخیص داده شده: JavaScript (زبان اصلی پروژه). ابزارهای مرتبط: git برای بررسی تاریخچه، conventional commits استاندارد. پروژه از React (frontend) و Express.js (backend) استفاده می‌کند.

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `frontend/index.html` (سطر 31) — این فایل حاوی Inspector Bridge Script است که commit‌های تکراری 'Add Inspector Bridge Script' به آن اشاره دارند. بررسی commit‌های مرتبط با این فایل ضروری است.
- `backend/server.js` (سطر 1) — فایل اصلی backend که commit‌های آن باید با conventional commits مطابقت داشته باشند. commit‌های اخیر این فایل باید بررسی شوند.
- `frontend/src/App.jsx` (سطر 1) — فایل اصلی frontend که commit‌های مرتبط با آن باید بررسی شوند. این فایل deep-read نشده است.
- `frontend/src/main.jsx` (سطر 1) — فایل ورودی frontend که commit‌های مرتبط با آن باید بررسی شوند. این فایل deep-read نشده است.
- `render.yaml` (سطر 1) — فایل کانفیگ deployment که commit‌های مرتبط با آن باید بررسی شوند. این فایل deep-read نشده است.

## 🌐 نقشهٔ وابستگی‌ها
این تسک به فایل‌های کد منبع وابسته نیست، بلکه به تاریخچه git پروژه وابسته است. فایل‌های اصلی که commit‌های آن‌ها باید بررسی شوند عبارتند از: frontend/index.html (خطوط 31-201 برای Inspector Bridge Script)، backend/server.js (کل فایل)، frontend/src/App.jsx، frontend/src/main.jsx، render.yaml. همچنین فایل‌های package.json و package-lock.json در هر دو بخش frontend و backend ممکن است commit‌های مرتبط داشته باشند. commit‌های تکراری 'Add Inspector Bridge Script' مستقیماً به فایل frontend/index.html مربوط می‌شوند.

## 🔍 Context و وضعیت فعلی
کاربر درخواست بررسی وجود conventional commits در تاریخچه و شناسایی موارد نقض را داده است. این مرحله شامل بررسی تمام commit‌های اخیر (مثلاً ۱۰۰ commit آخر) برای اطمینان از رعایت استاندارد conventional commits (مانند feat:, fix:, chore:, docs:, refactor:, test:) است. باید commit‌هایی که از این استاندارد پیروی نمی‌کنند شناسایی و لیست شوند. خارج از این مرحله: اصلاح commit‌ها یا بازنویسی تاریخچه. نکته حیاتی: تمرکز بر commit‌های با پیام تکراری و غیراستاندارد مانند 'Add Inspector Bridge Script'. 

بر اساس deep context پروژه، در تاریخچه commit‌های اخیر (آخرین کامیت‌ها) مشاهده می‌شود که ۷ commit از ۸ commit آخر دارای پیام تکراری 'Add Inspector Bridge Script' هستند (b9494e5, 4b6a071, e374c41, f90cee1, d214ff5, 65ae85c) و یک commit با عنوان 'Remove Inspector Bridge Script' (e16892d). این الگو نشان‌دهنده عدم رعایت conventional commits است. همچنین در فایل frontend/index.html (خطوط 31-201) یک اسکریپت کامل با عنوان 'Inspector Bridge Script' وجود دارد که به نظر می‌رسد یک monitoring/debugging script است که مستقیماً در production (index.html) تزریق شده است. این اسکریپت شامل event listenerهای click, scroll, input, focus است و داده‌ها را از طریق window.parent.postMessage به یک پنل مدیریت ارسال می‌کند. وجود این اسکریپت در production و commit‌های تکراری آن نشان‌دهنده نیاز به بررسی و رعایت استانداردهای commit message است.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] ۱. اجرای git log --oneline --format='%h %s' و استخراج حداقل ۱۰۰ commit آخر از تاریخچه پروژه.
- [ ] ۲. اسکن خودکار پیام‌های commit با regex: ^(feat|fix|chore|docs|refactor|test|style|perf|ci|build|revert)(\(.+\))?: .+
- [ ] ۳. شناسایی و لیست کردن تمام commit‌هایی که با الگوی conventional commits مطابقت ندارند، به ویژه commit‌های با پیام 'Add Inspector Bridge Script'.
- [ ] ۴. ارائه گزارش شامل: تعداد کل commit‌های بررسی‌شده، تعداد commit‌های معتبر، تعداد commit‌های نامعتبر، و لیست commit‌های نامعتبر با هش و پیام کامل.
- [ ] ۵. تأیید اینکه commit‌های تکراری 'Add Inspector Bridge Script' (b9494e5, 4b6a071, e374c41, f90cee1, d214ff5, 65ae85c) در لیست نقض‌کنندگان قرار دارند.
- [ ] ۶. ارائه پیشنهاد برای بهبود فرآیند commit در آینده (مانند استفاده از ابزار commitlint یا husky).
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. ۱. اجرای دستور git log --oneline --format='%h %s' برای مشاهده تاریخچه commit‌ها و استخراج پیام‌ها.
۲. اسکن دستی یا خودکار پیام‌های commit با یک regex برای تشخیص الگوهای conventional commits: ^(feat|fix|chore|docs|refactor|test|style|perf|ci|build|revert)(\(.+\))?: .+
۳. شناسایی commit‌هایی که با الگوی بالا مطابقت ندارند، به ویژه commit‌های با پیام تکراری 'Add Inspector Bridge Script'.
۴. تهیه لیست commit‌های نقض‌کننده با هش و پیام کامل.
۵. گزارش تعداد commit‌های معتبر و نامعتبر.
۶. توجه ویژه به فایل frontend/index.html (خطوط 31-201) که حاوی Inspector Bridge Script است و commit‌های مرتبط با آن.
۷. ارائه پیشنهاد برای اصلاح فرآیند commit در آینده (بدون تغییر تاریخچه).

## 💡 نمونه‌های قبل/بعد
**نمونه commit غیراستاندارد (قبل)**

_قبل:_
```
Add Inspector Bridge Script
```

_بعد:_
```
feat: add inspector bridge script for live tracking
```

**نمونه commit استاندارد (بعد)**

_قبل:_
```
Remove Inspector Bridge Script
```

_بعد:_
```
chore: remove inspector bridge script from production
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `git log --oneline --format='%h %s' -100`
- `git log --oneline --format='%h %s' -100 | grep -vE '^(feat|fix|chore|docs|refactor|test|style|perf|ci|build|revert)(\(.+\))?: '`
- `echo 'تعداد کل commit‌ها:'; git log --oneline -100 | wc -l`
- `echo 'تعداد commit‌های معتبر:'; git log --oneline -100 | grep -cE '^(feat|fix|chore|docs|refactor|test|style|perf|ci|build|revert)(\(.+\))?: '`
- `echo 'تعداد commit‌های نامعتبر:'; git log --oneline -100 | grep -vcE '^(feat|fix|chore|docs|refactor|test|style|perf|ci|build|revert)(\(.+\))?: '`

## ⚠️ ریسک‌ها و موارد احتیاط
این تسک فقط به بررسی تاریخچه commit می‌پردازد و هیچ تغییری در کد ایجاد نمی‌کند. بنابراین ریسک خاصی برای کدبیس وجود ندارد. با این حال، توجه داشته باشید که فایل frontend/index.html حاوی Inspector Bridge Script است که ممکن است یک debugging/monitoring script باشد و در production نباید وجود داشته باشد. commit‌های تکراری 'Add Inspector Bridge Script' نشان‌دهنده احتمال وجود debugging code در production است که باید جداگانه بررسی شود. همچنین فایل backend/server.js (خطوط 1-1403) حاوی APIهای متعدد است و commit‌های مرتبط با آن باید با دقت بررسی شوند.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: other
- اولویت: medium
- تخمین زمان: small

---

# 🔹 مرحله 4: بررسی احتمال وجود debugging code یا monitoring scripts در production

**Scope:** این مرحله شامل تحلیل عمیق‌تر کد موجود در commit‌های مشکوک برای یافتن الگوهای رایج debugging code (مانند console.log, print, var_dump, debugger) یا monitoring scripts (مانند ارسال داده به endpoint خارجی، tracking pixels, analytics بدون consent). خارج از این مرحله: حذف کد یا تغییر آن. نکته حیاتی: باید به دنبال الگوهایی مانند ارسال داده به دامنه‌های ناشناس، لاگ کردن credentials، یا اجرای کد در پس‌زمینه بود.
**Key terms:** debugging code, monitoring scripts, production, console.log, debugger, analytics, tracking, external endpoint

**بخش مربوط از متن کاربر:**
```
تمام commit های اخیر دارای پیام یکسان 'Add Inspector Bridge Script' هستند که نشان‌دهنده عدم رعایت conventional commits و احتمال وجود debugging code یا monitoring scripts مشکوک در production است.
```

## 🎯 هدف (خلاصه ساختاریافته)
تحلیل عمیق کدهای Inspector Bridge Script در commit‌های اخیر برای یافتن debugging code و monitoring scripts مشکوک در production

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/index.html:31-201` — `Inspector Bridge Script` — این اسکریپت کامل Inspector Bridge است که در production (index.html) قرار دارد. شامل event listenerهای متعدد و ارسال داده به parent از طریق postMessage با origin '*' است. این می‌تواند به عنوان monitoring script در production عمل کند.
  ```
  <!-- Inspector Bridge Script - Auto-injected -->
  <script>
  (function() {
    console.log('🌉 Inspector Bridge: Script starting...');
  
    // جلوگیری از اجرای چندباره
    if (window.__inspectorBridgeLoaded) {
      console.log('🌉 Inspector Bridge: Already loaded, skipping');
      return;
    }
    window.__inspectorBridgeLoaded = true;
  
    // بررسی اینکه آیا در iframe هستیم
    const isInIframe = window !== window.parent;
    console.log('🌉 Inspector Bridge: In iframe?', isInIframe);
    console.log('🌉 Inspector Bridge: Page URL:', window.location.href);
  
    // تنظیمات
    const DEBOUNCE_MS = 100;
    let lastEventTime = 0;
    let messagesSent = 0;
  
    // تابع ارسال پیام به parent (پنل مدیریت)
    function sendToInspector(action, data) {
      try {
        const message = {
          type: 'inspector-bridge-event',
          action: action,
          target: data.target || '',
          elementInfo: data.elementInfo || '',
          position: data.position || { xPercent: 50, yPercent: 50 },
          pageUrl: window.location.href,
          timestamp: Date.now()
        };
        window.parent.postMessage(message, '*');
        messagesSent++;
        console.log('🌉 Inspector Bridge: Sent message #' + messagesSent, action, data.elementInfo);
      } catch (e) {
        console.warn('Inspector bridge: failed to send message', e);
      }
    }
  ```
- `backend/server.js:44-45` — `WebSocketServer` — WebSocket server در مسیر '/ws/live' ایجاد شده که می‌تواند برای دریافت داده‌های real-time از inspector bridge استفاده شود. این endpoint در production فعال است.
  ```jsx
  // Create WebSocket server
  const wss = new WebSocketServer({ server, path: '/ws/live' });
  ```
- `backend/server.js:183, 188, 224, 234` — `GEMINI_API_KEY logging` — در endpointهای /api/list-models و /api/test-gemini، 10 کاراکتر اول GEMINI_API_KEY در response برگردانده می‌شود که می‌تواند خطر امنیتی داشته باشد (لاگ کردن credentials).
  ```jsx
  return res.status(response.status).json({ error: data, keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...' });
  res.json({ models: modelNames, count: modelNames.length, keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...' });
          keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...'
        keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...'
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Stack تشخیص داده شده: JavaScript (Node.js backend با Express, WebSocket, multer, ffmpeg; frontend با React, Vite, Tailwind CSS, Firebase). کتابخانه‌های مرتبط: ws برای WebSocket, multer برای آپلود فایل, fluent-ffmpeg برای پردازش ویدیو.

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `backend/server.js` (سطر 45) — این فایل شامل WebSocket server در خط 45 و endpointهای API است که ممکن است با inspector bridge ارتباط داشته باشند. همچنین شامل لاگ کردن GEMINI_API_KEY در خطوط 183, 188, 224, 234 است.
- `frontend/src/App.jsx` (سطر 1) — این فایل کامپوننت اصلی React است که در index.html (خط 206) لود می‌شود. ممکن است با inspector bridge تعامل داشته باشد یا تحت تأثیر event listenerهای آن قرار گیرد.
- `frontend/vite.config.js` (سطر 8) — این فایل تنظیمات Vite را شامل می‌شود و proxy برای /api به backend دارد. ممکن است inspector bridge از این proxy برای ارسال داده استفاده کند.
- `frontend/index.html` (سطر 31) — فایل اصلی HTML که inspector bridge script در آن injection شده است. تمام event listenerها و ارسال داده در این فایل انجام می‌شود.
- `render.yaml` (سطر 1) — فایل کانفیگ deployment که مشخص می‌کند این کد در production روی Render اجرا می‌شود. inspector bridge در production فعال خواهد بود.

## 🌐 نقشهٔ وابستگی‌ها
این تحلیل بر روی فایل frontend/index.html متمرکز است که اسکریپت Inspector Bridge در آن قرار دارد. این اسکریپت از window.parent.postMessage برای ارسال داده به parent استفاده می‌کند که می‌تواند هر دامنه‌ای باشد (origin '*'). WebSocket server در backend/server.js خط 45 (مسیر '/ws/live') می‌تواند برای دریافت داده‌های real-time استفاده شود. فایل frontend/src/App.jsx کامپوننت اصلی React است که در index.html لود می‌شود و ممکن است تحت تأثیر event listenerهای inspector قرار گیرد. فایل frontend/vite.config.js شامل proxy برای /api است. فایل render.yaml کانفیگ deployment در production را مشخص می‌کند. همچنین در backend/server.js خطوط 183, 188, 224, 234 کلید API با prefix 10 کاراکتری لاگ می‌شود که خطر امنیتی دارد.

## 🔍 Context و وضعیت فعلی
بر اساس درخواست کاربر، نیاز به تحلیل عمیق‌تر کد موجود در commit‌های اخیر با پیام یکسان 'Add Inspector Bridge Script' (کامیت‌های b9494e5, 4b6a071, e374c41, f90cee1, d214ff5) برای یافتن الگوهای رایج debugging code مانند console.log, debugger و monitoring scripts مانند ارسال داده به endpoint خارجی، tracking pixels, analytics بدون consent وجود دارد. نکته حیاتی: باید به دنبال الگوهایی مانند ارسال داده به دامنه‌های ناشناس، لاگ کردن credentials، یا اجرای کد در پس‌زمینه بود. خارج از این مرحله: حذف کد یا تغییر آن. شواهد در کد واقعی پروژه: در فایل frontend/index.html از خط 31 تا 201 یک اسکریپت کامل با عنوان 'Inspector Bridge Script' وجود دارد که شامل event listenerهای click, scroll, input, focus است و داده‌ها را از طریق window.parent.postMessage به یک پنل مدیریت (inspector) ارسال می‌کند. این اسکریپت در production (فایل index.html که به صورت static سرو می‌شود) قرار دارد و می‌تواند به عنوان یک monitoring script عمل کند. همچنین در backend/server.js خط 45 یک WebSocket server در مسیر '/ws/live' ایجاد شده که می‌تواند برای دریافت داده‌های real-time از inspector استفاده شود. کلیدواژه‌های کاربر: debugging code, monitoring scripts, production, console.log, debugger, analytics, tracking, external endpoint.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] تأیید شود که اسکریپت Inspector Bridge در frontend/index.html (خطوط 31-201) در production غیرفعال است یا با شرط environment variable (مانند process.env.NODE_ENV !== 'production') محافظت می‌شود.
- [ ] تأیید شود که WebSocket server در backend/server.js خط 45 (مسیر '/ws/live') در production غیرفعال است یا فقط برای اتصالات مجاز باز است.
- [ ] تأیید شود که هیچ console.log در frontend/index.html (خطوط 34, 38, 45, 46, 67, 193, 198, 199) در production وجود ندارد.
- [ ] تأیید شود که GEMINI_API_KEY در backend/server.js خطوط 183, 188, 224, 234 در responseها برگردانده نمی‌شود.
- [ ] تأیید شود که هیچ داده‌ای به دامنه‌های خارجی از طریق window.parent.postMessage یا fetch در frontend/index.html ارسال نمی‌شود.
- [ ] تأیید شود که commit‌های با پیام 'Add Inspector Bridge Script' (b9494e5, 4b6a071, e374c41, f90cee1, d214ff5) بررسی شده و کد اضافی در production وجود ندارد.
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. 1. تحلیل کامل اسکریپت Inspector Bridge در frontend/index.html (خطوط 31-201): بررسی event listenerهای click (خط 137), scroll (خط 148), input (خط 162), focus (خط 174) و تابع sendToInspector (خط 54) که داده‌ها را به window.parent.postMessage ارسال می‌کند. 2. بررسی WebSocket server در backend/server.js خط 45 (مسیر '/ws/live') برای اطمینان از عدم اتصال به inspector. 3. جستجوی console.log در کل پروژه (در frontend/index.html خطوط 34, 38, 45, 46, 67, 193, 198, 199 و backend/server.js خطوط 94, 111, 146, 161, 207, 216, 217, 237, 301, 331, 358, 372, 382, 397, 461, 483, 517, 546, 700, 711, 717, 734, 748, 763, 767, 791, 798). 4. بررسی ارسال داده به دامنه‌های ناشناس: در sendToInspector داده به window.parent.postMessage ارسال می‌شود که می‌تواند به هر دامنه‌ای باشد (origin '*'). 5. بررسی لاگ کردن credentials: در backend/server.js خط 183 و 188 و 224 و 234 کلید API (GEMINI_API_KEY) با prefix 10 کاراکتری لاگ می‌شود که می‌تواند خطر امنیتی داشته باشد. 6. بررسی اجرای کد در پس‌زمینه: اسکریپت inspector به صورت خودکار در خط 32-201 index.html اجرا می‌شود.

## 💡 نمونه‌های قبل/بعد
**نمونه کد مشکوک در Inspector Bridge Script**

_قبل:_
```
// تابع ارسال پیام به parent (پنل مدیریت)
function sendToInspector(action, data) {
  try {
    const message = {
      type: 'inspector-bridge-event',
      action: action,
      target: data.target || '',
      elementInfo: data.elementInfo || '',
      position: data.position || { xPercent: 50, yPercent: 50 },
      pageUrl: window.location.href,
      timestamp: Date.now()
    };
    window.parent.postMessage(message, '*');
    messagesSent++;
    console.log('🌉 Inspector Bridge: Sent message #' + messagesSent, action, data.elementInfo);
  } catch (e) {
    console.warn('Inspector bridge: failed to send message', e);
  }
}
```

_بعد:_
```
این کد باید در production حذف شود یا با شرط environment variable غیرفعال شود. ارسال داده به window.parent.postMessage با origin '*' خطر امنیتی دارد.
```

**نمونه لاگ کردن credentials در backend**

_قبل:_
```
return res.status(response.status).json({ error: data, keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...' });
res.json({ models: modelNames, count: modelNames.length, keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...' });
```

_بعد:_
```
حذف keyPrefix از responseها. لاگ کردن حتی 10 کاراکتر اول API key می‌تواند خطر امنیتی داشته باشد.
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `grep -rn "console.log" frontend/ backend/ --include="*.js" --include="*.jsx" --include="*.html"`
- `grep -rn "debugger" frontend/ backend/ --include="*.js" --include="*.jsx" --include="*.html"`
- `grep -rn "postMessage" frontend/ --include="*.html" --include="*.js" --include="*.jsx"`
- `grep -rn "GEMINI_API_KEY" backend/server.js`
- `git log --oneline --all | grep "Inspector Bridge"`
- `git show b9494e5 --stat`
- `git diff d214ff5..HEAD -- frontend/index.html`

## ⚠️ ریسک‌ها و موارد احتیاط
ریسک اصلی: اسکریپت Inspector Bridge در frontend/index.html (خطوط 31-201) در production فعال است و داده‌های کاربر (کلیک‌ها، اسکرول، ورودی‌ها) را از طریق window.parent.postMessage به هر دامنه‌ای ارسال می‌کند. این می‌تواند منجر به نشت اطلاعات کاربر شود. WebSocket server در backend/server.js خط 45 (مسیر '/ws/live') می‌تواند برای دریافت این داده‌ها استفاده شود. همچنین لاگ کردن GEMINI_API_KEY در backend/server.js خطوط 183, 188, 224, 234 خطر امنیتی دارد. console.logهای متعدد در frontend/index.html (خطوط 34, 38, 45, 46, 67, 193, 198, 199) و backend/server.js (خطوط 94, 111, 146, 161, 207, 216, 217, 237, 301, 331, 358, 372, 382, 397, 461, 483, 517, 546, 700, 711, 717, 734, 748, 763, 767, 791, 798) می‌تواند اطلاعات حساس را در logهای سرور فاش کند.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: high
- تخمین زمان: medium

---

# 🔹 مرحله 5: ارائه گزارش نهایی و توصیه‌های اقدام

**Scope:** این مرحله شامل جمع‌بندی تمام یافته‌های مراحل قبل در یک گزارش جامع است. گزارش باید شامل: لیست commit‌های مشکوک، تحلیل محتوای فایل‌ها، موارد نقض conventional commits، و وجود debugging/monitoring code. همچنین باید توصیه‌های عملی برای اقدامات بعدی ارائه دهد (مانند revert commit‌ها، squash کردن، بازنویسی پیام‌ها، یا حذف کد). خارج از این مرحله: اجرای توصیه‌ها. نکته حیاتی: گزارش باید به‌گونه‌ای باشد که تیم توسعه بتواند بر اساس آن تصمیم‌گیری کند.
**Key terms:** report, recommendation, revert, squash, commit message, production, debugging code, monitoring scripts

**بخش مربوط از متن کاربر:**
```
تمام commit های اخیر دارای پیام یکسان 'Add Inspector Bridge Script' هستند که نشان‌دهنده عدم رعایت conventional commits و احتمال وجود debugging code یا monitoring scripts مشکوک در production است. این pattern غیرطبیعی است.
```

## 🎯 هدف (خلاصه ساختاریافته)
تهیه گزارش جامع از commit‌های مشکوک Inspector Bridge Script و ارائه توصیه‌های اقدام

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/index.html:31-201` — `Inspector Bridge Script` — این اسکریپت کامل Inspector Bridge است که در production (frontend/index.html) قرار دارد. رویدادهای کاربر (کلیک، اسکرول، تایپ، فوکوس) را از طریق postMessage به یک iframe parent ارسال می‌کند. این یک debugging/monitoring script است و نباید در production باشد.
  ```
  <!-- Inspector Bridge Script - Auto-injected -->
  <script>
  (function() {
    console.log('🌉 Inspector Bridge: Script starting...');
  
    // جلوگیری از اجرای چندباره
    if (window.__inspectorBridgeLoaded) {
      console.log('🌉 Inspector Bridge: Already loaded, skipping');
      return;
    }
    window.__inspectorBridgeLoaded = true;
  
    // بررسی اینکه آیا در iframe هستیم
    const isInIframe = window !== window.parent;
    console.log('🌉 Inspector Bridge: In iframe?', isInIframe);
    console.log('🌉 Inspector Bridge: Page URL:', window.location.href);
  
    // تنظیمات
    const DEBOUNCE_MS = 100;
    let lastEventTime = 0;
    let messagesSent = 0;
  
    // تابع ارسال پیام به parent (پنل مدیریت)
    function sendToInspector(action, data) {
      try {
        const message = {
          type: 'inspector-bridge-event',
          action: action,
          target: data.target || '',
          elementInfo: data.elementInfo || '',
          position: data.position || { xPercent: 50, yPercent: 50 },
          pageUrl: window.location.href,
          timestamp: Date.now()
        };
        window.parent.postMessage(message, '*');
        messagesSent++;
        console.log('🌉 Inspector Bridge: Sent message #' + messagesSent, action, data.elementInfo);
      } catch (e) {
        console.warn('Inspector bridge: failed to send message', e);
      }
    }
  
    // ... (ادامه اسکریپت)
  })();
  </script>
  ```
- `frontend/index.html:1-9` — `HTML head` — این بخش ابتدایی فایل index.html است که نشان می‌دهد اسکریپت Inspector Bridge در هدر صفحه و قبل از بسته شدن تگ </head> تزریق شده است. این اسکریپت برای همه کاربران ارسال می‌شود.
  ```
  <!DOCTYPE html>
  <html lang="fa" dir="rtl">
    <head>
      <meta charset="UTF-8" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="اپلیکیشن آموزش لهجه لبنانی با هوش مصنوعی" />
      <title>آموزش لهجه لبنانی</title>
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Stack تشخیص داده شده در بالا = (نامشخص)

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `backend/server.js` (سطر 51) — این فایل فایل‌های استاتیک frontend/dist را سرو می‌کند (خط 51). بنابراین اسکریپت موجود در frontend/index.html برای کاربران نهایی ارسال می‌شود.
- `frontend/vite.config.js` (سطر 1) — این فایل تنظیمات Vite را مشخص می‌کند و proxy برای /api به backend دارد. فایل index.html در پوشه frontend ریشه است و توسط Vite پردازش می‌شود.
- `frontend/src/App.jsx` (سطر 1) — این فایل کامپوننت اصلی React است که درون <div id="root"></div> در index.html رندر می‌شود. اسکریپت Inspector Bridge قبل از این کامپوننت لود می‌شود و می‌تواند رویدادهای داخل App.jsx را نیز مانیتور کند.

## 🌐 نقشهٔ وابستگی‌ها
این تسک مستقیماً بر فایل `frontend/index.html` تأثیر می‌گذارد که فایل اصلی HTML برنامه است. این فایل توسط `backend/server.js` (خط 51) به عنوان static file سرو می‌شود. اسکریپت Inspector Bridge درون این فایل، یک اسکریپت سمت کلاینت است که وابستگی به کتابخانه خاصی ندارد و از Web APIهای استاندارد (postMessage, addEventListener) استفاده می‌کند. حذف این اسکریپت بر عملکرد هیچ کتابخانه یا سرویس دیگری تأثیر نمی‌گذارد، اما ممکن است بر ابزارهای مانیتورینگ خارجی که به این اسکریپت متکی هستند تأثیر بگذارد. کامیت‌های مربوط به این اسکریپت در تاریخچه گیت (b9494e5, 4b6a071, e374c41, f90cee1, d214ff5, 9d61c99, 65ae85c, e16892d) باید مدیریت شوند.

## 🔍 Context و وضعیت فعلی
کاربر درخواست 'ارائه گزارش نهایی و توصیه‌های اقدام' را دارد. این گزارش باید شامل جمع‌بندی تمام یافته‌های مراحل قبل در یک گزارش جامع باشد. گزارش باید شامل: لیست commit‌های مشکوک، تحلیل محتوای فایل‌ها، موارد نقض conventional commits، و وجود debugging/monitoring code. همچنین باید توصیه‌های عملی برای اقدامات بعدی ارائه دهد (مانند revert commit‌ها، squash کردن، بازنویسی پیام‌ها، یا حذف کد). خارج از این مرحله: اجرای توصیه‌ها. نکته حیاتی: گزارش باید به‌گونه‌ای باشد که تیم توسعه بتواند بر اساس آن تصمیم‌گیری کند.

بخش مربوط از درخواست اصلی کاربر: تمام commit های اخیر دارای پیام یکسان 'Add Inspector Bridge Script' هستند که نشان‌دهنده عدم رعایت conventional commits و احتمال وجود debugging code یا monitoring scripts مشکوک در production است. این pattern غیرطبیعی است.

کلیدواژه‌ها: report, recommendation, revert, squash, commit message, production, debugging code, monitoring scripts.

شواهد در کد واقعی پروژه:
- در فایل `frontend/index.html` (خطوط 31-201) یک اسکریپت کامل به نام 'Inspector Bridge Script' وجود دارد که درون تگ `<script>` در هدر صفحه تزریق شده است. این اسکریپت رویدادهای کلیک (click)، اسکرول (scroll)، تایپ (input) و فوکوس (focus) کاربر را از طریق `window.parent.postMessage` به یک پنل مدیریت (inspector panel) ارسال می‌کند. این یک اسکریپت مانیتورینگ و دیباگینگ است.
- تاریخچه کامیت‌ها (آخرین کامیت‌ها) نشان می‌دهد که 5 کامیت متوالی با پیام یکسان '🌉 Add Inspector Bridge Script (JS version)' و یک کامیت با '🌉 Add Inspector Bridge Script for live tracking' وجود دارد. همچنین دو کامیت با عنوان '🔧 Remove Inspector Bridge Script' دیده می‌شود که نشان‌دهنده اضافه و حذف مکرر این اسکریپت است.
- این اسکریپت در production (فایل `frontend/index.html` که به صورت استاتیک سرو می‌شود) وجود دارد و برای کاربران نهایی ارسال می‌شود.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] 1. یک فایل گزارش جامع (مثلاً docs/audit-report.md) در ریشه پروژه ایجاد شود که شامل لیست commit‌های مشکوک، تحلیل محتوای فایل‌ها، موارد نقض conventional commits، و وجود debugging/monitoring code باشد.
- [ ] 2. گزارش شامل حداقل 3 توصیه عملی (revert, squash, حذف کد) با جزئیات اجرایی باشد.
- [ ] 3. پس از تصمیم تیم، اقدام مربوطه (مثلاً حذف اسکریپت از frontend/index.html) در یک کامیت جدید با پیام مناسب انجام شود.
- [ ] 4. پس از اجرای اقدام، اسکریپت Inspector Bridge دیگر در فایل frontend/index.html وجود نداشته باشد و برای کاربران ارسال نشود.
- [ ] 5. تاریخچه کامیت‌ها تمیز شود (مثلاً با squash کردن کامیت‌های مربوطه) تا پیام‌های تکراری و غیراستاندارد حذف شوند.
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. 1. **ایجاد یک گزارش جامع (فایل متنی یا مارک‌داون)**: یک فایل جدید مانند `docs/audit-report.md` در ریشه پروژه ایجاد کن که شامل موارد زیر باشد:
   - **لیست commit‌های مشکوک**: تمام کامیت‌های مربوط به 'Inspector Bridge Script' از تاریخچه (b9494e5, 4b6a071, e374c41, f90cee1, d214ff5, 9d61c99, 65ae85c, e16892d) به همراه هش و پیام.
   - **تحلیل محتوای فایل‌ها**: اشاره به `frontend/index.html` (خطوط 31-201) و توضیح اینکه این اسکریپت یک monitoring/debugging script است که رویدادهای کاربر را به یک iframe parent ارسال می‌کند.
   - **موارد نقض conventional commits**: پیام‌های تکراری 'Add Inspector Bridge Script' بدون توضیح اضافی، و استفاده از ایموجی به جای prefix استاندارد (مثلاً feat:, fix:, chore:).
   - **وجود debugging/monitoring code**: اسکریپت در production فعال است و برای کاربران نهایی ارسال می‌شود.
   - **توصیه‌های عملی**:
     - **گزینه 1 (Revert)**: از کامیت `e16892d` (Remove Inspector Bridge Script) به عنوان پایه استفاده کن و مطمئن شو اسکریپت حذف شده است. سپس کامیت‌های بعدی که دوباره اضافه کرده‌اند را revert کن.
     - **گزینه 2 (Squash)**: تمام کامیت‌های مربوط به این اسکریپت را squash کن به یک کامیت با پیام `chore: remove inspector bridge script from production`.
     - **گزینه 3 (حذف کد)**: مستقیماً کد اسکریپت را از `frontend/index.html` (خطوط 31-201) حذف کن و یک کامیت جدید با پیام `fix: remove debugging script from production` ایجاد کن.
   - **تصمیم‌گیری تیم**: گزارش باید به تیم ارائه شود تا بین گزینه‌های بالا یکی را انتخاب کنند.
2. **اجرای توصیه (پس از تصمیم تیم)**: بسته به انتخاب تیم، یکی از اقدامات بالا را پیاده‌سازی کن.

## 💡 نمونه‌های قبل/بعد
**حذف اسکریپت Inspector Bridge از frontend/index.html**

_قبل:_
```
<!-- Inspector Bridge Script - Auto-injected -->
<script>
(function() {
  console.log('🌉 Inspector Bridge: Script starting...');
  // ... (کل اسکریپت 170 خطی)
})();
</script>
```

_بعد:_
```
<!-- اسکریپت Inspector Bridge حذف شد -->
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `git log --oneline --all | grep -i 'inspector'`
- `grep -r 'inspector-bridge' frontend/index.html`
- `cat docs/audit-report.md (بررسی وجود فایل گزارش)`

## ⚠️ ریسک‌ها و موارد احتیاط
ریسک اصلی این است که اسکریپت Inspector Bridge ممکن است توسط یک ابزار خارجی (مانند یک پنل مدیریت) برای مانیتورینگ استفاده شود. حذف آن ممکن است باعث از کار افتادن آن ابزار شود. همچنین، کامیت‌های متعدد با پیام‌های تکراری نشان‌دهنده عدم انضباط در فرآیند توسعه است و ممکن است نیاز به آموزش تیم در مورد conventional commits داشته باشد. ریسک دیگر این است که اگر این اسکریپت عمداً برای دیباگینگ اضافه شده باشد، حذف آن ممکن است فرآیند دیباگینگ را مختل کند. با این حال، وجود آن در production یک ریسک امنیتی و حریم خصوصی جدی است.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: other
- اولویت: high
- تخمین زمان: small

---

## ✅ معیارهای پذیرش کلی (همهٔ مراحل)
- [ ] 1. لیست کامل commit‌های دارای پیام 'Add Inspector Bridge Script' استخراج شده باشد (حداقل 5 commit).
- [ ] 2. برای هر commit، diff کامل تغییرات در یک فایل جداگانه ذخیره شده باشد.
- [ ] 3. گزارش تحلیلی شامل تعداد commit‌های تکراری، محتوای تغییرات، و ارزیابی خطر تهیه شده باشد.
- [ ] 4. هیچ تغییری در کد پروژه ایجاد نشده باشد (صرفاً تشخیصی).
- [ ] 5. مستندات یافته‌ها در فایل docs/inspector-bridge-audit.md ذخیره شده باشد.
- [ ] 6. پیشنهاد برای رعایت conventional commits در آینده ارائه شده باشد.
- [ ] 1. اسکریپت Inspector Bridge در frontend/index.html (خطوط 31-201) به طور کامل شناسایی و مستند شده باشد.
- [ ] 2. تمام event listeners (click, scroll, input, focus) و تابع sendToInspector بررسی شده باشند.
- [ ] 3. مشخص شود که آیا این اسکریپت به API خارجی متصل است یا خیر (در حال حاضر فقط به window.parent.postMessage ارسال می‌کند).
- [ ] 4. گزارش نهایی شامل الگوهای خطرناک (ارسال داده به سرورهای خارجی، لاگ کردن اطلاعات حساس، تغییر رفتار سیستم) تهیه شود.
- [ ] 5. توصیه‌های امنیتی برای حذف یا غیرفعال کردن اسکریپت در production ارائه شود.
- [ ] ۱. اجرای git log --oneline --format='%h %s' و استخراج حداقل ۱۰۰ commit آخر از تاریخچه پروژه.
- [ ] ۲. اسکن خودکار پیام‌های commit با regex: ^(feat|fix|chore|docs|refactor|test|style|perf|ci|build|revert)(\(.+\))?: .+
- [ ] ۳. شناسایی و لیست کردن تمام commit‌هایی که با الگوی conventional commits مطابقت ندارند، به ویژه commit‌های با پیام 'Add Inspector Bridge Script'.
- [ ] ۴. ارائه گزارش شامل: تعداد کل commit‌های بررسی‌شده، تعداد commit‌های معتبر، تعداد commit‌های نامعتبر، و لیست commit‌های نامعتبر با هش و پیام کامل.
- [ ] ۵. تأیید اینکه commit‌های تکراری 'Add Inspector Bridge Script' (b9494e5, 4b6a071, e374c41, f90cee1, d214ff5, 65ae85c) در لیست نقض‌کنندگان قرار دارند.
- [ ] ۶. ارائه پیشنهاد برای بهبود فرآیند commit در آینده (مانند استفاده از ابزار commitlint یا husky).
- [ ] تأیید شود که اسکریپت Inspector Bridge در frontend/index.html (خطوط 31-201) در production غیرفعال است یا با شرط environment variable (مانند process.env.NODE_ENV !== 'production') محافظت می‌شود.
- [ ] تأیید شود که WebSocket server در backend/server.js خط 45 (مسیر '/ws/live') در production غیرفعال است یا فقط برای اتصالات مجاز باز است.
- [ ] تأیید شود که هیچ console.log در frontend/index.html (خطوط 34, 38, 45, 46, 67, 193, 198, 199) در production وجود ندارد.

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  - بررسی وجود conventional commits در تاریخچه و شناسایی موارد نقض

🔧 مراحل remaining که در super-task باید انجام شوند:
  - بررسی و تحلیل تمام commit‌های اخیر با پیام یکسان — استخراج کامل لیست commit‌ها و ذخیره diffهای هر commit در فایل جداگانه.
  - بررسی محتوای فایل‌های تغییر یافته در commit‌های مشکوک — بررسی کامل تمام event listeners و تابع sendToInspector و تهیه گزارش نهایی شامل الگوهای خطرناک.
  - بررسی احتمال وجود debugging code یا monitoring scripts در production — تأیید نهایی عدم وجود کد اضافی در production از commit‌های مشکوک.
  - ارائه گزارش نهایی و توصیه‌های اقدام — ایجاد فایل گزارش جامع (docs/audit-report.md) شامل لیست commit‌های مشکوک، تحلیل محتوا، موارد نقض conventional commits، وجود debugging/monitoring code و توصیه‌های عملی (revert, squash, حذف کد) با جزئیات اجرایی. همچنین تمیز کردن تاریخچه کامیت‌ها.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 نکات استاندارد (همان bullet هایی که در ساخت پرامپت‌های معمولی پروژه رعایت می‌شود — وراثت کامل، نه کپی):
- ساختار AC ها: acceptance_criteria با verify_method و verify_plan و evidence_locations برای هر AC
- edge cases را در نظر بگیر و در پرامپت ذکر کن
- وابستگی‌ها را اول حل کن (dependency-aware ordering)
- اگر بخشی از یکی از تسک‌ها قبلاً done است (pre_done در بالا)، تکرار نکن — فقط روی remaining_parts تمرکز کن
- در commit message: `merged-from: e4229cce-5083-4ed9-b7d7-4275cf77ec8e, 92c9dd21-d951-426b-9f25-709bbff53ef8`
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

🧬 این یک تسک تلفیقی است — از 2 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): هر دو تسک به طور مستقیم به 'Inspector Bridge' مربوط می‌شوند. تسک اول (e4229cce-5083-4ed9-b7d7-4275cf77ec8e) در مورد جایگزینی مکانیزم ردیابی قدیمی است، در حالی که تسک دوم (92c9dd21-d951-426b-9f25-709bbff53ef8) ممیزی کامیت‌های مربوط به آن را شامل می‌شود. اشتراک فایل‌های 'frontend/index.html' نیز این ارتباط را تقویت می‌کند. این یک پیوند موضوعی و عملیاتی قوی است.
🎯 theme: مدیریت و ممیزی سیستم ردیابی Inspector Bridge
💎 estimated_difficulty: large

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 2
  id: e4229cce-5083-4ed9-b7d7-4275cf77ec8e
  عنوان اصلی: Replace legacy Inspector Bridge tracking with metric sink
  اولویت اصلی: high
  وضعیت verify قبلی: applied_externally_pending_verify
  فایل‌های دخیل: frontend/index.html

📋 acceptance_criteria کامل:
  - ریشه anti-pattern تشخیص داده شد [verify_method=static] [verify_plan={"grep_patterns": ["isInIframe\\s*=\\s*false", "window\\.parent\\.postMessage"], "files_hint": ["frontend/index.html"]}]
  - یا کد اصلاح شد، یا کامنت توجیهی اضافه شد [verify_method=static] [verify_plan={"grep_patterns": ["isInIframe\\s*=\\s*false", "//.*(?:not in iframe|no iframe|skip)"], "files_hint": ["frontend/index.html"]}]
  - تست edge case نوشته شد [verify_method=backend_test] [verify_plan={"test_node": "tests/test_oversight.py::test_no_iframe_skip", "timeout_seconds": 30}]

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
Anti-pattern: Over/under-engineering

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/index.html:30`

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🔍 Context و وضعیت فعلی
اسکریپت Inspector Bridge با وجود اینکه در iframe نیست (isInIframe=false)، همچنان به ارسال پیام به window.parent ادامه می‌دهد. این باعث ایجاد خطاهای بی‌فایده و مصرف منابع می‌شود. بهتر است کل اسکریپت در صورت عدم وجود iframe غیرفعال شود.

📁 file: frontend/index.html (line 30)

🎯 پیشنهاد: این الگو معمولاً منطق سیستم را در شرایط لبه می‌شکند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] ریشه anti-pattern تشخیص داده شد
- [ ] یا کد اصلاح شد، یا کامنت توجیهی اضافه شد
- [ ] تست edge case نوشته شد
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. بازنگری منطق در این نقطه و اضافه‌کردن guard/comment مناسب.

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## ⚠️ ریسک‌ها و موارد احتیاط
پیش از merge، تست‌های موجود اجرا شوند تا رگرشن ایجاد نشود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: bug_fix
- اولویت: high
- تخمین زمان: medium

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  (هیچ مرحله‌ای قبلاً done نشده بود)

🔧 مراحل remaining که در super-task باید انجام شوند:
  (همهٔ مراحل remaining هستند)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 2 از 2
  id: 92c9dd21-d951-426b-9f25-709bbff53ef8
  عنوان اصلی: ممیزی commit‌های Inspector Bridge Script
  اولویت اصلی: medium
  وضعیت verify قبلی: partial
  فایل‌های دخیل: backend/server.js, frontend/index.html

📋 acceptance_criteria کامل:
  - 1. لیست کامل commit‌های دارای پیام 'Add Inspector Bridge Script' استخراج شده باشد (حداقل 5 commit). [verify_method=static] [verify_plan={"grep_patterns": ["Add Inspector Bridge Script"], "files_hint": ["git log output"]}]
  - 2. برای هر commit، diff کامل تغییرات در یک فایل جداگانه ذخیره شده باشد. [verify_method=static] [verify_plan={"grep_patterns": [], "files_hint": ["git diff output for each commit"]}]
  - 3. گزارش تحلیلی شامل تعداد commit‌های تکراری، محتوای تغییرات، و ارزیابی خطر تهیه شده باشد. [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی"}]
  - 4. هیچ تغییری در کد پروژه ایجاد نشده باشد (صرفاً تشخیصی). [verify_method=static] [verify_plan={"grep_patterns": [], "files_hint": ["no changes to project code"]}]
  - 5. مستندات یافته‌ها در فایل docs/inspector-bridge-audit.md ذخیره شده باشد. [verify_method=static] [verify_plan={"grep_patterns": [], "files_hint": ["docs/inspector-bridge-audit.md"]}]
  - 6. پیشنهاد برای رعایت conventional commits در آینده ارائه شده باشد. [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی"}]
  - 1. اسکریپت Inspector Bridge در frontend/index.html (خطوط 31-201) به طور کامل شناسایی و مستند شده باشد. [verify_method=static] [verify_plan={"grep_patterns": ["Inspector Bridge", "sendToInspector"], "files_hint": ["frontend/index.html"]}]
  - 2. تمام event listeners (click, scroll, input, focus) و تابع sendToInspector بررسی شده باشند. [verify_method=static] [verify_plan={"grep_patterns": ["addEventListener", "click", "scroll", "input", "focus", "sendToInspector"], "files_hint": ["frontend/index.html"]}]
  - 3. مشخص شود که آیا این اسکریپت به API خارجی متصل است یا خیر (در حال حاضر فقط به window.parent.postMessage ارسال می‌کند). [verify_method=static] [verify_plan={"grep_patterns": ["postMessage", "window.parent.postMessage"], "files_hint": ["frontend/index.html"]}]
  - 4. گزارش نهایی شامل الگوهای خطرناک (ارسال داده به سرورهای خارجی، لاگ کردن اطلاعات حساس، تغییر رفتار سیستم) تهیه شود. [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی"}]
  - 5. توصیه‌های امنیتی برای حذف یا غیرفعال کردن اسکریپت در production ارائه شود. [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی"}]
  - ۱. اجرای git log --oneline --format='%h %s' و استخراج حداقل ۱۰۰ commit آخر از تاریخچه پروژه. [verify_method=static] [verify_plan={"grep_patterns": [], "files_hint": ["git log output"]}]
  - ۲. اسکن خودکار پیام‌های commit با regex: ^(feat|fix|chore|docs|refactor|test|style|perf|ci|build|revert)(\(.+\))?: .+ [verify_method=static] [verify_plan={"grep_patterns": ["^(feat|fix|chore|docs|refactor|test|style|perf|ci|build|revert)(\\(.+\\))?: .+"], "files_hint": ["git log output"]}]
  - ۳. شناسایی و لیست کردن تمام commit‌هایی که با الگوی conventional commits مطابقت ندارند، به ویژه commit‌های با پیام 'Add Inspector Bridge Script'. [verify_method=static] [verify_plan={"grep_patterns": ["Add Inspector Bridge Script"], "files_hint": ["git log output"]}]
  - ۴. ارائه گزارش شامل: تعداد کل commit‌های بررسی‌شده، تعداد commit‌های معتبر، تعداد commit‌های نامعتبر، و لیست commit‌های نامعتبر با هش و پیام کامل. [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی"}]
  - ۵. تأیید اینکه commit‌های تکراری 'Add Inspector Bridge Script' (b9494e5, 4b6a071, e374c41, f90cee1, d214ff5, 65ae85c) در لیست نقض‌کنندگان قرار دارند. [verify_method=static] [verify_plan={"grep_patterns": ["b9494e5", "4b6a071", "e374c41", "f90cee1", "d214ff5", "65ae85c"], "files_hint": ["git log output"]}]
  - ۶. ارائه پیشنهاد برای بهبود فرآیند commit در آینده (مانند استفاده از ابزار commitlint یا husky). [verify_method=manual_only] [verify_plan={"reason": "نیاز به بازبینی دستی"}]
  - تأیید شود که اسکریپت Inspector Bridge در frontend/index.html (خطوط 31-201) در production غیرفعال است یا با شرط environment variable (مانند process.env.NODE_ENV !== 'production') محافظت می‌شود. [verify_method=static] [verify_plan={"grep_patterns": ["process.env.NODE_ENV", "NODE_ENV !== 'production'"], "files_hint": ["frontend/index.html"]}]
  - تأیید شود که WebSocket server در backend/server.js خط 45 (مسیر '/ws/live') در production غیرفعال است یا فقط برای اتصالات مجاز باز است. [verify_method=static] [verify_plan={"grep_patterns": ["/ws/live", "WebSocket"], "files_hint": ["backend/server.js"]}]
  - تأیید شود که هیچ console.log در frontend/index.html (خطوط 34, 38, 45, 46, 67, 193, 198, 199) در production وجود ندارد. [verify_method=static] [verify_plan={"grep_patterns": ["console.log"], "files_hint": ["frontend/index.html"]}]
  - تأیید شود که GEMINI_API_KEY در backend/server.js خطوط 183, 188, 224, 234 در responseها برگردانده نمی‌شود. [verify_method=static] [verify_plan={"grep_patterns": ["backend", "server", "تأیید", "خطوط", "برگردانده"], "files_hint": []}]
  - تأیید شود که هیچ داده‌ای به دامنه‌های خارجی از طریق window.parent.postMessage یا fetch در frontend/index.html ارسال نمی‌شود. [verify_method=static] [verify_plan={"grep_patterns": ["window", "parent", "fetch", "frontend", "index", "تأیید", "داده", "دامنه"], "files_hint": []}]
  - تأیید شود که commit‌های با پیام 'Add Inspector Bridge Script' (b9494e5, 4b6a071, e374c41, f90cee1, d214ff5) بررسی شده و کد اضافی در production وجود ندارد. [verify_method=static] [verify_plan={"grep_patterns": ["Inspector", "Bridge", "Script", "commit", "b9494e5", "e374c41", "f90cee1", "d214ff5"], "files_hint": []}]
  - 1. یک فایل گزارش جامع (مثلاً docs/audit-report.md) در ریشه پروژه ایجاد شود که شامل لیست commit‌های مشکوک، تحلیل محتوای فایل‌ها، موارد نقض conventional commits، و وجود debugging/monitoring code باشد. [verify_method=static] [verify_plan={"grep_patterns": ["audit", "report", "commit", "conventional", "commits", "debugging", "monitoring", "فایل"], "files_hint": []}]
  - 2. گزارش شامل حداقل 3 توصیه عملی (revert, squash, حذف کد) با جزئیات اجرایی باشد. [verify_method=static] [verify_plan={"grep_patterns": ["revert", "squash", "گزارش", "شامل", "حداقل", "توصیه", "عملی", "جزئیات"], "files_hint": []}]
  - 3. پس از تصمیم تیم، اقدام مربوطه (مثلاً حذف اسکریپت از frontend/index.html) در یک کامیت جدید با پیام مناسب انجام شود. [verify_method=static] [verify_plan={"grep_patterns": ["frontend", "index", "تصمیم", "تیم،", "اقدام", "مربوطه", "مثلاً", "اسکریپت"], "files_hint": []}]
  - 4. پس از اجرای اقدام، اسکریپت Inspector Bridge دیگر در فایل frontend/index.html وجود نداشته باشد و برای کاربران ارسال نشود. [verify_method=static] [verify_plan={"grep_patterns": ["Inspector", "Bridge", "frontend", "index", "اجرای", "اقدام،", "اسکریپت", "دیگر"], "files_hint": []}]
  - 5. تاریخچه کامیت‌ها تمیز شود (مثلاً با squash کردن کامیت‌های مربوطه) تا پیام‌های تکراری و غیراستاندارد حذف شوند. [verify_method=static] [verify_plan={"grep_patterns": ["squash", "تاریخچه", "کامیت", "تمیز", "مثلاً", "کردن", "مربوطه", "پیام"], "files_hint": []}]

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
تمام commit های اخیر دارای پیام یکسان 'Add Inspector Bridge Script' هستند که نشان‌دهنده عدم رعایت conventional commits و احتمال وجود debugging code یا monitoring scripts مشکوک در production است. این pattern غیرطبیعی است.
```

## 📋 چک‌لیست مراحل (5 مرحله)

این تسک به مراحل کوچک‌تر تقسیم شده. **در هر verify خودکار، وضعیت هر مرحله به‌صورت `[ ]` (انجام نشده)، `[~]` (ناقص)، یا `[x]` (انجام شده) به‌روز می‌شود.**
وقتی تمام مراحل `[x]` شدند، تسک به‌طور خودکار به «انجام شده» منتقل می‌شود.

- [~] **مرحله 1: بررسی و تحلیل تمام commit‌های اخیر با پیام یکسان** — این مرحله شامل بررسی کامل تاریخچه commit‌های اخیر (مثلاً ۳۰ روز گذشته یا ۵۰ commit آخر) در مخزن فعلی است. باید تمام commit‌هایی که پیام 'Add Inspector Bridge Script' دارند شناسایی شوند. این مرحله شامل تحلیل محتوای تغییرات (diff) هر commit برای یافتن debugging code، monitoring scripts، یا هر کد مشکوک
- [~] **مرحله 2: بررسی محتوای فایل‌های تغییر یافته در commit‌های مشکوک** — این مرحله شامل بررسی دقیق محتوای فایل‌هایی است که در commit‌های با پیام 'Add Inspector Bridge Script' تغییر کرده‌اند. باید مشخص شود که آیا این فایل‌ها حاوی اسکریپت‌های مانیتورینگ، debugging code، یا دسترسی به API‌های خارجی هستند. خارج از این مرحله: اجرای اسکریپت‌ها یا تغییر آنها. نکته حیاتی: تمرکز ب
- [x] **مرحله 3: بررسی وجود conventional commits در تاریخچه و شناسایی موارد نقض** — این مرحله شامل بررسی تمام commit‌های اخیر (مثلاً ۱۰۰ commit آخر) برای اطمینان از رعایت استاندارد conventional commits (مانند feat:, fix:, chore:, docs:, refactor:, test:). باید commit‌هایی که از این استاندارد پیروی نمی‌کنند شناسایی و لیست شوند. خارج از این مرحله: اصلاح commit‌ها یا بازنویسی تاریخچه.
- [~] **مرحله 4: بررسی احتمال وجود debugging code یا monitoring scripts در production** — این مرحله شامل تحلیل عمیق‌تر کد موجود در commit‌های مشکوک برای یافتن الگوهای رایج debugging code (مانند console.log, print, var_dump, debugger) یا monitoring scripts (مانند ارسال داده به endpoint خارجی، tracking pixels, analytics بدون consent). خارج از این مرحله: حذف کد یا تغییر آن. نکته حیاتی: باید
- [~] **مرحله 5: ارائه گزارش نهایی و توصیه‌های اقدام** — این مرحله شامل جمع‌بندی تمام یافته‌های مراحل قبل در یک گزارش جامع است. گزارش باید شامل: لیست commit‌های مشکوک، تحلیل محتوای فایل‌ها، موارد نقض conventional commits، و وجود debugging/monitoring code. همچنین باید توصیه‌های عملی برای اقدامات بعدی ارائه دهد (مانند revert commit‌ها، squash کردن، بازنویسی

---

# 🔹 مرحله 1: بررسی و تحلیل تمام commit‌های اخیر با پیام یکسان

**Scope:** این مرحله شامل بررسی کامل تاریخچه commit‌های اخیر (مثلاً ۳۰ روز گذشته یا ۵۰ commit آخر) در مخزن فعلی است. باید تمام commit‌هایی که پیام 'Add Inspector Bridge Script' دارند شناسایی شوند. این مرحله شامل تحلیل محتوای تغییرات (diff) هر commit برای یافتن debugging code، monitoring scripts، یا هر کد مشکوک دیگر است. خارج از این مرحله: اصلاح commit‌ها، حذف کد، یا تغییر تاریخچه. نکته حیاتی: این مرحله صرفاً تشخیصی است و هیچ تغییری در کد ایجاد نمی‌کند.
**Key terms:** commit, Add Inspector Bridge Script, conventional commits, debugging code, monitoring scripts, production

**بخش مربوط از متن کاربر:**
```
تمام commit های اخیر دارای پیام یکسان 'Add Inspector Bridge Script' هستند که نشان‌دهنده عدم رعایت conventional commits و احتمال وجود debugging code یا monitoring scripts مشکوک در production است. این pattern غیرطبیعی است.
```

## 🎯 هدف (خلاصه ساختاریافته)
تحلیل و مستندسازی commit‌های تکراری 'Add Inspector Bridge Script' در تاریخچه مخزن

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/index.html:31-201` — `Inspector Bridge Script (IIFE)` — این اسکریپت کامل Inspector Bridge است که در frontend/index.html تزریق شده. رویدادهای click, scroll, input, focus کاربر را رهگیری کرده و از طریق postMessage به parent (پنل مدیریت) ارسال می‌کند. این کد در 5 commit متوالی با پیام یکسان اضافه شده است.
  ```
  <!-- Inspector Bridge Script - Auto-injected -->
  <script>
  (function() {
    console.log('🌉 Inspector Bridge: Script starting...');
  
    // جلوگیری از اجرای چندباره
    if (window.__inspectorBridgeLoaded) {
      console.log('🌉 Inspector Bridge: Already loaded, skipping');
      return;
    }
    window.__inspectorBridgeLoaded = true;
  
    // بررسی اینکه آیا در iframe هستیم
    const isInIframe = window !== window.parent;
    console.log('🌉 Inspector Bridge: In iframe?', isInIframe);
    console.log('🌉 Inspector Bridge: Page URL:', window.location.href);
  
    // تنظیمات
    const DEBOUNCE_MS = 100;
    let lastEventTime = 0;
    let messagesSent = 0;
  
    // تابع ارسال پیام به parent (پنل مدیریت)
    function sendToInspector(action, data) {
      try {
        const message = {
          type: 'inspector-bridge-event',
          action: action,
          target: data.target || '',
          elementInfo: data.elementInfo || '',
          position: data.position || { xPercent: 50, yPercent: 50 },
          pageUrl: window.location.href,
          timestamp: Date.now()
        };
        window.parent.postMessage(message, '*');
        messagesSent++;
        console.log('🌉 Inspector Bridge: Sent message #' + messagesSent, action, data.elementInfo);
      } catch (e) {
        console.warn('Inspector bridge: failed to send message', e);
      }
    }
  ```
- `frontend/index.html:136-144` — `click event listener` — رهگیری کلیک‌های کاربر با ارسال اطلاعات المنت و موقعیت به پنل مدیریت. این یک monitoring script است که در production اجرا می‌شود.
  ```
  // کلیک
    document.addEventListener('click', function(e) {
      if (!shouldSend()) return;
      sendToInspector('click', {
        target: e.target?.tagName,
        elementInfo: getElementInfo(e.target),
        position: getPositionPercent(e)
      });
    }, true);
  ```
- `frontend/index.html:146-159` — `scroll event listener` — رهگیری اسکرول کاربر با ارسال درصد موقعیت اسکرول. این داده‌ها به پنل مدیریت ارسال می‌شود.
  ```
  // اسکرول
    let scrollTimeout;
    document.addEventListener('scroll', function(e) {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(function() {
        sendToInspector('scroll', {
          elementInfo: 'صفحه',
          position: {
            xPercent: (window.scrollX / (document.body.scrollWidth - window.innerWidth)) * 100 || 0,
            yPercent: (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100 || 0
          }
        });
      }, 200);
    }, true);
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Stack شناسایی‌شده: JavaScript (ES6+), Express.js (backend), React 18 (frontend), Vite (build tool), Tailwind CSS, Firebase (احراز هویت), WebSocket (ws), Gemini API, ffmpeg. اسکریپت Inspector Bridge از vanilla JavaScript استفاده می‌کند و وابستگی به فریم‌ورک خاصی ندارد.

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `backend/server.js` (سطر 51) — سرور بک‌اند که فایل‌های استاتیک frontend/dist را سرو می‌کند (خط 51). این اسکریپت در production از طریق همین مسیر اجرا می‌شود.
- `frontend/vite.config.js` (سطر 12) — تنظیمات Vite که build نهایی را در frontend/dist قرار می‌دهد. اسکریپت Inspector Bridge در index.html نهایی قرار دارد و در build نهایی وجود خواهد داشت.
- `frontend/src/App.jsx` (سطر 1) — کامپوننت اصلی React که درون #root رندر می‌شود. اسکریپت Inspector Bridge در index.html قبل از mount شدن React اجرا می‌شود و رویدادهای داخل App.jsx را نیز رهگیری می‌کند.
- `render.yaml` (سطر 1) — فایل کانفیگ deployment که مشخص می‌کند این اپلیکیشن در production چگونه مستقر می‌شود. اسکریپت Inspector Bridge در production فعال خواهد بود.

## 🌐 نقشهٔ وابستگی‌ها
این تسک صرفاً تشخیصی است و نیازی به تغییر کد ندارد. اما اسکریپت Inspector Bridge در frontend/index.html (خطوط 31-201) به صورت مستقیم در HTML تزریق شده و وابسته به هیچ ماژول خارجی نیست. این اسکریپت از طریق window.parent.postMessage با پنل مدیریت ارتباط برقرار می‌کند. فایل‌های backend/server.js (خط 51) و frontend/vite.config.js (خط 12) در فرآیند build و deployment نقش دارند و اسکریپت مذکور در build نهایی قرار می‌گیرد. فایل frontend/src/App.jsx به صورت غیرمستقیم تحت تأثیر است زیرا رویدادهای داخل آن توسط این اسکریپت رهگیری می‌شود.

## 🔍 Context و وضعیت فعلی
بررسی و تحلیل تمام commit‌های اخیر با پیام یکسان 'Add Inspector Bridge Script' در مخزن فعلی. این درخواست شامل تحلیل کامل تاریخچه commit‌های اخیر (مثلاً ۳۰ روز گذشته یا ۵۰ commit آخر) است. باید تمام commit‌هایی که پیام 'Add Inspector Bridge Script' دارند شناسایی شوند. این مرحله شامل تحلیل محتوای تغییرات (diff) هر commit برای یافتن debugging code، monitoring scripts، یا هر کد مشکوک دیگر است. خارج از این مرحله: اصلاح commit‌ها، حذف کد، یا تغییر تاریخچه. نکته حیاتی: این مرحله صرفاً تشخیصی است و هیچ تغییری در کد ایجاد نمی‌کند.

--- بخش مربوط از درخواست اصلی کاربر ---
تمام commit های اخیر دارای پیام یکسان 'Add Inspector Bridge Script' هستند که نشان‌دهنده عدم رعایت conventional commits و احتمال وجود debugging code یا monitoring scripts مشکوک در production است. این pattern غیرطبیعی است.

--- کلیدواژه‌ها ---
commit, Add Inspector Bridge Script, conventional commits, debugging code, monitoring scripts, production

شواهد در کد واقعی پروژه: در فایل frontend/index.html از خط 31 تا 201 یک اسکریپت کامل به نام 'Inspector Bridge Script' وجود دارد که رویدادهای کلیک، اسکرول، تایپ و فوکوس کاربر را از طریق window.parent.postMessage به یک پنل مدیریت ارسال می‌کند. این اسکریپت در 5 commit متوالی (b9494e5, 4b6a071, e374c41, f90cee1, d214ff5) با پیام یکسان اضافه شده است. همچنین commit‌های 9d61c99 و e16892d این اسکریپت را حذف کرده‌اند که نشان‌دهنده سردرگمی در مدیریت این کد است.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] 1. لیست کامل commit‌های دارای پیام 'Add Inspector Bridge Script' استخراج شده باشد (حداقل 5 commit).
- [ ] 2. برای هر commit، diff کامل تغییرات در یک فایل جداگانه ذخیره شده باشد.
- [ ] 3. گزارش تحلیلی شامل تعداد commit‌های تکراری، محتوای تغییرات، و ارزیابی خطر تهیه شده باشد.
- [ ] 4. هیچ تغییری در کد پروژه ایجاد نشده باشد (صرفاً تشخیصی).
- [ ] 5. مستندات یافته‌ها در فایل docs/inspector-bridge-audit.md ذخیره شده باشد.
- [ ] 6. پیشنهاد برای رعایت conventional commits در آینده ارائه شده باشد.
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. مرحله ۱: اجرای دستور git log --oneline --since="30 days ago" یا git log --oneline -50 برای استخراج لیست commit‌های اخیر.
مرحله ۲: فیلتر کردن commit‌هایی که پیام آن‌ها دقیقاً 'Add Inspector Bridge Script' است.
مرحله ۳: برای هر commit شناسایی‌شده، دستور git diff <commit-hash>^! را اجرا کرده و خروجی را در فایل‌های جداگانه ذخیره کن.
مرحله ۴: تحلیل diff هر commit برای یافتن:
   - کدهای debugging (مانند console.log اضافی، alert، debugger)
   - monitoring scripts (مانند ارسال داده به سرور خارجی)
   - کدهای تکراری یا متناقض بین commit‌ها
مرحله ۵: مستندسازی یافته‌ها در یک فایل گزارش (مثلاً docs/inspector-bridge-audit.md) بدون تغییر در کد.
مرحله ۶: بررسی فایل frontend/index.html (خطوط 31-201) برای تطبیق با diffهای استخراج‌شده.
مرحله ۷: ارائه گزارش نهایی شامل:
   - تعداد commit‌های تکراری
   - محتوای تغییرات هر commit
   - ارزیابی خطر (risk assessment) برای production
   - پیشنهاد برای رعایت conventional commits در آینده

## 💡 نمونه‌های قبل/بعد
**تغییرات commit‌های تکراری (نمونه diff)**

_قبل:_
```
frontend/index.html قبل از commit b9494e5:
(بدون اسکریپت Inspector Bridge - فقط تگ‌های استاندارد HTML)
```

_بعد:_
```
frontend/index.html بعد از commit b9494e5:
(اضافه شدن اسکریپت Inspector Bridge از خط 31 تا 201 با تمام event listeners)
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `git log --oneline --grep="Add Inspector Bridge Script"`
- `git log --oneline -50`
- `git diff b9494e5^! > /tmp/commit_b9494e5.diff`
- `git diff 4b6a071^! > /tmp/commit_4b6a071.diff`
- `git diff e374c41^! > /tmp/commit_e374c41.diff`
- `git diff f90cee1^! > /tmp/commit_f90cee1.diff`
- `git diff d214ff5^! > /tmp/commit_d214ff5.diff`
- `git diff 9d61c99^! > /tmp/commit_9d61c99.diff`
- `git diff e16892d^! > /tmp/commit_e16892d.diff`

## ⚠️ ریسک‌ها و موارد احتیاط
این تسک صرفاً تشخیصی است و خطری برای کدبیس ندارد. اما اسکریپت Inspector Bridge موجود در frontend/index.html (خطوط 31-201) یک risk امنیتی جدی است: (1) تمام رویدادهای کاربر (کلیک، اسکرول، تایپ، فوکوس) را به یک پنل مدیریت خارجی ارسال می‌کند که نقض حریم خصوصی کاربران است. (2) از window.parent.postMessage با target '*' استفاده می‌کند که امکان شنود توسط هر iframe والد را فراهم می‌کند. (3) این اسکریپت در production فعال است و هیچ شرطی برای غیرفعال شدن در محیط production ندارد. (4) تابع sendToInspector اطلاعات حساس مانند pageUrl و محتوای المنت‌ها را ارسال می‌کند.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: other
- اولویت: medium
- تخمین زمان: small

---

# 🔹 مرحله 2: بررسی محتوای فایل‌های تغییر یافته در commit‌های مشکوک

**Scope:** این مرحله شامل بررسی دقیق محتوای فایل‌هایی است که در commit‌های با پیام 'Add Inspector Bridge Script' تغییر کرده‌اند. باید مشخص شود که آیا این فایل‌ها حاوی اسکریپت‌های مانیتورینگ، debugging code، یا دسترسی به API‌های خارجی هستند. خارج از این مرحله: اجرای اسکریپت‌ها یا تغییر آنها. نکته حیاتی: تمرکز بر شناسایی الگوهای خطرناک مانند ارسال داده به سرورهای خارجی، لاگ کردن اطلاعات حساس، یا تغییر رفتار سیستم.
**Key terms:** Add Inspector Bridge Script, debugging code, monitoring scripts, production, API, external server

**بخش مربوط از متن کاربر:**
```
تمام commit های اخیر دارای پیام یکسان 'Add Inspector Bridge Script' هستند که نشان‌دهنده عدم رعایت conventional commits و احتمال وجود debugging code یا monitoring scripts مشکوک در production است.
```

## 🎯 هدف (خلاصه ساختاریافته)
بررسی و تحلیل اسکریپت‌های مانیتورینگ (Inspector Bridge Script) در commit‌های اخیر

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/index.html:31-201` — `Inspector Bridge Script` — این اسکریپت کامل Inspector Bridge است که در frontend/index.html تزریق شده. تمام تعاملات کاربر را به parent iframe ارسال می‌کند.
  ```
  31: <!-- Inspector Bridge Script - Auto-injected -->
  32: <script>
  33: (function() {
  34:   console.log('🌉 Inspector Bridge: Script starting...');
  35: 
  36:   // جلوگیری از اجرای چندباره
  37:   if (window.__inspectorBridgeLoaded) {
  38:     console.log('🌉 Inspector Bridge: Already loaded, skipping');
  39:     return;
  40:   }
  41:   window.__inspectorBridgeLoaded = true;
  42: 
  43:   // بررسی اینکه آیا در iframe هستیم
  44:   const isInIframe = window !== window.parent;
  45:   console.log('🌉 Inspector Bridge: In iframe?', isInIframe);
  46:   console.log('🌉 Inspector Bridge: Page URL:', window.location.href);
  47: 
  48:   // تنظیمات
  49:   const DEBOUNCE_MS = 100;
  50:   let lastEventTime = 0;
  51:   let messagesSent = 0;
  52: 
  53:   // تابع ارسال پیام به parent (پنل مدیریت)
  54:   function sendToInspector(action, data) {
  55:     try {
  56:       const message = {
  57:         type: 'inspector-bridge-event',
  58:         action: action,
  59:         target: data.target || '',
  60:         elementInfo: data.elementInfo || '',
  61:         position: data.position || { xPercent: 50, yPercent: 50 },
  62:         pageUrl: window.location.href,
  63:         timestamp: Date.now()
  64:       };
  65:       window.parent.postMessage(message, '*');
  66:       messagesSent++;
  67:       console.log('🌉 Inspector Bridge: Sent message #' + messagesSent, action, data.elementInfo);
  68:     } catch (e) {
  69:       console.warn('Inspector bridge: failed to send message', e);
  70:     }
  71:   }
  ```
- `frontend/index.html:137-144` — `click event listener` — Event listener برای کلیک که اطلاعات کلیک را به parent ارسال می‌کند.
  ```
  137:   // کلیک
  138:   document.addEventListener('click', function(e) {
  139:     if (!shouldSend()) return;
  140:     sendToInspector('click', {
  141:       target: e.target?.tagName,
  142:       elementInfo: getElementInfo(e.target),
  143:       position: getPositionPercent(e)
  144:     });
  145:   }, true);
  ```
- `frontend/index.html:148-159` — `scroll event listener` — Event listener برای اسکرول که موقعیت اسکرول را به parent ارسال می‌کند.
  ```
  148:   // اسکرول
  149:   let scrollTimeout;
  150:   document.addEventListener('scroll', function(e) {
  151:     clearTimeout(scrollTimeout);
  152:     scrollTimeout = setTimeout(function() {
  153:       sendToInspector('scroll', {
  154:         elementInfo: 'صفحه',
  155:         position: {
  156:           xPercent: (window.scrollX / (document.body.scrollWidth - window.innerWidth)) * 100 || 0,
  157:           yPercent: (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100 || 0
  158:         }
  159:       });
  160:     }, 200);
  161:   }, true);
  ```
- `frontend/index.html:162-171` — `input event listener` — Event listener برای input که اطلاعات فیلدهای ورودی را به parent ارسال می‌کند.
  ```
  162:   // تایپ در فیلدها
  163:   document.addEventListener('input', function(e) {
  164:     if (!shouldSend()) return;
  165:     if (e.target?.tagName === 'INPUT' || e.target?.tagName === 'TEXTAREA') {
  166:       sendToInspector('input', {
  167:         target: e.target?.tagName,
  168:         elementInfo: getElementInfo(e.target),
  169:         position: { xPercent: 50, yPercent: 50 }
  170:       });
  171:     }
  172:   }, true);
  ```
- `frontend/index.html:186-196` — `inspector-bridge-ready message` — پیام آماده بودن که به parent ارسال می‌شود.
  ```
  186:   // اعلام آماده بودن
  187:   try {
  188:     window.parent.postMessage({
  189:       type: 'inspector-bridge-ready',
  190:       pageUrl: window.location.href,
  191:       isInIframe: isInIframe,
  192:       timestamp: Date.now()
  193:     }, '*');
  194:     console.log('🌉 Inspector Bridge: Ready message sent to parent');
  195:   } catch (readyErr) {
  196:     console.warn('🌉 Inspector Bridge: Failed to send ready message', readyErr);
  197:   }
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Stack تشخیص داده شده: JavaScript (ES6+), React (از طریق Vite), Express (backend), WebSocket (ws), Firebase (احتمالی). اسکریپت Inspector Bridge به صورت pure JavaScript نوشته شده و از هیچ کتابخانه خارجی استفاده نمی‌کند.

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `frontend/index.html` (سطر 31) — فایل اصلی که اسکریپت Inspector Bridge در آن تزریق شده است. تمام event listeners و تابع sendToInspector در این فایل قرار دارند.
- `frontend/src/App.jsx` (سطر 1) — کامپوننت اصلی React که ممکن است تحت تأثیر اسکریپت Inspector Bridge قرار گیرد. اگر App.jsx در iframe بارگذاری شود، اسکریپت فعال می‌شود.
- `frontend/src/main.jsx` (سطر 1) — نقطه ورود React که App.jsx را رندر می‌کند. ممکن است اسکریپت Inspector Bridge قبل از بارگذاری React اجرا شود.
- `backend/server.js` (سطر 1) — سرور backend که ممکن است برای دریافت داده‌های ارسالی از Inspector Bridge استفاده شود. در حال حاضر هیچ endpoint خاصی برای این کار وجود ندارد.
- `render.yaml` (سطر 1) — فایل کانفیگ deployment که ممکن است شامل تنظیمات مربوط به iframe یا proxy باشد.

## 🌐 نقشهٔ وابستگی‌ها
اسکریپت Inspector Bridge در frontend/index.html (خطوط 31-201) به صورت مستقیم به هیچ فایل دیگری وابسته نیست و به صورت خودکار در HTML تزریق شده است. این اسکریپت از window.parent.postMessage برای ارسال داده به parent iframe استفاده می‌کند. event listeners (click, scroll, input, focus) به document اضافه شده‌اند و تمام تعاملات کاربر را مانیتور می‌کنند. تابع sendToInspector (خط 54) داده‌ها را به صورت JSON با ساختار مشخص به parent ارسال می‌کند. اسکریپت از debounce (DEBOUNCE_MS = 100) برای کاهش تعداد پیام‌ها استفاده می‌کند. هیچ وابستگی به کتابخانه‌های خارجی ندارد و به صورت pure JavaScript نوشته شده است.

## 🔍 Context و وضعیت فعلی
بر اساس درخواست کاربر، نیاز به بررسی دقیق محتوای فایل‌هایی است که در commit‌های با پیام 'Add Inspector Bridge Script' تغییر کرده‌اند. این commit‌ها شامل: b9494e5, 4b6a071, e374c41, f90cee1, d214ff5, 65ae85c هستند. کاربر خواسته است که مشخص شود آیا این فایل‌ها حاوی اسکریپت‌های مانیتورینگ، debugging code، یا دسترسی به API‌های خارجی هستند. نکته حیاتی: تمرکز بر شناسایی الگوهای خطرناک مانند ارسال داده به سرورهای خارجی، لاگ کردن اطلاعات حساس، یا تغییر رفتار سیستم. خارج از این مرحله: اجرای اسکریپت‌ها یا تغییر آنها. کلیدواژه‌های اصلی: Add Inspector Bridge Script, debugging code, monitoring scripts, production, API, external server.

شواهد در کد واقعی پروژه:
- در فایل frontend/index.html (خطوط 31-201) یک اسکریپت کامل با عنوان 'Inspector Bridge Script' وجود دارد که:
  - در خط 34: `console.log('🌉 Inspector Bridge: Script starting...');`
  - در خط 44: `const isInIframe = window !== window.parent;`
  - در خط 54-71: تابع `sendToInspector` که با `window.parent.postMessage` داده‌ها را ارسال می‌کند.
  - در خطوط 137-144: Event listener برای کلیک که اطلاعات کلیک را به parent ارسال می‌کند.
  - در خطوط 148-159: Event listener برای اسکرول.
  - در خطوط 162-171: Event listener برای input.
  - در خطوط 174-183: Event listener برای focus.
  - در خطوط 186-196: ارسال پیام 'inspector-bridge-ready'.

این اسکریپت به وضوح یک monitoring/debugging script است که تمام تعاملات کاربر (کلیک، اسکرول، تایپ، فوکوس) را به یک iframe parent ارسال می‌کند. این رفتار در production می‌تواند خطرناک باشد زیرا اطلاعات حساس کاربر را بدون رضایت به سرورهای خارجی ارسال می‌کند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] 1. اسکریپت Inspector Bridge در frontend/index.html (خطوط 31-201) به طور کامل شناسایی و مستند شده باشد.
- [ ] 2. تمام event listeners (click, scroll, input, focus) و تابع sendToInspector بررسی شده باشند.
- [ ] 3. مشخص شود که آیا این اسکریپت به API خارجی متصل است یا خیر (در حال حاضر فقط به window.parent.postMessage ارسال می‌کند).
- [ ] 4. گزارش نهایی شامل الگوهای خطرناک (ارسال داده به سرورهای خارجی، لاگ کردن اطلاعات حساس، تغییر رفتار سیستم) تهیه شود.
- [ ] 5. توصیه‌های امنیتی برای حذف یا غیرفعال کردن اسکریپت در production ارائه شود.
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. 1. بررسی کامل اسکریپت Inspector Bridge در frontend/index.html (خطوط 31-201) برای شناسایی الگوهای خطرناک.
2. شناسایی اینکه آیا این اسکریپت به API خارجی متصل است یا خیر (در حال حاضر فقط به window.parent.postMessage ارسال می‌کند).
3. بررسی commit‌های مرتبط (b9494e5, 4b6a071, e374c41, f90cee1, d214ff5, 65ae85c) برای مشاهده تغییرات دقیق.
4. مستندسازی الگوهای خطرناک مانند:
   - ارسال داده به سرورهای خارجی (از طریق postMessage)
   - لاگ کردن اطلاعات حساس (console.log)
   - تغییر رفتار سیستم (مانند debounce و event listeners)
5. ارائه گزارش نهایی با توصیه‌های امنیتی.

## 💡 نمونه‌های قبل/بعد
**Inspector Bridge Script - تابع sendToInspector**

_قبل:_
```
function sendToInspector(action, data) {
  try {
    const message = {
      type: 'inspector-bridge-event',
      action: action,
      target: data.target || '',
      elementInfo: data.elementInfo || '',
      position: data.position || { xPercent: 50, yPercent: 50 },
      pageUrl: window.location.href,
      timestamp: Date.now()
    };
    window.parent.postMessage(message, '*');
    messagesSent++;
    console.log('🌉 Inspector Bridge: Sent message #' + messagesSent, action, data.elementInfo);
  } catch (e) {
    console.warn('Inspector bridge: failed to send message', e);
  }
}
```

_بعد:_
```
// این تابع باید حذف شود یا با یک تابع امن جایگزین شود که داده‌های حساس را ارسال نکند.
// پیشنهاد: حذف کامل اسکریپت Inspector Bridge از production.
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `grep -r 'Inspector Bridge' frontend/index.html`
- `grep -r 'sendToInspector' frontend/index.html`
- `grep -r 'inspector-bridge' frontend/index.html`
- `git log --oneline | grep 'Add Inspector Bridge Script'`
- `git show b9494e5 --stat`
- `git show 4b6a071 --stat`
- `git show e374c41 --stat`
- `git show f90cee1 --stat`
- `git show d214ff5 --stat`
- `git show 65ae85c --stat`

## ⚠️ ریسک‌ها و موارد احتیاط
این اسکریپت Inspector Bridge در frontend/index.html (خطوط 31-201) یک risk امنیتی جدی است زیرا:
1. تمام تعاملات کاربر (کلیک، اسکرول، تایپ، فوکوس) را به parent iframe ارسال می‌کند (خطوط 137-183).
2. از window.parent.postMessage با target '*' استفاده می‌کند که به هر parent اجازه دریافت داده را می‌دهد (خط 65).
3. اطلاعات حساس مانند pageUrl و elementInfo را لاگ می‌کند (خط 67).
4. اگر این اسکریپت در production فعال باشد، می‌تواند حریم خصوصی کاربران را نقض کند.
5. هیچ مکانیزم احراز هویت یا مجوز برای ارسال داده وجود ندارد.
6. اسکریپت به صورت خودکار در HTML تزریق شده و بدون اطلاع کاربر اجرا می‌شود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: high
- تخمین زمان: medium

---

# 🔹 مرحله 3: بررسی وجود conventional commits در تاریخچه و شناسایی موارد نقض

**Scope:** این مرحله شامل بررسی تمام commit‌های اخیر (مثلاً ۱۰۰ commit آخر) برای اطمینان از رعایت استاندارد conventional commits (مانند feat:, fix:, chore:, docs:, refactor:, test:). باید commit‌هایی که از این استاندارد پیروی نمی‌کنند شناسایی و لیست شوند. خارج از این مرحله: اصلاح commit‌ها یا بازنویسی تاریخچه. نکته حیاتی: تمرکز بر commit‌های با پیام تکراری و غیراستاندارد مانند 'Add Inspector Bridge Script'.
**Key terms:** conventional commits, commit message, Add Inspector Bridge Script, feat:, fix:, chore:

**بخش مربوط از متن کاربر:**
```
تمام commit های اخیر دارای پیام یکسان 'Add Inspector Bridge Script' هستند که نشان‌دهنده عدم رعایت conventional commits و احتمال وجود debugging code یا monitoring scripts مشکوک در production است.
```

## 🎯 هدف (خلاصه ساختاریافته)
بررسی و گزارش نقض استاندارد Conventional Commits در تاریخچه پروژه

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/index.html:31-201` — `Inspector Bridge Script` — این فایل deep-read شده است. اسکریپت Inspector Bridge در production (index.html) تزریق شده و commit‌های مرتبط با آن تکراری و غیراستاندارد هستند.
  ```
  <!-- Inspector Bridge Script - Auto-injected -->
  <script>
  (function() {
    console.log('🌉 Inspector Bridge: Script starting...');
  
    // جلوگیری از اجرای چندباره
    if (window.__inspectorBridgeLoaded) {
      console.log('🌉 Inspector Bridge: Already loaded, skipping');
      return;
    }
    window.__inspectorBridgeLoaded = true;
  
    // بررسی اینکه آیا در iframe هستیم
    const isInIframe = window !== window.parent;
    console.log('🌉 Inspector Bridge: In iframe?', isInIframe);
    console.log('🌉 Inspector Bridge: Page URL:', window.location.href);
  
    // تنظیمات
    const DEBOUNCE_MS = 100;
    let lastEventTime = 0;
    let messagesSent = 0;
  
    // تابع ارسال پیام به parent (پنل مدیریت)
    function sendToInspector(action, data) {
      try {
        const message = {
          type: 'inspector-bridge-event',
          action: action,
          target: data.target || '',
          elementInfo: data.elementInfo || '',
          position: data.position || { xPercent: 50, yPercent: 50 },
          pageUrl: window.location.href,
          timestamp: Date.now()
        };
        window.parent.postMessage(message, '*');
        messagesSent++;
        console.log('🌉 Inspector Bridge: Sent message #' + messagesSent, action, data.elementInfo);
      } catch (e) {
        console.warn('Inspector bridge: failed to send message', e);
      }
    }
  ```
- `backend/server.js:1-1403` — `کل فایل` — فایل اصلی backend. commit‌های مرتبط با تغییرات آن باید دارای پیام‌های استاندارد باشند.
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
Stack تشخیص داده شده: JavaScript (زبان اصلی پروژه). ابزارهای مرتبط: git برای بررسی تاریخچه، conventional commits استاندارد. پروژه از React (frontend) و Express.js (backend) استفاده می‌کند.

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `frontend/index.html` (سطر 31) — این فایل حاوی Inspector Bridge Script است که commit‌های تکراری 'Add Inspector Bridge Script' به آن اشاره دارند. بررسی commit‌های مرتبط با این فایل ضروری است.
- `backend/server.js` (سطر 1) — فایل اصلی backend که commit‌های آن باید با conventional commits مطابقت داشته باشند. commit‌های اخیر این فایل باید بررسی شوند.
- `frontend/src/App.jsx` (سطر 1) — فایل اصلی frontend که commit‌های مرتبط با آن باید بررسی شوند. این فایل deep-read نشده است.
- `frontend/src/main.jsx` (سطر 1) — فایل ورودی frontend که commit‌های مرتبط با آن باید بررسی شوند. این فایل deep-read نشده است.
- `render.yaml` (سطر 1) — فایل کانفیگ deployment که commit‌های مرتبط با آن باید بررسی شوند. این فایل deep-read نشده است.

## 🌐 نقشهٔ وابستگی‌ها
این تسک به فایل‌های کد منبع وابسته نیست، بلکه به تاریخچه git پروژه وابسته است. فایل‌های اصلی که commit‌های آن‌ها باید بررسی شوند عبارتند از: frontend/index.html (خطوط 31-201 برای Inspector Bridge Script)، backend/server.js (کل فایل)، frontend/src/App.jsx، frontend/src/main.jsx، render.yaml. همچنین فایل‌های package.json و package-lock.json در هر دو بخش frontend و backend ممکن است commit‌های مرتبط داشته باشند. commit‌های تکراری 'Add Inspector Bridge Script' مستقیماً به فایل frontend/index.html مربوط می‌شوند.

## 🔍 Context و وضعیت فعلی
کاربر درخواست بررسی وجود conventional commits در تاریخچه و شناسایی موارد نقض را داده است. این مرحله شامل بررسی تمام commit‌های اخیر (مثلاً ۱۰۰ commit آخر) برای اطمینان از رعایت استاندارد conventional commits (مانند feat:, fix:, chore:, docs:, refactor:, test:) است. باید commit‌هایی که از این استاندارد پیروی نمی‌کنند شناسایی و لیست شوند. خارج از این مرحله: اصلاح commit‌ها یا بازنویسی تاریخچه. نکته حیاتی: تمرکز بر commit‌های با پیام تکراری و غیراستاندارد مانند 'Add Inspector Bridge Script'. 

بر اساس deep context پروژه، در تاریخچه commit‌های اخیر (آخرین کامیت‌ها) مشاهده می‌شود که ۷ commit از ۸ commit آخر دارای پیام تکراری 'Add Inspector Bridge Script' هستند (b9494e5, 4b6a071, e374c41, f90cee1, d214ff5, 65ae85c) و یک commit با عنوان 'Remove Inspector Bridge Script' (e16892d). این الگو نشان‌دهنده عدم رعایت conventional commits است. همچنین در فایل frontend/index.html (خطوط 31-201) یک اسکریپت کامل با عنوان 'Inspector Bridge Script' وجود دارد که به نظر می‌رسد یک monitoring/debugging script است که مستقیماً در production (index.html) تزریق شده است. این اسکریپت شامل event listenerهای click, scroll, input, focus است و داده‌ها را از طریق window.parent.postMessage به یک پنل مدیریت ارسال می‌کند. وجود این اسکریپت در production و commit‌های تکراری آن نشان‌دهنده نیاز به بررسی و رعایت استانداردهای commit message است.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] ۱. اجرای git log --oneline --format='%h %s' و استخراج حداقل ۱۰۰ commit آخر از تاریخچه پروژه.
- [ ] ۲. اسکن خودکار پیام‌های commit با regex: ^(feat|fix|chore|docs|refactor|test|style|perf|ci|build|revert)(\(.+\))?: .+
- [ ] ۳. شناسایی و لیست کردن تمام commit‌هایی که با الگوی conventional commits مطابقت ندارند، به ویژه commit‌های با پیام 'Add Inspector Bridge Script'.
- [ ] ۴. ارائه گزارش شامل: تعداد کل commit‌های بررسی‌شده، تعداد commit‌های معتبر، تعداد commit‌های نامعتبر، و لیست commit‌های نامعتبر با هش و پیام کامل.
- [ ] ۵. تأیید اینکه commit‌های تکراری 'Add Inspector Bridge Script' (b9494e5, 4b6a071, e374c41, f90cee1, d214ff5, 65ae85c) در لیست نقض‌کنندگان قرار دارند.
- [ ] ۶. ارائه پیشنهاد برای بهبود فرآیند commit در آینده (مانند استفاده از ابزار commitlint یا husky).
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. ۱. اجرای دستور git log --oneline --format='%h %s' برای مشاهده تاریخچه commit‌ها و استخراج پیام‌ها.
۲. اسکن دستی یا خودکار پیام‌های commit با یک regex برای تشخیص الگوهای conventional commits: ^(feat|fix|chore|docs|refactor|test|style|perf|ci|build|revert)(\(.+\))?: .+
۳. شناسایی commit‌هایی که با الگوی بالا مطابقت ندارند، به ویژه commit‌های با پیام تکراری 'Add Inspector Bridge Script'.
۴. تهیه لیست commit‌های نقض‌کننده با هش و پیام کامل.
۵. گزارش تعداد commit‌های معتبر و نامعتبر.
۶. توجه ویژه به فایل frontend/index.html (خطوط 31-201) که حاوی Inspector Bridge Script است و commit‌های مرتبط با آن.
۷. ارائه پیشنهاد برای اصلاح فرآیند commit در آینده (بدون تغییر تاریخچه).

## 💡 نمونه‌های قبل/بعد
**نمونه commit غیراستاندارد (قبل)**

_قبل:_
```
Add Inspector Bridge Script
```

_بعد:_
```
feat: add inspector bridge script for live tracking
```

**نمونه commit استاندارد (بعد)**

_قبل:_
```
Remove Inspector Bridge Script
```

_بعد:_
```
chore: remove inspector bridge script from production
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `git log --oneline --format='%h %s' -100`
- `git log --oneline --format='%h %s' -100 | grep -vE '^(feat|fix|chore|docs|refactor|test|style|perf|ci|build|revert)(\(.+\))?: '`
- `echo 'تعداد کل commit‌ها:'; git log --oneline -100 | wc -l`
- `echo 'تعداد commit‌های معتبر:'; git log --oneline -100 | grep -cE '^(feat|fix|chore|docs|refactor|test|style|perf|ci|build|revert)(\(.+\))?: '`
- `echo 'تعداد commit‌های نامعتبر:'; git log --oneline -100 | grep -vcE '^(feat|fix|chore|docs|refactor|test|style|perf|ci|build|revert)(\(.+\))?: '`

## ⚠️ ریسک‌ها و موارد احتیاط
این تسک فقط به بررسی تاریخچه commit می‌پردازد و هیچ تغییری در کد ایجاد نمی‌کند. بنابراین ریسک خاصی برای کدبیس وجود ندارد. با این حال، توجه داشته باشید که فایل frontend/index.html حاوی Inspector Bridge Script است که ممکن است یک debugging/monitoring script باشد و در production نباید وجود داشته باشد. commit‌های تکراری 'Add Inspector Bridge Script' نشان‌دهنده احتمال وجود debugging code در production است که باید جداگانه بررسی شود. همچنین فایل backend/server.js (خطوط 1-1403) حاوی APIهای متعدد است و commit‌های مرتبط با آن باید با دقت بررسی شوند.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: other
- اولویت: medium
- تخمین زمان: small

---

# 🔹 مرحله 4: بررسی احتمال وجود debugging code یا monitoring scripts در production

**Scope:** این مرحله شامل تحلیل عمیق‌تر کد موجود در commit‌های مشکوک برای یافتن الگوهای رایج debugging code (مانند console.log, print, var_dump, debugger) یا monitoring scripts (مانند ارسال داده به endpoint خارجی، tracking pixels, analytics بدون consent). خارج از این مرحله: حذف کد یا تغییر آن. نکته حیاتی: باید به دنبال الگوهایی مانند ارسال داده به دامنه‌های ناشناس، لاگ کردن credentials، یا اجرای کد در پس‌زمینه بود.
**Key terms:** debugging code, monitoring scripts, production, console.log, debugger, analytics, tracking, external endpoint

**بخش مربوط از متن کاربر:**
```
تمام commit های اخیر دارای پیام یکسان 'Add Inspector Bridge Script' هستند که نشان‌دهنده عدم رعایت conventional commits و احتمال وجود debugging code یا monitoring scripts مشکوک در production است.
```

## 🎯 هدف (خلاصه ساختاریافته)
تحلیل عمیق کدهای Inspector Bridge Script در commit‌های اخیر برای یافتن debugging code و monitoring scripts مشکوک در production

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/index.html:31-201` — `Inspector Bridge Script` — این اسکریپت کامل Inspector Bridge است که در production (index.html) قرار دارد. شامل event listenerهای متعدد و ارسال داده به parent از طریق postMessage با origin '*' است. این می‌تواند به عنوان monitoring script در production عمل کند.
  ```
  <!-- Inspector Bridge Script - Auto-injected -->
  <script>
  (function() {
    console.log('🌉 Inspector Bridge: Script starting...');
  
    // جلوگیری از اجرای چندباره
    if (window.__inspectorBridgeLoaded) {
      console.log('🌉 Inspector Bridge: Already loaded, skipping');
      return;
    }
    window.__inspectorBridgeLoaded = true;
  
    // بررسی اینکه آیا در iframe هستیم
    const isInIframe = window !== window.parent;
    console.log('🌉 Inspector Bridge: In iframe?', isInIframe);
    console.log('🌉 Inspector Bridge: Page URL:', window.location.href);
  
    // تنظیمات
    const DEBOUNCE_MS = 100;
    let lastEventTime = 0;
    let messagesSent = 0;
  
    // تابع ارسال پیام به parent (پنل مدیریت)
    function sendToInspector(action, data) {
      try {
        const message = {
          type: 'inspector-bridge-event',
          action: action,
          target: data.target || '',
          elementInfo: data.elementInfo || '',
          position: data.position || { xPercent: 50, yPercent: 50 },
          pageUrl: window.location.href,
          timestamp: Date.now()
        };
        window.parent.postMessage(message, '*');
        messagesSent++;
        console.log('🌉 Inspector Bridge: Sent message #' + messagesSent, action, data.elementInfo);
      } catch (e) {
        console.warn('Inspector bridge: failed to send message', e);
      }
    }
  ```
- `backend/server.js:44-45` — `WebSocketServer` — WebSocket server در مسیر '/ws/live' ایجاد شده که می‌تواند برای دریافت داده‌های real-time از inspector bridge استفاده شود. این endpoint در production فعال است.
  ```jsx
  // Create WebSocket server
  const wss = new WebSocketServer({ server, path: '/ws/live' });
  ```
- `backend/server.js:183, 188, 224, 234` — `GEMINI_API_KEY logging` — در endpointهای /api/list-models و /api/test-gemini، 10 کاراکتر اول GEMINI_API_KEY در response برگردانده می‌شود که می‌تواند خطر امنیتی داشته باشد (لاگ کردن credentials).
  ```jsx
  return res.status(response.status).json({ error: data, keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...' });
  res.json({ models: modelNames, count: modelNames.length, keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...' });
          keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...'
        keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...'
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Stack تشخیص داده شده: JavaScript (Node.js backend با Express, WebSocket, multer, ffmpeg; frontend با React, Vite, Tailwind CSS, Firebase). کتابخانه‌های مرتبط: ws برای WebSocket, multer برای آپلود فایل, fluent-ffmpeg برای پردازش ویدیو.

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `backend/server.js` (سطر 45) — این فایل شامل WebSocket server در خط 45 و endpointهای API است که ممکن است با inspector bridge ارتباط داشته باشند. همچنین شامل لاگ کردن GEMINI_API_KEY در خطوط 183, 188, 224, 234 است.
- `frontend/src/App.jsx` (سطر 1) — این فایل کامپوننت اصلی React است که در index.html (خط 206) لود می‌شود. ممکن است با inspector bridge تعامل داشته باشد یا تحت تأثیر event listenerهای آن قرار گیرد.
- `frontend/vite.config.js` (سطر 8) — این فایل تنظیمات Vite را شامل می‌شود و proxy برای /api به backend دارد. ممکن است inspector bridge از این proxy برای ارسال داده استفاده کند.
- `frontend/index.html` (سطر 31) — فایل اصلی HTML که inspector bridge script در آن injection شده است. تمام event listenerها و ارسال داده در این فایل انجام می‌شود.
- `render.yaml` (سطر 1) — فایل کانفیگ deployment که مشخص می‌کند این کد در production روی Render اجرا می‌شود. inspector bridge در production فعال خواهد بود.

## 🌐 نقشهٔ وابستگی‌ها
این تحلیل بر روی فایل frontend/index.html متمرکز است که اسکریپت Inspector Bridge در آن قرار دارد. این اسکریپت از window.parent.postMessage برای ارسال داده به parent استفاده می‌کند که می‌تواند هر دامنه‌ای باشد (origin '*'). WebSocket server در backend/server.js خط 45 (مسیر '/ws/live') می‌تواند برای دریافت داده‌های real-time استفاده شود. فایل frontend/src/App.jsx کامپوننت اصلی React است که در index.html لود می‌شود و ممکن است تحت تأثیر event listenerهای inspector قرار گیرد. فایل frontend/vite.config.js شامل proxy برای /api است. فایل render.yaml کانفیگ deployment در production را مشخص می‌کند. همچنین در backend/server.js خطوط 183, 188, 224, 234 کلید API با prefix 10 کاراکتری لاگ می‌شود که خطر امنیتی دارد.

## 🔍 Context و وضعیت فعلی
بر اساس درخواست کاربر، نیاز به تحلیل عمیق‌تر کد موجود در commit‌های اخیر با پیام یکسان 'Add Inspector Bridge Script' (کامیت‌های b9494e5, 4b6a071, e374c41, f90cee1, d214ff5) برای یافتن الگوهای رایج debugging code مانند console.log, debugger و monitoring scripts مانند ارسال داده به endpoint خارجی، tracking pixels, analytics بدون consent وجود دارد. نکته حیاتی: باید به دنبال الگوهایی مانند ارسال داده به دامنه‌های ناشناس، لاگ کردن credentials، یا اجرای کد در پس‌زمینه بود. خارج از این مرحله: حذف کد یا تغییر آن. شواهد در کد واقعی پروژه: در فایل frontend/index.html از خط 31 تا 201 یک اسکریپت کامل با عنوان 'Inspector Bridge Script' وجود دارد که شامل event listenerهای click, scroll, input, focus است و داده‌ها را از طریق window.parent.postMessage به یک پنل مدیریت (inspector) ارسال می‌کند. این اسکریپت در production (فایل index.html که به صورت static سرو می‌شود) قرار دارد و می‌تواند به عنوان یک monitoring script عمل کند. همچنین در backend/server.js خط 45 یک WebSocket server در مسیر '/ws/live' ایجاد شده که می‌تواند برای دریافت داده‌های real-time از inspector استفاده شود. کلیدواژه‌های کاربر: debugging code, monitoring scripts, production, console.log, debugger, analytics, tracking, external endpoint.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] تأیید شود که اسکریپت Inspector Bridge در frontend/index.html (خطوط 31-201) در production غیرفعال است یا با شرط environment variable (مانند process.env.NODE_ENV !== 'production') محافظت می‌شود.
- [ ] تأیید شود که WebSocket server در backend/server.js خط 45 (مسیر '/ws/live') در production غیرفعال است یا فقط برای اتصالات مجاز باز است.
- [ ] تأیید شود که هیچ console.log در frontend/index.html (خطوط 34, 38, 45, 46, 67, 193, 198, 199) در production وجود ندارد.
- [ ] تأیید شود که GEMINI_API_KEY در backend/server.js خطوط 183, 188, 224, 234 در responseها برگردانده نمی‌شود.
- [ ] تأیید شود که هیچ داده‌ای به دامنه‌های خارجی از طریق window.parent.postMessage یا fetch در frontend/index.html ارسال نمی‌شود.
- [ ] تأیید شود که commit‌های با پیام 'Add Inspector Bridge Script' (b9494e5, 4b6a071, e374c41, f90cee1, d214ff5) بررسی شده و کد اضافی در production وجود ندارد.
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. 1. تحلیل کامل اسکریپت Inspector Bridge در frontend/index.html (خطوط 31-201): بررسی event listenerهای click (خط 137), scroll (خط 148), input (خط 162), focus (خط 174) و تابع sendToInspector (خط 54) که داده‌ها را به window.parent.postMessage ارسال می‌کند. 2. بررسی WebSocket server در backend/server.js خط 45 (مسیر '/ws/live') برای اطمینان از عدم اتصال به inspector. 3. جستجوی console.log در کل پروژه (در frontend/index.html خطوط 34, 38, 45, 46, 67, 193, 198, 199 و backend/server.js خطوط 94, 111, 146, 161, 207, 216, 217, 237, 301, 331, 358, 372, 382, 397, 461, 483, 517, 546, 700, 711, 717, 734, 748, 763, 767, 791, 798). 4. بررسی ارسال داده به دامنه‌های ناشناس: در sendToInspector داده به window.parent.postMessage ارسال می‌شود که می‌تواند به هر دامنه‌ای باشد (origin '*'). 5. بررسی لاگ کردن credentials: در backend/server.js خط 183 و 188 و 224 و 234 کلید API (GEMINI_API_KEY) با prefix 10 کاراکتری لاگ می‌شود که می‌تواند خطر امنیتی داشته باشد. 6. بررسی اجرای کد در پس‌زمینه: اسکریپت inspector به صورت خودکار در خط 32-201 index.html اجرا می‌شود.

## 💡 نمونه‌های قبل/بعد
**نمونه کد مشکوک در Inspector Bridge Script**

_قبل:_
```
// تابع ارسال پیام به parent (پنل مدیریت)
function sendToInspector(action, data) {
  try {
    const message = {
      type: 'inspector-bridge-event',
      action: action,
      target: data.target || '',
      elementInfo: data.elementInfo || '',
      position: data.position || { xPercent: 50, yPercent: 50 },
      pageUrl: window.location.href,
      timestamp: Date.now()
    };
    window.parent.postMessage(message, '*');
    messagesSent++;
    console.log('🌉 Inspector Bridge: Sent message #' + messagesSent, action, data.elementInfo);
  } catch (e) {
    console.warn('Inspector bridge: failed to send message', e);
  }
}
```

_بعد:_
```
این کد باید در production حذف شود یا با شرط environment variable غیرفعال شود. ارسال داده به window.parent.postMessage با origin '*' خطر امنیتی دارد.
```

**نمونه لاگ کردن credentials در backend**

_قبل:_
```
return res.status(response.status).json({ error: data, keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...' });
res.json({ models: modelNames, count: modelNames.length, keyPrefix: GEMINI_API_KEY.substring(0, 10) + '...' });
```

_بعد:_
```
حذف keyPrefix از responseها. لاگ کردن حتی 10 کاراکتر اول API key می‌تواند خطر امنیتی داشته باشد.
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `grep -rn "console.log" frontend/ backend/ --include="*.js" --include="*.jsx" --include="*.html"`
- `grep -rn "debugger" frontend/ backend/ --include="*.js" --include="*.jsx" --include="*.html"`
- `grep -rn "postMessage" frontend/ --include="*.html" --include="*.js" --include="*.jsx"`
- `grep -rn "GEMINI_API_KEY" backend/server.js`
- `git log --oneline --all | grep "Inspector Bridge"`
- `git show b9494e5 --stat`
- `git diff d214ff5..HEAD -- frontend/index.html`

## ⚠️ ریسک‌ها و موارد احتیاط
ریسک اصلی: اسکریپت Inspector Bridge در frontend/index.html (خطوط 31-201) در production فعال است و داده‌های کاربر (کلیک‌ها، اسکرول، ورودی‌ها) را از طریق window.parent.postMessage به هر دامنه‌ای ارسال می‌کند. این می‌تواند منجر به نشت اطلاعات کاربر شود. WebSocket server در backend/server.js خط 45 (مسیر '/ws/live') می‌تواند برای دریافت این داده‌ها استفاده شود. همچنین لاگ کردن GEMINI_API_KEY در backend/server.js خطوط 183, 188, 224, 234 خطر امنیتی دارد. console.logهای متعدد در frontend/index.html (خطوط 34, 38, 45, 46, 67, 193, 198, 199) و backend/server.js (خطوط 94, 111, 146, 161, 207, 216, 217, 237, 301, 331, 358, 372, 382, 397, 461, 483, 517, 546, 700, 711, 717, 734, 748, 763, 767, 791, 798) می‌تواند اطلاعات حساس را در logهای سرور فاش کند.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: security
- اولویت: high
- تخمین زمان: medium

---

# 🔹 مرحله 5: ارائه گزارش نهایی و توصیه‌های اقدام

**Scope:** این مرحله شامل جمع‌بندی تمام یافته‌های مراحل قبل در یک گزارش جامع است. گزارش باید شامل: لیست commit‌های مشکوک، تحلیل محتوای فایل‌ها، موارد نقض conventional commits، و وجود debugging/monitoring code. همچنین باید توصیه‌های عملی برای اقدامات بعدی ارائه دهد (مانند revert commit‌ها، squash کردن، بازنویسی پیام‌ها، یا حذف کد). خارج از این مرحله: اجرای توصیه‌ها. نکته حیاتی: گزارش باید به‌گونه‌ای باشد که تیم توسعه بتواند بر اساس آن تصمیم‌گیری کند.
**Key terms:** report, recommendation, revert, squash, commit message, production, debugging code, monitoring scripts

**بخش مربوط از متن کاربر:**
```
تمام commit های اخیر دارای پیام یکسان 'Add Inspector Bridge Script' هستند که نشان‌دهنده عدم رعایت conventional commits و احتمال وجود debugging code یا monitoring scripts مشکوک در production است. این pattern غیرطبیعی است.
```

## 🎯 هدف (خلاصه ساختاریافته)
تهیه گزارش جامع از commit‌های مشکوک Inspector Bridge Script و ارائه توصیه‌های اقدام

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `frontend/index.html:31-201` — `Inspector Bridge Script` — این اسکریپت کامل Inspector Bridge است که در production (frontend/index.html) قرار دارد. رویدادهای کاربر (کلیک، اسکرول، تایپ، فوکوس) را از طریق postMessage به یک iframe parent ارسال می‌کند. این یک debugging/monitoring script است و نباید در production باشد.
  ```
  <!-- Inspector Bridge Script - Auto-injected -->
  <script>
  (function() {
    console.log('🌉 Inspector Bridge: Script starting...');
  
    // جلوگیری از اجرای چندباره
    if (window.__inspectorBridgeLoaded) {
      console.log('🌉 Inspector Bridge: Already loaded, skipping');
      return;
    }
    window.__inspectorBridgeLoaded = true;
  
    // بررسی اینکه آیا در iframe هستیم
    const isInIframe = window !== window.parent;
    console.log('🌉 Inspector Bridge: In iframe?', isInIframe);
    console.log('🌉 Inspector Bridge: Page URL:', window.location.href);
  
    // تنظیمات
    const DEBOUNCE_MS = 100;
    let lastEventTime = 0;
    let messagesSent = 0;
  
    // تابع ارسال پیام به parent (پنل مدیریت)
    function sendToInspector(action, data) {
      try {
        const message = {
          type: 'inspector-bridge-event',
          action: action,
          target: data.target || '',
          elementInfo: data.elementInfo || '',
          position: data.position || { xPercent: 50, yPercent: 50 },
          pageUrl: window.location.href,
          timestamp: Date.now()
        };
        window.parent.postMessage(message, '*');
        messagesSent++;
        console.log('🌉 Inspector Bridge: Sent message #' + messagesSent, action, data.elementInfo);
      } catch (e) {
        console.warn('Inspector bridge: failed to send message', e);
      }
    }
  
    // ... (ادامه اسکریپت)
  })();
  </script>
  ```
- `frontend/index.html:1-9` — `HTML head` — این بخش ابتدایی فایل index.html است که نشان می‌دهد اسکریپت Inspector Bridge در هدر صفحه و قبل از بسته شدن تگ </head> تزریق شده است. این اسکریپت برای همه کاربران ارسال می‌شود.
  ```
  <!DOCTYPE html>
  <html lang="fa" dir="rtl">
    <head>
      <meta charset="UTF-8" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="اپلیکیشن آموزش لهجه لبنانی با هوش مصنوعی" />
      <title>آموزش لهجه لبنانی</title>
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Stack تشخیص داده شده در بالا = (نامشخص)

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `backend/server.js` (سطر 51) — این فایل فایل‌های استاتیک frontend/dist را سرو می‌کند (خط 51). بنابراین اسکریپت موجود در frontend/index.html برای کاربران نهایی ارسال می‌شود.
- `frontend/vite.config.js` (سطر 1) — این فایل تنظیمات Vite را مشخص می‌کند و proxy برای /api به backend دارد. فایل index.html در پوشه frontend ریشه است و توسط Vite پردازش می‌شود.
- `frontend/src/App.jsx` (سطر 1) — این فایل کامپوننت اصلی React است که درون <div id="root"></div> در index.html رندر می‌شود. اسکریپت Inspector Bridge قبل از این کامپوننت لود می‌شود و می‌تواند رویدادهای داخل App.jsx را نیز مانیتور کند.

## 🌐 نقشهٔ وابستگی‌ها
این تسک مستقیماً بر فایل `frontend/index.html` تأثیر می‌گذارد که فایل اصلی HTML برنامه است. این فایل توسط `backend/server.js` (خط 51) به عنوان static file سرو می‌شود. اسکریپت Inspector Bridge درون این فایل، یک اسکریپت سمت کلاینت است که وابستگی به کتابخانه خاصی ندارد و از Web APIهای استاندارد (postMessage, addEventListener) استفاده می‌کند. حذف این اسکریپت بر عملکرد هیچ کتابخانه یا سرویس دیگری تأثیر نمی‌گذارد، اما ممکن است بر ابزارهای مانیتورینگ خارجی که به این اسکریپت متکی هستند تأثیر بگذارد. کامیت‌های مربوط به این اسکریپت در تاریخچه گیت (b9494e5, 4b6a071, e374c41, f90cee1, d214ff5, 9d61c99, 65ae85c, e16892d) باید مدیریت شوند.

## 🔍 Context و وضعیت فعلی
کاربر درخواست 'ارائه گزارش نهایی و توصیه‌های اقدام' را دارد. این گزارش باید شامل جمع‌بندی تمام یافته‌های مراحل قبل در یک گزارش جامع باشد. گزارش باید شامل: لیست commit‌های مشکوک، تحلیل محتوای فایل‌ها، موارد نقض conventional commits، و وجود debugging/monitoring code. همچنین باید توصیه‌های عملی برای اقدامات بعدی ارائه دهد (مانند revert commit‌ها، squash کردن، بازنویسی پیام‌ها، یا حذف کد). خارج از این مرحله: اجرای توصیه‌ها. نکته حیاتی: گزارش باید به‌گونه‌ای باشد که تیم توسعه بتواند بر اساس آن تصمیم‌گیری کند.

بخش مربوط از درخواست اصلی کاربر: تمام commit های اخیر دارای پیام یکسان 'Add Inspector Bridge Script' هستند که نشان‌دهنده عدم رعایت conventional commits و احتمال وجود debugging code یا monitoring scripts مشکوک در production است. این pattern غیرطبیعی است.

کلیدواژه‌ها: report, recommendation, revert, squash, commit message, production, debugging code, monitoring scripts.

شواهد در کد واقعی پروژه:
- در فایل `frontend/index.html` (خطوط 31-201) یک اسکریپت کامل به نام 'Inspector Bridge Script' وجود دارد که درون تگ `<script>` در هدر صفحه تزریق شده است. این اسکریپت رویدادهای کلیک (click)، اسکرول (scroll)، تایپ (input) و فوکوس (focus) کاربر را از طریق `window.parent.postMessage` به یک پنل مدیریت (inspector panel) ارسال می‌کند. این یک اسکریپت مانیتورینگ و دیباگینگ است.
- تاریخچه کامیت‌ها (آخرین کامیت‌ها) نشان می‌دهد که 5 کامیت متوالی با پیام یکسان '🌉 Add Inspector Bridge Script (JS version)' و یک کامیت با '🌉 Add Inspector Bridge Script for live tracking' وجود دارد. همچنین دو کامیت با عنوان '🔧 Remove Inspector Bridge Script' دیده می‌شود که نشان‌دهنده اضافه و حذف مکرر این اسکریپت است.
- این اسکریپت در production (فایل `frontend/index.html` که به صورت استاتیک سرو می‌شود) وجود دارد و برای کاربران نهایی ارسال می‌شود.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] 1. یک فایل گزارش جامع (مثلاً docs/audit-report.md) در ریشه پروژه ایجاد شود که شامل لیست commit‌های مشکوک، تحلیل محتوای فایل‌ها، موارد نقض conventional commits، و وجود debugging/monitoring code باشد.
- [ ] 2. گزارش شامل حداقل 3 توصیه عملی (revert, squash, حذف کد) با جزئیات اجرایی باشد.
- [ ] 3. پس از تصمیم تیم، اقدام مربوطه (مثلاً حذف اسکریپت از frontend/index.html) در یک کامیت جدید با پیام مناسب انجام شود.
- [ ] 4. پس از اجرای اقدام، اسکریپت Inspector Bridge دیگر در فایل frontend/index.html وجود نداشته باشد و برای کاربران ارسال نشود.
- [ ] 5. تاریخچه کامیت‌ها تمیز شود (مثلاً با squash کردن کامیت‌های مربوطه) تا پیام‌های تکراری و غیراستاندارد حذف شوند.
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. 1. **ایجاد یک گزارش جامع (فایل متنی یا مارک‌داون)**: یک فایل جدید مانند `docs/audit-report.md` در ریشه پروژه ایجاد کن که شامل موارد زیر باشد:
   - **لیست commit‌های مشکوک**: تمام کامیت‌های مربوط به 'Inspector Bridge Script' از تاریخچه (b9494e5, 4b6a071, e374c41, f90cee1, d214ff5, 9d61c99, 65ae85c, e16892d) به همراه هش و پیام.
   - **تحلیل محتوای فایل‌ها**: اشاره به `frontend/index.html` (خطوط 31-201) و توضیح اینکه این اسکریپت یک monitoring/debugging script است که رویدادهای کاربر را به یک iframe parent ارسال می‌کند.
   - **موارد نقض conventional commits**: پیام‌های تکراری 'Add Inspector Bridge Script' بدون توضیح اضافی، و استفاده از ایموجی به جای prefix استاندارد (مثلاً feat:, fix:, chore:).
   - **وجود debugging/monitoring code**: اسکریپت در production فعال است و برای کاربران نهایی ارسال می‌شود.
   - **توصیه‌های عملی**:
     - **گزینه 1 (Revert)**: از کامیت `e16892d` (Remove Inspector Bridge Script) به عنوان پایه استفاده کن و مطمئن شو اسکریپت حذف شده است. سپس کامیت‌های بعدی که دوباره اضافه کرده‌اند را revert کن.
     - **گزینه 2 (Squash)**: تمام کامیت‌های مربوط به این اسکریپت را squash کن به یک کامیت با پیام `chore: remove inspector bridge script from production`.
     - **گزینه 3 (حذف کد)**: مستقیماً کد اسکریپت را از `frontend/index.html` (خطوط 31-201) حذف کن و یک کامیت جدید با پیام `fix: remove debugging script from production` ایجاد کن.
   - **تصمیم‌گیری تیم**: گزارش باید به تیم ارائه شود تا بین گزینه‌های بالا یکی را انتخاب کنند.
2. **اجرای توصیه (پس از تصمیم تیم)**: بسته به انتخاب تیم، یکی از اقدامات بالا را پیاده‌سازی کن.

## 💡 نمونه‌های قبل/بعد
**حذف اسکریپت Inspector Bridge از frontend/index.html**

_قبل:_
```
<!-- Inspector Bridge Script - Auto-injected -->
<script>
(function() {
  console.log('🌉 Inspector Bridge: Script starting...');
  // ... (کل اسکریپت 170 خطی)
})();
</script>
```

_بعد:_
```
<!-- اسکریپت Inspector Bridge حذف شد -->
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `git log --oneline --all | grep -i 'inspector'`
- `grep -r 'inspector-bridge' frontend/index.html`
- `cat docs/audit-report.md (بررسی وجود فایل گزارش)`

## ⚠️ ریسک‌ها و موارد احتیاط
ریسک اصلی این است که اسکریپت Inspector Bridge ممکن است توسط یک ابزار خارجی (مانند یک پنل مدیریت) برای مانیتورینگ استفاده شود. حذف آن ممکن است باعث از کار افتادن آن ابزار شود. همچنین، کامیت‌های متعدد با پیام‌های تکراری نشان‌دهنده عدم انضباط در فرآیند توسعه است و ممکن است نیاز به آموزش تیم در مورد conventional commits داشته باشد. ریسک دیگر این است که اگر این اسکریپت عمداً برای دیباگینگ اضافه شده باشد، حذف آن ممکن است فرآیند دیباگینگ را مختل کند. با این حال، وجود آن در production یک ریسک امنیتی و حریم خصوصی جدی است.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: other
- اولویت: high
- تخمین زمان: small

---

## ✅ معیارهای پذیرش کلی (همهٔ مراحل)
- [ ] 1. لیست کامل commit‌های دارای پیام 'Add Inspector Bridge Script' استخراج شده باشد (حداقل 5 commit).
- [ ] 2. برای هر commit، diff کامل تغییرات در یک فایل جداگانه ذخیره شده باشد.
- [ ] 3. گزارش تحلیلی شامل تعداد commit‌های تکراری، محتوای تغییرات، و ارزیابی خطر تهیه شده باشد.
- [ ] 4. هیچ تغییری در کد پروژه ایجاد نشده باشد (صرفاً تشخیصی).
- [ ] 5. مستندات یافته‌ها در فایل docs/inspector-bridge-audit.md ذخیره شده باشد.
- [ ] 6. پیشنهاد برای رعایت conventional commits در آینده ارائه شده باشد.
- [ ] 1. اسکریپت Inspector Bridge در frontend/index.html (خطوط 31-201) به طور کامل شناسایی و مستند شده باشد.
- [ ] 2. تمام event listeners (click, scroll, input, focus) و تابع sendToInspector بررسی شده باشند.
- [ ] 3. مشخص شود که آیا این اسکریپت به API خارجی متصل است یا خیر (در حال حاضر فقط به window.parent.postMessage ارسال می‌کند).
- [ ] 4. گزارش نهایی شامل الگوهای خطرناک (ارسال داده به سرورهای خارجی، لاگ کردن اطلاعات حساس، تغییر رفتار سیستم) تهیه شود.
- [ ] 5. توصیه‌های امنیتی برای حذف یا غیرفعال کردن اسکریپت در production ارائه شود.
- [ ] ۱. اجرای git log --oneline --format='%h %s' و استخراج حداقل ۱۰۰ commit آخر از تاریخچه پروژه.
- [ ] ۲. اسکن خودکار پیام‌های commit با regex: ^(feat|fix|chore|docs|refactor|test|style|perf|ci|build|revert)(\(.+\))?: .+
- [ ] ۳. شناسایی و لیست کردن تمام commit‌هایی که با الگوی conventional commits مطابقت ندارند، به ویژه commit‌های با پیام 'Add Inspector Bridge Script'.
- [ ] ۴. ارائه گزارش شامل: تعداد کل commit‌های بررسی‌شده، تعداد commit‌های معتبر، تعداد commit‌های نامعتبر، و لیست commit‌های نامعتبر با هش و پیام کامل.
- [ ] ۵. تأیید اینکه commit‌های تکراری 'Add Inspector Bridge Script' (b9494e5, 4b6a071, e374c41, f90cee1, d214ff5, 65ae85c) در لیست نقض‌کنندگان قرار دارند.
- [ ] ۶. ارائه پیشنهاد برای بهبود فرآیند commit در آینده (مانند استفاده از ابزار commitlint یا husky).
- [ ] تأیید شود که اسکریپت Inspector Bridge در frontend/index.html (خطوط 31-201) در production غیرفعال است یا با شرط environment variable (مانند process.env.NODE_ENV !== 'production') محافظت می‌شود.
- [ ] تأیید شود که WebSocket server در backend/server.js خط 45 (مسیر '/ws/live') در production غیرفعال است یا فقط برای اتصالات مجاز باز است.
- [ ] تأیید شود که هیچ console.log در frontend/index.html (خطوط 34, 38, 45, 46, 67, 193, 198, 199) در production وجود ندارد.

✅ مراحل قبلاً done شده (در super-task به‌عنوان pre_done):
  - بررسی وجود conventional commits در تاریخچه و شناسایی موارد نقض

🔧 مراحل remaining که در super-task باید انجام شوند:
  - بررسی و تحلیل تمام commit‌های اخیر با پیام یکسان — استخراج کامل لیست commit‌ها و ذخیره diffهای هر commit در فایل جداگانه.
  - بررسی محتوای فایل‌های تغییر یافته در commit‌های مشکوک — بررسی کامل تمام event listeners و تابع sendToInspector و تهیه گزارش نهایی شامل الگوهای خطرناک.
  - بررسی احتمال وجود debugging code یا monitoring scripts در production — تأیید نهایی عدم وجود کد اضافی در production از commit‌های مشکوک.
  - ارائه گزارش نهایی و توصیه‌های اقدام — ایجاد فایل گزارش جامع (docs/audit-report.md) شامل لیست commit‌های مشکوک، تحلیل محتوا، موارد نقض conventional commits، وجود debugging/monitoring code و توصیه‌های عملی (revert, squash, حذف کد) با جزئیات اجرایی. همچنین تمیز کردن تاریخچه کامیت‌ها.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 نکات استاندارد (همان bullet هایی که در ساخت پرامپت‌های معمولی پروژه رعایت می‌شود — وراثت کامل، نه کپی):
- ساختار AC ها: acceptance_criteria با verify_method و verify_plan و evidence_locations برای هر AC
- edge cases را در نظر بگیر و در پرامپت ذکر کن
- وابستگی‌ها را اول حل کن (dependency-aware ordering)
- اگر بخشی از یکی از تسک‌ها قبلاً done است (pre_done در بالا)، تکرار نکن — فقط روی remaining_parts تمرکز کن
- در commit message: `merged-from: e4229cce-5083-4ed9-b7d7-4275cf77ec8e, 92c9dd21-d951-426b-9f25-709bbff53ef8`
- task_steps را با dependency-aware ordering مرتب کن
- هیچ کار قبلاً done شده‌ای نباید دوباره انجام شود
- هیچ خلاصه‌سازی نکن — جزئیات کامل از همهٔ منابع باید حفظ شوند


## Acceptance Criteria

1. ریشه anti-pattern تشخیص داده شد _(verify: static)_
2. یا کد اصلاح شد، یا کامنت توجیهی اضافه شد _(verify: static)_
3. تست edge case نوشته شد _(verify: backend_test)_
4. 1. لیست کامل commit‌های دارای پیام 'Add Inspector Bridge Script' استخراج شده باشد (حداقل 5 commit). _(verify: static)_
5. 2. برای هر commit، diff کامل تغییرات در یک فایل جداگانه ذخیره شده باشد. _(verify: static)_
6. 3. گزارش تحلیلی شامل تعداد commit‌های تکراری، محتوای تغییرات، و ارزیابی خطر تهیه شده باشد. _(verify: manual_only)_
7. 4. هیچ تغییری در کد پروژه ایجاد نشده باشد (صرفاً تشخیصی). _(verify: static)_
8. 5. مستندات یافته‌ها در فایل docs/inspector-bridge-audit.md ذخیره شده باشد. _(verify: static)_
9. 6. پیشنهاد برای رعایت conventional commits در آینده ارائه شده باشد. _(verify: manual_only)_
10. 1. اسکریپت Inspector Bridge در frontend/index.html (خطوط 31-201) به طور کامل شناسایی و مستند شده باشد. _(verify: static)_
11. 2. تمام event listeners (click, scroll, input, focus) و تابع sendToInspector بررسی شده باشند. _(verify: static)_
12. 3. مشخص شود که آیا این اسکریپت به API خارجی متصل است یا خیر (در حال حاضر فقط به window.parent.postMessage ارسال می‌کند). _(verify: static)_
13. 4. گزارش نهایی شامل الگوهای خطرناک (ارسال داده به سرورهای خارجی، لاگ کردن اطلاعات حساس، تغییر رفتار سیستم) تهیه شود. _(verify: manual_only)_
14. 5. توصیه‌های امنیتی برای حذف یا غیرفعال کردن اسکریپت در production ارائه شود. _(verify: manual_only)_
15. ۱. اجرای git log --oneline --format='%h %s' و استخراج حداقل ۱۰۰ commit آخر از تاریخچه پروژه. _(verify: static)_
16. ۲. اسکن خودکار پیام‌های commit با regex: ^(feat|fix|chore|docs|refactor|test|style|perf|ci|build|revert)(\(.+\))?: .+ _(verify: static)_
17. ۳. شناسایی و لیست کردن تمام commit‌هایی که با الگوی conventional commits مطابقت ندارند، به ویژه commit‌های با پیام 'Add Inspector Bridge Script'. _(verify: static)_
18. ۴. ارائه گزارش شامل: تعداد کل commit‌های بررسی‌شده، تعداد commit‌های معتبر، تعداد commit‌های نامعتبر، و لیست commit‌های نامعتبر با هش و پیام کامل. _(verify: manual_only)_
19. ۵. تأیید اینکه commit‌های تکراری 'Add Inspector Bridge Script' (b9494e5, 4b6a071, e374c41, f90cee1, d214ff5, 65ae85c) در لیست نقض‌کنندگان قرار دارند. _(verify: static)_
20. ۶. ارائه پیشنهاد برای بهبود فرآیند commit در آینده (مانند استفاده از ابزار commitlint یا husky). _(verify: manual_only)_
21. تأیید شود که اسکریپت Inspector Bridge در frontend/index.html (خطوط 31-201) در production غیرفعال است یا با شرط environment variable (مانند process.env.NODE_ENV !== 'production') محافظت می‌شود. _(verify: static)_
22. تأیید شود که WebSocket server در backend/server.js خط 45 (مسیر '/ws/live') در production غیرفعال است یا فقط برای اتصالات مجاز باز است. _(verify: static)_
23. تأیید شود که هیچ console.log در frontend/index.html (خطوط 34, 38, 45, 46, 67, 193, 198, 199) در production وجود ندارد. _(verify: static)_
24. تأیید شود که GEMINI_API_KEY در backend/server.js خطوط 183, 188, 224, 234 در responseها برگردانده نمی‌شود. _(verify: static)_
25. تأیید شود که هیچ داده‌ای به دامنه‌های خارجی از طریق window.parent.postMessage یا fetch در frontend/index.html ارسال نمی‌شود. _(verify: static)_
26. تأیید شود که commit‌های با پیام 'Add Inspector Bridge Script' (b9494e5, 4b6a071, e374c41, f90cee1, d214ff5) بررسی شده و کد اضافی در production وجود ندارد. _(verify: static)_
27. 1. یک فایل گزارش جامع (مثلاً docs/audit-report.md) در ریشه پروژه ایجاد شود که شامل لیست commit‌های مشکوک، تحلیل محتوای فایل‌ها، موارد نقض conventional commits، و وجود debugging/monitoring code باشد. _(verify: static)_
28. 2. گزارش شامل حداقل 3 توصیه عملی (revert, squash, حذف کد) با جزئیات اجرایی باشد. _(verify: static)_
29. 3. پس از تصمیم تیم، اقدام مربوطه (مثلاً حذف اسکریپت از frontend/index.html) در یک کامیت جدید با پیام مناسب انجام شود. _(verify: static)_
30. 4. پس از اجرای اقدام، اسکریپت Inspector Bridge دیگر در فایل frontend/index.html وجود نداشته باشد و برای کاربران ارسال نشود. _(verify: static)_
31. 5. تاریخچه کامیت‌ها تمیز شود (مثلاً با squash کردن کامیت‌های مربوطه) تا پیام‌های تکراری و غیراستاندارد حذف شوند. _(verify: static)_
