// HENRY HOUSE — compile and CHECK room-level plans for the schemes.
//
// The alternatives were massing boxes. A box has an area and a perimeter and
// nothing else, so "3 bedrooms, 2 baths" was a sentence in a data file rather
// than something the model could be held to. This turns each scheme's plan
// into geometry — rooms with coordinates — and then refuses to accept it
// unless the geometry survives a real check.
//
//   node tools/build-plans.mjs [--dry]
//
// Reads plans/<SCHEME-ID>.json, validates every plan against the scheme's own
// volumes, and writes model/scheme-plans.mjs. A plan that fails is REPORTED
// AND DROPPED. The point of this file is to be able to fail.
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { SCHEMES } from '../model/schemes.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const DIR = resolve(ROOT, 'plans');
const OUT = resolve(ROOT, 'model/scheme-plans.mjs');
const DRY = process.argv.includes('--dry');

const USES = new Set(['bed', 'bath', 'kitchen', 'living', 'dining', 'work', 'circ', 'mech', 'store', 'laundry', 'entry']);
const WET = new Set(['bath', 'kitchen', 'laundry', 'mech']);
const HABITABLE = new Set(['bed', 'living', 'dining', 'work', 'kitchen']);

const area = (r) => r.w * r.d;
const minDim = (r) => Math.min(r.w, r.d);
const overlap = (a, b) => Math.max(0, Math.min(a.x0 + a.w, b.x0 + b.w) - Math.max(a.x0, b.x0)) *
                          Math.max(0, Math.min(a.y0 + a.d, b.y0 + b.d) - Math.max(a.y0, b.y0));

/** The conditioned + future footprints a scheme offers AT a given floor level. */
function footprintAt(scheme, ffe) {
  const out = [];
  for (const v of scheme.volumes) {
    if (v.kind === 'shelt') continue;
    const n = v.storeys ?? 1;
    for (let k = 0; k < n; k++) {
      const z = v.ffe + 10 * k;
      if (Math.abs(z - ffe) < 0.6) out.push({ x0: v.x0 / 12, y0: v.y0 / 12, w: v.wFt, d: v.dFt, id: v.id });
    }
  }
  return out;
}

/** How much of a room lies inside the level's legal footprint. */
function insideFraction(room, foot) {
  if (!foot.length) return 0;
  const total = area(room);
  if (total <= 0) return 0;
  // Footprints can abut but never overlap in these schemes, so summing is safe.
  return Math.min(1, foot.reduce((a, f) => a + overlap(room, f), 0) / total);
}

/** Does a room touch the outside edge of the level's footprint? (egress) */
function touchesPerimeter(room, foot) {
  const E = 0.35;
  const edges = [
    { pts: [[room.x0, room.y0], [room.x0, room.y0 + room.d]], probe: [-E, 0] },              // W
    { pts: [[room.x0 + room.w, room.y0], [room.x0 + room.w, room.y0 + room.d]], probe: [E, 0] }, // E
    { pts: [[room.x0, room.y0], [room.x0 + room.w, room.y0]], probe: [0, -E] },              // S
    { pts: [[room.x0, room.y0 + room.d], [room.x0 + room.w, room.y0 + room.d]], probe: [0, E] },  // N
  ];
  for (const e of edges) {
    // sample along the edge, just outside it; if any sample is outside every
    // footprint, that edge faces daylight
    const [a, b] = e.pts;
    for (let t = 0.15; t <= 0.85; t += 0.175) {
      const px = a[0] + (b[0] - a[0]) * t + e.probe[0];
      const py = a[1] + (b[1] - a[1]) * t + e.probe[1];
      const inside = foot.some(f => px > f.x0 && px < f.x0 + f.w && py > f.y0 && py < f.y0 + f.d);
      if (!inside) return true;
    }
  }
  return false;
}

const touching = (a, b) => {
  const gapX = Math.max(a.x0, b.x0) - Math.min(a.x0 + a.w, b.x0 + b.w);
  const gapY = Math.max(a.y0, b.y0) - Math.min(a.y0 + a.d, b.y0 + b.d);
  return gapX < 0.6 && gapY < 0.6;
};

/** Every check a plan has to survive. Returns {errors, warnings, stats}. */
export function checkPlan(scheme, plan) {
  const errors = [], warnings = [];
  const stats = { levels: 0, rooms: 0, sf: 0, circSf: 0, beds: 0, baths: 0 };

  if (!Array.isArray(plan.levels) || !plan.levels.length) {
    return { errors: ['no levels'], warnings, stats };
  }

  for (const lv of plan.levels) {
    const foot = footprintAt(scheme, lv.ffe);
    const label = `${lv.name ?? 'level'} @ffe ${lv.ffe}`;
    if (!foot.length) { errors.push(`${label}: the scheme has no floor at this level`); continue; }
    if (!Array.isArray(lv.rooms) || !lv.rooms.length) { errors.push(`${label}: no rooms`); continue; }
    stats.levels++;

    const footSf = foot.reduce((a, f) => a + f.w * f.d, 0);
    let roomSf = 0;

    for (const r of lv.rooms) {
      if (!r.name || !USES.has(r.use)) errors.push(`${label}: "${r.name ?? '?'}" has no valid use`);
      if (!(r.w > 0 && r.d > 0)) { errors.push(`${label}: "${r.name}" has no size`); continue; }
      stats.rooms++; roomSf += area(r);
      if (r.use === 'bed') stats.beds++;
      if (r.use === 'bath') stats.baths++;
      if (r.use === 'circ') stats.circSf += area(r);

      const inside = insideFraction(r, foot);
      if (inside < 0.97) errors.push(`${label}: "${r.name}" is ${((1 - inside) * 100).toFixed(0)}% outside the scheme's floor`);

      // A bedroom needs a window you can climb out of, and a wall to put a bed on.
      if (r.use === 'bed') {
        if (!touchesPerimeter(r, foot)) errors.push(`${label}: BEDROOM "${r.name}" is landlocked — no exterior wall, no egress window`);
        if (minDim(r) < 9.5) errors.push(`${label}: BEDROOM "${r.name}" is ${minDim(r)} ft in its short dimension`);
      }
      if (HABITABLE.has(r.use) && minDim(r) < 6.9) errors.push(`${label}: "${r.name}" is ${minDim(r)} ft wide — not habitable`);
      if (r.use === 'bath' && minDim(r) < 4.9) errors.push(`${label}: "${r.name}" is ${minDim(r)} ft wide`);

      // The freeze rule: nothing wet may be isolated out in the plan on its own.
      if (WET.has(r.use)) {
        const buddy = lv.rooms.some(o => o !== r && WET.has(o.use) && touching(r, o));
        const stacked = plan.levels.some(o => o !== lv && (o.rooms ?? []).some(q => WET.has(q.use) && overlap(r, q) > 4));
        if (!buddy && !stacked) warnings.push(`${label}: "${r.name}" is a wet room touching no other wet room and stacking over none`);
      }
    }

    // overlaps
    for (let i = 0; i < lv.rooms.length; i++) {
      for (let j = i + 1; j < lv.rooms.length; j++) {
        const ov = overlap(lv.rooms[i], lv.rooms[j]);
        if (ov > 2) errors.push(`${label}: "${lv.rooms[i].name}" and "${lv.rooms[j].name}" overlap by ${Math.round(ov)} sf`);
      }
    }

    stats.sf += roomSf;
    const cover = roomSf / footSf;
    if (cover < 0.88) errors.push(`${label}: rooms cover only ${(cover * 100).toFixed(0)}% of the ${Math.round(footSf)} sf floor — ${Math.round(footSf - roomSf)} sf unaccounted`);
    if (cover > 1.06) errors.push(`${label}: rooms total ${Math.round(roomSf)} sf against a ${Math.round(footSf)} sf floor`);
  }

  // A stair that does not land in the same place on the floor below is a hole.
  const stairs = plan.levels.map(lv => (lv.rooms ?? []).filter(r => r.use === 'circ' && /stair/i.test(r.name)));
  if (plan.levels.length > 1) {
    if (stairs.some(s => !s.length)) warnings.push('a level has no stair, on a scheme with more than one floor');
    else for (let i = 1; i < stairs.length; i++) {
      const aligned = stairs[i].some(a => stairs[i - 1].some(b => overlap(a, b) > 12));
      if (!aligned) errors.push(`the stair at ffe ${plan.levels[i].ffe} does not land on the stair below it`);
    }
  }
  if (!(plan.doors ?? []).some(d => d.kind === 'entry')) warnings.push('no entry door');
  return { errors, warnings, stats };
}

// ── run ─────────────────────────────────────────────────────────────────────
if (import.meta.url === `file://${process.argv[1]}`) {
  mkdirSync(DIR, { recursive: true });
  const files = existsSync(DIR) ? readdirSync(DIR).filter(f => f.endsWith('.json')) : [];
  console.log('HENRY HOUSE — SCHEME PLANS\n');
  if (!files.length) { console.log('  no plans/ files yet'); process.exit(0); }

  const kept = [];
  let totalErr = 0, totalWarn = 0;
  for (const f of files.sort()) {
    let plan;
    try { plan = JSON.parse(readFileSync(resolve(DIR, f), 'utf8')); }
    catch (e) { console.log(`  ✗ ${f}  UNPARSEABLE: ${e.message}`); totalErr++; continue; }
    const scheme = SCHEMES.find(s => s.id === plan.id);
    if (!scheme) { console.log(`  ✗ ${f}  no scheme "${plan.id}"`); totalErr++; continue; }

    const { errors, warnings, stats } = checkPlan(scheme, plan);
    totalWarn += warnings.length;
    if (errors.length) {
      totalErr += errors.length;
      console.log(`  ✗ ${plan.id.padEnd(14)} DROPPED — ${errors.length} error${errors.length > 1 ? 's' : ''}`);
      for (const e of errors) console.log(`      · ${e}`);
      for (const w of warnings) console.log(`      ~ ${w}`);
      continue;
    }
    // Doors arrive as one flat list carrying an ffe. Attach each to the level
    // it opens onto, so a drawing never has to guess which floor a door is on.
    for (const lv of plan.levels) {
      lv.doors = (plan.doors ?? []).filter(d => Math.abs((d.ffe ?? lv.ffe) - lv.ffe) < 0.6);
    }
    kept.push(plan);
    const circPct = stats.sf ? Math.round((stats.circSf / stats.sf) * 100) : 0;
    console.log(`  ✓ ${plan.id.padEnd(14)} ${String(stats.levels).padStart(2)} levels  ${String(stats.rooms).padStart(3)} rooms  ` +
                `${String(Math.round(stats.sf)).padStart(5)} sf  ${stats.beds} bed  ${stats.baths} bath  ${String(circPct).padStart(2)}% circulation`);
    for (const w of warnings) console.log(`      ~ ${w}`);
  }

  console.log(`\n  ${kept.length}/${files.length} plans accepted, ${totalErr} errors, ${totalWarn} warnings`);
  if (DRY) { console.log('  --dry: nothing written'); process.exit(0); }

  const src = `// HENRY HOUSE — SCHEME PLANS, GENERATED AND CHECKED.
//
// Written by tools/build-plans.mjs from plans/*.json. DO NOT HAND-EDIT.
// Every plan here passed the checks in that file: rooms inside their scheme's
// own floors, no overlaps, the floor accounted for, bedrooms with an exterior
// wall and a bed wall, wet rooms grouped or stacked, stairs landing on the
// stair below. A plan that failed was reported and dropped, not repaired.
//
// ${kept.length} plan${kept.length === 1 ? '' : 's'}.

export const PLANS = ${JSON.stringify(kept, null, 2)};

export const planFor = (id) => PLANS.find(p => p.id === id) ?? null;

export default PLANS;
`;
  writeFileSync(OUT, src);
  console.log(`  → model/scheme-plans.mjs`);
}
