# HENRY HOUSE

A coordinated design package for a house on steep mountain land — **parcel 100 064.03, Johnson County, Tennessee**, 29.34 acres at 36°17'14.2"N 81°55'30.4"W.

**Phase: Schematic Design · NOT FOR CONSTRUCTION · NOT FOR PERMIT**

**Start here:** [`index.html`](index.html) — the whole package indexed · [`issue-for-review.html`](issue-for-review.html) — the document to send a surveyor, an engineer or a builder.

---

## Where this stands

|  | |
|---|---|
| ✅ **Settled** | **The slope.** Assumed at 30%, measured at 30%. Everything downstream of it — the stepped section, the walkout level, the earthwork comparison across eleven schemes — holds. |
| ✅ **Settled** | **The drawings.** 26 sheets, 11 plans checked by machine, and a 3D model proven to be the same building as the plan on every level. `npm test` is the proof. |
| ⛔ **Open — blocking** | **Where on the parcel.** The named coordinate faces **north at 38%** with a **25% straight-line driveway**. Better ground sits 656 ft north-west, facing south-west at 9%. A survey answers it. See [`docs/09`](docs/09-the-parcel.md). |
| ⛔ **Open** | **The code basis.** Researched against North Carolina; the parcel is in Tennessee. Discard and redo. |

---

## The idea

**The house works like a body.**

Structure is skeleton · water is circulation · waste is digestion · HVAC is respiration · electrical and data are the nervous system · the envelope is skin · storage, backup and controls create homeostasis.

The analogy is used as a *generator*, not as decoration. Each system's anatomical logic was made to produce a design decision, and each decision was then tested against the drawings — see [`docs/03-body-diagram.md`](docs/03-body-diagram.md), which records where the analogy produced better architecture and where it failed or nearly caused a mistake.

## The design in one paragraph

A long, narrow bar laid **along** the contour rather than across it — the move that minimises cut and fill on steep ground. Glass and terraces face downhill, *on the premise that the view and the winter sun arrive from the same direction* — true on a south slope, and **not true at the coordinate the client named**, where the land falls north. That premise is the one thing the site data broke, and it is the subject of [`docs/09`](docs/09-the-parcel.md); everything else in this paragraph survives it. The uphill wall is nearly solid and holds an 11'-0" **service spine** carrying every wet room, every chase and all mechanical distribution. Three levels step with the hill: a walkout lower level the slope gives you almost for free, a main level with everything essential on one floor, and a sleeping level tucked under a 3:12 shed. A reinforced concrete **spine wall** retains the cut, carries the structure, resists lateral load and stores heat — one element doing four jobs. The roofs fall **downhill**, so no roof water is ever delivered to the uphill side where the cut and the groundwater problem already are. A 4'-0" drained **drain gap** runs the length of the uphill wall so the house never touches the cut face. The garage is **detached**, joined by a conditioned mudroom link, which removes garage-to-house fire separation and CO migration problems at the source.

---

## ⚠ Honest status — read before using any of this

Two constraints shape what this package can and cannot claim.

### 1. No code was verified

This package was produced in an environment with **no outbound web access**. Every request to a primary source returned HTTP 403 at the egress proxy — `ncosfm.gov`, `codes.iccsafe.org`, `wataugacounty.org` (the wrong county — see above), the ASCE Hazard Tool and NOAA all refused.

So the brief's instruction to *verify current applicable codes before claiming something is buildable* **could not be satisfied**. No code text was read. Design loads — ground snow, wind exposure, seismic, frost depth, rainfall intensity — are **not established**, and they are the numbers that size the structure and the drainage.

Rather than fabricate compliance, [`docs/02-code-basis.md`](docs/02-code-basis.md) marks every reference with its verification status and lists exactly what a person with web access must retrieve.

**Nothing here may be relied upon for permitting.**

### 2. There is no site information

Four facts are known: steep land outside Boone; an existing water source of unspecified type; the client is a physician; it is a single-family house. **Everything else is assumed** — slope percentage, orientation, view direction, soils, bearing capacity, groundwater, rock depth, septic feasibility, utility access, jurisdiction.

Every assumption is recorded in [`docs/01-site-facts-register.md`](docs/01-site-facts-register.md) with the model constant it drives, what breaks if it is wrong, and who resolves it. The design is deliberately built to tolerate being wrong: gravity drainage over pumps, a drained margin against the cut, a detached garage, and a parametric model where slope and orientation are single constants.

**Commission the wastewater soil evaluation before anything else.** On steep NC mountain land it is the most common reason a house cannot be built where the owner wants it, and no amount of design can overcome it.

---

## How it is built

One parametric model is the source of truth. Every drawing is generated from it, so plans, sections, elevations and the 3D model **cannot silently disagree** — a discrepancy is a bug in a generator, not a coordination error hiding in a drawing set.

```
model/
  units.mjs        inches everywhere; architectural dimension formatting
  geometry.mjs     THE SOURCE OF TRUTH — levels, grid, rooms, roofs, structure
  openings.mjs     doors, windows, open edges
tools/
  svg.mjs          architectural SVG primitives (poché, swings, dim strings,
                   grid bubbles, section marks, title block)
  draw/plan.mjs    floor plans
  build.mjs        generates the sheet set
  render/raster.mjs SVG → PNG via Chromium
docs/              facts register, code basis, body diagram, professional scope
out/drawings/      generated SVG sheets
out/png/           rasterised sheets for review
```

### Running it

```bash
npm install
node tools/build.mjs          # generate SVG sheets into out/drawings/
node tools/render/raster.mjs  # rasterise to out/png/
```

To re-site the house when a survey arrives, change one constant:

```js
// model/geometry.mjs
export const SITE_SLOPE = { crossSlopePct: 30, longSlopePct: 8, ... }
```

...and regenerate. The drawings follow.

---

## Current sheet set

| Sheet | Title | Status |
|---|---|---|
| A-101 | Main Level Plan | drawn |
| A-102 | Lower + Upper Level Plans | drawn |

**Not yet produced:** site and grading plan, sections, elevations, roof plan, foundation/structural, plumbing, wastewater, electrical/lighting, HVAC, drainage/stormwater, envelope details, life-safety plan, systems diagrams, schedules, and renders. This is an incomplete set and is labelled as such.

## What requires a licensed professional

See [`docs/04-professional-scope.md`](docs/04-professional-scope.md). Summary: essentially all of it. Every structural member size, drainage pipe diameter and equipment capacity in this package is a **coordination placeholder** — geometry that reserves the right space and proves the systems can coexist, not an engineered value.

---

## Repository

Branch: `claude/henry-house-mountain-wsydn3`
