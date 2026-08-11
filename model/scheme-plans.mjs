// HENRY HOUSE — SCHEME PLANS, GENERATED AND CHECKED.
//
// Written by tools/build-plans.mjs from plans/*.json. DO NOT HAND-EDIT.
// Every plan here passed the checks in that file: rooms inside their scheme's
// own floors, no overlaps, the floor accounted for, bedrooms with an exterior
// wall and a bed wall, wet rooms grouped or stacked, stairs landing on the
// stair below. A plan that failed was reported and dropped, not repaired.
//
// 4 plans.

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
      "FREEZE RULE — \"MECH\" (LOWER @ffe 0) backs onto the uphill and west exterior wall. No plumbing may run there at this elevation.",
      "FREEZE RULE — \"BATH 3\" (LOWER @ffe 0) backs onto the uphill exterior wall. No plumbing may run there at this elevation.",
      "NO WALL THICKNESS — rooms on LOWER @ffe 0 sum to 100.0% of the floor plate, so every dimension shown is an ideal clear dimension with nothing left for walls, risers or chases.",
      "FREEZE RULE — \"BATH 1\" (MAIN @ffe 10) backs onto the uphill exterior wall. No plumbing may run there at this elevation.",
      "FREEZE RULE — \"KITCHEN\" (MAIN @ffe 10) backs onto the uphill exterior wall. No plumbing may run there at this elevation.",
      "FREEZE RULE — \"POWDER\" (MAIN @ffe 10) backs onto the uphill exterior wall. No plumbing may run there at this elevation.",
      "FREEZE RULE — \"LAUNDRY\" (MAIN @ffe 10) backs onto the uphill and east exterior wall. No plumbing may run there at this elevation.",
      "KITCHEN DEPTH — 7 ft leaves under 42 in of working aisle once cabinets land on both faces.",
      "NOT EN-SUITE — \"PRIMARY W.I.C.\" shares no edge with \"BED 1 PRIMARY\", so it can only be entered from circulation.",
      "NO WALL THICKNESS — rooms on MAIN @ffe 10 sum to 100.0% of the floor plate, so every dimension shown is an ideal clear dimension with nothing left for walls, risers or chases.",
      "FREEZE RULE — \"BATH 2\" (UPPER @ffe 20) backs onto the uphill exterior wall. No plumbing may run there at this elevation.",
      "NO WALL THICKNESS — rooms on UPPER @ffe 20 sum to 100.0% of the floor plate, so every dimension shown is an ideal clear dimension with nothing left for walls, risers or chases."
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
      "FREEZE RULE — \"BATH 1\" (WEST UPPER @ffe 10) backs onto the uphill exterior wall. No plumbing may run there at this elevation.",
      "FREEZE RULE — \"LAUNDRY\" (WEST UPPER @ffe 10) backs onto the uphill exterior wall. No plumbing may run there at this elevation.",
      "FREEZE RULE — \"MECH WEST\" (WEST UPPER @ffe 10) backs onto the uphill and east exterior wall. No plumbing may run there at this elevation.",
      "NO WALL THICKNESS — rooms on WEST UPPER @ffe 10 sum to 100.0% of the floor plate, so every dimension shown is an ideal clear dimension with nothing left for walls, risers or chases.",
      "FREEZE RULE — \"KITCHEN\" (EAST MAIN @ffe 8) backs onto the uphill and west exterior wall. No plumbing may run there at this elevation.",
      "FREEZE RULE — \"BATH 2\" (EAST MAIN @ffe 8) backs onto the uphill exterior wall. No plumbing may run there at this elevation.",
      "FREEZE RULE — \"MECH EAST\" (EAST MAIN @ffe 8) backs onto the uphill exterior wall. No plumbing may run there at this elevation.",
      "KITCHEN DEPTH — 7 ft leaves under 42 in of working aisle once cabinets land on both faces.",
      "NO WALL THICKNESS — rooms on EAST MAIN @ffe 8 sum to 100.0% of the floor plate, so every dimension shown is an ideal clear dimension with nothing left for walls, risers or chases.",
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
      "FREEZE RULE — \"KITCHEN\" (ARRIVAL / LIVING @ffe 6) backs onto the west exterior wall. No plumbing may run there at this elevation.",
      "FREEZE RULE — \"MECH / WATER ENTRY\" (ARRIVAL / LIVING @ffe 6) backs onto the uphill and west exterior wall. No plumbing may run there at this elevation.",
      "FREEZE RULE — \"POWDER\" (ARRIVAL / LIVING @ffe 6) backs onto the uphill exterior wall. No plumbing may run there at this elevation.",
      "FREEZE RULE — \"LAUNDRY\" (ARRIVAL / LIVING @ffe 6) backs onto the uphill exterior wall. No plumbing may run there at this elevation.",
      "KITCHEN DEPTH — 7 ft leaves under 42 in of working aisle once cabinets land on both faces.",
      "NO WALL THICKNESS — rooms on ARRIVAL / LIVING @ffe 6 sum to 100.0% of the floor plate, so every dimension shown is an ideal clear dimension with nothing left for walls, risers or chases.",
      "FREEZE RULE — \"BATH\" (SLEEPING @ffe 16) backs onto the uphill exterior wall. No plumbing may run there at this elevation.",
      "NO WALL THICKNESS — rooms on SLEEPING @ffe 16 sum to 100.0% of the floor plate, so every dimension shown is an ideal clear dimension with nothing left for walls, risers or chases.",
      "FREEZE RULE — \"MECH / ERV / AIR HANDLER\" (LOFT @ffe 26) backs onto the uphill and west exterior wall. No plumbing may run there at this elevation.",
      "NO WALL THICKNESS — rooms on LOFT @ffe 26 sum to 100.0% of the floor plate, so every dimension shown is an ideal clear dimension with nothing left for walls, risers or chases.",
      "ONE WAY DOWN — 3 sleeping rooms more than a storey above the entry (BED 1 at ffe 16, BED 2 at ffe 16, LOFT at ffe 26) served by a single stair. Second means of escape not drawn."
    ]
  },
  {
    "id": "S8-WATER",
    "levels": [
      {
        "ffe": 13,
        "name": "ENTRY",
        "rooms": [
          {
            "name": "BEDROOM 4",
            "use": "bed",
            "x0": -6,
            "y0": 2,
            "w": 14,
            "d": 11,
            "phase": 2
          },
          {
            "name": "STUDY / WEST BUNK",
            "use": "work",
            "x0": -6,
            "y0": 13,
            "w": 14,
            "d": 7,
            "phase": 2
          },
          {
            "name": "WEST GALLERY",
            "use": "circ",
            "x0": 8,
            "y0": 2,
            "w": 4,
            "d": 18,
            "phase": 2
          },
          {
            "name": "GREAT ROOM",
            "use": "living",
            "x0": 12,
            "y0": 2,
            "w": 15,
            "d": 11,
            "phase": 1
          },
          {
            "name": "DINING",
            "use": "dining",
            "x0": 27,
            "y0": 2,
            "w": 7,
            "d": 11,
            "phase": 1
          },
          {
            "name": "PANTRY",
            "use": "store",
            "x0": 12,
            "y0": 13,
            "w": 6,
            "d": 7,
            "phase": 1
          },
          {
            "name": "KITCHEN",
            "use": "kitchen",
            "x0": 18,
            "y0": 13,
            "w": 16,
            "d": 7,
            "phase": 1
          },
          {
            "name": "CORE HALL",
            "use": "circ",
            "x0": 34,
            "y0": 2,
            "w": 6,
            "d": 6,
            "phase": 1
          },
          {
            "name": "BATH 1",
            "use": "bath",
            "x0": 34,
            "y0": 8,
            "w": 6,
            "d": 7,
            "phase": 1
          },
          {
            "name": "UTILITY BAY / LAUNDRY",
            "use": "laundry",
            "x0": 34,
            "y0": 15,
            "w": 10,
            "d": 5,
            "phase": 1
          },
          {
            "name": "STAIR",
            "use": "circ",
            "x0": 40,
            "y0": 2,
            "w": 4,
            "d": 13,
            "phase": 1
          },
          {
            "name": "PRIMARY BEDROOM",
            "use": "bed",
            "x0": 44,
            "y0": 2,
            "w": 12,
            "d": 10,
            "phase": 1
          },
          {
            "name": "BOOT ROOM",
            "use": "entry",
            "x0": 44,
            "y0": 12,
            "w": 12,
            "d": 8,
            "phase": 1
          }
        ],
        "doors": [
          {
            "x": 50,
            "y": 20,
            "face": "N",
            "kind": "entry",
            "ffe": 13
          },
          {
            "x": 24,
            "y": 2,
            "face": "S",
            "kind": "deck",
            "ffe": 13
          },
          {
            "x": 50,
            "y": 2,
            "face": "S",
            "kind": "deck",
            "ffe": 13
          },
          {
            "x": 0,
            "y": 2,
            "face": "S",
            "kind": "deck",
            "ffe": 13
          }
        ]
      },
      {
        "ffe": 3.5,
        "name": "WALKOUT",
        "rooms": [
          {
            "name": "BEDROOM 5",
            "use": "bed",
            "x0": -6,
            "y0": 2,
            "w": 12,
            "d": 10,
            "phase": 2
          },
          {
            "name": "GEAR STORE",
            "use": "store",
            "x0": 6,
            "y0": 2,
            "w": 6,
            "d": 10,
            "phase": 2
          },
          {
            "name": "WEST HALL",
            "use": "circ",
            "x0": -6,
            "y0": 12,
            "w": 18,
            "d": 4,
            "phase": 2
          },
          {
            "name": "BEDROOM 2",
            "use": "bed",
            "x0": 13,
            "y0": 2,
            "w": 10.5,
            "d": 11,
            "phase": 1
          },
          {
            "name": "BEDROOM 3",
            "use": "bed",
            "x0": 23.5,
            "y0": 2,
            "w": 10.5,
            "d": 11,
            "phase": 1
          },
          {
            "name": "BEDROOM CORRIDOR",
            "use": "circ",
            "x0": 13,
            "y0": 13,
            "w": 27,
            "d": 3,
            "phase": 1
          },
          {
            "name": "WALKOUT LANDING",
            "use": "circ",
            "x0": 34,
            "y0": 2,
            "w": 6,
            "d": 4,
            "phase": 1
          },
          {
            "name": "BATH 2",
            "use": "bath",
            "x0": 34,
            "y0": 6,
            "w": 6,
            "d": 7,
            "phase": 1
          },
          {
            "name": "STAIR",
            "use": "circ",
            "x0": 40,
            "y0": 2,
            "w": 4,
            "d": 14,
            "phase": 1
          },
          {
            "name": "WATER PLANT",
            "use": "mech",
            "x0": 44,
            "y0": 2,
            "w": 9,
            "d": 9,
            "phase": 1
          },
          {
            "name": "BATH 3",
            "use": "bath",
            "x0": 44,
            "y0": 11,
            "w": 9,
            "d": 5,
            "phase": 2
          }
        ],
        "doors": [
          {
            "x": 37,
            "y": 2,
            "face": "S",
            "kind": "walkout",
            "ffe": 3.5
          },
          {
            "x": 18,
            "y": 2,
            "face": "S",
            "kind": "egress",
            "ffe": 3.5
          },
          {
            "x": 48,
            "y": 2,
            "face": "S",
            "kind": "service",
            "ffe": 3.5
          },
          {
            "x": 0,
            "y": 2,
            "face": "S",
            "kind": "walkout",
            "ffe": 3.5
          }
        ]
      }
    ],
    "doors": [
      {
        "x": 50,
        "y": 20,
        "face": "N",
        "kind": "entry",
        "ffe": 13
      },
      {
        "x": 24,
        "y": 2,
        "face": "S",
        "kind": "deck",
        "ffe": 13
      },
      {
        "x": 50,
        "y": 2,
        "face": "S",
        "kind": "deck",
        "ffe": 13
      },
      {
        "x": 0,
        "y": 2,
        "face": "S",
        "kind": "deck",
        "ffe": 13
      },
      {
        "x": 37,
        "y": 2,
        "face": "S",
        "kind": "walkout",
        "ffe": 3.5
      },
      {
        "x": 18,
        "y": 2,
        "face": "S",
        "kind": "egress",
        "ffe": 3.5
      },
      {
        "x": 48,
        "y": 2,
        "face": "S",
        "kind": "service",
        "ffe": 3.5
      },
      {
        "x": 0,
        "y": 2,
        "face": "S",
        "kind": "walkout",
        "ffe": 3.5
      }
    ],
    "notes": "The massing showed one roof, one leader, one stack; the plan shows what that costs in rooms. Every fixture in the house lands in a 6 ft strip at x34-40 with the stair beside it at x40-44: kitchen sink on the west face of the x=34 wall, bath 1 and the 10x5 utility bay above it, bath 2 directly under bath 1 (they overlap y8-13, so the drain is one plumb line), and the WATER PLANT as an 81 sf room at the foot of the stair - first flush, sediment, UV, pressure tank and heater all racked on the interior x=44 core wall, buried-tank line entering under the slab and relief draining to daylight through the walkout face, so not one pipe sits in an exterior wall on either floor. Phase 2's bath 3 tucks against the plant for the shortest hot run in the house. The single uphill door at x50,y20 lands in a 12x8 boot room that is also the laundry's standing room and the hinge to primary, stair and mudroom, so a wet dog and a filter change use the same treads and never cross the great room. The worst compromise: the future west bay - 576 sf, two bedrooms and a study - carries no plumbing at all. The one-stack bet means a guest in bedroom 4 walks 22 ft to bath 1, and the mature five-bedroom house ends up with two of its three baths on the walkout level. I would rather explain that walk than explain a second stack freezing on the cold end of the house.",
    "flags": [
      "FREEZE RULE — \"KITCHEN\" (ENTRY @ffe 13) backs onto the uphill exterior wall. No plumbing may run there at this elevation.",
      "FREEZE RULE — \"UTILITY BAY / LAUNDRY\" (ENTRY @ffe 13) backs onto the uphill exterior wall. No plumbing may run there at this elevation.",
      "KITCHEN DEPTH — 7 ft leaves under 42 in of working aisle once cabinets land on both faces.",
      "NO WALL THICKNESS — rooms on ENTRY @ffe 13 sum to 100.0% of the floor plate, so every dimension shown is an ideal clear dimension with nothing left for walls, risers or chases.",
      "FREEZE RULE — \"WATER PLANT\" (WALKOUT @ffe 3.5) backs onto the downhill and east exterior wall. No plumbing may run there at this elevation.",
      "FREEZE RULE — \"BATH 3\" (WALKOUT @ffe 3.5) backs onto the uphill and east exterior wall. No plumbing may run there at this elevation.",
      "NO WALL THICKNESS — rooms on WALKOUT @ffe 3.5 sum to 100.0% of the floor plate, so every dimension shown is an ideal clear dimension with nothing left for walls, risers or chases.",
      "SEVERED — the plan is 2 disconnected groups of rooms (1676 sf and 252 sf). There is no interior route between them, so the corridor joining this house to itself is OUTDOORS. Any circulation figure quoted for this plan excludes it.",
      "ONE WAY DOWN — 2 sleeping rooms more than a storey above the entry (BEDROOM 4 at ffe 13, PRIMARY BEDROOM at ffe 13) served by a single stair. Second means of escape not drawn."
    ]
  }
];

export const planFor = (id) => PLANS.find(p => p.id === id) ?? null;

export default PLANS;
