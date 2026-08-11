// HENRY HOUSE — SYSTEMS AS ROUTED NETWORKS.
//
// Not diagrams. Every run below is generated from the actual fixture positions
// in model/fixtures.mjs and routed orthogonally through the service spine and
// the vertical chases, so each one can be asked the three questions the brief
// demands: where does it come from, where does it go, what happens when it fails.
//
// THE BODY, LITERALLY:
//   WATER   arterial — one pump, branching home runs, red hot / blue cold
//   WASTE   venous   — gravity, converging, never crossing the arterial side
//   AIR     airway   — ventilation ducted independently of heating
//   POWER   nerves   — home runs to one brain, with reflex arcs that work
//                      when the brain is offline
//
// ROUTING RULE: everything runs in the SPINE (y >= 185) or in a vertical chase.
// Nothing crosses the living zone, and nothing runs in an exterior wall — at
// this elevation that is a freeze rule, not a preference.

import { LEVELS } from './geometry.mjs';
import { FIXTURES } from './fixtures.mjs';

const L = Object.fromEntries(LEVELS.map(l => [l.id, l]));

/** Vertical chases. The west one serves the bar; the east one the tall wing. */
export const CHASES = [
  { id: 'CH-1', name: 'WEST CHASE — in The Gallery', x: 240, y: 252, w: 14, d: 14,
    from: 'L0', to: 'L1', note: 'water, waste stack, power riser, ERV trunk' },
  { id: 'CH-2', name: 'EAST CHASE — at the stair core', x: 706, y: 252, w: 14, d: 14,
    from: 'L0', to: 'L2', note: 'serves the tall wing and the upper level' },
];

/** Service plane: the floor cavity a run lives in, per level. */
const svc = (lvlId) => L[lvlId].ffe - 8;

/** Which chase serves a given x. */
const chaseFor = (x) => (x < 470 ? CHASES[0] : CHASES[1]);

const SPINE_Y = 252;          // the run line inside the service spine

// ── SOURCES AND SINKS ───────────────────────────────────────────────────────
// ALL POSITIONS ASSUMED — no survey exists. See docs/01-site-facts-register.md.
export const SOURCES = {
  spring:   { id: 'W-SRC', name: 'EXISTING SPRING (ASSUMED)', x: -900, y: 3000, z: 480,
              note: 'Type unverified. If it is a drilled well the gravity backup disappears — A-12.' },
  cistern:  { id: 'W-CIS', name: 'CISTERN 2,500 GAL', x: -240, y: 900, z: 264,
              note: '22 ft above the main floor: enough static head to run one tap and one WC with no pump.' },
  septic:   { id: 'S-TNK', name: 'SEPTIC TANK 1,000 GAL', x: 240, y: -480, z: -60,
              note: 'Location and feasibility UNVERIFIED — requires a soil evaluation. A-15.' },
  pumpTank: { id: 'S-PMP', name: 'PUMP TANK', x: 360, y: -520, z: -60 },
  field:    { id: 'S-FLD', name: 'DRIP DISPERSAL FIELD', x: -600, y: -300, z: 60,
              note: 'Shown uphill of the tank: on steep ground the field often must be PUMPED UP.' },
  utility:  { id: 'E-UTL', name: 'UTILITY SERVICE POINT', x: 1500, y: 700, z: 200 },
};

const seg = (sys, a, b, dia, opts = {}) => ({ sys, a, b, dia, ...opts });

/** Orthogonal route from a fixture to its chase, within the service plane. */
function routeToChase(fx, fy, z, chase) {
  const pts = [];
  pts.push([fx, fy, z]);
  if (Math.abs(fy - SPINE_Y) > 2) pts.push([fx, SPINE_Y, z]);       // into the spine
  if (Math.abs(fx - chase.x) > 2) pts.push([chase.x, SPINE_Y, z]);  // along the spine
  return pts;
}

function chain(sys, pts, dia, opts = {}) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) out.push(seg(sys, pts[i], pts[i + 1], dia, opts));
  return out;
}

// ── WATER — arterial ────────────────────────────────────────────────────────
const NEEDS_WATER = { lav: ['h', 'c'], lav2: ['h', 'c'], sink: ['h', 'c'], tub: ['h', 'c'],
  shower36: ['h', 'c'], shower42: ['h', 'c'], wc: ['c'], dw: ['h'], washer: ['h', 'c'] };

export function waterRuns() {
  const runs = [];
  const manifold = [75, 194, svc('L0') + 26];

  // source -> cistern -> heart. Gravity from the spring; nothing pumped uphill.
  runs.push(...chain('water-src', [
    [SOURCES.spring.x, SOURCES.spring.y, SOURCES.spring.z],
    [SOURCES.cistern.x, SOURCES.cistern.y, SOURCES.cistern.z]], 2,
    { label: '2" HDPE gravity main from the spring, buried below frost' }));
  runs.push(...chain('water-src', [
    [SOURCES.cistern.x, SOURCES.cistern.y, SOURCES.cistern.z],
    [SOURCES.cistern.x, 340, svc('L0')],
    [40, 340, svc('L0')], [40, 280, svc('L0')]], 1.5,
    { label: 'cistern to the pressure tank in The Heart' }));

  // THE GRAVITY REFLEX: one cold tap and one WC fed straight off the cistern,
  // bypassing the pump entirely. Power out, you still have water.
  runs.push(...chain('water-grav', [
    [SOURCES.cistern.x, SOURCES.cistern.y, SOURCES.cistern.z],
    [SOURCES.cistern.x, 300, 120], [200, 300, 120], [250, 272, 118]], 0.75,
    { label: 'GRAVITY BRANCH — bypasses the pump. ~9.5 psi static.' }));

  for (const f of FIXTURES) {
    const need = NEEDS_WATER[f.type];
    if (!need) continue;
    const lvl = L[f.level]; if (!lvl) continue;
    const z = svc(f.level);
    const cx = f.x + f.w / 2, cy = f.y + f.d / 2;
    const ch = chaseFor(cx);
    for (const kind of need) {
      const sys = kind === 'h' ? 'water-hot' : 'water-cold';
      const off = kind === 'h' ? 2 : -2;
      const pts = routeToChase(cx, cy + off, z, ch);
      runs.push(...chain(sys, pts, 0.5, { fixture: f.id }));
      // down the chase to the manifold in The Heart
      if (f.level !== 'L0') {
        runs.push(...chain(sys, [[ch.x, SPINE_Y + off, z], [ch.x, SPINE_Y + off, svc('L0')]], 0.75, { fixture: f.id }));
      }
      runs.push(...chain(sys, [[ch.x, SPINE_Y + off, svc('L0')], [manifold[0], manifold[1] + off, manifold[2]]], 0.75, { fixture: f.id }));
    }
  }
  return runs;
}

// ── WASTE — venous, gravity, converging ─────────────────────────────────────
const DRAINS = { lav: 1.5, lav2: 1.5, sink: 2, tub: 2, shower36: 2, shower42: 2, wc: 3, dw: 1.5, washer: 2 };

export function wasteRuns() {
  const runs = [];
  const buildingDrain = -14;      // invert below the lower slab

  for (const f of FIXTURES) {
    const dia = DRAINS[f.type];
    if (!dia) continue;
    const z = svc(f.level) - 4;   // drains sit below the supply
    const cx = f.x + f.w / 2, cy = f.y + f.d / 2;
    const ch = chaseFor(cx);
    runs.push(...chain('waste', routeToChase(cx, cy - 6, z, ch), dia, { fixture: f.id, fall: '1/4" per foot' }));
    runs.push(...chain('waste', [[ch.x, SPINE_Y - 6, z], [ch.x, SPINE_Y - 6, buildingDrain]], Math.max(dia, 3),
      { fixture: f.id, label: 'stack' }));
    // vent: every stack carries through the roof
    runs.push(...chain('vent', [[ch.x + 6, SPINE_Y - 6, z], [ch.x + 6, SPINE_Y - 6, 350]], 2, { label: 'VTR' }));
  }

  // building drain out to the tank, then pumped to the field
  runs.push(...chain('waste', [
    [CHASES[1].x, SPINE_Y - 6, buildingDrain], [CHASES[0].x, SPINE_Y - 6, buildingDrain],
    [CHASES[0].x, -60, buildingDrain - 6],
    [SOURCES.septic.x, SOURCES.septic.y, SOURCES.septic.z]], 4,
    { label: '4" building drain, 1/4" per foot to the tank' }));
  runs.push(...chain('waste', [
    [SOURCES.septic.x, SOURCES.septic.y, SOURCES.septic.z],
    [SOURCES.pumpTank.x, SOURCES.pumpTank.y, SOURCES.pumpTank.z]], 4, { label: 'tank to pump tank' }));
  runs.push(...chain('waste-pressure', [
    [SOURCES.pumpTank.x, SOURCES.pumpTank.y, SOURCES.pumpTank.z],
    [SOURCES.pumpTank.x, SOURCES.field.y, SOURCES.field.z],
    [SOURCES.field.x, SOURCES.field.y, SOURCES.field.z]], 1.25,
    { label: 'PRESSURE-DOSED to the field. On steep ground this often runs UPHILL — a pump failure backs sewage up, so the high-water float is hardwired and audible, not an app notification.' }));
  return runs;
}

// ── AIR — the airway, ducted independently of heating ───────────────────────
export function airRuns() {
  const runs = [];
  const erv = [101, 290, svc('L0') + 30];
  const ahus = FIXTURES.filter(f => f.type === 'ahu').map(f => ({ f, p: [f.x + f.w / 2, f.y + f.d / 2, svc(f.level) + 24] }));

  // ERV supplies bedrooms and living space; exhausts wet rooms. Separate ducts.
  const supplyTo = ['L1-primary', 'L1-great', 'L0-guest', 'L2-bed2', 'L2-bed3', 'L1-office'];
  const exhaustFrom = ['L1-pbath', 'L0-bath3', 'L2-bath2', 'LK-laundry', 'L1-kitchen'];

  const ROOM_PT = {
    'L1-primary': [105, 95, svc('L1')], 'L1-great': [430, 95, svc('L1')],
    'L0-guest': [356, 95, svc('L0')], 'L2-bed2': [650, 95, svc('L2')],
    'L2-bed3': [790, 95, svc('L2')], 'L1-office': [499, 240, svc('L1')],
    'L1-pbath': [75, 240, svc('L1')], 'L0-bath3': [219, 240, svc('L0')],
    'L2-bath2': [757, 264, svc('L2')], 'LK-laundry': [924, 250, svc('L1')],
    'L1-kitchen': [794, 95, svc('L1')],
  };

  for (const [rid, sysName] of [...supplyTo.map(r => [r, 'air-supply']), ...exhaustFrom.map(r => [r, 'air-exhaust'])]) {
    const p = ROOM_PT[rid]; if (!p) continue;
    const ch = chaseFor(p[0]);
    const off = sysName === 'air-supply' ? 8 : -8;
    runs.push(...chain(sysName, routeToChase(p[0], p[1], p[2] + off, ch), 6, { room: rid }));
    runs.push(...chain(sysName, [[ch.x, SPINE_Y, p[2] + off], [ch.x, SPINE_Y, svc('L0') + off]], 8, { room: rid }));
    runs.push(...chain(sysName, [[ch.x, SPINE_Y, svc('L0') + off], erv], 8, { room: rid }));
  }
  // heating/cooling is a SEPARATE system — one air handler per storey
  for (const { p } of ahus) {
    const ch = chaseFor(p[0]);
    runs.push(...chain('air-hvac', [p, [ch.x, SPINE_Y, p[2]]], 14, { label: 'heat-pump supply trunk' }));
  }
  return runs;
}

// ── POWER — nerves, with reflexes ───────────────────────────────────────────
export function powerRuns() {
  const runs = [];
  const panel = [16, 215, svc('L0') + 40];
  runs.push(...chain('power-service', [
    [SOURCES.utility.x, SOURCES.utility.y, SOURCES.utility.z],
    [SOURCES.utility.x, 500, 40], [200, 500, 40], [40, 340, 20], panel], 2,
    { label: '200A underground in the driveway trench, separated per NEC' }));

  const loads = [
    ['L1', 300, 'lighting + receptacles, main'], ['L0', 200, 'lower level + The Heart'],
    ['L2', 700, 'upper level'], ['L1', 800, 'kitchen small-appliance'],
  ];
  for (const [lvl, x, label] of loads) {
    const ch = chaseFor(x);
    runs.push(...chain('power', [panel, [ch.x, SPINE_Y, svc('L0') + 6],
      [ch.x, SPINE_Y, svc(lvl) + 6], [x, SPINE_Y, svc(lvl) + 6]], 1, { label }));
  }
  // REFLEX ARCS — these must work with the network down
  runs.push(...chain('power-reflex', [[40, 280, svc('L0') + 20], [75, 200, svc('L0') + 20]], 0.75,
    { label: 'leak sensor -> motorised main shutoff. Hardwired: no internet, no cloud, no phone.' }));
  runs.push(...chain('power-reflex', [
    [SOURCES.pumpTank.x, SOURCES.pumpTank.y, SOURCES.pumpTank.z],
    [CHASES[0].x, -60, -20], [40, 260, svc('L0') + 20]], 0.75,
    { label: 'septic high-water float -> hardwired audible alarm' }));
  return runs;
}

export function allRuns() {
  return [...waterRuns(), ...wasteRuns(), ...airRuns(), ...powerRuns()];
}

export const SYSTEM_COLOURS = {
  'water-src': 0x1d6fa5, 'water-cold': 0x2f8fd0, 'water-hot': 0xc0392b, 'water-grav': 0x7fd4ff,
  waste: 0x6b4a2f, 'waste-pressure': 0xa8703f, vent: 0x9b8579,
  'air-supply': 0x2f8f6b, 'air-exhaust': 0x8f6b2f, 'air-hvac': 0x35b08a,
  'power-service': 0xc2801a, power: 0xe0a03a, 'power-reflex': 0xff5f4d,
};

export const SYSTEM_GROUPS = {
  WATER: ['water-src', 'water-cold', 'water-hot', 'water-grav'],
  WASTE: ['waste', 'waste-pressure', 'vent'],
  AIR: ['air-supply', 'air-exhaust', 'air-hvac'],
  POWER: ['power-service', 'power', 'power-reflex'],
};

export default { CHASES, SOURCES, allRuns, waterRuns, wasteRuns, airRuns, powerRuns, SYSTEM_COLOURS, SYSTEM_GROUPS };
