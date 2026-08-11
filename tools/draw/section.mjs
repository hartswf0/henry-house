// HENRY HOUSE — transverse section generator.
//
// The section is drawn in the Y–Z plane: horizontal axis is the model Y
// coordinate (downhill/view on the LEFT, uphill/cut on the RIGHT), vertical
// axis is Z. Everything is read from the geometry model, including the
// terrain, so the section cannot disagree with the plans.

import { LW, INK } from '../svg.mjs';
import { dim, ft, el } from '../../model/units.mjs';
import G, {
  LEVELS, SITE_SLOPE, ROOFS, ROOF_ASSEMBLY, STRUCTURE, DRAIN_GAP,
  DECKS, BAR, GRID, roofTopAt,
} from '../../model/geometry.mjs';

/** Natural (pre-construction) grade at the cut station. */
const natural = (cutX) => (y) => SITE_SLOPE.grade(cutX, y);

/**
 * Finished grade profile at the cut station, downhill -> uphill.
 * Returns [[y,z], ...]. This is the actual earthwork proposition.
 */
function finishedGrade(cutX) {
  const nat = natural(cutX);
  const motorCourtZ = ft(10) - 8;          // motor court sits just below MAIN FF
  const gapOuter = DRAIN_GAP.y1;            // 4'-0" drained margin ends here
  const courtBack = gapOuter + ft(24);      // 24'-0" motor court
  const pts = [];

  // Downhill: terrace, then reconnect to natural grade below it
  const terr = DECKS[1];
  pts.push([terr.y0 - ft(10), nat(terr.y0 - ft(10))]);
  pts.push([terr.y0 - ft(2), nat(terr.y0 - ft(2))]);
  pts.push([terr.y0, terr.top - 30]);       // face of the terrace retaining wall
  pts.push([terr.y0, terr.top]);            // top of wall
  pts.push([0, terr.top]);                  // terrace runs level to the building
  // Under the building the grade is whatever the foundation sits on
  pts.push([DRAIN_GAP.y0, ft(10) - 30]);
  pts.push([gapOuter - 6, DRAIN_GAP.invert]);   // drain gap floor
  pts.push([gapOuter, DRAIN_GAP.invert]);
  pts.push([gapOuter + 18, motorCourtZ]);       // up to the motor court
  pts.push([courtBack, motorCourtZ]);
  // Cut face behind the motor court, laid back until it meets natural grade
  const slope = 1 / 1.5;                        // 1.5H : 1V
  let y = courtBack, z = motorCourtZ, guard = 0;
  while (z < nat(y) && guard++ < 400) { y += 12; z += 12 * slope; }
  pts.push([y, z]);
  pts.push([y + ft(12), nat(y + ft(12))]);
  return pts;
}

export function drawSection(s, { cutX = 300, id = 'A', showAnnotations = true } = {}) {
  const nat = natural(cutX);
  const fg = finishedGrade(cutX);
  const yLeft = DECKS[1].y0 - ft(10);
  const yRight = fg[fg.length - 1][0];
  const roof = ROOFS.find(r => cutX >= r.x0 && cutX < r.x1) ?? ROOFS[0];

  // ── EARTH ────────────────────────────────────────────────────────────────
  const deep = -ft(9);
  s.earthHatch([...fg, [yRight, deep], [yLeft, deep]], { spacing: 13 });
  s.poly([...fg, [yRight, deep], [yLeft, deep]], { fill: 'none', color: INK.ground, w: LW.medium, close: false });

  // natural grade, dashed — shows exactly how much earth moves
  const natPts = [];
  for (let y = yLeft; y <= yRight; y += 12) natPts.push([y, nat(y)]);
  s.poly(natPts, { fill: 'none', color: INK.ground, w: LW.light, dash: '22 10', close: false });
  s.leader(yRight - ft(6), nat(yRight - ft(6)), -60, -70, 'NATURAL GRADE (ASSUMED 30% — NO SURVEY)');

  // ── BUILDING ─────────────────────────────────────────────────────────────
  const y0 = 0, y1 = ft(26);
  const [L0, L1, L2] = LEVELS;
  const hasUpper = cutX >= 576;

  // foundation + spine wall
  const sp = STRUCTURE.spine;
  s.rect(y1 - 6, sp.zBot, sp.thickness, (hasUpper ? sp.zTopEast : L1.ffe) - sp.zBot,
    { fill: INK.pocheConc, color: INK.line, w: LW.cut });
  s.rect(y1 - sp.footing.w / 2, sp.footing.zTop - sp.footing.d, sp.footing.w, sp.footing.d,
    { fill: INK.pocheConc, color: INK.line, w: LW.cut });
  // downhill foundation
  s.rect(y0 - 6, sp.zBot, 12, L0.ffe - sp.zBot, { fill: INK.pocheConc, color: INK.line, w: LW.cut });
  s.rect(y0 - 15, sp.footing.zTop - sp.footing.d, 30, sp.footing.d, { fill: INK.pocheConc, color: INK.line, w: LW.cut });

  // slab on grade
  s.rect(y0, -5, y1 - y0, 5, { fill: INK.pocheConc, color: INK.line, w: LW.medium });

  // floor structures
  for (const lv of [L1, ...(hasUpper ? [L2] : [])]) {
    s.rect(y0, lv.ffe - lv.floorAssembly, y1 - y0, lv.floorAssembly,
      { fill: INK.poche, color: INK.line, w: LW.medium });
  }

  // exterior walls (downhill mostly glazed, uphill solid)
  // LOWER level downhill wall — the walkout face. Glazed at the slider, solid above.
  s.rect(y0 - BAR.extWall, L0.ffe, BAR.extWall, L1.ffe - L0.floorAssembly - L0.ffe,
    { fill: INK.paper, color: INK.line, w: LW.light });
  s.text(y0 - 30, L0.ffe + 50, 'WALKOUT', { size: 11, anchor: 'middle', color: INK.water, rotate: -90 });
  s.rect(y0 - BAR.extWall, L1.ffe, BAR.extWall, 108, { fill: INK.paper, color: INK.line, w: LW.light });
  s.text(y0 - 30, L1.ffe + 54, 'GLASS', { size: 12, anchor: 'middle', color: INK.water, rotate: -90 });
  s.rect(y1, L1.ffe - 13, BAR.extWall, (roofTopAt(cutX, y1) - ROOF_ASSEMBLY) - L1.ffe + 13,
    { fill: INK.poche, color: INK.line, w: LW.cut });

  // ── ROOF ─────────────────────────────────────────────────────────────────
  const oS = roof.overhang.south, oN = roof.overhang.north;
  const zS = roof.topAtY0 - (roof.pitch / 12) * oS;
  const zN = roof.topAtY1 + (roof.pitch / 12) * oN;
  s.poly([[y0 - oS, zS], [y1 + oN, zN], [y1 + oN, zN - ROOF_ASSEMBLY], [y0 - oS, zS - ROOF_ASSEMBLY]],
    { fill: INK.poche, color: INK.line, w: LW.cut });
  // ceiling line
  s.line(y0, roof.topAtY0 - ROOF_ASSEMBLY, y1, roof.topAtY1 - ROOF_ASSEMBLY,
    { w: LW.light, color: INK.line });

  // ── DECKS AND TERRACE ────────────────────────────────────────────────────
  const deck = DECKS[0], terr = DECKS[1];
  s.rect(deck.y0, deck.top - 14, -deck.y0, 14, { fill: INK.poche, color: INK.line, w: LW.medium });
  s.line(deck.y0, deck.top, deck.y0, deck.top + 42, { w: LW.medium, color: INK.line });
  s.line(deck.y0, deck.top + 42, deck.y0 + 40, deck.top + 42, { w: LW.thin, color: INK.line });
  s.text(deck.y0 / 2, deck.top + 26, 'MAIN DECK — GUARD 42"', { size: 13, anchor: 'middle', color: INK.mid });
  s.rect(terr.y0, terr.top - 6, -terr.y0, 6, { fill: INK.pocheConc, color: INK.line, w: LW.medium });

  // ── SYSTEMS CALLOUTS ─────────────────────────────────────────────────────
  // footing drains — gravity, daylighted
  for (const [dy, dz] of [[y1 + 16, sp.footing.zTop - 6], [y0 - 20, sp.footing.zTop - 6]]) {
    s.circle(dy, dz, 4, { fill: INK.storm, color: INK.storm, w: LW.thin });
  }
  // drain gap
  s.rect(DRAIN_GAP.y0 + 12, DRAIN_GAP.invert, DRAIN_GAP.y1 - DRAIN_GAP.y0 - 12, 26,
    { fill: 'none', color: INK.storm, w: LW.light, dash: '10 6' });

  if (showAnnotations) {
    s.leader(y1 + 6, ft(4), 96, -150, 'CONCRETE SPINE WALL — retains the cut, carries every rib,');
    s.leader(y1 + 6, ft(4) - 26, 96, -128, 'resists lateral load, stores heat. ONE ELEMENT, FOUR JOBS.');
    s.leader(DRAIN_GAP.y0 + 24, DRAIN_GAP.invert + 10, 150, 170, 'THE DRAIN GAP — 4\'-0" drained margin.');
    s.leader(DRAIN_GAP.y0 + 24, DRAIN_GAP.invert - 4, 150, 192, 'The house never touches the cut face.');
    s.leader(y1 + 16, sp.footing.zTop - 6, 110, 60, 'FOOTING DRAIN — DAYLIGHTED BOTH ENDS, NO SUMP.');
    s.leader(y1 + 16, sp.footing.zTop - 20, 110, 82, 'A pump that fails in an ice storm floods the lower level.');
    s.leader(y0 - oS + 10, zS - 8, -190, -150, 'ROOF FALLS DOWNHILL — no roof water is ever');
    s.leader(y0 - oS + 10, zS - 28, -190, -128, 'delivered to the uphill side, where the cut and the');
    s.leader(y0 - oS + 10, zS - 48, -190, -106, 'groundwater problem already are.');
    s.leader(y0 - 30, L1.ffe + 90, -200, -20, 'SNOW RETAINED AT EAVE — deck below.');
  }

  // ── LEVELS AND DIMENSIONS ────────────────────────────────────────────────
  for (const lv of [L0, L1, ...(hasUpper ? [L2] : [])]) {
    s.line(y0 - ft(16), lv.ffe, y1 + ft(6), lv.ffe, { w: LW.hair, color: INK.faint, dash: '30 8 5 8' });
    s.levelTag(y1 + ft(6), lv.ffe, `${lv.short}  ${el(lv.ffe)}`);
  }
  s.dimV(L0.ffe, L1.ffe, y0 - ft(20), null, {});
  if (hasUpper) s.dimV(L1.ffe, L2.ffe, y0 - ft(20), null, {});
  s.dimV(L1.ffe, roof.topAtY0 - ROOF_ASSEMBLY, y0 - ft(26), null, {});
  s.dimH(y0, y1, sp.zBot - ft(4), null, {});

  // ceiling height callouts
  s.text(y1 - 40, roof.topAtY1 - ROOF_ASSEMBLY - 30,
    `${dim(roof.topAtY1 - ROOF_ASSEMBLY - L1.ffe)} CLR`, { size: 15, anchor: 'end', color: INK.accent });
  s.text(y0 + 40, roof.topAtY0 - ROOF_ASSEMBLY - 30,
    `${dim(roof.topAtY0 - ROOF_ASSEMBLY - L1.ffe)} CLR`, { size: 15, color: INK.accent });

  // grid
  for (const g of GRID.y) s.gridBubble(g.v, sp.zBot - ft(7), g.id);

  s.text(y0 - ft(16), sp.zBot - ft(10), `SECTION ${id}—${id}   ·   LOOKING WEST   ·   CUT AT X = ${dim(cutX)}`,
    { size: 24, weight: 700, spacing: 1.5 });
  s.text(y0 - ft(16), sp.zBot - ft(10),
    'Downhill and the view are to the LEFT. The cut is to the RIGHT.', { size: 15, color: INK.mid, dy: 26 });
  return s;
}

// ── LONGITUDINAL SECTION ────────────────────────────────────────────────────
//
// The transverse section explains how the house stands on the hill. It cannot
// explain the thing the plans keep asserting: that this is ONE 122 ft
// composition that steps — bar, link, breezeway, garage — and that the roof
// steps with it. That is a longitudinal cut, and the set did not have one.
//
// Drawn in the X–Z plane at a station in the LIVING zone, so the cut passes
// through the rooms people use rather than the service band behind them.

import { ROOMS, LINK as LNK, GARAGE as GAR, STAIRS as STR, CLERESTORY as CLR,
         FOOTPRINTS as FPS } from '../../model/geometry.mjs';
import { natural as siteNatural, finished as siteFinished } from '../../model/site.mjs';

const ceil = (x, cutY) => roofTopAt(x, cutY) - ROOF_ASSEMBLY;

export function drawSectionLong(s, { cutY = 90, id = 'B' } = {}) {
  const [L0, L1, L2] = LEVELS;
  const x0 = ft(-6), x1 = ft(126);

  // ── GROUND ───────────────────────────────────────────────────────────────
  // A section cut INSIDE the building must show the excavated subgrade, not the
  // finished site surface. Drawing site grade straight across buried the whole
  // lower level in earth that construction removes.
  const CRAWL = L1.ffe - L1.floorAssembly - 42;
  const subgrade = (x) => {
    if (x >= BAR.x0 - BAR.extWall && x <= FPS.L0.x1) return -18;              // under the walkout slab
    if (x > FPS.L0.x1 && x <= BAR.x1 + BAR.extWall) return CRAWL;             // sealed crawl
    if (x > LNK.x0 - 8 && x <= LNK.x1 + 8) return LNK.ffe - 13 - 24;
    if (x > GAR.x0 - 8 && x <= GAR.x1 + 8) return GAR.ffe - 14;
    return siteFinished(x, cutY);
  };
  const fin = [], nat = [];
  for (let x = x0; x <= x1; x += 6) { fin.push([x, subgrade(x)]); nat.push([x, siteNatural(x, cutY)]); }
  const site = [];
  for (let x = x0; x <= x1; x += 6) site.push([x, siteFinished(x, cutY)]);
  const deep = -ft(9);
  s.earthHatch([...fin, [x1, deep], [x0, deep]], { spacing: 14 });
  s.poly(nat, { fill: 'none', color: INK.ground, w: LW.light, dash: '22 10', close: false });
  s.poly(site, { fill: 'none', color: INK.ground, w: LW.hair, dash: '10 7', close: false });
  s.poly(fin, { fill: 'none', color: INK.ground, w: LW.heavy, close: false });

  // ── ROOFS, CUT ───────────────────────────────────────────────────────────
  for (const r of ROOFS) {
    if (cutY < r.y0 || cutY > r.y1) continue;
    const a = r.x0 - r.overhang.west, b = r.x1 + r.overhang.east;
    const zt = roofTopAt((a + b) / 2, cutY);
    s.rect(a, zt - ROOF_ASSEMBLY, b - a, ROOF_ASSEMBLY, { fill: INK.poche, color: INK.line, w: LW.cut });
  }
  // the step, glazed — this is the clerestory in true elevation
  if (cutY >= CLR.y0 && cutY <= CLR.y1) {
    const t = (cutY - CLR.y0) / (CLR.y1 - CLR.y0);
    const zb = CLR.zBotAtY0 + t * (CLR.zBotAtY1 - CLR.zBotAtY0);
    const zT = CLR.zTopAtY0 + t * (CLR.zTopAtY1 - CLR.zTopAtY0);
    s.rect(CLR.x - 18, zb, 18, zT - zb, { fill: '#dfe9ef', color: INK.water, w: LW.cut });
    s.leader(CLR.x - 9, zT, -230, -120, `CLERESTORY — ${CLR.glassArea} SF, GLAZED WEST`);
    s.leader(CLR.x - 9, zT - 22, -230, -98, 'Late summer sun arrives low here and fins shade it poorly.');
    s.leader(CLR.x - 9, zT - 44, -230, -76, 'The one opening on this house facing the wrong way.');
  }

  // ── FLOORS ───────────────────────────────────────────────────────────────
  const bands = [
    { L: L0, x0: FPS.L0.x0, x1: FPS.L0.x1 },
    { L: L1, x0: FPS.L1.x0, x1: FPS.L1.x1 },
    { L: L2, x0: FPS.L2.x0, x1: FPS.L2.x1 },
  ];
  for (const b of bands) {
    s.rect(b.x0, b.L.ffe - b.L.floorAssembly, b.x1 - b.x0, b.L.floorAssembly,
      { fill: INK.poche, color: INK.line, w: LW.cut });
  }
  s.rect(FPS.L0.x0, -5, FPS.L0.x1 - FPS.L0.x0, 5, { fill: INK.pocheConc, color: INK.line, w: LW.medium });
  // sealed conditioned crawl east of the walkout level
  s.rect(FPS.L0.x1, -12, FPS.L1.x1 - FPS.L0.x1, 12, { fill: INK.pocheConc, color: INK.line, w: LW.medium });
  s.text((FPS.L0.x1 + FPS.L1.x1) / 2, 34, 'SEALED, CONDITIONED CRAWL — NOT VENTED',
    { size: 12, anchor: 'middle', color: INK.mid });
  s.rect(LNK.x0, LNK.ffe - 13, LNK.x1 - LNK.x0, 13, { fill: INK.poche, color: INK.line, w: LW.cut });
  s.rect(GAR.x0, GAR.ffe - 6, GAR.x1 - GAR.x0, 6, { fill: INK.pocheConc, color: INK.line, w: LW.cut });

  // ── END WALLS AND THE GAPS BETWEEN VOLUMES ───────────────────────────────
  const wall = (x, zb, zt, t = BAR.extWall) =>
    s.rect(x - t / 2, zb, t, zt - zb, { fill: INK.poche, color: INK.line, w: LW.cut });
  wall(BAR.x0, -ft(3), ceil(BAR.x0 + 6, cutY));
  wall(BAR.x1, -ft(3), ceil(BAR.x1 - 6, cutY));
  wall(LNK.x0 + 5, LNK.ffe - 13, ceil(LNK.x0 + 12, cutY));
  wall(LNK.x1, LNK.ffe - 13, ceil(LNK.x1 - 12, cutY));
  wall(GAR.x0, GAR.ffe - 6, ceil(GAR.x0 + 12, cutY));
  wall(GAR.x1, GAR.ffe - 6, ceil(GAR.x1 - 12, cutY));
  const bw = GAR.breezeway;
  s.rect(bw.x0, GAR.ffe - 6, bw.x1 - bw.x0, 6, { fill: INK.pocheConc, color: INK.line, w: LW.medium });
  s.text((bw.x0 + bw.x1) / 2 - 14, GAR.ffe + 44, 'BREEZEWAY', { size: 13, anchor: 'middle', color: INK.accent, rotate: -90 });
  s.text((bw.x0 + bw.x1) / 2 + 22, GAR.ffe + 44, `${dim(bw.width)} COVERED, UNCONDITIONED`,
    { size: 10, anchor: 'middle', color: INK.fire, rotate: -90 });

  // ── ROOMS ON THE CUT ─────────────────────────────────────────────────────
  for (const [lid, list] of Object.entries(ROOMS)) {
    const L = LEVELS.find(l => l.id === lid);
    const cut = list.filter(r => cutY >= r.y && cutY <= r.y + r.h)
      .map(r => ({ r, cx: r.x + r.w / 2 })).sort((a, b) => a.cx - b.cx);
    // The service spine is a run of narrow rooms; on one line the labels
    // collide into unreadable mush. Stagger onto whichever row is free.
    const rowEnd = [-Infinity, -Infinity];
    for (const { r, cx } of cut) {
      const zTop = lid === 'L0' ? L1.ffe - L1.floorAssembly
                 : lid === 'L1' && FPS.L2.x0 <= cx && cx < FPS.L2.x1 ? L2.ffe - L2.floorAssembly
                 : ceil(cx, cutY);
      const w = Math.max(r.name.length * 7.6, 60) / s.scale;
      const row = cx - w / 2 >= rowEnd[0] ? 0 : (cx - w / 2 >= rowEnd[1] ? 1 : 0);
      rowEnd[row] = cx + w / 2 + 8 / s.scale;
      const zy = L.ffe + 30 + row * 44;
      s.text(cx, zy, r.name, { size: 13, anchor: 'middle', weight: 700, spacing: 0.8 });
      s.text(cx, zy, `${dim(zTop - L.ffe)} CLR`, { size: 11, anchor: 'middle', color: INK.accent, dy: 18 });
    }
  }

  // ── STAIRS ───────────────────────────────────────────────────────────────
  for (const st of STR) {
    if (cutY < st.y || cutY > st.y + st.d) continue;
    const from = LEVELS.find(l => l.id === st.from), to = LEVELS.find(l => l.id === st.to);
    const pts = [[st.x, from.ffe]];
    for (let i = 1; i <= st.runsPerFlight; i++) {
      pts.push([st.x + (i - 1) * st.treadDepth, from.ffe + i * st.riserHeight]);
      pts.push([st.x + i * st.treadDepth, from.ffe + i * st.riserHeight]);
    }
    s.poly(pts, { fill: 'none', color: INK.line, w: LW.medium, close: false });
    s.text(st.x + 20, from.ffe + 62, `${st.id} UP`, { size: 11, color: INK.accent, weight: 700 });
  }

  // ── THE OVERLOOK ─────────────────────────────────────────────────────────
  if (cutY <= 290) {
    s.line(CLR.x, L2.ffe - L2.floorAssembly, CLR.x + 90, L2.ffe - L2.floorAssembly,
      { w: LW.heavy, color: INK.accent });
    s.leader(CLR.x + 45, L2.ffe - L2.floorAssembly, 40, -120,
      'INTERIOR OVERLOOK — the upper hall looks down into the tall wing.');
  }

  // ── LEVELS, GRID, TITLE ──────────────────────────────────────────────────
  for (const L of LEVELS) {
    s.line(x0, L.ffe, x1 + ft(4), L.ffe, { w: LW.hair, color: INK.faint, dash: '30 8 5 8' });
    s.levelTag(x1 + ft(4), L.ffe, `${L.short}  ${el(L.ffe)}`);
  }
  for (const g of GRID.x) s.gridBubble(g.v, -ft(7), g.id);
  s.text(x0, -ft(11), `SECTION ${id}—${id}   ·   LOOKING NORTH   ·   CUT AT Y = ${dim(cutY)}`,
    { size: 24, weight: 700, spacing: 1.5 });
  s.text(x0, -ft(11), 'THE WHOLE 122\'-0" COMPOSITION: BAR, LINK, BREEZEWAY, GARAGE — AND THE ROOF STEPPING WITH IT.',
    { size: 15, color: INK.mid, dy: 26 });
  s.text(x0, -ft(11), 'GRADE FALLS 8% TO THE WEST ALONG THIS CUT. THAT FALL IS WHY THE LOWER LEVEL WALKS OUT AT ONE END AND BECOMES A CRAWL AT THE OTHER.',
    { size: 12, color: INK.mid, dy: 48 });
  return s;
}
