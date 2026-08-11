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

**That is all that is known.** No parcel identifier, no survey, no contours, no soils data, no test pit, no well log, no address, no deed, no plat, no jurisdictional confirmation. The design below is therefore a *strategy* that responds correctly to a described condition — not a design sited on a specific piece of ground.

---

## B. ASSUMED — every assumption the design currently rests on

Each row lists the model constant so you can change it in one place and regenerate the whole set.

### B.1 Terrain and orientation

| ID | Assumption | Value used | Model constant | If wrong |
|---|---|---|---|---|
| A-01 | Cross-slope falls at 30% perpendicular to the house | 30% | `SITE_SLOPE.crossSlopePct` | The single most load-bearing assumption in the project. Below ~15% the stepped section and walkout lower level lose their justification and the house should be re-massed. Above ~45% the foundation strategy changes from stepped footings to piers/caissons, cost rises steeply, and the septic strategy may become infeasible. |
| A-02 | Grade falls 8% along the length of the house | 8% | `SITE_SLOPE.longSlopePct` | Sets where the crawlspace/walkout transition happens (bays D–G) and where the driveway can arrive at main-floor level. |
| A-03 | Long axis bears N70°E, chosen to lie along the contour | 70° azimuth | `ORIENTATION.longAxisAzimuth` | The whole parti — glass on one face, service on the other — depends on view and winter sun being on the same side. If the real view is north or the slope faces north, the plan must be reconsidered, not rotated. |
| A-04 | The view and the best solar exposure are both toward SSE (az. 160°) | 160° | `ORIENTATION.viewFaceAzimuth` | See A-03. Requires a real view study standing on the site. |
| A-05 | Project datum EL. 100'-0" ≈ 3,412 ft AMSL | 3,412 ft | `units.mjs DATUM_FT` | Affects snow load, climate data, and possible Mountain Ridge Protection Act exposure. Relative geometry does not depend on it. |
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
