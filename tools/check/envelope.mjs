// HENRY HOUSE — DOES THE MODEL HAVE THE SAME OUTLINE AS ITS BLUEPRINT,
// AND CAN YOU SEE OUT OF IT?
//
// Two things had been carried as known-broken for days, reported each time and
// fixed neither time. Both are verifiable, so both become checks that FAIL
// until they hold. That is the difference between a note and a loop.
//
//   OUTLINE   the 3D used to build exterior walls from the scheme's VOLUMES
//             while the drawing built them from its checked PLAN — two sources
//             for one house, with nothing forcing them to agree. This measures
//             the built envelope out of the scene graph and compares it, per
//             level, against the bounds of the rooms the checker accepted.
//
//   DAYLIGHT  the scheme glazing was metallic and half-opaque, so an interior
//             render was a photograph of the glass. This stands a camera in a
//             room and asks whether what it sees varies — a wall is uniform,
//             a view is not — and whether any of it is as bright as sky.
//
// Neither proves the house is good. They prove the model is the same building
// as the drawing, and that its windows are windows.
import { chromium } from 'playwright';
import { serve } from '../render/serve.mjs';
import { PLANS } from '../../model/scheme-plans.mjs';

const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const TOL_FT = 2.5;                    // an envelope is thicker than its rooms

console.log('HENRY HOUSE — ENVELOPE vs BLUEPRINT, AND DAYLIGHT');
console.log('='.repeat(74));
if (!PLANS.length) { console.log('no plans'); process.exit(0); }

const { server, port } = await serve(0);
const browser = await chromium.launch({
  executablePath: CHROME,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'],
});
const page = await browser.newPage({ viewport: { width: 640, height: 420 } });
page.on('pageerror', e => console.error('  ! page error:', e.message));
await page.goto(`http://127.0.0.1:${port}/web/schemes.html`, { waitUntil: 'load' });
await page.waitForFunction('window.__loaded === true', { timeout: 90000 });

let failed = 0, passed = 0;
for (const plan of PLANS) {
  // what the blueprint says the outline is, per level, in feet
  const want = plan.levels.map(lv => {
    const rs = lv.rooms ?? [];
    return {
      ffe: lv.ffe,
      x0: Math.min(...rs.map(r => r.x0)), x1: Math.max(...rs.map(r => r.x0 + r.w)),
      y0: Math.min(...rs.map(r => r.y0)), y1: Math.max(...rs.map(r => r.y0 + r.d)),
    };
  });

  const got = await page.evaluate(async ([id, want]) => {
    const r = await window.setupScheme(id, 640, 420, 'compare');
    if (!r.ok) return { ok: false, error: r.error };
    // every solid in the scene, in world feet; scene z = -y so flip it back
    const out = [];
    window.__scene.traverse(o => {
      if (!o.isMesh) return;
      o.geometry?.computeBoundingBox?.();
      const b = o.geometry?.boundingBox;
      if (!b) return;
      const w = b.clone().applyMatrix4(o.matrixWorld);
      out.push({ x0: w.min.x, x1: w.max.x, y0: -w.max.z, y1: -w.min.z, z0: w.min.y, z1: w.max.y });
    });
    // the envelope at a level = the extent of solids sitting in that storey
    return { ok: true, levels: want.map(L => {
      // Skip anything too big to be a piece of building: the terrain is a
      // 1,300 ft plane and it sits in every level band, which made the first
      // run report every edge as 400 ft out. No wall, floor or roof piece in
      // this package is 120 ft in either direction.
      // The ENVELOPE is walls, so measure walls: tall enough to be a storey's
      // worth of wall and thin in one horizontal direction. Measuring
      // everything in the height band caught roof eaves, deck framing and
      // piers, which legitimately overhang the rooms — that is not the model
      // disagreeing with the blueprint, it is a building having eaves.
      const inBand = out.filter(m => {
        const w = m.x1 - m.x0, d = m.y1 - m.y0, h = m.z1 - m.z0;
        if (w >= 120 || d >= 120) return false;          // terrain
        if (h < 5) return false;                          // plate, eave, deck
        if (Math.min(w, d) > 2.2) return false;           // not a wall
        return m.z1 > L.ffe + 1 && m.z0 < L.ffe + 9 &&
               m.x1 > L.x0 - 6 && m.x0 < L.x1 + 6 && m.y1 > L.y0 - 6 && m.y0 < L.y1 + 6;
      });
      if (!inBand.length) return null;
      return { x0: Math.min(...inBand.map(m => m.x0)), x1: Math.max(...inBand.map(m => m.x1)),
               y0: Math.min(...inBand.map(m => m.y0)), y1: Math.max(...inBand.map(m => m.y1)) };
    }) };
  }, [plan.id, want]);

  if (!got.ok) { console.log(`  ✗ ${plan.id.padEnd(14)} scene failed: ${got.error}`); failed++; continue; }

  const bad = [];
  want.forEach((L, k) => {
    const G = got.levels[k];
    if (!G) { bad.push(`ffe ${L.ffe}: nothing built at this level`); return; }
    for (const [n, a, b] of [['west', L.x0, G.x0], ['east', L.x1, G.x1],
                             ['downhill', L.y0, G.y0], ['uphill', L.y1, G.y1]]) {
      const d = Math.abs(a - b);
      if (d > TOL_FT) bad.push(`ffe ${L.ffe}: ${n} edge is ${d.toFixed(1)} ft from the blueprint`);
    }
  });

  if (bad.length) {
    failed++;
    console.log(`  ✗ ${plan.id.padEnd(14)} OUTLINE differs from its blueprint`);
    for (const m of bad.slice(0, 4)) console.log(`        · ${m}`);
    if (bad.length > 4) console.log(`        · + ${bad.length - 4} more`);
  } else {
    passed++;
    console.log(`  ✓ ${plan.id.padEnd(14)} outline matches its blueprint on all ${want.length} level${want.length > 1 ? 's' : ''}`);
  }
}

// ── DAYLIGHT ────────────────────────────────────────────────────────────────
// One scheme, one interior camera. If the glazing is opaque the frame is a
// single flat colour, so variance is near zero and nothing is sky-bright.
const probe = PLANS.find(p => p.id === 'S0-SPINE') ?? PLANS[0];
const day = await page.evaluate(async (id) => {
  const r = await window.setupScheme(id, 640, 420, 'interior');
  if (!r.ok) return { ok: false, error: r.error };
  const p = await window.renderPasses(6);
  if (!p.ok) return { ok: false, error: p.error };
  const uri = window.grab();
  const img = new Image(); img.src = uri; await img.decode();
  const c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;
  const x = c.getContext('2d'); x.drawImage(img, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height).data;
  let n = 0, sum = 0, sum2 = 0, bright = 0;
  for (let i = 0; i < d.length; i += 4 * 17) {
    const l = (d[i] * 0.30 + d[i + 1] * 0.59 + d[i + 2] * 0.11);
    n++; sum += l; sum2 += l * l;
    if (l > 170) bright++;
  }
  const mean = sum / n;
  return { ok: true, sd: Math.sqrt(sum2 / n - mean * mean), brightPct: (bright / n) * 100 };
}, probe.id);

console.log('-'.repeat(74));
if (!day.ok) { console.log(`  ✗ DAYLIGHT     interior view failed: ${day.error}`); failed++; }
else if (day.sd < 12 || day.brightPct < 1.5) {
  failed++;
  console.log(`  ✗ DAYLIGHT     ${probe.id} interior is a flat surface — sd ${day.sd.toFixed(1)}, ` +
              `${day.brightPct.toFixed(1)}% sky-bright. The glazing is not transmitting.`);
} else {
  passed++;
  console.log(`  ✓ DAYLIGHT     ${probe.id} interior sees out — sd ${day.sd.toFixed(1)}, ` +
              `${day.brightPct.toFixed(1)}% sky-bright`);
}

await browser.close();
server.close();
console.log('='.repeat(74));
console.log(`RESULT         ${failed} failed, ${passed} passed`);
process.exit(failed ? 1 : 0);
