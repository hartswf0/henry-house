// HENRY HOUSE — compile the per-scheme critiques.
//
// From the client's own gauntlet template, §10 FAN-OUT:
//
//   "Break the work into the smallest pieces that can be independently
//    improved and judged. For each important piece create: one builder, one
//    separate critic with fresh context. THE BUILDER NEVER GRADES ITSELF."
//
// The eight critics in tools/gauntlet/run.mjs are a RUBRIC, not that. They are
// pure functions of measured quantities, they apply the same test to every
// scheme, and they cannot see a plan at all — which is exactly what makes them
// impossible to argue with, and exactly what makes them unable to notice that
// a bedroom opens off a kitchen. This file holds the other half: a written
// critique per scheme, from an agent that did not draw the thing it is judging.
//
//   node tools/build-critiques.mjs [--dry]
//
// Reads critiques/<SCHEME-ID>.json, validates, writes model/scheme-critiques.mjs.
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { SCHEMES } from '../model/schemes.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const DIR = resolve(ROOT, 'critiques');
const OUT = resolve(ROOT, 'model/scheme-critiques.mjs');
const DRY = process.argv.includes('--dry');

const SEV = new Set(['FATAL', 'MAJOR', 'MINOR']);

/**
 * A critique has to be falsifiable to be worth anything. Every finding must
 * name the thing it is about and say what would have to change, so it can be
 * checked against the drawing rather than admired.
 */
function validate(c) {
  const e = [];
  if (!c.id || !SCHEMES.some(s => s.id === c.id)) e.push(`unknown scheme "${c.id}"`);
  if (c.verdict !== 'WIN' && c.verdict !== 'LOSS') e.push('verdict must be WIN or LOSS');
  if (!Array.isArray(c.findings) || c.findings.length < 3) e.push('fewer than 3 findings');
  else c.findings.forEach((f, i) => {
    if (!SEV.has(f.severity)) e.push(`finding ${i}: severity must be FATAL, MAJOR or MINOR`);
    if (!f.finding || String(f.finding).length < 40) e.push(`finding ${i}: too short to be a finding`);
    if (!f.where) e.push(`finding ${i}: no "where" — a critique that cannot be located cannot be checked`);
    if (!f.fix) e.push(`finding ${i}: no "fix" — says what is wrong but not what would have to change`);
  });
  if (!c.biggestGap) e.push('no biggestGap — the template requires it');
  // A critic that finds nothing wrong has not read the drawing.
  if (Array.isArray(c.findings) && c.findings.every(f => f.severity === 'MINOR')) {
    e.push('every finding is MINOR — a critic that finds nothing serious on a schematic plan has not looked hard enough');
  }
  return e;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  mkdirSync(DIR, { recursive: true });
  const files = existsSync(DIR) ? readdirSync(DIR).filter(f => f.endsWith('.json')) : [];
  console.log('HENRY HOUSE — SCHEME CRITIQUES\n');
  if (!files.length) { console.log('  no critiques/ files yet'); process.exit(0); }

  const kept = [];
  for (const f of files.sort()) {
    let c;
    try { c = JSON.parse(readFileSync(resolve(DIR, f), 'utf8')); }
    catch (err) { console.log(`  ✗ ${f}  UNPARSEABLE: ${err.message}`); continue; }
    const errs = validate(c);
    if (errs.length) {
      console.log(`  ✗ ${String(c.id ?? f).padEnd(14)} DROPPED`);
      for (const e of errs) console.log(`      · ${e}`);
      continue;
    }
    kept.push(c);
    const fatal = c.findings.filter(x => x.severity === 'FATAL').length;
    const major = c.findings.filter(x => x.severity === 'MAJOR').length;
    console.log(`  ✓ ${c.id.padEnd(14)} ${c.verdict.padEnd(5)} ${String(c.findings.length).padStart(2)} findings  ` +
                `${fatal} fatal  ${major} major`);
  }

  console.log(`\n  ${kept.length}/${files.length} critiques accepted`);
  if (DRY) { console.log('  --dry: nothing written'); process.exit(0); }

  const src = `// HENRY HOUSE — SCHEME CRITIQUES, GENERATED.
//
// Written by tools/build-critiques.mjs. DO NOT HAND-EDIT.
//
// The gauntlet template's fan-out rule: "one builder, one separate critic with
// fresh context. The builder never grades itself." These come from critics that
// did not draw the plan they are judging and cannot see the builder's note.
//
// Every finding here names WHERE it is and WHAT would have to change, so it can
// be checked against the drawing rather than admired. A critique whose findings
// were all minor was rejected: a critic that finds nothing serious on a
// schematic plan has not looked hard enough.
//
// ${kept.length} critique${kept.length === 1 ? '' : 's'}.

export const CRITIQUES = ${JSON.stringify(kept, null, 2)};

export const critiqueFor = (id) => CRITIQUES.find(c => c.id === id) ?? null;

export default CRITIQUES;
`;
  writeFileSync(OUT, src);
  console.log(`  → model/scheme-critiques.mjs`);
}
