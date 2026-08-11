// HENRY HOUSE — collect scheme proposals out of a workflow run.
//
// A fan-out of agents proposes schemes as structured JSON. This turns that
// journal into model/schemes-proposed.json, which model/schemes.mjs loads
// through the SAME V/R/ground vocabulary as the hand-written seven. That is
// the whole point: a proposal that lands here is measured by the same metrics,
// priced by the same rates, judged by the same critics and drawn by the same
// code. There is no path by which a scheme argues its way in.
//
//   node tools/collect-schemes.mjs <workflow-run-id> [--dry]
//
// Every proposal is validated before it is written. A scheme that fails
// validation is REPORTED AND DROPPED, never silently repaired — a scheme with
// a broken volume would still produce numbers, and those numbers would be
// wrong in a way nobody would catch by looking at the sheet.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { homedir } from 'node:os';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const OUT = resolve(ROOT, 'model/schemes-proposed.mjs');

const REQ_VOL = ['id', 'kind', 'x0', 'y0', 'w', 'd'];
const REQ_ROOF = ['id', 'x0', 'y0', 'w', 'd'];
const KINDS = new Set(['cond', 'shelt', 'future']);

/** Everything a proposal must have before it is allowed to be measured. */
function validate(p, seen) {
  const e = [];
  const num = (v) => typeof v === 'number' && Number.isFinite(v);

  for (const k of ['id', 'name', 'tag', 'operation']) {
    if (!p[k] || typeof p[k] !== 'string') e.push(`missing ${k}`);
  }
  if (p.id && seen.has(p.id)) e.push(`duplicate id ${p.id}`);

  if (!Array.isArray(p.volumes) || !p.volumes.length) e.push('no volumes');
  else p.volumes.forEach((v, i) => {
    for (const k of REQ_VOL) if (v[k] === undefined) e.push(`volume ${i}: missing ${k}`);
    if (!KINDS.has(v.kind)) e.push(`volume ${i}: kind "${v.kind}" is not cond/shelt/future`);
    if (!num(v.w) || v.w <= 0 || !num(v.d) || v.d <= 0) e.push(`volume ${i}: w and d must be positive feet`);
    if (v.storeys !== undefined && (!Number.isInteger(v.storeys) || v.storeys < 1)) e.push(`volume ${i}: storeys`);
  });

  if (!Array.isArray(p.roofs) || !p.roofs.length) e.push('no roofs');
  else p.roofs.forEach((r, i) => {
    for (const k of REQ_ROOF) if (r[k] === undefined) e.push(`roof ${i}: missing ${k}`);
    if (!num(r.w) || r.w <= 0 || !num(r.d) || r.d <= 0) e.push(`roof ${i}: w and d must be positive feet`);
  });

  const g = p.ground;
  if (!g || typeof g !== 'object') e.push('no ground');
  else if (g.kind === 'piers') {
    if (!Array.isArray(g.pts) || g.pts.length < 3) e.push('piers: need at least 3 points');
    else if (g.pts.some(pt => !Array.isArray(pt) || pt.length !== 2 || !pt.every(num))) e.push('piers: malformed point');
  } else if (g.kind === 'bench' || g.kind === 'plinth') {
    if (!num(g.w) || !num(g.d)) e.push(`${g.kind}: needs x0, y0, w, d in feet`);
  } else e.push(`ground kind "${g.kind}" is not piers/bench/plinth`);

  if (!num(p.wetWallFt) || p.wetWallFt < 0) e.push('wetWallFt must be a number of feet');
  if (!Array.isArray(p.phases) || !p.phases.length) e.push('no phases');

  // A scheme that reports its own area is checked against the area its own
  // volumes actually enclose. This has caught proposals whose prose and
  // geometry disagreed by hundreds of square feet.
  if (num(p.selfCheckSf)) {
    const built = (p.volumes || [])
      .filter(v => v.kind === 'cond' && num(v.w) && num(v.d))
      .reduce((a, v) => a + v.w * v.d * (v.storeys ?? 1), 0);
    const off = Math.abs(built - p.selfCheckSf) / Math.max(1, p.selfCheckSf);
    if (off > 0.06) e.push(`claims ${p.selfCheckSf} sf, volumes enclose ${Math.round(built)} sf (${(off * 100).toFixed(0)}% off)`);
  }
  return e;
}

// ── find the journal ────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const DRY = argv.includes('--dry');
const runId = argv.find(a => a.startsWith('wf_'));
const base = resolve(homedir(), '.claude/projects');

function findJournals(id) {
  const hits = [];
  const walk = (dir, depth = 0) => {
    if (depth > 6) return;
    let ents = [];
    try { ents = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const en of ents) {
      const p = resolve(dir, en.name);
      if (en.isDirectory()) {
        if (en.name.startsWith('wf_') && (!id || en.name === id)) {
          const j = resolve(p, 'journal.jsonl');
          if (existsSync(j)) hits.push(j);
        } else walk(p, depth + 1);
      }
    }
  };
  walk(base);
  return hits;
}

const journals = findJournals(runId);
if (!journals.length) {
  console.error(runId ? `no journal for ${runId}` : 'no workflow journals found');
  process.exit(1);
}

// ── collect ─────────────────────────────────────────────────────────────────
// Proposals are numbered on from the hand-written set, read from the model
// rather than hard-coded, so adding an eighth by hand does not silently
// produce two schemes called S7.
const { BUILT_SCHEMES } = await import('../model/schemes.mjs');
// A scheme's own critic outranks this file's geometry checks. Structural
// validity is necessary and not sufficient: a proposal can pass every check
// here and still fail to embody the operation it was built to test, and the
// critic is the only reader that can say so. Verdicts live in the repo so the
// decision is auditable rather than a judgement made once in a chat window.
let VERDICTS = {};
try {
  const vp = resolve(ROOT, 'refs/workflow-verdicts.json');
  if (existsSync(vp)) VERDICTS = JSON.parse(readFileSync(vp, 'utf8')).verdicts ?? {};
} catch { /* absent is fine — then nothing is vetoed */ }
const BUILT_COUNT = BUILT_SCHEMES.length;
const seen = new Set();
const kept = [];
const dropped = [];
console.log('HENRY HOUSE — collecting scheme proposals\n');

for (const j of journals) {
  for (const line of readFileSync(j, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    let d;
    try { d = JSON.parse(line); } catch { continue; }
    if (d.type !== 'result' || !d.result || typeof d.result !== 'object') continue;
    const p = d.result;
    if (!p.volumes) continue;                       // not a scheme proposal

    // Agents run blind to each other, so they all reach for the next free
    // number and all pick the same one. Renumber every proposal sequentially
    // on the way in — keeping the agent's own stem, which is the part that
    // carries meaning — rather than letting the last one to arrive silently
    // overwrite the first.
    const originalId = p.id;
    const veto = VERDICTS[originalId];
    if (veto && veto.verdict === 'REJECT') {
      dropped.push({ id: originalId, name: p.name, errs: ['critic REJECT'] });
      console.log(`  ✗ ${String(originalId).padEnd(16)} REJECTED BY ITS CRITIC — not adopted`);
      console.log(`      · ${(veto.critic || '').split('\n')[0].slice(0, 150)}`);
      continue;
    }
    const stem = (String(p.id || '').split('-').slice(1).join('-')
      || String(p.name || '').toUpperCase().replace(/[^A-Z]+/g, ''))
      .slice(0, 10) || 'ALT';
    p.id = `S${BUILT_COUNT + kept.length}-${stem}`;

    const errs = validate(p, seen);
    if (errs.length) {
      dropped.push({ id: p.id ?? '(no id)', name: p.name, errs });
      console.log(`  ✗ ${String(p.id ?? '?').padEnd(16)} DROPPED`);
      for (const e of errs) console.log(`      · ${e}`);
      continue;
    }
    seen.add(p.id);
    kept.push(p);
    const cond = p.volumes.filter(v => v.kind === 'cond').reduce((a, v) => a + v.w * v.d * (v.storeys ?? 1), 0);
    console.log(`  ✓ ${p.id.padEnd(16)} ${String(p.name).padEnd(16)} ${Math.round(cond).toLocaleString().padStart(6)} sf   ${p.tag}`);
  }
}

console.log(`\n  ${kept.length} kept, ${dropped.length} dropped`);
if (DRY) { console.log('  --dry: nothing written'); process.exit(0); }
if (!kept.length) { console.log('  nothing to write'); process.exit(0); }

// Emitted as an ES MODULE, not JSON. model/schemes.mjs is imported by the
// browser walkthrough and by the blob bundler as well as by Node, and a JSON
// import would need an import attribute that the bundler does not rewrite.
// A plain module is the one form all three read without special handling.
const src = `// HENRY HOUSE — SCHEME PROPOSALS, GENERATED.
//
// Written by tools/collect-schemes.mjs from a workflow run. DO NOT HAND-EDIT:
// re-run the collector instead. Every entry here is loaded by model/schemes.mjs
// through the same V/R/ground vocabulary as the hand-written schemes, so it is
// measured by the same metrics, priced by the same rates, judged by the same
// critics and drawn by the same code. A proposal cannot argue its way in — it
// is validated on the way through this file and dropped if it does not hold up.
//
// ${kept.length} proposal${kept.length === 1 ? '' : 's'} collected.

export const PROPOSED = ${JSON.stringify(kept, null, 2)};

export default PROPOSED;
`;
writeFileSync(OUT, src);
console.log(`  → ${OUT.replace(ROOT, '')}`);
