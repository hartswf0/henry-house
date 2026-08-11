// HENRY HOUSE — COORDINATION CHECKS.
//
// The point of a single model is that it can be interrogated. These checks ask
// the questions a drawing set is supposed to answer and that an empty rectangle
// labelled "BATH — 106 SF" cannot:
//
//   Does the water closet fit, with code clearance to each side and in front?
//   Does the door swing land on it?
//   Can you reach every room, or is there a door to nowhere?
//   Do the wet rooms stack, or does a drain pass through a bedroom?
//   Does every bedroom have an escape window?
//   Does the stair fit the floor-to-floor it actually spans?
//
// Failures print with the numbers so they can be fixed, not admired.

import { ROOMS, LEVELS, FOOTPRINTS, BAR, STAIRS, LINK, ROOFS, ROOF_ASSEMBLY, ceilingAt } from '../../model/geometry.mjs';
import { OPENINGS, OPEN_EDGES } from '../../model/openings.mjs';
import { FIXTURES, CLEARANCE, fixturesFor, fixtureCounts } from '../../model/fixtures.mjs';
import { EXT_STAIR, DECKS } from '../../model/geometry.mjs';
import { dim } from '../../model/units.mjs';

const results = [];
const ok = (cat, msg) => results.push({ level: 'ok', cat, msg });
const warn = (cat, msg) => results.push({ level: 'warn', cat, msg });
const fail = (cat, msg) => results.push({ level: 'fail', cat, msg });

const rectsOverlap = (a, b, tol = 0) =>
  a.x + a.w - tol > b.x && b.x + b.w - tol > a.x &&
  a.y + a.d - tol > b.y && b.y + b.d - tol > a.y;

const box = (f) => ({ x: f.x, y: f.y, w: f.w, d: f.d });
const roomBox = (r) => ({ x: r.x, y: r.y, w: r.w, d: r.h });

const roomFor = (f) => {
  const rooms = ROOMS[f.level] ?? [];
  return rooms.find(r => f.x >= r.x - 6 && f.x + f.w <= r.x + r.w + 6 &&
                         f.y >= r.y - 6 && f.y + f.d <= r.y + r.h + 6);
};

function clearZone(f) {
  const c = f.clear ?? 0;
  if (!c) return null;
  switch (f.face) {
    case 'N': return { x: f.x, y: f.y + f.d, w: f.w, d: c };
    case 'S': return { x: f.x, y: f.y - c, w: f.w, d: c };
    case 'E': return { x: f.x + f.w, y: f.y, w: c, d: f.d };
    case 'W': return { x: f.x - c, y: f.y, w: c, d: f.d };
    default: return null;
  }
}

// ── 1. Every fixture sits inside a room ─────────────────────────────────────
let orphan = 0;
for (const f of FIXTURES) {
  if (f.link) continue;                       // LINK rooms are tracked separately
  if (!roomFor(f)) { fail('FIXTURE-IN-ROOM', `${f.id} (${f.type}) is not inside any room on ${f.level}`); orphan++; }
}
if (!orphan) ok('FIXTURE-IN-ROOM', `all ${FIXTURES.filter(f => !f.link).length} fixtures sit inside a room`);

// ── 2. No two fixtures occupy the same floor ────────────────────────────────
let hits = 0;
const solid = FIXTURES.filter(f => !['rug', 'rod', 'shelf'].includes(f.type));
for (let i = 0; i < solid.length; i++) {
  for (let j = i + 1; j < solid.length; j++) {
    const a = solid[i], b = solid[j];
    if (a.level !== b.level || !!a.link !== !!b.link) continue;
    // a sink and a dishwasher legitimately sit inside the island run
    const nested = ['sink', 'dw'].includes(a.type) || ['sink', 'dw'].includes(b.type);
    if (nested && (a.type === 'island' || b.type === 'island' || a.type === 'base' || b.type === 'base')) continue;
    if (['range', 'fridge'].includes(a.type) && b.type === 'base') continue;
    if (['range', 'fridge'].includes(b.type) && a.type === 'base') continue;
    if (rectsOverlap(box(a), box(b), 1)) { fail('FIXTURE-CLASH', `${a.id} (${a.type}) overlaps ${b.id} (${b.type}) on ${a.level}`); hits++; }
  }
}
if (!hits) ok('FIXTURE-CLASH', 'no two fixtures occupy the same floor area');

// ── 3. Required clear floor space is actually clear ─────────────────────────
let blocked = 0;
for (const f of FIXTURES) {
  const z = clearZone(f);
  if (!z) continue;
  const room = roomFor(f);
  if (room && !f.link) {
    const rb = roomBox(room);
    if (z.x < rb.x - 1 || z.y < rb.y - 1 || z.x + z.w > rb.x + rb.w + 1 || z.y + z.d > rb.y + rb.d + 1) {
      fail('CLEARANCE', `${f.id} (${f.label ?? f.type}): its ${f.clear}" clear space runs outside ${room.name}`);
      blocked++; continue;
    }
  }
  const nestedIn = ['sink', 'dw', 'range', 'fridge'];
  for (const g of solid) {
    if (g.id === f.id || g.level !== f.level || !!g.link !== !!f.link) continue;
    // a sink is set into its island; the clear space is measured beyond the run
    if (nestedIn.includes(f.type) && ['island', 'base'].includes(g.type)) continue;
    if (rectsOverlap(z, box(g), 2)) {
      fail('CLEARANCE', `${f.id} (${f.label ?? f.type}): ${f.clear}" clear space blocked by ${g.id} (${g.type})`);
      blocked++;
    }
  }
}
if (!blocked) ok('CLEARANCE', 'all required clear floor spaces are unobstructed');

// ── 4. Water closet side clearance to centreline ────────────────────────────
let wcBad = 0;
for (const f of FIXTURES.filter(x => x.type === 'wc')) {
  const room = roomFor(f);
  const vert = f.face === 'N' || f.face === 'S';
  const cl = vert ? f.x + f.w / 2 : f.y + f.d / 2;
  const bounds = room && !f.link
    ? (vert ? [room.x, room.x + room.w] : [room.y, room.y + room.h])
    : null;
  if (!bounds) continue;
  const left = cl - bounds[0], right = bounds[1] - cl;
  if (left < CLEARANCE.wcSideToCentre || right < CLEARANCE.wcSideToCentre) {
    fail('WC-CLEARANCE', `${f.id} in ${room.name}: centreline ${left.toFixed(0)}"/${right.toFixed(0)}" from the side walls, needs ${CLEARANCE.wcSideToCentre}" each side`);
    wcBad++;
  }
  for (const g of solid) {
    if (g.id === f.id || g.level !== f.level) continue;
    const gc = vert ? [g.x, g.x + g.w] : [g.y, g.y + g.d];
    const perp = vert ? [g.y, g.y + g.d] : [g.x, g.x + g.w];
    const fperp = vert ? [f.y, f.y + f.d] : [f.x, f.x + f.w];
    if (perp[1] <= fperp[0] || perp[0] >= fperp[1]) continue;
    const d = gc[1] <= cl ? cl - gc[1] : (gc[0] >= cl ? gc[0] - cl : 0);
    if (d < CLEARANCE.wcSideToCentre) {
      fail('WC-CLEARANCE', `${f.id}: only ${d.toFixed(0)}" from centreline to ${g.id} (${g.type}), needs ${CLEARANCE.wcSideToCentre}"`);
      wcBad++;
    }
  }
}
if (!wcBad) ok('WC-CLEARANCE', `all ${FIXTURES.filter(x => x.type === 'wc').length} water closets meet side and front clearance`);

// ── 5. Door swings do not land on a fixture ─────────────────────────────────
let swing = 0;
for (const o of OPENINGS.filter(o => o.type === 'door')) {
  const w = o.len;
  const zone = o.orient === 'H'
    ? { x: o.x, y: o.side > 0 ? o.y : o.y - w, w, d: w }
    : { x: o.side > 0 ? o.x : o.x - w, y: o.y, w, d: w };
  // The swing opens into exactly one room. A fixture on the far side of the
  // wall is not in the way, so only test the room the leaf actually sweeps.
  const cx = zone.x + zone.w / 2, cy = zone.y + zone.d / 2;
  const swingRoom = (ROOMS[o.level] ?? []).find(r =>
    cx >= r.x - 2 && cx <= r.x + r.w + 2 && cy >= r.y - 2 && cy <= r.y + r.h + 2);
  for (const g of solid) {
    if (g.level !== o.level) continue;
    if (['rug'].includes(g.type)) continue;
    if (swingRoom) {
      const inSame = g.x >= swingRoom.x - 6 && g.x + g.w <= swingRoom.x + swingRoom.w + 6 &&
                     g.y >= swingRoom.y - 6 && g.y + g.d <= swingRoom.y + swingRoom.h + 6;
      if (!inSame) continue;
    }
    if (rectsOverlap(zone, box(g), 4)) {
      fail('DOOR-SWING', `${o.id} (${o.room ?? 'door'}) swings onto ${g.id} (${g.label ?? g.type})`);
      swing++;
    }
  }
}
if (!swing) ok('DOOR-SWING', `all ${OPENINGS.filter(o => o.type === 'door').length} door swings are clear of fixtures`);

// ── 6. Every room is reachable — no doors to nowhere, no rooms without doors ─
let unreachable = 0;
for (const [lvl, rooms] of Object.entries(ROOMS)) {
  for (const r of rooms) {
    if (r.stair) continue;   // a stair is reached by its own flight
    const open = (OPEN_EDGES[r.id] ?? []).length > 0;
    const served = OPENINGS.some(o => {
      if (o.level !== lvl) return false;
      if (!['door', 'opening', 'slider'].includes(o.type)) return false;
      const pad = 8;
      const inX = o.x >= r.x - pad && o.x <= r.x + r.w + pad;
      const inY = o.y >= r.y - pad && o.y <= r.y + r.h + pad;
      const onH = o.orient === 'H' && inX && (Math.abs(o.y - r.y) < pad || Math.abs(o.y - (r.y + r.h)) < pad);
      const onV = o.orient === 'V' && inY && (Math.abs(o.x - r.x) < pad || Math.abs(o.x - (r.x + r.w)) < pad);
      return onH || onV;
    });
    if (!open && !served) { fail('ACCESS', `${r.name} (${r.id}) has no door and no open edge — it cannot be entered`); unreachable++; }
  }
}
if (!unreachable) ok('ACCESS', 'every room can be entered');

// ── 7. Wet rooms stack, so drains fall inside the service spine ─────────────
const SPINE_Y = BAR ? 180 : 180;
let offSpine = 0;
for (const [lvl, rooms] of Object.entries(ROOMS)) {
  for (const r of rooms.filter(r => r.use === 'wet' || r.use === 'mech')) {
    if (r.link) continue;
    if (r.y < SPINE_Y - 1) {
      warn('SPINE', `${r.name} (${lvl}) sits in the living zone, not the service spine — its drain must find another route`);
      offSpine++;
    }
  }
}
if (!offSpine) ok('SPINE', 'every wet and mechanical room sits in the service spine');

// ── 8. Every bedroom has an escape window ───────────────────────────────────
let noEero = 0;
for (const [lvl, rooms] of Object.entries(ROOMS)) {
  for (const r of rooms.filter(r => r.use === 'sleeping')) {
    const has = OPENINGS.some(o => o.level === lvl && o.egress &&
      o.x >= r.x - 10 && o.x <= r.x + r.w + 10);
    if (!has) { fail('EGRESS', `${r.name} (${lvl}) has no window marked as an emergency escape opening`); noEero++; }
  }
}
if (!noEero) ok('EGRESS', 'every bedroom has an escape-and-rescue window (dimensions still UNVERIFIED against code)');

// ── 8b. Nothing outside may stand in front of an escape window ──────────────
// The terrace stair was first placed directly in front of W-002, the guest
// bedroom's escape opening. Blocking an EERO is a life-safety fault, not a
// clash, so it gets its own check.
{
  let blockedEero = 0;
  // "Blocking" means standing in the escape path: close to the wall, overlapping
  // the opening in plan, AND overlapping it in height. Testing X alone flagged a
  // stair sitting 5 ft out and 10 ft below a first-floor window.
  const NEAR_WALL = 36;
  const obstructions = [{
    id: EXT_STAIR.id, name: EXT_STAIR.name,
    x0: EXT_STAIR.xBot, x1: EXT_STAIR.xTop,
    y0: EXT_STAIR.y, y1: EXT_STAIR.y + EXT_STAIR.w,
    z0: EXT_STAIR.zBot, z1: EXT_STAIR.zTop,
  }];
  for (const o of OPENINGS.filter(o => o.egress && o.orient === 'H' && o.y <= 12)) {
    const lvl = LEVELS.find(l => l.id === o.level);
    const oz0 = lvl.ffe + o.sill, oz1 = lvl.ffe + o.head;
    for (const ob of obstructions) {
      const nearWall = ob.y1 > -NEAR_WALL;                       // within 3'-0" of the face
      const inPlan = ob.x0 < o.x + o.len && o.x < ob.x1;
      const inHeight = ob.z1 > oz0 && oz1 > ob.z0;
      if (nearWall && inPlan && inHeight) {
        fail('EERO-BLOCKED', `${ob.name} (${ob.id}) stands in the escape path of ${o.id} — ${o.room}`);
        blockedEero++;
      }
    }
  }
  if (!blockedEero) ok('EERO-BLOCKED', 'no exterior construction stands in front of an escape window');
}

// ── 8c. The exterior stair must not climb into the deck framing ─────────────
{
  const st = EXT_STAIR, d1 = DECKS[0];
  const underDeck = st.orientation === 'X'
    ? (st.xTop > d1.x0 + 1 && st.xBot < d1.x1 - 1 && st.y + st.w > d1.y0 && st.y < d1.y1)
    : true;
  if (underDeck) {
    fail('EXT-STAIR', `${st.name} runs beneath the MAIN DECK (deck soffit ~${dim(d1.top - 16)}) — it will climb into the framing`);
  } else ok('EXT-STAIR', `${st.name} rises clear of the deck: nothing overhead`);
  const totalRise = st.risers * st.riserHeight;
  if (Math.abs(totalRise - (st.zTop - st.zBot)) > 0.6) {
    fail('EXT-STAIR', `${st.name}: ${st.risers} @ ${st.riserHeight}" = ${totalRise}" but the rise is ${st.zTop - st.zBot}"`);
  } else ok('EXT-STAIR', `${st.name}: ${st.risers} @ ${st.riserHeight}" = ${dim(totalRise)}, matches terrace to deck`);
}

// ── 9. Stairs fit the floor-to-floor they span ──────────────────────────────
for (const st of STAIRS) {
  const from = LEVELS.find(l => l.id === st.from), to = LEVELS.find(l => l.id === st.to);
  const rise = to.ffe - from.ffe;
  const totalRise = st.risers * st.riserHeight;
  if (Math.abs(totalRise - rise) > 0.5) {
    fail('STAIR', `${st.id}: ${st.risers} risers @ ${st.riserHeight}" = ${totalRise}" but the floor-to-floor is ${rise}"`);
  } else ok('STAIR', `${st.id}: ${st.risers} @ ${st.riserHeight}" = ${dim(totalRise)}, matches floor-to-floor`);
  const runDepth = (st.runsPerFlight - 1) * st.treadDepth + st.landingDepth;
  if (runDepth > st.d + 1) fail('STAIR', `${st.id}: needs ${runDepth.toFixed(1)}" depth but the core is ${st.d}"`);
  else ok('STAIR', `${st.id}: U-stair needs ${runDepth.toFixed(1)}", core is ${st.d}"`);
  const width = st.clearWidth * 2 + 6;
  if (width > st.w + 1) fail('STAIR', `${st.id}: two ${st.clearWidth}" runs need ${width}" but the core is ${st.w}"`);
}

// ── 10. Habitable ceiling height under the shed ─────────────────────────────
for (const R of ROOFS.slice(0, 2)) {
  const lvlFfe = R.id === 'RA' ? LEVELS[1].ffe : LEVELS[2].ffe;
  const low = R.topAtY0 - ROOF_ASSEMBLY - lvlFfe;
  if (low < 84) fail('HEADROOM', `${R.name}: only ${dim(low)} at the low eave`);
  else if (low < 90) warn('HEADROOM', `${R.name}: ${dim(low)} at the low eave — confirm the sloped-ceiling rule`);
  else ok('HEADROOM', `${R.name}: ${dim(low)} at the low eave, ${dim(R.topAtY1 - ROOF_ASSEMBLY - lvlFfe)} at the spine`);
}

// ── report ──────────────────────────────────────────────────────────────────
const counts = fixtureCounts();
const fails = results.filter(r => r.level === 'fail');
const warns = results.filter(r => r.level === 'warn');

console.log('\nHENRY HOUSE — COORDINATION CHECKS\n' + '='.repeat(74));
for (const r of results) {
  const tag = r.level === 'fail' ? 'FAIL' : r.level === 'warn' ? 'WARN' : ' OK ';
  console.log(`[${tag}] ${r.cat.padEnd(16)} ${r.msg}`);
}
console.log('='.repeat(74));
console.log(`FIXTURE COUNT  WC ${counts.wc} · LAV ${counts.lav} · TUB ${counts.tub} · SHOWER ${counts.shower} · SINK ${counts.sink} · WASHER ${counts.washer} · DW ${counts.dw}`);
console.log(`RESULT         ${fails.length} failed, ${warns.length} warnings, ${results.length - fails.length - warns.length} passed`);
console.log('\nNOTE: clearance values are the common IRC/ANSI figures and are UNVERIFIED');
console.log('against the governing NC code edition. See docs/02-code-basis.md.');

process.exitCode = fails.length ? 1 : 0;
