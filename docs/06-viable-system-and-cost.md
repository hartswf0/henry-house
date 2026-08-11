# 06 — THE VIABLE SYSTEM, AND WHAT IT COSTS

Two things the brief asked for and the package did not have: **Stafford Beer's Viable System Model**, requested twice, and **a number**.

Both are now in the model — `model/vsm.mjs` and `model/cost.mjs` — and both are drawn on **G-001**.

---

## A. WHY THE VSM AND NOT THE BODY

The body analogy gave real returns. It put every wet room in one spine, it separated the airway from the heating system, and it produced hardwired reflex arcs that work with the controller offline. Those are good buildings decisions and they came out of the metaphor.

But the analogy has a ceiling. It tells you a house has organs. It does not tell you **what has to be true for a system to keep functioning in an environment that is actively trying to end it** — which, on a 3,400 ft ridge in Watauga County, is the entire design problem.

Beer's claim is that any viable system contains five necessary functions, plus one channel:

| | Function | In this house |
|---|---|---|
| **S1** | Operations | Shelter · Water · Waste · Power · Access · Stay Dry · Dwell |
| **S2** | Coordination | The service spine, the two chases, the mudroom airlock, snow retention vs shed, the drain gap |
| **S3** | Control | The Heart — one conditioned mechanical room you can physically get to |
| **S3\*** | Audit | Leak, freeze, CO, septic float — and `tools/check/clash.mjs` |
| **S4** | Intelligence | *The model of the environment and the future* |
| **S5** | Identity | What the house is for, arbitrating when S3 and S4 conflict |
| — | Algedonic | Pain signals that bypass every level and need no permission |

---

## B. THE FINDING

**This house had almost no S4.**

Every sensor in the package looked *inward*: leak, freeze, CO, humidity, high water. That is S3\* — audit. It tells the house what is happening **to** it.

Nothing told the house what was about to happen to it.

A system with audit and no intelligence can only react. It arrives at every emergency with an empty battery, a half cistern and a cold slab. On this site that is not an abstraction: the environment *is* the adversary — ice storms, multi-day outages, drought on a spring-fed cistern, fire weather, snow load, and a driveway that can close.

This is a finding the body analogy could not produce, because a body's homeostasis is also mostly inward-looking. It took the VSM to ask *where is the function that models the outside world?* and get the answer **nowhere**.

### The six policies

`model/vsm.mjs` builds the missing function. Every one uses hardware **already in `model/systems.mjs`** — none of it requires equipment the design does not have. What they need is a forecast and a decision to act on it early.

| Policy | Lead | The move |
|---|---|---|
| **Pre-storm charge** | 24–36 h | Charge the battery *while the grid is still there*. Raise the slab 3°F — the concrete spine is the only heat store that needs no electricity to keep working. Top the cistern so the gravity branch has full head. |
| **Islanded operation** | continuous | Shed loads in a declared order, not by tripping breakers. Protect the well pump and the septic pump — losing either ends occupancy faster than losing heat. Report **hours remaining**, not percent. |
| **Spring drought response** | days–weeks | Report the reserve as *days of use at the current rate*. Restrict outdoor taps first. Alert early enough that hauled water can be scheduled rather than emergency-ordered. |
| **Fire weather posture** | hours–days | Close the ERV outdoor damper and recirculate through the filter bank. Reserve a firefighting volume in the cistern with a draft connection. |
| **Snow load and access** | 12–48 h | Report accumulated roof load against the design value. Flag rain-on-snow. Clear the drive *before* the event — at 11% a plough cannot climb what it could have prevented. |
| **Seasonal solar anticipation** | hours | Pre-cool the slab on summer nights so 650 sf of south glass has somewhere to dump heat. Stop heating before a clear winter afternoon and let the glass do it. |

**All thresholds and lead times are ASSUMED.** They are the agenda for a commissioning conversation, not settings.

### Where the model still says this is not viable

| Level | Gap |
|---|---|
| S4 | **No environmental data source is specified.** Every policy above depends on a forecast. Which feed, and what the house does with none, is undesigned. A house that only anticipates when the internet is up has not solved the problem it was built for. |
| S4 | **The spring has no measurement and no tested yield.** Drought response cannot run. The house cannot model the one resource it cannot buy back quickly. |
| S1-ACCESS | **The drive exceeds the fire apparatus grade limit.** An operation whose failure mode is that emergency services cannot reach a physician's house. |
| S3 | **No load calculation exists.** S3 allocates capacity it has never counted. The systems are proven to *coexist*, not to *perform*. |
| S1-SHELTER | **The governing snow load is unverified.** Every structural member resizes if it changes. |
| S5 | **The breezeway contradicts the identity statement.** S5 says the house must work on the worst night of the year; the everyday route crosses 9 ft of unconditioned outdoors carrying groceries, a child, or a medical bag. Fire and CO separation argue for the gap. **Stated, not resolved.** |

---

## C. WHAT IT COSTS

`docs/05-what-is-wrong.md` B.7: *"there is not a single number anywhere in the package. That is the fastest way for a design like this to die."*

### Two kinds of number, and they are not the same kind

- **Quantities are DERIVED.** Square feet, cubic yards, linear feet of drive, square feet of glass — every one computed from the same model that draws the plans. Change the house and they change.
- **Unit costs are ASSUMED.** Every `$/unit` is a placeholder. This container has no outbound access; no supplier, no cost database, no local bid was consulted. **A Watauga County general contractor must replace all of them.**

Trust the takeoff. Distrust the money. Read the range, not the midpoint — a schematic estimate that reports one number is lying about how much it knows.

| Item | Quantity | Low | High |
|---|---:|---:|---:|
| HOUSE — heated, three levels + link *(excl. items below)* | 3,747 sf | $1,086,630 | $1,611,210 |
| GARAGE — detached, unheated | 576 sf | $80,640 | $126,720 |
| MAIN DECK | 576 sf | $51,840 | $92,160 |
| LOWER TERRACE | 576 sf | $31,680 | $54,720 |
| GLAZING — premium above shell allowance | 650 sf | $58,500 | $117,000 |
| CONCRETE SPINE — retains, carries, braces, stores heat | 984 sf | $83,640 | $147,600 |
| EARTHWORK — cut and fill placed | 6,682 CY | $93,548 | $173,732 |
| SPOIL — hauled off site | 6,403 CY | $140,866 | $288,135 |
| DRIVEWAY — 5 switchbacks at 11% | 655 LF | $72,050 | $157,200 |
| EROSION CONTROL — over the one-acre threshold | — | $12,000 | $34,000 |
| WASTEWATER — alternative system | — | $30,000 | $75,000 |
| WATER — spring, cistern, treatment | — | $18,000 | $42,000 |
| STANDBY POWER — battery + generator | — | $26,000 | $55,000 |
| MECHANICAL — heat pumps, ERV, hydronic | — | $34,000 | $68,000 |
| **CONSTRUCTION** | | **$1,819,394** | **$3,042,477** |
| Contingency @ 15% | | $272,909 | $456,372 |
| Design, engineering, survey, geotech, permits @ 12% | | $218,327 | $365,097 |
| **PROJECT RANGE** | | **$2,310,630** | **$3,863,946** |

**$617 – $1,031 per square foot** on 3,747 sf heated.

The `$/sf` line for the house **excludes** everything priced separately below it. A rate that already contains mechanical, glazing and foundations, added to separate lines for mechanical, glazing and foundations, counts them twice and reads as rigour.

### Not in the total

**$211,850 – $379,100.** If the geotechnical report says the 16.4 ft motor court cut will not stand at 1.5H:1V, it must be retained: 2,230 sf of engineered wall. The design lays the cut back instead. The number is written down so the choice is visible rather than discovered.

### The three lines that come from the ground, not the house

Earthwork, spoil, drive and erosion control together run **$318,464 – $653,067** — roughly **18% to 21% of construction cost, before a single wall is framed.**

On steep land the site is not a preliminary. It is a wing of the house you cannot see, and it is the part most likely to be under-budgeted, because it does not look like architecture.

---

## D. THE HONEST SUMMARY

Two numbers matter more than the rest:

1. **The drive holds 11%, and fire apparatus access commonly requires 10%.** Fixing it costs roughly 65 more feet of drive and the earthwork that comes with it. Not fixing it means an ambulance may not reach the house. This is a decision for Henry, and it should be made with the fire marshal in the room.

2. **6,403 CY of spoil, with no designed place to put it.** Sidecasting onto a 30% colluvial slope is how mountain fills fail. Either the design finds engineered fill locations with a geotechnical engineer's blessing, or roughly 536 tandem loads leave the site and the budget absorbs it.

Everything else on this sheet is a schematic proposition. Those two are the ones that decide whether it gets built.
