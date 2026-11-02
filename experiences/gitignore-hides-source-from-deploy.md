---
title: "قاعدهٔ .gitignore فایلِ منبع را از دیپلوی پنهان می‌کند و بیلدِ محلی سبز می‌ماند"
tags: ["git", "deploy", "build"]
topic_canonical: "gitignore-hides-source-from-deploy"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-11-02T20:30:00Z"
created_at: "2026-11-02T20:30:00Z"
updated_at: "2026-11-02T20:30:00Z"
merged_from: []
resolution_status: "mitigated"
recurrence_count: 1
user_confirmed: false
agents: ["Claude Code"]
---

# قاعدهٔ .gitignore فایلِ منبع را از دیپلوی پنهان می‌کند

## 🎯 چالش / Challenge
یک الگوی کلی در `.gitignore` (مثلاً `lib/` یا `data/`) فایلِ منبعی را که هم‌نامِ آن پوشه است نادیده
گرفت. بیلدِ محلی (که فایل را روی دیسک دارد) سبز بود؛ بیلدِ میزبان (که از گیت می‌سازد) شکست خورد.

## 💡 راه‌حل / Solution
پیش از هر ارسال، فایل‌های نادیده‌گرفته‌شده در پوشه‌های منبع را فهرست کن و اگر چیزی جز خروجی/کش بود،
ارسال را متوقف کن.

## 🧪 نمونه کد (Anonymized)
```bash
hidden="$(git ls-files --others --ignored --exclude-standard -- src backend scripts \
  | grep -v -E '(node_modules/|__pycache__|^dist/)' || true)"
[ -z "$hidden" ] || { echo "$hidden"; echo "ignored source files"; exit 1; }
```

## ⚠️ نکات حیاتی / Pitfalls
- الگوهای بی‌اسلش (`data/`) در هر عمقی اعمال می‌شوند، نه فقط ریشه.
- استثنا را دقیق بنویس (پوشهٔ دادهٔ زمانِ اجرا) تا بررسی بی‌خاصیت نشود.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere
- [ ] بررسیِ «منبعِ نادیده‌گرفته» را در اسکریپتِ ارسال/CI بگذار.
- [ ] الگوهای `.gitignore` را با `/` ریشه‌دار کن مگر عمداً عمومی باشند.

## 🔗 References
- مرتبط: health-ping-is-not-proof
