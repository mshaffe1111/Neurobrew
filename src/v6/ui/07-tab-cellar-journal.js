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
    priceShow: 'open', /* 'open' | 'finished' | 'all' */
    priceSort: 'use_first', /* 'use_first' | 'newest' | 'cheap' | 'name' */
    priceQ: '',
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
      notes: ''
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
    if (step === 'taste') return '\u2190 Back to Tasting';
    if (step === 'timer') return '\u2190 Back to Brew Timer';
    if (step === 'brew' || step === 'method') return '\u2190 Back to Home Brew';
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

  /* Complete Row/Bag -> app.brew Sync (syncs BOTH grindUm & grind_um, tempC & tempF, and recipeLocked) */
  function hydrateBrewFromRowOrBag(row, uRec, bag) {
    var a = S.getApp();
    var storage = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : null;
    var anchor = row || (uRec && (uRec.lockedBrew || uRec.bestBrew || uRec.latestBrew)) || null;

    if (uRec && storage && typeof storage.selectSavedCoffee === 'function') {
      try { storage.selectSavedCoffee(uRec, { anchorRow: anchor || undefined, silent: true }); } catch (_) {}
    } else if (anchor && storage && typeof storage.useCoffeeFromRow === 'function') {
      try { storage.useCoffeeFromRow(anchor, true, true); } catch (_) {}
    } else if (bag) {
      a.coffee = Object.assign({}, a.coffee || {}, {
        name: bag.coffee || bag.name || '',
        roaster: bag.roaster || '',
        roast: bag.rlevel || 'light',
        roast_date: bag.roast || '',
        is_frozen: bag.is_frozen || '',
        answered: 'yes'
      });
    }

    a.brew = a.brew || {};
    if (anchor) {
      var mKey = (typeof resolveMethod === 'function' ? resolveMethod(anchor.brew_method) : '') || anchor.brew_method;
      if (mKey) a.brew.method = mKey;
      if (+anchor.brew_dose_g > 0) a.brew.dose = +anchor.brew_dose_g;
      if (+anchor.brew_water_g > 0) a.brew.water = +anchor.brew_water_g;
      if (+anchor.brew_ratio > 0) a.brew.ratio = +anchor.brew_ratio;
      if (+anchor.brew_grind_target_um > 0) {
        a.brew.grindUm = +anchor.brew_grind_target_um;
        a.brew.grind_um = +anchor.brew_grind_target_um;
      }
      if (+anchor.brew_temp_c > 0) {
        a.brew.tempC = +anchor.brew_temp_c;
        a.brew.tempF = Math.round(+anchor.brew_temp_c * 9 / 5 + 32);
      } else if (+anchor.brew_temp_f > 0) {
        a.brew.tempF = +anchor.brew_temp_f;
        a.brew.tempC = Math.round(((+anchor.brew_temp_f - 32) * 5 / 9) * 2) / 2;
      }
      a.recipeLocked = anchor.dial_locked === 'yes' || anchor.dial_locked === '1';
    }
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

    return {
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

    var btUri = '';
    var btTextCode = '';
    if (inn && typeof inn.encodeBrewPassport === 'function') {
      try {
        var enc = inn.encodeBrewPassport({
          bean: { name: cName, roaster: cRoaster, origin: cOrigin, process: cProc, roast: cRoast },
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

    var realQrSvg = S.encodeRealQrSvg(btUri, { size: 176, margin: 3, fg: '#1A1412', bg: '#FAF6F0' });

    var safeEsc = function (s) {
      return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };

    var tradingCardSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 900" width="720" height="900" role="img" aria-label="BeanTelligence Trading Card Brew Passport">' +
      '<rect width="720" height="900" rx="36" fill="#FAF6F0"/>' +
      '<rect x="20" y="20" width="680" height="860" rx="28" fill="#FFFDF9" stroke="#D8C8B6" stroke-width="2"/>' +
      '<rect x="20" y="20" width="680" height="156" rx="28" fill="#1C4A36"/>' +
      '<text x="52" y="68" fill="#F2AE4B" font-family="sans-serif" font-size="16" font-weight="800" letter-spacing="2">' + safeEsc(cRoaster.toUpperCase()) + '</text>' +
      '<text x="52" y="114" fill="#FFFDF9" font-family="Georgia,serif" font-size="34" font-weight="700">' + safeEsc(cName.slice(0, 32)) + '</text>' +
      '<text x="52" y="148" fill="#E3F2EA" font-family="sans-serif" font-size="18" font-weight="600">' + safeEsc([cOrigin, cProc, cRoast].filter(Boolean).join(' \u00B7 ')) + '</text>' +
      (stars > 0 ? ('<circle cx="634" cy="98" r="38" fill="#F2AE4B"/><text x="634" y="106" text-anchor="middle" fill="#1A1412" font-family="monospace" font-size="22" font-weight="800">' + stars.toFixed(2) + '</text>') : '') +
      '<rect x="48" y="206" width="624" height="196" rx="20" fill="#EFE6DA"/>' +
      '<text x="76" y="246" fill="#685244" font-family="sans-serif" font-size="14" font-weight="800" letter-spacing="1.5">SHARED BREW RECIPE (' + safeEsc(String(method).toUpperCase()) + ')</text>' +
      '<text x="76" y="294" fill="#1A1412" font-family="monospace" font-size="28" font-weight="800">' + doseG + ' g \u2192 ' + waterG + ' g (1:' + ratio + ')</text>' +
      '<text x="76" y="336" fill="#4E3C31" font-family="monospace" font-size="21" font-weight="700">Grind: ' + safeEsc(gSet) + ' (~' + um + ' \u00B5m) \u00B7 ' + tempC + ' \u00B0C</text>' +
      (notes ? ('<text x="76" y="376" fill="#9A4212" font-family="sans-serif" font-size="18" font-weight="700">Notes: ' + safeEsc(notes.slice(0, 56)) + '</text>') : '') +
      '<g transform="translate(260, 446)">' + realQrSvg.replace(/width="\d+"/, 'width="200"').replace(/height="\d+"/, 'height="200"') + '</g>' +
      '<text x="360" y="690" text-anchor="middle" fill="#1A1412" font-family="sans-serif" font-size="18" font-weight="800">Scan to Auto-Match Grind to Any Home Grinder</text>' +
      '<text x="360" y="720" text-anchor="middle" fill="#685244" font-family="monospace" font-size="13">' + safeEsc(btUri.slice(0, 64)) + '</text>' +
      '<text x="360" y="846" text-anchor="middle" fill="#9A4212" font-family="Georgia,serif" font-size="18" font-weight="700">BeanTelligence \u00B7 Offline Scannable Brew Passport</text>' +
      '</svg>';

    return {
      uri: btUri,
      textCode: btTextCode,
      qrSvg: realQrSvg,
      tradingCardSvg: tradingCardSvg,
      title: cName
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
                hydrateBrewFromRowOrBag(lockedRow || latest, null, null);
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
    var openBags = priceList.map(function (b, idx) {
      return Object.assign({ _priceIdx: idx }, b);
    }).filter(function (b) { return !b.finished; });

    unified.forEach(function (u) {
      if (!u || !u.name) return;
      var exists = openBags.some(function (ob) {
        return ob.coffee.toLowerCase() === String(u.name).toLowerCase();
      });
      if (!exists && openBags.length < 8) {
        openBags.push({
          _priceIdx: -1,
          _unifiedRec: u,
          id: u.coffee_id || 'uf_' + openBags.length,
          coffee: u.name,
          roaster: u.roaster || '',
          size: 250,
          unit: 'g',
          price: 21,
          currency: '$',
          rlevel: u.roast || 'light',
          roast: u.roast_date || '',
          rem_g: 180,
          is_frozen: u.is_frozen || '',
          frozen_date: u.frozen_date || ''
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

    openBags.forEach(function (bag, bIdx) {
      var uRec = bag._unifiedRec || unified.find(function (u) {
        return String(u.name || '').toLowerCase() === bag.coffee.toLowerCase();
      }) || null;
      var ev = evaluateShelfBag(bag, uRec);
      var bagKey = bag.id || (bag.coffee + '_' + bIdx);
      var isLocked = !!(uRec && uRec.lockedBrew);
      var pullDose = +(a.brew && a.brew.dose) || +(bag.dose) || 15;

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
                  storage.applyFreshBagRoastDate(uRec || bag, bag.roast || S.isoDaysAgo(7), { freeze: !!nextFrz, addToShelf: true });
                }
                S.toastSafe(nextFrz ? 'Bag marked Frozen at -18 \u00B0C (12\u00D7 slower aging)!' : 'Moved bag back to counter shelf');
                repaint();
              }
            }, S.iconEl('cryo-snowflake', { size: 14 }), S.h('span', { text: ev.isFrozen ? 'Frozen at -18 \u00B0C' : 'Freeze Bag Now' })),
            S.h('button', {
              type: 'button',
              class: 'bt-tc-pill is-compact is-copper',
              onclick: function () {
                var nextRem = Math.max(0, Math.round((ev.remG - pullDose) * 10) / 10);
                if (bag._priceIdx >= 0) {
                  var list = S.getNormalizedPrices();
                  if (list[bag._priceIdx]) {
                    list[bag._priceIdx].rem_g = nextRem;
                    list[bag._priceIdx].is_frozen = 'yes';
                    if (nextRem <= 0.4) list[bag._priceIdx].finished = S.isoDaysAgo(0);
                    S.saveNormalizedPrices(list);
                  }
                }
                hydrateBrewFromRowOrBag(null, uRec, Object.assign({}, bag, { is_frozen: 'yes' }));
                a.brew.dose = pullDose;
                if (ui.frozenGrindOffset) {
                  var baseUm = +a.brew.grindUm || +a.brew.grind_um || 550;
                  a.brew.grindUm = baseUm + 12;
                  a.brew.grind_um = baseUm + 12;
                }
                var bagSymPull = bag.sym || (bag.currency === 'EUR' ? '\u20AC' : bag.currency === 'GBP' ? '\u00A3' : '$');
                S.toastSafe('Pulled ' + pullDose + ' g frozen dose (' + nextRem + ' g left \u00B7 ' + bagSymPull + ev.perCup.toFixed(2) + '/cup)!');
                navigateToHomeRecipe();
              }
            }, S.h('span', { text: 'Pull ' + pullDose + ' g Dose \u2192 Brew' })),
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
          try { storage.applyFreshBagRoastDate(uRec || bag, iso, { resetBagGrams: true, addToShelf: true }); } catch (_) {}
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

      wrap.appendChild(S.h('article', {
        class: 'bt-cellar-bag-card',
        style: '--bag-roast-color:' + S.roastColorFor(bag.rlevel)
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
        S.h('div', { class: 'bt-tc-row-between' },
          S.h('span', { class: 'mono', style: 'font-size:0.8rem;color:var(--ink-secondary)', text: ev.remG + ' g / ' + ev.totalG + ' g remaining (' + ev.pctLeft + '%)' }),
          isLocked ? S.h('span', { class: 'bt-tc-badge is-gold', text: 'Gold Recipe Locked' }) : null
        ),
        S.h('div', { class: 'bt-cellar-meter' }, S.h('i', { style: 'width:' + ev.pctLeft + '%' })),
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
      ));
    });

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

    /* 5-Tile KPI Strip */
    var distinctSet = Object.create(null);
    var gemsCount = 0, lockedCount = 0, starSum = 0, starN = 0;
    hObjs.forEach(function (r) {
      if (!r) return;
      distinctSet[(r.coffee_id || r.coffee_name || '').toLowerCase()] = 1;
      var st = parseFloat(r.my_rating_stars) || 0;
      if (st >= 4.5) gemsCount++;
      if (st > 0) { starSum += st; starN++; }
      if (r.dial_locked === 'yes' || r.dial_locked === '1') lockedCount++;
    });

    wrap.appendChild(S.h('div', { class: 'bt-tc-kpi-grid' },
      [
        ['Logged Cups', String(hObjs.length)],
        ['Coffees', String(Object.keys(distinctSet).length)],
        ['4.5+ Gems', String(gemsCount)],
        ['Gold Locked', String(lockedCount)],
        ['Avg Rating', starN ? (starSum / starN).toFixed(2) : '\u2014']
      ].map(function (kp) {
        return S.h('div', { class: 'bt-tc-kpi-tile' },
          S.h('span', { class: 'bt-tc-kpi-val', text: kp[1] }),
          S.h('span', { class: 'bt-tc-kpi-lbl', text: kp[0] })
        );
      })
    ));

    /* Import Shared Brew Recipe Bar (Plain-English Header!) */
    wrap.appendChild(S.h('div', { class: 'bt-tc-card' },
      S.h('div', { class: 'bt-tc-kicker', text: 'Import Shared Brew Recipe (Auto-Matches Your Grinder)' }),
      S.h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap' },
        S.h('div', { class: 'bt-tc-spotlight', style: 'flex:1;min-width:190px' },
          S.h('input', {
            type: 'text',
            placeholder: 'Paste BT-code: V1 or bt1: passport code...',
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
            var a = S.getApp();
            var res = (inn && typeof inn.decodeAndLocalizePassport === 'function')
              ? inn.decodeAndLocalizePassport(raw, a.prefs)
              : (typeof shareRead === 'function' ? shareRead(raw) : null);
            if (res && (res.ok || res.coffee || res.bean)) {
              if (res.bean || res.coffee) a.coffee = Object.assign(a.coffee || {}, res.bean || res.coffee, { answered: 'yes' });
              var locRx = res.localizedRecipe || res.brew || {};
              if (a.brew) {
                if (locRx.methodKey || locRx.method) a.brew.method = locRx.methodKey || locRx.method;
                if (locRx.doseG || locRx.dose) a.brew.dose = locRx.doseG || locRx.dose;
                if (locRx.waterG || locRx.water) a.brew.water = locRx.waterG || locRx.water;
                if (locRx.d50Um) { a.brew.grindUm = locRx.d50Um; a.brew.grind_um = locRx.d50Um; }
                if (locRx.tempC) { a.brew.tempC = locRx.tempC; a.brew.tempF = Math.round(locRx.tempC * 9 / 5 + 32); }
              }
              ui.passportMsg = 'Matched "' + ((a.coffee && a.coffee.name) || 'Shared Recipe') + '" to your grinder & loaded into Brew Studio!';
              S.saveDraftSafe();
              S.toastSafe(ui.passportMsg);
              repaint();
            } else {
              ui.passportMsg = 'Could not read code \u2014 check that it starts with BT-code: V1 or bt1:.';
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
        ['all',     'All Brews'],
        ['gems',    '4.5+ Gems'],
        ['locked',  'Locked Gold'],
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
            ui.compareIdxs = [0, 1];
            repaint();
          }
        })
      ));
    }

    if (ui.compareIdxs.length >= 2) {
      var cmpRows = ui.compareIdxs.map(function (i) { return { idx: i, r: hObjs[i] }; }).filter(function (x) { return !!x.r; });
      if (cmpRows.length >= 2) {
        var specRows = [
          { lbl: 'Coffee', fn: function (r) { return (typeof unneutralize === 'function' ? unneutralize(r.coffee_name || '') : r.coffee_name) || '\u2014'; } },
          { lbl: 'Brewer', fn: function (r) { return S.humanMethodName(r.brew_method); } },
          { lbl: 'Try #', fn: function (r) { return r.brew_attempt ? ('#' + r.brew_attempt) : '\u2014'; } },
          { lbl: 'Dose : Water', fn: function (r) { return (r.brew_dose_g || '\u2014') + ' g : ' + (r.brew_water_g || '\u2014') + ' g'; } },
          { lbl: 'Ratio', fn: function (r) { return r.brew_ratio ? ('1:' + r.brew_ratio) : '\u2014'; } },
          { lbl: 'Grind Setting', fn: function (r) { return [r.brew_grind_setting, r.brew_grind_target_um ? (r.brew_grind_target_um + ' \u00B5m') : ''].filter(Boolean).join(' \u00B7 ') || '\u2014'; } },
          { lbl: 'Water Temp', fn: function (r) { return r.brew_temp_c ? (r.brew_temp_c + ' \u00B0C') : (r.brew_temp_f ? (r.brew_temp_f + ' \u00B0F') : '\u2014'); } },
          { lbl: 'Brew Time', fn: function (r) {
            var sVal = +(r.brew_actual_time_s || r.brew_time_s) || 0;
            return sVal > 0 ? (S.fmtMmSs(sVal) + ' (' + sVal + 's)') : '\u2014';
          } },
          { lbl: 'Strength (%TDS) / Extraction (%EY)', fn: function (r) { return r.brew_tds_pct ? (r.brew_tds_pct + '% / ' + (r.brew_ey_pct || '\u2014') + '%') : '\u2014'; } },
          { lbl: 'Rating', fn: function (r) { return r.my_rating_stars ? (r.my_rating_stars + ' / 5.00') : (r.total_score ? (r.total_score + ' / 100') : '\u2014'); } },
          { lbl: 'Balance Note', fn: function (r) { return r.fix_symptom || 'balanced'; } },
          { lbl: 'Flavors Liked', fn: function (r) { return (typeof unneutralize === 'function' ? unneutralize(r.flavors_liked || '') : r.flavors_liked) || '\u2014'; } }
        ];

        var theadTr = S.h('tr', null, S.h('th', { text: 'Parameter' }));
        cmpRows.forEach(function (item, cIdx) {
          theadTr.appendChild(S.h('th', null,
            S.h('div', { text: 'Cup ' + String.fromCharCode(65 + cIdx) + (item.r.cupping_date ? ' (' + item.r.cupping_date + ')' : '') }),
            S.h('button', {
              type: 'button',
              class: 'bt-tc-pill is-compact is-active',
              style: 'margin-top:4px;min-height:32px',
              text: 'Brew \u2192',
              onclick: function () {
                hydrateBrewFromRowOrBag(item.r, null, null);
                navigateToHomeRecipe();
              }
            })
          ));
        });

        var tbody = S.h('tbody');
        specRows.forEach(function (sr) {
          var vals = cmpRows.map(function (c) { return sr.fn(c.r); });
          var varied = vals.some(function (v) { return v !== vals[0]; });
          if (ui.compareOnlyVaried && !varied && sr.lbl !== 'Coffee' && sr.lbl !== 'Rating') return;
          var tr = S.h('tr', { class: varied ? 'is-diff' : '' }, S.h('td', null, S.h('b', { text: sr.lbl })));
          vals.forEach(function (v) {
            tr.appendChild(S.h('td', { class: 'mono', text: v }));
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
      if (ui.journalFilter === 'gems' && st < 4.5) return false;
      if (ui.journalFilter === 'locked' && r.dial_locked !== 'yes' && r.dial_locked !== '1') return false;
      if (ui.journalFilter === 'dialing' && (st >= 4.25 || r.dial_locked === 'yes')) return false;
      if (ui.journalFilter === 'filter' && /espresso|moka|aeropress|press|cold/.test(mk)) return false;
      if (ui.journalFilter === 'espresso' && mk.indexOf('espresso') < 0 && mk.indexOf('moka') < 0) return false;
      if (ui.journalFilter === 'r2' && !(parseFloat(r.brew_tds_pct) > 0)) return false;
      if (!q) return true;
      return [r.coffee_name, r.roaster, r.brew_method, r.flavors_liked, r.general_notes].join(' ').toLowerCase().indexOf(q) >= 0;
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
          S.h('span', {
            class: 'bt-tc-badge ' + ((parseFloat(r.my_rating_stars) >= 4.5) ? 'is-gold' : 'is-good'),
            text: r.my_rating_stars ? (r.my_rating_stars + ' / 5') : (r.total_score ? (r.total_score + ' / 100') : 'Logged')
          })
        ),
        S.h('div', { class: 'bt-tc-pill-scroll' },
          S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-compact is-soft',
            text: 'Inspect Detail',
            onclick: function () { openTastingDetailSheet(rIdx); }
          }),
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
    var list = S.getNormalizedPrices();
    var storage = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : null;
    var pd = ui.priceDraft;
    if (!pd.date) pd.date = S.isoDaysAgo(0);
    if (!pd.roast) pd.roast = S.isoDaysAgo(4);

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
          onclick: function () { ui.priceAddOpen = !ui.priceAddOpen; repaint(); }
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
      wrap.appendChild(S.h('section', { class: 'bt-tc-card' },
        S.h('div', { class: 'bt-tc-kicker', text: 'Add Bag to Shelf & Price Tracker' }),
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
            placeholder: 'Optional purchase notes (store, sale, origin)...',
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
            var canonicalEntry = S.normalizePriceBag({
              id: 'bag_' + Date.now(),
              coffee: cTrim,
              roaster: pd.roaster.trim(),
              size: +pd.size || 250,
              unit: 'g',
              price: +pd.price || 20,
              currency: pd.currency || '$',
              sym: pd.currency || '$',
              rlevel: pd.rlevel || 'light',
              date: pd.date || S.isoDaysAgo(0),
              roast: pd.roast || '',
              rem_g: +pd.size || 250,
              notes: pd.notes.trim()
            });
            var next = [canonicalEntry].concat(list);
            S.saveNormalizedPrices(next);
            pd.coffee = '';
            pd.notes = '';
            ui.priceAddOpen = false;
            S.haptic('celebrate');
            S.toastSafe('Saved ' + canonicalEntry.coffee + ' to Shelf & Price Tracker!');
            repaint();
          }
        }, S.h('span', { text: 'Save Bag to Shelf & Tracker \u2192' }), S.iconEl('check-seal', { size: 18 }))
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

    var rows = list.map(function (b, idx) { return { b: b, idx: idx, ev: evaluateShelfBag(b, null) }; }).filter(function (it) {
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
      var ev = it.ev;
      var eq12oz = (ev.per100g * 3.40).toFixed(2);
      var chg = (typeof priceChange === 'function') ? priceChange(list, b) : { ok: false };
      var sym = b.sym || (b.currency === 'EUR' ? '\u20AC' : b.currency === 'GBP' ? '\u00A3' : b.currency === 'CAD' ? 'CA$' : b.currency === 'AUD' ? 'A$' : '$');

      wrap.appendChild(S.h('article', {
        class: 'bt-cellar-bag-card',
        style: '--bag-roast-color:' + S.roastColorFor(b.rlevel)
      },
        S.h('div', { class: 'bt-tc-row-between' },
          S.h('div', null,
            S.h('div', { class: 'bt-tc-kicker', text: [b.roaster || 'Roaster', b.date, b.rlevel].filter(Boolean).join(' \u00B7 ') }),
            S.h('b', { style: 'font-size:1rem;font-family:var(--font-display)', text: b.coffee }),
            S.h('div', { class: 'mono', style: 'font-size:0.79rem;color:var(--ink-secondary)', text: sym + b.price.toFixed(2) + ' / ' + b.size + b.unit + ' \u00B7 ' + sym + ev.perCup.toFixed(2) + '/15g cup \u00B7 ' + sym + eq12oz + ' per 12oz eq.' }),
            b.notes ? S.h('div', { style: 'font-size:0.77rem;color:var(--ink-muted);margin-top:2px', text: b.notes }) : null
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
              hydrateBrewFromRowOrBag(null, null, b);
              navigateToHomeRecipe();
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
    qrBox.innerHTML = art.qrSvg;

    return S.h('div', { class: 'bt-tc-sheet', style: 'display:flex;flex-direction:column;gap:12px' },
      S.h('div', { class: 'bt-sheet-back-bar' },
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
        S.h('b', { style: 'font-family:var(--font-display);font-size:1.15rem', text: art.title }),
        qrBox,
        S.h('div', { class: 'mono', style: 'font-size:0.74rem;word-break:break-all;color:var(--ink-secondary)', text: art.textCode })
      ),
      S.h('div', { class: 'bt-tc-pill-wrap', style: 'justify-content:center' },
        S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-active',
          text: 'Copy Share Code',
          onclick: function () {
            try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(art.textCode); } catch (_) {}
            S.toastSafe('Copied Brew Passport code to clipboard!');
          }
        }),
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
        })
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

    var kvPairs = [
      ['Date', r.cupping_date],
      ['Roaster', un(r.roaster)],
      ['Origin', un(r.origin)],
      ['Process', un(r.process)],
      ['Roast', un(r.roast_level)],
      ['Varietal', un(r.varietal)],
      ['Brewer', S.humanMethodName(un(r.brew_method))],
      ['Try #', r.brew_attempt],
      ['Dose : Water', (r.brew_dose_g || '\u2014') + ' g : ' + (r.brew_water_g || '\u2014') + ' g'],
      ['Ratio', r.brew_ratio ? ('1:' + r.brew_ratio) : ''],
      ['Grind', [un(r.brew_grind_setting), r.brew_grind_target_um ? (r.brew_grind_target_um + ' \u00B5m') : ''].filter(Boolean).join(' \u00B7 ')],
      ['Temp', r.brew_temp_c ? (r.brew_temp_c + ' \u00B0C') : (r.brew_temp_f ? (r.brew_temp_f + ' \u00B0F') : '')],
      ['Brew Time', timeSecs > 0 ? (S.fmtMmSs(timeSecs) + ' (' + timeSecs + 's)') : ''],
      ['Beverage Yield', r.brew_out_g ? (r.brew_out_g + ' g') : ''],
      ['Strength (%TDS) / Extraction (%EY)', r.brew_tds_pct ? (r.brew_tds_pct + '% / ' + (r.brew_ey_pct || '\u2014') + '%') : ''],
      ['Cupping Score', r.total_score ? (r.total_score + ' / 100') : ''],
      ['Flavors Liked', un(r.flavors_liked)],
      ['Bag Notes', un(r.bag_notes)]
    ].filter(function (p) { return !!p[1]; });

    return S.h('div', { class: 'bt-tc-sheet', id: 'bt-screen-detail', style: 'display:flex;flex-direction:column;gap:12px' },
      S.h('div', { class: 'bt-sheet-back-bar' },
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
        S.h('div', { style: 'display:flex;align-items:center;gap:8px' },
          isLocked ? buildGoldSealSvg(28) : null,
          S.h('div', null,
            S.h('div', { class: 'bt-tc-kicker', text: un(r.roaster) || 'Tasting Passport' }),
            S.h('h3', { style: 'margin:0;font-family:var(--font-display)', text: un(r.coffee_name) || 'Logged Cup' })
          )
        ),
        S.h('span', { class: 'bt-tc-badge is-good mono', text: r.my_rating_stars ? (r.my_rating_stars + ' / 5.00') : (r.total_score ? r.total_score + ' / 100' : 'Logged') })
      ),
      S.h('div', { class: 'bt-detail-kv-grid' },
        kvPairs.map(function (kv) {
          return S.h('div', { class: 'bt-detail-kv' }, S.h('span', { text: kv[0] }), S.h('b', { text: kv[1] }));
        })
      ),
      r.general_notes ? S.h('div', { class: 'bt-tc-well' },
        S.h('span', { class: 'bt-tc-kicker', text: 'Tasting Notes' }),
        S.h('div', { style: 'font-size:0.86rem', text: un(r.general_notes) })
      ) : null,
      S.h('div', { class: 'bt-tc-pill-wrap' },
        S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-active',
          text: 'Brew This Recipe \u2192',
          onclick: function () {
            hydrateBrewFromRowOrBag(r, null, null);
            S.closeSheetSafe();
            navigateToHomeRecipe();
          }
        }),
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
        })
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
    var coffeeEdit = {
      coffee_name: un(r.coffee_name),
      roaster: un(r.roaster),
      origin: un(r.origin),
      process: un(r.process),
      roast_level: un(r.roast_level),
      varietal: un(r.varietal),
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
        container.appendChild(S.h('div', { class: 'bt-tc-pill-scroll' },
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
                var res = storage.commitTastingEdit(rIdx, baseEdit);
                if (res && res.error) {
                  S.toastSafe(res.error);
                  return;
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
            ['Process', 'process'],
            ['Varietal', 'varietal'],
            ['Bag Notes', 'bag_notes']
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
