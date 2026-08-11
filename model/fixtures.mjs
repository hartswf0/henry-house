// HENRY HOUSE — FIXTURES, CASEWORK AND FURNITURE.
//
// One schedule, three consumers:
//    tools/draw/fixtures.mjs   draws the 2D plan symbol
//    tools/render/lib/scene.mjs places the 3D object
//    tools/check/clash.mjs     verifies clearances and door swings
//
// A room drawn as an empty rectangle with an area tag is not a designed room.
// You cannot tell from it whether a water closet fits, whether the lavatory has
// elbow room, or whether the door swing lands on the toilet. Everything below
// exists so those questions have answers that can be checked.
//
// (x, y) is the LOWER-LEFT of the footprint in model inches; w runs along +X,
// d runs along +Y. `face` is the direction the fixture is used FROM:
//   'N' = you stand to the north of it, 'S','E','W' likewise.
// `clear` is the required clear floor space in front of the fixture, in inches,
// measured in the `face` direction. Zero means none required.

const F = (id, level, type, x, y, w, d, face, opts = {}) =>
  ({ id, level, type, x, y, w, d, face, h: opts.h ?? 34, ...opts });

// Standard sizes. Real product dimensions, not placeholders.
export const SIZES = {
  wc:      { w: 20, d: 29, h: 30 },   // elongated water closet
  lav:     { w: 24, d: 21, h: 34 },   // single lavatory in counter
  lav2:    { w: 60, d: 21, h: 34 },   // double vanity
  tub:     { w: 60, d: 32, h: 20 },
  shower36:{ w: 36, d: 36, h: 78 },
  shower42:{ w: 42, d: 60, h: 78 },
  range:   { w: 30, d: 26, h: 36 },
  fridge:  { w: 36, d: 30, h: 70 },
  dw:      { w: 24, d: 24, h: 34 },
  sink:    { w: 33, d: 22, h: 34 },
  washer:  { w: 27, d: 30, h: 38 },
  hpwh:    { w: 26, d: 26, h: 76 },   // heat-pump water heater
  tank:    { w: 24, d: 24, h: 48 },   // pressure tank
  erv:     { w: 34, d: 24, h: 28 },
  panel:   { w: 30, d: 8,  h: 42 },
  battery: { w: 30, d: 14, h: 48 },
  ahu:     { w: 24, d: 30, h: 46 },
  stove:   { w: 28, d: 26, h: 32 },   // wood stove
  bedK:    { w: 76, d: 80, h: 26 },
  bedQ:    { w: 60, d: 80, h: 26 },
};

// ── CODE-DRIVEN CLEARANCES ──────────────────────────────────────────────────
// UNVERIFIED against the governing NC code edition — see docs/02-code-basis.md.
// These are the widely-used IRC/ANSI values and are used here so the layouts
// can be CHECKED rather than eyeballed. They must be confirmed.
export const CLEARANCE = {
  wcSideToCentre: 15,      // min clear from WC centreline to any wall/fixture
  wcFront: 21,             // min clear floor space in front of a WC
  lavFront: 21,
  showerFront: 24,
  applianceFront: 30,      // in front of range / fridge / laundry
  panelFront: 36,          // NEC working space in front of an electrical panel
  panelWidth: 30,
  kitchenAisle: 42,        // single-cook aisle
  kitchenAisle2: 48,       // two-cook aisle
  hallway: 36,
  note: 'VERIFY every value against the governing code edition before use.',
};

const S = SIZES;

export const FIXTURES = [
  // ══ LOWER LEVEL ═══════════════════════════════════════════════════════════
  // THE HEART — mechanical. Laid out so every unit can be serviced and replaced.
  // Equipment on the north wall, a shared working aisle in front of it, and the
  // electrical panel on the west wall with its full 36" NEC space kept clear.
  F('MEQ-02', 'L0', 'hpwh',   190, 274, S.hpwh.w, S.hpwh.d, 'S', { label: 'HPWH 80 GAL', clear: 24 }),
  F('MEQ-01', 'L0', 'tank',   220, 276, S.tank.w, S.tank.d, 'S', { label: 'PRESSURE TANK' }),
  F('MEQ-03', 'L0', 'erv',    248, 278, S.erv.w,  S.erv.d,  'S', { label: 'ERV', clear: 24 }),
  F('MEQ-04', 'L0', 'panel',  157, 200, 8, 30, 'E', { label: 'PANEL 200A', clear: CLEARANCE.panelFront }),
  F('MEQ-05', 'L0', 'battery',157, 240, 8, 28, 'E', { label: 'BATTERY', clear: 30 }),
  F('MEQ-07', 'L0', 'manifold',170, 190, 30, 8, 'N', { label: 'PEX MANIFOLD', h: 40, clear: 24 }),
  F('MEQ-08', 'L0', 'ahu',    205, 190, S.ahu.w, S.ahu.d, 'N', { label: 'AHU-1 LOWER', clear: 24 }),
  F('MEQ-06', 'L0', 'filter', 236, 190, 46, 14, 'N', { label: 'SEDIMENT + UV', h: 46, clear: 24 }),

  // BATH 3 (lower)
  F('P-001', 'L0', 'wc',   112, 272, S.wc.w, S.wc.d, 'S', { label: 'WC', clear: CLEARANCE.wcFront }),
  F('P-002', 'L0', 'lav',   18, 279, S.lav.w, S.lav.d, 'S', { label: 'LAV', clear: CLEARANCE.lavFront }),
  F('P-003', 'L0', 'shower36', 18, 190, S.shower36.w, S.shower36.d, 'N', { label: 'SHOWER', clear: CLEARANCE.showerFront }),

  // GUEST BEDROOM
  F('FF-001', 'L0', 'bedQ',  45, 96, S.bedQ.w, S.bedQ.d, 'S', { label: 'QUEEN' }),
  F('FF-002', 'L0', 'nightstand', 21, 150, 20, 18, 'S'),
  F('FF-003', 'L0', 'nightstand', 109, 150, 20, 18, 'S'),

  // FAMILY / FLEX
  F('FF-010', 'L0', 'sofa', 220, 96, 90, 36, 'S', { label: 'SOFA' }),
  F('FF-011', 'L0', 'rug',  210, 30, 120, 84, 'N', { h: 0.5 }),
  F('FF-012', 'L0', 'table-c', 246, 52, 42, 24, 'N', { h: 17 }),

  // ══ MAIN LEVEL ════════════════════════════════════════════════════════════
  // PRIMARY BEDROOM — bed against the solid interior wall, not the glass.
  F('FF-100', 'L1', 'bedK', 67, 96, S.bedK.w, S.bedK.d, 'S', { label: 'KING' }),
  F('FF-101', 'L1', 'nightstand', 41, 152, 22, 18, 'S'),
  F('FF-102', 'L1', 'nightstand', 145, 152, 22, 18, 'S'),
  F('FF-103', 'L1', 'bench', 78, 74, 54, 18, 'N', { h: 18 }),

  // PRIMARY BATH — door D-122 is on the east wall at y 210-242; nothing may
  // block its swing. Verified by tools/check/clash.mjs.
  F('P-102', 'L1', 'shower42', 16, 240, S.shower42.w, 57, 'E', { label: 'SHOWER 42x57', clear: CLEARANCE.showerFront }),
  F('P-101', 'L1', 'lav2', 66, 187, S.lav2.w, S.lav2.d, 'N', { label: 'DOUBLE VANITY', clear: CLEARANCE.lavFront }),
  F('P-100', 'L1', 'wc',  100, 250, S.wc.w, S.wc.d, 'S', { label: 'WC', clear: CLEARANCE.wcFront }),

  // W.I. CLOSET — hanging both long walls
  F('C-100', 'L1', 'rod', 148, 192, 8, 104, 'E', { label: 'HANG', h: 66 }),
  F('C-101', 'L1', 'rod', 190, 192, 8, 104, 'W', { label: 'HANG', h: 66 }),

  // GREAT ROOM — seating faces the view; the stove sits in the masonry mass.
  F('FF-110', 'L1', 'stove', 292, 118, S.stove.w, S.stove.d, 'E', { label: 'WOOD STOVE', h: 32 }),
  F('FF-111', 'L1', 'sofa',  352, 104, 96, 38, 'S', { label: 'SOFA' }),
  F('FF-112', 'L1', 'rug',   336, 28, 132, 92, 'N', { h: 0.5 }),
  F('FF-113', 'L1', 'table-c', 372, 54, 48, 26, 'N', { h: 17 }),
  F('FF-114', 'L1', 'chair', 476, 40, 32, 32, 'W', { h: 30 }),
  F('FF-115', 'L1', 'chair', 476, 92, 32, 32, 'W', { h: 30 }),

  // OFFICE — desk on the solid north wall under the clerestory
  F('FF-120', 'L1', 'desk',  300, 268, 60, 30, 'S', { label: 'DESK', h: 30 }),
  F('FF-121', 'L1', 'chair', 318, 236, 24, 24, 'N', { h: 30 }),
  F('C-110',  'L1', 'shelf', 296, 190, 104, 14, 'N', { label: 'SHELVING', h: 84 }),

  // DINING
  F('FF-130', 'L1', 'table-d', 612, 62, 84, 40, 'N', { label: 'DINING 8', h: 30 }),
  F('FF-131', 'L1', 'chair', 620, 26, 20, 20, 'N', { h: 34 }),
  F('FF-132', 'L1', 'chair', 648, 26, 20, 20, 'N', { h: 34 }),
  F('FF-133', 'L1', 'chair', 676, 26, 20, 20, 'N', { h: 34 }),
  F('FF-134', 'L1', 'chair', 620, 106, 20, 20, 'S', { h: 34 }),
  F('FF-135', 'L1', 'chair', 648, 106, 20, 20, 'S', { h: 34 }),
  F('FF-136', 'L1', 'chair', 676, 106, 20, 20, 'S', { h: 34 }),

  // KITCHEN — work wall on the interior partition, island toward the view.
  F('K-100', 'L1', 'base',   739, 154, 111, 26, 'S', { label: 'BASE CAB', h: 36 }),
  F('K-101', 'L1', 'range',  762, 152, S.range.w, S.range.d, 'S', { label: 'RANGE 30"', clear: CLEARANCE.applianceFront }),
  F('K-102', 'L1', 'fridge', 812, 148, S.fridge.w, S.fridge.d, 'S', { label: 'REF', clear: CLEARANCE.applianceFront }),
  F('K-103', 'L1', 'island', 736, 76, 88, 40, 'S', { label: 'ISLAND', h: 36 }),
  F('K-104', 'L1', 'sink',   756, 84, S.sink.w, S.sink.d, 'S', { label: 'SINK', clear: CLEARANCE.lavFront }),
  F('K-105', 'L1', 'dw',     794, 84, S.dw.w, S.dw.d, 'S', { label: 'DW' }),
  F('C-120',  'L1', 'shelf', 800, 190, 50, 14, 'S', { label: 'PANTRY SHELVING', h: 84 }),

  // PRIMARY SUITE — SECOND LAUNDRY.
  // The link laundry is 68 ft from this bedroom. That is defensible as an
  // airlock (dirty clothes never enter the house) and indefensible as daily
  // ergonomics for a physician doing scrubs at odd hours. A stacked pair at the
  // back of the walk-in closet is 7 ft from the bed, backs onto the primary
  // bath's wet wall so it needs no new plumbing route, and costs 6 sf of
  // hanging space. Both laundries earn their place; neither replaces the other.
  F('P-160', 'L1', 'washer', 148, 266, 27, 32, 'S',
    { label: 'STACKED W/D', h: 78, stacked: true, clear: CLEARANCE.applianceFront }),

  // ENTRY
  F('FF-140', 'L1', 'bench', 706, 190, 60, 16, 'N', { h: 18 }),

  // LINK — mudroom / laundry / powder (the airlock)
  F('FF-150', 'L1', 'bench',  880, 180, 84, 18, 'S', { link: true, h: 18, label: 'BENCH + LOCKERS' }),
  F('K-150',  'L1', 'base',   880, 76, 60, 24, 'N', { link: true, h: 36, label: 'DOG WASH + SCRUB SINK' }),
  F('P-150',  'L1', 'washer', 882, 268, S.washer.w, S.washer.d, 'S', { link: true, label: 'WASHER', clear: CLEARANCE.applianceFront }),
  F('P-151',  'L1', 'washer', 914, 268, S.washer.w, S.washer.d, 'S', { link: true, label: 'DRYER', clear: CLEARANCE.applianceFront }),
  F('P-152',  'L1', 'wc',    1006, 268, S.wc.w, S.wc.d, 'S', { link: true, label: 'WC', clear: CLEARANCE.wcFront }),
  F('P-153',  'L1', 'lav',    1002, 210, S.lav.w, S.lav.d, 'W', { link: true, label: 'LAV', clear: CLEARANCE.lavFront }),

  // ══ UPPER LEVEL ═══════════════════════════════════════════════════════════
  F('FF-200', 'L2', 'bedQ', 640, 94, S.bedQ.w, S.bedQ.d, 'S', { label: 'QUEEN' }),
  F('FF-201', 'L2', 'nightstand', 616, 150, 20, 18, 'S'),
  F('FF-204', 'L2', 'nightstand', 702, 150, 16, 18, 'S'),
  F('FF-202', 'L2', 'bedQ', 784, 94, S.bedQ.w, S.bedQ.d, 'S', { label: 'QUEEN' }),
  F('FF-203', 'L2', 'nightstand', 760, 100, 20, 18, 'S'),

  // BATH 2 — 105 x 76. Tub and WC side by side on the north wall; stacking them
  // needed 82" of depth and the room only has 76".
  F('P-200', 'L2', 'tub', 709, 270, S.tub.w, S.tub.d, 'S', { label: 'TUB / SHOWER', clear: CLEARANCE.showerFront }),
  F('P-201', 'L2', 'wc',  784, 270, S.wc.w, S.wc.d, 'S', { label: 'WC', clear: CLEARANCE.wcFront }),
  F('P-202', 'L2', 'lav', 744, 226, S.lav.w, S.lav.d, 'N', { label: 'LAV', clear: CLEARANCE.lavFront }),

  // AIR HANDLER serving the upper level, in the linen closet off the hall
  F('MEQ-20', 'L2', 'ahu', 820, 262, S.ahu.w, S.ahu.d, 'S', { label: 'AHU-3 UPPER', clear: 24 }),
];

export const fixturesFor = (level) => FIXTURES.filter(f => f.level === level);
export const fixtureById = (id) => FIXTURES.find(f => f.id === id);

/** Plumbing fixture count — drives DWV sizing and the septic design flow. */
export function fixtureCounts() {
  const c = { wc: 0, lav: 0, tub: 0, shower: 0, sink: 0, washer: 0, dw: 0 };
  for (const f of FIXTURES) {
    if (f.type === 'wc') c.wc++;
    else if (f.type === 'lav' || f.type === 'lav2') c.lav += f.type === 'lav2' ? 2 : 1;
    else if (f.type === 'tub') c.tub++;
    else if (f.type.startsWith('shower')) c.shower++;
    else if (f.type === 'sink') c.sink++;
    else if (f.type === 'washer') c.washer++;
    else if (f.type === 'dw') c.dw++;
  }
  return c;
}

export default { FIXTURES, SIZES, CLEARANCE, fixturesFor, fixtureById, fixtureCounts };
