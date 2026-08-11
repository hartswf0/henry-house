// Fast material probe: builds each material in the browser and reports the
// average colour of its map, so a wrong-looking surface can be diagnosed
// without paying for a full render.
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
const { server, port } = await serve(0);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--enable-unsafe-swiftshader'] });
const p = await b.newPage();
p.on('pageerror', e => console.error('PAGE ERROR:', e.message));
await p.goto(`http://127.0.0.1:${port}/tools/render/probe.html`, { waitUntil: 'load' });
await p.waitForFunction('window.__done === true', { timeout: 60000 });
console.log(await p.evaluate(() => JSON.stringify(window.__result, null, 2)));
await b.close(); server.close();
