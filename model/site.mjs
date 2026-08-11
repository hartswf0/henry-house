// HENRY HOUSE — SITE, DRIVEWAY AND EARTHWORK.
//
// The largest hole in this package was that the house was described and the
// GROUND was not. This module builds the missing half: contours, a driveway
// with real stations and grades, a cut/fill balance, and the disturbed-area
// figure that decides whether an erosion control plan is required.
//
// ─────────────────────────────────────────────────────────────────────────────
// EVERY NUMBER HERE IS ASSUMED. There is no survey. The terrain is the plane
// declared in geometry.mjs (30% cross-slope, 8% along the bar). What this
// module does is make the CONSEQUENCES of that assumption computable, so that
// when a real survey arrives the same code produces real answers.
// ─────────────────────────────────────────────────────────────────────────────

import { ft } from './units.mjs';
import { SITE_SLOPE, FOOTPRINTS, GARAGE, LINK, DRAIN_GAP, DECKS } from './geometry.mjs';

export const natural = (x, y) => SITE_SLOPE.grade(x, y);

// ── FINISHED GRADE ──────────────────────────────────────────────────────────
//
// THE MOTOR COURT IS AN "L", NOT A RECTANGLE.
//
// The garage doors face EAST, at x = 120'-0". The court used to stop at
// x = 122'-0" — two feet of pavement in front of a garage door. No car can
// enter or leave. That is not a drafting slip; it is the whole arrival
// sequence failing, and it went unnoticed because nothing in the package ever
// asked "can a vehicle occupy this?"
//
// So the court now has two limbs:
//   MAIN   the arrival bench along the uphill wall — entry bridge, turnaround
//   APRON  a 30'-0" limb wrapping the east end of the garage, in front of the
//          doors, where a car actually backs out
//
// The apron sits far DOWNHILL of the main court's back edge, so it is a much
// shallower cut — which is also why the driveway now meets the site there.
export const COURT = {
  main:  { x0: ft(-14), x1: ft(122), y0: DRAIN_GAP.y1, y1: DRAIN_GAP.y1 + ft(26) },
  apron: { x0: ft(118), x1: ft(150), y0: ft(3),        y1: ft(36) },
  z: ft(10) - 8,
  backingDepthFt: 30,
  note: 'Apron depth is set by backing a vehicle clear of the door, not by drafting convenience.',
};
COURT.x0 = COURT.main.x0; COURT.x1 = COURT.apron.x1;

/** Back (uphill) edge of the paved bench at this x — the cut is measured to here. */
const benchBack  = (x) => (x > ft(118) ? COURT.apron.y1 : COURT.main.y1);
/** Front (downhill) edge — the garage pad and apron reach much further downhill. */
const benchFront = (x) => (x > ft(94) ? COURT.apron.y0 : COURT.main.y0);

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const lateral = (x) => smooth(ft(-56), ft(-22), x) * (1 - smooth(ft(150), ft(186), x));

/**
 * The driveway bench, as a surface.
 *
 * The drive holds a design grade while the ground rises more slowly, so for
 * most of its length it sits IN CUT — up to 8 ft below natural at the apron.
 * A terrain model that does not excavate for it puts 655 ft of road
 * underground: in the 3D site view the drive appeared as a broken dotted line,
 * visible only near the road where the cut tapers to nothing.
 *
 * Returns the finished elevation at (x, y) if the point lies in the corridor,
 * otherwise null. Cross-section matches C-101: level platform, 1.5H:1V
 * backslope uphill, 2H:1V fill downhill, each run until it meets the ground.
 */
let _driveSegs = null;
export function driveBench(x, y) {
  if (!_driveSegs) {
    const p = driveProfile().pts;
    _driveSegs = p.slice(1).map((b, i) => ({ a: p[i], b }));
  }
  const half = ft(DRIVE_SECTION.widthFt / 2 + DRIVE_SECTION.ditchFt);
  let best = null;
  for (const { a, b } of _driveSegs) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const L2 = dx * dx + dy * dy || 1;
    let t = ((x - a.x) * dx + (y - a.y) * dy) / L2;
    t = Math.max(0, Math.min(1, t));
    const px = a.x + t * dx, py = a.y + t * dy;
    const off = Math.hypot(x - px, y - py);
    if (best === null || off < best.off) best = { off, z: a.z + t * (b.z - a.z), px, py };
  }
  if (!best) return null;
  if (best.off <= half) return best.z;
  const nat = natural(x, y);
  const over = best.off - half;
  if (nat > best.z) {                                   // uphill side: cut back
    const z = best.z + over / DRIVE_SECTION.backslope;
    return z >= nat ? null : z;
  }
  const z = best.z - over / DRIVE_SECTION.fillslope;    // downhill side: fill out
  return z <= nat ? null : z;
}

export function finished(x, y) {
  const nat = natural(x, y);
  const lat = lateral(x);
  const drive = driveBench(x, y);
  if (lat < 0.002) return drive ?? nat;
  const front = benchFront(x), back = benchBack(x);
  let z;
  if (y > back) z = Math.min(nat, COURT.z + (y - back) / 1.5);   // laid-back cut face
  else if (y >= front) z = COURT.z;                              // the paved bench
  else if (x > ft(94)) z = Math.max(nat, COURT.z - (front - y) / 2); // fill off the apron edge
  else if (y >= front - 48) z = DRAIN_GAP.invert;                // the drain gap
  else if (y > 0) z = Math.min(nat, ft(10) - 46);                // against the house
  // The lower terrace is a built surface only where it exists. An earlier
  // version flattened the whole downhill strip to its elevation, which quietly
  // buried the east end of the house in four feet of imaginary fill.
  else if (y > DECKS[1].y0 && x > DECKS[1].x0 - ft(6) && x < DECKS[1].x1 + ft(6)) z = -6;
  else z = nat;
  const pad = nat + (z - nat) * lat;
  // Where the court bench and the drive bench overlap, the drive is built into
  // the court, so the LOWER of the two is the finished surface.
  return drive === null ? pad : Math.min(pad, drive);
}

// ── CONTOURS ────────────────────────────────────────────────────────────────
/** Marching-squares contour extraction over the finished (or natural) surface. */
export function contours({ interval = 24, x0 = ft(-95), x1 = ft(315), y0 = ft(-75),
                           y1 = ft(255), step = ft(4), surface = finished, levels = null } = {}) {
  const nx = Math.ceil((x1 - x0) / step), ny = Math.ceil((y1 - y0) / step);
  const g = [];
  let lo = Infinity, hi = -Infinity;
  for (let j = 0; j <= ny; j++) {
    const row = [];
    for (let i = 0; i <= nx; i++) {
      const z = surface(x0 + i * step, y0 + j * step);
      row.push(z); if (z < lo) lo = z; if (z > hi) hi = z;
    }
    g.push(row);
  }
  const out = [];
  const want = levels ?? (() => {
    const a = []; for (let z = Math.ceil(lo / interval) * interval; z <= hi; z += interval) a.push(z); return a;
  })();
  for (const z of want) {
    const segs = [];
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const p = [[x0 + i * step, y0 + j * step, g[j][i]],
                 [x0 + (i + 1) * step, y0 + j * step, g[j][i + 1]],
                 [x0 + (i + 1) * step, y0 + (j + 1) * step, g[j + 1][i + 1]],
                 [x0 + i * step, y0 + (j + 1) * step, g[j + 1][i]]];
      const cut = [];
      for (let k = 0; k < 4; k++) {
        const a = p[k], b = p[(k + 1) % 4];
        if ((a[2] - z) * (b[2] - z) < 0) {
          const t = (z - a[2]) / (b[2] - a[2]);
          cut.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]);
        }
      }
      if (cut.length === 2) segs.push(cut);
    }
    if (segs.length) out.push({ z, segs, major: Math.round(z / interval) % 5 === 0 });
  }
  return out;
}

// ── THE DRIVEWAY ────────────────────────────────────────────────────────────
// A real alignment: stations, grades, and a check against the limits that
// actually bite on mountain land.
//
// LIMITS — all UNVERIFIED, see docs/02-code-basis.md:
//   12% sustained is the common practical maximum for a private drive in snow
//   15% absolute maximum for short pitches
//   10% is what fire apparatus access provisions typically require
export const DRIVE_LIMITS = { sustainedPct: 12, maxPct: 15, fireApparatusPct: 10,
  minWidthFt: 12, fireWidthFt: 20, turnaroundLengthFt: 150,
  status: 'UNVERIFIED — Watauga County / NCDOT / the fire marshal set these, not this file' };

/**
 * Generate a switchback alignment that climbs at a TARGET GRADE and DAYLIGHTS.
 *
 * The first attempt at this file hand-sketched an alignment and then measured
 * it: 64% maximum grade, 22% average. On a 30% slope you cannot go straight at
 * the hill — you traverse it, and the drive gets long.
 *
 * The second attempt fixed the grade and broke something subtler: it made each
 * leg follow terrain that rose at exactly the design grade, so the drive stayed
 * a constant 14.9 ft BELOW natural grade for its whole length — a 780 ft
 * trench. The court is cut into the hill; the drive has to climb OUT of that
 * cut, which means the ground along the alignment must rise MORE SLOWLY than
 * the drive does.
 *
 * So the design has two grades, not one:
 *   gDrive   the grade the pavement holds                         (11%)
 *   gGround  the terrain grade the heading is chosen to follow    (solved)
 * and the difference times the length must recover the court cut:
 *   gGround = gDrive − courtCut / length
 *
 * For a heading with x-component sx and a y-component k per unit |dx|, the
 * grade over the assumed plane is
 *     g = (0.08·sx + 0.30·k) / sqrt(1 + k²)
 * so each leg solves for the k that hits gGround, then reverses.
 */
function solveK(sx, gradeTarget) {
  let lo = 0, hi = 8;
  for (let i = 0; i < 60; i++) {
    const k = (lo + hi) / 2;
    const g = (SITE_SLOPE.longSlopePct / 100 * sx + SITE_SLOPE.crossSlopePct / 100 * k) / Math.hypot(1, k);
    if (g < gradeTarget) lo = k; else hi = k;
  }
  return (lo + hi) / 2;
}

export const DRIVE_DESIGN_GRADE = 11;   // percent, held constant along the alignment

// The drive meets the site at the OUTER END OF THE GARAGE APRON, not at the back
// of the court. Same arrival, 9 ft less cut, because the apron sits downhill.
export function generateAlignment({ startX = ft(148), startY = ft(20), targetRiseFt = 72,
                                    gradePct = DRIVE_DESIGN_GRADE, maxLegFt = 130 } = {}) {
  const g = gradePct / 100;
  const lengthIn = (targetRiseFt * 12) / g;
  const courtCut = natural(startX, startY) - COURT.z;      // inches the drive must climb out of
  const gGround = g - courtCut / lengthIn;                 // terrain grade the heading follows
  const nLegs = Math.max(2, Math.ceil(lengthIn / (maxLegFt * 12)));
  const legIn = lengthIn / nLegs;

  const pts = [[startX, startY]];
  let x = startX, y = startY, sx = 1;
  for (let i = 0; i < nLegs; i++) {
    const k = solveK(sx, gGround);
    const dx = sx * legIn / Math.hypot(1, k);
    const dy = Math.abs(dx) * k;
    x += dx; y += dy;
    pts.push([Math.round(x), Math.round(y)]);
    sx = -sx;                                     // switchback
  }
  pts.gGroundPct = +(gGround * 100).toFixed(1);
  pts.courtCutFt = +(courtCut / 12).toFixed(1);
  return pts;
}

// Road connection is ASSUMED to be uphill and to the north, about 72 ft above
// the motor court. Nothing about that is known — see A-20 in the register.
export const DRIVE_ALIGNMENT = generateAlignment();

export function driveProfile(alignment = DRIVE_ALIGNMENT) {
  const pts = [];
  let station = 0;
  for (let i = 0; i < alignment.length; i++) {
    const [x, y] = alignment[i];
    if (i > 0) {
      const [px, py] = alignment[i - 1];
      station += Math.hypot(x - px, y - py);
    }
    // The drive is a DESIGNED surface: it holds its grade and the ground is cut
    // or filled to meet it. Reading z off the terrain is what produced 64%.
    const z = COURT.z + station * (DRIVE_DESIGN_GRADE / 100);
    pts.push({ x, y, stationFt: +(station / 12).toFixed(1), z,
      groundZ: natural(x, y), cutFillFt: +((z - natural(x, y)) / 12).toFixed(1) });
  }
  const segs = [];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const run = Math.hypot(b.x - a.x, b.y - a.y);
    const rise = b.z - a.z;
    segs.push({
      from: a.stationFt, to: b.stationFt,
      lengthFt: +(run / 12).toFixed(1),
      riseFt: +(rise / 12).toFixed(1),
      gradePct: +((rise / run) * 100).toFixed(1),
    });
  }
  const lengthFt = +(pts[pts.length - 1].stationFt).toFixed(0);
  const grades = segs.map(s => Math.abs(s.gradePct));
  const cuts = pts.map(p => -p.cutFillFt);
  return {
    pts, segs, lengthFt,
    maxGradePct: +Math.max(...grades).toFixed(1),
    avgGradePct: +(grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(1),
    totalRiseFt: +((pts[pts.length - 1].z - pts[0].z) / 12).toFixed(1),
    switchbacks: alignment.length - 2,
    groundGradePct: alignment.gGroundPct,
    maxCutFt: +Math.max(0, ...cuts).toFixed(1),
    maxFillFt: +Math.max(0, ...cuts.map(c => -c)).toFixed(1),
    daylightsAtRoad: Math.abs(pts[pts.length - 1].cutFillFt) < 1,
    overFireLimit: Math.max(...grades) > DRIVE_LIMITS.fireApparatusPct,
    overSustained: Math.max(...grades) > DRIVE_LIMITS.sustainedPct,
  };
}

// ── DRIVE CORRIDOR EARTHWORK ────────────────────────────────────────────────
// A side-hill bench on a 30% cross-slope is mostly cut. This integrates a real
// cross-section at every station rather than multiplying an average by a guess:
// a level platform, a backslope at 1.5H:1V into the hill, and a fill slope at
// 2H:1V on the outside, each run until it meets natural grade.
export const DRIVE_SECTION = {
  widthFt: 14, backslope: 1.5, fillslope: 2.0,
  ditchFt: 2, status: 'ASSUMED — a geotechnical report sets buildable slope ratios, not this file',
};

export function driveEarthwork(alignment = DRIVE_ALIGNMENT) {
  const prof = driveProfile(alignment);
  const half = DRIVE_SECTION.widthFt / 2 + DRIVE_SECTION.ditchFt;
  let cutCY = 0, fillCY = 0, disturbedSf = 0, maxReachFt = 0;
  const stationStep = 10;                                  // ft between sections

  const total = prof.lengthFt;
  for (let s = 0; s <= total; s += stationStep) {
    // interpolate position, heading and design elevation at this station
    const sIn = s * 12;
    let i = 1;
    while (i < prof.pts.length - 1 && prof.pts[i].stationFt * 12 < sIn) i++;
    const a = prof.pts[i - 1], b = prof.pts[i];
    const t = (sIn - a.stationFt * 12) / ((b.stationFt - a.stationFt) * 12 || 1);
    const x = a.x + t * (b.x - a.x), y = a.y + t * (b.y - a.y);
    const z = COURT.z + sIn * (DRIVE_DESIGN_GRADE / 100);
    const L = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const nx = -(b.y - a.y) / L, ny = (b.x - a.x) / L;     // unit normal

    let cutSf = 0, fillSf = 0, reach = half;
    for (let o = -60; o <= 60; o += 0.5) {                 // ft offset from centreline
      const gz = natural(x + nx * o * 12, y + ny * o * 12); // inches
      let fz;                                              // finished, inches
      if (Math.abs(o) <= half) fz = z;
      else {
        const over = Math.abs(o) - half;
        // uphill side backslope climbs; downhill side fill slope falls.
        const climbing = gz > z;
        fz = climbing ? z + over * 12 / DRIVE_SECTION.backslope
                      : z - over * 12 / DRIVE_SECTION.fillslope;
        if (climbing && fz >= gz) continue;                // slope has daylighted
        if (!climbing && fz <= gz) continue;
      }
      const d = (fz - gz) / 12;                            // ft, + = fill
      if (Math.abs(d) < 0.1) continue;
      if (d < 0) cutSf += -d * 0.5; else fillSf += d * 0.5;
      reach = Math.max(reach, Math.abs(o));
    }
    cutCY += (cutSf * stationStep) / 27;
    fillCY += (fillSf * stationStep) / 27;
    disturbedSf += reach * 2 * stationStep;
    maxReachFt = Math.max(maxReachFt, reach);
  }
  return {
    cutCY: Math.round(cutCY), fillCY: Math.round(fillCY),
    netCY: Math.round(cutCY - fillCY),
    disturbedSf: Math.round(disturbedSf),
    disturbedAcres: +(disturbedSf / 43560).toFixed(2),
    maxCorridorWidthFt: +(maxReachFt * 2).toFixed(0),
    note: 'Corridor volumes from an integrated cross-section every 10 ft over the ASSUMED plane. No survey, no geotechnical report — the method is real, the ground is not.',
  };
}

// ── EARTHWORK ───────────────────────────────────────────────────────────────
/** Cut and fill by sampling finished against natural over the disturbed area. */
export function earthwork({ x0 = ft(-70), x1 = ft(170), y0 = ft(-40), y1 = ft(110), step = ft(2) } = {}) {
  let cut = 0, fill = 0, disturbed = 0, maxCut = 0, maxFill = 0;
  const cellSf = (step / 12) ** 2;
  for (let x = x0; x <= x1; x += step) {
    for (let y = y0; y <= y1; y += step) {
      // The corridor is priced by driveEarthwork(); counting it here too would
      // report the same cubic yards twice and call it rigour.
      if (driveBench(x, y) !== null) continue;
      const d = finished(x, y) - natural(x, y);   // inches, + = fill
      if (Math.abs(d) < 2) continue;
      disturbed += cellSf;
      const cy = (Math.abs(d) / 12) * cellSf / 27;   // cubic yards
      if (d < 0) { cut += cy; maxCut = Math.max(maxCut, -d / 12); }
      else { fill += cy; maxFill = Math.max(maxFill, d / 12); }
    }
  }
  return {
    cutCY: Math.round(cut), fillCY: Math.round(fill),
    netCY: Math.round(cut - fill),
    balanced: Math.abs(cut - fill) < Math.max(cut, fill) * 0.25,
    maxCutFt: +maxCut.toFixed(1), maxFillFt: +maxFill.toFixed(1),
    disturbedSf: Math.round(disturbed),
    disturbedAcres: +(disturbed / 43560).toFixed(2),
  };
}

/**
 * The real limit of disturbance around the pad — the line where finished grade
 * stops differing from natural by more than 2". Traced from the surfaces, not
 * drawn as a rectangle around them, because a rectangle is a guess and this is
 * the line an erosion control plan is measured against.
 */
export function disturbanceBoundary(opts = {}) {
  return contours({
    surface: (x, y) => Math.abs(finished(x, y) - natural(x, y)),
    levels: [2], step: ft(3), ...opts,
  });
}

/** Roof + paving area, for the drainage that has to go somewhere. */
export function impervious() {
  const roof = ((ft(72) + 96) * (ft(26) + 72)) + ((LINK.x1 - LINK.x0 + 48) * (LINK.y1 - LINK.y0 + 48))
             + ((GARAGE.x1 - GARAGE.x0 + 48) * (GARAGE.y1 - GARAGE.y0 + 48));
  const box = (r) => (r.x1 - r.x0) * (r.y1 - r.y0);
  const court = box(COURT.main) + box(COURT.apron);
  const drive = driveProfile().lengthFt * 12 * ft(14);
  const terrace = (DECKS[1].x1 - DECKS[1].x0) * (DECKS[1].y1 - DECKS[1].y0);
  const sf = (a) => Math.round(a / 144);
  return { roofSf: sf(roof), courtSf: sf(court), driveSf: sf(drive), terraceSf: sf(terrace),
           totalSf: sf(roof + court + drive + terrace),
           totalAcres: +(sf(roof + court + drive + terrace) / 43560).toFixed(2) };
}

export const EROSION = {
  ncThresholdAcres: 1.0,
  status: 'UNVERIFIED — the NC Sedimentation Pollution Control Act threshold is commonly stated as one acre, and Watauga County may run a delegated local program with a LOWER trigger. Confirm before assuming no plan is needed.',
};

/**
 * The whole project, not half of it.
 *
 * The pad figure alone reads as comfortably under an acre. Add the driveway
 * corridor — which on a side-hill bench is wide — and the answer changes. This
 * is the number that decides whether a sedimentation and erosion control plan
 * and a permit are required, so it is computed rather than assumed.
 */
export function siteTotals() {
  const pad = earthwork();
  const drive = driveEarthwork();
  const disturbedSf = pad.disturbedSf + drive.disturbedSf;
  const acres = disturbedSf / 43560;
  return {
    pad, drive,
    cutCY: pad.cutCY + drive.cutCY,
    fillCY: pad.fillCY + drive.fillCY,
    netCY: pad.netCY + drive.netCY,
    disturbedSf, disturbedAcres: +acres.toFixed(2),
    overErosionThreshold: acres > EROSION.ncThresholdAcres,
    truckloads: Math.ceil((pad.netCY + drive.netCY) / 12),   // ~12 CY tandem
  };
}

export default { natural, finished, contours, disturbanceBoundary, COURT,
  DRIVE_ALIGNMENT, DRIVE_LIMITS, DRIVE_SECTION, generateAlignment, driveProfile,
  driveEarthwork, earthwork, impervious, siteTotals, EROSION };
