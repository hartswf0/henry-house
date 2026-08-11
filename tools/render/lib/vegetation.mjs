// HENRY HOUSE — vegetation.
//
// No network here, so there are no scanned plant assets. Everything is grown
// from code: conifers as layered whorls, hardwoods as noise-displaced canopy
// blobs, rhododendron thickets, and grass tufts as tapered blades.
//
// The date is set to mid-October because that is when the Blue Ridge does the
// thing it is famous for. Fall colour against dark siding is not decoration —
// it is the single strongest argument for this site and this orientation.

import * as THREE from 'three';

const rng = (seed) => { let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; };

/** Merge a list of geometries into one non-indexed BufferGeometry. */
function merge(list) {
  const geos = list.map(g => g.index ? g.toNonIndexed() : g);
  let n = 0;
  for (const g of geos) n += g.attributes.position.count;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3);
  let o = 0;
  for (const g of geos) {
    const p = g.attributes.position, m = g.attributes.normal;
    for (let i = 0; i < p.count; i++) {
      pos[(o + i) * 3] = p.getX(i); pos[(o + i) * 3 + 1] = p.getY(i); pos[(o + i) * 3 + 2] = p.getZ(i);
      nor[(o + i) * 3] = m.getX(i); nor[(o + i) * 3 + 1] = m.getY(i); nor[(o + i) * 3 + 2] = m.getZ(i);
    }
    o += p.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  return out;
}

/** Displace an icosahedron into an irregular canopy blob. */
function blob(radius, detail, r, rough = 0.34) {
  const g = new THREE.IcosahedronGeometry(radius, detail);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const k = 1 + (Math.sin(v.x * 1.7 + r() * 0.2) * 0.5 + Math.sin(v.y * 1.3) * 0.5 + Math.sin(v.z * 2.1) * 0.5) * rough;
    v.multiplyScalar(k);
    v.y *= 0.82;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

// ── CONIFER — spruce / hemlock, the dark structure of a Blue Ridge slope ────
function coniferGeo(seed = 1) {
  const r = rng(seed);
  const parts = [];
  const t = new THREE.CylinderGeometry(0.22, 0.5, 9, 6);
  t.translate(0, 4.5, 0);
  parts.push(t);
  const whorls = 7;
  for (let i = 0; i < whorls; i++) {
    const f = i / whorls;
    const rad = 7.6 * (1 - f * 0.78) * (0.85 + r() * 0.3);
    const h = 7.5 * (1 - f * 0.4);
    const c = new THREE.ConeGeometry(rad, h, 9, 1);
    c.rotateY(r() * 3);
    c.translate((r() - 0.5) * 0.8, 6 + i * 5.2 + h * 0.3, (r() - 0.5) * 0.8);
    parts.push(c);
  }
  return merge(parts);
}

// ── HARDWOOD — oak / maple, the colour ──────────────────────────────────────
function hardwoodGeo(seed = 2) {
  const r = rng(seed);
  const parts = [];
  const trunkH = 13 + r() * 5;
  const t = new THREE.CylinderGeometry(0.34, 0.85, trunkH, 7);
  t.translate(0, trunkH / 2, 0);
  parts.push(t);
  // three or four limbs
  for (let i = 0; i < 3 + Math.round(r()); i++) {
    const a = (i / 3.5) * Math.PI * 2 + r();
    const len = 7 + r() * 5;
    const b = new THREE.CylinderGeometry(0.16, 0.4, len, 5);
    b.translate(0, len / 2, 0);
    b.rotateZ(0.55 + r() * 0.4);
    b.rotateY(a);
    b.translate(0, trunkH * 0.72, 0);
    parts.push(b);
  }
  // canopy from overlapping blobs
  const n = 4 + Math.round(r() * 2);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + r() * 0.9;
    const rad = 6.5 + r() * 4.5;
    const d = 5 + r() * 5;
    const c = blob(rad, 1, r);
    c.translate(Math.cos(a) * d, trunkH + 3 + r() * 7, Math.sin(a) * d);
    parts.push(c);
  }
  return merge(parts);
}

// ── RHODODENDRON THICKET — the Blue Ridge understory ────────────────────────
function shrubGeo(seed = 3) {
  const r = rng(seed);
  const parts = [];
  for (let i = 0; i < 3 + Math.round(r() * 2); i++) {
    const c = blob(2.1 + r() * 1.5, 1, r, 0.42);
    c.translate((r() - 0.5) * 3.4, 1.6 + r() * 1.6, (r() - 0.5) * 3.4);
    parts.push(c);
  }
  return merge(parts);
}

// ── GRASS TUFT — tapered blades, read as texture at distance ────────────────
function grassGeo(seed = 4) {
  const r = rng(seed);
  const pos = [], nor = [];
  const blades = 7;
  for (let i = 0; i < blades; i++) {
    const a = r() * Math.PI * 2;
    const h = 1.5 + r() * 1.9;
    const w = 0.10 + r() * 0.06;
    const lean = (r() - 0.5) * 1.2;
    const cx = Math.cos(a) * 0.16, cz = Math.sin(a) * 0.16;
    const dx = Math.cos(a) * lean, dz = Math.sin(a) * lean;
    pos.push(cx - w, 0, cz, cx + w, 0, cz, cx + dx, h, cz + dz);
    for (let k = 0; k < 3; k++) nor.push(0, 0.4, 0.9);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(nor), 3));
  return g;
}

/**
 * Scatter vegetation over the site.
 * `heightAt(Xin, Yin)` -> inches; `naturalAt` lets us avoid disturbed ground.
 */
export function buildVegetation({ heightAt, naturalAt, keepOut, F, ft, counts = {} }) {
  const group = new THREE.Group();
  const r = rng(20260811);

  const N = { conifer: 175, hardwood: 140, shrub: 340, grass: 700, ...counts };

  const place = (n, fn, { minR = 0, maxR = 1e9, allowDisturbed = false, tries = 90 } = {}) => {
    const out = [];
    let guard = 0;
    while (out.length < n && guard++ < n * tries) {
      const X = (r() * 760 - 260) * 12;
      const Y = (r() * 660 - 430) * 12;
      const d = Math.hypot(X / 12 - 36, Y / 12);
      if (d < minR || d > maxR) continue;
      if (keepOut(X, Y)) continue;
      const z = heightAt(X, Y);
      if (!allowDisturbed && Math.abs(z - naturalAt(X, Y)) > 8) continue;
      out.push([X, Y, z]);
    }
    return out;
  };

  const dummy = new THREE.Object3D();
  const col = new THREE.Color();

  const add = (geo, mat, spots, scale, colourFn, sink = 0.5) => {
    const m = new THREE.InstancedMesh(geo, mat, Math.max(1, spots.length));
    m.castShadow = true; m.receiveShadow = true;
    spots.forEach(([X, Y, z], i) => {
      const s = scale(r);
      dummy.position.set(F(X), F(z) - sink, -F(Y));
      dummy.rotation.set(0, r() * 6.283, 0);
      dummy.scale.set(s * (0.86 + r() * 0.28), s, s * (0.86 + r() * 0.28));
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
      if (colourFn) { colourFn(col, r); m.setColorAt(i, col); }
    });
    m.count = spots.length;
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    group.add(m);
    return m;
  };

  const foliageMat = () => new THREE.MeshStandardMaterial({ color: 0x6b6b6b, roughness: 0.95, metalness: 0, flatShading: false });
  const barkMat = new THREE.MeshStandardMaterial({ color: 0x2e2620, roughness: 0.95 });

  // conifers keep their dark green and hold the composition together
  add(coniferGeo(11), foliageMat(), place(N.conifer, null, { minR: 62 }), () => 0.7 + r() * 0.85,
    (c, rr) => { const t = rr(); c.setHSL(0.27 - t * 0.03, 0.34 + t * 0.12, 0.055 + t * 0.035); });

  // hardwoods carry the October colour: gold through orange to deep red
  add(hardwoodGeo(23), foliageMat(), place(N.hardwood, null, { minR: 58 }), () => 0.75 + r() * 0.8,
    (c, rr) => {
      const t = rr();
      if (t < 0.44) c.setHSL(0.098 - t * 0.010, 0.52, 0.150 + t * 0.060);     // ochre
      else if (t < 0.78) c.setHSL(0.062 - (t - 0.44) * 0.014, 0.56, 0.115);   // burnt orange
      else c.setHSL(0.035 - (t - 0.78) * 0.008, 0.48, 0.082);                 // deep russet
    });

  add(shrubGeo(31), foliageMat(), place(N.shrub, null, { minR: 34 }), () => 0.8 + r() * 1.0,
    (c, rr) => { const t = rr(); c.setHSL(0.26 - t * 0.03, 0.30 + t * 0.10, 0.052 + t * 0.030); }, 0.9);

  // grass only near the house, where it is actually read
  add(grassGeo(41), foliageMat(), place(N.grass, null, { minR: 26, maxR: 125, allowDisturbed: false, tries: 30 }),
    () => 0.8 + r() * 0.9,
    (c, rr) => { const t = rr(); c.setHSL(0.13 - t * 0.03, 0.36 + t * 0.18, 0.090 + t * 0.060); }, 0.2);

  return group;
}

export { coniferGeo, hardwoodGeo, shrubGeo, grassGeo, merge, blob };
