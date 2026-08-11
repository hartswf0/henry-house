# 08 — THE 3D NEEDS A REBUILD, NOT ANOTHER FIX

**Status: done. `npm test` is 14/14 including the loop below.** Sections A–E are
the handoff note as it was written before the rebuild; section F is what the
rebuild actually found and did, including where this note's own target was
wrong. Read the whole thing before touching `tools/render/lib/build3d.mjs`.

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

---

## F. WHAT THE REBUILD FOUND

### F.1 The check was broken, not the band filter

Section D blamed OUTLINE's band filter for reporting "nothing built at this
level" against a house with a hundred walls in it. That was wrong, and it is
worth recording why, because the wrong diagnosis would have had me tuning
thresholds forever.

**A mesh's `matrixWorld` is identity until something renders the scene.** The
check read bounding boxes straight after `setupScheme`, so it measured every
piece of every house stacked on top of every other at the origin. One line —
`updateMatrixWorld(true)` — and OUTLINE went from 0/11 to 11/11 with no change
to any filter. The same bug made the first run of the new SOLID check report
239,660 interpenetrating pairs; the real number was 560.

The deeper fix is that these checks no longer infer what a mesh is from its
dimensions. `build3d.mjs` tags every mesh — `wall`, `partition`, `glass`,
`floor`, `stair`, `fixture`, `furniture`, `post`, `footing`, `pier`, `deck`,
`guard`, `roof`, `fascia`, `plinth` — and the checks read the tag. A check that
has to guess what it is looking at cannot be trusted when it passes either.

### F.2 The roof was 6.7 ft clear of the wall

`roofBase()` takes its height from `scheme.volumes` (ffe + 120 × storeys) while
the walls now come from the plan (ffe + 106). On the Armature that put the roof
underside 14 in above the wall at the downhill face — and because the plane
slopes, **80 in above it at the uphill face.** A flat-topped wall cannot meet a
sloping plane at more than one line, so no amount of adjusting the base would
have closed it.

Two changes, both removals of a second source:

- the roof base is derived from **the plan's top plate**, projected back down
  its own slope to the roof's low edge, so the underside meets the wall exactly
  where the wall is;
- a wall's top **follows the roof**, via a box whose four top corners move
  (`slab()`). It is one mesh, every face stays planar, the UVs survive. So
  these are now real shed sections — high on the cut side, low at the eave —
  and the alternative (a second system of gable infill pieces) never had to
  exist.

### F.3 The four checks caught eleven real defects

SOLID and SUPPORT went in as new members of the loop. Between them they found,
in order of how much they mattered:

| Found | Where it was fixed |
|---|---|
| A WC placed **inside the shower** in six schemes, and inside the tub in the Spine — in the DRAWINGS as well as the model | `layoutBath` gives the end wall to the wet fixture first |
| A 30 in washer in a laundry with 21 in of clear depth, coming out through the front of the building | `alongWall` now tests depth, which it never did |
| Fixtures and stair treads placed to the wall LINE, so they sat partly inside the walls beside them | a room's rect is now its CLEAR rect, inside its walls |
| Stairs buried in the floor above — no stairwell opening anywhere | floor plates are cut around any flight that arrives |
| The Narrow's porch drawn 2 ft clear of the house: the front door opened onto a gap, and the porch was structurally detached | a deck within reach is extended to meet the wall it serves |
| Every deck post stopping 10 in short of the decking it carried | post runs to the underside |
| Every pier stopping 3 in short of the floor it carried, and some rising THROUGH a deck into its guard rail | a pier stops under the lowest thing over it, tested against its own radius |
| Guard rails standing inside the wall on uphill terraces | the guard goes on the open edge |
| Two posts in one place where a deck post and a roof post coincided | one shared register of where a post already stands |
| Corner doubles, and partitions buried in the exterior walls they ran into | runs stop at the face of what they meet |
| A plinth rising through the slab above it | capped under the lowest floor |

That is the honest reason the walkthrough looked the way it did. None of it was
visible in a passing test suite, because nothing was testing it.

### F.4 The rebuild reintroduced the fault, in the other direction

Worth recording because it happened ten commits into a rebuild whose entire
purpose was to remove second sources.

Putting the roof on the plan's plate fixed the model — and the new arithmetic
was written **inside `build3d.mjs`**, where the old volume-based `roofBase()`
in `model/schemes.mjs` was simply no longer imported. But `roofBase()` has two
consumers. The other one is the comparison SECTION on X-101. So for ten commits
the model drew the roof at the plan height and the section went on drawing it
at the volume height, and nothing failed, because no check compares a drawing's
roof to the model's.

The fix was to move the arithmetic into the model and have both consumers read
it. Two more disagreements surfaced once the section was looked at properly:
its volume boxes were flat-topped where the model's walls follow the roof, and
its roof build-up hung *below* the base line, putting the covering inside the
rooms it covers.

The lesson is not "check the drawings too." It is that **a height, a thickness
or a coordinate computed inside a consumer is a second source by construction**,
however correct it is on the day it is written. The rule the rebuild states —
one source — has to be applied to the fix as well as to the thing being fixed.

### F.5 On the 120-mesh target in section C — it was the wrong test

Section C says "under 120 meshes for a 616 sf house; if it is over 200, two
systems are still running." The Armature builds **203**. Two things about that:

**The denominator was wrong.** 616 sf is the Armature's PHASE 1 conditioned
area, from its phasing table. The plan that gets built is the mature house:
1,540 sf, 22 rooms, 24 doorways. Twenty-two rooms need at least twenty-two
partitions before a single door splits a run into pieces. 203 is 78 partitions,
28 exterior wall pieces, 8 glass, 29 fixtures and furniture, and 43 pieces of
pier, footing, post and guard.

**More importantly, the count was only ever a proxy.** What it was trying to
detect is "two systems are building the same thing," and SOLID now measures
exactly that, directly, by volume of interpenetration. It found and killed the
last instance (the doubled post) that a mesh count would only have hinted at.
A number that stands in for a property is worth keeping only until you can
measure the property.

So the target is retired, not met. The count is still worth watching — it fell
from 305 to 203 on the Armature while the house gained stairwells, sloping wall
heads and a porch that reaches the building — but SOLID is the test.

### F.6 The loop

`npm test` now runs it. Four checks, all passing:

```
OUTLINE   11/11 · the built envelope matches the checked plan on every level
SOLID     no two solids occupy the same space in any scheme
SUPPORT   every solid reaches the ground through solids
DAYLIGHT  the interior sees out
```

SUPPORT is worth understanding before trusting it: it does **not** ask "is
something underneath this." It seeds with every solid resting on the finished
grade and floods outward through contact, so a piece is supported only if there
is a chain of touching solids from it to the ground. A floating box resting on
another floating box passes the naive test and fails this one.

What none of them say: that the house is engineered, code-compliant or
buildable. They say the model is the same building as the drawing, that it
stands up, and that its windows are windows.
