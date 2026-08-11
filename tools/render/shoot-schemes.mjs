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
const SAMPLES = +(argv.find(a => a.startsWith('--samples='))?.split('=')[1] ?? 64);
const CHUNK = +(argv.find(a => a.startsWith('--chunk='))?.split('=')[1] ?? 8);
// Each view carries its own size now, at the main house's standard — 1700 x
// 1062 exterior, 1620 x 1110 interior. The old 1400 x 900 at 20 samples was
// why these read as massing studies beside the house's own renders.
const VIEWS = (argv.find(a => a.startsWith('--views='))?.split('=')[1] ?? 'compare,hero,interior').split(',');
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

console.log(`HENRY HOUSE — ALTERNATIVE SCHEMES   (${SAMPLES} samples, views: ${VIEWS.join(', ')})\n`);
for (const id of list) {
  const avail = await page.evaluate((i) => window.schemeViewIds(i), id);
  for (const view of VIEWS.filter(v => avail.includes(v))) {
    const t0 = Date.now();
    process.stdout.write(`  ${id.padEnd(14)} ${view.padEnd(9)} `);
    const setup = await page.evaluate(([i, v]) => window.setupScheme(i, 0, 0, v), [id, view]);
    if (!setup.ok) { console.log(`FAILED: ${setup.error}`); console.log(await page.evaluate('window.__error')); continue; }
    process.stdout.write(`${setup.w}x${setup.h} `);
    for (let done = 0; done < SAMPLES; done += CHUNK) {
      const r = await page.evaluate((n) => window.renderPasses(n), Math.min(CHUNK, SAMPLES - done));
      if (!r.ok) { console.log(`FAILED: ${r.error}`); break; }
      process.stdout.write('.');
    }
    const uri = await page.evaluate(() => window.grab());
    // 'compare' keeps the bare id so every downstream reference to
    // out/schemes/<ID>.png — the sheets, the packed page — still resolves.
    const file = view === 'compare' ? `${id}.png` : `${id}-${view}.png`;
    writeFileSync(OUT + file, Buffer.from(uri.split(',')[1], 'base64'));
    console.log(`  ${((Date.now() - t0) / 1000).toFixed(0)}s  -> ${file}`);
  }
}
await browser.close();
server.close();
console.log('\ndone.');
