// HENRY HOUSE — sheet builder. Generates the drawing set from the model.
import { writeFileSync, mkdirSync } from 'node:fs';
import { Sheet, SCALES, INK, LW } from './svg.mjs';
import { ft } from '../model/units.mjs';
import { drawPlan } from './draw/plan.mjs';
import G, { areaSummary, LEVELS, FOOTPRINTS } from '../model/geometry.mjs';

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
      '2. BUILD ALONG THE CONTOUR. The bar runs with the slope, not across it, so the cut is one consistent depth instead of a wedge. THIS NOTE PREVIOUSLY CLAIMED CUT AND FILL WERE ROUGHLY BALANCED. The site model disproves it: see C-101. The pad and drive together cut far more than they fill, and hauling spoil off a mountain driveway is one of the largest avoidable costs on this kind of project. Where that spoil goes is an unanswered geotechnical question.',
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

// ── A-202  SECTION B-B — LONGITUDINAL ───────────────────────────────────────
import { drawSectionLong } from './draw/section.mjs';
function sheetA202() {
  const scaleName = '1/8"=1\'-0"';
  const s = new Sheet({
    size: 'ARCH_D', scale: SCALES[scaleName],
    number: 'A-202', title: 'SECTIONS B—B + C—C',
    subtitle: 'THE LONG SECTIONS · ONE COMPOSITION, FOUR VOLUMES, A ROOF THAT STEPS',
    originX: 380, originY: 980,
    notes: [
      '1. TWO CUTS, ONE BUILDING. B—B runs through the LIVING ZONE — primary suite, gallery, great room, dining, kitchen, mudroom, breezeway, garage. C—C runs 13\'-4" further uphill through the SERVICE SPINE — baths, both stairs, the office, the entry, the laundry. Read together they are the whole plan turned on edge.',
      '2. THE ROOF STEPS AT GRID E and the step is glazed. The tall wing carries the upper level; the low wing does not. Ceiling heights are labelled per room and computed from the roof planes, not assumed.',
      '3. FOUR VOLUMES, ONE ARGUMENT. Bar, link, breezeway, garage. The breezeway is the only unconditioned link in the chain, and on the worst night of the year it is the piece you cross carrying a sleeping child. That trade — fire and CO separation against comfort — is stated in docs/05-what-is-wrong.md B.3 and it is not yet decided.',
      '4. THE LOWER LEVEL WALKS OUT AT THE WEST END AND BECOMES A SEALED CRAWL AT THE EAST. Grade falls 8% along this cut; that fall, not a stylistic decision, is what sets where the walkout stops.',
      '5. THE CRAWL IS CONDITIONED, NOT VENTED. A vented crawlspace in this climate is a moisture pump.',
      '6. GRADE IS FROM model/site.mjs AT THIS STATION. Long dashes are ASSUMED natural grade. There is no survey.',
      '7. CEILING CLEARANCES SHOWN ARE STRUCTURE TO STRUCTURE. Finishes, ducts within the ceiling zone and any dropped soffits are not deducted here — see the systems sheets for what has to fit.',
      '8. NO DROPPED CEILINGS ARE MODELLED. That is why the spine rooms on C—C read 15\'-0" to the underside of the shed: the model has every room open to the roof plane above it. In a real set the wet rooms and the office take a flat ceiling with the duct and plumbing zone above, and the clear heights there drop accordingly. The section is telling the truth about the model, and the model is not yet telling the truth about the house.',
      UNVERIFIED,
    ],
  });
  s.border();
  s.sheetTitle(300, 150);
  drawSectionLong(s, { cutY: 90, id: 'B' });
  s.oy = 1900;
  drawSectionLong(s, { cutY: 250, id: 'C' });
  s.scaleBar(2180, 2200, { scaleName, feetTicks: [0, 8, 16, 32] });
  s.titleBlock({ phase: PHASE, issued: ISSUED, scaleName, extra: [
    'CUT AT Y = 7\'-6" — through the living zone.',
    '',
    'The transverse section says how the house',
    'stands on the hill. This one says what the',
    'house IS: a 122 ft chain of volumes that',
    'steps down the slope with the ground.',
  ] });
  return s.toString();
}
write('A-202-sections-longitudinal.svg', sheetA202());

// ── C-101  SITE, GRADING AND ACCESS ─────────────────────────────────────────
import { drawSite, siteData, siteLegend, driveProfileStrip, typicalSection } from './draw/site.mjs';
function sheetC101() {
  const scaleName = '1"=30\'';
  const s = new Sheet({
    size: 'ARCH_D', scale: SCALES[scaleName],
    number: 'C-101', title: 'SITE, GRADING AND ACCESS',
    subtitle: 'THE GROUND · THE DRIVE · THE EARTH THAT HAS TO MOVE',
    originX: 480, originY: 1330,
    notes: [
      '1. THE DRIVE IS THE FIRST THING THAT CAN KILL THIS PROJECT, so it is designed here rather than sketched. A hand-drawn alignment measured 64% maximum grade. The alignment shown is GENERATED: it holds a constant design grade and traverses the slope, and the switchback count falls out of the arithmetic instead of being chosen for looks.',
      '2. TWO GRADES, NOT ONE. The pavement holds one grade; the heading is chosen so the ground rises MORE SLOWLY, so the drive climbs out of the motor court cut and daylights at the road. A drive that follows the terrain exactly stays in a trench for its whole length. That was the second version of this file, and it was wrong.',
      '3. THE MOTOR COURT IS AN "L". The garage doors face east; the court previously stopped two feet past them. The APRON limb is what lets a vehicle back clear of the door, and because it sits far downhill of the main bench, it is also the shallowest place on the site to bring the drive in.',
      '4. DASHED CONTOURS ARE ASSUMED NATURAL GRADE on a 30% cross / 8% longitudinal plane. SOLID CONTOURS are finished. Where they separate, earth moves. THERE IS NO SURVEY. The method is real; the ground is a proposition. See docs/01-site-facts-register.md A-01.',
      '5. THE CUT FACE behind the court is laid back at 1.5H:1V to daylight rather than retained. Whether that slope stands is a geotechnical question with no answer yet; a retaining structure may be required instead, and that is a large cost swing.',
      '6. ALL ROOF AND PAVEMENT WATER GOES DOWNHILL, away from the cut. Nothing is discharged onto the uphill face, where the groundwater problem already is. Outfall energy dissipation and a level spreader are REQUIRED and NOT DESIGNED.',
      '7. SPRING, CISTERN, TANKS AND FIELD ARE PLACED, NOT SITED. No yield test, no water quality test, no soil evaluation, no confirmed legal right to the spring. The separation dimension shown is a prompt to verify, not a compliance statement.',
      '8. NUMBERS ON THIS SHEET ARE COMPUTED FROM model/site.mjs — contours, stations, grades, cut/fill and disturbed area all derive from one terrain function. Change the assumed slope and every number here changes with it.',
      UNVERIFIED,
    ],
  });
  s.border();
  s.sheetTitle(300, 150);
  const r = drawSite(s);
  s.northArrow(1560, 480, 54, G.ORIENTATION.longAxisAzimuth);
  s.scaleBar(200, 1650, { scaleName, feetTicks: [0, 30, 60, 120] });
  siteLegend(s, 200, 1750);
  driveProfileStrip(s, 760, 1830, 1080, 280, r);
  siteData(s, 2020, 470, r);
  s.stext(1988, 1440, 'TYPICAL DRIVE SECTIONS', { size: 15, weight: 700, spacing: 1.8 });
  s.stext(1988, 1462, 'THE DRIVE IS TWO DIFFERENT ROADS', { size: 11, color: INK.mid });
  typicalSection(s, 2200, 1640, {
    u: 4.6, cutFt: -r.drive.pts[0].cutFillFt, station: '0+00 — LEAVING THE APRON',
    title: 'FULL BENCH IN CUT',
    note: 'The excavation is four times the width of the road it buys. That is the argument for meeting the site at the apron rather than the back of the motor court, and for a retained edge if the drive ever has to start deeper.',
  });
  typicalSection(s, 2200, 2000, {
    u: 4.6, cutFt: 1.3, station: '5+45 — APPROACHING THE ROAD',
    title: 'BALANCED SIDE-HILL BENCH',
    note: 'Cut on the uphill half, fill on the downhill half, corridor barely wider than the pavement. This is the condition the drive is designed to reach as fast as the arithmetic allows.',
  });
  s.titleBlock({ phase: PHASE, issued: ISSUED, scaleName, extra: [
    `DRIVE  ${r.drive.lengthFt} FT @ ${r.drive.maxGradePct}% MAX`,
    `SPOIL  ${r.totals.netCY} CY NET OFF SITE`,
    `DISTURBED  ${r.totals.disturbedAcres} AC`,
    '',
    'Generated from model/site.mjs. The',
    'alignment is solved, not sketched.',
  ] });
  return s.toString();
}
write('C-101-site-grading-access.svg', sheetC101());

// ── A-301 / A-302  ELEVATIONS + ROOF PLAN ───────────────────────────────────
import { drawElevation, drawRoofPlan } from './draw/elevation.mjs';

function sheetElevations(no, faces, title, sub, notes, opts = {}) {
  const { scaleName = '1/8"=1\'-0"', step = 760, y0 = 780, ticks = [0, 8, 16, 32],
          extra = null, sideBySide = false, colStep = 1120 } = opts;
  const s = new Sheet({
    size: 'ARCH_D', scale: SCALES[scaleName],
    number: no, title, subtitle: sub, originX: 300, originY: y0, notes,
  });
  s.border();
  s.sheetTitle(300, 150);
  let oy = y0, col = 300;
  for (const f of faces) {
    s.oy = oy;
    drawElevation(s, f, { alignLeft: col });
    if (sideBySide) col += colStep; else oy += step;
  }
  if (extra) extra(s, oy);
  s.scaleBar(2180, 2210, { scaleName, feetTicks: ticks });
  s.titleBlock({ phase: PHASE, issued: ISSUED, scaleName, extra: [
    'Elevations are PROJECTED FROM THE MODEL.',
    'Openings come from model/openings.mjs —',
    'the same list the plans draw. Grade comes',
    'from model/site.mjs. If a window moves in',
    'plan it moves here, or the build failed.',
  ] });
  return s.toString();
}

const ELEV_NOTES = [
  '1. GLASS IS ON THE DOWNHILL WALL. Compare the south and north faces: the view and the winter sun arrive from the same side, which is the entire reason the bar was turned to this azimuth. The uphill wall is the cold side, the cut side and the service side, and it is nearly solid.',
  '2. THE ROOF STEPS AT GRID E. Two 3:12 planes, both falling downhill, with the tall wing raised so the step can be glazed. That clerestory is the one opening on this building that faces the wrong direction — see the note on the south elevation.',
  '3. SNOW RETENTION IS DRAWN WHERE IT IS REQUIRED. Standing seam at 3:12 releases in slabs. Retention runs over every occupied surface; the one free-shed zone is west of grid C, where nothing is below, and it is marked on the roof plan as a zone in which nothing may be placed.',
  '4. HEAVY LINE IS FINISHED GRADE AT THE FACE. Long dashes are ASSUMED NATURAL GRADE. Fine dashes are finished grade beyond the building. There is no survey; see docs/01-site-facts-register.md A-01.',
  '5. EERO marks an emergency escape and rescue opening. Net clear area, clear width and height and maximum sill height must all be VERIFIED against the governing NC Residential Code edition. Not verified in this environment.',
  '6. MATERIALS, NOT YET SPECIFIED, are indicated by extent only: standing seam metal roof, vertical rainscreen siding on the uphill and end walls, glazing on the downhill wall. No product, gauge, finish or fastening is selected.',
  UNVERIFIED,
];

write('A-301-south-north-elevations.svg', sheetElevations(
  'A-301', ['S', 'N'], 'SOUTH + NORTH ELEVATIONS',
  'THE VIEW FACE AND THE CUT FACE · WHY THE GLASS IS ALL ON ONE SIDE', ELEV_NOTES));

write('A-302-east-west-elevations.svg', sheetElevations(
  'A-302', ['E', 'W'], 'EAST + WEST ELEVATIONS + ROOF PLAN',
  'THE ENDS OF THE BAR · AND EVERY PLANE THAT SHEDS WATER', ELEV_NOTES, {
    scaleName: '1/4"=1\'-0"', y0: 1180, ticks: [0, 4, 8, 16],
    sideBySide: true, colStep: 1180,
    extra: (s) => {
      s.scale = SCALES['1/8"=1\'-0"'];
      s.ox = 300; s.oy = 2050;
      drawRoofPlan(s);
      s.northArrow(2300, 1720, 46, G.ORIENTATION.longAxisAzimuth);
    },
  }));

// ── SYSTEMS SHEETS ──────────────────────────────────────────────────────────
import { drawSystemPlan, systemLegend, FAILURE_NOTES } from './draw/systems.mjs';

const SYS_SHEETS = [
  { no: 'P-101', group: 'WATER', title: 'WATER — CIRCULATION',
    sub: 'ARTERIAL · ONE PUMP, HOME-RUN BRANCHES, AND A BRANCH THAT NEEDS NO PUMP AT ALL' },
  { no: 'P-201', group: 'WASTE', title: 'WASTEWATER — DIGESTION',
    sub: 'VENOUS · GRAVITY AND CONVERGING · IN AT THE TOP, OUT AT THE BOTTOM, NEVER CROSSING' },
  { no: 'M-101', group: 'AIR', title: 'VENTILATION + HVAC — RESPIRATION',
    sub: 'THE AIRWAY IS SEPARATE FROM THE HEATING SYSTEM, EXACTLY AS IT IS IN A BODY' },
  { no: 'E-101', group: 'POWER', title: 'ELECTRICAL + DATA — NERVOUS SYSTEM',
    sub: 'ONE BRAIN, HOME RUNS, AND REFLEX ARCS THAT WORK WHEN THE BRAIN IS OFFLINE' },
];

for (const sh of SYS_SHEETS) {
  const scaleName = '3/16"=1\'-0"';
  const s = new Sheet({
    size: 'ARCH_D', scale: SCALES[scaleName],
    number: sh.no, title: sh.title, subtitle: sh.sub,
    originX: 470, originY: 900,
    notes: [
      'THIS IS NOT A DIAGRAM. Every run is generated from model/systems.mjs, routed from the ACTUAL fixture positions in model/fixtures.mjs. The same network is drawn here, built in 3D, and walked through in web/walk.html. A pipe cannot serve a fixture that is not in the plan.',
      'ROUTING RULE: everything runs in the SERVICE SPINE (grid 2 to grid 3) or in a vertical chase. Nothing crosses the living zone. NO PIPE RUNS IN AN EXTERIOR WALL — at this elevation that is a freeze rule, not a preference.',
      'Circles are RISERS passing through this level in a chase. CH-1 is in The Gallery; CH-2 at the stair core.',
      'DIAMETERS ARE CONVENTIONAL, NOT CALCULATED. Nothing here is sized against a fixture-unit count, a Manual J, or a load calculation. This set proves the systems can COEXIST IN THE SPACE PROVIDED — the coordination question — not that they will perform.',
      'Sizing, equipment selection and balancing must be done by an MEP engineer or a qualified designer. See docs/04-professional-scope.md.',
      UNVERIFIED,
    ],
  });
  s.border();
  s.sheetTitle(300, 150);

  let stats = { drawn: 0, risers: 0, total: 0 };
  const LEVEL_X = { L0: 470, L1: 470, L2: 470 };
  let oy = 780;
  for (const lvl of ['L0', 'L1', 'L2']) {
    s.ox = LEVEL_X[lvl]; s.oy = oy;
    const st = drawSystemPlan(s, lvl, sh.group);
    stats.drawn += st.drawn; stats.risers += st.risers; stats.total = st.total;
    s.text(FOOTPRINTS[lvl].x0, -ft(20), `${LEVELS.find(l => l.id === lvl).name}`,
      { size: 19, weight: 700, spacing: 1.5 });
    oy += 640;
  }
  systemLegend(s, 2300, 320, sh.group, FAILURE_NOTES[sh.group]);
  s.scaleBar(2300, 2200, { scaleName, feetTicks: [0, 4, 8, 16] });
  s.titleBlock({ phase: PHASE, issued: ISSUED, scaleName, extra: [
    `${stats.total} runs in this system`,
    `${stats.drawn} horizontal, ${stats.risers} riser passes`,
    '',
    'Generated from model/systems.mjs —',
    'the same network the 3D x-ray shows.',
  ] });
  write(`${sh.no}-${sh.group.toLowerCase()}.svg`, s.toString());
}

// ── G-001  THE HOUSE AS A VIABLE SYSTEM + WHAT IT COSTS ─────────────────────
import { drawVSM, drawS4Schedule, drawCost, drawGaps } from './draw/vsm.mjs';
{
  const s = new Sheet({
    size: 'ARCH_D', scale: SCALES['1/8"=1\'-0"'],
    number: 'G-001', title: 'THE HOUSE AS A VIABLE SYSTEM',
    subtitle: 'STAFFORD BEER\'S VSM APPLIED · THE MISSING FUNCTION · AND WHAT THE WHOLE THING COSTS',
    notes: [
      'THE BRIEF ASKED TWICE for the Viable System Model and was answered twice with the body analogy instead. They are adjacent, not identical. The body analogy says a house has organs. The VSM says what has to be TRUE for a system to survive an environment that is trying to kill it — which on a 3,400 ft ridge is the actual design problem.',
      'APPLYING IT PRODUCED ONE FINDING the analogy could not: this house has almost no S4. Every sensor in the package looks INWARD — leak, freeze, CO, humidity. That is S3*, audit. Nothing told the house what was about to happen TO it. A house with audit and no intelligence can only react; it arrives at every emergency with an empty battery, a half cistern and a cold slab.',
      'THE SIX POLICIES on this sheet are that missing function, built from hardware already in model/systems.mjs. None of them needs equipment the design does not have. What they need is a forecast and a decision to act on it early.',
      'ALL THRESHOLDS, LEAD TIMES AND SETPOINTS ARE ASSUMED. They are the agenda for a commissioning conversation, not settings.',
      'THE COST TAKEOFF IS DERIVED FROM THE MODEL. The unit costs are not: no supplier, no cost database and no local bid was consulted. Replace every rate with a Watauga County contractor\'s numbers before the estimate means anything.',
      UNVERIFIED,
    ],
  });
  s.border();
  s.sheetTitle(300, 150);
  const y = drawVSM(s, 300, 330, 2180);
  const colY = y + 60;
  drawS4Schedule(s, 300, colY, 1010);
  const cy = drawCost(s, 1440, colY, 1040);
  drawGaps(s, 1440, cy + 46, 1040);
  s.titleBlock({ phase: PHASE, issued: ISSUED, scaleName: 'NONE — DIAGRAM', extra: [
    'S1 operations · S2 coordination',
    'S3 control · S3* audit',
    'S4 intelligence · S5 identity',
    '',
    'Generated from model/vsm.mjs and',
    'model/cost.mjs. Quantities derived;',
    'unit costs invented and marked so.',
  ] });
  write('G-001-viable-system-and-cost.svg', s.toString());
}

// ── X-101  THE SEVEN SCHEMES ────────────────────────────────────────────────
import { drawSchemePlan, drawSchemeSection, drawSchemeTable, drawProvenance } from './draw/schemes.mjs';
import { SCHEMES as ALT_SCHEMES, BUILT_SCHEMES, PROPOSED_SCHEMES, allMetrics } from '../model/schemes.mjs';

/**
 * One comparison sheet, for ANY set of schemes.
 *
 * The layout used to be hard-coded for seven: four plan columns, sections at a
 * fixed 320 apart, a seven-column table. A fan-out that proposes six more would
 * have drawn them off the edge of the paper. Everything that depended on the
 * number seven is computed from the list instead.
 */
function schemeSheet({ number, title, subtitle, schemes, notes, extra }) {
  const n = schemes.length;
  const scaleName = '1/32"=1\'-0"';
  const s = new Sheet({
    size: 'ARCH_D', scale: SCALES[scaleName],
    number, title, subtitle,
    notes,
  });
  s.border();
  s.sheetTitle(300, 150);

  const COLS = n <= 4 ? Math.max(1, n) : (n <= 8 ? 4 : 5);
  const rows = Math.ceil(n / COLS);
  const CW = 2280 / COLS, RH = 320, X0 = 300, PLAN_Y = 520;
  s.stext(300, 300, `PLANS — ALL AT ${scaleName.replace('"=1\'-0"', '" = 1\'-0"')}`, { size: 15, weight: 700, spacing: 1.6 });
  schemes.forEach((sc, i) => {
    const cx = X0 + (i % COLS) * CW, cy = PLAN_Y + Math.floor(i / COLS) * RH;
    s.ox = cx; s.oy = cy;
    const m = drawSchemePlan(s, sc);
    // labels clear of the plan, which extends BELOW the origin wherever a
    // scheme has a porch or deck on its downhill side
    s.stext(cx, cy + 96, sc.name, { size: 13, weight: 700, spacing: 1.1 });
    s.stext(cx, cy + 112, `${m.conditionedSf.toLocaleString()} sf conditioned  ·  ${m.perimeterLf} lf perimeter`,
      { size: 10, color: INK.mid });
    s.stext(cx, cy + 126, `${m.cutCY.toLocaleString()} CY of earth  ·  ${m.groundNote}`, { size: 10, color: '#8a6508' });
  });

  const SEC_HEAD = PLAN_Y + (rows - 1) * RH + 200;
  const SEC_Y = SEC_HEAD + 200;
  const SEC_DX = Math.min(320, 2240 / Math.max(1, n));
  s.stext(300, SEC_HEAD, 'SECTIONS — ONE SCALE, ONE HILL, CUT AT THE MIDDLE OF EACH PLAN', { size: 15, weight: 700, spacing: 1.6 });
  schemes.forEach((sc, i) => {
    s.ox = 330 + i * SEC_DX; s.oy = SEC_Y;
    drawSchemeSection(s, sc);
    s.stext(330 + i * SEC_DX - 60, SEC_Y + 40, sc.name.replace('THE ', ''), { size: 11, weight: 700, spacing: 1 });
  });

  const TABLE_Y = SEC_Y + 120;
  drawSchemeTable(s, 300, TABLE_Y, 2240, allMetrics(schemes), schemes);
  drawProvenance(s, 300, TABLE_Y + 470, 2240, Math.min(n, 7), schemes);

  s.scaleBar(2280, 340, { scaleName, feetTicks: [0, 32, 64] });
  s.titleBlock({ phase: PHASE, issued: ISSUED, scaleName, extra });
  return s;
}

{
  const s = schemeSheet({
    number: 'X-101', title: 'SEVEN SCHEMES',
    subtitle: 'ALTERNATIVES DRIVEN BY THE REFERENCE PACK · ALL AT ONE SCALE, ON ONE HILL',
    schemes: BUILT_SCHEMES,
    extra: [
      'Seven schemes from model/schemes.mjs.',
      'Areas, perimeters, wet-wall runs, roof',
      'junctions and earthwork are COMPUTED',
      'from the same declarations that build',
      'the 3D — not estimated per scheme.',
    ],
    notes: [
      'THE REFERENCE TEST, quoted from the blueprint wall: "Do not ask whether HENRY resembles these houses. Put HENRY\'s plan and section beside them at the same scale. Compare conditioned area, sheltered area, perimeter, wet-wall length, foundations, roof intersections, ground contacts, rooms served, future capacity, and cost." This sheet is that test.',
      'NOTHING IS SCALED TO FIT ITS OWN BOX. Every plan and every section is at the same scale, over the same 30% hill, cut at the middle of its own plan. The Tower looks small because it is small.',
      'RURAL STUDIO IS THE BUILD-INTELLIGENCE BAR: phasing, kit-of-parts, minimum viable dwelling, structure as architecture, utility concentration. THE MOUNTAIN CABINS ARE THE VISUAL AND SECTIONAL BAR: tiny footprint with large presence, minimal ground contact, one great roof, resilience as a state rather than equipment in a closet.',
      'S0 THE SPINE IS THE OPPONENT, not the answer. It carries the systems intelligence of the current package and it must be beaten on mass, phasing, cost, ground relationship and clarity — or kept for stated reasons.',
      'THE HEAVY BLUE LINE in each plan is the WET-WALL RUN. Concentrating plumbing is the single largest transferable lesson in the Rural Studio set, and the schemes differ by a factor of four on it.',
      'OCHRE HATCH IS GROUND DISTURBED. Where a scheme stands on piers there is no hatch, because there is almost nothing to disturb — twelve holes instead of a bench.',
      'NUMBERS IN THE TABLE ARE COMPUTED from the same declarations that build the 3D. Perimeter is measured off a one-foot raster of the union, so two volumes that touch do not each pay for the shared wall.',
      'THESE ARE MASSING PROPOSITIONS. They are deliberately undetailed and unfurnished: at this stage detail would only flatter whichever scheme got detailed first. None of them is engineered, priced by a builder, or code-checked.',
      UNVERIFIED,
    ],
  });
  write('X-101-seven-schemes.svg', s.toString());
}

// ── X-102  WHAT THE FAN-OUT PROPOSED ────────────────────────────────────────
// Only drawn when there is something to draw. The proposals are held on their
// own sheet rather than crowded onto X-101 because the seven are a settled
// comparison and these are candidates — but they are drawn by the same
// function, at the same scale, over the same hill, and measured by the same
// table. Being new buys a proposal no allowances.
if (PROPOSED_SCHEMES.length) {
  const withOpponent = [ALT_SCHEMES[0], ...PROPOSED_SCHEMES];
  const s = schemeSheet({
    number: 'X-102', title: 'PROPOSED SCHEMES',
    subtitle: 'GENERATED ALTERNATIVES · SAME SCALE, SAME HILL, SAME TABLE AS X-101',
    schemes: withOpponent,
    extra: [
      `${PROPOSED_SCHEMES.length} proposals from a parallel`,
      'fan-out, collected by tools/collect-',
      'schemes.mjs and validated on the way',
      'in. Drawn and measured by the same',
      'code as X-101. S0 repeats as control.',
    ],
    notes: [
      'THESE ARE CANDIDATES, NOT DECISIONS. Each was proposed by a separate agent working from the same reference packs, the same site model and the same brief, and each was validated before it was allowed onto this sheet — geometry present and well-formed, ground defined, phases stated, and its claimed area checked against the area its own volumes actually enclose. A proposal that failed was dropped and reported, never repaired.',
      'BEING NEW BUYS NOTHING. Every number in the table below is computed from the same declarations by the same code that produced X-101, and the same eight critics score these as score the seven. S0 THE SPINE is repeated here as the control so the two sheets can be read against each other.',
      'THE PROPOSALS ARE MASSING, exactly as the seven are. Undetailed and unfurnished by intent: at this stage detail would flatter whichever scheme got detailed first.',
      'WHAT AN AGENT CANNOT DO IS CHECK ITS OWN WORK. The validator catches malformed geometry and area claims that contradict the geometry. It does not catch a scheme that is well-formed and bad. That is what the critics, the sections and your eye are for.',
      UNVERIFIED,
    ],
  });
  write('X-102-proposed-schemes.svg', s.toString());
}

// ── R-101  THE REFERENCE SET AS A BAR ───────────────────────────────────────
import { drawReferenceSheet } from './draw/refs.mjs';
{
  const scaleName = '1/32"=1\'-0"';
  const s = new Sheet({
    size: 'ARCH_D', scale: SCALES[scaleName],
    number: 'R-101', title: 'THE REFERENCE SET, AS A BAR',
    subtitle: 'WHAT THE PRECEDENTS MEASURE · AND WHERE EACH SCHEME STANDS AGAINST THEM',
    notes: [
      'A REFERENCE THAT CANNOT BE LOST TO IS A MOOD BOARD. The Front Porch product line publishes areas, footprints, porch areas and perimeters for six built houses, so those figures become bars a scheme either beats or does not.',
      'THE PLANS HERE ARE FOOTPRINTS AT THE PUBLISHED DIMENSIONS, drawn at the same scale as the schemes on X-101. They are not Rural Studio drawings and do not pretend to be; the schematic cards in the client packs label themselves studies, and the porch is shown as its published AREA against the short end rather than in its real position.',
      'SYLVIA 2/1 IS THE ONE THAT MATTERS MOST. It is a product-line house actually adapted to a narrow, steeply sloped site in Madison County, North Carolina — two counties from Watauga, the same mountains, the same problem — at 856 sf.',
      'THE VISUAL BAR CARRIES NO DIMENSIONS in these packs, so it appears as operations and states rather than measurements, and is never scored. Its areas are widely-cited figures marked ASSUMED.',
      'NOTHING ON THIS SHEET WAS FETCHED. This container has no outbound network access; every figure shipped inside the client packs as CSV or on a study card. Before any of it justifies a design decision, check it against the official product pages and plan PDFs listed in refs/manifests/.',
      'ALL REFERENCE IMAGERY AND DRAWINGS remain the property of Rural Studio / Auburn University and Olson Kundig. None is reproduced here.',
      UNVERIFIED,
    ],
  });
  s.border();
  s.sheetTitle(300, 150);
  drawReferenceSheet(s);
  s.scaleBar(2280, 340, { scaleName, feetTicks: [0, 32, 64] });
  s.titleBlock({ phase: PHASE, issued: ISSUED, scaleName, extra: [
    'model/references.mjs — the measurable',
    'part of the client reference packs.',
    'Bars are DERIVED from the product line,',
    'not chosen. tools/gauntlet/run.mjs scores',
    'every scheme against them, tie = loss.',
  ] });
  write('R-101-reference-bar.svg', s.toString());
}

// ── X-2xx  ONE DOSSIER SHEET PER SCHEME ─────────────────────────────────────
// The complaint that produced this: the alternatives were massing boxes with
// no schematics, so they could not be criticised and could not be wrong.
// A footprint is the right drawing for comparing perimeter and earthwork and
// the wrong drawing for everything else.
//
// One sheet per scheme, at 1/8" = 1'-0", with every level drawn as a real
// plan: walls with thickness, rooms named and measured, circulation drawn and
// paid for, glass on the downhill face, the plumbing wall called out. The
// rooms come from model/scheme-plans.mjs, which is generated and CHECKED —
// nothing reaches this sheet without surviving tools/build-plans.mjs.
import { drawSchemeLevel, labelLevel, drawPlanLegend, levelBounds } from './draw/scheme-plan.mjs';
import { PLANS } from '../model/scheme-plans.mjs';
import { metrics as schemeMetrics } from '../model/schemes.mjs';
import { CRITIQUES } from '../model/scheme-critiques.mjs';

function wrapTo(str, n) {
  const w = String(str ?? '').split(/\s+/); const out = []; let l = '';
  for (const x of w) { if ((l + ' ' + x).trim().length > n) { out.push(l); l = x; } else l = (l ? l + ' ' : '') + x; }
  if (l) out.push(l); return out;
}

PLANS.forEach((plan) => {
  const scheme = ALT_SCHEMES.find(s => s.id === plan.id);
  if (!scheme) return;
  // Numbered off the SCHEME's position, not the plan's. Numbering by plan
  // index renumbered every sheet whenever a new plan landed, so X-202 was
  // the Perch one hour and the Narrow the next, and the stale file stayed
  // on disk looking current.
  const idx = ALT_SCHEMES.indexOf(scheme);
  const m = schemeMetrics(scheme);
  const crit = CRITIQUES.find(c => c.id === plan.id) ?? null;
  // 3/16" rather than 1/8": at 1/8" the plans used a third of the sheet and
  // the rooms were barely legible. Wide sets wrap to a second row.
  const scaleName = '3/16"=1\'-0"';
  const num = `X-${201 + idx}`;

  const s = new Sheet({
    size: 'ARCH_D', scale: SCALES[scaleName],
    number: num, title: scheme.name.replace('THE ', '') + ' — SCHEMATIC PLANS',
    subtitle: (scheme.tag ?? '').toUpperCase(),
    notes: [
      `OPERATION — ${scheme.operation}`,
      scheme.doNotCopy ? `DO NOT COPY — ${scheme.doNotCopy}` : 'THIS SCHEME IS THE OPPONENT. It is not borrowed from anything; it is the thing to be beaten.',
      'ROOMS ARE CHECKED, NOT DRAWN BY HAND. Every room on this sheet passed tools/build-plans.mjs: inside the scheme\'s own floor, no overlap with another room, the floor plate accounted for within 12%, every bedroom with an exterior wall and an egress window and at least 10 ft in its short dimension, every wet room touching another wet room or stacking over one, and every stair landing on the stair below.',
      'CIRCULATION IS DRAWN AND PAID FOR. Corridors and stairs are rooms with areas here, because a scheme that hides its circulation is claiming floor area it does not have. The percentage under each plan is the honest number.',
      'GLASS IS SHOWN ROOM BY ROOM on the downhill face rather than as one ribbon, so the drawing shows which rooms actually got the view and which were given the cold side.',
      'THE HEAVY BLUE LINE is the plumbing wall. No pipe may run in an exterior wall — at 3,400 ft that is a freeze rule, not a preference.',
      'THIS IS SCHEMATIC. No structure is engineered, no fixture is selected, no clearance is code-checked, and no room here has been tested against a real survey.',
      UNVERIFIED,
    ],
  });
  s.border();
  s.sheetTitle(300, 150);

  // Levels across the sheet, each in its own column, ALL AT ONE SCALE.
  //
  // Rooms carry absolute site coordinates, so a level whose rooms start at
  // x=48 ft draws 600 units right of wherever its column begins. Advancing the
  // column by width alone pushed the Spine's upper floor off the paper and
  // under the notes. Offset each plan by its OWN x0, then advance.
  const SC = SCALES[scaleName];
  const LEFT = 360, RIGHT = 2820, GAP = 150;
  const rowY = 1010;
  const placed = plan.levels.map(lv => ({ lv, B: levelBounds(lv) })).filter(p => p.B);
  const totalW = placed.reduce((a, p) => a + (p.B.x1 - p.B.x0) * 12 * SC + GAP, -GAP);
  // If the set is wider than the paper, wrap to a second row rather than
  // silently drawing off the edge.
  const wrap = totalW > (RIGHT - LEFT);
  let cx = LEFT, ry = rowY, lowest = rowY;
  for (const { lv, B } of placed) {
    const w = (B.x1 - B.x0) * 12 * SC;
    if (wrap && cx > LEFT && cx + w > RIGHT) { cx = LEFT; ry += 700; }
    s.ox = cx - B.x0 * 12 * SC;
    s.oy = ry;
    drawSchemeLevel(s, scheme, lv, { plan });
    labelLevel(s, scheme, lv, cx, ry + 130);
    cx += w + GAP;
    lowest = Math.max(lowest, ry);
  }

  s.northArrow(3180, 380);
  s.scaleBar(2780, 380, { scaleName, feetTicks: [0, 8, 16, 32] });

  // the numbers this scheme actually has, beside the plans that produce them
  // The block sits under whatever the plans actually used, so a scheme that
  // wrapped to two rows does not have its metrics drawn through its own plan.
  const bx = 300, by = lowest + 240;
  s.stext(bx, by, 'WHAT THIS SCHEME IS, MEASURED', { size: 15, weight: 700, spacing: 1.5 });
  const rows = [
    ['CONDITIONED', `${m.conditionedSf.toLocaleString()} sf`],
    ['SHELTERED', `${m.shelteredSf.toLocaleString()} sf`],
    ['PERIMETER', `${m.perimeterLf} lf  (${m.perimeterPerSf.toFixed(3)} per sf)`],
    ['WET-WALL RUN', `${m.wetWallLf} lf`],
    ['ROOF PLANES / JUNCTIONS', `${m.roofPlanes} / ${m.roofJunctions}`],
    ['EARTH MOVED', `${m.cutCY.toLocaleString()} CY, deepest cut ${m.maxCutFt} ft`],
    ['GROUND', m.groundNote],
    ['PHASE 1 → MATURE', `${m.phase1Sf.toLocaleString()} → ${m.matureSf.toLocaleString()} sf`],
  ];
  rows.forEach(([k, v], i) => {
    const y = by + 30 + i * 24;
    s.stext(bx, y, k, { size: 11, color: INK.mid, spacing: .4 });
    s.stext(bx + 330, y, v, { size: 12, family: 'ui-monospace, Menlo, monospace' });
  });

  drawPlanLegend(s, bx + 700, by);

  // the builder's own account of the compromise, kept separate from the critic
  if (plan.notes) {
    s.stext(bx + 1250, by, 'THE BUILDER\'S NOTE', { size: 13, weight: 700, spacing: 1.3 });
    s.stext(bx + 1250, by + 18, 'What the massing could not show, in the builder\'s words. The builder does not grade itself.',
      { size: 9.5, color: INK.mid });
    wrapTo(plan.notes, 74).slice(0, 9).forEach((ln, i) =>
      s.stext(bx + 1250, by + 44 + i * 14, ln, { size: 10, color: INK.line }));
  }

  // what the checker flagged — geometry that is legal but says something
  if (plan.flags?.length) {
    const fx = bx + 700, fy = by + 190;
    s.stext(fx, fy, `THE CHECKER FLAGGED ${plan.flags.length}`, { size: 13, weight: 700, spacing: 1.3, color: INK.fire });
    // wrapped, because at 9.5pt this ran unbroken straight through the
    // critic's column to its right
    wrapTo('Not geometry faults — the plan is legal. These are findings ABOUT the scheme, each first caught by a critic reading a drawing and since made automatic.', 66)
      .forEach((ln, i) => s.stext(fx, fy + 18 + i * 12, ln, { size: 9.5, color: INK.mid }));
    let fyy = fy + 56;
    for (const f of plan.flags.slice(0, 8)) {
      wrapTo('· ' + f, 66).forEach(ln => { s.stext(fx, fyy, ln, { size: 9.5, color: INK.line }); fyy += 13; });
      fyy += 3;
    }
    if (plan.flags.length > 8) s.stext(fx, fyy, `+ ${plan.flags.length - 8} more`, { size: 9.5, color: INK.mid });
  }

  // the critic, with fresh context, per the gauntlet template's fan-out rule
  if (crit) {
    const kx = bx + 1250, ky = by + 210;
    s.stext(kx, ky, `THE CRITIC — ${crit.verdict}`, { size: 13, weight: 700, spacing: 1.3,
      color: crit.verdict === 'WIN' ? '#2f7d54' : INK.fire });
    wrapTo('A separate agent, fresh context, which did not draw this plan and cannot see the builder\'s note.', 66)
      .forEach((ln, i) => s.stext(kx, ky + 18 + i * 12, ln, { size: 9.5, color: INK.mid }));
    let ly = ky + 56;
    for (const f of (crit.findings ?? []).slice(0, 5)) {
      wrapTo(`${f.severity === 'FATAL' ? '!!' : f.severity === 'MAJOR' ? '!' : '·'} ${f.finding}`, 74)
        .forEach(ln => { s.stext(kx, ly, ln, { size: 10, color: f.severity === 'FATAL' ? INK.fire : INK.line }); ly += 14; });
      ly += 4;
    }
    if (crit.biggestGap) {
      ly += 6;
      wrapTo(`BIGGEST GAP — ${crit.biggestGap}`, 74)
        .forEach(ln => { s.stext(kx, ly, ln, { size: 10, color: INK.accent }); ly += 14; });
    }
  }

  s.titleBlock({ phase: PHASE, issued: ISSUED, scaleName, extra: [
    `${scheme.name}.`,
    'Rooms from model/scheme-plans.mjs,',
    'generated and checked. Metrics computed',
    'from the same declarations that build',
    'the 3D. Critic is a separate agent.',
  ] });
  write(`${num}-${plan.id.toLowerCase()}-plans.svg`, s.toString());
});
