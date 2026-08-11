// HENRY HOUSE — build ONE HTML FILE that needs nothing.
//
// The brief for this file is a sentence from the client: "no complicated run
// commands, just send link and go."
//
// Everything the walkthrough needs — three.js, the controls, and every model
// file the drawings are generated from — is inlined into a single .html. No
// npm install, no static server, no node_modules, no build step on the far end.
// Open it, or host it anywhere, or attach it to an email.
//
// HOW THE MODULES SURVIVE THE TRIP
//   The pages are real ES modules with relative imports. Concatenating them
//   would collide identifiers (three files define their own `ft`). Instead each
//   module is turned into a Blob at runtime, IN DEPENDENCY ORDER, and every
//   import specifier is rewritten to the concrete blob: URL of the dependency
//   that was created a moment earlier. No import map, no timing problem, no
//   network. The module graph is preserved exactly as written.

import { readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, relative } from 'node:path';

const ROOT = fileURLToPath(new URL('../', import.meta.url));

// Bare specifiers the browser cannot resolve on its own, mapped to real files.
const BARE = {
  'three': 'web/vendor/three/three.module.js',
  'three/addons/': 'web/vendor/three/addons/',
};

const resolveSpec = (spec, fromFile) => {
  if (spec.startsWith('.')) return relative(ROOT, resolve(dirname(resolve(ROOT, fromFile)), spec));
  if (spec === 'three') return BARE.three;
  if (spec.startsWith('three/addons/')) return BARE['three/addons/'] + spec.slice('three/addons/'.length);
  throw new Error(`cannot resolve bare specifier "${spec}" from ${fromFile}`);
};

// Matches static `import ... from '...'`, side-effect `import '...'`, and
// `export ... from '...'`. Enough for this codebase; it has no dynamic imports.
const SPEC_RE = /(\bfrom\s*|\bimport\s*)(['"])([^'"]+)\2/g;

/**
 * Depth-first walk of the module graph, returning files in dependency order.
 * `virtual` supplies sources for ids that have no file on disk — the entry
 * module lifted out of an .html is one of those.
 */
export function graph(entry, virtual = {}) {
  const srcOf = (f) => virtual[f] ?? readFileSync(resolve(ROOT, f), 'utf8');
  const order = [], seen = new Set(), stack = new Set();
  const visit = (file) => {
    if (seen.has(file)) return;
    if (stack.has(file)) throw new Error(`import cycle at ${file}`);
    stack.add(file);
    const src = srcOf(file);
    for (const m of src.matchAll(SPEC_RE)) {
      const spec = m[3];
      if (!spec.startsWith('.') && spec !== 'three' && !spec.startsWith('three/')) continue;
      visit(resolveSpec(spec, file));
    }
    stack.delete(file);
    seen.add(file);
    order.push(file);
  };
  visit(entry);
  return { order, srcOf };
}

/**
 * JSON that is safe to embed inside an inline <script>.
 *
 * JSON.stringify does not escape "</script>", U+2028 or U+2029. Any one of them
 * inside a source string ends the script tag early or breaks the parser, which
 * shows up as a bare "Invalid or unexpected token" with no clue where.
 */
const jsonSafe = (v) => JSON.stringify(v)
  .replace(/</g, '\\u003C')
  .replace(/\u2028/g, '\\u2028')
  .replace(/\u2029/g, '\\u2029');

/** The runtime loader, as a classic script. Runs before any module executes. */
function loader(order, srcOf, entry) {
  const mods = order.map((file) => {
    const src = srcOf(file);
    return {
      id: file, src,
      deps: [...new Map([...src.matchAll(SPEC_RE)]
        .map(m => m[3])
        .filter(s => s.startsWith('.') || s === 'three' || s.startsWith('three/'))
        .map(s => [s, resolveSpec(s, file)])).entries()],
    };
  });
  return `
const __SRC = ${jsonSafe(Object.fromEntries(mods.map(m => [m.id, m.src])))};
const __DEPS = ${jsonSafe(Object.fromEntries(mods.map(m => [m.id, m.deps])))};
const __ORDER = ${jsonSafe(order)};
const __URL = {};
for (const id of __ORDER) {
  let src = __SRC[id];
  for (const [spec, target] of __DEPS[id]) {
    const url = __URL[target];
    if (!url) throw new Error('dependency not built: ' + target + ' for ' + id);
    // Replace the specifier, not the whole statement, so import syntax is untouched.
    src = src.split("'" + spec + "'").join("'" + url + "'").split('"' + spec + '"').join('"' + url + '"');
  }
  __URL[id] = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
}
window.__HH_ENTRY = __URL[${jsonSafe(entry)}];
`;
}

/**
 * Build a standalone page.
 * `htmlFile` supplies the markup; its <script type="module"> body becomes the
 * entry module, and its importmap is dropped because nothing is fetched.
 */
export function bundleHtml(htmlFile) {
  const raw = readFileSync(resolve(ROOT, htmlFile), 'utf8');

  const entryMatch = raw.match(/<script type="module">([\s\S]*?)<\/script>/);
  if (!entryMatch) throw new Error(`${htmlFile} has no <script type="module">`);
  const entrySrc = entryMatch[1];

  // Pseudo-entry, resolved against the html file's directory. It never touches
  // disk — writing a temp file next to the source would be a real file that a
  // watcher, a linter or a git status could trip over.
  const entryId = htmlFile.replace(/\.html$/, '.__entry.mjs');
  const { order, srcOf } = graph(entryId, { [entryId]: entrySrc });
  const script = loader(order, srcOf, entryId);
  // The replacements MUST be functions. With a string replacement, String.replace
  // interprets $& $` $' and $1 inside it — and three.module.js contains a bare
  // $' — which spliced the page's own closing tags into the middle of the
  // bundled source and produced "Invalid or unexpected token" 1.3 MB from the
  // actual cause. A function replacement disables all of that.
  const inject = `<script>\n${script}\n</script>\n<script type="module">import(window.__HH_ENTRY);</script>`;
  const out = raw
    .replace(/<script type="importmap">[\s\S]*?<\/script>/, () => '')
    .replace(/<script type="module">[\s\S]*?<\/script>/, () => inject);
  return { html: out, modules: order.length,
           bytes: Buffer.byteLength(out) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const src = process.argv[2] ?? 'web/walk.html';
  const dst = process.argv[3] ?? 'out/standalone/walk.html';
  mkdirSync(dirname(resolve(ROOT, dst)), { recursive: true });
  const { html, modules, bytes } = bundleHtml(src);
  writeFileSync(resolve(ROOT, dst), html);
  console.log(`  ✓ ${dst}  ${modules} modules, ${(bytes / 1024 / 1024).toFixed(2)} MB — opens with no server, no install`);
}
