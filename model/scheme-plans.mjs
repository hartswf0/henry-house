// HENRY HOUSE — SCHEME PLANS, GENERATED AND CHECKED.
//
// Written by tools/build-plans.mjs from plans/*.json. DO NOT HAND-EDIT.
// Every plan here passed the checks in that file: rooms inside their scheme's
// own floors, no overlaps, the floor accounted for, bedrooms with an exterior
// wall and a bed wall, wet rooms grouped or stacked, stairs landing on the
// stair below. A plan that failed was reported and dropped, not repaired.
//
// 6 plans.

export const PLANS = [
  {
    "id": "S0-SPINE",
    "levels": [
      {
        "ffe": 0,
        "name": "LOWER",
        "rooms": [
          {
            "name": "BED 3",
            "use": "bed",
            "x0": 0,
            "y0": 0,
            "w": 13,
            "d": 14
          },
          {
            "name": "BED 4",
            "use": "bed",
            "x0": 13,
            "y0": 0,
            "w": 13,
            "d": 14
          },
          {
            "name": "REC / GEAR ROOM",
            "use": "living",
            "x0": 26,
            "y0": 0,
            "w": 10,
            "d": 14
          },
          {
            "name": "SPINE HALL L",
            "use": "circ",
            "x0": 0,
            "y0": 14,
            "w": 26,
            "d": 5
          },
          {
            "name": "STAIR HALL A",
            "use": "circ",
            "x0": 26,
            "y0": 14,
            "w": 10,
            "d": 12
          },
          {
            "name": "MECH",
            "use": "mech",
            "x0": 0,
            "y0": 19,
            "w": 8,
            "d": 7
          },
          {
            "name": "BATH 3",
            "use": "bath",
            "x0": 8,
            "y0": 19,
            "w": 8,
            "d": 7
          },
          {
            "name": "STORE",
            "use": "store",
            "x0": 16,
            "y0": 19,
            "w": 10,
            "d": 7
          }
        ],
        "doors": [
          {
            "x": 31,
            "y": 0,
            "face": "S",
            "kind": "terrace",
            "ffe": 0
          },
          {
            "x": 6,
            "y": 0,
            "face": "S",
            "kind": "egress",
            "ffe": 0
          }
        ]
      },
      {
        "ffe": 10,
        "name": "MAIN",
        "rooms": [
          {
            "name": "BED 1 PRIMARY",
            "use": "bed",
            "x0": 0,
            "y0": 0,
            "w": 20,
            "d": 14
          },
          {
            "name": "OFFICE",
            "use": "work",
            "x0": 20,
            "y0": 0,
            "w": 16,
            "d": 14
          },
          {
            "name": "SPINE HALL W",
            "use": "circ",
            "x0": 0,
            "y0": 14,
            "w": 26,
            "d": 5
          },
          {
            "name": "STAIR HALL A",
            "use": "circ",
            "x0": 26,
            "y0": 14,
            "w": 10,
            "d": 12
          },
          {
            "name": "PRIMARY W.I.C.",
            "use": "store",
            "x0": 0,
            "y0": 19,
            "w": 8,
            "d": 7
          },
          {
            "name": "BATH 1",
            "use": "bath",
            "x0": 8,
            "y0": 19,
            "w": 12,
            "d": 7
          },
          {
            "name": "LINEN",
            "use": "store",
            "x0": 20,
            "y0": 19,
            "w": 6,
            "d": 7
          },
          {
            "name": "LIVING",
            "use": "living",
            "x0": 36,
            "y0": 0,
            "w": 18,
            "d": 14
          },
          {
            "name": "DINING",
            "use": "dining",
            "x0": 54,
            "y0": 0,
            "w": 18,
            "d": 14
          },
          {
            "name": "SPINE HALL E",
            "use": "circ",
            "x0": 36,
            "y0": 14,
            "w": 26,
            "d": 5
          },
          {
            "name": "PANTRY / SCULLERY",
            "use": "store",
            "x0": 36,
            "y0": 19,
            "w": 12,
            "d": 7
          },
          {
            "name": "KITCHEN",
            "use": "kitchen",
            "x0": 48,
            "y0": 19,
            "w": 14,
            "d": 7
          },
          {
            "name": "STAIR HALL B",
            "use": "circ",
            "x0": 62,
            "y0": 14,
            "w": 10,
            "d": 12
          },
          {
            "name": "ENTRY / MUD",
            "use": "entry",
            "x0": 72,
            "y0": 5,
            "w": 15,
            "d": 9
          },
          {
            "name": "LINK HALL",
            "use": "circ",
            "x0": 72,
            "y0": 14,
            "w": 15,
            "d": 5
          },
          {
            "name": "POWDER",
            "use": "bath",
            "x0": 72,
            "y0": 19,
            "w": 7,
            "d": 7
          },
          {
            "name": "LAUNDRY",
            "use": "laundry",
            "x0": 79,
            "y0": 19,
            "w": 8,
            "d": 7
          }
        ],
        "doors": [
          {
            "x": 87,
            "y": 9.5,
            "face": "E",
            "kind": "entry",
            "ffe": 10
          },
          {
            "x": 30,
            "y": 0,
            "face": "S",
            "kind": "deck",
            "ffe": 10
          },
          {
            "x": 45,
            "y": 0,
            "face": "S",
            "kind": "deck",
            "ffe": 10
          },
          {
            "x": 63,
            "y": 0,
            "face": "S",
            "kind": "deck",
            "ffe": 10
          },
          {
            "x": 79,
            "y": 26,
            "face": "N",
            "kind": "service",
            "ffe": 10
          }
        ]
      },
      {
        "ffe": 20,
        "name": "UPPER",
        "rooms": [
          {
            "name": "BED 2",
            "use": "bed",
            "x0": 48,
            "y0": 0,
            "w": 14,
            "d": 14
          },
          {
            "name": "LOFT",
            "use": "living",
            "x0": 62,
            "y0": 0,
            "w": 10,
            "d": 14
          },
          {
            "name": "UPPER HALL",
            "use": "circ",
            "x0": 48,
            "y0": 14,
            "w": 14,
            "d": 5
          },
          {
            "name": "STAIR HALL B",
            "use": "circ",
            "x0": 62,
            "y0": 14,
            "w": 10,
            "d": 12
          },
          {
            "name": "STORE",
            "use": "store",
            "x0": 48,
            "y0": 19,
            "w": 6,
            "d": 7
          },
          {
            "name": "BATH 2",
            "use": "bath",
            "x0": 54,
            "y0": 19,
            "w": 8,
            "d": 7
          }
        ],
        "doors": []
      }
    ],
    "doors": [
      {
        "x": 87,
        "y": 9.5,
        "face": "E",
        "kind": "entry",
        "ffe": 10
      },
      {
        "x": 30,
        "y": 0,
        "face": "S",
        "kind": "deck",
        "ffe": 10
      },
      {
        "x": 45,
        "y": 0,
        "face": "S",
        "kind": "deck",
        "ffe": 10
      },
      {
        "x": 63,
        "y": 0,
        "face": "S",
        "kind": "deck",
        "ffe": 10
      },
      {
        "x": 79,
        "y": 26,
        "face": "N",
        "kind": "service",
        "ffe": 10
      },
      {
        "x": 31,
        "y": 0,
        "face": "S",
        "kind": "terrace",
        "ffe": 0
      },
      {
        "x": 6,
        "y": 0,
        "face": "S",
        "kind": "egress",
        "ffe": 0
      }
    ],
    "notes": "The massing read as three stacked bars; the plan shows they are really one corridor. A 5 ft spine hall sits at y=14-19 and runs the whole 87 ft from the west gable at x=0 to the breezeway door at x=87, broken only by the two stair halls, which are pass-through landings rather than rooms you enter, and which stack exactly (A at x26-36, B at x62-72). That fixes the freeze rule in plan rather than in principle: the wet wall is the y=19 partition, an interior wall, and every wet room - mech and bath 3 below, primary bath, kitchen, powder and laundry on the main, bath 2 above - sits in the 7 ft band uphill of it with fixtures hung on that partition, so the buried y=26 wall carries no pipe. Bath 1 lands over bath 3 at x8-16, and bath 2 lands over the kitchen at x54-62, giving two clean vertical stacks. Everything that wants light - all four bedrooms, living, dining, office, loft, rec - is on the y=0 downhill face, with the lower level's dead uphill band given to mech and storage because it is buried roughly 8 ft. Worst compromise: with a single through-route there is no back way around the kitchen. The walk from the garage to the primary suite is the full 87 ft, and for 14 ft of it the cook's aisle and the house's only corridor are the same 5 ft of floor in front of a kitchen that is only 7 ft deep - the price of putting every fixture on one interior wall.",
    "flags": [
      "FREEZE RULE — \"MECH\" (LOWER @ffe 0) hangs its fixtures on the uphill EXTERIOR wall. No plumbing may run there at this elevation.",
      "FREEZE RULE — \"BATH 3\" (LOWER @ffe 0) hangs its fixtures on the uphill EXTERIOR wall. No plumbing may run there at this elevation.",
      "NO WALL THICKNESS — rooms on LOWER @ffe 0 sum to 100.0% of the floor plate, so every dimension shown is an ideal clear dimension with nothing left for walls, risers or chases.",
      "FREEZE RULE — \"BATH 1\" (MAIN @ffe 10) hangs its fixtures on the uphill EXTERIOR wall. No plumbing may run there at this elevation.",
      "FREEZE RULE — \"KITCHEN\" (MAIN @ffe 10) hangs its fixtures on the uphill EXTERIOR wall. No plumbing may run there at this elevation.",
      "FREEZE RULE — \"POWDER\" (MAIN @ffe 10) hangs its fixtures on the uphill EXTERIOR wall. No plumbing may run there at this elevation.",
      "FREEZE RULE — \"LAUNDRY\" (MAIN @ffe 10) hangs its fixtures on the uphill EXTERIOR wall. No plumbing may run there at this elevation.",
      "KITCHEN DEPTH — 7 ft leaves under 42 in of working aisle once cabinets land on both faces.",
      "NOT EN-SUITE — \"PRIMARY W.I.C.\" shares no edge with \"BED 1 PRIMARY\", so it can only be entered from circulation.",
      "NO WALL THICKNESS — rooms on MAIN @ffe 10 sum to 100.0% of the floor plate, so every dimension shown is an ideal clear dimension with nothing left for walls, risers or chases.",
      "FREEZE RULE — \"BATH 2\" (UPPER @ffe 20) hangs its fixtures on the uphill EXTERIOR wall. No plumbing may run there at this elevation.",
      "NO WALL THICKNESS — rooms on UPPER @ffe 20 sum to 100.0% of the floor plate, so every dimension shown is an ideal clear dimension with nothing left for walls, risers or chases."
    ]
  },
  {
    "id": "S1-ARMATURE",
    "levels": [
      {
        "ffe": 4,
        "name": "MAIN",
        "rooms": [
          {
            "name": "BED 2 WEST",
            "use": "bed",
            "x0": 0,
            "y0": 2,
            "w": 14,
            "d": 10,
            "phase": 2
          },
          {
            "name": "WOOD + GEAR STORE",
            "use": "store",
            "x0": 0,
            "y0": 12,
            "w": 10,
            "d": 8,
            "phase": 2
          },
          {
            "name": "ANTE 1",
            "use": "circ",
            "x0": 10,
            "y0": 12,
            "w": 4,
            "d": 8,
            "phase": 2
          },
          {
            "name": "GALLERY 1",
            "use": "circ",
            "x0": 0,
            "y0": 20,
            "w": 14,
            "d": 4,
            "phase": 2
          },
          {
            "name": "BED 1 PRIMARY",
            "use": "bed",
            "x0": 14,
            "y0": 2,
            "w": 14,
            "d": 10,
            "phase": 1
          },
          {
            "name": "LIVING",
            "use": "living",
            "x0": 14,
            "y0": 12,
            "w": 14,
            "d": 8,
            "phase": 1
          },
          {
            "name": "GALLERY 2",
            "use": "circ",
            "x0": 14,
            "y0": 20,
            "w": 14,
            "d": 4,
            "phase": 1
          },
          {
            "name": "DINING",
            "use": "dining",
            "x0": 28,
            "y0": 2,
            "w": 7,
            "d": 9,
            "phase": 1
          },
          {
            "name": "KITCHEN",
            "use": "kitchen",
            "x0": 28,
            "y0": 11,
            "w": 7,
            "d": 7,
            "phase": 1
          },
          {
            "name": "ENTRY AIRLOCK",
            "use": "entry",
            "x0": 28,
            "y0": 18,
            "w": 7,
            "d": 6,
            "phase": 1
          },
          {
            "name": "BATH 2",
            "use": "bath",
            "x0": 35,
            "y0": 2,
            "w": 7,
            "d": 7,
            "phase": 2
          },
          {
            "name": "UTILITY",
            "use": "mech",
            "x0": 35,
            "y0": 9,
            "w": 7,
            "d": 6,
            "phase": 1
          },
          {
            "name": "BATH 1",
            "use": "bath",
            "x0": 35,
            "y0": 15,
            "w": 7,
            "d": 5,
            "phase": 1
          },
          {
            "name": "GALLERY 3",
            "use": "circ",
            "x0": 35,
            "y0": 20,
            "w": 7,
            "d": 4,
            "phase": 1
          },
          {
            "name": "BED 3",
            "use": "bed",
            "x0": 42,
            "y0": 2,
            "w": 14,
            "d": 10,
            "phase": 2
          },
          {
            "name": "ANTE 4",
            "use": "circ",
            "x0": 42,
            "y0": 12,
            "w": 4,
            "d": 8,
            "phase": 2
          },
          {
            "name": "STUDY",
            "use": "work",
            "x0": 46,
            "y0": 12,
            "w": 10,
            "d": 8,
            "phase": 2
          },
          {
            "name": "GALLERY 4",
            "use": "circ",
            "x0": 42,
            "y0": 20,
            "w": 14,
            "d": 4,
            "phase": 2
          },
          {
            "name": "BED 4 EAST",
            "use": "bed",
            "x0": 56,
            "y0": 2,
            "w": 14,
            "d": 10,
            "phase": 3
          },
          {
            "name": "ANTE 5",
            "use": "circ",
            "x0": 56,
            "y0": 12,
            "w": 4,
            "d": 8,
            "phase": 3
          },
          {
            "name": "STUDIO",
            "use": "work",
            "x0": 60,
            "y0": 12,
            "w": 10,
            "d": 8,
            "phase": 3
          },
          {
            "name": "GALLERY 5",
            "use": "circ",
            "x0": 56,
            "y0": 20,
            "w": 14,
            "d": 4,
            "phase": 3
          }
        ],
        "doors": [
          {
            "x": 31.5,
            "y": 24,
            "face": "N",
            "kind": "entry",
            "ffe": 4
          },
          {
            "x": 31.5,
            "y": 2,
            "face": "S",
            "kind": "porch",
            "ffe": 4
          },
          {
            "x": 21,
            "y": 2,
            "face": "S",
            "kind": "porch",
            "ffe": 4
          },
          {
            "x": 7,
            "y": 2,
            "face": "S",
            "kind": "porch",
            "ffe": 4
          },
          {
            "x": 49,
            "y": 2,
            "face": "S",
            "kind": "porch",
            "ffe": 4
          },
          {
            "x": 63,
            "y": 2,
            "face": "S",
            "kind": "porch",
            "ffe": 4
          },
          {
            "x": 0,
            "y": 22,
            "face": "W",
            "kind": "exit",
            "ffe": 4
          },
          {
            "x": 70,
            "y": 22,
            "face": "E",
            "kind": "exit",
            "ffe": 4
          }
        ]
      }
    ],
    "doors": [
      {
        "x": 31.5,
        "y": 24,
        "face": "N",
        "kind": "entry",
        "ffe": 4
      },
      {
        "x": 31.5,
        "y": 2,
        "face": "S",
        "kind": "porch",
        "ffe": 4
      },
      {
        "x": 21,
        "y": 2,
        "face": "S",
        "kind": "porch",
        "ffe": 4
      },
      {
        "x": 7,
        "y": 2,
        "face": "S",
        "kind": "porch",
        "ffe": 4
      },
      {
        "x": 49,
        "y": 2,
        "face": "S",
        "kind": "porch",
        "ffe": 4
      },
      {
        "x": 63,
        "y": 2,
        "face": "S",
        "kind": "porch",
        "ffe": 4
      },
      {
        "x": 0,
        "y": 22,
        "face": "W",
        "kind": "exit",
        "ffe": 4
      },
      {
        "x": 70,
        "y": 22,
        "face": "E",
        "kind": "exit",
        "ffe": 4
      }
    ],
    "notes": "The massing showed five bays and one roof; only the plan shows the two lines that make the phasing real. First, the GALLERY: a 4 ft spine pinned to the cold uphill wall, running the full 70 ft, drawn and paid for at 252 sf plus three 32 sf antes. It is why bays 1, 4 and 5 become rooms without cutting the roof or the wet wall - each future bay is the identical tile (bed 14x10 on the downhill glass, a 10x8 dry room behind it, 4 ft of gallery at the cut face), and the only site work in phase 2 or 3 is infill between existing posts. Second, the ARTERY: one wall at x=35 running y2 to y24, 22 ft, inboard on both faces in every phase, so the two temporary phase-1 exterior walls at x=14 and x=42 carry no pipe. Every fixture in the mature house hangs on it - kitchen and utility on the west and east at mid-run, BATH 1 above, BATH 2 below - and the future bays are entirely DRY: phase 2 and phase 3 add four rooms and not one foot of new plumbing. BATH 2's drain, vent and supply are stubbed and capped in phase 1 while the wall is open; phase 2 sets fixtures only. The wall is opened once, ever. Worst compromise: the phase-1 LIVING room is landlocked. Bay 2 is 14 ft wide and 22 ft deep, the bedroom must have the downhill glass and 10 ft of depth, and the gallery takes 4 - which leaves the living room a 14x8 interior box with no exterior wall, lit by a rooflight in the one roof and by borrowed light through the 6 ft opening to the kitchen. I accepted that because at 3,400 ft the real living room is the 70 ft porch on the downhill side, and because the alternative was a bedroom with no egress. The second-worst: bays 1 and 5 walk the gallery to BATH 1, up to 30 ft. That walk is the price of a single artery, and I would rather walk it than pipe it.",
    "flags": [
      "NO DAYLIGHT — the kitchen (MAIN @ffe 4) touches no exterior wall.",
      "KITCHEN DEPTH — 7 ft leaves under 42 in of working aisle once cabinets land on both faces.",
      "NO WALL THICKNESS — rooms on MAIN @ffe 4 sum to 100.0% of the floor plate, so every dimension shown is an ideal clear dimension with nothing left for walls, risers or chases.",
      "THROUGH A PRIVATE ROOM — ANTE 4 (MAIN @ffe 4) can only be reached by walking through the bathroom \"BATH 1\"",
      "THROUGH A PRIVATE ROOM — DINING (MAIN @ffe 4) can only be reached by walking through the bedroom \"BED 1 PRIMARY\""
    ]
  },
  {
    "id": "S2-BRIDGE",
    "levels": [
      {
        "ffe": 13,
        "name": "BRIDGE",
        "rooms": [
          {
            "name": "GREAT ROOM",
            "use": "living",
            "x0": 0,
            "y0": 2,
            "w": 16,
            "d": 12,
            "phase": 1
          },
          {
            "name": "ENTRY / BOOT ROOM",
            "use": "entry",
            "x0": 0,
            "y0": 14,
            "w": 8,
            "d": 8,
            "phase": 1
          },
          {
            "name": "STAIR HALL",
            "use": "circ",
            "x0": 8,
            "y0": 14,
            "w": 8,
            "d": 8,
            "phase": 1
          },
          {
            "name": "KITCHEN",
            "use": "kitchen",
            "x0": 16,
            "y0": 2,
            "w": 7,
            "d": 10,
            "phase": 1
          },
          {
            "name": "LAUNDRY",
            "use": "laundry",
            "x0": 16,
            "y0": 12,
            "w": 7,
            "d": 5,
            "phase": 1
          },
          {
            "name": "BATH 2 ENSUITE",
            "use": "bath",
            "x0": 23,
            "y0": 2,
            "w": 7,
            "d": 7,
            "phase": 1
          },
          {
            "name": "BATH 1 HALL",
            "use": "bath",
            "x0": 23,
            "y0": 9,
            "w": 7,
            "d": 8,
            "phase": 1
          },
          {
            "name": "SPINE",
            "use": "circ",
            "x0": 16,
            "y0": 17,
            "w": 44,
            "d": 5,
            "phase": 1
          },
          {
            "name": "BED 1 PRIMARY",
            "use": "bed",
            "x0": 30,
            "y0": 2,
            "w": 10,
            "d": 15,
            "phase": 1
          },
          {
            "name": "BED 2",
            "use": "bed",
            "x0": 40,
            "y0": 2,
            "w": 10,
            "d": 15,
            "phase": 1
          },
          {
            "name": "BED 3",
            "use": "bed",
            "x0": 50,
            "y0": 2,
            "w": 10,
            "d": 15,
            "phase": 1
          }
        ],
        "doors": [
          {
            "x": 4,
            "y": 22,
            "face": "N",
            "kind": "entry",
            "ffe": 13
          },
          {
            "x": 0,
            "y": 8,
            "face": "W",
            "kind": "deck",
            "ffe": 13
          },
          {
            "x": 60,
            "y": 19,
            "face": "E",
            "kind": "deck",
            "ffe": 13
          },
          {
            "x": 60,
            "y": 9,
            "face": "E",
            "kind": "deck",
            "ffe": 13
          }
        ]
      },
      {
        "ffe": 0,
        "name": "UNDERCROFT",
        "rooms": [
          {
            "name": "WORK ROOM",
            "use": "work",
            "x0": 8,
            "y0": 2,
            "w": 15,
            "d": 12,
            "phase": 2
          },
          {
            "name": "DEN",
            "use": "living",
            "x0": 23,
            "y0": 2,
            "w": 9,
            "d": 12,
            "phase": 2
          },
          {
            "name": "STAIR",
            "use": "circ",
            "x0": 8,
            "y0": 14,
            "w": 8,
            "d": 8,
            "phase": 1
          },
          {
            "name": "BATH 3",
            "use": "bath",
            "x0": 16,
            "y0": 14,
            "w": 7,
            "d": 8,
            "phase": 2
          },
          {
            "name": "PLANT ROOM",
            "use": "mech",
            "x0": 23,
            "y0": 14,
            "w": 9,
            "d": 8,
            "phase": 1
          }
        ],
        "doors": [
          {
            "x": 15,
            "y": 2,
            "face": "S",
            "kind": "entry",
            "ffe": 0
          },
          {
            "x": 28,
            "y": 2,
            "face": "S",
            "kind": "entry",
            "ffe": 0
          },
          {
            "x": 8,
            "y": 8,
            "face": "W",
            "kind": "service",
            "ffe": 0
          },
          {
            "x": 32,
            "y": 18,
            "face": "E",
            "kind": "service",
            "ffe": 0
          }
        ]
      }
    ],
    "doors": [
      {
        "x": 4,
        "y": 22,
        "face": "N",
        "kind": "entry",
        "ffe": 13
      },
      {
        "x": 0,
        "y": 8,
        "face": "W",
        "kind": "deck",
        "ffe": 13
      },
      {
        "x": 60,
        "y": 19,
        "face": "E",
        "kind": "deck",
        "ffe": 13
      },
      {
        "x": 60,
        "y": 9,
        "face": "E",
        "kind": "deck",
        "ffe": 13
      },
      {
        "x": 15,
        "y": 2,
        "face": "S",
        "kind": "entry",
        "ffe": 0
      },
      {
        "x": 28,
        "y": 2,
        "face": "S",
        "kind": "entry",
        "ffe": 0
      },
      {
        "x": 8,
        "y": 8,
        "face": "W",
        "kind": "service",
        "ffe": 0
      },
      {
        "x": 32,
        "y": 18,
        "face": "E",
        "kind": "service",
        "ffe": 0
      }
    ],
    "notes": "The massing shows a 60 ft bar; the plan shows the bar has exactly one wet line in it. Every fixture in the house hangs on the single 20 ft wall at x=23 running y2 to y22: kitchen and laundry on its west face, ensuite and hall bath on its east face, 40 ft of fixture wall out of a 20 ft run, and nothing within 7 ft of an exterior wall. The undercroft repeats that wall, so the phase-2 bath and the phase-1 plant room drop straight down it - one stack, one vent, one heated chase. Because the plant lives below the floor, the bridge spends NONE of its 1,200 sf on mechanical, and the phase-1 stair plus stack is what makes the later level genuinely cheap. The plan also shows what the massing hid: the west half has no corridor at all - entry, great room and kitchen are one 23 ft room along the downhill glass, and the stair hall is the pivot that lets you arrive and reach a bedroom without crossing the living room. Worst compromise: the 5 ft spine plus stair hall costs 284 sf, roughly a quarter of the bridge, and it buys the three bedrooms nothing but a door. I put it on the uphill wall so it at least earns its keep as the cold-side buffer, the closet wall, and the route to the east deck - but on a single-loaded 60 x 20 there is no cheaper way to reach the third bedroom, and the alternatives (rooms entered off one another, or a gallery on the view side) were worse.",
    "flags": [
      "KITCHEN DEPTH — 7 ft leaves under 42 in of working aisle once cabinets land on both faces.",
      "NO WALL THICKNESS — rooms on BRIDGE @ffe 13 sum to 100.0% of the floor plate, so every dimension shown is an ideal clear dimension with nothing left for walls, risers or chases.",
      "FREEZE RULE — \"BATH 3\" (UNDERCROFT @ffe 0) hangs its fixtures on the uphill EXTERIOR wall. No plumbing may run there at this elevation.",
      "FREEZE RULE — \"PLANT ROOM\" (UNDERCROFT @ffe 0) hangs its fixtures on the uphill EXTERIOR wall. No plumbing may run there at this elevation.",
      "NO WALL THICKNESS — rooms on UNDERCROFT @ffe 0 sum to 100.0% of the floor plate, so every dimension shown is an ideal clear dimension with nothing left for walls, risers or chases.",
      "ONE WAY DOWN — 3 sleeping rooms more than a storey above the entry (BED 1 PRIMARY at ffe 13, BED 2 at ffe 13, BED 3 at ffe 13) served by a single stair. Second means of escape not drawn."
    ]
  },
  {
    "id": "S3-NARROW",
    "levels": [
      {
        "ffe": 0,
        "name": "WEST LOWER",
        "rooms": [
          {
            "name": "STUDIO / SHOP",
            "use": "work",
            "x0": 0,
            "y0": 2,
            "w": 11,
            "d": 15
          },
          {
            "name": "STAIR",
            "use": "circ",
            "x0": 11,
            "y0": 2,
            "w": 4,
            "d": 15
          },
          {
            "name": "DEN / BUNK ROOM",
            "use": "living",
            "x0": 15,
            "y0": 2,
            "w": 11,
            "d": 15
          },
          {
            "name": "COLD STORE",
            "use": "store",
            "x0": 0,
            "y0": 17,
            "w": 10,
            "d": 7
          },
          {
            "name": "BENCH ALCOVE",
            "use": "work",
            "x0": 10,
            "y0": 17,
            "w": 8,
            "d": 7
          },
          {
            "name": "GEAR / FIREWOOD",
            "use": "store",
            "x0": 18,
            "y0": 17,
            "w": 8,
            "d": 7
          }
        ],
        "doors": [
          {
            "x": 6,
            "y": 2,
            "face": "S",
            "kind": "exterior",
            "ffe": 0
          },
          {
            "x": 20,
            "y": 2,
            "face": "S",
            "kind": "exterior",
            "ffe": 0
          }
        ]
      },
      {
        "ffe": 10,
        "name": "WEST UPPER",
        "rooms": [
          {
            "name": "BED 1 PRIMARY",
            "use": "bed",
            "x0": 0,
            "y0": 2,
            "w": 11,
            "d": 15
          },
          {
            "name": "STAIR HALL",
            "use": "circ",
            "x0": 11,
            "y0": 2,
            "w": 4,
            "d": 15
          },
          {
            "name": "BED 2",
            "use": "bed",
            "x0": 15,
            "y0": 2,
            "w": 11,
            "d": 15
          },
          {
            "name": "CLOSET / LINEN",
            "use": "store",
            "x0": 0,
            "y0": 17,
            "w": 8,
            "d": 7
          },
          {
            "name": "BATH 1",
            "use": "bath",
            "x0": 8,
            "y0": 17,
            "w": 7,
            "d": 7
          },
          {
            "name": "LAUNDRY",
            "use": "laundry",
            "x0": 15,
            "y0": 17,
            "w": 5,
            "d": 7
          },
          {
            "name": "MECH WEST",
            "use": "mech",
            "x0": 20,
            "y0": 17,
            "w": 6,
            "d": 7
          }
        ],
        "doors": [
          {
            "x": 13,
            "y": 2,
            "face": "S",
            "kind": "entry",
            "ffe": 10
          },
          {
            "x": 26,
            "y": 21,
            "face": "E",
            "kind": "service",
            "ffe": 10
          }
        ]
      },
      {
        "ffe": 8,
        "name": "EAST MAIN",
        "rooms": [
          {
            "name": "LIVING",
            "use": "living",
            "x0": 36,
            "y0": 2,
            "w": 14,
            "d": 8
          },
          {
            "name": "DINING",
            "use": "dining",
            "x0": 36,
            "y0": 10,
            "w": 14,
            "d": 7
          },
          {
            "name": "BED 3 GUEST",
            "use": "bed",
            "x0": 50,
            "y0": 2,
            "w": 12,
            "d": 15
          },
          {
            "name": "KITCHEN",
            "use": "kitchen",
            "x0": 36,
            "y0": 17,
            "w": 11,
            "d": 7
          },
          {
            "name": "BATH 2",
            "use": "bath",
            "x0": 47,
            "y0": 17,
            "w": 7,
            "d": 7
          },
          {
            "name": "MECH EAST",
            "use": "mech",
            "x0": 54,
            "y0": 17,
            "w": 4,
            "d": 7
          },
          {
            "name": "CLOSET",
            "use": "store",
            "x0": 58,
            "y0": 17,
            "w": 4,
            "d": 7
          }
        ],
        "doors": [
          {
            "x": 36,
            "y": 6,
            "face": "W",
            "kind": "entry",
            "ffe": 8
          },
          {
            "x": 43,
            "y": 2,
            "face": "S",
            "kind": "exterior",
            "ffe": 8
          },
          {
            "x": 36,
            "y": 21,
            "face": "W",
            "kind": "service",
            "ffe": 8
          },
          {
            "x": 56,
            "y": 24,
            "face": "N",
            "kind": "service",
            "ffe": 8
          },
          {
            "x": 56,
            "y": 2,
            "face": "S",
            "kind": "exterior",
            "ffe": 8
          }
        ]
      }
    ],
    "doors": [
      {
        "x": 36,
        "y": 6,
        "face": "W",
        "kind": "entry",
        "ffe": 8
      },
      {
        "x": 43,
        "y": 2,
        "face": "S",
        "kind": "exterior",
        "ffe": 8
      },
      {
        "x": 36,
        "y": 21,
        "face": "W",
        "kind": "service",
        "ffe": 8
      },
      {
        "x": 56,
        "y": 24,
        "face": "N",
        "kind": "service",
        "ffe": 8
      },
      {
        "x": 56,
        "y": 2,
        "face": "S",
        "kind": "exterior",
        "ffe": 8
      },
      {
        "x": 13,
        "y": 2,
        "face": "S",
        "kind": "entry",
        "ffe": 10
      },
      {
        "x": 26,
        "y": 21,
        "face": "E",
        "kind": "service",
        "ffe": 10
      },
      {
        "x": 6,
        "y": 2,
        "face": "S",
        "kind": "exterior",
        "ffe": 0
      },
      {
        "x": 20,
        "y": 2,
        "face": "S",
        "kind": "exterior",
        "ffe": 0
      }
    ],
    "notes": "The massing showed two boxes and a slot; the plan shows the slot is load-bearing on the argument. The dogtrot meets grade at its uphill end (ground ~el.8 at y=24, so ffe 8 is a flat arrival from the drive) and empties onto the 62 ft porch, so THE PORCH IS THE HALL - every east-body room opens off the porch, the dogtrot, or the room beside it, and the west body is entered from the porch up three risers into its stair hall. The plan also fixes one line the massing could not: a single wet wall at y=17, 26 ft west plus 26 ft east = 52 ft, carrying every fixture on all three levels; kitchen sink and DW sit on the y=17 peninsula, range and fridge take the cold uphill wall at y=24, and the buried lower level is left entirely dry - no pipe anywhere near an exterior or bermed wall. Worst compromise: the dogtrot severs the house into two buildings and no service may cross an open slot, so each body carries its own mechanical room and water heater (MECH WEST x20-26 ffe 10, MECH EAST x54-58 ffe 8) - a duplicated plant in a 1,716 sf house. Second, honestly: the west body's two storeys force a 4x15 stair hall on each of its levels, 120 sf of named and paid-for circulation. No room in the house is reached by a passage, so the no-corridor claim holds, but the stricter 'no circulation' reading of it does not. Third, the 22 ft body makes the east living/dining/kitchen stack front-to-back, which is what delivers the through-breeze but leaves the living room only 8 ft deep. Buildability note: the lower level needs a terrace cut to about el.-0.5 in front of y=2 to walk out under the porch.",
    "flags": [
      "NO WALL THICKNESS — rooms on WEST LOWER @ffe 0 sum to 100.0% of the floor plate, so every dimension shown is an ideal clear dimension with nothing left for walls, risers or chases.",
      "FREEZE RULE — \"BATH 1\" (WEST UPPER @ffe 10) hangs its fixtures on the uphill EXTERIOR wall. No plumbing may run there at this elevation.",
      "FREEZE RULE — \"LAUNDRY\" (WEST UPPER @ffe 10) hangs its fixtures on the uphill EXTERIOR wall. No plumbing may run there at this elevation.",
      "FREEZE RULE — \"MECH WEST\" (WEST UPPER @ffe 10) hangs its fixtures on the uphill EXTERIOR wall. No plumbing may run there at this elevation.",
      "NO WALL THICKNESS — rooms on WEST UPPER @ffe 10 sum to 100.0% of the floor plate, so every dimension shown is an ideal clear dimension with nothing left for walls, risers or chases.",
      "FREEZE RULE — \"KITCHEN\" (EAST MAIN @ffe 8) hangs its fixtures on the uphill EXTERIOR wall. No plumbing may run there at this elevation.",
      "FREEZE RULE — \"BATH 2\" (EAST MAIN @ffe 8) hangs its fixtures on the uphill EXTERIOR wall. No plumbing may run there at this elevation.",
      "FREEZE RULE — \"MECH EAST\" (EAST MAIN @ffe 8) hangs its fixtures on the uphill EXTERIOR wall. No plumbing may run there at this elevation.",
      "KITCHEN DEPTH — 7 ft leaves under 42 in of working aisle once cabinets land on both faces.",
      "NO WALL THICKNESS — rooms on EAST MAIN @ffe 8 sum to 100.0% of the floor plate, so every dimension shown is an ideal clear dimension with nothing left for walls, risers or chases.",
      "THROUGH A PRIVATE ROOM — LAUNDRY (WEST UPPER @ffe 10) can only be reached by walking through the bedroom \"BED 2\"",
      "SEVERED — the plan is 2 disconnected groups of rooms (1144 sf and 572 sf). There is no interior route between them, so the corridor joining this house to itself is OUTDOORS. Any circulation figure quoted for this plan excludes it.",
      "ONE WAY DOWN — 2 sleeping rooms more than a storey above the entry (BED 1 PRIMARY at ffe 10, BED 2 at ffe 10) served by a single stair. Second means of escape not drawn."
    ]
  },
  {
    "id": "S5-PERCH",
    "levels": [
      {
        "ffe": 6,
        "name": "ARRIVAL / LIVING",
        "rooms": [
          {
            "name": "DINING",
            "use": "dining",
            "x0": 20,
            "y0": 6,
            "w": 12,
            "d": 10
          },
          {
            "name": "LIVING",
            "use": "living",
            "x0": 32,
            "y0": 6,
            "w": 12,
            "d": 10
          },
          {
            "name": "KITCHEN",
            "use": "kitchen",
            "x0": 20,
            "y0": 16,
            "w": 14,
            "d": 7
          },
          {
            "name": "MUD / GEAR",
            "use": "entry",
            "x0": 34,
            "y0": 16,
            "w": 10,
            "d": 7
          },
          {
            "name": "MECH / WATER ENTRY",
            "use": "mech",
            "x0": 20,
            "y0": 23,
            "w": 4,
            "d": 9
          },
          {
            "name": "POWDER",
            "use": "bath",
            "x0": 24,
            "y0": 23,
            "w": 5,
            "d": 9
          },
          {
            "name": "LAUNDRY",
            "use": "laundry",
            "x0": 29,
            "y0": 23,
            "w": 5,
            "d": 9
          },
          {
            "name": "STAIR",
            "use": "circ",
            "x0": 34,
            "y0": 23,
            "w": 10,
            "d": 9
          }
        ],
        "doors": [
          {
            "x": 39,
            "y": 32,
            "face": "N",
            "kind": "entry",
            "ffe": 6
          },
          {
            "x": 22,
            "y": 32,
            "face": "N",
            "kind": "service",
            "ffe": 6
          },
          {
            "x": 26,
            "y": 6,
            "face": "S",
            "kind": "glass",
            "ffe": 6
          },
          {
            "x": 38,
            "y": 6,
            "face": "S",
            "kind": "glass",
            "ffe": 6
          }
        ]
      },
      {
        "ffe": 16,
        "name": "SLEEPING",
        "rooms": [
          {
            "name": "BED 1",
            "use": "bed",
            "x0": 20,
            "y0": 6,
            "w": 13,
            "d": 13
          },
          {
            "name": "BED 2",
            "use": "bed",
            "x0": 33,
            "y0": 6,
            "w": 11,
            "d": 13
          },
          {
            "name": "GALLERY HALL",
            "use": "circ",
            "x0": 20,
            "y0": 19,
            "w": 24,
            "d": 4
          },
          {
            "name": "LINEN / STORE",
            "use": "store",
            "x0": 20,
            "y0": 23,
            "w": 4,
            "d": 9
          },
          {
            "name": "BATH",
            "use": "bath",
            "x0": 24,
            "y0": 23,
            "w": 10,
            "d": 9
          },
          {
            "name": "STAIR",
            "use": "circ",
            "x0": 34,
            "y0": 23,
            "w": 10,
            "d": 9
          }
        ],
        "doors": [
          {
            "x": 26,
            "y": 6,
            "face": "S",
            "kind": "egress",
            "ffe": 16
          },
          {
            "x": 39,
            "y": 6,
            "face": "S",
            "kind": "egress",
            "ffe": 16
          }
        ]
      },
      {
        "ffe": 26,
        "name": "LOFT",
        "rooms": [
          {
            "name": "LOFT",
            "use": "bed",
            "x0": 20,
            "y0": 6,
            "w": 14,
            "d": 13
          },
          {
            "name": "WORK",
            "use": "work",
            "x0": 34,
            "y0": 6,
            "w": 10,
            "d": 13
          },
          {
            "name": "GALLERY HALL",
            "use": "circ",
            "x0": 20,
            "y0": 19,
            "w": 24,
            "d": 4
          },
          {
            "name": "MECH / ERV / AIR HANDLER",
            "use": "mech",
            "x0": 20,
            "y0": 23,
            "w": 4,
            "d": 9
          },
          {
            "name": "STORE / SHUTTER GEAR",
            "use": "store",
            "x0": 24,
            "y0": 23,
            "w": 10,
            "d": 9
          },
          {
            "name": "STAIR",
            "use": "circ",
            "x0": 34,
            "y0": 23,
            "w": 10,
            "d": 9
          }
        ],
        "doors": [
          {
            "x": 27,
            "y": 6,
            "face": "S",
            "kind": "egress",
            "ffe": 26
          },
          {
            "x": 40,
            "y": 6,
            "face": "S",
            "kind": "egress",
            "ffe": 26
          }
        ]
      }
    ],
    "doors": [
      {
        "x": 39,
        "y": 32,
        "face": "N",
        "kind": "entry",
        "ffe": 6
      },
      {
        "x": 22,
        "y": 32,
        "face": "N",
        "kind": "service",
        "ffe": 6
      },
      {
        "x": 26,
        "y": 6,
        "face": "S",
        "kind": "glass",
        "ffe": 6
      },
      {
        "x": 38,
        "y": 6,
        "face": "S",
        "kind": "glass",
        "ffe": 6
      },
      {
        "x": 26,
        "y": 6,
        "face": "S",
        "kind": "egress",
        "ffe": 16
      },
      {
        "x": 39,
        "y": 6,
        "face": "S",
        "kind": "egress",
        "ffe": 16
      },
      {
        "x": 27,
        "y": 6,
        "face": "S",
        "kind": "egress",
        "ffe": 26
      },
      {
        "x": 40,
        "y": 6,
        "face": "S",
        "kind": "egress",
        "ffe": 26
      }
    ],
    "notes": "The massing showed a tower; it could not show that a 24x26 plate only works if you surrender the cold uphill nine feet outright and then cut every floor on the same two lines - y=23, the wet wall, and x=34, the stair. That makes the plumbing one interior partition on all three storeys and never an exterior one: kitchen sink on its south face at ffe 6, powder and laundry on its north face, the only full bath directly above at ffe 16, and a 4 ft mechanical chase at x20-24 running unbroken from the undercroft to the roof, so 26 lf of wet wall serves 1.5 baths, a laundry and a kitchen with no branch longer than 9 ft. The stair takes the coldest, most useless 90 sf on each plate (the NE corner) and is drawn identically three times: 270 sf, 14% of the house, the honest price of refusing the horizontal. Egress is answered rather than dodged - the stair is a rated enclosure discharging straight onto the uphill entry bridge, and a 3 ft steel gallery hung inside the shutter frame runs the downhill face at ffe 16 and ffe 26 with ship's ladders down to the ffe 6 deck, so both bedrooms and the loft get a door, not a window, to open air; the same gallery carries the shutter track and shades the glass, and when the shutter is closed the house is empty anyway. Worst compromise: 1.5 baths spread over 30 vertical feet means the loft sleeps two people a full flight above the only tub and two flights above the powder, and the living floor is only 10 ft deep front to back - on this scheme you are always at the glass, never behind it.",
    "flags": [
      "FREEZE RULE — \"MECH / WATER ENTRY\" (ARRIVAL / LIVING @ffe 6) hangs its fixtures on the uphill EXTERIOR wall. No plumbing may run there at this elevation.",
      "FREEZE RULE — \"POWDER\" (ARRIVAL / LIVING @ffe 6) hangs its fixtures on the uphill EXTERIOR wall. No plumbing may run there at this elevation.",
      "FREEZE RULE — \"LAUNDRY\" (ARRIVAL / LIVING @ffe 6) hangs its fixtures on the uphill EXTERIOR wall. No plumbing may run there at this elevation.",
      "KITCHEN DEPTH — 7 ft leaves under 42 in of working aisle once cabinets land on both faces.",
      "NO WALL THICKNESS — rooms on ARRIVAL / LIVING @ffe 6 sum to 100.0% of the floor plate, so every dimension shown is an ideal clear dimension with nothing left for walls, risers or chases.",
      "FREEZE RULE — \"BATH\" (SLEEPING @ffe 16) hangs its fixtures on the uphill EXTERIOR wall. No plumbing may run there at this elevation.",
      "NO WALL THICKNESS — rooms on SLEEPING @ffe 16 sum to 100.0% of the floor plate, so every dimension shown is an ideal clear dimension with nothing left for walls, risers or chases.",
      "FREEZE RULE — \"MECH / ERV / AIR HANDLER\" (LOFT @ffe 26) hangs its fixtures on the uphill EXTERIOR wall. No plumbing may run there at this elevation.",
      "NO WALL THICKNESS — rooms on LOFT @ffe 26 sum to 100.0% of the floor plate, so every dimension shown is an ideal clear dimension with nothing left for walls, risers or chases.",
      "ONE WAY DOWN — 3 sleeping rooms more than a storey above the entry (BED 1 at ffe 16, BED 2 at ffe 16, LOFT at ffe 26) served by a single stair. Second means of escape not drawn."
    ]
  },
  {
    "id": "S6-TOWER",
    "levels": [
      {
        "ffe": 2,
        "name": "DECK LEVEL",
        "rooms": [
          {
            "name": "BATH 1",
            "use": "bath",
            "x0": 26,
            "y0": 18,
            "w": 6,
            "d": 5
          },
          {
            "name": "MECH",
            "use": "mech",
            "x0": 26,
            "y0": 23,
            "w": 6,
            "d": 3
          },
          {
            "name": "ARRIVAL LOBBY",
            "use": "circ",
            "x0": 32,
            "y0": 18,
            "w": 4,
            "d": 8
          },
          {
            "name": "STAIR",
            "use": "circ",
            "x0": 36,
            "y0": 18,
            "w": 8,
            "d": 8
          },
          {
            "name": "KITCHEN",
            "use": "kitchen",
            "x0": 26,
            "y0": 8,
            "w": 8,
            "d": 10
          },
          {
            "name": "LIVING / DINING",
            "use": "living",
            "x0": 34,
            "y0": 8,
            "w": 10,
            "d": 10
          }
        ],
        "doors": [
          {
            "x": 44,
            "y": 16,
            "face": "E",
            "kind": "entry",
            "ffe": 2
          },
          {
            "x": 39,
            "y": 8,
            "face": "S",
            "kind": "deck",
            "ffe": 2
          },
          {
            "x": 30,
            "y": 8,
            "face": "S",
            "kind": "deck",
            "ffe": 2
          }
        ]
      },
      {
        "ffe": 12,
        "name": "LEVEL 2",
        "rooms": [
          {
            "name": "LAUNDRY",
            "use": "laundry",
            "x0": 26,
            "y0": 18,
            "w": 6,
            "d": 5
          },
          {
            "name": "STORE",
            "use": "store",
            "x0": 26,
            "y0": 23,
            "w": 6,
            "d": 3
          },
          {
            "name": "HALL",
            "use": "circ",
            "x0": 32,
            "y0": 18,
            "w": 4,
            "d": 5
          },
          {
            "name": "LINEN / COAT",
            "use": "store",
            "x0": 32,
            "y0": 23,
            "w": 4,
            "d": 3
          },
          {
            "name": "STAIR",
            "use": "circ",
            "x0": 36,
            "y0": 18,
            "w": 8,
            "d": 8
          },
          {
            "name": "WORK",
            "use": "work",
            "x0": 26,
            "y0": 8,
            "w": 8,
            "d": 10
          },
          {
            "name": "BED 2",
            "use": "bed",
            "x0": 34,
            "y0": 8,
            "w": 10,
            "d": 10
          }
        ],
        "doors": []
      },
      {
        "ffe": 22,
        "name": "LEVEL 3",
        "rooms": [
          {
            "name": "BATH 2",
            "use": "bath",
            "x0": 26,
            "y0": 18,
            "w": 6,
            "d": 8
          },
          {
            "name": "HALL",
            "use": "circ",
            "x0": 32,
            "y0": 18,
            "w": 4,
            "d": 5
          },
          {
            "name": "LINEN",
            "use": "store",
            "x0": 32,
            "y0": 23,
            "w": 4,
            "d": 3
          },
          {
            "name": "STAIR",
            "use": "circ",
            "x0": 36,
            "y0": 18,
            "w": 8,
            "d": 8
          },
          {
            "name": "FAMILY",
            "use": "living",
            "x0": 26,
            "y0": 8,
            "w": 8,
            "d": 10
          },
          {
            "name": "BED 3",
            "use": "bed",
            "x0": 34,
            "y0": 8,
            "w": 10,
            "d": 10
          }
        ],
        "doors": []
      },
      {
        "ffe": 32,
        "name": "LEVEL 4",
        "rooms": [
          {
            "name": "DRESSING",
            "use": "store",
            "x0": 26,
            "y0": 18,
            "w": 6,
            "d": 8
          },
          {
            "name": "HALL",
            "use": "circ",
            "x0": 32,
            "y0": 18,
            "w": 4,
            "d": 5
          },
          {
            "name": "CLOSET",
            "use": "store",
            "x0": 32,
            "y0": 23,
            "w": 4,
            "d": 3
          },
          {
            "name": "STAIR",
            "use": "circ",
            "x0": 36,
            "y0": 18,
            "w": 8,
            "d": 8
          },
          {
            "name": "LOOKOUT / SITTING",
            "use": "living",
            "x0": 26,
            "y0": 8,
            "w": 8,
            "d": 10
          },
          {
            "name": "BED 1 PRIMARY",
            "use": "bed",
            "x0": 34,
            "y0": 8,
            "w": 10,
            "d": 10
          }
        ],
        "doors": []
      }
    ],
    "doors": [
      {
        "x": 44,
        "y": 16,
        "face": "E",
        "kind": "entry",
        "ffe": 2
      },
      {
        "x": 39,
        "y": 8,
        "face": "S",
        "kind": "deck",
        "ffe": 2
      },
      {
        "x": 30,
        "y": 8,
        "face": "S",
        "kind": "deck",
        "ffe": 2
      }
    ],
    "notes": "THE CHECKER IS RIGHT AND THE ANSWER IS (b): an 18 ft plate CANNOT hold a living room, a dining room, a kitchen, a bath, a mudroom and a stair on one floor at habitable dimensions. The proof is one line of arithmetic - 18 ft less the 8 ft uphill service band (wet cell 6x8, lobby 4x8, stair 8x8) leaves a downhill band only 10 ft deep, so that band can only be cut in the x direction, and 18 ft of width divides into at most TWO rooms of 7 ft or more. Two habitable rooms is the deck level's hard ceiling. I therefore deleted the dining room (merged into a 10x10 living/dining opening to the 18x14 deck) and deleted the interior mudroom (its work goes to the 4x8 arrival lobby beside the stair and to the sheltered shed two feet across the east court), leaving KITCHEN 8x10 eat-in and LIVING/DINING 10x10. What the plan shows that the massing could not: the downhill band splits at x=34 on all four levels, so one partition line runs foundation to roof; every bath, laundry and mech sits in the single 6x8 cell with fixtures hung only on the interior y=18 wall and the x=32 partition, never in an exterior wall; each upper floor carries exactly one conforming bedroom (10x10) plus one 8x10 secondary room, which is why three bedrooms cost three whole floors. The stair is three 3 ft flights, 16 risers at 7.5 in, in the same 8x8 well at every level: 64 sf x 4 = 256 sf, 19.8% of the 1,296 sf gross, and with its landings and halls vertical circulation costs 348 sf, 27% of the house - THE WHOLE SAVING IN FOUNDATION AND 72 LF OF PERIMETER IS SPENT CLIMBING. Single worst compromise: the public floor loses both its dining room and its mudroom, so a household of five eats in the kitchen and enters through the east wall directly into a 100 sf living room; second, with only two baths on the stack no bedroom has a bath on its own floor, and the primary at ffe32 stands 30 ft above the downhill grade on a single stair, which at four storeys is outside IRC scope and needs a 1-hr enclosed stair with self-closing doors plus NFPA 13D sprinklers off the same stack, or the fourth floor must be deleted.",
    "flags": [
      "FREEZE RULE — \"MECH\" (DECK LEVEL @ffe 2) hangs its fixtures on the uphill EXTERIOR wall. No plumbing may run there at this elevation.",
      "KITCHEN DEPTH — 8 ft leaves under 42 in of working aisle once cabinets land on both faces.",
      "NO WALL THICKNESS — rooms on DECK LEVEL @ffe 2 sum to 100.0% of the floor plate, so every dimension shown is an ideal clear dimension with nothing left for walls, risers or chases.",
      "NO WALL THICKNESS — rooms on LEVEL 2 @ffe 12 sum to 100.0% of the floor plate, so every dimension shown is an ideal clear dimension with nothing left for walls, risers or chases.",
      "FREEZE RULE — \"BATH 2\" (LEVEL 3 @ffe 22) hangs its fixtures on the uphill EXTERIOR wall. No plumbing may run there at this elevation.",
      "NO WALL THICKNESS — rooms on LEVEL 3 @ffe 22 sum to 100.0% of the floor plate, so every dimension shown is an ideal clear dimension with nothing left for walls, risers or chases.",
      "NO WALL THICKNESS — rooms on LEVEL 4 @ffe 32 sum to 100.0% of the floor plate, so every dimension shown is an ideal clear dimension with nothing left for walls, risers or chases.",
      "THROUGH A PRIVATE ROOM — MECH (DECK LEVEL @ffe 2) can only be reached by walking through the bathroom \"BATH 1\"",
      "THROUGH A PRIVATE ROOM — FAMILY (LEVEL 3 @ffe 22) can only be reached by walking through the bathroom \"BATH 2\"",
      "ONE WAY DOWN — 3 sleeping rooms more than a storey above the entry (BED 2 at ffe 12, BED 3 at ffe 22, BED 1 PRIMARY at ffe 32) served by a single stair. Second means of escape not drawn."
    ]
  }
];

export const planFor = (id) => PLANS.find(p => p.id === id) ?? null;

export default PLANS;
