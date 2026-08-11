// HENRY HOUSE — THE HOUSE AS A VIABLE SYSTEM.
//
// The brief asked twice for Stafford Beer's Viable System Model to organise
// this architecture, and twice it was answered with the body analogy instead.
// Those are adjacent, not identical. The body analogy tells you a house has
// organs. The VSM tells you what has to be TRUE for a system to stay viable in
// an environment that is trying to kill it, which on a 3,400 ft ridge in
// Watauga County is the actual design problem.
//
// Beer's claim is that any viable system contains five necessary functions:
//
//   S1  OPERATIONS   the units that do the primary work
//   S2  COORDINATION the anti-oscillation layer that stops S1 units fighting
//   S3  CONTROL      resource allocation and the here-and-now
//   S3* AUDIT        a direct channel that sees S1 without going through S3
//   S4  INTELLIGENCE the model of the ENVIRONMENT and the FUTURE
//   S5  IDENTITY     what the system is for, which arbitrates S3 against S4
//
// Plus the ALGEDONIC channel: pain signals that bypass the whole hierarchy.
//
// ─────────────────────────────────────────────────────────────────────────────
// WHY THIS IS NOT DECORATION
//
// Applying the model produced one finding that the body analogy could not:
// THIS HOUSE HAS ALMOST NO S4. Every sensor in the package looks INWARD — leak,
// freeze, CO, humidity. That is S3*, audit. It tells the house what is
// happening to it. Nothing in the design tells the house what is about to
// happen TO it, and on this site the environment is the whole adversary: ice
// storms, multi-day outages, drought on a spring-fed cistern, fire weather,
// snow load, a driveway that closes.
//
// A house with S3* and no S4 can only react. It arrives at every emergency with
// an empty battery, a half cistern and a cold slab. The policies below are the
// missing function: each one is a thing the house does BEFORE the environment
// does it, using hardware that is already in model/systems.mjs.
// ─────────────────────────────────────────────────────────────────────────────

import { ROOMS } from './geometry.mjs';
import { SOURCES } from './systems.mjs';

// ── S1 — OPERATIONS ─────────────────────────────────────────────────────────
// The primary activities. Not rooms: ACTIVITIES, each with its own local
// management, its own environment, and its own way of failing.
export const S1 = [
  { id: 'S1-SHELTER', name: 'SHELTER', does: 'Hold habitable temperature and humidity',
    hardware: ['ducted heat pumps', 'hydronic slab loop', 'ERV', 'the concrete spine as thermal mass'],
    env: 'Outside air, sun, wind, snow load', fails: 'Loss of power, loss of refrigerant, a frozen coil' },
  { id: 'S1-WATER', name: 'WATER', does: 'Deliver potable water at pressure',
    hardware: ['spring capture', '2,500 gal cistern', 'pump', 'sediment + UV', 'gravity branch'],
    env: 'Spring yield, freeze depth, drought', fails: 'Spring drops, pump fails, a line freezes' },
  { id: 'S1-WASTE', name: 'WASTE', does: 'Remove wastewater without contaminating the water',
    hardware: ['gravity drains', 'septic tank', 'pump tank', 'drip dispersal field'],
    env: 'Soil percolation, frost, saturation', fails: 'Pump fails, field saturates, tank backs up' },
  { id: 'S1-POWER', name: 'POWER', does: 'Keep the loads that matter alive',
    hardware: ['200A service', 'battery', 'inverter', 'standby generator', 'critical loads panel'],
    env: 'Grid reliability, ice on the lines', fails: 'Multi-day outage, generator fuel runs out' },
  { id: 'S1-ACCESS', name: 'ACCESS', does: 'Get people and vehicles to and from the house',
    hardware: ['655 ft drive at 11%', 'garage apron', 'covered breezeway'],
    env: 'Snow, ice, mud, a washout', fails: 'The drive closes; nobody leaves and nobody arrives' },
  { id: 'S1-DRY', name: 'STAY DRY', does: 'Keep water outside the envelope and off the cut',
    hardware: ['drain gap + trench drain', 'daylighted footing drains', 'roofs falling downhill'],
    env: 'Rain, snowmelt, groundwater in a colluvial slope', fails: 'The cut face loads the wall; a drain plugs' },
  { id: 'S1-DWELL', name: 'DWELL', does: 'Be a place a family actually lives in',
    hardware: ['the rooms', 'the deck', 'the great room', 'the primary suite'],
    env: 'A physician\'s hours, guests, a long winter', fails: 'Nothing breaks — it just stops being worth it' },
];

// ── S2 — COORDINATION ───────────────────────────────────────────────────────
// What stops S1 units oscillating against each other. The classic VSM insight:
// most system failure is not a unit failing, it is two units fighting.
export const S2 = [
  { name: 'THE SERVICE SPINE', stops: 'Systems competing for the same space',
    how: 'Every wet room, chase and distribution run lives in the 11\'-0" band at grid 2-3. Coordination is geometric, not procedural — the conflict cannot arise.' },
  { name: 'THE TWO CHASES', stops: 'Vertical runs crossing occupied rooms',
    how: 'CH-1 in the Gallery, CH-2 at the stair core. Stacks align on all three levels.' },
  { name: 'THE ERV VS THE HEAT PUMPS', stops: 'Ventilation and heating fighting over the same air',
    how: 'The airway is separate from the heating system, exactly as it is in a body. Fresh air is metered continuously; heat is delivered on demand.' },
  { name: 'THE MUDROOM AIRLOCK', stops: 'Dirty arrival crossing the clean house',
    how: 'Two entries, two purposes. Garage > mudroom > kitchen for every day; motor court > bridge > entry for guests.' },
  { name: 'SNOW RETENTION VS SNOW SHED', stops: 'The roof and the ground fighting over where snow lands',
    how: 'Retain over every occupied surface, shed only west of grid C where nothing is below. The free-shed zone is drawn as a keep-clear.' },
  { name: 'THE DRAIN GAP', stops: 'Groundwater and the habitable wall occupying the same place',
    how: 'A 4\'-0" open drained margin. The house never touches the cut face.' },
];

// ── S3 — CONTROL, AND S3* — AUDIT ───────────────────────────────────────────
export const S3 = {
  seat: 'THE HEART — the lower-level mechanical room',
  allocates: ['electrical capacity between comfort, hot water and battery charge',
              'water between domestic use, cistern reserve and outdoor taps',
              'heat between the slab loop and the air handlers'],
  note: 'One conditioned room, 36" door, every unit replaceable without demolition. S3 needs a seat you can physically get to.',
};

export const S3_STAR = [
  { sees: 'A leak', by: 'Flow sensor at the manifold + point leak sensors under every wet fixture', bypasses: 'Waits for nobody' },
  { sees: 'Freezing', by: 'Temperature sensors at the manifold, the crawl and the drain gap', bypasses: 'Alarms and opens the slab loop before pipes reach 32°F' },
  { sees: 'Combustion products', by: 'CO and smoke, interconnected, hardwired with battery backup', bypasses: 'Everything' },
  { sees: 'A failed septic pump', by: 'High-water float in the pump tank', bypasses: 'Alarms before the tank does the telling' },
  { sees: 'Its own drawings disagreeing', by: 'tools/check/clash.mjs, run against the model', bypasses: 'Human review, which missed sixteen failures the checker found' },
];

// ── S4 — INTELLIGENCE: THE MODEL OF THE ENVIRONMENT ─────────────────────────
/**
 * The missing function, built.
 *
 * Each policy is a standing rule of the form: WHEN the house's model of the
 * outside world crosses a threshold, ACT AHEAD OF IT, using hardware that
 * already exists in the design. Lead time is the whole point — a battery
 * charged after the outage starts is not a battery.
 *
 * ALL THRESHOLDS ARE ASSUMED. They are placeholders for a commissioning
 * conversation, not settings.
 */
export const S4 = [
  {
    id: 'S4-STORM', name: 'PRE-STORM CHARGE',
    watches: 'Forecast winter storm, ice accretion, or high-wind warning',
    lead: '24-36 hours',
    acts: [
      'Charge the battery to 100% from the grid while the grid is still there',
      'Raise the slab loop 3°F above setpoint — the concrete spine is the only heat store that does not need electricity to keep working',
      'Bring domestic hot water to the top of its band',
      'Top the cistern from the spring so the gravity branch has full head',
      'Test-start the generator and report fuel',
    ],
    uses: ['battery', 'hydronic slab loop', 'HPWH', 'cistern', 'generator'],
    because: 'A 3,400 ft ridge loses power to ice, not to lightning. The warning is always there and the house currently ignores it.',
  },
  {
    id: 'S4-OUTAGE', name: 'ISLANDED OPERATION',
    watches: 'Grid absent; battery state of charge; forecast time to restoration',
    lead: 'continuous',
    acts: [
      'Shed non-critical loads in a declared order, not by tripping breakers',
      'Ration: heat the primary suite and the great room, let the upper level float',
      'Hold the well pump and the septic pump as protected loads — losing either ends occupancy faster than losing heat',
      'Report projected hours remaining, in hours, not in percent',
    ],
    uses: ['critical loads panel', 'battery', 'inverter', 'generator'],
    because: 'A percentage tells you nothing. Hours until the pump stops tells you whether to leave.',
  },
  {
    id: 'S4-DROUGHT', name: 'SPRING DROUGHT RESPONSE',
    watches: 'Cistern level trend, spring inflow rate, days since meaningful rain',
    lead: 'days to weeks',
    acts: [
      'Report the reserve as DAYS OF USE at the current rate, not as a level',
      'Restrict outdoor taps first, then irrigation, then guest-wing hot water recirculation',
      'Alert early enough that hauled water can be scheduled rather than emergency-ordered',
    ],
    uses: ['cistern level sensor', 'spring inflow meter', 'valve at the outdoor tap manifold'],
    because: 'A spring-fed house with no inflow measurement discovers a drought when the tap runs dry. THE SPRING\'S YIELD HAS NEVER BEEN TESTED — see docs/01 A-05.',
  },
  {
    id: 'S4-FIRE', name: 'FIRE WEATHER POSTURE',
    watches: 'Low humidity, sustained wind, regional fire danger rating',
    lead: 'hours to days',
    acts: [
      'Close the ERV outdoor air damper and switch to recirculation with the filter bank in line',
      'Hold the cistern full and reserve a defined firefighting volume with a dedicated draft connection',
      'Report the state of the free-shed and deck zones — combustible storage under a deck is the usual ignition path',
    ],
    uses: ['ERV motorised damper', 'cistern', 'draft hydrant connection at the cistern'],
    because: 'Smoke reaches a ridge long before flame does, and a mechanically ventilated house pulls it inside.',
  },
  {
    id: 'S4-SNOW', name: 'SNOW LOAD AND ACCESS',
    watches: 'Accumulated snow water equivalent; forecast rain-on-snow',
    lead: '12-48 hours',
    acts: [
      'Report accumulated roof load against the design value — the ONE load that governs every member in model/structure.mjs and is UNVERIFIED',
      'Flag rain-on-snow, which can double an accumulated load in a day',
      'Advise clearing the drive BEFORE the event rather than after, because at 11% a plough cannot climb what it could have prevented',
    ],
    uses: ['roof load cell or snow depth sensor', 'weather feed'],
    because: 'The drive at 11% exceeds the 10% fire apparatus limit. If it closes, an ambulance does not reach a doctor\'s house.',
  },
  {
    id: 'S4-SEASON', name: 'SEASONAL SETBACK AND SOLAR ANTICIPATION',
    watches: 'Sun position, forecast clear-sky hours, interior temperature trend',
    lead: 'hours',
    acts: [
      'Pre-cool the slab on summer nights so the 650 sf of south glass and the west clerestory have somewhere to dump heat',
      'Stop heating before a clear winter afternoon and let the glass do it',
      'Close the clerestory\'s motorised awnings against late summer gain — the one opening on this house facing the wrong way',
    ],
    uses: ['slab loop', 'clerestory operable units', 'interior temperature sensors'],
    because: 'The building has real thermal mass and a lot of south glass. Without anticipation those are a liability instead of an asset.',
  },
];

// ── S5 — IDENTITY ───────────────────────────────────────────────────────────
// What arbitrates when S3 (run the house well today) and S4 (prepare for what
// is coming) disagree — which they will, because preparing costs comfort.
export const S5 = {
  statement: 'A house on a ridge for a doctor, which must keep working on the worst night of the year, and be worth living in on all the others.',
  priorities: [
    'STAY HABITABLE. Heat, water, waste and a way out, in that order, through a multi-day outage.',
    'PROTECT SLEEP. A physician post-call outranks a thermostat schedule. The Gallery exists for this.',
    'DEGRADE VISIBLY. When something fails it must be obvious which thing failed, and the house must keep doing everything else.',
    'DO NOT SPEND RESILIENCE ON SPECTACLE. If a feature only performs in the brochure, it loses to one that performs in February.',
  ],
  arbitration: 'When S4 wants to charge the battery and S3 wants to run the hot tub, S5 says the battery. When S4 wants to hold the cistern full and S3 wants to wash the drive, S5 says the cistern. The rule is not "resilience always wins" — it is that anything reversible yields to anything that is not.',
};

// ── THE ALGEDONIC CHANNEL ───────────────────────────────────────────────────
// Pain. Signals that bypass every level and act with no permission, and which
// must keep working when the "brain" — the controller, the network, the
// internet — is dead. A smart house whose safety depends on its smartness is
// not a resilient house; it is a fragile house with an app.
export const ALGEDONIC = [
  { signal: 'Smoke or CO', reflex: 'Interconnected alarms sound and the ERV shuts down. Hardwired. No controller in the path.' },
  { signal: 'Water on a floor', reflex: 'Motorised valve closes the house supply. Battery-backed, local, latching.' },
  { signal: 'Pipe approaching freezing', reflex: 'Slab loop and heat trace energise from a local thermostat, not from a schedule.' },
  { signal: 'Septic high water', reflex: 'Local alarm at the mudroom, audible inside, independent of any network.' },
  { signal: 'Loss of grid', reflex: 'Transfer is automatic and mechanical. The house islands whether or not anything is listening.' },
];

// ── WHERE THE MODEL SAYS THIS DESIGN IS STILL NOT VIABLE ────────────────────
/**
 * The point of applying the VSM is not to label the parts. It is to find the
 * missing channels. These are the ones the model exposes.
 */
export function viabilityGaps() {
  return [
    { level: 'S4', gap: 'NO ENVIRONMENTAL DATA SOURCE IS SPECIFIED.',
      cost: 'Every policy above depends on a forecast. Which feed, what happens when it is unreachable, and what the house does with no forecast at all are undesigned. A house that only anticipates when the internet is up has not solved the problem it was built for.' },
    { level: 'S4', gap: 'THE SPRING HAS NO MEASUREMENT AND NO TESTED YIELD.',
      cost: 'S4-DROUGHT cannot run. The house cannot model the one resource it cannot buy back quickly.' },
    { level: 'S1-ACCESS', gap: 'THE DRIVE EXCEEDS THE FIRE APPARATUS GRADE LIMIT.',
      cost: 'The single most consequential unresolved item: an operation whose failure mode is that emergency services cannot reach a physician\'s house.' },
    { level: 'S3', gap: 'NO LOAD CALCULATION EXISTS.',
      cost: 'S3 allocates capacity it has never counted. No Manual J, no electrical load calculation, no fixture-unit count. The systems are proven to COEXIST, not to PERFORM.' },
    { level: 'S1-SHELTER', gap: 'THE GOVERNING SNOW LOAD IS UNVERIFIED.',
      cost: 'Every structural member resizes if it changes. The skeleton is provisional.' },
    { level: 'S5', gap: 'THE BREEZEWAY CONTRADICTS THE IDENTITY STATEMENT.',
      cost: 'S5 says the house must work on the worst night of the year, and the everyday route crosses 9 ft of unconditioned outdoors carrying groceries, a child, or a medical bag. Fire and CO separation argue for the gap; S5 argues against it. That conflict is stated and NOT RESOLVED.' },
  ];
}

export function summary() {
  return {
    s1: S1.length, s2: S2.length, s3Star: S3_STAR.length,
    s4: S4.length, algedonic: ALGEDONIC.length, gaps: viabilityGaps().length,
  };
}

export default { S1, S2, S3, S3_STAR, S4, S5, ALGEDONIC, viabilityGaps, summary };
