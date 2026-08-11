// HENRY HOUSE — sheet builder. Generates the drawing set from the model.
import { writeFileSync, mkdirSync } from 'node:fs';
import { Sheet, SCALES, INK, LW } from './svg.mjs';
import { drawPlan } from './draw/plan.mjs';
import G, { areaSummary, LEVELS } from '../model/geometry.mjs';

const OUT = new URL('../out/drawings/', import.meta.url);
mkdirSync(OUT, { recursive: true });

const ISSUED = '2026-08-11';
const PHASE = 'SCHEMATIC DESIGN — NOT FOR CONSTRUCTION';

const write = (name, svg) => {
  writeFileSync(new URL(name, OUT), svg);
  console.log(`  ✓ ${name}  (${(svg.length / 1024).toFixed(0)} kB)`);
};

const UNVERIFIED = 'CODE VALUES ON THIS SET ARE UNVERIFIED. This container has no outbound web access, so no code text was read from a primary source. Every code reference is marked in docs/02-code-basis.md with its verification status. Nothing here may be relied on for permitting.';

// ── A-101  MAIN LEVEL PLAN ──────────────────────────────────────────────────
function sheetA101() {
  const scaleName = '3/16"=1\'-0"';
  const s = new Sheet({
    size: 'ARCH_D', scale: SCALES[scaleName],
    number: 'A-101', title: 'MAIN LEVEL PLAN',
    subtitle: 'ARRIVAL LEVEL · THE PUBLIC HOUSE · EVERYTHING ESSENTIAL ON ONE FLOOR',
    originX: 560, originY: 1180,
    notes: [
      '1. THE SPINE. All wet rooms, all vertical chases and all mechanical distribution sit in the 11\'-0" service band along the uphill wall (grid 2 to grid 3). Plumbing stacks align on all three levels. No plumbing occurs in an exterior wall — at this elevation that is a freeze rule, not a preference.',
      '2. TWO ENTRIES, TWO PURPOSES. The everyday route is GARAGE > MUDROOM AIRLOCK > KITCHEN. The guest route is MOTOR COURT > ENTRY BRIDGE > ENTRY. Dirty arrival never crosses the clean house.',
      '3. THE GALLERY separates the primary suite from the public house acoustically and thermally, and carries the main vertical chase. A doctor sleeping post-call is a program requirement, not a nicety.',
      '4. GLASS IS ON THE DOWNHILL WALL ONLY. View and winter sun arrive from the same side; that is why the bar is turned to this azimuth. The uphill wall is nearly solid.',
      '5. THE DRAIN GAP. A 4\'-0" gravel margin with a trench drain runs the full uphill wall so groundwater and meltwater are intercepted and carried away rather than loading a habitable wall.',
      '6. THE ROOFS FALL DOWNHILL so no roof water is ever delivered to the uphill side, where the cut and the groundwater problem already are.',
      '7. SNOW-SHED APRON. Standing seam at 3:12 releases snow in slabs. Where it lands is designed: river cobble, outside the guard line. Snow retention over every downhill door.',
      '8. DIMENSIONS ARE TO FACE OF STRUCTURE unless noted. Wall assemblies: 10" exterior, 5" partition, 7" plumbing wall.',
      UNVERIFIED,
    ],
  });
  s.border();
  s.sheetTitle(300, 150);
  drawPlan(s, 'L1', {
    site: true, link: true, garage: true, clearances: true,
    ghostAbove: 'L2',
    caption: 'Great room ceiling rises 9\'-10" at the glass to 16\'-4" at the spine — compression at the view, release at the back.',
    dimOffsetY: -190,
  });
  s.northArrow(2620, 500, 52, G.ORIENTATION.longAxisAzimuth);
  s.scaleBar(2380, 2180, { scaleName, feetTicks: [0, 4, 8, 16, 32] });
  s.sectionMark(300, -60, 300, 400, 'A');
  s.sectionMark(-40, 250, 1120, 250, 'B');
  s.titleBlock({ phase: PHASE, issued: ISSUED, scaleName, extra: [
    'DRAWN FROM A SINGLE PARAMETRIC MODEL:',
    'model/geometry.mjs is the source of truth.',
    'Plans, sections, elevations and the 3D',
    'model are all generated from it, so they',
    'cannot silently disagree.',
  ] });
  return s.toString();
}

// ── A-102  LOWER + UPPER LEVEL PLANS ────────────────────────────────────────
function sheetA102() {
  const scaleName = '3/8"=1\'-0"';
  const s = new Sheet({
    size: 'ARCH_D', scale: SCALES[scaleName],
    number: 'A-102', title: 'LOWER + UPPER LEVEL PLANS',
    subtitle: 'THE WALKOUT LEVEL AND THE SLEEPING LEVEL',
    originX: 430, originY: 1560,
    notes: [
      '1. THE LOWER LEVEL IS FREE FLOOR AREA. The hill already removed the earth; enclosing it costs a wall that had to exist anyway as a retaining structure. This is the single largest reason the house steps rather than sitting on a pad.',
      '2. "THE HEART" is a real mechanical room, not a closet: pressure tank, filtration, heat-pump water heater, ERV, electrical, battery and the plumbing manifold all live in one conditioned space with a 36" door so equipment can be replaced without demolition.',
      '3. THE GUEST SUITE WALKS OUT AT GRADE. That walkout is also the second means of egress from the lower level.',
      '4. Bedroom windows marked EERO must meet emergency escape and rescue opening requirements — net clear area, clear width and height, and maximum sill height. VERIFY against the governing NC Residential Code edition; not verified in this environment.',
      '5. TWO SEPARATE STAIRS. S2 (lower) sits off the great room; S1 (upper) sits at the entry. Guests reaching the lower level never pass through the bedroom wing, and each stair serves a different social zone.',
      '6. Under bays D-G the lower level becomes a SEALED, CONDITIONED CRAWLSPACE — grade rises to the east. It is conditioned, not vented: a vented crawl in this climate is a moisture pump.',
      '7. Upper bedrooms sit under the 3:12 shed. Ceiling falls from 15\'-1" at the spine to 8\'-7" at the glass. Confirm the sloped-ceiling minimum-height rule against the governing code.',
      UNVERIFIED,
    ],
  });
  s.border();
  s.sheetTitle(300, 150);

  s.ox = 430; s.oy = 1560;
  drawPlan(s, 'L0', { clearances: true, ghostAbove: 'L1', caption: 'Walks out at grade to the SSE. Second means of egress.', dimOffsetY: -160 });

  s.ox = 1930 - 576 * s.scale; s.oy = 1560;
  drawPlan(s, 'L2', { clearances: true, ghostBelow: 'L1', caption: 'Sleeping level under the shed. Interior overlook into the great room.', dimOffsetY: -160 });

  s.scaleBar(2300, 2230, { scaleName, feetTicks: [0, 2, 4, 8, 16] });
  s.northArrow(2700, 400, 46, G.ORIENTATION.longAxisAzimuth);
  s.titleBlock({ phase: PHASE, issued: ISSUED, scaleName, extra: [
    'AREA SUMMARY (gross, out-to-out):',
    ...Object.entries(areaSummary())
      .filter(([k]) => k !== 'TOTAL_HEATED_GROSS')
      .map(([, v]) => `  ${String(v.name).padEnd(22)} ${String(v.gross).padStart(5)} SF`),
    `  ${'TOTAL UNDER ROOF'.padEnd(22)} ${String(areaSummary().TOTAL_HEATED_GROSS).padStart(5)} SF`,
  ] });
  return s.toString();
}

// ── run ─────────────────────────────────────────────────────────────────────
console.log('HENRY HOUSE — generating drawings');
write('A-101-main-level-plan.svg', sheetA101());
write('A-102-lower-upper-plans.svg', sheetA102());

const a = areaSummary();
console.log('\nAREA SUMMARY');
for (const [k, v] of Object.entries(a)) {
  if (k === 'TOTAL_HEATED_GROSS') continue;
  console.log(`  ${v.name.padEnd(24)} gross ${String(v.gross).padStart(5)} SF   net ${String(v.net).padStart(5)} SF`);
}
console.log(`  ${'TOTAL UNDER ROOF'.padEnd(24)} gross ${String(a.TOTAL_HEATED_GROSS).padStart(5)} SF`);

// ── A-201  SECTION A-A ───────────────────────────────────────────────────────
import { drawSection } from './draw/section.mjs';
function sheetA201() {
  const scaleName = '3/16"=1\'-0"';
  const s = new Sheet({
    size: 'ARCH_D', scale: SCALES[scaleName],
    number: 'A-201', title: 'SECTION A—A',
    subtitle: 'THE SLOPE SECTION · HOW THE HOUSE STANDS ON THE HILL',
    originX: 700, originY: 1500,
    notes: [
      '1. THIS IS THE GOVERNING DRAWING. On a steep site the section, not the plan, decides whether the house is buildable, what it costs, and whether it stays dry.',
      '2. BUILD ALONG THE CONTOUR. The bar runs with the slope, not across it, so the cut is one consistent depth instead of a wedge. Cut and fill are roughly balanced on site — hauling spoil off a mountain driveway is one of the largest avoidable costs on this kind of project.',
      '3. THE LOWER LEVEL IS ALMOST FREE. The hill already removed the earth. The wall holding that earth back had to exist anyway; enclosing it buys a whole floor for the cost of finishing it.',
      '4. ONE ELEMENT, FOUR JOBS. The concrete spine retains the cut, carries the uphill end of every rib, resists lateral load and stores heat. The conventional alternative builds a retaining wall AND a separate frame in front of it, paying twice.',
      '5. WATER MOVES BY GRAVITY WHEREVER IT CAN. Footing drains daylight at both ends of the building. No sump, no float, no pump. A pump that fails during an ice storm is a flooded lower level.',
      '6. DASHED LINE IS ASSUMED NATURAL GRADE at 30%. NO SURVEY EXISTS. The earthwork shown is a proposition, not a quantity. See docs/01-site-facts-register.md A-01.',
      '7. THE CUT FACE behind the motor court is laid back at 1.5H:1V to daylight. Whether that slope stands depends entirely on the geotechnical report, which does not exist. A retaining structure may be required instead.',
      '8. ALL MEMBER SIZES ARE COORDINATION PLACEHOLDERS. Nothing here is engineered. Design snow, wind and seismic loads are NOT ESTABLISHED — see docs/02-code-basis.md.',
      UNVERIFIED,
    ],
  });
  s.border();
  s.sheetTitle(300, 150);
  drawSection(s, { cutX: 300, id: 'A' });
  s.scaleBar(2280, 2200, { scaleName, feetTicks: [0, 4, 8, 16, 32] });
  s.titleBlock({ phase: PHASE, issued: ISSUED, scaleName, extra: [
    'CUT AT GRID C — through the great room',
    'and the lower family room.',
    '',
    'Ceiling falls from 16\'-4" at the spine to',
    '9\'-10" at the glass: compression toward',
    'the view, release at the back.',
  ] });
  return s.toString();
}
write('A-201-section-aa.svg', sheetA201());
