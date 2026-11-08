// Purpose: list helpers for 100+ lessons — natural numeric order («2 - ریتا»
// before «10 - ریتا», Persian/Arabic digits too), the course of a lesson, and a
// diacritic/digit-insensitive search key. Pure, tested.

const DIGIT_MAP = { '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9' };

export function latinDigits(s) {
  return String(s ?? '').replace(/[۰-۹٠-٩]/g, (d) => DIGIT_MAP[d]);
}

/** Search key: Latin digits, no Arabic diacritics/tatweel, ي→ی ك→ک, lower case. */
export function searchKey(s) {
  return latinDigits(s).replace(/[ً-ْٰـ]/g, '').replace(/ي/g, 'ی').replace(/ك/g, 'ک').toLowerCase();
}

const collator = typeof Intl !== 'undefined' ? new Intl.Collator('fa', { numeric: true, sensitivity: 'base' }) : null;

/** Natural compare: digit runs compare as numbers, whatever the script. */
export function naturalCompare(a, b) {
  const x = latinDigits(a);
  const y = latinDigits(b);
  if (collator) return collator.compare(x, y);
  return x.localeCompare(y, undefined, { numeric: true });
}

/** The course of a lesson: explicit `course`, else the part after the last « - ». */
// Same course whatever the keyboard: ي/ی، ك/ک، diacritics, ZWNJ and spaces don't split a course.
const normCourse = (c) => String(c || '').replace(/[\u064B-\u0652\u0640]/g, '').replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/\u200c/g, ' ').replace(/\s+/g, ' ').trim();

// «مسلسل لو - قسمت 9», «Lo - part 9»: the part comes AFTER the dash.
const PART_WORD = /^(قسمت|بخش|جلسه|درس|حلقه|الحلقة|حلقة|part|episode|ep\.?|session|lesson)\s*[\d۰-۹]+/i;

export function courseOf(lesson) {
  if (lesson?.course) return normCourse(lesson.course);
  const t = String(lesson?.title || '');
  const i = t.lastIndexOf(' - ');
  if (i < 0) return '';
  const after = t.slice(i + 3).trim();
  return normCourse(PART_WORD.test(after) ? t.slice(0, i) : after);
}

/** The number written in the title: after «قسمت/part/جلسه…», else at its start («21 - ریتا» ⇒ 21). */
export function titleNumber(lesson) {
  const t = String(lesson?.title || '').replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  const part = t.match(/(?:قسمت|بخش|جلسه|حلقه|الحلقة|حلقة|part|episode|ep\.?|session|lesson)\s*(\d+(?:\.\d+)?)/i);
  if (part) return Number(part[1]);
  const lead = t.match(/^\s*(\d+(?:\.\d+)?)/);
  return lead ? Number(lead[1]) : null;
}

/** Explicit order, else the number in the title. */
export function lessonNumber(lesson) {
  if (Number.isFinite(lesson?.order)) return lesson.order;
  return titleNumber(lesson);
}

/** Sort by course, then explicit order, then natural title. */
export function compareLessons(a, b) {
  const ca = courseOf(a);
  const cb = courseOf(b);
  if (ca !== cb) return naturalCompare(ca, cb);
  const oa = lessonNumber(a);
  const ob = lessonNumber(b);
  if (oa !== null && ob !== null && oa !== ob) return oa - ob;
  return naturalCompare(a.title, b.title);
}

export function courseList(lessons) {
  return Array.from(new Set((lessons || []).map(courseOf).filter(Boolean))).sort(naturalCompare);
}

// Normalised search text per lesson object, memoised (lesson objects are
// immutable in state, so a WeakMap is exact): typing in the search box no
// longer re-normalises millions of characters per keystroke.
const searchMemo = new WeakMap();
export function lessonSearchText(lesson) {
  if (!lesson || typeof lesson !== 'object') return '';
  let v = searchMemo.get(lesson);
  if (v === undefined) {
    v = searchKey(`${lesson.title || ''}\n${lesson.summary || ''}\n${lesson.archivedNotes || ''}`);
    searchMemo.set(lesson, v);
  }
  return v;
}

/** Missing numbers in a course (1..max) — e.g. a series part that was never imported. */
export function courseGaps(lessons, course) {
  // The number the owner SEES (title first: «قسمت 9»), not an import order index.
  const nums = new Set((lessons || []).filter((l) => courseOf(l) === course).map((l) => titleNumber(l) ?? lessonNumber(l)).filter((n) => Number.isInteger(n) && n > 0));
  if (nums.size < 3) return [];
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  // Only inside the present range, and not when most numbers are missing (not a numbered series).
  if (max - min + 1 > nums.size * 2) return [];
  const gaps = [];
  for (let n = min; n <= max; n += 1) if (!nums.has(n)) gaps.push(n);
  return gaps;
}
