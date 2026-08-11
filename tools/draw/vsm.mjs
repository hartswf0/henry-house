// HENRY HOUSE — G-001. THE HOUSE AS A VIABLE SYSTEM, AND WHAT IT COSTS.
//
// Everything on this sheet is drawn in SHEET coordinates: it is a diagram and a
// schedule, not a projection of the building.

import { LW, INK } from '../svg.mjs';
import { S1, S2, S3, S3_STAR, S4, S5, ALGEDONIC, viabilityGaps } from '../../model/vsm.mjs';
import { estimate } from '../../model/cost.mjs';

const money = (n) => '$' + Math.round(n).toLocaleString('en-US');

function wrap(str, n) {
  const words = String(str).split(/\s+/); const out = []; let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > n) { out.push(line); line = w; }
    else line = (line ? line + ' ' : '') + w;
  }
  if (line) out.push(line);
  return out;
}

function para(s, x, y, text, { cols = 74, size = 11, color = INK.mid, lead = 14, weight = 400 } = {}) {
  for (const [i, ln] of wrap(text, cols).entries()) {
    s.stext(x, y + i * lead, ln, { size, color, weight });
  }
  return y + wrap(text, cols).length * lead;
}

// ── THE DIAGRAM ─────────────────────────────────────────────────────────────
export function drawVSM(s, x, y, w) {
  const box = (bx, by, bw, bh, fill, colour, lw = LW.medium) =>
    s.srect(bx, by, bw, bh, { fill, color: colour, lw, rx: 4 });

  const envW = w * 0.30, sysX = x + envW + 46, sysW = w - envW - 46;

  // ENVIRONMENT — the thing the system lives inside
  const envH = 560;
  box(x, y, envW, envH, '#f6f2ea', '#b8860b', LW.medium);
  s.stext(x + 14, y + 26, 'ENVIRONMENT', { size: 15, weight: 700, spacing: 1.6, color: '#8a6508' });
  let ey = y + 50;
  for (const t of ['Ice storms and multi-day outages', 'Snow load — governing and UNVERIFIED',
                   'Spring yield and drought', 'Fire weather and smoke',
                   'A 30% colluvial slope and its groundwater', 'A drive that can close',
                   'Watauga County, NCDOT, the fire marshal', 'A physician\'s hours']) {
    s.sline(x + 14, ey - 4, x + 22, ey - 4, { w: LW.thin, color: '#b8860b' });
    ey = para(s, x + 30, ey, t, { cols: 34, size: 11.5, color: INK.mid }) + 8;
  }
  s.stext(x + 14, y + envH - 18, 'THE ADVERSARY, NOT THE BACKDROP', { size: 11, weight: 700, color: '#8a6508' });

  // S5 IDENTITY
  let cy = y;
  box(sysX, cy, sysW, 96, '#f3eef6', '#6b4a8f', LW.heavy);
  s.stext(sysX + 14, cy + 26, 'S5   IDENTITY', { size: 15, weight: 700, spacing: 1.6, color: '#6b4a8f' });
  para(s, sysX + 14, cy + 46, S5.statement, { cols: 96, size: 11.5, color: INK.line });
  para(s, sysX + 14, cy + 78, S5.arbitration.split('.')[0] + '.', { cols: 96, size: 10.5, color: INK.mid });
  cy += 112;

  // S4 INTELLIGENCE
  box(sysX, cy, sysW, 92, '#eaf1f6', INK.water, LW.heavy);
  s.stext(sysX + 14, cy + 26, 'S4   INTELLIGENCE — THE MODEL OF THE ENVIRONMENT AND THE FUTURE',
    { size: 15, weight: 700, spacing: 1.2, color: INK.water });
  para(s, sysX + 14, cy + 46,
    `${S4.length} anticipatory policies. THIS IS THE FUNCTION THE DESIGN DID NOT HAVE. Every sensor in the package looked inward — leak, freeze, CO. That is audit. It tells the house what is happening TO it, never what is about to.`,
    { cols: 104, size: 11, color: INK.line });
  cy += 108;

  // S3 / S3*
  box(sysX, cy, sysW * 0.6, 86, '#eef4ef', '#2f7d54', LW.heavy);
  s.stext(sysX + 14, cy + 26, 'S3   CONTROL', { size: 15, weight: 700, spacing: 1.6, color: '#2f7d54' });
  para(s, sysX + 14, cy + 46, `Seat: ${S3.seat}. Allocates ${S3.allocates.length} scarce resources between the operations below.`,
    { cols: 62, size: 11, color: INK.line });
  const auX = sysX + sysW * 0.6 + 16;
  box(auX, cy, sysW * 0.4 - 16, 86, '#f6efef', INK.fire, LW.heavy);
  s.stext(auX + 14, cy + 26, 'S3*  AUDIT', { size: 15, weight: 700, spacing: 1.6, color: INK.fire });
  para(s, auX + 14, cy + 46, `${S3_STAR.length} direct channels into operations, including the clash checker — which found sixteen failures human review did not.`,
    { cols: 42, size: 10.5, color: INK.line });
  cy += 102;

  // S2
  box(sysX, cy, sysW, 66, '#f4f1e9', INK.mid, LW.medium);
  s.stext(sysX + 14, cy + 24, 'S2   COORDINATION — THE ANTI-OSCILLATION LAYER',
    { size: 14, weight: 700, spacing: 1.2, color: INK.mid });
  para(s, sysX + 14, cy + 44, S2.map(c => c.name).join('  ·  '), { cols: 112, size: 10.5, color: INK.mid });
  cy += 82;

  // S1 units
  s.stext(sysX, cy + 14, 'S1   OPERATIONS', { size: 15, weight: 700, spacing: 1.6 });
  cy += 26;
  const colW = (sysW - 6 * 8) / 7;
  for (const [i, u] of S1.entries()) {
    const bx = sysX + i * (colW + 8);
    box(bx, cy, colW, 118, INK.paper, INK.line, LW.medium);
    s.stext(bx + colW / 2, cy + 22, u.name, { size: 12, weight: 700, anchor: 'middle', spacing: 0.8 });
    for (const [j, ln] of wrap(u.does, 22).entries()) {
      s.stext(bx + colW / 2, cy + 40 + j * 12, ln, { size: 9.5, color: INK.mid, anchor: 'middle' });
    }
    for (const [j, ln] of wrap(u.fails, 22).entries()) {
      s.stext(bx + colW / 2, cy + 90 + j * 11, ln, { size: 8.5, color: INK.fire, anchor: 'middle' });
    }
    // each unit has its own slice of the environment
    s.sline(bx + colW / 2, cy + 118, bx + colW / 2, cy + 138, { w: LW.hair, color: '#b8860b', dash: '5 4' });
    s.sline(x + envW, cy + 138, bx + colW / 2, cy + 138, { w: LW.hair, color: '#b8860b', dash: '5 4' });
  }

  // the algedonic channel — straight past everything
  const algY = cy + 158;
  s.sline(sysX - 26, y + 10, sysX - 26, algY, { w: LW.heavy, color: INK.fire });
  for (const t of [-1, 1]) {
    s.sline(sysX - 26, y + 10, sysX - 26 + 7 * t, y + 26, { w: LW.heavy, color: INK.fire });
  }
  s.stext(sysX - 34, (y + algY) / 2, 'ALGEDONIC — PAIN BYPASSES EVERY LEVEL',
    { size: 11, weight: 700, color: INK.fire, anchor: 'middle', rotate: -90 });
  s.stext(sysX, algY + 16, 'HARDWIRED REFLEXES, NO CONTROLLER IN THE PATH:  ' + ALGEDONIC.map(a => a.signal).join('  ·  '),
    { size: 10.5, color: INK.fire });
  return Math.max(algY + 34, y + envH + 20);
}

// ── S4 POLICY SCHEDULE ──────────────────────────────────────────────────────
export function drawS4Schedule(s, x, y, w) {
  s.stext(x, y, 'S4 — WHAT THE HOUSE DOES BEFORE THE WEATHER DOES IT', { size: 16, weight: 700, spacing: 1.6 });
  y = para(s, x, y + 22,
    'Each policy is a standing rule: when the model of the outside world crosses a threshold, act ahead of it, using hardware already in the design. Lead time is the whole point — a battery charged after the outage starts is not a battery. ALL THRESHOLDS ARE ASSUMED.',
    { cols: 106, size: 11, color: INK.mid }) + 16;

  for (const p of S4) {
    s.srect(x, y - 12, w, 20, { fill: '#eaf1f6', color: 'none', lw: 0 });
    s.stext(x + 8, y + 2, p.name, { size: 12.5, weight: 700, color: INK.water, spacing: 1 });
    s.stext(x + w - 8, y + 2, `LEAD ${p.lead.toUpperCase()}`, { size: 10.5, color: INK.mid, anchor: 'end' });
    y += 22;
    y = para(s, x + 8, y, `WATCHES: ${p.watches}`, { cols: 100, size: 10.5, color: INK.line }) + 2;
    for (const a of p.acts) {
      s.stext(x + 14, y, '>', { size: 10, color: INK.water, weight: 700 });
      y = para(s, x + 26, y, a, { cols: 96, size: 10.5, color: INK.mid }) + 1;
    }
    y = para(s, x + 8, y + 4, p.because, { cols: 100, size: 10.5, color: INK.fire }) + 18;
  }
  return y;
}

// ── COST ────────────────────────────────────────────────────────────────────
export function drawCost(s, x, y, w) {
  const e = estimate();
  s.stext(x, y, 'WHAT IT COSTS', { size: 16, weight: 700, spacing: 1.8 });
  y = para(s, x, y + 22,
    'QUANTITIES ARE DERIVED from the same model that draws the plans. UNIT COSTS ARE INVENTED — no supplier, no cost database, no local bid was consulted, because this container has no outbound access. Trust the takeoff, distrust the money, read the range.',
    { cols: 78, size: 11, color: INK.fire }) + 14;

  const c1 = x, c2 = x + w * 0.50, c3 = x + w * 0.72, c4 = x + w;
  s.sline(x, y - 2, x + w, y - 2, { w: LW.medium, color: INK.line });
  y += 16;
  s.stext(c1, y, 'ITEM', { size: 10.5, weight: 700, spacing: 1 });
  s.stext(c2, y, 'QUANTITY', { size: 10.5, weight: 700, anchor: 'end', spacing: 1 });
  s.stext(c3, y, 'LOW', { size: 10.5, weight: 700, anchor: 'end', spacing: 1 });
  s.stext(c4, y, 'HIGH', { size: 10.5, weight: 700, anchor: 'end', spacing: 1 });
  y += 8;
  s.sline(x, y, x + w, y, { w: LW.hair, color: INK.faint });
  y += 16;

  for (const l of e.lines) {
    s.stext(c1, y, l.name, { size: 10.5, color: INK.line });
    s.stext(c2, y, l.unit === 'LS' ? '—' : `${l.qty.toLocaleString()} ${l.unit}`, { size: 10.5, color: INK.mid, anchor: 'end' });
    s.stext(c3, y, money(l.lo), { size: 10.5, color: INK.mid, anchor: 'end' });
    s.stext(c4, y, money(l.hi), { size: 10.5, color: INK.line, anchor: 'end' });
    y += 17;
  }
  y += 4;
  s.sline(x, y - 8, x + w, y - 8, { w: LW.hair, color: INK.faint });
  const row = (label, lo, hi, bold = false) => {
    s.stext(c1, y, label, { size: 11, weight: bold ? 700 : 400, color: INK.line });
    s.stext(c3, y, money(lo), { size: 11, weight: bold ? 700 : 400, anchor: 'end', color: INK.line });
    s.stext(c4, y, money(hi), { size: 11, weight: bold ? 700 : 400, anchor: 'end', color: INK.line });
    y += 18;
  };
  row('CONSTRUCTION', e.construction.lo, e.construction.hi, true);
  row(`Contingency @ ${e.contingencyPct}%`, e.contingency.lo, e.contingency.hi);
  row(`Design, engineering, survey, geotech, permits @ ${e.softCostPct}%`, e.soft.lo, e.soft.hi);
  s.sline(x, y - 10, x + w, y - 10, { w: LW.medium, color: INK.line });
  y += 4;
  s.stext(c1, y + 4, 'PROJECT RANGE', { size: 15, weight: 700, spacing: 1.4 });
  s.stext(c4, y + 4, `${money(e.total.lo)} — ${money(e.total.hi)}`, { size: 15, weight: 700, anchor: 'end' });
  y += 26;
  s.stext(c1, y, `${Math.round(e.perSf.lo).toLocaleString()} — ${Math.round(e.perSf.hi).toLocaleString()} $/sf on ${e.takeoff.heatedSf.toLocaleString()} sf heated`,
    { size: 11, color: INK.mid });
  y += 26;

  s.srect(x, y - 12, w, 58, { fill: '#f6efef', color: INK.fire, lw: LW.light, rx: 3 });
  s.stext(x + 8, y + 4, `NOT IN THE TOTAL: ${money(e.courtWallAlt.lo)} — ${money(e.courtWallAlt.hi)}`,
    { size: 11.5, weight: 700, color: INK.fire });
  para(s, x + 8, y + 22, e.courtWallAlt.note, { cols: 92, size: 10, color: INK.mid });
  y += 66;

  s.stext(x, y, 'THE THREE LINES THAT COME FROM THE GROUND, NOT THE HOUSE', { size: 12, weight: 700, spacing: 1 });
  y += 18;
  const site = e.lines.filter(l => /EARTHWORK|SPOIL|DRIVEWAY|EROSION/.test(l.name));
  const sLo = site.reduce((a, l) => a + l.lo, 0), sHi = site.reduce((a, l) => a + l.hi, 0);
  y = para(s, x, y,
    `Earthwork, spoil, drive and erosion control together run ${money(sLo)} to ${money(sHi)} — ${Math.round((sLo / e.construction.lo) * 100)}% to ${Math.round((sHi / e.construction.hi) * 100)}% of construction cost, before a single wall is framed. On steep land the site is not a preliminary; it is a wing of the house you cannot see.`,
    { cols: 88, size: 11, color: INK.line });
  return y;
}

// ── GAPS ────────────────────────────────────────────────────────────────────
export function drawGaps(s, x, y, w) {
  const gaps = viabilityGaps();
  s.stext(x, y, 'WHERE THE MODEL SAYS THIS IS STILL NOT VIABLE', { size: 16, weight: 700, spacing: 1.6, color: INK.fire });
  y = para(s, x, y + 22,
    'The point of applying the VSM is not to label the parts. It is to find the missing channels. These are the ones it found.',
    { cols: 92, size: 11, color: INK.mid }) + 14;
  for (const g of gaps) {
    s.stext(x, y, g.level, { size: 11, weight: 700, color: INK.water });
    s.stext(x + 104, y, g.gap, { size: 11.5, weight: 700, color: INK.fire });
    y += 16;
    y = para(s, x + 104, y, g.cost, { cols: 84, size: 10.5, color: INK.mid }) + 14;
  }
  return y;
}
