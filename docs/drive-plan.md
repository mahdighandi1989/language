# طرحِ اتصالِ Google Drive برای اصلِ فایل‌های درس (منتظرِ هماهنگی با مالک)

**وضعیتِ فعلی (2026-11-03):** اصلِ هر فایلِ «آپلودِ هوشمند» در **دیتابیس** (Firestore با حسابِ سرویسِ موجود) نگه داشته و از صفحهٔ درس
دانلودشدنی است. نسخهٔ Drive هنوز ساخته نشده، چون به یک اقدامِ یک‌بارهٔ مالک نیاز دارد.

## چرا «حسابِ سرویس» کافی نیست
حسابِ سرویس فضای ذخیره ندارد؛ آپلودِ آن در Drive ِ شخصیِ Gmail حتی در پوشهٔ اشتراکی با `storageQuotaExceeded` رد می‌شود. پس باید
**خودِ مالک** یک بار اجازه بدهد (OAuth) تا فایل‌ها در Drive ِ خودش و با سهمیهٔ خودش ساخته شوند.

## طرح (پیشنهادی) — OAuth ِ یک‌باره، بی‌وارد کردنِ رمز در چت
1. **مالک، یک بار در Google Cloud Console (همان پروژهٔ Firebase: labaneseapp):**
   - APIs & Services › Library › **Google Drive API** › Enable.
   - OAuth consent screen › External › نامِ برنامه + ایمیلِ مالک › Test users: ایمیلِ مالک.
   - Credentials › Create credentials › **OAuth client ID** › Web application ›
     Authorized redirect URI: `https://language-k4q9.onrender.com/api/drive/callback`.
   - **Client ID** و **Client secret** را در Render › language › Environment بگذارد:
     `GOOGLE_OAUTH_CLIENT_ID`، `GOOGLE_OAUTH_CLIENT_SECRET` (در چت/کد نوشته نمی‌شوند).
2. **در برنامه:** دکمهٔ «🔗 اتصالِ Google Drive» در «مدیریتِ کاربران» ⇒ صفحهٔ اجازهٔ گوگل ⇒ مالک «Allow» می‌زند. فقط دسترسیِ
   `drive.file` (فقط فایل‌هایی که خودِ برنامه می‌سازد — نه بقیهٔ Drive). refresh token رمزشده (`ENCRYPTION_KEY`) سمتِ سرور ذخیره می‌شود.
3. **رفتار:** هر آپلود ⇒ اول دیتابیس (مثلِ حالا)، بعد Drive در پوشهٔ `زبان/درس‌ها/<عنوانِ درس>/`؛ پیوندِ Drive کنارِ فایل. شکستِ Drive
   هیچ‌وقت آپلود را خراب نمی‌کند و «⚠ در Drive ذخیره نشد» نشان داده می‌شود؛ صفِ انتقالِ دوباره دارد. فایل‌های قبلی با یک دکمه به Drive
   منتقل می‌شوند (کپی؛ نسخهٔ دیتابیس می‌ماند).
4. **لغو:** دکمهٔ «قطعِ اتصال» + myaccount.google.com/permissions.

## آنچه از مالک لازم است
فقط بندِ ۱ (حدودِ ۵ دقیقه) و یک کلیکِ «Allow». رمز یا کلیدی در چت وارد نمی‌شود. پس از اینکه بگویید دو متغیر روی Render است، می‌سازم.
