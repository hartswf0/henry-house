// Opens the packed page from file:// and drives it the way a person would:
// click "walk through the house", wait for the 3D to build, confirm it drew,
// open a drawing sheet, and assert nothing reached for the network.
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const target = process.argv[2] ?? 'out/artifact/henry-house.html';
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });
const problems = [];
page.on('pageerror', e => problems.push('PAGE ERROR  ' + e.message.split('\n')[0]));
page.on('console', m => { if (m.type() === 'error') problems.push('CONSOLE  ' + m.text()); });
page.on('request', r => {
  const u = r.url();
  if (!/^(file|blob|data|about):/.test(u)) problems.push('OFF-DEVICE REQUEST  ' + u.slice(0, 90));
});

await page.goto(pathToFileURL(resolve(ROOT, target)).href, { waitUntil: 'load' });
await page.waitForTimeout(1500);
await page.screenshot({ path: resolve(ROOT, 'out/artifact/preview-top.png') });

// the visitor clicks the button
await page.click('#go');
await page.waitForTimeout(30000);

const walk = await page.evaluate(() => {
  const f = document.querySelector('#walkwrap iframe');
  if (!f) return { iframe: false };
  const d = f.contentDocument;
  const c = d && d.querySelector('canvas');
  return { iframe: true, canvas: c ? { w: c.width, h: c.height } : null,
           hud: d ? (d.body.innerText || '').slice(0, 120) : '' };
});
if (!walk.iframe) problems.push('WALKTHROUGH  iframe never created');
else if (!walk.canvas) problems.push('WALKTHROUGH  no canvas inside the iframe');
else if (walk.canvas.w < 200) problems.push('WALKTHROUGH  canvas is ' + walk.canvas.w + 'px wide');
await page.screenshot({ path: resolve(ROOT, 'out/artifact/preview-walk.png') });

// and opens a sheet
await page.evaluate(() => document.querySelector('.sheet').click());
await page.waitForTimeout(1200);
const lb = await page.evaluate(() => {
  const d = document.getElementById('lb');
  const i = document.getElementById('lbimg');
  return { open: d.open, w: i.naturalWidth };
});
if (!lb.open || !lb.w) problems.push('LIGHTBOX  sheet did not open (open=' + lb.open + ', width=' + lb.w + ')');
await page.screenshot({ path: resolve(ROOT, 'out/artifact/preview-sheet.png') });

console.log('\nPACKED PAGE CHECK — ' + target + '\n' + '='.repeat(70));
const bad = [...new Set(problems)];
if (bad.length) bad.forEach(b => console.log('  ' + b));
else console.log(`  OK — 3D built (canvas ${walk.canvas.w}x${walk.canvas.h}), sheet opened at ${lb.w}px, zero network requests`);
console.log('  previews: out/artifact/preview-{top,walk,sheet}.png');
await browser.close();
process.exitCode = bad.length ? 1 : 0;
