// Access-control helpers shared by the auth gate, the sidebar and the admin
// panel. The model is intentionally simple and enforced in two layers:
//   1. Firestore Security Rules (the real security boundary) — see
//      firestore.rules at the repo root.
//   2. This client-side gating (UX): hide what the user may not use.
//
// Admin identity is bootstrapped from the build-time env var VITE_ADMIN_EMAILS
// (comma-separated, not a secret — it only names who the owner is). The same
// address(es) must be listed in firestore.rules so the admin can bootstrap
// their own record.

// Parsed, lower-cased admin allow-list from the build environment.
export const ADMIN_EMAILS = String(import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdminEmail(email) {
  return Boolean(email) && ADMIN_EMAILS.includes(String(email).toLowerCase());
}

// The gate-able areas of the app. `key` matches the activeView/route name so
// permission checks and navigation share one vocabulary.
export const PERMISSION_SECTIONS = [
  { key: 'dashboard', label: 'داشبورد' },
  { key: 'lessons', label: 'لیست دروس' },
  { key: 'quiz', label: 'مرکز آزمون' },
  { key: 'planner', label: 'مرکز پیشرفت' },
  { key: 'cultural', label: 'فرهنگ لبنان' },
  { key: 'journal', label: 'ژورنال فعالیت‌ها' },
  { key: 'archivedConversations', label: 'مکالمات بایگانی شده' },
  { key: 'assistant', label: 'استاد هوش مصنوعی (چت)' },
  { key: 'settings', label: 'تنظیمات' },
];

export const PERMISSION_KEYS = PERMISSION_SECTIONS.map((s) => s.key);

// All sections off — the default for a newly approved user (the owner grants
// access section by section).
export function emptyPermissions() {
  return PERMISSION_KEYS.reduce((acc, k) => ({ ...acc, [k]: false }), {});
}

// All sections on — used for the admin/owner.
export function fullPermissions() {
  return PERMISSION_KEYS.reduce((acc, k) => ({ ...acc, [k]: true }), {});
}

// Normalize a possibly-partial permissions map from Firestore into a complete
// boolean map so the UI never reads `undefined`.
export function normalizePermissions(perms) {
  const base = emptyPermissions();
  if (perms && typeof perms === 'object') {
    for (const k of PERMISSION_KEYS) base[k] = Boolean(perms[k]);
  }
  return base;
}

// Does an access record (its status + permissions) allow a given view?
// Admins can see everything; approved users only their granted sections.
export function canAccess(record, viewKey) {
  if (!record) return false;
  if (record.role === 'admin') return true;
  if (record.status !== 'approved') return false;
  // `lesson` (detail) rides on the `lessons` permission.
  const key = viewKey === 'lesson' ? 'lessons' : viewKey;
  if (key === 'admin') return false; // admin-only area
  return Boolean(normalizePermissions(record.permissions)[key]);
}
