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

// Wall thicknesses, matching tools/render/lib/build3d.mjs. A room rectangle in
// the plan is to the wall LINE; the room you can actually stand in is inside
// the walls that sit on those lines.
const EXT = 10, INT = 5;

/**
 * A room's CLEAR rect in inches — inside its walls, which is where a toilet
 * actually goes. +y is UPHILL (service side); -y is DOWNHILL (the view).
 *
 * Taking the rect to the wall line instead put fixtures and stair treads
 * partly inside the walls beside them: the SOLID check found a lavatory 56%
 * buried in the Armature's plumbing wall and a Bridge stair tread two thirds
 * inside a partition. Because both the drawing and the model read this one
 * generator, correcting it here moves the toilet in the plan and the toilet in
 * the 3D together, and they cannot drift apart.
 *
 * The insets are not symmetric, because the walls are not. build3d puts a
 * partition on a room's WEST and UPHILL faces — the room to the east or uphill
 * of the line owns that wall — so those two faces lose a partition's thickness
 * and the other two lose nothing, except where the face is the outside of the
 * building and loses the exterior wall instead.
 */
const box = (r, E) => {
  const x0 = r.x0 * FT, y0 = r.y0 * FT, x1 = (r.x0 + r.w) * FT, y1 = (r.y0 + r.d) * FT;
  const on = (a, b) => Math.abs(a - b) < 2;
  const cx0 = x0 + (E && on(x0, E.x0) ? EXT : INT);
  const cy1 = y1 - (E && on(y1, E.y1) ? EXT : INT);
  const cx1 = x1 - (E && on(x1, E.x1) ? EXT : 0);
  const cy0 = y0 + (E && on(y0, E.y0) ? EXT : 0);
  return { x0: cx0, y0: cy0, x1: cx1, y1: cy1, w: cx1 - cx0, d: cy1 - cy0 };
};

/** The level's outline in inches — the outside face of the building. */
const outlineOf = (lv) => {
  const rs = lv.rooms ?? [];
  if (!rs.length) return null;
  return {
    x0: Math.min(...rs.map(r => r.x0)) * FT, x1: Math.max(...rs.map(r => r.x0 + r.w)) * FT,
    y0: Math.min(...rs.map(r => r.y0)) * FT, y1: Math.max(...rs.map(r => r.y0 + r.d)) * FT,
  };
};

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
function alongWall(out, level, b, wall, items, { inset = 4, gap = 3, from } = {}) {
  const horizontal = wall === 'N' || wall === 'S';
  let cursor = from ?? ((horizontal ? b.x0 : b.y0) + inset);
  const limit = (horizontal ? b.x1 : b.y1) - inset;
  for (const [type, opts = {}] of items) {
    const sz = S[type] ?? { w: 24, d: 24, h: 34 };
    const w = opts.w ?? sz.w, dpt = opts.d ?? sz.d;
    const run = horizontal ? w : dpt, depth = horizontal ? dpt : w;
    if (cursor + run > limit) continue;                 // does not fit — omit it
    // …and it has to fit ACROSS the wall as well as along it. Only the run was
    // ever tested, so a 30" deep washer went into a laundry with 21" of clear
    // depth and came out the front of the building. The rule this file states
    // for length applies to depth for the same reason: a room too shallow for
    // its appliance is a finding, and an appliance through a wall is a lie.
    if (depth > (horizontal ? b.d : b.w)) continue;
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
  //
  // The wet fixture claims the end wall FIRST, and the plumbing wall then
  // starts clear of it. Running both from the same west corner put the WC
  // inside the shower — 48% inside it in five schemes, 66% in two more, and a
  // WC inside the tub in the Spine. That was in the DRAWINGS as well as the
  // model, because both read this generator, which is exactly why it is worth
  // having one: fixing it here fixes the plan and the 3D in the same edit.
  const wide = b.w >= 96;
  const area = (b.w / 12) * (b.d / 12);
  const wet = (b.w >= 84 && area >= 70) ? ['tub', 'TUB']
            : b.w >= 52 ? ['shower36', 'SHOWER'] : null;
  let taken = 0;
  if (wet) {
    const before = out.length;
    alongWall(out, level, b, 'W', [[wet[0], { label: wet[1] }]]);
    if (out.length > before) taken = out[out.length - 1].w;   // its reach along x
  }
  alongWall(out, level, b, 'N', [
    ['wc', { label: 'WC' }],
    [wide ? 'lav2' : 'lav', { label: wide ? 'DOUBLE VANITY' : 'LAV' }],
  ], taken ? { from: b.x0 + taken + 3 } : {});
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
    const E = outlineOf(lv);
    for (const r of lv.rooms ?? []) {
      if (r.use !== 'circ' || !/stair/i.test(r.name)) continue;
      const b = box(r, E);
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
    const E = outlineOf(lv);
    for (const r of lv.rooms ?? []) {
      const fn = LAYOUT[r.use];
      if (!fn) continue;
      fn(out, lv.ffe, r, box(r, E));
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
