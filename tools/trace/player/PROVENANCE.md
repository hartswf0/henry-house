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
