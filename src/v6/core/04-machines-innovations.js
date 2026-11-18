(function(G){
'use strict';

if (typeof G.window === 'undefined') G.window = G;

/* ============================================================================
   BeanTelligence v6.0 — BTInnovate Hardware Synthesizers & 8 Next-Gen Engines
   File: src/v6/core/04-machines-innovations.js
   Covers:
   1. Philips 5500 LatteGo (EP5500/EP5547): 22 drinks, PH1-PH6 interlocks, SAS
   2. Fellow Aiden Dual-Basket PID & xBloom Studio (Bug C7 RPM fix, exact sum)
   3. 3-Wave Real-Time Extraction & Sweet-Spot Cut Rescue (stepExtractionWaves)
   4. Living Bag: 12.3x Cryo-Vault, Bidirectional DriftShield, OddTailRescue
   5. Barista Alchemist: Milk 55-65C, 3.1x LF SEI, Eisbock, Curdle, Paragon 48g
   6. Cross-Grinder QR Brew Passport (encodeBrewPassport / decodeAndLocalizePassport)
   7. PocketMicronLens Computer-Vision PSD (Sauvola + Ellipsoid + 3x3 Nyquist)
   Zero Unicode emojis. UTF-8 no BOM.
   ============================================================================ */

function _clamp(v, lo, hi, fb){
  const n = typeof v === 'number' ? v : parseFloat(v);
  if (!isFinite(n)) return fb !== undefined ? fb : lo;
  const c = n < lo ? lo : n > hi ? hi : n;
  return Object.is(c, -0) ? 0 : c;
}
function _rnd(n, d){
  if (!isFinite(n)) return 0;
  const m = Math.pow(10, d || 0);
  const v = Math.round(n * m) / m;
  return Object.is(v, -0) ? 0 : v;
}
function _quantHalf(v, lo, hi){
  const q = Math.round(_clamp(v, lo, hi, lo) * 2) / 2;
  return _clamp(q, lo, hi, lo);
}

/* ============================================================================
   1. SPOT-ON PHILIPS 5500 LATTEGO (EP5500 / EP5547) — 22 DRINKS & PH1-PH6
   ============================================================================ */

const SAS_DOSE_BY_STRENGTH = { 1:7.0, 2:8.2, 3:9.3, 4:10.4, 5:11.2 };
const PHILIPS_GLOBAL_TEMPS_C = { 0:0, 1:88, 2:91, 3:93 };
const PHILIPS_INCUP_TEMPS_C = { 0:0, 1:74, 2:78, 3:81 };
const PHILIPS_PROFILES = [
  { key:'blue',   label:'Blue Profile',   persistent:true },
  { key:'green',  label:'Green Profile',  persistent:true },
  { key:'yellow', label:'Yellow Profile', persistent:true },
  { key:'pink',   label:'Pink Profile',   persistent:true },
  { key:'guest',  label:'Guest (Temporary / Hold MEMO)', persistent:false }
];
const PHILIPS_GROUPS = [
  { v:'Black', label:'Black coffee' },
  { v:'Milk',  label:'Milk drinks' },
  { v:'Iced',  label:'Iced drinks' },
  { v:'Other', label:'Hot water & milk' }
];
const PHILIPS_MILKS = [
  { v:'whole',       label:'Whole milk',           tested:true,  note:'Full-fat cow milk (~4 C from fridge) builds dense, creamy LatteGo micro-foam.' },
  { v:'semi',        label:'2% (semi-skimmed)',    tested:true,  note:'Semi-skimmed cow milk (~4 C) froths reliably in the two-piece LatteGo carafe.' },
  { v:'skim',        label:'Skim milk',            tested:false, note:'Skim milk builds tall, dry protein foam with lighter mouthfeel.' },
  { v:'lactosefree', label:'Lactose-free milk',    tested:true,  note:'Hydrolyzed glucose + galactose delivers ~3.1x natural perceived sweetness without added sugar.' },
  { v:'oatbarista',  label:'Oat milk (barista)',   tested:false, note:'Dipotassium-phosphate buffered Barista Oat resists acid curdling and foams smoothly.' },
  { v:'oat',         label:'Oat milk (regular)',   tested:false, note:'Unbuffered oat milk creates looser bubbles and may feather with bright light-roast shots.' },
  { v:'soyalmond',   label:'Soy or almond milk',   tested:false, note:'Chilled soy froths richly via high protein; almond milk settles quickly and prefers <58 C.' }
];

function mkBars5(lo, hi){
  if (!lo || !hi) return null;
  const mid = Math.round((lo + hi) / 2);
  const b2 = Math.round((lo + mid) / 2);
  const b4 = Math.round((mid + hi) / 2);
  return [lo, b2, mid, b4, hi];
}

/* Complete 22-Drink EP5500/EP5547 Roster (All 21 legacy keys + 'travelmug' 240/360 mL) */
const PHILIPS_DRINKS_V6 = [
  { v:'espresso',       key:'espresso',       label:'Espresso',          group:'Black', panel:'front',   coffee:[30, 45],  water:null,       milk:null,       sb:3, iced:false, supportsExtra:true,  supports2x:true,  order:'',       none:'',      blurb:'Concentrated 30-45 mL shot with hazelnut crema.' },
  { v:'coffee',         key:'coffee',         label:'Coffee',            group:'Black', panel:'front',   coffee:[100, 180],water:null,       milk:null,       sb:3, iced:false, supportsExtra:true,  supports2x:true,  order:'',       none:'',      blurb:'Mug-sized black coffee with soft crema.' },
  { v:'americano',      key:'americano',      label:'Americano',         group:'Black', panel:'front',   coffee:[30, 45],  water:[90, 150],  milk:null,       sb:3, iced:false, supportsExtra:true,  supports2x:false, order:'',       none:'',      blurb:'Clean 30-45 mL espresso topped with fresh hot-water bypass.' },
  { v:'cappuccino',     key:'cappuccino',     label:'Cappuccino',        group:'Milk',  panel:'front',   coffee:[30, 45],  water:null,       milk:[100, 140], sb:4, iced:false, supportsExtra:true,  supports2x:false, order:'milk',   none:'',      blurb:'Warm LatteGo milk foam dispensed first, pierced by espresso.' },
  { v:'latte',          key:'latte',          label:'Latte macchiato',   group:'Milk',  panel:'front',   coffee:[30, 45],  water:null,       milk:[170, 230], sb:4, iced:false, supportsExtra:true,  supports2x:false, order:'milk',   none:'',      blurb:'Tall layered steamed milk and foam crowned with espresso.' },
  { v:'icedcoffee',     key:'icedcoffee',     label:'Iced coffee',       group:'Iced',  panel:'front',   coffee:[100, 150],water:null,       milk:null,       sb:3, iced:true,  supportsExtra:true,  supports2x:false, order:'',       none:'',      blurb:'Lower-temperature Auto Cool Pulse extraction brewed over 2/3 glass of ice.' },
  /* More Drinks Menu + Direct Utilities */
  { v:'ristretto',      key:'ristretto',      label:'Ristretto',         group:'Black', panel:'more',    coffee:[20, 25],  water:null,       milk:null,       sb:4, iced:false, supportsExtra:false, supports2x:true,  order:'',       none:'',      blurb:'Short 20-25 mL high-density pull (ExtraShot disabled on Ristretto).' },
  { v:'lungo',          key:'lungo',          label:'Espresso Lungo',    group:'Black', panel:'more',    coffee:[60, 90],  water:null,       milk:null,       sb:3, iced:false, supportsExtra:true,  supports2x:true,  order:'',       none:'',      blurb:'Extended 60-90 mL puck extraction; prefer Americano on dark roasts.' },
  { v:'crema',          key:'crema',          label:'Caffe Crema',       group:'Black', panel:'more',    coffee:[90, 140], water:null,       milk:null,       sb:3, iced:false, supportsExtra:true,  supports2x:true,  order:'',       none:'',      blurb:'Swiss-style 90-140 mL velvety long black coffee.' },
  { v:'caffelatte',     key:'caffelatte',     label:'Caffe latte',       group:'Milk',  panel:'more',    coffee:[30, 45],  water:null,       milk:[150, 210], sb:4, iced:false, supportsExtra:true,  supports2x:false, order:'coffee', none:'',      blurb:'Espresso poured first, topped with silky LatteGo milk.' },
  { v:'flatwhite',      key:'flatwhite',      label:'Flat white',        group:'Milk',  panel:'more',    coffee:[45, 60],  water:null,       milk:[85, 115],  sb:4, iced:false, supportsExtra:true,  supports2x:false, order:'milk',   none:'',      blurb:'Compact coffee-forward milk drink with strong espresso-to-milk ratio.' },
  { v:'aulait',         key:'aulait',         label:'Cafe au lait',      group:'Milk',  panel:'more',    coffee:[90, 120], water:null,       milk:[90, 120],  sb:4, iced:false, supportsExtra:true,  supports2x:false, order:'coffee', none:'',      blurb:'Equal parts long coffee and steamed milk poured coffee-first.' },
  { v:'travelmug',      key:'travelmug',      label:'Travel Mug',        group:'Black', panel:'more',    coffee:[200, 320],water:[40, 60],   milk:null,       sb:4, iced:false, supportsExtra:true,  supports2x:false, order:'',       none:'',      travelSizesMl:[240, 360], blurb:'Dedicated 240 mL / 360 mL tumbler brew cycle sized for commuter mugs.' },
  { v:'icedespresso',   key:'icedespresso',   label:'Iced espresso',     group:'Iced',  panel:'more',    coffee:[30, 40],  water:null,       milk:null,       sb:3, iced:true,  supportsExtra:true,  supports2x:false, order:'',       none:'',      blurb:'Concentrated Auto Cool Pulse espresso pulled directly over ice.' },
  { v:'icedamericano',  key:'icedamericano',  label:'Iced americano',    group:'Iced',  panel:'more',    coffee:[30, 45],  water:[90, 140],  milk:null,       sb:3, iced:true,  supportsExtra:true,  supports2x:false, order:'',       none:'',      blurb:'Cool-pulse espresso + water bypass chilled over ice.' },
  { v:'icedcrema',      key:'icedcrema',      label:'Iced caffe crema',  group:'Iced',  panel:'more',    coffee:[90, 130], water:null,       milk:null,       sb:3, iced:true,  supportsExtra:true,  supports2x:false, order:'',       none:'',      blurb:'Medium-long Auto Cool Pulse crema coffee over ice.' },
  { v:'icedlatte',      key:'icedlatte',      label:'Iced latte',        group:'Iced',  panel:'front',   coffee:[30, 45],  water:null,       milk:[120, 165], sb:3, iced:true,  supportsExtra:true,  supports2x:false, order:'milk',   none:'',      venturiWarmFoam:true, blurb:'Direct front-bezel LatteGo Venturi milk froth over ice topped with Auto Cool Pulse espresso.' },
  { v:'icedcaffelatte', key:'icedcaffelatte', label:'Iced caffe latte',  group:'Iced',  panel:'more',    coffee:[30, 45],  water:null,       milk:[135, 180], sb:3, iced:true,  supportsExtra:true,  supports2x:false, order:'coffee', none:'',      venturiWarmFoam:true, blurb:'Cool-pulse espresso over ice finished with LatteGo milk froth.' },
  { v:'icedcappuccino', key:'icedcappuccino', label:'Iced cappuccino',   group:'Iced',  panel:'more',    coffee:[30, 45],  water:null,       milk:[80, 110],  sb:3, iced:true,  supportsExtra:true,  supports2x:false, order:'milk',   none:'',      venturiWarmFoam:true, blurb:'Airy LatteGo foam over ice with cool-pulse espresso.' },
  { v:'icedaulait',     key:'icedaulait',     label:'Iced cafe au lait', group:'Iced',  panel:'more',    coffee:[90, 120], water:null,       milk:[90, 120],  sb:3, iced:true,  supportsExtra:true,  supports2x:false, order:'coffee', none:'',      venturiWarmFoam:true, blurb:'Long cool-pulse coffee and LatteGo milk over ice.' },
  { v:'froth',          key:'froth',          label:'Frothed milk',      group:'Milk',  panel:'utility', coffee:null,      water:null,       milk:[100, 160], sb:null,iced:false, supportsExtra:false, supports2x:false, order:'',       none:'milk',  blurb:'Steam-Venturi LatteGo milk foam only (zero coffee).' },
  { v:'hotwater',       key:'hotwater',       label:'Hot water',         group:'Other', panel:'utility', coffee:null,      water:[150, 250], milk:null,       sb:null,iced:false, supportsExtra:false, supports2x:false, order:'',       none:'water', blurb:'Clean hot water spout for preheating, tea, or manual bypass.' }
];

PHILIPS_DRINKS_V6.forEach(d => {
  d.id = d.key;
  d.extraOk = !!d.supportsExtra;
  d.supportsExtraShot = !!d.supportsExtra;
  d.thermalMode = d.iced ? 'auto_cool_pulse' : (d.coffee ? 'hot_global' : 'utility');
  d.coffeeBarsMl = mkBars5(d.coffee && d.coffee[0], d.coffee && d.coffee[1]);
  d.waterBarsMl = mkBars5(d.water && d.water[0], d.water && d.water[1]);
  d.milkBarsMl = mkBars5(d.milk && d.milk[0], d.milk && d.milk[1]);
});

const PHILIPS_DRINKS = PHILIPS_DRINKS_V6;
function philipsDrink(v){
  return PHILIPS_DRINKS_V6.find(x => x.v === v || x.key === v) || null;
}

/* PH2 Hardware Interlock Enforcement:
   - ExtraShot is STRICTLY DISABLED on 'ristretto', 'froth', 'hotwater'
   - ExtraShot is STRICTLY DISABLED when Pre-Ground Scoop Mode is ON
   - ExtraShot and 2x Cups are MUTUALLY EXCLUSIVE
   - ExtraShot requires Aroma Strength = 5 */
function enforcePhilipsInterlocks(st){
  st = st || {};
  const d = philipsDrink(st.drink) || PHILIPS_DRINKS_V6[0];
  st.drink = d.v;
  if (!d.coffee){
    st.scoopMode = false;
    st.extra = false;
    st.twoX = false;
    st.strength = null;
    return st;
  }
  if (!d.supports2x) st.twoX = false;
  if (st.scoopMode){
    st.extra = false;
    st.twoX = false;
  }
  if (!d.supportsExtra || st.twoX || st.cups === 2){
    st.extra = false;
  }
  st.strength = _clamp(Math.round(+st.strength || d.sb || 3), 1, 5, d.sb || 3);
  if (st.extra){
    st.strength = 5;
  }
  st.hopperStep = _clamp(Math.round(+st.hopperStep || 4), 1, 12, 4);
  st.globalTemp = _clamp(Math.round(+st.globalTemp || 2), 1, 3, 2);
  return st;
}

function philipsBarMl(bars5, barLevel){
  if (!Array.isArray(bars5) || bars5.length < 5) return 0;
  const idx = _clamp(Math.round(+barLevel || 3) - 1, 0, 4, 2);
  return bars5[idx];
}

const PHILIPS_EXTRA_ML = 25;
const PHILIPS_CUPS = [
  { k:'S',  cap:120, name:'Small',       eg:'espresso demitasse' },
  { k:'M',  cap:220, name:'Medium',      eg:'cappuccino cup' },
  { k:'L',  cap:360, name:'Large',       eg:'mug or travel tumbler' },
  { k:'XL', cap:480, name:'Extra large', eg:'tall iced latte glass' }
];

function philipsCup(d, extra){
  if (!d || d.none === 'water') return null;
  const mid = r => Math.round((r[0] + r[1]) / 2);
  const parts = [];
  const coffee = d.coffee ? { kind:'coffee', n:'Coffee', lo:d.coffee[0], hi:d.coffee[1], mid:mid(d.coffee) } : null;
  const shot = (extra && d.supportsExtra && d.coffee) ? { kind:'extra', n:'ExtraShot Ristretto', lo:PHILIPS_EXTRA_ML, hi:PHILIPS_EXTRA_ML, mid:PHILIPS_EXTRA_ML } : null;
  const milk = d.milk ? { kind:'milk', n:'Milk', lo:d.milk[0], hi:d.milk[1], mid:mid(d.milk) } : null;
  const water = (d.water && d.coffee) ? { kind:'water', n:'Hot water', lo:d.water[0], hi:d.water[1], mid:mid(d.water) } : null;
  if (d.order === 'milk') [milk, coffee, shot].forEach(x => x && parts.push(x));
  else if (d.order === 'coffee') [coffee, shot, milk].forEach(x => x && parts.push(x));
  else [coffee, shot, water, milk].forEach(x => x && parts.push(x));
  const total = parts.reduce((a, x) => a + x.hi, 0);
  const need = d.iced ? total * 2.1 : total / 0.85;
  let i = PHILIPS_CUPS.findIndex(c => c.cap >= need);
  if (i < 0) i = PHILIPS_CUPS.length - 1;
  if (d.iced) i = Math.max(i, 2);
  return { i, size:PHILIPS_CUPS[i], total, parts, iced:d.iced, foam:!!d.milk };
}

function philipsRecs(coffee, pref, now){
  const bSum = typeof G.beanPhysicsSummary === 'function' ? G.beanPhysicsSummary(coffee || {}, now) : { roastObj:{ v:'medium' }, isGesha:false, isDecaf:false };
  const r = (bSum && bSum.roastObj && bSum.roastObj.v) || 'medium';
  const rc = (r === 'ultra-light' || r === 'light' || r === 'medium-light') ? 'light' : (r === 'dark' || r === 'medium-dark') ? 'dark' : 'medium';
  const rawPref = typeof pref === 'string' ? pref.trim() : (pref && typeof pref.group === 'string' ? pref.group.trim() : 'any');
  const normGroup = /^(black|milk|iced|other)$/i.test(rawPref)
    ? (rawPref.charAt(0).toUpperCase() + rawPref.slice(1).toLowerCase())
    : 'any';
  const out = [];
  PHILIPS_DRINKS_V6.forEach(d => {
    if (!d.coffee) return;
    if (normGroup !== 'any' && d.group !== normGroup) return;
    let sc = 6;
    if (rc === 'light'){
      if (d.v === 'americano' || d.v === 'icedamericano' || d.v === 'icedcoffee') sc = 9;
      else if (d.v === 'flatwhite' || d.v === 'travelmug') sc = 7;
      else if (d.v === 'ristretto' || d.v === 'latte') sc = 3;
    } else if (rc === 'dark'){
      if (d.v === 'cappuccino' || d.v === 'latte' || d.v === 'caffelatte' || d.v === 'ristretto') sc = 9;
      else if (d.v === 'lungo') sc = 3;
    } else {
      if (d.v === 'espresso' || d.v === 'cappuccino' || d.v === 'flatwhite' || d.v === 'travelmug') sc = 8;
    }
    if (bSum.isGesha && d.milk) sc -= 2;
    const why = rc === 'light'
      ? (d.iced ? 'Auto Cool Pulse extraction over ice keeps bright fruit crisp at Strength 3.' : 'Clean hot-water bypass opens dense light-roast aromatics without bitter puck channeling.')
      : rc === 'dark'
      ? (d.milk ? 'Rich dark-roast crema cuts through velvety LatteGo milk foam.' : 'Short concentrated pull captures cocoa body before harsh phenylindanes elute.')
      : 'Balanced caramel sweetness and crema matched to medium-roast solubility.';
    out.push({ drink:d, score:sc, why });
  });
  out.sort((a, b) => b.score - a.score);
  return out.slice(0, 4);
}

function philipsSetup(coffee, sel, now){
  sel = Object.assign({}, sel || {});
  const d = philipsDrink(sel.drink) || philipsDrink('cappuccino');
  const bSum = typeof G.beanPhysicsSummary === 'function' ? G.beanPhysicsSummary(coffee || {}, now) : { roastObj:{ v:'medium' }, age:{ effectiveDays:12 } };
  const roast = bSum.roastObj.v || 'medium';
  const light = roast === 'ultra-light' || roast === 'light' || roast === 'medium-light';
  const dark = roast === 'dark' || roast === 'medium-dark';

  const st = enforcePhilipsInterlocks({
    drink:d.v,
    strength:sel.strength,
    extra:!!sel.extra,
    twoX:!!sel.twoX || sel.cups === 2,
    scoopMode:!!sel.scoopMode || !!sel.scoop,
    hopperStep:sel.hopperStep || 4,
    globalTemp:sel.temp || sel.globalTemp
  });

  let recStrength = d.sb || 3;
  if (!d.iced && light) recStrength = Math.min(5, recStrength + 1);
  else if (!d.iced && roast === 'dark') recStrength = Math.max(1, recStrength - 1);

  const recTempLevel = light ? 3 : roast === 'dark' ? 1 : 2;
  const rawTempIn = sel.temp != null ? +sel.temp : (sel.globalTemp != null ? +sel.globalTemp : NaN);
  const useStrength = d.coffee ? (st.scoopMode ? 3 : (sel.strength != null && isFinite(+sel.strength) ? st.strength : recStrength)) : null;
  const useTempLevel = d.iced ? null : (isFinite(rawTempIn) && rawTempIn >= 1 ? _clamp(Math.round(rawTempIn), 1, 3, recTempLevel) : recTempLevel);

  /* PH3 & PH4 Authentic Firmware Thermal & Venturi Guidance */
  const activeT = useTempLevel || recTempLevel;
  const thermalWhy = d.iced
    ? 'Iced Auto Cool Pulse active (~76-82 C slow pulse): EP5500 firmware automatically overrides global Menu Temperature on all Iced drinks.'
    : (activeT === 3
        ? 'Global Menu Temp High (Level 3, ~93 C) boosts thermal diffusivity on dense lighter roasts.'
        : activeT === 1
        ? 'Global Menu Temp Low (Level 1, ~88 C) suppresses bitter phenylindanes on dark roasts.'
        : 'Global Menu Temp Medium (Level 2, ~91 C) balances sweetness and crema.');

  const venturiHackNote = d.venturiWarmFoam
    ? 'LatteGo Steam-Venturi Physics: milk froth dispenses warm (~56-60 C) even on Iced Milk icons, melting extra ice. For zero-melt ultra-cold texture, use the Cold-Milk Barista Hack: pour 4 C fridge milk directly over ice and brew Iced Espresso on top!'
    : '';

  const ceramicGuard = {
    range:[1, 12],
    recommendedBand:light ? [2, 3] : dark ? [5, 7] : [3, 5],
    safetyRule:'ADJUST MAX 1 NOTCH AT A TIME ONLY WHILE THE CERAMIC GRINDER IS ACTIVELY RUNNING. Never turn the hopper knob while idle!',
    sasShotsToSettle:4,
    sasNote:'Allow 3-5 consecutive shots after any bean or burr change for Philips SAS self-adjusting dose control to converge.'
  };

  const mk = PHILIPS_MILKS.find(x => x.v === (sel.milk || sel.milkType)) || PHILIPS_MILKS[0];
  const steps = [];
  steps.push(d.none ? 'Fill tank with carbon-filtered water.' : 'Fill hopper with dry non-oily whole beans and tank with filtered water (~40-70 ppm KH).');
  if (d.iced) steps.push('Fill a tall glass 2/3 full (~140-160 g) with large freezer ice cubes.');
  if (d.milk) steps.push(sel.coldMilkHack && d.venturiWarmFoam
    ? 'Cold-Milk Barista Hack: Pour chilled (~4 C) ' + mk.label.toLowerCase() + ' straight over ice, then run Iced Espresso on top.'
    : 'Pour cold (~4 C) ' + mk.label.toLowerCase() + ' into the two-piece LatteGo carafe and click onto front mount.');
  if (d.coffee){
    steps.push('Select ' + d.label + ' (' + (d.panel === 'front' ? 'Front Touch Icon' : 'More Drinks Menu') + '). ' +
      (st.scoopMode ? 'Pre-ground Scoop Mode active (1 level scoop in bypass chute; ExtraShot & 2x disabled).' : ('Set Aroma Strength ' + useStrength + (st.extra ? ' + ExtraShot (+25 mL Ristretto)' : '') + (st.twoX ? ' (2x Cups)' : '') + '.')) +
      (d.iced ? ' Firmware runs Auto Cool Pulse automatically.' : (' Verify Settings \u2192 Temperature is Level ' + useTempLevel + ' (' + PHILIPS_GLOBAL_TEMPS_C[useTempLevel] + ' C).')));
  }

  return {
    drink:d,
    panel:d.panel,
    profile:PHILIPS_PROFILES.find(p => p.key === (sel.profile || 'blue')) || PHILIPS_PROFILES[0],
    milkType:d.milk ? mk : null,
    roast,
    noCoffee:!d.coffee,
    extraOn:!!st.extra,
    twoX:!!st.twoX,
    scoopMode:!!st.scoopMode,
    thermalMode:d.thermalMode,
    estimatedBrewTempC:d.iced ? 75 : (PHILIPS_GLOBAL_TEMPS_C[useTempLevel] || 91),
    recommendedIceG:d.venturiWarmFoam ? 160 : (d.iced ? 120 : 0),
    rec:{ strength:recStrength, temp:d.iced ? null : recTempLevel },
    use:{ strength:useStrength, temp:useTempLevel },
    why:{ strength:'SAS dose ~' + (SAS_DOSE_BY_STRENGTH[useStrength || 3] || 9.3) + ' g' + (st.extra ? ' + ~7.5 g ExtraShot cycle' : '') + '.', temp:thermalWhy },
    venturiHackNote,
    grind:ceramicGuard,
    targets:{ coffee:d.coffee, water:d.water, milk:d.milk },
    cup:philipsCup(d, st.extra),
    steps,
    warnings:venturiHackNote ? [{ level:'tip', head:'Venturi Iced Milk Physics', tag:'p', text:venturiHackNote }] : []
  };
}

function philipsMeasure(range, measured){
  const v = parseFloat(measured);
  if (!(v > 0) || !range) return null;
  const lo = range[0], hi = range[1];
  if (v >= lo && v <= hi) return { status:'in', text:v + ' mL sits right inside the ' + lo + '-' + hi + ' mL target window.' };
  if (v > hi) return { status:'over', diff:Math.round(v - hi), text:v + ' mL is ~' + Math.round(v - hi) + ' mL high. Step volume down 1 bar.' };
  return { status:'under', diff:Math.round(lo - v), text:v + ' mL is ~' + Math.round(lo - v) + ' mL low. Step volume up 1 bar.' };
}

/* PH3-Safe philipsFix: NEVER recommends Global Menu Temperature when drink is Iced! */
function philipsFix(sym, used, ctx){
  used = used || { strength:3, temp:2 };
  ctx = ctx || {};
  const d = philipsDrink(ctx.drink) || {};
  const isIced = !!d.iced || !!ctx.iced;
  const sCur = _clamp(+used.strength || 3, 1, 5, 3);
  const tCur = _clamp(+used.temp || 2, 1, 3, 2);

  if (sym === 'sour'){
    if (!isIced && tCur < 3){
      return {
        primary:'Raise Global Menu Temperature to Level ' + (tCur + 1) + ' (' + PHILIPS_GLOBAL_TEMPS_C[tCur + 1] + ' C).',
        why:'Dense beans under-extracted in short super-auto contact; hotter water accelerates pore diffusion.',
        secondary:'Still sour? Step coffee volume down 1 bar or turn ceramic burr 1 notch FINER ONLY WHILE GRINDING (wait 3-5 SAS shots).',
        change:{ strength:0, temp:1 }
      };
    }
    return {
      primary:isIced
        ? 'Iced drinks use fixed Auto Cool Pulse temp: step coffee volume down 1 bar or turn ceramic burr 1 notch FINER ONLY WHILE GRINDING.'
        : 'Menu Temp is already High (3): turn ceramic burr 1 notch FINER ONLY WHILE ACTIVELY GRINDING.',
      why:'Increases particle surface area and slows puck flow to lift extraction yield.',
      secondary:'Brew 3-5 shots after a burr click so Philips SAS dose adaptation stabilizes.',
      change:{ strength:0, temp:0 }
    };
  }
  if (sym === 'bitter' || sym === 'burnt'){
    if (!isIced && tCur > 1){
      return {
        primary:'Lower Global Menu Temperature to Level ' + (tCur - 1) + ' (' + PHILIPS_GLOBAL_TEMPS_C[tCur - 1] + ' C).',
        why:'Cooler brew water throttles high-Ea (48 kJ/mol) bitter phenylindanes and chlorogenic lactones.',
        secondary:'Prefer Americano (clean bypass) over Lungo, or turn ceramic burr 1 notch COARSER while grinding.',
        change:{ strength:0, temp:-1 }
      };
    }
    return {
      primary:'Lower Aroma Strength to ' + Math.max(1, sCur - 1) + ' or turn ceramic burr 1 notch COARSER ONLY WHILE GRINDING.',
      why:'Reduces dissolved bitter solids concentration and puck residence time.',
      secondary:'Switch Lungo to Americano if brewing dark roasts.',
      change:{ strength:-1, temp:0 }
    };
  }
  if (sym === 'astringent' || sym === 'muddy'){
    return {
      primary:'Turn ceramic burr 1 notch COARSER ONLY WHILE ACTIVELY GRINDING, and switch Lungo to Americano.',
      why:'Coarser grind reduces <60 um fines carryover and localized puck channeling.',
      secondary:'Rinse removable brew group under lukewarm tap water.',
      change:{ strength:0, temp:0 }
    };
  }
  if (sym === 'flat' || sym === 'thin' || sym === 'weak'){
    return {
      primary:sCur < 5
        ? ('Raise Aroma Strength to Level ' + (sCur + 1) + ' (~' + SAS_DOSE_BY_STRENGTH[sCur + 1] + ' g SAS dose).')
        : (d.supportsExtra ? 'Enable ExtraShot (+25 mL Ristretto cycle) or shorten coffee volume 1 bar.' : 'Shorten coffee volume 1 bar to concentrate TDS.'),
      why:'Higher coffee-to-water dose ratio directly increases cup TDS and crema viscosity.',
      secondary:'Ensure hopper beans are within 7-28 days off roast.',
      change:{ strength:sCur < 5 ? 1 : 0, temp:0 }
    };
  }
  if (sym === 'strong'){
    return {
      primary:'Lower Aroma Strength to Level ' + Math.max(1, sCur - 1) + ' or raise water/milk volume 1 bar.',
      why:'Dilutes beverage TDS while keeping balanced extraction flavor.',
      secondary:'',
      change:{ strength:-1, temp:0 }
    };
  }
  return {
    primary:'Allow 3-5 consecutive shots for Philips SAS self-adaptation to lock in, or hold settings steady.',
    why:'Changing settings every single cup fights the SAS volumetric dosing controller.',
    secondary:'',
    change:{ strength:0, temp:0 }
  };
}

/* PH6 Non-Empty Physical Machine Snapshot for Journal / CSV / Palate Twin */
function snapshotMachine(machineState, coffee){
  const m = enforcePhilipsInterlocks(Object.assign({}, machineState || {}));
  const d = philipsDrink(m.drink) || PHILIPS_DRINKS_V6[0];
  const baseDose = d.coffee ? (m.scoopMode ? 8.5 : (SAS_DOSE_BY_STRENGTH[m.strength || 3] || 9.3)) : 0;
  const extraDose = (d.coffee && m.extra) ? 7.4 : 0;
  const mult2x = (d.coffee && m.twoX) ? 2 : 1;
  const doseG = _rnd((baseDose + extraDose) * mult2x, 1);

  const cMl = d.v === 'travelmug'
    ? (m.travelSizeMl === 360 ? 300 : 200)
    : (d.coffeeBarsMl ? philipsBarMl(d.coffeeBarsMl, m.coffeeBar || 3) : 0);
  const wMl = d.v === 'travelmug'
    ? (m.travelSizeMl === 360 ? 60 : 40)
    : (d.waterBarsMl ? philipsBarMl(d.waterBarsMl, m.waterBar || 3) : 0);
  const mMl = d.milkBarsMl ? philipsBarMl(d.milkBarsMl, m.milkBar || 3) : 0;
  const extraMl = (d.coffee && m.extra) ? PHILIPS_EXTRA_ML : 0;

  const coffeeAndWaterMl = (cMl + extraMl + wMl) * mult2x;
  const recommendedIceG = d.venturiWarmFoam ? 160 : (d.iced ? 120 : 0);
  const bevMl = coffeeAndWaterMl + mMl;
  const tempC = d.iced ? 75 : (PHILIPS_GLOBAL_TEMPS_C[m.globalTemp || 2] || 91);
  const inCupTempC = d.iced ? 8 : (PHILIPS_INCUP_TEMPS_C[m.globalTemp || 2] || 78);
  const tempF = Math.round(tempC * 9 / 5 + 32);
  const ratio = doseG > 0 ? _rnd(coffeeAndWaterMl / doseG, 2) : 0;
  const grindSetting = 'Ceramic Step ' + (m.hopperStep || 4) + '/12';
  const detail = [
    d.label,
    d.coffee ? (m.scoopMode ? 'pre-ground scoop' : ('strength ' + m.strength + (m.extra ? ' + ExtraShot' : '') + (m.twoX ? ' (2x)' : ''))) : 'utility',
    d.iced ? ('Auto Cool Pulse + ' + recommendedIceG + 'g ice') : ('temperature ' + (m.globalTemp || 2) + ' (' + tempC + ' C)'),
    grindSetting,
    bevMl + ' mL'
  ].join(', ');

  return {
    ok:true,
    machine:'philips5500',
    brew_method:'Philips 5500 LatteGo',
    drinkKey:d.v,
    drinkLabel:d.label,
    panel:d.panel,
    profile:m.profile || 'blue',
    doseG,
    waterG:coffeeAndWaterMl,
    milkMl:mMl,
    recommendedIceG,
    bevMl,
    ratio,
    tempC,
    inCupTempC,
    tempF,
    thermalMode:d.thermalMode,
    grindSetting,
    hopperStep:m.hopperStep || 4,
    strength:m.strength,
    extraShot:!!m.extra,
    twoX:!!m.twoX,
    scoopMode:!!m.scoopMode,
    brew_technique_detail:detail
  };
}

function philipsWarnings(coffee, state){
  const c = coffee || {}, st = state || {};
  const warns = [];
  const txt = String((c.name || '') + ' ' + (c.notes || '') + ' ' + (c.process_details || '')).toLowerCase();
  if (/caramelized|torrefacto|sugar[-\s]*coated|flavored|hazelnut\s*syrup|vanilla\s*syrup/i.test(txt)){
    warns.push({ id:'hopper_hazard', severity:'critical', text:'NEVER put caramelized, sugar-coated, or syrup-flavored beans in the Philips ceramic hopper — sticky coatings gum up the flat ceramic burrs and void warranty. Use whole unflavored beans or a single pre-ground scoop in the bypass chute.' });
  }
  if ((c.roast === 'dark' || (+c.ground_agtron > 0 && +c.ground_agtron < 38)) && !st.scoopMode){
    warns.push({ id:'oily_beans', severity:'warn', text:'Heavy surface-oiled dark roasts can coat the hopper sensor and slow bean feed — wipe the hopper weekly with a dry paper towel and avoid setting the ceramic burr below step 3.' });
  }
  if (st.drink === 'lungo' && (c.roast === 'dark' || c.roast === 'medium-dark')){
    warns.push({ id:'lungo_dark', severity:'tip', text:'On medium-dark/dark beans, Americano (short shot + clean hot-water bypass) tastes much sweeter and less woody than running 80+ mL Lungo water through spent grounds.' });
  }
  const age = typeof G.effectiveBeanAge === 'function' ? G.effectiveBeanAge(c) : null;
  if (age && age.effectiveDays != null && age.effectiveDays < 5){
    warns.push({ id:'fresh_co2', severity:'tip', text:'Beans <5 days off roast hold excess CO2 gas that can make super-auto crema bubbly and under-extracted; resting to Day 6-10 improves sweetness.' });
  }
  const d = philipsDrink(st.drink);
  if (d && d.iced){
    warns.push({ id:'ice_fill', severity:'info', text:'Fill glass with ~' + (d.venturiWarmFoam ? '160 g' : '120 g') + ' freezer ice cubes BEFORE pressing Start (' + (d.venturiWarmFoam ? 'LatteGo dispenses warm steam-Venturi foam that melts ~40 g extra ice' : 'Auto Cool Pulse brews cooler and slower directly onto ice') + ').' });
  }
  return warns;
}

function aquaCleanStatus(cupsLogged, filterNumber, waterKhPpm){
  if (cupsLogged && typeof cupsLogged === 'object'){
    const o = cupsLogged;
    waterKhPpm = o.waterKhPpm != null ? o.waterKhPpm : o.kh;
    filterNumber = o.filterNumber != null ? o.filterNumber : o.filterNum;
    cupsLogged = o.cupsLogged != null ? o.cupsLogged : (o.shotsSinceFilter != null ? o.shotsSinceFilter : o.cups);
  }
  const cups = Math.max(0, Math.round(+cupsLogged || 0));
  const fNum = _clamp(Math.round(+filterNumber || 1), 1, 8, 1);
  const kh = _clamp(+waterKhPpm || 60, 0, 350, 60);
  const capPerFilter = kh > 140 ? 450 : kh > 80 ? 600 : 650;
  const totalNoDescaleCap = 5000;
  const cupsOnCurrentFilter = cups % capPerFilter;
  const pctFilterRemaining = Math.max(0, Math.round(100 * (1 - cupsOnCurrentFilter / capPerFilter)));
  const cupsUntilFilterSwap = Math.max(0, capPerFilter - cupsOnCurrentFilter);
  const descaleDue = fNum > 8 || cups >= totalNoDescaleCap;
  return {
    ok:true,
    cupsLogged:cups,
    filterNumber:fNum,
    maxFiltersBeforeDescale:8,
    totalNoDescaleCap,
    capPerFilter,
    pctFilterRemaining,
    pctRemaining:pctFilterRemaining,
    cupsUntilFilterSwap,
    descaleDue,
    brewGroupCare:[
      'Weekly: Slide out removable brew group, rinse under lukewarm tap water ONLY (no soap), and air-dry.',
      'Monthly / 500 cups: Run 1 Philips coffee-oil remover tablet and apply thin food-grade silicone grease to brew-group piston rails & O-ring.',
      'After every milk drink: Rinse 2-piece tubeless LatteGo carafe for 15 seconds under tap or place on top rack of dishwasher.'
    ]
  };
}
const cleanMachine = aquaCleanStatus;

/* ============================================================================
   2. FELLOW AIDEN DUAL-BASKET PID & XBLOOM STUDIO (FIXES BUG C7 RPM SCIENCE!)
   ============================================================================ */

function quantizeXBloomTemp(tempVal){
  if (tempVal === 'RT' || tempVal === 'rt') return 'RT';
  if (tempVal === 'BP' || tempVal === 'bp') return 'BP';
  const c = parseFloat(tempVal);
  if (!isFinite(c) || c <= 30) return 'RT';
  if (c >= 96.5) return 'BP';
  return Math.max(40, Math.min(95, Math.round(c)));
}

/* Exact Integer Largest-Remainder Pour Rebalancer: guarantees sum(V_k) === round(D * R)! */
function rebalanceXBloomPours(pours, doseG, ratio){
  const safeDose = _clamp(doseG, 4, 60, 15);
  const safeRatio = _clamp(ratio, 6, 25, 16);
  const targetMl = Math.max(30, Math.min(500, Math.round(safeDose * safeRatio)));
  const src = Array.isArray(pours) && pours.length ? pours : [{ volumeMl:targetMl, temp:93, pattern:'spiral', flowRateMls:3.3, pauseS:0, agitation:'none' }];
  const minFloor = Math.min(10, Math.max(1, Math.floor(targetMl / src.length)));
  const rawSum = src.reduce((a, p) => a + Math.max(1, _clamp(p && p.volumeMl, 1, 500, 1)), 0);
  const exact = src.map(p => (Math.max(1, _clamp(p && p.volumeMl, 1, 500, 1)) / Math.max(1, rawSum)) * targetMl);
  const ints = exact.map(v => Math.max(minFloor, Math.floor(v)));
  let diff = targetMl - ints.reduce((a, v) => a + v, 0);

  /* Distribute exact integer remainder across pours ranked by fractional part */
  const order = exact.map((v, i) => ({ i, rem:v - Math.floor(v) })).sort((a, b) => b.rem - a.rem);
  let ptr = 0;
  while (diff !== 0 && ptr < 400){
    const idx = order[ptr % order.length].i;
    if (diff > 0){
      ints[idx] += 1;
      diff -= 1;
    } else if (ints[idx] > minFloor){
      ints[idx] -= 1;
      diff += 1;
    }
    ptr++;
  }
  const out = src.map((p, idx) => Object.assign({}, p, { volumeMl:ints[idx], index:idx + 1 }));
  return { targetMl, sumMl:ints.reduce((a, v) => a + v, 0), pours:out };
}

function synthesizeAidenProfile(bean, recipe, adapt, batch){
  if (bean && !recipe && !batch && (bean.waterMl || bean.waterG || bean.water || bean.coffee || bean.bean)){
    batch = bean;
    recipe = bean;
    bean = bean.coffee || bean.bean || {};
  }
  const c = bean || {};
  const b = batch || {};
  const r = recipe || {};
  const bSum = typeof G.beanPhysicsSummary === 'function' ? G.beanPhysicsSummary(c) : { roastObj:{ v:c.roast || 'medium' }, agtron:65, isDecaf:c.decaf === 'yes', isEthLandrace:false };
  const roast = bSum.roastObj.v || 'medium';
  const agtron = bSum.agtron != null ? bSum.agtron : 65;
  const isDark = roast === 'dark' || roast === 'medium-dark' || agtron < 50;

  const elevM = _clamp(b.altitudeM != null ? b.altitudeM : (b.altitudeFt ? +b.altitudeFt * 0.3048 : 0), -430, 5500, 0);
  const boilC = G.BTCoreV6 ? G.BTCoreV6.thermo.boilingPointC(elevM) : 100.0;
  const maxPidC = _quantHalf(Math.min(99.0, boilC - 0.5), 50.0, 99.0);

  const styleKey = String(b.style || (r.style && r.style.key) || 'aiden_declining');
  const isIced = styleKey === 'aiden_flash_iced' || b.tech === 'flash';
  const drinkRatio = _quantHalf(+r.ratio > 0 ? +r.ratio : (+b.ratio > 0 ? +b.ratio : 16.5), 14.0, 20.0);
  const firmwareRatio = isIced ? 14.0 : drinkRatio;

  const rawWater = _clamp(Math.round(+r.waterMl || +r.waterG || +r.water || +b.waterMl || +b.water || 300), 150, 1500, 300);
  const totalBeverageWaterG = isIced ? Math.max(240, rawWater) : rawWater;
  const iceG = isIced ? Math.round(totalBeverageWaterG * 0.375) : 0;
  const waterMl = isIced ? _clamp(totalBeverageWaterG - iceG, 150, 1500, 200) : rawWater;

  /* Dual-Basket Geometry Threshold: <= 450 mL Green SS Cone vs > 450 mL Blue Batch Flat (62 cm^2) */
  const basketMode = (waterMl <= 450 && b.aidenBasket !== 'batch') ? 'ss' : 'batch';
  const doseG = _rnd(totalBeverageWaterG / drinkRatio, 1);
  const maxSafeDose = basketMode === 'ss' ? (isDark ? 26 : 30) : (isDark ? 75 : 85);
  const overflowWarning = doseG > maxSafeDose
    ? ('Dry-dose overflow guard: ' + doseG + ' g exceeds safe ' + maxSafeDose + ' g limit for ' + (basketMode === 'ss' ? 'Green SS Cone (switch to Blue Batch Basket)' : 'Blue Batch Flat Basket') + '.')
    : '';

  const baseTemp = +r.tempC > 0 ? +r.tempC : (94.0 - (isDark ? 6.0 : 0.0) - 1.5);
  const tPeak = _quantHalf(baseTemp, 50.0, maxPidC);
  const bloomRatio = _quantHalf(isIced ? 3.0 : (bSum.isDecaf || isDark ? 2.0 : 3.0), 1.0, 3.0);
  const bloomDuration = Math.round(isIced ? 45 : styleKey === 'aiden_samo_bloom' ? 50 : 38);
  const bloomTemperature = styleKey === 'aiden_samo_bloom' ? 60.0 : tPeak;

  const dropC = styleKey === 'aiden_balanced'
    ? 0.5
    : _quantHalf((isDark ? 4.5 : 2.5) + (bSum.isDecaf ? 2.0 : 0) + (bSum.roastDelta && bSum.roastDelta.delta >= 12 ? 2.0 : 0), 0.5, 9.0);

  const buildStaircase = n => {
    const arr = [];
    for (let k = 0; k < n; k++){
      const frac = n === 1 ? 0 : (k / (n - 1));
      arr.push(_quantHalf(tPeak - dropC * frac, 50.0, maxPidC));
    }
    return arr;
  };

  const ssPulsesNumber = isIced ? 4 : (isDark || bSum.isDecaf || bSum.isEthLandrace ? 2 : 3);
  const ssPulsesInterval = (bSum.isDecaf || bSum.isEthLandrace) ? 26 : 22;
  const ssPulseTemperatures = buildStaircase(ssPulsesNumber);

  const batchPulsesNumber = waterMl > 1100 || isDark ? 1 : (waterMl > 750 ? 2 : 3);
  const batchPulsesInterval = 30;
  const batchPulseTemperatures = buildStaircase(batchPulsesNumber);

  const activePulsesNumber = basketMode === 'ss' ? ssPulsesNumber : batchPulsesNumber;
  const activePulsesInterval = basketMode === 'ss' ? ssPulsesInterval : batchPulsesInterval;
  const activePulseTemperatures = basketMode === 'ss' ? ssPulseTemperatures : batchPulseTemperatures;
  const d50Um = basketMode === 'ss'
    ? Math.round((580 * Math.pow(waterMl / 300, 0.20) * (bSum.isDecaf ? 1.08 : 1.0)) / 5) * 5
    : Math.round((860 * Math.pow(waterMl / 750, 0.25) * (bSum.isDecaf ? 1.08 : 1.0)) / 5) * 5;

  const title = ('BT ' + (c.name ? String(c.name).trim().slice(0, 20) : roast) + (isIced ? ' Iced' : ' PID')).slice(0, 35);
  const json = {
    profileType:0,
    title,
    ratio:firmwareRatio,
    bloomEnabled:true,
    bloomRatio,
    bloomDuration,
    bloomTemperature,
    ssPulsesEnabled:ssPulsesNumber > 1,
    ssPulsesNumber,
    ssPulsesInterval,
    ssPulseTemperatures,
    batchPulsesEnabled:batchPulsesNumber > 1,
    batchPulsesNumber,
    batchPulsesInterval,
    batchPulseTemperatures
  };

  return {
    brewer:'aiden',
    title,
    styleKey,
    basket:basketMode,
    basketMode,
    basketAreaCm2:basketMode === 'ss' ? 24.5 : 62.0,
    basketLabel:basketMode === 'ss' ? 'Green Single-Serve Cone (<=450 mL)' : 'Blue Batch Flat Basket (>450 mL, 62 cm2)',
    showerhead:basketMode === 'ss' ? '1-Dot Green (Single-Serve)' : '3-Dot Blue (Batch)',
    waterMl,
    bloomWaterMl:Math.round(doseG * bloomRatio),
    perPulseWaterMl:Math.round(Math.max(0, waterMl - doseG * bloomRatio) / Math.max(1, activePulsesNumber)),
    retentionPerG:2.10,
    iceG,
    totalBeverageWaterG,
    doseG,
    d50Um,
    ratio:firmwareRatio,
    drinkRatio,
    bloomRatio,
    bloomDuration,
    bloomTemperature,
    activePulsesNumber,
    activePulsesInterval,
    activePulseTemperatures,
    ssPulsesNumber,
    ssPulsesInterval,
    ssPulseTemperatures,
    batchPulsesNumber,
    batchPulsesInterval,
    batchPulseTemperatures,
    overflowWarning,
    totalSecs:basketMode === 'ss' ? 185 : 265,
    summaryText:(basketMode === 'ss' ? 'Green SS Cone' : 'Blue Batch Flat') + ' · 1:' + firmwareRatio + ' · Bloom 1:' + bloomRatio + ' @ ' + bloomTemperature + ' C · Pulses: ' + activePulseTemperatures.join('\u2192') + ' C',
    json
  };
}

function synthesizeXBloomProfile(bean, recipe, adapt, batch){
  if (bean && !recipe && !batch && (bean.recipeId || bean.style || bean.doseG || bean.waterG || bean.coffee || bean.bean)){
    batch = bean;
    recipe = bean;
    bean = bean.coffee || bean.bean || {};
  }
  const c = bean || {};
  const b = batch || {};
  const r = recipe || {};
  const bSum = typeof G.beanPhysicsSummary === 'function' ? G.beanPhysicsSummary(c) : { roastObj:{ v:c.roast || 'medium' }, agtron:65, isDecaf:c.decaf === 'yes', isEthLandrace:false, isGesha:false };
  const roast = bSum.roastObj.v || 'medium';
  const agtron = bSum.agtron != null ? bSum.agtron : 65;
  const isDark = roast === 'dark' || roast === 'medium-dark' || agtron < 50;
  const isFermented = typeof G.isFerment === 'function' && G.isFerment(c.process || '');

  const model = String(b.xbModel || 'studio').toLowerCase() === 'original' ? 'original' : 'studio';
  const rawVessel = String(b.xbVessel || b.vessel || 'omni2').toLowerCase();
  const vessel = (rawVessel === 'xpod' || rawVessel === 'third_party') ? rawVessel : 'omni2';
  const agitationLockedOff = vessel === 'third_party';

  const styleKey = String(b.style || b.recipeId || (r.style && r.style.key) || r.recipeId || 'xb_clarity_3p');
  const isIced = styleKey === 'xb_iced' || b.tech === 'flash';
  const defaultRatio = styleKey === 'xb_hyperflow_body' ? 15.5 : 16.0;
  const totalRatio = _quantHalf(+r.ratio > 0 ? +r.ratio : (+b.ratio > 0 ? +b.ratio : defaultRatio), 10.0, 20.0);
  const machinePourRatio = isIced ? _quantHalf(Math.max(10.0, totalRatio * 0.625), 10.0, 15.0) : totalRatio;

  const maxDose = vessel === 'xpod' ? 16.0 : vessel === 'omni2' ? 20.0 : 25.0;
  let doseG = _clamp(_rnd(+r.doseG || +r.dose || +b.dose || 15.0, 1), 8.0, maxDose, 15.0);
  if (Math.round(doseG * machinePourRatio) > 500){
    doseG = _rnd(Math.floor((500 / machinePourRatio) * 10) / 10, 1);
  }
  const targetPourMl = Math.round(doseG * machinePourRatio);
  const iceG = isIced ? Math.max(40, Math.round(doseG * totalRatio) - targetPourMl) : 0;

  /* FIXES BUG C7: xBloom Studio 48mm Conical RPM Physics!
     - 60-70 RPM: Low-fines clarity & gentle feed for Ethiopian landraces, Decaf, Dark roasts, Ferments & Clarity profiles!
     - 80-90 RPM: Balanced sweetness & clarity for Medium / Honey / Natural lots!
     - 100-120 RPM: Higher fine surface area & body/sweetness boost on fast-draining washed lots when body is requested! */
  let grindRpm = null;
  let rpmWhy = 'xBloom Original fixed ~85 RPM drive.';
  if (model === 'studio'){
    const wantsBody = styleKey === 'xb_hyperflow_body' || b.goal === 'body';
    const needsLowFinesClarity = bSum.isEthLandrace || bSum.isDecaf || isDark || isFermented || bSum.isGesha || styleKey === 'xb_clarity_3p' || b.goal === 'clarity';
    if (b.grindRpm != null && isFinite(+b.grindRpm)){
      grindRpm = _clamp(Math.round(+b.grindRpm / 10) * 10, 60, 120, 80);
    } else if (needsLowFinesClarity && !wantsBody){
      grindRpm = (bSum.isDecaf || isDark || bSum.isEthLandrace) ? 60 : 70;
    } else if (wantsBody && !bSum.isDecaf && !isDark && !bSum.isEthLandrace){
      grindRpm = roast === 'ultra-light' || roast === 'light' ? 110 : 100;
    } else {
      grindRpm = 80;
    }
    rpmWhy = grindRpm <= 70
      ? (grindRpm + ' RPM low-fines clarity shear: slower burr feed minimizes secondary bean shatter and <60 um micro-fines on Ethiopian, Decaf, Dark, and high-clarity pours.')
      : grindRpm >= 100
      ? (grindRpm + ' RPM high-surface-area shear: generates slightly more fine surface area to boost body and sweetness on fast-draining washed coffees.')
      : (grindRpm + ' RPM balanced conical feed for medium texture and sweet fruit clarity.');
  }

  const d50Um = _clamp(+r.d50Um || +r.grindUm || (isIced ? 535 : 600), 350, 980, 600);
  const stCurve = typeof G.grinderSettingForMicrons === 'function' ? G.grinderSettingForMicrons('xbloom-studio', d50Um, 'xbloom') : null;
  const ogCurve = typeof G.grinderSettingForMicrons === 'function' ? G.grinderSettingForMicrons('xbloom-original', d50Um, 'xbloom') : null;
  const studioStep = (stCurve && stCurve.clicks != null) ? Math.round(stCurve.clicks) : _clamp(Math.round(18 + (d50Um - 350) * (58 / 550)), 1, 80, 45);
  const originalStep = (ogCurve && ogCurve.clicks != null) ? Math.round(ogCurve.clicks) : _clamp(Math.round((studioStep - 28) / 1.65), 1, 30, 12);
  const grindStep = model === 'studio' ? studioStep : originalStep;

  const peakC = _clamp(+r.tempC || (isDark ? 87 : 93), 40, 98, 93);
  const dropC = (bSum.isDecaf || isDark || isFermented) ? 4.0 : 2.0;
  const safeShake = val => agitationLockedOff ? 'none' : val;

  const vBloom = Math.round(Math.min(targetPourMl * 0.32, doseG * 3.0));
  const rem = Math.max(20, targetPourMl - vBloom);
  let rawPours;
  if (styleKey === 'xb_samo_declining'){
    rawPours = [
      { volumeMl:vBloom, temp:'RT', pattern:'spiral', flowRateMls:3.3, pauseS:42, agitation:safeShake('after') },
      { volumeMl:Math.round(rem * 0.52), temp:quantizeXBloomTemp(peakC), pattern:'spiral', flowRateMls:3.2, pauseS:16, agitation:'none' },
      { volumeMl:rem - Math.round(rem * 0.52), temp:quantizeXBloomTemp(peakC - dropC), pattern:'center', flowRateMls:3.0, pauseS:0, agitation:'none' }
    ];
  } else if (styleKey === 'xb_hyperflow_body'){
    const pBody = Math.round(rem / 3);
    rawPours = [
      { volumeMl:vBloom, temp:quantizeXBloomTemp(peakC), pattern:'spiral', flowRateMls:3.5, pauseS:34, agitation:safeShake('after') },
      { volumeMl:pBody, temp:quantizeXBloomTemp(peakC), pattern:'circular', flowRateMls:3.3, pauseS:15, agitation:'none' },
      { volumeMl:pBody, temp:quantizeXBloomTemp(peakC - 1), pattern:'circular', flowRateMls:3.1, pauseS:14, agitation:'none' },
      { volumeMl:rem - 2 * pBody, temp:quantizeXBloomTemp(peakC - 2), pattern:'center', flowRateMls:3.0, pauseS:0, agitation:'none' }
    ];
  } else if (styleKey === 'xb_kasuya_46'){
    const p1 = Math.round(targetPourMl * 0.20), p2 = Math.round(targetPourMl * 0.20);
    const tail = Math.round((targetPourMl - p1 - p2) / 3);
    rawPours = [
      { volumeMl:p1, temp:quantizeXBloomTemp(peakC), pattern:'spiral', flowRateMls:3.4, pauseS:35, agitation:safeShake('after') },
      { volumeMl:p2, temp:quantizeXBloomTemp(peakC), pattern:'spiral', flowRateMls:3.2, pauseS:24, agitation:'none' },
      { volumeMl:tail, temp:quantizeXBloomTemp(peakC - 1), pattern:'circular', flowRateMls:3.1, pauseS:20, agitation:'none' },
      { volumeMl:tail, temp:quantizeXBloomTemp(peakC - 2), pattern:'circular', flowRateMls:3.0, pauseS:20, agitation:'none' },
      { volumeMl:targetPourMl - p1 - p2 - 2 * tail, temp:quantizeXBloomTemp(peakC - dropC), pattern:'center', flowRateMls:3.0, pauseS:0, agitation:'none' }
    ];
  } else {
    const v2 = Math.round(rem * 0.54);
    rawPours = [
      { volumeMl:vBloom, temp:quantizeXBloomTemp(peakC), pattern:'spiral', flowRateMls:3.3, pauseS:36, agitation:safeShake('after') },
      { volumeMl:v2, temp:quantizeXBloomTemp(peakC), pattern:'spiral', flowRateMls:3.2, pauseS:16, agitation:'none' },
      { volumeMl:rem - v2, temp:quantizeXBloomTemp(peakC - dropC), pattern:(bSum.isDecaf || bSum.isEthLandrace) ? 'center' : 'circular', flowRateMls:3.0, pauseS:0, agitation:'none' }
    ];
  }

  /* Enforce 3rd-party cradle agitation lock & exact integer sum(V_k) === round(D * R)! */
  rawPours.forEach(p => { if (agitationLockedOff) p.agitation = 'none'; });
  const bal = rebalanceXBloomPours(rawPours, doseG, machinePourRatio);

  return {
    brewer:'xbloom',
    model,
    vessel,
    agitationLockedOff,
    styleKey,
    templateId:styleKey,
    doseG,
    ratio:machinePourRatio,
    totalRatio,
    pourWaterMl:bal.targetMl,
    waterG:bal.targetMl,
    sumVolumeMl:bal.sumMl,
    iceG,
    d50Um,
    grindStep,
    studioStep,
    originalStep,
    grindRpm,
    rpm:grindRpm,
    rpmWhy,
    pours:bal.pours,
    totalSecs:175,
    summaryText:(model === 'studio' ? 'Studio' : 'Original') + ' · Step ' + grindStep + (grindRpm ? ' @ ' + grindRpm + ' RPM' : '') + ' · Sum ' + bal.sumMl + ' mL'
  };
}

/* ============================================================================
   3. 3-WAVE REAL-TIME EXTRACTION & "SWEET-SPOT CUT" RESCUE (stepExtractionWaves)
   ============================================================================ */

function stepExtractionWaves(cfg){
  cfg = cfg || {};
  const prev = cfg.state || { thetaA:0, thetaS:0, thetaB:0, yA:0, yS:0, yB:0 };
  const dt = _clamp(cfg.dtS != null ? cfg.dtS : cfg.dt, 0, 10.0, 0.1);
  const tempC = _clamp(cfg.slurryTempC, 2, 102, 91.0);
  const d50 = _clamp(cfg.d50Um, 60, 1500, 560);
  const agtron = _clamp(cfg.agtron, 22, 108, 68);
  const tK = tempC + 273.15;
  const invRef = 1.0 / 366.15;
  const invT = 1.0 / tK;
  const R = 8.314462618;

  /* 3-Wave Arrhenius Rate Constants (Acids 26 kJ/mol, Sugars 35 kJ/mol, Bitters 48 kJ/mol) */
  const kA = 0.030 * Math.pow(580 / d50, 1.15) * Math.exp(-(26000 / R) * (invT - invRef));
  const kS = 0.0135 * Math.pow(580 / d50, 1.60) * Math.exp(-(35000 / R) * (invT - invRef));
  const stallBoost = (!cfg.isSteep && cfg.flowGs != null && +cfg.flowGs >= 0 && +cfg.flowGs < 0.8 && prev.thetaS > 0.65) ? 1.55 : 1.0;
  const kB = 0.0046 * Math.pow(580 / d50, 1.85) * Math.exp(-(48000 / R) * (invT - invRef)) * stallBoost;

  /* Monotone Exponential Euler Step */
  const thetaA = 1.0 - (1.0 - _clamp(prev.thetaA, 0, 1, 0)) * Math.exp(-kA * dt);
  const thetaS = 1.0 - (1.0 - _clamp(prev.thetaS, 0, 1, 0)) * Math.exp(-kS * dt);
  const thetaB = 1.0 - (1.0 - _clamp(prev.thetaB, 0, 1, 0)) * Math.exp(-kB * dt);

  const u = _clamp((agtron - 28) / 70, 0, 1, 0.55);
  const maxA = 5.8 + 4.2 * u;
  const maxS = 14.0;
  const maxB = 10.6 - 4.4 * u;

  const yA = maxA * thetaA;
  const yS = maxS * thetaS;
  const yB = maxB * thetaB;

  /* Instantaneous extraction rates dY/dt (%/s) */
  const rateA = maxA * kA * (1.0 - thetaA);
  const rateS = maxS * kS * (1.0 - thetaS);
  const rateB = maxB * kB * (1.0 - thetaB);

  /* Sweet-Spot Cut Rescue Criterion:
     Bitters elution rate exceeds 1.75x Sugars elution rate AFTER >=72% of Maillard sugars are already in the cup! */
  const sweetSpotCutCue = (thetaS >= 0.72 && rateB > 1.75 * rateS) || (thetaB >= 0.58 && thetaS >= 0.78);
  const dominantWave = rateA >= rateS && rateA >= rateB ? 'acids' : rateS >= rateB ? 'sweetness' : 'bitters';

  let phaseLabel = 'Wave 2: Sweet Caramel Sugars';
  let nowDissolving = 'Sweet caramel sugars & smooth Maillard body surging into the cup';
  if (thetaA < 0.55 && dominantWave === 'acids'){
    phaseLabel = 'Wave 1: Bright Fruit Acids';
    nowDissolving = 'Bright fruit acids & floral aromas dissolving first (dry bitters near zero)';
  } else if (sweetSpotCutCue || dominantWave === 'bitters'){
    phaseLabel = 'Wave 3: Late Dry Bitters Rising';
    nowDissolving = 'Sugars have mostly plateaued while slow bitter lactones & drying tannins are climbing';
  } else if (thetaS >= 0.72){
    phaseLabel = 'Sweet-Spot Balance Window';
    nowDissolving = 'Balanced fruit & caramel sweetness locked in — pull dripper once bed drains';
  }

  return {
    thetaA:_rnd(thetaA, 4),
    thetaS:_rnd(thetaS, 4),
    thetaB:_rnd(thetaB, 4),
    acids:_rnd(thetaA, 4),
    sweet:_rnd(thetaS, 4),
    bitters:_rnd(thetaB, 4),
    yA:_rnd(yA, 3),
    yS:_rnd(yS, 3),
    yB:_rnd(yB, 3),
    eyNowPct:_rnd(yA + yS + yB, 2),
    rateA:_rnd(rateA, 4),
    rateS:_rnd(rateS, 4),
    rateB:_rnd(rateB, 4),
    dominantWave,
    phaseLabel,
    nowDissolving,
    sweetSpotCutCue,
    rescueAction:sweetSpotCutCue
      ? 'Sweet-Spot Cut Rescue: Pull dripper off carafe NOW (72%+ sugars captured while bitter polyphenol elution just spiked >1.75x sugar rate). Add warm kettle bypass water if short of target mug weight!'
      : ''
  };
}

/* Pull-Early Cutoff Gate & Clean Bypass Solver (solveBypassCutoff):
   Quantifies exact % Sugars Kept vs % Dry Bitters Blocked when pulling the dripper early,
   plus exact 80 C clean-water bypass grams to restore full mug volume & target %TDS! */
function solveBypassCutoff(cfg){
  cfg = cfg || {};
  const methodKey = String(cfg.method || cfg.methodKey || 'v60').toLowerCase();
  const isEsp = methodKey === 'espresso' || methodKey === 'lever_espresso';
  const doseG = _clamp(cfg.doseG != null ? cfg.doseG : cfg.dose, 4, 250, isEsp ? 18 : 16);
  const waterG = _clamp(cfg.waterG != null ? cfg.waterG : (cfg.water != null ? cfg.water : doseG * (isEsp ? 2.0 : 16.0)), 12, 4000, isEsp ? 36 : 256);
  const totalTargetSec = _clamp(
    cfg.totalTargetSec != null ? cfg.totalTargetSec : (cfg.totalSecs != null ? cfg.totalSecs : (cfg.targetSecs != null ? cfg.targetSecs : (isEsp ? 28 : 165))),
    10, 3600, isEsp ? 28 : 165
  );
  const defaultCut = _rnd(Math.max(10, totalTargetSec - (isEsp ? 3 : 18)), 1);
  const rawCut = cfg.cutoffSec != null ? cfg.cutoffSec
    : (cfg.pullAtSec != null ? cfg.pullAtSec
    : (cfg.earlySec != null && isFinite(+cfg.earlySec) ? (totalTargetSec - +cfg.earlySec) : defaultCut));
  const cutoffSec = _clamp(rawCut, 5, totalTargetSec * 1.6, defaultCut);
  const earlySec = _rnd(totalTargetSec - cutoffSec, 1);

  const waveOpts = {
    methodKey,
    isEspresso:isEsp,
    tempC:_clamp(cfg.tempC != null ? cfg.tempC : cfg.kettleTempC, 4, 102, 93),
    d50Um:_clamp(cfg.d50Um != null ? cfg.d50Um : cfg.grindUm, 60, 1450, isEsp ? 240 : 560),
    roast:cfg.roast,
    agtron:cfg.agtron
  };

  const waveFn = (G.BTCoreV6 && typeof G.BTCoreV6.computeExtractionWavePoint === 'function')
    ? G.BTCoreV6.computeExtractionWavePoint
    : null;
  const ptFull = waveFn ? waveFn(totalTargetSec, totalTargetSec, waveOpts) : { acids:0.96, sweet:0.92, bitters:0.40, eyEstPct:20.2 };
  const ptCut = waveFn ? waveFn(cutoffSec, totalTargetSec, waveOpts) : {
    acids:_clamp(1 - Math.exp(-5.5 * (cutoffSec / totalTargetSec)), 0, 0.99, 0.94),
    sweet:_clamp(Math.pow(1 - Math.exp(-3.1 * (cutoffSec / totalTargetSec)), 1.85), 0, 0.98, 0.88),
    bitters:_clamp(1 - Math.exp(-0.45 * Math.pow(cutoffSec / totalTargetSec, 2.4)), 0, 0.97, 0.26),
    eyEstPct:19.0
  };

  const acidsKeptPct = _rnd(_clamp((ptCut.acids / Math.max(0.05, ptFull.acids)) * 100, 0, 105, 98), 1);
  const sugarsKeptPct = _rnd(_clamp((ptCut.sweet / Math.max(0.05, ptFull.sweet)) * 100, 0, 105, 92), 1);
  const bittersBlockedPct = cutoffSec <= totalTargetSec
    ? _rnd(_clamp((1.0 - ptCut.bitters / Math.max(0.02, ptFull.bitters)) * 100, 0, 98, 32), 1)
    : 0;
  const overtimeExtraBittersPct = cutoffSec > totalTargetSec
    ? _rnd(_clamp(((ptCut.bitters - ptFull.bitters) / Math.max(0.05, ptFull.bitters)) * 100, 0, 150, 0), 1)
    : 0;

  const rWater = isEsp ? 0 : 2.05;
  const fullYieldG = _rnd(Math.max(12, isEsp ? waterG : (waterG - rWater * doseG)), 1);
  const drainFrac = cutoffSec >= totalTargetSec
    ? 1.0
    : _clamp(0.18 + 0.82 * Math.pow(cutoffSec / totalTargetSec, 0.82), 0.15, 1.0, 0.88);
  const yieldAtCutoffG = _rnd(fullYieldG * drainFrac, 1);
  const shortfallG = _rnd(Math.max(0, fullYieldG - yieldAtCutoffG), 1);
  const topUpWithBypass = cfg.addBypass !== false;
  const bypassTopUp80CG = topUpWithBypass ? shortfallG : 0;
  const finalBeverageG = _rnd(yieldAtCutoffG + bypassTopUp80CG, 1);

  const fullEyPct = _clamp(ptFull.eyEstPct, 8, 29, 20.2);
  const cutoffEyPct = _clamp(ptCut.eyEstPct, 5, 29, 19.0);
  const solidsCutG = doseG * (cutoffEyPct / 100.0) * (isEsp ? 1.0 : 0.92);
  const cutoffTdsPct = _rnd((solidsCutG / Math.max(5, yieldAtCutoffG)) * 100, 2);
  const finalTdsPct = _rnd((solidsCutG / Math.max(5, finalBeverageG)) * 100, 2);

  const fmtMmSs = s => {
    const r = Math.max(0, Math.round(s));
    return Math.floor(r / 60) + ':' + String(r % 60).padStart(2, '0');
  };
  const cutStr = fmtMmSs(cutoffSec);
  const plainSummary = earlySec > 0
    ? ('Pull brewer at ' + cutStr + ' (' + Math.round(earlySec) + 's early) to block ' + Math.round(bittersBlockedPct) + '% of late dry bitters while keeping ' + Math.round(sugarsKeptPct) + '% of sweet caramel sugars' +
       (bypassTopUp80CG >= 5 ? (' — then top mug with +' + Math.round(bypassTopUp80CG) + ' g clean 80 C water for full ' + Math.round(finalBeverageG) + ' g cup.') : '.'))
    : earlySec < -2
    ? ('Running +' + Math.round(Math.abs(earlySec)) + 's overtime (' + cutStr + ') adds +' + Math.round(overtimeExtraBittersPct) + '% extra late dry bitters — pull dripper right at ' + fmtMmSs(totalTargetSec) + ' for a cleaner finish.')
    : ('Full drain at ' + cutStr + ' delivers ' + Math.round(fullYieldG) + ' g balanced cup (' + _rnd(finalTdsPct, 2) + '% TDS).');

  const scientistSummary = 'Early cutoff at ' + cutStr + ' truncates high-Ea (46 kJ/mol) CQA-lactone & phenylindane tail elution (-' + Math.round(bittersBlockedPct) + '% Wave-3 bitters, ' + Math.round(sugarsKeptPct) + '% Wave-2 sugars retained; ' + cutoffTdsPct + '% \u2192 ' + finalTdsPct + '% TDS with +' + Math.round(bypassTopUp80CG) + ' g 80 C clean solvent bypass).';

  return {
    ok:true,
    methodKey,
    doseG,
    waterG,
    totalTargetSec:_rnd(totalTargetSec, 1),
    cutoffSec:_rnd(cutoffSec, 1),
    cutoffMmSs:cutStr,
    earlySec,
    acidsKeptPct,
    sugarsKeptPct,
    bittersBlockedPct,
    overtimeExtraBittersPct,
    fullYieldG,
    yieldAtCutoffG,
    shortfallG,
    bypassTopUp80CG,
    bypassWaterG:bypassTopUp80CG,
    bypassTempC:80,
    finalBeverageG,
    fullEyPct:_rnd(fullEyPct, 2),
    cutoffEyPct:_rnd(cutoffEyPct, 2),
    cutoffTdsPct,
    finalTdsPct,
    headline:earlySec > 0 ? ('Pull at ' + cutStr + ' (-' + Math.round(bittersBlockedPct) + '% Dry Bitters, ' + Math.round(sugarsKeptPct) + '% Sugars Kept)') : ('Drain to ' + cutStr),
    summary:plainSummary,
    plainSummary,
    why:plainSummary,
    scientistSummary
  };
}

/* ============================================================================
   4. LIVING BAG INTELLIGENCE (evaluateLivingBag)
   - 12.3x -18 C Cryo-Vault + +12 um frozen grind + Magnus Dew-Point Seal Guard
   - Bidirectional DriftShield (handles aging dG < 0 AND fresh-bag re-buy dG > 0!)
   - OddTailRescue (micro-dose scaling + cellar blend compatibility scorer)
   ============================================================================ */

function calcMagnusDewPointC(tempC, rhPct){
  const T = _clamp(tempC, -10, 50, 22.0);
  const rh = _clamp(rhPct, 5, 100, 55.0);
  const a = 17.625, b = 243.04;
  const alpha = Math.log(rh / 100.0) + (a * T) / (b + T);
  return _rnd((b * alpha) / (a - alpha), 1);
}

function evaluateLivingBag(cfg){
  cfg = cfg || {};
  const bean = cfg.bean || cfg.coffee || {};
  const methodKey = String(cfg.method || cfg.methodKey || 'v60').toLowerCase();
  const stdDoseG = _clamp(cfg.standardDoseG != null ? cfg.standardDoseG : 18.0, 6, 80, 18.0);
  const remG = cfg.remainingGrams != null ? _clamp(cfg.remainingGrams, 0, 5000, 250) : 250;
  const ambTempC = _clamp(cfg.ambientTempC, 5, 42, 22.0);
  const ambRhPct = _clamp(cfg.ambientRhPct, 10, 99, 55.0);

  const bSum = typeof G.beanPhysicsSummary === 'function' ? G.beanPhysicsSummary(bean, cfg.now) : { agtron:65, roastObj:{ v:'medium' }, age:{ effectiveDays:12, isFrozen:!!bean.frozen } };
  const agtron = bSum.agtron != null ? bSum.agtron : 65;
  const curEffDays = cfg.currentEffectiveDays != null
    ? +cfg.currentEffectiveDays
    : (bSum.age && bSum.age.effectiveDays != null ? bSum.age.effectiveDays : 12);
  const prevEffDays = cfg.lastBrewEffectiveDays != null ? +cfg.lastBrewEffectiveDays : curEffDays;

  /* 1. Cryo-Vault Physics (-18 C -> 12.3x slowdown, +12 um grind shift, Dew-Point Condensation Guard) */
  const isFrozen = !!(cfg.isFrozen || bean.frozen || (bSum.age && bSum.age.isFrozen));
  const dewPointC = calcMagnusDewPointC(ambTempC, ambRhPct);
  /* Unopened bag/tube warming from -18 C past dewPointC + 1.5 C safety margin */
  const massWarmG = Math.max(15, Math.min(350, remG || 20));
  const thawTauMin = 12.0 * Math.pow(massWarmG / 20.0, 0.48);
  const sealedThawMinutes = dewPointC > -16
    ? Math.ceil(thawTauMin * Math.log(Math.max(1.2, (ambTempC - (-18.0)) / Math.max(1.5, ambTempC - (dewPointC + 1.5)))))
    : 0;

  const cryoSlowdown = _rnd(Math.exp((40100 / 8.314462618) * ((1 / 255.15) - (1 / (ambTempC + 273.15)))), 1);
  const cryoVault = {
    active:isFrozen,
    arrheniusSlowdownFactor:cryoSlowdown || 12.3,
    eaKjMol:40.1,
    grindStraightFrozenShiftUm:+12,
    finesReductionFactor:0.93,
    dewPointC,
    sealedThawMinutes,
    condensationRule:remG <= 30
      ? 'Single-dose tube: grind straight from -18 C (+12 um setting shift for narrower cryo-fracture PSD) and return tube immediately — NEVER open a bulk freezer bag cold!'
      : ('Bulk freezer bag condensation guard: room dew point is ' + dewPointC + ' C (' + ambRhPct + '% RH). Rest sealed bag at room temp for ' + sealedThawMinutes + ' min before opening so moisture never condenses onto beans!')
  };

  /* 2. Bidirectional DriftShield (Smrke Weibull G(t_now) - G(t_last)) */
  const co2Now = G.BTCoreV6.fresh.smrkeCo2Trajectory({ agtron, effectiveDays:curEffDays });
  const co2Prev = G.BTCoreV6.fresh.smrkeCo2Trajectory({ agtron, effectiveDays:prevEffDays });
  const deltaG = co2Now.remainingFrac - co2Prev.remainingFrac; /* < 0 when aged; > 0 on fresh-bag re-buy! */
  const driftGrindPct = _rnd(deltaG * 9.5, 2); /* Aged (deltaG < 0) -> negative % (finer); Fresh re-buy (deltaG > 0) -> positive % (coarser)! */
  const driftBloomDeltaS = Math.round(co2Now.recommendedBloomS - co2Prev.recommendedBloomS);

  const driftShield = {
    active:Math.abs(deltaG) >= 0.06,
    direction:deltaG > 0.06 ? 'fresh_rebuy' : deltaG < -0.06 ? 'bag_aging' : 'steady',
    deltaCo2Frac:_rnd(deltaG, 4),
    grindShiftPct:driftGrindPct,
    grindShiftUm:Math.round((580 * driftGrindPct / 100) / 5) * 5,
    bloomDeltaS:driftBloomDeltaS,
    tempDeltaC:deltaG < -0.20 ? 0.5 : deltaG > 0.20 ? -0.5 : 0,
    note:deltaG > 0.06
      ? ('Fresh-Bag Re-Buy Detected (' + Math.round(prevEffDays) + 'd \u2192 ' + Math.round(curEffDays) + 'd): CO2 jumped +' + Math.round(deltaG * 100) + '%. Shifted grind +' + Math.abs(driftGrindPct) + '% coarser and extended bloom +' + Math.max(5, driftBloomDeltaS) + 's!')
      : deltaG < -0.06
      ? ('Bag Degassing Compensation (' + Math.round(prevEffDays) + 'd \u2192 ' + Math.round(curEffDays) + 'd): nudged grind ' + Math.abs(driftGrindPct) + '% finer to hold target contact time and sweetness.')
      : 'Bean CO2 state matches your previous brew.'
  };

  /* 3. Odd-Tail Rescue (3 g <= remG < 1.40 * stdDoseG and remG != stdDoseG) */
  let oddTailRescue = { triggered:false };
  if (remG >= 3.0 && remG < stdDoseG * 1.38 && Math.abs(remG - stdDoseG) >= 1.5){
    const ratio = methodKey === 'espresso' ? 2.2 : 16.0;
    const microWaterG = _rnd(remG * ratio, 1);
    const darcyMicroMult = Math.pow(remG / stdDoseG, 0.20);
    const microGrindShiftPct = _rnd((darcyMicroMult - 1.0) * 100, 1);
    const bestMicroBrewer = remG < 11 ? 'AeroPress (Zero-Bypass Upright) or Cafec Deep 27' : 'Hario Switch (Closed Steep) or AeroPress';

    /* Score Cellar Blend Candidates if cellar array supplied */
    const cellar = Array.isArray(cfg.cellar) ? cfg.cellar : [];
    const topMatches = cellar
      .filter(b => b && b.id !== bean.id && (+b.remainingGrams || 50) >= (stdDoseG - remG))
      .map(b => {
        const bAg = +(b.ground_agtron || b.agtron || 65);
        const agDiff = Math.abs(agtron - bAg);
        const sameSpecies = (b.species || 'arabica') === (bean.species || 'arabica');
        const score = _clamp(100 - agDiff * 1.6 - (sameSpecies ? 0 : 18), 10, 99, 75);
        return {
          id:b.id || b.name,
          name:b.name || 'Cellar Coffee',
          topUpGrams:_rnd(Math.max(0, stdDoseG - remG), 1),
          compatibilityScore:Math.round(score),
          why:agDiff <= 10 ? 'Matched roast solubility (' + Math.round(agDiff) + ' Ag delta) extracts evenly in one bed.' : 'Contrasting roast solubility — steep in AeroPress/Switch to prevent uneven percolation.'
        };
      })
      .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
      .slice(0, 3);

    oddTailRescue = {
      triggered:true,
      remainingGrams:_rnd(remG, 1),
      microDoseRecipe:{
        recommendedBrewer:bestMicroBrewer,
        doseG:_rnd(remG, 1),
        waterG:microWaterG,
        ratio,
        grindShiftPct:microGrindShiftPct,
        why:'Shallow ' + _rnd(remG, 1) + ' g bed drains faster by Darcy\'s Law — shift grind ' + Math.abs(microGrindShiftPct) + '% ' + (microGrindShiftPct < 0 ? 'finer' : 'coarser') + ' or use zero-bypass immersion.'
      },
      cellarBlendMatches:topMatches
    };
  }

  return {
    ok:true,
    effectiveDays:_rnd(curEffDays, 1),
    co2:co2Now,
    cryoVault,
    driftShield,
    oddTailRescue
  };
}

/* ============================================================================
   5. BARISTA ALCHEMIST: MILK, FLASH-ICE & 48G PARAGON EXTRACT CHILLING
   ============================================================================ */

function solveDrinkChemistry(cfg){
  cfg = cfg || {};
  /* 1. Milk Thermodynamics, 3.1x Lactose-Free SEI, WBC Freeze-Distilled Eisbock & Plant Curdle Guard */
  const milkType = String(cfg.milkType || 'whole').toLowerCase();
  const milkMl = _clamp(cfg.milkMl, 0, 1000, 150);
  const steamTempC = _clamp(cfg.steamTempC != null ? cfg.steamTempC : 60.0, 4, 88, 60.0);
  const coffeePh = _clamp(cfg.coffeePh != null ? cfg.coffeePh : 4.95, 4.2, 6.2, 4.95);
  const freezeThawFrac = _clamp(cfg.freezeDistillThawFrac != null ? cfg.freezeDistillThawFrac : 1.0, 0.30, 1.0, 1.0);
  const cryoFactor = 1.0 / freezeThawFrac; /* 0.50 thaw = 2.0x WBC Eisbock milk concentration! */

  /* Sucrose-Equivalent Sweetness Index (SEI in g sucrose eq / 100 mL):
     Regular dairy: 4.8 g/100mL lactose * 0.18 relative sweetness = 0.864
     Lactose-free hydrolyzed: 2.45 g glucose (0.74) + 2.45 g galactose (0.35) = 2.67 -> 3.09x (~3.1x) sweeter! */
  const seiRegularDairy = 0.864 * cryoFactor;
  const seiLactoseFree = 2.670 * cryoFactor;
  const isLactoseFree = milkType.includes('lactose');
  const isPlant = milkType.includes('oat') || milkType.includes('almond') || milkType.includes('soy');
  const isUnbufferedPlant = (milkType === 'oat' || milkType === 'almond') && !milkType.includes('barista');

  const milkSei = isLactoseFree ? seiLactoseFree
    : milkType.includes('oat') ? 1.45 * cryoFactor
    : milkType.includes('almond') ? 0.35 * cryoFactor
    : seiRegularDairy;
  const sweetnessMultiplierVsDairy = _rnd(milkSei / 0.864, 2);

  const scaldWarning = steamTempC > 66.5
    ? 'Scald Warning (' + steamTempC + ' C > 65 C): beta-lactoglobulin irreversibly denatures above 66-68 C, releasing cooked sulfurous volatiles and collapsing micro-foam!'
    : '';
  const curdleRisk = (isPlant && coffeePh < 5.05 && (isUnbufferedPlant || steamTempC > 60)) || (coffeePh < 4.75 && steamTempC > 63);
  const safePlantTempMaxC = isUnbufferedPlant ? 55.0 : 60.0;
  const curdleGuardNote = curdleRisk
    ? ('Isoelectric Curdle Guard (Coffee pH ' + coffeePh.toFixed(2) + ' < 5.1): keep ' + milkType + ' <= ' + safePlantTempMaxC + ' C, use dipotassium-phosphate buffered Barista edition, and temper slowly into espresso.')
    : 'Safe protein emulsion stability inside 55-62 C sweet spot.';

  /* 2. Flash-Iced 3-Regime Enthalpy */
  const flashIce = G.BTCoreV6.thermo.solveFlashIcedEnthalpy({
    hotBrewMassG:cfg.hotBrewMassG != null ? cfg.hotBrewMassG : 150,
    iceMassG:cfg.iceMassG != null ? cfg.iceMassG : 100,
    hotBrewTempC:cfg.hotBrewTempC != null ? cfg.hotBrewTempC : 76,
    iceTempC:cfg.iceTempC != null ? cfg.iceTempC : -18,
    hotTdsPct:cfg.hotTdsPct != null ? cfg.hotTdsPct : 2.15
  });

  /* 3. Nucleus Paragon / Extract Chilling (48 g phase-change SS sphere @ -18 C = 16.96 kJ!) */
  const sphereCount = _clamp(Math.round(cfg.chillingSpheres != null ? cfg.chillingSpheres : 1), 0, 2, 1);
  const qSphereKj = 16.96 * sphereCount; /* 48 g glycol-water core SS sphere enthalpy capacity */
  const totalYieldG = _clamp(cfg.brewYieldG != null ? cfg.brewYieldG : 218.3, 25, 1500, 218.3);
  const chillFraction = _clamp(cfg.chillEarlyFraction != null ? cfg.chillEarlyFraction : 0.40, 0.15, 1.0, 0.40);
  const earlyDripTempC = _clamp(cfg.earlyDripTempC != null ? cfg.earlyDripTempC : 78.0, 50, 96, 78.0);
  const lateDripTempC = _clamp(cfg.lateDripTempC != null ? cfg.lateDripTempC : 75.0, 50, 96, 75.0);

  const earlyMassG = totalYieldG * chillFraction;
  const lateMassG = totalYieldG - earlyMassG;
  const maxRemovableJ = Math.min(qSphereKj * 1000.0, earlyMassG * 4.184 * (earlyDripTempC - 4.0));
  const chilledEarlyTempC = sphereCount > 0
    ? (earlyDripTempC - maxRemovableJ / Math.max(1.0, earlyMassG * 4.184))
    : earlyDripTempC;
  const finalCarafeTempC = (earlyMassG * chilledEarlyTempC + lateMassG * lateDripTempC) / totalYieldG;
  /* Henry's Law aromatic ester retention gain vs unchilled 77 C server */
  const vocGainPct = sphereCount > 0 ? _rnd((1.0 - Math.exp(-0.0115 * (earlyDripTempC - chilledEarlyTempC))) * 100, 1) : 0;

  return {
    ok:true,
    milk:{
      milkType,
      milkMl,
      optimalTempWindowC:[55, 65],
      steamTempC,
      seiSucroseEqPer100Ml:_rnd(milkSei, 2),
      lactoseFreeSweetnessRatio:_rnd(seiLactoseFree / seiRegularDairy, 2), /* 3.09 (~3.1x!) */
      sweetnessMultiplierVsDairy,
      eisbockConcentrationFactor:_rnd(cryoFactor, 2),
      curdleRisk,
      safePlantTempMaxC,
      scaldWarning,
      curdleGuardNote
    },
    flashIce,
    extractChilling:{
      sphereMassG:48 * sphereCount,
      sphereTemp0C:-18,
      enthalpyCapacityKj:_rnd(qSphereKj, 2),
      earlyFractionChilled:chillFraction,
      earlyDripTempC,
      chilledEarlyTempC:_rnd(chilledEarlyTempC, 1),
      finalCarafeTempC:_rnd(finalCarafeTempC, 1),
      inTrpm5SweetWindow:finalCarafeTempC >= 50 && finalCarafeTempC <= 63,
      volatileRetentionGainPct:vocGainPct
    }
  };
}

/* ============================================================================
   6. CROSS-GRINDER QR BREW PASSPORT (encodeBrewPassport / decodeAndLocalizePassport)
   - Compact <280-byte URL-safe bt1: URI + human BT-code: V1 + deterministic SVG matrix
   - 4-Layer Receiver Localization (Grinder D50+Span, Brewer Wall, Altitude, Water KH)
   ============================================================================ */

function toBase64UrlUtf8(str){
  const bytes = [];
  for (let i = 0; i < str.length; i++){
    let c = str.charCodeAt(i);
    if (c < 0x80) bytes.push(c);
    else if (c < 0x800) bytes.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    else bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
  }
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let out = '';
  for (let i = 0; i < bytes.length; i += 3){
    const b0 = bytes[i], b1 = i + 1 < bytes.length ? bytes[i + 1] : 0, b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
    out += chars[b0 >> 2];
    out += chars[((b0 & 3) << 4) | (b1 >> 4)];
    if (i + 1 < bytes.length) out += chars[((b1 & 15) << 2) | (b2 >> 6)];
    if (i + 2 < bytes.length) out += chars[b2 & 63];
  }
  return out;
}

function fromBase64UrlUtf8(b64){
  const clean = String(b64 || '').replace(/[^A-Za-z0-9\-_]/g, '');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const bytes = [];
  for (let i = 0; i < clean.length; i += 4){
    const c0 = chars.indexOf(clean[i]);
    const c1 = i + 1 < clean.length ? chars.indexOf(clean[i + 1]) : 0;
    const c2 = i + 2 < clean.length ? chars.indexOf(clean[i + 2]) : -1;
    const c3 = i + 3 < clean.length ? chars.indexOf(clean[i + 3]) : -1;
    if (c0 < 0 || c1 < 0) break;
    bytes.push((c0 << 2) | (c1 >> 4));
    if (c2 >= 0) bytes.push(((c1 & 15) << 4) | (c2 >> 2));
    if (c3 >= 0) bytes.push(((c2 & 3) << 6) | c3);
  }
  let out = '';
  for (let i = 0; i < bytes.length;){
    const b0 = bytes[i++];
    if (b0 < 0x80) out += String.fromCharCode(b0);
    else if (b0 < 0xe0 && i < bytes.length) out += String.fromCharCode(((b0 & 0x1f) << 6) | (bytes[i++] & 0x3f));
    else if (i + 1 < bytes.length){
      const b1 = bytes[i++], b2 = bytes[i++];
      out += String.fromCharCode(((b0 & 0x0f) << 12) | ((b1 & 0x3f) << 6) | (b2 & 0x3f));
    }
  }
  return out;
}

/* Compact 25x25 Finder-Pattern Visual Passport Matrix SVG (offline zero-dependency) */
function renderPassportMatrixSvg(uriStr){
  if (typeof G.encodeQrSvg === 'function'){
    const realQr = G.encodeQrSvg(uriStr, { margin:2, size:180, fg:'#24150E', bg:'#FAF6F0', label:'BeanTelligence Scannable Brew Passport QR Code' });
    if (realQr) return realQr;
  }
  const N = 25;
  const grid = new Uint8Array(N * N);
  const putFinder = (ox, oy) => {
    for (let y = 0; y < 7; y++){
      for (let x = 0; x < 7; x++){
        const edge = x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4);
        grid[(oy + y) * N + (ox + x)] = edge ? 1 : 2;
      }
    }
  };
  putFinder(0, 0);
  putFinder(N - 7, 0);
  putFinder(0, N - 7);
  let h = 2166136261 >>> 0;
  for (let i = 0; i < uriStr.length; i++){
    h ^= uriStr.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
    const bitIdx = i * 8;
    for (let b = 0; b < 8; b++){
      const pos = (bitIdx + b) % (N * N);
      if (grid[pos] === 0) grid[pos] = ((uriStr.charCodeAt(i) >> b) & 1) ? 1 : 2;
    }
  }
  for (let p = 0; p < N * N; p++){
    if (grid[p] === 0){
      h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
      grid[p] = (h & 1) ? 1 : 2;
    }
  }
  let path = '';
  for (let y = 0; y < N; y++){
    for (let x = 0; x < N; x++){
      if (grid[y * N + x] === 1) path += 'M' + x + ' ' + y + 'h1v1h-1z';
    }
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 29 29" width="180" height="180" role="img" aria-label="BeanTelligence Brew Passport Matrix"><rect x="-2" y="-2" width="29" height="29" rx="2" fill="#FAF6F0"/><path d="' + path + '" fill="#24150E"/></svg>';
}

function encodeBrewPassport(input){
  input = input || {};
  const bean = input.bean || input.coffee || {};
  const rec = input.recipe || input;
  const compactObj = {
    v:1,
    n:String(bean.name || 'Specialty Lot').slice(0, 28),
    r:String(bean.roaster || '').slice(0, 20),
    o:String(bean.origin || '').slice(0, 18),
    p:String(bean.process || 'washed').slice(0, 14),
    rl:String(bean.roast || 'medium').slice(0, 12),
    ag:bean.ground_agtron ? +bean.ground_agtron : (bean.agtron ? +bean.agtron : 68),
    m:String(rec.method || rec.methodKey || 'v60').slice(0, 14),
    d:_rnd(+rec.doseG || +rec.dose || 15, 1),
    w:Math.round(+rec.waterG || +rec.water || 250),
    u:Math.round(+rec.d50Um || +rec.grindUm || 560),
    t:_rnd(+rec.tempC || +rec.kettleTempC || 93, 1),
    g:String(rec.grinderKey || 'comandante-c40').slice(0, 22),
    mt:String(rec.brewerMaterial || 'plastic').slice(0, 10),
    kh:Math.round(+rec.waterKhPpm || 40)
  };
  const jsonStr = JSON.stringify(compactObj);
  const uri = 'bt1:' + toBase64UrlUtf8(jsonStr);
  const textBlock = 'BT-code: V1 ' + uri + '\n(' + compactObj.n + ' · ' + compactObj.m.toUpperCase() + ' ' + compactObj.d + 'g:' + compactObj.w + 'g @ ' + compactObj.u + 'um, ' + compactObj.t + 'C)';
  return {
    ok:true,
    uri,
    byteLength:uri.length,
    textBlock,
    payload:compactObj,
    svgMarkup:renderPassportMatrixSvg(uri)
  };
}

function decodeAndLocalizePassport(rawText, receiverPrefs){
  const s = String(rawText || '').trim();
  if (!s) return { ok:false, why:'Empty passport text.' };
  const mUri = s.match(/bt1:([A-Za-z0-9\-_]+)/);
  let data = null;
  try {
    if (mUri){
      data = JSON.parse(fromBase64UrlUtf8(mUri[1]));
    } else if (s.startsWith('{')){
      data = JSON.parse(s);
    }
  } catch (e){
    return { ok:false, why:'Invalid or corrupted Brew Passport payload.' };
  }
  if (!data || typeof data !== 'object') return { ok:false, why:'Unrecognized Brew Passport format.' };

  const prefs = receiverPrefs || {};
  const gear = prefs.gear || {};
  const rxGrinder = String(prefs.grinderKey || gear.grinder || gear.grinderKey || 'comandante-c40').toLowerCase().replace(/_/g, '-');
  const rxMaterial = String(prefs.brewerMaterial || (prefs.brewerMaterials && prefs.brewerMaterials.defaultWall) || 'plastic').toLowerCase();
  const rxAltM = _clamp(prefs.altitudeM != null ? prefs.altitudeM : (gear.altitudeFt ? +gear.altitudeFt * 0.3048 : 0), -430, 5500, 0);
  const rxKhPpm = _clamp(prefs.waterKhPpm != null ? prefs.waterKhPpm : (gear.waterAlk != null ? +gear.waterAlk : 45), 0, 350, 45);

  const srcArch = typeof G.burrArchetypeFor === 'function' ? G.burrArchetypeFor(data.g || 'comandante-c40') : { spanNom:1.12 };
  const rxArch = typeof G.burrArchetypeFor === 'function' ? G.burrArchetypeFor(rxGrinder) : { spanNom:1.40 };

  /* Layer 1: Burr Span Fines Compensation (+4% coarser if receiver has wider bimodal span than sender!) */
  const spanDiff = (rxArch.spanNom || 1.3) - (srcArch.spanNom || 1.15);
  let locUm = Math.round(((+data.u || 560) * (1.0 + 0.09 * spanDiff)) / 5) * 5;

  /* Layer 2: Receiver Brewer Wall Material Slurry Thermal Match */
  const matDrop = { plastic:0, vacuum_ss:-0.5, glass:1.2, ceramic:2.2 }[rxMaterial] || 0;
  const srcDrop = { plastic:0, vacuum_ss:-0.5, glass:1.2, ceramic:2.2 }[data.mt || 'plastic'] || 0;
  let locTempC = _rnd((+data.t || 93) + (matDrop - srcDrop), 1);

  /* Layer 3: Receiver Altitude Boil-Cap + Diffusive Grind Spillover */
  const rxBoilC = G.BTCoreV6 ? G.BTCoreV6.thermo.boilingPointC(rxAltM) : 100.0;
  const isEsp = data.m === 'espresso' || data.m === 'lever_espresso';
  let boilCapNote = '';
  if (!isEsp && locTempC > rxBoilC - 0.8){
    const deficit = locTempC - (rxBoilC - 0.8);
    locTempC = _rnd(rxBoilC - 0.8, 1);
    locUm = Math.round((locUm * (1.0 - 0.018 * deficit)) / 5) * 5;
    boilCapNote = 'Capped at local boiling limit (' + locTempC + ' C @ ' + Math.round(rxAltM) + ' m) and shifted grind finer to preserve extraction.';
  }

  /* Layer 4: Receiver Water Alkalinity KH Localization */
  const srcKh = +data.kh || 40;
  const waterNote = Math.abs(rxKhPpm - srcKh) > 35
    ? (rxKhPpm > srcKh
        ? ('Your local water (' + Math.round(rxKhPpm) + ' ppm KH) is much harder-buffered than the roaster/sender (' + srcKh + ' ppm KH) — dilute with ~' + Math.round((1 - srcKh / rxKhPpm) * 100) + '% distilled/RO water so fruit notes stay vibrant.')
        : ('Your local water (' + Math.round(rxKhPpm) + ' ppm KH) has lower alkalinity than sender (' + srcKh + ' ppm KH) — expect brighter perceived acidity.'))
    : 'Water alkalinity closely matches sender target.';

  const mappedGrind = G.BTCoreV6.psd.mapMicronsToGrinder(locUm, rxGrinder, prefs.pocketMicronCalib, data.m);

  return {
    ok:true,
    bean:{
      name:data.n || 'Passport Coffee',
      roaster:data.r || '',
      origin:data.o || '',
      process:data.p || 'washed',
      roast:data.rl || 'medium',
      ground_agtron:data.ag || ''
    },
    senderRecipe:{
      methodKey:data.m || 'v60',
      doseG:+data.d || 15,
      waterG:+data.w || 250,
      d50Um:+data.u || 560,
      tempC:+data.t || 93,
      grinderKey:data.g || 'comandante-c40'
    },
    localizedRecipe:{
      methodKey:data.m || 'v60',
      doseG:+data.d || 15,
      waterG:+data.w || 250,
      ratio:_rnd((+data.w || 250) / Math.max(1, +data.d || 15), 2),
      d50Um:locUm,
      grinderKey:rxGrinder,
      grinderSetting:mappedGrind,
      tempC:locTempC,
      brewerMaterial:rxMaterial,
      boilCapNote,
      waterNote
    }
  };
}

/* ============================================================================
   7. POCKETMICRONLENS SMARTPHONE COMPUTER VISION PSD (analyzeGrindPhoto)
   - Integral-image Sauvola local threshold (k = 0.22, R = 128)
   - Connected components + touching-grain watershed split + Gagne ellipsoid V_i
   - Strict 3x3 px Nyquist resolution floor (zero hallucinated <50 um fines!)
   ============================================================================ */

const REF_PHYSICAL_MM = {
  card:85.60,       /* ISO/IEC 7810 ID-1 credit/loyalty card width */
  quarter:24.26,    /* US Quarter diameter */
  euro1:23.25,      /* 1 Euro coin diameter */
  penny:19.05,      /* US Penny diameter */
  a4_short:210.00
};

function analyzeGrindPhoto(cfg){
  cfg = cfg || {};
  const refType = String(cfg.referenceType || 'card').toLowerCase();
  const refMm = REF_PHYSICAL_MM[refType] || 85.60;
  const gKey = String(cfg.grinderKey || 'comandante-c40').toLowerCase().replace(/_/g, '-');
  const click = cfg.clickSetting != null && isFinite(+cfg.clickSetting) ? +cfg.clickSetting : null;

  /* Case A: Real Pixel Buffer (ImageData { width, height, data }) */
  const img = cfg.imageData;
  if (img && img.width >= 32 && img.height >= 32 && img.data && img.data.length >= img.width * img.height * 4){
    const W = img.width | 0, H = img.height | 0;
    const rgba = img.data;
    const refPx = _clamp(cfg.referenceSpanPx != null ? cfg.referenceSpanPx : (W * 0.62), 40, W * 0.98, W * 0.62);
    const pxPitchUm = (refMm * 1000.0) / refPx;
    const nyquistFloorUm = _rnd(3.0 * pxPitchUm, 1); /* Strict 3x3 px optical Nyquist floor */

    /* 1. Grayscale + Integral Images for O(1) Sauvola Windowing */
    const W1 = W + 1;
    const nPix = W * H;
    const lum = new Uint8Array(nPix);
    const sumI = new Float64Array(W1 * (H + 1));
    const sqI = new Float64Array(W1 * (H + 1));

    for (let y = 0; y < H; y++){
      let rowSum = 0, rowSq = 0;
      const rowOff = y * W;
      const intOff = (y + 1) * W1;
      const prevOff = y * W1;
      for (let x = 0; x < W; x++){
        const p = (rowOff + x) << 2;
        const g = (77 * rgba[p] + 150 * rgba[p + 1] + 29 * rgba[p + 2]) >> 8;
        lum[rowOff + x] = g;
        rowSum += g;
        rowSq += g * g;
        sumI[intOff + x + 1] = sumI[prevOff + x + 1] + rowSum;
        sqI[intOff + x + 1] = sqI[prevOff + x + 1] + rowSq;
      }
    }

    /* 2. Sauvola Local Adaptive Thresholding (k = 0.22, R = 128) */
    const mask = new Uint8Array(nPix);
    const rad = Math.max(6, Math.min(24, Math.round(Math.min(W, H) / 28)));
    const kSauv = 0.22, rSauv = 128.0;
    for (let y = 0; y < H; y++){
      const y0 = Math.max(0, y - rad), y1 = Math.min(H, y + rad + 1);
      for (let x = 0; x < W; x++){
        const x0 = Math.max(0, x - rad), x1 = Math.min(W, x + rad + 1);
        const area = (x1 - x0) * (y1 - y0);
        const s = sumI[y1 * W1 + x1] - sumI[y0 * W1 + x1] - sumI[y1 * W1 + x0] + sumI[y0 * W1 + x0];
        const q = sqI[y1 * W1 + x1] - sqI[y0 * W1 + x1] - sqI[y1 * W1 + x0] + sqI[y0 * W1 + x0];
        const mean = s / area;
        const std = Math.sqrt(Math.max(0, q / area - mean * mean));
        const thresh = mean * (1.0 + kSauv * (std / rSauv - 1.0));
        if (lum[y * W + x] < thresh - 6.0) mask[y * W + x] = 1;
      }
    }

    /* 3. Connected-Component Blob Extraction + Touching-Clump Split + 3x3 Nyquist Filter */
    const visited = new Uint8Array(nPix);
    const stack = new Int32Array(Math.min(nPix, 65536));
    const particles = [];
    for (let idx = 0; idx < nPix; idx++){
      if (!mask[idx] || visited[idx]) continue;
      let sp = 0;
      stack[sp++] = idx;
      visited[idx] = 1;
      let areaPx = 0, minX = W, maxX = 0, minY = H, maxY = 0;
      let perimPx = 0;
      while (sp > 0){
        const cur = stack[--sp];
        const cy = (cur / W) | 0, cx = cur - cy * W;
        areaPx++;
        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;
        const nbs = [cx > 0 ? cur - 1 : -1, cx + 1 < W ? cur + 1 : -1, cy > 0 ? cur - W : -1, cy + 1 < H ? cur + W : -1];
        for (let nb = 0; nb < 4; nb++){
          const ni = nbs[nb];
          if (ni < 0 || !mask[ni]) perimPx++;
          else if (!visited[ni] && sp < stack.length - 1){
            visited[ni] = 1;
            stack[sp++] = ni;
          }
        }
      }
      /* Enforce strict 3x3 px Nyquist floor (area >= 9 px) & reject huge reference card / shadow blobs */
      if (areaPx < 9 || areaPx > nPix * 0.03) continue;
      const bw = (maxX - minX + 1) * pxPitchUm;
      const bh = (maxY - minY + 1) * pxPitchUm;
      const majUm = Math.max(bw, bh);
      const minUm = Math.max(nyquistFloorUm, Math.min(bw, bh) * 0.86);
      const circ = (4 * Math.PI * areaPx) / Math.max(1, perimPx * perimPx);
      /* Watershed-equivalent doublet split when circularity indicates two touching particles */
      if (circ < 0.42 && areaPx >= 24){
        const dEqHalf = Math.sqrt((2.0 * areaPx) / Math.PI) * pxPitchUm;
        const vHalf = (Math.PI / 6.0) * Math.pow(dEqHalf, 3);
        particles.push({ dUm:dEqHalf, vol:vHalf }, { dUm:dEqHalf, vol:vHalf });
      } else {
        /* Gagné Ellipsoidal Volume V_i = (pi / 6) * L * W^2 */
        const vol = (Math.PI / 6.0) * majUm * minUm * minUm;
        const dEq = Math.cbrt((6.0 / Math.PI) * vol);
        particles.push({ dUm:dEq, vol });
      }
    }

    if (particles.length >= 5){
      particles.sort((a, b) => a.dUm - b.dUm);
      const totVol = particles.reduce((a, p) => a + p.vol, 0);
      const vQuant = q => {
        let cum = 0;
        for (let i = 0; i < particles.length; i++){
          cum += particles[i].vol;
          if (cum >= q * totVol) return particles[i].dUm;
        }
        return particles[particles.length - 1].dUm;
      };
      const d10Main = vQuant(0.10);
      const d50Main = vQuant(0.50);
      const d90Main = vQuant(0.90);
      return {
        ok:true,
        source:'camera_sauvola_watershed',
        particleCount:particles.length,
        pxPitchUm:_rnd(pxPitchUm, 2),
        nyquistFloorUm,
        d10MainUm:Math.round(d10Main),
        d50MainUm:Math.round(d50Main),
        d90BoulderUm:Math.round(d90Main),
        spanEst:_rnd((d90Main - d10Main) / Math.max(1, d50Main), 2),
        subFloorNote:'Optical honesty guard: particles < ' + nyquistFloorUm + ' um sit below the 3x3 px Nyquist floor and are modeled from your burr archetype rather than sensor noise.'
      };
    }
  }

  /* Case B: Calibrated Burr-Prior Preview (when imageData is null or pre-capture) */
  const pxPitchUm = refType === 'card' ? 26.4 : 24.0;
  const nyquistFloorUm = _rnd(3.0 * pxPitchUm, 1);
  let estUm = 560;
  if (click != null && typeof G.micronsForGrinderSetting === 'function'){
    const mUm = G.micronsForGrinderSetting(gKey, click);
    if (mUm != null && isFinite(mUm)) estUm = mUm;
    else estUm = _clamp(160 + click * 18.5, 180, 1200, 560);
  }
  const psd = G.BTCoreV6.psd.computeBimodalPSD({ grinderKey:gKey, d50Um:estUm });
  return {
    ok:true,
    source:'calibrated_burr_model',
    particleCount:0,
    pxPitchUm,
    nyquistFloorUm,
    d10MainUm:Math.round(Math.max(nyquistFloorUm, psd.d10Um)),
    d50MainUm:Math.round(psd.d50Um),
    d90BoulderUm:Math.round(psd.d90Um),
    spanEst:_rnd(psd.span, 2),
    subFloorNote:'Particles < ' + nyquistFloorUm + ' um sit below camera 3x3 px Nyquist floor; inferred from ' + psd.archetype + ' burr physics.'
  };
}

function fitTwoPointBurrCalibration(grinderKey, setting1, d50Um1, setting2, d50Um2){
  const s1 = +setting1, s2 = +setting2, u1 = +d50Um1, u2 = +d50Um2;
  if (!(isFinite(s1) && isFinite(s2) && isFinite(u1) && isFinite(u2) && Math.abs(s2 - s1) >= 0.5 && u1 > 60 && u2 > 60)){
    return { ok:false, why:'Provide two distinct dial settings with valid measured D50 microns.' };
  }
  const slopeM = (u2 - u1) / (s2 - s1);
  if (!(slopeM > 0.2 && slopeM < 120)){
    return { ok:false, why:'Measured D50 must increase with coarser dial setting.' };
  }
  const d0OffsetUm = u1 - slopeM * s1;
  return {
    ok:true,
    grinderKey:String(grinderKey || '').toLowerCase().replace(/_/g, '-'),
    slopeM:_rnd(slopeM, 3),
    d0OffsetUm:_rnd(d0OffsetUm, 1)
  };
}

function solveSlurryThermal(cfg){
  cfg = cfg || {};
  const safeDose = _clamp(cfg.doseG != null ? cfg.doseG : cfg.dose, 1, 300, 15);
  const safeWater = _clamp(cfg.waterG != null ? cfg.waterG : cfg.water, 10, 5000, safeDose * 16.5);
  const safeKettle = _clamp(cfg.kettleTempC != null ? cfg.kettleTempC : cfg.tempC, 4, 104, 94);
  const safeAlt = _clamp(cfg.altitudeM, -430, 5500, 0);
  const t = G.BTCoreV6.thermo.simulateSlurryCurve({
    methodKey:cfg.method || cfg.methodKey || 'v60',
    doseG:safeDose,
    waterG:safeWater,
    kettleTempC:safeKettle,
    altitudeM:safeAlt,
    brewerMaterial:cfg.brewerMaterial || 'plastic',
    preheatState:cfg.preheatState || 'boiling_rinse'
  });
  return {
    ok:true,
    boilC:t.boilC,
    kettleC:t.kettleTempC,
    meanSlurryC:t.meanSlurryC,
    peakSlurryC:t.peakSlurryC,
    thermalDropC:t.thermalDropC,
    cappedByBoil:t.cappedByBoil,
    vocSurvivalPct:t.vocSurvivalPct,
    summary:'Kettle ' + t.kettleTempC + ' C drops to ~' + t.meanSlurryC + ' C inside your brewer (-' + t.thermalDropC + ' C wall & pour heat loss).',
    scientistSummary:'2-node open-CV Backward-Euler thermal solve: T_boil = ' + t.boilC + ' C, T_slurry,mean = ' + t.meanSlurryC + ' C, Henry volatile retention = ' + t.vocSurvivalPct + '%.'
  };
}

/* ============================================================================
   8. IN-MUG EMERGENCY RESCUE & CAFE-TO-HOME REVERSE-ENGINEERING SOLVERS
   - solveInMugRescue(cupState): Exact post-brew 80 C bypass mass conservation,
     Breslin & Beauchamp (1997) Na+ TAS2R bitter suppression (~0.20 mg/g = 44 mg / 220g),
     and Siebert (1999) warm milk/oat polyphenol chelation.
   - cloneCafeDrinkToHome(shopVisit, homeGear): 3-tier home hardware translation
     (True Espresso / Philips 5500 / AeroPress-Moka Faux-spresso Concentrate + Filter/Cold)
   ============================================================================ */

function solveInMugRescue(cupState){
  cupState = cupState || {};
  const method = String(cupState.method || cupState.methodKey || 'v60').toLowerCase();
  const rawMugCandidate = cupState.mugMassG != null ? cupState.mugMassG
    : (cupState.mugWeightG != null ? cupState.mugWeightG
    : (cupState.mugG != null ? cupState.mugG
    : (cupState.bevG != null ? cupState.bevG
    : (cupState.cupWeightG != null ? cupState.cupWeightG
    : cupState.volumeMl))));
  const isEsp = !!cupState.isEspresso || method === 'espresso' || method === 'lever_espresso' || (isFinite(+rawMugCandidate) && +rawMugCandidate > 0 && +rawMugCandidate <= 65);
  const b0 = _clamp(rawMugCandidate, 12, 1500, isEsp ? 36 : 220);
  const sym = String(cupState.symptom || cupState.issue || cupState.fault || '').toLowerCase();
  const dx = _clamp(cupState.dx != null ? cupState.dx : cupState.tasteDx, -1, 1, 0);
  const dy = _clamp(cupState.dy != null ? cupState.dy : cupState.tasteDy, -1, 1, 0);

  const rawTdsIn = cupState.measuredTdsPct != null ? cupState.measuredTdsPct
    : (cupState.measTdsPct != null ? cupState.measTdsPct
    : (cupState.tdsPct != null ? cupState.tdsPct : cupState.currentTdsPct));
  const hasMeasTds = isFinite(+rawTdsIn) && +rawTdsIn > 0;
  const tds0 = hasMeasTds
    ? _clamp(+rawTdsIn, 0.3, 28.0, isEsp ? 10.5 : 1.54)
    : (isEsp ? 10.8 : (sym === 'weak' ? 1.05 : 1.54));
  const defaultTargetTds = isEsp || tds0 > 4.0 ? 9.2 : 1.34;
  const targetTds = _clamp(cupState.targetTdsPct, 0.3, 25.0, defaultTargetTds);

  /* 1. Exact Post-Brew 80 C Water Bypass Mass Conservation: M_bypass = (B0 * TDS0) / TDS_target - B0 */
  const rawBypassG = tds0 > targetTds ? ((b0 * tds0) / targetTds - b0) : (b0 * 0.13);
  const bypassHotWater80CG = _rnd(Math.max(0, rawBypassG), 1);
  const finalMassAfterBypassG = _rnd(b0 + bypassHotWater80CG, 1);
  const finalTdsAfterBypassPct = _rnd((b0 * tds0) / Math.max(1, finalMassAfterBypassG), 3);
  const bypassOptions = {
    gentleG:_rnd(b0 * (1 / 0.92 - 1), 1),
    balancedG:bypassHotWater80CG,
    teaLikeG:_rnd(b0 * (1 / 0.80 - 1), 1)
  };

  /* 2. Breslin & Beauchamp (1997, Nature 387:563) Na+ Allosteric TAS2R Bitter Suppression:
     0.020% w/v NaCl = 0.20 mg NaCl per g coffee (44 mg in 220 g mug), 9x below ~0.18% salty recognition! */
  const naclMg = Math.max(4, Math.round(b0 * 0.20));
  const saline20PctDrops = Math.max(1, Math.round(naclMg / 10.0)); /* 1 drop (0.05 mL) of 20% w/w saline ~ 10 mg NaCl */
  const fineSaltGrains = Math.max(3, Math.round(naclMg / 3.2));

  /* 3. Siebert (1999) Warm Milk / Barista Oat Polyphenol-Protein Chelation */
  const warmMilk60CG = isEsp ? 15 : 20;
  const bicarb5PctDrops = isEsp ? 1 : 2;

  let mode = 'bitter_or_strong';
  if (/weak|watery|thin|hollow/.test(sym) || (dy <= -0.35 && dx > -0.25 && !/bitter|strong|sour/.test(sym))) mode = 'weak';
  else if (/astringent|dry|pucker|tannin/.test(sym)) mode = 'astringent';
  else if (/sour|sharp|acidic/.test(sym) || (dx <= -0.30 && !/bitter|strong/.test(sym))) mode = 'sour';
  else if (/bitter|harsh|burnt/.test(sym) && !/strong|heavy/.test(sym)) mode = 'bitter';
  else if (/strong|heavy|muddy|concentrated/.test(sym) || dy >= 0.25 || hasMeasTds) mode = 'strong';

  const prescriptions = [
    {
      id:'hot_water_bypass_80c',
      rank:mode === 'strong' ? 1 : 2,
      title:'Add +' + Math.round(bypassHotWater80CG) + ' g Clean 80 C (176 F) Hot Water',
      grams:bypassHotWater80CG,
      tempC:80,
      human:'Pour +' + Math.round(bypassHotWater80CG) + ' g (~' + _rnd(bypassHotWater80CG / 29.57, 1) + ' fl oz) of warm-hot 80 C (176 F) water straight into your mug and stir.',
      scientist:'Exact solute conservation B_final = (B_0 * TDS_0) / TDS_target lowers concentration from ' + _rnd(tds0, 2) + '% \u2192 ' + _rnd(finalTdsAfterBypassPct, 2) + '% TDS (' + finalMassAfterBypassG + ' g total) without extracting fresh bitter lactones.'
    },
    {
      id:'saline_tas2r_block',
      rank:(mode === 'bitter' || mode === 'sour') ? 1 : 2,
      title:'Add ' + saline20PctDrops + ' Drop' + (saline20PctDrops === 1 ? '' : 's') + ' 20% Saline (~' + naclMg + ' mg Salt)',
      naclMg,
      saline20PctDrops,
      human:'Add ' + saline20PctDrops + ' drop' + (saline20PctDrops === 1 ? '' : 's') + ' from a 20% barista saline dropper — OR 1 tiny knife-tip pinch (~' + fineSaltGrains + ' grains / ~' + naclMg + ' mg fine salt) — and stir 4 seconds.',
      scientist:'Sub-threshold Na+ (~0.020% w/v, well below ~0.18% salty detection) allosterically inhibits peripheral TAS2R bitter receptors by 35-55% (Breslin & Beauchamp 1997, Nature 387:563), unmasking natural sucrose sweetness.'
    },
    {
      id:'warm_milk_chelation',
      rank:mode === 'astringent' ? 1 : 3,
      title:'Add +' + warmMilk60CG + ' g Warm 60 C Milk / Barista Oat',
      grams:warmMilk60CG,
      tempC:60,
      human:'Splash +' + warmMilk60CG + ' g (~1.3 tbsp) warm 60 C milk, lactose-free milk (3.1x naturally sweeter!), or Barista Oat milk into the mug.',
      scientist:'Casein and plant-globulin proteins chelate high-MW chlorogenic tannins (Siebert 1999), instantly clearing dry salivary proline-rich protein (PRP) puckering.'
    }
  ];
  if (mode === 'weak'){
    prescriptions.unshift({
      id:'weak_cup_honest_rescue',
      rank:1,
      title:'Let Cool to 58 C Golden Sip (or Spike w/ 20 g Concentrate)',
      grams:0,
      human:'You cannot boil water out of a weak cup without cooking off aromatics — let it cool to ~58 C (136 F) where natural floral/fruit sweetness peaks, or top with a short 20 g espresso/AeroPress shot if handy.',
      scientist:'TRPM5 cation channels open maximally at 55-62 C, boosting perceived sweetness without adding bitter thermal degradation products.'
    });
  }
  prescriptions.sort((a, b) => a.rank - b.rank);
  const primary = prescriptions[0];

  const nextBrewFix = mode === 'bitter'
    ? 'Next brew: grind 1-2 clicks coarser, lower water temp -2 C, or pull dripper right at target time.'
    : mode === 'sour'
    ? 'Next brew: grind 1-2 clicks finer, raise water temp +2 C, or extend bloom to 45s.'
    : mode === 'strong'
    ? 'Next brew: widen brew ratio (add +15-25 g brew water) while keeping grind steady.'
    : mode === 'astringent'
    ? 'Next brew: pour gently near the center (<=3.5 g/s) and skip late swirls so fines do not clog the filter.'
    : 'Next brew: tighten ratio (use slightly more coffee or less water) and grind 1 click finer.';

  return {
    ok:true,
    mode,
    symptom:sym || mode,
    mugMassG:b0,
    mugWeightG:b0,
    mugG:b0,
    measuredTdsPct:hasMeasTds ? tds0 : null,
    assumedTdsPct:tds0,
    tds0,
    targetTdsPct:targetTds,
    tdsTarget:targetTds,
    bypassWater80CG:bypassHotWater80CG,
    bypass80CG:mode === 'weak' ? 0 : Math.round(bypassHotWater80CG),
    bypassWaterG:mode === 'weak' ? 0 : Math.round(bypassHotWater80CG),
    hotWaterAddG:mode === 'weak' ? 0 : Math.round(bypassHotWater80CG),
    bypassTempC:80,
    hotWaterTempC:80,
    finalMassG:finalMassAfterBypassG,
    finalTdsPct:finalTdsAfterBypassPct,
    resultingTdsPct:finalTdsAfterBypassPct,
    bypassOptions,
    naclMg,
    saltMg:naclMg,
    pinchSaltMg:naclMg,
    salineDrops20Pct:saline20PctDrops,
    saline20PctDrops,
    saline20Drops:saline20PctDrops,
    knifeTipSaltGrains:fineSaltGrains,
    salineBottleRecipe:'Dissolve 5.0 g fine non-iodized table salt in 20.0 g warm filtered water (20% w/w barista saline; 1 drop ~ 10 mg NaCl).',
    warmMilkBufferG:warmMilk60CG,
    warmMilk60CG,
    scientistBicarb5PctDrops:bicarb5PctDrops,
    citation:'Breslin & Beauchamp (1997, Nature 387:563); Siebert (1999)',
    headline:primary.title,
    summary:primary.human,
    plainSummary:primary.human,
    why:primary.human,
    scientistSummary:primary.scientist,
    scienceWhy:primary.scientist,
    nextBrewFix,
    primaryRescue:primary,
    prescriptions
  };
}

function cloneCafeDrinkToHome(shopVisit, homeGear){
  const v = typeof shopVisit === 'string' ? { drink:shopVisit } : (shopVisit || {});
  const gear = homeGear || {};
  const rawDrink = String(v.drink || v.kind || v.drinkKey || v.category || 'latte').trim().toLowerCase().replace(/[\s_-]+/g, '');
  const isIced = v.temp === 'iced' || v.iced === true || /^iced|coldbrew|nitro|shaken/.test(rawDrink);
  const sizeKey = String(v.size || 'medium').toLowerCase();
  const cupMl = +v.volumeMl > 0 ? +v.volumeMl : (sizeKey === 'small' || sizeKey === '8oz' ? 240 : sizeKey === 'large' || sizeKey === '16oz' ? 475 : 355);

  const ownedRaw = Array.isArray(gear.ownedBrewers) && gear.ownedBrewers.length ? gear.ownedBrewers
    : (Array.isArray(gear.ownedMethods) && gear.ownedMethods.length ? gear.ownedMethods
    : (Array.isArray(gear.brewers) && gear.brewers.length ? gear.brewers : (gear.brewer || gear.method ? [gear.brewer || gear.method] : ['v60', 'aeropress', 'espresso'])));
  const owned = ownedRaw.map(b => String(b || '').toLowerCase().trim()).filter(Boolean);
  const hasBrewer = k => owned.indexOf(k) >= 0;
  const grinderKey = String(gear.grinderKey || gear.grinder || 'comandante-c40').toLowerCase().replace(/_/g, '-');
  const bean = gear.bean || gear.coffee || { roast:v.roast || 'medium', process:v.process || 'washed', name:v.coffee || v.beanName || 'Home Specialty Beans' };

  /* Normalize cafe archetype */
  let arch = 'latte';
  if (/pourover|v60|chemex|kalita|origami|orea|filter/.test(rawDrink)) arch = 'pourover';
  else if (/drip|batch/.test(rawDrink)) arch = 'drip';
  else if (/coldbrew|nitro/.test(rawDrink)) arch = 'coldbrew';
  else if (/espresso|doppio|ristretto/.test(rawDrink) && !/shaken/.test(rawDrink)) arch = 'espresso';
  else if (/americano|longblack/.test(rawDrink)) arch = 'americano';
  else if (/cortado|gibraltar|piccolo|macchiato/.test(rawDrink)) arch = 'cortado';
  else if (/flatwhite/.test(rawDrink)) arch = 'flatwhite';
  else if (/cappuccino/.test(rawDrink)) arch = 'cappuccino';
  else if (/icedcoffee/.test(rawDrink)) arch = 'icedcoffee';
  else if (/icedlatte|shaken|mocha|latte/.test(rawDrink)) arch = isIced ? 'icedlatte' : 'latte';

  /* Feedback polish ("Better Than the Cafe") */
  const strengthAdj = v.strength === 'weak' ? 1.20 : v.strength === 'strong' ? 0.86 : 1.00;
  const hasSyrup = !!(v.flavor && v.flavor !== 'none' && v.flavor !== 'unflavored') || /mocha|vanilla|caramel|honey|brown\s*sugar/i.test(String(v.notes || v.drink || ''));
  const defaultPumps = hasSyrup ? (cupMl <= 260 ? 2 : cupMl >= 440 ? 4 : 3) : 0;
  let syrupG = Math.round(defaultPumps * 7.5);
  if (v.sweet === 'more' || v.sweet === 'too_sweet') syrupG = Math.round(syrupG * 0.55);
  else if (v.sweet === 'less') syrupG += 7.5;
  const milkType = String(v.milk || (arch === 'espresso' || arch === 'americano' || arch === 'pourover' || arch === 'drip' || arch === 'coldbrew' || arch === 'icedcoffee' ? 'none' : 'whole')).toLowerCase();

  let chosenMethod = 'v60', tier = 'filter', doseG = 18, waterG = 290, shotYieldG = 36, milkMl = 0, bypassWaterG = 0, iceG = 0, d50Um = 550, tempC = 93;
  const baristaSteps = [];

  if (arch === 'pourover' || arch === 'drip' || arch === 'icedcoffee'){
    const filterOrder = arch === 'drip' ? ['aiden', 'drip', 'chemex', 'v60', 'clever', 'aeropress'] : ['v60', 'origami', 'orea', 'kalita', 'chemex', 'xbloom', 'aiden', 'switch', 'clever', 'aeropress', 'press'];
    chosenMethod = filterOrder.find(hasBrewer) || 'v60';
    tier = isIced || arch === 'icedcoffee' ? 'flash_iced_filter' : 'specialty_filter';
    const targetCupG = Math.min(450, Math.max(200, cupMl));
    if (isIced || arch === 'icedcoffee'){
      iceG = Math.round(targetCupG * 0.36);
      doseG = _rnd((targetCupG / 15.2) * strengthAdj, 1);
      waterG = Math.round(targetCupG - iceG + 2.05 * doseG);
      d50Um = 480;
      tempC = 94;
      baristaSteps.push('Place ' + iceG + ' g freezer ice cubes directly into your server.');
      baristaSteps.push('Brew ' + doseG + ' g coffee with ' + waterG + ' g hot water (' + tempC + ' C) straight onto the ice to lock in aromatics.');
    } else {
      doseG = _rnd(((targetCupG / 0.88) / 16.2) * strengthAdj, 1);
      waterG = Math.round(doseG * 16.2);
      d50Um = chosenMethod === 'chemex' ? 740 : chosenMethod === 'kalita' ? 620 : 545;
      tempC = bean.roast === 'light' || bean.roast === 'ultra-light' ? 94.5 : 92.0;
      baristaSteps.push('Rinse filter hot, dose ' + doseG + ' g coffee, and bloom with ' + Math.round(doseG * 2.8) + ' g water for 35s.');
      baristaSteps.push('Pour in 2 smooth pulses up to ' + waterG + ' g (' + tempC + ' C) and swirl carafe before serving.');
    }
    shotYieldG = Math.round(waterG - 2.05 * doseG);
  } else if (arch === 'coldbrew'){
    chosenMethod = hasBrewer('cold') ? 'cold' : hasBrewer('cold_drip') ? 'cold_drip' : (hasBrewer('press') ? 'press' : 'cold');
    tier = 'cold_steep';
    doseG = _rnd(55 * strengthAdj, 1);
    waterG = Math.round(doseG * 8.0);
    iceG = 110;
    d50Um = chosenMethod === 'cold_drip' ? 680 : 960;
    tempC = 4;
    shotYieldG = Math.round(waterG - 2.2 * doseG);
    baristaSteps.push('Steep ' + doseG + ' g coarse grounds in ' + waterG + ' g filtered water at 4 C in the fridge for 18 hours.');
    baristaSteps.push('Strain cleanly through paper and pour 180 g cold brew over ' + iceG + ' g fresh ice.');
  } else {
    /* Espresso & Espresso-Milk / Americano Family */
    const nShots = +v.shots > 0 ? +v.shots : (cupMl >= 440 ? 3 : 2);
    const targetSolidsG = 3.55 * (nShots / 2) * strengthAdj;
    const baseShotTargetG = Math.round(18 * nShots);

    if (hasBrewer('espresso') || hasBrewer('lever_espresso')){
      chosenMethod = hasBrewer('espresso') ? 'espresso' : 'lever_espresso';
      tier = 'true_espresso';
      doseG = _clamp(_rnd(targetSolidsG / 0.20, 1), 14, 22, 18.0);
      shotYieldG = Math.round(doseG * (arch === 'cortado' || arch === 'flatwhite' ? 1.9 : 2.05));
      waterG = shotYieldG;
      d50Um = chosenMethod === 'lever_espresso' ? 230 : 235;
      tempC = bean.roast === 'dark' ? 89.5 : 93.0;
    } else if (hasBrewer('philips5500')){
      chosenMethod = 'philips5500';
      tier = 'super_automatic';
      const phDrink = isIced ? (arch === 'americano' ? 'icedamericano' : 'icedlatte') : (arch === 'americano' ? 'americano' : arch === 'cappuccino' ? 'cappuccino' : arch === 'flatwhite' ? 'flatwhite' : arch === 'espresso' ? 'espresso' : 'caffelatte');
      const phSnap = snapshotMachine({ drink:phDrink, strength:5, extra:targetSolidsG >= 3.3, milkBar:cupMl >= 350 ? 4 : 2, coffeeBar:2 }, bean);
      doseG = phSnap.doseG;
      shotYieldG = phSnap.waterG;
      waterG = phSnap.waterG;
      d50Um = 310;
      tempC = phSnap.tempC;
    } else {
      /* Tier 3: No Espresso Machine -> Mass-Conserving AeroPress / Moka / Switch Concentrate! */
      chosenMethod = hasBrewer('aeropress') ? 'aeropress' : hasBrewer('moka') ? 'moka' : hasBrewer('phin') ? 'phin' : hasBrewer('switch') ? 'switch' : 'aeropress';
      tier = 'concentrate_fauxspresso';
      if (chosenMethod === 'moka'){
        doseG = _clamp(_rnd(targetSolidsG / 0.19, 1), 15, 22, 18.0);
        waterG = Math.round(doseG * 6.8);
        shotYieldG = Math.round(waterG * 0.82 - 1.35 * doseG);
        d50Um = 375;
        tempC = 78;
      } else {
        doseG = _clamp(_rnd(targetSolidsG / 0.185, 1), 15, 24, 19.0);
        waterG = Math.round(doseG * 3.4);
        shotYieldG = Math.max(30, Math.round(waterG - 1.65 * doseG));
        d50Um = 360;
        tempC = 95;
      }
    }

    const extraConcWaterG = Math.max(0, shotYieldG - baseShotTargetG);
    if (arch === 'espresso'){
      milkMl = 0; bypassWaterG = 0; iceG = isIced ? 90 : 0;
    } else if (arch === 'americano'){
      milkMl = 0;
      iceG = isIced ? Math.round(cupMl * 0.38) : 0;
      bypassWaterG = Math.max(60, Math.round(cupMl - shotYieldG - iceG));
    } else if (arch === 'cortado'){
      iceG = isIced ? 65 : 0;
      milkMl = Math.max(60, Math.round((isIced ? 95 : 110) - 0.5 * extraConcWaterG));
    } else if (arch === 'flatwhite'){
      iceG = 0;
      milkMl = Math.max(90, Math.round(135 - 0.5 * extraConcWaterG));
    } else if (arch === 'cappuccino'){
      iceG = isIced ? 95 : 0;
      milkMl = Math.max(90, Math.round(145 - 0.5 * extraConcWaterG));
    } else {
      /* Hot Latte or Iced Latte */
      iceG = isIced ? Math.max(85, Math.round(cupMl * 0.34 - 0.4 * extraConcWaterG)) : 0;
      milkMl = Math.max(110, Math.round(cupMl - shotYieldG - iceG - syrupG));
    }

    if (tier === 'true_espresso'){
      baristaSteps.push('Pull ' + doseG + ' g \u2192 ' + shotYieldG + ' g espresso shot at ' + tempC + ' C.');
    } else if (tier === 'super_automatic'){
      baristaSteps.push('Brew Strength 5 + ExtraShot on Philips 5500 (' + doseG + ' g freshly ground dose).');
    } else if (chosenMethod === 'moka'){
      baristaSteps.push('Fill Moka base with ' + waterG + ' g pre-heated water, level ' + doseG + ' g fine coffee, and quench under cold tap at ~' + shotYieldG + ' g honey-rich concentrate.');
    } else {
      baristaSteps.push('Brew ' + doseG + ' g fine coffee + ' + waterG + ' g (' + tempC + ' C) in ' + chosenMethod.toUpperCase() + ': stir briskly 15s, steep to 1:15, and press gently for ~' + shotYieldG + ' g espresso-strength concentrate.');
    }
    if (syrupG > 0) baristaSteps.push('Stir ' + syrupG + ' g ' + (v.flavor && v.flavor !== 'none' ? v.flavor : 'house') + ' syrup into the hot espresso concentrate.');
    if (bypassWaterG > 0) baristaSteps.push('Pour over ' + (iceG > 0 ? iceG + ' g ice + ' + bypassWaterG + ' g cold water.' : bypassWaterG + ' g of 82 C hot water (preserves crema!).'));
    if (milkMl > 0){
      baristaSteps.push(isIced
        ? ('Pour over ' + iceG + ' g fresh ice + ' + milkMl + ' mL cold ' + (milkType === 'oat' ? 'Barista Oat milk' : milkType === 'lactosefree' ? 'Lactose-Free milk' : 'milk') + '.')
        : ('Steam ' + milkMl + ' mL ' + (milkType === 'oat' ? 'Barista Oat milk to 58 C (prevents curdling!)' : 'milk to 60 C (140 F) silky micro-foam') + ' and pour into the shot.'));
    }
  }

  const gMapped = (G.BTCoreV6 && G.BTCoreV6.psd)
    ? G.BTCoreV6.psd.mapMicronsToGrinder(d50Um, grinderKey, gear.calib || null, chosenMethod)
    : { ok:true, grinderKey, um:d50Um, label:d50Um + ' um' };

  const synBase = (G.BTCoreV6 && typeof G.BTCoreV6.synthesizeRecipe === 'function')
    ? G.BTCoreV6.synthesizeRecipe({ bean, method:chosenMethod, doseG, waterG, d50Um, tempC, bypassG:bypassWaterG, grinderKey, calib:gear.calib || null })
    : null;

  const beanPricePerG = +gear.beanPricePerG > 0 ? +gear.beanPricePerG : ((+gear.bagPrice > 0 && +gear.bagWeightG > 0) ? (+gear.bagPrice / +gear.bagWeightG) : (21.0 / 340.0));
  const milkCost = milkMl > 0 ? (milkMl * 0.0022) : 0;
  const syrupCost = syrupG > 0 ? (syrupG * 0.012) : 0;
  const homeCost = _rnd(doseG * beanPricePerG + milkCost + syrupCost + 0.05, 2);
  const cafePrice = +v.price > 0 ? +v.price : (milkMl > 0 || isIced ? 6.25 : 4.75);
  const savingsPerCup = _rnd(Math.max(0, cafePrice - homeCost), 2);
  const bagPriceRef = +gear.bagPrice > 0 ? +gear.bagPrice : 21.0;
  const paybackDrinks = savingsPerCup > 0.25 ? Math.ceil(bagPriceRef / savingsPerCup) : null;

  const upgradeNote = (v.strength === 'weak' && (v.sweet === 'more' || v.sweet === 'too_sweet'))
    ? 'Upgraded from your cafe rating: boosted coffee strength +20% and trimmed syrup -45%!'
    : v.strength === 'weak'
    ? 'Upgraded from your cafe rating: boosted coffee solids +20% so flavor cuts cleanly through milk/ice.'
    : (v.sweet === 'more' || v.sweet === 'too_sweet')
    ? 'Upgraded from your cafe rating: trimmed added syrup by 45% (try Lactose-Free milk for 3.1x natural sweetness with 0g added sugar!).'
    : 'Matched to your owned ' + chosenMethod.toUpperCase() + ' & ' + (gMapped.grinder || grinderKey) + '.';

  return {
    ok:true,
    archetype:arch,
    tier,
    cafeName:v.cafe || v.shop || 'Cafe Visit',
    drinkLabel:v.drink || arch,
    isIced,
    targetCupMl:cupMl,
    methodKey:chosenMethod,
    doseG,
    waterG,
    shotYieldG,
    bypassWaterG,
    milkMl,
    milkType,
    iceG,
    syrupG,
    d50Um,
    tempC,
    grinderKey,
    grinderSetting:gMapped,
    grindLabel:gMapped.label || (d50Um + ' um'),
    grinderDisplay:gMapped.label || (d50Um + ' um'),
    baristaSteps,
    steps:baristaSteps,
    upgradeNote,
    economics:{
      cafePrice:_rnd(cafePrice, 2),
      estimatedHomeCost:homeCost,
      savingsPerCup,
      paybackDrinks
    },
    brewStudioRecipe:synBase ? Object.assign({}, synBase, {
      milkMl,
      iceG,
      syrupG,
      bypassG:bypassWaterG,
      clonedFromCafe:{ cafe:v.cafe || '', drink:v.drink || arch, baristaSteps, upgradeNote }
    }) : {
      methodKey:chosenMethod,
      doseG,
      waterG,
      bypassG:bypassWaterG,
      ratio:_rnd((waterG + bypassWaterG) / Math.max(1, doseG), 2),
      d50Um,
      tempC,
      grinderKey,
      grinderSetting:gMapped,
      milkMl,
      iceG,
      syrupG,
      steps:baristaSteps.map((txt, idx) => ({ t:idx * 30, label:'Step ' + (idx + 1), human:txt }))
    }
  };
}
const reverseEngineerCafeDrink = cloneCafeDrinkToHome;

/* ============================================================================
   9. EXPORT CANONICAL window.BTInnovate & GLOBAL HELPERS
   ============================================================================ */

const BTInnovate = {
  version:'6.2.0',
  PHILIPS_DRINKS:PHILIPS_DRINKS_V6,
  PHILIPS_PROFILES,
  PHILIPS_MILKS,
  SAS_DOSE_BY_STRENGTH,
  enforcePhilipsInterlocks,
  philipsSetup,
  philipsFix,
  philipsRecs,
  philipsMeasure,
  philipsCup,
  philipsWarnings,
  aquaCleanStatus,
  cleanMachine,
  snapshotMachine,

  synthesizeAidenProfile,
  synthesizeXBloomProfile,
  rebalanceXBloomPours,
  quantizeXBloomTemp,

  stepExtractionWaves,
  solveBypassCutoff,
  computeExtractionWavePoint:G.BTCoreV6 ? G.BTCoreV6.computeExtractionWavePoint : null,
  computeExtractionWaveSeries:G.BTCoreV6 ? G.BTCoreV6.computeExtractionWaveSeries : null,
  evaluateLivingBag,
  solveDrinkChemistry,
  solveInMugRescue,
  cloneCafeDrinkToHome,
  reverseEngineerCafeDrink,
  WATER_PROFILES_V6:G.WATER_PROFILES_V6,
  solveTwoBottleBlend:G.solveTwoBottleBlend,
  solveKitchenGallonWater:G.solveKitchenGallonWater,
  solveEverydayWaterRescue:G.solveEverydayWaterRescue,
  encodeBrewPassport,
  decodeAndLocalizePassport,
  analyzeGrindPhoto,
  fitTwoPointBurrCalibration,

  solveSlurryThermal,
  diagnoseAndSolveNextCup:G.BTCoreV6 ? G.BTCoreV6.solveMakeItPerfect : null,
  translateBrewTwin:G.BTCoreV6 ? G.BTCoreV6.translateAcrossBrewers : null
};

if (G.BTCoreV6){
  G.BTCoreV6.solveInMugRescue = solveInMugRescue;
  G.BTCoreV6.solveBypassCutoff = solveBypassCutoff;
  G.BTCoreV6.cloneCafeDrinkToHome = cloneCafeDrinkToHome;
  G.BTCoreV6.reverseEngineerCafeDrink = reverseEngineerCafeDrink;
}

G.BTInnovate = BTInnovate;
if (G.window) G.window.BTInnovate = BTInnovate;

const INNOVATE_GLOBALS = {
  PHILIPS_DRINKS_V6,
  PHILIPS_DRINKS,
  PHILIPS_GROUPS,
  PHILIPS_MILKS,
  PHILIPS_PROFILES,
  PHILIPS_CUPS,
  SAS_DOSE_BY_STRENGTH,
  philipsDrink,
  enforcePhilipsInterlocks,
  philipsSetup,
  philipsFix,
  philipsRecs,
  philipsMeasure,
  philipsCup,
  philipsWarnings,
  aquaCleanStatus,
  cleanMachine,
  snapshotMachine,
  synthesizeAidenProfile,
  synthesizeXBloomProfile,
  rebalanceXBloomPours,
  quantizeXBloomTemp,
  stepExtractionWaves,
  solveBypassCutoff,
  evaluateLivingBag,
  solveDrinkChemistry,
  solveInMugRescue,
  cloneCafeDrinkToHome,
  reverseEngineerCafeDrink,
  encodeBrewPassport,
  decodeAndLocalizePassport,
  analyzeGrindPhoto,
  fitTwoPointBurrCalibration,
  solveSlurryThermal
};
Object.keys(INNOVATE_GLOBALS).forEach(k => { G[k] = INNOVATE_GLOBALS[k]; });

})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
