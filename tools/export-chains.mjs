// THE BUILD, AS CHAINS — ONE PER HOUSE, PLUS THE PROCESS THAT MADE THEM ALL.
//
// A chain is the loop this project actually ran, in the order it ran:
//
//   a reference is pinned  →  somebody asks for something  →  a builder reasons
//   and writes code  →  the building is captured  →  a critic reads the capture
//   and says what is wrong  →  that becomes the next ask.
//
// Each link carries all six: the prompt, the reasoning, the files written, the
// picture as it was AT THAT MOMENT, the findings against it, and a score. The
// geometry is recovered per link too — the model directory is extracted at each
// commit and rebuilt — so beforeWorld and afterWorld are the world before and
// after that step rather than today's world stamped on every cycle.
//
// WRITTEN FOR gunnars-depot.html/operative-builder-trace.html. The schema is
// OPERATIVE_BUILDER_TRACE_V1 for the houses and HUMAN_CORRESPONDENCE_V1 for the
// process, taken from that page's own adapters. Open one file at a time with
// its "Open a trace" button.
//
// WHERE THE WORDS COME FROM, AND WHERE THEY DO NOT. The reasoning, the code and
// the findings are this repository's own record: commit bodies written at the
// time, the files each commit changed, and the flags baked into
// model/scheme-plans.mjs as they stood then. THE USER'S OWN WORDS AND PASTED
// IMAGES ARE NOT IN THIS REPOSITORY. Where a chain has no supplied prompt it
// says so in the link itself instead of inventing one, and drops in the commit
// subject — what that step set out to do — as a stand-in that is labelled as a
// stand-in. Put the real ones in corpus/ (see corpus/README.md) and they are
// used instead, wherever they land.
//
//   node tools/export-chains.mjs           → out/chains/*.json + index.json
//   node tools/export-chains.mjs --zip     → also out/henry-house-chains.zip
//   node tools/export-chains.mjs --fast    → skip per-commit geometry recovery
import { writeFileSync, mkdirSync, existsSync, readdirSync, statSync, rmSync, cpSync } from 'node:fs';
import { execFileSync, execSync } from 'node:child_process';
import { SCHEMES, metrics } from '../model/schemes.mjs';
import { critiqueFor } from '../model/scheme-critiques.mjs';
import { SITE } from '../model/geometry.mjs';
import { SITE_CONTEXT } from '../model/site-context.mjs';
import { loadCorpus, corpusReport } from './trace/corpus.mjs';

const OUT = 'out/henry-house-chains';
const TMP = '/tmp/henry-chains';
const FAST = process.argv.includes('--fast');
const ISO = new Date().toISOString();
mkdirSync(OUT, { recursive: true });
rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });

const git = (a) => execFileSync('git', a, { maxBuffer: 1 << 28 }).toString();
const say = (s) => console.log(s);

say('HENRY HOUSE — BUILD CHAINS');
say('='.repeat(74));

// ── the commits, oldest first ───────────────────────────────────────────────
const shas = git(['log', '--reverse', '--format=%H']).trim().split('\n').filter(Boolean);
const COMMITS = shas.map((sha) => {
  const subject = git(['log', '-1', '--format=%s', sha]).trim();
  const body = git(['log', '-1', '--format=%b', sha]).trim()
    .replace(/^Co-Authored-By:.*$/gm, '').replace(/^Claude-Session:.*$/gm, '').trim();
  const ts = git(['log', '-1', '--format=%cI', sha]).trim();
  const files = git(['show', '--pretty=', '--name-only', sha]).trim().split('\n').filter(Boolean);
  const tree = new Set(git(['ls-tree', '-r', '--name-only', sha]).trim().split('\n').filter(Boolean));
  return { sha, short: sha.slice(0, 8), subject, body, ts, files, tree };
});
say(`  ${COMMITS.length} commits`);

// ── which commits belong to which house ─────────────────────────────────────
// A commit is a link in a house's chain when it touched that house's files or
// argued about it by name. A commit that changed all eleven at once — a camera
// fix, a rebuild — is a link in all eleven, because it was.
//
// But it has to have touched the DESIGN to be a link at all. This exporter's own
// commit message names the Spine, the Loop and the Square while describing what
// it does to their traces, and without this guard it walks into three chains as
// a design move, which it is not.
//
// Stated as a denylist rather than a list of design directories, because the
// design is nearly everything here — the model, the drawings, the checkers, the
// renderer — and what is NOT design is a short, nameable list: the machinery
// that READS the work, and repo furniture. Tooling of that kind is still part
// of the PROCESS and stays a turn in the process trace. A merge commit changes
// no files at all and so is a link in nothing, which is right: it is
// bookkeeping, not an argument about a house.
const READS_THE_WORK = new RegExp([
  'tools/(trace/|export-)',      // the exporters and the vendored player
  'corpus/',                     // the words somebody collected, not a design move
  'out/(chains|henry-house-chains)/', 'out/henry-house-chains\\.zip$',
  'out/traces/', 'henry-house-traces\\.zip$',   // this export's own output
  '\\.github/', '\\.gitignore$', 'package(-lock)?\\.json$', 'README\\.md$',
].map((r) => `^${r}`).join('|'));
const attributed = (c, s) => {
  if (!c.files.some((f) => !READS_THE_WORK.test(f))) return false;
  const word = s.id.split('-')[1];
  const num = s.id.split('-')[0].toLowerCase();
  return c.files.some((f) => f.includes(s.id) || f.toLowerCase().includes(`${num}-${word.toLowerCase()}`))
      || new RegExp(`\\b${word}\\b|${s.id}`, 'i').test(`${c.subject}\n${c.body}`);
};
const CHAIN = new Map(SCHEMES.map((s) => [s.id, COMMITS.filter((c) => attributed(c, s))]));

// ── the world at each commit ────────────────────────────────────────────────
// Extract model/ at that commit and rebuild every house from it. Only commits
// that touched the model need this; the rest carry the previous world forward,
// which is what actually happened to the building.
const worldAt = new Map();                       // sha → {id: {parts, flags}}
let carried = {};
const needs = COMMITS.filter((c) => c.files.some((f) => f.startsWith('model/')));
say(`  ${needs.length} commits changed the model — rebuilding each${FAST ? ' (skipped: --fast)' : ''}`);
for (const c of COMMITS) {
  if (!FAST && needs.includes(c)) {
    const d = `${TMP}/${c.short}`;
    mkdirSync(d, { recursive: true });
    try {
      execSync(`git archive ${c.sha} model | tar -x -C ${JSON.stringify(d)}`, { maxBuffer: 1 << 30 });
      carried = JSON.parse(execFileSync('node', ['tools/trace/world-at.mjs', `${d}/model`],
        { maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] }).toString());
    } catch { /* the model of that day will not load; the last one that did stands */ }
    rmSync(d, { recursive: true, force: true });
  }
  worldAt.set(c.sha, carried);
}

// ── the pictures ────────────────────────────────────────────────────────────
// The capture of a house AT a commit, recovered with `git show`, so the chain
// shows the building changing. Identical blobs are shrunk once and shared.
const shotPath = (c, id) => [`out/schemes/${id}-hero.png`, `out/schemes/${id}.png`,
  `out/schemes/${id}-interior.png`].find((p) => c.tree.has(p)) || null;
const sheetPath = (id) => {
  const want = id.toLowerCase().replace(/^s(\d+)-/, '$1-');
  return readdirSync('out/png').map((f) => `out/png/${f}`)
    .find((f) => /X-2\d\d/.test(f) && f.toLowerCase().includes(want) && f.endsWith('.png')) || null;
};

const blobs = new Map();                          // blob → temp file
const wantBlob = (sha, path) => {
  if (!path) return null;
  let blob;
  try { blob = git(['rev-parse', `${sha}:${path}`]).trim(); } catch { return null; }
  if (!blobs.has(blob)) {
    const f = `${TMP}/${blob.slice(0, 12)}.png`;
    execSync(`git cat-file blob ${blob} > ${JSON.stringify(f)}`, { maxBuffer: 1 << 30 });
    blobs.set(blob, f);
  }
  return blobs.get(blob);
};

const HEAD = COMMITS[COMMITS.length - 1];
const need = new Set();
for (const s of SCHEMES) {
  const sheet = sheetPath(s.id);
  if (sheet) need.add(sheet);
  for (const c of CHAIN.get(s.id)) { const f = wantBlob(c.sha, shotPath(c, s.id)); if (f) need.add(f); }
}
for (const c of COMMITS) {                        // the process trace's pictures
  const pick = [...c.files].filter((f) => /^out\/(schemes|renders|png)\/.*\.png$/.test(f));
  const one = pick.find((f) => /hero/.test(f)) || pick.find((f) => f.startsWith('out/schemes/'))
    || pick.find((f) => f.startsWith('out/renders/')) || pick[0];
  const f = wantBlob(c.sha, one);
  if (f) { c._shot = f; c._shotName = one; }
}
say(`  ${need.size + COMMITS.filter((c) => c._shot).length} distinct pictures — shrinking…`);
const IMG = JSON.parse(execFileSync('python3', ['tools/trace/shrink-images.py', '620', '54'],
  { input: JSON.stringify([...new Set([...need, ...COMMITS.map((c) => c._shot).filter(Boolean)])]),
    maxBuffer: 1 << 30, stdio: ['pipe', 'pipe', 'ignore'] }).toString());
const img = (p) => (p && IMG[p]) || '';

// ── what the user actually said, if it was kept ─────────────────────────────
const CORPUS = loadCorpus('corpus');
say(`  corpus: ${corpusReport(CORPUS)}`);

// ── the score ───────────────────────────────────────────────────────────────
// A SUCK score: lower is better, and zero would mean only that this pass found
// no discrepancy. Arithmetic on real findings by a rule stated here, so a
// reader can recompute it and argue with it.
const SEV = { FATAL: 34, MAJOR: 15, MINOR: 5 };
const scoreOf = (flags, findings, verdict) => Math.max(0, Math.min(100, Math.round(
  flags.length * 4 + findings.reduce((a, f) => a + (SEV[f.severity] ?? 8), 0) + (verdict === 'LOSS' ? 6 : 0))));

// ── one link's operations, from one world to the next ───────────────────────
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function opsBetween(before, after) {
  const B = new Map(before.map((p) => [p.id, p])), A = new Map(after.map((p) => [p.id, p]));
  const ops = [], added = [], changed = [], removed = [];
  for (const [id, p] of A) {
    const q = B.get(id);
    if (!q) { ops.push({ op: 'ADD', object: p }); added.push(id); continue; }
    if (!same(q.position, p.position)) { ops.push({ op: 'MOVE', object: p }); changed.push(id); continue; }
    if (!same(q.size, p.size)) { ops.push({ op: 'SCALE', object: p }); changed.push(id); continue; }
    if (q.color !== p.color) { ops.push({ op: 'COLOR', object: p }); changed.push(id); }
  }
  for (const id of B.keys()) if (!A.has(id)) { ops.push({ op: 'REMOVE', object: { id } }); removed.push(id); }
  return { ops, diff: { added, changed, removed } };
}

// ── one house ───────────────────────────────────────────────────────────────
const index = [];        // what the depot's reader picks from
const nativeIndex = [];  // what ours does
for (const scheme of SCHEMES) {
  const links = CHAIN.get(scheme.id);
  const sheet = sheetPath(scheme.id);
  const refURI = img(sheet);
  const crit = critiqueFor(scheme.id);
  const supplied = CORPUS.get(scheme.id) ?? [];
  const m = metrics(scheme);

  // The written critique landed at the commit that wrote it, not at the start.
  const critLanded = COMMITS.find((c) => c.files.includes('model/scheme-critiques.mjs')
    && git(['show', `${c.sha}:model/scheme-critiques.mjs`]).includes(`'${scheme.id}'`));

  const history = [], builder_log = [], critic_log = [], events = [];
  const native = [];                               // the same chain, in feet, with pitch
  let prevWorld = [], stand = 0, lastScore = 0, lastSay = '';

  builder_log.push({ role: 'user', ts: links[0]?.ts ?? ISO, cls: '',
    text: `BUILD INTENT · ${scheme.name} — ${scheme.tag}\n\nOPERATION: ${scheme.operation}\n\n` +
          `REFERENCE IT COMES FROM: ${scheme.from}\n` +
          (scheme.doNotCopy ? `DO NOT COPY: ${scheme.doNotCopy}\n` : '') +
          `THE TEST IT MUST PASS: ${scheme.henryTest}` });
  events.push({ type: 'reference_changed', ts: links[0]?.ts ?? ISO, cycle: 0, worldVersion: 0,
    data: { name: sheet ? sheet.replace(/^out\/png\/|\.png$/g, '') : 'no sheet', size: refURI.length } });

  links.forEach((c, k) => {
    const cycle = k + 1;
    const w = worldAt.get(c.sha)[scheme.id] ?? { parts: [], flags: [] };
    const world = w.parts;
    const flags = w.flags;
    const { ops, diff } = opsBetween(prevWorld, world);
    const shot = img(wantBlob(c.sha, shotPath(c, scheme.id)));
    const code = c.files.filter((f) => /\.(mjs|js|html|py|json|md|css)$/.test(f) && !f.startsWith('out/'));

    // The ask. A supplied prompt wins; otherwise the commit subject stands in
    // for it and is labelled, because a stand-in passed off as a quotation is
    // the one thing that would make this file worthless.
    const said = supplied.find((t) => t.matches(c, cycle));
    const ask = said ? said.prompt
      : `${c.subject}\n\n[NOT THE USER'S WORDS — this is the commit subject, standing in for the ` +
        `instruction that produced this step. The conversation was not kept in this repository.]`;

    // The findings against THIS state of the house.
    const landed = critLanded && Date.parse(c.ts) >= Date.parse(critLanded.ts);
    const findings = landed ? (crit?.findings ?? []) : [];
    const score = scoreOf(flags, findings, landed ? crit?.verdict : null);
    const accusation = findings[0]?.finding
      ?? (flags.length
        ? `${flags.length} machine flag${flags.length === 1 ? '' : 's'} stand against this plan and no ` +
          `person has read it yet. Worst of them: ${flags[0]}`
        : 'NOT YET CRITIQUED, AND NO MACHINE FLAG WAS RAISED. A low number here means only that ' +
          'nothing looked — not that the house is good.');

    builder_log.push({ role: 'user', ts: c.ts, cls: '', text: ask });
    builder_log.push({ role: 'assistant', ts: c.ts, cls: '', text: c.body || c.subject });

    const receipts = [
      ...ops.map((o) => `ACCEPT · ${o.op} ${o.object.id}`),
      ...code.map((f) => `WROTE · ${f}`),
      `COMMIT · ${c.short}`,
    ];

    history.push({
      id: `cycle-${cycle}-world-${cycle}`, cycle, worldVersion: cycle,
      repairView: k === 0 ? 'PLAN' : 'FRONT',
      summary: (c.body || c.subject) + (code.length
        ? `\n\nWROTE ${code.length} file${code.length === 1 ? '' : 's'}: ${code.slice(0, 8).join(', ')}` +
          `${code.length > 8 ? ` +${code.length - 8} more` : ''}`
        : ''),
      operations: ops, receipts,
      beforeWorld: prevWorld, afterWorld: world, diff,
      // What stood in front of the builder at this step. A supplied image wins:
      // it is what the user actually put there. Otherwise the previous capture,
      // and at the head of the chain the checked sheet the house was built
      // toward. Only one slot exists, so a turn with several images shows its
      // first and keeps the rest in supplied_shots below.
      beforeShot: said?.images?.[0] ?? (k === 0 ? refURI : lastSay),
      afterShot: shot || lastSay || refURI,
      diffShot: '',
      critiques: [{ view: k === 0 ? 'PLAN' : 'FRONT', score, criticism: accusation, ts: c.ts }],
      ts: c.ts,
      // extra, ignored by the reader, kept because whoever opens the zip wants it
      commit: c.short, prompt_is_verbatim: Boolean(said),
      supplied_kind: said?.kind ?? null,
      supplied_shots: said?.images ?? [],
      supplied_names: said?.imageNames ?? [],
    });

    critic_log.push({ role: 'user', ts: c.ts, cls: '',
      text: `OBSERVE ${k === 0 ? 'PLAN' : 'FRONT'} at ${c.short} — ${flags.length} machine flag${flags.length === 1 ? '' : 's'}` });
    for (const f of flags.slice(0, 6)) critic_log.push({ role: 'assistant', ts: c.ts, cls: '', text: f });
    for (const f of findings) critic_log.push({ role: 'assistant', ts: c.ts, cls: '',
      text: `${f.severity} · ${f.where}\n${f.finding}${f.fix ? `\nFIX: ${f.fix}` : ''}` });
    critic_log.push({ role: 'assistant', ts: c.ts, cls: '', text: `SUCK ${score} — ${accusation}` });

    events.push({ type: 'builder_move', ts: c.ts, cycle, worldVersion: cycle,
      data: { cycle, parts: world.length, ops: ops.length, commit: c.short } });
    events.push({ type: 'critique', ts: c.ts, cycle, worldVersion: cycle,
      data: { view: k === 0 ? 'PLAN' : 'FRONT', score } });

    native.push({
      n: cycle, commit: c.short, ts: c.ts,
      ask: { text: said ? said.prompt : c.subject, verbatim: Boolean(said),
             kind: said?.kind ?? null, images: said?.images ?? [],
             imageNames: said?.imageNames ?? [] },
      reasoning: c.body || c.subject,
      code,
      capture: shot || '',
      world: { rooms: w.rooms ?? [], roofs: w.roofs ?? [] },
      diff,
      critique: { score, headline: accusation, flags, findings },
    });

    prevWorld = world; stand = world.length; lastScore = score;
    if (shot) lastSay = shot;
  });

  const last = history[history.length - 1];
  const doc = {
    format: 'OPERATIVE_BUILDER_TRACE_V1',
    exported_at: ISO,
    intent: `${scheme.name} — ${scheme.tag}`,
    reference_name: sheet ? sheet.replace(/^out\/png\/|\.png$/g, '') : 'no checked sheet',
    reference: refURI,
    // NOT a chat model: this loop's builder is a parametric model and its critic
    // is a set of checkers, and naming a chat model here would misdescribe it.
    model: 'henry-house — parametric model, generated drawings, machine critics',
    current_world: prevWorld,
    current_world_version: history.length,
    view_scores: { FRONT: { score: lastScore, criticism: last?.critiques[0]?.criticism ?? '',
                            worldVersion: history.length, ts: last?.ts ?? ISO } },
    history, builder_log, critic_log, events,
    henry_house: {
      scheme: scheme.id, parcel: SITE_CONTEXT.parcelId,
      county: `${SITE.county} County, ${SITE.state}`, coordinate: SITE_CONTEXT.anchor.label,
      status: 'SCHEMATIC DESIGN — NOT FOR CONSTRUCTION. Nothing engineered; ' +
              'code basis void (researched against the wrong state).',
      metrics: m, parts: stand, links: history.length,
      commits: links.map((c) => c.short),
      prompts_verbatim: history.filter((h) => h.prompt_is_verbatim).length,
      critiqued_by_a_person: Boolean(crit),
      provenance: 'Reasoning is the commit body written at the time. Code is the files that ' +
        'commit changed. Pictures are `git show <sha>:<path>` — the capture as it was, not ' +
        "today's. Geometry is the model rebuilt from that commit. Flags are the ones baked " +
        'into scheme-plans.mjs then. The user\'s own words are only here where corpus/ supplied ' +
        'them; every other prompt is the commit subject, and says so in the prompt itself.',
      repository: 'github.com/hartswf0/henry-house',
    },
  };

  const file = `${scheme.id.toLowerCase()}.json`;
  const body = JSON.stringify(doc);
  writeFileSync(`${OUT}/${file}`, body);

  // THE SAME CHAIN, IN THIS PROJECT'S OWN TERMS.
  //
  // The file above is written to somebody else's schema and loses things on the
  // way in: a room becomes an anonymous box, a 3:12 roof becomes a flat slab, and
  // a FATAL finding becomes a sentence with no severity on it. This one keeps
  // them, in feet, and rural-studio-trace.html reads it.
  const nativeDoc = {
    format: 'RURAL_STUDIO_TRACE_V1',
    exported_at: ISO,
    house: { id: scheme.id, name: scheme.name, tag: scheme.tag, operation: scheme.operation,
             from: scheme.from, doNotCopy: scheme.doNotCopy, henryTest: scheme.henryTest },
    site: { parcel: SITE_CONTEXT.parcelId, county: `${SITE.county} County, ${SITE.state}`,
            coordinate: SITE_CONTEXT.anchor.label,
            status: 'SCHEMATIC DESIGN — NOT FOR CONSTRUCTION. Nothing engineered; ' +
                    'code basis void (researched against the wrong state).' },
    metrics: m,
    reference: { name: doc.reference_name, sheet: refURI },
    critiqued_by_a_person: Boolean(crit),
    verdict: crit?.verdict ?? null,
    provenance: doc.henry_house.provenance,
    links: native,
  };
  const nativeFile = `${scheme.id.toLowerCase()}.rs.json`;
  const nativeBody = JSON.stringify(nativeDoc);
  writeFileSync(`${OUT}/${nativeFile}`, nativeBody);
  nativeIndex.push({ file: nativeFile, id: scheme.id, name: scheme.name, tag: scheme.tag,
    links: native.length, parts: stand,
    scores: native.map((l) => l.critique.score), critiqued: Boolean(crit),
    prompts_verbatim: doc.henry_house.prompts_verbatim, bytes: nativeBody.length });
  index.push({ file, builder: 'operative', note: scheme.tag, intent: doc.intent, model: doc.model,
    reference_name: doc.reference_name, exported_at: ISO, cycles: history.length,
    parts: stand, scores: history.map((h) => h.critiques[0].score), bytes: body.length,
    critiqued: Boolean(crit), prompts_verbatim: doc.henry_house.prompts_verbatim });
  say(`  ✓ ${file.padEnd(18)} ${String(history.length).padStart(2)} links · ${String(stand).padStart(3)} parts · ` +
      `suck ${String(history[0]?.critiques[0].score ?? 0).padStart(3)} → ${String(lastScore).padStart(3)} · ` +
      `${(body.length / 1024).toFixed(0)} kB`);
}

// ── the process itself ──────────────────────────────────────────────────────
// The eleven above are each one building. This one is the argument that
// produced all of them, in the order it happened.
const said = CORPUS.get('process') ?? [];
const turns = COMMITS.map((c, i) => {
  const s = said.find((t) => t.matches(c, i + 1));
  const code = c.files.filter((f) => /\.(mjs|js|html|py|json|md|css)$/.test(f) && !f.startsWith('out/'));
  const houses = SCHEMES.filter((x) => CHAIN.get(x.id).includes(c)).map((x) => x.id);
  return {
    i, ts: c.ts, sha: c.short,
    prompt: s ? s.prompt : c.subject,
    prompt_is_verbatim: Boolean(s),
    result: c.body || c.subject,
    artifact: code.length
      ? `${code.length} file${code.length === 1 ? '' : 's'}: ${code.slice(0, 6).join(', ')}${code.length > 6 ? ` +${code.length - 6}` : ''}`
      : null,
    image: s?.images?.[0] ?? img(c._shot) ?? null,
    imageName: s?.imageNames?.[0] ?? c._shotName ?? null,
    houses,
    broken: null,
  };
});
const processDoc = {
  format: 'HUMAN_CORRESPONDENCE_V1',
  who: 'Watson Hartsoe, with a generated model',
  intent: 'Henry House — eleven schemes for one steep parcel, and the argument that produced them',
  span: `${COMMITS[0].ts} → ${HEAD.ts}`,
  note: 'The build process, turn by turn, from this repository\'s own history. The reply is the ' +
        'commit body written at the time; the artifact is the code that turn wrote; the picture is ' +
        'the file AS IT WAS at that commit, recovered with git show, so the sequence shows the ' +
        'building actually changing rather than today\'s version repeated. ' +
        (said.length
          ? `${turns.filter((t) => t.prompt_is_verbatim).length} of ${turns.length} prompts are the user's ` +
            'own words, supplied through corpus/. The rest are commit subjects.'
          : 'THE PROMPTS ARE COMMIT SUBJECTS, NOT THE USER\'S WORDS — the conversation was never kept in ' +
            'this repository, and nothing here is reconstructed from memory. Drop the real transcript ' +
            'into corpus/process/ and re-run tools/export-chains.mjs to replace them.'),
  engine: 'henry-house — parametric model, generated drawings, machine critics',
  critic: 'tools/build-plans.mjs, tools/check/{plan3d,envelope,framing,links}.mjs, and the written ' +
          'critiques in model/scheme-critiques.mjs',
  capture: 'tools/render/shoot-schemes.mjs — progressive accumulation, 64 samples',
  turns,
};
{
  const body = JSON.stringify(processDoc);
  writeFileSync(`${OUT}/henry-house-process.json`, body);
  index.push({ file: 'henry-house-process.json', builder: 'human', note: 'the whole build, turn by turn',
    intent: processDoc.intent, model: processDoc.engine, reference_name: 'the repository itself',
    exported_at: ISO, turns: turns.length, bytes: body.length,
    prompts_verbatim: turns.filter((t) => t.prompt_is_verbatim).length });
  say(`  ✓ henry-house-process.json  ${turns.length} turns · ` +
      `${turns.filter((t) => t.image).length} carry a picture · ${(body.length / 1024 / 1024).toFixed(1)} MB`);
}

// A supplied turn that never found its link is a fault in the corpus, not a
// detail: it means somebody's words were collected and then silently lost.
{
  const orphans = [...CORPUS.entries()].flatMap(([k, v]) =>
    v.filter((t) => !t.used).map((t) => `${k}: ${(t.prompt || '(image only)').slice(0, 48)}`));
  if (orphans.length) {
    say(`  ! ${orphans.length} supplied turn${orphans.length === 1 ? '' : 's'} matched no link and were dropped:`);
    for (const o of orphans) say(`      ${o}`);
  }
}

// ── the index ───────────────────────────────────────────────────────────────
writeFileSync(`${OUT}/index.json`, JSON.stringify({
  generators: { operative: 'henry-house tools/export-chains.mjs', human: 'henry-house tools/export-chains.mjs' },
  formats: { operative: 'OPERATIVE_BUILDER_TRACE_V1', human: 'HUMAN_CORRESPONDENCE_V1' },
  about: 'Eleven houses for one steep parcel in Johnson County, Tennessee, and the process that ' +
         'produced them. One file per house: the reference it was built toward, and then one link ' +
         'per step — what was asked, the reasoning that came back, the code it wrote, the capture ' +
         'as it was at that moment, and the findings against it. Twelfth file is the process itself.',
  reader: 'https://hartswf0.github.io/gunnars-depot.html/operative-builder-trace.html — "Open a trace"',
  traces: index,
  // Kept out of `traces` on purpose: the depot's picker lists everything in that
  // array and would offer a file it cannot read.
  native_format: 'RURAL_STUDIO_TRACE_V1',
  native_reader: 'rural-studio-trace.html',
  native: nativeIndex,
}, null, 1));
say('  ✓ index.json');

// ── the note that travels with the zip ──────────────────────────────────────
// Whoever opens this in six months will not have this conversation. Everything
// they need to know about what is real in here goes in the bag with it.
{
  const houses = index.filter((t) => t.builder === 'operative');
  const verbatim = index.reduce((a, t) => a + (t.prompts_verbatim ?? 0), 0);
  const links = houses.reduce((a, t) => a + t.cycles, 0);
  const uncritiqued = houses.filter((t) => !t.critiqued).length;
  const B = String.fromCharCode(96);               // a backtick, inside a table cell
  const L = [];
  L.push('# HENRY HOUSE — BUILD CHAINS', '');
  L.push('Eleven houses for one steep parcel in Johnson County, Tennessee, and the process');
  L.push(`that produced them. ${houses.length} house chains + 1 process chain.`, '');
  L.push('## Open one', '');
  L.push('Two readers ship in this folder. Serve it once and both work:', '');
  L.push('    python3 -m http.server 8000', '');
  L.push('| | |', '|---|---|');
  L.push(`| <http://localhost:8000/rural-studio-trace.html> | **ours.** Reads the ${B}.rs.json${B} ` +
         'files — rooms keep their names, roofs keep their pitch, findings keep their severity. |');
  L.push(`| <http://localhost:8000/chains.html> | the depot's reader, vendored. Reads the ${B}.json${B} ` +
         'files, in its schema. |', '');
  L.push(`Both take ${B}?trace=s3-narrow${B} to open one house. For the process chain, ours`);
  L.push(`takes ${B}?trace=process${B} and the depot's takes ${B}?trace=henry-house-process${B}.`);
  L.push('Both have to be **served**, not double-clicked: browsers refuse ES modules over');
  L.push(`${B}file://${B}, and three.js would never load. Each says so if you try.`, '');
  L.push("**Or on the depot's hosted page.**");
  L.push('<https://hartswf0.github.io/gunnars-depot.html/operative-builder-trace.html> →');
  L.push(`**Open a trace** → pick one of the plain ${B}.json${B} files. Every one is verified`);
  L.push('against that page at 1280px and 390px before it ships.', '');
  L.push('## Two files per house, on purpose', '');
  L.push(`| | format | what it is for |`, '|---|---|---|');
  L.push(`| ${B}s3-narrow.json${B} | OPERATIVE_BUILDER_TRACE_V1 | opens in the depot's reader, ` +
         'anywhere it is hosted |');
  L.push(`| ${B}s3-narrow.rs.json${B} | RURAL_STUDIO_TRACE_V1 | this project's own, and lossless |`, '');
  L.push("The depot's schema drops three things on the way in, and they are three this");
  L.push('project argues with: a room becomes an anonymous box, a 3:12 roof becomes a flat');
  L.push(`slab (an operative part carries ${B}rotation_y${B} and pitch cannot be stated in it), and`);
  L.push('a FATAL finding becomes a sentence with no severity on it. The native file keeps');
  L.push('all three, in feet, and sets each roof on the base the model derives for it rather');
  L.push('than one height guessed for the whole house.', '');
  L.push('## What a link holds', '');
  L.push('A chain is the loop this project ran, and every link carries all six parts of it:', '');
  L.push('| in the file | what it is | where it came from |', '|---|---|---|');
  L.push(`| ${B}builder_log${B} role ${B}user${B} | **the ask** | corpus/ where supplied — otherwise the ` +
         'commit subject, and the prompt itself says so |');
  L.push(`| ${B}history[].summary${B} | **the reasoning** | the commit body, written at the time |`);
  L.push(`| ${B}history[].receipts${B} ${B}WROTE ·${B} | **the code** | the files that commit changed |`);
  L.push(`| ${B}history[].beforeShot${B} | **what was in front of it** | a supplied image, else the ` +
         'previous capture, else the checked sheet |');
  L.push(`| ${B}history[].afterShot${B} | **the capture** | ${B}git show <sha>:out/schemes/…${B} — the ` +
         "picture AS IT WAS, not today's |");
  L.push(`| ${B}history[].critiques[0]${B} | **the interpretation** | machine flags as they stood at that ` +
         'commit, plus the written critique once it landed |');
  L.push(`| ${B}beforeWorld${B} / ${B}afterWorld${B} / ${B}diff${B} | **the geometry** | ${B}model/${B} ` +
         'extracted at that commit and rebuilt |', '');
  L.push('## The score', '');
  L.push('SUCK, lower is better, capped at 100:', '');
  L.push('    flags × 4  +  FATAL 34  +  MAJOR 15  +  MINOR 5  +  LOSS verdict 6', '');
  L.push('Stated so it can be recomputed and argued with. **A low score is not a good');
  L.push(`building.** ${uncritiqued} of the ${houses.length} houses have never had a written critic pass, and where`);
  L.push('that is true the accusation says so in capitals. The Square scores 0 because');
  L.push('nothing has looked at it.', '');
  L.push('An early link often scores 0 for the same reason: the house had no checked plan');
  L.push('yet, so there was nothing to raise a flag against. The number rising down the');
  L.push('chain is the checking arriving, not the house getting worse.', '');
  L.push('## What is honest about this, and what is not', '');
  if (verbatim) {
    L.push(`${verbatim} prompt${verbatim === 1 ? '' : 's'} in this export ` +
           `${verbatim === 1 ? 'is' : 'are'} the user's own words, supplied through corpus/.`);
    L.push('Every other ask is the commit subject, standing in for the instruction that');
    L.push('produced that step.');
  } else {
    L.push("**No prompt in this export is the user's own words.** The conversation was never");
    L.push('kept in this repository. Every ask is the commit subject, standing in for the');
    L.push('instruction that produced that step.');
  }
  L.push('Each one says so inside the prompt text, where the reader will show it, and');
  L.push('nothing is reconstructed from memory.', '');
  L.push(`Roofs are flat slabs: an operative part carries ${B}rotation_y${B} only, so a 3:12 pitch`);
  L.push('cannot be stated in this schema, and it is not faked.', '');
  L.push(`${B}diffShot${B} is empty throughout — no geometry-diff renders were ever made.`, '');
  L.push('To replace the stand-in prompts with the real ones, drop them into ' +
         `${B}corpus/${B} in the`);
  L.push(`henry-house repository (see ${B}corpus/README.md${B}) and re-run`);
  L.push(`${B}node tools/export-chains.mjs --zip${B}.`, '');
  L.push('## Provenance', '');
  L.push(`${links} links across ${houses.length} houses, from ${COMMITS.length} commits between ` +
         `${COMMITS[0].ts.slice(0, 10)} and ${HEAD.ts.slice(0, 10)}.`);
  L.push(`Generated by ${B}tools/export-chains.mjs${B} in <https://github.com/hartswf0/henry-house>,`);
  L.push(`exported ${ISO.slice(0, 10)}.`, '');
  L.push('SCHEMATIC DESIGN — NOT FOR CONSTRUCTION. Nothing here is engineered, and the code');
  L.push('basis is void: it was researched against the wrong state.', '');
  writeFileSync(`${OUT}/README.md`, L.join('\n'));
  say('  ✓ README.md');
}

// ── a reader that travels with them ─────────────────────────────────────────
// The chains are written to a schema a public page reads, and they are verified
// against that page. But a bag of JSON whose only reader is somebody else's
// website is one outage away from being unopenable, so a copy of the reader
// goes in the bag. See tools/trace/player/PROVENANCE.md.
cpSync('tools/trace/player', OUT, { recursive: true });
say('  ✓ chains.html + vendor/  (the reader, so this folder opens on its own)');

// ── the zip ─────────────────────────────────────────────────────────────────
if (process.argv.includes('--zip')) {
  const zip = 'out/henry-house-chains.zip';
  try { execFileSync('rm', ['-f', zip]); } catch { /* nothing to remove */ }
  // -r, not -j: the player needs vendor/three/ to still be a directory.
  execFileSync('zip', ['-q', '-r', 'henry-house-chains.zip', 'henry-house-chains'], { cwd: 'out' });
  const n = execFileSync('unzip', ['-Z1', zip]).toString().trim().split('\n').length;
  say(`  ✓ ${zip}  (${(statSync(zip).size / 1024 / 1024).toFixed(1)} MB, ${n} entries)`);
}
rmSync(TMP, { recursive: true, force: true });
say('='.repeat(74));
say(`  ${index.length} chains · cd ${OUT} && python3 -m http.server 8000 → /chains.html`);
