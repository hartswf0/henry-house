// HENRY HOUSE — IS THE MODEL THE SAME BUILDING AS THE BLUEPRINT, DOES IT HOLD
// ITSELF UP, AND CAN YOU SEE OUT OF IT?
//
// The client looked at the walkthrough and said: "missing walls, flickering
// walls, unbuildable and unsupported elements — basically lots of architectural
// slop." Each of those is a measurable property of a scene graph, so each
// becomes a check that FAILS until it holds. That is the difference between a
// note and a loop.
//
//   OUTLINE   the 3D used to build exterior walls from the scheme's VOLUMES
//             while the drawing built them from its checked PLAN — two sources
//             for one house, with nothing forcing them to agree. This measures
//             the built envelope out of the scene graph and compares it, per
//             level, against the bounds of the rooms the checker accepted.
//
//   SOLID     two pieces of a building may meet, lap and frame into each other.
//             They may not occupy the same space. A duplicate wall from a
//             second system is two coplanar surfaces fighting for the same
//             pixel, which is exactly what "flickering walls" looks like.
//
//   SUPPORT   every solid must reach the ground through other solids. Not
//             "something is under it" — a chain of contact all the way down.
//             A floating box passes the first test by resting on another
//             floating box; it cannot pass this one.
//
//   DAYLIGHT  the scheme glazing was metallic and half-opaque, so an interior
//             render was a photograph of the glass. This stands a camera in a
//             room and asks whether what it sees varies — a wall is uniform,
//             a view is not — and whether any of it is as bright as sky.
//
// A NOTE ON HOW THESE READ THE MODEL. The first version inferred what each
// mesh was from its dimensions: "tall, and thin in one direction, is a wall."
// That inference was wrong in both directions — it counted roof eaves and deck
// framing as walls, and it counted a house's actual walls as nothing at all,
// reporting "nothing built at this level" against 104 wall meshes. A check
// that has to guess what it is looking at is untrustworthy when it passes as
// well as when it fails. The builder now tags every mesh with what it is
// (tools/render/lib/build3d.mjs) and these read the tag.
//
// None of this proves the house is good. It proves the model is the same
// building as the drawing, that it stands up, and that its windows are windows.
import { chromium } from 'playwright';
import { serve } from '../render/serve.mjs';
import { PLANS } from '../../model/scheme-plans.mjs';

const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const TOL_FT = 2.5;        // an envelope is thicker than its rooms
const TOUCH_FT = 0.25;     // 3 in — pieces this close are in contact
const LAP = 0.25;          // a joint may bury a quarter of the smaller piece

console.log('HENRY HOUSE — ENVELOPE, SOLIDITY, SUPPORT, DAYLIGHT');
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
const solidBad = [], floatBad = [], counts = [];

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

  const got = await page.evaluate(async ([id, want, TOUCH, LAP]) => {
    const r = await window.setupScheme(id, 640, 420, 'compare');
    if (!r.ok) return { ok: false, error: r.error };

    // A mesh's matrixWorld is identity until something renders the scene, so
    // reading a bounding box straight after setup measures every piece of the
    // house sitting on top of every other at the origin. That is what the old
    // version of this check was measuring when it reported "nothing built at
    // this level" against a house with a hundred walls in it: not a band
    // filter that was too narrow, a graph that had not been transformed yet.
    window.__building.updateMatrixWorld(true);

    // the BUILDING only — no terrain, no trees. In world feet; scene z runs
    // opposite to model y, so flip it back to the drawing's coordinates.
    const out = [];
    window.__building.traverse(o => {
      if (!o.isMesh) return;
      o.geometry?.computeBoundingBox?.();
      const b = o.geometry?.boundingBox;
      if (!b) return;
      const w = b.clone().applyMatrix4(o.matrixWorld);
      out.push({ part: o.userData.part ?? 'other', level: o.userData.level,
                 x0: w.min.x, x1: w.max.x, y0: -w.max.z, y1: -w.min.z,
                 z0: w.min.y, z1: w.max.y });
    });

    // ── OUTLINE ───────────────────────────────────────────────────────────
    const levels = want.map(L => {
      const w = out.filter(m => (m.part === 'wall' || m.part === 'glass') &&
                                Math.abs((m.level ?? -999) - L.ffe) < 0.1);
      if (!w.length) return null;
      return { n: w.length,
               x0: Math.min(...w.map(m => m.x0)), x1: Math.max(...w.map(m => m.x1)),
               y0: Math.min(...w.map(m => m.y0)), y1: Math.max(...w.map(m => m.y1)) };
    });

    // ── SOLID ─────────────────────────────────────────────────────────────
    // The roof plane is the one mesh that is rotated, so its axis-aligned box
    // is not its shape — a 3:12 plane 38 ft deep has a bounding box 9 ft tall.
    // Testing it here would report the whole storey beneath it as buried.
    const S = out.filter(m => m.part !== 'roof');
    const vol = m => (m.x1 - m.x0) * (m.y1 - m.y0) * (m.z1 - m.z0);
    // Two exemptions, both so the check does not cry wolf:
    //   a post is SET INTO the pad it bears on — that embedment is the joint,
    //   not a collision, and flagging it would bury the real findings under
    //   ninety-three of them;
    //   loose furniture tucks together — a chair goes under a table and a sofa
    //   stands on a rug. Neither is an unbuildable condition. Furniture buried
    //   in a WALL still counts, because that one is.
    const bearing = new Set(['footing/post', 'pier/post', 'plinth/post']);
    const ok = (a, b) => bearing.has([a, b].sort().join('/')) ||
                         (a === 'furniture' && b === 'furniture');
    const clash = [];
    for (let i = 0; i < S.length; i++) for (let j = i + 1; j < S.length; j++) {
      const a = S[i], b = S[j];
      if (ok(a.part, b.part)) continue;
      const ox = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0);
      if (ox <= 0) continue;
      const oy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
      if (oy <= 0) continue;
      const oz = Math.min(a.z1, b.z1) - Math.max(a.z0, b.z0);
      if (oz <= 0) continue;
      const v = ox * oy * oz, small = Math.min(vol(a), vol(b));
      if (small <= 0 || v / small <= LAP || v < 0.3) continue;
      clash.push({ a: a.part, b: b.part, pct: Math.round((v / small) * 100),
                   x: Math.round(Math.max(a.x0, b.x0)), y: Math.round(Math.max(a.y0, b.y0)),
                   z: Math.round(Math.max(a.z0, b.z0)) });
    }

    // ── SUPPORT ───────────────────────────────────────────────────────────
    // Seed with everything sitting on the finished grade, then flood outwards
    // through contact. Whatever the flood never reaches is not connected to
    // the ground by any path, however indirect: it floats.
    const grounded = out.map(m => {
      const g = window.__ground(((m.x0 + m.x1) / 2) * 12, ((m.y0 + m.y1) / 2) * 12) / 12;
      return m.z0 <= g + 1.0;
    });
    const near = (a, b) => Math.min(a.x1, b.x1) >= Math.max(a.x0, b.x0) - TOUCH &&
                           Math.min(a.y1, b.y1) >= Math.max(a.y0, b.y0) - TOUCH &&
                           Math.min(a.z1, b.z1) >= Math.max(a.z0, b.z0) - TOUCH;
    const seen = grounded.slice();
    const queue = [];
    seen.forEach((v, i) => { if (v) queue.push(i); });
    while (queue.length) {
      const i = queue.pop();
      for (let j = 0; j < out.length; j++) {
        if (seen[j] || !near(out[i], out[j])) continue;
        seen[j] = true; queue.push(j);
      }
    }
    const floating = [];
    out.forEach((m, i) => {
      if (seen[i]) return;
      floating.push({ part: m.part, x: Math.round(m.x0), y: Math.round(m.y0), z: Math.round(m.z0) });
    });

    return { ok: true, levels, clash, floating, meshes: out.length,
             byPart: out.reduce((a, m) => (a[m.part] = (a[m.part] ?? 0) + 1, a), {}) };
  }, [plan.id, want, TOUCH_FT, LAP]);

  if (!got.ok) { console.log(`  ✗ ${plan.id.padEnd(14)} scene failed: ${got.error}`); failed++; continue; }
  counts.push({ id: plan.id, meshes: got.meshes, byPart: got.byPart });

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
    console.log(`  ✓ ${plan.id.padEnd(14)} outline matches its blueprint on all ${want.length} level${want.length > 1 ? 's' : ''}` +
                ` · ${got.meshes} meshes`);
  }
  if (got.clash.length) solidBad.push({ id: plan.id, list: got.clash });
  if (got.floating.length) floatBad.push({ id: plan.id, list: got.floating });
}

// ── SOLID ───────────────────────────────────────────────────────────────────
console.log('-'.repeat(74));
if (solidBad.length) {
  failed++;
  const n = solidBad.reduce((a, s) => a + s.list.length, 0);
  console.log(`  ✗ SOLID        ${n} pair${n > 1 ? 's' : ''} of solids occupy the same space in ${solidBad.length} scheme${solidBad.length > 1 ? 's' : ''}`);
  const kinds = {};
  for (const s of solidBad) for (const c of s.list) {
    const k = [c.a, c.b].sort().join('/');
    (kinds[k] ??= []).push({ ...c, id: s.id });
  }
  for (const [k, list] of Object.entries(kinds).sort((a, b) => b[1].length - a[1].length)) {
    const w = list.sort((a, b) => b.pct - a.pct)[0];
    console.log(`        · ${k.padEnd(20)} ${String(list.length).padStart(4)} — worst ${w.pct}% in ${w.id} at x ${w.x} y ${w.y} z ${w.z}`);
  }
} else { passed++; console.log('  ✓ SOLID        no two solids occupy the same space in any scheme'); }

// ── SUPPORT ─────────────────────────────────────────────────────────────────
if (floatBad.length) {
  failed++;
  const n = floatBad.reduce((a, s) => a + s.list.length, 0);
  console.log(`  ✗ SUPPORT      ${n} solid${n > 1 ? 's' : ''} reach no ground in ${floatBad.length} scheme${floatBad.length > 1 ? 's' : ''}`);
  for (const s of floatBad.slice(0, 4)) {
    const c = s.list[0];
    console.log(`        · ${s.id}: ${s.list.length} — e.g. ${c.part} at x ${c.x} y ${c.y} z ${c.z}`);
  }
} else { passed++; console.log('  ✓ SUPPORT      every solid reaches the ground through solids'); }

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

if (process.argv.includes('--counts')) {
  console.log('-'.repeat(74));
  for (const c of counts) {
    const parts = Object.entries(c.byPart).sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k} ${v}`).join('  ');
    console.log(`  ${c.id.padEnd(14)} ${String(c.meshes).padStart(4)}   ${parts}`);
  }
}

await browser.close();
server.close();
console.log('='.repeat(74));
console.log(`RESULT         ${failed} failed, ${passed} passed`);
process.exit(failed ? 1 : 0);
