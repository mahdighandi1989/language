// Purpose: «ناظر کی می‌آید؟» on the OWNER's own clock. The server sends only the
// instant (UTC) and how sure it is (observed / assumed / stale); the sentence is
// built here so the time is the reader's local time. Pure, tested.
// Upstream: GET /api/inspection/rounds. Downstream: InspectionBoard.jsx.

const fa = (n) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[+d]);

/** «۱۰:۲۳» (local), with «(فردا)» when it is not today. */
export function localClock(iso, now = new Date()) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const t = fa(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
  if (d.toDateString() === now.toDateString()) return t;
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
  if (d.toDateString() === tomorrow.toDateString()) return `${t} (فردا)`;
  return `${d.toLocaleDateString('fa-IR', { weekday: 'long' })} ${t}`;
}

/** «۱۹ دقیقهٔ دیگر» / «۱ ساعت و ۵ دقیقهٔ دیگر» / «همین حالا» */
export function humanGap(minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) return 'همین حالا';
  if (minutes < 1) return 'کمتر از یک دقیقهٔ دیگر';
  if (minutes < 60) return `${fa(Math.round(minutes))} دقیقهٔ دیگر`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h >= 48) return `${fa(Math.round(h / 24))} روزِ دیگر`;
  return m ? `${fa(h)} ساعت و ${fa(m)} دقیقهٔ دیگر` : `${fa(h)} ساعتِ دیگر`;
}

export function minutesUntil(iso, now = new Date()) {
  return Math.round((new Date(iso).getTime() - now.getTime()) / 60000);
}

/** The sentence after pressing ⚡ (and the ETA on an urgent sheet). */
export function rushMessage(position, nr, now = new Date()) {
  const place = position === 1 ? 'در صفِ فوری، نفرِ اول' : `در صفِ فوری، نفرِ ${fa(position)} — به ترتیبی که زدی انجام می‌شود`;
  if (!nr || !nr.at) return `${place} — ناظر در دورِ بعدی برمی‌داردش`;
  if (nr.basis === 'stale') {
    return `${place} — ولی ناظرِ فوری از ${localClock(nr.lastSeen || nr.at, now)} سر نزده؛ ممکن است روتینش خاموش باشد.`;
  }
  const hedge = nr.basis === 'assumed' ? ' — تخمینی، هنوز دوری ثبت نشده' : '';
  return `${place} · ناظر ساعتِ ${localClock(nr.at, now)} (${humanGap(minutesUntil(nr.at, now))}) می‌رود سراغش${hedge}`;
}

export { fa };
