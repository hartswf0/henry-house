// HENRY HOUSE — ALTERNATIVE SCHEMES.
//
// Driven by the reference pack, and specifically by the instruction printed at
// the bottom of the blueprint wall:
//
//   "Do not ask whether HENRY resembles these houses. Put HENRY's plan and
//    section beside them at the same scale. Compare conditioned area, sheltered
//    area, perimeter, wet-wall length, foundations, roof intersections, ground
//    contacts, rooms served, future capacity, and cost."
//
// So this file does not describe alternatives. It BUILDS them, in the same site
// frame as the current design, over the same terrain, served by the same drive
// — and computes that exact list for every one of them. The comparison is the
// deliverable; the pretty picture is downstream of it.
//
// ─────────────────────────────────────────────────────────────────────────────
// WHAT IS BORROWED AND WHAT IS NOT
//
// Every scheme names one transferable OPERATION and one thing it must not copy.
// The references are built work by other people; the operation is portable, the
// form is not. Rural Studio is the build-intelligence bar. The mountain cabins
// are the visual and sectional bar. The current design is the opponent.
// ─────────────────────────────────────────────────────────────────────────────

import { ft } from './units.mjs';
import { SITE_SLOPE } from './geometry.mjs';

const natural = (x, y) => SITE_SLOPE.grade(x, y);

// ── vocabulary ──────────────────────────────────────────────────────────────
// V = a volume. kind:
//   'cond'    conditioned floor area
//   'shelt'   roofed but unconditioned — porch, undercroft, breezeway, work bay
//   'future'  sheltered NOW, conditioned LATER, at no structural cost
// storeys counts conditioned floors. wet = carries plumbing.
const V = (id, kind, x0, y0, w, d, opts = {}) => ({
  ...opts,
  id, kind, x0: ft(x0), y0: ft(y0), x1: ft(x0 + w), y1: ft(y0 + d),
  wFt: w, dFt: d, storeys: opts.storeys ?? 1, ffe: opts.ffe ?? 0,
  wet: !!opts.wet, phase: opts.phase ?? 1, note: opts.note ?? '',
});

// R = a roof plane. Fewer planes and fewer junctions is a real buildability and
// leak metric, not an aesthetic preference.
const R = (id, x0, y0, w, d, opts = {}) => ({
  ...opts,
  id, x0: ft(x0), y0: ft(y0), x1: ft(x0 + w), y1: ft(y0 + d),
  pitch: opts.pitch ?? 3, fall: opts.fall ?? '-Y',
  // zLow is declared in FEET like every other dimension here. It was being
  // consumed as inches, which parked every roof at ankle height.
  zLow: ft(opts.zLow ?? 12),
});

// G = how the scheme meets the hill. This is the argument.
const piers = (pts, diaFt = 2) => ({ kind: 'piers', pts: pts.map(([x, y]) => [ft(x), ft(y)]), diaFt });
const bench = (x0, y0, w, d) => ({ kind: 'bench', x0: ft(x0), y0: ft(y0), x1: ft(x0 + w), y1: ft(y0 + d) });
const plinth = (x0, y0, w, d) => ({ kind: 'plinth', x0: ft(x0), y0: ft(y0), x1: ft(x0 + w), y1: ft(y0 + d) });

// ── THE SCHEMES ─────────────────────────────────────────────────────────────
export const SCHEMES = [

  {
    id: 'S0-SPINE', name: 'THE SPINE', tag: 'CONTROL — the current design',
    from: 'Knob Hill (sectional bar) + the existing package',
    operation: 'A concrete spine retains the cut, carries every rib, braces the building and stores heat. One element, four jobs.',
    doNotCopy: null,
    henryTest: 'It is the opponent. It must be beaten on mass, phasing, cost, ground relationship and clarity — while keeping its systems intelligence.',
    rooms: 4, roomsNote: '4 bedrooms, 3.5 baths, office',
    volumes: [
      V('bar-w', 'cond', 0, 0, 36, 26, { storeys: 2, ffe: 0, wet: true, note: 'walkout + main' }),
      V('bar-e', 'cond', 36, 0, 36, 26, { storeys: 1, ffe: 10, wet: true }),
      V('upper', 'cond', 48, 0, 24, 26, { storeys: 1, ffe: 20, wet: true }),
      V('link', 'cond', 72, 5, 15, 21, { storeys: 1, ffe: 10, wet: true }),
      V('breeze', 'shelt', 87, 5, 9, 21, { ffe: 10 }),
      V('garage', 'shelt', 96, 5, 24, 24, { ffe: 9.3 }),
      V('deck', 'shelt', 24, -12, 48, 12, { ffe: 9.3 }),
    ],
    roofs: [R('RA', -2, -4, 50, 32), R('RB', 46, -4, 26, 32, { zLow: 20 }),
            R('RL', 72, 2, 15, 26, { pitch: 1 }), R('RG', 96, 3, 24, 28, { pitch: 4 })],
    ground: bench(-2, -2, 76, 32),
    wetWallFt: 87, wetNote: '72 ft service band along the uphill wall, plus 15 ft in the link',
    growthTouchesRoof: false,
    growthNote: 'no phasing claimed',
    phases: [{ n: 1, label: 'Built at once', condSf: 3747 }],
  },

  {
    id: 'S1-ARMATURE', name: 'THE ARMATURE', tag: 'phased growth under one permanent roof',
    from: "Rev. Walker's Home — ~500 sf initial house under a ~1,900 sf five-bay shelter",
    operation: 'Build the durable thing first: a five-bay frame and one roof, standing over the slope. Enclose two bays now. The rest is covered territory that becomes rooms later WITHOUT cutting into the original roof.',
    doNotCopy: 'The Alabama vernacular, the gable, the porch detailing. The transferable thing is the sequence, not the look.',
    henryTest: 'Can a mountain skeleton, roof and service artery make Phase 1 a complete house while creating protected future bays?',
    rooms: 2, roomsNote: 'Phase 1: 1 bedroom + 1 bath. Mature: 4 bedrooms, 2 baths.',
    volumes: [
      V('bay2', 'cond', 14, 2, 14, 22, { storeys: 1, ffe: 4, wet: true, phase: 1, note: 'living + kitchen' }),
      V('bay3', 'cond', 28, 2, 14, 22, { storeys: 1, ffe: 4, wet: true, phase: 1, note: 'bed + bath + the artery' }),
      V('bay1', 'future', 0, 2, 14, 22, { ffe: 4, phase: 2, note: 'work bay now, bedroom later' }),
      V('bay4', 'future', 42, 2, 14, 22, { ffe: 4, phase: 2, note: 'covered deck now, bedrooms later' }),
      V('bay5', 'future', 56, 2, 14, 22, { ffe: 4, phase: 3, note: 'undercroft / store now' }),
      V('porch', 'shelt', 0, -8, 70, 10, { ffe: 4, note: 'the roof continues past the frame' }),
    ],
    roofs: [R('R1', -3, -10, 76, 38, { pitch: 3, zLow: 12 })],
    wetWallFt: 22, wetNote: 'one artery through bay 3',
    ground: piers([[2, 4], [2, 22], [16, 4], [16, 22], [30, 4], [30, 22],
                   [44, 4], [44, 22], [58, 4], [58, 22], [68, 4], [68, 22]]),
    growthTouchesRoof: false,
    growthNote: 'bays infill under the roof that is already there — the whole point of the reference',
    phases: [
      { n: 1, label: 'Two bays enclosed, five bays roofed', condSf: 616 },
      { n: 2, label: 'Bays 1 and 4 infilled', condSf: 1232 },
      { n: 3, label: 'Bay 5 infilled', condSf: 1540 },
    ],
  },

  {
    id: 'S2-BRIDGE', name: 'THE BRIDGE', tag: 'span the hill instead of cutting it',
    from: '20K Truss Home + 20K Bridge Home — light truss walls span the long dimension and continue into porch territory',
    operation: 'Let the structure span so the building touches the ground in a handful of places instead of along a continuous wall. Utility core inside a rational skeleton; structure sets the dimensions.',
    doNotCopy: 'The 20K cost model. This is a mountain house with mountain loads — the borrowed idea is the span logic, not the budget.',
    henryTest: 'Does spanning actually beat benching once you price the trusses against the earthwork it avoids?',
    rooms: 3, roomsNote: '3 bedrooms, 2 baths, one long room',
    volumes: [
      V('deckW', 'shelt', -10, 2, 10, 20, { ffe: 13, note: 'the span continues past the last pier' }),
      V('body', 'cond', 0, 2, 60, 20, { storeys: 1, ffe: 13, wet: true }),
      V('deckE', 'shelt', 60, 2, 14, 20, { ffe: 13 }),
      V('under', 'future', 8, 2, 24, 20, { ffe: 0, note: 'dry undercroft under the span — a later level' }),
    ],
    roofs: [R('R1', -12, -1, 88, 26, { pitch: 2, zLow: 24 })],
    wetWallFt: 20, wetNote: 'a utility core inside the span',
    ground: piers([[2, 4], [2, 20], [30, 4], [30, 20], [58, 4], [58, 20]], 3),
    growthTouchesRoof: false,
    growthNote: 'the undercroft is enclosed BELOW the span; nothing above is touched',
    phases: [
      { n: 1, label: 'The span and the long room', condSf: 1200 },
      { n: 2, label: 'Undercroft enclosed beneath it', condSf: 1680 },
    ],
  },

  {
    id: 'S3-NARROW', name: 'THE NARROW', tag: 'how narrow before it stops being generous',
    from: "Geraldine's Home + Sylvia 2/1, which was actually adapted to a steep site in Madison County, North Carolina — 856 sf, 22 × 48, 206 sf porch",
    operation: 'A body narrow enough to daylight and cross-ventilate from both sides, a service bar down the uphill edge, and a dogtrot cut through the middle that costs nothing and does everything.',
    doNotCopy: 'The product-line plan itself. This site has 30% cross-slope and snow; the borrowed thing is the section, the width and the discipline about circulation.',
    henryTest: 'How narrow can Henry become before it stops being generous? Sylvia 2/1 says 22 ft on a steep NC site.',
    rooms: 3, roomsNote: '3 bedrooms, 2 baths, no corridor',
    volumes: [
      V('west', 'cond', 0, 2, 26, 22, { storeys: 2, ffe: 0, wet: true, note: 'walks out low' }),
      V('dog', 'shelt', 26, 2, 10, 22, { ffe: 8, note: 'the dogtrot — through-view, through-breeze, the front door' }),
      V('east', 'cond', 36, 2, 26, 22, { storeys: 1, ffe: 8, wet: true }),
      V('porch', 'shelt', 0, -8, 62, 8, { ffe: 8 }),
    ],
    roofs: [R('R1', -2, -10, 66, 36, { pitch: 4, zLow: 11 })],
    wetWallFt: 52, wetNote: 'a service bar down the uphill edge of both bodies',
    ground: bench(-2, 0, 66, 26),
    growthTouchesRoof: false,
    growthNote: 'the single roof plane already covers the second body',
    phases: [
      { n: 1, label: 'West body + dogtrot', condSf: 1144 },
      { n: 2, label: 'East body across the dogtrot', condSf: 1716 },
    ],
  },

  {
    id: 'S4-CORE', name: 'THE CORE', tag: 'what must be permanent, and what should stay transient',
    from: "Myers' Home — expandable shell around a centralised stair / bath / laundry / utility core",
    operation: 'Concentrate every expensive and fixed thing — stair, plumbing, flue, mechanical, structure — into one small permanent core. Everything around it is light, cheap and re-plannable without touching the core.',
    doNotCopy: 'The attic truss and the shell proportions. The transferable thing is the DIVISION: permanent versus transient.',
    henryTest: 'What in this house must be permanent, and what should remain transient? Anything permanent that did not have to be is a mistake you live with.',
    rooms: 4, roomsNote: '2 bedrooms now, 4 later, all off the core',
    volumes: [
      V('core', 'cond', 22, 8, 16, 20, { storeys: 2, ffe: 0, wet: true, core: true,
        note: 'stair, both baths, laundry, mechanical, flue — the only permanent thing' }),
      V('shellW', 'cond', 4, 6, 18, 24, { storeys: 1, ffe: 6, phase: 1 }),
      V('shellE', 'cond', 38, 6, 18, 24, { storeys: 1, ffe: 6, phase: 1 }),
      V('shellN', 'future', 22, 28, 16, 14, { ffe: 6, phase: 2, note: 'sheltered work bay, later two rooms' }),
      V('porch', 'shelt', 4, -6, 52, 12, { ffe: 6 }),
    ],
    roofs: [R('R1', 2, -8, 56, 36, { pitch: 3, zLow: 13 }), R('R2', 20, 26, 20, 18, { pitch: 3, zLow: 15 })],
    wetWallFt: 36, wetNote: 'everything wet inside the 16 x 20 core',
    ground: bench(2, 4, 56, 40),
    growthTouchesRoof: false,
    growthNote: 'the north bay is already roofed by R2',
    phases: [
      { n: 1, label: 'Core + two wings', condSf: 1184 },
      { n: 2, label: 'North bay enclosed', condSf: 1408 },
    ],
  },

  {
    id: 'S5-PERCH', name: 'THE PERCH', tag: 'small footprint, large presence',
    from: 'Sol Duc Cabin (350 sf, lifted, one enormous opening, closes completely) and Vermont Cabin (750 sf, monumental for its size)',
    operation: 'Refuse the horizontal. One very small footprint, lifted clear of the ground, stacked vertically, with a single enormous opening on the downhill face and a shutter that closes the whole thing when nobody is there.',
    doNotCopy: 'The steel plate aesthetic and the hand-crank theatre. The transferable things are the tiny ground contact, the vertical stack, and resilience expressed as a STATE rather than as equipment in a closet.',
    henryTest: 'On a 30% slope, does going up beat going along? And can a house this small still hold a family at Christmas?',
    rooms: 3, roomsNote: '2 bedrooms + a loft, 1.5 baths',
    volumes: [
      V('stack', 'cond', 20, 6, 24, 26, { storeys: 3, ffe: 6, wet: true }),
      V('deck', 'shelt', 20, -10, 24, 16, { ffe: 6, note: 'the opening lands here' }),
      V('under', 'shelt', 20, 6, 24, 26, { ffe: -6, note: 'dry undercroft — store, ski, wood' }),
    ],
    roofs: [R('R1', 17, 2, 30, 32, { pitch: 2, zLow: 34 })],
    wetWallFt: 26, wetNote: 'one stack, three floors',
    ground: plinth(24, 12, 16, 14),
    growthTouchesRoof: false,
    growthNote: 'no phasing claimed',
    phases: [{ n: 1, label: 'Built at once — it is too small to phase', condSf: 1872 }],
  },

  {
    id: 'S6-TOWER', name: 'THE TOWER', tag: 'the counter-hypothesis',
    from: 'The 18 × 18 House — "do not assume the contour bar wins"',
    operation: 'If the buildable shelf is small, vertical growth is cheaper than long foundations. One 18 ft square, four levels, one stair, one stack. The foundation is the smallest thing on the site.',
    doNotCopy: 'Nothing formal. This scheme exists to falsify the long bar, and it earns its place only if the numbers say so.',
    henryTest: 'Put it beside the bar and compare foundation length, perimeter per square foot, and earthwork. If it wins, the bar was a habit.',
    rooms: 3, roomsNote: '3 bedrooms stacked, 2 baths on one stack',
    volumes: [
      V('tower', 'cond', 26, 8, 18, 18, { storeys: 4, ffe: 2, wet: true }),
      V('deck', 'shelt', 26, -6, 18, 14, { ffe: 2 }),
      V('shed', 'shelt', 46, 8, 12, 18, { ffe: 2, note: 'single-storey lean-to: entry, store, wood' }),
    ],
    roofs: [R('R1', 23, 5, 24, 24, { pitch: 2, zLow: 44 }), R('R2', 44, 6, 16, 22, { pitch: 3, zLow: 12 })],
    wetWallFt: 18, wetNote: 'one stack, four floors',
    ground: bench(24, 6, 22, 22),
    growthTouchesRoof: true,
    growthNote: 'adding levels means lifting and re-setting the roof. Vertical growth is cheap in foundation and expensive in roof, and the reference set is explicit that growth must not cut into work already done',
    phases: [{ n: 1, label: 'Two lower levels', condSf: 648 }, { n: 2, label: 'Two upper levels', condSf: 1296 }],
  },
];

export const schemeById = (id) => SCHEMES.find(s => s.id === id);

/**
 * Where a roof plane actually starts.
 *
 * zLow is a declared minimum, not the answer: a roof must sit ON the walls it
 * covers. Taking the declaration literally put the Spine's roof twelve feet up
 * through a twenty-foot volume. Derived here so the plan, the section and the
 * 3D cannot disagree about it.
 */
export function roofBase(scheme, r) {
  const covered = scheme.volumes.filter(v => v.kind !== 'shelt' &&
    v.x0 < r.x1 && v.x1 > r.x0 && v.y0 < r.y1 && v.y1 > r.y0);
  if (!covered.length) return r.zLow;
  return Math.max(r.zLow, ...covered.map(v => ft(v.ffe) + 120 * (v.storeys ?? 1)));
}

// ── METRICS — the reference test, computed ──────────────────────────────────
const STEP = 12;                                   // 1 ft raster

/** Rasterise the union of a set of rectangles; returns a lookup + bounds. */
function raster(rects, pad = ft(4)) {
  if (!rects.length) return null;
  const x0 = Math.min(...rects.map(r => r.x0)) - pad, x1 = Math.max(...rects.map(r => r.x1)) + pad;
  const y0 = Math.min(...rects.map(r => r.y0)) - pad, y1 = Math.max(...rects.map(r => r.y1)) + pad;
  const nx = Math.ceil((x1 - x0) / STEP), ny = Math.ceil((y1 - y0) / STEP);
  const g = new Uint8Array(nx * ny);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const px = x0 + (i + 0.5) * STEP, py = y0 + (j + 0.5) * STEP;
    if (rects.some(r => px >= r.x0 && px < r.x1 && py >= r.y0 && py < r.y1)) g[j * nx + i] = 1;
  }
  return { g, nx, ny, x0, y0 };
}

/**
 * Perimeter of the union, in feet.
 *
 * Measured off the raster rather than summed per volume, because two volumes
 * that touch do not each pay for the shared wall — and the whole point of the
 * Rural Studio comparison is that perimeter is what costs money.
 */
function unionPerimeter(rects) {
  const r = raster(rects);
  if (!r) return 0;
  const { g, nx, ny } = r;
  const at = (i, j) => (i < 0 || j < 0 || i >= nx || j >= ny ? 0 : g[j * nx + i]);
  let edges = 0;
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    if (!at(i, j)) continue;
    if (!at(i - 1, j)) edges++;
    if (!at(i + 1, j)) edges++;
    if (!at(i, j - 1)) edges++;
    if (!at(i, j + 1)) edges++;
  }
  return edges;                                     // one edge = 1 ft
}

/** Roof junctions: pairs of planes that touch or overlap. Every one is a leak. */
function roofJunctions(roofs) {
  let n = 0;
  for (let i = 0; i < roofs.length; i++) for (let j = i + 1; j < roofs.length; j++) {
    const a = roofs[i], b = roofs[j];
    const gap = 6;
    if (a.x0 - gap < b.x1 && b.x0 - gap < a.x1 && a.y0 - gap < b.y1 && b.y0 - gap < a.y1) n++;
  }
  return n;
}

/** Wet-wall length: the perimeter of the volumes that carry plumbing. */
function wetWallLf(volumes) {
  return unionPerimeter(volumes.filter(v => v.wet));
}

/**
 * Ground contact and the earth it moves.
 *
 * Piers touch the hill in a few square feet and move almost nothing. A bench
 * cuts a level platform and moves whatever the slope demands. This is the
 * number the whole reference pack is pointing at, so it is integrated rather
 * than asserted: for a bench, sample natural grade against the platform.
 */
export function groundMetrics(s) {
  const G = s.ground;
  if (G.kind === 'piers') {
    const areaSf = G.pts.length * Math.PI * (G.diaFt / 2) ** 2;
    // each pier still needs a hole; assume 6 ft deep to competent material
    const cy = (areaSf * 6) / 27;
    return { kind: 'piers', contacts: G.pts.length, contactSf: +areaSf.toFixed(0),
             cutCY: Math.round(cy), maxCutFt: 6, note: `${G.pts.length} piers` };
  }
  const r = G;
  // platform elevation = natural grade at the DOWNHILL edge, so the cut is all
  // on the uphill side and there is no fill perched on a 30% slope
  const zPad = natural((r.x0 + r.x1) / 2, r.y0);
  let cut = 0, fill = 0, maxCut = 0, area = 0;
  for (let x = r.x0; x < r.x1; x += STEP) {
    for (let y = r.y0; y < r.y1; y += STEP) {
      const d = zPad - natural(x + STEP / 2, y + STEP / 2);   // inches, - = cut
      area += 1;
      const cy = (Math.abs(d) / 12) / 27;
      if (d < 0) { cut += cy; maxCut = Math.max(maxCut, -d / 12); } else fill += cy;
    }
  }
  return { kind: G.kind, contacts: 1, contactSf: Math.round(area),
           cutCY: Math.round(cut), fillCY: Math.round(fill),
           maxCutFt: +maxCut.toFixed(1), note: G.kind === 'plinth' ? 'one plinth' : 'benched platform' };
}

export function metrics(s) {
  const cond = s.volumes.filter(v => v.kind === 'cond');
  const shelt = s.volumes.filter(v => v.kind === 'shelt');
  const future = s.volumes.filter(v => v.kind === 'future');

  const areaOf = (v) => v.wFt * v.dFt;
  const conditionedSf = Math.round(cond.reduce((a, v) => a + areaOf(v) * v.storeys, 0));
  const shelteredSf = Math.round(shelt.reduce((a, v) => a + areaOf(v), 0));
  const futureSf = Math.round(future.reduce((a, v) => a + areaOf(v), 0));
  const footprintSf = Math.round(raster([...cond, ...future]) ? unionArea([...cond, ...future]) : 0);

  const perimeterLf = unionPerimeter([...cond, ...future]);
  const g = groundMetrics(s);
  const phase1 = s.phases[0]?.condSf ?? conditionedSf;
  const mature = s.phases[s.phases.length - 1]?.condSf ?? conditionedSf;

  return {
    id: s.id, name: s.name,
    conditionedSf, shelteredSf, futureSf, footprintSf,
    perimeterLf,
    perimeterPerSf: +(perimeterLf / Math.max(1, conditionedSf)).toFixed(3),
    wetWallLf: s.wetWallFt ?? wetWallLf(s.volumes),
    roofPlanes: s.roofs.length,
    roofJunctions: roofJunctions(s.roofs),
    groundContacts: g.contacts, groundContactSf: g.contactSf,
    cutCY: g.cutCY, maxCutFt: g.maxCutFt, groundKind: g.kind, groundNote: g.note,
    rooms: s.rooms,
    phases: s.phases.length,
    phase1Sf: phase1, matureSf: mature,
    futureCapacityPct: +(((mature - phase1) / Math.max(1, phase1)) * 100).toFixed(0),
    growthTouchesRoof: !!s.growthTouchesRoof, growthNote: s.growthNote ?? '',
  };
}

function unionArea(rects) {
  const r = raster(rects, 0);
  if (!r) return 0;
  let n = 0;
  for (let i = 0; i < r.g.length; i++) n += r.g[i];
  return n;
}

export function allMetrics() { return SCHEMES.map(metrics); }

export default { SCHEMES, schemeById, metrics, allMetrics, groundMetrics, roofBase };
