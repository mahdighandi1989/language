#!/usr/bin/env node
// Browser regression test for the quiz centre (no Gemini key needed — the model
// reply is mocked). Guards: invented question types («verb_conjugation»…) never
// show «نوع سوال نامشخص»; unanswerable ones are dropped; knowledge questions
// render with 4 options; two quizzes in a row work.
//
//   npm run build && GEMINI_API_KEY=AIza…dummy PORT=3001 node backend/server.js &
//   node scripts/e2e/quiz-invalid-types.cjs [--base http://localhost:3001]
// Uses the pre-installed Playwright. Exit code 1 on failure.
const { chromium } = require('playwright');

const base = (process.argv.includes('--base') ? process.argv[process.argv.indexOf('--base') + 1] : 'http://localhost:3001').replace(/\/$/, '');
const kb = Array.from({ length: 40 }, (_, k) => ({ id: k, term: ['بَيْت', 'شُبّاك', 'مَيّ', 'باب', 'كتير'][k % 5] + ' ' + k, definition: ['خانه', 'پنجره', 'آب', 'در', 'خیلی'][k % 5] + ' ' + k, ...(k < 6 ? { lessonId: 1 } : {}) }));
const data = {
  lessons: [{ id: 1, title: 'صرف فعل - الخنسا', archivedNotes: '| ضمیر | ماضی | مضارع |\n|---|---|---|\n| انا | أخدت | باخد |\n| إنتِ | أخدتي | بتاخدي |\n| هو | أخد | بياخد |', files: [], progress: {}, createdAt: '2026-11-01' }],
  knowledgeBase: { vocabulary: kb }, journal: [], stats: {}, chatHistories: {}, archivedConversations: [],
};
const reply = JSON.stringify([
  { type: 'verb_conjugation', question: 'ماضی: «تو (مؤنث) گرفتی» کدام است؟', options: ['أخدتي', 'أخدت', 'أخد', 'بتاخدي'], correctAnswer: 'أخدتي' },
  { type: 'verb_conjugation', question: 'بی‌گزینه — باید حذف شود', correctAnswer: 'أخد' },
  { type: 'mcq', question: 'پاسخ در گزینه‌ها نیست — باید حذف شود', options: ['a', 'b', 'c', 'd'], correctAnswer: 'z' },
  { type: 'grammar_point', question: 'نوعِ ساختگیِ بی‌شکل — باید حذف شود' },
  { type: 'mcq', question: 'ماضی: «او گرفت» کدام است؟', options: ['أخد', 'أخدت', 'بياخد', 'أخدتي'], correctAnswer: 'أخد' },
]);

(async () => {
  const fails = [];
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 1800 } });
  await ctx.addInitScript((d) => localStorage.setItem('lebanese_dialect_app_data', JSON.stringify(d)), data);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.route('**/api/gemini/chat', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ text: reply }) }));
  await page.goto(`${base}/#/quiz`, { waitUntil: 'networkidle' });
  for (const run of [1, 2]) {
    await page.getByText('✨ ایجاد آزمون هوشمند').click();
    await page.waitForSelector('text=ثبت پاسخ‌ها', { timeout: 20000 });
    const blocks = await page.locator('div.bg-white.p-6.rounded-xl.border-2').evaluateAll((els) => els.map((e) => ({ q: e.querySelector('p.font-bold.text-lg')?.innerText || '', options: e.querySelectorAll('input[type=radio]').length })));
    if (await page.locator('text=نوع سوال نامشخص').count()) fails.push(`run ${run}: «نوع سوال نامشخص» shown`);
    if (blocks.some((b) => /باید حذف شود/.test(b.q))) fails.push(`run ${run}: an unanswerable question was shown`);
    if (blocks.some((b) => b.options !== 4)) fails.push(`run ${run}: a question without 4 options: ${JSON.stringify(blocks)}`);
    if (!blocks.some((b) => /تو \(مؤنث\) گرفتی/.test(b.q))) fails.push(`run ${run}: the mapped verb_conjugation question is missing`);
    if (!blocks.some((b) => /^معنیِ «|به لبنانی کدام است/.test(b.q))) fails.push(`run ${run}: no knowledge-center question`);
    console.log(`run ${run}:`, blocks.map((b) => `${b.q.slice(0, 40)} [${b.options}]`).join(' | '));
    await page.locator('input[type=radio]').first().check();
    await page.getByText('✅ ثبت پاسخ‌ها').click();
    await page.getByText('🔄 آزمون جدید').click();
  }
  if (errors.length) fails.push(`page errors: ${errors.join('; ')}`);
  await browser.close();
  if (fails.length) { console.error('FAIL\n- ' + fails.join('\n- ')); process.exit(1); }
  console.log('OK — invalid types mapped or dropped, two quizzes in a row');
})();
