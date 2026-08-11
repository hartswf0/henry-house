// Find any mesh poking above the roof underside. Guessing has failed twice.
import { chromium } from 'playwright';
import { serve } from './tools/render/serve.mjs';
const { server, port } = await serve(0);
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox','--enable-unsafe-swiftshader'] });
const p = await b.newPage();
p.on('pageerror', e => console.log('ERR', e.message.split('\n')[0]));
await p.goto(`http://127.0.0.1:${port}/tools/render/probe-roof.html`, { waitUntil:'commit', timeout:60000 });
await p.waitForFunction('window.__done===true', { timeout: 300000 }).catch(()=>console.log('timeout'));
console.log(await p.evaluate(()=>window.__out||'no result'));
await b.close(); server.close();
