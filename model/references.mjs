// HENRY HOUSE — THE REFERENCE SET, AS MEASURABLE DATA.
//
// ─────────────────────────────────────────────────────────────────────────────
// WHAT THIS IS AND IS NOT
//
// The client's packs point at official Rural Studio / Front Porch and Olson
// Kundig pages by URL. THIS CONTAINER HAS NO OUTBOUND ACCESS, so none of those
// pages, PDFs or photographs were fetched, and nothing here is derived from
// seeing them. Every figure below comes from data that shipped INSIDE the
// packs: the Front Porch product-line CSV, and the schematic study cards.
//
// The schematic cards say so themselves — "SCHEMATIC STUDY ONLY, not an
// original Rural Studio drawing." So the plan diagrams are the pack author's
// reading of those houses, not the houses. The AREAS, FOOTPRINTS, PORCH AREAS
// and PERIMETERS are published product-line figures and are the solid part.
//
// The Olson Kundig entries carry no dimensions in the packs at all. Their
// published footprint areas are widely cited and are recorded here as ASSUMED,
// flagged, and never used in a scored comparison — only as a scale reminder.
//
// The images and drawings themselves remain the property of Rural Studio /
// Auburn University and Olson Kundig. Nothing is reproduced here.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The build-intelligence bar. These are real houses with published numbers,
 * which is exactly why they are useful: they can be beaten or lost to.
 */
export const FRONT_PORCH = [
  {
    id: 'DAVE', name: "Dave's House", br: 1, ba: 1,
    sf: 504, wFt: 14, dFt: 44, porchSf: 128, perimeterLf: 100,
    transfer: 'Narrow shotgun body; pier-and-beam option; simple spans; screened porch.',
    lesson: 'The strongest minimum linear module, and Front Porch explicitly names pier-and-beam as the slope-friendly foundation with minimal earthwork.',
    henryTest: 'Make a 2-4 bay Phase 1 compete directly with 504 sf of efficiency before allowing more house.',
    source: 'frontporch.ruralstudio.org — product line, figures published',
  },
  {
    id: 'MACARTHUR', name: "MacArthur's House", br: 1, ba: 1,
    sf: 536, wFt: 18, dFt: 38, porchSf: 100, perimeterLf: 120,
    transfer: 'Dogtrot logic; day/night rooms; rear porch intentionally sized for future bedroom enclosure.',
    lesson: 'The most literal "future bay" precedent: the porch is dimensioned so it can become a room.',
    henryTest: 'Can every future Henry room begin life as a useful porch, deck, undercroft or sheltered work bay?',
    source: 'frontporch.ruralstudio.org — product line, figures published',
  },
  {
    id: 'JOANNE', name: "Joanne's House", br: 1, ba: 1,
    sf: 529, wFt: 26, dFt: 29, porchSf: 204, perimeterLf: 104,
    transfer: 'A compact square maximises area against perimeter and kills corridor space.',
    lesson: 'The cost critic of the set. Nearly the same area as Dave behind almost the same perimeter, but square instead of linear — and a porch 60% larger.',
    henryTest: 'Every foot of exterior wall is envelope, insulation, cladding, flashing and heat loss, forever. What is the squarest Henry can be?',
    source: 'frontporch.ruralstudio.org — product line, figures published',
  },
  {
    id: 'SYLVIA21', name: "Sylvia's House 2/1", br: 2, ba: 1,
    sf: 856, wFt: 22, dFt: 48, porchSf: 206, perimeterLf: 140,
    transfer: 'Narrow two-bedroom; two shifted program volumes create end porches and remove the corridor.',
    lesson: 'THE MOST SITE-RELEVANT PRECEDENT IN THE SET. A product-line house actually adapted to a narrow, steeply sloped site in MADISON COUNTY, NORTH CAROLINA — two counties from Watauga, the same mountains, the same problem.',
    henryTest: 'How narrow can Henry become before it stops being generous? This says 22 ft, on a steep NC site, for two bedrooms.',
    source: 'frontporch.ruralstudio.org + Madison County case study',
    siteRelevant: true,
  },
  {
    id: 'SYLVIA22', name: "Sylvia's House 2/2", br: 2, ba: 2,
    sf: 1024, wFt: 24, dFt: 52, porchSf: 224, perimeterLf: 152,
    transfer: 'A larger state of the same grammar: one more bathroom inside the same structural and service logic.',
    lesson: 'Growth control. Adding a bath cost 168 sf and 12 lf of perimeter, not a new building.',
    henryTest: 'Can Henry add human capacity while preserving ONE structural and service grammar?',
    source: 'frontporch.ruralstudio.org — product line, figures published',
  },
  {
    id: 'SYLVIA32', name: "Sylvia's House 3/2", br: 3, ba: 2,
    sf: 1364, wFt: 28, dFt: 58, porchSf: 256, perimeterLf: 172,
    transfer: 'The mature state. Three bedrooms, two baths, still one bar, still one roof.',
    lesson: 'The best envelope efficiency in the product line at 0.126 lf per sf — and it is the BIGGEST house, because efficiency improves with area when the shape stays disciplined.',
    henryTest: 'This is a whole family in 1,364 sf. Henry is 3,747.',
    source: 'frontporch.ruralstudio.org — product line, figures published',
  },
];

/**
 * The visual and sectional bar. NO DIMENSIONS ARE PUBLISHED IN THE PACKS for
 * these, so the areas are widely-cited figures recorded as ASSUMED. They are
 * used as a reminder of scale, never as a scored comparison.
 */
export const VISUAL_BAR = [
  { id: 'SOLDUC', name: 'Sol Duc Cabin', sfAssumed: 350,
    operation: 'Lift the house clear of the ground, make the opening enormous, and let one roof and one frame do the work.',
    state: 'Closes completely. Resilience is an architectural STATE, not equipment hidden in a closet.',
    doNotCopy: 'The steel-plate palette and the hand-crank theatre.' },
  { id: 'VERMONT', name: 'Vermont Cabin', sfAssumed: 750,
    operation: 'A small vertical object in a mountain forest can still read as monumental and complete.',
    state: 'One open upper room, exposed timber, raw concrete, landscape on three sides.',
    doNotCopy: 'The specific material palette. Copy the compactness and the single great room.' },
  { id: 'LONGBRANCH', name: 'Cabin at Longbranch', sfAssumed: null,
    operation: 'A house that literally grew over decades while preserving and revealing its earlier phases.',
    state: 'Cheap-looking components do not require cheap architecture; repetition and age do the work.',
    doNotCopy: 'Nothing formal — this is the phasing conscience of the visual bar.' },
  { id: 'KNOBHILL', name: 'Knob Hill', sfAssumed: null,
    operation: 'Concrete rooted into the slope carrying a lightweight inhabited volume above.',
    state: 'Judged against snow, topography and distance rather than a street elevation.',
    doNotCopy: 'Use as a SECTIONAL bar, not a size bar.' },
];

// ── DERIVED BARS ────────────────────────────────────────────────────────────
/**
 * The numbers a scheme actually has to beat, computed from the product line
 * rather than chosen. This is the difference between a reference and a bar.
 */
export function bars() {
  const rows = FRONT_PORCH.map(r => ({
    ...r,
    perimeterPerSf: +(r.perimeterLf / r.sf).toFixed(3),
    porchRatio: +(r.porchSf / r.sf).toFixed(3),
    sfPerBedroom: Math.round(r.sf / r.br),
    aspect: +(Math.max(r.wFt, r.dFt) / Math.min(r.wFt, r.dFt)).toFixed(2),
  }));
  const best = (k, dir = 'lo') => rows.reduce((a, b) => (dir === 'lo' ? (b[k] < a[k] ? b : a) : (b[k] > a[k] ? b : a)));
  return {
    rows,
    ENVELOPE: { value: best('perimeterPerSf').perimeterPerSf, holder: best('perimeterPerSf').name,
      what: 'PERIMETER PER CONDITIONED SF', dir: 'lo',
      why: 'Exterior wall is envelope, insulation, cladding, flashing, air-sealing and heat loss — forever. This is the cheapest published ratio in the product line.' },
    PORCH: { value: best('porchRatio', 'hi').porchRatio, holder: best('porchRatio', 'hi').name,
      what: 'SHELTERED SF PER CONDITIONED SF', dir: 'hi',
      why: 'Roofed outdoor room is the cheapest square footage in the set, and on this site it is also the future-bay territory.' },
    GENEROSITY: { value: best('sfPerBedroom', 'hi').sfPerBedroom, holder: best('sfPerBedroom', 'hi').name,
      what: 'CONDITIONED SF PER BEDROOM', dir: 'hi',
      why: 'A crude but honest proxy for whether a small house is still generous rather than merely small.' },
    SCALE: { value: Math.max(...rows.map(r => r.sf)), holder: best('sf', 'hi').name,
      what: 'LARGEST HOUSE IN THE PRODUCT LINE', dir: null,
      why: 'A whole family, three bedrooms and two baths. Any Henry scheme far above this is making a claim it has to justify.' },
    NARROWEST_STEEP: { value: FRONT_PORCH.find(r => r.siteRelevant).wFt, holder: 'Sylvia 2/1, Madison County NC',
      what: 'BODY WIDTH ON A STEEP NC SITE', dir: null,
      why: 'The only precedent in the set built on the same kind of ground. It answers "how narrow?" with a measured 22 ft.' },
  };
}

/** Front Porch, as a single comparable row for the gauntlet table. */
export function productLineSummary() {
  const b = bars();
  const tot = b.rows.reduce((a, r) => ({ sf: a.sf + r.sf, p: a.p + r.perimeterLf, porch: a.porch + r.porchSf }),
    { sf: 0, p: 0, porch: 0 });
  return {
    houses: b.rows.length,
    sfRange: [Math.min(...b.rows.map(r => r.sf)), Math.max(...b.rows.map(r => r.sf))],
    meanPerimeterPerSf: +(tot.p / tot.sf).toFixed(3),
    meanPorchRatio: +(tot.porch / tot.sf).toFixed(3),
    widthRange: [Math.min(...b.rows.map(r => Math.min(r.wFt, r.dFt))), Math.max(...b.rows.map(r => Math.min(r.wFt, r.dFt)))],
  };
}

export const PROVENANCE = {
  fetched: false,
  note: 'No reference page, PDF or photograph was retrieved. This container has no outbound network access. Every Front Porch figure here shipped inside the client packs as CSV or on a schematic card that labels itself a study rather than an original drawing. Olson Kundig areas are widely-cited and marked ASSUMED; they are never scored.',
  verify: 'Before any of this is used to justify a design decision, check the figures against the official Front Porch product pages and plan PDFs listed in refs/manifests/.',
};

export default { FRONT_PORCH, VISUAL_BAR, bars, productLineSummary, PROVENANCE };
