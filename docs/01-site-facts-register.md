# 01 — SITE FACTS REGISTER

**The rule for this project: nothing enters a drawing as a fact unless it appears in the KNOWN table below.**

Everything else is an assumption. Every assumption is written down here with the exact model constant it drives, what happens to the design if it is wrong, and who resolves it. If you read only one file before spending money on this house, read this one.

Status date: 2026-08-11 · Phase: Schematic Design · **NOT FOR CONSTRUCTION**

---

## A. KNOWN — established facts

These come from the client brief. There are only four, and that is the honest count.

| # | Fact | Source | Confidence |
|---|---|---|---|
| K-1 | The site is steep mountain land outside Boone, North Carolina | Client brief | Stated by client |
| K-2 | The site has an existing water source (type unspecified) | Client brief | Stated by client |
| K-3 | The client, Henry, is a physician | Client brief | Stated by client |
| K-4 | The house is a single-family residence for one household | Client brief | Stated by client |
| **K-5** | **The site is at 36°17'14.2"N 81°55'30.4"W** (36.287267, −81.925097) | **Client, 2026-08-11** | **Stated by client** |

### K-5 changes the status of this document

For six days this project had four facts and no ground. It now has a location,
and a location can be measured against. What follows is **measured, not
surveyed** — read the confidence column before spending anything on it.

| # | Measured | Value | Source | Resolution |
|---|---|---|---|---|
| M-1 | Elevation at the anchor | **2,364 ft AMSL** (720.5 m) | terrarium DEM | ±31 m horizontally |
| M-2 | Slope at building scale (±92 m) | **30%** — 40% at ±31 m, 27% at ±185 m | terrarium DEM | ±31 m |
| M-3 | The land falls to **azimuth 5° — almost due NORTH** | 354°–34° across every window tested | terrarium DEM | ±31 m |
| M-4 | The Watauga River is mapped **298 m north** of the anchor, downhill | OpenStreetMap | ODbL |

M-3 and M-4 are independent of each other — a raster elevation model and a
vector map of waterways, from two different sources. They agree. Rivers sit in
valleys; the river is north; the hill falls north.

**How this was obtained, and its limits.** The elevation raster is the public
terrarium tile set (AWS open data) at zoom 12, about 31 m per pixel, read
through CREO (`hartswf0/motor`, `creo3/places/36-28727-n-81-92510-w.json`).
This container has no outbound network — every request returns 403 by policy —
so none of it was fetched here and none of it can be refined here. **A 31 m
grid resolves which way a hillside faces and roughly how steep it is. It does
not resolve a building site.** It cannot see a bench, a rock outcrop, a
drainage swale, or the ten-metre shelf that would decide where this house
actually sits. Re-import at zoom 14 (~8 m) over a tight box — CREO does this
from a browser, which is not subject to this container's policy — and then get
a survey.

**Still unknown:** parcel identifier, boundaries, deed, plat, soils, test pit,
well log, septic feasibility, road access, easements, jurisdictional
confirmation, and whether the coordinate is the centre of the parcel or a point
on it.

---

## B. ASSUMED — every assumption the design currently rests on

Each row lists the model constant so you can change it in one place and regenerate the whole set.

### B.1 Terrain and orientation

| ID | Assumption | Value used | Model constant | If wrong |
|---|---|---|---|---|
| A-01 ✅ | Cross-slope falls at 30% perpendicular to the house | 30% | `SITE_SLOPE.crossSlopePct` | **CONFIRMED by M-2 at 31 m.** The plane fit gives 30% over a ±92 m window — the assumption was right to the percent. It reads 40% closer in and 27% further out, which is what real ground does. The stepped section and the walkout level keep their justification. |
| A-02 | Grade falls 8% along the length of the house | 8% | `SITE_SLOPE.longSlopePct` | Sets where the crawlspace/walkout transition happens (bays D–G) and where the driveway can arrive at main-floor level. |
| A-03 ❌ | Long axis bears N70°E, chosen to lie along the contour | 70° azimuth | `ORIENTATION.longAxisAzimuth` | **CONTRADICTED by M-3.** The contour at this parcel runs roughly E–W, so the long axis is about 20° out — small, and fixable by rotating. The clause that matters is the next one, and it was written for exactly this: *"If the real view is north or the slope faces north, the plan must be reconsidered, not rotated."* It does. See **docs/09**. |
| A-04 ❌❌ | The view and the best solar exposure are both toward SSE (az. 160°) | 160° | `ORIENTATION.viewFaceAzimuth` | **CONTRADICTED by M-3, and this one cannot be rotated away.** The land falls to azimuth 5°; the assumed view face points 155° from that — into the hill. On a north slope the view is north and the winter sun is south, so the downhill face and the solar face are on OPPOSITE sides of the house. The entire parti assumes they are the same side. This is a design decision, not a constant, and it is not being made silently. |
| A-05 ❌ | Project datum EL. 100'-0" ≈ 3,412 ft AMSL | 3,412 ft | `units.mjs DATUM_FT` | **CONTRADICTED by M-1: ~2,364 ft, about 1,050 ft lower.** Relative geometry is unaffected, but snow load, design temperature and the freeze-depth reasoning were all argued from 3,400 ft. Still a cold mountain site; the numbers behind the envelope and the freeze rule need recomputing from the real elevation. |
| A-06 | The site is not on a protected mountain ridge as defined by NCGS 113A Art. 14 | assumed clear | — | If the site IS on a protected ridge, a height limit applies and the roof/massing may need to change. |

### B.2 Geotechnical — **entirely assumed, zero data**

| ID | Assumption | Value used | Model constant | If wrong |
|---|---|---|---|---|
| A-07 | Competent bearing material is reachable at conventional footing depth | assumed | `STRUCTURE.spine.footing` | Colluvial soils are common on Blue Ridge slopes and are frequently *not* suitable. Could force piers, caissons or a ground-improvement scheme, changing cost materially. |
| A-08 | Allowable bearing pressure adequate for a 30"-wide strip footing | assumed | `STRUCTURE.spine.footing.w` | Footing widths and the entire retaining design are placeholders. |
| A-09 | The slope is globally stable and not an active or historic landslide/debris-flow path | assumed | — | Watauga County has mapped landslide hazards. A debris-flow track through the site could make it unbuildable at this location. **This is a life-safety assumption, not an economic one.** |
| A-10 | No shallow groundwater or seep intercepted by the cut | assumed | `DRAIN_GAP`, `STRUCTURE.spine.drainage` | The drain gap and curtain drain are designed to tolerate being wrong here, which is why they exist. Still requires confirmation. |
| A-11 | Rock is deep enough not to require blasting for the cut or utilities | assumed | — | Rock excavation is one of the largest cost risks on a Blue Ridge site. |

### B.3 Water supply

| ID | Assumption | Value used | Model constant | If wrong |
|---|---|---|---|---|
| A-12 | The existing source (K-2) is a spring roughly 250 ft uphill, ~40 ft above main floor | assumed | `model/systems/water.mjs` | If it is a drilled well instead, the gravity-backup strategy changes completely and a pump becomes the only path. **Resolve this first — it changes the water design more than any other single fact.** |
| A-13 | Source yield is adequate for a 4-bedroom house year-round | assumed | — | Mountain springs commonly fail in late-summer drought. Drives the cistern sizing and whether a backup well is required. |
| A-14 | Source water is potable with treatable chemistry | assumed | — | NC Blue Ridge groundwater commonly shows low pH/corrosivity, iron, manganese; radon and uranium occur regionally. Treatment train is sized on assumption only. |

### B.4 Wastewater

| ID | Assumption | Value used | Model constant | If wrong |
|---|---|---|---|---|
| A-15 | A permittable septic area exists on the parcel | assumed | `model/systems/waste.mjs` | **On steep NC mountain land this is the single most common reason a house cannot be built where the owner wants it.** The soil evaluation should happen *before* the house is sited, not after. |
| A-16 | Soils support a pressure-dosed drip dispersal field | assumed | — | Conventional trenches may be excluded by slope; drip or LPP is the usual mountain answer, but soils decide. |
| A-17 | Required separation between the water source and the dispersal field can be achieved | assumed | — | If not, either the water source or the field must move. |

### B.5 Regulatory and utility

| ID | Assumption | Value used | Model constant | If wrong |
|---|---|---|---|---|
| A-18 | The parcel is in unincorporated Watauga County, not a municipality | assumed | — | Well supported: Boone's ETJ was abolished by a 2014 local act upheld by the NC Supreme Court in Dec 2016, transferring authority to the County. But "outside Boone" is not a legal description — the parcel could fall in Blowing Rock, Seven Devils, Beech Mountain, or be annexed. **Confirm by parcel ID.** |
| A-19 | Grid electric service can reach the site | assumed | `model/systems/electrical.mjs` | Long runs on steep ground are expensive; the utility (Blue Ridge Energy or New River Light & Power) must be confirmed along with the connection point. |
| A-20 | Legal access exists and a driveway can be built at ≤12% sustained grade | assumed | — | Access easement, its width, and its maintenance obligations are unverified. A driveway that cannot meet fire-apparatus requirements can block a permit. |
| A-21 | Land disturbance can be kept under the state E&SC plan threshold, or a plan will be filed | assumed | — | Threshold and whether Watauga runs a delegated local program are unverified. |

---

## C. REQUIRED — what must be commissioned, in order

The sequence matters. Items 1–3 can invalidate the design; do them before spending on documentation.

| Order | Investigation | Professional | Resolves |
|---|---|---|---|
| 1 | **Wastewater soil evaluation + Improvement Permit** | Licensed Soil Scientist / County Environmental Health | A-15, A-16, A-17 — can veto the site |
| 2 | **Boundary + topographic survey** with 2 ft contours, existing water source located, easements, road frontage | NC Professional Land Surveyor | A-01 → A-06, A-20 |
| 3 | **Geotechnical investigation** — borings/test pits, bearing capacity, slope stability, groundwater, rock depth | NC-licensed Geotechnical Engineer | A-07 → A-11 |
| 4 | Water source evaluation: yield test, water quality panel, spring/well classification | Hydrogeologist / driller / County EH | A-12, A-13, A-14 |
| 5 | Jurisdiction + zoning confirmation by parcel ID | Watauga County Planning & Inspections | A-18 |
| 6 | Utility service availability and connection point | Serving electric utility | A-19 |
| 7 | Site-specific design loads (snow, wind exposure/Kzt, seismic) | Structural Engineer of Record | See `02-code-basis.md` |

---

## D. HOW THE DESIGN PROTECTS ITSELF AGAINST BEING WRONG

Because so much is unknown, the design deliberately favours choices that tolerate error:

- **Gravity drainage over pumped drainage.** Footing drains and the drain gap daylight at both ends. A pump that fails during an ice storm is a flooded lower level; a daylighted drain has nothing to fail.
- **The drain gap.** A 4'-0" drained margin along the uphill wall means an unexpected seep (A-10) becomes a maintenance item rather than a hydrostatic failure. It is insurance bought cheaply against the assumption most likely to be wrong.
- **Detached garage.** Removes garage-to-house fire separation and CO migration issues entirely, and lets the garage sit at motor-court level regardless of what the survey says the grade actually does.
- **Parametric model.** Slope, orientation and bay spacing are single constants. When the survey arrives, change `SITE_SLOPE.crossSlopePct` and regenerate the whole set rather than redrawing it.
- **The lower level is the flexible one.** If geotech forces piers, the lower level can become open undercroft without touching the main level plan.

---

## E. WHAT IS EXPLICITLY *NOT* CLAIMED

- Not claimed: that this house can be permitted as drawn.
- Not claimed: that any dimension satisfies a specific code section (see `02-code-basis.md` — no code text was read from a primary source in this environment).
- Not claimed: that the structure is adequate. Every member size is a coordination placeholder.
- Not claimed: that a septic system can be permitted on this parcel.
- Not claimed: that the water source is potable or adequate.
