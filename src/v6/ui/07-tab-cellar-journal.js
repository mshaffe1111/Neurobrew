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
  var JOURNAL_PAGE_SIZE = 50;
  var PRICES_PAGE_SIZE = 50;
  var CAFE_PAGE_SIZE = 30;

  var FILTER_METHODS = {
    v60: 1, origami: 1, kalita: 1, orea: 1, pulsar: 1, chemex: 1,
    nel: 1, drip: 1, aiden: 1, xbloom: 1, switch: 1, clever: 1, phin: 1
  };
  var ESPRESSO_METHODS = {
    espresso: 1, lever_espresso: 1, moka: 1, philips5500: 1
  };
  var IMMERSION_COLD_METHODS = {
    aeropress: 1, press: 1, siphon: 1, turkish: 1, cold: 1, cold_drip: 1
  };

  var ui = {
    seg: 'shelf', /* 'shelf' | 'journal' | 'cafes' | 'prices' */
    cryoOpenMap: {},
    freshRolloverMap: {},
    thawTimers: {},
    reopenRemMap: {},
    frozenGrindOffset: true,
    confirmOverwriteKey: '',
    confirmOverwriteUntil: 0,
    journalQ: '',
    journalFilter: 'all',
    journalSort: 'newest',
    journalVisibleLimit: JOURNAL_PAGE_SIZE,
    journalBreakdownOpen: true,
    selectedCvaTrait: '',
    cuppingCompareOpen: true,
    cuppingCmpA: 0,
    cuppingCmpB: 1,
    compareIdxs: [],
    compareKeys: [],
    compareOnlyVaried: true,
    passportCodeInput: '',
    passportMsg: '',
    passportImportedOk: false,
    cafeCatKey: 'espresso_milk',
    cafeBoardTab: 'drinks', /* 'drinks' | 'shops' | 'favorites' */
    cafeSearchQ: '',
    cafeDrinksLimit: CAFE_PAGE_SIZE,
    cafeShopsLimit: CAFE_PAGE_SIZE,
    confirmCloneUntil: 0,
    lastSavedCafeDrink: null,
    lastSavedCafeKey: '',
    lastSavedCafeFromHistory: false,
    priceAddOpen: false,
    priceEditIdx: -1,
    priceShow: 'open', /* 'open' | 'finished' | 'all' */
    priceSort: 'use_first', /* 'use_first' | 'newest' | 'cheap' | 'name' */
    priceQ: '',
    priceVisibleLimit: PRICES_PAGE_SIZE,
    shelfQ: '',
    shelfFilter: 'all', /* 'all' | 'peak' | 'frozen' | 'golden' | 'low' */
    shelfSort: 'use_first', /* 'use_first' | 'cups_left' | 'newest' | 'name' */
    showAllBags: false,
    showAllTrails: false,
    trailsVisibleLimit: 12,
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

  var _rowJsonCache = typeof WeakMap === 'function' ? new WeakMap() : null;

  function _getRowCacheEntry(row) {
    if (!_rowJsonCache || !row || typeof row !== 'object') return null;
    var entry = _rowJsonCache.get(row);
    if (!entry) {
      entry = { hasAdap: false, rawAdap: null, adap: null, hasExtra: false, rawExtra: null, extra: null };
      _rowJsonCache.set(row, entry);
    }
    return entry;
  }

  function readRowAdapMetaSafe(row) {
    if (!row || typeof row !== 'object') return null;
    var raw = row.recipe_adaptation_json;
    if (!raw) return null;
    var cache = _getRowCacheEntry(row);
    if (cache && cache.hasAdap && cache.rawAdap === raw) return cache.adap;
    var parsed = null;
    try {
      var obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
      parsed = (obj && typeof obj === 'object' && !Array.isArray(obj)) ? obj : null;
    } catch (_) {
      parsed = null;
    }
    if (cache) {
      cache.hasAdap = true;
      cache.rawAdap = raw;
      cache.adap = parsed;
    }
    return parsed;
  }

  function readRowExtraMetaSafe(row) {
    if (!row || typeof row !== 'object') return null;
    var raw = row.extra_json;
    if (!raw) return null;
    var cache = _getRowCacheEntry(row);
    if (cache && cache.hasExtra && cache.rawExtra === raw) return cache.extra;
    var parsed = parseJsonObjSafe(raw);
    if (cache) {
      cache.hasExtra = true;
      cache.rawExtra = raw;
      cache.extra = parsed;
    }
    return parsed;
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

  function bagSizeToGrams(size, unit) {
    var s = parseFloat(size);
    if (!(s > 0 && isFinite(s))) return 0;
    var u = String(unit || 'g').trim().toLowerCase();
    if (u === 'lbs') u = 'lb';
    if (u === 'pods') return 0;
    if (typeof costGrams === 'function') {
      try {
        var cg = costGrams(s, u);
        if (isFinite(cg) && cg > 0) return cg;
      } catch (_) {}
    }
    var mult = u === 'oz' ? 28.349523125 : (u === 'lb' ? 453.59237 : (u === 'kg' ? 1000 : 1));
    return s * mult;
  }

  function safePosNumDisp(v, maxVal) {
    if (v === null || v === undefined || v === '') return '';
    var n = parseFloat(v);
    if (!isFinite(n) || n <= 0) return '';
    if (maxVal && n > maxVal) return '';
    return String(Math.round(n * 100) / 100);
  }

  function safeRowStarsNum(r) {
    if (!r || typeof r !== 'object') return 0;
    var st = parseFloat(r.my_rating_stars);
    if (!isFinite(st) || st <= 0) return 0;
    return Math.max(0.5, Math.min(5, Math.round(st * 100) / 100));
  }

  function safeRowScaNum(r) {
    if (!r || typeof r !== 'object') return 0;
    var sc = parseFloat(r.total_score);
    if (!isFinite(sc) || sc <= 0 || sc > 100) return 0;
    return Math.round(sc * 100) / 100;
  }

  function unifiedRowStars(r) {
    if (!r || typeof r !== 'object') return 0;
    var st = safeRowStarsNum(r);
    if (st > 0) return st;
    var sc = safeRowScaNum(r);
    if (sc >= 50) {
      return Math.max(1, Math.min(5, Math.round((1 + ((sc - 58) / 34) * 4) * 100) / 100));
    }
    return 0;
  }

  function rowTimestampKey(r) {
    if (!r || typeof r !== 'object') return '';
    var sa = String(r.saved_at || '').trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(sa)) return sa;
    var cd = String(r.cupping_date || r.brew_date || r.date || '').trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(cd)) return cd + 'T00:00:00Z';
    return sa || cd || '';
  }

  function stableRowKey(r, fallbackIdx) {
    if (!r || typeof r !== 'object') return 'idx:' + String(fallbackIdx);
    var rid = String(r.id || '').trim();
    if (rid) return 'id:' + rid;
    return 'sig:' + rowTimestampKey(r) + '|' + normCoffeeKeyPart(unneutCellar(r.coffee_name || '')) + '|' +
      normCoffeeKeyPart(unneutCellar(r.roaster || '')) + '|' + String(r.brew_method || '') + '|' +
      String(r.brew_dose_g || '') + '|' + String(r.brew_water_g || '') + '|' + String(r.brew_attempt || '') + '|' + String(fallbackIdx);
  }

  function resolveRowIdxSafe(rowOrIdx, hObjs) {
    var list = Array.isArray(hObjs) ? hObjs : S.getHistoryObjs();
    if (typeof rowOrIdx === 'number') {
      return (rowOrIdx >= 0 && rowOrIdx < list.length) ? rowOrIdx : -1;
    }
    if (!rowOrIdx || typeof rowOrIdx !== 'object') return -1;
    if (rowOrIdx._i != null && rowOrIdx._i >= 0 && rowOrIdx._i < list.length && list[rowOrIdx._i]) {
      if (!rowOrIdx.id || !list[rowOrIdx._i].id || list[rowOrIdx._i].id === rowOrIdx.id) {
        return rowOrIdx._i;
      }
    }
    var direct = list.indexOf(rowOrIdx);
    if (direct >= 0) return direct;
    var rid = String(rowOrIdx.id || '').trim();
    if (rid) {
      for (var i = 0; i < list.length; i++) {
        if (list[i] && String(list[i].id || '').trim() === rid) return i;
      }
    }
    return -1;
  }

  function sameCoffeeTarget(aObj, bObj) {
    if (!aObj || !bObj) return false;
    var aCid = isSyntheticCoffeeId(aObj.coffee_id || aObj.id) ? '' : String(aObj.coffee_id || aObj.id).trim();
    var bCid = isSyntheticCoffeeId(bObj.coffee_id || bObj.id) ? '' : String(bObj.coffee_id || bObj.id).trim();
    if (aCid && bCid && aCid === bCid) return true;
    var aName = normCoffeeKeyPart(unneutCellar(aObj.name || aObj.coffee_name || aObj.coffee || ''));
    var bName = normCoffeeKeyPart(unneutCellar(bObj.name || bObj.coffee_name || bObj.coffee || ''));
    if (!aName || !bName || aName !== bName) return false;
    var aRoast = normCoffeeKeyPart(unneutCellar(aObj.roaster || ''));
    var bRoast = normCoffeeKeyPart(unneutCellar(bObj.roaster || ''));
    return !aRoast || !bRoast || aRoast === bRoast;
  }

  function captureInventorySnapshot() {
    var aCur = S.getApp();
    var pListSnap = S.getNormalizedPrices().map(function (b) { return Object.assign({}, b); });
    var vListSnap = getCoffeesVaultSafe().map(function (v) { return Object.assign({}, v); });
    var appCoffeeSnap = (aCur && aCur.coffee) ? {
      id: aCur.coffee.id,
      coffee_id: aCur.coffee.coffee_id,
      name: aCur.coffee.name,
      roaster: aCur.coffee.roaster,
      remaining_g: aCur.coffee.remaining_g,
      bag_weight_g: aCur.coffee.bag_weight_g,
      bagWeightG: aCur.coffee.bagWeightG,
      openBag: aCur.coffee.openBag ? Object.assign({}, aCur.coffee.openBag) : null
    } : null;
    return { prices: pListSnap, vault: vListSnap, appCoffee: appCoffeeSnap };
  }

  function restoreInventorySnapshot(snap) {
    if (!snap) return;
    var st = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : null;
    if (Array.isArray(snap.prices)) {
      S.saveNormalizedPrices(snap.prices);
    }
    if (st && typeof st.saveCoffeesVaultList === 'function' && Array.isArray(snap.vault)) {
      try { st.saveCoffeesVaultList(snap.vault); } catch (_) {}
    }
    var aCur = S.getApp();
    if (snap.appCoffee && aCur && aCur.coffee && sameCoffeeTarget(snap.appCoffee, aCur.coffee)) {
      aCur.coffee.remaining_g = snap.appCoffee.remaining_g;
      if (snap.appCoffee.bag_weight_g !== undefined) aCur.coffee.bag_weight_g = snap.appCoffee.bag_weight_g;
      if (snap.appCoffee.bagWeightG !== undefined) aCur.coffee.bagWeightG = snap.appCoffee.bagWeightG;
      aCur.coffee.openBag = snap.appCoffee.openBag ? Object.assign({}, snap.appCoffee.openBag) : null;
      S.saveDraftSafe();
    }
  }

  function resolveRowBagMatchForInventory(row, pricesList, opts) {
    opts = opts || {};
    if (!row || typeof row !== 'object') return { matched: false, priceIdx: -1, vaultOnly: false };
    var pList = Array.isArray(pricesList) ? pricesList : S.getNormalizedPrices();
    var ad = readRowAdapMetaSafe(row) || {};
    var ej = readRowExtraMetaSafe(row) || {};
    var ce = (ad.coffee_extra && typeof ad.coffee_extra === 'object') ? ad.coffee_extra
      : ((ej.coffee_extra && typeof ej.coffee_extra === 'object') ? ej.coffee_extra : {});

    var explicitBagId = String(ad.priceBagId || ad.bag_deducted_bag_id || ce.priceBagId || ce.bag_deducted_bag_id || ej.priceBagId || row.priceBagId || '').trim();
    if (explicitBagId) {
      for (var i = 0; i < pList.length; i++) {
        if (pList[i] && String(pList[i].id || '').trim() === explicitBagId) {
          return { matched: true, priceIdx: i, bag: pList[i], vaultOnly: false };
        }
      }
      return { matched: false, priceIdx: -1, vaultOnly: false, reason: 'bag_deleted' };
    }

    if (!opts.allowCupping && String(row.brew_method || '').toLowerCase() === 'cupping') {
      return { matched: false, priceIdx: -1, vaultOnly: false, reason: 'cupping' };
    }

    var cleanCid = isSyntheticCoffeeId(row.coffee_id || row.id) ? '' : String(row.coffee_id || row.id).trim();
    var rName = normCoffeeKeyPart(unneutCellar(row.coffee_name || row.name || ''));
    var rRoast = normCoffeeKeyPart(unneutCellar(row.roaster || ''));
    if (!cleanCid && !rName) return { matched: false, priceIdx: -1, vaultOnly: false };

    var rowRoastIso = isIsoDateCellar(row.roast_date) ? String(row.roast_date).trim().slice(0, 10) : '';
    var rowDateIso = isIsoDateCellar(row.cupping_date) ? String(row.cupping_date).trim().slice(0, 10) : '';

    var bagMatchesIdentity = function (b) {
      if (!b || b.kind === 'pods' || b.unit === 'pods') return false;
      var bCid = isSyntheticCoffeeId(b.coffee_id) ? '' : String(b.coffee_id).trim();
      if (cleanCid && bCid && cleanCid === bCid) return true;
      var bName = normCoffeeKeyPart(unneutCellar(b.coffee || b.name || ''));
      var bRoast = normCoffeeKeyPart(unneutCellar(b.roaster || ''));
      return !!(rName && bName === rName && (!rRoast || !bRoast || bRoast === rRoast));
    };

    var bagDateCompatible = function (b) {
      var bRoastIso = isIsoDateCellar(b.roast) ? String(b.roast).trim().slice(0, 10) : '';
      var bBuyIso = isIsoDateCellar(b.date) ? String(b.date).trim().slice(0, 10) : '';
      if (rowRoastIso && bRoastIso && rowRoastIso !== bRoastIso) return false;
      if (rowDateIso && bRoastIso && bRoastIso > rowDateIso) return false;
      if (!bRoastIso && rowDateIso && bBuyIso && bBuyIso.length === 10 && bBuyIso > rowDateIso) return false;
      return true;
    };

    var matchingOpenIdx = -1;
    var matchingFinishedIdx = -1;
    var sawAnySameCoffeePriceBag = false;
    for (var j = 0; j < pList.length; j++) {
      var pb = pList[j];
      if (!bagMatchesIdentity(pb)) continue;
      sawAnySameCoffeePriceBag = true;
      if (!bagDateCompatible(pb)) continue;
      if (!pb.finished && matchingOpenIdx < 0) matchingOpenIdx = j;
      else if (pb.finished && matchingFinishedIdx < 0) matchingFinishedIdx = j;
    }

    if (matchingOpenIdx >= 0) {
      return { matched: true, priceIdx: matchingOpenIdx, bag: pList[matchingOpenIdx], vaultOnly: false };
    }
    if (opts.allowFinishedRefund && matchingFinishedIdx >= 0) {
      return { matched: true, priceIdx: matchingFinishedIdx, bag: pList[matchingFinishedIdx], vaultOnly: false };
    }
    if (sawAnySameCoffeePriceBag) {
      return { matched: false, priceIdx: -1, vaultOnly: false, reason: 'bag_mismatch' };
    }

    var vList = getCoffeesVaultSafe();
    for (var vi = 0; vi < vList.length; vi++) {
      var vr = vList[vi];
      if (!vr || vr.shelfArchived) continue;
      if (!sameCoffeeTarget(row, vr)) continue;
      var hasTracked = (vr.remaining_g != null && vr.remaining_g !== '' && isFinite(+vr.remaining_g)) || (+vr.bag_weight_g > 0);
      if (!hasTracked) continue;
      var vRoastIso = isIsoDateCellar(vr.roast_date) ? String(vr.roast_date).trim().slice(0, 10) : '';
      if (rowRoastIso && vRoastIso && rowRoastIso !== vRoastIso) continue;
      if (rowDateIso && vRoastIso && vRoastIso > rowDateIso) continue;
      return { matched: true, priceIdx: -1, bag: null, vaultOnly: true };
    }
    return { matched: false, priceIdx: -1, vaultOnly: false };
  }

  function setVaultShelfArchived(cid, name, roaster, archived, remG) {
    var st = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : null;
    if (!st || typeof st.saveCoffeesVaultList !== 'function') return;
    var cleanCid = isSyntheticCoffeeId(cid) ? '' : String(cid).trim();
    var nName = normCoffeeKeyPart(unneutCellar(name || ''));
    var nRoast = normCoffeeKeyPart(unneutCellar(roaster || ''));
    if (!cleanCid && !nName) return;
    var vList = getCoffeesVaultSafe().map(function (v) { return Object.assign({}, v); });
    var foundIdx = -1;
    for (var i = 0; i < vList.length; i++) {
      var vr = vList[i];
      if (!vr) continue;
      var vCid = isSyntheticCoffeeId(vr.coffee_id || vr.id) ? '' : String(vr.coffee_id || vr.id).trim();
      if (cleanCid && vCid && cleanCid === vCid) { foundIdx = i; break; }
      var vName = normCoffeeKeyPart(unneutCellar(vr.name || vr.coffee_name || vr.coffee || ''));
      var vRoast = normCoffeeKeyPart(unneutCellar(vr.roaster || ''));
      if (nName && vName === nName && (!nRoast || !vRoast || vRoast === nRoast)) { foundIdx = i; break; }
    }
    if (foundIdx >= 0) {
      if (archived) {
        vList[foundIdx].shelfArchived = true;
        if (remG != null && isFinite(+remG)) vList[foundIdx].remaining_g = Math.max(0, Math.round(+remG * 10) / 10);
      } else {
        delete vList[foundIdx].shelfArchived;
        if (remG != null && isFinite(+remG)) vList[foundIdx].remaining_g = Math.max(0, Math.round(+remG * 10) / 10);
      }
      vList[foundIdx].updatedAt = Date.now();
      try { st.saveCoffeesVaultList(vList); } catch (_) {}
    } else if (archived) {
      vList.push({
        id: cleanCid || ('cf_arch_' + Date.now().toString(36)),
        coffee_id: cleanCid || '',
        name: unneutCellar(name || ''),
        roaster: unneutCellar(roaster || ''),
        remaining_g: remG != null && isFinite(+remG) ? Math.max(0, Math.round(+remG * 10) / 10) : 0,
        shelfArchived: true,
        updatedAt: Date.now()
      });
      try { st.saveCoffeesVaultList(vList); } catch (_) {}
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
    var ej = readRowExtraMetaSafe(rowOrBag) || {};
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
    var ej = readRowExtraMetaSafe(row) || {};
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

    var nGrind = nr ? (unneutCellar(nr.grindSetting || '') || (+nr.grindUm > 0 ? (+nr.grindUm + ' \u00B5m') : (+nr.d50Um > 0 ? (+nr.d50Um + ' \u00B5m') : ''))) : '';
    var nTempC = nr ? (+nr.tempC > 0 ? Math.round(+nr.tempC) : (+nr.tempF > 0 ? Math.round((+nr.tempF - 32) * 5 / 9) : 0)) : 0;
    var nRatio = nr && +nr.ratio > 0 ? +nr.ratio : 0;
    var nAgit = nr && nr.agitation ? unneutCellar(nr.agitation) : '';

    var diffs = [];
    if (nGrind) {
      if (bGrind && bGrind !== nGrind) {
        var mB = bGrind.match(/^([\d.]+)\s*clicks$/i);
        var mN = nGrind.match(/^([\d.]+)\s*clicks$/i);
        var mDB = bGrind.match(/^Dial\s+([\d.]+)\s*\((\d+)c\)$/i);
        var mDN = nGrind.match(/^Dial\s+([\d.]+)\s*\((\d+)c\)$/i);
        if (mB && mN) diffs.push(mB[1] + ' \u2192 ' + mN[1] + ' clicks');
        else if (mDB && mDN) diffs.push('Dial ' + mDB[1] + ' \u2192 ' + mDN[1] + ' (' + mDB[2] + '\u2192' + mDN[2] + 'c)');
        else diffs.push(bGrind + ' \u2192 ' + nGrind);
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
    var st = unifiedRowStars(r);
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

  function _sortChronMatches(matches) {
    matches.sort(function (a, b) {
      var ta = rowTimestampKey(a.r);
      var tb = rowTimestampKey(b.r);
      if (ta !== tb) return ta.localeCompare(tb);
      var aa = +(a.r.brew_attempt) || 0;
      var ab = +(b.r.brew_attempt) || 0;
      if (aa !== ab) return aa - ab;
      return a.idx - b.idx;
    });
    return matches.map(function (m) { return m.r; });
  }

  function buildHistoryIndexByCoffee(hObjs) {
    var list = Array.isArray(hObjs) ? hObjs : [];
    var byCid = Object.create(null);
    var byNr = Object.create(null);
    var byName = Object.create(null);
    for (var i = 0; i < list.length; i++) {
      var r = list[i];
      if (!r || typeof r !== 'object') continue;
      var entry = { r: r, idx: i };
      var rCid = isSyntheticCoffeeId(r.coffee_id) ? '' : String(r.coffee_id).trim();
      var rName = normCoffeeKeyPart(unneutCellar(r.coffee_name || ''));
      var rRoast = normCoffeeKeyPart(unneutCellar(r.roaster || ''));
      if (rCid) {
        if (!byCid[rCid]) byCid[rCid] = [];
        byCid[rCid].push(entry);
      }
      if (rName) {
        var nrKey = rName + '|' + rRoast;
        if (!byNr[nrKey]) byNr[nrKey] = [];
        byNr[nrKey].push(entry);
        if (!byName[rName]) byName[rName] = [];
        byName[rName].push(entry);
      }
    }
    return { byCid: byCid, byNr: byNr, byName: byName, memo: Object.create(null) };
  }

  function getIndexedCoffeeHistory(histIdx, coffeeName, roaster, coffeeId) {
    if (!histIdx) return [];
    var cleanCid = isSyntheticCoffeeId(coffeeId) ? '' : String(coffeeId).trim();
    var nName = normCoffeeKeyPart(unneutCellar(coffeeName || ''));
    var nRoast = normCoffeeKeyPart(unneutCellar(roaster || ''));
    if (!cleanCid && !nName) return [];
    var memoKey = cleanCid + '::' + nName + '|' + nRoast;
    if (histIdx.memo[memoKey]) return histIdx.memo[memoKey];

    var seenIdx = Object.create(null);
    var matches = [];
    var addList = function (arr, filterRoast) {
      if (!arr) return;
      for (var i = 0; i < arr.length; i++) {
        var m = arr[i];
        if (seenIdx[m.idx]) continue;
        if (filterRoast) {
          var mr = normCoffeeKeyPart(unneutCellar(m.r.roaster || ''));
          if (nRoast && mr && mr !== nRoast) continue;
        }
        seenIdx[m.idx] = 1;
        matches.push(m);
      }
    };
    if (cleanCid) addList(histIdx.byCid[cleanCid], false);
    if (nName) {
      if (nRoast) {
        addList(histIdx.byNr[nName + '|' + nRoast], false);
        addList(histIdx.byNr[nName + '|'], false);
      } else {
        addList(histIdx.byName[nName], false);
      }
    }
    var sorted = _sortChronMatches(matches);
    histIdx.memo[memoKey] = sorted;
    return sorted;
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

    return _sortChronMatches(matches);
  }

  function buildDialInConvergenceTimeline(chronRows, currentRow, opts) {
    opts = opts || {};
    if (!Array.isArray(chronRows) || chronRows.length < 2) return null;
    var hasAnyGold = chronRows.some(function (tr) { return tr && (tr.dial_locked === 'yes' || tr.dial_locked === '1'); });
    var maxCompactNodes = opts.compact ? 5 : chronRows.length;
    var hiddenCount = (opts.compact && chronRows.length > maxCompactNodes) ? (chronRows.length - maxCompactNodes) : 0;
    var displayRows = hiddenCount > 0 ? chronRows.slice(hiddenCount) : chronRows;
    var nodes = [];
    if (hiddenCount > 0) {
      nodes.push(S.h('button', {
        type: 'button',
        class: 'bt-dial-node',
        style: 'min-width:0;max-width:100%;text-align:center',
        'aria-label': 'Inspect ' + hiddenCount + ' earlier dial-in tries',
        onclick: function (e) {
          if (e && e.stopPropagation) e.stopPropagation();
          openTastingDetailSheet(chronRows[0]);
        }
      },
        S.h('span', { class: 'mono', style: 'font-weight:800;font-size:0.74rem;color:var(--ink-secondary)', text: '+' + hiddenCount + ' earlier' })
      ));
      nodes.push(S.h('span', { class: 'bt-dial-arrow', 'aria-hidden': 'true', style: 'align-self:center;font-weight:800;color:var(--ink-muted)', text: '\u2192' }));
    }
    displayRows.forEach(function (tr, relIdx) {
      if (!tr) return;
      var origIdx = hiddenCount + relIdx;
      var tryNum = (+tr.brew_attempt > 0) ? Math.round(+tr.brew_attempt) : (origIdx + 1);
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
      if (relIdx < displayRows.length - 1) {
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

  function _buildListLookupMap(list, nameKeys, filterFn) {
    var byCid = Object.create(null);
    var byExact = Object.create(null);
    var byNameOnly = Object.create(null);
    var byNameAny = Object.create(null);
    if (!Array.isArray(list)) return { byCid: byCid, byExact: byExact, byNameOnly: byNameOnly, byNameAny: byNameAny };
    for (var i = 0; i < list.length; i++) {
      var it = list[i];
      if (!it || (filterFn && !filterFn(it, i))) continue;
      var ic = String(it.coffee_id || it.id || '').trim();
      if (ic && !isSyntheticCoffeeId(ic) && !byCid[ic]) byCid[ic] = it;
      var iname = '';
      for (var k = 0; k < nameKeys.length; k++) {
        if (it[nameKeys[k]]) { iname = normCoffeeKeyPart(unneutCellar(it[nameKeys[k]])); break; }
      }
      if (!iname) continue;
      var iroast = normCoffeeKeyPart(unneutCellar(it.roaster || ''));
      if (iroast) {
        var ek = iname + '|' + iroast;
        if (!byExact[ek]) byExact[ek] = it;
      } else {
        if (!byNameOnly[iname]) byNameOnly[iname] = it;
      }
      if (!byNameAny[iname]) byNameAny[iname] = it;
    }
    return { byCid: byCid, byExact: byExact, byNameOnly: byNameOnly, byNameAny: byNameAny };
  }

  function _queryLookupMap(map, cleanCid, nName, nRoast) {
    if (!map) return null;
    if (cleanCid && map.byCid[cleanCid]) return map.byCid[cleanCid];
    if (!nName) return null;
    if (nRoast && map.byExact[nName + '|' + nRoast]) return map.byExact[nName + '|' + nRoast];
    if (nRoast && map.byNameOnly[nName]) return map.byNameOnly[nName];
    if (!nRoast && map.byNameAny[nName]) return map.byNameAny[nName];
    return null;
  }

  function buildRecordsLookupIndex(unified, priceList, vaultList) {
    var openPrices = (Array.isArray(priceList) ? priceList : []).map(function (b, idx) {
      if (!b || b.finished) return null;
      return (b._priceIdx != null && b._priceIdx >= 0) ? b : Object.assign({ _priceIdx: idx }, b);
    }).filter(Boolean);
    return {
      vaultMap: _buildListLookupMap(vaultList, ['name', 'coffee_name', 'coffee']),
      unifiedMap: _buildListLookupMap(unified, ['name', 'coffee_name', 'coffee']),
      openPriceMap: _buildListLookupMap(openPrices, ['coffee', 'name', 'coffee_name'])
    };
  }

  function findCoffeeRecordsMatch(cid, rawName, rawRoaster, preloaded) {
    preloaded = preloaded || {};
    var storage = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : null;
    var cleanCid = isSyntheticCoffeeId(cid) ? '' : String(cid).trim();
    var nName = normCoffeeKeyPart(unneutCellar(rawName || ''));
    var nRoast = normCoffeeKeyPart(unneutCellar(rawRoaster || ''));

    if (preloaded.lookupIdx) {
      return {
        vaultRec: _queryLookupMap(preloaded.lookupIdx.vaultMap, cleanCid, nName, nRoast),
        uRec: _queryLookupMap(preloaded.lookupIdx.unifiedMap, cleanCid, nName, nRoast),
        priceBag: _queryLookupMap(preloaded.lookupIdx.openPriceMap, cleanCid, nName, nRoast)
      };
    }

    var findBest = function (list, nameKeys, openOnly) {
      if (!Array.isArray(list) || !list.length) return null;
      var activeList = openOnly
        ? list.map(function (it, idx) {
            if (!it || it.finished) return null;
            return (it._priceIdx != null && it._priceIdx >= 0) ? it : Object.assign({ _priceIdx: idx }, it);
          }).filter(Boolean)
        : list;
      if (!activeList.length) return null;
      if (cleanCid) {
        var cidHit = activeList.find(function (it) {
          if (!it) return false;
          var ic = String(it.coffee_id || it.id || '').trim();
          return !isSyntheticCoffeeId(ic) && ic === cleanCid;
        });
        if (cidHit) return cidHit;
      }
      if (!nName) return null;
      var exactHit = activeList.find(function (it) {
        if (!it) return false;
        var iname = '';
        for (var k = 0; k < nameKeys.length; k++) {
          if (it[nameKeys[k]]) { iname = normCoffeeKeyPart(unneutCellar(it[nameKeys[k]])); break; }
        }
        var iroast = normCoffeeKeyPart(unneutCellar(it.roaster || ''));
        return iname === nName && nRoast && iroast === nRoast;
      });
      if (exactHit) return exactHit;
      return activeList.find(function (it) {
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
      vaultRec: findBest(vaultList, ['name', 'coffee_name', 'coffee'], false),
      uRec: findBest(unifiedList, ['name', 'coffee_name', 'coffee'], false),
      priceBag: findBest(priceList, ['coffee', 'name', 'coffee_name'], true)
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
    var ej = readRowExtraMetaSafe(r) || {};
    var ce = (ad && ad.coffee_extra && typeof ad.coffee_extra === 'object') ? ad.coffee_extra
      : ((ej && ej.coffee_extra && typeof ej.coffee_extra === 'object') ? ej.coffee_extra : (parseJsonObjSafe(r && r.coffee_extra) || {}));
    var rowBlendInfo = extractRowBlendInfo(r);
    if (!rowBlendInfo.isBlend) {
      var fallbackBlend = extractRowBlendInfo(v);
      if (!fallbackBlend.isBlend) fallbackBlend = extractRowBlendInfo(u);
      if (!fallbackBlend.isBlend) fallbackBlend = extractRowBlendInfo(b);
      if (fallbackBlend.isBlend) rowBlendInfo = fallbackBlend;
    }
    var sh = S.getShell();
    var freshBase = (sh && typeof sh.newCoffee === 'function')
      ? sh.newCoffee()
      : (typeof newCoffee === 'function' ? newCoffee() : {});
    var hasExplicitBag = !!(bag && typeof bag === 'object');
    var explicitBagPriceIdx = (hasExplicitBag && Number.isInteger(bag._priceIdx) && bag._priceIdx >= 0) ? bag._priceIdx : -1;
    var resolvedPriceIdx = explicitBagPriceIdx >= 0
      ? explicitBagPriceIdx
      : ((b && Number.isInteger(b._priceIdx) && b._priceIdx >= 0 && !b.finished) ? b._priceIdx
        : ((pb && Number.isInteger(pb._priceIdx) && pb._priceIdx >= 0 && !pb.finished) ? pb._priceIdx
          : ((u.openBag && Number.isInteger(u.openBag.bagIndex) && u.openBag.bagIndex >= 0) ? u.openBag.bagIndex : -1)));

    var finalCid = '';
    [u.coffee_id, v.coffee_id, v.id, r.coffee_id, b.coffee_id, (!isSyntheticCoffeeId(b.id) ? b.id : '')].some(function (cand) {
      if (cand && !isSyntheticCoffeeId(cand)) { finalCid = String(cand).trim(); return true; }
      return false;
    });
    if (!finalCid) finalCid = 'cf_' + Date.now().toString(36);

    var bagLevelFromB = pickRichStr(b.rlevel, (!isIsoDateCellar(b.roast) ? b.roast : ''), pb.rlevel);
    var rawRoast = pickRichStr(hasExplicitBag ? bagLevelFromB : '', v.roast, u.roast, r.roast_level, bagLevelFromB);
    var normRoast = rawRoast ? ((typeof resolveRoast === 'function' ? resolveRoast(rawRoast) : '') || rawRoast.toLowerCase()) : 'light';

    var rawProc = pickRichStr(hasExplicitBag ? b.process : '', v.process, u.process, r.process, b.process, pb.process);
    var normProc = rawProc ? ((typeof resolveProcess === 'function' ? resolveProcess(rawProc) : '') || rawProc.toLowerCase()) : '';

    var bagNotesVal = pickRichStr(
      hasExplicitBag ? (b.bag_notes || b.notes) : '',
      v.bag_notes, v.notes, v.flavors,
      u.bag_notes, u.notes, u.flavors,
      r.bag_notes,
      b.bag_notes, b.bagNotes, b.flavors, b.tasting_notes, b.notes,
      pb.bag_notes, pb.notes
    );

    var elevRaw = pickRichStr(hasExplicitBag ? b.elevation_m : '', v.elevation_m, u.elevation_m, r.elevation_m, b.elevation_m, pb.elevation_m, ce.elevation_m);
    var elevNum = parseInt(String(elevRaw).replace(/[^0-9]/g, ''), 10);
    var finalElevM = (isFinite(elevNum) && elevNum >= 100 && elevNum <= 3600) ? String(elevNum) : (elevRaw || '');
    var finalElevText = pickRichStr(v.elevText, u.elevText, b.elevText) || (finalElevM ? (finalElevM + ' masl') : '');
    var finalDensity = pickRichStr(v.density, u.density, r.elevation_class, b.density) ||
      ((finalElevM && typeof resolveDensity === 'function') ? (resolveDensity('', finalElevM) || '') : '');

    var explicitFrozen = explicitBagPriceIdx >= 0
      ? (bag.is_frozen === 'yes' ? 'yes' : '')
      : ((v && v.shelfUnfrozen) ? ''
        : ((hasExplicitBag && bag.is_frozen === 'yes') ? 'yes'
          : ((v.is_frozen === 'yes' || u.is_frozen === 'yes' || r.is_frozen === 'yes' || b.is_frozen === 'yes' || pb.is_frozen === 'yes') ? 'yes' : '')));
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

    var bSizeG = (b.unit !== 'pods' && b.kind !== 'pods') ? (Math.round(bagSizeToGrams(b.size, b.unit) * 10) / 10 || null) : null;
    var pbSizeG = (pb.unit !== 'pods' && pb.kind !== 'pods') ? (Math.round(bagSizeToGrams(pb.size, pb.unit) * 10) / 10 || null) : null;
    var bagWeightG = hasExplicitBag
      ? pickPosNum(bSizeG, b.bag_weight_g, v.bag_weight_g, u.bag_weight_g, ce.bag_weight_g, (u.openBag && u.openBag.total_g), pbSizeG)
      : pickPosNum(v.bag_weight_g, u.bag_weight_g, ce.bag_weight_g, (u.openBag && u.openBag.total_g), bSizeG, b.bag_weight_g, pbSizeG);
    var remG = hasExplicitBag
      ? pickNonNegNum(b.rem_g, v.remaining_g, u.remaining_g, (u.openBag && u.openBag.rem_g), ce.remaining_g, pb.rem_g)
      : pickNonNegNum((!b.finished ? b.rem_g : null), v.remaining_g, u.remaining_g, (u.openBag && u.openBag.rem_g), ce.remaining_g, (!pb.finished ? pb.rem_g : null));
    var priceVal = hasExplicitBag
      ? pickPosNum(!b._priceUnlisted ? b.price : null, v.price, u.price, ce.price, (u.openBag && u.openBag.price), pb.price)
      : pickPosNum(!b._priceUnlisted ? b.price : null, v.price, u.price, ce.price, (u.openBag && u.openBag.price), pb.price);
    var currVal = pickRichStr(b.currency, b.sym, v.currency, u.currency, ce.currency, pb.currency, pb.sym);

    var nextC = Object.assign({}, freshBase, {
      id: finalCid,
      coffee_id: finalCid,
      name: pickRichStr(hasExplicitBag ? (b.coffee || b.name) : '', v.name, u.name, r.coffee_name, b.coffee, b.name, pb.coffee),
      roaster: pickRichStr(hasExplicitBag ? b.roaster : '', v.roaster, u.roaster, r.roaster, b.roaster, pb.roaster),
      roaster_location: pickRichStr(v.roaster_location, u.roaster_location, ce.roaster_location, b.roaster_location),
      bag_notes: bagNotesVal,
      notes: bagNotesVal,
      origin: pickRichStr(hasExplicitBag ? b.origin : '', v.origin, u.origin, r.origin, b.origin, pb.origin, ce.origin),
      region: pickRichStr(hasExplicitBag ? b.region : '', v.region, u.region, ce.region, b.region, pb.region),
      farm: pickRichStr(v.farm, u.farm, ce.farm, b.farm),
      farm_or_station: pickRichStr(v.farm_or_station, u.farm_or_station, ce.farm_or_station, v.farm, u.farm, b.farm_or_station),
      producer: pickRichStr(v.producer, u.producer, ce.producer, b.producer),
      harvest_year: pickRichStr(v.harvest_year, u.harvest_year, ce.harvest_year, b.harvest_year),
      varietal: pickRichStr(hasExplicitBag ? b.varietal : '', v.varietal, u.varietal, r.varietal, b.varietal, pb.varietal),
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
      bagWeightG: bagWeightG != null ? bagWeightG : '',
      remaining_g: remG != null ? remG : '',
      price: priceVal != null ? priceVal : '',
      bagPrice: priceVal != null ? priceVal : '',
      currency: currVal || '$',
      openBag: (resolvedPriceIdx >= 0 && !(b && b.finished) && !(b && (b.unit === 'pods' || b.kind === 'pods'))) ? {
        bagIndex: resolvedPriceIdx,
        id: (b && b.id) || (pb && pb.id) || '',
        coffee: pickRichStr(hasExplicitBag ? (b.coffee || b.name) : '', v.name, u.name, r.coffee_name, b.coffee, b.name, pb.coffee),
        roaster: pickRichStr(hasExplicitBag ? b.roaster : '', v.roaster, u.roaster, r.roaster, b.roaster, pb.roaster),
        rem_g: remG != null ? remG : (bagWeightG || 250),
        total_g: bagWeightG || 250,
        roast: bestRoastDate,
        price: priceVal != null ? priceVal : ''
      } : null,
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
        a.dialNote = null;
      }

      if (a.brew.dialAdaptation && a.brew.dialAdaptation.adapted) {
        a.dialNote = {
          symptom: a.brew.dialAdaptation.symptom || rowDialSym,
          change: [a.brew.dialAdaptation.headline || a.brew.dialAdaptation.summaryBanner || rowDialChange].filter(Boolean),
          fromId: (anchor && anchor.id) || ''
        };
      }
    }

    a.attempt = (resolvedU && +resolvedU.n_cups > 0) ? +resolvedU.n_cups : ((anchor && +anchor.brew_attempt > 0) ? +anchor.brew_attempt : 0);
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
    var isPriceBag = (bag._priceIdx != null && bag._priceIdx >= 0);
    var rawAge = S.daysSinceIso(bag.roast || (unifiedRec && unifiedRec.roast_date));
    var isFrozen = isPriceBag
      ? (bag.is_frozen === 'yes')
      : (bag.is_frozen === 'yes' || (bag.is_frozen == null && !!(unifiedRec && unifiedRec.is_frozen === 'yes')));
    var frozenDateSrc = isPriceBag ? bag.frozen_date : (bag.frozen_date || (unifiedRec && unifiedRec.frozen_date));
    var frozenAge = isFrozen ? S.daysSinceIso(frozenDateSrc) : null;
    var unit = String(bag.unit || (bag.kind === 'pods' ? 'pods' : 'g')).trim().toLowerCase();
    if (unit === 'lbs') unit = 'lb';
    var isPods = (unit === 'pods' || bag.kind === 'pods');

    var totalUnits = isPods
      ? ((+bag.size > 0 && isFinite(+bag.size)) ? Math.round(+bag.size) : 10)
      : (bagSizeToGrams(+bag.size || 250, unit) || 250);
    var totalG = totalUnits;
    var rawRem = (bag.rem_g != null && bag.rem_g !== '' && isFinite(+bag.rem_g)) ? +bag.rem_g : totalG;
    var remG = Math.max(0, rawRem);

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

    var lastBrewDose = (unifiedRec && unifiedRec.lastBrew && +unifiedRec.lastBrew.dose > 0)
      ? +unifiedRec.lastBrew.dose
      : ((unifiedRec && unifiedRec.latestBrew && +unifiedRec.latestBrew.brew_dose_g > 0) ? +unifiedRec.latestBrew.brew_dose_g : 0);
    var doseRef = isPods
      ? 1
      : ((+bag.dose > 0 && isFinite(+bag.dose)) ? +bag.dose : (lastBrewDose > 0 ? lastBrewDose : 15));

    var hasPrice = (+bag.price > 0 && isFinite(+bag.price) && !bag._priceUnlisted);
    var perCup = (hasPrice && totalG > 0)
      ? (isPods ? (+bag.price / totalG) : ((+bag.price / totalG) * doseRef))
      : null;
    var per100g = (!isPods && hasPrice && totalG > 0)
      ? ((+bag.price / totalG) * 100)
      : null;

    var isEmptyBag = remG <= 0.4;
    var oddTail = (!isPods && !isEmptyBag && remG >= 5 && remG < Math.min(14.5, doseRef))
      ? { remG: Math.round(remG * 10) / 10, waterG: Math.round(remG * 16.2) }
      : null;

    var thawMin = Math.max(12, Math.round(26 * Math.pow(Math.max(40, isPods ? remG * 6 : remG) / 250, 0.67)));

    var cupsLeft = isEmptyBag ? 0 : Math.floor(remG / Math.max(1, doseRef));
    var isLowBag = !isEmptyBag && (isPods ? (remG <= 2) : (remG < doseRef * 2));
    var inPeak = effAge != null && effAge >= restEnd && effAge <= peakEnd;
    var pctLeft = isEmptyBag ? 0 : Math.max(3, Math.min(100, Math.round((remG / Math.max(1, totalG)) * 100)));

    return {
      unit: unit,
      isPods: isPods,
      hasPrice: hasPrice,
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
      pctLeft: pctLeft,
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
      return String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
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
    /* Call with no args so BTStorage._unifiedIndexCache hits in O(1) */
    var unified = (storage && typeof storage.buildUnifiedCoffeesIndex === 'function')
      ? storage.buildUnifiedCoffeesIndex()
      : [];
    var vaultList = getCoffeesVaultSafe();
    var histIdx = buildHistoryIndexByCoffee(hObjs);
    var lookupIdx = buildRecordsLookupIndex(unified, priceList, vaultList);

    var wrap = S.h('div', { style: 'display:flex;flex-direction:column;gap:14px' });

    /* 0. Last Cup Quick-Jump & Best/Golden Recipes Hall-of-Fame Strip */
    var shelfLastCup = buildLastCupJumpBar(hObjs);
    if (shelfLastCup) wrap.appendChild(shelfLastCup);
    var goldenShowcase = buildGoldenShowcaseSection(hObjs);
    if (goldenShowcase) wrap.appendChild(goldenShowcase);

    /* A. Active Dial-In Trail Sparklines (sorted by most recent brew first!) */
    var trailGroups = Object.create(null);
    hObjs.forEach(function (r, rIdx) {
      if (!r || !r.coffee_name) return;
      var cClean = unneutCellar(r.coffee_name);
      var rClean = unneutCellar(r.roaster || '');
      var mKey = (typeof resolveMethod === 'function' ? resolveMethod(r.brew_method) : '') || String(r.brew_method || 'v60').toLowerCase();
      var cleanCid = isSyntheticCoffeeId(r.coffee_id) ? '' : String(r.coffee_id).trim();
      var gk = (cleanCid || (normCoffeeKeyPart(cClean) + '|' + normCoffeeKeyPart(rClean))) + '::' + mKey;
      var ts = rowTimestampKey(r);
      if (!trailGroups[gk]) {
        trailGroups[gk] = { key: gk, coffee: cClean, roaster: rClean, method: mKey, rows: [], latestTs: ts, latestIdx: rIdx };
      }
      trailGroups[gk].rows.push(r);
      if (ts > trailGroups[gk].latestTs || (ts === trailGroups[gk].latestTs && rIdx > trailGroups[gk].latestIdx)) {
        trailGroups[gk].latestTs = ts;
        trailGroups[gk].latestIdx = rIdx;
      }
    });

    var trailKeys = Object.keys(trailGroups).sort(function (aKey, bKey) {
      var ga = trailGroups[aKey], gb = trailGroups[bKey];
      if (ga.latestTs !== gb.latestTs) return gb.latestTs.localeCompare(ga.latestTs);
      return gb.latestIdx - ga.latestIdx;
    });
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

      var trailCap = ui.showAllTrails ? Math.min(trailKeys.length, ui.trailsVisibleLimit || 12) : 1;
      var visibleTrails = trailKeys.slice(0, trailCap);
      visibleTrails.forEach(function (tk) {
        var grp = trailGroups[tk];
        var chron = grp.rows.slice().sort(function (x, y) {
          return rowTimestampKey(x).localeCompare(rowTimestampKey(y));
        });
        var lockedRow = chron.find(function (r) { return r.dial_locked === 'yes' || r.dial_locked === '1'; }) || null;
        var latest = chron[chron.length - 1];
        var trailText = chron.map(function (r, idx) {
          var st = unifiedRowStars(r);
          var isL = r.dial_locked === 'yes' || r.dial_locked === '1';
          return 'Try #' + (idx + 1) + ' (' + (st > 0 ? st.toFixed(2) : 'Logged') + (isL ? ' Gold' : '') + ')';
        }).join(' \u2192 ');

        var sparkEl = S.h('div');
        if (ck && typeof ck.dialInSparklineSvg === 'function') {
          try {
            var pts = chron.map(function (r, idx) {
              return {
                val: unifiedRowStars(r) || 3.8,
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
                var trailMatched = findCoffeeRecordsMatch(latest && latest.coffee_id, grp.coffee, grp.roaster, { lookupIdx: lookupIdx });
                var trailURec = trailMatched.uRec || {
                  coffee_id: (latest && latest.coffee_id) || '',
                  name: grp.coffee,
                  roaster: grp.roaster,
                  lockedBrew: lockedRow,
                  latestBrew: latest
                };
                hydrateBrewFromRowOrBag(lockedRow || null, trailURec, trailMatched.priceBag || null);
                navigateToHomeRecipe();
              }
            })
          ),
          sparkEl
        ));
      });
      if (trailKeys.length > 1) {
        var trailCtrlRow = S.h('div', { class: 'bt-tc-pill-wrap' },
          S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-compact is-soft',
            text: ui.showAllTrails ? 'Show top trail only' : ('Show all ' + trailKeys.length + ' trails \u2192'),
            onclick: function () {
              ui.showAllTrails = !ui.showAllTrails;
              if (ui.showAllTrails && ui.trailsVisibleLimit < 12) ui.trailsVisibleLimit = 12;
              S.haptic('tick');
              repaint();
            }
          }),
          (ui.showAllTrails && trailKeys.length > trailCap) ? S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-compact is-copper',
            text: 'Load more (' + trailCap + ' of ' + trailKeys.length + ')',
            onclick: function () {
              ui.trailsVisibleLimit = trailCap + 12;
              S.haptic('tick');
              repaint();
            }
          }) : null
        );
        trailSec.appendChild(trailCtrlRow);
      }
      wrap.appendChild(trailSec);
    }

    /* B. Open Shelf Bags + Freshness + Collapsed Freezer Vault + Fresh Bag + Real QR */
    var openBags = [];
    var openCidSet = Object.create(null);
    var openNrSet = Object.create(null);
    var openNameSet = Object.create(null);
    var finishedCidSet = Object.create(null);
    var finishedNrSet = Object.create(null);
    var finishedNameSet = Object.create(null);

    var registerBagKeys = function (cidSet, nrSet, nameSet, cid, name, roaster) {
      var cleanCid = isSyntheticCoffeeId(cid) ? '' : String(cid).trim();
      var nName = normCoffeeKeyPart(unneutCellar(name || ''));
      var nRoast = normCoffeeKeyPart(unneutCellar(roaster || ''));
      if (cleanCid) cidSet[cleanCid] = 1;
      if (nName) {
        nrSet[nName + '|' + nRoast] = 1;
        if (!nRoast) nameSet[nName] = 1;
      }
    };
    var matchesKeySets = function (cidSet, nrSet, nameSet, cid, name, roaster) {
      var cleanCid = isSyntheticCoffeeId(cid) ? '' : String(cid).trim();
      if (cleanCid && cidSet[cleanCid]) return true;
      var nName = normCoffeeKeyPart(unneutCellar(name || ''));
      if (!nName) return false;
      var nRoast = normCoffeeKeyPart(unneutCellar(roaster || ''));
      if (nrSet[nName + '|' + nRoast]) return true;
      if (nRoast && nameSet[nName]) return true;
      if (!nRoast) {
        if (nameSet[nName]) return true;
        var prefix = nName + '|';
        var ks = Object.keys(nrSet);
        for (var ki = 0; ki < ks.length; ki++) {
          if (ks[ki].indexOf(prefix) === 0) return true;
        }
      }
      return false;
    };

    priceList.forEach(function (b, idx) {
      if (!b) return;
      if (!b.finished) {
        var entry = Object.assign({ _priceIdx: idx }, b);
        openBags.push(entry);
        registerBagKeys(openCidSet, openNrSet, openNameSet, b.coffee_id || b.id, b.coffee, b.roaster);
      } else {
        registerBagKeys(finishedCidSet, finishedNrSet, finishedNameSet, b.coffee_id || b.id, b.coffee, b.roaster);
      }
    });

    /* Track Vault-archived (finished/deleted) coffees so they never respawn via unified/vault fallback */
    vaultList.forEach(function (vr) {
      if (!vr || !vr.name) return;
      if (vr.shelfArchived === true) {
        registerBagKeys(finishedCidSet, finishedNrSet, finishedNameSet, vr.coffee_id || vr.id, vr.name, vr.roaster);
      }
    });

    var isBlendRecord = function (rec) {
      if (!rec || typeof rec !== 'object') return false;
      if (rec.isBlend === true || rec.isBlend === 'yes') return true;
      if (/^blend_/i.test(String(rec.coffee_id || rec.id || ''))) return true;
      if (Array.isArray(rec.blendComponents) && rec.blendComponents.length >= 2) return true;
      return false;
    };

    unified.forEach(function (u) {
      if (!u || !u.name) return;
      if (isBlendRecord(u)) return;
      if (matchesKeySets(openCidSet, openNrSet, openNameSet, u.coffee_id, u.name, u.roaster)) return;
      if (matchesKeySets(finishedCidSet, finishedNrSet, finishedNameSet, u.coffee_id, u.name, u.roaster)) return;
      if (openBags.length >= SHELF_MAX_BAGS) return;
      var uMatchV = findCoffeeRecordsMatch(u.coffee_id, u.name, u.roaster, { lookupIdx: lookupIdx }).vaultRec;
      var uUnfrozen = !!(uMatchV && uMatchV.shelfUnfrozen === true);
      var uPrice = (+u.price > 0 ? +u.price : (u.openBag && +u.openBag.price > 0 ? +u.openBag.price : 0));
      var uSize = +u.bag_weight_g || (u.openBag && +u.openBag.total_g) || 250;
      var uRem = (u.openBag && u.openBag.rem_g != null && isFinite(+u.openBag.rem_g))
        ? Math.max(0, +u.openBag.rem_g)
        : ((u.remaining_g != null && u.remaining_g !== '' && isFinite(+u.remaining_g)) ? Math.max(0, +u.remaining_g) : uSize);
      openBags.push({
        _priceIdx: -1,
        _unifiedRec: u,
        _priceUnlisted: !(uPrice > 0),
        id: u.coffee_id || ('uf_' + openBags.length),
        coffee_id: u.coffee_id || '',
        coffee: u.name,
        roaster: u.roaster || '',
        size: uSize,
        unit: 'g',
        price: uPrice,
        currency: u.currency || '$',
        rlevel: u.roast || 'light',
        roast: u.roast_date || '',
        rem_g: uRem,
        is_frozen: uUnfrozen ? '' : (u.is_frozen || ''),
        frozen_date: uUnfrozen ? '' : (u.frozen_date || ''),
        bag_notes: u.bag_notes || '',
        origin: u.origin || '',
        region: u.region || '',
        process: u.process || '',
        varietal: u.varietal || '',
        elevation_m: u.elevation_m || ''
      });
      registerBagKeys(openCidSet, openNrSet, openNameSet, u.coffee_id, u.name, u.roaster);
    });

    vaultList.forEach(function (vr) {
      if (!vr || !vr.name) return;
      if (isBlendRecord(vr) || vr.shelfArchived === true) return;
      if (matchesKeySets(openCidSet, openNrSet, openNameSet, vr.coffee_id || vr.id, vr.name, vr.roaster)) return;
      if (matchesKeySets(finishedCidSet, finishedNrSet, finishedNameSet, vr.coffee_id || vr.id, vr.name, vr.roaster)) return;
      if (openBags.length >= SHELF_MAX_BAGS) return;
      var vPrice = +vr.price > 0 ? +vr.price : 0;
      var vSize = +vr.bag_weight_g || 250;
      var vRem = (vr.remaining_g != null && vr.remaining_g !== '' && isFinite(+vr.remaining_g)) ? Math.max(0, +vr.remaining_g) : vSize;
      openBags.push({
        _priceIdx: -1,
        _vaultRec: vr,
        _priceUnlisted: !(vPrice > 0),
        id: vr.coffee_id || vr.id || ('uf_' + openBags.length),
        coffee_id: vr.coffee_id || vr.id || '',
        coffee: vr.name,
        roaster: vr.roaster || '',
        size: vSize,
        unit: 'g',
        price: vPrice,
        currency: vr.currency || '$',
        rlevel: vr.roast || 'light',
        roast: vr.roast_date || '',
        rem_g: vRem,
        is_frozen: vr.shelfUnfrozen ? '' : (vr.is_frozen || ''),
        frozen_date: vr.shelfUnfrozen ? '' : (vr.frozen_date || ''),
        bag_notes: vr.bag_notes || vr.notes || '',
        origin: vr.origin || '',
        region: vr.region || '',
        process: vr.process || '',
        varietal: vr.varietal || '',
        elevation_m: vr.elevation_m || ''
      });
      registerBagKeys(openCidSet, openNrSet, openNameSet, vr.coffee_id || vr.id, vr.name, vr.roaster);
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

    /* Shelf Search / Filter / Sort pre-pass (evaluates every bag ONCE in O(M), reused inside buildBagCard) */
    var shelfMeta = openBags.map(function (bag, bIdx) {
      var mb = findCoffeeRecordsMatch(bag.coffee_id || bag.id, bag.coffee, bag.roaster, { lookupIdx: lookupIdx });
      var uR = bag._unifiedRec || mb.uRec || null;
      var vR = bag._vaultRec || mb.vaultRec || null;
      var e = evaluateShelfBag(bag, uR || vR);
      var hay = [
        bag.coffee, bag.roaster, bag.origin, bag.region, bag.process, bag.varietal, bag.rlevel, bag.bag_notes, bag.notes,
        vR && vR.origin, vR && vR.bag_notes, vR && vR.notes, vR && vR.process,
        uR && uR.origin, uR && uR.bag_notes, uR && uR.process
      ].filter(Boolean).join(' ').toLowerCase();
      return { bag: bag, bIdx: bIdx, ev: e, uRec: uR, vRec: vR, golden: !!(uR && uR.lockedBrew), hay: hay };
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
      var toks = q ? q.split(/\s+/).filter(Boolean) : [];
      var list = shelfMeta.filter(function (m) {
        if (ui.shelfFilter === 'peak' && !(m.ev.inPeak && !m.ev.isEmpty)) return false;
        if (ui.shelfFilter === 'frozen' && !m.ev.isFrozen) return false;
        if (ui.shelfFilter === 'golden' && !m.golden) return false;
        if (ui.shelfFilter === 'low' && !(m.ev.isLowBag || m.ev.isEmpty)) return false;
        if (!toks.length) return true;
        return toks.every(function (tok) { return m.hay.indexOf(tok) >= 0; });
      });
      list.sort(function (x, y) {
        var r = 0;
        if (ui.shelfSort === 'cups_left') {
          r = x.ev.cupsLeft - y.ev.cupsLeft || (x.ev.remG - y.ev.remG);
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
      shelfCountEl.textContent = 'Showing ' + cap + ' of ' + vis.length + (vis.length !== openBags.length ? (' matching (' + openBags.length + ' total)') : '') + ' bag' + (openBags.length === 1 ? '' : 's');
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
          onclick: function () { ui.showAllBags = !ui.showAllBags; S.haptic('tick'); paintShelfList(); }
        }));
      }
    }

    var shelfSearchTimer = null;
    var shelfInput = S.h('input', {
      type: 'search',
      class: 'bt-tc-search',
      placeholder: 'Search shelf by coffee, roaster, origin, or flavor note...',
      value: ui.shelfQ,
      'aria-label': 'Search open bags on shelf',
      oninput: function (e) {
        ui.shelfQ = e.target.value;
        shelfClear.style.display = ui.shelfQ ? '' : 'none';
        clearTimeout(shelfSearchTimer);
        shelfSearchTimer = setTimeout(paintShelfList, 120);
      }
    });
    var shelfClear = S.h('button', {
      type: 'button',
      class: 'bt-tc-search-clear no-print',
      'aria-label': 'Clear shelf search',
      style: 'display:' + (ui.shelfQ ? '' : 'none') + ';background:none;border:0;font-size:1.25rem;line-height:1;min-width:32px;min-height:32px;cursor:pointer;color:var(--ink-secondary)',
      text: '\u00D7',
      onclick: function () {
        clearTimeout(shelfSearchTimer);
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
      var uRec = meta.uRec || null;
      var vRec = meta.vRec || null;
      var ev = meta.ev;
      var bagKey = bag.id || (bag.coffee + '_' + bIdx);
      var isLocked = meta.golden;
      var pullDose = ev.doseRef;

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
      var vaultIdForBag = (uRec && uRec.coffee_id) || (vRec && (vRec.coffee_id || vRec.id)) || (!isSyntheticCoffeeId(bag.coffee_id) ? bag.coffee_id : '');

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
                var nextFrzDate = nextFrz ? S.isoDaysAgo(0) : '';
                if (bag._priceIdx >= 0) {
                  var list = S.getNormalizedPrices();
                  if (list[bag._priceIdx]) {
                    list[bag._priceIdx].is_frozen = nextFrz;
                    list[bag._priceIdx].frozen_date = nextFrzDate;
                    S.saveNormalizedPrices(list);
                  }
                } else {
                  /* Direct write to existing open Prices entry if present; otherwise Vault-only (NO $20 fabrication, NO applyFreshBagRoastDate, NO refill, NO overwriting app.coffee) */
                  var pCur = S.getNormalizedPrices();
                  var existingOpenIdx = -1;
                  for (var pi = 0; pi < pCur.length; pi++) {
                    if (pCur[pi] && !pCur[pi].finished && sameCoffeeTarget(pCur[pi], bag)) { existingOpenIdx = pi; break; }
                  }
                  if (existingOpenIdx >= 0) {
                    pCur[existingOpenIdx].is_frozen = nextFrz;
                    pCur[existingOpenIdx].frozen_date = nextFrzDate;
                    S.saveNormalizedPrices(pCur);
                  }
                }
                /* Pass allowClear: true so unfreezing actually deletes is_frozen & frozen_date in Vault */
                upsertVaultSafe({
                  id: vaultIdForBag,
                  name: bag.coffee,
                  roaster: bag.roaster || '',
                  roast: cardRoast || bag.rlevel || '',
                  origin: cardOrigin || '',
                  region: cardRegion || '',
                  process: cardProc || '',
                  varietal: cardVarietal || '',
                  elevation_m: cardElev || '',
                  roast_date: isIsoDateCellar(bag.roast) ? bag.roast : '',
                  bag_notes: cardBagNotes || '',
                  bag_weight_g: ev.isPods ? undefined : ev.totalG,
                  is_frozen: nextFrz,
                  frozen_date: nextFrzDate,
                  remaining_g: ev.isPods ? undefined : ev.remG
                }, null, { allowClear: true, forceRemaining: !ev.isPods });
                /* For Vault-only bags, record explicit unfrozen marker so historical CSV is_frozen rows never re-freeze the bag */
                if (storage && typeof storage.saveCoffeesVaultList === 'function') {
                  var vPost = getCoffeesVaultSafe().map(function (v) { return Object.assign({}, v); });
                  var vChanged = false;
                  for (var vi = 0; vi < vPost.length; vi++) {
                    if (vPost[vi] && sameCoffeeTarget(vPost[vi], bag)) {
                      if (nextFrz === 'yes') {
                        if (vPost[vi].shelfUnfrozen) { delete vPost[vi].shelfUnfrozen; vChanged = true; }
                      } else {
                        vPost[vi].shelfUnfrozen = true;
                        delete vPost[vi].is_frozen;
                        delete vPost[vi].frozen_date;
                        vChanged = true;
                      }
                      break;
                    }
                  }
                  if (vChanged) {
                    try { storage.saveCoffeesVaultList(vPost); } catch (_) {}
                  }
                }
                if (a && a.coffee && sameCoffeeTarget(a.coffee, bag)) {
                  a.coffee.is_frozen = nextFrz;
                  a.coffee.frozen_date = nextFrzDate;
                  S.saveDraftSafe();
                }
                S.toastSafe(nextFrz ? 'Bag marked Frozen at -18 \u00B0C (12\u00D7 slower aging)!' : 'Moved bag back to counter shelf');
                repaint();
              }
            }, S.iconEl('cryo-snowflake', { size: 14 }), S.h('span', { text: ev.isFrozen ? 'Frozen at -18 \u00B0C' : 'Freeze Bag Now' })),
            S.h('button', {
              type: 'button',
              class: 'bt-tc-pill is-compact is-copper bt-pull-dose-btn' + (ev.isEmpty ? ' is-disabled' : ''),
              'aria-disabled': ev.isEmpty ? 'true' : 'false',
              title: ev.isEmpty ? 'Bag empty \u2014 tap Fresh Bag to refill or start a new bag' : ('Remove ' + pullDose + (ev.isPods ? ' pod' : ' g') + ' from this bag (inventory only, does not start a brew)'),
              style: ev.isEmpty ? 'opacity:0.55;cursor:not-allowed' : '',
              onclick: function () {
                /* 0 g guard: never pull from an empty bag */
                var curRem = ev.remG;
                if (ev.isEmpty || curRem <= 0.4) {
                  S.toastSafe('Bag empty \u2014 tap Fresh Bag to refill or start a new bag');
                  return;
                }
                /* Pull Dose is an inventory-only action (stays on Shelf). Preserve frozen status cleanly (never force frozen without frozen_date). */
                var pullG = Math.min(pullDose, curRem);
                var nextRem = Math.max(0, Math.round((curRem - pullG) * 10) / 10);
                var keepFrz = ev.isFrozen ? 'yes' : '';
                var keepFrzDate = keepFrz ? (bag.frozen_date || (uRec && uRec.frozen_date) || S.isoDaysAgo(0)) : '';
                if (bag._priceIdx >= 0) {
                  var list = S.getNormalizedPrices();
                  if (list[bag._priceIdx]) {
                    list[bag._priceIdx].rem_g = nextRem;
                    if (keepFrz) {
                      list[bag._priceIdx].is_frozen = 'yes';
                      list[bag._priceIdx].frozen_date = keepFrzDate;
                    }
                    if (nextRem <= 0.4) list[bag._priceIdx].finished = S.isoDaysAgo(0);
                    S.saveNormalizedPrices(list);
                  }
                }
                if (!ev.isPods) {
                  upsertVaultSafe({
                    id: vaultIdForBag,
                    name: bag.coffee,
                    roaster: bag.roaster || '',
                    is_frozen: keepFrz,
                    frozen_date: keepFrzDate,
                    remaining_g: nextRem
                  }, null, { allowClear: !keepFrz, forceRemaining: true });
                  if (nextRem <= 0.4 && bag._priceIdx < 0) {
                    setVaultShelfArchived(vaultIdForBag, bag.coffee, bag.roaster || '', true, 0);
                  }
                }
                if (a && a.coffee && sameCoffeeTarget(a.coffee, bag)) {
                  a.coffee.remaining_g = nextRem;
                  if (a.coffee.openBag && typeof a.coffee.openBag === 'object') a.coffee.openBag.rem_g = nextRem;
                  S.saveDraftSafe();
                }
                var bagSymPull = bag.sym || (bag.currency === 'EUR' ? '\u20AC' : bag.currency === 'GBP' ? '\u00A3' : '$');
                var unitLbl = ev.isPods ? (pullG === 1 ? ' pod' : ' pods') : ' g';
                var remLbl = ev.isPods ? (nextRem + ' pods left') : (nextRem + ' g left');
                var costPart = (ev.hasPrice && ev.perCup != null) ? (' \u00B7 ' + bagSymPull + ev.perCup.toFixed(2) + (ev.isPods ? '/pod' : '/cup')) : '';
                S.toastSafe('Pulled ' + pullG + unitLbl + (keepFrz ? ' frozen' : '') + ' dose (' + remLbl + costPart + '). Bag updated only \u2014 brewing it later deducts again.');
                repaint();
              }
            }, S.h('span', { text: ev.isEmpty ? (ev.isPods ? 'Box Empty' : 'Bag Empty') : (ev.isPods ? 'Pull 1 Pod (\u22121)' : ('Pull ' + pullDose + ' g Dose (\u2212' + pullDose + ' g)')) })),
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

      /* Fresh Bag Roast-Date Rollover Helper & Drawer (updates ONLY this bag, clears is_frozen, never clobbers unrelated app.coffee) */
      function applyRolloverIso(iso) {
        if (!iso || !isIsoDateCellar(iso)) return;
        if (bag._priceIdx >= 0) {
          var list = S.getNormalizedPrices();
          if (list[bag._priceIdx]) {
            list[bag._priceIdx].roast = iso;
            list[bag._priceIdx].finished = '';
            list[bag._priceIdx].is_frozen = '';
            list[bag._priceIdx].frozen_date = '';
            list[bag._priceIdx].rem_g = ev.totalG;
            S.saveNormalizedPrices(list);
          }
        }
        if (!ev.isPods) {
          upsertVaultSafe({
            id: vaultIdForBag,
            name: bag.coffee,
            roaster: bag.roaster || '',
            roast_date: iso,
            is_frozen: '',
            frozen_date: '',
            remaining_g: ev.totalG
          }, null, { allowClear: true, forceRemaining: true });
          setVaultShelfArchived(vaultIdForBag, bag.coffee, bag.roaster || '', false, ev.totalG);
        }
        if (a && a.coffee && sameCoffeeTarget(a.coffee, bag)) {
          a.coffee.roast_date = iso;
          a.coffee.dateUnsure = '';
          a.coffee.roastDateUnsure = '';
          a.coffee.date_unknown = '';
          a.coffee.is_frozen = '';
          a.coffee.frozen_date = '';
          a.coffee.remaining_g = ev.totalG;
          if (a.coffee.openBag && typeof a.coffee.openBag === 'object') {
            a.coffee.openBag.roast = iso;
            a.coffee.openBag.rem_g = ev.totalG;
          }
          S.saveDraftSafe();
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
      var bagChron = getIndexedCoffeeHistory(histIdx, bag.coffee, bag.roaster, bag.coffee_id || (uRec && uRec.coffee_id));
      var bagTimeline = buildDialInConvergenceTimeline(bagChron, null, { compact: true });

      var priceKickerPart = ev.hasPrice && ev.perCup != null
        ? (ev.isPods
            ? (bagSym + ev.perCup.toFixed(2) + '/pod')
            : (bagSym + ev.perCup.toFixed(2) + '/cup (' + bagSym + ev.per100g.toFixed(2) + '/100g)'))
        : 'Price unlisted';

      var remSummaryTxt = '';
      if (ev.isPods) {
        remSummaryTxt = ev.remG + ' / ' + ev.totalG + ' pods remaining (' + ev.pctLeft + '%)' + (ev.isEmpty ? '' : (' \u00B7 ' + ev.cupsLeft + ' pod' + (ev.cupsLeft === 1 ? '' : 's') + ' left'));
      } else if (ev.isEmpty) {
        remSummaryTxt = ev.remG + ' g / ' + ev.totalG + ' g remaining (0%)';
      } else if (ev.cupsLeft === 0 && ev.oddTail) {
        remSummaryTxt = ev.remG + ' g / ' + ev.totalG + ' g remaining (' + ev.pctLeft + '%) \u00B7 Last dose';
      } else if (ev.cupsLeft === 0) {
        remSummaryTxt = ev.remG + ' g / ' + ev.totalG + ' g remaining (' + ev.pctLeft + '%) \u00B7 <1 cup left';
      } else {
        remSummaryTxt = ev.remG + ' g / ' + ev.totalG + ' g remaining (' + ev.pctLeft + '%) \u00B7 ~' + ev.cupsLeft + ' cup' + (ev.cupsLeft === 1 ? '' : 's') + ' left';
      }

      return S.h('article', {
        class: 'bt-cellar-bag-card',
        style: '--bag-roast-color:' + S.roastColorFor(cardRoast || bag.rlevel)
      },
        S.h('div', { class: 'bt-tc-row-between' },
          S.h('div', { style: 'display:flex;align-items:center;gap:8px;min-width:0' },
            isLocked ? buildGoldSealSvg(26) : null,
            S.h('div', { style: 'min-width:0' },
              S.h('div', { class: 'bt-tc-kicker', text: (bag.roaster || 'Specialty Roaster') + ' \u00B7 ' + priceKickerPart }),
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
          S.h('span', { class: 'mono', style: 'font-size:0.8rem;color:var(--ink-secondary)', text: remSummaryTxt }),
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
    var realIdx = resolveRowIdxSafe(typeof rowIdx === 'object' ? r : rowIdx, hObjs);
    var backLbl = ui.seg === 'shelf' ? '\u2190 Back to Shelf' : '\u2190 Back to Journal';
    S.openSheetSafe('screen-detail', { row: r, rowIdx: realIdx, backLabel: backLbl }, { title: 'Tasting Passport Detail', detent: 'full' });
  }

  function openTastingEditSheet(rowIdx, initialTab, opts) {
    opts = opts || {};
    var hObjs = S.getHistoryObjs();
    var r = typeof rowIdx === 'object' ? rowIdx : hObjs[rowIdx];
    if (!r) return;
    var realIdx = resolveRowIdxSafe(typeof rowIdx === 'object' ? r : rowIdx, hObjs);
    var backLbl = opts.backLabel || (ui.seg === 'shelf' ? '\u2190 Back to Shelf' : '\u2190 Back to Journal');
    S.openSheetSafe('screen-tasting-edit', { row: r, rowIdx: realIdx, tab: initialTab || 'tasting', fromDetail: !!opts.fromDetail, backLabel: backLbl }, { title: 'Edit Tasting & Coffee', detent: 'full' });
  }

  function sanitizeImportedPassportCoffee(rawCoffee) {
    var sh = S.getShell();
    var fresh = (sh && typeof sh.newCoffee === 'function')
      ? sh.newCoffee()
      : (typeof newCoffee === 'function' ? newCoffee() : {});
    if (!rawCoffee || typeof rawCoffee !== 'object' || Array.isArray(rawCoffee)) return fresh;

    var hasOwn = Object.prototype.hasOwnProperty;
    var strFields = [
      'name', 'roaster', 'roaster_location', 'origin', 'region', 'farm', 'farm_or_station',
      'producer', 'harvest_year', 'varietal', 'species', 'blend', 'process', 'process_sub',
      'process_details', 'roast', 'roast_date', 'bag_notes', 'notes', 'personal_note', 'decaf_process'
    ];
    for (var i = 0; i < strFields.length; i++) {
      var k = strFields[i];
      if (!hasOwn.call(rawCoffee, k)) continue;
      var v = rawCoffee[k];
      if (typeof v === 'string' || (typeof v === 'number' && isFinite(v))) {
        fresh[k] = String(v).trim().slice(0, 240);
      }
    }
    if (!fresh.name && hasOwn.call(rawCoffee, 'coffee_name') && typeof rawCoffee.coffee_name === 'string') {
      fresh.name = rawCoffee.coffee_name.trim().slice(0, 240);
    }
    if (!fresh.roast && hasOwn.call(rawCoffee, 'roast_level') && typeof rawCoffee.roast_level === 'string') {
      fresh.roast = rawCoffee.roast_level.trim().slice(0, 60);
    }
    if (fresh.roast) {
      fresh.roast = (typeof resolveRoast === 'function' ? resolveRoast(fresh.roast) : '') || fresh.roast.toLowerCase();
    }
    if (fresh.process) {
      fresh.process = (typeof resolveProcess === 'function' ? resolveProcess(fresh.process) : '') || fresh.process.toLowerCase();
    }
    if (fresh.roast_date && !isIsoDateCellar(fresh.roast_date)) fresh.roast_date = '';
    if (hasOwn.call(rawCoffee, 'decaf') && (rawCoffee.decaf === 'yes' || rawCoffee.decaf === true)) {
      fresh.decaf = 'yes';
    } else {
      fresh.decaf = '';
    }
    if (hasOwn.call(rawCoffee, 'elevation_m')) {
      var elN = parseInt(String(rawCoffee.elevation_m || '').replace(/[^0-9]/g, ''), 10);
      if (isFinite(elN) && elN >= 100 && elN <= 3600) {
        fresh.elevation_m = String(elN);
        fresh.elevText = elN + ' masl';
      }
    }
    ['agtron', 'bean_agtron', 'ground_agtron'].forEach(function (ak) {
      if (!hasOwn.call(rawCoffee, ak)) return;
      var av = parseFloat(rawCoffee[ak]);
      if (isFinite(av) && av >= 15 && av <= 130) fresh[ak] = String(Math.round(av * 10) / 10);
    });
    if (fresh.bag_notes && !fresh.notes) fresh.notes = fresh.bag_notes;
    if (fresh.notes && !fresh.bag_notes) fresh.bag_notes = fresh.notes;

    var impBlend = extractRowBlendInfo(rawCoffee);
    if (impBlend.isBlend && Array.isArray(impBlend.components) && impBlend.components.length >= 2) {
      fresh.isBlend = true;
      fresh.blend = 'blend';
      fresh.blendComponents = impBlend.components.slice(0, 2).map(function (bc) {
        return {
          coffeeId: String(bc.coffeeId || '').slice(0, 64),
          name: String(bc.name || 'Coffee').slice(0, 120),
          roaster: String(bc.roaster || '').slice(0, 120),
          roast: String(bc.roast || '').slice(0, 40),
          agtron: (isFinite(+bc.agtron) && +bc.agtron >= 15 && +bc.agtron <= 130) ? +bc.agtron : '',
          process: String(bc.process || '').slice(0, 60),
          origin: String(bc.origin || '').slice(0, 80),
          elevation_m: (isFinite(parseInt(bc.elevation_m, 10)) && parseInt(bc.elevation_m, 10) >= 100 && parseInt(bc.elevation_m, 10) <= 3600) ? String(parseInt(bc.elevation_m, 10)) : '',
          varietal: String(bc.varietal || '').slice(0, 80),
          decaf: bc.decaf === 'yes' ? 'yes' : '',
          species: String(bc.species || 'arabica').slice(0, 40),
          weightG: (isFinite(+bc.weightG) && +bc.weightG >= 0 && +bc.weightG <= 500) ? Math.round(+bc.weightG * 10) / 10 : 0,
          ratioPct: (isFinite(+bc.ratioPct) && +bc.ratioPct >= 0 && +bc.ratioPct <= 100) ? Math.round(+bc.ratioPct) : 50
        };
      });
    } else {
      fresh.isBlend = false;
      fresh.blendComponents = [];
    }

    fresh.answered = 'yes';
    fresh._v64Touched = 'yes';
    fresh.nameUnsure = '';
    fresh.roasterUnsure = fresh.roaster ? '' : 'yes';
    fresh.roastUnsure = fresh.roast ? '' : 'yes';
    fresh.processUnsure = fresh.process ? '' : 'yes';
    fresh.originUnsure = fresh.origin ? '' : 'yes';
    fresh.dateUnsure = fresh.roast_date ? '' : 'yes';
    fresh.notesUnsure = fresh.bag_notes ? '' : 'yes';
    return fresh;
  }

  function sanitizeImportedPassportBrew(rawBrew) {
    var out = {};
    if (!rawBrew || typeof rawBrew !== 'object' || Array.isArray(rawBrew)) return out;
    var hasOwn = Object.prototype.hasOwnProperty;
    var rawMeth = hasOwn.call(rawBrew, 'methodKey') ? rawBrew.methodKey : (hasOwn.call(rawBrew, 'method') ? rawBrew.method : '');
    if (typeof rawMeth === 'string' && rawMeth.trim()) {
      var resM = (typeof resolveMethod === 'function' ? resolveMethod(rawMeth) : '') || rawMeth.trim().toLowerCase();
      if (/^[a-z0-9_]{2,24}$/i.test(resM)) out.method = resM;
    }
    var rawDose = hasOwn.call(rawBrew, 'doseG') ? rawBrew.doseG : (hasOwn.call(rawBrew, 'dose') ? rawBrew.dose : null);
    var doseN = parseFloat(rawDose);
    if (isFinite(doseN) && doseN >= 0.5 && doseN <= 500) out.dose = Math.round(doseN * 10) / 10;

    var rawWater = hasOwn.call(rawBrew, 'waterG') ? rawBrew.waterG : (hasOwn.call(rawBrew, 'water') ? rawBrew.water : null);
    var waterN = parseFloat(rawWater);
    if (isFinite(waterN) && waterN >= 1 && waterN <= 10000) out.water = Math.round(waterN * 10) / 10;

    if (out.dose && out.water) {
      out.ratio = Math.round((out.water / out.dose) * 10) / 10;
    } else if (hasOwn.call(rawBrew, 'ratio')) {
      var ratN = parseFloat(rawBrew.ratio);
      if (isFinite(ratN) && ratN >= 1 && ratN <= 30) out.ratio = Math.round(ratN * 10) / 10;
    }

    var rawUm = hasOwn.call(rawBrew, 'd50Um') ? rawBrew.d50Um : (hasOwn.call(rawBrew, 'grindUm') ? rawBrew.grindUm : (hasOwn.call(rawBrew, 'grind_um') ? rawBrew.grind_um : null));
    var umN = parseFloat(rawUm);
    if (isFinite(umN) && umN >= 50 && umN <= 2000) out.grindUm = Math.round(umN);

    var rawGs = hasOwn.call(rawBrew, 'grindSetting') ? rawBrew.grindSetting : (hasOwn.call(rawBrew, 'grind_setting') ? rawBrew.grind_setting : '');
    if (typeof rawGs === 'string' && rawGs.trim()) out.grind_setting = rawGs.trim().slice(0, 64);

    if (hasOwn.call(rawBrew, 'tempC')) {
      var tcN = parseFloat(rawBrew.tempC);
      if (isFinite(tcN) && tcN >= 0 && tcN <= 100) {
        out.tempC = Math.round(tcN * 10) / 10;
        out.tempF = Math.round(out.tempC * 9 / 5 + 32);
      }
    } else if (hasOwn.call(rawBrew, 'tempF')) {
      var tfN = parseFloat(rawBrew.tempF);
      if (isFinite(tfN) && tfN >= 32 && tfN <= 212) {
        out.tempF = Math.round(tfN * 10) / 10;
        out.tempC = Math.round(((out.tempF - 32) * 5 / 9) * 2) / 2;
      }
    }
    return out;
  }

  function syncCompareSelection(hObjs) {
    var list = Array.isArray(hObjs) ? hObjs : [];
    var keyToItem = Object.create(null);
    for (var i = 0; i < list.length; i++) {
      if (!list[i]) continue;
      var k = stableRowKey(list[i], i);
      keyToItem[k] = { key: k, idx: i, r: list[i] };
    }
    if ((!Array.isArray(ui.compareKeys) || !ui.compareKeys.length) && Array.isArray(ui.compareIdxs) && ui.compareIdxs.length) {
      ui.compareKeys = ui.compareIdxs
        .map(function (idx) { return (idx >= 0 && idx < list.length && list[idx]) ? stableRowKey(list[idx], idx) : ''; })
        .filter(Boolean);
    }
    var seen = Object.create(null);
    var resolved = [];
    (ui.compareKeys || []).forEach(function (k) {
      if (seen[k] || !keyToItem[k]) return;
      seen[k] = 1;
      resolved.push(keyToItem[k]);
    });
    ui.compareKeys = resolved.map(function (x) { return x.key; });
    ui.compareIdxs = resolved.map(function (x) { return x.idx; });
    return resolved;
  }

  function buildJournalSegment(repaint) {
    var aApp = S.getApp();
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
            ui.journalVisibleLimit = JOURNAL_PAGE_SIZE;
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
              ui.journalVisibleLimit = JOURNAL_PAGE_SIZE;
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
              ui.journalVisibleLimit = JOURNAL_PAGE_SIZE;
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
              onclick: function () { ui.journalQ = og.label; ui.journalVisibleLimit = JOURNAL_PAGE_SIZE; S.haptic('tick'); repaint(); }
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
                ui.journalVisibleLimit = JOURNAL_PAGE_SIZE;
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
          var cmpOptsList = cmpList.slice(0, 50);
          var idxA = (ui.cuppingCmpA >= 0 && ui.cuppingCmpA < cmpOptsList.length) ? ui.cuppingCmpA : 0;
          var idxB = (ui.cuppingCmpB >= 0 && ui.cuppingCmpB < cmpOptsList.length && ui.cuppingCmpB !== idxA) ? ui.cuppingCmpB : (idxA === 0 ? 1 : 0);
          ui.cuppingCmpA = idxA;
          ui.cuppingCmpB = idxB;
          var rowA = cmpOptsList[idxA].r;
          var rowB = cmpOptsList[idxB].r;
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
                cmpOptsList.map(function (it, ci) {
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

    /* Import Shared Brew Recipe Bar (Strict Sanitized Allowlist + Finite Clamps + Open in Studio CTA) */
    wrap.appendChild(S.h('div', { class: 'bt-tc-card' },
      S.h('div', { class: 'bt-tc-kicker', text: 'Import Shared Brew Recipe (Auto-Matches Your Grinder)' }),
      S.h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap' },
        S.h('div', { class: 'bt-tc-spotlight', style: 'flex:1;min-width:190px' },
          S.h('input', {
            type: 'text',
            placeholder: 'Paste BT6:, BT-code: V1, bt1:, or JSON passport...',
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
                a.coffee = sanitizeImportedPassportCoffee(res.bean || res.coffee);
              }
              var locRx = sanitizeImportedPassportBrew(res.localizedRecipe || res.brew || {});
              if (a.brew) {
                if (locRx.method) a.brew.method = locRx.method;
                if (locRx.dose != null) a.brew.dose = locRx.dose;
                if (locRx.water != null) a.brew.water = locRx.water;
                if (locRx.ratio != null) a.brew.ratio = locRx.ratio;
                if (locRx.grindUm != null) {
                  a.brew.grindUm = locRx.grindUm;
                  a.brew.grind_um = locRx.grindUm;
                }
                if (locRx.grind_setting) a.brew.grind_setting = locRx.grind_setting;
                if (locRx.tempC != null) { a.brew.tempC = locRx.tempC; a.brew.tempF = locRx.tempF; }
                a.brew._savedDialedMethod = a.brew.method || '';
                a.brew.dialAdaptation = null;
                a.brew.actualSecs = null;
                a.brew.actualFromTimer = false;
              }
              a.recipeLocked = false;
              a.lockedMethod = '';
              a.dialNote = null;
              a.cupBrew = null;
              a.attempt = 0;
              ui.passportImportedOk = true;
              ui.passportMsg = 'Matched "' + ((a.coffee && a.coffee.name) || 'Shared Recipe') + '" to your grinder & loaded into Brew Studio!';
              S.saveDraftSafe();
              S.toastSafe(ui.passportMsg);
              repaint();
            } else {
              ui.passportImportedOk = false;
              ui.passportMsg = 'Could not read code \u2014 check that it starts with BT6:, BT-code: V1, bt1:, or valid passport JSON.';
              repaint();
            }
          }
        })
      ),
      ui.passportMsg ? S.h('div', { class: 'bt-tc-row-between', style: 'gap:8px;flex-wrap:wrap' },
        S.h('span', { class: 'bt-tc-sub', style: 'margin:0', text: ui.passportMsg }),
        ui.passportImportedOk ? S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-compact is-active',
          text: 'Open in Brew Studio \u2192',
          onclick: function () { navigateToHomeRecipe(); }
        }) : null
      ) : null
    ));

    /* P0-18: Persistent Search Input + Clear Button (repaints ONLY journalListHost on debounced oninput!) */
    var journalSearchTimer = null;
    var journalCountEl = S.h('span', { class: 'bt-tc-sub', style: 'margin:0', 'aria-live': 'polite' });
    var journalListHost = S.h('div', { style: 'display:flex;flex-direction:column;gap:14px' });

    var journalInput = S.h('input', {
      type: 'search',
      class: 'bt-tc-search',
      placeholder: 'Search journal by coffee, roaster, brewer, or flavor note...',
      value: ui.journalQ,
      'aria-label': 'Search brew journal',
      oninput: function (e) {
        ui.journalQ = e.target.value;
        journalClear.style.display = ui.journalQ ? '' : 'none';
        ui.journalVisibleLimit = JOURNAL_PAGE_SIZE;
        clearTimeout(journalSearchTimer);
        journalSearchTimer = setTimeout(paintJournalList, 120);
      }
    });
    var journalClear = S.h('button', {
      type: 'button',
      class: 'bt-tc-search-clear no-print',
      'aria-label': 'Clear journal search',
      style: 'display:' + (ui.journalQ ? '' : 'none') + ';background:none;border:0;font-size:1.25rem;line-height:1;min-width:32px;min-height:32px;cursor:pointer;color:var(--ink-secondary)',
      text: '\u00D7',
      onclick: function () {
        clearTimeout(journalSearchTimer);
        ui.journalQ = '';
        journalInput.value = '';
        journalClear.style.display = 'none';
        ui.journalVisibleLimit = JOURNAL_PAGE_SIZE;
        paintJournalList();
        journalInput.focus();
      }
    });

    wrap.appendChild(S.h('div', { class: 'bt-tc-spotlight no-print' },
      S.iconEl('search-filter', { size: 17 }),
      journalInput,
      journalClear
    ));

    wrap.appendChild(S.h('div', { class: 'bt-tc-pill-scroll no-print', role: 'group', 'aria-label': 'Journal filter chips' },
      [
        ['all',       'All Logs'],
        ['dialed',    'Dialed'],
        ['gems',      '4.5+ Gems'],
        ['dialing',   'Needs Dial-In'],
        ['filter',    'Pour-Over / Drip'],
        ['espresso',  'Espresso'],
        ['immersion', 'Immersion / Cold'],
        ['cupping',   'Cuppings'],
        ['r2',        'Refractometer (%TDS)']
      ].map(function (fc) {
        var on = ui.journalFilter === fc[0];
        return S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-compact' + (on ? ' is-active' : ' is-soft'),
          'aria-pressed': String(on),
          text: fc[1],
          onclick: function () {
            ui.journalFilter = fc[0];
            ui.journalVisibleLimit = JOURNAL_PAGE_SIZE;
            repaint();
          }
        });
      }),
      S.h('button', {
        type: 'button',
        class: 'bt-tc-pill is-compact is-soft',
        text: 'Sort: ' + (ui.journalSort === 'newest' ? 'Newest' : (ui.journalSort === 'best' ? 'Top Rated' : 'Coffee')),
        onclick: function () {
          ui.journalSort = ui.journalSort === 'newest' ? 'best' : (ui.journalSort === 'best' ? 'coffee' : 'newest');
          ui.journalVisibleLimit = JOURNAL_PAGE_SIZE;
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
    wrap.appendChild(journalCountEl);
    wrap.appendChild(journalListHost);

    var tempPref = (aApp && aApp.prefs && aApp.prefs.tempUnit === 'F') ? 'F' : 'C';

    function formatCompareWaterTemp(r) {
      var vm = extractRowV74Meta(r);
      if (vm.tempProfileLabel) {
        return { disp: vm.tempProfileLabel, cmp: 'prof:' + vm.tempProfileLabel.toLowerCase() };
      }
      var cVal = +r.brew_temp_c > 0 ? +r.brew_temp_c : (+r.brew_temp_f > 0 ? ((+r.brew_temp_f - 32) * 5 / 9) : null);
      if (cVal == null || !isFinite(cVal)) return { disp: '\u2014', cmp: '\u2014' };
      var normC = Math.round(cVal);
      var disp = tempPref === 'F' ? (Math.round(normC * 9 / 5 + 32) + ' \u00B0F') : (normC + ' \u00B0C');
      return { disp: disp, cmp: 'c:' + normC };
    }

    function paintJournalList() {
      var liveObjs = S.getHistoryObjs();
      var cmpRows = syncCompareSelection(liveObjs);
      journalListHost.textContent = '';

      /* Compare 2-3 Brews Side-by-Side (keyed by stable row ID, with explicit <- Back to Journal!) */
      if (cmpRows.length < 2 && liveObjs.length >= 2) {
        journalListHost.appendChild(S.h('div', { class: 'bt-tc-well', style: 'flex-direction:row;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px' },
          S.h('span', { style: 'font-size:0.82rem;font-weight:600', text: cmpRows.length === 1 ? '1 of 3 brews selected \u2014 tap Compare on 1\u20132 more cards below!' : 'Compare 2\u20133 Brews Side-by-Side' }),
          S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-compact is-copper',
            text: 'Compare Latest 2 Brews \u2192',
            onclick: function () {
              var newestTwo = liveObjs.map(function (r, idx) { return { r: r, idx: idx, ts: rowTimestampKey(r) }; })
                .filter(function (x) { return !!x.r; })
                .sort(function (x, y) { return y.ts.localeCompare(x.ts) || (y.idx - x.idx); })
                .slice(0, 2)
                .reverse();
              ui.compareKeys = newestTwo.map(function (x) { return stableRowKey(x.r, x.idx); });
              ui.compareIdxs = newestTwo.map(function (x) { return x.idx; });
              paintJournalList();
            }
          })
        ));
      }

      if (cmpRows.length >= 2) {
        var anyCmpBlend = cmpRows.some(function (c) { return extractRowBlendInfo(c.r).isBlend; });
        var anyCmpMat = cmpRows.some(function (c) { return !!extractRowV74Meta(c.r).brewerMaterialLabel; });
        var anyCmpPal = cmpRows.some(function (c) { return !!extractRowV74Meta(c.r).palateTargetsLabel; });
        var anyCmpGrinder = cmpRows.some(function (c) { return !!unneutCellar(c.r.brew_grinder_name || ''); });
        var anyCmpFilter = cmpRows.some(function (c) { return !!unneutCellar(c.r.brew_filter || ''); });
        var anyCmpAgit = cmpRows.some(function (c) { return !!unneutCellar(c.r.brew_agitation || ''); });
        var anyCmpWater = cmpRows.some(function (c) { return !!unneutCellar(c.r.brew_water_type || ''); });
        var anyCmpTech = cmpRows.some(function (c) { return !!unneutCellar(c.r.brew_technique || ''); });

        var specRows = [
          { lbl: 'Coffee', fn: function (r) { return unneutCellar(r.coffee_name || '') || '\u2014'; } },
          anyCmpBlend ? { lbl: '2-Coffee Blend', fn: function (r) {
            var bi = extractRowBlendInfo(r);
            return bi.isBlend ? (bi.pillText + ' \u2014 ' + bi.nameA + ' + ' + bi.nameB) : 'Single Coffee';
          } } : null,
          { lbl: 'Brewer', fn: function (r) { return S.humanMethodName(r.brew_method); } },
          anyCmpMat ? { lbl: 'Brewer Material', fn: function (r) { return extractRowV74Meta(r).brewerMaterialLabel || '\u2014'; } } : null,
          anyCmpGrinder ? { lbl: 'Grinder', fn: function (r) { return unneutCellar(r.brew_grinder_name || '') || '\u2014'; } } : null,
          anyCmpFilter ? { lbl: 'Filter', fn: function (r) { return unneutCellar(r.brew_filter || '') || '\u2014'; } } : null,
          { lbl: 'Try #', fn: function (r) { return r.brew_attempt ? ('#' + r.brew_attempt) : '\u2014'; } },
          { lbl: 'Dose : Water', fn: function (r) {
            var d = safePosNumDisp(r.brew_dose_g, 2000);
            var w = safePosNumDisp(r.brew_water_g, 20000);
            return (d || '\u2014') + ' g : ' + (w || '\u2014') + ' g';
          } },
          { lbl: 'Ratio', fn: function (r) {
            var rt = safePosNumDisp(r.brew_ratio, 60);
            return rt ? ('1:' + rt) : '\u2014';
          } },
          { lbl: 'Grind Setting', fn: function (r) {
            var gs = unneutCellar(r.brew_grind_setting || '');
            var um = safePosNumDisp(r.brew_grind_target_um, 5000);
            return [gs, um ? (um + ' \u00B5m') : ''].filter(Boolean).join(' \u00B7 ') || '\u2014';
          } },
          { lbl: 'Water Temp', fn: function (r) { return formatCompareWaterTemp(r).disp; }, cmpFn: function (r) { return formatCompareWaterTemp(r).cmp; } },
          anyCmpAgit ? { lbl: 'Agitation', fn: function (r) { return unneutCellar(r.brew_agitation || '') || '\u2014'; } } : null,
          anyCmpTech ? { lbl: 'Technique', fn: function (r) { return unneutCellar(r.brew_technique || '') || '\u2014'; } } : null,
          anyCmpWater ? { lbl: 'Water', fn: function (r) { return unneutCellar(r.brew_water_type || '') || '\u2014'; } } : null,
          { lbl: 'Brew Time', fn: function (r) {
            var sVal = +(r.brew_actual_time_s || r.brew_time_s) || 0;
            return (isFinite(sVal) && sVal > 0) ? (S.fmtMmSs(sVal) + ' (' + sVal + 's)') : '\u2014';
          } },
          { lbl: 'Strength (%TDS) / Extraction (%EY)', fn: function (r) {
            var tds = safePosNumDisp(r.brew_tds_pct, 30);
            var ey = safePosNumDisp(r.brew_ey_pct, 40);
            return tds ? (tds + '% / ' + (ey || '\u2014') + '%') : '\u2014';
          } },
          anyCmpPal ? { lbl: 'Palate Targets', fn: function (r) { return extractRowV74Meta(r).palateTargetsLabel || '\u2014'; } } : null,
          { lbl: 'Rating', fn: function (r) {
            var st = safeRowStarsNum(r);
            var sc = safeRowScaNum(r);
            return st > 0 ? (st.toFixed(2) + ' / 5.00') : (sc > 0 ? (sc + ' / 100') : '\u2014');
          } },
          { lbl: 'Balance Note', fn: function (r) {
            var sym = unneutCellar(r.fix_symptom || '');
            return sym ? formatDialSymLabel(sym) : '\u2014';
          } },
          { lbl: 'Flavors Liked', fn: function (r) { return unneutCellar(r.flavors_liked || '') || '\u2014'; } }
        ].filter(Boolean);

        var cupScores = cmpRows.map(function (c) { return unifiedRowStars(c.r); });
        var bestScore = Math.max.apply(null, cupScores);
        var allTied = cupScores.every(function (s) { return Math.abs(s - cupScores[0]) < 0.005; });
        var isWinnerCol = function (cIdx) { return bestScore > 0 && !allTied && Math.abs(cupScores[cIdx] - bestScore) < 0.005; };

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
          var cmpVals = cmpRows.map(function (c, i) { return sr.cmpFn ? sr.cmpFn(c.r) : vals[i]; });
          var varied = cmpVals.some(function (v) { return v !== cmpVals[0]; });
          var keepAlways = sr.lbl === 'Coffee' || sr.lbl === 'Rating' || sr.lbl === '2-Coffee Blend' || (sr.lbl === 'Water Temp' && anyCmpTempProf);
          if (ui.compareOnlyVaried && !varied && !keepAlways) return;

          /* Majority / modal diff: if >=2 cups share a value, highlight ONLY the outlier(s) */
          var counts = Object.create(null);
          var modeVal = cmpVals[0];
          var maxCount = 0;
          cmpVals.forEach(function (cv) {
            counts[cv] = (counts[cv] || 0) + 1;
            if (counts[cv] > maxCount) {
              maxCount = counts[cv];
              modeVal = cv;
            }
          });

          var tr = S.h('tr', { class: varied ? 'is-diff' : '' }, S.h('td', null,
            S.h('b', { text: sr.lbl }),
            varied ? S.h('span', { class: 'bt-compare-diff-tag', style: 'margin-left:6px', text: 'Changed' }) : null
          ));
          vals.forEach(function (v, vIdx) {
            var cv = cmpVals[vIdx];
            var isCellDiff = varied && (maxCount >= 2 ? (cv !== modeVal) : true);
            var cls = 'mono' + (isCellDiff ? ' is-diff-cell' : '') + (isWinnerCol(vIdx) ? ' bt-compare-winner-col' : '');
            tr.appendChild(S.h('td', { class: cls, text: v }));
          });
          tbody.appendChild(tr);
        });

        journalListHost.appendChild(S.h('section', { class: 'bt-tc-card', id: 'bt-screen-compare' },
          S.h('div', { class: 'bt-tc-row-between' },
            S.h('button', {
              type: 'button',
              class: 'bt-tc-back-pill',
              onclick: function () {
                ui.compareKeys = [];
                ui.compareIdxs = [];
                S.haptic('tick');
                paintJournalList();
              }
            }, S.h('span', { text: '\u2190 Back to Journal' })),
            S.h('div', { class: 'bt-tc-pill-wrap' },
              S.h('button', {
                type: 'button',
                class: 'bt-tc-pill is-compact is-soft',
                text: ui.compareOnlyVaried ? 'Differences Only' : 'All Rows',
                onclick: function () { ui.compareOnlyVaried = !ui.compareOnlyVaried; paintJournalList(); }
              }),
              S.h('button', {
                type: 'button',
                class: 'bt-tc-pill is-compact is-soft',
                text: 'Close Compare',
                onclick: function () { ui.compareKeys = []; ui.compareIdxs = []; paintJournalList(); }
              })
            )
          ),
          S.h('div', null,
            S.h('div', { class: 'bt-tc-kicker', text: 'Side-by-Side Brew Comparison' }),
            S.h('b', { style: 'font-size:0.98rem', text: 'Comparing ' + cmpRows.length + ' Brews (Highlighted Cells Differ)' })
          ),
          S.h('div', { class: 'bt-compare-scroll' },
            S.h('table', { class: 'bt-compare-table' }, S.h('thead', null, theadTr), tbody)
          )
        ));
      }

      var q = ui.journalQ.trim().toLowerCase();
      var qToks = q ? q.split(/\s+/).filter(Boolean) : [];
      var filtered = liveObjs.map(function (r, idx) {
        return { r: r, idx: idx, ts: rowTimestampKey(r), uStars: unifiedRowStars(r) };
      }).filter(function (it) {
        var r = it.r;
        if (!r) return false;
        var st = parseFloat(r.my_rating_stars) || 0;
        var rawMk = String(r.brew_method || '').toLowerCase().trim();
        var mk = (typeof resolveMethod === 'function' ? resolveMethod(rawMk) : '') || rawMk;
        var tierKey = classifyJournalRatingTier(r);
        var isGold = r.dial_locked === 'yes' || r.dial_locked === '1';
        var isCup = isCuppingRow(r);

        if (ui.journalFilter === 'tier5' && tierKey !== 'tier5') return false;
        if (ui.journalFilter === 'tier4' && tierKey !== 'tier4') return false;
        if (ui.journalFilter === 'tier3' && tierKey !== 'tier3') return false;
        if (ui.journalFilter === 'tierLow' && tierKey !== 'tierLow') return false;
        if (ui.journalFilter === 'dialed' && !(isGold || st >= 4.25)) return false;
        if (ui.journalFilter === 'cupping' && !isCup) return false;
        if (ui.journalFilter === 'gems' && it.uStars < 4.5) return false;
        if (ui.journalFilter === 'locked' && !isGold) return false;
        if (ui.journalFilter === 'dialing' && (st >= 4.25 || isGold || isCup)) return false;
        if (ui.journalFilter === 'filter' && (isCup || !FILTER_METHODS[mk])) return false;
        if (ui.journalFilter === 'espresso' && !(ESPRESSO_METHODS[mk] || mk.indexOf('espresso') >= 0 || mk.indexOf('moka') >= 0 || mk.indexOf('philips') >= 0)) return false;
        if (ui.journalFilter === 'immersion' && !IMMERSION_COLD_METHODS[mk]) return false;
        if (ui.journalFilter === 'r2' && !(parseFloat(r.brew_tds_pct) > 0)) return false;
        if (!qToks.length) return true;
        var qBlend = extractRowBlendInfo(r);
        var blendSearch = qBlend.isBlend ? ('blend ' + qBlend.nameA + ' ' + qBlend.nameB + ' ' + qBlend.components[0].roaster + ' ' + qBlend.components[1].roaster) : '';
        var hay = [
          unneutCellar(r.coffee_name), unneutCellar(r.roaster), unneutCellar(r.origin),
          r.brew_method, S.humanMethodName(r.brew_method),
          unneutCellar(r.flavors_liked), unneutCellar(r.general_notes), blendSearch
        ].join(' ').toLowerCase();
        return qToks.every(function (tok) { return hay.indexOf(tok) >= 0; });
      });

      filtered.sort(function (a, b) {
        if (ui.journalSort === 'best') {
          var diffS = b.uStars - a.uStars;
          if (Math.abs(diffS) > 0.005) return diffS;
          var diffSca = (parseFloat(b.r.total_score) || 0) - (parseFloat(a.r.total_score) || 0);
          if (Math.abs(diffSca) > 0.05) return diffSca;
          return b.ts.localeCompare(a.ts) || (b.idx - a.idx);
        }
        if (ui.journalSort === 'coffee') {
          return unneutCellar(a.r.coffee_name || '').localeCompare(unneutCellar(b.r.coffee_name || '')) || b.ts.localeCompare(a.ts) || (b.idx - a.idx);
        }
        return b.ts.localeCompare(a.ts) || (b.idx - a.idx);
      });

      var showCap = Math.min(filtered.length, ui.journalVisibleLimit || JOURNAL_PAGE_SIZE);
      journalCountEl.textContent = filtered.length
        ? ('Showing ' + showCap + ' of ' + filtered.length + (filtered.length !== liveObjs.length ? (' matching (' + liveObjs.length + ' total)') : '') + ' log' + (filtered.length === 1 ? '' : 's'))
        : (liveObjs.length ? ('0 matching of ' + liveObjs.length + ' logs') : '');

      if (!filtered.length) {
        journalListHost.appendChild(S.h('section', { class: 'bt-tc-card', style: 'text-align:center;padding:22px 16px' },
          S.h('b', { text: liveObjs.length ? 'No journal rows match this filter.' : 'No home tastings logged yet.' }),
          S.h('p', { class: 'bt-tc-sub', text: liveObjs.length ? 'Clear search or switch filter chips above.' : 'Complete a brew in Tab 1 (Step 5 Taste & Perfect) to build your personal tasting journal.' })
        ));
        return;
      }

      filtered.slice(0, showCap).forEach(function (item) {
        var r = item.r;
        var rIdx = item.idx;
        var rKey = stableRowKey(r, rIdx);
        var cClean = unneutCellar(r.coffee_name || '') || 'Tasted Cup';
        var rClean = unneutCellar(r.roaster || '') || '';
        var inCmp = ui.compareKeys.indexOf(rKey) >= 0;
        var isLocked = r.dial_locked === 'yes' || r.dial_locked === '1';
        var starsNum = safeRowStarsNum(r);
        var rawSca = safeRowScaNum(r);
        var scaNum = rawSca > 0
          ? rawSca
          : (starsNum > 0 ? Math.round((58.0 + ((starsNum - 1.0) / 4.0) * 34.0) * 4) / 4 : 0);
        var isCupping = isCuppingRow(r);
        var cvaCardTraits = extractRowCvaTraits(r);
        var flavorTags = String(unneutCellar(r.flavors_liked || '') || '')
          .split(/[;,|]/).map(function (s) {
            return s.trim().replace(/\b[a-z]/g, function (ch) { return ch.toUpperCase(); });
          }).filter(Boolean).slice(0, 4);
        var nextRecInfo = extractRowRecommendation(r);
        var nextRecCallout = (!isLocked && nextRecInfo.hasRec) ? buildSavedNextBrewCallout(r, true) : null;
        var blendInfo = extractRowBlendInfo(r);
        var v74Meta = extractRowV74Meta(r);
        var safeUmDisp = safePosNumDisp(r.brew_grind_target_um, 5000);
        var grindDisp = unneutCellar(r.brew_grind_setting || '') || (safeUmDisp ? (safeUmDisp + ' \u00B5m') : '');
        var safeDoseDisp = safePosNumDisp(r.brew_dose_g, 2000) || '15';
        var safeWaterDisp = safePosNumDisp(r.brew_water_g, 20000) || '250';
        var safeTdsDisp = safePosNumDisp(r.brew_tds_pct, 30);

        journalListHost.appendChild(S.h('article', {
          class: 'bt-cellar-bag-card',
          style: '--bag-roast-color:' + S.roastColorFor(r.roast_level)
        },
          S.h('div', { class: 'bt-tc-row-between' },
            S.h('div', { style: 'display:flex;align-items:center;gap:8px;min-width:0;cursor:pointer', onclick: function () { openTastingDetailSheet(rIdx); } },
              isLocked ? buildGoldSealSvg(22) : null,
              S.h('div', { style: 'min-width:0' },
                S.h('div', { class: 'bt-tc-kicker', text: [rClean, r.cupping_date, S.humanMethodName(r.brew_method), r.brew_attempt ? ('Try #' + r.brew_attempt) : ''].filter(Boolean).join(' \u00B7 ') }),
                S.h('h3', { style: 'margin:2px 0;font-family:var(--font-display);font-size:1.05rem', text: cClean }),
                S.h('div', { class: 'mono', style: 'font-size:0.78rem;color:var(--ink-secondary)', text: safeDoseDisp + 'g : ' + safeWaterDisp + 'g' + (grindDisp ? (' \u00B7 ' + grindDisp) : '') + (safeTdsDisp ? (' \u00B7 ' + safeTdsDisp + '% TDS') : '') })
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
              text: inCmp ? ('Comparing (' + ui.compareKeys.length + '/3)') : 'Compare',
              onclick: function () {
                if (inCmp) ui.compareKeys = ui.compareKeys.filter(function (k) { return k !== rKey; });
                else if (ui.compareKeys.length < 3) ui.compareKeys.push(rKey);
                else ui.compareKeys = [ui.compareKeys[1], ui.compareKeys[2], rKey];
                paintJournalList();
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
                  var preDelSnap = captureInventorySnapshot();
                  var delRow = liveObjs[rIdx] || r;
                  var delDose = parseFloat(delRow && delRow.brew_dose_g);
                  var delCount = storage.deleteByIdx(rIdx);
                  if (!delCount) return;

                  /* Prune deleted row from stable Compare keys & clamp cupping selectors */
                  ui.compareKeys = ui.compareKeys.filter(function (k) { return k !== rKey; });
                  syncCompareSelection(S.getHistoryObjs());

                  var refundedGrams = 0;
                  if (isFinite(delDose) && delDose > 0 && typeof storage.reconcileBagDoseDelta === 'function') {
                    var delPrices = S.getNormalizedPrices();
                    var delBlend = extractRowBlendInfo(delRow);
                    if (delBlend.isBlend && delBlend.components.length >= 2) {
                      var gA = delBlend.doseA_g > 0 ? delBlend.doseA_g : Math.round(delDose * (delBlend.pctA / 100) * 10) / 10;
                      var gB = delBlend.doseB_g > 0 ? delBlend.doseB_g : Math.round((delDose - gA) * 10) / 10;
                      [[delBlend.components[0], gA], [delBlend.components[1], gB]].forEach(function (pair) {
                        var comp = pair[0], gComp = pair[1];
                        if (!comp || !(gComp > 0)) return;
                        var compProxy = {
                          coffee_id: comp.coffeeId || '',
                          id: comp.coffeeId || '',
                          coffee_name: comp.name,
                          name: comp.name,
                          roaster: comp.roaster || '',
                          cupping_date: delRow.cupping_date || ''
                        };
                        var cMatch = resolveRowBagMatchForInventory(compProxy, delPrices, { allowFinishedRefund: true });
                        if (cMatch.matched) {
                          if (cMatch.priceIdx >= 0) compProxy.openBag = { bagIndex: cMatch.priceIdx };
                          try {
                            var rr = storage.reconcileBagDoseDelta(compProxy, -gComp);
                            if (rr && rr.ok && rr.changed) refundedGrams += gComp;
                          } catch (_) {}
                        }
                      });
                    } else {
                      var sMatch = resolveRowBagMatchForInventory(delRow, delPrices, { allowFinishedRefund: true });
                      if (sMatch.matched) {
                        var refundTarget = Object.assign({}, delRow);
                        if (sMatch.priceIdx >= 0) refundTarget.openBag = { bagIndex: sMatch.priceIdx };
                        try {
                          var sr = storage.reconcileBagDoseDelta(refundTarget, -delDose);
                          if (sr && sr.ok && sr.changed) refundedGrams = delDose;
                        } catch (_) {}
                      }
                    }
                  }
                  var didRefund = refundedGrams > 0;
                  var delMsg = didRefund
                    ? ('Deleted tasting row (+' + (Math.round(refundedGrams * 10) / 10) + ' g refunded to bag)')
                    : 'Deleted tasting row';
                  S.toastSafe(delMsg, {
                    durationMs: 10000,
                    actionLabel: 'Undo',
                    onAction: function () {
                      if (typeof storage.undoDelete === 'function') {
                        var undone = storage.undoDelete();
                        if (undone && didRefund) restoreInventorySnapshot(preDelSnap);
                        repaint();
                      }
                    }
                  });
                  repaint();
                }
              }
            })
          )
        ));
      });

      if (filtered.length > showCap) {
        journalListHost.appendChild(S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-compact is-soft no-print',
          style: 'align-self:flex-start',
          text: 'Load ' + Math.min(JOURNAL_PAGE_SIZE, filtered.length - showCap) + ' more (showing ' + showCap + ' of ' + filtered.length + ')',
          onclick: function () {
            ui.journalVisibleLimit = showCap + JOURNAL_PAGE_SIZE;
            S.haptic('tick');
            paintJournalList();
          }
        }));
      }
    }

    paintJournalList();
    return wrap;
  }

  /* ========================================================================
     SEGMENT 3: `At a Coffee Shop` (4-Step Logger: shop -> sdrink -> staste -> sperfect)
     With Explicit <- Previous Step (4->3->2->1) AND <- Back to Home Brew!
     ======================================================================== */
  function makeDefaultShopDraft(store) {
    return {
      on: false,
      step: 'shop', /* 'shop' | 'sdrink' | 'staste' | 'sperfect' */
      name: '',
      city: (store && store.home && store.home.city) || '',
      region: (store && store.home && store.home.region) || '',
      country: (store && store.home && store.home.country) || 'United States',
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
      notes: '',
      at: 0
    };
  }

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
    var defaults = makeDefaultShopDraft(store);
    var merged = Object.assign({}, defaults);
    /* Preserve valid user values while preventing blank/zeroed reset drafts from wiping required defaults */
    var allowEmptyKeys = { name: 1, city: 1, region: 1, menu: 1, amount: 1, notes: 1 };
    var posNumKeys = { shots: 1, price: 1, beans: 1 };
    Object.keys(draft).forEach(function (k) {
      if (!Object.prototype.hasOwnProperty.call(draft, k)) return;
      var v = draft[k];
      if (v === undefined || v === null) return;
      if (k === 'on') { merged.on = !!v; return; }
      if (k === 'at') { merged.at = +v || 0; return; }
      if (posNumKeys[k]) {
        if (isFinite(+v) && +v > 0) merged[k] = +v;
        return;
      }
      if (typeof v === 'string' && v === '' && !allowEmptyKeys[k]) return;
      merged[k] = v;
    });
    if (['shop', 'sdrink', 'staste', 'sperfect'].indexOf(merged.step) < 0) merged.step = 'shop';
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
    var storage = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : null;
    var curStore = { home: { country: 'United States', region: '', city: '' } };
    if (storage && typeof storage.getShops === 'function') {
      try {
        var shRes = storage.getShops();
        if (shRes && shRes.store) curStore = shRes.store;
        else if (shRes && shRes.home) curStore = shRes;
      } catch (_) {}
    }
    if (sh && typeof sh.resetShopDraft === 'function') {
      try { sh.resetShopDraft(); } catch (_) {}
    } else if (sh && typeof sh.clearShopDraft === 'function') {
      try { sh.clearShopDraft(); } catch (_) {}
    }
    var fresh = makeDefaultShopDraft(curStore);
    a.shopDraft = fresh;
    if (storage && typeof storage.saveShopDraft === 'function') {
      try { storage.saveShopDraft(fresh); } catch (_) {}
    }
  }

  function buildCafesSegment(repaint) {
    var ctx = getShopStoreAndDraft();
    var store = ctx.store;
    var d = ctx.draft;
    var storage = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : null;
    var wrap = S.h('div', { style: 'display:flex;flex-direction:column;gap:14px' });

    var computeCafeDrinkKey = function (dr) {
      if (!dr) return '';
      if (typeof drinkKey === 'function') {
        try { return drinkKey(dr); } catch (_) {}
      }
      return [dr.date, dr.shop, dr.city, dr.region, dr.country, dr.kind, dr.name, dr.size, dr.price]
        .map(function (x) { return String(x == null ? '' : x).toLowerCase(); }).join('|');
    };

    var upsertCafeDrinkSafe = function (entry) {
      if (!entry || !storage) return null;
      var newKey = computeCafeDrinkKey(entry);
      if (ui.lastSavedCafeKey && typeof storage.saveShops === 'function') {
        var latestRes = typeof storage.getShops === 'function' ? storage.getShops() : null;
        var curSt = (latestRes && latestRes.store) ? latestRes.store : ((latestRes && Array.isArray(latestRes.drinks)) ? latestRes : store);
        var withoutOld = typeof shopRemoveDrink === 'function'
          ? shopRemoveDrink(curSt, ui.lastSavedCafeKey)
          : Object.assign({}, curSt, { drinks: (curSt.drinks || []).filter(function (x) { return computeCafeDrinkKey(x) !== ui.lastSavedCafeKey; }) });
        var addedRes = typeof shopAddDrink === 'function'
          ? shopAddDrink(withoutOld, entry)
          : { store: Object.assign({}, withoutOld, { drinks: (withoutOld.drinks || []).concat([entry]) }), added: true };
        var nextSt = (addedRes && addedRes.store) ? addedRes.store : withoutOld;
        try { storage.saveShops(nextSt); } catch (_) {}
        store = nextSt;
        ui.lastSavedCafeDrink = entry;
        ui.lastSavedCafeKey = newKey;
        ui.lastSavedCafeFromHistory = false;
        return entry;
      }
      if (typeof storage.shopAddDrink === 'function') {
        try { storage.shopAddDrink(entry); } catch (_) {}
      }
      ui.lastSavedCafeDrink = entry;
      ui.lastSavedCafeKey = newKey;
      ui.lastSavedCafeFromHistory = false;
      return entry;
    };

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
          if (st[0] === 'shop' && (d.step === 'sperfect' || ui.lastSavedCafeFromHistory)) {
            ui.lastSavedCafeDrink = null;
            ui.lastSavedCafeKey = '';
            ui.lastSavedCafeFromHistory = false;
          }
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
          if (ui.lastSavedCafeFromHistory) {
            ui.lastSavedCafeDrink = null;
            ui.lastSavedCafeKey = '';
            ui.lastSavedCafeFromHistory = false;
          }
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
              oninput: function (e) {
                var pv = parseFloat(e.target.value);
                if (isFinite(pv) && pv > 0) { d.price = S.clamp(pv, 0.5, 200); persistShopDraftSafe(d); }
              },
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
        upsertCafeDrinkSafe(entry);
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
        ui.lastSavedCafeKey = '';
        ui.lastSavedCafeFromHistory = false;
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
            var wasUpdate = !!ui.lastSavedCafeKey;
            upsertCafeDrinkSafe(entry);
            d.step = 'sperfect';
            persistShopDraftSafe(d);
            S.haptic('celebrate');
            S.toastSafe((wasUpdate ? 'Updated cafe visit at ' : 'Saved cafe visit to ') + entry.shop + '!');
            repaint();
          }
        }, S.h('span', { text: ui.lastSavedCafeKey ? 'Update Visit & View Home Clone \u2192' : 'Save Visit & View Home Clone \u2192' }), S.iconEl('check-seal', { size: 18 }))
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
      var cSym = targetDrink.sym || '$';

      /* Estimate bag payoff using user's own bags in matching currency if available */
      var userBagsForSym = S.getNormalizedPrices().filter(function (b) { return b && !b.finished && (b.sym || '$') === cSym && +b.price > 0; });
      var typicalBagPrice = userBagsForSym.length
        ? Math.round((userBagsForSym.reduce(function (acc, b) { return acc + (+b.price || 0); }, 0) / userBagsForSym.length) * 100) / 100
        : 21;

      var finishStep4CafeTo = function (dest) {
        if (!ui.lastSavedCafeFromHistory && !ui.lastSavedCafeKey) {
          upsertCafeDrinkSafe(targetDrink);
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
        ui.lastSavedCafeKey = '';
        ui.lastSavedCafeFromHistory = false;
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
            onclick: function () {
              if (ui.lastSavedCafeDrink) {
                d.name = ui.lastSavedCafeDrink.shop || d.name;
                d.beans = ui.lastSavedCafeDrink.beans || d.beans;
                d.strength = ui.lastSavedCafeDrink.strength || d.strength;
                d.sweet = ui.lastSavedCafeDrink.sweet || d.sweet;
                d.worth = ui.lastSavedCafeDrink.worth || d.worth;
                d.again = ui.lastSavedCafeDrink.again || d.again;
                d.notes = ui.lastSavedCafeDrink.notes != null ? ui.lastSavedCafeDrink.notes : d.notes;
              }
              d.step = 'staste';
              persistShopDraftSafe(d);
              repaint();
            }
          }),
          S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-compact is-soft',
            text: '+ Log Another Drink',
            onclick: function () {
              ui.lastSavedCafeDrink = null;
              ui.lastSavedCafeKey = '';
              ui.lastSavedCafeFromHistory = false;
              clearShopDraftSafe();
              repaint();
            }
          })
        )
      ));

      /* Primary Post-Save Navigation Bar on Cafe Step 4: Save -> My Preferences | Save -> Home */
      var alreadySavedNow = !!(ui.lastSavedCafeKey || ui.lastSavedCafeFromHistory);
      stepCard.appendChild(S.h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap;align-items:center' },
        S.h('button', {
          type: 'button',
          id: 'bt-cafe-save-prefs-btn',
          class: 'bt-tc-primary-btn',
          style: 'flex:1 1 180px;width:auto',
          onclick: function () { finishStep4CafeTo('palate'); }
        },
          S.h('span', { style: 'text-align:left;min-width:0;overflow:hidden' },
            S.h('span', { style: 'display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap', text: alreadySavedNow ? 'Done \u2192 My Preferences' : 'Save \u2192 My Preferences' }),
            S.h('span', { class: 'bt-tc-primary-sub', text: alreadySavedNow ? 'Visit saved \u00B7 opens your Taste Preferences' : 'Logs cafe cup & opens your Taste Preferences' })
          ),
          S.iconEl('check-seal', { size: 18 })
        ),
        S.h('button', {
          type: 'button',
          id: 'bt-cafe-save-home-btn',
          class: 'bt-tc-pill is-soft bt-tc-save-home-btn',
          text: alreadySavedNow ? 'Done \u2192 Home' : 'Save \u2192 Home',
          onclick: function () { finishStep4CafeTo('door'); }
        })
      ));

      stepCard.appendChild(S.h('div', { class: 'bt-tc-well' },
        S.h('b', { text: 'Shop vs. Home Cost Comparison' }),
        S.h('div', { class: 'mono', style: 'font-size:0.84rem;color:var(--ink-secondary)', text: 'Cafe Cup: ' + cSym + (+targetDrink.price || 5.75).toFixed(2) + ' vs. Est. Home Clone: ' + cSym + cloneRx.homeCost.toFixed(2) + ' \u2192 Saves ' + cSym + cloneRx.savingsPerCup.toFixed(2) + '/cup (pays off a ' + cSym + typicalBagPrice.toFixed(0) + ' bag in ' + Math.max(2, Math.ceil(typicalBagPrice / Math.max(0.5, cloneRx.savingsPerCup))) + ' mornings!)' })
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
            if (!ui.lastSavedCafeFromHistory && !ui.lastSavedCafeKey) {
              upsertCafeDrinkSafe(targetDrink);
            }
            ui.lastSavedCafeDrink = null;
            ui.lastSavedCafeKey = '';
            ui.lastSavedCafeFromHistory = false;
            clearShopDraftSafe();
            var a = S.getApp();
            a.recipeLocked = false;
            a.lockedMethod = '';
            a.dialNote = null;
            a.cupBrew = null;
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
            a.brew.dialAdaptation = null;
            a.brew.actualSecs = null;
            a.brew.actualFromTimer = false;
            a.brew._savedDialedMethod = cloneRx.methodKey;
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
      var shopCap = Math.min(realShops.length, ui.cafeShopsLimit || CAFE_PAGE_SIZE);
      realShops.slice(0, shopCap).forEach(function (sh) {
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
      if (realShops.length > shopCap) {
        boardCard.appendChild(S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-compact is-soft',
          style: 'align-self:flex-start',
          text: 'Load ' + Math.min(CAFE_PAGE_SIZE, realShops.length - shopCap) + ' more shops (' + shopCap + ' of ' + realShops.length + ')',
          onclick: function () { ui.cafeShopsLimit = shopCap + CAFE_PAGE_SIZE; repaint(); }
        }));
      }
    } else {
      var listToShow = realDrinks.slice().reverse().filter(function (dr) {
        return ui.cafeBoardTab !== 'favorites' || !!dr.fav;
      });
      if (!listToShow.length) {
        boardCard.appendChild(S.h('div', { class: 'bt-tc-sub', text: 'No favorites starred yet \u2014 tap Favorite on any logged drink below.' }));
      }
      var drinkCap = Math.min(listToShow.length, ui.cafeDrinksLimit || CAFE_PAGE_SIZE);
      listToShow.slice(0, drinkCap).forEach(function (dr) {
        var meta = findDrinkMeta(dr.kind);
        var dKey = computeCafeDrinkKey(dr);
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
                  ui.lastSavedCafeKey = dKey;
                  ui.lastSavedCafeFromHistory = true;
                  d.step = 'sperfect';
                  persistShopDraftSafe(d);
                  repaint();
                }
              }),
              S.h('button', {
                type: 'button',
                class: 'bt-tc-pill is-compact is-soft',
                text: 'Delete',
                onclick: function () {
                  if (storage && typeof storage.saveShops === 'function') {
                    var prevStoreSnap = Object.assign({}, store, { drinks: (store.drinks || []).slice(), shops: (store.shops || []).slice() });
                    var nextSt = typeof shopRemoveDrink === 'function'
                      ? shopRemoveDrink(store, dKey)
                      : Object.assign({}, store, { drinks: (store.drinks || []).filter(function (x) { return computeCafeDrinkKey(x) !== dKey; }) });
                    storage.saveShops(nextSt);
                    S.toastSafe('Removed cafe drink', {
                      durationMs: 10000,
                      actionLabel: 'Undo',
                      onAction: function () {
                        storage.saveShops(prevStoreSnap);
                        repaint();
                      }
                    });
                    repaint();
                  }
                }
              })
            )
          )
        ));
      });
      if (listToShow.length > drinkCap) {
        boardCard.appendChild(S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-compact is-soft',
          style: 'align-self:flex-start',
          text: 'Load ' + Math.min(CAFE_PAGE_SIZE, listToShow.length - drinkCap) + ' more drinks (' + drinkCap + ' of ' + listToShow.length + ')',
          onclick: function () { ui.cafeDrinksLimit = drinkCap + CAFE_PAGE_SIZE; repaint(); }
        }));
      }
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
    var storage = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : null;
    /* Call with no args so BTStorage._unifiedIndexCache hits in O(1) */
    var unified = (storage && typeof storage.buildUnifiedCoffeesIndex === 'function')
      ? storage.buildUnifiedCoffeesIndex()
      : [];
    var vaultList = getCoffeesVaultSafe();
    var lookupIdx = buildRecordsLookupIndex(unified, list, vaultList);

    /* O(P) pre-grouping for priceChange vs previous purchase (replaces O(P^2) priceChange scan) */
    var priceHistGroups = Object.create(null);
    list.forEach(function (b, idx) {
      if (!b || !b.coffee) return;
      var gk = [String(b.coffee || '').toLowerCase(), String(b.roaster || '').toLowerCase(), String(b.sym || '$'), String(b.kind || 'bag')].join('|');
      if (!priceHistGroups[gk]) priceHistGroups[gk] = [];
      priceHistGroups[gk].push({ b: b, idx: idx });
    });
    var priceChangeByKey = Object.create(null);
    Object.keys(priceHistGroups).forEach(function (gk) {
      var arr = priceHistGroups[gk];
      if (arr.length < 2) return;
      arr.sort(function (x, y) { return String(x.b.date || '').localeCompare(String(y.b.date || '')) || (x.idx - y.idx); });
      var prev = arr[arr.length - 2].b;
      var cur = arr[arr.length - 1].b;
      var unitVal = function (x) {
        if (!x || !(+x.price > 0)) return null;
        if (x.kind === 'pods' || x.unit === 'pods') return +x.size > 0 ? (+x.price / +x.size) : null;
        var g = bagSizeToGrams(x.size, x.unit);
        return g > 0 ? (+x.price / g) * 100 : null;
      };
      var v0 = unitVal(prev), v1 = unitVal(cur);
      if (v0 > 0 && v1 > 0) {
        var pct = Math.round(((v1 - v0) / v0) * 1000) / 10;
        priceChangeByKey[gk] = { ok: true, pct: pct, dir: Math.abs(pct) < 1 ? 'same' : (pct > 0 ? 'up' : 'down') };
      }
    });

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
      var curUnit = pd.unit || 'g';
      var weightLabelEl = S.h('span', { text: curUnit === 'pods' ? 'Count (pods)' : ('Weight (' + curUnit + ')') });
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
              placeholder: 'Origin (e.g. Huila, Colombia)',
              value: pd.origin || '',
              'aria-label': 'Bag origin',
              oninput: function (e) { pd.origin = e.target.value; }
            })
          ),
          S.h('div', { class: 'bt-tc-spotlight' },
            S.h('input', {
              type: 'text',
              placeholder: 'Process (e.g. Washed, Natural, Honey)',
              value: pd.process || '',
              'aria-label': 'Bag process',
              oninput: function (e) { pd.process = e.target.value; }
            })
          )
        ),
        S.h('div', { class: 'bt-tc-spotlight' },
          S.h('input', {
            type: 'text',
            placeholder: 'Bag Flavors (e.g. Jasmine, Peach, Bergamot)',
            value: pd.bag_notes || '',
            'aria-label': 'Bag tasting notes',
            oninput: function (e) { pd.bag_notes = e.target.value; }
          })
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
        S.h('div', { style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px' },
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
                oninput: function (e) { var v = parseFloat(e.target.value); if (isFinite(v) && v > 0) pd.price = v; },
                onchange: function (e) { pd.price = +e.target.value || 20; }
              })
            )
          ),
          S.h('label', { style: 'font-size:0.75rem;font-weight:700;display:flex;flex-direction:column;gap:4px' },
            weightLabelEl,
            S.h('div', { class: 'bt-tc-spotlight', style: 'min-height:44px' },
              S.h('input', {
                type: 'number',
                inputmode: 'decimal',
                step: 'any',
                value: String(pd.size),
                'aria-label': curUnit === 'pods' ? 'Bag pod count' : ('Bag weight (' + curUnit + ')'),
                oninput: function (e) { var v = parseFloat(e.target.value); if (isFinite(v) && v > 0) pd.size = v; },
                onchange: function (e) { pd.size = +e.target.value || (pd.unit === 'pods' ? 10 : 250); }
              }),
              S.h('select', {
                style: 'max-width:68px;font-weight:700',
                'aria-label': 'Bag weight unit',
                onchange: function (e) {
                  pd.unit = e.target.value || 'g';
                  weightLabelEl.textContent = pd.unit === 'pods' ? 'Count (pods)' : ('Weight (' + pd.unit + ')');
                }
              },
                ['g', 'oz', 'lb', 'kg', 'pods'].map(function (unOpt) {
                  return S.h('option', { value: unOpt, selected: curUnit === unOpt, text: unOpt });
                })
              )
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
            var saveUnit = pd.unit || (prevBag && prevBag.unit) || 'g';
            var saveSize = (+pd.size > 0 && isFinite(+pd.size)) ? +pd.size : (saveUnit === 'pods' ? 10 : 250);
            var newTotalG = saveUnit === 'pods'
              ? Math.round(saveSize)
              : Math.round((bagSizeToGrams(saveSize, saveUnit) || 250) * 10) / 10;
            var nextRemG = newTotalG;
            if (prevBag) {
              var switchedPodKind = (prevBag.unit === 'pods') !== (saveUnit === 'pods');
              if (!switchedPodKind && prevBag.rem_g != null && isFinite(+prevBag.rem_g)) {
                nextRemG = Math.max(0, Math.min(Math.round(+prevBag.rem_g * 10) / 10, newTotalG));
              }
            }
            var canonicalEntry = S.normalizePriceBag({
              id: (prevBag && prevBag.id) || ('bag_' + Date.now()),
              coffee_id: (prevBag && prevBag.coffee_id) || '',
              kind: saveUnit === 'pods' ? 'pods' : 'bag',
              coffee: cTrim,
              roaster: pd.roaster.trim(),
              size: saveSize,
              unit: saveUnit,
              price: +pd.price || 20,
              currency: pd.currency || '$',
              sym: pd.currency || '$',
              rlevel: pd.rlevel || 'light',
              date: pd.date || S.isoDaysAgo(0),
              roast: pd.roast || '',
              rem_g: nextRemG,
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
            if (saveUnit !== 'pods') {
              var cidForVault = canonicalEntry.coffee_id || (!isSyntheticCoffeeId(canonicalEntry.id) ? canonicalEntry.id : '');
              upsertVaultSafe({
                id: cidForVault,
                name: canonicalEntry.coffee,
                roaster: canonicalEntry.roaster,
                roast: canonicalEntry.rlevel || 'light',
                roast_date: canonicalEntry.roast || '',
                bag_weight_g: newTotalG,
                remaining_g: canonicalEntry.rem_g,
                price: canonicalEntry.price,
                currency: canonicalEntry.currency || canonicalEntry.sym || '$',
                bag_notes: canonicalEntry.bag_notes || canonicalEntry.notes || '',
                notes: canonicalEntry.bag_notes || canonicalEntry.notes || '',
                origin: canonicalEntry.origin || '',
                process: canonicalEntry.process || '',
                varietal: canonicalEntry.varietal || '',
                elevation_m: canonicalEntry.elevation_m || ''
              }, null, { forceRemaining: true });
              if (!canonicalEntry.finished) {
                setVaultShelfArchived(cidForVault, canonicalEntry.coffee, canonicalEntry.roaster, false, canonicalEntry.rem_g);
              }
            }
            resetPriceDraft();
            ui.priceAddOpen = false;
            S.haptic('celebrate');
            S.toastSafe((isEditingPrice ? 'Updated ' : 'Saved ') + canonicalEntry.coffee + ' to Shelf & Price Tracker!');
            repaint();
          }
        }, S.h('span', { text: isEditingPrice ? 'Update Bag in Shelf & Tracker \u2192' : 'Save Bag to Shelf & Tracker \u2192' }), S.iconEl('check-seal', { size: 18 }))
      ));
    }

    var priceSearchTimer = null;
    var pricesCountEl = S.h('span', { class: 'bt-tc-sub', style: 'margin:0', 'aria-live': 'polite' });
    var pricesListHost = S.h('div', { style: 'display:flex;flex-direction:column;gap:14px' });

    var priceInput = S.h('input', {
      type: 'search',
      class: 'bt-tc-search',
      placeholder: 'Search bags by coffee, roaster, origin, or notes...',
      value: ui.priceQ,
      'aria-label': 'Search bag prices',
      oninput: function (e) {
        ui.priceQ = e.target.value;
        priceClear.style.display = ui.priceQ ? '' : 'none';
        ui.priceVisibleLimit = PRICES_PAGE_SIZE;
        clearTimeout(priceSearchTimer);
        priceSearchTimer = setTimeout(paintPricesList, 120);
      }
    });
    var priceClear = S.h('button', {
      type: 'button',
      class: 'bt-tc-search-clear no-print',
      'aria-label': 'Clear bag price search',
      style: 'display:' + (ui.priceQ ? '' : 'none') + ';background:none;border:0;font-size:1.25rem;line-height:1;min-width:32px;min-height:32px;cursor:pointer;color:var(--ink-secondary)',
      text: '\u00D7',
      onclick: function () {
        clearTimeout(priceSearchTimer);
        ui.priceQ = '';
        priceInput.value = '';
        priceClear.style.display = 'none';
        ui.priceVisibleLimit = PRICES_PAGE_SIZE;
        paintPricesList();
        priceInput.focus();
      }
    });

    wrap.appendChild(S.h('div', { class: 'bt-tc-spotlight no-print' },
      S.iconEl('search-filter', { size: 17 }),
      priceInput,
      priceClear
    ));

    wrap.appendChild(S.h('div', { class: 'bt-tc-pill-scroll' },
      [['open', 'Open Bags'], ['finished', 'Finished'], ['all', 'All Purchases']].map(function (sh) {
        return S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-compact' + (ui.priceShow === sh[0] ? ' is-active' : ' is-soft'),
          text: sh[1],
          onclick: function () { ui.priceShow = sh[0]; ui.priceVisibleLimit = PRICES_PAGE_SIZE; repaint(); }
        });
      }),
      [['use_first', 'Sort: Use First'], ['newest', 'Newest'], ['cheap', 'Best $/100g'], ['name', 'Name']].map(function (so) {
        return S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-compact' + (ui.priceSort === so[0] ? ' is-copper' : ' is-soft'),
          text: so[1],
          onclick: function () { ui.priceSort = so[0]; ui.priceVisibleLimit = PRICES_PAGE_SIZE; repaint(); }
        });
      })
    ));
    wrap.appendChild(pricesCountEl);
    wrap.appendChild(pricesListHost);

    var allPriceRows = list.map(function (b, idx) {
      var bagWithIdx = Object.assign({ _priceIdx: idx }, b);
      var matchedP = findCoffeeRecordsMatch(b.coffee_id || b.id, b.coffee, b.roaster, { lookupIdx: lookupIdx });
      var uR = matchedP.uRec;
      var vR = matchedP.vaultRec;
      var ev = evaluateShelfBag(bagWithIdx, uR || vR);
      var sym = b.sym || (b.currency === 'EUR' ? '\u20AC' : b.currency === 'GBP' ? '\u00A3' : b.currency === 'CAD' ? 'CA$' : b.currency === 'AUD' ? 'A$' : '$');
      var pBagNotes = pickRichStr(vR && vR.bag_notes, vR && vR.notes, uR && uR.bag_notes, b.bag_notes, b.notes);
      var pOrigin = pickRichStr(vR && vR.origin, uR && uR.origin, b.origin);
      var pProc = pickRichStr(vR && vR.process, uR && uR.process, b.process);
      var hay = [b.coffee, b.roaster, pOrigin, pProc, pBagNotes, b.rlevel].filter(Boolean).join(' ').toLowerCase();
      var gk = [String(b.coffee || '').toLowerCase(), String(b.roaster || '').toLowerCase(), String(b.sym || '$'), String(b.kind || 'bag')].join('|');
      return { b: bagWithIdx, idx: idx, uRec: uR, vRec: vR, ev: ev, sym: sym, pBagNotes: pBagNotes, pOrigin: pOrigin, pProc: pProc, hay: hay, chg: priceChangeByKey[gk] || { ok: false } };
    });

    function paintPricesList() {
      var q = String(ui.priceQ || '').trim().toLowerCase();
      var qToks = q ? q.split(/\s+/).filter(Boolean) : [];
      var rows = allPriceRows.filter(function (it) {
        if (ui.priceShow === 'open' && it.b.finished) return false;
        if (ui.priceShow === 'finished' && !it.b.finished) return false;
        if (!qToks.length) return true;
        return qToks.every(function (tok) { return it.hay.indexOf(tok) >= 0; });
      });

      rows.sort(function (x, y) {
        if (ui.priceSort === 'use_first') {
          var xf = (x.b.finished || x.ev.isEmpty) ? 1 : 0;
          var yf = (y.b.finished || y.ev.isEmpty) ? 1 : 0;
          if (xf !== yf) return xf - yf;
          var xl = x.ev.isFrozen ? 9999 : (x.ev.rawAge == null ? 5000 : (x.ev.peakEnd - x.ev.effAge));
          var yl = y.ev.isFrozen ? 9999 : (y.ev.rawAge == null ? 5000 : (y.ev.peakEnd - y.ev.effAge));
          return (xl - yl) || (x.idx - y.idx);
        }
        if (ui.priceSort === 'cheap') {
          if (x.sym !== y.sym) return x.sym.localeCompare(y.sym);
          if (x.ev.isPods !== y.ev.isPods) return x.ev.isPods ? 1 : -1;
          var xv = x.ev.isPods ? (x.ev.perCup != null ? x.ev.perCup : 1e9) : (x.ev.per100g != null ? x.ev.per100g : 1e9);
          var yv = y.ev.isPods ? (y.ev.perCup != null ? y.ev.perCup : 1e9) : (y.ev.per100g != null ? y.ev.per100g : 1e9);
          return (xv - yv) || (x.idx - y.idx);
        }
        if (ui.priceSort === 'name') return String(x.b.coffee || '').localeCompare(String(y.b.coffee || ''));
        return String(y.b.date || '').localeCompare(String(x.b.date || '')) || (x.idx - y.idx);
      });

      pricesListHost.textContent = '';
      var showCap = Math.min(rows.length, ui.priceVisibleLimit || PRICES_PAGE_SIZE);
      pricesCountEl.textContent = rows.length
        ? ('Showing ' + showCap + ' of ' + rows.length + ' bag' + (rows.length === 1 ? '' : 's'))
        : '';

      if (!rows.length) {
        pricesListHost.appendChild(S.h('section', { class: 'bt-tc-card', style: 'text-align:center;padding:20px' },
          S.h('b', { text: 'No bags in this view yet.' }),
          S.h('p', { class: 'bt-tc-sub', text: 'Tap "+ Log Bag Purchase" above (or paste an AI bag scan on Step 1) to track $/cup & 12-oz value.' })
        ));
        return;
      }

      rows.slice(0, showCap).forEach(function (it) {
        var b = it.b;
        var uRec = it.uRec;
        var vRec = it.vRec;
        var ev = it.ev;
        var chg = it.chg;
        var sym = it.sym;
        var pBagNotes = it.pBagNotes;
        var pOrigin = it.pOrigin;
        var pProc = it.pProc;
        var pMeta = [pOrigin, pProc].filter(Boolean).join(' \u00B7 ');
        var priceMetricsTxt = '';
        if (ev.isPods) {
          priceMetricsTxt = sym + b.price.toFixed(2) + ' / ' + b.size + ' pods' +
            (ev.perCup != null ? (' \u00B7 ' + sym + ev.perCup.toFixed(2) + '/pod') : ' \u00B7 Price unlisted');
        } else {
          var eq12oz = ev.per100g != null ? (ev.per100g * 3.40194).toFixed(2) : '';
          priceMetricsTxt = sym + b.price.toFixed(2) + ' / ' + b.size + b.unit +
            (ev.perCup != null ? (' \u00B7 ' + sym + ev.perCup.toFixed(2) + '/' + ev.doseRef + 'g cup') : ' \u00B7 Price unlisted') +
            (eq12oz ? (' \u00B7 ' + sym + eq12oz + ' per 12oz eq.') : '');
        }

        pricesListHost.appendChild(S.h('article', {
          class: 'bt-cellar-bag-card',
          style: '--bag-roast-color:' + S.roastColorFor(b.rlevel)
        },
          S.h('div', { class: 'bt-tc-row-between' },
            S.h('div', null,
              S.h('div', { class: 'bt-tc-kicker', text: [b.roaster || 'Roaster', b.date, b.rlevel, pMeta].filter(Boolean).join(' \u00B7 ') }),
              S.h('b', { style: 'font-size:1rem;font-family:var(--font-display)', text: b.coffee }),
              S.h('div', { class: 'mono', style: 'font-size:0.79rem;color:var(--ink-secondary)', text: priceMetricsTxt }),
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
                  var finishing = !b.finished;
                  var bagRemKey = String(b.id || it.idx);
                  if (finishing) {
                    if (+next[it.idx].rem_g > 0) ui.reopenRemMap[bagRemKey] = +next[it.idx].rem_g;
                    next[it.idx].finished = S.isoDaysAgo(0);
                    next[it.idx].rem_g = 0;
                  } else {
                    next[it.idx].finished = '';
                    if (+next[it.idx].rem_g <= 0.4 && ui.reopenRemMap[bagRemKey] > 0) {
                      next[it.idx].rem_g = ui.reopenRemMap[bagRemKey];
                    }
                  }
                  S.saveNormalizedPrices(next);
                  var hasOtherOpen = next.some(function (ob, oi) {
                    return oi !== it.idx && ob && !ob.finished && sameCoffeeTarget(ob, b);
                  });
                  if (!ev.isPods && !hasOtherOpen) {
                    setVaultShelfArchived(b.coffee_id || b.id, b.coffee, b.roaster || '', finishing, next[it.idx].rem_g);
                  }
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
                  var prevVaultSnap = getCoffeesVaultSafe().map(function (v) { return Object.assign({}, v); });
                  storage.deletePriceBag(it.idx);
                  var remainingPrices = S.getNormalizedPrices();
                  var hasOtherOpen = remainingPrices.some(function (ob) {
                    return ob && !ob.finished && sameCoffeeTarget(ob, b);
                  });
                  if (!ev.isPods && !hasOtherOpen) {
                    setVaultShelfArchived(b.coffee_id || b.id, b.coffee, b.roaster || '', true, 0);
                  }
                  S.toastSafe('Removed bag entry', {
                    durationMs: 10000,
                    actionLabel: 'Undo',
                    onAction: function () {
                      if (typeof storage.undoPriceDelete === 'function') {
                        var undone = storage.undoPriceDelete();
                        if (undone && typeof storage.saveCoffeesVaultList === 'function') {
                          try { storage.saveCoffeesVaultList(prevVaultSnap); } catch (_) {}
                        }
                        repaint();
                      }
                    }
                  });
                  repaint();
                }
              }
            })
          )
        ));
      });

      if (rows.length > showCap) {
        pricesListHost.appendChild(S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-compact is-soft no-print',
          style: 'align-self:flex-start',
          text: 'Load ' + Math.min(PRICES_PAGE_SIZE, rows.length - showCap) + ' more (showing ' + showCap + ' of ' + rows.length + ')',
          onclick: function () {
            ui.priceVisibleLimit = showCap + PRICES_PAGE_SIZE;
            S.haptic('tick');
            paintPricesList();
          }
        }));
      }
    }

    paintPricesList();
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
    var safeQrMarkup = (qrMarkup && /^\s*<svg[\s>]/i.test(qrMarkup) && !/<script\b|javascript:|on[a-z]+\s*=/i.test(qrMarkup))
      ? qrMarkup
      : '';
    if (safeQrMarkup) {
      qrBox.innerHTML = safeQrMarkup;
    } else {
      qrBox.textContent = (art && art.textCode) || 'QR preview unavailable';
    }

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

  /* Tasting Detail Sheet (w/ explicit dynamic <- Back!) */
  S.registerSheetSafe('screen-detail', function (host, payload) {
    var hObjs = S.getHistoryObjs();
    var rIdx = payload && payload.rowIdx != null ? +payload.rowIdx : 0;
    var r = (payload && payload.row) || hObjs[rIdx] || {};
    var backLabel = (payload && payload.backLabel) || (ui.seg === 'shelf' ? '\u2190 Back to Shelf' : '\u2190 Back to Journal');
    var storage = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : null;
    var un = function (v) { return typeof unneutralize === 'function' ? unneutralize(v || '') : String(v || ''); };
    var isLocked = r.dial_locked === 'yes' || r.dial_locked === '1';
    var timeSecs = +(r.brew_actual_time_s || r.brew_time_s) || 0;
    var detailChron = getCoffeeHistoryChronological(r.coffee_name, r.roaster, r.coffee_id, hObjs);
    var detailTimeline = buildDialInConvergenceTimeline(detailChron, r, { compact: false });
    var blendInfo = extractRowBlendInfo(r);
    var v74Meta = extractRowV74Meta(r);
    var detailNextRec = !isLocked ? extractRowRecommendation(r) : { hasRec: false };

    var aDet = S.getApp();
    var detTempUnit = (aDet && aDet.prefs && aDet.prefs.tempUnit === 'F') ? 'F' : 'C';
    var detTempC = parseFloat(r.brew_temp_c);
    var detTempF = parseFloat(r.brew_temp_f);
    var detTempStr = '';
    if (detTempUnit === 'F') {
      if (isFinite(detTempF) && detTempF > 0) detTempStr = detTempF + ' \u00B0F';
      else if (isFinite(detTempC) && detTempC > 0) detTempStr = Math.round(detTempC * 9 / 5 + 32) + ' \u00B0F';
    } else {
      if (isFinite(detTempC) && detTempC > 0) detTempStr = detTempC + ' \u00B0C';
      else if (isFinite(detTempF) && detTempF > 0) detTempStr = Math.round((detTempF - 32) * 5 / 9) + ' \u00B0C';
    }

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
      ['Dose : Water', (function () {
        var d = safePosNumDisp(r.brew_dose_g, 2000);
        var w = safePosNumDisp(r.brew_water_g, 20000);
        return (d || w) ? ((d || '\u2014') + ' g : ' + (w || '\u2014') + ' g') : '';
      })()],
      ['Ratio', (function () { var rt = safePosNumDisp(r.brew_ratio, 60); return rt ? ('1:' + rt) : ''; })()],
      ['Grind', [un(r.brew_grind_setting), (function () { var um = safePosNumDisp(r.brew_grind_target_um, 5000); return um ? (um + ' \u00B5m') : ''; })()].filter(Boolean).join(' \u00B7 ')],
      ['Temp', detTempStr],
      v74Meta.tempProfileLabel ? ['Temp Profile', v74Meta.tempProfileLabel] : null,
      ['Brew Time', (isFinite(timeSecs) && timeSecs > 0) ? (S.fmtMmSs(timeSecs) + ' (' + timeSecs + 's)') : ''],
      ['Beverage Yield', (function () { var o = safePosNumDisp(r.brew_out_g, 20000); return o ? (o + ' g') : ''; })()],
      ['Strength (%TDS) / Extraction (%EY)', (function () {
        var tds = safePosNumDisp(r.brew_tds_pct, 30);
        var ey = safePosNumDisp(r.brew_ey_pct, 40);
        return tds ? (tds + '% / ' + (ey || '\u2014') + '%') : '';
      })()],
      v74Meta.palateTargetsLabel ? ['Palate Targets', v74Meta.palateTargetsLabel] : null,
      ['Cupping Score', (function () { var sc = safeRowScaNum(r); return sc > 0 ? (sc + ' / 100') : ''; })()],
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
        }, S.h('span', { text: backLabel })),
        S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-compact is-soft',
          text: 'Edit Tasting',
          onclick: function () { openTastingEditSheet(rIdx, 'tasting', { fromDetail: true, backLabel: backLabel }); }
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
        S.h('span', { class: 'bt-tc-badge is-good mono', text: (function () {
          var st = safeRowStarsNum(r);
          var sc = safeRowScaNum(r);
          return st > 0 ? (st.toFixed(2) + ' / 5.00') : (sc > 0 ? (sc + ' / 100') : 'Logged');
        })() })
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
      detailNextRec.hasRec ? buildSavedNextBrewCallout(r, false) : null,
      S.h('div', { class: 'bt-tc-pill-wrap no-print' },
        S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-active',
          text: detailNextRec.hasRec ? 'Apply Fix & Brew Next \u2192' : 'Brew This Recipe \u2192',
          onclick: function () {
            hydrateBrewFromRowOrBag(r, null, null);
            S.closeSheetSafe();
            navigateToHomeRecipe();
          }
        }),
        detailNextRec.hasRec ? S.h('button', {
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
          onclick: function () { openTastingEditSheet(rIdx, 'coffee', { fromDetail: true, backLabel: backLabel }); }
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

  /* Edit Tasting & Multi-Brew Coffee Editor Sheet (P0-15 + P1 Blend Split & Undo + P2 Temp Unit & In-Place EY) */
  S.registerSheetSafe('screen-tasting-edit', function (host, payload) {
    var hObjs = S.getHistoryObjs();
    var rIdx = payload && payload.rowIdx != null ? +payload.rowIdx : 0;
    var r = (payload && payload.row) || hObjs[rIdx] || {};
    var fromDetail = !!(payload && payload.fromDetail);
    var backLabel = (payload && payload.backLabel) || (ui.seg === 'shelf' ? '\u2190 Back to Shelf' : '\u2190 Back to Journal');
    var storage = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : null;
    var un = function (v) { return typeof unneutralize === 'function' ? unneutralize(v || '') : String(v || ''); };

    var aEd = S.getApp();
    var tempPref = (aEd && aEd.prefs && aEd.prefs.tempUnit === 'F') ? 'F' : 'C';

    var editTab = (payload && payload.tab) || 'tasting';
    var baseEdit = (typeof tastingEditFromRow === 'function') ? tastingEditFromRow(r) : {
      brew: { dose: r.brew_dose_g || '15', water: r.brew_water_g || '250', temp_f: r.brew_temp_f || '200', actual_s: r.brew_actual_time_s || '', out_g: r.brew_out_g || '', tds: r.brew_tds_pct || '' },
      notes: un(r.general_notes),
      quick: { stars: parseFloat(r.my_rating_stars) || 4.25, makeAgain: r.make_again || 'yes', sym: r.fix_symptom || '' }
    };
    if (!baseEdit.brew) baseEdit.brew = {};
    if (!baseEdit.quick) baseEdit.quick = { stars: '', makeAgain: 'yes', sym: '' };

    var tempEdited = false;
    var tempDisplayVal = '';
    if (tempPref === 'C') {
      var initC = parseFloat(r.brew_temp_c);
      var initF = parseFloat(baseEdit.brew.temp_f || r.brew_temp_f);
      if (isFinite(initC) && initC > 0) tempDisplayVal = String(initC);
      else if (isFinite(initF) && initF > 0) tempDisplayVal = String(Math.round(((initF - 32) * 5 / 9) * 10) / 10);
    } else {
      var initF2 = parseFloat(baseEdit.brew.temp_f || r.brew_temp_f);
      var initC2 = parseFloat(r.brew_temp_c);
      if (isFinite(initF2) && initF2 > 0) tempDisplayVal = String(initF2);
      else if (isFinite(initC2) && initC2 > 0) tempDisplayVal = String(Math.round((initC2 * 9 / 5 + 32) * 10) / 10);
    }

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
        }, S.h('span', { text: fromDetail ? '\u2190 Back to Detail' : backLabel }))
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
        var liveEyEl = S.h('div', {
          class: 'mono',
          style: 'font-size:0.82rem;color:var(--science);font-weight:700;display:none'
        });
        function updateLiveEy() {
          var tdsN = parseFloat(baseEdit.brew.tds);
          var outN = parseFloat(baseEdit.brew.out_g);
          var doseN = parseFloat(baseEdit.brew.dose);
          if (isFinite(tdsN) && tdsN > 0 && isFinite(outN) && outN > 0 && isFinite(doseN) && doseN > 0) {
            liveEyEl.textContent = 'Computed Cup Extraction: ' + ((tdsN * outN) / doseN).toFixed(2) + '% Extraction (%EY)';
            liveEyEl.style.display = '';
          } else {
            liveEyEl.textContent = '';
            liveEyEl.style.display = 'none';
          }
        }
        updateLiveEy();

        container.appendChild(S.h('div', { style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px' },
          [
            ['Dose (g)', 'dose'],
            ['Water (g)', 'water'],
            [tempPref === 'C' ? 'Temp (\u00B0C)' : 'Temp (\u00B0F)', '_temp'],
            ['Actual Time (s)', 'actual_s'],
            ['Mug Yield (g)', 'out_g'],
            ['Strength (%TDS)', 'tds']
          ].map(function (fd) {
            var isTempField = fd[1] === '_temp';
            return S.h('label', { style: 'font-size:0.75rem;font-weight:700;display:flex;flex-direction:column;gap:4px' },
              S.h('span', { text: fd[0] }),
              S.h('div', { class: 'bt-tc-spotlight', style: 'min-height:44px' },
                S.h('input', {
                  type: 'number',
                  inputmode: 'decimal',
                  step: 'any',
                  value: isTempField ? tempDisplayVal : String(baseEdit.brew[fd[1]] || ''),
                  oninput: function (e) {
                    var valStr = e.target.value;
                    if (isTempField) {
                      tempEdited = true;
                      tempDisplayVal = valStr;
                      var tTrim = valStr.trim();
                      if (tempPref === 'C') {
                        if (tTrim === '') {
                          baseEdit.brew.temp_f = '';
                        } else {
                          var cNum = parseFloat(tTrim);
                          if (isFinite(cNum) && cNum >= 0 && cNum <= 100) {
                            baseEdit.brew.temp_f = String(Math.round((cNum * 9 / 5 + 32) * 10) / 10);
                          }
                        }
                      } else {
                        baseEdit.brew.temp_f = tTrim;
                      }
                    } else {
                      baseEdit.brew[fd[1]] = valStr;
                      updateLiveEy();
                    }
                  }
                })
              )
            );
          })
        ));
        container.appendChild(liveEyEl);

        var starBtns = [];
        var starVals = [1.0, 1.5, 2.0, 2.5, 3.0, 3.25, 3.5, 3.75, 4.0, 4.25, 4.5, 4.75, 5.0];
        container.appendChild(S.h('div', { style: 'display:flex;flex-direction:column;gap:4px' },
          S.h('span', { class: 'bt-tc-kicker', text: 'Rating' }),
          S.h('div', { class: 'bt-tc-pill-wrap', style: 'flex-wrap:wrap' },
            starVals.map(function (stV) {
              var btn = S.h('button', {
                type: 'button',
                class: 'bt-tc-pill is-compact mono' + (+baseEdit.quick.stars === stV ? ' is-active' : ' is-soft'),
                text: stV + ' / 5',
                onclick: function () {
                  baseEdit.quick.stars = stV;
                  starBtns.forEach(function (sb) {
                    sb.el.className = 'bt-tc-pill is-compact mono' + (sb.v === stV ? ' is-active' : ' is-soft');
                  });
                }
              });
              starBtns.push({ el: btn, v: stV });
              return btn;
            })
          )
        ));

        var symBtns = [];
        var symOpts = [
          ['', 'None'],
          ['balanced', 'Balanced'],
          ['sour', 'Sour'],
          ['bitter', 'Bitter'],
          ['weak', 'Weak'],
          ['strong', 'Strong'],
          ['astringent', 'Dry']
        ];
        container.appendChild(S.h('div', { style: 'display:flex;flex-direction:column;gap:4px' },
          S.h('span', { class: 'bt-tc-kicker', text: 'Balance Symptom' }),
          S.h('div', { class: 'bt-tc-pill-wrap', style: 'flex-wrap:wrap' },
            symOpts.map(function (so) {
              var curSym = String(baseEdit.quick.sym || '').trim().toLowerCase();
              var btn = S.h('button', {
                type: 'button',
                class: 'bt-tc-pill is-compact' + (curSym === so[0] ? ' is-active' : ' is-soft'),
                text: so[1],
                onclick: function () {
                  baseEdit.quick.sym = so[0];
                  symBtns.forEach(function (sb) {
                    sb.el.className = 'bt-tc-pill is-compact' + (sb.v === so[0] ? ' is-active' : ' is-soft');
                  });
                }
              });
              symBtns.push({ el: btn, v: so[0] });
              return btn;
            })
          )
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
                if (tempPref === 'C' && tempEdited) {
                  var rawTempStr = String(tempDisplayVal || '').trim();
                  if (rawTempStr === '') {
                    baseEdit.brew.temp_f = '';
                  } else {
                    var cVal = parseFloat(rawTempStr);
                    if (!isFinite(cVal) || !/^\d+(\.\d+)?$/.test(rawTempStr) || cVal < 0 || cVal > 100) {
                      S.toastSafe('The temperature needs a number from 0 to 100 \u00B0C.');
                      return;
                    }
                    baseEdit.brew.temp_f = String(Math.round((cVal * 9 / 5 + 32) * 10) / 10);
                  }
                }
                var preEditInvSnap = captureInventorySnapshot();
                var oldDoseG = parseFloat(r.brew_dose_g);
                var newDoseG = parseFloat(baseEdit.brew && baseEdit.brew.dose);
                var res = storage.commitTastingEdit(rIdx, baseEdit);
                if (res && res.error) {
                  S.toastSafe(res.error);
                  return;
                }
                var updatedObjs = S.getHistoryObjs();
                var updatedRow = updatedObjs[rIdx] || r;
                var delta = (isFinite(oldDoseG) && isFinite(newDoseG)) ? (Math.round((newDoseG - oldDoseG) * 10) / 10) : 0;
                var didReconcileBag = false;
                var editBlend = extractRowBlendInfo(updatedRow);
                if (!editBlend.isBlend) editBlend = extractRowBlendInfo(r);

                if (Math.abs(delta) > 0.0001 && typeof storage.reconcileBagDoseDelta === 'function') {
                  if (editBlend.isBlend && Array.isArray(editBlend.components) && editBlend.components.length >= 2) {
                    var compA = editBlend.components[0];
                    var compB = editBlend.components[1];
                    var shareA = (editBlend.pctA > 0 && editBlend.pctA < 100)
                      ? (editBlend.pctA / 100)
                      : ((compA.weightG > 0 && compB.weightG > 0) ? (compA.weightG / (compA.weightG + compB.weightG)) : 0.5);
                    var deltaA = Math.round(delta * shareA * 10) / 10;
                    var deltaB = Math.round((delta - deltaA) * 10) / 10;
                    var newWeightA = Math.round(newDoseG * shareA * 10) / 10;
                    var newWeightB = Math.round((newDoseG - newWeightA) * 10) / 10;

                    [[compA, deltaA], [compB, deltaB]].forEach(function (pair) {
                      var cmp = pair[0];
                      var dCmp = pair[1];
                      if (!cmp || !cmp.name || Math.abs(dCmp) < 0.01) return;
                      var cProxy = {
                        coffee_id: cmp.coffeeId || '',
                        coffee_name: cmp.name || '',
                        roaster: cmp.roaster || '',
                        cupping_date: updatedRow.cupping_date || r.cupping_date || '',
                        brew_method: updatedRow.brew_method || r.brew_method || ''
                      };
                      var cMatch = resolveRowBagMatchForInventory(cProxy, S.getNormalizedPrices(), { allowFinishedRefund: dCmp < 0 });
                      if (cMatch.matched) {
                        try {
                          var recTarget = Object.assign({}, cProxy, cMatch.priceIdx >= 0 ? { openBag: { bagIndex: cMatch.priceIdx } } : {});
                          var recRes = storage.reconcileBagDoseDelta(recTarget, dCmp);
                          if (recRes && recRes.changed) didReconcileBag = true;
                        } catch (_) {}
                      }
                    });

                    /* Keep recipe_adaptation_json blend component weights synced with edited total dose (cloning rows so editUndo.prevRows stays intact) */
                    try {
                      var hState = (typeof storage.getHistory === 'function') ? storage.getHistory() : null;
                      if (hState && hState.ex && Array.isArray(hState.ex.header) && Array.isArray(hState.ex.rows) && hState.ex.rows[rIdx] && typeof storage.applyHistoryRows === 'function') {
                        var adapCol = hState.ex.header.indexOf('recipe_adaptation_json');
                        if (adapCol >= 0) {
                          var adapObj = parseJsonObjSafe(hState.ex.rows[rIdx][adapCol]);
                          if (adapObj) {
                            var nextAdap = JSON.parse(JSON.stringify(adapObj));
                            if (Array.isArray(nextAdap.blendComponents) && nextAdap.blendComponents.length >= 2) {
                              nextAdap.blendComponents[0].weightG = newWeightA;
                              nextAdap.blendComponents[1].weightG = newWeightB;
                            }
                            if (nextAdap.coffee_extra && Array.isArray(nextAdap.coffee_extra.blendComponents) && nextAdap.coffee_extra.blendComponents.length >= 2) {
                              nextAdap.coffee_extra.blendComponents[0].weightG = newWeightA;
                              nextAdap.coffee_extra.blendComponents[1].weightG = newWeightB;
                            }
                            if (nextAdap.blendBreakdown && typeof nextAdap.blendBreakdown === 'object') {
                              nextAdap.blendBreakdown.doseA_g = newWeightA;
                              nextAdap.blendBreakdown.doseB_g = newWeightB;
                            }
                            var clonedRows = hState.ex.rows.slice();
                            var clonedRow = hState.ex.rows[rIdx].slice();
                            clonedRow[adapCol] = JSON.stringify(nextAdap);
                            clonedRows[rIdx] = clonedRow;
                            storage.applyHistoryRows(clonedRows);
                            updatedRow = (S.getHistoryObjs()[rIdx]) || updatedRow;
                          }
                        }
                      }
                    } catch (_) {}
                  } else {
                    var sMatch = resolveRowBagMatchForInventory(updatedRow, S.getNormalizedPrices(), { allowFinishedRefund: delta < 0 });
                    if (sMatch.matched) {
                      try {
                        var sTarget = Object.assign({}, updatedRow, sMatch.priceIdx >= 0 ? { openBag: { bagIndex: sMatch.priceIdx } } : {});
                        var sRes = storage.reconcileBagDoseDelta(sTarget, delta);
                        if (sRes && sRes.changed) didReconcileBag = true;
                      } catch (_) {}
                    }
                  }
                }
                if (!editBlend.isBlend) {
                  upsertVaultSafe({
                    id: isSyntheticCoffeeId(updatedRow.coffee_id) ? '' : String(updatedRow.coffee_id || '').trim(),
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
                    if (typeof storage.undoEdit === 'function') {
                      var undone = storage.undoEdit();
                      if (undone && didReconcileBag) {
                        restoreInventorySnapshot(preEditInvSnap);
                      }
                      S.rerenderSafe();
                    }
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
                var cleanNewName = String(coffeeEdit.coffee_name || '').trim();
                if (!cleanNewName) {
                  S.toastSafe('A coffee needs a name.');
                  return;
                }
                var preCoffeeSnap = captureInventorySnapshot();
                var rawCid = String(r.coffee_id || '').trim();
                var cleanCid = isSyntheticCoffeeId(rawCid) ? '' : rawCid;
                var cOrig = normCoffeeKeyPart(un(r.coffee_name));
                var rOrig = normCoffeeKeyPart(un(r.roaster));
                var matchIdxs = [];
                if (cleanCid) {
                  hObjs.forEach(function (row, idx) {
                    if (!row) return;
                    var rCid = String(row.coffee_id || '').trim();
                    if (!isSyntheticCoffeeId(rCid) && rCid === cleanCid) matchIdxs.push(idx);
                  });
                } else if (cOrig) {
                  hObjs.forEach(function (row, idx) {
                    if (!row) return;
                    if (normCoffeeKeyPart(un(row.coffee_name)) === cOrig && normCoffeeKeyPart(un(row.roaster)) === rOrig) {
                      matchIdxs.push(idx);
                    }
                  });
                }
                var targetIdxs = matchIdxs.length ? matchIdxs : [rIdx];
                if (targetIdxs.indexOf(rIdx) < 0 && rIdx >= 0 && rIdx < hObjs.length) targetIdxs.push(rIdx);

                /* Locate pre-existing Vault record BEFORE commit so a rename updates in-place instead of duplicating */
                var preVaultList = getCoffeesVaultSafe();
                var oldVaultRec = null;
                for (var vi = 0; vi < preVaultList.length; vi++) {
                  var vr = preVaultList[vi];
                  if (!vr) continue;
                  var vCid = String(vr.coffee_id || vr.id || '').trim();
                  if (cleanCid && !isSyntheticCoffeeId(vCid) && vCid === cleanCid) { oldVaultRec = Object.assign({}, vr); break; }
                  if (cOrig && normCoffeeKeyPart(un(vr.name || vr.coffee_name || vr.coffee || '')) === cOrig && normCoffeeKeyPart(un(vr.roaster || '')) === rOrig) {
                    oldVaultRec = Object.assign({}, vr);
                    break;
                  }
                }

                var baseCoffeePayload = (typeof coffeeEditFromRow === 'function') ? coffeeEditFromRow(r) : {};
                var cleanRoaster = String(coffeeEdit.roaster || '').trim();
                var cleanOrigin = String(coffeeEdit.origin || '').trim();
                var cleanRegion = String(coffeeEdit.region || '').trim();
                var cleanProc = String(coffeeEdit.process || '').trim();
                var cleanRoast = String(coffeeEdit.roast_level || '').trim();
                var cleanVarietal = String(coffeeEdit.varietal || '').trim();
                var cleanElev = String(coffeeEdit.elevation_m || '').trim();
                var cleanRoastDate = String(coffeeEdit.roast_date || '').trim();
                var cleanBagNotes = String(coffeeEdit.bag_notes || '').trim();
                var elevTextVal = cleanElev ? (/m|masl|ft/i.test(cleanElev) ? cleanElev : (cleanElev + ' m')) : '';
                var resolvedDens = cleanElev ? ((typeof resolveDensity === 'function' ? resolveDensity('', cleanElev) : '') || '') : '';

                var commitPayload = Object.assign({}, baseCoffeePayload, {
                  name: cleanNewName,
                  coffee_name: cleanNewName,
                  roaster: cleanRoaster,
                  origin: cleanOrigin,
                  region: cleanRegion,
                  process: cleanProc,
                  roast: cleanRoast,
                  roast_level: cleanRoast,
                  varietal: cleanVarietal,
                  elevation_m: cleanElev,
                  elevText: elevTextVal,
                  density: resolvedDens,
                  roast_date: cleanRoastDate,
                  bag_notes: cleanBagNotes
                });

                var res = storage.commitCoffeeEdit(targetIdxs, commitPayload);
                if (res && res.error) { S.toastSafe(res.error); return; }

                /* Propagate rename/metadata to matching Prices entries */
                var oldBagNotes = un(r.bag_notes).trim();
                var pList = S.getNormalizedPrices();
                var pChanged = false;
                var nextPrices = pList.map(function (pb) {
                  if (!pb) return pb;
                  var pbCid = String(pb.coffee_id || '').trim();
                  var idMatch = !!(cleanCid && !isSyntheticCoffeeId(pbCid) && pbCid === cleanCid);
                  var nameRoastMatch = !!(cOrig && normCoffeeKeyPart(un(pb.coffee || '')) === cOrig && normCoffeeKeyPart(un(pb.roaster || '')) === rOrig);
                  if (!idMatch && !nameRoastMatch) return pb;
                  pChanged = true;
                  var nextBag = Object.assign({}, pb, {
                    coffee: cleanNewName,
                    roaster: cleanRoaster,
                    origin: cleanOrigin,
                    region: cleanRegion,
                    process: cleanProc,
                    rlevel: (typeof resolveRoast === 'function' ? resolveRoast(cleanRoast) : '') || cleanRoast,
                    varietal: cleanVarietal,
                    elevation_m: cleanElev,
                    roast: isIsoDateCellar(cleanRoastDate) ? cleanRoastDate : (cleanRoastDate === '' ? '' : pb.roast),
                    bag_notes: cleanBagNotes
                  });
                  if (!pb.notes || un(pb.notes).trim() === oldBagNotes) {
                    nextBag.notes = cleanBagNotes;
                  }
                  return nextBag;
                });
                if (pChanged) {
                  S.saveNormalizedPrices(nextPrices);
                }

                /* Cleanly update Vault AFTER saveNormalizedPrices with { allowClear: true } and zero rename duplication */
                var nameOrRoasterChanged = (normCoffeeKeyPart(cleanNewName) !== cOrig) || (normCoffeeKeyPart(cleanRoaster) !== rOrig);
                var targetVaultId = cleanCid || (oldVaultRec && !isSyntheticCoffeeId(oldVaultRec.coffee_id || oldVaultRec.id) ? String(oldVaultRec.coffee_id || oldVaultRec.id).trim() : '');
                if (nameOrRoasterChanged && !cleanCid && oldVaultRec && typeof storage.saveCoffeesVaultList === 'function') {
                  var curV = getCoffeesVaultSafe().filter(function (v) {
                    if (!v) return false;
                    var vName = normCoffeeKeyPart(un(v.name || v.coffee_name || v.coffee || ''));
                    var vRoast = normCoffeeKeyPart(un(v.roaster || ''));
                    return !(vName === cOrig && vRoast === rOrig);
                  });
                  /* Re-anchor preserved bag/freeze metadata from oldVaultRec if new entry didn't inherit it */
                  var renamedRec = Object.assign({}, oldVaultRec, {
                    id: targetVaultId || oldVaultRec.id || '',
                    coffee_id: targetVaultId || oldVaultRec.coffee_id || '',
                    name: cleanNewName,
                    roaster: cleanRoaster
                  });
                  var newNameNorm = normCoffeeKeyPart(cleanNewName);
                  var newRoastNorm = normCoffeeKeyPart(cleanRoaster);
                  var existingNewIdx = -1;
                  for (var ni = 0; ni < curV.length; ni++) {
                    if (normCoffeeKeyPart(un(curV[ni].name || curV[ni].coffee_name || curV[ni].coffee || '')) === newNameNorm &&
                        normCoffeeKeyPart(un(curV[ni].roaster || '')) === newRoastNorm) {
                      existingNewIdx = ni;
                      break;
                    }
                  }
                  if (existingNewIdx >= 0) curV[existingNewIdx] = Object.assign({}, renamedRec, curV[existingNewIdx], { name: cleanNewName, roaster: cleanRoaster });
                  else curV.push(renamedRec);
                  try { storage.saveCoffeesVaultList(curV); } catch (_) {}
                }

                var editedCoffeePayload = {
                  id: targetVaultId,
                  coffee_id: targetVaultId,
                  name: cleanNewName,
                  roaster: cleanRoaster,
                  origin: cleanOrigin,
                  region: cleanRegion,
                  process: cleanProc,
                  roast: cleanRoast,
                  varietal: cleanVarietal,
                  elevation_m: cleanElev,
                  elevText: elevTextVal,
                  density: resolvedDens,
                  roast_date: isIsoDateCellar(cleanRoastDate) ? cleanRoastDate : '',
                  bag_notes: cleanBagNotes,
                  notes: cleanBagNotes,
                  flavors: cleanBagNotes
                };
                upsertVaultSafe(editedCoffeePayload, null, { allowClear: true });

                /* Sync active app.coffee unconditionally (including cleared empty strings) */
                var aLive = S.getApp();
                if (aLive && aLive.coffee) {
                  var liveCid = String(aLive.coffee.id || aLive.coffee.coffee_id || '').trim();
                  var liveIdMatch = !!(cleanCid && !isSyntheticCoffeeId(liveCid) && liveCid === cleanCid);
                  var liveNameRoastMatch = !!(cOrig && normCoffeeKeyPart(aLive.coffee.name || '') === cOrig && normCoffeeKeyPart(aLive.coffee.roaster || '') === rOrig);
                  if (liveIdMatch || liveNameRoastMatch) {
                    aLive.coffee.name = cleanNewName;
                    aLive.coffee.nameUnsure = '';
                    aLive.coffee.roaster = cleanRoaster;
                    aLive.coffee.roasterUnsure = cleanRoaster ? '' : 'yes';
                    aLive.coffee.origin = cleanOrigin;
                    aLive.coffee.originUnsure = cleanOrigin ? '' : 'yes';
                    aLive.coffee.region = cleanRegion;
                    aLive.coffee.process = (typeof resolveProcess === 'function' ? resolveProcess(cleanProc) : '') || cleanProc;
                    aLive.coffee.processUnsure = cleanProc ? '' : 'yes';
                    aLive.coffee.roast = (typeof resolveRoast === 'function' ? resolveRoast(cleanRoast) : '') || cleanRoast;
                    aLive.coffee.roastUnsure = cleanRoast ? '' : 'yes';
                    aLive.coffee.varietal = cleanVarietal;
                    aLive.coffee.varietalUnsure = cleanVarietal ? '' : 'yes';
                    aLive.coffee.elevation_m = cleanElev;
                    aLive.coffee.elevText = cleanElev ? (cleanElev + ' masl') : '';
                    aLive.coffee.density = resolvedDens;
                    aLive.coffee.elevUnsure = cleanElev ? '' : 'yes';
                    aLive.coffee.roast_date = isIsoDateCellar(cleanRoastDate) ? cleanRoastDate : '';
                    aLive.coffee.dateUnsure = aLive.coffee.roast_date ? '' : 'yes';
                    aLive.coffee.bag_notes = cleanBagNotes;
                    aLive.coffee.notes = cleanBagNotes;
                    aLive.coffee.notesUnsure = cleanBagNotes ? '' : 'yes';
                    S.saveDraftSafe();
                  }
                }
                S.toastSafe('Updated coffee details across ' + (res.changed || targetIdxs.length) + ' brew(s)!', {
                  durationMs: 10000,
                  actionLabel: 'Undo',
                  onAction: function () {
                    if (typeof storage.undoEdit === 'function') {
                      var undone = storage.undoEdit();
                      if (undone) restoreInventorySnapshot(preCoffeeSnap);
                      S.rerenderSafe();
                    }
                  }
                });
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
      var list = S.getHistoryObjs();
      var n = list.length;
      if (ui.compareIdxs.length < 2 && n >= 2) {
        ui.compareIdxs = n >= 3 ? [n - 3, n - 2, n - 1] : [n - 2, n - 1];
        ui.compareKeys = ui.compareIdxs.map(function (i) { return stableRowKey(list[i], i); });
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
