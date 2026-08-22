// THE BUILD PROCESS ITSELF, AS A TRACE.
//
// The eleven house traces are each one building. This one is the PROCESS: the
// argument that produced them, in the order it happened, with the pictures that
// were actually on screen at each step.
//
// It is HUMAN_CORRESPONDENCE_V1 — the schema the depot's reader uses for the
// loop with a person in it: a prompt, a thing that came back, a picture pasted
// in, a verdict, and the next prompt. That is what this project was.
//
// WHERE THE CONTENT COMES FROM, EXACTLY. The repository's own git history:
//
//   prompt   the commit subject — what that change set out to do
//   result   the commit body — the reasoning, the finding, and what was wrong
//            with the previous state. These were written at the time.
//   image    the picture AS IT WAS AT THAT COMMIT, recovered with
//            `git show <sha>:<path>` — not today's version of the same file.
//            So the sequence shows the building actually changing.
//   artifact the files that changed — the code that was written
//
// WHAT IT IS NOT. It is not a transcript. The user's words are not stored in
// this repository, so they are not in here, and no attempt is made to
// reconstruct them from memory. What is here is the record the work left
// behind, which is a different and more checkable thing. The depot's own human
// trace says the same about itself, and that seemed the right precedent.
//
//   node tools/export-process-trace.mjs
import { writeFileSync, mkdirSync, unlinkSync } from 'node:fs';
import { execFileSync, execSync } from 'node:child_process';

const OUT = 'out/traces';
mkdirSync(OUT, { recursive: true });
const TMP = '/tmp/henry-trace-img';
mkdirSync(TMP, { recursive: true });

const git = (args) => execFileSync('git', args, { maxBuffer: 1 << 28 }).toString();

// Commits that changed a picture, oldest first — those are the moments where
// the building visibly became something different.
const shas = git(['log', '--reverse', '--format=%H',
  '--', 'out/schemes/*.png', 'out/png/*.png', 'out/renders/*.png']).trim().split('\n').filter(Boolean);

console.log('HENRY HOUSE — THE PROCESS, AS A TRACE');
console.log('='.repeat(74));
console.log(`  ${shas.length} commits changed a picture`);

const turns = [];
const paths = [];
for (const sha of shas) {
  const subject = git(['log', '-1', '--format=%s', sha]).trim();
  const body = git(['log', '-1', '--format=%b', sha]).trim()
    .replace(/\n?Co-Authored-By:.*$/gms, '').replace(/\n?Claude-Session:.*$/gms, '').trim();
  const ts = git(['log', '-1', '--format=%cI', sha]).trim();
  const changed = git(['show', '--pretty=', '--name-only', sha]).trim().split('\n').filter(Boolean);
  const pics = changed.filter((f) => /^out\/(schemes|renders|png)\/.*\.png$/.test(f));
  if (!pics.length) continue;
  // prefer a hero or a render of the house over a rasterised sheet
  const pick = pics.find((f) => /hero/.test(f)) || pics.find((f) => f.startsWith('out/schemes/'))
    || pics.find((f) => f.startsWith('out/renders/')) || pics[0];
  const tmp = `${TMP}/${sha.slice(0, 8)}.png`;
  try { execSync(`git show ${sha}:${JSON.stringify(pick)} > ${JSON.stringify(tmp)}`, { maxBuffer: 1 << 30 }); }
  catch { continue; }
  paths.push(tmp);
  const code = changed.filter((f) => /\.(mjs|js|html|py|json|md)$/.test(f) && !f.startsWith('out/'));
  turns.push({
    i: turns.length, sha: sha.slice(0, 8), ts,
    prompt: subject,
    result: body || subject,
    artifact: code.length ? `${code.length} file${code.length === 1 ? '' : 's'}: ${code.slice(0, 6).join(', ')}${code.length > 6 ? ` +${code.length - 6}` : ''}` : null,
    _pic: tmp, _picPath: pick,
  });
}

console.log(`  ${turns.length} turns carry a picture — shrinking…`);
const IMG = JSON.parse(execFileSync('python3', ['tools/trace/shrink-images.py', '760', '58'],
  { input: JSON.stringify(paths), maxBuffer: 1 << 30, stdio: ['pipe', 'pipe', 'ignore'] }).toString());

for (const t of turns) {
  t.image = IMG[t._pic] || null;
  t.model = t._picPath;
  delete t._pic; delete t._picPath;
}
for (const p of paths) { try { unlinkSync(p); } catch {} }

const doc = {
  format: 'HUMAN_CORRESPONDENCE_V1',
  intent: 'Henry House — eleven schemes for one steep parcel, and the argument that produced them',
  who: 'Watson Hartsoe, with a generated model',
  note: 'Reconstructed from this repository\'s own commit history, not from the live conversation. ' +
        'The prompts are the commit subjects, the replies are the commit bodies written at the time, ' +
        'and every picture is the file AS IT WAS at that commit — recovered with git show — so the ' +
        'sequence shows the building actually changing rather than today\'s version repeated. ' +
        'The user\'s words are not stored in this repository and are therefore not in here.',
  engine: 'henry-house — parametric model, generated drawings, machine critics',
  critic: 'tools/build-plans.mjs, tools/check/{plan3d,envelope,framing,links}.mjs, and written critiques in model/scheme-critiques.mjs',
  capture: 'tools/render/shoot-schemes.mjs — progressive accumulation, 64 samples',
  turns,
};

const body = JSON.stringify(doc);
writeFileSync(`${OUT}/henry-house-process.json`, body);
console.log(`  ✓ henry-house-process.json  ${turns.length} turns · ${(body.length / 1024 / 1024).toFixed(1)} MB`);
console.log('='.repeat(74));
