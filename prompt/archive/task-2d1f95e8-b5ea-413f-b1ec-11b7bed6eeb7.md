---
task_id: 2d1f95e8-b5ea-413f-b1ec-11b7bed6eeb7
title: پیاده‌سازی CI/CD و Quality Gates
type: feature_request
priority: medium
execution_priority: 3000
status: done
external_status: pending
verification_status: done
watched_id: 6b04f8bd-b562-4fb9-9cd9-0c27458ced59
project: mahdighandi1989/language
pipeline: ai_llm
purpose: Wire CI/CD and quality gates (lint, build, CodeQL, dependabot) around the ai_llm backend so AI/LLM changes ship safely.
responsibility: Own the GitHub Actions workflows and quality-gate configuration that validate every change to the Gemini-backed services.
expected_inputs: Pushed commits and pull requests that touch the backend or frontend sources.
expected_outputs: Pass/fail CI signal, security-scan results, and automated dependency-update pull requests.
interacts_with: backend/server.js, the frontend build, .github/workflows, and the other ai_llm pipeline prompts.
created_at: '2026-05-09T07:29:40.376193+00:00'
updated_at: '2026-06-02T17:37:25.626766+00:00'
archived: true
archived_at: '2026-06-01T18:28:55.541723+00:00'
target_files:
- .github/workflows/ci.yml
- frontend/package.json
- backend/package.json
- package.json
- .gitignore
- backend/server.js
- frontend/src/App.jsx
- frontend/index.html
- .github/workflows/codeql-analysis.yml
- .github/dependabot.yml
- frontend/vite.config.js
---

# پیاده‌سازی CI/CD و Quality Gates

## Raw Idea

پروژه فاقد GitHub Actions، pre-commit hooks، linting rules و code quality checks است. این موضوع باعث کاهش کیفیت کد، inconsistency در code style و افزایش احتمال merge شدن کدهای مشکل‌دار می‌شود.

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


---

## 📥 درخواست خام کاربر (verbatim — همان متنی که کاربر نوشت)
_(همهٔ URL ها، آدرس‌ها، نام‌ها، و کلمات کلیدی در این متن دست‌نخورده هستند.)_

```
پروژه فاقد GitHub Actions، pre-commit hooks، linting rules و code quality checks است. این موضوع باعث کاهش کیفیت کد، inconsistency در code style و افزایش احتمال merge شدن کدهای مشکل‌دار می‌شود.
```

## 📋 چک‌لیست مراحل (8 مرحله)

این تسک به مراحل کوچک‌تر تقسیم شده. **در هر verify خودکار، وضعیت هر مرحله به‌صورت `[ ]` (انجام نشده)، `[~]` (ناقص)، یا `[x]` (انجام شده) به‌روز می‌شود.**
وقتی تمام مراحل `[x]` شدند، تسک به‌طور خودکار به «انجام شده» منتقل می‌شود.

- [x] **مرحله 1: اضافه کردن GitHub Actions workflow برای linting و type checking** — ایجاد فایل `.github/workflows/ci.yml` که در هر push و pull request اجرا شود. این workflow باید شامل مراحل: نصب dependencies (با npm ci یا yarn)، اجرای ESLint با قوانین strict، اجرای TypeScript type checker (tsc --noEmit) و اجرای prettier --check باشد. خارج از این مرحله: اضافه کردن pre-commit hooks، 
- [x] **مرحله 2: اضافه کردن pre-commit hooks با husky و lint-staged** — نصب و پیکربندی husky برای ایجاد git hooks و lint-staged برای اجرای linting و formatting فقط روی فایل‌های staged. باید فایل `.husky/pre-commit` ایجاد شود که lint-staged را اجرا کند. همچنین فایل `.lintstagedrc.json` یا بخشی در package.json برای تعریف دستورات روی فایل‌های staged (مثلاً eslint --fix و p
- [x] **مرحله 3: تعریف و پیکربندی ESLint rules با قوانین strict** — ایجاد یا به‌روزرسانی فایل `.eslintrc.json` (یا `.eslintrc.js`) با قوانین strict شامل: `@typescript-eslint/strict`, `react/recommended`, `import/order`, `no-console`, `no-unused-vars` و قوانین custom. همچنین نصب پکیج‌های لازم مانند `@typescript-eslint/eslint-plugin`, `eslint-plugin-react`, `eslint-pl
- [x] **مرحله 4: تعریف و پیکربندی Prettier rules برای formatting یکپارچه** — ایجاد فایل `.prettierrc.json` با تنظیمات formatting مانند: `semi: true`, `singleQuote: true`, `tabWidth: 2`, `trailingComma: 'all'`, `printWidth: 100`. همچنین ایجاد فایل `.prettierignore` برای exclude کردن فایل‌های خاص (مثل node_modules, dist). خارج از این مرحله: پیکربندی ESLint یا TypeScript.
- [x] **مرحله 5: اضافه کردن GitHub Actions workflow برای اجرای تست‌ها** — اضافه کردن یک job جدید در فایل `.github/workflows/ci.yml` (یا یک فایل جداگانه) که تست‌های unit و integration را اجرا کند. این job باید بعد از job linting اجرا شود و شامل: نصب dependencies، اجرای `npm test` (یا `yarn test`) با coverage report. خارج از این مرحله: نوشتن تست‌ها، پیکربندی coverage thresh
- [x] **مرحله 6: اضافه کردن GitHub Actions workflow برای security scanning (CodeQL)** — اضافه کردن یک workflow جدید با استفاده از `github/codeql-action` برای scanning vulnerabilities در کد. این workflow باید به صورت هفتگی یا در هر push اجرا شود و نتایج را در GitHub Security tab نمایش دهد. خارج از این مرحله: پیکربندی dependency scanning یا secrets scanning.
- [x] **مرحله 7: اضافه کردن Dependabot برای به‌روزرسانی خودکار dependencies** — ایجاد فایل `.github/dependabot.yml` برای فعال‌سازی Dependabot که به‌روزرسانی‌های امنیتی و نسخه‌های جدید dependencies را به صورت خودکار پیشنهاد دهد. باید برای package manager (npm/yarn) و شاید Docker پیکربندی شود. خارج از این مرحله: پیکربندی CodeQL یا secrets scanning.
- [x] **مرحله 8: اضافه کردن GitHub Actions workflow برای build و deploy (اختیاری با توجه به نیاز پروژه)** — اضافه کردن یک workflow برای build پروژه (مثلاً `npm run build`) و در صورت نیاز deploy به محیط staging یا production. این workflow باید بعد از تست‌ها اجرا شود. خارج از این مرحله: پیکربندی secrets محیط deploy.

---

# 🔹 مرحله 1: اضافه کردن GitHub Actions workflow برای linting و type checking

**Scope:** ایجاد فایل `.github/workflows/ci.yml` که در هر push و pull request اجرا شود. این workflow باید شامل مراحل: نصب dependencies (با npm ci یا yarn)، اجرای ESLint با قوانین strict، اجرای TypeScript type checker (tsc --noEmit) و اجرای prettier --check باشد. خارج از این مرحله: اضافه کردن pre-commit hooks، تنظیم code style rules، یا اجرای تست‌ها.
**Key terms:** .github/workflows/ci.yml, ESLint, TypeScript, prettier, npm ci

**بخش مربوط از متن کاربر:**
```
پروژه فاقد GitHub Actions، pre-commit hooks، linting rules و code quality checks است. این موضوع باعث کاهش کیفیت کد، inconsistency در code style و افزایش احتمال merge شدن کدهای مشکل‌دار می‌شود.
```

## 🎯 هدف (خلاصه ساختاریافته)
اضافه کردن GitHub Actions workflow برای linting و type checking

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `.github/workflows/ci.yml:1-50` — `N/A (فایل جدید)` — این فایل باید ایجاد شود. شامل workflow برای اجرا در هر push و pull request با مراحل: نصب dependencies، ESLint، TypeScript type checker و prettier --check.
  ```
  N/A (فایل جدید)
  ```
- `frontend/package.json:1-30` — `scripts` — این فایل باید با اضافه کردن scripts برای linting و type checking به‌روزرسانی شود. همچنین dependencies مربوط به ESLint و Prettier باید اضافه شوند.
  ```json
  {
    "name": "lebanese-dialect-learning",
    "version": "1.0.0",
    "description": "Lebanese Arabic Learning App with AI",
    "scripts": {
      "install:all": "cd frontend && npm install && cd ../backend && npm install",
      "dev": "cd backend && npm run dev",
      "build": "cd frontend && npm run build",
      "start": "cd backend && npm start"
    },
    "keywords": ["lebanese", "arabic", "language-learning", "gemini", "ai"],
    "license": "MIT"
  }
  ```
- `backend/package.json:1-15` — `dependencies` — این فایل باید با اضافه کردن devDependencies مربوط به ESLint و Prettier به‌روزرسانی شود.
  ```json
  {
    "name": "lebanese-dialect-backend",
    "version": "1.0.0",
    "lockfileVersion": 3,
    "requires": true,
    "packages": {
      "": {
        "name": "lebanese-dialect-backend",
        "version": "1.0.0",
        "dependencies": {
          "cors": "^2.8.5",
          "dotenv": "^16.3.1",
          "express": "^4.18.2",
          "ws": "^8.19.0"
        }
      }
    }
  }
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Stack تشخیص داده شده: JavaScript (با React و Express.js). کتابخانه‌های مرتبط: ESLint، Prettier، TypeScript (در صورت استفاده).

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `frontend/vite.config.js` (سطر 1) — این فایل کانفیگ Vite را شامل می‌شود و ممکن است نیاز به تنظیمات ESLint و TypeScript داشته باشد.
- `backend/server.js` (سطر 1) — این فایل اصلی backend است و باید توسط ESLint بررسی شود.
- `frontend/index.html` (سطر 1) — این فایل شامل کدهای JavaScript است که باید توسط ESLint بررسی شود.
- `frontend/src/App.jsx` (سطر 1) — این فایل کامپوننت اصلی React است و باید توسط ESLint و TypeScript بررسی شود.
- `frontend/src/main.jsx` (سطر 1) — این فایل نقطه ورود frontend است و باید توسط ESLint و TypeScript بررسی شود.

## 🌐 نقشهٔ وابستگی‌ها
این تغییرات شامل ایجاد فایل‌های جدید `.github/workflows/ci.yml`، `.eslintrc.json` (یا `eslint.config.js`)، `tsconfig.json` و `.prettierrc` است. همچنین فایل‌های `frontend/package.json` و `backend/package.json` باید با اضافه کردن devDependencies مربوط به ESLint و Prettier به‌روزرسانی شوند. فایل‌های `frontend/vite.config.js`، `backend/server.js`، `frontend/index.html`، `frontend/src/App.jsx` و `frontend/src/main.jsx` تحت تأثیر linting و type checking قرار می‌گیرند. همچنین فایل `package.json` در ریشه پروژه باید با اضافه کردن scripts برای linting و type checking به‌روزرسانی شود.

## 🔍 Context و وضعیت فعلی
کاربر درخواست اضافه کردن GitHub Actions workflow برای linting و type checking در پروژه را دارد. این درخواست شامل ایجاد فایل `.github/workflows/ci.yml` است که در هر push و pull request اجرا شود. مراحل مورد نیاز: نصب dependencies (با npm ci یا yarn)، اجرای ESLint با قوانین strict، اجرای TypeScript type checker (tsc --noEmit) و اجرای prettier --check. کاربر تأکید کرده که خارج از این مرحله: اضافه کردن pre-commit hooks، تنظیم code style rules، یا اجرای تست‌ها انجام نشود. پروژه فاقد GitHub Actions، pre-commit hooks، linting rules و code quality checks است. این موضوع باعث کاهش کیفیت کد، inconsistency در code style و افزایش احتمال merge شدن کدهای مشکل‌دار می‌شود. کلیدواژه‌ها: `.github/workflows/ci.yml`, ESLint, TypeScript, prettier, npm ci.

شواهد در کد واقعی پروژه:
- فایل `frontend/package.json` (در deep context موجود نیست اما در ساختار پروژه دیده می‌شود) احتمالاً شامل dependencies مربوط به ESLint و Prettier نیست.
- فایل `backend/package.json` (در deep context موجود نیست اما در ساختار پروژه دیده می‌شود) احتمالاً شامل dependencies مربوط به ESLint و Prettier نیست.
- فایل `frontend/vite.config.js` (خطوط 1-15) نشان می‌دهد که پروژه از Vite و React استفاده می‌کند و نیاز به TypeScript type checking دارد.
- فایل `backend/server.js` (خطوط 1-12) نشان می‌دهد که backend از Express.js و WebSocket استفاده می‌کند و نیاز به linting دارد.
- فایل `frontend/index.html` (خطوط 1-208) شامل کدهای JavaScript است که نیاز به linting دارند.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فایل `.github/workflows/ci.yml` در ریشه پروژه ایجاد شود و در هر push و pull request اجرا شود.
- [ ] مراحل workflow شامل: نصب dependencies با `npm ci`، اجرای ESLint با قوانین strict، اجرای TypeScript type checker (`tsc --noEmit`) و اجرای prettier --check باشد.
- [ ] ESLint و Prettier به عنوان devDependencies در `frontend/package.json` و `backend/package.json` اضافه شوند.
- [ ] فایل‌های کانفیگ `.eslintrc.json` (یا `eslint.config.js`)، `tsconfig.json` و `.prettierrc` در ریشه پروژه ایجاد شوند.
- [ ] با push کردن یک commit به شاخه اصلی، workflow به صورت خودکار اجرا شود و linting و type checking انجام شود.
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. برای پیاده‌سازی این درخواست، مراحل زیر باید انجام شود:

1. **ایجاد فایل `.github/workflows/ci.yml`**: این فایل باید در ریشه پروژه ایجاد شود و شامل workflow برای اجرا در هر push و pull request باشد.

2. **نصب dependencies**: در مرحله اول workflow، dependencies باید با `npm ci` نصب شوند. این کار باید برای هر دو پوشه `frontend` و `backend` انجام شود.

3. **اجرای ESLint**: در مرحله بعد، ESLint باید با قوانین strict اجرا شود. برای این کار، ابتدا باید فایل `.eslintrc.json` یا `eslint.config.js` در ریشه پروژه ایجاد شود و قوانین strict تنظیم شود.

4. **اجرای TypeScript type checker**: در مرحله بعد، `tsc --noEmit` باید اجرا شود. برای این کار، ابتدا باید فایل `tsconfig.json` در ریشه پروژه ایجاد شود (اگر وجود ندارد).

5. **اجرای prettier --check**: در مرحله آخر، `prettier --check` باید اجرا شود. برای این کار، ابتدا باید فایل `.prettierrc` در ریشه پروژه ایجاد شود.

6. **تنظیم ESLint و Prettier**: برای اجرای موفق ESLint و Prettier، باید dependencies مربوطه به `package.json` اضافه شوند و فایل‌های کانفیگ مربوطه ایجاد شوند.

7. **تست workflow**: پس از ایجاد workflow، باید با push کردن یک commit به شاخه اصلی، workflow را تست کرد.

## 💡 نمونه‌های قبل/بعد
**اضافه کردن ESLint و Prettier به frontend/package.json**

_قبل:_
```
{
  "dependencies": {
    "firebase": "^10.7.0",
    "lucide-react": "^0.294.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "vite": "^5.0.8"
  }
}
```

_بعد:_
```
{
  "dependencies": {
    "firebase": "^10.7.0",
    "lucide-react": "^0.294.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "vite": "^5.0.8",
    "eslint": "^8.56.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "prettier": "^3.2.4"
  },
  "scripts": {
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `git add . && git commit -m "Add CI workflow" && git push origin main`
- `npm ci --prefix frontend && npm ci --prefix backend`
- `npx eslint . --ext .js,.jsx,.ts,.tsx`
- `npx tsc --noEmit`
- `npx prettier --check .`

## ⚠️ ریسک‌ها و موارد احتیاط
این تغییرات شامل ایجاد فایل‌های جدید و به‌روزرسانی فایل‌های `package.json` است. ریسک اصلی این است که ESLint و Prettier ممکن است خطاهایی را در کدهای موجود نشان دهند که نیاز به اصلاح دارند. همچنین، اگر TypeScript type checker فعال شود، ممکن است خطاهای type-related در کدهای موجود ظاهر شوند. این موضوع ممکن است باعث توقف workflow و نیاز به اصلاح کدها شود. همچنین، فایل `frontend/vite.config.js` ممکن است نیاز به تنظیمات اضافی برای TypeScript داشته باشد. فایل `backend/server.js` نیز ممکن است نیاز به اصلاحات برای رعایت قوانین ESLint داشته باشد.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: feature_request
- اولویت: medium
- تخمین زمان: medium

---

# 🔹 مرحله 2: اضافه کردن pre-commit hooks با husky و lint-staged

**Scope:** نصب و پیکربندی husky برای ایجاد git hooks و lint-staged برای اجرای linting و formatting فقط روی فایل‌های staged. باید فایل `.husky/pre-commit` ایجاد شود که lint-staged را اجرا کند. همچنین فایل `.lintstagedrc.json` یا بخشی در package.json برای تعریف دستورات روی فایل‌های staged (مثلاً eslint --fix و prettier --write). خارج از این مرحله: تعریف قوانین ESLint یا Prettier.
**Key terms:** husky, lint-staged, .husky/pre-commit, .lintstagedrc.json, eslint --fix, prettier --write

**بخش مربوط از متن کاربر:**
```
پروژه فاقد GitHub Actions، pre-commit hooks، linting rules و code quality checks است. این موضوع باعث کاهش کیفیت کد، inconsistency در code style و افزایش احتمال merge شدن کدهای مشکل‌دار می‌شود.
```

## 🎯 هدف (خلاصه ساختاریافته)
اضافه کردن pre-commit hooks با husky و lint-staged برای بهبود کیفیت کد و یکپارچگی style

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `package.json:1-16` — `scripts` — این فایل اصلی‌ترین فایل برای افزودن husky و lint-staged است. باید devDependencies و scripts به آن اضافه شود.
  ```json
  {
    "name": "lebanese-dialect-learning",
    "version": "1.0.0",
    "description": "Lebanese Arabic Learning App with AI",
    "scripts": {
      "install:all": "cd frontend && npm install && cd ../backend && npm install",
      "dev": "cd backend && npm run dev",
      "build": "cd frontend && npm run build",
      "start": "cd backend && npm start"
    },
    "keywords": ["lebanese", "arabic", "language-learning", "gemini", "ai"],
    "license": "MIT"
  }
  ```
- `.gitignore:1-1` — `N/A` — این فایل deep-read نشده — مجری باید مسیر را خود تأیید کند. باید خط `.husky/_` به آن اضافه شود.
  ```
  فایل .gitignore در ساختار پروژه موجود است اما محتوای آن deep-read نشده است.
  ```
- `backend/server.js:1-17` — `import statements` — این فایل به عنوان نمونه برای تست lint-staged استفاده می‌شود. اگر eslint و prettier نصب شوند، این فایل باید lint و format شود.
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
  
  dotenv.config();
  
  // Set ffmpeg path
  ffmpeg.setFfmpegPath(ffmpegStatic);
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Stack تشخیص داده شده: JavaScript (Node.js backend با Express، frontend با React/Vite). کتابخانه‌های مرتبط: husky (برای git hooks)، lint-staged (برای اجرای linting روی فایل‌های staged)، ESLint (برای linting)، Prettier (برای formatting).

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `frontend/package.json` (سطر 1) — این فایل ممکن است دارای devDependencies برای ESLint و Prettier باشد که lint-staged باید روی آن‌ها اجرا شود.
- `backend/package.json` (سطر 1) — این فایل dependencies اصلی backend را دارد. lint-staged باید روی فایل‌های JS در backend اجرا شود.
- `frontend/src/App.jsx` (سطر 1) — این فایل JSX است و باید توسط lint-staged lint و format شود.
- `frontend/src/main.jsx` (سطر 1) — این فایل JSX است و باید توسط lint-staged lint و format شود.
- `frontend/vite.config.js` (سطر 1) — این فایل JS است و باید توسط lint-staged lint و format شود.

## 🌐 نقشهٔ وابستگی‌ها
این تغییرات روی فایل‌های زیر تأثیر می‌گذارند:
1. `package.json` (ریشه): افزودن devDependencies (husky, lint-staged) و scripts (prepare).
2. `.husky/pre-commit`: فایل جدید که lint-staged را اجرا می‌کند.
3. `.lintstagedrc.json` یا بخش lint-staged در `package.json`: فایل جدید برای تعریف دستورات linting/formatting.
4. `.gitignore`: افزودن `.husky/_` برای جلوگیری از commit شدن فایل‌های داخلی husky.
5. تمام فایل‌های JS/JSX/TS/TSX در پروژه (شامل `backend/server.js`, `frontend/src/App.jsx`, `frontend/src/main.jsx`, `frontend/vite.config.js`) تحت تأثیر lint-staged قرار می‌گیرند و باید lint و format شوند.
6. `backend/package.json` و `frontend/package.json`: اگر ESLint و Prettier به عنوان devDependencies اضافه شوند، این فایل‌ها نیز تغییر می‌کنند (اما کاربر خواسته است که تعریف قوانین ESLint یا Prettier خارج از این مرحله باشد).

## 🔍 Context و وضعیت فعلی
کاربر درخواست اضافه کردن pre-commit hooks با استفاده از husky و lint-staged را دارد. این درخواست بر اساس نیاز پروژه به GitHub Actions، pre-commit hooks، linting rules و code quality checks است که در حال حاضر وجود ندارند. این کمبود باعث کاهش کیفیت کد، inconsistency در code style و افزایش احتمال merge شدن کدهای مشکل‌دار می‌شود. کاربر مشخصاً خواسته است که:
1. husky نصب و پیکربندی شود برای ایجاد git hooks.
2. lint-staged نصب شود برای اجرای linting و formatting فقط روی فایل‌های staged.
3. فایل `.husky/pre-commit` ایجاد شود که lint-staged را اجرا کند.
4. فایل `.lintstagedrc.json` یا بخشی در package.json برای تعریف دستورات روی فایل‌های staged (مثلاً eslint --fix و prettier --write) ایجاد شود.
5. خارج از این مرحله: تعریف قوانین ESLint یا Prettier.

کلیدواژه‌های اصلی: husky, lint-staged, .husky/pre-commit, .lintstagedrc.json, eslint --fix, prettier --write.

شواهد در کد واقعی پروژه:
- فایل `package.json` در ریشه پروژه (خطوط 1-16) نشان می‌دهد که پروژه از npm scripts استفاده می‌کند و دارای دستورات `install:all`, `dev`, `build`, `start` است. هیچ اشاره‌ای به husky یا lint-staged در dependencies یا devDependencies وجود ندارد.
- فایل `frontend/package.json` (در deep context موجود نیست اما در ساختار پروژه دیده می‌شود) احتمالاً دارای devDependencies شامل ESLint و Prettier نیست.
- فایل `backend/package.json` (خطوط 1-15 در deep context) فقط dependencies اصلی (cors, dotenv, express, ws) را دارد و هیچ devDependency برای linting یا formatting ندارد.
- فایل `.gitignore` در ریشه پروژه وجود دارد (در ساختار پروژه دیده می‌شود) که می‌توان `.husky/_` را به آن اضافه کرد.
- فایل `render.yaml` (در ساختار پروژه) برای deployment استفاده می‌شود و نیازی به تغییر ندارد.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] 1. پس از اجرای `npm install` در ریشه پروژه، پوشه `.husky` ایجاد شود و فایل `.husky/pre-commit` وجود داشته باشد.
- [ ] 2. فایل `.husky/pre-commit` دارای محتوای صحیح (#!/usr/bin/env sh و npx lint-staged) باشد.
- [ ] 3. فایل `.lintstagedrc.json` یا بخش lint-staged در `package.json` وجود داشته باشد و دستورات eslint --fix و prettier --write را برای فایل‌های JS/JSX تعریف کند.
- [ ] 4. پس از ایجاد یک تغییر در یک فایل JS (مثلاً `backend/server.js`) و اجرای `git commit`، lint-staged به طور خودکار اجرا شود و linting/formatting روی فایل‌های staged اعمال شود.
- [ ] 5. فایل `.gitignore` شامل خط `.husky/_` باشد تا فایل‌های داخلی husky commit نشوند.
- [ ] 6. دستور `npm run prepare` (یا `npx husky`) با موفقیت اجرا شود و git hooks فعال شوند.
- [ ] 7. اگر ESLint یا Prettier نصب نباشند، lint-staged باید خطای واضحی بدهد (نه اینکه سکوت کند).
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. برای پیاده‌سازی این درخواست، مراحل زیر باید انجام شود:

1. **نصب husky و lint-staged به عنوان devDependencies در ریشه پروژه:**
   - فایل `package.json` در ریشه پروژه (خطوط 1-16) را باز کنید.
   - دستور `npm install --save-dev husky lint-staged` را در ریشه پروژه اجرا کنید.
   - این کار husky و lint-staged را به `devDependencies` در `package.json` اضافه می‌کند.

2. **فعال‌سازی git hooks با husky:**
   - دستور `npx husky init` را اجرا کنید تا پوشه `.husky` ایجاد شود.
   - این کار فایل `.husky/pre-commit` را ایجاد می‌کند.

3. **ایجاد فایل `.husky/pre-commit`:**
   - فایل `.husky/pre-commit` را با محتوای زیر ایجاد کنید:
     ```bash
     #!/usr/bin/env sh
     . "$(dirname -- "$0")/_/husky.sh"
     
     npx lint-staged
     ```
   - این فایل مطمئن می‌شود که قبل از هر commit، lint-staged اجرا شود.

4. **ایجاد فایل `.lintstagedrc.json` یا افزودن بخش lint-staged به `package.json`:**
   - گزینه 1: ایجاد فایل `.lintstagedrc.json` در ریشه پروژه با محتوای:
     ```json
     {
       "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
       "*.{json,css,md}": ["prettier --write"]
     }
     ```
   - گزینه 2: افزودن بخش `lint-staged` به `package.json`:
     ```json
     "lint-staged": {
       "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
       "*.{json,css,md}": ["prettier --write"]
     }
     ```
   - توجه: کاربر خواسته است که تعریف قوانین ESLint یا Prettier خارج از این مرحله باشد. بنابراین فقط دستورات اجرایی تعریف می‌شوند.

5. **به‌روزرسانی `.gitignore`:**
   - فایل `.gitignore` را باز کنید و خط زیر را اضافه کنید:
     ```
     .husky/_
     ```
   - این کار از commit شدن فایل‌های داخلی husky جلوگیری می‌کند.

6. **افزودن script به `package.json` برای نصب آسان:**
   - در بخش `scripts` فایل `package.json`، دستور زیر را اضافه کنید:
     ```json
     "prepare": "husky"
     ```
   - این دستور بعد از `npm install` به طور خودکار husky را فعال می‌کند.

7. **تست پیکربندی:**
   - یک تغییر کوچک در یک فایل JS ایجاد کنید (مثلاً اضافه کردن یک کامنت در `backend/server.js`).
   - دستور `git add .` و سپس `git commit -m "test husky"` را اجرا کنید.
   - مطمئن شوید که lint-staged اجرا می‌شود و linting/formatting روی فایل‌های staged اعمال می‌شود.

## 💡 نمونه‌های قبل/بعد
**افزودن devDependencies و scripts به package.json**

_قبل:_
```
{
  "name": "lebanese-dialect-learning",
  "version": "1.0.0",
  "description": "Lebanese Arabic Learning App with AI",
  "scripts": {
    "install:all": "cd frontend && npm install && cd ../backend && npm install",
    "dev": "cd backend && npm run dev",
    "build": "cd frontend && npm run build",
    "start": "cd backend && npm start"
  },
  "keywords": ["lebanese", "arabic", "language-learning", "gemini", "ai"],
  "license": "MIT"
}
```

_بعد:_
```
{
  "name": "lebanese-dialect-learning",
  "version": "1.0.0",
  "description": "Lebanese Arabic Learning App with AI",
  "scripts": {
    "install:all": "cd frontend && npm install && cd ../backend && npm install",
    "dev": "cd backend && npm run dev",
    "build": "cd frontend && npm run build",
    "start": "cd backend && npm start",
    "prepare": "husky"
  },
  "keywords": ["lebanese", "arabic", "language-learning", "gemini", "ai"],
  "license": "MIT",
  "devDependencies": {
    "husky": "^9.0.0",
    "lint-staged": "^15.0.0"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,css,md}": ["prettier --write"]
  }
}
```

**ایجاد فایل .husky/pre-commit**

_قبل:_
```
فایل وجود ندارد.
```

_بعد:_
```
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `cd /path/to/project && npm install`
- `ls -la .husky/pre-commit`
- `cat .husky/pre-commit`
- `cat .lintstagedrc.json || grep '"lint-staged"' package.json`
- `echo 'console.log("test")' >> backend/server.js && git add backend/server.js && git commit -m 'test husky'`
- `git log -1 --name-only`
- `cat .gitignore | grep '.husky/_'`

## ⚠️ ریسک‌ها و موارد احتیاط
ریسک اصلی این است که اگر ESLint یا Prettier در پروژه نصب و پیکربندی نشده باشند (که کاربر خواسته است خارج از این مرحله باشد)، lint-staged با خطا مواجه می‌شود و commit را مسدود می‌کند. این می‌تواند workflow توسعه‌دهندگان را مختل کند. همچنین، اگر قوانین linting سختگیرانه باشند، ممکن است commit‌های کوچک نیز با خطا مواجه شوند. ریسک دیگر این است که فایل `.husky/pre-commit` در سیستم‌عامل‌های مختلف (Windows vs Linux/Mac) ممکن است به درستی کار نکند. برای کاهش این ریسک، باید از shebang صحیح (`#!/usr/bin/env sh`) استفاده شود و در مستندات به توسعه‌دهندگان ویندوزی توضیح داده شود که可能需要 نصب Git Bash یا WSL.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: feature_request
- اولویت: medium
- تخمین زمان: small

---

# 🔹 مرحله 3: تعریف و پیکربندی ESLint rules با قوانین strict

**Scope:** ایجاد یا به‌روزرسانی فایل `.eslintrc.json` (یا `.eslintrc.js`) با قوانین strict شامل: `@typescript-eslint/strict`, `react/recommended`, `import/order`, `no-console`, `no-unused-vars` و قوانین custom. همچنین نصب پکیج‌های لازم مانند `@typescript-eslint/eslint-plugin`, `eslint-plugin-react`, `eslint-plugin-import`. خارج از این مرحله: پیکربندی Prettier یا TypeScript compiler options.
**Key terms:** .eslintrc.json, @typescript-eslint/strict, eslint-plugin-react, eslint-plugin-import, no-console

**بخش مربوط از متن کاربر:**
```
پروژه فاقد GitHub Actions، pre-commit hooks، linting rules و code quality checks است. این موضوع باعث کاهش کیفیت کد، inconsistency در code style و افزایش احتمال merge شدن کدهای مشکل‌دار می‌شود.
```

## 🎯 هدف (خلاصه ساختاریافته)
تعریف و پیکربندی ESLint rules با قوانین strict برای پروژه Lebanese Dialect App

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `package.json:1-20` — `scripts` — فایل package.json اصلی پروژه. باید اسکریپت‌های lint و lint:fix به بخش scripts اضافه شود و devDependencies جدید نصب شوند.
  ```json
  {
    "name": "lebanese-dialect-learning",
    "version": "1.0.0",
    "description": "Lebanese Arabic Learning App with AI",
    "scripts": {
      "install:all": "cd frontend && npm install && cd ../backend && npm install",
      "dev": "cd backend && npm run dev",
      "build": "cd frontend && npm run build",
      "start": "cd backend && npm start"
    },
    "keywords": ["lebanese", "arabic", "language-learning", "gemini", "ai"],
    "license": "MIT"
  }
  ```
- `frontend/src/App.jsx:1-50` — `App component` — فایل اصلی کامپوننت React. باید با قوانین eslint-plugin-react و react-hooks بررسی شود.
  ```jsx
  فایل deep-read نشده — مجری باید مسیر را خود تأیید کند
  ```
- `backend/server.js:1-20` — `import statements` — فایل بک‌اند با importهای متعدد. rule import/order برای مرتب‌سازی این importها اعمال خواهد شد.
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
Stack تشخیص داده شده در بالا = JavaScript, React, Express, Vite, Tailwind CSS, Firebase, WebSocket, Gemini API, ffmpeg

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `frontend/src/main.jsx` (سطر 1) — فایل ورودی فرانت‌اند که توسط lint بررسی می‌شود
- `frontend/vite.config.js` (سطر 1) — فایل کانفیگ Vite که ممکن است نیاز به lint داشته باشد
- `backend/package.json` (سطر 1) — فایل package.json بک‌اند که ممکن است نیاز به اسکریپت lint جداگانه داشته باشد
- `frontend/package.json` (سطر 1) — فایل package.json فرانت‌اند که ممکن است نیاز به اسکریپت lint جداگانه داشته باشد

## 🌐 نقشهٔ وابستگی‌ها
این تسک فایل `.eslintrc.json` را در ریشه پروژه ایجاد می‌کند که بر تمام فایل‌های `.js` و `.jsx` در سراسر پروژه تأثیر می‌گذارد. فایل‌های `backend/server.js`، `frontend/src/App.jsx`، `frontend/src/main.jsx`، `frontend/vite.config.js` و `frontend/src/index.css` همگی تحت پوشش linting قرار می‌گیرند. پکیج‌های `eslint`، `eslint-plugin-react`، `eslint-plugin-import` و `eslint-plugin-react-hooks` به عنوان devDependencies به `package.json` اصلی اضافه می‌شوند. اسکریپت‌های `lint` و `lint:fix` به `package.json` اصلی اضافه می‌شوند. فایل‌های `backend/package.json` و `frontend/package.json` به صورت مستقیم تغییر نمی‌کنند اما می‌توان اسکریپت‌های lint مجزا نیز به آن‌ها اضافه کرد.

## 🔍 Context و وضعیت فعلی
کاربر درخواست ایجاد یا به‌روزرسانی فایل `.eslintrc.json` (یا `.eslintrc.js`) با قوانین strict شامل: `@typescript-eslint/strict`, `react/recommended`, `import/order`, `no-console`, `no-unused-vars` و قوانین custom را دارد. همچنین نصب پکیج‌های لازم مانند `@typescript-eslint/eslint-plugin`, `eslint-plugin-react`, `eslint-plugin-import`. خارج از این مرحله: پیکربندی Prettier یا TypeScript compiler options. کاربر اشاره کرده که پروژه فاقد GitHub Actions، pre-commit hooks، linting rules و code quality checks است. این موضوع باعث کاهش کیفیت کد، inconsistency در code style و افزایش احتمال merge شدن کدهای مشکل‌دار می‌شود. کلیدواژه‌های اصلی: `.eslintrc.json`, `@typescript-eslint/strict`, `eslint-plugin-react`, `eslint-plugin-import`, `no-console`. با بررسی کد واقعی پروژه، مشاهده می‌شود که پروژه از JavaScript (نه TypeScript) استفاده می‌کند. فایل‌های `backend/server.js` و `frontend/src/App.jsx` و `frontend/src/main.jsx` و `frontend/src/index.css` همگی با پسوند `.js` و `.jsx` هستند. فایل `frontend/vite.config.js` نیز از `@vitejs/plugin-react` استفاده می‌کند. فایل `package.json` اصلی در ریشه پروژه و `backend/package.json` و `frontend/package.json` موجود هستند. هیچ فایل ESLint یا Prettier در ساختار پروژه دیده نمی‌شود. بنابراین، درخواست کاربر برای قوانین `@typescript-eslint/strict` با توجه به اینکه پروژه TypeScript نیست، نیاز به تطبیق دارد. باید از `eslint-plugin-react` و `eslint-plugin-import` و قوانین `no-console` و `no-unused-vars` استفاده شود. همچنین باید یک فایل `.eslintrc.json` در ریشه پروژه ایجاد شود.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فایل `.eslintrc.json` در ریشه پروژه ایجاد شود و شامل قوانین `react/recommended`, `react-hooks/recommended`, `import/order`, `no-console: warn`, `no-unused-vars: error` باشد.
- [ ] پکیج‌های `eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-import` در `devDependencies` فایل `package.json` اصلی نصب شده باشند.
- [ ] اسکریپت `npm run lint` بدون خطا اجرا شود و هشدارهای مربوط به `no-console` را نمایش دهد.
- [ ] اسکریپت `npm run lint:fix` خطاهای `no-unused-vars` و مرتب‌سازی importها را به صورت خودکار اصلاح کند.
- [ ] فایل `backend/server.js` با rule `import/order` بررسی شود و importها به ترتیب صحیح مرتب شوند.
- [ ] فایل `frontend/src/App.jsx` با rule `react/recommended` بررسی شود و هیچ خطای react-related نداشته باشد.
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. 1. نصب پکیج‌های ESLint و پلاگین‌های مورد نیاز به عنوان devDependencies در ریشه پروژه (package.json اصلی): `npm install --save-dev eslint eslint-plugin-react eslint-plugin-import eslint-plugin-react-hooks`. 2. ایجاد فایل `.eslintrc.json` در ریشه پروژه با قوانین strict شامل: `react/recommended`, `react-hooks/recommended`, `import/order`, `no-console: warn`, `no-unused-vars: error`. 3. از آنجایی که پروژه TypeScript نیست، `@typescript-eslint/strict` حذف می‌شود. 4. اضافه کردن اسکریپت lint به `package.json` اصلی: `"lint": "eslint . --ext .js,.jsx"`. 5. اضافه کردن اسکریپت lint:fix: `"lint:fix": "eslint . --ext .js,.jsx --fix"`. 6. پیکربندی rule `import/order` برای مرتب‌سازی خودکار importها. 7. تنظیم rule `no-console` به `warn` برای هشدار در حین توسعه. 8. تنظیم rule `no-unused-vars` به `error` برای جلوگیری از متغیرهای استفاده نشده.

## 💡 نمونه‌های قبل/بعد
**اضافه کردن اسکریپت lint به package.json**

_قبل:_
```
{
  "scripts": {
    "install:all": "cd frontend && npm install && cd ../backend && npm install",
    "dev": "cd backend && npm run dev",
    "build": "cd frontend && npm run build",
    "start": "cd backend && npm start"
  }
}
```

_بعد:_
```
{
  "scripts": {
    "install:all": "cd frontend && npm install && cd ../backend && npm install",
    "dev": "cd backend && npm run dev",
    "build": "cd frontend && npm run build",
    "start": "cd backend && npm start",
    "lint": "eslint . --ext .js,.jsx",
    "lint:fix": "eslint . --ext .js,.jsx --fix"
  },
  "devDependencies": {
    "eslint": "^8.56.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-import": "^2.29.1"
  }
}
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `npm run lint`
- `npm run lint:fix`
- `npx eslint backend/server.js --ext .js`
- `npx eslint frontend/src/App.jsx --ext .jsx`

## ⚠️ ریسک‌ها و موارد احتیاط
این تسک فقط فایل‌های کانفیگ را تغییر می‌دهد و خطری برای کد اصلی ندارد. با این حال، اجرای `npm run lint:fix` ممکن است تغییرات خودکاری در فایل‌های موجود ایجاد کند (مانند مرتب‌سازی importها) که باید قبل از commit بررسی شوند. همچنین، rule `no-unused-vars: error` ممکن است باعث شکست lint در فایل‌هایی شود که متغیرهای استفاده نشده دارند (مانند `backend/server.js` خط 10: `import os from 'os'` که ممکن است در برخی مسیرها استفاده نشود).

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: feature_request
- اولویت: medium
- تخمین زمان: small

---

# 🔹 مرحله 4: تعریف و پیکربندی Prettier rules برای formatting یکپارچه

**Scope:** ایجاد فایل `.prettierrc.json` با تنظیمات formatting مانند: `semi: true`, `singleQuote: true`, `tabWidth: 2`, `trailingComma: 'all'`, `printWidth: 100`. همچنین ایجاد فایل `.prettierignore` برای exclude کردن فایل‌های خاص (مثل node_modules, dist). خارج از این مرحله: پیکربندی ESLint یا TypeScript.
**Key terms:** .prettierrc.json, .prettierignore, semi, singleQuote, tabWidth, trailingComma, printWidth

**بخش مربوط از متن کاربر:**
```
پروژه فاقد GitHub Actions، pre-commit hooks، linting rules و code quality checks است. این موضوع باعث کاهش کیفیت کد، inconsistency در code style و افزایش احتمال merge شدن کدهای مشکل‌دار می‌شود.
```

## 🎯 هدف (خلاصه ساختاریافته)
تعریف و پیکربندی Prettier rules برای formatting یکپارچه کد پروژه

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `package.json:1-15` — `scripts` — فایل package.json ریشه پروژه — باید اسکریپت‌های format و format:check به بخش scripts اضافه شود و prettier به devDependencies افزوده گردد.
  ```json
  {
    "name": "lebanese-dialect-learning",
    "version": "1.0.0",
    "description": "Lebanese Arabic Learning App with AI",
    "scripts": {
      "install:all": "cd frontend && npm install && cd ../backend && npm install",
      "dev": "cd backend && npm run dev",
      "build": "cd frontend && npm run build",
      "start": "cd backend && npm start"
    },
    "keywords": ["lebanese", "arabic", "language-learning", "gemini", "ai"],
    "license": "MIT"
  }
  ```
- `backend/server.js:1-1403` — `کل فایل` — این فایل 1403 خطی backend با قوانین prettier جدید فرمت خواهد شد — تغییرات عمدتاً در فاصله‌ها و نقل قول‌ها خواهد بود.
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
- `frontend/index.html:1-208` — `کل فایل` — فایل HTML اصلی frontend — prettier قوانین formatting را روی HTML نیز اعمال می‌کند (تغییر در فاصله‌گذاری تگ‌ها)
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
Stack تشخیص داده شده: JavaScript (ES Modules در backend با import/export، React + Vite در frontend). کتابخانه‌های مرتبط: express, cors, ws, multer, ffmpeg, dotenv در backend; react, react-dom, firebase, lucide-react در frontend; vite, tailwindcss, postcss, autoprefixer در devDependencies. پروژه از npm برای مدیریت وابستگی‌ها استفاده می‌کند.

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `frontend/src/App.jsx` (سطر 1) — فایل اصلی کامپوننت React — تحت تأثیر قوانین singleQuote و semi و tabWidth قرار می‌گیرد
- `frontend/src/main.jsx` (سطر 1) — فایل entry point React — با قوانین جدید prettier فرمت می‌شود
- `frontend/vite.config.js` (سطر 1) — فایل پیکربندی Vite — دارای نقل قول‌های تکی که با singleQuote: true مطابقت دارد
- `frontend/postcss.config.js` (سطر 1) — فایل پیکربندی PostCSS — تحت تأثیر قوانین prettier قرار می‌گیرد
- `frontend/tailwind.config.js` (سطر 1) — فایل پیکربندی Tailwind — با قوانین جدید فرمت می‌شود
- `backend/.env.example` (سطر 1) — فایل مثال env — در .prettierignore باید اضافه شود تا فرمت نشود
- `render.yaml` (سطر 1) — فایل پیکربندی Render — باید در .prettierignore اضافه شود چون فرمت YAML با prettier ممکن است مشکل ایجاد کند

## 🌐 نقشهٔ وابستگی‌ها
این تغییرات وابستگی جدید `prettier` را به `package.json` ریشه اضافه می‌کند. فایل‌های `.prettierrc.json` و `.prettierignore` در ریشه پروژه ایجاد می‌شوند. تمام فایل‌های پروژه شامل `backend/server.js`, `frontend/index.html`, `frontend/src/App.jsx`, `frontend/src/main.jsx`, `frontend/src/index.css`, `frontend/vite.config.js`, `frontend/postcss.config.js`, `frontend/tailwind.config.js`, `backend/.env.example`, `render.yaml` تحت تأثیر قرار می‌گیرند. فایل‌های `node_modules` در هر دو پوشه `backend` و `frontend` و پوشه `dist` در `frontend` باید در `.prettierignore` excluded شوند. هیچ وابستگی runtime جدیدی اضافه نمی‌شود و فقط devDependency است.

## 🔍 Context و وضعیت فعلی
کاربر درخواست ایجاد فایل `.prettierrc.json` با تنظیمات formatting مشخص شامل `semi: true`, `singleQuote: true`, `tabWidth: 2`, `trailingComma: 'all'`, `printWidth: 100` و همچنین ایجاد فایل `.prettierignore` برای exclude کردن فایل‌های خاص مثل `node_modules` و `dist` را داده است. کاربر تأکید کرده که این مرحله خارج از پیکربندی ESLint یا TypeScript است. همچنین در بخش مربوط از درخواست اصلی کاربر اشاره شده که پروژه فاقد GitHub Actions، pre-commit hooks، linting rules و code quality checks است و این موضوع باعث کاهش کیفیت کد، inconsistency در code style و افزایش احتمال merge شدن کدهای مشکل‌دار می‌شود. با بررسی کد واقعی پروژه، مشاهده می‌شود که در فایل‌های `backend/server.js` (1403 خط)، `frontend/index.html` (208 خط)، `frontend/src/App.jsx` و سایر فایل‌ها، هیچ فایل پیکربندی prettier یا linting وجود ندارد. ساختار پروژه شامل فایل‌های `package.json` در ریشه، `backend/package.json` و `frontend/package.json` است که هیچکدام dependency مربوط به prettier را ندارند. فایل `frontend/vite.config.js` و `frontend/postcss.config.js` و `frontend/tailwind.config.js` نیز فاقد هرگونه تنظیمات formatting هستند. کلیدواژه‌های درخواست: `.prettierrc.json`, `.prettierignore`, `semi`, `singleQuote`, `tabWidth`, `trailingComma`, `printWidth`.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فایل `.prettierrc.json` در ریشه پروژه ایجاد شده و شامل `{ "semi": true, "singleQuote": true, "tabWidth": 2, "trailingComma": "all", "printWidth": 100 }` باشد.
- [ ] فایل `.prettierignore` در ریشه پروژه ایجاد شده و شامل `node_modules`, `dist`, `build`, `*.min.js`, `*.bundle.js`, `coverage`, `.env`, `.env.*` باشد.
- [ ] دستور `npm run format` بدون خطا اجرا شده و تمام فایل‌های پروژه را با قوانین جدید فرمت کند.
- [ ] دستور `npm run format:check` بدون خطا اجرا شده و هیچ فایل خارج از قوانین گزارش نکند.
- [ ] فایل‌های `backend/server.js` و `frontend/index.html` پس از اجرای format تغییری در ساختار منطقی خود نداشته باشند (فقط formatting).
- [ ] فایل‌های موجود در `node_modules` و `dist` تحت تأثیر prettier قرار نگیرند.
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. 1. ایجاد فایل `.prettierrc.json` در ریشه پروژه با محتوای دقیق درخواست کاربر: `{ "semi": true, "singleQuote": true, "tabWidth": 2, "trailingComma": "all", "printWidth": 100 }`. 2. ایجاد فایل `.prettierignore` در ریشه پروژه با محتوای exclude کردن: `node_modules`, `dist`, `build`, `*.min.js`, `*.bundle.js`, `coverage`, `.env`, `.env.*`. 3. نصب prettier به عنوان devDependency در ریشه پروژه با دستور `npm install --save-dev prettier`. 4. افزودن اسکریپت‌های npm در `package.json` ریشه: `"format": "prettier --write ."` و `"format:check": "prettier --check ."`. 5. اجرای دستور `npm run format` برای اعمال formatting روی تمام فایل‌های موجود. 6. اطمینان از اینکه فایل‌های `backend/server.js`, `frontend/index.html`, `frontend/src/App.jsx`, `frontend/src/main.jsx`, `frontend/src/index.css` و سایر فایل‌های پروژه با قوانین جدید مطابقت دارند.

## 💡 نمونه‌های قبل/بعد
**تغییر در backend/server.js (نمونه import)**

_قبل:_
```
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
```

_بعد:_
```
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
```

**تغییر در frontend/vite.config.js**

_قبل:_
```
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist'
  }
})
```

_بعد:_
```
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `npm run format:check`
- `npm run format`
- `npx prettier --check backend/server.js`
- `npx prettier --check frontend/index.html`
- `npx prettier --check frontend/src/App.jsx`

## ⚠️ ریسک‌ها و موارد احتیاط
ریسک اصلی: تغییر formatting در فایل `backend/server.js` (1403 خط) ممکن است باعث ایجاد conflict در git history شود، به خصوص که آخرین کامیت‌ها مربوط به Inspector Bridge Script هستند. فایل `frontend/index.html` شامل اسکریپت‌های inline (Inspector Bridge Script در خطوط 32-201) است که prettier ممکن است آن‌ها را به هم بریزد — باید اطمینان حاصل شود که prettier اسکریپت‌های inline را دستکاری نمی‌کند. همچنین فایل `render.yaml` با فرمت YAML است و prettier به صورت پیش‌فرض از YAML پشتیبانی نمی‌کند — باید در `.prettierignore` اضافه شود. فایل‌های `package-lock.json` در backend و frontend نباید فرمت شوند چون فایل‌های auto-generated هستند.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: feature_request
- اولویت: medium
- تخمین زمان: small

---

# 🔹 مرحله 5: اضافه کردن GitHub Actions workflow برای اجرای تست‌ها

**Scope:** اضافه کردن یک job جدید در فایل `.github/workflows/ci.yml` (یا یک فایل جداگانه) که تست‌های unit و integration را اجرا کند. این job باید بعد از job linting اجرا شود و شامل: نصب dependencies، اجرای `npm test` (یا `yarn test`) با coverage report. خارج از این مرحله: نوشتن تست‌ها، پیکربندی coverage threshold.
**Key terms:** .github/workflows/ci.yml, npm test, coverage, unit tests, integration tests

**بخش مربوط از متن کاربر:**
```
پروژه فاقد GitHub Actions، pre-commit hooks، linting rules و code quality checks است. این موضوع باعث کاهش کیفیت کد، inconsistency در code style و افزایش احتمال merge شدن کدهای مشکل‌دار می‌شود.
```

## 🎯 هدف (خلاصه ساختاریافته)
اضافه کردن GitHub Actions workflow برای اجرای تست‌های unit و integration با پوشش کد (coverage)

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `.github/workflows/ci.yml:1-40` — `N/A (فایل جدید)` — این فایل در ساختار پروژه وجود ندارد و باید ایجاد شود. مسیر آن از ریشه پروژه است.
- `package.json:1-15` — `scripts` — در `package.json` اصلی هیچ اسکریپت تستی وجود ندارد. باید یک اسکریپت `"test": "cd frontend && npm test && cd ../backend && npm test"` اضافه شود تا تست‌های هر دو بخش اجرا شوند.
  ```json
  {
    "name": "lebanese-dialect-learning",
    "version": "1.0.0",
    "description": "Lebanese Arabic Learning App with AI",
    "scripts": {
      "install:all": "cd frontend && npm install && cd ../backend && npm install",
      "dev": "cd backend && npm run dev",
      "build": "cd frontend && npm run build",
      "start": "cd backend && npm start"
    },
    "keywords": ["lebanese", "arabic", "language-learning", "gemini", "ai"],
    "license": "MIT"
  }
  ```
- `backend/package.json:1-15` — `scripts` — فایل `backend/package.json` در deep context موجود نیست، اما بر اساس `backend/package-lock.json` و `backend/server.js`، این فایل باید شامل dependencies مانند express, cors, dotenv, ws, multer, fluent-ffmpeg, ffmpeg-static باشد. اسکریپت `test` باید به `"jest --coverage"` تغییر یابد.
- `frontend/package.json:1-15` — `scripts` — فایل `frontend/package.json` در deep context موجود نیست، اما بر اساس `frontend/package-lock.json` و `frontend/vite.config.js`، این فایل باید شامل dependencies مانند react, react-dom, firebase, lucide-react و devDependencies مانند vite, @vitejs/plugin-react, tailwindcss, postcss, autoprefixer باشد. اسکریپت `test` باید به `"vitest run --coverage"` تغییر یابد.

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Stack تشخیص داده شده: JavaScript (Node.js برای backend، React/Vite برای frontend). کتابخانه‌های مرتبط: Express.js (backend)، React 18 (frontend)، Vite (build tool)، Tailwind CSS (styling)، Firebase (احتمالاً برای احراز هویت/دیتابیس)، Lucide React (آیکون‌ها). برای تست‌ها: Jest (پیشنهادی برای backend)، Vitest (پیشنهادی برای frontend).

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `backend/server.js` (سطر 167) — این فایل شامل endpointهای اصلی backend است. تست‌های integration باید این endpointها را تست کنند (مثلاً GET /api/health در خط 167).
- `frontend/src/App.jsx` (سطر 1) — این فایل کامپوننت اصلی React است. تست‌های unit باید رندر شدن این کامپوننت و عملکرد دکمه‌ها/فرم‌های آن را بررسی کنند.
- `frontend/vite.config.js` (سطر 1) — این فایل پیکربندی Vite است. برای اجرای تست‌ها با Vitest، باید پیکربندی `test` به این فایل اضافه شود (مثلاً `test: { environment: 'jsdom', globals: true }`).
- `render.yaml` (سطر 1) — این فایل برای استقرار روی Render استفاده می‌شود. اضافه شدن workflow CI تأثیری روی آن ندارد، اما باید مطمئن شد که فایل‌های جدید (مانند `jest.config.js`) در build نهایی تأثیر منفی نگذارند.
- `backend/.env.example` (سطر 1) — برای تست‌های integration که نیاز به API key دارند، باید یک فایل `.env.test` ایجاد شود و در workflow CI از secrets استفاده شود.

## 🌐 نقشهٔ وابستگی‌ها
این تغییر شامل ایجاد فایل جدید `.github/workflows/ci.yml` و تغییر در فایل‌های `package.json` (ریشه، backend، frontend) است. فایل `package.json` ریشه (ریشه پروژه) اسکریپت‌های `install:all`, `dev`, `build`, `start` را دارد و اسکریپت `test` به آن اضافه می‌شود. فایل `backend/package.json` (که در deep context موجود نیست اما از `backend/package-lock.json` قابل استنباط است) شامل dependencies اصلی backend است. فایل `frontend/package.json` (که از `frontend/package-lock.json` قابل استنباط است) شامل dependencies اصلی frontend است. فایل `backend/server.js` (خط 167) endpoint `/api/health` را تعریف می‌کند که یک تست ساده برای آن می‌توان نوشت. فایل `frontend/src/App.jsx` کامپوننت اصلی است. فایل `frontend/vite.config.js` پیکربندی Vite را دارد. هیچ وابستگی مستقیمی بین این فایل‌ها و workflow CI وجود ندارد، اما workflow باید بتواند dependencies هر دو بخش را نصب کرده و تست‌ها را اجرا کند.

## 🔍 Context و وضعیت فعلی
کاربر درخواست اضافه کردن یک GitHub Actions workflow جدید برای اجرای تست‌ها را دارد. این workflow باید در فایل `.github/workflows/ci.yml` (یا یک فایل جداگانه) تعریف شود و شامل یک job جدید باشد که تست‌های unit و integration را اجرا کند. این job باید بعد از job linting اجرا شود و مراحل آن شامل: نصب dependencies، اجرای `npm test` (یا `yarn test`) با گزارش coverage باشد. کاربر تأکید کرده که نوشتن خود تست‌ها و پیکربندی coverage threshold خارج از این مرحله است. همچنین اشاره شده که پروژه فاقد GitHub Actions، pre-commit hooks، linting rules و code quality checks است که باعث کاهش کیفیت کد، inconsistency در code style و افزایش احتمال merge شدن کدهای مشکل‌دار می‌شود. کلیدواژه‌های اصلی: `.github/workflows/ci.yml`, `npm test`, `coverage`, `unit tests`, `integration tests`. با بررسی کد واقعی پروژه (backend/server.js, frontend/index.html, package.json, backend/package.json, frontend/package.json) مشخص شد که: 1) پروژه از دو بخش frontend (React/Vite) و backend (Express/Node.js) تشکیل شده است. 2) در `package.json` اصلی (ریشه) اسکریپت‌های `install:all`, `dev`, `build`, `start` وجود دارد اما هیچ اسکریپت تستی (`test`) تعریف نشده است. 3) در `backend/package.json` و `frontend/package.json` نیز هیچ اسکریپت تستی وجود ندارد. 4) فایل `render.yaml` برای استقرار روی Render پیکربندی شده است. 5) فایل `.github/workflows/ci.yml` در ساختار پروژه وجود ندارد. بنابراین، اولین گام برای پیاده‌سازی این درخواست، اضافه کردن اسکریپت‌های تست به `package.json`های مربوطه و سپس ایجاد فایل workflow است.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فایل `.github/workflows/ci.yml` در ریشه پروژه ایجاد شده باشد و شامل یک job به نام `test` باشد که بعد از job `lint` اجرا شود.
- [ ] در `package.json` ریشه، اسکریپت `"test": "cd frontend && npm test && cd ../backend && npm test"` اضافه شده باشد.
- [ ] در `backend/package.json`، اسکریپت `"test": "jest --coverage"` تنظیم شده باشد و Jest به عنوان devDependency نصب شده باشد.
- [ ] در `frontend/package.json`، اسکریپت `"test": "vitest run --coverage"` تنظیم شده باشد و Vitest به عنوان devDependency نصب شده باشد.
- [ ] یک تست ساده برای endpoint `/api/health` در backend (فایل `backend/__tests__/health.test.js`) نوشته شده باشد که status 200 و body `{ status: 'ok' }` را بررسی کند.
- [ ] یک تست ساده برای کامپوننت `App.jsx` در frontend (فایل `frontend/src/__tests__/App.test.jsx`) نوشته شده باشد که رندر شدن کامپوننت را بررسی کند.
- [ ] گزارش coverage پس از اجرای workflow در GitHub Actions به صورت artifact قابل دانلود باشد.
- [ ] workflow روی push و pull_request به شاخه main فعال شود.
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. 1. **ایجاد فایل `.github/workflows/ci.yml`**: این فایل را در ریشه پروژه ایجاد کن. 2. **تعریف workflow با نام `CI`**: این workflow باید روی رویدادهای `push` و `pull_request` به شاخه `main` (یا شاخه‌های اصلی) فعال شود. 3. **تعریف job `lint`**: (اختیاری، برای رعایت ترتیب) یک job برای linting با استفاده از ابزارهایی مانند ESLint. 4. **تعریف job `test`**: این job باید `needs: lint` داشته باشد تا بعد از linting اجرا شود. 5. **مراحل job `test`**: a) `actions/checkout@v4` برای دریافت کد. b) `actions/setup-node@v4` با `node-version: 18` (بر اساس `engines` در `package.json`ها). c) نصب dependencies برای هر دو بخش: `cd frontend && npm ci` و `cd backend && npm ci`. d) اجرای تست‌ها با `npm test` (باید ابتدا اسکریپت تست در `package.json`ها اضافه شود). e) آپلود گزارش coverage با استفاده از `actions/upload-artifact@v4`. 6. **اضافه کردن اسکریپت تست به `package.json`ها**: در `backend/package.json` و `frontend/package.json` یک اسکریپت `"test": "echo \"Error: no test specified\" && exit 1"` به صورت پیش‌فرض وجود دارد که باید با یک فریمورک تست واقعی (مثلاً Jest برای backend و Vitest برای frontend) جایگزین شود. 7. **نصب فریمورک تست**: برای backend: `npm install --save-dev jest`. برای frontend: `npm install --save-dev vitest @testing-library/react jsdom`. 8. **پیکربندی coverage**: در `jest.config.js` یا `vitest.config.js` گزینه `collectCoverage: true` و `coverageDirectory: "coverage"` تنظیم شود. 9. **ایجاد تست نمونه**: یک فایل تست ساده برای backend (مثلاً `backend/__tests__/health.test.js`) و frontend (مثلاً `frontend/src/__tests__/App.test.jsx`) ایجاد کن.

## 💡 نمونه‌های قبل/بعد
**اضافه کردن اسکریپت تست به package.json ریشه**

_قبل:_
```
{
  "scripts": {
    "install:all": "cd frontend && npm install && cd ../backend && npm install",
    "dev": "cd backend && npm run dev",
    "build": "cd frontend && npm run build",
    "start": "cd backend && npm start"
  }
}
```

_بعد:_
```
{
  "scripts": {
    "install:all": "cd frontend && npm install && cd ../backend && npm install",
    "dev": "cd backend && npm run dev",
    "build": "cd frontend && npm run build",
    "start": "cd backend && npm start",
    "test": "cd frontend && npm test && cd ../backend && npm test"
  }
}
```

**ایجاد فایل .github/workflows/ci.yml**

_قبل:_
```
(فایل وجود ندارد)
```

_بعد:_
```
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: cd frontend && npm ci
      - run: cd frontend && npm run lint

  test:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - name: Install dependencies
        run: |
          cd frontend && npm ci
          cd ../backend && npm ci
      - name: Run tests with coverage
        run: npm test
      - name: Upload coverage reports
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `cd backend && npx jest --coverage`
- `cd frontend && npx vitest run --coverage`
- `npm test (از ریشه پروژه)`
- `gh workflow run CI (برای تست دستی workflow)`

## ⚠️ ریسک‌ها و موارد احتیاط
1. **عدم وجود اسکریپت lint**: در حال حاضر هیچ اسکریپت linting در `package.json`ها تعریف نشده است. اگر job `lint` در workflow تعریف شود، باید ابتدا ابزار linting (مثلاً ESLint) نصب و پیکربندی شود. در غیر این صورت، job `lint` با خطا مواجه می‌شود. 2. **تغییر در `package.json`ها**: اضافه کردن devDependencies جدید (Jest, Vitest) ممکن است با dependencies موجود تداخل داشته باشد. باید پس از نصب، تست‌ها اجرا شوند. 3. **نیاز به API key برای تست‌های integration**: برخی endpointها (مانند `/api/gemini/chat` در خط 56 `backend/server.js`) نیاز به `GEMINI_API_KEY` دارند. برای تست‌های integration باید یک mock یا یک API key تستی در secrets GitHub تنظیم شود. 4. **تأثیر بر build**: فایل‌های پیکربندی جدید (مانند `jest.config.js`, `vitest.config.js`) ممکن است در build نهایی (که توسط Render استفاده می‌شود) تأثیر بگذارند. باید مطمئن شد که این فایل‌ها در build نهایی نادیده گرفته می‌شوند.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: feature_request
- اولویت: medium
- تخمین زمان: medium

---

# 🔹 مرحله 6: اضافه کردن GitHub Actions workflow برای security scanning (CodeQL)

**Scope:** اضافه کردن یک workflow جدید با استفاده از `github/codeql-action` برای scanning vulnerabilities در کد. این workflow باید به صورت هفتگی یا در هر push اجرا شود و نتایج را در GitHub Security tab نمایش دهد. خارج از این مرحله: پیکربندی dependency scanning یا secrets scanning.
**Key terms:** github/codeql-action, CodeQL, security scanning, vulnerabilities, GitHub Security tab

**بخش مربوط از متن کاربر:**
```
پروژه فاقد GitHub Actions، pre-commit hooks، linting rules و code quality checks است. این موضوع باعث کاهش کیفیت کد، inconsistency در code style و افزایش احتمال merge شدن کدهای مشکل‌دار می‌شود.
```

## 🎯 هدف (خلاصه ساختاریافته)
اضافه کردن GitHub Actions workflow برای security scanning با CodeQL

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `.github/workflows/codeql-analysis.yml:1-30` — `N/A (فایل جدید)` — این فایل جدید باید ایجاد شود. مسیر از ریشه پروژه است. فایل مشابهی در ساختار فعلی وجود ندارد.
- `backend/server.js:1-12` — `import statements` — این فایل حاوی کدهای backend است که توسط CodeQL برای یافتن vulnerabilities اسکن خواهد شد. importهای مختلف نشان‌دهنده وابستگی‌های متعدد است.
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
- `frontend/src/App.jsx:1-10` — `App component` — این فایل deep-read نشده است — مجری باید مسیر را خود تأیید کند. فایل کامپوننت اصلی React است که توسط CodeQL اسکن می‌شود.

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Stack تشخیص داده شده: JavaScript (Node.js برای backend با Express.js، React/Vite برای frontend). کتابخانه‌های مرتبط: express, cors, ws, multer, fluent-ffmpeg, ffmpeg-static (backend) و react, react-dom, firebase, lucide-react, vite, tailwindcss (frontend). ابزار CI/CD: GitHub Actions با اکشن `github/codeql-action@v3`.

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `backend/package.json` (سطر 1) — این فایل وابستگی‌های backend را مشخص می‌کند. CodeQL از آن برای تحلیل dependency vulnerabilities استفاده می‌کند.
- `frontend/package.json` (سطر 1) — این فایل وابستگی‌های frontend را مشخص می‌کند. CodeQL از آن برای تحلیل dependency vulnerabilities استفاده می‌کند.
- `package.json` (سطر 1) — فایل package.json ریشه پروژه که اسکریپت‌های build و start را تعریف می‌کند. workflow ممکن است برای build به این اسکریپت‌ها نیاز داشته باشد.
- `frontend/index.html` (سطر 1) — فایل HTML اصلی frontend که حاوی Firebase config و Inspector Bridge Script است. CodeQL می‌تواند vulnerabilities مرتبط با XSS یا نشت اطلاعات را در اینجا شناسایی کند.
- `render.yaml` (سطر 1) — فایل پیکربندی استقرار در Render.com. اگر workflow نیاز به استقرار داشته باشد، ممکن است با این فایل تداخل داشته باشد.

## 🌐 نقشهٔ وابستگی‌ها
این تسک یک فایل جدید `.github/workflows/codeql-analysis.yml` ایجاد می‌کند که به هیچ فایل موجود وابسته نیست، اما بر روی تمام فایل‌های کد منبع پروژه تأثیر می‌گذارد. فایل‌های اصلی تحت اسکن: `backend/server.js` (Express backend با 12 import مختلف شامل express, cors, ws, multer, ffmpeg)، `frontend/src/App.jsx` (کامپوننت اصلی React)، `frontend/index.html` (HTML با Firebase config و inline script). فایل‌های پیکربندی وابستگی: `backend/package.json` (شامل وابستگی‌های express, cors, dotenv, ws)، `frontend/package.json` (شامل react, react-dom, firebase, lucide-react, vite, tailwindcss)، `package.json` ریشه (شامل firebase, lucide-react, react). فایل `render.yaml` برای استقرار استفاده می‌شود و ممکن است نیاز به تنظیمات اضافی برای هماهنگی با workflow داشته باشد.

## 🔍 Context و وضعیت فعلی
کاربر درخواست اضافه کردن یک GitHub Actions workflow جدید با استفاده از `github/codeql-action` برای scanning vulnerabilities در کد را دارد. این workflow باید به صورت هفتگی یا در هر push اجرا شود و نتایج را در GitHub Security tab نمایش دهد. همچنین اشاره شده که پروژه فاقد GitHub Actions، pre-commit hooks، linting rules و code quality checks است که باعث کاهش کیفیت کد، inconsistency در code style و افزایش احتمال merge شدن کدهای مشکل‌دار می‌شود. کلیدواژه‌های اصلی: `github/codeql-action`, CodeQL, security scanning, vulnerabilities, GitHub Security tab. پروژه فعلی شامل یک backend مبتنی بر Express.js (فایل `backend/server.js`) و یک frontend مبتنی بر React/Vite (فایل `frontend/index.html` و `frontend/src/App.jsx`) است. هیچ فایل GitHub Actions (.github/workflows/) در ساختار پروژه وجود ندارد. فایل `render.yaml` برای استقرار در Render.com استفاده می‌شود. فایل `package.json` در ریشه پروژه اسکریپت‌های `install:all`, `dev`, `build`, `start` را تعریف کرده است. backend از `express`, `cors`, `ws`, `multer`, `fluent-ffmpeg`, `ffmpeg-static` استفاده می‌کند. frontend از `react`, `react-dom`, `firebase`, `lucide-react`, `vite`, `tailwindcss` استفاده می‌کند. کاربر خارج از این مرحله، پیکربندی dependency scanning یا secrets scanning را خواسته است.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فایل `.github/workflows/codeql-analysis.yml` در ریشه پروژه ایجاد شده باشد.
- [ ] workflow با نام "CodeQL Security Scan" روی push به شاخه‌های main و develop فعال شود.
- [ ] workflow به صورت هفتگی (یکشنبه هر هفته) طبق cron '0 0 * * 0' اجرا شود.
- [ ] workflow از `github/codeql-action/init@v3` با زبان javascript استفاده کند.
- [ ] workflow از `github/codeql-action/autobuild@v3` برای build خودکار استفاده کند.
- [ ] workflow از `github/codeql-action/analyze@v3` برای ارسال نتایج به GitHub Security tab استفاده کند.
- [ ] نتایج اسکن در GitHub Security tab (Security > Code scanning alerts) قابل مشاهده باشد.
- [ ] workflow در pull request به شاخه main نیز اجرا شود.
- [ ] هیچ خطای build در زمان اجرای workflow رخ ندهد (با توجه به اسکریپت‌های build موجود در package.json ریشه).
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. 1. ایجاد دایرکتوری `.github/workflows/` در ریشه پروژه. 2. ایجاد فایل `codeql-analysis.yml` در `.github/workflows/`. 3. تعریف workflow با نام "CodeQL Security Scan" که روی رویدادهای `push` به شاخه‌های `main` و `develop` و `schedule` (هفتگی) و `pull_request` به `main` فعال شود. 4. استفاده از اکشن `github/codeql-action/init@v3` با زبان‌های `javascript` (برای backend و frontend). 5. استفاده از `github/codeql-action/autobuild@v3` برای build خودکار. 6. استفاده از `github/codeql-action/analyze@v3` برای ارسال نتایج به GitHub Security tab. 7. اطمینان از اینکه workflow در فایل‌های `backend/server.js` و `frontend/src/App.jsx` و `frontend/index.html` و `backend/package.json` و `frontend/package.json` و `package.json` (ریشه) اسکن انجام دهد.

## 💡 نمونه‌های قبل/بعد
**ایجاد فایل workflow جدید**

_قبل:_
```
فایل `.github/workflows/codeql-analysis.yml` وجود ندارد.
```

_بعد:_
```
```yaml
name: "CodeQL Security Scan"
on:
  push:
    branches: [ "main", "develop" ]
  pull_request:
    branches: [ "main" ]
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday
jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest
    permissions:
      security-events: write
      actions: read
      contents: read
    strategy:
      fail-fast: false
      matrix:
        language: [ 'javascript' ]
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4
    - name: Initialize CodeQL
      uses: github/codeql-action/init@v3
      with:
        languages: ${{ matrix.language }}
    - name: Autobuild
      uses: github/codeql-action/autobuild@v3
    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v3
      with:
        category: "/language:${{matrix.language}}"
```
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `git add .github/workflows/codeql-analysis.yml && git commit -m "Add CodeQL workflow" && git push origin main`
- `پس از push، به GitHub > Actions رفته و اجرای workflow را بررسی کنید.`
- `پس از اتمام workflow، به GitHub > Security > Code scanning alerts رفته و نتایج را مشاهده کنید.`
- `یک pull request به شاخه main ایجاد کنید و مطمئن شوید workflow اجرا می‌شود.`

## ⚠️ ریسک‌ها و موارد احتیاط
ریسک اصلی: اگر پروژه به درستی build نشود (مثلاً به دلیل وابستگی‌های ناقص در `package.json` ریشه یا `backend/package.json` یا `frontend/package.json`)، مرحله autobuild شکست می‌خورد و اسکن انجام نمی‌شود. فایل `backend/server.js` از importهای ES Module استفاده می‌کند که ممکن است نیاز به تنظیم `type: module` در `backend/package.json` داشته باشد (در فایل deep-read شده `backend/package-lock.json` این تنظیم دیده نمی‌شود). همچنین فایل `frontend/index.html` حاوی Firebase config با apiKey است که ممکن است توسط CodeQL به عنوان vulnerability گزارش شود (نشت credentials).

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: feature_request
- اولویت: medium
- تخمین زمان: small

---

# 🔹 مرحله 7: اضافه کردن Dependabot برای به‌روزرسانی خودکار dependencies

**Scope:** ایجاد فایل `.github/dependabot.yml` برای فعال‌سازی Dependabot که به‌روزرسانی‌های امنیتی و نسخه‌های جدید dependencies را به صورت خودکار پیشنهاد دهد. باید برای package manager (npm/yarn) و شاید Docker پیکربندی شود. خارج از این مرحله: پیکربندی CodeQL یا secrets scanning.
**Key terms:** .github/dependabot.yml, Dependabot, dependencies, security updates, npm

**بخش مربوط از متن کاربر:**
```
پروژه فاقد GitHub Actions، pre-commit hooks، linting rules و code quality checks است. این موضوع باعث کاهش کیفیت کد، inconsistency در code style و افزایش احتمال merge شدن کدهای مشکل‌دار می‌شود.
```

## 🎯 هدف (خلاصه ساختاریافته)
اضافه کردن فایل پیکربندی Dependabot برای به‌روزرسانی خودکار وابستگی‌های npm

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `.github/dependabot.yml:1-30` — `N/A (فایل جدید)` — این فایل جدید باید ایجاد شود. مسیر آن از ریشه پروژه است. فایل deep-read نشده — مجری باید مسیر را خود تأیید کند.
- `backend/package.json:1-16` — `dependencies` — این فایل نشان‌دهنده وابستگی‌های npm backend است که Dependabot باید آن‌ها را مانیتور کند.
  ```json
  {
    "name": "lebanese-dialect-backend",
    "version": "1.0.0",
    "dependencies": {
      "cors": "^2.8.5",
      "dotenv": "^16.3.1",
      "express": "^4.18.2",
      "ws": "^8.19.0"
    }
  }
  ```
- `frontend/package.json:1-16` — `dependencies` — این فایل نشان‌دهنده وابستگی‌های npm frontend است که Dependabot باید آن‌ها را مانیتور کند.
  ```json
  {
    "name": "lebanese-dialect-frontend",
    "version": "1.0.0",
    "dependencies": {
      "firebase": "^10.7.0",
      "lucide-react": "^0.294.0",
      "react": "^18.2.0",
      "react-dom": "^18.2.0"
    }
  }
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Stack تشخیص داده شده: JavaScript (Node.js backend با Express، frontend با React/Vite). Package manager: npm. Deployment: Render (بر اساس فایل render.yaml).

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `package.json` (سطر 1) — فایل ریشه package.json حاوی وابستگی‌های کلی پروژه است و Dependabot باید آن را نیز اسکن کند.
- `backend/server.js` (سطر 1) — این فایل از وابستگی‌های npm مانند express, cors, ws, multer, fluent-ffmpeg استفاده می‌کند که در package.json backend تعریف شده‌اند.
- `frontend/index.html` (سطر 11) — این فایل از firebase استفاده می‌کند که وابستگی آن در frontend/package.json تعریف شده است.
- `render.yaml` (سطر 1) — فایل پیکربندی deployment که ممکن است نیاز به به‌روزرسانی داشته باشد اگر Dependabot تغییراتی در dependencies ایجاد کند.

## 🌐 نقشهٔ وابستگی‌ها
این تسک یک فایل پیکربندی جدید (`.github/dependabot.yml`) ایجاد می‌کند که هیچ وابستگی به کد موجود ندارد. اما بر روی فرآیند به‌روزرسانی وابستگی‌های npm در فایل‌های `backend/package.json` و `frontend/package.json` تأثیر می‌گذارد. فایل‌های `backend/server.js` و `frontend/index.html` از این وابستگی‌ها استفاده می‌کنند و ممکن است با به‌روزرسانی‌های خودکار تحت تأثیر قرار گیرند. فایل `render.yaml` نیز ممکن است نیاز به تنظیمات جدید برای پشتیبانی از Dependabot داشته باشد.

## 🔍 Context و وضعیت فعلی
کاربر درخواست اضافه کردن Dependabot برای به‌روزرسانی خودکار dependencies را دارد. باید فایل `.github/dependabot.yml` ایجاد شود تا Dependabot به‌روزرسانی‌های امنیتی و نسخه‌های جدید dependencies را به صورت خودکار پیشنهاد دهد. پیکربندی باید برای package manager (npm/yarn) انجام شود. کاربر اشاره کرده که خارج از این مرحله، پیکربندی CodeQL یا secrets scanning مد نظر نیست. همچنین کاربر اشاره کرده که پروژه فاقد GitHub Actions، pre-commit hooks، linting rules و code quality checks است که باعث کاهش کیفیت کد، inconsistency در code style و افزایش احتمال merge شدن کدهای مشکل‌دار می‌شود. کلیدواژه‌های اصلی: `.github/dependabot.yml`, Dependabot, dependencies, security updates, npm.

شواهد در کد واقعی پروژه:
- فایل `backend/package.json` (خطوط 1-16) نشان می‌دهد که پروژه از npm به عنوان package manager استفاده می‌کند و وابستگی‌هایی مانند express, cors, dotenv, ws, multer, fluent-ffmpeg, ffmpeg-static, pdf-parse دارد.
- فایل `frontend/package.json` (خطوط 1-16) نشان می‌دهد که پروژه frontend از npm استفاده می‌کند و وابستگی‌هایی مانند react, react-dom, firebase, lucide-react, vite, tailwindcss دارد.
- فایل `package.json` ریشه (خطوط 1-16) نشان می‌دهد که پروژه از npm scripts برای مدیریت استفاده می‌کند.
- فایل `backend/server.js` (خطوط 1-12) importهای متعددی از npm packages دارد.
- فایل `frontend/index.html` (خطوط 11-18) از firebase استفاده می‌کند که در package.json ذکر شده است.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فایل `.github/dependabot.yml` در ریشه پروژه ایجاد شده باشد.
- [ ] پیکربندی شامل دو entry برای package-ecosystem 'npm' باشد: یکی برای دایرکتوری '/backend' و دیگری برای '/frontend'.
- [ ] schedule برای هر دو entry روی 'daily' تنظیم شده باشد.
- [ ] open-pull-requests-limit برای هر entry روی 10 تنظیم شده باشد.
- [ ] labels شامل 'dependencies' و 'automated' برای هر entry باشد.
- [ ] فایل با موفقیت در مخزن GitHub push شود و Dependabot در تب Insights > Dependency graph قابل مشاهده باشد.
- [ ] Dependabot پس از فعال‌سازی، یک Pull Request آزمایشی برای به‌روزرسانی یک dependency ایجاد کند.
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. 1. ایجاد دایرکتوری `.github/` در ریشه پروژه (اگر وجود ندارد).
2. ایجاد فایل `.github/dependabot.yml` با پیکربندی زیر:
   - نسخه: 2
   - دو اکو سیستم: npm (برای backend و frontend)
   - تنظیم schedule برای بررسی روزانه (daily)
   - assignees: خالی (اختیاری)
   - reviewers: خالی (اختیاری)
   - open-pull-requests-limit: 10
3. پیکربندی برای هر دو package.json (backend و frontend) به صورت جداگانه.
4. اضافه کردن labels مناسب مانند 'dependencies', 'automated'.
5. تنظیم target-branch به 'main' (یا شاخه اصلی پروژه).
6. اطمینان از اینکه فایل در مسیر صحیح `.github/dependabot.yml` قرار می‌گیرد.

فایل‌های واقعی مرتبط:
- `backend/package.json` (خطوط 1-16): وابستگی‌های backend
- `frontend/package.json` (خطوط 1-16): وابستگی‌های frontend
- `package.json` ریشه (خطوط 1-16): وابستگی‌های ریشه
- `backend/server.js` (خطوط 1-12): importهای واقعی از npm packages
- `frontend/index.html` (خطوط 11-18): استفاده از firebase

## 💡 نمونه‌های قبل/بعد
**ایجاد فایل .github/dependabot.yml**

_قبل:_
```
فایل وجود ندارد
```

_بعد:_
```
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/backend'
    schedule:
      interval: 'daily'
    open-pull-requests-limit: 10
    labels:
      - 'dependencies'
      - 'automated'
  - package-ecosystem: 'npm'
    directory: '/frontend'
    schedule:
      interval: 'daily'
    open-pull-requests-limit: 10
    labels:
      - 'dependencies'
      - 'automated'
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `بررسی وجود فایل: ls -la .github/dependabot.yml`
- `اعتبارسنجی YAML: yamllint .github/dependabot.yml`
- `بررسی فعال‌سازی Dependabot در GitHub: مراجعه به Settings > Security > Dependabot alerts در مخزن GitHub`

## ⚠️ ریسک‌ها و موارد احتیاط
ریسک اصلی این است که Dependabot ممکن است Pull Requestهایی برای به‌روزرسانی dependencies ایجاد کند که با نسخه‌های فعلی ناسازگار باشند. این موضوع به‌ویژه برای وابستگی‌های حیاتی مانند `express` (backend/server.js خط 1) و `firebase` (frontend/index.html خط 11) می‌تواند مشکل‌ساز باشد. همچنین، اگر CI/CD pipeline وجود نداشته باشد (که کاربر اشاره کرده پروژه فاقد GitHub Actions است)، این PRها باید به صورت دستی بررسی و تست شوند. ریسک دیگر این است که Dependabot ممکن است برای dependencies که در `backend/package-lock.json` و `frontend/package-lock.json` قفل شده‌اند، تغییرات ایجاد کند که نیاز به بازبینی دقیق دارد.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: feature_request
- اولویت: medium
- تخمین زمان: small

---

# 🔹 مرحله 8: اضافه کردن GitHub Actions workflow برای build و deploy (اختیاری با توجه به نیاز پروژه)

**Scope:** اضافه کردن یک workflow برای build پروژه (مثلاً `npm run build`) و در صورت نیاز deploy به محیط staging یا production. این workflow باید بعد از تست‌ها اجرا شود. خارج از این مرحله: پیکربندی secrets محیط deploy.
**Key terms:** npm run build, deploy, staging, production, GitHub Actions

**بخش مربوط از متن کاربر:**
```
پروژه فاقد GitHub Actions، pre-commit hooks، linting rules و code quality checks است. این موضوع باعث کاهش کیفیت کد، inconsistency در code style و افزایش احتمال merge شدن کدهای مشکل‌دار می‌شود.
```

## 🎯 هدف (خلاصه ساختاریافته)
اضافه کردن GitHub Actions workflow برای build و deploy پروژه Lebanese Dialect App

## 📍 موقعیت دقیق در پروژه
_(file:line — symbol — snippet)_

- `package.json:1-14` — `scripts` — این فایل اسکریپت build را تعریف می‌کند که workflow باید از آن استفاده کند. همچنین می‌توان lint و test scripts را به اینجا اضافه کرد.
  ```json
  {
    "name": "lebanese-dialect-learning",
    "version": "1.0.0",
    "description": "Lebanese Arabic Learning App with AI",
    "scripts": {
      "install:all": "cd frontend && npm install && cd ../backend && npm install",
      "dev": "cd backend && npm run dev",
      "build": "cd frontend && npm run build",
      "start": "cd backend && npm start"
    },
    "keywords": ["lebanese", "arabic", "language-learning", "gemini", "ai"],
    "license": "MIT"
  }
  ```
- `frontend/vite.config.js:1-14` — `defineConfig` — این فایل build Vite را پیکربندی می‌کند. خروجی build در `frontend/dist` قرار می‌گیرد که توسط backend سرو می‌شود.
  ```jsx
  import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react'
  
  export default defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        }
      }
    },
    build: {
      outDir: 'dist'
    }
  })
  ```
- `backend/server.js:50-51` — `express.static` — این خط نشان می‌دهد که backend فایل‌های build شده frontend را از مسیر `frontend/dist` سرو می‌کند. بنابراین build باید قبل از start اجرا شود.
  ```jsx
  // Serve static files from frontend build
  app.use(express.static(join(__dirname, '../frontend/dist')));
  ```

## 🧭 هدف اصلی پروژه (از یادداشت کاربر)
(کاربر یادداشتی ثبت نکرده است)

## 🧱 پشتهٔ فناوری و معماری
Stack تشخیص داده شده: JavaScript (Node.js backend با Express، React frontend با Vite، Tailwind CSS). ابزارهای مرتبط: GitHub Actions برای CI/CD، Render برای hosting (با توجه به وجود render.yaml).

## 🔗 فایل‌های مرتبط (Cross-references)
_(فایل‌هایی که با موقعیت‌های هدف در ارتباط هستند — import، caller، shared state)_

- `render.yaml` (سطر 1) — این فایل پیکربندی Deploy روی Render را نشان می‌دهد. می‌توان از Render Deploy Hooks در workflow استفاده کرد.
- `backend/.env.example` (سطر 1) — این فایل متغیرهای محیطی مورد نیاز (GEMINI_API_KEY, PORT) را مشخص می‌کند که باید در GitHub Secrets تنظیم شوند.
- `frontend/package.json` (سطر 1) — این فایل dependencies و scripts مربوط به frontend را شامل می‌شود. ممکن است نیاز به اضافه کردن lint scripts داشته باشد.
- `backend/package.json` (سطر 1) — این فایل dependencies و scripts مربوط به backend را شامل می‌شود. ممکن است نیاز به اضافه کردن lint scripts داشته باشد.

## 🌐 نقشهٔ وابستگی‌ها
این تسک یک فایل جدید `.github/workflows/deploy.yml` ایجاد می‌کند که به هیچ فایل موجود وابسته نیست اما بر اجرای اسکریپت‌های تعریف شده در `package.json` (build, test, lint) متکی است. فایل `frontend/vite.config.js` تعیین می‌کند که build چگونه اجرا شود و خروجی کجا ذخیره شود. فایل `backend/server.js` (خط 51) تعیین می‌کند که فایل‌های build شده از کجا سرو شوند. فایل `render.yaml` و `backend/.env.example` برای پیکربندی deploy و secrets استفاده می‌شوند.

## 🔍 Context و وضعیت فعلی
کاربر درخواست اضافه کردن یک GitHub Actions workflow برای build و deploy پروژه را دارد. این workflow باید `npm run build` را اجرا کند و در صورت نیاز به محیط staging یا production deploy کند. کاربر مشخص کرده که این workflow باید بعد از تست‌ها اجرا شود و پیکربندی secrets محیط deploy خارج از این مرحله است. همچنین کاربر اشاره کرده که پروژه فاقد GitHub Actions، pre-commit hooks، linting rules و code quality checks است که باعث کاهش کیفیت کد، inconsistency در code style و افزایش احتمال merge شدن کدهای مشکل‌دار می‌شود. کلیدواژه‌های اصلی: npm run build, deploy, staging, production, GitHub Actions.

شواهد در کد واقعی پروژه:
- فایل `package.json` در ریشه پروژه (خطوط 1-14) شامل اسکریپت‌های `build` (که `cd frontend && npm run build` را اجرا می‌کند) و `start` (که `cd backend && npm start` را اجرا می‌کند) است.
- فایل `frontend/vite.config.js` (خطوط 1-14) تنظیمات build Vite را با `outDir: 'dist'` مشخص کرده است.
- فایل `backend/server.js` (خط 51) فایل‌های static را از `join(__dirname, '../frontend/dist')` سرو می‌کند.
- فایل `render.yaml` (در ساختار پروژه موجود است) نشان می‌دهد که پروژه قبلاً برای Deploy روی Render پیکربندی شده است.
- فایل `backend/.env.example` (خطوط 1-8) متغیرهای محیطی مورد نیاز شامل `GEMINI_API_KEY` و `PORT` را مشخص کرده است.

## ✅ معیار پذیرش (Acceptance Criteria) — رفتار-محور
**مهم:** هر AC رفتار قابل مشاهده را تعریف می‌کند، نه نام فایل/کلاس.
verify می‌تواند پیاده‌سازی متفاوت ولی هم‌ارز را قبول کند.

- [ ] فایل `.github/workflows/deploy.yml` در ریشه پروژه ایجاد شود و شامل مراحل checkout, setup Node.js, npm ci, npm run build, npm test باشد.
- [ ] workflow روی push به branch main و staging و pull request به main اجرا شود.
- [ ] در صورت push به main، workflow به صورت خودکار deploy را با استفاده از Render Deploy Hook (یا روش دیگر) انجام دهد.
- [ ] متغیرهای محیطی مورد نیاز (GEMINI_API_KEY, RENDER_DEPLOY_HOOK_URL) در GitHub Secrets تنظیم شوند.
- [ ] build با موفقیت اجرا شود و خروجی در `frontend/dist` تولید شود.
- [ ] در صورت وجود lint scripts، workflow linting را نیز اجرا کند.
- [ ] هیچ تستی fail نمی‌شود (`npm run test` / `pytest`)
- [ ] linter بدون warning عبور می‌کند
- [ ] type-check موفق است (`tsc --noEmit` / `mypy`)

## 🪜 مراحل اجرایی پیشنهادی
1. ایجاد فایل `.github/workflows/deploy.yml` در ریشه پروژه با مراحل زیر:

1. **Trigger**: workflow روی push به branchهای `main` و `staging` و همچنین pull request به این branchها اجرا شود.
2. **Setup**: نصب Node.js (نسخه 18 یا 20) و نصب dependencies با `npm ci` (برای reproducibility بهتر).
3. **Lint/Code Quality Check**: اضافه کردن مرحله linting با استفاده از ESLint (در صورت وجود فایل پیکربندی) یا نصب و اجرای `eslint` روی کدهای frontend و backend.
4. **Build**: اجرای `npm run build` که در `package.json` ریشه تعریف شده و معادل `cd frontend && npm run build` است.
5. **Test**: اجرای تست‌ها (در صورت وجود) با `npm test`.
6. **Deploy**: در صورت push به branch `main` (production) یا `staging`، deploy به محیط مربوطه انجام شود. برای deploy می‌توان از Render Deploy Hooks استفاده کرد (با توجه به وجود `render.yaml`).
7. **Secrets**: متغیرهای محیطی مانند `GEMINI_API_KEY` و Render deploy hook URL باید در GitHub Secrets تنظیم شوند.

فایل‌های تحت تأثیر:
- `.github/workflows/deploy.yml` (فایل جدید)
- `package.json` (برای اضافه کردن lint scripts در صورت نیاز)
- `frontend/package.json` (برای اضافه کردن lint scripts در صورت نیاز)

## 💡 نمونه‌های قبل/بعد
**اضافه کردن GitHub Actions workflow برای build و deploy**

_قبل:_
```
(فایل وجود ندارد)
```

_بعد:_
```
name: Build and Deploy

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - run: npm test || echo 'No tests configured'

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Render Deploy
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK_URL }}
```

## 📤 خروجی مورد انتظار
تغییر کد در فایل‌های مرتبط، commit یا PR جدید با پیام واضح، و عبور تمام معیارهای پذیرش.

## 🧪 دستورات اعتبارسنجی
- `git add .github/workflows/deploy.yml && git commit -m 'Add GitHub Actions workflow for build and deploy'`
- `git push origin main (برای تست اجرای workflow)`
- `بررسی وضعیت workflow در GitHub Actions tab`
- `بررسی لاگ‌های build برای اطمینان از موفقیت آمیز بودن`

## ⚠️ ریسک‌ها و موارد احتیاط
ریسک اصلی: اگر secrets به درستی در GitHub تنظیم نشوند، مرحله deploy با شکست مواجه می‌شود. همچنین اگر `npm ci` به دلیل عدم وجود `package-lock.json` در ریشه (فقط در `backend/` و `frontend/` وجود دارد) با خطا مواجه شود، باید از `npm install` استفاده کرد. فایل `package.json` ریشه اسکریپت `build` را دارد که `cd frontend && npm run build` را اجرا می‌کند، اما `npm ci` در ریشه فقط dependencies ریشه را نصب می‌کند (که در `package-lock.json` ریشه تعریف شده) و dependencies فرعی (backend و frontend) را نصب نمی‌کند. بنابراین باید مراحل نصب dependencies برای هر دو پوشه به صورت جداگانه انجام شود.

## 🔗 وابستگی‌های تسکی
_(مستقل)_

## 🏷 دسته‌بندی
- نوع: feature_request
- اولویت: medium
- تخمین زمان: medium

---

## ✅ معیارهای پذیرش کلی (همهٔ مراحل)
- [ ] فایل `.github/workflows/ci.yml` در ریشه پروژه ایجاد شود و در هر push و pull request اجرا شود.
- [ ] مراحل workflow شامل: نصب dependencies با `npm ci`، اجرای ESLint با قوانین strict، اجرای TypeScript type checker (`tsc --noEmit`) و اجرای prettier --check باشد.
- [ ] ESLint و Prettier به عنوان devDependencies در `frontend/package.json` و `backend/package.json` اضافه شوند.
- [ ] فایل‌های کانفیگ `.eslintrc.json` (یا `eslint.config.js`)، `tsconfig.json` و `.prettierrc` در ریشه پروژه ایجاد شوند.
- [ ] با push کردن یک commit به شاخه اصلی، workflow به صورت خودکار اجرا شود و linting و type checking انجام شود.
- [ ] 1. پس از اجرای `npm install` در ریشه پروژه، پوشه `.husky` ایجاد شود و فایل `.husky/pre-commit` وجود داشته باشد.
- [ ] 2. فایل `.husky/pre-commit` دارای محتوای صحیح (#!/usr/bin/env sh و npx lint-staged) باشد.
- [ ] 3. فایل `.lintstagedrc.json` یا بخش lint-staged در `package.json` وجود داشته باشد و دستورات eslint --fix و prettier --write را برای فایل‌های JS/JSX تعریف کند.
- [ ] 4. پس از ایجاد یک تغییر در یک فایل JS (مثلاً `backend/server.js`) و اجرای `git commit`، lint-staged به طور خودکار اجرا شود و linting/formatting روی فایل‌های staged اعمال شود.
- [ ] 5. فایل `.gitignore` شامل خط `.husky/_` باشد تا فایل‌های داخلی husky commit نشوند.
- [ ] 6. دستور `npm run prepare` (یا `npx husky`) با موفقیت اجرا شود و git hooks فعال شوند.
- [ ] 7. اگر ESLint یا Prettier نصب نباشند، lint-staged باید خطای واضحی بدهد (نه اینکه سکوت کند).
- [ ] فایل `.eslintrc.json` در ریشه پروژه ایجاد شود و شامل قوانین `react/recommended`, `react-hooks/recommended`, `import/order`, `no-console: warn`, `no-unused-vars: error` باشد.
- [ ] پکیج‌های `eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-import` در `devDependencies` فایل `package.json` اصلی نصب شده باشند.
- [ ] اسکریپت `npm run lint` بدون خطا اجرا شود و هشدارهای مربوط به `no-console` را نمایش دهد.
- [ ] اسکریپت `npm run lint:fix` خطاهای `no-unused-vars` و مرتب‌سازی importها را به صورت خودکار اصلاح کند.
- [ ] فایل `backend/server.js` با rule `import/order` بررسی شود و importها به ترتیب صحیح مرتب شوند.
- [ ] فایل `frontend/src/App.jsx` با rule `react/recommended` بررسی شود و هیچ خطای react-related نداشته باشد.
- [ ] فایل `.prettierrc.json` در ریشه پروژه ایجاد شده و شامل `{ "semi": true, "singleQuote": true, "tabWidth": 2, "trailingComma": "all", "printWidth": 100 }` باشد.
- [ ] فایل `.prettierignore` در ریشه پروژه ایجاد شده و شامل `node_modules`, `dist`, `build`, `*.min.js`, `*.bundle.js`, `coverage`, `.env`, `.env.*` باشد.

## Acceptance Criteria

1. فایل `.github/workflows/ci.yml` در ریشه پروژه ایجاد شود و در هر push و pull request اجرا شود. _(verify: static)_
2. مراحل workflow شامل: نصب dependencies با `npm ci`، اجرای ESLint با قوانین strict، اجرای TypeScript type checker (`tsc --noEmit`) و اجرای prettier --check باشد. _(verify: static)_
3. ESLint و Prettier به عنوان devDependencies در `frontend/package.json` و `backend/package.json` اضافه شوند. _(verify: static)_
4. فایل‌های کانفیگ `.eslintrc.json` (یا `eslint.config.js`)، `tsconfig.json` و `.prettierrc` در ریشه پروژه ایجاد شوند. _(verify: static)_
5. با push کردن یک commit به شاخه اصلی، workflow به صورت خودکار اجرا شود و linting و type checking انجام شود. _(verify: backend_test)_
6. 1. پس از اجرای `npm install` در ریشه پروژه، پوشه `.husky` ایجاد شود و فایل `.husky/pre-commit` وجود داشته باشد. _(verify: static)_
7. 2. فایل `.husky/pre-commit` دارای محتوای صحیح (#!/usr/bin/env sh و npx lint-staged) باشد. _(verify: static)_
8. 3. فایل `.lintstagedrc.json` یا بخش lint-staged در `package.json` وجود داشته باشد و دستورات eslint --fix و prettier --write را برای فایل‌های JS/JSX تعریف کند. _(verify: static)_
9. 4. پس از ایجاد یک تغییر در یک فایل JS (مثلاً `backend/server.js`) و اجرای `git commit`، lint-staged به طور خودکار اجرا شود و linting/formatting روی فایل‌های staged اعمال شود. _(verify: backend_test)_
10. 5. فایل `.gitignore` شامل خط `.husky/_` باشد تا فایل‌های داخلی husky commit نشوند. _(verify: static)_
11. 6. دستور `npm run prepare` (یا `npx husky`) با موفقیت اجرا شود و git hooks فعال شوند. _(verify: backend_test)_
12. 7. اگر ESLint یا Prettier نصب نباشند، lint-staged باید خطای واضحی بدهد (نه اینکه سکوت کند). _(verify: backend_test)_
13. فایل `.eslintrc.json` در ریشه پروژه ایجاد شود و شامل قوانین `react/recommended`, `react-hooks/recommended`, `import/order`, `no-console: warn`, `no-unused-vars: error` باشد. _(verify: static)_
14. پکیج‌های `eslint`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-import` در `devDependencies` فایل `package.json` اصلی نصب شده باشند. _(verify: static)_
15. اسکریپت `npm run lint` بدون خطا اجرا شود و هشدارهای مربوط به `no-console` را نمایش دهد. _(verify: backend_test)_
16. اسکریپت `npm run lint:fix` خطاهای `no-unused-vars` و مرتب‌سازی importها را به صورت خودکار اصلاح کند. _(verify: backend_test)_
17. فایل `backend/server.js` با rule `import/order` بررسی شود و importها به ترتیب صحیح مرتب شوند. _(verify: backend_test)_
18. فایل `frontend/src/App.jsx` با rule `react/recommended` بررسی شود و هیچ خطای react-related نداشته باشد. _(verify: backend_test)_
19. فایل `.prettierrc.json` در ریشه پروژه ایجاد شده و شامل `{ "semi": true, "singleQuote": true, "tabWidth": 2, "trailingComma": "all", "printWidth": 100 }` باشد. _(verify: static)_
20. فایل `.prettierignore` در ریشه پروژه ایجاد شده و شامل `node_modules`, `dist`, `build`, `*.min.js`, `*.bundle.js`, `coverage`, `.env`, `.env.*` باشد. _(verify: static)_
21. دستور `npm run format` بدون خطا اجرا شده و تمام فایل‌های پروژه را با قوانین جدید فرمت کند. _(verify: static)_
22. دستور `npm run format:check` بدون خطا اجرا شده و هیچ فایل خارج از قوانین گزارش نکند. _(verify: static)_
23. فایل‌های `backend/server.js` و `frontend/index.html` پس از اجرای format تغییری در ساختار منطقی خود نداشته باشند (فقط formatting). _(verify: static)_
24. فایل‌های موجود در `node_modules` و `dist` تحت تأثیر prettier قرار نگیرند. _(verify: static)_
25. فایل `.github/workflows/ci.yml` در ریشه پروژه ایجاد شده باشد و شامل یک job به نام `test` باشد که بعد از job `lint` اجرا شود. _(verify: static)_
26. در `package.json` ریشه، اسکریپت `"test": "cd frontend && npm test && cd ../backend && npm test"` اضافه شده باشد. _(verify: static)_
27. در `backend/package.json`، اسکریپت `"test": "jest --coverage"` تنظیم شده باشد و Jest به عنوان devDependency نصب شده باشد. _(verify: static)_
28. در `frontend/package.json`، اسکریپت `"test": "vitest run --coverage"` تنظیم شده باشد و Vitest به عنوان devDependency نصب شده باشد. _(verify: static)_
29. یک تست ساده برای endpoint `/api/health` در backend (فایل `backend/__tests__/health.test.js`) نوشته شده باشد که status 200 و body `{ status: 'ok' }` را بررسی کند. _(verify: static)_
30. یک تست ساده برای کامپوننت `App.jsx` در frontend (فایل `frontend/src/__tests__/App.test.jsx`) نوشته شده باشد که رندر شدن کامپوننت را بررسی کند. _(verify: static)_
31. گزارش coverage پس از اجرای workflow در GitHub Actions به صورت artifact قابل دانلود باشد. _(verify: static)_
32. workflow روی push و pull_request به شاخه main فعال شود. _(verify: static)_
33. فایل `.github/workflows/codeql-analysis.yml` در ریشه پروژه ایجاد شده باشد. _(verify: static)_
34. workflow با نام "CodeQL Security Scan" روی push به شاخه‌های main و develop فعال شود. _(verify: static)_
35. workflow به صورت هفتگی (یکشنبه هر هفته) طبق cron '0 0 * * 0' اجرا شود. _(verify: static)_
36. workflow از `github/codeql-action/init@v3` با زبان javascript استفاده کند. _(verify: static)_
37. workflow از `github/codeql-action/autobuild@v3` برای build خودکار استفاده کند. _(verify: static)_
38. workflow از `github/codeql-action/analyze@v3` برای ارسال نتایج به GitHub Security tab استفاده کند. _(verify: static)_
39. نتایج اسکن در GitHub Security tab (Security > Code scanning alerts) قابل مشاهده باشد. _(verify: static)_
40. workflow در pull request به شاخه main نیز اجرا شود. _(verify: static)_
41. هیچ خطای build در زمان اجرای workflow رخ ندهد (با توجه به اسکریپت‌های build موجود در package.json ریشه). _(verify: static)_
42. فایل `.github/dependabot.yml` در ریشه پروژه ایجاد شده باشد. _(verify: static)_
43. پیکربندی شامل دو entry برای package-ecosystem 'npm' باشد: یکی برای دایرکتوری '/backend' و دیگری برای '/frontend'. _(verify: static)_
44. schedule برای هر دو entry روی 'daily' تنظیم شده باشد. _(verify: static)_
45. open-pull-requests-limit برای هر entry روی 10 تنظیم شده باشد. _(verify: static)_
46. labels شامل 'dependencies' و 'automated' برای هر entry باشد. _(verify: static)_
47. فایل با موفقیت در مخزن GitHub push شود و Dependabot در تب Insights > Dependency graph قابل مشاهده باشد. _(verify: static)_
48. Dependabot پس از فعال‌سازی، یک Pull Request آزمایشی برای به‌روزرسانی یک dependency ایجاد کند. _(verify: static)_
49. فایل `.github/workflows/deploy.yml` در ریشه پروژه ایجاد شود و شامل مراحل checkout, setup Node.js, npm ci, npm run build, npm test باشد. _(verify: static)_
50. workflow روی push به branch main و staging و pull request به main اجرا شود. _(verify: static)_
51. در صورت push به main، workflow به صورت خودکار deploy را با استفاده از Render Deploy Hook (یا روش دیگر) انجام دهد. _(verify: static)_
52. متغیرهای محیطی مورد نیاز (GEMINI_API_KEY, RENDER_DEPLOY_HOOK_URL) در GitHub Secrets تنظیم شوند. _(verify: static)_
53. build با موفقیت اجرا شود و خروجی در `frontend/dist` تولید شود. _(verify: static)_
54. در صورت وجود lint scripts، workflow linting را نیز اجرا کند. _(verify: static)_

## Task Steps

### Step 1: اضافه کردن GitHub Actions workflow برای linting و type checking
**Status:** `done` (100%)
**Scope:** ایجاد فایل `.github/workflows/ci.yml` که در هر push و pull request اجرا شود. این workflow باید شامل مراحل: نصب dependencies (با npm ci یا yarn)، اجرای ESLint با قوانین strict، اجرای TypeScript type checker (tsc --noEmit) و اجرای prettier --check باشد. خارج از این مرحله: اضافه کردن pre-commit hooks، تنظیم code style rules، یا اجرای تست‌ها.
**Excerpt:**
```
پروژه فاقد GitHub Actions، pre-commit hooks، linting rules و code quality checks است. این موضوع باعث کاهش کیفیت کد، inconsistency در code style و افزایش احتمال merge شدن کدهای مشکل‌دار می‌شود.
```

### Step 2: اضافه کردن pre-commit hooks با husky و lint-staged
**Status:** `done` (100%)
**Scope:** نصب و پیکربندی husky برای ایجاد git hooks و lint-staged برای اجرای linting و formatting فقط روی فایل‌های staged. باید فایل `.husky/pre-commit` ایجاد شود که lint-staged را اجرا کند. همچنین فایل `.lintstagedrc.json` یا بخشی در package.json برای تعریف دستورات روی فایل‌های staged (مثلاً eslint --fix و prettier --write). خارج از این مرحله: تعریف قوانین ESLint یا Prettier.
**Excerpt:**
```
پروژه فاقد GitHub Actions، pre-commit hooks، linting rules و code quality checks است. این موضوع باعث کاهش کیفیت کد، inconsistency در code style و افزایش احتمال merge شدن کدهای مشکل‌دار می‌شود.
```

### Step 3: تعریف و پیکربندی ESLint rules با قوانین strict
**Status:** `done` (100%)
**Scope:** ایجاد یا به‌روزرسانی فایل `.eslintrc.json` (یا `.eslintrc.js`) با قوانین strict شامل: `@typescript-eslint/strict`, `react/recommended`, `import/order`, `no-console`, `no-unused-vars` و قوانین custom. همچنین نصب پکیج‌های لازم مانند `@typescript-eslint/eslint-plugin`, `eslint-plugin-react`, `eslint-plugin-import`. خارج از این مرحله: پیکربندی Prettier یا TypeScript compiler options.
**Excerpt:**
```
پروژه فاقد GitHub Actions، pre-commit hooks، linting rules و code quality checks است. این موضوع باعث کاهش کیفیت کد، inconsistency در code style و افزایش احتمال merge شدن کدهای مشکل‌دار می‌شود.
```

### Step 4: تعریف و پیکربندی Prettier rules برای formatting یکپارچه
**Status:** `done` (100%)
**Scope:** ایجاد فایل `.prettierrc.json` با تنظیمات formatting مانند: `semi: true`, `singleQuote: true`, `tabWidth: 2`, `trailingComma: 'all'`, `printWidth: 100`. همچنین ایجاد فایل `.prettierignore` برای exclude کردن فایل‌های خاص (مثل node_modules, dist). خارج از این مرحله: پیکربندی ESLint یا TypeScript.
**Excerpt:**
```
پروژه فاقد GitHub Actions، pre-commit hooks، linting rules و code quality checks است. این موضوع باعث کاهش کیفیت کد، inconsistency در code style و افزایش احتمال merge شدن کدهای مشکل‌دار می‌شود.
```

### Step 5: اضافه کردن GitHub Actions workflow برای اجرای تست‌ها
**Status:** `done` (100%)
**Scope:** اضافه کردن یک job جدید در فایل `.github/workflows/ci.yml` (یا یک فایل جداگانه) که تست‌های unit و integration را اجرا کند. این job باید بعد از job linting اجرا شود و شامل: نصب dependencies، اجرای `npm test` (یا `yarn test`) با coverage report. خارج از این مرحله: نوشتن تست‌ها، پیکربندی coverage threshold.
**Excerpt:**
```
پروژه فاقد GitHub Actions، pre-commit hooks، linting rules و code quality checks است. این موضوع باعث کاهش کیفیت کد، inconsistency در code style و افزایش احتمال merge شدن کدهای مشکل‌دار می‌شود.
```

### Step 6: اضافه کردن GitHub Actions workflow برای security scanning (CodeQL)
**Status:** `done` (100%)
**Scope:** اضافه کردن یک workflow جدید با استفاده از `github/codeql-action` برای scanning vulnerabilities در کد. این workflow باید به صورت هفتگی یا در هر push اجرا شود و نتایج را در GitHub Security tab نمایش دهد. خارج از این مرحله: پیکربندی dependency scanning یا secrets scanning.
**Excerpt:**
```
پروژه فاقد GitHub Actions، pre-commit hooks، linting rules و code quality checks است. این موضوع باعث کاهش کیفیت کد، inconsistency در code style و افزایش احتمال merge شدن کدهای مشکل‌دار می‌شود.
```

### Step 7: اضافه کردن Dependabot برای به‌روزرسانی خودکار dependencies
**Status:** `done` (100%)
**Scope:** ایجاد فایل `.github/dependabot.yml` برای فعال‌سازی Dependabot که به‌روزرسانی‌های امنیتی و نسخه‌های جدید dependencies را به صورت خودکار پیشنهاد دهد. باید برای package manager (npm/yarn) و شاید Docker پیکربندی شود. خارج از این مرحله: پیکربندی CodeQL یا secrets scanning.
**Excerpt:**
```
پروژه فاقد GitHub Actions، pre-commit hooks، linting rules و code quality checks است. این موضوع باعث کاهش کیفیت کد، inconsistency در code style و افزایش احتمال merge شدن کدهای مشکل‌دار می‌شود.
```

### Step 8: اضافه کردن GitHub Actions workflow برای build و deploy (اختیاری با توجه به نیاز پروژه)
**Status:** `done` (100%)
**Scope:** اضافه کردن یک workflow برای build پروژه (مثلاً `npm run build`) و در صورت نیاز deploy به محیط staging یا production. این workflow باید بعد از تست‌ها اجرا شود. خارج از این مرحله: پیکربندی secrets محیط deploy.
**Excerpt:**
```
پروژه فاقد GitHub Actions، pre-commit hooks، linting rules و code quality checks است. این موضوع باعث کاهش کیفیت کد، inconsistency در code style و افزایش احتمال merge شدن کدهای مشکل‌دار می‌شود.
```
