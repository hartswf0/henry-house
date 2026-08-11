// Drives the browser: builds each view, integrates N accumulation passes, and
// writes the PNG. Passes are chunked so a slow software rasteriser never trips
// a script timeout, and so progress is visible.
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';
import { VIEW_ORDER, VIEWS } from './lib/views.mjs';

const OUT = fileURLToPath(new URL('../../out/renders/', import.meta.url));
mkdirSync(OUT, { recursive: true });

const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const argv = process.argv.slice(2);
const SAMPLES = +(argv.find(a => a.startsWith('--samples='))?.split('=')[1] ?? 64);
const CHUNK = +(argv.find(a => a.startsWith('--chunk='))?.split('=')[1] ?? 8);
const only = argv.filter(a => !a.startsWith('--'));
const list = (only.length ? only : VIEW_ORDER).filter(v => VIEWS[v]);

const { server, port } = await serve(0);
const browser = await chromium.launch({
  executablePath: CHROME,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'],
});
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
page.on('pageerror', e => console.error('  ! page error:', e.message));
page.on('console', m => { if (m.type() === 'error') console.error('  ! console:', m.text()); });

await page.goto(`http://127.0.0.1:${port}/tools/render/scene.html`, { waitUntil: 'load' });
await page.waitForFunction('window.__loaded === true', { timeout: 60000 });
console.log(`HENRY HOUSE — 3D renders   (${SAMPLES} samples/view)\n`);

for (const name of list) {
  const t0 = Date.now();
  process.stdout.write(`  ${name.padEnd(18)} setup…`);
  const setup = await page.evaluate((n) => window.setupView(n), name);
  if (!setup.ok) {
    console.log(` FAILED: ${setup.error}`);
    console.log(await page.evaluate('window.__error'));
    continue;
  }
  process.stdout.write(` ${setup.w}x${setup.h}  sun alt ${setup.sun.altDeg}° az ${setup.sun.azDeg}°  `);

  let done = 0;
  while (done < SAMPLES) {
    const n = Math.min(CHUNK, SAMPLES - done);
    const r = await page.evaluate((k) => window.renderPasses(k), n);
    if (!r.ok) { console.log(`\n    FAILED during passes: ${r.error}`); break; }
    done = r.samples;
    process.stdout.write('.');
  }

  const data = await page.evaluate(() => window.grab());
  const file = OUT + name + '.png';
  writeFileSync(file, Buffer.from(data.split(',')[1], 'base64'));
  console.log(`  ${((Date.now() - t0) / 1000).toFixed(0)}s  -> ${name}.png`);
}

await browser.close();
server.close();
console.log('\ndone.');
