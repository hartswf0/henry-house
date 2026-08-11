// Loads the browser pages in headless Chromium and reports anything that fails.
//
// THIS EXISTS BECAUSE THE WALKTHROUGH WAS BROKEN AND NOTHING SAID SO.
//
// web/walk.html imported three.js from `../node_modules/`, which is gitignored.
// On the machine that had run `npm install` it worked perfectly. For anyone who
// cloned the repository it was three 404s and a blank canvas — and the failure
// was invisible from here, because the renders are driven by a different page.
//
// A drawing nobody looked at is not a drawing. A viewer nobody opened is worse:
// it looks finished.
import { chromium } from 'playwright';
import { serve } from './serve.mjs';

const PAGES = [
  { url: '/web/walk.html', name: 'WALKTHROUGH', settle: 22000, expect: 'canvas' },
  { url: '/web/walk-schemes.html', name: 'WALK SCHEMES', settle: 22000, expect: 'canvas' },
  { url: '/web/gallery.html', name: 'GALLERY', settle: 22000, expect: 'canvas' },
  { url: '/tools/render/scene.html', name: 'RENDER SCENE', settle: 8000, expect: null },
];

const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const { server, port } = await serve(0);
const browser = await chromium.launch({
  executablePath: CHROME,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'],
});

let failed = 0;
console.log('\nHENRY HOUSE — BROWSER PAGE CHECKS\n' + '='.repeat(74));

for (const P of PAGES) {
  const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  const problems = [];
  // A 404 on a module is the failure that hid for the longest, so it is named
  // with its URL rather than logged as "Failed to load resource".
  page.on('response', (r) => {
    if (r.status() >= 400) problems.push(`HTTP ${r.status()}  ${new URL(r.url()).pathname}`);
  });
  page.on('requestfailed', (r) => problems.push(`REQUEST FAILED  ${new URL(r.url()).pathname}`));
  page.on('pageerror', (e) => problems.push(`PAGE ERROR  ${e.message.split('\n')[0]}`));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (/Failed to load resource/i.test(t)) return;   // the response handler names it properly
    problems.push(`CONSOLE  ${t}`);
  });

  await page.goto(`http://127.0.0.1:${port}${P.url}`, { waitUntil: 'load' });
  await page.waitForTimeout(P.settle);

  let drew = null;
  if (P.expect === 'canvas') {
    drew = await page.evaluate(() => {
      const c = document.querySelector('canvas');
      return c ? { w: c.width, h: c.height } : null;
    });
    if (!drew) problems.push('NO CANVAS — the scene never built');
    else if (drew.w < 50 || drew.h < 50) problems.push(`CANVAS IS ${drew.w}x${drew.h} — the scene never sized`);
  }

  const bad = problems.filter((v, i) => problems.indexOf(v) === i);
  if (bad.length) {
    failed++;
    console.log(`[FAIL] ${P.name.padEnd(14)} ${P.url}`);
    for (const b of bad) console.log(`       ${b}`);
  } else {
    console.log(`[ OK ] ${P.name.padEnd(14)} ${P.url}${drew ? `  canvas ${drew.w}x${drew.h}` : ''}`);
  }
  await page.close();
}

console.log('='.repeat(74));
console.log(failed ? `RESULT         ${failed} page(s) broken` : 'RESULT         all browser pages load clean');
await browser.close();
server.close();
process.exitCode = failed ? 1 : 0;
