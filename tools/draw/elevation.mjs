// HENRY HOUSE — ORTHOGRAPHIC ELEVATIONS.
//
// The package had plans, a section, systems sheets and a 3D model, and not one
// elevation. Four faces, none drawn. This generates all four from the same
// model, so an elevation cannot disagree with a plan about where a window is.
//
// HOW A FACE IS BUILT
//   Every face is a projection (u, z). u is the horizontal axis of the drawing,
//   z is height above datum. Which model axis becomes u — and which way it runs
//   — follows from standing outside the building and looking at it:
//
//     SOUTH  looking +Y (uphill)     u = +x     east on the right
//     NORTH  looking -Y (downhill)   u = -x     east on the left
//     EAST   looking -X (west)       u = +y     uphill on the right
//     WEST   looking +X (east)       u = -y     uphill on the left
//
//   Masses are drawn far-to-near so nearer volumes overlap farther ones, and
//   the grade line beyond the building is dashed — the standard way to show a
//   building on a slope without pretending the site is flat.

import { LW, INK } from '../svg.mjs';
import { dim, ft, el } from '../../model/units.mjs';
import G, {
  LEVELS, FOOTPRINTS, BAR, GRID, LINK, GARAGE, DECKS, ROOFS, ROOF_ASSEMBLY,
  CLERESTORY, SNOW, EXT_STAIR, ORIENTATION,
} from '../../model/geometry.mjs';
import { OPENINGS, GARAGE_OPENINGS } from '../../model/openings.mjs';
import { natural, finished } from '../../model/site.mjs';

const roofById = (id) => ROOFS.find(r => r.id === id);
const lvl = (id) => LEVELS.find(l => l.id === id);

// ── FACES ───────────────────────────────────────────────────────────────────
export const FACES = {
  S: {
    id: 'S', name: 'SOUTH ELEVATION', axis: 'X', sign: 1,
    sub: 'THE DOWNHILL FACE · VIEW, WINTER SUN, ALL THE GLASS',
    faceY: 0, farY: ft(26), inward: 1,
    azimuth: ORIENTATION.viewFaceAzimuth,
  },
  N: {
    id: 'N', name: 'NORTH ELEVATION', axis: 'X', sign: -1,
    sub: 'THE UPHILL FACE · THE CUT, THE ARRIVAL, ALMOST NO GLASS',
    faceY: ft(26), farY: 0, inward: -1,
    azimuth: ORIENTATION.uphillFaceAzimuth,
  },
  E: {
    id: 'E', name: 'EAST ELEVATION', axis: 'Y', sign: 1,
    sub: 'THE ARRIVAL END · GARAGE, BREEZEWAY, THE HIGH GROUND',
    faceX: GARAGE.x1, farX: 0, inward: -1,
    azimuth: ORIENTATION.longAxisAzimuth,
  },
  W: {
    id: 'W', name: 'WEST ELEVATION', axis: 'Y', sign: -1,
    sub: 'THE LOW END · THE PRIMARY SUITE, THE TERRACE, THE FALL OF THE LAND',
    faceX: 0, farX: GARAGE.x1, inward: 1,
    azimuth: (ORIENTATION.longAxisAzimuth + 180) % 360,
  },
};

/** Model position -> drawing horizontal coordinate for this face. */
function U(F, x, y) {
  return F.axis === 'X' ? F.sign * x : F.sign * y;
}

// ── ROOF PROFILE ALONG A FACE ───────────────────────────────────────────────
/** Top of roof (structure, not covering) at a point, including overhangs. */
function roofEdgeZ(r, y) {
  const t = (r.topAtY1 - r.topAtY0) / (r.y1 - r.y0);
  return r.topAtY0 + t * (y - r.y0);
}

/**
 * The silhouette of one roof plane as seen on this face, as [uStart, uEnd, zFn].
 * For an X-axis face the roof reads as a horizontal line at the near eave.
 * For a Y-axis face it reads as the actual 3:12 rake.
 */
function roofSilhouette(F, r) {
  const oS = r.overhang.south, oN = r.overhang.north;
  if (F.axis === 'X') {
    const y = F.id === 'S' ? r.y0 - oS : r.y1 + oN;
    const z = roofEdgeZ(r, y);
    const u0 = U(F, r.x0 - r.overhang.west, 0), u1 = U(F, r.x1 + r.overhang.east, 0);
    return { u0: Math.min(u0, u1), u1: Math.max(u0, u1), z0: z, z1: z, rake: false };
  }
  const yS = r.y0 - oS, yN = r.y1 + oN;
  return {
    u0: Math.min(U(F, 0, yS), U(F, 0, yN)), u1: Math.max(U(F, 0, yS), U(F, 0, yN)),
    z0: roofEdgeZ(r, F.sign > 0 ? yS : yN), z1: roofEdgeZ(r, F.sign > 0 ? yN : yS),
    rake: true,
  };
}

// ── MASSES ──────────────────────────────────────────────────────────────────
/**
 * Each mass is a rectangle in (u, z) plus a depth used for painter ordering.
 * Depth is distance from the viewer to the mass's NEAR face: bigger = further.
 */
function masses(F) {
  const out = [];
  const push = (uA, uB, zBot, zTop, depth, opts = {}) =>
    out.push({ u0: Math.min(uA, uB), u1: Math.max(uA, uB), zBot, zTop, depth, ...opts });

  const [L0, L1, L2] = LEVELS;
  const RA = roofById('RA'), RB = roofById('RB'), RL = roofById('RL'), RG = roofById('RG');

  if (F.axis === 'X') {
    const near = (y0, y1) => (F.id === 'S' ? y0 : -y1);
    // the bar, split where the roof steps
    const stepX = CLERESTORY.x;
    const sA = roofSilhouette(F, RA), sB = roofSilhouette(F, RB);
    push(U(F, BAR.x0, 0), U(F, stepX, 0), -ft(4), sA.z0 - ROOF_ASSEMBLY, near(0, ft(26)), { kind: 'bar' });
    push(U(F, stepX, 0), U(F, BAR.x1, 0), -ft(4), sB.z0 - ROOF_ASSEMBLY, near(0, ft(26)), { kind: 'bar' });
    // link and garage sit back from the downhill face and forward of the uphill one
    push(U(F, LINK.x0, 0), U(F, LINK.x1, 0), L1.ffe - ft(9), roofEdgeZ(RL, F.id === 'S' ? RL.y0 : RL.y1) - ROOF_ASSEMBLY,
      near(LINK.y0, LINK.y1), { kind: 'link' });
    push(U(F, GARAGE.x0, 0), U(F, GARAGE.x1, 0), GARAGE.ffe - ft(4), roofEdgeZ(RG, F.id === 'S' ? RG.y0 : RG.y1) - ROOF_ASSEMBLY,
      near(GARAGE.y0, GARAGE.y1), { kind: 'garage' });
    return out;
  }

  // Y-axis faces: the section-like profile of the bar, plus whatever is beyond
  const isEast = F.id === 'E';
  const r = isEast ? RB : RA;
  const sil = roofSilhouette(F, r);
  push(U(F, 0, 0), U(F, 0, ft(26)), -ft(4), Math.max(sil.z0, sil.z1) - ROOF_ASSEMBLY, 0, { kind: 'barProfile', roof: r });
  if (isEast) {
    push(U(F, 0, GARAGE.y0), U(F, 0, GARAGE.y1), GARAGE.ffe - ft(4),
      roofEdgeZ(RG, GARAGE.y0 - RG.overhang.south) - ROOF_ASSEMBLY, -ft(60), { kind: 'garageEnd' });
  }
  return out;
}

// ── GRADE ───────────────────────────────────────────────────────────────────
function gradeLine(F, surface, atNear, uMin, uMax) {
  const pts = [];
  if (F.axis === 'X') {
    const y = atNear ? F.faceY + (F.inward * -8) : F.farY + (F.inward * 8);
    for (let x = ft(-16); x <= ft(128); x += 12) pts.push([U(F, x, 0), surface(x, y)]);
  } else {
    const x = atNear ? F.faceX + (F.inward * 8) : F.farX - (F.inward * 8);
    for (let y = ft(-10); y <= ft(38); y += 6) pts.push([U(F, 0, y), surface(x, y)]);
  }
  const out = pts.sort((a, b) => a[0] - b[0]);
  // A grade line that runs past the edges of the elevation is not a site
  // section; it is the terrain function escaping onto the sheet.
  return uMin == null ? out : out.filter(p => p[0] >= uMin - 1 && p[0] <= uMax + 1);
}

// ── OPENINGS ON THIS FACE ───────────────────────────────────────────────────
function openingsOn(F) {
  const all = [...OPENINGS, ...GARAGE_OPENINGS];
  const out = [];
  for (const o of all) {
    const base = o.type === 'garage' ? GARAGE.ffe : lvl(o.level).ffe;
    if (F.axis === 'X') {
      if (o.orient !== 'H') continue;                       // only walls running along X
      const onFace = F.id === 'S' ? o.y <= 12 : o.y >= ft(26) - 12 || (o.y >= GARAGE.y1 - 12);
      if (!onFace) continue;
      out.push({ o, u0: U(F, o.x, 0), u1: U(F, o.x + o.len, 0), z0: base + o.sill, z1: base + o.head });
    } else {
      if (o.orient !== 'V') continue;                       // only walls running along Y
      const faceX = F.faceX;
      if (Math.abs(o.x - faceX) > 14) continue;
      out.push({ o, u0: U(F, 0, o.y), u1: U(F, 0, o.y + o.len), z0: base + o.sill, z1: base + o.head });
    }
  }
  return out;
}

// ── THE DRAWING ─────────────────────────────────────────────────────────────
export function drawElevation(s, faceId, { annotate = true, alignLeft = null } = {}) {
  const F = FACES[faceId];
  const [L0, L1, L2] = LEVELS;
  const ms = masses(F).sort((a, b) => b.depth - a.depth);

  const uMin = Math.min(...ms.map(m => m.u0)) - ft(6);
  const uMax = Math.max(...ms.map(m => m.u1)) + ft(6);
  // Each face runs on its own axis and sign, so the drawing's left edge is not
  // model zero. Park uMin at a fixed paper position instead of hand-tuning an
  // origin per sheet and discovering the north elevation is off the page.
  if (alignLeft != null) s.ox = alignLeft - uMin * s.scale;

  // ── EARTH ────────────────────────────────────────────────────────────────
  const far = gradeLine(F, finished, false, uMin, uMax);
  const nearG = gradeLine(F, finished, true, uMin, uMax);
  const nat = gradeLine(F, natural, true, uMin, uMax);
  const deep = -ft(10);
  s.poly(nat, { fill: 'none', color: INK.ground, w: LW.light, dash: '22 10', close: false });
  s.poly(far, { fill: 'none', color: INK.ground, w: LW.hair, dash: '12 8', close: false });

  // ── MASSES ───────────────────────────────────────────────────────────────
  for (const m of ms) {
    if (m.kind === 'barProfile') {
      const r = m.roof;
      const yS = r.y0 - r.overhang.south, yN = r.y1 + r.overhang.north;
      const uS = U(F, 0, yS), uN = U(F, 0, yN);
      s.poly([[U(F, 0, 0), m.zBot], [U(F, 0, ft(26)), m.zBot],
              [U(F, 0, ft(26)), roofEdgeZ(r, r.y1) - ROOF_ASSEMBLY],
              [U(F, 0, 0), roofEdgeZ(r, r.y0) - ROOF_ASSEMBLY]],
        { fill: INK.paper, color: F.id === 'E' ? INK.mid : INK.line,
          w: F.id === 'E' ? LW.light : LW.cut, dash: F.id === 'E' ? '18 10' : null });
      if (F.id === 'E') {
        s.text(U(F, 0, ft(13)), roofEdgeZ(r, ft(13)) + 40, 'HOUSE BEYOND',
          { size: 13, anchor: 'middle', color: INK.mid, spacing: 1.2 });
      }
      // the rake, with its overhangs — the shape you actually see from the end
      s.poly([[uS, roofEdgeZ(r, yS)], [uN, roofEdgeZ(r, yN)],
              [uN, roofEdgeZ(r, yN) - ROOF_ASSEMBLY], [uS, roofEdgeZ(r, yS) - ROOF_ASSEMBLY]],
        { fill: INK.poche, color: INK.line, w: LW.cut });
      continue;
    }
    if (m.kind === 'garageEnd') {
      // Seen from the east the garage shows its RAKE, so the end wall is a
      // trapezoid. Drawn as a rectangle it left an 11 ft gap of daylight
      // between the top of the wall and the underside of the roof.
      const RG = roofById('RG');
      const yS = RG.y0 - RG.overhang.south, yN = RG.y1 + RG.overhang.north;
      s.poly([[U(F, 0, GARAGE.y0), m.zBot], [U(F, 0, GARAGE.y1), m.zBot],
              [U(F, 0, GARAGE.y1), roofEdgeZ(RG, GARAGE.y1) - ROOF_ASSEMBLY],
              [U(F, 0, GARAGE.y0), roofEdgeZ(RG, GARAGE.y0) - ROOF_ASSEMBLY]],
        { fill: INK.paper, color: INK.line, w: LW.cut });
      s.poly([[U(F, 0, yS), roofEdgeZ(RG, yS)], [U(F, 0, yN), roofEdgeZ(RG, yN)],
              [U(F, 0, yN), roofEdgeZ(RG, yN) - ROOF_ASSEMBLY], [U(F, 0, yS), roofEdgeZ(RG, yS) - ROOF_ASSEMBLY]],
        { fill: INK.poche, color: INK.line, w: LW.cut });
      continue;
    }
    s.rect(m.u0, m.zBot, m.u1 - m.u0, m.zTop - m.zBot,
      { fill: INK.paper, color: INK.line, w: m.kind === 'bar' ? LW.cut : LW.medium });
  }

  // ── ROOFS ────────────────────────────────────────────────────────────────
  if (F.axis === 'X') {
    for (const r of ROOFS) {
      const sil = roofSilhouette(F, r);
      s.rect(sil.u0, sil.z0 - ROOF_ASSEMBLY, sil.u1 - sil.u0, ROOF_ASSEMBLY,
        { fill: INK.poche, color: INK.line, w: LW.cut });
    }
    // the roof step, glazed
    if (F.id === 'S') {
      const zA = roofSilhouette(F, roofById('RA')).z0;
      const zB = roofSilhouette(F, roofById('RB')).z0;
      s.rect(U(F, CLERESTORY.x - 18, 0), zA, 18, zB - ROOF_ASSEMBLY - zA,
        { fill: '#dfe9ef', color: INK.water, w: LW.medium });
      s.leader(U(F, CLERESTORY.x - 9, 0), zB - 40, -180, -90,
        `CLERESTORY — ${CLERESTORY.glassArea} SF FACING WEST`);
      s.leader(U(F, CLERESTORY.x - 9, 0), zB - 62, -180, -68,
        'THE ONE OPENING FACING THE WRONG WAY. Fins at 24" o.c.');
    }
  }

  // ── DECKS, TERRACE, STAIR ────────────────────────────────────────────────
  if (F.id === 'S') {
    const d = DECKS[0], t = DECKS[1];
    s.rect(U(F, d.x0, 0), d.top - 14, d.x1 - d.x0, 14, { fill: INK.poche, color: INK.line, w: LW.medium });
    for (let x = d.x0 + 72; x < d.x1; x += 144) {
      s.rect(U(F, x - 3, 0), t.top, 6, d.top - 14 - t.top, { fill: INK.pocheConc, color: INK.line, w: LW.light });
    }
    // guard
    s.line(U(F, d.x0, 0), d.top + 42, U(F, d.x1, 0), d.top + 42, { w: LW.medium, color: INK.line });
    for (let x = d.x0; x <= d.x1; x += 72) s.line(U(F, x, 0), d.top, U(F, x, 0), d.top + 42, { w: LW.hair, color: INK.mid });
    s.rect(U(F, t.x0, 0), t.top - 58, t.x1 - t.x0, 58, { fill: INK.pocheConc, color: INK.line, w: LW.medium });
    // terrace stair, seen in true length on this face
    const st = EXT_STAIR;
    const n = st.risers;
    const pts = [[U(F, st.xBot, 0), st.zBot]];
    for (let i = 1; i <= n; i++) {
      pts.push([U(F, st.xBot + (i - 1) * st.treadDepth, 0), st.zBot + i * st.riserHeight]);
      pts.push([U(F, st.xBot + i * st.treadDepth, 0), st.zBot + i * st.riserHeight]);
    }
    s.poly(pts, { fill: 'none', color: INK.line, w: LW.medium, close: false });
    s.line(U(F, st.xBot, 0), st.zBot + 34, U(F, st.xTop, 0), st.zTop + 34, { w: LW.medium, color: INK.line });
    s.text(U(F, (st.xBot + st.xTop) / 2, 0), st.zTop + 48, 'TERRACE STAIR', { size: 12, anchor: 'middle', color: INK.mid });
  }

  // ── OPENINGS ─────────────────────────────────────────────────────────────
  for (const { o, u0, u1, z0, z1 } of openingsOn(F)) {
    const glazed = o.type !== 'door' || o.glazed;
    const fill = o.type === 'garage' ? '#dfe4e8' : glazed ? '#dfe9ef' : INK.paper;
    s.rect(Math.min(u0, u1), z0, Math.abs(u1 - u0), z1 - z0,
      { fill, color: INK.line, w: LW.medium });
    if (o.type === 'slider' && o.panels) {
      for (let i = 1; i < o.panels; i++) {
        const t = Math.min(u0, u1) + (Math.abs(u1 - u0) * i) / o.panels;
        s.line(t, z0, t, z1, { w: LW.hair, color: INK.mid });
      }
    }
    if (o.type === 'garage') {
      for (let z = z0 + 21; z < z1; z += 21) s.line(Math.min(u0, u1), z, Math.max(u0, u1), z, { w: LW.hair, color: INK.mid });
    }
    if (o.egress) {
      s.text((u0 + u1) / 2, z1 + 14, 'EERO', { size: 11, anchor: 'middle', color: INK.fire, weight: 700 });
    }
  }

  // ── SNOW ─────────────────────────────────────────────────────────────────
  if (F.id === 'S') {
    for (const z of SNOW.retentionZones) {
      const r = roofById(z.roof);
      if (!r) continue;
      const zEave = roofEdgeZ(r, r.y0 - r.overhang.south);
      for (let x = z.x0 + 12; x < z.x1; x += 24) {
        s.line(U(F, x, 0), zEave + 4, U(F, x, 0), zEave + 16, { w: LW.thin, color: INK.storm });
      }
      s.line(U(F, z.x0, 0), zEave + 16, U(F, z.x1, 0), zEave + 16, { w: LW.thin, color: INK.storm });
    }
    const fs = SNOW.freeShedZones[0];
    s.text(U(F, (fs.x0 + fs.x1) / 2, 0), -ft(3), 'FREE SHED — COBBLE APRON, NOTHING BELOW',
      { size: 12, anchor: 'middle', color: INK.storm });
  }

  // ── GRADE, DRAWN LAST SO IT CUTS THE BUILDING ────────────────────────────
  s.earthHatch([...nearG, [nearG[nearG.length - 1][0], deep], [nearG[0][0], deep]], { spacing: 15 });
  s.poly(nearG, { fill: 'none', color: INK.ground, w: LW.heavy, close: false });

  // ── LEVELS, GRID, DIMENSIONS ─────────────────────────────────────────────
  const tagU = uMax + ft(3);
  for (const L of LEVELS) {
    s.line(uMin, L.ffe, tagU, L.ffe, { w: LW.hair, color: INK.faint, dash: '30 8 5 8' });
    s.levelTag(tagU, L.ffe, `${L.short}  ${el(L.ffe)}`);
  }
  const ridge = Math.max(...ROOFS.map(r => Math.max(r.topAtY0, r.topAtY1)));
  s.line(uMin, ridge, tagU, ridge, { w: LW.hair, color: INK.faint, dash: '30 8 5 8' });
  s.levelTag(tagU, ridge, `T.O. ROOF  ${el(ridge)}`);
  s.dimV(L0.ffe, L1.ffe, uMin - ft(4), null, {});
  s.dimV(L1.ffe, L2.ffe, uMin - ft(4), null, {});

  if (F.axis === 'X') {
    for (const g of GRID.x) s.gridBubble(U(F, g.v, 0), -ft(8), g.id);
  } else {
    for (const g of GRID.y) s.gridBubble(U(F, 0, g.v), -ft(8), g.id);
  }

  // ── TITLE ────────────────────────────────────────────────────────────────
  s.text(uMin, -ft(12), `${F.name}   ·   FACING ${F.azimuth}°`, { size: 24, weight: 700, spacing: 1.5 });
  s.text(uMin, -ft(12), F.sub, { size: 15, color: INK.mid, dy: 26 });
  if (annotate) {
    s.text(uMin, -ft(12), 'DASHED LINE IS ASSUMED NATURAL GRADE. LIGHTER DASHED LINE IS FINISHED GRADE BEYOND THE BUILDING.',
      { size: 12, color: INK.mid, dy: 48 });
  }
  return { uMin, uMax, ridge };
}

// ── ROOF PLAN ───────────────────────────────────────────────────────────────
export function drawRoofPlan(s) {
  const arrow = (x0, y0, x1, y1, label) => {
    s.line(x0, y0, x1, y1, { w: LW.medium, color: INK.storm });
    const a = Math.atan2(y1 - y0, x1 - x0);
    for (const t of [2.6, -2.6]) {
      s.line(x1, y1, x1 + 20 * Math.cos(a + t), y1 + 20 * Math.sin(a + t), { w: LW.medium, color: INK.storm });
    }
    if (label) s.text((x0 + x1) / 2 + 8, (y0 + y1) / 2, label, { size: 12, color: INK.storm, rotate: -90 });
  };

  for (const r of ROOFS) {
    const o = r.overhang;
    s.rect(r.x0 - o.west, r.y0 - o.south, (r.x1 + o.east) - (r.x0 - o.west), (r.y1 + o.north) - (r.y0 - o.south),
      { fill: '#f2efe9', color: INK.line, w: LW.cut });
    s.rect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0, { fill: 'none', color: INK.mid, w: LW.hair, dash: '14 8' });
    const cx = (r.x0 + r.x1) / 2;
    const cy = (r.y0 + r.y1) / 2 + (r.id === 'RL' ? 84 : 0);
    s.text(cx, cy + 30, r.name, { size: 15, anchor: 'middle', weight: 700, spacing: 1.2 });
    s.text(cx, cy, `${r.pitch}:12 FALLING ${r.fallDir}`, { size: 13, anchor: 'middle', color: INK.mid });
    s.text(cx, cy - 26, `T.O. ${el(r.topAtY1)} AT SPINE`, { size: 11, anchor: 'middle', color: INK.mid });
    s.text(cx, cy - 44, `${el(r.topAtY0)} AT EAVE`, { size: 11, anchor: 'middle', color: INK.mid });
    arrow(cx + (r.id === 'RL' ? 30 : 84), r.y1 - 24, cx + (r.id === 'RL' ? 30 : 84), r.y0 + 24, null);
    // gutter / eave line
    s.line(r.x0 - o.west, r.y0 - o.south, r.x1 + o.east, r.y0 - o.south, { w: LW.heavy, color: INK.storm });
  }

  // clerestory
  s.rect(CLERESTORY.x - 18, CLERESTORY.y0, 18, CLERESTORY.y1 - CLERESTORY.y0,
    { fill: '#dfe9ef', color: INK.water, w: LW.medium });
  s.leader(CLERESTORY.x - 9, CLERESTORY.y1, 60, -150,
    `CLERESTORY ${CLERESTORY.glassArea} SF — GLAZED WEST`);

  // snow zones
  const ret = s.hatchDef('snowret', { angle: 90, spacing: 14, color: INK.storm, w: 0.7 });
  for (const z of SNOW.retentionZones) {
    const r = roofById(z.roof); if (!r) continue;
    s.rect(z.x0, r.y0 - r.overhang.south, z.x1 - z.x0, 48, { fill: ret, color: INK.storm, w: LW.light });
  }
  const fs = SNOW.freeShedZones[0];
  const rA = roofById(fs.roof);
  s.rect(fs.x0, rA.y0 - rA.overhang.south - 72, fs.x1 - fs.x0, 72,
    { fill: 'none', color: INK.fire, w: LW.medium, dash: '14 8' });
  s.text((fs.x0 + fs.x1) / 2, rA.y0 - rA.overhang.south - 40, 'FREE SHED ZONE — NOTHING MAY BE PLACED HERE',
    { size: 12, anchor: 'middle', color: INK.fire, weight: 700 });

  s.text(ROOFS[0].x0 - 24, -ft(17), 'ROOF PLAN   ·   1/8"=1\'-0"', { size: 24, weight: 700, spacing: 1.5 });
  s.text(ROOFS[0].x0 - 24, -ft(17), 'EVERY PLANE FALLS DOWNHILL. NO VALLEYS, NO CRICKETS, NO ROOF WATER SENT TO THE CUT.',
    { size: 14, color: INK.mid, dy: 26 });
  s.text(ROOFS[0].x0 - 24, -ft(17), 'HEAVY BLUE LINE IS THE EAVE. HATCHED BANDS ARE SNOW RETENTION, PLACED WHERE SOMETHING IS BELOW.',
    { size: 12, color: INK.mid, dy: 46 });
  return s;
}
