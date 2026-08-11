// HENRY HOUSE — doors, windows and open edges.
//
// An opening is a run along a wall. (x, y) is its START point, `orient` its
// direction: 'H' runs +X, 'V' runs +Y.  All dimensions in inches.
//
//   type: 'door'    hinged leaf, drawn with a swing arc
//         'slider'  lift-slide / multi-panel glazed door
//         'window'  glazed, with sill + head
//         'fixed'   fixed glazing, floor to head
//         'opening' cased opening, no leaf
//         'garage'  overhead door
//
// GLAZING STRATEGY (why the openings sit where they do):
//   The downhill (SSE, y=0) wall carries essentially all the glass — view and
//   winter sun arrive from the same side, which is the whole reason the bar was
//   turned to this azimuth. The uphill (NNW, y=312) wall is nearly solid: it is
//   the cold side, the cut side, and the service side. What little glass it has
//   is high, for north light onto work surfaces, not for view.

export const OPEN_EDGES = {
  // roomId: edges with NO partition — spatial continuity
  'L1-great':   ['W', 'E', 'N'],
  'L1-dining':  ['W', 'E', 'N'],
  'L1-kitchen': ['W'],
  'L1-gallery': ['E'],
  'L1-stairD':  ['S'],
  'L1-entry':   ['S', 'W'],
  'L1-stairU':  ['E'],
  'L0-family':  ['E'],
  'L0-guest':   [],
  'L0-stairD':  ['S'],
  'L2-stairU':  [],
};

const O = (id, level, type, x, y, len, orient, opts = {}) => ({
  id, level, type, x, y, len, orient,
  wallT: opts.wallT ?? 10,
  sill: opts.sill ?? 0,
  head: opts.head ?? 96,
  side: opts.side ?? 1,
  hand: opts.hand ?? 1,
  ...opts,
});

// ── MAIN LEVEL ───────────────────────────────────────────────────────────────
export const OPENINGS = [
  // SOUTH (downhill / view) wall — y = 0..10
  O('W-101', 'L1', 'window', 40, 0, 48, 'H', { sill: 24, head: 96, room: 'PRIMARY BEDROOM' }),
  O('W-102', 'L1', 'window', 120, 0, 48, 'H', { sill: 24, head: 96, room: 'PRIMARY BEDROOM' }),
  O('D-103', 'L1', 'slider', 300, 0, 144, 'H', { head: 108, panels: 4, room: 'GREAT ROOM', note: '12\'-0" lift-slide to main deck' }),
  O('W-104', 'L1', 'fixed', 456, 0, 108, 'H', { sill: 0, head: 108, room: 'GREAT ROOM' }),
  O('D-105', 'L1', 'slider', 596, 0, 120, 'H', { head: 108, panels: 3, room: 'DINING' }),
  O('W-106', 'L1', 'window', 750, 0, 90, 'H', { sill: 36, head: 96, room: 'KITCHEN' }),

  // NORTH (uphill / service) wall — y = 302..312
  O('W-110', 'L1', 'window', 55, 302, 40, 'H', { sill: 60, head: 96, room: 'PRIMARY BATH', note: 'high, obscured' }),
  O('W-111', 'L1', 'window', 470, 302, 60, 'H', { sill: 36, head: 96, room: 'OFFICE' }),
  O('D-112', 'L1', 'door', 730, 302, 36, 'H', { side: -1, hand: 1, room: 'ENTRY', note: 'GUEST ENTRY off the entry bridge' }),

  // WEST end wall — x = 0..10
  O('W-113', 'L1', 'window', 0, 60, 60, 'V', { sill: 24, head: 96, room: 'PRIMARY BEDROOM' }),

  // EAST wall to the LINK — x = 854..864
  O('D-114', 'L1', 'door', 864, 110, 36, 'V', { side: -1, hand: 1, wallT: 10, room: 'KITCHEN <-> MUDROOM', note: 'the everyday route: garage -> airlock -> kitchen' }),

  // Interior doors, MAIN
  O('D-120', 'L1', 'door', 200, 60, 36, 'V', { wallT: 5, side: -1, hand: 1, room: 'PRIMARY BEDROOM' }),
  O('D-121', 'L1', 'door', 145, 180, 32, 'H', { wallT: 5, side: 1, hand: 1, room: 'W.I. CLOSET' }),
  O('D-122', 'L1', 'door', 140, 210, 32, 'V', { wallT: 5, side: 1, hand: -1, room: 'PRIMARY BATH' }),
  O('D-123', 'L1', 'door', 470, 180, 36, 'H', { wallT: 5, side: 1, hand: 1, room: 'OFFICE' }),
  O('D-124', 'L1', 'door', 805, 180, 32, 'H', { wallT: 5, side: 1, hand: 1, room: 'PANTRY' }),
  O('O-125', 'L1', 'opening', 205, 60, 60, 'V', { wallT: 5, room: 'GALLERY <-> PRIMARY (cased)' }),

  // LINK / MUDROOM
  O('D-130', 'L1', 'door', 1044, 100, 36, 'V', { side: 1, hand: 1, room: 'MUDROOM -> BREEZEWAY -> GARAGE' }),
  O('W-131', 'L1', 'window', 900, 60, 48, 'H', { sill: 36, head: 90, room: 'MUDROOM' }),
  O('D-132', 'L1', 'door', 974, 250, 30, 'V', { wallT: 5, side: 1, hand: 1, room: 'POWDER' }),
  O('O-133', 'L1', 'opening', 874, 200, 60, 'H', { wallT: 5, room: 'MUDROOM <-> LAUNDRY' }),

  // ── LOWER LEVEL ────────────────────────────────────────────────────────────
  O('D-001', 'L0', 'slider', 60, 0, 120, 'H', { head: 96, panels: 3, room: 'FAMILY / FLEX', note: 'walkout to lower terrace — SECOND MEANS OF EGRESS' }),
  O('W-002', 'L0', 'window', 300, 0, 72, 'H', { sill: 24, head: 96, room: 'GUEST BEDROOM', egress: true, note: 'EERO — verify net clear opening' }),
  O('W-003', 'L0', 'window', 0, 60, 48, 'V', { sill: 30, head: 90, room: 'FAMILY / FLEX' }),
  O('D-010', 'L0', 'door', 288, 60, 32, 'V', { wallT: 5, side: 1, hand: 1, room: 'GUEST BEDROOM' }),
  O('D-011', 'L0', 'door', 200, 180, 32, 'H', { wallT: 5, side: 1, hand: 1, room: 'BATH 3' }),
  O('D-012', 'L0', 'door', 150, 210, 36, 'V', { wallT: 7, side: 1, hand: 1, room: 'MECHANICAL — THE HEART', note: '36" leaf min: equipment must be able to leave the room' }),

  // ── UPPER LEVEL ────────────────────────────────────────────────────────────
  O('W-201', 'L2', 'window', 600, 0, 60, 'H', { sill: 24, head: 90, room: 'BEDROOM 2', egress: true }),
  O('W-202', 'L2', 'window', 745, 0, 60, 'H', { sill: 24, head: 90, room: 'BEDROOM 3', egress: true }),
  O('W-203', 'L2', 'window', 810, 302, 40, 'H', { sill: 48, head: 90, room: 'BATH 2' }),
  O('D-210', 'L2', 'door', 700, 100, 32, 'V', { wallT: 5, side: -1, hand: 1, room: 'BEDROOM 2' }),
  O('D-211', 'L2', 'door', 745, 180, 32, 'H', { wallT: 5, side: 1, hand: 1, room: 'BEDROOM 3' }),
  O('D-212', 'L2', 'door', 705, 210, 30, 'V', { wallT: 5, side: 1, hand: 1, room: 'BATH 2' }),
  O('O-213', 'L2', 'opening', 576, 200, 90, 'V', { wallT: 5, room: 'INTERIOR OVERLOOK into the tall great room' }),
];

export const openingsFor = (level) => OPENINGS.filter(o => o.level === level);

// ── GARAGE (separate structure) ──────────────────────────────────────────────
export const GARAGE_OPENINGS = [
  O('D-G01', 'L1', 'garage', 1080, 348, 108, 'H', { head: 96, note: '9\'-0" x 8\'-0" insulated sectional' }),
  O('D-G02', 'L1', 'garage', 1212, 348, 108, 'H', { head: 96 }),
  O('D-G03', 'L1', 'door', 1068, 100, 36, 'V', { side: 1, hand: 1, note: 'garage -> breezeway' }),
];

export default { OPENINGS, OPEN_EDGES, openingsFor, GARAGE_OPENINGS };
