# سازگاری وابستگی‌ها به‌عنوان هدف خروجی قابل اندازه‌گیری

پیش‌تر هر دو بخش `backend` و `frontend` فایل `package-lock.json` را commit
می‌کردند، ولی هیچ فرآیند خودکاری تضمین نمی‌کرد که این lock file با
`package.json` همگام بماند یا روی هر تغییر بررسی شود. این سند هدف خروجی
مدیریت وابستگی‌ها را به‌صورت **قابل اندازه‌گیری** (measurable) بازتعریف
می‌کند تا اثربخشی (effectiveness) آن قابل پایش باشد.

## هدف خروجی (outcome target)

- **هدف قابل اندازه‌گیری:** کاهش خطاهای ناشی از ناسازگاری وابستگی‌ها به
  **صفر**. هر اجرای CI/CD با `npm ci` نصب می‌شود (که اگر `package.json` و
  `package-lock.json` از هم فاصله بگیرند، شکست می‌خورد) و `npm audit` به‌صورت
  منظم تعداد آسیب‌پذیری‌های **critical** رسیدگی‌نشده را صفر نگه می‌دارد.

## معیارهای سازگاری (invariants)

`outcome_rate` سازگاری وابستگی‌ها از نسبت معیارهای زیر که برقرارند به کل
معیارها محاسبه می‌شود:

| معیار | تعریف |
| --- | --- |
| lock file معتبر است | `package-lock.json` یک JSON معتبر با `lockfileVersion` و نقشهٔ `packages` است |
| یکپارچگی (integrity) | هر بستهٔ resolve‌شده از registry یک هش `integrity` دارد (نصب بدون چک‌سام ممکن نیست) |
| پوشش workspace | هر `package.json` در workspaceها (`backend`, `frontend`) در lock file نمایندگی شده است |

```
outcome_rate = consistent_checks / total_checks
```

هدف: `outcome_rate == 1.0` (۱۰۰٪). اگر کمتر شود، خطای ناسازگاری وجود دارد.

## نحوهٔ اندازه‌گیری و مشاهده در production

- **CI/CD:** فایل `.github/workflows/ci.yml` روی هر push و pull request (و
  زمان‌بندی هفتگی) مراحل `npm ci` (dependency check) و `npm audit`
  (vulnerability scan) را اجرا می‌کند.
- **بک‌اند (Python — لایهٔ سنجش):** `backend/app/monitoring.py` متریک
  `dependency_inconsistency` و `outcome_rate` را محاسبه و از طریق logger با
  نام `monitoring_log` خط‌به‌خط `metric_name=... value=...` منتشر می‌کند تا در
  لاگ‌های production قابل grep باشد.
- **فرانت‌اند:** `frontend/src/utils/logger.js` همان کلیدهای متریک
  (`outcome_rate`, `dependency_inconsistency`) را در کنسول مرورگر به‌صورت
  ساختاریافته لاگ می‌کند تا مشاهده‌پذیری دوطرفه باشد.
- **تست E2E:** `tests/test_dependency_consistency.py::test_e2e_outcome` یک
  اندازه‌گیری end-to-end از سازگاری وابستگی‌ها انجام می‌دهد، `outcome_rate`
  را لاگ می‌کند و اگر کمتر از ۱۰۰٪ باشد شکست می‌خورد.
