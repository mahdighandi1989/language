// Purpose: admin bulk import of lessons from a versioned JSON file — validate,
// PREVIEW, then apply as a pure merge. Rules (owner, 2026-11-03):
//   * idempotent: a lesson is identified by `sourceKey`; one already imported is
//     skipped, never duplicated, never overwritten;
//   * existing lessons (with their chats and knowledge) are never rewritten or
//     removed. A title that already exists (e.g. «1 - ریتا») gets the imported
//     notes APPENDED under a marked heading — the old text stays byte-for-byte
//     as its prefix — and the sourceKey is recorded on it (importedSourceKeys)
//     so a second run appends nothing. A lesson whose text is still loading is
//     reported as blocked, never touched;
//   * archivedNotes is stored exactly as given (no trimming, no Gemini);
//   * knowledge items merge into the knowledge centre, de-duplicated by term
//     within a category (the same rule as updateKnowledgeBase).
// Pure: (data, file) → plan → new data. Upstream: LessonImportPanel.jsx.

export const IMPORT_FORMAT = 'lebanese-lessons';
export const IMPORT_VERSION = 1;
export const KNOWLEDGE_CATEGORIES = ['vocabulary', 'phrases', 'grammar', 'verbs', 'pronouns', 'adjectives'];
export const MAX_LESSONS = 2000;
export const MAIN_DOC_SOFT_LIMIT = 900 * 1024; // bytes; Firestore hard cap is 1 MiB
// An existing inline lesson that grows past this after an append moves its text
// to the separate body store (the whole text, old + new — nothing is dropped).
export const EXTERNALIZE_CHARS = 20000;

export function appendHeading(sourceKey) {
  return `\n\n---\n## 📥 جزوهٔ واردشده (${sourceKey})\n\n`;
}

function validSources(v) {
  return Array.isArray(v) && v.every((x) => isStr(x) || (x && typeof x === 'object' && !Array.isArray(x)
    && Object.values(x).every((y) => isStr(y) || typeof y === 'number')));
}

const isStr = (v) => typeof v === 'string';
const normTerm = (t) => String(t ?? '').trim().toLowerCase();

/** Validate the parsed file. Returns { ok, errors[], lessons[] (normalised) }. */
export function validateImport(file) {
  const errors = [];
  if (!file || typeof file !== 'object' || Array.isArray(file)) return { ok: false, errors: ['فایل باید یک شیءِ JSON باشد'], lessons: [] };
  if (file.format !== IMPORT_FORMAT) errors.push(`format باید «${IMPORT_FORMAT}» باشد`);
  if (file.version !== IMPORT_VERSION) errors.push(`version باید ${IMPORT_VERSION} باشد (این فایل: ${file.version ?? 'ندارد'})`);
  if (!Array.isArray(file.lessons) || !file.lessons.length) errors.push('lessons باید آرایهٔ ناخالی باشد');
  const lessons = [];
  const seen = new Set();
  (Array.isArray(file.lessons) ? file.lessons : []).slice(0, MAX_LESSONS + 1).forEach((l, i) => {
    const where = `درسِ ${i + 1}`;
    if (!l || typeof l !== 'object') { errors.push(`${where}: باید شیء باشد`); return; }
    if (!isStr(l.sourceKey) || !l.sourceKey.trim()) errors.push(`${where}: sourceKey (رشتهٔ یکتا) لازم است`);
    else if (seen.has(l.sourceKey)) errors.push(`${where}: sourceKey تکراری در همین فایل: ${l.sourceKey}`);
    else seen.add(l.sourceKey);
    if (!isStr(l.title) || !l.title.trim()) errors.push(`${where}: title لازم است`);
    if (l.archivedNotes !== undefined && !isStr(l.archivedNotes)) errors.push(`${where}: archivedNotes باید رشته باشد`);
    if (l.summary !== undefined && !isStr(l.summary)) errors.push(`${where}: summary باید رشته باشد`);
    if (l.course !== undefined && !isStr(l.course)) errors.push(`${where}: course باید رشته باشد`);
    if (l.order !== undefined && !Number.isFinite(l.order)) errors.push(`${where}: order باید عدد باشد`);
    if (l.sources !== undefined && !validSources(l.sources)) errors.push(`${where}: sources باید آرایه‌ای از رشته یا شیءِ ساده باشد`);
    const knowledge = {};
    if (l.knowledge !== undefined) {
      if (!l.knowledge || typeof l.knowledge !== 'object' || Array.isArray(l.knowledge)) errors.push(`${where}: knowledge باید شیء باشد`);
      else {
        for (const [cat, items] of Object.entries(l.knowledge)) {
          if (!KNOWLEDGE_CATEGORIES.includes(cat)) { errors.push(`${where}: دستهٔ ناشناختهٔ دانش «${cat}» (مجاز: ${KNOWLEDGE_CATEGORIES.join('، ')})`); continue; }
          if (!Array.isArray(items)) { errors.push(`${where}: knowledge.${cat} باید آرایه باشد`); continue; }
          knowledge[cat] = [];
          items.forEach((it, j) => {
            if (!it || !isStr(it.term) || !it.term.trim() || !isStr(it.definition)) errors.push(`${where}: knowledge.${cat}[${j}] باید term و definition (رشته) داشته باشد`);
            else knowledge[cat].push(it);
          });
        }
      }
    }
    lessons.push({
      sourceKey: isStr(l.sourceKey) ? l.sourceKey : '',
      title: isStr(l.title) ? l.title.trim() : '',
      summary: isStr(l.summary) ? l.summary : '',
      archivedNotes: isStr(l.archivedNotes) ? l.archivedNotes : '',
      course: isStr(l.course) ? l.course.trim() : '',
      order: Number.isFinite(l.order) ? l.order : null,
      sources: validSources(l.sources) ? l.sources : [],
      knowledge,
    });
  });
  if ((file.lessons || []).length > MAX_LESSONS) errors.push(`حداکثر ${MAX_LESSONS} درس در یک فایل`);
  return { ok: errors.length === 0, errors, lessons };
}

/** Preview: what would happen, without changing anything. */
export function planImport(data, file) {
  const v = validateImport(file);
  const existing = data.lessons || [];
  const byKey = new Map();
  for (const l of existing) {
    if (l.sourceKey) byKey.set(l.sourceKey, l);
    for (const k of l.importedSourceKeys || []) byKey.set(k, l);
  }
  const byTitle = new Map(existing.map((l) => [String(l.title).trim(), l]));
  const toAdd = [];
  const already = [];
  const appends = [];   // notes appended to an existing lesson with the same title
  const blocked = [];   // same title, but that lesson's text is not loaded yet
  for (const l of v.lessons) {
    if (byKey.has(l.sourceKey)) { already.push({ sourceKey: l.sourceKey, title: l.title }); continue; }
    const same = byTitle.get(l.title);
    if (same) {
      if (same._bodyPending || same._bodyError) blocked.push({ sourceKey: l.sourceKey, title: l.title, existingId: same.id });
      else appends.push({ ...l, existingId: same.id });
      continue;
    }
    toAdd.push(l);
  }
  const conflicts = blocked; // kept name for callers: what is NOT applied because of a title clash
  // Knowledge: count what is genuinely new (after de-dup against the centre and within the file).
  const kb = data.knowledgeBase || {};
  const known = Object.fromEntries(KNOWLEDGE_CATEGORIES.map((c) => [c, new Set((kb[c] || []).map((i) => normTerm(i.term)))]));
  let knowledgeNew = 0;
  let knowledgeDup = 0;
  for (const l of [...toAdd, ...appends]) {
    for (const [cat, items] of Object.entries(l.knowledge)) {
      for (const it of items) {
        const t = normTerm(it.term);
        if (known[cat].has(t)) knowledgeDup += 1;
        else { known[cat].add(t); knowledgeNew += 1; }
      }
    }
  }
  const chars = [...toAdd, ...appends].reduce((n, l) => n + l.archivedNotes.length, 0);
  return {
    valid: v.ok,
    errors: v.errors,
    total: v.lessons.length,
    toAdd,
    appends,
    already,
    conflicts,
    chars,
    knowledgeNew,
    knowledgeDup,
  };
}

/**
 * Apply a plan: returns a NEW data object. Existing lessons/knowledge objects
 * are kept as they are; only additions. `externalize` marks the new lessons'
 * text for the separate body store (Firestore mode).
 */
export function applyImport(data, plan, { externalize = true, now = Date.now(), bodyKey } = {}) {
  if (!plan.valid) throw new Error('فایل معتبر نیست — اول خطاها را رفع کنید');
  const existingKeys = new Set((data.lessons || []).map((l) => l.sourceKey).filter(Boolean));
  const usedIds = new Set((data.lessons || []).map((l) => l.id));
  let nextId = now;
  const newLessons = [];
  for (const l of plan.toAdd) {
    if (existingKeys.has(l.sourceKey)) continue; // idempotent even on a stale plan
    while (usedIds.has(nextId)) nextId += 1;
    usedIds.add(nextId);
    const lesson = {
      id: nextId,
      title: l.title,
      summary: l.summary || 'خلاصه‌ای ایجاد نشده.',
      files: [],
      archivedNotes: l.archivedNotes,
      sourceKey: l.sourceKey,
      sources: l.sources?.length ? l.sources : undefined,
      course: l.course || undefined,
      order: l.order ?? undefined,
      importedAt: new Date(now).toISOString(),
      progress: { totalItems: 0, learnedItems: 0, quizzesTaken: 0, correctAnswers: 0, chatPracticeCount: 0 },
    };
    if (lesson.course === undefined) delete lesson.course;
    if (lesson.order === undefined) delete lesson.order;
    if (lesson.sources === undefined) delete lesson.sources;
    if (externalize) lesson.bodyRef = { key: bodyKey ? bodyKey(lesson) : `L${nextId}` };
    newLessons.push(lesson);
    existingKeys.add(l.sourceKey);
  }
  // Appends into existing lessons: old text kept as the exact prefix.
  let appended = 0;
  const byId = new Map((data.lessons || []).map((l) => [l.id, l]));
  const replaced = new Map();
  for (const a of plan.appends || []) {
    const cur = replaced.get(a.existingId) || byId.get(a.existingId);
    if (!cur || cur._bodyPending || cur._bodyError) continue;
    if (cur.sourceKey === a.sourceKey || (cur.importedSourceKeys || []).includes(a.sourceKey)) continue; // idempotent
    const next = {
      ...cur,
      importedSourceKeys: [...(cur.importedSourceKeys || []), a.sourceKey],
      sources: [...(cur.sources || []), ...(a.sources || [])],
    };
    if (a.archivedNotes) next.archivedNotes = `${cur.archivedNotes || ''}${appendHeading(a.sourceKey)}${a.archivedNotes}`;
    if (externalize && !next.bodyRef && String(next.archivedNotes || '').length > EXTERNALIZE_CHARS) {
      next.bodyRef = { key: bodyKey ? bodyKey(next) : `L${next.id}` };
    }
    if (!next.sources.length) delete next.sources;
    replaced.set(cur.id, next);
    appended += 1;
  }
  const kb = { ...(data.knowledgeBase || {}) };
  let k = 0;
  for (const cat of KNOWLEDGE_CATEGORIES) {
    const list = [...(kb[cat] || [])];
    const terms = new Set(list.map((i) => normTerm(i.term)));
    for (const l of [...plan.toAdd, ...(plan.appends || [])]) {
      for (const it of l.knowledge[cat] || []) {
        const t = normTerm(it.term);
        if (terms.has(t)) continue;
        terms.add(t);
        k += 1;
        list.push({ ...it, source: it.source || `درس: ${l.title}`, id: now + k / 10000 + Math.random() / 1e6 });
      }
    }
    kb[cat] = list;
  }
  const journal = [{ id: now, date: new Date(now).toISOString(), entry: `ایمپورتِ دسته‌ای: ${newLessons.length} درسِ تازه، جزوه به ${appended} درسِ موجود افزوده شد، ${k} آیتمِ دانش.` }, ...(data.journal || [])];
  const lessons = (data.lessons || []).map((l) => replaced.get(l.id) || l);
  return { data: { ...data, lessons: [...lessons, ...newLessons], knowledgeBase: kb, journal }, added: newLessons.length, appended, knowledgeAdded: k };
}

/** Bytes of the main document as it would be written (UTF-8). */
export function jsonBytes(obj) {
  const s = JSON.stringify(obj);
  return typeof TextEncoder !== 'undefined' ? new TextEncoder().encode(s).length : s.length;
}
