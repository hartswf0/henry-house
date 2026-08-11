// HENRY HOUSE — R-101. THE REFERENCE SET, AS A BAR.
//
// The packs supply URLs and study cards. What a drawing set needs is the
// MEASURABLE part, drawn at one scale beside the schemes, so "the reference"
// stops being a mood and becomes a number a design can lose to.
//
// Front Porch publishes areas, footprints, porch areas and perimeters. Those
// are drawn here as real plans at the same scale as X-101, next to Henry's.
// The Olson Kundig work publishes no dimensions in these packs, so it appears
// as a scale bar only — never as a scored comparison.

import { LW, INK } from '../svg.mjs';
import { ft } from '../../model/units.mjs';
import { FRONT_PORCH, VISUAL_BAR, bars, PROVENANCE } from '../../model/references.mjs';
import { allMetrics } from '../../model/schemes.mjs';

function wrap(str, n) {
  const w = String(str).split(/\s+/); const out = []; let l = '';
  for (const x of w) { if ((l + ' ' + x).trim().length > n) { out.push(l); l = x; } else l = (l ? l + ' ' : '') + x; }
  if (l) out.push(l); return out;
}

/** One Front Porch house as a footprint at the sheet scale, with its porch. */
export function drawRefPlan(s, r) {
  const w = ft(r.wFt), d = ft(r.dFt);
  s.rect(0, 0, w, d, { fill: INK.poche, color: INK.line, w: LW.cut });
  // porch, drawn at its published area against the short end
  const pd = ft(r.porchSf / r.wFt);
  s.rect(0, -pd, w, pd, { fill: 'none', color: INK.mid, w: LW.light, dash: '10 6' });
  s.text(w / 2, -pd / 2, 'PORCH', { size: 9, anchor: 'middle', color: INK.mid, dy: 3 });
  s.text(w / 2, d / 2, `${r.br}BR`, { size: 13, anchor: 'middle', color: INK.paper, weight: 700, dy: 5 });
}

export function drawReferenceSheet(s) {
  const B = bars();
  const COLS = 6, CW = 360, X0 = 300, ROW = 560;

  s.stext(300, 300, 'THE BUILD-INTELLIGENCE BAR — FRONT PORCH, DRAWN AT THE SAME SCALE AS THE SCHEMES',
    { size: 15, weight: 700, spacing: 1.5 });
  s.stext(300, 320, 'Published areas, footprints, porch areas and perimeters. These are real houses with real numbers, which is exactly why they can be lost to.',
    { size: 11, color: INK.mid });

  FRONT_PORCH.forEach((r, i) => {
    const cx = X0 + i * CW;
    s.ox = cx; s.oy = ROW;
    drawRefPlan(s, r);
    s.stext(cx, ROW + 92, r.name, { size: 12.5, weight: 700, spacing: 1 });
    s.stext(cx, ROW + 108, `${r.sf} sf  ·  ${r.wFt} x ${r.dFt} ft  ·  ${r.perimeterLf} lf`, { size: 10, color: INK.mid });
    s.stext(cx, ROW + 122, `${(r.perimeterLf / r.sf).toFixed(3)} lf per sf`, { size: 10, color: INK.accent, weight: 700 });
    if (r.siteRelevant) s.stext(cx, ROW + 138, 'BUILT ON A STEEP NC SITE', { size: 9.5, color: INK.fire, weight: 700 });
    let k = ROW + 158;
    for (const ln of wrap(r.transfer, 40)) { s.stext(cx, k, ln, { size: 9.5, color: INK.line }); k += 12; }
  });

  // ── the bars, and where Henry stands against them ────────────────────────
  const M = allMetrics();
  let y = 900;
  s.stext(300, y, 'THE BARS, AND WHERE EACH SCHEME STANDS', { size: 16, weight: 700, spacing: 1.6 });
  s.stext(300, y + 20, 'Computed from the product line, not chosen. A scheme must BEAT a bar, not match it — the gauntlet counts a tie as a loss.',
    { size: 11, color: INK.mid });
  y += 56;

  const LAB = 430, CW2 = (2240 - LAB) / M.length;
  s.sline(300, y - 16, 300 + 2240, y - 16, { w: LW.medium, color: INK.line });
  M.forEach((m, i) => s.stext(300 + LAB + CW2 * (i + 0.5), y, m.name.replace('THE ', ''),
    { size: 12, weight: 700, anchor: 'middle', spacing: 1 }));
  y += 22;
  s.sline(300, y, 300 + 2240, y, { w: LW.hair, color: INK.faint });
  y += 22;

  const ROWS = [
    ['ENVELOPE  lf per sf', B.ENVELOPE, m => m.perimeterPerSf, 'lo'],
    ['SHELTER  sheltered per sf', B.PORCH, m => +((m.shelteredSf + m.futureSf) / Math.max(1, m.conditionedSf)).toFixed(3), 'hi'],
    ['SCALE  conditioned sf', B.SCALE, m => m.conditionedSf, 'lo'],
  ];
  for (const [label, bar, get, dir] of ROWS) {
    s.stext(300, y, label, { size: 11.5, color: INK.line, weight: 700 });
    s.stext(300, y + 14, `bar ${bar.value}  —  ${bar.holder}`, { size: 10, color: INK.accent });
    M.forEach((m, i) => {
      const v = get(m);
      const beat = dir === 'lo' ? v < bar.value : v > bar.value;
      const x = 300 + LAB + CW2 * (i + 0.5);
      if (beat) s.srect(x - CW2 / 2 + 6, y - 13, CW2 - 12, 20, { fill: '#e7efe9', color: 'none', lw: 0 });
      s.stext(x, y, typeof v === 'number' && v > 100 ? v.toLocaleString() : String(v),
        { size: 12, anchor: 'middle', weight: beat ? 700 : 400,
          color: beat ? '#2f7d54' : INK.line, family: 'ui-monospace, Menlo, monospace' });
      s.stext(x, y + 14, beat ? 'BEATS' : 'loses', { size: 9, anchor: 'middle', color: beat ? '#2f7d54' : INK.mid });
    });
    y += 46;
  }
  s.sline(300, y - 12, 300 + 2240, y - 12, { w: LW.medium, color: INK.line });

  // ── the visual bar, honestly labelled ────────────────────────────────────
  y += 34;
  s.stext(300, y, 'THE VISUAL AND SECTIONAL BAR — NO DIMENSIONS ARE PUBLISHED IN THESE PACKS',
    { size: 15, weight: 700, spacing: 1.5 });
  s.stext(300, y + 20, 'So these are operations and states, not measurements. The areas shown are widely-cited figures, marked ASSUMED, and are never scored.',
    { size: 11, color: INK.fire });
  y += 50;
  const VW = 2240 / VISUAL_BAR.length;
  VISUAL_BAR.forEach((v, i) => {
    const cx = 300 + i * VW;
    s.stext(cx, y, v.name, { size: 12.5, weight: 700, spacing: 1 });
    s.stext(cx, y + 15, v.sfAssumed ? `~${v.sfAssumed} sf — ASSUMED` : 'no area cited', { size: 10, color: INK.fire });
    let k = y + 34;
    for (const ln of wrap('OPERATION — ' + v.operation, 44)) { s.stext(cx, k, ln, { size: 9.5, color: INK.line }); k += 12; }
    k += 5;
    for (const ln of wrap('STATE — ' + v.state, 44)) { s.stext(cx, k, ln, { size: 9.5, color: INK.mid }); k += 12; }
    k += 5;
    for (const ln of wrap('DO NOT COPY — ' + v.doNotCopy, 44)) { s.stext(cx, k, ln, { size: 9.5, color: INK.fire }); k += 12; }
  });

  // ── provenance, stated plainly ───────────────────────────────────────────
  y += 230;
  s.srect(300, y - 16, 2240, 74, { fill: '#f6efef', color: INK.fire, lw: LW.light, rx: 3 });
  s.stext(312, y + 2, 'PROVENANCE — NOTHING ON THIS SHEET WAS FETCHED', { size: 12, weight: 700, color: INK.fire });
  let k = y + 20;
  for (const ln of wrap(PROVENANCE.note, 168)) { s.stext(312, k, ln, { size: 10, color: INK.mid }); k += 13; }
  for (const ln of wrap(PROVENANCE.verify, 168)) { s.stext(312, k, ln, { size: 10, color: INK.line }); k += 13; }
}
