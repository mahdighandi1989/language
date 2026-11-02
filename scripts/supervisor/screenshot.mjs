#!/usr/bin/env node
// Take the «after» picture for an inspection answer, from the REAL app in Chromium.
//
//   node scripts/supervisor/screenshot.mjs '#/lessons' --out after.png [--selector '#card'] [--base http://localhost:3001]
//
// Default base is a LOCAL server (build first: `npm run build`, then
// `GEMINI_API_KEY=AIza…dummy node backend/server.js`). Locally, without VITE_*
// Firebase values, the SPA runs in its no-sign-in mode, so every page renders.
// Production pages need a Google sign-in, which the supervisor account does not
// have — use production only for public routes. Uses the pre-installed
// Playwright (never run `playwright install`); prints console errors it saw.
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  ({ chromium } = await import('playwright'));
}

const args = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : dflt;
};
const route = args.find((a) => !a.startsWith('--') && !args[args.indexOf(a) - 1]?.startsWith('--')) || '#/dashboard';
const base = (opt('base', process.env.LANG_APP_BASE || 'http://localhost:3001')).replace(/\/$/, '');
const out = opt('out', 'after.png');
const selector = opt('selector', null);

const browser = await chromium.launch(process.env.PW_EXECUTABLE ? { executablePath: process.env.PW_EXECUTABLE } : {});
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(`${base}/${route.startsWith('#') ? route : `#/${route.replace(/^\//, '')}`}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
if (selector) {
  const el = await page.$(selector);
  if (!el) {
    console.error(`selector not found: ${selector}`);
    await page.screenshot({ path: out, fullPage: true });
    await browser.close();
    process.exit(2);
  }
  await el.scrollIntoViewIfNeeded();
  await el.screenshot({ path: out });
} else {
  await page.screenshot({ path: out, fullPage: true });
}
console.log(JSON.stringify({ out, url: page.url(), consoleErrors: errors }, null, 2));
await browser.close();
