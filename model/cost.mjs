// HENRY HOUSE — WHAT IT COSTS.
//
// docs/05-what-is-wrong.md B.7: "there is not a single number anywhere in the
// package. That is the fastest way for a design like this to die." A house is
// not designed until somebody knows roughly what it costs, because the price is
// what decides whether it is built, shrunk, or abandoned.
//
// ─────────────────────────────────────────────────────────────────────────────
// TWO KINDS OF NUMBER LIVE IN THIS FILE, AND THEY ARE NOT THE SAME KIND.
//
//   QUANTITIES are DERIVED. Square feet, cubic yards, linear feet of drive,
//   square feet of glass, counts of fixtures — every one is computed from the
//   same model that draws the plans. If the house changes, they change.
//
//   UNIT COSTS are ASSUMED. Every $/unit below is a placeholder. This container
//   has no outbound access; no supplier, no RSMeans, no local bid was consulted.
//   A Watauga County general contractor must replace all of them.
//
// So: trust the takeoff, distrust the money, and read the range rather than the
// midpoint. A schematic estimate that reports one number is lying about how
// much it knows.
// ─────────────────────────────────────────────────────────────────────────────

import { areaSummary, DECKS, BAR, LINK, GARAGE, STRUCTURE, LEVELS } from './geometry.mjs';
import { OPENINGS, GARAGE_OPENINGS } from './openings.mjs';
import { FIXTURES } from './fixtures.mjs';
import { allRuns } from './systems.mjs';
import { siteTotals, driveProfile, impervious } from './site.mjs';
import { SPINE_WALL, COURT_WALL, MEMBERS } from './structure.mjs';

const sf = (sqIn) => sqIn / 144;

// ── QUANTITY TAKEOFF — computed from the model ──────────────────────────────
export function takeoff() {
  const A = areaSummary();
  const heated = A.L0.gross + A.L1.gross + A.L2.gross + A.LINK.gross;
  const glazed = [...OPENINGS, ...GARAGE_OPENINGS]
    .filter(o => ['window', 'fixed', 'slider'].includes(o.type))
    .reduce((s, o) => s + sf(o.len * (o.head - o.sill)), 0);

  // exterior envelope: perimeter x storey height, per volume, less glazing
  const perim = (r) => 2 * ((r.x1 - r.x0) + (r.y1 - r.y0));
  const wallSf = sf(perim(BAR) * (LEVELS[1].ffe - LEVELS[0].ffe))       // lower storey
               + sf(perim(BAR) * (LEVELS[2].ffe - LEVELS[1].ffe))       // main storey
               + sf(perim({ x0: 576, x1: 864, y0: 0, y1: 312 }) * 120)  // upper storey
               + sf(perim(LINK) * 120) + sf(perim(GARAGE) * 132)
               - glazed;

  const site = siteTotals();
  const drive = driveProfile();
  const imp = impervious();

  // the spine: one wall doing four jobs, priced as the retaining structure it is
  const spineSf = sf((STRUCTURE.spine.x1 - STRUCTURE.spine.x0) * (STRUCTURE.spine.zTopEast - STRUCTURE.spine.zBot));

  const runs = allRuns();
  const runLf = runs.reduce((s, r) => {
    if (!r.a || !r.b) return s;
    return s + Math.hypot(r.b[0] - r.a[0], r.b[1] - r.a[1], (r.b[2] ?? 0) - (r.a[2] ?? 0)) / 12;
  }, 0);

  const plumbed = FIXTURES.filter(f => ['wc', 'lav', 'lav2', 'tub', 'shower36', 'shower42', 'sink', 'dw', 'washer'].includes(f.type)).length;

  return {
    heatedSf: Math.round(heated),
    garageSf: A.GARAGE.gross,
    deckSf: Math.round(sf((DECKS[0].x1 - DECKS[0].x0) * (DECKS[0].y1 - DECKS[0].y0))),
    terraceSf: Math.round(sf((DECKS[1].x1 - DECKS[1].x0) * (DECKS[1].y1 - DECKS[1].y0))),
    roofSf: imp.roofSf,
    wallSf: Math.round(wallSf),
    glazedSf: Math.round(glazed),
    glazingPct: +((glazed / heated) * 100).toFixed(1),
    spineSf: Math.round(spineSf),
    courtWallSf: Math.round(136 * COURT_WALL.retainedFt),   // IF the cut is retained instead of laid back
    earthCY: site.cutCY + site.fillCY,
    haulCY: site.netCY,
    driveLf: drive.lengthFt,
    driveSf: imp.driveSf,
    courtSf: imp.courtSf,
    plumbedFixtures: plumbed,
    systemsLf: Math.round(runLf),
    glulamMembers: MEMBERS.length,
    disturbedAcres: site.disturbedAcres,
  };
}

// ── UNIT COSTS — ALL ASSUMED, ALL PLACEHOLDERS ──────────────────────────────
// Ranges, not points. A steep-site custom house in a mountain county is at the
// high end of anything a national average would suggest: access is hard, the
// trade pool is thin, and winter closes the site.
export const UNIT = {
  // EXCLUDES everything priced on its own line below. A $/sf rate that already
  // contains mechanical, glazing and foundations, added to separate lines for
  // mechanical, glazing and foundations, counts them twice and reads as rigour.
  heatedSf:   { lo: 290, hi: 430,  unit: 'sf',  what: 'Shell, interior, finishes, cabinetry. EXCLUDES site, retaining, glazing premium, mechanical, water, wastewater and standby — each priced separately' },
  garageSf:   { lo: 140, hi: 220,  unit: 'sf',  what: 'Detached, unheated, slab on grade' },
  deckSf:     { lo: 90,  hi: 160,  unit: 'sf',  what: 'Elevated deck on steel posts, cable guard' },
  terraceSf:  { lo: 55,  hi: 95,   unit: 'sf',  what: 'Stone-faced retained terrace' },
  glazedSf:   { lo: 90,  hi: 180,  unit: 'sf',  what: 'Triple-glazed, thermally broken, large lift-slide units' },
  spineSf:    { lo: 85,  hi: 150,  unit: 'sf',  what: 'Engineered cast-in-place retaining wall, waterproofed and drained' },
  courtWallSf:{ lo: 95,  hi: 170,  unit: 'sf',  what: 'ONLY IF the motor court cut is retained instead of laid back' },
  earthCY:    { lo: 14,  hi: 26,   unit: 'CY',  what: 'Excavate and place on a 30% slope' },
  haulCY:     { lo: 22,  hi: 45,   unit: 'CY',  what: 'Load, haul off a mountain road, and tip' },
  driveLf:    { lo: 110, hi: 240,  unit: 'LF',  what: 'Bench, base, surface, ditch and culverts' },
  erosion:    { lo: 12000, hi: 34000, unit: 'LS', what: 'Sedimentation and erosion control, over one acre disturbed' },
  septic:     { lo: 30000, hi: 75000, unit: 'LS', what: 'Alternative / drip dispersal system on unevaluated soils' },
  water:      { lo: 18000, hi: 42000, unit: 'LS', what: 'Spring capture, cistern, pump, filtration, UV' },
  standby:    { lo: 26000, hi: 55000, unit: 'LS', what: 'Battery, inverter, generator, transfer' },
  hvac:       { lo: 34000, hi: 68000, unit: 'LS', what: 'Ducted heat pumps, ERV, hydronic zone' },
  status: 'EVERY VALUE ABOVE IS INVENTED. No supplier, no cost database and no local bid was consulted — this container has no outbound access. Replace all of them with a Watauga County GC\'s numbers before this estimate means anything.',
};

const LINE = [
  ['HOUSE — heated, three levels + link (excl. items below)', 'heatedSf', 'heatedSf'],
  ['GARAGE — detached, unheated', 'garageSf', 'garageSf'],
  ['MAIN DECK', 'deckSf', 'deckSf'],
  ['LOWER TERRACE', 'terraceSf', 'terraceSf'],
  ['GLAZING — premium above shell allowance', 'glazedSf', 'glazedSf'],
  ['CONCRETE SPINE — retains, carries, braces, stores heat', 'spineSf', 'spineSf'],
  ['EARTHWORK — cut and fill placed', 'earthCY', 'earthCY'],
  ['SPOIL — hauled off site', 'haulCY', 'haulCY'],
  ['DRIVEWAY — 5 switchbacks at 11%', 'driveLf', 'driveLf'],
];

const LUMP = [
  ['EROSION CONTROL — over the one-acre threshold', 'erosion'],
  ['WASTEWATER — alternative system', 'septic'],
  ['WATER — spring, cistern, treatment', 'water'],
  ['STANDBY POWER — battery + generator', 'standby'],
  ['MECHANICAL — heat pumps, ERV, hydronic', 'hvac'],
];

export function estimate({ contingencyPct = 15, softCostPct = 12 } = {}) {
  const q = takeoff();
  const lines = [];
  let lo = 0, hi = 0;

  for (const [name, qKey, uKey] of LINE) {
    const u = UNIT[uKey], n = q[qKey];
    const l = n * u.lo, h = n * u.hi;
    lo += l; hi += h;
    lines.push({ name, qty: n, unit: u.unit, rateLo: u.lo, rateHi: u.hi, lo: l, hi: h, what: u.what });
  }
  for (const [name, uKey] of LUMP) {
    const u = UNIT[uKey];
    lo += u.lo; hi += u.hi;
    lines.push({ name, qty: 1, unit: 'LS', rateLo: u.lo, rateHi: u.hi, lo: u.lo, hi: u.hi, what: u.what });
  }

  const conting = { lo: lo * contingencyPct / 100, hi: hi * contingencyPct / 100 };
  const soft = { lo: lo * softCostPct / 100, hi: hi * softCostPct / 100 };
  const totLo = lo + conting.lo + soft.lo;
  const totHi = hi + conting.hi + soft.hi;

  // The alternative that is not in the total, because the design lays the cut
  // back instead. Priced so the choice is visible rather than buried.
  const courtWallAlt = {
    lo: q.courtWallSf * UNIT.courtWallSf.lo,
    hi: q.courtWallSf * UNIT.courtWallSf.hi,
    note: `IF the geotechnical report says the ${COURT_WALL.retainedFt} ft motor court cut will not stand at 1.5H:1V, it must be retained. ${q.courtWallSf} sf of engineered wall, NOT in the total above.`,
  };

  return {
    takeoff: q, lines,
    construction: { lo, hi },
    contingency: conting, contingencyPct,
    soft, softCostPct,
    total: { lo: totLo, hi: totHi },
    perSf: { lo: totLo / q.heatedSf, hi: totHi / q.heatedSf },
    courtWallAlt,
    status: UNIT.status,
  };
}

export default { takeoff, estimate, UNIT };
