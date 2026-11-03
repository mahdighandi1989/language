/**
 * Purpose: tell the submitter of a sheet what happened to it — by e-mail, once
 * per status (accepted / declined, with the owner's reason). SMTP is configured
 * only with Render env vars (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD,
 * MAIL_FROM); without them nothing is sent and the sheet SAYS so
 * (`mail.status = 'not-configured'`) — never silent, never fatal.
 *
 * Upstream: nodemailer (lazy). Downstream: routes/inspection.js (triage).
 */

export const MAIL_TEXT = {
  open: {
    subject: 'درخواستِ نظارتِ شما پذیرفته شد',
    body: (s) => `درخواستِ شما (برگهٔ ${s.number}) را مدیر پذیرفت و به ناظر سپرده شد.`,
  },
  declined: {
    subject: 'درخواستِ نظارتِ شما رد شد',
    body: (s) => `درخواستِ شما (برگهٔ ${s.number}) را مدیر رد کرد.${s.triageNote ? `\nدلیلِ رد: ${s.triageNote}` : ''}`,
  },
};

export function smtpConfigured(env = process.env) {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD);
}

let transportFactory = null;
/** Test seam: replace the nodemailer transport factory. */
export function setTransportFactory(fn) { transportFactory = fn; }

async function transport(env) {
  if (transportFactory) return transportFactory(env);
  const nodemailer = (await import('nodemailer')).default;
  const port = Number(env.SMTP_PORT || 465);
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
  });
}

/** Compose the message for a sheet's current status, or null when none is due. */
export function composeMail(sheet, appUrl = '') {
  const t = MAIL_TEXT[sheet.status];
  if (!t || !sheet.createdBy) return null;
  const lines = [t.body(sheet), `عنوان: «${sheet.title}»`];
  if (appUrl) lines.push(`وضعیت را در برنامه ببینید: ${appUrl.replace(/\/$/, '')}/#/inspection`);
  const text = lines.join('\n');
  const html = `<div dir="rtl" style="font-family:Tahoma,sans-serif">${lines.map((l) => `<p>${l
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`).join('')}</div>`;
  return { to: sheet.createdBy, subject: t.subject, text, html };
}

/**
 * Send the status mail. Returns the `mail` record to store on the sheet:
 * { status: 'sent'|'not-configured'|'failed'|'skipped', for, at, error? }.
 */
export async function notifySubmitter(sheet, env = process.env, now = new Date()) {
  const base = { for: sheet.status, at: now.toISOString() };
  const msg = composeMail(sheet, env.FRONTEND_URL || '');
  if (!msg) return { ...base, status: 'skipped' };
  if (!smtpConfigured(env)) return { ...base, status: 'not-configured' };
  try {
    const t = await transport(env);
    await t.sendMail({ from: env.MAIL_FROM || env.SMTP_USER, ...msg });
    return { ...base, status: 'sent' };
  } catch (e) {
    return { ...base, status: 'failed', error: String(e?.message || e).slice(0, 200) };
  }
}
