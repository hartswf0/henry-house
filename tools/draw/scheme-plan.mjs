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
export function drawSchemeLevel(s, scheme, level, { showDims = true } = {}) {
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
      s.roomTag((q.x0 + q.x1) / 2, (q.y0 + q.y1) / 2, r.name, `${sf} SF`,
        { size: r.w >= 12 ? 19 : 15 });
    } else {
      s.text((q.x0 + q.x1) / 2, (q.y0 + q.y1) / 2, r.name,
        { size: 12, anchor: 'middle', color: INK.mid, dy: 4 });
    }
    if (WET.has(r.use)) {
      // the plumbing wall of this room: its uphill (+y) face
      s.line(q.x0 + 6, q.y1 - 7, q.x1 - 6, q.y1 - 7, { w: LW.heavy, color: INK.water });
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
