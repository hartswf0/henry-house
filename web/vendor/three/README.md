# Vendored three.js — r170

These four files are committed to the repository ON PURPOSE.

`node_modules/` is gitignored, so `web/walk.html` resolved `three` to a path
that existed only on a machine that had run `npm install`. Anyone else who
cloned the repository — or opened the page from GitHub Pages, or from a
checkout without a build step — got three 404s and a blank canvas:

    three.module.js          404
    OrbitControls.js         404
    PointerLockControls.js   404

The walkthrough is meant to be openable. A viewer that needs a toolchain
before it will draw anything is not a viewer.

Copied verbatim from `three@0.170.0`, MIT licensed:

    three/build/three.module.js                     -> three.module.js
    three/examples/jsm/controls/OrbitControls.js    -> addons/controls/
    three/examples/jsm/controls/PointerLockControls.js
    three/examples/jsm/objects/Sky.js               -> addons/objects/

To update: bump the dependency, re-run `node tools/render/vendor-three.mjs`,
and commit the result.
