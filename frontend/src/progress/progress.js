// Purpose: real progress numbers for «مرکزِ پیشرفت» — per course, knowledge by
// tab, shadowing, a 30-day activity strip and the lessons that need attention.
// Pure; everything is derived from data already saved (nothing new is stored).
import { courseOf } from '../lessons/sortLessons.js';
import { categoryList } from '../knowledge/kb.js';

const day = (iso) => String(iso || '').slice(0, 10);

export function progressReport(data, now = new Date()) {
  const lessons = data?.lessons || [];
  const shadow = data?.shadowing || {};
  const courses = new Map();
  for (const l of lessons) {
    const c = courseOf(l) || 'بدونِ دوره';
    const p = l.progress || {};
    const sh = Object.values(shadow[String(l.id)] || {});
    const row = courses.get(c) || { course: c, lessons: 0, withContent: 0, quizzes: 0, chats: 0, shadowed: 0, mastered: 0 };
    row.lessons += 1;
    if (l.bodyRef || String(l.archivedNotes || '').trim().length > 50) row.withContent += 1;
    row.quizzes += p.quizzesTaken || 0;
    row.chats += p.chatPracticeCount || 0;
    row.shadowed += sh.length;
    row.mastered += sh.filter((r) => r.best >= 80).length;
    courses.set(c, row);
  }
  const kb = data?.knowledgeBase || {};
  const knowledge = categoryList(kb, data?.kbCategories).map((c) => ({ label: c.label, count: (kb[c.key] || []).length }));

  // 30-day activity: journal entries + shadowing attempts + quiz/chat dates we know.
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now); d.setDate(d.getDate() - (29 - i));
    return d.toISOString().slice(0, 10);
  });
  const counts = Object.fromEntries(days.map((d) => [d, 0]));
  for (const j of data?.journal || []) if (counts[day(j.date)] !== undefined) counts[day(j.date)] += 1;
  for (const lid of Object.keys(shadow)) for (const r of Object.values(shadow[lid])) if (counts[day(r.at)] !== undefined) counts[day(r.at)] += 1;
  const activity = days.map((d) => ({ day: d, count: counts[d] }));

  // Lessons with content but no practice at all come first, then the least practised.
  const attention = lessons
    .filter((l) => l.bodyRef || String(l.archivedNotes || '').trim().length > 50)
    .map((l) => {
      const p = l.progress || {};
      const score = (p.quizzesTaken || 0) * 2 + (p.chatPracticeCount || 0) + Object.keys(shadow[String(l.id)] || {}).length;
      return { id: l.id, title: l.title, score };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, 6);

  const shadowRows = Object.values(shadow).flatMap((o) => Object.values(o));
  return {
    courses: [...courses.values()].sort((a, b) => b.lessons - a.lessons),
    knowledge,
    knowledgeTotal: knowledge.reduce((a, k) => a + k.count, 0),
    activity,
    activeDays30: activity.filter((a) => a.count > 0).length,
    attention,
    shadow: { practiced: shadowRows.length, mastered: shadowRows.filter((r) => r.best >= 80).length, attempts: shadowRows.reduce((a, r) => a + (r.attempts || 0), 0) },
  };
}
