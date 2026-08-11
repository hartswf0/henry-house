// HENRY HOUSE — floor plan generator.
// Draws walls, openings, stairs, room tags, dimensions, grid and site-facing
// elements (deck, terrace, drain gap, snow apron) from the model.

import { Sheet, SCALES, LW, INK } from '../svg.mjs';
import { dim, ft } from '../../model/units.mjs';
import G, {
  ROOMS, LEVELS, FOOTPRINTS, GRID, BAR, LINK, GARAGE, STAIRS,
  DECKS, DRAIN_GAP, SNOW, CLERESTORY,
} from '../../model/geometry.mjs';
import { openingsFor, OPEN_EDGES, GARAGE_OPENINGS } from '../../model/openings.mjs';

const EPS = 1.0;

/** Footprint that governs a given room (main bar, or the LINK). */
function fpFor(room, levelId) {
  if (room.link) return { x0: LINK.x0, x1: LINK.x1, y0: LINK.y0, y1: LINK.y1, t: LINK.extWall };
  const fp = FOOTPRINTS[levelId];
  return { ...fp, t: BAR.extWall };
}

/** Draw a rectangular exterior wall band (outer rect minus inner rect). */
function wallBand(s, { x0, y0, x1, y1 }, t, { fill = INK.poche } = {}) {
  const o = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const i = [[x0 + t, y0 + t], [x1 - t, y0 + t], [x1 - t, y1 - t], [x0 + t, y1 - t]];
  const path = [...o, o[0]].map(([x, y], k) => `${k ? 'L' : 'M'} ${s.X(x)} ${s.Y(y)}`).join(' ')
    + ' Z '
    + [...i, i[0]].map(([x, y], k) => `${k ? 'L' : 'M'} ${s.X(x)} ${s.Y(y)}`).join(' ') + ' Z';
  s.raw(`<path d="${path}" fill="${fill}" fill-rule="evenodd" stroke="${INK.line}" stroke-width="${LW.cut}" stroke-linejoin="miter"/>`);
}

/** Interior partitions derived from room rectangles. */
function partitions(s, levelId) {
  for (const r of ROOMS[levelId] ?? []) {
    const fp = fpFor(r, levelId);
    const open = OPEN_EDGES[r.id] ?? [];
    const t = r.use === 'wet' || r.use === 'mech' ? BAR.wetPartition : BAR.partition;
    const edges = [
      ['S', Math.abs(r.y - (fp.y0 + fp.t)) < EPS, [r.x, r.y - t, r.w, t]],
      ['N', Math.abs(r.y + r.h - (fp.y1 - fp.t)) < EPS, [r.x, r.y + r.h, r.w, t]],
      ['W', Math.abs(r.x - (fp.x0 + fp.t)) < EPS, [r.x - t, r.y, t, r.h]],
      ['E', Math.abs(r.x + r.w - (fp.x1 - fp.t)) < EPS, [r.x + r.w, r.y, t, r.h]],
    ];
    for (const [side, isExterior, [bx, by, bw, bh]] of edges) {
      if (isExterior || open.includes(side)) continue;
      s.rect(bx, by, bw, bh, { fill: INK.poche, color: INK.line, w: LW.medium });
    }
  }
}

/** Punch and symbolise all openings for a level. */
function openings(s, levelId, list = null) {
  for (const o of (list ?? openingsFor(levelId))) {
    const ang = o.orient === 'H' ? 0 : 90;
    const t = o.wallT;
    if (o.type === 'door') {
      s.door(o.x, o.y, o.len, ang, { side: o.side, hand: o.hand, wallT: t });
    } else if (o.type === 'slider') {
      s.slider(o.x, o.y, o.len, ang, { wallT: t, panels: o.panels ?? 2 });
    } else if (o.type === 'window' || o.type === 'fixed') {
      s.window(o.x, o.y, o.len, ang, { wallT: t });
    } else if (o.type === 'opening') {
      const ux = o.orient === 'H' ? 1 : 0, uy = o.orient === 'H' ? 0 : 1;
      s.wall(o.x, o.y, o.x + ux * o.len, o.y + uy * o.len, t, { fill: INK.paper, color: INK.paper, w: 0 });
      for (const e of [0, o.len]) {
        const px = o.x + ux * e, py = o.y + uy * e;
        s.line(px - uy * t / 2, py - ux * t / 2, px + uy * t / 2, py + ux * t / 2, { w: LW.medium, color: INK.line });
      }
    } else if (o.type === 'garage') {
      s.wall(o.x, o.y, o.x + o.len, o.y, t, { fill: INK.paper, color: INK.line, w: LW.thin });
      s.line(o.x, o.y, o.x + o.len, o.y, { w: LW.medium, color: INK.line, dash: '14 8' });
    }
  }
}

/** U-stair: two runs + mid landing, with travel arrow and cut break. */
function stair(s, st, { levelId }) {
  const runLen = (st.runsPerFlight - 1) * st.treadDepth;
  const cw = st.clearWidth;
  const x = st.x + 3, y = st.y + 3;
  // If this level is the stair's TOP, you travel down from here.
  const isDown = st.to === levelId;
  const label = isDown ? 'DN' : 'UP';

  // Run A (travelling +Y), Run B (returning -Y)
  const runs = [
    { rx: x, ry: y, dir: +1 },
    { rx: x + cw + 6, ry: y, dir: +1 },
  ];
  for (const { rx } of runs) {
    s.rect(rx, y, cw, runLen, { fill: 'none', color: INK.line, w: LW.light });
    for (let i = 1; i < st.runsPerFlight - 1; i++) {
      const ty = y + i * st.treadDepth;
      s.line(rx, ty, rx + cw, ty, { w: LW.thin, color: INK.mid });
    }
  }
  // landing
  s.rect(x, y + runLen, cw * 2 + 6, st.landingDepth, { fill: 'none', color: INK.line, w: LW.light });

  // travel arrow on the first run
  const ax = x + cw / 2;
  s.line(ax, y + 8, ax, y + runLen - 8, { w: LW.medium, color: INK.accent });
  const tipY = isDown ? y + runLen - 8 : y + 8;
  const back = isDown ? -1 : 1;
  s.poly([[ax, tipY], [ax - 5, tipY + back * 12], [ax + 5, tipY + back * 12]],
    { fill: INK.accent, color: INK.accent, w: LW.thin });
  s.text(ax, isDown ? y + runLen + 14 : y - 22, label, { size: 17, anchor: 'middle', weight: 700, color: INK.accent });

  // plan cut break line across the up-run
  if (!isDown) {
    const by = y + runLen * 0.62;
    s.line(x + cw + 2, by - 10, x + cw * 2 + 10, by + 10, { w: LW.medium, color: INK.line });
    s.line(x + cw + 2, by + 2, x + cw * 2 + 10, by + 22, { w: LW.medium, color: INK.line });
  }
  s.text(st.x + st.w / 2, st.y + st.d + 16, `${st.risers} R @ ${st.riserHeight}"`, { size: 13, anchor: 'middle', color: INK.mid });
}

/** Room name + area tags. */
function roomTags(s, levelId) {
  for (const r of ROOMS[levelId] ?? []) {
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    if (r.stair) continue;
    const [head, tail] = r.name.includes(' — ') ? r.name.split(' — ') : [r.name, null];
    // Shrink the tag until it fits inside the room, so labels never collide.
    const availW = s.L(r.w) - 14;
    const size = Math.max(9, Math.min(20, (availW / Math.max(head.length, 1)) * 1.72));
    s.roomTag(cx, cy, head, r.area, { size });
    if (tail) s.text(cx, cy, tail, { size: size - 5, anchor: 'middle', color: INK.accent, dy: -size - 4 });
  }
}

/** X/Y grid bubbles and gridlines. */
function grid(s, { y0, y1, x0, x1, bubbleBelow, bubbleLeft }) {
  for (const g of GRID.x) {
    if (g.v < x0 - EPS || g.v > x1 + EPS) continue;
    s.line(g.v, y0 - 20, g.v, y1 + 20, { w: LW.hair, color: INK.faint, dash: '34 8 5 8' });
    s.gridBubble(g.v, bubbleBelow, g.id);
  }
  for (const g of GRID.y) {
    s.line(x0 - 20, g.v, x1 + 20, g.v, { w: LW.hair, color: INK.faint, dash: '34 8 5 8' });
    s.gridBubble(bubbleLeft, g.v, g.id);
  }
}

/** Site-facing elements drawn on the MAIN plan. */
function siteElements(s) {
  // drain gap (uphill margin)
  const dg = DRAIN_GAP;
  const h = s.hatchDef('dgap', { angle: 90, spacing: 7, color: INK.storm, w: 0.7 });
  s.rect(dg.x0, dg.y0, dg.x1 - dg.x0, dg.y1 - dg.y0, { fill: h, color: INK.storm, w: LW.light, dash: '12 6' });
  s.text((dg.x0 + dg.x1) / 2, dg.y0 + 26, 'THE DRAIN GAP — 4\'-0" GRAVEL SERVICE MARGIN + TRENCH DRAIN', { size: 15, anchor: 'middle', color: INK.storm, weight: 700 });
  s.text((dg.x0 + dg.x1) / 2, dg.y0 + 26, 'the house never touches the cut face', { size: 13, anchor: 'middle', color: INK.storm, dy: 17 });

  // main deck
  const d1 = DECKS[0];
  s.rect(d1.x0, d1.y0, d1.x1 - d1.x0, d1.y1 - d1.y0, { fill: 'none', color: INK.mid, w: LW.light });
  for (let x = d1.x0 + 6; x < d1.x1; x += 6) s.line(x, d1.y0, x, d1.y1, { w: 0.5, color: INK.faint });
  s.text((d1.x0 + d1.x1) / 2, d1.y0 + 34, 'MAIN DECK', { size: 19, anchor: 'middle', weight: 700, color: INK.mid });

  // snow: free-shed apron (only where nothing is below) + retention over decks
  const ap = SNOW.apron;
  const dots = s.dotDef('snowap', { spacing: 8, r: 1.3, color: INK.light });
  s.rect(ap.x0, ap.y0, ap.x1 - ap.x0, ap.y1 - ap.y0, { fill: dots, color: INK.light, w: LW.hair, dash: '8 6' });
  s.text((ap.x0 + ap.x1) / 2, ap.y0 - 22, 'FREE-SHED APRON — COBBLE', { size: 13, anchor: 'middle', color: INK.mid });
  for (const z of SNOW.retentionZones.filter(z => z.roof === 'RA' || z.roof === 'RB')) {
    s.line(z.x0 + 4, -30, z.x1 - 4, -30, { w: LW.heavy, color: INK.fire });
    for (let x = z.x0 + 12; x < z.x1; x += 24) s.line(x, -36, x, -24, { w: LW.thin, color: INK.fire });
  }
  s.text((ft(24) + ft(72)) / 2, -30, 'SNOW RETENTION AT EAVE — DECK BELOW, SNOW MUST NOT RELEASE', { size: 13, anchor: 'middle', color: INK.fire, dy: -14 });

  // entry bridge
  const br = DECKS[2];
  s.rect(br.x0, br.y0, br.x1 - br.x0, br.y1 - br.y0, { fill: 'none', color: INK.line, w: LW.light });
  s.text((br.x0 + br.x1) / 2, br.y1 + 22, 'ENTRY BRIDGE', { size: 15, anchor: 'middle', weight: 700, color: INK.line });

  // clerestory above (dashed — element above the cut plane)
  s.line(CLERESTORY.x, CLERESTORY.y0, CLERESTORY.x, CLERESTORY.y1, { w: LW.medium, color: INK.accent, dash: '18 8' });
  s.leader(CLERESTORY.x, (CLERESTORY.y0 + CLERESTORY.y1) / 2, -120, -90, 'CLERESTORY OVER (ROOF STEP)');
}

/** Dashed outline of the level above or below, for coordination. */
function ghost(s, levelId, label) {
  const fp = FOOTPRINTS[levelId];
  if (!fp) return;
  s.rect(fp.x0, fp.y0, fp.x1 - fp.x0, fp.y1 - fp.y0, { fill: 'none', color: INK.light, w: LW.light, dash: '22 10' });
  s.text(fp.x0 + 20, fp.y1 - 26, label, { size: 14, color: INK.light });
}

// ── PUBLIC: draw one plan at the sheet's current origin ──────────────────────
export function drawPlan(s, levelId, opts = {}) {
  const fp = FOOTPRINTS[levelId];
  const lvl = LEVELS.find(l => l.id === levelId);

  if (opts.ghostBelow) ghost(s, opts.ghostBelow, 'OUTLINE OF LEVEL BELOW');
  if (opts.ghostAbove) ghost(s, opts.ghostAbove, 'OUTLINE OF LEVEL ABOVE');
  if (opts.site) siteElements(s);

  wallBand(s, fp, BAR.extWall);
  if (opts.link) wallBand(s, { x0: LINK.x0, y0: LINK.y0, x1: LINK.x1, y1: LINK.y1 }, LINK.extWall);
  if (opts.garage) {
    wallBand(s, { x0: GARAGE.x0, y0: GARAGE.y0, x1: GARAGE.x1, y1: GARAGE.y1 }, GARAGE.extWall);
    s.roomTag((GARAGE.x0 + GARAGE.x1) / 2, (GARAGE.y0 + GARAGE.y1) / 2, 'GARAGE', 576, { sub: 'DETACHED — 2 BAYS + SHOP' });
    openings(s, levelId, GARAGE_OPENINGS);
    // breezeway
    s.rect(LINK.x1, 100, GARAGE.x0 - LINK.x1, 140, { fill: 'none', color: INK.light, w: LW.light, dash: '10 6' });
    s.text((LINK.x1 + GARAGE.x0) / 2, 250, 'COVERED', { size: 13, anchor: 'middle', color: INK.mid });
  }

  partitions(s, levelId);
  openings(s, levelId);
  for (const st of STAIRS) {
    const inLevel = (st.from === levelId || st.to === levelId);
    const inFp = st.x >= fp.x0 - EPS && st.x + st.w <= fp.x1 + EPS;
    if (inLevel && inFp) stair(s, st, { levelId });
  }
  roomTags(s, levelId);

  // dimensions
  const dy = opts.dimOffsetY ?? -110;
  s.dimH(fp.x0, fp.x1, fp.y0 + dy, null, {});
  for (let i = 0; i < GRID.x.length - 1; i++) {
    const a = GRID.x[i].v, b = GRID.x[i + 1].v;
    if (a < fp.x0 - EPS || b > fp.x1 + EPS) continue;
    s.dimH(a, b, fp.y0 + dy + 52, null, {});
  }
  s.dimV(fp.y0, fp.y1, fp.x0 - 90, null, {});
  s.dimV(GRID.y[0].v, GRID.y[1].v, fp.x0 - 150, null, {});
  s.dimV(GRID.y[1].v, GRID.y[2].v, fp.x0 - 150, null, {});

  grid(s, {
    x0: fp.x0, x1: fp.x1, y0: fp.y0, y1: fp.y1,
    bubbleBelow: fp.y0 + dy - 78, bubbleLeft: fp.x0 - 230,
  });

  // level tag — placed BELOW the plan and below the dimension strings
  const ty = fp.y0 + dy - (opts.titleDrop ?? 150);
  s.text(fp.x0, ty, `${lvl.name}   ·   FF ${dim(lvl.ffe + 1200)}`, { size: 26, weight: 700, spacing: 1.6 });
  s.text(fp.x0, ty, opts.caption ?? '', { size: 15, color: INK.mid, dy: 26 });
  return s;
}

export { wallBand, partitions, openings, stair, roomTags, grid };
