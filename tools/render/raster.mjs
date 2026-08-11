// Rasterise SVG sheets to PNG through Chromium so the drawings can actually be
// inspected — by me, by critics, and by a human. A drawing nobody looked at is
// not a drawing.
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const DRAW = fileURLToPath(new URL('../../out/drawings/', import.meta.url));
const PNG = fileURLToPath(new URL('../../out/png/', import.meta.url));
mkdirSync(PNG, { recursive: true });

const only = process.argv.slice(2).filter(a => !a.startsWith('-'));
const scale = Number((process.argv.find(a => a.startsWith('--scale=')) || '--scale=1').split('=')[1]);

const files = readdirSync(DRAW).filter(f => f.endsWith('.svg'))
  .filter(f => !only.length || only.some(o => f.includes(o)));

// The preinstalled browser build (1194) does not match the npm playwright
// version's expected build, so point at it explicitly rather than downloading.
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox', '--font-render-hinting=none'] });
const page = await browser.newPage({ deviceScaleFactor: scale });

for (const f of files) {
  const svg = readFileSync(DRAW + f, 'utf8');
  const m = svg.match(/width="(\d+)" height="(\d+)"/);
  const w = m ? +m[1] : 3600, h = m ? +m[2] : 2400;
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(
    `<html><body style="margin:0;background:#fff">
     <div style="width:${w}px;height:${h}px;overflow:hidden">${svg}</div>
     </body></html>`,
    { waitUntil: 'load' });
  // --crop=x,y,w,h lets me inspect a detail at full resolution instead of
  // squinting at a 3600px sheet scaled down to 2000 and guessing.
  const cropArg = (process.argv.find(a => a.startsWith('--crop=')) || '').split('=')[1];
  const crop = cropArg ? cropArg.split(',').map(Number) : null;
  const clip = crop ? { x: crop[0], y: crop[1], width: crop[2], height: crop[3] }
                    : { x: 0, y: 0, width: w, height: h };
  const out = PNG + f.replace(/\.svg$/, crop ? '-crop.png' : '.png');
  await page.screenshot({ path: out, clip });
  console.log(`  ✓ ${out.split('/').pop()}  ${clip.width}x${clip.height} @${scale}x`);
}

await browser.close();
