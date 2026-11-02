---
name: صفِ فوریِ «نظارت و سرکشی» — زبان
version: 1
created: 2026-11-02
updated: 2026-11-02
supersedes: null
archive: docs/supervisor/archive/
routine: «صفِ فوریِ نظارت — زبان (ساعتی)» (شناسه در docs/supervisor/README.md)
---

# دستورِ صفِ فوری — نسخهٔ ۱

> تنها مرجعِ رفتارِ روتینِ ساعتی. نسخهٔ قبلی در `archive/URGENT_PROMPT-v{N}-{YYYY-MM-DD}.md` بایگانی می‌شود.

تو فقط **یک** برگهٔ «⚡ فوری» را برمی‌داری و تمامش می‌کنی. بی‌ناظرِ انسانی: سؤال نپرس، plan نکن.

1. **کوتاه‌ترین آماده‌سازی:** `[ -d node_modules ] || npm ci --no-audit --no-fund`؛ اگر مخزن در نشست نیست
   `add_repo` (mahdighandi1989/language). `git fetch origin main && git checkout -B claude/urgent-run origin/main`.
2. **برداشتن:**
   ```bash
   python3 scripts/supervisor/inspection.py urgent --run-id "urgent-$(date -u +%Y%m%dT%H%M)"
   ```
   - کدِ **۰** = صف خالی ⇒ **هیچ کاری نکن، هیچ چیزی ننویس، کامیت نکن**؛ یک خط گزارش: «صفِ فوری خالی بود». (بی‌صدا.)
   - کدِ **۳** = خطا ⇒ متنِ خطا را گزارش کن (همان چیزی که مالک باید درست کند) و تمام.
   - کدِ **۵** = برگه برداشته شد ⇒ `docs/supervisor/inspection/URGENT.md` را **کامل** بخوان، تصویرها را **باز کن و ببین**،
     پیوست‌ها (`files/<شماره>/`) را تا آخر بخوان.
3. **پیش از کار:** `AGENTS.md`، `CLAUDE.md`، `experiences/` و بخش‌های «شش قاعده» و «روشِ بررسی» ِ
   [`PROMPT.md`](PROMPT.md) را بخوان — همان قواعد این‌جا هم حاکم است.
4. **کار:** خواسته را شماره‌گذاری کن، زنجیرهٔ وابستگی را بسنج، اصلاح + تست، `scripts/ship.sh "fix(…): … (sheet #N)"`،
   صبر برای دیپلوی (`python3 scripts/supervisor/deploys.py --wait`)، عکسِ بعد از همان گره
   (`node scripts/supervisor/screenshot.mjs …`) و تطبیق با خواسته.
5. **جواب:** `inspection.py answer <N> --outcome … --after … --commit … --dep …`. جواب (هر نتیجه‌ای) برگه را از صفِ فوری
   بیرون می‌برد. claim ِ برگه ۱۰۰ دقیقه معتبر است؛ اگر تمام نشد `partial`/`not-done` با دلیل بنویس — سکوت نه.
6. **ثبت:** یک بخش در `docs/supervisor/RUNLOG.md` و `docs/WORKLOG.md` (امضا: `ناظرِ خودکار (Claude Code routine)`)،
   سپس `scripts/ship.sh "docs(supervisor): urgent run sheet #N"`.
7. **گزارش به مالک:** دو-سه خط فارسی: برگه، نتیجه، کامیت، آنچه از مالک لازم است.

خطوطِ قرمزِ `PROMPT.md` §۶ بی‌استثنا حاکم‌اند.
