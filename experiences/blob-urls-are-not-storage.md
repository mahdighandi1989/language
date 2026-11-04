---
title: "blob: URL ذخیره‌پذیر نیست؛ هر صفحه ErrorBoundary ِ خودش را بخواهد"
tags: ["frontend", "media", "persistence", "react", "error-handling"]
topic_canonical: "blob-urls-are-not-storage"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-11-04T05:00:00Z"
created_at: "2026-11-04T05:00:00Z"
updated_at: "2026-11-04T05:00:00Z"
merged_from: []
resolution_status: "resolved"
recurrence_count: 1
user_confirmed: false
agents: ["Claude Code"]
---

# blob: URL ذخیره‌پذیر نیست

## 🎯 چالش / Challenge
صدای تولیدشده به‌صورتِ `URL.createObjectURL` در تاریخچهٔ گفت‌وگو ذخیره می‌شد. در همان تب کار می‌کرد، ولی پس از رفرش یا در بایگانی، رشتهٔ
`blob:...` به هیچ‌چیز اشاره نمی‌کند و دکمهٔ پخش بی‌صدا شکست می‌خورد. جدا از آن، یک خطای رندر در یک صفحه (دادهٔ AI با نوعِ غیرمنتظره، مثلاً
عدد به‌جای رشته) کلِ برنامه را سفید می‌کرد چون فقط یک ErrorBoundary در ریشه بود.

## 💡 راه‌حل / Solution
1. blob URL را فقط برای همان جلسه به کار ببر؛ برای ماندگاری یا خودِ بایت‌ها را جای مناسب ذخیره کن یا از منبع (متن) دوباره بساز. خطای پخش
   (`onerror` / رد شدنِ `play()`) را به مسیرِ بازسازی وصل کن، نه نادیده‌گرفتن.
2. خروجیِ مدل را پیش از رندر **نرمال** کن (همه‌چیز رشته، آیتمِ نامعتبر حذف) — هرگز مستقیم `.trim()` یا `{obj}` روی پاسخِ JSON ِ مدل.
3. برای هر صفحه/نما یک ErrorBoundary با `key` ِ نما و دکمهٔ «تلاشِ دوباره»؛ خطا گزارش شود و بقیهٔ برنامه بماند.
4. listener‌های دسترسی: خطای گذرا ≠ خروج. نشستِ معتبر ادامه یابد و با backoff دوباره وصل شود.

## ⚠️ دام‌ها / Pitfalls
- تستِ دستی در همان تب هرگز باگِ blob را نشان نمی‌دهد؛ رفرش یا بازکردنِ بایگانی لازم است.
- در تست، `auth.currentUser` ِ mock ممکن است null باشد؛ برای نگهبانِ retry از uid ِ خودِ callback استفاده کن.
