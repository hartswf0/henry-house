// HENRY HOUSE — the site that lives in the repository.
//
// Two things this fixes, both said plainly by the client:
//
//   "don't make it as a claude page, needs to push to repo"
//   "we have many drawings and schematics not visible on this"
//
// The packed single-file page showed 14 sheets. The repository holds 23. The
// ten it never showed were P-201 and every per-scheme dossier — X-201 through
// X-209 — which is to say the drawings produced most recently and argued about
// hardest. A package that quietly omits half its own drawings is not an index.
//
// So this generates index.html AT THE REPO ROOT, listing EVERYTHING by walking
// out/ rather than by a hand-kept list that can fall behind again. It links
// files already committed — no copies, no duplication — and GitHub Pages
// serves it from the branch root.
//
// The other half is legibility. A 3,600 x 2,400 sheet on a 390 px phone is
// unreadable, and shrinking it to fit is the same as not showing it. Every
// sheet opens in a viewer built for a thumb: fit to width first, pinch and
// drag to zoom, double-tap to jump to 100%.
import { writeFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const ls = (d) => (existsSync(resolve(ROOT, d)) ? readdirSync(resolve(ROOT, d)) : []);
const kb = (p) => Math.round(statSync(resolve(ROOT, p)).size / 1024);

// ── what a sheet is, read off its own filename ──────────────────────────────
const TITLES = {
  'A-101': 'Main level plan', 'A-102': 'Lower + upper plans',
  'A-201': 'Section A—A', 'A-202': 'Sections B—B + C—C',
  'A-301': 'South + north elevations', 'A-302': 'East + west + roof plan',
  'C-101': 'Site, grading and access',
  'P-101': 'Water', 'P-201': 'Waste + drainage', 'M-101': 'Ventilation + HVAC',
  'E-101': 'Electrical + data', 'G-001': 'The house as a system, and what it costs',
  'X-101': 'Seven schemes, one scale', 'X-102': 'Proposed schemes',
  'R-101': 'The reference set, as a bar',
};
const GROUPS = [
  { key: 'A', name: 'The house — plans, sections, elevations',
    note: 'The current design. Everything essential on one floor, three levels stepping down with the ground.' },
  { key: 'C', name: 'The site', note: 'The drive, solved: 655 ft, five switchbacks, 11% held — and the earth that has to move.' },
  { key: 'P', name: 'Water and waste', note: 'One pump, home-run branches, and a branch that needs no pump at all.' },
  { key: 'M', name: 'Air', note: 'The airway is separate from the heating system, exactly as it is in a body.' },
  { key: 'E', name: 'Power', note: 'One brain, home runs, and reflex arcs that work when the brain is offline.' },
  { key: 'G', name: 'The house as a system', note: 'What the house does before the weather does it.' },
  { key: 'R', name: 'The reference bar', note: 'Six real houses with published numbers, turned into figures every scheme has to beat.' },
  { key: 'X', name: 'The alternatives', note: 'Eleven schemes measured by one set of code. X-2xx are the per-scheme dossiers: every level drawn as a real plan, with the checker\'s flags and a separate critic\'s verdict.' },
];

const sheetPngs = ls('out/png').filter(f => f.endsWith('.png') && !f.includes('-crop') && f !== 'xray-systems.png').sort();
const sheets = sheetPngs.map(f => {
  const id = f.slice(0, 5);
  const stem = f.replace(/\.png$/, '');
  const crop = existsSync(resolve(ROOT, `out/png/${stem}-crop.png`)) ? `out/png/${stem}-crop.png` : null;
  const svg = existsSync(resolve(ROOT, `out/drawings/${stem}.svg`)) ? `out/drawings/${stem}.svg` : null;
  let title = TITLES[id];
  if (!title && id.startsWith('X-2')) {
    const m = stem.match(/^X-2\d\d-(s\d+)-([a-z]+)-plans$/);
    title = m ? `${m[2].replace(/^./, c => c.toUpperCase())} — schematic plans` : stem;
  }
  return { id, file: `out/png/${f}`, stem, crop, svg, title: title ?? stem, kb: kb(`out/png/${f}`) };
});

const renders = ls('out/renders').filter(f => f.endsWith('.png')).sort()
  .map(f => ({ file: `out/renders/${f}`, name: f.replace(/\.png$/, '').replace(/[-_]/g, ' ') }));
const schemeShots = ls('out/schemes').filter(f => f.endsWith('.png')).sort()
  .map(f => ({ file: `out/schemes/${f}`, name: f.replace(/\.png$/, '') }));
const docs = ls('docs').filter(f => f.endsWith('.md')).sort();

const grouped = GROUPS.map(g => ({ ...g, items: sheets.filter(s => s.id.startsWith(g.key)) }))
  .filter(g => g.items.length);

const CSS = `
:root{
  --paper:#eceeec; --surface:#fff; --ink:#141a1e; --mid:#59656d; --faint:#94a0a6;
  --rule:#cfd6d5; --accent:#b8562f; --good:#2f7d54;
  --serif:ui-serif,"Iowan Old Style",Palatino,Georgia,serif;
  --mono:ui-monospace,"SF Mono",Menlo,Consolas,monospace;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --paper:#11161a; --surface:#181f24; --ink:#e7edea; --mid:#94a3ab; --faint:#63727a;
  --rule:#2a343a; --accent:#d0713f; --good:#6ec191;
}}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--serif);
  font-size:17px;line-height:1.6;-webkit-text-size-adjust:100%}
img{max-width:100%;display:block}
a{color:var(--accent)}
.wrap{max-width:1080px;margin:0 auto;padding:0 18px}
h1{font-size:clamp(1.9rem,7vw,3.2rem);line-height:1.08;margin:0 0 6px;letter-spacing:-.02em}
h2{font-size:clamp(1.25rem,4.4vw,1.7rem);margin:0 0 4px;letter-spacing:-.01em}
.eyebrow{font-family:var(--mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--mid)}
header{padding:34px 0 18px;border-bottom:1px solid var(--rule)}
.lede{color:var(--mid);max-width:62ch;margin:10px 0 0}
nav#toc{position:sticky;top:0;z-index:20;background:var(--paper);border-bottom:1px solid var(--rule)}
.tocin{display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;padding:9px 18px;max-width:1080px;margin:0 auto}
.tocin::-webkit-scrollbar{display:none}
#toc a{flex:0 0 auto;font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;
  text-decoration:none;color:var(--mid);padding:9px 12px;border-radius:999px;white-space:nowrap;min-height:38px;
  display:flex;align-items:center}
section{padding:30px 0;border-top:1px solid var(--rule);scroll-margin-top:56px}
.count{font-family:var(--mono);font-size:12px;color:var(--good)}
.grid{display:grid;grid-template-columns:1fr;gap:14px;margin-top:16px}
@media(min-width:640px){.grid{grid-template-columns:1fr 1fr}}
@media(min-width:900px){.grid{grid-template-columns:1fr 1fr 1fr}}
.card{background:var(--surface);border:1px solid var(--rule);border-radius:4px;overflow:hidden;
  text-decoration:none;color:inherit;display:block}
.card img{background:#fff;aspect-ratio:3/2;object-fit:cover;object-position:top left}
.card .m{padding:11px 13px 13px}
.card .no{font-family:var(--mono);font-size:11.5px;color:var(--accent);letter-spacing:.1em}
.card h3{font-size:1rem;margin:3px 0 2px;font-weight:600}
.card p{margin:0;font-size:.82rem;color:var(--faint);font-family:var(--mono)}
.note{color:var(--mid);font-size:.92rem;max-width:60ch}
.big{display:block;background:var(--surface);border:1px solid var(--rule);border-left:3px solid var(--accent);
  border-radius:4px;padding:17px 18px;text-decoration:none;color:inherit;margin-top:12px;min-height:56px}
.big b{display:block;font-size:1.05rem}
.big span{color:var(--mid);font-size:.88rem}
footer{padding:34px 0 60px;border-top:1px solid var(--rule);color:var(--mid);font-size:.88rem}
/* ── the viewer: the only way a 3600 px sheet is readable on a phone ── */
#v{position:fixed;inset:0;background:#0d1014;z-index:100;display:none;touch-action:none}
#v.on{display:block}
#v img{position:absolute;transform-origin:0 0;max-width:none}
#vbar{position:fixed;left:0;right:0;bottom:0;z-index:101;display:none;gap:8px;padding:12px;
  background:rgba(13,16,20,.9);backdrop-filter:blur(8px);align-items:center;justify-content:space-between}
#v.on ~ #vbar{display:flex}
#vbar button,#vbar a{background:#1b2127;color:#e9edf2;border:1px solid #2c333d;border-radius:999px;
  padding:11px 16px;font:inherit;font-family:var(--mono);font-size:12px;min-height:44px;text-decoration:none;
  display:flex;align-items:center}
#vname{color:#93a0ae;font-family:var(--mono);font-size:11px;flex:1;overflow:hidden;text-overflow:ellipsis;
  white-space:nowrap;padding-left:4px}
`;

const card = (href, img, no, title, meta) => `<a class="card" href="${esc(href)}" data-full="${esc(img)}" data-name="${esc(no + ' ' + title)}">
  <img src="${esc(img)}" alt="${esc(title)}" loading="lazy">
  <span class="m"><span class="no">${esc(no)}</span><h3>${esc(title)}</h3><p>${esc(meta)}</p></span>
</a>`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Henry House — the whole package</title>
<style>${CSS}</style>
</head>
<body>
<header><div class="wrap">
  <div class="eyebrow">Schematic design · not for construction</div>
  <h1>Henry House</h1>
  <div class="eyebrow">Johnson County, Tennessee · 30% slope · 2,364 ft</div>
  <p style="margin:18px 0 0"><a href="issue-for-review.html" style="display:inline-block;border:2px solid currentColor;padding:11px 16px;text-decoration:none;font-weight:700;letter-spacing:.04em">ISSUE FOR REVIEW &rarr;</a>
  <span style="display:block;margin-top:8px;opacity:.7;font-size:13px">The package for surveyors, engineers and builders &mdash; what is decided, what is not, and the eight questions that unblock the rest.</span></p>
  <p class="lede">Everything in the package, in one index. <b>${sheets.length} drawing sheets</b>,
  ${renders.length} renders of the house, ${schemeShots.length} scheme renders and ${docs.length} written documents.
  Tap any sheet to open it full screen — pinch to zoom, double-tap for 100%. A 36 × 24 inch sheet
  shrunk to a phone is not a drawing you can read, so it opens in a viewer instead.</p>
</div></header>
<nav id="toc"><div class="tocin">
  <a href="#walk">Walk</a>${grouped.map(g => `<a href="#g${g.key}">${esc(g.name.split('—')[0].trim())}</a>`).join('')}<a href="#renders">Renders</a><a href="#schemes">Schemes</a><a href="#docs">Written</a>
</div></nav>
<div class="wrap">

<section id="walk">
  <div class="eyebrow">Live 3D</div>
  <h2>Walk through it</h2>
  <p class="note">Drag to turn, pinch to zoom. The menu is behind the button at the bottom left on a phone.</p>
  <a class="big" href="web/gallery.html"><b>The houses, one at a time →</b><span>Built for a phone: Next for the next house, one button for its blueprint. No menu.</span></a>
  <a class="big" href="web/walk.html"><b>The house →</b><span>The current design, with X-ray views of the plumbing, ducts and wiring.</span></a>
  <a class="big" href="web/walk-schemes.html"><b>The alternatives →</b><span>Eleven schemes, each with jump-to points taken from its own checked plan.</span></a>
</section>

${grouped.map(g => `<section id="g${g.key}">
  <div class="eyebrow">${esc(g.key)} sheets <span class="count">${g.items.length}</span></div>
  <h2>${esc(g.name)}</h2>
  <p class="note">${esc(g.note)}</p>
  <div class="grid">
    ${g.items.map(s => card(s.file, s.crop ?? s.file, s.id, s.title, `${s.kb} kB${s.svg ? ' · SVG available' : ''}`)).join('\n    ')}
  </div>
</section>`).join('\n')}

<section id="renders">
  <div class="eyebrow">Renders <span class="count">${renders.length}</span></div>
  <h2>What it looks like</h2>
  <p class="note">Generated from the same model as the drawings, so a window in a render is a window in a plan.</p>
  <div class="grid">
    ${renders.map(r => card(r.file, r.file, '', r.name, '')).join('\n    ')}
  </div>
</section>

<section id="schemes">
  <div class="eyebrow">Scheme renders <span class="count">${schemeShots.length}</span></div>
  <h2>The alternatives, from one camera</h2>
  <p class="note">The <b>compare</b> shot uses one identical camera for every scheme, so this is a comparison and not a
  beauty contest — a small house is small in frame. <b>hero</b> is framed to each scheme's own size.</p>
  <div class="grid">
    ${schemeShots.map(r => card(r.file, r.file, '', r.name, '')).join('\n    ')}
  </div>
</section>

<section id="docs">
  <div class="eyebrow">Written <span class="count">${docs.length}</span></div>
  <h2>The reasoning</h2>
  <p class="note">What is known, what is assumed for testing, and what must be verified — kept separate on purpose.</p>
  <div class="grid">
    ${docs.map(d => `<a class="card" href="docs/${esc(d)}"><span class="m"><span class="no">${esc(d.split('-')[0])}</span><h3>${esc(d.replace(/^\\d+-/, '').replace(/\\.md$/, '').replace(/-/g, ' '))}</h3><p>markdown</p></span></a>`).join('\n    ')}
  </div>
</section>

<footer><div class="wrap" style="padding:0">
  <p><b>Nothing here is engineered or code-verified, and none of it may be relied on for permitting.</b>
  There is no survey, no soils report, no tested spring and no code text was read. Every drawing, render and
  number is generated from one parametric model, which is why they cannot disagree with each other — it is not
  why they are right.</p>
</div></footer>
</div>

<div id="v"><img id="vimg" alt=""></div>
<div id="vbar">
  <button id="vclose" type="button">Close</button>
  <span id="vname"></span>
  <button id="vfit" type="button">Fit</button>
  <a id="vopen" href="#" target="_blank" rel="noopener">Full</a>
</div>
<script>
(function () {
  var v = document.getElementById('v'), img = document.getElementById('vimg');
  var name = document.getElementById('vname'), open = document.getElementById('vopen');
  var s = 1, tx = 0, ty = 0, natural = 1;

  function apply(){ img.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + s + ')'; }
  function fit(){
    var iw = img.naturalWidth || 1, ih = img.naturalHeight || 1;
    s = Math.min(innerWidth / iw, (innerHeight - 68) / ih);
    natural = s;
    tx = (innerWidth - iw * s) / 2; ty = (innerHeight - 68 - ih * s) / 2;
    apply();
  }
  document.querySelectorAll('.card[data-full]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      img.src = a.getAttribute('data-full');
      open.href = a.getAttribute('href');
      name.textContent = a.getAttribute('data-name');
      v.classList.add('on');
      document.body.style.overflow = 'hidden';
      if (img.complete) fit(); else img.onload = fit;
    });
  });
  document.getElementById('vclose').onclick = function () {
    v.classList.remove('on'); document.body.style.overflow = '';
  };
  document.getElementById('vfit').onclick = fit;
  addEventListener('keydown', function (e) { if (e.key === 'Escape') document.getElementById('vclose').click(); });

  // one finger drags, two fingers pinch — the gestures a phone already knows
  var pts = new Map(), last = null, lastTap = 0;
  v.addEventListener('pointerdown', function (e) { v.setPointerCapture(e.pointerId); pts.set(e.pointerId, e); last = null; });
  v.addEventListener('pointerup', function (e) {
    pts.delete(e.pointerId); last = null;
    var now = Date.now();
    if (now - lastTap < 300) {           // double tap: 100%, or back to fit
      var to = Math.abs(s - natural) < 1e-4 ? 1 : natural;
      tx -= (e.clientX - tx) * (to / s - 1); ty -= (e.clientY - ty) * (to / s - 1);
      s = to; apply();
    }
    lastTap = now;
  });
  v.addEventListener('pointermove', function (e) {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, e);
    var a = [...pts.values()];
    if (a.length === 1) {
      if (last) { tx += e.clientX - last.x; ty += e.clientY - last.y; apply(); }
      last = { x: e.clientX, y: e.clientY };
    } else if (a.length === 2) {
      var d = Math.hypot(a[0].clientX - a[1].clientX, a[0].clientY - a[1].clientY);
      var cx = (a[0].clientX + a[1].clientX) / 2, cy = (a[0].clientY + a[1].clientY) / 2;
      if (last && last.d) {
        var k = d / last.d;
        s *= k; tx = cx - (cx - tx) * k; ty = cy - (cy - ty) * k; apply();
      }
      last = { d: d };
    }
  });
  v.addEventListener('wheel', function (e) {
    e.preventDefault();
    var k = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    s *= k; tx = e.clientX - (e.clientX - tx) * k; ty = e.clientY - (e.clientY - ty) * k; apply();
  }, { passive: false });
  addEventListener('resize', function () { if (v.classList.contains('on')) fit(); });
})();
</script>
</body>
</html>
`;

writeFileSync(resolve(ROOT, 'index.html'), html);
console.log('HENRY HOUSE — repository site\n');
console.log(`  ${sheets.length} sheets, ${renders.length} renders, ${schemeShots.length} scheme renders, ${docs.length} documents`);
for (const g of grouped) console.log(`    ${g.key}  ${String(g.items.length).padStart(2)}  ${g.items.map(i => i.id).join(' ')}`);
console.log(`\n  → index.html  (${Math.round(Buffer.byteLength(html) / 1024)} kB, links files already in the repo)`);
