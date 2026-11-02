---
title: "setDoc با merge کلیدِ حذف‌شدهٔ map را پاک نمی‌کند؛ ذخیرهٔ خودکار پیش از بارگذاری داده را می‌روبد"
tags: ["firestore", "sync", "react", "data-loss"]
topic_canonical: "firestore-merge-never-deletes-map-keys"
source:
  type: "claude-code-task"
  origin: "claude-code"
  imported_at: "2026-11-02T21:30:00Z"
created_at: "2026-11-02T21:30:00Z"
updated_at: "2026-11-02T21:30:00Z"
merged_from: []
resolution_status: "resolved"
recurrence_count: 1
user_confirmed: false
agents: ["Claude Code"]
---

# ذخیرهٔ خودکارِ کلِ state در یک سندِ Firestore — سه دامِ پنهان

## 🎯 چالش / Challenge
الگوی رایج: کلِ state ِ React در یک سند؛ `onSnapshot` ⇒ `setState`؛ effect ِ debounce‌شده ⇒ `setDoc(ref, state, {merge:true})`.
1. **merge کلیدِ حذف‌شده از یک map را پاک نمی‌کند** ⇒ «بازنشانی» (حذفِ کلید) در سند می‌ماند و با snapshot ِ بعدی برمی‌گردد.
2. **ذخیره پیش از بارگذاری:** پس از خروج/ورودِ دوباره در همان تب، state خالیِ اولیه با تایمرِ ۱ ثانیه ذخیره می‌شود و اگر
   snapshot دیرتر برسد، آرایه‌های واقعی (merge آرایه را **جایگزین** می‌کند) با خالی بازنویسی می‌شوند.
3. **حلقهٔ نوشتن:** هر snapshot شیءِ تازه می‌سازد ⇒ effect دوباره ذخیره می‌کند ⇒ snapshot ِ تازه … (هزینه و رقابت).
4. خطای ذخیره (مثلاً سندِ بزرگ‌تر از ۱MiB با رسانهٔ base64) فقط در کنسول ⇒ کاربر نمی‌فهمد هیچ‌چیز ذخیره نمی‌شود.

## 💡 راه‌حل / Solution
- «بارگذاری‌شده برای همین uid» را در ref نگه دار؛ پیش از آن هرگز ذخیره نکن.
- JSON ِ آخرین بارگذاری/ذخیره را نگه دار؛ اگر یکی بود ذخیره نکن. snapshot ِ `hasPendingWrites` (پژواکِ خودت) را نادیده بگیر.
- وقتی state کلِ سند است، `setDoc` بدونِ merge بنویس (یا حذف را صریح با `deleteField()`).
- خطای ذخیره را در UI نشان بده و اندازهٔ سند را بسنج.

## 🧪 نمونه کد (Anonymized)
```js
if (loadedUidRef.current !== uid) return;            // not loaded yet
const json = JSON.stringify(state);
if (json === lastSyncedRef.current) return;          // nothing new (breaks the loop)
setDoc(ref, state).then(() => { lastSyncedRef.current = json; }).catch(showError);
```

## ⚠️ نکات حیاتی / Pitfalls
- آزمونِ «با شبکهٔ کند» لازم است؛ روی شبکهٔ سریع مسابقه دیده نمی‌شود.
- یک سند برای همه‌چیز سقفِ ۱MiB دارد؛ رسانه را در Storage بگذار و فقط ارجاع نگه دار.

## 🔁 چطور در جای دیگر اعمال کنیم / How to Apply Elsewhere
- [ ] هر auto-save: نگهبانِ «بارگذاری‌شده» + نگهبانِ «تغییرِ واقعی».
- [ ] هر حذفِ کلید در map: آیا نوشتن آن را واقعاً حذف می‌کند؟
- [ ] خطای ذخیره دیده شود، نه فقط لاگ.

## 🔗 References
- مرتبط: health-ping-is-not-proof
