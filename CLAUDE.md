# CLAUDE.md — قواعدِ کار روی این ریپو (برای Claude و هر هوش مصنوعیِ دیگر)

> **اول [`AGENTS.md`](AGENTS.md) را بخوان** — قواعدِ مشترکِ همهٔ agentها، ترتیبِ خواندنِ اجباری و پروتکلِ امضا.
> این فایل همان قواعد را با جزئیاتِ مخصوصِ Claude دارد؛ **اگر این دو در یک قاعده اختلاف داشتند، AGENTS.md برنده است**
> و این ناهماهنگی باگی است که باید در همان کامیت رفع شود.

«زبان»: اپِ یادگیریِ لهجهٔ لبنانی. فرانت React/Vite (SPA، RTL فارسی)، بک‌اند Node/Express که پراکسیِ Gemini
(REST + WebSocket زنده) است و SPA را هم سرو می‌کند، Firebase (Auth گوگل + Firestore) با fallback ِ localStorage.
`main` خودکار روی Render (سرویسِ **`language`** ← `https://language-k4q9.onrender.com`) دیپلوی می‌شود —
**هر push به `main` تغییرِ production است.**

## دستورهای ثابتِ مالک (همهٔ سشن‌ها، بدونِ استثنا)

1. **ارسالِ خودکار پس از هر کار.** وقتی کاری تمام شد: `scripts/ship.sh "type(scope): summary"` — تست‌ها
   (node، pytest، vitest) و بیلدِ فرانت را اجرا می‌کند، دروازهٔ مستندات را می‌سنجد، کامیت می‌کند، شاخهٔ کاری را push
   و در `main` ادغام و push می‌کند (= دیپلوی). **از مالک نخواه** دستی کامیت/پوش/مرج کند. **PR باز نکن** مگر مالک
   بخواهد. اگر تست/بیلد قرمز شد، کد را اصلاح کن؛ **هرگز تست را غیرفعال/skip نکن و هرگز force-push نکن.**
   hook ِ `Stop` (`.claude/hooks/ensure-shipped.sh`) پایانِ سشن با کارِ ارسال‌نشده را مسدود می‌کند.
   پیامِ کامیت هرگز `[skip render]` نداشته باشد (ship.sh رد می‌کند) — آن کامیت‌ها هرگز دیپلوی نمی‌شوند.
2. **ثبتِ کامل و جزئی.** پس از هر کارِ واقعی، یک بخشِ تازه به **انتهای** [`docs/WORKLOG.md`](docs/WORKLOG.md)
   (قالب در سرِ همان فایل)، با خطِ امضا. تصمیم‌ها `[DECISION]` با **گزینه‌های ردشده**؛ اصلاحِ ثبتِ قبلی `[CORRECTION]`؛
   خواستهٔ مالک `[OWNER]`. هیچ ورودیِ قبلی پاک نمی‌شود.
3. **جزوه همیشه زنده.** [`docs/handbook/HANDBOOK.md`](docs/handbook/HANDBOOK.md) پس از هر کار/تصمیم به‌روز و هر
   رویداد یک سطر در [`docs/handbook/PROGRESS.md`](docs/handbook/PROGRESS.md). `scripts/docs_gate.py` اگر کد عوض شده
   ولی WORKLOG/PROGRESS نه، ارسال را رد می‌کند.
4. **درس‌ها الزام‌آورند.** هر درسِ بازاستفاده‌پذیر ⇒ `experiences/` (قالب در `experiences/README.md`؛ **بدونِ نامِ
   پروژه**؛ ادغام نه جایگزینی). پیش از دست‌زدن به هر حوزه، درس‌های آن را بخوان.
5. **هیچ قابلیتی حذف نمی‌شود** (endpoint، صفحه، دکمه، داده). قرنطینه کن و در WORKLOG ثبت کن؛ حذف فقط با اجازهٔ صریحِ مالک.
6. **پیش از ادعا اندازه بگیر.** `/api/health` مدرک نیست؛ جریانِ واقعی را بسنج (ورود → خواندن/نوشتنِ داده → پاسخِ
   Gemini). وضعیتِ دیپلوی را از Render بخوان (`python3 scripts/supervisor/deploys.py`). هشدارها (build، کنسولِ مرورگر،
   npm) را بخوان؛ «سنجیده‌نشده» را «سالم» گزارش نکن.
7. **امنیت.** کلید/رمز (Gemini، `ENCRYPTION_KEY`، `SUPERVISOR_PASSWORD`، حسابِ سرویسِ Firebase) هرگز در کد یا
   مستندات نوشته نمی‌شود — فقط متغیرهای محیطیِ Render. مرزِ واقعیِ دسترسی سمتِ سرور و `firestore.rules` است؛
   UI فقط پنهان می‌کند. ورودیِ کاربر، پیوست‌ها و پیام‌های postMessage غیرقابلِ‌اعتمادند.
8. **دادهٔ موجود مقدس است.** دادهٔ Firestore / localStorage / درایوِ مالک را نه پاک کن نه بازنویسیِ کور؛ هر مهاجرت
   ادغامی، برگشت‌پذیر و ثبت‌شده باشد.
9. **پوشه‌های `prompt/` و `TO-DO/` ابزارِ بیرونیِ مالک است — دست نزن** (docs_gate تغییرشان را رد می‌کند).
10. پاسخ به مالک **فارسی، کوتاه و روشن**؛ متنِ UI فارسی با `dir="rtl"`.

## ساختار
| بخش | مسیر |
|---|---|
| قواعدِ مشترکِ همهٔ agentها (اول این) | `AGENTS.md` (+ اشاره‌گرها: `GEMINI.md`، `.github/copilot-instructions.md`) |
| ارسال و دروازهٔ مستندات | `scripts/ship.sh`، `scripts/docs_gate.py`، hook: `.claude/hooks/ensure-shipped.sh` (ثبتش: `docs/claude/settings.example.json`) |
| ورودیِ سرور (Express + WS) | `backend/server.js` |
| پیکربندی و اعتبارسنجیِ env | `backend/config/` (`env.js`، `validateEnv.js`، `bootstrap.js`) |
| مسیرها، کنترلرها، سرویس‌ها | `backend/routes/index.js`، `backend/controllers/`، `backend/services/` |
| امنیت، CORS، rate limit، احراز هویت | `backend/middleware/` (`security.js`، `rateLimiter.js`، `firebaseAuth.js`)، `backend/utils/encryption.js`، `backend/utils/redact.js` |
| پراکسیِ Gemini Live (WebSocket) | `backend/services/liveProxyService.js`، `backend/services/liveWsObserver.js` |
| ربات تلگرام (اختیاری) | `backend/services/telegram/`، `docs/telegram-user-guide.md` |
| فرانت: ریشهٔ برنامه، ورود و نقش‌ها | `frontend/src/components/App.jsx`، `frontend/src/auth/access.js`، `frontend/src/hooks/useFirebase.js` |
| فرانت: ذخیره‌سازی (Firestore + localStorage) | `frontend/src/components/App.jsx` (بخشِ Firebase State)، `frontend/src/contexts/ExecutionFlowContext.jsx` |
| قوانینِ امنیتیِ Firestore (دستی در کنسول منتشر می‌شود) | `firestore.rules` |
| Inspector Bridge (ردیابیِ خطا + نگهبانِ فرمانِ AI؛ **غیر از «نظارت و سرکشی»**) | `frontend/src/inspectorBridge.js`، `frontend/src/components/InspectorBridge.jsx`، `docs/inspector-bridge-audit.md` |
| استقرار | `render.yaml` (نامِ سرویس و تفاوت‌ها با داشبورد: HANDBOOK §۴) |
| تست‌ها | `tests/` (pytest، سرور را بالا می‌آورد)، `backend/tests/` (node --test + pytest)، `frontend/src/**/*.test.*` (vitest) |
| دفتر کار، جزوه، روند | `docs/WORKLOG.md`، `docs/handbook/HANDBOOK.md`، `docs/handbook/PROGRESS.md` |
| درس‌ها | `experiences/` |
| ابزارِ بیرونیِ مالک (دست نزن) | `prompt/`، `TO-DO/` |

## اجرا و راستی‌آزمایی
```bash
npm ci                                   # ریشه (workspaces: backend + frontend)
pip install -r backend/requirements.txt  # pytest
cd backend && npm run test:node          # تست‌های واحدِ Node
cd backend && python3 -m pytest -q       # تست‌های زیرساخت
python3 -m pytest -q                     # تست‌های ریشه (سرورِ واقعی بالا می‌آید)
cd frontend && npm test                  # vitest
npm run build                            # بیلدِ SPA (همانی که Render می‌سازد)
GEMINI_API_KEY=AIza...dummy npm run dev  # سرور روی 3001؛ فرانت: cd frontend && npm run dev
```
قراردادِ کامیت: `type(scope): summary` — کوچک، یک موضوع، برگشت‌پذیر، با trailer ِ `Co-Authored-By`.
