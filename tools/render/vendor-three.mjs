// Copy the three.js files the browser needs out of node_modules and into the
// repository, because node_modules is not in the repository.
//
// web/walk.html used to import three from '../node_modules/...'. That path
// exists only on a machine that has run `npm install`, so for everyone else the
// walkthrough was three 404s and a blank canvas. A viewer that needs a
// toolchain before it will draw anything is not a viewer.
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const SRC = ROOT + 'node_modules/three/';
const DST = ROOT + 'web/vendor/three/';

const FILES = [
  ['build/three.module.js', 'three.module.js'],
  ['examples/jsm/controls/OrbitControls.js', 'addons/controls/OrbitControls.js'],
  ['examples/jsm/controls/PointerLockControls.js', 'addons/controls/PointerLockControls.js'],
  ['examples/jsm/objects/Sky.js', 'addons/objects/Sky.js'],
];

const version = JSON.parse(readFileSync(SRC + 'package.json', 'utf8')).version;
mkdirSync(DST + 'addons/controls', { recursive: true });
mkdirSync(DST + 'addons/objects', { recursive: true });
for (const [from, to] of FILES) {
  copyFileSync(SRC + from, DST + to);
  console.log(`  ✓ ${to}`);
}
console.log(`three@${version} vendored into web/vendor/three/`);
