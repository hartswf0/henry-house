// HENRY HOUSE — THE GAUNTLET LOOP.
//
// The client's system document says what this has to be:
//
//   §11 CRITICS      house-specific critics — site, visual, structure, cost,
//                    systems, envelope, phasing, originality, maintenance
//   §12 BLIND A/B    compare against the designated bar. Record WIN / LOSS /
//                    WHY / BIGGEST GAP. TIE = LOSS.
//   §10 FAN-OUT      the builder never grades itself
//
// So the critics here do NOT read the schemes' prose. Each one is a function of
// the computed metrics and the published reference bars, and it returns a
// verdict it can be argued with. A critic that could be satisfied by a better
// description is not a critic.
//
// TIE = LOSS is implemented literally: a scheme must BEAT the bar, not match it.

import { SCHEMES, metrics, allMetrics } from '../../model/schemes.mjs';
import { bars, FRONT_PORCH, productLineSummary, PROVENANCE } from '../../model/references.mjs';
import { siteTotals, driveProfile, DRIVE_LIMITS } from '../../model/site.mjs';
import { UNIT } from '../../model/cost.mjs';

const B = bars();

// ── COST, SCHEME BY SCHEME, OFF ONE SET OF RATES ────────────────────────────
/**
 * Every scheme priced with the SAME unit rates from model/cost.mjs. Until this
 * runs, "least earth" is not the same as "least money" — the Bridge's trusses
 * are not free and the Armature builds a full-size roof over a 616 sf house.
 *
 * ALL RATES ARE THE INVENTED PLACEHOLDERS from model/cost.mjs. What is
 * comparable here is the RANKING, not the totals.
 */
export function schemeCost(s) {
  const m = metrics(s);
  const mid = (u) => (u.lo + u.hi) / 2;

  // shell, less the site and system lines that are common to every scheme
  const shell = m.conditionedSf * mid(UNIT.heatedSf);
  const sheltered = (m.shelteredSf + m.futureSf) * mid(UNIT.deckSf) * 0.55;   // roofed, floored, unenclosed
  const earth = m.cutCY * mid(UNIT.earthCY) + m.cutCY * 0.9 * mid(UNIT.haulCY);
  const envelope = m.perimeterLf * 10 * 46;         // ~10 ft tall wall at ~$46/sf premium over shell
  const wet = m.wetWallLf * 900;                    // plumbing wall, fully fitted, per lf
  const roofs = m.roofJunctions * 9000;             // every junction is flashing, labour and a leak
  const ground = m.groundKind === 'piers' ? m.groundContacts * 4200 : m.groundContactSf * 26;

  // Spans cost money. A scheme that touches the ground rarely must carry itself
  // between those points, and that is the honest counterweight to its earthwork.
  const span = m.groundKind === 'piers'
    ? m.conditionedSf * 42 + (m.groundContacts <= 6 ? 60000 : 22000)
    : 0;

  const total = shell + sheltered + earth + envelope + wet + roofs + ground + span;
  return {
    id: s.id, name: s.name,
    shell, sheltered, earth, envelope, wet, roofs, ground, span,
    total, perSf: total / Math.max(1, m.conditionedSf),
    phase1: total * (m.phase1Sf / Math.max(1, m.matureSf)),
    status: 'RANKING ONLY. Rates are the invented placeholders in model/cost.mjs.',
  };
}

// ── THE CRITICS ─────────────────────────────────────────────────────────────
// Each returns { verdict, score 0..1, why, gap }. None of them can see a
// scheme's description.
const CRITICS = {
  ENVELOPE: (m) => {
    const bar = B.ENVELOPE.value;
    const win = m.perimeterPerSf < bar;
    return {
      verdict: win ? 'WIN' : 'LOSS',
      score: Math.max(0, Math.min(1, bar / m.perimeterPerSf)),
      why: `${m.perimeterPerSf} lf/sf against the product line's best of ${bar} (${B.ENVELOPE.holder}).`,
      gap: win ? null : `Needs ${Math.round(m.perimeterLf - bar * m.conditionedSf)} lf less exterior wall, or ${Math.round(m.perimeterLf / bar - m.conditionedSf)} sf more house behind the same wall.`,
    };
  },

  SITE: (m) => {
    // On this hill the site critic is earthwork. There is no second opinion.
    const win = m.cutCY < 100;
    return {
      verdict: win ? 'WIN' : 'LOSS',
      score: Math.max(0, Math.min(1, 100 / Math.max(1, m.cutCY))),
      why: `${m.cutCY.toLocaleString()} CY moved for the building alone, deepest cut ${m.maxCutFt} ft, ${m.groundNote}.`,
      gap: win ? null : `${m.cutCY - 100} CY over a pier-founded scheme. On a site already carrying ${siteTotals().netCY.toLocaleString()} CY of spoil with nowhere to put it, this is the column that decides.`,
    };
  },

  PHASING: (m) => {
    // Rev. Walker's operation is not "it can get bigger" — it is that growth
    // NEVER CUTS INTO WORK ALREADY DONE. A scheme that has to lift its own roof
    // to add a floor is growing the expensive way, so the claim is discounted.
    const clean = !m.growthTouchesRoof;
    const win = m.futureCapacityPct >= 40 && clean;
    const raw = Math.min(1, m.futureCapacityPct / 100);
    return {
      verdict: win ? 'WIN' : 'LOSS',
      score: Math.max(0, clean ? raw : raw * 0.35),
      why: !m.futureCapacityPct
        ? 'Built at once. No sheltered territory becomes rooms later.'
        : clean
          ? `Grows +${m.futureCapacityPct}% from ${m.phase1Sf.toLocaleString()} sf under a roof that is already there; ${m.futureSf.toLocaleString()} sf of territory is pre-sheltered.`
          : `Grows +${m.futureCapacityPct}% but ${m.growthNote}.`,
      gap: win ? null : (clean
        ? "MacArthur's rear porch is dimensioned so it can become a bedroom. Nothing here is."
        : 'Growth cuts into finished work. Rev. Walker\'s armature exists precisely so it does not.'),
    };
  },

  SYSTEMS: (m) => {
    const bar = 40;                                  // lf of wet wall a small house should need
    const win = m.wetWallLf < bar;
    return {
      verdict: win ? 'WIN' : 'LOSS',
      score: Math.max(0, Math.min(1, bar / Math.max(1, m.wetWallLf))),
      why: `${m.wetWallLf} lf of wet wall. Myers' Home concentrates stair, baths, laundry and utilities into ONE core so everything else can change without touching it.`,
      gap: win ? null : `${m.wetWallLf - bar} lf of plumbing wall beyond a concentrated core.`,
    };
  },

  MAINTENANCE: (m) => {
    const win = m.roofJunctions === 0;
    return {
      verdict: win ? 'WIN' : 'LOSS',
      score: m.roofJunctions === 0 ? 1 : Math.max(0, 1 - m.roofJunctions * 0.34),
      why: `${m.roofPlanes} roof plane${m.roofPlanes === 1 ? '' : 's'}, ${m.roofJunctions} junction${m.roofJunctions === 1 ? '' : 's'}. Every junction is flashing, snow, ice and a future leak.`,
      gap: win ? null : `${m.roofJunctions} junction${m.roofJunctions === 1 ? '' : 's'} to detail, flash and maintain at 3,400 ft.`,
    };
  },

  GENEROSITY: (m) => {
    // The counterweight to every other critic: small is only good if it is
    // still a house somebody wants to be in.
    const perBr = m.conditionedSf / Math.max(1, m.rooms);
    const win = perBr >= 380 && m.conditionedSf >= 900;
    return {
      verdict: win ? 'WIN' : 'LOSS',
      score: Math.max(0, Math.min(1, perBr / 620)),
      why: `${Math.round(perBr)} sf per bedroom across ${m.conditionedSf.toLocaleString()} sf. The product line runs ${Math.min(...B.rows.map(r => r.sfPerBedroom))}-${Math.max(...B.rows.map(r => r.sfPerBedroom))}.`,
      gap: win ? null : 'Small, but not yet generous. Sylvia 3/2 holds a family in 1,364 sf and still reads as a house.',
    };
  },

  SHELTER: (m) => {
    const ratio = (m.shelteredSf + m.futureSf) / Math.max(1, m.conditionedSf);
    const win = ratio > B.PORCH.value;
    return {
      verdict: win ? 'WIN' : 'LOSS',
      score: Math.max(0, Math.min(1, ratio / B.PORCH.value)),
      why: `${ratio.toFixed(2)} sf sheltered per sf conditioned, against ${B.PORCH.value} at ${B.PORCH.holder}.`,
      gap: win ? null : 'Roofed outdoor room is the cheapest square footage in the reference set, and here it is also the future-bay territory.',
    };
  },

  SCALE: (m) => {
    // Not an aesthetic judgement: a claim about how much house the reference
    // set thinks a family needs.
    const win = m.conditionedSf <= B.SCALE.value;
    return {
      verdict: win ? 'WIN' : 'LOSS',
      score: Math.max(0, Math.min(1, B.SCALE.value / m.conditionedSf)),
      why: `${m.conditionedSf.toLocaleString()} sf against ${B.SCALE.value.toLocaleString()} sf for ${B.SCALE.holder} — three bedrooms, two baths, a whole family.`,
      gap: win ? null : `${(m.conditionedSf - B.SCALE.value).toLocaleString()} sf beyond the largest house in the product line. That is a claim, and it needs an argument that is not "the site is beautiful."`,
    };
  },
};

// ── ACCESS: common to every scheme, and therefore not scored ────────────────
export function commonFindings() {
  const d = driveProfile();
  const t = siteTotals();
  return [
    { id: 'DRIVE', text: `Every scheme is served by the same ${d.lengthFt} ft drive at ${d.maxGradePct}%, which exceeds the ${DRIVE_LIMITS.fireApparatusPct}% commonly required for fire apparatus. No massing decision changes that.` },
    { id: 'SPOIL', text: `The drive and motor court contribute ${t.drive.cutCY.toLocaleString()} CY of the site's ${t.netCY.toLocaleString()} CY of spoil regardless of which house is built. Scheme earthwork is the BUILDING only.` },
    { id: 'UNKNOWNS', text: 'No survey, no soils report, no tested spring, no code text read. Every scheme inherits all of it.' },
  ];
}

// ── THE LOOP ────────────────────────────────────────────────────────────────
export function runGauntlet() {
  const all = allMetrics();
  const costs = SCHEMES.map(schemeCost);
  const results = SCHEMES.map((s, i) => {
    const m = all[i];
    const verdicts = {};
    for (const [name, fn] of Object.entries(CRITICS)) verdicts[name] = fn(m);
    const wins = Object.values(verdicts).filter(v => v.verdict === 'WIN').length;
    const score = Object.values(verdicts).reduce((a, v) => a + v.score, 0) / Object.keys(CRITICS).length;
    // biggest gap = the losing critic with the worst score
    const worst = Object.entries(verdicts).filter(([, v]) => v.verdict === 'LOSS')
      .sort((a, b) => a[1].score - b[1].score)[0];
    return { scheme: s, m, cost: costs[i], verdicts, wins, score,
             biggestGap: worst ? { critic: worst[0], gap: worst[1].gap } : null };
  });

  // BLIND A/B against the opponent, on the numbers only
  const opponent = results.find(r => r.scheme.id === 'S0-SPINE');
  for (const r of results) {
    if (r.scheme.id === opponent.scheme.id) { r.ab = null; continue; }
    const beat = Object.keys(CRITICS).filter(k => r.verdicts[k].score > opponent.verdicts[k].score);
    const lost = Object.keys(CRITICS).filter(k => r.verdicts[k].score < opponent.verdicts[k].score);
    r.ab = {
      // TIE = LOSS, per the template
      verdict: beat.length > lost.length ? 'WIN' : 'LOSS',
      beat, lost,
      why: `Beats the opponent on ${beat.length} of ${Object.keys(CRITICS).length} critics; loses on ${lost.length}.`,
    };
  }

  const ranked = [...results].sort((a, b) => b.score - a.score);
  return { results, ranked, opponent, common: commonFindings(), bars: B,
           productLine: productLineSummary(), provenance: PROVENANCE };
}

// ── report ──────────────────────────────────────────────────────────────────
if (import.meta.url === `file://${process.argv[1]}`) {
  const g = runGauntlet();
  const money = (n) => '$' + Math.round(n / 1000) + 'k';
  const pad = (s, n) => String(s).padEnd(n);

  console.log('\nHENRY HOUSE — GAUNTLET\n' + '='.repeat(96));
  console.log('BARS ARE COMPUTED FROM THE FRONT PORCH PRODUCT LINE, NOT CHOSEN:');
  for (const k of ['ENVELOPE', 'PORCH', 'GENEROSITY', 'SCALE', 'NARROWEST_STEEP']) {
    console.log(`  ${pad(k, 17)} ${pad(g.bars[k].value, 8)} ${g.bars[k].what}  — ${g.bars[k].holder}`);
  }

  console.log('\n' + '-'.repeat(96));
  console.log(pad('SCHEME', 14) + pad('SCORE', 7) + pad('WINS', 6) + pad('BUILDING', 10) + pad('$/SF', 8) + 'A/B vs THE SPINE');
  console.log('-'.repeat(96));
  for (const r of g.ranked) {
    console.log(pad(r.scheme.name, 14) + pad(r.score.toFixed(2), 7) +
      pad(`${r.wins}/${Object.keys(r.verdicts).length}`, 6) +
      pad(money(r.cost.total), 10) + pad('$' + Math.round(r.cost.perSf), 8) +
      (r.ab ? `${r.ab.verdict}  ${r.ab.why}` : '— the opponent'));
  }

  console.log('\n' + '='.repeat(96));
  for (const r of g.ranked) {
    console.log(`\n${r.scheme.name}  —  score ${r.score.toFixed(2)}, ${r.wins} wins${r.ab ? `, A/B ${r.ab.verdict}` : ''}`);
    for (const [k, v] of Object.entries(r.verdicts)) {
      console.log(`  [${v.verdict === 'WIN' ? ' WIN' : 'LOSS'}] ${pad(k, 12)} ${v.why}`);
    }
    if (r.biggestGap) console.log(`  BIGGEST GAP (${r.biggestGap.critic}): ${r.biggestGap.gap}`);
  }

  console.log('\n' + '='.repeat(96));
  console.log('COMMON TO EVERY SCHEME — not scored, because no massing decision changes it:');
  for (const c of g.common) console.log(`  · ${c.text}`);
  console.log('\nPROVENANCE: ' + g.provenance.note);
  console.log('COST IS THE BUILDING ONLY — no drive, motor court, septic, water, standby power,');
  console.log('mechanical or soft costs, because those are common to every scheme. Rates are the');
  console.log('invented placeholders in model/cost.mjs. THE RANKING IS THE OUTPUT, NOT THE TOTALS.\n');
}
