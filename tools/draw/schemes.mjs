// HENRY HOUSE — X-101. THE SEVEN SCHEMES, SIDE BY SIDE.
//
// The reference wall says: "Do not ask whether HENRY resembles these houses.
// Put HENRY's plan and section beside them at the same scale. Compare
// conditioned area, sheltered area, perimeter, wet-wall length, foundations,
// roof intersections, ground contacts, rooms served, future capacity, and cost."
//
// So this sheet draws all seven plans AT ONE SCALE, all seven sections at one
// scale, and puts that exact list underneath as a table. Nothing is scaled to
// fit its own box: the Tower is small because it is small.

import { LW, INK } from '../svg.mjs';
import { ft, dim } from '../../model/units.mjs';
import { SCHEMES, metrics, groundMetrics, roofBase, PLATE } from '../../model/schemes.mjs';
import { SITE_SLOPE } from '../../model/geometry.mjs';

const natural = (x, y) => SITE_SLOPE.grade(x, y);
const KIND = {
  cond:   { fill: INK.poche,     label: 'CONDITIONED' },
  future: { fill: '#cfd8cf',     label: 'SHELTERED NOW, ROOMS LATER' },
  shelt:  { fill: 'none',        label: 'SHELTERED — PORCH, DECK, UNDERCROFT' },
};

function wrap(str, n) {
  const w = String(str).split(/\s+/); const out = []; let l = '';
  for (const x of w) { if ((l + ' ' + x).trim().length > n) { out.push(l); l = x; } else l = (l ? l + ' ' : '') + x; }
  if (l) out.push(l); return out;
}

/** One scheme's plan, drawn in model coordinates at the sheet's scale. */
export function drawSchemePlan(s, scheme) {
  const m = metrics(scheme);

  // ground intervention first, so the building reads on top of it
  const G = scheme.ground;
  if (G.kind === 'piers') {
    for (const [px, py] of G.pts) s.circle(px, py, ft(G.diaFt) / 2, { fill: INK.pocheConc, color: INK.line, w: LW.medium });
  } else {
    const h = s.hatchDef(`cut-${scheme.id}`, { angle: 45, spacing: 9, color: '#b8860b', w: 0.6 });
    s.rect(G.x0, G.y0, G.x1 - G.x0, G.y1 - G.y0, { fill: h, color: '#b8860b', w: LW.medium, dash: '12 7' });
  }

  // roof outline — the extent of shelter, dashed
  for (const r of scheme.roofs) {
    s.rect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0, { fill: 'none', color: INK.mid, w: LW.hair, dash: '14 9' });
  }

  for (const v of scheme.volumes) {
    const k = KIND[v.kind];
    s.rect(v.x0, v.y0, v.x1 - v.x0, v.y1 - v.y0,
      { fill: k.fill, color: INK.line, w: v.kind === 'cond' ? LW.cut : LW.light,
        dash: v.kind === 'shelt' ? '10 6' : null });
    if (v.kind === 'cond' && v.storeys > 1) {
      s.text((v.x0 + v.x1) / 2, (v.y0 + v.y1) / 2, `${v.storeys}`,
        { size: 15, anchor: 'middle', color: INK.paper, weight: 700, dy: 6 });
    }
    if (v.wet) {
      s.line(v.x0 + 6, v.y1 - 10, v.x1 - 6, v.y1 - 10, { w: LW.heavy, color: INK.water });
    }
  }
  return m;
}

/**
 * One scheme's section, cut across the slope at the middle of the plan.
 * Drawn on the SAME vertical scale as every other scheme, over the SAME hill.
 */
export function drawSchemeSection(s, scheme) {
  const cx = (Math.min(...scheme.volumes.map(v => v.x0)) + Math.max(...scheme.volumes.map(v => v.x1))) / 2;

  // natural grade, and the finished ground this scheme proposes
  const y0 = ft(-40), y1 = ft(70);
  const nat = [];
  for (let y = y0; y <= y1; y += 12) nat.push([y, natural(cx, y)]);
  s.poly(nat, { fill: 'none', color: INK.ground, w: LW.light, dash: '18 9', close: false });

  const G = scheme.ground;
  if (G.kind !== 'piers') {
    const zPad = natural((G.x0 + G.x1) / 2, G.y0);
    const fin = [];
    for (let y = y0; y <= y1; y += 12) {
      let z = natural(cx, y);
      if (y >= G.y0 && y <= G.y1) z = zPad;
      else if (y > G.y1) z = Math.min(z, zPad + (y - G.y1) / 1.5);
      fin.push([y, z]);
    }
    s.poly(fin, { fill: 'none', color: INK.ground, w: LW.heavy, close: false });
    s.earthHatch([...fin, [y1, -ft(30)], [y0, -ft(30)]], { spacing: 14 });
  } else {
    s.poly(nat, { fill: 'none', color: INK.ground, w: LW.heavy, close: false });
    s.earthHatch([...nat, [y1, -ft(30)], [y0, -ft(30)]], { spacing: 14 });
    for (const [px, py] of G.pts) {
      if (Math.abs(px - cx) > ft(9)) continue;
      const zTop = ft(scheme.volumes.find(v => v.kind === 'cond')?.ffe ?? 4);
      s.rect(py - ft(G.diaFt) / 2, natural(px, py) - 36, ft(G.diaFt), zTop - natural(px, py) + 36,
        { fill: INK.pocheConc, color: INK.line, w: LW.medium });
    }
  }

  // ── volumes cut at this station ───────────────────────────────────────────
  // Their tops FOLLOW THE ROOF, exactly as the 3D builds the walls: high on
  // the cut side, low at the eave. Drawn flat, the section showed a wedge of
  // daylight between the box and the roof that does not exist in the model —
  // and the section is the drawing that is supposed to prove the two agree.
  const roofOver = (y) => {
    let z = null;
    for (const r of scheme.roofs) {
      if (cx < r.x0 - 1 || cx > r.x1 + 1 || y < r.y0 || y > r.y1) continue;
      const t = roofBase(scheme, r) + (r.pitch / 12) * (y - r.y0);
      if (z === null || t > z) z = t;
    }
    return z;
  };
  for (const v of scheme.volumes) {
    if (cx < v.x0 - 1 || cx > v.x1 + 1) continue;
    const k = KIND[v.kind];
    const zb = ft(v.ffe);
    // the TOP PLATE, not the top of the storey: 14 in lower, and the number
    // the roof actually lands on
    const plate = zb + 120 * ((v.storeys ?? 1) - 1) + PLATE;
    // a volume with another one stacked over it is capped by that floor, not
    // by the roof, so only the topmost box climbs
    const stacked = scheme.volumes.some(o => o !== v && o.kind !== 'shelt' &&
      o.ffe > v.ffe + 0.5 && o.x0 < v.x1 && o.x1 > v.x0 && o.y0 < v.y1 && o.y1 > v.y0);
    const top = (y) => {
      if (stacked) return plate;
      const z = roofOver(y);
      return z === null ? plate : Math.max(plate, z);
    };
    s.poly([[v.y0, zb], [v.y1, zb], [v.y1, top(v.y1)], [v.y0, top(v.y0)]],
      { fill: k.fill, color: INK.line, w: v.kind === 'cond' ? LW.cut : LW.light,
        dash: v.kind === 'shelt' ? '10 6' : null });
  }
  for (const r of scheme.roofs) {
    if (cx < r.x0 - 1 || cx > r.x1 + 1) continue;
    const rise = (r.pitch / 12) * (r.y1 - r.y0);
    // roofBase is the UNDERSIDE, so the build-up sits above it — it was drawn
    // hanging below, which put the covering inside the rooms it covers
    const zb = roofBase(scheme, r);
    s.poly([[r.y0, zb], [r.y1, zb + rise], [r.y1, zb + rise + 10], [r.y0, zb + 10]],
      { fill: INK.poche, color: INK.line, w: LW.cut });
  }
}

// ── THE TABLE ───────────────────────────────────────────────────────────────
const ROWS = [
  ['CONDITIONED', m => m.conditionedSf.toLocaleString(), 'sf', 'lo'],
  ['SHELTERED', m => m.shelteredSf.toLocaleString(), 'sf', null],
  ['SHELTERED → ROOMS LATER', m => (m.futureSf ? m.futureSf.toLocaleString() : '—'), 'sf', 'hi'],
  ['PERIMETER', m => m.perimeterLf.toLocaleString(), 'lf', 'lo'],
  ['PERIMETER PER SF', m => m.perimeterPerSf.toFixed(3), '', 'lo'],
  ['WET-WALL RUN', m => m.wetWallLf, 'lf', 'lo'],
  ['ROOF PLANES', m => m.roofPlanes, '', 'lo'],
  ['ROOF JUNCTIONS', m => m.roofJunctions, '', 'lo'],
  ['GROUND CONTACTS', m => m.groundContacts, '', null],
  ['EARTH MOVED', m => m.cutCY.toLocaleString(), 'CY', 'lo'],
  ['DEEPEST CUT', m => m.maxCutFt, 'ft', 'lo'],
  ['BEDROOMS', m => m.rooms, '', 'hi'],
  ['PHASE 1', m => m.phase1Sf.toLocaleString(), 'sf', null],
  ['MATURE', m => m.matureSf.toLocaleString(), 'sf', null],
  ['GROWTH WITHOUT DEMOLITION', m => (m.futureCapacityPct ? '+' + m.futureCapacityPct + '%' : '—'), '', 'hi'],
];

/**
 * `all` is the metrics list; `list` is the schemes it came from.
 *
 * These used to be one argument, with the tags read out of the global SCHEMES
 * by position. That is fine for the whole set and silently WRONG for any
 * subset — every column would carry the right numbers under the wrong
 * scheme's tag. Pass both, and default to the full set for the whole-set case.
 */
export function drawSchemeTable(s, sx, sy, w, all, list = SCHEMES) {
  const nCol = all.length;
  const labelW = 300;
  const colW = (w - labelW) / nCol;

  s.stext(sx, sy, 'THE REFERENCE TEST, COMPUTED', { size: 16, weight: 700, spacing: 1.6 });
  s.stext(sx, sy + 20, 'Best value in each row is marked. "Best" means cheapest envelope, least earth, fewest leaks — not most house.',
    { size: 11, color: INK.mid });
  let y = sy + 48;

  s.sline(sx, y - 16, sx + w, y - 16, { w: LW.medium, color: INK.line });
  all.forEach((m, i) => {
    s.stext(sx + labelW + colW * (i + 0.5), y, m.name.replace('THE ', ''),
      { size: 12, weight: 700, anchor: 'middle', spacing: 1 });
    s.stext(sx + labelW + colW * (i + 0.5), y + 14, String(list[i]?.tag ?? '').slice(0, 26),
      { size: 8.5, color: INK.mid, anchor: 'middle' });
  });
  y += 26;
  s.sline(sx, y, sx + w, y, { w: LW.hair, color: INK.faint });
  y += 20;

  for (const [label, get, unit, better] of ROWS) {
    const vals = all.map(get);
    const nums = all.map(m => parseFloat(String(get(m)).replace(/[^0-9.\-]/g, '')));
    let bestIdx = -1;
    if (better) {
      const valid = nums.map((v, i) => [v, i]).filter(([v]) => Number.isFinite(v) && v > 0);
      if (valid.length) bestIdx = valid.reduce((a, b) => (better === 'lo' ? (b[0] < a[0] ? b : a) : (b[0] > a[0] ? b : a)))[1];
    }
    s.stext(sx, y, label, { size: 11, color: INK.mid, spacing: .4 });
    all.forEach((m, i) => {
      const isBest = i === bestIdx;
      if (isBest) s.srect(sx + labelW + colW * i + 4, y - 13, colW - 8, 19, { fill: '#e7efe9', color: 'none', lw: 0 });
      s.stext(sx + labelW + colW * (i + 0.5), y, vals[i] + (unit ? ' ' + unit : ''),
        { size: 12, anchor: 'middle', weight: isBest ? 700 : 400,
          color: isBest ? '#2f7d54' : INK.line, family: 'ui-monospace, Menlo, monospace' });
    });
    y += 24;
  }
  s.sline(sx, y - 14, sx + w, y - 14, { w: LW.medium, color: INK.line });
  return y;
}

/** Provenance: what each scheme borrowed, and what it refused to borrow. */
export function drawProvenance(s, sx, sy, w, cols = 4, list = SCHEMES) {
  s.stext(sx, sy, 'WHERE EACH SCHEME COMES FROM', { size: 16, weight: 700, spacing: 1.6 });
  s.stext(sx, sy + 20, 'Every scheme names ONE transferable operation and ONE thing it must not copy. The references are other people\'s built work: the operation travels, the form does not.',
    { size: 11, color: INK.mid });
  const colW = w / cols;
  let y = sy + 52;
  list.forEach((sc, i) => {
    const cx = sx + colW * (i % cols);
    const cy = y + Math.floor(i / cols) * 260;
    s.stext(cx, cy, sc.name, { size: 13, weight: 700, spacing: 1.2 });
    s.stext(cx, cy + 15, sc.tag.toUpperCase(), { size: 9, color: INK.accent, spacing: .8 });
    let k = cy + 34;
    const W = cols >= 6 ? 36 : 46;
    for (const ln of wrap('FROM — ' + sc.from, W)) { s.stext(cx, k, ln, { size: 9.5, color: INK.mid }); k += 12; }
    k += 5;
    for (const ln of wrap('OPERATION — ' + sc.operation, W)) { s.stext(cx, k, ln, { size: 9.5, color: INK.line }); k += 12; }
    k += 5;
    if (sc.doNotCopy) for (const ln of wrap('DO NOT COPY — ' + sc.doNotCopy, W)) { s.stext(cx, k, ln, { size: 9.5, color: INK.fire }); k += 12; }
  });
  return y + Math.ceil(list.length / cols) * 250;
}
