// HENRY HOUSE — 3D scene, built from model/geometry.mjs.
//
// This is not a separate "render model". The browser imports the SAME file the
// plans and sections are generated from, including the wall openings. If a
// window moves on A-101 it moves in the render, because there is only one of it.
//
// Model units are INCHES. Three.js works in FEET here:
//    three.x =  X/12      three.y = Z/12 (up)      three.z = -Y/12
// so +three.z is DOWNHILL / the view direction, and -three.z is the cut.

import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import G, {
  LEVELS, FOOTPRINTS, GRID, BAR, LINK, GARAGE, ROOFS, ROOF_ASSEMBLY,
  STRUCTURE, DECKS, DRAIN_GAP, SITE_SLOPE, CLERESTORY, ROOMS, EXT_STAIR,
} from '/model/geometry.mjs';
import { OPENINGS, GARAGE_OPENINGS, OPEN_EDGES } from '/model/openings.mjs';
import { FIXTURES } from '/model/fixtures.mjs';
import * as MAT from './textures.mjs';
import { buildVegetation } from './vegetation.mjs';

const F = (inches) => inches / 12;
const ft = (n) => n * 12;
const [L0, L1, L2] = LEVELS;

const rng = (seed) => { let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; };
const smoothstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// ── TERRAIN ─────────────────────────────────────────────────────────────────
const GAP_OUT = DRAIN_GAP.y1;
const COURT_BACK = GAP_OUT + ft(26);
const COURT_Z = L1.ffe - 8;

/** Lateral influence of the cut bench: 1 across the built area, 0 away from it. */
function benchInfluence(X) {
  const a = ft(-22), b = ft(122), fade = ft(34);
  return smoothstep(a - fade, a, X) * (1 - smoothstep(b, b + fade, X));
}

/** Finished site elevation (inches above datum) at a model point.
 *
 * Rule that matters: INSIDE the building footprint the ground must stay BELOW
 * the lowest slab. The first version ramped it up to 90" under the house, which
 * buried the entire walkout level and made a three-storey house read as one.
 * The step back up to the drain gap happens behind the spine wall, which hides it.
 */
export function siteZ(X, Y) {
  const nat = SITE_SLOPE.grade(X, Y);
  const lat = benchInfluence(X);
  if (lat < 0.002) return nat;

  const overLower = X < FOOTPRINTS.L0.x1 + 24;     // the walkout half of the bar
  const underFloor = overLower ? -12 : Math.min(nat, L1.ffe - 46);
  let bench;

  if (Y <= DECKS[1].y0) {
    bench = nat;                                            // below the terrace, untouched
  } else if (Y <= 0) {
    bench = overLower ? -6 : underFloor;                    // lower terrace
  } else if (Y < DRAIN_GAP.y0) {
    bench = underFloor;                                     // under the building — never pokes through
  } else if (Y < GAP_OUT) {
    bench = DRAIN_GAP.invert;                               // the drain gap
  } else if (Y < COURT_BACK) {
    bench = COURT_Z;                                        // motor court
  } else {
    bench = Math.min(nat, COURT_Z + (Y - COURT_BACK) / 1.5); // cut face 1.5H:1V
  }
  return nat + (bench - nat) * lat;
}

function buildTerrain(realtime = false) {
  const W = 620, D = 640, SEG = realtime ? 96 : 132;               // feet
  const g = new THREE.PlaneGeometry(W, D, SEG, SEG);
  g.rotateX(-Math.PI / 2);
  const cx = F(ft(50)), cz = 40;
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const tx = p.getX(i) + cx, tz = p.getZ(i) + cz;
    p.setX(i, tx); p.setZ(i, tz);
    p.setY(i, F(siteZ(tx * 12, -tz * 12)));
  }
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, MAT.groundMaterial());
  m.receiveShadow = true; m.castShadow = false;
  return m;
}

// ── GEOMETRY HELPERS ────────────────────────────────────────────────────────
// Texture tile size in FEET, per material. Without this every box gets UV 0..1
// across its whole face, so one 1024px tile stretches over a 70ft wall and a
// 6" board renders 4ft wide. This is the difference between a material and a
// smear.
const TILE = { siding: 8, roof: 30, stone: 8, concrete: 8, gravel: 12, paver: 4, floor: 10, plaster: 12, ceilWood: 8, deck: 6 };
function tileFor(mat, M) {
  for (const k of Object.keys(TILE)) if (M[k] === mat) return TILE[k];
  return 0;
}
/** Rescale BoxGeometry UVs so each face tiles at `t` feet regardless of size. */
function boxUV(g, w, h, d, t) {
  if (!t) return g;
  const uv = g.attributes.uv;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];  // +X -X +Y -Y +Z -Z
  for (let f = 0; f < 6; f++) {
    const [du, dv] = dims[f];
    for (let i = 0; i < 4; i++) {
      const k = f * 4 + i;
      uv.setXY(k, uv.getX(k) * (du / t), uv.getY(k) * (dv / t));
    }
  }
  uv.needsUpdate = true;
  return g;
}
let _M = null;
function mbox(x0, x1, y0, y1, z0, z1, mat, { cast = true, receive = true } = {}) {
  const g = new THREE.BoxGeometry(F(x1 - x0), F(z1 - z0), F(y1 - y0));
  if (_M) boxUV(g, F(x1 - x0), F(z1 - z0), F(y1 - y0), tileFor(mat, _M));
  const m = new THREE.Mesh(g, mat);
  m.position.set(F((x0 + x1) / 2), F((z0 + z1) / 2), -F((y0 + y1) / 2));
  m.castShadow = cast; m.receiveShadow = receive;
  return m;
}

/** Polygon in the (Y,Z) plane, extruded along X. pts = [[Yin, Zin], ...] */
function prismYZ(pts, x0, x1, mat, { cast = true, receive = true } = {}) {
  const shape = new THREE.Shape();
  pts.forEach(([y, z], i) => i ? shape.lineTo(F(y), F(z)) : shape.moveTo(F(y), F(z)));
  shape.closePath();
  const g = new THREE.ExtrudeGeometry(shape, { depth: F(x1 - x0), bevelEnabled: false });
  // ExtrudeGeometry's WorldUVGenerator emits UVs in world units (feet here),
  // so dividing by the tile size gives real-world tiling.
  const t = _M ? tileFor(mat, _M) : 0;
  if (t) {
    const uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / t, uv.getY(i) / t);
    uv.needsUpdate = true;
  }
  g.rotateY(Math.PI / 2);
  const m = new THREE.Mesh(g, mat);
  m.position.x = F(x0);
  m.castShadow = cast; m.receiveShadow = receive;
  return m;
}

/**
 * A wall run, split by the openings that actually pierce it.
 * axis 'H' runs along X at a fixed Y band; 'V' runs along Y at a fixed X band.
 */
function wallRun({ axis, bandLo, bandHi, from, to, zBot, zTop, ffe, mat, glass, group, openings }) {
  const hits = openings
    .filter(o => (axis === 'H' ? o.orient === 'H' : o.orient === 'V'))
    .filter(o => Math.abs((axis === 'H' ? o.y : o.x) - bandLo) < 14)
    .filter(o => (axis === 'H' ? o.x : o.y) >= from - 1 && (axis === 'H' ? o.x : o.y) + o.len <= to + 1)
    .sort((a, b) => (axis === 'H' ? a.x - b.x : a.y - b.y));

  const seg = (a, b, z0, z1, m) => {
    if (b - a < 1 || z1 - z0 < 1) return;
    group.add(axis === 'H'
      ? mbox(a, b, bandLo, bandHi, z0, z1, m)
      : mbox(bandLo, bandHi, a, b, z0, z1, m));
  };

  let cursor = from;
  for (const o of hits) {
    const s = axis === 'H' ? o.x : o.y;
    seg(cursor, s, zBot, zTop, mat);                         // pier between openings
    const sill = ffe + o.sill, head = ffe + o.head;
    seg(s, s + o.len, zBot, Math.max(zBot, sill), mat);      // below the opening
    seg(s, s + o.len, Math.min(zTop, head), zTop, mat);      // above it
    if (head > sill && glass) {
      const gm = axis === 'H'
        ? mbox(s, s + o.len, bandLo + 3, bandHi - 3, sill, head, glass, { cast: false })
        : mbox(bandLo + 3, bandHi - 3, s, s + o.len, sill, head, glass, { cast: false });
      group.add(gm);
    }
    cursor = s + o.len;
  }
  seg(cursor, to, zBot, zTop, mat);
}

// ── THE BUILDING ────────────────────────────────────────────────────────────
function buildHouse(M) {
  const g = new THREE.Group();
  const RA = ROOFS[0], RB = ROOFS[1], RL = ROOFS[2], RG = ROOFS[3];
  const capA = { s: RA.topAtY0 - ROOF_ASSEMBLY, n: RA.topAtY1 - ROOF_ASSEMBLY };
  const capB = { s: RB.topAtY0 - ROOF_ASSEMBLY, n: RB.topAtY1 - ROOF_ASSEMBLY };
  const fp0 = FOOTPRINTS.L0, fp1 = FOOTPRINTS.L1;
  const T = BAR.extWall;

  // ---- LOWER LEVEL: concrete below, walkout glazing downhill -------------
  g.add(mbox(fp0.x0, fp0.x1, 302, 312, STRUCTURE.spine.zBot, L1.ffe, M.concrete));   // spine wall
  g.add(mbox(fp0.x0, fp0.x0 + T, 0, 312, -30, L1.ffe, M.concrete));
  g.add(mbox(fp0.x1 - T, fp0.x1, 0, 312, -30, L1.ffe, M.concrete));
  wallRun({
    axis: 'H', bandLo: 0, bandHi: T, from: fp0.x0, to: fp0.x1,
    zBot: L0.ffe, zTop: L1.ffe - L0.floorAssembly, ffe: L0.ffe,
    mat: M.concrete, glass: M.glass, group: g, openings: OPENINGS.filter(o => o.level === 'L0'),
  });
  g.add(mbox(fp0.x0, fp0.x1, 0, 312, -6, 0, M.concrete, { cast: false }));           // slab

  // continue the spine wall east under the crawl
  g.add(mbox(fp0.x1, fp1.x1, 302, 312, STRUCTURE.spine.zBot, L1.ffe, M.concrete));
  g.add(mbox(fp0.x1, fp1.x1, 0, 312, L1.ffe - 40, L1.ffe - L1.floorAssembly, M.concrete));
  g.add(mbox(fp1.x1 - T, fp1.x1, 0, 312, L1.ffe - 40, L1.ffe, M.concrete));

  // ---- MAIN LEVEL --------------------------------------------------------
  const mainOps = OPENINGS.filter(o => o.level === 'L1');
  // downhill wall, split at the roof step (grid E)
  wallRun({ axis: 'H', bandLo: 0, bandHi: T, from: fp1.x0, to: ft(48),
    zBot: L1.ffe, zTop: capA.s, ffe: L1.ffe, mat: M.siding, glass: M.glass, group: g, openings: mainOps });
  wallRun({ axis: 'H', bandLo: 0, bandHi: T, from: ft(48), to: fp1.x1,
    zBot: L1.ffe, zTop: capB.s, ffe: L1.ffe, mat: M.siding, glass: M.glass, group: g, openings: mainOps });
  // uphill wall — nearly solid, the cold side
  wallRun({ axis: 'H', bandLo: 302, bandHi: 312, from: fp1.x0, to: ft(48),
    zBot: L1.ffe, zTop: capA.n, ffe: L1.ffe, mat: M.siding, glass: M.glass, group: g, openings: mainOps });
  wallRun({ axis: 'H', bandLo: 302, bandHi: 312, from: ft(48), to: fp1.x1,
    zBot: L1.ffe, zTop: capB.n, ffe: L1.ffe, mat: M.siding, glass: M.glass, group: g, openings: mainOps });

  // raking end walls follow the shed
  g.add(prismYZ([[0, L1.ffe], [312, L1.ffe], [312, capA.n], [0, capA.s]], fp1.x0, fp1.x0 + T, M.siding));
  g.add(prismYZ([[0, L0.ffe], [312, L0.ffe], [312, capB.n], [0, capB.s]], fp1.x1 - T, fp1.x1, M.siding));
  // the roof step: solid cheek above Roof A, glazed clerestory over the great room
  g.add(prismYZ([[0, capA.s], [312, capA.n], [312, capB.n], [0, capB.s]], ft(48) - 8, ft(48), M.siding));
  g.add(mbox(ft(48) - 5, ft(48) - 1, CLERESTORY.y0, CLERESTORY.y1,
    CLERESTORY.zBotAtY0, CLERESTORY.zTopAtY0 + 30, M.glass, { cast: false }));

  // floor plates
  g.add(mbox(fp1.x0, fp1.x1, 0, 312, L1.ffe - L1.floorAssembly, L1.ffe, M.deck, { cast: false }));
  g.add(mbox(ft(48), fp1.x1, 0, 312, L2.ffe - L2.floorAssembly, L2.ffe, M.deck, { cast: false }));

  // ---- ROOFS -------------------------------------------------------------
  for (const R of [RA, RB]) {
    const oS = R.overhang.south, oN = R.overhang.north;
    const zS = R.topAtY0 - (R.pitch / 12) * oS, zN = R.topAtY1 + (R.pitch / 12) * oN;
    g.add(prismYZ(
      [[-oS, zS - ROOF_ASSEMBLY], [312 + oN, zN - ROOF_ASSEMBLY], [312 + oN, zN], [-oS, zS]],
      R.x0 - R.overhang.west, R.x1 + R.overhang.east, M.roof));
  }

  // ---- MASONRY MASS — wood stove flue + thermal battery ------------------
  g.add(mbox(ft(23) - 26, ft(23) + 26, 30, 132, -30, RA.topAtY0 + 96, M.stone));

  // ---- LINK (mudroom airlock) --------------------------------------------
  const lk = LINK;
  g.add(mbox(lk.x0, lk.x1, lk.y0, lk.y1, L1.ffe - 40, L1.ffe, M.concrete, { cast: false }));
  for (const [a, b, c, d] of [[lk.x0, lk.x1, lk.y0, lk.y0 + 10], [lk.x0, lk.x1, lk.y1 - 10, lk.y1],
                              [lk.x0, lk.x0 + 10, lk.y0, lk.y1], [lk.x1 - 10, lk.x1, lk.y0, lk.y1]]) {
    g.add(mbox(a, b, c, d, L1.ffe, RL.topAtY0 - 14, M.siding));
  }
  g.add(prismYZ([[lk.y0 - RL.overhang.south, RL.topAtY0 - 14], [lk.y1 + RL.overhang.north, RL.topAtY1 - 14],
                 [lk.y1 + RL.overhang.north, RL.topAtY1], [lk.y0 - RL.overhang.south, RL.topAtY0]],
                 lk.x0 - 10, lk.x1 + 10, M.roof));

  // covered breezeway: you get out of the car under cover
  {
    const b = GARAGE.breezeway;
    g.add(mbox(b.x0, b.x1, 100, 240, L1.ffe - 40, L1.ffe - 34, M.paver, { cast: false }));
    g.add(mbox(b.x0, b.x1, 96, 244, L1.ffe + 118, L1.ffe + 128, M.roof));
    for (const bx of [b.x0 + 6, b.x1 - 12]) {
      for (const by of [100, 232]) g.add(mbox(bx, bx + 6, by, by + 6, L1.ffe - 34, L1.ffe + 118, M.steel));
    }
  }

  // ---- GARAGE (detached) --------------------------------------------------
  const ga = GARAGE;
  g.add(mbox(ga.x0, ga.x1, ga.y0, ga.y1, ga.ffe - 40, ga.ffe, M.concrete, { cast: false }));
  wallRun({ axis: 'H', bandLo: ga.y0, bandHi: ga.y0 + 10, from: ga.x0, to: ga.x1,
    zBot: ga.ffe, zTop: RG.topAtY0 - 14, ffe: ga.ffe, mat: M.siding, glass: M.garageDoor,
    group: g, openings: GARAGE_OPENINGS.map(o => ({ ...o, y: ga.y0 })) });
  g.add(mbox(ga.x0, ga.x1, ga.y1 - 10, ga.y1, ga.ffe, RG.topAtY1 - 14, M.siding));
  g.add(prismYZ([[ga.y0, ga.ffe], [ga.y1, ga.ffe], [ga.y1, RG.topAtY1 - 14], [ga.y0, RG.topAtY0 - 14]],
    ga.x0, ga.x0 + 10, M.siding));
  g.add(prismYZ([[ga.y0, ga.ffe], [ga.y1, ga.ffe], [ga.y1, RG.topAtY1 - 14], [ga.y0, RG.topAtY0 - 14]],
    ga.x1 - 10, ga.x1, M.siding));
  g.add(prismYZ([[ga.y0 - RG.overhang.south, RG.topAtY0 - 14], [ga.y1 + RG.overhang.north, RG.topAtY1 - 14],
                 [ga.y1 + RG.overhang.north, RG.topAtY1], [ga.y0 - RG.overhang.south, RG.topAtY0]],
                 ga.x0 - 24, ga.x1 + 24, M.roof));

  // ---- EAVE DETAIL: fascia, gutter, downspouts --------------------------
  // At the scale you actually look at a house, the eave IS the building.
  for (const R of [RA, RB]) {
    const oS = R.overhang.south, oN = R.overhang.north;
    const zS = R.topAtY0 - (R.pitch / 12) * oS;
    const x0 = R.x0 - R.overhang.west, x1 = R.x1 + R.overhang.east;
    g.add(mbox(x0, x1, -oS - 4, -oS, zS - 12, zS, M.fascia));                    // fascia
    g.add(mbox(x0, x1, -oS - 9, -oS - 3, zS - 17, zS - 11, M.gutter));           // gutter
    g.add(mbox(x0, x1, 312 + oN, 312 + oN + 3, R.topAtY1 + (R.pitch/12)*oN - 11,
      R.topAtY1 + (R.pitch/12)*oN, M.fascia));
  }
  for (const dx of [ft(2), ft(46), ft(70)]) {                                     // downspouts
    g.add(mbox(dx, dx + 4, -52, -48, L1.ffe - 40, RA.topAtY0 - 14, M.gutter));
  }
  // exposed rib ends at the downhill column line
  for (const gx of GRID.x) {
    g.add(mbox(gx.v - 3, gx.v + 3, -46, 2, L1.ffe - 26, L1.ffe - 13, M.timber));
  }

  // ---- DECKS, TERRACE, GUARDS --------------------------------------------
  const d1 = DECKS[0], d2 = DECKS[1];
  g.add(mbox(d1.x0, d1.x1, d1.y0, d1.y1, d1.top - 16, d1.top - 6, M.timber, { cast: false }));   // framing
  for (let y = d1.y0 + 2; y < d1.y1 - 2; y += 6) {                                              // individual boards
    g.add(mbox(d1.x0, d1.x1, y, y + 5.1, d1.top - 6, d1.top, M.deck, { cast: false }));
  }
  for (let x = d1.x0 + 48; x < d1.x1; x += 96) g.add(mbox(x - 3, x + 3, d1.y0 + 6, d1.y0 + 12, d2.top, d1.top - 16, M.steel));
  // guard: posts, top rail, horizontal cable infill
  for (let x = d1.x0; x <= d1.x1; x += 60) g.add(mbox(x - 2, x + 2, d1.y0 + 1, d1.y0 + 4, d1.top, d1.top + 42, M.steel));
  g.add(mbox(d1.x0, d1.x1, d1.y0, d1.y0 + 5, d1.top + 40, d1.top + 43, M.steel, { cast: false }));
  for (let z = 4; z < 40; z += 4.2) {
    g.add(mbox(d1.x0, d1.x1, d1.y0 + 2, d1.y0 + 2.7, d1.top + z, d1.top + z + 0.7, M.steel, { cast: false }));
  }
  // terrace: real pavers with joints
  for (let x = d2.x0; x < d2.x1; x += 24) {
    for (let y = d2.y0; y < d2.y1; y += 24) {
      g.add(mbox(x + 0.6, x + 23.4, y + 0.6, y + 23.4, d2.top - 6, d2.top, M.paver, { cast: false }));
    }
  }
  g.add(mbox(d2.x0, d2.x1, d2.y0 - 10, d2.y0, -58 * 12 / 12, d2.top, M.stone));                 // terrace wall
  // stone base course under the siding, and a chimney cap
  g.add(mbox(fp1.x0 - 2, fp1.x1 + 2, -2, 314, L1.ffe - 26, L1.ffe - 4, M.stone));
  g.add(mbox(ft(23) - 30, ft(23) + 30, 26, 136, RA.topAtY0 + 96, RA.topAtY0 + 104, M.steel));

  // EXTERIOR STAIR: terrace up to the main deck. Without it the lower terrace
  // is a dead end and you must go back through the house to reach the deck.
  {
    const st = EXT_STAIR;
    const run = st.yTop - st.yBot, rise = st.zTop - st.zBot;
    for (let i = 0; i < st.risers; i++) {
      const y = st.yBot + (run * i) / st.risers;
      const z = st.zBot + (rise * (i + 1)) / st.risers;
      g.add(mbox(st.x, st.x + st.w, y, y + run / st.risers + 1, z - 2, z, M.timber));
      g.add(mbox(st.x, st.x + st.w, y, y + 2, st.zBot, z - 2, M.concrete, { cast: false }));
    }
    for (const sx of [st.x - 3, st.x + st.w]) {
      for (let i = 0; i <= st.risers; i += 4) {
        const y = st.yBot + (run * i) / st.risers;
        const z = st.zBot + (rise * i) / st.risers;
        g.add(mbox(sx, sx + 3, y, y + 3, z, z + 42, M.steel, { cast: false }));
      }
    }
  }

  // entry bridge over the drain gap
  const br = DECKS[2];
  g.add(mbox(br.x0, br.x1, br.y0 - 6, br.y1, br.top - 10, br.top, M.steel));

  return g;
}

/** Thin frames and mullions at every opening — cheap, and the single biggest
 *  step from "massing study" to "building". */
function buildFrames(M) {
  const g = new THREE.Group();
  const FR = 2.5;
  const all = [...OPENINGS.filter(o => o.level !== 'L2' || true)];
  for (const o of all) {
    if (o.type === 'opening' || o.type === 'garage') continue;
    const lvl = LEVELS.find(l => l.id === o.level);
    const sill = lvl.ffe + o.sill, head = lvl.ffe + o.head;
    if (head - sill < 6) continue;
    const H = o.orient === 'H';
    const a0 = H ? o.x : o.y, a1 = a0 + o.len;
    const bLo = (H ? o.y : o.x) + 1, bHi = bLo + o.wallT - 2;
    const put = (p0, p1, z0, z1) => g.add(H
      ? mbox(p0, p1, bLo, bHi, z0, z1, M.frame, { cast: false })
      : mbox(bLo, bHi, p0, p1, z0, z1, M.frame, { cast: false }));
    put(a0, a1, sill, sill + FR);
    put(a0, a1, head - FR, head);
    put(a0, a0 + FR, sill, head);
    put(a1 - FR, a1, sill, head);
    const panes = Math.max(1, Math.round(o.len / 54));
    for (let i = 1; i < panes; i++) {
      const p = a0 + (o.len * i) / panes;
      put(p - FR / 2, p + FR / 2, sill, head);
    }
  }
  return g;
}

/** Interior fit-out: floors, plaster, ceiling boards, and furniture massing.
 *  Without this the interior views read as an open pavilion. */
function buildInterior(M) {
  const g = new THREE.Group();
  const T = BAR.extWall;
  for (const lvlId of ['L0', 'L1', 'L2']) {
    const fp = FOOTPRINTS[lvlId];
    const lvl = LEVELS.find(l => l.id === lvlId);
    // floor
    g.add(mbox(fp.x0 + T, fp.x1 - T, fp.y0 + T, fp.y1 - T, lvl.ffe, lvl.ffe + 1, M.floor, { cast: false }));
    // Interior face of the exterior wall — split by the SAME openings, or it
    // simply walls up the view (which is exactly what the first version did).
    const top = lvl.ffe + lvl.clear;
    const ops = OPENINGS.filter(o => o.level === lvlId);
    const liner = (axis, bandLo, from, to) => wallRun({
      axis, bandLo, bandHi: bandLo + 1.5, from, to,
      zBot: lvl.ffe, zTop: top, ffe: lvl.ffe,
      mat: M.plaster, glass: null, group: g, openings: ops,
    });
    liner('H', T, fp.x0 + T, fp.x1 - T);
    liner('H', fp.y1 - T - 1.5, fp.x0 + T, fp.x1 - T);
    liner('V', T, fp.y0 + T, fp.y1 - T);
    liner('V', fp.x1 - T - 1.5, fp.y0 + T, fp.y1 - T);

    // partitions from the room rectangles, honouring the open edges
    for (const r of (ROOMS[lvlId] ?? [])) {
      if (r.link) continue;
      const open = OPEN_EDGES[r.id] ?? [];
      if (!open.includes('N') && r.y + r.h < fp.y1 - T - 2)
        g.add(mbox(r.x, r.x + r.w, r.y + r.h, r.y + r.h + 4, lvl.ffe, lvl.ffe + lvl.clear, M.plaster));
      if (!open.includes('E') && r.x + r.w < fp.x1 - T - 2)
        g.add(mbox(r.x + r.w, r.x + r.w + 4, r.y, r.y + r.h, lvl.ffe, lvl.ffe + lvl.clear, M.plaster));
    }
  }
  // ceiling boards under the sloping roof of the great room
  const RA = ROOFS[0];
  g.add(prismYZ([[10, RA.topAtY0 - ROOF_ASSEMBLY - 2], [302, RA.topAtY1 - ROOF_ASSEMBLY - 2],
                 [302, RA.topAtY1 - ROOF_ASSEMBLY], [10, RA.topAtY0 - ROOF_ASSEMBLY]],
                 ft(0) + 10, ft(48), M.ceilWood, { cast: false }));

  // ---- FIXTURES, CASEWORK AND FURNITURE ----------------------------------
  // Placed from model/fixtures.mjs — the SAME schedule the plans draw and the
  // clearance checks verify. If a toilet moves in plan it moves here.
  const matFor = (t) => {
    if (['wc', 'lav', 'lav2', 'tub', 'shower36', 'shower42', 'sink'].includes(t)) return M.porcelain;
    if (['base', 'island', 'tall', 'shelf', 'desk', 'table-d', 'table-c', 'nightstand', 'rod'].includes(t)) return M.wood;
    if (['sofa', 'chair', 'bench', 'bedK', 'bedQ'].includes(t)) return M.fabric;
    if (['range', 'fridge', 'dw', 'washer'].includes(t)) return M.appliance;
    if (['stove'].includes(t)) return M.steel;
    if (['rug'].includes(t)) return M.rug;
    return M.equip;
  };
  for (const f of FIXTURES) {
    const lvl = LEVELS.find(l => l.id === f.level);
    if (!lvl) continue;
    const z0 = lvl.ffe + (f.type === 'panel' || f.type === 'rod' ? 30 : 0);
    const h = f.h ?? 34;
    const mat = matFor(f.type);
    const cast = !['rug'].includes(f.type);
    g.add(mbox(f.x, f.x + f.w, f.y, f.y + f.d, z0, z0 + h, mat, { cast }));
    // a few types read badly as a single box
    if (f.type === 'bedK' || f.type === 'bedQ') {
      const head = f.face === 'S' ? f.y + f.d - 4 : f.y;
      g.add(mbox(f.x, f.x + f.w, head, head + 4, lvl.ffe, lvl.ffe + 44, M.wood));       // headboard
      g.add(mbox(f.x + 4, f.x + f.w - 4, f.y + (f.face === 'S' ? f.d - 22 : 4), f.y + (f.face === 'S' ? f.d - 6 : 20),
        lvl.ffe + h, lvl.ffe + h + 5, M.linen));                                        // pillows
    }
    if (f.type === 'sofa') {
      const back = f.face === 'S' ? f.y + f.d - 7 : f.y;
      g.add(mbox(f.x, f.x + f.w, back, back + 7, lvl.ffe, lvl.ffe + 30, M.fabric));
    }
    if (f.type === 'island' || f.type === 'base') {
      g.add(mbox(f.x - 1, f.x + f.w + 1, f.y - 1, f.y + f.d + 1, z0 + h, z0 + h + 1.5, M.stoneTop));
    }
    if (f.type === 'tub') {
      g.add(mbox(f.x + 3, f.x + f.w - 3, f.y + 3, f.y + f.d - 3, z0 + 4, z0 + h, M.porcelain, { cast: false }));
    }
    if (f.type === 'shower36' || f.type === 'shower42') {
      g.add(mbox(f.x, f.x + f.w, f.y, f.y + f.d, z0 + 4, z0 + 78, M.glass, { cast: false }));
    }
  }
  return g;
}


// ── ENTOURAGE: trees, distant ridges, driveway ──────────────────────────────
function buildTrees(count = 240) {
  const r = rng(1234);
  const trunk = new THREE.CylinderGeometry(0.28, 0.42, 7, 5);
  trunk.translate(0, 3.5, 0);
  const foliage = [];
  for (let i = 0; i < 3; i++) {
    const c = new THREE.ConeGeometry(7.5 - i * 1.9, 15 - i * 2.5, 8);
    c.translate(0, 8 + i * 7.5, 0);
    foliage.push(c);
  }
  const mkFoliage = new THREE.InstancedMesh(
    mergeCones(foliage), MAT.simple(0x2c3d2a, 0.95), count);
  const mkTrunk = new THREE.InstancedMesh(trunk, MAT.simple(0x3a2f26, 0.95), count);
  mkFoliage.castShadow = mkTrunk.castShadow = true;
  mkFoliage.receiveShadow = true;

  const dummy = new THREE.Object3D();
  const col = new THREE.Color();
  let n = 0, guard = 0;
  while (n < count && guard++ < count * 60) {
    const X = (r() * 700 - 220) * 12;
    const Y = (r() * 620 - 400) * 12;
    // keep clear of the house, motor court, drive and the downhill view cone
    if (X > ft(-40) && X < ft(130) && Y > ft(-32) && Y < ft(64)) continue;
    if (Y > ft(-140) && Y < ft(6) && X > ft(-10) && X < ft(90)) continue;
    const z = siteZ(X, Y);
    if (Math.abs(z - SITE_SLOPE.grade(X, Y)) > 8) continue;      // not on disturbed ground
    const s = 0.55 + r() * 1.15;
    dummy.position.set(F(X), F(z) - 0.6, -F(Y));
    dummy.rotation.y = r() * 7;
    dummy.scale.set(s * (0.8 + r() * 0.4), s, s * (0.8 + r() * 0.4));
    dummy.updateMatrix();
    mkFoliage.setMatrixAt(n, dummy.matrix);
    mkTrunk.setMatrixAt(n, dummy.matrix);
    const t = r();
    col.setHSL(0.26 - t * 0.06, 0.20 + t * 0.16, 0.11 + t * 0.10);
    mkFoliage.setColorAt(n, col);
    n++;
  }
  mkFoliage.count = mkTrunk.count = n;
  mkFoliage.instanceMatrix.needsUpdate = mkTrunk.instanceMatrix.needsUpdate = true;
  if (mkFoliage.instanceColor) mkFoliage.instanceColor.needsUpdate = true;
  const g = new THREE.Group(); g.add(mkFoliage, mkTrunk);
  return g;
}

function mergeCones(list) {
  const total = list.reduce((a, g) => a + g.attributes.position.count, 0);
  const pos = new Float32Array(total * 3), nor = new Float32Array(total * 3);
  const idx = []; let off = 0;
  for (const g of list) {
    const p = g.attributes.position, nn = g.attributes.normal;
    for (let i = 0; i < p.count; i++) {
      pos[(off + i) * 3] = p.getX(i); pos[(off + i) * 3 + 1] = p.getY(i); pos[(off + i) * 3 + 2] = p.getZ(i);
      nor[(off + i) * 3] = nn.getX(i); nor[(off + i) * 3 + 1] = nn.getY(i); nor[(off + i) * 3 + 2] = nn.getZ(i);
    }
    const gi = g.index;
    for (let i = 0; i < gi.count; i++) idx.push(gi.getX(i) + off);
    off += p.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setIndex(idx);
  return out;
}

/** Layered Blue Ridge silhouettes — atmospheric depth is what sells a mountain view. */
function buildRidges() {
  const g = new THREE.Group();
  // Layered Blue Ridge silhouettes. Low amplitude and many segments: real
  // ridgelines are long and soft, not a row of triangles.
  const layers = [
    { z: 1100, h: 120, base: -210, c: 0x7d90a6, seed: 3,  o: 0.95 },
    { z: 1900, h: 175, base: -250, c: 0x91a3b6, seed: 9,  o: 0.85 },
    { z: 2900, h: 250, base: -300, c: 0xa6b5c5, seed: 21, o: 0.72 },
  ];
  for (const L of layers) {
    const r = rng(L.seed);
    const W = 5200, N = 220;
    const pts = [];
    let h = 0.5;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      h = h * 0.86 + r() * 0.14;                                  // correlated walk
      const swell = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 4.1 + L.seed));
      pts.push(new THREE.Vector2(-W / 2 + t * W, L.base + L.h * (0.55 + h * 1.4) * swell));
    }
    const shape = new THREE.Shape(pts);
    shape.lineTo(W / 2, L.base - 700); shape.lineTo(-W / 2, L.base - 700); shape.closePath();
    const m = new THREE.Mesh(new THREE.ShapeGeometry(shape),
      new THREE.MeshBasicMaterial({ color: L.c, fog: true, transparent: true, opacity: L.o }));
    m.position.set(F(ft(36)), 0, L.z);
    m.rotation.y = Math.PI;
    g.add(m);
  }
  return g;
}

function buildDrive(M) {
  const g = new THREE.Group();
  const r = rng(77);
  // motor court apron
  g.add(mbox(ft(-14), ft(122), GAP_OUT, COURT_BACK, COURT_Z - 6, COURT_Z, M.gravel, { cast: false }));
  // drive running off to the east, following the bench then falling away
  let X = ft(122);
  for (let i = 0; i < 22; i++) {
    const x1 = X + ft(16);
    const z = COURT_Z + i * 9;
    g.add(mbox(X, x1, GAP_OUT + ft(2) + i * 14, GAP_OUT + ft(16) + i * 14, z - 6, z, M.gravel, { cast: false }));
    X = x1;
  }
  return g;
}

// ── SKY + ENVIRONMENT ───────────────────────────────────────────────────────
function buildSky(renderer, scene, sunDir, turbidity = 3.2) {
  const sky = new Sky();
  sky.scale.setScalar(45000);
  const u = sky.material.uniforms;
  u.turbidity.value = turbidity;
  u.rayleigh.value = 1.4;
  u.mieCoefficient.value = 0.006;
  u.mieDirectionalG.value = 0.82;
  u.sunPosition.value.copy(sunDir).multiplyScalar(10000);
  scene.add(sky);

  // Procedural cumulus so the sky is not a bare gradient.
  {
    const S = 512;
    const c = document.createElement('canvas'); c.width = c.height = S;
    const x = c.getContext('2d');
    const img = x.createImageData(S, S);
    const rnd = (() => { let s0 = 8712; return () => (s0 = (s0 * 1664525 + 1013904223) >>> 0) / 4294967296; })();
    const grids = [];
    for (let o = 0; o < 5; o++) {
      const n = 4 << o, g2 = new Float32Array(n * n);
      for (let i = 0; i < n * n; i++) g2[i] = rnd();
      grids.push({ n, g: g2 });
    }
    const smp = ({ n, g }, u, v) => {
      const fx = u * n, fy = v * n;
      const i0 = Math.floor(fx) % n, j0 = Math.floor(fy) % n;
      const i1 = (i0 + 1) % n, j1 = (j0 + 1) % n;
      const tx = fx - Math.floor(fx), ty = fy - Math.floor(fy);
      const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
      return (g[j0 * n + i0] * (1 - sx) + g[j0 * n + i1] * sx) * (1 - sy)
           + (g[j1 * n + i0] * (1 - sx) + g[j1 * n + i1] * sx) * sy;
    };
    for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
      let v = 0, amp = 1, tot = 0;
      for (const gr of grids) { v += smp(gr, i / S, j / S) * amp; tot += amp; amp *= 0.55; }
      v /= tot;
      const a = Math.max(0, Math.min(1, (v - 0.50) / 0.26));
      const k = (j * S + i) * 4;
      img.data[k] = 255; img.data[k + 1] = 253; img.data[k + 2] = 249;
      img.data[k + 3] = a * a * 235;
    }
    x.putImageData(img, 0, 0);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); t.colorSpace = THREE.SRGBColorSpace;
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(26000, 26000),
      new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, fog: false, opacity: 0.85 }));
    plane.rotation.x = Math.PI / 2;
    plane.position.y = 2600;
    plane.renderOrder = -1;
    scene.add(plane);
  }

  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const env = pmrem.fromScene(new THREE.Scene().add(sky.clone()), 0.04);
  scene.environment = env.texture;
  pmrem.dispose();
  return sky;
}

// ── PUBLIC ──────────────────────────────────────────────────────────────────
export function buildScene(renderer, { sun, exposureBoost = 1, interior = false, realtime = false } = {}) {
  const scene = new THREE.Scene();

  const M = {
    siding: MAT.sidingMaterial(),
    roof: MAT.roofMaterial(),
    stone: MAT.stoneMaterial(),
    concrete: MAT.concreteMaterial(),
    gravel: MAT.gravelMaterial(),
    glass: MAT.glassMaterial({ opacity: interior ? 0.05 : 0.17 }),
    garageDoor: MAT.simple(0x2a2e33, 0.6),
    deck: MAT.simple(0x2f2823, 0.88),
    steel: MAT.simple(0x14171a, 0.55, 0.35),
    fascia: MAT.simple(0x121519, 0.72, 0),
    gutter: MAT.simple(0x101317, 0.6, 0.1),
    timber: MAT.simple(0x6b5236, 0.8),
    paver: MAT.simple(0x6e6a63, 0.9),
    frame: MAT.simple(0x191c20, 0.45, 0.25),
    floor: MAT.floorMaterial(),
    plaster: MAT.plasterMaterial(),
    ceilWood: MAT.ceilingWoodMaterial(),
    fabric: MAT.simple(0x3f3d3a, 0.97),
    linen: MAT.simple(0x8d8779, 0.95),
    wood: MAT.simple(0x4a3626, 0.74),
    stoneTop: MAT.simple(0x54504a, 0.4),
    porcelain: MAT.simple(0xc9c7c2, 0.22),
    appliance: MAT.simple(0x8f959b, 0.32, 0.7),
    equip: MAT.simple(0x6a7076, 0.6, 0.3),
    rug: MAT.simple(0x494c43, 0.98),
  };

  _M = M;
  buildSky(renderer, scene, sun.dir);
  scene.fog = new THREE.FogExp2(0xaec1d4, 0.00030);

  scene.add(buildTerrain(realtime));
  scene.add(buildHouse(M));
  scene.add(buildInterior(M));
  scene.add(buildFrames(M));
  scene.add(buildDrive(M));
  scene.add(buildVegetation({
    heightAt: siteZ,
    naturalAt: (X, Y) => SITE_SLOPE.grade(X, Y),
    keepOut: (X, Y) =>
      (X > ft(-46) && X < ft(136) && Y > ft(-40) && Y < ft(72)) ||     // house, court, drive
      (Y > ft(-150) && Y < ft(10) && X > ft(-16) && X < ft(96)),       // the view cone
    F, ft,
    counts: realtime ? { conifer: 110, hardwood: 90, shrub: 200, grass: 400 } : {},
  }));
  scene.add(buildRidges());

  // ── LIGHT RIG ─────────────────────────────────────────────────────────────
  const focus = new THREE.Vector3(F(ft(36)), F(ft(14)), -F(ft(13)));

  const sunLight = new THREE.DirectionalLight(0xffeed6, 3.4 * exposureBoost);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(realtime ? 2048 : 1536, realtime ? 2048 : 1536);
  // Tight shadow frustum: at 2048 over 240ft a texel is ~0.12ft, so the bias
  // needed to kill acne is small enough to keep contact shadows alive.
  const S = 120;
  Object.assign(sunLight.shadow.camera, { left: -S, right: S, top: S, bottom: -S, near: 1, far: 2000 });
  sunLight.shadow.bias = -0.00018;
  sunLight.shadow.normalBias = 0.09;
  sunLight.shadow.camera.updateProjectionMatrix();
  scene.add(sunLight, sunLight.target);

  // one stochastic sky sample per pass -> soft skylight + contact shadows
  const skyLight = new THREE.DirectionalLight(0xa8c4e4, 0.85 * exposureBoost);
  skyLight.castShadow = true;
  skyLight.shadow.mapSize.set(768, 768);
  Object.assign(skyLight.shadow.camera, { left: -S, right: S, top: S, bottom: -S, near: 1, far: 2000 });
  skyLight.shadow.bias = -0.0004;
  skyLight.shadow.normalBias = 0.16;
  skyLight.shadow.camera.updateProjectionMatrix();
  scene.add(skyLight, skyLight.target);

  // bounce off the ground, never zero so shadows keep colour
  scene.add(new THREE.HemisphereLight(0x9fb6cf, 0x51492f, 0.13 * exposureBoost));

  return {
    scene, materials: M,
    rig: {
      sun: sunLight, skyLight, focus,
      sunDir: sun.dir.clone(), sunSpread: 0.035, sunDistance: 900, skyDistance: 700,
    },
  };
}
