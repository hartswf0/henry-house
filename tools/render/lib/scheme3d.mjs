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
import { SITE_SLOPE } from '../../../model/geometry.mjs';
import * as MAT from './textures.mjs';
import { buildVegetation } from './vegetation.mjs';

const F = (inches) => inches / 12;
const ft = (n) => n * 12;
const natural = (x, y) => SITE_SLOPE.grade(x, y);
const smoothstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/**
 * Finished ground for a scheme: natural everywhere, except where the scheme
 * declares a bench or plinth. Piers disturb nothing, which is the entire
 * argument of the schemes that use them.
 */
export function schemeGround(s) {
  const G = s.ground;
  if (G.kind === 'piers') return (x, y) => natural(x, y);
  const zPad = natural((G.x0 + G.x1) / 2, G.y0);     // platform meets grade at the low edge
  const fade = ft(14);
  return (x, y) => {
    const nat = natural(x, y);
    const inx = smoothstep(G.x0 - fade, G.x0, x) * (1 - smoothstep(G.x1, G.x1 + fade, x));
    const iny = smoothstep(G.y0 - fade, G.y0, y) * (1 - smoothstep(G.y1, G.y1 + fade, y));
    const k = inx * iny;
    if (k < 0.002) return nat;
    // uphill of the platform the cut lays back at 1.5H:1V
    const z = y > G.y1 ? Math.min(nat, zPad + (y - G.y1) / 1.5) : zPad;
    return nat + (z - nat) * k;
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
function shed(r, mat) {
  const wIn = r.x1 - r.x0, dIn = r.y1 - r.y0;
  const rise = (r.pitch / 12) * dIn;
  const len = Math.hypot(dIn, rise);
  const m = new THREE.Mesh(new THREE.BoxGeometry(F(wIn), F(10), F(len)), mat);
  m.position.set(F((r.x0 + r.x1) / 2), F(r.zLow + rise / 2), -F((r.y0 + r.y1) / 2));
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

export function buildSchemeScene(renderer, { schemeId, sun, realtime = false } = {}) {
  const s = schemeById(schemeId) ?? SCHEMES[0];
  const mats = {
    solid: MAT.sidingMaterial(),
    roof: MAT.roofMaterial(),
    conc: MAT.concreteMaterial(),
    glass: MAT.glassMaterial({ opacity: 0.2 }),
    deck: MAT.floorMaterial(),
  };

  const scene = new THREE.Scene();
  const groundFn = schemeGround(s);
  scene.add(terrain(groundFn, realtime));

  const g = new THREE.Group();
  const STOREY = 120;

  for (const v of s.volumes) {
    const ffeIn = ft(v.ffe);
    v.ffeIn = ffeIn;
    const top = ffeIn + STOREY * (v.storeys ?? 1);
    if (v.kind === 'cond') {
      g.add(boxAt(v.x0, v.x1, v.y0, v.y1, ffeIn, top, mats.solid));
      // the downhill face is the glass face on every scheme
      g.add(boxAt(v.x0 + 8, v.x1 - 8, v.y0 - 2, v.y0 + 3, ffeIn + 18, top - 18, mats.glass, false));
      if (v.core) g.add(boxAt(v.x0 - 3, v.x1 + 3, v.y0 - 3, v.y1 + 3, ffeIn - 36, top + 26, mats.conc));
    } else if (v.kind === 'future') {
      // roofed, floored, framed — but open. This is the territory that becomes
      // rooms later without touching the roof.
      g.add(boxAt(v.x0, v.x1, v.y0, v.y1, ffeIn - 12, ffeIn, mats.deck, false));
      g.add(frame(v, ffeIn + STOREY, mats.solid));
    } else {
      g.add(boxAt(v.x0, v.x1, v.y0, v.y1, ffeIn - 10, ffeIn, mats.deck, false));
      if (v.dFt > 8 && v.wFt > 8) g.add(frame(v, ffeIn + STOREY, mats.solid));
    }
  }

  for (const r of s.roofs) g.add(shed(r, mats.roof));

  // ground contact, drawn honestly: piers are thin, benches are a wall
  if (s.ground.kind === 'piers') {
    for (const [px, py] of s.ground.pts) {
      const zTop = ft(s.volumes.find(v => v.kind === 'cond')?.ffe ?? 4);
      const zBot = natural(px, py) - 36;
      const m = new THREE.Mesh(new THREE.CylinderGeometry(F(s.ground.diaFt * 6), F(s.ground.diaFt * 6), F(zTop - zBot), 12), mats.conc);
      m.position.set(F(px), F((zBot + zTop) / 2), -F(py));
      m.castShadow = true; m.receiveShadow = true;
      g.add(m);
    }
  } else {
    const G = s.ground;
    const zPad = natural((G.x0 + G.x1) / 2, G.y0);
    g.add(boxAt(G.x0, G.x1, G.y0, G.y1, zPad - 30, zPad, mats.conc, false));
  }

  scene.add(g);

  scene.add(buildVegetation({
    heightAt: groundFn,
    naturalAt: natural,
    keepOut: (X, Y) => X > ft(-26) && X < ft(96) && Y > ft(-30) && Y < ft(58),
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
    scene, scheme: s, metrics: metrics(s),
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
  pos: [-72, 56, 148],
  target: [40, 15, -8],
  focal: 40,
  shift: 0.06,
};
export function schemeCamera() { return SCHEME_CAMERA; }
