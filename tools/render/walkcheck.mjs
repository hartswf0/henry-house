import { chromium } from 'playwright';
import { serve } from '/home/user/henry-house/tools/render/serve.mjs';
const { server, port } = await serve(0);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] });
const p = await b.newPage({ viewport: { width: 900, height: 600 } });
const errs = [];
p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
p.on('requestfailed', r => errs.push('REQFAIL ' + r.url()));
p.on('response', r => { if (r.status() >= 400) errs.push('HTTP ' + r.status() + ' ' + r.url()); });
await p.goto(`http://127.0.0.1:${port}/web/walk.html`, { waitUntil: 'load' });
await p.waitForTimeout(20000);
console.log(errs.length ? errs.join('\n') : 'no errors');
console.log('ready flag:', await p.evaluate('typeof window.__walkReady !== "undefined" ? window.__walkReady : "n/a"'));
await b.close(); server.close();
