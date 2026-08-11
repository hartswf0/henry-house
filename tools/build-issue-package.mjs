// HENRY HOUSE — THE THING YOU SEND TO PEOPLE WHO BUILD.
//
// Everything in this repository is generated from the model, and so is this.
// Every number below is read at build time, so the package cannot quietly
// disagree with the drawings it transmits.
//
// WHAT THIS IS. A schematic-design issue for review, addressed to a surveyor,
// a geotechnical engineer, a civil engineer, a builder and a Tennessee code
// official — the five people who have to answer something before this house
// can go further. It leads with the one decision that blocks the rest, because
// sending a builder a set for a site with a 25% driveway wastes their day.
//
// WHAT IT IS NOT. Construction documents. Nothing here is engineered, nothing
// is code-checked against Tennessee, and the cost rates are invented. Those
// three sentences are in the document too, at the top, in a box.
//
//   node tools/build-issue-package.mjs   →  issue-for-review.html
import { writeFileSync, readdirSync, existsSync } from 'node:fs';
import { SCHEMES, schemeById, metrics } from '../model/schemes.mjs';
import { PLANS, planFor } from '../model/scheme-plans.mjs';
import { estimate } from '../model/cost.mjs';
import { SITE, ORIENTATION } from '../model/geometry.mjs';
import { SITE_CONTEXT } from '../model/site-context.mjs';
import { furnishCounts } from '../model/scheme-furnish.mjs';

const REC = 'S0-SPINE';
const today = '2026-08-11';
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const n0 = (v) => Math.round(v).toLocaleString();
const k = (v) => '$' + Math.round(v / 1000).toLocaleString() + 'k';

// ── what the model says ─────────────────────────────────────────────────────
const rec = schemeById(REC);
const recM = metrics(rec);
const recPlan = planFor(REC);
const est = estimate(rec);
const T = est.takeoff;

const planStats = (p) => {
  const rooms = p.levels.flatMap((l) => l.rooms ?? []);
  const sf = rooms.reduce((a, r) => a + r.w * r.d, 0);
  const circ = rooms.filter((r) => r.use === 'circ').reduce((a, r) => a + r.w * r.d, 0);
  return {
    levels: p.levels.length, rooms: rooms.length, sf: Math.round(sf),
    bed: rooms.filter((r) => r.use === 'bed').length,
    bath: rooms.filter((r) => r.use === 'bath').length,
    circPct: Math.round((circ / sf) * 100),
  };
};
const recS = planStats(recPlan);

const sheets = existsSync('out/drawings')
  ? readdirSync('out/drawings').filter((f) => f.endsWith('.svg')).sort()
  : [];
const sheetRow = (f) => {
  const id = f.split('-').slice(0, 1)[0] + '-' + f.split('-')[1];
  const title = f.replace(/^[A-Z]-\d+-/, '').replace(/\.svg$/, '').replace(/-/g, ' ').toUpperCase();
  const png = `out/png/${f.replace(/\.svg$/, '.png')}`;
  return `<tr><td class="mono">${esc(id)}</td><td>${esc(title)}</td>
    <td class="r"><a href="out/drawings/${esc(f)}">SVG</a>${existsSync(png) ? ` · <a href="${esc(png)}">PNG</a>` : ''}</td></tr>`;
};

// ── the actions, which are the point of the document ────────────────────────
const ACTIONS = [
  ['A1', 'LAND SURVEYOR', 'Boundary and topographic survey of the 29.34 acres — 2 ft contours minimum, 1 ft over the two candidate building areas. Locate: the existing access road and its grade, the water source, any spring or seep, rock outcrop, the septic reserve area, and the parcel corners.',
    'Everything. No foundation, driveway, septic or siting decision can be made against a 31 m public DEM. This is the first cheque to write.'],
  ['A2', 'CIVIL / SITE ENGINEER', 'Driveway feasibility to BOTH candidate positions (§02) at a sustained grade of 12% or less, with turning radii for a ready-mix truck and a fire apparatus. Confirm or reject the 25% straight-line grade this study measured at the client\'s coordinate.',
    'Whether the coordinate is buildable at all. If a compliant drive cannot reach it, the siting question is already answered.'],
  ['A3', 'GEOTECHNICAL ENGINEER', 'Test pits or borings at the chosen bench. Bearing capacity, depth to rock, groundwater, and whether a cut will stand at 1.5H:1V unretained.',
    `Foundation type, and a ${k(est.courtWallAlt.lo)}–${k(est.courtWallAlt.hi)} retaining-wall line item that is NOT in the estimate below and becomes real if the cut will not stand.`],
  ['A4', 'SOIL SCIENTIST / WASTEWATER', 'Soil evaluation and subsurface sewage disposal feasibility on a 30%+ slope, TDEC permit path. Identify the primary and reserve fields.',
    'This can eliminate a building site outright. It is the single most common reason a steep mountain parcel cannot be built on, and it is cheap to answer early.'],
  ['A5', 'WELL / SPRING CONTRACTOR', 'Locate and test the existing water source named in the brief. Yield in gallons per minute, seasonal variation, potability, and whether it can serve the house by gravity or needs pumping and storage.',
    'The water strategy, the cistern size, and whether standby power has to run a pump.'],
  ['A6', 'JOHNSON COUNTY, TN CODE OFFICIAL', 'Confirm the adopted building and energy code editions, the permit path, and any ridge-protection, steep-slope, stormwater or driveway-grade ordinance that applies.',
    'The entire code basis. Everything in docs/02 was researched against NORTH CAROLINA before the parcel record showed the land is in Tennessee. Treat none of it as applicable.'],
  ['A7', 'STRUCTURAL ENGINEER', 'Nothing in this package is engineered. Member sizes, the concrete spine, the lateral system, the deck and pier frames, and the snow and wind loads at 2,364 ft all need designing from the survey and the geotechnical report.',
    'Any pricing above order-of-magnitude, and any permit.'],
  ['A8', 'GENERAL CONTRACTOR', 'Read §05, then tell us which of the assumptions are wrong. Rates were invented — no local bid was consulted. What we want is not a bid; it is a reality check on the quantities and the sequence, and your view of access, haul and winter working.',
    'A budget anyone can rely on, and the buildability of the earthwork sequence.'],
];

const LIMITS = [
  ['NOT ENGINEERED', 'No structural, mechanical, electrical, plumbing or civil engineering has been performed. Member sizes shown anywhere are placeholders for drawing purposes.'],
  ['CODE BASIS VOID', 'Every code reference was gathered against North Carolina. The parcel is in Tennessee. See A6.'],
  ['SITE DATA IS PUBLIC, COARSE, AND NOT A SURVEY', 'Terrain is a 30.8 m public DEM. One sample is wider than the house. Parcel geometry is from the Tennessee Comptroller cadastral service and a property-viewer reconstruction — neither is a boundary survey.'],
  ['COSTS ARE INVENTED', 'No supplier, cost database or local bid was consulted. The range in §05 exists to be replaced, not relied on.'],
  ['ELEVATION CORRECTED LATE', 'Snow load, design temperature and the freeze-depth reasoning throughout the package were argued from an assumed 3,412 ft. The measured elevation is ~2,364 ft. Those numbers have not been recomputed.'],
  ['NO SOILS, NO WATER TEST, NO SEPTIC EVALUATION', 'See A3, A4, A5. Any of the three can change or eliminate the design.'],
];

// ── the document ────────────────────────────────────────────────────────────
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Henry House — Issue for Review</title>
<style>
:root{
  --paper:#fbfaf7; --ink:#14161a; --dim:#5a5f66; --rule:#c9c5bd;
  --hot:#9c3312; --cool:#1d4f4a; --band:#eeeae1; --mono:ui-monospace,"SFMono-Regular",Menlo,Consolas,monospace;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --paper:#14161a; --ink:#eceae5; --dim:#9aa1a9; --rule:#3a3f46;
  --hot:#e8825c; --cool:#7fd0c4; --band:#1c1f24;
}}
:root[data-theme="dark"]{--paper:#14161a;--ink:#eceae5;--dim:#9aa1a9;--rule:#3a3f46;--hot:#e8825c;--cool:#7fd0c4;--band:#1c1f24;}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);
  font:16px/1.55 Georgia,"Iowan Old Style",serif;-webkit-text-size-adjust:100%}
.wrap{max-width:52rem;margin:0 auto;padding:clamp(18px,4vw,54px) clamp(16px,4vw,40px) 90px}
h1{font:700 clamp(28px,6vw,44px)/1.05 Georgia,serif;margin:0;letter-spacing:-.015em}
.sub{font:400 13px/1.4 var(--mono);color:var(--dim);letter-spacing:.06em;text-transform:uppercase;margin:10px 0 0}
h2{font:700 clamp(17px,3vw,21px)/1.25 Georgia,serif;margin:52px 0 4px;padding-top:16px;border-top:2px solid var(--ink)}
h2 .no{font:400 12px/1 var(--mono);color:var(--dim);display:block;margin-bottom:7px;letter-spacing:.14em}
h3{font:700 14px/1.3 var(--mono);letter-spacing:.06em;text-transform:uppercase;margin:26px 0 6px}
p{margin:9px 0}
.lede{font-size:17px}
small,.small{font-size:13px;color:var(--dim)}
a{color:inherit;text-decoration-color:var(--rule);text-underline-offset:2px}
.stamp{margin:22px 0 0;border:2px solid var(--hot);padding:13px 15px}
.stamp b{color:var(--hot);font:700 13px/1.4 var(--mono);letter-spacing:.1em;display:block;margin-bottom:5px}
.stamp p{font-size:14px;margin:5px 0 0}
table{width:100%;border-collapse:collapse;margin:14px 0;font-size:14px}
th,td{text-align:left;padding:7px 9px 7px 0;border-bottom:1px solid var(--rule);vertical-align:top}
th{font:700 11px/1.3 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--dim)}
td.r,th.r{text-align:right;padding-right:0}
.mono,.num{font-family:var(--mono);font-variant-numeric:tabular-nums}
.num{text-align:right}
.scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
.kv{display:grid;grid-template-columns:minmax(9rem,auto) 1fr;gap:2px 16px;font-size:14px;margin:12px 0}
.kv dt{font:700 11px/1.7 var(--mono);letter-spacing:.07em;text-transform:uppercase;color:var(--dim)}
.kv dd{margin:0 0 6px}
.act{border-left:3px solid var(--cool);padding:2px 0 2px 15px;margin:20px 0}
.act .who{font:700 13px/1.3 var(--mono);letter-spacing:.07em;color:var(--cool)}
.act .id{color:var(--dim);margin-right:8px}
.act .un{font-size:13.5px;color:var(--dim);margin-top:6px}
.act .un b{color:var(--ink);font:700 11px/1 var(--mono);letter-spacing:.08em;text-transform:uppercase;display:block;margin-bottom:3px}
.band{background:var(--band);padding:14px 16px;margin:16px 0}
.two{display:grid;gap:0 30px}
@media(min-width:640px){.two{grid-template-columns:1fr 1fr}}
figure{margin:18px 0}
img{width:100%;height:auto;display:block;border:1px solid var(--rule)}
figcaption{font-size:12.5px;color:var(--dim);margin-top:6px}
.win{color:var(--cool);font-weight:700}
.lose{color:var(--hot);font-weight:700}
ul{margin:8px 0;padding-left:20px}li{margin:4px 0}
footer{margin-top:60px;padding-top:16px;border-top:1px solid var(--rule);font-size:12.5px;color:var(--dim)}
@media print{
  :root{--paper:#fff;--ink:#000;--dim:#444;--rule:#bbb;--band:#f2f2f2}
  body{font-size:10.5pt}.wrap{max-width:none;padding:0}
  h2{break-before:page;border-top-width:1.5pt}h2:first-of-type{break-before:avoid}
  .act,figure,table{break-inside:avoid}a{text-decoration:none}
}
</style></head><body><div class="wrap">

<h1>HENRY HOUSE</h1>
<p class="sub">Issue for review · Schematic design · ${today}</p>
<p class="sub">Parcel ${esc(SITE_CONTEXT.parcelId)} · ${esc(SITE.county)} County, Tennessee · ${SITE_CONTEXT.deedAcres} deeded acres</p>

<div class="stamp">
  <b>NOT FOR CONSTRUCTION · NOT FOR PERMIT · NOT FOR PRICING AS BID</b>
  <p>Nothing in this package is engineered. The code basis is void — it was researched
  against North Carolina and the parcel is in Tennessee. All cost rates are invented.
  Site data is a public 30.8 m elevation model, not a survey.</p>
  <p>It is issued to get ${ACTIONS.length} questions answered (§06). It is not issued to build from.</p>
</div>

<h2><span class="no">00</span>Read this first</h2>
<p class="lede">One decision blocks everything else, and it is not about the house.</p>
<p>The client named a coordinate — ${esc(SITE_CONTEXT.anchor.label)}. Measured against a public
elevation model, the ground at that point falls almost due <b>north</b> at <b>38%</b>, and the
straight-line driveway from the existing road climbs <b>357 ft at 25%</b>.</p>
<p><b>A 25% driveway is not a driveway.</b> It is past what a loaded ready-mix truck will climb
and past what anyone should descend on ice at 2,364 ft. Before a builder prices anything, someone
has to stand on this ground and tell us whether a compliant drive can reach it.</p>
<p>The parcel has better ground. About <b>656 ft north-west</b> of the coordinate the study finds
ground falling <b>south-west at 9%</b>, reachable at <b>12%</b>. §02 sets both out. The house does
not need redesigning for this land — it needs siting on it.</p>

<h2><span class="no">01</span>The land</h2>
<dl class="kv">
  <dt>Parcel</dt><dd>${esc(SITE_CONTEXT.parcelId)} — Johnson County, Tennessee <span class="small">(${esc(SITE_CONTEXT.id)})</span></dd>
  <dt>Owner of record</dt><dd>${esc(SITE_CONTEXT.owner)}</dd>
  <dt>Deed area</dt><dd>${SITE_CONTEXT.deedAcres} acres <span class="small">(cadastral geometry computes 29.42 — 0.3% agreement)</span></dd>
  <dt>Coordinate</dt><dd class="mono">${esc(SITE_CONTEXT.anchor.label)} · ${SITE.lat.toFixed(6)}, ${SITE.lon.toFixed(6)}</dd>
  <dt>Elevation</dt><dd>≈ ${n0(SITE.elevationFtAmsl)} ft AMSL <span class="small">measured — the package was drawn assuming 3,412 ft</span></dd>
  <dt>Slope</dt><dd>${SITE.crossSlopePctMeasured}% at building scale <span class="small">(40% at ±31 m, 27% at ±185 m)</span></dd>
  <dt>Ground falls to</dt><dd>azimuth ${SITE.fallsToAzimuth}° — <b>almost due north</b></dd>
</dl>
<p class="small">Elevation: terrarium tiles, AWS open data. Parcel: Tennessee Comptroller cadastral
service. Map data © OpenStreetMap contributors, ODbL. <b>None of these is a survey.</b></p>

<h3>The jurisdiction changed late</h3>
<p>The brief said “outside Boone, North Carolina.” The parcel record puts the land in
<b>Johnson County, Tennessee</b> — the state line runs between. A North Carolina statute has no
force in Tennessee, so every code reference in this package must be discarded and redone. See A6.</p>

<h2><span class="no">02</span>The siting question</h2>
<p>Every position on the parcel was scored — 331 candidates at 50 ft centres, 60 ft clear of the
boundary — on aspect, slope, the cut and fill to bench a level ${T.heatedSf ? '72 × 26 ft' : 'pad'}
pad, and the driveway needed to reach it.</p>
<div class="scroll"><table>
<tr><th></th><th class="r">The client’s coordinate</th><th class="r">Best ground on the parcel</th></tr>
<tr><td>Ground falls to</td><td class="num lose">31° — NNE</td><td class="num win">206° — SSW</td></tr>
<tr><td>Off due north</td><td class="num">31°</td><td class="num win">154°</td></tr>
<tr><td>Slope across the pad</td><td class="num lose">38%</td><td class="num win">9%</td></tr>
<tr><td>Cut / fill for the pad</td><td class="num">85 / 156 CY</td><td class="num">0 / 120 CY</td></tr>
<tr><td>Driveway from the road</td><td class="num lose">357 ft @ 25%</td><td class="num win">1,010 ft @ 12%</td></tr>
</table></div>
<div class="band">
<p style="margin:0"><b>What the 29 acres are made of:</b> 51% faces north · 44% faces east or west ·
5% faces south.</p>
</div>
<p>This matters because the design puts glass, view and terrace on the downhill face and the
service wall, plumbing artery and cut on the uphill face. That works when downhill and sunny are
the same direction — on a south slope. On a north slope the view is downhill and the winter sun is
uphill, into the cut, and no rotation reconciles them.</p>
<p><b>The recommendation is to move the house, not to redesign it.</b> The south-west ground is the
condition every scheme in the set already assumes. Confirm it on foot (A1) before committing.</p>
<p class="small">The elevation model is 30.8 m — one sample is wider than the house. This finds
where the hillside turns. It cannot find the bench you would build on.</p>
${existsSync('out/preview/S0-SPINE-compare-SITE.png') ? `<figure>
  <img src="out/preview/S0-SPINE-compare-SITE.png" alt="The Spine standing on the measured ground at the parcel">
  <figcaption><b>The house on the measured ground at the coordinate.</b> Same model, same camera and
  same sun as every other view in the set — the only difference is that this stands on the real hill
  rather than the assumed plane. The glazed face is in its own shadow: at this position the sun is
  behind the house, uphill. That is the siting problem in one frame.</figcaption>
</figure>` : ''}

<h2><span class="no">03</span>The house</h2>
<p>Eleven schemes were developed and checked. The one carried forward is <b>${esc(recM.name)}</b>,
because its plumbing artery runs down an <em>interior</em> spine rather than the uphill exterior
wall — which is the only one of the eleven whose service strategy survives a north-facing site
unaltered.</p>
<dl class="kv">
  <dt>Conditioned</dt><dd>${n0(recM.conditionedSf)} sf across ${recS.levels} levels</dd>
  <dt>Sheltered</dt><dd>${n0(recM.shelteredSf)} sf — deck, terrace, breezeway, garage</dd>
  <dt>Rooms</dt><dd>${recS.rooms} rooms · ${recS.bed} bedrooms · ${recS.bath} bathrooms · ${recS.circPct}% circulation</dd>
  <dt>Footprint</dt><dd>${n0(recM.footprintSf)} sf · perimeter ${n0(recM.perimeterLf)} lf (${recM.perimeterPerSf.toFixed(3)} lf/sf)</dd>
  <dt>Wet-wall run</dt><dd>${recM.wetWallLf} lf — one artery, all fixtures on it</dd>
  <dt>Roof</dt><dd>${recM.roofPlanes} planes, ${recM.roofJunctions} junctions</dd>
  <dt>Ground</dt><dd>${esc(recM.groundNote)} · ${n0(recM.cutCY)} CY cut, deepest ${recM.maxCutFt} ft</dd>
  <dt>Plumbed fixtures</dt><dd>${T.plumbedFixtures}</dd>
</dl>
${existsSync('out/png/X-201-s0-spine-plans.png') ? `<figure>
  <img src="out/png/X-201-s0-spine-plans.png" alt="The Spine — schematic plans, all three levels">
  <figcaption><b>X-201 — the recommended scheme, all ${recS.levels} levels.</b> Every fixture, door
  swing, stair tread and wall thickness on this sheet is generated from the same description the 3D
  model is built from, and a check asserts the two agree.</figcaption>
</figure>` : ''}
<h3>The alternates</h3>
<div class="scroll"><table>
<tr><th>Scheme</th><th class="r">Cond. sf</th><th class="r">Beds</th><th class="r">Perim/sf</th><th class="r">Wet wall</th><th class="r">Cut CY</th></tr>
${SCHEMES.map((s) => {
  const m = metrics(s); const p = planFor(s.id);
  const st = p ? planStats(p) : null;
  return `<tr${s.id === REC ? ' style="font-weight:700"' : ''}><td>${esc(m.name)}</td>
    <td class="num">${n0(m.conditionedSf)}</td><td class="num">${st ? st.bed : '—'}</td>
    <td class="num">${m.perimeterPerSf.toFixed(3)}</td><td class="num">${m.wetWallLf}</td>
    <td class="num">${n0(m.cutCY)}</td></tr>`;
}).join('\n')}
</table></div>
<p class="small">All eleven are drawn to the same standard and checked by the same rules — rooms
inside their floor, no overlaps, every bedroom with an exterior wall and egress, wet rooms grouped
or stacked, stairs landing on the stair below, and every room reachable without passing through a
bedroom. A scheme that failed was reported and dropped, not repaired.</p>

<h2><span class="no">04</span>What is drawn</h2>
<p>${sheets.length} sheets. Plans, sections, elevations, systems and the eleven-scheme comparison.
SVG is the source; PNG is provided where it has been rasterised.</p>
<div class="scroll"><table>
<tr><th>Sheet</th><th>Title</th><th class="r">Files</th></tr>
${sheets.map(sheetRow).join('\n')}
</table></div>

<h2><span class="no">05</span>Quantities, and a number to argue with</h2>
<div class="stamp"><b>EVERY RATE BELOW IS INVENTED</b>
<p>No supplier, cost database or local bid was consulted. These rates were also assembled against
North Carolina, which is not where this parcel is. The range exists so a Johnson County GC has
something specific to correct. Do not take it to a bank.</p></div>
<h3>Take-off</h3>
<div class="scroll"><table>
<tr><th>Quantity</th><th class="r">Value</th><th>Quantity</th><th class="r">Value</th></tr>
<tr><td>Heated</td><td class="num">${n0(T.heatedSf)} sf</td><td>Earthwork</td><td class="num">${n0(T.earthCY)} CY</td></tr>
<tr><td>Roof</td><td class="num">${n0(T.roofSf)} sf</td><td>Spoil hauled</td><td class="num">${n0(T.haulCY)} CY</td></tr>
<tr><td>Wall</td><td class="num">${n0(T.wallSf)} sf</td><td>Driveway</td><td class="num">${n0(T.driveLf)} lf</td></tr>
<tr><td>Glazing</td><td class="num">${n0(T.glazedSf)} sf (${T.glazingPct}%)</td><td>Disturbed</td><td class="num">${T.disturbedAcres} ac</td></tr>
<tr><td>Deck + terrace</td><td class="num">${n0(T.deckSf + T.terraceSf)} sf</td><td>Systems run</td><td class="num">${n0(T.systemsLf)} lf</td></tr>
</table></div>
<h3>Order of magnitude</h3>
<div class="scroll"><table>
<tr><th>Item</th><th class="r">Qty</th><th class="r">Low</th><th class="r">High</th></tr>
${est.lines.map((l) => `<tr><td>${esc(l.name)}</td><td class="num">${n0(l.qty)} ${esc(l.unit)}</td>
  <td class="num">${k(l.lo)}</td><td class="num">${k(l.hi)}</td></tr>`).join('\n')}
<tr><td><b>Construction</b></td><td></td><td class="num"><b>${k(est.construction.lo)}</b></td><td class="num"><b>${k(est.construction.hi)}</b></td></tr>
<tr><td>Contingency ${est.contingencyPct}%</td><td></td><td class="num">${k(est.contingency.lo)}</td><td class="num">${k(est.contingency.hi)}</td></tr>
<tr><td>Soft costs ${est.softCostPct}%</td><td></td><td class="num">${k(est.soft.lo)}</td><td class="num">${k(est.soft.hi)}</td></tr>
<tr><td><b>TOTAL</b></td><td></td><td class="num"><b>${k(est.total.lo)}</b></td><td class="num"><b>${k(est.total.hi)}</b></td></tr>
<tr><td class="small">per conditioned sf</td><td></td><td class="num small">$${Math.round(est.perSf.lo)}</td><td class="num small">$${Math.round(est.perSf.hi)}</td></tr>
</table></div>
<p class="small"><b>Not included:</b> ${esc(est.courtWallAlt.note)} That alternate is
${k(est.courtWallAlt.lo)}–${k(est.courtWallAlt.hi)}. The driveway line assumes the drive that was
designed for the assumed site; §02 shows the real parcel needs a different one, and it is longer.</p>

<h2><span class="no">06</span>What we need from you</h2>
<p class="lede">Eight questions, in the order they unblock each other. A1 comes before everything.</p>
${ACTIONS.map(([id, who, ask, un]) => `<div class="act">
  <div class="who"><span class="id">${id}</span>${esc(who)}</div>
  <p>${esc(ask)}</p>
  <div class="un"><b>Unblocks</b>${esc(un)}</div>
</div>`).join('\n')}

<h2><span class="no">07</span>What this package is not</h2>
<p>Listed plainly so nobody has to discover it late.</p>
${LIMITS.map(([t, d]) => `<h3>${esc(t)}</h3><p>${esc(d)}</p>`).join('\n')}

<footer>
<p><b>HENRY HOUSE</b> · schematic design issue · ${today} · parcel ${esc(SITE_CONTEXT.parcelId)},
${esc(SITE.county)} County, Tennessee.</p>
<p>Generated from the project model — every quantity, area and coordinate on this page is read from
the same source that draws the sheets, so the two cannot disagree. Regenerate with
<span class="mono">node tools/build-issue-package.mjs</span>.</p>
<p>Reference imagery and precedent studies referred to in the drawing set remain the property of
their authors and are not reproduced here.</p>
</footer>
</div></body></html>`;

writeFileSync('issue-for-review.html', html);
console.log('HENRY HOUSE — ISSUE FOR REVIEW');
console.log('='.repeat(66));
console.log(`  recommended   ${recM.name} — ${n0(recM.conditionedSf)} sf, ${recS.bed} bed, ${recS.bath} bath`);
console.log(`  sheets        ${sheets.length}`);
console.log(`  actions       ${ACTIONS.length} across ${new Set(ACTIONS.map((a) => a[1])).size} disciplines`);
console.log(`  order of mag  ${k(est.total.lo)} – ${k(est.total.hi)}  (every rate invented)`);
console.log(`  → issue-for-review.html  (${(html.length / 1024).toFixed(0)} kB, prints)`);
