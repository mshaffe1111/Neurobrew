/*ENGINE_START*/
(function(G){
'use strict';
if (typeof G.window === 'undefined') G.window = G;

/* ==========================================================================
 * 02-methods-grinders-water-pk.js
 * BeanTelligence v6.0 — Single-Source-of-Truth Scientific Registries:
 *   1. EPISTEMIC_TIERS_V6 (4 canonical badges, zero Unicode emojis)
 *   2. Core Coffee Taxonomy & Pure Unit/Math Helpers
 *   3. FILTERS_V6 (16 canonical media) + FILTERS (70 retail filter mappings)
 *   4. METHOD_PHYSICS_V6 (23 canonical methods) + METHODS (22) + MACHINES (1)
 *   5. GRINDERS (48 canonical grinders + 7 flagship curve aliases) + Calibration
 *   6. WATER_PRESETS_UNIFIED + IUPAC 2021 8-Reagent + pH 5.0 Citrate Speciation
 *   7. AGTRON_V6 5-Scale Translator (M-Basic II + PCHIP Tonino(63.0) === 105.0)
 *   8. 7-Species + Low-Caf Varietal Caffeine, Infinite Periodic Bateman PK &
 *      Borbely 24h Process C/S + Elmenhorst (2012) A1AR IC50 = 13 mg/L
 *   9. Unified Freshness Windows & 12.3x (-18C, Ea = 40.1 kJ/mol) Cryo-Vault
 * ========================================================================== */

const clampNum = (v, lo, hi, fb) => {
  const n = typeof v === 'number' ? v : parseFloat(v);
  if (!isFinite(n)) return fb !== undefined ? fb : lo;
  return n < lo ? lo : n > hi ? hi : n;
};
const rnd = (x, d) => {
  const n = +x;
  if (!isFinite(n)) return 0;
  const p = Math.pow(10, d || 0);
  return Math.round((n + 1e-12) * p) / p;
};
const r5 = x => Math.round((+x || 0) * 2) / 2;
const fToC = f => ((+f || 32) - 32) * 5 / 9;
const cToF = c => (+c || 0) * 9 / 5 + 32;
const G_PER_OZ = 28.349523125;

const norm = s => String(s == null ? '' : s).toLowerCase().normalize ? String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : String(s == null ? '' : s).toLowerCase();
const escRe = s => String(s == null ? '' : s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const labelOf = (list, v) => {
  if (!Array.isArray(list)) return '';
  const hit = list.find(x => x && (x.v === v || x.key === v));
  return hit ? (hit.label || hit.name || '') : '';
};
const fmtTime = secs => {
  const s = Math.max(0, Math.round(+secs || 0));
  if (s >= 3600) {
    const h = Math.floor(s / 3600), m = Math.round((s % 3600) / 60);
    return m > 0 ? (h + 'h ' + m + 'm') : (h + 'h');
  }
  const m = Math.floor(s / 60), r = s % 60;
  return m + ':' + (r < 10 ? '0' + r : r);
};
const fmtRatio = r => '1:' + (Math.abs(r - Math.round(r)) < 0.05 ? Math.round(r) : rnd(r, 1));
const fmtNum = (x, d) => {
  const v = rnd(x, d == null ? 1 : d);
  return String(v);
};
const validIsoDate = s => {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const p = s.split('-').map(Number);
  if (p[1] < 1 || p[1] > 12 || p[2] < 1 || p[2] > 31) return false;
  const dt = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
  return dt.getUTCFullYear() === p[0] && (dt.getUTCMonth() + 1) === p[1] && dt.getUTCDate() === p[2];
};
const daysSinceRoast = (iso, now) => {
  if (!validIsoDate(iso)) return null;
  const p = iso.split('-').map(Number);
  const t0 = Date.UTC(p[0], p[1] - 1, p[2]);
  const n = now instanceof Date ? now : (validIsoDate(String(now || '')) ? new Date(String(now) + 'T12:00:00Z') : new Date());
  const t1 = Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate());
  const d = Math.round((t1 - t0) / 86400000);
  return d >= -1 ? Math.max(0, d) : null;
};

function lev(a, b){
  a = String(a || ''); b = String(b || '');
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++){
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++){
      const tmp = dp[j];
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
      prev = tmp;
    }
  }
  return dp[n];
}
function levWithin(a, b, maxD){
  if (Math.abs(String(a || '').length - String(b || '').length) > maxD) return maxD + 1;
  return lev(a, b);
}

function attachByKey(arr, keyProp){
  arr.forEach(item => {
    const k = item && item[keyProp];
    if (k && !(k in arr)) {
      Object.defineProperty(arr, k, { value: item, enumerable: false, configurable: true });
    }
  });
  return arr;
}

/* ---------- 1. Canonical 4-Badge Epistemic Taxonomy (Rule #5 & #6) ---------- */
const EPISTEMIC_TIERS_V6 = {
  verified_science: {
    key: 'verified_science',
    badge: '[Verified Science]',
    short: 'Verified Science',
    cls: 'ep-verified',
    icon: 'epistemic-verified',
    dots: 3,
    grade: 'A',
    desc: 'Replicated peer-reviewed chemistry, thermodynamics, genomics, clinical meta-analyses, or adopted international standards (IUPAC, ICUMSA SPS-3, IAPWS, SCA-102/103/104, 21 CFR).'
  },
  active_research: {
    key: 'active_research',
    badge: '[Active Research]',
    short: 'Active Research',
    cls: 'ep-model',
    icon: 'epistemic-research',
    dots: 2,
    grade: 'A/B',
    desc: 'Mechanistic transport models or peer-reviewed sensory/biophysical studies where parameters depend on cultivar, equipment geometry, or consumer cluster.'
  },
  craft_convention: {
    key: 'craft_convention',
    badge: '[Craft Best Practice]',
    short: 'Craft Best Practice',
    cls: 'ep-convention',
    icon: 'epistemic-craft',
    dots: 2,
    grade: 'B/C',
    desc: 'Proven specialty roaster and barista workflow or starting heuristic where controlled blind trials do not isolate a single universal optimum.'
  },
  myth_debunked: {
    key: 'myth_debunked',
    badge: '[Myth Debunked]',
    short: 'Myth Debunked',
    cls: 'ep-myth',
    icon: 'epistemic-myth',
    dots: 0,
    grade: 'A',
    desc: 'Popular coffee claim contradicted by controlled human trials, conservation of mass/energy, or analytical measurement.'
  }
};
/* Map aliases 1-to-1 onto canonical 4-tier system */
EPISTEMIC_TIERS_V6.verified_physics = EPISTEMIC_TIERS_V6.verified_science;
EPISTEMIC_TIERS_V6.calibrated_biophysics = EPISTEMIC_TIERS_V6.active_research;
EPISTEMIC_TIERS_V6.nuanced_research = EPISTEMIC_TIERS_V6.active_research;
EPISTEMIC_TIERS_V6.empirical_model = EPISTEMIC_TIERS_V6.active_research;
EPISTEMIC_TIERS_V6.solid = EPISTEMIC_TIERS_V6.verified_science;
EPISTEMIC_TIERS_V6.partly = EPISTEMIC_TIERS_V6.active_research;
EPISTEMIC_TIERS_V6.practice = EPISTEMIC_TIERS_V6.craft_convention;
EPISTEMIC_TIERS_V6.craft_best_practice = EPISTEMIC_TIERS_V6.craft_convention;
EPISTEMIC_TIERS_V6.sensory_craft = EPISTEMIC_TIERS_V6.craft_convention;
EPISTEMIC_TIERS_V6.not = EPISTEMIC_TIERS_V6.myth_debunked;

function epistemicBadgeFor(tierKey){
  return EPISTEMIC_TIERS_V6[tierKey] || EPISTEMIC_TIERS_V6.craft_convention;
}
const EPISTEMIC_META = {
  verified_science: EPISTEMIC_TIERS_V6.verified_science,
  verified_physics: EPISTEMIC_TIERS_V6.verified_science,
  calibrated_biophysics: EPISTEMIC_TIERS_V6.active_research,
  nuanced_research: EPISTEMIC_TIERS_V6.active_research,
  active_research: EPISTEMIC_TIERS_V6.active_research,
  craft_convention: EPISTEMIC_TIERS_V6.craft_convention,
  myth_debunked: EPISTEMIC_TIERS_V6.myth_debunked
};
function EVD(grade, text, tier){
  const tk = tier || (grade === 'A' ? 'verified_science' : grade === 'B' ? 'active_research' : 'craft_convention');
  const meta = epistemicBadgeFor(tk);
  return { grade: grade || meta.grade, text: text || '', tier: meta.key, badge: meta.badge };
}

/* ---------- 2. Core Bean & Setup Taxonomy ---------- */
const ROASTS = [
  { v:'ultra-light', label:'Ultra-light', fullLabel:'Ultra-Light / Nordic', sw:'--r0', hex:'#DFBA82', agtron:'86-100', agMid:91, tempC:98, tempF:208, taste:'Floral & tea-like' },
  { v:'light', label:'Light', fullLabel:'Light', sw:'--r1', hex:'#C68B53', agtron:'74-85', agMid:79, tempC:96, tempF:205, taste:'Bright & fruity' },
  { v:'medium-light', label:'Medium-light', fullLabel:'Medium-Light', sw:'--r2', hex:'#A16435', agtron:'64-73', agMid:68, tempC:94, tempF:201, taste:'Sweet & vibrant' },
  { v:'medium', label:'Medium', fullLabel:'Medium', sw:'--r3', hex:'#7A4624', agtron:'53-63', agMid:58, tempC:92, tempF:198, taste:'Balanced & round' },
  { v:'medium-dark', label:'Medium-dark', fullLabel:'Medium-Dark', sw:'--r4', hex:'#512C17', agtron:'42-52', agMid:46, tempC:88, tempF:190, taste:'Rich cocoa & body' },
  { v:'dark', label:'Dark', fullLabel:'Dark', sw:'--r5', hex:'#2D180D', agtron:'<42', agMid:34, tempC:85, tempF:185, taste:'Bold & bittersweet' }
];
const PROCESSES = [
  { v:'washed', label:'Washed', group:'classic', short:'Clean & terroir-transparent' },
  { v:'honey', label:'Honey', group:'honey', short:'Pulped natural · syrupy sweetness' },
  { v:'white-honey', label:'White honey', group:'honey', tier:'white', short:'10-25% mucilage · crisp & clean' },
  { v:'yellow-honey', label:'Yellow honey', group:'honey', tier:'yellow', short:'25-50% mucilage · sunny apricot sweetness' },
  { v:'red-honey', label:'Red honey', group:'honey', tier:'red', short:'50-75% mucilage · jammy fruit & body' },
  { v:'black-honey', label:'Black honey', group:'honey', tier:'black', short:'75-100% mucilage · natural-like richness' },
  { v:'natural', label:'Natural', group:'classic', short:'Whole-cherry dried · berry & heavy body' },
  { v:'wet-hulled', label:'Wet-hulled', group:'classic', short:'Giling Basah · deep body, low acidity' },
  { v:'anaerobic', label:'Anaerobic', group:'ferment', short:'Sealed oxygen-free tank · spiced & winey' },
  { v:'carbonic', label:'Carbonic maceration', group:'ferment', short:'CO2-flushed whole cherry · vivid aromatics' },
  { v:'thermal-shock', label:'Thermal shock', group:'ferment', short:'Hot-cold wash · high-clarity locked esters' },
  { v:'yeast-koji', label:'Yeast / Koji', group:'ferment', short:'Inoculated culture · structured tropical sweetness' },
  { v:'infused', label:'Co-fermented / infused', group:'ferment', short:'Fermented with fruit, botanicals, or mosto' },
  { v:'unknown', label:'Not sure', group:'unknown', short:'No process adjustment applied' }
];
const HONEY_TIERS = [
  { v:'honey', label:'Honey (general)', sub:'Pulped natural' },
  { v:'white-honey', label:'White Honey', sub:'~15% mucilage' },
  { v:'yellow-honey', label:'Yellow Honey', sub:'~40% mucilage' },
  { v:'red-honey', label:'Red Honey', sub:'~65% mucilage' },
  { v:'black-honey', label:'Black Honey', sub:'~90% mucilage' }
];
const DENSITIES = [
  { v:'low', label:'Lower', sub:'Under 1,200 m (3,900 ft)' },
  { v:'mid', label:'Mid', sub:'1,200 to 1,500 m (3,900 to 4,920 ft)' },
  { v:'high', label:'High', sub:'1,500 m (4,920 ft) and up' },
  { v:'unknown', label:'Not sure', sub:'' }
];
const ELEV_BANDS = [
  { v:'low', density:'low', label:'Lower', mRange:'<1,000 m', ftRange:'<3,300 ft', hint:'Softer cell structure · higher solubility' },
  { v:'mid', density:'mid', label:'Medium', mRange:'1,000-1,450 m', ftRange:'3,300-4,750 ft', hint:'Balanced density · sweet classic extraction' },
  { v:'high', density:'high', label:'High', mRange:'1,450-1,850 m', ftRange:'4,750-6,070 ft', hint:'Dense mountain seed · bright organic acids' },
  { v:'very-high', density:'high', label:'Very High (SHB)', mRange:'1,850+ m', ftRange:'6,070+ ft', hint:'Ultra-dense matrix · thrives at higher temp' }
];
const SPECIES_OPTS = [
  { v:'arabica', label:'Arabica', sci:'C. arabica', cafMgG:12.0, cafPct:1.20, hint:'Crisp acidity, complex aromatics (~12.0 mg/g caffeine)' },
  { v:'robusta', label:'Robusta / Fine Robusta', sci:'C. canephora', cafMgG:22.0, cafPct:2.20, hint:'Heavy crema/body, ~1.8x caffeine (~22.0 mg/g); brew 3-4 C cooler' },
  { v:'blend_ar', label:'Arabica / Robusta Blend', sci:'80/20 Blend', cafMgG:14.0, cafPct:1.40, hint:'Classic espresso crema & body + aromatic lift (~14.0 mg/g)' },
  { v:'liberica', label:'Liberica (Barako)', sci:'C. liberica', cafMgG:12.5, cafPct:1.25, hint:'Large asymmetric seed · bold jackfruit, smoky-woody sweetness (~12.5 mg/g)' },
  { v:'excelsa', label:'Excelsa', sci:'C. dewevrei', cafMgG:10.0, cafPct:1.00, hint:'Tart dark-berry & tamarind complexity, low bitterness (~10.0 mg/g)' },
  { v:'stenophylla', label:'Stenophylla', sci:'C. stenophylla', cafMgG:11.0, cafPct:1.10, hint:'Heat-resilient West African species · peach & jasmine Arabica-like cup (~11.0 mg/g)' },
  { v:'eugenioides', label:'Eugenioides', sci:'C. eugenioides', cafMgG:2.2, cafPct:0.22, hint:'Arabica maternal parent · ultra-low caffeine (~2.2 mg/g), natural sweetness' }
];
const DECAF_PROCESSES = [
  { v:'', caf:'regular', label:'Regular (Full Caf)', short:'Regular', hint:'Intact unsteamed green cell matrix' },
  { v:'half-caf', caf:'half-caf', label:'Half-Caf (50/50)', short:'Half-Caf', hint:'50% regular + 50% decaf blend (~half porosity shift)' },
  { v:'ea', caf:'decaf', label:'EA Sugarcane Decaf', short:'EA Sugarcane', hint:'Fermented ethyl acetate · preserves bright fruit & sweetness' },
  { v:'swiss', caf:'decaf', label:'Swiss Water (SWP)', short:'Swiss Water', hint:'100% chemical-free green coffee extract osmosis · clean cocoa cup' },
  { v:'mountain', caf:'decaf', label:'Mountain Water (MWP)', short:'Mountain Water', hint:'Glacial aqueous osmosis (Pico de Orizaba) · balanced sweetness' },
  { v:'co2', caf:'decaf', label:'Supercritical CO2', short:'Sub/Super CO2', hint:'High-pressure CO2 selectively binds caffeine · high structure retention' },
  { v:'mc', caf:'decaf', label:'Methylene Chloride (MC)', short:'MC Traditional', hint:'Selective low-boiling solvent (FDA <=10 ppm) · retains roast body' },
  { v:'unknown', caf:'decaf', label:'Decaf (Process Unlisted)', short:'Decaf', hint:'High porosity & brittle micro-fines · +8% coarser filter / -5.5% finer espresso' }
];
const BLEND_OPTS = [{ v:'single', label:'Single origin' }, { v:'blend', label:'Blend' }];
const LEVELS = [
  { v:'new', label:'Just Starting' },
  { v:'comfortable', label:'Comfy Brewer' },
  { v:'expert', label:'Bean Scientist' }
];
const WATER_UNITS = [
  { v:'g', label:'g / mL', factor:1 },
  { v:'ml', label:'mL', factor:1 },
  { v:'floz', label:'fl oz', factor:29.57352956 },
  { v:'cup', label:'cup (8 fl oz)', factor:236.5882365 },
  { v:'l', label:'L', factor:1000 }
];
const COFFEE_UNITS = [
  { v:'g', label:'g', factor:1 },
  { v:'oz', label:'oz', factor:G_PER_OZ },
  { v:'tbsp', label:'tbsp (~5.3g)', factor:5.3 }
];
const ALT_MIN_FT = -1411, ALT_MAX_FT = 18045;
const _WATER_UNIT_FACTORS = { g:1, ml:1, oz:29.57352956, floz:29.57352956, cup:236.5882365, cups:236.5882365, l:1000, liter:1000, liters:1000 };
const waterToG = (val, unit) => (+val || 0) * (_WATER_UNIT_FACTORS[String(unit || 'g').trim().toLowerCase()] || 1);
const gToWater = (grams, unit) => (+grams || 0) / (_WATER_UNIT_FACTORS[String(unit || 'g').trim().toLowerCase()] || 1);
const coffeeToG = (val, unit) => (+val || 0) * (unit === 'oz' ? G_PER_OZ : unit === 'tbsp' ? 5.3 : 1);
const fmtWater = (g, unit) => {
  const u = String(unit || 'g').trim().toLowerCase();
  if (u === 'floz' || u === 'oz') return rnd((+g || 0) / 29.57352956, 1) + ' fl oz';
  if (u === 'cup' || u === 'cups') return rnd((+g || 0) / 236.5882365, 2) + ' cups';
  if (u === 'l' || u === 'liter') return rnd((+g || 0) / 1000, 2) + ' L';
  return Math.round(+g || 0) + ' g';
};
const fmtCoffee = (g, unit) => unit === 'oz' ? (rnd((+g || 0) / G_PER_OZ, 2) + ' oz') : unit === 'tbsp' ? (rnd((+g || 0) / 5.3, 1) + ' tbsp') : (rnd(+g || 0, 1) + ' g');
const tbspText = (g, roastKey) => '~' + rnd((+g || 0) / ((typeof CAF_SCOOP_G !== 'undefined' && CAF_SCOOP_G[roastKey]) || 5.3), 1) + ' level tbsp';
const isFerment = p => ['anaerobic', 'carbonic', 'thermal-shock', 'yeast-koji', 'infused'].includes(String(p || ''));
const isHoneyProc = p => /^(?:white-|yellow-|red-|black-)?honey$/.test(String(p || ''));

/* ---------- Harmonized Cryo-Vault Arrhenius Effective Age (Rule #4: Ea = 40.1 kJ/mol -> 12.3x) ---------- */
const CRYO_VAULT_EA_KJ = 40.1;
const R_GAS_J = 8.314462618;
/* exp(40100 / 8.3144626 * (1/255.15 - 1/294.15)) = 12.31 -> canonical 12.3x slowdown at -18C vs 21C */
const CRYO_SLOWDOWN_18C = 12.3;

function storageArrheniusGamma(tempC){
  const tK = clampNum(tempC, -85, 45, 21) + 273.15;
  return Math.exp(-(1000 * CRYO_VAULT_EA_KJ / R_GAS_J) * (1 / tK - 1 / 294.15));
}

function effectiveBeanAge(c, now){
  if (!c || !c.roast_date || !validIsoDate(c.roast_date)) {
    return { rawDays:null, effectiveDays:null, roomDays:null, frozenDays:0, savedDays:0, isFrozen:false, cryoFactor:CRYO_SLOWDOWN_18C };
  }
  const n = now || new Date();
  const raw = daysSinceRoast(c.roast_date, n);
  if (raw == null || raw < 0) {
    return { rawDays:raw, effectiveDays:null, roomDays:null, frozenDays:0, savedDays:0, isFrozen:false, cryoFactor:CRYO_SLOWDOWN_18C };
  }
  const frozenOn = c.is_frozen === 'yes' || c.is_frozen === true || c.isFrozen === true || c.frozen === 'yes' || c.frozen === true || (!!c.frozen_date && c.is_frozen !== 'no' && c.is_frozen !== false);
  if (!frozenOn) {
    return { rawDays:raw, effectiveDays:raw, roomDays:raw, frozenDays:0, savedDays:0, isFrozen:false, cryoFactor:CRYO_SLOWDOWN_18C };
  }
  let fDays = 0, rDays = raw;
  if (c.frozen_date && validIsoDate(c.frozen_date)) {
    const dFreezeToNow = daysSinceRoast(c.frozen_date, n);
    if (dFreezeToNow != null && dFreezeToNow >= 0) {
      fDays = Math.min(raw, dFreezeToNow);
      rDays = Math.max(0, raw - fDays);
    }
  } else if (c.freeze_days_offset != null && c.freeze_days_offset !== '' && isFinite(+c.freeze_days_offset) && +c.freeze_days_offset >= 0) {
    rDays = Math.min(raw, Math.round(+c.freeze_days_offset));
    fDays = Math.max(0, raw - rDays);
  } else {
    rDays = Math.min(raw, 7);
    fDays = Math.max(0, raw - rDays);
  }
  const eff = rnd(rDays + fDays / CRYO_SLOWDOWN_18C, 1);
  const saved = Math.max(0, rnd(raw - eff, 1));
  return { rawDays:raw, effectiveDays:eff, roomDays:rDays, frozenDays:fDays, savedDays:saved, isFrozen:true, cryoFactor:CRYO_SLOWDOWN_18C };
}

/* ---------- 3. FILTERS_V6 (16 Canonical Media) + Retail FILTERS ---------- */
const FILTERS_V6 = attachByKey([
  { id:'cone-bleached', label:'Standard Oxygen-Bleached Cone (V60 / 01-03)', short:'Bleached Cone', material:'paper', flowClass:'medium',
    fits:['v60','origami','switch','aiden','cold'], dryMassG:1.1, dryUptakePerG:2.18, wDryG:2.4, rWaterBed:2.10, umMult:1.00,
    oilPassFrac:0.02, finesPassFrac:0.01, rFilter0:3.2e8, cafestolLevel:'minimal',
    note:'Oxygen-bleached creped abaca/wood cellulose (~20 um nominal); traps ~98% of coffee lipids/cafestol.' },
  { id:'cone-fast-abaca', label:'Cafec Abaca / T-90 Medium-Fast Cone', short:'Cafec Abaca / T-90', material:'paper', flowClass:'fast',
    fits:['v60','origami','switch','aiden'], dryMassG:1.1, dryUptakePerG:2.00, wDryG:2.2, rWaterBed:2.05, umMult:0.94,
    oilPassFrac:0.03, finesPassFrac:0.01, rFilter0:2.1e8, cafestolLevel:'minimal',
    aliases:['cafec-t90','abaca','cafec-t92'],
    subVariants:{ 't90':{ umMult:0.94, rFilter0:2.1e8 }, 't92':{ umMult:1.08, rFilter0:5.2e8, note:'Cafec T-92 dense slow paper: grind +8% coarser & minimize swirl.' } },
    note:'Two-sided high-crepe abaca fibers resist micro-fines blinding, supporting 6% finer grinds (Cafec T-92 dense paper shifts +8% coarser).' },
  { id:'cone-sibarist', label:'Sibarist FAST Specialty Paper', short:'Sibarist FAST', material:'paper', flowClass:'fast',
    fits:['v60','origami','switch','orea','kalita','aeropress'], dryMassG:0.9, dryUptakePerG:2.00, wDryG:1.8, rWaterBed:1.95, umMult:0.86,
    oilPassFrac:0.05, finesPassFrac:0.02, rFilter0:1.2e8, cafestolLevel:'minimal',
    note:'Ultra-high permeability abaca + organic cellulose matrix; grind ~14% finer to maintain extraction contact time.' },
  { id:'cone-unbleached', label:'Natural Unbleached Brown Cone / T-92 Dense', short:'Unbleached / T-92', material:'paper', flowClass:'slow',
    fits:['v60','origami','switch','drip','clever'], dryMassG:1.2, dryUptakePerG:2.17, wDryG:2.6, rWaterBed:2.15, umMult:1.04,
    oilPassFrac:0.02, finesPassFrac:0.01, rFilter0:4.4e8, cafestolLevel:'minimal',
    note:'Requires mandatory >=60 g boiling pre-rinse to flush soluble lignin/papery volatiles before dosing coffee.' },
  { id:'wave-bleached', label:'20-Flute Flat-Bottom Wave (Kalita 155/185)', short:'Kalita Wave Paper', material:'paper', flowClass:'medium',
    fits:['kalita','origami','orea','xbloom','aiden','drip'], dryMassG:1.3, dryUptakePerG:2.15, wDryG:2.8, rWaterBed:2.15, umMult:1.00,
    oilPassFrac:0.02, finesPassFrac:0.01, rFilter0:3.0e8, cafestolLevel:'minimal',
    note:'20 pleats create an insulating air cushion along brewer walls; pour rinse water dead-center so flutes never collapse.' },
  { id:'orea-flat-negotiated', label:'Negotiated Zero-Bypass Smooth Flat Paper', short:'Negotiated Flat', material:'paper', flowClass:'fast',
    fits:['orea'], dryMassG:1.0, dryUptakePerG:2.00, wDryG:2.0, rWaterBed:2.05, umMult:1.05,
    oilPassFrac:0.03, finesPassFrac:0.01, rFilter0:1.8e8, cafestolLevel:'minimal',
    note:'Pressed flush against smooth brewer wall via Negotiator tool for 0% lateral bypass (+5% coarser vs high-bypass cone, or -8% with Sibarist Flat).' },
  { id:'pulsar-tricolate-disc', label:'Zero-Bypass Die-Cut Cylinder Disc (75-80 mm)', short:'Pulsar / Tricolate Disc', material:'paper', flowClass:'medium',
    fits:['pulsar','cold_drip'], dryMassG:0.9, dryUptakePerG:2.11, wDryG:1.9, rWaterBed:2.10, umMult:1.00,
    oilPassFrac:0.02, finesPassFrac:0.01, rFilter0:2.8e8, cafestolLevel:'minimal',
    note:'Seats flat beneath a wide zero-bypass cylinder; pair with top dispersion screen or top paper in Kyoto Cold Drip.' },
  { id:'chemex-bonded', label:'Chemex Heavy Lab-Grade Bonded Paper', short:'Chemex Bonded', material:'paper', flowClass:'slow',
    fits:['chemex'], dryMassG:2.8, dryUptakePerG:2.32, wDryG:6.5, rWaterBed:2.25, umMult:1.00,
    oilPassFrac:0.01, finesPassFrac:0.005, rFilter0:7.2e8, cafestolLevel:'minimal',
    note:'20-30% heavier lab-grade cellulose traps ~99% of lipids and diterpenes for crystalline tea-like clarity; place 3-ply fold over pour spout.' },
  { id:'trapezoid-wedge', label:'Melitta #2 / #4 Trapezoid Creped Filter', short:'Trapezoid #2/#4', material:'paper', flowClass:'medium',
    fits:['clever','drip','aiden'], dryMassG:1.4, dryUptakePerG:2.14, wDryG:3.0, rWaterBed:2.20, umMult:1.00,
    oilPassFrac:0.02, finesPassFrac:0.01, rFilter0:3.5e8, cafestolLevel:'minimal',
    note:'Fold bottom and side crimped seams in opposite directions for snug geometry.' },
  { id:'cloth-nel-flannel', label:'Cotton/Hemp Nel Flannel Cloth (Woodneck)', short:'Nel Flannel Cloth', material:'cloth', flowClass:'fast',
    fits:['nel','siphon','v60','chemex','cold'], dryMassG:3.5, dryUptakePerG:0.0, wDryG:0.0, rWaterBed:2.20, umMult:1.00,
    oilPassFrac:0.38, finesPassFrac:0.02, rFilter0:1.5e8, cafestolLevel:'moderate',
    careRule:'Rinse immediately under hot tap water (NEVER use soap), then store submerged in fresh cold filtered water in a sealed fridge jar (change every 2-3d) or wrung clean in a -18C freezer zip-bag so retained coffee lipids never oxidize into rancid hexanal/(E)-2-nonenal. Boil 5 min every 12 brews.',
    note:'Swollen wet flannel fibers trap >98% of solid fines while passing ~38% of emulsified coffee lipids (velvety liqueur mouthfeel + moderate cafestol).' },
  { id:'ap-paper-single', label:'Single Micro-Perforated Paper Disc (AeroPress / Soup)', short:'Single Paper Disc', material:'paper', flowClass:'medium',
    fits:['aeropress','moka','espresso','lever_espresso','cold_drip'], dryMassG:0.25, dryUptakePerG:2.40, wDryG:0.6, rWaterBed:1.65, umMult:1.00,
    oilPassFrac:0.04, finesPassFrac:0.015, rFilter0:2.6e8, cafestolLevel:'minimal',
    note:'63 mm AeroPress cellulose disc (or 58 mm bottom espresso paper for Soup / high-EY shots); traps ~96% of lipids and micro-fines.' },
  { id:'ap-paper-double', label:'Dual Paper / Espresso Top+Bottom Paper Sandwich', short:'Dual / Sandwich Paper', material:'paper', flowClass:'slow',
    fits:['aeropress','espresso','lever_espresso'], dryMassG:0.50, dryUptakePerG:2.40, wDryG:1.2, rWaterBed:1.70, umMult:0.98,
    oilPassFrac:0.015, finesPassFrac:0.008, rFilter0:3.8e8, cafestolLevel:'minimal',
    note:'Dual AeroPress papers or 58 mm bottom paper + top puck paper/screen sandwich: eliminates shower-screen channeling and traps ~98.5% of cafestol.' },
  { id:'metal-mesh-fine', label:'Etched Stainless Mesh Filter (150-200 um)', short:'Fine Metal Mesh', material:'metal', flowClass:'fast',
    fits:['aeropress','v60','kalita','siphon','cold'], dryMassG:0.0, dryUptakePerG:0.0, wDryG:0.0, rWaterBed:1.90, umMult:1.08,
    oilPassFrac:0.85, finesPassFrac:0.35, rFilter0:4.0e7, cafestolLevel:'high',
    note:'Zero paper waste; passes ~85% of aromatic oils and ~35% micro-fines for fuller body (grind +8% coarser; syringe-filter before refractometry).' },
  { id:'press-spiral-mesh', label:'French Press Coiled Wire & Woven SS Screen', short:'Press Mesh', material:'metal', flowClass:'fast',
    fits:['press','cold'], dryMassG:0.0, dryUptakePerG:0.0, wDryG:0.0, rWaterBed:2.40, umMult:1.00,
    oilPassFrac:0.95, finesPassFrac:0.55, rFilter0:2.0e7, cafestolLevel:'high',
    note:'250-350 um mesh apertures; skimming foam at 4:00 + 5:00 undisturbed settling cuts cup silt dramatically while keeping plush oils (~3-6 mg cafestol/cup).' },
  { id:'espresso-precision-basket', label:'Electro-Polished Precision Metal Basket', short:'Precision Basket', material:'metal', flowClass:'fast',
    fits:['espresso','lever_espresso','moka','phin','philips5500'], dryMassG:0.0, dryUptakePerG:0.0, wDryG:0.0, rWaterBed:1.00, umMult:1.00,
    oilPassFrac:0.45, finesPassFrac:0.25, rFilter0:6.0e7, cafestolLevel:'moderate',
    note:'Self-filtering compacted coffee cake above precision 58/54 mm stainless ports (~1.0-1.5 mg cafestol per espresso shot).' },
  { id:'unfiltered-sediment', label:'Unfiltered Gravity-Settled Cezve Suspension', short:'Unfiltered Telve', material:'none', flowClass:'fast',
    fits:['turkish'], dryMassG:0.0, dryUptakePerG:0.0, wDryG:0.0, rWaterBed:1.35, umMult:1.00,
    oilPassFrac:0.95, finesPassFrac:0.90, rFilter0:0.0, cafestolLevel:'high',
    note:'Zero mechanical filter; pulverized grounds settle as telve in demitasse over 2 minutes (~3-5 mg cafestol/cup).' }
], 'id');
FILTERS_V6.forEach(f => {
  if (!f.key) f.key = f.id;
  if (!f.care) f.care = f.careRule || f.note || '';
  if (f.kRel == null) f.kRel = f.flowClass === 'fast' ? 1.25 : f.flowClass === 'slow' ? 0.78 : 1.0;
  if (f.betaBlind == null) f.betaBlind = f.material === 'metal' || f.material === 'none' ? 0.0 : (f.flowClass === 'fast' ? 0.75 : f.flowClass === 'slow' ? 1.35 : 1.0);
});
if (FILTERS_V6['cloth-nel-flannel'] && !FILTERS_V6['nel-flannel']){
  Object.defineProperty(FILTERS_V6, 'nel-flannel', { value:FILTERS_V6['cloth-nel-flannel'], enumerable:false, configurable:true });
}

const FILTERS = [
  { name:'Hario V60 White 01', id:'cone-bleached', group:'Hario V60', fits:['v60','origami'], flowClass:'medium', material:'paper' },
  { name:'Hario V60 White 02', id:'cone-bleached', group:'Hario V60', fits:['v60','origami','switch'], flowClass:'medium', material:'paper' },
  { name:'Hario V60 White 03', id:'cone-bleached', group:'Hario V60', fits:['v60','switch'], flowClass:'medium', material:'paper' },
  { name:'Hario V60 Natural 01', id:'cone-unbleached', group:'Hario V60', fits:['v60','origami'], flowClass:'slow', material:'paper' },
  { name:'Hario V60 Natural 02', id:'cone-unbleached', group:'Hario V60', fits:['v60','origami','switch'], flowClass:'slow', material:'paper' },
  { name:'Hario V60 Natural 03', id:'cone-unbleached', group:'Hario V60', fits:['v60','switch'], flowClass:'slow', material:'paper' },
  { name:'Cafec Abaca (red)', id:'cone-fast-abaca', group:'Cafec', fits:['v60','origami','switch'], flowClass:'fast', material:'paper' },
  { name:'Cafec Abaca+ (black)', id:'cone-fast-abaca', group:'Cafec', fits:['v60','origami','switch'], flowClass:'fast', material:'paper' },
  { name:'Cafec Deep 27 Abaca (1 cup)', id:'cone-fast-abaca', group:'Cafec', fits:['v60'], flowClass:'fast', material:'paper' },
  { name:'Cafec T90 Medium Roast', id:'cone-fast-abaca', group:'Cafec', fits:['v60','origami','switch'], flowClass:'fast', material:'paper' },
  { name:'Cafec T92 Light Roast', id:'cone-unbleached', group:'Cafec', fits:['v60','origami','switch'], flowClass:'slow', material:'paper', umMult:1.08 },
  { name:'Cafec T83 Dark Roast', id:'cone-bleached', group:'Cafec', fits:['v60','origami','switch'], flowClass:'medium', material:'paper' },
  { name:'Sibarist FAST', id:'cone-sibarist', group:'Sibarist', fits:['v60','origami','switch'], flowClass:'fast', material:'paper' },
  { name:'Sibarist FAST Flat', id:'cone-sibarist', group:'Sibarist', fits:['kalita','orea','xbloom'], flowClass:'fast', material:'paper' },
  { name:'Sibarist B3 Cone', id:'cone-sibarist', group:'Sibarist', fits:['v60','origami','switch'], flowClass:'fast', material:'paper' },
  { name:'Sibarist FAST AeroPress', id:'cone-sibarist', group:'Sibarist', fits:['aeropress'], flowClass:'fast', material:'paper' },
  { name:'Kalita Wave 155', id:'wave-bleached', group:'Kalita', fits:['kalita','origami','orea','xbloom'], flowClass:'medium', material:'paper' },
  { name:'Kalita Wave 185', id:'wave-bleached', group:'Kalita', fits:['kalita','origami','orea'], flowClass:'medium', material:'paper' },
  { name:'Kalita 102 White', id:'trapezoid-wedge', group:'Kalita', fits:['clever','drip','aiden'], flowClass:'medium', material:'paper' },
  { name:'Kalita 103 White', id:'trapezoid-wedge', group:'Kalita', fits:['clever','drip'], flowClass:'medium', material:'paper' },
  { name:'Chemex bonded square', id:'chemex-bonded', group:'Chemex', fits:['chemex'], flowClass:'slow', material:'paper' },
  { name:'Chemex pre-folded square, white', id:'chemex-bonded', group:'Chemex', fits:['chemex'], flowClass:'slow', material:'paper' },
  { name:'Chemex pre-folded square, natural', id:'chemex-bonded', group:'Chemex', fits:['chemex'], flowClass:'slow', material:'paper' },
  { name:'Chemex pre-folded circle', id:'chemex-bonded', group:'Chemex', fits:['chemex'], flowClass:'slow', material:'paper' },
  { name:'Chemex half-moon, white', id:'chemex-bonded', group:'Chemex', fits:['chemex'], flowClass:'slow', material:'paper' },
  { name:'Chemex half-moon, natural', id:'chemex-bonded', group:'Chemex', fits:['chemex'], flowClass:'slow', material:'paper' },
  { name:'Fellow Stagg XF', id:'wave-bleached', group:'Fellow', fits:['kalita'], flowClass:'medium', material:'paper' },
  { name:'Fellow Stagg X', id:'wave-bleached', group:'Fellow', fits:['kalita','orea'], flowClass:'medium', material:'paper' },
  { name:'Fellow Aiden #2 Cone', id:'cone-bleached', group:'Fellow', fits:['aiden','drip','clever'], flowClass:'medium', material:'paper' },
  { name:'Fellow Aiden Single-Serve Cone', id:'cone-bleached', group:'Fellow', fits:['aiden','drip','clever'], flowClass:'medium', material:'paper' },
  { name:'Fellow Aiden Batch Basket', id:'wave-bleached', group:'Fellow', fits:['aiden','drip'], flowClass:'medium', material:'paper' },
  { name:'xBloom Omni Dripper 2 (155)', id:'wave-bleached', group:'xBloom', fits:['xbloom','kalita','orea'], flowClass:'fast', material:'paper' },
  { name:'xBloom xPod', id:'wave-bleached', group:'xBloom', fits:['xbloom'], flowClass:'medium', material:'paper' },
  { name:'Orea Flat (Type G / Negotiated)', id:'orea-flat-negotiated', group:'Other pour-over', fits:['orea','kalita'], flowClass:'fast', material:'paper' },
  { name:'Orea Wave', id:'wave-bleached', group:'Other pour-over', fits:['orea','kalita'], flowClass:'fast', material:'paper' },
  { name:'April Paper Filter', id:'wave-bleached', group:'Other pour-over', fits:['kalita','orea'], flowClass:'medium', material:'paper' },
  { name:'Timemore B75 Wave', id:'wave-bleached', group:'Other pour-over', fits:['kalita','orea'], flowClass:'fast', material:'paper' },
  { name:'Pulsar Filter Paper', id:'pulsar-tricolate-disc', group:'Other pour-over', fits:['pulsar','cold_drip','switch','clever'], flowClass:'fast', material:'paper' },
  { name:'Tricolate Flat Disc Paper', id:'pulsar-tricolate-disc', group:'Other pour-over', fits:['pulsar','cold_drip'], flowClass:'medium', material:'paper' },
  { name:'NotNeutral Gino', id:'wave-bleached', group:'Other pour-over', fits:['v60','switch','kalita'], flowClass:'medium', material:'paper' },
  { name:'Bonmac flat-bottom No. 2', id:'trapezoid-wedge', group:'Other pour-over', fits:['kalita','clever'], flowClass:'medium', material:'paper' },
  { name:'Origami paper cone', id:'cone-fast-abaca', group:'Other pour-over', fits:['origami','v60','switch'], flowClass:'fast', material:'paper' },
  { name:'Hario cloth, Woodneck', id:'cloth-nel-flannel', group:'Other pour-over', fits:['nel','v60','siphon'], flowClass:'fast', material:'cloth' },
  { name:'CoffeeSock Reusable Cloth', id:'cloth-nel-flannel', group:'Other pour-over', fits:['nel','v60','chemex','kalita','cold'], flowClass:'fast', material:'cloth' },
  { name:'Melitta #2 Natural', id:'trapezoid-wedge', group:'Melitta and baskets', fits:['aiden','drip','clever'], flowClass:'medium', material:'paper' },
  { name:'Melitta #4 Natural', id:'trapezoid-wedge', group:'Melitta and baskets', fits:['drip','clever'], flowClass:'medium', material:'paper' },
  { name:'Melitta basket, 10 to 12 cup', id:'wave-bleached', group:'Melitta and baskets', fits:['aiden','drip'], flowClass:'medium', material:'paper' },
  { name:'Bunn basket, 12 cup', id:'wave-bleached', group:'Melitta and baskets', fits:['aiden','drip'], flowClass:'medium', material:'paper' },
  { name:'Basket filter, 8 to 12 cup', id:'wave-bleached', group:'Melitta and baskets', fits:['aiden','drip'], flowClass:'medium', material:'paper' },
  { name:'#2 cone, unbleached', id:'cone-unbleached', group:'Generic cones', fits:['aiden','drip','clever'], flowClass:'medium', material:'paper' },
  { name:'#2 cone (DechoPak)', id:'cone-bleached', group:'Generic cones', fits:['aiden','drip','clever'], flowClass:'medium', material:'paper' },
  { name:'#4 cone, flat-bottom', id:'trapezoid-wedge', group:'Generic cones', fits:['drip','clever'], flowClass:'medium', material:'paper' },
  { name:'If You Care #4', id:'cone-unbleached', group:'Generic cones', fits:['drip','clever'], flowClass:'medium', material:'paper' },
  { name:'Brew Choice #6', id:'trapezoid-wedge', group:'Generic cones', fits:['drip','clever'], flowClass:'medium', material:'paper' },
  { name:'Bake Choice pre-folded', id:'wave-bleached', group:'Generic cones', fits:['drip','clever'], flowClass:'medium', material:'paper' },
  { name:'AeroPress paper micro-filters', id:'ap-paper-single', group:'AeroPress', fits:['aeropress','moka','cold_drip'], flowClass:'medium', material:'paper' },
  { name:'AeroPress Double Paper (2 stacked)', id:'ap-paper-double', group:'AeroPress', fits:['aeropress'], flowClass:'slow', material:'paper' },
  { name:'Aesir AeroPress Filter', id:'ap-paper-double', group:'AeroPress', fits:['aeropress'], flowClass:'slow', material:'paper' },
  { name:'AeroPress XL paper', id:'ap-paper-single', group:'AeroPress', fits:['aeropress'], flowClass:'medium', material:'paper' },
  { name:'AeroPress stainless, standard', id:'metal-mesh-fine', group:'AeroPress', fits:['aeropress'], flowClass:'fast', material:'metal' },
  { name:'AeroPress stainless, XL', id:'metal-mesh-fine', group:'AeroPress', fits:['aeropress'], flowClass:'fast', material:'metal' },
  { name:'Fellow Prismo Metal + Paper', id:'ap-paper-single', group:'AeroPress', fits:['aeropress'], flowClass:'medium', material:'paper' },
  { name:'Able Kone (stainless)', id:'metal-mesh-fine', group:'Reusable metal', fits:['v60','switch','chemex'], flowClass:'fast', material:'metal' },
  { name:'Stainless cone for V60 02', id:'metal-mesh-fine', group:'Reusable metal', fits:['v60','switch'], flowClass:'fast', material:'metal' },
  { name:'Espresso Paper + Puck Screen', id:'ap-paper-single', group:'Espresso', fits:['espresso','lever_espresso'], flowClass:'fast', material:'paper' },
  { name:'Espresso Paper Sandwich (Top+Bottom)', id:'ap-paper-double', group:'Espresso', fits:['espresso','lever_espresso'], flowClass:'medium', material:'paper' },
  { name:'OXO cold brew paper', id:'cone-bleached', group:'Cold brew', fits:['cold','cold_drip'], flowClass:'medium', material:'paper' },
  { name:'Yama cold brew paper', id:'pulsar-tricolate-disc', group:'Cold brew', fits:['cold_drip','cold'], flowClass:'medium', material:'paper' },
  { name:'Toddy', id:'cloth-nel-flannel', group:'Cold brew', fits:['cold'], flowClass:'slow', material:'cloth' }
];
const FILTER_GROUPS = ['Hario V60', 'Cafec', 'Sibarist', 'Kalita', 'Chemex', 'Fellow', 'xBloom', 'Other pour-over', 'Melitta and baskets', 'Generic cones', 'AeroPress', 'Reusable metal', 'Espresso', 'Cold brew'];

function filterV6For(idOrName, methodKey){
  if (idOrName) {
    const k = String(idOrName).trim().toLowerCase();
    if (FILTERS_V6[k]) return FILTERS_V6[k];
    const byAlias = FILTERS_V6.find(f => f.id === k || f.label.toLowerCase() === k || (f.aliases && f.aliases.includes(k)));
    if (byAlias) {
      if (k.includes('t92') || k.includes('t-92')) {
        return Object.assign({}, byAlias, { id:'cone-t92', umMult:1.08, rFilter0:5.2e8, flowClass:'slow' });
      }
      return byAlias;
    }
    const retail = FILTERS.find(f => f.name.toLowerCase() === k);
    if (retail && FILTERS_V6[retail.id]) {
      return retail.umMult ? Object.assign({}, FILTERS_V6[retail.id], { umMult:retail.umMult, flowClass:retail.flowClass }) : FILTERS_V6[retail.id];
    }
  }
  const m = METHOD_PHYSICS_V6 && METHOD_PHYSICS_V6[methodKey];
  return (m && FILTERS_V6[m.defaultFilterId]) || FILTERS_V6[0];
}
function filterInfoFor(name){
  const n = String(name || '').trim().toLowerCase();
  if (!n) return null;
  if (n === 'orea flat (type g)') return FILTERS.find(f => f.id === 'orea-flat-negotiated') || FILTERS_V6['orea-flat-negotiated'] || null;
  return FILTERS.find(f => f.name.toLowerCase() === n) || FILTERS_V6[n] || null;
}
function filtersFor(query, method){
  const q = String(query || '').trim().toLowerCase();
  const hit = FILTERS.filter(f => !q || f.name.toLowerCase().includes(q) || f.group.toLowerCase().includes(q) || (f.flowClass || '').includes(q));
  const fit = f => !!method && (!f.fits.length || f.fits.indexOf(method) >= 0);
  return { fits:hit.filter(fit), others:hit.filter(f => !fit(f)) };
}

/* ---------- 4. METHOD_PHYSICS_V6 (23 Canonical Methods) + METHODS (22) + MACHINES (1) ---------- */
function mkRoastTemps(ul, l, ml, m, md, d){
  return { 'ultra-light':ul, light:l, 'medium-light':ml, medium:m, 'medium-dark':md, dark:d };
}

const METHOD_PHYSICS_V6 = attachByKey([
  {
    key:'v60', label:'Hario V60', short:'V60', category:'cone', type:'flow', icon:'brewer-v60',
    d50AnchorUm:550, um:[440, 720], ratio:16.5, ratioBounds:[14.5, 18.5], dose:18, water:300,
    tempByRoastC:mkRoastTemps(98, 96, 94, 92, 89, 85),
    rWater:2.10, etaTail:0.24, chiRet:0.06, fAbsDefault:1.00, nLayers:3, bedAreaCm2:28.3, deltaPExtKPa:0,
    defaultFilterId:'cone-bleached', oilPassFrac:0.02, typicalTimeS:[150, 195], targetRef:{ tdsPct:1.35, eyPct:20.0 },
    epistemicTier:'verified_science',
    blurb:'Conical 60-degree percolation with spiral air ribs (~8% wall bypass); laminar 3-5 cm unbroken pour stream.',
    subModes:[
      { id:'standard', label:'3-Pulse Clarity', d50Um:550, ratio:16.5 },
      { id:'single-pour', label:'Laminar Single Pour', d50Um:520, ratio:16.5 },
      { id:'kasuya-46', label:'Kasuya 4:6 (5 Pulses)', d50Um:680, ratio:15.0 }
    ]
  },
  {
    key:'origami', label:'Origami Dripper', short:'Origami', category:'cone', type:'flow', icon:'brewer-origami',
    d50AnchorUm:530, um:[430, 740], ratio:16.0, ratioBounds:[14.5, 18.0], dose:15, water:240,
    tempByRoastC:mkRoastTemps(98, 96, 94, 92, 89, 86),
    rWater:2.08, etaTail:0.24, chiRet:0.06, fAbsDefault:1.00, nLayers:3, bedAreaCm2:27.5, deltaPExtKPa:0,
    defaultFilterId:'cone-fast-abaca', oilPassFrac:0.03, typicalTimeS:[135, 195], targetRef:{ tdsPct:1.38, eyPct:20.2 },
    epistemicTier:'verified_science',
    blurb:'Dual-geometry 20-flute dripper: Cone paper spans channels (fast, high clarity, 530 um) while Kalita Wave paper nests 1:1 for zero-choke flat-bed sweetness (620 um).',
    subModes:[
      { id:'origami-cone', label:'Cone Paper (20 Air Channels)', d50Um:530, ratio:16.0, rWater:2.08, filterId:'cone-fast-abaca' },
      { id:'origami-wave', label:'Kalita Wave Paper (Flat Bed)', d50Um:620, ratio:16.5, rWater:2.15, filterId:'wave-bleached' }
    ]
  },
  {
    key:'kalita', label:'Kalita Wave', short:'Kalita Wave', category:'flat', type:'flow', icon:'brewer-kalita',
    d50AnchorUm:640, um:[520, 780], ratio:16.5, ratioBounds:[15.0, 18.0], dose:18, water:300,
    tempByRoastC:mkRoastTemps(97, 95, 93, 91, 88, 85),
    rWater:2.15, etaTail:0.20, chiRet:0.08, fAbsDefault:1.00, nLayers:3, bedAreaCm2:23.8, deltaPExtKPa:0,
    defaultFilterId:'wave-bleached', oilPassFrac:0.02, typicalTimeS:[165, 210], targetRef:{ tdsPct:1.35, eyPct:20.0 },
    epistemicTier:'verified_science',
    blurb:'Flat-bottom 3-hole restricted percolation with 20-pleat air insulation for uniform 1D plug flow and sweet roundness.',
    subModes:[
      { id:'wave-185', label:'Wave 185 (15-26 g)', d50Um:640, ratio:16.5 },
      { id:'wave-155', label:'Wave 155 (10-16 g)', d50Um:590, ratio:16.0 }
    ]
  },
  {
    key:'orea', label:'Orea V3 / V4', short:'Orea', category:'flat', type:'flow', icon:'brewer-orea',
    d50AnchorUm:580, um:[450, 740], ratio:16.5, ratioBounds:[15.0, 19.5], dose:15, water:250,
    tempByRoastC:mkRoastTemps(98, 96, 94, 91, 88, 84),
    rWater:2.05, etaTail:0.18, chiRet:0.05, fAbsDefault:1.00, nLayers:3, bedAreaCm2:21.2, deltaPExtKPa:0,
    defaultFilterId:'wave-bleached', oilPassFrac:0.03, typicalTimeS:[130, 170], targetRef:{ tdsPct:1.38, eyPct:21.2 },
    epistemicTier:'verified_science',
    blurb:'Unrestricted open-ring flat-bottom brewer; supports pleated Wave filters (580 um) or Negotiated flush zero-bypass flat papers (610 um, 1:17.5, 21-23% EY).',
    subModes:[
      { id:'orea-wave', label:'Pleated Wave Mode', d50Um:580, ratio:16.5, filterId:'wave-bleached' },
      { id:'orea-negotiated', label:'Negotiated Zero-Bypass Flat', d50Um:610, ratio:17.5, filterId:'orea-flat-negotiated', zeroBypass:true }
    ]
  },
  {
    key:'pulsar', label:'NextLevel Pulsar / Tricolate', short:'Pulsar', category:'zero-bypass', type:'hybrid', icon:'brewer-pulsar',
    d50AnchorUm:620, um:[480, 780], ratio:17.5, ratioBounds:[16.0, 22.0], dose:20, water:350,
    tempByRoastC:mkRoastTemps(99, 97, 95, 92, 89, 85),
    screenTempCompC:2.0,
    rWater:2.10, etaTail:0.45, chiRet:0.18, fAbsDefault:1.00, nLayers:3, bedAreaCm2:44.2, deltaPExtKPa:0,
    defaultFilterId:'pulsar-tricolate-disc', oilPassFrac:0.02, typicalTimeS:[195, 300], targetRef:{ tdsPct:1.38, eyPct:22.0 },
    epistemicTier:'verified_science',
    blurb:'75-80 mm zero-bypass cylinder + overhead dispersion screen (+2 C kettle compensation for dual air-fall cooling); Pulsar valve enables closed bloom steep.',
    subModes:[
      { id:'pulsar-valve', label:'Pulsar Closed-Bloom Hybrid Valve', d50Um:620, ratio:17.5 },
      { id:'tricolate-open', label:'Tricolate Open Zero-Bypass', d50Um:580, ratio:18.5 }
    ]
  },
  {
    key:'chemex', label:'Chemex', short:'Chemex', category:'cone', type:'flow', icon:'brewer-chemex',
    d50AnchorUm:760, um:[640, 920], ratio:16.5, ratioBounds:[15.0, 18.0], dose:30, water:500,
    tempByRoastC:mkRoastTemps(98, 96, 94, 92, 89, 86),
    rWater:2.25, etaTail:0.24, chiRet:0.06, fAbsDefault:1.00, nLayers:3, bedAreaCm2:34.0, deltaPExtKPa:0,
    defaultFilterId:'chemex-bonded', oilPassFrac:0.01, typicalTimeS:[225, 285], targetRef:{ tdsPct:1.33, eyPct:19.8 },
    epistemicTier:'verified_science',
    blurb:'Heavy lab-grade bonded paper seals to glass hourglass; traps ~99% of lipids and cafestol for sparkling clarity.'
  },
  {
    key:'nel', label:'Cloth Nel Drip (Woodneck)', short:'Nel Drip', category:'cloth', type:'flow', icon:'brewer-nel',
    d50AnchorUm:680, um:[560, 820], ratio:13.5, ratioBounds:[10.0, 16.5], dose:20, water:270,
    tempByRoastC:mkRoastTemps(93, 92, 90, 88, 85, 82),
    rWater:2.20, etaTail:0.25, chiRet:0.09, fAbsDefault:1.00, nLayers:3, bedAreaCm2:26.0, deltaPExtKPa:0,
    defaultFilterId:'cloth-nel-flannel', oilPassFrac:0.38, typicalTimeS:[180, 240], targetRef:{ tdsPct:1.55, eyPct:19.2 },
    epistemicTier:'verified_science',
    blurb:'Swollen cotton flannel traps >98% solid fines while passing ~38% coffee lipids for velvety Kissaten silkiness; store wet in cold water or -18 C freezer (never soap).',
    subModes:[
      { id:'nel-specialty', label:'Modern Specialty (1:13.5)', d50Um:680, ratio:13.5 },
      { id:'nel-kissaten', label:'Classic Kissaten Demitasse (1:10.5)', d50Um:640, ratio:10.5 },
      { id:'nel-clean', label:'Light Clarity (1:15.0)', d50Um:700, ratio:15.0 }
    ]
  },
  {
    key:'drip', label:'SCA Batch Brewer', short:'Batch Drip', category:'auto-drip', type:'flow', icon:'brewer-drip',
    d50AnchorUm:700, batchUmPerGOver500:0.22, um:[580, 920], ratio:17.0, ratioBounds:[15.5, 18.5], dose:60, water:1000,
    tempByRoastC:mkRoastTemps(95, 94, 93, 93, 92, 91),
    rWater:2.15, etaTail:0.20, chiRet:0.08, fAbsDefault:1.00, nLayers:3, bedAreaCm2:55.0, deltaPExtKPa:0,
    defaultFilterId:'wave-bleached', oilPassFrac:0.02, typicalTimeS:[240, 360], targetRef:{ tdsPct:1.30, eyPct:19.8 },
    epistemicTier:'verified_science',
    blurb:'Automated pulse showerhead (SCA-310 92-95 C); scales grind +0.22 um/g above 500 g (+220 um at 1.5 L) to prevent basket overflow.'
  },
  {
    key:'aiden', label:'Fellow Aiden Precision', short:'Fellow Aiden', category:'smart-brewer', type:'flow', icon:'brewer-aiden',
    d50AnchorUm:540, batchAnchorUm:720, um:[450, 900], ratio:16.5, ratioBounds:[14.0, 20.0], dose:18, water:300,
    tempByRoastC:mkRoastTemps(98, 96, 94, 92, 89, 85),
    rWater:2.10, etaTail:0.20, chiRet:0.07, fAbsDefault:1.00, nLayers:3, bedAreaCm2:26.5, batchBedAreaCm2:62.0, deltaPExtKPa:0,
    defaultFilterId:'cone-bleached', oilPassFrac:0.02, typicalTimeS:[165, 270], targetRef:{ tdsPct:1.38, eyPct:20.5 },
    epistemicTier:'verified_science',
    blurb:'Sealed steam-retaining PID chamber (<=450 mL Green SS Cone vs >450 mL 62 cm2 Blue Batch Flat basket, 0.5 C declining pulses & 60 C Samo Bloom).'
  },
  {
    key:'xbloom', label:'xBloom Studio / Original', short:'xBloom', category:'smart-brewer', type:'flow', icon:'brewer-xbloom',
    d50AnchorUm:600, um:[480, 740], ratio:16.0, ratioBounds:[14.5, 18.0], dose:15, water:240,
    tempByRoastC:mkRoastTemps(96, 95, 93, 91, 88, 85),
    rWater:2.10, etaTail:0.20, chiRet:0.07, fAbsDefault:1.00, nLayers:3, bedAreaCm2:22.0, deltaPExtKPa:0,
    defaultFilterId:'wave-bleached', oilPassFrac:0.02, typicalTimeS:[160, 210], targetRef:{ tdsPct:1.38, eyPct:20.0 },
    epistemicTier:'verified_science',
    blurb:'Integrated 48 mm conical burr (60-70 RPM low-fines clarity vs 80-90 balanced vs 100-120 body) + kinematic spout (center/spiral/circular).'
  },
  {
    key:'switch', label:'Hario Switch (02 / 03)', short:'Switch', category:'hybrid', type:'hybrid', icon:'brewer-switch',
    d50AnchorUm:640, um:[520, 780], ratio:15.5, ratioBounds:[14.0, 17.5], dose:16, water:250,
    cap02G:260, cap03G:380,
    tempByRoastC:mkRoastTemps(97, 95, 93, 91, 88, 85),
    rWater:2.20, etaTail:0.55, chiRet:0.75, fAbsDefault:1.00, nLayers:3, bedAreaCm2:28.3, deltaPExtKPa:0,
    defaultFilterId:'cone-bleached', oilPassFrac:0.02, typicalTimeS:[180, 225], targetRef:{ tdsPct:1.38, eyPct:20.2 },
    epistemicTier:'verified_science',
    blurb:'Ball-valve steep-and-release cone: Pure Steep when W <= cap (02=260 g, 03=380 g) or 2-Stage Open Percolation Flush + Closed Steep when W > cap.'
  },
  {
    key:'clever', label:'Clever Dripper', short:'Clever', category:'hybrid', type:'hybrid', icon:'brewer-clever',
    d50AnchorUm:660, um:[540, 820], ratio:15.5, ratioBounds:[14.0, 17.5], dose:18, water:280,
    tempByRoastC:mkRoastTemps(97, 95, 93, 91, 88, 85),
    rWater:2.20, etaTail:0.95, chiRet:0.92, fAbsDefault:1.00, nLayers:1, bedAreaCm2:32.0, deltaPExtKPa:0,
    defaultFilterId:'trapezoid-wedge', oilPassFrac:0.02, typicalTimeS:[180, 255], targetRef:{ tdsPct:1.38, eyPct:20.2 },
    epistemicTier:'verified_science',
    blurb:'Lidded trapezoid steep-and-release; supports Water-First stall-free mode (drains 35-50 s faster by keeping micro-fines trapped in upper raft).',
    subModes:[
      { id:'clever-water-first', label:'Water-First Stall-Free', d50Um:640, ratio:15.5 },
      { id:'clever-classic', label:'Coffee-First Stirred Steep', d50Um:660, ratio:15.5 }
    ]
  },
  {
    key:'aeropress', label:'AeroPress', short:'AeroPress', category:'immersion', type:'hybrid', icon:'brewer-aeropress',
    d50AnchorUm:500, um:[340, 680], ratio:15.5, ratioBounds:[4.0, 17.5], dose:15, water:232,
    tempByRoastC:mkRoastTemps(96, 94, 91, 88, 84, 80),
    rWater:1.65, etaTail:0.95, chiRet:0.88, fAbsDefault:1.00, nLayers:2, bedAreaCm2:31.2, deltaPExtKPa:28,
    defaultFilterId:'ap-paper-single', oilPassFrac:0.04, typicalTimeS:[120, 160], targetRef:{ tdsPct:1.38, eyPct:20.2 },
    epistemicTier:'verified_science',
    blurb:'Cylindrical immersion + gentle 0.15-0.30 bar forearm press; supports Standard (2:00), Inverted, Concentrate (1:5), and Gagne 9-min Steep.',
    subModes:[
      { id:'ap-standard', label:'Standard Upright (2:15)', d50Um:500, ratio:15.5 },
      { id:'ap-inverted', label:'Inverted Full Steep', d50Um:500, ratio:15.0 },
      { id:'ap-gagne', label:'Gagne 9-Minute Equilibrium', d50Um:540, ratio:16.0 },
      { id:'ap-concentrate', label:'Espresso-Style Concentrate + Bypass', d50Um:380, ratio:5.0 }
    ]
  },
  {
    key:'siphon', label:'Vacuum Siphon', short:'Siphon', category:'immersion', type:'siphon', icon:'brewer-siphon',
    d50AnchorUm:580, um:[480, 700], ratio:15.5, ratioBounds:[14.0, 17.0], dose:20, water:310,
    tempByRoastC:mkRoastTemps(94, 93, 92, 92, 91, 90),
    rWater:2.00, etaTail:0.92, chiRet:0.95, fAbsDefault:1.00, nLayers:1, bedAreaCm2:38.5, deltaPExtKPa:55,
    defaultFilterId:'cloth-nel-flannel', oilPassFrac:0.35, typicalTimeS:[105, 150], targetRef:{ tdsPct:1.38, eyPct:20.0 },
    epistemicTier:'verified_science',
    blurb:'Vapor-pressure ascent (~91-94 C isothermal upper globe) + gentle bamboo paddle fold + 0.4-0.55 bar vacuum drawdown.'
  },
  {
    key:'press', label:'French Press', short:'French Press', category:'immersion', type:'immersion', icon:'brewer-press',
    d50AnchorUm:850, um:[720, 1050], ratio:15.0, ratioBounds:[13.0, 17.0], dose:20, water:300,
    tempByRoastC:mkRoastTemps(97, 95, 94, 92, 89, 86),
    rWater:2.40, etaTail:1.00, chiRet:1.00, fAbsDefault:1.00, nLayers:1, bedAreaCm2:56.7, deltaPExtKPa:0,
    defaultFilterId:'press-spiral-mesh', oilPassFrac:0.95, typicalTimeS:[480, 570], targetRef:{ tdsPct:1.40, eyPct:20.5 },
    epistemicTier:'verified_science',
    blurb:'Modern settled immersion: break crust & skim foam/oils at 4:00, settle undisturbed to 8:30, stop screen at liquid surface, decant cleanly.'
  },
  {
    key:'turkish', label:'Turkish / Ibrik Cezve', short:'Turkish Cezve', category:'decoction', type:'stove', icon:'brewer-turkish',
    d50AnchorUm:90, kineticsPowderUm:85, um:[55, 130], ratio:9.5, ratioBounds:[8.0, 11.5], dose:8, water:76,
    tempByRoastC:mkRoastTemps(93, 93, 93, 92, 92, 91),
    rWater:1.35, etaTail:1.00, chiRet:1.00, fAbsDefault:1.00, nLayers:1, bedAreaCm2:22.0, deltaPExtKPa:0,
    defaultFilterId:'unfiltered-sediment', oilPassFrac:0.95, typicalTimeS:[135, 180], targetRef:{ tdsPct:2.10, eyPct:19.5 },
    epistemicTier:'verified_science',
    blurb:'Pulverized suspension decoction: stir cold/warm before heat, slow 2:15-2:45 rise to 92-94 C kopuk foam crest — NEVER boil (100 C destroys crema & extracts harsh polyphenols).'
  },
  {
    key:'phin', label:'Vietnamese Phin', short:'Phin', category:'percolation', type:'flow', icon:'brewer-phin',
    d50AnchorUm:560, um:[450, 680], ratio:4.5, ratioBounds:[3.5, 8.0], dose:20, water:90,
    tempByRoastC:mkRoastTemps(96, 95, 93, 91, 89, 86),
    rWater:1.80, etaTail:0.22, chiRet:0.12, fAbsDefault:1.00, nLayers:3, bedAreaCm2:28.3, deltaPExtKPa:0,
    defaultFilterId:'espresso-precision-basket', oilPassFrac:0.45, typicalTimeS:[240, 360], targetRef:{ tdsPct:3.80, eyPct:19.0 },
    epistemicTier:'verified_science',
    blurb:'Gravity-damped perforated metal drip: Traditional Ca Phe Sua Da (1:4.5 over sweetened condensed milk + ice) or Specialty Black (1:6.0-7.0).',
    subModes:[
      { id:'phin-suada', label:'Traditional Ca Phe Sua Da (1:4.5)', d50Um:540, ratio:4.5 },
      { id:'phin-black', label:'Specialty Black Phin (1:6.0)', d50Um:580, ratio:6.0 }
    ]
  },
  {
    key:'cold', label:'Immersion Cold Brew', short:'Cold Brew', category:'cold', type:'cold', icon:'brewer-cold',
    d50AnchorUm:980, um:[820, 1180], ratio:11.0, ratioBounds:[4.5, 15.0], dose:50, water:550,
    tempByRoastC:mkRoastTemps(4, 4, 4, 4, 4, 4),
    rWater:2.30, etaTail:1.00, chiRet:1.00, fAbsDefault:1.00, nLayers:1, bedAreaCm2:78.5, deltaPExtKPa:0,
    defaultFilterId:'metal-mesh-fine', oilPassFrac:0.05, typicalTimeS:[50400, 79200], targetRef:{ tdsPct:1.55, eyPct:19.2 },
    epistemicTier:'verified_science',
    blurb:'Van \'t Hoff low-temperature diffusion (4 C fridge 18-22 h or 20 C ambient 12-16 h) suppressing high-Ea bitter phenylindanes; refrigerate <=4 C.',
    subModes:[
      { id:'cold-rtd-4c', label:'4 C Fridge Ready-to-Drink (18-22 h)', d50Um:980, ratio:11.0, tempC:4 },
      { id:'cold-room-20c', label:'20 C Room Immersion (12-16 h)', d50Um:980, ratio:11.0, tempC:20 },
      { id:'cold-conc', label:'1:5.5 Concentrate', d50Um:920, ratio:5.5, tempC:4 }
    ]
  },
  {
    key:'cold_drip', label:'Kyoto Cold Drip Tower', short:'Kyoto Cold Drip', category:'cold', type:'cold', icon:'brewer-cold-drip',
    d50AnchorUm:680, um:[560, 820], ratio:10.0, ratioBounds:[7.5, 13.0], dose:40, water:400,
    dropsPerMin:[40, 50], flowMlPerHour:[80, 120],
    tempByRoastC:mkRoastTemps(3, 3, 3, 3, 3, 3),
    rWater:2.05, etaTail:0.20, chiRet:0.10, fAbsDefault:1.00, nLayers:3, bedAreaCm2:32.0, deltaPExtKPa:0,
    defaultFilterId:'pulsar-tricolate-disc', oilPassFrac:0.04, typicalTimeS:[12600, 18000], targetRef:{ tdsPct:2.40, eyPct:19.6 },
    epistemicTier:'verified_science',
    blurb:'Ice-water (1-5 C) zero-agitation percolation at 40-50 drops/min (~80-120 mL/h) with pre-wetted medium bed (680 um) + top dispersion paper for wine-like ester clarity.'
  },
  {
    key:'espresso', label:'Espresso (9-Bar / Turbo / Soup)', short:'Espresso', category:'espresso', type:'espresso', icon:'brewer-espresso',
    d50AnchorUm:235, um:[180, 600], ratio:2.0, ratioBounds:[1.3, 5.5], outRatio:true, dose:18, water:36,
    tempByRoastC:mkRoastTemps(96, 95, 93, 92, 90, 88),
    rWater:1.00, etaTail:0.35, chiRet:0.10, fAbsDefault:0.95, nLayers:3, bedAreaCm2:26.8, deltaPExtKPa:900,
    defaultFilterId:'espresso-precision-basket', oilPassFrac:0.45, typicalTimeS:[25, 32], targetRef:{ tdsPct:9.8, eyPct:20.0 },
    epistemicTier:'verified_science',
    blurb:'High/low-pressure packed-bed Darcy flow across 5 physics regimes: Classic 9-Bar, Ristretto, 6-Bar Turbo (Cameron & Hendon 2020), Allonge, and Soup / Filter 2.0.',
    subModes:[
      { id:'esp-9bar', label:'Classic 9-Bar (1:2.0, 28 s)', d50Um:235, ratio:2.0, bar:9.0, timeS:28 },
      { id:'esp-ristretto', label:'Ristretto (1:1.5, 25 s)', d50Um:215, ratio:1.5, bar:9.0, timeS:25 },
      { id:'esp-turbo', label:'6-Bar Turbo Shot (1:2.8, 16 s)', d50Um:310, ratio:2.8, bar:6.0, timeS:16, rWater:1.15 },
      { id:'esp-allonge', label:'Allonge (1:4.8, 28 s)', d50Um:290, ratio:4.8, bar:6.5, timeS:28 },
      { id:'esp-soup', label:'Soup / Filter 2.0 (1.5 Bar + Paper + Bypass)', d50Um:480, ratio:3.5, bypassToRatio:16.0, bar:1.5, timeS:26, rWater:0.95, filterId:'ap-paper-single' }
    ]
  },
  {
    key:'lever_espresso', label:'Manual / Spring Lever Espresso', short:'Lever Espresso', category:'espresso', type:'espresso', icon:'brewer-lever-espresso',
    d50AnchorUm:230, um:[175, 580], ratio:2.2, ratioBounds:[1.5, 4.5], outRatio:true, dose:18, water:40,
    tempByRoastC:mkRoastTemps(96, 94, 93, 91, 89, 87),
    rWater:1.00, etaTail:0.32, chiRet:0.10, fAbsDefault:0.95, nLayers:3, bedAreaCm2:26.4, deltaPExtKPa:850,
    defaultFilterId:'espresso-precision-basket', oilPassFrac:0.45, typicalTimeS:[32, 42], targetRef:{ tdsPct:9.4, eyPct:20.8 },
    epistemicTier:'verified_science',
    blurb:'Flair 58 / Londinium declining lever profile: 1.5-2.0 bar pre-infusion soak (10 s) \u2192 8.5 bar peak \u2192 smooth decay to 4.0 bar as puck erodes, plus cylinder preheat physics.',
    subModes:[
      { id:'lever-londinium', label:'Londinium Declining (8.5 \u2192 4.0 Bar)', d50Um:230, ratio:2.2, peakBar:8.5, endBar:4.0, timeS:37 },
      { id:'lever-6bar', label:'Modern 6-Bar Light Lever (6.0 \u2192 3.5 Bar)', d50Um:285, ratio:2.6, peakBar:6.0, endBar:3.5, timeS:25 },
      { id:'lever-turbo', label:'Lever Turbo (6.0 Bar, 17 s)', d50Um:310, ratio:2.8, peakBar:6.0, endBar:4.5, timeS:17 },
      { id:'lever-soup', label:'Lever Soup (1.5 Bar + Bottom Paper)', d50Um:460, ratio:3.5, peakBar:1.5, endBar:1.2, timeS:26, filterId:'ap-paper-single' }
    ]
  },
  {
    key:'moka', label:'Stovetop Moka Pot', short:'Moka Pot', category:'pressure', type:'moka', icon:'brewer-moka',
    d50AnchorUm:380, um:[310, 470], ratio:7.5, ratioBounds:[6.5, 9.0], dose:18, water:135,
    tempByRoastC:mkRoastTemps(85, 82, 78, 75, 55, 40),
    rWater:1.35, boilerResidualFrac:0.18, etaTail:0.30, chiRet:0.15, fAbsDefault:1.00, nLayers:3, bedAreaCm2:24.6, deltaPExtKPa:135,
    defaultFilterId:'espresso-precision-basket', oilPassFrac:0.75, typicalTimeS:[150, 240], targetRef:{ tdsPct:3.85, eyPct:19.2 },
    epistemicTier:'verified_science',
    blurb:'1.2-1.8 bar steam-driven upward percolation; preheated 75-85 C base water on light/med roasts prevents dry-baking puck (Navarini 2009); quench base before 100 C sputter.'
  },
  {
    key:'philips5500', label:'Philips 5500 LatteGo', short:'Philips 5500', category:'superauto', type:'auto', machine:true, icon:'brewer-philips5500',
    d50AnchorUm:320, um:[250, 460], ratio:3.8, ratioBounds:[2.0, 18.0], dose:9.3, water:120,
    tempByRoastC:mkRoastTemps(98, 97, 96, 94, 92, 90),
    rWater:1.15, etaTail:0.35, chiRet:0.14, fAbsDefault:0.95, nLayers:3, bedAreaCm2:22.9, deltaPExtKPa:650,
    defaultFilterId:'espresso-precision-basket', oilPassFrac:0.45, typicalTimeS:[22, 45], targetRef:{ tdsPct:3.40, eyPct:19.5 },
    epistemicTier:'verified_science',
    blurb:'EP5500/EP5547 super-automatic: 22 drinks (incl. Travel Mug 240/360 mL), 12-step ceramic burr (adjust MAX 1 notch ONLY while grinding), SAS 3-5 shot dose adaptation, Aroma 1-5 + ExtraShot & Iced Auto Cool Pulse.'
  }
], 'key');

const METHODS = METHOD_PHYSICS_V6.filter(m => !m.machine);
const MACHINES = METHOD_PHYSICS_V6.filter(m => !!m.machine);
const isMachine = key => MACHINES.some(x => x.key === key);
function methodPhysicsFor(key){
  return METHOD_PHYSICS_V6[key] || METHOD_PHYSICS_V6.v60;
}

/* Techniques, Ratio & Boiling Helpers */
const PULSE_TASTE = { sweet:{ split:[0.42, 0.58], label:'Sweeter' }, balanced:{ split:[0.50, 0.50], label:'Balanced' }, bright:{ split:[0.58, 0.42], label:'Brighter' } };
const PULSE_STRENGTH = { light:{ pulses:2, label:'Lighter' }, standard:{ pulses:3, label:'Standard' }, strong:{ pulses:4, label:'Richer' } };
const ICE_SHARES = [0.30, 0.38, 0.40];
const TECHNIQUES = [
  { key:'standard', label:'Standard Hot', short:'Standard' },
  { key:'pulse', label:'Multi-Pulse / 4:6', short:'Pulse' },
  { key:'flash', label:'Flash Iced (Over Ice)', short:'Flash Iced' },
  { key:'iceafter', label:'Chill Over Ice After', short:'Iced After' },
  { key:'samo', label:'Samo Cool-Bloom (60 C / RT)', short:'Samo Bloom' },
  { key:'turbo', label:'6-Bar Turbo Shot', short:'6-Bar Turbo' },
  { key:'soup', label:'Soup / Filter 2.0', short:'Soup' },
  { key:'waterfirst', label:'Water-First Steep', short:'Water-First' }
];
function techniquesFor(methodKey){
  if (methodKey === 'espresso' || methodKey === 'lever_espresso') return ['standard', 'turbo', 'soup', 'iceafter'];
  if (methodKey === 'clever') return ['standard', 'waterfirst', 'flash'];
  if (methodKey === 'cold' || methodKey === 'cold_drip' || methodKey === 'turkish' || methodKey === 'moka') return ['standard'];
  if (methodKey === 'aiden' || methodKey === 'xbloom') return ['standard', 'pulse', 'samo', 'flash'];
  return ['standard', 'pulse', 'flash', 'iceafter'];
}
function ratioBounds(methodKey){
  const m = methodPhysicsFor(methodKey);
  return m.ratioBounds ? m.ratioBounds.slice() : [10, 22];
}
/* Fixes Bug C10: additive stretch on Phin (0.5x) and filter/immersion (1.0x) without zeroing out tight ratios */
function ratioFor(methodKey, coffee, stretch){
  const m = methodPhysicsFor(methodKey);
  const bounds = m.ratioBounds || [10, 22];
  const fit = r => clampNum(rnd(r, 1), bounds[0], bounds[1], m.ratio);
  let base = m.ratio;
  const c = coffee || {};
  const roast = c.roast || 'medium';
  if (!m.outRatio && methodKey !== 'cold' && methodKey !== 'cold_drip') {
    if (roast === 'ultra-light') base += (methodKey === 'phin' ? 0.5 : 0.5);
    else if (roast === 'dark') base -= (methodKey === 'phin' ? 0.3 : 0.5);
    if (/gei?sha/i.test(String(c.varietal || '') + ' ' + String(c.name || '')) && m.type === 'flow') base += 0.5;
  }
  const r = fit(base);
  let sg = null, stretchWhy = '';
  if (stretch && isFinite(+stretch) && +stretch !== 0 && !m.outRatio) {
    const stepScale = methodKey === 'phin' ? 0.5 : 1.0;
    sg = fit(r + (+stretch) * stepScale);
    const actualDelta = rnd(sg - r, 1);
    if (Math.abs(actualDelta) >= 0.1) {
      stretchWhy = (actualDelta > 0 ? '+' : '') + actualDelta + ' ratio stretch for porous/fermented clarity [Craft Best Practice].';
    } else {
      sg = null;
    }
  }
  return { ratio:r, stretchRatio:sg, stretchDelta:sg != null ? rnd(sg - r, 1) : 0, stretchWhy, bounds };
}

/* ISA + Clausius-Clapeyron Boiling Point in F and C */
function boilingPointC_base(elevM){
  const z = clampNum(elevM, -430, 5500, 0);
  const pAtm = 101325 * Math.pow(1 - (0.0065 * z) / 288.15, 5.25588);
  const invT = (1 / 373.15) - (8.314462618 / 40660) * Math.log(pAtm / 101325);
  return rnd((1 / invT) - 273.15, 2);
}
function boilingF(elevFtOrM, isMeters){
  const zM = isMeters ? (+elevFtOrM || 0) : ((+elevFtOrM || 0) * 0.3048);
  return rnd(cToF(boilingPointC_base(zM)), 1);
}

/* Yield & Bidirectional Ratio Engine */
const WATER_HELD_PER_G = 2.10;
const RINSE_WATER_G = 60;
const YIELD_TABLE = {};
METHOD_PHYSICS_V6.forEach(m => {
  YIELD_TABLE[m.key] = {
    kind: m.key === 'moka' ? 'moka' : m.key === 'turkish' ? 'boil' : 'filter',
    r: m.rWater,
    rlo: rnd(Math.max(0.8, m.rWater - 0.25), 2),
    rhi: rnd(m.rWater + 0.25, 2),
    outRatio: !!m.outRatio,
    tds: m.targetRef ? m.targetRef.tdsPct : 1.35,
    share: 0.80,
    boil: 8,
    sludge: 10
  };
});
const PAPER_METHODS = METHOD_PHYSICS_V6.filter(m => {
  const f = FILTERS_V6[m.defaultFilterId];
  return f && f.material === 'paper';
}).map(m => m.key);
const usesPaper = key => PAPER_METHODS.includes(key);
const filterHeldG = key => {
  const m = methodPhysicsFor(key);
  const f = FILTERS_V6[m.defaultFilterId];
  return f ? (f.wDryG || 0) : 0;
};
function yieldRetention(key, own){
  const t = YIELD_TABLE[key] || YIELD_TABLE.v60;
  const cal = own && typeof own === 'object' && isFinite(+own[key]) && +own[key] >= 0.6 && +own[key] <= 3.6 ? +own[key] : null;
  const r = cal != null ? cal : t.r;
  return { r, lo:t.rlo, hi:t.rhi, calibrated:cal != null };
}
function yieldCup(p){
  p = p || {};
  const key = YIELD_TABLE[p.key] ? p.key : 'v60', t = YIELD_TABLE[key];
  const D = +p.dose, W = +p.water;
  if (!(D > 0 && W > 0)) return { ok:false };
  const bypass = +p.bypass > 0 ? +p.bypass : 0;
  const tds = +p.tds > 0 ? +p.tds : (t.tds || 1.35);
  const tf = clampNum(tds / 100, 0, 0.35, 0.0135);
  const wDry = p.dryFilter && usesPaper(key) ? filterHeldG(key) : 0;
  if (t.kind === 'moka') {
    const wBoilerRes = W * 0.18;
    const wPuckRet = 1.35 * D;
    const wCupClean = Math.max(0, W - wBoilerRes - wPuckRet);
    const B = (wCupClean / (1 - tf)) + bypass;
    return { ok:B > 0, B:rnd(B, 1), kept:rnd(wBoilerRes + wPuckRet, 1), boilerResidualG:rnd(wBoilerRes, 1), puckRetainedG:rnd(wPuckRet, 1) };
  }
  if (t.kind === 'boil') {
    const B = Math.max(0, W * 0.92 - 1.35 * D) + bypass;
    return { ok:B > 0, B:rnd(B, 1), kept:rnd(W * 0.08 + 1.35 * D, 1) };
  }
  const rr = yieldRetention(key, p.own);
  const wCup0 = W - rr.r * D - wDry;
  if (wCup0 <= 0) return { ok:false, B:0, kept:rnd(W, 1) };
  const B = (wCup0 / (1 - tf)) + bypass;
  return { ok:true, B:rnd(B, 1), kept:rnd(rr.r * D + wDry, 1), r:rr.r };
}
function yieldWater(p){
  p = p || {};
  const key = YIELD_TABLE[p.key] ? p.key : 'v60', t = YIELD_TABLE[key];
  const B = +p.cup, R = +p.ratio;
  if (!(B > 0 && R > 0)) return { ok:false };
  const bypass = +p.bypass > 0 ? +p.bypass : 0;
  const bNet = Math.max(0, B - bypass);
  const tds = +p.tds > 0 ? +p.tds : (t.tds || 1.35);
  const tf = clampNum(tds / 100, 0, 0.35, 0.0135);
  const rr = yieldRetention(key, p.own);
  if (t.outRatio) {
    const D = B / R;
    const W = bNet * (1 - tf) + rr.r * D;
    return { ok:D > 0 && W > 0, D:rnd(D, 1), W:rnd(W, 1), B };
  }
  if (t.kind === 'moka') {
    const denomMoka = 0.82 * R - 1.35;
    if (denomMoka <= 0.1) return { ok:false };
    const D = (bNet * (1 - tf)) / denomMoka, W = D * R;
    return { ok:D > 0 && W > 0, D:rnd(D, 1), W:rnd(W, 1), B };
  }
  if (t.kind === 'boil') {
    const boilKeep = 1 - (t.boil || 8) / 100;
    const denomBoil = boilKeep * R - 1.35;
    if (denomBoil <= 0.05) return { ok:false };
    const D = bNet / denomBoil, W = D * R;
    return { ok:D > 0 && W > 0, D:rnd(D, 1), W:rnd(W, 1), B };
  }
  const wDry = p.dryFilter && usesPaper(key) ? filterHeldG(key) : 0;
  const denom = R - rr.r;
  if (denom <= 0.15) return { ok:false };
  const D = (bNet * (1 - tf) + wDry) / denom;
  const W = D * R;
  return { ok:D > 0 && W > 0, D:rnd(D, 1), W:rnd(W, 1), B };
}
function expectedYield(key, waterG, doseG, opts){
  const yc = yieldCup(Object.assign({ key, water:waterG, dose:doseG }, opts || {}));
  return yc.ok ? yc.B : Math.max(0, (+waterG || 0) - 2.1 * (+doseG || 0));
}
const aboutGrams = x => Math.round(+x || 0);
function kettleFill(pourWaterG, opts){
  const w = +pourWaterG || 0;
  if (w <= 0) return 0;
  opts = opts || {};
  if (opts.method === 'cold' || opts.method === 'cold_drip' || opts.method === 'philips5500') return Math.ceil(w / 5) * 5;
  const needPaper = opts.method ? usesPaper(opts.method) : true;
  const rinse = opts.rinse != null ? Math.max(0, +opts.rinse) : (needPaper ? RINSE_WATER_G : 0);
  const dead = opts.margin != null ? Math.max(0, +opts.margin) : (opts.method === 'turkish' ? 15 : opts.method === 'moka' ? 20 : (opts.method === 'espresso' || opts.method === 'lever_espresso' ? 0 : 85));
  return Math.ceil((w + rinse + dead) / 5) * 5;
}

function yieldClean(raw){
  const out = {};
  if (!raw || typeof raw !== 'object') return out;
  Object.keys(raw).forEach(k => {
    if (!YIELD_TABLE[k]) return;
    const v = +raw[k];
    if (isFinite(v) && v >= 0.4 && v <= 4.2) out[k] = rnd(v, 2);
  });
  return out;
}
function yieldCalibrate(p){
  p = p || {};
  const key = YIELD_TABLE[p.key] ? p.key : 'v60', t = YIELD_TABLE[key];
  const D = +p.dose, W = +p.water, B = +p.cup;
  if (!(D > 0 && W > 0 && B > 0 && W > B * 0.5)) return { ok:false, why:'Enter dry dose, water poured, and weighed beverage yield.' };
  const tds = +p.tds > 0 ? +p.tds : (t.tds || 1.35);
  const tf = clampNum(tds / 100, 0, 0.35, 0.0135);
  const wDry = p.dryFilter && usesPaper(key) ? filterHeldG(key) : 0;
  const rMeas = (W - B * (1 - tf) - wDry) / D;
  if (!(isFinite(rMeas) && rMeas >= 0.4 && rMeas <= 4.2)) return { ok:false, why:'Measured retention (' + rnd(rMeas, 2) + ' g/g) is outside physical bounds [0.4, 4.2].' };
  const nextOwn = yieldClean(p.own);
  nextOwn[key] = rnd(rMeas, 2);
  return { ok:true, key, retentionPerG:rnd(rMeas, 2), defaultRetentionPerG:(YIELD_TABLE[key].r || 2.1), own:nextOwn };
}

function solveBidirectionalRatio(p){
  p = p || {};
  const key = YIELD_TABLE[p.key] ? p.key : 'v60', t = YIELD_TABLE[key];
  const anchor = ['ratio', 'dose', 'water', 'cup'].includes(p.anchor) ? p.anchor : 'ratio';
  const edited = ['ratio', 'dose', 'water', 'cup'].includes(p.edited) ? p.edited : (anchor === 'dose' ? 'ratio' : 'dose');
  const own = p.own, dryFilter = !!p.dryFilter && usesPaper(key), wDry = dryFilter ? filterHeldG(key) : 0;
  const bypass = +p.bypass > 0 ? +p.bypass : 0;
  const tds = +p.tds > 0 ? +p.tds : (t.tds || 1.35), tf = clampNum(tds / 100, 0.001, 0.35, 0.0135);
  const rr = yieldRetention(key, own);
  const lRet = rr.r;
  const isYieldBasis = !!t.outRatio;
  let D = +p.dose, W = +p.water, B = +p.cup, R = +p.ratio;

  const wReqFromDoseCup = (dVal, bNetVal) => {
    if (t.kind === 'moka') return (bNetVal * (1 - tf) + 1.35 * dVal) / 0.82;
    if (t.kind === 'boil') return (bNetVal + 1.35 * dVal) / (1 - (t.boil || 8) / 100);
    return bNetVal * (1 - tf) + lRet * dVal + wDry;
  };
  const dEstFromWaterCup = (wVal, bNetVal) => {
    if (t.kind === 'moka') return (0.82 * wVal - bNetVal * (1 - tf)) / 1.35;
    if (t.kind === 'boil') return ((1 - (t.boil || 8) / 100) * wVal - bNetVal) / 1.35;
    return (wVal - bNetVal * (1 - tf) - wDry) / Math.max(0.2, lRet);
  };

  const forwardFromDoseRatio = (dVal, rVal) => {
    if (!(dVal > 0 && rVal > 0)) return null;
    if (isYieldBasis) {
      const bOut = dVal * rVal;
      const wIn = Math.max(0, bOut - bypass) * (1 - tf) + lRet * dVal;
      return { D:dVal, W:wIn, B:bOut, R:rVal };
    }
    const wPour = Math.max(0, dVal * rVal - bypass);
    const yc = yieldCup({ key, dose:dVal, water:wPour, own, tds, dryFilter, bypass });
    if (!yc.ok) return null;
    return { D:dVal, W:wPour, B:yc.B, R:rVal };
  };

  let sol = null;
  if (anchor === 'ratio') {
    if (!(R > 0)) return { ok:false, why:'Enter a valid ratio above 0.' };
    if (edited === 'cup') {
      const yw = yieldWater({ key, cup:B, ratio:R, own, tds, dryFilter, bypass });
      if (!yw.ok) return { ok:false, why:'Ratio 1:' + R + ' does not exceed retention (' + lRet.toFixed(2) + ' g/g).' };
      sol = { D:yw.D, W:yw.W, B:B, R:R };
    } else if (edited === 'water') {
      if (!(W > 0)) return { ok:false, why:'Enter water poured above 0 g.' };
      const dEst = isYieldBasis ? (W / (R * (1 - tf) + lRet)) : ((W + bypass) / R);
      sol = forwardFromDoseRatio(dEst, R);
    } else {
      sol = forwardFromDoseRatio(D, R);
    }
  } else if (anchor === 'dose') {
    if (!(D > 0)) return { ok:false, why:'Enter dry coffee dose above 0 g.' };
    if (edited === 'water' && W > 0) {
      const yc = yieldCup({ key, dose:D, water:W, own, tds, dryFilter, bypass });
      if (!yc.ok) return { ok:false, why:'Pour water must exceed grounds absorption.' };
      sol = { D:D, W:W, B:yc.B, R:isYieldBasis ? (yc.B / D) : ((W + bypass) / D) };
    } else if (edited === 'cup' && B > 0) {
      const bNet = Math.max(0, B - bypass);
      const wReq = wReqFromDoseCup(D, bNet);
      sol = { D:D, W:wReq, B:B, R:isYieldBasis ? (B / D) : ((wReq + bypass) / D) };
    } else {
      sol = forwardFromDoseRatio(D, R);
    }
  } else if (anchor === 'water') {
    if (!(W > 0)) return { ok:false, why:'Enter water to pour above 0 g.' };
    if (edited === 'ratio' && R > 0) {
      const dEst = isYieldBasis ? (W / (R * (1 - tf) + lRet)) : ((W + bypass) / R);
      sol = forwardFromDoseRatio(dEst, R);
    } else if (edited === 'cup' && B > 0) {
      const bNet = Math.max(0, B - bypass);
      const dEst = dEstFromWaterCup(W, bNet);
      if (dEst > 0) sol = { D:dEst, W:W, B:B, R:isYieldBasis ? (B / dEst) : ((W + bypass) / dEst) };
    } else if (D > 0) {
      const yc = yieldCup({ key, dose:D, water:W, own, tds, dryFilter, bypass });
      if (yc.ok) sol = { D:D, W:W, B:yc.B, R:isYieldBasis ? (yc.B / D) : ((W + bypass) / D) };
    }
  } else if (anchor === 'cup') {
    if (!(B > 0)) return { ok:false, why:'Enter target cup yield above 0 g.' };
    if (edited === 'dose' && D > 0) {
      const bNet = Math.max(0, B - bypass);
      const wReq = wReqFromDoseCup(D, bNet);
      sol = { D:D, W:wReq, B:B, R:isYieldBasis ? (B / D) : ((wReq + bypass) / D) };
    } else if (R > 0) {
      const yw = yieldWater({ key, cup:B, ratio:R, own, tds, dryFilter, bypass });
      if (yw.ok) sol = { D:yw.D, W:yw.W, B:B, R:R };
    }
  }
  if (!sol || !(sol.D > 0 && sol.W > 0 && sol.B > 0 && sol.R > 0 && isFinite(sol.D) && isFinite(sol.W) && isFinite(sol.B) && isFinite(sol.R))) {
    return { ok:false, why:'Adjust dose, ratio, or water within physical bounds (ratio must exceed coffee retention).' };
  }
  const keptG = t.kind === 'moka' ? (sol.W * 0.18 + 1.35 * sol.D) : t.kind === 'boil' ? (sol.W * 0.08 + 1.35 * sol.D) : Math.max(0, lRet * sol.D + wDry);
  const refDose = key === 'chemex' ? 30 : (key === 'drip' || key === 'cold') ? 55 : key === 'press' ? 25 : 18;
  const alpha = (key === 'kalita' || key === 'drip' || key === 'orea') ? 0.22 : ['v60','origami','chemex','switch','aiden','pulsar'].includes(key) ? 0.18 : 0;
  const darcyFactor = alpha > 0 && sol.D > 0 ? Math.pow(sol.D / refDose, alpha) : 1;
  return {
    ok:true, key, basis:isYieldBasis ? 'yield' : 'water', anchor,
    D:rnd(sol.D, 1), W:rnd(sol.W, 1), B:rnd(sol.B, 1), R:rnd(sol.R, 2),
    bypass, wDry, keptG:rnd(keptG, 1), lRet, tds,
    kettleG:kettleFill(sol.W, { method:key, rinse:usesPaper(key) && !dryFilter ? RINSE_WATER_G : 0 }),
    darcyFactor:rnd(darcyFactor, 3)
  };
}

function calcConcentrateDilution(p){
  p = p || {};
  const concG = +p.concG;
  if (!(concG > 0)) return { ok:false, why:'Enter concentrate weight above 0 g.' };
  if (p.by === 'tds') {
    const c = +p.concTds, g = +p.targetTds;
    if (!(c > 0 && g > 0 && c > g)) return { ok:false, why:'Concentrate %TDS must exceed target %TDS.' };
    const addWaterG = concG * (c / g - 1);
    return { ok:true, by:'tds', concG, addWaterG:rnd(addWaterG, 1), totalG:rnd(concG + addWaterG, 1), parts:rnd(addWaterG / concG, 2) };
  }
  const rBrew = +p.brewRatio, rTarget = +p.targetRatio, lRet = clampNum(p.lRet, 0, 3.2, 2.0);
  if (!(rBrew > lRet + 0.2 && rTarget > rBrew)) return { ok:false, why:'Target drinking ratio must exceed concentrate brew ratio.' };
  const addWaterG = Math.max(0, concG * ((rTarget - lRet) / (rBrew - lRet) - 1));
  return { ok:true, by:'ratio', concG, addWaterG:rnd(addWaterG, 1), totalG:rnd(concG + addWaterG, 1), parts:rnd(addWaterG / concG, 2) };
}

/* ---------- 5. Unified 23-Method Micron Anchors & 48+ Grinder Catalog (Fixes Bug C6 & C7) ---------- */
const METHOD_TARGET_UM = {};
METHOD_PHYSICS_V6.forEach(m => {
  const cat = m.key === 'turkish' ? 'turkish'
    : (m.key === 'espresso' || m.key === 'lever_espresso' || m.key === 'philips5500') ? 'espresso'
    : m.key === 'moka' ? 'moka'
    : m.key === 'aeropress' ? 'aeropress'
    : m.key === 'chemex' ? 'chemex'
    : m.key === 'drip' ? 'drip'
    : m.key === 'press' ? 'press'
    : m.key === 'cold' ? 'cold'
    : 'filter';
  METHOD_TARGET_UM[m.key] = { anchor:m.d50AnchorUm, range:m.um.slice(), cat, label:m.label };
});

/* Burr Geometry Archetypes for Bimodal PSD Physics (nextgen_bt_core_engine.md §2.2) */
const BURR_ARCHETYPES_V6 = {
  unimodal_flat:     { id:'unimodal_flat',     phiFBase:0.065, sigmaC:0.25, spanNom:0.95 },
  unimodal_conical:  { id:'unimodal_conical',  phiFBase:0.095, sigmaC:0.30, spanNom:1.12 },
  brew_flat:         { id:'brew_flat',         phiFBase:0.110, sigmaC:0.32, spanNom:1.24 },
  classic_conical:   { id:'classic_conical',   phiFBase:0.145, sigmaC:0.38, spanNom:1.40 },
  espresso_conical:  { id:'espresso_conical',  phiFBase:0.175, sigmaC:0.42, spanNom:1.56 },
  ceramic_preground: { id:'ceramic_preground', phiFBase:0.255, sigmaC:0.54, spanNom:2.05 },
  blade:             { id:'blade',             phiFBase:0.310, sigmaC:0.62, spanNom:2.40 }
};

const GRINDER_ARCHETYPE_MAP = {
  'fellow-ode-gen2-ssp':'unimodal_flat', 'timemore-sculptor-078':'unimodal_flat', 'timemore-sculptor-064':'unimodal_flat',
  'lagom-p64':'unimodal_flat', 'preground-cafe':'unimodal_flat', 'weber-eg1':'unimodal_flat', 'lagom-01':'unimodal_flat',
  'mahlkonig-ek43':'unimodal_flat', 'zerno-z1':'unimodal_flat', 'mazzer-philos':'brew_flat', 'df83v':'brew_flat', 'kafatek-monolith':'unimodal_flat',
  '1zpresso-zp6':'unimodal_conical', '1zpresso-k-ultra':'unimodal_conical', 'comandante-c40':'unimodal_conical',
  'comandante-red-clix':'unimodal_conical', 'kingrinder-k6':'unimodal_conical', 'timemore-s3':'unimodal_conical', 'xbloom-studio':'unimodal_conical',
  'fellow-ode-gen2':'brew_flat', 'fellow-ode-gen1':'brew_flat', 'wilfa-uniform':'brew_flat', 'df64-gen2':'brew_flat',
  'df54':'brew_flat', 'timemore-sculptor-078s':'brew_flat', 'timemore-sculptor-064s':'brew_flat', 'eureka-specialita':'brew_flat',
  'baratza-virtuoso-plus':'classic_conical', 'baratza-encore-esp':'classic_conical', '1zpresso-jx':'classic_conical',
  '1zpresso-jx-pro':'classic_conical', '1zpresso-x-ultra':'classic_conical', '1zpresso-q2':'classic_conical',
  'timemore-chestnut-x':'classic_conical', 'timemore-c3s':'classic_conical', 'timemore-c3esp':'classic_conical',
  'timemore-c2':'classic_conical', 'lagom-mini':'classic_conical', 'wilfa-svart':'classic_conical',
  'fellow-opus':'classic_conical', 'xbloom-original':'classic_conical',
  'niche-zero':'espresso_conical', '1zpresso-j-max':'espresso_conical', '1zpresso-j-ultra':'espresso_conical',
  'kinu-m47':'espresso_conical', 'kingrinder-k4':'espresso_conical', 'baratza-sette-270':'espresso_conical',
  'baratza-encore':'espresso_conical', 'breville-smart-grinder-pro':'espresso_conical', 'oxo-brew-conical':'espresso_conical',
  'hario-mss1dtb':'ceramic_preground', 'hario-skerton-pro':'ceramic_preground', 'kalita-kh3':'ceramic_preground',
  'preground-grocery-drip':'ceramic_preground', 'preground-grocery-espresso':'ceramic_preground'
};

function burrArchetypeFor(grinderKey){
  if (grinderKey === '1zpresso-zp6') return { id:'unimodal_conical', phiFBase:0.072, sigmaC:0.27, spanNom:1.02 };
  const archKey = GRINDER_ARCHETYPE_MAP[grinderKey] || (grinderKey === 'blade' ? 'blade' : 'classic_conical');
  return BURR_ARCHETYPES_V6[archKey] || BURR_ARCHETYPES_V6.classic_conical;
}

const GRINDER_CURVES = {
  /* 20 Computed Curves for Preserved Legacy Keys */
  'timemore-s3':                { minUm:320, maxUm:1300, minSafeRaw:10, maxRaw:90,  noEsp:true, knots:[[320,12],[380,17],[550,55],[640,64],[760,75],[980,85],[1300,90]], fmt:'s3_90_10' },
  'timemore-c3s':               { minUm:240, maxUm:1300, minSafeRaw:6,  maxRaw:28,  noTurk:true, knots:[[235,7],[380,10.5],[550,15],[640,16],[760,18],[980,22],[1300,25]], fmt:'int_clicks' },
  'timemore-c3esp':             { minUm:75,  maxUm:1300, minSafeRaw:10, maxRaw:80,  knots:[[85,14],[170,20],[235,25],[380,31],[550,46],[640,52],[760,58],[980,65],[1300,73]], fmt:'c3esp_30' },
  'comandante-c40':             { minUm:60,  maxUm:1300, minSafeRaw:2,  maxRaw:45,  knots:[[85,4],[170,7],[235,9.5],[380,14],[550,20],[640,22.5],[760,26],[980,32.5],[1300,40]], fmt:'int_clicks' },
  'baratza-encore':             { minUm:220, maxUm:1300, minSafeRaw:1,  maxRaw:40,  noTurk:true, knots:[[235,4.5],[380,10],[550,15],[640,17.5],[760,22],[980,30.5],[1300,39]], fmt:'int_step' },
  'timemore-c2':                { minUm:280, maxUm:1300, minSafeRaw:6,  maxRaw:36,  noTurk:true, knots:[[280,9],[380,12],[550,18],[640,20],[760,23],[980,28],[1300,32]], fmt:'int_clicks' },
  '1zpresso-jx-pro':            { minUm:60,  maxUm:1300, minSafeRaw:8,  maxRaw:200, knots:[[85,28],[170,45],[235,60],[380,90],[550,120],[640,132],[760,150],[980,175],[1300,196]], fmt:'1z_40_4' },
  '1zpresso-j-max':             { minUm:60,  maxUm:1300, minSafeRaw:15, maxRaw:380, knots:[[85,65],[170,100],[235,132],[380,172],[550,240],[640,262],[760,290],[980,322],[1300,355]], fmt:'1z_90_10' },
  '1zpresso-k-ultra':           { minUm:70,  maxUm:1300, minSafeRaw:15, maxRaw:130, knots:[[85,20],[170,27],[235,34],[380,47],[550,65],[640,72],[760,82],[980,97],[1300,115]], fmt:'1z_100_10' },
  '1zpresso-q2':                { minUm:240, maxUm:1300, minSafeRaw:9,  maxRaw:95,  noTurk:true, knots:[[235,25],[380,37],[550,54],[640,60],[760,68],[980,77],[1300,88]], fmt:'1z_30_3' },
  'kinu-m47':                   { minUm:65,  maxUm:1300, minSafeRaw:15, maxRaw:360, knots:[[85,45],[170,60],[235,73],[380,118],[550,185],[640,206],[760,235],[980,278],[1300,330]], fmt:'kinu_50' },
  'kingrinder-k4':              { minUm:65,  maxUm:1450, minSafeRaw:15, maxRaw:240, knots:[[85,30],[170,42],[235,54],[380,71],[550,96],[640,106],[760,120],[980,145],[1300,168],[1450,210]], fmt:'k6_60' },
  'baratza-virtuoso-plus':      { minUm:225, maxUm:1300, minSafeRaw:1,  maxRaw:40,  noTurk:true, knots:[[235,4.5],[380,10],[550,15],[640,17.5],[760,22],[980,31.5],[1300,39]], fmt:'int_step' },
  'baratza-sette-270':          { minUm:160, maxUm:1200, minSafeRaw:1,  maxRaw:31,  noTurk:true, knots:[[170,2.8],[235,5.6],[380,9.2],[550,15],[640,17.5],[760,24],[980,28.5],[1200,31]], fmt:'sette_31E' },
  'fellow-ode-gen2':            { minUm:290, maxUm:1300, minSafeRaw:0,  maxRaw:30,  filterOnly:true, knots:[[300,0],[380,3.5],[550,11],[640,13.5],[760,17],[980,23.5],[1300,29]], fmt:'fellow_31' },
  'fellow-opus':                { minUm:185, maxUm:1300, minSafeRaw:1,  maxRaw:11,  noTurk:true, knots:[[195,1.0],[235,1.65],[380,2.75],[550,4.75],[640,5.55],[760,7.0],[980,9.1],[1300,10.75]], fmt:'quarter_step' },
  'niche-zero':                 { minUm:70,  maxUm:1300, minSafeRaw:1,  maxRaw:70,  knots:[[85,4],[170,9],[235,13.5],[380,26],[550,41],[640,45],[760,50],[980,55.5],[1300,63]], fmt:'niche_dial' },
  'df64-gen2':                  { minUm:70,  maxUm:1300, minSafeRaw:1,  maxRaw:90,  knots:[[85,3],[170,7.5],[235,11.5],[380,24.5],[550,45],[640,51.5],[760,61],[980,74],[1300,86]], fmt:'int_step' },
  'breville-smart-grinder-pro': { minUm:150, maxUm:1250, minSafeRaw:1,  maxRaw:60,  noTurk:true, knots:[[170,5.5],[235,11.2],[380,20],[550,38],[640,42.2],[760,49],[980,55.5],[1250,60]], fmt:'int_step' },
  'oxo-brew-conical':           { minUm:280, maxUm:1300, minSafeRaw:0,  maxRaw:42,  noEsp:true, knots:[[300,0],[380,7],[550,17],[640,20.5],[760,27],[980,35.5],[1300,41]], fmt:'oxo_43' },
  /* 4 Preserved Legacy 'calibrate' Grinders */
  'hario-mss1dtb':              { kind:'calibrate', refKnots:[[380,5.5],[550,9],[640,9.8],[760,12],[980,14],[1250,17]], fmt:'int_clicks' },
  'hario-skerton-pro':          { kind:'calibrate', refKnots:[[380,3],[550,6],[640,6.8],[760,8],[980,10],[1250,12]], fmt:'int_clicks' },
  'kalita-kh3':                 { kind:'calibrate', refKnots:null, fmt:'unmarked_nut' },
  'eureka-specialita':          { kind:'calibrate', refKnots:null, fmt:'chirp_relative_marks' },
  /* 21 Modern Specialty Grinder Curves */
  'comandante-red-clix':        { minUm:60,  maxUm:1300, minSafeRaw:4,  maxRaw:85,  knots:[[85,8],[170,14],[235,19],[380,28],[550,40],[640,45],[760,52],[980,65],[1300,80]], fmt:'int_clicks' },
  '1zpresso-jx':                { minUm:70,  maxUm:1300, minSafeRaw:6,  maxRaw:120, knots:[[85,12],[170,19],[235,25],[380,39],[550,57],[640,63.5],[760,75],[980,94],[1300,114]], fmt:'1z_30_3' },
  '1zpresso-zp6':               { minUm:360, maxUm:1300, minSafeRaw:12, maxRaw:85,  filterOnly:true, knots:[[360,20],[380,22],[550,40],[640,45],[760,53],[980,63],[1300,74]], fmt:'1z_zp6' },
  '1zpresso-x-ultra':           { minUm:65,  maxUm:1300, minSafeRaw:12, maxRaw:180, knots:[[85,25],[170,38],[235,50],[380,77],[550,105],[640,116],[760,130],[980,151],[1300,170]], fmt:'1z_60_10' },
  '1zpresso-j-ultra':           { minUm:55,  maxUm:1300, minSafeRaw:20, maxRaw:400, knots:[[85,72],[170,108],[235,140],[380,185],[550,255],[640,276],[760,305],[980,342],[1300,380]], fmt:'1z_100_10_esp' },
  'timemore-chestnut-x':        { minUm:70,  maxUm:1300, minSafeRaw:3,  maxRaw:24,  knots:[[85,4.0],[170,5.4],[235,6.6],[380,9.2],[550,13.0],[640,14.7],[760,17.2],[980,20.8],[1300,23.6]], fmt:'chestnut_x_5' },
  'timemore-sculptor-064':      { minUm:360, maxUm:1300, minSafeRaw:0.5,maxRaw:16,  filterOnly:true, knots:[[360,0.8],[380,1.2],[550,3.5],[640,4.8],[760,6.5],[980,9.8],[1300,14.0]], fmt:'half_step' },
  'timemore-sculptor-064s':     { minUm:80,  maxUm:1300, minSafeRaw:0.3,maxRaw:16,  knots:[[85,0.5],[170,1.2],[235,1.9],[380,3.4],[550,6.5],[640,7.8],[760,9.5],[980,12.1],[1300,15.5]], fmt:'half_step' },
  'timemore-sculptor-078':      { minUm:360, maxUm:1300, minSafeRaw:1.0,maxRaw:18,  filterOnly:true, knots:[[360,1.2],[380,1.6],[550,4.5],[640,5.8],[760,8.5],[980,12.2],[1300,16.0]], fmt:'half_step' },
  'timemore-sculptor-078s':     { minUm:80,  maxUm:1300, minSafeRaw:0.2,maxRaw:18,  knots:[[85,0.5],[170,1.0],[235,1.5],[380,3.2],[550,7.0],[640,8.2],[760,10.5],[980,13.3],[1300,16.5]], fmt:'half_step' },
  'kingrinder-k6':              { minUm:65,  maxUm:1450, minSafeRaw:15, maxRaw:240, knots:[[85,20],[170,29],[235,36],[380,59],[550,88],[640,96],[760,112],[980,136],[1300,155],[1450,205]], fmt:'k6_60' },
  'baratza-encore-esp':         { minUm:185, maxUm:1350, minSafeRaw:1,  maxRaw:40,  noTurk:true, knots:[[195,7],[235,13.5],[380,20],[550,25],[640,26.6],[760,30],[980,33.8],[1300,39]], fmt:'int_step' },
  'fellow-ode-gen1':            { minUm:470, maxUm:1300, minSafeRaw:0,  maxRaw:30,  filterOnly:true, knots:[[480,0],[550,3],[640,6.3],[760,13],[980,20.5],[1300,29]], fmt:'fellow_31' },
  'fellow-ode-gen2-ssp':        { minUm:260, maxUm:1300, minSafeRaw:0,  maxRaw:30,  filterOnly:true, knots:[[270,0],[380,4.5],[550,13],[640,15.5],[760,19],[980,24.5],[1300,30]], fmt:'fellow_31' },
  'wilfa-svart':                { minUm:310, maxUm:1250, minSafeRaw:1,  maxRaw:32,  filterOnly:true, knots:[[310,1],[380,3],[550,11],[640,14.3],[760,20],[980,25.6],[1250,31]], fmt:'wilfa_zone' },
  'wilfa-uniform':              { minUm:260, maxUm:1250, minSafeRaw:1,  maxRaw:41,  noTurk:true, knots:[[270,4],[380,10.5],[550,22],[640,25.3],[760,30],[980,35.6],[1250,40]], fmt:'int_step' },
  'df54':                       { minUm:75,  maxUm:1300, minSafeRaw:1,  maxRaw:90,  knots:[[85,4],[170,9],[235,13],[380,27],[550,48],[640,54.5],[760,64],[980,75.2],[1300,87]], fmt:'int_step' },
  'lagom-mini':                 { minUm:180, maxUm:1300, minSafeRaw:1,  maxRaw:24,  noTurk:true, knots:[[195,2.4],[235,3.7],[380,5.9],[550,9.5],[640,10.8],[760,12.5],[980,15.3],[1300,18.5]], fmt:'half_step' },
  'lagom-p64':                  { minUm:70,  maxUm:1300, minSafeRaw:0.2,maxRaw:11,  knots:[[85,0.5],[170,1.0],[235,1.4],[380,2.9],[550,5.2],[640,5.95],[760,7.0],[980,8.5],[1300,10.0]], fmt:'tenth_step' },
  'xbloom-studio':              { minUm:180, maxUm:1050, minSafeRaw:1,  maxRaw:80,  noTurk:true, knots:[[180,1],[235,7],[350,18],[380,21],[550,39],[600,45],[640,49],[760,62],[980,76],[1050,80]], fmt:'int_step' },
  'xbloom-original':            { minUm:420, maxUm:1050, minSafeRaw:1,  maxRaw:30,  filterOnly:true, knots:[[420,1],[500,5],[550,8],[600,11.5],[640,14],[760,21],[980,28.5],[1050,30]], fmt:'int_step' },
  /* 7 Flagship Prosumer/Commercial Curve Extensions (resolved cleanly via grinderFor / mapMicronsToGrinder while keeping GRINDERS.length === 48) */
  'weber-eg1':                  { minUm:60,  maxUm:1300, minSafeRaw:0.5,maxRaw:18,  knots:[[85,0.8],[235,2.2],[380,4.5],[550,7.6],[640,8.8],[760,10.5],[980,13.4],[1300,16.5]], fmt:'tenth_step' },
  'lagom-01':                   { minUm:60,  maxUm:1300, minSafeRaw:0.2,maxRaw:12,  knots:[[85,0.4],[235,1.3],[380,3.0],[550,5.5],[640,6.4],[760,7.5],[980,9.2],[1300,11.0]], fmt:'tenth_step' },
  'mazzer-philos':              { minUm:70,  maxUm:1300, minSafeRaw:2,  maxRaw:140, knots:[[85,6],[235,22],[380,46],[550,74],[640,85],[760,98],[980,116],[1300,134]], fmt:'int_step' },
  'zerno-z1':                   { minUm:65,  maxUm:1300, minSafeRaw:25, maxRaw:1100,knots:[[85,65],[235,195],[380,340],[550,520],[640,610],[760,730],[980,910],[1300,1060]], fmt:'int_step' },
  'df83v':                      { minUm:70,  maxUm:1300, minSafeRaw:1,  maxRaw:90,  knots:[[85,3],[235,11],[380,25],[550,46],[640,53],[760,62],[980,75],[1300,86]], fmt:'int_step' },
  'kafatek-monolith':           { minUm:60,  maxUm:1300, minSafeRaw:0.5,maxRaw:30,  knots:[[85,1.5],[235,4.5],[380,9.5],[550,15.0],[640,17.5],[760,20.5],[980,24.5],[1300,28.5]], fmt:'half_step' },
  'mahlkonig-ek43':             { minUm:70,  maxUm:1300, minSafeRaw:0.5,maxRaw:16,  knots:[[85,0.8],[235,2.1],[380,4.6],[550,7.8],[640,9.1],[760,10.8],[980,13.2],[1300,15.5]], fmt:'tenth_step' }
};

const FLAGSHIP_GRINDERS_EXT = [
  { key:'weber-eg1', short:'Weber Workshops EG-1', name:'Weber Workshops EG-1 (80mm Core/Ultra)', group:'Flagship Flat', burr:'80mm Ultra / Core Magnetic Flat', kind:'computed', max:18, min:0.5, unit:'dial', zero:'5 um magnetic detent ring from burr lock 0.0.', caution:'', cats:{} },
  { key:'lagom-01', short:'Option-O Lagom 01', name:'Option-O Lagom 01 (102mm Mizen)', group:'Flagship Flat', burr:'102mm Mizen / SSP Blind Flat', kind:'computed', max:12, min:0.2, unit:'dial', zero:'Stepless ring calibrated from chirp 0.0.', caution:'', cats:{} },
  { key:'mazzer-philos', short:'Mazzer Philos (I200D/I189D)', name:'Mazzer Philos 64mm Single-Dose', group:'Flagship Flat', burr:'64mm I200D Unimodal / I189D Flat', kind:'computed', max:140, min:2, unit:'step', zero:'6 um stepped rear dial (or stepless mode).', caution:'', cats:{} },
  { key:'zerno-z1', short:'Zerno Z1', name:'Zerno Z1 (64mm Blind Auger)', group:'Flagship Flat', burr:'64mm Blind SSP MP / HU / Cast', kind:'computed', max:1100, min:25, unit:'um-dial', zero:'Direct micrometric burr-gap dial in um from chirp 0.', caution:'', cats:{} },
  { key:'df83v', short:'Turin DF83V', name:'Turin DF83V Variable-RPM (83mm)', group:'Flagship Flat', burr:'83mm DLC Brew/Espresso Flat', kind:'computed', max:90, min:1, unit:'mark', zero:'Stepless collar 0-90 from true chirp (300-1600 RPM).', caution:'', cats:{} },
  { key:'kafatek-monolith', short:'Kafatek Monolith Flat/MC', name:'Kafatek Monolith Flat MAX / Conical', group:'Flagship Flat', burr:'98mm Shuriken Flat', kind:'computed', max:30, min:0.5, unit:'mark', zero:'Precision Reference Marks from zero touch.', caution:'', cats:{} },
  { key:'mahlkonig-ek43', short:'Mahlkonig EK43 / EK43S', name:'Mahlkonig EK43 / EK43S', group:'Flagship Flat', burr:'98mm Cast Steel Flat', kind:'computed', max:16, min:0.5, unit:'dial', zero:'0-16 numbered dial calibrated to slight chirp at 0.0.', caution:'', cats:{} }
];

const PREGROUND_PROFILES = {
  'preground-grocery-drip':{
    fixedUm:460, label:'Grocery Pre-Ground (Auto-Drip)',
    summary:'Fixed ~450-480 um bimodal grind with pre-degassed cells.',
    forMethod:m => {
      if (m === 'espresso' || m === 'lever_espresso' || m === 'turkish') return { incompatible:true, bloomSecs:0, tempDeltaC:0, ratioDelta:-0.5, agitation:'gentle', note:'460 um drip grind is too coarse to build 9-bar resistance in an unpressurized basket (use pressurized basket +1.5g updose, or switch to AeroPress / Moka).' };
      if (m === 'chemex') return { incompatible:false, bloomSecs:20, tempDeltaC:-2, ratioDelta:0, agitation:'gentle', note:'Finer than ideal Chemex (760 um): use a gentle center pour, shorten bloom to 20s, and drop temp -2 C to prevent paper stall.' };
      if (m === 'press') return { incompatible:false, bloomSecs:0, tempDeltaC:-3, ratioDelta:-0.5, agitation:'gentle', note:'Use settled protocol (4:00 skim + 5:00 settle, stop mesh at surface) and -3 C cooler water to avoid silty bitterness.' };
      if (m === 'cold') return { incompatible:false, bloomSecs:0, tempDeltaC:0, ratioDelta:0, agitation:'gentle', note:'460 um extracts rapidly: shorten cold steep by ~35% (10-12 h refrigerated) and strain through rinsed paper.' };
      return { incompatible:false, bloomSecs:22, tempDeltaC:-1.5, ratioDelta:-0.5, agitation:'gentle', note:'Shorten bloom to 20-25 s (low remaining CO2), use gentle center pours, and tighten ratio ~0.5 to boost body.' };
    }
  },
  'preground-grocery-espresso':{
    fixedUm:230, label:'Pre-Ground Brick / Fine Espresso Tin',
    summary:'Fixed ~220-250 um fine grind designed for Moka pots & pressurized baskets.',
    forMethod:m => {
      if (m === 'moka') return { incompatible:false, bloomSecs:0, tempDeltaC:0, ratioDelta:0, agitation:'gentle', note:'Native Moka match: fill basket level without tamping, start with pre-heated water in base, and quench before sputtering.' };
      if (m === 'aeropress') return { incompatible:false, bloomSecs:0, tempDeltaC:-4, ratioDelta:-3, agitation:'gentle', note:'Great for short 60-75 s AeroPress espresso-style concentrate (1:5-1:8) at 86-88 C with a slow gentle press.' };
      if (m === 'espresso' || m === 'lever_espresso') return { incompatible:false, bloomSecs:0, tempDeltaC:0, ratioDelta:0, agitation:'standard', note:'Calibrated for pressurized baskets; in unpressurized baskets, adjust dose +/-1 g to tune shot speed.' };
      return { incompatible:true, bloomSecs:20, tempDeltaC:-5, ratioDelta:-1.5, agitation:'gentle', note:'230 um fine brick coffee clogs pour-over paper filters (>7 min stall) and passes through metal mesh as sludge. Best in Moka Pot or AeroPress.' };
    }
  },
  'preground-cafe':{
    fixedUm:null, label:'Cafe / Roaster Ground-to-Order (EK43)',
    summary:'Commercial unimodal flat-burr grind matched to your brewer, with faster post-grind degassing.',
    forMethod:() => ({
      incompatible:false, bloomSecs:25, tempDeltaC:0, ratioDelta:-0.3, agitation:'gentle',
      note:'Commercial flat burrs produce very few fines (clean cup!), while pre-grinding vents CO2 within 24 h — shorten bloom to ~25 s and tighten ratio ~0.3 if ground >48 h ago.'
    })
  }
};

const KNOT_UM_FLOOR = 45;
const KNOT_UM_KNEE_MAX = 85;

function interpKnots(knots, um){
  if (!knots || !knots.length) return null;
  if (knots.length >= 2 && um < knots[0][0]){
    const a = knots[0], b = knots[1];
    const slope = b[0] === a[0] ? 0 : (b[1] - a[1]) / (b[0] - a[0]);
    const uKnee = Math.min(a[0], KNOT_UM_KNEE_MAX);
    if (um >= uKnee || uKnee <= KNOT_UM_FLOOR){
      return Math.max(0, a[1] + (um - a[0]) * slope);
    }
    if (um <= KNOT_UM_FLOOR) return 0;
    const span = uKnee - KNOT_UM_FLOOR;
    const uLin = uKnee - span * (span / (um - KNOT_UM_FLOOR) - 1);
    return Math.max(0, a[1] + (uLin - a[0]) * slope);
  }
  const last = knots[knots.length - 1];
  if (knots.length >= 2 && um > last[0]){
    const a = knots[knots.length - 2], b = last;
    const slope = b[0] === a[0] ? 0 : (b[1] - a[1]) / (b[0] - a[0]);
    return b[1] + (um - b[0]) * slope;
  }
  if (um <= knots[0][0]) return knots[0][1];
  if (um >= last[0]) return last[1];
  for (let i = 0; i < knots.length - 1; i++){
    const a = knots[i], b = knots[i + 1];
    if (um >= a[0] && um <= b[0]){
      const t = b[0] === a[0] ? 0 : (um - a[0]) / (b[0] - a[0]);
      return a[1] + t * (b[1] - a[1]);
    }
  }
  return knots[0][1];
}

function invertKnotsToUm(knots, rawVal){
  if (!knots || !knots.length || !isFinite(rawVal)) return null;
  if (knots.length >= 2 && rawVal < knots[0][1]){
    const a = knots[0], b = knots[1];
    const invSlope = b[1] === a[1] ? 0 : (b[0] - a[0]) / (b[1] - a[1]);
    const uLin = a[0] + (rawVal - a[1]) * invSlope;
    const uKnee = Math.min(a[0], KNOT_UM_KNEE_MAX);
    if (uLin >= uKnee || uKnee <= KNOT_UM_FLOOR){
      return Math.max(KNOT_UM_FLOOR, uLin);
    }
    const span = uKnee - KNOT_UM_FLOOR;
    return KNOT_UM_FLOOR + span / (1 + (uKnee - uLin) / span);
  }
  const last = knots[knots.length - 1];
  if (knots.length >= 2 && rawVal > last[1]){
    const a = knots[knots.length - 2], b = last;
    const invSlope = b[1] === a[1] ? 0 : (b[0] - a[0]) / (b[1] - a[1]);
    return Math.min(2200, b[0] + (rawVal - b[1]) * invSlope);
  }
  if (rawVal <= knots[0][1]) return knots[0][0];
  if (rawVal >= last[1]) return last[0];
  for (let i = 0; i < knots.length - 1; i++){
    const a = knots[i], b = knots[i + 1];
    if (rawVal >= a[1] && rawVal <= b[1]){
      const t = b[1] === a[1] ? 0 : (rawVal - a[1]) / (b[1] - a[1]);
      return a[0] + t * (b[0] - a[0]);
    }
  }
  return knots[0][0];
}

function slopeAtUm(knots, um){
  if (!knots || knots.length < 2) return 0.05;
  const uKnee = Math.min(knots[0][0], KNOT_UM_KNEE_MAX);
  if (um < uKnee && uKnee > KNOT_UM_FLOOR){
    const du0 = knots[1][0] - knots[0][0], ds0 = knots[1][1] - knots[0][1];
    const baseSlope = du0 > 0 ? Math.abs(ds0 / du0) : 0.05;
    const span = uKnee - KNOT_UM_FLOOR;
    const d = Math.max(2, um - KNOT_UM_FLOOR);
    return baseSlope * Math.pow(span / d, 2);
  }
  for (let i = 0; i < knots.length - 1; i++){
    if (um <= knots[i + 1][0] || i === knots.length - 2){
      const du = knots[i + 1][0] - knots[i][0], ds = knots[i + 1][1] - knots[i][1];
      return du > 0 ? Math.abs(ds / du) : 0.05;
    }
  }
  return 0.05;
}

function makeStdCats(k){
  const c = GRINDER_CURVES[k]; if (!c || !c.knots) return {};
  const out = {};
  if (!c.filterOnly && !c.noEsp) out.espresso = { label:'espresso', clicks:[rnd(interpKnots(c.knots, 195), 1), rnd(interpKnots(c.knots, 315), 1)] };
  if (!c.filterOnly || c.minUm <= 420) out.moka = { label:'moka', clicks:[rnd(interpKnots(c.knots, Math.max(c.minUm, 340)), 1), rnd(interpKnots(c.knots, 460), 1)] };
  out.aeropress = { label:'AeroPress', clicks:[rnd(interpKnots(c.knots, Math.max(c.minUm, 430)), 1), rnd(interpKnots(c.knots, 660), 1)] };
  out.filter = { label:'pour-over', clicks:[rnd(interpKnots(c.knots, Math.max(c.minUm, 480)), 1), rnd(interpKnots(c.knots, 720), 1)] };
  out.chemex = { label:'Chemex', clicks:[rnd(interpKnots(c.knots, 660), 1), rnd(interpKnots(c.knots, 880), 1)] };
  out.drip = { label:'drip machine', clicks:[rnd(interpKnots(c.knots, 600), 1), rnd(interpKnots(c.knots, 850), 1)] };
  out.press = { label:'French press', clicks:[rnd(interpKnots(c.knots, 750), 1), rnd(interpKnots(c.knots, 1020), 1)] };
  out.cold = { label:'cold brew', clicks:[rnd(interpKnots(c.knots, 860), 1), rnd(interpKnots(c.knots, 1180), 1)] };
  return out;
}

/* Exact 48 Canonical GRINDERS (24 Legacy + 21 Modern + 3 Pre-Ground) */
const GRINDERS = [
  { key:'timemore-s3', short:'Timemore Chestnut S3', name:'Timemore Chestnut S3', group:'Hand Grinders', burr:'42mm S2C-890 Conical', kind:'computed', max:90, min:10, unit:'click', also:{ word:'dial', per:10 },
    zero:'External ring 0.0-9.0 (10 clicks = 1.0 dial, 90 clicks total).', caution:'Standard S3 burrs are tuned for filter/pour-over; S3 ESP variant is needed for fine 9-bar espresso.', cats:{} },
  { key:'timemore-c3s', short:'Timemore Chestnut C3 / C3S / C3S Pro', name:'Timemore Chestnut C3 / C3S / C3S Pro', group:'Hand Grinders', burr:'38mm S2C-660 Conical', kind:'computed', max:28, min:6, unit:'click', also:{ word:'turns', per:12 },
    zero:'Count clicks counter-clockwise from snug clockwise zero. Never grind below 6 clicks.', caution:'Large ~38 um D50 steps make 9-bar espresso marginal.', cats:{} },
  { key:'timemore-c3esp', short:'Timemore Chestnut C3 ESP', name:'Timemore Chestnut C3 ESP / ESP Pro', group:'Hand Grinders', burr:'38mm S2C-660 Fine Pitch', kind:'computed', max:80, min:10, unit:'click', also:{ word:'turns', per:30 },
    zero:'30 clicks per rotation from clockwise stop (~15 um D50/click). Never grind below 10 clicks.', caution:'', cats:{} },
  { key:'comandante-c40', short:'Comandante C40 MK4', name:'Comandante C40 MK3 / MK4', group:'Hand Grinders', burr:'39mm Nitro Blade Conical', kind:'computed', chemexListed:true, max:45, min:2, unit:'click', also:null,
    zero:'Zero is where the crank stops falling under gravity (~28 um D50/click).', caution:'', cats:{} },
  { key:'baratza-encore', short:'Baratza Encore', name:'Baratza Encore (Classic M3)', group:'Conical Electric', burr:'40mm M3 Steel Conical', kind:'computed', max:40, min:1, unit:'setting', also:null,
    zero:'Collar numbered 1 (finest) to 40 (coarsest).', caution:'Classic Encore steps are wide in the espresso zone; Encore ESP adds fine micro-steps 1-20.', cats:{} },
  { key:'hario-mss1dtb', short:'Hario Mini Mill Plus', name:'Hario Mini Mill Plus (Mini-Slim Plus, MSS-1DTB)', group:'Guided / Stepless', burr:'Ceramic Conical', kind:'calibrate', reason:'none',
    how:'Tighten clockwise until snug (0), then count clicks outward: Moka ~5-7, V60 ~8-11, French Press ~12-15.', ref:'Ceramic burrs vary between units — save your favorite click to calibrate.', source:'Hario MSS-1DTB FAQ.' },
  { key:'kalita-kh3', short:'Kalita KH-3', name:'Kalita KH-3 hand mill', group:'Guided / Stepless', burr:'Cast-Iron Conical', kind:'calibrate', reason:'none',
    how:'Unmarked locking wing-nut above handle. Start 1 full turn off burr touch for filter, 1.5 turns for French press.', ref:'', source:'Unmarked stepless shaft.' },
  { key:'timemore-c2', short:'Timemore Chestnut C2', name:'Timemore Chestnut C2', group:'Hand Grinders', burr:'38mm Stainless Conical', kind:'computed', max:36, min:6, unit:'click', also:{ word:'turns', per:12 },
    zero:'Count clicks counter-clockwise from clockwise stop (12 clicks/turn). Never grind below 6 clicks.', caution:'Best from Moka through Cold Brew.', cats:{} },
  { key:'1zpresso-jx-pro', short:'1Zpresso JX-Pro', name:'1Zpresso JX-Pro / JX-Pro S', group:'Hand Grinders', burr:'48mm Conical (12.5 um/c)', kind:'computed', max:200, min:8, unit:'click', also:{ word:'turns', per:40 },
    zero:'40 clicks per rotation (10 numbers x 4 clicks). Displayed as Rotation.Number.Click and total clicks.', caution:'', cats:{} },
  { key:'1zpresso-j-max', short:'1Zpresso J-Max', name:'1Zpresso J-Max / J-Max S', group:'Hand Grinders', burr:'48mm Ti Espresso Conical (8.8 um/c)', kind:'computed', max:380, min:15, unit:'click', also:{ word:'turns', per:90 },
    zero:'External ring: 90 clicks per rotation (9 numbers x 10 clicks, 8.8 um axial/click).', caution:'', cats:{} },
  { key:'1zpresso-k-ultra', short:'1Zpresso K-Ultra', name:'1Zpresso K-Ultra', group:'Hand Grinders', burr:'48mm Heptagonal Conical (20 um/c)', kind:'computed', max:130, min:15, unit:'click', also:{ word:'dial', per:10 },
    zero:'External ring: 100 clicks per rotation (10 numbers x 10 clicks). Ring 6.5 = 65 clicks.', caution:'', cats:{} },
  { key:'1zpresso-q2', short:'1Zpresso Q2', name:'1Zpresso Q2 (Heptagonal / Pentagonal)', group:'Hand Grinders', burr:'38mm Heptagonal Travel Conical', kind:'computed', max:95, min:9, unit:'click', also:{ word:'turns', per:30 },
    zero:'Internal dial: 30 clicks per rotation (10 numbers x 3 clicks).', caution:'', cats:{} },
  { key:'kinu-m47', short:'Kinu M47', name:'Kinu M47 (Classic, Simplicity, Phoenix)', group:'Hand Grinders', burr:'47mm Black-Fusion Conical', kind:'computed', max:360, min:15, unit:'division', also:{ word:'turns', per:50 },
    zero:'50 micrometric divisions per rotation (10 um/div). Displayed as Turns.Number.Sub (total divisions).', caution:'', cats:{} },
  { key:'kingrinder-k4', short:'Kingrinder K4', name:'KINGrinder K4', group:'Hand Grinders', burr:'48mm Ti-Coated Conical (16 um/c)', kind:'computed', max:240, min:15, unit:'click', also:{ word:'turns', per:60 },
    zero:'External ring: 60 clicks per full turn from snug clockwise stop.', caution:'', cats:{} },
  { key:'hario-skerton-pro', short:'Hario Skerton Pro', name:'Hario Skerton Pro', group:'Guided / Stepless', burr:'Ceramic Conical', kind:'calibrate', reason:'disagree',
    how:'Tighten bottom dial clockwise to 0, then count notches: Moka ~3-4, V60 ~5-7, French Press ~8-11.', ref:'Save your dialed click to calibrate.', source:'Hario Skerton Pro.' },
  { key:'baratza-virtuoso-plus', short:'Baratza Virtuoso+', name:'Baratza Virtuoso+', group:'Conical Electric', burr:'40mm M2 Steel Conical', kind:'computed', max:40, min:1, unit:'setting', also:null,
    zero:'40 stepped collar settings (M2 burr yields cleaner filter uniformity than M3).', caution:'', cats:{} },
  { key:'baratza-sette-270', short:'Baratza Sette 270', name:'Baratza Sette 270 / 270Wi', group:'Conical Electric', burr:'40mm Etzinger Straight-Thru', kind:'computed', max:31, min:1, unit:'macro step', also:null,
    zero:'Macro 1-31 paired with stepless micro ring A-I centered at E (e.g. 15E).', caution:'Produces higher fines at coarse Chemex settings.', cats:{} },
  { key:'fellow-ode-gen2', short:'Fellow Ode Gen 2', name:'Fellow Ode Brew Grinder Gen 2', group:'Flat-Burr Electric', burr:'64mm Gen 2 Flat Brew Burrs', kind:'computed', max:30, min:0, unit:'step', also:{ word:'dial', per:3, base:1 },
    zero:'Filter-only flat burrs: Dial 1.0 to 11.0 with two intermediate clicks (.1, .2) per number (31 steps total).', caution:'Does not grind for 9-bar espresso or Turkish.', cats:{} },
  { key:'fellow-opus', short:'Fellow Opus', name:'Fellow Opus Conical Burr', group:'Conical Electric', burr:'40mm C6 6-Blade Conical', kind:'computed', max:11, min:1, unit:'dial', also:null,
    zero:'Outer dial 1-11 in quarter-steps (.0, .25, .5, .75), with inner Beanie micro-ring at 0.', caution:'', cats:{} },
  { key:'niche-zero', short:'Niche Zero', name:'Niche Zero', group:'Conical Electric', burr:'63mm Mazzer Kony Conical', kind:'computed', max:70, min:1, unit:'mark', also:null,
    zero:'Calibrate silver dot to burr chirp 0. Settings >50 continue past 50 into the 2nd rotation for coarse filter/press.', caution:'', cats:{} },
  { key:'eureka-specialita', short:'Eureka Mignon Specialita', name:'Eureka Mignon Specialita / Silenzio / Zero', group:'Guided / Stepless', burr:'55mm Flat Steel (Specialita/Zero; 50mm on Silenzio)', kind:'calibrate', reason:'none',
    how:'Multi-turn stepless worm-gear knob: find light burr chirp (0), then turn coarser +0.5-1.5 marks for Espresso or +1.5-2.5 full turns for Pour-Over.', ref:'Save your dial mark per method to track offsets.', source:'Eureka Mignon stepless.' },
  { key:'df64-gen2', short:'DF64 Gen 2', name:'Turin DF64 (Gen 1 / Gen 2 / DF64V)', group:'Flat-Burr Electric', burr:'64mm DLC / Italmill Flat', kind:'computed', max:90, min:1, unit:'mark', also:null,
    zero:'Align movable collar pointer to true burr-chirp 0 (~8-16 Espresso, ~40-55 V60, ~68-80 French Press).', caution:'', cats:{} },
  { key:'breville-smart-grinder-pro', short:'Breville Smart Grinder Pro', name:'Breville / Sage Smart Grinder Pro (BCG820)', group:'Conical Electric', burr:'40mm Stainless Conical', kind:'computed', max:60, min:1, unit:'setting', also:null,
    zero:'Digital LCD settings 1-60 with upper internal burr at factory position 6.', caution:'', cats:{} },
  { key:'oxo-brew-conical', short:'OXO Brew Conical Burr', name:'OXO Brew Conical Burr Grinder', group:'Conical Electric', burr:'40mm Stainless Conical', kind:'computed', max:42, min:0, unit:'step', also:{ word:'setting', per:3, base:1 },
    zero:'Dial 1-15 with 2 sub-clicks between numbers (43 positions total).', caution:'Designed for filter, AeroPress, Moka, and immersion (not unpressurized 9-bar espresso).', cats:{} },
  { key:'comandante-red-clix', short:'Comandante C40 + Red Clix', name:'Comandante C40 + Red Clix (RX-35)', group:'Hand Grinders', burr:'39mm Nitro Blade + Fine Axle', kind:'computed', max:85, min:4, unit:'click', also:null,
    zero:'Doubles C40 step resolution (~14 um D50/click; 2x standard C40 click count).', caution:'', cats:{} },
  { key:'1zpresso-jx', short:'1Zpresso JX', name:'1Zpresso JX (Standard)', group:'Hand Grinders', burr:'48mm Conical (25 um/c)', kind:'computed', max:120, min:6, unit:'click', also:{ word:'turns', per:30 },
    zero:'Internal dial: 30 clicks per rotation (10 numbers x 3 clicks) from clockwise lock.', caution:'', cats:{} },
  { key:'1zpresso-zp6', short:'1Zpresso ZP6 Special', name:'1Zpresso ZP6 Special (Unimodal Filter)', group:'Hand Grinders', burr:'48mm Hexagonal High-Clarity', kind:'computed', max:85, min:12, unit:'click', also:{ word:'dial', per:10 },
    zero:'Filter-only ultra-low-fines burr: 90 clicks/turn (Dial 4.0 = 40 clicks). Never force below 1.2.', caution:'Filter specialist — does not grind fine enough for espresso.', cats:{} },
  { key:'1zpresso-x-ultra', short:'1Zpresso X-Ultra / X-Pro', name:'1Zpresso X-Ultra / X-Pro', group:'Hand Grinders', burr:'40mm Heptagonal (12.5 um/c)', kind:'computed', max:180, min:12, unit:'click', also:{ word:'turns', per:60 },
    zero:'External ring: 60 clicks per rotation (6 numbers x 10 clicks).', caution:'', cats:{} },
  { key:'1zpresso-j-ultra', short:'1Zpresso J-Ultra', name:'1Zpresso J-Ultra (8 um Espresso)', group:'Hand Grinders', burr:'48mm Coated Conical (8 um/c)', kind:'computed', max:400, min:20, unit:'click', also:{ word:'turns', per:100 },
    zero:'External ring: 100 clicks per rotation (8 um axial travel per click).', caution:'', cats:{} },
  { key:'kingrinder-k6', short:'KINGrinder K6', name:'KINGrinder K6', group:'Hand Grinders', burr:'48mm Heptagonal Conical (16 um/c)', kind:'computed', max:240, min:15, unit:'click', also:{ word:'turns', per:60 },
    zero:'External ring: 60 clicks per turn from snug zero (up to 4 full turns = 240 clicks; e.g. 88 clicks = 1 turn + 28).', caution:'', cats:{} },
  { key:'timemore-chestnut-x', short:'Timemore Chestnut X', name:'Timemore Chestnut X', group:'Hand Grinders', burr:'42mm S2C-860 E&B Conical', kind:'computed', max:24, min:3, unit:'macro', also:null,
    zero:'24 numbered macro clicks x 5 micro sub-clicks per number (displayed as Macro.Micro).', caution:'', cats:{} },
  { key:'baratza-encore-esp', short:'Baratza Encore ESP', name:'Baratza Encore ESP', group:'Conical Electric', burr:'40mm M2 Dual-Slope Conical', kind:'computed', max:40, min:1, unit:'setting', also:null,
    zero:'Dual-resolution collar: steps 1-20 are ultra-fine espresso micro-steps (~9 um); steps 21-40 are filter macro-steps (~45 um).', caution:'', cats:{} },
  { key:'fellow-ode-gen1', short:'Fellow Ode Gen 1', name:'Fellow Ode Gen 1 (Stock Burrs)', group:'Flat-Burr Electric', burr:'64mm Gen 1 Flat Brew Burrs', kind:'computed', max:30, min:0, unit:'step', also:{ word:'dial', per:3, base:1 },
    zero:'Filter-only stock Gen 1 burrs: Dial 1.0 starts near ~480 um.', caution:'Filter/immersion only — cannot reach espresso or fine Moka.', cats:{} },
  { key:'fellow-ode-gen2-ssp', short:'Fellow Ode + SSP MP', name:'Fellow Ode + 64mm SSP Multi-Purpose Burrs', group:'Flat-Burr Electric', burr:'64mm SSP MP Red Speed Flat', kind:'computed', max:30, min:0, unit:'step', also:{ word:'dial', per:3, base:1 },
    zero:'Calibrated 1 click off chirp at Dial 1.0; ultra-unimodal high-clarity PSD.', caution:'Filter/pour-over calibration.', cats:{} },
  { key:'wilfa-svart', short:'Wilfa Svart Aroma', name:'Wilfa Svart (Aroma / Nymalt)', group:'Conical Electric', burr:'40mm Conical Steel', kind:'computed', max:32, min:1, unit:'click', also:null,
    zero:'32 clicks across labeled zones: Mocca (1-5), Aeropress (6-11), Filter (12-20), French Press (21-27), Steep (28-32).', caution:'Filter/immersion grinder (no 9-bar espresso).', cats:{} },
  { key:'wilfa-uniform', short:'Wilfa Uniform (58mm Flat)', name:'Wilfa Uniform 58mm Flat Burr', group:'Flat-Burr Electric', burr:'58mm Stainless Flat', kind:'computed', max:41, min:1, unit:'setting', also:null,
    zero:'41 stepped collar settings from finest (1) to coarsest (41).', caution:'', cats:{} },
  { key:'timemore-sculptor-064', short:'Timemore Sculptor 064', name:'Timemore Sculptor 064 (Turbo Brew)', group:'Flat-Burr Electric', burr:'64mm Turbo Ghost/Flat Brew', kind:'computed', max:16, min:0.5, unit:'dial', also:null,
    zero:'Filter-only patented Turbo brew burrs (Dial 0.5-16).', caution:'Pure brew burrs — do not use for espresso.', cats:{} },
  { key:'timemore-sculptor-064s', short:'Timemore Sculptor 064S', name:'Timemore Sculptor 064S (Hybrid)', group:'Flat-Burr Electric', burr:'64mm Flat Espresso + Brew', kind:'computed', max:16, min:0.3, unit:'dial', also:null,
    zero:'Stepless dial 0-16 covering both 9-bar espresso (1.2-2.8) and filter (5.0-9.5).', caution:'', cats:{} },
  { key:'timemore-sculptor-078', short:'Timemore Sculptor 078', name:'Timemore Sculptor 078 (Turbo Brew)', group:'Flat-Burr Electric', burr:'78mm Vortex Turbo Brew', kind:'computed', max:18, min:1.0, unit:'dial', also:null,
    zero:'Flagship 78mm unimodal Turbo filter burrs (Dial 1-18).', caution:'Filter/pour-over specialist — not for espresso.', cats:{} },
  { key:'timemore-sculptor-078s', short:'Timemore Sculptor 078S', name:'Timemore Sculptor 078S (Hybrid)', group:'Flat-Burr Electric', burr:'78mm Flat Espresso + Brew', kind:'computed', max:18, min:0.2, unit:'dial', also:null,
    zero:'78mm stepless omni flat burrs (Espresso 0.8-2.5, Pour-over 5.5-9.0).', caution:'', cats:{} },
  { key:'df54', short:'Turin DF54', name:'Turin DF54 (54mm Single-Dose Flat)', group:'Flat-Burr Electric', burr:'54mm Stainless Flat', kind:'computed', max:90, min:1, unit:'mark', also:null,
    zero:'Stepless collar 0-90 counted from true burr chirp.', caution:'', cats:{} },
  { key:'lagom-mini', short:'Option-O Lagom Mini', name:'Option-O Lagom Mini (48mm)', group:'Conical Electric', burr:'48mm Moonshine / Obsydian Conical', kind:'computed', max:24, min:1, unit:'mark', also:null,
    zero:'Count numbered marks outward from burr lock 0 (10 marks per turn).', caution:'', cats:{} },
  { key:'lagom-p64', short:'Option-O Lagom P64', name:'Option-O Lagom P64 (64mm Flat)', group:'Flat-Burr Electric', burr:'64mm Mizen / SSP Flat', kind:'computed', max:11, min:0.2, unit:'dial', also:null,
    zero:'Stepless dial 0.0-11.0 calibrated from burr touch 0.0.', caution:'', cats:{} },
  { key:'xbloom-studio', short:'xBloom Studio (1-80)', name:'xBloom Studio Integrated Grinder (1-80)', group:'Conical Electric', burr:'48mm Heptagonal Conical (60-120 RPM)', kind:'computed', max:80, min:1, unit:'step', also:null,
    zero:'Motorized 80-step stepper collar (18.75 um/step; 180-1050 um D50): Espresso ~7-15, Omni Dripper 2 / V60 ~39-52, Cold Brew ~72-80.',
    caution:'RPM physics: 60-70 RPM low-velocity clean shear cuts micro-fines on Ethiopian/Decaf/Dark & clarity pours; 80-90 RPM balanced; 100-120 RPM boosts fine surface body on fast washed lots.', cats:{} },
  { key:'xbloom-original', short:'xBloom Original (1-30)', name:'xBloom Original Integrated Grinder (1-30)', group:'Conical Electric', burr:'48mm Conical Brew Burr', kind:'computed', max:30, min:1, unit:'step', also:null,
    zero:'Motorized 30-step filter collar (~420-1050 um D50): xPod / Omni Dripper ~11-18, Coarse Filter ~20-26.', caution:'Filter-dedicated grinder (does not grind fine enough for 9-bar espresso).', cats:{} },
  { key:'preground-grocery-drip', short:'Pre-Ground: Grocery Drip', name:'Pre-Ground - Grocery / Auto-Drip Medium (~460 um)', group:'Pre-Ground Coffee', burr:'Fixed ~460 um Auto-Drip', kind:'preground',
    how:'Grind size is fixed (~460 um). BeanTelligence automatically tunes bloom, pour gentleness, ratio, and water temperature instead.', ref:'', source:'Pre-ground compensation model.' },
  { key:'preground-grocery-espresso', short:'Pre-Ground: Moka / Espresso Brick', name:'Pre-Ground - Fine Brick / Tin (~230 um, Bustelo / Illy / Lavazza)', group:'Pre-Ground Coffee', burr:'Fixed ~230 um Moka/Fine', kind:'preground',
    how:'Fine ~230 um brick grind suited for Moka pot, AeroPress concentrate, and pressurized espresso baskets.', ref:'', source:'Pre-ground compensation model.' },
  { key:'preground-cafe', short:'Pre-Ground: Cafe / Roaster EK43', name:'Pre-Ground - Cafe / Roaster Ground for My Brewer', group:'Pre-Ground Coffee', burr:'Commercial Flat Burr (EK43)', kind:'preground',
    how:'High-uniformity commercial grind matched to your brewer; bloom shortened to compensate for faster post-grind CO2 release.', ref:'', source:'Pre-ground compensation model.' }
];

GRINDERS.forEach(g => {
  g.archetype = burrArchetypeFor(g.key);
  if (g.kind === 'computed' && GRINDER_CURVES[g.key]) g.cats = makeStdCats(g.key);
});
FLAGSHIP_GRINDERS_EXT.forEach(g => {
  g.archetype = burrArchetypeFor(g.key);
  if (g.kind === 'computed' && GRINDER_CURVES[g.key]) g.cats = makeStdCats(g.key);
});

const GRINDERS_ALL_V6 = GRINDERS.concat(FLAGSHIP_GRINDERS_EXT);

function grinderFor(key){
  if (key === 'preground-cafe-fresh') key = 'preground-cafe';
  if (key === 'other') return { key:'other', short:'Other Grinder', name:'Custom / Other Grinder', group:'Guided / Stepless', burr:'Custom Burr', kind:'calibrate', unit:'step', how:'Use your preferred dial mark and save 1-2 reference brews to calibrate.' };
  return GRINDERS.find(g => g.key === key) || FLAGSHIP_GRINDERS_EXT.find(g => g.key === key) || null;
}

function grindCategories(methodKey){
  if (methodKey === 'lever_espresso' || methodKey === 'philips5500') return ['espresso'];
  if (methodKey === 'cold_drip') return ['filter', 'chemex'];
  return ({
    turkish:['turkish', 'espresso'], espresso:['espresso'], moka:['moka', 'espresso'],
    press:['press'], cold:['cold', 'press'], aeropress:['aeropress', 'filter'],
    drip:['drip', 'filter'], chemex:['chemex', 'filter']
  })[methodKey] || ['filter'];
}
function grindCategory(methodKey){ return grindCategories(methodKey)[0]; }

function formatGrinderSetting(grinderKey, rawVal){
  const cv = GRINDER_CURVES[grinderKey];
  if (!cv || rawVal == null || !isFinite(rawVal)) return { display:'', shortDisplay:'', clicks:null };
  const fmt = cv.fmt;
  if (fmt === 'fellow_31'){
    const t = Math.max(0, Math.min(30, Math.round(rawVal)));
    const major = Math.floor(t / 3) + 1, sub = t % 3;
    const dialTxt = sub === 0 ? String(major) : major + '.' + sub;
    const fracTxt = sub === 1 ? ' (' + major + '-1/3)' : sub === 2 ? ' (' + major + '-2/3)' : '';
    return { clicks:t, dial:+(major + sub / 3).toFixed(2), display:'Dial ' + dialTxt + fracTxt + ' · step ' + t, shortDisplay:'Dial ' + dialTxt };
  }
  if (fmt === '1z_100_10'){
    const c = Math.round(rawVal), rot = Math.floor(c / 100), rem = c % 100, num = Math.floor(rem / 10), sub = rem % 10;
    const ringWrap = (rem / 10).toFixed(1);
    const disp = rot === 0 ? ('Ring ' + ringWrap + ' (0.' + num + '.' + sub + ' · ' + c + ' clicks)') : (rot + '.' + num + '.' + sub + ' (Turn ' + rot + ' Ring ' + ringWrap + ' · ' + c + ' clicks)');
    const sDisp = rot === 0 ? ('Ring ' + ringWrap + ' (' + c + 'c)') : (rot + '.' + num + '.' + sub + ' (' + c + 'c)');
    return { clicks:c, dial:+(c / 10).toFixed(1), display:disp, shortDisplay:sDisp };
  }
  if (fmt === '1z_100_10_esp'){
    const c = Math.round(rawVal), rot = Math.floor(c / 100), rem = c % 100, num = Math.floor(rem / 10), sub = rem % 10;
    return { clicks:c, turns:+(c / 100).toFixed(2), display:rot + '.' + num + '.' + sub + ' (' + c + ' clicks)', shortDisplay:rot + '.' + num + '.' + sub };
  }
  if (fmt === '1z_zp6'){
    const c = Math.round(rawVal), rot = Math.floor(c / 90), rem = c % 90, num = Math.floor(rem / 10), sub = rem % 10;
    const disp = rot === 0 ? ('Dial ' + num + '.' + sub + ' (' + c + ' clicks)') : (rot + '.' + num + '.' + sub + ' (Turn ' + rot + ' Dial ' + num + '.' + sub + ' · ' + c + ' clicks)');
    const sDisp = rot === 0 ? ('Dial ' + num + '.' + sub) : (rot + '.' + num + '.' + sub + ' (' + c + 'c)');
    return { clicks:c, dial:+(c / 10).toFixed(1), display:disp, shortDisplay:sDisp };
  }
  if (fmt === 's3_90_10'){
    const c = Math.round(rawVal), dial = (c / 10).toFixed(1);
    return { clicks:c, dial:+dial, display:'Dial ' + dial + ' (' + c + ' clicks)', shortDisplay:'Dial ' + dial };
  }
  if (fmt === '1z_40_4'){
    const c = Math.round(rawVal), rot = Math.floor(c / 40), rem = c % 40, num = Math.floor(rem / 4), sub = rem % 4;
    return { clicks:c, turns:+(c / 40).toFixed(2), display:rot + '.' + num + '.' + sub + ' (' + c + ' clicks)', shortDisplay:rot + '.' + num + '.' + sub + ' (' + c + 'c)' };
  }
  if (fmt === '1z_90_10'){
    const c = Math.round(rawVal), rot = Math.floor(c / 90), rem = c % 90, num = Math.floor(rem / 10), sub = rem % 10;
    return { clicks:c, turns:+(c / 90).toFixed(2), display:rot + '.' + num + '.' + sub + ' (' + c + ' clicks)', shortDisplay:rot + '.' + num + '.' + sub + ' (' + c + 'c)' };
  }
  if (fmt === '1z_60_10'){
    const c = Math.round(rawVal), rot = Math.floor(c / 60), rem = c % 60, num = Math.floor(rem / 10), sub = rem % 10;
    return { clicks:c, turns:+(c / 60).toFixed(2), display:rot + '.' + num + '.' + sub + ' (' + c + ' clicks)', shortDisplay:rot + '.' + num + '.' + sub };
  }
  if (fmt === '1z_30_3'){
    const c = Math.round(rawVal), rot = Math.floor(c / 30), rem = c % 30, num = Math.floor(rem / 3), sub = rem % 3;
    return { clicks:c, turns:+(c / 30).toFixed(2), display:c + ' clicks (' + rot + '.' + num + '.' + sub + ')', shortDisplay:c + ' clicks (' + rot + '.' + num + '.' + sub + ')' };
  }
  if (fmt === 'kinu_50'){
    const c = Math.round(rawVal), turns = Math.floor(c / 50), rem = c % 50, num = Math.floor(rem / 5), sub = rem % 5;
    return { clicks:c, turns:+(c / 50).toFixed(2), display:turns + '.' + num + '.' + sub + ' (' + c + ' div)', shortDisplay:turns + '.' + num + '.' + sub };
  }
  if (fmt === 'k6_60'){
    const c = Math.round(rawVal), rot = Math.floor(c / 60), sub = String(c % 60).padStart(2, '0');
    return { clicks:c, turns:+(c / 60).toFixed(2), display:c + ' clicks (' + rot + '.' + sub + ')', shortDisplay:c + ' clicks (' + rot + '.' + sub + ')' };
  }
  if (fmt === 'c3esp_30'){
    const c = Math.round(rawVal), rot = Math.floor(c / 30), rem = c % 30, turnsStr = (c / 30).toFixed(2);
    return { clicks:c, turns:+turnsStr, display:c + ' clicks (' + turnsStr + ' turns · ' + rot + 't+' + rem + 'c)', shortDisplay:c + ' clicks' };
  }
  if (fmt === 'sette_31E'){
    const m = Math.max(1, Math.min(31, Math.floor(rawVal + 0.5)));
    const frac = rawVal - m;
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
    const li = Math.max(0, Math.min(8, Math.round(4 + frac * 8)));
    const code = m + letters[li];
    return { clicks:rnd(rawVal, 1), display:'Setting ' + code + ' (Macro ' + m + ', Micro ' + letters[li] + ')', shortDisplay:code };
  }
  if (fmt === 'quarter_step'){
    const q = Math.round(rawVal * 4) / 4;
    return { clicks:q, dial:q, display:'Dial ' + q, shortDisplay:'Dial ' + q };
  }
  if (fmt === 'half_step'){
    const hVal = Math.round(rawVal * 2) / 2;
    const s = hVal.toFixed(1).replace(/\.0$/, '');
    return { clicks:hVal, dial:hVal, display:'Dial ' + s, shortDisplay:'Dial ' + s };
  }
  if (fmt === 'tenth_step'){
    const tVal = rnd(rawVal, 1);
    return { clicks:tVal, dial:tVal, display:'Dial ' + tVal.toFixed(1), shortDisplay:'Dial ' + tVal.toFixed(1) };
  }
  if (fmt === 'chestnut_x_5'){
    let macro = Math.floor(rawVal), micro = Math.round((rawVal - macro) * 5);
    if (micro >= 5){ macro += 1; micro = 0; }
    const v = +(macro + micro / 5).toFixed(2);
    return { clicks:v, display:'Macro ' + macro + '.' + micro, shortDisplay:macro + '.' + micro };
  }
  if (fmt === 'oxo_43'){
    const t = Math.max(0, Math.min(42, Math.round(rawVal))), major = Math.floor(t / 3) + 1, sub = t % 3;
    const txt = sub === 0 ? 'Setting ' + major : 'Setting ' + major + ' + ' + sub + (sub === 1 ? ' click' : ' clicks');
    return { clicks:t, dial:+(major + sub / 3).toFixed(2), display:txt, shortDisplay:sub === 0 ? 'Setting ' + major : major + '.' + sub };
  }
  if (fmt === 'niche_dial'){
    const v = Math.round(rawVal);
    return { clicks:v, display:v <= 50 ? 'Setting ' + v : '50 + ' + (v - 50) + ' marks (2nd turn)', shortDisplay:v <= 50 ? 'Mark ' + v : '50+' + (v - 50) };
  }
  if (fmt === 'wilfa_zone'){
    const v = Math.max(1, Math.min(32, Math.round(rawVal)));
    const z = v <= 5 ? 'Mocca' : v <= 11 ? 'Aeropress' : v <= 20 ? 'Filter' : v <= 27 ? 'French Press' : 'Steep';
    return { clicks:v, display:z + ' zone · click ' + v, shortDisplay:z + ' (' + v + ')' };
  }
  if (fmt === 'int_step'){
    const v = Math.round(rawVal);
    return { clicks:v, display:'Setting ' + v, shortDisplay:'Setting ' + v };
  }
  const c = Math.round(rawVal);
  return { clicks:c, display:c + (c === 1 ? ' click' : ' clicks'), shortDisplay:c + ' clicks' };
}

function parseGrinderInput(grinderKey, text){
  if (grinderKey === 'preground-cafe-fresh') grinderKey = 'preground-cafe';
  const rawStr = String(text == null ? '' : text).trim();
  if (!rawStr) return null;
  const cv = GRINDER_CURVES[grinderKey] || null;
  const fmt = cv ? cv.fmt : '';

  if (fmt === 'fellow_31'){
    const stAny = /\bstep\s*(\d{1,2})\b/i.exec(rawStr);
    if (stAny){ const st = +stAny[1]; return st >= 0 && st <= 30 ? st : null; }
  }
  if (fmt === 'wilfa_zone'){
    const wz = /\bclick\s*(\d{1,2})\b/i.exec(rawStr) || /\((\d{1,2})\)\s*$/.exec(rawStr);
    if (wz){ const wv = +wz[1]; return wv >= 1 && wv <= 32 ? wv : null; }
  }
  if (fmt === 'sette_31E'){
    const smAny = /(?:^|\bsetting\s*|\bmacro\s*)(\d{1,2})\s*([A-Ia-i])(?:\b|\s|\()/i.exec(rawStr);
    if (smAny){
      const mac = +smAny[1]; if (mac < 1 || mac > 31) return null;
      return rnd(mac + ('abcdefghi'.indexOf(smAny[2].toLowerCase()) - 4) * 0.1, 1);
    }
  }
  const clickTag = /(?:\(|·\s*)(\d{1,3})\s*(?:clicks?|c|div)\)/i.exec(rawStr) || /^(\d{1,3})\s*clicks?\s*\(/i.exec(rawStr) || /·\s*click\s*(\d{1,2})\b/i.exec(rawStr);
  if (clickTag) return +clickTag[1];

  if (fmt === 'fellow_31'){
    const stMatch = /^\s*step\s*(\d{1,2})\s*$/i.exec(rawStr);
    if (stMatch){ const st = +stMatch[1]; return st >= 0 && st <= 30 ? st : null; }
    const fracMatch = /^\s*(?:dial\s*|setting\s*)?(\d{1,2})(?:\s*[- ]\s*([12])\s*\/\s*3|\s*\.(\d))?\s*$/i.exec(rawStr);
    if (fracMatch){
      const maj = +fracMatch[1];
      if (maj < 1 || maj > 11) return null;
      let sub = 0;
      if (fracMatch[2]) sub = +fracMatch[2];
      else if (fracMatch[3]){
        const d = +fracMatch[3];
        if (d === 0) sub = 0;
        else if (d === 1 || d === 3) sub = 1;
        else if (d === 2 || d === 6 || d === 7) sub = 2;
        else return null;
      }
      const step = (maj - 1) * 3 + sub;
      return step >= 0 && step <= 30 ? step : null;
    }
    return null;
  }
  if (fmt === 'oxo_43'){
    const stMatch = /^\s*step\s*(\d{1,2})\s*$/i.exec(rawStr);
    if (stMatch){ const st = +stMatch[1]; return st >= 0 && st <= 42 ? st : null; }
    const oxMatch = /^\s*(?:setting\s*|dial\s*)?(\d{1,2})(?:\.([012])|\s*\+\s*([12])\s*clicks?)?\s*$/i.exec(rawStr);
    if (oxMatch){
      const maj = +oxMatch[1], sub = +(oxMatch[2] || oxMatch[3] || 0);
      if (maj < 1 || maj > 15) return null;
      const step = (maj - 1) * 3 + sub;
      return step >= 0 && step <= 42 ? step : null;
    }
    return null;
  }
  if (fmt === 'sette_31E'){
    const sm = /^\s*(?:macro\s*|setting\s*)?(\d{1,2})\s*([A-Ia-i])?\s*$/i.exec(rawStr);
    if (!sm) return null;
    const mac = +sm[1]; if (mac < 1 || mac > 31) return null;
    if (!sm[2]) return mac;
    const idx = 'abcdefghi'.indexOf(sm[2].toLowerCase());
    return rnd(mac + (idx - 4) * 0.1, 1);
  }
  const rnc = /^\s*(?:ring\s*|dial\s*)?(\d{1,2})[.\-](\d{1,2})[.\-](\d{1,2})\s*$/i.exec(rawStr);
  if (rnc){
    const r = +rnc[1], n = +rnc[2], s = +rnc[3];
    if (fmt === '1z_40_4') return r * 40 + n * 4 + s;
    if (fmt === '1z_90_10' || fmt === '1z_zp6' || fmt === 's3_90_10') return r * 90 + n * 10 + s;
    if (fmt === '1z_100_10' || fmt === '1z_100_10_esp') return r * 100 + n * 10 + s;
    if (fmt === '1z_60_10') return r * 60 + n * 10 + s;
    if (fmt === '1z_30_3') return r * 30 + n * 3 + s;
    if (fmt === 'kinu_50') return r * 50 + n * 5 + s;
  }
  if (fmt === '1z_100_10' || fmt === '1z_zp6' || fmt === 's3_90_10'){
    const expClick = /^\s*(?:click\s*)?(\d{2,3})\s*clicks?\s*$/i.exec(rawStr);
    if (expClick) return +expClick[1];
    const expRing = /^\s*(?:ring|dial)\s*(\d{1,2}(?:\.\d)?)\s*$/i.exec(rawStr);
    if (expRing) return Math.round(parseFloat(expRing[1]) * 10);
    if (/^\d{1,2}\.\d$/.test(rawStr)) return Math.round(parseFloat(rawStr) * 10);
    if (/^\d{1,3}$/.test(rawStr)){
      const v = +rawStr;
      if (v >= 1 && v <= 11 && v < (cv.minSafeRaw || 12)) return v * 10;
      return v;
    }
  }
  if (fmt === 'k6_60' || fmt === 'c3esp_30'){
    const per = fmt === 'k6_60' ? 60 : 30;
    const rc = /^\s*(\d)\.(\d{2})\s*(?:turns?)?\s*$/i.exec(rawStr);
    if (rc && +rc[2] < per) return (+rc[1]) * per + (+rc[2]);
  }
  if (fmt === 'kinu_50'){
    const tm = /^\s*(\d(?:\.\d{1,2})?)\s*turns?\s*$/i.exec(rawStr);
    if (tm) return Math.round(parseFloat(tm[1]) * 50);
    if (/^\d\.\d$/.test(rawStr)) return Math.round(parseFloat(rawStr) * 50);
  }
  if (fmt === 'chestnut_x_5'){
    const cx = /^\s*(?:macro\s*|dial\s*)?(\d{1,2})(?:\.([0-4]))?\s*$/i.exec(rawStr);
    if (cx) return +cx[1] + (+(cx[2] || 0)) / 5;
  }
  if (fmt === 'niche_dial'){
    const nz = /^\s*50\s*\+\s*(\d{1,2})\b/i.exec(rawStr);
    if (nz) return 50 + (+nz[1]);
  }
  const gen = /^\s*(?:(?:click|step|macro step|macro|setting|mark|dial|ring|div|division)\s*)?(\d{1,4}(?:\.\d{1,2})?)(?:\s*(?:clicks?|steps?|macro steps?|macros?|settings?|marks?|divs?|divisions?|um))?\s*$/i.exec(rawStr);
  if (gen){
    const val = parseFloat(gen[1]);
    return isFinite(val) ? val : null;
  }
  return null;
}

function clickFromText(t, grinderKey){
  if (grinderKey) return parseGrinderInput(grinderKey, t);
  const m = /^\s*(?:(?:click|step|macro step|macro|setting|mark|dial|ring)\s*)?(\d{1,4}(?:\.\d{1,2})?)/i.exec(String(t == null ? '' : t));
  return m ? parseFloat(m[1]) : null;
}

const CALIB_MAX = 5;
const CALIB_CATS = ['turkish', 'espresso', 'moka', 'aeropress', 'filter', 'chemex', 'drip', 'press', 'cold'];

function calibClean(raw){
  const out = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
  Object.keys(raw).slice(0, 70).forEach(gKey => {
    const gk = gKey === 'preground-cafe-fresh' ? 'preground-cafe' : gKey;
    const gObj = grinderFor(gk);
    const validG = (gObj && gObj.kind !== 'preground') || gk === 'other';
    if (!validG || !raw[gKey] || typeof raw[gKey] !== 'object' || Array.isArray(raw[gKey])) return;
    CALIB_CATS.forEach(ck => {
      const list = Object.prototype.hasOwnProperty.call(raw[gKey], ck) ? raw[gKey][ck] : null;
      if (!Array.isArray(list)) return;
      const obs = list.filter(x => x && typeof x === 'object' && typeof x.o === 'number' && isFinite(x.o) && Math.abs(x.o) <= 250 && typeof x.id === 'string' && x.id.length <= 48)
        .slice(-CALIB_MAX).map(x => ({ o:Number.isInteger(x.o) ? x.o : rnd(x.o, 2), id:x.id }));
      if (obs.length){ out[gk] = out[gk] || {}; out[gk][ck] = obs; }
    });
  });
  return out;
}

function grindBase(g, methodKey, um){
  if (!g || !(um > 0)) return null;
  const cv = GRINDER_CURVES[g.key];
  const mMeta = METHOD_TARGET_UM[methodKey] || METHOD_TARGET_UM.v60;
  const ck = (g.cats && g.cats[mMeta.cat]) ? mMeta.cat : (grindCategories(methodKey).find(c => g.cats && g.cats[c]) || 'filter');
  const isEspMethod = methodKey === 'espresso' || methodKey === 'lever_espresso';
  if (cv && (cv.knots || cv.refKnots)){
    if (cv.filterOnly && (methodKey === 'turkish' || isEspMethod)) return null;
    if (cv.noTurk && methodKey === 'turkish') return null;
    const kn = cv.knots || cv.refKnots;
    const raw = interpKnots(kn, um);
    const lo = cv.minSafeRaw != null ? cv.minSafeRaw : (g.min || 0);
    const hi = cv.maxRaw != null ? cv.maxRaw : (g.max == null ? Infinity : g.max);
    const isDec = ['quarter_step', 'half_step', 'tenth_step', 'chestnut_x_5', 'sette_31E'].includes(cv.fmt);
    const snapped = cv.fmt === 'sette_31E' ? (Math.round(raw * 10) / 10) : (isDec ? Math.round(raw * 20) / 20 : Math.round(raw));
    const base = Math.max(lo, Math.min(hi, snapped));
    const slope = slopeAtUm(kn, um);
    const cObj = (g.cats && g.cats[ck]) || { label:mMeta.label.toLowerCase(), clicks:[rnd(interpKnots(kn, mMeta.range[0]), 1), rnd(interpKnots(kn, mMeta.range[1]), 1)] };
    return { ck, c:cObj, slope, line:true, known:true, base, raw, pastEnd:raw > hi + 0.5 ? 'coarse' : raw < lo - 0.5 ? 'fine' : '' };
  }
  if (g.key === 'other' || g.kind === 'calibrate'){
    return { ck:mMeta.cat || 'filter', c:{ label:mMeta.label.toLowerCase(), clicks:[0, 100] }, slope:0.05, line:false, known:false, base:0, raw:0, pastEnd:'' };
  }
  return null;
}

function calibOffset(calib, key, methodKey){
  const g = key === 'other' ? { key:'other', kind:'calibrate', cats:{} } : grinderFor(key);
  if (!g || g.kind === 'preground') return null;
  const bb = grindBase(g, methodKey, (METHOD_TARGET_UM[methodKey] || METHOD_TARGET_UM.v60).anchor);
  if (!bb) return null;
  const clean = calibClean(calib), list = clean[g.key] && clean[g.key][bb.ck];
  if (!list || !list.length) return null;
  const o = list.map(x => x.o).sort((a, b) => a - b), n = o.length;
  const midRaw = n % 2 ? o[(n - 1) / 2] : (o[n / 2 - 1] + o[n / 2]) / 2;
  const cv = GRINDER_CURVES[g.key];
  const isDec = cv && ['quarter_step', 'half_step', 'tenth_step', 'chestnut_x_5', 'sette_31E'].includes(cv.fmt);
  const mid = isDec ? Math.round(midRaw * 20) / 20 : Math.round(midRaw);
  return { offset:mid, n, category:bb.c.label };
}

function calibAdd(calib, key, methodKey, um, text){
  const g = key === 'other' ? { key:'other', kind:'calibrate', min:0, max:200, cats:{} } : grinderFor(key);
  if (!g || g.kind === 'preground' || !(um > 0)) return null;
  const used = parseGrinderInput(g.key, text);
  if (used == null) return null;
  const cv = GRINDER_CURVES[g.key];
  const lo = cv && cv.minSafeRaw != null ? Math.min(cv.minSafeRaw, g.min || 0) : (g.min || 0);
  const hi = cv && cv.maxRaw != null ? cv.maxRaw : (g.max == null ? 1500 : g.max);
  if (used < lo || used > hi) return null;
  const b = grindBase(g, methodKey, um); if (!b) return null;
  const oRaw = used - b.base;
  const o = Number.isInteger(oRaw) ? oRaw : rnd(oRaw, 2);
  if (Math.abs(o) > 250) return null;
  const id = used + '@' + Math.round(um);
  const next = calibClean(calib), list = (next[g.key] && next[g.key][b.ck]) || [];
  if (list.some(x => x.id === id)) return { calib:next, offset:o, base:b.base, used, added:false, category:b.c.label, line:!!b.line };
  next[g.key] = next[g.key] || {};
  next[g.key][b.ck] = list.concat([{ o, id }]).slice(-CALIB_MAX);
  return { calib:next, offset:o, base:b.base, used, added:true, category:b.c.label, line:!!b.line };
}

function calibForget(calib, key, methodKey){
  const g = key === 'other' ? { key:'other', kind:'calibrate', cats:{} } : grinderFor(key);
  const next = calibClean(calib);
  if (!g || !next[g.key]) return next;
  const bb = grindBase(g, methodKey, (METHOD_TARGET_UM[methodKey] || METHOD_TARGET_UM.v60).anchor);
  if (!bb) return next;
  delete next[g.key][bb.ck];
  if (!Object.keys(next[g.key]).length) delete next[g.key];
  return next;
}

function grinderSettingForMicrons(grinderKey, targetMicrons, methodKey, calib){
  const mKey = methodKey || 'v60';
  const um = targetMicrons > 0 ? targetMicrons : (METHOD_TARGET_UM[mKey] ? METHOD_TARGET_UM[mKey].anchor : 550);
  const g = grinderFor(grinderKey);
  if (!g){
    if (grinderKey === 'other'){
      const cal = calibOffset(calib, 'other', mKey);
      if (cal) return { ok:true, incompatible:false, preground:false, grinderKey:'other', grinder:'Your grinder', name:'Custom grinder', kind:'calibrate', raw:cal.offset, clicks:cal.offset, base:0, unit:'setting', display:'Setting ' + cal.offset + ' (saved anchor)', shortDisplay:'Setting ' + cal.offset, headline:'Setting ' + cal.offset, brief:'Your saved setting: ' + cal.offset + '.', stepClicks:1, calibrated:true, offset:cal.offset, calN:cal.n, targetUm:Math.round(um), clamped:'', warning:'', compensation:null };
    }
    return null;
  }
  if (g.kind === 'preground'){
    const pg = PREGROUND_PROFILES[g.key] || PREGROUND_PROFILES['preground-grocery-drip'];
    const comp = pg.forMethod(mKey);
    return {
      ok:!comp.incompatible, incompatible:!!comp.incompatible, preground:true, grindLocked:true,
      grinderKey:g.key, grinder:g.short, name:g.name, kind:'preground', raw:null, clicks:null, base:null,
      fixedUm:pg.fixedUm, unit:'pre-ground', display:pg.label, shortDisplay:'Pre-Ground',
      headline:pg.label, brief:comp.note, stepClicks:0, calibrated:false, offset:0, calN:0,
      targetUm:pg.fixedUm || Math.round(um), clamped:'', warning:comp.incompatible ? comp.note : '', compensation:comp
    };
  }
  const cv = GRINDER_CURVES[g.key];
  const isEspMethod = mKey === 'espresso' || mKey === 'lever_espresso';
  if (cv && cv.filterOnly && (mKey === 'turkish' || isEspMethod)){
    const msg = g.short + ' uses filter-dedicated burrs (finest safe setting ~' + cv.minUm + ' um) and cannot grind fine enough for ' + (mKey === 'turkish' ? 'Turkish coffee' : 'unpressurized espresso') + '.';
    return { ok:false, incompatible:true, preground:false, grinderKey:g.key, grinder:g.short, name:g.name, kind:'calibrate', raw:null, clicks:null, base:null, unit:g.unit || 'click', display:'Incompatible (' + g.short + ' is filter-only)', shortDisplay:'Filter-only burr', headline:'Filter-only burrs', brief:msg, stepClicks:null, calibrated:false, offset:0, calN:0, targetUm:Math.round(um), clamped:'fine', warning:msg, compensation:null };
  }
  if (cv && cv.noTurk && mKey === 'turkish'){
    const msg = g.short + ' cannot safely reach powder-fine Turkish grind without burr rub.';
    return { ok:false, incompatible:true, preground:false, grinderKey:g.key, grinder:g.short, name:g.name, kind:'calibrate', raw:null, clicks:null, base:null, unit:g.unit || 'click', display:'Too fine for ' + g.short, shortDisplay:'Finest limit', headline:'Finest setting limit', brief:msg, stepClicks:null, calibrated:false, offset:0, calN:0, targetUm:Math.round(um), clamped:'fine', warning:msg, compensation:null };
  }
  if (g.kind === 'calibrate'){
    const cal = calibOffset(calib, g.key, mKey);
    if (cv && cv.refKnots){
      const refRaw = interpKnots(cv.refKnots, um);
      const val = Math.max(1, Math.round(refRaw + (cal ? cal.offset : 0)));
      const fmtObj = formatGrinderSetting(g.key, val);
      return { ok:true, incompatible:false, preground:false, grinderKey:g.key, grinder:g.short, name:g.name, kind:'calibrate', raw:val, clicks:val, base:Math.round(refRaw), unit:'click', display:'~' + fmtObj.display + (cal ? ' (calibrated)' : ' (guide)'), shortDisplay:'~' + fmtObj.shortDisplay, headline:'about ' + fmtObj.display, brief:'On your ' + g.short + ': about ' + fmtObj.display + '.', stepClicks:1, calibrated:!!cal, offset:cal ? cal.offset : 0, calN:cal ? cal.n : 0, targetUm:Math.round(um), clamped:'', warning:g.how || '', compensation:null };
    }
    const isNut = !!(cv && cv.fmt === 'unmarked_nut');
    const anchorDisp = cal ? ('Saved mark ' + cal.offset) : 'Stepless / Calibrate by taste';
    return { ok:true, incompatible:false, preground:false, grinderKey:g.key, grinder:g.short, name:g.name, kind:'calibrate', calibMode:'taste', stepless:true, refKnots:null, fmt:(cv && cv.fmt) || 'stepless', raw:cal ? cal.offset : null, clicks:cal ? cal.offset : null, base:0, unit:isNut ? 'turn' : 'mark', display:anchorDisp, shortDisplay:anchorDisp, headline:anchorDisp, brief:g.how || '', stepClicks:0, calibrated:!!cal, offset:cal ? cal.offset : 0, calN:cal ? cal.n : 0, targetUm:Math.round(um), clamped:'', warning:'', compensation:null };
  }
  const b = grindBase(g, mKey, um);
  if (!b) return null;
  const cal = calibOffset(calib, g.key, mKey);
  const lo = cv.minSafeRaw != null ? cv.minSafeRaw : (g.min || 0);
  const hi = cv.maxRaw != null ? cv.maxRaw : (g.max == null ? Infinity : g.max);
  const adjRaw = Math.max(lo, Math.min(hi, b.base + (cal ? cal.offset : 0)));
  const fmtObj = formatGrinderSetting(g.key, adjRaw);
  const stepClicks = Math.max(cv.fmt === 'quarter_step' ? 0.25 : cv.fmt === 'half_step' ? 0.5 : cv.fmt === 'tenth_step' ? 0.2 : 1, Math.round(25 * b.slope * 4) / 4);
  const warn = (cv.noEsp && isEspMethod) ? (g.caution || 'Pressurized basket recommended on this grinder.') : (g.caution && isEspMethod ? g.caution : '');
  return {
    ok:true, incompatible:false, preground:false, grinderKey:g.key, grinder:g.short, name:g.name, kind:'computed',
    raw:adjRaw, clicks:fmtObj.clicks, dial:fmtObj.dial, turns:fmtObj.turns, base:b.base, unit:g.unit || 'click',
    display:fmtObj.display, shortDisplay:fmtObj.shortDisplay, headline:fmtObj.display,
    brief:'On your ' + g.short + ': ' + fmtObj.display + '.',
    stepClicks:stepClicks >= 1 ? Math.round(stepClicks) : stepClicks,
    calibrated:!!cal, offset:cal ? cal.offset : 0, calN:cal ? cal.n : 0,
    category:b.c.label, range:b.c.clicks.slice(), targetUm:Math.round(um), clamped:b.pastEnd, warning:warn, compensation:null
  };
}

function micronsForGrinderSetting(grinderKey, settingOrText, methodKey, calib){
  if (methodKey && typeof methodKey === 'object' && calib === undefined){
    calib = methodKey;
    methodKey = 'v60';
  }
  const mKey = methodKey || 'v60';
  const mAnchor = (METHOD_TARGET_UM[mKey] || METHOD_TARGET_UM.v60).anchor || 560;
  const g = grinderFor(grinderKey);
  if (!g) return mAnchor;
  if (g.kind === 'preground') {
    const pg = PREGROUND_PROFILES[g.key];
    return pg && pg.fixedUm ? pg.fixedUm : mAnchor;
  }
  const raw = typeof settingOrText === 'number' ? settingOrText : parseGrinderInput(g.key, settingOrText);
  if (raw != null && isFinite(raw) && calib && typeof calib === 'object' && !Array.isArray(calib) && calib.slopeM > 0){
    const normG = String(g.key || '').toLowerCase().replace(/_/g, '-');
    if (!calib.grinderKey || String(calib.grinderKey).toLowerCase().replace(/_/g, '-') === normG){
      return rnd(clampNum((+calib.d0OffsetUm || 100) + (+calib.slopeM) * raw, 55, 1600, mAnchor), 1);
    }
  }
  const cv = GRINDER_CURVES[g.key];
  const kn = cv && (cv.knots || cv.refKnots);
  if (!kn){
    if (raw == null || !isFinite(raw)) return mAnchor;
    if (cv && cv.fmt === 'unmarked_nut') return rnd(clampNum(160 + raw * 420, 70, 1400, mAnchor), 1);
    if (cv && cv.fmt === 'chirp_relative_marks') return rnd(clampNum(150 + raw * 65, 70, 1400, mAnchor), 1);
    return rnd(clampNum(160 + raw * 120, 70, 1400, mAnchor), 1);
  }
  if (raw == null || !isFinite(raw)) return mAnchor;
  const cal = calib ? calibOffset(calib, g.key, mKey) : null;
  const unshifted = raw - (cal ? cal.offset : 0);
  return rnd(invertKnotsToUm(kn, unshifted), 1);
}

function grindGuide(key, methodKey, um, stepUm, calib){
  const s = grinderSettingForMicrons(key, um, methodKey, calib);
  if (!s) return null;
  const g = grinderFor(key) || { short:'Your grinder', zero:'' };
  if (s.preground){
    return { kind:'preground', preground:true, incompatible:s.incompatible, reason:'preground', grinder:s.grinder, how:g.how || '', ref:'', brief:s.brief, headline:s.display, display:s.display, shortDisplay:s.shortDisplay, details:[s.brief], compensation:s.compensation, line:s.brief };
  }
  if (s.incompatible || s.kind !== 'computed'){
    const details = [s.brief, g.how || '', g.ref || ''].filter(Boolean);
    return { kind:'calibrate', incompatible:s.incompatible, reason:s.incompatible ? 'gap' : (g.reason || 'none'), grinder:s.grinder, clicks:s.clicks, display:s.display, shortDisplay:s.shortDisplay, how:g.how || '', ref:g.ref || '', brief:s.clicks != null ? s.brief : null, headline:s.clicks != null ? s.headline : null, calibrated:s.calibrated, offset:s.offset, calN:s.calN, details, line:details.join(' ') };
  }
  const fLo = formatGrinderSetting(key, s.range[0]).shortDisplay, fHi = formatGrinderSetting(key, s.range[1]).shortDisplay;
  const details = ['Typical ' + s.category + ' window on ' + s.grinder + ': ' + fLo + ' to ' + fHi + ' (target ~' + s.targetUm + ' um D50).'];
  if (g.zero) details.push(g.zero);
  if (s.warning) details.push(s.warning);
  return {
    kind:'computed', grinder:s.grinder, unit:s.unit, clicks:s.clicks, raw:s.raw, base:s.base,
    calibrated:s.calibrated, offset:s.offset, calN:s.calN, category:s.category,
    display:s.display, shortDisplay:s.shortDisplay, headline:s.display, brief:s.brief,
    details, range:s.range, stepClicks:s.stepClicks || 1, known:true, caution:s.warning || '',
    line:s.brief + ' ' + details.join(' ')
  };
}

/* ---------- 6. WATER_PRESETS_UNIFIED + IUPAC 2021 8-Reagent Chemistry & pH 5.0 Citrate Speciation (Fixes Bug C8) ---------- */
const WATER_IUPAC = {
  CACO3_MW: 100.0869,
  CACO3_EQ: 50.04345,
  DH_TO_PPM: 17.848,
  FH_TO_PPM: 10.0,
  GPG_TO_PPM: 17.118,
  CA_TO_GH: 2.4973,
  MG_TO_GH: 4.1180,
  HCO3_TO_KH: 0.8202,
  CO3_TO_KH: 1.6679,
  /* Exact IUPAC 2021 8-Reagent Stoichiometry for +1.00 mg/L as CaCO3 in 1.000 L */
  SALTS: {
    epsom:           { key:'epsom',           name:'Epsom Salt',                     formula:'MgSO4·7H2O',       mw:246.47,  role:'mg', mgPerPpm:2.4626, ionTdsPerPpm:1.2026, clPerPpm:0,      naPerPpm:0,      kPerPpm:0,      citrate:false },
    mgcl2:           { key:'mgcl2',           name:'Magnesium Chloride Hexahydrate', formula:'MgCl2·6H2O',       mw:203.30,  role:'mg', mgPerPpm:2.0312, ionTdsPerPpm:0.9512, clPerPpm:0.7084, naPerPpm:0,      kPerPpm:0,      citrate:false },
    cacl2_dihydrate: { key:'cacl2_dihydrate', name:'Calcium Chloride Dihydrate',     formula:'CaCl2·2H2O',       mw:147.01,  role:'ca', mgPerPpm:1.4688, ionTdsPerPpm:1.1088, clPerPpm:0.7084, naPerPpm:0,      kPerPpm:0,      citrate:false },
    cacl2_anhydrous: { key:'cacl2_anhydrous', name:'Calcium Chloride Anhydrous',     formula:'CaCl2',            mw:110.98,  role:'ca', mgPerPpm:1.1088, ionTdsPerPpm:1.1088, clPerPpm:0.7084, naPerPpm:0,      kPerPpm:0,      citrate:false },
    nahco3:          { key:'nahco3',          name:'Sodium Bicarbonate (Baking Soda)',formula:'NaHCO3',          mw:84.007,  role:'kh', mgPerPpm:1.6787, ionTdsPerPpm:1.6787, clPerPpm:0,      naPerPpm:0.4594, kPerPpm:0,      citrate:false, hPlusFactorPh5:0.96 },
    khco3:           { key:'khco3',           name:'Potassium Bicarbonate',          formula:'KHCO3',            mw:100.115, role:'kh', mgPerPpm:2.0006, ionTdsPerPpm:2.0006, clPerPpm:0,      naPerPpm:0,      kPerPpm:0.7813, citrate:false, hPlusFactorPh5:0.96 },
    k3cit:           { key:'k3cit',           name:'Potassium Citrate Monohydrate',  formula:'K3C6H5O7·H2O',     mw:324.41,  role:'kh', mgPerPpm:2.1609, ionTdsPerPpm:2.0410, clPerPpm:0,      naPerPpm:0,      kPerPpm:0.7813, citrate:true,  zEq:3, nBarHPh5:1.34, hPlusFactorPh5:0.45 },
    na3cit:          { key:'na3cit',          name:'Trisodium Citrate Dihydrate',    formula:'Na3C6H5O7·2H2O',   mw:294.10,  role:'kh', mgPerPpm:1.9590, ionTdsPerPpm:1.7191, clPerPpm:0,      naPerPpm:0.4594, kPerPpm:0,      citrate:true,  zEq:3, nBarHPh5:1.34, hPlusFactorPh5:0.45 }
  }
};
const WATER_IUPAC_V6 = WATER_IUPAC;

const WATER_PRESETS_UNIFIED = attachByKey([
  { key:'sca-ideal',      id:'sca_classic',   cat:'Target',  group:'Specialty Standards', label:'SCA-102 Balanced Midpoint',     name:'SCA-102 Balanced Midpoint',     waterType:'remineral', gh:68,  ghMg:40,  ghCa:28,  kh:45,  khSalt:'nahco3', tds:122, citrate:false, badge:'SCA Balanced',       note:'SCA Standard 102-2024 midpoint (68 ppm GH / 45 ppm KH as CaCO3): balanced sweetness and crisp acidity.' },
  { key:'diy-hendon',     id:'hendon_ideal',  cat:'Target',  group:'Specialty Standards', label:'Hendon Specialty Ideal',        name:'Hendon Specialty Ideal',        waterType:'remineral', gh:95,  ghMg:70,  ghCa:25,  kh:35,  khSalt:'nahco3', tds:138, citrate:false, badge:'Mg-Rich Clarity',    note:'Mg-rich (~3:1 Mg:Ca, 95 GH / 35 KH) per Hendon & Colonna-Dashwood (2014-2015) for vibrant extraction.' },
  { key:'lotus-bright',   id:'rao_lotus',     cat:'Target',  group:'Specialty Standards', label:'Lotus / Rao Light & Bright',    name:'Lotus / Rao Light & Bright',    waterType:'remineral', gh:65,  ghMg:45,  ghCa:20,  kh:25,  khSalt:'khco3',  tds:95,  citrate:false, badge:'High Clarity',       note:'Low 25 ppm KH potassium bicarbonate buffer lets washed Ethiopian and Kenyan fruit acids sparkle.' },
  { key:'lotus-sweet',    id:'lotus_sweet',   cat:'Target',  group:'Specialty Standards', label:'Lotus Simple & Sweet',          name:'Lotus Simple & Sweet',          waterType:'remineral', gh:85,  ghMg:45,  ghCa:40,  kh:45,  khSalt:'khco3',  tds:135, citrate:false, badge:'Round & Sweet',      note:'Balanced Mg/Ca hardness and 45 ppm KH round sharp edges into caramel sweetness.' },
  { key:'ultra-gesha',    id:'ultra_gesha',   cat:'Target',  group:'Specialty Standards', label:'Ultra-Clarity Gesha / Nordic',  name:'Ultra-Clarity Gesha / Nordic',  waterType:'remineral', gh:60,  ghMg:45,  ghCa:15,  kh:18,  khSalt:'khco3',  tds:82,  citrate:false, badge:'Nordic Floral',      note:'Low-KH profile for ultra-light Gesha, white florals, and unimodal flat burrs.' },
  { key:'esp-hybrid',     id:'esp_hybrid',    cat:'Target',  group:'Specialty Standards', label:'Scale-Safe Espresso Hybrid',    name:'Scale-Safe Espresso Hybrid',    waterType:'remineral', gh:70,  ghMg:45,  ghCa:25,  kh:45,  khSalt:'khco3',  tds:125, citrate:false, badge:'Scale-Safe Esp',     note:'Ca x KH = 1125 (<2500 safe): rich espresso crema with low boiler scaling.' },
  { key:'rpavlis',        id:'rpavlis',       cat:'Target',  group:'Specialty Standards', label:'RPavlis Zero-Scale Boiler',     name:'RPavlis Zero-Scale Boiler',     waterType:'remineral', gh:0,   ghMg:0,   ghCa:0,   kh:50,  khSalt:'khco3',  tds:100, citrate:false, badge:'Zero Scale Forever', note:'Pure KHCO3 at 50 ppm KH / 0 GH in distilled water: physically impossible to form CaCO3 boiler scale.' },
  { key:'med-dark-body',  id:'med_dark_body', cat:'Target',  group:'Specialty Standards', label:'Full-Body Med/Dark Roast',      name:'Full-Body Med/Dark Roast',      waterType:'remineral', gh:85,  ghMg:30,  ghCa:55,  kh:55,  khSalt:'nahco3', tds:148, citrate:false, badge:'Cocoa Body',         note:'Higher Ca2+ + 55 ppm KH rounds out dark-roast phenylindanes into creamy cocoa sweetness.' },
  { key:'bh-2salt',       id:'bh_2salt',      cat:'Target',  group:'Specialty Standards', label:'Simple 2-Salt DIY (BH #4)',     name:'Simple 2-Salt DIY (BH #4)',     waterType:'remineral', gh:81,  ghMg:81,  ghCa:0,   kh:40,  khSalt:'nahco3', tds:126, citrate:false, badge:'2-Salt DIY',         note:'Pharmacy Epsom Salt + Baking Soda in distilled water; zero calcium = zero calcite scale.' },
  { key:'tww-classic',    id:'tww_classic',   cat:'Packet',  group:'Mineral Packets',     label:'Third Wave Water Classic (100%)',name:'Third Wave Water Classic',     waterType:'remineral', gh:95,  ghMg:70,  ghCa:25,  kh:40,  khSalt:'na3cit', tds:150, citrate:true,  naOverrideMgL:10, clOverrideMgL:15, badge:'Citrate Zero-Scale', note:'MgSO4 + Calcium Citrate + NaCl (~95 GH / ~40 ppm nominal citrate eq.): buffers ~45% per charge-eq at pH 5.0 with zero carbonate boiler scale on RO water.' },
  { key:'tww-half',       id:'tww_half',      cat:'Packet',  group:'Mineral Packets',     label:'Third Wave Water (50% Diluted)',name:'Third Wave Water (50% Dil.)',   waterType:'remineral', gh:48,  ghMg:35,  ghCa:13,  kh:20,  khSalt:'na3cit', tds:75,  citrate:true,  badge:'Nordic Packet',      note:'1 Classic stick across 2 US Gallons: ultra-clean floral pour-overs.' },
  { key:'tww-light',      id:'tww_light',     cat:'Packet',  group:'Mineral Packets',     label:'Third Wave Water Light Roast',  name:'Third Wave Water Light Roast',  waterType:'remineral', gh:85,  ghMg:60,  ghCa:25,  kh:25,  khSalt:'k3cit',  tds:125, citrate:true,  badge:'Bright Packet',      note:'Lower citrate buffer preserves juicy malic/citric fruit sparkle.' },
  { key:'tww-espresso',   id:'tww_espresso',  cat:'Packet',  group:'Mineral Packets',     label:'Third Wave Water Espresso',     name:'Third Wave Water Espresso',     waterType:'remineral', gh:135, ghMg:135, ghCa:0,   kh:55,  khSalt:'khco3',  tds:175, citrate:false, badge:'Boiler-Safe Packet', note:'Calcium-free & chloride-free espresso packet protecting stainless boilers.' },
  { key:'ro-distilled',   id:'ro_distilled',  cat:'Base',    group:'Pure / Bottled',      label:'Reverse Osmosis / Distilled',   name:'Distilled / RO / ZeroWater',    waterType:'distilled', gh:0,   ghMg:0,   ghCa:0,   kh:0,   khSalt:'khco3',  tds:2,   citrate:false, badge:'Zero Buffer Alert',  note:'0 ppm GH/KH lacks Mg2+/Ca2+ extractors and buffer (pH ~4.88 sharp cup & espresso level-probe conductivity warning).' },
  { key:'soft-tap',       id:'soft_tap',      cat:'Tap',     group:'Tap & Pitcher',       label:'Soft Municipal Tap',            name:'Soft Municipal Tap',            waterType:'filtered',  gh:35,  ghMg:13,  ghCa:22,  kh:20,  khSalt:'nahco3', tds:58,  citrate:false, badge:'Naturally Soft',     note:'Naturally low-KH municipal tap (e.g. Seattle/NYC/Portland); pass through carbon block to strip chlorine.' },
  { key:'medium-tap',     id:'medium_tap',    cat:'Tap',     group:'Tap & Pitcher',       label:'Medium Balanced Tap',           name:'Medium Balanced Tap',           waterType:'tap',       gh:85,  ghMg:30,  ghCa:55,  kh:50,  khSalt:'nahco3', tds:145, citrate:false, badge:'Balanced Tap',       note:'Near-SCA mineral balance; carbon-filter for chlorine taste.' },
  { key:'hard-tap',       id:'hard_tap',      cat:'Tap',     group:'Tap & Pitcher',       label:'Hard High-Alkalinity Tap',      name:'Hard High-KH Municipal Tap',    waterType:'tap',       gh:185, ghMg:65,  ghCa:120, kh:135, khSalt:'nahco3', tds:285, citrate:false, badge:'High KH Scale Risk', note:'135 ppm KH neutralizes fruit acids into flat chalky cups and scales boilers — blend with RO/ZeroWater.' },
  { key:'brita',          id:'brita',         cat:'Tap',     group:'Tap & Pitcher',       label:'Brita / Carbon + H+ Pitcher',   name:'Brita Filtered Pitcher',        waterType:'filtered',  gh:55,  ghMg:20,  ghCa:35,  kh:35,  khSalt:'nahco3', tds:95,  citrate:false, badge:'Filtered Pitcher',   note:'Fresh cartridges (<4 wk) reduce temporary carbonate KH and strip chlorine.' },
  { key:'bwt-mg',         id:'bwt_mg',        cat:'Tap',     group:'Tap & Pitcher',       label:'BWT Mg2+ Filtered',             name:'BWT Mg2+ Ion-Exchange',         waterType:'filtered',  gh:70,  ghMg:48,  ghCa:22,  kh:45,  khSalt:'nahco3', tds:120, citrate:false, badge:'Mg2+ Exchange',      note:'Exchanges scale-forming Ca2+ for flavor-binding Mg2+ while stripping chlorine.' },
  { key:'volvic',         id:'volvic',        cat:'Bottled', group:'Pure / Bottled',      label:'Volvic Natural Spring',         name:'Volvic Spring (France)',        waterType:'bottled',   gh:62,  ghMg:32,  ghCa:30,  kh:58,  khSalt:'nahco3', tds:130, citrate:false, badge:'Bottled Benchmark',  note:'Classic SCA-compliant volcanic spring benchmark (62 ppm GH / 58 ppm KH).' },
  { key:'poland-spring',  id:'poland_spring', cat:'Bottled', group:'Pure / Bottled',      label:'Poland Spring',                 name:'Poland Spring (Maine)',         waterType:'bottled',   gh:20,  ghMg:8,   ghCa:12,  kh:16,  khSalt:'nahco3', tds:40,  citrate:false, badge:'Ultra-Soft Spring',  note:'Low 16 ppm KH showcases delicate florals and bright fruit.' },
  { key:'crystal-geyser', id:'crystal_geyser',cat:'Bottled', group:'Pure / Bottled',      label:'Crystal Geyser (Mt. Shasta)',   name:'Crystal Geyser Spring',         waterType:'bottled',   gh:52,  ghMg:18,  ghCa:34,  kh:45,  khSalt:'nahco3', tds:95,  citrate:false, badge:'Balanced Spring',    note:'Clean California spring profile (check bottle label for Mt. Shasta / Olancha source).' },
  { key:'evian',          id:'evian',         cat:'Bottled', group:'Pure / Bottled',      label:'Evian Natural Spring (Hard)',   name:'Evian (French Alps - Hard)',    waterType:'bottled',   gh:307, ghMg:107, ghCa:200, kh:295, khSalt:'nahco3', tds:345, citrate:false, badge:'Extreme KH Warning', note:'80 mg/L Ca2+ + 26 mg/L Mg2+ = 307 ppm GH; 360 mg/L HCO3- = 295 ppm KH! Destroys fruit acids (-38% TA) & causes heavy boiler scale.' }
], 'key');
WATER_PRESETS_UNIFIED.forEach(w => {
  if (w.id && !(w.id in WATER_PRESETS_UNIFIED)) {
    Object.defineProperty(WATER_PRESETS_UNIFIED, w.id, { value:w, enumerable:false, configurable:true });
  }
});
const WATER_PRESETS = WATER_PRESETS_UNIFIED;
const WATER_PRESETS_16 = WATER_PRESETS_UNIFIED;
function waterPresetFor(keyOrId){
  const k = String(keyOrId || '').trim();
  return WATER_PRESETS_UNIFIED[k] || WATER_PRESETS_UNIFIED.find(w => w.key === k || w.id === k) || null;
}

function dropsToPpm(nDrops, sampleMl){
  const drops = Math.max(0, +nDrops || 0);
  const vol = clampNum(sampleMl, 1, 100, 5.0);
  return rnd(drops * (5.0 / vol) * WATER_IUPAC.DH_TO_PPM, 1);
}

function calcWaterIonsToCaCO3(ions){
  ions = ions || {};
  const ca = clampNum(ions.ca, 0, 1000, 0), mg = clampNum(ions.mg, 0, 1000, 0);
  const hco3 = clampNum(ions.hco3, 0, 2000, 0), co3 = clampNum(ions.co3, 0, 1000, 0);
  const ghCa = WATER_IUPAC.CA_TO_GH * ca, ghMg = WATER_IUPAC.MG_TO_GH * mg;
  const kh = WATER_IUPAC.HCO3_TO_KH * hco3 + WATER_IUPAC.CO3_TO_KH * co3;
  return { ghCa:rnd(ghCa, 1), ghMg:rnd(ghMg, 1), gh:rnd(ghCa + ghMg, 1), kh:rnd(kh, 1) };
}

function calcWaterLab(p){
  p = p || {};
  const ghMg = clampNum(p.ghMg, 0, 600, 45);
  const ghCa = clampNum(p.ghCa, 0, 600, 20);
  const kh = clampNum(p.kh, 0, 500, 35);
  const gh = ghMg + ghCa;
  const volL = clampNum(p.volL, 0.1, 100, 1.0);
  const mgSaltKey = p.mgSalt === 'mgcl2' ? 'mgcl2' : 'epsom';
  const caSaltKey = p.cacl2Form === 'anhydrous' ? 'cacl2_anhydrous' : 'cacl2_dihydrate';
  const citrate = !!(p.citrate || p.khSalt === 'k3cit' || p.khSalt === 'na3cit');
  const khSaltKey = ['nahco3', 'khco3', 'k3cit', 'na3cit'].includes(p.khSalt)
    ? p.khSalt
    : (citrate ? 'k3cit' : 'nahco3');

  const sMg = WATER_IUPAC.SALTS[mgSaltKey], sCa = WATER_IUPAC.SALTS[caSaltKey], sKh = WATER_IUPAC.SALTS[khSaltKey];
  const gMg = (ghMg * sMg.mgPerPpm * volL) / 1000;
  const gCa = (ghCa * sCa.mgPerPpm * volL) / 1000;
  const gKh = (kh * sKh.mgPerPpm * volL) / 1000;

  /* Separate bicarbonate KH_HCO3 vs citrate KH_cit (pK_a1..3 = 3.13, 4.76, 6.40 -> n_bar_H(5.0) = 1.34 = 0.45 * z_3) */
  const tapKhCarb = clampNum(p.khCarbBase, 0, 500, 0);
  const khHco3 = sKh.citrate ? tapKhCarb : (kh + tapKhCarb);
  const khCit = sKh.citrate ? kh : clampNum(p.khCit, 0, 500, 0);
  const khEffPh5 = 0.96 * khHco3 + 0.45 * khCit;
  const ratioRef = clampNum(p.brewRatio, 1.5, 22, 16);
  const acidBufferedPh5MmolKg = ((0.96 * khHco3 + 0.45 * khCit) / WATER_IUPAC.CACO3_EQ) * ratioRef;

  /* Zero-bicarbonate Citrate Scale Rule: Citrate suppresses CaCO3 scale ONLY when khCarb === 0 (pure RO/distilled base)! */
  const khCarb = khHco3;
  const zeroBicarbCitrate = sKh.citrate && khCarb <= 0.5;
  const scaleProduct = zeroBicarbCitrate ? 0 : (ghCa * khCarb);
  const scaleRisk = zeroBicarbCitrate ? 'none_citrate' : scaleProduct > 4500 ? 'severe' : scaleProduct > 2500 ? 'warn' : 'safe';

  const sumPpm = ghMg + ghCa + kh;
  const topUpMgMl = ghMg * volL, topUpCaMl = ghCa * volL, topUpKhMl = kh * volL;
  const topUpDiWaterMl = Math.max(0, 1000 * volL - (topUpMgMl + topUpCaMl + topUpKhMl));
  const addOnTopAllowed = sumPpm > 0 && sumPpm <= 500;
  const aotMl = ppm => addOnTopAllowed ? (ppm * 1000 * volL) / (1000 - sumPpm) : null;
  const dropMl = ppm => ppm * 0.10 * volL;
  const drops20 = ppm => rnd(dropMl(ppm) * 20, 1);

  const presetObj = p.presetKey ? waterPresetFor(p.presetKey) : null;
  const chlorideMgL = presetObj && presetObj.clOverrideMgL != null ? presetObj.clOverrideMgL : ((p.extraCl != null ? clampNum(p.extraCl, 0, 500, 0) : 0) + ghMg * sMg.clPerPpm + ghCa * sCa.clPerPpm);
  const sodiumMgL = presetObj && presetObj.naOverrideMgL != null ? presetObj.naOverrideMgL : (kh * sKh.naPerPpm);
  const potassiumMgL = kh * (sKh.kPerPpm || 0);
  const estIonTds = ghMg * sMg.ionTdsPerPpm + ghCa * sCa.ionTdsPerPpm + kh * sKh.ionTdsPerPpm;
  const chlorideRisk = chlorideMgL > 35;
  const unbufferedRisk = khEffPh5 < 10;

  const inSca = gh >= 50 && gh <= 175 && khEffPh5 >= 38 && khEffPh5 <= 75;
  const inHendon = gh >= 45 && gh <= 105 && khEffPh5 >= 15 && khEffPh5 <= 40;
  const isRpavlis = gh <= 5 && kh >= 35 && kh <= 65;
  let zoneTitle = 'Custom Mineral Profile', zoneSummary = '';
  if (gh < 12 && khEffPh5 < 10){
    zoneTitle = 'Too Pure / Unbuffered (RO/Distilled Zone)';
    zoneSummary = 'Zero Mg2+/Ca2+ extraction assistance and zero buffer: brews taste sharply sour (pH ~4.88) and espresso tank probes may fail conductivity checks.';
  } else if (isRpavlis){
    zoneTitle = 'RPavlis Scale-Free Espresso Zone';
    zoneSummary = 'Zero calcium hardness prevents calcite scale completely while ~50 ppm KHCO3 balances espresso acidity.';
  } else if (inHendon && khEffPh5 < 40){
    zoneTitle = 'Hendon / Nordic Sparkling Clarity Zone';
    zoneSummary = 'Magnesium-rich extraction with gentle buffer (' + rnd(khEffPh5, 1) + ' ppm pH-5 eq.) lets citrus, berry, and floral acids shine.';
  } else if (inSca){
    zoneTitle = 'SCA 102-2024 Balanced Sweet-Spot Zone';
    zoneSummary = 'Classic specialty equilibrium (' + rnd(gh, 0) + ' GH / ' + rnd(khEffPh5, 0) + ' eff. KH): balanced sweetness, rounded acidity, and clean body.';
  } else if (khEffPh5 > 90){
    zoneTitle = 'High-Alkalinity Acid-Flattening Zone';
    zoneSummary = 'High alkalinity (' + rnd(khEffPh5, 0) + ' ppm eq.) neutralizes weak coffee fruit acids into flat conjugate salts. Dilute with RO/Distilled water.';
  } else if (gh > 175){
    zoneTitle = 'Excess Hardness / Heavy Extraction Zone';
    zoneSummary = 'High divalent hardness (' + rnd(gh, 0) + ' ppm GH) risks heavy muddled extraction and boiler scale.';
  } else {
    zoneSummary = 'Moderate mineral balance (' + rnd(gh, 0) + ' ppm GH · ' + rnd(khEffPh5, 0) + ' ppm eff. KH).';
  }

  return {
    gh:rnd(gh, 1), ghMg:rnd(ghMg, 1), ghCa:rnd(ghCa, 1), kh:rnd(kh, 1),
    khHco3:rnd(khHco3, 1), khCit:rnd(khCit, 1), khCarb:rnd(khCarb, 1),
    khEffPh5:rnd(khEffPh5, 1), acidBufferedPh5MmolKg:rnd(acidBufferedPh5MmolKg, 2),
    dGH:rnd(gh / WATER_IUPAC.DH_TO_PPM, 2), dKH:rnd(kh / WATER_IUPAC.DH_TO_PPM, 2),
    fGH:rnd(gh / WATER_IUPAC.FH_TO_PPM, 1),
    volL, citrate:sKh.citrate, zeroBicarbCitrate, sumPpm,
    salts:{
      mg:{ info:sMg, ppm:ghMg, grams:rnd(gMg, 4), topUpMl:rnd(topUpMgMl, 1), addOnTopMl:aotMl(ghMg), drop10xMl:rnd(dropMl(ghMg), 2), drops:drops20(ghMg) },
      ca:{ info:sCa, ppm:ghCa, grams:rnd(gCa, 4), topUpMl:rnd(topUpCaMl, 1), addOnTopMl:aotMl(ghCa), drop10xMl:rnd(dropMl(ghCa), 2), drops:drops20(ghCa) },
      kh:{ info:sKh, ppm:kh,   grams:rnd(gKh, 4), topUpMl:rnd(topUpKhMl, 1), addOnTopMl:aotMl(kh),   drop10xMl:rnd(dropMl(kh), 2),   drops:drops20(kh) }
    },
    topUpDiWaterMl:rnd(topUpDiWaterMl, 1), addOnTopAllowed, addOnTopExceeded:sumPpm > 500,
    estIonTds:rnd(estIonTds, 1), chlorideMgL:rnd(chlorideMgL, 1), sodiumMgL:rnd(sodiumMgL, 1), potassiumMgL:rnd(potassiumMgL, 1),
    caIonMgL:rnd(ghCa / WATER_IUPAC.CA_TO_GH, 1), mgIonMgL:rnd(ghMg / WATER_IUPAC.MG_TO_GH, 1),
    hco3IonMgL:rnd(khHco3 / WATER_IUPAC.HCO3_TO_KH, 1),
    scaleProduct:Math.round(scaleProduct), scaleRisk, chlorideRisk, unbufferedRisk,
    inSca, inHendon, isRpavlis, zoneTitle, zoneSummary
  };
}

function calcTapRoBlend(p){
  p = p || {};
  const ghTap = clampNum(p.ghTap, 0, 1500, 185);
  const khTap = clampNum(p.khTap, 0, 1500, 135);
  const ghTarget = clampNum(p.ghTarget, 0, 400, 70);
  const khTarget = clampNum(p.khTarget, 0, 300, 35);
  const volL = clampNum(p.volL, 0.1, 100, 1.0);
  const fTap = (khTap > 0 && khTarget > 0 && isFinite(khTap)) ? clampNum(khTarget / khTap, 0, 1, 0) : 0;
  const tapMl = Math.round(fTap * volL * 1000), roMl = Math.round((1 - fTap) * volL * 1000);
  const ghBlend = rnd(fTap * ghTap, 1), khBlend = rnd(fTap * khTap, 1);
  const deficitGh = Math.max(0, ghTarget - ghBlend), deficitKh = Math.max(0, khTarget - khBlend);
  const boostEpsomG = rnd((deficitGh * WATER_IUPAC.SALTS.epsom.mgPerPpm * volL) / 1000, 4);
  const boostBicarbG = rnd((deficitKh * WATER_IUPAC.SALTS.nahco3.mgPerPpm * volL) / 1000, 4);
  return {
    ok:true, ghTap, khTap, ghTarget, khTarget, volL, fTap:rnd(fTap, 4), tapPct:Math.round(fTap * 100), roPct:100 - Math.round(fTap * 100),
    tapMl, roMl, ghBlend, khBlend, khCarbBlend:khBlend, boostEpsomG, boostBicarbG, zeroTapGuard:!(khTap > 0)
  };
}

/* ---------- 6B. 6 Everyday Generic Water Profiles + 18 Named Supermarket Bottled & City Tap Water Profiles (24 Total) ---------- */
const WATER_PROFILES_V6 = attachByKey([
  { key:'tap_regular', id:'tap_regular', category:'everyday', everydayGroup:'tap', waterType:'tap', kind:'everyday_tap', label:'Regular Tap Water (Typical)', short:'Regular Tap', gh:95, ghMg:33, ghCa:62, kh:65, cl:18, tds:145, boilerSafe:false, alkalineTrapWarning:false, verdict:'ready_carbon', note:'Balanced everyday municipal tap prior (95 ppm GH / 65 ppm KH): rounds medium & dark roasts smoothly; ~65 ppm KH gently buffers bright light-roast fruit acids (use carbon filtration if chlorine taste is present).' },
  { key:'tap_soft', id:'tap_soft', category:'everyday', everydayGroup:'tap', waterType:'tap', kind:'everyday_tap', label:'Soft Tap Water (Coastal / Mountain)', short:'Soft Tap', gh:32, ghMg:11, ghCa:21, kh:20, cl:10, tds:55, boilerSafe:true, alkalineTrapWarning:false, verdict:'soft_floral', note:'Naturally soft coastal or mountain snowmelt tap (32 ppm GH / 20 ppm KH): scale-safe and lets delicate floral & berry acidity sparkle (pass through carbon if chlorine is noticeable).' },
  { key:'tap_hard', id:'tap_hard', category:'everyday', everydayGroup:'tap', waterType:'tap', kind:'everyday_tap', label:'Hard Tap Water (Scale / Mineral-Heavy)', short:'Hard Tap', gh:210, ghMg:65, ghCa:145, kh:145, cl:28, tds:310, boilerSafe:false, alkalineTrapWarning:false, verdict:'too_hard', note:'High-KH mineral-heavy tap (210 ppm GH / 145 ppm KH): high carbonate alkalinity buffers & flattens bright light-roast fruit acids and builds kettle/boiler scale — switch to Filtered Tap, Bottled Spring, or a 1:2 RO blend to rescue light roasts.' },
  { key:'filtered_pitcher', id:'filtered_pitcher', category:'everyday', everydayGroup:'filtered', waterType:'filtered', kind:'everyday_filtered', label:'Filtered Tap (Brita / Fridge / Carbon)', short:'Filtered Tap', gh:70, ghMg:26, ghCa:44, kh:45, cl:2, tds:105, boilerSafe:true, alkalineTrapWarning:false, verdict:'ready', note:'Everyday Brita pitcher, fridge dispenser, or activated-carbon block (70 ppm GH / 45 ppm KH): removes chlorine/chloramine taste with mild carbonate softening for clean, sweet extraction.' },
  { key:'bottled_spring', id:'bottled_spring', category:'everyday', everydayGroup:'bottled', waterType:'bottled', kind:'everyday_bottled', label:'Bottled Spring Water (Generic)', short:'Bottled Spring', gh:68, ghMg:26, ghCa:42, kh:48, cl:6, tds:115, boilerSafe:true, alkalineTrapWarning:false, verdict:'ready', note:'Clean everyday generic spring water (68 ppm GH / 48 ppm KH): right in the SCA sweet-spot for balanced sweetness, vibrant fruit clarity, and scale-safe brewing.' },
  { key:'bottled_purified', id:'bottled_purified', category:'everyday', everydayGroup:'bottled', waterType:'bottled', kind:'everyday_bottled', label:'Bottled Purified / Drinking Water', short:'Bottled Purified', gh:22, ghMg:10, ghCa:12, kh:15, cl:5, tds:35, boilerSafe:true, alkalineTrapWarning:false, verdict:'soft_floral', note:'RO-purified drinking water with light mineral taste balance (22 ppm GH / 15 ppm KH): zero boiler scale and crisp, bright clarity on light-to-medium roasts.' },
  { key:'crystal-geyser-shasta', id:'crystal_geyser_shasta', category:'named_brand', waterType:'bottled', kind:'bottled', label:'Crystal Geyser (Mt. Shasta / Olancha, CA)', short:'Crystal Geyser CA', gh:52, ghMg:18, ghCa:34, kh:45, cl:4, tds:95, boilerSafe:true, alkalineTrapWarning:false, verdict:'ready', note:'Ready to brew right out of the bottle! Check bottle label for Mt. Shasta or Olancha, CA springs (avoid hard Benton TN / Norman AR sources for light roasts).' },
  { key:'crystal-geyser-benton', id:'crystal_geyser_benton', category:'named_brand', waterType:'bottled', kind:'bottled', label:'Crystal Geyser (Norman, AR / Benton, TN)', short:'Crystal Geyser TN/AR', gh:128, ghMg:28, ghCa:100, kh:115, cl:5, tds:175, boilerSafe:false, alkalineTrapWarning:false, verdict:'blend', note:'Hard limestone bottling source (whereas Salem SC / NH is ultra-soft ~18 GH / 16 KH). Mix 1 part Benton/Norman + 2 parts Distilled/RO for sweet pour-overs.' },
  { key:'volvic', id:'volvic', category:'named_brand', waterType:'bottled', kind:'bottled', label:'Volvic Natural Spring', short:'Volvic', gh:62, ghMg:32, ghCa:30, kh:58, cl:15, tds:130, boilerSafe:true, alkalineTrapWarning:false, verdict:'ready', note:'Classic volcanic spring benchmark (62 GH / 58 KH): superb for medium roasts & espresso; blend 3:1 with Distilled/RO for Nordic ultra-light.' },
  { key:'poland-spring', id:'poland_spring', category:'named_brand', waterType:'bottled', kind:'bottled', label:'Poland Spring (Maine)', short:'Poland Spring', gh:20, ghMg:8, ghCa:12, kh:16, cl:6, tds:40, boilerSafe:true, alkalineTrapWarning:false, verdict:'soft_floral', note:'Ultra-soft Maine spring (16 ppm KH): zero boiler scale and vivid floral/citrus clarity on washed light roasts.' },
  { key:'fiji', id:'fiji', category:'named_brand', waterType:'bottled', kind:'bottled', label:'Fiji Natural Artesian', short:'Fiji', gh:107, ghMg:62, ghCa:45, kh:125, cl:10, tds:222, silicaMgL:93, boilerSafe:false, alkalineTrapWarning:false, verdict:'blend', note:'Silky Mg2+ & 93 mg/L silica mouthfeel, but 125 ppm KH flattens fruit alone — mix 1 part Fiji + 2 parts Distilled/RO for elite 36 GH / 42 KH!' },
  { key:'evian', id:'evian', category:'named_brand', waterType:'bottled', kind:'bottled', label:'Evian Natural Spring (Hard)', short:'Evian', gh:307, ghMg:107, ghCa:200, kh:295, cl:7, tds:345, boilerSafe:false, alkalineTrapWarning:false, verdict:'too_hard', note:'Extreme Alpine carbonate (295 ppm KH) neutralizes ~38% of fruit acids and causes heavy boiler scale — dilute 1 part Evian + 5 parts Distilled/RO.' },
  { key:'kirkland-purified', id:'kirkland_purified', category:'named_brand', waterType:'bottled', kind:'bottled', label:'Kirkland Signature Purified', short:'Kirkland Purified', gh:14, ghMg:8, ghCa:6, kh:10, cl:8, tds:28, boilerSafe:true, alkalineTrapWarning:false, verdict:'low_buffer', note:'RO + light trace minerals (14 GH / 10 KH): slightly sharp alone on dark roasts, ideal low-cost base for 2-bottle blends.' },
  { key:'kirkland-spring', id:'kirkland_spring', category:'named_brand', waterType:'bottled', kind:'bottled', label:'Kirkland Signature Natural Spring', short:'Kirkland Spring', gh:145, ghMg:40, ghCa:105, kh:120, cl:6, tds:190, boilerSafe:false, alkalineTrapWarning:false, verdict:'blend', note:'High bicarbonate mutes delicate berry notes — mix 1 part Kirkland Spring + 2 parts Kirkland Purified \u2192 balanced 58 GH / 47 KH!' },
  { key:'essentia', id:'essentia', category:'named_brand', waterType:'bottled', kind:'bottled', label:'Essentia Ionized Alkaline (pH 9.5)', short:'Essentia (Trap!)', gh:8, ghMg:4, ghCa:4, kh:48, cl:4, tds:65, boilerSafe:true, alkalineTrapWarning:true, verdict:'alkaline_trap', note:'ALKALINE TRAP WARNING: Near-zero Mg2+/Ca2+ flavor extractors (8 ppm GH) + high NaHCO3 buffer (48 ppm KH) yields flat, hollow, papery coffee!' },
  { key:'distilled-ro', id:'distilled_ro', category:'diy_base', waterType:'distilled', kind:'base', label:'Distilled / Reverse Osmosis / ZeroWater', short:'Distilled / RO', gh:0, ghMg:0, ghCa:0, kh:0, cl:0, tds:1, boilerSafe:true, alkalineTrapWarning:false, verdict:'needs_minerals', note:'Pure 0 ppm base: sharp/sour alone and trips espresso tank sensors — add 1/8 tsp Epsom + pinch Baking Soda per gallon OR blend with spring water!' },
  { key:'tap-nyc', id:'tap_nyc', category:'city_tap', waterType:'tap', kind:'tap', city:'New York City', label:'NYC Municipal Tap (Catskill/Delaware)', short:'NYC Tap', gh:28, ghMg:10, ghCa:18, kh:22, cl:16, tds:52, boilerSafe:true, alkalineTrapWarning:false, verdict:'ready_carbon', note:'Naturally soft Catskill/Delaware watershed (28 GH / 22 KH): pass through activated carbon to remove chlorine/chloramine.' },
  { key:'tap-sf', id:'tap_sf', category:'city_tap', waterType:'tap', kind:'tap', city:'San Francisco', label:'San Francisco Tap (Hetch Hetchy)', short:'SF Tap', gh:16, ghMg:5, ghCa:11, kh:15, cl:8, tds:36, boilerSafe:true, alkalineTrapWarning:false, verdict:'soft_floral', note:'Ultra-pure Sierra snowmelt (16 GH / 15 KH): carbon-filter chlorine; sparkling for light pour-overs.' },
  { key:'tap-seattle', id:'tap_seattle', category:'city_tap', waterType:'tap', kind:'tap', city:'Seattle', label:'Seattle / Portland Tap (Cedar / Bull Run)', short:'Seattle Tap', gh:22, ghMg:6, ghCa:16, kh:18, cl:5, tds:40, boilerSafe:true, alkalineTrapWarning:false, verdict:'ready_carbon', note:'Soft Pacific Northwest mountain watershed (22 GH / 18 KH): carbon-filter chlorine and brew directly!' },
  { key:'tap-chicago', id:'tap_chicago', category:'city_tap', waterType:'tap', kind:'tap', city:'Chicago', label:'Chicago / Great Lakes Tap (Lake Michigan)', short:'Chicago Tap', gh:138, ghMg:48, ghCa:90, kh:108, cl:18, tds:172, boilerSafe:false, alkalineTrapWarning:false, verdict:'blend', note:'Moderately hard Lake Michigan carbonate (108 ppm KH): mix 1 part carbon-filtered tap + 2 parts Distilled/RO for vibrant fruit.' },
  { key:'tap-london', id:'tap_london', category:'city_tap', waterType:'tap', kind:'tap', city:'London', label:'London / Thames Chalk Tap (UK)', short:'London Tap', gh:275, ghMg:25, ghCa:250, kh:210, cl:28, tds:330, boilerSafe:false, alkalineTrapWarning:false, verdict:'too_hard', note:'Heavy chalk aquifer (275 GH / 210 KH): flattens specialty acidity and scales boilers rapidly — use BWT/ZeroWater or 1:4 RO blend.' },
  { key:'tap-la', id:'tap_la', category:'city_tap', waterType:'tap', kind:'tap', city:'Los Angeles', label:'Los Angeles Municipal Tap (MWD)', short:'LA Tap', gh:195, ghMg:68, ghCa:127, kh:122, cl:52, tds:380, boilerSafe:false, alkalineTrapWarning:false, verdict:'too_hard', note:'High hardness, alkalinity (122 KH), and chloride (52 mg/L stainless pitting risk) — switch to RO + minerals or Crystal Geyser CA.' },
  { key:'tap-phoenix', id:'tap_phoenix', category:'city_tap', waterType:'tap', kind:'tap', city:'Phoenix', label:'Phoenix / Southwest Tap (Colorado River)', short:'Phoenix Tap', gh:245, ghMg:90, ghCa:155, kh:145, cl:85, tds:540, boilerSafe:false, alkalineTrapWarning:false, verdict:'too_hard', note:'Very high TDS (540 ppm), 145 KH, and 85 mg/L chloride (unsafe for espresso boilers) — use RO/ZeroWater + kitchen mineral fix.' },
  { key:'tap-hard-well', id:'tap_hard_well', category:'city_tap', waterType:'tap', kind:'tap', city:'Hard Well', label:'Hard Limestone Well Water', short:'Hard Well', gh:310, ghMg:95, ghCa:215, kh:250, cl:24, tds:390, boilerSafe:false, alkalineTrapWarning:false, verdict:'too_hard', note:'Limestone well water (250 ppm KH) turns bright coffees chalky and scales kettles — blend 1:5 with Distilled/RO or remineralize RO.' }
], 'key');
WATER_PROFILES_V6.forEach(w => {
  if (!w.name) w.name = w.label;
  if (w.id && !(w.id in WATER_PROFILES_V6)) {
    Object.defineProperty(WATER_PROFILES_V6, w.id, { value:w, enumerable:false, configurable:true });
  }
});
[
  ['tap-regular', 'tap_regular'], ['regular-tap', 'tap_regular'], ['regular_tap', 'tap_regular'],
  ['tap-soft', 'tap_soft'], ['tap-hard', 'tap_hard'],
  ['filtered-pitcher', 'filtered_pitcher'], ['filtered-tap', 'filtered_pitcher'], ['filtered_tap', 'filtered_pitcher'], ['filtered', 'filtered_pitcher'],
  ['bottled-spring', 'bottled_spring'], ['generic-spring', 'bottled_spring'],
  ['bottled-purified', 'bottled_purified'], ['purified-bottled', 'bottled_purified'], ['drinking-water', 'bottled_purified'],
  ['crystal-geyser', 'crystal-geyser-shasta'], ['crystal_geyser', 'crystal-geyser-shasta'],
  ['norman', 'crystal-geyser-benton'], ['benton', 'crystal-geyser-benton'],
  ['kirkland', 'kirkland-purified'], ['ro', 'distilled-ro'], ['distilled', 'distilled-ro'], ['zerowater', 'distilled-ro'],
  ['nyc', 'tap-nyc'], ['sf', 'tap-sf'], ['seattle', 'tap-seattle'], ['chicago', 'tap-chicago'],
  ['london', 'tap-london'], ['la', 'tap-la'], ['phoenix', 'tap-phoenix'], ['hard-well', 'tap-hard-well']
].forEach(pair => {
  const hit = WATER_PROFILES_V6[pair[1]];
  if (hit && !(pair[0] in WATER_PROFILES_V6)) {
    Object.defineProperty(WATER_PROFILES_V6, pair[0], { value:hit, enumerable:false, configurable:true });
  }
});

const EVERYDAY_WATER_PROFILES_V6 = attachByKey(WATER_PROFILES_V6.filter(w => w.category === 'everyday'), 'key');
Object.defineProperty(EVERYDAY_WATER_PROFILES_V6, 'byGroup', {
  value: {
    tap: EVERYDAY_WATER_PROFILES_V6.filter(w => w.everydayGroup === 'tap'),
    filtered: EVERYDAY_WATER_PROFILES_V6.filter(w => w.everydayGroup === 'filtered'),
    bottled: EVERYDAY_WATER_PROFILES_V6.filter(w => w.everydayGroup === 'bottled')
  },
  enumerable: false,
  configurable: true
});

function waterProfileV6For(keyOrObj){
  if (!keyOrObj) return null;
  if (typeof keyOrObj === 'object' && isFinite(+keyOrObj.kh) && isFinite(+keyOrObj.gh)) return keyOrObj;
  const k = String(keyOrObj).trim().toLowerCase();
  return WATER_PROFILES_V6[k] || WATER_PROFILES_V6.find(w => w.key === k || w.id === k || w.short.toLowerCase() === k) || waterPresetFor(k);
}

function _fareyKitchenRatio(alpha, khA, khB, khStar){
  let best = null, bestScore = 1e9;
  for (let p = 0; p <= 6; p++){
    for (let q = 0; q <= 6; q++){
      if (p === 0 && q === 0) continue;
      if (p + q > 6) continue;
      const f = p / (p + q);
      const khHat = f * khA + (1 - f) * khB;
      const khErr = Math.abs(khHat - khStar);
      const score = Math.abs(f - alpha) + 0.015 * (p + q) + 0.02 * khErr;
      if (khErr <= 6.5 && score < bestScore){ bestScore = score; best = { p, q, f }; }
    }
  }
  return best;
}

function solveTwoBottleBlend(targetKH, targetGH, opts){
  if (targetKH && typeof targetKH === 'object') {
    opts = targetKH;
    targetGH = opts.targetGH != null ? opts.targetGH : opts.ghTarget;
    targetKH = opts.targetKH != null ? opts.targetKH : opts.khTarget;
  }
  opts = opts || {};
  const khStar = clampNum(targetKH, 5, 220, 40);
  const ghStar = clampNum(targetGH, 0, 300, 70);
  const volMl = clampNum(opts.volMl != null ? opts.volMl : (opts.volL ? opts.volL * 1000 : 1000), 100, 20000, 1000);
  const evalPair = (wA, wB) => {
    if (!wA || !wB || wA.key === wB.key) return null;
    if (wA.alkalineTrapWarning || wB.alkalineTrapWarning) return null;
    const dK = wA.kh - wB.kh, dG = wA.gh - wB.gh;
    const den = 0.78 * (dK * dK / 144) + 0.22 * (dG * dG / 900);
    const num = 0.78 * ((khStar - wB.kh) * dK / 144) + 0.22 * ((ghStar - wB.gh) * dG / 900);
    const alphaRaw = den > 1e-9 ? clampNum(num / den, 0, 1, 0.5) : 0.5;
    const farey = _fareyKitchenRatio(alphaRaw, wA.kh, wB.kh, khStar);
    const alpha = (opts.exactFraction ? alphaRaw : (farey ? farey.f : alphaRaw));
    const kh = rnd(alpha * wA.kh + (1 - alpha) * wB.kh, 1);
    const gh = rnd(alpha * wA.gh + (1 - alpha) * wB.gh, 1);
    const ghCa = rnd(alpha * (wA.ghCa || wA.gh * 0.5) + (1 - alpha) * (wB.ghCa || wB.gh * 0.5), 1);
    const ghMg = rnd(Math.max(0, gh - ghCa), 1);
    const cl = rnd(alpha * (wA.cl || 0) + (1 - alpha) * (wB.cl || 0), 1);
    const tds = Math.round(alpha * (wA.tds || (wA.gh + wA.kh)) + (1 - alpha) * (wB.tds || (wB.gh + wB.kh)));
    const mlA = Math.round(alpha * volMl), mlB = volMl - mlA;
    const pctA = Math.round(alpha * 100), pctB = 100 - pctA;
    const loss = 0.78 * Math.pow((kh - khStar) / 12, 2) + 0.22 * Math.pow((gh - ghStar) / 30, 2) + (cl > 35 ? 1.5 : 0);
    const kitchenRatio = farey
      ? (farey.p === 0 ? ('100% ' + wB.short) : farey.q === 0 ? ('100% ' + wA.short) : (farey.p + ' part' + (farey.p === 1 ? '' : 's') + ' ' + wA.short + ' + ' + farey.q + ' part' + (farey.q === 1 ? '' : 's') + ' ' + wB.short))
      : (pctA + '% ' + wA.short + ' + ' + pctB + '% ' + wB.short);
    return {
      ok:true, bottleA:wA.key, bottleB:wB.key, labelA:wA.label, labelB:wB.label,
      alpha:rnd(alpha, 4), exactAlpha:rnd(alphaRaw, 4), pctA, pctB, mlA, mlB, volMl,
      fareyParts:farey ? [farey.p, farey.q] : null, kitchenRatio,
      gh, ghMg, ghCa, kh, cl, tds,
      khError:rnd(kh - khStar, 1), ghError:rnd(gh - ghStar, 1),
      boilerSafe:(ghCa * kh <= 2500) && cl <= 35,
      score:rnd(loss, 4)
    };
  };

  if (opts.bottleA && opts.bottleB) {
    const res = evalPair(waterProfileV6For(opts.bottleA), waterProfileV6For(opts.bottleB));
    return res || { ok:false, why:'Select two valid non-alkaline-trap waters.' };
  }
  const pool = WATER_PROFILES_V6.filter(w => (w.kind === 'bottled' || w.kind === 'base' || (opts.includeTap && w.kind === 'tap')) && !w.alkalineTrapWarning);
  const candidates = [];
  for (let i = 0; i < pool.length; i++){
    for (let j = i + 1; j < pool.length; j++){
      const c = evalPair(pool[i], pool[j]);
      if (c) candidates.push(c);
    }
  }
  candidates.sort((a, b) => a.score - b.score);
  const best = candidates[0] || null;
  return best ? Object.assign({}, best, { targetKH:khStar, targetGH:ghStar, topPairs:candidates.slice(0, 5) }) : { ok:false, why:'No blend candidates found.' };
}

function solveKitchenGallonWater(style, opts){
  if (style && typeof style === 'object') { opts = style; style = opts.style; }
  opts = opts || {};
  const stKey = String(style || 'balanced').trim().toLowerCase();
  const styleTargets = {
    nordic:   { label:'Nordic Ultra-Light Floral', gh:62, kh:22 },
    light:    { label:'Light Roast Fruit Clarity', gh:70, kh:32 },
    bright:   { label:'Light Roast Fruit Clarity', gh:70, kh:32 },
    balanced: { label:'Balanced All-Rounder (SCA Sweet Spot)', gh:75, kh:42 },
    medium:   { label:'Balanced Medium & Sweet', gh:78, kh:45 },
    sca:      { label:'SCA-102 Classic Midpoint', gh:68, kh:45 },
    espresso: { label:'Zero-Scale Espresso Body', gh:75, kh:48 },
    rpavlis:  { label:'RPavlis Pure Zero-Scale Espresso', gh:0, kh:50 },
    dark:     { label:'Smooth Dark Roast Cocoa', gh:88, kh:58 }
  };
  const tgt = styleTargets[stKey] || styleTargets.balanced;
  const ghStar = opts.targetGH != null ? clampNum(opts.targetGH, 0, 250, tgt.gh) : tgt.gh;
  const khStar = opts.targetKH != null ? clampNum(opts.targetKH, 5, 150, tgt.kh) : tgt.kh;
  const V_GAL_L = 3.785411784;
  const volL = opts.volL > 0 ? +opts.volL : V_GAL_L;
  const khSalt = opts.khSalt === 'khco3' || stKey === 'rpavlis' ? WATER_IUPAC.SALTS.khco3 : WATER_IUPAC.SALTS.nahco3;
  const epsomG = rnd((ghStar * WATER_IUPAC.SALTS.epsom.mgPerPpm * volL) / 1000, 3);
  const bicarbG = rnd((khStar * khSalt.mgPerPpm * volL) / 1000, 3);
  /* Culinary spoon approximations in 1 US Gallon (1/8 tsp Epsom ~ 0.65g -> +69.7 GH; 1/16 tsp Baking Soda ~ 0.30g -> +47.2 KH) */
  const eighthTspEpsom = rnd(epsomG / 0.65, 2);
  const sixteenthTspSoda = rnd(bicarbG / 0.30, 2);
  const epsomSpoonTxt = ghStar <= 3 ? '0g (no Epsom salt)' : (Math.abs(eighthTspEpsom - 1) <= 0.25 ? 'level 1/8 tsp Epsom Salt' : (eighthTspEpsom + ' x 1/8 tsp Epsom Salt'));
  const sodaSpoonTxt = sixteenthTspSoda <= 0.62 ? '1 generous pinch (half of 1/16 tsp) Baking Soda' : (Math.abs(sixteenthTspSoda - 1) <= 0.25 ? 'level 1/16 tsp Baking Soda' : (sixteenthTspSoda + ' x 1/16 tsp Baking Soda'));
  /* 500 mL No-Scale Kitchen Concentrate: 1 level tsp (4.8g) Baking Soda + 2 level tsp (10.4g) Epsom Salt in 500 mL warm pure water -> +4.22 GH & +2.86 KH per mL/L */
  const concMlPerLiter = rnd(khStar / 2.857, 1);
  const concMlPerGallon = Math.round(concMlPerLiter * V_GAL_L);
  return {
    ok:true, style:stKey, label:tgt.label,
    volL:rnd(volL, 3), gallons:rnd(volL / V_GAL_L, 2),
    targetGH:ghStar, targetKH:khStar, ghMg:ghStar, ghCa:0,
    epsomSaltG:epsomG, bufferSaltKey:khSalt.key, bufferSaltName:khSalt.name, bufferSaltG:bicarbG,
    bakingSodaG:rnd((khStar * WATER_IUPAC.SALTS.nahco3.mgPerPpm * volL) / 1000, 3),
    potassiumBicarbG:rnd((khStar * WATER_IUPAC.SALTS.khco3.mgPerPpm * volL) / 1000, 3),
    spoonRecipeGallon:'Into 1 US Gallon (3.79 L) Distilled/RO water, stir ' + epsomSpoonTxt + ' (' + epsomG + ' g) + ' + sodaSpoonTxt + ' (' + bicarbG + ' g) and shake 10 seconds.',
    noScaleConcentrate:{
      stockBottle:'Dissolve 2 level tsp (10.4 g) Food-Grade Epsom Salt + 1 level tsp (4.8 g) Baking Soda in 500 mL warm Distilled/RO water.',
      dosePerLiterMl:concMlPerLiter,
      dosePerGallonMl:concMlPerGallon,
      doseKitchenTxt:'Add ' + Math.round(concMlPerLiter) + ' mL (~' + rnd(concMlPerLiter / 14.79, 1) + ' tbsp) per 1 L brew water, or ' + concMlPerGallon + ' mL per 1 US Gallon.'
    },
    boilerSafe:true, scaleRisk:'none',
    scientistNote:'Pure MgSO4 + ' + khSalt.formula + ' in 0-Ca2+ RO water gives Ca x KH = 0 (thermodynamically zero CaCO3 boiler scale forever).'
  };
}

function solveEverydayWaterRescue(cfg){
  cfg = cfg || {};
  const prof = waterProfileV6For(cfg.waterKey || cfg.profile || 'hard-tap') || WATER_PROFILES_V6[0];
  const style = cfg.style || (cfg.roast === 'ultra-light' ? 'nordic' : cfg.roast === 'light' ? 'light' : cfg.roast === 'dark' ? 'dark' : 'balanced');
  const gallon = solveKitchenGallonWater(style);
  const blend = prof.alkalineTrapWarning
    ? null
    : solveTwoBottleBlend({ targetKH:gallon.targetKH, targetGH:gallon.targetGH, bottleA:prof, bottleB:'distilled-ro', volMl:cfg.volMl || 1000 });
  return {
    ok:true, profile:prof, style,
    alkalineTrapWarning:!!prof.alkalineTrapWarning,
    verdict:prof.verdict,
    twoBottleBlend:blend,
    kitchenGallonFix:gallon
  };
}

/* ---------- 7. AGTRON_V6 5-Scale Translator (M-Basic II + Strictly Monotone C1 PCHIP Tonino(63.0) === 105.0) ---------- */
/* Build Fritsch-Carlson Monotone Cubic Hermite Spline over official my-tonino.com anchor knots */
const TONINO_KNOTS = [
  [20, 50.0], [25, 55.0], [35, 67.5], [45, 80.0], [55, 92.5],
  [63, 105.0], [75, 120.0], [85, 127.5], [90, 130.0], [105, 136.0]
];
const TONINO_PCHIP = (function buildToninoPchip(pts){
  const n = pts.length;
  const x = pts.map(p => p[0]), y = pts.map(p => p[1]);
  const h = new Array(n - 1), d = new Array(n - 1);
  for (let i = 0; i < n - 1; i++){
    h[i] = x[i + 1] - x[i];
    d[i] = (y[i + 1] - y[i]) / h[i];
  }
  const m = new Array(n);
  m[0] = d[0];
  m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++){
    if (d[i - 1] * d[i] <= 0) m[i] = 0;
    else {
      const w1 = 2 * h[i] + h[i - 1], w2 = h[i] + 2 * h[i - 1];
      m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);
    }
  }
  for (let i = 0; i < n - 1; i++){
    if (d[i] === 0){ m[i] = 0; m[i + 1] = 0; }
    else {
      const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
      if (s > 9){
        const tau = 3 / Math.sqrt(s);
        m[i] = tau * a * d[i];
        m[i + 1] = tau * b * d[i];
      }
    }
  }
  return { n, x, y, h, m };
})(TONINO_KNOTS);

function toninoFromGourmetExact(gVal){
  const g = +gVal;
  if (!isFinite(g)) return null;
  const P = TONINO_PCHIP;
  if (g <= P.x[0]) return P.y[0] + P.m[0] * (g - P.x[0]);
  if (g >= P.x[P.n - 1]) return P.y[P.n - 1] + P.m[P.n - 1] * (g - P.x[P.n - 1]);
  for (let i = 0; i < P.n - 1; i++){
    if (g === P.x[i]) return P.y[i];
    if (g === P.x[i + 1]) return P.y[i + 1];
    if (g > P.x[i] && g < P.x[i + 1]){
      const t = (g - P.x[i]) / P.h[i], t2 = t * t, t3 = t2 * t;
      const h00 = 2 * t3 - 3 * t2 + 1, h10 = t3 - 2 * t2 + t;
      const h01 = -2 * t3 + 3 * t2, h11 = t3 - t2;
      return h00 * P.y[i] + h10 * P.h[i] * P.m[i] + h01 * P.y[i + 1] + h11 * P.h[i] * P.m[i + 1];
    }
  }
  return P.y[0];
}

function gourmetFromToninoExact(tVal){
  const tv = +tVal;
  if (!isFinite(tv)) return null;
  const P = TONINO_PCHIP;
  if (tv <= P.y[0]) return P.x[0] + (tv - P.y[0]) / P.m[0];
  if (tv >= P.y[P.n - 1]) return P.x[P.n - 1] + (tv - P.y[P.n - 1]) / P.m[P.n - 1];
  for (let i = 0; i < P.n; i++){
    if (Math.abs(tv - P.y[i]) < 1e-12) return P.x[i];
  }
  let lo = P.x[0], hi = P.x[P.n - 1];
  for (let it = 0; it < 36; it++){
    const mid = 0.5 * (lo + hi);
    if (toninoFromGourmetExact(mid) < tv) lo = mid;
    else hi = mid;
  }
  return 0.5 * (lo + hi);
}

function agtronExpectedDelta(beanG){
  const b = +beanG;
  if (!isFinite(b) || b <= 0) return 6.5;
  return rnd(clampNum(0.18 * b - 3.2, 1.0, 12.5, 6.5), 1);
}

const AGTRON_SCALES = [
  { key:'gourmet',    label:'Agtron Gourmet (SCA)',    short:'SCA Gourmet', tier:'verified_science', badge:'[Verified Science]', min:20, max:110, step:0.5, sigma:0.0, unit:'Gourmet', note:'Canonical SCA-102 specialty reference scale (63.0 ground cupping standard).' },
  { key:'commercial', label:'Agtron Commercial (M-Basic II)', short:'Commercial', tier:'verified_science', badge:'[Verified Science]', min:16, max:83, step:0.5, sigma:1.0, unit:'Comm.', note:'Official Agtron M-Basic II conversion: Commercial = 0.7429 * (Gourmet + 1.528).' },
  { key:'omni',       label:'DiFluid Omni NIR',        short:'DiFluid Omni', tier:'active_research', badge:'[Active Research]',  min:20, max:110, step:0.1, sigma:1.8, unit:'Omni Ag', note:'Near-infrared reflectance natively calibrated 1:1 to SCA Agtron Gourmet (+/-1.8 pts).' },
  { key:'tonino',     label:'Tonino Roast Color',      short:'Tonino',      tier:'active_research', badge:'[Active Research]',  min:45, max:140, step:0.5, sigma:3.5, unit:'Tonino',  note:'Official my-tonino.com C1 monotone PCHIP calibration pinned to Tonino(63.0) === 105.0.' },
  { key:'cm100',      label:'Lighttells CM-100',       short:'CM-100',      tier:'active_research', badge:'[Active Research]',  min:20, max:110, step:0.5, sigma:1.8, unit:'CM-100',  note:'Lighttells NIR analyzer natively calibrated 1:1 to SCA Agtron Gourmet (+/-1.8 pts).' }
];

function agtronToGourmet(val, scaleKey){
  const v = typeof val === 'number' ? val : parseFloat(val);
  if (!isFinite(v) || v <= 0) return null;
  const sk = String(scaleKey || 'gourmet').toLowerCase();
  let g = v;
  if (sk === 'commercial') g = (v / 0.7429) - 1.528;
  else if (sk === 'tonino') g = gourmetFromToninoExact(v);
  else if (sk === 'cm100' || sk === 'omni' || sk === 'gourmet') g = v;
  return rnd(clampNum(g, 15, 120, 60), 2);
}

function agtronFromGourmet(gVal, scaleKey){
  const g = typeof gVal === 'number' ? gVal : parseFloat(gVal);
  if (!isFinite(g) || g <= 0) return null;
  const sk = String(scaleKey || 'gourmet').toLowerCase();
  if (sk === 'commercial') return rnd(0.7429 * (g + 1.528), 2);
  if (sk === 'tonino') {
    const t = toninoFromGourmetExact(g);
    return Math.abs(t - Math.round(t)) < 1e-9 ? Math.round(t) : rnd(t, 2);
  }
  return rnd(g, 2);
}

function agtronConvertAll(gVal, scaleKey){
  const g = agtronToGourmet(gVal, scaleKey || 'gourmet');
  if (g == null) return null;
  return {
    gourmet: agtronFromGourmet(g, 'gourmet'),
    commercial: agtronFromGourmet(g, 'commercial'),
    omni: agtronFromGourmet(g, 'omni'),
    tonino: agtronFromGourmet(g, 'tonino'),
    cm100: agtronFromGourmet(g, 'cm100'),
    expectedDelta: agtronExpectedDelta(g)
  };
}

function agtronToRoastKey(gVal, sampleForm){
  const g = typeof gVal === 'number' ? gVal : parseFloat(gVal);
  if (!isFinite(g) || g <= 0) return '';
  const eqGround = sampleForm === 'bean' ? (g + agtronExpectedDelta(g)) : g;
  if (eqGround >= 86) return 'ultra-light';
  if (eqGround >= 74) return 'light';
  if (eqGround >= 64) return 'medium-light';
  if (eqGround >= 53) return 'medium';
  if (eqGround >= 42) return 'medium-dark';
  return 'dark';
}

function agtronDiscHex(gVal){
  const g = clampNum(gVal, 20, 110, 60);
  const stops = [
    [20,  [28, 15, 11]],
    [35,  [54, 30, 19]],
    [50,  [91, 53, 33]],
    [63,  [126, 77, 46]],
    [75,  [156, 101, 60]],
    [90,  [187, 129, 77]],
    [110, [214, 160, 102]]
  ];
  for (let i = 0; i < stops.length - 1; i++){
    const a = stops[i], b = stops[i + 1];
    if (g >= a[0] && g <= b[0]){
      const t = (g - a[0]) / (b[0] - a[0]);
      const rgb = [0, 1, 2].map(k => Math.round(a[1][k] + t * (b[1][k] - a[1][k])));
      return '#' + rgb.map(x => x.toString(16).padStart(2, '0')).join('');
    }
  }
  return '#7E4D2E';
}

function agtronRoastDeltaInfo(beanG, groundG){
  const b = typeof beanG === 'number' ? beanG : parseFloat(beanG);
  const gr = typeof groundG === 'number' ? groundG : parseFloat(groundG);
  if (!isFinite(b) || !isFinite(gr) || b <= 0 || gr <= 0) return null;
  const delta = rnd(gr - b, 1);
  if (delta <= 6){
    return {
      delta, band:'uniform', tone:'good',
      title:'Uniform Core Development (Delta <= 6)',
      badge:'Even Convective Core',
      tempCompC:0, lateDropBonusC:0,
      advice:'Surface and inner core developed evenly (typical of convective / fluid-bed roasters). Safe to push higher brew temperatures without shell scorch.'
    };
  }
  if (delta < 12){
    return {
      delta, band:'classic', tone:'info',
      title:'Classic Drum Balance (Delta 7-11)',
      badge:'Balanced Drum Gradient',
      tempCompC:0, lateDropBonusC:1.0,
      advice:'Classic conductive-convective drum balance: caramelized outer bean shell framing a sweet aromatic inner core.'
    };
  }
  const comp = delta >= 16 ? -2.0 : -1.5;
  return {
    delta, band:'gradient', tone:'warn',
    title:'High Surface-to-Core Gradient (Delta >= 12)',
    badge:'Thermal Relief ' + comp.toFixed(1) + ' C',
    tempCompC:comp, lateDropBonusC:3.5,
    advice:'Fast high-heat roast left the outer shell darker than the dense inner core. Keep early pours hot for core sweetness, then drop late-pulse temperature by 3-4 C to suppress outer-shell phenylindanes.'
  };
}

const AGTRON_V6 = {
  SCALES: AGTRON_SCALES,
  TONINO_KNOTS,
  toGourmet: agtronToGourmet,
  fromGourmet: agtronFromGourmet,
  toCommercial: g => rnd(0.7429 * ((+g || 0) + 1.528), 2),
  fromCommercial: c => rnd((+c / 0.7429) - 1.528, 2),
  toTonino: toninoFromGourmetExact,
  fromTonino: gourmetFromToninoExact,
  toOmni: g => rnd(+g, 2),
  toCm100: g => rnd(+g, 2),
  convertAll: agtronConvertAll,
  expectedDelta: agtronExpectedDelta,
  toRoastKey: agtronToRoastKey,
  discHex: agtronDiscHex,
  roastDeltaInfo: agtronRoastDeltaInfo
};

/* ---------- 8. 7-Species + Low-Caf Varietal Caffeine, Infinite Periodic Bateman PK & Borbely 24h Process C/S ---------- */
const CAF_SPECIES_MG_PER_G = {
  arabica:     { key:'arabica',     lo:10.0, mid:12.0, hi:14.5, cite:'de Paula & Farah (2019), Beverages 5:37' },
  robusta:     { key:'robusta',     lo:18.0, mid:22.0, hi:26.5, cite:'Campa et al. (2005), Food Chem. 93:135' },
  blend_ar:    { key:'blend_ar',    lo:11.6, mid:14.0, hi:17.0, cite:'80/20 Arabica-Robusta mass-weighted blend' },
  liberica:    { key:'liberica',    lo:10.5, mid:12.5, hi:15.0, cite:'Campa et al. (2005); Davis et al. (2025)' },
  excelsa:     { key:'excelsa',     lo:8.0,  mid:10.0, hi:12.5, cite:'Campa et al. (2005); Davis et al. (2025)' },
  stenophylla: { key:'stenophylla', lo:9.0,  mid:11.0, hi:13.5, cite:'Davis et al. (2021), Nature Plants 7:413' },
  eugenioides: { key:'eugenioides', lo:1.5,  mid:2.2,  hi:3.5,  cite:'Campa et al. (2005) — 5.5x lower than Arabica' },
  laurina:     { key:'laurina',     lo:4.0,  mid:5.2,  hi:6.5,  cite:'Ashihara et al. (2008) Bourbon Pointu mutation' },
  aramosa:     { key:'aramosa',     lo:5.5,  mid:7.0,  hi:8.5,  cite:'IAC Brazil C. arabica x C. racemosa hybrid' },
  decaf:       { key:'decaf',       lo:0.15, mid:0.40, hi:0.85, cite:'McCusker et al. (2006), J. Anal. Toxicol. 30:611; 21 CFR' }
};
const CAF_BEANS = CAF_SPECIES_MG_PER_G;

const CAF_SHARE_V6 = {
  v60:            { lo:0.87, mid:0.92, hi:0.96 },
  origami:        { lo:0.87, mid:0.92, hi:0.96 },
  kalita:         { lo:0.87, mid:0.92, hi:0.96 },
  orea:           { lo:0.88, mid:0.93, hi:0.97 },
  pulsar:         { lo:0.89, mid:0.94, hi:0.97 },
  chemex:         { lo:0.87, mid:0.92, hi:0.96 },
  drip:           { lo:0.87, mid:0.92, hi:0.96 },
  aiden:          { lo:0.88, mid:0.92, hi:0.96 },
  xbloom:         { lo:0.87, mid:0.92, hi:0.96 },
  nel:            { lo:0.82, mid:0.88, hi:0.93 },
  siphon:         { lo:0.82, mid:0.88, hi:0.93 },
  phin:           { lo:0.78, mid:0.84, hi:0.90 },
  switch:         { lo:0.80, mid:0.87, hi:0.92 },
  clever:         { lo:0.80, mid:0.87, hi:0.92 },
  press:          { lo:0.80, mid:0.87, hi:0.92 },
  aeropress:      { lo:0.80, mid:0.86, hi:0.92 },
  cold:           { lo:0.82, mid:0.88, hi:0.93 },
  cold_drip:      { lo:0.80, mid:0.86, hi:0.92 },
  espresso:       { lo:0.65, mid:0.72, hi:0.80, ristretto:0.64, turbo:0.82, allonge:0.88, soup:0.88 },
  lever_espresso: { lo:0.65, mid:0.72, hi:0.80, ristretto:0.64, turbo:0.82, allonge:0.88, soup:0.88 },
  philips5500:    { lo:0.66, mid:0.74, hi:0.82, longCoffee:0.85 },
  moka:           { lo:0.76, mid:0.83, hi:0.88 },
  turkish:        { lo:0.72, mid:0.80, hi:0.88 },
  instant:        { lo:1.00, mid:1.00, hi:1.00 }
};

function beanCaffeineMgPerG(beanOrOpts){
  const b = beanOrOpts || {};
  const isDecaf = b.decaf === 'yes' || b.decaf === true || b.caffeineMode === 'decaf' || (b.decaf_process && b.decaf_process !== '' && b.decaf_process !== 'half-caf');
  const isHalf = b.decaf_process === 'half-caf' || b.caffeine_type === 'half-caf' || b.caffeineMode === 'halfcaf' || b.halfCaf === true;
  if (isDecaf) return Object.assign({}, CAF_SPECIES_MG_PER_G.decaf);

  const varTxt = norm((b.varietal || '') + ' ' + (b.name || ''));
  let base = null;
  if (/\blaurina\b|\bbourbon\s+pointu\b/.test(varTxt)) base = CAF_SPECIES_MG_PER_G.laurina;
  else if (/\baramosa\b/.test(varTxt)) base = CAF_SPECIES_MG_PER_G.aramosa;
  else if (b.robustaPct != null && b.robustaPct !== '' && isFinite(+b.robustaPct)) {
    const fr = clampNum(+b.robustaPct / 100, 0, 1, 0);
    const ar = CAF_SPECIES_MG_PER_G.arabica, rb = CAF_SPECIES_MG_PER_G.robusta;
    base = { key:'blend_ar', lo:rnd((1 - fr) * ar.lo + fr * rb.lo, 2), mid:rnd((1 - fr) * ar.mid + fr * rb.mid, 2), hi:rnd((1 - fr) * ar.hi + fr * rb.hi, 2), cite:'Custom Arabica/Robusta blend' };
  } else {
    const spKey = String(b.species || 'arabica').toLowerCase();
    const mappedKey = spKey === 'blend' ? 'blend_ar' : spKey;
    base = CAF_SPECIES_MG_PER_G[mappedKey] || CAF_SPECIES_MG_PER_G.arabica;
  }
  if (isHalf) {
    const dc = CAF_SPECIES_MG_PER_G.decaf;
    return { key:'half-caf', lo:rnd(0.5 * (base.lo + dc.lo), 2), mid:rnd(0.5 * (base.mid + dc.mid), 2), hi:rnd(0.5 * (base.hi + dc.hi), 2), cite:base.cite };
  }
  return Object.assign({}, base);
}

function cafShareForMethod(methodKey, styleKey){
  const m = String(methodKey || 'v60').toLowerCase();
  const entry = CAF_SHARE_V6[m] || CAF_SHARE_V6.v60;
  const st = String(styleKey || '').toLowerCase();
  let mid = entry.mid;
  if ((m === 'espresso' || m === 'lever_espresso') && st) {
    if (st.includes('ristretto')) mid = entry.ristretto;
    else if (st.includes('turbo')) mid = entry.turbo;
    else if (st.includes('allonge') || st.includes('soup')) mid = entry.allonge;
  } else if (m === 'philips5500' && /coffee|crema|aulait|travelmug/.test(st)) {
    mid = entry.longCoffee;
  } else if (m === 'aeropress' && st.includes('conc')) {
    mid = 0.78;
  }
  const scale = mid / entry.mid;
  return { lo:rnd(Math.min(0.98, entry.lo * scale), 3), mid:rnd(mid, 3), hi:rnd(Math.min(0.99, entry.hi * scale), 3) };
}

const CAF_HALF = { fast:3.5, smoker:2.8, typical:5.0, slow:7.5, pill:9.5, oc:9.5, oc_pill:9.5, pregnant:13.0, pregnant_t3:13.0 };
const CAF_LINES = {
  strict:  { mg:25, label:'Sensitive (25 mg)' },
  careful: { mg:35, label:'Gardiner SWS Default (35 mg)' },
  tolerant:{ mg:55, label:'Tolerant (55 mg)' },
  relaxed: { mg:57, label:'Relaxed (57 mg)' }
};
const CAF_LIMITS = { day:400, pregnantDay:200, single:200 };
const CAF_MAX_DRINKS = 12;
const CAF_SCOOP_G = { 'ultra-light':5.8, light:5.6, 'medium-light':5.3, medium:5.0, 'medium-dark':4.6, dark:4.3 };
const CAF_INSTANT = { lo:24, mid:32.5, hi:42 };
const CAF_HOME_METHODS = METHOD_PHYSICS_V6.map(m => m.key).concat(['instant']);
const CAF_STRENGTH = { weaker:0.82, regular:1, stronger:1.18 };
const CAF_PODS = [
  { id:'keurig', name:'Keurig K-Cup', decaf:{ lo:2, mid:4, hi:6 }, sizes:[
    { id:'reg', name:'Regular', note:'8 oz', lo:75, mid:100, hi:125 },
    { id:'bold', name:'Extra bold', note:'8 oz', lo:125, mid:138, hi:150 }] },
  { id:'nespresso', name:'Nespresso Original', decaf:{ lo:2, mid:3, hi:5 }, sizes:[
    { id:'ristretto', name:'Ristretto', note:'25 mL', lo:45, mid:55, hi:95 },
    { id:'espresso', name:'Espresso', note:'40 mL', lo:52, mid:66, hi:120 },
    { id:'lungo', name:'Lungo', note:'110 mL', lo:58, mid:72, hi:115 }] },
  { id:'vertuo', name:'Nespresso Vertuo', decaf:{ lo:4, mid:8, hi:12 }, sizes:[
    { id:'espresso', name:'Espresso', note:'40 mL', lo:65, mid:105, hi:150 },
    { id:'double', name:'Double espresso', note:'80 mL', lo:130, mid:148, hi:165 },
    { id:'gran', name:'Gran Lungo', note:'150 mL', lo:120, mid:160, hi:200 },
    { id:'mug', name:'Mug', note:'230 mL', lo:135, mid:165, hi:200 },
    { id:'alto', name:'Alto', note:'414 mL', lo:160, mid:180, hi:205 }] }
];
const CAF_SHOP_SIZES = [8, 12, 16, 20];
const CAF_SHOT = { lo:55, mid:75, hi:140 };
const CAF_SHOT_CAFE = { lo:65, mid:140, hi:280 };
const CAF_SHOP = [
  { id:'latte', name:'Latte', shots:{ 8:1, 12:1, 16:2, 20:2 } },
  { id:'cappuccino', name:'Cappuccino', shots:{ 8:1, 12:1, 16:2, 20:2 } },
  { id:'americano', name:'Americano', shots:{ 8:1, 12:2, 16:3, 20:4 } },
  { id:'flat', name:'Flat white', shots:{ 8:1, 12:2, 16:3, 20:3 }, shot:{ lo:50, mid:65, hi:120 } },
  { id:'caramel', name:'Caramel macchiato', shots:{ 8:1, 12:1, 16:2, 20:2 } },
  { id:'espmac', name:'Espresso macchiato', shots:{ 8:1, 12:1, 16:1, 20:1 }, noSize:true },
  { id:'mocha', name:'Mocha', shots:{ 8:1, 12:1, 16:2, 20:2 }, extra:{ 8:15, 12:20, 16:25, 20:35 } },
  { id:'brewed', name:'Brewed coffee', brewed:{ 8:155, 12:260, 16:310, 20:410 }, decafMid:{ 8:15, 12:20, 16:25, 20:30 } },
  { id:'coldbrew', name:'Cold brew', brewed:{ 8:103, 12:155, 16:205, 20:258 } }
];

/* Exact Closed-Form Single-Day & Infinite 24h Periodic Steady-State Bateman PK (Fixes Bug C4) */
function cafBatemanSingle(doseMg, dtHours, ka, ke, F){
  if (!(dtHours > 0 && doseMg > 0)) return 0;
  const fBio = F == null ? 0.99 : F;
  if (Math.abs(ka - ke) <= 1e-4) return fBio * doseMg * ke * dtHours * Math.exp(-ke * dtHours);
  return fBio * doseMg * (ka / (ka - ke)) * (Math.exp(-ke * dtHours) - Math.exp(-ka * dtHours));
}

function cafBatemanPeriodicSS(doseMg, uHours, ka, ke, F){
  if (!(doseMg > 0)) return 0;
  const fBio = F == null ? 0.99 : F;
  const u = ((uHours % 24) + 24) % 24;
  const e24e = Math.exp(-24 * ke);
  const denE = 1 - e24e;
  if (denE <= 1e-12) return 0;
  if (Math.abs(ka - ke) <= 1e-4) {
    return fBio * doseMg * ke * Math.exp(-ke * u) * ((u / denE) + (24 * e24e) / (denE * denE));
  }
  const denA = 1 - Math.exp(-24 * ka);
  return fBio * doseMg * (ka / (ka - ke)) * ((Math.exp(-ke * u) / denE) - (Math.exp(-ka * u) / denA));
}

function batemanAt(items, tHours, opts){
  opts = opts || {};
  const hl = opts.halfLifeH > 0 ? +opts.halfLifeH : (opts.half > 0 ? +opts.half : (CAF_HALF[opts.speed] || CAF_HALF.typical));
  const ke = Math.LN2 / hl;
  const ka = opts.ka > 0 ? +opts.ka : (opts.fed ? 1.60 : 2.7726);
  const F = opts.F != null ? +opts.F : 0.99;
  const steady = !!opts.steadyState;
  const bodyKg = clampNum(opts.bodyMassKg, 35, 180, 70);
  const vdL = clampNum(opts.vdL, 15, 130, 0.65 * bodyKg);

  let activeMg = 0;
  const list = Array.isArray(items) ? items : [];
  for (let i = 0; i < list.length; i++){
    const it = list[i];
    if (!it || !(it.mg > 0) || !isFinite(+it.t)) continue;
    if (steady) {
      activeMg += cafBatemanPeriodicSS(+it.mg, tHours - (+it.t), ka, ke, F);
    } else {
      const dt = tHours - (+it.t);
      if (dt > 0) activeMg += cafBatemanSingle(+it.mg, dt, ka, ke, F);
    }
  }
  const plasmaMgL = activeMg / vdL;
  /* Elmenhorst et al. (2012) 18F-CPFPX PET cerebral A1AR IC50 = 13.0 mg/L (67 uM) */
  const a1Occupancy = plasmaMgL / (plasmaMgL + 13.0);
  const wakeBlockade = plasmaMgL / (plasmaMgL + 3.2);
  return {
    activeMg,
    plasmaMgL,
    vdL,
    ka,
    ke,
    halfLifeH: hl,
    a1OccupancyPct: rnd(100 * a1Occupancy, 1),
    wakeBlockade
  };
}

const CAF_KA_FASTED = 2.7726;
const CAF_KA_FED = 1.60;

function cafBodyAt(items, h, half, opt){
  const o = Object.assign({}, opt || {}, { halfLifeH: half > 0 ? half : CAF_HALF.typical, ka: opt && opt.ka > 0 ? +opt.ka : (opt && opt.fed ? CAF_KA_FED : CAF_KA_FASTED) });
  return batemanAt(items, h, o).activeMg;
}

/* Borbely (1982) / Daan, Beersma & Borbely (1984) 24h Two-Process Alertness (Process S + 24h Process C) */
function borbelyAlertnessAt(tHours, opts){
  opts = opts || {};
  const wakeH = isFinite(+opts.wakeHours) ? +opts.wakeHours : 7.0;
  const bedRaw = isFinite(+opts.bedHours) ? +opts.bedHours : 23.0;
  const bedH = bedRaw <= wakeH ? bedRaw + 24 : bedRaw;
  const deltaW = clampNum(bedH - wakeH, 4, 22, 16);
  const deltaS = 24 - deltaW;
  const dtw = (((tHours - wakeH) % 24) + 24) % 24;

  /* Periodic fixed-point S0 so S(24-) === S(0+) identically */
  const expW = Math.exp(-deltaW / 18.2);
  const expS = Math.exp(-deltaS / 4.2);
  const s0 = ((1 - expW) * expS) / Math.max(1e-9, 1 - expW * expS);
  const S = dtw <= deltaW
    ? (1 - (1 - s0) * Math.exp(-dtw / 18.2))
    : ((1 - (1 - s0) * expW) * Math.exp(-(dtw - deltaW) / 4.2));

  /* 24h Fundamental Circadian Pacemaker + minor 12h post-lunch harmonic (peaks ~11.5h post-wake, nadir ~20.5h post-wake, NEVER midnight!) */
  const C = 0.16 * Math.sin((2 * Math.PI * (dtw - 3.5)) / 24) - 0.055 * Math.cos((2 * Math.PI * (dtw - 7.5)) / 12);

  const pk = batemanAt(opts.items || [], tHours, opts);
  const rawAlert = 100 * (0.80 - 0.50 * S + C + 0.34 * pk.wakeBlockade);
  const alertness = clampNum(rawAlert, 10, 99, 50);
  return {
    alertness: rnd(alertness, 1),
    processS: rnd(S, 4),
    processC: rnd(C, 4),
    activeMg: rnd(pk.activeMg, 2),
    plasmaMgL: rnd(pk.plasmaMgL, 3),
    a1OccupancyPct: pk.a1OccupancyPct,
    jitterRisk: pk.activeMg > 220
  };
}

function cafBrew(o){
  o = o || {};
  const m = CAF_SHARE_V6[o.method] ? o.method : 'drip';
  let g = null;
  if (o.grams !== undefined && o.grams !== null && o.grams !== '' && o.how !== 'scoop' && o.how !== 'cup') {
    g = clampNum(o.grams, 0.5, 1000, null);
  } else if (o.how === 'scoop') {
    const sc = clampNum(o.scoops, 0.25, 40, null);
    g = sc == null ? null : sc * (CAF_SCOOP_G[o.roast] || 5.3);
  } else if (o.how === 'weigh' || m === 'instant') {
    g = clampNum(o.grams, 0.5, 500, null);
  } else if (m === 'espresso' || m === 'lever_espresso') {
    const sh = clampNum(o.shots, 0.5, 8, null);
    g = sh == null ? null : sh * 9.0;
  } else {
    const ml = clampNum(o.ml, 20, 3000, null);
    if (ml != null) {
      const mp = methodPhysicsFor(m);
      const yw = yieldWater({ key:m, cup:ml, ratio:mp.ratio });
      g = yw && yw.ok && yw.D > 0 ? yw.D : (ml / mp.ratio);
    }
  }
  if (!(g > 0)) return { ok:false, why:'grams' };

  const cafType = o.caffeineMode === 'halfcaf' || o.halfCaf ? 'halfcaf' : (o.caffeineMode === 'decaf' || o.decaf === true || o.decaf === 'yes') ? 'decaf' : 'regular';
  if (m === 'instant') {
    const reg = { lo:CAF_INSTANT.lo * g, mid:CAF_INSTANT.mid * g, hi:CAF_INSTANT.hi * g };
    const dec = { lo:Math.max(1.2, g * 1.1), mid:Math.max(2.0, g * 1.8), hi:Math.max(3.5, g * 3.2) };
    const q = cafType === 'decaf' ? dec : cafType === 'halfcaf' ? { lo:0.5 * (reg.lo + dec.lo), mid:0.5 * (reg.mid + dec.mid), hi:0.5 * (reg.hi + dec.hi) } : reg;
    return Object.assign(q, { ok:true, grams:rnd(g, 1), caffeineMode:cafType });
  }
  const beanMg = beanCaffeineMgPerG({
    species: o.species,
    varietal: o.varietal,
    name: o.name,
    robustaPct: o.robustaPct,
    caffeineMode: cafType
  });
  const sh = cafShareForMethod(m, o.style);
  const roastNudge = o.roast === 'dark' ? 1.02 : (o.roast === 'light' || o.roast === 'ultra-light') ? 0.985 : 1.0;
  const cupRecov = 1.0; /* CAF_SHARE_V6 (0.87 press / 0.88 cold) already includes retained liquid fraction! */
  const lo = rnd(g * beanMg.lo * sh.lo * roastNudge * cupRecov, 1);
  const mid = rnd(g * beanMg.mid * sh.mid * roastNudge * cupRecov, 1);
  const hi = rnd(g * beanMg.hi * sh.hi * roastNudge * cupRecov, 1);
  return {
    ok:true, lo, mid, hi, grams:rnd(g, 1), caffeineMode:cafType,
    species:beanMg.key, beanMidMgG:beanMg.mid, shareMid:rnd(sh.mid * cupRecov, 3),
    varianceBand:{ lo:rnd(mid * 0.82, 1), mid, hi:rnd(mid * 1.18, 1) }
  };
}

function cafPod(o){
  o = o || {};
  const p = CAF_PODS.find(x => x.id === o.pod); if (!p) return { ok:false, why:'pod' };
  const s = p.sizes.find(x => x.id === o.size); if (!s) return { ok:false, why:'size' };
  const n = clampNum(o.n === undefined ? 1 : o.n, 1, 6, null); if (n == null) return { ok:false, why:'n' };
  const half = o.caffeineMode === 'halfcaf' || o.halfCaf;
  const one = (o.decaf || o.caffeineMode === 'decaf') ? p.decaf : half ? { lo:0.5 * (s.lo + p.decaf.lo), mid:0.5 * (s.mid + p.decaf.mid), hi:0.5 * (s.hi + p.decaf.hi) } : s;
  return { ok:true, lo:one.lo * n, mid:one.mid * n, hi:one.hi * n };
}
function cafShopShots(drink, size){
  const d = CAF_SHOP.find(x => x.id === drink); if (!d || !d.shots) return null;
  return d.shots[CAF_SHOP_SIZES.indexOf(+size) >= 0 ? +size : 12];
}
function cafShop(o){
  o = o || {};
  const d = CAF_SHOP.find(x => x.id === o.drink); if (!d) return { ok:false, why:'drink' };
  const size = CAF_SHOP_SIZES.indexOf(+o.size) >= 0 ? +o.size : 12;
  const isDecaf = !!(o.decaf || o.caffeineMode === 'decaf'), isHalf = !!(o.halfCaf || o.caffeineMode === 'halfcaf');
  if (d.brewed){
    const mid = d.brewed[size];
    const reg = { lo:mid * 0.78, mid, hi:mid * 1.18 };
    const dec = { lo:4 * size / 16, mid:(d.decafMid ? d.decafMid[size] : 13 * size / 16), hi:26 * size / 16 };
    const r = isDecaf ? dec : isHalf ? { lo:0.5 * (reg.lo + dec.lo), mid:0.5 * (reg.mid + dec.mid), hi:0.5 * (reg.hi + dec.hi) } : reg;
    return Object.assign({}, r, { ok:true });
  }
  const shots = o.shots != null && o.shots !== '' ? clampNum(o.shots, 1, 8, null) : cafShopShots(d.id, size);
  if (shots == null) return { ok:false, why:'shots' };
  const baseShot = o.venue === 'cafe' ? CAF_SHOT_CAFE : (d.shot || CAF_SHOT);
  const decShot = { lo:3, mid:7, hi:14 };
  const sb = isDecaf ? decShot : isHalf ? { lo:0.5 * (baseShot.lo + decShot.lo), mid:0.5 * (baseShot.mid + decShot.mid), hi:0.5 * (baseShot.hi + decShot.hi) } : baseShot;
  const ex = d.extra ? (d.extra[size] || 0) : 0;
  return { ok:true, lo:sb.lo * shots + ex, mid:sb.mid * shots + ex, hi:sb.hi * shots + ex };
}

/* Fixes Bug C5: preserves all 7 species + laurina/aramosa varietals + all 23 methods */
const VALID_SPECIES_KEYS = ['arabica', 'robusta', 'blend_ar', 'liberica', 'excelsa', 'stenophylla', 'eugenioides'];
function cafEntryClean(src){
  if (!src || typeof src !== 'object' || !['pod', 'home', 'shop', 'other'].includes(src.kind)) return null;
  const tNum = clampNum(src.t, 0, 1439, null);
  const e = { kind:src.kind, t:tNum == null ? null : Math.round(tNum), strength:CAF_STRENGTH[src.strength] ? src.strength : 'regular' };
  e.n = Math.round(clampNum(src.n, 1, 6, 1));
  const cMode = src.caffeineMode === 'halfcaf' || src.halfCaf ? 'halfcaf' : (src.caffeineMode === 'decaf' || src.decaf === true) ? 'decaf' : 'regular';
  if (e.kind === 'pod'){
    const p = CAF_PODS.find(x => x.id === src.pod) || CAF_PODS[0];
    e.pod = p.id; e.size = p.sizes.some(s => s.id === src.size) ? src.size : p.sizes[0].id;
    e.decaf = cMode === 'decaf'; e.caffeineMode = cMode;
  } else if (e.kind === 'home'){
    e.method = CAF_HOME_METHODS.includes(src.method) ? src.method : 'drip';
    e.how = e.method === 'instant' ? 'weigh' : (['weigh', 'cup', 'scoop'].includes(src.how) ? src.how : 'cup');
    const spIn = src.species === 'blend' ? 'blend_ar' : String(src.species || 'arabica').toLowerCase();
    e.species = e.method === 'instant' ? 'arabica' : (VALID_SPECIES_KEYS.includes(spIn) ? spIn : 'arabica');
    if (src.varietal) e.varietal = String(src.varietal).slice(0, 60);
    if (src.robustaPct != null && src.robustaPct !== '' && isFinite(+src.robustaPct) && e.method !== 'instant') {
      e.robustaPct = Math.round(clampNum(src.robustaPct, 0, 100, 0));
    }
    e.decaf = cMode === 'decaf'; e.caffeineMode = cMode;
    e.roast = ROASTS.some(r => r.v === src.roast) ? src.roast : 'medium';
    e.grams = clampNum(src.grams, 0.5, 500, null);
    e.ml = clampNum(src.ml, 20, 3000, 240);
    e.shots = Math.round(clampNum(src.shots, 1, 8, 2));
    e.scoops = clampNum(src.scoops, 0.5, 30, 3);
  } else if (e.kind === 'shop'){
    const d = CAF_SHOP.find(x => x.id === src.drink) || CAF_SHOP[0];
    e.drink = d.id; e.temp = src.temp === 'iced' ? 'iced' : 'hot';
    e.size = CAF_SHOP_SIZES.indexOf(+src.size) >= 0 ? +src.size : 12;
    e.decaf = cMode === 'decaf'; e.caffeineMode = cMode; e.venue = src.venue === 'cafe' ? 'cafe' : 'chain';
    e.shots = src.shots != null && src.shots !== '' ? Math.round(clampNum(src.shots, 1, 8, 2)) : null;
  } else {
    e.mg = clampNum(src.mg, 0, 1000, null); e.strength = 'regular';
  }
  return e;
}

function cafEntry(raw){
  const e = cafEntryClean(raw); if (!e) return { ok:false, why:'entry' };
  let r;
  if (e.kind === 'pod') r = cafPod({ pod:e.pod, size:e.size, n:1, decaf:e.decaf, caffeineMode:e.caffeineMode });
  else if (e.kind === 'home') r = cafBrew({ method:e.method, how:e.how, grams:e.how === 'weigh' ? e.grams : undefined, scoops:e.scoops, roast:e.roast, ml:e.ml, shots:e.shots, species:e.species, varietal:e.varietal, robustaPct:e.robustaPct, decaf:e.decaf, caffeineMode:e.caffeineMode });
  else if (e.kind === 'shop') r = cafShop({ drink:e.drink, size:e.size, shots:e.shots, decaf:e.decaf, caffeineMode:e.caffeineMode, venue:e.venue });
  else r = e.mg == null ? { ok:false, why:'mg' } : { ok:true, lo:e.mg, mid:e.mg, hi:e.mg };
  if (!r.ok) return r;
  const weighed = e.kind === 'home' && (e.how === 'weigh' || e.how === 'scoop') && e.method !== 'espresso' && e.method !== 'lever_espresso';
  const f = (e.kind === 'other' || weighed ? 1 : CAF_STRENGTH[e.strength]) * e.n;
  return { ok:true, lo:rnd(r.lo * f, 1), mid:rnd(r.mid * f, 1), hi:rnd(r.hi * f, 1), n:e.n };
}

function caffeineClean(src){
  src = src && typeof src === 'object' ? src : {};
  const w = clampNum(src.wake, 0, 1439, null), b = clampNum(src.bed, 0, 1439, null);
  const entries = (Array.isArray(src.entries) ? src.entries : []).slice(0, CAF_MAX_DRINKS).map(cafEntryClean).filter(Boolean);
  return {
    wake: w == null ? 420 : Math.round(w),
    bed: b == null ? 1380 : Math.round(b),
    line: CAF_LINES[src.line] ? src.line : 'careful',
    speed: CAF_HALF[src.speed] ? src.speed : 'typical',
    count: Math.max(entries.length, Math.round(clampNum(src.count, 0, CAF_MAX_DRINKS, 0))),
    entries,
    fed: !!src.fed,
    steadyState: !!src.steadyState
  };
}

function cafBedHours(d){ const w = d.wake / 60, b = d.bed / 60; return b <= w ? b + 24 : b; }
function cafItems(d){
  const a = [], wake = d.wake / 60;
  (d.entries || []).forEach((e, i) => {
    if (e.t == null) return;
    const r = cafEntry(e), t = e.t / 60;
    if (r.ok) a.push({ i, t:t < wake ? t + 24 : t, mg:r.mid, lo:r.lo, hi:r.hi, n:r.n });
  });
  return a.sort((x, y) => x.t - y.t);
}
function cafCurve(items, from, to, step, half, opt){
  const a = [], st = Math.max(0.05, +step || 0.25);
  for (let h = from; h <= to + 1e-9; h += st) a.push([rnd(h, 3), cafBodyAt(items, h, half, opt)]);
  return a;
}
function cafPeak(items, bed, half, opt){
  let best = { h:0, mg:0 };
  if (!items || !items.length) return best;
  for (let h = items[0].t; h <= bed + 1e-9; h += 1 / 12){
    const v = cafBodyAt(items, h, half, opt);
    if (v > best.mg) best = { h, mg:v };
  }
  return best;
}
function cafSleepReadyAt(items, half, thresholdMg, opt){
  if (!items || !items.length) return null;
  const hl = half > 0 ? half : CAF_HALF.typical, ke = Math.LN2 / hl;
  const ka = opt && opt.ka > 0 ? +opt.ka : (opt && opt.fed ? CAF_KA_FED : CAF_KA_FASTED);
  const tMaxSingle = Math.abs(ka - ke) > 1e-4 ? Math.log(ka / ke) / (ka - ke) : 1 / ke;
  const firstDrinkT = Math.min.apply(null, items.map(x => x.t));
  const lastDrinkT = Math.max.apply(null, items.map(x => x.t));
  const steady = !!(opt && opt.steadyState);
  let lo = lastDrinkT + tMaxSingle;
  let hi = steady ? Math.max(lo + 0.25, firstDrinkT + 24 - 1e-3) : (lo + 96);
  if (cafBodyAt(items, lo, hl, opt) <= thresholdMg){
    const pk = cafPeak(items, lo + 2, hl, opt);
    if (pk.mg <= thresholdMg) return lastDrinkT;
    lo = pk.h;
  }
  if (cafBodyAt(items, hi, hl, opt) > thresholdMg) return null;
  for (let iter = 0; iter < 26; iter++){
    const mid = 0.5 * (lo + hi);
    if (cafBodyAt(items, mid, hl, opt) > thresholdMg) lo = mid;
    else hi = mid;
  }
  return 0.5 * (lo + hi);
}

function cafStacksOf(items, windowH){
  const list = Array.isArray(items) ? items.slice().sort((a, b) => a.t - b.t) : [];
  const win = windowH > 0 ? +windowH : 0.75;
  const stacks = [];
  list.forEach(it => {
    const prev = stacks.length ? stacks[stacks.length - 1] : null;
    if (prev && Math.abs(it.t - prev.t) <= win) {
      prev.items.push(it);
      prev.totalMg = rnd(prev.totalMg + (it.mg || 0), 1);
    } else {
      stacks.push({ t:it.t, totalMg:rnd(it.mg || 0, 1), items:[it] });
    }
  });
  return stacks;
}

function solveSafeCutoff(p){
  p = p || {};
  const wake = isFinite(+p.wakeHours) ? +p.wakeHours : (isFinite(+p.wakeHour) ? +p.wakeHour : 7.0);
  const bedIn = isFinite(+p.bedHours) ? +p.bedHours : (isFinite(+p.bedHour) ? +p.bedHour : 23.0);
  const bed = bedIn <= wake ? bedIn + 24 : bedIn;
  const half = p.half > 0 ? +p.half : (p.halfLifeH > 0 ? +p.halfLifeH : (CAF_HALF[p.speed] || CAF_HALF.typical));
  const line = p.thresholdMg > 0 ? +p.thresholdMg : (p.swsThresholdMg > 0 ? +p.swsThresholdMg : 35);
  const refMg = p.refMg > 0 ? +p.refMg : (p.doseMg > 0 ? +p.doseMg : 145);
  const prior = Array.isArray(p.priorItems) ? p.priorItems : [];
  const opt = p.opt || { fed:!!p.fed, steadyState:!!p.steadyState };

  const atBedForTime = tCup => cafBodyAt(prior.concat([{ t:tCup, mg:refMg }]), bed, half, opt);
  const loBound = wake, hiBound = Math.max(wake, bed - 0.75);
  if (atBedForTime(loBound) > line){
    return { ok:false, noneFits:true, latestSafeHour:null, cutoffHours:null, refMg, line, swsThresholdMg:line, minAtBed:rnd(atBedForTime(loBound), 1) };
  }
  if (atBedForTime(hiBound) <= line){
    return { ok:true, latestSafeHour:rnd(hiBound, 2), cutoffHours:rnd(hiBound, 2), cutoffMin:Math.round(hiBound * 60) % 1440, refMg, line, swsThresholdMg:line, noRestriction:true };
  }
  let lo = loBound, hi = hiBound;
  for (let iter = 0; iter < 26; iter++){
    const mid = 0.5 * (lo + hi);
    if (atBedForTime(mid) <= line) lo = mid;
    else hi = mid;
  }
  const solved = 0.5 * (lo + hi);
  return { ok:true, latestSafeHour:rnd(solved, 2), cutoffHours:rnd(solved, 2), cutoffMin:Math.round(solved * 60) % 1440, hoursBeforeBed:rnd(bed - solved, 1), refMg, line, swsThresholdMg:line };
}
const cafLastSafeCutoff = solveSafeCutoff;
const cafSnap = h => Math.round(h * 12) / 12;

function cafAnalyze(day){
  const d = caffeineClean(day), half = CAF_HALF[d.speed] || CAF_HALF.typical, line = CAF_LINES[d.line].mg;
  const opt = { fed:!!d.fed, steadyState:!!d.steadyState };
  const items = cafItems(d), bed = cafBedHours(d);
  const dayLimit = (d.speed === 'pregnant' || d.speed === 'pregnant_t3') ? CAF_LIMITS.pregnantDay : CAF_LIMITS.day;
  const total = items.reduce((a, x) => ({ lo:a.lo + x.lo, mid:a.mid + x.mg, hi:a.hi + x.hi }), { lo:0, mid:0, hi:0 });
  const atBed = cafBodyAt(items, bed, half, opt), peak = cafPeak(items, bed, half, opt);
  const sleepReadyH = cafSleepReadyAt(items, half, line, opt);
  const cutoff150 = solveSafeCutoff({ wakeHours:d.wake / 60, bedHours:bed, half, thresholdMg:line, refMg:145, priorItems:[], opt });
  return {
    ok:items.length > 0, items, total, atBed:rnd(atBed, 1), line, overLine:atBed > line,
    peak, dayLimit, isPregnant:(d.speed === 'pregnant' || d.speed === 'pregnant_t3'),
    overDay:total.mid > dayLimit, half, bed, opt, sleepReadyH, cutoff150
  };
}

function cafSuggest(day){
  const d = caffeineClean(day), a = cafAnalyze(d);
  if (!a.ok) return { ok:false, why:'none' };
  const items = a.items, half = a.half, line = a.line, wake = d.wake / 60, bed = a.bed, opt = a.opt;
  if (a.atBed <= line + 1e-6) return { ok:true, already:true, times:items.map(x => x.t), kept:items.length, dropped:[], items, atBed:a.atBed };
  for (let k = items.length; k >= 1; k--){
    const list = items.slice(0, k);
    const minTimesFor = maxLastT => {
      const ts = list.map(x => Math.max(wake, Math.min(x.t, maxLastT)));
      for (let j = ts.length - 2; j >= 0; j--){
        if (ts[j + 1] - ts[j] < 1.0 && (list[j].mg + list[j + 1].mg > CAF_LIMITS.single)){
          ts[j] = Math.max(wake, ts[j + 1] - 1.0);
        }
      }
      return ts.map(cafSnap);
    };
    const evalBed = ts => cafBodyAt(list.map((x, idx) => ({ t:ts[idx], mg:x.mg })), bed, half, opt);
    if (evalBed(minTimesFor(wake + (k - 1) * 1.0)) <= line + 1e-6){
      let lo = wake, hi = Math.max(wake, bed - 0.25);
      for (let iter = 0; iter < 26; iter++){
        const mid = 0.5 * (lo + hi);
        if (evalBed(minTimesFor(mid)) <= line + 1e-6) lo = mid;
        else hi = mid;
      }
      const bestTs = minTimesFor(lo);
      return { ok:true, already:false, times:bestTs, kept:k, dropped:items.slice(k).map(x => x.i), items:list, atBed:rnd(evalBed(bestTs), 1) };
    }
  }
  return { ok:true, already:false, times:[], kept:0, dropped:items.map(x => x.i), items:[], atBed:0 };
}
function cafCompare(day){
  const d = caffeineClean(day), a = cafAnalyze(d);
  if (!a.ok) return { ok:false, why:'none' };
  const s = cafSuggest(d);
  return { ok:true, usual:a, suggested:s, same:s.already, fits:s.kept >= a.items.length };
}

/* ---------- 9. Unified Freshness Windows & Cost / Bulk-Trap Planners (Fixes Bug C13) ---------- */
const FRESH_WINDOWS = {
  filter:    { 'ultra-light':[7, 42, 65], light:[5, 35, 52], 'medium-light':[4, 28, 45], medium:[3, 24, 38], 'medium-dark':[2, 18, 30], dark:[1, 12, 21] },
  espresso:  { 'ultra-light':[14, 49, 70], light:[10, 38, 56], 'medium-light':[8, 32, 48], medium:[7, 26, 40], 'medium-dark':[5, 20, 32], dark:[3, 14, 24] },
  immersion: { 'ultra-light':[5, 42, 65], light:[4, 35, 52], 'medium-light':[3, 28, 45], medium:[3, 24, 38], 'medium-dark':[2, 18, 30], dark:[1, 12, 21] },
  cold:      { 'ultra-light':[3, 45, 68], light:[3, 38, 60], 'medium-light':[3, 34, 52], medium:[2, 30, 46], 'medium-dark':[2, 24, 38], dark:[1, 18, 28] }
};
const FRESH_WINDOWS_V2 = FRESH_WINDOWS;

function freshMethodClass(mKey){
  if (mKey === 'espresso' || mKey === 'lever_espresso' || mKey === 'philips5500' || mKey === 'moka') return 'espresso';
  if (mKey === 'cold' || mKey === 'cold_drip') return 'cold';
  if (['press', 'clever', 'switch', 'aeropress', 'siphon', 'turkish'].includes(mKey)) return 'immersion';
  return 'filter';
}

function freshWindowFor(methodOrCls, roastKey, isDecaf){
  const cls = FRESH_WINDOWS[methodOrCls] ? methodOrCls : freshMethodClass(methodOrCls);
  const rk = FRESH_WINDOWS[cls][roastKey] ? roastKey : 'medium';
  const arr = FRESH_WINDOWS[cls][rk];
  const mult = isDecaf ? 0.65 : 1.0;
  return {
    ready: Math.max(1, Math.round(arr[0] * mult)),
    best:  Math.max(3, Math.round(arr[1] * mult)),
    fade:  Math.max(6, Math.round(arr[2] * mult))
  };
}
const freshWindow = (mObjOrKey, roastKey, isDecaf) => freshWindowFor(typeof mObjOrKey === 'string' ? mObjOrKey : (mObjOrKey && mObjOrKey.key) || 'v60', roastKey, isDecaf);

function freshState(days, win){
  if (days == null || days < 0 || !win) return 'unknown';
  if (days < win.ready) return 'resting';
  if (days <= win.best) return 'sweet';
  if (days <= win.fade) return 'past';
  return 'fading';
}

function freshnessFor(c, now){
  if (!c || !c.roast_date || !validIsoDate(c.roast_date)) return null;
  const age = effectiveBeanAge(c, now);
  if (age.effectiveDays == null) return null;
  const isDecaf = c.decaf === 'yes' || (c.decaf_process && c.decaf_process !== '' && c.decaf_process !== 'half-caf');
  const rk = c.roast || 'medium';
  const fWin = freshWindowFor('filter', rk, isDecaf);
  const eWin = freshWindowFor('espresso', rk, isDecaf);
  const st = freshState(age.effectiveDays, fWin);
  const labels = { resting:'Still Resting (CO2 Rich)', sweet:'In Peak Window', past:'Gently Past Peak', fading:'Aromatics Fading' };
  return {
    days: age.rawDays,
    effectiveDays: age.effectiveDays,
    isFrozen: age.isFrozen,
    savedDays: age.savedDays,
    state: st,
    label: labels[st] || 'Freshness Tracked',
    tip: st === 'resting' ? ('Day ' + age.effectiveDays + ' — use a 45-50 s bloom for active CO2.') : st === 'sweet' ? ('Day ' + age.effectiveDays + ' — peak volatile balance.') : ('Day ' + age.effectiveDays + ' — grind 1 step finer if cup feels light.'),
    filter: { win:fWin, state:st, short:'days ' + fWin.ready + '-' + fWin.best },
    espresso: { win:eWin, state:freshState(age.effectiveDays, eWin), short:'days ' + eWin.ready + '-' + eWin.best }
  };
}

const PKG_FACTORS = {
  valve_bag:         { key:'valve_bag',         label:'Sealed 1-Way Valve Bag',          s:1.00, note:'Standard specialty barrier pouch; vents CO2 while limiting O2 ingress until opened.' },
  airtight_canister: { key:'airtight_canister', label:'Airtight Displacement Canister',  s:0.88, note:'Airscape / Fellow Atmos canister slows headspace O2 lipid oxidation by ~12%.' },
  vacuum:            { key:'vacuum',            label:'Vacuum Sealed Pouch',             s:0.72, note:'Minimal oxygen contact slows aroma staling after initial rest.' },
  open_clipped:      { key:'open_clipped',      label:'Opened Bag (Clipped Daily)',      s:1.30, note:'Daily headspace oxygen refresh accelerates aroma fade ~30%.' },
  freezer:           { key:'freezer',           label:'-18 C Cryo-Vault (12.3x Slowdown)', s:1 / CRYO_SLOWDOWN_18C, note:'Arrhenius kinetics at -18 C (Ea = 40.1 kJ/mol) slows CO2 diffusion & staling 12.3x.' }
};

function calcFreshnessPlan(p){
  p = p || {};
  const roast = FRESH_WINDOWS.filter[p.roast] ? p.roast : 'medium';
  const methodCls = ['filter', 'espresso', 'immersion', 'cold'].includes(p.methodCls) ? p.methodCls : 'filter';
  const pkgKey = PKG_FACTORS[p.pkg] ? p.pkg : 'valve_bag';
  const pkg = PKG_FACTORS[pkgKey];
  const roomDays = clampNum(p.roomDays, 0, 365, 8);
  const frozenDays = clampNum(p.frozenDays, 0, 1000, 0);
  const isFreezerMode = pkgKey === 'freezer';
  const sPkg = isFreezerMode ? 1.0 : pkg.s;
  const tEff = isFreezerMode
    ? clampNum(p.restDaysBeforeFreeze, 0, 60, Math.min(roomDays, 7)) + Math.max(0, roomDays - Math.min(roomDays, 7) + frozenDays) / CRYO_SLOWDOWN_18C
    : roomDays * sPkg + frozenDays / CRYO_SLOWDOWN_18C;

  const win = freshWindowFor(methodCls, roast, !!p.decaf);
  const bagWeightG = clampNum(p.bagWeightG, 20, 5000, 250);
  const dailyGrams = clampNum(p.dailyGrams, 2, 300, 18);
  const daysToFinish = dailyGrams > 0 ? bagWeightG / dailyGrams : 14;
  const finishEffAge = tEff + daysToFinish * (isFreezerMode ? (1 / CRYO_SLOWDOWN_18C) : sPkg);
  const stateNow = freshState(tEff, win);

  const vitalityAt = te => {
    if (te < win.ready) return Math.round(52 + 46 * (te / Math.max(1, win.ready)));
    if (te <= win.best) return Math.round(98 + 2 * Math.sin((te - win.ready) / Math.max(1, win.best - win.ready) * Math.PI));
    if (te <= win.fade) return Math.round(98 - 28 * ((te - win.best) / Math.max(1, win.fade - win.best)));
    return Math.max(18, Math.round(70 * Math.exp(-(te - win.fade) / 28)));
  };
  const kDegas = { 'ultra-light':0.11, light:0.14, 'medium-light':0.18, medium:0.23, 'medium-dark':0.32, dark:0.42 }[roast] || 0.20;
  const co2PctAt = te => Math.round(100 * Math.exp(-kDegas * te));
  const maxHorizon = Math.max(60, Math.ceil(Math.max(roomDays + daysToFinish, win.fade) + 8));
  const curveAmbient = [], curveFrozen = [];
  const freezeAtDay = Math.max(roomDays, win.ready);
  for (let d = 0; d <= maxHorizon; d += 1){
    const teAmb = d * (isFreezerMode ? 1.0 : sPkg);
    curveAmbient.push({ d, v:vitalityAt(teAmb), co2:co2PctAt(teAmb) });
    const teFrz = d <= freezeAtDay ? d : (freezeAtDay + (d - freezeAtDay) / CRYO_SLOWDOWN_18C);
    curveFrozen.push({ d, v:vitalityAt(teFrz), co2:co2PctAt(teFrz) });
  }
  const peakDaysLeftAmbient = Math.max(0, (win.best - tEff) / Math.max(0.2, isFreezerMode ? 1.0 : sPkg));
  const gramsConsumableInPeak = peakDaysLeftAmbient * dailyGrams;
  const needsSplit = !isFreezerMode && bagWeightG > gramsConsumableInPeak + dailyGrams * 1.5 && tEff <= win.fade;
  const keepOutG = needsSplit ? Math.max(dailyGrams * 3, Math.min(bagWeightG, Math.round(gramsConsumableInPeak))) : bagWeightG;
  const freezeNowG = Math.max(0, Math.round(bagWeightG - keepOutG));

  return {
    roast, methodCls, pkgKey, pkg, roomDays, frozenDays, tEff:rnd(tEff, 1), cryoFactor:CRYO_SLOWDOWN_18C,
    win, stateNow, vitalityNow:vitalityAt(tEff), co2Now:co2PctAt(tEff),
    bagWeightG, dailyGrams, daysToFinish:rnd(daysToFinish, 1),
    finishCalendarDay:Math.round(roomDays + daysToFinish), finishEffAge:rnd(finishEffAge, 1),
    finishesPastPeak:finishEffAge > win.best + 1, finishesFaded:finishEffAge > win.fade,
    needsSplit, keepOutG, freezeNowG, maxHorizon, curveAmbient, curveFrozen
  };
}

const STD_12OZ_G = 340.194;
const COST_DAYS_PER_MONTH = 30.4375;
function costGrams(size, unit){
  const v = +size;
  if (!(v > 0) || !isFinite(v)) return 0;
  const u = String(unit || 'g').trim().toLowerCase();
  if (u === 'g') return v;
  if (u === 'oz') return v * G_PER_OZ;
  if (u === 'lb' || u === 'lbs') return v * 453.59237;
  if (u === 'kg') return v * 1000;
  return 0;
}
function costOne(entry, doseG){
  if (!entry || typeof entry !== 'object' || !(entry.price >= 0) || !isFinite(+entry.price)) return { ok:false };
  const d = doseG > 0 ? +doseG : (+entry.dose > 0 ? +entry.dose : 18);
  const cupsDay = (+entry.cups > 0 && isFinite(+entry.cups)) ? +entry.cups : null;
  const ship = +entry.ship > 0 ? +entry.ship : (+entry.shipping > 0 ? +entry.shipping : 0);
  const tot = +entry.price + ship;
  if (entry.kind === 'pods' || entry.unit === 'pods' || +entry.pods > 0) {
    const n = entry.count > 0 ? +entry.count : (+entry.pods > 0 ? +entry.pods : (entry.size > 0 ? +entry.size : 10));
    const perCup = tot / n, perDay = cupsDay ? perCup * cupsDay : null;
    return {
      ok:true, kind:'pods', total:rnd(tot, 2), grams:null, perGram:null, per100g:null,
      cups:n, cupsInBag:n, perCup:rnd(perCup, 2), costPerCup:rnd(perCup, 2),
      perDay:perDay != null ? rnd(perDay, 2) : null,
      perWeek:perDay != null ? rnd(perDay * 7, 2) : null,
      perMonth:perDay != null ? rnd(perDay * COST_DAYS_PER_MONTH, 2) : null,
      daysInBag:cupsDay ? rnd(n / cupsDay, 1) : null
    };
  }
  const g = costGrams(entry.size != null ? entry.size : (entry.grams != null ? entry.grams : entry.weightG), entry.unit || 'g');
  if (!(g > 0) || !(d > 0)) return { ok:false };
  const cupsInBag = g / d, perCup = tot / cupsInBag, perGram = tot / g;
  const perDay = cupsDay ? perCup * cupsDay : null;
  return {
    ok:true, kind:'bag', total:rnd(tot, 2), grams:rnd(g, 1), weightG:rnd(g, 1), doseG:d,
    cups:rnd(cupsInBag, 1), cupsInBag:rnd(cupsInBag, 1),
    perCup:rnd(perCup, 2), costPerCup:rnd(perCup, 2), perGram:rnd(perGram, 4), per100g:rnd(perGram * 100, 2), perOz:rnd(perGram * G_PER_OZ, 2),
    perDay:perDay != null ? rnd(perDay, 2) : null,
    perWeek:perDay != null ? rnd(perDay * 7, 2) : null,
    perMonth:perDay != null ? rnd(perDay * COST_DAYS_PER_MONTH, 2) : null,
    daysInBag:cupsDay ? rnd(cupsInBag / cupsDay, 1) : null
  };
}

function freshMonth(coffee, opts){
  opts = opts || {};
  const c = coffee || {};
  const rDate = c.roast_date && validIsoDate(c.roast_date) ? new Date(c.roast_date + 'T12:00:00Z') : new Date();
  const method = opts.method || 'v60';
  const roast = c.roast || 'medium';
  const win = freshWindowFor(method, roast, c.decaf === 'yes');
  const days = [];
  const numDays = Math.min(90, Math.max(28, +opts.days || 35));
  for (let d = 0; d < numDays; d++){
    const dt = new Date(rDate.getTime() + d * 86400000);
    const iso = dt.toISOString().slice(0, 10);
    const effD = (c.is_frozen === 'yes' && d > 7) ? (7 + (d - 7) / CRYO_SLOWDOWN_18C) : d;
    const state = effD < win.rest ? 'resting' : effD <= win.best ? 'peak' : effD <= win.fade ? 'good' : 'fading';
    const vit = state === 'resting' ? Math.round(78 + 20 * (effD / Math.max(1, win.rest))) : state === 'peak' ? Math.round(100 - 12 * ((effD - win.rest) / Math.max(1, win.best - win.rest))) : Math.max(35, Math.round(88 - 1.4 * (effD - win.best)));
    days.push({ day:d, effectiveDay:rnd(effD, 1), iso, state, vitalityPct:clampNum(vit, 25, 100, 85) });
  }
  return { ok:true, roastDate:rDate.toISOString().slice(0, 10), window:win, days };
}
function bagSide(bag, shared){ return calcCostStudio(Object.assign({}, shared || {}, bag || {})); }
function bagVerdict(bagA, bagB, shared){ return calcBulkTrapCompare(bagA || {}, bagB || {}, shared || {}); }
const calcColdBrewDilution = calcConcentrateDilution;

/* ---------- Spoken Kitchen Voice Coach Helpers (0670 Parity — Zero Emojis) ---------- */
function stepVoice(step, opts){
  if (!step) return '';
  opts = opts || {};
  const toG = step.toG != null ? Math.round(step.toG) : (step.targetG != null ? Math.round(step.targetG) : null);
  const kind = String(step.actionKind || step.kind || '').toLowerCase();
  if (/bloom/.test(kind) && toG > 0) return 'Bloom pour to ' + toG + ' grams, then swirl gently.';
  if (/clever_mug|drain|release/.test(kind)) return 'Release valve and let the coffee drain cleanly.';
  if (/kaymak/.test(kind)) return 'Heat gently until the kaymak foam rises near the rim. Do not let it boil.';
  if (/quench/.test(kind)) return 'Cool the base under cold tap water right before sputtering starts.';
  if (/vacuum/.test(kind)) return 'Turn off heat, give three gentle stirs, and let vacuum pull the brew down.';
  if (toG > 0 && step.targetFlowGs > 0) return 'Pour steadily to ' + toG + ' grams at about ' + step.targetFlowGs + ' grams per second.';
  if (step.human) return String(step.human).split('.')[0] + '.';
  return String(step.label || step.title || 'Next brew step.');
}
function coachCues(recipe){
  const steps = (recipe && Array.isArray(recipe.steps)) ? recipe.steps : [];
  return steps.map((st, idx) => ({
    index:idx,
    atSec:st.t || 0,
    countdownFromSec:Math.max(0, (st.t || 0) - 3),
    spokenText:stepVoice(st),
    targetG:st.toG != null ? st.toG : null
  }));
}
function kettleAdvice(methodKey, pourWaterG){
  const m = String(methodKey || 'v60').toLowerCase();
  const fillG = kettleFill(pourWaterG || 250, { method:m });
  if (m === 'cold' || m === 'cold_drip') return 'Use chilled filtered water (' + Math.round(pourWaterG || 400) + ' g); no kettle heating needed.';
  if (m === 'turkish') return 'Start with ' + Math.round(pourWaterG || 76) + ' g cool or 60 C filtered water directly in the cezve.';
  if (m === 'moka') return 'Pre-heat about ' + fillG + ' g in your kettle so you can fill the Moka base hot with a towel.';
  return 'Heat at least ' + fillG + ' g in your gooseneck kettle (' + Math.round(pourWaterG || 250) + ' g pour plus filter rinse and stream-control margin).';
}
function calcCostStudio(p){
  p = p || {};
  const price = clampNum(p.price, 0, 10000, 0);
  const ship = clampNum(p.shipping, 0, 500, 0);
  const grams = p.kind === 'pods' ? null : costGrams(p.size, p.unit || 'g');
  const dose = clampNum(p.dose, 1, 200, 18);
  const cupsPerDay = clampNum(p.cupsPerDay, 0.1, 30, 2);
  const dialWasteG = clampNum(p.dialWasteG, 0, 500, 0);
  const retentionG = clampNum(p.retentionG, 0, 15, 0);
  const extrasPerCup = clampNum(p.filterCost, 0, 5, 0) + clampNum(p.waterCost, 0, 5, 0) + clampNum(p.milkCost, 0, 10, 0);
  const cafePrice = clampNum(p.cafePrice, 0, 50, 5.75);
  const gearCost = clampNum(p.gearCost, 0, 25000, 0);
  const roast = p.roast || 'medium';
  const daysOld = clampNum(p.daysOld, 0, 365, 5);
  const isFrozen = !!p.isFrozen;
  const totBagCost = price + ship;
  if (!(totBagCost > 0)) return { ok:false, why:'Enter a bag price above 0.' };
  if (p.kind === 'pods') {
    const podCount = Math.floor(clampNum(p.size, 1, 1000, 10));
    const totalPerCup = (totBagCost / podCount) + extrasPerCup;
    const savePerCup = cafePrice - totalPerCup;
    return { ok:true, kind:'pods', totBagCost, usableCups:podCount, totalPerCup:rnd(totalPerCup, 2), peakAdjustedPerCup:rnd(totalPerCup, 2), savePerCup:rnd(savePerCup, 2), annualSave:rnd(savePerCup * cupsPerDay * 365.25, 2) };
  }
  if (!(grams > 0) || grams <= dialWasteG) return { ok:false, why:'Bag weight must exceed dial-in waste.' };
  const effDose = dose + retentionG;
  const usableCups = (grams - dialWasteG) / effDose;
  const beanPerCup = totBagCost / usableCups;
  const totalPerCup = beanPerCup + extrasPerCup;
  const win = freshWindowFor('filter', roast, false);
  const peakWindowDaysLeft = isFrozen ? 365 : Math.max(0, win.best - daysOld);
  const peakCups = Math.min(usableCups, Math.max(1, peakWindowDaysLeft * cupsPerDay));
  const staleCups = Math.max(0, usableCups - peakCups);
  const peakAdjustedPerCup = (totBagCost / peakCups) + extrasPerCup;
  const savePerCup = cafePrice - totalPerCup;
  const breakevenCups = gearCost > 0 && savePerCup > 0 ? Math.ceil(gearCost / savePerCup) : null;
  return {
    ok:true, kind:'bag', totBagCost, grams,
    per100g:rnd(100 * (totBagCost / grams), 2), per12oz:rnd(STD_12OZ_G * (totBagCost / grams), 2),
    usableCups:rnd(usableCups, 1), wholeCups:Math.floor(usableCups), daysInBag:rnd(usableCups / cupsPerDay, 1),
    beanPerCup:rnd(beanPerCup, 2), extrasPerCup:rnd(extrasPerCup, 2), totalPerCup:rnd(totalPerCup, 2),
    peakCups:Math.floor(peakCups), staleCups:Math.max(0, Math.floor(usableCups) - Math.floor(peakCups)),
    peakAdjustedPerCup:rnd(peakAdjustedPerCup, 2), bulkTrapTriggered:!isFrozen && staleCups >= 2.5,
    perDay:rnd(totalPerCup * cupsPerDay, 2), perMonth:rnd(totalPerCup * cupsPerDay * COST_DAYS_PER_MONTH, 2), perYear:rnd(totalPerCup * cupsPerDay * 365.25, 2),
    cafePrice, savePerCup:rnd(savePerCup, 2), annualSave:rnd(savePerCup * cupsPerDay * 365.25, 2),
    gearCost, breakevenCups, breakevenDays:breakevenCups ? rnd(breakevenCups / cupsPerDay, 1) : null
  };
}
function calcBulkTrapCompare(bagA, bagB, shared){
  shared = shared || {};
  const a = calcCostStudio(Object.assign({}, shared, bagA));
  const b = calcCostStudio(Object.assign({}, shared, bagB));
  if (!a.ok || !b.ok) return { ok:false, a, b };
  const rawWinner = Math.abs(a.totalPerCup - b.totalPerCup) < 0.01 ? 'tie' : (a.totalPerCup < b.totalPerCup ? 'a' : 'b');
  const peakWinner = Math.abs(a.peakAdjustedPerCup - b.peakAdjustedPerCup) < 0.01 ? 'tie' : (a.peakAdjustedPerCup < b.peakAdjustedPerCup ? 'a' : 'b');
  return { ok:true, a, b, rawWinner, peakWinner, bulkTrapFlip:rawWinner !== 'tie' && peakWinner !== 'tie' && rawWinner !== peakWinner };
}

/* Bean Physics Summary & 23-Method Recommender */
function beanPhysicsSummary(c, now){
  c = c || {};
  const rawRoastIn = c.roast || c.roast_level || '';
  const normRoast = typeof G.resolveRoast === 'function' ? G.resolveRoast(rawRoastIn) : String(rawRoastIn).toLowerCase().trim();
  const roastKey = normRoast || 'medium';
  const roastAssumed = !rawRoastIn && !c.agtron && !c.ground_agtron;
  const roastObj = ROASTS.find(r => r.v === roastKey) || ROASTS[3];
  const rawProcIn = c.process || c.process_sub || '';
  const normProc = typeof G.resolveProcess === 'function' ? G.resolveProcess(rawProcIn) : String(rawProcIn).toLowerCase().trim();
  const procKey = normProc || 'unknown';
  const procObj = PROCESSES.find(p => p.v === procKey) || PROCESSES[PROCESSES.length - 1];
  const age = effectiveBeanAge(c, now);
  const bagNotes = String(c.bag_notes || c.bagNotes || c.notes || (Array.isArray(c.flavors) ? c.flavors.join(', ') : (c.flavors || '')) || '').trim();
  const isEth = /ethiopia|yirgachef|sidam|guji|gedeb|chelbesa|worka|harrar|heirloom|landrace|74110|74112|74158/i.test((c.origin || '') + ' ' + (c.name || '') + ' ' + (c.varietal || ''));
  const isGesha = /gei?sha/i.test((c.varietal || '') + ' ' + (c.name || ''));
  const isFloralTea = /\b(jasmine|bergamot|hibiscus|rose|lavender|earl\s*grey|chamomile|white\s*tea|black\s*tea|oolong|blossom|honeysuckle|violet)\b/i.test(bagNotes);
  const isChocolateNut = /\b(chocolate|cocoa|cacao|fudge|hazelnut|almond|walnut|praline|toffee|molasses|brown\s*sugar)\b/i.test(bagNotes);
  const isFermentFruit = /\b(boozy|winey|rum|brandy|passion\s*fruit|guava|lychee|mango|ferment|funk)\b/i.test(bagNotes);
  const isDecaf = c.decaf === 'yes' || c.decaf === true || (c.decaf_process && c.decaf_process !== '' && c.decaf_process !== 'half-caf');
  const spKey = String(c.species || 'arabica').toLowerCase().trim();
  const sp = SPECIES_OPTS.find(s => s.v === spKey) || SPECIES_OPTS[0];
  const rawGroundAg = parseFloat(c.ground_agtron != null && c.ground_agtron !== '' ? c.ground_agtron : c.agtron);
  const rawBeanAg = parseFloat(c.bean_agtron);
  const agVal = (isFinite(rawGroundAg) && rawGroundAg >= 15 && rawGroundAg <= 120)
    ? rnd(rawGroundAg, 1)
    : ((isFinite(rawBeanAg) && rawBeanAg >= 15 && rawBeanAg <= 120) ? rnd(rawBeanAg + agtronExpectedDelta(rawBeanAg), 1) : null);
  let rdInfo = (isFinite(rawBeanAg) && rawBeanAg > 0 && isFinite(rawGroundAg) && rawGroundAg > 0) ? agtronRoastDeltaInfo(rawBeanAg, rawGroundAg) : null;
  if (!rdInfo && c.roast_delta !== '' && c.roast_delta != null && isFinite(parseFloat(c.roast_delta)) && agVal != null){
    rdInfo = agtronRoastDeltaInfo(agVal - parseFloat(c.roast_delta), agVal);
  }
  let tempC = roastObj.tempC;
  if (agVal != null) tempC = clampNum(rnd((85.0 + ((clampNum(agVal, 25, 105, 60) - 28) / 72) * 12.5) * 2) / 2, 84, 98.5, 92);
  if (rdInfo && rdInfo.tempCompC) tempC = Math.max(83, tempC + rdInfo.tempCompC);
  if (isFerment(procKey) || procKey === 'black-honey') tempC = Math.max(83, tempC - 2.5);
  else if (procKey === 'natural' || isHoneyProc(procKey)) tempC = Math.max(83, tempC - 1.0);
  else if (procKey === 'unknown' && isFermentFruit) tempC = Math.max(83, tempC - 1.0);

  return {
    roastObj, roastAssumed, agtron:agVal, roastDelta:rdInfo, procObj, sp, age,
    bagNotes, isFloralTea, isChocolateNut, isFermentFruit,
    isEthLandrace:isEth, isGesha, isDecaf, tempC:r5(tempC),
    caffeineMgG:beanCaffeineMgPerG(c).mid
  };
}

function methodAdvice(coffee, now){
  const s = beanPhysicsSummary(coffee || {}, now);
  const rIdx = Math.max(0, ROASTS.findIndex(r => r.v === s.roastObj.v));
  const light = rIdx <= 2, dark = rIdx >= 4;
  const out = METHOD_PHYSICS_V6.map(m => {
    let score = 5.0;
    const whyParts = [];
    if (light && ['v60','origami','orea','pulsar','kalita','chemex','aiden','xbloom','switch'].includes(m.key)) {
      score += 1.8; whyParts.push('High thermal & filtration clarity showcases bright origin aromatics.');
    } else if (dark && ['press','nel','clever','moka','espresso','lever_espresso','philips5500','cold','phin'].includes(m.key)) {
      score += 1.8; whyParts.push('Full-bodied lipid/immersion structure rounds out dark-roast cocoa.');
    } else if (!light && !dark) {
      score += 1.2; whyParts.push('Balanced solubility suits medium-roast sweetness.');
    }
    if (s.isGesha && ['v60','origami','orea','pulsar','chemex','siphon'].includes(m.key)) { score += 0.8; whyParts.unshift('Zero-silt filtration frames delicate Gesha florals.'); }
    if (s.isFloralTea && ['v60','origami','orea','chemex','siphon'].includes(m.key)) { score += 0.4; if (!whyParts.length) whyParts.unshift('Paper/cloth clarity preserves delicate floral and tea aromatics.'); }
    if (s.isChocolateNut && ['press','kalita','nel','clever','espresso','moka'].includes(m.key)) { score += 0.3; }
    if (s.isDecaf && ['switch','clever','aeropress','kalita','pulsar'].includes(m.key)) { score += 0.7; whyParts.unshift('Steep/flat-bed control prevents porous decaf fines from stalling.'); }
    if (s.isEthLandrace && ['orea','kalita','switch','clever','pulsar'].includes(m.key)) { score += 0.5; }
    if (s.age.effectiveDays != null && s.age.effectiveDays < 6 && ['espresso','lever_espresso','philips5500'].includes(m.key)) {
      score -= 1.5; whyParts.push('Very fresh beans (<6d) carry high CO2 — rest slightly for pressure shots.');
    }
    const sc = rnd(score, 1);
    const tier = sc >= 6.4 ? 'best' : sc >= 5.2 ? 'good' : 'works';
    const tierLabel = tier === 'best' ? 'Top Match' : tier === 'good' ? 'Great Fit' : 'Compatible';
    return { key:m.key, label:m.label, score:sc, tier, tierLabel, why:whyParts[0] || m.blurb, category:m.category };
  });
  out.sort((a, b) => b.score - a.score);
  return out;
}
function methodFit(coffee, now){
  return methodAdvice(coffee, now).slice(0, 4).map(x => ({ key:x.key, label:x.label, why:x.why, score:x.score }));
}

/* ---------- Export All Canonical Symbols onto Global Scope ---------- */
const EXPORTS = {
  EPISTEMIC_TIERS_V6, EPISTEMIC_META, epistemicBadgeFor, EVD,
  ROASTS, PROCESSES, HONEY_TIERS, DENSITIES, ELEV_BANDS, SPECIES_OPTS, DECAF_PROCESSES,
  BLEND_OPTS, LEVELS, WATER_UNITS, COFFEE_UNITS, ALT_MIN_FT, ALT_MAX_FT, G_PER_OZ,
  CRYO_VAULT_EA_KJ, CRYO_SLOWDOWN_18C, storageArrheniusGamma, effectiveBeanAge,
  FILTERS_V6, FILTERS, FILTER_GROUPS, filterV6For, filterInfoFor, filtersFor,
  METHOD_PHYSICS_V6, METHODS, MACHINES, isMachine, methodPhysicsFor,
  PULSE_TASTE, PULSE_STRENGTH, ICE_SHARES, TECHNIQUES, techniquesFor,
  ratioBounds, ratioFor, boilingF,
  WATER_HELD_PER_G, RINSE_WATER_G, YIELD_TABLE, PAPER_METHODS, usesPaper, filterHeldG,
  yieldRetention, yieldCup, yieldWater, expectedYield, aboutGrams, kettleFill, yieldClean, yieldCalibrate,
  solveBidirectionalRatio, calcConcentrateDilution, calcColdBrewDilution,
  waterToG, gToWater, coffeeToG, fmtWater, fmtCoffee, tbspText,
  METHOD_TARGET_UM, BURR_ARCHETYPES_V6, burrArchetypeFor, GRINDER_CURVES, PREGROUND_PROFILES,
  GRINDERS, FLAGSHIP_GRINDERS_EXT, GRINDERS_ALL_V6, grinderFor, grindCategories, grindCategory,
  interpKnots, invertKnotsToUm, slopeAtUm,
  formatGrinderSetting, parseGrinderInput, clickFromText,
  CALIB_MAX, CALIB_CATS, calibClean, calibOffset, calibAdd, calibForget,
  grinderSettingForMicrons, micronsForGrinderSetting, grindGuide,
  WATER_IUPAC, WATER_IUPAC_V6, WATER_PRESETS_UNIFIED, WATER_PRESETS, WATER_PRESETS_16,
  WATER_PROFILES_V6, EVERYDAY_WATER_PROFILES_V6, waterProfileV6For, solveTwoBottleBlend, solveKitchenGallonWater, solveEverydayWaterRescue,
  waterPresetFor, dropsToPpm, calcWaterIonsToCaCO3, calcWaterLab, calcTapRoBlend,
  AGTRON_V6, AGTRON_SCALES, TONINO_KNOTS,
  agtronToGourmet, agtronFromGourmet, agtronConvertAll, agtronExpectedDelta,
  agtronToRoastKey, agtronDiscHex, agtronRoastDeltaInfo,
  CAF_SPECIES_MG_PER_G, CAF_BEANS, CAF_SHARE_V6, CAF_HALF, CAF_LINES, CAF_LIMITS,
  CAF_MAX_DRINKS, CAF_SCOOP_G, CAF_INSTANT, CAF_HOME_METHODS, CAF_STRENGTH,
  CAF_PODS, CAF_SHOP_SIZES, CAF_SHOT, CAF_SHOT_CAFE, CAF_SHOP, CAF_KA_FASTED, CAF_KA_FED,
  beanCaffeineMgPerG, cafShareForMethod,
  cafBatemanSingle, cafBatemanPeriodicSS, batemanAt, cafBodyAt, borbelyAlertnessAt,
  solveSafeCutoff, cafLastSafeCutoff, cafSnap,
  cafBrew, cafPod, cafShop, cafShopShots, cafEntryClean, cafEntry, caffeineClean,
  cafBedHours, cafItems, cafCurve, cafPeak, cafSleepReadyAt, cafStacksOf, cafAnalyze, cafSuggest, cafCompare,
  FRESH_WINDOWS, FRESH_WINDOWS_V2, PKG_FACTORS,
  freshMethodClass, freshWindowFor, freshWindow, freshState, freshnessFor, calcFreshnessPlan, freshMonth,
  STD_12OZ_G, costGrams, costOne, calcCostStudio, calcBulkTrapCompare, bagSide, bagVerdict,
  stepVoice, coachCues, kettleAdvice,
  beanPhysicsSummary, methodAdvice, methodFit
};
Object.keys(EXPORTS).forEach(k => { G[k] = EXPORTS[k]; });

/* Safe utility exports (won't clobber 01-schema-codecs.js if already defined) */
const SAFE_UTILS = {
  clampNum, rnd, r5, fToC, cToF, norm, escRe, labelOf, fmtTime, fmtRatio, fmtNum,
  validIsoDate, daysSinceRoast, waterToG, coffeeToG, fmtWater, fmtCoffee,
  isFerment, isHoneyProc, lev, levWithin
};
Object.keys(SAFE_UTILS).forEach(k => {
  if (typeof G[k] === 'undefined') G[k] = SAFE_UTILS[k];
});

})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
