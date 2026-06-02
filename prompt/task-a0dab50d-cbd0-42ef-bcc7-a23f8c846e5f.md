---
task_id: a0dab50d-cbd0-42ef-bcc7-a23f8c846e5f
title: افزودن تست‌های اعتبارسنجی render.yaml
type: docs
priority: low
execution_priority: 4050
status: pending
external_status: claimed
verification_status: pending
watched_id: 6b04f8bd-b562-4fb9-9cd9-0c27458ced59
project: mahdighandi1989/language
created_at: '2026-05-23T07:38:10.294582+00:00'
updated_at: '2026-06-02T12:14:05.325391+00:00'
target_files:
- render.yaml
---

# افزودن تست‌های اعتبارسنجی render.yaml

## Raw Idea

فایل render.yaml شامل deployment configuration برای Render.com است. اگرچه این فایل logic ندارد، اما به عنوان reference برای deployment مهم است. عدم وجود تست برای validation این configuration می‌تواند منجر به خطاهای deployment شود.

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
فایل render.yaml فاقد تست است و شامل deployment configuration می‌باشد

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `render.yaml:1-11` — `Render Configuration` — Deployment configuration بدون تست validation
  ```
  services:
    - type: web
      name: lebanese-dialect-app
      runtime: node
      buildCommand: cd frontend && npm install && npm run build && cd ../backend && npm install
      startCommand: cd backend && npm start
      envVars:
        - key: GEMINI_API_KEY
          sync: false
        - key: NODE_ENV
          value: production
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Render.com + Node.js

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `render.yaml` (سطر 1) — فایل اصلی که باید تست شود
- `backend/server.js` (سطر 53) — از environment variables استفاده می‌کند

## 🌐 نقشهٔ وابستگی‌ها
این فایل برای deployment روی Render.com استفاده می‌شود.

## 🔍 Context و وضعیت فعلی
فایل render.yaml شامل deployment configuration برای Render.com است. اگرچه این فایل logic ندارد، اما به عنوان reference برای deployment مهم است. عدم وجود تست برای validation این configuration می‌تواند منجر به خطاهای deployment شود.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] تست بررسی کند که YAML structure معتبر است
- [ ] تست بررسی کند که buildCommand و startCommand تعریف شده‌اند
- [ ] تست بررسی کند که envVars شامل GEMINI_API_KEY است
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. ایجاد تست برای validation render.yaml configuration

## 💡 نمونه‌های قبل/بعد
**ایجاد تست validation**

_قبل:_
```
هیچ تستی وجود ندارد
```

_بعد:_
```
describe('render.yaml', () => {
  it('should have valid YAML structure', () => {
    const config = yaml.load(fs.readFileSync('render.yaml', 'utf8'));
    expect(config.services).toBeDefined();
    expect(config.services[0].type).toBe('web');
  });
});
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `node -e "const yaml = require('js-yaml'); const fs = require('fs'); console.log(yaml.load(fs.readFileSync('render.yaml', 'utf8')));"`

## ⚠️ ریسک‌ها و موارد احتیاط
نیاز به نصب js-yaml برای تست

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: docs
- اولویت: low
- تخمین زمان: small

## Acceptance Criteria

1. تست بررسی کند که YAML structure معتبر است _(verify: backend_test)_
2. تست بررسی کند که buildCommand و startCommand تعریف شده‌اند _(verify: backend_test)_
3. تست بررسی کند که envVars شامل GEMINI_API_KEY است _(verify: backend_test)_
