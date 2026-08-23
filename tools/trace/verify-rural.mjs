// DOES OUR OWN READER OPEN, PLAY, AND PUT THE HOUSE ON THE STAGE?
//
// Same two faults the depot's harness watches for, checked here because
// rural-studio-trace.html is ours and nobody else is checking it: a chain that
// loads but never advances, and a building framed against a width it does not
// have, so its ends hang off the edge. Both need measuring rather than
// eyeballing, at both widths.
//
// It also asserts the thing this reader exists for: that a house with a pitched
// roof arrives with its roof pitched. A flat slab passing silently is exactly
// the loss this format was written to stop.
//
//   node tools/trace/verify-rural.mjs
import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

const ROOT = resolve('out/henry-house-chains');
const PORT = Number(process.env.PORT || 8100);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml' };
const server = createServer(async (req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]);
  try {
    res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' });
    res.end(await readFile(join(ROOT, p)));
  } catch { if (!res.headersSent) res.writeHead(404); res.end('no'); }
});
await new Promise((r) => server.listen(PORT, r));

const idx = JSON.parse(await readFile(join(ROOT, 'index.json'), 'utf8'));
const browser = await chromium.launch({
  executablePath: process.env.CHROME || '/opt/pw-browsers/chromium',
  args: ['--use-gl=swiftshader', '--no-sandbox'],
});
let bad = 0;
const targets = [...idx.native.map((t) => t.file.replace(/\.rs\.json$/, '')), 'process'];

for (const [w, h, label] of [[1280, 820, 'desktop'], [390, 780, 'phone']]) {
  console.log(`\n──────── ${label}  ${w}×${h}`);
  for (const slug of targets) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    const errs = [];
    page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 140)));
    page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)); });
    await page.goto(`http://127.0.0.1:${PORT}/rural-studio-trace.html?trace=${slug}`,
      { waitUntil: 'load' });
    try { await page.waitForFunction(() => window.trace?.beats?.length > 0, { timeout: 25000 }); }
    catch { console.log(` ! ${slug.padEnd(20)} never loaded — ${errs[0] || 'no error given'}`); bad++; await page.close(); continue; }

    const n = await page.evaluate(() => window.trace.beats.length);
    // Left alone, does it advance? goto() proves nothing about autoplay.
    const seen = [];
    for (let k = 0; k < 5; k++) { await page.waitForTimeout(1800); seen.push(await page.evaluate(() => window.trace.at)); }
    const plays = new Set(seen).size > 1;
    if (!plays) { bad++; console.log(` ! ${slug.padEnd(20)} STUCK at beat ${seen[0]}`); }

    // The end of the run, where the house is largest.
    const stage = await page.evaluate(async () => {
      window.trace.goto(window.trace.beats.length - 1);
      await new Promise((r) => setTimeout(r, 1400));
      return window.trace.stage();
    });
    const isProcess = slug === 'process';
    if (!isProcess) {
      if (!stage) { bad++; console.log(` ! ${slug.padEnd(20)} nothing on the stage at the end`); }
      else if (!stage.onscreen) { bad++; console.log(` ! ${slug.padEnd(20)} OFF SCREEN`); }
      // The whole point of the native format: a pitched roof arrives pitched.
      const tilt = await page.evaluate(() =>
        JSON.parse(JSON.stringify(window.trace.doc.links.at(-1).world.roofs.map((r) => r.pitch))));
      if (tilt.length && tilt.every((p) => !p)) { bad++; console.log(` ! ${slug.padEnd(20)} every roof came through flat`); }
    } else if (stage) { bad++; console.log(` ! ${slug.padEnd(20)} the process chain built geometry it does not have`); }

    if (errs.length) { bad++; console.log(`     console: ${[...new Set(errs)][0]}`); }
    console.log(` ${plays && !errs.length ? '·' : '!'} ${slug.padEnd(20)} ${String(n).padStart(4)} beats · ` +
      `at ${seen.join(',')} ${plays ? 'PLAYS' : ''} · stage ${stage ? `${stage.shown} parts${stage.onscreen ? '' : ' OFFSCREEN'}` : 'none'}`);
    await page.close();
  }
}
await browser.close(); server.close();
console.log(bad ? `\n${bad} check(s) failed` : '\nevery chain opens, plays, and stands in frame');
process.exit(bad ? 1 : 0);
