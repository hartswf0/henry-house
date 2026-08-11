// Render every alternative scheme from the SAME camera geometry, the same sun,
// the same terrain and the same materials, so a blind A/B is a comparison and
// not a beauty contest between whichever one got the better light.
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';
import { SCHEMES } from '../../model/schemes.mjs';

const OUT = fileURLToPath(new URL('../../out/schemes/', import.meta.url));
mkdirSync(OUT, { recursive: true });

const argv = process.argv.slice(2);
const SAMPLES = +(argv.find(a => a.startsWith('--samples='))?.split('=')[1] ?? 20);
const CHUNK = +(argv.find(a => a.startsWith('--chunk='))?.split('=')[1] ?? 5);
const W = 1400, H = 900;
const only = argv.filter(a => !a.startsWith('--'));
const list = SCHEMES.map(s => s.id).filter(id => !only.length || only.some(o => id.includes(o)));

const { server, port } = await serve(0);
const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'],
});
const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
page.on('pageerror', e => console.error('  ! page error:', e.message));
page.on('console', m => { if (m.type() === 'error') console.error('  ! console:', m.text()); });
await page.goto(`http://127.0.0.1:${port}/web/schemes.html`, { waitUntil: 'load' });
await page.waitForFunction('window.__loaded === true', { timeout: 60000 });

console.log(`HENRY HOUSE — ALTERNATIVE SCHEMES   (${SAMPLES} samples, ${W}x${H})\n`);
for (const id of list) {
  const t0 = Date.now();
  process.stdout.write(`  ${id.padEnd(14)} `);
  const setup = await page.evaluate(([i, w, h]) => window.setupScheme(i, w, h), [id, W, H]);
  if (!setup.ok) { console.log(`FAILED: ${setup.error}`); console.log(await page.evaluate('window.__error')); continue; }
  for (let done = 0; done < SAMPLES; done += CHUNK) {
    const r = await page.evaluate((n) => window.renderPasses(n), Math.min(CHUNK, SAMPLES - done));
    if (!r.ok) { console.log(`FAILED: ${r.error}`); break; }
    process.stdout.write('.');
  }
  const uri = await page.evaluate(() => window.grab());
  const file = `${id}.png`;
  writeFileSync(OUT + file, Buffer.from(uri.split(',')[1], 'base64'));
  console.log(`  ${((Date.now() - t0) / 1000).toFixed(0)}s  -> ${file}`);
}
await browser.close();
server.close();
console.log('\ndone.');
