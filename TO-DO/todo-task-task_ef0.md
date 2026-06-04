# TODO — Task task_ef0 (نیاز به تکمیل دستی)

> **افزودن بررسی وابستگی و تست App.jsx به CI/CD**

## 🔎 خلاصه وضعیت

- **task_id**: `task_ef0945bccb18`
- **repo**: `mahdighandi1989/language`
- **verification_status**: `partial`
- **archived_reason**: `max_retries` — Claude به سقف retry رسید بدون اینکه verify=done شود
- **retries_done**: 2
- **verifier confidence**: 0.95
- **verifier model**: `—`
- **report_id**: `60326536-1fb2-4e2a-82c2-8d2120d3fe4f`
- **created_at**: 2026-06-04T18:53:20.082552+00:00

## 🚧 چه چیزی باقی مانده (مهم‌ترین بخش)

- [ ] linter بدون warning عبور نمی‌کند (هیچ شواهدی از اجرا یا رفع warningها نیست)
- [ ] type-check موفق نیست (هیچ شواهدی از اجرا یا رفع type errorها نیست)

## 👉 قدم‌های بعدی پیشنهادی (از verifier)

1. اجرای linter (ESLint/Flake8/Pylint) و رفع تمام warningها
2. اجرای type-check (tsc --noEmit/mypy) و رفع تمام type errorها

## ✅ چه چیزی Claude انجام داد

- [x] هدف خروجی measurable در README.md و CI workflow ذکر شده
- [x] کد برای بررسی وابستگی‌ها در CI/CD و npm audit تغییر کرده
- [x] تست E2E برای اندازه‌گیری ناسازگاری وابستگی‌ها نوشته شده
- [x] متریک/لاگ outcome_rate و dependency_inconsistency اضافه شده
- [x] تغییرات بدون شکستن تست‌های موجود اعمال شده
- [x] تست‌های واحد برای App.jsx نوشته شده

## 📝 خلاصهٔ verifier

۶ از ۸ معیار پذیرش برآورده شده. بررسی وابستگی CI/CD، تست E2E، متریک/لاگ، تست‌های واحد App.jsx و هدف measurable همگی پیاده‌سازی شده‌اند. دو معیار linter و type-check هنوز انجام نشده‌اند.

## 📋 Acceptance Criteria (مرجع کامل)

این لیست معیار done شدن تسک است — هر آیتمی که هنوز satisfy نیست
باید توسط انسان تکمیل شود.

- outcome target به‌صورت measurable بازنویسی شد
- کد تغییر کرد تا outcome target محقق شود
- test E2E که outcome را اندازه می‌گیرد عبور می‌کند
- metric/log اضافه شد تا در production outcome rate قابل تشخیص باشد
- اعمال تغییر بدون شکستن تست‌های موجود
- linter بدون warning عبور می‌کند
- type-check موفق است

## 🔬 Evidence که verifier پیدا کرد

**Commits:**
- `985736e`
- `c3cb0c5`
- `a171185`
- `69e429b`
- `ca53f1d`

**Files lams شده:**
- `README.md`
- `.github/workflows/ci.yml`
- `frontend/src/components/App.test.jsx`
- `tests/test_dependency_consistency.py`
- `backend/app/monitoring.py`
- `frontend/src/utils/logger.js`

## 💡 ایدهٔ اصلی تسک

🧬 این یک تسک تلفیقی است — از 2 تسک منفرد ساخته شده.
📌 دلیل تلفیق (rationale توسط AI): این تسک‌ها هر دو به بهبود فرآیندهای تضمین کیفیت کلی پروژه کمک می‌کنند. یکی بر افزودن بررسی‌های خودکار وابستگی‌ها در CI/CD تمرکز دارد و دیگری بر افزودن تست‌های واحد برای کامپوننت‌های فرانت‌اند. هر دو با هدف شناسایی زودهنگام مشکلات و افزایش قابلیت اطمینان کد انجام می‌شوند.
🎯 theme: Quality Assurance: CI/CD & Frontend Testing
💎 estimated_difficulty: medium

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
تسک 1 از 2
  id: a5f3ced3-5841-4c4c-adef-06da565203ed
  عنوان اصلی: افزودن بررسی وابستگی‌ها به CI/CD
  اولویت اصلی: medium
  وضعیت verify قبلی: pending
  فایل‌های دخیل: -

📋 acceptance_criteria کامل:
  - outcome target به‌صورت measurable بازنویسی شد [verify_method=static] [verify_plan={"grep_patterns": ["outcome target", "measurable", "effectiveness"], "files_hint": ["README.md", "docs/"]}]
  - کد تغییر کرد تا outcome target محقق شود [verify_method=static] [verify_plan={"grep_patterns": ["npm audit", "package-lock.json", "ci/cd", "dependency check"], "files_hint": [".github/workflows/ci.yml", "frontend/package.json", "backend/package.json"]}]
  - test E2E که outcome را اندازه می‌گیرد عبور می‌کند [verify_method=backend_test] [verify_plan={"test_node": "tests/test_dependency_consistency.py::test_e2e_outcome", "timeout_seconds": 120}]
  - metric/log اضافه شد تا در production outcome rate قابل تشخیص باشد [verify_method=static] [verify_plan={"grep_patterns": ["metric", "log", "outcome_rate", "dependency_incons

## 📜 پرامپت اصلی (excerpt)

```
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
  با

_[truncated — full prompt در پنل]_
```

---

_این فایل توسط Claude Auto-Runner تولید شده است. تسک با حالت_ `max_retries` _آرشیو شده و دیگر به‌صورت خودکار pickup نمی‌شود._