# Where this player came from

`chains.html` is **not ours**. It is
[`operative-builder-trace.html`](https://github.com/hartswf0/gunnars-depot.html)
from `hartswf0/gunnars-depot.html` @ `da5b704`, vendored here so a chain can be
read without depending on that site being reachable.

The chains this repository exports are written to that page's schemas
(`OPERATIVE_BUILDER_TRACE_V1`, `HUMAN_CORRESPONDENCE_V1`) and are verified
against the real page by `tools/trace/verify-chains.mjs`. They open in the
hosted copy at
<https://hartswf0.github.io/gunnars-depot.html/operative-builder-trace.html>
exactly as they open here. This copy is the fallback, not a fork.

## What was changed

Four things, all of them about where files live rather than what the page does:

1. `fetch('assets/traces/index.json')` → `fetch('index.json')`
2. `fetch('assets/traces/' + f)` → `fetch(f)` — the picker
3. `fetch('assets/traces/' + pick.file)` → `fetch(pick.file)` — the boot
4. A failed index no longer leaves the curtain down over a working file picker,
   and a classic `<script>` at the end of `<body>` explains the blank page you
   get from opening the file straight off the disk.

Nothing in the adapters, the renderer or the playback was touched. To re-vendor
a newer copy, re-apply exactly those four patches.

## Licences

`vendor/three/` is three.js, MIT — see `vendor/three/LICENSE`.

---

## `rural-studio-trace.html` is a different thing — it is ours

Not vendored, not a fork. It reads `RURAL_STUDIO_TRACE_V1`, which is this
project's own format, and it exists because the depot's schema cannot carry
three things this project argues about:

| | in the depot's schema | in ours |
|---|---|---|
| a room | an anonymous box | keeps its **name** and its **use**, and is coloured by use |
| a roof | a flat slab — an operative part carries `rotation_y` only, so a 3:12 pitch cannot be stated | built at its **real pitch**, on the base `schemes.roofBase()` derives for that plane |
| a finding | a sentence | keeps **FATAL / MAJOR / MINOR**, where it is, and the fix proposed |

It also marks every prompt as **their words** or **stand-in**, because most of
them are commit subjects and a reader should never have to guess which.

The aesthetic is deliberately the depot's — paper rather than console, one
thread, two voices, the score in large type — because these are the same kind of
document and should read as a set.

`tools/trace/verify-rural.mjs` drives it headless at 1280 and 390: every chain
has to open, advance on its own, stand inside the frame, and arrive with its
roofs actually pitched.
