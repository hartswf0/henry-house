// HENRY HOUSE — SCHEME PROPOSALS, GENERATED.
//
// Written by tools/collect-schemes.mjs from a workflow run. DO NOT HAND-EDIT:
// re-run the collector instead. Every entry here is loaded by model/schemes.mjs
// through the same V/R/ground vocabulary as the hand-written schemes, so it is
// measured by the same metrics, priced by the same rates, judged by the same
// critics and drawn by the same code. A proposal cannot argue its way in — it
// is validated on the way through this file and dropped if it does not hold up.
//
// 2 proposals collected.

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
        "x0": 13,
        "y0": 2,
        "w": 40,
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
  }
];

export default PROPOSED;
