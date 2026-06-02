# هدف خروجی قابل اندازه‌گیری (Measurable Outcome Target)

پیش‌تر تنها معیارهای فنی (`error_rate`، `warn_count`، `info_count`) گزارش
می‌شد؛ این‌ها سلامت فنی سیستم را نشان می‌دهند ولی نمی‌گویند آیا کاربر واقعاً
موفق شده یا نه. این سند هدف خروجی را به‌صورت **قابل اندازه‌گیری** بازتعریف
می‌کند و معیارهای کلیدی عملکرد (KPIs) را مشخص می‌سازد.

## معیارهای کلیدی عملکرد (KPIs)

| معیار (فارسی) | کلید متریک (`metric_name`) | تعریف | هدف |
| --- | --- | --- | --- |
| نرخ موفقیت چت | `chat_success_rate` | نسبت مکالمه‌هایی که به یک گفت‌وگوی واقعی دوطرفه (حداقل ۲ پاسخ دستیار) رسیده‌اند | ≥ ۰٫۸۰ |
| میانگین زمان پاسخ | `avg_response_time` | میانگین زمان پاسخ دستیار بر حسب میلی‌ثانیه در تمام نوبت‌ها | ≤ ۲۰۰۰ms |
| نرخ تعامل کاربر | `user_engagement_rate` | نسبت نشست‌هایی که کاربر بیش از یک پیام فرستاده است | ≥ ۰٫۶۰ |
| نرخ تبدیل | `conversion_rate` | نسبت نشست‌هایی که کاربر یک هدف مطلوب (مثلاً باز کردن درس پیشنهادی) را کامل کرده است | ≥ ۰٫۲۵ |

## نرخ خروجی تجمیعی (`outcome_rate`)

این چهار معیار در یک امتیاز واحد در بازهٔ ‎[۰، ۱]‎ ترکیب می‌شوند تا اثربخشی کلی
سیستم با یک عدد قابل پایش باشد. میانگین زمان پاسخ ابتدا به یک «امتیاز سرعت»
نرمال می‌شود (سریع‌تر = بهتر، با سقف ۵ ثانیه) تا با سه نرخ دیگر هم‌مقیاس شود:

```
speed_score  = max(0, 1 - min(avg_response_time, 5000) / 5000)
outcome_rate = mean(chat_success_rate, user_engagement_rate, conversion_rate, speed_score)
```

## نحوهٔ اندازه‌گیری و مشاهده در production

- **بک‌اند (Node):** فرانت‌اند خلاصهٔ هر نشست را به `POST /api/analytics` می‌فرستد؛
  `backend/services/analyticsService.js` معیارها را محاسبه و با کلید
  `metric_name` در قالب `analytics_log` لاگ می‌کند.
- **بک‌اند (Python — لایهٔ سنجش/verify):** `backend/app/analytics.py` همان معیارها
  را محاسبه می‌کند و از طریق logger با نام `analytics_log` خط‌به‌خط
  `metric_name=... value=...` را منتشر می‌کند تا `outcome_rate` در لاگ‌های
  CI/production قابل تشخیص باشد.
- **فرانت‌اند:** `frontend/src/analytics.js` تعاملات کاربر (پیام‌ها، زمان پاسخ،
  تبدیل) را ثبت و فلش می‌کند.
- **تست E2E:** `tests/e2e/test_outcome_metrics.py::test_outcome_metrics_collected`
  یک دستهٔ مصنوعی از نشست‌ها را عبور می‌دهد و تأیید می‌کند همهٔ KPIها محاسبه و
  `outcome_rate` تولید می‌شود.

## پوشش خطای Inspector Bridge به‌صورت قابل اندازه‌گیری (`error_rate`)

**outcome target (قابل اندازه‌گیری):** ۱۰۰٪ از منابع خطای کاربر باید توسط
Inspector Bridge رهگیری شوند تا نرخ خطای واقعی (`error_rate`) قابل مشاهده باشد و
دیگر به‌اشتباه صفر گزارش نشود. سه منبعی که باید پوشش داده شوند:

| منبع خطا | hook رهگیری | محل |
| --- | --- | --- |
| خطاهای runtime catch‌نشده | `window.addEventListener('error', …)` | `frontend/src/inspectorBridge.js` |
| rejection‌های catch‌نشدهٔ Promise | `window.addEventListener('unhandledrejection', …)` | `frontend/src/inspectorBridge.js` |
| خطاهای Firebase/شبکه | `reportError(err, { source: 'firebase' })` | `frontend/src/components/App.jsx` |

هر خطا از طریق `reportError` به یک سینک مرکزی می‌رود که `metric_name=error_rate`
و `outcome_rate` (= `1 − error_rate`) را با همان قالب لاگ `backend/app/monitoring.py`
منتشر می‌کند. این مقدار **measurable** است: `error_rate = total_errors / interactions`
(کلیپ‌شده در بازهٔ ‎[۰، ۱]‎). تعریف رسمی outcome target اینجاست تا verify بتواند
به‌جای صرفِ وجود فایل، خود outcome (پوشش خطا) را اندازه بگیرد.

> **تصمیم طراحی:** خطاها به والد iframe ارسال **نمی‌شوند** و روی هیچ سوکت خارجی
> منتشر نمی‌گردند — اسکریپت قدیمیِ «phone-home» عمداً حذف شده است
> (نگهبان: `tests/test_inspector_bridge_no_iframe.py`). الزامِ «گزارش رویدادهای
> خطا برای اندازه‌گیری» اینجا با یک سینک متریک درون‌برنامه‌ای برآورده می‌شود که هر
> log scraper می‌تواند آن را بخواند.

- **بک‌اند (Node):** `backend/server.js` چرخهٔ عمر اتصال `/ws/live` را رصد می‌کند و
  متریک `live_ws_error_rate` / `outcome_rate` را برای خطاهای سمت سوکت منتشر می‌کند.
- **تست E2E:** `tests/e2e/test_inspector_bridge.py::test_error_tracking` پوشش این سه
  hook را به‌صورت یک `outcome_rate` ایستا محاسبه می‌کند و تأیید می‌کند به ۱۰۰٪ می‌رسد.

## رویدادهای بحرانی و نوتیفیکیشن

رویداد بحرانی `verify_failed` اکنون از طریق `backend/app/notifications.py`
نوتیفیکیشن می‌فرستد: پیام فارسی و معنادار، `priority="high"` و `silent=False`
تا هرگز بی‌صدا نباشد. در صورت تنظیم `NOTIFY_TELEGRAM_BOT_TOKEN` و
`NOTIFY_TELEGRAM_CHAT_ID` پیام به تلگرام ارسال می‌شود؛ در غیر این صورت برای
مشاهده‌پذیری در لاگ ثبت می‌گردد. برای جلوگیری از اسپم، رویدادهای غیربحرانی
هم‌نوع طی `RATE_LIMIT_SECONDS` ثانیه محدود می‌شوند.
