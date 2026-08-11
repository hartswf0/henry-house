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
