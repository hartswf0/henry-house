// HENRY HOUSE — BUILDING A SCHEME PROPERLY IN 3D.
//
// The first scheme renders were boxes with a roof slab on top. Fine for asking
// "how much house is there," useless for asking "is this a building." This
// module builds the same declarations as actual construction:
//
//   · framed openings with reveals, sills and heads — not a glass decal
//   · posts, beams and rafters where a scheme says it is a frame
//   · roofs with fascia, a soffit, and an eave that overhangs the wall
//   · decks with joists, a guard, and posts down to the ground they stand on
//   · floors that stack, and a stair where a scheme has more than one
//   · piers with a visible cap and a beam sitting on them
//
// It is still MASSING-PLUS, not a construction model: no studs, no flashing, no
// furniture. The bar is that each scheme should be recognisable as the kind of
// building it claims to be, and comparable to the others on the same terms.

import * as THREE from 'three';
import { roofBase } from '../../../model/schemes.mjs';
import { planFor } from '../../../model/scheme-plans.mjs';
import { furnish, stairsFor } from '../../../model/scheme-furnish.mjs';
import { doorways } from '../../../model/scheme-doors.mjs';

const F = (inches) => inches / 12;
const ft = (n) => n * 12;
const STOREY = 120;

/**
 * A material tiled at a REAL size.
 *
 * Every texture in textures.mjs is authored as one tile with repeat [1,1], so a
 * shared material stretches its whole pattern across whatever face it lands on.
 * The armature's 76 ft roof rendered its 22 standing seams at 3.5 ft apart and
 * read as floorboards. Clone per surface and set the repeat from the surface's
 * real dimensions; the cache keeps that from becoming thousands of materials.
 */
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
    m[k] = m[k].clone();
    m[k].needsUpdate = true;
    m[k].repeat.set(ru, rv);
  }
  _tileCache.set(key, m);
  return m;
}

const box = (x0, x1, y0, y1, z0, z1, mat, { cast = true, receive = true } = {}) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(F(x1 - x0), F(z1 - z0), F(y1 - y0)), mat);
  m.position.set(F((x0 + x1) / 2), F((z0 + z1) / 2), -F((y0 + y1) / 2));
  m.castShadow = cast; m.receiveShadow = receive;
  return m;
};

/**
 * A wall with real openings punched in it.
 *
 * Built as the solid pieces AROUND each opening — sill band, head band, and the
 * piers between — rather than a slab with a glass sticker on the face. That is
 * what gives a reveal, and a reveal is most of what makes a rendered wall read
 * as built rather than printed.
 */
function wallWithOpenings(g, { x0, x1, y, z0, z1, thick, axis, openings, matWall, matGlass, matTrim }) {
  const along = axis === 'X';
  const A0 = along ? x0 : z0;                       // not used; kept for clarity
  const t = thick;
  const put = (a0, a1, b0, b1, mat, cast = true) => {
    if (a1 - a0 < 0.5 || b1 - b0 < 0.5) return;
    const mt = mat === matWall ? tiled(mat, 'wall', F(a1 - a0), F(b1 - b0)) : mat;
    g.add(along ? box(a0, a1, y - t / 2, y + t / 2, b0, b1, mt, { cast })
                : box(y - t / 2, y + t / 2, a0, a1, b0, b1, mt, { cast }));
  };

  const sorted = [...openings].sort((a, b) => a.a0 - b.a0);
  let cursor = x0;
  for (const o of sorted) {
    put(cursor, o.a0, z0, z1, matWall);             // pier between openings
    put(o.a0, o.a1, z0, o.z0, matWall);             // under the sill
    put(o.a0, o.a1, o.z1, z1, matWall);             // over the head
    // glass, set back into the opening so the reveal reads
    const gt = t * 0.28;
    g.add(along ? box(o.a0 + 1.5, o.a1 - 1.5, y - gt / 2, y + gt / 2, o.z0 + 1.5, o.z1 - 1.5, matGlass, { cast: false })
                : box(y - gt / 2, y + gt / 2, o.a0 + 1.5, o.a1 - 1.5, o.z0 + 1.5, o.z1 - 1.5, matGlass, { cast: false }));
    // sill, proud of the face — a shadow line, which is most of the reveal
    const st = t * 0.75;
    g.add(along ? box(o.a0 - 2, o.a1 + 2, y - st / 2, y + st / 2, o.z0 - 2.5, o.z0, matTrim)
                : box(y - st / 2, y + st / 2, o.a0 - 2, o.a1 + 2, o.z0 - 2.5, o.z0, matTrim));
    cursor = o.a1;
  }
  put(cursor, x1, z0, z1, matWall);
}

/** Openings for one wall of a volume: a rhythm, not a random scatter. */
function openingsFor(v, lengthIn, { tall = false, sill = 30, head = 96, minPier = 20 } = {}) {
  const out = [];
  // A rhythm of openings with real piers between them. The first version made
  // one opening per 9 ft with tiny piers, which reads as curtain wall — the
  // opposite of the reference set, where the wall is the cheap part and the
  // glass is the expensive part.
  const n = Math.max(1, Math.round(lengthIn / ft(11)));
  const pier = Math.max(minPier, ft(3.2));
  const w = (lengthIn - pier * (n + 1)) / n;
  if (w < 26) return out;
  for (let i = 0; i < n; i++) {
    const a0 = pier + i * (w + pier);
    out.push({ a0, a1: a0 + w, z0: tall ? 18 : sill, z1: tall ? 100 : head });
  }
  return out;
}

/** Post-and-beam bay: what a "sheltered" or "future" volume actually is. */
function frameBay(g, v, zBot, zTop, mat) {
  const P = 7;
  const corners = [[v.x0 + 5, v.y0 + 5], [v.x1 - 5, v.y0 + 5], [v.x0 + 5, v.y1 - 5], [v.x1 - 5, v.y1 - 5]];
  for (const [px, py] of corners) g.add(box(px - P / 2, px + P / 2, py - P / 2, py + P / 2, zBot, zTop, mat));
  // beams both ways at the head — this is the armature, and it should read
  for (const py of [v.y0 + 5, v.y1 - 5]) g.add(box(v.x0, v.x1, py - 5, py + 5, zTop - 12, zTop, mat));
  g.add(box(v.x0 + 2, v.x0 + 12, v.y0, v.y1, zTop - 12, zTop, mat));
  g.add(box(v.x1 - 12, v.x1 - 2, v.y0, v.y1, zTop - 12, zTop, mat));
}

/** Deck: joists, boards, guard posts and a top rail. */
function deckAt(g, v, z, mats, groundFn) {
  const { deck, steel } = mats;
  g.add(box(v.x0, v.x1, v.y0, v.y1, z - 3, z, tiled(deck, 'deck', F(v.x1 - v.x0), F(v.y1 - v.y0)), { cast: false }));
  for (let x = v.x0 + 12; x < v.x1; x += 36) g.add(box(x - 2, x + 2, v.y0, v.y1, z - 13, z - 3, steel, { cast: false }));
  // guard on the open (downhill) edge
  for (let x = v.x0; x <= v.x1; x += 60) g.add(box(x - 2, x + 2, v.y0 - 2, v.y0 + 2, z, z + 42, steel));
  g.add(box(v.x0, v.x1, v.y0 - 3, v.y0 + 3, z + 38, z + 42, steel));
  // posts down to whatever ground is under them
  for (let x = v.x0 + 24; x < v.x1; x += 96) {
    const gz = groundFn(x, v.y0 + 12);
    if (z - gz > 18) g.add(box(x - 3, x + 3, v.y0 + 8, v.y0 + 14, gz - 12, z - 13, steel));
  }
}

/** Shed roof with fascia, soffit and a real overhang. */
function shedRoof(g, r, base, mats) {
  const { roof, trim } = mats;
  const dIn = r.y1 - r.y0;
  const rise = (r.pitch / 12) * dIn;
  const len = Math.hypot(dIn, rise);
  const ang = -Math.atan2(rise, dIn);
  const mk = (h, mat, dy) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(F(r.x1 - r.x0), F(h), F(len)), mat);
    m.position.set(F((r.x0 + r.x1) / 2), F(base + rise / 2 + dy), -F((r.y0 + r.y1) / 2));
    m.rotation.x = ang;
    m.castShadow = true; m.receiveShadow = true;
    return m;
  };
  // ONE roof plane, dark standing seam, with a timber edge beam at the eave.
  //
  // The first version stacked a covering, a structural slab and rafter tails as
  // three parallel tilted boxes 11 and 24 inches apart. Geometrically the
  // covering was on top — a probe confirmed it — but at this scale and sun
  // angle the three planes read as one pale timber surface with the dark metal
  // showing only in slivers, which is worse than either honest option. So: one
  // plane, and let the eave detail carry the thickness.
  g.add(mk(7, tiled(roof, 'roof', F(r.x1 - r.x0), F(len)), 0));

  // the eave: fascia plus the beam behind it, which is what actually reads
  g.add(box(r.x0 - 3, r.x1 + 3, r.y0 - 5, r.y0 + 2, base - 15, base - 2, trim));
  g.add(box(r.x0, r.x1, r.y0 + 2, r.y0 + 12, base - 15, base - 3, trim));

  // rafter tails, expressed only where they project past the eave
  for (let x = r.x0 + 18; x < r.x1; x += 48) {
    g.add(box(x - 2, x + 2, r.y0 - 5, r.y0 + 26, base - 14, base - 4, trim));
  }
}

/** A straight run of stair, drawn where a volume stacks more than one floor. */
function stairIn(g, v, zBot, zTop, mat) {
  const rise = 7.5, tread = 10.5;
  const n = Math.round((zTop - zBot) / rise);
  const x = v.x1 - 46;
  for (let i = 0; i < n; i++) {
    const z = zBot + (i + 1) * rise;
    const y = v.y1 - 16 - i * tread;
    if (y < v.y0 + 8) break;
    g.add(box(x - 20, x + 20, y - tread / 2, y + tread / 2, z - 2, z, mat, { cast: false }));
  }
}

// ── the builder ─────────────────────────────────────────────────────────────
/**
 * Interior partitions, fixtures, furniture and stairs — all of it read from
 * model/scheme-furnish.mjs, THE SAME generator tools/draw/scheme-plan.mjs
 * draws from. That is the whole mechanism behind "the plans map perfectly to
 * the 3D": there is one list of toilets in this project, at one set of
 * coordinates, and both the drawing and the model consume it. Nothing here
 * invents a position, so nothing here can drift out of step with the plan.
 */
function buildInterior(g, scheme, mats) {
  const plan = planFor(scheme.id);
  if (!plan) return 0;
  const { wall, trim, conc, steel } = mats;
  let placed = 0;

  // Partitions, at the same 5 in the plan poches them at — PUNCHED at every
  // doorway. A solid partition is why the plans showed a house you could not
  // walk through; the same defect existed here, where every room was a sealed
  // box. Head height is 6'-8", so the panel over each opening stays.
  const HEAD = 80;
  const { doors } = doorways(plan);
  /** One wall run, emitted as the segments left between its openings. */
  const runWith = (axis, fixed, a0, a1, z0, z1, gaps, mat) => {
    const cuts = gaps.filter(gp => gp.a0 < a1 && gp.a1 > a0)
      .sort((p, q) => p.a0 - q.a0);
    let cursor = a0;
    for (const c of cuts) {
      if (c.a0 > cursor) emit(axis, fixed, cursor, c.a0, z0, z1, mat);
      // the head panel over the opening
      if (z1 > z0 + HEAD) emit(axis, fixed, Math.max(c.a0, a0), Math.min(c.a1, a1), z0 + HEAD, z1, mat);
      cursor = Math.max(cursor, c.a1);
    }
    if (cursor < a1) emit(axis, fixed, cursor, a1, z0, z1, mat);
  };
  const emit = (axis, fixed, a0, a1, z0, z1, mat) => {
    if (a1 - a0 < 1) return;
    if (axis === 'X') g.add(box(a0, a1, fixed, fixed + 5, z0, z1, mat, { cast: false }));
    else g.add(box(fixed, fixed + 5, a0, a1, z0, z1, mat, { cast: false }));
  };

  for (const lv of plan.levels) {
    const z0 = ft(lv.ffe), z1 = z0 + STOREY - 14;
    const lvDoors = doors.filter(d => Math.abs(d.level - lv.ffe) < 0.6);
    for (const r of lv.rooms ?? []) {
      const x0 = ft(r.x0), x1 = ft(r.x0 + r.w), y0 = ft(r.y0), y1 = ft(r.y0 + r.d);
      // west wall of this room, running in y
      runWith('Y', x0, y0, y1, z0, z1,
        lvDoors.filter(d => d.axis === 'Y' && Math.abs(ft(d.x) - x0) < 7)
          .map(d => ({ a0: ft(d.y - d.w / 2), a1: ft(d.y + d.w / 2) })), trim);
      // uphill wall of this room, running in x
      runWith('X', y1 - 5, x0, x1, z0, z1,
        lvDoors.filter(d => d.axis === 'X' && Math.abs(ft(d.y) - y1) < 7)
          .map(d => ({ a0: ft(d.x - d.w / 2), a1: ft(d.x + d.w / 2) })), trim);
    }
  }

  // fixtures and furniture, each a solid at the generator's own x, y, w, d and
  // the height that fixture actually is
  for (const f of furnish(plan)) {
    const z0 = ft(f.level) + 1;
    const m = f.type === 'panel' || f.type === 'ahu' || f.type === 'hpwh' || f.type === 'tank' ? steel
            : f.type === 'rug' ? conc : trim;
    g.add(box(f.x, f.x + f.w, f.y, f.y + f.d, z0, z0 + (f.h ?? 30), m, { cast: true }));
    placed++;
  }

  // stairs, with the riser count the plan prints under its up arrow
  for (const t of stairsFor(plan)) {
    const z0 = ft(t.level);
    for (let i = 0; i < t.risers; i++) {
      const z = z0 + t.riser * (i + 1);
      if (t.run === 'Y') {
        const y = t.y + (t.d / t.risers) * i;
        g.add(box(t.x + 3, t.x + t.w - 3, y, y + t.d / t.risers, z - t.riser, z, conc, { cast: true }));
      } else {
        const x = t.x + (t.w / t.risers) * i;
        g.add(box(x, x + t.w / t.risers, t.y + 3, t.y + t.d - 3, z - t.riser, z, conc, { cast: true }));
      }
    }
  }
  return placed;
}

export function buildScheme(scheme, mats, groundFn) {
  const g = new THREE.Group();
  const { wall, roof, trim, glass, conc, steel, deck } = mats;

  for (const v of scheme.volumes) {
    const ffe = ft(v.ffe);
    const storeys = v.storeys ?? 1;
    const top = ffe + STOREY * storeys;

    if (v.kind === 'cond') {
      const T = 10;
      // floor plates, one per storey — they read at the reveals and in shadow
      for (let s = 0; s <= storeys; s++) {
        const z = ffe + STOREY * s;
        g.add(box(v.x0, v.x1, v.y0, v.y1, z - 13, z, s === 0 ? conc : trim, { cast: s > 0 }));
      }
      // downhill wall: the view face, generously glazed on every scheme
      wallWithOpenings(g, {
        x0: v.x0, x1: v.x1, y: v.y0 + T / 2, z0: ffe, z1: top, thick: T, axis: 'X',
        openings: [].concat(...Array.from({ length: storeys }, (_, s) =>
          openingsFor(v, v.x1 - v.x0, { tall: true }).map(o => ({
            ...o, z0: ffe + STOREY * s + o.z0, z1: ffe + STOREY * s + o.z1 })))),
        matWall: wall, matGlass: glass, matTrim: trim,
      });
      // uphill wall: the cold side, the cut side, almost solid
      wallWithOpenings(g, {
        x0: v.x0, x1: v.x1, y: v.y1 - T / 2, z0: ffe, z1: top, thick: T, axis: 'X',
        openings: Array.from({ length: storeys }, (_, s) => ({
          a0: v.x0 + (v.x1 - v.x0) * 0.62, a1: v.x0 + (v.x1 - v.x0) * 0.62 + 34,
          z0: ffe + STOREY * s + 44, z1: ffe + STOREY * s + 92 })),
        matWall: wall, matGlass: glass, matTrim: trim,
      });
      // ends
      for (const y of [v.x0, v.x1]) {
        g.add(box(y === v.x0 ? v.x0 : v.x1 - T, y === v.x0 ? v.x0 + T : v.x1,
          v.y0, v.y1, ffe, top, tiled(wall, 'wall', F(v.y1 - v.y0), F(top - ffe))));
      }
      if (storeys > 1) stairIn(g, v, ffe, ffe + STOREY, trim);

    } else if (v.kind === 'future') {
      // roofed, floored, framed, open — the territory that becomes rooms later
      g.add(box(v.x0, v.x1, v.y0, v.y1, ffe - 13, ffe, deck, { cast: false }));
      frameBay(g, v, ffe, ffe + STOREY, trim);

    } else {
      deckAt(g, v, ffe, { deck, steel }, groundFn);
      if (v.dFt >= 10 && v.wFt >= 10) frameBay(g, v, ffe, ffe + STOREY, trim);
    }
  }

  for (const r of scheme.roofs) shedRoof(g, r, roofBase(scheme, r), { roof, trim });

  // how it meets the hill
  const G = scheme.ground;
  if (G.kind === 'piers') {
    const zDeck = ft(scheme.volumes.find(v => v.kind === 'cond')?.ffe ?? 4);
    for (const [px, py] of G.pts) {
      const gz = groundFn(px, py);
      const R = ft(G.diaFt) / 2;
      const m = new THREE.Mesh(new THREE.CylinderGeometry(F(R), F(R * 1.12), F(zDeck - 16 - (gz - 42)), 14), conc);
      m.position.set(F(px), F((gz - 42 + zDeck - 16) / 2), -F(py));
      m.castShadow = true; m.receiveShadow = true;
      g.add(m);
      g.add(box(px - R - 3, px + R + 3, py - R - 3, py + R + 3, zDeck - 16, zDeck - 10, conc));
    }
    // the beams the piers exist to carry
    const ys = [...new Set(G.pts.map(p => p[1]))];
    for (const y of ys) {
      const xs = G.pts.filter(p => p[1] === y).map(p => p[0]);
      g.add(box(Math.min(...xs) - 8, Math.max(...xs) + 8, y - 6, y + 6, zDeck - 16, zDeck - 2, trim));
    }
  } else {
    const zPad = groundFn((G.x0 + G.x1) / 2, G.y0);
    g.add(box(G.x0, G.x1, G.y0, G.y1, zPad - 26, zPad - 2, conc, { cast: false }));
    // the retained edge, which is the thing a bench actually costs
    g.add(box(G.x0 - 8, G.x1 + 8, G.y1 - 10, G.y1 + 2, zPad - 26, zPad + 34, conc));
  }

  buildInterior(g, scheme, mats);
  return g;
}
