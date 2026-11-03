// Purpose: render lesson notes (markdown) safely — React elements only, never
// innerHTML. Supports headings, paragraphs, lists (*, -, 1.), GFM tables
// (| a | b | + |---|), fenced code, blockquotes, **bold**, *italic*, ~~del~~,
// `code`, and section breaks on a line that is only «---» (the previous
// renderer split on ANY «---», which tore tables apart). Every block gets
// dir="auto" so Arabic, Persian and Latin lines each read in their own
// direction. Upstream: none. Downstream: components/App.jsx (MarkdownRenderer).
import React from 'react';

const HR = /^\s*-{3,}\s*$/;
const TABLE_SEP = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;

/** Inline markup → React nodes. */
export function inline(text, keyPrefix = 'i') {
  const out = [];
  const re = /(`[^`]+`|\*\*[^*]+\*\*|~~[^~]+~~|\*[^*\s][^*]*\*)/g;
  let last = 0;
  let m;
  let k = 0;
  const s = String(text ?? '');
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(s.slice(last, m.index));
    const tok = m[0];
    const key = `${keyPrefix}-${k += 1}`;
    if (tok.startsWith('`')) out.push(<code key={key} className="px-1 rounded bg-slate-100 text-[0.95em]">{tok.slice(1, -1)}</code>);
    else if (tok.startsWith('**')) out.push(<strong key={key}>{tok.slice(2, -2)}</strong>);
    else if (tok.startsWith('~~')) out.push(<del key={key} className="text-red-500">{tok.slice(2, -2)}</del>);
    else out.push(<em key={key}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
}

function splitRow(line) {
  let t = line.trim();
  if (t.startsWith('|')) t = t.slice(1);
  if (t.endsWith('|') && !t.endsWith('\\|')) t = t.slice(0, -1);
  return t.split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, '|'));
}

/** Parse markdown into sections of blocks (pure; exported for tests). */
export function parseMarkdown(text) {
  const lines = String(text ?? '').replace(/\r\n?/g, '\n').split('\n');
  const sections = [[]];
  let i = 0;
  const push = (b) => sections[sections.length - 1].push(b);
  while (i < lines.length) {
    const line = lines[i];
    if (/^\s*```/.test(line)) {
      const body = [];
      i += 1;
      while (i < lines.length && !/^\s*```/.test(lines[i])) { body.push(lines[i]); i += 1; }
      push({ type: 'code', text: body.join('\n') });
      i += 1;
      continue;
    }
    if (line.includes('|') && i + 1 < lines.length && TABLE_SEP.test(lines[i + 1])) {
      const header = splitRow(line);
      const rows = [];
      i += 2;
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) { rows.push(splitRow(lines[i])); i += 1; }
      push({ type: 'table', header, rows });
      continue;
    }
    if (HR.test(line)) { sections.push([]); i += 1; continue; }
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) { push({ type: 'heading', level: h[1].length, text: h[2] }); i += 1; continue; }
    if (/^\s*>\s?/.test(line)) {
      const body = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) { body.push(lines[i].replace(/^\s*>\s?/, '')); i += 1; }
      push({ type: 'quote', text: body.join('\n') });
      continue;
    }
    if (/^\s*([*-]|\d+[.)])\s+/.test(line)) {
      const ordered = /^\s*\d+[.)]\s+/.test(line);
      const items = [];
      const same = ordered ? /^\s*\d+[.)]\s+/ : /^\s*[*-]\s+/;
      while (i < lines.length && same.test(lines[i])) { items.push(lines[i].replace(/^\s*([*-]|\d+[.)])\s+/, '')); i += 1; }
      push({ type: 'list', ordered, items });
      continue;
    }
    if (!line.trim()) { i += 1; continue; }
    push({ type: 'p', text: line });
    i += 1;
  }
  return sections.filter((s, idx) => s.length || idx === 0);
}

function Block({ b, k }) {
  switch (b.type) {
    case 'heading': {
      const cls = { 1: 'font-bold text-2xl', 2: 'font-bold text-xl', 3: 'font-bold text-lg' }[b.level] || 'font-bold';
      const Tag = `h${b.level}`;
      return <Tag dir="auto" className={cls}>{inline(b.text, k)}</Tag>;
    }
    case 'list': {
      const Tag = b.ordered ? 'ol' : 'ul';
      return <Tag dir="auto" className={`${b.ordered ? 'list-decimal' : 'list-disc'} ps-6 my-2`}>{b.items.map((it, j) => <li key={j} className="mr-4" dir="auto">{inline(it, `${k}-${j}`)}</li>)}</Tag>;
    }
    case 'table':
      return (
        <div className="overflow-x-auto my-3">
          <table className="min-w-full border border-slate-300 text-sm">
            <thead className="bg-slate-100"><tr>{b.header.map((c, j) => <th key={j} dir="auto" className="border border-slate-300 px-2 py-1 text-start">{inline(c, `${k}-h${j}`)}</th>)}</tr></thead>
            <tbody>{b.rows.map((r, ri) => <tr key={ri}>{b.header.map((_, ci) => <td key={ci} dir="auto" className="border border-slate-300 px-2 py-1 align-top">{inline(r[ci] ?? '', `${k}-${ri}-${ci}`)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      );
    case 'code':
      return <pre dir="ltr" className="bg-slate-900 text-slate-100 rounded-lg p-3 overflow-x-auto text-sm"><code>{b.text}</code></pre>;
    case 'quote':
      return <blockquote dir="auto" className="border-s-4 border-teal-400 ps-3 text-slate-600 whitespace-pre-wrap">{inline(b.text, k)}</blockquote>;
    default:
      return <p dir="auto">{inline(b.text, k)}</p>;
  }
}

export function MarkdownRenderer({ text }) {
  const sections = parseMarkdown(text);
  return (
    <div className="prose max-w-none prose-p:my-2 prose-headings:my-3 prose-ul:my-2">
      {sections.map((sec, si) => (
        <div key={si} className="mb-4 border-b border-slate-200 pb-2 last:border-b-0">
          {sec.map((b, bi) => <Block key={bi} b={b} k={`${si}-${bi}`} />)}
        </div>
      ))}
    </div>
  );
}

export default MarkdownRenderer;
