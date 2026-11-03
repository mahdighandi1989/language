// Purpose: «رفتن به همان‌جا» — the board asks the page layer to bring a sheet's
// box into view and flash it after navigation. One sessionStorage key, read once.
const KEY = 'inspection-focus-sheet';
export function requestFocus(sheetId) {
  try { sessionStorage.setItem(KEY, String(sheetId)); } catch { /* private mode */ }
}
export function takeFocus() {
  try {
    const v = sessionStorage.getItem(KEY);
    if (v) sessionStorage.removeItem(KEY);
    return v;
  } catch {
    return null;
  }
}
