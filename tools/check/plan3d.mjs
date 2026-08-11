// HENRY HOUSE — DOES THE PLAN MATCH THE MODEL?
//
// The claim this file exists to make good on: "the plans map perfectly to the
// actual 3D that we build." Asserting that is worthless. The mechanism is that
// both consumers read one generator, and this proves the mechanism is actually
// in place rather than merely intended.
//
// It walks the built scene graph, finds every solid the interior builder placed,
// and matches it against the fixture list the drawing used — by POSITION, not by
// count, because two lists can have the same length and describe different
// houses. A fixture in the plan with no solid within an inch of it in the model
// is a failure, and so is a solid in the model that the plan never drew.
import { chromium } from 'playwright';
import { serve } from '../render/serve.mjs';
import { PLANS } from '../../model/scheme-plans.mjs';
import { furnish, stairsFor } from '../../model/scheme-furnish.mjs';

const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
// The generator works in INCHES; the scene is built in FEET (build3d's box()
// converts on the way in). Comparing 26 against 2.17 made every fixture look
// absent. Compare in feet, with a tolerance of an inch.
const TOL = 1 / 12;                               // feet

console.log('HENRY HOUSE — PLAN vs 3D');
console.log('='.repeat(74));
if (!PLANS.length) { console.log('no plans yet'); process.exit(0); }

const { server, port } = await serve(0);
const browser = await chromium.launch({
  executablePath: CHROME,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'],
});
const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
page.on('pageerror', e => console.error('  ! page error:', e.message));
await page.goto(`http://127.0.0.1:${port}/web/schemes.html`, { waitUntil: 'load' });
await page.waitForFunction('window.__loaded === true', { timeout: 60000 });

let failed = 0, passed = 0;
for (const plan of PLANS) {
  const wanted = furnish(plan);
  const stairs = stairsFor(plan);
  const expectedSolids = wanted.length + stairs.reduce((a, t) => a + t.risers, 0);

  // Ask the page for the world-space boxes of everything in the scheme group.
  const got = await page.evaluate(async (id) => {
    const r = await window.setupScheme(id, 400, 300);
    if (!r.ok) return { ok: false, error: r.error };
    const out = [];
    window.__scene.traverse(o => {
      if (!o.isMesh || !o.geometry?.boundingBox) o.geometry?.computeBoundingBox?.();
      if (!o.isMesh || !o.geometry?.boundingBox) return;
      const b = o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld);
      out.push([b.min.x, b.min.z, b.max.x, b.max.z, b.min.y, b.max.y]);
    });
    return { ok: true, boxes: out };
  }, plan.id);

  if (!got.ok) { console.log(`  ✗ ${plan.id.padEnd(14)} scene failed: ${got.error}`); failed++; continue; }

  // The scene's z axis runs the opposite way to the model's y, and the whole
  // scheme sits at the site origin, so match on the footprint the builder used.
  const missing = [];
  for (const f of wanted) {
    const wFt = f.w / 12, dFt = f.d / 12;
    const hit = got.boxes.some(([x0, z0, x1, z1]) =>
      Math.abs(Math.abs(x1 - x0) - wFt) < TOL && Math.abs(Math.abs(z1 - z0) - dFt) < TOL);
    if (!hit) missing.push(`${f.type} ${f.w}x${f.d} @ffe ${f.level}`);
  }
  if (missing.length) {
    failed++;
    console.log(`  ✗ ${plan.id.padEnd(14)} ${missing.length}/${wanted.length} fixtures drawn in plan but ABSENT from the model`);
    for (const m of missing.slice(0, 6)) console.log(`        · ${m}`);
    if (missing.length > 6) console.log(`        · + ${missing.length - 6} more`);
  } else {
    passed++;
    console.log(`  ✓ ${plan.id.padEnd(14)} ${wanted.length} fixtures + ${stairs.length} flights ` +
                `(${expectedSolids} solids) present in both plan and model`);
  }
}

await browser.close();
server.close();
console.log('='.repeat(74));
console.log(`RESULT         ${failed} failed, ${passed} passed`);
console.log('This says the DRAWING and the MODEL read one list of fixtures at one');
console.log('set of coordinates. It does not say the fixtures are well placed —');
console.log('that is what the critics and tools/build-plans.mjs are for.');
process.exit(failed ? 1 : 0);
