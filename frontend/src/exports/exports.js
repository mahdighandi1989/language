// Purpose: lesson / course exports — print-to-PDF (browser print with Arabic
// fonts), Word (.doc = HTML that Word opens, RTL kept), Anki CSV and JSON.
// The lesson text is exported EXACTLY (markdown rendered, never rewritten);
// corrections are a separate section. Pure builders + a tiny download helper.
// Upstream: lessons/markdown.jsx, lessons/sortLessons.js (courseOf).
// Downstream: ExportMenu.jsx (lesson page, lesson list).
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MarkdownRenderer } from '../lessons/markdown.jsx';
import { courseOf, compareLessons } from '../lessons/sortLessons.js';

const FONTS = 'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700&family=Noto+Naskh+Arabic:wght@400;700&display=swap';
const CSS = `
  body { font-family: 'Vazirmatn', 'Noto Naskh Arabic', Tahoma, sans-serif; direction: rtl; line-height: 1.9; color: #111; margin: 24px; }
  h1 { font-size: 22pt; border-bottom: 2px solid #14b8a6; padding-bottom: 6px; }
  h2 { font-size: 16pt; margin-top: 18px; } h3 { font-size: 13pt; }
  table { border-collapse: collapse; width: 100%; margin: 10px 0; page-break-inside: auto; }
  tr { page-break-inside: avoid; }
  th, td { border: 1px solid #999; padding: 4px 8px; text-align: start; vertical-align: top; line-height: 2; }
  th { background: #f1f5f9; }
  [dir="auto"] { unicode-bidi: plaintext; }
  :lang(ar), .ar { font-family: 'Noto Naskh Arabic', 'Vazirmatn', serif; font-size: 1.1em; }
  .lesson { page-break-after: always; } .lesson:last-child { page-break-after: auto; }
  .meta { color: #555; font-size: 10pt; }
  .corr { background: #fff7ed; border: 1px solid #fdba74; padding: 8px; margin-top: 12px; }
  pre { white-space: pre-wrap; }
  @page { margin: 16mm; }
`;

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function lessonHtml(lesson) {
  const body = renderToStaticMarkup(React.createElement(MarkdownRenderer, { text: String(lesson.archivedNotes || '') }));
  const corr = (lesson.corrections || []).filter((c) => c && (c.quote || c.issue));
  const corrHtml = corr.length ? `<div class="corr"><h3>اصلاحات و هشدارهای اعراب/معنا (متنِ اصلی تغییر نکرده)</h3><ul>${corr.map((c) => `<li><b dir="auto">${esc(c.quote)}</b> — ${esc(c.kind)}: ${esc(c.issue)}${c.suggestion ? ` ⟵ پیشنهاد: <span dir="auto">${esc(c.suggestion)}</span>` : ''}</li>`).join('')}</ul></div>` : '';
  return `<section class="lesson"><h1 dir="auto">${esc(lesson.title)}</h1>${lesson.summary ? `<p class="meta" dir="auto">${esc(lesson.summary)}</p>` : ''}${body}${corrHtml}</section>`;
}

export function documentHtml(title, lessons, { forWord = false } = {}) {
  const head = forWord
    ? `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" lang="fa" dir="rtl"><head><meta charset="utf-8"><title>${esc(title)}</title><style>${CSS} body{font-family:'B Nazanin','Traditional Arabic','Vazirmatn',Tahoma,sans-serif;}</style></head>`
    : `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>${esc(title)}</title><link rel="stylesheet" href="${FONTS}"><style>${CSS}</style></head>`;
  return `${head}<body dir="rtl">${lessons.map(lessonHtml).join('\n')}</body></html>`;
}

/** Knowledge items that belong to a lesson (source «درس: <title>» or lessonId). */
export function knowledgeOfLesson(knowledgeBase = {}, lesson) {
  const out = [];
  for (const [category, items] of Object.entries(knowledgeBase || {})) {
    if (!Array.isArray(items)) continue;
    for (const it of items) {
      if (!it?.term) continue;
      const mine = (it.lessonId != null && String(it.lessonId) === String(lesson.id)) || String(it.source || '').includes(String(lesson.title || '\u0000'));
      if (mine) out.push({ ...it, category });
    }
  }
  return out;
}

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""').replace(/\r?\n/g, '<br>')}"`;

/** Anki-importable CSV: Front;Back;Tags (UTF-8 with BOM, «;» separator). */
export function ankiCsv(items, deckTag = '') {
  const tag = (s) => String(s || '').trim().replace(/\s+/g, '_');
  const rows = items.filter((i) => i?.term && i?.definition).map((i) => [i.term, i.definition, [tag(deckTag), tag(i.category)].filter(Boolean).join(' ')].map(csvCell).join(';'));
  return `﻿#separator:Semicolon\n#html:true\n#columns:Front;Back;Tags\n${rows.join('\n')}\n`;
}

export function lessonsOfCourse(lessons, course) {
  return (lessons || []).filter((l) => courseOf(l) === course).sort(compareLessons);
}

export function safeFileName(s) {
  return String(s || 'export').replace(/[\\/:*?"<>|]+/g, '_').replace(/\s+/g, ' ').trim().slice(0, 80) || 'export';
}

export function download(name, content, type) {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/** Open a print window (the user picks «Save as PDF»). Returns false if a popup blocker stopped it. */
export function printHtml(html) {
  const w = window.open('', '_blank');
  if (!w) return false;
  w.document.open(); w.document.write(html); w.document.close();
  const go = () => { try { w.focus(); w.print(); } catch { /* ignore */ } };
  // Wait for the web fonts, or the Arabic prints in a fallback face.
  if (w.document.fonts?.ready) w.document.fonts.ready.then(() => setTimeout(go, 200)); else setTimeout(go, 800);
  return true;
}

/** Everything for one lesson or a course, by format. */
export function exportLessons(format, { title, lessons, knowledgeBase }) {
  const name = safeFileName(title);
  const items = lessons.flatMap((l) => knowledgeOfLesson(knowledgeBase, l));
  switch (format) {
    case 'pdf': return printHtml(documentHtml(title, lessons));
    case 'word': download(`${name}.doc`, `﻿${documentHtml(title, lessons, { forWord: true })}`, 'application/msword'); return true;
    case 'anki': download(`${name}-anki.csv`, ankiCsv(items, title), 'text/csv;charset=utf-8'); return items.length;
    case 'json': download(`${name}.json`, JSON.stringify({ exportedAt: new Date().toISOString(), title, lessons, knowledge: items }, null, 2), 'application/json'); return true;
    default: return false;
  }
}
