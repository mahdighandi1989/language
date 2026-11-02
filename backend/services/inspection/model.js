/**
 * Purpose: the rules of «نظارت و سرکشی» (inspection sheets) as pure functions —
 * no I/O, so every rule is unit-testable. Modelled on the sibling projects'
 * implementation (Detective-1 / ALLIN1), adapted to this Express + Firestore app.
 *
 * The owner walks the app, draws a box around what is wrong, writes text and
 * attaches files; the scheduled supervisor (a Claude Code routine with its own
 * account) reads the sheet, does the work and answers UNDER the sheet; only the
 * owner ticks it; the next round files it into a binder.
 *
 * THE RULES THIS SHAPE ENFORCES:
 * 1. `status` is where the conversation is; `outcome` (on the supervisor's note)
 *    is what actually happened. The colour shown is DERIVED from the outcome — a
 *    reply alone never turns a sheet green.
 * 2. `fixed` without an after-picture is refused (and shown as partial if old).
 * 3. Only the owner ticks: the supervisor account is refused by approve/urgent/triage.
 * 4. Every answer carries its dependency chain.
 * 5. Attached files are READ: the answer is refused while any file is unread.
 * 6. Sheets are never deleted — a non-admin's sheet waits for the owner (pending)
 *    and a refused one is kept as `declined`.
 *
 * Upstream: none (pure). Downstream: routes/inspection.js, store.js, tests.
 */

export const STATUS = Object.freeze({
  PENDING: 'pending', // a non-admin's sheet, waiting for the owner's yes
  OPEN: 'open', // waiting for the supervisor
  ANSWERED: 'answered', // the supervisor wrote under it (any outcome)
  APPROVED: 'approved', // the owner ticked it
  FILED: 'filed', // archived into a binder
  DECLINED: 'declined', // the owner said no; kept, never reaches the supervisor
});
export const STATUSES = Object.values(STATUS);
export const NOT_FOR_SUPERVISOR = [STATUS.PENDING, STATUS.DECLINED, STATUS.FILED];

export const STATUS_LABEL = {
  pending: 'در انتظارِ تأییدِ مدیر',
  open: 'در انتظارِ ناظر',
  answered: 'ناظر پاسخ داد',
  approved: 'تأییدِ مالک',
  filed: 'بایگانی‌شده',
  declined: 'ردِ مدیر',
};

// What ACTUALLY happened. There is deliberately no value meaning «I think I fixed it».
export const OUTCOME = Object.freeze({
  FIXED: 'fixed',
  PARTIAL: 'partial',
  NOT_DONE: 'not-done',
  NEEDS_OWNER: 'needs-owner',
});
export const OUTCOMES = Object.values(OUTCOME);
export const OUTCOME_LABEL = {
  fixed: '✓ درست شد',
  partial: '◑ نیمه‌کاره',
  'not-done': '✗ درست نشد',
  'needs-owner': '؟ منتظرِ انتخابِ مالک',
};
export const OUTCOME_HINT = {
  fixed: 'ناظر تغییر را انجام داد و بعدش خودش نگاه کرد — تصویرِ بعدش روی برگه است.',
  partial: 'بخشی از خواسته انجام شد؛ بقیه‌اش زیرِ همین برگه توضیح داده شده. دورِ بعد ادامه می‌دهد.',
  'not-done': 'انجام نشد. دلیلش زیرِ همین برگه است. دورِ بعد دوباره تلاش می‌کند.',
  'needs-owner': 'خواسته با ساختار/منطقِ سامانه نمی‌خواند. گزینه‌ها نوشته شده — انتخاب با مالک است.',
};

export const DEP_STATUSES = ['ok', 'missing', 'risk'];
export const EXTRACT = Object.freeze({
  OK: 'ok', EMPTY: 'empty', UNSUPPORTED: 'unsupported', FAILED: 'failed', IMAGE: 'image', PENDING: 'pending',
});
export const EXTRACT_LABEL = {
  ok: 'متن استخراج شد — ناظر باید کاملش را بخواند',
  empty: 'فایل باز شد ولی متنی نداشت',
  unsupported: 'برای این نوع استخراجِ متن نداریم — ناظر باید خودِ فایل را باز کند',
  failed: 'استخراج شکست خورد — دلیلش ثبت شده؛ ناظر باید خودِ فایل را باز کند',
  image: 'تصویر است — ناظر باید نگاهش کند',
  pending: 'در صفِ رونویسی/استخراج — هنوز متن ندارد',
};

export const BINDER_CAPACITY = 40;
export const URGENT_CLAIM_TTL_MS = 100 * 60 * 1000;
export const MAX_TEXT = 20000;
export const MAX_FILE_BYTES = 25 * 1024 * 1024;
export const MAX_SHOT_BYTES = 6 * 1024 * 1024;
export const TEXT_SLICE_MAX = 200000;

export class InspectionError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const err = (status, message) => new InspectionError(status, message);

export function cleanText(value, max = MAX_TEXT) {
  return String(value ?? '').replace(/\u0000/g, '').trim().slice(0, max);
}

/** Which attached files a supervisor still owes a read on. Empty list = may answer. */
export function fileReadDebt(files = []) {
  const debt = [];
  for (const f of files) {
    const name = f.filename || '?';
    if (f.extractStatus === EXTRACT.OK) {
      const total = Number(f.textChars || 0);
      const got = Number(f.readChars || 0);
      if (total && got < total) {
        debt.push({ fileId: f.id, filename: name, reason: 'text', remaining: total - got, textChars: total });
      } else if (f.textTruncated && !f.viewedAt) {
        debt.push({ fileId: f.id, filename: name, reason: 'truncated', remaining: 1, textChars: total });
      }
    } else if (f.extractStatus === EXTRACT.PENDING) {
      debt.push({ fileId: f.id, filename: name, reason: 'pending', remaining: 1, textChars: 0 });
    } else if ([EXTRACT.IMAGE, EXTRACT.UNSUPPORTED, EXTRACT.FAILED].includes(f.extractStatus) && !f.viewedAt) {
      debt.push({ fileId: f.id, filename: name, reason: 'unopened', remaining: 1, textChars: 0 });
    }
  }
  return debt;
}

export function describeDebt(debt) {
  return debt.slice(0, 6).map((d) => {
    if (d.reason === 'text') return `«${d.filename}»: ${d.remaining} نویسه از ${d.textChars} خوانده نشده`;
    if (d.reason === 'truncated') return `«${d.filename}»: متنش بریده بود؛ خودِ فایل را هم باز کن`;
    if (d.reason === 'pending') return `«${d.filename}»: هنوز رونویسی/استخراج نشده`;
    return `«${d.filename}»: هنوز باز نشده`;
  }).join('؛ ');
}

/** The last supervisor note (or null). */
export function lastReviewerNote(sheet) {
  const notes = sheet?.notes || [];
  for (let i = notes.length - 1; i >= 0; i -= 1) if (notes[i].by === 'reviewer') return notes[i];
  return null;
}

/** THE COLOUR THE OWNER SEES — derived, never stored. */
export function sheetGlow(sheet) {
  const { status } = sheet;
  if ([STATUS.APPROVED, STATUS.FILED, STATUS.OPEN, STATUS.PENDING, STATUS.DECLINED].includes(status)) {
    return { key: status, label: STATUS_LABEL[status], tone: status };
  }
  const last = lastReviewerNote(sheet);
  const outcome = last?.outcome;
  if (!outcome || !OUTCOME_LABEL[outcome]) return { key: 'stale', label: 'پاسخ بدونِ نتیجه', tone: 'stale' };
  if (outcome === OUTCOME.FIXED && !last.afterShotId) {
    return { key: 'partial', label: 'ادعای انجام، بدونِ تصویرِ بعدش', tone: 'partial', outcome: 'partial' };
  }
  return { key: outcome, label: OUTCOME_LABEL[outcome], tone: outcome, outcome, hint: OUTCOME_HINT[outcome] };
}

/** Does this sheet still need the supervisor? (open, or answered partial/not-done/stale) */
export function needsSupervisor(sheet) {
  if (sheet.status === STATUS.OPEN) return true;
  if (sheet.status !== STATUS.ANSWERED) return false;
  const glow = sheetGlow(sheet);
  return ['partial', 'not-done', 'stale'].includes(glow.key);
}

/** Who may see a sheet. */
export function canSee(actor, sheet) {
  if (actor.role === 'owner') return true;
  if (actor.role === 'supervisor') return !NOT_FOR_SUPERVISOR.includes(sheet.status) || sheet.status === STATUS.FILED;
  return Boolean(actor.uid) && sheet.createdByUid === actor.uid;
}

/** Validate a supervisor/owner note BEFORE it is stored. Throws InspectionError. */
export function validateNote(actor, sheet, body, files = []) {
  if (sheet.status === STATUS.FILED) throw err(422, 'برگهٔ بایگانی‌شده بسته است — برای موضوعِ تازه، برگهٔ تازه ثبت کن');
  if (sheet.status === STATUS.DECLINED) throw err(422, 'این برگه رد شده و بسته است — برای موضوعِ تازه، برگهٔ تازه ثبت کن');
  const text = cleanText(body.text);
  if (!text) throw err(422, 'متنِ یادداشت خالی است');
  const reviewer = actor.role === 'supervisor';
  if (reviewer && sheet.status === STATUS.PENDING) throw err(422, 'این برگه هنوز تأییدِ مدیر را ندارد — ناظر رویش کار نمی‌کند');
  if (!reviewer && body.outcome != null) throw err(422, '«نتیجه» را فقط ناظر ثبت می‌کند');
  if (reviewer) {
    if (!body.outcome) throw err(422, 'جوابِ ناظر باید نتیجه داشته باشد (fixed / partial / not-done / needs-owner)');
    if (!OUTCOMES.includes(body.outcome)) throw err(422, 'نتیجهٔ نامعتبر');
    if (body.outcome === OUTCOME.FIXED && !body.afterShot) {
      throw err(422, '«درست شد» بدونِ تصویرِ بعدش پذیرفته نمی‌شود — تصویر بفرست یا نتیجه را «نیمه‌کاره»/«درست نشد» بگذار');
    }
    if (body.outcome === OUTCOME.FIXED && !(body.commits || []).length && !cleanText(body.noChangeReason)) {
      throw err(422, '«درست شد» بدونِ کامیت پذیرفته نمی‌شود — commits را بده، یا اگر واقعاً تغییری لازم نبود noChangeReason بنویس');
    }
    if (body.outcome === OUTCOME.FIXED && cleanText(body.noChangeReason) && cleanText(body.noChangeReason).length < 40
      && !(body.commits || []).length) {
      throw err(422, 'دلیلِ «بی‌تغییر» باید دست‌کم ۴۰ نویسه باشد');
    }
    if (!Array.isArray(body.deps) || body.deps.length === 0) {
      throw err(422, 'هر جواب زنجیرهٔ وابستگی‌اش را دارد — deps را بده (نام=ok|missing|risk)');
    }
    for (const d of body.deps) {
      if (!d || !cleanText(d.name, 160) || !DEP_STATUSES.includes(d.status)) {
        throw err(422, 'وابستگیِ نامعتبر — هر حلقه نام و وضعیتِ ok/missing/risk دارد');
      }
    }
    if (body.outcome === OUTCOME.NEEDS_OWNER && !/(گزینه|جایگزین|option)/i.test(text)) {
      throw err(422, '«منتظرِ مالک» باید دلیل و دو-سه جایگزینِ مشخص داشته باشد (کلمهٔ «گزینه» یا «جایگزین» در متن)');
    }
    const debt = fileReadDebt(files);
    if (debt.length) {
      throw err(422, `پیش از پاسخ باید پیوست‌ها را کامل بخوانی — ${describeDebt(debt)}`);
    }
  }
  return text;
}

/** Apply a validated note to a sheet (mutates and returns it). */
export function applyNote(actor, sheet, note, now = new Date()) {
  sheet.notes = [...(sheet.notes || []), note];
  if (actor.role === 'supervisor') {
    if ([STATUS.OPEN, STATUS.ANSWERED, STATUS.APPROVED].includes(sheet.status)) sheet.status = STATUS.ANSWERED;
    if (sheet.urgentAt && !sheet.urgentDoneAt) {
      sheet.urgentDoneAt = now.toISOString();
      sheet.urgentClaimedAt = null;
      sheet.urgentClaimedBy = '';
    }
    if (note.deps?.length) sheet.deps = [...(sheet.deps || []), ...note.deps.map((d) => ({ ...d, noteId: note.id }))];
  } else {
    if (sheet.urgentDoneAt) sheet.urgentDoneAt = null; // back in the fast queue at its original place
    if ([STATUS.ANSWERED, STATUS.APPROVED].includes(sheet.status)) sheet.status = STATUS.OPEN;
    if (sheet.status === STATUS.OPEN && actor.role !== 'owner') sheet.status = STATUS.PENDING;
  }
  sheet.updatedAt = now.toISOString();
  return sheet;
}

export function assertOwner(actor, action) {
  if (actor.role === 'supervisor') throw err(403, `${action} فقط کارِ مالک است — حسابِ ناظر رد می‌شود`);
  if (actor.role !== 'owner') throw err(403, `${action} فقط کارِ مالک است`);
}

/** Owner's tick. Only an answered sheet can be approved. */
export function approve(actor, sheet, now = new Date()) {
  assertOwner(actor, 'تیکِ تأیید');
  if (sheet.status !== STATUS.ANSWERED) {
    throw err(422, `فقط برگهٔ «ناظر پاسخ داد» تأیید می‌شود (وضعیت: ${STATUS_LABEL[sheet.status] || sheet.status})`);
  }
  sheet.status = STATUS.APPROVED;
  sheet.approvedAt = now.toISOString();
  sheet.approvedBy = actor.email || '';
  sheet.updatedAt = now.toISOString();
  return sheet;
}

/** Owner's triage of a non-admin's sheet: accept → open, decline → declined (kept). */
export function triage(actor, sheet, decision, note = '', now = new Date()) {
  assertOwner(actor, 'بررسیِ برگهٔ کاربر');
  if (sheet.status !== STATUS.PENDING) {
    throw err(422, `این برگه منتظرِ تأیید نیست (وضعیت: ${STATUS_LABEL[sheet.status] || sheet.status})`);
  }
  if (!['accept', 'decline'].includes(decision)) throw err(422, 'تصمیم باید accept یا decline باشد');
  sheet.status = decision === 'accept' ? STATUS.OPEN : STATUS.DECLINED;
  sheet.triageNote = cleanText(note, 2000);
  sheet.triagedBy = actor.email || '';
  sheet.triagedAt = now.toISOString();
  sheet.updatedAt = now.toISOString();
  return sheet;
}

/** Owner reopens an answered/approved sheet («not settled»). */
export function reopen(actor, sheet, now = new Date()) {
  assertOwner(actor, 'بازکردنِ دوبارهٔ برگه');
  if (![STATUS.ANSWERED, STATUS.APPROVED].includes(sheet.status)) {
    throw err(422, 'فقط برگهٔ پاسخ‌داده یا تأییدشده دوباره باز می‌شود');
  }
  sheet.status = STATUS.OPEN;
  sheet.updatedAt = now.toISOString();
  return sheet;
}

export function setUrgent(actor, sheet, on, now = new Date()) {
  assertOwner(actor, 'دکمهٔ «فوری»');
  if (on) {
    if ([STATUS.FILED, STATUS.DECLINED].includes(sheet.status)) throw err(422, 'برگهٔ بسته نوبتِ فوری نمی‌گیرد');
    if (sheet.status === STATUS.PENDING) throw err(422, 'اول برگه را بپذیر (triage)، بعد فوری کن');
    if (!sheet.urgentAt) sheet.urgentAt = now.toISOString();
    sheet.urgentDoneAt = null;
  } else {
    sheet.urgentAt = null;
    sheet.urgentDoneAt = null;
    sheet.urgentClaimedAt = null;
    sheet.urgentClaimedBy = '';
  }
  sheet.updatedAt = now.toISOString();
  return sheet;
}

/** The fast queue in the order the owner pressed the button. */
export function urgentQueue(sheets) {
  return sheets
    .filter((s) => s.urgentAt && !s.urgentDoneAt && !NOT_FOR_SUPERVISOR.includes(s.status))
    .sort((a, b) => String(a.urgentAt).localeCompare(String(b.urgentAt)));
}

/** Claim the first urgent sheet whose claim is free or expired. Supervisor only. */
export function claimUrgent(actor, sheets, runId = '', now = new Date()) {
  if (actor.role !== 'supervisor') throw err(403, 'صفِ فوری را فقط حسابِ ناظر برمی‌دارد');
  for (const s of urgentQueue(sheets)) {
    const claimed = s.urgentClaimedAt ? new Date(s.urgentClaimedAt).getTime() : 0;
    if (!claimed || now.getTime() - claimed > URGENT_CLAIM_TTL_MS) {
      s.urgentClaimedAt = now.toISOString();
      s.urgentClaimedBy = cleanText(runId, 80) || 'supervisor';
      return s;
    }
  }
  return null;
}

/** File every approved sheet into the current binder (40 per binder). */
export function fileApproved(actor, sheets, binders, now = new Date()) {
  if (!['owner', 'supervisor'].includes(actor.role)) throw err(403, 'بایگانی فقط کارِ مالک یا ناظر است');
  const filed = [];
  let binder = binders.find((b) => !b.closedAt) || null;
  for (const s of sheets.filter((x) => x.status === STATUS.APPROVED).sort((a, b) => a.number - b.number)) {
    if (!binder || binder.sheetIds.length >= BINDER_CAPACITY) {
      if (binder) binder.closedAt = now.toISOString();
      binder = { number: binders.length + 1, openedAt: now.toISOString(), closedAt: null, sheetIds: [] };
      binders.push(binder);
    }
    binder.sheetIds.push(s.id);
    s.status = STATUS.FILED;
    s.binderNumber = binder.number;
    s.binderPage = binder.sheetIds.length;
    s.filedAt = now.toISOString();
    s.updatedAt = now.toISOString();
    filed.push(s);
  }
  return filed;
}

/** Initial status of a new sheet: owner/supervisor → open; anyone else → pending. */
export function initialStatus(actor) {
  return actor.role === 'owner' || actor.role === 'supervisor' ? STATUS.OPEN : STATUS.PENDING;
}

/** Sheet as returned by the API (adds derived fields; never blobs). */
export function present(sheet, files = []) {
  return {
    ...sheet,
    glow: sheetGlow(sheet),
    statusLabel: STATUS_LABEL[sheet.status] || sheet.status,
    needsSupervisor: needsSupervisor(sheet),
    readDebt: fileReadDebt(files),
    files: files.map((f) => ({ ...f, extractLabel: EXTRACT_LABEL[f.extractStatus] || f.extractStatus })),
  };
}
