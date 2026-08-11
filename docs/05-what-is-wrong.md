# 05 — WHAT IS WRONG

An honest audit, written against the model rather than from memory. Numbers below come from `tools/` run over `model/`, not from recollection.

Three questions: what is wrong with the **models**, what is wrong with making this an **actual house**, and what is **missing entirely**.

---

## A. WHAT IS WRONG WITH THE MODELS

### A.1 There is no structural model. At all.

`STRUCTURE` in `geometry.mjs` is **prose with placeholder members**. The ribs are declared as *"glulam 5-1/8 x 15 (placeholder)"* spanning **26 ft clear at 12 ft on centre**. At 12 ft tributary width, carrying a roof at ~3,400 ft elevation plus an unverified ground snow load, that member is almost certainly **undersized** — a real member is likely 5-1/8 × 21 or deeper, or steel.

Nothing in the package computes a span, a reaction, or a deflection. The clash checker verifies that a *toilet* fits and says nothing about whether the *building stands up*. That is an odd distribution of rigour, and it is the single largest gap between what this package looks like and what it is.

### A.2 Walls are boxes with a thickness — so the "pen test" is rhetoric

`docs/03-body-diagram.md` claims the air barrier must be traceable on any section "without lifting the pen," and calls it a checkable criterion. **It is not checked by anything.** Walls in the model are solid boxes with a single `extWall = 10` dimension. There are no layers, no membrane object, no continuity graph. I asserted a test and never built it.

Same for the roof: `ROOF_ASSEMBLY = 20` is one number, not an assembly.

### A.3 The systems are routed, not sized

232 runs, orthogonally routed from real fixture positions — genuinely useful for coordination. But **every diameter is conventional, not calculated**. No fixture-unit count, no Manual J, no duct static pressure, no electrical load calculation. The sheets say this, but it bears repeating: this proves the systems can *coexist in the space provided*. It does not predict that they will work.

### A.4 The clash checker tests the wrong half of the problem

It proves door swings do not *hit* fixtures. It never asks whether a swing is the *sensible* one — whether you back into a door, whether it blocks a light switch, whether it swings against traffic. Three separate stair failures got through because nothing in the checker knew what a stair is *for*.

### A.5 Things the model cannot currently answer

- What does the building weigh, and where does that load land?
- What is the heat loss, and does the equipment cover it?
- How much water does the roof shed in a 25-year storm, and where does it go?
- What does any of it cost?

---

## B. WHAT IS WRONG WITH MAKING THIS AN ACTUAL HOUSE

### B.1 The laundry is 68–70 ft from the bedrooms that use it

Measured from the model:

| From laundry to | Distance |
|---|---|
| PRIMARY BEDROOM | **68 ft horizontally** |
| GUEST BEDROOM | **70 ft horizontally, 10 ft vertically** |
| BEDROOM 2 | 23 ft, 10 ft vertically |
| BEDROOM 3 | 11 ft, 10 ft vertically |

Putting the laundry in the mudroom link is defensible as an *airlock* argument — dirty clothes never enter the house. As a *daily ergonomics* argument it is bad: the primary suite is at the far opposite end of a 72 ft bar. For a physician doing scrubs at odd hours this is a real, repeated cost. **A second stacked laundry in the primary suite, or moving the main one to the spine, is probably right.**

### B.2 The cut is deeper than the documents claim

The model puts natural grade at the back of the motor court at **19.2 ft**, and the court at 9.3 ft — a **9.8 ft cut**. Earlier notes said ~7 ft. Nearly ten feet of cut on a 30% slope means an **engineered retaining structure**, not a laid-back slope, and it changes the earthwork quantity and the cost materially. The discrepancy is a documentation failure on my part.

### B.3 The detached garage is a comfort decision disguised as a safety decision

Detaching the garage genuinely removes the CO and fire-separation problems. But it means that in an ice storm, at 3,400 ft, you cross **9 ft of open breezeway** carrying groceries, a sleeping child, or a medical bag. The link is conditioned; the breezeway is not. For a house whose whole argument is resilience, sending the occupant outdoors on the worst night of the year deserves a harder look. Enclosing the breezeway costs the fire gap; keeping it costs comfort. **I picked one and did not present the trade-off.**

### B.4 The gravity water branch is oversold

~9.5 psi of static head from the cistern will fill a toilet and run a tap. It will **not** run a shower, a washing machine, or anything with a pressure-balancing valve. It is a genuine resilience feature and it is a narrow one. The documents should say what it *cannot* do.

### B.5 Snow will destroy the gutters

Standing seam at 3:12 with snow retention over the decks, and a gutter at the low eave. Where snow *does* release, it goes over the gutter — and where retention holds it, meltwater refreezes at the cold overhang. **Ice damming at the low eave is likely** and the detail does not address it. Options: no gutter at all with a designed drip zone, an ice-and-water membrane well up-slope, or heated eaves. None is drawn.

### B.6 The west clerestory is a summer heat gain problem

The roof step glazes **west** into the tall great room. Late-day sun in summer arrives low, which fins shade poorly. Glazing is **650 sf on 3,432 sf of floor — about 19%**, most of it on the downhill face, which is good; the clerestory is the exception and it is the one facing the worst direction.

### B.7 Nobody has priced this

~3,750 sf gross, three levels, a 72 ft engineered concrete spine, an elevated deck, a detached garage, a long steep driveway, a cistern, an alternative septic system, a standby generator and battery. On steep Watauga County land this is an **expensive house** and there is not a single number anywhere in the package. That is the fastest way for a design like this to die.

---

## C. WHAT IS MISSING ENTIRELY

### C.1 The site. Still.

Named repeatedly and still not done, so it belongs at the top:

- **No driveway profile.** The drive is 22 gravel segments in the 3D model with *no length, no grade, no turnaround, no cross-slope*. On steep mountain land, driveway grade is the first thing that kills a project. Fire apparatus access, winter maintenance and NCDOT connection all live here.
- **No cut-and-fill balance.** Earthwork moved on and off a mountain site is one of the largest line items, and it is unquantified.
- **No septic field layout** beyond a marker.
- **No erosion control plan**, no limits of disturbance, no stormwater outfall.

### C.2 Drawings that do not exist

| Missing | Why it matters |
|---|---|
| **Elevations** | There is not one. Four faces, none drawn. |
| **Roof plan** | Snow, drainage and the clerestory all resolve here. |
| **Second section** | Only one, transverse. Nothing longitudinal through the stepped levels. |
| **Structural sheets** | See A.1. |
| **Envelope details** | The wall/roof/foundation junctions where the design actually succeeds or leaks. |
| **Window and door schedules** | 30+ openings, no schedule. |
| **Site plan** | See C.1. |

### C.3 The Viable System Model was requested twice and never used

The brief asked explicitly for **Stafford Beer's VSM** to organise the architecture. I used the body analogy — which is adjacent but not the same thing — and never applied VSM. It would have produced different, sharper questions:

- **S1 (operations)** — the rooms and systems doing the work
- **S2 (coordination)** — the spine and chases; the anti-oscillation layer that stops systems fighting
- **S3 (control)** — the mechanical room, the panel, the resource allocation
- **S3\* (audit)** — sensors and the clash checker: how the house *inspects itself*
- **S4 (intelligence)** — weather, seasons, wildfire, the grid: the house's model of its environment
- **S5 (identity)** — what this house is *for*, which arbitrates when S3 and S4 conflict

The interesting one is **S4**, which the design barely has. The house senses leaks and freezing — inward-looking S3\* — but has almost no model of its *environment*: no weather-anticipating control, no pre-storm battery charging, no fire-weather response, no drought response on the cistern. That is a genuine architectural idea the brief pointed at and I skipped.

### C.4 Liveability

No lamps, books, art, blinds, firewood store, ski storage, coat closet at the guest entry, or linen in the primary suite. The "aging in place" claim has **no elevator provision** — no stacked closets sized as a future shaft. The interiors are coordinated and not yet inhabited.

### C.5 Render fidelity

Foliage reads as low-poly. Closing that needs alpha leaf-cards and real furniture geometry — asset work this environment cannot fetch.

---

## D. IF I COULD ONLY DO FIVE MORE THINGS

*(All five were then done. Struck through with what they produced — including the parts that got worse when measured.)*

1. ~~**Site and grading plan** with a real driveway profile and a cut/fill balance.~~ → **C-101**. The sketched drive measured **64% maximum grade**. The generated alignment holds **11% over 655 ft with 5 switchbacks** and daylights at the road. It also exposed a garage with **two feet of pavement in front of its doors**, 6,403 CY of spoil, and 1.2 acres disturbed — over the erosion threshold the pad alone appeared to clear.
2. ~~**Structural model with real spans and members.**~~ → `model/structure.mjs`. The placeholder rib was **5-1/8 × 15 and undersized**; sizing gives 5-1/8 × 18 roof-only and 6-3/4 × 22-1/2 where it also carries the floor. The motor court wall was asserted at 9.8 ft; the geometry says **16.4 ft**.
3. ~~**Elevations, roof plan, and a longitudinal section.**~~ → **A-301, A-302, A-202**. Four faces, a roof plan, and two long cuts. The projection caught its own errors, including a garage end wall drawn as a rectangle under a raked roof.
4. ~~**Move the laundry**, and price the house.~~ → A second stacked pair at the back of the primary closet, 7 ft from the bed, backing onto the bath's wet wall. Price: **$2.31M – $3.86M**, `$617 – $1,031/sf`. See docs/06.
5. ~~**Apply the VSM properly, especially S4.**~~ → `model/vsm.mjs` and **G-001**. Six anticipatory policies, and six viability gaps the model itself reports. See docs/06.

### What that leaves

The audit above is not closed. **A.2** (walls are boxes; the pen test is rhetoric), **A.3** (systems routed, not sized), **A.4** (the checker tests whether a swing *hits*, not whether it is *sensible*), **B.3** (the breezeway trade, now stated as an S5 contradiction and still not decided), **B.5** (ice damming at the low eave), **B.6** (the west clerestory), **C.4** (liveability, and no elevator provision) and **C.5** (render fidelity) all still stand.

Two items changed status rather than closing:

- **B.2 — the cut is deeper than the documents claim.** Confirmed and worse: **16.4 ft**, not 9.8.
- **A-201 note 2 claimed cut and fill were roughly balanced on site.** The model disproves it. The note now says so.
