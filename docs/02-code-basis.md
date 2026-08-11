# 02 — CODE BASIS AND VERIFICATION STATUS

## ⚠ READ THIS FIRST — THE VERIFICATION PROBLEM

The environment this package was produced in **has no outbound web access.** Every attempt to reach a primary source returned HTTP 403 at the egress proxy:

```
connect_rejected  gateway answered 403 to CONNECT   ncosfm.gov:443
connect_rejected  gateway answered 403 to CONNECT   codes.iccsafe.org:443
connect_rejected  gateway answered 403 to CONNECT   www.wataugacounty.org:443
connect_rejected  gateway answered 403 to CONNECT   asce7hazardtool.online:443
connect_rejected  gateway answered 403 to CONNECT   hdsc.nws.noaa.gov:443
```

**Consequence: not one line of code text, not one load map, and not one county ordinance was read from a primary source.** Everything below comes from web-search *summaries* — machine-generated text about pages nobody opened. In testing, those summaries returned mutually contradictory values for the same code cell (ceiling R-38 vs R-49; air leakage 3.0 vs 5.0 ACH50; fenestration U-0.35 vs U-0.32).

So the brief's instruction — *"verify current applicable codes and local requirements before claiming something is buildable"* — **could not be satisfied here.** Rather than fabricate compliance, this document records what is believed, how strongly, and what must be done to actually establish it.

**Nothing in this package may be relied upon for permitting.**

### Verification legend

| Mark | Meaning |
|---|---|
| 🟠 **SEARCH-CORROBORATED** | Multiple independent searches agreed. Still not read from source. |
| 🟡 **SINGLE-SOURCE** | One search summary only. Treat as a lead, not a fact. |
| 🔴 **CONFLICTING** | Searches returned different values. Design must not depend on it. |
| ⚫ **NOT ESTABLISHED** | No usable result. Requires a person with access. |

---

## A. Which code governs

| Item | Status | What is believed |
|---|---|---|
| Governing residential code | 🟠 | **2018 NC State Building Code: Residential Code**, derived from the **2015 IRC**, effective 2019-01-01. |
| 2024 NC Residential Code | 🔴 | Adopted but its effective date is genuinely unresolved. Original date 2025-01-01 → delayed to 2025-07-01 by S.L. 2024-57 → S.L. 2025-2 §5.12(b) replaced the fixed date with a trigger: 12 months after the State Fire Marshal certifies both that the 2024 Code is published/distributed **and** that the Residential Code Council is fully constituted. Search summaries gave three different "earliest possible" dates — 2026-07-31, 2027-01-01, 2027-03-01. **One of those has already passed.** |
| Energy code | 🟠 / 🔴 | **2018 NC Energy Conservation Code**, based on the **2015 IECC**. An OSFM document titled *"January 7, 2026 — 2018 NC State Energy Conservation Code Amendments"* is reported to exist; **its content is unknown and it postdates everything else found.** Highest-priority retrieval. |
| Code revision cycle | 🟡 | S.L. 2023-108 (HB 488) limits residential code revision to a six-year cycle, first revision targeted 2031. |
| Early adoption | 🟡 | The 2024 Code may reportedly be elected voluntarily as an alternative method of construction at the owner's request. Conditions unknown. |

> **Action:** Before any further design, phone Watauga County Planning & Inspections and ask one question: *"For a residential permit applied for this month, which code edition and which amendment package do you enforce?"* That single call resolves more than any amount of searching from here.

---

## B. Authority Having Jurisdiction

| Item | Status | What is believed |
|---|---|---|
| AHJ | 🟠 | **Watauga County Planning & Inspections** — 126 Poplar Grove Connector, Suite 201, Boone NC 28607 · 828-265-8043 · p&i@watgov.org |
| Why not the Town of Boone | 🟠 | Boone's extraterritorial jurisdiction was **abolished** by a 2014 local act, upheld by the NC Supreme Court on 2016-12-21; planning and permitting in the former ~1-mile ETJ transferred to the County. The once-standard "Boone ETJ" assumption is obsolete and would send the project to the wrong office. |
| Caveat | ⚫ | "Outside Boone" is not a legal description. Confirm by parcel ID — the site could be inside Boone limits, or inside Blowing Rock / Seven Devils / Beech Mountain. See `01-site-facts-register.md` A-18. |

---

## C. Provisions that actually shape this design

| Provision | Status | Believed content | How the design responds |
|---|---|---|---|
| Stair riser / tread | 🟡 | NC reportedly amends the IRC: **max riser 8¼"** (IRC 7¾") and **min tread 9"** (IRC 10"). | Design uses **7½" riser / 10½" tread** — more conservative than *both* the IRC and the reported NC values, so it stays compliant whichever is right. `STAIRS` in `model/geometry.mjs`. |
| Wood decks | 🟠 | NC adds a state-created **Appendix M — Wood Decks**, with its own footing, span, guard, ledger and lateral-attachment tables. | The main deck and entry bridge are called out as engineered elements, not prescriptive. Critical here: the deck is elevated on a slope. |
| Wall bracing R602.10 | 🔴 | NC substantially rewrites the IRC bracing section. Reported: min. two braced panels per side per storey; a panel within 12 ft of each end of each elevation. Only a **2012-edition** commentary was located. | **Steep sites routinely exceed prescriptive bracing** — tall cripple walls, stepped foundations, and a nearly all-glass downhill wall. This design assumes **engineered lateral design**, not prescriptive bracing. See `STRUCTURE.lateral`. |
| Guards / handrails | ⚫ | Not established whether NC amends the IRC. | Design uses 42" guards and 34–38" handrails — at or above typical requirements. |
| EERO (bedroom egress) | ⚫ | No NC amendment located. | All bedrooms have windows flagged `egress: true`; **net clear opening, clear width/height and sill height are unverified.** Marked on A-102. |
| Attached-garage separation | ⚫ | No NC new-construction amendment located. | **Made moot by design:** the garage is detached and joined by a conditioned link, so the separation requirement does not arise. |
| Residential sprinklers | ⚫ | Not researched to conclusion. | Not designed. Verify. |
| Radon | ⚫ | Watauga County is widely reported as EPA Radon Zone 1, but this was not confirmed and NC code requirements were not established. | A **passive sub-slab depressurization stack** with a labeled riser and an attic receptacle for a future fan is included regardless — cheap, and correct practice in a Zone 1 county. |

---

## D. Design loads — **NOT ESTABLISHED**

None of these could be obtained. They are not code-lookup items; they are engineering inputs.

| Load | Status | Note |
|---|---|---|
| Ground snow load, Pg | ⚫ | NC mountain counties are frequently designated **"CS" (case study)** — meaning no map value exists and the AHJ or a registered engineer must establish it for the specific site elevation. At ~3,400 ft this is a governing load and it drives roof structure, snow retention, and deck design. |
| Design wind speed / exposure / Kzt | ⚫ | An exposed knob or escarpment can require **Exposure C** and a topographic speed-up factor **Kzt** well above 1.0. This cannot be assumed; it depends on the actual landform from the survey. |
| Seismic Ss, S1, SDC | ⚫ | Watauga sits near the **Eastern Tennessee Seismic Zone**. SDC must be set by the engineer of record. |
| Frost depth | ⚫ | Sets minimum footing depth. |
| Winter/summer design temperatures, HDD | ⚫ | Drives heat-pump selection and whether a cold-climate unit at 5°F rating is sufficient. |
| NOAA Atlas 14 rainfall | ⚫ | Drives every culvert, swale, trench drain and level spreader in the drainage design. |

**Every structural member size, every drainage pipe diameter, and every equipment capacity in this package is a coordination placeholder pending these numbers.**

---

## E. Where the design deliberately exceeds likely minimums

Chosen so that ambiguity in Section A cannot make the house non-compliant:

| Element | Design value | Likely code minimum |
|---|---|---|
| Air leakage | target **≤1.0 ACH50** | 3.0 or 5.0 ACH50 (🔴 conflicting) |
| Roof insulation | R-60 dense-pack, vented | R-38 or R-49 (🔴 conflicting) |
| Wall insulation | R-21 cavity + R-8.4 continuous exterior (≈R-26 whole-wall) | R-15 / R-13+ci (🔴 conflicting) |
| Stairs | 7½" R / 10½" T | 8¼" R / 9" T reported |
| Guards | 42" | 36" typical |
| Ventilation | balanced ERV, ducted independently | ⚫ not established |

Exceeding a minimum is safe. **It is not a substitute for verification** — an unverified prescriptive path can still fail on a provision nobody looked up.

---

## F. What a person with web access must do

1. Open `ncosfm.gov` → Codes, Current and Past. Record the current residential + energy edition and **every** amendment package, including the January 7 2026 energy amendments.
2. Call Watauga County Planning & Inspections (828-265-8043) and confirm the enforced edition and the ground snow load they require.
3. Run the **ASCE 7 Hazard Tool** at the surveyed latitude/longitude for wind, seismic and snow.
4. Run **NOAA Atlas 14** at the same point for rainfall frequency.
5. Retrieve the Watauga County steep-slope / landslide-hazard ordinance and confirm whether the hazard maps are regulatory or advisory.
6. Confirm NC Sedimentation Pollution Control Act thresholds and whether Watauga runs a delegated local program.
7. Retrieve 15A NCAC 18E (on-site wastewater) and 15A NCAC 02C (wells) current text.

Until items 1–4 are done, this package is a design proposition, not a buildable set.
