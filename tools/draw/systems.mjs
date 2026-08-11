// HENRY HOUSE — systems sheets.
// Plans overlaid with the ACTUAL routed runs from model/systems.mjs, so the
// schematic and the 3D model and the clash check are the same network.

import { LW, INK } from '../svg.mjs';
import { dim, ft } from '../../model/units.mjs';
import { ROOMS, LEVELS, FOOTPRINTS, BAR, GRID } from '../../model/geometry.mjs';
import { allRuns, CHASES, SOURCES, SYSTEM_COLOURS, SYSTEM_GROUPS } from '../../model/systems.mjs';
import { fixturesFor } from '../../model/fixtures.mjs';

const L = Object.fromEntries(LEVELS.map(l => [l.id, l]));

/** Which level a z belongs to — runs sit in the floor cavity of their level. */
function levelOfZ(z) {
  let best = null, bd = 1e9;
  for (const l of LEVELS) {
    const d = Math.abs(z - (l.ffe - 8));
    if (d < bd) { bd = d; best = l.id; }
  }
  return bd < 40 ? best : null;
}

/** Background: the plan, drawn light so the network reads on top of it. */
function ghostPlan(s, levelId) {
  const fp = FOOTPRINTS[levelId];
  const T = BAR.extWall;
  s.rect(fp.x0, fp.y0, fp.x1 - fp.x0, fp.y1 - fp.y0, { fill: 'none', color: INK.light, w: LW.medium });
  s.rect(fp.x0 + T, fp.y0 + T, fp.x1 - fp.x0 - 2 * T, fp.y1 - fp.y0 - 2 * T,
    { fill: 'none', color: INK.faint, w: LW.thin });
  for (const r of ROOMS[levelId] ?? []) {
    if (r.link) continue;
    s.rect(r.x, r.y, r.w, r.h, { fill: 'none', color: INK.faint, w: LW.hair });
    s.text(r.x + r.w / 2, r.y + r.h / 2, r.name.split(' — ')[0],
      { size: 10, anchor: 'middle', color: INK.faint });
  }
  // the service spine, which is where everything is supposed to run
  const h = s.hatchDef(`spine${levelId}`, { angle: 45, spacing: 14, color: INK.faint, w: 0.5 });
  s.rect(fp.x0, ft(15), fp.x1 - fp.x0, ft(26) - ft(15), { fill: h, color: 'none', w: 0 });
  s.text(fp.x0 + 20, ft(15) + 20, 'SERVICE SPINE', { size: 11, color: INK.light, spacing: 1.4 });
}

/** Vertical chases, shown on every level because they pass through. */
function chases(s) {
  for (const c of CHASES) {
    s.rect(c.x - c.w, c.y - c.d, c.w * 2, c.d * 2, { fill: INK.paper, color: INK.accent, w: LW.medium });
    s.line(c.x - c.w, c.y - c.d, c.x + c.w, c.y + c.d, { w: LW.thin, color: INK.accent });
    s.line(c.x + c.w, c.y - c.d, c.x - c.w, c.y + c.d, { w: LW.thin, color: INK.accent });
    s.text(c.x, c.y - c.d - 12, c.id, { size: 11, anchor: 'middle', color: INK.accent, weight: 700 });
  }
}

/**
 * Draw one system group on one level.
 * Runs whose two ends sit on different levels are drawn as risers (a circle).
 */
export function drawSystemPlan(s, levelId, groupName, opts = {}) {
  const systems = SYSTEM_GROUPS[groupName];
  ghostPlan(s, levelId);
  chases(s);

  const runs = allRuns().filter(r => systems.includes(r.sys));
  let drawn = 0, risers = 0;

  for (const r of runs) {
    const la = levelOfZ(r.a[2]), lb = levelOfZ(r.b[2]);
    const vertical = Math.abs(r.a[0] - r.b[0]) < 2 && Math.abs(r.a[1] - r.b[1]) < 2;
    const colour = `#${(SYSTEM_COLOURS[r.sys] ?? 0x888888).toString(16).padStart(6, '0')}`;
    const w = Math.max(LW.thin, Math.min(LW.heavy, r.dia * 1.1));

    if (vertical) {
      // a riser: show it as a circle wherever it passes this level
      const zLo = Math.min(r.a[2], r.b[2]), zHi = Math.max(r.a[2], r.b[2]);
      const lz = L[levelId].ffe - 8;
      if (zLo - 30 <= lz && lz <= zHi + 30) {
        s.circle(r.a[0], r.a[1], 5, { color: colour, w: LW.medium });
        s.circle(r.a[0], r.a[1], 2, { fill: colour, color: colour, w: LW.thin });
        risers++;
      }
      continue;
    }
    if (la !== levelId && lb !== levelId) continue;
    s.line(r.a[0], r.a[1], r.b[0], r.b[1], { w, color: colour });
    drawn++;
  }

  // fixtures this system actually serves
  for (const f of fixturesFor(levelId)) {
    if (f.link) continue;
    const serves = groupName === 'WATER' || groupName === 'WASTE'
      ? ['wc', 'lav', 'lav2', 'tub', 'shower36', 'shower42', 'sink', 'dw', 'washer', 'hpwh'].includes(f.type)
      : groupName === 'AIR' ? ['erv', 'ahu'].includes(f.type)
      : ['panel', 'battery', 'ahu', 'hpwh'].includes(f.type);
    if (!serves) continue;
    s.rect(f.x, f.y, f.w, f.d, { fill: 'none', color: INK.line, w: LW.light });
    if (f.label) s.text(f.x + f.w / 2, f.y + f.d / 2, f.label, { size: 8.5, anchor: 'middle', color: INK.mid });
  }

  // sources and sinks that fall on this sheet
  for (const src of Object.values(SOURCES)) {
    if (Math.abs(src.x) > 3000 || Math.abs(src.y) > 3000) continue;
    s.circle(src.x, src.y, 10, { fill: INK.paper, color: INK.line, w: LW.medium });
    s.text(src.x, src.y - 20, src.name, { size: 10, anchor: 'middle', color: INK.line, weight: 700 });
  }

  return { drawn, risers, total: runs.length };
}

/** Colour key + the failure note — the column that makes it a design, not a diagram. */
export function systemLegend(s, sx, sy, groupName, note) {
  s.stext(sx, sy, `${groupName} — KEY`, { size: 15, weight: 700, spacing: 1.8 });
  let y = sy + 26;
  for (const sys of SYSTEM_GROUPS[groupName]) {
    const colour = `#${(SYSTEM_COLOURS[sys] ?? 0x888888).toString(16).padStart(6, '0')}`;
    s.sline(sx, y - 4, sx + 34, y - 4, { w: LW.heavy, color: colour });
    s.stext(sx + 44, y, sys, { size: 12, color: INK.mid });
    y += 19;
  }
  y += 8;
  s.sline(sx, y - 8, sx + 300, y - 8, { w: LW.hair, color: INK.faint });
  s.stext(sx, y + 10, 'WHEN IT FAILS', { size: 12, weight: 700, color: INK.fire, spacing: 1.4 });
  y += 28;
  for (const line of note) { s.stext(sx, y, line, { size: 11.5, color: INK.mid }); y += 16; }
}

export const FAILURE_NOTES = {
  WATER: [
    'Power out: the GRAVITY BRANCH still delivers one cold tap and one WC.',
    'It leaves the cistern and never touches the pump — about 9.5 psi of',
    'static head. One pipe and one valve.',
    'Pump fails: same branch. Cistern empty: the spring refills by gravity.',
    'Freeze: no pipe runs in an exterior wall, anywhere, at any level.',
  ],
  WASTE: [
    'Gravity to the tank, so a power cut does not stop the house draining.',
    'The dispersal field sits ABOVE the pump tank — on ground this steep the',
    'effluent often has to be pumped uphill. That inverts the usual logic:',
    'a pump failure now backs sewage UP rather than merely stopping it.',
    'So the high-water float is hardwired and audible in the house — not an',
    'app notification, which is not an alarm.',
  ],
  AIR: [
    'Ventilation is ducted INDEPENDENTLY of heating. The common alternative',
    'dumps fresh air into a furnace return, which only ventilates when the',
    'furnace runs — in a house this tight, rarely.',
    'ERV fails: bath and kitchen exhaust still run; windows still open.',
    'Heat pump fails: the wood stove has dedicated outside combustion air.',
  ],
  POWER: [
    'Utility out: battery, then the standby generator, behind a critical-loads',
    'panel — well pump, septic pump, ERV, refrigerator, comms, one heat zone.',
    'REFLEX ARCS run with the network down and the brain offline:',
    '  leak sensor  -> motorised main shutoff   (hardwired)',
    '  freeze stat  -> local alarm + heat       (hardwired)',
    '  septic float -> audible alarm            (hardwired)',
    'A safety function that needs the internet is not a safety function.',
  ],
};
