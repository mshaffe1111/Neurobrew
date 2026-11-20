/* ==========================================================================
   BeanTelligence v6.3 — 07-tab-cellar-journal.js
   Tab 2 (Cellar) — Zero-Trap Back Navigation & Zero-Jargon Polish:
   1) Open Shelf & Trails:
      - Universal Back Bar (<- Back / <- Back to Home Brew / Tasting)
      - Active Dial-In Trail Sparklines (Try #1 -> Try #2 -> Locked Gold)
      - Peak Freshness Window + Last-Dose Bag Rescue
      - Freezer Vault (-18 C · 12x Slower Aging, collapsed when empty,
        1-tap Freeze / Pull Dose tracking remaining grams & $/cup)
      - 1-Tap Brew -> (loads bag + locked Gold Recipe into Step 3 w/ Back history!)
      - Fresh Bag roast-date rollover (chips + date picker)
      - Real Scannable ISO Reed-Solomon QR Trading-Card Passport (encodeQrSvg)
   2) Brew Journal:
      - Search/filter chips, full Tasting Detail sheet (w/ <- Back), Lossless
        Tasting & Multi-Brew Coffee Editor (w/ <- Back), and Side-by-Side
        Compare 2-3 Brews (w/ <- Back to Journal)
   3) At a Coffee Shop (shop -> sdrink -> staste -> sperfect):
      - Explicit <- Previous Step (4->3->2->1) + <- Back to Home Brew buttons!
      - Isolated 4-Step Logger + Shop vs. Home Benchmark +
        "Clone This Cafe Drink at Home ->" + Personal Cafe Leaderboard
   4) Bag Prices & Value Tracker:
      - Canonical { id, coffee, roaster, size, price, currency, rlevel, date,
        notes } + legacy { name, grams, roast } read fallback on hydration
   Zero Emojis · Zero Jargon Leaks · 16px Min Input Font · Clean ES6
   ========================================================================== */

(function () {
  var S = window.BTTasteCellarShared;

  /* 4 Clean Cafe Drink Categories */
  var CAFE_CATEGORIES_4 = [
    {
      key: 'espresso_milk',
      label: 'Espresso & Milk',
      items: [
        { v: 'espresso',   label: 'Espresso',          hot: true },
        { v: 'cortado',    label: 'Cortado',           hot: true },
        { v: 'flatwhite',  label: 'Flat White',        hot: true },
        { v: 'cappuccino', label: 'Cappuccino',        hot: true },
        { v: 'latte',      label: 'Latte',             hot: true },
        { v: 'macchiato',  label: 'Macchiato',         hot: true },
        { v: 'americano',  label: 'Americano',         hot: true },
        { v: 'mocha',      label: 'Mocha',             hot: true },
        { v: 'caramelmac', label: 'Caramel Macchiato', hot: true }
      ]
    },
    {
      key: 'filter_pour',
      label: 'Filter & Pour-Over',
      items: [
        { v: 'pour',   label: 'Pour-Over',  hot: true },
        { v: 'brewed', label: 'Batch Brew', hot: true }
      ]
    },
    {
      key: 'iced_cold',
      label: 'Iced & Cold',
      items: [
        { v: 'icedlatte',  label: 'Iced Latte',        hot: false },
        { v: 'icedcoffee', label: 'Flash Iced Coffee', hot: false },
        { v: 'cold',       label: 'Cold Brew',         hot: false },
        { v: 'nitro',      label: 'Nitro Cold Brew',   hot: false }
      ]
    },
    {
      key: 'signature',
      label: 'Signature',
      items: [
        { v: 'special',  label: 'Seasonal Signature', hot: true },
        { v: 'affogato', label: 'Affogato',           hot: true },
        { v: 'frappe',   label: 'Blended Frappe',     hot: false },
        { v: 'matcha',   label: 'Matcha Latte',       hot: true },
        { v: 'chai',     label: 'Chai Latte',         hot: true },
        { v: 'hotchoc',  label: 'Hot Chocolate',      hot: true },
        { v: 'tea',      label: 'Specialty Tea',      hot: true },
        { v: 'other',    label: 'Other Drink',        hot: true }
      ]
    }
  ];

  var ALL_CAFE_DRINKS = [];
  CAFE_CATEGORIES_4.forEach(function (cat) {
    cat.items.forEach(function (it) {
      ALL_CAFE_DRINKS.push(Object.assign({ catKey: cat.key }, it));
    });
  });

  function findDrinkMeta(kindVal) {
    var v = String(kindVal || 'cortado').toLowerCase();
    return ALL_CAFE_DRINKS.find(function (d) { return d.v === v; }) || ALL_CAFE_DRINKS[1];
  }

  var SHELF_MAX_BAGS = 200; /* hard collection ceiling (Shelf shows first 30 until "Show All Bags") */
  var SHELF_VISIBLE_DEFAULT = 30;

  var ui = {
    seg: 'shelf', /* 'shelf' | 'journal' | 'cafes' | 'prices' */
    cryoOpenMap: {},
    freshRolloverMap: {},
    thawTimers: {},
    frozenGrindOffset: true,
    confirmOverwriteKey: '',
    confirmOverwriteUntil: 0,
    journalQ: '',
    journalFilter: 'all',
    journalSort: 'newest',
    journalBreakdownOpen: true,
    selectedCvaTrait: '',
    cuppingCompareOpen: true,
    cuppingCmpA: 0,
    cuppingCmpB: 1,
    compareIdxs: [],
    compareOnlyVaried: true,
    passportCodeInput: '',
    passportMsg: '',
    cafeCatKey: 'espresso_milk',
    cafeBoardTab: 'drinks', /* 'drinks' | 'shops' | 'favorites' */
    cafeSearchQ: '',
    confirmCloneUntil: 0,
    lastSavedCafeDrink: null,
    priceAddOpen: false,
    priceEditIdx: -1,
    priceShow: 'open', /* 'open' | 'finished' | 'all' */
    priceSort: 'use_first', /* 'use_first' | 'newest' | 'cheap' | 'name' */
    priceQ: '',
    shelfQ: '',
    shelfFilter: 'all', /* 'all' | 'peak' | 'frozen' | 'golden' | 'low' */
    shelfSort: 'use_first', /* 'use_first' | 'cups_left' | 'newest' | 'name' */
    showAllBags: false,
    priceDraft: {
      coffee: '',
      roaster: '',
      size: 250,
      unit: 'g',
      price: 21.00,
      currency: '$',
      rlevel: 'light',
      date: '',
      roast: '',
      notes: '',
      bag_notes: '',
      origin: '',
      process: '',
      varietal: '',
      elevation_m: ''
    }
  };

  function buildGoldSealSvg(sizePx) {
    if (S && typeof S.buildGoldSealSvg === 'function') return S.buildGoldSealSvg(sizePx);
    var sz = sizePx || 28;
    var wrap = S.h('span', { class: 'bt-ico', 'aria-hidden': 'true', style: 'display:inline-flex;align-items:center' });
    wrap.innerHTML = '<svg viewBox="0 0 48 48" width="' + sz + '" height="' + sz + '" focusable="false">' +
      '<circle cx="24" cy="24" r="21" fill="#F2AE4B" stroke="#9A6B16" stroke-width="2.2"/>' +
      '<circle cx="24" cy="24" r="16.5" fill="none" stroke="#FFFDF9" stroke-width="1.3" stroke-dasharray="2.5 2"/>' +
      '<path d="M16.5 24.5 L21.5 29.5 L32 18.5" fill="none" stroke="#1F1712" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>';
    return wrap;
  }

  function hasActiveHomeDraft() {
    var a = S.getApp();
    if (!a) return false;
    var step = String(a.brewStep || 'door');
    if (step === 'timer' || step === 'taste') return true;
    return !!(a.coffee && a.coffee.name && (step === 'method' || step === 'brew'));
  }

  function homeDraftReturnLabel() {
    var a = S.getApp();
    var step = String((a && a.brewStep) || 'door');
    var cName = (a && a.coffee && a.coffee.name) ? unneutCellar(a.coffee.name) : '';
    var shortName = cName ? (' \u00B7 ' + (cName.length > 26 ? (cName.slice(0, 25) + '\u2026') : cName)) : '';
    if (step === 'taste') return '\u2190 Back to Tasting' + shortName;
    if (step === 'timer') return '\u2190 Back to Brew Timer' + shortName;
    if (step === 'brew' || step === 'method') return '\u2190 Back to Home Brew' + shortName;
    return '\u2190 Home Brew';
  }

  function homeDraftReturnRoute() {
    var a = S.getApp();
    var step = String((a && a.brewStep) || 'door');
    if (step === 'taste') return 'taste';
    if (step === 'timer') return 'timer';
    if (step === 'brew') return 'recipe';
    if (step === 'method') return 'method';
    return 'door';
  }

  /* Navigate to Step 3 Recipe WITHOUT pre-mutating a.activeTab/a.brewStep so BTShell._navHistoryStack records Cellar! */
  function navigateToHomeRecipe() {
    var a = S.getApp();
    if (a && a.tabSegments) a.tabSegments.cellar = ui.seg;
    S.saveDraftSafe();
    S.navGo('recipe');
  }

  function normCoffeeKeyPart(v) {
    return String(v == null ? '' : v).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function isSyntheticCoffeeId(id) {
    var s = String(id == null ? '' : id).trim();
    return !s || s === 'cf_1' || /^uf_|^bag_/i.test(s);
  }

  function isIsoDateCellar(v) {
    return /^\d{4}-\d{2}(?:-\d{2})?$/.test(String(v == null ? '' : v).trim());
  }

  function unneutCellar(v) {
    var s = String(v == null ? '' : v);
    if (typeof unneutralize === 'function') {
      try { s = unneutralize(s); } catch (_) {}
    }
    return s.trim();
  }

  function isUnkCoffeeVal(v) {
    var s = String(v == null ? '' : v).trim().toLowerCase();
    if (!s) return true;
    var compact = s.replace(/[^a-z0-9]/g, '');
    return compact === 'unknown' || compact === 'unsure' || compact === 'notsure' ||
      compact === 'dontknow' || compact === 'idontknow' || compact === 'unlisted' ||
      compact === 'unlabeled' || compact === 'none' || compact === 'nonelisted' ||
      compact === 'notonbag' || compact === 'na';
  }

  function pickRichStr() {
    for (var i = 0; i < arguments.length; i++) {
      var val = arguments[i];
      if (val == null) continue;
      var s = unneutCellar(val);
      if (s && !isUnkCoffeeVal(s)) return s;
    }
    return '';
  }

  function pickPosNum() {
    for (var i = 0; i < arguments.length; i++) {
      var n = +arguments[i];
      if (isFinite(n) && n > 0) return n;
    }
    return null;
  }

  function pickNonNegNum() {
    for (var i = 0; i < arguments.length; i++) {
      var raw = arguments[i];
      if (raw === '' || raw == null) continue;
      var n = +raw;
      if (isFinite(n) && n >= 0) return n;
    }
    return null;
  }

  function readRowAdapMetaSafe(row) {
    if (!row || typeof row !== 'object') return null;
    var raw = row.recipe_adaptation_json;
    if (!raw) return null;
    try {
      var parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : null;
    } catch (_) {
      return null;
    }
  }

  function parseJsonObjSafe(raw) {
    if (!raw) return null;
    if (typeof raw === 'object' && !Array.isArray(raw)) return raw;
    if (typeof raw !== 'string') return null;
    try {
      var parsed = JSON.parse(raw);
      return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : null;
    } catch (_) {
      return null;
    }
  }

  function fmtBlendGrams(g) {
    var n = parseFloat(g);
    if (!isFinite(n) || n <= 0) return '';
    var rounded = Math.round(n * 10) / 10;
    return String(rounded).replace(/\.0$/, '') + 'g';
  }

  function normalizeBlendComponent(raw, fallbackName) {
    var c = (raw && typeof raw === 'object') ? raw : {};
    var wG = parseFloat(c.weightG != null ? c.weightG : (c.doseG != null ? c.doseG : c.grams));
    var rPct = parseFloat(c.ratioPct != null ? c.ratioPct : (c.pct != null ? c.pct : c.sharePct));
    var ag = parseFloat(c.agtron);
    var elv = c.elevation_m != null && c.elevation_m !== '' ? String(c.elevation_m).trim() : '';
    var isDecaf = c.decaf === 'yes' || c.decaf === true || /decaf/i.test(String(c.decaf || ''));
    return {
      coffeeId: String(c.coffeeId || c.coffee_id || c.id || '').trim(),
      name: unneutCellar(c.name || c.coffee_name || c.coffee || '') || fallbackName || 'Coffee',
      roaster: unneutCellar(c.roaster || ''),
      roast: unneutCellar(c.roast || c.roast_level || ''),
      agtron: isFinite(ag) && ag > 0 ? ag : '',
      process: unneutCellar(c.process || ''),
      origin: unneutCellar(c.origin || ''),
      elevation_m: elv,
      varietal: unneutCellar(c.varietal || ''),
      decaf: isDecaf ? 'yes' : '',
      species: unneutCellar(c.species || '') || 'arabica',
      weightG: (isFinite(wG) && wG > 0) ? Math.round(wG * 10) / 10 : 0,
      ratioPct: (isFinite(rPct) && rPct > 0) ? Math.round(rPct) : 0
    };
  }

  function extractRowBlendInfo(rowOrBag) {
    if (!rowOrBag || typeof rowOrBag !== 'object') return { isBlend: false, components: [] };
    var ad = readRowAdapMetaSafe(rowOrBag) || {};
    var ej = parseJsonObjSafe(rowOrBag.extra_json) || {};
    var directCe = parseJsonObjSafe(rowOrBag.coffee_extra) || {};
    var adCe = (ad.coffee_extra && typeof ad.coffee_extra === 'object') ? ad.coffee_extra : {};
    var ejCe = (ej.coffee_extra && typeof ej.coffee_extra === 'object') ? ej.coffee_extra : {};

    var rawComps = null;
    if (Array.isArray(adCe.blendComponents) && adCe.blendComponents.length >= 2) rawComps = adCe.blendComponents;
    else if (Array.isArray(ejCe.blendComponents) && ejCe.blendComponents.length >= 2) rawComps = ejCe.blendComponents;
    else if (Array.isArray(ej.blendComponents) && ej.blendComponents.length >= 2) rawComps = ej.blendComponents;
    else if (Array.isArray(directCe.blendComponents) && directCe.blendComponents.length >= 2) rawComps = directCe.blendComponents;
    else if (Array.isArray(ad.blendComponents) && ad.blendComponents.length >= 2) rawComps = ad.blendComponents;
    else if (Array.isArray(rowOrBag.blendComponents) && rowOrBag.blendComponents.length >= 2) rawComps = rowOrBag.blendComponents;

    var bd = ad.blendBreakdown || ad.blend_breakdown || adCe.blendBreakdown || ej.blendBreakdown || ejCe.blendBreakdown || directCe.blendBreakdown || rowOrBag.blendBreakdown || null;
    if (!rawComps && bd && typeof bd === 'object' && (bd.nameA || bd.nameB || +bd.doseA_g > 0 || +bd.doseB_g > 0)) {
      rawComps = [
        { coffeeId: bd.coffeeIdA || '', name: bd.nameA || 'Coffee A', weightG: +bd.doseA_g || 0, ratioPct: +bd.pctA || 0 },
        { coffeeId: bd.coffeeIdB || '', name: bd.nameB || 'Coffee B', weightG: +bd.doseB_g || 0, ratioPct: +bd.pctB || 0 }
      ];
    }

    var flag = !!(
      adCe.isBlend === true || adCe.isBlend === 'yes' ||
      ejCe.isBlend === true || ejCe.isBlend === 'yes' ||
      ej.isBlend === true || ej.isBlend === 'yes' ||
      directCe.isBlend === true || directCe.isBlend === 'yes' ||
      ad.isBlend === true ||
      (bd && bd.isBlend === true) ||
      rowOrBag.isBlend === true
    );

    if (!rawComps || rawComps.length < 2) {
      return { isBlend: false, components: [] };
    }
    if (!flag && !(rawComps[0] && rawComps[1] && (rawComps[0].name || rawComps[0].coffeeId) && (rawComps[1].name || rawComps[1].coffeeId))) {
      return { isBlend: false, components: [] };
    }

    var compA = normalizeBlendComponent(rawComps[0], 'Coffee A');
    var compB = normalizeBlendComponent(rawComps[1], 'Coffee B');
    var totalDose = parseFloat(rowOrBag.brew_dose_g || rowOrBag.doseG || rowOrBag.dose || 0);
    if (!isFinite(totalDose) || totalDose <= 0) totalDose = 0;

    var wA = compA.weightG > 0 ? compA.weightG : (bd && +bd.doseA_g > 0 ? +bd.doseA_g : 0);
    var wB = compB.weightG > 0 ? compB.weightG : (bd && +bd.doseB_g > 0 ? +bd.doseB_g : 0);
    var pA = compA.ratioPct > 0 ? compA.ratioPct : (bd && +bd.pctA > 0 ? +bd.pctA : 0);
    var pB = compB.ratioPct > 0 ? compB.ratioPct : (bd && +bd.pctB > 0 ? +bd.pctB : 0);

    if (wA > 0 && wB > 0) {
      var wSum = wA + wB;
      pA = Math.round((wA / wSum) * 100);
      pB = 100 - pA;
    } else if (pA > 0 || pB > 0) {
      var pSum = (pA > 0 ? pA : 0) + (pB > 0 ? pB : 0);
      if (pSum > 0) {
        pA = Math.round(((pA > 0 ? pA : 0) / pSum) * 100);
        pB = 100 - pA;
      } else {
        pA = 50; pB = 50;
      }
      if (totalDose > 0) {
        wA = Math.round((totalDose * (pA / 100)) * 10) / 10;
        wB = Math.round((totalDose - wA) * 10) / 10;
      }
    } else {
      pA = 50; pB = 50;
      if (totalDose > 0) {
        wA = Math.round((totalDose * 0.5) * 10) / 10;
        wB = Math.round((totalDose - wA) * 10) / 10;
      }
    }

    compA.weightG = wA > 0 ? Math.round(wA * 10) / 10 : 0;
    compB.weightG = wB > 0 ? Math.round(wB * 10) / 10 : 0;
    compA.ratioPct = pA;
    compB.ratioPct = pB;

    var wPart = (compA.weightG > 0 && compB.weightG > 0) ? (fmtBlendGrams(compA.weightG) + ' + ' + fmtBlendGrams(compB.weightG) + ' \u00B7 ') : '';
    var pillText = '2-Coffee Blend (' + wPart + pA + '%/' + pB + '%)';
    var partA = compA.name + ' (' + (compA.weightG > 0 ? (fmtBlendGrams(compA.weightG) + ' \u00B7 ') : '') + pA + '%)';
    var partB = compB.name + ' (' + (compB.weightG > 0 ? (fmtBlendGrams(compB.weightG) + ' \u00B7 ') : '') + pB + '%)';
    var detailLine = partA + ' + ' + partB;

    return {
      isBlend: true,
      components: [compA, compB],
      doseA_g: compA.weightG,
      doseB_g: compB.weightG,
      pctA: pA,
      pctB: pB,
      nameA: compA.name,
      nameB: compB.name,
      pillText: pillText,
      detailLine: detailLine
    };
  }

  function extractRowV74Meta(row) {
    if (!row || typeof row !== 'object') {
      return { brewerMaterialLabel: '', tempProfileLabel: '', palateTargetsLabel: '', appliedRecipeTags: [] };
    }
    var ad = readRowAdapMetaSafe(row) || {};
    var ej = parseJsonObjSafe(row.extra_json) || {};
    var ce = (ad.coffee_extra && typeof ad.coffee_extra === 'object') ? ad.coffee_extra
      : ((ej.coffee_extra && typeof ej.coffee_extra === 'object') ? ej.coffee_extra : (parseJsonObjSafe(row.coffee_extra) || {}));

    var rawMat = String(ad.brewerMaterial || ad.brewer_material || ej.brewerMaterial || ej.brewer_material || ce.brewerMaterial || row.brewer_material || '').trim();
    var rawPre = String(ad.preheat || ad.brewerPreheat || ad.preheat_habit || ej.preheat || ej.brewerPreheat || ce.preheat || row.brewer_preheat || '').trim();
    var matMap = { plastic: 'Plastic', ceramic: 'Ceramic', glass: 'Glass', metal: 'Metal' };
    var preMap = { boiling_rinse: 'Boiling Rinse', warm_rinse: 'Warm Rinse', none: 'Cold / Dry' };
    var matHuman = rawMat ? (matMap[rawMat.toLowerCase()] || rawMat.replace(/[_-]+/g, ' ').replace(/\b[a-z]/g, function (c) { return c.toUpperCase(); })) : '';
    var preHuman = rawPre ? (preMap[rawPre.toLowerCase()] || rawPre.replace(/[_-]+/g, ' ').replace(/\b[a-z]/g, function (c) { return c.toUpperCase(); })) : '';
    var brewerMaterialLabel = [matHuman, preHuman].filter(Boolean).join(' \u00B7 ');

    var tp = ad.tempProfile || ad.temp_profile || ej.tempProfile || ej.temp_profile || ce.tempProfile || row.temp_profile || null;
    var tempProfileLabel = '';
    if (tp && typeof tp === 'object') {
      var sT = parseFloat(tp.startTempC != null ? tp.startTempC : tp.start_c);
      var eT = parseFloat(tp.tailTempC != null ? tp.tailTempC : (tp.endTempC != null ? tp.endTempC : tp.tail_c));
      if (isFinite(sT) && sT > 0 && isFinite(eT) && eT > 0) {
        tempProfileLabel = Math.round(sT) + ' \u2192 ' + Math.round(eT) + ' \u00B0C' + (tp.type === 'step-down' ? ' (Step-Down)' : '');
      }
    } else if (typeof tp === 'string' && tp.trim()) {
      tempProfileLabel = tp.trim();
    }

    var pt = ad.palateTargets || ad.palate_targets || ej.palateTargets || ej.palate_targets || ce.palateTargets || row.palate_targets || null;
    var palateTargetsLabel = '';
    if (pt && typeof pt === 'object') {
      var capWord = function (w) {
        var s = String(w || '').trim().toLowerCase();
        if (!s) return '';
        if (s === 'bright') return 'Bright';
        if (s === 'smooth') return 'Smooth';
        if (s === 'light') return 'Light Strength';
        if (s === 'strong') return 'Strong';
        if (s === 'clarity') return 'High Clarity';
        if (s === 'body') return 'Full Body';
        if (s === 'medium' || s === 'balanced') return 'Balanced';
        return s.charAt(0).toUpperCase() + s.slice(1);
      };
      var ptBits = [];
      if (pt.brightness) ptBits.push(capWord(pt.brightness));
      if (pt.strength) ptBits.push(capWord(pt.strength));
      if (pt.texture) ptBits.push(capWord(pt.texture));
      if (ptBits.length) {
        palateTargetsLabel = ptBits.join(' \u00B7 ');
      }
    } else if (typeof pt === 'string' && pt.trim()) {
      palateTargetsLabel = pt.trim();
    }

    var rawTags = ad.appliedRecipeTags || ad.applied_recipe_tags || ej.appliedRecipeTags || ce.appliedRecipeTags || [];
    var appliedRecipeTags = Array.isArray(rawTags)
      ? rawTags.map(function (t) { return String(t || '').trim(); }).filter(Boolean)
      : [];

    return {
      brewerMaterialLabel: brewerMaterialLabel,
      tempProfileLabel: tempProfileLabel,
      palateTargetsLabel: palateTargetsLabel,
      appliedRecipeTags: appliedRecipeTags
    };
  }

  function formatDialSymLabel(sym) {
    var s = String(sym || '').trim();
    if (!s) return '';
    var map = {
      sour: 'Sour / Under-extracted',
      bitter: 'Bitter / Over-extracted',
      weak: 'Weak / Thin',
      strong: 'Strong / Heavy',
      astringent: 'Dry / Astringent',
      balanced: 'Balanced'
    };
    return map[s.toLowerCase()] || s.replace(/_/g, ' ').replace(/\b[a-z]/g, function (c) { return c.toUpperCase(); });
  }

  function extractRowRecommendation(r) {
    if (!r || typeof r !== 'object') return { hasRec: false, isLocked: false };
    var isLocked = r.dial_locked === 'yes' || r.dial_locked === '1';
    if (isLocked) return { hasRec: false, isLocked: true };
    var ad = readRowAdapMetaSafe(r) || {};
    var nr = (ad && ad.next_recipe && typeof ad.next_recipe === 'object') ? ad.next_recipe : null;
    var dialChange = String(unneutCellar(r.dial_change || '') || (ad && ad.dial_change) || (nr && nr.headline) || '').trim();
    var dialSym = String(unneutCellar(r.dial_symptom || '') || (ad && ad.dial_symptom) || (nr && nr.symptom) || unneutCellar(r.fix_symptom || '') || '').trim();
    var hasNextFields = !!(nr && (nr.grindUm || nr.d50Um || nr.grindSetting || nr.tempC || nr.tempF || nr.ratio || nr.agitation));
    if (!dialChange && !hasNextFields) return { hasRec: false, isLocked: false, dialSym: dialSym };

    var bGrind = unneutCellar(r.brew_grind_setting || '') || (+r.brew_grind_target_um > 0 ? (+r.brew_grind_target_um + ' \u00B5m') : '');
    var bTempC = +r.brew_temp_c > 0 ? Math.round(+r.brew_temp_c) : (+r.brew_temp_f > 0 ? Math.round((+r.brew_temp_f - 32) * 5 / 9) : 0);
    var bRatio = +r.brew_ratio > 0 ? +r.brew_ratio : ((+r.brew_dose_g > 0 && +r.brew_water_g > 0) ? Math.round((+r.brew_water_g / +r.brew_dose_g) * 10) / 10 : 0);
    var bAgit = String(r.brew_agitation || '').trim();

    var nGrind = nr ? (String(nr.grindSetting || '').trim() || (+nr.grindUm > 0 ? (+nr.grindUm + ' \u00B5m') : (+nr.d50Um > 0 ? (+nr.d50Um + ' \u00B5m') : ''))) : '';
    var nTempC = nr ? (+nr.tempC > 0 ? Math.round(+nr.tempC) : (+nr.tempF > 0 ? Math.round((+nr.tempF - 32) * 5 / 9) : 0)) : 0;
    var nRatio = nr && +nr.ratio > 0 ? +nr.ratio : 0;
    var nAgit = nr && nr.agitation ? String(nr.agitation).trim() : '';

    var diffs = [];
    if (nGrind) {
      if (bGrind && bGrind !== nGrind) {
        var mB = bGrind.match(/^([\d.]+)\s*clicks$/i);
        var mN = nGrind.match(/^([\d.]+)\s*clicks$/i);
        diffs.push((mB && mN) ? (mB[1] + ' \u2192 ' + mN[1] + ' clicks') : (bGrind + ' \u2192 ' + nGrind));
      } else {
        diffs.push(nGrind);
      }
    }
    if (nTempC > 0) {
      diffs.push((bTempC > 0 && bTempC !== nTempC) ? (bTempC + ' \u2192 ' + nTempC + '\u00B0C') : (nTempC + '\u00B0C'));
    }
    if (nRatio > 0) {
      diffs.push((bRatio > 0 && Math.abs(bRatio - nRatio) >= 0.05) ? ('1:' + bRatio + ' \u2192 1:' + nRatio) : ('1:' + nRatio));
    }
    if (nAgit) {
      diffs.push((bAgit && bAgit !== nAgit) ? (bAgit + ' \u2192 ' + nAgit + ' agitation') : (nAgit + ' agitation'));
    }

    var brewedParts = [bGrind, bTempC > 0 ? (bTempC + '\u00B0C') : '', bRatio > 0 ? ('1:' + bRatio) : ''].filter(Boolean);
    var nextParts = [nGrind, nTempC > 0 ? (nTempC + '\u00B0C') : '', nRatio > 0 ? ('1:' + nRatio) : '', nAgit].filter(Boolean);

    return {
      hasRec: true,
      isLocked: false,
      nextRx: nr,
      dialChange: dialChange,
      dialSym: dialSym,
      diffLine: diffs.join(' \u00B7 '),
      brewedLine: brewedParts.join(' \u00B7 '),
      nextLine: nextParts.join(' \u00B7 ')
    };
  }

  var CVA_8_TRAITS = [
    { key: 'fragrance', label: 'Fragrance', hint: 'Dry ground aroma before pouring hot water' },
    { key: 'aroma', label: 'Aroma', hint: 'Wet aroma on pour & breaking the 4:00 crust' },
    { key: 'flavor', label: 'Flavor', hint: 'Combined taste & retronasal flavor when slurping' },
    { key: 'aftertaste', label: 'Aftertaste', hint: 'Sweetness, cleanliness & linger of the finish' },
    { key: 'acidity', label: 'Acidity', hint: 'Bright, juicy fruit liveliness (apple, berry, citrus)' },
    { key: 'sweetness', altKey: 'q_sweetness', label: 'Sweetness', hint: 'Ripe fruit, honey or caramel roundness' },
    { key: 'body', label: 'Body', hint: 'Mouthfeel weight, silkiness & tactile texture' },
    { key: 'overall', label: 'Overall', hint: 'Holistic harmony & personal enjoyment' }
  ];

  function isCuppingRow(r) {
    if (!r || typeof r !== 'object') return false;
    var mk = String(r.brew_method || '').toLowerCase();
    var sk = String(r.score_kind || '').toLowerCase();
    if (mk === 'cupping' || sk === 'cva_affective') return true;
    var filled = 0;
    CVA_8_TRAITS.forEach(function (tr) {
      var v = parseFloat(r[tr.key] != null && r[tr.key] !== '' ? r[tr.key] : (tr.altKey ? r[tr.altKey] : ''));
      if (isFinite(v) && v > 0) filled++;
    });
    return filled >= 4;
  }

  function extractRowCvaTraits(r) {
    if (!r || typeof r !== 'object') return { hasAny: false, maxScale: 9, items: [] };
    var items = [];
    var maxVal = 0;
    CVA_8_TRAITS.forEach(function (tr) {
      var raw = (r[tr.key] != null && r[tr.key] !== '') ? r[tr.key] : (tr.altKey ? r[tr.altKey] : '');
      var num = parseFloat(raw);
      var valid = isFinite(num) && num > 0;
      if (valid && num > maxVal) maxVal = num;
      items.push({ key: tr.key, label: tr.label, hint: tr.hint, val: valid ? num : null });
    });
    var filledItems = items.filter(function (it) { return it.val != null; });
    if (!filledItems.length) return { hasAny: false, maxScale: 9, items: items };
    var maxScale = maxVal > 9.05 ? 10 : 9;
    var hi = Math.max.apply(null, filledItems.map(function (it) { return it.val; }));
    var lo = Math.min.apply(null, filledItems.map(function (it) { return it.val; }));
    items.forEach(function (it) {
      it.pct = it.val != null ? Math.max(6, Math.min(100, Math.round((it.val / maxScale) * 100))) : 0;
      it.isHigh = it.val != null && filledItems.length >= 2 && hi - lo >= 0.25 && Math.abs(it.val - hi) < 0.01;
      it.isLow = it.val != null && filledItems.length >= 2 && hi - lo >= 0.25 && Math.abs(it.val - lo) < 0.01;
    });
    return { hasAny: true, maxScale: maxScale, items: items, hi: hi, lo: lo };
  }

  function classifyJournalRatingTier(r) {
    if (!r) return '';
    var st = parseFloat(r.my_rating_stars) || 0;
    if (st <= 0) {
      var sc = parseFloat(r.total_score) || 0;
      if (sc >= 60) st = Math.max(1, Math.min(5, 1 + ((sc - 58) / 34) * 4));
    }
    if (st <= 0) return '';
    if (st >= 4.875) return 'tier5';
    if (st >= 4.0) return 'tier4';
    if (st >= 3.0) return 'tier3';
    return 'tierLow';
  }

  function buildCvaDetailScorecard(r, hObjs) {
    var parsed = extractRowCvaTraits(r);
    if (!parsed.hasAny) return null;
    var activeKey = '';
    var host = S.h('section', { class: 'bt-tc-well bt-cva-detail-card', id: 'bt-detail-cva-grid', style: 'gap:8px' });
    var noteEl = S.h('p', { class: 'bt-tc-sub', style: 'margin:0', text: 'Tap any attribute pill to inspect what it measures & compare against your cupping average.' });

    /* Compute personal averages across logged cupping rows for comparison */
    var cupRows = (Array.isArray(hObjs) ? hObjs : []).filter(isCuppingRow);
    var avgByTrait = Object.create(null);
    CVA_8_TRAITS.forEach(function (tr) {
      var sum = 0, n = 0;
      cupRows.forEach(function (cr) {
        var v = parseFloat(cr[tr.key] != null && cr[tr.key] !== '' ? cr[tr.key] : (tr.altKey ? cr[tr.altKey] : ''));
        if (isFinite(v) && v > 0) { sum += v; n++; }
      });
      if (n > 0) avgByTrait[tr.key] = +(sum / n).toFixed(2);
    });

    var gridEl = S.h('div', { class: 'bt-sca-attr-grid' });
    var pillRefs = [];

    function paintPills() {
      gridEl.textContent = '';
      pillRefs.length = 0;
      parsed.items.forEach(function (it) {
        if (it.val == null) return;
        var isAct = activeKey === it.key;
        var btn = S.h('button', {
          type: 'button',
          class: 'bt-sca-attr-pill bt-drillable' + (isAct ? ' is-active' : '') + (it.isHigh ? ' is-high' : '') + (it.isLow ? ' is-low' : ''),
          'aria-pressed': String(isAct),
          onclick: function () {
            activeKey = (activeKey === it.key) ? '' : it.key;
            var myAvg = avgByTrait[it.key];
            if (activeKey) {
              var deltaTxt = (myAvg != null && cupRows.length >= 2)
                ? (' (Your cupping avg: ' + myAvg.toFixed(1) + '/' + parsed.maxScale + ', ' + (it.val >= myAvg ? '+' : '') + (it.val - myAvg).toFixed(1) + ')')
                : '';
              noteEl.textContent = it.label + ' (' + it.val.toFixed(1).replace(/\.0$/, '') + '/' + parsed.maxScale + '): ' + it.hint + '.' + deltaTxt;
            } else {
              noteEl.textContent = 'Tap any attribute pill to inspect what it measures & compare against your cupping average.';
            }
            S.haptic('tick');
            paintPills();
          }
        },
          S.h('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:6px;width:100%' },
            S.h('span', { class: 'bt-sca-attr-name', text: it.label }),
            S.h('strong', { class: 'bt-sca-attr-val mono', text: it.val.toFixed(1).replace(/\.0$/, '') + '/' + parsed.maxScale })
          ),
          S.h('div', { class: 'bt-rating-dist-track', style: 'width:100%' },
            S.h('div', { class: 'bt-rating-dist-fill', style: 'width:' + it.pct + '%' })
          )
        );
        pillRefs.push(btn);
        gridEl.appendChild(btn);
      });
    }
    paintPills();

    var taintN = parseInt(r.taint_cups, 10) || 0;
    var faultN = parseInt(r.fault_cups, 10) || 0;
    var totalSca = parseFloat(r.total_score) || 0;

    host.appendChild(S.h('div', { class: 'bt-tc-row-between' },
      S.h('span', { class: 'bt-tc-kicker', text: 'SCA / CVA 8-Trait Cupping Scorecard' }),
      S.h('div', { style: 'display:flex;gap:5px;flex-wrap:wrap;align-items:center' },
        totalSca > 0 ? S.h('span', { class: 'bt-tc-badge is-good mono', text: totalSca.toFixed(2) + ' / 100 SCA' }) : null,
        (taintN > 0 || faultN > 0) ? S.h('span', { class: 'bt-tc-badge is-warn mono', text: 'Taints: ' + taintN + ' \u00B7 Faults: ' + faultN }) : S.h('span', { class: 'bt-tc-badge is-sci', text: 'Clean Cup (0 Defects)' })
      )
    ));
    host.appendChild(gridEl);
    host.appendChild(noteEl);
    return host;
  }

  function findNewestHistoryEntry(hObjs) {
    if (!Array.isArray(hObjs) || !hObjs.length) return null;
    var bestIdx = -1;
    var bestRow = null;
    var bestKey = '';
    var normTs = function (r) {
      if (!r || typeof r !== 'object') return '';
      var sa = String(r.saved_at || '').trim();
      if (/^\d{4}-\d{2}-\d{2}/.test(sa)) return sa;
      var cd = String(r.cupping_date || r.brew_date || r.date || '').trim();
      if (/^\d{4}-\d{2}-\d{2}/.test(cd)) return cd + 'T00:00:00Z';
      return sa || cd || '';
    };
    for (var i = 0; i < hObjs.length; i++) {
      var r = hObjs[i];
      if (!r || typeof r !== 'object') continue;
      var k = normTs(r);
      if (!bestRow || (k && (!bestKey || k > bestKey)) || (k === bestKey && i > bestIdx)) {
        bestRow = r;
        bestIdx = i;
        bestKey = k;
      }
    }
    return bestRow ? { r: bestRow, idx: bestIdx } : null;
  }

  function buildLastCupJumpBar(hObjs) {
    var newest = findNewestHistoryEntry(hObjs);
    if (!newest || !newest.r) return null;
    var lastIdx = newest.idx;
    var lastRow = newest.r;
    var cName = unneutCellar(lastRow.coffee_name || '') || 'Latest Brew';
    var rName = unneutCellar(lastRow.roaster || '');
    var st = parseFloat(lastRow.my_rating_stars) || 0;
    var sc = parseFloat(lastRow.total_score) || 0;
    var metaTxt = st > 0 ? (st.toFixed(2) + '\u2605') : (sc > 0 ? (sc.toFixed(1) + ' SCA') : 'Logged');
    return S.h('div', { class: 'bt-tc-well', id: 'bt-cellar-last-cup-card', style: 'flex-direction:row;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;padding:10px 12px' },
      S.h('div', { style: 'min-width:0;flex:1 1 180px' },
        S.h('span', { class: 'bt-tc-kicker', text: 'Last Cup Logged' + (lastRow.cupping_date ? (' \u00B7 ' + lastRow.cupping_date) : '') }),
        S.h('div', { style: 'font-weight:800;font-size:0.92rem;color:var(--ink);overflow-wrap:anywhere' },
          cName + (rName ? (' \u00B7 ' + rName) : '')
        )
      ),
      S.h('button', {
        type: 'button',
        class: 'bt-tc-pill is-compact is-copper bt-last-cup-btn',
        onclick: function () { openTastingDetailSheet(lastIdx); }
      },
        S.h('span', { class: 'bt-last-cup-name', text: 'Inspect ' + cName }),
        S.h('span', { class: 'bt-last-cup-meta mono', text: '(' + metaTxt + ') \u2192' })
      )
    );
  }

  function buildSavedNextBrewCallout(r, compact) {
    var info = extractRowRecommendation(r);
    if (!info.hasRec || info.isLocked) return null;
    var symTxt = formatDialSymLabel(info.dialSym);
    var cName = unneutCellar(r.coffee_name || '').trim();
    var headerLbl = cName
      ? ('Saved Next-Brew Recommendation for ' + cName)
      : 'Saved Next-Brew Recommendation (Toward Golden Recipe)';
    return S.h('div', {
      class: 'bt-tc-well bt-journal-next-rec',
      style: 'border-left:3px solid var(--accent-copper, #B86B35);padding:' + (compact ? '8px 10px' : '10px 12px') + ';gap:4px'
    },
      S.h('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap' },
        S.h('span', { class: 'bt-tc-kicker', style: 'color:var(--accent-copper, #B86B35)', text: headerLbl }),
        symTxt ? S.h('span', { class: 'bt-tc-badge is-copper', text: symTxt }) : null
      ),
      info.dialChange ? S.h('div', { style: 'font-size:0.84rem;font-weight:700;color:var(--ink)', text: info.dialChange }) : null,
      info.diffLine ? S.h('div', { class: 'mono', style: 'font-size:0.78rem;color:var(--ink-secondary)', text: info.diffLine }) : null,
      (!compact && info.brewedLine && info.nextLine) ? S.h('div', {
        class: 'mono',
        style: 'font-size:0.74rem;color:var(--ink-muted)',
        text: 'Brewed: ' + info.brewedLine + '  \u2192  Next: ' + info.nextLine
      }) : null
    );
  }

  function getCoffeeHistoryChronological(coffeeName, roaster, coffeeId, hObjs) {
    var list = Array.isArray(hObjs) ? hObjs : S.getHistoryObjs();
    var cleanCid = isSyntheticCoffeeId(coffeeId) ? '' : String(coffeeId).trim();
    var nName = normCoffeeKeyPart(unneutCellar(coffeeName || ''));
    var nRoast = normCoffeeKeyPart(unneutCellar(roaster || ''));
    if (!cleanCid && !nName) return [];

    var matches = [];
    list.forEach(function (r, idx) {
      if (!r || typeof r !== 'object') return;
      var rCid = isSyntheticCoffeeId(r.coffee_id) ? '' : String(r.coffee_id).trim();
      var rName = normCoffeeKeyPart(unneutCellar(r.coffee_name || ''));
      var rRoast = normCoffeeKeyPart(unneutCellar(r.roaster || ''));
      var hit = false;
      if (cleanCid && rCid && cleanCid === rCid) hit = true;
      else if (nName && rName === nName && (!nRoast || !rRoast || rRoast === nRoast)) hit = true;
      if (hit) matches.push({ r: r, idx: idx });
    });

    matches.sort(function (a, b) {
      var ta = String(a.r.saved_at || a.r.cupping_date || '');
      var tb = String(b.r.saved_at || b.r.cupping_date || '');
      if (ta !== tb) return ta.localeCompare(tb);
      var aa = +(a.r.brew_attempt) || 0;
      var ab = +(b.r.brew_attempt) || 0;
      if (aa !== ab) return aa - ab;
      return a.idx - b.idx;
    });
    return matches.map(function (m) { return m.r; });
  }

  function buildDialInConvergenceTimeline(chronRows, currentRow, opts) {
    opts = opts || {};
    if (!Array.isArray(chronRows) || chronRows.length < 2) return null;
    var hasAnyGold = chronRows.some(function (tr) { return tr && (tr.dial_locked === 'yes' || tr.dial_locked === '1'); });
    var nodes = [];
    chronRows.forEach(function (tr, idx) {
      if (!tr) return;
      var tryNum = (+tr.brew_attempt > 0) ? Math.round(+tr.brew_attempt) : (idx + 1);
      var clicksTxt = unneutCellar(tr.brew_grind_setting || '') || (+tr.brew_grind_target_um > 0 ? (+tr.brew_grind_target_um + ' \u00B5m') : '');
      var tempC = +tr.brew_temp_c > 0 ? Math.round(+tr.brew_temp_c) : (+tr.brew_temp_f > 0 ? Math.round((+tr.brew_temp_f - 32) * 5 / 9) : 0);
      var tempTxt = tempC > 0 ? (tempC + '\u00B0C') : '';
      var tdsEyTxt = tr.brew_tds_pct ? (tr.brew_tds_pct + '% TDS' + (tr.brew_ey_pct ? (' / ' + tr.brew_ey_pct + '% EY') : '')) : '';
      var starsVal = parseFloat(tr.my_rating_stars) || 0;
      var scaVal = parseFloat(tr.total_score) || 0;
      var isGold = tr.dial_locked === 'yes' || tr.dial_locked === '1';
      var isCur = !!(currentRow && (tr === currentRow || (currentRow.id && tr.id === currentRow.id)));
      var specParts = [clicksTxt, tempTxt, tdsEyTxt].filter(Boolean);
      if (!specParts.length) specParts.push(S.humanMethodName(tr.brew_method));

      var nodeBtn = S.h('button', {
        type: 'button',
        class: 'bt-dial-node' + (isGold ? ' is-locked' : '') + (isCur ? ' is-current' : ''),
        style: 'min-width:0;max-width:100%;text-align:left',
        'aria-label': 'Inspect Try #' + tryNum + (isGold ? ' Golden Locked' : ''),
        onclick: function (e) {
          if (e && e.stopPropagation) e.stopPropagation();
          openTastingDetailSheet(tr);
        }
      },
        S.h('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:5px;flex-wrap:wrap' },
          S.h('span', { class: 'mono', style: 'font-weight:800;font-size:0.78rem', text: '#' + tryNum }),
          isGold ? S.h('span', { style: 'display:inline-flex;align-items:center;gap:3px' }, buildGoldSealSvg(14)) : null,
          starsVal > 0 ? S.h('span', { class: 'mono', style: 'display:inline-flex;align-items:center;gap:2px;font-size:0.76rem;font-weight:700' },
            S.iconEl('spark-star', { size: 12 }),
            S.h('span', { text: starsVal.toFixed(2) })
          ) : (scaVal > 0 ? S.h('span', { class: 'mono', style: 'font-size:0.74rem;font-weight:700', text: scaVal.toFixed(1) + ' SCA' }) : null)
        ),
        S.h('div', { class: 'mono', style: 'font-size:0.72rem;color:var(--ink-secondary);line-height:1.3;overflow-wrap:anywhere', text: specParts.join(' \u00B7 ') })
      );
      nodes.push(nodeBtn);
      if (idx < chronRows.length - 1) {
        nodes.push(S.h('span', { class: 'bt-dial-arrow', 'aria-hidden': 'true', style: 'align-self:center;font-weight:800;color:var(--ink-muted)', text: '\u2192' }));
      }
    });

    return S.h('section', {
      class: 'bt-dial-timeline',
      'aria-label': 'Dial-In Convergence Timeline',
      style: 'display:flex;flex-direction:column;gap:7px;min-width:0;max-width:100%'
    },
      S.h('div', { class: 'bt-tc-row-between' },
        S.h('span', { class: 'bt-tc-kicker', text: 'Dial-In Convergence (' + chronRows.length + ' Tries)' }),
        hasAnyGold ? S.h('span', { class: 'bt-tc-badge is-gold', text: 'Golden Locked' }) : S.h('span', { class: 'bt-tc-badge is-sci', text: 'Try #1 \u2192 #' + chronRows.length })
      ),
      S.h('div', {
        class: 'bt-dial-timeline-track',
        style: 'display:flex;flex-wrap:wrap;align-items:stretch;gap:6px;min-width:0;max-width:100%'
      }, nodes)
    );
  }

  function pickTopGoldenRecipes(hObjs, limit) {
    var list = Array.isArray(hObjs) ? hObjs : [];
    var maxN = limit || 3;
    var candidates = [];
    list.forEach(function (r, idx) {
      if (!r || !r.coffee_name) return;
      var isGold = r.dial_locked === 'yes' || r.dial_locked === '1';
      var stars = parseFloat(r.my_rating_stars) || 0;
      if (!isGold && stars < 4.5) return;
      candidates.push({ r: r, idx: idx, isGold: isGold, stars: stars, sca: parseFloat(r.total_score) || 0 });
    });
    candidates.sort(function (a, b) {
      if (a.isGold !== b.isGold) return a.isGold ? -1 : 1;
      if (Math.abs(b.stars - a.stars) > 0.01) return b.stars - a.stars;
      if (Math.abs(b.sca - a.sca) > 0.1) return b.sca - a.sca;
      return b.idx - a.idx;
    });
    var seen = Object.create(null);
    var out = [];
    for (var i = 0; i < candidates.length && out.length < maxN; i++) {
      var r = candidates[i].r;
      var k = normCoffeeKeyPart(unneutCellar(r.coffee_name)) + '|' + normCoffeeKeyPart(unneutCellar(r.roaster || '')) + '|' + String(r.brew_method || '').toLowerCase();
      if (seen[k]) continue;
      seen[k] = true;
      out.push(r);
    }
    return out;
  }

  function buildGoldenShowcaseSection(hObjs) {
    var top = pickTopGoldenRecipes(hObjs, 3);
    if (!top.length) return null;
    return S.h('section', {
      class: 'bt-tc-card bt-golden-showcase',
      'aria-label': 'Best and Golden Recipes'
    },
      S.h('div', { class: 'bt-tc-row-between' },
        S.h('div', { style: 'min-width:0;flex:1 1 180px' },
          S.h('div', { class: 'bt-tc-kicker', text: 'Hall of Fame \u00B7 4.5+ & Golden Locked' }),
          S.h('b', { style: 'font-size:1rem', text: 'Best & Golden Recipes' })
        ),
        S.h('span', { class: 'bt-tc-badge is-gold', text: top.length + ' Top Brew' + (top.length === 1 ? '' : 's') })
      ),
      S.h('div', {
        class: 'bt-golden-showcase-grid',
        style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:9px;min-width:0'
      },
        top.map(function (r) {
          var isGold = r.dial_locked === 'yes' || r.dial_locked === '1';
          var stars = parseFloat(r.my_rating_stars) || 0;
          var cName = unneutCellar(r.coffee_name || '') || 'Golden Brew';
          var rName = unneutCellar(r.roaster || '');
          var goldBlend = extractRowBlendInfo(r);
          var tempC = +r.brew_temp_c > 0 ? Math.round(+r.brew_temp_c) : (+r.brew_temp_f > 0 ? Math.round((+r.brew_temp_f - 32) * 5 / 9) : 0);
          var specs = [
            S.humanMethodName(r.brew_method),
            (r.brew_dose_g && r.brew_water_g) ? (r.brew_dose_g + 'g:' + r.brew_water_g + 'g') : '',
            unneutCellar(r.brew_grind_setting || '') || (r.brew_grind_target_um ? (r.brew_grind_target_um + ' \u00B5m') : ''),
            tempC > 0 ? (tempC + '\u00B0C') : ''
          ].filter(Boolean).join(' \u00B7 ');
          return S.h('article', {
            class: 'bt-tc-well bt-golden-showcase-item',
            style: 'min-width:0;justify-content:space-between'
          },
            S.h('div', { class: 'bt-tc-row-between', style: 'align-items:flex-start' },
              S.h('div', { style: 'display:flex;align-items:center;gap:7px;min-width:0;flex:1' },
                isGold ? buildGoldSealSvg(20) : S.iconEl('spark-star', { size: 17 }),
                S.h('div', { style: 'min-width:0' },
                  rName ? S.h('div', { class: 'bt-tc-kicker', text: rName }) : null,
                  S.h('b', { style: 'font-size:0.9rem;display:block;overflow-wrap:anywhere', text: cName })
                )
              ),
              stars > 0 ? S.h('span', { class: 'bt-tc-badge mono ' + (isGold ? 'is-gold' : 'is-good'), text: stars.toFixed(2) + ' / 5' }) : null
            ),
            goldBlend.isBlend ? S.h('div', { style: 'display:flex;flex-wrap:wrap;gap:4px' },
              S.h('span', { class: 'bt-tc-badge bt-journal-blend-badge is-copper', title: goldBlend.detailLine, text: goldBlend.pillText })
            ) : null,
            S.h('div', { class: 'mono', style: 'font-size:0.75rem;color:var(--ink-secondary);line-height:1.35', text: specs }),
            S.h('div', { class: 'bt-tc-pill-wrap' },
              S.h('button', {
                type: 'button',
                class: 'bt-tc-pill is-compact is-active',
                text: 'Brew \u2192',
                onclick: function () {
                  hydrateBrewFromRowOrBag(r, null, null);
                  navigateToHomeRecipe();
                }
              }),
              S.h('button', {
                type: 'button',
                class: 'bt-tc-pill is-compact is-soft',
                text: 'Inspect',
                onclick: function () { openTastingDetailSheet(r); }
              })
            )
          );
        })
      )
    );
  }

  function getCoffeesVaultSafe() {
    var storage = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : null;
    try {
      if (storage && typeof storage.getCoffeesVaultList === 'function') {
        var arr = storage.getCoffeesVaultList();
        if (Array.isArray(arr)) return arr;
      }
      if (typeof localStorage !== 'undefined') {
        var raw = localStorage.getItem('brew-and-cup-coffees-v1');
        if (raw) {
          var parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed;
          if (parsed && Array.isArray(parsed.list)) return parsed.list;
        }
      }
    } catch (_) {}
    return [];
  }

  function upsertVaultSafe(coffeeIn, brewIn, opts) {
    var storage = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : null;
    if (storage && typeof storage.upsertCoffeeVaultRecord === 'function') {
      try { return storage.upsertCoffeeVaultRecord(coffeeIn, brewIn, opts); } catch (_) {}
    }
    return null;
  }

  function findCoffeeRecordsMatch(cid, rawName, rawRoaster, preloaded) {
    preloaded = preloaded || {};
    var storage = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : null;
    var cleanCid = isSyntheticCoffeeId(cid) ? '' : String(cid).trim();
    var nName = normCoffeeKeyPart(unneutCellar(rawName || ''));
    var nRoast = normCoffeeKeyPart(unneutCellar(rawRoaster || ''));

    var findBest = function (list, nameKeys) {
      if (!Array.isArray(list) || !list.length) return null;
      if (cleanCid) {
        var cidHit = list.find(function (it) {
          if (!it) return false;
          var ic = String(it.coffee_id || it.id || '').trim();
          return !isSyntheticCoffeeId(ic) && ic === cleanCid;
        });
        if (cidHit) return cidHit;
      }
      if (!nName) return null;
      var exactHit = list.find(function (it) {
        if (!it) return false;
        var iname = '';
        for (var k = 0; k < nameKeys.length; k++) {
          if (it[nameKeys[k]]) { iname = normCoffeeKeyPart(unneutCellar(it[nameKeys[k]])); break; }
        }
        var iroast = normCoffeeKeyPart(unneutCellar(it.roaster || ''));
        return iname === nName && nRoast && iroast === nRoast;
      });
      if (exactHit) return exactHit;
      return list.find(function (it) {
        if (!it) return false;
        var iname = '';
        for (var k = 0; k < nameKeys.length; k++) {
          if (it[nameKeys[k]]) { iname = normCoffeeKeyPart(unneutCellar(it[nameKeys[k]])); break; }
        }
        var iroast = normCoffeeKeyPart(unneutCellar(it.roaster || ''));
        return iname === nName && (!nRoast || !iroast);
      }) || null;
    };

    var vaultList = Array.isArray(preloaded.vaultList) ? preloaded.vaultList : getCoffeesVaultSafe();
    var unifiedList = Array.isArray(preloaded.unified)
      ? preloaded.unified
      : ((storage && typeof storage.buildUnifiedCoffeesIndex === 'function') ? storage.buildUnifiedCoffeesIndex() : []);
    var priceList = Array.isArray(preloaded.prices) ? preloaded.prices : S.getNormalizedPrices();

    return {
      vaultRec: findBest(vaultList, ['name', 'coffee_name', 'coffee']),
      uRec: findBest(unifiedList, ['name', 'coffee_name', 'coffee']),
      priceBag: findBest(priceList, ['coffee', 'name', 'coffee_name'])
    };
  }

  /* Complete Lossless Row/Bag -> app.coffee + app.brew Sync (Vault + Unified + Row + Bag) */
  function hydrateBrewFromRowOrBag(row, uRec, bag, opts) {
    var a = S.getApp();
    var storage = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : null;
    var lookupCid = (uRec && uRec.coffee_id) || (row && row.coffee_id) || (bag && (bag.coffee_id || (!isSyntheticCoffeeId(bag.id) ? bag.id : ''))) || '';
    var lookupName = (uRec && uRec.name) || (row && unneutCellar(row.coffee_name)) || (bag && (bag.coffee || bag.name)) || '';
    var lookupRoaster = (uRec && uRec.roaster) || (row && unneutCellar(row.roaster)) || (bag && bag.roaster) || '';
    var matched = findCoffeeRecordsMatch(lookupCid, lookupName, lookupRoaster);

    var vaultRec = matched.vaultRec || null;
    var resolvedU = uRec || matched.uRec || null;
    var resolvedBag = bag || matched.priceBag || (resolvedU && resolvedU.openBag) || null;
    var anchor = row || (resolvedU && (resolvedU.lockedBrew || resolvedU.bestBrew || resolvedU.latestBrew)) || null;

    var recForSelect = null;
    if (resolvedU || vaultRec) {
      recForSelect = Object.assign({}, vaultRec || {}, resolvedU || {});
      if (vaultRec) {
        var mergeKeys = [
          'name', 'roaster', 'roaster_location', 'origin', 'region', 'farm', 'farm_or_station',
          'producer', 'harvest_year', 'varietal', 'species', 'blend', 'process', 'process_sub',
          'process_details', 'decaf', 'decaf_process', 'roast', 'roast_date', 'is_frozen',
          'frozen_date', 'freeze_days_offset', 'elevation_m', 'elevText', 'density',
          'bag_notes', 'notes', 'personal_note', 'bag_weight_g', 'remaining_g', 'price',
          'currency', 'agtron', 'bean_agtron', 'ground_agtron', 'agtron_scale', 'roast_delta',
          'psd_d10_um', 'psd_d50_um', 'psd_d90_um', 'psd_span', 'roasterGuide',
          'recommended_rest_days', 'lastBrew'
        ];
        mergeKeys.forEach(function (k) {
          if ((!recForSelect[k] || isUnkCoffeeVal(recForSelect[k])) && vaultRec[k] && !isUnkCoffeeVal(vaultRec[k])) {
            recForSelect[k] = vaultRec[k];
          }
        });
      }
      if (resolvedBag) {
        if (!recForSelect.roast_date && isIsoDateCellar(resolvedBag.roast_date || resolvedBag.roast)) {
          recForSelect.roast_date = resolvedBag.roast_date || resolvedBag.roast;
        }
        if (!recForSelect.roast && resolvedBag.rlevel) recForSelect.roast = resolvedBag.rlevel;
        if (!recForSelect.bag_notes && (resolvedBag.bag_notes || resolvedBag.notes)) {
          recForSelect.bag_notes = resolvedBag.bag_notes || resolvedBag.notes;
        }
      }
    }

    if (recForSelect && storage && typeof storage.selectSavedCoffee === 'function') {
      try { storage.selectSavedCoffee(recForSelect, { anchorRow: anchor || undefined, silent: true }); } catch (_) {}
    } else if (anchor && storage && typeof storage.useCoffeeFromRow === 'function') {
      try { storage.useCoffeeFromRow(anchor, true, true); } catch (_) {}
    }

    var v = vaultRec || {};
    var u = resolvedU || {};
    var r = anchor || {};
    var b = resolvedBag || {};
    var pb = matched.priceBag || {};
    var ad = readRowAdapMetaSafe(r) || {};
    var ej = parseJsonObjSafe(r && r.extra_json) || {};
    var ce = (ad && ad.coffee_extra && typeof ad.coffee_extra === 'object') ? ad.coffee_extra
      : ((ej && ej.coffee_extra && typeof ej.coffee_extra === 'object') ? ej.coffee_extra : (parseJsonObjSafe(r && r.coffee_extra) || {}));
    var rowBlendInfo = extractRowBlendInfo(r);
    if (!rowBlendInfo.isBlend) {
      var fallbackBlend = extractRowBlendInfo(v);
      if (!fallbackBlend.isBlend) fallbackBlend = extractRowBlendInfo(u);
      if (!fallbackBlend.isBlend) fallbackBlend = extractRowBlendInfo(b);
      if (fallbackBlend.isBlend) rowBlendInfo = fallbackBlend;
    }
    var curC = (a && a.coffee && typeof a.coffee === 'object') ? a.coffee : {};

    var finalCid = '';
    [u.coffee_id, v.coffee_id, v.id, r.coffee_id, b.coffee_id, (!isSyntheticCoffeeId(b.id) ? b.id : ''), curC.id].some(function (cand) {
      if (cand && !isSyntheticCoffeeId(cand)) { finalCid = String(cand).trim(); return true; }
      return false;
    });
    if (!finalCid) finalCid = 'cf_' + Date.now().toString(36);

    var bagLevelFromB = pickRichStr(b.rlevel, (!isIsoDateCellar(b.roast) ? b.roast : ''), pb.rlevel);
    var rawRoast = pickRichStr(v.roast, u.roast, r.roast_level, bagLevelFromB, curC.roast);
    var normRoast = rawRoast ? ((typeof resolveRoast === 'function' ? resolveRoast(rawRoast) : '') || rawRoast.toLowerCase()) : 'light';

    var rawProc = pickRichStr(v.process, u.process, r.process, b.process, pb.process, curC.process);
    var normProc = rawProc ? ((typeof resolveProcess === 'function' ? resolveProcess(rawProc) : '') || rawProc.toLowerCase()) : '';

    var bagNotesVal = pickRichStr(
      v.bag_notes, v.notes, v.flavors,
      u.bag_notes, u.notes, u.flavors,
      r.bag_notes,
      b.bag_notes, b.bagNotes, b.flavors, b.tasting_notes, b.notes,
      pb.bag_notes, pb.notes
    );

    var elevRaw = pickRichStr(v.elevation_m, u.elevation_m, r.elevation_m, b.elevation_m, pb.elevation_m, ce.elevation_m);
    var elevNum = parseInt(String(elevRaw).replace(/[^0-9]/g, ''), 10);
    var finalElevM = (isFinite(elevNum) && elevNum >= 100 && elevNum <= 3600) ? String(elevNum) : (elevRaw || '');
    var finalElevText = pickRichStr(v.elevText, u.elevText, b.elevText) || (finalElevM ? (finalElevM + ' masl') : '');
    var finalDensity = pickRichStr(v.density, u.density, r.elevation_class, b.density) ||
      ((finalElevM && typeof resolveDensity === 'function') ? (resolveDensity('', finalElevM) || '') : '');

    var explicitFrozen = (bag && bag.is_frozen === 'yes') ? 'yes'
      : ((v.is_frozen === 'yes' || u.is_frozen === 'yes' || r.is_frozen === 'yes' || b.is_frozen === 'yes' || pb.is_frozen === 'yes') ? 'yes' : '');
    var bestRoastDate = '';
    [
      (bag && isIsoDateCellar(bag.roast) ? bag.roast : ''),
      (bag && isIsoDateCellar(bag.roast_date) ? bag.roast_date : ''),
      v.roast_date, u.roast_date, (u.openBag && u.openBag.roast),
      r.roast_date,
      (isIsoDateCellar(b.roast_date) ? b.roast_date : (isIsoDateCellar(b.roast) ? b.roast : '')),
      (isIsoDateCellar(pb.roast) ? pb.roast : '')
    ].some(function (dt) {
      if (isIsoDateCellar(dt)) { bestRoastDate = String(dt).trim(); return true; }
      return false;
    });
    var bestFrozenDate = '';
    if (explicitFrozen === 'yes') {
      [bag && bag.frozen_date, v.frozen_date, u.frozen_date, r.frozen_date, b.frozen_date, pb.frozen_date].some(function (dt) {
        if (isIsoDateCellar(dt)) { bestFrozenDate = String(dt).trim(); return true; }
        return false;
      });
    }

    var bagWeightG = pickPosNum(v.bag_weight_g, u.bag_weight_g, ce.bag_weight_g, (u.openBag && u.openBag.total_g), b.bag_weight_g, (b.unit === 'g' ? b.size : null), (pb.unit === 'g' ? pb.size : null));
    var remG = pickNonNegNum(b.rem_g, v.remaining_g, u.remaining_g, (u.openBag && u.openBag.rem_g), ce.remaining_g, pb.rem_g);
    var priceVal = pickPosNum(b.price, v.price, u.price, ce.price, (u.openBag && u.openBag.price), pb.price);
    var currVal = pickRichStr(b.currency, b.sym, v.currency, u.currency, ce.currency, pb.currency, pb.sym);

    var nextC = Object.assign({}, curC, {
      id: finalCid,
      name: pickRichStr(v.name, u.name, r.coffee_name, b.coffee, b.name, pb.coffee, curC.name),
      roaster: pickRichStr(v.roaster, u.roaster, r.roaster, b.roaster, pb.roaster),
      roaster_location: pickRichStr(v.roaster_location, u.roaster_location, ce.roaster_location, b.roaster_location),
      bag_notes: bagNotesVal,
      notes: bagNotesVal,
      origin: pickRichStr(v.origin, u.origin, r.origin, b.origin, pb.origin, ce.origin),
      region: pickRichStr(v.region, u.region, ce.region, b.region, pb.region),
      farm: pickRichStr(v.farm, u.farm, ce.farm, b.farm),
      farm_or_station: pickRichStr(v.farm_or_station, u.farm_or_station, ce.farm_or_station, v.farm, u.farm, b.farm_or_station),
      producer: pickRichStr(v.producer, u.producer, ce.producer, b.producer),
      harvest_year: pickRichStr(v.harvest_year, u.harvest_year, ce.harvest_year, b.harvest_year),
      varietal: pickRichStr(v.varietal, u.varietal, r.varietal, b.varietal, pb.varietal),
      species: pickRichStr(v.species, u.species, r.species, b.species) || 'arabica',
      blend: pickRichStr(v.blend, u.blend, r.blend, b.blend),
      process: normProc,
      process_sub: pickRichStr(v.process_sub, u.process_sub, ce.process_sub, b.process_sub),
      process_details: pickRichStr(v.process_details, u.process_details, ce.process_details, b.process_details),
      decaf: (v.decaf === 'yes' || u.decaf === 'yes' || r.decaf === 'yes' || b.decaf === 'yes') ? 'yes' : '',
      decaf_process: pickRichStr(v.decaf_process, u.decaf_process, r.decaf_process, b.decaf_process),
      roast: normRoast,
      roast_date: bestRoastDate,
      is_frozen: explicitFrozen,
      frozen_date: bestFrozenDate,
      freeze_days_offset: pickRichStr(v.freeze_days_offset, u.freeze_days_offset, r.freeze_days_offset, b.freeze_days_offset),
      elevation_m: finalElevM,
      elevText: finalElevText,
      density: finalDensity,
      personal_note: pickRichStr(v.personal_note, u.personal_note, ce.personal_note, b.personal_note),
      bag_weight_g: bagWeightG != null ? bagWeightG : '',
      remaining_g: remG != null ? remG : '',
      price: priceVal != null ? priceVal : '',
      currency: currVal || '$',
      agtron: pickRichStr(v.agtron, u.agtron, ad.agtron, b.agtron),
      bean_agtron: pickRichStr(v.bean_agtron, u.bean_agtron, ad.bean_agtron, b.bean_agtron),
      ground_agtron: pickRichStr(v.ground_agtron, u.ground_agtron, ad.ground_agtron, b.ground_agtron),
      agtron_scale: pickRichStr(v.agtron_scale, u.agtron_scale, ad.agtron_scale, b.agtron_scale) || 'gourmet',
      roast_delta: pickRichStr(v.roast_delta, u.roast_delta, ad.roast_delta, b.roast_delta),
      psd_d10_um: pickRichStr(v.psd_d10_um, u.psd_d10_um, ad.psd_d10_um, b.psd_d10_um),
      psd_d50_um: pickRichStr(v.psd_d50_um, u.psd_d50_um, ad.psd_d50_um, b.psd_d50_um),
      psd_d90_um: pickRichStr(v.psd_d90_um, u.psd_d90_um, ad.psd_d90_um, b.psd_d90_um),
      psd_span: pickRichStr(v.psd_span, u.psd_span, ad.psd_span, b.psd_span),
      roasterGuide: v.roasterGuide || u.roasterGuide || ce.roasterGuide || b.roasterGuide || null,
      recommended_rest_days: pickRichStr(v.recommended_rest_days, u.recommended_rest_days, ce.recommended_rest_days, b.recommended_rest_days),
      answered: 'yes',
      _v64Touched: 'yes'
    });

    /* Clear bogus *Unsure flags whenever fields exist or switching coffees */
    nextC.nameUnsure = '';
    nextC.roasterUnsure = nextC.roaster ? '' : 'yes';
    nextC.roastUnsure = (nextC.roast && !isUnkCoffeeVal(nextC.roast)) ? '' : 'yes';
    nextC.roast_unknown = nextC.roastUnsure;
    nextC.processUnsure = (nextC.process && !isUnkCoffeeVal(nextC.process)) ? '' : 'yes';
    nextC.process_unknown = nextC.processUnsure;
    nextC.originUnsure = nextC.origin ? '' : 'yes';
    nextC.origin_unknown = nextC.originUnsure;
    nextC.elevUnsure = (nextC.elevation_m || nextC.density) ? '' : 'yes';
    nextC.elevationUnsure = nextC.elevUnsure;
    nextC.elev_unknown = nextC.elevUnsure;
    nextC.dateUnsure = (nextC.roast_date || nextC.is_frozen === 'yes') ? '' : 'yes';
    nextC.roastDateUnsure = nextC.dateUnsure;
    nextC.date_unknown = nextC.dateUnsure;
    nextC.varietalUnsure = '';
    nextC.notesUnsure = nextC.bag_notes ? '' : 'yes';
    nextC.bagNotesUnsure = nextC.notesUnsure;
    nextC.notes_unknown = nextC.notesUnsure;

    /* Restore 2-Coffee Blend state cleanly (never collapse to flat string, and clear stale blend state on single-bag hydrate!) */
    if (rowBlendInfo && rowBlendInfo.isBlend && Array.isArray(rowBlendInfo.components) && rowBlendInfo.components.length >= 2) {
      nextC.isBlend = true;
      nextC._blendSummaryOn = true;
      nextC.blendId = String(ce.blendId || (/^blend_/i.test(finalCid) ? finalCid : '') || '').trim();
      if (nextC.blendId) {
        nextC.id = nextC.blendId;
        nextC.coffee_id = nextC.blendId;
      }
      nextC.blendComponents = rowBlendInfo.components.slice(0, 2).map(function (bc) {
        return Object.assign({}, bc);
      });
      if (!nextC.name) {
        nextC.name = rowBlendInfo.nameA + ' + ' + rowBlendInfo.nameB;
      }
      nextC.blend = 'blend';
    } else {
      nextC.isBlend = false;
      nextC._blendSummaryOn = false;
      nextC.blendId = '';
      nextC.blendComponents = [];
    }
    a.coffee = nextC;

    /* Restore saved brew parameters (Row -> Vault lastBrew -> Unified lastBrew) */
    a.brew = a.brew || {};
    var savedBrew = v.lastBrew || u.lastBrew || null;
    if (anchor) {
      var mKey = (typeof resolveMethod === 'function' ? resolveMethod(anchor.brew_method) : '') || anchor.brew_method;
      if (mKey) a.brew.method = mKey;
      if (anchor.brew_style) a.brew.style = unneutCellar(anchor.brew_style);
      if (anchor.brew_filter) a.brew.filter = unneutCellar(anchor.brew_filter);
      if (ad && ad.filterId) a.brew.filterId = ad.filterId;
      else if (savedBrew && savedBrew.filterId) a.brew.filterId = savedBrew.filterId;
      if (+anchor.brew_dose_g > 0) a.brew.dose = +anchor.brew_dose_g;
      if (+anchor.brew_water_g > 0) a.brew.water = +anchor.brew_water_g;
      if (+anchor.brew_ratio > 0) a.brew.ratio = +anchor.brew_ratio;
      else if (+a.brew.dose > 0 && +a.brew.water > 0) a.brew.ratio = Math.round((+a.brew.water / +a.brew.dose) * 10) / 10;
      if (+anchor.brew_grind_target_um > 0) {
        a.brew.grindUm = +anchor.brew_grind_target_um;
        a.brew.grind_um = +anchor.brew_grind_target_um;
      }
      if (anchor.brew_grind_setting) a.brew.grind_setting = unneutCellar(anchor.brew_grind_setting);
      if (ad && ad.grinderKey) a.brew.grinderKey = ad.grinderKey;
      else if (savedBrew && savedBrew.grinderKey) a.brew.grinderKey = savedBrew.grinderKey;
      if (anchor.brew_grinder_name) a.brew.grinderName = unneutCellar(anchor.brew_grinder_name);
      else if (savedBrew && savedBrew.grinderName) a.brew.grinderName = savedBrew.grinderName;
      if (anchor.brew_agitation && ['gentle', 'standard', 'active'].indexOf(anchor.brew_agitation) >= 0) {
        a.brew.agitation = anchor.brew_agitation;
      }
      if (anchor.brew_technique) {
        a.brew.technique = (typeof resolveTechCsv === 'function' ? resolveTechCsv(anchor.brew_technique) : anchor.brew_technique);
      }
      if (anchor.brew_water_type) a.brew.waterType = unneutCellar(anchor.brew_water_type);
      if (anchor.brew_pour_notes) a.brew.pourNotes = unneutCellar(anchor.brew_pour_notes);
      if (ad && ad.machine_profile) {
        try { a.brew.machineProfile = JSON.parse(JSON.stringify(ad.machine_profile)); } catch (_) {}
      } else if (savedBrew && savedBrew.machineProfile) {
        try { a.brew.machineProfile = JSON.parse(JSON.stringify(savedBrew.machineProfile)); } catch (_) {}
      }
      if (+anchor.brew_temp_c > 0) {
        a.brew.tempC = +anchor.brew_temp_c;
        a.brew.tempF = Math.round(+anchor.brew_temp_c * 9 / 5 + 32);
      } else if (+anchor.brew_temp_f > 0) {
        a.brew.tempF = +anchor.brew_temp_f;
        a.brew.tempC = Math.round(((+anchor.brew_temp_f - 32) * 5 / 9) * 2) / 2;
      }
    } else if (savedBrew && typeof savedBrew === 'object') {
      var sbM = (typeof resolveMethod === 'function' ? resolveMethod(savedBrew.method) : '') || savedBrew.method;
      if (sbM) a.brew.method = sbM;
      if (savedBrew.style) a.brew.style = savedBrew.style;
      if (savedBrew.filter) a.brew.filter = savedBrew.filter;
      if (savedBrew.filterId) a.brew.filterId = savedBrew.filterId;
      if (+savedBrew.dose > 0) a.brew.dose = +savedBrew.dose;
      if (+savedBrew.water > 0) a.brew.water = +savedBrew.water;
      if (+savedBrew.ratio > 0) a.brew.ratio = +savedBrew.ratio;
      if (+savedBrew.tempC > 0) {
        a.brew.tempC = +savedBrew.tempC;
        a.brew.tempF = +savedBrew.tempF > 0 ? +savedBrew.tempF : Math.round(+savedBrew.tempC * 9 / 5 + 32);
      } else if (+savedBrew.tempF > 0) {
        a.brew.tempF = +savedBrew.tempF;
        a.brew.tempC = Math.round(((+savedBrew.tempF - 32) * 5 / 9) * 2) / 2;
      }
      var sbUm = +savedBrew.grindUm || +savedBrew.grind_um || 0;
      if (sbUm > 0) { a.brew.grindUm = sbUm; a.brew.grind_um = sbUm; }
      if (savedBrew.grind_setting) a.brew.grind_setting = savedBrew.grind_setting;
      if (savedBrew.grinderKey) a.brew.grinderKey = savedBrew.grinderKey;
      if (savedBrew.grinderName) a.brew.grinderName = savedBrew.grinderName;
      if (savedBrew.agitation) a.brew.agitation = savedBrew.agitation;
      if (savedBrew.technique) a.brew.technique = savedBrew.technique;
      if (savedBrew.waterType) a.brew.waterType = savedBrew.waterType;
      if (savedBrew.pourNotes) a.brew.pourNotes = savedBrew.pourNotes;
      if (savedBrew.machineProfile) {
        try { a.brew.machineProfile = JSON.parse(JSON.stringify(savedBrew.machineProfile)); } catch (_) {}
      }
    }

    /* Closed-Loop Golden Lock rule: ONLY lock if dial_locked === 'yes'/'1'; otherwise apply pendingNextRecipe / computeClosedLoopNextRecipe */
    var isExplicitGoldLock = !!(anchor && (anchor.dial_locked === 'yes' || anchor.dial_locked === '1'));
    var exactOldMode = !!(opts && opts.exactOld);
    a.recipeLocked = isExplicitGoldLock;

    if (exactOldMode) {
      if (anchor || savedBrew) {
        a.brew._savedDialedMethod = a.brew.method || '';
      }
      a.brew.dialAdaptation = null;
      a.dialNote = null;
    } else if (isExplicitGoldLock) {
      a.brew._savedDialedMethod = a.brew.method || '';
      a.brew.dialAdaptation = { adapted: false, locked: true };
    } else {
      var core = (typeof window !== 'undefined' && window.BTCoreV6) ? window.BTCoreV6 : null;
      var hasSavedNext = !!(ad && ad.next_recipe && typeof ad.next_recipe === 'object');
      var closedRx = null;
      if (!hasSavedNext && core && typeof core.computeClosedLoopNextRecipe === 'function') {
        try {
          var histAll = S.getHistoryObjs();
          var histForClosed = histAll;
          if (row) {
            var rowPos = histAll.indexOf(row);
            if (rowPos < 0 && row.id) {
              for (var hi = 0; hi < histAll.length; hi++) {
                if (histAll[hi] && histAll[hi].id === row.id) { rowPos = hi; break; }
              }
            }
            histForClosed = rowPos >= 0 ? histAll.slice(0, rowPos + 1) : [row];
          }
          closedRx = core.computeClosedLoopNextRecipe(a.coffee, a.brew.method || 'v60', histForClosed, (a.prefs && a.prefs.gear) || a.prefs || {});
        } catch (_) {}
      }
      var closedAdapt = (closedRx && closedRx.dialAdaptation) ? closedRx.dialAdaptation : null;
      var closedAdapted = !!(closedAdapt && closedAdapt.adapted);
      var shouldApplyNext = !row || hasSavedNext || closedAdapted;
      var pendingNext = (ad && ad.next_recipe) ||
        (closedRx && (closedRx.nextRecipe || closedRx)) ||
        (v && v.pendingNextRecipe) ||
        (u && u.pendingNextRecipe) ||
        null;
      var rawDialAdapt = closedAdapt ||
        (v && v.dialAdaptation) ||
        (u && u.dialAdaptation) ||
        (ad && ad.dial_adaptation) ||
        null;

      if (pendingNext && typeof pendingNext === 'object' && shouldApplyNext) {
        var prevUmBeforeNext = +a.brew.grindUm || +(anchor && anchor.brew_grind_target_um) || 0;
        var pnM = (typeof resolveMethod === 'function' ? resolveMethod(pendingNext.methodKey || pendingNext.method) : '') || pendingNext.methodKey || pendingNext.method;
        if (pnM) a.brew.method = pnM;
        var pnUm = +pendingNext.grindUm || +pendingNext.d50Um || 0;
        if (pnUm > 0) { a.brew.grindUm = pnUm; a.brew.grind_um = pnUm; }
        var pnSet = pendingNext.grindSetting || (pendingNext.grinderSetting && (pendingNext.grinderSetting.shortDisplay || pendingNext.grinderSetting.display)) || pendingNext.grind_setting || '';
        if (pnSet) {
          a.brew.grind_setting = pnSet;
        } else if (pnUm > 0 && pnUm !== prevUmBeforeNext) {
          if (core && typeof core.mapMicronsToGrinder === 'function') {
            try {
              var gMappedNext = core.mapMicronsToGrinder(pnUm, a.brew.grinderKey || 'comandante-c40', null, a.brew.method || 'v60');
              if (gMappedNext && (gMappedNext.shortDisplay || gMappedNext.display)) {
                a.brew.grind_setting = gMappedNext.shortDisplay || gMappedNext.display;
              } else {
                a.brew.grind_setting = '';
              }
            } catch (_) { a.brew.grind_setting = ''; }
          } else {
            a.brew.grind_setting = '';
          }
        }
        if (+pendingNext.tempC > 0) {
          a.brew.tempC = +pendingNext.tempC;
          a.brew.tempF = +pendingNext.tempF > 0 ? +pendingNext.tempF : Math.round(+pendingNext.tempC * 9 / 5 + 32);
        } else if (+pendingNext.tempF > 0) {
          a.brew.tempF = +pendingNext.tempF;
          a.brew.tempC = Math.round(((+pendingNext.tempF - 32) * 5 / 9) * 2) / 2;
        }
        if (+pendingNext.ratio > 0) a.brew.ratio = +pendingNext.ratio;
        if (+pendingNext.doseG > 0) a.brew.dose = +pendingNext.doseG;
        if (+pendingNext.waterG > 0) {
          a.brew.water = +pendingNext.waterG;
        } else if (+pendingNext.ratio > 0 && +a.brew.dose > 0) {
          a.brew.water = Math.round(+a.brew.dose * +pendingNext.ratio);
        }
        if (pendingNext.agitation) a.brew.agitation = pendingNext.agitation;
      }

      if (anchor || savedBrew || (pendingNext && shouldApplyNext)) {
        a.brew._savedDialedMethod = a.brew.method || '';
      }

      var rowDialChange = String((anchor && unneutCellar(anchor.dial_change || '')) || (ad && ad.dial_change) || (pendingNext && pendingNext.headline) || '').trim();
      var rowDialSym = String((anchor && unneutCellar(anchor.dial_symptom || '')) || (ad && ad.dial_symptom) || (pendingNext && pendingNext.symptom) || (anchor && unneutCellar(anchor.fix_symptom || '')) || '').trim();

      if (rawDialAdapt && rawDialAdapt.adapted !== false && (rawDialAdapt.adapted || rawDialAdapt.headline || rawDialAdapt.summaryBanner || rawDialAdapt.dial_change)) {
        a.brew.dialAdaptation = Object.assign({
          adapted: true,
          headline: rawDialAdapt.headline || rawDialAdapt.dial_change || rowDialChange || '',
          summaryBanner: rawDialAdapt.summaryBanner || rawDialAdapt.headline || rawDialAdapt.dial_change || rowDialChange || '',
          symptom: rawDialAdapt.symptom || rawDialAdapt.dial_symptom || rowDialSym || '',
          prevUm: rawDialAdapt.prevUm || (anchor && +anchor.brew_grind_target_um) || null,
          nextUm: rawDialAdapt.nextUm || (pendingNext && (+pendingNext.grindUm || +pendingNext.d50Um)) || a.brew.grindUm || null
        }, rawDialAdapt);
      } else if (shouldApplyNext && (hasSavedNext || rowDialChange || (pendingNext && (pendingNext.headline || pendingNext.symptom)))) {
        a.brew.dialAdaptation = {
          adapted: true,
          fromTry: (pendingNext && pendingNext.fromTry) || (anchor && +anchor.brew_attempt) || 1,
          stars: (pendingNext && pendingNext.stars != null) ? pendingNext.stars : (anchor && parseFloat(anchor.my_rating_stars)) || null,
          tdsPct: (pendingNext && pendingNext.tdsPct) || (anchor && parseFloat(anchor.brew_tds_pct)) || null,
          symptom: rowDialSym,
          prevUm: (anchor && +anchor.brew_grind_target_um) || null,
          nextUm: (pendingNext && (+pendingNext.grindUm || +pendingNext.d50Um)) || a.brew.grindUm,
          headline: rowDialChange,
          summaryBanner: rowDialChange
        };
      } else {
        a.brew.dialAdaptation = null;
      }

      if (a.brew.dialAdaptation && a.brew.dialAdaptation.adapted) {
        a.dialNote = {
          symptom: a.brew.dialAdaptation.symptom || rowDialSym,
          change: [a.brew.dialAdaptation.headline || a.brew.dialAdaptation.summaryBanner || rowDialChange].filter(Boolean),
          fromId: (anchor && anchor.id) || ''
        };
      }
    }

    a.attempt = (resolvedU && resolvedU.n_cups) || (anchor && +anchor.brew_attempt) || a.attempt || 0;
    a.cupBrew = null;
    if (a.coffee && a.coffee.isBlend && Array.isArray(a.coffee.blendComponents) && a.coffee.blendComponents.length >= 2) {
      var bcA = a.coffee.blendComponents[0];
      var bcB = a.coffee.blendComponents[1];
      var targetDose = +(a.brew && a.brew.dose) || ((+bcA.weightG || 0) + (+bcB.weightG || 0));
      if (targetDose > 0) {
        if (a.brew && !(+a.brew.dose > 0)) a.brew.dose = Math.round(targetDose * 10) / 10;
        var sumBC = (+bcA.weightG || 0) + (+bcB.weightG || 0);
        if (sumBC <= 0 || Math.abs(sumBC - targetDose) > 0.15) {
          var pShareA = (+bcA.ratioPct > 0 && +bcA.ratioPct < 100) ? (+bcA.ratioPct / 100) : 0.5;
          bcA.weightG = Math.round((targetDose * pShareA) * 10) / 10;
          bcB.weightG = Math.round((targetDose - bcA.weightG) * 10) / 10;
          bcA.ratioPct = Math.round(pShareA * 100);
          bcB.ratioPct = 100 - bcA.ratioPct;
        }
      }
    }
    if (a.brew) {
      a.brew.actualSecs = null;
      a.brew.actualFromTimer = false;
    }
    S.saveDraftSafe();
  }

  /* Evaluate Living Bag Freshness & Freezer Slowdown */
  function evaluateShelfBag(bag, unifiedRec) {
    var lens = S.experienceLensSafe();
    var rawAge = S.daysSinceIso(bag.roast || (unifiedRec && unifiedRec.roast_date));
    var isFrozen = bag.is_frozen === 'yes' || (unifiedRec && unifiedRec.is_frozen === 'yes');
    var frozenAge = S.daysSinceIso(bag.frozen_date || (unifiedRec && unifiedRec.frozen_date));
    var unit = bag.unit || 'g';
    var totalG = unit === 'pods' ? (+bag.size || 10) * 6 : (+bag.size || 250) * (unit === 'oz' ? 28.3495 : unit === 'lb' ? 453.592 : unit === 'kg' ? 1000 : 1);
    var remG = bag.rem_g != null && isFinite(+bag.rem_g) ? +bag.rem_g : totalG;

    var effAge = rawAge;
    if (rawAge != null && isFrozen) {
      var daysFrozen = frozenAge != null ? Math.min(rawAge, frozenAge) : Math.max(0, rawAge - 5);
      var preFreeze = Math.max(0, rawAge - daysFrozen);
      effAge = Math.round((preFreeze + daysFrozen / 12.3) * 10) / 10;
    }

    var rLvl = String(bag.rlevel || (unifiedRec && unifiedRec.roast) || 'light').toLowerCase();
    var restEnd = rLvl.indexOf('dark') >= 0 ? 3 : (rLvl.indexOf('med') >= 0 ? 4 : 5);
    var peakEnd = rLvl.indexOf('dark') >= 0 ? 14 : (rLvl.indexOf('med') >= 0 ? 21 : 28);

    var windowLabel = 'Peak Freshness Window';
    var windowTone = 'is-good';
    if (effAge == null) {
      windowLabel = 'Roast Date Unlisted';
      windowTone = 'is-sci';
    } else if (effAge < restEnd) {
      windowLabel = 'Resting CO2 (Day ' + effAge + ' \u00B7 Peak opens Day ' + restEnd + ')';
      windowTone = 'is-warn';
    } else if (effAge <= peakEnd) {
      windowLabel = isFrozen
        ? ('Freezer-Locked Peak (Day ' + effAge + ' \u00B7 ' + (lens === 'scientist' ? '12.3\u00D7' : '12\u00D7') + ' Slower)')
        : ('Peak Freshness (Day ' + Math.round(effAge) + ' of ' + peakEnd + ')');
      windowTone = isFrozen ? 'is-sci' : 'is-good';
    } else {
      windowLabel = 'Past Peak (Day ' + Math.round(effAge) + ' \u00B7 Grind 1 click finer or Freeze)';
      windowTone = 'is-warn';
    }

    var perCup = (+bag.price > 0 && totalG > 0) ? ((+bag.price / totalG) * (bag.dose || 15)) : 1.25;
    var per100g = (+bag.price > 0 && totalG > 0) ? ((+bag.price / totalG) * 100) : 8.40;
    var oddTail = (unit !== 'pods' && remG >= 5 && remG < 14.5)
      ? { remG: Math.round(remG * 10) / 10, waterG: Math.round(remG * 16.2) }
      : null;

    var thawMin = Math.max(12, Math.round(26 * Math.pow(Math.max(40, remG) / 250, 0.67)));

    var shelfApp = S.getApp() || {};
    var doseRef = +(shelfApp.brew && shelfApp.brew.dose) || +bag.dose || 15;
    var isEmptyBag = remG <= 0.4;
    var cupsLeft = isEmptyBag ? 0 : Math.floor(remG / Math.max(1, doseRef));
    var isLowBag = !isEmptyBag && remG < doseRef * 2;
    var inPeak = effAge != null && effAge >= restEnd && effAge <= peakEnd;

    return {
      doseRef: doseRef,
      cupsLeft: cupsLeft,
      isLowBag: isLowBag,
      isEmpty: isEmptyBag,
      inPeak: inPeak,
      rawAge: rawAge,
      effAge: effAge != null ? effAge : 10,
      isFrozen: isFrozen,
      restEnd: restEnd,
      peakEnd: peakEnd,
      windowLabel: windowLabel,
      windowTone: windowTone,
      totalG: Math.round(totalG),
      remG: Math.round(remG * 10) / 10,
      pctLeft: Math.max(3, Math.min(100, Math.round((remG / Math.max(1, totalG)) * 100))),
      perCup: perCup,
      per100g: per100g,
      oddTail: oddTail,
      thawMin: thawMin
    };
  }

  /* Build Shareable Brew Passport Code + Archival 4:5 (720x900) Trading-Card SVG with REAL ISO QR */
  function buildPassportArtifacts(rowOrBag) {
    var a = S.getApp();
    var inn = (typeof window !== 'undefined' && window.BTInnovate) ? window.BTInnovate : null;
    var blendInfo = extractRowBlendInfo(rowOrBag);
    if (!blendInfo.isBlend && !rowOrBag && a.coffee && a.coffee.isBlend) {
      blendInfo = extractRowBlendInfo(a.coffee);
    }
    var v74Meta = extractRowV74Meta(rowOrBag);
    var cName = (rowOrBag && (rowOrBag.coffee_name || rowOrBag.coffee || rowOrBag.name)) || (a.coffee && a.coffee.name) || 'Specialty Coffee';
    var cRoaster = (rowOrBag && rowOrBag.roaster) || (a.coffee && a.coffee.roaster) || 'Specialty Roaster';
    var cOrigin = (rowOrBag && rowOrBag.origin) || (a.coffee && a.coffee.origin) || '';
    var cProc = (rowOrBag && rowOrBag.process) || (a.coffee && a.coffee.process) || 'Washed';
    var cRoast = (rowOrBag && (rowOrBag.roast_level || rowOrBag.rlevel || rowOrBag.roast)) || (a.coffee && a.coffee.roast) || 'Light';
    var method = (rowOrBag && rowOrBag.brew_method) || (a.brew && a.brew.method) || 'v60';
    var doseG = +(rowOrBag && rowOrBag.brew_dose_g) || +(a.brew && a.brew.dose) || 15;
    var waterG = +(rowOrBag && rowOrBag.brew_water_g) || +(a.brew && a.brew.water) || 250;
    var ratio = +(rowOrBag && rowOrBag.brew_ratio) || Math.round((waterG / Math.max(1, doseG)) * 10) / 10;
    var um = +(rowOrBag && rowOrBag.brew_grind_target_um) || +(a.brew && a.brew.grindUm) || 550;
    var gSet = (rowOrBag && rowOrBag.brew_grind_setting) || (a.brew && a.brew.grind_setting) || (um + ' um');
    var tempC = +(rowOrBag && rowOrBag.brew_temp_c) || +(a.brew && a.brew.tempC) || 93;
    var stars = +(rowOrBag && rowOrBag.my_rating_stars) || 0;
    var notes = (rowOrBag && (rowOrBag.flavors_liked || rowOrBag.bag_notes)) || (a.coffee && a.coffee.bag_notes) || '';

    var jsonPayload = {
      schema: 'beantelligence-passport-v7.4',
      coffee: {
        name: cName,
        roaster: cRoaster,
        origin: cOrigin,
        process: cProc,
        roast: cRoast,
        isBlend: !!blendInfo.isBlend,
        blendComponents: blendInfo.isBlend ? blendInfo.components : []
      },
      brew: {
        method: method,
        doseG: doseG,
        waterG: waterG,
        ratio: ratio,
        d50Um: um,
        grindSetting: gSet,
        tempC: tempC,
        tempProfile: v74Meta.tempProfileLabel || '',
        brewerMaterial: v74Meta.brewerMaterialLabel || ''
      },
      ratingStars: stars || null,
      notes: notes
    };
    var jsonShareStr = '';
    try { jsonShareStr = JSON.stringify(jsonPayload, null, 2); } catch (_) {}

    var btUri = '';
    var btTextCode = '';
    if (inn && typeof inn.encodeBrewPassport === 'function') {
      try {
        var enc = inn.encodeBrewPassport({
          bean: {
            name: cName,
            roaster: cRoaster,
            origin: cOrigin,
            process: cProc,
            roast: cRoast,
            isBlend: !!blendInfo.isBlend,
            blendComponents: blendInfo.isBlend ? blendInfo.components : undefined
          },
          recipe: { method: method, doseG: doseG, waterG: waterG, d50Um: um, tempC: tempC, grinderKey: (a.brew && a.brew.grinderKey) || 'comandante-c40' }
        });
        if (enc && enc.uri) {
          btUri = enc.uri;
          btTextCode = enc.textBlock || ('BT-code: V1 ' + enc.uri);
        }
      } catch (_) {}
    }
    if (!btUri && typeof shareCode === 'function') {
      try {
        btTextCode = shareCode(
          { name: cName, roaster: cRoaster, origin: cOrigin, roast: cRoast, process: cProc },
          { method: method, water: waterG, tempF: Math.round(tempC * 9 / 5 + 32), ratio: ratio },
          null
        );
        btUri = btTextCode;
      } catch (_) {}
    }
    if (!btUri) {
      btUri = 'bt1:' + cName.slice(0, 24) + '|' + method + '|' + doseG + ':' + waterG + '@' + um;
      btTextCode = 'BT-code: V1 ' + btUri;
    }

    var qrOpts = { size: 184, margin: 3, fg: '#1A1412', bg: '#FAF6F0', label: 'BeanTelligence Scannable Brew Passport QR Code' };
    var realQrSvg = '';
    var encodeDirect = function (payloadStr) {
      if (typeof window !== 'undefined' && typeof window.encodeQrSvg === 'function') {
        try { return window.encodeQrSvg(payloadStr, qrOpts); } catch (_) {}
      }
      if (typeof encodeQrSvg === 'function') {
        try { return encodeQrSvg(payloadStr, qrOpts); } catch (_) {}
      }
      return '';
    };
    realQrSvg = encodeDirect(btUri);
    if (!realQrSvg || realQrSvg.indexOf('<path') < 0) {
      var compactUri = 'bt1:' + cName.slice(0, 24) + '|' + method + '|' + doseG + ':' + waterG + '@' + um;
      realQrSvg = encodeDirect(compactUri);
      if (!realQrSvg || realQrSvg.indexOf('<path') < 0) {
        realQrSvg = S.encodeRealQrSvg(compactUri, qrOpts);
      }
    }

    var safeEsc = function (s) {
      return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };

    var svgSubLine = blendInfo.isBlend
      ? blendInfo.pillText
      : [cOrigin, cProc, cRoast].filter(Boolean).join(' \u00B7 ');
    var svgTempDisp = v74Meta.tempProfileLabel || (tempC + ' \u00B0C');
    var svgFooterLine = blendInfo.isBlend
      ? ('Blend: ' + blendInfo.detailLine.slice(0, 58))
      : (notes ? ('Notes: ' + notes.slice(0, 56)) : '');

    var tradingCardSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 900" width="720" height="900" role="img" aria-label="BeanTelligence Trading Card Brew Passport">' +
      '<rect width="720" height="900" rx="36" fill="#FAF6F0"/>' +
      '<rect x="20" y="20" width="680" height="860" rx="28" fill="#FFFDF9" stroke="#D8C8B6" stroke-width="2"/>' +
      '<rect x="20" y="20" width="680" height="156" rx="28" fill="#1C4A36"/>' +
      '<text x="52" y="68" fill="#F2AE4B" font-family="sans-serif" font-size="16" font-weight="800" letter-spacing="2">' + safeEsc(cRoaster.toUpperCase()) + '</text>' +
      '<text x="52" y="114" fill="#FFFDF9" font-family="Georgia,serif" font-size="34" font-weight="700">' + safeEsc(cName.slice(0, 32)) + '</text>' +
      '<text x="52" y="148" fill="#E3F2EA" font-family="sans-serif" font-size="18" font-weight="600">' + safeEsc(svgSubLine) + '</text>' +
      (stars > 0 ? ('<circle cx="634" cy="98" r="38" fill="#F2AE4B"/><text x="634" y="106" text-anchor="middle" fill="#1A1412" font-family="monospace" font-size="22" font-weight="800">' + stars.toFixed(2) + '</text>') : '') +
      '<rect x="48" y="206" width="624" height="196" rx="20" fill="#EFE6DA"/>' +
      '<text x="76" y="246" fill="#685244" font-family="sans-serif" font-size="14" font-weight="800" letter-spacing="1.5">SHARED BREW RECIPE (' + safeEsc(String(method).toUpperCase()) + ')</text>' +
      '<text x="76" y="294" fill="#1A1412" font-family="monospace" font-size="28" font-weight="800">' + doseG + ' g \u2192 ' + waterG + ' g (1:' + ratio + ')</text>' +
      '<text x="76" y="336" fill="#4E3C31" font-family="monospace" font-size="21" font-weight="700">Grind: ' + safeEsc(gSet) + ' (~' + um + ' \u00B5m) \u00B7 ' + safeEsc(svgTempDisp) + '</text>' +
      (svgFooterLine ? ('<text x="76" y="376" fill="#9A4212" font-family="sans-serif" font-size="18" font-weight="700">' + safeEsc(svgFooterLine) + '</text>') : '') +
      '<g transform="translate(260, 446)">' + realQrSvg.replace(/width="\d+"/, 'width="200"').replace(/height="\d+"/, 'height="200"') + '</g>' +
      '<text x="360" y="690" text-anchor="middle" fill="#1A1412" font-family="sans-serif" font-size="18" font-weight="800">Scan to Auto-Match Grind to Any Home Grinder</text>' +
      '<text x="360" y="720" text-anchor="middle" fill="#685244" font-family="monospace" font-size="13">' + safeEsc(btUri.slice(0, 64)) + '</text>' +
      '<text x="360" y="846" text-anchor="middle" fill="#9A4212" font-family="Georgia,serif" font-size="18" font-weight="700">BeanTelligence \u00B7 Offline Scannable Brew Passport</text>' +
      '</svg>';

    return {
      uri: btUri,
      textCode: btTextCode,
      jsonCode: jsonShareStr,
      qrSvg: realQrSvg,
      tradingCardSvg: tradingCardSvg,
      title: cName,
      meta: {
        roaster: cRoaster,
        originLine: [cOrigin, cProc, cRoast].filter(Boolean).join(' \u00B7 '),
        methodLabel: S.humanMethodName(method),
        recipeLine: doseG + ' g \u2192 ' + waterG + ' g (1:' + ratio + ')',
        grindTempLine: gSet + ' (~' + um + ' \u00B5m) \u00B7 ' + (v74Meta.tempProfileLabel || (tempC + ' \u00B0C')),
        stars: stars,
        isLocked: !!(rowOrBag && (rowOrBag.dial_locked === 'yes' || rowOrBag.dial_locked === '1')),
        notes: notes,
        isBlend: !!blendInfo.isBlend,
        blendLine: blendInfo.isBlend ? blendInfo.pillText : '',
        blendDetail: blendInfo.isBlend ? blendInfo.detailLine : '',
        tempProfileLine: v74Meta.tempProfileLabel || '',
        brewerMaterialLine: v74Meta.brewerMaterialLabel || ''
      }
    };
  }

  function openQrPassportSheet(rowOrBag, opts) {
    opts = opts || {};
    var art = buildPassportArtifacts(rowOrBag);
    S.openSheetSafe('passport-qr', { item: rowOrBag, art: art, fromDetailIdx: opts.fromDetailIdx }, { title: 'QR Trading-Card Passport', detent: 'full' });
  }

  function solveCloneCafeDrinkSafe(drinkObj) {
    var a = S.getApp();
    var gear = (a.prefs && a.prefs.gear) || {};
    var pOwned = a.prefs && Array.isArray(a.prefs.ownedBrewers) && a.prefs.ownedBrewers.length ? a.prefs.ownedBrewers : null;
    var gOwned = Array.isArray(gear.ownedBrewers) && gear.ownedBrewers.length ? gear.ownedBrewers : null;
    var owned = pOwned || gOwned || (a.brew && a.brew.method ? [a.brew.method, 'aeropress'] : ['v60', 'aeropress']);
    var gKey = (a.brew && a.brew.grinderKey) || gear.grinderKey || 'comandante-c40';

    var inn = (typeof window !== 'undefined' && window.BTInnovate) ? window.BTInnovate : null;
    var core = (typeof window !== 'undefined' && window.BTCoreV6) ? window.BTCoreV6 : null;
    var extFn = (inn && (inn.cloneCafeDrinkToHome || inn.reverseEngineerCafeDrink)) || (core && core.cloneCafeDrinkToHome);
    if (typeof extFn === 'function') {
      try {
        var ext = extFn.call(inn || core, drinkObj, { ownedBrewers: owned, grinderKey: gKey, prefs: a.prefs });
        if (ext && (ext.brewStudioRecipe || ext.recipe || ext.brew || ext.methodKey || ext.method)) {
          var rx = ext.brewStudioRecipe || ext.recipe || ext.brew || ext;
          var mKey = ext.methodKey || rx.methodKey || rx.method || 'v60';
          var dG = +ext.doseG || +rx.doseG || +rx.dose || 18;
          var wG = +ext.waterG || +rx.waterG || +rx.water || 60;
          var hCost = (ext.economics && +ext.economics.estimatedHomeCost > 0) ? +ext.economics.estimatedHomeCost : (+ext.homeCost || 0.95);
          var sav = (ext.economics && ext.economics.savingsPerCup != null) ? +ext.economics.savingsPerCup : Math.max(0, (+(drinkObj && drinkObj.price) || 5.75) - hCost);
          var stepsTxt = Array.isArray(ext.baristaSteps) && ext.baristaSteps.length
            ? ext.baristaSteps.join(' ')
            : (ext.stepsLine || ext.summary || ('Brew ' + dG + ' g \u2192 ' + wG + ' g on your home gear.'));
          return {
            methodKey: mKey,
            brewerLabel: ext.brewerLabel || S.humanMethodName(mKey),
            doseG: dG,
            waterG: wG,
            ratio: +rx.ratio || Math.round((wG / Math.max(1, dG)) * 10) / 10,
            tempC: +ext.tempC || +rx.tempC || 93,
            grindUm: +ext.d50Um || +rx.grindUm || +rx.d50Um || 360,
            grindDisplay: ext.grindLabel || '',
            stepsLine: stepsTxt + (ext.grindLabel ? (' (Grind: ' + ext.grindLabel + ')') : ''),
            upgradeNote: ext.upgradeNote || '',
            homeCost: hCost,
            savingsPerCup: sav
          };
        }
      } catch (_) {}
    }

    var kind = String((drinkObj && drinkObj.kind) || 'cortado').toLowerCase();
    var isFilter = kind === 'pour' || kind === 'brewed' || kind === 'icedcoffee';
    var isCold = kind === 'cold' || kind === 'nitro';
    var hasEsp = owned.indexOf('espresso') >= 0 || owned.indexOf('lever_espresso') >= 0;
    var hasPhilips = owned.indexOf('philips5500') >= 0;
    var isIced = drinkObj && (drinkObj.temp === 'iced' || kind === 'icedlatte' || kind === 'icedcoffee' || isCold);
    var strengthAdj = drinkObj && drinkObj.strength === 'weak' ? 1.18 : (drinkObj && drinkObj.strength === 'strong' ? 0.88 : 1.0);
    var sweetUpgrade = drinkObj && drinkObj.sweet === 'more'
      ? 'Upgraded from your cafe note: trimmed added syrup -40% (or swap to lactose-free milk for natural sweetness)!'
      : (drinkObj && drinkObj.strength === 'weak' ? 'Upgraded from your cafe note: boosted coffee dose +18% so milk never drowns the coffee!' : '');

    var methodKey = 'v60', brewerLabel = 'Hario V60', doseG = 15, waterG = 250, ratio = 16.7, tempC = 94, grindUm = 540, stepsLine = '';
    if (isFilter) {
      methodKey = 'v60';
      brewerLabel = isIced ? 'Flash-Iced V60' : 'Hario V60 Pour-Over';
      doseG = Math.round(15.5 * strengthAdj * 10) / 10;
      waterG = isIced ? 155 : 250;
      ratio = Math.round(((isIced ? 250 : waterG) / doseG) * 10) / 10;
      tempC = 94;
      grindUm = isIced ? 480 : 545;
      stepsLine = isIced
        ? ('Brew ' + doseG + ' g coffee with 155 g @ 94 \u00B0C directly onto 95 g carafe ice.')
        : ('Pour ' + doseG + ' g : ' + waterG + ' g @ 94 \u00B0C in 3 gentle spirals.');
    } else if (isCold) {
      methodKey = 'cold';
      brewerLabel = 'Home Cold Brew Concentrate';
      doseG = 30;
      waterG = 240;
      ratio = 8.0;
      tempC = 20;
      grindUm = 960;
      stepsLine = 'Steep 30 g coarse coffee in 240 g filtered water 16 h, then serve 1:1 over ice.';
    } else if (hasEsp) {
      methodKey = 'espresso';
      brewerLabel = 'Home Espresso Machine';
      doseG = Math.round(18 * strengthAdj * 10) / 10;
      waterG = Math.round(doseG * 2.1);
      ratio = 2.1;
      tempC = 93;
      grindUm = 235;
      var milkTxt = (drinkObj && drinkObj.milk && drinkObj.milk !== 'none')
        ? (isIced ? (' + pour over 110 g ice & 140 g cold ' + drinkObj.milk + ' milk') : (' + 130 g silky 60 \u00B0C ' + drinkObj.milk + ' microfoam'))
        : '';
      stepsLine = 'Pull ' + doseG + ' g \u2192 ' + waterG + ' g shot (~28s)' + milkTxt + '.';
    } else if (hasPhilips) {
      methodKey = 'philips5500';
      brewerLabel = 'Philips 5500 LatteGo';
      doseG = 14;
      waterG = 45;
      ratio = 3.2;
      tempC = 93;
      grindUm = 320;
      stepsLine = 'Select ' + findDrinkMeta(kind).label + ' \u00B7 Aroma Strength 5/5 + ExtraShot on Philips 5500.';
    } else {
      methodKey = 'aeropress';
      brewerLabel = 'AeroPress Espresso-Style Concentrate';
      doseG = Math.round(18.5 * strengthAdj * 10) / 10;
      waterG = 60;
      ratio = 3.2;
      tempC = 95;
      grindUm = 360;
      stepsLine = 'Steep ' + doseG + ' g fine coffee in 60 g @ 95 \u00B0C for 75s (stir 10s, press gently) + ' + (isIced ? '120 g cold milk over ice.' : '125 g warm 60 \u00B0C frothed milk.');
    }

    var gMapped = '';
    if (core && core.psd && typeof core.psd.mapMicronsToGrinder === 'function') {
      try {
        var gm = core.psd.mapMicronsToGrinder(grindUm, String(gKey).replace(/_/g, '-'), a.prefs && a.prefs.pocketMicronCalib, methodKey);
        if (gm && (gm.shortDisplay || gm.display || gm.label)) gMapped = gm.shortDisplay || gm.display || gm.label;
      } catch (_) {}
    }

    var homeCost = Math.round((doseG * 0.062 + ((drinkObj && drinkObj.milk && drinkObj.milk !== 'none') ? 0.28 : 0.05)) * 100) / 100;
    var cafePrice = +(drinkObj && drinkObj.price) || 5.75;

    return {
      methodKey: methodKey,
      brewerLabel: brewerLabel,
      doseG: doseG,
      waterG: waterG,
      ratio: ratio,
      tempC: tempC,
      grindUm: grindUm,
      grindDisplay: gMapped,
      stepsLine: stepsLine + (gMapped ? (' (Grind: ' + gMapped + ')') : ''),
      upgradeNote: sweetUpgrade,
      homeCost: homeCost,
      savingsPerCup: Math.max(0, Math.round((cafePrice - homeCost) * 100) / 100)
    };
  }

  /* ========================================================================
     SEGMENT 1: `Open Shelf & Trails`
     ======================================================================== */
  function buildOpenShelfAndTrailsSegment(repaint) {
    var a = S.getApp();
    var lens = S.experienceLensSafe();
    var storage = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : null;
    var ck = (typeof window !== 'undefined' && window.BTChartKit) ? window.BTChartKit : null;
    var priceList = S.getNormalizedPrices();
    var hObjs = S.getHistoryObjs();
    var unified = (storage && typeof storage.buildUnifiedCoffeesIndex === 'function')
      ? storage.buildUnifiedCoffeesIndex(hObjs, priceList)
      : [];

    var wrap = S.h('div', { style: 'display:flex;flex-direction:column;gap:14px' });

    /* 0. Last Cup Quick-Jump & Best/Golden Recipes Hall-of-Fame Strip */
    var shelfLastCup = buildLastCupJumpBar(hObjs);
    if (shelfLastCup) wrap.appendChild(shelfLastCup);
    var goldenShowcase = buildGoldenShowcaseSection(hObjs);
    if (goldenShowcase) wrap.appendChild(goldenShowcase);

    /* A. Active Dial-In Trail Sparklines */
    var trailGroups = Object.create(null);
    hObjs.forEach(function (r) {
      if (!r || !r.coffee_name) return;
      var cClean = typeof unneutralize === 'function' ? unneutralize(r.coffee_name) : r.coffee_name;
      var rClean = typeof unneutralize === 'function' ? unneutralize(r.roaster || '') : (r.roaster || '');
      var mKey = (typeof resolveMethod === 'function' ? resolveMethod(r.brew_method) : '') || String(r.brew_method || 'v60').toLowerCase();
      var gk = (r.coffee_id || (cClean.toLowerCase() + '|' + rClean.toLowerCase())) + '::' + mKey;
      if (!trailGroups[gk]) {
        trailGroups[gk] = { key: gk, coffee: cClean, roaster: rClean, method: mKey, rows: [] };
      }
      trailGroups[gk].rows.push(r);
    });

    var trailKeys = Object.keys(trailGroups);
    if (trailKeys.length) {
      var trailSec = S.h('section', { class: 'bt-tc-card' },
        S.h('div', { class: 'bt-tc-row-between' },
          S.h('div', null,
            S.h('div', { class: 'bt-tc-kicker', text: 'Your Dial-In Progress' }),
            S.h('b', { style: 'font-size:1rem', text: 'Active Bag Dial-In Trails' })
          ),
          S.h('span', { class: 'bt-tc-badge is-gold', text: trailKeys.length + ' Trail' + (trailKeys.length === 1 ? '' : 's') })
        )
      );

      var visibleTrails = ui.showAllTrails ? trailKeys.slice(0, 8) : trailKeys.slice(0, 1);
      visibleTrails.forEach(function (tk) {
        var grp = trailGroups[tk];
        var chron = grp.rows.slice().sort(function (x, y) {
          return String(x.saved_at || x.cupping_date || '').localeCompare(String(y.saved_at || y.cupping_date || ''));
        });
        var lockedRow = chron.find(function (r) { return r.dial_locked === 'yes' || r.dial_locked === '1'; }) || null;
        var latest = chron[chron.length - 1];
        var trailText = chron.map(function (r, idx) {
          var st = parseFloat(r.my_rating_stars) || 0;
          var isL = r.dial_locked === 'yes' || r.dial_locked === '1';
          return 'Try #' + (idx + 1) + ' (' + (st > 0 ? st.toFixed(2) : 'Logged') + (isL ? ' Gold' : '') + ')';
        }).join(' \u2192 ');

        var sparkEl = S.h('div');
        if (ck && typeof ck.dialInSparklineSvg === 'function') {
          try {
            var pts = chron.map(function (r, idx) {
              return {
                val: parseFloat(r.my_rating_stars) || 3.8,
                deltaLabel: 'Try #' + (idx + 1),
                locked: r.dial_locked === 'yes' || r.dial_locked === '1'
              };
            });
            sparkEl.innerHTML = ck.dialInSparklineSvg(pts, lockedRow ? null : { val: 4.75 });
            /* Lift the "Sweet Spot" zone label above the band so the trajectory curve never slices through the text */
            var zoneLbl = sparkEl.querySelector('.bt-spark-zone-lbl');
            if (zoneLbl) {
              zoneLbl.setAttribute('y', '10');
              zoneLbl.setAttribute('x', '353');
              zoneLbl.setAttribute('text-anchor', 'end');
              zoneLbl.setAttribute('pointer-events', 'none');
            }
          } catch (_) {}
        }

        var guardActive = ui.confirmOverwriteKey === tk && ui.confirmOverwriteUntil > Date.now();

        trailSec.appendChild(S.h('div', { class: 'bt-tc-well' },
          S.h('div', { class: 'bt-tc-row-between' },
            S.h('div', { style: 'display:flex;align-items:center;gap:8px' },
              lockedRow ? buildGoldSealSvg(24) : null,
              S.h('div', null,
                S.h('b', { style: 'font-size:0.92rem;display:block', text: (grp.roaster ? grp.roaster + ' \u2014 ' : '') + grp.coffee }),
                S.h('span', { class: 'mono', style: 'font-size:0.75rem;color:var(--ink-secondary)', text: S.humanMethodName(grp.method) + ' \u00B7 ' + trailText })
              )
            ),
            S.h('button', {
              type: 'button',
              class: 'bt-tc-pill is-compact ' + (lockedRow ? 'is-active' : 'is-copper'),
              text: guardActive ? 'Confirm Switch \u2192' : (lockedRow ? '1-Tap Brew Gold \u2192' : ('Brew Try #' + (chron.length + 1) + ' \u2192')),
              onclick: function () {
                if (hasActiveHomeDraft() && a.coffee && a.coffee.name && a.coffee.name !== grp.coffee && !guardActive) {
                  ui.confirmOverwriteKey = tk;
                  ui.confirmOverwriteUntil = Date.now() + 6000;
                  S.toastSafe('Active brew open \u2014 tap again to switch to ' + grp.coffee);
                  repaint();
                  return;
                }
                ui.confirmOverwriteKey = '';
                var trailMatched = findCoffeeRecordsMatch(latest && latest.coffee_id, grp.coffee, grp.roaster);
                var trailURec = trailMatched.uRec || {
                  coffee_id: (latest && latest.coffee_id) || '',
                  name: grp.coffee,
                  roaster: grp.roaster,
                  lockedBrew: lockedRow,
                  latestBrew: latest
                };
                hydrateBrewFromRowOrBag(lockedRow || null, trailURec, null);
                navigateToHomeRecipe();
              }
            })
          ),
          sparkEl
        ));
      });
      if (trailKeys.length > 1) {
        trailSec.appendChild(S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-compact is-soft',
          style: 'align-self:flex-start',
          text: ui.showAllTrails ? 'Show top trail only' : ('Show all ' + trailKeys.length + ' trails \u2192'),
          onclick: function () {
            ui.showAllTrails = !ui.showAllTrails;
            S.haptic('tick');
            repaint();
          }
        }));
      }
      wrap.appendChild(trailSec);
    }

    /* B. Open Shelf Bags + Freshness + Collapsed Freezer Vault + Fresh Bag + Real QR */
    var vaultList = getCoffeesVaultSafe();
    var openBags = priceList.map(function (b, idx) {
      return Object.assign({ _priceIdx: idx }, b);
    }).filter(function (b) { return !b.finished; });

    var hasOpenBagMatch = function (cid, name, roaster) {
      var cleanCid = isSyntheticCoffeeId(cid) ? '' : String(cid).trim();
      var nName = normCoffeeKeyPart(name);
      var nRoast = normCoffeeKeyPart(roaster);
      return openBags.some(function (ob) {
        var obCid = isSyntheticCoffeeId(ob.coffee_id || ob.id) ? '' : String(ob.coffee_id || ob.id).trim();
        if (cleanCid && obCid && cleanCid === obCid) return true;
        var obName = normCoffeeKeyPart(ob.coffee);
        var obRoast = normCoffeeKeyPart(ob.roaster);
        return nName && obName === nName && (!nRoast || !obRoast || obRoast === nRoast);
      });
    };

    unified.forEach(function (u) {
      if (!u || !u.name) return;
      if (!hasOpenBagMatch(u.coffee_id, u.name, u.roaster) && openBags.length < SHELF_MAX_BAGS) {
        openBags.push({
          _priceIdx: -1,
          _unifiedRec: u,
          id: u.coffee_id || ('uf_' + openBags.length),
          coffee_id: u.coffee_id || '',
          coffee: u.name,
          roaster: u.roaster || '',
          size: +u.bag_weight_g || (u.openBag && +u.openBag.total_g) || 250,
          unit: 'g',
          price: +u.price || (u.openBag && +u.openBag.price) || 21,
          currency: u.currency || '$',
          rlevel: u.roast || 'light',
          roast: u.roast_date || '',
          rem_g: (u.openBag && u.openBag.rem_g != null) ? +u.openBag.rem_g : (u.remaining_g != null && u.remaining_g !== '' ? +u.remaining_g : (+u.bag_weight_g || 180)),
          is_frozen: u.is_frozen || '',
          frozen_date: u.frozen_date || '',
          bag_notes: u.bag_notes || '',
          origin: u.origin || '',
          region: u.region || '',
          process: u.process || '',
          varietal: u.varietal || '',
          elevation_m: u.elevation_m || ''
        });
      }
    });

    vaultList.forEach(function (vr) {
      if (!vr || !vr.name) return;
      if (!hasOpenBagMatch(vr.coffee_id || vr.id, vr.name, vr.roaster) && openBags.length < SHELF_MAX_BAGS) {
        openBags.push({
          _priceIdx: -1,
          _vaultRec: vr,
          id: vr.coffee_id || vr.id || ('uf_' + openBags.length),
          coffee_id: vr.coffee_id || vr.id || '',
          coffee: vr.name,
          roaster: vr.roaster || '',
          size: +vr.bag_weight_g || 250,
          unit: 'g',
          price: +vr.price || 21,
          currency: vr.currency || '$',
          rlevel: vr.roast || 'light',
          roast: vr.roast_date || '',
          rem_g: (vr.remaining_g != null && vr.remaining_g !== '') ? +vr.remaining_g : (+vr.bag_weight_g || 250),
          is_frozen: vr.is_frozen || '',
          frozen_date: vr.frozen_date || '',
          bag_notes: vr.bag_notes || vr.notes || '',
          origin: vr.origin || '',
          region: vr.region || '',
          process: vr.process || '',
          varietal: vr.varietal || '',
          elevation_m: vr.elevation_m || ''
        });
      }
    });

    wrap.appendChild(S.h('div', { class: 'bt-tc-row-between' },
      S.h('div', null,
        S.h('div', { class: 'bt-tc-kicker', text: 'Open Bags & Freezer Reserve' }),
        S.h('b', { style: 'font-size:1.02rem', text: openBags.length ? (openBags.length + ' Open Bag' + (openBags.length === 1 ? '' : 's') + ' on Your Shelf') : 'Your Coffee Shelf Is Ready' })
      ),
      S.h('div', { class: 'bt-tc-pill-wrap' },
        S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-compact is-copper',
          onclick: function () {
            ui.seg = 'prices';
            if (a.tabSegments) a.tabSegments.cellar = 'prices';
            ui.priceAddOpen = true;
            repaint();
          }
        }, S.iconEl('fresh-bag', { size: 15 }), S.h('span', { text: '+ Add Bag' }))
      )
    ));

    if (!openBags.length) {
      var emptyCard = S.h('section', { class: 'bt-tc-card', style: 'align-items:center;text-align:center;padding:24px 18px' });
      if (typeof Beanjamin !== 'undefined' && Beanjamin && typeof Beanjamin.svg === 'function') {
        var bj = S.h('div', { style: 'width:56px;height:56px', 'data-beanjamin': '1' });
        bj.innerHTML = Beanjamin.svg('welcome', { view: 'avatar' });
        emptyCard.appendChild(bj);
      }
      emptyCard.appendChild(S.h('b', { style: 'font-size:1.05rem', text: 'Add your first bag to track Peak Freshness & Freezer Doses' }));
      emptyCard.appendChild(S.h('p', { class: 'bt-tc-sub', text: 'Start a home brew on Tab 1 (AI Bag Scan auto-adds your bag!) or log a bag purchase in Prices.' }));
      emptyCard.appendChild(S.h('div', { class: 'bt-tc-pill-wrap', style: 'justify-content:center' },
        S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-active',
          text: 'Enter Coffee in Brew Studio \u2192',
          onclick: function () { S.navGo('coffee'); }
        }),
        S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-soft',
          text: '+ Log Bag Purchase',
          onclick: function () {
            ui.seg = 'prices';
            if (a.tabSegments) a.tabSegments.cellar = 'prices';
            ui.priceAddOpen = true;
            repaint();
          }
        })
      ));
      wrap.appendChild(emptyCard);
      return wrap;
    }

    /* Shelf Search / Filter / Sort pre-pass (evaluates every bag once) */
    var shelfMeta = openBags.map(function (bag, bIdx) {
      var mb = findCoffeeRecordsMatch(bag.coffee_id || bag.id, bag.coffee, bag.roaster, {
        unified: unified,
        prices: priceList,
        vaultList: vaultList
      });
      var uR = bag._unifiedRec || mb.uRec || null;
      var vR = bag._vaultRec || mb.vaultRec || null;
      var e = evaluateShelfBag(bag, uR || vR);
      var hay = [
        bag.coffee, bag.roaster, bag.origin, bag.region, bag.process, bag.varietal, bag.rlevel, bag.bag_notes, bag.notes,
        vR && vR.origin, vR && vR.bag_notes, vR && vR.notes, vR && vR.process,
        uR && uR.origin, uR && uR.bag_notes, uR && uR.process
      ].filter(Boolean).join(' ').toLowerCase();
      return { bag: bag, bIdx: bIdx, ev: e, golden: !!(uR && uR.lockedBrew), hay: hay };
    });

    var SHELF_FILTERS = [
      ['all', 'All Bags'],
      ['peak', 'At Peak'],
      ['frozen', 'Frozen'],
      ['golden', 'Golden Locked'],
      ['low', 'Low / Empty']
    ];
    var SHELF_SORTS = [
      ['use_first', 'Use First'],
      ['cups_left', 'Cups Left'],
      ['newest', 'Newest Roast'],
      ['name', 'Name A\u2013Z']
    ];

    function getShelfVisible() {
      var q = String(ui.shelfQ || '').trim().toLowerCase();
      var list = shelfMeta.filter(function (m) {
        if (ui.shelfFilter === 'peak' && !(m.ev.inPeak && !m.ev.isEmpty)) return false;
        if (ui.shelfFilter === 'frozen' && !m.ev.isFrozen) return false;
        if (ui.shelfFilter === 'golden' && !m.golden) return false;
        if (ui.shelfFilter === 'low' && !(m.ev.isLowBag || m.ev.isEmpty)) return false;
        if (!q) return true;
        return q.split(/\s+/).every(function (tok) { return m.hay.indexOf(tok) >= 0; });
      });
      list.sort(function (x, y) {
        var r = 0;
        if (ui.shelfSort === 'cups_left') {
          r = x.ev.remG - y.ev.remG;
        } else if (ui.shelfSort === 'newest') {
          var xa = x.ev.rawAge == null ? 9999 : x.ev.rawAge;
          var ya = y.ev.rawAge == null ? 9999 : y.ev.rawAge;
          r = xa - ya;
        } else if (ui.shelfSort === 'name') {
          r = String(x.bag.coffee || '').localeCompare(String(y.bag.coffee || ''));
        } else {
          /* Use First: unfrozen bags closest to (or past) the end of their peak window come first; empty bags last */
          var xe = x.ev.isEmpty ? 1 : 0;
          var ye = y.ev.isEmpty ? 1 : 0;
          r = xe - ye;
          if (!r) {
            var xl = x.ev.isFrozen ? 9999 : (x.ev.peakEnd - x.ev.effAge);
            var yl = y.ev.isFrozen ? 9999 : (y.ev.peakEnd - y.ev.effAge);
            r = xl - yl;
          }
        }
        return r || (x.bIdx - y.bIdx);
      });
      return list;
    }

    var shelfCountEl = S.h('span', { class: 'bt-tc-sub', style: 'margin:0', 'aria-live': 'polite' });
    var shelfListHost = S.h('div', { style: 'display:flex;flex-direction:column;gap:14px' });

    function paintShelfList() {
      var vis = getShelfVisible();
      var cap = ui.showAllBags ? vis.length : Math.min(vis.length, SHELF_VISIBLE_DEFAULT);
      shelfListHost.textContent = '';
      shelfCountEl.textContent = 'Showing ' + cap + ' of ' + openBags.length + ' bag' + (openBags.length === 1 ? '' : 's');
      if (!vis.length) {
        shelfListHost.appendChild(S.h('section', { class: 'bt-tc-card', style: 'text-align:center;padding:20px 16px' },
          S.h('b', { text: 'No bags match this search or filter.' }),
          S.h('div', { class: 'bt-tc-pill-wrap', style: 'justify-content:center' },
            S.h('button', {
              type: 'button',
              class: 'bt-tc-pill is-compact is-copper',
              text: 'Clear Search & Filters',
              onclick: function () { ui.shelfQ = ''; ui.shelfFilter = 'all'; repaint(); }
            })
          )
        ));
        return;
      }
      vis.slice(0, cap).forEach(function (m) { shelfListHost.appendChild(buildBagCard(m)); });
      if (vis.length > SHELF_VISIBLE_DEFAULT) {
        shelfListHost.appendChild(S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-compact is-soft no-print',
          style: 'align-self:flex-start',
          text: ui.showAllBags ? ('Show First ' + SHELF_VISIBLE_DEFAULT + ' Only') : ('Show All Bags (' + vis.length + ')'),
          onclick: function () { ui.showAllBags = !ui.showAllBags; S.haptic('tick'); repaint(); }
        }));
      }
    }

    var shelfInput = S.h('input', {
      type: 'search',
      class: 'bt-tc-search',
      placeholder: 'Search shelf by coffee, roaster, origin, or flavor note...',
      value: ui.shelfQ,
      'aria-label': 'Search open bags on shelf',
      oninput: function (e) {
        ui.shelfQ = e.target.value;
        shelfClear.style.display = ui.shelfQ ? '' : 'none';
        paintShelfList();
      }
    });
    var shelfClear = S.h('button', {
      type: 'button',
      class: 'bt-tc-search-clear no-print',
      'aria-label': 'Clear shelf search',
      style: 'display:' + (ui.shelfQ ? '' : 'none') + ';background:none;border:0;font-size:1.25rem;line-height:1;min-width:32px;min-height:32px;cursor:pointer;color:var(--ink-secondary)',
      text: '\u00D7',
      onclick: function () {
        ui.shelfQ = '';
        shelfInput.value = '';
        shelfClear.style.display = 'none';
        paintShelfList();
        shelfInput.focus();
      }
    });

    wrap.appendChild(S.h('div', { class: 'bt-tc-spotlight no-print' },
      S.iconEl('search-filter', { size: 17 }),
      shelfInput,
      shelfClear
    ));
    wrap.appendChild(S.h('div', { class: 'bt-tc-pill-scroll no-print', role: 'group', 'aria-label': 'Shelf filter and sort' },
      SHELF_FILTERS.map(function (fc) {
        var on = ui.shelfFilter === fc[0];
        return S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-compact' + (on ? ' is-active' : ' is-soft'),
          'aria-pressed': String(on),
          text: fc[1],
          onclick: function () { ui.shelfFilter = fc[0]; repaint(); }
        });
      }),
      S.h('button', {
        type: 'button',
        class: 'bt-tc-pill is-compact is-soft',
        text: 'Sort: ' + (SHELF_SORTS.filter(function (s) { return s[0] === ui.shelfSort; })[0] || SHELF_SORTS[0])[1],
        onclick: function () {
          var ix = 0;
          SHELF_SORTS.forEach(function (s, i) { if (s[0] === ui.shelfSort) ix = i; });
          ui.shelfSort = SHELF_SORTS[(ix + 1) % SHELF_SORTS.length][0];
          repaint();
        }
      })
    ));
    wrap.appendChild(shelfCountEl);
    wrap.appendChild(shelfListHost);

    function buildBagCard(meta) {
      var bag = meta.bag;
      var bIdx = meta.bIdx;
      var matchedBag = findCoffeeRecordsMatch(bag.coffee_id || bag.id, bag.coffee, bag.roaster, {
        unified: unified,
        prices: priceList,
        vaultList: vaultList
      });
      var uRec = bag._unifiedRec || matchedBag.uRec || null;
      var vRec = bag._vaultRec || matchedBag.vaultRec || null;
      var ev = evaluateShelfBag(bag, uRec || vRec);
      var bagKey = bag.id || (bag.coffee + '_' + bIdx);
      var isLocked = !!(uRec && uRec.lockedBrew);
      var pullDose = +(a.brew && a.brew.dose) || +(bag.dose) || 15;

      var cardOrigin = pickRichStr(vRec && vRec.origin, uRec && uRec.origin, bag.origin);
      var cardRegion = pickRichStr(vRec && vRec.region, uRec && uRec.region, bag.region);
      var cardProc = pickRichStr(vRec && vRec.process, uRec && uRec.process, bag.process);
      var cardRoast = pickRichStr(vRec && vRec.roast, uRec && uRec.roast, bag.rlevel);
      var cardVarietal = pickRichStr(vRec && vRec.varietal, uRec && uRec.varietal, bag.varietal);
      var cardElev = pickRichStr(vRec && vRec.elevation_m, uRec && uRec.elevation_m, bag.elevation_m);
      var cardBagNotes = pickRichStr(
        vRec && vRec.bag_notes, vRec && vRec.notes,
        uRec && uRec.bag_notes,
        bag.bag_notes, bag.notes
      );
      var cardFlavorChips = String(cardBagNotes || '')
        .split(/[;,/|]/)
        .map(function (s) { return s.trim(); })
        .filter(Boolean)
        .slice(0, 5);
      var cardOriginLine = [cardOrigin, cardRegion].filter(Boolean).join(' \u00B7 ');
      var cardMetaChips = [
        cardOriginLine,
        cardProc ? cardProc.replace(/\b[a-z]/g, function (ch) { return ch.toUpperCase(); }) : '',
        cardRoast ? (cardRoast.replace(/-/g, ' ').replace(/\b[a-z]/g, function (ch) { return ch.toUpperCase(); }) + ' Roast') : '',
        cardVarietal,
        cardElev ? (cardElev + ' masl') : ''
      ].filter(Boolean);

      var tubes = [];
      if (bag.tubes_json) {
        try { tubes = JSON.parse(bag.tubes_json) || []; } catch (_) {}
      }
      var hasCryoState = ev.isFrozen || tubes.length > 0;
      var cryoExpanded = !!(ui.cryoOpenMap[bagKey] || hasCryoState);
      var freshOpen = !!ui.freshRolloverMap[bagKey];

      /* Freezer Vault (-18 C · 12x Slower Aging, collapsed cleanly when empty) */
      var cryoBlock = null;
      if (!cryoExpanded) {
        cryoBlock = S.h('button', {
          type: 'button',
          class: 'bt-cryo-summary-btn',
          'aria-expanded': 'false',
          onclick: function () { ui.cryoOpenMap[bagKey] = true; repaint(); }
        },
          S.h('span', { style: 'display:inline-flex;align-items:center;gap:6px' },
            S.iconEl('cryo-snowflake', { size: 16 }),
            S.h('span', { text: 'Freezer Vault (-18 \u00B0C \u00B7 12\u00D7 Slower Aging \u00B7 Freeze / Pull Dose)' })
          ),
          S.h('span', { class: 'mono', style: 'font-size:0.78rem', text: 'Open +' })
        );
      } else {
        var calGrid = S.h('div', { class: 'bt-cryo-cal-grid', 'aria-label': '14-day freshness and freezer calendar' });
        for (var d = 0; d < 14; d++) {
          var dayAge = Math.round(ev.effAge) + (ev.isFrozen ? +(d / 12.3).toFixed(1) : d);
          var cellCls = ev.isFrozen ? 'is-cryo' : (dayAge < ev.restEnd ? 'is-rest' : (dayAge <= ev.peakEnd ? 'is-peak' : ''));
          var dtObj = new Date();
          dtObj.setDate(dtObj.getDate() + d);
          calGrid.appendChild(S.h('div', { class: 'bt-cryo-day-cell ' + cellCls },
            S.h('span', { text: (dtObj.getMonth() + 1) + '/' + dtObj.getDate() }),
            S.h('span', { style: 'font-size:0.64rem', text: ev.isFrozen ? 'Frozen' : ('D' + Math.round(dayAge)) })
          ));
        }

        var thawEnd = ui.thawTimers[bagKey] || 0;
        var thawRem = thawEnd > Date.now() ? Math.ceil((thawEnd - Date.now()) / 60000) : 0;

        cryoBlock = S.h('div', { class: 'bt-tc-well' },
          S.h('div', { class: 'bt-tc-row-between' },
            S.h('b', { style: 'font-size:0.84rem;color:var(--science)', text: lens === 'scientist' ? 'Freezer Calendar (-18 \u00B0C \u00B7 Arrhenius 12.3\u00D7 Slowdown)' : 'Freezer Calendar (-18 \u00B0C \u00B7 12\u00D7 Slower Aging)' }),
            S.h('button', {
              type: 'button',
              class: 'bt-tc-pill is-compact is-soft',
              text: 'Hide',
              onclick: function () { ui.cryoOpenMap[bagKey] = false; repaint(); }
            })
          ),
          calGrid,
          S.h('div', { class: 'bt-tc-pill-scroll' },
            S.h('button', {
              type: 'button',
              class: 'bt-tc-pill is-compact' + (ev.isFrozen ? ' is-active' : ' is-soft'),
              onclick: function () {
                var nextFrz = ev.isFrozen ? '' : 'yes';
                if (bag._priceIdx >= 0) {
                  var list = S.getNormalizedPrices();
                  if (list[bag._priceIdx]) {
                    list[bag._priceIdx].is_frozen = nextFrz;
                    list[bag._priceIdx].frozen_date = nextFrz ? S.isoDaysAgo(0) : '';
                    S.saveNormalizedPrices(list);
                  }
                } else if (storage && typeof storage.applyFreshBagRoastDate === 'function') {
                  storage.applyFreshBagRoastDate(uRec || vRec || bag, bag.roast || S.isoDaysAgo(7), { freeze: !!nextFrz, addToShelf: true });
                }
                upsertVaultSafe({
                  id: (uRec && uRec.coffee_id) || (vRec && (vRec.coffee_id || vRec.id)) || bag.coffee_id || '',
                  name: bag.coffee,
                  roaster: bag.roaster || '',
                  is_frozen: nextFrz,
                  frozen_date: nextFrz ? S.isoDaysAgo(0) : ''
                });
                S.toastSafe(nextFrz ? 'Bag marked Frozen at -18 \u00B0C (12\u00D7 slower aging)!' : 'Moved bag back to counter shelf');
                repaint();
              }
            }, S.iconEl('cryo-snowflake', { size: 14 }), S.h('span', { text: ev.isFrozen ? 'Frozen at -18 \u00B0C' : 'Freeze Bag Now' })),
            S.h('button', {
              type: 'button',
              class: 'bt-tc-pill is-compact is-copper bt-pull-dose-btn' + (ev.isEmpty ? ' is-disabled' : ''),
              'aria-disabled': ev.isEmpty ? 'true' : 'false',
              title: ev.isEmpty ? 'Bag empty \u2014 tap Fresh Bag to refill or start a new bag' : ('Remove ' + pullDose + ' g from this bag for thawing (inventory only, does not start a brew)'),
              style: ev.isEmpty ? 'opacity:0.55;cursor:not-allowed' : '',
              onclick: function () {
                /* 0 g guard: never pull from an empty bag */
                var curRem = ev.remG;
                if (ev.isEmpty || curRem <= 0.4) {
                  S.toastSafe('Bag empty \u2014 tap Fresh Bag to refill or start a new bag');
                  return;
                }
                /* Pull Dose is an inventory-only action (stays on Shelf). Brewing is a separate path that deducts exactly once at the timer/save step. */
                var pullG = Math.min(pullDose, curRem);
                var nextRem = Math.max(0, Math.round((curRem - pullG) * 10) / 10);
                if (bag._priceIdx >= 0) {
                  var list = S.getNormalizedPrices();
                  if (list[bag._priceIdx]) {
                    list[bag._priceIdx].rem_g = nextRem;
                    list[bag._priceIdx].is_frozen = 'yes';
                    if (nextRem <= 0.4) list[bag._priceIdx].finished = S.isoDaysAgo(0);
                    S.saveNormalizedPrices(list);
                  }
                }
                upsertVaultSafe({
                  id: (uRec && uRec.coffee_id) || (vRec && (vRec.coffee_id || vRec.id)) || bag.coffee_id || '',
                  name: bag.coffee,
                  roaster: bag.roaster || '',
                  is_frozen: 'yes',
                  remaining_g: nextRem
                });
                var bagSymPull = bag.sym || (bag.currency === 'EUR' ? '\u20AC' : bag.currency === 'GBP' ? '\u00A3' : '$');
                S.toastSafe('Pulled ' + pullG + ' g frozen dose (' + nextRem + ' g left \u00B7 ' + bagSymPull + ev.perCup.toFixed(2) + '/cup). Bag updated only \u2014 brewing it later deducts again.');
                repaint();
              }
            }, S.h('span', { text: ev.isEmpty ? 'Bag Empty' : ('Pull ' + pullDose + ' g Dose (\u2212' + pullDose + ' g)') })),
            S.h('button', {
              type: 'button',
              class: 'bt-tc-pill is-compact is-soft',
              text: thawRem > 0 ? ('Thawing Sealed: ' + thawRem + 'm') : ('Safe Thaw Guide (' + ev.thawMin + 'm)'),
              onclick: function () {
                ui.thawTimers[bagKey] = Date.now() + ev.thawMin * 60000;
                S.toastSafe('Keep bag sealed ' + ev.thawMin + ' min before opening so room moisture never condenses on cold beans!');
                repaint();
              }
            })
          )
        );
      }

      /* Fresh Bag Roast-Date Rollover Helper & Drawer */
      function applyRolloverIso(iso) {
        if (!iso) return;
        if (storage && typeof storage.applyFreshBagRoastDate === 'function') {
          try { storage.applyFreshBagRoastDate(uRec || vRec || bag, iso, { resetBagGrams: true, addToShelf: true }); } catch (_) {}
        }
        if (bag._priceIdx >= 0) {
          var list = S.getNormalizedPrices();
          if (list[bag._priceIdx]) {
            list[bag._priceIdx].roast = iso;
            list[bag._priceIdx].finished = '';
            list[bag._priceIdx].rem_g = ev.totalG;
            S.saveNormalizedPrices(list);
          }
        }
        upsertVaultSafe({
          id: (uRec && uRec.coffee_id) || (vRec && (vRec.coffee_id || vRec.id)) || bag.coffee_id || '',
          name: bag.coffee,
          roaster: bag.roaster || '',
          roast_date: iso,
          is_frozen: '',
          frozen_date: '',
          remaining_g: ev.totalG
        });
        ui.freshRolloverMap[bagKey] = false;
        S.toastSafe('Started Fresh Bag roasted ' + iso + ' (Gold Recipe preserved)!');
        repaint();
      }

      var freshDrawer = freshOpen ? S.h('div', { class: 'bt-tc-well' },
        S.h('b', { style: 'font-size:0.82rem', text: 'Bought a Fresh Bag of This Coffee? Pick New Roast Date (Keeps Your Gold Recipe!):' }),
        S.h('div', { class: 'bt-tc-pill-scroll' },
          [
            ['Roasted Today', 0],
            ['3d ago', 3],
            ['6d ago', 6],
            ['10d ago', 10]
          ].map(function (opt) {
            return S.h('button', {
              type: 'button',
              class: 'bt-tc-pill is-compact is-active',
              text: opt[0],
              onclick: function () { applyRolloverIso(S.isoDaysAgo(opt[1])); }
            });
          }),
          S.h('input', {
            type: 'date',
            class: 'bt-tc-input',
            max: S.isoDaysAgo(0),
            value: bag.roast || S.isoDaysAgo(4),
            'aria-label': 'Fresh bag roast date',
            onchange: function (e) { applyRolloverIso(e.target.value); }
          })
        )
      ) : null;

      var bagGuardKey = 'shelf_' + bagKey;
      var bagGuardArmed = ui.confirmOverwriteKey === bagGuardKey && ui.confirmOverwriteUntil > Date.now();
      var bagSym = bag.sym || (bag.currency === 'EUR' ? '\u20AC' : bag.currency === 'GBP' ? '\u00A3' : '$');
      var bagChron = getCoffeeHistoryChronological(bag.coffee, bag.roaster, bag.coffee_id || (uRec && uRec.coffee_id), hObjs);
      var bagTimeline = buildDialInConvergenceTimeline(bagChron, null, { compact: true });

      return S.h('article', {
        class: 'bt-cellar-bag-card',
        style: '--bag-roast-color:' + S.roastColorFor(cardRoast || bag.rlevel)
      },
        S.h('div', { class: 'bt-tc-row-between' },
          S.h('div', { style: 'display:flex;align-items:center;gap:8px;min-width:0' },
            isLocked ? buildGoldSealSvg(26) : null,
            S.h('div', { style: 'min-width:0' },
              S.h('div', { class: 'bt-tc-kicker', text: (bag.roaster || 'Specialty Roaster') + ' \u00B7 ' + bagSym + ev.perCup.toFixed(2) + '/cup (' + bagSym + ev.per100g.toFixed(2) + '/100g)' }),
              S.h('h3', { style: 'margin:2px 0;font-family:var(--font-display);font-size:1.1rem', text: bag.coffee })
            )
          ),
          S.h('span', { class: 'bt-tc-badge ' + ev.windowTone, text: ev.windowLabel })
        ),
        cardMetaChips.length ? S.h('div', { class: 'bt-journal-flavor-row' },
          cardMetaChips.map(function (mc) {
            return S.h('span', { class: 'bt-tc-badge is-sci', text: mc });
          })
        ) : null,
        cardFlavorChips.length ? S.h('div', { class: 'bt-journal-flavor-row' },
          cardFlavorChips.map(function (fc) {
            return S.h('span', { class: 'bt-tc-badge is-soft', style: 'font-weight:700', text: fc });
          })
        ) : null,
        S.h('div', { class: 'bt-tc-row-between' },
          S.h('span', { class: 'mono', style: 'font-size:0.8rem;color:var(--ink-secondary)', text: ev.remG + ' g / ' + ev.totalG + ' g remaining (' + ev.pctLeft + '%)' + (ev.isEmpty ? '' : (' \u00B7 ~' + ev.cupsLeft + ' cup' + (ev.cupsLeft === 1 ? '' : 's') + ' left')) }),
          S.h('div', { class: 'bt-tc-pill-wrap', style: 'gap:6px' },
            ev.isEmpty ? S.h('span', { class: 'bt-tc-badge is-warn', text: 'Empty' }) : (ev.isLowBag ? S.h('span', { class: 'bt-tc-badge is-warn bt-low-bag-pill', text: 'Low Bag' }) : null),
            isLocked ? S.h('span', { class: 'bt-tc-badge is-gold', text: 'Gold Recipe Locked' }) : null
          )
        ),
        S.h('div', { class: 'bt-cellar-meter' }, S.h('i', { style: 'width:' + ev.pctLeft + '%' })),
        bagTimeline,
        ev.oddTail ? S.h('div', { class: 'bt-tc-tabu-banner' },
          S.h('span', { text: 'Last-Dose Bag Rescue (' + ev.oddTail.remG + ' g left): Brew ' + ev.oddTail.remG + ' g coffee : ' + ev.oddTail.waterG + ' g water slightly finer so a shallow bed stays sweet!' })
        ) : null,
        S.h('div', { class: 'bt-tc-pill-scroll' },
          S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-active',
            onclick: function () {
              if (hasActiveHomeDraft() && a.coffee && a.coffee.name && a.coffee.name !== bag.coffee && !bagGuardArmed) {
                ui.confirmOverwriteKey = bagGuardKey;
                ui.confirmOverwriteUntil = Date.now() + 6000;
                S.toastSafe('Active brew open \u2014 tap again to load ' + bag.coffee);
                repaint();
                return;
              }
              ui.confirmOverwriteKey = '';
              hydrateBrewFromRowOrBag(null, uRec, bag);
              navigateToHomeRecipe();
            }
          }, S.iconEl('brew', { size: 16 }), S.h('span', { text: bagGuardArmed ? 'Confirm Switch \u2192' : '1-Tap Brew \u2192' })),
          S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-copper',
            text: 'Edit in Step 1 \u2192',
            onclick: function () {
              hydrateBrewFromRowOrBag(null, uRec, bag);
              if (a && a.tabSegments) a.tabSegments.cellar = ui.seg;
              S.saveDraftSafe();
              S.navGo('coffee');
            }
          }),
          S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-soft',
            'aria-expanded': String(freshOpen),
            text: 'Fresh Bag',
            onclick: function () { ui.freshRolloverMap[bagKey] = !freshOpen; repaint(); }
          }),
          S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-soft',
            onclick: function () { openQrPassportSheet((uRec && (uRec.lockedBrew || uRec.bestBrew)) || bag); }
          }, S.iconEl('qr-passport', { size: 16 }), S.h('span', { text: 'QR Passport' }))
        ),
        freshDrawer,
        cryoBlock
      );
    }

    paintShelfList();
    return wrap;
  }

  /* ========================================================================
     SEGMENT 2: `Brew Journal` + Detail + Lossless Edit + Compare 2-3 Brews
     ======================================================================== */
  function openTastingDetailSheet(rowIdx) {
    var hObjs = S.getHistoryObjs();
    var r = typeof rowIdx === 'object' ? rowIdx : hObjs[rowIdx];
    if (!r) return;
    var realIdx = r._i != null ? r._i : (typeof rowIdx === 'number' ? rowIdx : hObjs.indexOf(r));
    S.openSheetSafe('screen-detail', { row: r, rowIdx: realIdx }, { title: 'Tasting Passport Detail', detent: 'full' });
  }

  function openTastingEditSheet(rowIdx, initialTab, opts) {
    opts = opts || {};
    var hObjs = S.getHistoryObjs();
    var r = typeof rowIdx === 'object' ? rowIdx : hObjs[rowIdx];
    if (!r) return;
    var realIdx = r._i != null ? r._i : (typeof rowIdx === 'number' ? rowIdx : hObjs.indexOf(r));
    S.openSheetSafe('screen-tasting-edit', { row: r, rowIdx: realIdx, tab: initialTab || 'tasting', fromDetail: !!opts.fromDetail }, { title: 'Edit Tasting & Coffee', detent: 'full' });
  }

  function buildJournalSegment(repaint) {
    var hObjs = S.getHistoryObjs();
    var storage = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : null;
    var wrap = S.h('div', { style: 'display:flex;flex-direction:column;gap:14px' });

    /* 6-Tile Symmetric KPI Strip (3x2 on mobile) */
    var distinctSet = Object.create(null);
    var gemsCount = 0, lockedCount = 0, cuppingsCount = 0, starSum = 0, starN = 0;
    hObjs.forEach(function (r) {
      if (!r) return;
      distinctSet[(r.coffee_id || r.coffee_name || '').toLowerCase()] = 1;
      var st = parseFloat(r.my_rating_stars) || 0;
      if (st >= 4.5) gemsCount++;
      if (st > 0) { starSum += st; starN++; }
      if (r.dial_locked === 'yes' || r.dial_locked === '1') lockedCount++;
      if (isCuppingRow(r)) cuppingsCount++;
    });

    wrap.appendChild(S.h('div', { class: 'bt-tc-kpi-grid' },
      [
        ['Logged Cups', String(hObjs.length), 'all'],
        ['Coffees', String(Object.keys(distinctSet).length), 'all'],
        ['4.5+ Gems', String(gemsCount), 'gems'],
        ['Gold Locked', String(lockedCount), 'locked'],
        ['Cuppings', String(cuppingsCount), 'cupping'],
        ['Avg Rating', starN ? (starSum / starN).toFixed(2) : '\u2014', 'all']
      ].map(function (kp) {
        return S.h('button', {
          type: 'button',
          class: 'bt-tc-kpi-tile bt-drillable' + (ui.journalFilter === kp[2] && kp[2] !== 'all' ? ' is-active' : ''),
          style: 'text-align:center;cursor:pointer',
          onclick: function () {
            ui.journalFilter = kp[2];
            S.haptic('tick');
            repaint();
          }
        },
          S.h('span', { class: 'bt-tc-kpi-val', text: kp[1] }),
          S.h('span', { class: 'bt-tc-kpi-lbl', text: kp[0] })
        );
      })
    ));

    var lastCupBar = buildLastCupJumpBar(hObjs);
    if (lastCupBar) wrap.appendChild(lastCupBar);

    /* Interactive Ratings & Cuppings Drill-Down Strip + Expandable Rating & CVA Breakdown */
    var tierBuckets = {
      all: { rows: [], starSum: 0, starN: 0, scaSum: 0, scaN: 0 },
      tier5: { rows: [], starSum: 0, starN: 0, scaSum: 0, scaN: 0 },
      tier4: { rows: [], starSum: 0, starN: 0, scaSum: 0, scaN: 0 },
      tier3: { rows: [], starSum: 0, starN: 0, scaSum: 0, scaN: 0 },
      tierLow: { rows: [], starSum: 0, starN: 0, scaSum: 0, scaN: 0 },
      locked: { rows: [], starSum: 0, starN: 0, scaSum: 0, scaN: 0 },
      cupping: { rows: [], starSum: 0, starN: 0, scaSum: 0, scaN: 0 }
    };
    var originAgg = Object.create(null);
    var methodAgg = Object.create(null);
    var pushBucket = function (bk, r, idx) {
      var b = tierBuckets[bk];
      if (!b) return;
      b.rows.push({ r: r, idx: idx });
      var st = parseFloat(r.my_rating_stars) || 0;
      var sc = parseFloat(r.total_score) || 0;
      if (st > 0) { b.starSum += st; b.starN++; }
      if (sc > 0) { b.scaSum += sc; b.scaN++; }
    };
    hObjs.forEach(function (r, idx) {
      if (!r) return;
      pushBucket('all', r, idx);
      var tk = classifyJournalRatingTier(r);
      if (tk && tierBuckets[tk]) pushBucket(tk, r, idx);
      if (r.dial_locked === 'yes' || r.dial_locked === '1') pushBucket('locked', r, idx);
      if (isCuppingRow(r)) pushBucket('cupping', r, idx);

      var stVal = parseFloat(r.my_rating_stars) || 0;
      var orig = unneutCellar(r.origin || '');
      if (orig && !isUnkCoffeeVal(orig) && stVal > 0) {
        if (!originAgg[orig]) originAgg[orig] = { label: orig, sum: 0, n: 0 };
        originAgg[orig].sum += stVal; originAgg[orig].n++;
      }
      var isCupMeth = String(r.brew_method || '').toLowerCase() === 'cupping';
      var meth = isCupMeth ? 'Cupping Table' : S.humanMethodName(r.brew_method);
      if (meth && stVal > 0) {
        if (!methodAgg[meth]) methodAgg[meth] = { label: meth, isCupping: isCupMeth, sum: 0, n: 0 };
        methodAgg[meth].sum += stVal; methodAgg[meth].n++;
      }
    });

    var ratingPillDefs = [
      { k: 'all', lbl: 'All', showSca: false },
      { k: 'tier5', lbl: '5\u2605 Favorites', showSca: false },
      { k: 'tier4', lbl: '4\u20134.75\u2605', showSca: false },
      { k: 'tier3', lbl: '3\u20133.75\u2605', showSca: false },
      { k: 'tierLow', lbl: '<3\u2605', showSca: false },
      { k: 'locked', lbl: 'Golden Locked', showSca: false },
      { k: 'cupping', lbl: '5-Bowl Cuppings', showSca: true }
    ];

    var ratingStripCard = S.h('section', { class: 'bt-tc-card bt-journal-breakdown-card', id: 'bt-journal-rating-strip' },
      S.h('div', { class: 'bt-tc-row-between' },
        S.h('div', { style: 'min-width:0;flex:1 1 180px' },
          S.h('div', { class: 'bt-tc-kicker', text: 'Ratings & 5-Bowl Cuppings Drill-Down' }),
          S.h('b', { style: 'font-size:0.96rem', text: 'Filter by Rating Tier or Inspect Cupping Attributes' })
        ),
        S.h('button', {
          type: 'button',
          id: 'bt-journal-breakdown-toggle',
          class: 'bt-tc-pill is-compact is-soft',
          'aria-expanded': String(!!ui.journalBreakdownOpen),
          text: ui.journalBreakdownOpen ? 'Hide Breakdown \u25B2' : 'Show Breakdown \u25BC',
          onclick: function () { ui.journalBreakdownOpen = !ui.journalBreakdownOpen; S.haptic('tick'); repaint(); }
        })
      ),
      S.h('div', { class: 'bt-rating-tier-bar', role: 'group', 'aria-label': 'Ratings and cuppings quick drill-down strip' },
        ratingPillDefs.map(function (pd) {
          var b = tierBuckets[pd.k];
          var on = ui.journalFilter === pd.k;
          var avgStr = '';
          if (pd.showSca && b.scaN > 0) avgStr = ' \u00B7 ' + (b.scaSum / b.scaN).toFixed(1) + ' SCA';
          else if (b.starN > 0) avgStr = ' \u00B7 ' + (b.starSum / b.starN).toFixed(1) + '\u2605';
          return S.h('button', {
            type: 'button',
            class: 'bt-rating-tier-btn bt-tc-pill is-compact bt-drillable' + (on ? ' is-active' : ' is-soft'),
            'aria-pressed': String(on),
            'data-journal-tier': pd.k,
            onclick: function () {
              ui.journalFilter = (on && pd.k !== 'all') ? 'all' : pd.k;
              S.haptic('tick');
              repaint();
            }
          }, pd.lbl + ' (' + b.rows.length + avgStr + ')');
        })
      )
    );

    if (ui.journalBreakdownOpen) {
      var drawer = S.h('div', { class: 'bt-drill-drawer', id: 'bt-journal-breakdown-drawer' });
      var distTiers = [
        { k: 'tier5', lbl: '5\u2605 Favorites' },
        { k: 'tier4', lbl: '4\u20134.75\u2605 Great' },
        { k: 'tier3', lbl: '3\u20133.75\u2605 Dialing' },
        { k: 'tierLow', lbl: '<3\u2605 Needs Fix' }
      ];
      var totalStarRows = hObjs.length || 1;
      drawer.appendChild(S.h('div', { class: 'bt-drill-drawer-head' },
        S.h('strong', { class: 'bt-drill-drawer-title', text: 'Star Distribution (Tap any bar to filter)' })
      ));
      drawer.appendChild(S.h('div', { class: 'bt-rating-dist-list' },
        distTiers.map(function (dt) {
          var b = tierBuckets[dt.k];
          var cnt = b.rows.length;
          var pct = hObjs.length ? Math.round((cnt / totalStarRows) * 100) : 0;
          var barW = cnt > 0 ? Math.max(8, pct) : 0;
          var active = ui.journalFilter === dt.k;
          return S.h('button', {
            type: 'button',
            class: 'bt-rating-dist-row bt-drillable' + (active ? ' is-active' : ''),
            'aria-pressed': String(active),
            onclick: function () {
              ui.journalFilter = active ? 'all' : dt.k;
              S.haptic('tick');
              repaint();
            }
          },
            S.h('span', { class: 'bt-rating-dist-label', text: dt.lbl }),
            S.h('div', { class: 'bt-rating-dist-track' },
              S.h('div', { class: 'bt-rating-dist-fill', style: 'width:' + barW + '%' })
            ),
            S.h('span', { class: 'bt-rating-dist-count mono', text: cnt + ' (' + pct + '%)' })
          );
        })
      ));

      var topOrigs = Object.keys(originAgg).map(function (k) { return originAgg[k]; })
        .sort(function (a, b) { return (b.sum / b.n) - (a.sum / a.n) || b.n - a.n; }).slice(0, 4);
      var topMeths = Object.keys(methodAgg).map(function (k) { return methodAgg[k]; })
        .sort(function (a, b) { return (b.sum / b.n) - (a.sum / a.n) || b.n - a.n; }).slice(0, 4);

      if (topOrigs.length || topMeths.length) {
        drawer.appendChild(S.h('div', { class: 'bt-drill-meta-row' },
          topOrigs.length ? S.h('span', { class: 'bt-tc-kicker', text: 'Top Origins:' }) : null,
          topOrigs.map(function (og) {
            return S.h('button', {
              type: 'button',
              class: 'bt-tc-pill is-compact is-soft bt-drillable',
              text: og.label + ' (' + (og.sum / og.n).toFixed(1) + '\u2605)',
              onclick: function () { ui.journalQ = og.label; S.haptic('tick'); repaint(); }
            });
          }),
          topMeths.length ? S.h('span', { class: 'bt-tc-kicker', style: 'margin-left:4px', text: 'Top Methods:' }) : null,
          topMeths.map(function (mt) {
            return S.h('button', {
              type: 'button',
              class: 'bt-tc-pill is-compact is-soft bt-drillable',
              text: mt.label + ' (' + (mt.sum / mt.n).toFixed(1) + '\u2605)',
              onclick: function () {
                if (mt.isCupping) { ui.journalFilter = 'cupping'; ui.journalQ = ''; }
                else { ui.journalQ = mt.label; }
                S.haptic('tick');
                repaint();
              }
            });
          })
        ));
      }

      /* 5-Bowl / SCA Cupping 8-Trait Average & Min-Max Spread Breakdown */
      var cupList = tierBuckets.cupping.rows;
      if (cupList.length > 0) {
        var traitStats = CVA_8_TRAITS.map(function (tr) {
          var vals = [];
          cupList.forEach(function (it) {
            var raw = (it.r[tr.key] != null && it.r[tr.key] !== '') ? it.r[tr.key] : (tr.altKey ? it.r[tr.altKey] : '');
            var v = parseFloat(raw);
            if (isFinite(v) && v > 0) vals.push({ v: v, item: it });
          });
          if (!vals.length) return { key: tr.key, label: tr.label, hint: tr.hint, n: 0, avg: 0, min: 0, max: 0, vals: [] };
          var sum = vals.reduce(function (a, x) { return a + x.v; }, 0);
          var mn = Math.min.apply(null, vals.map(function (x) { return x.v; }));
          var mx = Math.max.apply(null, vals.map(function (x) { return x.v; }));
          return { key: tr.key, label: tr.label, hint: tr.hint, n: vals.length, avg: +(sum / vals.length).toFixed(2), min: mn, max: mx, vals: vals };
        });
        var scoredTraits = traitStats.filter(function (t) { return t.n > 0; });
        var hiAvg = scoredTraits.length ? Math.max.apply(null, scoredTraits.map(function (t) { return t.avg; })) : 0;
        var loAvg = scoredTraits.length ? Math.min.apply(null, scoredTraits.map(function (t) { return t.avg; })) : 0;
        var maxScaleAll = scoredTraits.some(function (t) { return t.max > 9.05; }) ? 10 : 9;

        drawer.appendChild(S.h('div', { class: 'bt-drill-drawer-head', style: 'margin-top:4px' },
          S.h('div', { style: 'min-width:0;flex:1' },
            S.h('div', { class: 'bt-tc-kicker', text: '5-Bowl / SCA Cupping 8-Trait Spread (' + cupList.length + ' Round' + (cupList.length === 1 ? '' : 's') + ')' }),
            S.h('strong', { class: 'bt-drill-drawer-title', text: scoredTraits.length > 0 ? 'Average & Min\u2013Max Across All 8 Attributes (Tap any trait to drill)' : '5-Bowl / SCA Cupping Summary' })
          ),
          ui.selectedCvaTrait ? S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-compact is-soft',
            text: 'Clear Trait',
            onclick: function () { ui.selectedCvaTrait = ''; repaint(); }
          }) : null
        ));

        if (scoredTraits.length > 0) {
          drawer.appendChild(S.h('div', { class: 'bt-sca-attr-grid', id: 'bt-journal-cva-spread-grid' },
            traitStats.map(function (ts) {
              var active = ui.selectedCvaTrait === ts.key;
              var isHi = ts.n > 0 && hiAvg - loAvg >= 0.2 && Math.abs(ts.avg - hiAvg) < 0.01;
              var isLo = ts.n > 0 && hiAvg - loAvg >= 0.2 && Math.abs(ts.avg - loAvg) < 0.01;
              var pct = ts.n > 0 ? Math.max(8, Math.min(100, Math.round((ts.avg / maxScaleAll) * 100))) : 0;
              return S.h('button', {
                type: 'button',
                class: 'bt-sca-attr-pill bt-drillable' + (active ? ' is-active' : '') + (isHi ? ' is-high' : '') + (isLo ? ' is-low' : ''),
                'aria-pressed': String(active),
                'data-cva-trait': ts.key,
                onclick: function () {
                  ui.selectedCvaTrait = active ? '' : ts.key;
                  if (!active) ui.journalFilter = 'cupping';
                  S.haptic('tick');
                  repaint();
                }
              },
                S.h('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:5px;width:100%' },
                  S.h('span', { class: 'bt-sca-attr-name', text: ts.label }),
                  S.h('strong', { class: 'bt-sca-attr-val mono', text: ts.n > 0 ? (ts.avg.toFixed(1) + '/' + maxScaleAll) : '\u2014' })
                ),
                S.h('div', { class: 'bt-rating-dist-track', style: 'width:100%' },
                  S.h('div', { class: 'bt-rating-dist-fill', style: 'width:' + pct + '%' })
                ),
                S.h('span', { class: 'bt-drill-cup-sub mono', text: ts.n > 0 ? ('Range ' + ts.min.toFixed(1).replace(/\.0$/, '') + '\u2013' + ts.max.toFixed(1).replace(/\.0$/, '')) : 'No scores' })
              );
            })
          ));
        } else {
          drawer.appendChild(S.h('p', {
            class: 'bt-tc-sub',
            id: 'bt-journal-cva-empty-note',
            style: 'margin:0',
            text: 'Log 0\u201310 attribute scores in the 5-Bowl Cupping Table to unlock trait-by-trait spreads here.'
          }));
        }

        /* Matching Cupping Rounds List (sorted by selected trait when one is clicked!) */
        var selTraitObj = traitStats.find(function (t) { return t.key === ui.selectedCvaTrait; }) || null;
        var cupPreview = selTraitObj
          ? selTraitObj.vals.slice().sort(function (a, b) { return b.v - a.v; }).map(function (x) { return { r: x.item.r, idx: x.item.idx, traitVal: x.v }; })
          : cupList.slice().sort(function (a, b) { return (parseFloat(b.r.total_score) || 0) - (parseFloat(a.r.total_score) || 0); }).map(function (x) { return { r: x.r, idx: x.idx, traitVal: null }; });

        if (cupPreview.length > 0) {
          drawer.appendChild(S.h('div', { class: 'bt-drill-cup-list', style: 'margin-top:4px' },
            S.h('span', {
              class: 'bt-tc-kicker',
              text: selTraitObj
                ? ('Cupping Rounds Ranked by ' + selTraitObj.label + ' (' + selTraitObj.hint + ')')
                : 'Recent & Top Cupping Rounds (Tap any row to open full Scorecard):'
            }),
            cupPreview.slice(0, 5).map(function (cp) {
              var cName = unneutCellar(cp.r.coffee_name || '') || 'Cupped Sample';
              var scVal = parseFloat(cp.r.total_score) || 0;
              return S.h('button', {
                type: 'button',
                class: 'bt-drill-cup-card bt-drillable',
                style: 'text-align:left;width:100%',
                onclick: function () { openTastingDetailSheet(cp.idx); }
              },
                S.h('div', { class: 'bt-drill-cup-head' },
                  S.h('div', { style: 'min-width:0;flex:1' },
                    S.h('strong', { class: 'bt-drill-cup-title', text: cName }),
                    S.h('div', { class: 'bt-drill-cup-sub', text: [unneutCellar(cp.r.roaster || ''), cp.r.cupping_date || '', unneutCellar(cp.r.flavors_liked || '')].filter(Boolean).join(' \u00B7 ') })
                  ),
                  S.h('div', { style: 'display:flex;gap:5px;flex-wrap:wrap;align-items:center' },
                    cp.traitVal != null ? S.h('span', { class: 'bt-tc-badge is-gold mono', text: selTraitObj.label + ' ' + cp.traitVal.toFixed(1).replace(/\.0$/, '') + '/' + maxScaleAll }) : null,
                    scVal > 0 ? S.h('span', { class: 'bt-tc-badge is-sci mono', text: scVal.toFixed(1) + ' SCA' }) : null
                  )
                )
              );
            })
          ));
        }

        /* Side-by-Side 2-Round 8-Trait CVA Cupping Comparison (when >=2 cupping rounds exist) */
        if (cupList.length >= 2) {
          var cmpList = cupList.slice().sort(function (a, b) {
            return (parseFloat(b.r.total_score) || 0) - (parseFloat(a.r.total_score) || 0) || (b.idx - a.idx);
          });
          var idxA = (ui.cuppingCmpA >= 0 && ui.cuppingCmpA < cmpList.length) ? ui.cuppingCmpA : 0;
          var idxB = (ui.cuppingCmpB >= 0 && ui.cuppingCmpB < cmpList.length && ui.cuppingCmpB !== idxA) ? ui.cuppingCmpB : (idxA === 0 ? 1 : 0);
          ui.cuppingCmpA = idxA;
          ui.cuppingCmpB = idxB;
          var rowA = cmpList[idxA].r;
          var rowB = cmpList[idxB].r;
          var nameA = unneutCellar(rowA.coffee_name || '') || 'Round A';
          var nameB = unneutCellar(rowB.coffee_name || '') || 'Round B';

          var cmpWrap = S.h('div', { id: 'bt-journal-cupping-compare', style: 'margin-top:8px;display:flex;flex-direction:column;gap:8px' },
            S.h('div', { class: 'bt-drill-drawer-head' },
              S.h('div', { style: 'min-width:0;flex:1' },
                S.h('div', { class: 'bt-tc-kicker', text: 'Side-by-Side 8-Trait CVA Comparison' }),
                S.h('strong', { class: 'bt-drill-drawer-title', text: 'Compare 2 Cupping Rounds (Delta Grid)' })
              ),
              S.h('button', {
                type: 'button',
                class: 'bt-tc-pill is-compact is-soft',
                'aria-expanded': String(!!ui.cuppingCompareOpen),
                text: ui.cuppingCompareOpen ? 'Hide Compare \u25B2' : 'Compare 2 Rounds \u25BC',
                onclick: function () { ui.cuppingCompareOpen = !ui.cuppingCompareOpen; S.haptic('tick'); repaint(); }
              })
            )
          );

          if (ui.cuppingCompareOpen) {
            var mkRoundSelect = function (curIdx, labelTxt, onPick) {
              var sel = S.h('select', {
                class: 'bt-tc-input',
                'aria-label': labelTxt,
                style: 'min-height:40px;flex:1 1 140px;min-width:0',
                onchange: function (e) { onPick(parseInt(e.target.value, 10) || 0); }
              },
                cmpList.map(function (it, ci) {
                  var lbl = (unneutCellar(it.r.coffee_name || '') || 'Sample') + (it.r.total_score ? (' (' + (+it.r.total_score).toFixed(1) + ')') : '');
                  var opt = S.h('option', { value: String(ci), text: lbl });
                  if (ci === curIdx) opt.selected = true;
                  return opt;
                })
              );
              return sel;
            };

            cmpWrap.appendChild(S.h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap;align-items:center' },
              mkRoundSelect(idxA, 'Select Cupping Round A', function (v) { ui.cuppingCmpA = v; repaint(); }),
              S.h('span', { class: 'bt-tc-kicker', text: 'vs' }),
              mkRoundSelect(idxB, 'Select Cupping Round B', function (v) { ui.cuppingCmpB = v; repaint(); })
            ));

            var cmpBody = S.h('tbody');
            CVA_8_TRAITS.forEach(function (tr) {
              var vA = parseFloat(rowA[tr.key] != null && rowA[tr.key] !== '' ? rowA[tr.key] : (tr.altKey ? rowA[tr.altKey] : ''));
              var vB = parseFloat(rowB[tr.key] != null && rowB[tr.key] !== '' ? rowB[tr.key] : (tr.altKey ? rowB[tr.altKey] : ''));
              var okA = isFinite(vA) && vA > 0;
              var okB = isFinite(vB) && vB > 0;
              var diff = (okA && okB) ? +(vA - vB).toFixed(2) : null;
              var diffTxt = diff == null ? '\u2014' : (Math.abs(diff) < 0.01 ? '0.0' : ((diff > 0 ? '+' : '') + diff.toFixed(1).replace(/\.0$/, '')));
              var diffCls = 'mono' + (diff != null && diff > 0.05 ? ' is-pos' : (diff != null && diff < -0.05 ? ' is-neg' : ''));
              cmpBody.appendChild(S.h('tr', { class: diff != null && Math.abs(diff) >= 0.25 ? 'is-diff' : '' },
                S.h('td', null, S.h('b', { text: tr.label })),
                S.h('td', { class: 'mono' + (diff != null && diff > 0.05 ? ' bt-compare-winner-col' : ''), text: okA ? vA.toFixed(1).replace(/\.0$/, '') : '\u2014' }),
                S.h('td', { class: 'mono' + (diff != null && diff < -0.05 ? ' bt-compare-winner-col' : ''), text: okB ? vB.toFixed(1).replace(/\.0$/, '') : '\u2014' }),
                S.h('td', { class: diffCls, text: diffTxt })
              ));
            });
            var scaA = parseFloat(rowA.total_score) || 0;
            var scaB = parseFloat(rowB.total_score) || 0;
            var scaDiff = (scaA > 0 && scaB > 0) ? +(scaA - scaB).toFixed(2) : null;
            cmpBody.appendChild(S.h('tr', { class: 'is-total-row' },
              S.h('td', null, S.h('b', { text: 'Total SCA' })),
              S.h('td', { class: 'mono' + (scaDiff > 0 ? ' bt-compare-winner-col' : ''), text: scaA > 0 ? scaA.toFixed(2) : '\u2014' }),
              S.h('td', { class: 'mono' + (scaDiff < 0 ? ' bt-compare-winner-col' : ''), text: scaB > 0 ? scaB.toFixed(2) : '\u2014' }),
              S.h('td', { class: 'mono', text: scaDiff == null ? '\u2014' : ((scaDiff > 0 ? '+' : '') + scaDiff.toFixed(2)) })
            ));

            cmpWrap.appendChild(S.h('div', { class: 'bt-compare-scroll' },
              S.h('table', { class: 'bt-cupping-compare-table' },
                S.h('thead', null,
                  S.h('tr', null,
                    S.h('th', { text: 'Trait' }),
                    S.h('th', { text: 'A: ' + (nameA.length > 18 ? (nameA.slice(0, 17) + '\u2026') : nameA) }),
                    S.h('th', { text: 'B: ' + (nameB.length > 18 ? (nameB.slice(0, 17) + '\u2026') : nameB) }),
                    S.h('th', { text: 'Delta' })
                  )
                ),
                cmpBody
              )
            ));
          }
          drawer.appendChild(cmpWrap);
        }
      } else {
        drawer.appendChild(S.h('div', { class: 'bt-tc-row-between', style: 'padding-top:4px' },
          S.h('span', { class: 'bt-tc-sub', text: 'No 5-Bowl SCA/CVA cuppings logged yet — cup coffees side-by-side to unlock your 8-trait spread!' }),
          S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-compact is-copper',
            text: 'Open 5-Bowl Cupping \u2192',
            onclick: function () { S.navGo('sca'); }
          })
        ));
      }

      ratingStripCard.appendChild(drawer);
    }
    wrap.appendChild(ratingStripCard);

    /* Import Shared Brew Recipe Bar (Plain-English Header!) */
    wrap.appendChild(S.h('div', { class: 'bt-tc-card' },
      S.h('div', { class: 'bt-tc-kicker', text: 'Import Shared Brew Recipe (Auto-Matches Your Grinder)' }),
      S.h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap' },
        S.h('div', { class: 'bt-tc-spotlight', style: 'flex:1;min-width:190px' },
          S.h('input', {
            type: 'text',
            placeholder: 'Paste BT6:, BT-code: V1, or bt1: passport code...',
            value: ui.passportCodeInput,
            'aria-label': 'Import shared brew passport code',
            oninput: function (e) { ui.passportCodeInput = e.target.value; }
          })
        ),
        S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-copper',
          text: 'Match to My Grinder & Load \u2192',
          onclick: function () {
            var raw = ui.passportCodeInput.trim();
            if (!raw) return;
            var inn = (typeof window !== 'undefined' && window.BTInnovate) ? window.BTInnovate : null;
            var bs = (typeof window !== 'undefined' && window.BTBrewStudio) ? window.BTBrewStudio : null;
            var a = S.getApp();
            var res = null;
            if (raw.charAt(0) === '{') {
              var parsedJsonShare = parseJsonObjSafe(raw);
              if (parsedJsonShare && (parsedJsonShare.coffee || parsedJsonShare.bean || parsedJsonShare.brew || parsedJsonShare.blendComponents)) {
                res = {
                  ok: true,
                  coffee: parsedJsonShare.coffee || parsedJsonShare.bean || parsedJsonShare,
                  brew: parsedJsonShare.brew || parsedJsonShare.recipe || {}
                };
              }
            }
            if (!res && bs && typeof bs.decodeAnySharedBrew === 'function') {
              try {
                var bt6Res = bs.decodeAnySharedBrew(raw);
                if (bt6Res && bt6Res.ok && (bt6Res.coffee || bt6Res.brew)) res = bt6Res;
              } catch (_) {}
            }
            if (!res) {
              res = (inn && typeof inn.decodeAndLocalizePassport === 'function')
                ? inn.decodeAndLocalizePassport(raw, a.prefs)
                : (typeof shareRead === 'function' ? shareRead(raw) : null);
            }
            if (res && (res.ok || res.coffee || res.bean)) {
              if (res.bean || res.coffee) {
                var importedC = res.bean || res.coffee;
                var impBlend = extractRowBlendInfo(importedC);
                a.coffee = Object.assign(a.coffee || {}, importedC, {
                  answered: 'yes',
                  isBlend: !!impBlend.isBlend,
                  blendComponents: impBlend.isBlend ? impBlend.components : []
                });
                if (a.coffee.bag_notes && !a.coffee.notes) a.coffee.notes = a.coffee.bag_notes;
              }
              var locRx = res.localizedRecipe || res.brew || {};
              if (a.brew) {
                if (locRx.methodKey || locRx.method) a.brew.method = locRx.methodKey || locRx.method;
                if (locRx.doseG || locRx.dose) a.brew.dose = locRx.doseG || locRx.dose;
                if (locRx.waterG || locRx.water) a.brew.water = locRx.waterG || locRx.water;
                if (locRx.d50Um || locRx.grindUm || locRx.grind_um) {
                  var impUm = +(locRx.d50Um || locRx.grindUm || locRx.grind_um);
                  a.brew.grindUm = impUm;
                  a.brew.grind_um = impUm;
                }
                if (locRx.tempC) { a.brew.tempC = locRx.tempC; a.brew.tempF = Math.round(locRx.tempC * 9 / 5 + 32); }
                else if (locRx.tempF) { a.brew.tempF = locRx.tempF; a.brew.tempC = Math.round(((locRx.tempF - 32) * 5 / 9) * 2) / 2; }
                a.brew._savedDialedMethod = a.brew.method || '';
              }
              ui.passportMsg = 'Matched "' + ((a.coffee && a.coffee.name) || 'Shared Recipe') + '" to your grinder & loaded into Brew Studio!';
              S.saveDraftSafe();
              S.toastSafe(ui.passportMsg);
              repaint();
            } else {
              ui.passportMsg = 'Could not read code \u2014 check that it starts with BT6:, BT-code: V1, or bt1:.';
              repaint();
            }
          }
        })
      ),
      ui.passportMsg ? S.h('div', { class: 'bt-tc-sub', text: ui.passportMsg }) : null
    ));

    /* Search + 1-Row Horizontal Filter Chips */
    wrap.appendChild(S.h('div', { class: 'bt-tc-spotlight' },
      S.iconEl('search-filter', { size: 17 }),
      S.h('input', {
        type: 'search',
        placeholder: 'Search journal by coffee, roaster, brewer, or flavor note...',
        value: ui.journalQ,
        'aria-label': 'Search brew journal',
        oninput: function (e) { ui.journalQ = e.target.value; repaint(); }
      })
    ));

    wrap.appendChild(S.h('div', { class: 'bt-tc-pill-scroll', role: 'group', 'aria-label': 'Journal filter chips' },
      [
        ['all',     'All Logs'],
        ['dialed',  'Dialed'],
        ['gems',    '4.5+ Gems'],
        ['dialing', 'Needs Dial-In'],
        ['filter',  'Pour-Over / Drip'],
        ['espresso','Espresso'],
        ['r2',      'Refractometer (%TDS)']
      ].map(function (fc) {
        var on = ui.journalFilter === fc[0];
        return S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-compact' + (on ? ' is-active' : ' is-soft'),
          'aria-pressed': String(on),
          text: fc[1],
          onclick: function () { ui.journalFilter = fc[0]; repaint(); }
        });
      }),
      S.h('button', {
        type: 'button',
        class: 'bt-tc-pill is-compact is-soft',
        text: 'Sort: ' + (ui.journalSort === 'newest' ? 'Newest' : (ui.journalSort === 'best' ? 'Top Rated' : 'Coffee')),
        onclick: function () {
          ui.journalSort = ui.journalSort === 'newest' ? 'best' : (ui.journalSort === 'best' ? 'coffee' : 'newest');
          repaint();
        }
      }),
      S.h('button', {
        type: 'button',
        class: 'bt-tc-pill is-compact is-copper',
        text: '5-Bowl Cupping \u2192',
        onclick: function () { S.navGo('sca'); }
      })
    ));

    /* Compare 2-3 Brews Side-by-Side (with explicit <- Back to Journal!) */
    if (ui.compareIdxs.length < 2 && hObjs.length >= 2) {
      wrap.appendChild(S.h('div', { class: 'bt-tc-well', style: 'flex-direction:row;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px' },
        S.h('span', { style: 'font-size:0.82rem;font-weight:600', text: ui.compareIdxs.length === 1 ? '1 of 3 brews selected \u2014 tap Compare on 1\u20132 more cards below!' : 'Compare 2\u20133 Brews Side-by-Side' }),
        S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-compact is-copper',
          text: 'Compare Latest 2 Brews \u2192',
          onclick: function () {
            ui.compareIdxs = [hObjs.length - 2, hObjs.length - 1];
            repaint();
          }
        })
      ));
    }

    if (ui.compareIdxs.length >= 2) {
      var cmpRows = ui.compareIdxs.map(function (i) { return { idx: i, r: hObjs[i] }; }).filter(function (x) { return !!x.r; });
      if (cmpRows.length >= 2) {
        var anyCmpBlend = cmpRows.some(function (c) { return extractRowBlendInfo(c.r).isBlend; });
        var anyCmpMat = cmpRows.some(function (c) { return !!extractRowV74Meta(c.r).brewerMaterialLabel; });
        var anyCmpPal = cmpRows.some(function (c) { return !!extractRowV74Meta(c.r).palateTargetsLabel; });
        var specRows = [
          { lbl: 'Coffee', fn: function (r) { return (typeof unneutralize === 'function' ? unneutralize(r.coffee_name || '') : r.coffee_name) || '\u2014'; } },
          anyCmpBlend ? { lbl: '2-Coffee Blend', fn: function (r) {
            var bi = extractRowBlendInfo(r);
            return bi.isBlend ? (bi.pillText + ' \u2014 ' + bi.nameA + ' + ' + bi.nameB) : 'Single Coffee';
          } } : null,
          { lbl: 'Brewer', fn: function (r) { return S.humanMethodName(r.brew_method); } },
          anyCmpMat ? { lbl: 'Brewer Material', fn: function (r) { return extractRowV74Meta(r).brewerMaterialLabel || '\u2014'; } } : null,
          { lbl: 'Try #', fn: function (r) { return r.brew_attempt ? ('#' + r.brew_attempt) : '\u2014'; } },
          { lbl: 'Dose : Water', fn: function (r) { return (r.brew_dose_g || '\u2014') + ' g : ' + (r.brew_water_g || '\u2014') + ' g'; } },
          { lbl: 'Ratio', fn: function (r) { return r.brew_ratio ? ('1:' + r.brew_ratio) : '\u2014'; } },
          { lbl: 'Grind Setting', fn: function (r) { return [r.brew_grind_setting, r.brew_grind_target_um ? (r.brew_grind_target_um + ' \u00B5m') : ''].filter(Boolean).join(' \u00B7 ') || '\u2014'; } },
          { lbl: 'Water Temp', fn: function (r) {
            var vm = extractRowV74Meta(r);
            if (vm.tempProfileLabel) return vm.tempProfileLabel;
            return r.brew_temp_c ? (r.brew_temp_c + ' \u00B0C') : (r.brew_temp_f ? (r.brew_temp_f + ' \u00B0F') : '\u2014');
          } },
          { lbl: 'Brew Time', fn: function (r) {
            var sVal = +(r.brew_actual_time_s || r.brew_time_s) || 0;
            return sVal > 0 ? (S.fmtMmSs(sVal) + ' (' + sVal + 's)') : '\u2014';
          } },
          { lbl: 'Strength (%TDS) / Extraction (%EY)', fn: function (r) { return r.brew_tds_pct ? (r.brew_tds_pct + '% / ' + (r.brew_ey_pct || '\u2014') + '%') : '\u2014'; } },
          anyCmpPal ? { lbl: 'Palate Targets', fn: function (r) { return extractRowV74Meta(r).palateTargetsLabel || '\u2014'; } } : null,
          { lbl: 'Rating', fn: function (r) { return r.my_rating_stars ? (r.my_rating_stars + ' / 5.00') : (r.total_score ? (r.total_score + ' / 100') : '\u2014'); } },
          { lbl: 'Balance Note', fn: function (r) { return r.fix_symptom || 'balanced'; } },
          { lbl: 'Flavors Liked', fn: function (r) { return (typeof unneutralize === 'function' ? unneutralize(r.flavors_liked || '') : r.flavors_liked) || '\u2014'; } }
        ].filter(Boolean);

        var cupScore = function (r) {
          var st = parseFloat(r.my_rating_stars);
          if (st > 0) return st;
          var ts = parseFloat(r.total_score);
          return ts > 0 ? ts / 20 : 0;
        };
        var cupScores = cmpRows.map(function (c) { return cupScore(c.r); });
        var bestScore = Math.max.apply(null, cupScores);
        var allTied = cupScores.every(function (s) { return s === cupScores[0]; });
        var isWinnerCol = function (cIdx) { return bestScore > 0 && !allTied && cupScores[cIdx] === bestScore; };

        var theadTr = S.h('tr', null, S.h('th', { text: 'Parameter' }));
        cmpRows.forEach(function (item, cIdx) {
          var win = isWinnerCol(cIdx);
          theadTr.appendChild(S.h('th', { class: win ? 'bt-compare-winner-col' : '' },
            win ? S.h('span', { class: 'bt-tc-badge is-gold', style: 'display:inline-block;margin-bottom:4px', text: '\u2605 Best Cup' }) : null,
            S.h('div', { text: 'Cup ' + String.fromCharCode(65 + cIdx) + (item.r.cupping_date ? ' (' + item.r.cupping_date + ')' : '') }),
            S.h('button', {
              type: 'button',
              class: 'bt-tc-pill is-compact is-active no-print',
              style: 'margin-top:4px;min-height:32px',
              text: 'Brew \u2192',
              onclick: function () {
                hydrateBrewFromRowOrBag(item.r, null, null);
                navigateToHomeRecipe();
              }
            })
          ));
        });

        var anyCmpTempProf = cmpRows.some(function (c) { return !!extractRowV74Meta(c.r).tempProfileLabel; });
        var tbody = S.h('tbody');
        specRows.forEach(function (sr) {
          var vals = cmpRows.map(function (c) { return sr.fn(c.r); });
          var varied = vals.some(function (v) { return v !== vals[0]; });
          var keepAlways = sr.lbl === 'Coffee' || sr.lbl === 'Rating' || sr.lbl === '2-Coffee Blend' || (sr.lbl === 'Water Temp' && anyCmpTempProf);
          if (ui.compareOnlyVaried && !varied && !keepAlways) return;
          var tr = S.h('tr', { class: varied ? 'is-diff' : '' }, S.h('td', null,
            S.h('b', { text: sr.lbl }),
            varied ? S.h('span', { class: 'bt-compare-diff-tag', style: 'margin-left:6px', text: 'Changed' }) : null
          ));
          vals.forEach(function (v, vIdx) {
            var cls = 'mono' + (varied && vIdx > 0 && v !== vals[0] ? ' is-diff-cell' : '') + (isWinnerCol(vIdx) ? ' bt-compare-winner-col' : '');
            tr.appendChild(S.h('td', { class: cls, text: v }));
          });
          tbody.appendChild(tr);
        });

        wrap.appendChild(S.h('section', { class: 'bt-tc-card', id: 'bt-screen-compare' },
          S.h('div', { class: 'bt-tc-row-between' },
            S.h('button', {
              type: 'button',
              class: 'bt-tc-back-pill',
              onclick: function () {
                ui.compareIdxs = [];
                S.haptic('tick');
                repaint();
              }
            }, S.h('span', { text: '\u2190 Back to Journal' })),
            S.h('div', { class: 'bt-tc-pill-wrap' },
              S.h('button', {
                type: 'button',
                class: 'bt-tc-pill is-compact is-soft',
                text: ui.compareOnlyVaried ? 'Differences Only' : 'All Rows',
                onclick: function () { ui.compareOnlyVaried = !ui.compareOnlyVaried; repaint(); }
              }),
              S.h('button', {
                type: 'button',
                class: 'bt-tc-pill is-compact is-soft',
                text: 'Close Compare',
                onclick: function () { ui.compareIdxs = []; repaint(); }
              })
            )
          ),
          S.h('div', null,
            S.h('div', { class: 'bt-tc-kicker', text: 'Side-by-Side Brew Comparison' }),
            S.h('b', { style: 'font-size:0.98rem', text: 'Comparing ' + cmpRows.length + ' Brews (Highlighted Rows Changed)' })
          ),
          S.h('div', { class: 'bt-compare-scroll' },
            S.h('table', { class: 'bt-compare-table' }, S.h('thead', null, theadTr), tbody)
          )
        ));
      }
    }

    var q = ui.journalQ.trim().toLowerCase();
    var filtered = hObjs.map(function (r, idx) { return { r: r, idx: idx }; }).filter(function (it) {
      var r = it.r;
      if (!r) return false;
      var st = parseFloat(r.my_rating_stars) || 0;
      var mk = String(r.brew_method || '').toLowerCase();
      var sk = String(r.score_kind || '').toLowerCase();
      var tierKey = classifyJournalRatingTier(r);
      if (ui.journalFilter === 'tier5' && tierKey !== 'tier5') return false;
      if (ui.journalFilter === 'tier4' && tierKey !== 'tier4') return false;
      if (ui.journalFilter === 'tier3' && tierKey !== 'tier3') return false;
      if (ui.journalFilter === 'tierLow' && tierKey !== 'tierLow') return false;
      if (ui.journalFilter === 'dialed' && !(r.dial_locked === 'yes' || r.dial_locked === '1' || st >= 4.25)) return false;
      if (ui.journalFilter === 'cupping' && !isCuppingRow(r)) return false;
      if (ui.journalFilter === 'gems' && st < 4.5) return false;
      if (ui.journalFilter === 'locked' && r.dial_locked !== 'yes' && r.dial_locked !== '1') return false;
      if (ui.journalFilter === 'dialing' && (st >= 4.25 || r.dial_locked === 'yes')) return false;
      if (ui.journalFilter === 'filter' && /espresso|moka|aeropress|press|cold/.test(mk)) return false;
      if (ui.journalFilter === 'espresso' && mk.indexOf('espresso') < 0 && mk.indexOf('moka') < 0) return false;
      if (ui.journalFilter === 'r2' && !(parseFloat(r.brew_tds_pct) > 0)) return false;
      if (!q) return true;
      var qBlend = extractRowBlendInfo(r);
      var blendSearch = qBlend.isBlend ? ('blend ' + qBlend.nameA + ' ' + qBlend.nameB + ' ' + qBlend.components[0].roaster + ' ' + qBlend.components[1].roaster) : '';
      return [r.coffee_name, r.roaster, r.origin, r.brew_method, S.humanMethodName(r.brew_method), r.flavors_liked, r.general_notes, blendSearch].join(' ').toLowerCase().indexOf(q) >= 0;
    });

    filtered.sort(function (a, b) {
      if (ui.journalSort === 'best') {
        return (parseFloat(b.r.my_rating_stars) || 0) - (parseFloat(a.r.my_rating_stars) || 0);
      }
      if (ui.journalSort === 'coffee') {
        return String(a.r.coffee_name || '').localeCompare(String(b.r.coffee_name || ''));
      }
      return b.idx - a.idx;
    });

    if (!filtered.length) {
      wrap.appendChild(S.h('section', { class: 'bt-tc-card', style: 'text-align:center;padding:22px 16px' },
        S.h('b', { text: hObjs.length ? 'No journal rows match this filter.' : 'No home tastings logged yet.' }),
        S.h('p', { class: 'bt-tc-sub', text: hObjs.length ? 'Clear search or switch filter chips above.' : 'Complete a brew in Tab 1 (Step 5 Taste & Perfect) to build your personal tasting journal.' })
      ));
      return wrap;
    }

    filtered.slice(0, 50).forEach(function (item) {
      var r = item.r;
      var rIdx = item.idx;
      var cClean = (typeof unneutralize === 'function' ? unneutralize(r.coffee_name || '') : r.coffee_name) || 'Tasted Cup';
      var rClean = (typeof unneutralize === 'function' ? unneutralize(r.roaster || '') : r.roaster) || '';
      var inCmp = ui.compareIdxs.indexOf(rIdx) >= 0;
      var isLocked = r.dial_locked === 'yes' || r.dial_locked === '1';
      var starsNum = parseFloat(r.my_rating_stars) || 0;
      var rawSca = parseFloat(r.total_score);
      var scaNum = (isFinite(rawSca) && rawSca > 0)
        ? rawSca
        : (starsNum > 0 ? Math.round((58.0 + ((starsNum - 1.0) / 4.0) * 34.0) * 4) / 4 : 0);
      var isCupping = isCuppingRow(r);
      var cvaCardTraits = extractRowCvaTraits(r);
      var flavorTags = String((typeof unneutralize === 'function' ? unneutralize(r.flavors_liked || '') : r.flavors_liked) || '')
        .split(/[;,|]/).map(function (s) {
          return s.trim().replace(/\b[a-z]/g, function (ch) { return ch.toUpperCase(); });
        }).filter(Boolean).slice(0, 4);
      var nextRecInfo = extractRowRecommendation(r);
      var nextRecCallout = (!isLocked && nextRecInfo.hasRec) ? buildSavedNextBrewCallout(r, true) : null;
      var blendInfo = extractRowBlendInfo(r);
      var v74Meta = extractRowV74Meta(r);

      wrap.appendChild(S.h('article', {
        class: 'bt-cellar-bag-card',
        style: '--bag-roast-color:' + S.roastColorFor(r.roast_level)
      },
        S.h('div', { class: 'bt-tc-row-between' },
          S.h('div', { style: 'display:flex;align-items:center;gap:8px;min-width:0;cursor:pointer', onclick: function () { openTastingDetailSheet(rIdx); } },
            isLocked ? buildGoldSealSvg(22) : null,
            S.h('div', { style: 'min-width:0' },
              S.h('div', { class: 'bt-tc-kicker', text: [rClean, r.cupping_date, S.humanMethodName(r.brew_method), r.brew_attempt ? ('Try #' + r.brew_attempt) : ''].filter(Boolean).join(' \u00B7 ') }),
              S.h('h3', { style: 'margin:2px 0;font-family:var(--font-display);font-size:1.05rem', text: cClean }),
              S.h('div', { class: 'mono', style: 'font-size:0.78rem;color:var(--ink-secondary)', text: (r.brew_dose_g || '15') + 'g : ' + (r.brew_water_g || '250') + 'g \u00B7 ' + (r.brew_grind_setting || (r.brew_grind_target_um ? r.brew_grind_target_um + ' \u00B5m' : '')) + (r.brew_tds_pct ? (' \u00B7 ' + r.brew_tds_pct + '% TDS') : '') })
            )
          ),
          S.h('div', { class: 'bt-journal-score-row' },
            scaNum > 0 ? S.h('span', {
              class: 'bt-tc-badge mono ' + (scaNum >= 86 ? 'is-good' : 'is-sci'),
              text: scaNum.toFixed(1) + ' SCA'
            }) : null,
            starsNum > 0 ? S.h('span', {
              class: 'bt-tc-badge mono ' + (starsNum >= 4.5 ? 'is-gold' : (starsNum >= 3.5 ? 'is-good' : 'is-warn'))
            }, S.iconEl('spark-star', { size: 12 }), S.h('span', { text: starsNum.toFixed(1) + ' / 5' })) : null,
            (scaNum <= 0 && starsNum <= 0) ? S.h('span', { class: 'bt-tc-badge is-soft', text: 'Logged' }) : null
          )
        ),
        (blendInfo.isBlend || v74Meta.tempProfileLabel || isCupping || flavorTags.length > 0) ? S.h('div', { class: 'bt-journal-flavor-row' },
          blendInfo.isBlend ? S.h('span', { class: 'bt-tc-badge bt-journal-blend-badge is-copper', title: blendInfo.detailLine, text: blendInfo.pillText }) : null,
          v74Meta.tempProfileLabel ? S.h('span', { class: 'bt-tc-badge is-sci mono', text: v74Meta.tempProfileLabel }) : null,
          isCupping ? S.h('span', { class: 'bt-tc-badge is-sci', text: 'Cupping Table' }) : null,
          flavorTags.map(function (ft) {
            return S.h('span', { class: 'bt-tc-badge is-soft', style: 'font-weight:700', text: ft });
          })
        ) : null,
        blendInfo.isBlend ? S.h('div', { class: 'bt-journal-blend-split', text: blendInfo.detailLine }) : null,
        cvaCardTraits.hasAny ? S.h('div', { class: 'bt-sca-attr-grid bt-journal-cva-mini', 'aria-label': 'Cupping attribute scores' },
          cvaCardTraits.items.filter(function (it) { return it.val != null; }).map(function (it) {
            var isSel = ui.selectedCvaTrait === it.key;
            return S.h('button', {
              type: 'button',
              class: 'bt-sca-attr-pill bt-drillable' + (isSel ? ' is-active' : '') + (it.isHigh ? ' is-high' : '') + (it.isLow ? ' is-low' : ''),
              onclick: function () { openTastingDetailSheet(rIdx); }
            },
              S.h('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:4px;width:100%' },
                S.h('span', { class: 'bt-sca-attr-name', text: it.label }),
                S.h('strong', { class: 'bt-sca-attr-val mono', text: it.val.toFixed(1).replace(/\.0$/, '') })
              ),
              S.h('div', { class: 'bt-rating-dist-track', style: 'width:100%' },
                S.h('div', { class: 'bt-rating-dist-fill', style: 'width:' + it.pct + '%' })
              )
            );
          })
        ) : null,
        nextRecCallout,
        S.h('div', { class: 'bt-tc-pill-wrap', style: 'flex-wrap:wrap;gap:6px' },
          S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-compact is-soft',
            text: 'Inspect Detail',
            onclick: function () { openTastingDetailSheet(rIdx); }
          }),
          S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-compact is-active',
            text: (!isLocked && nextRecInfo.hasRec) ? 'Apply Fix & Brew Next \u2192' : 'Brew \u2192',
            onclick: function () {
              hydrateBrewFromRowOrBag(r, null, null);
              navigateToHomeRecipe();
            }
          }),
          S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-compact' + (inCmp ? ' is-copper' : ' is-soft'),
            'aria-pressed': String(inCmp),
            text: inCmp ? ('Comparing (' + ui.compareIdxs.length + '/3)') : 'Compare',
            onclick: function () {
              if (inCmp) ui.compareIdxs = ui.compareIdxs.filter(function (x) { return x !== rIdx; });
              else if (ui.compareIdxs.length < 3) ui.compareIdxs.push(rIdx);
              else ui.compareIdxs = [ui.compareIdxs[1], ui.compareIdxs[2], rIdx];
              repaint();
            }
          }),
          S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-compact is-soft',
            text: 'Edit',
            onclick: function () { openTastingEditSheet(rIdx, 'tasting', { fromDetail: false }); }
          }),
          S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-compact is-soft',
            text: 'QR Card',
            onclick: function () { openQrPassportSheet(r); }
          }),
          S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-compact is-soft',
            text: 'Delete',
            onclick: function () {
              if (storage && typeof storage.deleteByIdx === 'function') {
                storage.deleteByIdx(rIdx);
                S.toastSafe('Deleted tasting row', {
                  durationMs: 10000,
                  actionLabel: 'Undo',
                  onAction: function () {
                    if (typeof storage.undoDelete === 'function') { storage.undoDelete(); repaint(); }
                  }
                });
                repaint();
              }
            }
          })
        )
      ));
    });

    return wrap;
  }

  /* ========================================================================
     SEGMENT 3: `At a Coffee Shop` (4-Step Logger: shop -> sdrink -> staste -> sperfect)
     With Explicit <- Previous Step (4->3->2->1) AND <- Back to Home Brew!
     ======================================================================== */
  function getShopStoreAndDraft() {
    var a = S.getApp();
    var storage = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : null;
    var store = { home: { country: 'United States', region: '', city: '' }, shops: [], drinks: [] };
    if (storage && typeof storage.getShops === 'function') {
      var shRes = storage.getShops();
      if (shRes && shRes.store) store = shRes.store;
      else if (shRes && Array.isArray(shRes.drinks)) store = shRes;
    }
    var draft = null;
    if (storage && typeof storage.getShopDraft === 'function') {
      draft = storage.getShopDraft();
    }
    if (!draft || typeof draft !== 'object') {
      draft = a.shopDraft || {};
    }
    var merged = Object.assign({
      on: false,
      step: 'shop', /* 'shop' | 'sdrink' | 'staste' | 'sperfect' */
      name: '',
      city: (store.home && store.home.city) || '',
      region: (store.home && store.home.region) || '',
      country: (store.home && store.home.country) || 'United States',
      date: S.isoDaysAgo(0),
      menu: '',
      kind: 'cortado',
      temp: 'hot',
      size: 'medium',
      amount: '',
      unit: 'oz',
      milk: 'oat',
      shots: 2,
      flavor: 'none',
      how: 'shop',
      sym: '$',
      price: 5.75,
      beans: 4.5,
      face: 'good',
      strength: 'right',
      sweet: 'right',
      again: 'yes',
      worth: 'worth',
      notes: ''
    }, draft);
    a.shopDraft = merged;
    return { store: store, draft: merged };
  }

  function persistShopDraftSafe(draft) {
    var a = S.getApp();
    draft.on = true;
    draft.at = Date.now();
    a.shopDraft = draft;
    var storage = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : null;
    if (storage && typeof storage.saveShopDraft === 'function') {
      try { storage.saveShopDraft(draft); } catch (_) {}
    }
  }

  function clearShopDraftSafe() {
    var a = S.getApp();
    var sh = S.getShell();
    var blank = { on: false, step: 'shop', name: '', shop: '', shopName: '', place: '', city: '', region: '', country: 'United States', date: '', menu: '', kind: '', drink: '', drinkLabel: '', temp: '', size: '', milk: '', shots: 0, flavor: '', sym: '$', price: '', beans: 0, rating: 0, face: '', strength: '', sweet: '', again: '', worth: '', notes: '', at: 0 };
    a.shopDraft = blank;
    if (sh && typeof sh.clearShopDraft === 'function') {
      try { sh.clearShopDraft(); } catch (_) {}
    }
    var storage = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : null;
    if (storage && typeof storage.clearShopDraft === 'function') {
      try { storage.clearShopDraft(); } catch (_) {}
    } else if (storage && typeof storage.saveShopDraft === 'function') {
      try { storage.saveShopDraft(blank); } catch (_) {}
    }
  }

  function buildCafesSegment(repaint) {
    var ctx = getShopStoreAndDraft();
    var store = ctx.store;
    var d = ctx.draft;
    var storage = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : null;
    var wrap = S.h('div', { style: 'display:flex;flex-direction:column;gap:14px' });

    var prevStepMap = {
      sperfect: { key: 'staste', lbl: '\u2190 Back: 3. Taste' },
      staste:   { key: 'sdrink', lbl: '\u2190 Back: 2. Drink' },
      sdrink:   { key: 'shop',   lbl: '\u2190 Back: 1. Cafe' }
    };
    var prevStepInfo = prevStepMap[d.step] || null;
    var canGoBackGlobal = S.canGoBackSafe();
    var activeDraft = hasActiveHomeDraft();

    /* Explicit Cafe Back Navigation Bar (4->3->2->1 AND <- Back to Home Brew!) */
    wrap.appendChild(S.h('div', { class: 'bt-cellar-nav-bar', id: 'bt-cafe-back-bar' },
      S.h('div', { class: 'bt-tc-pill-wrap' },
        prevStepInfo ? S.h('button', {
          type: 'button',
          class: 'bt-tc-back-pill',
          onclick: function () {
            d.step = prevStepInfo.key;
            persistShopDraftSafe(d);
            S.haptic('tick');
            repaint();
          }
        }, S.h('span', { text: prevStepInfo.lbl })) : null,
        (activeDraft || canGoBackGlobal || d.step === 'shop') ? S.h('button', {
          type: 'button',
          class: 'bt-tc-back-pill',
          onclick: function () {
            if (activeDraft) {
              S.navGo(homeDraftReturnRoute());
            } else if (canGoBackGlobal) {
              S.goBackSafe('door');
            } else {
              S.navGo('door');
            }
          }
        }, S.h('span', { text: activeDraft ? homeDraftReturnLabel() : '\u2190 Back to Home Brew' })) : null
      ),
      S.h('span', { class: 'bt-tc-badge is-sci', text: 'Home Brew Draft Protected' })
    ));

    /* 4-Step Progress Bar: 1. Cafe -> 2. Drink -> 3. Taste -> 4. Clone */
    var steps = [
      ['shop',     '1. Cafe'],
      ['sdrink',   '2. Drink'],
      ['staste',   '3. Taste'],
      ['sperfect', '4. Clone']
    ];
    var stepBar = S.h('div', { class: 'bt-tc-seg-bar', role: 'tablist', 'aria-label': '4-Step Cafe Drink Logger' });
    steps.forEach(function (st) {
      var active = d.step === st[0];
      stepBar.appendChild(S.h('button', {
        type: 'button',
        role: 'tab',
        class: 'bt-tc-seg-btn' + (active ? ' is-active' : ''),
        'aria-selected': String(active),
        text: st[1],
        onclick: function () {
          d.step = st[0];
          persistShopDraftSafe(d);
          repaint();
        }
      }));
    });
    wrap.appendChild(stepBar);

    var drinkMeta = findDrinkMeta(d.kind);
    wrap.appendChild(S.h('div', { class: 'bt-shop-ticket' },
      S.h('span', { text: (d.name || 'Choose Cafe') + (d.city ? ' (' + d.city + ')' : '') + ' \u00B7 ' + drinkMeta.label + ' (' + (d.temp || 'hot') + ')' }),
      S.h('span', { class: 'mono', text: (d.sym || '$') + (+d.price || 5.75).toFixed(2) })
    ));

    var stepCard = S.h('section', { class: 'bt-tc-card' });

    if (d.step === 'shop') {
      var savedCafes = (typeof shopList === 'function') ? shopList(store) : [];
      stepCard.appendChild(S.h('div', { class: 'bt-tc-kicker', text: 'Step 1 of 4 \u00B7 Cafe & Location' }));
      if (savedCafes.length) {
        stepCard.appendChild(S.h('div', { class: 'bt-tc-pill-scroll' },
          savedCafes.slice(0, 10).map(function (sc) {
            return S.h('button', {
              type: 'button',
              class: 'bt-tc-pill is-compact' + (d.name === sc.name ? ' is-active' : ' is-soft'),
              text: sc.name + (sc.visits ? ' (' + sc.visits + ')' : ''),
              onclick: function () {
                d.name = sc.name;
                d.city = sc.city || d.city;
                d.region = sc.region || d.region;
                d.country = sc.country || d.country;
                persistShopDraftSafe(d);
                repaint();
              }
            });
          })
        ));
      }
      stepCard.appendChild(S.h('div', { style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px' },
        S.h('div', { class: 'bt-tc-spotlight' },
          S.h('input', {
            type: 'text',
            placeholder: 'Cafe Name (e.g. Heart Roasters)',
            value: d.name,
            'aria-label': 'Cafe name',
            oninput: function (e) { d.name = e.target.value; persistShopDraftSafe(d); }
          })
        ),
        S.h('div', { class: 'bt-tc-spotlight' },
          S.h('input', {
            type: 'text',
            placeholder: 'City',
            value: d.city,
            'aria-label': 'Cafe city',
            oninput: function (e) { d.city = e.target.value; persistShopDraftSafe(d); }
          })
        ),
        S.h('div', { class: 'bt-tc-spotlight' },
          S.h('input', {
            type: 'text',
            placeholder: 'State / Region',
            value: d.region,
            'aria-label': 'State or region',
            oninput: function (e) { d.region = e.target.value; persistShopDraftSafe(d); }
          })
        ),
        S.h('div', { class: 'bt-tc-spotlight' },
          S.h('input', {
            type: 'date',
            max: S.isoDaysAgo(0),
            value: d.date || S.isoDaysAgo(0),
            'aria-label': 'Visit date',
            onchange: function (e) { d.date = e.target.value; persistShopDraftSafe(d); }
          })
        )
      ));
      stepCard.appendChild(S.h('div', { class: 'bt-tc-spotlight' },
        S.h('input', {
          type: 'text',
          placeholder: 'Optional: Single-origin bean or menu drink name...',
          value: d.menu,
          'aria-label': 'Menu or bean name',
          oninput: function (e) { d.menu = e.target.value; persistShopDraftSafe(d); }
        })
      ));
      stepCard.appendChild(S.h('button', {
        type: 'button',
        class: 'bt-tc-primary-btn',
        onclick: function () {
          if (!d.name.trim()) d.name = 'Local Specialty Cafe';
          d.step = 'sdrink';
          persistShopDraftSafe(d);
          repaint();
        }
      }, S.h('span', { text: 'Next: Choose Drink Category \u2192' }), S.iconEl('chevron-right', { size: 18 })));
    } else if (d.step === 'sdrink') {
      stepCard.appendChild(S.h('div', { class: 'bt-tc-kicker', text: 'Step 2 of 4 \u00B7 Drink Category & Build' }));
      stepCard.appendChild(S.h('div', { class: 'bt-tc-pill-scroll', role: 'tablist', 'aria-label': 'Drink categories' },
        CAFE_CATEGORIES_4.map(function (cat) {
          var on = ui.cafeCatKey === cat.key;
          return S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-compact' + (on ? ' is-copper' : ' is-soft'),
            'aria-pressed': String(on),
            text: cat.label,
            onclick: function () { ui.cafeCatKey = cat.key; repaint(); }
          });
        })
      ));

      var curCat = CAFE_CATEGORIES_4.find(function (c) { return c.key === ui.cafeCatKey; }) || CAFE_CATEGORIES_4[0];
      stepCard.appendChild(S.h('div', { class: 'bt-tc-pill-wrap' },
        curCat.items.map(function (it) {
          var on = d.kind === it.v;
          return S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-compact' + (on ? ' is-active' : ''),
            'aria-pressed': String(on),
            text: it.label,
            onclick: function () {
              d.kind = it.v;
              d.temp = it.hot ? 'hot' : 'iced';
              if (it.v === 'pour' || it.v === 'brewed' || it.v === 'espresso' || it.v === 'americano' || it.v === 'cold') d.milk = 'none';
              persistShopDraftSafe(d);
              repaint();
            }
          });
        })
      ));

      stepCard.appendChild(S.h('div', { class: 'bt-tc-pill-scroll' },
        [['hot', 'Hot'], ['iced', 'Iced']].map(function (tp) {
          return S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-compact' + (d.temp === tp[0] ? ' is-active' : ' is-soft'),
            text: tp[1],
            onclick: function () { d.temp = tp[0]; persistShopDraftSafe(d); repaint(); }
          });
        }),
        [['small', 'Small (8 oz)'], ['medium', 'Medium (12 oz)'], ['large', 'Large (16 oz)']].map(function (sz) {
          return S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-compact' + (d.size === sz[0] ? ' is-active' : ' is-soft'),
            text: sz[1],
            onclick: function () { d.size = sz[0]; persistShopDraftSafe(d); repaint(); }
          });
        })
      ));

      stepCard.appendChild(S.h('div', { class: 'bt-tc-pill-scroll' },
        [['none', 'Black / No Milk'], ['whole', 'Whole Milk'], ['oat', 'Barista Oat'], ['twopct', '2% Dairy'], ['almond', 'Almond'], ['soy', 'Soy']].map(function (mk) {
          return S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-compact' + (d.milk === mk[0] ? ' is-copper' : ' is-soft'),
            text: mk[1],
            onclick: function () { d.milk = mk[0]; persistShopDraftSafe(d); repaint(); }
          });
        })
      ));

      stepCard.appendChild(S.h('div', { style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px' },
        S.h('label', { style: 'font-size:0.76rem;font-weight:700;display:flex;flex-direction:column;gap:4px' },
          S.h('span', { text: 'Price (' + d.sym + ')' }),
          S.h('div', { class: 'bt-tc-spotlight', style: 'min-height:44px' },
            S.h('select', {
              style: 'max-width:54px;font-weight:700',
              'aria-label': 'Currency',
              onchange: function (e) { d.sym = e.target.value; persistShopDraftSafe(d); repaint(); }
            },
              ['$', '\u20AC', '\u00A3', 'CA$', 'A$'].map(function (sy) {
                return S.h('option', { value: sy, selected: d.sym === sy, text: sy });
              })
            ),
            S.h('input', {
              type: 'number',
              inputmode: 'decimal',
              step: '0.25',
              min: '0.5',
              max: '200',
              value: String(d.price),
              'aria-label': 'Cafe drink price',
              onchange: function (e) { d.price = S.clamp(+e.target.value || 5.5, 0.5, 200); persistShopDraftSafe(d); repaint(); }
            })
          )
        ),
        S.h('label', { style: 'font-size:0.76rem;font-weight:700;display:flex;flex-direction:column;gap:4px' },
          S.h('span', { text: 'Espresso Shots' }),
          S.h('div', { class: 'bt-tc-pill-scroll' },
            [1, 2, 3, 4].map(function (shN) {
              return S.h('button', {
                type: 'button',
                class: 'bt-tc-pill is-compact mono' + (+d.shots === shN ? ' is-active' : ' is-soft'),
                text: shN + 'x',
                onclick: function () { d.shots = shN; persistShopDraftSafe(d); repaint(); }
              });
            })
          )
        )
      ));

      stepCard.appendChild(S.h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap' },
        S.h('button', {
          type: 'button',
          class: 'bt-tc-back-pill',
          style: 'min-height:54px',
          onclick: function () { d.step = 'shop'; persistShopDraftSafe(d); repaint(); }
        }, S.h('span', { text: '\u2190 Back' })),
        S.h('button', {
          type: 'button',
          class: 'bt-tc-primary-btn',
          style: 'flex:1 1 200px;width:auto',
          onclick: function () { d.step = 'staste'; persistShopDraftSafe(d); repaint(); }
        }, S.h('span', { text: 'Next: Quick Cafe Rating & Notes \u2192' }), S.iconEl('chevron-right', { size: 18 }))
      ));
    } else if (d.step === 'staste') {
      stepCard.appendChild(S.h('div', { class: 'bt-tc-kicker', text: 'Step 3 of 4 \u00B7 Cafe Rating & Balance' }));
      stepCard.appendChild(S.h('div', { class: 'bt-tc-pill-scroll', role: 'radiogroup', 'aria-label': 'Cafe bean rating' },
        [2.5, 3.0, 3.5, 4.0, 4.5, 5.0].map(function (bv) {
          return S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-compact mono' + (+d.beans === bv ? ' is-active' : ''),
            'aria-pressed': String(+d.beans === bv),
            text: bv.toFixed(1) + ' / 5',
            onclick: function () {
              d.beans = bv;
              d.face = bv >= 4.0 ? 'good' : (bv >= 3.0 ? 'okay' : 'notgood');
              persistShopDraftSafe(d);
              repaint();
            }
          });
        })
      ));

      stepCard.appendChild(S.h('div', { class: 'bt-tc-well' },
        S.h('span', { style: 'font-size:0.78rem;font-weight:700', text: 'Strength & Sweetness (Auto-tunes your Home Clone recipe!)' }),
        S.h('div', { class: 'bt-tc-pill-scroll' },
          [['weak', 'Too Weak'], ['right', 'Strength Just Right'], ['strong', 'Too Strong']].map(function (stOpt) {
            return S.h('button', {
              type: 'button',
              class: 'bt-tc-pill is-compact' + (d.strength === stOpt[0] ? ' is-copper' : ' is-soft'),
              text: stOpt[1],
              onclick: function () { d.strength = stOpt[0]; persistShopDraftSafe(d); repaint(); }
            });
          })
        ),
        S.h('div', { class: 'bt-tc-pill-scroll' },
          [['less', 'Not Sweet Enough'], ['right', 'Sweetness Balanced'], ['more', 'Too Sweet']].map(function (swOpt) {
            return S.h('button', {
              type: 'button',
              class: 'bt-tc-pill is-compact' + (d.sweet === swOpt[0] ? ' is-copper' : ' is-soft'),
              text: swOpt[1],
              onclick: function () { d.sweet = swOpt[0]; persistShopDraftSafe(d); repaint(); }
            });
          })
        )
      ));

      stepCard.appendChild(S.h('div', { class: 'bt-tc-pill-scroll' },
        [['worth', 'Worth Every Penny'], ['fair', 'Fair Price'], ['over', 'Overpriced']].map(function (wr) {
          return S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-compact' + (d.worth === wr[0] ? ' is-active' : ' is-soft'),
            text: wr[1],
            onclick: function () { d.worth = wr[0]; persistShopDraftSafe(d); repaint(); }
          });
        }),
        [['yes', 'Order Again'], ['maybe', 'Maybe'], ['no', 'Skip Next Time']].map(function (ag) {
          return S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-compact' + (d.again === ag[0] ? ' is-active' : ' is-soft'),
            text: ag[1],
            onclick: function () { d.again = ag[0]; persistShopDraftSafe(d); repaint(); }
          });
        })
      ));

      stepCard.appendChild(S.h('textarea', {
        class: 'bt-tc-textarea',
        rows: '2',
        placeholder: 'Flavor notes or cup sleeve details...',
        value: d.notes,
        'aria-label': 'Cafe tasting notes',
        oninput: function (e) { d.notes = e.target.value; persistShopDraftSafe(d); }
      }));

      var buildCafeEntryPayload = function () {
        return {
          date: d.date || S.isoDaysAgo(0),
          shop: (d.name || '').trim() || 'Local Specialty Cafe',
          city: (d.city || '').trim(),
          region: (d.region || '').trim(),
          country: d.country || 'United States',
          kind: d.kind || 'cortado',
          name: (d.menu || '').trim(),
          temp: d.temp || 'hot',
          size: d.size || 'medium',
          sym: d.sym || '$',
          price: +d.price || 5.75,
          face: d.face || 'good',
          beans: +d.beans || 4.5,
          again: d.again || 'yes',
          worth: d.worth || 'worth',
          notes: (d.notes || '').trim(),
          milk: d.milk || 'none',
          shots: +d.shots || 2,
          flavor: d.flavor || 'none',
          how: d.how || 'shop',
          strength: d.strength || 'right',
          sweet: d.sweet || 'right'
        };
      };

      var saveCafeAndNavigate = function (dest) {
        var entry = buildCafeEntryPayload();
        if (!ui.lastSavedCafeDrink && storage && typeof storage.shopAddDrink === 'function') {
          try { storage.shopAddDrink(entry); } catch (_) {}
        }
        var cRx = solveCloneCafeDrinkSafe(entry);
        var aNow = S.getApp();
        aNow.brewStep = 'door';
        aNow.justSavedTasting = {
          coffeeName: findDrinkMeta(entry.kind).label + ' @ ' + entry.shop,
          roaster: entry.shop,
          stars: +(entry.beans || 4.5),
          rxHeadline: 'Logged to Coffee Street \u00B7 Home Clone: ' + cRx.brewerLabel + ' (' + cRx.doseG + ' g : ' + cRx.waterG + ' g)',
          goldLocked: false,
          isCafe: true,
          at: Date.now()
        };
        ui.lastSavedCafeDrink = null;
        clearShopDraftSafe();
        S.haptic('celebrate');
        if (dest === 'door') {
          S.saveDraftSafe();
          S.navGo('door');
          S.toastSafe('Saved cafe visit to ' + entry.shop + ' \u2014 back on Home!');
        } else {
          if (aNow.tabSegments) aNow.tabSegments.palate = 'dna';
          S.saveDraftSafe();
          S.navGo('palate');
          S.toastSafe('Saved cafe visit to ' + entry.shop + ' & updated Preferences!');
        }
      };

      stepCard.appendChild(S.h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap' },
        S.h('button', {
          type: 'button',
          class: 'bt-tc-back-pill',
          style: 'min-height:54px',
          onclick: function () { d.step = 'sdrink'; persistShopDraftSafe(d); repaint(); }
        }, S.h('span', { text: '\u2190 Back' })),
        S.h('button', {
          type: 'button',
          class: 'bt-tc-primary-btn',
          style: 'flex:1 1 200px;width:auto',
          onclick: function () {
            var entry = buildCafeEntryPayload();
            if (!ui.lastSavedCafeDrink && storage && typeof storage.shopAddDrink === 'function') {
              try { storage.shopAddDrink(entry); } catch (_) {}
            }
            ui.lastSavedCafeDrink = entry;
            d.step = 'sperfect';
            persistShopDraftSafe(d);
            S.haptic('celebrate');
            S.toastSafe('Saved cafe visit to ' + entry.shop + '!');
            repaint();
          }
        }, S.h('span', { text: 'Save Visit & View Home Clone \u2192' }), S.iconEl('check-seal', { size: 18 }))
      ));

      stepCard.appendChild(S.h('div', { class: 'bt-tc-pill-wrap' },
        S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-compact is-copper',
          text: 'Save \u2192 My Preferences',
          onclick: function () { saveCafeAndNavigate('palate'); }
        }),
        S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-compact is-soft',
          text: 'Save \u2192 Home',
          onclick: function () { saveCafeAndNavigate('door'); }
        })
      ));
    } else {
      var targetDrink = ui.lastSavedCafeDrink || {
        date: d.date || S.isoDaysAgo(0),
        shop: d.name || 'Specialty Cafe',
        city: d.city || '',
        region: d.region || '',
        country: d.country || 'United States',
        kind: d.kind || 'cortado',
        name: d.menu || '',
        temp: d.temp || 'hot',
        size: d.size || 'medium',
        milk: d.milk || 'none',
        shots: +d.shots || 2,
        price: +d.price || 5.75,
        sym: d.sym || '$',
        face: d.face || 'good',
        beans: +d.beans || 4.5,
        again: d.again || 'yes',
        worth: d.worth || 'worth',
        notes: d.notes || '',
        strength: d.strength || 'right',
        sweet: d.sweet || 'right'
      };
      var cloneRx = solveCloneCafeDrinkSafe(targetDrink);
      var confirmCloneArmed = ui.confirmCloneUntil > Date.now();

      var finishStep4CafeTo = function (dest) {
        if (!ui.lastSavedCafeDrink && storage && typeof storage.shopAddDrink === 'function') {
          try { storage.shopAddDrink(targetDrink); } catch (_) {}
        }
        var aNow = S.getApp();
        aNow.brewStep = 'door';
        aNow.justSavedTasting = {
          coffeeName: findDrinkMeta(targetDrink.kind).label + ' @ ' + (targetDrink.shop || 'Specialty Cafe'),
          roaster: targetDrink.shop || 'Specialty Cafe',
          stars: +(targetDrink.beans || 4.5),
          rxHeadline: 'Logged to Coffee Street \u00B7 Home Clone: ' + cloneRx.brewerLabel + ' (' + cloneRx.doseG + ' g : ' + cloneRx.waterG + ' g)',
          goldLocked: false,
          isCafe: true,
          at: Date.now()
        };
        ui.lastSavedCafeDrink = null;
        clearShopDraftSafe();
        S.haptic('celebrate');
        if (dest === 'door') {
          S.saveDraftSafe();
          S.navGo('door');
          S.toastSafe('Cafe tasting saved \u2014 back on Home!');
        } else {
          if (aNow.tabSegments) aNow.tabSegments.palate = 'dna';
          S.saveDraftSafe();
          S.navGo('palate');
          S.toastSafe('Cafe tasting saved & Preferences updated!');
        }
      };

      stepCard.appendChild(S.h('div', { class: 'bt-tc-row-between' },
        S.h('span', { class: 'bt-tc-badge is-good', text: 'Step 4 of 4 \u00B7 Shop vs. Home Verdict' }),
        S.h('div', { class: 'bt-tc-pill-wrap' },
          S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-compact is-soft',
            text: '\u2190 Edit Taste',
            onclick: function () { d.step = 'staste'; persistShopDraftSafe(d); repaint(); }
          }),
          S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-compact is-soft',
            text: '+ Log Another Drink',
            onclick: function () {
              ui.lastSavedCafeDrink = null;
              clearShopDraftSafe();
              repaint();
            }
          })
        )
      ));

      /* Primary Post-Save Navigation Bar on Cafe Step 4: Save -> My Preferences | Save -> Home */
      stepCard.appendChild(S.h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap;align-items:center' },
        S.h('button', {
          type: 'button',
          id: 'bt-cafe-save-prefs-btn',
          class: 'bt-tc-primary-btn',
          style: 'flex:1 1 180px;width:auto',
          onclick: function () { finishStep4CafeTo('palate'); }
        },
          S.h('span', { style: 'text-align:left;min-width:0;overflow:hidden' },
            S.h('span', { style: 'display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap', text: 'Save \u2192 My Preferences' }),
            S.h('span', { class: 'bt-tc-primary-sub', text: 'Logs cafe cup & opens your Taste Preferences' })
          ),
          S.iconEl('check-seal', { size: 18 })
        ),
        S.h('button', {
          type: 'button',
          id: 'bt-cafe-save-home-btn',
          class: 'bt-tc-pill is-soft bt-tc-save-home-btn',
          text: 'Save \u2192 Home',
          onclick: function () { finishStep4CafeTo('door'); }
        })
      ));

      stepCard.appendChild(S.h('div', { class: 'bt-tc-well' },
        S.h('b', { text: 'Shop vs. Home Cost Comparison' }),
        S.h('div', { class: 'mono', style: 'font-size:0.84rem;color:var(--ink-secondary)', text: 'Cafe Cup: ' + (targetDrink.sym || '$') + (+targetDrink.price || 5.75).toFixed(2) + ' vs. Home Clone: $' + cloneRx.homeCost.toFixed(2) + ' \u2192 Saves $' + cloneRx.savingsPerCup.toFixed(2) + '/cup (pays off a $21 bag in ' + Math.max(2, Math.ceil(21 / Math.max(1, cloneRx.savingsPerCup))) + ' mornings!)' })
      ));

      stepCard.appendChild(S.h('div', { class: 'bt-clone-home-card' },
        S.h('div', { class: 'bt-tc-kicker', text: 'Reverse-Engineered for Your Home Gear' }),
        S.h('b', { style: 'font-size:1rem;color:var(--primary)', text: cloneRx.brewerLabel + ' \u00B7 ' + cloneRx.doseG + ' g : ' + cloneRx.waterG + ' g (' + cloneRx.tempC + ' \u00B0C)' }),
        S.h('div', { style: 'font-size:0.85rem;color:var(--ink)', text: cloneRx.stepsLine }),
        cloneRx.upgradeNote ? S.h('div', { class: 'bt-tc-badge is-good', style: 'align-self:flex-start;white-space:normal', text: cloneRx.upgradeNote }) : null,
        S.h('button', {
          type: 'button',
          class: 'bt-tc-primary-btn',
          onclick: function () {
            if (hasActiveHomeDraft() && !confirmCloneArmed) {
              ui.confirmCloneUntil = Date.now() + 6500;
              S.toastSafe('Active home brew in progress \u2014 tap Confirm Clone again to load into Step 3 Recipe');
              repaint();
              return;
            }
            ui.confirmCloneUntil = 0;
            if (!ui.lastSavedCafeDrink && storage && typeof storage.shopAddDrink === 'function') {
              try { storage.shopAddDrink(targetDrink); } catch (_) {}
            }
            ui.lastSavedCafeDrink = null;
            clearShopDraftSafe();
            var a = S.getApp();
            a.brew = a.brew || {};
            a.brew.method = cloneRx.methodKey;
            a.brew.dose = cloneRx.doseG;
            a.brew.water = cloneRx.waterG;
            a.brew.ratio = cloneRx.ratio;
            a.brew.tempC = cloneRx.tempC;
            a.brew.tempF = Math.round(cloneRx.tempC * 9 / 5 + 32);
            a.brew.grindUm = cloneRx.grindUm;
            a.brew.grind_um = cloneRx.grindUm;
            if (cloneRx.grindDisplay) a.brew.grind_setting = cloneRx.grindDisplay;
            S.toastSafe('Loaded Cafe Clone Recipe into Step 3!');
            navigateToHomeRecipe();
          }
        },
          S.h('span', { text: confirmCloneArmed ? 'Confirm Replace Home Draft & Clone \u2192' : 'Clone This Cafe Drink at Home \u2192' }),
          S.iconEl('brew-twin', { size: 18 })
        )
      ));
    }

    wrap.appendChild(stepCard);

    /* Personal Coffee Shop Log & Past Visits (Zero Jargon Leaks!) */
    var realDrinks = (store && Array.isArray(store.drinks)) ? store.drinks : [];
    var realShops = (typeof shopList === 'function') ? shopList(store) : [];

    var boardCard = S.h('section', { class: 'bt-tc-card' },
      S.h('div', { class: 'bt-tc-row-between' },
        S.h('div', null,
          S.h('div', { class: 'bt-tc-kicker', text: 'Personal Coffee Shop Log' }),
          S.h('b', { style: 'font-size:0.98rem', text: 'Cafe Leaderboard & Past Visits' })
        ),
        S.h('div', { class: 'bt-tc-pill-wrap' },
          [['drinks', 'Drinks (' + realDrinks.length + ')'], ['shops', 'Shops (' + realShops.length + ')'], ['favorites', 'Favorites']].map(function (tb) {
            return S.h('button', {
              type: 'button',
              class: 'bt-tc-pill is-compact' + (ui.cafeBoardTab === tb[0] ? ' is-active' : ' is-soft'),
              text: tb[1],
              onclick: function () { ui.cafeBoardTab = tb[0]; repaint(); }
            });
          })
        )
      )
    );

    if (!realDrinks.length) {
      boardCard.appendChild(S.h('div', { class: 'bt-tc-well', style: 'text-align:center;padding:16px' },
        S.h('b', { text: 'No cafe visits logged yet.' }),
        S.h('p', { class: 'bt-tc-sub', text: 'Log your first cafe espresso, cortado, or pour-over above to build your personal Cafe Leaderboard & Home Clone recipes!' })
      ));
    } else if (ui.cafeBoardTab === 'shops') {
      realShops.forEach(function (sh) {
        boardCard.appendChild(S.h('div', { class: 'bt-tc-well' },
          S.h('div', { class: 'bt-tc-row-between' },
            S.h('div', null,
              S.h('b', { text: sh.name }),
              S.h('div', { class: 'bt-tc-sub', style: 'font-size:0.78rem', text: [sh.city, sh.region, sh.country].filter(Boolean).join(', ') })
            ),
            S.h('span', { class: 'bt-tc-badge is-gold mono', text: sh.visits + ' visit' + (sh.visits === 1 ? '' : 's') + (sh.avgBeans ? ' \u00B7 ' + sh.avgBeans + '/5' : '') })
          )
        ));
      });
    } else {
      var listToShow = realDrinks.slice().reverse().filter(function (dr) {
        return ui.cafeBoardTab !== 'favorites' || !!dr.fav;
      });
      if (!listToShow.length) {
        boardCard.appendChild(S.h('div', { class: 'bt-tc-sub', text: 'No favorites starred yet \u2014 tap Favorite on any logged drink below.' }));
      }
      listToShow.slice(0, 30).forEach(function (dr) {
        var meta = findDrinkMeta(dr.kind);
        var dKey = typeof drinkKey === 'function' ? drinkKey(dr) : (dr.date + '|' + dr.shop + '|' + dr.kind);
        boardCard.appendChild(S.h('div', { class: 'bt-tc-well' },
          S.h('div', { class: 'bt-tc-row-between' },
            S.h('div', null,
              S.h('div', { class: 'bt-tc-kicker', text: [dr.shop, dr.city, dr.date].filter(Boolean).join(' \u00B7 ') }),
              S.h('b', { style: 'font-size:0.94rem', text: meta.label + ' (' + (dr.temp || 'hot') + ')' + (dr.name ? ' \u2014 ' + dr.name : '') }),
              S.h('div', { class: 'mono', style: 'font-size:0.78rem;color:var(--ink-secondary)', text: (dr.sym || '$') + (+dr.price || 0).toFixed(2) + (dr.beans ? ' \u00B7 ' + dr.beans + '/5 beans' : '') })
            ),
            S.h('div', { class: 'bt-tc-pill-wrap' },
              S.h('button', {
                type: 'button',
                class: 'bt-tc-pill is-compact' + (dr.fav ? ' is-copper' : ' is-soft'),
                text: dr.fav ? 'Favorited' : 'Favorite',
                onclick: function () {
                  if (typeof shopSetFavorite === 'function' && storage && typeof storage.saveShops === 'function') {
                    storage.saveShops(shopSetFavorite(store, dKey, !dr.fav));
                    repaint();
                  }
                }
              }),
              S.h('button', {
                type: 'button',
                class: 'bt-tc-pill is-compact is-active',
                text: 'Clone at Home \u2192',
                onclick: function () {
                  ui.lastSavedCafeDrink = dr;
                  d.step = 'sperfect';
                  persistShopDraftSafe(d);
                  repaint();
                }
              })
            )
          )
        ));
      });
    }

    wrap.appendChild(boardCard);
    return wrap;
  }

  /* ========================================================================
     SEGMENT 4: `Bag Prices & Value Tracker`
     ======================================================================== */
  function buildBagPricesSegment(repaint) {
    var a = S.getApp();
    var list = S.getNormalizedPrices();
    var hObjs = S.getHistoryObjs();
    var storage = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : null;
    var unified = (storage && typeof storage.buildUnifiedCoffeesIndex === 'function')
      ? storage.buildUnifiedCoffeesIndex(hObjs, list)
      : [];
    var vaultList = getCoffeesVaultSafe();
    var pd = ui.priceDraft;
    if (!pd.date) pd.date = S.isoDaysAgo(0);
    if (!pd.roast) pd.roast = S.isoDaysAgo(4);

    var resetPriceDraft = function () {
      ui.priceEditIdx = -1;
      pd.coffee = '';
      pd.roaster = '';
      pd.size = 250;
      pd.unit = 'g';
      pd.price = 21.00;
      pd.currency = '$';
      pd.rlevel = 'light';
      pd.date = S.isoDaysAgo(0);
      pd.roast = S.isoDaysAgo(4);
      pd.notes = '';
      pd.bag_notes = '';
      pd.origin = '';
      pd.process = '';
      pd.varietal = '';
      pd.elevation_m = '';
    };

    var wrap = S.h('div', { style: 'display:flex;flex-direction:column;gap:14px' });

    wrap.appendChild(S.h('div', { class: 'bt-tc-row-between' },
      S.h('div', null,
        S.h('div', { class: 'bt-tc-kicker', text: 'Coffee Bag Price & Value Tracker' }),
        S.h('b', { style: 'font-size:1.02rem', text: 'Bag Prices, $/100g & 12-oz Value Comparison' })
      ),
      S.h('div', { class: 'bt-tc-pill-wrap' },
        S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-compact is-copper',
          text: ui.priceAddOpen ? 'Close Form' : '+ Log Bag Purchase',
          onclick: function () {
            if (ui.priceAddOpen) { ui.priceAddOpen = false; resetPriceDraft(); }
            else { resetPriceDraft(); ui.priceAddOpen = true; }
            repaint();
          }
        }),
        list.length ? S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-compact is-soft',
          text: 'Export CSV',
          onclick: function () {
            if (storage && typeof storage.exportPricesCsv === 'function') storage.exportPricesCsv();
          }
        }) : null
      )
    ));

    if (ui.priceAddOpen) {
      var isEditingPrice = ui.priceEditIdx >= 0 && !!list[ui.priceEditIdx];
      wrap.appendChild(S.h('section', { class: 'bt-tc-card' },
        S.h('div', { class: 'bt-tc-kicker', text: isEditingPrice ? 'Edit Saved Bag & Price Entry' : 'Add Bag to Shelf & Price Tracker' }),
        S.h('div', { style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px' },
          S.h('div', { class: 'bt-tc-spotlight' },
            S.h('input', {
              type: 'text',
              placeholder: 'Coffee Name',
              value: pd.coffee,
              'aria-label': 'Bag coffee name',
              oninput: function (e) { pd.coffee = e.target.value; }
            })
          ),
          S.h('div', { class: 'bt-tc-spotlight' },
            S.h('input', {
              type: 'text',
              placeholder: 'Roaster',
              value: pd.roaster,
              'aria-label': 'Bag roaster',
              oninput: function (e) { pd.roaster = e.target.value; }
            })
          )
        ),
        S.h('div', { style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px' },
          S.h('div', { class: 'bt-tc-spotlight' },
            S.h('input', {
              type: 'text',
              placeholder: 'Bag Flavors (e.g. Jasmine, Peach, Bergamot)',
              value: pd.bag_notes || '',
              'aria-label': 'Bag tasting notes',
              oninput: function (e) { pd.bag_notes = e.target.value; }
            })
          ),
          S.h('div', { class: 'bt-tc-spotlight' },
            S.h('input', {
              type: 'text',
              placeholder: 'Origin & Process (e.g. Ethiopia, Washed)',
              value: [pd.origin || '', pd.process || ''].filter(Boolean).join(', '),
              'aria-label': 'Bag origin and process',
              oninput: function (e) {
                var parts = String(e.target.value || '').split(',');
                pd.origin = (parts[0] || '').trim();
                pd.process = parts.slice(1).join(',').trim();
              }
            })
          )
        ),
        S.h('div', { class: 'bt-tc-pill-scroll' },
          [200, 250, 300, 340, 454, 907].map(function (wg) {
            return S.h('button', {
              type: 'button',
              class: 'bt-tc-pill is-compact' + (+pd.size === wg && pd.unit === 'g' ? ' is-active' : ' is-soft'),
              text: wg + ' g' + (wg === 340 ? ' (12 oz)' : wg === 907 ? ' (2 lb)' : ''),
              onclick: function () { pd.size = wg; pd.unit = 'g'; repaint(); }
            });
          })
        ),
        S.h('div', { style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px' },
          S.h('label', { style: 'font-size:0.75rem;font-weight:700;display:flex;flex-direction:column;gap:4px' },
            S.h('span', { text: 'Bag Price' }),
            S.h('div', { class: 'bt-tc-spotlight', style: 'min-height:44px' },
              S.h('select', {
                style: 'max-width:54px;font-weight:700',
                'aria-label': 'Bag currency',
                onchange: function (e) { pd.currency = e.target.value; }
              },
                ['$', '\u20AC', '\u00A3', 'CA$', 'A$'].map(function (sy) {
                  return S.h('option', { value: sy, selected: pd.currency === sy, text: sy });
                })
              ),
              S.h('input', {
                type: 'number',
                inputmode: 'decimal',
                step: '0.50',
                value: String(pd.price),
                'aria-label': 'Bag price',
                onchange: function (e) { pd.price = +e.target.value || 20; }
              })
            )
          ),
          S.h('label', { style: 'font-size:0.75rem;font-weight:700;display:flex;flex-direction:column;gap:4px' },
            S.h('span', { text: 'Weight (g)' }),
            S.h('div', { class: 'bt-tc-spotlight', style: 'min-height:44px' },
              S.h('input', {
                type: 'number',
                inputmode: 'decimal',
                value: String(pd.size),
                'aria-label': 'Bag weight grams',
                onchange: function (e) { pd.size = +e.target.value || 250; }
              })
            )
          ),
          S.h('label', { style: 'font-size:0.75rem;font-weight:700;display:flex;flex-direction:column;gap:4px' },
            S.h('span', { text: 'Roast Date' }),
            S.h('div', { class: 'bt-tc-spotlight', style: 'min-height:44px' },
              S.h('input', {
                type: 'date',
                max: S.isoDaysAgo(0),
                value: pd.roast,
                'aria-label': 'Bag roast date',
                onchange: function (e) { pd.roast = e.target.value; }
              })
            )
          )
        ),
        S.h('div', { class: 'bt-tc-pill-scroll' },
          S.ROAST_STOPS.map(function (rs) {
            return S.h('button', {
              type: 'button',
              class: 'bt-tc-pill is-compact' + (pd.rlevel === rs.key ? ' is-copper' : ' is-soft'),
              text: rs.label,
              onclick: function () { pd.rlevel = rs.key; repaint(); }
            });
          })
        ),
        S.h('div', { class: 'bt-tc-spotlight' },
          S.h('input', {
            type: 'text',
            placeholder: 'Optional purchase notes (store, sale, varietal)...',
            value: pd.notes,
            'aria-label': 'Purchase notes',
            oninput: function (e) { pd.notes = e.target.value; }
          })
        ),
        S.h('button', {
          type: 'button',
          class: 'bt-tc-primary-btn',
          onclick: function () {
            var cTrim = pd.coffee.trim();
            if (!cTrim) {
              S.toastSafe('Enter a coffee name first');
              return;
            }
            var prevBag = isEditingPrice ? list[ui.priceEditIdx] : null;
            var bagNotesTrim = String(pd.bag_notes || '').trim();
            var canonicalEntry = S.normalizePriceBag({
              id: (prevBag && prevBag.id) || ('bag_' + Date.now()),
              coffee_id: (prevBag && prevBag.coffee_id) || '',
              coffee: cTrim,
              roaster: pd.roaster.trim(),
              size: +pd.size || 250,
              unit: (prevBag && prevBag.unit) || 'g',
              price: +pd.price || 20,
              currency: pd.currency || '$',
              sym: pd.currency || '$',
              rlevel: pd.rlevel || 'light',
              date: pd.date || S.isoDaysAgo(0),
              roast: pd.roast || '',
              rem_g: prevBag ? prevBag.rem_g : (+pd.size || 250),
              finished: prevBag ? prevBag.finished : '',
              is_frozen: prevBag ? prevBag.is_frozen : '',
              frozen_date: prevBag ? prevBag.frozen_date : '',
              notes: pd.notes.trim() || bagNotesTrim,
              bag_notes: bagNotesTrim,
              origin: String(pd.origin || '').trim(),
              process: String(pd.process || '').trim(),
              varietal: String(pd.varietal || '').trim(),
              elevation_m: String(pd.elevation_m || '').trim()
            });
            var next = list.slice();
            if (isEditingPrice) next[ui.priceEditIdx] = canonicalEntry;
            else next = [canonicalEntry].concat(list);
            S.saveNormalizedPrices(next);
            upsertVaultSafe({
              id: canonicalEntry.coffee_id || (!isSyntheticCoffeeId(canonicalEntry.id) ? canonicalEntry.id : ''),
              name: canonicalEntry.coffee,
              roaster: canonicalEntry.roaster,
              roast: canonicalEntry.rlevel || 'light',
              roast_date: canonicalEntry.roast || '',
              bag_weight_g: canonicalEntry.size,
              remaining_g: canonicalEntry.rem_g,
              price: canonicalEntry.price,
              currency: canonicalEntry.currency || canonicalEntry.sym || '$',
              bag_notes: canonicalEntry.bag_notes || canonicalEntry.notes || '',
              notes: canonicalEntry.bag_notes || canonicalEntry.notes || '',
              origin: canonicalEntry.origin || '',
              process: canonicalEntry.process || '',
              varietal: canonicalEntry.varietal || '',
              elevation_m: canonicalEntry.elevation_m || ''
            });
            resetPriceDraft();
            ui.priceAddOpen = false;
            S.haptic('celebrate');
            S.toastSafe((isEditingPrice ? 'Updated ' : 'Saved ') + canonicalEntry.coffee + ' to Shelf & Price Tracker!');
            repaint();
          }
        }, S.h('span', { text: isEditingPrice ? 'Update Bag in Shelf & Tracker \u2192' : 'Save Bag to Shelf & Tracker \u2192' }), S.iconEl('check-seal', { size: 18 }))
      ));
    }

    wrap.appendChild(S.h('div', { class: 'bt-tc-pill-scroll' },
      [['open', 'Open Bags'], ['finished', 'Finished'], ['all', 'All Purchases']].map(function (sh) {
        return S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-compact' + (ui.priceShow === sh[0] ? ' is-active' : ' is-soft'),
          text: sh[1],
          onclick: function () { ui.priceShow = sh[0]; repaint(); }
        });
      }),
      [['use_first', 'Sort: Use First'], ['newest', 'Newest'], ['cheap', 'Best $/100g'], ['name', 'Name']].map(function (so) {
        return S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-compact' + (ui.priceSort === so[0] ? ' is-copper' : ' is-soft'),
          text: so[1],
          onclick: function () { ui.priceSort = so[0]; repaint(); }
        });
      })
    ));

    var rows = list.map(function (b, idx) {
      var matchedP = findCoffeeRecordsMatch(b.coffee_id || b.id, b.coffee, b.roaster, {
        unified: unified,
        prices: list,
        vaultList: vaultList
      });
      return { b: b, idx: idx, uRec: matchedP.uRec, vRec: matchedP.vaultRec, ev: evaluateShelfBag(b, matchedP.uRec || matchedP.vaultRec) };
    }).filter(function (it) {
      if (ui.priceShow === 'open' && it.b.finished) return false;
      if (ui.priceShow === 'finished' && !it.b.finished) return false;
      return true;
    });

    rows.sort(function (x, y) {
      if (ui.priceSort === 'use_first') return (y.ev.effAge || 0) - (x.ev.effAge || 0);
      if (ui.priceSort === 'cheap') return x.ev.per100g - y.ev.per100g;
      if (ui.priceSort === 'name') return x.b.coffee.localeCompare(y.b.coffee);
      return String(y.b.date || '').localeCompare(String(x.b.date || ''));
    });

    if (!rows.length) {
      wrap.appendChild(S.h('section', { class: 'bt-tc-card', style: 'text-align:center;padding:20px' },
        S.h('b', { text: 'No bags in this view yet.' }),
        S.h('p', { class: 'bt-tc-sub', text: 'Tap "+ Log Bag Purchase" above (or paste an AI bag scan on Step 1) to track $/cup & 12-oz value.' })
      ));
      return wrap;
    }

    rows.forEach(function (it) {
      var b = it.b;
      var uRec = it.uRec;
      var vRec = it.vRec;
      var ev = it.ev;
      var eq12oz = (ev.per100g * 3.40).toFixed(2);
      var chg = (typeof priceChange === 'function') ? priceChange(list, b) : { ok: false };
      var sym = b.sym || (b.currency === 'EUR' ? '\u20AC' : b.currency === 'GBP' ? '\u00A3' : b.currency === 'CAD' ? 'CA$' : b.currency === 'AUD' ? 'A$' : '$');
      var pBagNotes = pickRichStr(vRec && vRec.bag_notes, vRec && vRec.notes, uRec && uRec.bag_notes, b.bag_notes, b.notes);
      var pOrigin = pickRichStr(vRec && vRec.origin, uRec && uRec.origin, b.origin);
      var pProc = pickRichStr(vRec && vRec.process, uRec && uRec.process, b.process);
      var pMeta = [pOrigin, pProc].filter(Boolean).join(' \u00B7 ');

      wrap.appendChild(S.h('article', {
        class: 'bt-cellar-bag-card',
        style: '--bag-roast-color:' + S.roastColorFor(b.rlevel)
      },
        S.h('div', { class: 'bt-tc-row-between' },
          S.h('div', null,
            S.h('div', { class: 'bt-tc-kicker', text: [b.roaster || 'Roaster', b.date, b.rlevel, pMeta].filter(Boolean).join(' \u00B7 ') }),
            S.h('b', { style: 'font-size:1rem;font-family:var(--font-display)', text: b.coffee }),
            S.h('div', { class: 'mono', style: 'font-size:0.79rem;color:var(--ink-secondary)', text: sym + b.price.toFixed(2) + ' / ' + b.size + b.unit + ' \u00B7 ' + sym + ev.perCup.toFixed(2) + '/15g cup \u00B7 ' + sym + eq12oz + ' per 12oz eq.' }),
            pBagNotes ? S.h('div', { style: 'font-size:0.78rem;color:var(--ink-secondary);margin-top:2px', text: 'Notes: ' + pBagNotes }) : null
          ),
          chg && chg.ok && chg.dir !== 'same' ? S.h('span', {
            class: 'bt-tc-badge ' + (chg.dir === 'up' ? 'is-warn' : 'is-good'),
            text: (chg.pct > 0 ? '+' : '') + chg.pct + '% vs last'
          }) : null
        ),
        S.h('div', { class: 'bt-tc-pill-scroll' },
          S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-compact is-active',
            text: 'Brew \u2192',
            onclick: function () {
              hydrateBrewFromRowOrBag(null, uRec, b);
              navigateToHomeRecipe();
            }
          }),
          S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-compact is-copper',
            text: 'Edit in Step 1 \u2192',
            onclick: function () {
              hydrateBrewFromRowOrBag(null, uRec, b);
              if (a && a.tabSegments) a.tabSegments.cellar = ui.seg;
              S.saveDraftSafe();
              S.navGo('coffee');
            }
          }),
          S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-compact is-soft',
            text: 'Edit Bag',
            onclick: function () {
              ui.priceEditIdx = it.idx;
              ui.priceAddOpen = true;
              pd.coffee = b.coffee || '';
              pd.roaster = b.roaster || '';
              pd.size = +b.size || 250;
              pd.unit = b.unit || 'g';
              pd.price = +b.price || 20;
              pd.currency = sym;
              pd.rlevel = b.rlevel || 'light';
              pd.date = b.date || S.isoDaysAgo(0);
              pd.roast = b.roast || S.isoDaysAgo(4);
              pd.notes = b.notes || '';
              pd.bag_notes = pBagNotes || '';
              pd.origin = pOrigin || '';
              pd.process = pProc || '';
              pd.varietal = pickRichStr(vRec && vRec.varietal, uRec && uRec.varietal, b.varietal);
              pd.elevation_m = pickRichStr(vRec && vRec.elevation_m, uRec && uRec.elevation_m, b.elevation_m);
              repaint();
            }
          }),
          S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-compact is-soft',
            text: b.finished ? 'Reopen Bag' : 'Mark Finished',
            onclick: function () {
              var next = S.getNormalizedPrices();
              if (next[it.idx]) {
                next[it.idx].finished = b.finished ? '' : S.isoDaysAgo(0);
                S.saveNormalizedPrices(next);
                repaint();
              }
            }
          }),
          S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-compact is-soft',
            text: 'Delete',
            onclick: function () {
              if (storage && typeof storage.deletePriceBag === 'function') {
                storage.deletePriceBag(it.idx);
                S.toastSafe('Removed bag entry', {
                  durationMs: 10000,
                  actionLabel: 'Undo',
                  onAction: function () {
                    if (typeof storage.undoPriceDelete === 'function') { storage.undoPriceDelete(); repaint(); }
                  }
                });
                repaint();
              }
            }
          })
        )
      ));
    });

    return wrap;
  }

  /* ========================================================================
     SHEETS: QR Trading-Card Passport, Tasting Detail & Edit Tasting
     Every sheet has an explicit <- Back button right at the top!
     ======================================================================== */
  S.registerSheetSafe('passport-qr', function (host, payload) {
    var art = (payload && payload.art) || buildPassportArtifacts(payload && payload.item);
    var fromDetailIdx = payload && payload.fromDetailIdx != null ? +payload.fromDetailIdx : null;
    var qrBox = S.h('div', { class: 'bt-qr-real-box' });
    var qrMarkup = art && art.qrSvg ? String(art.qrSvg) : '';
    if ((!qrMarkup || qrMarkup.indexOf('<path') < 0) && typeof window !== 'undefined' && typeof window.encodeQrSvg === 'function') {
      try {
        qrMarkup = window.encodeQrSvg((art && (art.uri || art.textCode)) || 'bt1:passport', { size: 184, margin: 3, fg: '#1A1412', bg: '#FAF6F0' });
      } catch (_) {}
    }
    qrBox.innerHTML = qrMarkup;

    var m = (art && art.meta) || {};

    return S.h('div', { class: 'bt-tc-sheet', id: 'bt-passport-qr-sheet', style: 'display:flex;flex-direction:column;gap:12px' },
      S.h('div', { class: 'bt-sheet-back-bar no-print' },
        S.h('button', {
          type: 'button',
          class: 'bt-tc-back-pill',
          onclick: function () {
            if (fromDetailIdx != null) openTastingDetailSheet(fromDetailIdx);
            else S.closeSheetSafe();
          }
        }, S.h('span', { text: fromDetailIdx != null ? '\u2190 Back to Detail' : '\u2190 Back' }))
      ),
      S.h('div', { class: 'bt-passport-preview' },
        S.h('div', { class: 'bt-tc-kicker', text: 'Offline Scannable Brew Passport' }),
        S.h('div', { style: 'display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap' },
          m.isLocked ? buildGoldSealSvg(22) : null,
          S.h('b', { style: 'font-family:var(--font-display);font-size:1.18rem', text: art.title })
        ),
        (m.roaster || m.originLine) ? S.h('div', { style: 'font-size:0.82rem;color:var(--ink-secondary);font-weight:600', text: [m.roaster, m.originLine].filter(Boolean).join(' \u00B7 ') }) : null,
        m.isBlend ? S.h('div', { style: 'display:flex;flex-direction:column;align-items:center;gap:4px' },
          S.h('span', { class: 'bt-tc-badge bt-journal-blend-badge is-copper', text: m.blendLine }),
          m.blendDetail ? S.h('div', { class: 'bt-journal-blend-split', style: 'text-align:center', text: m.blendDetail }) : null
        ) : null,
        (m.methodLabel || m.recipeLine) ? S.h('div', { class: 'bt-tc-well', style: 'width:100%;max-width:420px;align-items:center;text-align:center;gap:3px' },
          S.h('div', { class: 'mono', style: 'font-size:0.82rem;font-weight:800;color:var(--ink)', text: [m.methodLabel, m.recipeLine].filter(Boolean).join(' \u00B7 ') }),
          m.grindTempLine ? S.h('div', { class: 'mono', style: 'font-size:0.76rem;color:var(--ink-secondary)', text: m.grindTempLine }) : null,
          m.brewerMaterialLine ? S.h('div', { class: 'mono', style: 'font-size:0.74rem;color:var(--ink-secondary)', text: 'Brewer: ' + m.brewerMaterialLine }) : null,
          m.stars > 0 ? S.h('div', { class: 'mono', style: 'font-size:0.76rem;font-weight:700;color:var(--accent)', text: 'Rated ' + m.stars.toFixed(2) + ' / 5.00' + (m.isLocked ? ' \u00B7 Golden Recipe' : '') }) : null
        ) : null,
        qrBox,
        S.h('div', { class: 'mono', style: 'font-size:0.74rem;word-break:break-all;color:var(--ink-secondary)', text: art.textCode })
      ),
      S.h('div', { class: 'bt-tc-pill-wrap no-print', style: 'justify-content:center' },
        S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-active',
          text: 'Copy Share Code',
          onclick: function () {
            try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(art.textCode); } catch (_) {}
            S.toastSafe('Copied Brew Passport code to clipboard!');
          }
        }),
        art.jsonCode ? S.h('button', {
          type: 'button',
          id: 'bt-qr-passport-copy-json-btn',
          class: 'bt-tc-pill is-soft',
          text: m.isBlend ? 'Copy Blend JSON' : 'Copy JSON Card',
          onclick: function () {
            try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(art.jsonCode); } catch (_) {}
            S.toastSafe(m.isBlend ? 'Copied 2-Coffee Blend JSON recipe!' : 'Copied JSON recipe card!');
          }
        }) : null,
        S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-copper',
          text: 'Download 4:5 Trading Card (.svg)',
          onclick: function () {
            try {
              var blob = new Blob([art.tradingCardSvg], { type: 'image/svg+xml;charset=utf-8' });
              var url = URL.createObjectURL(blob);
              var link = document.createElement('a');
              link.href = url;
              link.download = (art.title.replace(/[^a-z0-9]+/gi, '_') || 'Brew_Passport') + '_Card.svg';
              document.body.appendChild(link);
              link.click();
              setTimeout(function () { link.remove(); URL.revokeObjectURL(url); }, 1000);
            } catch (_) {}
          }
        }),
        S.h('button', {
          type: 'button',
          id: 'bt-qr-passport-print-btn',
          class: 'bt-tc-pill is-soft',
          onclick: function () {
            try { if (typeof window !== 'undefined' && typeof window.print === 'function') window.print(); } catch (_) {}
          }
        }, S.iconEl('share-card', { size: 15 }), S.h('span', { text: 'Print / Save PDF' }))
      )
    );
  });

  /* Tasting Detail Sheet (w/ explicit <- Back to Journal!) */
  S.registerSheetSafe('screen-detail', function (host, payload) {
    var hObjs = S.getHistoryObjs();
    var rIdx = payload && payload.rowIdx != null ? +payload.rowIdx : 0;
    var r = (payload && payload.row) || hObjs[rIdx] || {};
    var storage = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : null;
    var un = function (v) { return typeof unneutralize === 'function' ? unneutralize(v || '') : String(v || ''); };
    var isLocked = r.dial_locked === 'yes' || r.dial_locked === '1';
    var timeSecs = +(r.brew_actual_time_s || r.brew_time_s) || 0;
    var detailChron = getCoffeeHistoryChronological(r.coffee_name, r.roaster, r.coffee_id, hObjs);
    var detailTimeline = buildDialInConvergenceTimeline(detailChron, r, { compact: false });
    var blendInfo = extractRowBlendInfo(r);
    var v74Meta = extractRowV74Meta(r);

    var kvPairs = [
      ['Date', r.cupping_date],
      ['Roaster', un(r.roaster)],
      ['Origin', un(r.origin)],
      ['Process', un(r.process)],
      ['Roast', un(r.roast_level)],
      ['Varietal', un(r.varietal)],
      blendInfo.isBlend ? ['Blend Split', blendInfo.detailLine] : null,
      ['Brewer', S.humanMethodName(un(r.brew_method))],
      v74Meta.brewerMaterialLabel ? ['Brewer Material', v74Meta.brewerMaterialLabel] : null,
      ['Try #', r.brew_attempt],
      ['Dose : Water', (r.brew_dose_g || '\u2014') + ' g : ' + (r.brew_water_g || '\u2014') + ' g'],
      ['Ratio', r.brew_ratio ? ('1:' + r.brew_ratio) : ''],
      ['Grind', [un(r.brew_grind_setting), r.brew_grind_target_um ? (r.brew_grind_target_um + ' \u00B5m') : ''].filter(Boolean).join(' \u00B7 ')],
      ['Temp', r.brew_temp_c ? (r.brew_temp_c + ' \u00B0C') : (r.brew_temp_f ? (r.brew_temp_f + ' \u00B0F') : '')],
      v74Meta.tempProfileLabel ? ['Temp Profile', v74Meta.tempProfileLabel] : null,
      ['Brew Time', timeSecs > 0 ? (S.fmtMmSs(timeSecs) + ' (' + timeSecs + 's)') : ''],
      ['Beverage Yield', r.brew_out_g ? (r.brew_out_g + ' g') : ''],
      ['Strength (%TDS) / Extraction (%EY)', r.brew_tds_pct ? (r.brew_tds_pct + '% / ' + (r.brew_ey_pct || '\u2014') + '%') : ''],
      v74Meta.palateTargetsLabel ? ['Palate Targets', v74Meta.palateTargetsLabel] : null,
      ['Cupping Score', r.total_score ? (r.total_score + ' / 100') : ''],
      ['Flavors Liked', un(r.flavors_liked)],
      ['Bag Notes', un(r.bag_notes)]
    ].filter(function (p) { return !!(p && p[1]); });

    var intelPills = [];
    if (v74Meta.brewerMaterialLabel) intelPills.push('Brewer: ' + v74Meta.brewerMaterialLabel);
    if (v74Meta.tempProfileLabel) intelPills.push('Temp: ' + v74Meta.tempProfileLabel);
    if (v74Meta.palateTargetsLabel) intelPills.push('Palate: ' + v74Meta.palateTargetsLabel);
    v74Meta.appliedRecipeTags.forEach(function (tg) {
      if (intelPills.indexOf(tg) < 0) intelPills.push(tg);
    });

    return S.h('div', { class: 'bt-tc-sheet', id: 'bt-screen-detail', style: 'display:flex;flex-direction:column;gap:12px' },
      S.h('div', { class: 'bt-sheet-back-bar no-print' },
        S.h('button', {
          type: 'button',
          class: 'bt-tc-back-pill',
          onclick: function () { S.closeSheetSafe(); }
        }, S.h('span', { text: '\u2190 Back to Journal' })),
        S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-compact is-soft',
          text: 'Edit Tasting',
          onclick: function () { openTastingEditSheet(rIdx, 'tasting', { fromDetail: true }); }
        })
      ),
      S.h('div', { class: 'bt-tc-row-between' },
        S.h('div', { style: 'display:flex;align-items:center;gap:8px;min-width:0;flex:1' },
          isLocked ? buildGoldSealSvg(28) : null,
          S.h('div', { style: 'min-width:0' },
            S.h('div', { class: 'bt-tc-kicker', text: un(r.roaster) || 'Tasting Passport' }),
            S.h('h3', { style: 'margin:0;font-family:var(--font-display)', text: un(r.coffee_name) || 'Logged Cup' })
          )
        ),
        S.h('span', { class: 'bt-tc-badge is-good mono', text: r.my_rating_stars ? (r.my_rating_stars + ' / 5.00') : (r.total_score ? r.total_score + ' / 100' : 'Logged') })
      ),
      blendInfo.isBlend ? S.h('section', { class: 'bt-tc-well', id: 'bt-detail-blend-breakdown', style: 'gap:6px' },
        S.h('div', { class: 'bt-tc-row-between' },
          S.h('span', { class: 'bt-tc-kicker', text: '2-Coffee Blend Breakdown' }),
          S.h('span', { class: 'bt-tc-badge bt-journal-blend-badge is-copper', text: blendInfo.pillText })
        ),
        S.h('div', { style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:8px' },
          blendInfo.components.map(function (comp, cIdx) {
            var cMeta = [comp.roaster, comp.origin, comp.process, comp.roast, comp.decaf === 'yes' ? 'Decaf' : ''].filter(Boolean).join(' \u00B7 ');
            var cWeight = [comp.weightG > 0 ? fmtBlendGrams(comp.weightG) : '', comp.ratioPct + '%'].filter(Boolean).join(' \u00B7 ');
            return S.h('div', { class: 'bt-journal-blend-split', style: 'display:flex;flex-direction:column;gap:2px' },
              S.h('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:6px' },
                S.h('span', { class: 'bt-tc-kicker', text: 'Coffee ' + (cIdx === 0 ? 'A' : 'B') }),
                S.h('strong', { class: 'mono', style: 'font-size:0.78rem', text: cWeight })
              ),
              S.h('b', { style: 'font-size:0.86rem;color:var(--ink);overflow-wrap:anywhere', text: comp.name }),
              cMeta ? S.h('span', { style: 'font-size:0.74rem;color:var(--ink-secondary)', text: cMeta }) : null
            );
          })
        )
      ) : null,
      intelPills.length ? S.h('div', { class: 'bt-passport-intel-row', id: 'bt-detail-v74-intel' },
        intelPills.map(function (lbl) {
          return S.h('span', { class: 'bt-passport-intel-pill mono', text: lbl });
        })
      ) : null,
      S.h('div', { class: 'bt-detail-kv-grid' },
        kvPairs.map(function (kv) {
          return S.h('div', { class: 'bt-detail-kv' }, S.h('span', { text: kv[0] }), S.h('b', { text: kv[1] }));
        })
      ),
      buildCvaDetailScorecard(r, hObjs),
      r.general_notes ? S.h('div', { class: 'bt-tc-well' },
        S.h('span', { class: 'bt-tc-kicker', text: 'Tasting Notes' }),
        S.h('div', { style: 'font-size:0.86rem', text: un(r.general_notes) })
      ) : null,
      detailTimeline,
      (!isLocked && extractRowRecommendation(r).hasRec) ? buildSavedNextBrewCallout(r, false) : null,
      S.h('div', { class: 'bt-tc-pill-wrap no-print' },
        S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-active',
          text: (!isLocked && extractRowRecommendation(r).hasRec) ? 'Apply Fix & Brew Next \u2192' : 'Brew This Recipe \u2192',
          onclick: function () {
            hydrateBrewFromRowOrBag(r, null, null);
            S.closeSheetSafe();
            navigateToHomeRecipe();
          }
        }),
        (!isLocked && extractRowRecommendation(r).hasRec) ? S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-soft',
          text: 'Re-brew Exact Old Settings',
          onclick: function () {
            hydrateBrewFromRowOrBag(r, null, null, { exactOld: true });
            S.closeSheetSafe();
            navigateToHomeRecipe();
          }
        }) : null,
        S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-copper',
          text: isLocked ? 'Unlock Gold Seal' : 'Lock as Gold Recipe',
          onclick: function () {
            if (storage && typeof storage.commitDialLock === 'function') {
              storage.commitDialLock(rIdx, !isLocked);
              S.toastSafe(!isLocked ? 'Locked as Gold Recipe!' : 'Unlocked recipe');
              S.closeSheetSafe();
              S.rerenderSafe();
            }
          }
        }),
        S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-soft',
          text: 'Edit Coffee Across All Brews',
          onclick: function () { openTastingEditSheet(rIdx, 'coffee', { fromDetail: true }); }
        }),
        S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-soft',
          text: 'QR Trading Card',
          onclick: function () { openQrPassportSheet(r, { fromDetailIdx: rIdx }); }
        }),
        S.h('button', {
          type: 'button',
          id: 'bt-detail-print-btn',
          class: 'bt-tc-pill is-soft',
          onclick: function () {
            try { if (typeof window !== 'undefined' && typeof window.print === 'function') window.print(); } catch (_) {}
          }
        }, S.iconEl('share-card', { size: 15 }), S.h('span', { text: 'Print / Save PDF' }))
      )
    );
  });

  /* Edit Tasting & Multi-Brew Coffee Editor Sheet (w/ explicit <- Back!) */
  S.registerSheetSafe('screen-tasting-edit', function (host, payload) {
    var hObjs = S.getHistoryObjs();
    var rIdx = payload && payload.rowIdx != null ? +payload.rowIdx : 0;
    var r = (payload && payload.row) || hObjs[rIdx] || {};
    var fromDetail = !!(payload && payload.fromDetail);
    var storage = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : null;
    var un = function (v) { return typeof unneutralize === 'function' ? unneutralize(v || '') : String(v || ''); };

    var editTab = (payload && payload.tab) || 'tasting';
    var baseEdit = (typeof tastingEditFromRow === 'function') ? tastingEditFromRow(r) : {
      brew: { dose: r.brew_dose_g || '15', water: r.brew_water_g || '250', temp_f: r.brew_temp_f || '200', actual_s: r.brew_actual_time_s || '', out_g: r.brew_out_g || '', tds: r.brew_tds_pct || '' },
      notes: un(r.general_notes),
      quick: { stars: parseFloat(r.my_rating_stars) || 4.25, makeAgain: r.make_again || 'yes', sym: r.fix_symptom || '' }
    };
    var rowAdMeta = readRowAdapMetaSafe(r) || {};
    var rowCe = (rowAdMeta && rowAdMeta.coffee_extra) || {};
    var coffeeEdit = {
      coffee_name: un(r.coffee_name),
      roaster: un(r.roaster),
      origin: un(r.origin),
      region: un(rowCe.region || ''),
      process: un(r.process),
      roast_level: un(r.roast_level),
      varietal: un(r.varietal),
      elevation_m: un(r.elevation_m),
      roast_date: un(r.roast_date),
      bag_notes: un(r.bag_notes)
    };

    var container = S.h('div', { class: 'bt-tc-sheet', id: 'bt-screen-tasting-edit', style: 'display:flex;flex-direction:column;gap:12px' });

    function goBackFromEdit() {
      if (fromDetail) openTastingDetailSheet(rIdx);
      else S.closeSheetSafe();
    }

    function paintEditor() {
      container.textContent = '';

      container.appendChild(S.h('div', { class: 'bt-sheet-back-bar' },
        S.h('button', {
          type: 'button',
          class: 'bt-tc-back-pill',
          onclick: goBackFromEdit
        }, S.h('span', { text: fromDetail ? '\u2190 Back to Detail' : '\u2190 Back to Journal' }))
      ));

      container.appendChild(S.h('div', { class: 'bt-tc-seg-bar' },
        [['tasting', 'Edit This Brew & Tasting'], ['coffee', 'Edit Coffee Across All Brews']].map(function (tb) {
          return S.h('button', {
            type: 'button',
            class: 'bt-tc-seg-btn' + (editTab === tb[0] ? ' is-active' : ''),
            text: tb[1],
            onclick: function () { editTab = tb[0]; paintEditor(); }
          });
        })
      ));

      if (editTab === 'tasting') {
        var liveEy = (+baseEdit.brew.tds > 0 && +baseEdit.brew.out_g > 0 && +baseEdit.brew.dose > 0)
          ? (((+baseEdit.brew.tds * +baseEdit.brew.out_g) / +baseEdit.brew.dose).toFixed(2) + '% Extraction (%EY)')
          : '';

        container.appendChild(S.h('div', { style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px' },
          [
            ['Dose (g)', 'dose'],
            ['Water (g)', 'water'],
            ['Temp (\u00B0F)', 'temp_f'],
            ['Actual Time (s)', 'actual_s'],
            ['Mug Yield (g)', 'out_g'],
            ['Strength (%TDS)', 'tds']
          ].map(function (fd) {
            return S.h('label', { style: 'font-size:0.75rem;font-weight:700;display:flex;flex-direction:column;gap:4px' },
              S.h('span', { text: fd[0] }),
              S.h('div', { class: 'bt-tc-spotlight', style: 'min-height:44px' },
                S.h('input', {
                  type: 'number',
                  inputmode: 'decimal',
                  step: 'any',
                  value: String(baseEdit.brew[fd[1]] || ''),
                  onchange: function (e) { baseEdit.brew[fd[1]] = e.target.value; paintEditor(); }
                })
              )
            );
          })
        ));
        if (liveEy) {
          container.appendChild(S.h('div', { class: 'mono', style: 'font-size:0.82rem;color:var(--science);font-weight:700', text: 'Computed Cup Extraction: ' + liveEy }));
        }
        container.appendChild(S.h('div', { class: 'bt-tc-pill-wrap', style: 'flex-wrap:wrap' },
          [2.5, 3.0, 3.5, 4.0, 4.25, 4.5, 4.75, 5.0].map(function (stV) {
            return S.h('button', {
              type: 'button',
              class: 'bt-tc-pill is-compact mono' + (+baseEdit.quick.stars === stV ? ' is-active' : ' is-soft'),
              text: stV + ' / 5',
              onclick: function () { baseEdit.quick.stars = stV; paintEditor(); }
            });
          })
        ));
        container.appendChild(S.h('textarea', {
          class: 'bt-tc-textarea',
          rows: '3',
          placeholder: 'Tasting notes...',
          value: baseEdit.notes,
          oninput: function (e) { baseEdit.notes = e.target.value; }
        }));
        container.appendChild(S.h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap' },
          S.h('button', {
            type: 'button',
            class: 'bt-tc-back-pill',
            style: 'min-height:54px',
            onclick: goBackFromEdit
          }, S.h('span', { text: 'Cancel' })),
          S.h('button', {
            type: 'button',
            class: 'bt-tc-primary-btn',
            style: 'flex:1 1 200px;width:auto',
            onclick: function () {
              if (storage && typeof storage.commitTastingEdit === 'function') {
                var oldDoseG = parseFloat(r.brew_dose_g);
                var newDoseG = parseFloat(baseEdit.brew && baseEdit.brew.dose);
                var res = storage.commitTastingEdit(rIdx, baseEdit);
                if (res && res.error) {
                  S.toastSafe(res.error);
                  return;
                }
                var updatedObjs = S.getHistoryObjs();
                var updatedRow = updatedObjs[rIdx] || r;
                if (isFinite(oldDoseG) && isFinite(newDoseG) && Math.abs(newDoseG - oldDoseG) > 0.0001 && typeof storage.reconcileBagDoseDelta === 'function') {
                  try { storage.reconcileBagDoseDelta(updatedRow, Math.round((newDoseG - oldDoseG) * 10) / 10); } catch (_) {}
                }
                if (!extractRowBlendInfo(updatedRow).isBlend) {
                  upsertVaultSafe({
                    id: updatedRow.coffee_id || '',
                    name: un(updatedRow.coffee_name),
                    roaster: un(updatedRow.roaster),
                    origin: un(updatedRow.origin),
                    process: un(updatedRow.process),
                    roast: un(updatedRow.roast_level),
                    varietal: un(updatedRow.varietal),
                    bag_notes: un(updatedRow.bag_notes),
                    notes: un(updatedRow.bag_notes)
                  }, updatedRow);
                }
                S.toastSafe('Saved tasting update!', {
                  durationMs: 10000,
                  actionLabel: 'Undo',
                  onAction: function () {
                    if (typeof storage.undoEdit === 'function') { storage.undoEdit(); S.rerenderSafe(); }
                  }
                });
                S.closeSheetSafe();
                S.rerenderSafe();
              }
            }
          }, S.h('span', { text: 'Save Tasting Changes \u2192' }), S.iconEl('check-seal', { size: 18 }))
        ));
      } else {
        container.appendChild(S.h('div', { style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px' },
          [
            ['Coffee Name', 'coffee_name'],
            ['Roaster', 'roaster'],
            ['Origin', 'origin'],
            ['Region', 'region'],
            ['Process', 'process'],
            ['Roast Level', 'roast_level'],
            ['Varietal', 'varietal'],
            ['Elevation (m)', 'elevation_m'],
            ['Roast Date (YYYY-MM-DD)', 'roast_date'],
            ['Bag Notes / Flavors', 'bag_notes']
          ].map(function (cf) {
            return S.h('label', { style: 'font-size:0.75rem;font-weight:700;display:flex;flex-direction:column;gap:4px' },
              S.h('span', { text: cf[0] }),
              S.h('div', { class: 'bt-tc-spotlight', style: 'min-height:44px' },
                S.h('input', {
                  type: 'text',
                  value: coffeeEdit[cf[1]] || '',
                  oninput: function (e) { coffeeEdit[cf[1]] = e.target.value; }
                })
              )
            );
          })
        ));
        container.appendChild(S.h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap' },
          S.h('button', {
            type: 'button',
            class: 'bt-tc-back-pill',
            style: 'min-height:54px',
            onclick: goBackFromEdit
          }, S.h('span', { text: 'Cancel' })),
          S.h('button', {
            type: 'button',
            class: 'bt-tc-primary-btn',
            style: 'flex:1 1 200px;width:auto',
            onclick: function () {
              if (storage && typeof storage.commitCoffeeEdit === 'function') {
                var cid = r.coffee_id || '';
                var cOrig = un(r.coffee_name).toLowerCase();
                var matchIdxs = [];
                hObjs.forEach(function (row, idx) {
                  if ((cid && row.coffee_id === cid) || un(row.coffee_name).toLowerCase() === cOrig) matchIdxs.push(idx);
                });
                var res = storage.commitCoffeeEdit(matchIdxs.length ? matchIdxs : [rIdx], coffeeEdit);
                if (res && res.error) { S.toastSafe(res.error); return; }
                var editedCoffeePayload = {
                  id: cid || '',
                  name: coffeeEdit.coffee_name,
                  roaster: coffeeEdit.roaster,
                  origin: coffeeEdit.origin,
                  region: coffeeEdit.region,
                  process: coffeeEdit.process,
                  roast: coffeeEdit.roast_level,
                  varietal: coffeeEdit.varietal,
                  elevation_m: coffeeEdit.elevation_m,
                  roast_date: coffeeEdit.roast_date,
                  bag_notes: coffeeEdit.bag_notes,
                  notes: coffeeEdit.bag_notes
                };
                upsertVaultSafe(editedCoffeePayload, r);
                var aLive = S.getApp();
                if (aLive && aLive.coffee && ((cid && aLive.coffee.id === cid) || normCoffeeKeyPart(aLive.coffee.name) === normCoffeeKeyPart(cOrig))) {
                  if (coffeeEdit.coffee_name) aLive.coffee.name = coffeeEdit.coffee_name;
                  if (coffeeEdit.roaster) aLive.coffee.roaster = coffeeEdit.roaster;
                  if (coffeeEdit.origin) { aLive.coffee.origin = coffeeEdit.origin; aLive.coffee.originUnsure = ''; }
                  if (coffeeEdit.region) aLive.coffee.region = coffeeEdit.region;
                  if (coffeeEdit.process) { aLive.coffee.process = coffeeEdit.process; aLive.coffee.processUnsure = ''; }
                  if (coffeeEdit.roast_level) { aLive.coffee.roast = coffeeEdit.roast_level; aLive.coffee.roastUnsure = ''; }
                  if (coffeeEdit.varietal) { aLive.coffee.varietal = coffeeEdit.varietal; aLive.coffee.varietalUnsure = ''; }
                  if (coffeeEdit.elevation_m) { aLive.coffee.elevation_m = coffeeEdit.elevation_m; aLive.coffee.elevText = coffeeEdit.elevation_m + ' masl'; aLive.coffee.elevUnsure = ''; }
                  if (coffeeEdit.roast_date) { aLive.coffee.roast_date = coffeeEdit.roast_date; aLive.coffee.dateUnsure = ''; }
                  if (coffeeEdit.bag_notes) { aLive.coffee.bag_notes = coffeeEdit.bag_notes; aLive.coffee.notes = coffeeEdit.bag_notes; aLive.coffee.notesUnsure = ''; }
                  S.saveDraftSafe();
                }
                S.toastSafe('Updated coffee details across ' + (res.changed || matchIdxs.length) + ' brew(s)!');
                S.closeSheetSafe();
                S.rerenderSafe();
              }
            }
          }, S.h('span', { text: 'Apply Coffee Details Across All Brews \u2192' }), S.iconEl('check-seal', { size: 18 }))
        ));
      }
    }

    paintEditor();
    return container;
  });

  /* ========================================================================
     MAIN TAB 2 (`cellar`) RENDERER & ROUTE REGISTRATIONS
     ======================================================================== */
  function renderCellarTab(host, payload) {
    var a = S.getApp();
    var incoming = (payload && payload.segment) || (a.tabSegments && a.tabSegments.cellar) || '';
    if (incoming === 'dialing') ui.seg = 'shelf';
    else if (['shelf', 'journal', 'cafes', 'prices'].indexOf(incoming) >= 0) ui.seg = incoming;
    if (a.tabSegments) a.tabSegments.cellar = ui.seg;

    var root = S.h('div', { class: 'bt-tc-stage', id: 'bt-tab-cellar-journal' });

    function repaint() {
      root.textContent = '';

      /* Single Contextual Return Pill when an active Home Brew / Tasting draft is open */
      var canBack = S.canGoBackSafe();
      var activeHome = hasActiveHomeDraft();
      var hasShellBackBtn = typeof document !== 'undefined' && !!(document.getElementById('top-back-btn') || document.getElementById('rail-back-btn'));
      if ((activeHome || (canBack && !hasShellBackBtn)) && ui.seg !== 'cafes') {
        root.appendChild(S.h('div', { class: 'bt-cellar-nav-bar', id: 'bt-cellar-top-back' },
          S.h('button', {
            type: 'button',
            class: 'bt-tc-back-pill',
            onclick: function () {
              if (activeHome) S.navGo(homeDraftReturnRoute());
              else S.goBackSafe('door');
            }
          }, S.h('span', { text: activeHome ? homeDraftReturnLabel() : '\u2190 Back' }))
        ));
      }

      root.appendChild(S.h('header', { class: 'bt-tc-head' },
        S.h('div', { style: 'display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap;width:100%' },
          S.h('div', { style: 'flex:1 1 210px;min-width:0' },
            S.h('div', { class: 'bt-tc-kicker', text: 'Tab 2 \u00B7 Living Coffee Cellar' }),
            S.h('h1', { class: 'bt-tc-title', text: 'Shelf, Trails, Journal & Cafes' }),
            S.h('p', { class: 'bt-tc-sub', text: 'Peak freshness, freezer doses, personal brew journal & 4-step coffee shop logger.' })
          ),
          S.h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap;align-items:center' },
            S.h('button', {
              type: 'button',
              id: 'bt-cellar-open-sca-btn',
              class: 'bt-tc-pill is-soft',
              style: 'min-height:44px;font-weight:800;flex-shrink:0',
              onclick: function () {
                S.haptic('snap');
                S.navGo('sca');
              }
            }, S.iconEl('cafe-cup', { size: 16 }), S.h('span', { text: '5-Bowl Cupping \u2192' })),
            S.h('button', {
              type: 'button',
              id: 'bt-cellar-backup-saves-btn',
              class: 'bt-tc-pill is-copper',
              style: 'align-self:flex-start;min-height:44px;font-weight:800;flex-shrink:0',
              onclick: function () {
                S.haptic('snap');
                if (typeof window !== 'undefined' && window.BTBackupCenter && typeof window.BTBackupCenter.open === 'function') {
                  window.BTBackupCenter.open({ source: 'cellar' });
                } else {
                  S.openSheetSafe('save-backup-center', { source: 'cellar' }, { title: 'Backup & Load Saves', detent: 'full' });
                }
              }
            }, S.iconEl('vault-shield', { size: 16 }), S.h('span', { text: 'Backup / Load Saves' }))
          )
        )
      ));

      var segs = [
        ['shelf',   'Shelf & Trails'],
        ['journal', 'Journal'],
        ['cafes',   'Coffee Shop'],
        ['prices',  'Prices']
      ];
      root.appendChild(S.h('div', { class: 'bt-tc-seg-bar', role: 'tablist', 'aria-label': 'Cellar Sections' },
        segs.map(function (sg) {
          var on = ui.seg === sg[0];
          return S.h('button', {
            type: 'button',
            role: 'tab',
            class: 'bt-tc-seg-btn' + (on ? ' is-active' : ''),
            'aria-selected': String(on),
            text: sg[1],
            onclick: function () {
              ui.seg = sg[0];
              if (a.tabSegments) a.tabSegments.cellar = sg[0];
              S.haptic('tick');
              repaint();
            }
          });
        })
      ));

      if (ui.seg === 'shelf') root.appendChild(buildOpenShelfAndTrailsSegment(repaint));
      else if (ui.seg === 'journal') root.appendChild(buildJournalSegment(repaint));
      else if (ui.seg === 'cafes') root.appendChild(buildCafesSegment(repaint));
      else root.appendChild(buildBagPricesSegment(repaint));

      if (typeof Beanjamin !== 'undefined' && Beanjamin && typeof Beanjamin.enforceSinglePerViewport === 'function') {
        Beanjamin.enforceSinglePerViewport(root);
      }
    }

    repaint();
    if (host && host.nodeType === 1) {
      host.textContent = '';
      host.appendChild(root);
    }
    return root;
  }

  if (typeof window !== 'undefined') {
    window.BTCellarTab = {
      render: renderCellarTab,
      setSegment: function (seg) {
        if (['shelf', 'journal', 'cafes', 'prices'].indexOf(seg) >= 0) {
          ui.seg = seg;
          var a = S.getApp();
          if (a && a.tabSegments) a.tabSegments.cellar = seg;
        }
      },
      openDetail: openTastingDetailSheet,
      openEdit: openTastingEditSheet,
      openQrPassport: openQrPassportSheet,
      openJournalFilter: function (filterKey, query) {
        ui.seg = 'journal';
        ui.journalFilter = filterKey || 'all';
        if (typeof query === 'string') ui.journalQ = query;
        ui.journalBreakdownOpen = true;
        var a = S.getApp();
        if (a) {
          a.activeTab = 'cellar';
          if (a.tabSegments) a.tabSegments.cellar = 'journal';
        }
        if (window.BTShell && typeof window.BTShell.switchTab === 'function') {
          window.BTShell.switchTab('cellar', { segment: 'journal' });
        } else {
          S.rerenderSafe();
        }
      },
      hydrateAndBrewRow: function (r) {
        if (!r) return;
        hydrateBrewFromRowOrBag(r, null, null);
        navigateToHomeRecipe();
      },
      cloneCafeDrinkToHome: solveCloneCafeDrinkSafe
    };
  }

  S.registerTabSafe('cellar', renderCellarTab);

  /* Register Cellar & Legacy Screen Routes */
  S.registerRouteSafe('perfecting', function () {
    var a = S.getApp(); a.activeTab = 'cellar'; if (a.tabSegments) a.tabSegments.cellar = 'shelf';
    ui.seg = 'shelf'; S.rerenderSafe();
  });

  ['history', 'share'].forEach(function (rk) {
    S.registerRouteSafe(rk, function () {
      var a = S.getApp(); a.activeTab = 'cellar'; if (a.tabSegments) a.tabSegments.cellar = 'journal';
      ui.seg = 'journal'; S.rerenderSafe();
    });
  });

  ['detail', 'screendetail'].forEach(function (rk) {
    S.registerRouteSafe(rk, function (payload) {
      var a = S.getApp(); a.activeTab = 'cellar'; if (a.tabSegments) a.tabSegments.cellar = 'journal';
      ui.seg = 'journal'; S.rerenderSafe();
      var idx = (payload && payload.rowIdx != null) ? +payload.rowIdx : Math.max(0, S.getHistoryObjs().length - 1);
      if (S.getHistoryObjs()[idx]) openTastingDetailSheet(idx);
    });
  });

  ['tastedit', 'screentastingedit'].forEach(function (rk) {
    S.registerRouteSafe(rk, function (payload) {
      var a = S.getApp(); a.activeTab = 'cellar'; if (a.tabSegments) a.tabSegments.cellar = 'journal';
      ui.seg = 'journal'; S.rerenderSafe();
      var idx = (payload && payload.rowIdx != null) ? +payload.rowIdx : Math.max(0, S.getHistoryObjs().length - 1);
      if (S.getHistoryObjs()[idx]) openTastingEditSheet(idx, 'tasting', { fromDetail: false });
    });
  });

  ['compare', 'screencompare'].forEach(function (rk) {
    S.registerRouteSafe(rk, function () {
      var a = S.getApp(); a.activeTab = 'cellar'; if (a.tabSegments) a.tabSegments.cellar = 'journal';
      ui.seg = 'journal';
      var n = S.getHistoryObjs().length;
      if (ui.compareIdxs.length < 2 && n >= 2) {
        ui.compareIdxs = n >= 3 ? [n - 3, n - 2, n - 1] : [n - 2, n - 1];
      }
      S.rerenderSafe();
    });
  });

  S.registerRouteSafe('shops', function () {
    var a = S.getApp(); a.activeTab = 'cellar'; if (a.tabSegments) a.tabSegments.cellar = 'cafes';
    ui.seg = 'cafes'; S.rerenderSafe();
  });

  ['shop', 'sdrink', 'staste', 'sperfect'].forEach(function (stepKey) {
    S.registerRouteSafe(stepKey, function () {
      var a = S.getApp();
      a.activeTab = 'cellar';
      if (a.tabSegments) a.tabSegments.cellar = 'cafes';
      ui.seg = 'cafes';
      var ctx = getShopStoreAndDraft();
      ctx.draft.step = stepKey;
      persistShopDraftSafe(ctx.draft);
      S.rerenderSafe();
    });
  });

  S.registerRouteSafe('prices', function () {
    var a = S.getApp(); a.activeTab = 'cellar'; if (a.tabSegments) a.tabSegments.cellar = 'prices';
    ui.seg = 'prices'; S.rerenderSafe();
  });
})();
