# 08 — THE 3D NEEDS A REBUILD, NOT ANOTHER FIX

**Status: the drawings are sound, the 3D is not.** This is the handoff note for
that rebuild. Read it before touching `tools/render/lib/build3d.mjs`.

---

## A. WHAT IS WRONG

The client's words, looking at the Spine in the walkthrough: *"missing walls,
flickering walls, unbuildable and unsupported elements — basically lots of
architectural slop."* All three are real and all three are the same cause.

**The Armature — a 616 sf phase-1 house — builds 305 meshes.** That number is
the diagnosis. `build3d.mjs` has five generations of geometry running at once,
each added to fix a complaint about the last, and they now fight:

| # | System | Reads | Added because |
|---|---|---|---|
| 1 | Volume walls with punched openings | `scheme.volumes` | original |
| 2 | Frame bays for `future` volumes | `scheme.volumes` | to show phasing |
| 3 | Deck, porch and pier structure | `scheme.ground` | to stop it floating |
| 4 | Roof support posts on a 16 ft grid | `scheme.roofs` | "the roof is not supported" |
| 5 | Plan envelope + partitions + fixtures | `scheme-plans.mjs` | "it doesn't acknowledge the blueprints" |

Systems 1 and 5 describe the same walls from **two different sources**. Systems
2, 3 and 4 are still sized off the volumes while 5 is sized off the rooms, so
the frame and the envelope are built to different coordinates and neither knows
about the other.

That produces exactly what the screenshots show:

- **Missing walls** — the frame reads as the building; the envelope is lost inside it
- **Flickering** — coplanar duplicates between systems 1 and 5
- **Unsupported elements** — posts sized from the roof, beams sized from the volumes
- **A floating upper box** — a `future` volume's frame drawn where the plan puts nothing
- **A blank downhill face** — the plan envelope glazes room by room, but the volume wall is drawn over it solid

---

## B. WHY PATCHING FAILED

Four consecutive attempts each **added** a system rather than removing one, and
each made the model worse while fixing the specific complaint it aimed at. The
lesson is in the table above: every row is a patch, and the patches are the
problem. The next change must delete geometry.

---

## C. THE REBUILD

**One source. The checked plan.** `model/scheme-plans.mjs` is now complete —
11/11 schemes, every room checked for containment, overlap, egress, the freeze
rule, reachability and stair alignment. It is the only description of these
houses that has ever been verified. Build from it and nothing else.

The volumes keep exactly two jobs, both of which the plan genuinely cannot do:

1. **roof extent** — a roof legitimately oversails the rooms
2. **ground contact** — piers, bench or plinth

Everything else comes off the plan:

```
floors      one plate per level, the level's own room bounds
walls       exterior from level bounds; partitions from room bounds;
            ONE system, no volume walls at all
openings    glazing where the plan draws glass, doors where
            model/scheme-doors.mjs puts doors — both already exist
stairs      model/scheme-furnish.mjs stairsFor(), already correct
fixtures    model/scheme-furnish.mjs furnish(), already correct and
            already verified by tools/check/plan3d.mjs
structure   posts ONLY where the roof is not carried by a wall below,
            and the wall test must read the PLAN's walls, not the volumes
```

**Target: under 120 meshes for a 616 sf house.** If it is over 200, two systems
are still running.

---

## D. THE LOOP THAT WILL PROVE IT

`tools/check/envelope.mjs` exists and is wired as `npm run check:envelope`. It
is deliberately **not** in `npm test` because it does not yet pass for its own
reasons, and a check that fails for its own reasons trains you to ignore it.

- **DAYLIGHT — passing.** Stands a camera in a room and measures whether what it
  sees varies and whether any of it is sky-bright. Caught the opaque glazing.
- **OUTLINE — not passing.** Measures the built envelope out of the scene graph
  and compares it, per level, against the room bounds the checker accepted. Two
  of its own filters were wrong and are fixed (it was measuring the 1,300 ft
  terrain plane, then measuring eaves and deck framing as walls). It still
  reports "nothing built at this level" on schemes with 104 wall-like meshes,
  so **the remaining fault is in the check's band filter, not the model.**

Finish OUTLINE first, watch it fail against the current build, then rebuild
until it passes. That order matters: a check written after the fix proves
nothing.

---

## E. WHAT IS SOUND AND MUST NOT BE BROKEN

- **The drawing set.** 26 sheets, X-201 through X-211. Drawn by `tools/draw/`,
  which does not touch `build3d.mjs`.
- **11/11 plans accepted, 0 errors.**
- **`tools/check/plan3d.mjs` — 0 failed, 11 passed.** Every fixture in every
  drawing present in the model at the same coordinates. Note what it does NOT
  cover: it matches fixtures only. **It never checked a wall.** That gap is
  precisely where the slop lives.
- **The mobile gallery and the repository index**, both verified at 390 × 844.
