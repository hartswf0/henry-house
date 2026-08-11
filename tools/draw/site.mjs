// HENRY HOUSE — C-101 SITE, GRADING AND ACCESS.
// The drawing that decides whether any of the rest can be built.

import { LW, INK } from '../svg.mjs';
import { ft } from '../../model/units.mjs';
import { FOOTPRINTS, GARAGE, LINK, DECKS, DRAIN_GAP } from '../../model/geometry.mjs';
import { contours, natural, finished, disturbanceBoundary, COURT, driveProfile,
         siteTotals, impervious, DRIVE_LIMITS, DRIVE_SECTION, EROSION } from '../../model/site.mjs';
import { SOURCES } from '../../model/systems.mjs';

/** Project elevation label from a model z in inches. */
const el = (z) => `${(100 + z / 12).toFixed(0)}`;
const box = (s, r, o) => s.rect(r.x0, r.y0, r.x1 - r.x0, r.y1 - r.y0, o);

export function drawSite(s) {
  const d = driveProfile();
  const totals = siteTotals();

  // ── CONTOURS ──────────────────────────────────────────────────────────────
  // Natural dashed, finished solid. Where they separate is where earth moves.
  // Natural grade is a plane, so its contours are parallel straight lines —
  // drawn at 10' only, or they cover the sheet and say nothing.
  for (const c of contours({ surface: natural, interval: 120 })) {
    for (const [a, b] of c.segs) {
      s.line(a[0], a[1], b[0], b[1], { w: LW.hair, color: INK.faint, dash: '14 11' });
    }
    const p = c.segs[2];
    if (p) s.text(p[0][0], p[0][1], el(c.z), { size: 10, color: INK.faint, anchor: 'middle', dy: 4 });
  }
  const fin = contours({ surface: finished, interval: 24 });
  for (const c of fin) {
    for (const [a, b] of c.segs) {
      s.line(a[0], a[1], b[0], b[1], { w: c.major ? LW.light : LW.hair, color: INK.ground, opacity: c.major ? 1 : 0.55 });
    }
    const mid = c.segs[Math.floor(c.segs.length * 0.3)];
    if (c.major && mid) {
      s.text(mid[0][0], mid[0][1], el(c.z), { size: 11, color: INK.ground, anchor: 'middle', weight: 700, dy: 4 });
    }
  }

  // ── LIMITS OF DISTURBANCE ─────────────────────────────────────────────────
  // Traced from the surfaces: the line where finished stops differing from
  // natural. Not a rectangle drawn around the building.
  for (const c of disturbanceBoundary()) {
    for (const [a, b] of c.segs) {
      s.line(a[0], a[1], b[0], b[1], { w: LW.medium, color: '#b8860b', dash: '20 10' });
    }
  }

  // ── THE DRIVE ─────────────────────────────────────────────────────────────
  const W = ft(DRIVE_SECTION.widthFt);
  // cut-slope envelope first, so the pavement reads on top of it
  for (let i = 1; i < d.pts.length; i++) {
    const a = d.pts[i - 1], b = d.pts[i];
    const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1;
    const reachA = Math.max(ft(9), ft(-a.cutFillFt / 0.367 + 9));
    const reachB = Math.max(ft(9), ft(-b.cutFillFt / 0.367 + 9));
    const nx = -dy / L, ny = dx / L;
    s.poly([[a.x + nx * reachA, a.y + ny * reachA], [b.x + nx * reachB, b.y + ny * reachB],
            [b.x - nx * reachB, b.y - ny * reachB], [a.x - nx * reachA, a.y - ny * reachA]],
      { fill: 'none', color: '#b8860b', w: LW.hair, dash: '8 8' });
  }
  for (let i = 1; i < d.pts.length; i++) {
    const a = d.pts[i - 1], b = d.pts[i];
    const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1;
    const nx = (-dy / L) * (W / 2), ny = (dx / L) * (W / 2);
    s.poly([[a.x + nx, a.y + ny], [b.x + nx, b.y + ny], [b.x - nx, b.y - ny], [a.x - nx, a.y - ny]],
      { fill: '#e8e2d6', color: INK.line, w: LW.light });
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    s.text(mx, my, `${Math.abs(d.segs[i - 1].gradePct)}%`,
      { size: 15, anchor: 'middle', color: INK.line, weight: 700, dy: 5 });
  }
  // stations
  for (const p of d.pts) {
    s.circle(p.x, p.y, 8, { fill: INK.paper, color: INK.accent, w: LW.medium });
    s.text(p.x, p.y, `${p.stationFt}`, { size: 11, anchor: 'middle', color: INK.accent, dy: -22, weight: 700 });
    const c = -p.cutFillFt;
    s.text(p.x, p.y, c > 0.2 ? `CUT ${c.toFixed(1)}'` : (c < -0.2 ? `FILL ${(-c).toFixed(1)}'` : 'AT GRADE'),
      { size: 11, anchor: 'middle', color: c > 0.2 ? INK.ground : INK.mid, dy: 32 });
  }
  const last = d.pts[d.pts.length - 1];
  s.circle(last.x, last.y, ft(9), { fill: 'none', color: INK.fire, w: LW.medium, dash: '10 8' });
  s.text(last.x, last.y, 'ASSUMED ROAD CONNECTION', { size: 15, anchor: 'middle', color: INK.fire, weight: 700, dy: -ft(13) });
  s.text(last.x, last.y, 'LOCATION AND ELEVATION UNKNOWN — A-20', { size: 11, anchor: 'middle', color: INK.fire, dy: -ft(9) });

  // ── MOTOR COURT — TWO LIMBS ───────────────────────────────────────────────
  box(s, COURT.main, { fill: '#e8e2d6', color: INK.line, w: LW.light });
  box(s, COURT.apron, { fill: '#e8e2d6', color: INK.line, w: LW.light });
  s.text((COURT.main.x0 + COURT.main.x1) / 2, COURT.main.y1 - ft(6), 'MOTOR COURT + TURNAROUND',
    { size: 16, anchor: 'middle', color: INK.mid, spacing: 1.2 });
  s.text((COURT.apron.x0 + COURT.apron.x1) / 2, COURT.apron.y1 + ft(2), 'GARAGE APRON',
    { size: 14, anchor: 'middle', color: INK.mid, spacing: 1.2 });
  s.text((COURT.apron.x0 + COURT.apron.x1) / 2, COURT.apron.y1 + ft(2),
    `${COURT.backingDepthFt}'-0" BACKING DEPTH`, { size: 11, anchor: 'middle', color: INK.mid, dy: 16 });
  // the backing move the apron exists to permit
  for (const yDoor of [96 + 54, 216 + 54]) {
    const yy = GARAGE.y0 + yDoor;
    s.line(GARAGE.x1, yy, COURT.apron.x1 - ft(4), yy, { w: LW.hair, color: INK.accent, dash: '14 8' });
    s.text(COURT.apron.x1 - ft(4), yy, '>', { size: 20, color: INK.accent, weight: 700, dy: 7 });
  }

  // ── BUILDINGS ─────────────────────────────────────────────────────────────
  const fp = FOOTPRINTS.L1;
  box(s, fp, { fill: INK.poche, color: INK.line, w: LW.cut });
  box(s, LINK, { fill: INK.poche, color: INK.line, w: LW.cut });
  box(s, GARAGE, { fill: INK.poche, color: INK.line, w: LW.cut });
  s.text((fp.x0 + fp.x1) / 2, fp.y0 + ft(9), 'HOUSE', { size: 26, anchor: 'middle', color: INK.paper, weight: 700, spacing: 6 });
  s.text((fp.x0 + fp.x1) / 2, fp.y0 + ft(5), `FF EL ${el(ft(10))}'-0"`, { size: 13, anchor: 'middle', color: '#9aa4ae' });
  s.text((GARAGE.x0 + GARAGE.x1) / 2, (GARAGE.y0 + GARAGE.y1) / 2, 'GARAGE',
    { size: 15, anchor: 'middle', color: INK.paper, weight: 700, dy: 5 });
  // garage doors, on the face the apron serves
  for (const [y0, y1] of [[96, 204], [216, 324]]) {
    s.line(GARAGE.x1, GARAGE.y0 + y0, GARAGE.x1, GARAGE.y0 + y1, { w: LW.cut + 1.5, color: INK.accent });
  }
  for (const dk of DECKS.slice(0, 2)) {
    box(s, dk, { fill: 'none', color: INK.mid, w: LW.light, dash: '12 7' });
  }
  s.text((DECKS[0].x0 + DECKS[0].x1) / 2, DECKS[0].y0 + ft(3), 'DECK / TERRACE', { size: 12, anchor: 'middle', color: INK.mid });
  box(s, DRAIN_GAP, { fill: 'none', color: INK.storm, w: LW.light });
  s.text(DRAIN_GAP.x0 + ft(4), DRAIN_GAP.y0 + 18, 'DRAIN GAP — TRENCH DRAIN, 1% FALL WEST', { size: 11, color: INK.storm, weight: 700 });

  // ── WATER AND WASTE ───────────────────────────────────────────────────────
  const mark = (src, colour, label, sub, dy = 34) => {
    s.circle(src.x, src.y, 16, { fill: INK.paper, color: colour, w: LW.heavy });
    s.text(src.x, src.y, label, { size: 12, anchor: 'middle', color: colour, weight: 700, dy });
    if (sub) s.text(src.x, src.y, sub, { size: 10, anchor: 'middle', color: INK.mid, dy: dy + 14 });
  };
  mark(SOURCES.spring, INK.water, 'EXISTING SPRING', 'YIELD, QUALITY, LEGAL RIGHT — ALL UNKNOWN');
  mark(SOURCES.cistern, INK.water, 'CISTERN 2,500 GAL', 'BURIED, ABOVE THE HOUSE — GRAVITY BRANCH');
  mark(SOURCES.septic, INK.waste, 'SEPTIC TANK', null, -26);
  mark(SOURCES.pumpTank, INK.waste, 'PUMP TANK', null, 34);
  s.line(SOURCES.spring.x, SOURCES.spring.y, SOURCES.cistern.x, SOURCES.cistern.y,
    { w: LW.medium, color: INK.water, dash: '20 8' });
  s.line(SOURCES.septic.x, SOURCES.septic.y, SOURCES.pumpTank.x, SOURCES.pumpTank.y,
    { w: LW.medium, color: INK.waste });
  const fh = s.hatchDef('field', { angle: 0, spacing: 14, color: INK.waste, w: 0.8 });
  s.rect(SOURCES.field.x - ft(30), SOURCES.field.y - ft(18), ft(60), ft(36),
    { fill: fh, color: INK.waste, w: LW.medium, dash: '14 8' });
  s.text(SOURCES.field.x, SOURCES.field.y, 'DRIP DISPERSAL FIELD', { size: 14, anchor: 'middle', color: INK.waste, weight: 700 });
  s.text(SOURCES.field.x, SOURCES.field.y, 'SIZE, SHAPE AND FEASIBILITY ALL UNKNOWN', { size: 11, anchor: 'middle', color: INK.fire, dy: 20 });
  s.text(SOURCES.field.x, SOURCES.field.y, 'NO SOIL EVALUATION EXISTS — A-07', { size: 10, anchor: 'middle', color: INK.mid, dy: 36 });
  s.line(SOURCES.pumpTank.x, SOURCES.pumpTank.y, SOURCES.field.x, SOURCES.field.y,
    { w: LW.medium, color: INK.waste, dash: '10 6' });

  // ── THE SEPARATION THAT DECIDES THE SITE ──────────────────────────────────
  const sep = Math.hypot(SOURCES.spring.x - SOURCES.field.x, SOURCES.spring.y - SOURCES.field.y) / 12;
  s.line(SOURCES.spring.x, SOURCES.spring.y, SOURCES.field.x, SOURCES.field.y,
    { w: LW.thin, color: INK.fire, dash: '8 6' });
  s.text((SOURCES.spring.x + SOURCES.field.x) / 2, (SOURCES.spring.y + SOURCES.field.y) / 2,
    `SPRING TO FIELD ${sep.toFixed(0)}'-0"`, { size: 14, anchor: 'middle', color: INK.fire, weight: 700 });
  s.text((SOURCES.spring.x + SOURCES.field.x) / 2, (SOURCES.spring.y + SOURCES.field.y) / 2,
    'VERIFY REQUIRED SEPARATION — THE FIELD IS UPHILL OF NOTHING BY ACCIDENT',
    { size: 10, anchor: 'middle', color: INK.fire, dy: 16 });

  return { drive: d, totals, imp: impervious(), sep };
}

// ── TYPICAL DRIVE SECTIONS ──────────────────────────────────────────────────
/**
 * A side-hill bench, drawn twice, because the drive is two different roads.
 *
 * Near the road connection the bench BALANCES: cut on the uphill half, fill on
 * the downhill half, corridor barely wider than the pavement. Where the drive
 * leaves the garage apron it is a FULL BENCH IN CUT, and the excavation gets
 * very wide to win 14 ft of road. That difference is the whole reason the
 * corridor figure in the site data is what it is.
 */
const SLOPE_PCT = 30;
export function typicalSection(s, sx, sy, { cutFt, station, title, note, u = 7.6 }) {
  const half = DRIVE_SECTION.widthFt / 2;
  const ditch = DRIVE_SECTION.ditchFt;
  const X = (o) => sx + o * u, Y = (z) => sy - z * u;
  const nat = (o) => cutFt + (SLOPE_PCT / 100) * o;
  const fin = (o) => {
    if (Math.abs(o) <= half) return -Math.abs(o) * 0.02;              // 2% crown
    if (o > half && o <= half + ditch) return -0.5;
    if (o > half + ditch) return Math.min(nat(o), -0.5 + (o - half - ditch) / DRIVE_SECTION.backslope);
    const fill = (o + half) / DRIVE_SECTION.fillslope;
    return nat(o) > 0 ? 0 : Math.max(fill, nat(o));
  };

  const O0 = -46, O1 = 46, step = 0.25;
  const natPts = [], finPts = [];
  for (let o = O0; o <= O1; o += step) { natPts.push([X(o), Y(nat(o))]); finPts.push([X(o), Y(fin(o))]); }

  // cut / fill regions
  const cutH = s.hatchDef('xcut', { angle: 45, spacing: 7, color: '#b8860b', w: 0.6 });
  const fillH = s.hatchDef('xfill', { angle: -45, spacing: 7, color: '#7a8a99', w: 0.6 });
  let run = null, runKind = null;
  const flush = () => {
    if (run && run.length > 3) {
      const back = run.map(p => `${p[1]},${p[2]}`).reverse().join(' ');
      const fwd = run.map(p => `${p[1]},${p[3]}`).join(' ');
      s.raw(`<polygon points="${fwd} ${back}" fill="${runKind === 'cut' ? cutH : fillH}" stroke="none"/>`);
    }
    run = null;
  };
  for (let o = O0; o <= O1; o += step) {
    const d = fin(o) - nat(o);
    const kind = Math.abs(d) < 0.05 ? null : (d < 0 ? 'cut' : 'fill');
    if (kind !== runKind) { flush(); runKind = kind; run = kind ? [] : null; }
    if (run) run.push([o, X(o), Y(nat(o)), Y(fin(o))]);
  }
  flush();

  // earth body below the finished surface, so the section reads as ground
  const soil = s.hatchDef('xsoil', { angle: 45, spacing: 12, color: '#cdbfa8', w: 0.5, cross: true });
  const base = Math.max(...finPts.map(p => p[1])) + 46;
  s.raw(`<polygon points="${finPts.map(p => `${p[0]},${p[1]}`).join(' ')} ${X(O1)},${base} ${X(O0)},${base}" fill="${soil}" stroke="none"/>`);

  s.raw(`<polyline points="${natPts.map(p => `${p[0]},${p[1]}`).join(' ')}" fill="none" stroke="${INK.mid}" stroke-width="${LW.light}" stroke-dasharray="11 8"/>`);
  s.raw(`<polyline points="${finPts.map(p => `${p[0]},${p[1]}`).join(' ')}" fill="none" stroke="${INK.line}" stroke-width="${LW.heavy}"/>`);
  // pavement
  s.raw(`<polygon points="${X(-half)},${Y(fin(-half))} ${X(half)},${Y(fin(half))} ${X(half)},${Y(fin(half)) + 5} ${X(-half)},${Y(fin(-half)) + 5}" fill="#e8e2d6" stroke="${INK.line}" stroke-width="${LW.light}"/>`);
  // centreline
  s.sline(X(0), Y(nat(0)) - 26, X(0), Y(0) + 26, { w: LW.hair, color: INK.accent, dash: '18 5 4 5' });
  s.stext(X(0), Y(nat(0)) - 32, 'CL', { size: 10, anchor: 'middle', color: INK.accent, weight: 700 });
  s.stext(X(O1) - 4, Y(nat(O1)) - 8, `NATURAL ${SLOPE_PCT}%`, { size: 10, anchor: 'end', color: INK.mid });

  // dimensions
  const dy = 40;
  s.sline(X(-half), Y(0) + dy, X(half), Y(0) + dy, { w: LW.thin, color: INK.line });
  s.stext(X(0), Y(0) + dy - 6, `${DRIVE_SECTION.widthFt}'-0" PAVED`, { size: 11, anchor: 'middle', weight: 700 });
  s.sline(X(-half), Y(0) + dy + 20, X(-half + DRIVE_LIMITS.fireWidthFt), Y(0) + dy + 20,
    { w: LW.thin, color: INK.fire, dash: '6 5' });
  s.stext(X(-half + DRIVE_LIMITS.fireWidthFt + 1), Y(0) + dy + 24,
    `${DRIVE_LIMITS.fireWidthFt}'-0" IF FIRE APPARATUS ACCESS IS ENFORCED`, { size: 10, color: INK.fire });

  // daylight reach
  let reach = half;
  for (let o = O0; o <= O1; o += step) if (Math.abs(fin(o) - nat(o)) > 0.05) reach = Math.max(reach, Math.abs(o));
  const top = Math.min(...natPts.concat(finPts).map(p => p[1])) - 26;
  s.sline(X(-reach), top, X(reach), top, { w: LW.thin, color: '#b8860b' });
  for (const o of [-reach, reach]) s.sline(X(o), top - 6, X(o), top + 6, { w: LW.thin, color: '#b8860b' });
  s.stext(X(0), top - 8, `${(reach * 2).toFixed(0)}'-0" DISTURBED CORRIDOR`, { size: 11, anchor: 'middle', color: '#b8860b', weight: 700 });

  const lx = sx - 46 * u;
  s.stext(lx, sy + 118, title, { size: 13, weight: 700, spacing: 1.2 });
  s.stext(lx, sy + 134, `STATION ${station} · CUT AT CENTRELINE ${cutFt.toFixed(1)}'`, { size: 11, color: INK.mid });
  for (const [i, ln] of wrap(note, 52).entries()) s.stext(lx, sy + 152 + i * 14, ln, { size: 10.5, color: INK.mid });
  s.stext(lx, top - 30, `BACKSLOPE ${DRIVE_SECTION.backslope}H:1V · FILL ${DRIVE_SECTION.fillslope}H:1V · ${DRIVE_SECTION.ditchFt}'-0" DITCH · SECTION 1"=10'`,
    { size: 10, color: INK.mid });
  return sy + 190;
}

// ── LEGEND ──────────────────────────────────────────────────────────────────
export function siteLegend(s, sx, sy) {
  const items = [
    ['line', INK.faint, '14 11', 'ASSUMED NATURAL CONTOUR — 10\' INTERVAL'],
    ['line', INK.ground, null, 'FINISHED CONTOUR — 2\' INTERVAL'],
    ['line', '#b8860b', '20 10', 'LIMIT OF DISTURBANCE — TRACED, NOT DRAWN'],
    ['line', '#b8860b', '8 8', 'DRIVE CUT/FILL SLOPE ENVELOPE'],
    ['fill', '#e8e2d6', null, 'PAVED — DRIVE, COURT, APRON'],
    ['fill', INK.poche, null, 'BUILDING'],
    ['line', INK.water, '20 8', 'WATER — SPRING TO CISTERN'],
    ['line', INK.waste, null, 'WASTE — TANK, PUMP, FIELD'],
    ['line', INK.accent, '14 8', 'VEHICLE BACKING MOVE'],
  ];
  s.stext(sx, sy, 'LEGEND', { size: 15, weight: 700, spacing: 1.6 });
  let y = sy + 26;
  for (const [kind, colour, dash, label] of items) {
    if (kind === 'line') s.sline(sx, y - 4, sx + 46, y - 4, { w: LW.medium, color: colour, dash });
    else s.srect(sx, y - 12, 46, 12, { fill: colour, color: INK.line, lw: LW.hair });
    s.stext(sx + 60, y, label, { size: 11.5, color: INK.mid });
    y += 21;
  }
  return y;
}

// ── DRIVEWAY PROFILE ────────────────────────────────────────────────────────
/**
 * Station/elevation strip. Vertical exaggeration is stated, because a profile
 * drawn at true scale on a 655 ft drive is a flat line and tells you nothing.
 */
export function driveProfileStrip(s, sx, sy, w, h, r) {
  const d = r.drive;
  const z0 = Math.min(...d.pts.map(p => Math.min(p.z, p.groundZ))) / 12;
  const z1 = Math.max(...d.pts.map(p => Math.max(p.z, p.groundZ))) / 12;
  const pad = 4;
  const lo = z0 - pad, hi = z1 + pad;
  const PX = (st) => sx + (st / d.lengthFt) * w;
  const PY = (zf) => sy + h - ((zf - lo) / (hi - lo)) * h;
  const vex = (h / (hi - lo)) / (w / d.lengthFt);

  s.srect(sx, sy, w, h, { fill: '#fbfaf7', color: INK.faint, lw: LW.hair });
  // elevation grid
  for (let z = Math.ceil(lo / 10) * 10; z <= hi; z += 10) {
    s.sline(sx, PY(z), sx + w, PY(z), { w: LW.hair, color: INK.faint });
    s.stext(sx - 8, PY(z) + 4, `${(100 + z).toFixed(0)}`, { size: 11, color: INK.mid, anchor: 'end' });
  }
  // station grid
  for (let st = 0; st <= d.lengthFt; st += 100) {
    s.sline(PX(st), sy, PX(st), sy + h, { w: LW.hair, color: INK.faint });
    s.stext(PX(st), sy + h + 18, `${st}`, { size: 11, color: INK.mid, anchor: 'middle' });
  }
  // natural ground along the alignment
  const gpts = d.pts.map(p => `${PX(p.stationFt)},${PY(p.groundZ / 12)}`).join(' ');
  s.raw(`<polyline points="${gpts}" fill="none" stroke="${INK.ground}" stroke-width="${LW.light}" stroke-dasharray="10 7"/>`);
  // designed pavement
  const dpts = d.pts.map(p => `${PX(p.stationFt)},${PY(p.z / 12)}`).join(' ');
  s.raw(`<polyline points="${dpts}" fill="none" stroke="${INK.line}" stroke-width="${LW.heavy}"/>`);
  // cut hatch between them
  for (const p of d.pts) {
    if (-p.cutFillFt > 0.3) s.sline(PX(p.stationFt), PY(p.z / 12), PX(p.stationFt), PY(p.groundZ / 12),
      { w: LW.hair, color: '#b8860b' });
  }
  for (let i = 1; i < d.pts.length; i++) {
    const a = d.pts[i - 1], b = d.pts[i];
    s.stext((PX(a.stationFt) + PX(b.stationFt)) / 2, PY((a.z + b.z) / 24) - 10,
      `${d.segs[i - 1].gradePct}%`, { size: 12, anchor: 'middle', weight: 700, color: INK.line });
    s.stext(PX(b.stationFt), sy + h - 8, `SB${i}`, { size: 10, anchor: 'middle', color: INK.accent });
  }
  s.stext(sx, sy - 30, 'DRIVEWAY PROFILE — MOTOR COURT TO ASSUMED ROAD', { size: 15, weight: 700, spacing: 1.6 });
  s.stext(sx, sy - 12, `HORIZONTAL 1" = ${(d.lengthFt / (w / 100)).toFixed(0)}' · VERTICAL EXAGGERATION ${vex.toFixed(1)}x · SB = SWITCHBACK`,
    { size: 11, color: INK.mid });
  s.stext(sx + w, sy + h + 18, 'STATION (FT)', { size: 11, color: INK.mid, anchor: 'end' });
  return sy + h + 30;
}

// ── DATA + THE VERDICT ──────────────────────────────────────────────────────
export function siteData(s, sx, sy, r) {
  const t = r.totals;
  const rows = [
    ['DRIVEWAY', ''],
    ['  length', `${r.drive.lengthFt} ft`],
    ['  total rise', `${r.drive.totalRiseFt} ft`],
    ['  design grade, held', `${r.drive.maxGradePct}%`],
    ['  terrain grade followed', `${r.drive.groundGradePct}%`],
    ['  switchbacks', `${r.drive.switchbacks}`],
    ['  deepest cut at centreline', `${r.drive.maxCutFt} ft`],
    ['  daylights at the road', r.drive.daylightsAtRoad ? 'yes' : 'NO'],
    ['', ''],
    ['EARTHWORK', ''],
    ['  pad cut / fill', `${t.pad.cutCY} / ${t.pad.fillCY} CY`],
    ['  drive cut / fill', `${t.drive.cutCY} / ${t.drive.fillCY} CY`],
    ['  NET SPOIL', `${t.netCY} CY`],
    ['  tandem loads off site', `~${t.truckloads}`],
    ['  deepest cut, pad', `${t.pad.maxCutFt} ft`],
    ['  widest drive corridor', `${t.drive.maxCorridorWidthFt} ft`],
    ['', ''],
    ['AREAS', ''],
    ['  disturbed, pad', `${t.pad.disturbedAcres} ac`],
    ['  disturbed, drive', `${t.drive.disturbedAcres} ac`],
    ['  DISTURBED, TOTAL', `${t.disturbedAcres} ac`],
    ['  impervious', `${r.imp.totalSf} sf / ${r.imp.totalAcres} ac`],
  ];
  s.stext(sx, sy, 'SITE DATA — COMPUTED, NOT ASSERTED', { size: 15, weight: 700, spacing: 1.6 });
  let y = sy + 28;
  for (const [k, v] of rows) {
    if (!k) { y += 10; continue; }
    const head = !k.startsWith('  ');
    const loud = k === k.toUpperCase() && !head;
    s.stext(sx, y, k, { size: 12.5, color: head || loud ? INK.line : INK.mid, weight: head || loud ? 700 : 400 });
    s.stext(sx + 340, y, v, { size: 12.5, color: INK.line, anchor: 'end', weight: loud ? 700 : 400 });
    y += 18;
  }

  // ── THE THREE THINGS THIS DRAWING DECIDES ─────────────────────────────────
  y += 22;
  s.stext(sx, y, 'WHAT THIS SHEET DECIDES', { size: 15, weight: 700, spacing: 1.6 }); y += 26;
  const verdicts = [
    r.drive.overFireLimit
      ? [INK.fire, 'FIRE APPARATUS ACCESS FAILS',
         `The drive holds ${r.drive.maxGradePct}%. Fire apparatus access provisions commonly cap grade at ${DRIVE_LIMITS.fireApparatusPct}% and require ${DRIVE_LIMITS.fireWidthFt}' of width. At ${DRIVE_LIMITS.fireApparatusPct}% this drive becomes ${Math.round(r.drive.totalRiseFt / 0.10)} ft long. That is the trade: a longer, more expensive drive, or a sprinkler system and a fire marshal's variance. THIS IS A DECISION FOR HENRY, NOT A DETAIL.`]
      : [INK.line, 'FIRE APPARATUS ACCESS — WITHIN LIMIT', 'Grade is at or under the commonly-required maximum.'],
    t.overErosionThreshold
      ? [INK.fire, `EROSION CONTROL PLAN REQUIRED — ${t.disturbedAcres} AC DISTURBED`,
         `Pad and drive together exceed the ${EROSION.ncThresholdAcres} acre threshold commonly cited for the NC Sedimentation Pollution Control Act. The pad ALONE reads at ${t.pad.disturbedAcres} ac and looks safe; the driveway corridor is what crosses the line. A delegated county program may trigger LOWER. ${EROSION.status}`]
      : [INK.line, 'DISTURBANCE UNDER THRESHOLD', `${t.disturbedAcres} ac.`],
    [INK.fire, `EARTHWORK DOES NOT BALANCE — ${t.netCY} CY OF SPOIL`,
     `Drawing A-201 note 2 claims cut and fill are roughly balanced on site. The model says otherwise: ${t.cutCY} CY of cut against ${t.fillCY} CY of fill. Roughly ${t.truckloads} tandem loads down a mountain road, and no designed place to put any of it. Sidecasting spoil onto a 30% colluvial slope is how mountain fills fail. Spoil placement is a GEOTECHNICAL question and it is unanswered.`],
  ];
  for (const [colour, head, body] of verdicts) {
    s.stext(sx, y, head, { size: 13, weight: 700, color: colour, spacing: 0.6 }); y += 18;
    for (const ln of wrap(body, 58)) { s.stext(sx, y, ln, { size: 11, color: INK.mid }); y += 14; }
    y += 12;
  }
  return y;
}

function wrap(str, n) {
  const words = String(str).split(/\s+/); const out = []; let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > n) { out.push(line); line = w; }
    else line = (line ? line + ' ' : '') + w;
  }
  if (line) out.push(line);
  return out;
}
