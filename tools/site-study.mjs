// WHERE ON THE 29 ACRES SHOULD THIS HOUSE GO?
//
// Until now "the site" was one point — the coordinate the client named — and
// the house was set on it. But the client owns 29.34 acres, and docs/09 found
// that the ground AT that point falls almost due north, which is the worst
// aspect this design can have. A point cannot be argued with. A parcel can be
// searched.
//
// This scores every candidate position on the parcel and reports what the land
// actually offers, so the siting is a finding rather than a preference:
//
//   ASPECT    which way the ground faces. A north-facing bench forces the
//             choice docs/09 sets out. An east or west shoulder does not — it
//             brings the view and the sun back onto adjacent faces, which is
//             the opportunity the anchor point happens to miss.
//   SLOPE     the grade across the pad, and what it costs to bench it.
//   EARTHWORK cut and fill for a level 72 × 26 ft pad, in cubic yards, by the
//             same rule model/schemes.mjs charges every scheme.
//   ACCESS    distance and average grade from the existing road. A site with a
//             perfect aspect and a 22% driveway is not a site.
//
//   node tools/site-study.mjs [--top=8] [--pad=72x26]
//
// RESOLUTION. The DEM is 30.8 m — about 101 ft. A 72 ft house fits inside one
// sample. So this finds where on a 29-acre hillside the ground turns, and it
// CANNOT find the ten-metre bench you would actually build on. Read it as a
// map of where to walk, not a stake in the ground.
import { PARCEL_LOCAL_FT, ROAD_LOCAL_FT, SITE_CONTEXT } from '../model/site-context.mjs';
import { siteGrade, SITE_TERRAIN } from '../model/site-terrain.mjs';

const arg = (k, d) => {
  const a = process.argv.find((x) => x.startsWith(`--${k}=`));
  return a ? a.split('=')[1] : d;
};
const TOP = Number(arg('top', 8));
const [PAD_W, PAD_D] = String(arg('pad', '72x26')).split('x').map(Number);
const STEP = 50;                      // ft between candidates
const SETBACK = 60;                   // ft clear of the boundary
const M_PER_FT = 0.3048;

// ── the ground, in the parcel's own east/north feet ─────────────────────────
// site-terrain.mjs stores heights on the HOUSE's axes (u along the contour,
// v uphill). Those axes are orthonormal, so projecting east/north onto them is
// a dot product, not a new sampling of the DEM.
const UP = SITE_TERRAIN.uphillAzimuth, rad = Math.PI / 180;
const uy = [Math.sin(UP * rad), Math.cos(UP * rad)];
const ux = [Math.sin((UP + 90) * rad), Math.cos((UP + 90) * rad)];
/** Ground height in FEET at parcel-local (east, north) feet. */
function ground(eFt, nFt) {
  const e = eFt * M_PER_FT, n = nFt * M_PER_FT;
  const u = e * ux[0] + n * ux[1], v = e * uy[0] + n * uy[1];
  return siteGrade(u / 0.0254, v / 0.0254) / 12;         // inches → feet
}

// ── the parcel ──────────────────────────────────────────────────────────────
const ring = PARCEL_LOCAL_FT.map((p) => [p.east, p.north]);
const inside = (x, y) => {
  let c = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
const distToRing = (x, y) => {
  let best = Infinity;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    const dx = xj - xi, dy = yj - yi, L2 = dx * dx + dy * dy || 1;
    let t = ((x - xi) * dx + (y - yi) * dy) / L2;
    t = Math.max(0, Math.min(1, t));
    best = Math.min(best, Math.hypot(x - (xi + t * dx), y - (yi + t * dy)));
  }
  return best;
};
const road = ROAD_LOCAL_FT.map((p) => [p.east, p.north]);
const toRoad = (x, y) => {
  let best = Infinity, at = null;
  for (const [rx, ry] of road) {
    const d = Math.hypot(x - rx, y - ry);
    if (d < best) { best = d; at = [rx, ry]; }
  }
  return { d: best, at };
};

// ── score one candidate ─────────────────────────────────────────────────────
function score(x, y) {
  const z = ground(x, y);
  // plane fit over the pad, plus a ring beyond it, so slope is the ground's
  // and not one sample's noise
  const R = Math.max(PAD_W, PAD_D);
  let Sxx = 0, Syy = 0, Sxy = 0, Sxz = 0, Syz = 0, N = 0;
  for (let dy = -R; dy <= R; dy += R / 2) for (let dx = -R; dx <= R; dx += R / 2) {
    const h = ground(x + dx, y + dy) - z;
    Sxx += dx * dx; Syy += dy * dy; Sxy += dx * dy; Sxz += dx * h; Syz += dy * h; N++;
  }
  const det = Sxx * Syy - Sxy * Sxy || 1;
  const a = (Sxz * Syy - Syz * Sxy) / det, b = (Syz * Sxx - Sxz * Sxy) / det;
  const slope = Math.hypot(a, b);
  const fallsTo = ((Math.atan2(-a, -b) * 180) / Math.PI + 360) % 360;

  // cut and fill to level a PAD_W × PAD_D pad at the mean, long axis across
  // the fall so the house sits along the contour as every scheme intends
  let cut = 0, fill = 0;
  const CELL = 6;
  const cAz = (fallsTo + 90) * rad;                       // along the contour
  const cx = [Math.sin(cAz), Math.cos(cAz)], cy = [Math.sin(cAz + Math.PI / 2), Math.cos(cAz + Math.PI / 2)];
  for (let v = -PAD_D / 2; v < PAD_D / 2; v += CELL) {
    for (let u = -PAD_W / 2; u < PAD_W / 2; u += CELL) {
      const px = x + u * cx[0] + v * cy[0], py = y + u * cx[1] + v * cy[1];
      const d = ground(px, py) - z;
      if (d > 0) cut += d * CELL * CELL; else fill += -d * CELL * CELL;
    }
  }

  const r = toRoad(x, y);
  const rise = Math.abs(ground(r.at[0], r.at[1]) - z);
  const driveGrade = r.d > 1 ? rise / r.d : 0;

  return {
    x, y, z, slopePct: slope * 100, fallsTo,
    cutCY: cut / 27, fillCY: fill / 27,
    driveFt: r.d, driveGradePct: driveGrade * 100,
    edgeFt: distToRing(x, y),
  };
}

// ── search ──────────────────────────────────────────────────────────────────
const es = ring.map((p) => p[0]), ns = ring.map((p) => p[1]);
const cands = [];
for (let y = Math.min(...ns); y <= Math.max(...ns); y += STEP) {
  for (let x = Math.min(...es); x <= Math.max(...es); x += STEP) {
    if (!inside(x, y)) continue;
    const s = score(x, y);
    if (s.edgeFt < SETBACK) continue;
    cands.push(s);
  }
}

// How far off north is the fall? 0 is due north, 180 is due south.
const rate = (c) => {
  const off = Math.min(c.fallsTo, 360 - c.fallsTo);
  c.offNorthDeg = off;
  // A site is good when the ground faces anything but north, is not too steep
  // to bench, and can be reached. Each term is 0–1 and they multiply, so a
  // fatal score in any one of them cannot be bought off by the others — a
  // perfect aspect with a 25% driveway is not a site.
  const aspect = off / 180;
  const build = Math.max(0, Math.min(1, (55 - c.slopePct) / 35));
  const access = c.driveGradePct <= 12 ? 1 : Math.max(0, 1 - (c.driveGradePct - 12) / 10);
  const earth = Math.max(0, 1 - (c.cutCY + c.fillCY) / 1200);
  c.score = aspect * build * access * earth;
  return c;
};
cands.forEach(rate);
cands.sort((a, b) => b.score - a.score);

// ── report ──────────────────────────────────────────────────────────────────
const anchor = rate(score(0, 0));
const pct = (n, d) => ((100 * n) / d).toFixed(0) + '%';
console.log('HENRY HOUSE — WHERE ON THE PARCEL');
console.log('='.repeat(94));
console.log(`  parcel   ${SITE_CONTEXT.id}  ·  ${SITE_CONTEXT.deedAcres} deeded acres`);
console.log(`  pad      ${PAD_W} × ${PAD_D} ft, benched level, long axis along the contour`);
console.log(`  DEM      ${SITE_TERRAIN.step.toFixed(1)} m — one sample is wider than the house. See the note in this file.`);
console.log(`  tested   ${cands.length} positions at ${STEP} ft, ${SETBACK} ft clear of the boundary`);
console.log('');
console.log('  THE ANCHOR THE CLIENT GAVE');
console.log(`     ground falls to ${anchor.fallsTo.toFixed(0)}°  (${anchor.offNorthDeg.toFixed(0)}° off due north)` +
            `   slope ${anchor.slopePct.toFixed(0)}%   cut ${anchor.cutCY.toFixed(0)} + fill ${anchor.fillCY.toFixed(0)} CY` +
            `   drive ${anchor.driveFt.toFixed(0)} ft @ ${anchor.driveGradePct.toFixed(0)}%`);
console.log('');

const nNorth = cands.filter((c) => c.offNorthDeg < 45).length;
const nSouth = cands.filter((c) => c.offNorthDeg > 135).length;
const nSide = cands.length - nNorth - nSouth;
console.log('  WHAT THE PARCEL IS MADE OF');
console.log(`     ${pct(nNorth, cands.length).padStart(4)} of it faces NORTH  (within 45° of due north — the docs/09 problem)`);
console.log(`     ${pct(nSide, cands.length).padStart(4)} faces EAST or WEST  (the view and the sun come back onto adjacent faces)`);
console.log(`     ${pct(nSouth, cands.length).padStart(4)} faces SOUTH        (what the whole package was drawn for)`);
console.log('');
console.log('  BEST POSITIONS');
console.log('     ' + 'east'.padStart(7) + 'north'.padStart(8) + '  el ft' + '   faces' + '  slope' +
            '   cut CY' + '  fill CY' + '   drive ft' + '  grade');
for (const c of cands.slice(0, TOP)) {
  const compass = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'][Math.round(c.fallsTo / 22.5) % 16];
  console.log('     ' + c.x.toFixed(0).padStart(7) + c.y.toFixed(0).padStart(8) +
              (SITE_CONTEXT.anchor && (c.z + 2364).toFixed(0)).padStart(7) +
              `  ${compass.padEnd(4)}` + `${c.slopePct.toFixed(0).padStart(5)}%` +
              c.cutCY.toFixed(0).padStart(8) + c.fillCY.toFixed(0).padStart(9) +
              c.driveFt.toFixed(0).padStart(11) + c.driveGradePct.toFixed(0).padStart(6) + '%');
}
console.log('');
const best = cands[0];
if (best) {
  console.log(`  The best ground on this parcel faces ${best.fallsTo.toFixed(0)}° — ` +
              `${best.offNorthDeg.toFixed(0)}° off north, against the anchor's ${anchor.offNorthDeg.toFixed(0)}°.`);
  console.log(`  It is ${Math.hypot(best.x, best.y).toFixed(0)} ft from the point the client named.`);
}
console.log('='.repeat(94));
console.log('  A 30.8 m DEM finds where a hillside turns. It cannot find a bench.');
console.log('  Walk these before believing any of them.');
