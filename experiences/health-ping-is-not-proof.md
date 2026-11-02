---
title: "پاسخِ سبزِ /health مدرکِ کارکردن نیست"
tags: ["observability", "deploy", "verification"]
topic_canonical: "health-ping-is-not-proof"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-11-02T20:30:00Z"
created_at: "2026-11-02T20:30:00Z"
updated_at: "2026-11-02T20:30:00Z"
merged_from: []
resolution_status: "mitigated"
recurrence_count: 2
user_confirmed: false
agents: ["Claude Code"]
---

# پاسخِ سبزِ /health مدرکِ کارکردن نیست

## 🎯 چالش / Challenge
endpoint ِ سلامت معمولاً یک JSON ِ ثابت برمی‌گرداند. سرویس ممکن است «Deployed» و «ok» باشد درحالی‌که
ورود، پایگاه‌داده، احرازِ هویتِ سرور (متغیرِ محیطیِ جاافتاده) یا فراخوانیِ مدل خراب است.

## 💡 راه‌حل / Solution
- بازرسی = اجرای **جریانِ واقعی**: ورود → خواندن/نوشتنِ داده → یک فراخوانیِ واقعیِ وابستگیِ بیرونی.
- endpoint ِ وضعیت، وابستگی‌ها را جدا گزارش کند (`authConfigured`، `storeDurable`، …) نه فقط `ok`.
- هر عدد بگوید «اندازه‌گیری‌نشده» با «صفر» یکی نیست.

## 🧪 نمونه کد (Anonymized)
```js
app.get('/api/status', (req, res) => res.json({
  ok: true,
  authConfigured: Boolean(process.env.AUTH_PROJECT_ID),
  storage: store.describe(), // { kind: 'firestore'|'file', durable: true|false }
}));
```

## ⚠️ نکات حیاتی / Pitfalls
- endpoint ِ محافظت‌شده که همیشه ۴۰۱ «پیکربندی نشده» می‌دهد در health دیده نمی‌شود.
- «بیلد محلی سبز» هم مدرک نیست (فایلِ ignore‌شده در گیت نیست).

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere
- [ ] برای هر سرویس یک «جریانِ دود» (smoke flow) بنویس که واقعاً داده می‌نویسد/می‌خواند.
- [ ] وضعیتِ هر وابستگی را جدا در یک endpoint ِ فقط‌خواندنی منتشر کن.

## 🔗 References
- مرتبط: render-skip-marker-hides-undeployed-work
