---
title: "نشانهٔ skip در پیامِ کامیت، دیپلوی را ماه‌ها بی‌صدا متوقف می‌کند"
tags: ["deploy", "render", "ci", "git"]
topic_canonical: "render-skip-marker-hides-undeployed-work"
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

# نشانهٔ skip در پیامِ کامیت، دیپلوی را بی‌صدا متوقف می‌کند

## 🎯 چالش / Challenge
یک ابزارِ خودکار ده‌ها کامیت با `[skip render]` (یا `[skip ci]`) روی شاخهٔ اصلی گذاشت. میزبان
(Render و بیشترِ CIها) این کامیت‌ها را نادیده می‌گیرد. داشبورد همچنان «Live» نشان می‌داد، ولی نسخهٔ
در حالِ اجرا ماه‌ها عقب‌تر از `main` بود. هر کس فرض می‌کرد «push به main = دیپلوی»، اشتباه می‌کرد.

## 💡 راه‌حل / Solution
1. فهرستِ دیپلوی‌ها را از API ِ میزبان بخوان و کامیتِ «live» را با `HEAD` ِ `main` مقایسه کن.
2. اسکریپتِ ارسال پیامِ دارای نشانهٔ skip را **رد کند** (ارسال یعنی دیپلوی).
3. پس از push، وضعیتِ دیپلویِ همان کامیت را بپا (`live` / `build_failed`)، نه `/health`.

## 🧪 نمونه کد (Anonymized)
```bash
if printf '%s' "$MSG" | grep -qiE '\[(skip render|render skip|skip ci|ci skip)\]'; then
  echo "message would skip the deploy"; exit 1
fi
curl -s "$HOST_API/services/$SID/deploys?limit=1" | jq -r '.[0].deploy | .status + " " + .commit.id'
```

## ⚠️ نکات حیاتی / Pitfalls
- `/health` سبز فقط می‌گوید «یک نسخه» بالاست، نه «نسخهٔ تو».
- کامیت‌های skip‌شده اگر فقط مستندات باشند بی‌خطرند؛ ولی کامیتِ کدی که بعدشان بیاید همه را با هم
  می‌برد و دیف ِ بزرگ و غافلگیرکننده می‌سازد.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere
- [ ] در اسکریپتِ ارسال، نشانه‌های skip را رد کن.
- [ ] در هر بازرسی، «کامیتِ live» را با سرِ شاخهٔ دیپلوی مقایسه کن.
- [ ] ابزارهای همگام‌سازِ خودکار را از نوشتن روی شاخهٔ دیپلوی بازدار یا skip را آگاهانه مستند کن.

## 🔗 References
- مرتبط: health-ping-is-not-proof, gitignore-hides-source-from-deploy
