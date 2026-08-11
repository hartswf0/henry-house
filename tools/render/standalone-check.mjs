// Opens a bundled page from file:// — no server, no node_modules, nothing on
// the network — and reports whether it actually drew. This is the only test
// that matches how the page will really be used.
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const target = process.argv[2] ?? 'out/standalone/henry-house-walkthrough.html';
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'],
});
const page = await browser.newPage({ viewport: { width: 1100, height: 720 } });
const problems = [];
page.on('pageerror', e => problems.push('PAGE ERROR  ' + e.message.split('\n')[0]));
page.on('console', m => { if (m.type() === 'error') problems.push('CONSOLE  ' + m.text()); });
page.on('request', r => { if (!r.url().startsWith('file:') && !r.url().startsWith('blob:') && !r.url().startsWith('data:')) problems.push('OFF-DEVICE REQUEST  ' + r.url()); });

await page.goto(pathToFileURL(resolve(ROOT, target)).href, { waitUntil: 'load' });
await page.waitForTimeout(25000);

const state = await page.evaluate(() => {
  const c = document.querySelector('canvas');
  if (!c) return { canvas: null };
  const gl = c.getContext('webgl2') || c.getContext('webgl');
  return { canvas: { w: c.width, h: c.height }, gl: !!gl };
});
if (!state.canvas) problems.push('NO CANVAS — the scene never built');

const shot = resolve(ROOT, 'out/standalone/preview.png');
await page.screenshot({ path: shot });

console.log('\nSTANDALONE PAGE CHECK — ' + target + '\n' + '='.repeat(70));
if (problems.length) { for (const p of [...new Set(problems)]) console.log('  ' + p); }
else console.log(`  OK — canvas ${state.canvas.w}x${state.canvas.h}, drew from file:// with zero network requests`);
console.log('  screenshot: out/standalone/preview.png');
await browser.close();
process.exitCode = problems.length ? 1 : 0;
