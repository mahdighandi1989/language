---
title: "پیامِ موفقیت فقط پس از تأییدِ نوشتنِ ماندگار؛ نوشتنِ چندمرحله‌ای را اتمیک کن"
tags: ["persistence", "firestore", "ux", "data-loss"]
topic_canonical: "success-only-after-durable-write"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-11-03T19:30:00Z"
created_at: "2026-11-03T19:30:00Z"
updated_at: "2026-11-03T19:30:00Z"
merged_from: []
resolution_status: "resolved"
recurrence_count: 1
user_confirmed: false
agents: ["Claude Code"]
---

# پیامِ موفقیت فقط پس از تأییدِ نوشتنِ ماندگار

## 🎯 چالش / Challenge
یک ایمپورتِ بزرگ state را در حافظه عوض کرد و فوراً «✅ انجام شد» نشان داد؛ ذخیرهٔ ابری با تأخیرِ debounce شروع شد و ده‌ها نوشتنِ
پشتِ‌سرِهم داشت که سندِ اصلی را **آخر** می‌نوشت. کاربر صفحه را رفرش کرد ⇒ سندِ اصلی هرگز نوشته نشد ⇒ پس از بازگشت همه‌چیز رفته بود،
بی هیچ پیامِ خطا. «موفقیتِ دروغین» بدتر از خطاست.

## 💡 راه‌حل / Solution
1. عملیاتِ کاربر‌محور (ایمپورت، انتقال) **صریحاً** ذخیره را صدا بزند و پیامِ موفقیت را فقط پس از resolve شدنِ نوشتن (تأییدِ سرور) نشان دهد؛
   تا آن موقع «در حالِ ذخیره — صفحه را نبندید».
2. همهٔ نوشتن‌ها را تا حدِ امکان در **یک commit ِ اتمیک** بگذار (batch/transaction)؛ اگر جا نشد، ارجاع‌دهنده (سندِ اصلی) **آخر**.
3. شکست ⇒ پیامِ قرمز با علت + «تلاشِ دوباره»؛ داده در حافظه بماند.
4. `beforeunload` وقتی تغییرِ ذخیره‌نشده یا نوشتنِ در جریان هست.
5. ذخیرهٔ خودکار و ذخیرهٔ صریح از یک قفل بگذرند تا هم‌زمان ننویسند.

## 🧪 نمونه کد (Anonymized)
```js
setState(next);
setStatus('saving');
try { await saveNow(next); setStatus('saved'); } catch (e) { setStatus({ error: e.message }); }
// saveNow: one batch = [...bodyChunks, mainDoc]; resolves when the backend acks
```

## ⚠️ نکات حیاتی / Pitfalls
- تستِ واحد با mock ِ فوری این را نمی‌گیرد؛ تستی بنویس که commit را عمداً معطل می‌کند و می‌سنجد پیامِ موفقیت **پیش از** آن دیده نمی‌شود.
- سقفِ اندازه/تعدادِ عملیاتِ هر commit را بدان و برای حالتِ بزرگ مسیرِ جایگزین داشته باش.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere
- [ ] هر «✅» در UI: دقیقاً بعد از کدام await می‌آید؟
- [ ] نوشتن‌های وابسته (فرزندان + اشاره‌گر) اتمیک یا با اشاره‌گر در آخر.
- [ ] هشدارِ ترکِ صفحه هنگامِ تغییرِ ذخیره‌نشده.

## 🔗 References
- مرتبط: firestore-merge-never-deletes-map-keys, health-ping-is-not-proof
