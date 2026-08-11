// HENRY HOUSE — SCHEMATIC PLANS FOR THE ALTERNATIVE SCHEMES.
//
// X-101 draws the schemes as footprints, which is the right drawing for
// comparing perimeter and earthwork and the wrong drawing for everything
// else. A footprint cannot be lived in, cannot be criticised, and cannot be
// wrong — which is exactly the complaint: the alternatives were massing, and
// massing flatters itself.
//
// This draws them as PLANS. Walls with thickness, rooms with names and areas,
// doors that swing, glass on the downhill face, the wet band called out, and
// a dimension string across the bottom. Everything here comes from
// model/scheme-plans.mjs, which is generated and checked — so a room drawn
// here is a room that survived the checks in tools/build-plans.mjs.

import { LW, INK } from '../svg.mjs';
import { ft } from '../../model/units.mjs';
import { sym } from './fixtures.mjs';
import { furnishLevel, stairsFor } from '../../model/scheme-furnish.mjs';
import { doorwaysAt } from '../../model/scheme-doors.mjs';

const EXT_T = 10;                                  // exterior wall, inches
const INT_T = 5;                                   // partition, inches

// Room fills carry meaning, not decoration: wet rooms read as one family so a
// reader can see the plumbing argument without reading a legend.
const FILL = {
  bed:     '#eef1ee',
  living:  '#f6f7f5',
  dining:  '#f6f7f5',
  kitchen: '#e4eef2',
  bath:    '#e4eef2',
  laundry: '#e4eef2',
  mech:    '#e4eef2',
  work:    '#f1f0ea',
  circ:    '#e7e9e6',
  store:   '#eceeea',
  entry:   '#e7e9e6',
};
const WET = new Set(['bath', 'kitchen', 'laundry', 'mech']);

const R = (r) => ({ x0: ft(r.x0), y0: ft(r.y0), x1: ft(r.x0 + r.w), y1: ft(r.y0 + r.d) });

/**
 * A room name shortened to what its own box can hold at 1/8" scale.
 * "PANTRY / SCULLERY" in a 12 ft room printed across the wall into the room
 * next door. Drop the qualifier after the slash first, then truncate.
 */
function fitName(r) {
  const cap = Math.max(4, Math.floor(r.w * 1.15));
  let s = r.name;
  if (s.length > cap && s.includes('/')) s = s.split('/')[0].trim();
  if (s.length > cap && s.includes(' ')) {
    const parts = s.split(' ');
    while (parts.length > 1 && parts.join(' ').length > cap) parts.pop();
    s = parts.join(' ');
  }
  return s.length > cap ? s.slice(0, cap - 1) + '.' : s;
}

/** Bounds of a level in FEET. Exported so a sheet can place a plan before drawing it. */
export function levelBounds(level) {
  const rooms = level.rooms ?? [];
  if (!rooms.length) return null;
  return bounds(rooms);
}

/** The outer boundary of a level, as the union bounds of its rooms. */
function bounds(rooms) {
  return {
    x0: Math.min(...rooms.map(r => r.x0)), x1: Math.max(...rooms.map(r => r.x0 + r.w)),
    y0: Math.min(...rooms.map(r => r.y0)), y1: Math.max(...rooms.map(r => r.y0 + r.d)),
  };
}

/**
 * One level of one scheme, drawn as a schematic plan.
 * Returns the bounds in feet so the caller can lay sheets out.
 */
export function drawSchemeLevel(s, scheme, level, { showDims = true, plan = null } = {}) {
  const rooms = level.rooms ?? [];
  if (!rooms.length) return null;
  const B = bounds(rooms);

  // ── partitions first, so the heavier exterior wall draws over them ────────
  for (const r of rooms) {
    const q = R(r);
    for (const [x1, y1, x2, y2] of [
      [q.x0, q.y0, q.x1, q.y0], [q.x0, q.y1, q.x1, q.y1],
      [q.x0, q.y0, q.x0, q.y1], [q.x1, q.y0, q.x1, q.y1],
    ]) s.wall(x1, y1, x2, y2, INT_T, { fill: INK.poche, color: INK.line, w: LW.light });
  }

  // ── room fills and tags ──────────────────────────────────────────────────
  for (const r of rooms) {
    const q = R(r);
    s.rect(q.x0 + INT_T / 2, q.y0 + INT_T / 2, (q.x1 - q.x0) - INT_T, (q.y1 - q.y0) - INT_T,
      { fill: FILL[r.use] ?? '#f2f3f1', color: 'none', w: 0 });
    // A room too small to letter gets a leader rather than an unreadable label.
    const sf = Math.round(r.w * r.d);
    if (r.w >= 7 && r.d >= 6) {
      // roomTag appends the unit itself; passing "84 SF" printed "84 SF SF".
      // Long names are shortened to the box, because a label that overruns its
      // own room reads as a drawing error even when the room is correct.
      s.roomTag((q.x0 + q.x1) / 2, (q.y0 + q.y1) / 2, fitName(r), sf,
        { size: r.w >= 14 ? 18 : 14 });
    } else {
      s.text((q.x0 + q.x1) / 2, (q.y0 + q.y1) / 2, fitName(r),
        { size: 11, anchor: 'middle', color: INK.mid, dy: 4 });
    }
    if (WET.has(r.use)) {
      // the plumbing wall of this room: its uphill (+y) face
      s.line(q.x0 + 6, q.y1 - 7, q.x1 - 6, q.y1 - 7, { w: LW.heavy, color: INK.water });
    }
  }

  // ── fixtures, furniture and stairs ───────────────────────────────────────
  // Every one of these comes from model/scheme-furnish.mjs, which is the SAME
  // generator the 3D reads. A toilet here is the toilet in the model, at the
  // same coordinates, because there is only one list.
  if (plan) {
    // Doorways FIRST: each one paints out the partition it passes through, so
    // an opening reads as a hole rather than as a leaf drawn over a solid wall.
    for (const d of doorwaysAt(plan, level.ffe)) drawDoorway(s, d);
    for (const st of stairsFor(plan).filter(t => Math.abs(t.level - level.ffe) < 0.6)) drawStair(s, st);
    for (const f of furnishLevel(plan, level.ffe)) {
      const fn = sym[f.type];
      if (fn) fn(s, f);
      else s.rect(f.x, f.y, f.w, f.d, { fill: 'none', color: INK.mid, w: LW.thin });
    }
  }

  // ── the exterior wall, heavy ─────────────────────────────────────────────
  const e = { x0: ft(B.x0), y0: ft(B.y0), x1: ft(B.x1), y1: ft(B.y1) };
  for (const [x1, y1, x2, y2] of [
    [e.x0, e.y0, e.x1, e.y0], [e.x0, e.y1, e.x1, e.y1],
    [e.x0, e.y0, e.x0, e.y1], [e.x1, e.y0, e.x1, e.y1],
  ]) s.wall(x1, y1, x2, y2, EXT_T, { fill: INK.poche, color: INK.line, w: LW.cut });

  // ── glass on the downhill face, where the view and the winter sun are ────
  // Drawn per room rather than as one ribbon, so a plan shows which rooms
  // actually got the view and which were given the cold side.
  for (const r of rooms) {
    if (Math.abs(r.y0 - B.y0) > 0.6) continue;
    if (r.use === 'bath' || r.use === 'mech' || r.use === 'store') continue;
    const q = R(r);
    const wFt = Math.min(r.w - 3, r.w * 0.72);
    if (wFt < 3) continue;
    s.window((q.x0 + q.x1) / 2, e.y0, ft(wFt), 0, { wallT: EXT_T });
  }

  // ── doors ────────────────────────────────────────────────────────────────
  for (const d of level.doors ?? []) {
    const ang = d.face === 'N' ? 0 : d.face === 'S' ? 0 : 90;
    if (d.kind === 'slider') s.slider(ft(d.x), ft(d.y), ft(6), ang, { wallT: EXT_T });
    else s.door(ft(d.x), ft(d.y), ft(3), ang, { wallT: d.kind === 'entry' ? EXT_T : INT_T });
  }

  if (showDims) {
    s.dimH(e.x0, e.x1, e.y0 - 46, null, { above: false });
    s.dimV(e.y0, e.y1, e.x1 + 46, null);
  }
  return B;
}

/**
 * One interior doorway: the partition erased across the opening, jambs marked,
 * and — where it is a door rather than a cased opening — a leaf and its swing.
 * Positions come from model/scheme-doors.mjs, the same list the 3D punches.
 */
function drawDoorway(s, d) {
  const half = d.wIn / 2, T = INT_T;
  if (d.axis === 'Y') {
    s.rect(d.xIn - T / 2 - 1, d.yIn - half, T + 2, d.wIn, { fill: INK.paper, color: 'none', w: 0 });
    s.line(d.xIn - T / 2, d.yIn - half, d.xIn + T / 2, d.yIn - half, { w: LW.hair, color: INK.line });
    s.line(d.xIn - T / 2, d.yIn + half, d.xIn + T / 2, d.yIn + half, { w: LW.hair, color: INK.line });
  } else {
    s.rect(d.xIn - half, d.yIn - T / 2 - 1, d.wIn, T + 2, { fill: INK.paper, color: 'none', w: 0 });
    s.line(d.xIn - half, d.yIn - T / 2, d.xIn - half, d.yIn + T / 2, { w: LW.hair, color: INK.line });
    s.line(d.xIn + half, d.yIn - T / 2, d.xIn + half, d.yIn + T / 2, { w: LW.hair, color: INK.line });
  }
  // A cased opening has no leaf — drawing one would claim a door that is not
  // there, and the difference between the two is most of what an open plan is.
  if (d.kind === 'opening') return;
  s.door(d.xIn, d.yIn, d.wIn, d.axis === 'Y' ? 90 : 0, { wallT: T });
}

/**
 * A real flight: treads counted from the scheme's own floor-to-floor, an up
 * arrow, and a break line. The riser count is the same number the 3D builds
 * steps from, so a stair you can count here is the stair you climb in the model.
 */
function drawStair(s, t) {
  const along = t.run === 'Y' ? t.d : t.w;
  const n = Math.max(2, Math.min(t.risers, Math.floor(along / t.tread)));
  for (let i = 1; i < n; i++) {
    const o = i * t.tread;
    if (t.run === 'Y') s.line(t.x + 4, t.y + o, t.x + t.w - 4, t.y + o, { w: LW.hair, color: INK.mid });
    else s.line(t.x + o, t.y + 4, t.x + o, t.y + t.d - 4, { w: LW.hair, color: INK.mid });
  }
  // UP arrow, pointing the way you climb
  const cx = t.x + t.w / 2, cy = t.y + t.d / 2;
  if (t.run === 'Y') {
    s.line(cx, t.y + 8, cx, t.y + t.d - 8, { w: LW.medium, color: INK.line });
    s.poly([[cx - 5, t.y + t.d - 16], [cx, t.y + t.d - 6], [cx + 5, t.y + t.d - 16]],
      { fill: INK.line, color: INK.line, w: LW.hair });
  } else {
    s.line(t.x + 8, cy, t.x + t.w - 8, cy, { w: LW.medium, color: INK.line });
    s.poly([[t.x + t.w - 16, cy - 5], [t.x + t.w - 6, cy], [t.x + t.w - 16, cy + 5]],
      { fill: INK.line, color: INK.line, w: LW.hair });
  }
  s.text(cx, t.y + 10, `UP ${t.risers}R`, { size: 10, anchor: 'middle', color: INK.mid });
}

/** The heading over one level: which scheme, which floor, how big. */
export function labelLevel(s, scheme, level, mx, my) {
  const rooms = level.rooms ?? [];
  const sf = Math.round(rooms.reduce((a, r) => a + r.w * r.d, 0));
  const circ = Math.round(rooms.filter(r => r.use === 'circ').reduce((a, r) => a + r.w * r.d, 0));
  const beds = rooms.filter(r => r.use === 'bed').length;
  s.stext(mx, my, `${level.name ?? 'LEVEL'} — FFE ${level.ffe}'`, { size: 14, weight: 700, spacing: 1.2 });
  s.stext(mx, my + 16, `${sf.toLocaleString()} SF  ·  ${beds} BED  ·  ${circ} SF CIRCULATION` +
    (sf ? `  (${Math.round((circ / sf) * 100)}%)` : ''), { size: 10, color: INK.mid });
}

/** The legend, drawn once per sheet rather than once per plan. */
export function drawPlanLegend(s, sx, sy) {
  const items = [
    ['#eef1ee', 'BEDROOM'],
    ['#f6f7f5', 'LIVING / DINING'],
    ['#e4eef2', 'WET — BATH, KITCHEN, LAUNDRY, MECHANICAL'],
    ['#e7e9e6', 'CIRCULATION — DRAWN AND PAID FOR'],
    ['#f1f0ea', 'WORK'],
    ['#eceeea', 'STORE'],
  ];
  s.stext(sx, sy, 'ROOM USE', { size: 12, weight: 700, spacing: 1.3 });
  items.forEach(([fill, label], i) => {
    const y = sy + 20 + i * 20;
    s.srect(sx, y - 10, 26, 13, { fill, color: INK.line, lw: LW.hair });
    s.stext(sx + 34, y, label, { size: 10, color: INK.mid });
  });
  const y2 = sy + 20 + items.length * 20 + 10;
  s.sline(sx, y2, sx + 26, y2, { w: LW.heavy, color: INK.water });
  s.stext(sx + 34, y2 + 4, 'PLUMBING WALL', { size: 10, color: INK.mid });
  return y2 + 24;
}
