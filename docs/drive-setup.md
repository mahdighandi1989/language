# اتصالِ Google Drive — راهنمای ۵ قدمی برای مالک (حدودِ ۱۰ دقیقه، یک بار)

نتیجه: هر فایلی که با «📥 آپلودِ هوشمند» به درسی اضافه می‌کنید، علاوه بر دیتابیس، **یک نسخه در Drive ِ خودِ شما** در پوشهٔ
`زبان / درس‌ها / ‹عنوانِ درس›` ساخته می‌شود. برنامه فقط به فایل‌هایی که خودش می‌سازد دسترسی دارد (`drive.file`)، نه به بقیهٔ Drive.
هیچ رمز یا کلیدی در چت یا کد نوشته نمی‌شود.

### ۱) روشن کردنِ Drive API
<https://console.cloud.google.com/apis/library/drive.googleapis.com> را باز کنید، بالای صفحه پروژهٔ Firebase ِ برنامه را انتخاب کنید
(همان پروژهٔ ورودِ گوگل)، و **Enable** را بزنید.

### ۲) صفحهٔ رضایت (OAuth consent screen)
<https://console.cloud.google.com/apis/credentials/consent> ← User type: **External** ← نامِ برنامه (مثلاً «زبان») و ایمیلِ خودتان ←
Save. در بخشِ **Test users** ایمیلِ خودتان (`mohamad.mahdi1988@gmail.com`) را اضافه کنید. (Publish لازم نیست.)

### ۳) ساختنِ OAuth client
<https://console.cloud.google.com/apis/credentials> ← **Create credentials** ← **OAuth client ID** ← Application type: **Web application** ←
در **Authorized redirect URIs** دقیقاً این را بگذارید:

```
https://language-k4q9.onrender.com/api/drive/callback
```

← Create. پنجره‌ای **Client ID** و **Client secret** را نشان می‌دهد (هر دو را کپی کنید؛ جایی جز قدمِ ۴ نگذارید).

### ۴) گذاشتن در Render
<https://dashboard.render.com> ← سرویسِ **language** ← **Environment** ← Add:
- `GOOGLE_OAUTH_CLIENT_ID` = Client ID
- `GOOGLE_OAUTH_CLIENT_SECRET` = Client secret

← **Save, rebuild and deploy**. (`ENCRYPTION_KEY` باید از قبل آنجا باشد — توکن با آن رمز می‌شود؛ اگر نیست، پنلِ برنامه می‌گوید.)

### ۵) اتصال در برنامه
پس از پایانِ دیپلوی: برنامه ← **مدیریتِ کاربران** ← کارتِ **☁️ Google Drive** ← **🔗 اتصالِ Google Drive** ← حسابِ خودتان ← اگر «Google hasn't verified this
app» آمد: Advanced ← Go to … ← **Allow**. به برنامه برمی‌گردید و «✅ Google Drive وصل شد» می‌بینید. برای فایل‌های قبلی: **«انتقالِ فایل‌های قبلی به Drive»**.

---
**قطعِ اتصال:** همان کارت ← «قطعِ اتصال» (یا <https://myaccount.google.com/permissions>). فایل‌های Drive و نسخهٔ دیتابیس می‌مانند.
**خطاها:** اگر آپلود به Drive نرسد، آپلودِ درس خراب **نمی‌شود**؛ خطا روی همان فایل ثبت می‌شود و «انتقالِ فایل‌های قبلی» دوباره امتحان می‌کند.
**فنی:** `backend/services/drive/drive.js`، `backend/routes/drive.js`، `frontend/src/lessons/DrivePanel.jsx`؛ طرحِ اولیه: `docs/drive-plan.md`.
