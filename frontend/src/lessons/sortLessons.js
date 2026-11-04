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
export function courseOf(lesson) {
  if (lesson?.course) return String(lesson.course).trim();
  const t = String(lesson?.title || '');
  const i = t.lastIndexOf(' - ');
  return i >= 0 ? t.slice(i + 3).trim() : '';
}

/** Sort by course, then explicit order, then natural title. */
export function compareLessons(a, b) {
  const ca = courseOf(a);
  const cb = courseOf(b);
  if (ca !== cb) return naturalCompare(ca, cb);
  const oa = Number.isFinite(a.order) ? a.order : null;
  const ob = Number.isFinite(b.order) ? b.order : null;
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
