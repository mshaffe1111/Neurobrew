/* ==========================================================================
   BeanTelligence v6.3 — 06-postbrew-tasting-fix.js
   Step 5 (5. Taste & Perfect) — Natural Rate-First Flow & Plain-English Guide:
   0) Top Context Strip (<- Back to Timer + Actual vs. Target Brew Summary +
      Flow Diagnostic Clue fed directly into solvePrescription) + How-To Guide
   1) Card 1: Cup Cooling Timer — Best Flavor at 60 C (140 F) (compact live
      mm:ss countdown + Vessel pills + 60 C Chime + In-Mug Emergency Rescue)
   2) Card 2: 1. Rate & Describe Your Cup (Quick 30s | Guided 90s | Pro Cupping)
      - Fresh unrated initial state (hasUserRated = false until user rates!)
      - BTBeanSweep (0.25-5.00) + 4-Ring Archery Pad + 6 Quick Taste Shortcuts +
        4-Way Plain-English Cheat-Sheet + Optional DiFluid R2 Dual-Pin
      - Plain-English Guided (How Strong 1-5 vs How Was It?) & Pro Cupping
        (How Strong 0-15 + How Much You Liked It 1-9 across all 8 explained traits)
      - Blind-First Rose-Copper Scratch Foil 2.0 w/ metallic shimmer, flake
        particles & Beanjamin 2.0 Blind Palate Match celebration
   3) Card 3: 2. Your Dial-In Verdict & Next-Brew Recipe (#bt-nextbrew-fix)
      - Calm Coach Card before rating (NEVER premature Gold Recipe!)
      - Live #1 Single-Lever Prescription or Beanjamin Celebrating + In-Place
        Gold Recipe Lock toggle (zero unexpected tab teleportation!)
   Zero Emojis · Zero Jargon Leaks · 16px Min Input Font · Clean ES6
   ========================================================================== */

var BTTasteCellarShared = (function () {
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var SVG_TAGS = {
    svg: 1, path: 1, circle: 1, rect: 1, line: 1, polyline: 1, polygon: 1,
    g: 1, defs: 1, linearGradient: 1, radialGradient: 1, stop: 1, text: 1,
    tspan: 1, ellipse: 1, pattern: 1
  };

  var ROAST_STOPS = [
    { key: 'ultra-light', label: 'Ultra-Light', color: 'var(--roast-1, #C88A4B)' },
    { key: 'light',       label: 'Light',       color: 'var(--roast-2, #AD6D34)' },
    { key: 'medium-light',label: 'Med-Light',   color: 'var(--roast-3, #8B5022)' },
    { key: 'medium',      label: 'Medium',      color: 'var(--roast-4, #693917)' },
    { key: 'medium-dark', label: 'Med-Dark',    color: 'var(--roast-5, #47250F)' },
    { key: 'dark',        label: 'Dark',        color: 'var(--roast-6, #2B1609)' }
  ];

  var VESSELS_5 = [
    { key: 'preheated_ceramic', label: 'Preheated Mug',      kMin: 0.048, dropC: 4.0 },
    { key: 'unpreheated_mug',   label: 'Ceramic Mug',        kMin: 0.056, dropC: 9.5 },
    { key: 'glass_carafe',      label: 'Carafe',             kMin: 0.068, dropC: 5.5 },
    { key: 'travel_mug_open',   label: 'Travel Mug Lid Off', kMin: 0.034, dropC: 2.2 },
    { key: 'double_wall',       label: 'Double-Wall',        kMin: 0.022, dropC: 2.5 },
    { key: 'travel_mug',        label: 'Travel Mug Sealed',  kMin: 0.011, dropC: 1.8 }
  ];

  var METHOD_NAMES = {
    v60: 'Hario V60',
    origami: 'Origami Dripper',
    kalita: 'Kalita Wave',
    orea: 'Orea Brewer',
    pulsar: 'NextLevel Pulsar',
    chemex: 'Chemex',
    nel: 'Nel Woodneck',
    drip: 'Auto Drip',
    aiden: 'Fellow Aiden',
    xbloom: 'xBloom Studio',
    switch: 'Hario Switch',
    clever: 'Clever Dripper',
    aeropress: 'AeroPress',
    siphon: 'Vacuum Siphon',
    press: 'French Press',
    turkish: 'Turkish Cezve',
    phin: 'Vietnamese Phin',
    cold: 'Cold Brew',
    cold_drip: 'Kyoto Cold Drip',
    espresso: 'Espresso',
    lever_espresso: 'Lever Espresso',
    moka: 'Moka Pot',
    philips5500: 'Philips 5500'
  };

  /* 3-Tier Flavor Lexicon Map for Blind Scratch Foil Match % & Note Explorer */
  var WCR_LEXICON_FAMILIES = [
    {
      family: 'Fruity & Berry',
      groups: [
        { sub: 'Stone Fruit', notes: ['White Peach', 'Yellow Peach', 'Apricot', 'Nectarine', 'Plum', 'Cherry'] },
        { sub: 'Berry',       notes: ['Blueberry', 'Blackberry', 'Raspberry', 'Ripe Strawberry', 'Red Currant', 'Cranberry'] },
        { sub: 'Citrus',      notes: ['Bergamot', 'Meyer Lemon', 'Lemon Zest', 'Sweet Orange', 'Blood Orange', 'Mandarin', 'Grapefruit', 'Lime'] },
        { sub: 'Tropical & Pomme', notes: ['Mango', 'Pineapple', 'Passionfruit', 'Papaya', 'Lychee', 'Honeycrisp Apple', 'Green Apple', 'Pear', 'Grape'] }
      ]
    },
    {
      family: 'Floral & Tea',
      groups: [
        { sub: 'White Floral', notes: ['Jasmine', 'Orange Blossom', 'Honeysuckle', 'Elderflower'] },
        { sub: 'Botanical Tea', notes: ['Rosehip', 'Hibiscus', 'Lavender', 'Chamomile', 'Black Tea', 'Earl Grey', 'Oolong'] }
      ]
    },
    {
      family: 'Sweet & Caramel',
      groups: [
        { sub: 'Caramelized', notes: ['Caramel', 'Brown Sugar', 'Panela', 'Molasses', 'Maple Syrup', 'Butterscotch', 'Toffee'] },
        { sub: 'Honey & Vanilla', notes: ['Wildflower Honey', 'Honey', 'Vanilla', 'Marshmallow', 'Sweet Cream', 'Nougat'] }
      ]
    },
    {
      family: 'Cocoa & Nutty',
      groups: [
        { sub: 'Chocolate',   notes: ['Milk Chocolate', 'Dark Chocolate', 'Dark Cocoa', '70% Cacao', 'Cocoa Nib', 'Fudge'] },
        { sub: 'Nut & Grain', notes: ['Roasted Hazelnut', 'Toasted Almond', 'Pecan', 'Walnut', 'Peanut', 'Graham Cracker', 'Malt'] }
      ]
    },
    {
      family: 'Spice & Roast',
      groups: [
        { sub: 'Warm Spice',  notes: ['Cinnamon', 'Cardamom', 'Clove', 'Nutmeg', 'Allspice', 'Anise'] },
        { sub: 'Roast & Wood',notes: ['Cedar', 'Pipe Tobacco', 'Smoky', 'Roasted', 'Earthy'] }
      ]
    }
  ];

  var _noteIndex = null;
  function getNoteIndex() {
    if (_noteIndex) return _noteIndex;
    _noteIndex = Object.create(null);
    WCR_LEXICON_FAMILIES.forEach(function (fam) {
      fam.groups.forEach(function (grp) {
        grp.notes.forEach(function (nt) {
          _noteIndex[nt.toLowerCase()] = { canonical: nt, sub: grp.sub, family: fam.family };
        });
      });
    });
    return _noteIndex;
  }

  function classifyFlavorWord(rawWord) {
    var w = String(rawWord || '').trim();
    if (!w) return null;
    var low = w.toLowerCase();
    var idx = getNoteIndex();
    if (idx[low]) return idx[low];
    var keys = Object.keys(idx);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (low.indexOf(k) >= 0 || k.indexOf(low) >= 0) return idx[k];
    }
    if (/peach|apricot|plum|nectarine|cherry|stone/.test(low)) return { canonical: w, sub: 'Stone Fruit', family: 'Fruity & Berry' };
    if (/berry|currant|straw|rasp|blueb/.test(low)) return { canonical: w, sub: 'Berry', family: 'Fruity & Berry' };
    if (/lemon|lime|orange|citrus|grapefruit|bergamot|yuzu|tangerine/.test(low)) return { canonical: w, sub: 'Citrus', family: 'Fruity & Berry' };
    if (/apple|pear|mango|pineapple|tropical|melon|guava|lychee|grape|fig|raisin/.test(low)) return { canonical: w, sub: 'Tropical & Pomme', family: 'Fruity & Berry' };
    if (/jasmin|floral|blossom|rose|hibiscus|tea|earl|lavender/.test(low)) return { canonical: w, sub: 'White Floral', family: 'Floral & Tea' };
    if (/caramel|sugar|honey|vanilla|maple|toffee|molasses|panela|sweet/.test(low)) return { canonical: w, sub: 'Caramelized', family: 'Sweet & Caramel' };
    if (/choc|cocoa|cacao|mocha|fudge/.test(low)) return { canonical: w, sub: 'Chocolate', family: 'Cocoa & Nutty' };
    if (/nut|almond|hazel|pecan|walnut|graham|malt|biscuit/.test(low)) return { canonical: w, sub: 'Nut & Grain', family: 'Cocoa & Nutty' };
    if (/spice|cinnamon|clove|cardamom|cedar|smok|roast/.test(low)) return { canonical: w, sub: 'Warm Spice', family: 'Spice & Roast' };
    return { canonical: w, sub: 'Personal Note', family: 'Specialty' };
  }

  function domH(tag, props) {
    var kids = Array.prototype.slice.call(arguments, 2);
    if (typeof h === 'function') {
      return h.apply(null, [tag, props].concat(kids));
    }
    var t = String(tag || 'div');
    var isSvg = !!SVG_TAGS[t];
    var el = isSvg ? document.createElementNS(SVG_NS, t) : document.createElement(t);
    if (props && typeof props === 'object') {
      Object.keys(props).forEach(function (k) {
        var v = props[k];
        if (v == null || v === false) return;
        if (k === 'class' || k === 'className') {
          if (isSvg) el.setAttribute('class', String(v));
          else el.className = String(v);
        } else if (k === 'text') {
          el.textContent = String(v);
        } else if (k === 'html' || k === 'innerHTML') {
          el.innerHTML = String(v);
        } else if (k === 'value' && !isSvg) {
          el.value = String(v);
        } else if (k.indexOf('on') === 0 && typeof v === 'function') {
          el.addEventListener(k.slice(2).toLowerCase(), v);
        } else if (v === true) {
          if (!isSvg && (k === 'disabled' || k === 'checked' || k === 'hidden' || k === 'selected' || k === 'readOnly')) {
            el[k] = true;
          } else {
            el.setAttribute(k, '');
          }
        } else {
          el.setAttribute(k, String(v));
        }
      });
    }
    function addKid(c) {
      if (c == null || c === false || c === true) return;
      if (Array.isArray(c)) { c.forEach(addKid); return; }
      if (c.nodeType) el.appendChild(c);
      else el.appendChild(document.createTextNode(String(c)));
    }
    kids.forEach(addKid);
    return el;
  }

  function clamp(v, lo, hi) {
    var n = +v;
    if (!isFinite(n)) return lo;
    return Math.max(lo, Math.min(hi, n));
  }

  function fmtMmSs(sec) {
    var s = Math.max(0, Math.round(+sec || 0));
    var mm = Math.floor(s / 60);
    var ss = s % 60;
    return (mm < 10 ? '0' + mm : String(mm)) + ':' + (ss < 10 ? '0' + ss : String(ss));
  }

  function humanMethodName(rawMethodOrKey) {
    var raw = String(rawMethodOrKey || 'v60').trim();
    var low = raw.toLowerCase();
    if (METHOD_NAMES[low]) return METHOD_NAMES[low];
    var resolved = (typeof resolveMethod === 'function') ? resolveMethod(low) : '';
    if (resolved && METHOD_NAMES[resolved]) return METHOD_NAMES[resolved];
    return raw || 'Hario V60';
  }

  function buildGoldSealSvg(sizePx) {
    var sz = sizePx || 24;
    var wrap = domH('span', { class: 'bt-ico', 'aria-hidden': 'true', style: 'display:inline-flex;align-items:center' });
    wrap.innerHTML = '<svg viewBox="0 0 48 48" width="' + sz + '" height="' + sz + '" focusable="false">' +
      '<circle cx="24" cy="24" r="21" fill="#F2AE4B" stroke="#9A6B16" stroke-width="2.2"/>' +
      '<circle cx="24" cy="24" r="16.5" fill="none" stroke="#FFFDF9" stroke-width="1.3" stroke-dasharray="2.5 2"/>' +
      '<path d="M16.5 24.5 L21.5 29.5 L32 18.5" fill="none" stroke="#1F1712" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '</svg>';
    return wrap;
  }

  function getShell() {
    return (typeof window !== 'undefined' && window.BTShell) ? window.BTShell : null;
  }

  function getApp() {
    var sh = getShell();
    if (typeof app !== 'undefined' && app && typeof app === 'object') return app;
    if (sh && sh.app) return sh.app;
    if (typeof window !== 'undefined') {
      window._btFallbackApp = window._btFallbackApp || {
        activeTab: 'brew',
        brewStep: 'taste',
        tabSegments: { brew: 'studio', cellar: 'shelf' },
        coffee: { id: 'cf_1', name: '', roaster: '', roast: 'light', process: 'washed', roast_date: '', bag_notes: '' },
        brew: { method: 'v60', dose: 15, water: 250, ratio: 16.7, tempF: 200, tempC: 93, grindUm: 550, grinderKey: 'comandante_c40' },
        prefs: { tempUnit: 'C', toolModes: { refractometer: 'optional', scale: 'optional' }, gear: {} }
      };
      return window._btFallbackApp;
    }
    return { coffee: {}, brew: {}, prefs: { gear: {} } };
  }

  function getState() {
    var sh = getShell();
    if (typeof state !== 'undefined' && state && typeof state === 'object') return state;
    if (sh && sh.state) return sh.state;
    if (typeof window !== 'undefined') {
      window._btFallbackState = window._btFallbackState || { quick: {}, words: {}, cva: {}, desc: {}, vs: {} };
      return window._btFallbackState;
    }
    return { quick: {}, words: {}, cva: {}, desc: {}, vs: {} };
  }

  function btToolModeSafe(toolKey) {
    try {
      if (typeof btToolMode === 'function') return btToolMode(toolKey);
      var sh = getShell();
      if (sh && typeof sh.btToolMode === 'function') return sh.btToolMode(toolKey);
      var a = getApp();
      var tm = a && a.prefs && a.prefs.toolModes;
      if (tm && tm[toolKey]) return tm[toolKey];
    } catch (_) {}
    return 'optional';
  }

  function experienceLensSafe() {
    try {
      var sl = (typeof BTScienceLens !== 'undefined' && BTScienceLens) ? BTScienceLens : (typeof window !== 'undefined' ? window.BTScienceLens : null);
      if (sl) {
        if (typeof sl.level === 'function') {
          var lv = sl.level();
          if (lv === 'starter' || lv === 'new') return 'starter';
          if (lv === 'scientist' || lv === 'expert' || lv === 'xray') return 'scientist';
          return 'comfy';
        }
        if (typeof sl.mode === 'function') {
          var m = sl.mode();
          if (m === 'xray' || m === 'scientist') return 'scientist';
          if (m === 'surface' && getApp().prefs && getApp().prefs.level === 'new') return 'starter';
        }
      }
      var a = getApp();
      var pLv = a && a.prefs && (a.prefs.level || a.prefs.scienceLens);
      if (pLv === 'new' || pLv === 'starter') return 'starter';
      if (pLv === 'expert' || pLv === 'scientist' || pLv === 'xray') return 'scientist';
    } catch (_) {}
    return 'comfy';
  }

  function iconEl(name, opts) {
    try {
      var bti = (typeof BTIcons !== 'undefined' && BTIcons) ? BTIcons : (typeof window !== 'undefined' ? window.BTIcons : null);
      if (bti && typeof bti.el === 'function') return bti.el(name || 'brew', opts || { size: 18 });
      if (bti && typeof bti.svg === 'function') {
        var w = domH('span', { class: 'bt-ico', 'aria-hidden': 'true' });
        w.innerHTML = bti.svg(name || 'brew', opts || { size: 18 });
        return w.firstElementChild || w;
      }
    } catch (_) {}
    return domH('span', { class: 'bt-ico', 'aria-hidden': 'true' });
  }

  function haptic(kind) {
    try {
      var bh = (typeof window !== 'undefined' && window.BTHaptics) ? window.BTHaptics : null;
      if (bh && typeof bh[kind] === 'function') bh[kind]();
      else if (bh && typeof bh.tick === 'function') bh.tick();
    } catch (_) {}
  }

  function toastSafe(msg, opts) {
    try {
      var sh = getShell();
      if (typeof toast === 'function') toast(msg, opts);
      else if (sh && typeof sh.toast === 'function') sh.toast(msg, opts);
    } catch (_) {}
  }

  function saveDraftSafe() {
    try {
      var sh = getShell();
      if (typeof scheduleDraft === 'function') scheduleDraft();
      else if (sh && typeof sh.scheduleDraft === 'function') sh.scheduleDraft();
    } catch (_) {}
  }

  function rerenderSafe() {
    try {
      var sh = getShell();
      if (typeof render === 'function') render();
      else if (sh && typeof sh.render === 'function') sh.render();
    } catch (_) {}
  }

  /* Navigate without pre-mutating app.activeTab/brewStep so BTShell._navHistoryStack records true origin! */
  function navGo(routeOrTab, payload) {
    try {
      var sh = getShell();
      if (typeof go === 'function') return go(routeOrTab, payload);
      if (sh && typeof sh.go === 'function') return sh.go(routeOrTab, payload);
      var a = getApp();
      var k = String(routeOrTab || 'brew').toLowerCase();
      if (k === 'cellar' || k === 'shops' || k === 'history' || k === 'prices') {
        a.activeTab = 'cellar';
      } else if (k === 'palate' || k === 'prefs' || k === 'preferences') {
        a.activeTab = 'palate';
      } else if (k === 'timer') {
        a.activeTab = 'brew'; a.brewStep = 'timer';
      } else if (k === 'taste' || k === 'tasting' || k === 'perfect') {
        a.activeTab = 'brew'; a.brewStep = 'taste';
      } else if (k === 'brew' || k === 'recipe') {
        a.activeTab = 'brew'; a.brewStep = 'brew';
      } else if (k === 'method') {
        a.activeTab = 'brew'; a.brewStep = 'method';
      } else if (k === 'coffee') {
        a.activeTab = 'brew'; a.brewStep = 'coffee';
      } else if (k === 'door') {
        a.activeTab = 'brew'; a.brewStep = 'door';
      }
      rerenderSafe();
    } catch (_) {}
  }

  function canGoBackSafe() {
    try {
      var sh = getShell();
      if (sh && typeof sh.canGoBack === 'function') return !!sh.canGoBack();
    } catch (_) {}
    return false;
  }

  function goBackSafe(fallbackRoute) {
    try {
      var sh = getShell();
      if (sh && typeof sh.canGoBack === 'function' && sh.canGoBack() && typeof sh.goBack === 'function') {
        return sh.goBack();
      }
      if (typeof goBack === 'function' && sh && typeof sh.canGoBack === 'function' && sh.canGoBack()) {
        return goBack();
      }
    } catch (_) {}
    if (fallbackRoute) return navGo(fallbackRoute);
    return false;
  }

  var _localSheets = {};

  function openSheetSafe(sheetKey, payload, opts) {
    try {
      var sh = getShell();
      if (sh && typeof sh.openSheet === 'function') return sh.openSheet(sheetKey, payload, opts);
      if (typeof BTSheet !== 'undefined' && BTSheet && typeof BTSheet.open === 'function') {
        return BTSheet.open(sheetKey, payload, opts);
      }
    } catch (_) {}
  }

  function closeSheetSafe() {
    try {
      var sh = getShell();
      if (sh && typeof sh.closeSheet === 'function') return sh.closeSheet();
      if (typeof BTSheet !== 'undefined' && BTSheet && typeof BTSheet.close === 'function') return BTSheet.close();
    } catch (_) {}
  }

  function registerSheetSafe(key, renderFn, meta) {
    _localSheets[key] = renderFn;
    var sh = getShell();
    if (sh && typeof sh.registerSheet === 'function') {
      sh.registerSheet(key, function (hostOrPayload, maybePayload) {
        var host = (hostOrPayload && hostOrPayload.nodeType === 1) ? hostOrPayload : ((maybePayload && maybePayload.nodeType === 1) ? maybePayload : null);
        var pl = (hostOrPayload && !hostOrPayload.nodeType) ? hostOrPayload : (maybePayload && !maybePayload.nodeType ? maybePayload : {});
        var built = renderFn(host, pl);
        if (host && built && built !== host && built.nodeType === 1 && built.parentNode !== host) {
          host.textContent = '';
          host.appendChild(built);
        }
        return built;
      }, meta);
    }
  }

  function registerTabSafe(key, renderFn) {
    var sh = getShell();
    if (sh && typeof sh.registerTab === 'function') {
      sh.registerTab(key, function (hostOrPayload, maybePayload) {
        var host = (hostOrPayload && hostOrPayload.nodeType === 1) ? hostOrPayload : ((maybePayload && maybePayload.nodeType === 1) ? maybePayload : null);
        var pl = (hostOrPayload && !hostOrPayload.nodeType) ? hostOrPayload : (maybePayload && !maybePayload.nodeType ? maybePayload : {});
        var built = renderFn(host, pl);
        if (host && built && built !== host && built.nodeType === 1 && built.parentNode !== host) {
          host.textContent = '';
          host.appendChild(built);
        }
        return built;
      });
    }
  }

  function registerRouteSafe(key, fn) {
    var sh = getShell();
    if (sh && typeof sh.registerRoute === 'function') sh.registerRoute(key, fn);
  }

  function isoDaysAgo(daysBack) {
    var d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - Math.max(0, Math.round(+daysBack || 0)));
    var p = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }

  function daysSinceIso(isoStr) {
    if (!isoStr || !/^\d{4}-\d{2}-\d{2}/.test(String(isoStr).trim())) return null;
    var d = new Date(String(isoStr).trim().slice(0, 10) + 'T12:00:00');
    if (isNaN(d.getTime())) return null;
    var now = new Date();
    now.setHours(12, 0, 0, 0);
    return Math.max(0, Math.round((now.getTime() - d.getTime()) / 86400000));
  }

  function roastColorFor(roastOrAgtron) {
    var s = String(roastOrAgtron || '').toLowerCase().trim();
    for (var i = 0; i < ROAST_STOPS.length; i++) {
      if (ROAST_STOPS[i].key === s || ROAST_STOPS[i].label.toLowerCase() === s) return ROAST_STOPS[i].color;
    }
    if (s.indexOf('ultra') >= 0 || s.indexOf('nordic') >= 0) return ROAST_STOPS[0].color;
    if (s.indexOf('med') >= 0 && s.indexOf('light') >= 0) return ROAST_STOPS[2].color;
    if (s.indexOf('light') >= 0) return ROAST_STOPS[1].color;
    if (s.indexOf('med') >= 0 && s.indexOf('dark') >= 0) return ROAST_STOPS[4].color;
    if (s.indexOf('dark') >= 0 || s.indexOf('french') >= 0) return ROAST_STOPS[5].color;
    return ROAST_STOPS[3].color;
  }

  function getHistoryObjs() {
    try {
      var st = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : null;
      if (st && typeof st.getHistory === 'function') {
        var hObj = st.getHistory();
        if (Array.isArray(hObj)) return hObj;
        if (hObj && Array.isArray(hObj.objs)) return hObj.objs;
      }
    } catch (_) {}
    return [];
  }

  function isIsoDateStr(v) {
    return /^\d{4}-\d{2}(?:-\d{2})?$/.test(String(v || '').trim());
  }

  function normalizePriceBag(raw, idx) {
    if (!raw || typeof raw !== 'object') return null;
    var coffee = String(raw.coffee || raw.name || raw.coffee_name || '').trim();
    if (!coffee) return null;
    var roaster = String(raw.roaster || '').trim();
    var size = parseFloat(raw.size != null ? raw.size : (raw.grams != null ? raw.grams : (raw.bag_weight_g != null ? raw.bag_weight_g : 250)));
    if (!(size > 0 && isFinite(size))) size = 250;
    var unit = String(raw.unit || (raw.kind === 'pods' ? 'pods' : 'g')).trim().toLowerCase();
    if (['g', 'kg', 'oz', 'lb', 'lbs', 'pods'].indexOf(unit) < 0) unit = 'g';
    if (unit === 'lbs') unit = 'lb';
    var price = parseFloat(raw.price != null ? raw.price : 20);
    if (!(price > 0 && isFinite(price))) price = 20;
    var rawSym = String(raw.sym || raw.currency || '$').trim();
    var symMap = { USD: '$', '$': '$', EUR: '\u20AC', '\u20AC': '\u20AC', GBP: '\u00A3', '\u00A3': '\u00A3', CAD: 'CA$', 'CA$': 'CA$', AUD: 'A$', 'A$': 'A$' };
    var codeMap = { '$': 'USD', USD: 'USD', '\u20AC': 'EUR', EUR: 'EUR', '\u00A3': 'GBP', GBP: 'GBP', 'CA$': 'CAD', CAD: 'CAD', 'A$': 'AUD', AUD: 'AUD' };
    var sym = symMap[rawSym] || rawSym.slice(0, 3) || '$';
    var currency = String(codeMap[String(raw.currency || rawSym).trim()] || raw.currency || sym).trim().slice(0, 6) || 'USD';
    var rawRoastField = String(raw.roast || '').trim();
    var roastDate = isIsoDateStr(rawRoastField) ? rawRoastField : (isIsoDateStr(raw.roast_date) ? String(raw.roast_date).trim() : (isIsoDateStr(raw.rdate) ? String(raw.rdate).trim() : ''));
    var rlevelRaw = String(raw.rlevel || raw.roast_level || (!isIsoDateStr(rawRoastField) ? rawRoastField : '') || '').trim().toLowerCase();
    var rlevel = (typeof resolveRoast === 'function' ? resolveRoast(rlevelRaw) : '') || (['ultra-light', 'light', 'medium-light', 'medium', 'medium-dark', 'dark'].indexOf(rlevelRaw) >= 0 ? rlevelRaw : (rlevelRaw ? 'light' : ''));
    var date = isIsoDateStr(raw.date) ? String(raw.date).trim() : isoDaysAgo(0);
    var totalG = unit === 'pods' ? size : (typeof costGrams === 'function' ? costGrams(size, unit) : size * (unit === 'oz' ? 28.3495 : unit === 'lb' ? 453.592 : unit === 'kg' ? 1000 : 1));
    var remG = raw.rem_g != null && isFinite(+raw.rem_g) ? Math.max(0, Math.round(+raw.rem_g * 10) / 10) : Math.round(totalG * 10) / 10;

    var outBag = {
      id: String(raw.id || raw.coffee_id || ('bag_' + (idx != null ? idx : Date.now()))),
      coffee_id: String(raw.coffee_id || raw.id || ''),
      kind: raw.kind === 'pods' || unit === 'pods' ? 'pods' : 'bag',
      coffee: coffee,
      roaster: roaster,
      size: Math.round(size * 100) / 100,
      unit: unit,
      price: Math.round(price * 100) / 100,
      currency: currency,
      sym: sym,
      rlevel: rlevel,
      roast: roastDate,
      date: date,
      dose: raw.dose != null && +raw.dose > 0 ? +raw.dose : 15,
      cups: raw.cups != null && +raw.cups > 0 ? +raw.cups : 1,
      finished: isIsoDateStr(raw.finished) ? String(raw.finished).trim() : (raw.finished === 'yes' || raw.finished === true ? isoDaysAgo(0) : ''),
      city: String(raw.city || '').trim(),
      state: String(raw.state || '').trim(),
      notes: String(raw.notes || '').trim(),
      rem_g: remG,
      is_frozen: (raw.is_frozen === 'yes' || raw.is_frozen === true || raw.isFrozen === true) ? 'yes' : '',
      frozen_date: isIsoDateStr(raw.frozen_date) ? String(raw.frozen_date).trim() : '',
      tubes_json: raw.tubes_json || ''
    };
    var optBagNotes = String(raw.bag_notes || raw.bagNotes || '').trim();
    if (optBagNotes) outBag.bag_notes = optBagNotes;
    if (raw.origin) outBag.origin = String(raw.origin).trim();
    if (raw.region) outBag.region = String(raw.region).trim();
    if (raw.process) outBag.process = String(raw.process).trim();
    if (raw.varietal) outBag.varietal = String(raw.varietal).trim();
    if (raw.elevation_m) outBag.elevation_m = String(raw.elevation_m).trim();
    if (+raw.bag_weight_g > 0) outBag.bag_weight_g = +raw.bag_weight_g;
    return outBag;
  }

  function getNormalizedPrices() {
    try {
      var st = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : null;
      if (st && typeof st.getPrices === 'function') {
        var pr = st.getPrices();
        var rawList = Array.isArray(pr) ? pr : (pr && Array.isArray(pr.list) ? pr.list : []);
        var hadLegacy = false;
        var out = [];
        for (var i = 0; i < rawList.length; i++) {
          var item = rawList[i];
          if (item && (!item.coffee && item.name)) hadLegacy = true;
          var norm = normalizePriceBag(item, i);
          if (norm) out.push(norm);
        }
        if (hadLegacy && typeof st.savePrices === 'function') {
          try { st.savePrices(out); } catch (_) {}
        }
        return out;
      }
    } catch (_) {}
    return [];
  }

  function saveNormalizedPrices(list) {
    var clean = (Array.isArray(list) ? list : []).map(function (b, idx) {
      return normalizePriceBag(b, idx);
    }).filter(Boolean);
    try {
      var st = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : null;
      if (st && typeof st.savePrices === 'function') {
        st.savePrices(clean);
      }
    } catch (_) {}
    return clean;
  }

  function encodeRealQrSvg(payloadText, opts) {
    opts = opts || {};
    var txt = String(payloadText || '').trim() || 'bt1:empty';
    if (typeof encodeQrSvg === 'function') {
      try {
        return encodeQrSvg(txt, {
          size: opts.size || 176,
          margin: opts.margin != null ? opts.margin : 3,
          fg: opts.fg || '#1A1412',
          bg: opts.bg || '#FAF6F0',
          label: opts.label || 'BeanTelligence Scannable Brew Passport QR'
        });
      } catch (_) {}
    }
    if (typeof window !== 'undefined' && typeof window.encodeQrSvg === 'function') {
      try { return window.encodeQrSvg(txt, opts); } catch (_) {}
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 36" width="160" height="48" role="img" aria-label="Passport code"><rect width="120" height="36" rx="6" fill="#FAF6F0"/><text x="60" y="22" text-anchor="middle" font-size="10" fill="#1A1412">Copy BT-code below</text></svg>';
  }

  /* Newton Cooling Physics for Cup Cooling Timer (60 C Sweet Sip) */
  function computeGoldenSipState(cfg) {
    cfg = cfg || {};
    var vKey = cfg.vesselKey || 'preheated_ceramic';
    var vDef = VESSELS_5.find(function (v) { return v.key === vKey; }) || VESSELS_5[0];
    var massG = clamp(+cfg.bevMassG || 220, 25, 900);
    var elapsedMin = Math.max(0, (+cfg.elapsedS || 0) / 60);
    var tRoom = 22.0;
    var tPourFinish = Math.max(66.0, 84.0 - vDef.dropC);
    var kEff = vDef.kMin * Math.pow(220 / massG, 0.38) * (vKey === 'travel_mug' && cfg.lidOff ? 3.1 : 1.0);
    var tempC = tRoom + (tPourFinish - tRoom) * Math.exp(-kEff * elapsedMin);
    tempC = Math.round(clamp(tempC, 24.0, 86.0) * 10) / 10;
    var tempF = Math.round(tempC * 9 / 5 + 32);

    var secsToGolden = 0;
    if (tempC > 61.5 && kEff > 0.001) {
      var minNeeded = Math.log((tempC - tRoom) / (61.5 - tRoom)) / kEff;
      secsToGolden = Math.max(0, Math.round(minNeeded * 60));
    }
    var inGolden = tempC >= 54.5 && tempC <= 62.5;
    var crossed60 = tempC <= 60.5;
    var progressPct = tempC <= 61.5
      ? 100
      : clamp(Math.round(((tPourFinish - tempC) / Math.max(1, tPourFinish - 61.5)) * 100), 6, 99);

    var lidTip = (vKey === 'travel_mug' && !cfg.lidOff && tempC > 63.0)
      ? 'Sealed travel mug traps >65 \u00B0C heat for 20+ min \u2014 switch to Travel Mug Lid Off to cool 3\u00D7 faster!'
      : '';
    return {
      tempC: tempC,
      tempF: tempF,
      secsToGolden: secsToGolden,
      countdownMmSs: fmtMmSs(secsToGolden),
      progressPct: progressPct,
      zone: tempC > 62.5 ? 'hot' : (inGolden ? 'golden' : (tempC >= 42.0 ? 'clarity' : 'cool')),
      inGoldenSipWindow: inGolden,
      crossed60C: crossed60,
      lidTip: lidTip,
      vesselLabel: vDef.label
    };
  }

  function ringGoldenSipBell() {
    try {
      var ta = (typeof window !== 'undefined' && window.BTTimerAudio) ? window.BTTimerAudio : null;
      if (ta) {
        if (typeof ta.unlock === 'function') ta.unlock();
        if (typeof ta.playGoldenSipBell === 'function') {
          ta.playGoldenSipBell();
          return true;
        }
        if (typeof ta.stepBell === 'function') {
          ta.stepBell();
          return true;
        }
      }
      var AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
      if (AC) {
        var ctx = window.__btFallbackGsCtx || (window.__btFallbackGsCtx = new AC());
        if (ctx.state === 'suspended') ctx.resume();
        var now = ctx.currentTime;
        [1046.5, 1567.98].forEach(function (freq, idx) {
          var osc = ctx.createOscillator();
          var g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          g.gain.setValueAtTime(0.0001, now + idx * 0.08);
          g.gain.linearRampToValueAtTime(idx === 0 ? 0.11 : 0.06, now + idx * 0.08 + 0.012);
          g.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.95);
          osc.connect(g);
          g.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 1.0);
        });
        return true;
      }
    } catch (_) {}
    return false;
  }

  return {
    h: domH,
    clamp: clamp,
    fmtMmSs: fmtMmSs,
    humanMethodName: humanMethodName,
    buildGoldSealSvg: buildGoldSealSvg,
    ROAST_STOPS: ROAST_STOPS,
    VESSELS_5: VESSELS_5,
    WCR_LEXICON_FAMILIES: WCR_LEXICON_FAMILIES,
    classifyFlavorWord: classifyFlavorWord,
    getShell: getShell,
    getApp: getApp,
    getState: getState,
    btToolModeSafe: btToolModeSafe,
    experienceLensSafe: experienceLensSafe,
    iconEl: iconEl,
    haptic: haptic,
    toastSafe: toastSafe,
    saveDraftSafe: saveDraftSafe,
    rerenderSafe: rerenderSafe,
    navGo: navGo,
    canGoBackSafe: canGoBackSafe,
    goBackSafe: goBackSafe,
    openSheetSafe: openSheetSafe,
    closeSheetSafe: closeSheetSafe,
    registerSheetSafe: registerSheetSafe,
    registerTabSafe: registerTabSafe,
    registerRouteSafe: registerRouteSafe,
    isoDaysAgo: isoDaysAgo,
    daysSinceIso: daysSinceIso,
    roastColorFor: roastColorFor,
    getHistoryObjs: getHistoryObjs,
    normalizePriceBag: normalizePriceBag,
    getNormalizedPrices: getNormalizedPrices,
    saveNormalizedPrices: saveNormalizedPrices,
    encodeRealQrSvg: encodeRealQrSvg,
    computeGoldenSipState: computeGoldenSipState,
    ringGoldenSipBell: ringGoldenSipBell
  };
})();

if (typeof window !== 'undefined') {
  window.BTTasteCellarShared = BTTasteCellarShared;
  if (!window.BTBrewCellarShared) window.BTBrewCellarShared = BTTasteCellarShared;
}

/* ==========================================================================
   STEP 5 ENGINE & UI: 06-postbrew-tasting-fix.js
   ========================================================================== */
(function () {
  var S = BTTasteCellarShared;
  var clamp = S.clamp;

  var BULLSEYE_RINGS = [
    { ring: 0, rMax: 0.20, sampleR: 0.00, shortLbl: 'Sweet Spot Bullseye',     name: 'Sweet Spot Bullseye',     detail: 'Balanced \u2014 Ready to Lock Gold Recipe!' },
    { ring: 1, rMax: 0.48, sampleR: 0.34, shortLbl: 'Close \u2014 Tiny Tweak', name: 'Close \u2014 Tiny Tweak', detail: 'Gentle 1-click or small temp tweak' },
    { ring: 2, rMax: 0.76, sampleR: 0.62, shortLbl: 'Clearly Off',             name: 'Clearly Off',             detail: 'Solid single-lever adjustment' },
    { ring: 3, rMax: 1.50, sampleR: 0.90, shortLbl: 'Needs Rescue',            name: 'Needs Rescue',            detail: 'Full rescue step' }
  ];

  var GUIDED_DIMS = [
    {
      key: 'acidity',
      colInt: 'acidity_intensity',
      qKey: 'acidity',
      label: 'Acidity (Fruit Brightness)',
      desc: 'Lively fruit snap like peach, berry, or citrus \u2014 not sour stomach acid!',
      anchors: ['1 Soft / Apple', '3 Juicy Peach / Orange', '5 Zesty Lemon'],
      stepLabels: ['Muted', 'Soft', 'Balanced', 'Bright', 'Vivid']
    },
    {
      key: 'sweetness',
      colInt: 'sweetness_intensity',
      qKey: 'sweetness',
      label: 'Sweetness',
      desc: 'Natural honey, caramel, or ripe-fruit smoothness on your tongue.',
      anchors: ['1 Subtle / Dry', '3 Toasted Almond', '5 Rich Caramel / Honey'],
      stepLabels: ['Dry', 'Subtle', 'Round', 'Sweet', 'Caramel']
    },
    {
      key: 'bitterness',
      colInt: 'bitterness_intensity',
      qKey: 'taste',
      label: 'Bitterness',
      desc: 'Dark chocolate, cocoa nib, or roasted edge toward the back of the tongue.',
      anchors: ['1 None / Clean', '3 Smooth Dark Chocolate', '5 Harsh 85% Cacao / Pith'],
      stepLabels: ['None', 'Light', 'Cocoa', 'Dark', 'Harsh']
    },
    {
      key: 'body',
      colInt: 'body_intensity',
      qKey: 'body',
      label: 'Strength / Body',
      desc: 'Weight and texture on your tongue: light tea vs skim milk vs rich cream.',
      anchors: ['1 Light Tea / Skim', '3 Smooth Whole Milk', '5 Velvety Syrup'],
      stepLabels: ['Watery', 'Silky', 'Balanced', 'Creamy', 'Syrupy']
    },
    {
      key: 'finish',
      colInt: 'astringency_intensity',
      qKey: 'aftertaste',
      label: 'Finish (Aftertaste)',
      desc: 'How clean and sweet vs dry or mouth-puckering the flavor lingers after swallowing.',
      anchors: ['1 Crisp & Clean', '3 Lingering Sweet', '5 Dry / Puckering'],
      stepLabels: ['Short', 'Crisp', 'Clean', 'Lingering', 'Dry / Harsh']
    }
  ];

  var CVA_ATTRS = [
    {
      key: 'fragrance',
      label: 'Fragrance (Dry Grounds)',
      desc: 'Smell of the dry freshly ground coffee before water hits it.',
      skippable: true
    },
    {
      key: 'aroma',
      label: 'Aroma (Wet Steam)',
      desc: 'Smell of the hot wet steam right after pouring water.',
      skippable: true
    },
    {
      key: 'flavor',
      label: 'Flavor',
      desc: 'Main taste + aroma combined while sipping across your tongue.',
      skippable: false
    },
    {
      key: 'aftertaste',
      label: 'Aftertaste',
      desc: 'How pleasant, sweet, or dry the flavor lingers after swallowing.',
      skippable: false
    },
    {
      key: 'acidity',
      label: 'Acidity',
      desc: 'Lively, sparkly fruit brightness (juicy berry/citrus vs flat/dull).',
      skippable: false
    },
    {
      key: 'sweetness',
      label: 'Sweetness',
      desc: 'Natural ripe-fruit, honey, or caramel smoothness (zero added sugar).',
      skippable: false
    },
    {
      key: 'mouthfeel',
      label: 'Mouthfeel (Body)',
      desc: 'Texture and weight on your tongue (light like tea vs velvety/syrupy).',
      skippable: false
    },
    {
      key: 'overall',
      label: 'Overall',
      desc: 'Your big-picture enjoyment and harmony of the whole cup.',
      skippable: false
    }
  ];

  var QUICK_FLAVOR_CHIPS = [
    'White Peach', 'Bergamot', 'Jasmine', 'Blueberry', 'Sweet Orange',
    'Honeycrisp Apple', 'Caramel', 'Wildflower Honey', 'Milk Chocolate',
    'Dark Cocoa', 'Roasted Hazelnut', 'Black Tea'
  ];

  var QUICK_TASTE_SHORTCUTS = [
    { key: 'sweet',   label: 'Nailed It (Sweet!)',   hint: 'Sweet, balanced & clean finish',                x: 0.00,  y: 0.00,  defStars: 4.50 },
    { key: 'sour',    label: 'Too Sour / Sharp',     hint: 'Lemony, tangy, fast finish -> grind finer',     x: -0.42, y: 0.00,  defStars: 3.75 },
    { key: 'bitter',  label: 'Too Bitter / Dry',     hint: 'Ashy cocoa, dry tongue -> grind coarser',       x: 0.42,  y: 0.00,  defStars: 3.75 },
    { key: 'weak',    label: 'Weak / Watery',        hint: 'Tea-light, hollow -> less water / higher dose', x: 0.00,  y: -0.52, defStars: 3.25 },
    { key: 'strong',  label: 'Heavy / Muddy',        hint: 'Overwhelming, thick -> splash more water',      x: 0.00,  y: 0.52,  defStars: 3.50 },
    { key: 'way_off', label: 'Channeling / Uneven',  hint: 'Both sour & bitter/dry -> even pour & grind',   x: -0.72, y: 0.34,  defStars: 2.75 }
  ];

  var FLAVOR_TAB_SHORT_LABELS = [
    'Fruity',
    'Floral & Tea',
    'Caramel & Sweet',
    'Chocolate & Nut',
    'Spice / Roast'
  ];

  function buildStarSvg(fillMode, sizePx) {
    var sz = sizePx || 22;
    var fillAttr = fillMode === 'full' ? 'currentColor' : 'none';
    var wrap = S.h('span', { class: 'bt-ico', 'aria-hidden': 'true', style: 'display:inline-flex;align-items:center;justify-content:center' });
    wrap.innerHTML = '<svg viewBox="0 0 24 24" width="' + sz + '" height="' + sz + '" focusable="false">' +
      '<path d="M12 2.4l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.25l-5.81 3.05 1.11-6.47L2.6 9.25l6.5-.95L12 2.4z" ' +
      'fill="' + fillAttr + '" stroke="currentColor" stroke-width="1.85" stroke-linejoin="round"/></svg>';
    return wrap;
  }

  function likingWord9(v) {
    var n = Math.round(+v || 7);
    if (n >= 9) return 'Extraordinary';
    if (n === 8) return 'Great';
    if (n === 7) return 'Good';
    if (n === 6) return 'Pleasant';
    if (n === 5) return 'Okay';
    if (n === 4) return 'Fair';
    return 'Disliked';
  }

  function starTierWord(stars) {
    var s = +stars || 0;
    if (s >= 4.75) return 'Sweet Bullseye';
    if (s >= 4.5) return 'Exceptional';
    if (s >= 4.0) return 'Very Good';
    if (s >= 3.5) return 'Good';
    if (s >= 3.0) return 'Needs a Tweak';
    return 'Needs Adjustment';
  }

  function ringInfoForXY(dx, dy) {
    var r = Math.hypot(+dx || 0, +dy || 0);
    if (r <= 0.20) return Object.assign({ r: r }, BULLSEYE_RINGS[0]);
    if (r <= 0.48) return Object.assign({ r: r }, BULLSEYE_RINGS[1]);
    if (r <= 0.76) return Object.assign({ r: r }, BULLSEYE_RINGS[2]);
    return Object.assign({ r: r }, BULLSEYE_RINGS[3]);
  }

  function nonlinMag(u) {
    var c = clamp(+u || 0, -1, 1);
    var sg = c < 0 ? -1 : 1;
    var a = Math.abs(c);
    return sg * (0.35 * a + 0.65 * c * c);
  }

  /* Compute Actual vs. Target Brew Timing & Flow Diagnostic Clue */
  function evaluateBrewFlowTiming(a) {
    a = a || S.getApp();
    var cb = (a && a.cupBrew) || {};
    var b = (a && a.brew) || {};
    var methodRaw = cb.method || cb.key || b.method || 'v60';
    var methodKey = String(cb.key || (typeof resolveMethod === 'function' ? resolveMethod(methodRaw) : '') || b.method || 'v60').toLowerCase();
    var methodLabel = S.humanMethodName(cb.method || methodKey);
    var isEsp = methodKey === 'espresso' || methodKey === 'lever_espresso';
    var doseG = +cb.dose || +b.dose || (isEsp ? 18 : 15);
    var waterG = +cb.water || +b.water || (isEsp ? 36 : 250);
    var tempC = +cb.temp_c || +b.tempC || (+b.tempF > 0 ? Math.round((+b.tempF - 32) * 5 / 9) : 93);

    var targetS = +cb.time_s > 0 ? Math.round(+cb.time_s) : 0;
    if (!targetS && typeof window !== 'undefined' && window.BTCoreV6 && typeof window.BTCoreV6.simulateBrew === 'function') {
      try {
        var sim = window.BTCoreV6.simulateBrew({ methodKey: methodKey, doseG: doseG, waterG: waterG, kettleTempC: tempC });
        if (sim && +sim.brewTimeS > 5) targetS = Math.round(+sim.brewTimeS);
      } catch (_) {}
    }
    if (!targetS) targetS = isEsp ? 28 : 145;

    var actualS = +cb.actual_s > 0
      ? Math.round(+cb.actual_s)
      : (b.actualFromTimer && +b.actualSecs > 0 ? Math.round(+b.actualSecs) : 0);

    var timeDeltaS = (actualS > 0 && targetS > 0 && targetS <= 1200) ? (actualS - targetS) : 0;
    var flowClue = '';
    var flowTone = '';

    if (timeDeltaS < -12) {
      flowClue = 'Drained ' + Math.abs(timeDeltaS) + 's faster than expected \u2014 watch for bright/sour under-extraction';
      flowTone = 'fast';
    } else if (timeDeltaS > 15) {
      flowClue = 'Ran ' + timeDeltaS + 's slower than expected \u2014 watch for dry late bitterness';
      flowTone = 'slow';
    }

    var summaryBadge = methodLabel + ' \u00B7 ' + doseG + ' g : ' + Math.round(waterG) + ' g \u00B7 ' +
      (actualS > 0 && targetS <= 1200
        ? ('Actual Time ' + S.fmtMmSs(actualS) + ' (Target ' + S.fmtMmSs(targetS) + ')')
        : (targetS <= 1200 ? ('Target Time ' + S.fmtMmSs(targetS) + ' \u00B7 ' + tempC + ' \u00B0C') : (tempC + ' \u00B0C')));

    return {
      methodKey: methodKey,
      methodLabel: methodLabel,
      doseG: doseG,
      waterG: waterG,
      tempC: tempC,
      actualS: actualS,
      targetS: targetS,
      timeDeltaS: timeDeltaS,
      flowClue: flowClue,
      flowTone: flowTone,
      summaryBadge: summaryBadge
    };
  }

  function resolveActiveGrinder(a, curUm, methodKey) {
    var gKey = (a.brew && a.brew.grinderKey) || (a.prefs && a.prefs.gear && a.prefs.gear.grinderKey) || 'comandante-c40';
    var gNorm = String(gKey).toLowerCase().replace(/_/g, '-');
    var isPreground = /preground|store|blade/.test(gNorm);
    var calib = (a.prefs && a.prefs.pocketMicronCalib) || null;
    var core = (typeof window !== 'undefined' && window.BTCoreV6) ? window.BTCoreV6 : null;
    if (core && core.psd && typeof core.psd.mapMicronsToGrinder === 'function' && !isPreground) {
      try {
        var m = core.psd.mapMicronsToGrinder(curUm, gNorm, calib, methodKey);
        if (m && m.stepUm > 0) {
          return {
            grinderKey: gNorm,
            grinderLabel: m.grinder || m.grinderName || (a.brew && a.brew.grinderName) || 'Comandante C40',
            umPerStep: Math.max(4, +m.stepUm),
            curClicks: m.clicks != null ? +m.clicks : Math.round((curUm - 120) / Math.max(4, +m.stepUm)),
            curDisplay: m.shortDisplay || m.display || m.label || '',
            unit: m.unit || 'clicks',
            grindLocked: false
          };
        }
      } catch (_) {}
    }
    return {
      grinderKey: gNorm,
      grinderLabel: isPreground ? 'Pre-Ground Coffee' : ((a.brew && a.brew.grinderName) || 'Comandante C40'),
      umPerStep: 28,
      curClicks: Math.max(1, Math.round(curUm / 28)),
      curDisplay: Math.max(1, Math.round(curUm / 28)) + ' clicks',
      unit: 'clicks',
      grindLocked: isPreground
    };
  }

  function mapNextGrinderDisplay(nextUm, gInfo, a, methodKey) {
    var core = (typeof window !== 'undefined' && window.BTCoreV6) ? window.BTCoreV6 : null;
    var calib = (a.prefs && a.prefs.pocketMicronCalib) || null;
    if (core && core.psd && typeof core.psd.mapMicronsToGrinder === 'function' && !gInfo.grindLocked) {
      try {
        var m = core.psd.mapMicronsToGrinder(nextUm, gInfo.grinderKey, calib, methodKey);
        if (m) {
          return {
            clicks: m.clicks != null ? +m.clicks : Math.round(nextUm / gInfo.umPerStep),
            display: m.shortDisplay || m.display || m.label || ''
          };
        }
      } catch (_) {}
    }
    var cl = Math.max(1, Math.round(nextUm / gInfo.umPerStep));
    return { clicks: cl, display: cl + ' ' + gInfo.unit };
  }

  function getTrailRowsForActiveCoffee(a, methodKey) {
    var c = (a && a.coffee) || {};
    var cid = String(c.id || '').trim();
    var cName = String(c.name || '').toLowerCase().trim();
    var cRoast = String(c.roaster || '').toLowerCase().trim();
    var mTarget = String(methodKey || 'v60').toLowerCase();
    var all = S.getHistoryObjs();
    var matched = all.filter(function (r) {
      if (!r) return false;
      var rm = (typeof resolveMethod === 'function' ? resolveMethod(r.brew_method) : '') || String(r.brew_method || '').toLowerCase();
      if (rm && rm !== mTarget) return false;
      if (cid && r.coffee_id && r.coffee_id === cid) return true;
      var rn = (typeof unneutralize === 'function' ? unneutralize(r.coffee_name || '') : String(r.coffee_name || '')).toLowerCase().trim();
      var rr = (typeof unneutralize === 'function' ? unneutralize(r.roaster || '') : String(r.roaster || '')).toLowerCase().trim();
      if (!cName || rn !== cName) return false;
      return !cRoast || !rr || rr === cRoast;
    });
    matched.sort(function (x, y) {
      var ax = parseInt(x.brew_attempt, 10) || 0;
      var ay = parseInt(y.brew_attempt, 10) || 0;
      if (ax && ay && ax !== ay) return ax - ay;
      var dx = String(x.saved_at || x.cupping_date || '');
      var dy = String(y.saved_at || y.cupping_date || '');
      return dx.localeCompare(dy);
    });
    return matched;
  }

  function computeTabuMemory(chronRows, curBrew, curStars) {
    var blocked = {
      grindFiner: null,
      grindCoarser: null,
      tempUp: null,
      tempDown: null,
      ratioTighter: null,
      ratioWider: null
    };
    var pts = chronRows.map(function (r, idx) {
      return {
        tryNum: idx + 1,
        um: parseFloat(r.brew_grind_target_um) || 0,
        tempC: parseFloat(r.brew_temp_c) || (parseFloat(r.brew_temp_f) > 0 ? Math.round((parseFloat(r.brew_temp_f) - 32) * 5 / 9 * 10) / 10 : 0),
        ratio: parseFloat(r.brew_ratio) || 0,
        stars: parseFloat(r.my_rating_stars) || (parseFloat(r.total_score) > 0 ? clamp((parseFloat(r.total_score) - 55) / 9, 1, 5) : 0),
        excluded: typeof isRowExcludedFromLearning === 'function' ? isRowExcludedFromLearning(r) : false
      };
    }).filter(function (p) { return !p.excluded && p.stars > 0; });

    if (pts.length >= 1 && curBrew && curStars > 0) {
      pts.push({
        tryNum: pts.length + 1,
        um: +curBrew.grindUm || +curBrew.grind_um || 0,
        tempC: +curBrew.tempC || +curBrew.temp_c || 0,
        ratio: +curBrew.ratio || 0,
        stars: +curStars,
        isCurrentLive: true
      });
    }

    for (var i = 1; i < pts.length; i++) {
      var p0 = pts[i - 1];
      var p1 = pts[i];
      var ratingDrop = p0.stars - p1.stars;
      if (ratingDrop < 0.20) continue;
      var dUm = (p0.um > 0 && p1.um > 0) ? (p1.um - p0.um) : 0;
      var dTemp = (p0.tempC > 0 && p1.tempC > 0) ? (p1.tempC - p0.tempC) : 0;
      var dRat = (p0.ratio > 0 && p1.ratio > 0) ? (p1.ratio - p0.ratio) : 0;

      if (dUm <= -10) {
        blocked.grindFiner = 'Try #' + p1.tryNum + ' ground finer than Try #' + p0.tryNum + ' and your rating dropped (' + p0.stars.toFixed(2) + ' \u2192 ' + p1.stars.toFixed(2) + ')';
      } else if (dUm >= 10) {
        blocked.grindCoarser = 'Try #' + p1.tryNum + ' ground coarser than Try #' + p0.tryNum + ' and your rating dropped (' + p0.stars.toFixed(2) + ' \u2192 ' + p1.stars.toFixed(2) + ')';
      }
      if (Math.abs(dUm) < 10 && dTemp >= 1.2) {
        blocked.tempUp = 'Try #' + p1.tryNum + ' raised water temp and your rating dropped (' + p0.stars.toFixed(2) + ' \u2192 ' + p1.stars.toFixed(2) + ')';
      } else if (Math.abs(dUm) < 10 && dTemp <= -1.2) {
        blocked.tempDown = 'Try #' + p1.tryNum + ' lowered water temp and your rating dropped (' + p0.stars.toFixed(2) + ' \u2192 ' + p1.stars.toFixed(2) + ')';
      }
      if (Math.abs(dUm) < 10 && dRat <= -0.4) {
        blocked.ratioTighter = 'Try #' + p1.tryNum + ' tightened ratio and your rating dropped (' + p0.stars.toFixed(2) + ' \u2192 ' + p1.stars.toFixed(2) + ')';
      } else if (Math.abs(dUm) < 10 && dRat >= 0.4) {
        blocked.ratioWider = 'Try #' + p1.tryNum + ' widened ratio and your rating dropped (' + p0.stars.toFixed(2) + ' \u2192 ' + p1.stars.toFixed(2) + ')';
      }
    }
    return blocked;
  }

  function solveInMugRescueSafe(params) {
    params = params || {};
    var sym = String(params.symptom || 'bitter').toLowerCase();
    var mugG = clamp(+params.mugWeightG || 215, 20, 900);
    var isEsp = mugG <= 65 || !!params.isEspresso;
    var curTds = +params.measTdsPct > 0 ? +params.measTdsPct : (isEsp ? 10.4 : (sym === 'strong' ? 1.56 : 1.48));
    var tgtTds = +params.targetTdsPct > 0 ? +params.targetTdsPct : (isEsp ? 8.8 : 1.34);

    var inn = (typeof window !== 'undefined' && window.BTInnovate) ? window.BTInnovate : null;
    var core = (typeof window !== 'undefined' && window.BTCoreV6) ? window.BTCoreV6 : null;
    var extFn = (inn && typeof inn.solveInMugRescue === 'function') ? inn.solveInMugRescue
      : (core && typeof core.solveInMugRescue === 'function' ? core.solveInMugRescue : null);
    var extRes = null;
    if (extFn) {
      try { extRes = extFn({ symptom: sym, mugWeightG: mugG, tdsPct: curTds, targetTdsPct: tgtTds, isEspresso: isEsp }); } catch (_) {}
    }

    var bypassRatioFrac = sym === 'strong' ? Math.max(0.08, (curTds / tgtTds) - 1) : (sym === 'bitter' ? 0.11 : 0.08);
    var bypassG = Math.max(isEsp ? 6 : 12, Math.round(mugG * clamp(bypassRatioFrac, 0.06, 0.35)));
    var saltMg = Math.max(8, Math.round(mugG * 0.20));
    var salineDrops = Math.max(1, Math.round(saltMg / 10));
    var milkG = isEsp ? 18 : Math.max(15, Math.round(mugG * 0.09));

    var primaryHeadline = '';
    var secondaryHeadline = '';
    var scienceWhy = '';

    if (sym === 'strong') {
      primaryHeadline = 'Add +' + bypassG + ' g of 80 \u00B0C (176 \u00B0F) hot water right into your mug (' + mugG + ' \u2192 ' + (mugG + bypassG) + ' g)';
      secondaryHeadline = 'Opens hidden stone-fruit & caramel aromatics immediately without changing extraction.';
      scienceWhy = 'Exact mass-balance dilution lowers beverage concentration toward ' + tgtTds.toFixed(2) + '% TDS while warm 80 \u00B0C water preserves volatile esters.';
    } else if (sym === 'bitter') {
      primaryHeadline = 'Add ' + salineDrops + ' drop' + (salineDrops === 1 ? '' : 's') + ' of 20% saline (~' + saltMg + ' mg salt, 1 tiny knife-tip pinch) OR +' + bypassG + ' g of 80 \u00B0C water';
      secondaryHeadline = 'Blocks bitter taste receptors by ~45% and brings forward natural sweetness without tasting salty.';
      scienceWhy = 'Sub-threshold Na+ ions (0.02% w/v, Breslin & Beauchamp 1997 Nature) allosterically inhibit peripheral TAS2R bitter transduction.';
    } else if (sym === 'dry' || sym === 'astringent') {
      primaryHeadline = 'Stir in +' + milkG + ' g warm 60 \u00B0C milk / barista oat (or +' + bypassG + ' g 80 \u00B0C water + ' + Math.max(1, salineDrops - 1) + ' saline drops)';
      secondaryHeadline = 'Milk proteins immediately bind tongue-drying tannins so the finish turns silky.';
      scienceWhy = 'Casein/oat globulins chelate high-MW chlorogenic polyphenol oligomers before they precipitate salivary PRPs (Siebert 1999).';
    } else if (sym === 'sour') {
      primaryHeadline = 'Let cool to 55 \u00B0C + add ' + Math.max(1, salineDrops - 1) + ' drop' + (salineDrops <= 2 ? '' : 's') + ' 20% saline (~' + Math.round(saltMg * 0.8) + ' mg salt)';
      secondaryHeadline = 'Rounds sharp tangy edges and boosts perceived ripe-fruit sweetness in the cup.';
      scienceWhy = 'TRPM5 sweet channels peak near 55 \u00B0C while trace Na+ rounds sour-bitter edge contrast.';
    } else {
      primaryHeadline = 'Enjoy at 56\u201358 \u00B0C as a delicate tea-like cup (or top with a 15 g concentrated shot)';
      secondaryHeadline = 'You cannot boil water out of a light cup without cooking aromatics \u2014 let floral & fruit notes shine as it cools!';
      scienceWhy = 'Retronasal floral terpenes (linalool, geraniol) remain clearest at lower TDS when sipped at 55\u201358 \u00B0C.';
    }

    if (extRes && extRes.headline && !primaryHeadline) primaryHeadline = extRes.headline;

    return {
      ok: true,
      symptom: sym,
      mugWeightG: mugG,
      bypassWaterG: bypassG,
      bypassTempC: 80,
      salineDrops20Pct: salineDrops,
      saltMg: saltMg,
      milkBufferG: milkG,
      primaryHeadline: primaryHeadline,
      secondaryHeadline: secondaryHeadline,
      scienceWhy: scienceWhy
    };
  }

  function evaluateR2ReadinessSafe(sampleTempC) {
    var core = (typeof window !== 'undefined' && window.BTCoreV6) ? window.BTCoreV6 : null;
    if (core && core.mass && typeof core.mass.evaluateR2SampleReadiness === 'function') {
      try {
        var r = core.mass.evaluateR2SampleReadiness(sampleTempC, 23.0);
        if (r && r.badgeText) return r;
      } catch (_) {}
    }
    var tc = Math.round((parseFloat(sampleTempC) || 23.5) * 10) / 10;
    if (tc >= 18.0 && tc <= 29.0) {
      return {
        ok: true, tempC: tc, status: 'ideal', ready: true,
        badgeText: 'Sample Temp Ideal (' + tc.toFixed(1) + ' \u00B0C \u00B7 Ready to Read)',
        why: 'Room-temp sample prevents evaporation drift on the prism.'
      };
    }
    if (tc > 29.0) {
      return {
        ok: true, tempC: tc, status: 'too_warm', ready: false,
        badgeText: 'Sample Warm (' + tc.toFixed(1) + ' \u00B0C) \u2014 Stir 15s in Metal Spoon First',
        why: 'Hot drops (>30 \u00B0C) evaporate on the prism and inflate %TDS.'
      };
    }
    return {
      ok: true, tempC: tc, status: 'too_cold', ready: false,
      badgeText: 'Sample Chilled (' + tc.toFixed(1) + ' \u00B0C) \u2014 Let Warm 10s on Prism',
      why: 'Cold drops (<18 \u00B0C) risk room humidity condensation.'
    };
  }

  function evaluateR2VsPalateDiscrepancy(tSt, measEy, isEspMethod) {
    var tds = +tSt.tdsPct || 0;
    if (!(tds > 0 && measEy != null && isFinite(measEy))) return null;
    var a = S.getApp();
    var kh = +(a.brew && a.brew.waterAlk) || +(a.prefs && a.prefs.gear && a.prefs.gear.waterAlk) || 45;
    var effStars = +tSt.stars > 0 ? +tSt.stars : 4.25;
    var rPad = Math.hypot(+tSt.padX || 0, +tSt.padY || 0);
    var inScaEy = measEy >= 18.0 && measEy <= 22.0;
    var userOff = (tSt.hasUserRated !== false && effStars <= 3.75) || (rPad > 0.22);
    var channelingSign = (measEy < 19.3 && tSt.padX > 0.22) || (tSt.guidedLike && tSt.guidedLike.finish === 'too_much' && measEy < 20.5);

    if (!userOff && !channelingSign) {
      return {
        triggered: false,
        aligned: true,
        tdsPct: tds,
        eyPct: measEy,
        sovereigntyBanner: 'Meter & Taste Aligned (' + tds.toFixed(2) + '% TDS \u00B7 ' + measEy.toFixed(1) + '% Extraction (%EY))',
        causes: []
      };
    }

    var lChan = channelingSign || (tSt.padX > 0.22 && tSt.padY < -0.15) ? 2.7 : 0.9;
    var lKh = kh > 70 ? 2.4 : 0.7;
    var lPalate = Math.abs(tSt.padY) > 0.24 ? 2.2 : 1.2;
    var lStyle = (String(a.coffee && a.coffee.roast || '').indexOf('ultra') >= 0 || effStars <= 3.0) ? 1.9 : 0.8;
    var mx = Math.max(lChan, lKh, lPalate, lStyle);
    var sum = Math.exp(lChan - mx) + Math.exp(lKh - mx) + Math.exp(lPalate - mx) + Math.exp(lStyle - mx);

    var causes = [
      {
        id: 'channeling_bypass',
        label: 'Uneven Pour / Channeling',
        prob: Math.round((Math.exp(lChan - mx) / sum) * 100),
        fix: 'Water carved fast paths that pulled bitter dryness while dry pockets stayed weak, averaging ' + measEy.toFixed(1) + '% Extraction (%EY) on the meter. Pour gently in the center.'
      },
      {
        id: 'high_kh_buffer',
        label: 'Hard / Alkaline Water Flattening Acids (High KH)',
        prob: Math.round((Math.exp(lKh - mx) / sum) * 100),
        fix: 'The meter sees dissolved coffee (' + measEy.toFixed(1) + '% Extraction), but hard/alkaline water buffered juicy fruit brightness flat.'
      },
      {
        id: 'palate_sweet_shift',
        label: 'Your Personal Strength Preference',
        prob: Math.round((Math.exp(lPalate - mx) / sum) * 100),
        fix: 'Clean brew \u2014 your personal taste prefers ' + (tSt.padY < 0 ? 'richer body' : 'lighter tea-like clarity') + ' than standard textbook charts. Your taste wins!'
      },
      {
        id: 'ultra_light_style',
        label: 'Bean Roast / Process Style',
        prob: Math.round((Math.exp(lStyle - mx) / sum) * 100),
        fix: 'Well-extracted cup of a roast or ferment style outside your favorites \u2014 mark Not For Me to keep your grinder dial steady.'
      }
    ].sort(function (u, v) { return v.prob - u.prob; });

    return {
      triggered: true,
      aligned: false,
      inScaEy: inScaEy,
      tdsPct: tds,
      eyPct: measEy,
      sovereigntyBanner: 'Your Taste Always Wins \u2014 Why Meter Read ' + measEy.toFixed(1) + '% Extraction (%EY) Yet It Tasted Off:',
      topCause: causes[0],
      causes: causes
    };
  }

  /* Plain-English Taste Profile Shield Evaluator (Scientist lens adds Student-t math) */
  function evaluateOutlierSurprise(tSt, histRows) {
    var lens = S.experienceLensSafe();
    var rows = Array.isArray(histRows) ? histRows : [];
    var ratings = [];
    for (var i = 0; i < rows.length; i++) {
      var stVal = parseFloat(rows[i] && rows[i].my_rating_stars);
      if (isFinite(stVal) && stVal > 0) ratings.push(stVal);
    }
    if (tSt.excludeLearning) {
      return {
        excludeLearning: true,
        studentTWeight: 0.0,
        huberWeight: 0.0,
        driftPct: '0.00%',
        badgeText: lens === 'scientist'
          ? 'Off-Day Shield ON \u2014 0.00% Drift (w = 0.00)'
          : 'Off-Day Shield ON \u2014 Won\'t Change Your Recipe',
        zSurprise: 0,
        surpriseTriggered: false,
        priorMedian: ratings[0] || 4.25
      };
    }
    if (ratings.length < 2 || !(+tSt.stars > 0)) {
      return {
        excludeLearning: false,
        studentTWeight: 1.0,
        huberWeight: 1.0,
        driftPct: 'Normal',
        badgeText: lens === 'scientist'
          ? 'Learning Active (Student-t \u03BD=3 w = 1.00)'
          : 'Learning Active \u2014 Teaching Your Taste Profile',
        zSurprise: 0,
        surpriseTriggered: false,
        priorMedian: ratings[0] || 4.25
      };
    }
    var sorted = ratings.slice().sort(function (x, y) { return x - y; });
    var mid = Math.floor(sorted.length / 2);
    var med = sorted.length % 2 ? sorted[mid] : 0.5 * (sorted[mid - 1] + sorted[mid]);
    var absDevs = sorted.map(function (v) { return Math.abs(v - med); }).sort(function (x, y) { return x - y; });
    var mad = Math.max(0.20, 1.4826 * absDevs[Math.floor(absDevs.length / 2)]);
    var resid = med - (+tSt.stars || 4.0);
    var z = resid / mad;
    var wStudent = Math.round((1.0 / (1.0 + (z * z) / 3.0)) * 1000) / 1000;
    var triggered = med >= 4.0 && z > 2.25;
    if (triggered) wStudent = Math.min(0.08, wStudent);
    return {
      excludeLearning: false,
      studentTWeight: wStudent,
      huberWeight: wStudent,
      driftPct: triggered ? ((wStudent * 100).toFixed(1) + '% softened') : 'Normal',
      badgeText: triggered
        ? (lens === 'scientist'
            ? ('Unusual Score Softened (Student-t \u03BD=3 w = ' + wStudent.toFixed(2) + ')')
            : 'Unusual Score Softened Automatically')
        : (lens === 'scientist'
            ? ('Learning Active (Student-t \u03BD=3 w = ' + wStudent.toFixed(2) + ')')
            : 'Learning Active \u2014 Teaching Your Taste Profile'),
      zSurprise: Math.round(z * 100) / 100,
      surpriseTriggered: triggered,
      priorMedian: Math.round(med * 100) / 100
    };
  }

  /* Blind Palate Flavor Match % Calculator */
  function computeWcrFlavorMatch(userNotes, bagNotesRaw) {
    var roasterList = Array.isArray(bagNotesRaw)
      ? bagNotesRaw
      : String(bagNotesRaw || '').split(/[;,\/|]/).map(function (s) { return s.trim(); }).filter(Boolean);
    var userList = Array.isArray(userNotes) ? userNotes.filter(Boolean) : [];
    if (!roasterList.length) {
      return {
        hasBagNotes: false,
        matchPct: userList.length ? 100 : 0,
        roasterNotes: [],
        hits: [],
        personalDiscoveries: userList.slice(),
        summaryLine: userList.length
          ? ('Saved ' + userList.length + ' blind flavor note' + (userList.length === 1 ? '' : 's') + ' to your Palate Profile!')
          : 'Tap any flavor notes you taste above to build your personal flavor profile!'
      };
    }
    var rClassified = roasterList.map(S.classifyFlavorWord).filter(Boolean);
    var uClassified = userList.map(S.classifyFlavorWord).filter(Boolean);
    if (!uClassified.length) {
      return {
        hasBagNotes: true,
        matchPct: 0,
        roasterNotes: roasterList,
        hits: roasterList.map(function (bn) { return { bagNote: bn, pts: 0, tier: 'miss', matchedUser: '', sub: '' }; }),
        personalDiscoveries: [],
        summaryLine: 'Tap the flavors you taste BEFORE scratching the foil to score your Blind Flavor Match!'
      };
    }

    var totalPts = 0;
    var hits = [];
    rClassified.forEach(function (rc, idx) {
      var bestPts = 0;
      var bestTier = 'miss';
      var matchedUser = '';
      uClassified.forEach(function (uc) {
        if (uc.canonical.toLowerCase() === rc.canonical.toLowerCase() || roasterList[idx].toLowerCase() === uc.canonical.toLowerCase()) {
          if (100 > bestPts) { bestPts = 100; bestTier = 'exact'; matchedUser = uc.canonical; }
        } else if (uc.sub === rc.sub && rc.sub !== 'Personal Note') {
          if (75 > bestPts) { bestPts = 75; bestTier = 'cousin'; matchedUser = uc.canonical; }
        } else if (uc.family === rc.family && rc.family !== 'Specialty') {
          if (45 > bestPts) { bestPts = 45; bestTier = 'family'; matchedUser = uc.canonical; }
        }
      });
      totalPts += bestPts;
      hits.push({
        bagNote: roasterList[idx],
        pts: bestPts,
        tier: bestTier,
        matchedUser: matchedUser,
        sub: rc.sub
      });
    });

    var matchPct = Math.min(100, Math.round(totalPts / Math.max(1, rClassified.length)));
    var discoveries = uClassified.filter(function (uc) {
      return !rClassified.some(function (rc) { return rc.family === uc.family; });
    }).map(function (uc) { return uc.canonical; });

    var matchedCount = hits.filter(function (h) { return h.pts >= 45; }).length;
    var summaryLine = matchPct + '% Flavor Match! (' + matchedCount + ' of ' + roasterList.length + ' bag notes spotted' +
      (discoveries.length ? ' + Bonus Note: ' + discoveries.slice(0, 2).join(', ') : '') + ')';

    return {
      hasBagNotes: true,
      matchPct: matchPct,
      roasterNotes: roasterList,
      hits: hits,
      personalDiscoveries: discoveries,
      summaryLine: summaryLine
    };
  }

  /* Stateful Single-Lever Prescription Solver (feeds actual_s vs target time_s!) */
  function computeStatefulPrescription(tSt) {
    tSt = tSt || {};
    var a = S.getApp();
    var lens = S.experienceLensSafe();
    var brew = a.cupBrew || a.brew || {};
    var flowInfo = evaluateBrewFlowTiming(a);
    var methodKey = String(brew.key || flowInfo.methodKey || (a.brew && a.brew.method) || 'v60').toLowerCase();
    var isEsp = methodKey === 'espresso' || methodKey === 'lever_espresso';
    var doseG = +brew.dose || +(a.brew && a.brew.dose) || (isEsp ? 18 : 15);
    var waterG = +brew.water || +(a.brew && a.brew.water) || (isEsp ? 36 : 250);
    var curRatio = +brew.ratio || +(a.brew && a.brew.ratio) || Math.round((waterG / Math.max(1, doseG)) * 10) / 10;
    var curTempC = +brew.temp_c || +(a.brew && a.brew.tempC) || (+brew.tempF > 0 ? Math.round(((+brew.tempF - 32) * 5 / 9) * 2) / 2 : 93);
    var curUm = +brew.grind_um || +(a.brew && a.brew.grindUm) || +(a.brew && a.brew.grind_um) || (isEsp ? 235 : 550);
    var outG = +tSt.bevOutG > 0 ? +tSt.bevOutG : (+brew.out_g || +brew.yieldOut || Math.max(18, isEsp ? waterG : Math.round(waterG - doseG * 2.05)));

    var actualS = +tSt.actualS > 0 ? +tSt.actualS : flowInfo.actualS;
    var targetS = +tSt.targetS > 0 ? +tSt.targetS : flowInfo.targetS;
    var timeDeltaS = (actualS > 0 && targetS > 0 && targetS <= 1200) ? Math.round(actualS - targetS) : 0;

    var effStars = +tSt.stars > 0 ? +tSt.stars : 4.25;
    var rawDx = clamp(+tSt.padX || 0, -1, 1);
    var rawDy = clamp(+tSt.padY || 0, -1, 1);
    var ringObj = ringInfoForXY(rawDx, rawDy);

    /* If user rated < 4.25 while leaving the bullseye puck centered at (0, 0),
       use actual brew flow timing or a gentle sweetness nudge so we ALWAYS give
       a real #1 Next-Brew Prescription when rated < 4.25! */
    var dx = rawDx;
    var dy = rawDy;
    if (ringObj.ring === 0 && effStars < 4.25) {
      if (timeDeltaS < -12) dx = -0.38;
      else if (timeDeltaS > 15) dx = 0.38;
      else if (+tSt.tdsPct > 0 && doseG > 0 && ((+tSt.tdsPct * outG) / doseG) > 21.8) dx = 0.34;
      else dx = -0.32;
      ringObj = ringInfoForXY(dx, dy);
    }

    var gInfo = resolveActiveGrinder(a, curUm, methodKey);
    var chronRows = getTrailRowsForActiveCoffee(a, methodKey);
    var tryNum = chronRows.length + 1;
    var nextTryNum = tryNum + 1;
    var measEy = (+tSt.tdsPct > 0 && doseG > 0) ? Math.round(((+tSt.tdsPct * outG) / doseG) * 100) / 100 : null;

    var core = (typeof window !== 'undefined' && window.BTCoreV6) ? window.BTCoreV6 : null;
    var coreDiag = null;
    var coreFn = core && (core.computeDialInPrescription || core.diagnoseAndPrescribe || core.solveMakeItPerfect);
    var obsSymptom = dx < -0.20 ? 'sour'
      : (dx > 0.20 ? (tSt.guidedLike && tSt.guidedLike.finish === 'too_much' ? 'astringent' : 'bitter')
      : (dy < -0.20 ? 'thin'
      : (dy > 0.20 ? 'strong' : 'balanced')));
    if (typeof coreFn === 'function') {
      try {
        coreDiag = coreFn.call(core, {
          coffee_id: a.coffee && a.coffee.id,
          coffee_name: a.coffee && a.coffee.name,
          methodKey: methodKey,
          method: methodKey,
          doseG: doseG,
          waterG: waterG,
          ratio: curRatio,
          tempC: curTempC,
          grindUm: curUm,
          d50Um: curUm,
          actualSecs: actualS || null,
          actual_s: actualS || null,
          targetSecs: targetS || null,
          time_s: targetS || null,
          actualTimeS: actualS || undefined,
          targetTimeS: targetS || undefined,
          grinderKey: gInfo.grinderKey,
          calib: a.prefs && a.prefs.pocketMicronCalib,
          bean: a.coffee,
          coffee: a.coffee
        }, {
          stars: effStars,
          rating: effStars,
          dx: dx,
          dy: dy,
          padX: dx,
          padY: dy,
          ring: ringObj.ring,
          symptom: obsSymptom,
          actualTimeS: actualS || undefined,
          timeDeltaS: timeDeltaS,
          tds: +tSt.tdsPct > 0 ? +tSt.tdsPct : null,
          tdsPct: +tSt.tdsPct > 0 ? +tSt.tdsPct : null,
          measuredTdsPct: +tSt.tdsPct > 0 ? +tSt.tdsPct : null,
          ey: measEy,
          eyPct: measEy,
          measuredEyPct: measEy,
          bevOutG: outG,
          outG: outG,
          exclude_learning: !!(tSt.excludeLearning || tSt.notMyStyle),
          excludeLearning: !!(tSt.excludeLearning || tSt.notMyStyle),
          dialLocked: !!tSt.goldLocked
        }, chronRows);
      } catch (_) {}
    }

    var tabu = computeTabuMemory(chronRows, { grindUm: curUm, tempC: curTempC, ratio: curRatio }, effStars);
    var ageDays = S.daysSinceIso(a.coffee && a.coffee.roast_date);
    var ultraFreshNote = (ageDays != null && ageDays <= 3 && a.coffee && a.coffee.is_frozen !== 'yes')
      ? ('Very fresh roast (Day ' + ageDays + ') holds extra CO2 gas \u2014 give the bloom 45 seconds before making big grind jumps.')
      : '';

    var tdsOffTarget = measEy != null && (measEy < 18.2 || measEy > 22.8);
    var inGoldZone = ringInfoForXY(rawDx, rawDy).ring === 0 && (effStars >= 4.25) && !(tdsOffTarget && effStars < 4.75);
    var isBalanced = inGoldZone && !(measEy != null && measEy < 18.8 && rawDx > 0.25) && !(coreDiag && coreDiag.isBalanced === false && (effStars < 4.5 || tdsOffTarget));

    var nextUm = curUm;
    var nextTempC = curTempC;
    var nextRatio = curRatio;
    var nextWaterG = waterG;
    var nextDoseG = doseG;
    var nextAgitation = (a.brew && a.brew.agitation) || 'standard';
    var primaryLever = 'lock';
    var headline = 'Sweet Bullseye Nailed \u2014 Ready to Lock as Your Gold Recipe!';
    var tabuPivotReason = '';
    var thermalSpilloverNote = '';
    var flowNoteInRx = '';

    var usedCoreDiag = false;
    if (!isBalanced && coreDiag && coreDiag.ok && coreDiag.nextRecipe && !coreDiag.isBalanced) {
      var cRx = coreDiag.nextRecipe;
      var cUm = +cRx.grindUm || +cRx.d50Um || curUm;
      var cTemp = +cRx.tempC > 0 ? +cRx.tempC : curTempC;
      var cRat = +cRx.ratio > 0 ? +cRx.ratio : curRatio;
      var cWater = +cRx.waterG > 0 ? +cRx.waterG : Math.round(doseG * cRat);
      var cDose = +cRx.doseG > 0 ? +cRx.doseG : doseG;
      var movedAny = (Math.abs(cUm - curUm) >= 1) || (Math.abs(cTemp - curTempC) >= 0.5) || (Math.abs(cRat - curRatio) >= 0.05) || (cRx.agitation && cRx.agitation !== nextAgitation);
      if (movedAny) {
        usedCoreDiag = true;
        nextUm = clamp(Math.round(cUm), isEsp ? 130 : 250, isEsp ? 420 : 1150);
        nextTempC = clamp(cTemp, 80, 99);
        nextRatio = clamp(Math.round(cRat * (isEsp ? 20 : 10)) / (isEsp ? 20 : 10), isEsp ? 1.2 : 11.5, isEsp ? 4.2 : 20.5);
        nextDoseG = cDose;
        nextWaterG = Math.round(cWater);
        if (cRx.agitation) nextAgitation = cRx.agitation;
        if (coreDiag.convergenceMode && String(coreDiag.convergenceMode).indexOf('channel') >= 0) primaryLever = 'channeling';
        else if (Math.abs(nextUm - curUm) >= 1) primaryLever = 'grind';
        else if (Math.abs(nextTempC - curTempC) >= 0.5) primaryLever = 'temp_pivot';
        else primaryLever = 'ratio';

        if (coreDiag.tabuPivotApplied) {
          tabuPivotReason = 'Smart Dial Memory (Skipping Past Dip): Pivoted axis instead of repeating a failed move.';
        }
        if (coreDiag.steppedThermalSpilloverC) {
          thermalSpilloverNote = 'Fine-Tune Between Grinder Clicks: paired with ' + nextTempC + ' \u00B0C water so extraction lands in the sweet spot.';
        }
        if (coreDiag.primaryActionHuman) {
          headline = String(coreDiag.primaryActionHuman);
        } else if (primaryLever === 'grind') {
          var gCoreNext = mapNextGrinderDisplay(nextUm, gInfo, a, methodKey);
          var dCl = Math.max(1, Math.abs(Math.round((nextUm - curUm) / Math.max(1, gInfo.umPerStep))));
          headline = 'Move ' + gInfo.grinderLabel + ' ' + dCl + ' ' + (dCl === 1 ? gInfo.unit.replace(/s$/, '') : gInfo.unit) + ' ' + (nextUm < curUm ? 'finer' : 'coarser') +
            ' (' + gInfo.curClicks + ' \u2192 ' + gCoreNext.clicks + ')' + (nextTempC !== curTempC ? (' \u00B7 Water ' + nextTempC + ' \u00B0C') : '');
        }
      }
    }

    if (!isBalanced && !usedCoreDiag) {
      var mx = nonlinMag(dx);
      var my = nonlinMag(dy);
      var jx = (Math.abs(mx) * 4.68) / 0.90;
      var jy = (Math.abs(my) * (isEsp ? 1.8 : 0.26)) / (isEsp ? 0.50 : 0.07);
      var channeling = ((measEy != null && measEy < 19.2 && dx > 0.24) || (dx > 0.30 && dy < -0.26)) && !(timeDeltaS > 22);

      if (timeDeltaS < -12 && dx < 0) {
        flowNoteInRx = 'Confirmed by timer: cup drained ' + Math.abs(timeDeltaS) + 's faster than target, leaving fruit acids under-extracted.';
      } else if (timeDeltaS > 15 && dx > 0) {
        flowNoteInRx = 'Confirmed by timer: drawdown ran ' + timeDeltaS + 's slower than target, pulling late dry bitterness.';
      }

      if (channeling) {
        primaryLever = 'channeling';
        var coarseClicks = gInfo.grindLocked ? 0 : 1;
        nextUm = gInfo.grindLocked ? curUm : (curUm + Math.round(gInfo.umPerStep));
        nextAgitation = 'gentle';
        var gChNext = mapNextGrinderDisplay(nextUm, gInfo, a, methodKey);
        headline = gInfo.grindLocked
          ? 'Pour gently in the center (skip heavy swirling) to stop uneven channeling'
          : ('Move ' + gInfo.grinderLabel + ' ' + coarseClicks + ' ' + gInfo.unit.replace(/s$/, '') + ' coarser (' + gInfo.curClicks + ' \u2192 ' + gChNext.clicks + ') + calm center pour');
      } else if (jx >= jy * 0.95 && Math.abs(dx) >= 0.18) {
        var wantFiner = dx < 0;
        var blockedReason = wantFiner ? tabu.grindFiner : tabu.grindCoarser;

        if (blockedReason) {
          tabuPivotReason = 'Smart Dial Memory (Skipping Past Dip): ' + blockedReason + ' \u2014 adjusting Water Temp & Ratio instead of repeating that grind move!';
          var canPivotTemp = wantFiner ? (!tabu.tempUp && curTempC <= 97.5) : (!tabu.tempDown && curTempC >= 83);
          if (canPivotTemp && methodKey !== 'cold' && methodKey !== 'cold_drip') {
            primaryLever = 'temp_pivot';
            var dT = wantFiner ? Math.min(3.0, Math.round((1.5 + Math.abs(mx) * 2.0) * 2) / 2) : -Math.min(3.0, Math.round((1.5 + Math.abs(mx) * 2.0) * 2) / 2);
            nextTempC = clamp(curTempC + dT, 80, 99);
            headline = (dT > 0 ? 'Raise' : 'Lower') + ' Water Temp ' + (dT > 0 ? '+' : '') + dT + ' \u00B0C (' + curTempC + ' \u2192 ' + nextTempC + ' \u00B0C) \u00B7 Keep ' + gInfo.grinderLabel + ' steady';
          } else {
            primaryLever = 'ratio_pivot';
            var dR = wantFiner ? (isEsp ? 0.25 : 0.8) : (isEsp ? -0.25 : -0.8);
            nextRatio = clamp(Math.round((curRatio + dR) * 10) / 10, isEsp ? 1.3 : 12.0, isEsp ? 4.0 : 19.5);
            nextWaterG = Math.round(doseG * nextRatio);
            headline = (dR > 0 ? 'Widen' : 'Tighten') + ' Ratio 1:' + curRatio + ' \u2192 1:' + nextRatio + ' (' + doseG + ' g : ' + nextWaterG + ' g) \u00B7 Keep grind steady';
          }
        } else if (gInfo.grindLocked) {
          primaryLever = 'preground_temp';
          var dTPg = wantFiner ? 2.5 : -2.5;
          nextTempC = clamp(curTempC + dTPg, 80, 99);
          headline = 'Pre-Ground Fix: ' + (dTPg > 0 ? 'Raise' : 'Lower') + ' Water ' + curTempC + ' \u2192 ' + nextTempC + ' \u00B0C + ' + (wantFiner ? '45s bloom stir' : 'calm single pour');
        } else {
          primaryLever = 'grind';
          var maxSpan = isEsp ? 46 : 150;
          var rawDeltaUm = mx * maxSpan;
          if (timeDeltaS < -18 && wantFiner) rawDeltaUm *= 1.15;
          else if (timeDeltaS > 20 && !wantFiner) rawDeltaUm *= 1.15;
          var rawClicks = Math.round(rawDeltaUm / gInfo.umPerStep);
          /* Never quantize a real extraction error down to 0 clicks unless grinder is locked */
          if (rawClicks === 0 && (Math.abs(dx) >= 0.28 || effStars < 4.25 || tdsOffTarget)) {
            rawClicks = wantFiner ? -1 : 1;
          }

          if (rawClicks === 0) {
            var spillOnlyT = clamp(Math.round((-0.092 * rawDeltaUm) * 2) / 2, -2.5, 2.5);
            if (Math.abs(spillOnlyT) < 1.0) spillOnlyT = wantFiner ? 1.5 : -1.5;
            nextTempC = clamp(curTempC + spillOnlyT, 80, 99);
            thermalSpilloverNote = lens === 'scientist'
              ? ('Fine-Tune Between Grinder Clicks: 1 click (' + gInfo.umPerStep + ' \u00B5m) exceeds ideal ' + Math.abs(Math.round(rawDeltaUm)) + ' \u00B5m micro-tweak \u2014 shifting kettle ' + (spillOnlyT > 0 ? '+' : '') + spillOnlyT + ' \u00B0C instead.')
              : ('Fine-Tune Between Grinder Clicks: 1 click would be too big a jump here, so nudging water temp ' + (spillOnlyT > 0 ? '+' : '') + spillOnlyT + ' \u00B0C instead!');
            headline = 'Keep ' + gInfo.grinderLabel + ' at ' + gInfo.curDisplay + ' & ' + (spillOnlyT > 0 ? 'raise' : 'lower') + ' water ' + curTempC + ' \u2192 ' + nextTempC + ' \u00B0C';
          } else {
            nextUm = clamp(curUm + rawClicks * gInfo.umPerStep, isEsp ? 130 : 250, isEsp ? 420 : 1150);
            var residualUm = rawDeltaUm - (rawClicks * gInfo.umPerStep);
            if (Math.abs(residualUm) >= 9 && methodKey !== 'cold') {
              var spillT = clamp(Math.round((-0.092 * residualUm) * 2) / 2, -2.0, 2.0);
              if (Math.abs(spillT) >= 0.5) {
                nextTempC = clamp(curTempC + spillT, 80, 99);
                thermalSpilloverNote = lens === 'scientist'
                  ? ('Fine-Tune Between Grinder Clicks: paired with ' + (spillT > 0 ? '+' : '') + spillT + ' \u00B0C (' + nextTempC + ' \u00B0C) to balance ' + Math.round(Math.abs(residualUm)) + ' \u00B5m step residual.')
                  : ('Fine-Tune Between Grinder Clicks: paired with ' + nextTempC + ' \u00B0C water so the grind step lands right in the sweet spot.');
              }
            }
            var gNext = mapNextGrinderDisplay(nextUm, gInfo, a, methodKey);
            var absCl = Math.abs(rawClicks);
            var unitSing = absCl === 1 ? gInfo.unit.replace(/s$/, '') : gInfo.unit;
            headline = 'Move ' + gInfo.grinderLabel + ' ' + absCl + ' ' + unitSing + ' ' + (rawClicks < 0 ? 'finer' : 'coarser') +
              ' (' + gInfo.curClicks + ' \u2192 ' + gNext.clicks + ')' +
              (nextTempC !== curTempC ? (' \u00B7 Water ' + nextTempC + ' \u00B0C') : '');
          }
        }
      } else {
        primaryLever = 'ratio';
        var wantTighter = dy < 0;
        var ratBlocked = wantTighter ? tabu.ratioTighter : tabu.ratioWider;
        if (ratBlocked) {
          tabuPivotReason = 'Smart Dial Memory (Skipping Past Dip): ' + ratBlocked + ' \u2014 adjusting Grind instead of repeating that ratio change!';
          var pivClicks = wantTighter ? -1 : 1;
          nextUm = clamp(curUm + pivClicks * gInfo.umPerStep, isEsp ? 130 : 250, isEsp ? 420 : 1150);
          var gPiv = mapNextGrinderDisplay(nextUm, gInfo, a, methodKey);
          headline = 'Move ' + gInfo.grinderLabel + ' 1 ' + gInfo.unit.replace(/s$/, '') + ' ' + (pivClicks < 0 ? 'finer' : 'coarser') + ' (' + gInfo.curClicks + ' \u2192 ' + gPiv.clicks + ')';
        } else {
          var maxRatSpan = isEsp ? 0.85 : 3.0;
          var dRatio = Math.round((-my * maxRatSpan) * (isEsp ? 20 : 10)) / (isEsp ? 20 : 10);
          if (Math.abs(dRatio) < (isEsp ? 0.15 : 0.5)) dRatio = dy < 0 ? (isEsp ? -0.2 : -0.7) : (isEsp ? 0.2 : 0.7);
          nextRatio = clamp(Math.round((curRatio + dRatio) * (isEsp ? 20 : 10)) / (isEsp ? 20 : 10), isEsp ? 1.2 : 11.5, isEsp ? 4.2 : 20.5);
          nextWaterG = Math.round(doseG * nextRatio);
          headline = (dRatio < 0 ? 'Use Less Water (Richer)' : 'Add Water (Lighter)') + ': Ratio 1:' + curRatio + ' \u2192 1:' + nextRatio + ' (' + doseG + ' g : ' + nextWaterG + ' g)';
        }
      }
    }

    var dSweetPct = 0, dAcidSharpPct = 0, dBitterPct = 0, dEyPct = 0, dTdsPct = 0;
    if (core && typeof core.simulateBrew === 'function' && !isBalanced) {
      try {
        var simCur = core.simulateBrew({ methodKey: methodKey, grinderKey: gInfo.grinderKey, doseG: doseG, waterG: waterG, d50Um: curUm, kettleTempC: curTempC, agitation: (a.brew && a.brew.agitation) || 'standard' });
        var simNxt = core.simulateBrew({ methodKey: methodKey, grinderKey: gInfo.grinderKey, doseG: nextDoseG, waterG: nextWaterG, d50Um: nextUm, kettleTempC: nextTempC, agitation: nextAgitation });
        if (simCur && simNxt) {
          dEyPct = Math.round((simNxt.eyPct - simCur.eyPct) * 100) / 100;
          dTdsPct = Math.round((simNxt.tdsPct - simCur.tdsPct) * 1000) / 1000;
          if (simCur.waveFracs && simNxt.waveFracs) {
            dSweetPct = Math.round((simNxt.waveFracs.sweet - simCur.waveFracs.sweet) * 100);
            dBitterPct = Math.round((simNxt.waveFracs.bitter - simCur.waveFracs.bitter) * 100);
          }
        }
      } catch (_) {}
    }
    if (!isBalanced && dSweetPct === 0 && dBitterPct === 0) {
      if (dx < -0.18) { dSweetPct = Math.max(8, Math.round(Math.abs(dx) * 26)); dAcidSharpPct = -Math.max(10, Math.round(Math.abs(dx) * 32)); }
      else if (dx > 0.18) { dSweetPct = Math.max(7, Math.round(Math.abs(dx) * 22)); dBitterPct = -Math.max(11, Math.round(Math.abs(dx) * 34)); }
      else if (dy < -0.18) { dSweetPct = Math.max(9, Math.round(Math.abs(dy) * 24)); }
      else { dBitterPct = -Math.max(8, Math.round(Math.abs(dy) * 20)); dSweetPct = 9; }
    } else if (dx < -0.18 && dAcidSharpPct === 0) {
      dAcidSharpPct = -Math.max(10, Math.round(Math.abs(dx) * 30));
      if (dSweetPct < 6) dSweetPct = Math.max(8, Math.round(Math.abs(dx) * 24));
    } else if (dx > 0.18 && dBitterPct >= 0) {
      dBitterPct = -Math.max(10, Math.round(Math.abs(dx) * 30));
      if (dSweetPct < 5) dSweetPct = Math.max(7, Math.round(Math.abs(dx) * 20));
    }

    var cfDeltaParts = [];
    if (dSweetPct > 0) cfDeltaParts.push('+' + dSweetPct + '% caramel sweetness');
    if (dAcidSharpPct < 0) cfDeltaParts.push('\u2212' + Math.abs(dAcidSharpPct) + '% sharp sourness');
    if (dBitterPct < 0) cfDeltaParts.push('\u2212' + Math.abs(dBitterPct) + '% dry bitterness');
    if (!cfDeltaParts.length && !isBalanced) cfDeltaParts.push('smoother body & cleaner finish');

    var counterfactualLine = isBalanced
      ? ('Try #' + tryNum + ' hit the Sweet Bullseye (' + effStars.toFixed(2) + '/5) \u00B7 Recipe ' + doseG + ' g : ' + waterG + ' g (' + gInfo.curDisplay + ', ' + curTempC + ' \u00B0C).')
      : ('Try #' + tryNum + ' \u2192 Try #' + nextTryNum + ' Forecast: Expected ' + cfDeltaParts.join(', ') + (flowNoteInRx ? (' \u00B7 ' + flowNoteInRx) : ''));

    var nextDisp = mapNextGrinderDisplay(nextUm, gInfo, a, methodKey);
    var xrayLine = 'D50 ' + curUm + ' \u2192 ' + nextUm + ' \u00B5m \u00B7 Ratio 1:' + curRatio + ' \u2192 1:' + nextRatio +
      ' \u00B7 Temp ' + curTempC + ' \u2192 ' + nextTempC + ' \u00B0C' +
      (actualS > 0 ? (' \u00B7 Time ' + actualS + 's/' + targetS + 's') : '') +
      (dEyPct ? (' \u00B7 \u0394EY ' + (dEyPct > 0 ? '+' : '') + dEyPct + '%') : '') +
      (dTdsPct ? (' \u00B7 \u0394TDS ' + (dTdsPct > 0 ? '+' : '') + dTdsPct + '%') : '');

    return {
      hasUserRated: tSt.hasUserRated !== false,
      isBalanced: isBalanced,
      inGoldZone: inGoldZone,
      ringInfo: ringObj,
      tryNum: tryNum,
      nextTryNum: nextTryNum,
      chronRows: chronRows,
      grinderInfo: gInfo,
      measEy: measEy,
      bevOutG: outG,
      actualTimeS: actualS,
      targetTimeS: targetS,
      timeDeltaS: timeDeltaS,
      flowDiagnosticClue: flowInfo.flowClue,
      primaryLever: primaryLever,
      headline: headline,
      counterfactualLine: counterfactualLine,
      xrayLine: xrayLine,
      tabuPivotReason: tabuPivotReason,
      thermalSpilloverNote: thermalSpilloverNote,
      ultraFreshNote: ultraFreshNote,
      hypotheses: (coreDiag && Array.isArray(coreDiag.hypotheses)) ? coreDiag.hypotheses : [],
      nextRecipe: {
        methodKey: methodKey,
        doseG: nextDoseG,
        waterG: nextWaterG,
        ratio: nextRatio,
        grindUm: nextUm,
        grindSetting: nextDisp.display,
        tempC: nextTempC,
        tempF: Math.round(nextTempC * 9 / 5 + 32),
        agitation: nextAgitation
      }
    };
  }

  /* Exact Pro Cupping (SCA-104-2024) Score Formula: 0.65625 * sum8 + 52.75 - 2*u - 4*d */
  function computeScaCvaScore(tSt) {
    var activeVals = [];
    CVA_ATTRS.forEach(function (at) {
      if (at.skippable && tSt.cvaSkipped[at.key]) return;
      activeVals.push(clamp(+tSt.cvaHedonic[at.key] || 7, 1, 9));
    });
    var meanVal = activeVals.length
      ? activeVals.reduce(function (s, v) { return s + v; }, 0) / activeVals.length
      : 7;
    var sum8 = 0;
    CVA_ATTRS.forEach(function (at) {
      if (at.skippable && tSt.cvaSkipped[at.key]) sum8 += meanVal;
      else sum8 += clamp(+tSt.cvaHedonic[at.key] || 7, 1, 9);
    });
    var uPenalty = Math.max(0, Math.min(5, Math.round(+tSt.cvaNonUniform || 0))) * 2;
    var dPenalty = (tSt.defectType ? Math.max(1, Math.min(5, Math.round(+tSt.cvaDefectiveCups || 1))) : 0) * 4;
    var raw = 0.65625 * sum8 + 52.75 - uPenalty - dPenalty;
    return Math.round(clamp(raw, 0, 100) * 4) / 4;
  }

  function qualityTierForScore(score100, stars, hasRated, ringIdx) {
    if (!hasRated) {
      return { text: 'Ready to Score \u00B7 Tap Stars or Diagnosis Below', tone: 'is-soft', heroCls: '' };
    }
    if (score100 >= 87.5 || (stars >= 4.5 && ringIdx === 0)) {
      return { text: 'Dialed Bullseye \u00B7 Specialty Outstanding', tone: 'is-good', heroCls: 'is-outstanding' };
    }
    if (score100 >= 83.0 || stars >= 4.0) {
      return { text: 'Very Good \u00B7 Sweet & Balanced', tone: 'is-good', heroCls: 'is-very-good' };
    }
    if (score100 >= 79.0 || stars >= 3.5) {
      return { text: 'Good Cup \u00B7 Worth a Small Tweak', tone: 'is-gold', heroCls: 'is-very-good' };
    }
    return { text: 'Needs Adjustment', tone: 'is-warn', heroCls: 'is-warn' };
  }

  /* Unified Calibrated Scoring across Quick (30s), Guided (90s), and Pro SCA Cupping */
  function computeUnifiedSensoryScore(tSt) {
    var ringIdx = ringInfoForXY(tSt.padX, tSt.padY).ring;
    if (tSt.mode === 'cva') {
      var cvaSc = computeScaCvaScore(tSt);
      var cvaStars = (tSt.hasUserRated && +tSt.stars > 0)
        ? clamp(+tSt.stars, 0.25, 5.0)
        : clamp(Math.round((1.0 + ((cvaSc - 58.0) / 34.0) * 4.0) * 4) / 4, 1.0, 5.0);
      var uPen = Math.max(0, Math.min(5, Math.round(+tSt.cvaNonUniform || 0))) * 2;
      var dPen = (tSt.defectType ? Math.max(1, Math.min(5, Math.round(+tSt.cvaDefectiveCups || 1))) : 0) * 4;
      var toSub = function (h) { return (5.5 + clamp(+h || 7, 1, 9) * 0.5).toFixed(1); };
      var cvaTier = qualityTierForScore(cvaSc, cvaStars, true, ringIdx);
      return {
        rated: true,
        score100: cvaSc,
        stars: cvaStars,
        tierText: cvaTier.text,
        tierTone: cvaTier.tone,
        heroCls: cvaTier.heroCls,
        breakdown: [
          { label: 'Acidity', val: toSub(tSt.cvaHedonic.acidity) },
          { label: 'Sweetness', val: toSub(tSt.cvaHedonic.sweetness) },
          { label: 'Body', val: toSub(tSt.cvaHedonic.mouthfeel) },
          { label: 'Finish', val: toSub(tSt.cvaHedonic.aftertaste) },
          { label: 'Clean / Uniformity', val: Math.max(0, 10 - uPen) + '/10' },
          { label: '-Defects', val: dPen > 0 ? ('-' + dPen) : '0', isDefect: dPen > 0 }
        ]
      };
    }

    if (!tSt.hasUserRated || !(+tSt.stars > 0)) {
      return {
        rated: false,
        score100: 0,
        stars: 0,
        tierText: 'Ready to Score \u00B7 Tap Stars or Diagnosis Below',
        tierTone: 'is-soft',
        heroCls: '',
        breakdown: [
          { label: 'Acidity', val: '--' },
          { label: 'Sweetness', val: '--' },
          { label: 'Body', val: '--' },
          { label: 'Finish', val: '--' },
          { label: 'Clean / Uniformity', val: '10/10' },
          { label: '-Defects', val: '0', isDefect: false }
        ]
      };
    }

    var effStars = clamp(+tSt.stars, 0.25, 5.0);
    var starBase = 58.0 + ((effStars - 1.0) / 4.0) * 34.0;
    var rDist = Math.hypot(+tSt.padX || 0, +tSt.padY || 0);
    var padAdj = rDist <= 0.20 ? 0.75 : -Math.min(3.5, (rDist - 0.20) * 3.0);

    var gi = tSt.guidedInt || {};
    var gl = tSt.guidedLike || {};
    var traitSub = function (key, idealMid) {
      var intV = clamp(+gi[key] || idealMid, 1, 5);
      var lk = gl[key] || 'just_right';
      var baseT = 7.2 + ((effStars - 3.0) * 0.75);
      if (lk === 'just_right') baseT += 0.35 + (key === 'sweetness' ? (intV - 3) * 0.15 : 0);
      else if (lk === 'too_little') baseT -= 0.75;
      else if (lk === 'too_much') baseT -= 0.90;
      if (key === 'finish' && intV >= 5 && lk === 'too_much') baseT -= 0.4;
      return clamp(baseT, 6.0, 9.8);
    };

    var acSub = traitSub('acidity', 3);
    var swSub = traitSub('sweetness', 4);
    var bdSub = traitSub('body', 3);
    var fnSub = traitSub('finish', 2);

    var guidedDelta = 0;
    if (tSt.mode === 'guided') {
      var rightCnt = ['acidity', 'sweetness', 'bitterness', 'body', 'finish'].filter(function (k) {
        return (gl[k] || 'just_right') === 'just_right';
      }).length;
      guidedDelta = (rightCnt - 3.5) * 0.55 + ((+gi.sweetness || 4) - 3) * 0.35 - Math.max(0, (+gi.bitterness || 2) - 3.5) * 0.6;
    }

    var defPen = (tSt.defectType ? 4 : 0);
    var rawSc = starBase + padAdj + guidedDelta - defPen;
    var finalSc = Math.round(clamp(rawSc, 58.0, 99.0) * 4) / 4;
    var cleanPts = clamp(Math.round(10 - Math.max(0, rDist - 0.35) * 4), 4, 10);
    var tier = qualityTierForScore(finalSc, effStars, true, ringIdx);

    return {
      rated: true,
      score100: finalSc,
      stars: effStars,
      tierText: tier.text,
      tierTone: tier.tone,
      heroCls: tier.heroCls,
      breakdown: [
        { label: 'Acidity', val: acSub.toFixed(1) },
        { label: 'Sweetness', val: swSub.toFixed(1) },
        { label: 'Body', val: bdSub.toFixed(1) },
        { label: 'Finish', val: fnSub.toFixed(1) },
        { label: 'Clean / Uniformity', val: cleanPts + '/10' },
        { label: '-Defects', val: defPen > 0 ? ('-' + defPen) : '0', isDefect: defPen > 0 }
      ]
    };
  }

  function syncGuidedToPad(tSt) {
    var acL = tSt.guidedLike.acidity;
    var btL = tSt.guidedLike.bitterness;
    var fnL = tSt.guidedLike.finish;
    var bdL = tSt.guidedLike.body;
    var nx = 0, ny = 0;
    if (acL === 'too_much') nx -= 0.46;
    if (btL === 'too_much' || fnL === 'too_much') nx += 0.48;
    if (tSt.guidedLike.sweetness === 'too_little' && Math.abs(nx) < 0.15) {
      nx = (+tSt.guidedInt.acidity >= +tSt.guidedInt.bitterness) ? -0.34 : 0.34;
    }
    if (bdL === 'too_little') ny = -0.44;
    else if (bdL === 'too_much') ny = 0.44;
    tSt.padX = clamp(nx, -0.95, 0.95);
    tSt.padY = clamp(ny, -0.95, 0.95);
  }

  function isStep5CoffeeUnknownVal(val) {
    var s = String(val == null ? '' : val).trim().toLowerCase();
    if (!s) return false;
    var compact = s.replace(/[^a-z0-9]/g, '');
    return compact === 'unknown' || compact === 'unsure' || compact === 'notsure' ||
      compact === 'dontknow' || compact === 'idontknow' || compact === 'unlisted' ||
      compact === 'unlabeled' || compact === 'none' || compact === 'nonelisted' ||
      compact === 'notonbag' || compact === 'na';
  }

  function resolveStep5CoffeeBagNotes(a) {
    a = a || S.getApp();
    if (!a || typeof a !== 'object') return '';
    a.coffee = a.coffee || {};
    var co = a.coffee;
    var direct = String(co.bag_notes || co.bagNotes || co.notes || co.flavors || '').trim();
    if (direct && !isStep5CoffeeUnknownVal(direct)) {
      co.bag_notes = direct;
      co.notes = direct;
      co.notesUnsure = '';
      co.bagNotesUnsure = '';
      co.notes_unknown = '';
      return direct;
    }

    var storage = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : null;
    var normPart = function (v) { return String(v || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); };
    var cid = String(co.id || co.coffee_id || '').trim();
    if (cid === 'cf_1' || /^uf_|^bag_/i.test(cid)) cid = '';
    var cName = normPart(co.name || co.coffee_name || '');
    var cRoast = normPart(co.roaster || '');
    var matchesRec = function (rec) {
      if (!rec || typeof rec !== 'object') return false;
      var rid = String(rec.coffee_id || rec.id || '').trim();
      if (cid && rid && rid === cid) return true;
      var rName = normPart(rec.name || rec.coffee_name || rec.coffee || '');
      var rRoast = normPart(rec.roaster || '');
      if (cName && rName === cName) {
        if (!cRoast || !rRoast || cRoast === rRoast) return true;
      }
      return false;
    };

    var vaultRec = null;
    try {
      var vList = (storage && typeof storage.getCoffeesVaultList === 'function') ? storage.getCoffeesVaultList() : null;
      if (!Array.isArray(vList) && typeof localStorage !== 'undefined') {
        var rawV = localStorage.getItem('brew-and-cup-coffees-v1');
        if (rawV) {
          var parsedV = JSON.parse(rawV);
          vList = Array.isArray(parsedV) ? parsedV : (parsedV && Array.isArray(parsedV.list) ? parsedV.list : null);
        }
      }
      if (Array.isArray(vList)) vaultRec = vList.find(matchesRec) || null;
    } catch (_) {}

    var uRec = null;
    try {
      if (storage && typeof storage.buildUnifiedCoffeesIndex === 'function') {
        var uList = storage.buildUnifiedCoffeesIndex();
        if (Array.isArray(uList)) uRec = uList.find(matchesRec) || null;
      }
    } catch (_) {}

    var mergeFields = [
      'origin', 'region', 'farm', 'farm_or_station', 'producer', 'harvest_year',
      'varietal', 'species', 'blend', 'process', 'process_sub', 'process_details',
      'decaf', 'decaf_process', 'roast', 'roast_date', 'is_frozen', 'frozen_date',
      'elevation_m', 'elevText', 'density', 'personal_note', 'agtron',
      'bean_agtron', 'ground_agtron', 'agtron_scale', 'roast_delta',
      'psd_d10_um', 'psd_d50_um', 'psd_d90_um', 'psd_span'
    ];
    [vaultRec, uRec].forEach(function (src) {
      if (!src) return;
      mergeFields.forEach(function (fk) {
        if ((!co[fk] || isStep5CoffeeUnknownVal(co[fk])) && src[fk] && !isStep5CoffeeUnknownVal(src[fk])) {
          co[fk] = src[fk];
        }
      });
    });

    var foundNotes = '';
    [vaultRec, uRec].some(function (src) {
      if (!src) return false;
      var cand = String(src.bag_notes || src.bagNotes || src.notes || src.flavors || '').trim();
      if (cand && !isStep5CoffeeUnknownVal(cand)) {
        foundNotes = cand;
        return true;
      }
      return false;
    });
    if (foundNotes) {
      co.bag_notes = foundNotes;
      co.notes = foundNotes;
      co.notesUnsure = '';
      co.bagNotesUnsure = '';
      co.notes_unknown = '';
      return foundNotes;
    }
    return '';
  }

  /* Persist Lossless 129-Column History Row + Deduct Bag Grams + Apply Next-Cup Fix / Gold Lock */
  function saveStep5TastingAndApply(tSt, rx, opts) {
    opts = opts || {};
    var a = S.getApp();
    var st = S.getState();
    var storage = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : null;
    var effStars = +tSt.stars > 0 ? +tSt.stars : 4.25;
    var lockGold = !!(opts.lockGold != null ? opts.lockGold : tSt.goldLocked);
    if (tSt.excludeLearning || tSt.notMyStyle) lockGold = false;

    st.stars = effStars;
    st.pad_xy = [Math.round(tSt.padX * 100) / 100, Math.round(tSt.padY * 100) / 100];
    st.general_notes = tSt.notes || '';
    st.exclude_learning = !!(tSt.excludeLearning || tSt.notMyStyle);
    st.outlier_reason = tSt.excludeLearning ? 'off_palate' : (tSt.notMyStyle ? 'not_my_style' : '');
    st.dial_locked = lockGold ? 'yes' : '';

    var sym = lockGold ? 'great'
      : (rx.primaryLever === 'channeling' ? 'uneven'
      : (tSt.padX < -0.20 ? 'sour'
      : (tSt.padX > 0.20 ? (tSt.guidedLike.finish === 'too_much' ? 'astringent' : 'bitter')
      : (tSt.padY < -0.20 ? 'thin'
      : (tSt.padY > 0.20 ? 'strong' : 'balanced')))));

    st.fix_symptom = sym;
    st.quick = st.quick || {};
    st.quick.sym = sym;
    st.quick.make = tSt.makeAgain || (effStars >= 3.75 ? 'yes' : 'maybe');
    st.quick.liked = tSt.userNotes.slice();
    st.quick.notLiked = tSt.dislikedNotes.slice();
    st.quick.areas = {
      acidity: tSt.guidedLike.acidity === 'just_right' ? 'good' : (tSt.guidedLike.acidity ? 'notgood' : 'good'),
      sweetness: tSt.guidedLike.sweetness === 'just_right' ? 'good' : (tSt.guidedLike.sweetness ? 'okay' : 'good'),
      taste: tSt.guidedLike.bitterness === 'too_much' ? 'notgood' : 'good',
      body: tSt.guidedLike.body === 'just_right' ? 'good' : 'okay',
      aftertaste: tSt.guidedLike.finish === 'too_much' ? 'notgood' : 'good'
    };

    st.desc = {
      acidity: clamp(+tSt.guidedInt.acidity || 3, 1, 5),
      sweetness: clamp(+tSt.guidedInt.sweetness || 4, 1, 5),
      bitterness: clamp(+tSt.guidedInt.bitterness || 2, 1, 5),
      body: clamp(+tSt.guidedInt.body || 3, 1, 5),
      astringency: clamp(+tSt.guidedInt.finish || 2, 1, 5),
      clarity: tSt.guidedInt.body <= 2 ? 5 : 4
    };
    st.words = st.words || {};
    st.words.flavor = tSt.userNotes.slice();

    if (tSt.mode === 'cva') {
      var cvaTot = computeScaCvaScore(tSt);
      st.cva = {
        cur: 12,
        score: Object.assign({}, tSt.cvaHedonic),
        fin: tSt.cvaRetasted ? Object.assign({}, tSt.cvaHedonic) : {},
        skip: Object.assign({}, tSt.cvaSkipped),
        desc: Object.assign({}, tSt.cvaDesc),
        intensity: Object.assign({}, tSt.cvaDesc),
        cata: tSt.userNotes.slice(),
        cool: { done: !!tSt.cvaRetasted, skipped: !tSt.cvaRetasted },
        nonUniform: +tSt.cvaNonUniform || 0,
        defective: tSt.defectType ? (+tSt.cvaDefectiveCups || 1) : 0,
        defect: !!tSt.defectType,
        dtype: tSt.defectType || '',
        sym: sym,
        total: cvaTot
      };
    } else {
      st.cva = { cur: 0 };
    }

    var restoredStep5BagNotes = resolveStep5CoffeeBagNotes(a);
    var matchInfo = computeWcrFlavorMatch(tSt.userNotes, restoredStep5BagNotes || (a.coffee && a.coffee.bag_notes));
    st.scratchReveal = {
      revealed: !!tSt.foilRevealed,
      matchPct: matchInfo.matchPct,
      userNotes: tSt.userNotes.slice()
    };

    var shRef = S.getShell();
    var mintFreshRowId = function () {
      if (shRef && typeof shRef.newId === 'function') return shRef.newId();
      if (typeof newId === 'function') return newId();
      return 'cup_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
    };
    var existingHist = (storage && typeof storage.getHistory === 'function') ? storage.getHistory() : null;
    if (!st.id || (existingHist && existingHist.ex && existingHist.ex.ids && existingHist.ex.ids.has(st.id))) {
      st.id = mintFreshRowId();
    }

    var co = (a && a.coffee) || {};
    var isCoffeeUnknownVal = isStep5CoffeeUnknownVal;
    var actualBagNotes = String(co.bag_notes || co.bagNotes || co.notes || restoredStep5BagNotes || '').trim();
    var hasActualBagNotes = !!(actualBagNotes && !isCoffeeUnknownVal(actualBagNotes));
    if (hasActualBagNotes) {
      co.bag_notes = actualBagNotes;
      co.notes = actualBagNotes;
      co.notesUnsure = '';
      co.bagNotesUnsure = '';
      co.notes_unknown = '';
    }
    var hasActualRoast = !!(co.roast && !isCoffeeUnknownVal(co.roast));
    var hasActualProc = !!(co.process && !isCoffeeUnknownVal(co.process));
    var hasActualOrig = !!(co.origin && !isCoffeeUnknownVal(co.origin));
    var hasActualElev = !!((+co.elevation_m >= 100 && +co.elevation_m <= 3600) || (co.density && !isCoffeeUnknownVal(co.density)));
    var hasActualDate = !!(co.roast_date && !isCoffeeUnknownVal(co.roast_date));

    var roastIsUnk = !hasActualRoast && !!(co.roastUnsure === 'yes' || co.roastUnsure === true || co.roast_unknown === 'yes' || co.roast_unknown === true || isCoffeeUnknownVal(co.roast));
    var procIsUnk = !hasActualProc && !!(co.processUnsure === 'yes' || co.processUnsure === true || co.process_unknown === 'yes' || co.process_unknown === true || isCoffeeUnknownVal(co.process));
    var origIsUnk = !hasActualOrig && !!(co.originUnsure === 'yes' || co.originUnsure === true || co.origin_unknown === 'yes' || co.origin_unknown === true || isCoffeeUnknownVal(co.origin));
    var elevIsUnk = !hasActualElev && !!(co.elevUnsure === 'yes' || co.elevUnsure === true || co.elevationUnsure === 'yes' || co.elev_unknown === 'yes' || co.elev_unknown === true || isCoffeeUnknownVal(co.elevation_m) || isCoffeeUnknownVal(co.elevText));
    var dateIsUnk = !hasActualDate && !!(co.dateUnsure === 'yes' || co.dateUnsure === true || co.roastDateUnsure === 'yes' || isCoffeeUnknownVal(co.roast_date));
    var notesIsUnk = !hasActualBagNotes && !!(co.notesUnsure === 'yes' || co.notesUnsure === true || co.bagNotesUnsure === 'yes' || isCoffeeUnknownVal(actualBagNotes));

    var overrides = { id: st.id, coffee: co };
    if (+tSt.tdsPct > 0) overrides.brew_tds_pct = +tSt.tdsPct;
    if (+rx.bevOutG > 0) overrides.brew_out_g = +rx.bevOutG;
    if (+rx.actualTimeS > 0) overrides.brew_actual_time_s = String(rx.actualTimeS);
    if (+rx.targetTimeS > 0) overrides.brew_time_s = String(rx.targetTimeS);
    if (tSt.inMugLogged) {
      overrides.pour_notes = ((a.brew && a.brew.pourNotes) ? a.brew.pourNotes + ' \u00B7 ' : '') + 'In-Mug Rescue: ' + tSt.inMugLogged;
    }

    var built = null;
    if (storage && typeof storage.buildRow === 'function') {
      try { built = storage.buildRow(overrides); } catch (_) {}
    }
    if (!built) {
      var base129 = (typeof emptyRowObj === 'function') ? emptyRowObj() : {};
      if (typeof COLUMNS !== 'undefined' && Array.isArray(COLUMNS)) {
        COLUMNS.forEach(function (colKey) {
          if (base129[colKey] === undefined) base129[colKey] = '';
        });
      }
      var parsedElevFallback = (!elevIsUnk && +co.elevation_m >= 100 && +co.elevation_m <= 3600) ? String(Math.round(+co.elevation_m)) : '';
      built = Object.assign(base129, {
        schema_version: '6.0',
        id: st.id || mintFreshRowId(),
        coffee_id: co.id || 'cf_1',
        saved_at: new Date().toISOString(),
        cupping_date: S.isoDaysAgo(0),
        mode: tSt.mode === 'cva' ? 'single_cup' : 'quick',
        roaster: co.roaster || '',
        coffee_name: co.name || 'Specialty Coffee',
        origin: origIsUnk ? 'unknown' : (co.origin || ''),
        process: procIsUnk ? 'unknown' : (co.process || ''),
        roast_level: roastIsUnk ? 'unknown' : (co.roast || ''),
        elevation_m: parsedElevFallback,
        elevation_class: elevIsUnk ? 'unknown' : (co.density || ''),
        roast_date: dateIsUnk ? '' : (co.roast_date || ''),
        bag_notes: hasActualBagNotes ? actualBagNotes : (notesIsUnk ? '' : ''),
        brew_method: rx.nextRecipe.methodKey,
        brew_attempt: String(rx.tryNum),
        brew_dose_g: String((a.brew && a.brew.dose) || 15),
        brew_water_g: String((a.brew && a.brew.water) || 250),
        brew_ratio: String((a.brew && a.brew.ratio) || 16.7),
        brew_temp_c: String((a.brew && a.brew.tempC) || 93),
        brew_temp_f: String((a.brew && a.brew.tempF) || 200),
        brew_grind_target_um: String((a.brew && a.brew.grindUm) || 550),
        brew_grind_setting: String((a.brew && a.brew.grind_setting) || rx.grinderInfo.curDisplay || ''),
        brew_time_s: rx.targetTimeS > 0 ? String(rx.targetTimeS) : '',
        brew_actual_time_s: rx.actualTimeS > 0 ? String(rx.actualTimeS) : '',
        brew_out_g: String(rx.bevOutG || ''),
        brew_tds_pct: +tSt.tdsPct > 0 ? String(tSt.tdsPct) : '',
        brew_ey_pct: rx.measEy != null ? String(rx.measEy) : '',
        my_rating_stars: String(effStars),
        dial_locked: lockGold ? 'yes' : '',
        make_again: st.quick.make,
        fix_symptom: sym,
        acidity_intensity: String(tSt.guidedInt.acidity || 3),
        sweetness_intensity: String(tSt.guidedInt.sweetness || 4),
        bitterness_intensity: String(tSt.guidedInt.bitterness || 2),
        body_intensity: String(tSt.guidedInt.body || 3),
        astringency_intensity: String(tSt.guidedInt.finish || 2),
        cva_intensity_json: tSt.excludeLearning ? JSON.stringify({ v6: { exclude_learning: true, outlier_reason: 'off_palate' } }) : '',
        flavors_liked: tSt.userNotes.join('; '),
        flavors_not_liked: tSt.dislikedNotes.join('; '),
        general_notes: tSt.notes || '',
        total_score: tSt.mode === 'cva' ? computeScaCvaScore(tSt).toFixed(2) : (computeUnifiedSensoryScore(tSt).rated ? computeUnifiedSensoryScore(tSt).score100.toFixed(1) : ''),
        score_kind: tSt.mode === 'cva' ? 'cva_affective' : 'quick'
      });
    } else {
      built.schema_version = '6.0';
      built.my_rating_stars = String(effStars);
      built.brew_attempt = String(rx.tryNum);
      if (roastIsUnk) built.roast_level = 'unknown';
      if (procIsUnk) built.process = 'unknown';
      if (origIsUnk) built.origin = 'unknown';
      if (elevIsUnk) {
        built.elevation_m = '';
        built.elevation_class = 'unknown';
      } else if (+co.elevation_m >= 100 && +co.elevation_m <= 3600 && !built.elevation_m) {
        built.elevation_m = String(Math.round(+co.elevation_m));
      }
      if (dateIsUnk) {
        built.roast_date = '';
        built.days_since_roast = '';
      }
      if (hasActualBagNotes) {
        built.bag_notes = actualBagNotes;
      } else if (notesIsUnk) {
        built.bag_notes = '';
      }
      if (rx.actualTimeS > 0) built.brew_actual_time_s = String(rx.actualTimeS);
      if (rx.targetTimeS > 0 && !built.brew_time_s) built.brew_time_s = String(rx.targetTimeS);
      if (a.brew && +a.brew.grindUm > 0 && !built.brew_grind_target_um) {
        built.brew_grind_target_um = String(a.brew.grindUm);
      }
      if (+tSt.tdsPct > 0) built.brew_tds_pct = String(tSt.tdsPct);
      if (rx.measEy != null) built.brew_ey_pct = String(rx.measEy);
      if (tSt.mode === 'cva') {
        built.total_score = computeScaCvaScore(tSt).toFixed(2);
        built.score_kind = 'cva_affective';
      } else {
        var uniSave = computeUnifiedSensoryScore(tSt);
        if (uniSave.rated) {
          built.total_score = uniSave.score100.toFixed(1);
          if (!built.score_kind) built.score_kind = 'quick';
        }
      }
    }

    if (built) {
      built.dial_locked = lockGold ? 'yes' : '';
      built.dial_symptom = sym;
      built.dial_change = (!lockGold && rx && rx.headline) ? String(rx.headline) : '';
      try {
        var adapObj = {};
        if (built.recipe_adaptation_json) {
          var parsedAd = JSON.parse(built.recipe_adaptation_json);
          if (parsedAd && typeof parsedAd === 'object' && !Array.isArray(parsedAd)) adapObj = parsedAd;
        }
        adapObj.dial_symptom = sym;
        adapObj.dial_change = built.dial_change;
        if (rx && rx.nextRecipe) {
          adapObj.next_recipe = {
            methodKey: rx.nextRecipe.methodKey,
            doseG: rx.nextRecipe.doseG,
            waterG: rx.nextRecipe.waterG,
            ratio: rx.nextRecipe.ratio,
            grindUm: rx.nextRecipe.grindUm,
            d50Um: rx.nextRecipe.grindUm,
            grindSetting: rx.nextRecipe.grindSetting || '',
            tempC: rx.nextRecipe.tempC,
            tempF: rx.nextRecipe.tempF,
            agitation: rx.nextRecipe.agitation || 'standard',
            fromTry: rx.tryNum,
            stars: effStars,
            tdsPct: +tSt.tdsPct > 0 ? +tSt.tdsPct : null,
            symptom: sym,
            headline: rx.headline || '',
            locked: !!lockGold
          };
        }
        built.recipe_adaptation_json = JSON.stringify(adapObj);
      } catch (_) {}
    }

    if (storage && typeof storage.keepInBrowser === 'function') {
      try { storage.keepInBrowser(built); } catch (_) {}
    } else if (storage && typeof storage.appendHistoryRow === 'function') {
      try { storage.appendHistoryRow(built); } catch (_) {}
    }

    var alreadyDeductedOnTimer = !!(a.cupBrew && a.cupBrew._bagDeducted);
    var usedDose = +((a.cupBrew && a.cupBrew.dose) || (a.brew && a.brew.dose) || 15);
    if (!alreadyDeductedOnTimer && storage && typeof storage.deductBagGrams === 'function' && usedDose > 0) {
      try { storage.deductBagGrams(a.coffee, usedDose, { silent: true }); } catch (_) {}
    }

    var prevUmBeforeSave = +((a.cupBrew && (a.cupBrew.grind_um || a.cupBrew.grindUm)) || (a.brew && (a.brew.grindUm || a.brew.grind_um)) || (built && built.brew_grind_target_um) || 0);
    if (!tSt.excludeLearning && !tSt.notMyStyle) {
      if (lockGold) {
        a.recipeLocked = true;
        if (a.brew) {
          a.brew._savedDialedMethod = a.brew.method || '';
          a.brew.dialAdaptation = { adapted: false, locked: true, fromTry: rx.tryNum, stars: effStars };
        }
        if (storage && typeof storage.commitDialLock === 'function') {
          try {
            var hAll = S.getHistoryObjs();
            var lastObj = hAll[hAll.length - 1] || built;
            storage.commitDialLock(lastObj, true);
          } catch (_) {}
        }
      } else if (rx.nextRecipe && a.brew) {
        a.recipeLocked = false;
        if (rx.nextRecipe.methodKey) a.brew.method = rx.nextRecipe.methodKey;
        a.brew.dose = rx.nextRecipe.doseG;
        a.brew.water = rx.nextRecipe.waterG;
        a.brew.ratio = rx.nextRecipe.ratio;
        a.brew.grindUm = rx.nextRecipe.grindUm;
        a.brew.grind_um = rx.nextRecipe.grindUm;
        if (rx.nextRecipe.grindSetting) a.brew.grind_setting = rx.nextRecipe.grindSetting;
        a.brew.tempC = rx.nextRecipe.tempC;
        a.brew.tempF = rx.nextRecipe.tempF;
        a.brew.agitation = rx.nextRecipe.agitation;
        a.brew._savedDialedMethod = a.brew.method || '';
        a.brew.dialAdaptation = {
          adapted: true,
          locked: false,
          fromTry: rx.tryNum,
          stars: effStars,
          tdsPct: +tSt.tdsPct > 0 ? +tSt.tdsPct : null,
          symptom: sym,
          prevUm: prevUmBeforeSave,
          nextUm: rx.nextRecipe.grindUm,
          headline: rx.headline || '',
          summaryBanner: rx.headline || ''
        };
        a.attempt = rx.tryNum;
        a.dialNote = {
          symptom: sym,
          change: [rx.headline],
          fromId: built.id || ''
        };
      }
    }

    if (storage && typeof storage.upsertCoffeeVaultRecord === 'function') {
      try { storage.upsertCoffeeVaultRecord(co, built); } catch (_) {}
    }

    st.id = mintFreshRowId();
    a.cupBrew = null;
    if (a.brew) {
      a.brew.actualSecs = null;
      a.brew.actualFromTimer = false;
      a.brew.measuredBeverageG = null;
    }
    _step5Session = null;
    try {
      if (typeof window !== 'undefined' && window.BTBrewStudio && typeof window.BTBrewStudio.resetTimerSession === 'function') {
        window.BTBrewStudio.resetTimerSession();
      }
    } catch (_) {}

    a.justSavedTasting = {
      coffeeName: (a.coffee && a.coffee.name) || 'Your Cup',
      roaster: (a.coffee && a.coffee.roaster) || '',
      stars: effStars,
      rxHeadline: (tSt.excludeLearning || tSt.notMyStyle)
        ? 'Off-Day Shield active \u2014 recipe kept unchanged'
        : (lockGold ? 'Locked as your 1-tap Gold Recipe!' : rx.headline),
      goldLocked: lockGold,
      tryNum: rx.tryNum,
      nextTryNum: rx.nextTryNum,
      shielded: !!(tSt.excludeLearning || tSt.notMyStyle),
      at: Date.now()
    };

    S.saveDraftSafe();
    S.haptic('celebrate');
    S.closeSheetSafe();

    /* Default post-save destination navigates to Preferences ('palate') or Home ('door'),
       while keeping next-cup fix / Gold Lock saved onto app.brew for their next brew! */
    var rawDest = String(opts.destination || 'palate').toLowerCase();
    var dest = rawDest === 'home' ? 'door'
      : (rawDest === 'prefs' || rawDest === 'preferences') ? 'palate'
      : rawDest === 'recipe' ? 'brew'
      : rawDest;

    if (dest === 'cellar') {
      a.brewStep = 'door';
      if (a.tabSegments) a.tabSegments.cellar = 'shelf';
      S.saveDraftSafe();
      S.navGo('cellar');
      S.toastSafe(lockGold
        ? ('Gold Recipe & Tasting saved to Cellar for ' + ((a.coffee && a.coffee.name) || 'this bag') + '!')
        : 'Saved tasting to your Cellar Journal!');
    } else if (dest === 'brew') {
      S.saveDraftSafe();
      S.navGo('recipe');
      S.toastSafe(tSt.excludeLearning
        ? 'Saved tasting with Off-Day Shield (Recipe Protected)!'
        : lockGold
        ? ('Gold Recipe Locked & Saved for ' + ((a.coffee && a.coffee.name) || 'this bag') + '!')
        : ('Saved Try #' + rx.tryNum + ' & loaded #1 fix for Try #' + rx.nextTryNum + '!'));
    } else if (dest === 'door') {
      a.brewStep = 'door';
      S.saveDraftSafe();
      S.navGo('door');
      S.toastSafe(tSt.excludeLearning
        ? 'Cup saved with Off-Day Shield \u2014 back on Home!'
        : lockGold
        ? ('Gold Recipe locked & saved for ' + ((a.coffee && a.coffee.name) || 'this bag') + '!')
        : ('Saved Try #' + rx.tryNum + ' (+ Try #' + rx.nextTryNum + ' fix ready on your bag)!'));
    } else {
      a.brewStep = 'door';
      if (a.tabSegments) a.tabSegments.palate = 'dna';
      S.saveDraftSafe();
      S.navGo('palate');
      S.toastSafe(tSt.excludeLearning
        ? 'Cup saved with Off-Day Shield \u2014 Preferences & recipe protected!'
        : lockGold
        ? ('Gold Recipe locked & Preferences updated for ' + ((a.coffee && a.coffee.name) || 'this bag') + '!')
        : ('Cup saved & Taste Preferences updated (+ Try #' + rx.nextTryNum + ' fix saved)!'));
    }
    return built;
  }

  /* Blind-First Rose-Copper Scratch Foil 2.0 Card + Tabbed Flavor Note Selector */
  function buildScratchFoilCard(tSt, onUpdate, allowBeanjaminHere) {
    var a = S.getApp();
    var bagNotesStr = resolveStep5CoffeeBagNotes(a);
    var match = computeWcrFlavorMatch(tSt.userNotes, bagNotesStr);

    var flavorPickerHost = S.h('div', { id: 'bt-step5-flavor-picker', style: 'display:flex;flex-direction:column;gap:9px' });
    var foilStatusBadge = !tSt.foilRevealed ? S.h('button', {
      type: 'button',
      class: 'bt-tc-pill is-compact is-copper',
      text: 'Peel Foil',
      onclick: function () {
        tSt.foilRevealed = true;
        S.haptic('celebrate');
        onUpdate();
      }
    }) : S.h('span', { class: 'bt-tc-badge is-good', text: match.hasBagNotes ? (match.matchPct + '% Match!') : (tSt.userNotes.length + ' Notes') });

    function toggleNoteInPlace(nt) {
      var ix = tSt.userNotes.indexOf(nt);
      if (ix >= 0) tSt.userNotes.splice(ix, 1);
      else tSt.userNotes.push(nt);
      S.haptic('tick');
      if (tSt.foilRevealed) {
        onUpdate();
      } else {
        paintFlavorPicker();
      }
    }

    function paintFlavorPicker() {
      flavorPickerHost.textContent = '';

      /* Selected Notes Tray */
      if (tSt.userNotes.length > 0) {
        flavorPickerHost.appendChild(S.h('div', { class: 'bt-tc-selected-tray', id: 'bt-step5-selected-flavors', 'aria-label': 'Selected flavor notes' },
          S.h('span', { style: 'font-size:0.75rem;font-weight:800;color:var(--ink-secondary);margin-right:2px', text: 'Selected (' + tSt.userNotes.length + '):' }),
          tSt.userNotes.map(function (nt) {
            return S.h('button', {
              type: 'button',
              class: 'bt-tc-selected-chip',
              'aria-label': 'Remove ' + nt,
              onclick: function () { toggleNoteInPlace(nt); }
            }, S.h('span', { text: nt }), S.h('span', { style: 'font-weight:900;opacity:0.85', text: '\u00D7' }));
          })
        ));
      } else {
        flavorPickerHost.appendChild(S.h('div', { class: 'bt-tc-selected-tray', id: 'bt-step5-selected-flavors' },
          S.h('span', { style: 'font-size:0.78rem;color:var(--ink-muted)', text: 'Pick a category tab below and tap flavors you tasted (0 selected yet).' })
        ));
      }

      /* 5 Category Tabs */
      var activeIdx = clamp(tSt.wcrActiveFam || 0, 0, S.WCR_LEXICON_FAMILIES.length - 1);
      flavorPickerHost.appendChild(S.h('div', { class: 'bt-tc-flavor-tabs', role: 'tablist', 'aria-label': 'Flavor categories' },
        S.WCR_LEXICON_FAMILIES.map(function (fam, fIdx) {
          var tabLbl = FLAVOR_TAB_SHORT_LABELS[fIdx] || fam.family;
          var on = activeIdx === fIdx;
          return S.h('button', {
            type: 'button',
            role: 'tab',
            class: 'bt-tc-pill is-compact' + (on ? ' is-copper' : ' is-soft'),
            'aria-selected': String(on),
            'aria-pressed': String(on),
            text: tabLbl,
            onclick: function () {
              tSt.wcrActiveFam = fIdx;
              S.haptic('tick');
              paintFlavorPicker();
            }
          });
        })
      ));

      /* Crisp Large Pills for Active Category */
      var activeFam = S.WCR_LEXICON_FAMILIES[activeIdx] || S.WCR_LEXICON_FAMILIES[0];
      activeFam.groups.forEach(function (grp) {
        flavorPickerHost.appendChild(S.h('div', { style: 'display:flex;flex-direction:column;gap:4px' },
          S.h('span', { style: 'font-size:0.74rem;font-weight:700;color:var(--ink-muted)', text: grp.sub }),
          S.h('div', { class: 'bt-tc-flavor-grid', role: 'group', 'aria-label': grp.sub + ' flavors' },
            grp.notes.map(function (nt) {
              var active = tSt.userNotes.indexOf(nt) >= 0;
              return S.h('button', {
                type: 'button',
                class: 'bt-tc-pill is-compact' + (active ? ' is-active' : ' is-soft'),
                'aria-pressed': String(active),
                text: nt,
                onclick: function () { toggleNoteInPlace(nt); }
              });
            })
          )
        ));
      });
    }
    paintFlavorPicker();

    var customIn = S.h('input', {
      type: 'text',
      placeholder: 'Type any flavor you tasted (e.g. Apricot, Brown Sugar)...',
      'aria-label': 'Custom blind flavor note',
      onkeydown: function (ev) {
        if (ev.key === 'Enter' && customIn.value.trim()) {
          ev.preventDefault();
          customIn.value.split(/[,;]+/).map(function (s) { return s.trim(); }).filter(Boolean).forEach(function (v) {
            if (tSt.userNotes.indexOf(v) < 0) tSt.userNotes.push(v);
          });
          customIn.value = '';
          S.haptic('snap');
          if (tSt.foilRevealed) onUpdate();
          else paintFlavorPicker();
        }
      }
    });

    var addNoteRow = S.h('div', { style: 'display:flex;gap:6px;align-items:center' },
      S.h('div', { class: 'bt-tc-spotlight', style: 'flex:1' }, customIn),
      S.h('button', {
        type: 'button',
        class: 'bt-tc-pill is-soft',
        text: '+ Add Note',
        onclick: function () {
          var raw = customIn.value.trim();
          if (!raw) return;
          raw.split(/[,;]+/).map(function (s) { return s.trim(); }).filter(Boolean).forEach(function (v) {
            if (tSt.userNotes.indexOf(v) < 0) tSt.userNotes.push(v);
          });
          customIn.value = '';
          S.haptic('snap');
          if (tSt.foilRevealed) onUpdate();
          else paintFlavorPicker();
        }
      })
    );

    var stage = S.h('div', { class: 'bt-tc-scratch-stage' });
    var bjCelebrateEl = null;
    if (tSt.foilRevealed && allowBeanjaminHere && typeof Beanjamin !== 'undefined' && Beanjamin && typeof Beanjamin.el === 'function') {
      bjCelebrateEl = Beanjamin.el(match.matchPct >= 55 ? 'celebrating' : 'eureka', { view: 'avatar', size: 48, label: 'Beanjamin Flavor Match' });
    } else if (tSt.foilRevealed) {
      bjCelebrateEl = S.buildGoldSealSvg(30);
    }

    var revealedContent = S.h('div', { style: 'display:flex;flex-direction:column;gap:8px;position:relative;z-index:1' },
      S.h('div', { class: 'bt-tc-row-between' },
        S.h('span', { class: 'bt-tc-kicker', text: 'Roaster\'s Printed Bag Notes' }),
        tSt.foilRevealed ? S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-compact is-soft',
          text: 'Cover Foil Again',
          onclick: function () {
            tSt.foilRevealed = false;
            onUpdate();
          }
        }) : null
      ),
      match.hasBagNotes ? S.h('div', { class: 'bt-tc-pill-wrap' },
        match.hits.map(function (ht) {
          var cls = ht.tier === 'exact' ? 'is-good' : (ht.tier === 'cousin' ? 'is-gold' : (ht.tier === 'family' ? 'is-sci' : 'is-soft'));
          var tag = ht.tier === 'exact' ? ' (Exact Match!)'
            : ht.tier === 'cousin' ? (' (Close Cousin: ' + ht.matchedUser + ')')
            : ht.tier === 'family' ? (' (Same Family: ' + ht.matchedUser + ')')
            : '';
          return S.h('span', { class: 'bt-tc-badge ' + cls, text: ht.bagNote + tag });
        })
      ) : S.h('div', { class: 'bt-tc-sub', text: 'No roaster bag notes entered on Step 1 \u2014 your blind tasting notes are saved directly to your Palate Wheel!' }),
      tSt.foilRevealed ? S.h('div', { class: 'bt-tc-match-banner' },
        bjCelebrateEl,
        S.h('div', null,
          S.h('b', { style: 'font-size:0.92rem;color:var(--good);display:block', text: match.hasBagNotes ? (match.matchPct + '% Blind Flavor Match!') : 'Blind Palate Notes Logged!' }),
          S.h('span', { style: 'font-size:0.8rem;color:var(--ink-secondary)', text: match.summaryLine })
        )
      ) : null
    );
    stage.appendChild(revealedContent);

    if (!tSt.foilRevealed) {
      var canvas = document.createElement('canvas');
      canvas.className = 'bt-tc-scratch-canvas bt-foil-canvas';
      canvas.setAttribute('aria-label', 'Scratch metallic rose-copper foil to reveal roaster bag notes');
      stage.appendChild(canvas);

      requestAnimationFrame(function () {
        try {
          var dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
          var wCss = Math.max(280, stage.clientWidth || 326);
          var hCss = Math.max(126, stage.clientHeight || 130);
          canvas.width = Math.round(wCss * dpr);
          canvas.height = Math.round(hCss * dpr);
          var ctx = canvas.getContext('2d');
          if (!ctx) return;
          ctx.scale(dpr, dpr);

          /* Multi-stop metallic brushed rose-copper shimmer */
          var grad = ctx.createLinearGradient(0, 0, wCss, hCss);
          grad.addColorStop(0.00, '#6B3318');
          grad.addColorStop(0.22, '#C87E47');
          grad.addColorStop(0.42, '#FCE6CE');
          grad.addColorStop(0.58, '#D98E55');
          grad.addColorStop(0.80, '#8A4420');
          grad.addColorStop(0.93, '#E8B384');
          grad.addColorStop(1.00, '#5E2B12');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, wCss, hCss);

          /* Specular diagonal metallic sheen band */
          var sheen = ctx.createLinearGradient(wCss * 0.15, 0, wCss * 0.65, hCss);
          sheen.addColorStop(0, 'rgba(255,248,238,0)');
          sheen.addColorStop(0.5, 'rgba(255,248,238,0.28)');
          sheen.addColorStop(1, 'rgba(255,248,238,0)');
          ctx.fillStyle = sheen;
          ctx.fillRect(0, 0, wCss, hCss);

          ctx.strokeStyle = 'rgba(255,250,242,0.17)';
          ctx.lineWidth = 1;
          for (var y = 3; y < hCss; y += 3) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(wCss, y);
            ctx.stroke();
          }

          ctx.strokeStyle = 'rgba(72,30,10,0.35)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(7, 7, wCss - 14, hCss - 14);

          var maxTextW = Math.max(120, wCss - 28);
          var foilHeadline = 'SCRATCH COPPER FOIL TO REVEAL BAG NOTES';
          var foilSubline = tSt.userNotes.length
            ? (tSt.userNotes.length + ' blind note' + (tSt.userNotes.length === 1 ? '' : 's') + ' picked \u2014 rub foil to reveal!')
            : (match.hasBagNotes
              ? ('Tap flavors you taste above, then scratch to reveal ' + match.roasterNotes.length + ' bag note' + (match.roasterNotes.length === 1 ? '' : 's') + '!')
              : 'Tap flavors you taste above, then scratch here!');
          var headPx = wCss < 360 ? 11.5 : 13;
          ctx.fillStyle = '#231108';
          ctx.textAlign = 'center';
          ctx.font = '800 ' + headPx + 'px sans-serif';
          while (headPx > 9.0 && ctx.measureText(foilHeadline).width > maxTextW) {
            headPx = Math.round((headPx - 0.5) * 10) / 10;
            ctx.font = '800 ' + headPx + 'px sans-serif';
          }
          ctx.fillText(foilHeadline, wCss / 2, hCss / 2 - 5, maxTextW);
          var subPx = Math.min(11.5, Math.max(9.5, headPx - 0.5));
          ctx.font = '600 ' + subPx + 'px sans-serif';
          while (subPx > 8.5 && ctx.measureText(foilSubline).width > maxTextW) {
            subPx = Math.round((subPx - 0.5) * 10) / 10;
            ctx.font = '600 ' + subPx + 'px sans-serif';
          }
          ctx.fillText(foilSubline, wCss / 2, hCss / 2 + 15, maxTextW);

          var grid = new Uint8Array(48);
          var cleared = 0;
          var drawing = false;

          function spawnFoilSparkle(px, py) {
            try {
              var dot = document.createElement('span');
              var dxS = (Math.random() - 0.5) * 26;
              var dyS = 8 + Math.random() * 18;
              dot.style.cssText = 'position:absolute;left:' + Math.round(px) + 'px;top:' + Math.round(py) + 'px;width:5px;height:5px;border-radius:50%;background:#FCE3C2;box-shadow:0 0 6px #D98B26;pointer-events:none;z-index:3;transition:transform 0.35s ease,opacity 0.35s ease;';
              stage.appendChild(dot);
              requestAnimationFrame(function () {
                dot.style.transform = 'translate(' + dxS.toFixed(1) + 'px,' + dyS.toFixed(1) + 'px) scale(0.3)';
                dot.style.opacity = '0';
              });
              setTimeout(function () { if (dot.parentNode) dot.parentNode.removeChild(dot); }, 380);
            } catch (_) {}
          }

          function peelComplete() {
            if (tSt.foilRevealed) return;
            tSt.foilRevealed = true;
            canvas.classList.add('is-peeled');
            S.haptic('celebrate');
            setTimeout(function () { onUpdate(); }, 220);
          }

          function rubAt(ev) {
            var rect = canvas.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            var lx = ((ev.clientX - rect.left) / rect.width) * wCss;
            var ly = ((ev.clientY - rect.top) / rect.height) * hCss;
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(lx, ly, 27, 0, Math.PI * 2);
            ctx.fill();
            spawnFoilSparkle(lx, ly);

            var gx = clamp(Math.floor((lx / wCss) * 12), 0, 11);
            var gy = clamp(Math.floor((ly / hCss) * 4), 0, 3);
            var newlyCleared = 0;
            for (var dxCell = -1; dxCell <= 1; dxCell++) {
              for (var dyCell = -1; dyCell <= 1; dyCell++) {
                var cx = gx + dxCell, cy = gy + dyCell;
                if (cx >= 0 && cx < 12 && cy >= 0 && cy < 4) {
                  var idx = cy * 12 + cx;
                  if (!grid[idx]) { grid[idx] = 1; cleared++; newlyCleared++; }
                }
              }
            }
            if (newlyCleared > 0 && cleared % 4 === 0) S.haptic('tick');
            if (cleared >= 18) peelComplete();
          }

          canvas.addEventListener('pointerdown', function (ev) {
            drawing = true;
            try { canvas.setPointerCapture(ev.pointerId); } catch (_) {}
            rubAt(ev);
          });
          canvas.addEventListener('pointermove', function (ev) {
            if (drawing) rubAt(ev);
          });
          canvas.addEventListener('pointerup', function () { drawing = false; });
          canvas.addEventListener('pointercancel', function () { drawing = false; });
        } catch (_) {}
      });
    }

    return S.h('div', { class: 'bt-tc-well', style: 'padding:12px 13px;gap:10px' },
      S.h('div', { class: 'bt-tc-row-between' },
        S.h('div', null,
          S.h('div', { class: 'bt-tc-kicker', text: 'Blind Taste Game \u00B7 Rose-Copper Scratch Foil' }),
          S.h('b', { style: 'font-size:0.96rem', text: 'What flavors did you taste before peeking?' }),
          S.h('p', { class: 'bt-tc-trait-desc', style: 'margin-top:2px', text: 'Browse flavor tabs & pick notes first, then scratch the copper foil (or tap Peel Foil) to compare with the bag!' })
        ),
        foilStatusBadge
      ),
      flavorPickerHost,
      addNoteRow,
      stage
    );
  }

  /* Main Step 5 Session, Module-Scoped DiFluid R2 Live Auto-Sync & Repaint Hook */
  var _step5Session = null;
  var _activeRepaintHook = null;
  var _r2BleBound = false;
  var _r2BleSubscribed = false;
  var _lastLiveR2 = null;
  var _lastR2ToastAt = 0;
  var _lastR2ToastTds = -1;
  var _prevBleR2State = { connected: false, scaleConnected: false, tempC: null, batteryPct: null };

  function getBleStateSafe() {
    try {
      var ble = (typeof window !== 'undefined' && window.BTBle) ? window.BTBle : null;
      if (ble && typeof ble.getState === 'function') return ble.getState() || {};
    } catch (_) {}
    return {};
  }

  function readBleScaleMugInfo(bst) {
    bst = bst || getBleStateSafe();
    var scSlot = (bst.slots && bst.slots.scale) || bst.scale || {};
    var connected = !!(bst.scaleConnected || scSlot.connected);
    var rawW = typeof bst.weightG === 'number'
      ? bst.weightG
      : (typeof scSlot.weightG === 'number' ? scSlot.weightG : 0);
    var weightG = (rawW != null && isFinite(rawW)) ? +rawW : 0;
    return {
      connected: connected,
      weightG: weightG,
      roundedG: Math.round(weightG)
    };
  }

  function syncStep5ScaleWeightBtnDom(btnEl, bst) {
    if (!btnEl) return;
    var info = readBleScaleMugInfo(bst);
    var labelSpan = btnEl.querySelector ? btnEl.querySelector('[data-scale-mug-txt="1"]') : null;
    var labelTxt = !info.connected
      ? 'Pair Scale'
      : (info.weightG > 8 ? ('Use Scale (' + info.roundedG + ' g)') : ('Scale Ready (' + Math.max(0, info.roundedG) + ' g)'));
    btnEl.className = 'bt-tc-pill is-compact ' + (info.connected && info.weightG > 8 ? 'is-copper' : 'is-soft');
    if (labelSpan) labelSpan.textContent = labelTxt;
    else btnEl.textContent = labelTxt;
  }

  function applyLiveR2Reading(detail, opts) {
    if (!detail) return false;
    var rawTds = +detail.tds;
    if (!isFinite(rawTds) || rawTds <= 0 || rawTds > 35) return false;
    var tdsVal = Math.round(rawTds * 100) / 100;
    var hasTemp = detail.tempC != null && isFinite(+detail.tempC) && +detail.tempC > 0;
    var tempVal = hasTemp ? Math.round(+detail.tempC * 10) / 10 : null;
    var nowMs = Date.now();

    _lastLiveR2 = {
      tds: tdsVal,
      tempC: tempVal,
      brix: detail.brix != null && isFinite(+detail.brix) ? +detail.brix : Math.round((tdsVal / 0.85) * 100) / 100,
      refractiveIndex: detail.refractiveIndex != null && isFinite(+detail.refractiveIndex) ? +detail.refractiveIndex : null,
      isAverage: !!detail.isAverage,
      readCount: detail.readCount || 1,
      at: nowMs
    };

    var a = S.getApp();
    var st = S.getState();
    a.taste = (a.taste && typeof a.taste === 'object') ? a.taste : {};
    a.taste.tds_pct = tdsVal;
    if (tempVal != null) a.taste.r2_temp_c = tempVal;
    st.measuredTds = tdsVal;

    var s = _step5Session || ensureStep5Session();
    s.tdsPct = tdsVal;
    if (tempVal != null) s.r2TempC = tempVal;
    s.r2Collapsed = false;
    s.r2Expanded = true;
    s._userHidR2 = false;
    s._liveR2Received = true;

    var mountedRepainted = false;
    if (typeof _activeRepaintHook === 'function') {
      mountedRepainted = !!_activeRepaintHook();
    }

    var isDuplicateTick = (nowMs - _lastR2ToastAt < 220) && Math.abs(tdsVal - _lastR2ToastTds) < 0.005;
    if (!isDuplicateTick && !(opts && opts.silent)) {
      _lastR2ToastAt = nowMs;
      _lastR2ToastTds = tdsVal;
      if (mountedRepainted || (a && a.activeTab === 'brew' && a.brewStep === 'taste')) {
        S.haptic('snap');
        S.toastSafe('DiFluid R2 Auto-Synced: ' + tdsVal.toFixed(2) + '% TDS');
      }
    }
    return true;
  }

  function ensureR2BleListeners() {
    if (typeof window === 'undefined') return;
    if (!_r2BleBound && typeof window.addEventListener === 'function') {
      _r2BleBound = true;
      window.addEventListener('bt-ble-refractometer', function (ev) {
        var d = (ev && ev.detail) || {};
        applyLiveR2Reading(d, { fromEvent: true });
      });
    }
    var ble = window.BTBle;
    if (!_r2BleSubscribed && ble && typeof ble.subscribe === 'function') {
      _r2BleSubscribed = true;
      try {
        ble.subscribe(function (bst) {
          if (!bst) return;
          var conn = !!bst.refractometerConnected;
          var scaleInfoSub = readBleScaleMugInfo(bst);
          var scaleConnNow = scaleInfoSub.connected;
          var tempNow = (bst.lastTempC != null && isFinite(+bst.lastTempC)) ? Math.round(+bst.lastTempC * 10) / 10 : null;
          var batNow = (bst.refractometerBatteryPct != null && isFinite(+bst.refractometerBatteryPct)) ? Math.round(+bst.refractometerBatteryPct) : null;
          var liveTds = (bst.lastTds != null && +bst.lastTds > 0 && (conn || +bst.lastR2AtMs > 0)) ? Math.round(+bst.lastTds * 100) / 100 : 0;

          if (typeof document !== 'undefined') {
            var mugBtnLive = document.getElementById('bt-step5-use-scale-weight-btn');
            if (mugBtnLive) syncStep5ScaleWeightBtnDom(mugBtnLive, bst);
          }

          if (liveTds > 0 && (!_step5Session || Math.abs(liveTds - (+_step5Session.tdsPct || 0)) >= 0.005)) {
            _prevBleR2State = { connected: conn, scaleConnected: scaleConnNow, tempC: tempNow, batteryPct: batNow };
            applyLiveR2Reading({
              tds: liveTds,
              tempC: tempNow,
              brix: bst.lastBrix,
              refractiveIndex: bst.lastRefractiveIndex,
              readCount: bst.lastR2ReadCount
            }, { fromSubscribe: true });
            return;
          }

          var metaChanged = (conn !== _prevBleR2State.connected) ||
            (scaleConnNow !== _prevBleR2State.scaleConnected) ||
            (conn && tempNow !== _prevBleR2State.tempC) ||
            (conn && batNow !== _prevBleR2State.batteryPct);
          _prevBleR2State = { connected: conn, scaleConnected: scaleConnNow, tempC: tempNow, batteryPct: batNow };

          if (_step5Session) {
            if ((conn || scaleConnNow) && !_step5Session._userHidR2) {
              _step5Session.r2Expanded = true;
              _step5Session.r2Collapsed = false;
            }
            if (conn && tempNow != null) {
              _step5Session.r2TempC = tempNow;
            }
          }
          if (metaChanged && typeof _activeRepaintHook === 'function') {
            _activeRepaintHook();
          }
        });
      } catch (_) {}
    }
  }

  ensureR2BleListeners();

  function ensureStep5Session(opts) {
    ensureR2BleListeners();
    var a = S.getApp();
    var st = S.getState();
    resolveStep5CoffeeBagNotes(a);
    var bleNow = getBleStateSafe();
    if (!st.brewFinishedAtMs) st.brewFinishedAtMs = Date.now();
    var coffeeId = (a.coffee && (a.coffee.id || a.coffee.name)) || 'default';
    var attemptTag = (a.cupBrew && a.cupBrew.attempt) || a.attempt || 0;
    var sessionSig = coffeeId + '::' + attemptTag + '::' + (st.brewFinishedAtMs || 0);

    var measBevG = (a.brew && +a.brew.measuredBeverageG > 10)
      ? Math.round(+a.brew.measuredBeverageG)
      : (a.cupBrew && +a.cupBrew.measuredBeverageG > 10 ? Math.round(+a.cupBrew.measuredBeverageG) : 0);
    var scaleConnectedInit = readBleScaleMugInfo(bleNow).connected;

    if (!_step5Session || _step5Session.sessionSig !== sessionSig) {
      var curBrew = a.cupBrew || a.brew || {};
      var isEsp = String(curBrew.method || curBrew.key || '').toLowerCase().indexOf('espresso') >= 0;
      var doseG = +curBrew.dose || 15;
      var waterG = +curBrew.water || (isEsp ? 36 : 250);
      var preRated = !!(opts && opts.preRated === true);
      var bleHasRecentTds = (+bleNow.lastTds > 0) && (!!bleNow.refractometerConnected || +bleNow.lastR2AtMs > 0 || !bleNow.simulatorActive);
      var initTds = +st.measuredTds > 0
        ? Math.round(+st.measuredTds * 100) / 100
        : (bleHasRecentTds ? Math.round(+bleNow.lastTds * 100) / 100 : (_lastLiveR2 && +_lastLiveR2.tds > 0 ? _lastLiveR2.tds : 0));
      var initR2Temp = (bleNow.lastTempC != null && isFinite(+bleNow.lastTempC) && (bleHasRecentTds || bleNow.refractometerConnected))
        ? Math.round(+bleNow.lastTempC * 10) / 10
        : (_lastLiveR2 && _lastLiveR2.tempC != null ? _lastLiveR2.tempC : 23.6);
      var defaultBevOutG = measBevG > 10
        ? measBevG
        : Math.max(18, Math.round(+curBrew.out_g || +curBrew.yieldOut || (isEsp ? waterG : waterG - doseG * 2.05)));

      if (initTds > 0) {
        a.taste = (a.taste && typeof a.taste === 'object') ? a.taste : {};
        a.taste.tds_pct = initTds;
      }

      _step5Session = {
        coffeeRef: coffeeId,
        sessionSig: sessionSig,
        hasUserRated: preRated,
        goldLocked: false,
        guideCollapsed: true,
        coolingCardCollapsed: true,
        mode: (opts && opts.initialMode) || 'quick', /* 'quick' | 'guided' | 'cva' */
        stars: preRated ? (+st.stars > 0 ? +st.stars : 4.25) : 0,
        makeAgain: '',
        padX: 0,
        padY: 0,
        vessel: 'preheated_ceramic',
        lidOff: false,
        bell60On: true,
        bell60Fired: false,
        gsCollapsed: true, /* Compact live mm:ss countdown by default! */
        rescueOpen: false,
        rescueSymptom: 'bitter',
        rescueMugG: Math.max(25, defaultBevOutG),
        inMugLogged: '',
        bevOutG: defaultBevOutG,
        _userEditedBevOut: false,
        _lastSyncedMeasuredBevG: measBevG || 0,
        r2Expanded: S.btToolModeSafe('refractometer') === 'always' || !!bleNow.refractometerConnected || scaleConnectedInit || initTds > 0,
        r2Collapsed: false,
        _userHidR2: false,
        _liveR2Received: initTds > 0,
        r2InputUnit: 'tds',
        tdsPct: initTds,
        r2TempC: initR2Temp,
        excludeLearning: false,
        notMyStyle: false,
        foilRevealed: false,
        userNotes: [],
        dislikedNotes: [],
        wcrActiveFam: 0,
        guidedInt: { acidity: 3, sweetness: 4, bitterness: 2, body: 3, finish: 2 },
        guidedLike: { acidity: 'just_right', sweetness: 'just_right', bitterness: 'just_right', body: 'just_right', finish: 'just_right' },
        coolEvolution: 'sweeter',
        cvaSkipped: { fragrance: false, aroma: false },
        cvaDesc: { fragrance: 9, aroma: 9, flavor: 10, aftertaste: 9, acidity: 9, sweetness: 10, mouthfeel: 9 },
        cvaHedonic: { fragrance: 7, aroma: 7, flavor: 8, aftertaste: 7, acidity: 8, sweetness: 8, mouthfeel: 7, overall: 8 },
        cvaRetasted: false,
        cvaNonUniform: 0,
        cvaDefectiveCups: 0,
        defectType: '',
        notes: st.general_notes || ''
      };
    } else {
      if ((bleNow.refractometerConnected || scaleConnectedInit) && !_step5Session._userHidR2) {
        _step5Session.r2Expanded = true;
        _step5Session.r2Collapsed = false;
      }
      if (measBevG > 10 && !_step5Session._userEditedBevOut && _step5Session._lastSyncedMeasuredBevG !== measBevG) {
        _step5Session.bevOutG = measBevG;
        _step5Session.rescueMugG = Math.max(25, measBevG);
        _step5Session._lastSyncedMeasuredBevG = measBevG;
      }
      var recentBleTdsOpen = (+bleNow.lastTds > 0 && (!!bleNow.refractometerConnected || +bleNow.lastR2AtMs > 0 || !bleNow.simulatorActive))
        ? Math.round(+bleNow.lastTds * 100) / 100
        : 0;
      if (!(+_step5Session.tdsPct > 0) && recentBleTdsOpen > 0) {
        _step5Session.tdsPct = recentBleTdsOpen;
        if (bleNow.lastTempC != null && isFinite(+bleNow.lastTempC)) {
          _step5Session.r2TempC = Math.round(+bleNow.lastTempC * 10) / 10;
        }
        if (!_step5Session._userHidR2) {
          _step5Session.r2Expanded = true;
          _step5Session.r2Collapsed = false;
        }
        a.taste = (a.taste && typeof a.taste === 'object') ? a.taste : {};
        a.taste.tds_pct = _step5Session.tdsPct;
      }
    }
    if (opts && opts.initialMode && ['quick', 'guided', 'cva'].indexOf(opts.initialMode) >= 0) {
      _step5Session.mode = opts.initialMode;
    }
    return _step5Session;
  }

  function markRatedWithFallbackStars(tSt, fallbackStars) {
    tSt.hasUserRated = true;
    if (!(+tSt.stars > 0)) {
      tSt.stars = clamp(+fallbackStars || 4.0, 0.25, 5.0);
    }
    if (!tSt.makeAgain) {
      tSt.makeAgain = tSt.stars >= 4.0 ? 'yes' : (tSt.stars >= 3.0 ? 'maybe' : 'no');
    }
  }

  function renderStep5(containerEl, opts) {
    opts = opts || {};
    var tSt = ensureStep5Session(opts);
    var a = S.getApp();
    var st = S.getState();
    var root = S.h('div', { class: 'bt-tc-stage has-sticky-cta', id: 'bt-step5-taste-root' });
    var gsTimerId = 0;

    /* Programmatic custom event hook ('bt:taste-rate') for tests & external controllers */
    if (!root._rateListenerAttached) {
      root._rateListenerAttached = true;
      root.addEventListener('bt:taste-rate', function (ev) {
        var d = (ev && ev.detail) || {};
        if (d.stars != null) tSt.stars = clamp(+d.stars, 0.25, 5.0);
        if (d.padX != null) tSt.padX = clamp(+d.padX, -1, 1);
        if (d.padY != null) tSt.padY = clamp(+d.padY, -1, 1);
        markRatedWithFallbackStars(tSt, d.stars || 4.25);
        paintAll();
      });
    }

    var ble = (typeof window !== 'undefined' && window.BTBle) ? window.BTBle : null;
    ensureR2BleListeners();

    var fixBannerMount = S.h('section', { id: 'bt-nextbrew-fix', class: 'bt-tc-hero-fix' });
    var ctaMount = S.h('div', { id: 'bt-step5-sticky-cta', style: 'display:contents' });
    var rateCardRef = null;
    var sweepWidgetRef = null;
    var padWidgetRef = null;

    function paintFixAndCtaOnly() {
      var rx = computeStatefulPrescription(tSt);
      var lens = S.experienceLensSafe();
      var cTitle = ((a.coffee && a.coffee.roaster) ? a.coffee.roaster + ' \u2014 ' : '') + ((a.coffee && a.coffee.name) || 'Current Brew');

      fixBannerMount.textContent = '';

      /* =====================================================================
         CARD 3: 2. Your Dial-In Verdict & Next-Brew Recipe (#bt-nextbrew-fix)
         Placed AFTER Card 2 Ratings — NEVER shows Gold Recipe before rating!
         ===================================================================== */
      if (!tSt.hasUserRated) {
        fixBannerMount.className = 'bt-tc-hero-fix is-awaiting';
        fixBannerMount.appendChild(S.h('div', { class: 'bt-tc-kicker', text: 'Step 2 of 2 \u00B7 Dial-In Verdict & Next Recipe' }));
        fixBannerMount.appendChild(S.h('h2', { class: 'bt-tc-fix-headline', text: '2. Your Dial-In Verdict & Next-Brew Recipe' }));

        var coachAvatar = null;
        if (!tSt.foilRevealed && typeof Beanjamin !== 'undefined' && Beanjamin && typeof Beanjamin.el === 'function') {
          coachAvatar = Beanjamin.el('curious', { view: 'avatar', size: 52, label: 'Beanjamin waiting for your rating' });
        } else {
          coachAvatar = S.iconEl('spark-star', { size: 24 });
        }

        fixBannerMount.appendChild(S.h('div', { class: 'bt-tc-coach-row' },
          coachAvatar,
          S.h('div', { style: 'display:flex;flex-direction:column;gap:4px' },
            S.h('b', { style: 'font-size:0.92rem;color:var(--ink)', text: 'Rate your cup & tap where it landed on the Balance Bullseye above' }),
            S.h('span', { class: 'bt-tc-sub', style: 'margin:0', text: 'As soon as you rate your sip, BeanTelligence will calculate your exact #1 single-lever tweak for Try #' + rx.nextTryNum + ' (or unlock your Gold Recipe if you nailed the Sweet Spot!).' }),
            rx.flowDiagnosticClue ? S.h('span', { style: 'font-size:0.78rem;color:var(--warn);font-weight:600', text: 'Timer clue ready: ' + rx.flowDiagnosticClue }) : null
          )
        ));

        /* Unrated Sticky CTA: scrolls smoothly to Card 2 Ratings (plus optional quick log) */
        ctaMount.textContent = '';
        ctaMount.appendChild(S.h('div', { class: 'bt-tc-sticky-cta' },
          S.h('button', {
            type: 'button',
            class: 'bt-tc-primary-btn is-prompt',
            onclick: function () {
              S.haptic('tick');
              if (rateCardRef && typeof rateCardRef.scrollIntoView === 'function') {
                try { rateCardRef.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (_) {}
              }
              S.toastSafe('Tap the beans or Balance Bullseye in Card 1 to rate your cup!');
            }
          },
            S.h('span', { style: 'text-align:left;min-width:0;overflow:hidden' },
              S.h('span', { style: 'display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap', text: 'Rate Your Cup Above First \u2191' }),
              S.h('span', { class: 'bt-tc-primary-sub', text: 'Tap beans or Bullseye for Try #' + rx.nextTryNum + ' fix' })
            ),
            S.iconEl('spark-star', { size: 20 })
          ),
          S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-soft',
            style: 'min-height:54px;padding:7px 11px',
            text: '\u2190 Timer',
            onclick: function () { S.navGo('timer'); }
          })
        ));

        if (typeof Beanjamin !== 'undefined' && Beanjamin && typeof Beanjamin.enforceSinglePerViewport === 'function') {
          Beanjamin.enforceSinglePerViewport(root);
        }
        return;
      }

      /* === USER HAS RATED: Render Live Dial-In Verdict & Next-Brew Recipe === */
      fixBannerMount.className = 'bt-tc-hero-fix' + (rx.inGoldZone ? ' is-sweet' : '');
      var heroBox = fixBannerMount;

      heroBox.appendChild(S.h('div', { class: 'bt-tc-kicker', text: 'Step 2 of 2 \u00B7 Dial-In Verdict \u00B7 ' + cTitle }));

      heroBox.appendChild(S.h('div', { class: 'bt-tc-row-between' },
        S.h('span', {
          class: 'bt-tc-badge ' + (rx.inGoldZone ? 'is-good' : 'is-gold'),
          text: rx.inGoldZone
            ? (tSt.goldLocked ? 'Gold Recipe Locked In!' : 'Sweet Bullseye Nailed!')
            : ('#1 Next-Brew Fix \u00B7 ' + rx.ringInfo.name)
        }),
        S.h('span', {
          class: 'mono',
          style: 'font-size:0.78rem;font-weight:700;color:var(--ink-muted)',
          text: rx.inGoldZone
            ? ('Try #' + rx.tryNum + ' \u00B7 ' + tSt.stars.toFixed(2) + '/5 Beans')
            : ('Try #' + rx.tryNum + ' (' + tSt.stars.toFixed(2) + '/5) \u2192 Try #' + rx.nextTryNum)
        })
      ));

      if (rx.inGoldZone) {
        var bjGoldEl = (!tSt.foilRevealed && typeof Beanjamin !== 'undefined' && Beanjamin && typeof Beanjamin.el === 'function')
          ? Beanjamin.el('celebrating', { view: 'avatar', size: 56, label: 'Beanjamin celebrating your Sweet Spot brew' })
          : S.buildGoldSealSvg(34);

        heroBox.appendChild(S.h('div', { class: 'bt-tc-coach-row' },
          bjGoldEl,
          S.h('div', null,
            S.h('h2', { class: 'bt-tc-fix-headline', text: '2. Sweet Spot Nailed \u2014 Keep This Exact Recipe!' }),
            S.h('p', { class: 'bt-tc-sub', style: 'margin:3px 0 0', text: rx.counterfactualLine })
          )
        ));
      } else {
        heroBox.appendChild(S.h('h2', { class: 'bt-tc-fix-headline', text: '2. ' + rx.headline }));
        heroBox.appendChild(S.h('div', { class: 'bt-tc-counterfactual' },
          S.iconEl('spark-star', { size: 17 }),
          S.h('span', { text: rx.counterfactualLine })
        ));
      }

      if (rx.tabuPivotReason) {
        heroBox.appendChild(S.h('div', { class: 'bt-tc-tabu-banner' },
          S.iconEl('vault-shield', { size: 16 }),
          S.h('span', { text: rx.tabuPivotReason })
        ));
      }

      if (rx.thermalSpilloverNote) {
        heroBox.appendChild(S.h('div', { class: 'bt-tc-sub', style: 'font-size:0.8rem;color:var(--accent);font-weight:600', text: rx.thermalSpilloverNote }));
      }

      if (rx.ultraFreshNote) {
        heroBox.appendChild(S.h('div', { class: 'bt-tc-sub', style: 'font-size:0.79rem;color:var(--warn)', text: rx.ultraFreshNote }));
      }

      if (lens === 'scientist') {
        heroBox.appendChild(S.h('div', { class: 'mono', style: 'font-size:0.76rem;color:var(--science);font-weight:700', text: rx.xrayLine }));
      }

      var ck = (typeof window !== 'undefined' && window.BTChartKit) ? window.BTChartKit : null;
      if (ck && typeof ck.dialInSparklineSvg === 'function' && rx.chronRows.length >= 1) {
        try {
          var pts = rx.chronRows.map(function (r, i) {
            return {
              val: parseFloat(r.my_rating_stars) || 3.8,
              deltaLabel: 'Try #' + (i + 1),
              locked: r.dial_locked === 'yes'
            };
          });
          pts.push({ val: tSt.stars, deltaLabel: 'Try #' + rx.tryNum + ' (Now)', locked: !!tSt.goldLocked });
          var spBox = S.h('div', { style: 'margin-top:2px' });
          spBox.innerHTML = ck.dialInSparklineSvg(pts, rx.inGoldZone ? null : { val: Math.min(5.0, Math.max(4.6, tSt.stars + 0.4)) });
          heroBox.appendChild(spBox);
        } catch (_) {}
      }

      var shouldSaveGold = !!(tSt.goldLocked && rx.inGoldZone && !tSt.excludeLearning && !tSt.notMyStyle);

      /* In-Place Gold Recipe Toggle (NEVER yanks/teleports user without explicit Save!) */
      if (rx.inGoldZone && !tSt.excludeLearning && !tSt.notMyStyle) {
        heroBox.appendChild(S.h('div', { style: 'display:flex;flex-direction:column;gap:7px' },
          S.h('button', {
            type: 'button',
            class: 'bt-tc-gold-lock-btn' + (tSt.goldLocked ? ' is-locked' : ''),
            'aria-pressed': String(!!tSt.goldLocked),
            onclick: function () {
              tSt.goldLocked = !tSt.goldLocked;
              tSt._goldExplicitlyOff = !tSt.goldLocked;
              S.haptic(tSt.goldLocked ? 'celebrate' : 'tick');
              S.toastSafe(tSt.goldLocked
                ? 'Locked as your Gold Recipe! Tap "Save Gold Recipe \u2192 Preferences" below when ready.'
                : 'Gold Recipe lock turned off for this cup.');
              paintFixAndCtaOnly();
            }
          },
            S.buildGoldSealSvg(20),
            S.h('span', { text: tSt.goldLocked ? 'Locked as My Gold Recipe (Tap to Unlock)' : 'Lock as My Gold Recipe' })
          ),
          tSt.goldLocked ? S.h('div', { class: 'bt-tc-badge is-gold', style: 'align-self:flex-start;white-space:normal', text: 'Gold Seal Ready \u2014 Finish any notes you want, then tap Save Gold Recipe \u2192 Preferences below!' }) : null
        ));
      }

      /* Secondary Convenience Pills inside Card 3 (only if user explicitly wants to pull Try #2 right now or jump to Cellar) */
      heroBox.appendChild(S.h('div', { class: 'bt-tc-pill-wrap bt-tc-verdict-alt-saves', style: 'margin-top:4px' },
        S.h('button', {
          type: 'button',
          id: 'bt-step5-save-brew-next-btn',
          class: 'bt-tc-pill is-compact is-copper',
          text: rx.inGoldZone ? 'Save & Brew Another Cup Now \u2192' : ('Save & Brew Try #' + rx.nextTryNum + ' Now \u2192'),
          onclick: function () {
            saveStep5TastingAndApply(tSt, rx, {
              lockGold: shouldSaveGold,
              destination: 'brew'
            });
          }
        }),
        S.h('button', {
          type: 'button',
          id: 'bt-step5-save-cellar-btn',
          class: 'bt-tc-pill is-compact is-soft',
          text: 'Save \u2192 Cellar',
          onclick: function () {
            saveStep5TastingAndApply(tSt, rx, {
              lockGold: shouldSaveGold,
              destination: 'cellar'
            });
          }
        })
      ));

      /* Sticky Bottom CTA when Rated: Primary "Save -> My Preferences" + Companion "Save -> Home" */
      ctaMount.textContent = '';

      var ctaLabel = shouldSaveGold
        ? 'Save Gold \u2192 Preferences'
        : 'Save \u2192 My Preferences';

      var ctaSub = (tSt.excludeLearning || tSt.notMyStyle)
        ? 'Off-Day Shield: logs cup without shifting preferences'
        : shouldSaveGold
        ? ('Locks Gold Recipe & updates your Taste Preferences')
        : 'Saves cup & updates your Taste Preferences (+ next-cup fix saved)';

      ctaMount.appendChild(S.h('div', { class: 'bt-tc-sticky-cta' },
        S.h('button', {
          type: 'button',
          id: 'bt-step5-save-prefs-btn',
          class: 'bt-tc-primary-btn',
          onclick: function () {
            saveStep5TastingAndApply(tSt, rx, {
              lockGold: shouldSaveGold,
              destination: 'palate'
            });
          }
        },
          S.h('span', { style: 'text-align:left;min-width:0;overflow:hidden' },
            S.h('span', { style: 'display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap', text: ctaLabel }),
            S.h('span', { class: 'bt-tc-primary-sub', text: ctaSub })
          ),
          S.iconEl('check-seal', { size: 18 })
        ),
        S.h('button', {
          type: 'button',
          id: 'bt-step5-save-home-btn',
          class: 'bt-tc-pill is-soft bt-tc-save-home-btn',
          title: 'Save tasting (+ next-cup fix) and return to Home Page',
          text: 'Save \u2192 Home',
          onclick: function () {
            saveStep5TastingAndApply(tSt, rx, {
              lockGold: shouldSaveGold,
              destination: 'door'
            });
          }
        })
      ));

      if (typeof Beanjamin !== 'undefined' && Beanjamin && typeof Beanjamin.enforceSinglePerViewport === 'function') {
        Beanjamin.enforceSinglePerViewport(root);
      }
    }

    function paintAll() {
      if (gsTimerId) { clearInterval(gsTimerId); gsTimerId = 0; }
      root.textContent = '';
      var tac = (typeof window !== 'undefined' && window.BTTactile) ? window.BTTactile : null;
      var lens = S.experienceLensSafe();
      var flowInfo = evaluateBrewFlowTiming(a);

      /* =====================================================================
         SECTION 0: Top Context Strip (<- Back to Timer + Live Brew Summary +
         Flow Diagnostic Clue) + Scannable "How to Taste This Cup" Guide
         ===================================================================== */
      root.appendChild(S.h('div', { class: 'bt-tc-top-strip', id: 'bt-step5-context-strip' },
        S.h('button', {
          type: 'button',
          class: 'bt-tc-back-pill',
          style: 'min-height:38px;padding:5px 11px;font-size:0.78rem',
          onclick: function () {
            S.closeSheetSafe();
            S.navGo('timer');
          }
        }, S.h('span', { text: '\u2190 Timer' })),
        S.h('div', { class: 'bt-tc-brew-summary', style: 'min-height:38px;padding:5px 10px;font-size:0.75rem' },
          S.h('span', { class: 'mono', style: 'font-weight:700;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap', text: flowInfo.summaryBadge }),
          S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-compact is-soft',
            style: 'min-height:28px;padding:2px 8px;font-size:0.72rem',
            text: tSt.guideCollapsed ? 'Tips ?' : 'Hide Tips',
            onclick: function () { tSt.guideCollapsed = !tSt.guideCollapsed; paintAll(); }
          })
        )
      ));

      if (flowInfo.flowClue) {
        root.appendChild(S.h('div', {
          class: 'bt-tc-flow-clue' + (flowInfo.flowTone === 'slow' ? ' is-slow' : ''),
          id: 'bt-step5-flow-clue'
        },
          S.iconEl('spark-star', { size: 16 }),
          S.h('span', { text: 'Flow Clue: ' + flowInfo.flowClue })
        ));
      }

      if (!tSt.guideCollapsed) {
        root.appendChild(S.h('section', { class: 'bt-tc-guide-strip', id: 'bt-step5-howto' },
          S.h('div', { class: 'bt-tc-row-between' },
            S.h('span', { class: 'bt-tc-kicker', text: 'How to Taste Your Cup (30-Second Cheat-Sheet)' }),
            S.h('span', { style: 'font-size:0.75rem;color:var(--ink-muted)', text: 'Sip \u2192 Rate \u2192 Dial In' })
          ),
          S.h('div', { class: 'bt-tc-guide-grid' },
            S.h('div', { class: 'bt-tc-guide-step' },
              S.h('b', { text: '1. Let It Cool Near 60 \u00B0C (140 \u00B0F)' }),
              S.h('span', { text: 'Piping-hot coffee (>70 \u00B0C) numbs sweetness and tastes extra bitter. Sip again warm for real fruit & caramel.' })
            ),
            S.h('div', { class: 'bt-tc-guide-step' },
              S.h('b', { text: '2. Rate Beans & Tap the Bullseye' }),
              S.h('span', { text: 'Tap 1\u20135 beans for enjoyment, then tap Sour, Bitter, Weak, Strong, or Sweet Center so we know what to adjust.' })
            ),
            S.h('div', { class: 'bt-tc-guide-step' },
              S.h('b', { text: '3. Taste Blind & Get Your #1 Fix' }),
              S.h('span', { text: 'Pick flavor notes before scratching the copper foil, then check Card 2 below for your exact next-brew recipe!' })
            )
          )
        ));
      }

      /* =====================================================================
         CARD 1: Optional Cup Cooling Timer — Best Flavor at 60 C (140 F)
         + Collapsible In-Mug Emergency Rescue ("Too Strong or Bitter Right Now?")
         ===================================================================== */
      var gsCard = S.h('section', {
        class: 'bt-tc-card' + (tSt.coolingCardCollapsed ? ' is-slim' : ''),
        id: 'bt-step5-cooling-card',
        style: tSt.coolingCardCollapsed ? 'padding:9px 13px;gap:6px' : ''
      });
      var elInitS = st.brewFinishedAtMs ? Math.max(0, (Date.now() - st.brewFinishedAtMs) / 1000) : 0;
      var gsInit = S.computeGoldenSipState({
        vesselKey: tSt.vessel,
        bevMassG: tSt.bevOutG,
        elapsedS: elInitS,
        lidOff: tSt.lidOff
      });

      function formatCoolingLine(gs) {
        if (gs.secsToGolden > 0) {
          return 'Ready for Sweet Sip in ' + gs.countdownMmSs + ' \u00B7 Est. ~' + gs.tempC.toFixed(0) + ' \u00B0C (' + gs.tempF + ' \u00B0F) now';
        }
        if (gs.inGoldenSipWindow) {
          return 'Sweet Sip Ready Now! (00:00) \u00B7 Est. ~' + gs.tempC.toFixed(0) + ' \u00B0C (' + gs.tempF + ' \u00B0F) \u2014 Peak Flavor';
        }
        return 'Warm Clarity Window (00:00) \u00B7 Est. ~' + gs.tempC.toFixed(0) + ' \u00B0C (' + gs.tempF + ' \u00B0F) \u2014 Bright Notes Open';
      }

      var liveCountdownTxt = S.h('div', { class: 'bt-tc-cool-clock-txt', text: formatCoolingLine(gsInit) });
      var liveProgressFill = S.h('i', { style: 'width:' + gsInit.progressPct + '%' });
      var liveLidTipEl = S.h('div', { class: 'bt-tc-sub', style: 'font-size:0.77rem;color:var(--warn);margin:0', hidden: !gsInit.lidTip, text: gsInit.lidTip });
      var liveCoolBar = S.h('div', { class: 'bt-tc-cool-livebar' + (gsInit.inGoldenSipWindow ? ' is-ready' : '') },
        S.h('div', { class: 'bt-tc-row-between' },
          liveCountdownTxt,
          S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-compact is-soft',
            style: 'min-height:32px;padding:4px 10px;font-size:0.75rem',
            text: 'Restart Clock',
            onclick: function () {
              st.brewFinishedAtMs = Date.now();
              tSt.bell60Fired = false;
              paintAll();
            }
          })
        ),
        S.h('div', { class: 'bt-tc-cool-progress' }, liveProgressFill),
        liveLidTipEl
      );

      var slimCoolingLabel = S.h('span', {
        class: 'mono',
        style: 'font-size:0.78rem;font-weight:700;color:var(--ink-secondary);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap',
        text: 'Cup Cooling: ~' + gsInit.tempC.toFixed(0) + ' \u00B0C \u00B7 ' + (gsInit.secsToGolden > 0 ? (gsInit.countdownMmSs + ' to 60 \u00B0C') : '60 \u00B0C Sweet Sip Ready')
      });

      if (tSt.coolingCardCollapsed) {
        gsCard.appendChild(S.h('div', { class: 'bt-tc-row-between', style: 'flex-wrap:nowrap' },
          slimCoolingLabel,
          S.h('div', { style: 'display:flex;align-items:center;gap:6px;flex-shrink:0' },
            S.h('button', {
              type: 'button',
              class: 'bt-tc-pill is-compact' + (tSt.bell60On ? ' is-copper' : ' is-soft'),
              style: 'min-height:34px;padding:4px 9px;font-size:0.74rem',
              'aria-pressed': String(tSt.bell60On),
              onclick: function () {
                tSt.bell60On = !tSt.bell60On;
                if (tSt.bell60On) S.ringGoldenSipBell();
                paintAll();
              }
            }, S.iconEl('bell', { size: 13 }), S.h('span', { text: tSt.bell60On ? '60 \u00B0C' : 'Muted' })),
            S.h('button', {
              type: 'button',
              id: 'bt-step5-cooling-expand-btn',
              class: 'bt-tc-pill is-compact is-soft',
              style: 'min-height:34px;padding:4px 10px;font-size:0.74rem',
              text: 'Timer / Rescue +',
              onclick: function () { tSt.coolingCardCollapsed = false; paintAll(); }
            })
          )
        ));
      } else {
        gsCard.appendChild(S.h('div', { class: 'bt-tc-row-between' },
          S.h('div', null,
            S.h('div', { class: 'bt-tc-kicker', text: 'Optional Cup Cooling Countdown' }),
            S.h('b', { style: 'font-size:0.98rem', text: 'Cup Cooling Timer \u2014 Best Flavor at 60 \u00B0C (140 \u00B0F)' })
          ),
          S.h('div', { class: 'bt-tc-pill-wrap' },
            S.h('button', {
              type: 'button',
              class: 'bt-tc-pill is-compact' + (tSt.bell60On ? ' is-copper' : ' is-soft'),
              'aria-pressed': String(tSt.bell60On),
              onclick: function () {
                tSt.bell60On = !tSt.bell60On;
                if (tSt.bell60On) S.ringGoldenSipBell();
                paintAll();
              }
            }, S.iconEl('bell', { size: 15 }), S.h('span', { text: tSt.bell60On ? '60 \u00B0C Chime: ON' : '60 \u00B0C Chime: OFF' })),
            S.h('button', {
              type: 'button',
              class: 'bt-tc-pill is-compact is-soft',
              text: tSt.gsCollapsed ? 'Expand Dial' : 'Hide Dial',
              onclick: function () { tSt.gsCollapsed = !tSt.gsCollapsed; paintAll(); }
            }),
            S.h('button', {
              type: 'button',
              class: 'bt-tc-pill is-compact is-soft',
              text: 'Minimize',
              onclick: function () { tSt.coolingCardCollapsed = true; paintAll(); }
            })
          )
        ));

        gsCard.appendChild(S.h('p', {
          class: 'bt-tc-trait-desc',
          text: 'Hot coffee (>70 \u00B0C / 158 \u00B0F) numbs sweetness and tastes extra bitter. Sip again around 60 \u00B0C (140 \u00B0F) when natural fruit & caramel open up.'
        }));
        gsCard.appendChild(liveCoolBar);

        /* Vessel Selector Pills (always visible in 1 clean scroll strip) */
        var vesselScroll = S.h('div', { class: 'bt-tc-pill-scroll', role: 'radiogroup', 'aria-label': 'Cup vessel' });
        S.VESSELS_5.forEach(function (v) {
          vesselScroll.appendChild(S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-compact' + (tSt.vessel === v.key ? ' is-active' : ' is-soft'),
            'aria-pressed': String(tSt.vessel === v.key),
            text: v.label,
            onclick: function () { tSt.vessel = v.key; S.haptic('tick'); paintAll(); }
          }));
        });
        gsCard.appendChild(vesselScroll);
      }

      var nativeClock = null;
      if (!tSt.coolingCardCollapsed && !tSt.gsCollapsed) {
        nativeClock = (tac && typeof tac.BTGoldenSipClock === 'function')
          ? tac.BTGoldenSipClock({
              tempC: gsInit.tempC,
              secsToGolden: gsInit.secsToGolden,
              lidTip: gsInit.lidTip
            })
          : null;
        if (nativeClock) gsCard.appendChild(nativeClock);
      }

      /* Live 1-second cooling countdown ticker (updates both compact readout AND expanded dial!) */
      gsTimerId = setInterval(function () {
        if (!gsCard.isConnected) { clearInterval(gsTimerId); gsTimerId = 0; return; }
        var elNow = st.brewFinishedAtMs ? Math.max(0, (Date.now() - st.brewFinishedAtMs) / 1000) : 0;
        var curGs = S.computeGoldenSipState({ vesselKey: tSt.vessel, bevMassG: tSt.bevOutG, elapsedS: elNow, lidOff: tSt.lidOff });
        slimCoolingLabel.textContent = 'Cup Cooling: ~' + curGs.tempC.toFixed(0) + ' \u00B0C \u00B7 ' + (curGs.secsToGolden > 0 ? (curGs.countdownMmSs + ' to 60 \u00B0C') : '60 \u00B0C Sweet Sip Ready');
        liveCountdownTxt.textContent = formatCoolingLine(curGs);
        liveProgressFill.style.width = curGs.progressPct + '%';
        liveCoolBar.classList.toggle('is-ready', !!curGs.inGoldenSipWindow);
        if (curGs.lidTip) { liveLidTipEl.hidden = false; liveLidTipEl.textContent = curGs.lidTip; }
        else { liveLidTipEl.hidden = true; }
        if (nativeClock && typeof nativeClock.update === 'function') nativeClock.update(curGs);
        if (curGs.crossed60C && tSt.bell60On && !tSt.bell60Fired) {
          tSt.bell60Fired = true;
          S.ringGoldenSipBell();
        }
      }, 1000);

      /* Handy In-Mug Emergency Rescue Pill right inside Card 1 */
      var rescueHost = S.h('div', { style: 'display:flex;flex-direction:column;gap:8px' });
      function paintInMugRescueOnly() {
        rescueHost.textContent = '';
        var rescueSol = solveInMugRescueSafe({
          symptom: tSt.rescueSymptom,
          mugWeightG: tSt.rescueMugG,
          measTdsPct: tSt.tdsPct,
          isEspresso: flowInfo.methodKey.indexOf('espresso') >= 0
        });

        rescueHost.appendChild(S.h('button', {
          type: 'button',
          class: 'bt-tc-rescue-trigger',
          'aria-expanded': String(!!tSt.rescueOpen),
          onclick: function () {
            tSt.rescueOpen = !tSt.rescueOpen;
            if (tSt.rescueOpen) {
              if (tSt.padX > 0.2) tSt.rescueSymptom = 'bitter';
              else if (tSt.padX < -0.2) tSt.rescueSymptom = 'sour';
              else if (tSt.padY > 0.2) tSt.rescueSymptom = 'strong';
              else if (tSt.padY < -0.2) tSt.rescueSymptom = 'weak';
            }
            S.haptic('tick');
            paintInMugRescueOnly();
          }
        },
          S.h('span', { text: 'Too Strong or Bitter Right Now? Fix This Mug \u2192' }),
          S.h('span', { class: 'mono', style: 'font-size:0.78rem', text: tSt.rescueOpen ? 'Hide \u2212' : 'Open +' })
        ));

        if (tSt.rescueOpen) {
          var mugFillPct = clamp(Math.round((tSt.rescueMugG / 320) * 80), 22, 82);
          var topUpPct = clamp(Math.round((rescueSol.bypassWaterG / 320) * 80), 8, 28);
          var mugSvgWrap = S.h('div');
          mugSvgWrap.innerHTML = '<svg class="bt-tc-mug-svg" viewBox="0 0 280 96" role="img" aria-label="In-mug emergency rescue level gauge">' +
            '<rect x="18" y="10" width="96" height="76" rx="12" fill="var(--well)" stroke="var(--ink)" stroke-width="2"/>' +
            '<path d="M114 26 C130 26 130 66 114 66" fill="none" stroke="var(--ink)" stroke-width="2.4" stroke-linecap="round"/>' +
            '<rect x="21" y="' + (83 - mugFillPct) + '" width="90" height="' + mugFillPct + '" rx="8" fill="#6F391B"/>' +
            (tSt.rescueSymptom === 'strong' || tSt.rescueSymptom === 'bitter'
              ? '<rect x="21" y="' + Math.max(13, 83 - mugFillPct - topUpPct) + '" width="90" height="' + topUpPct + '" rx="5" fill="rgba(43,131,184,0.42)"/>'
              : '') +
            '<text x="142" y="36" font-size="11.5" font-weight="800" fill="var(--ink)">In Mug: ' + tSt.rescueMugG + ' g</text>' +
            '<text x="142" y="55" font-size="10.5" font-weight="700" fill="var(--good)">+' + rescueSol.bypassWaterG + ' g @ 80 \u00B0C OR ' + rescueSol.salineDrops20Pct + ' saline drops</text>' +
            '<text x="142" y="72" font-size="9.5" fill="var(--ink-muted)">(~' + rescueSol.saltMg + ' mg tiny pinch of salt)</text>' +
            '</svg>';

          rescueHost.appendChild(S.h('div', { class: 'bt-tc-rescue-drawer' },
            S.h('div', { class: 'bt-tc-pill-scroll', role: 'radiogroup', 'aria-label': 'Current mug issue' },
              [
                ['bitter', 'Bitter / Harsh'],
                ['strong', 'Too Strong / Heavy'],
                ['sour',   'Sour / Sharp'],
                ['dry',    'Dry / Puckering'],
                ['weak',   'Weak / Thin']
              ].map(function (it) {
                return S.h('button', {
                  type: 'button',
                  class: 'bt-tc-pill is-compact' + (tSt.rescueSymptom === it[0] ? ' is-active' : ''),
                  'aria-pressed': String(tSt.rescueSymptom === it[0]),
                  text: it[1],
                  onclick: function () { tSt.rescueSymptom = it[0]; S.haptic('tick'); paintInMugRescueOnly(); }
                });
              })
            ),
            S.h('div', { class: 'bt-tc-row-between' },
              S.h('div', { class: 'bt-tc-pill-scroll' },
                [36, 150, 220, 280].map(function (wg) {
                  return S.h('button', {
                    type: 'button',
                    class: 'bt-tc-pill is-compact is-soft' + (tSt.rescueMugG === wg ? ' is-active' : ''),
                    text: wg + ' g',
                    onclick: function () { tSt.rescueMugG = wg; paintInMugRescueOnly(); }
                  });
                })
              ),
              S.h('div', { class: 'bt-tc-spotlight', style: 'width:118px;min-height:40px' },
                S.h('input', {
                  type: 'number',
                  inputmode: 'decimal',
                  min: '20',
                  max: '900',
                  value: String(tSt.rescueMugG),
                  'aria-label': 'Coffee in mug grams',
                  onchange: function (e) { tSt.rescueMugG = clamp(+e.target.value || 215, 20, 900); paintInMugRescueOnly(); }
                }),
                S.h('span', { class: 'mono', style: 'font-size:0.78rem;color:var(--ink-muted)', text: 'g' })
              )
            ),
            mugSvgWrap,
            S.h('div', { class: 'bt-tc-rescue-rx' },
              S.h('b', { style: 'display:block;margin-bottom:3px', text: rescueSol.primaryHeadline }),
              S.h('div', { text: rescueSol.secondaryHeadline }),
              lens === 'scientist' ? S.h('div', { style: 'margin-top:4px;font-size:0.76rem;color:var(--science)', text: rescueSol.scienceWhy }) : null
            ),
            S.h('div', { class: 'bt-tc-row-between' },
              S.h('span', { class: 'bt-tc-sub', style: 'font-size:0.76rem', text: tSt.inMugLogged ? ('Logged: ' + tSt.inMugLogged) : '20% saline = 5 g table salt dissolved in 20 g warm water.' }),
              S.h('button', {
                type: 'button',
                class: 'bt-tc-pill is-compact is-copper',
                text: tSt.inMugLogged ? 'Rescue Logged' : 'Log Rescue on This Cup',
                onclick: function () {
                  tSt.inMugLogged = rescueSol.primaryHeadline;
                  S.haptic('snap');
                  S.toastSafe('Recorded In-Mug Rescue on today\'s cup!');
                  paintInMugRescueOnly();
                }
              })
            )
          ));
        }
      }
      if (!tSt.coolingCardCollapsed) {
        paintInMugRescueOnly();
        gsCard.appendChild(rescueHost);
        root.appendChild(gsCard);
      }

      /* =====================================================================
         CARD 2: 1. Rate & Describe Your Cup
         Modes: Quick 30s | Guided Tasting | Pro SCA Cupping + 5-Bowl Cupping
         ===================================================================== */
      var rateCard = S.h('section', { class: 'bt-tc-card', id: 'bt-step5-rate-card' });
      rateCardRef = rateCard;

      rateCard.appendChild(S.h('div', { class: 'bt-tc-row-between' },
        S.h('div', null,
          S.h('div', { class: 'bt-tc-kicker', text: 'Step 1 of 2 \u00B7 Sensory Rating & Balance' }),
          S.h('h2', { class: 'bt-tc-fix-headline', text: '1. Rate & Describe Your Cup' })
        ),
        S.h('span', {
          class: 'bt-tc-badge ' + (tSt.hasUserRated ? 'is-good' : 'is-gold'),
          id: 'bt-step5-rated-status-badge',
          text: tSt.hasUserRated ? ('Rated: ' + tSt.stars.toFixed(2) + '/5') : 'Tap Stars to Rate'
        })
      ));

      /* 3 Progressive Sensory Modes Switcher + Prominent 5-Bowl Blind Cupping Launch */
      rateCard.appendChild(S.h('div', { class: 'bt-tc-mode-bar-row' },
        S.h('div', { class: 'bt-tc-seg-bar bt-tc-mode-seg', role: 'tablist', 'aria-label': 'Sensory Tasting Mode' },
          [
            ['quick',  'Quick 30s'],
            ['guided', 'Guided Tasting'],
            ['cva',    'Pro SCA Cupping']
          ].map(function (m) {
            var on = tSt.mode === m[0];
            return S.h('button', {
              type: 'button',
              role: 'tab',
              class: 'bt-tc-seg-btn' + (on ? ' is-active' : ''),
              'aria-selected': String(on),
              text: m[1],
              onclick: function () {
                tSt.mode = m[0];
                S.haptic('tick');
                paintAll();
              }
            });
          })
        ),
        S.h('button', {
          type: 'button',
          id: 'bt-step5-open-sca-btn',
          class: 'bt-tc-cupping-launch-btn',
          onclick: function () {
            S.haptic('snap');
            S.navGo('sca');
          }
        }, S.iconEl('cafe-cup', { size: 17 }), S.h('span', { text: '5-Bowl Blind Cupping \u2192' }))
      ));

      /* Live-Updating Score Hero Summary Card (In-Place Update, Zero Scroll Jump!) */
      var scoreHeroHost = S.h('section', {
        class: 'bt-tc-score-hero',
        id: 'bt-step5-score-hero',
        'aria-label': 'Live Cup Score Summary'
      });

      function paintScoreHeroOnly() {
        var uni = computeUnifiedSensoryScore(tSt);
        scoreHeroHost.className = 'bt-tc-score-hero' + (uni.heroCls ? (' ' + uni.heroCls) : '');
        scoreHeroHost.textContent = '';
        scoreHeroHost.appendChild(S.h('div', { class: 'bt-tc-score-hero-top' },
          S.h('div', { class: 'bt-tc-score-dual' },
            S.h('div', null,
              S.h('span', { class: 'bt-tc-score-sca-num', id: 'bt-step5-hero-sca', text: uni.rated ? uni.score100.toFixed(1) : '--' }),
              S.h('span', { class: 'bt-tc-score-sca-unit', text: '/ 100 SCA' })
            ),
            S.h('span', { class: 'bt-tc-score-star-pill', id: 'bt-step5-hero-stars' },
              buildStarSvg(uni.rated ? 'full' : 'empty', 16),
              S.h('span', { text: uni.rated ? (uni.stars.toFixed(2) + ' / 5 Stars') : '-- / 5 Stars' })
            )
          ),
          S.h('span', {
            class: 'bt-tc-badge ' + uni.tierTone,
            id: 'bt-step5-hero-tier',
            text: uni.tierText
          })
        ));
        scoreHeroHost.appendChild(S.h('div', { class: 'bt-tc-breakdown-grid' },
          uni.breakdown.map(function (bk) {
            return S.h('div', { class: 'bt-tc-bk-pill' + (bk.isDefect ? ' is-defect' : '') },
              S.h('span', { text: bk.label }),
              S.h('b', { text: bk.val })
            );
          })
        ));
      }
      paintScoreHeroOnly();
      rateCard.appendChild(scoreHeroHost);

      var ratedStatusBadge = rateCard.querySelector('#bt-step5-rated-status-badge');
      var starDescPill = S.h('span', {
        class: 'bt-tc-star-desc-pill' + (tSt.hasUserRated ? ' is-rated' : ''),
        id: 'bt-step5-star-desc',
        text: tSt.hasUserRated
          ? (tSt.stars.toFixed(2) + ' \u00B7 ' + starTierWord(tSt.stars))
          : 'Tap a star (1\u20135) to rate'
      });

      var starButtons = [];
      function syncStarBarDom() {
        var curS = tSt.hasUserRated ? (+tSt.stars || 0) : 0;
        starButtons.forEach(function (sb, idx) {
          var starNum = idx + 1;
          var isFull = curS >= starNum - 0.12;
          var isHalf = !isFull && curS >= starNum - 0.65;
          sb.className = 'bt-tc-star-btn' + (isFull ? ' is-filled' : (isHalf ? ' is-half' : ''));
          sb.setAttribute('aria-pressed', String(curS >= starNum - 0.65));
          sb.textContent = '';
          sb.appendChild(buildStarSvg(isFull || isHalf ? 'full' : 'empty', 24));
        });
      }

      function applyStarRatingInPlace(nextStars, skipFoil) {
        tSt.stars = clamp(Math.round(+nextStars * 4) / 4, 0.25, 5.0);
        tSt.hasUserRated = true;
        if (!tSt.makeAgain) tSt.makeAgain = tSt.stars >= 4.0 ? 'yes' : (tSt.stars >= 3.0 ? 'maybe' : 'no');
        syncRatingVisuals();
        paintShortcutHighlights();
        paintFixAndCtaOnly();
        paintOutlierBadgeOnly();
      }

      function syncRatingVisuals() {
        if (ratedStatusBadge) {
          ratedStatusBadge.className = 'bt-tc-badge ' + (tSt.hasUserRated ? 'is-good' : 'is-gold');
          ratedStatusBadge.textContent = tSt.hasUserRated ? ('Rated: ' + tSt.stars.toFixed(2) + '/5') : 'Tap Stars to Rate';
        }
        starDescPill.className = 'bt-tc-star-desc-pill' + (tSt.hasUserRated ? ' is-rated' : '');
        starDescPill.textContent = tSt.hasUserRated
          ? (tSt.stars.toFixed(2) + ' \u00B7 ' + starTierWord(tSt.stars))
          : 'Tap a star (1\u20135) to rate';
        syncStarBarDom();
        paintScoreHeroOnly();
      }

      var starsGroup = S.h('div', { class: 'bt-tc-stars-group', role: 'radiogroup', 'aria-label': 'Star Rating 1 to 5' });
      [1, 2, 3, 4, 5].forEach(function (starNum) {
        var btn = S.h('button', {
          type: 'button',
          class: 'bt-tc-star-btn',
          'data-star-val': String(starNum),
          'aria-label': 'Rate ' + starNum + ' stars (tap again for half star)',
          onclick: function () {
            var cur = tSt.hasUserRated ? (+tSt.stars || 0) : 0;
            var next = Math.abs(cur - starNum) < 0.05 ? Math.max(0.5, starNum - 0.5) : starNum;
            S.haptic(next >= 4.5 ? 'celebrate' : 'snap');
            applyStarRatingInPlace(next);
          }
        });
        starButtons.push(btn);
        starsGroup.appendChild(btn);
      });
      syncStarBarDom();

      sweepWidgetRef = {
        setValue: function () { syncStarBarDom(); paintScoreHeroOnly(); }
      };

      var fineTuneGroup = S.h('div', { class: 'bt-tc-finetune-group' },
        S.h('button', {
          type: 'button',
          class: 'bt-tc-finetune-btn',
          id: 'bt-step5-star-minus-btn',
          'aria-label': 'Decrease rating by 0.25 stars',
          text: '-0.25',
          onclick: function () {
            var base = tSt.hasUserRated && +tSt.stars > 0 ? +tSt.stars : 4.0;
            S.haptic('tick');
            applyStarRatingInPlace(Math.max(0.5, base - 0.25));
          }
        }),
        S.h('button', {
          type: 'button',
          class: 'bt-tc-finetune-btn',
          id: 'bt-step5-star-plus-btn',
          'aria-label': 'Increase rating by 0.25 stars',
          text: '+0.25',
          onclick: function () {
            var base = tSt.hasUserRated && +tSt.stars > 0 ? +tSt.stars : 4.0;
            S.haptic('tick');
            applyStarRatingInPlace(Math.min(5.0, base + 0.25));
          }
        }),
        starDescPill
      );

      var makeAgainRow = S.h('div', { class: 'bt-tc-row-between', style: 'padding-top:2px' },
        S.h('span', { style: 'font-size:0.8rem;font-weight:700;color:var(--ink-secondary)', text: 'Make this recipe again?' }),
        S.h('div', { class: 'bt-tc-pill-wrap' },
          [
            ['yes',   'Yes, Love It',  4.50],
            ['maybe', 'With Next Fix', 3.75],
            ['no',    'Not For Me',    2.50]
          ].map(function (mk) {
            var on = tSt.makeAgain === mk[0];
            return S.h('button', {
              type: 'button',
              class: 'bt-tc-pill is-compact' + (on ? ' is-active' : ' is-soft'),
              'aria-pressed': String(on),
              text: mk[1],
              onclick: function () {
                tSt.makeAgain = mk[0];
                tSt.notMyStyle = mk[0] === 'no';
                var buttons = this.parentNode ? this.parentNode.querySelectorAll('button') : [];
                Array.prototype.forEach.call(buttons, function (b, bIdx) {
                  var active = bIdx === (mk[0] === 'yes' ? 0 : (mk[0] === 'maybe' ? 1 : 2));
                  b.className = 'bt-tc-pill is-compact' + (active ? ' is-active' : ' is-soft');
                  b.setAttribute('aria-pressed', String(active));
                });
                S.haptic('tick');
                applyStarRatingInPlace(+tSt.stars > 0 && tSt.hasUserRated ? tSt.stars : mk[2]);
              }
            });
          })
        )
      );

      rateCard.appendChild(S.h('div', { class: 'bt-tc-star-bar-wrap', id: 'bt-step5-star-bar' },
        S.h('div', { class: 'bt-tc-row-between' },
          S.h('b', { style: 'font-size:0.92rem', text: '1-Tap Star Rating & Fine-Tune (1.0\u20135.0)' }),
          S.h('span', { style: 'font-size:0.75rem;color:var(--ink-muted)', text: 'Tap star again for half-star' })
        ),
        S.h('div', { class: 'bt-tc-star-row' }, starsGroup, fineTuneGroup),
        makeAgainRow
      ));

      /* 2-Column Tactile "How Did It Taste?" Diagnosis Cards + 4-Ring Bullseye + R2 Dual-Pin */
      var curMethod = flowInfo.methodKey;
      var isEspNow = curMethod.indexOf('espresso') >= 0;
      var doseNow = flowInfo.doseG;
      var waterNow = flowInfo.waterG;
      var measEyNow = (+tSt.tdsPct > 0 && doseNow > 0) ? Math.round(((+tSt.tdsPct * tSt.bevOutG) / doseNow) * 100) / 100 : null;
      var r2Mode = S.btToolModeSafe('refractometer');
      var bleLive = getBleStateSafe();
      var scaleInfoNow = readBleScaleMugInfo(bleLive);
      var r2Connected = !!bleLive.refractometerConnected;
      var r2CanTrigger = !!(r2Connected || bleLive.simulatorActive);
      var r2EffectiveOn = r2Mode !== 'off' || r2Connected || scaleInfoNow.connected || !!tSt._liveR2Received || +tSt.tdsPct > 0;

      var shortcutButtons = [];
      function activeShortcutKey() {
        if (!tSt.hasUserRated) return '';
        var r = Math.hypot(tSt.padX, tSt.padY);
        if (r <= 0.20) return 'sweet';
        if (r > 0.76) return 'way_off';
        if (Math.abs(tSt.padX) >= Math.abs(tSt.padY)) return tSt.padX < 0 ? 'sour' : 'bitter';
        return tSt.padY < 0 ? 'weak' : 'strong';
      }

      function paintShortcutHighlights() {
        var ak = activeShortcutKey();
        shortcutButtons.forEach(function (item) {
          var isOn = item.key === ak;
          item.btn.className = 'bt-tc-diag-card' + (isOn ? (' is-active' + (item.key === 'sweet' ? ' is-sweet' : '')) : '');
          item.btn.setAttribute('aria-pressed', String(isOn));
        });
      }

      var shortcutRow = S.h('div', { class: 'bt-tc-diag-grid', id: 'bt-step5-diag-grid', role: 'group', 'aria-label': 'How Did It Taste quick diagnosis cards' });
      QUICK_TASTE_SHORTCUTS.forEach(function (sc) {
        var btn = S.h('button', {
          type: 'button',
          class: 'bt-tc-diag-card',
          onclick: function () {
            tSt.padX = sc.x;
            tSt.padY = sc.y;
            if (!tSt.hasUserRated || !(+tSt.stars > 0)) {
              tSt.stars = sc.defStars;
            }
            tSt.hasUserRated = true;
            if (padWidgetRef && typeof padWidgetRef.setXY === 'function') {
              padWidgetRef.setXY(tSt.padX, tSt.padY);
            }
            S.haptic(sc.key === 'sweet' ? 'celebrate' : 'snap');
            syncRatingVisuals();
            paintShortcutHighlights();
            paintFixAndCtaOnly();
            paintR2ReconcilerOnly();
            paintOutlierBadgeOnly();
          }
        },
          S.h('b', { text: sc.label }),
          S.h('span', { text: sc.hint })
        );
        shortcutButtons.push({ key: sc.key, btn: btn });
        shortcutRow.appendChild(btn);
      });
      paintShortcutHighlights();

      var padWidget = null;
      if (tac && typeof tac.BTTastePad2D === 'function') {
        try {
          padWidget = tac.BTTastePad2D({
            compactChrome: true,
            prompt: 'Tap or drag the coffee cup where your brew tasted:',
            x: tSt.padX,
            y: tSt.padY,
            grinderKey: a.brew && a.brew.grinderKey,
            isEspresso: isEspNow,
            measuredTds: (r2EffectiveOn && +tSt.tdsPct > 0) ? +tSt.tdsPct : null,
            measuredEy: (r2EffectiveOn && measEyNow != null) ? measEyNow : null,
            sampleTempC: (r2EffectiveOn && +tSt.tdsPct > 0) ? tSt.r2TempC : null,
            targetTds: isEspNow ? 9.4 : 1.38,
            targetEy: 20.2,
            onChange: function (pt) {
              if (!pt) return;
              tSt.padX = clamp(+pt.x || 0, -1, 1);
              tSt.padY = clamp(+pt.y || 0, -1, 1);
              var rIdx = ringInfoForXY(tSt.padX, tSt.padY).ring;
              var autoSt = rIdx === 0 ? 4.50 : (rIdx === 1 ? 3.75 : (rIdx === 2 ? 3.25 : 2.50));
              if (!tSt.hasUserRated || !(+tSt.stars > 0)) {
                tSt.stars = autoSt;
                if (sweepWidgetRef && typeof sweepWidgetRef.setValue === 'function') {
                  sweepWidgetRef.setValue(tSt.stars);
                }
              }
              tSt.hasUserRated = true;
              syncRatingVisuals();
              paintShortcutHighlights();
              paintFixAndCtaOnly();
              paintR2ReconcilerOnly();
              paintOutlierBadgeOnly();
            }
          });
        } catch (_) {}
      }
      if (!padWidget) {
        padWidget = S.h('div', { class: 'bt-tc-sub', text: 'Use the Quick Taste Shortcuts above to place your cup on the balance map.' });
      }
      padWidgetRef = padWidget;

      /* Clear 4-Way + Center Bullseye Cheat-Sheet (#245) */
      var bullseyeCheatSheet = S.h('div', { class: 'bt-tc-cheatsheet', 'aria-label': 'What each bullseye direction means' },
        S.h('div', { class: 'bt-tc-cheat-item' },
          S.h('b', { text: 'Sour (Left)' }),
          S.h('span', { text: 'Sharp, tangy, lemony, fast finish (under-extracted \u2192 grind finer or hotter water).' })
        ),
        S.h('div', { class: 'bt-tc-cheat-item' },
          S.h('b', { text: 'Bitter / Dry (Right)' }),
          S.h('span', { text: 'Harsh dark cocoa, ashy, or mouth-drying finish (over-extracted \u2192 grind coarser or cooler water).' })
        ),
        S.h('div', { class: 'bt-tc-cheat-item' },
          S.h('b', { text: 'Too Strong (Top)' }),
          S.h('span', { text: 'Heavy, syrupy, overwhelming (add a splash more water next brew).' })
        ),
        S.h('div', { class: 'bt-tc-cheat-item' },
          S.h('b', { text: 'Too Weak (Bottom)' }),
          S.h('span', { text: 'Watery, thin, tea-like (use slightly less water or more coffee).' })
        ),
        S.h('div', { class: 'bt-tc-cheat-item is-center' },
          S.h('b', { text: 'Center Gold Bullseye' }),
          S.h('span', { text: 'Sweet, balanced, clean finish \u2014 ready to lock as your Gold Recipe!' })
        )
      );

      var r2ReconcilerHost = S.h('div', { id: 'bt-step5-r2-reconciler' });
      function paintR2ReconcilerOnly() {
        r2ReconcilerHost.textContent = '';
        if (!r2EffectiveOn || !(+tSt.tdsPct > 0)) return;
        var mEy = (+tSt.tdsPct > 0 && doseNow > 0) ? Math.round(((+tSt.tdsPct * tSt.bevOutG) / doseNow) * 100) / 100 : null;
        var rec = evaluateR2VsPalateDiscrepancy(tSt, mEy, isEspNow);
        if (!rec) return;
        var box = S.h('div', { class: 'bt-tc-well', style: 'border:1px solid var(--science-border,var(--line))' },
          S.h('b', { style: 'font-size:0.84rem;color:var(--science)', text: rec.sovereigntyBanner })
        );
        if (rec.triggered && rec.causes.length) {
          box.appendChild(S.h('div', { class: 'bt-tc-sub', style: 'font-size:0.8rem', text: rec.topCause.label + ' (' + rec.topCause.prob + '%): ' + rec.topCause.fix }));
          rec.causes.forEach(function (c) {
            box.appendChild(S.h('div', { class: 'bt-tc-hyp-row' },
              S.h('span', { style: 'font-weight:600', text: c.label }),
              S.h('div', { class: 'bt-tc-hyp-bar' }, S.h('i', { style: 'width:' + c.prob + '%' })),
              S.h('span', { class: 'mono', style: 'text-align:right;font-weight:700', text: c.prob + '%' })
            ));
          });
        }
        r2ReconcilerHost.appendChild(box);
      }

      var r2Host = null;
      if (r2EffectiveOn) {
        var showOpenR2 = r2Mode === 'always' || (!tSt._userHidR2 && (tSt.r2Expanded || r2Connected || scaleInfoNow.connected || (+tSt.tdsPct > 0 && !tSt.r2Collapsed)));
        if (!showOpenR2) {
          var collapsedR2Label = +tSt.tdsPct > 0
            ? ('Refractometer: ' + (+tSt.tdsPct).toFixed(2) + '% TDS (Expand)')
            : (r2Connected ? 'DiFluid R2 Connected \u00B7 Auto-Sync Active (Expand)' : '+ Optional: Enter Refractometer %TDS (DiFluid R2)');
          r2Host = S.h('button', {
            type: 'button',
            class: 'bt-tc-pill is-soft',
            id: 'bt-step5-r2-expand-btn',
            style: 'align-self:flex-start',
            onclick: function () { tSt.r2Collapsed = false; tSt.r2Expanded = true; tSt._userHidR2 = false; paintAll(); }
          }, S.iconEl('refract-prism', { size: 16 }), S.h('span', { text: collapsedR2Label }));
        } else {
          var r2Ready = evaluateR2ReadinessSafe(tSt.r2TempC);
          var waterInWarn = (!isEspNow && tSt.bevOutG >= waterNow * 0.92)
            ? ('Heads-up: Beverage weight (' + tSt.bevOutG + ' g) looks like poured water (' + waterNow + ' g) rather than liquid in your mug (~' + Math.round(waterNow - doseNow * 2.05) + ' g)!')
            : '';
          var liveR2MetaParts = ['DiFluid R2 Connected \u00B7 Auto-Sync Active'];
          if (bleLive.lastTempC != null && isFinite(+bleLive.lastTempC) && +bleLive.lastTempC > 0) {
            liveR2MetaParts.push((+bleLive.lastTempC).toFixed(1) + ' \u00B0C');
          } else if (tSt.r2TempC != null && isFinite(+tSt.r2TempC) && +tSt.r2TempC > 0) {
            liveR2MetaParts.push((+tSt.r2TempC).toFixed(1) + ' \u00B0C');
          }
          if (bleLive.refractometerBatteryPct != null && isFinite(+bleLive.refractometerBatteryPct) && +bleLive.refractometerBatteryPct >= 0) {
            liveR2MetaParts.push(Math.round(+bleLive.refractometerBatteryPct) + '%');
          }

          var scaleMugBtnLabel = !scaleInfoNow.connected
            ? 'Pair Scale'
            : (scaleInfoNow.weightG > 8
              ? ('Use Scale (' + scaleInfoNow.roundedG + ' g)')
              : ('Scale Ready (' + Math.max(0, scaleInfoNow.roundedG) + ' g)'));
          var scaleMugBtn = S.h('button', {
            type: 'button',
            id: 'bt-step5-use-scale-weight-btn',
            class: 'bt-tc-pill is-compact ' + (scaleInfoNow.connected && scaleInfoNow.weightG > 8 ? 'is-copper' : 'is-soft'),
            style: 'align-self:flex-start;margin-top:2px',
            onclick: function () {
              var liveSc = readBleScaleMugInfo();
              if (liveSc.connected) {
                if (liveSc.weightG > 8) {
                  tSt.bevOutG = clamp(liveSc.roundedG, 10, 2000);
                  tSt.rescueMugG = Math.max(25, tSt.bevOutG);
                  tSt._userEditedBevOut = true;
                  if (a.brew) a.brew.measuredBeverageG = tSt.bevOutG;
                  S.haptic('snap');
                  S.toastSafe('Synced mug weight from BLE scale: ' + tSt.bevOutG + ' g');
                  paintAll();
                } else {
                  S.haptic('tick');
                  S.toastSafe('Place your brewed mug (>8 g) on the connected BLE scale, then tap Use Scale.');
                }
                return;
              }
              if (ble && typeof ble.connectScale === 'function') {
                Promise.resolve(ble.connectScale()).then(function () {
                  var afterSc = readBleScaleMugInfo();
                  if (afterSc.connected && afterSc.weightG > 8) {
                    tSt.bevOutG = clamp(afterSc.roundedG, 10, 2000);
                    tSt.rescueMugG = Math.max(25, tSt.bevOutG);
                    tSt._userEditedBevOut = true;
                    if (a.brew) a.brew.measuredBeverageG = tSt.bevOutG;
                  }
                  paintAll();
                }).catch(function () {});
              } else if (typeof window !== 'undefined' && window.BTSheet && typeof window.BTSheet.open === 'function') {
                window.BTSheet.open('ble-devices', null, { detent: 'full', title: 'Bluetooth Scales, R2, Omni & Smart Gear' });
              }
            }
          }, S.iconEl('ble-wave', { size: 13 }), S.h('span', { 'data-scale-mug-txt': '1', text: scaleMugBtnLabel }));

          r2Host = S.h('div', { class: 'bt-tc-r2-card', id: 'bt-step5-r2-card' },
            S.h('div', { class: 'bt-tc-row-between' },
              S.h('div', { class: 'bt-tc-pill-wrap', style: 'gap:6px' },
                r2Connected ? S.h('span', {
                  class: 'bt-tc-badge is-good',
                  id: 'bt-step5-r2-live-badge',
                  text: liveR2MetaParts.join(' \u00B7 ')
                }) : null,
                S.h('span', { class: 'bt-tc-badge is-sci', text: r2Ready.badgeText })
              ),
              r2Mode !== 'always' ? S.h('button', {
                type: 'button',
                class: 'bt-tc-pill is-compact is-soft',
                id: 'bt-step5-r2-hide-btn',
                text: 'Hide Meter',
                onclick: function () { tSt.r2Expanded = false; tSt.r2Collapsed = true; tSt._userHidR2 = true; paintAll(); }
              }) : null
            ),
            S.h('p', {
              class: 'bt-tc-trait-desc',
              text: r2Connected
                ? 'Press the button on your DiFluid R2 (or tap Read R2 Now) \u2014 %TDS, %EY, and your Bullseye sensor pin update automatically with zero typing.'
                : 'Optional lab refractometer: plots sensor strength (%TDS) alongside your tongue on the bullseye. Your personal taste always wins 100%.'
            }),
            S.h('div', { style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(132px,1fr));gap:8px' },
              S.h('label', { style: 'display:flex;flex-direction:column;gap:4px;font-size:0.76rem;font-weight:700' },
                S.h('span', { text: tSt.r2InputUnit === 'brix' ? 'Measured \u00B0Brix (\u00D70.85 \u2192 TDS)' : 'Measured Strength (%TDS)' }),
                S.h('div', { class: 'bt-tc-spotlight', style: 'min-height:44px' },
                  S.h('input', {
                    type: 'number',
                    id: 'bt-step5-tds-input',
                    inputmode: 'decimal',
                    step: '0.01',
                    min: '0',
                    max: '24',
                    placeholder: isEspNow ? '9.40' : '1.38',
                    value: +tSt.tdsPct > 0 ? String(tSt.r2InputUnit === 'brix' ? Math.round((tSt.tdsPct / 0.85) * 100) / 100 : tSt.tdsPct) : '',
                    onchange: function (e) {
                      var v = parseFloat(e.target.value);
                      if (isFinite(v) && v > 0) {
                        tSt.tdsPct = Math.round((tSt.r2InputUnit === 'brix' ? v * 0.85 : v) * 100) / 100;
                      } else {
                        tSt.tdsPct = 0;
                      }
                      a.taste = (a.taste && typeof a.taste === 'object') ? a.taste : {};
                      a.taste.tds_pct = tSt.tdsPct;
                      st.measuredTds = tSt.tdsPct;
                      paintAll();
                    }
                  })
                )
              ),
              S.h('div', { style: 'display:flex;flex-direction:column;gap:4px;font-size:0.76rem;font-weight:700' },
                S.h('label', { for: 'bt-step5-bev-out-input', text: 'Liquid in Mug (g)' }),
                S.h('div', { class: 'bt-tc-spotlight', style: 'min-height:44px' },
                  S.h('input', {
                    type: 'number',
                    id: 'bt-step5-bev-out-input',
                    inputmode: 'decimal',
                    step: '1',
                    min: '10',
                    max: '2000',
                    value: String(tSt.bevOutG),
                    onchange: function (e) {
                      tSt._userEditedBevOut = true;
                      tSt.bevOutG = clamp(+e.target.value || 215, 10, 2000);
                      tSt.rescueMugG = Math.max(25, tSt.bevOutG);
                      paintAll();
                    }
                  })
                ),
                scaleMugBtn
              ),
              S.h('label', { style: 'display:flex;flex-direction:column;gap:4px;font-size:0.76rem;font-weight:700' },
                S.h('span', { text: 'Drop Temp (\u00B0C)' }),
                S.h('div', { class: 'bt-tc-spotlight', style: 'min-height:44px' },
                  S.h('input', {
                    type: 'number',
                    id: 'bt-step5-r2-temp-input',
                    inputmode: 'decimal',
                    step: '0.5',
                    min: '10',
                    max: '75',
                    value: String(tSt.r2TempC),
                    onchange: function (e) {
                      tSt.r2TempC = clamp(+e.target.value || 23.5, 10, 75);
                      paintAll();
                    }
                  })
                )
              )
            ),
            waterInWarn ? S.h('div', { class: 'bt-tc-tabu-banner' },
              S.h('span', { text: waterInWarn }),
              S.h('button', {
                type: 'button',
                class: 'bt-tc-pill is-compact is-soft',
                text: 'Use ~' + Math.round(waterNow - doseNow * 2.05) + ' g',
                onclick: function () { tSt.bevOutG = Math.max(18, Math.round(waterNow - doseNow * 2.05)); paintAll(); }
              })
            ) : null,
            S.h('div', { class: 'bt-tc-row-between' },
              S.h('div', { class: 'bt-tc-pill-wrap' },
                S.h('button', {
                  type: 'button',
                  class: 'bt-tc-pill is-compact is-soft',
                  text: tSt.r2InputUnit === 'tds' ? 'Switch to \u00B0Brix' : 'Switch to %TDS',
                  onclick: function () { tSt.r2InputUnit = tSt.r2InputUnit === 'tds' ? 'brix' : 'tds'; paintAll(); }
                }),
                r2CanTrigger ? S.h('button', {
                  type: 'button',
                  id: 'bt-step5-r2-read-btn',
                  class: 'bt-tc-pill is-compact is-copper',
                  onclick: function () {
                    if (ble && typeof ble.triggerRefractometerRead === 'function') {
                      Promise.resolve(ble.triggerRefractometerRead()).catch(function () {});
                    }
                  }
                }, S.iconEl('ble-wave', { size: 14 }), S.h('span', { text: 'Read R2 Now' })) : null,
                r2CanTrigger ? S.h('button', {
                  type: 'button',
                  id: 'bt-step5-r2-avg3-btn',
                  class: 'bt-tc-pill is-compact is-soft',
                  onclick: function () {
                    if (ble && typeof ble.triggerRefractometerRead === 'function') {
                      Promise.resolve(ble.triggerRefractometerRead({ averageCount: 3 })).catch(function () {});
                    }
                  }
                }, S.h('span', { text: 'Avg x3' })) : null,
                !r2CanTrigger ? S.h('button', {
                  type: 'button',
                  id: 'bt-step5-r2-pair-btn',
                  class: 'bt-tc-pill is-compact is-soft',
                  onclick: function () {
                    if (ble && typeof ble.connectRefractometer === 'function') {
                      Promise.resolve(ble.connectRefractometer()).then(function (res) {
                        if (res && (res.refractometerConnected || res.ok) && typeof ble.triggerRefractometerRead === 'function') {
                          return ble.triggerRefractometerRead();
                        }
                      }).catch(function () {});
                    } else {
                      S.toastSafe('Pair DiFluid R2 in Lab & Tools \u2192 Bluetooth Gear');
                    }
                  }
                }, S.iconEl('ble-wave', { size: 14 }), S.h('span', { text: 'Pair DiFluid R2' })) : null
              ),
              measEyNow != null ? S.h('b', {
                class: 'mono',
                id: 'bt-step5-ey-readout',
                style: 'font-size:0.88rem;color:var(--science)',
                text: tSt.tdsPct.toFixed(2) + '% TDS \u00B7 ' + measEyNow.toFixed(1) + '% Extraction (%EY)'
              }) : null
            ),
            r2ReconcilerHost
          );
          paintR2ReconcilerOnly();
        }
      }

      rateCard.appendChild(S.h('div', { class: 'bt-tc-well', style: 'padding:12px 13px;gap:10px' },
        S.h('div', { class: 'bt-tc-row-between' },
          S.h('div', null,
            S.h('div', { class: 'bt-tc-kicker', text: '4-Ring Taste Balance Bullseye' }),
            S.h('b', { style: 'font-size:0.96rem', text: 'Where did your cup land? (Sour \u2194 Bitter \u00D7 Weak \u2194 Strong)' })
          ),
          (r2EffectiveOn && +tSt.tdsPct > 0) ? S.h('span', { class: 'bt-tc-badge is-sci', id: 'bt-step5-dual-pin-badge', text: 'Dual-Pin Active' }) : null
        ),
        shortcutRow,
        padWidget,
        bullseyeCheatSheet,
        r2Host
      ));

      /* MODE 2 EXTRA: Guided Tasting — Structured 5-Step Labeled Sensory Bars (In-Place Updates!) */
      if (tSt.mode === 'guided') {
        var guidedRows = S.h('div', { class: 'bt-tc-guided-list' });
        GUIDED_DIMS.forEach(function (dim) {
          var curInt = clamp(+tSt.guidedInt[dim.key] || 3, 1, 5);
          var curLike = tSt.guidedLike[dim.key] || 'just_right';
          var stepNames = dim.stepLabels || ['Low', 'Mild', 'Balanced', 'High', 'Max'];
          var strongValBadge = S.h('span', {
            class: 'mono',
            style: 'font-size:0.79rem;color:var(--accent);font-weight:700',
            text: curInt + ' / 5 (' + stepNames[curInt - 1] + ')'
          });

          var scaleBarBtns = [];
          var scaleBar = S.h('div', { class: 'bt-tc-scale-bar', role: 'radiogroup', 'aria-label': dim.label + ' 5-step scale' },
            [1, 2, 3, 4, 5].map(function (iv) {
              var sBtn = S.h('button', {
                type: 'button',
                class: 'bt-tc-scale-step',
                'aria-pressed': String(curInt === iv),
                onclick: function () {
                  tSt.guidedInt[dim.key] = iv;
                  scaleBarBtns.forEach(function (b, bIdx) {
                    b.setAttribute('aria-pressed', String(bIdx + 1 === iv));
                  });
                  strongValBadge.textContent = iv + ' / 5 (' + stepNames[iv - 1] + ')';
                  syncGuidedToPad(tSt);
                  markRatedWithFallbackStars(tSt, 4.0);
                  if (padWidgetRef && typeof padWidgetRef.setXY === 'function') padWidgetRef.setXY(tSt.padX, tSt.padY);
                  S.haptic('tick');
                  syncRatingVisuals();
                  paintShortcutHighlights();
                  paintFixAndCtaOnly();
                  paintOutlierBadgeOnly();
                }
              },
                S.h('b', { text: String(iv) }),
                S.h('span', { text: stepNames[iv - 1] })
              );
              scaleBarBtns.push(sBtn);
              return sBtn;
            })
          );

          var likeBarBtns = [];
          var likeOpts = [
            ['too_little', 'Too Little'],
            ['just_right', 'Just Right'],
            ['too_much',   'Too Much']
          ];
          var likeBar = S.h('div', { class: 'bt-tc-liking-row', role: 'radiogroup', 'aria-label': dim.label + ' how was it for your taste' },
            likeOpts.map(function (lk) {
              var lBtn = S.h('button', {
                type: 'button',
                class: 'bt-tc-like-btn',
                'aria-pressed': String(curLike === lk[0]),
                text: lk[1],
                onclick: function () {
                  tSt.guidedLike[dim.key] = lk[0];
                  likeBarBtns.forEach(function (b, bIdx) {
                    b.setAttribute('aria-pressed', String(likeOpts[bIdx][0] === lk[0]));
                  });
                  syncGuidedToPad(tSt);
                  var anyOff = Object.keys(tSt.guidedLike).some(function (gk) { return tSt.guidedLike[gk] !== 'just_right'; });
                  markRatedWithFallbackStars(tSt, anyOff ? 3.75 : 4.50);
                  if (padWidgetRef && typeof padWidgetRef.setXY === 'function') padWidgetRef.setXY(tSt.padX, tSt.padY);
                  S.haptic('tick');
                  syncRatingVisuals();
                  paintShortcutHighlights();
                  paintFixAndCtaOnly();
                  paintOutlierBadgeOnly();
                }
              });
              likeBarBtns.push(lBtn);
              return lBtn;
            })
          );

          guidedRows.appendChild(S.h('div', { class: 'bt-tc-guided-row' },
            S.h('div', { class: 'bt-tc-row-between' },
              S.h('b', { style: 'font-size:0.9rem', text: dim.label }),
              strongValBadge
            ),
            S.h('p', { class: 'bt-tc-trait-desc', text: dim.desc }),
            scaleBar,
            likeBar
          ));
        });

        rateCard.appendChild(S.h('div', { class: 'bt-tc-well', style: 'padding:12px 13px;gap:10px' },
          S.h('div', { class: 'bt-tc-row-between' },
            S.h('div', null,
              S.h('div', { class: 'bt-tc-kicker', text: 'Guided Tasting \u00B7 5 Structured Sensory Scales' }),
              S.h('b', { style: 'font-size:0.96rem', text: 'Tap Level (Low \u2192 Vivid) & Balance Preference' })
            ),
            S.h('span', { class: 'bt-tc-badge is-sci', text: 'Plain Kitchen Guide' })
          ),
          S.h('p', {
            class: 'bt-tc-trait-desc',
            text: 'Pick where each trait sat on the 5-step bar, then tap Too Little, Just Right, or Too Much \u2014 your Score Hero & #1 Fix update live.'
          }),
          guidedRows
        ));
      }

      /* MODE 3 EXTRA: Pro SCA Cupping — Plain-English 8-Trait Cupping Sheet (#245) */
      if (tSt.mode === 'cva') {
        var cvaScoreVal = computeScaCvaScore(tSt);
        var cvaScoreEl = S.h('span', { class: 'bt-tc-badge is-good mono', id: 'bt-step5-cva-score-badge', text: 'Cupping Score: ' + cvaScoreVal.toFixed(2) + ' / 100' });

        function syncCvaScoreInPlace() {
          var scNow = computeScaCvaScore(tSt);
          var mappedStars = clamp(Math.round((1.0 + ((scNow - 58.0) / 34.0) * 4.0) * 4) / 4, 1.0, 5.0);
          tSt.stars = mappedStars;
          tSt.hasUserRated = true;
          cvaScoreEl.textContent = 'Cupping Score: ' + scNow.toFixed(2) + ' / 100';
          syncRatingVisuals();
          paintFixAndCtaOnly();
          paintOutlierBadgeOnly();
        }

        var cvaList = S.h('div', { class: 'bt-tc-guided-list' });
        CVA_ATTRS.forEach(function (attr) {
          var isSkip = !!(attr.skippable && tSt.cvaSkipped[attr.key]);
          var dVal = tSt.cvaDesc[attr.key] != null ? tSt.cvaDesc[attr.key] : 9;
          var hVal = tSt.cvaHedonic[attr.key] != null ? tSt.cvaHedonic[attr.key] : 7;
          var strongLabelEl = S.h('span', { class: 'mono', style: 'font-weight:700;color:var(--ink)', text: 'How Strong: ' + dVal + ' / 15' });
          var likeWordLabelEl = S.h('span', { style: 'font-weight:700;color:var(--ink)', text: 'How Much You Liked It: ' + hVal + ' / 9 (' + likingWord9(hVal) + ')' });
          var hBtns = [];

          cvaList.appendChild(S.h('div', { class: 'bt-tc-cva-row' },
            S.h('div', { class: 'bt-tc-row-between' },
              S.h('b', { style: 'font-size:0.9rem', text: attr.label }),
              attr.skippable ? S.h('button', {
                type: 'button',
                class: 'bt-tc-pill is-compact is-soft',
                'aria-pressed': String(isSkip),
                text: isSkip ? 'Skipped (Auto-Averaged)' : 'Skip Smell Step',
                onclick: function () { tSt.cvaSkipped[attr.key] = !isSkip; paintAll(); }
              }) : null
            ),
            S.h('p', { class: 'bt-tc-trait-desc', text: attr.desc }),
            !isSkip && attr.key !== 'overall' ? S.h('div', { style: 'display:flex;flex-direction:column;gap:4px' },
              S.h('div', { class: 'bt-tc-scale-hint' },
                strongLabelEl,
                S.h('span', { text: '0 None \u00B7 3 Subtle \u00B7 8 Medium \u00B7 13+ Intense' })
              ),
              S.h('input', {
                type: 'range',
                class: 'bt-tc-cva-range',
                min: '0',
                max: '15',
                step: '1',
                value: String(dVal),
                'aria-label': attr.label + ' how strong 0 to 15',
                oninput: function (e) {
                  tSt.cvaDesc[attr.key] = +e.target.value;
                  strongLabelEl.textContent = 'How Strong: ' + tSt.cvaDesc[attr.key] + ' / 15';
                  if (!tSt.hasUserRated) {
                    syncCvaScoreInPlace();
                  }
                }
              })
            ) : null,
            !isSkip ? S.h('div', { style: 'display:flex;flex-direction:column;gap:5px' },
              S.h('div', { class: 'bt-tc-scale-hint' },
                likeWordLabelEl,
                S.h('span', { text: '1\u20133 Disliked \u00B7 5 Okay \u00B7 7 Good \u00B7 8 Great \u00B7 9 Extraordinary' })
              ),
              S.h('div', { class: 'bt-tc-pill-scroll', role: 'radiogroup', 'aria-label': attr.label + ' how much you liked it 1 to 9' },
                [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (v9) {
                  var hb = S.h('button', {
                    type: 'button',
                    class: 'bt-tc-pill is-compact mono' + (hVal === v9 ? ' is-active' : ''),
                    'aria-pressed': String(hVal === v9),
                    text: String(v9),
                    onclick: function () {
                      tSt.cvaHedonic[attr.key] = v9;
                      hBtns.forEach(function (b, bIdx) {
                        var on = (bIdx + 1) === v9;
                        b.className = 'bt-tc-pill is-compact mono' + (on ? ' is-active' : '');
                        b.setAttribute('aria-pressed', String(on));
                      });
                      likeWordLabelEl.textContent = 'How Much You Liked It: ' + v9 + ' / 9 (' + likingWord9(v9) + ')';
                      S.haptic('tick');
                      syncCvaScoreInPlace();
                    }
                  });
                  hBtns.push(hb);
                  return hb;
                })
              )
            ) : null
          ));
        });

        var defectBtns = [];
        var defectOpts = [
          ['', 'Clean Cup (No Off-Flavors)'],
          ['potato', 'Raw Potato Off-Note (-4)'],
          ['moldy', 'Musty / Moldy (-4)'],
          ['phenolic', 'Medicinal / Smoky Off-Note (-4)'],
          ['ferment', 'Harsh Sour Ferment (-4)']
        ];
        var retasteBtn = S.h('button', {
          type: 'button',
          class: 'bt-tc-pill is-compact' + (tSt.cvaRetasted ? ' is-active' : ' is-soft'),
          text: tSt.cvaRetasted ? 'Retasted As Cooled' : 'Mark Retasted Warm/Cool',
          onclick: function () {
            tSt.cvaRetasted = !tSt.cvaRetasted;
            this.className = 'bt-tc-pill is-compact' + (tSt.cvaRetasted ? ' is-active' : ' is-soft');
            this.textContent = tSt.cvaRetasted ? 'Retasted As Cooled' : 'Mark Retasted Warm/Cool';
          }
        });

        rateCard.appendChild(S.h('div', { class: 'bt-tc-well', style: 'padding:12px 13px;gap:10px' },
          S.h('div', { class: 'bt-tc-row-between' },
            S.h('div', null,
              S.h('div', { class: 'bt-tc-kicker', text: 'Pro 8-Trait Cupping Sheet' }),
              S.h('b', { style: 'font-size:0.98rem', text: 'Rate Both Trait Strength (0\u201315) & Personal Enjoyment (1\u20139)' }),
              lens === 'scientist' ? S.h('div', { class: 'mono', style: 'font-size:0.73rem;color:var(--science);margin-top:2px', text: 'SCA-103/104 (2024): Score = 0.65625 \u00D7 \u03A3(1..8) + 52.75 \u2212 2u \u2212 4d' }) : null
            ),
            cvaScoreEl
          ),
          S.h('div', { class: 'bt-tc-pro-legend' },
            S.h('div', null,
              S.h('b', { text: 'How Strong (0\u201315): ' }),
              S.h('span', { text: 'Objective volume knob (0 = none, 3 = subtle, 8 = medium, 13+ = intense). Higher isn\'t better or worse \u2014 delicate florals can be 5/15 strength and 9/9 enjoyment!' })
            ),
            S.h('div', null,
              S.h('b', { text: 'How Much You Liked It (1\u20139): ' }),
              S.h('span', { text: 'What builds your 100-point Cupping Score (5 = neutral, 7 = good, 8 = great, 9 = extraordinary).' })
            )
          ),
          S.h('button', {
            type: 'button',
            class: 'bt-tc-gold-lock-btn',
            onclick: function () {
              S.navGo('sca');
            }
          }, S.iconEl('academy', { size: 18 }), S.h('span', { text: 'Open Multi-Bowl Cupping Table (1\u20135 Coffees) \u2192' })),
          cvaList,
          S.h('div', { class: 'bt-tc-cva-row' },
            S.h('div', { class: 'bt-tc-row-between' },
              S.h('span', { style: 'font-size:0.8rem;font-weight:700', text: 'Off-Flavors / Defects (-4 pts/cup) & Cool Retaste' }),
              retasteBtn
            ),
            S.h('div', { class: 'bt-tc-pill-scroll' },
              defectOpts.map(function (df, dIdx) {
                var db = S.h('button', {
                  type: 'button',
                  class: 'bt-tc-pill is-compact' + (tSt.defectType === df[0] ? ' is-copper' : ' is-soft'),
                  text: df[1],
                  onclick: function () {
                    tSt.defectType = df[0];
                    tSt.cvaDefectiveCups = df[0] ? 1 : 0;
                    defectBtns.forEach(function (b, bIdx) {
                      b.className = 'bt-tc-pill is-compact' + (bIdx === dIdx ? ' is-copper' : ' is-soft');
                    });
                    S.haptic('tick');
                    syncCvaScoreInPlace();
                  }
                });
                defectBtns.push(db);
                return db;
              })
            )
          )
        ));
      }

      /* Blind-First Rose-Copper Scratch Foil 2.0 inside Card 2 */
      var rxCheckNow = computeStatefulPrescription(tSt);
      var allowBjInFoil = !(tSt.hasUserRated && rxCheckNow.inGoldZone);
      rateCard.appendChild(buildScratchFoilCard(tSt, paintAll, allowBjInFoil));
      root.appendChild(rateCard);
      if (tSt.coolingCardCollapsed) {
        root.appendChild(gsCard);
      }

      /* =====================================================================
         CARD 3: 2. Your Dial-In Verdict & Next-Brew Recipe (#bt-nextbrew-fix)
         Mounted AFTER Card 2 Ratings!
         ===================================================================== */
      root.appendChild(fixBannerMount);

      /* =====================================================================
         CARD 4: Off-Day Shield & Cup Notes (Plain-English Labels)
         ===================================================================== */
      var outlierBadgeHost = S.h('div');
      var histSame = getTrailRowsForActiveCoffee(a, curMethod);

      function paintOutlierBadgeOnly() {
        outlierBadgeHost.textContent = '';
        var outInfo = evaluateOutlierSurprise(tSt, histSame);
        outlierBadgeHost.appendChild(S.h('div', {
          class: 'bt-tc-badge ' + (tSt.excludeLearning ? 'is-warn' : (outInfo.surpriseTriggered ? 'is-gold' : 'is-sci')),
          text: outInfo.badgeText
        }));
      }
      paintOutlierBadgeOnly();

      root.appendChild(S.h('section', { class: 'bt-tc-card' },
        S.h('div', { class: 'bt-tc-row-between' },
          S.h('span', { class: 'bt-tc-kicker', text: 'Off-Day Taste Shield & Personal Notes' }),
          outlierBadgeHost
        ),
        S.h('button', {
          type: 'button',
          class: 'bt-tc-shield-btn',
          'aria-pressed': String(!!tSt.excludeLearning),
          onclick: function () {
            tSt.excludeLearning = !tSt.excludeLearning;
            S.haptic('snap');
            paintAll();
          }
        },
          S.h('span', { style: 'display:inline-flex;align-items:center;gap:8px' },
            S.iconEl('vault-shield', { size: 18 }),
            S.h('span', { text: 'Off Palate / Sick / Rushed Today (Save Notes Without Changing Recipe)' })
          ),
          S.h('b', { class: 'mono', text: tSt.excludeLearning ? 'SHIELD ON' : 'Normal' })
        ),
        S.h('p', {
          class: 'bt-tc-trait-desc',
          text: 'Ate spicy food, fighting a cold, or distracted mid-pour? Turn this on so an off day never shifts your saved recipe or taste profile.'
        }),
        S.h('textarea', {
          class: 'bt-tc-textarea',
          rows: '2',
          placeholder: 'Optional cup notes (aroma, how it changed as it cooled, food pairing)...',
          'aria-label': 'Tasting notes',
          value: tSt.notes,
          oninput: function (e) { tSt.notes = e.target.value; }
        })
      ));

      /* Sticky Thumb-Zone Primary CTA */
      root.appendChild(ctaMount);
      paintFixAndCtaOnly();

      if (opts.focusFix || a.focusFix) {
        a.focusFix = false;
        setTimeout(function () {
          var fixEl = document.getElementById('bt-nextbrew-fix');
          if (fixEl && typeof fixEl.scrollIntoView === 'function') {
            try { fixEl.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (_) {}
          }
        }, 40);
      }
    }

    _activeRepaintHook = function () {
      if (root.isConnected) {
        paintAll();
        return true;
      }
      return false;
    };

    paintAll();

    if (containerEl && containerEl.nodeType === 1) {
      containerEl.textContent = '';
      containerEl.appendChild(root);
    }
    return root;
  }

  /* Public API on window.BTTasteStep & backward-compatible BTTastingStudioV6 */
  var BTTasteStep = {
    renderStep5: renderStep5,
    getSession: function () { return ensureStep5Session(); },
    resetSession: function () { _step5Session = null; _lastLiveR2 = null; },
    setUserRating: function (stars, padXY) {
      var s = ensureStep5Session();
      s.stars = clamp(+stars || 4.25, 0.25, 5.0);
      if (Array.isArray(padXY) && padXY.length >= 2) {
        s.padX = clamp(+padXY[0] || 0, -1, 1);
        s.padY = clamp(+padXY[1] || 0, -1, 1);
      }
      s.hasUserRated = true;
      if (!s.makeAgain) s.makeAgain = s.stars >= 4.0 ? 'yes' : 'maybe';
      if (typeof _activeRepaintHook === 'function') _activeRepaintHook();
      return computeStatefulPrescription(s);
    },
    setPadXY: function (x, y, starsOpt) {
      var s = ensureStep5Session();
      s.padX = clamp(+x || 0, -1, 1);
      s.padY = clamp(+y || 0, -1, 1);
      if (starsOpt != null && isFinite(+starsOpt) && +starsOpt > 0) {
        s.stars = clamp(+starsOpt, 0.25, 5.0);
      } else if (!(+s.stars > 0)) {
        var rIdx = ringInfoForXY(s.padX, s.padY).ring;
        s.stars = rIdx === 0 ? 4.50 : (rIdx === 1 ? 3.75 : (rIdx === 2 ? 3.25 : 2.50));
      }
      s.hasUserRated = true;
      if (typeof _activeRepaintHook === 'function') _activeRepaintHook();
      return computeStatefulPrescription(s);
    },
    evaluateFlowTiming: evaluateBrewFlowTiming,
    solvePrescription: computeStatefulPrescription,
    solveInMugRescue: solveInMugRescueSafe,
    computeFlavorMatch: computeWcrFlavorMatch,
    computeScaCvaScore: computeScaCvaScore,
    computeUnifiedScore: computeUnifiedSensoryScore,
    evaluateR2Readiness: evaluateR2ReadinessSafe,
    evaluateR2VsPalateDiscrepancy: evaluateR2VsPalateDiscrepancy,
    evaluateOutlierSurprise: evaluateOutlierSurprise
  };

  if (typeof window !== 'undefined') {
    window.BTTasteStep = BTTasteStep;
    window.BTTastingStudioV6 = {
      evaluateMakeItPerfect: computeStatefulPrescription,
      evaluateR2Readiness: evaluateR2ReadinessSafe,
      evaluateR2VsPalateDiscrepancy: evaluateR2VsPalateDiscrepancy,
      evaluateOutlierSurprise: evaluateOutlierSurprise,
      ringInfoForXY: ringInfoForXY,
      nonlinMag: nonlinMag
    };
  }

  /* Register Sheets: 'post-brew-taste', 'tasting-flow' */
  S.registerSheetSafe('post-brew-taste', function (host, payload) {
    return renderStep5(host, Object.assign({ inSheet: true }, payload || {}));
  }, { title: 'Step 5 \u00B7 Taste & Perfect', detent: 'full' });

  S.registerSheetSafe('tasting-flow', function (host, payload) {
    var modeMap = payload && payload.initialTier === 'pro' ? 'cva' : 'quick';
    return renderStep5(host, Object.assign({ initialMode: modeMap, inSheet: true }, payload || {}));
  }, { title: 'Step 5 \u00B7 Taste & Perfect', detent: 'full' });

  /* Register Step 5 Routes: 'taste', 'tasting', 'perfect', 'cup', 'cupping', 'flavor', 'dial', 'fix' */
  ['taste', 'tasting', 'cup', 'cupping', 'flavor'].forEach(function (rk) {
    S.registerRouteSafe(rk, function () {
      var a = S.getApp();
      a.activeTab = 'brew';
      a.brewStep = 'taste';
      a.focusFix = false;
      if (rk === 'cupping') {
        ensureStep5Session({ initialMode: 'cva' });
      }
      S.rerenderSafe();
    });
  });

  ['perfect', 'dial', 'fix'].forEach(function (rk) {
    S.registerRouteSafe(rk, function () {
      var a = S.getApp();
      a.activeTab = 'brew';
      a.brewStep = 'taste';
      a.focusFix = true;
      S.rerenderSafe();
    });
  });
})();
