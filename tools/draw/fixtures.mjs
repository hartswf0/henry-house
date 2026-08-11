// HENRY HOUSE — 2D plan symbols for fixtures, casework and furniture.
// Drawn from model/fixtures.mjs, the same schedule the 3D scene and the
// clearance checks read.

import { LW, INK } from '../svg.mjs';
import { fixturesFor, CLEARANCE } from '../../model/fixtures.mjs';

const CAB = '#7d868f';       // casework line
const FIX = '#2b3138';       // plumbing fixture line
const FURN = '#98a2ab';      // furniture line
const EQ = '#7a5a2a';        // equipment line

/** Clear floor space in front of a fixture, in the `face` direction. */
export function clearZone(f) {
  const c = f.clear ?? 0;
  if (!c) return null;
  switch (f.face) {
    case 'N': return [f.x, f.y + f.d, f.w, c];
    case 'S': return [f.x, f.y - c, f.w, c];
    case 'E': return [f.x + f.w, f.y, c, f.d];
    case 'W': return [f.x - c, f.y, c, f.d];
    default: return null;
  }
}

// ── individual symbols ──────────────────────────────────────────────────────
const sym = {
  wc(s, f) {
    // tank against the wall behind, elongated bowl in front
    const { x, y, w, d, face } = f;
    const vert = face === 'N' || face === 'S';
    const tankD = 8;
    if (vert) {
      const ty = face === 'S' ? y + d - tankD : y;
      s.rect(x, ty, w, tankD, { fill: INK.paper, color: FIX, w: LW.light });
      const cx = x + w / 2, cy = face === 'S' ? y + (d - tankD) * 0.5 : y + tankD + (d - tankD) * 0.5;
      s.raw(ellipse(s, cx, cy, w * 0.44, (d - tankD) * 0.5, FIX));
    } else {
      const tx = face === 'E' ? x : x + d - tankD;
      s.rect(tx, y, tankD, w, { fill: INK.paper, color: FIX, w: LW.light });
      const cy = y + w / 2, cx = face === 'E' ? x + tankD + (d - tankD) * 0.5 : x + (d - tankD) * 0.5;
      s.raw(ellipse(s, cx, cy, (d - tankD) * 0.5, w * 0.44, FIX));
    }
  },
  lav(s, f) { counterBasins(s, f, 1); },
  lav2(s, f) { counterBasins(s, f, 2); },
  sink(s, f) { counterBasins(s, f, 2, true); },
  tub(s, f) {
    const { x, y, w, d } = f;
    s.rect(x, y, w, d, { fill: INK.paper, color: FIX, w: LW.medium });
    s.raw(roundRect(s, x + 3, y + 3, w - 6, d - 6, 6, FIX));
    s.circle(x + w - 9, y + d / 2, 1.6, { fill: FIX, color: FIX, w: LW.thin });
  },
  shower36(s, f) { shower(s, f); },
  shower42(s, f) { shower(s, f); },
  range(s, f) {
    const { x, y, w, d } = f;
    s.rect(x, y, w, d, { fill: INK.paper, color: FIX, w: LW.medium });
    for (const [ox, oy] of [[0.28, 0.3], [0.72, 0.3], [0.28, 0.7], [0.72, 0.7]])
      s.circle(x + w * ox, y + d * oy, 3.6, { color: FIX, w: LW.thin });
  },
  fridge(s, f) {
    const { x, y, w, d } = f;
    s.rect(x, y, w, d, { fill: INK.paper, color: CAB, w: LW.medium });
    s.line(x + w / 2, y, x + w / 2, y + d, { w: LW.thin, color: CAB });
    s.text(x + w / 2, y + d / 2 + 4, 'REF', { size: 11, anchor: 'middle', color: CAB });
  },
  dw(s, f) {
    const { x, y, w, d } = f;
    s.rect(x, y, w, d, { fill: 'none', color: CAB, w: LW.thin, dash: '6 4' });
    s.text(x + w / 2, y + d / 2 + 4, 'DW', { size: 10, anchor: 'middle', color: CAB });
  },
  washer(s, f) {
    const { x, y, w, d } = f;
    s.rect(x, y, w, d, { fill: INK.paper, color: FIX, w: LW.medium });
    s.circle(x + w / 2, y + d / 2, Math.min(w, d) * 0.28, { color: FIX, w: LW.thin });
  },
  base(s, f) {
    s.rect(f.x, f.y, f.w, f.d, { fill: INK.paper, color: CAB, w: LW.light });
    const along = f.face === 'N' || f.face === 'S';
    if (along) s.line(f.x, f.face === 'S' ? f.y : f.y + f.d, f.x + f.w, f.face === 'S' ? f.y : f.y + f.d, { w: LW.medium, color: CAB });
  },
  island(s, f) {
    s.rect(f.x, f.y, f.w, f.d, { fill: INK.paper, color: CAB, w: LW.medium });
    s.rect(f.x + 2, f.y + 2, f.w - 4, f.d - 4, { fill: 'none', color: CAB, w: LW.hair });
  },
  shelf(s, f) {
    const h = s.hatchDef(`shf${f.id}`, { angle: 45, spacing: 7, color: CAB, w: 0.6 });
    s.rect(f.x, f.y, f.w, f.d, { fill: h, color: CAB, w: LW.thin });
  },
  rod(s, f) {
    const vert = f.d > f.w;
    s.rect(f.x, f.y, f.w, f.d, { fill: 'none', color: CAB, w: LW.thin });
    const n = Math.floor((vert ? f.d : f.w) / 12);
    for (let i = 1; i < n; i++) {
      const t = i * 12;
      if (vert) s.line(f.x, f.y + t, f.x + f.w, f.y + t, { w: LW.hair, color: CAB });
      else s.line(f.x + t, f.y, f.x + t, f.y + f.d, { w: LW.hair, color: CAB });
    }
  },
  bedK(s, f) { bed(s, f); },
  bedQ(s, f) { bed(s, f); },
  nightstand(s, f) { s.rect(f.x, f.y, f.w, f.d, { fill: INK.paper, color: FURN, w: LW.thin }); },
  bench(s, f) { s.rect(f.x, f.y, f.w, f.d, { fill: INK.paper, color: FURN, w: LW.thin }); },
  sofa(s, f) {
    const { x, y, w, d } = f;
    const backD = 7;
    const by = f.face === 'S' ? y + d - backD : y;
    s.raw(roundRect(s, x, y, w, d, 4, FURN, INK.paper));
    s.rect(x, by, w, backD, { fill: 'none', color: FURN, w: LW.thin });
    const n = Math.max(2, Math.round(w / 34));
    for (let i = 1; i < n; i++) s.line(x + (w * i) / n, y + 2, x + (w * i) / n, y + d - 2, { w: LW.hair, color: FURN });
  },
  chair(s, f) { s.raw(roundRect(s, f.x, f.y, f.w, f.d, 4, FURN, INK.paper)); },
  'table-d'(s, f) { s.raw(roundRect(s, f.x, f.y, f.w, f.d, 3, FURN, INK.paper)); },
  'table-c'(s, f) { s.raw(roundRect(s, f.x, f.y, f.w, f.d, 3, FURN, INK.paper)); },
  desk(s, f) { s.rect(f.x, f.y, f.w, f.d, { fill: INK.paper, color: FURN, w: LW.thin }); },
  rug(s, f) { s.rect(f.x, f.y, f.w, f.d, { fill: 'none', color: INK.faint, w: LW.thin, dash: '14 8' }); },
  stove(s, f) {
    const { x, y, w, d } = f;
    s.rect(x - 6, y - 6, w + 12, d + 12, { fill: 'none', color: EQ, w: LW.hair, dash: '8 5' });
    s.rect(x, y, w, d, { fill: INK.paper, color: FIX, w: LW.medium });
    s.circle(x + w / 2, y + d / 2, Math.min(w, d) * 0.3, { color: FIX, w: LW.thin });
  },
  // mechanical equipment — drawn as real objects with real footprints
  tank(s, f) { s.circle(f.x + f.w / 2, f.y + f.d / 2, f.w / 2, { fill: INK.paper, color: EQ, w: LW.medium }); },
  hpwh(s, f) { s.circle(f.x + f.w / 2, f.y + f.d / 2, f.w / 2, { fill: INK.paper, color: EQ, w: LW.medium }); },
  erv(s, f) { eqBox(s, f); },
  ahu(s, f) { eqBox(s, f); },
  filter(s, f) { eqBox(s, f); },
  manifold(s, f) { eqBox(s, f); },
  battery(s, f) { eqBox(s, f); },
  panel(s, f) {
    s.rect(f.x, f.y, f.w, f.d, { fill: INK.paper, color: EQ, w: LW.heavy });
    s.line(f.x, f.y, f.x + f.w, f.y + f.d, { w: LW.thin, color: EQ });
  },
};

function eqBox(s, f) {
  s.rect(f.x, f.y, f.w, f.d, { fill: INK.paper, color: EQ, w: LW.medium });
  s.line(f.x, f.y, f.x + f.w, f.y + f.d, { w: LW.hair, color: EQ });
  s.line(f.x + f.w, f.y, f.x, f.y + f.d, { w: LW.hair, color: EQ });
}

function bed(s, f) {
  const { x, y, w, d, face } = f;
  s.raw(roundRect(s, x, y, w, d, 3, FURN, INK.paper));
  const headY = face === 'S' ? y + d - 16 : y;
  s.rect(x + 3, headY, (w - 9) / 2, 13, { fill: 'none', color: FURN, w: LW.hair });
  s.rect(x + 6 + (w - 9) / 2, headY, (w - 9) / 2, 13, { fill: 'none', color: FURN, w: LW.hair });
  const foldY = face === 'S' ? y + 22 : y + d - 22;
  s.line(x, foldY, x + w, foldY, { w: LW.hair, color: FURN });
}

function shower(s, f) {
  const { x, y, w, d } = f;
  s.rect(x, y, w, d, { fill: INK.paper, color: FIX, w: LW.medium });
  s.line(x, y, x + w, y + d, { w: LW.hair, color: FIX });
  s.line(x + w, y, x, y + d, { w: LW.hair, color: FIX });
  s.circle(x + w / 2, y + d / 2, 1.8, { fill: FIX, color: FIX, w: LW.thin });
}

function counterBasins(s, f, n, kitchen = false) {
  const { x, y, w, d, face } = f;
  s.rect(x, y, w, d, { fill: INK.paper, color: CAB, w: LW.light });
  const vert = face === 'N' || face === 'S';
  for (let i = 0; i < n; i++) {
    const cx = vert ? x + (w * (i + 0.5)) / n : x + d / 2;
    const cy = vert ? y + d / 2 : y + (w * (i + 0.5)) / n;
    const rx = vert ? (w / n) * 0.32 : d * 0.3;
    const ry = vert ? d * 0.3 : (w / n) * 0.32;
    if (kitchen) s.raw(roundRect(s, cx - rx, cy - ry, rx * 2, ry * 2, 2, FIX));
    else s.raw(ellipse(s, cx, cy, rx, ry, FIX));
  }
  // faucet against the back edge
  const fx = vert ? x + w / 2 : (face === 'E' ? x + 3 : x + d - 3);
  const fy = vert ? (face === 'S' ? y + d - 3 : y + 3) : y + w / 2;
  s.circle(fx, fy, 1.5, { fill: FIX, color: FIX, w: LW.thin });
}

// raw SVG helpers (model coords -> sheet)
function ellipse(s, cx, cy, rx, ry, color) {
  const [a, b] = s.P(cx, cy);
  return `<ellipse cx="${a}" cy="${b}" rx="${s.L(rx)}" ry="${s.L(ry)}" fill="${INK.paper}" stroke="${color}" stroke-width="${LW.light}"/>`;
}
function roundRect(s, x, y, w, h, r, color, fill = 'none') {
  const [a, b] = s.P(x, y + h);
  return `<rect x="${a}" y="${b}" width="${s.L(w)}" height="${s.L(h)}" rx="${s.L(r)}" fill="${fill}" stroke="${color}" stroke-width="${LW.light}"/>`;
}

// ── public ──────────────────────────────────────────────────────────────────
export function drawFixtures(s, levelId, { showClearances = false, link = null } = {}) {
  const list = fixturesFor(levelId).filter(f => link === null ? true : !!f.link === link);

  if (showClearances) {
    for (const f of list) {
      const z = clearZone(f);
      if (!z) continue;
      const h = s.hatchDef(`cz${f.id}`, { angle: -45, spacing: 9, color: '#3d9b7a', w: 0.6 });
      s.rect(z[0], z[1], z[2], z[3], { fill: h, color: '#3d9b7a', w: LW.hair, dash: '7 5' });
    }
  }
  for (const f of list) {
    const fn = sym[f.type];
    if (fn) fn(s, f);
    else s.rect(f.x, f.y, f.w, f.d, { fill: 'none', color: FURN, w: LW.thin });
  }
  // tag only the equipment and appliances — furniture stays quiet
  for (const f of list) {
    if (!f.label) continue;
    if (['sofa', 'chair', 'table-d', 'table-c', 'rug', 'bench', 'nightstand', 'desk', 'bedK', 'bedQ'].includes(f.type)) continue;
    s.text(f.x + f.w / 2, f.y + f.d / 2, f.label, {
      size: 9.5, anchor: 'middle', color: f.type === 'panel' || String(f.id).startsWith('MEQ') ? EQ : INK.mid, dy: -2,
    });
  }
}

export { sym };
