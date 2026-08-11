// HENRY HOUSE — RENDER ONE VIEW OF ONE SCHEME, TO LOOK AT IT.
//
// shoot-schemes.mjs renders every scheme at full quality and takes half an
// hour. That is the wrong instrument for "did this change fix what I think it
// fixed" — a question worth asking after every geometry change, and one that
// went unasked for four rounds while the model accumulated the slop that
// docs/08-the-3d-rebuild.md documents. This renders a single frame in about a
// minute so the answer is cheap enough to want.
//
//   node tools/render/shoot-one.mjs S0-SPINE interior 26
//   node tools/render/shoot-one.mjs S1-ARMATURE hero 20
//
// View ids come from schemeViews() in tools/render/lib/scheme3d.mjs. Output
// goes to out/preview/, which is deliberately NOT the published set: these are
// working frames, and passing them off as the deliverable is how a 14-sample
// preview ends up on a client's phone.
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
import fs from 'node:fs';
import path from 'node:path';

const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const [id, view = 'compare', samples = '20'] = process.argv.slice(2);
if (!id) {
  console.error('usage: node tools/render/shoot-one.mjs <SCHEME-ID> [view] [samples]');
  process.exit(2);
}

const dir = 'out/preview';
fs.mkdirSync(dir, { recursive: true });

const { server, port } = await serve(0);
const browser = await chromium.launch({
  executablePath: CHROME,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'],
});
const page = await browser.newPage({ viewport: { width: 900, height: 620 } });
page.on('pageerror', e => console.error('  ! page error:', e.message));
await page.goto(`http://127.0.0.1:${port}/web/schemes.html`, { waitUntil: 'load' });
await page.waitForFunction('window.__loaded === true', { timeout: 90000 });

const r = await page.evaluate(async ([i, v, n]) => {
  const s = await window.setupScheme(i, 1100, 760, v);
  if (!s.ok) return { ok: false, error: s.error };
  const p = await window.renderPasses(n);
  if (!p.ok) return { ok: false, error: p.error };
  return { ok: true, uri: window.grab(), view: s.view };
}, [id, view, Number(samples)]);

await browser.close();
server.close();

if (!r.ok) { console.error(`  ✗ ${id} ${view}: ${r.error}`); process.exit(1); }
const out = path.join(dir, `${id}-${r.view}.png`);
fs.writeFileSync(out, Buffer.from(r.uri.split(',')[1], 'base64'));
console.log(`  ✓ ${out}  (${samples} samples — a working frame, not the published render)`);
