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

export function courseOf(lesson) {
  if (lesson?.course) return normCourse(lesson.course);
  const t = String(lesson?.title || '');
  const i = t.lastIndexOf(' - ');
  return i >= 0 ? normCourse(t.slice(i + 3)) : '';
}

/** Explicit order, else the leading number of the title («21 - ریتا» ⇒ 21). */
export function lessonNumber(lesson) {
  if (Number.isFinite(lesson?.order)) return lesson.order;
  const m = String(lesson?.title || '').replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).match(/^\s*(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : null;
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
  const nums = new Set((lessons || []).filter((l) => courseOf(l) === course).map(lessonNumber).filter((n) => Number.isInteger(n) && n > 0));
  if (nums.size < 3) return [];
  const max = Math.max(...nums);
  const gaps = [];
  for (let n = 1; n <= max; n += 1) if (!nums.has(n)) gaps.push(n);
  return gaps;
}
