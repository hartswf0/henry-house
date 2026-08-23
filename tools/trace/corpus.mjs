// THE PART OF THE RECORD THAT IS NOT IN GIT.
//
// A commit body says what the model did and why. It does not say what the
// person asked for, and it does not hold the picture they pasted in — those
// lived in a conversation, and this repository never kept one. So the chains
// exported by tools/export-chains.mjs have a slot for them and fill it only
// when it is actually supplied.
//
// Drop the collected material into corpus/ and it lands in the right link:
//
//   corpus/
//     S0-SPINE/turns.json          one house
//     S0-SPINE/images/ref-01.jpg
//     process/turns.json           the build as a whole
//
// turns.json is { "house": "S0-SPINE", "turns": [ … ] }, and a turn says WHERE
// it belongs by exactly one of `sha`, `cycle` or `at`:
//
//   { "sha": "0771630",  "prompt": "the user's actual words",
//     "images": ["images/ref-01.jpg"], "kind": "reference", "note": "" }
//
//   sha     the commit this turn produced — the exact link. Any unique prefix.
//   cycle   1-based position in that house's chain, when the sha is not known.
//   at      an ISO timestamp of when it was said; the turn lands on the FIRST
//           link at or after it — the ask comes before the work answering it.
//   kind    "reference" — a bar the user set BEFORE the move
//           "critique"  — a verdict the user gave on what came back
//
// Nothing here is guessed. A turn that matches no link is reported and dropped
// rather than shifted onto a link it does not belong to.
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve } from 'node:path';

/** Shrink every supplied image once, into the same small JPEG the traces use. */
function shrink(paths) {
  if (!paths.length) return {};
  return JSON.parse(execFileSync('python3', ['tools/trace/shrink-images.py', '620', '54'],
    { input: JSON.stringify(paths), maxBuffer: 1 << 30, stdio: ['pipe', 'pipe', 'ignore'] }).toString());
}

export function loadCorpus(root = 'corpus') {
  const out = new Map();
  out.dropped = [];
  out.supplied = 0;
  if (!existsSync(root)) return out;

  const dirs = readdirSync(root)
    .filter((d) => statSync(join(root, d)).isDirectory() && d !== 'example');
  const files = [];
  const raw = [];
  for (const d of dirs) {
    const f = join(root, d, 'turns.json');
    if (!existsSync(f)) continue;
    let doc;
    try { doc = JSON.parse(readFileSync(f, 'utf8')); }
    catch (e) { out.dropped.push(`${f}: ${e.message}`); continue; }
    const key = doc.house ?? d;
    for (const t of doc.turns ?? []) {
      const imgs = (t.images ?? []).map((p) => resolve(join(root, d, p))).filter((p) => {
        if (existsSync(p)) return true;
        out.dropped.push(`${key}: no such image ${p}`);
        return false;
      });
      files.push(...imgs);
      raw.push({ key, t, imgs });
    }
  }
  const IMG = shrink([...new Set(files)]);

  for (const { key, t, imgs } of raw) {
    if (!t.prompt && !imgs.length) { out.dropped.push(`${key}: a turn with neither prompt nor image`); continue; }
    const where = ['sha', 'cycle', 'at'].filter((k) => t[k] != null);
    if (where.length !== 1) {
      out.dropped.push(`${key}: a turn must say exactly one of sha, cycle or at — got ${where.join('+') || 'none'}`);
      continue;
    }
    const turn = {
      prompt: t.prompt ?? '',
      kind: t.kind === 'critique' ? 'critique' : 'reference',
      note: t.note ?? '',
      images: imgs.map((p) => IMG[p]).filter(Boolean),
      imageNames: imgs.map((p) => p.split('/').pop()),
      used: false,
      matches(commit, cycle) {
        if (t.sha) {
          const hit = commit.sha.startsWith(t.sha) || commit.short.startsWith(t.sha);
          if (hit) this.used = true;
          return hit;
        }
        if (t.cycle != null) {
          const hit = t.cycle === cycle;
          if (hit) this.used = true;
          return hit;
        }
        // Said at a time: it belongs to the first step taken after it was said,
        // and only to that one — a timestamp claims one link, never all of them.
        if (this.used || Date.parse(commit.ts) < Date.parse(t.at)) return false;
        this.used = true;
        return true;
      },
    };
    if (!out.has(key)) out.set(key, []);
    out.get(key).push(turn);
    out.supplied++;
  }
  return out;
}

export function corpusReport(c) {
  if (!c.size) return 'nothing supplied — every prompt will be a labelled commit subject';
  const per = [...c.entries()].map(([k, v]) => `${k}:${v.length}`).join(' ');
  return `${c.supplied} supplied turn${c.supplied === 1 ? '' : 's'} (${per})` +
    (c.dropped.length ? ` · ${c.dropped.length} dropped: ${c.dropped.slice(0, 3).join('; ')}` : '');
}
