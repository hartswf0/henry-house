# 09 — THE PARCEL, AND THE ONE THING IT BREAKS

**36°17'14.2"N 81°55'30.4"W.** Given by the client on 2026-08-11. It is the
fifth known fact this project has, and it is worth more than the other four
together, because a coordinate can be measured against and a description
cannot.

It also turned out to be **parcel TN-JOHNSON-100 064.03 — Johnson County,
TENNESSEE, owner HARTSOE HENRY, 29.34 deed acres** (K-6, K-7). The brief said
"outside Boone, North Carolina" and every one of the 26 sheets said WATAUGA
COUNTY, NORTH CAROLINA. The land is in another state. That is a code-basis
problem, not a caption problem, and it is set out in docs/01 under K-7.

The measurement is in docs/01 as M-1 to M-4. This file is about what it does to
the design.

---

## A. WHAT SURVIVED

**The slope was right.** The project assumed a 30% cross-slope and called it
"the single most load-bearing assumption in the project." A least-squares plane
fit to the DEM at the anchor gives **30% over a ±92 m window** — 40% at ±31 m,
27% at ±185 m, the ordinary behaviour of real ground read at different scales.

That is not a small thing. Everything that follows from 30% stands: the stepped
section, the walkout lower level, the pier-and-bench foundation argument, the
197 CY of clearance cut the Armature was charged for, the whole earthwork
comparison across eleven schemes. The most consequential guess in the project
was correct.

## B. WHAT DID NOT

**The hill faces north.**

| window | slope | the land falls toward |
|---|---|---|
| ±31 m | 40.5% | 34° |
| ±62 m | 34.6% | 17° |
| ±92 m | 30.2% | **6°** |
| ±123 m | 28.2% | 359° |
| ±185 m | 26.7% | 354° |

Every window agrees within about 30° of due north. And a second, independent
source agrees: OpenStreetMap puts the **Watauga River 298 m north of the
anchor**. Rivers are in valleys. One reading is a raster of elevations, the
other is a vector map of waterways; they were made by different people from
different data, and they say the same thing.

The project assumed the downhill face — the glass, the view, the terrace, the
winter sun — looked **SSE at azimuth 160°**. The real downhill is **5°**. Those
are **155° apart**. The assumed view face points into the hill.

## C. WHY THIS IS NOT A ROTATION

The obvious move is to spin the house 155° and carry on. It would make every
drawing self-consistent, and every drawing wrong.

On a **south** slope, downhill and sunny are the same direction. That is the
premise the whole package is built on, and it is why one face can be glass and
terrace and view and winter heat while the other is the cut, the service wall,
the plumbing artery and the cold side. One face does all the good work. The
freeze rule — no plumbing in an exterior wall — is affordable precisely because
the wet wall is the uphill wall, which is the warm interior side of a building
whose back is bermed into the hill.

On a **north** slope those two directions come apart:

- the **view and the fall** are north
- the **winter sun** is south, which is now **uphill, into the cut**
- the **cold** is north, which is now the **glass wall**

Every scheme in the set puts its glazing on the downhill face and its solid
service wall uphill. At this parcel that glazes the cold north face and turns
its back on the only winter heat available. Three of the eleven schemes are
*named* for the move — the Spine's service artery, the Narrow's uphill service
bar, the Datum's cut side — and all three now have their service bar on the sun.

docs/01 anticipated this at A-03, in the project's own words:

> *"If the real view is north or the slope faces north, the plan must be
> reconsidered, not rotated."*

So it has not been rotated. `ORIENTATION` in `model/geometry.mjs` still carries
the assumed azimuths, now marked `CONTRADICTED`, and no drawing has been spun.
Choosing what a north-slope Henry House is is a design decision and belongs to
the client and the architect, not to a constant.

## D. THE THREE HONEST ANSWERS

Roughly in order of how much they cost.

**1. Split the faces.** Stop asking one face to do everything. View glass north,
a solar aperture south — clerestory, roof monitor, or a south-facing court cut
into the uphill side — and the service artery moves to an end or an interior
spine rather than the uphill wall. This keeps the parti's logic (one working
wall, one open wall) but stops pretending the two are the same wall. The
Spine's central artery survives this best of the eleven: its wet wall is
already internal.

**2. Accept a north house and pay for it in the envelope.** North glazing is
not a catastrophe at this latitude — it is even, glare-free light with a view,
and it is what a lot of good mountain houses actually have. It costs more in
glass performance and heating, and it makes the winter-sun-tempering argument
in the systems package void. This is the cheapest change to the drawings and
the most expensive change to the building.

**3. Move the house on the parcel.** — **and this one turns out to be
available.** See section F: the parcel has south-west facing ground on a 9%
slope, and the anchor point is one of the worst positions on it.

## E. WHAT IS UNSAFE TO CONCLUDE

- **31 m is a hillside, not a building site.** It resolves aspect and average
  grade. It cannot see the bench you would actually build on. Re-import at zoom
  14 (~8 m) over a tight box before treating any of this as sited.
- **The coordinate may not be the parcel centre.** It is a point the client
  named. Boundaries, access and setbacks are all still unknown.
- **~2,364 ft is not 3,400 ft.** Snow load, design temperature and the freeze
  reasoning were argued from an elevation about 1,050 ft too high. Still cold,
  still freezing, but the numbers need recomputing from the real elevation
  rather than carried across.
- **None of this was fetched here.** This container's outbound network is
  refused by policy (403 on every request). The DEM and the OSM extract came
  from CREO, which fetched them from a browser. Nothing here can refine them.

---

*Elevation: terrarium tiles, AWS open data. Map data: © OpenStreetMap
contributors, ODbL. Both read via CREO (`hartswf0/motor`), place file
`creo3/places/36-28727-n-81-92510-w.json`.*

---

## F. THE PARCEL IS NOT THE POINT

The coordinate is one spot. The client owns **29.34 acres**. `tools/site-study.mjs`
scores every position on it — 331 candidates at 50 ft centres, 60 ft clear of
the boundary — on aspect, buildable slope, cut and fill for a level 72 × 26 pad,
and the driveway needed to reach it.

**The anchor is one of the worst positions on the parcel.**

| | the anchor | best ground found |
|---|---|---|
| ground falls to | **31° — NNE** | **206° — SSW** |
| off due north | 31° | **154°** |
| slope across the pad | **38%** | **9%** |
| cut / fill for the pad | 85 / 156 CY | 0 / 120 CY |
| driveway from the road | 357 ft at **25%** | 1,010 ft at **12%** |

**A 25% driveway is not a driveway.** Residential drives are normally held to
12–15%; 25% is beyond what a loaded concrete truck will climb and beyond what
anyone should be asked to descend on ice at 2,300 ft. That is a straight-line
grade — a switchbacked route would be gentler and much longer — but it is
computed identically for every candidate, so the comparison holds.

**And what the parcel is made of:**

- **51%** faces north — the docs/09 problem
- **44%** faces east or west — the view and the sun return to adjacent faces
- **5%** faces south — what the whole package was drawn for

So the design is not wrong for this land. **It is wrong for this 100 ft of it.**
The best ground sits about **656 ft north-west of the coordinate**, and it is
south-west facing at 9%, which is the condition every scheme in the set assumes.
Option 1 (split the faces) and option 2 (accept a north house) are answers to a
problem the parcel does not force. Option 3 was the cheap one all along.

**What this does not settle.** The DEM is 30.8 m — one sample is wider than the
house — so this says where the hillside turns, not where the bench is. It has no
knowledge of soils, rock, springs, trees, the septic field, or whether the deed
allows a drive on that line. The output is a list of places to walk.
