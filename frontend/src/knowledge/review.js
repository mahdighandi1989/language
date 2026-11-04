// Purpose: quality review of the knowledge center at scale (1000+ items):
// duplicates (Arabic normalised: no harakat/tatweel, unified alef/ya/ta-marbuta),
// quality flags, category suggestions — and a reversible merge. Nothing is
// changed without an explicit action; every merge is logged in data.kbMergeLog
// with the removed items so it can be undone.
import { isArabicText } from '../shadowing/shadowing.js';

export function normalizeArabic(s) {
  return String(s || '')
    .replace(/[ً-ٰٟـ]/g, '') // harakat, dagger alef, tatweel
    .replace(/[إأآٱ]/g, 'ا').replace(/ى/g, 'ي').replace(/ی/g, 'ي').replace(/ک/g, 'ك').replace(/ة/g, 'ه')
    .replace(/[؟?!.,،؛:«»"'()\-–—]/g, ' ')
    .replace(/\s+/g, ' ').trim().toLowerCase();
}

const itemRef = (category, item, index) => ({ category, id: item.id ?? null, term: item.term, index });

/** Groups of 2+ items whose normalised term is the same (across all tabs). */
export function findDuplicates(kb = {}) {
  const groups = new Map();
  for (const [category, items] of Object.entries(kb)) {
    if (!Array.isArray(items)) continue;
    items.forEach((it, index) => {
      const k = normalizeArabic(it?.term);
      if (!k) return;
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push({ ...itemRef(category, it, index), item: it });
    });
  }
  return [...groups.entries()].filter(([, g]) => g.length > 1).map(([key, members]) => ({ key, members }));
}

const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;

/** Quality flags per item: [{category, item, index, flags:[{code,label}], suggest?}] */
export function qualityIssues(kb = {}) {
  const out = [];
  for (const [category, items] of Object.entries(kb)) {
    if (!Array.isArray(items)) continue;
    items.forEach((it, index) => {
      const flags = [];
      let suggest = null;
      const term = String(it?.term || '').trim();
      const def = String(it?.definition || '').trim();
      if (!term) flags.push({ code: 'no-term', label: 'بی‌عبارت' });
      if (!def) flags.push({ code: 'no-def', label: 'بی‌معنی' });
      if (term && !isArabicText(term) && category !== 'grammar') flags.push({ code: 'term-not-arabic', label: 'عبارت عربی به نظر نمی‌رسد' });
      if (def && isArabicText(def) && !/[پچژگکی]/.test(def)) flags.push({ code: 'def-not-persian', label: 'معنی فارسی به نظر نمی‌رسد' });
      if (term.length > 120 || def.length > 600) flags.push({ code: 'too-long', label: 'بیش از حد بلند' });
      if (term && def && normalizeArabic(term) === normalizeArabic(def)) flags.push({ code: 'same', label: 'معنی همان عبارت است' });
      if (category === 'vocabulary' && words(term) >= 3) suggest = 'phrases';
      if (category === 'phrases' && words(term) === 1 && isArabicText(term)) suggest = 'vocabulary';
      if (flags.length || suggest) out.push({ category, item: it, index, flags, suggest });
    });
  }
  return out;
}

/**
 * Merge a duplicate group into its first member: definitions and sources are
 * joined (distinct), lessonIds kept; the others are removed from their tabs.
 * Returns { kb, log } — log holds the removed items for undo.
 */
export function mergeGroup(kb, group, at = new Date().toISOString()) {
  const [keep, ...rest] = group.members;
  const next = { ...kb };
  const distinct = (arr) => [...new Set(arr.map((s) => String(s || '').trim()).filter(Boolean))];
  const all = group.members.map((m) => m.item);
  const merged = {
    ...keep.item,
    definition: distinct(all.map((i) => i.definition)).join(' / '),
    source: distinct(all.map((i) => i.source)).join(' ، '),
    ...(all.some((i) => i.lessonId != null) ? { lessonIds: distinct(all.flatMap((i) => [i.lessonId, ...(i.lessonIds || [])]).filter((x) => x != null)) } : {}),
    mergedAt: at,
  };
  const same = (a, m) => (m.id != null ? a?.id === m.id : a?.term === m.term);
  next[keep.category] = (next[keep.category] || []).map((a) => (same(a, keep) ? merged : a));
  for (const m of rest) {
    let removed = false;
    next[m.category] = (next[m.category] || []).filter((a) => {
      if (!removed && same(a, m) && a !== merged) { removed = true; return false; }
      return true;
    });
  }
  return { kb: next, log: { at, kept: { category: keep.category, before: keep.item }, removed: rest.map((m) => ({ category: m.category, item: m.item })) } };
}

/** Undo one merge log entry: restore the kept item and re-add the removed ones. */
export function undoMerge(kb, log) {
  const next = { ...kb };
  const k = log.kept;
  next[k.category] = (next[k.category] || []).map((a) => ((k.before.id != null ? a.id === k.before.id : a.term === k.before.term) && a.mergedAt ? k.before : a));
  for (const r of log.removed) next[r.category] = [...(next[r.category] || []), r.item];
  return next;
}

export function moveItem(kb, from, item, to) {
  if (from === to) return kb;
  const list = kb[from] || [];
  const i = list.indexOf(item);
  if (i < 0) return kb;
  return { ...kb, [from]: list.filter((_, j) => j !== i), [to]: [...(kb[to] || []), item] };
}
