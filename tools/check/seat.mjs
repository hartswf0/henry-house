// THE WALKOUT IS A CLAIM ABOUT THE SLOPE.
//
// The LOWER LEVEL floor sits at Z=0 and bays A–C walk out to the terrace. That
// only works if the grade has fallen to meet them, and the design says by how
// much: 30% across the bar and its terrace. Where the ground does that, the
// walkout is real. Where it does not, something has to give — and what used to
// give was the truth: `fitHouseAt` sets the floor by fitting the assumed plane
// to the terrain and site-v3 then drops the model by that plane's height at the
// pivot, so on the flat river bench the floor landed about 8.6 ft under a storey
// 8.9 ft tall. The house was drawn buried and the only complaint was a large
// number in a fit metric.
//
// These run `seatHouse` over ground whose slope is known exactly, because a
// check against the real DEM would only ever tell you about one hillside.

import { seatHouse, houseAxes } from '../../web/site-fit.mjs';
import { SITE_SLOPE, BAR, DECKS } from '../../model/geometry.mjs';
import { SITE_CONTEXT } from '../../model/site-context.mjs';

const PIVOT_Y = SITE_CONTEXT.placement.modelPivotYFt;
const D2 = DECKS.find((d) => d.id === 'D2');
const TERRACE_Y = D2.y0 / 12 - PIVOT_Y;
const BACK_Y = BAR.y1 / 12 - PIVOT_Y;
const TERRACE_DROP = -D2.top / 12;
const DESIGN_RISE = (SITE_SLOPE.grade(0, BAR.y1) - SITE_SLOPE.grade(0, D2.y0)) / 12;
const SPAN = Math.abs(BACK_Y - TERRACE_Y);

/**
 * Ground at a known cross slope, rising along the house's OWN up-axis.
 *
 * Taken from houseAxes rather than assumed: the first version of this built its
 * hillside along +north and the cross axis at bearing 0 points west, so every
 * slope came back as zero fall and four of these checks failed for a reason that
 * had nothing to do with the code under test.
 */
const BEARING = 0;
const UP = houseAxes(BEARING).up;
const slopeAt = (pct) => (e, n) => (e * UP.east + n * UP.north) * (pct / 100);

let pass = 0, fail = 0;
const check = (name, cond, detail) => {
  if (cond) { pass++; console.log(`[ OK ] ${name.padEnd(16)} ${detail}`); }
  else { fail++; console.log(`[FAIL] ${name.padEnd(16)} ${detail}`); }
};
const seat = (pct) => seatHouse({
  H: slopeAt(pct), east: 0, north: 0, bearing: BEARING,
  terraceY: TERRACE_Y, backY: BACK_Y, terraceDrop: TERRACE_DROP, designRise: DESIGN_RISE,
});

console.log('='.repeat(74));
console.log(`SEATING       the design spends ${DESIGN_RISE.toFixed(1)} ft across ${SPAN.toFixed(0)} ft `
  + `(${(DESIGN_RISE / SPAN * 100).toFixed(0)}%) to make the lower level a walkout`);
console.log('='.repeat(74));

// 1. On the slope the design assumes, the walkout is real and nothing is buried.
{
  const s = seat(DESIGN_RISE / SPAN * 100);
  check('AS DRAWN', s.walksOut, `${s.crossPct.toFixed(0)}% ground — the lower level walks out`);
  check('AS DRAWN', s.shortfall < 0.5, `shortfall ${s.shortfall.toFixed(2)} ft`);
}

// 2. On the flat bench, it is not — and the number must be the whole storey,
//    not a rounding. This is the case that shipped.
{
  const s = seat(1);
  check('FLAT BENCH', !s.walksOut, `1% ground — the walkout is ${s.shortfall.toFixed(1)} ft short`);
  check('FLAT BENCH', s.buried < 1,
    `only ${s.buried.toFixed(2)} ft of earth against the back wall once the floor is seated by the slope`);
  // and the thing that used to happen, stated so it cannot come back quietly
  const asPlaced = DESIGN_RISE * (PIVOT_Y - D2.y0 / 12) / SPAN;
  check('FLAT BENCH', asPlaced > 8,
    `fitting the assumed plane instead would put the floor ${asPlaced.toFixed(1)} ft under — a ${(107 / 12).toFixed(1)} ft storey`);
}

// 3. The floor follows the ground, rather than the ground being asked to follow
//    the floor. Twice the slope, twice the fall, same rule.
//
//    The second assertion here first read "steeper ground seats the floor
//    higher", which is false of this fixture and told me nothing about the code:
//    the test hillside pivots about the origin, so a steeper slope puts the
//    DOWNHILL terrace lower and the floor with it. The invariant that actually
//    matters is the one the walkout depends on — whatever the slope, the floor
//    stands exactly terraceDrop above the grade at the terrace.
{
  const a = seat(10), b = seat(20);
  check('FOLLOWS GROUND', Math.abs(b.fall - 2 * a.fall) < 0.01,
    `10% gives ${a.fall.toFixed(1)} ft, 20% gives ${b.fall.toFixed(1)} ft`);
  for (const [pct, s] of [[0, seat(0)], [10, a], [20, b], [45, seat(45)]]) {
    // grade at the terrace edge, from the fixture itself
    const low = { e: UP.east * TERRACE_Y, n: UP.north * TERRACE_Y };
    const gLow = slopeAt(pct)(low.e, low.n);
    check('FOLLOWS GROUND', Math.abs((s.ffe - gLow) - TERRACE_DROP) < 0.01,
      `at ${String(pct).padStart(2)}% the floor stands ${(s.ffe - gLow).toFixed(2)} ft above the terrace grade `
      + `(the design's ${TERRACE_DROP.toFixed(2)} ft)`);
  }
}

// 4. Steeper than drawn is not a problem to be corrected: the terrace still
//    meets grade, and the extra fall becomes cut at the spine, which is what
//    the retaining wall is for.
{
  const s = seat(45);
  check('STEEPER', s.walksOut, `45% ground — still a walkout`);
  check('STEEPER', s.buried > DESIGN_RISE,
    `${s.buried.toFixed(1)} ft against the spine, which is the wall's job`);
}

console.log('='.repeat(74));
console.log(`RESULT         ${fail} failed, ${pass} passed`);
console.log('='.repeat(74));
if (fail) process.exit(1);
