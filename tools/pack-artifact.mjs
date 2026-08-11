// HENRY HOUSE — pack the whole package into ONE page that needs nothing.
//
// The client's brief for this file, verbatim: "we just want to make it work
// easily for my brother, no complicated run commands, just send link and go."
//
// So: no npm install, no static server, no repository, no build step on the
// far end. One .html containing the renders, the drawing sheets, the numbers,
// the decisions — and the live 3D walkthrough, with three.js and every model
// file inlined. It opens from a link, from a file, from an email attachment.
//
// Images are re-encoded to JPEG through the browser rather than embedded as
// PNG: the render set alone is 24 MB as PNG and about 2 MB as JPEG, and nobody
// is pixel-peeping a 3D preview.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { bundleHtml } from './bundle.mjs';
import { estimate } from '../model/cost.mjs';
import { driveProfile, siteTotals } from '../model/site.mjs';
import { areaSummary } from '../model/geometry.mjs';
import { S4, viabilityGaps } from '../model/vsm.mjs';
import { runGauntlet } from './gauntlet/run.mjs';
const ROOT = fileURLToPath(new URL('../', import.meta.url));
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const RENDERS = [
  ['ext-sse-air.png', 'The downhill face', 'View and winter sun arrive from the same side. That is the whole reason the house is turned to this angle.'],
  ['ext-arrival.png', 'Arrival', 'Garage doors, the apron a car backs into, and the drive coming in from the east.'],
  ['site-aerial.png', 'The house on the hill', 'Built along the contour, not across it — and the 655 ft the drive takes to climb 72 ft.'],
  ['ext-east.png', 'The stepped section', 'Three levels stepping down with the ground.'],
  ['ext-sse-terrace.png', 'From the lower terrace', 'The walkout level, and the stair down from the deck.'],
  ['int-great.png', 'The great room', 'Ceiling falls from 16′-4″ at the back to 9′-10″ at the glass — compression toward the view.'],
];
const SHEETS = [
  ['C-101-site-grading-access.png', 'C-101', 'Site, grading and access', 'The drive, solved: 655 ft, five switchbacks, 11% held. And the earth that has to move.'],
  ['A-101-main-level-plan.png', 'A-101', 'Main level plan', 'Everything essential on one floor. Two entries, two purposes.'],
  ['A-102-lower-upper-plans.png', 'A-102', 'Lower + upper plans', 'The walkout level and the sleeping level.'],
  ['A-201-section-aa.png', 'A-201', 'Section A—A', 'The governing drawing on a steep site: how the house stands on the hill.'],
  ['A-202-sections-longitudinal.png', 'A-202', 'Sections B—B + C—C', 'The long cuts. The whole plan turned on edge.'],
  ['A-301-south-north-elevations.png', 'A-301', 'South + north elevations', 'The view face against the cut face.'],
  ['A-302-east-west-elevations.png', 'A-302', 'East + west + roof plan', 'The ends of the bar, and every plane that sheds water.'],
  ['P-101-water.png', 'P-101', 'Water', 'One pump, home-run branches, and a branch that needs no pump at all.'],
  ['M-101-air.png', 'M-101', 'Ventilation + HVAC', 'The airway is separate from the heating system, exactly as it is in a body.'],
  ['E-101-power.png', 'E-101', 'Electrical + data', 'One brain, home runs, and reflex arcs that work when the brain is offline.'],
  ['G-001-viable-system-and-cost.png', 'G-001', 'The house as a system, and what it costs', 'What the house does before the weather does it — and the first price in the package.'],
  ['X-101-seven-schemes.png', 'X-101', 'Seven schemes, one scale', 'Six alternatives against the current design, drawn at the same scale over the same hill.'],
  ['R-101-reference-bar.png', 'R-101', 'The reference set, as a bar', 'Six real houses with published numbers — turned into figures every scheme has to beat.'],
  ['X-102-proposed-schemes.png', 'X-102', 'Proposed schemes', 'What a parallel fan-out proposed, drawn and measured by the same code as X-101.'],
];
/** The alternatives, rendered from ONE fixed camera so this is a comparison. */
const SCHEME_SHOTS = [
  ['S0-SPINE.png',    'The Spine',    'The current design, and the opponent every alternative is measured against.'],
  ['S1-ARMATURE.png', 'The Armature', 'One roof standing over the slope on day one; two bays enclosed, the rest becomes rooms later.'],
  ['S2-BRIDGE.png',   'The Bridge',   'The structure spans, so the house touches the ground in six places instead of along a wall.'],
  ['S3-NARROW.png',   'The Narrow',   'A body narrow enough to daylight from both sides, with a dogtrot cut through the middle.'],
  ['S4-CORE.png',     'The Core',     'Every expensive, fixed thing in one permanent core. Everything around it is re-plannable.'],
  ['S5-PERCH.png',    'The Perch',    'Refuses the horizontal — small footprint, lifted clear, stacked, one enormous opening downhill.'],
  ['S6-TOWER.png',    'The Tower',    'If the buildable shelf is small, vertical growth is cheaper than long foundations.'],
  ['S7-DATUM.png',    'The Datum',    'One enormous plane, sized for a far larger building. Four square feet of permanently dry hillside for every one heated.'],
  ['S8-WATER.png',    'The Catch',    'The roof is sized in gallons, not rooms — one unbroken plane falling away from the cut to a single tank.'],
];
/** Re-encode a PNG to a JPEG data URI at a target width, through the browser. */
async function jpeg(page, absPath, width, quality) {
  const b64 = readFileSync(absPath).toString('base64');
  return page.evaluate(async ({ b64, width, quality }) => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const w = Math.min(width, img.naturalWidth);
    const h = Math.round((img.naturalHeight / img.naturalWidth) * w);
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const x = c.getContext('2d');
    x.fillStyle = '#fff'; x.fillRect(0, 0, w, h);
    x.drawImage(img, 0, 0, w, h);
    return { uri: c.toDataURL('image/jpeg', quality), w, h };
  }, { b64, width, quality });
}
/** JSON safe to embed inside an inline <script>: escapes </script>, U+2028, U+2029. */
const jsonSafe = (v) => JSON.stringify(v)
  .replace(/</g, '\\u003C')
  .replace(/\u2028/g, '\\u2028')
  .replace(/\u2029/g, '\\u2029');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
/** "THE SPINE" -> "The Spine". The model shouts; the page for Henry should not. */
const titleCase = (s) => String(s).toLowerCase().replace(/(^|\s)(\S)/g, (_, sp, c) => sp + c.toUpperCase());
const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const spell = (n) => WORDS[n] ? WORDS[n][0].toUpperCase() + WORDS[n].slice(1) : String(n);
// ── build ───────────────────────────────────────────────────────────────────
const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setContent('<html><body></body></html>');
console.log('HENRY HOUSE — packing one self-contained page\n');
const renders = [];
for (const [file, title, note] of RENDERS) {
  const p = resolve(ROOT, 'out/renders', file);
  if (!existsSync(p)) { console.log(`  ! missing render ${file}`); continue; }
  const r = await jpeg(page, p, 1500, 0.76);
  renders.push({ title, note, ...r });
  console.log(`  ✓ ${file.padEnd(26)} ${(r.uri.length / 1024).toFixed(0)} kB`);
}
const sheets = [];
for (const [file, no, title, note] of SHEETS) {
  const p = resolve(ROOT, 'out/png', file);
  if (!existsSync(p)) { console.log(`  ! missing sheet ${file}`); continue; }
  const thumb = await jpeg(page, p, 900, 0.72);
  const full = await jpeg(page, p, 2600, 0.78);
  sheets.push({ no, title, note, thumb: thumb.uri, full: full.uri, w: thumb.w, h: thumb.h });
  console.log(`  ✓ ${no.padEnd(8)} ${((thumb.uri.length + full.uri.length) / 1024).toFixed(0)} kB`);
}
const shots = [];
for (const [file, title, note] of SCHEME_SHOTS) {
  const p = resolve(ROOT, 'out/schemes', file);
  if (!existsSync(p)) { console.log(`  ! missing scheme render ${file}`); continue; }
  const r = await jpeg(page, p, 1100, 0.74);
  shots.push({ id: file.replace('.png', ''), title, note, ...r });
  console.log(`  ✓ ${file.padEnd(26)} ${(r.uri.length / 1024).toFixed(0)} kB`);
}
await browser.close();
const walk = bundleHtml('web/walk.html').html;
console.log(`  ✓ walkthrough  ${(walk.length / 1024 / 1024).toFixed(2)} MB inlined\n`);
const est = estimate();
const drive = driveProfile();
const totals = siteTotals();
const A = areaSummary();
const gaunt = runGauntlet();
const html = renderPage({ renders, sheets, shots, gaunt, walk, est, drive, totals, A });
mkdirSync(resolve(ROOT, 'out/artifact'), { recursive: true });
const out = resolve(ROOT, 'out/artifact/henry-house.html');
writeFileSync(out, html);
console.log(`  → out/artifact/henry-house.html   ${(Buffer.byteLength(html) / 1024 / 1024).toFixed(2)} MB`);
if (Buffer.byteLength(html) > 15.5 * 1024 * 1024) console.log('  ! over the 16 MB artifact limit — drop image quality');
// ── the page ────────────────────────────────────────────────────────────────
function renderPage({ renders, sheets, shots, gaunt, walk, est, drive, totals, A }) {
  const hero = renders[0];
  // Written from the gauntlet rather than typed, so the copy cannot claim
  // "six other houses" once a ninth lands, or claim a clean sweep once one of
  // them stops beating the opponent.
  const rivals = gaunt.ranked.length - 1;
  const beatenByAll = gaunt.ranked.every(r => !r.ab || r.ab.verdict === 'WIN');
  const others = gaunt.ranked.filter(r => r.scheme.id !== gaunt.opponent.scheme.id);
  const cheapest = others.reduce((a, r) => (r.cost.total < a.cost.total ? r : a));
  // Which critic the set is WORST at, found rather than named. This paragraph
  // used to assert that phasing was the one almost nothing passed. It was true
  // of the original seven and stopped being true the moment two schemes built
  // around phasing arrived — so the page now reads the answer off the results.
  const CRITIC_NOTE = {
    PHASING: ['One reference house dimensions its rear porch so that it can later become a bedroom.',
      'Does Henry need all of it on day one, or does he need the part he builds first to be the part that never has to be undone?'],
    SCALE: ['The largest house in the reference product line holds three bedrooms and two baths in 1,364 sf.',
      'Does Henry need 3,747 sf at all? That is a question for Henry, not for the model, and everything else here is downstream of it.'],
    SITE: ['Every cubic yard cut here has to go somewhere, on a site already carrying 5,845 with nowhere designed to put them.',
      'Is it worth choosing the house that barely touches the hill, before a soils report tells you what the hill will tolerate?'],
    MAINTENANCE: ['Every roof junction is flashing, snow, ice and a future leak.',
      'At 3,400 ft, how many junctions is a view worth?'],
    ENVELOPE: ['Exterior wall is envelope, insulation, cladding, flashing and heat loss — forever.',
      'How square can Henry stand to be, given every foot of wall is paid for twice: once to build and again every winter?'],
    SYSTEMS: ['Concentrated plumbing is the single largest transferable lesson in the reference set.',
      'Is there a version of this house where every pipe lives in one wall you could point at?'],
    GENEROSITY: ['A small house still has to be generous rather than merely small.',
      'Which rooms are actually big enough to be worth building, and which are only on the plan because plans have them?'],
    SHELTER: ['Roofed outdoor room is the cheapest square footage on the site.',
      'How much of what Henry wants could be roofed and open rather than heated and enclosed?'],
  };
  const hardest = Object.keys(gaunt.ranked[0].verdicts)
    .map(k => ({ name: k, wins: gaunt.ranked.filter(r => r.verdicts[k].verdict === 'WIN').length,
                 line: CRITIC_NOTE[k]?.[0] ?? '', ask: CRITIC_NOTE[k]?.[1] ?? '' }))
    .sort((a, b) => a.wins - b.wins)[0];
  const decisions = [
    ['The driveway is 1% too steep for a fire truck',
     `It holds <b>11%</b> over 655 ft with five switchbacks. Fire apparatus access provisions commonly cap grade at <b>10%</b> and ask for 20 ft of width. Flattening it to 10% makes the drive about 720 ft and costs more earthwork. The alternative is a sprinkler system and a variance from the fire marshal.`,
     `This is the one to settle first, and to settle in a room with the fire marshal. Everything else on the site plan is downstream of it.`],
    ['There is nowhere to put ${SPOIL} of earth',
     `Cutting the building pad and benching the drive produces about <b>${totals.netCY.toLocaleString()} cubic yards</b> more than the site can absorb — roughly <b>${totals.truckloads} truckloads</b> down a mountain road. Spreading it on a 30% slope instead is how mountain fills fail.`,
     `Either a geotechnical engineer finds places to put it on site, or the budget carries hauling it away. Nobody can answer this without a soils report.`],
    ['You cross nine feet of outdoors to get from the car to the kitchen',
     `The garage is detached, joined by a covered but unheated breezeway. Detaching it genuinely removes the carbon monoxide and fire problems. It also means that on the worst night of the year you cross it carrying groceries, a sleeping child, or a medical bag.`,
     `Enclosing it costs the fire separation. Keeping it costs comfort on exactly the nights this house was designed for. I picked one; you should decide it.`],
  ];
  const unknowns = [
    ['No survey', 'Every contour, grade and elevation is a proposition on an assumed 30% slope. A real survey changes all of them — but the same code then produces real answers.'],
    ['The spring has never been tested', 'No yield test, no water quality test, no confirmed legal right to it. It is the one resource the house cannot buy back quickly.'],
    ['No soil evaluation', 'Which decides the septic system, the retaining walls, and whether the cut behind the motor court will stand up at all.'],
    ['No code text was read', 'This container has no internet. Every code reference in the package is marked with how strongly it is held. Nothing here may be relied on for permitting.'],
    ['Nothing is engineered', 'Members are sized, not designed. A licensed structural engineer, and an MEP engineer, must redo all of it.'],
  ];
  return `<title>Henry House — Watauga County, North Carolina</title>
<style>
:root{
  --paper:#eceeec; --surface:#ffffff; --sunken:#e2e5e3;
  --ink:#141a1e; --mid:#59656d; --faint:#94a0a6; --rule:#cfd6d5;
  --accent:#b8562f; --earth:#8a6508; --alarm:#a83232; --cool:#1d6fa5; --good:#2f7d54;
  --shadow:0 1px 2px rgba(20,26,30,.06), 0 8px 30px rgba(20,26,30,.07);
  --serif:ui-serif,"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;
  --mono:ui-monospace,"SF Mono",Menlo,Consolas,"Liberation Mono",monospace;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --paper:#11161a; --surface:#181f24; --sunken:#0d1215;
  --ink:#e7edea; --mid:#94a3ab; --faint:#63727a; --rule:#2a343a;
  --accent:#d0713f; --earth:#c39b2e; --alarm:#d15b56; --cool:#5aa5d8; --good:#6ec191;
  --shadow:0 1px 2px rgba(0,0,0,.4), 0 10px 34px rgba(0,0,0,.36);
}}
:root[data-theme="dark"]{
  --paper:#11161a; --surface:#181f24; --sunken:#0d1215;
  --ink:#e7edea; --mid:#94a3ab; --faint:#63727a; --rule:#2a343a;
  --accent:#d0713f; --earth:#c39b2e; --alarm:#d15b56; --cool:#5aa5d8; --good:#6ec191;
  --shadow:0 1px 2px rgba(0,0,0,.4), 0 10px 34px rgba(0,0,0,.36);
}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);
  font-family:var(--serif);font-size:17px;line-height:1.62;
  -webkit-font-smoothing:antialiased}
img{max-width:100%;display:block}
h1,h2,h3{text-wrap:balance;margin:0;line-height:1.15;font-weight:600}
p{margin:0}
a{color:var(--accent)}
.wrap{max-width:1180px;margin:0 auto;padding:0 28px}
.col{max-width:66ch}
.eyebrow{font-family:var(--mono);font-size:11.5px;letter-spacing:.16em;
  text-transform:uppercase;color:var(--mid)}
.sheetno{font-family:var(--mono);font-size:12px;letter-spacing:.12em;color:var(--accent)}
/* ── hero ─────────────────────────────────────────────────────────── */
.hero{position:relative;min-height:min(86vh,760px);display:flex;align-items:flex-end;
  overflow:hidden;background:var(--sunken)}
.hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:62% 54%}
.hero .veil{position:absolute;inset:0;
  background:linear-gradient(to top,rgba(6,10,12,.92) 0%,rgba(6,10,12,.44) 44%,rgba(6,10,12,.04) 74%,rgba(6,10,12,.24) 100%)}
.hero .inner{position:relative;padding:0 28px 54px;width:100%;max-width:1180px;margin:0 auto;color:#f2f5f3}
.hero h1{font-size:clamp(2.6rem,6.4vw,5rem);letter-spacing:-.02em;margin-bottom:10px}
.hero .sub{font-size:clamp(1rem,1.7vw,1.28rem);color:#d3dcd8;max-width:52ch}
.hero .place{color:#b9c6c1;margin-bottom:20px}
.cta{display:inline-flex;align-items:center;gap:10px;margin-top:26px;
  font-family:var(--mono);font-size:13px;letter-spacing:.1em;text-transform:uppercase;
  background:var(--accent);color:#fff;border:0;padding:15px 26px;border-radius:2px;
  cursor:pointer;transition:transform .18s ease,filter .18s ease}
.cta:hover{filter:brightness(1.08)}
.cta:active{transform:translateY(1px)}
.cta:focus-visible{outline:3px solid #fff;outline-offset:3px}
/* ── sections ─────────────────────────────────────────────────────── */
section{padding:76px 0;border-top:1px solid var(--rule)}
section:first-of-type{border-top:0}
.head{display:flex;flex-direction:column;gap:8px;margin-bottom:34px}
.head h2{font-size:clamp(1.6rem,3vw,2.3rem);letter-spacing:-.015em}
.lede{color:var(--mid);max-width:62ch}
.stack{display:flex;flex-direction:column;gap:20px}
/* ── walkthrough ──────────────────────────────────────────────────── */
#walkwrap{background:var(--sunken);border:1px solid var(--rule);border-radius:3px;
  overflow:hidden;box-shadow:var(--shadow)}
#walkwrap iframe{width:100%;height:min(78vh,780px);border:0;display:block;background:#0e1114}
.placeholder{display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:16px;min-height:min(58vh,520px);text-align:center;padding:40px 28px;color:var(--mid)}
.placeholder .cta{margin-top:4px}
/* ── galleries ────────────────────────────────────────────────────── */
.renders{display:grid;grid-template-columns:repeat(auto-fit,minmax(360px,1fr));gap:26px}
.card{background:var(--surface);border:1px solid var(--rule);border-radius:3px;
  overflow:hidden;box-shadow:var(--shadow)}
.card .meta{padding:16px 18px 18px}
.card h3{font-size:1.06rem;margin-bottom:5px}
.card p{font-size:.9rem;color:var(--mid);line-height:1.5}
.sheets{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:22px}
.sheet{background:var(--surface);border:1px solid var(--rule);border-radius:3px;
  overflow:hidden;box-shadow:var(--shadow);cursor:zoom-in;padding:0;text-align:left;
  font:inherit;color:inherit;display:block;width:100%}
.sheet img{background:#fff}
.sheet .meta{padding:14px 16px 16px;display:flex;flex-direction:column;gap:5px}
.sheet h3{font-size:1rem}
.sheet p{font-size:.86rem;color:var(--mid);line-height:1.45}
.sheet:hover{border-color:var(--accent)}
.sheet:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
/* ── numbers ──────────────────────────────────────────────────────── */
.figures{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:1px;
  background:var(--rule);border:1px solid var(--rule);border-radius:3px;overflow:hidden}
.fig{background:var(--surface);padding:22px 20px;display:flex;flex-direction:column;gap:6px}
.fig .n{font-family:var(--mono);font-size:1.5rem;letter-spacing:-.02em;
  font-variant-numeric:tabular-nums}
.fig .k{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--mid)}
.fig .d{font-size:.86rem;color:var(--mid);line-height:1.45}
.moneyband{margin-top:26px;background:var(--surface);border:1px solid var(--rule);
  border-left:3px solid var(--accent);border-radius:3px;padding:26px 26px 24px}
.moneyband .n{font-family:var(--mono);font-size:clamp(1.5rem,3.6vw,2.3rem);
  letter-spacing:-.02em;font-variant-numeric:tabular-nums}
/* ── decisions ────────────────────────────────────────────────────── */
.decision{background:var(--surface);border:1px solid var(--rule);border-radius:3px;
  padding:26px 28px;display:flex;flex-direction:column;gap:12px;box-shadow:var(--shadow)}
.decision h3{font-size:1.22rem;color:var(--alarm)}
.decision .body{color:var(--ink)}
.decision .ask{font-size:.94rem;color:var(--mid);border-top:1px solid var(--rule);padding-top:12px}
.unknowns{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
.unknown{border-top:2px solid var(--earth);padding-top:14px;display:flex;flex-direction:column;gap:6px}
.unknown h3{font-size:1rem}
.unknown p{font-size:.9rem;color:var(--mid);line-height:1.5}
/* ── the alternatives ─────────────────────────────────────────────── */
.shots{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px}
.shot{background:var(--surface);border:1px solid var(--rule);border-radius:3px;
  overflow:hidden;box-shadow:var(--shadow)}
.shot.opp{border-color:var(--accent);border-width:1px;box-shadow:0 0 0 1px var(--accent),var(--shadow)}
.shot .meta{padding:14px 16px 16px;display:flex;flex-direction:column;gap:5px}
.shot h3{font-size:1rem}
.shot p{font-size:.86rem;color:var(--mid);line-height:1.45}
.shot .badge{font-family:var(--mono);font-size:10.5px;letter-spacing:.13em;
  text-transform:uppercase;color:var(--accent)}
.tablewrap{overflow-x:auto;border:1px solid var(--rule);border-radius:3px;background:var(--surface);
  box-shadow:var(--shadow);margin-top:28px}
table.rank{border-collapse:collapse;width:100%;min-width:560px;font-size:.92rem}
table.rank th,table.rank td{padding:12px 16px;text-align:right;border-bottom:1px solid var(--rule);
  font-variant-numeric:tabular-nums;font-family:var(--mono)}
table.rank th{font-size:11px;letter-spacing:.13em;text-transform:uppercase;color:var(--mid);font-weight:400}
table.rank td:first-child,table.rank th:first-child{text-align:left;font-family:var(--serif);font-size:1rem}
table.rank tr:last-child td{border-bottom:0}
table.rank tr.opp td{color:var(--accent)}
table.rank tr.opp td:first-child{font-weight:600}
.win{color:var(--good)}
/* ── lightbox ─────────────────────────────────────────────────────── */
dialog{border:0;padding:0;max-width:98vw;max-height:98vh;background:transparent}
dialog::backdrop{background:rgba(8,12,14,.9)}
dialog img{max-width:98vw;max-height:92vh;object-fit:contain;box-shadow:0 20px 60px rgba(0,0,0,.5)}
dialog .close{position:fixed;top:18px;right:20px;font-family:var(--mono);font-size:12px;
  letter-spacing:.12em;background:#fff;color:#111;border:0;padding:10px 16px;border-radius:2px;cursor:pointer}
footer{padding:56px 0 72px;border-top:1px solid var(--rule);color:var(--mid);font-size:.9rem}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
@media (max-width:640px){body{font-size:16px}.wrap{padding:0 20px}.hero .inner{padding:0 20px 40px}section{padding:56px 0}}
</style>
<div class="hero">
  <img src="${hero.uri}" alt="Henry House seen from below the downhill face">
  <div class="veil"></div>
  <div class="inner">
    <div class="eyebrow" style="color:#c3cfca">Schematic design · not for construction</div>
    <h1>Henry House</h1>
    <div class="place eyebrow">Watauga County, North Carolina · 30% slope · 3,400 ft</div>
    <p class="sub">A house built along the contour instead of across it, so the hill does half the excavation and the lower floor comes nearly free. Every drawing, render and number on this page is generated from one model — which is why they cannot disagree with each other.</p>
    <button class="cta" id="go">Walk through the house →</button>
  </div>
</div>
<div class="wrap">
<section id="walk">
  <div class="head">
    <div class="sheetno">Live 3D</div>
    <h2>Walk through it</h2>
    <p class="lede">Drag to turn, scroll to zoom. Or switch to <b>Walk</b> and use W A S D to move through the rooms. The jump-to buttons on the left put you in a specific place; the X-ray views strip the walls off and show the plumbing, ducts and wiring running through the house.</p>
  </div>
  <div id="walkwrap">
    <div class="placeholder" id="ph">
      <div class="eyebrow">The 3D model is about 1.6 MB and builds when you ask for it</div>
      <button class="cta" id="go2">Load the walkthrough</button>
    </div>
  </div>
</section>
<section>
  <div class="head">
    <div class="sheetno">The idea</div>
    <h2>Why it is shaped like this</h2>
  </div>
  <div class="stack col">
    <p>On a slope this steep the usual move is to cut a flat pad and put a house on it, which means a tall retaining wall, a lot of hauled earth, and a building that sits on the hill rather than in it. This one runs <b>along</b> the contour as a single 72 ft bar. The cut stays one consistent depth, and the wall holding it back is the same wall that carries the roof — one element doing four jobs instead of two elements paying twice.</p>
    <p>Because the ground falls away, the lower level is almost free floor area: the hill already removed the earth, and the wall retaining it had to exist anyway. That is the single largest reason the house steps down through three levels instead of sitting on one pad.</p>
    <p>All the glass is on the downhill wall, because the view and the winter sun arrive from the same side. The uphill wall is nearly solid — it is the cold side, the cut side and the service side. Every bathroom, every pipe, every duct and both vertical chases live in an 11 ft band along that wall, so nothing wet ever runs in an exterior wall. At this elevation that is a freeze rule, not a preference.</p>
  </div>
</section>
<section>
  <div class="head">
    <div class="sheetno">Renders</div>
    <h2>What it looks like</h2>
    <p class="lede">Generated from the same model as the drawings, so a window in a render is a window in a plan.</p>
  </div>
  <div class="renders">
    ${renders.map(r => `<figure class="card" style="margin:0">
      <img src="${r.uri}" alt="${esc(r.title)}" loading="lazy">
      <figcaption class="meta"><h3>${esc(r.title)}</h3><p>${esc(r.note)}</p></figcaption>
    </figure>`).join('\n    ')}
  </div>
</section>
<section>
  <div class="head">
    <div class="sheetno">The set</div>
    <h2>The drawings</h2>
    <p class="lede">Click any sheet to read it full size. Eleven sheets, all generated — plans, sections, elevations, the site and grading plan, and the systems.</p>
  </div>
  <div class="sheets">
    ${sheets.map((s, i) => `<button class="sheet" data-i="${i}" aria-label="Open ${esc(s.no)} ${esc(s.title)} full size">
      <img src="${s.thumb}" alt="${esc(s.no)} ${esc(s.title)}" loading="lazy">
      <span class="meta"><span class="sheetno">${esc(s.no)}</span><h3>${esc(s.title)}</h3><p>${esc(s.note)}</p></span>
    </button>`).join('\n    ')}
  </div>
</section>
<section>
  <div class="head">
    <div class="sheetno">The numbers</div>
    <h2>What it is, and what it costs</h2>
    <p class="lede">Quantities are measured off the model. The prices are not — no supplier, no cost database and no local bid was consulted, because the machine that produced this has no internet. Trust the quantities, replace the money.</p>
  </div>
  <div class="figures">
    <div class="fig"><div class="k">Heated area</div><div class="n">${(A.L0.gross + A.L1.gross + A.L2.gross + A.LINK.gross).toLocaleString()} sf</div><div class="d">Three levels plus the mudroom link. Garage is another ${A.GARAGE.gross} sf, unheated.</div></div>
    <div class="fig"><div class="k">Driveway</div><div class="n">${drive.lengthFt} ft</div><div class="d">Five switchbacks climbing ${drive.totalRiseFt} ft, holding ${drive.maxGradePct}% the whole way.</div></div>
    <div class="fig"><div class="k">Earth to move</div><div class="n">${totals.netCY.toLocaleString()} CY</div><div class="d">About ${totals.truckloads} truckloads with nowhere designed to put it.</div></div>
    <div class="fig"><div class="k">Ground disturbed</div><div class="n">${totals.disturbedAcres} ac</div><div class="d">Over the one-acre line that commonly triggers an erosion control permit.</div></div>
  </div>
  <div class="moneyband">
    <div class="k eyebrow">Project range, everything in</div>
    <div class="n">${money(est.total.lo)} — ${money(est.total.hi)}</div>
    <p class="d" style="color:var(--mid);margin-top:8px;max-width:64ch">Construction, plus 15% contingency, plus 12% for design, engineering, survey, geotechnical work and permits. That is <b>${money(est.perSf.lo)}–${money(est.perSf.hi)} per square foot</b>. Earthwork, spoil, driveway and erosion control alone account for about a fifth of construction cost before a single wall is framed — on steep land the site is a wing of the house you cannot see.</p>
  </div>
</section>
<section>
  <div class="head">
    <div class="sheetno">The alternatives</div>
    <h2>${spell(rivals)} other ${rivals === 1 ? 'house' : 'houses'}, and the one above ${beatenByAll ? 'losing to all of them' : 'measured against them'}</h2>
    <p class="lede">The house you have been looking at is <b>${gaunt.opponent.m.conditionedSf.toLocaleString()} sf</b>. Before defending that, it is worth seeing it beaten. Each of these was built in the same model, on the same hill, and photographed from the same camera — so this is a comparison, not a beauty contest between whichever one got the better light.</p>
  </div>
  <div class="shots">
    ${shots.map(s => `<figure class="shot${s.id === 'S0-SPINE' ? ' opp' : ''}" style="margin:0">
      <img src="${s.uri}" alt="${esc(s.title)}" loading="lazy">
      <figcaption class="meta">${s.id === 'S0-SPINE' ? '<span class="badge">The design above</span>' : ''}<h3>${esc(s.title)}</h3><p>${esc(s.note)}</p></figcaption>
    </figure>`).join('\n    ')}
  </div>
  <div class="tablewrap">
    <table class="rank">
      <thead><tr><th>Scheme</th><th>Heated</th><th>Exterior wall</th><th>Earth moved</th><th>Building cost</th><th>Critics won</th></tr></thead>
      <tbody>
        ${gaunt.ranked.map(r => `<tr${r.scheme.id === 'S0-SPINE' ? ' class="opp"' : ''}>
          <td>${esc(titleCase(r.scheme.name))}</td>
          <td>${r.m.conditionedSf.toLocaleString()} sf</td>
          <td>${r.m.perimeterLf} lf</td>
          <td>${r.m.cutCY.toLocaleString()} CY</td>
          <td>${money(r.cost.total)}</td>
          <td class="${r.wins >= 5 ? 'win' : ''}">${r.wins} of 8</td>
        </tr>`).join('\n        ')}
      </tbody>
    </table>
  </div>
  <div class="stack col" style="margin-top:28px">
    <p>Eight critics score every scheme, and none of them reads a word of argument — each is a function of a measured quantity. The figures they judge against are not opinions either: they are computed from six real houses with published numbers, on sheet <b>R-101</b>. The best envelope efficiency in that set belongs to a 1,364 sf three-bedroom house.</p>
    <p>The current design wins ${WORDS[gaunt.opponent.wins] ?? gaunt.opponent.wins} of them, and both are worth keeping: a very cheap envelope for its size, and by far the most room per bedroom. The other ${WORDS[8 - gaunt.opponent.wins] ?? (8 - gaunt.opponent.wins)} say the same thing back — it is a large house, and largeness is what it is paying for. It costs <b>${money(gaunt.opponent.cost.total)}</b> against <b>${money(cheapest.cost.total)}</b> for ${esc(titleCase(cheapest.scheme.name))}, at a competitive <b>${money(gaunt.opponent.cost.perSf)} per square foot</b> — it is not badly built, it is big.</p>
    <p><b>The critic fewest schemes pass is ${esc(hardest.name.toLowerCase())} — ${WORDS[hardest.wins] ?? hardest.wins} of ${WORDS[gaunt.ranked.length] ?? gaunt.ranked.length}.</b> ${hardest.line} That is the question worth putting to you before any of this is drawn further: ${esc(hardest.ask)}</p>
    <p style="font-size:.9rem;color:var(--mid)">Cost here is the <b>building only</b> — no drive, motor court, septic, water, standby power, mechanical or soft costs, because every scheme carries the same ones. The rates are placeholders. <b>The ranking is the output, not the totals.</b></p>
  </div>
</section>
<section>
  <div class="head">
    <div class="sheetno">Yours to call</div>
    <h2>Three things only you can decide</h2>
    <p class="lede">Everything else in this package is a proposition I can defend. These three are trades, and picking one costs something real either way.</p>
  </div>
  <div class="stack">
    ${decisions.map(([t, b, ask]) => `<div class="decision">
      <h3>${t.replace('${SPOIL}', totals.netCY.toLocaleString() + ' cubic yards')}</h3>
      <p class="body">${b}</p>
      <p class="ask">${ask}</p>
    </div>`).join('\n    ')}
  </div>
</section>
<section>
  <div class="head">
    <div class="sheetno">Honestly</div>
    <h2>What is not known</h2>
    <p class="lede">This is a design, not a permit set. The gap between the two is mostly information nobody has collected yet.</p>
  </div>
  <div class="unknowns">
    ${unknowns.map(([t, d]) => `<div class="unknown"><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join('\n    ')}
  </div>
</section>
<footer>
  <div class="col">
    <p><b>Henry House</b> — schematic design. Every plan, section, elevation, render, quantity and check on this page derives from one parametric model, so a drawing and a render cannot disagree about where a toilet is. Nothing here is engineered or code-verified, and none of it may be relied on for permitting.</p>
  </div>
</footer>
</div>
<dialog id="lb"><button class="close" id="lbclose">Close ✕</button><img id="lbimg" alt=""></dialog>
<script>
(function () {
  var FULL = ${jsonSafe(sheets.map(s => ({ src: s.full, alt: s.no + ' ' + s.title })))};
  var lb = document.getElementById('lb'), lbimg = document.getElementById('lbimg');
  document.querySelectorAll('.sheet').forEach(function (b) {
    b.addEventListener('click', function () {
      var s = FULL[+b.dataset.i];
      lbimg.src = s.src; lbimg.alt = s.alt; lb.showModal();
    });
  });
  document.getElementById('lbclose').addEventListener('click', function () { lb.close(); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  // The walkthrough is a complete page of its own; it runs in an iframe so its
  // layout and this page's layout cannot fight over the viewport.
  // The walkthrough page rides as an escaped JSON string rather than a
  // text/plain block. A block would have to sit after this script to be
  // parsed, so getElementById would return null right here — and escaping the
  // closing script tags inside it would corrupt the HTML handed to srcdoc.
  // (Writing that tag literally in this comment closed this script early once.
  //  Inline scripts end at the first closing tag, comments included.)
  var WALK = ${jsonSafe(walk)};
  var loaded = false;
  function load() {
    if (loaded) return; loaded = true;
    var wrap = document.getElementById('walkwrap');
    wrap.innerHTML = '';
    var f = document.createElement('iframe');
    f.setAttribute('title', 'Henry House 3D walkthrough');
    f.srcdoc = WALK;
    wrap.appendChild(f);
    // If the 3D never draws — a strict host policy can block the module loader
    // — say so plainly and point at the file that always works, rather than
    // leaving a black rectangle and no explanation.
    setTimeout(function () {
      var d = f.contentDocument, c = d && d.querySelector('canvas');
      if (c && c.width > 200) return;
      wrap.innerHTML = '<div class="placeholder"><div class="eyebrow" style="color:var(--alarm)">'
        + 'The 3D could not start in this viewer</div>'
        + '<p style="max-width:46ch">Everything else on this page works. For the walkthrough, open '
        + '<b>henry-house.html</b> directly &mdash; downloaded, double-clicked, no internet needed.</p></div>';
    }, 25000);
    document.getElementById('walk').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  document.getElementById('go').addEventListener('click', load);
  document.getElementById('go2').addEventListener('click', load);
})();
</script>
`;
}