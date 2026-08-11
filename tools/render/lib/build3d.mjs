// HENRY HOUSE — BUILDING A SCHEME IN 3D, FROM ITS BLUEPRINT AND NOTHING ELSE.
//
// ─────────────────────────────────────────────────────────────────────────────
// WHY THIS FILE WAS REWRITTEN
//
// The previous version ran FIVE generations of geometry at once — volume walls,
// frame bays, deck structure, roof posts, and a plan-derived envelope — each
// added to answer a complaint about the last, none removed. A phase-1 house
// built 305 meshes. Two of those systems described the same walls from two
// different sources, and three more were sized off the volumes while the
// envelope was sized off the rooms, so the frame and the walls were built to
// different coordinates and neither knew about the other.
//
// That is what "missing walls, flickering walls, unsupported elements" was:
// not five bugs, one cause. See docs/08-the-3d-rebuild.md.
//
// ─────────────────────────────────────────────────────────────────────────────
// THE RULE NOW: ONE SOURCE.
//
// model/scheme-plans.mjs is the only description of these houses that has been
// verified — every room checked for containment, overlap, egress, the freeze
// rule, reachability and stair alignment. Floors, walls, openings, partitions,
// doors, stairs and fixtures all come from it.
//
// The scheme's VOLUMES keep exactly two jobs, both of which a plan genuinely
// cannot do, because both are legitimately larger than the rooms:
//
//   1. ROOF EXTENT     a roof oversails the rooms it covers
//   2. GROUND CONTACT  piers, bench or plinth, and the decks and porches that
//                      are sheltered rather than conditioned
//
// Note what the volumes no longer decide: HEIGHT. roofBase() in model/schemes
// takes its height from the volumes, so it put the roof plane 14 in above the
// wall the plan built — and because it slopes, 80 in above it at the uphill
// face. A flat-topped wall cannot meet a sloping plane, so this file derives
// the roof off the plan's top plate and lets a wall's top FOLLOW the roof.
// One shed section, walls that reach it: high on the cut side, low at the eave.
//
// A scheme with no checked plan gets honest massing — a plain box — because
// pretending to detail an unverified scheme is how the slop started.
import * as THREE from 'three';
import { roofBase, PLATE } from '../../../model/schemes.mjs';
import { planFor } from '../../../model/scheme-plans.mjs';
import { furnish, stairsFor } from '../../../model/scheme-furnish.mjs';
import { doorways } from '../../../model/scheme-doors.mjs';

const F = (inches) => inches / 12;
const ft = (n) => n * 12;
const STOREY = 120;
const EXT = 10;                    // exterior wall, inches
const INT = 5;                     // partition
const SILL = 30, HEAD = 90;        // window band within a storey
const DOOR_HEAD = 80;
const ROOF_T = 7;                  // roof build-up, measured perpendicular
const LOOSE = new Set(['rug', 'sofa', 'chair', 'table-d', 'table', 'bench',
                       'desk', 'bedK', 'bedQ', 'nightstand', 'shelf']);

// World-scaled UVs: a texture tile is a fixed size in FEET, so a 76 ft roof
// does not read as floorboards.
const TILE_FT = { roof: 30, wall: 8, deck: 6, trim: 8, conc: 10, steel: 4 };
const _tileCache = new Map();
function tiled(mat, kind, aFt, bFt) {
  const t = TILE_FT[kind] ?? 8;
  const ru = Math.max(1, Math.round(aFt / t)), rv = Math.max(1, Math.round(bFt / t));
  const key = `${mat.uuid}|${ru}x${rv}`;
  if (_tileCache.has(key)) return _tileCache.get(key);
  const m = mat.clone();
  for (const k of ['map', 'normalMap', 'roughnessMap']) {
    if (!m[k]) continue;
    m[k] = m[k].clone(); m[k].needsUpdate = true; m[k].repeat.set(ru, rv);
  }
  _tileCache.set(key, m); return m;
}

/**
 * Everything is this box. Inches in, feet out; scene z runs opposite to model y.
 *
 * Every mesh is TAGGED with what it is. The checks used to infer that from
 * dimensions — "tall and thin in one direction is a wall" — and the inference
 * was wrong in both directions: it read roof eaves and deck framing as walls,
 * and it read a house's actual walls as nothing at all. A check that has to
 * guess what it is looking at cannot be trusted when it passes OR when it
 * fails, so the builder now says, and tools/check/envelope.mjs reads the tag.
 */
const box = (x0, x1, y0, y1, z0, z1, mat, { cast = true, receive = true, part = 'other', level } = {}) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(F(x1 - x0), F(z1 - z0), F(y1 - y0)), mat);
  m.position.set(F((x0 + x1) / 2), F((z0 + z1) / 2), -F((y0 + y1) / 2));
  m.castShadow = cast; m.receiveShadow = receive;
  m.userData.part = part; if (level !== undefined) m.userData.level = level;
  return m;
};

/**
 * A box whose TOP can slope, given as its height at the downhill face and at
 * the uphill face. Under a shed roof every wall running uphill has a sloping
 * top; drawing it flat is what left a 6.7 ft band of daylight along the top of
 * the Armature's uphill wall. This is still ONE mesh — the four top corners
 * move, every face stays planar, the UVs survive — so following the roof costs
 * no geometry at all. It is the alternative to a second system of gable
 * infill pieces, and a second system is the thing this rebuild removes.
 */
function slab(x0, x1, y0, y1, z0, topY0, topY1, mat,
              { cast = true, receive = true, part = 'wall', level, outside, inner } = {}) {
  const zMax = Math.max(topY0, topY1);
  const geo = new THREE.BoxGeometry(F(x1 - x0), F(zMax - z0), F(y1 - y0));
  if (Math.abs(topY0 - topY1) > 0.01) {
    const p = geo.attributes.position;
    const hy = F(zMax - z0) / 2;
    for (let i = 0; i < p.count; i++) {
      if (p.getY(i) <= 0) continue;                     // bottom half stays put
      // local +z is model y0 — box() maps model y to scene -z
      const t = p.getZ(i) > 0 ? topY0 : topY1;
      p.setY(i, hy - F(zMax - t));
    }
    p.needsUpdate = true;
    geo.computeVertexNormals();
  }
  // An exterior wall is siding on ONE face. Giving the whole box the siding
  // material lined every room in the house with the outside of the building,
  // which is what the interior view showed. BoxGeometry carries six material
  // groups in the order +x, -x, +y, -y, +z, -z, and scene +z is model -y
  // (downhill), so naming the outward face is enough to finish both sides.
  const m = new THREE.Mesh(geo, outside === undefined ? mat
    : [0, 1, 2, 3, 4, 5].map(i => (i === outside ? mat : inner)));
  m.position.set(F((x0 + x1) / 2), F((z0 + zMax) / 2), -F((y0 + y1) / 2));
  m.castShadow = cast; m.receiveShadow = receive;
  m.userData.part = part; if (level !== undefined) m.userData.level = level;
  return m;
}

/**
 * A run of wall along one axis, emitted as the pieces left between its gaps.
 *
 * This is the ONLY thing in the file that makes a wall. Doors, windows and the
 * panel over each opening are all gaps in a run — which is why a door in the
 * plan is a hole in the model rather than a second system drawn on top of a
 * solid one.
 *
 * `top(x, y)` is the height the wall reaches at a point: the floor above where
 * there is one, the roof underside where there is not.
 */
function run(g, { axis, fixed, thick, a0, a1, z0, top, gaps = [], mat, glassMat, part, level,
                  outside, inner }) {
  const topAt = (a) => (axis === 'X' ? top(a, fixed + thick / 2) : top(fixed + thick / 2, a));
  const emit = (b0, b1, c0, cTop, m, kind, cast = true) => {
    if (b1 - b0 < 0.5) return;
    // an X run sits at one y, so the roof over it is level; a Y run climbs
    const t0 = axis === 'X' ? cTop((b0 + b1) / 2) : cTop(b0);
    const t1 = axis === 'X' ? t0 : cTop(b1);
    if (Math.min(t0, t1) - c0 < 0.5) return;
    const o = { cast, part: kind, level, ...(kind === part ? { outside, inner } : {}) };
    if (axis === 'X') g.add(slab(b0, b1, fixed, fixed + thick, c0, t0, t1, m, o));
    else g.add(slab(fixed, fixed + thick, b0, b1, c0, t0, t1, m, o));
  };
  const full = (a) => topAt(a);
  const cuts = gaps.filter(gp => gp.a0 < a1 && gp.a1 > a0).sort((p, q) => p.a0 - q.a0);
  let cursor = a0;
  for (const c of cuts) {
    const g0 = Math.max(c.a0, a0), g1 = Math.min(c.a1, a1);
    if (g0 > cursor) emit(cursor, g0, z0, full, mat, part);
    if (c.kind === 'glass') {
      emit(g0, g1, z0, () => z0 + SILL, mat, part);                          // sill
      emit(g0, g1, z0 + SILL, () => z0 + HEAD, glassMat, 'glass', false);    // the window
      emit(g0, g1, z0 + HEAD, full, mat, part);                              // head
    } else {
      emit(g0, g1, z0 + DOOR_HEAD, full, mat, part);                         // over the door
    }
    cursor = Math.max(cursor, g1);
  }
  if (cursor < a1) emit(cursor, a1, z0, full, mat, part);
}

/** Deck, porch, undercroft — sheltered, not conditioned, so not in the plan. */
function deckAt(g, v, z, mats, groundFn, guardEdge = 'y0', posted = []) {
  const { deck, steel } = mats;
  g.add(box(v.x0, v.x1, v.y0, v.y1, z - 3, z,
    tiled(deck, 'deck', F(v.x1 - v.x0), F(v.y1 - v.y0)), { cast: false, part: 'deck' }));
  // The guard goes on the OPEN edge. A terrace uphill of the house has its
  // open edge uphill, and putting the rail on the house side of it stood the
  // whole railing inside the wall.
  const gy = guardEdge === 'y1' ? v.y1 : v.y0;
  for (let x = v.x0; x <= v.x1; x += 72) g.add(box(x - 2, x + 2, gy - 2, gy + 2, z, z + 42, steel, { part: 'guard' }));
  g.add(box(v.x0, v.x1, gy - 3, gy + 3, z + 38, z + 42, steel, { part: 'guard' }));
  for (let x = v.x0 + 24; x < v.x1; x += 108) {
    const gz = groundFn(x, v.y0 + 12);
    if (z - gz <= 18) continue;
    if (posted.some(([px, py]) => Math.abs(px - x) < 30 && Math.abs(py - (v.y0 + 11)) < 30)) continue;
    posted.push([x, v.y0 + 11]);
    // up to the UNDERSIDE of the decking. Stopping at z-13 left every post ten
    // inches short of the thing it carries — the deck and its whole guard rail
    // hung in the air, which is what SUPPORT found on the Narrow.
    g.add(box(x - 3, x + 3, v.y0 + 8, v.y0 + 14, gz - 12, z - 3, steel, { part: 'post' }));
  }
}

/** One roof plane, laid so its UNDERSIDE is the plane the walls reach up to. */
function shedRoof(g, r, base, mats) {
  const { roof, trim } = mats;
  const dIn = r.y1 - r.y0;
  const rise = (r.pitch / 12) * dIn;
  const len = Math.hypot(dIn, rise);
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(F(r.x1 - r.x0), F(ROOF_T), F(len)),
    tiled(roof, 'roof', F(r.x1 - r.x0), F(len)));
  // base is the underside at the low edge; lift the slab by half its build-up
  // measured vertically, so the plane the walls meet is the plane they meet.
  m.position.set(F((r.x0 + r.x1) / 2),
                 F(base + rise / 2 + (ROOF_T / 2) * (len / dIn)),
                 -F((r.y0 + r.y1) / 2));
  m.rotation.x = -Math.atan2(rise, dIn);
  m.castShadow = true; m.receiveShadow = true;
  m.userData.part = 'roof';
  g.add(m);
  g.add(box(r.x0 - 3, r.x1 + 3, r.y0 - 5, r.y0 + 2, base - 13, base, trim, { part: 'fascia' }));
}

// ── WHAT THE PLAN SAYS THE BUILDING IS ──────────────────────────────────────
/** One rectangle per level, straight off the rooms the checker accepted. */
function planOutlines(plan) {
  const out = [];
  for (const lv of plan.levels) {
    const rooms = lv.rooms ?? [];
    if (!rooms.length) continue;
    out.push({
      ffe: lv.ffe, rooms,
      x0: Math.min(...rooms.map(r => ft(r.x0))), x1: Math.max(...rooms.map(r => ft(r.x0 + r.w))),
      y0: Math.min(...rooms.map(r => ft(r.y0))), y1: Math.max(...rooms.map(r => ft(r.y0 + r.d))),
    });
  }
  return out;
}

/** No checked plan: one rectangle per storey of each conditioned volume. */
function massingOutlines(scheme) {
  const out = [];
  for (const v of scheme.volumes.filter(x => x.kind !== 'shelt')) {
    for (let s = 0; s < (v.storeys ?? 1); s++) {
      out.push({ ffe: v.ffe + 10 * s, rooms: null, x0: v.x0, x1: v.x1, y0: v.y0, y1: v.y1 });
    }
  }
  return out;
}

/**
 * Where each roof plane sits. The arithmetic lives in model/schemes.mjs, NOT
 * here: the section drawing needs the same answer, and a height computed
 * separately by the renderer is a second source by definition — which is the
 * fault this whole file exists to remove.
 */
function roofPlanes(scheme) {
  return scheme.roofs.map(r => ({ r, slope: r.pitch / 12, base: roofBase(scheme, r) }));
}

/** The height a wall on this level reaches: the floor above, or the roof. */
function topFn(outlines, L, roofUnder) {
  const above = outlines.filter(o => o.ffe > L.ffe + 0.5 &&
    o.x0 < L.x1 && o.x1 > L.x0 && o.y0 < L.y1 && o.y1 > L.y0);
  if (above.length) {
    const z = ft(Math.min(...above.map(o => o.ffe))) - 13;
    return () => z;
  }
  const flat = ft(L.ffe) + PLATE;
  return (x, y) => {
    const z = roofUnder(x, y);
    return z === null ? flat : Math.max(z, flat);
  };
}

/**
 * A rectangle with rectangular holes cut out of it, returned as the pieces
 * that are left. A floor is the only thing here that needs it, and it needs it
 * for one reason: a stair arriving at a level goes THROUGH the floor of that
 * level. Drawing the plate solid buried the top three treads in it — a stair
 * running into the underside of a floor, which is both unbuildable and the
 * reason you could not see between storeys in the walkthrough.
 */
function holed(rect, holes) {
  let pieces = [rect];
  for (const h of holes) {
    const next = [];
    for (const p of pieces) {
      if (h.x0 >= p.x1 || h.x1 <= p.x0 || h.y0 >= p.y1 || h.y1 <= p.y0) { next.push(p); continue; }
      const cx0 = Math.max(h.x0, p.x0), cx1 = Math.min(h.x1, p.x1);
      const cy0 = Math.max(h.y0, p.y0), cy1 = Math.min(h.y1, p.y1);
      if (p.y0 < cy0) next.push({ x0: p.x0, x1: p.x1, y0: p.y0, y1: cy0 });
      if (cy1 < p.y1) next.push({ x0: p.x0, x1: p.x1, y0: cy1, y1: p.y1 });
      if (p.x0 < cx0) next.push({ x0: p.x0, x1: cx0, y0: cy0, y1: cy1 });
      if (cx1 < p.x1) next.push({ x0: cx1, x1: p.x1, y0: cy0, y1: cy1 });
    }
    pieces = next;
  }
  return pieces.filter(p => p.x1 - p.x0 > 1 && p.y1 - p.y0 > 1);
}

// ── THE BUILDING ────────────────────────────────────────────────────────────
function buildLevel(g, L, top, doors, wells, mats, isLowest) {
  const { wall, trim, conc, glass } = mats;
  const z0 = ft(L.ffe);
  const wallMat = tiled(wall, 'wall', F(L.x1 - L.x0), 10);
  // the inside face of the end walls: an X run stops there rather than
  // running through the corner, so the two walls that meet at a corner share
  // one corner instead of each modelling the whole of it
  const ix0 = L.x0 + EXT, ix1 = L.x1 - EXT, iy0 = L.y0 + EXT, iy1 = L.y1 - EXT;

  // floor plate, with a hole where a stair comes up through it
  for (const p of holed({ x0: L.x0, x1: L.x1, y0: L.y0, y1: L.y1 }, wells)) {
    g.add(box(p.x0, p.x1, p.y0, p.y1, z0 - 13, z0, isLowest ? conc : trim,
      { cast: false, part: 'floor', level: L.ffe }));
  }

  // ── EXTERIOR ────────────────────────────────────────────────────────────
  // Downhill face: glass where a room deserves it, solid where it does not.
  // A bathroom does not get the view, and the drawing says so too.
  const glassGaps = [];
  if (L.rooms) {
    for (const r of L.rooms) {
      if (Math.abs(ft(r.y0) - L.y0) > 6) continue;
      if (['bath', 'mech', 'store', 'laundry'].includes(r.use)) continue;
      const a0 = ft(r.x0) + 16, a1 = ft(r.x0 + r.w) - 16;
      if (a1 - a0 > 24) glassGaps.push({ a0, a1, kind: 'glass' });
    }
  } else {
    glassGaps.push({ a0: L.x0 + 24, a1: L.x1 - 24, kind: 'glass' });
  }
  // Face 4 is scene +z, which is model -y: downhill. Face 5 is uphill, 1 is
  // west, 0 is east. Each exterior run names the face that faces the weather.
  run(g, { axis: 'X', fixed: L.y0, thick: EXT, a0: ix0, a1: ix1, z0, top,
           gaps: glassGaps, mat: wallMat, glassMat: glass, part: 'wall', level: L.ffe,
           outside: 4, inner: trim });

  // Uphill face: the cold side, the cut side. One high strip, nothing more.
  run(g, { axis: 'X', fixed: L.y1 - EXT, thick: EXT, a0: ix0, a1: ix1, z0, top,
           gaps: [{ a0: L.x0 + (L.x1 - L.x0) * 0.55, a1: L.x0 + (L.x1 - L.x0) * 0.55 + 40, kind: 'glass' }],
           mat: wallMat, glassMat: glass, part: 'wall', level: L.ffe,
           outside: 5, inner: trim });

  // The two ends. Their tops climb with the roof — that is the shed section.
  for (const [fx, face] of [[L.x0, 1], [L.x1 - EXT, 0]]) {
    const endGaps = (L.y1 - L.y0) > 180
      ? [{ a0: L.y0 + 30, a1: L.y0 + 30 + 44, kind: 'glass' }] : [];
    run(g, { axis: 'Y', fixed: fx, thick: EXT, a0: L.y0, a1: L.y1, z0, top,
             gaps: endGaps, mat: wallMat, glassMat: glass, part: 'wall', level: L.ffe,
             outside: face, inner: trim });
  }

  // ── PARTITIONS ──────────────────────────────────────────────────────────
  // Each room contributes its west and uphill faces — between two rooms that
  // is one wall drawn once, by the room to the east or downhill of it. A face
  // that IS the outer edge is skipped: that wall already exists above, and
  // drawing it twice is the coplanar z-fighting that made the walls strobe.
  // A partition stops at the INSIDE face of the exterior wall it meets. Running
  // it to the outer edge buried up to 42% of a short partition inside the wall.
  for (const r of L.rooms ?? []) {
    const x0 = ft(r.x0), x1 = ft(r.x0 + r.w), y0 = ft(r.y0), y1 = ft(r.y0 + r.d);
    // At a corner one wall runs through and the other butts into it. The west
    // partition runs; the uphill one starts at its face. Letting both run left
    // a stub of the butting wall — sometimes only six inches of it — sitting
    // inside the wall it crossed.
    const west = Math.abs(x0 - L.x0) > 2;
    if (west) {
      run(g, { axis: 'Y', fixed: x0, thick: INT,
               a0: Math.max(y0, iy0), a1: Math.min(y1, iy1), z0, top,
               gaps: doors.filter(d => d.axis === 'Y' && Math.abs(ft(d.x) - x0) < 7)
                 .map(d => ({ a0: ft(d.y - d.w / 2), a1: ft(d.y + d.w / 2), kind: 'door' })),
               mat: trim, glassMat: glass, part: 'partition', level: L.ffe });
    }
    if (Math.abs(y1 - L.y1) > 2) {
      run(g, { axis: 'X', fixed: y1 - INT, thick: INT,
               a0: Math.max(x0 + (west ? INT : 0), ix0), a1: Math.min(x1, ix1), z0, top,
               gaps: doors.filter(d => d.axis === 'X' && Math.abs(ft(d.y) - y1) < 7)
                 .map(d => ({ a0: ft(d.x - d.w / 2), a1: ft(d.x + d.w / 2), kind: 'door' })),
               mat: trim, glassMat: glass, part: 'partition', level: L.ffe });
    }
  }
}

// ── THE SCHEME ──────────────────────────────────────────────────────────────
export function buildScheme(scheme, mats, groundFn) {
  const g = new THREE.Group();
  const { trim, conc, steel } = mats;
  const G = scheme.ground;
  const plan = planFor(scheme.id);
  const outlines = plan ? planOutlines(plan) : massingOutlines(scheme);

  // Roofs are resolved BEFORE the walls, because the walls reach up to them.
  const planes = roofPlanes(scheme);
  const roofUnder = (x, y) => {
    let z = null;
    for (const { r, slope, base } of planes) {
      if (x < r.x0 - 1 || x > r.x1 + 1 || y < r.y0 - 1 || y > r.y1 + 1) continue;
      const t = base + slope * (y - r.y0);
      if (z === null || t > z) z = t;
    }
    return z;
  };

  const doors = plan ? doorways(plan).doors : [];
  const flights = plan ? stairsFor(plan) : [];
  const lowest = outlines.length ? Math.min(...outlines.map(o => o.ffe)) : 0;
  for (const L of outlines) {
    // a stair that ARRIVES at this level needs a hole in this level's floor
    const wells = flights
      .filter(t => Math.abs(ft(t.level) + t.risers * t.riser - ft(L.ffe)) < 8)
      .map(t => ({ x0: t.x - 2, x1: t.x + t.w + 2, y0: t.y - 2, y1: t.y + t.d + 2 }));
    buildLevel(g, L, topFn(outlines, L, roofUnder),
      doors.filter(d => Math.abs(d.level - L.ffe) < 0.6), wells, mats, L.ffe <= lowest + 0.1);
  }

  // ── STAIRS, then FIXTURES ─────────────────────────────────────────────────
  if (plan) {
    for (const t of flights) {
      const z = ft(t.level);
      for (let i = 0; i < t.risers; i++) {
        const zt = z + t.riser * (i + 1);
        if (t.run === 'Y') {
          const y = t.y + (t.d / t.risers) * i;
          g.add(box(t.x + 3, t.x + t.w - 3, y, y + t.d / t.risers, zt - t.riser, zt, conc, { part: 'stair' }));
        } else {
          const x = t.x + (t.w / t.risers) * i;
          g.add(box(x, x + t.w / t.risers, t.y + 3, t.y + t.d - 3, zt - t.riser, zt, conc, { part: 'stair' }));
        }
      }
    }
    for (const f of furnish(plan)) {
      const z = ft(f.level) + 1;
      const m = ['panel', 'ahu', 'hpwh', 'tank'].includes(f.type) ? steel : f.type === 'rug' ? conc : trim;
      // Plumbed and built-in things are FIXTURES and must not intersect
      // anything. Loose furniture is furniture: a chair tucks under a table
      // and a sofa stands on a rug, and neither is an unbuildable condition.
      const part = LOOSE.has(f.type) ? 'furniture' : 'fixture';
      g.add(box(f.x, f.x + f.w, f.y, f.y + f.d, z, z + (f.h ?? 30), m, { part, level: f.level }));
    }
  }

  // Sheltered volumes — deck, porch, undercroft. Real architecture, and the
  // one thing the plan does not describe because it is not conditioned.
  //
  // A deck is extended to MEET the wall it serves when it is drawn within a few
  // feet of it. The Narrow's porch was drawn 2 ft clear of the house, so the
  // front door opened onto a gap and the whole porch was structurally detached
  // — which is how SUPPORT found it. A deck that stands genuinely apart from
  // the building, further than a threshold could span, is left where it is.
  // one register of where a post already stands, shared by the decks and the
  // roof, so no two systems put two posts in one place
  const posted = [];
  for (const v of scheme.volumes) {
    if (v.kind !== 'shelt') continue;
    const d = { ...v };
    let guardEdge = 'y0';
    for (const o of outlines) {
      if (o.x0 >= d.x1 || o.x1 <= d.x0) continue;
      if (d.y1 <= o.y0 && o.y0 - d.y1 < ft(6)) d.y1 = o.y0;   // porch below the house
      if (d.y0 >= o.y1 && d.y0 - o.y1 < ft(6)) { d.y0 = o.y1; guardEdge = 'y1'; }  // terrace above
    }
    for (const o of outlines) {
      if (o.y0 >= d.y1 || o.y1 <= d.y0) continue;
      if (d.x1 <= o.x0 && o.x0 - d.x1 < ft(6)) d.x1 = o.x0;
      if (d.x0 >= o.x1 && d.x0 - o.x1 < ft(6)) d.x0 = o.x1;
    }
    deckAt(g, d, ft(v.ffe), mats, groundFn, guardEdge, posted);
  }

  // ── ROOFS, AND WHAT HOLDS THEM UP ────────────────────────────────────────
  // A roof is carried by a WALL where a level outline sits under it, and by a
  // POST where none does. The test reads the outlines the walls were actually
  // built from, so a post can no longer appear beside a wall already doing the
  // job — which it did when this test read the volumes and the walls came from
  // the plan.
  const carried = (x, y) => outlines.some(o =>
    x > o.x0 - 40 && x < o.x1 + 40 && y > o.y0 - 40 && y < o.y1 + 40);
  // …and a post is not added where a post already stands. The decks put theirs
  // in first, above; a roof post landing on one of them was two posts in one
  // place — the last surviving instance of two systems building the same
  // thing, which is the whole complaint this rebuild answers.
  const GRID = ft(16);
  for (const { r, slope, base } of planes) {
    shedRoof(g, r, base, mats);
    const nx = Math.max(1, Math.round((r.x1 - r.x0) / GRID));
    const ny = Math.max(1, Math.round((r.y1 - r.y0) / GRID));
    for (let i = 0; i <= nx; i++) for (let j = 0; j <= ny; j++) {
      const x = r.x0 + ((r.x1 - r.x0) * i) / nx;
      const y = r.y0 + ((r.y1 - r.y0) * j) / ny;
      if (carried(x, y)) continue;
      if (posted.some(([px, py]) => Math.abs(px - x) < 30 && Math.abs(py - y) < 30)) continue;
      const zTop = base + slope * (y - r.y0);
      const gz = groundFn(x, y);
      if (zTop - gz < 60) continue;
      if (G.kind === 'piers' && G.pts.some(([px, py]) => Math.abs(px - x) < 30 && Math.abs(py - y) < 30)) continue;
      posted.push([x, y]);
      g.add(box(x - 5, x + 5, y - 5, y + 5, gz - 12, zTop, steel, { part: 'post' }));
      g.add(box(x - 9, x + 9, y - 9, y + 9, gz - 14, gz + 3, conc, { part: 'footing' }));
    }
  }

  // ── THE GROUND ───────────────────────────────────────────────────────────
  if (G.kind === 'piers') {
    // The pier's head is the UNDERSIDE of what it carries — the decking where
    // a deck runs over it, the lowest floor otherwise. Taking that height from
    // the volumes instead left every pier three inches short of the floor it
    // was supposedly carrying, and pushed some of them up THROUGH a deck and
    // into its guard rail.
    for (const [px, py] of G.pts) {
      // the underside of the LOWEST thing over this point, whatever it is. A
      // pier that stops under the first candidate it finds rises through the
      // others — through a deck and into its guard rail, through a wall,
      // through a stair — which is where six of the last clashes came from.
      // the pier's own radius decides what it runs into, not a guessed margin
      const R = ft(G.diaFt) / 2;
      const hits = (r) => px + R > r.x0 && px - R < r.x1 && py + R > r.y0 && py - R < r.y1;
      const cand = [];
      for (const v of scheme.volumes) if (v.kind === 'shelt' && hits(v)) cand.push(ft(v.ffe) - 3);
      for (const o of outlines) if (hits(o)) cand.push(ft(o.ffe) - 13);
      const zTop = cand.length ? Math.min(...cand) : ft(lowest) - 13;
      const gz = groundFn(px, py);
      const m = new THREE.Mesh(
        new THREE.CylinderGeometry(F(R), F(R * 1.12), F(Math.max(24, zTop - (gz - 42))), 12), conc);
      m.position.set(F(px), F((gz - 42 + zTop) / 2), -F(py));
      m.castShadow = true; m.receiveShadow = true;
      m.userData.part = 'pier';
      g.add(m);
    }
  } else {
    // The pad stops at the underside of the floor it bears. Left at its own
    // height it rose through the slab above it.
    const zPad = groundFn((G.x0 + G.x1) / 2, G.y0);
    const zTop = Math.min(zPad - 2, ft(lowest) - 13);
    g.add(box(G.x0, G.x1, G.y0, G.y1, zTop - 20, zTop, conc, { cast: false, part: 'plinth' }));
  }
  return g;
}

export default { buildScheme };
