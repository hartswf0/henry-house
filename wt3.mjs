import { chromium } from 'playwright';
import { serve } from './tools/render/serve.mjs';
const { server, port } = await serve(0);
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport:{width:1440,height:900} });
p.on('pageerror',e=>console.log('PAGEERROR:', e.message.split('\n')[0]));
try{ await p.goto(`http://127.0.0.1:${port}/web/walk.html`,{waitUntil:'commit',timeout:60000}); }catch(e){}
await p.waitForFunction('!document.getElementById("loading")',{timeout:240000}).catch(()=>console.log('never finished loading'));
await p.waitForTimeout(25000);
console.log('canvas:', await p.evaluate(()=>!!document.querySelector('canvas')));
console.log('groups:', await p.evaluate(()=>document.querySelectorAll('#layers button').length));
console.log('views:',  await p.evaluate(()=>document.querySelectorAll('#views button').length));
await p.screenshot({path:'out/png/walkthrough-ui.png'});
await b.close(); server.close();
