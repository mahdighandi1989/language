---
task_id: task_ef0945bccb18
task_title: افزودن بررسی وابستگی‌ها و npm audit به CI/CD
execution_priority: 3150
created_at: "2026-06-04T00:00:00+00:00"
updated_at: "2026-06-04T00:00:00+00:00"
status: pending
---

# نصب workflow بررسی وابستگی‌ها در GitHub Actions

## چرا این فایل ساخته شد
کل کار این تسک به‌صورت خودکار انجام شد (تست‌ها، متریک‌ها، مستندات، و
npm scriptها). تنها یک اقدام باقی مانده که **agent مجاز به انجامش نیست**:
نوشتن مستقیم فایل زیر `.github/workflows/`.

علت: توکن اتوماسیون این ریپو (GitHub App) مجوز `workflows` ندارد. تلاش برای
push فایل `.github/workflows/ci.yml` با خطای صریح GitHub رد شد:

```
refusing to allow a GitHub App to create or update workflow
`.github/workflows/ci.yml` without `workflows` permission
```

این یک مرز مجوز انسانی است (مثل credential)، نه یک کار قابل‌خودکارسازی.

## وضعیت بخش‌های خودکار (انجام‌شده)
- ✅ هدف خروجی measurable در `README.md` («کاهش خطاهای ناسازگاری وابستگی‌ها به صفر»).
- ✅ متریک/لاگ `outcome_rate` و `dependency_inconsistency` در
  `backend/app/monitoring.py` و `frontend/src/utils/logger.js`.
- ✅ تست E2E سنجش outcome: `tests/test_dependency_consistency.py::test_e2e_outcome`
  (همراه ۶ تست دیگرِ سازگاری/integrity — همه pass).
- ✅ اجرای محلی همان بررسی‌ها بدون GitHub Actions:
  `npm run ci:deps` (ریشه یا هر workspace) → `npm ci` (dependency check روی
  package-lock.json) + `npm audit`.
- ✅ فایل آمادهٔ نصب: `docs/ci.workflow.example.yml`.

## کاری که باید انجام دهی (اولویت متوسط)
یک maintainer با مجوز کافی این کار **یک‌بارهٔ** را انجام دهد:

1. محتوای `docs/ci.workflow.example.yml` را در مسیر
   `.github/workflows/ci.yml` کپی و commit کند، **یا**
2. به توکن/اپ اتوماسیون مجوز `workflows` بدهد تا runهای بعدی خودشان
   فایل را بسازند.

## وقتی این کار را تمام کردی
- workflow «CI» در تب Actions ظاهر می‌شود و در هر push/PR و هفتگی
  `npm ci` + `npm audit` + تست E2E سازگاری وابستگی‌ها را اجرا می‌کند.
- این فایل TO-DO را پاک کن و entry آن را از `TO-DO/_index.json` حذف کن.
