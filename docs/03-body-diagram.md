# 03 — THE BODY DIAGRAM

*The house works like a body.* The test of this idea is not whether the house can be **described** anatomically — anything can. The test is whether the analogy **produced decisions a conventional design would not have made.**

Below, each system is listed with the decision the analogy forced, and — the honest column — whether that decision is genuinely better or merely a nice story. Where the analogy produced nothing, that is recorded too.

---

## 1. SKELETON — Structure

**The anatomy:** A skeleton is not a cage of equal members. It is a **spine** that carries the axial load to the ground, with **ribs** hanging off it. Loads do not wander; every one has a short, direct path down.

**What it produced:** A single reinforced-concrete **spine wall** along the uphill face doing four jobs at once — retaining the cut, carrying the uphill end of every rib, resisting lateral load, and acting as thermal mass. Transverse **ribs** at 12'-0" o.c. run from the spine down to the downhill column line.

**Why this is genuinely better:** On a steep site you are *forced* to build a retaining wall. The conventional move builds the retaining wall **and then** a separate structural frame in front of it, paying twice. Making the retaining wall the primary structure is the cheapest possible way to build here. The rule that follows — *no rib is supported by another rib; every load line reaches its own footing* — is the spine's discipline applied as a design constraint.

**Verdict: real.** It changed the structural scheme and reduced cost.

---

## 2. CIRCULATION — Water

**The anatomy:** One heart. Arteries branch under pressure from a single pump; veins converge by gravity. Arterial and venous never mix. Perfusion of critical organs is preserved when pressure drops.

**What it produced:**
- **One plant room, "The Heart"** — a real 122 SF conditioned room, not a closet. Pressure tank, filtration, water heater, ERV, electrical, battery and manifold in one place. The reference plan gives this a closet; that is the single biggest functional failure in it.
- **Home-run PEX manifold distribution** — a true arterial tree from one point, not a series loop. Shorter runs mean less water wasted waiting for hot.
- **A gravity reflex.** The cistern sits ~22 ft above the main floor, giving ~9.5 psi of static head. One dedicated cold tap and one toilet are fed on a **gravity branch that bypasses the pump entirely.** When the power fails, the house still has drinking water and one working toilet with no pump, no battery and no generator.

**Why the last one matters:** That is the body preserving cerebral perfusion when systemic pressure collapses. It is also the correct answer for a house that will lose power in ice storms, and it costs one pipe and one valve.

**Verdict: real.** The gravity branch would not have occurred to a conventional design.

---

## 3. DIGESTION / EXCRETION — Waste

**The anatomy:** Intake at the top, excretion at the bottom, never crossing. Staged processing, not one chamber. Anaerobic first, then aerobic.

**What it produced:** A strict topological rule — **water enters uphill, waste leaves downhill, and the two networks never cross in plan or section.** Staged treatment: septic tank (anaerobic) → effluent filter → pump tank → pressure-dosed dispersal.

**The non-obvious consequence:** On steep land the ground below the house is often *too* steep to accept a dispersal field. The likely answer is **pumping effluent uphill** to a gentler bench — which inverts the usual gravity logic and must be designed for, since a pump failure now means sewage backs up rather than merely stops. Hence a high-water float alarm that is **hardwired and audible**, not an app notification.

**Verdict: real for the topology rule; the uphill dispersal is a genuine mountain-specific move.** But note: whether *any* field is permittable here is unknown (`01-site-facts-register.md` A-15), and no analogy can answer that.

---

## 4. RESPIRATION — HVAC

**The anatomy:** The airway is **separate** from the digestive tract. The nose conditions and filters incoming air. You do not re-breathe stale air. Breathing is continuous and low-effort; exertion is intermittent.

**What it produced:** **Ventilation is decoupled from conditioning.** A balanced ERV with its own dedicated ductwork supplies fresh air to bedrooms and living space and exhausts from baths, laundry and mudroom — continuously, at low volume. Heating and cooling is a separate system (zoned heat pumps) that runs intermittently as load demands.

**Why this is genuinely better:** The common alternative — dumping fresh air into the return of a furnace — only ventilates when the furnace runs, which in a well-insulated house is rarely. Separating them is best practice, and the analogy arrives at it directly rather than by argument.

**A second consequence:** the tall great room's stack effect is the body's own thermosiphon. Rather than fighting it, the clerestory gets **operable units at the high end** so the volume can dump heat deliberately in summer.

**Verdict: real.** The lungs/gut separation is the clearest case in the project of the analogy producing correct engineering.

---

## 5. NERVOUS SYSTEM — Electrical and data

**The anatomy:** A brain, a spinal cord, peripheral nerves — and critically, **reflex arcs that operate without the brain.** You withdraw your hand before you know you've been burned.

**What it produced:** The brain (panel, inverter, controller) in The Heart; the spinal cord as a single vertical chase in The Gallery; branch circuits as peripheral nerves. And then the important part — **reflexes that work when the network is down:**

| Reflex | Sensor | Actuator | Independent of |
|---|---|---|---|
| Leak → isolate | leak sensors at Heart, laundry, baths | motorised main shutoff | internet, cloud, phone |
| Freeze → alarm + heat | freeze stat in The Heart | local alarm + heat | internet |
| Septic high water → alarm | float in pump tank | hardwired audible + light | internet |

**Why this matters here:** A mountain house is unoccupied for stretches and loses connectivity routinely. Any safety function that depends on a working internet connection is not a safety function. The analogy states the requirement more sharply than "add smart home features" ever would.

**Verdict: real.** "Reflex arc" is a design specification, not a metaphor.

---

## 6. SKIN — Envelope

**The anatomy:** Skin is **continuous**. It is breached only at controlled openings. It sheds water outward and lets vapour out. Where it is broken, you get a lesion; where circulation fails, you get frostbite.

**What it produced:**
- **The pen test.** The air/water barrier must be traceable on any section drawing without lifting the pen. If you cannot, the detail is wrong. This is a checkable criterion, not a slogan — and it is enforced in `tools/check/`.
- **Thermal bridges are lesions.** Continuous exterior mineral wool outboard of the framing, so no stud crosses the barrier. Every point where structure penetrates skin (deck ledgers, the entry bridge) is treated as a detail requiring a thermal break.
- **Rainscreen = the ability to dry.** A drained, vented cavity behind the cladding.

**Verdict: real for the pen test**, which converts a vague intention into a pass/fail check. The rest is good practice the analogy describes well but did not invent.

---

## 7. HOMEOSTASIS — Storage, backup, control

**The anatomy:** A body buffers everything — glycogen, fat, blood oxygen. It maintains a narrow internal range against a wide external one. And it has a graceful failure sequence: shivering before hypothermia.

**What it produced:** Buffers on every input, and an explicit **degradation ladder** rather than a binary works/fails:

| Input | Buffer | If the buffer runs out |
|---|---|---|
| Water | cistern (days of storage) | gravity branch still delivers drinking water |
| Power | battery → standby generator → critical-loads panel | wood stove, gravity water, gravity drains |
| Heat | thermal mass of spine + slab | wood stove with dedicated outside air = the shivering response |
| Access | pantry, gear storage, generator fuel | the house is habitable while the road is ice |

**Verdict: real.** The degradation ladder is the most useful thing the analogy produced, because it forces the question the brief demanded of every line: *what happens when it fails?*

---

## WHERE THE ANALOGY FAILED

Recorded honestly, because a framework that explains everything explains nothing:

- **It gave no help with daylight, view, proportion or the experience of arrival.** Bodies are not designed for delight. The Gallery, the compression toward the view, and the clerestory come from architecture, not anatomy.
- **It nearly produced a mistake.** "Skin sheds outward" suggested shedding snow away from the building — which drove a snow apron that turned out to sit underneath the main deck. A 4'-0" overhang cannot throw snow past a 12'-0" deck. The correction (retain snow over occupied surfaces, shed only where nothing is below) came from *checking the drawing*, not from the metaphor. See the commit history.
- **It says nothing about cost**, which is the constraint most likely to reshape this house.

The analogy is a good generator and a poor judge. It is used here to produce decisions, and the drawings and checks are used to test them.
