// Render the x-ray: ghost shell + systems on, to prove the routing is real.
import { chromium } from 'playwright';
import { serve } from './tools/render/serve.mjs';
const { server, port } = await serve(0);
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport:{width:1500,height:940} });
p.on('pageerror',e=>console.log('ERR',e.message.split('\n')[0]));
await p.goto(`http://127.0.0.1:${port}/web/walk.html`,{waitUntil:'commit',timeout:60000});
await p.waitForFunction('!document.getElementById("loading")',{timeout:400000}).catch(()=>console.log('slow load'));
await p.waitForTimeout(8000);
await p.evaluate(()=>{ document.getElementById('xrayOn').click(); document.getElementById('xrayGhost').click(); });
await p.evaluate(()=>{ [...document.querySelectorAll('#views button')].find(b=>b.textContent.includes('spine + chases'))?.click(); });
await p.waitForTimeout(20000);
await p.screenshot({path:'out/png/xray-systems.png'});
console.log('done');
await b.close(); server.close();
