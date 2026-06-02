import rateLimit from 'express-rate-limit';

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// Shared options: emit the legacy X-RateLimit-* headers (X-RateLimit-Limit,
// X-RateLimit-Remaining, X-RateLimit-Reset) as well as the standard draft
// RateLimit-* headers.
const baseOptions = {
  windowMs: WINDOW_MS,
  standardHeaders: true,
  legacyHeaders: true,
};

// General limiter applied to all /api/* routes: 100 requests / 15 min per IP.
export const generalLimiter = rateLimit({
  ...baseOptions,
  max: 100,
  message: { error: 'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً بعداً دوباره تلاش کنید.' },
});

// Auth limiter for authentication-sensitive routes: 20 requests / 15 min per IP.
export const authLimiter = rateLimit({
  ...baseOptions,
  max: 20,
  message: { error: 'تعداد تلاش‌های احراز هویت بیش از حد مجاز است.' },
});

// Analysis limiter for the heavy file-analysis endpoint: 10 requests / 15 min per IP.
export const analysisLimiter = rateLimit({
  ...baseOptions,
  max: 10,
  message: { error: 'تعداد درخواست‌های تحلیل فایل بیش از حد مجاز است.' },
});

export default { generalLimiter, authLimiter, analysisLimiter };
