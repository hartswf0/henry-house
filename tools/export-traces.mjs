// HENRY HOUSE → OPERATIVE BUILDER TRACES.
//
// One JSON per house, in the schema that
// gunnars-depot.html/operative-builder-trace.html actually reads. The schema was
// not guessed: it is OPERATIVE_BUILDER_TRACE_V1, taken from that page's own
// adapter and from the traces bundled beside it, and the fields below are the
// fields it looks for.
//
// WHAT A TRACE IS, IN THAT READER'S TERMS: a reference is pinned, a BUILDER
// proposes geometry, a CRITIC is shown the result against the reference and
// returns a suck score (lower is better) and one concrete accusation, and the
// accusation becomes the builder's next instruction.
//
// THIS PROJECT REALLY RAN THAT LOOP, so the trace is a record and not a
// costume:
//
//   reference   the CHECKED PLAN SHEET. That is genuinely what the 3D was
//               built toward, and tools/check/plan3d.mjs exists to assert the
//               model matches it fixture for fixture.
//   builder     model/scheme-plans.mjs → tools/render/lib/build3d.mjs
//   capture     the render, from the same model
//   critic      tools/build-plans.mjs flags and the written critiques in
//               model/scheme-critiques.mjs — real findings, not prose
//   score       computed from those findings by the rule stated below, so it
//               can be recomputed and argued with
//
// WHAT IT IS NOT. There are no per-cycle before/after captures of superseded
// states, because those renders were replaced rather than archived. Cycle 1
// therefore carries the drawing as its capture and cycle 2 the render, and
// beforeWorld/diff are left empty rather than reconstructed. A trace that
// invents its own history is worth nothing to whoever reads it next.
//
//   node tools/export-traces.mjs            → out/traces/*.json + index.json
//   node tools/export-traces.mjs --zip      → also henry-house-traces.zip
import { writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { SCHEMES, schemeById, metrics } from '../model/schemes.mjs';
import { PLANS, planFor } from '../model/scheme-plans.mjs';
import { critiqueFor } from '../model/scheme-critiques.mjs';
import { SITE } from '../model/geometry.mjs';
import { SITE_CONTEXT } from '../model/site-context.mjs';

const OUT = 'out/traces';
const M = 0.3048;                                  // feet → metres
const ISO = new Date().toISOString();
mkdirSync(OUT, { recursive: true });

// ── the pictures ────────────────────────────────────────────────────────────
const sheetFor = (id) => (readdirSync('out/png')
  .find((f) => f.startsWith('X-2') && f.includes(id.toLowerCase().replace(/^s\d+-/, '')) && f.endsWith('.png')) || null);
const want = new Set();
for (const s of SCHEMES) {
  const sh = sheetFor(s.id); if (sh) want.add(`out/png/${sh}`);
  for (const v of ['', '-hero']) {
    const p = `out/schemes/${s.id}${v}.png`;
    if (existsSync(p)) want.add(p);
  }
}
console.log('HENRY HOUSE — OPERATIVE BUILDER TRACES');
console.log('='.repeat(74));
console.log(`  shrinking ${want.size} images…`);
const IMG = JSON.parse(execFileSync('python3', ['tools/trace/shrink-images.py', '720', '60'],
  { input: JSON.stringify([...want]), maxBuffer: 1 << 30, stdio: ['pipe', 'pipe', 'ignore'] }).toString());
const img = (p) => IMG[p] || '';

// ── the world, from the checked plan ────────────────────────────────────────
// One box per room, in metres, y up, and z negated because the drawing's +y is
// uphill while the viewer's +z comes toward you. Roof planes are emitted flat:
// an operative part carries rotation_y only, so a 3:12 pitch cannot be stated
// in this schema and is not faked — it is a thin slab at its own mean height.
const USE_COLOR = {
  bed: '#8d7f6a', bath: '#6f8b93', kitchen: '#7d8b6e', living: '#a3927a',
  dining: '#9b8c74', circ: '#6e6a63', mech: '#5f6a72', store: '#67635c',
  work: '#87806e', laundry: '#6b7a80',
};
function worldFor(scheme, plan) {
  const parts = [];
  if (plan) {
    for (const lv of plan.levels) {
      for (const r of lv.rooms ?? []) {
        parts.push({
          id: `${lv.name ?? 'L'}_${r.name}`.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
          primitive: 'box', role: r.use,
          position: [+(((r.x0 + r.w / 2)) * M).toFixed(3), +((lv.ffe + 4.4) * M).toFixed(3),
                     +((-(r.y0 + r.d / 2)) * M).toFixed(3)],
          size: [+(r.w * M).toFixed(3), +(8.8 * M).toFixed(3), +(r.d * M).toFixed(3)],
          rotation_y: 0, color: USE_COLOR[r.use] || '#8a8578',
          material: 'matte', scale: [1, 1, 1],
        });
      }
    }
  }
  for (const r of scheme.roofs) {
    const y0 = r.y0 / 12, y1 = r.y1 / 12, x0 = r.x0 / 12, x1 = r.x1 / 12;
    const rise = (r.pitch / 12) * (y1 - y0);
    const base = 10.5 + (plan ? Math.max(...plan.levels.map((l) => l.ffe)) : 0);
    parts.push({
      id: `roof_${r.id}`.toLowerCase(), primitive: 'box', role: 'roof',
      position: [+(((x0 + x1) / 2) * M).toFixed(3), +((base + rise / 2) * M).toFixed(3),
                 +((-(y0 + y1) / 2) * M).toFixed(3)],
      size: [+((x1 - x0) * M).toFixed(3), +(0.6 * M).toFixed(3), +((y1 - y0) * M).toFixed(3)],
      rotation_y: 0, color: '#3a4046', material: 'matte', scale: [1, 1, 1],
    });
  }
  return parts;
}

// ── the score ───────────────────────────────────────────────────────────────
// A SUCK score: lower is better, and zero would mean only that this pass found
// no discrepancy. Computed from real findings by a stated rule so a reader can
// recompute it — it is arithmetic on the checker's output, not an opinion.
const SEV = { FATAL: 34, MAJOR: 15, MINOR: 5 };
function scoreOf(plan, crit) {
  let s = (plan?.flags?.length ?? 0) * 4;
  for (const f of crit?.findings ?? []) s += SEV[f.severity] ?? 8;
  if (crit?.verdict === 'LOSS') s += 6;
  return Math.max(0, Math.min(100, Math.round(s)));
}

// ── one trace ───────────────────────────────────────────────────────────────
const index = [];
for (const scheme of SCHEMES) {
  const plan = planFor(scheme.id);
  const crit = critiqueFor?.(scheme.id) ?? null;
  const m = metrics(scheme);
  const sheet = sheetFor(scheme.id);
  const refURI = sheet ? img(`out/png/${sheet}`) : '';
  const shotURI = img(`out/schemes/${scheme.id}-hero.png`) || img(`out/schemes/${scheme.id}.png`);
  const world = worldFor(scheme, plan);
  const score = scoreOf(plan, crit);
  const t0 = ISO;

  const flags = plan?.flags ?? [];
  // A low score on a scheme nobody critiqued is not a good scheme, it is an
  // unexamined one, and the reader shows the number in 96pt type. Say so in the
  // accusation, because the number cannot say it for itself.
  const unexamined = !crit;
  const accusation = crit?.findings?.[0]?.finding
    ?? (flags.length
      ? `NOT YET CRITIQUED — this score counts ${flags.length} machine flag${flags.length === 1 ? '' : 's'} ` +
        `from tools/build-plans.mjs and nothing else. Worst of them: ${flags[0]}`
      : 'NOT YET CRITIQUED, AND NO MACHINE FLAG WAS RAISED. A zero here means only that ' +
        'nothing looked. Six of the eleven schemes have never had a written critic pass; ' +
        'this is one of them.');

  const ops = world.map((p) => ({ op: 'ADD', object: p }));

  const cycles = [{
    id: `cycle-1-world-1`, cycle: 1, worldVersion: 1, repairView: 'PLAN',
    summary: `Plan authored and machine-checked. ${plan ? `${plan.levels.length} levels, ` +
      `${plan.levels.reduce((a, l) => a + (l.rooms?.length ?? 0), 0)} rooms accepted by ` +
      `tools/build-plans.mjs; ${flags.length} flag${flags.length === 1 ? '' : 's'} raised.`
      : 'No checked plan exists for this scheme; the massing stands unverified.'}`,
    operations: [], receipts: flags.map((f) => `FLAG · ${f}`),
    beforeWorld: [], afterWorld: [], diff: { added: [], changed: [], removed: [] },
    beforeShot: '', afterShot: refURI, diffShot: '',
    critiques: flags.slice(0, 3).map((f) => ({
      view: 'PLAN', score: Math.min(100, flags.length * 8), criticism: f, ts: t0,
    })),
    ts: t0,
  }, {
    id: `cycle-2-world-2`, cycle: 2, worldVersion: 2, repairView: 'FRONT',
    summary: `Built in 3D from that plan by tools/render/lib/build3d.mjs and rendered. ` +
      `${world.length} parts. ${m.conditionedSf.toLocaleString()} sf conditioned, ` +
      `${m.perimeterLf} lf perimeter, ${m.wetWallLf} lf wet wall, ${m.cutCY} CY cut.`,
    operations: ops, receipts: ops.map((o) => `ACCEPT · ADD ${o.object.id}`),
    beforeWorld: [], afterWorld: world, diff: { added: world.map((p) => p.id), changed: [], removed: [] },
    beforeShot: refURI, afterShot: shotURI, diffShot: '',
    critiques: [{ view: 'FRONT', score, criticism: accusation, ts: t0 }],
    ts: t0,
  }];

  const builder_log = [
    { role: 'user', text: `BUILD INTENT: ${scheme.name} — ${scheme.tag}\n\nOPERATION: ${scheme.operation}`, cls: '', ts: t0 },
    { role: 'user', text: `REFERENCE IT COMES FROM: ${scheme.from}\n\nDO NOT COPY: ${scheme.doNotCopy}`, cls: '', ts: t0 },
    { role: 'user', text: `THE TEST THIS SCHEME MUST PASS: ${scheme.henryTest}`, cls: '', ts: t0 },
    { role: 'assistant', text: cycles[0].summary, cls: '', ts: t0 },
    { role: 'assistant', text: cycles[1].summary, cls: '', ts: t0 },
  ];
  const critic_log = [
    { role: 'user', text: `OBSERVE PLAN — ${flags.length} flags from tools/build-plans.mjs`, cls: '', ts: t0 },
    ...flags.map((f) => ({ role: 'assistant', text: f, cls: '', ts: t0 })),
    ...(crit ? [{ role: 'user', text: `VERDICT ${crit.verdict}. ${crit.note ?? ''}`, cls: '', ts: t0 },
                ...(crit.findings ?? []).map((f) => ({
                  role: 'assistant',
                  text: `${f.severity} · ${f.where}\n${f.finding}`, cls: '', ts: t0,
                }))] : []),
    { role: 'assistant', text: `SUCK ${score} — ${accusation}`, cls: '', ts: t0 },
  ];

  const doc = {
    format: 'OPERATIVE_BUILDER_TRACE_V1',
    exported_at: t0,
    intent: `${scheme.name} — ${scheme.tag}`,
    reference_name: sheet ? sheet.replace(/\.png$/, '') : 'no sheet',
    reference: refURI,
    // NOT a model name: this loop's builder is a parametric model and its critic
    // is a set of checkers, and naming a chat model here would misdescribe it.
    model: 'henry-house — parametric model, generated drawings, machine critics',
    current_world: world,
    current_world_version: 2,
    view_scores: { FRONT: { score, criticism: accusation, worldVersion: 2, ts: t0 } },
    history: cycles,
    builder_log, critic_log,
    events: [
      { type: 'reference_changed', data: { name: doc_ref(sheet), size: refURI.length }, ts: t0, cycle: 0, worldVersion: 0 },
      { type: 'builder_move', data: { cycle: 1 }, ts: t0, cycle: 1, worldVersion: 1 },
      { type: 'critique', data: { view: 'PLAN', score: Math.min(100, flags.length * 8) }, ts: t0, cycle: 1, worldVersion: 1 },
      { type: 'builder_move', data: { cycle: 2, parts: world.length }, ts: t0, cycle: 2, worldVersion: 2 },
      { type: 'critique', data: { view: 'FRONT', score }, ts: t0, cycle: 2, worldVersion: 2 },
    ],
    // extra, ignored by the reader, kept because whoever opens the zip will want it
    henry_house: {
      parcel: SITE_CONTEXT.parcelId, county: `${SITE.county} County, ${SITE.state}`,
      coordinate: SITE_CONTEXT.anchor.label,
      status: 'SCHEMATIC DESIGN — NOT FOR CONSTRUCTION. Nothing engineered; code basis void (researched against the wrong state).',
      metrics: m,
      repository: 'github.com/hartswf0/henry-house',
    },
  };

  const file = `${scheme.id.toLowerCase()}.json`;
  const body = JSON.stringify(doc);
  writeFileSync(`${OUT}/${file}`, body);
  index.push({
    file, note: scheme.tag, builder: 'operative',
    intent: doc.intent, model: doc.model, reference_name: doc.reference_name,
    exported_at: t0, cycles: cycles.length, parts: world.length,
    scores: [cycles[0].critiques[0]?.score ?? 0, score], bytes: body.length,
    critiqued: !unexamined,
  });
  console.log(`  ✓ ${file.padEnd(20)} ${String(world.length).padStart(3)} parts · ` +
              `${cycles.length} cycles · suck ${String(score).padStart(3)}${unexamined ? ' (UNEXAMINED)' : ''} · ` +
              `${(body.length / 1024).toFixed(0)} kB`);
}
function doc_ref(sheet) { return sheet ? sheet.replace(/\.png$/, '') : 'no sheet'; }

writeFileSync(`${OUT}/index.json`, JSON.stringify({
  generators: { operative: 'henry-house tools/export-traces.mjs' },
  formats: { operative: 'OPERATIVE_BUILDER_TRACE_V1' },
  about: 'Eleven houses for one steep parcel in Johnson County, Tennessee. ' +
         'Each trace is one house: the checked plan it was built toward, the geometry ' +
         'that came out, the picture, and the findings against it.',
  traces: index,
}, null, 1));
console.log(`  ✓ index.json`);

if (process.argv.includes('--zip')) {
  const zip = 'henry-house-traces.zip';
  try { execFileSync('rm', ['-f', zip]); } catch {}
  const all = readdirSync(OUT).filter((f) => /\.(json|md)$/.test(f)).map((f) => `${OUT}/${f}`);
  execFileSync('zip', ['-q', '-j', zip, ...all]);
  console.log(`  ✓ ${zip}  (${(statSync(zip).size / 1024 / 1024).toFixed(1)} MB)`);
}
console.log('='.repeat(74));
console.log(`  ${index.length} houses · open one at a time in operative-builder-trace.html`);
