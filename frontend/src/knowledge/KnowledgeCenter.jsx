// Purpose: «مرکز دانش» with editing — tabs (add / rename / remove-when-empty /
// hide default) and items (edit term, meaning, source, move to another tab,
// delete with confirmation). Pure logic: ./kb.js. Upstream: Dashboard in
// components/App.jsx passes knowledgeBase + setData + setModalConfig.
import React, { useMemo, useState } from 'react';
import { Search, Pencil, Trash2, Plus, Check, X, Eye } from 'lucide-react';
import KbTools from './KbTools.jsx';
import { categoryList, updateItem, deleteItem, addCategory, renameCategory, removeCategory, showCategory, matches } from './kb.js';

export default function KnowledgeCenter({ knowledgeBase = {}, kbCategories = {}, setData, setModalConfig, addJournalEntry, data }) {
  const [mode, setMode] = useState('list');
  const [activeTab, setActiveTab] = useState('vocabulary');
  const [searchTerm, setSearchTerm] = useState('');
  const [editing, setEditing] = useState(null); // {ref, term, definition, source, category}
  const [manage, setManage] = useState(false);
  const [newTab, setNewTab] = useState('');
  const [renaming, setRenaming] = useState(null); // {key, label}
  const editable = typeof setData === 'function';

  const cats = useMemo(() => categoryList(knowledgeBase, kbCategories), [knowledgeBase, kbCategories]);
  const visible = cats.filter((c) => !c.hidden);
  const current = visible.find((c) => c.key === activeTab) || visible[0];
  const items = ((current && knowledgeBase[current.key]) || []).filter((it) => it && matches(it, searchTerm));

  const save = (fn) => setData((prev) => {
    const out = fn(prev.knowledgeBase || {}, prev.kbCategories || {});
    return out ? { ...prev, knowledgeBase: out.kb ?? prev.knowledgeBase, kbCategories: out.meta ?? prev.kbCategories } : prev;
  });

  const startEdit = (it) => setEditing({ ref: { id: it.id, term: it.term }, term: it.term || '', definition: it.definition || '', source: it.source || '', category: current.key });
  const commitEdit = () => {
    if (!editing.term.trim()) return;
    save((kb) => ({ kb: updateItem(kb, current.key, editing.ref, { term: editing.term.trim(), definition: editing.definition.trim(), source: editing.source }, editing.category) }));
    addJournalEntry?.(`مورد «${editing.term.trim()}» در مرکز دانش ویرایش شد.`);
    setEditing(null);
  };
  const askDelete = (it) => setModalConfig?.({
    title: 'حذفِ مورد',
    message: `«${it.term}» از مرکز دانش حذف شود؟`,
    buttons: [
      { label: 'انصراف', onClick: () => setModalConfig(null), className: 'bg-slate-200' },
      { label: 'حذف', className: 'bg-red-600 text-white', onClick: () => { save((kb) => ({ kb: deleteItem(kb, current.key, it) })); addJournalEntry?.(`مورد «${it.term}» از مرکز دانش حذف شد.`); setModalConfig(null); } },
    ],
  });
  const tryRemoveTab = (c) => {
    if ((knowledgeBase[c.key] || []).length > 0) {
      setModalConfig?.({ title: 'تب خالی نیست', message: `«${c.label}» ${knowledgeBase[c.key].length} مورد دارد؛ اول موردها را به تبِ دیگری منتقل یا حذف کنید.` });
      return;
    }
    save((kb, meta) => removeCategory(kb, meta, c.key));
  };

  const modes = [['list', '📋 فهرست'], ['review', '🩺 بازبینی'], ['cards', '🃏 فلش‌کارت'], ['quiz', '❓ آزمونِ سریع']];
  const modeBar = editable && (
    <div className="flex gap-1 mb-3 flex-wrap" role="tablist">
      {modes.map(([k, l]) => <button key={k} role="tab" aria-selected={mode === k} onClick={() => setMode(k)} className={`px-3 py-1 rounded-full text-sm ${mode === k ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{l}</button>)}
    </div>
  );
  if (mode !== 'list') {
    return <div dir="rtl">{modeBar}<KbTools mode={mode} knowledgeBase={knowledgeBase} kbCategories={kbCategories} data={data} setData={setData} addJournalEntry={addJournalEntry} /></div>;
  }

  return (
    <div dir="rtl">
      {modeBar}
      <div className="flex items-center border-b mb-4 gap-1">
        <div className="flex overflow-x-auto flex-1">
          {visible.map((c) => (
            <button key={c.key} onClick={() => { setActiveTab(c.key); setEditing(null); }} className={`px-4 py-2 font-bold whitespace-nowrap ${current?.key === c.key ? 'border-b-2 border-teal-500 text-teal-600' : 'text-slate-500'}`}>
              {c.label} <span className="text-xs font-normal text-slate-400">{(knowledgeBase[c.key] || []).length}</span>
            </button>
          ))}
        </div>
        {editable && <button onClick={() => setManage((v) => !v)} title="مدیریتِ تب‌ها" aria-label="مدیریتِ تب‌ها" className={`p-2 rounded-lg ${manage ? 'bg-teal-100 text-teal-700' : 'text-slate-500 hover:bg-slate-100'}`}><Pencil size={16} /></button>}
      </div>

      {manage && editable && (
        <div className="mb-4 p-3 bg-slate-50 border rounded-lg space-y-2 text-sm">
          {cats.map((c) => (
            <div key={c.key} className="flex items-center gap-2">
              {renaming?.key === c.key ? (
                <>
                  <input value={renaming.label} onChange={(e) => setRenaming({ ...renaming, label: e.target.value })} className="flex-1 p-1 border rounded" autoFocus />
                  <button aria-label="ذخیرهٔ نام" onClick={() => { save((kb, meta) => ({ meta: renameCategory(meta, c.key, renaming.label) })); setRenaming(null); }} className="p-1 text-teal-600"><Check size={16} /></button>
                  <button aria-label="انصراف" onClick={() => setRenaming(null)} className="p-1 text-slate-500"><X size={16} /></button>
                </>
              ) : (
                <>
                  <span className={`flex-1 ${c.hidden ? 'text-slate-400 line-through' : ''}`}>{c.label} ({(knowledgeBase[c.key] || []).length})</span>
                  <button aria-label={`تغییرِ نامِ ${c.label}`} onClick={() => setRenaming({ key: c.key, label: c.label })} className="p-1 text-slate-600 hover:text-teal-600"><Pencil size={14} /></button>
                  {c.hidden
                    ? <button aria-label={`نمایشِ ${c.label}`} onClick={() => save((kb, meta) => ({ meta: showCategory(meta, c.key) }))} className="p-1 text-slate-600"><Eye size={14} /></button>
                    : <button aria-label={`حذفِ تبِ ${c.label}`} onClick={() => tryRemoveTab(c)} className="p-1 text-red-500 hover:text-red-700"><Trash2 size={14} /></button>}
                </>
              )}
            </div>
          ))}
          <div className="flex gap-2 pt-2 border-t">
            <input value={newTab} onChange={(e) => setNewTab(e.target.value)} placeholder="نامِ تبِ تازه" className="flex-1 p-1 border rounded" />
            <button onClick={() => { let key = null; save((kb, meta) => { const r = addCategory(kb, meta, newTab); key = r.key; return r; }); setNewTab(''); setTimeout(() => key && setActiveTab(key), 0); }} disabled={!newTab.trim()} className="px-3 py-1 bg-teal-500 text-white rounded disabled:opacity-50 flex items-center gap-1"><Plus size={14} /> افزودن</button>
          </div>
        </div>
      )}

      <div className="relative mb-4">
        <input type="text" placeholder={`جستجو در ${current?.label || ''}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 pl-10 border rounded-lg" />
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      </div>
      <div className="max-h-96 overflow-y-auto pl-2">
        {items.length === 0 ? <p className="text-center text-slate-500 py-4">موردی یافت نشد.</p> : (
          <ul className="space-y-3">
            {items.map((item, index) => (
              <li key={`${item.id ?? item.term}-${index}`} className="p-3 bg-slate-100 rounded-lg">
                {editing && editing.ref.id === item.id && editing.ref.term === item.term ? (
                  <div className="space-y-2 text-sm">
                    <input aria-label="کلمه" value={editing.term} onChange={(e) => setEditing({ ...editing, term: e.target.value })} className="w-full p-2 border rounded" dir="auto" />
                    <textarea aria-label="معنی" value={editing.definition} onChange={(e) => setEditing({ ...editing, definition: e.target.value })} className="w-full p-2 border rounded" rows={2} />
                    <input aria-label="منبع" value={editing.source} onChange={(e) => setEditing({ ...editing, source: e.target.value })} className="w-full p-2 border rounded" placeholder="منبع" />
                    <select aria-label="تب" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="w-full p-2 border rounded">
                      {cats.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                    </select>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditing(null)} className="px-3 py-1 bg-slate-200 rounded">انصراف</button>
                      <button onClick={commitEdit} disabled={!editing.term.trim()} className="px-3 py-1 bg-teal-500 text-white rounded disabled:opacity-50">ذخیره</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold break-words" dir="auto">{item.term}</p>
                      <p className="text-sm text-slate-600 break-words">{item.definition}</p>
                      {item.source && <p className="text-xs text-teal-600 mt-1">منبع: {item.source}</p>}
                    </div>
                    {editable && (
                      <div className="flex gap-1 shrink-0">
                        <button aria-label={`ویرایشِ ${item.term}`} onClick={() => startEdit(item)} className="p-1 text-slate-500 hover:text-teal-600"><Pencil size={15} /></button>
                        <button aria-label={`حذفِ ${item.term}`} onClick={() => askDelete(item)} className="p-1 text-slate-500 hover:text-red-600"><Trash2 size={15} /></button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
