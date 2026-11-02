# ناظرِ خودکار و «نظارت و سرکشی» — پروژهٔ «زبان»

> **«Inspector Bridge»** (`frontend/src/inspectorBridge.js`، `components/InspectorBridge.jsx`) چیزِ دیگری است:
> ردیابِ خطا و نگهبانِ فرمانِ AI. «نظارت و سرکشی» = برگه‌های مالک روی صفحه‌های برنامه + ناظرِ خودکار.

## سامانه در یک نگاه
- مالک (یا هر کاربرِ واردشده) دکمهٔ **«📝 نظارت»** (پایینِ چپِ هر صفحه) را می‌زند، دورِ ایراد کادر می‌کشد، متن می‌نویسد،
  تصویر می‌چسباند (Ctrl+V) و هر فایلی پیوست می‌کند. برگهٔ کاربرِ غیرادمین `pending` می‌ماند تا مالک بپذیرد.
- کادرها روی همان صفحه هایلایت می‌شوند: نارنجی = منتظرِ ناظر · سبز = درست شد (با مدرک) · زرد/قرمز/بنفش = نیمه‌کاره/
  درست نشد/منتظرِ مالک · آبی = تیکِ مالک. صفحهٔ **«نظارت و سرکشی»** (منوی کناری) گفت‌وگو، نتیجه، زنجیرهٔ وابستگی،
  پیوست‌ها و دکمه‌های مالک (تیک، بازکردنِ دوباره، پذیرش/رد، ⚡ فوری) را دارد. **دکمهٔ حذف وجود ندارد.**
- ناظرِ خودکار (روتینِ Claude Code) با حسابِ ویژه برگه‌ها را می‌خواند، کار می‌کند، ship می‌کند و زیرِ برگه با «نتیجه» و
  مدرک جواب می‌دهد.

| لایه | فایل |
|---|---|
| قواعد (خالص، تست‌شده) | `backend/services/inspection/model.js` |
| ذخیره‌ساز (Firestore یا فایل؛ بی‌حذف) | `backend/services/inspection/store.js` |
| استخراجِ متنِ پیوست | `backend/services/inspection/extract.js` |
| احراز (مالک/کاربر با Firebase، ناظر با `SUPERVISOR_PASSWORD`) | `backend/services/inspection/auth.js` |
| API | `backend/routes/inspection.js` (`/api/inspection/*`) |
| فرانت | `frontend/src/inspection/` (`InspectionLayer.jsx`، `InspectionBoard.jsx`، `geometry.js`، `api.js`) |
| ابزارِ ناظر | `scripts/supervisor/` (`inspection.py`، `client.py`، `deploys.py`، `prod_check.py`، `screenshot.mjs`) |
| تست‌ها | `backend/tests/inspection.test.js`، `frontend/src/inspection/*.test.*` |

## نگهبان‌ها در خودِ API (نه در UI)
- فقط ناظر «نتیجه» ثبت می‌کند و صفِ فوری را برمی‌دارد؛ ناظر هرگز تیک، پذیرش/رد یا «فوری» نمی‌زند (۴۰۳).
- `fixed` بدونِ تصویرِ بعد ⇒ ۴۲۲؛ `fixed` بی‌کامیت (یا دلیلِ ۴۰+ نویسه‌ایِ «بی‌تغییر») ⇒ ۴۲۲.
- جوابِ بی‌زنجیرهٔ وابستگی ⇒ ۴۲۲؛ `needs-owner` بی‌«گزینه/جایگزین» ⇒ ۴۲۲.
- جواب درحالی‌که پیوستی کامل خوانده نشده (متن به‌صورتِ پیوسته، تصویر/فایلِ بی‌متن باز نشده، رسانهٔ رونویسی‌نشده) ⇒ ۴۲۲.
- `DELETE` روی برگه یا پیوست ⇒ ۴۰۵. برگهٔ کاربر از دیدِ ناظر پنهان است تا مالک بپذیرد.

## متغیرهای محیطی (فقط روی Render — هیچ‌کدام در ریپو نیست)
| متغیر | چرا | وضعیت (2026-11-02) |
|---|---|---|
| `FIREBASE_PROJECT_ID` = `labaneseapp` | سرور توکنِ گوگلِ مالک را تأیید کند | **لازم — تنظیم نشده** |
| `SUPERVISOR_PASSWORD` (تصادفی، ≥ ۱۶ نویسه) | ورودِ حسابِ ناظر | **لازم — تنظیم نشده** |
| `FIREBASE_SERVICE_ACCOUNT` (JSON یا base64 ِ حسابِ سرویس) | ذخیرهٔ ماندگار در Firestore | **لازم برای ماندگاری** |
| `ADMIN_EMAILS` (اختیاری) | ایمیل‌های مالکِ بیشتر | ایمیلِ مالک همیشه هست |
| `INSPECTION_DATA_DIR` (اختیاری) | فقط اگر دیسکِ ماندگارِ Render وصل شد | — |

بدونِ `FIREBASE_SERVICE_ACCOUNT` برگه‌ها روی دیسکِ موقت‌اند و **با هر دیپلوی پاک می‌شوند**؛ صفحهٔ نظارت این را با
هشدارِ قرمز می‌گوید و `prod_check.py` آن را P1 گزارش می‌کند.

ساختنِ حسابِ سرویس: Firebase Console › Project settings › Service accounts › «Generate new private key» ⇒ محتوای
فایلِ JSON را (یا `base64 -w0 file.json`) در Render › language › Environment › `FIREBASE_SERVICE_ACCOUNT` بگذارید.

## روتین‌ها
| مورد | دورِ کامل | صفِ فوری |
|---|---|---|
| زمان‌بندی (UTC) | `23 2 * * 1,4` — دوشنبه و پنجشنبه ۰۲:۲۳ (۰۵:۵۳ تهران) | `37 * * * *` — هر ساعت، دقیقهٔ ۳۷ |
| دستور (تنها مرجع) | [`PROMPT.md`](PROMPT.md) | [`URGENT_PROMPT.md`](URGENT_PROMPT.md) |
| شناسه | (در WORKLOG و OPEN_ITEMS ثبت می‌شود) | (همان‌جا) |

پرامپتِ داخلِ هر Routine **عمداً کوتاه و ثابت** است: مخزن را بگیر، `main` را بگیر، این فایل را بخوان و مو‌به‌مو اجرا کن.

## تغییرِ دستورِ ناظر
فایل را ویرایش کن، نه پرامپتِ Routine را:
1. `cp docs/supervisor/PROMPT.md docs/supervisor/archive/PROMPT-v{N}-{YYYY-MM-DD}.md`
2. در frontmatter `version` را +۱، `updated` را امروز، `supersedes` را مسیرِ بایگانی بگذار؛ عنوانِ «نسخهٔ N» را هم.
3. `scripts/ship.sh "docs(supervisor): …"` — `docs_gate.py` نسخه/بایگانی را می‌سنجد.

## فایل‌ها
| فایل | نقش |
|---|---|
| `PROMPT.md` / `URGENT_PROMPT.md` | دستورِ روتین‌ها |
| `archive/` | نسخه‌های قبلی (هرگز پاک نمی‌شوند) |
| `RUNLOG.md` | گزارشِ هر اجرا (جدیدترین پایین) |
| `OPEN_ITEMS.md` | کارهای بازِ انتقالی |
| `inspection/` | پوشهٔ کاریِ کارتابل (محتوایش در git نیست) |
