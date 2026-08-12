// IS THE BUILDING ACTUALLY IN THE PICTURE?
//
// The hero camera is derived from each scheme's own bounds so that a 72 ft bar
// and an 18 ft tower are both framed to themselves. The derivation has a hole:
// `size` is the largest of width, depth and HEIGHT, so a scheme with a small
// footprint and two storeys — the Assembly, the Square — gets a short standoff
// and a steep downward angle, and the 0.16 lens shift then pushes the subject
// further down the frame. The Assembly's house ended up half out of the bottom
// edge with the hillside filling the rest.
//
// Nobody noticed because nobody was looking at all twenty-two frames, and a
// render that is merely BADLY FRAMED still renders. So: project the building's
// bounding box through each camera and check that it lands inside the frame
// with a margin. This is the same move as every other check here — measure the
// consequence rather than trusting the derivation.
import * as THREE from 'three';
import { SCHEMES, schemeById } from '../../model/schemes.mjs';
import { schemeViews } from '../render/lib/scheme3d.mjs';
import { makeShiftCamera } from '../render/lib/render.mjs';
import { planFor } from '../../model/scheme-plans.mjs';

const ft = (n) => n * 12;
const MARGIN = 0.03;          // 3% of frame — closer than this reads as clipped

console.log('HENRY HOUSE — IS THE BUILDING IN THE PICTURE');
console.log('='.repeat(78));

let failed = 0, passed = 0;
for (const s of SCHEMES) {
  const plan = planFor(s.id);
  // the building as the plan describes it, which is what actually gets built
  const rooms = plan ? plan.levels.flatMap((l) => (l.rooms ?? []).map((r) => ({ ...r, ffe: l.ffe }))) : [];
  let box;
  if (rooms.length) {
    box = new THREE.Box3(
      new THREE.Vector3(Math.min(...rooms.map((r) => r.x0)), Math.min(...rooms.map((r) => r.ffe)),
                        -Math.max(...rooms.map((r) => r.y0 + r.d))),
      new THREE.Vector3(Math.max(...rooms.map((r) => r.x0 + r.w)), Math.max(...rooms.map((r) => r.ffe)) + 8.8,
                        -Math.min(...rooms.map((r) => r.y0))));
  } else {
    const v = s.volumes.filter((x) => x.kind !== 'shelt');
    box = new THREE.Box3(
      new THREE.Vector3(Math.min(...v.map((x) => x.x0)) / 12, Math.min(...v.map((x) => x.ffe)),
                        -Math.max(...v.map((x) => x.y1)) / 12),
      new THREE.Vector3(Math.max(...v.map((x) => x.x1)) / 12, Math.max(...v.map((x) => x.ffe + 10 * (x.storeys ?? 1))),
                        -Math.min(...v.map((x) => x.y0)) / 12));
  }

  for (const V of schemeViews(s.id)) {
    if (V.interior) continue;
    const cam = makeShiftCamera({
      focalMm: V.focal, aspect: V.w / V.h,
      position: new THREE.Vector3(...V.pos), target: new THREE.Vector3(...V.target), shift: V.shift,
    });
    cam.updateMatrixWorld(true);
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, behind = 0, n = 0;
    for (let i = 0; i < 8; i++) {
      const p = new THREE.Vector3(
        i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z);
      const view = p.clone().applyMatrix4(cam.matrixWorldInverse);
      if (view.z > -0.1) { behind++; continue; }        // behind the camera
      const ndc = p.clone().project(cam);
      x0 = Math.min(x0, ndc.x); x1 = Math.max(x1, ndc.x);
      y0 = Math.min(y0, ndc.y); y1 = Math.max(y1, ndc.y);
      n++;
    }
    const label = `${s.id} ${V.id}`.padEnd(26);
    if (behind || !n) { console.log(`  ✗ ${label} ${behind} corners are behind the camera`); failed++; continue; }
    const lim = 1 - MARGIN;
    const out = [];
    if (x0 < -lim) out.push(`${((-x0 - 1) * 50).toFixed(0)}% off the left`);
    if (x1 > lim) out.push(`${((x1 - 1) * 50).toFixed(0)}% off the right`);
    if (y0 < -lim) out.push(`${((-y0 - 1) * 50).toFixed(0)}% off the bottom`);
    if (y1 > lim) out.push(`${((y1 - 1) * 50).toFixed(0)}% off the top`);
    // fills so little of the frame that the scheme is a speck
    const fill = ((x1 - x0) / 2) * ((y1 - y0) / 2);
    if (out.length) {
      failed++;
      console.log(`  ✗ ${label} ${out.join(', ')}`);
    } else if (V.id === 'hero' && fill < 0.04) {
      failed++;
      console.log(`  ✗ ${label} fills ${(fill * 100).toFixed(1)}% of the frame — a hero shot of a hillside`);
    } else {
      passed++;
      console.log(`  ✓ ${label} in frame · fills ${(fill * 100).toFixed(0)}%`);
    }
  }
}

console.log('='.repeat(78));
console.log(`RESULT         ${failed} failed, ${passed} passed`);
console.log('  The compare camera is DELIBERATELY one fixed camera for every scheme, so a');
console.log('  small house is small in it. Only the hero view is framed to its own subject.');
process.exit(failed ? 1 : 0);
