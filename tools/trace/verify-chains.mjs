// DO THE CHAINS ACTUALLY OPEN, AND PLAY, IN THE PAGE THEY WERE WRITTEN FOR?
//
// The schema is only as good as the reader's opinion of it, so this loads every
// exported chain into a local copy of
// gunnars-depot.html/operative-builder-trace.html, walks its links, and reports
// what the page believes it is holding: how many messages, how many parts on
// the stage, whether the building fits the frame, and any console error.
//
// AND WHETHER IT PLAYS. Driving the page with goto() proves a trace can be
// stepped through; it says nothing about whether the thing advances on its own,
// which is the first thing anybody opening it will notice. So each chain is also
// left alone for twelve seconds with its own autoplay running, and the cursor
// has to move. One of the reader's own bundled traces fails exactly this and
// passes everything else.
//
//   npm i --no-save playwright-core
//   node tools/trace/verify-chains.mjs <path-to-gunnars-depot-checkout>
import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFile, readdir, copyFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

const DEPOT = resolve(process.argv[2] ?? '../gunnars-depot.html');
const CHAINS = resolve('out/henry-house-chains');
const PORT = Number(process.env.PORT || 8097);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml' };

// Serve the reader from its own checkout, but let /assets/traces/ come from ours.
const server = createServer(async (req, res) => {
  const path = decodeURIComponent(req.url.split('?')[0]);
  const from = path.startsWith('/assets/traces/')
    ? join(CHAINS, path.slice('/assets/traces/'.length)) : join(DEPOT, path);
  try {
    res.writeHead(200, { 'content-type': TYPES[extname(path)] || 'application/octet-stream' });
    res.end(await readFile(from));
  } catch { if (!res.headersSent) res.writeHead(404); res.end('no'); }
});
await new Promise((r) => server.listen(PORT, r));

const index = JSON.parse(await readFile(join(CHAINS, 'index.json'), 'utf8'));
const browser = await chromium.launch({
  executablePath: process.env.CHROME || '/opt/pw-browsers/chromium',
  args: ['--use-gl=swiftshader', '--no-sandbox'],
});

let bad = 0;
for (const [w, h, label] of [[1280, 820, 'desktop'], [390, 780, 'phone']]) {
  console.log(`\n──────── ${label}  ${w}×${h}`);
  for (const t of index.traces) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    const errs = [];
    page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 120)));
    page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 120)); });
    const slug = t.file.replace(/\.json$/, '');
    await page.goto(`http://127.0.0.1:${PORT}/operative-builder-trace.html?trace=${slug}`,
      { waitUntil: 'load' });
    try { await page.waitForFunction(() => window.trace?.msgs?.length > 0, { timeout: 25000 }); }
    catch { console.log(` ! ${slug.padEnd(26)} never loaded`); bad++; await page.close(); continue; }

    const opened = await page.evaluate(() => window.trace.file);
    if (opened !== t.file) { console.log(` ! ${slug.padEnd(26)} opened ${opened}`); bad++; }

    const n = await page.evaluate(() => window.trace.msgs.length);
    // Sample across the run and always the end, where the world is largest.
    const at = await page.evaluate(() => {
      const m = window.trace.msgs, s = new Set([m.length - 1]);
      for (let k = 0; k < m.length; k += Math.max(1, Math.ceil(m.length / 6))) s.add(k);
      return [...s].sort((a, b) => a - b);
    });
    // Left alone, does it advance? Desktop only — playback does not know the
    // viewport, and this costs twelve seconds a chain.
    if (label === 'desktop') {
      const seen = [];
      for (let k = 0; k < 6; k++) {
        await page.waitForTimeout(2000);
        seen.push(await page.evaluate(() => window.trace.at));
      }
      if (new Set(seen).size === 1) {
        bad++;
        console.log(` ! ${slug.padEnd(26)} STUCK — autoplay never left message ${seen[0]}`);
      }
    }

    let fails = 0, started = false, most = 0;
    for (const i of at) {
      const got = await page.evaluate(async (i) => {
        window.trace.goto(i);
        for (let k = 0; k < 60; k++) {
          await new Promise((r) => setTimeout(r, 150));
          const s = window.trace.stage?.();
          if (s && s.total) { await new Promise((r) => setTimeout(r, 1200)); return window.trace.stage(); }
        }
        return null;
      }, i);
      if (got) { started = true; most = Math.max(most, got.total); }
      // A run opens on a prompt and a reference before anything is built, so an
      // empty stage early is the trace being accurate; after that it is a fault.
      const ok = got ? got.total > 0 && got.onscreen : !started;
      if (!ok) { fails++; bad++; console.log(`     ! msg ${i}: ` +
        (got ? `${got.shown} of ${got.total}${got.onscreen ? '' : ' OFF SCREEN'}` : 'nothing on the stage')); }
    }
    if (errs.length) { bad++; console.log(`     ! console: ${errs[0]}`); }
    console.log(` ${fails || errs.length ? '!' : '·'} ${slug.padEnd(26)} ${String(n).padStart(4)} messages · ` +
      `${at.length} sampled · ${String(most).padStart(3)} parts at most${t.turns ? ' (human trace, no geometry)' : ''}`);
    await page.close();
  }
}
await browser.close(); server.close();
console.log(bad ? `\n${bad} check(s) failed` : '\nevery chain opens, stages and fits');
process.exit(bad ? 1 : 0);
