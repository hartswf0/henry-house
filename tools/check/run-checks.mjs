// HENRY HOUSE — run every check.
//
// package.json pointed `npm test` at this file and this file did not exist, so
// the one command anybody would try never ran anything. That is the same class
// of failure as the walkthrough importing three.js from a gitignored directory:
// it works on the machine that built it and nowhere else, and nothing says so.
//
// Two suites, and they ask different questions:
//
//   clash.mjs      does the MODEL hold together — clearances, egress, access,
//                  stairs, structure, the ground, the drive
//   walkcheck.mjs  do the BROWSER PAGES actually load — the walkthrough and the
//                  render scene, in a real headless browser, with 404s named
//
// The second one only exists because the first one cannot see a 404.

import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));

const SUITES = [
  { name: 'MODEL COORDINATION', file: 'tools/check/clash.mjs' },
  { name: 'BROWSER PAGES', file: 'tools/render/walkcheck.mjs' },
];

const only = process.argv.slice(2).filter(a => !a.startsWith('-'));
const skipBrowser = process.argv.includes('--no-browser');

const run = (file) => new Promise((resolve) => {
  const p = spawn(process.execPath, [ROOT + file], { stdio: 'inherit', cwd: ROOT });
  p.on('exit', (code) => resolve(code ?? 1));
});

let failed = 0;
for (const s of SUITES) {
  if (only.length && !only.some(o => s.file.includes(o) || s.name.toLowerCase().includes(o.toLowerCase()))) continue;
  if (skipBrowser && s.file.includes('walkcheck')) {
    console.log(`\n(skipped ${s.name} — --no-browser)`);
    continue;
  }
  const code = await run(s.file);
  if (code !== 0) failed++;
}

console.log('\n' + '='.repeat(74));
if (failed) {
  console.log(`FAILED — ${failed} suite(s) did not pass.`);
} else {
  console.log('ALL SUITES PASSED.');
  console.log('This says the model is COORDINATED and the pages LOAD. It does not');
  console.log('say the house is engineered, code-compliant or buildable — see');
  console.log('docs/02-code-basis.md and docs/04-professional-scope.md.');
}
console.log('='.repeat(74) + '\n');
process.exitCode = failed ? 1 : 0;
