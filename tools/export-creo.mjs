// HENRY HOUSE → CREO. THE SCHEMES, ON THE REAL PARCEL.
//
// Until now these houses stood on a synthetic 30% plane at an arbitrary origin.
// Nothing in the model carried a coordinate, so "the house at the Henry
// property" was not a thing that could be said, let alone drawn. The client
// gave 36°17'14.2"N 81°55'30.4"W; CREO already holds that place, with real
// terrain and the Watauga River in it. This puts one into the other.
//
//   node tools/export-creo.mjs <place.json>              all eleven, along the contour
//   node tools/export-creo.mjs <place.json> --only=S0-SPINE     one, on the anchor
//   node tools/export-creo.mjs <place.json> --write      write it back
//
// WHAT IS EXPORTED. One entity per LEVEL per scheme, taken from the checked
// plan in model/scheme-plans.mjs — the only description of these houses that
// has been verified. Not the volumes, which are massing.
//
// ORIENTATION. Read the comment on ORIENTATION in model/geometry.mjs before
// changing the default here. The houses are laid on the REAL contour, which
// means each one's uphill face points at azimuth 185° — south. Their glazing
// therefore faces NORTH, which is what the parcel does to this design and the
// thing docs/09 is about. The export does not hide it by spinning the house;
// you are meant to look at the north glass and decide what to do.
import { readFileSync, writeFileSync } from 'node:fs';
import { PLANS } from '../model/scheme-plans.mjs';
import { SITE } from '../model/geometry.mjs';

const M_PER_IN = 0.0254;
const ft = (n) => n * 12;
const PLATE = 106;                 // wall top above ffe, inches — model/schemes.mjs

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith('--'));
const only = (args.find((a) => a.startsWith('--only=')) || '').split('=')[1];
const write = args.includes('--write');
if (!file) {
  console.error('usage: node tools/export-creo.mjs <place.json> [--only=ID] [--write]');
  process.exit(2);
}

const doc = JSON.parse(readFileSync(file, 'utf8'));
const place = doc.place;
if (!place?.terrain) { console.error('that place has no terrain'); process.exit(1); }

// ── the ground, read the way CREO reads it ──────────────────────────────────
// Heights are stored relative to meta.datum, so an entity's zBase is too. The
// compact form is base64 Float32; the legacy form is a plain array. Both exist.
const T = place.terrain;
const heights = T.f32
  ? new Float32Array(Uint8Array.from(Buffer.from(T.f32, 'base64')).buffer)
  : Float32Array.from(T.data);
const cell = T.cell;
const nx = Math.round((T.bounds[2] - T.bounds[0]) / cell) + 1;
const ny = Math.round((T.bounds[3] - T.bounds[1]) / cell) + 1;
/** Bilinear ground height, metres above meta.datum, at local (east, north). */
function groundAt(e, n) {
  const fx = (e - T.bounds[0]) / cell, fy = (n - T.bounds[1]) / cell;
  const i = Math.max(0, Math.min(nx - 2, Math.floor(fx)));
  const j = Math.max(0, Math.min(ny - 2, Math.floor(fy)));
  const u = Math.max(0, Math.min(1, fx - i)), v = Math.max(0, Math.min(1, fy - j));
  const H = (a, b) => heights[b * nx + a] ?? 0;
  return (H(i, j) * (1 - u) + H(i + 1, j) * u) * (1 - v) +
         (H(i, j + 1) * (1 - u) + H(i + 1, j + 1) * u) * v;
}

// ── the frame ───────────────────────────────────────────────────────────────
// CREO local metres are +x EAST, +y NORTH (makeProjection in creo3/src/core/
// geom.js). The model is +y UPHILL, +x along the contour, and in INCHES.
// Uphill is the reverse of the fall, and +x sits 90° from +y — the same
// relation ORIENTATION already asserts (uphill 340° → long axis 70°).
const UPHILL_AZ = (SITE.fallsToAzimuth + 180) % 360;
const rad = Math.PI / 180;
const uy = [Math.sin(UPHILL_AZ * rad), Math.cos(UPHILL_AZ * rad)];
const ux = [Math.sin((UPHILL_AZ + 90) * rad), Math.cos((UPHILL_AZ + 90) * rad)];
/** Model inches (x along contour, y uphill) → CREO metres (east, north). */
const toLocal = (xIn, yIn, offsetIn = 0) => {
  const x = (xIn + offsetIn) * M_PER_IN, y = yIn * M_PER_IN;
  return [x * ux[0] + y * uy[0], x * ux[1] + y * uy[1]];
};

const chosen = only ? PLANS.filter((p) => p.id === only) : PLANS;
if (!chosen.length) { console.error(`no plan for "${only}"`); process.exit(1); }

// Laid along the contour with a gap, so eleven houses can be compared on one
// hill instead of stacked in one hole. A single scheme sits on the anchor.
const GAP = ft(40);
let cursor = 0;
const spans = chosen.map((p) => {
  const xs = p.levels.flatMap((l) => (l.rooms ?? []).flatMap((r) => [ft(r.x0), ft(r.x0 + r.w)]));
  return { p, x0: Math.min(...xs), x1: Math.max(...xs) };
});
const totalIn = spans.reduce((a, s) => a + (s.x1 - s.x0), 0) + GAP * (spans.length - 1);

const out = [];
let seq = 0;
for (const { p, x0, x1 } of spans) {
  const offset = only ? -(x0 + x1) / 2 : (cursor - totalIn / 2) - x0;
  cursor += (x1 - x0) + GAP;

  // one probe per house, at its own centre, so each sits on its own ground
  const [ce, cn] = toLocal((x0 + x1) / 2, ft(12), offset);
  const base = groundAt(ce, cn);

  for (const lv of p.levels) {
    const rooms = lv.rooms ?? [];
    if (!rooms.length) continue;
    const bx0 = Math.min(...rooms.map((r) => ft(r.x0))), bx1 = Math.max(...rooms.map((r) => ft(r.x0 + r.w)));
    const by0 = Math.min(...rooms.map((r) => ft(r.y0))), by1 = Math.max(...rooms.map((r) => ft(r.y0 + r.d)));
    const ring = [[bx0, by0], [bx1, by0], [bx1, by1], [bx0, by1]]
      .map(([xi, yi]) => toLocal(xi, yi, offset).map((v) => +v.toFixed(2)));
    // The model's z=0 is the project datum; natural grade there is 6 in below
    // it. Anchoring that ground to the DEM keeps the whole stepped section
    // intact and lets the cut and fill against real ground show, rather than
    // re-levelling each floor onto the hill and hiding the earthwork.
    const zBase = base + 0.1524 + ft(lv.ffe) * M_PER_IN;
    out.push({
      id: `hh_${(++seq).toString(36).padStart(3, '0')}`,
      type: 'structure',
      name: `${p.id.replace(/^S\d+-/, '')} — ${lv.name ?? 'LEVEL'} (FFE ${lv.ffe}')`,
      footprint: ring, path: null, width: null,
      zBase: +zBase.toFixed(2), zTop: +(zBase + PLATE * M_PER_IN).toFixed(2),
      parent: null, children: [], subtype: 'house', use: 'residential',
      material: null, network: null, nodes: null,
      epistemic: 'PROPOSED',     // it is a proposal. Nothing here is built.
      certainty: 0.5,
      source: 'HENRY HOUSE',
      author: 'henry-house — schematic design, NOT FOR CONSTRUCTION',
      createdBy: null, createdAt: 0,
      evidence: [{
        kind: 'measure',
        ref: `henry-house/model/scheme-plans.mjs#${p.id}`,
        note: `${rooms.length} rooms, checked by tools/build-plans.mjs; ` +
              `uphill face at azimuth ${UPHILL_AZ}°, from SITE.fallsToAzimuth`,
      }],
      status: 'ACTIVE', branch: 'AS_IS', collision: 'solid',
      sim: {}, tags: ['henry-house', p.id], style: null,
      props: { scheme: p.id, ffe: lv.ffe, rooms: rooms.length },
    });
  }
}

console.log('HENRY HOUSE → CREO');
console.log('='.repeat(72));
console.log(`  place        ${place.name}`);
console.log(`  anchor       ${place.anchor.map((v) => v.toFixed(5)).join(', ')}`);
console.log(`  the fall     azimuth ${SITE.fallsToAzimuth}°  →  uphill face at ${UPHILL_AZ}°`);
console.log(`  so the glazing on the downhill face looks NORTH — see docs/09`);
console.log(`  exported     ${out.length} levels across ${chosen.length} scheme${chosen.length > 1 ? 's' : ''}`);
for (const e of out.slice(0, 4)) console.log(`     ${e.name.padEnd(44)} z ${e.zBase}–${e.zTop} m`);
if (out.length > 4) console.log(`     … and ${out.length - 4} more`);

if (write) {
  place.entities = (place.entities ?? []).filter((e) => !String(e.id).startsWith('hh_'));
  place.entities.push(...out);
  writeFileSync(file, JSON.stringify(doc));
  console.log(`  → written into ${file}  (${place.entities.length} entities total)`);
} else {
  console.log('  (dry run — pass --write to put them in the place)');
}
