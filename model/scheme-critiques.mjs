// HENRY HOUSE — SCHEME CRITIQUES, GENERATED.
//
// Written by tools/build-critiques.mjs. DO NOT HAND-EDIT.
//
// The gauntlet template's fan-out rule: "one builder, one separate critic with
// fresh context. The builder never grades itself." These come from critics that
// did not draw the plan they are judging and cannot see the builder's note.
//
// Every finding here names WHERE it is and WHAT would have to change, so it can
// be checked against the drawing rather than admired. A critique whose findings
// were all minor was rejected: a critic that finds nothing serious on a
// schematic plan has not looked hard enough.
//
// 3 critiques.

export const CRITIQUES = [
  {
    "id": "S0-SPINE",
    "verdict": "LOSS",
    "note": "FATAL and MAJOR findings retained; MINOR findings on laundry position, gear room and the stair-area tally omitted for length.",
    "findings": [
      {
        "severity": "FATAL",
        "where": "BED 1 PRIMARY (x0-20, y0-14) vs BATH 1 (x8-20, y19-26) and PRIMARY W.I.C. (x0-8, y19-26)",
        "finding": "The primary suite is not a suite. SPINE HALL W occupies y14-19 across x0-26, so the bedroom and its bath and its walk-in closet share no common edge - an en-suite door is geometrically impossible as drawn. The primary bath and closet both open onto the general corridor, which also serves the OFFICE and LINEN and is the landing out of STAIR HALL A. In a 3,747 sf house the owners cross a public hall in a towel to get dressed. A primary bath entered only from circulation is a hall bath with a nice label.",
        "fix": "Rotate the suite so bed, bath and closet occupy a contiguous block off a private vestibule, and let SPINE HALL W terminate at that door rather than running past three suite doors."
      },
      {
        "severity": "FATAL",
        "where": "KITCHEN x48-62, y19-26 (14 x 7 = 98 sf)",
        "finding": "The kitchen is a 7 ft deep slot buried in the uphill band. Its y=26 wall is the retaining cut - no glazing, no venting, the coldest and dampest surface in the house - and its y=19 wall is a 5 ft corridor, so it has zero daylight in the one room a family occupies most. At 7 ft deep, base cabinets on both faces leave a 3 ft aisle, no island, no eat-in, no two cooks. Worse, it does not touch DINING at all: the 5 ft SPINE HALL E sits between them, and that same 5 ft is the house's only east-west route, so every trip from the entry to the west wing passes between the cook and the table.",
        "fix": "Move the kitchen to the downhill band adjacent to and open to DINING, and push pantry, laundry and closets into the windowless uphill band where daylight is not required."
      },
      {
        "severity": "MAJOR",
        "where": "STAIR HALL A (lower+main) and STAIR HALL B (main+upper)",
        "finding": "There are three levels and two stairs, and neither serves all three. A child in BED 3 or BED 4 on the lower level going to BED 2 or BATH 2 on the upper must climb stair A, traverse the entire main-floor public spine past office, kitchen, living and dining, then climb stair B - roughly 40 ft of corridor and two stairs to move between two bedrooms. Both shafts are fully enclosed by other rooms, so you change level in the dark at 3 a.m. on the two most dangerous surfaces in the building.",
        "fix": "Collapse to one stair core serving all three levels, placed near the middle with borrowed or direct daylight, and recover the second shaft's 240 sf as program."
      },
      {
        "severity": "MAJOR",
        "where": "SPINE HALL W + STAIR A + SPINE HALL E + STAIR B + LINK HALL, x0 to x87",
        "finding": "The main level is one continuous 87 ft corridor, 5 ft wide, double-loaded end to end - 575 sf of the main floor's 2,187 sf, and the reason circulation reaches 27%. It reads as a motel: every room is a door off a tunnel with no daylight at either end. STAIR HALL B at 120 sf is simultaneously the only upper stair, the sole east-west passage between entry and kitchen, and the door to the dining room, so arriving guests, dinner service and someone descending from BED 2 all collide in a 10x12 box.",
        "fix": "Break the spine into two shorter branches off a central hall/stair core, or widen segments into occupiable rooms so the length earns its area. Get the through-route out of the stair footprint."
      },
      {
        "severity": "MAJOR",
        "where": "BED 1 PRIMARY vs ENTRY/MUD x72-87 and the garage at x96-120",
        "finding": "The client takes call and sleeps at odd hours, and the plan puts his bed at the dead end of the corridor, 87 ft and two stair halls from the only entry and roughly 110 ft from the car. Every 2 a.m. departure walks the full length of the house past kitchen, dining, living, stair hall and mud room, then 9 ft outdoors - waking the house on the way out and again on the way back. The primary is also on the downhill wall, where the brief says view and winter sun both arrive: the one room that must be dark at 10 a.m. gets the most sun-struck elevation.",
        "fix": "Give the primary a short direct path to the entry/garage side, or a second exterior door near the sleeping end, and buffer the bed with closet and bath."
      },
      {
        "severity": "MAJOR",
        "where": "BED 2 and LOFT at ffe 20",
        "finding": "The upper level has exactly one stair, it is windowless, and it discharges into the main spine beside the dining room. The escape openings for BED 2 and the LOFT are on the downhill wall at ffe 20, roughly 20 ft above the terrace and more as the ground falls away - not a rescue opening in February, and not ladder-accessible from a 30% grade. A kitchen fire directly below leaves the upper level with no second means of escape.",
        "fix": "Provide a second means of egress from the upper level, or relocate the upper sleeping rooms to a level whose escape opening is within reach of grade."
      },
      {
        "severity": "MAJOR",
        "where": "Garage x96-120 to KITCHEN x48-62 via breezeway and ENTRY/MUD",
        "finding": "The February grocery walk is 9 ft of unheated outdoors, then mud room, link hall, through STAIR HALL B, then the length of SPINE HALL E - roughly 45 to 50 ft indoors with full arms, and the last leg crosses dining-room traffic. There is no service door from the garage side to the kitchen or scullery, even though the scullery sits as far from the car as it is possible to be on the same floor. The unheated breezeway will hold drifting snow and refreeze at the threshold.",
        "fix": "Bring the kitchen and scullery to the entry end, or run a service leg from the mud room straight into the scullery. Heat or fully enclose the breezeway slab."
      },
      {
        "severity": "MAJOR",
        "where": "MECH x0-8 y19-26 (56 sf) relative to KITCHEN, LAUNDRY and BATH 2",
        "finding": "The single mechanical room is 56 sf at the farthest corner from everything it serves. Hot water runs 55 ft to the kitchen, 85 ft to the laundry, 60 ft plus two storeys to BATH 2 - long waits, standing losses, and runs threading the cold uphill band while the freeze rule forbids the exterior wall. No secondary mechanical closet east of x=36, no exterior equipment access: a failed water heater comes down the only lower stair and along 26 ft of 5 ft corridor. 56 sf will not hold heat plant, water heating, pressure tank, treatment, HRV and electrical for 3,747 sf at this elevation.",
        "fix": "Enlarge MECH to 100-120 sf with a direct exterior door, and add a secondary plumbing closet near the eastern wet group."
      },
      {
        "severity": "MAJOR",
        "where": "The entire y19-26 uphill band on every level",
        "finding": "Every wet room has its back wall on the buried retaining spine at y=26. Under the freeze rule no plumbing may go there, which forces all 87 lf of wet wall onto the y=19 corridor wall in rooms only 7 ft deep. That means single-wall fixture runs everywhere - BATH 1 at 12x7 must line tub, toilet and vanity along one face - and every flush and shower is audible in the corridor because the plumbing wall IS the corridor wall. The scullery shelving also backs onto a below-grade cut wall: food storage against the coldest, dampest surface in the building.",
        "fix": "Deepen the uphill band to 10-11 ft so wet rooms can be double-loaded off an interior plumbing chase, and insulate and drain the retained face before putting food storage or the primary bath against it."
      }
    ],
    "biggestGap": "The primary suite is broken by the spine itself: SPINE HALL W runs between BED 1 and both BATH 1 and the W.I.C., so no en-suite door can exist and the owners' bath and closet open onto the house's public corridor - and that corridor then runs 87 ft to put the on-call doctor's bed as far from the car as the plan allows.",
    "whatWorks": "The circulation discipline is real - every room touches a hall or stair directly, so nothing is landlocked or entered through another room, and the wet stack of BATH 3 under BATH 1 with all bedrooms on the downhill daylight face is genuinely well-ordered."
  },
  {
    "id": "S3-NARROW",
    "verdict": "LOSS",
    "note": "FATAL and MAJOR findings retained; MINOR findings on the arrival sequence and the inverted bedroom hierarchy omitted for length.",
    "findings": [
      {
        "severity": "FATAL",
        "where": "Porch x0-62 y-8 to y2 ffe 8 - route from BED 1 PRIMARY (ffe 10) to KITCHEN (ffe 8)",
        "finding": "There is no interior connection between the two bodies at any level. Every trip from any bedroom to the kitchen, the living room, the dining room or BATH 2 is: out the stair hall door, DOWN 2 ft of exterior risers, ~30 ft east along an unheated open deck 7-9 ft above grade, and back in. At 3,400 ft that hall is snow-covered, unlit, and directly under the shed line of the one roof plane. The doctor makes that crossing at 3 a.m.; children make it in pyjamas for breakfast. THE 7% CIRCULATION FIGURE IS AN ACCOUNTING ARTIFACT: the real corridor is 620 sf of porch plus 220 sf of dogtrot - 840 sf of unconditioned, ice-prone circulation, roughly half the conditioned area of the house, uncounted because it is not conditioned.",
        "fix": "Either enclose and heat a connector across x26-36 at one level, or abandon the split program - put a bed, a bath and the kitchen on the same side of the slot so no daily route leaves the envelope."
      },
      {
        "severity": "FATAL",
        "where": "West sleeping wing - BED 1, BED 2, STAIR HALL (ffe 10) and DEN/BUNK (ffe 0)",
        "finding": "The entire sleeping wing has one usable exit: the stair hall door onto the porch. That same porch is also LIVING's exit and BED 3's exit, all of it a single 62 ft deck under one continuous roof plane. A fire at the living room end - and the GEAR/FIREWOOD room says wood heat is intended - puts the sole escape path for the primary bedroom, the second bedroom and the bunk room inside the fire. The nominal second exit is a service door out of MECH WEST reachable only by walking through BED 2 or through BATH 1 into the LAUNDRY, dropping 24 in to the dogtrot with no landing drawn. That is not a means of egress.",
        "fix": "Give the west upper a second, separated exit at grade on the uphill face, and stop making the porch the shared escape route for both bodies."
      },
      {
        "severity": "FATAL",
        "where": "STAIR x11 y2 4x15, ffe 0 to ffe 10",
        "finding": "A 10.0 ft floor-to-floor rise drawn in a 4 x 15 shaft. At a 7.75 in maximum riser that is 16 risers and 15 treads; at a 10 in minimum tread the run alone is 12.5 ft, and a landing not less than the 4 ft stair width is required top and bottom - 20.5 ft of length required inside a 15 ft box. It cannot switch back either: that needs roughly 8 ft of width and the shaft is 4 ft. Compounding it, BATH 1's only interior door is the 4 ft shared edge at y=17, exactly where the top landing has to sit, so the family's only bathroom door opens over the stair.",
        "fix": "Enlarge to a switchback of about 8 x 12 with a proper landing - which costs real area on both west levels and will break the 7% number - or reduce the west floor-to-floor below 10 ft."
      },
      {
        "severity": "MAJOR",
        "where": "MECH WEST x20 y17 6x7 and LAUNDRY x15 y17 5x7, ffe 10",
        "finding": "Interior access to the water heater, the air handler and the washer runs through a child's bedroom, or through the family's only bathroom and then the laundry. The stair hall stops at x=15 and never reaches either. A service tech at 6 a.m. on a no-heat call walks through a bedroom. The alternative, the exterior service door, is a 24 in step down into an open slot.",
        "fix": "Run the stair hall north to y=24 so the laundry and mech bar are entered off circulation, not off BED 2 and BATH 1."
      },
      {
        "severity": "MAJOR",
        "where": "MECH EAST x54 y17 4x7 ffe 8",
        "finding": "28 sf, 4 ft wide. A 30 x 30 in level working space in front of the appliance leaves at most about 18 in of appliance depth - no air handler, indirect tank or water heater fits, let alone all three. Its full 4 ft y=17 wall is the head wall of the GUEST BEDROOM. Two mechanical rooms and two water heaters in a 1,716 sf house is a cost the dogtrot imposes, and the plan admits it without testing whether the slot is worth it - it is not, since the same slot also forces the outdoor corridor above.",
        "fix": "Size MECH EAST to at least 6 x 7 with clear working space, move it off the guest bed wall, and reconsider the slot: bridging it once buys back a whole plant."
      },
      {
        "severity": "MAJOR",
        "where": "The y=17 wet wall, both bodies (52 lf)",
        "finding": "The single wet wall is genuinely disciplined against the freeze rule, but 22 of the west body's 26 ft of it is bedroom wall, with only 4 ft of stair hall as buffer; east, MECH EAST and half of BATH 2 back onto BED 3. So every soil stack, shower valve, washer standpipe, water heater and air handler in the house is on the far side of a bed wall - in a house whose client sleeps at odd hours and takes call. The wet wall solved freeze and created an acoustic failure across all three levels.",
        "fix": "Turn fixtures onto the x-walls, or insert a 2 ft closet/chase buffer between the wet bar and the bedroom faces at y=17."
      },
      {
        "severity": "MAJOR",
        "where": "LIVING x36 y2 14x8, ffe 8",
        "finding": "8 ft deep, and it is also the east body's entire circulation system: the dogtrot entry lands in it, the porch door leaves it, BED 3 is entered through it, and DINING is crossed to reach it. Four routes through a 14 x 8 room. A sofa is 3 ft deep and a walking route is 3 ft, so one sofa consumes the room and no wall is left for a wood stove with its clearances and hearth extension. Meanwhile GEAR/FIREWOOD sits at ffe 0 in the west body, so feeding that stove is down 10 ft of stair, load, up 10 ft, out, down 3 risers, 23 ft of icy deck, in. Every day, all winter.",
        "fix": "Insert a small entry lobby off the dogtrot, deepen living to 12 ft minimum, and put the wood store on the same level and side as the hearth."
      },
      {
        "severity": "MAJOR",
        "where": "DINING x36 y10 14x7 and KITCHEN x36 y17 11x7, ffe 8",
        "finding": "Neither room has a single square foot of downhill wall; their only possible glazing looks sideways into a 10 ft slot shaded by the west body. On a site where the view and the winter sun both arrive from -y, the two rooms the family occupies most get neither. This also falsifies the scheme's headline claim: because the wet wall runs continuously 52 ft along y=17, NOT ONE of the twenty rooms touches both the uphill and the downhill face, so the body does not cross-ventilate from both sides - it is two single-aspect bands with a solid wall between them.",
        "fix": "Break the y=17 wall with a vent path, or pull the kitchen to the downhill face and push living and dining into a single deeper room."
      },
      {
        "severity": "MAJOR",
        "where": "BED 3 GUEST x50 y2 12x15 and BATH 2 x47 y17 7x7, ffe 8",
        "finding": "BED 3's only interior neighbours are LIVING and DINING, so the guest bedroom is entered through the public rooms. BATH 2 is the only bath on the main level and its shared edge with DINING is just 3 ft - too little for a leaf with jamb allowance - so in practice it becomes the guest's ensuite, leaving the living, dining and kitchen level with no bathroom that is not inside a bedroom. The remaining option puts a toilet room opening directly into food prep.",
        "fix": "Shift BATH 2 west against the kitchen with a door off a small lobby."
      },
      {
        "severity": "MAJOR",
        "where": "DEN / BUNK ROOM x15 y2 11x15, ffe 0",
        "finding": "A named sleeping room on the buried level. The plan itself requires a terrace cut to about el.-0.5 to walk out - a sunken well beneath a porch deck 8 ft overhead at the foot of a 30% slope, precisely where roof-shed snow and slope meltwater collect and freeze. That well is simultaneously the room's only daylight, its only rescue opening and its only exit other than a stair that does not fit. There is no toilet anywhere on the level.",
        "fix": "Either declare it non-sleeping, or give the lower level a proper walkout court clear of the deck, a compliant stair, and a bath."
      },
      {
        "severity": "MAJOR",
        "where": "The 2 ft break between ffe 10 and ffe 8",
        "finding": "The plan describes three risers for this step: 24 in / 3 = 8.0 in per riser, above the 7.75 in maximum, and both crossings are exterior treads at 3,400 ft. The dogtrot door has no landing drawn at all, so it is a 24 in drop out of a door leaf. This break sits on the only route from the car to a bed, taken carrying a sleeping child, groceries and laundry, in the dark, on ice, buried under snow for months. There is no accessible route to any bedroom: no ramp, no level entry, no ground-floor bed. On crutches the primary bedroom is unreachable.",
        "fix": "Set the west upper at ffe 8 and absorb the 2 ft at the lower level, eliminating the break; failing that, draw compliant covered stairs with landings at both doors."
      }
    ],
    "biggestGap": "The two bodies never touch: with no interior connection at any level, the 62 ft porch and the open dogtrot are the actual corridor of this house, so every trip from a bed to the kitchen, the living room or the only main-level bath goes outdoors, down a non-compliant 2 ft step, in Watauga County snow - and the celebrated 7% circulation is just that 840 sf of exterior hall going uncounted.",
    "whatWorks": "The single continuous 52 lf wet wall at y=17, stacked across all three levels with the buried lower level left entirely dry, is a genuinely disciplined and correct answer to the freeze rule at this elevation."
  },
  {
    "id": "S5-PERCH",
    "verdict": "LOSS",
    "note": "FATAL and MAJOR findings retained; MINOR findings on closets and laundry position omitted for length.",
    "findings": [
      {
        "severity": "FATAL",
        "where": "MECH/WATER ENTRY x20 y23 4x9 (ffe 6); POWDER; LAUNDRY; BATH x24 y23 10x9 (ffe 16)",
        "finding": "Every plumbed room is pinned to the uphill band y23-32, and y=32 IS the exterior face. MECH/WATER ENTRY is a corner room with two exterior walls and holds the most freeze-critical pipe in the building. The claimed 26 lf of wet wall cannot be an interior line: the longest interior run is 24 ft; the only 26 ft dimension in the plate is the exterior side wall. Either the metric is wrong or the wet wall is an exterior wall - a direct violation of the stated freeze rule at 3,400 ft.",
        "fix": "Move the water entry to a fully interior conditioned bay. Hold every fixture off y=32, x=20 and x=44; mount supply and waste on the x=24 and x=34 partitions. Re-report wet-wall length against an interior line."
      },
      {
        "severity": "FATAL",
        "where": "STAIR x34 y23 10x9 on all three floors; LOFT (bed) at ffe 26",
        "finding": "One stair is the only vertical route and the only way out of a sleeping room 20 ft above the only exterior door. The house is lifted on a plinth on a 30% slope, so the loft's downhill sill is roughly 30-40 ft above downhill grade - beyond ground-ladder rescue, on a road a volunteer department reaches slowly in winter. A fire on ffe 6, which holds the kitchen, laundry and mechanical room, cuts off both bedroom floors at once.",
        "fix": "Either delete sleeping use at ffe 26, or add a second means of escape plus a protected stair enclosure with a rated door at each landing."
      },
      {
        "severity": "FATAL",
        "where": "The shutter over the downhill opening at y=6; STORE/SHUTTER GEAR at ffe 26",
        "finding": "One shutter closes the entire downhill face, which is the only glazing serving DINING, LIVING, BED 1, BED 2, LOFT and WORK. Closed, it blacks out every habitable room and covers the emergency escape opening of all three sleeping rooms simultaneously. The operating gear sits on the third floor behind the only stair. Nothing is drawn for interior manual release, per-floor override or fail-open - and at 3,400 ft it will ice up in whatever position it was last left.",
        "fix": "Break the shutter into per-opening panels that fail OPEN, with a manual interior crank at each floor. No panel may cover a required escape opening."
      },
      {
        "severity": "MAJOR",
        "where": "BATH x24 y23 10x9 (ffe 16) - the only full bath; STORE/SHUTTER GEAR directly above it",
        "finding": "Three sleeping rooms, a family, and one full bath, plus a powder two floors below it. Loft occupants descend a 10 ft flight at night to reach a toilet. The plan already has a perfectly aligned 10x9 wet stack - POWDER+LAUNDRY at ffe 6, BATH at ffe 16 - and at ffe 26 squanders it on shutter storage. The riser is already there and the plan declines to use it.",
        "fix": "Put a 3/4 bath at ffe 26 directly over the ffe 16 bath and push storage into the mech bay."
      },
      {
        "severity": "MAJOR",
        "where": "Whole of ffe 6 - no bed, no shower",
        "finding": "There is no level on which a person who cannot climb stairs could live. A doctor with a broken ankle from this very slope, an ageing parent, a post-op recovery, a newborn: all locked out. The only bay stacking clear on all three floors that could take a future lift is 4 ft wide - short of a residential shaft - and occupied at the bottom by the water entry.",
        "fix": "Widen a stacked shaft bay to at least 5'-0\" x 5'-6\" clear and keep it free top to bottom; plan a convertible room plus a 3/4 bath at ffe 6."
      },
      {
        "severity": "MAJOR",
        "where": "KITCHEN x20 y16 14x7",
        "finding": "Seven feet nominal will not take a double-loaded kitchen. Subtract two partitions and the clear width is about 6'-2\"; two 25 in. counters leave roughly 32 in. of aisle, under the 36 in. minimum and far under the 42-48 in. anyone actually cooks in. Single-loaded, 14 lf must hold range, sink, refrigerator, dishwasher and all prep in the primary kitchen of a family house.",
        "fix": "Take depth from the y23-32 service band and give the kitchen a minimum 10 ft depth with a 42 in. working aisle."
      },
      {
        "severity": "MAJOR",
        "where": "KITCHEN and its y=23 wall shared with MECH, POWDER and LAUNDRY",
        "finding": "The kitchen has no downhill exposure - the cook stands with their back to the view and the winter sun, the one thing this scheme exists to capture. Meanwhile the y=23 wall carries three service doors into food prep, including a WC door opening directly into the kitchen.",
        "fix": "Swap the kitchen forward to share the downhill glazing with dining; at minimum vestibule the powder so its door does not open into the kitchen."
      },
      {
        "severity": "MAJOR",
        "where": "STAIR x34 y23 10x9, floor-to-floor 10 ft",
        "finding": "The stair does not close in the box drawn. Ten feet at 7 in. risers is 17-18 risers and about 14'-2\" of run; a switchback in a 10x9 box needs roughly 9'-8\" in the 9 ft dimension. It is short, so something gives, and it will be winders - on the sole means of egress from two sleeping floors. No switchback at 3 ft flight width will pass a backboard. This is a doctor's house on a 30% icy slope.",
        "fix": "Grow the stair bay to roughly 11 x 11 with straight flights, minimum 3'-6\" clear width, no winders. Verify a backboard turn at every landing."
      },
      {
        "severity": "MAJOR",
        "where": "BED 1 over KITCHEN; LOFT directly over BED 1; WORK directly over BED 2",
        "finding": "The client sleeps at odd hours and takes call, and every room sits directly on an occupied room with the worst possible assignments: the primary bedroom's floor is the kitchen's ceiling, the loft bed is over the primary bed, and WORK is over BED 2. No buffer layer is used anywhere. The one explicitly stated program requirement is the one the plan structurally cannot meet.",
        "fix": "Put storage and bath bays under and over the sleeping rooms rather than beside them; decouple the floor over the kitchen; move WORK off the top of BED 2."
      },
      {
        "severity": "MAJOR",
        "where": "MUD/GEAR x34 y16 10x7 - the only exterior door",
        "finding": "One exterior door in the entire building, on the uphill face, at the same corner as the only stair. That door is where the cut bank sloughs and drifts, and a single roof plane dumps its whole snow load along one line: shed it uphill and it buries this door. The LAUNDRY and MECH - the two commonest ignition sources in a house - flank the only vertical escape route and the only exit.",
        "fix": "Add a second exterior door at the opposite end, protect the primary door with a deep covered landing clear of the shed line, and move the laundry out of the band adjoining the stair."
      },
      {
        "severity": "MAJOR",
        "where": "GALLERY HALL x20 y19 24x4 at ffe 16 and 26",
        "finding": "462 sf of circulation, 25% of a 1,872 sf house, from a plan that sells itself on efficiency. The 24 ft gallery is 4 ft wide with no daylight at either end, and exists only because the stair is parked in the far corner; at ffe 26 that 96 sf corridor is spent reaching a store room and a mechanical closet. A quarter of the interior given to getting around is roughly a whole bedroom and bath handed away.",
        "fix": "Centre the stair in the uphill band so the gallery collapses to a landing serving doors on both sides."
      }
    ],
    "biggestGap": "One stair, one exterior door, and a sleeping room at ffe 26 twenty feet above that door and 30-40 ft above downhill grade with no second way out - compounded by a shutter that can cover the only escape openings on all three floors at once. Until there is a second means of egress and the shutter is made fail-open and EERO-clear, nothing else about this plan is worth optimising.",
    "whatWorks": "The arrival sequence is genuinely well-resolved: MUD/GEAR lands directly on the stair and one wall from the kitchen, so groceries, gear and the vertical route meet at the same corner without crossing the house - and the x24-34 bay already stacks cleanly on all three floors, so a real wet core and a second bath are available for free if the plan will take them."
  }
];

export const critiqueFor = (id) => CRITIQUES.find(c => c.id === id) ?? null;

export default CRITIQUES;
