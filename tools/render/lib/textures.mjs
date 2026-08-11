// Procedural materials. This container has no outbound network, so there are no
// downloaded textures, no HDRIs and no scanned materials — every surface here is
// generated from code. Each material builds a HEIGHT field first, then derives
// its normal and roughness maps from that height, which keeps bump, gloss and
// colour telling the same story instead of drifting apart.

import * as THREE from 'three';

const R = (seed) => { let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; };

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return { c, x: c.getContext('2d') };
}

/** Sobel a height canvas into a tangent-space normal map. */
function normalFromHeight(hc, strength = 2.2) {
  const w = hc.width, h = hc.height;
  const src = hc.getContext('2d').getImageData(0, 0, w, h).data;
  const { c, x } = canvas(w, h);
  const out = x.createImageData(w, h);
  const at = (i, j) => src[((j + h) % h * w + (i + w) % w) * 4] / 255;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const dx = (at(i + 1, j) - at(i - 1, j)) * strength;
    const dy = (at(i, j + 1) - at(i, j - 1)) * strength;
    const len = Math.hypot(dx, dy, 1);
    const k = (j * w + i) * 4;
    out.data[k] = ((-dx / len) * 0.5 + 0.5) * 255;
    out.data[k + 1] = ((-dy / len) * 0.5 + 0.5) * 255;
    out.data[k + 2] = (1 / len) * 0.5 * 255 + 127;
    out.data[k + 3] = 255;
  }
  x.putImageData(out, 0, 0);
  return c;
}

/** Map a height canvas to a roughness canvas: raised/proud = slightly smoother. */
function roughFromHeight(hc, lo = 0.55, hi = 0.95) {
  const w = hc.width, h = hc.height;
  const src = hc.getContext('2d').getImageData(0, 0, w, h).data;
  const { c, x } = canvas(w, h);
  const out = x.createImageData(w, h);
  for (let k = 0; k < w * h; k++) {
    const v = src[k * 4] / 255;
    const r = (lo + (hi - lo) * (1 - v)) * 255;
    out.data[k * 4] = out.data[k * 4 + 1] = out.data[k * 4 + 2] = r;
    out.data[k * 4 + 3] = 255;
  }
  x.putImageData(out, 0, 0);
  return c;
}

function tex(cv, repeat = [1, 1], srgb = false) {
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function fbm(x, ctx, w, h, seed, octaves = 5, scale = 0.02, alpha = 0.5) {
  const rnd = R(seed);
  const grid = [];
  for (let o = 0; o < octaves; o++) {
    const n = Math.max(2, Math.round(w * scale * Math.pow(2, o)));
    const g = new Float32Array(n * n);
    for (let i = 0; i < n * n; i++) g[i] = rnd();
    grid.push({ n, g });
  }
  const smp = ({ n, g }, u, v) => {
    const fx = u * n, fy = v * n;
    const i0 = Math.floor(fx) % n, j0 = Math.floor(fy) % n;
    const i1 = (i0 + 1) % n, j1 = (j0 + 1) % n;
    const tx = fx - Math.floor(fx), ty = fy - Math.floor(fy);
    const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
    const a = g[j0 * n + i0], b = g[j0 * n + i1], c = g[j1 * n + i0], d = g[j1 * n + i1];
    return (a * (1 - sx) + b * sx) * (1 - sy) + (c * (1 - sx) + d * sx) * sy;
  };
  const img = ctx.createImageData(w, h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    let v = 0, amp = 1, tot = 0;
    for (const gr of grid) { v += smp(gr, i / w, j / h) * amp; tot += amp; amp *= alpha; }
    v /= tot;
    const k = (j * w + i) * 4;
    img.data[k] = img.data[k + 1] = img.data[k + 2] = v * 255;
    img.data[k + 3] = 255;
  }
  return img;
}

// ── CHARRED / DARK-STAINED VERTICAL CEDAR RAINSCREEN ────────────────────────
export function sidingMaterial({ boards = 16, size = 1024 } = {}) {
  const { c: hc, x: hx } = canvas(size, size);
  hx.putImageData(fbm(0, hx, size, size, 7, 6, 0.22, 0.20), 0, 0);
  hx.globalCompositeOperation = 'multiply';
  // vertical boards with reveals, plus battens over alternate joints
  const bw = size / boards;
  const rnd = R(31);
  for (let i = 0; i < boards; i++) {
    const v = 0.62 + rnd() * 0.3;
    hx.fillStyle = `rgba(${v * 255 | 0},${v * 255 | 0},${v * 255 | 0},1)`;
    hx.fillRect(i * bw + 2, 0, bw - 4, size);
    hx.fillStyle = 'rgba(10,10,10,1)';
    hx.fillRect(i * bw - 1.5, 0, 3, size);           // shadow reveal
  }
  hx.globalCompositeOperation = 'source-over';
  // long grain streaks
  hx.globalAlpha = 0.16;
  for (let i = 0; i < 900; i++) {
    const x0 = rnd() * size, y0 = rnd() * size, len = 60 + rnd() * 400;
    hx.strokeStyle = rnd() > 0.5 ? '#fff' : '#000';
    hx.lineWidth = 0.6 + rnd() * 1.6;
    hx.beginPath(); hx.moveTo(x0, y0); hx.lineTo(x0 + (rnd() - 0.5) * 3, y0 + len); hx.stroke();
  }
  hx.globalAlpha = 1;

  const { c: cc, x: cx } = canvas(size, size);
  cx.fillStyle = '#222c24'; cx.fillRect(0, 0, size, size);   // dark green, real albedo
  cx.globalAlpha = 0.16; cx.drawImage(hc, 0, 0); cx.globalAlpha = 1;

  return new THREE.MeshStandardMaterial({
    map: tex(cc, [1, 1], true),
    normalMap: tex(normalFromHeight(hc, 2.6)),
    normalScale: new THREE.Vector2(1.1, 1.1),
    roughnessMap: tex(roughFromHeight(hc, 0.62, 0.94)),
    roughness: 1, metalness: 0, color: 0xffffff,
  });
}

// ── STANDING SEAM METAL ROOF ────────────────────────────────────────────────
export function roofMaterial({ pans = 22, size = 1024 } = {}) {
  const { c: hc, x: hx } = canvas(size, size);
  hx.fillStyle = '#7a7a7a'; hx.fillRect(0, 0, size, size);
  const pw = size / pans;
  for (let i = 0; i <= pans; i++) {
    const g = hx.createLinearGradient(i * pw - 5, 0, i * pw + 5, 0);
    g.addColorStop(0, '#6e6e6e'); g.addColorStop(0.5, '#ffffff'); g.addColorStop(1, '#6e6e6e');
    hx.fillStyle = g; hx.fillRect(i * pw - 5, 0, 10, size);   // raised seam
  }
  // faint oil-canning across each pan
  const img = fbm(0, hx, size, size, 11, 4, 0.01, 0.6);
  const tmp = canvas(size, size); tmp.x.putImageData(img, 0, 0);
  hx.globalAlpha = 0.14; hx.drawImage(tmp.c, 0, 0); hx.globalAlpha = 1;

  const { c: cc, x: cx } = canvas(size, size);
  cx.fillStyle = '#22262a'; cx.fillRect(0, 0, size, size);
  cx.globalAlpha = 0.35; cx.drawImage(hc, 0, 0); cx.globalAlpha = 1;

  return new THREE.MeshStandardMaterial({
    map: tex(cc, [1, 1], true),
    normalMap: tex(normalFromHeight(hc, 3.4)),
    normalScale: new THREE.Vector2(1.3, 0.5),
    roughness: 0.72, metalness: 0.05, color: 0xffffff, envMapIntensity: 0.10,
  });
}

// ── LOCAL DRY-STACK STONE ───────────────────────────────────────────────────
export function stoneMaterial({ size = 1024, courses = 14 } = {}) {
  const { c: hc, x: hx } = canvas(size, size);
  hx.fillStyle = '#111'; hx.fillRect(0, 0, size, size);
  const rnd = R(5);
  const ch = size / courses;
  for (let j = 0; j < courses; j++) {
    let x0 = -rnd() * 120;
    const y0 = j * ch;
    while (x0 < size) {
      const w = 60 + rnd() * 190, h = ch - 3 - rnd() * 5;
      const v = 0.55 + rnd() * 0.42;
      hx.fillStyle = `rgb(${v * 255 | 0},${v * 255 | 0},${v * 255 | 0})`;
      hx.beginPath();
      hx.roundRect(x0 + 2, y0 + 2, w - 4, h, 3 + rnd() * 5);
      hx.fill();
      x0 += w;
    }
  }
  const tmp = canvas(size, size);
  tmp.x.putImageData(fbm(0, tmp.x, size, size, 3, 6, 0.06, 0.5), 0, 0);
  hx.globalCompositeOperation = 'overlay'; hx.globalAlpha = 0.7;
  hx.drawImage(tmp.c, 0, 0);
  hx.globalCompositeOperation = 'source-over'; hx.globalAlpha = 1;

  const { c: cc, x: cx } = canvas(size, size);
  cx.fillStyle = '#38342e'; cx.fillRect(0, 0, size, size);
  cx.globalCompositeOperation = 'multiply'; cx.globalAlpha = 0.85;
  cx.drawImage(hc, 0, 0);
  cx.globalCompositeOperation = 'source-over'; cx.globalAlpha = 0.25;
  cx.fillStyle = '#4b4238'; cx.fillRect(0, 0, size, size);

  return new THREE.MeshStandardMaterial({
    map: tex(cc, [1, 1], true),
    normalMap: tex(normalFromHeight(hc, 4.0)),
    normalScale: new THREE.Vector2(1.5, 1.5),
    roughnessMap: tex(roughFromHeight(hc, 0.72, 0.98)),
    roughness: 1, metalness: 0,
  });
}

// ── BOARD-FORMED CONCRETE ───────────────────────────────────────────────────
export function concreteMaterial({ size = 512, boards = 12 } = {}) {
  const { c: hc, x: hx } = canvas(size, size);
  hx.putImageData(fbm(0, hx, size, size, 17, 5, 0.03, 0.55), 0, 0);
  const bh = size / boards;
  hx.globalAlpha = 0.5;
  for (let i = 0; i <= boards; i++) {
    hx.fillStyle = '#000'; hx.fillRect(0, i * bh - 1, size, 2);
    hx.fillStyle = '#fff'; hx.fillRect(0, i * bh + 1, size, 1.5);
  }
  hx.globalAlpha = 1;
  const { c: cc, x: cx } = canvas(size, size);
  cx.fillStyle = '#383633'; cx.fillRect(0, 0, size, size);
  cx.globalAlpha = 0.16; cx.drawImage(hc, 0, 0); cx.globalAlpha = 1;
  return new THREE.MeshStandardMaterial({
    map: tex(cc, [1, 1], true),
    normalMap: tex(normalFromHeight(hc, 1.6)),
    roughnessMap: tex(roughFromHeight(hc, 0.80, 0.97)),
    roughness: 1, metalness: 0, envMapIntensity: 0.22,
  });
}

// ── GROUND: meadow, gravel, cobble ──────────────────────────────────────────
export function groundMaterial({ size = 1024 } = {}) {
  const { c: hc, x: hx } = canvas(size, size);
  hx.putImageData(fbm(0, hx, size, size, 23, 6, 0.05, 0.55), 0, 0);
  const { c: cc, x: cx } = canvas(size, size);
  cx.fillStyle = '#3d4229'; cx.fillRect(0, 0, size, size);
  const rnd = R(3);
  for (let i = 0; i < 9000; i++) {
    const g = 24 + rnd() * 44, dry = rnd() > 0.62;
    cx.fillStyle = dry
      ? `rgb(${g * 1.30 | 0},${g * 1.08 | 0},${g * 0.58 | 0})`      // cured grass
      : `rgb(${g * 0.72 | 0},${g | 0},${g * 0.52 | 0})`;
    cx.fillRect(rnd() * size, rnd() * size, 1 + rnd() * 4, 1 + rnd() * 4);
  }
  cx.globalCompositeOperation = 'multiply'; cx.globalAlpha = 0.5;
  cx.drawImage(hc, 0, 0);
  return new THREE.MeshStandardMaterial({
    map: tex(cc, [46, 46], true),
    normalMap: tex(normalFromHeight(hc, 1.1), [46, 46]),
    roughness: 0.98, metalness: 0, envMapIntensity: 0.55,
  });
}

export function gravelMaterial({ size = 512 } = {}) {
  const { c: hc, x: hx } = canvas(size, size);
  hx.fillStyle = '#555'; hx.fillRect(0, 0, size, size);
  const rnd = R(9);
  for (let i = 0; i < 5000; i++) {
    const v = 0.3 + rnd() * 0.7;
    hx.fillStyle = `rgb(${v * 255 | 0},${v * 255 | 0},${v * 255 | 0})`;
    hx.beginPath();
    hx.ellipse(rnd() * size, rnd() * size, 2 + rnd() * 6, 2 + rnd() * 5, rnd() * 3, 0, 7);
    hx.fill();
  }
  const { c: cc, x: cx } = canvas(size, size);
  cx.fillStyle = '#5d584f'; cx.fillRect(0, 0, size, size);
  cx.globalCompositeOperation = 'multiply'; cx.globalAlpha = 0.75; cx.drawImage(hc, 0, 0);
  return new THREE.MeshStandardMaterial({
    map: tex(cc, [1, 1], true),
    normalMap: tex(normalFromHeight(hc, 2.4)),
    roughness: 0.95, metalness: 0,
  });
}

// ── GLASS ───────────────────────────────────────────────────────────────────
// Real transmission needs an extra scene render per frame; on SwiftShader that
// doubles an already slow pass. A tinted, reflective, low-opacity surface reads
// correctly at these angles and costs nothing.
export function glassMaterial({ opacity = 0.16, tint = 0x0f1a20 } = {}) {
  return new THREE.MeshPhysicalMaterial({
    color: tint, metalness: 0.9, roughness: 0.06,
    transparent: true, opacity: Math.min(0.85, opacity + 0.34),
    envMapIntensity: 2.6, clearcoat: 1, clearcoatRoughness: 0.03,
    side: THREE.DoubleSide, depthWrite: false,
  });
}

export const simple = (color, roughness = 0.8, metalness = 0) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

// ── INTERIOR FINISHES ───────────────────────────────────────────────────────
export function floorMaterial({ size = 1024, boards = 9 } = {}) {
  const { c: hc, x: hx } = canvas(size, size);
  hx.putImageData(fbm(0, hx, size, size, 41, 6, 0.04, 0.55), 0, 0);
  const bh = size / boards;
  const rnd = R(13);
  hx.globalCompositeOperation = 'multiply';
  for (let i = 0; i < boards; i++) {
    const v = 0.70 + rnd() * 0.28;
    hx.fillStyle = `rgb(${v*255|0},${v*255|0},${v*255|0})`;
    hx.fillRect(0, i * bh + 1.5, size, bh - 3);
    hx.fillStyle = '#0d0d0d'; hx.fillRect(0, i * bh - 1, size, 2);
  }
  hx.globalCompositeOperation = 'source-over';
  hx.globalAlpha = 0.13;
  for (let i = 0; i < 700; i++) {
    const y0 = rnd() * size, x0 = rnd() * size;
    hx.strokeStyle = rnd() > 0.5 ? '#fff' : '#000';
    hx.lineWidth = 0.6 + rnd() * 1.4;
    hx.beginPath(); hx.moveTo(x0, y0); hx.lineTo(x0 + 90 + rnd() * 300, y0 + (rnd() - 0.5) * 3); hx.stroke();
  }
  hx.globalAlpha = 1;
  const { c: cc, x: cx } = canvas(size, size);
  cx.fillStyle = '#8d6b48'; cx.fillRect(0, 0, size, size);
  cx.globalCompositeOperation = 'multiply'; cx.globalAlpha = 0.72; cx.drawImage(hc, 0, 0);
  return new THREE.MeshStandardMaterial({
    map: tex(cc, [1, 1], true),
    normalMap: tex(normalFromHeight(hc, 1.3)),
    roughness: 0.55, metalness: 0, envMapIntensity: 0.4,
  });
}

export function plasterMaterial({ size = 512 } = {}) {
  const { c: hc, x: hx } = canvas(size, size);
  hx.putImageData(fbm(0, hx, size, size, 61, 5, 0.05, 0.5), 0, 0);
  const { c: cc, x: cx } = canvas(size, size);
  cx.fillStyle = '#918a7e'; cx.fillRect(0, 0, size, size);
  cx.globalAlpha = 0.10; cx.drawImage(hc, 0, 0);
  return new THREE.MeshStandardMaterial({
    map: tex(cc, [1, 1], true),
    normalMap: tex(normalFromHeight(hc, 0.6)),
    roughness: 0.94, metalness: 0, envMapIntensity: 0.5,
  });
}

export function ceilingWoodMaterial({ size = 512, boards = 14 } = {}) {
  const { c: hc, x: hx } = canvas(size, size);
  hx.putImageData(fbm(0, hx, size, size, 71, 5, 0.05, 0.5), 0, 0);
  const bh = size / boards;
  hx.globalCompositeOperation = 'multiply';
  const rnd = R(23);
  for (let i = 0; i < boards; i++) {
    const v = 0.74 + rnd() * 0.24;
    hx.fillStyle = `rgb(${v*255|0},${v*255|0},${v*255|0})`;
    hx.fillRect(0, i * bh + 1, size, bh - 2);
    hx.fillStyle = '#111'; hx.fillRect(0, i * bh - 0.8, size, 1.6);
  }
  const { c: cc, x: cx } = canvas(size, size);
  cx.fillStyle = '#7d6042'; cx.fillRect(0, 0, size, size);
  cx.globalCompositeOperation = 'multiply'; cx.globalAlpha = 0.66; cx.drawImage(hc, 0, 0);
  return new THREE.MeshStandardMaterial({
    map: tex(cc, [1, 1], true),
    normalMap: tex(normalFromHeight(hc, 1.0)),
    roughness: 0.72, metalness: 0, envMapIntensity: 0.4,
  });
}
