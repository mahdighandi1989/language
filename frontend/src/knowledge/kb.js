// Purpose: pure edits of the knowledge center (data.knowledgeBase: {category:
// [{id, term, definition, source}]}) and its tabs (labels/custom tabs in
// data.kbCategories). Nothing is deleted implicitly: a tab can be removed only
// when it is empty; items are removed only by an explicit, confirmed delete.
// Upstream: KnowledgeCenter.jsx. Downstream: data saved by App.jsx as usual.

export const DEFAULT_CATEGORIES = { vocabulary: 'لغات', grammar: 'گرامر', phrases: 'اصطلاحات', verbs: 'افعال', pronouns: 'ضمایر', adjectives: 'صفات' };

/** Ordered [{key, label, custom, hidden}] — defaults, then custom tabs, then any unknown keys found in the data. */
export function categoryList(knowledgeBase = {}, meta = {}) {
  const labels = meta.labels || {};
  const hidden = new Set(meta.hidden || []);
  const keys = [...Object.keys(DEFAULT_CATEGORIES), ...(meta.custom || []), ...Object.keys(knowledgeBase || {})];
  const seen = new Set();
  const out = [];
  for (const key of keys) {
    if (seen.has(key) || !Array.isArray(knowledgeBase?.[key] ?? [])) continue;
    seen.add(key);
    out.push({ key, label: labels[key] || DEFAULT_CATEGORIES[key] || key, custom: !(key in DEFAULT_CATEGORIES), hidden: hidden.has(key) });
  }
  return out;
}

const sameItem = (a, ref) => (ref.id != null && a.id != null ? a.id === ref.id : String(a.term) === String(ref.term));

export function updateItem(kb, category, ref, patch, newCategory = category) {
  const next = { ...kb };
  const list = [...(next[category] || [])];
  const i = list.findIndex((a) => sameItem(a, ref));
  if (i < 0) return kb;
  const updated = { ...list[i], ...patch, editedAt: new Date().toISOString() };
  if (newCategory === category) {
    list[i] = updated;
    next[category] = list;
  } else {
    list.splice(i, 1);
    next[category] = list;
    next[newCategory] = [...(next[newCategory] || []), updated];
  }
  return next;
}

export function deleteItem(kb, category, ref) {
  const list = kb[category] || [];
  const filtered = list.filter((a) => !sameItem(a, ref));
  return filtered.length === list.length ? kb : { ...kb, [category]: filtered };
}

export function addCategory(kb, meta = {}, label) {
  const clean = String(label || '').trim();
  if (!clean) return { kb, meta, key: null };
  const key = `custom_${Date.now().toString(36)}`;
  return { kb: { ...kb, [key]: [] }, meta: { ...meta, custom: [...(meta.custom || []), key], labels: { ...(meta.labels || {}), [key]: clean } }, key };
}

export function renameCategory(meta = {}, key, label) {
  const clean = String(label || '').trim();
  if (!clean) return meta;
  return { ...meta, labels: { ...(meta.labels || {}), [key]: clean } };
}

/** Remove a tab — refused (returns null) while it still holds items. Default tabs are hidden, not removed. */
export function removeCategory(kb, meta = {}, key) {
  if ((kb[key] || []).length > 0) return null;
  if (key in DEFAULT_CATEGORIES) return { kb, meta: { ...meta, hidden: [...new Set([...(meta.hidden || []), key])] } };
  const { [key]: _gone, ...rest } = kb;
  const labels = { ...(meta.labels || {}) };
  delete labels[key];
  return { kb: rest, meta: { ...meta, labels, custom: (meta.custom || []).filter((k) => k !== key) } };
}

export function showCategory(meta = {}, key) {
  return { ...meta, hidden: (meta.hidden || []).filter((k) => k !== key) };
}

export function matches(item, q) {
  if (!q) return true;
  const s = q.toLowerCase();
  return [item?.term, item?.definition, item?.source].some((v) => String(v || '').toLowerCase().includes(s));
}
