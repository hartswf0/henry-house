// HENRY HOUSE — systems drawn in 3D as real routed runs.
// Reads model/systems.mjs, which routes from the actual fixture positions.

import * as THREE from 'three';
import { allRuns, SYSTEM_COLOURS, SYSTEM_GROUPS, CHASES, SOURCES } from '/model/systems.mjs';

const F = (i) => i / 12;
const P = (p) => new THREE.Vector3(F(p[0]), F(p[2]), -F(p[1]));   // model -> three

/** One run as a cylinder between two points, with a joint sphere at each end. */
function tube(a, b, radius, mat) {
  const va = P(a), vb = P(b);
  const d = new THREE.Vector3().subVectors(vb, va);
  const len = d.length();
  if (len < 0.02) return null;
  const g = new THREE.CylinderGeometry(radius, radius, len, 7, 1);
  const m = new THREE.Mesh(g, mat);
  m.position.copy(va).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
  return m;
}

/**
 * Build the systems as toggleable groups.
 * Returns { group, byGroup: { WATER: Group, WASTE: Group, ... } }
 */
export function buildSystems() {
  const root = new THREE.Group();
  root.name = 'SYSTEMS';
  const byGroup = {};
  const mats = {};

  const matFor = (sys) => {
    if (!mats[sys]) {
      mats[sys] = new THREE.MeshStandardMaterial({
        color: SYSTEM_COLOURS[sys] ?? 0x888888,
        roughness: 0.42, metalness: 0.25,
        emissive: SYSTEM_COLOURS[sys] ?? 0x888888, emissiveIntensity: 0.28,
      });
    }
    return mats[sys];
  };

  for (const [gname, systems] of Object.entries(SYSTEM_GROUPS)) {
    const g = new THREE.Group();
    g.name = gname;
    byGroup[gname] = g;
    root.add(g);
  }
  const groupOf = (sys) => {
    for (const [gname, list] of Object.entries(SYSTEM_GROUPS)) if (list.includes(sys)) return byGroup[gname];
    return root;
  };

  const joints = new Set();
  for (const r of allRuns()) {
    // pipe diameters are inches; draw slightly fat so they read at building scale
    const rad = Math.max(0.055, F(r.dia) * 0.75);
    const t = tube(r.a, r.b, rad, matFor(r.sys));
    if (t) groupOf(r.sys).add(t);
    for (const p of [r.a, r.b]) joints.add(`${r.sys}|${p[0]}|${p[1]}|${p[2]}|${rad.toFixed(3)}`);
  }
  // elbows, so corners do not read as broken pipe
  for (const key of joints) {
    const [sys, x, y, z, rad] = key.split('|');
    const s = new THREE.Mesh(new THREE.SphereGeometry(+rad, 7, 5), matFor(sys));
    s.position.copy(P([+x, +y, +z]));
    groupOf(sys).add(s);
  }

  // sources and sinks as labelled markers
  const markerMat = new THREE.MeshStandardMaterial({
    color: 0xf0f3f7, roughness: 0.5, emissive: 0x8fa3b8, emissiveIntensity: 0.35 });
  for (const s of Object.values(SOURCES)) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1.6, 12, 9), markerMat);
    m.position.copy(P([s.x, s.y, s.z]));
    m.userData.label = s.name;
    root.add(m);
  }
  // vertical chases as translucent shafts — the spinal cord
  const chaseMat = new THREE.MeshStandardMaterial({
    color: 0xb8562f, transparent: true, opacity: 0.16, depthWrite: false });
  for (const c of CHASES) {
    const g = new THREE.Mesh(new THREE.BoxGeometry(F(c.w * 3), 32, F(c.d * 3)), chaseMat);
    g.position.set(F(c.x), 16, -F(c.y));
    root.add(g);
  }

  return { group: root, byGroup };
}

export { SYSTEM_GROUPS, SYSTEM_COLOURS };
