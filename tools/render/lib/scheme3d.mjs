// HENRY HOUSE — 3D for the ALTERNATIVE SCHEMES.
//
// Every scheme is built by the same code, on the same hill, under the same sun,
// from the same camera. That is the only way a blind A/B means anything: if one
// scheme got a better light or a friendlier angle, the comparison is theatre.
//
// The schemes are massing propositions, so this builds massing — volumes, roof
// planes, piers, the ground each one disturbs. It deliberately does NOT dress
// them with windows and furniture. At this stage the question is how the house
// meets the hill and how much of it there is, and detail would only flatter
// whichever scheme got detailed first.

import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { SCHEMES, schemeById, metrics } from '../../../model/schemes.mjs';
import { SITE_SLOPE, SITE, ORIENTATION } from '../../../model/geometry.mjs';
import { siteGrade } from '../../../model/site-terrain.mjs';
import * as MAT from './textures.mjs';
import { buildVegetation } from './vegetation.mjs';
import { buildScheme } from './build3d.mjs';
import { planFor } from '../../../model/scheme-plans.mjs';

const F = (inches) => inches / 12;
const ft = (n) => n * 12;
// TWO GROUNDS. The assumed plane the whole package was drawn on, and the
// measured hill at the coordinate the client gave. `real` picks the second.
// They are not variants of one thing: the plane falls SSE and the hill falls
// north, so a scheme rendered on each is lit from opposite sides. That is the
// point of being able to render both.
const assumed = (x, y) => SITE_SLOPE.grade(x, y);
const groundFns = { assumed, real: siteGrade };
const smoothstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/**
 * Finished ground for a scheme: natural everywhere, except where the scheme
 * declares a bench or plinth. Piers disturb nothing, which is the entire
 * argument of the schemes that use them.
 */
export function schemeGround(s, natural = assumed) {
  const G = s.ground;
  const fade = ft(14);

  // THE CLEARANCE CUT. Every scheme, piers included.
  //
  // A 22 ft deep body on a 30% cross-slope rises 6.6 ft from its downhill face
  // to its uphill one, so a floor set near the downhill grade has its uphill
  // end underground. Leaving the terrain natural under a pier scheme is what
  // made the walkthrough show half houses buried to the sill — and it was not
  // just a rendering fault, it was the model quietly asserting that a pier
  // house needs no earthwork on a 30% slope. model/schemes.mjs now counts this
  // cut in the scheme's earthwork; this cuts the same ground by the same rule,
  // so the picture and the number cannot disagree.
  const cond = s.volumes.filter(v => v.kind !== 'shelt');
  const clear = (x, y, nat) => {
    let z = nat;
    for (const v of cond) {
      const floor = ft(v.ffe) - 12;
      if (nat <= floor) continue;
      const inx = smoothstep(v.x0 - fade, v.x0, x) * (1 - smoothstep(v.x1, v.x1 + fade, x));
      // uphill of the volume the cut lays back at 1.5H:1V rather than standing vertical
      const layback = Math.min(1, Math.max(0, 1 - (y - v.y1) / (fade * 1.5)));
      const iny = smoothstep(v.y0 - fade, v.y0, y) * (y <= v.y1 ? 1 : layback);
      const k = inx * iny;
      if (k < 0.002) continue;
      z = Math.min(z, nat + (floor - nat) * k);
    }
    return z;
  };

  if (G.kind === 'piers') return (x, y) => clear(x, y, natural(x, y));

  const zPad = natural((G.x0 + G.x1) / 2, G.y0);     // platform meets grade at the low edge
  return (x, y) => {
    const nat = natural(x, y);
    const inx = smoothstep(G.x0 - fade, G.x0, x) * (1 - smoothstep(G.x1, G.x1 + fade, x));
    const iny = smoothstep(G.y0 - fade, G.y0, y) * (1 - smoothstep(G.y1, G.y1 + fade, y));
    const k = inx * iny;
    // uphill of the platform the cut lays back at 1.5H:1V
    const z = y > G.y1 ? Math.min(nat, zPad + (y - G.y1) / 1.5) : zPad;
    return clear(x, y, k < 0.002 ? nat : nat + (z - nat) * k);
  };
}

function terrain(groundFn, realtime) {
  const W = realtime ? 620 : 900, SEG = realtime ? 96 : 150;
  const g = new THREE.PlaneGeometry(W, W, SEG, SEG);
  g.rotateX(-Math.PI / 2);
  const cx = F(ft(34)), cz = 26;
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const tx = p.getX(i) + cx, tz = p.getZ(i) + cz;
    p.setX(i, tx); p.setZ(i, tz);
    p.setY(i, F(groundFn(tx * 12, -tz * 12)));
  }
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, MAT.groundMaterial());
  m.receiveShadow = true;
  return m;
}

const boxAt = (x0, x1, y0, y1, z0, z1, mat, cast = true) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(F(x1 - x0), F(z1 - z0), F(y1 - y0)), mat);
  m.position.set(F((x0 + x1) / 2), F((z0 + z1) / 2), -F((y0 + y1) / 2));
  m.castShadow = cast; m.receiveShadow = true;
  return m;
};

/** A shed roof plane: a thin slab tilted about the X axis, falling toward -Y. */
function shed(r, mat, base) {
  const wIn = r.x1 - r.x0, dIn = r.y1 - r.y0;
  const rise = (r.pitch / 12) * dIn;
  const len = Math.hypot(dIn, rise);
  const m = new THREE.Mesh(new THREE.BoxGeometry(F(wIn), F(10), F(len)), mat);
  m.position.set(F((r.x0 + r.x1) / 2), F(base + rise / 2), -F((r.y0 + r.y1) / 2));
  m.rotation.x = -Math.atan2(rise, dIn);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

/** Post-and-beam frame, drawn where a volume is sheltered rather than enclosed. */
function frame(v, zTop, mat) {
  const g = new THREE.Group();
  const post = (x, y) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(F(7), F(zTop - v.ffeIn), F(7)), mat);
    m.position.set(F(x), F((v.ffeIn + zTop) / 2), -F(y));
    m.castShadow = true;
    g.add(m);
  };
  post(v.x0 + 6, v.y0 + 6); post(v.x1 - 6, v.y0 + 6);
  post(v.x0 + 6, v.y1 - 6); post(v.x1 - 6, v.y1 - 6);
  return g;
}

export function buildSchemeScene(renderer, { schemeId, sun, realtime = false, ground = 'assumed' } = {}) {
  const s = schemeById(schemeId) ?? SCHEMES[0];
  const natural = groundFns[ground] ?? assumed;
  const mats = {
    solid: MAT.sidingMaterial(),
    // Explicit dark standing seam. The shared roofMaterial reads warm and pale
    // at this sun angle and was being mistaken for the timber structure under it.
    roof: MAT.simple(0x2b3138, 0.42, 0.55),
    conc: MAT.concreteMaterial(),
    glass: MAT.glassMaterial({ clear: true }),
    deck: MAT.floorMaterial(),
    steel: MAT.simple(0x3a4148, 0.55, 0.35),
    timber: MAT.simple(0x9c7f5c, 0.86, 0),
  };

  const scene = new THREE.Scene();
  const groundFn = schemeGround(s, natural);
  scene.add(terrain(groundFn, realtime));

  // The building itself is built by build3d.mjs: framed openings, posts and
  // beams, roofs with fascia and overhang, decks with guards, piers with caps
  // and the beams they carry. Boxes answered "how much house"; this answers
  // "is it a building".
  const g = buildScheme(s, {
    wall: mats.solid, roof: mats.roof, trim: mats.timber, glass: mats.glass,
    conc: mats.conc, steel: mats.steel, deck: mats.deck,
  }, groundFn);

  scene.add(g);

  scene.add(buildVegetation({
    heightAt: groundFn,
    naturalAt: natural,
    // clear the foreground as well as the pad, or the comparison is of trees
    keepOut: (X, Y) => X > ft(-44) && X < ft(112) && Y > ft(-105) && Y < ft(64),
    F, ft,
    counts: realtime ? { conifer: 90, hardwood: 70, shrub: 160, grass: 320 }
                     : { conifer: 150, hardwood: 120, shrub: 280, grass: 560 },
  }));

  // ── sky and light — identical for every scheme ────────────────────────────
  const sky = new Sky();
  sky.scale.setScalar(45000);
  const u = sky.material.uniforms;
  u.turbidity.value = 3.2; u.rayleigh.value = 1.4;
  u.mieCoefficient.value = 0.006; u.mieDirectionalG.value = 0.82;
  u.sunPosition.value.copy(sun.dir).multiplyScalar(10000);
  scene.add(sky);

  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  scene.environment = pmrem.fromScene(new THREE.Scene().add(sky.clone()), 0.04).texture;
  pmrem.dispose();

  const sunLight = new THREE.DirectionalLight(0xfff2e0, 3.1);
  sunLight.position.copy(sun.dir).multiplyScalar(700);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(realtime ? 1024 : 2048, realtime ? 1024 : 2048);
  const c = sunLight.shadow.camera;
  c.left = -170; c.right = 170; c.top = 170; c.bottom = -170; c.near = 1; c.far = 1600;
  sunLight.shadow.bias = -0.0004;
  sunLight.shadow.normalBias = 0.06;
  const focus = new THREE.Vector3(F(ft(34)), F(ft(10)), -F(ft(12)));
  sunLight.target.position.copy(focus);
  scene.add(sunLight, sunLight.target);

  // A second, sampled light: each accumulation pass moves it around the sky
  // hemisphere, which is what turns hard ambient into real soft shadow.
  const skyLight = new THREE.DirectionalLight(0xbdd3e6, 0.55);
  skyLight.castShadow = true;
  skyLight.shadow.mapSize.set(1024, 1024);
  const sc = skyLight.shadow.camera;
  sc.left = -170; sc.right = 170; sc.top = 170; sc.bottom = -170; sc.near = 1; sc.far = 1600;
  skyLight.shadow.bias = -0.0006; skyLight.shadow.normalBias = 0.08;
  scene.add(skyLight, skyLight.target);
  scene.add(new THREE.HemisphereLight(0x9fb6cf, 0x51492f, 0.13));

  return {
    scene, scheme: s, metrics: metrics(s), ground,
    // the building alone, and the finished ground under it — tools/check reads
    // both, so a check never has to infer which meshes are the house
    building: g, heightAt: groundFn,
    rig: { sun: sunLight, skyLight, focus,
           sunDir: sun.dir.clone(), sunSpread: 0.035, sunDistance: 900, skyDistance: 700 },
  };
}

/**
 * ONE FIXED CAMERA for every scheme — not one framed to each.
 *
 * The reference wall is explicit: "put HENRY's plan and section beside them AT
 * THE SAME SCALE." A camera that flatters each scheme to the same frame size
 * hides the only thing worth comparing. From here the 134 ft Spine fills the
 * frame and the 18 ft Tower is a small object on a big hill, which is the
 * truth about them.
 */
export const SCHEME_CAMERA = {
  pos: [-50, 31, 104],
  target: [42, 13, -6],
  focal: 40,
  shift: 0.03,
};
export function schemeCamera() { return SCHEME_CAMERA; }

/**
 * The views each scheme is rendered from, at the SAME standard as the main
 * house: 1700 x 1062, 64 samples, level cameras with a shifted frame so
 * verticals stay plumb, and the same October afternoon sun.
 *
 * Three views, and each has a job:
 *
 *   compare  ONE camera, identical for every scheme, never derived. This is
 *            the A/B shot: the Perch is small in frame because it IS small.
 *            Deriving it per scheme would flatter whichever scheme framed best.
 *   hero     derived from the scheme's own bounds, so a 72 ft bar and an 18 ft
 *            tower are each seen properly rather than one of them being a speck.
 *   interior  placed INSIDE the scheme's largest living room from its checked
 *            plan, at eye height, looking downhill at the view the whole site
 *            argument is about. Only possible now that the plans exist.
 */
export function schemeViews(schemeId) {
  const s = schemeById(schemeId);
  const out = [{ id: 'compare', ...SCHEME_CAMERA, w: 1700, h: 1062, exposure: 1.0,
                 sun: { dayOfYear: 288, hour: 13.6 } }];
  if (!s) return out;

  const cond = s.volumes.filter(v => v.kind !== 'shelt');
  const bx0 = Math.min(...cond.map(v => v.x0)) / 12, bx1 = Math.max(...cond.map(v => v.x1)) / 12;
  const by0 = Math.min(...cond.map(v => v.y0)) / 12, by1 = Math.max(...cond.map(v => v.y1)) / 12;
  const top = Math.max(...cond.map(v => v.ffe + 10 * (v.storeys ?? 1)));
  const w = bx1 - bx0, d = by1 - by0;
  const size = Math.max(w, d, top);
  const cx = (bx0 + bx1) / 2, cy = (by0 + by1) / 2;

  // Stand off downhill and to the west by a distance proportional to the
  // scheme, so framing is consistent rather than accidental.
  // Stand mostly DOWNHILL rather than off to the west: the west side of this
  // site carries a rock outcrop, and the first version of this camera put it
  // straight through the left third of every hero shot.
  const dist = size * 1.7 + 38;
  out.push({
    id: 'hero',
    pos: [cx - dist * 0.20, top * 0.95 + 16, -(by0 - dist * 1.0)],
    target: [cx + w * 0.08, top * 0.55, -(cy - d * 0.1)],
    focal: 38, shift: 0.16, w: 1700, h: 1062, exposure: 1.02,
    sun: { dayOfYear: 288, hour: 13.9 },
  });

  const plan = planFor(schemeId);
  if (plan) {
    // the biggest room anyone sits in, on the level with the most of them
    let best = null;
    for (const lv of plan.levels) {
      for (const r of lv.rooms ?? []) {
        if (r.use !== 'living' && r.use !== 'dining') continue;
        const a = r.w * r.d;
        if (!best || a > best.a) best = { a, r, ffe: lv.ffe };
      }
    }
    if (best) {
      const { r, ffe } = best;
      const eye = ffe + 5.4;
      out.push({
        id: 'interior',
        // stand at the uphill end of the room and look downhill, out of the glass
        pos: [r.x0 + r.w / 2, eye, -(r.y0 + r.d - 1.5)],
        target: [r.x0 + r.w / 2, eye - 0.6, -(r.y0 - 40)],
        focal: 22, shift: 0.04, w: 1620, h: 1110, exposure: 0.95, interior: true,
        sun: { dayOfYear: 288, hour: 13.4 },
        room: r.name,
      });
    }
  }
  return out;
}
