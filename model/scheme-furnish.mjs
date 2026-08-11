// HENRY HOUSE — FURNISH A SCHEME PLAN.
//
// The brief this file answers: full plans — toilets, furniture, doors, stairs —
// and they must map PERFECTLY to the 3D that gets built.
//
// The only way to guarantee that is to refuse to write the layout twice. This
// module is the single generator. It takes rooms and returns fixtures in
// absolute site INCHES, and BOTH consumers read it:
//
//   tools/draw/scheme-plan.mjs   draws each fixture with the plan symbol library
//   tools/render/lib/build3d.mjs builds each fixture as a solid at the same x,
//                                y, w, d and the height from SIZES
//
// So a toilet in a plan is the same toilet in the model, at the same place, by
// construction rather than by coordination. There is no second list to keep in
// step, and tools/check/plan3d.mjs asserts the two consumers agree.
//
// Placement is DETERMINISTIC — no randomness anywhere — so the same plan always
// produces the same house, and a diff in the drawing means a real change.

import { SIZES } from './fixtures.mjs';

const S = SIZES;
const FT = 12;

/** Room rect in inches. +y is UPHILL (service side); -y is DOWNHILL (the view). */
const box = (r) => ({ x0: r.x0 * FT, y0: r.y0 * FT, x1: (r.x0 + r.w) * FT, y1: (r.y0 + r.d) * FT,
                      w: r.w * FT, d: r.d * FT });

let seq = 0;
const F = (level, type, x, y, w, d, face, opts = {}) =>
  ({ id: `G${String(++seq).padStart(4, '0')}`, level, type, x, y, w, d, face,
     h: opts.h ?? S[type]?.h ?? 30, ...opts });

/**
 * Lay a row of fixtures along a wall, left to right, and stop when the wall
 * runs out. Returning what fitted rather than overflowing is deliberate: a
 * bath too small for its fixtures should show as a bath missing a fixture,
 * which is a finding, not as fixtures drawn through a wall, which is a lie.
 */
function alongWall(out, level, b, wall, items, { inset = 4, gap = 3 } = {}) {
  const horizontal = wall === 'N' || wall === 'S';
  let cursor = (horizontal ? b.x0 : b.y0) + inset;
  const limit = (horizontal ? b.x1 : b.y1) - inset;
  for (const [type, opts = {}] of items) {
    const sz = S[type] ?? { w: 24, d: 24, h: 34 };
    const w = opts.w ?? sz.w, dpt = opts.d ?? sz.d;
    const run = horizontal ? w : dpt, depth = horizontal ? dpt : w;
    if (cursor + run > limit) continue;                 // does not fit — omit it
    let x, y, face;
    if (wall === 'N') { x = cursor; y = b.y1 - depth; face = 'S'; }
    else if (wall === 'S') { x = cursor; y = b.y0; face = 'N'; }
    else if (wall === 'W') { x = b.x0; y = cursor; face = 'E'; }
    else { x = b.x1 - depth; y = cursor; face = 'W'; }
    out.push(F(level, type, x, y, horizontal ? w : depth, horizontal ? dpt : w, face, opts));
    cursor += run + gap;
  }
}

const centre = (b) => [(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2];

// ── per-use layouts ─────────────────────────────────────────────────────────
function layoutBath(out, level, r, b) {
  // Everything hangs on the UPHILL wall, which is the plumbing wall. The tub
  // goes on an end wall because a 60" tub rarely fits the same run as a WC
  // and a lavatory.
  const wide = b.w >= 96;
  alongWall(out, level, b, 'N', [
    ['wc', { label: 'WC' }],
    [wide ? 'lav2' : 'lav', { label: wide ? 'DOUBLE VANITY' : 'LAV' }],
  ]);
  const area = (b.w / 12) * (b.d / 12);
  if (b.w >= 84 && area >= 70) alongWall(out, level, b, 'W', [['tub', { label: 'TUB' }]]);
  else if (b.w >= 52) alongWall(out, level, b, 'W', [['shower36', { label: 'SHOWER' }]]);
}

function layoutKitchen(out, level, r, b) {
  // Sink and dishwasher on the plumbing wall; range and fridge beside them so
  // one wall carries water, waste, gas/power and vent.
  alongWall(out, level, b, 'N', [
    ['sink', { label: 'SINK' }], ['dw', { label: 'DW' }],
    ['range', { label: 'RANGE' }], ['fridge', { label: 'FRIDGE' }],
  ]);
  // An island only where a 42" working aisle survives on both sides of it.
  if (b.d >= 12 * 12 && b.w >= 10 * 12) {
    const [cx] = centre(b);
    out.push(F(level, 'island', cx - 36, b.y0 + 42, 72, 26, 'N', { label: 'ISLAND', h: 36 }));
  }
}

function layoutBed(out, level, r, b) {
  // The bed goes against the UPHILL wall — solid, quiet, no glass behind the
  // headboard — and looks downhill at the view, which is the whole reason the
  // house faces this way.
  const king = b.w >= 13 * 12 && b.d >= 13 * 12;
  const bedType = king ? 'bedK' : 'bedQ';
  const bw = S[bedType].w, bd = S[bedType].d;
  const [cx] = centre(b);
  if (b.w >= bw + 24 && b.d >= bd + 24) {
    out.push(F(level, bedType, cx - bw / 2, b.y1 - bd - 14, bw, bd, 'S', { label: king ? 'KING' : 'QUEEN' }));
    out.push(F(level, 'nightstand', cx - bw / 2 - 22, b.y1 - 34, 18, 18, 'S'));
    out.push(F(level, 'nightstand', cx + bw / 2 + 4, b.y1 - 34, 18, 18, 'S'));
  }
  if (b.w >= 10 * 12) alongWall(out, level, b, 'W', [['rod', { w: 24, d: 60, label: 'CLOSET' }]]);
}

function layoutLiving(out, level, r, b) {
  const [cx, cy] = centre(b);
  if (b.w >= 10 * 12 && b.d >= 8 * 12) {
    out.push(F(level, 'rug', cx - 54, cy - 42, 108, 84, 'N', { h: 1 }));
    // sofa backs onto the uphill side and faces the glass
    out.push(F(level, 'sofa', cx - 42, b.y1 - 52, 84, 34, 'S', { label: 'SOFA' }));
    out.push(F(level, 'chair', b.x0 + 10, cy - 15, 30, 30, 'E'));
    out.push(F(level, 'chair', b.x1 - 40, cy - 15, 30, 30, 'W'));
  }
  // A wood stove only where there is a wall to put it against and room in front.
  if (b.w >= 12 * 12 && b.d >= 10 * 12) {
    out.push(F(level, 'stove', b.x1 - 40, b.y1 - 40, S.stove.w, S.stove.d, 'S', { label: 'WOOD STOVE' }));
  }
}

function layoutDining(out, level, r, b) {
  const [cx, cy] = centre(b);
  if (b.w >= 9 * 12 && b.d >= 8 * 12) {
    out.push(F(level, 'table-d', cx - 36, cy - 21, 72, 42, 'N', { label: 'DINING' }));
    for (const [dx, dy] of [[-48, -6], [42, -6], [-18, -36], [12, -36], [-18, 30], [12, 30]]) {
      out.push(F(level, 'chair', cx + dx, cy + dy, 18, 18, 'N'));
    }
  }
}

function layoutWork(out, level, r, b) {
  alongWall(out, level, b, 'N', [['desk', { w: 60, d: 26, label: 'DESK' }]]);
  if (b.w >= 10 * 12) out.push(F(level, 'chair', (b.x0 + b.x1) / 2 - 9, b.y1 - 62, 18, 18, 'N'));
}

function layoutLaundry(out, level, r, b) {
  alongWall(out, level, b, 'N', [['washer', { label: 'WASHER' }], ['washer', { label: 'DRYER' }]]);
}

function layoutMech(out, level, r, b) {
  alongWall(out, level, b, 'N', [
    ['hpwh', { label: 'HPWH' }], ['tank', { label: 'TANK' }], ['ahu', { label: 'AHU' }],
  ]);
  alongWall(out, level, b, 'W', [['panel', { w: 8, d: 30, label: 'PANEL' }]], { inset: 10 });
}

function layoutEntry(out, level, r, b) {
  alongWall(out, level, b, 'N', [['bench', { w: 60, d: 18, label: 'BENCH' }]]);
  if (b.w >= 8 * 12) alongWall(out, level, b, 'W', [['rod', { w: 22, d: 48, label: 'COATS' }]]);
}

function layoutStore(out, level, r, b) {
  alongWall(out, level, b, 'N', [['shelf', { w: Math.min(b.w - 12, 96), d: 16, label: 'SHELVING' }]]);
}

const LAYOUT = {
  bath: layoutBath, kitchen: layoutKitchen, bed: layoutBed, living: layoutLiving,
  dining: layoutDining, work: layoutWork, laundry: layoutLaundry, mech: layoutMech,
  entry: layoutEntry, store: layoutStore,
};

// ── stairs ──────────────────────────────────────────────────────────────────
/**
 * Every circulation room whose name says STAIR becomes a real flight: risers
 * counted from the actual floor-to-floor of the scheme, treads at 10.5", and a
 * direction taken from the room's proportion. The 3D builds these as steps and
 * the plan draws the same treads with a break line, so a stair you can see in
 * the model is a stair you can count in the drawing.
 */
export function stairsFor(plan) {
  const out = [];
  const ffes = plan.levels.map(l => l.ffe).sort((a, b) => a - b);
  for (const lv of plan.levels) {
    const above = ffes.find(z => z > lv.ffe + 0.5);
    for (const r of lv.rooms ?? []) {
      if (r.use !== 'circ' || !/stair/i.test(r.name)) continue;
      const b = box(r);
      const rise = above != null ? (above - lv.ffe) * 12 : 120;
      const risers = Math.max(2, Math.round(rise / 7.4));
      const run = b.d >= b.w ? 'Y' : 'X';
      out.push({ level: lv.ffe, x: b.x0, y: b.y0, w: b.w, d: b.d,
                 risers, riser: +(rise / risers).toFixed(2), tread: 10.5,
                 run, toFfe: above ?? null, name: r.name });
    }
  }
  return out;
}

// ── the generator ───────────────────────────────────────────────────────────
/**
 * Every fixture and every piece of furniture in a scheme, in absolute site
 * INCHES, keyed by the level's ffe. Deterministic: same plan, same house.
 */
export function furnish(plan) {
  seq = 0;
  const out = [];
  for (const lv of plan.levels ?? []) {
    for (const r of lv.rooms ?? []) {
      const fn = LAYOUT[r.use];
      if (!fn) continue;
      fn(out, lv.ffe, r, box(r));
    }
  }
  return out;
}

/** Fixtures on one level. */
export const furnishLevel = (plan, ffe) => furnish(plan).filter(f => Math.abs(f.level - ffe) < 0.6);

/** What the plan claims it contains, for the plan-vs-3D check. */
export function furnishCounts(plan) {
  const c = {};
  for (const f of furnish(plan)) c[f.type] = (c[f.type] ?? 0) + 1;
  return c;
}

export default { furnish, furnishLevel, furnishCounts, stairsFor };
