// HENRY HOUSE — SCHEME PROPOSALS, GENERATED.
//
// Written by tools/collect-schemes.mjs from a workflow run. DO NOT HAND-EDIT:
// re-run the collector instead. Every entry here is loaded by model/schemes.mjs
// through the same V/R/ground vocabulary as the hand-written schemes, so it is
// measured by the same metrics, priced by the same rates, judged by the same
// critics and drawn by the same code. A proposal cannot argue its way in — it
// is validated on the way through this file and dropped if it does not hold up.
//
// 4 proposals collected.

export const PROPOSED = [
  {
    "id": "S7-DATUM",
    "name": "THE DATUM",
    "tag": "one plane, four times the house",
    "operation": "Build one enormous roof plane first, sized for a building far larger than the house you can afford, and let ordinary cheap construction sit under it. The disproportion is the architecture: four square feet of permanently dry hillside for every one that is heated.",
    "doNotCopy": "The carpet-tile bale walls, the found-material picturesque, the Alabama roof profile. And do not let the big roof become a promise of future rooms — that is the Armature's move. Under this datum the ground stays ground; what transfers is only the disproportion between the shelter and the house.",
    "henryTest": "If one plane can make 3,840 sf of this hillside permanently dry, how much of Henry's 3,747 sf ever needed to be heated?",
    "rooms": 3,
    "roomsNote": "3 bedrooms, 2 baths in phase 1 — one bedroom on the tower's ground floor with the entry, mudroom, stair, laundry and mechanical; two bedrooms and the second bath above. Every bedroom is 10 x 14 or better with a solid uphill wall to put a bed against and glass on the downhill side. Phase 2's inserted floor adds two rooms and a third bath on the same stack.",
    "volumes": [
      {
        "id": "great",
        "kind": "cond",
        "x0": 8,
        "y0": 0,
        "w": 26,
        "d": 22,
        "storeys": 1,
        "ffe": 10.5,
        "wet": false,
        "note": "living, dining, kitchen. Built with a 20 ft wall plate on day one: a tall single room with clerestory on all four sides, and the floor for phase 2 drops into it later."
      },
      {
        "id": "tower",
        "kind": "cond",
        "x0": 34,
        "y0": 0,
        "w": 18,
        "d": 22,
        "storeys": 2,
        "ffe": 10.5,
        "wet": true,
        "note": "the service tower. Front door on its uphill face at y=22, where grade 10.26 meets ffe 10.5 — you arrive from the north-east motor court, walk down under the datum, and step in level. Mudroom, stair, both baths, laundry, mechanical, flue; 1 bedroom down, 2 up."
      },
      {
        "id": "upper",
        "kind": "future",
        "x0": 8,
        "y0": 0,
        "w": 26,
        "d": 22,
        "storeys": 1,
        "ffe": 20.5,
        "wet": false,
        "note": "DELIBERATELY DIRECTLY ABOVE 'great' — not a separate footprint. The floor inserted into the tall room in phase 2, level with the tower's upper floor and reached through the door that is already there. No footing, no envelope, no roof work."
      },
      {
        "id": "deck",
        "kind": "shelt",
        "x0": 8,
        "y0": -8,
        "w": 44,
        "d": 8,
        "ffe": 10.5,
        "note": "the view deck, level with the floor and 13 ft above the ground at its west end. 20 ft of air overhead; the eave is 6 ft further downhill so the snow that slides off lands past it."
      },
      {
        "id": "yard",
        "kind": "shelt",
        "x0": 52,
        "y0": 6,
        "w": 24,
        "d": 24,
        "ffe": 10,
        "note": "dry ground on natural grade, stepped three times in dry-stacked stone, no cut: the covered arrival walk from the north-east, wood, gear, workshop bench, water tanks. This is permanent outdoor room, not a future bay."
      },
      {
        "id": "undercroft",
        "kind": "shelt",
        "x0": 8,
        "y0": 0,
        "w": 26,
        "d": 7,
        "ffe": 2,
        "note": "DELIBERATELY UNDER 'great' — dry store on the natural ground beneath the floating floor, 6 to 10 ft of clear height, open west and south."
      },
      {
        "id": "terrace",
        "kind": "shelt",
        "x0": 0,
        "y0": 0,
        "w": 8,
        "d": 22,
        "ffe": 10.5,
        "note": "west end under the datum — evening sun, sheltered from the prevailing north-west weather by the house itself."
      }
    ],
    "roofs": [
      {
        "id": "DATUM",
        "x0": -2,
        "y0": -14,
        "w": 80,
        "d": 48,
        "pitch": 2,
        "zLow": 30.5
      }
    ],
    "ground": {
      "kind": "piers",
      "diaFt": 2.5,
      "pts": [
        [
          -1,
          -8
        ],
        [
          8,
          -8
        ],
        [
          30,
          -8
        ],
        [
          52,
          -8
        ],
        [
          76,
          -8
        ],
        [
          8,
          0
        ],
        [
          21,
          0
        ],
        [
          34,
          0
        ],
        [
          52,
          0
        ],
        [
          8,
          22
        ],
        [
          21,
          22
        ],
        [
          34,
          22
        ],
        [
          52,
          22
        ],
        [
          -1,
          32
        ],
        [
          25,
          32
        ],
        [
          51,
          32
        ],
        [
          76,
          32
        ]
      ]
    },
    "wetWallFt": 22,
    "wetNote": "One 22 ft wall: the tower's west face at x=34. Kitchen on the great-room side; bath, laundry, water heater and mechanical on the tower side; the upper bath and the phase-2 bath stack directly above. One vent stack, one hot-water run, one line to drain down when the house is shut for the winter.",
    "growthTouchesRoof": false,
    "growthNote": "Phase 2 lays a floor at 20.5 ft across the great room, level with the tower's upper floor, landing on walls already built to a 20 ft plate. The roof does not move, the envelope does not change, the piers were sized for it on day one. The datum's height IS the growth capacity — 572 sf with no footing, no cladding and no roof, the cheapest square foot on the site, and precisely the move the Tower cannot make without lifting its roof.",
    "phases": [
      {
        "n": 1,
        "label": "Great room + service tower under the whole datum — 3 bed, 2 bath",
        "condSf": 1364
      },
      {
        "n": 2,
        "label": "A floor inserted into the tall great room at 20.5 ft",
        "condSf": 1936
      }
    ],
    "rationale": "The roof is 3,840 sf and the conditioned footprint under it is 968 — four to one, the operation stated as a number rather than as a mood. It is ONE plane, 80 x 48 at 2:12 falling south, so there is exactly one eave, one drip line and one place where snow lands, six feet clear of the deck; at 2:12 the ridge reaches 38.5 ft, still under 35 ft measured from the 5.5 ft average grade beneath it. Under it the house is deliberately dumb: two flat-topped boxes, 26 x 22 and 18 x 22, 1,364 sf conditioned — Sylvia 3/2's number exactly, for Sylvia 3/2's programme — behind 132 lf of wall, on 17 piers and 18 CY of earth against the Spine's 440. Because the boxes are level-topped and the plane rises uphill, the house's own lid sits two to six feet below the datum: clerestory light on all four sides, and the house's roof is effectively indoors — it carries no snow, no ice and no ultraviolet, so it can be cheap and it will outlive the mortgage. The datum's price is stated rather than hidden: the downhill columns stand 30 to 34 ft, and the two house boxes are what brace them — the cheap house braces the monumental roof, which is the whole argument in one sentence.",
    "selfCheckSf": 1364
  },
  {
    "id": "S8-WATER",
    "name": "THE CATCH",
    "tag": "the roof is sized in gallons",
    "operation": "Size the roof by the water it must collect rather than the rooms it must cover, and let one unbroken plane fall away from the cut so the entire catchment reports to a single eave, a single leader and a single buried tank. Everything else the roof does — porch, summer shade, covered arrival, a spare bay — is what that surface area gives back for free.",
    "doNotCopy": "The butterfly section itself. Harris's two planes tip inward and run a valley down the middle of the house: in Hale County that is a gutter, at 3,400 ft with ice storms it is a dam, and it is a roof junction the full length of the building. Take the water logic, refuse the V. Also do not read this as ARMATURE with a tank bolted on — ARMATURE's roof is sized by the number of future bays, this one is sized in gallons, and the spare bay is only what that area happened to leave over.",
    "henryTest": "If the spring (A-12/A-13: assumed, untested, and mountain springs fail in late-summer drought) yields nothing in August and a well hits nothing either, does this house still work? This scheme answers yes before anyone drills — and asks in exchange whether 3,024 sf of roof over 1,352 sf of house can be justified in gallons rather than in taste.",
    "rooms": 3,
    "roomsNote": "Phase 1: 3 bedrooms, 2 baths. Entry level (792 sf, ffe 13.0) — great room + kitchen in the west 22 ft, the 10 ft service core mid-plan (bath 1, laundry, stair), primary bedroom 12x12 at the east with its bed on the core wall, boot room at the only door on the uphill face. Walkout level (560 sf, ffe 3.5) — bedrooms 2 and 3 at 120 and 132 sf, both with downhill glass and a solid interior wall for a bed, bath 2 and the water plant stacked on the core, out to the lower terrace. Mature: 5 bedrooms, 3 baths.",
    "volumes": [
      {
        "id": "main",
        "kind": "cond",
        "x0": 12,
        "y0": 2,
        "w": 44,
        "d": 18,
        "storeys": 1,
        "ffe": 13,
        "wet": true,
        "note": "Entry level. Great room and kitchen west, 10 ft service core at x 34-44, primary bedroom and boot room east. The only exterior door is in this wall at y=20, x~50, under the HIGH edge of the roof."
      },
      {
        "id": "lower",
        "kind": "cond",
        "x0": 12,
        "y0": 2,
        "w": 41,
        "d": 14,
        "storeys": 1,
        "ffe": 3.5,
        "wet": true,
        "note": "Walkout level, DELIBERATELY INSIDE the footprint of main above it. Two bedrooms, bath 2, water plant. Its uphill wall is a 3-4.5 ft insulated stem, not a cut; floor is 0.5-1 ft above grade at the downhill face."
      },
      {
        "id": "bay-w",
        "kind": "future",
        "x0": -6,
        "y0": 2,
        "w": 18,
        "d": 18,
        "ffe": 13,
        "note": "Covered work bay now, two rooms later. Already under R1 and already carried by the x=-6 bent — the catchment needed the roof this wide before anyone wanted a fourth bedroom."
      },
      {
        "id": "under-w",
        "kind": "future",
        "x0": -6,
        "y0": 2,
        "w": 18,
        "d": 14,
        "ffe": 3.5,
        "note": "Dry open undercroft now, bedroom + bath later. DELIBERATELY INSIDE bay-w above it. Ground falls 8% west, so this end is 4 ft clear of grade with no digging at all."
      },
      {
        "id": "deck",
        "kind": "shelt",
        "x0": -6,
        "y0": -6,
        "w": 62,
        "d": 8,
        "ffe": 13,
        "note": "The porch is simply the last 8 ft of roof before the drip line. The gutter runs at eye level from the sofa — the machine is visible from inside. The lower terrace at ffe 3.5 sits under this deck."
      },
      {
        "id": "arrive",
        "kind": "shelt",
        "x0": 40,
        "y0": 20,
        "w": 16,
        "d": 12,
        "ffe": 13,
        "note": "Covered walk from the motor court to the door. Its outer edge meets natural grade within one inch (grade 12.94 at x=48,y=32) — arrival at grade, no steps, no regrade. Under the roof's high edge: no water and no sliding snow ever crosses the entry. 16.7 ft clear, so a water truck can back under to the fill riser."
      },
      {
        "id": "store",
        "kind": "shelt",
        "x0": 12,
        "y0": 20,
        "w": 28,
        "d": 10,
        "ffe": 9.5,
        "note": "Gravel bay under the uphill overhang — wood, gear, generator, one vehicle. Graded within a foot of natural. The roof is at its lowest above grade here and, being the high edge, sheds nothing onto the cut bank."
      }
    ],
    "roofs": [
      {
        "id": "R1",
        "x0": -10,
        "y0": -8,
        "w": 72,
        "d": 42,
        "pitch": 2,
        "zLow": 23,
        "note": "ONE plane, 3,024 sf. No valley, no junction, nothing to flash. Falls to -Y only, so 100% of the catchment leaves at the downhill eave and not one drop is shed at the uphill cut. 2:12 with snow retention: the pack is meant to sit and melt into the gutter, because a roof that avalanches loses its water."
      }
    ],
    "ground": {
      "kind": "piers",
      "pts": [
        [
          -6,
          -6
        ],
        [
          6,
          -6
        ],
        [
          18,
          -6
        ],
        [
          30,
          -6
        ],
        [
          42,
          -6
        ],
        [
          54,
          -6
        ],
        [
          -6,
          2
        ],
        [
          6,
          2
        ],
        [
          18,
          2
        ],
        [
          30,
          2
        ],
        [
          42,
          2
        ],
        [
          54,
          2
        ],
        [
          -6,
          19
        ],
        [
          6,
          19
        ],
        [
          18,
          19
        ],
        [
          30,
          19
        ],
        [
          42,
          19
        ],
        [
          54,
          19
        ],
        [
          44,
          30
        ],
        [
          54,
          30
        ]
      ],
      "diaFt": 2
    },
    "wetWallFt": 34,
    "wetNote": "One 10 ft core, x 34-44, both floors, one stack: kitchen sink on its west face, bath 1 and laundry inside, bath 2 and the water plant (first flush, sediment, UV, pressure tank, heater) directly below. 34 lf total. The gutter falls east to a single leader at the east corner of the eave with six feet of buried line to the tank. During any storm that leader can be valved straight to the house line — the eave is 10 ft above the entry floor and 19.5 ft above the walkout, so the house has pressure with no pump while it is raining, and a gravity spigot at the tank serves the lower terrace when it is not.",
    "growthTouchesRoof": false,
    "growthNote": "Both west bays are already inside R1 and already carried by the x=-6 bent — roof, frame and piers for them are in the Phase 1 contract. Infill is a floor, a skin and two doors: +576 sf, +43%, no plane lifted, no flashing cut, no work undone. The bay exists because 3,024 sf of catchment had to be that wide, not because a fourth bedroom was wanted.",
    "phases": [
      {
        "n": 1,
        "label": "The whole roof, the tank and the two-storey house — 3 bed, 2 bath, water live on day one",
        "condSf": 1352
      },
      {
        "n": 2,
        "label": "West bay infilled on both levels under the roof already there — 5 bed, 3 bath",
        "condSf": 1928
      }
    ],
    "rationale": "One plane, 72 x 42, falling only downhill: 3,024 sf of catchment with no valley, no junction and not one drop shed toward the cut — on a 30% slope the worst thing a roof can do is aim water at your own uphill bank. At 0.623 gal per sf-inch and 90% capture on standing seam that is 1,696 gal per inch of rain, so the 2,500 gal cistern fills on an inch and a half, and even at a pessimistic 45 in/yr the roof alone yields 76,300 gal against a four-person household's 73,000 — which makes the untested spring an optional bonus instead of the thing the house is betting on. The plane is 2.24x the conditioned area and every surplus foot works twice: the last 8 ft before the drip line is a 496 sf deck (sheltered/conditioned 0.716 against Joanne's 0.386), the roof meets the glass 11.7 ft above the entry floor so it shades that wall completely at summer noon and still clears 5.6 ft of it at the winter solstice, the uphill 12 ft is a covered walk landing at natural grade under the high edge where nothing ever sheds on the only door, and the west 18 ft is a bay the water already paid for. The tank is buried in a spoil berm directly below the drip line, which is also where the ~75 CY from twenty pier holes and the walkout's stem wall goes — the cut and the water system are the same move, and the alternative bench on this platform costs 182 CY of spoil the site cannot absorb on top of the 5,845 it already has. What it costs: 3,024 sf of roof is real money and a deep south porch loses the equinox sun it keeps at the solstice — the trade is that the roof is simultaneously the water supply, the porch, the shade device, the covered arrival and 576 sf of future room, and no other single element on this site can be asked to carry that much.",
    "selfCheckSf": 1352
  },
  {
    "id": "S9-ASSEMBLY",
    "name": "THE LOOP",
    "tag": "one wall section, structure to finish",
    "operation": "One assembly does every job: a solid timber panel is structure, insulation, air barrier, thermal mass and both finishes in a single section, so the house is drawn as ONE closed rectangular loop of that panel — 104 lf, 52 identical 2 ft panels, built once at full height — folded over as the same panel for roof and floors. Because there is no second system to hide anything in, everything that normally lives inside a wall (pipe, duct, wire, brace, insulation) is driven out of the enclosure and into one 8 x 10 interior block.",
    "doNotCopy": "The research rig itself — the test wall, the instrumentation, the dowel-laminated recipe, the Alabama climate it was tuned for. A vapour-open solid wall at 3,400 ft in an ice-storm zone is a different physics problem. What transfers is the discipline of ONE section doing every job, and the plan consequences that follow from it; not the section.",
    "henryTest": "If Henry can afford only one wall system, can the PLAN pay for it — one loop, no articulation, nothing buried, nothing hidden — or does the single assembly quietly force a second system back in (a retaining wall, a service chase, a post under the roof) the moment the house meets the hill?",
    "rooms": 3,
    "roomsNote": "Phase 1 (one floor, 672 sf): 1 bedroom, 1 bath, kitchen, and a living room open 20 ft to the roof. Mature (1,344 sf): 3 bedrooms, 2 baths, study — 448 sf per bedroom. Every bedroom is 12 x 10 or larger with a solid wall opposite its window for the bed.",
    "volumes": [
      {
        "id": "loop-s",
        "kind": "cond",
        "x0": 0,
        "y0": 2,
        "w": 28,
        "d": 14,
        "storeys": 2,
        "ffe": 10,
        "wet": false,
        "note": "the downhill band, both floors. Phase 1: living (double height) + bedroom 1. Mature upper: bedrooms 2 and 3, 14 x 14 each. The whole 28 ft face is glass to -Y; 24 ft is one panel span, so nothing in here is structural."
      },
      {
        "id": "loop-nw",
        "kind": "cond",
        "x0": 0,
        "y0": 16,
        "w": 12,
        "d": 10,
        "storeys": 2,
        "ffe": 10,
        "wet": false,
        "note": "kitchen below, study above. Its counters run on the west face of the stack — appliances on the block, cabinets off it."
      },
      {
        "id": "stack",
        "kind": "cond",
        "x0": 12,
        "y0": 16,
        "w": 8,
        "d": 10,
        "storeys": 2,
        "ffe": 10,
        "wet": true,
        "note": "the only wet block in the house: bath + laundry + mechanical below, second bath above, one stack, one vent. Interior on all four sides — no fixture ever touches the assembly."
      },
      {
        "id": "loop-ne",
        "kind": "cond",
        "x0": 20,
        "y0": 16,
        "w": 8,
        "d": 10,
        "storeys": 2,
        "ffe": 10,
        "wet": false,
        "note": "entry, mudroom, stair, and the stair landing above. The front door is in the east rake wall — the one elevation the roof never sheds snow onto."
      },
      {
        "id": "veranda",
        "kind": "shelt",
        "x0": 0,
        "y0": -6,
        "w": 28,
        "d": 8,
        "storeys": 1,
        "ffe": 10,
        "wet": false,
        "note": "the roof cantilevers 8 ft past the downhill wall with NO posts — a post would be a second structural system. Deck is the same panel on the same piers; snow leaves the eave beyond its outer edge and lands on falling ground."
      },
      {
        "id": "undercroft",
        "kind": "shelt",
        "x0": 0,
        "y0": 2,
        "w": 28,
        "d": 10,
        "storeys": 1,
        "ffe": 1,
        "wet": false,
        "note": "deliberately beneath loop-s, overlapping it in plan: gravel floor, 9 ft to 6 ft of headroom, dry store for wood, batteries, skis. It can NEVER be conditioned — the assembly is not allowed to touch earth. That is the honest cost of the operation."
      },
      {
        "id": "landing",
        "kind": "shelt",
        "x0": 28,
        "y0": 14,
        "w": 6,
        "d": 12,
        "storeys": 1,
        "ffe": 10,
        "wet": false,
        "note": "arrival from the north-east motor court. Natural grade at its outer north corner is 10.02 ft, exactly the floor level — you step off the hill onto the floor, under an 8 ft overhang."
      }
    ],
    "roofs": [
      {
        "id": "R1",
        "x0": -6,
        "y0": -6,
        "w": 42,
        "d": 36,
        "pitch": 2,
        "zLow": 28
      }
    ],
    "ground": {
      "kind": "piers",
      "pts": [
        [
          1,
          3
        ],
        [
          14,
          3
        ],
        [
          27,
          3
        ],
        [
          1,
          14
        ],
        [
          14,
          14
        ],
        [
          27,
          14
        ],
        [
          1,
          25
        ],
        [
          14,
          25
        ],
        [
          27,
          25
        ],
        [
          1,
          -5
        ],
        [
          14,
          -5
        ],
        [
          27,
          -5
        ],
        [
          31,
          16
        ],
        [
          31,
          25
        ]
      ],
      "diaFt": 2.5
    },
    "wetWallFt": 36,
    "wetNote": "The assembly has no cavity, so no pipe may enter an exterior wall — that is not a preference, it is what a vapour-open solid section forbids. Every fixture on both floors rings one interior 8 x 10 block: 36 lf of wet wall total, one stack, one vent, and that vent is the only penetration in the roof plane.",
    "growthTouchesRoof": false,
    "growthNote": "The wall IS the structure, so it cannot be built in halves — the loop and the roof go up once, at full 20 ft height, on all 14 piers. Phase 1 is a complete one-floor house living inside a two-storey volume, its living room open to the underside of the roof. Phase 2 drops the second floor plate — the same panel — onto ledgers already cut into the wall: +672 sf, +100%, with no new foundation, no new wall, no new roof, and nothing built in phase 1 demolished. Growth here is trading volume for rooms, not adding footprint; the enclosure never changes.",
    "phases": [
      {
        "n": 1,
        "label": "The loop, the roof, 14 piers, and the ground floor — 1 bed, 1 bath, double-height living",
        "condSf": 672
      },
      {
        "n": 2,
        "label": "The upper floor plate dropped into the volume already enclosed — 3 bed, 2 bath",
        "condSf": 1344
      }
    ],
    "rationale": "A section that is structure, insulation, air barrier, finish and mass at once is expensive per square foot of ENCLOSURE and cheap per system, so the geometry has exactly one job: buy the most floor with the least enclosure, then never interrupt it. Hence one closed 28 x 24 rectangle, two storeys — 104 lf of wall and a single 42 x 36 roof plane, 2.67 sf of panel per sf of floor where the same 1,344 sf laid out as a single-storey bar costs 3.01, and 0.077 lf of perimeter per sf against the Front Porch best of 0.126; every foot of it is the identical section, 52 panels of 2 ft, with no notch, bay or return anywhere to detail twice. The 24 ft depth is one panel span, so there is no bearing partition inside the loop and no post under the roof — which is what lets the second floor plate arrive later, and what keeps the interior re-plannable forever. The assembly may not be buried and may not be stuffed, so two things follow geometrically: the floor sits at 10.0 ft, six inches above the highest natural grade under the building (9.54 ft at the north-east corner), on 14 piers that move 15 CY against the hundreds a bench would cost on this 30% slope; and all plumbing collapses into one interior 8 x 10 block, 36 lf. The roof falls only to -Y, so snow leaves the building on the downhill side where nothing is, while the door sits on the east rake, level with the motor court, and the 8 ft cantilever over the veranda shades the summer sun at 56 degrees and lets the winter sun into both floors.",
    "selfCheckSf": 1344
  },
  {
    "id": "S10-SQUARE",
    "name": "THE SQUARE",
    "tag": "the least wall a family can live behind",
    "operation": "Make the plan a square and stack it twice: a square encloses more floor per foot of exterior wall than any other rectangle, and the second storey buys the second half of the house without a second roof, a second foundation, or one more foot of perimeter. Then spend the whole saving where it is visible — on the porch.",
    "doNotCopy": "Joanne's 529 sf and her single storey — at 3,400 ft, for a family, that number is a cabin, not a house — and the Alabama porch detailing, the gable, the crawlspace that assumes flat ground. Borrow only her arithmetic: 529 sf out of 104 lf, got by refusing the corridor and refusing the long thin plan. And do not read this as the Tower's argument. The Tower stacks to shrink its FOUNDATION and has to lift its roof to grow; this stacks to shrink its PERIMETER — the bill that arrives every month for fifty years — and it grows underneath itself.",
    "henryTest": "The current design spends 226 lf of exterior wall. This spends 104 — Joanne's House's exact perimeter — and puts three bedrooms, two baths and a 26 ft room behind it. So the question is not whether Henry can be smaller. It is what the other 122 lf of wall were buying, and whether anyone on the project can name it.",
    "rooms": 3,
    "roomsNote": "3 bedrooms, 2 baths — Sylvia 3/2's programme, twelve square feet under her area. LOWER (ffe 11.0, 676 sf) is the arrival and living floor: the front door is in the uphill wall at x=48, where natural grade is 11.14 and the floor is 11.0, so you come from the north-east motor court, walk 20 ft under the roof overhang and step in level. Downhill band 26 x 14 = 364 sf is one great room — living, dining, 26 ft of glass on the -Y face, wood stove and flue on the back wall. Uphill band 26 x 12 is the service band: bath 1 + laundry + water plant 6 x 12, kitchen 9 x 12 open south to the great room, a straight stair 4 x 12, boot room 7 x 12 at the door. UPPER (ffe 21.0, 676 sf): primary 14 x 14 and bedroom 2 12 x 14 across the downhill band, both with the view, both with a solid interior wall on the uphill side for a bed; bedroom 3 9 x 12 and bath 2 6 x 12 in the uphill band, either side of the stair head; bath 2 sits directly over bath 1. The only circulation on either floor is the 42 sf landing at the top of the stair — a square plan has no corridor to cut, which is the second half of the operation.",
    "volumes": [
      {
        "id": "square",
        "kind": "cond",
        "x0": 26,
        "y0": 0,
        "w": 26,
        "d": 26,
        "storeys": 2,
        "ffe": 11,
        "wet": true,
        "note": "26 x 26, aspect ratio 1.000, two floors, 1,352 sf behind 104 lf. Living and arrival at ffe 11.0, sleeping at ffe 21.0. No point in the plan is more than 13 ft from a window, which is the daylight limit that sets the 26 ft dimension — Joanne's House is 26 ft deep for the same reason. Set at 11.0 against a natural grade that runs 1.58 at the south-west corner to 11.46 at the north-east: the house stands clear of the hill everywhere except a six-inch trim at that one corner, inside the drained gravel margin."
      },
      {
        "id": "under",
        "kind": "future",
        "x0": 26,
        "y0": 0,
        "w": 26,
        "d": 12,
        "ffe": 2.5,
        "note": "DELIBERATELY INSIDE the square's footprint — the level under its own floor, not a bay beside it, so growth costs zero perimeter and the plan stays square. Grade falls 9.88 ft corner to corner under a 26 ft square here, so the downhill 12 ft of the underside is already a full storey clear: floor 2.5, underside of the floor above 9.8, 7.3 ft clear. Sheltered store now (wood, gear, generator, tanks); two rooms and a walkout later. Stem wall and pier caps poured in phase 1."
      },
      {
        "id": "porch-lo",
        "kind": "shelt",
        "x0": 26,
        "y0": -13,
        "w": 26,
        "d": 13,
        "ffe": 11,
        "note": "The living porch: 26 x 13 = 338 sf off the great room, 66% larger than Joanne's 204 on 2.6 times the house. Roofed by the upper deck 10 ft above it, which is built as a membraned, insulated roof deck from day one."
      },
      {
        "id": "porch-up",
        "kind": "shelt",
        "x0": 26,
        "y0": -13,
        "w": 26,
        "d": 13,
        "ffe": 21,
        "note": "DELIBERATELY DIRECTLY ABOVE porch-lo — the sleeping porch, at the bedroom floor, under the roof plane with 7.5 ft of headroom at the drip line and 10 ft at the wall. The two decks together are 676 sf: exactly one floor plate of the house, outdoors."
      },
      {
        "id": "landing",
        "kind": "shelt",
        "x0": 40,
        "y0": 26,
        "w": 12,
        "d": 4,
        "ffe": 11,
        "note": "The covered entry landing, bridging the 4 ft drained gravel margin along the uphill wall. Under the roof's 4 ft north overhang, on the HIGH edge of the plane, so nothing is ever shed onto the only door."
      }
    ],
    "roofs": [
      {
        "id": "R1",
        "x0": 24,
        "y0": -15,
        "w": 30,
        "d": 45,
        "pitch": 2,
        "zLow": 26,
        "note": "ONE plane, 30 x 45 = 1,350 sf: 1.00 sf of roof per sf of floor, because stacking halved the thing the roof has to cover. No valley, no dormer, no junction, nothing to flash. Falls -Y only, so not one drop is delivered to the uphill cut; the whole catchment leaves at a single eave 15 ft downhill of the wall and 30 ft above the ground, to a stone drip trench. 2 ft rake overhangs east and west, 4 ft over the entry on the high side, 15 ft over the porches on the low side. Snow is RETAINED, not shed: occupied deck below."
      }
    ],
    "ground": {
      "kind": "piers",
      "diaFt": 2.5,
      "pts": [
        [
          26,
          -13
        ],
        [
          35,
          -13
        ],
        [
          43,
          -13
        ],
        [
          52,
          -13
        ],
        [
          26,
          0
        ],
        [
          35,
          0
        ],
        [
          43,
          0
        ],
        [
          52,
          0
        ],
        [
          26,
          13
        ],
        [
          35,
          13
        ],
        [
          43,
          13
        ],
        [
          52,
          13
        ],
        [
          26,
          26
        ],
        [
          35,
          26
        ],
        [
          43,
          26
        ],
        [
          52,
          26
        ]
      ]
    },
    "wetWallFt": 16,
    "wetNote": "One 12 ft wall on the x=32 line, running from the uphill wall to the middle of the plan, on both floors, one stack. Kitchen sink, dishwasher and range on its east face; bath 1, laundry, water heater and pressure tank on its west face; bath 2 directly above bath 1. 16 lf counted with the kitchen's 4 ft return along the uphill wall. One 3 in stack, one vent through the roof plane, one line to drain down when the house is shut for the winter — and because the plan is square, no fixture in the house is more than 20 ft from it. The square does not concentrate plumbing as a virtue; it concentrates it because there is nowhere far away to put it.",
    "growthTouchesRoof": false,
    "growthNote": "Growth happens underneath, not beside — the only direction that leaves the square square. Phase 2 is the level under the floor: the hill falls 9.88 ft corner to corner under a 26 ft square, so the downhill 12 ft of the underside is already a full storey clear of grade. Its stem wall and pier caps are poured with the phase 1 foundation; phase 2 is a framed floor on piers that are already there, a downhill wall of glass, and a door out at the south-west where the ground is lowest. 312 sf, +23%, inside the existing footprint, so the perimeter never moves, the envelope is never cut and the roof is never touched. Phase 3, if it is ever wanted, encloses the lower porch under the upper deck — which is detailed as a membraned, insulated roof deck on day one for precisely that reason: +312 more, +46% in total. It is listed because it is real, and it is the scheme's weakness stated plainly: the third phase is paid for out of the porch, and the porch is the argument.",
    "phases": [
      {
        "n": 1,
        "label": "The square complete — 3 bed, 2 bath, both porches, 16 piers",
        "condSf": 1352
      },
      {
        "n": 2,
        "label": "The level under its own floor, walking out downhill",
        "condSf": 1664
      },
      {
        "n": 3,
        "label": "The lower porch enclosed under the deck that is already its roof",
        "condSf": 1976
      }
    ],
    "rationale": "26 x 26, aspect ratio 1.000 — the squarest plan that still daylights, since no point in it is more than 13 ft from glass. A square encloses more floor per foot of exterior wall than any other rectangle, and stacking it means the second 676 sf arrives with no second roof, no second foundation and not one extra foot of perimeter: 1,352 sf, Sylvia 3/2's three bedrooms and two baths, behind 104 lf of wall — which is Joanne's House's exact perimeter for 529 sf. That is 0.077 lf per sf against the 0.126 the product line's best can publish, 68 fewer feet of exterior wall than Sylvia 3/2 for the same programme, and 3,432 sf of thermal envelope against her 4,448 — 23% less skin to insulate, air-seal, clad and heat, forever, which is the only cost line that keeps arriving after the cheque clears. The saving is spent where it can be seen: 676 sf of porch stacked on the downhill face, 0.54 sf of roofed outdoor room per sf conditioned and 0.77 counting the dry territory under the floor, against Joanne's 0.386. The hill does the rest — grade falls 9.88 ft corner to corner across a 26 ft square here (30% across, 8% along), one storey almost exactly, so the floor is set at 11.0, the building stands clear of natural ground everywhere but a six-inch trim at the north-east corner, and it meets the site at 16 pier caps and 17 CY, against 98 for the smallest bench that would hold this plan and 282 for the same floor area laid out on one storey. What it costs, stated rather than hidden: four 30 ft columns at the drip line (braced at 11.0 and 21.0 by the two decks, so they are three 10 ft segments, not a 30 ft cantilever); a two-storey square reads as a solid object on the hill rather than a low bar along it; and it cannot grow without ceasing to be square, which is why its growth goes underneath and stops at +46%.",
    "selfCheckSf": 1352
  }
];

export default PROPOSED;
