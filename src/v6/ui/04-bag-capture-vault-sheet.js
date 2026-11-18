/* ==========================================================================
   BeanTelligence v6.2 — 04-bag-capture-vault-sheet.js
   Step 1 (`1. Coffee` — Inline Coffee Capture Studio), Above-the-Fold 390x844
   Open Bags Carousel (`Brew →` + `Fresh Bag`), Hero AI-Only Bag Lookup &
   Per-Field Checkbox Review (`SCAN_PROMPT_V6`), 12 Quick Archetypes,
   Quick Card <-> Beanjamin 1-Card Guided Mode, `BTMyCoffeesVault`, and
   `Facts in Four Parts` (`screenCoffee` Deep-Dive Sheet).
   Zero Unicode Emojis · 16px Min Input Font Floor · Real `→` Arrows
   ========================================================================== */

var BTBrewCellarShared = (function () {
  var ROAST_STOPS = [
    { key: 'ultra-light', label: 'Very Light', agtron: 92, color: 'var(--roast-1, #C88A4B)', hex: '#C88A4B', cue: 'Floral tea & bright citrus · High density' },
    { key: 'light',       label: 'Light',      agtron: 80, color: 'var(--roast-2, #AD6D34)', hex: '#AD6D34', cue: 'Crisp stone fruit & honey · High clarity' },
    { key: 'medium-light',label: 'Med-Light',  agtron: 69, color: 'var(--roast-3, #8B5022)', hex: '#8B5022', cue: 'Ripe berry & milk cocoa · Versatile omni' },
    { key: 'medium',      label: 'Medium',     agtron: 58, color: 'var(--roast-4, #693917)', hex: '#693917', cue: 'Caramel, roasted almond & balanced body' },
    { key: 'medium-dark', label: 'Med-Dark',   agtron: 47, color: 'var(--roast-5, #47250F)', hex: '#47250F', cue: 'Rich bittersweet cocoa & warm spice' },
    { key: 'dark',        label: 'Dark',       agtron: 36, color: 'var(--roast-6, #2B1609)', hex: '#2B1609', cue: 'Bold espresso crema & smoky sweetness' }
  ];

  var CANON_METHODS_23 = [
    { key: 'v60',            label: 'Hario V60',         cat: 'percolation', d50: 550, ratio: 16.5, rw: 2.10 },
    { key: 'origami',        label: 'Origami Dripper',   cat: 'percolation', d50: 530, ratio: 16.0, rw: 2.08 },
    { key: 'kalita',         label: 'Kalita Wave',       cat: 'percolation', d50: 640, ratio: 16.5, rw: 2.15 },
    { key: 'orea',           label: 'Orea V3 / V4',      cat: 'percolation', d50: 580, ratio: 16.5, rw: 2.05 },
    { key: 'pulsar',         label: 'NextLevel Pulsar',  cat: 'hybrid',      d50: 620, ratio: 17.5, rw: 2.10 },
    { key: 'chemex',         label: 'Chemex',            cat: 'percolation', d50: 760, ratio: 16.5, rw: 2.25 },
    { key: 'nel',            label: 'Cloth Nel Drip',    cat: 'percolation', d50: 680, ratio: 13.5, rw: 2.20 },
    { key: 'drip',           label: 'Batch Brewer',      cat: 'percolation', d50: 700, ratio: 17.0, rw: 2.15 },
    { key: 'aiden',          label: 'Fellow Aiden',      cat: 'precision',   d50: 540, ratio: 16.5, rw: 2.10 },
    { key: 'xbloom',         label: 'xBloom Studio',     cat: 'precision',   d50: 600, ratio: 16.0, rw: 2.10 },
    { key: 'switch',         label: 'Hario Switch',      cat: 'hybrid',      d50: 640, ratio: 15.5, rw: 2.20 },
    { key: 'clever',         label: 'Clever Dripper',    cat: 'immersion',   d50: 660, ratio: 15.5, rw: 2.20 },
    { key: 'aeropress',      label: 'AeroPress',         cat: 'immersion',   d50: 500, ratio: 15.5, rw: 1.65 },
    { key: 'siphon',         label: 'Vacuum Siphon',     cat: 'immersion',   d50: 580, ratio: 15.5, rw: 2.00 },
    { key: 'press',          label: 'French Press',      cat: 'immersion',   d50: 850, ratio: 15.0, rw: 2.40 },
    { key: 'turkish',        label: 'Turkish Cezve',     cat: 'decoction',   d50: 90,  ratio: 9.5,  rw: 1.35 },
    { key: 'phin',           label: 'Vietnamese Phin',   cat: 'percolation', d50: 560, ratio: 5.0,  rw: 1.80 },
    { key: 'cold',           label: 'Cold Brew Steep',   cat: 'immersion',   d50: 980, ratio: 11.0, rw: 2.30 },
    { key: 'cold_drip',      label: 'Kyoto Cold Drip',   cat: 'percolation', d50: 680, ratio: 10.0, rw: 2.05 },
    { key: 'espresso',       label: 'Espresso',          cat: 'espresso',    d50: 235, ratio: 2.0,  rw: 1.00 },
    { key: 'lever_espresso', label: 'Manual Lever',      cat: 'espresso',    d50: 230, ratio: 2.2,  rw: 1.00 },
    { key: 'moka',           label: 'Stovetop Moka',     cat: 'espresso',    d50: 380, ratio: 7.5,  rw: 1.35 },
    { key: 'philips5500',    label: 'Philips 5500',      cat: 'superauto',   d50: 320, ratio: 3.8,  rw: 1.15 }
  ];

  var FALLBACK_FILTERS_16 = [
    { id: 'cone-bleached',       label: 'Bleached Paper Cone',   methods: ['v60', 'origami', 'switch', 'aiden'], rw: 2.10, umMult: 1.00, oilPass: 0.02 },
    { id: 'cone-fast-abaca',     label: 'Cafec Abaca / T-90',    methods: ['v60', 'origami', 'switch'],          rw: 2.05, umMult: 0.94, oilPass: 0.03 },
    { id: 'cone-sibarist',       label: 'Sibarist FAST',         methods: ['v60', 'origami', 'switch', 'orea'],  rw: 1.95, umMult: 0.86, oilPass: 0.05 },
    { id: 'cone-unbleached',     label: 'Unbleached Brown Cone', methods: ['v60', 'origami', 'switch', 'drip', 'clever'], rw: 2.15, umMult: 1.03, oilPass: 0.02 },
    { id: 'wave-bleached',       label: 'Kalita 20-Flute Wave',  methods: ['kalita', 'origami', 'orea', 'xbloom', 'aiden'], rw: 2.15, umMult: 1.00, oilPass: 0.02 },
    { id: 'orea-flat-negotiated',label: 'Negotiated Zero-Bypass',methods: ['orea'],                               rw: 2.05, umMult: 1.05, oilPass: 0.03 },
    { id: 'pulsar-tricolate-disc',label:'Pulsar / Tricolate Disc',methods:['pulsar', 'cold_drip'],               rw: 2.10, umMult: 1.00, oilPass: 0.02 },
    { id: 'chemex-bonded',       label: 'Chemex Bonded Thick',   methods: ['chemex'],                            rw: 2.25, umMult: 1.00, oilPass: 0.01 },
    { id: 'trapezoid-wedge',     label: '#2 / #4 Wedge Filter',  methods: ['clever', 'drip'],                    rw: 2.20, umMult: 1.00, oilPass: 0.02 },
    { id: 'cloth-nel-flannel',   label: 'Cotton Flannel (Nel)',  methods: ['nel', 'siphon'],                     rw: 2.20, umMult: 1.00, oilPass: 0.38 },
    { id: 'ap-paper-single',     label: 'Micro-Paper Disc (1x)', methods: ['aeropress', 'moka', 'espresso', 'lever_espresso'], rw: 1.65, umMult: 1.00, oilPass: 0.04 },
    { id: 'ap-paper-double',     label: 'Dual Paper Sandwich',   methods: ['aeropress', 'espresso', 'lever_espresso'], rw: 1.70, umMult: 0.98, oilPass: 0.015 },
    { id: 'metal-mesh-fine',     label: 'Etched SS Metal Mesh',  methods: ['aeropress', 'v60', 'kalita', 'siphon', 'cold'], rw: 1.90, umMult: 1.08, oilPass: 0.85 },
    { id: 'press-spiral-mesh',   label: 'Plunger Woven Mesh',    methods: ['press'],                             rw: 2.40, umMult: 1.00, oilPass: 0.95 },
    { id: 'espresso-precision-basket', label: 'Precision SS Basket', methods: ['espresso', 'lever_espresso', 'moka', 'phin', 'philips5500'], rw: 1.00, umMult: 1.00, oilPass: 0.45 },
    { id: 'unfiltered-sediment', label: 'Unfiltered Settlement', methods: ['turkish'],                           rw: 1.35, umMult: 1.00, oilPass: 0.95 }
  ];

  var FALLBACK_GRINDERS = [
    { key: 'comandante_c40',   label: 'Comandante C40 MK4',      cat: 'hand',     stepUm: 30, zero: 0, max: 45, unit: 'clicks' },
    { key: 'comandante_red',   label: 'Comandante C40 Red Clix', cat: 'hand',     stepUm: 15, zero: 0, max: 90, unit: 'clicks' },
    { key: '1zpresso_zp6',     label: '1Zpresso ZP6 Special',    cat: 'hand',     stepUm: 22, zero: 0, max: 90, unit: 'clicks' },
    { key: '1zpresso_kultra',  label: '1Zpresso K-Ultra',        cat: 'hand',     stepUm: 20, zero: 0, max: 100,unit: 'clicks' },
    { key: '1zpresso_jultra',  label: '1Zpresso J-Ultra',        cat: 'hand',     stepUm: 8,  zero: 0, max: 180,unit: 'clicks' },
    { key: 'kingrinder_k6',    label: 'KINGrinder K6',           cat: 'hand',     stepUm: 16, zero: 0, max: 240,unit: 'clicks' },
    { key: 'fellow_ode_gen2',  label: 'Fellow Ode Gen 2',        cat: 'flat',     stepUm: 25, zero: 1, max: 11, unit: 'dial' },
    { key: 'fellow_opus',      label: 'Fellow Opus',             cat: 'electric', stepUm: 28, zero: 1, max: 11, unit: 'dial' },
    { key: 'baratza_encore',   label: 'Baratza Encore',          cat: 'electric', stepUm: 26, zero: 1, max: 40, unit: 'steps' },
    { key: 'baratza_esp',      label: 'Baratza Encore ESP',      cat: 'electric', stepUm: 20, zero: 1, max: 40, unit: 'steps' },
    { key: 'niche_zero',       label: 'Niche Zero (63mm Conical)',cat:'electric', stepUm: 18, zero: 0, max: 50, unit: 'dial' },
    { key: 'df64_gen2',        label: 'DF64 Gen 2 (64mm Flat)',  cat: 'flat',     stepUm: 12, zero: 0, max: 90, unit: 'dial' },
    { key: 'df83v',            label: 'DF83V Variable RPM',      cat: 'flat',     stepUm: 11, zero: 0, max: 90, unit: 'dial' },
    { key: 'timemore_078',     label: 'Timemore Sculptor 078',   cat: 'flat',     stepUm: 32, zero: 1, max: 18, unit: 'dial' },
    { key: 'timemore_078s',    label: 'Timemore Sculptor 078S',  cat: 'flat',     stepUm: 18, zero: 0, max: 18, unit: 'dial' },
    { key: 'lagom_p64',        label: 'Option-O Lagom P64',      cat: 'flat',     stepUm: 14, zero: 0, max: 10, unit: 'dial' },
    { key: 'weber_eg1',        label: 'Weber Workshops EG-1',    cat: 'flat',     stepUm: 10, zero: 0, max: 100,unit: 'steps' },
    { key: 'mazzer_philos',    label: 'Mazzer Philos (I200D)',   cat: 'flat',     stepUm: 6,  zero: 0, max: 140,unit: 'clicks' },
    { key: 'zerno_z1',         label: 'Zerno Z1 (64mm Blind)',   cat: 'flat',     stepUm: 10, zero: 0, max: 120,unit: 'um-dial' },
    { key: 'mahlkonig_ek43',   label: 'Mahlkonig EK43',          cat: 'flat',     stepUm: 45, zero: 1, max: 16, unit: 'dial' },
    { key: 'xbloom_studio',    label: 'xBloom Studio 48mm',      cat: 'integrated',stepUm:12, zero: 1, max: 80, unit: 'step' },
    { key: 'philips_ceramic',  label: 'Philips 5500 Ceramic 1-12',cat:'integrated',stepUm:22, zero: 1, max: 12, unit: 'notch' }
  ];

  function shDom(tag, props) {
    var kids = Array.prototype.slice.call(arguments, 2);
    if (typeof h === 'function') {
      return h.apply(null, [tag, props].concat(kids));
    }
    var el = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (k) {
        var v = props[k];
        if (v == null || v === false) return;
        if (k === 'class' || k === 'className') el.className = String(v);
        else if (k === 'text') el.textContent = String(v);
        else if (k === 'html' || k === 'innerHTML') el.innerHTML = String(v);
        else if (k === 'value') el.value = String(v);
        else if (k === 'style' && typeof v === 'string') el.setAttribute('style', v);
        else if (k.indexOf('on') === 0 && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
        else if (v === true && (k === 'checked' || k === 'disabled' || k === 'hidden' || k === 'readOnly' || k === 'selected')) el[k] = true;
        else el.setAttribute(k, v === true ? '' : String(v));
      });
    }
    function appendKid(c) {
      if (c == null || c === false || c === true) return;
      if (Array.isArray(c)) { c.forEach(appendKid); return; }
      if (c.nodeType) el.appendChild(c);
      else el.appendChild(document.createTextNode(String(c)));
    }
    kids.forEach(appendKid);
    return el;
  }

  function safeEsc(s) {
    if (typeof escHtml === 'function') return escHtml(s);
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function stripEmojis(s) {
    var rx = new RegExp('[\\u2600-\\u27BF]|[\\uD83C-\\uDBFF][\\uDC00-\\uDFFF]|\\uFE0F', 'g');
    return String(s == null ? '' : s).replace(rx, '').replace(/\s{2,}/g, ' ').trim();
  }

  function haptic(kind) {
    try {
      var bh = (typeof window !== 'undefined' && window.BTHaptics) ? window.BTHaptics : null;
      if (bh && typeof bh[kind] === 'function') bh[kind]();
      else if (bh && typeof bh.tick === 'function') bh.tick();
    } catch (_) {}
  }

  function iconEl(name, opts) {
    try {
      var bti = (typeof BTIcons !== 'undefined' && BTIcons) ? BTIcons : (typeof window !== 'undefined' ? window.BTIcons : null);
      if (name && typeof name === 'object' && name.nodeType) return name;
      if (typeof name === 'string' && name.trim().indexOf('<svg') === 0) {
        var sp = document.createElement('span');
        sp.innerHTML = name;
        return sp.firstElementChild || sp;
      }
      if (bti && typeof bti.el === 'function') return bti.el(name || 'brew', opts);
      if (bti && typeof bti.svg === 'function') {
        var w = document.createElement('span');
        w.innerHTML = bti.svg(name || 'brew', opts);
        return w.firstElementChild || w;
      }
    } catch (_) {}
    var fb = document.createElement('span');
    fb.className = 'bt-ico';
    fb.setAttribute('aria-hidden', 'true');
    return fb;
  }

  function brewerIconEl(methodKey, opts) {
    try {
      var bti = (typeof BTIcons !== 'undefined' && BTIcons) ? BTIcons : (typeof window !== 'undefined' ? window.BTIcons : null);
      if (bti && typeof bti.forBrewer === 'function') {
        var r = bti.forBrewer(methodKey, opts);
        if (r && typeof r === 'object' && r.nodeType) return r;
        if (typeof r === 'string') return iconEl(r, opts);
      }
    } catch (_) {}
    var mk = String(methodKey || 'v60').toLowerCase();
    var map = { lever_espresso: 'lever', cold_drip: 'cold' };
    return iconEl(map[mk] || mk, opts);
  }

  function getShell() {
    return (typeof window !== 'undefined' && window.BTShell) ? window.BTShell : null;
  }

  function getApp() {
    var sh = getShell();
    if (typeof app !== 'undefined' && app) return app;
    if (sh && sh.app) return sh.app;
    if (typeof window !== 'undefined') {
      window._btFallbackApp = window._btFallbackApp || { coffee: {}, brew: {}, machine: {}, prefs: { gear: {}, toolModes: {} }, gear: {} };
      return window._btFallbackApp;
    }
    return { coffee: {}, brew: {}, prefs: { gear: {}, toolModes: {} } };
  }

  function getState() {
    var sh = getShell();
    if (typeof state !== 'undefined' && state) return state;
    if (sh && sh.state) return sh.state;
    if (typeof window !== 'undefined') {
      window._btFallbackState = window._btFallbackState || { quick: {}, words: {}, cva: {} };
      return window._btFallbackState;
    }
    return { quick: {}, words: {}, cva: {} };
  }

  function saveDraftSafe() {
    try {
      var sh = getShell();
      if (typeof scheduleDraft === 'function') scheduleDraft();
      else if (sh && typeof sh.scheduleDraft === 'function') sh.scheduleDraft();
    } catch (_) {}
  }

  function notifyChromeSafe() {
    try {
      var sh = getShell();
      if (sh && typeof sh.paintChrome === 'function') sh.paintChrome();
      if (sh && typeof sh.paintStudioAside === 'function') sh.paintStudioAside();
    } catch (_) {}
  }

  function rerenderSafe() {
    try {
      var sh = getShell();
      if (typeof render === 'function') render();
      else if (sh && typeof sh.render === 'function') sh.render();
    } catch (_) {}
  }

  function toastSafe(msg, opts) {
    try {
      var sh = getShell();
      var clean = stripEmojis(msg);
      if (typeof toast === 'function') toast(clean, opts);
      else if (sh && typeof sh.toast === 'function') sh.toast(clean, opts);
    } catch (_) {}
  }

  function navGo(routeOrTab) {
    try {
      var sh = getShell();
      if (sh && typeof sh.go === 'function') return sh.go(routeOrTab);
      if (typeof go === 'function') return go(routeOrTab);
    } catch (_) {}
  }

  var _localSheetRenderers = {};

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

  function adaptMountRenderer(buildFn) {
    return function (a, b, c) {
      var host = null;
      var payload = {};
      if (a && a.nodeType === 1) {
        host = a;
        payload = (b && typeof b === 'object' && !b.nodeType) ? b : {};
      } else if (b && b.nodeType === 1) {
        host = b;
        payload = (a && typeof a === 'object') ? a : {};
      } else if (a && typeof a === 'object' && ((a.host && a.host.nodeType === 1) || (a.container && a.container.nodeType === 1) || (a.body && a.body.nodeType === 1))) {
        host = a.host || a.container || a.body;
        payload = a.payload || a.data || a;
      } else if (a && typeof a === 'object') {
        payload = a;
      }
      var secondEl = (b && b.nodeType === 1 && host === a) ? b : null;
      var built = buildFn(payload, host, secondEl, c);
      if (host && built && built !== host && built.nodeType === 1 && built.parentNode !== host) {
        host.textContent = '';
        host.appendChild(built);
      }
      return built;
    };
  }

  function registerSheetSafe(key, buildFn, meta) {
    var wrapped = adaptMountRenderer(buildFn);
    _localSheetRenderers[key] = wrapped;
    var sh = getShell();
    if (sh && typeof sh.registerSheet === 'function') sh.registerSheet(key, wrapped, meta);
  }

  function registerTabSafe(key, buildFn) {
    var wrapped = adaptMountRenderer(buildFn);
    var sh = getShell();
    if (sh && typeof sh.registerTab === 'function') sh.registerTab(key, wrapped);
  }

  function registerRouteSafe(key, fn) {
    var sh = getShell();
    if (sh && typeof sh.registerRoute === 'function') sh.registerRoute(key, fn);
  }

  function getMethods23() {
    var core = (typeof window !== 'undefined' && window.BTCoreV6) ? window.BTCoreV6 : null;
    var src = core && core.METHODS_23 ? core.METHODS_23 : null;
    if (Array.isArray(src) && src.length >= 20) {
      return src.map(function (m) {
        return {
          key: m.key || m.id,
          label: m.label || m.name || m.key,
          cat: m.category || m.cat || 'percolation',
          d50: m.d50AnchorUm || m.d50 || 550,
          ratio: m.defaultRatio || m.ratio || 16.0,
          rw: m.rWaterBed || m.rw || 2.10,
          raw: m
        };
      });
    }
    if (src && typeof src === 'object') {
      return CANON_METHODS_23.map(function (cm) {
        var m = src[cm.key] || {};
        return {
          key: cm.key,
          label: m.label || m.name || cm.label,
          cat: m.category || m.cat || cm.cat,
          d50: m.d50AnchorUm || m.d50 || cm.d50,
          ratio: m.defaultRatio || m.ratio || cm.ratio,
          rw: m.rWaterBed || m.rw || cm.rw,
          raw: m
        };
      });
    }
    return CANON_METHODS_23.slice();
  }

  function getFilters16() {
    var core = (typeof window !== 'undefined' && window.BTCoreV6) ? window.BTCoreV6 : null;
    var src = core && core.FILTERS_16 ? core.FILTERS_16 : (typeof FILTERS_V6 !== 'undefined' ? FILTERS_V6 : null);
    if (Array.isArray(src) && src.length) {
      return src.map(function (f) {
        return {
          id: f.id || f.key,
          label: f.label || f.name || f.id,
          methods: Array.isArray(f.methods || f.compatibleMethods || f.fits) ? (f.methods || f.compatibleMethods || f.fits) : [],
          rw: f.rWaterBed != null ? f.rWaterBed : (f.rw != null ? f.rw : 2.10),
          umMult: f.umMult != null ? f.umMult : 1.0,
          oilPass: f.oilPassFrac != null ? f.oilPassFrac : (f.oilPass != null ? f.oilPass : 0.02),
          raw: f
        };
      });
    }
    return FALLBACK_FILTERS_16.slice();
  }

  function getGrinders48() {
    var core = (typeof window !== 'undefined' && window.BTCoreV6) ? window.BTCoreV6 : null;
    var src = (core && core.GRINDERS_48) || (typeof GRINDERS !== 'undefined' ? GRINDERS : null);
    if (Array.isArray(src) && src.length) {
      return src.map(function (g) {
        return {
          key: g.key || g.id || g.v,
          label: g.label || g.name || g.key,
          cat: g.burr || g.type || g.cat || 'flat',
          stepUm: g.stepUm || g.umPerStep || 20,
          zero: g.min != null ? g.min : 0,
          max: g.max != null ? g.max : 60,
          unit: g.unit || 'clicks',
          raw: g
        };
      });
    }
    if (src && typeof src === 'object') {
      return Object.keys(src).map(function (k) {
        var g = src[k] || {};
        return {
          key: k,
          label: g.label || g.name || k,
          cat: g.burr || g.type || g.cat || 'flat',
          stepUm: g.stepUm || g.umPerStep || 20,
          zero: g.min != null ? g.min : 0,
          max: g.max != null ? g.max : 60,
          unit: g.unit || 'clicks',
          raw: g
        };
      });
    }
    return FALLBACK_GRINDERS.slice();
  }

  function roastColorFor(roastOrAgtron) {
    var s = String(roastOrAgtron || '').toLowerCase().trim();
    for (var i = 0; i < ROAST_STOPS.length; i++) {
      if (ROAST_STOPS[i].key === s || ROAST_STOPS[i].label.toLowerCase() === s) return ROAST_STOPS[i].color;
    }
    var n = parseFloat(roastOrAgtron);
    if (isFinite(n)) {
      if (n >= 86) return ROAST_STOPS[0].color;
      if (n >= 74) return ROAST_STOPS[1].color;
      if (n >= 63) return ROAST_STOPS[2].color;
      if (n >= 52) return ROAST_STOPS[3].color;
      if (n >= 42) return ROAST_STOPS[4].color;
      return ROAST_STOPS[5].color;
    }
    if (s.indexOf('ultra') >= 0 || s.indexOf('very') >= 0 || s.indexOf('nordic') >= 0) return ROAST_STOPS[0].color;
    if (s.indexOf('med') >= 0 && s.indexOf('light') >= 0) return ROAST_STOPS[2].color;
    if (s.indexOf('light') >= 0) return ROAST_STOPS[1].color;
    if (s.indexOf('med') >= 0 && s.indexOf('dark') >= 0) return ROAST_STOPS[4].color;
    if (s.indexOf('dark') >= 0 || s.indexOf('french') >= 0) return ROAST_STOPS[5].color;
    return ROAST_STOPS[3].color;
  }

  function isoDaysAgo(daysBack) {
    var d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - Math.max(0, Math.round(+daysBack || 0)));
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  function daysSinceIso(isoStr) {
    if (!isoStr || !/^\d{4}-\d{2}-\d{2}/.test(String(isoStr))) return null;
    var d = new Date(String(isoStr).slice(0, 10) + 'T12:00:00');
    if (isNaN(d.getTime())) return null;
    var now = new Date();
    now.setHours(12, 0, 0, 0);
    return Math.max(0, Math.round((now.getTime() - d.getTime()) / 86400000));
  }

  function boilingPointAtM(elevM) {
    var core = (typeof window !== 'undefined' && window.BTCoreV6) ? window.BTCoreV6 : null;
    if (core && core.thermo && typeof core.thermo.boilingPointC === 'function') {
      var b = core.thermo.boilingPointC(+elevM || 0);
      if (isFinite(b)) return Math.round(b * 10) / 10;
    }
    var z = Math.max(0, Math.min(4500, +elevM || 0));
    return Math.round((100.0 - 0.00335 * z) * 10) / 10;
  }

  function getHistoryObjs() {
    try {
      var st = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : null;
      if (st && typeof st.getHistory === 'function') {
        var hObj = st.getHistory();
        if (Array.isArray(hObj)) return hObj;
        if (hObj && Array.isArray(hObj.objs)) return hObj.objs;
      }
      if (typeof history !== 'undefined' && history && Array.isArray(history.objs)) return history.objs;
    } catch (_) {}
    return [];
  }

  function getPriceList() {
    try {
      var st = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : null;
      if (st && typeof st.getPrices === 'function') {
        var p = st.getPrices();
        if (Array.isArray(p)) return p;
        if (p && Array.isArray(p.list)) return p.list;
      }
      if (typeof localStorage !== 'undefined') {
        var raw = localStorage.getItem('brew-and-cup-prices-v1');
        if (raw) {
          var parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed;
          if (parsed && Array.isArray(parsed.list)) return parsed.list;
        }
      }
    } catch (_) {}
    return [];
  }

  function savePriceList(nextList) {
    try {
      var st = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : null;
      if (st && typeof st.savePrices === 'function') {
        st.savePrices(nextList);
        return;
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('brew-and-cup-prices-v1', JSON.stringify(nextList));
      }
    } catch (_) {}
  }

  function buildUnifiedCoffeesSafe() {
    var hObjs = getHistoryObjs();
    var pList = getPriceList();
    var st = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : null;
    if (st && typeof st.buildUnifiedCoffeesIndex === 'function') {
      try {
        var idx = st.buildUnifiedCoffeesIndex(hObjs, pList);
        if (Array.isArray(idx)) return idx;
      } catch (_) {}
    }
    var map = Object.create(null);
    var byNameRoaster = Object.create(null);
    var order = [];
    function nrKey(name, roaster) {
      var n = String(name || 'unnamed').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      var r = String(roaster || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      return 'nr:' + n + '|' + r;
    }
    function normKey(name, roaster, id) {
      if (id && String(id).trim()) return 'id:' + String(id).trim().toLowerCase();
      return nrKey(name, roaster);
    }
    pList.forEach(function (bag, idxBag) {
      if (!bag || !bag.coffee) return;
      var k = normKey(bag.coffee, bag.roaster, bag.coffee_id);
      var nr = nrKey(bag.coffee, bag.roaster);
      var existing = map[k] || byNameRoaster[nr];
      if (!existing) {
        existing = {
          key: k,
          coffee_id: bag.coffee_id || ('cf_' + order.length),
          name: bag.coffee,
          roaster: bag.roaster || '',
          origin: bag.origin || '',
          process: bag.process || '',
          roast: bag.rlevel || 'medium',
          roast_date: bag.roast || bag.rdate || '',
          decaf: '',
          openBag: !bag.finished ? Object.assign({ _idx: idxBag }, bag) : null,
          lockedBrew: null,
          bestBrew: null,
          latestBrew: null,
          bestStars: 0,
          nCups: 0,
          methods: []
        };
        map[k] = existing;
        byNameRoaster[nr] = existing;
        order.push(existing);
      } else if (!bag.finished && !existing.openBag) {
        existing.openBag = Object.assign({ _idx: idxBag }, bag);
      }
    });
    hObjs.forEach(function (row) {
      if (!row || !(row.coffee_name || row.roaster)) return;
      var k = normKey(row.coffee_name, row.roaster, row.coffee_id);
      var nr = nrKey(row.coffee_name, row.roaster);
      var rec = map[k] || byNameRoaster[nr];
      if (!rec) {
        rec = {
          key: k,
          coffee_id: row.coffee_id || ('cf_' + order.length),
          name: row.coffee_name || 'Unnamed Coffee',
          roaster: row.roaster || '',
          origin: row.origin || '',
          process: row.process || '',
          roast: row.roast_level || 'medium',
          roast_date: row.roast_date || '',
          elevation_m: row.elevation_m || '',
          varietal: row.varietal || '',
          species: row.species || '',
          decaf: row.decaf || '',
          decaf_process: row.decaf_process || '',
          bag_notes: row.bag_notes || '',
          is_frozen: row.is_frozen || '',
          frozen_date: row.frozen_date || '',
          openBag: null,
          lockedBrew: null,
          bestBrew: null,
          latestBrew: null,
          bestStars: 0,
          nCups: 0,
          methods: []
        };
        map[k] = rec;
        byNameRoaster[nr] = rec;
        order.push(rec);
      } else {
        map[k] = rec;
        byNameRoaster[nr] = rec;
        if (row.coffee_id && String(rec.coffee_id || '').indexOf('cf_') === 0) rec.coffee_id = row.coffee_id;
      }
      ['origin', 'process', 'roast_date', 'elevation_m', 'varietal', 'species', 'decaf', 'decaf_process', 'bag_notes', 'is_frozen', 'frozen_date'].forEach(function (f) {
        if (!rec[f] && row[f]) rec[f] = row[f];
      });
      if (row.roast_level && (!rec.roast || rec.roast === 'medium')) rec.roast = row.roast_level;
      if (row.recipe_adaptation_json) {
        try {
          var ad = JSON.parse(row.recipe_adaptation_json);
          if (ad.bean_agtron != null) rec.bean_agtron = ad.bean_agtron;
          if (ad.ground_agtron != null) rec.ground_agtron = ad.ground_agtron;
          if (ad.roast_delta != null) rec.roast_delta = ad.roast_delta;
          if (ad.psd_d50_um != null) rec.psd_d50_um = ad.psd_d50_um;
          if (ad.roaster_guide != null) rec.roasterGuide = ad.roaster_guide;
        } catch (_) {}
      }
      rec.nCups = (rec.nCups || 0) + 1;
      var mk = (typeof resolveMethod === 'function' ? resolveMethod(row.brew_method) : '') || String(row.brew_method || '').toLowerCase();
      if (mk && rec.methods.indexOf(mk) < 0) rec.methods.push(mk);
      var stars = parseFloat(row.my_rating_stars) || (parseFloat(row.total_score) > 0 ? Math.min(5, Math.max(1, (parseFloat(row.total_score) - 65) / 7)) : 0);
      if (row.dial_locked === 'yes' || row.dial_locked === '1') rec.lockedBrew = row;
      if (!rec.bestBrew || stars >= rec.bestStars) {
        rec.bestStars = stars;
        rec.bestBrew = row;
      }
      if (!rec.latestBrew || String(row.cupping_date || row.saved_at || '') >= String(rec.latestBrew.cupping_date || rec.latestBrew.saved_at || '')) {
        rec.latestBrew = row;
      }
    });
    return order;
  }

  function openPrecisionPad(cfg) {
    var tac = (typeof window !== 'undefined' && window.BTTactile) ? window.BTTactile : null;
    if (tac && tac.BTPrecisionKeypad) {
      if (typeof tac.BTPrecisionKeypad.open === 'function') return tac.BTPrecisionKeypad.open(cfg);
      if (typeof tac.BTPrecisionKeypad === 'function') return tac.BTPrecisionKeypad(cfg);
    }
    if (typeof BTPrecisionKeypad !== 'undefined' && BTPrecisionKeypad) {
      if (typeof BTPrecisionKeypad.open === 'function') return BTPrecisionKeypad.open(cfg);
      if (typeof BTPrecisionKeypad === 'function') return BTPrecisionKeypad(cfg);
    }
    var prev = document.getElementById('bt-inline-precision-pad');
    if (prev && prev.parentNode) prev.parentNode.removeChild(prev);
    var curStr = String(cfg.value != null ? cfg.value : '');
    var freshTap = true;
    var disp = shDom('div', { class: 'bt-num', style: 'font-size:2rem;font-weight:800;text-align:center;padding:8px 0' }, curStr + (cfg.unit ? ' ' + cfg.unit : ''));
    function syncDisp() { disp.textContent = (curStr || '0') + (cfg.unit ? ' ' + cfg.unit : ''); }
    function pressKey(k) {
      haptic('tick');
      if (k === 'bk') { curStr = curStr.slice(0, -1); freshTap = false; }
      else if (k === '.') {
        if (freshTap) { curStr = '0.'; freshTap = false; }
        else if (curStr.indexOf('.') < 0) curStr += '.';
      } else {
        if (freshTap) { curStr = k; freshTap = false; }
        else if (curStr.length < 7) curStr += k;
      }
      syncDisp();
    }
    var keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', 'bk'];
    var padGrid = shDom('div', { style: 'display:grid;grid-template-columns:repeat(3,1fr);gap:8px' });
    keys.forEach(function (k) {
      padGrid.appendChild(shDom('button', {
        type: 'button',
        class: 'bt-chip-v6 bt-num',
        style: 'min-height:52px;font-size:1.15rem;font-weight:700',
        text: k === 'bk' ? 'Del' : k,
        onclick: function () { pressKey(k); }
      }));
    });
    var step = cfg.step || 1;
    var modal = shDom('div', {
      id: 'bt-inline-precision-pad',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': cfg.label || 'Precision Value',
      style: 'position:fixed;inset:0;z-index:9500;background:var(--backdrop-scrim,rgba(0,0,0,0.5));display:flex;align-items:flex-end;justify-content:center;padding:12px'
    },
      shDom('div', { class: 'bt-card-v6', style: 'width:min(420px,100%);display:flex;flex-direction:column;gap:10px' },
        shDom('div', { class: 'bt-card-hd', style: 'margin:0' },
          shDom('b', { text: cfg.label || 'Set Value' }),
          shDom('div', { style: 'display:flex;gap:6px' },
            shDom('button', { type: 'button', class: 'bt-chip-v6', text: '-' + step, onclick: function () {
              var v = (parseFloat(curStr) || 0) - step;
              if (cfg.min != null) v = Math.max(cfg.min, v);
              curStr = String(Math.round(v * 100) / 100);
              freshTap = false; syncDisp();
            } }),
            shDom('button', { type: 'button', class: 'bt-chip-v6', text: '+' + step, onclick: function () {
              var v = (parseFloat(curStr) || 0) + step;
              if (cfg.max != null) v = Math.min(cfg.max, v);
              curStr = String(Math.round(v * 100) / 100);
              freshTap = false; syncDisp();
            } })
          )
        ),
        disp,
        padGrid,
        shDom('div', { style: 'display:grid;grid-template-columns:1fr 1.4fr;gap:8px' },
          shDom('button', { type: 'button', class: 'bt-cta-btn bt-cta-ghost', text: 'Cancel', onclick: function () { if (modal.parentNode) modal.parentNode.removeChild(modal); } }),
          shDom('button', { type: 'button', class: 'bt-cta-btn', text: 'Apply →', onclick: function () {
            var num = parseFloat(curStr);
            if (isFinite(num)) {
              if (cfg.min != null) num = Math.max(cfg.min, num);
              if (cfg.max != null) num = Math.min(cfg.max, num);
              if (typeof cfg.onCommit === 'function') cfg.onCommit(num);
              else if (typeof cfg.onChange === 'function') cfg.onChange(num);
            }
            if (modal.parentNode) modal.parentNode.removeChild(modal);
          } })
        )
      )
    );
    document.body.appendChild(modal);
  }

  function makeVernierOrDrum(cfg) {
    var tac = (typeof window !== 'undefined' && window.BTTactile) ? window.BTTactile : null;
    if (tac && typeof tac.BTDrumWheel === 'function') {
      try {
        var d = tac.BTDrumWheel(cfg);
        if (d && d.nodeType === 1) return d;
      } catch (_) {}
    }
    var ck = (typeof window !== 'undefined' && window.BTChartKit) ? window.BTChartKit : null;
    if (ck && typeof ck.vernierPill === 'function') {
      try {
        var vp = ck.vernierPill(cfg);
        if (vp && vp.nodeType === 1) return vp;
      } catch (_) {}
    }
    var val = cfg.value != null ? +cfg.value : (cfg.min || 0);
    var step = cfg.step || 1;
    var btn = shDom('button', {
      type: 'button',
      class: 'bt-num-readout-btn',
      text: val + (cfg.unit ? ' ' + cfg.unit : ''),
      onclick: function () {
        openPrecisionPad({
          label: cfg.label || 'Value',
          value: val,
          min: cfg.min,
          max: cfg.max,
          step: step,
          unit: cfg.unit || '',
          onCommit: function (nv) {
            val = nv;
            btn.textContent = val + (cfg.unit ? ' ' + cfg.unit : '');
            if (typeof cfg.onChange === 'function') cfg.onChange(nv);
            if (typeof cfg.onCommit === 'function') cfg.onCommit(nv);
          }
        });
      }
    });
    return shDom('div', { style: 'display:inline-flex;align-items:center;gap:6px' },
      shDom('button', { type: 'button', class: 'bt-chip-v6', text: '-', 'aria-label': 'Decrease ' + (cfg.label || ''), onclick: function () {
        val = Math.max(cfg.min != null ? cfg.min : -Infinity, Math.round((val - step) * 100) / 100);
        btn.textContent = val + (cfg.unit ? ' ' + cfg.unit : '');
        haptic('tick');
        if (typeof cfg.onChange === 'function') cfg.onChange(val);
      } }),
      btn,
      shDom('button', { type: 'button', class: 'bt-chip-v6', text: '+', 'aria-label': 'Increase ' + (cfg.label || ''), onclick: function () {
        val = Math.min(cfg.max != null ? cfg.max : Infinity, Math.round((val + step) * 100) / 100);
        btn.textContent = val + (cfg.unit ? ' ' + cfg.unit : '');
        haptic('tick');
        if (typeof cfg.onChange === 'function') cfg.onChange(val);
      } })
    );
  }

  function epistemicBadgeEl(tier) {
    var t = String(tier || 'verified_physics').toLowerCase();
    var cls = 'bt-ep-verified';
    var txt = '[Verified Science]';
    if (t.indexOf('research') >= 0 || t.indexOf('biophysics') >= 0 || t.indexOf('empirical') >= 0) {
      cls = 'bt-ep-research'; txt = '[Active Research]';
    } else if (t.indexOf('craft') >= 0 || t.indexOf('convention') >= 0) {
      cls = 'bt-ep-craft'; txt = '[Craft Best Practice]';
    } else if (t.indexOf('myth') >= 0) {
      cls = 'bt-ep-myth'; txt = '[Myth Debunked]';
    }
    return shDom('span', { class: 'bt-ep-badge ' + cls, text: txt });
  }

  function wrapScienceLens(surfaceNode, xrayNode, meta) {
    var sh = getShell();
    if (typeof BTScienceLens !== 'undefined' && BTScienceLens && typeof BTScienceLens.wrap === 'function') {
      try {
        var w = BTScienceLens.wrap(surfaceNode, xrayNode, meta);
        if (w && w.nodeType === 1) return w;
      } catch (_) {}
    }
    if (sh && sh.BTScienceLens && typeof sh.BTScienceLens.wrap === 'function') {
      try {
        var w2 = sh.BTScienceLens.wrap(surfaceNode, xrayNode, meta);
        if (w2 && w2.nodeType === 1) return w2;
      } catch (_) {}
    }
    var xrBox = shDom('div', { class: 'bt-lens-xray bt-lens-hybrid-show' }, xrayNode);
    return shDom('div', { class: 'bt-lens-wrap', 'data-hold-peek': '1' }, surfaceNode, xrBox);
  }

  function explainerPill(cfg) {
    cfg = cfg || {};
    var open = false;
    var cardSlot = shDom('div', { style: 'width:100%' });
    var btn = shDom('button', {
      type: 'button',
      class: 'bt-how-pill',
      'aria-expanded': 'false',
      'aria-label': 'How this works: ' + (cfg.title || 'Visual Guide'),
      onclick: function (e) {
        if (e && e.stopPropagation) e.stopPropagation();
        open = !open;
        btn.setAttribute('aria-expanded', String(open));
        haptic('tick');
        cardSlot.textContent = '';
        if (open) {
          cardSlot.appendChild(shDom('div', { class: 'bt-how-card' },
            cfg.title ? shDom('b', { style: 'color:var(--science)', text: cfg.title }) : null,
            shDom('div', null, shDom('b', { text: 'What it does: ' }), shDom('span', { text: cfg.what || '' })),
            shDom('div', null, shDom('b', { text: 'How to use in 1 touch: ' }), shDom('span', { text: cfg.how || '' })),
            shDom('div', null, shDom('b', { text: 'Pro sensor tip: ' }), shDom('span', { text: cfg.tip || '' }))
          ));
        }
      }
    }, iconEl('info-circle', { size: 15 }), shDom('span', { text: '? How This Works' }));
    return { trigger: btn, drawer: cardSlot };
  }

  var VESSELS_5 = [
    { key: 'preheated_ceramic',  label: 'Preheated Ceramic Mug', t0C: 74.0, kBase: 0.00142, tip: '' },
    { key: 'room_ceramic',       label: 'Room-Temp Ceramic Mug', t0C: 67.5, kBase: 0.00175, tip: '' },
    { key: 'glass_server',       label: 'Glass Server',          t0C: 72.0, kBase: 0.00205, tip: '' },
    { key: 'espresso_demitasse', label: 'Espresso Demitasse',    t0C: 66.0, kBase: 0.00285, tip: '' },
    { key: 'travel_mug',         label: 'Insulated Travel Mug',  t0C: 76.0, kBase: 0.00042, tip: 'Take lid off! Sealed lid traps >65 °C heat & masks sweetness for 20+ min.' }
  ];

  function computeGoldenSipState(opts) {
    opts = opts || {};
    var rawKey = opts.vesselKey || opts.vessel || 'preheated_ceramic';
    if (rawKey === 'demitasse') rawKey = 'espresso_demitasse';
    if (rawKey === 'ceramic') rawKey = 'room_ceramic';
    var vObj = VESSELS_5.find(function (v) { return v.key === rawKey; }) || VESSELS_5[0];
    var bevG = Math.max(15, Math.min(1200, +opts.bevMassG || (vObj.key === 'espresso_demitasse' ? 40 : 225)));
    var tRoom = isFinite(+opts.roomTempC) ? +opts.roomTempC : 21.5;
    var elapsedS = Math.max(0, +opts.elapsedS || 0);
    var lidOff = !!opts.lidOff;

    var core = (typeof window !== 'undefined' && window.BTCoreV6) ? window.BTCoreV6 : null;
    if (core && core.thermo && typeof core.thermo.computeGoldenSipCooling === 'function') {
      try {
        var gs = core.thermo.computeGoldenSipCooling({
          vessel: vObj.key,
          bevMassG: bevG,
          elapsedS: elapsedS,
          roomTempC: tRoom,
          lidOff: lidOff
        });
        if (gs && isFinite(gs.tempC)) {
          var coreZone = gs.inGoldenSipWindow ? 'golden' : (gs.tempC > 62.5 ? 'hot' : 'clarity');
          return Object.assign({}, gs, {
            vessel: vObj,
            secsToGolden: gs.secondsToGoldenSip != null ? gs.secondsToGoldenSip : 0,
            countdownMmSs: gs.countdownMmSs || (String(Math.floor((gs.secondsToGoldenSip || 0) / 60)).padStart(2, '0') + ':' + String(Math.round((gs.secondsToGoldenSip || 0) % 60)).padStart(2, '0')),
            zone: coreZone,
            zoneLabel: gs.stageLabel || '',
            lidTip: gs.lidOffTip || vObj.tip
          });
        }
      } catch (_) {}
    }

    var massScale = Math.pow((vObj.key === 'espresso_demitasse' ? 40 : 225) / bevG, 0.38);
    var kEff = (vObj.key === 'travel_mug' && lidOff ? 0.00115 : vObj.kBase) * massScale;
    var t0 = vObj.t0C;
    var tempC = tRoom + (t0 - tRoom) * Math.exp(-kEff * elapsedS);
    tempC = Math.round(tempC * 10) / 10;
    var tempF = Math.round(tempC * 9 / 5 + 32);

    var secsTo62 = 0;
    if (tempC > 62.0 && kEff > 0) {
      secsTo62 = Math.max(0, Math.ceil(Math.log((tempC - tRoom) / (62.0 - tRoom)) / kEff));
    }
    var mmSs = String(Math.floor(secsTo62 / 60)).padStart(2, '0') + ':' + String(secsTo62 % 60).padStart(2, '0');

    var isSciLens = false;
    try {
      var shGs = getShell();
      if (shGs && shGs.BTScienceLens && typeof shGs.BTScienceLens.level === 'function') {
        isSciLens = shGs.BTScienceLens.level() === 'scientist';
      } else {
        var appGs = getApp();
        isSciLens = !!(appGs && appGs.prefs && (appGs.prefs.experienceLens === 'scientist' || appGs.prefs.level === 'expert'));
      }
    } catch (_) {}

    var zone = tempC > 65.0 ? 'hot' : (tempC >= 55.0 && tempC <= 62.5) ? 'golden' : (tempC > 62.5 ? 'hot' : 'clarity');
    var zoneLabel = tempC > 65.0
      ? (isSciLens
        ? 'Aroma Only — Too Hot (>65 °C suppresses TRPM5 sweet receptors · Sweet Sip in ' + mmSs + ')'
        : 'Aroma Only — Too Hot (>65 °C masks natural sweetness · Sweet Sip in ' + mmSs + ')')
      : tempC > 62.5
      ? 'First Warm Sips (62–65 °C · Sweet Sip Window in ' + mmSs + ')'
      : tempC >= 55.0
      ? (isSciLens
        ? 'SWEET SIP WINDOW (55–62 °C / 131–144 °F · TRPM5 Sweetness Unlocked!)'
        : 'SWEET SIP WINDOW (55–62 °C / 131–144 °F · Natural Sweetness Unlocked!)')
      : 'Clarity & Fruit Brightness Peak (42–54 °C · Clean Finish Stage)';

    return {
      vessel: vObj,
      bevMassG: bevG,
      elapsedS: Math.round(elapsedS),
      tempC: tempC,
      tempF: tempF,
      secsToGolden: secsTo62,
      secondsToGoldenSip: secsTo62,
      countdownMmSs: mmSs,
      inGoldenSipWindow: (tempC >= 55.0 && tempC <= 62.5),
      zone: zone,
      stage: zone === 'golden' ? 'golden_sip' : (zone === 'hot' ? 'too_hot' : 'clarity_acidity'),
      zoneLabel: zoneLabel,
      stageDetail: zone === 'golden'
        ? (isSciLens
          ? 'TRPM5 sweet taste receptors are wide open — perceived caramel & fruit sweetness peaks right now!'
          : 'Your sweet taste buds are wide open — natural caramel & fruit sweetness peaks right now!')
        : (tempC > 62.5
          ? (isSciLens
            ? 'Smell volatile florals first; TRPM5 sweet taste channels unlock below 62 °C.'
            : 'Enjoy the aroma first; your sweet taste buds open up below 62 °C (144 °F).')
          : 'Heat masking has faded — sparkling origin fruit brightness and clean finish shine clearest here.'),
      lidTip: vObj.tip
    };
  }

  function _svgPolar(cx, cy, r, deg) {
    var rad = (deg * Math.PI) / 180;
    return [(cx + r * Math.cos(rad)).toFixed(2), (cy + r * Math.sin(rad)).toFixed(2)];
  }
  function _svgArcPath(cx, cy, r, d0, d1) {
    var span = d1 - d0;
    if (Math.abs(span) < 0.2) return '';
    if (Math.abs(span) >= 359.8) d1 = d0 + 359.6;
    var p0 = _svgPolar(cx, cy, r, d0);
    var p1 = _svgPolar(cx, cy, r, d1);
    var large = Math.abs(d1 - d0) > 180 ? 1 : 0;
    var sweep = d1 >= d0 ? 1 : 0;
    return 'M ' + p0[0] + ' ' + p0[1] + ' A ' + r + ' ' + r + ' 0 ' + large + ' ' + sweep + ' ' + p1[0] + ' ' + p1[1];
  }

  function mountGoldenSipClock(cfg) {
    cfg = cfg || {};
    var tac = (typeof window !== 'undefined' && window.BTTactile) ? window.BTTactile : null;
    var extFn = (tac && typeof tac.BTGoldenSipClock === 'function')
      ? tac.BTGoldenSipClock
      : (typeof BTGoldenSipClock === 'function' ? BTGoldenSipClock : null);
    if (extFn) {
      try {
        var initGsCfg = Object.assign({}, cfg.initialState || {}, cfg);
        var extNode = extFn(initGsCfg);
        if (extNode && extNode.nodeType === 1) {
          return {
            el: extNode,
            update: function (nextGs) {
              if (typeof extNode.update === 'function') extNode.update(nextGs);
            }
          };
        }
      } catch (_) {}
    }

    var CX = 120, CY = 122, R_BEZEL = 104, R_ARC = 90;
    var START_DEG = -225, SPAN_DEG = 270;
    function tempToDeg(tc) {
      var u = Math.max(0, Math.min(1, (82.0 - tc) / 46.0));
      return START_DEG + u * SPAN_DEG;
    }
    function degToTemp(deg) {
      var norm = deg;
      if (norm > 135) norm -= 360;
      var u = Math.max(0, Math.min(1, (norm - START_DEG) / SPAN_DEG));
      return Math.round((82.0 - u * 46.0) * 10) / 10;
    }

    var ticksMarkup = '';
    for (var i = 0; i <= 60; i++) {
      var d = START_DEG + (i / 60) * SPAN_DEG;
      var isMaj = (i % 5 === 0);
      var pIn = _svgPolar(CX, CY, isMaj ? (R_BEZEL - 9) : (R_BEZEL - 5), d);
      var pOut = _svgPolar(CX, CY, R_BEZEL, d);
      ticksMarkup += '<line x1="' + pIn[0] + '" y1="' + pIn[1] + '" x2="' + pOut[0] + '" y2="' + pOut[1] +
        '" stroke="' + (isMaj ? 'var(--accent, #B85A28)' : 'var(--ink-muted, #8C7A6B)') +
        '" stroke-width="' + (isMaj ? '2.1' : '1.0') + '" stroke-linecap="round" opacity="' + (isMaj ? '0.92' : '0.48') + '"/>';
    }

    var arcBase = _svgArcPath(CX, CY, R_ARC, START_DEG, START_DEG + SPAN_DEG);
    var arcHot = _svgArcPath(CX, CY, R_ARC, tempToDeg(82), tempToDeg(65));
    var arcWarm = _svgArcPath(CX, CY, R_ARC, tempToDeg(65), tempToDeg(62));
    var arcGolden = _svgArcPath(CX, CY, R_ARC, tempToDeg(62), tempToDeg(55));
    var arcClarity = _svgArcPath(CX, CY, R_ARC, tempToDeg(54.5), tempToDeg(42));
    var lblGoldenPt = _svgPolar(CX, CY, R_ARC - 17, tempToDeg(58.5));

    var svgWrap = shDom('div', { style: 'position:relative;display:flex;align-items:center;justify-content:center' });
    svgWrap.innerHTML = '<svg class="bt-horology-svg" viewBox="0 0 240 236" role="slider" aria-label="Cup Cooling Timer · Sweetest at 60 C (140 F)">' +
      '<circle cx="' + CX + '" cy="' + CY + '" r="112" fill="var(--well, #F3ECE2)" stroke="var(--line, #D8C8B6)" stroke-width="1.5"/>' +
      ticksMarkup +
      '<path d="' + arcBase + '" fill="none" stroke="var(--line, #D8C8B6)" stroke-width="10" stroke-linecap="round" opacity="0.35"/>' +
      '<path d="' + arcHot + '" fill="none" stroke="#D95A38" stroke-width="9" stroke-linecap="round"/>' +
      '<path d="' + arcWarm + '" fill="none" stroke="#E59838" stroke-width="9" stroke-linecap="round"/>' +
      '<path d="' + arcGolden + '" fill="none" stroke="#2BA86E" stroke-width="13" stroke-linecap="round"/>' +
      '<path d="' + arcClarity + '" fill="none" stroke="#3FA9C4" stroke-width="9" stroke-linecap="round"/>' +
      '<text x="' + lblGoldenPt[0] + '" y="' + lblGoldenPt[1] + '" text-anchor="middle" font-size="7.5" font-weight="800" fill="#2BA86E">55-62C</text>' +
      '<text x="48" y="196" text-anchor="middle" font-size="8" font-weight="700" fill="#D95A38">82C HOT</text>' +
      '<text x="192" y="196" text-anchor="middle" font-size="8" font-weight="700" fill="#3FA9C4">38C COOL</text>' +
      '<g class="bt-gs-needle" transform="rotate(-180 ' + CX + ' ' + CY + ')">' +
        '<line x1="' + CX + '" y1="' + CY + '" x2="' + (CX + R_ARC + 4) + '" y2="' + CY + '" stroke="var(--ink, #1A1412)" stroke-width="2.6" stroke-linecap="round"/>' +
        '<circle cx="' + (CX + R_ARC) + '" cy="' + CY + '" r="5.5" fill="var(--gold, #D98B26)" stroke="#FFFDF9" stroke-width="1.8"/>' +
        '<circle cx="' + CX + '" cy="' + CY + '" r="5" fill="var(--accent, #B85A28)" stroke="#FFFDF9" stroke-width="1.6"/>' +
      '</g>' +
      '<rect x="70" y="162" width="100" height="38" rx="9" fill="var(--surface, #FFFDF9)" stroke="var(--line, #D8C8B6)" stroke-width="1.2"/>' +
      '<text class="bt-gs-svg-mmss" x="120" y="179" text-anchor="middle" font-size="14" font-weight="800" fill="var(--ink, #1A1412)">00:00</text>' +
      '<text class="bt-gs-svg-temp" x="120" y="194" text-anchor="middle" font-size="9.5" font-weight="700" fill="var(--ink-secondary, #5C493B)">60.0 °C · 140 °F</text>' +
      '</svg>';

    var svgEl = svgWrap.firstElementChild;
    var needleG = svgEl.querySelector('.bt-gs-needle');
    var mmssSvgTxt = svgEl.querySelector('.bt-gs-svg-mmss');
    var tempSvgTxt = svgEl.querySelector('.bt-gs-svg-temp');
    var stageBadge = shDom('span', { class: 'bt-ep-badge bt-ep-verified', text: 'SWEET SIP WINDOW (60 °C)' });
    var regTemp = shDom('span', { class: 'bt-num', style: 'font-size:1.05rem;font-weight:700', text: '60.0 °C / 140 °F' });
    var regStageDetail = shDom('p', { class: 'bt-subcopy', style: 'font-size:0.8rem', text: '' });

    var scrubbing = false;
    var lastLiveState = null;
    function applyVisualState(gs, isScrubPreview) {
      if (!gs) return;
      if (!isScrubPreview) lastLiveState = gs;
      var tc = isFinite(+gs.tempC) ? +gs.tempC : 62.0;
      var tf = gs.tempF != null ? gs.tempF : Math.round(tc * 9 / 5 + 32);
      var deg = tempToDeg(tc);
      if (needleG) needleG.setAttribute('transform', 'rotate(' + deg.toFixed(1) + ' ' + CX + ' ' + CY + ')');
      if (mmssSvgTxt) mmssSvgTxt.textContent = isScrubPreview ? 'PREVIEW' : (gs.secsToGolden > 0 ? (gs.countdownMmSs || '01:00') : 'READY');
      if (tempSvgTxt) tempSvgTxt.textContent = tc.toFixed(1) + ' °C · ' + tf + ' °F';
      regTemp.textContent = tc.toFixed(1) + ' °C (' + tf + ' °F)';
      stageBadge.textContent = isScrubPreview ? ('Preview @ ' + tc.toFixed(1) + ' °C') : (tc > 62.5 ? 'Cooling Toward 60 °C' : tc >= 55 ? 'SWEET SIP READY (55–62 °C)' : 'Clarity Peak');
      regStageDetail.textContent = gs.zoneLabel || '';
    }
    svgEl.addEventListener('pointerdown', function (ev) {
      scrubbing = true;
      try { svgEl.setPointerCapture(ev.pointerId); } catch (_) {}
      var rect = svgEl.getBoundingClientRect();
      if (!rect.width) return;
      var ang = Math.atan2(((ev.clientY - rect.top) / rect.height) * 236 - CY, ((ev.clientX - rect.left) / rect.width) * 240 - CX) * 180 / Math.PI;
      var pTemp = degToTemp(ang);
      applyVisualState({ tempC: pTemp, tempF: Math.round(pTemp * 9 / 5 + 32), secsToGolden: 0, zoneLabel: 'Previewing ' + pTemp.toFixed(1) + ' °C' }, true);
    });
    svgEl.addEventListener('pointerup', function () { scrubbing = false; if (lastLiveState) applyVisualState(lastLiveState, false); });
    svgEl.addEventListener('pointercancel', function () { scrubbing = false; if (lastLiveState) applyVisualState(lastLiveState, false); });

    var layout = shDom('div', { class: 'bt-horology-layout' },
      svgWrap,
      shDom('div', { class: 'bt-chrono-registers' }, stageBadge, regTemp, regStageDetail,
        shDom('span', { class: 'bt-subcopy', style: 'font-size:0.72rem;opacity:0.8', text: 'Drag around the copper bezel anytime to preview flavor stages from 82 °C → 38 °C.' })
      )
    );
    if (cfg.initialState) applyVisualState(cfg.initialState, false);
    return { el: layout, update: function (nextGs) { if (!scrubbing) applyVisualState(nextGs, false); } };
  }

  function cleanChronoPhaseLabel(raw) {
    return String(raw || 'Brew Phase')
      .replace(/degassing bloom/i, 'Wet Grounds (Bloom)')
      .replace(/sweet(?:ness)?\s*pulse\s*\d*/i, 'Main Pour')
      .replace(/(?:final\s*)?balance\s*pulse/i, 'Final Pour');
  }

  function mountChronoCockpit(cfg) {
    cfg = cfg || {};
    var tac = (typeof window !== 'undefined' && window.BTTactile) ? window.BTTactile : null;
    var extFn = (tac && typeof tac.BTChronoDial === 'function')
      ? tac.BTChronoDial
      : (typeof BTChronoDial === 'function' ? BTChronoDial : null);
    var totalSecs = Math.max(15, +cfg.totalSecs || +cfg.totalTargetS || 165);
    var targetWaterG = Math.max(15, +cfg.targetWaterG || 250);
    var rawSteps = Array.isArray(cfg.steps) ? cfg.steps : [];
    var isEsp = !!cfg.isEspresso;
    var cleanPhases = rawSteps.map(function (s, idx) {
      var s0 = s && s.t != null ? +s.t : (idx / Math.max(1, rawSteps.length)) * totalSecs;
      var sNext = (idx + 1 < rawSteps.length && rawSteps[idx + 1] && rawSteps[idx + 1].t != null) ? +rawSteps[idx + 1].t : totalSecs;
      return { label: cleanChronoPhaseLabel(s && (s.label || s.title)), startS: Math.max(0, s0), endS: Math.max(s0 + 1, sNext), waterG: s && s.targetG != null ? +s.targetG : null };
    });

    var dialNode = null;
    var dialUpdater = null;
    if (extFn) {
      try {
        var initM = cfg.initialMetrics || {};
        dialNode = extFn({
          skin: 'cockpit', mode: 'brew', isEspresso: isEsp,
          elapsedS: +initM.elapsedS || 0, totalTargetS: totalSecs, targetWaterG: targetWaterG,
          phases: cleanPhases,
          waves: { thetaA: +initM.thetaA || 0, thetaS: +initM.thetaS || 0, thetaB: +initM.thetaB || 0 }
        });
        if (dialNode && dialNode.nodeType === 1 && typeof dialNode.update === 'function') {
          dialUpdater = function (m) {
            dialNode.update({
              elapsedS: +m.elapsedS || 0, totalTargetS: totalSecs,
              liveWeightG: m.scaleActive ? (+m.weightG || 0) : null,
              ghostWeightG: m.ghostWeightG != null ? +m.ghostWeightG : null,
              targetWaterG: targetWaterG, flowGs: +m.flowGs || 0, pressureBar: +m.pressureBar || 0,
              phaseLabel: m.phaseLabel ? cleanChronoPhaseLabel(m.phaseLabel) : '',
              waves: { thetaA: +m.thetaA || 0, thetaS: +m.thetaS || 0, thetaB: +m.thetaB || 0 }
            });
          };
        }
      } catch (_) { dialNode = null; }
    }
    if (!dialNode) {
      dialNode = shDom('div', { class: 'bt-num', text: '00:00.0' });
    }
    return {
      el: shDom('div', { class: 'bt-chrono-cockpit-stage' }, dialNode),
      update: function (m) { if (dialUpdater) dialUpdater(m || {}); }
    };
  }

  return {
    ROAST_STOPS: ROAST_STOPS,
    CANON_METHODS_23: CANON_METHODS_23,
    VESSELS_5: VESSELS_5,
    h: shDom,
    esc: safeEsc,
    stripEmojis: stripEmojis,
    haptic: haptic,
    iconEl: iconEl,
    brewerIconEl: brewerIconEl,
    getShell: getShell,
    getApp: getApp,
    getState: getState,
    saveDraftSafe: saveDraftSafe,
    notifyChromeSafe: notifyChromeSafe,
    rerenderSafe: rerenderSafe,
    toastSafe: toastSafe,
    navGo: navGo,
    openSheetSafe: openSheetSafe,
    closeSheetSafe: closeSheetSafe,
    registerSheetSafe: registerSheetSafe,
    registerTabSafe: registerTabSafe,
    registerRouteSafe: registerRouteSafe,
    getMethods23: getMethods23,
    getFilters16: getFilters16,
    getGrinders48: getGrinders48,
    roastColorFor: roastColorFor,
    isoDaysAgo: isoDaysAgo,
    daysSinceIso: daysSinceIso,
    boilingPointAtM: boilingPointAtM,
    getHistoryObjs: getHistoryObjs,
    getPriceList: getPriceList,
    savePriceList: savePriceList,
    buildUnifiedCoffeesSafe: buildUnifiedCoffeesSafe,
    openPrecisionPad: openPrecisionPad,
    makeVernierOrDrum: makeVernierOrDrum,
    epistemicBadgeEl: epistemicBadgeEl,
    wrapScienceLens: wrapScienceLens,
    explainerPill: explainerPill,
    computeGoldenSipState: computeGoldenSipState,
    mountGoldenSipClock: mountGoldenSipClock,
    mountChronoCockpit: mountChronoCockpit,
    mountLivingPrismCockpit: mountChronoCockpit,
    mountChronoDial: mountChronoCockpit
  };
})();

if (typeof window !== 'undefined') {
  window.BTBrewCellarShared = BTBrewCellarShared;
}

/* ==========================================================================
   PART 2: COFFEE ENTRY ENGINE, `SCAN_PROMPT_V6`, FUZZY `didYouMean`,
   12 QUICK ARCHETYPES, STEP 1 STUDIO, `BTMyCoffeesVault` & `Facts in 4 Parts`
   ========================================================================== */
(function () {
  var S = BTBrewCellarShared;

  /* -------------------- 1. 12 Quick Specialty Archetypes -------------------- */
  var QUICK_ARCHETYPES_12 = [
    {
      id: 'eth-washed',
      title: 'Bright Ethiopian Washed',
      sub: 'Yirgacheffe · Light · Washed · 2,000m',
      roastColor: '#AD6D34',
      data: { name: 'Ethiopian Washed Landrace', origin: 'Yirgacheffe, Ethiopia', region: 'Yirgacheffe', roast: 'light', process: 'washed', elevation_m: 2000, elevText: '2000 masl', density: 'high', varietal: '74110, Ethiopian Heirloom', species: 'arabica', decaf: '', decaf_process: '', bean_agtron: 78, ground_agtron: 86, bag_notes: 'Jasmine, Bergamot, White Peach, Lemon Tea' }
    },
    {
      id: 'fruity-nat',
      title: 'Fruity Natural',
      sub: 'Guji · Light · Natural · 2,100m',
      roastColor: '#AD6D34',
      data: { name: 'Ethiopian Sun-Dried Natural', origin: 'Guji, Ethiopia', region: 'Guji', roast: 'light', process: 'natural', elevation_m: 2100, elevText: '2100 masl', density: 'high', varietal: 'Ethiopian Heirloom', species: 'arabica', decaf: '', decaf_process: '', bean_agtron: 75, ground_agtron: 83, bag_notes: 'Blueberry, Strawberry, Milk Chocolate' }
    },
    {
      id: 'col-pb',
      title: 'Sweet Colombia Pink Bourbon',
      sub: 'Huila · Light · Washed · 1,850m',
      roastColor: '#AD6D34',
      data: { name: 'Huila Pink Bourbon', origin: 'Huila, Colombia', region: 'Huila', roast: 'light', process: 'washed', elevation_m: 1850, elevText: '1850 masl', density: 'high', varietal: 'Pink Bourbon', species: 'arabica', decaf: '', decaf_process: '', bean_agtron: 76, ground_agtron: 84, bag_notes: 'Sweet Orange, Honeysuckle, White Peach, Cane Sugar' }
    },
    {
      id: 'floral-gesha',
      title: 'Floral Gesha',
      sub: 'Boquete · Very Light · Washed · 1,750m',
      roastColor: '#C88A4B',
      data: { name: 'Panama Boquete Gesha', origin: 'Boquete, Panama', region: 'Boquete', roast: 'ultra-light', process: 'washed', elevation_m: 1750, elevText: '1750 masl', density: 'high', varietal: 'Gesha', species: 'arabica', decaf: '', decaf_process: '', bean_agtron: 88, ground_agtron: 95, bag_notes: 'Jasmine, Bergamot, White Peach, Honey' }
    },
    {
      id: 'classic-med',
      title: 'Balanced Classic Medium',
      sub: 'Guatemala · Medium · Washed · 1,650m',
      roastColor: '#693917',
      data: { name: 'Antigua Classic Balanced', origin: 'Antigua, Guatemala', region: 'Antigua', roast: 'medium', process: 'washed', elevation_m: 1650, elevText: '1650 masl', density: 'high', varietal: 'Bourbon, Caturra', species: 'arabica', decaf: '', decaf_process: '', bean_agtron: 57, ground_agtron: 63, bag_notes: 'Caramel, Milk Chocolate, Roasted Almond, Sweet Orange' }
    },
    {
      id: 'choc-esp',
      title: 'Rich Chocolate Espresso',
      sub: 'Brazil Cerrado · Med-Dark · Natural',
      roastColor: '#47250F',
      data: { name: 'Cerrado Espresso Reserve', origin: 'Cerrado, Brazil', region: 'Cerrado', roast: 'medium-dark', process: 'natural', elevation_m: 1150, elevText: '1150 masl', density: 'low', varietal: 'Yellow Bourbon, Catuai', species: 'arabica', decaf: '', decaf_process: '', bean_agtron: 46, ground_agtron: 51, bag_notes: 'Dark Cocoa, Roasted Almond, Brown Sugar, Caramel' }
    },
    {
      id: 'honey-proc',
      title: 'Honey Process',
      sub: 'Costa Rica Tarrazu · Med-Light · Red Honey',
      roastColor: '#8B5022',
      data: { name: 'Tarrazu Red Honey', origin: 'Tarrazu, Costa Rica', region: 'Tarrazu', roast: 'medium-light', process: 'red-honey', process_sub: 'red-honey', elevation_m: 1700, elevText: '1700 masl', density: 'high', varietal: 'Caturra, Catuai', species: 'arabica', decaf: '', decaf_process: '', bean_agtron: 68, ground_agtron: 75, bag_notes: 'Honey, White Peach, Sweet Orange, Roasted Almond' }
    },
    {
      id: 'funky-anaer',
      title: 'Funky Anaerobic',
      sub: 'Colombia Cauca · Light · Anaerobic · 1,850m',
      roastColor: '#AD6D34',
      data: { name: 'Cauca Anaerobic Ferment', origin: 'Cauca, Colombia', region: 'Cauca', roast: 'light', process: 'anaerobic', elevation_m: 1850, elevText: '1850 masl', density: 'high', varietal: 'Castillo, Caturra', species: 'arabica', decaf: '', decaf_process: '', bean_agtron: 74, ground_agtron: 82, bag_notes: 'Tropical Fruit, Strawberry, Spiced Wine' }
    },
    {
      id: 'swiss-decaf',
      title: 'Clean Swiss Water Decaf',
      sub: 'Colombia · Medium · Swiss Water Decaf',
      roastColor: '#693917',
      data: { name: 'Huila Swiss Water Decaf', origin: 'Huila, Colombia', region: 'Huila', roast: 'medium', process: 'washed', elevation_m: 1700, elevText: '1700 masl', density: 'high', varietal: 'Caturra, Castillo', species: 'arabica', decaf: 'yes', decaf_process: 'swiss', bean_agtron: 56, ground_agtron: 62, bag_notes: 'Milk Chocolate, Caramel, Sweet Orange' }
    },
    {
      id: 'half-caf',
      title: 'Half-Caf',
      sub: '50/50 Colombia & Ethiopia · Med-Light',
      roastColor: '#8B5022',
      data: { name: '50/50 Half-Caf Blend', origin: 'Colombia, Ethiopia', blend: 'blend', roast: 'medium-light', process: 'washed', elevation_m: 1800, elevText: '1800 masl', density: 'high', varietal: 'Caturra, Ethiopian Heirloom', species: 'arabica', decaf: 'half-caf', decaf_process: 'half-caf', bean_agtron: 66, ground_agtron: 73, bag_notes: 'Caramel, Sweet Orange, Milk Chocolate, Honey' }
    },
    {
      id: 'dark-trad',
      title: 'Dark Traditional',
      sub: 'Sumatra Gayo · Dark · Wet-Hulled',
      roastColor: '#2B1609',
      data: { name: 'Sumatra Gayo Dark Roast', origin: 'Aceh Gayo, Indonesia', region: 'Sumatra Gayo', roast: 'dark', process: 'wet-hulled', elevation_m: 1350, elevText: '1350 masl', density: 'mid', varietal: 'Typica, Catimor', species: 'arabica', decaf: '', decaf_process: '', bean_agtron: 36, ground_agtron: 40, bag_notes: 'Dark Cocoa, Sweet Spice, Brown Sugar' }
    },
    {
      id: 'supermarket-rescue',
      title: 'Supermarket Rescue',
      sub: 'Store Shelf Bag · Med-Dark · No Roast Date',
      roastColor: '#47250F',
      data: { name: 'Supermarket Everyday Bag', origin: 'Latin America Blend', blend: 'blend', roast: 'medium-dark', process: 'washed', elevation_m: 1200, elevText: '1200 masl', density: 'mid', varietal: 'Bourbon, Caturra', species: 'arabica', decaf: '', decaf_process: '', roast_date: '', dateUnsure: 'yes', bean_agtron: 48, ground_agtron: 53, bag_notes: 'Roasted Almond, Dark Cocoa, Caramel' }
    }
  ];

  var POPULAR_ORIGINS_12 = [
    'Ethiopia', 'Colombia', 'Kenya', 'Panama', 'Costa Rica', 'Guatemala',
    'Brazil', 'Rwanda', 'Honduras', 'Peru', 'Indonesia', 'Yemen'
  ];

  var FALLBACK_ORIGINS_52 = [
    'Colombia', 'Ethiopia', 'Kenya', 'Brazil', 'Guatemala', 'Costa Rica', 'Panama', 'Indonesia',
    'Rwanda', 'Burundi', 'Honduras', 'El Salvador', 'Nicaragua', 'Peru', 'Mexico', 'Yemen',
    'Ecuador', 'Bolivia', 'Papua New Guinea', 'India', 'Vietnam', 'China', 'Uganda', 'Tanzania',
    'DR Congo', 'Malawi', 'Zambia', 'Cameroon', 'Ivory Coast', 'Madagascar', 'Hawaii', 'Jamaica',
    'Puerto Rico', 'Dominican Republic', 'Cuba', 'Haiti', 'Venezuela', 'Thailand', 'Myanmar', 'Laos',
    'Philippines', 'Timor-Leste', 'Taiwan', 'Nepal', 'Australia', 'Galapagos', 'La Reunion', 'St Helena',
    'Zimbabwe', 'Angola', 'Togo', 'Sri Lanka'
  ];

  var SUBREGIONS_BY_COUNTRY = {
    'Ethiopia': ['Yirgacheffe', 'Guji', 'Sidama', 'Gedeb', 'Worka', 'Limu', 'Harrar'],
    'Colombia': ['Huila', 'Cauca', 'Narino', 'Tolima', 'Antioquia', 'Quindio'],
    'Kenya': ['Nyeri', 'Kirinyaga', 'Kiambu', 'Muranga', 'Embu'],
    'Panama': ['Boquete', 'Volcan', 'Renacimiento'],
    'Costa Rica': ['Tarrazu', 'West Valley', 'Central Valley', 'Tres Rios', 'Brunca'],
    'Guatemala': ['Antigua', 'Huehuetenango', 'Acatenango', 'Atitlan', 'Coban'],
    'Brazil': ['Cerrado', 'Sul de Minas', 'Mogiana', 'Mantiqueira'],
    'Rwanda': ['Nyamasheke', 'Huye', 'Gakenke', 'Karongi'],
    'Burundi': ['Kayanza', 'Ngozi', 'Muyinga'],
    'Honduras': ['Santa Barbara', 'Copan', 'Marcala', 'Ocotepeque'],
    'El Salvador': ['Santa Ana', 'Apaneca', 'Chalatenango'],
    'Peru': ['Cajamarca', 'Cusco', 'Amazonas', 'Puno'],
    'Indonesia': ['Sumatra Gayo', 'Java', 'Sulawesi Toraja', 'Bali Kintamani', 'Flores'],
    'Yemen': ['Haraz', 'Bani Matar', 'Hayma'],
    'Mexico': ['Chiapas', 'Oaxaca', 'Veracruz'],
    'China': ['Yunnan Pu\'er', 'Baoshan', 'Mengsian'],
    'Hawaii': ['Kona', 'Ka\'u', 'Maui']
  };

  var POPULAR_VARIETALS_12 = [
    'Ethiopian Heirloom', 'Pink Bourbon', 'Gesha', 'Bourbon', 'Caturra', 'SL28',
    'SL34', 'Castillo', 'Catuai', 'Pacamara', 'Sidra', 'Chiroso'
  ];

  var FALLBACK_VARIETALS_72 = [
    'Ethiopian Heirloom', 'Gesha', 'Pink Bourbon', 'Bourbon', 'Red Bourbon', 'Yellow Bourbon', 'Orange Bourbon',
    'Typica', 'Typica Mejorado', 'Caturra', 'Catuai', 'Red Catuai', 'Yellow Catuai', 'SL28', 'SL34', 'SL14',
    'Castillo', 'Colombia', 'Cenicafe 1', 'Pacamara', 'Maragogipe', 'Maracaturra', 'Sidra', 'Chiroso', 'Wush Wush',
    'Sudan Rume', 'Yemenia', '74110', '74112', '74158', '74114', 'Kurume', 'Dega', 'Wolisho', 'Villa Sarchi',
    'Mundo Novo', 'Pacas', 'Pache', 'Tabi', 'Parainema', 'Centroamericano (H1)', 'Starmaya', 'Milenio', 'Casiopea',
    'Marsellesa', 'Obata', 'Catucai', 'Icatu', 'Anacafe 14', 'Tekisic', 'Java', 'Mokka', 'Laurina', 'Aramosa',
    'Blue Mountain', 'Kona Typica', 'Mibirizi', 'Jackson', 'Arusha', 'Kent', 'S795', 'SL9', 'Ruiru 11', 'Batian',
    'K7', 'Catimor', 'Sarchimor', 'IHCAFE 90', 'Lempira', 'Komasti', 'Ateng', 'Fine Robusta', 'Eugenioides'
  ];

  var WCR_FLAVOR_CHIPS = [
    'Jasmine', 'Bergamot', 'White Peach', 'Blueberry', 'Strawberry', 'Blackcurrant',
    'Sweet Orange', 'Tropical Fruit', 'Honey', 'Caramel', 'Brown Sugar',
    'Milk Chocolate', 'Dark Cocoa', 'Roasted Almond', 'Sweet Spice'
  ];

  var ROASTER_WORD_ALIASES = [
    { lbl: 'Nordic / Cinnamon → Very Light', roast: 'ultra-light' },
    { lbl: 'Filter / City- → Light', roast: 'light' },
    { lbl: 'Omni / City → Med-Light', roast: 'medium-light' },
    { lbl: 'City+ / Balanced → Medium', roast: 'medium' },
    { lbl: 'Full City / Espresso → Med-Dark', roast: 'medium-dark' },
    { lbl: 'Vienna / French → Dark', roast: 'dark' }
  ];

  /* -------------------- 2. `SCAN_PROMPT_V6` & `parseScanReplyV6` -------------------- */
  var SCAN_PROMPT_V6_BODY =
    'You are extracting verifiable specialty coffee specifications for BeanTelligence v6.\n' +
    'Step 1 (Bag Photo First): If photo(s) are attached, read every printed word on the bag verbatim. Never guess.\n' +
    'Step 2 (Official Web Lookup for Missing Lot Specs): Search the official roaster product page (and published importer/farm spec sheet if linked) ONLY for this exact coffee from this exact roaster. If a field is not verified on the bag or official listing, set it to null and add its key name to "unclear".\n' +
    'CRITICAL RULE ON ROAST DATE: Fill "roast_date" ("YYYY-MM-DD") STRICTLY if printed on an attached bag photo. NEVER invent or infer "roast_date" from the web.\n' +
    'Reply with ONLY one valid JSON object matching this exact schema (use null when unknown):\n' +
    '{\n' +
    '  "coffee_name": string|null,\n' +
    '  "roaster": string|null,\n' +
    '  "roaster_location": string|null,\n' +
    '  "is_blend": boolean|null,\n' +
    '  "blend_components": [{"origin_country": string, "varietal": string|null, "process": string|null, "pct": number|null}]|null,\n' +
    '  "species": "arabica"|"robusta"|"liberica"|"excelsa"|"eugenioides"|"stenophylla"|"blend"|null,\n' +
    '  "varietals": string[],\n' +
    '  "origin_country": string|null,\n' +
    '  "origin_region": string|null,\n' +
    '  "farm_or_station": string|null,\n' +
    '  "producer": string|null,\n' +
    '  "elevation_masl": number|null,\n' +
    '  "harvest_year": string|null,\n' +
    '  "estimated_density": "very-high"|"high"|"medium"|"low"|null,\n' +
    '  "process_category": "washed"|"natural"|"white-honey"|"yellow-honey"|"red-honey"|"black-honey"|"wet-hulled"|"anaerobic"|"carbonic-maceration"|"thermal-shock"|"yeast-koji"|"co-ferment"|"blend"|"unknown"|null,\n' +
    '  "process_details": string|null,\n' +
    '  "decaf": boolean|"half-caf"|null,\n' +
    '  "decaf_process": "ea"|"swiss"|"mountain"|"co2"|"mc"|"unknown"|null,\n' +
    '  "roast_level": "ultra-light"|"light"|"medium-light"|"medium"|"medium-dark"|"dark"|null,\n' +
    '  "roaster_roast_label": string|null,\n' +
    '  "agtron_gourmet": number|null,\n' +
    '  "recommended_rest_days": number|null,\n' +
    '  "roast_date": "YYYY-MM-DD"|null,\n' +
    '  "tasting_notes": string[],\n' +
    '  "cup_profile": {"acidity": string|null, "sweetness": string|null, "body": string|null}|null,\n' +
    '  "roaster_brew_guide": {"method": string|null, "dose_g": number|null, "water_g": number|null, "ratio": number|null, "temp_c": number|null, "temp_f": number|null, "time_sec": number|null, "grind_note": string|null, "notes": string|null}|null,\n' +
    '  "bag_weight_g": number|null,\n' +
    '  "price": number|null,\n' +
    '  "currency": string|null,\n' +
    '  "from_bag_photo": string[],\n' +
    '  "from_official_web": string[],\n' +
    '  "source_urls": string[],\n' +
    '  "unclear": string[]\n' +
    '}';

  function buildScanPromptV6Safe(query) {
    var q = String(query || '').trim();
    if (typeof window !== 'undefined' && typeof window.buildScanPromptV6 === 'function' && window.buildScanPromptV6 !== buildScanPromptV6Safe) {
      try {
        var ext = window.buildScanPromptV6(q);
        if (typeof ext === 'string' && ext.length > 120) {
          if (q && ext.indexOf(q) < 0) return 'Target Coffee to Research: ' + q + '\n\n' + ext;
          return ext;
        }
      } catch (_) {}
    }
    var head = q
      ? ('Target Coffee to Research: ' + q + '\n\n')
      : 'Target Coffee to Research: [Attach bag photo(s) or type Roaster + Coffee Name above]\n\n';
    return head + SCAN_PROMPT_V6_BODY;
  }

  function isPromptEchoText(raw) {
    var t = String(raw || '').trim();
    if (!t) return false;
    return /You are extracting verifiable specialty coffee|You are filling in the specialty coffee profile|CRITICAL RULE ON ROAST DATE|Reply with ONLY one valid JSON object/i.test(t) &&
      /string\|null/.test(t);
  }

  function extractBalancedJson(rawText) {
    var t = String(rawText || '').trim();
    if (!t) return null;
    t = t.replace(/```(?:json)?/gi, '').replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'");
    var candidates = [];
    for (var i = 0; i < t.length; i++) {
      if (t[i] !== '{') continue;
      var depth = 0, inStr = false, esc = false;
      for (var j = i; j < t.length; j++) {
        var ch = t[j];
        if (inStr) {
          if (esc) esc = false;
          else if (ch === '\\') esc = true;
          else if (ch === '"') inStr = false;
        } else {
          if (ch === '"') inStr = true;
          else if (ch === '{') depth++;
          else if (ch === '}') {
            depth--;
            if (depth === 0) {
              candidates.push(t.slice(i, j + 1));
              break;
            }
          }
        }
      }
    }
    var keysWant = ['coffee_name', 'roaster', 'origin_country', 'origin', 'varietals', 'varietal', 'process_category', 'process', 'roast_level', 'tasting_notes'];
    var fallback = null;
    for (var k = 0; k < candidates.length; k++) {
      var cleaned = candidates[k].replace(/,\s*([}\]])/g, '$1');
      try {
        var o = JSON.parse(cleaned);
        if (o && typeof o === 'object' && !Array.isArray(o)) {
          var matchWanted = keysWant.some(function (wk) { return Object.prototype.hasOwnProperty.call(o, wk); });
          if (matchWanted) return o;
          if (!fallback) fallback = o;
        }
      } catch (_) {}
    }
    return fallback;
  }

  function parseScanReplyV6Safe(rawText) {
    var txt = String(rawText || '').trim();
    if (!txt) return null;
    if (isPromptEchoText(txt)) return { _isPromptEcho: true };

    /* 1. Handle BT-code / bt1: / BT6: shared recipe/coffee codes */
    if (/^(?:BT-code:|bt1:|BT6:)/i.test(txt)) {
      try {
        var inn = (typeof window !== 'undefined' && window.BTInnovate) ? window.BTInnovate : null;
        if (inn && typeof inn.decodeAndLocalizePassport === 'function') {
          var loc = inn.decodeAndLocalizePassport(txt, S.getApp().prefs);
          if (loc && loc.bean) return Object.assign({ _sourceKind: 'share_code' }, loc.bean);
        }
        if (typeof decodeShareCode === 'function') {
          var dec = decodeShareCode(txt);
          if (dec && (dec.coffee || dec.name || dec.coffee_name)) return Object.assign({ _sourceKind: 'share_code' }, dec.coffee || dec);
        }
        if (typeof shareRead === 'function') {
          var sr = shareRead(txt);
          if (sr && sr.coffee) return Object.assign({ _sourceKind: 'share_code' }, sr.coffee);
        }
      } catch (_) {}
    }

    /* 2. Prefer core/05 parseScanReplyV6 if present */
    if (typeof window !== 'undefined' && typeof window.parseScanReplyV6 === 'function' && window.parseScanReplyV6 !== parseScanReplyV6Safe) {
      try {
        var resV6 = window.parseScanReplyV6(txt);
        if (resV6 && typeof resV6 === 'object') {
          var outV6 = Object.assign({ _sourceKind: 'ai_json' }, resV6);
          if (resV6._rejectedWebRoastDate) outV6._rejectedWebRoastDate = resV6._rejectedWebRoastDate;
          return outV6;
        }
      } catch (_) {}
    }

    /* 3. Balanced-brace JSON object extractor */
    var jsonObj = extractBalancedJson(txt);
    if (!jsonObj && typeof parseScanReplyV2 === 'function') {
      try { jsonObj = parseScanReplyV2(txt); } catch (_) {}
    }
    if (jsonObj && typeof jsonObj === 'object') {
      return Object.assign({ _sourceKind: 'ai_json' }, jsonObj);
    }

    /* 4. Multi-line prose / bag label OCR fallback */
    if (typeof parseCoffeeTextV3 === 'function') {
      try {
        var p3 = parseCoffeeTextV3(txt);
        if (p3 && p3.ok && p3.fields && Object.keys(p3.fields).length) {
          return Object.assign({ _sourceKind: 'parsed_text' }, p3.fields);
        }
      } catch (_) {}
    }
    return null;
  }

  function normRoastKey(raw, agtronNum) {
    var s = String(raw || '').toLowerCase().trim();
    if (s) {
      if (/ultra|very\s*light|nordic|cinnamon/.test(s)) return 'ultra-light';
      if (/med.*light|omni|^city$/.test(s)) return 'medium-light';
      if (/med.*dark|full\s*city/.test(s)) return 'medium-dark';
      if (/\blight\b|filter/.test(s)) return 'light';
      if (/\bdark\b|french|vienna|italian/.test(s)) return 'dark';
      if (/\bmedium\b|city\+/.test(s)) return 'medium';
    }
    var ag = parseFloat(agtronNum);
    if (isFinite(ag) && ag > 0) {
      if (ag >= 86) return 'ultra-light';
      if (ag >= 74) return 'light';
      if (ag >= 63) return 'medium-light';
      if (ag >= 52) return 'medium';
      if (ag >= 42) return 'medium-dark';
      return 'dark';
    }
    return '';
  }

  function normProcessKey(raw) {
    var s = String(raw || '').toLowerCase().trim();
    if (!s || s === 'unknown' || s === 'null') return '';
    if (/thermal[-\s]?shock/.test(s)) return 'thermal-shock';
    if (/co[-\s]?ferm|infused/.test(s)) return 'co-ferment';
    if (/yeast|koji|inoculat/.test(s)) return 'yeast-koji';
    if (/carbonic/.test(s)) return 'carbonic';
    if (/anaerob/.test(s)) return 'anaerobic';
    if (/white[-\s]?honey/.test(s)) return 'white-honey';
    if (/yellow[-\s]?honey/.test(s)) return 'yellow-honey';
    if (/red[-\s]?honey/.test(s)) return 'red-honey';
    if (/black[-\s]?honey/.test(s)) return 'black-honey';
    if (/honey|pulped[-\s]?natural|semi[-\s]?washed/.test(s)) return 'honey';
    if (/wet[-\s]?hull|giling/.test(s)) return 'wet-hulled';
    if (/natural|dry/.test(s)) return 'natural';
    if (/wash|wet/.test(s)) return 'washed';
    return '';
  }

  function normIsoDate(raw) {
    if (!raw) return '';
    if (typeof isoDate === 'function') {
      try {
        var d0 = isoDate(raw);
        if (d0) return d0;
      } catch (_) {}
    }
    var m = String(raw).trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return m[1] + '-' + m[2] + '-' + m[3];
    return '';
  }

  function currencySymbol(code) {
    var c = String(code || 'USD').toUpperCase().trim();
    if (c === 'EUR' || c === '€') return '€';
    if (c === 'GBP' || c === '£') return '£';
    if (c === 'CAD' || c === 'AUD') return c + '$';
    if (c === 'JPY' || c === '¥') return '¥';
    return '$';
  }

  /* Sync bag price & weight into canonical `PRICES_KEY` ledger without duplicates */
  function syncBagPriceToLedger(c) {
    if (!c || !(c.name && String(c.name).trim())) return false;
    var hasPrice = isFinite(+c.price) && +c.price > 0;
    var hasWeight = isFinite(+c.bag_weight_g) && +c.bag_weight_g > 0;
    if (!hasPrice && !hasWeight) return false;

    var list = S.getPriceList().slice();
    var nameLow = String(c.name).trim().toLowerCase();
    var roastLow = String(c.roaster || '').trim().toLowerCase();
    var sizeG = hasWeight ? Math.round(+c.bag_weight_g) : 250;
    var sym = currencySymbol(c.currency);

    var existIdx = -1;
    for (var i = 0; i < list.length; i++) {
      var b = list[i];
      if (!b || b.finished) continue;
      if (String(b.coffee || '').trim().toLowerCase() === nameLow &&
          (!roastLow || !b.roaster || String(b.roaster).trim().toLowerCase() === roastLow)) {
        existIdx = i;
        break;
      }
    }

    var record = {
      kind: 'bag',
      coffee_id: c.id || '',
      coffee: String(c.name).trim(),
      roaster: String(c.roaster || '').trim(),
      origin: c.origin || '',
      process: c.process || '',
      sym: sym,
      currency: String(c.currency || 'USD').toUpperCase(),
      price: hasPrice ? Math.round(+c.price * 100) / 100 : (existIdx >= 0 && +list[existIdx].price > 0 ? +list[existIdx].price : 20),
      size: sizeG,
      rem_g: existIdx >= 0 && list[existIdx].rem_g != null ? +list[existIdx].rem_g : sizeG,
      unit: 'g',
      date: existIdx >= 0 && list[existIdx].date ? list[existIdx].date : S.isoDaysAgo(0),
      roast: c.roast_date || (existIdx >= 0 ? (list[existIdx].roast || '') : ''),
      rdate: c.roast_date || (existIdx >= 0 ? (list[existIdx].rdate || list[existIdx].roast || '') : ''),
      rlevel: c.roast || 'light'
    };

    if (existIdx >= 0) list[existIdx] = Object.assign({}, list[existIdx], record);
    else list.unshift(record);
    S.savePriceList(list);
    return true;
  }

  /* Build Per-Field Checkbox Review Model from Parsed `SCAN_PROMPT_V6` / v2 / Text */
  function mapScanToReviewItemsV6(d, curCoffee) {
    d = (d && typeof d === 'object') ? d : {};
    curCoffee = curCoffee || {};
    var srcKind = d._sourceKind || 'ai_json';
    var photoArr = Array.isArray(d.from_bag_photo) ? d.from_bag_photo.map(function (x) { return String(x || '').toLowerCase().trim(); }) : [];
    var webArr = Array.isArray(d.from_official_web) ? d.from_official_web : (Array.isArray(d.from_web) ? d.from_web : []);
    webArr = webArr.map(function (x) { return String(x || '').toLowerCase().trim(); });

    function provFor(rawKeys) {
      if (srcKind === 'share_code') return 'code';
      if (srcKind === 'parsed_text') return 'text';
      var ks = Array.isArray(rawKeys) ? rawKeys : [rawKeys];
      for (var i = 0; i < ks.length; i++) {
        if (photoArr.indexOf(ks[i]) >= 0) return 'photo';
      }
      for (var j = 0; j < ks.length; j++) {
        if (webArr.indexOf(ks[j]) >= 0) return 'web';
      }
      return 'ai';
    }

    var rows = [];
    function pushField(id, label, displayVal, patchObj, rawKeys, extra) {
      if (displayVal == null || String(displayVal).trim() === '') return;
      extra = extra || {};
      var curVal = extra.curVal != null ? String(extra.curVal).trim() : '';
      var dispStr = S.stripEmojis(String(displayVal).trim());
      var replaces = (curVal && curVal.toLowerCase() !== dispStr.toLowerCase()) ? curVal : '';
      rows.push({
        id: id,
        label: label,
        display: dispStr,
        patch: patchObj,
        provenance: extra.provenance || provFor(rawKeys),
        checked: extra.checked !== false,
        replaces: replaces,
        warn: extra.warn || ''
      });
    }

    var cName = d.coffee_name || d.name || '';
    if (cName) pushField('name', 'Coffee Name', cName, { name: String(cName).trim(), nameUnsure: '' }, ['coffee_name', 'name'], { curVal: curCoffee.name });

    var cRoaster = d.roaster || d.brand || '';
    var rLoc = d.roaster_location ? String(d.roaster_location).trim() : '';
    if (cRoaster) {
      pushField('roaster', 'Roaster', cRoaster + (rLoc ? ' (' + rLoc + ')' : ''), {
        roaster: String(cRoaster).trim(),
        roaster_location: rLoc || curCoffee.roaster_location || '',
        roasterUnsure: '',
        nameUnsure: ''
      }, ['roaster'], { curVal: curCoffee.roaster });
    }

    var origCountry = d.origin_country || '';
    var origRegion = d.origin_region || d.region || '';
    var fullOrigin = d.origin ? String(d.origin).trim() : [origRegion, origCountry].filter(Boolean).join(', ');
    if (fullOrigin) {
      pushField('origin', 'Origin & Region', fullOrigin, {
        origin: fullOrigin,
        region: origRegion || curCoffee.region || '',
        originUnsure: '',
        origin_unknown: ''
      }, ['origin_country', 'origin_region', 'origin'], { curVal: curCoffee.origin });
    }

    if (d.is_blend != null || (Array.isArray(d.blend_components) && d.blend_components.length)) {
      var isBl = !!d.is_blend || (Array.isArray(d.blend_components) && d.blend_components.length > 1);
      var compTxt = Array.isArray(d.blend_components) && d.blend_components.length
        ? d.blend_components.map(function (bc) {
            return [bc.origin_country, bc.varietal, bc.process, bc.pct ? bc.pct + '%' : ''].filter(Boolean).join(' ');
          }).join(' + ')
        : (isBl ? 'Multi-Component Blend' : 'Single Origin Lot');
      pushField('blend', 'Lot Type', compTxt, {
        blend: isBl ? 'blend' : 'single',
        blend_components: Array.isArray(d.blend_components) ? d.blend_components : null
      }, ['is_blend', 'blend_components']);
    }

    var farmProd = [d.farm_or_station, d.producer, d.harvest_year ? ('Harvest ' + d.harvest_year) : ''].filter(Boolean).join(' · ');
    if (farmProd) {
      pushField('producer', 'Farm / Station & Producer', farmProd, {
        farm_or_station: d.farm_or_station ? String(d.farm_or_station).trim() : '',
        producer: d.producer ? String(d.producer).trim() : '',
        harvest_year: d.harvest_year ? String(d.harvest_year).trim() : ''
      }, ['farm_or_station', 'producer', 'harvest_year'], { curVal: curCoffee.producer });
    }

    var varList = Array.isArray(d.varietals) ? d.varietals.filter(Boolean).join(', ') : (Array.isArray(d.varietal) ? d.varietal.join(', ') : (d.varietal || d.variety || ''));
    if (varList) {
      pushField('varietal', 'Varietals', varList, { varietal: String(varList).trim(), varietalUnsure: '' }, ['varietals', 'varietal'], { curVal: curCoffee.varietal });
    }

    if (d.species && String(d.species).toLowerCase() !== 'null') {
      var spLow = String(d.species).toLowerCase();
      var spVal = /robusta|canephora/.test(spLow) ? 'robusta'
        : /liberica/.test(spLow) ? 'liberica'
        : /excelsa|dewevrei/.test(spLow) ? 'excelsa'
        : /eugenioides/.test(spLow) ? 'eugenioides'
        : /stenophylla/.test(spLow) ? 'stenophylla'
        : /blend/.test(spLow) ? 'blend_ar' : 'arabica';
      if (spVal !== 'arabica' || curCoffee.species !== 'arabica') {
        pushField('species', 'Species', spVal.toUpperCase(), { species: spVal }, ['species'], { curVal: curCoffee.species });
      }
    }

    var elevNum = typeof d.elevation_masl === 'number' ? Math.round(d.elevation_masl) : parseInt(String(d.elevation_masl || d.elevation || '').replace(/[^\d]/g, ''), 10);
    var densRaw = d.estimated_density && String(d.estimated_density).toLowerCase() !== 'null' ? String(d.estimated_density).toLowerCase() : '';
    if ((isFinite(elevNum) && elevNum >= 100 && elevNum <= 3500) || densRaw) {
      var densCalc = densRaw === 'very-high' ? 'very-high' : densRaw === 'high' ? 'high' : densRaw === 'low' ? 'low' : densRaw === 'medium' ? 'mid'
        : (isFinite(elevNum) ? (elevNum >= 1950 ? 'very-high' : elevNum >= 1600 ? 'high' : elevNum >= 1200 ? 'mid' : 'low') : '');
      var elevDisp = (isFinite(elevNum) ? (elevNum + ' masl (' + Math.round(elevNum * 3.28084) + ' ft)') : '') + (densCalc ? ' · ' + densCalc.toUpperCase() + ' density' : '');
      pushField('elevation', 'Elevation & Density', elevDisp.replace(/^\s*·\s*/, ''), {
        elevation_m: isFinite(elevNum) ? elevNum : (curCoffee.elevation_m || ''),
        elevText: isFinite(elevNum) ? (elevNum + ' masl') : (curCoffee.elevText || ''),
        density: densCalc || curCoffee.density || '',
        elevUnsure: '',
        elev_unknown: ''
      }, ['elevation_masl', 'estimated_density', 'elevation'], { curVal: curCoffee.elevation_m ? (curCoffee.elevation_m + ' masl') : '' });
    }

    var procRaw = [d.process_category, d.process, d.process_details].filter(Boolean).join(' — ');
    var procNorm = normProcessKey(d.process_category || d.process || d.process_details);
    if (procNorm || d.process_details) {
      var pPatch = { processUnsure: '', process_unknown: '' };
      if (procNorm) {
        pPatch.process = procNorm;
        if (procNorm.indexOf('-honey') > 0) pPatch.process_sub = procNorm;
      }
      if (d.process_details) pPatch.process_details = String(d.process_details).trim();
      pushField('process', 'Process & Fermentation', procRaw || procNorm, pPatch, ['process_category', 'process', 'process_details'], { curVal: curCoffee.process });
    }

    if (d.decaf === true || d.decaf === 'yes' || d.decaf === 'half-caf' || (d.decaf_process && String(d.decaf_process) !== 'null')) {
      var dpStr = String(d.decaf_process || (d.decaf === 'half-caf' ? 'half-caf' : '')).toLowerCase();
      var dpVal = /half/.test(dpStr) || d.decaf === 'half-caf' ? 'half-caf'
        : /ea|sugar|ethyl/.test(dpStr) ? 'ea'
        : /swiss|swp/.test(dpStr) ? 'swiss'
        : /mountain|mwp/.test(dpStr) ? 'mountain'
        : /co2/.test(dpStr) ? 'co2'
        : /mc|methylene/.test(dpStr) ? 'mc' : 'ea';
      var decVal = dpVal === 'half-caf' ? 'half-caf' : 'yes';
      pushField('decaf', 'Caffeine / Decaf', (decVal === 'half-caf' ? 'Half-Caf (50%)' : 'Decaf') + ' · ' + dpVal.toUpperCase(), {
        decaf: decVal,
        decaf_process: dpVal
      }, ['decaf', 'decaf_process'], { curVal: curCoffee.decaf });
    }

    var agNum = parseFloat(d.agtron_gourmet != null ? d.agtron_gourmet : d.agtron);
    var rKey = normRoastKey(d.roast_level || d.roaster_roast_label, agNum);
    if (rKey || isFinite(agNum)) {
      var rStop = S.ROAST_STOPS.find(function (x) { return x.key === rKey; });
      var rDisp = (rStop ? rStop.label : rKey) +
        (d.roaster_roast_label ? ' ("' + d.roaster_roast_label + '")' : '') +
        (isFinite(agNum) ? ' · Agtron ' + agNum : '');
      var rPatch = { roastUnsure: '', roast_unknown: '' };
      if (rKey) rPatch.roast = rKey;
      if (d.roaster_roast_label) rPatch.roaster_roast_label = String(d.roaster_roast_label).trim();
      if (isFinite(agNum) && agNum >= 20 && agNum <= 115) {
        rPatch.ground_agtron = agNum;
        rPatch.bean_agtron = Math.round((agNum - 7.0) * 10) / 10;
      }
      pushField('roast', 'Roast Level', rDisp, rPatch, ['roast_level', 'roaster_roast_label', 'agtron_gourmet'], { curVal: curCoffee.roast });
    }

    if (d.recommended_rest_days != null) {
      var restDisp = typeof d.recommended_rest_days === 'object'
        ? JSON.stringify(d.recommended_rest_days).replace(/[{"}]/g, '')
        : (d.recommended_rest_days + ' days post-roast');
      pushField('rest_days', 'Roaster Recommended Rest', restDisp, {
        recommended_rest_days: typeof d.recommended_rest_days === 'number' ? d.recommended_rest_days : (d.recommended_rest_days.filter || 7)
      }, ['recommended_rest_days']);
    }

    var rDateIso = normIsoDate(d.roast_date || d._rejectedWebRoastDate);
    if (rDateIso) {
      var dateFromWebOnly = !!d._rejectedWebRoastDate || (webArr.indexOf('roast_date') >= 0 && photoArr.indexOf('roast_date') < 0);
      pushField('roast_date', 'Roast Date', rDateIso, {
        roast_date: rDateIso,
        dateUnsure: '',
        date_unknown: ''
      }, ['roast_date'], {
        provenance: dateFromWebOnly ? 'web' : 'photo',
        checked: !dateFromWebOnly,
        curVal: curCoffee.roast_date,
        warn: dateFromWebOnly ? 'Unchecked by default: roast_date should only come from your physical bag stamp, never the web.' : ''
      });
    }

    var notesArr = Array.isArray(d.tasting_notes) ? d.tasting_notes.filter(Boolean).join(', ') : (d.tasting_notes || d.bag_notes || '');
    if (notesArr) {
      pushField('bag_notes', 'Tasting Notes', notesArr, {
        bag_notes: String(notesArr).trim(),
        notesUnsure: '',
        notes_unknown: '',
        cup_profile: d.cup_profile || null
      }, ['tasting_notes', 'cup_profile'], { curVal: curCoffee.bag_notes });
    }

    if (d.roaster_brew_guide && typeof d.roaster_brew_guide === 'object') {
      var rg = d.roaster_brew_guide;
      var hasRg = rg.dose_g || rg.water_g || rg.ratio || rg.temp_c || rg.temp_f || rg.time_sec || rg.notes;
      if (hasRg) {
        var rgParts = [
          rg.method || 'Filter',
          rg.dose_g ? (rg.dose_g + 'g dose') : '',
          rg.water_g ? (rg.water_g + 'g water') : '',
          rg.ratio ? ('1:' + rg.ratio) : '',
          rg.temp_c ? (rg.temp_c + ' °C') : (rg.temp_f ? (rg.temp_f + ' °F') : ''),
          rg.time_sec ? (Math.floor(rg.time_sec / 60) + ':' + String(Math.round(rg.time_sec % 60)).padStart(2, '0')) : ''
        ].filter(Boolean).join(' · ');
        pushField('roaster_guide', 'Roaster Brew Guide (Step 3 1-Tap Pill)', rgParts || rg.notes, {
          roasterGuide: rg,
          roaster_brew_guide: rg
        }, ['roaster_brew_guide']);
      }
    }

    var hasBagEcon = (isFinite(+d.price) && +d.price > 0) || (isFinite(+d.bag_weight_g) && +d.bag_weight_g > 0);
    if (hasBagEcon) {
      var curCode = String(d.currency || 'USD').toUpperCase();
      var econDisp = [
        isFinite(+d.price) && +d.price > 0 ? (currencySymbol(curCode) + (+d.price).toFixed(2) + ' ' + curCode) : '',
        isFinite(+d.bag_weight_g) && +d.bag_weight_g > 0 ? (Math.round(+d.bag_weight_g) + ' g bag') : ''
      ].filter(Boolean).join(' / ');
      pushField('bag_econ', 'Bag Price & Weight (Auto-Syncs Cellar Ledger)', econDisp, {
        price: isFinite(+d.price) && +d.price > 0 ? +d.price : '',
        bag_weight_g: isFinite(+d.bag_weight_g) && +d.bag_weight_g > 0 ? Math.round(+d.bag_weight_g) : '',
        currency: curCode,
        _syncPriceLedger: true
      }, ['price', 'bag_weight_g', 'currency']);
    }

    var urls = Array.isArray(d.source_urls) ? d.source_urls : (Array.isArray(d.sources) ? d.sources : []);
    urls = urls.filter(function (u) { return typeof u === 'string' && /^https?:\/\//i.test(u.trim()); }).slice(0, 5);
    var unclear = Array.isArray(d.unclear) ? d.unclear.map(function (u) { return String(u || '').trim(); }).filter(Boolean) : [];

    return {
      items: rows,
      unclear: unclear,
      sourceUrls: urls,
      fromBagPhoto: photoArr,
      fromOfficialWeb: webArr,
      sourceKind: srcKind
    };
  }

  /* -------------------- 3. Bounded Levenshtein & `didYouMean` Helpers -------------------- */
  function levDist(a, b) {
    a = String(a || '').toLowerCase().trim();
    b = String(b || '').toLowerCase().trim();
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    var v0 = new Array(b.length + 1);
    var v1 = new Array(b.length + 1);
    for (var i = 0; i <= b.length; i++) v0[i] = i;
    for (var r = 0; r < a.length; r++) {
      v1[0] = r + 1;
      for (var c = 0; c < b.length; c++) {
        var cost = a[r] === b[c] ? 0 : 1;
        v1[c + 1] = Math.min(v1[c] + 1, v0[c + 1] + 1, v0[c] + cost);
      }
      var tmp = v0; v0 = v1; v1 = tmp;
    }
    return v0[b.length];
  }

  function getAllOriginNames52() {
    if (typeof ORIGINS !== 'undefined' && Array.isArray(ORIGINS) && ORIGINS.length >= 20) {
      var names = ORIGINS.filter(function (o) { return o && o.name && o.key !== 'africa'; }).map(function (o) { return o.name; });
      if (typeof COFFEE_COUNTRIES !== 'undefined' && Array.isArray(COFFEE_COUNTRIES)) {
        COFFEE_COUNTRIES.forEach(function (cc) {
          if (cc && cc.name && !cc.general && names.indexOf(cc.name) < 0) names.push(cc.name);
        });
      }
      return names;
    }
    return FALLBACK_ORIGINS_52.slice();
  }

  function getAllVarietalNames72() {
    if (typeof VARIETALS !== 'undefined' && Array.isArray(VARIETALS) && VARIETALS.length >= 40) {
      return VARIETALS.map(function (v) { return v.label || v.name; }).filter(Boolean);
    }
    return FALLBACK_VARIETALS_72.slice();
  }

  function suggestOriginCorrection(typedOrigin, coffeeName) {
    var raw = String(typedOrigin || '').trim();
    var out = { suggestions: [], mismatch: null };
    if (raw && typeof originMismatch === 'function' && coffeeName) {
      try {
        var countryOnly = raw.split(',').pop().trim();
        var mm = originMismatch(countryOnly, coffeeName);
        if (mm && mm.country) out.mismatch = mm;
      } catch (_) {}
    }
    if (!raw || raw.length < 3) return out;
    var all52 = getAllOriginNames52();
    var low = raw.toLowerCase();
    var exact = all52.some(function (n) { return low === n.toLowerCase() || low.indexOf(n.toLowerCase()) >= 0; });
    if (exact) return out;

    if (typeof originSuggest === 'function') {
      try {
        var os = originSuggest(raw);
        if (Array.isArray(os) && os.length) { out.suggestions = os.slice(0, 3); return out; }
      } catch (_) {}
    }
    var scored = [];
    all52.forEach(function (n) {
      var d = levDist(low, n.toLowerCase());
      if (d > 0 && d <= Math.max(2, Math.floor(n.length * 0.34))) scored.push({ n: n, d: d });
    });
    scored.sort(function (a, b) { return a.d - b.d; });
    out.suggestions = scored.slice(0, 3).map(function (x) { return x.n; });
    return out;
  }

  function suggestVarietalCorrection(typedVar) {
    var raw = String(typedVar || '').trim();
    if (!raw || raw.length < 3) return [];
    var parts = raw.split(/[,;/]+/).map(function (s) { return s.trim(); }).filter(Boolean);
    var lastTok = parts[parts.length - 1] || '';
    if (lastTok.length < 3) return [];
    var low = lastTok.toLowerCase();
    if (low === 'geisha') return ['Gesha'];
    var all72 = getAllVarietalNames72();
    var exact = all72.some(function (v) { return v.toLowerCase() === low; });
    if (exact) return [];
    var scored = [];
    all72.forEach(function (v) {
      var d = levDist(low, v.toLowerCase());
      if (d > 0 && d <= Math.max(2, Math.floor(v.length * 0.30))) scored.push({ v: v, d: d });
    });
    scored.sort(function (a, b) { return a.d - b.d; });
    return scored.slice(0, 3).map(function (x) { return x.v; });
  }

  function getActiveLensLevel() {
    try {
      var sh = S.getShell();
      if (sh && sh.BTScienceLens) {
        if (typeof sh.BTScienceLens.level === 'function') return sh.BTScienceLens.level();
        if (typeof sh.BTScienceLens.mode === 'function') {
          var m = sh.BTScienceLens.mode();
          if (m === 'xray' || m === 'scientist' || m === 'expert') return 'scientist';
          if (m === 'surface' || m === 'starter' || m === 'new') return 'starter';
        }
      }
      var a = S.getApp();
      var lv = a && a.prefs && (a.prefs.experienceLens || a.prefs.level);
      if (lv === 'scientist' || lv === 'expert') return 'scientist';
      if (lv === 'starter' || lv === 'new') return 'starter';
    } catch (_) {}
    return 'comfy';
  }

  var _MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var _MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var _WEEKDAYS_7 = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  function parseIsoParts(iso) {
    var m = String(iso || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return null;
    var y = parseInt(m[1], 10), mo = parseInt(m[2], 10), d = parseInt(m[3], 10);
    if (!isFinite(y) || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
    return { y: y, m: mo - 1, d: d, iso: m[1] + '-' + m[2] + '-' + m[3] };
  }

  function makeIsoFromParts(y, mIdx, d) {
    return String(y) + '-' + String(mIdx + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
  }

  function formatHumanIsoDate(iso) {
    var p = parseIsoParts(iso);
    if (!p) return '';
    return _MONTHS_SHORT[p.m] + ' ' + p.d + ', ' + p.y;
  }

  function daysBetweenIso(earlierIso, laterIso) {
    var a = parseIsoParts(earlierIso);
    var b = parseIsoParts(laterIso);
    if (!a || !b) return null;
    var t0 = Date.UTC(a.y, a.m, a.d);
    var t1 = Date.UTC(b.y, b.m, b.d);
    return Math.round((t1 - t0) / 86400000);
  }

  function closeOrBackFromCoffeeModal() {
    S.haptic('tick');
    try {
      if (typeof BTSheet !== 'undefined' && BTSheet && typeof BTSheet.isOpen === 'function' && BTSheet.isOpen()) {
        S.closeSheetSafe();
        return;
      }
      var sh = S.getShell();
      if (sh && sh.BTSheet && typeof sh.BTSheet.isOpen === 'function' && sh.BTSheet.isOpen()) {
        S.closeSheetSafe();
        return;
      }
      if (sh && typeof sh.canGoBack === 'function' && sh.canGoBack() && typeof sh.goBack === 'function') {
        sh.goBack();
        return;
      }
    } catch (_) {}
    S.closeSheetSafe();
    S.navGo('coffee');
    S.rerenderSafe();
  }

  function checkIdentityDidYouMean(c, unifiedRecs) {
    var nameStr = String((c && c.name) || '').trim();
    var roastStr = String((c && c.roaster) || '').trim();
    if (!nameStr && !roastStr) return null;
    var known = (unifiedRecs || []).map(function (r) { return { coffee: r.name, roaster: r.roaster, n: r.nCups || 1 }; });
    if (typeof didYouMean === 'function' && known.length) {
      try {
        var dym = didYouMean({ coffee: nameStr, roaster: roastStr }, known);
        if (dym) return dym;
      } catch (_) {}
    }
    if (roastStr.length >= 4 && typeof ROASTER_DIRECTORY !== 'undefined' && Array.isArray(ROASTER_DIRECTORY)) {
      var lowR = roastStr.toLowerCase();
      var exactR = ROASTER_DIRECTORY.some(function (rd) { return rd && String(rd.name || '').toLowerCase() === lowR; });
      if (!exactR) {
        for (var i = 0; i < ROASTER_DIRECTORY.length; i++) {
          var cand = ROASTER_DIRECTORY[i] && ROASTER_DIRECTORY[i].name;
          if (!cand) continue;
          var shortC = cand.replace(/\s+Coffee(?:\s+Roasters|\s+Lab)?$/i, '').trim();
          if (levDist(lowR, cand.toLowerCase()) <= 2 || (shortC.length >= 4 && levDist(lowR, shortC.toLowerCase()) <= 1 && lowR !== shortC.toLowerCase())) {
            return { kind: 'fixRoaster', roaster: cand, fixRoaster: true };
          }
        }
      }
    }
    return null;
  }

  /* -------------------- 4. Bean Rest Window & `-18 °C` Cryo-Freeze Status -------------------- */
  function computeSmrkeFreshnessStatus(c) {
    c = c || {};
    var isSci = getActiveLensLevel() === 'scientist';
    var roast = c.roast || 'light';
    var windows = {
      'ultra-light': { ready: 7, peakEnd: 32, bloomEarly: 50, bloomPeak: 38 },
      'light':       { ready: 5, peakEnd: 26, bloomEarly: 45, bloomPeak: 35 },
      'medium-light':{ ready: 4, peakEnd: 22, bloomEarly: 42, bloomPeak: 32 },
      'medium':      { ready: 3, peakEnd: 18, bloomEarly: 38, bloomPeak: 30 },
      'medium-dark': { ready: 2, peakEnd: 14, bloomEarly: 34, bloomPeak: 28 },
      'dark':        { ready: 1, peakEnd: 10, bloomEarly: 28, bloomPeak: 25 }
    };
    var w = Object.assign({}, windows[roast] || windows.light);
    if (isFinite(+c.recommended_rest_days) && +c.recommended_rest_days > 0) {
      w.ready = Math.round(+c.recommended_rest_days);
      w.peakEnd = Math.max(w.ready + 14, w.peakEnd);
    }

    if (c.dateUnsure === 'yes' || (!c.roast_date && c.is_frozen !== 'yes')) {
      return {
        label: 'Date not on bag · Safe 35s bloom',
        shortState: 'Safe 35s bloom',
        detail: 'Uses a balanced middle rest baseline — zero penalty when your bag omits a roast date.',
        tone: 'is-gold',
        effectiveDays: 10,
        window: w
      };
    }

    var rawDays = S.daysSinceIso(c.roast_date);
    if (rawDays == null) rawDays = 7;

    /* -18 °C Cryo-Vault slowdown (Ea = 40.1 kJ/mol -> 12.3x slower aging) */
    var effDays = rawDays;
    if (c.is_frozen === 'yes' || c.is_frozen === true) {
      var freezeDaysAgo = S.daysSinceIso(c.frozen_date);
      if (freezeDaysAgo != null && freezeDaysAgo <= rawDays) {
        var preFreeze = Math.max(0, rawDays - freezeDaysAgo);
        effDays = Math.round((preFreeze + freezeDaysAgo / 12.3) * 10) / 10;
      } else {
        effDays = Math.round(Math.min(rawDays, 7) * 10) / 10;
      }
      return {
        label: 'Frozen at -18 °C · Day ' + Math.round(effDays) + ' Peak Locked',
        shortState: 'Frozen Peak Locked',
        detail: isSci
          ? 'Arrhenius cryo-storage (Ea = 40.1 kJ/mol) slows volatile loss & CO2 aging 12.3x (grind straight from frozen!).'
          : 'Freezing at -18 °C locks peak flavor & slows bean aging ~12x (you can grind straight from frozen!).',
        tone: 'is-sci',
        effectiveDays: effDays,
        window: w
      };
    }

    if (effDays < w.ready) {
      var waitMore = Math.max(1, Math.ceil(w.ready - effDays));
      return {
        label: 'Day ' + effDays + ' · Rest ' + waitMore + ' more day' + (waitMore === 1 ? '' : 's'),
        shortState: 'Resting · ' + waitMore + 'd to Peak',
        detail: isSci
          ? 'High Smrke Weibull CO2 outgassing — if brewing today, extend bloom to ' + w.bloomEarly + 's with gentle swirl.'
          : 'Freshly roasted beans hold lots of CO2 gas — if brewing today, give a longer ' + w.bloomEarly + 's bloom pour so water soaks in evenly.',
        tone: 'is-warn',
        effectiveDays: effDays,
        window: w
      };
    }
    if (effDays <= w.peakEnd) {
      return {
        label: 'Day ' + effDays + ' · Peak Window',
        shortState: 'Peak Window',
        detail: 'Ideal aroma & sweetness window through Day ' + w.peakEnd + ' (' + w.bloomPeak + 's bloom).',
        tone: 'is-good',
        effectiveDays: effDays,
        window: w
      };
    }
    return {
      label: 'Day ' + effDays + ' · Past Peak Window',
      shortState: 'Gentle Fade',
      detail: 'Lower CO2 gas — Step 3 grinds slightly finer & uses a crisp 25s bloom to boost sweetness.',
      tone: 'is-warn',
      effectiveDays: effDays,
      window: w
    };
  }

  function roastMeterToGourmet(val, scale) {
    var n = parseFloat(val);
    if (!isFinite(n) || n <= 0) return null;
    var sc = String(scale || 'gourmet').toLowerCase();
    if (sc === 'commercial') return Math.round(((n / 0.7429) - 1.528) * 10) / 10;
    if (sc === 'tonino') return Math.round((20 + (n - 40) * 0.86) * 10) / 10;
    return Math.round(n * 10) / 10;
  }

  /* -------------------- 5. Saved Coffee & Fresh Bag Selection Engine -------------------- */
  function formatProvenanceBadge(anchorRow) {
    if (!anchorRow) return 'Loaded saved bean profile';
    var mk = (typeof resolveMethod === 'function' ? resolveMethod(anchorRow.brew_method) : '') || anchorRow.brew_method || 'V60';
    var mObj = S.getMethods23().find(function (x) { return x.key === mk; });
    var mName = mObj ? mObj.label : String(anchorRow.brew_method || 'V60');
    var stars = parseFloat(anchorRow.my_rating_stars);
    var total = parseFloat(anchorRow.total_score);
    var locked = anchorRow.dial_locked === 'yes' || anchorRow.dial_locked === '1';
    var scoreTxt = stars > 0 ? ((Math.round(stars * 10) / 10) + '/5 ') : (total > 0 ? ((Math.round(total * 10) / 10) + ' pt ') : '');
    return 'Loaded your ' + (locked ? 'locked ' : '') + scoreTxt + mName + ' recipe';
  }

  function applySavedCoffeeSelection(rec, extraOpts) {
    if (!rec) return;
    extraOpts = extraOpts || {};
    var a = S.getApp();
    var st = S.getState();
    var storage = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : null;
    var selRes = null;
    if (storage && typeof storage.selectSavedCoffee === 'function') {
      try { selRes = storage.selectSavedCoffee(rec, { seedRecipe: true }); } catch (_) {}
    }

    var anchor = (selRes && selRes.anchorRow) || rec.lockedBrew || rec.bestBrew || rec.latestBrew || null;
    a.coffee = a.coffee || {};
    var c = a.coffee;
    c.id = rec.coffee_id || rec.id || c.id || ('cf_' + Date.now());
    c.name = rec.name || rec.coffee_name || (anchor && anchor.coffee_name) || 'Saved Specialty Coffee';
    c.roaster = rec.roaster || (anchor && anchor.roaster) || '';
    c.nameUnsure = '';
    c.roasterUnsure = c.roaster ? '' : 'yes';

    var rawOrigin = String(rec.origin || (anchor && anchor.origin) || '').trim();
    if (rawOrigin && rawOrigin.toLowerCase() !== 'unknown') {
      c.origin = rawOrigin;
      c.originUnsure = '';
      c.origin_unknown = '';
    } else {
      c.origin = '';
      c.originUnsure = 'yes';
      c.origin_unknown = 'yes';
    }

    var rawProc = String(rec.process || (anchor && anchor.process) || '').trim();
    var normP = normProcessKey(rawProc) || (rawProc && rawProc.toLowerCase() !== 'unknown' ? rawProc.toLowerCase() : '');
    if (normP && normP !== 'unknown') {
      c.process = normP;
      c.processUnsure = '';
      c.process_unknown = '';
    } else {
      c.process = 'unknown';
      c.processUnsure = 'yes';
      c.process_unknown = 'yes';
    }

    var rawRoast = String(rec.roast || (anchor && anchor.roast_level) || '').trim();
    var normR = normRoastKey(rawRoast, rec.ground_agtron || rec.agtron) || (rawRoast && rawRoast.toLowerCase() !== 'unknown' ? rawRoast.toLowerCase() : '');
    if (normR && normR !== 'unknown') {
      c.roast = normR;
      c.roastUnsure = '';
      c.roast_unknown = '';
    } else {
      c.roast = 'unknown';
      c.roastUnsure = 'yes';
      c.roast_unknown = 'yes';
    }

    c.roast_date = extraOpts.roastDateOverride != null ? extraOpts.roastDateOverride : (rec.roast_date || (rec.openBag && (rec.openBag.roast || rec.openBag.rdate)) || (anchor && anchor.roast_date) || '');
    c.is_frozen = extraOpts.isFrozen != null ? (extraOpts.isFrozen ? 'yes' : '') : (rec.is_frozen || '');
    c.frozen_date = extraOpts.frozenDateOverride != null ? extraOpts.frozenDateOverride : (extraOpts.isFrozen ? S.isoDaysAgo(0) : (rec.frozen_date || ''));
    c.dateUnsure = (c.roast_date || c.is_frozen === 'yes') ? '' : 'yes';
    c.date_unknown = c.dateUnsure;

    var rawElev = rec.elevation_m || (anchor && anchor.elevation_m) || '';
    if (isFinite(+rawElev) && +rawElev > 0) {
      c.elevation_m = Math.round(+rawElev);
      c.elevText = c.elevation_m + ' masl';
      c.density = c.elevation_m >= 1950 ? 'very-high' : c.elevation_m >= 1600 ? 'high' : c.elevation_m >= 1200 ? 'mid' : 'low';
      c.elevUnsure = '';
      c.elev_unknown = '';
    } else {
      c.elevation_m = '';
      c.elevText = '';
      c.density = 'unknown';
      c.elevUnsure = 'yes';
      c.elev_unknown = 'yes';
    }

    c.varietal = rec.varietal || (anchor && anchor.varietal) || '';
    c.varietalUnsure = '';
    c.species = rec.species || (anchor && anchor.species) || 'arabica';
    c.decaf = rec.decaf || (anchor && anchor.decaf) || '';
    c.decaf_process = rec.decaf_process || (anchor && anchor.decaf_process) || '';
    c.bag_notes = rec.bag_notes || (anchor && anchor.bag_notes) || '';
    c.notesUnsure = String(c.bag_notes || '').trim() ? '' : 'yes';
    c.notes_unknown = c.notesUnsure;
    if (rec.bean_agtron != null) c.bean_agtron = rec.bean_agtron;
    if (rec.ground_agtron != null) c.ground_agtron = rec.ground_agtron;
    if (rec.roast_delta != null) c.roast_delta = rec.roast_delta;
    if (rec.psd_d50_um != null) c.psd_d50_um = rec.psd_d50_um;
    if (rec.roasterGuide) c.roasterGuide = rec.roasterGuide;
    c._v64Touched = 'yes';
    c.answered = 'yes';

    a.brew = a.brew || {};
    if (anchor) {
      if (storage && typeof storage.useCoffeeFromRow === 'function' && !selRes) {
        try { storage.useCoffeeFromRow(anchor, true, true); } catch (_) {}
      }
      var mk = (selRes && selRes.methodKey) || (typeof resolveMethod === 'function' ? resolveMethod(anchor.brew_method) : '') || String(anchor.brew_method || 'v60').toLowerCase();
      if (mk) a.brew.method = mk;
      if (+anchor.brew_dose_g > 0) a.brew.dose = +anchor.brew_dose_g;
      if (+anchor.brew_water_g > 0) a.brew.water = +anchor.brew_water_g;
      if (+anchor.brew_ratio > 0) a.brew.ratio = +anchor.brew_ratio;
      if (+anchor.brew_temp_c > 0) a.brew.tempC = +anchor.brew_temp_c;
      else if (+anchor.brew_temp_f > 0) a.brew.tempC = Math.round(((+anchor.brew_temp_f - 32) * 5 / 9) * 2) / 2;
      if (+anchor.brew_grind_target_um > 0) a.brew.grindUm = +anchor.brew_grind_target_um;
      if (anchor.brew_grind_setting) a.brew.grind_setting = anchor.brew_grind_setting;
      if (anchor.brew_style) a.brew.style = anchor.brew_style;
      if (anchor.dial_locked === 'yes' || anchor.dial_locked === '1') a.recipeLocked = true;
    }

    var prov = (selRes && selRes.provenanceLabel) ? S.stripEmojis(selRes.provenanceLabel) : formatProvenanceBadge(anchor);
    if (extraOpts.freshNote) prov += ' · ' + extraOpts.freshNote;
    st.vaultProvenance = prov;
    c.provenanceLabel = prov;

    a.freshCoffeeMode = false;
    a.cupBrew = null;
    if (a.brew) {
      a.brew.actualSecs = null;
      a.brew.actualFromTimer = false;
    }
    try {
      if (typeof window !== 'undefined' && window.BTBrewStudio && typeof window.BTBrewStudio.resetTimerSession === 'function') {
        window.BTBrewStudio.resetTimerSession();
      }
      if (typeof window !== 'undefined' && window.BTTasteStep && typeof window.BTTasteStep.resetSession === 'function') {
        window.BTTasteStep.resetSession();
      }
    } catch (_) {}

    S.haptic('snap');
    S.saveDraftSafe();
    S.closeSheetSafe();
    if (extraOpts.stayOnCoffee) {
      S.rerenderSafe();
    } else {
      S.navGo(extraOpts.targetRoute || 'method');
      S.rerenderSafe();
    }
    S.toastSafe(prov);
  }

  function applyFreshBagRollover(rec, daysBackOrIso, resetGrams, freezeOn, stayOnCoffee, frozenIsoOverride) {
    var isUnsure = daysBackOrIso === 'unsure' || daysBackOrIso === '';
    var iso = isUnsure
      ? ''
      : (typeof daysBackOrIso === 'string' && /^\d{4}-\d{2}-\d{2}/.test(daysBackOrIso.trim())
        ? daysBackOrIso.trim().slice(0, 10)
        : S.isoDaysAgo(daysBackOrIso));
    var storage = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : null;
    if (storage && typeof storage.applyFreshBagRoastDate === 'function' && iso) {
      try {
        storage.applyFreshBagRoastDate(rec, iso, {
          bagGrams: resetGrams > 0 ? resetGrams : undefined,
          resetBag: resetGrams > 0,
          isFrozen: !!freezeOn
        });
      } catch (_) {}
    } else {
      var list = S.getPriceList().slice();
      var gVal = resetGrams > 0 ? resetGrams : ((rec.openBag && +rec.openBag.size) || 250);
      list.unshift({
        kind: 'bag',
        coffee_id: rec.coffee_id || '',
        coffee: rec.name || 'Fresh Bag',
        roaster: rec.roaster || '',
        origin: rec.origin || '',
        process: rec.process || '',
        sym: '$',
        currency: 'USD',
        price: (rec.openBag && +rec.openBag.price) || 20,
        size: gVal,
        rem_g: gVal,
        unit: 'g',
        date: S.isoDaysAgo(0),
        roast: iso,
        rdate: iso,
        rlevel: rec.roast || 'light'
      });
      S.savePriceList(list);
    }
    var dBack = iso ? S.daysSinceIso(iso) : null;
    var dateSummary = !iso ? 'Date not on bag' : (dBack === 0 ? 'Roasted Today' : (formatHumanIsoDate(iso) + ' · ' + dBack + 'd ago'));
    var freshLbl = 'Fresh Bag (' + dateSummary + ' · Locked recipe kept)';
    S.haptic('celebrate');
    applySavedCoffeeSelection(rec, {
      roastDateOverride: iso,
      isFrozen: !!freezeOn,
      frozenDateOverride: freezeOn ? (frozenIsoOverride || S.isoDaysAgo(0)) : '',
      freshNote: freshLbl,
      stayOnCoffee: !!stayOnCoffee
    });
  }

  /* -------------------- 6. Clipboard Copy Helper & `ai-paste` Review Sheet -------------------- */
  function copyTextRobust(txt, onDone) {
    var doneCalled = false;
    function finish(ok) {
      if (doneCalled) return;
      doneCalled = true;
      if (typeof onDone === 'function') onDone(ok);
    }
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(txt).then(function () {
          finish(true);
        }).catch(function () {
          finish(execCopyFallback(txt));
        });
        return;
      }
    } catch (_) {}
    finish(execCopyFallback(txt));
  }

  function execCopyFallback(txt) {
    try {
      var ta = document.createElement('textarea');
      ta.value = txt;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-9999px';
      ta.style.left = '-9999px';
      ta.style.fontSize = '16px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      var ok = false;
      try { ok = !!document.execCommand('copy'); } catch (_) {}
      if (ta.parentNode) ta.parentNode.removeChild(ta);
      return ok;
    } catch (_) {
      return false;
    }
  }

  var pasteUi = {
    rawText: '',
    prefillQuery: '',
    reviewModel: null,
    promptEchoNotice: false
  };

  function buildAiPasteSheet(payload) {
    payload = payload || {};
    var a = S.getApp();
    a.coffee = a.coffee || {};
    if (payload.prefillQuery != null) pasteUi.prefillQuery = String(payload.prefillQuery);
    if (payload.initialClipText != null) {
      var clipStr = String(payload.initialClipText).trim();
      if (isPromptEchoText(clipStr)) {
        pasteUi.promptEchoNotice = true;
        pasteUi.rawText = '';
        pasteUi.reviewModel = null;
      } else if (clipStr) {
        pasteUi.promptEchoNotice = false;
        pasteUi.rawText = clipStr;
        var parsedInit = parseScanReplyV6Safe(clipStr);
        pasteUi.reviewModel = (parsedInit && !parsedInit._isPromptEcho) ? mapScanToReviewItemsV6(parsedInit, a.coffee) : null;
      }
    }

    var root = S.h('div', { class: 'bt-ce-sheet', id: 'bt-ai-paste-sheet' });
    var reviewHost = S.h('div', { style: 'display:flex;flex-direction:column;gap:10px' });

    function runParseOnRaw(txt) {
      pasteUi.rawText = txt;
      var trimmed = String(txt || '').trim();
      if (!trimmed) {
        pasteUi.promptEchoNotice = false;
        pasteUi.reviewModel = null;
        paintReviewOnly();
        return;
      }
      var parsed = parseScanReplyV6Safe(trimmed);
      if (parsed && parsed._isPromptEcho) {
        pasteUi.promptEchoNotice = true;
        pasteUi.reviewModel = null;
      } else if (parsed) {
        pasteUi.promptEchoNotice = false;
        pasteUi.reviewModel = mapScanToReviewItemsV6(parsed, a.coffee);
      } else {
        pasteUi.promptEchoNotice = false;
        pasteUi.reviewModel = { items: [], unclear: [], sourceUrls: [], unparsed: true };
      }
      paintReviewOnly();
    }

    var taEl = S.h('textarea', {
      class: 'bt-ce-paste-ta',
      rows: '4',
      placeholder: 'Paste AI JSON reply (from ChatGPT, Claude, Gemini, or Perplexity), raw bag label text, or a BT share code here...',
      'aria-label': 'Paste AI lookup reply or coffee bag text',
      value: pasteUi.rawText,
      oninput: function (e) { runParseOnRaw(e.target.value); }
    });

    function provBadgeEl(prov) {
      if (prov === 'photo') return S.h('span', { class: 'bt-ce-badge is-good', text: '[Bag Photo]' });
      if (prov === 'web') return S.h('span', { class: 'bt-ce-badge is-sci', text: '[Official Roaster Web]' });
      if (prov === 'code') return S.h('span', { class: 'bt-ce-badge is-gold', text: '[Shared Code]' });
      if (prov === 'text') return S.h('span', { class: 'bt-ce-badge', text: '[Parsed Label]' });
      return S.h('span', { class: 'bt-ce-badge is-sci', text: '[AI Verified]' });
    }

    function applyCheckedFields() {
      var rm = pasteUi.reviewModel;
      if (!rm || !Array.isArray(rm.items) || !rm.items.length) return;
      var checkedItems = rm.items.filter(function (it) { return !!it.checked; });
      if (!checkedItems.length) {
        S.toastSafe('Check at least one field to apply.');
        return;
      }

      var shouldSyncPrice = false;
      checkedItems.forEach(function (it) {
        if (!it.patch) return;
        Object.keys(it.patch).forEach(function (pk) {
          if (pk === '_syncPriceLedger') {
            if (it.patch[pk]) shouldSyncPrice = true;
          } else {
            a.coffee[pk] = it.patch[pk];
          }
        });
      });

      a.coffee.scanned = 'yes';
      a.coffee.scannedFrom = rm.sourceKind || 'scan_v6';
      a.coffee.from_bag_photo = rm.fromBagPhoto || [];
      a.coffee.from_official_web = rm.fromOfficialWeb || [];
      a.coffee.source_urls = rm.sourceUrls || [];
      a.coffee.unclear = rm.unclear || [];
      a.coffee.id = 'cf_' + Date.now();
      a.coffee._v64Touched = 'yes';
      a.coffee.answered = getMissingRequiredFields(a.coffee).length === 0 ? 'yes' : '';
      ceUi.validationPromptOpen = false;
      ceUi.pulseFieldKey = '';
      a.attempt = 0;
      a.recipeLocked = false;
      a.dialNote = null;
      a.cupBrew = null;
      a.freshCoffeeMode = false;
      if (a.brew) {
        a.brew.actualSecs = null;
        a.brew.actualFromTimer = false;
      }
      try {
        if (typeof window !== 'undefined' && window.BTBrewStudio && typeof window.BTBrewStudio.resetTimerSession === 'function') {
          window.BTBrewStudio.resetTimerSession();
        }
        if (typeof window !== 'undefined' && window.BTTasteStep && typeof window.BTTasteStep.resetSession === 'function') {
          window.BTTasteStep.resetSession();
        }
      } catch (_) {}

      if (shouldSyncPrice) {
        syncBagPriceToLedger(a.coffee);
      }

      pasteUi.rawText = '';
      pasteUi.reviewModel = null;
      S.haptic('celebrate');
      S.saveDraftSafe();
      S.closeSheetSafe();
      S.rerenderSafe();
      S.notifyChromeSafe();

      var extras = [];
      if (a.coffee.roasterGuide) extras.push('Roaster Guide ready on Step 3');
      if (shouldSyncPrice) extras.push('Bag synced to Cellar');
      S.toastSafe('Applied ' + checkedItems.length + ' verified fields to ' + (a.coffee.name || 'your coffee') + (extras.length ? ' · ' + extras.join(' · ') : ''));
    }

    function paintReviewOnly() {
      reviewHost.textContent = '';

      if (pasteUi.promptEchoNotice) {
        reviewHost.appendChild(S.h('div', { class: 'bt-ce-unclear-box' },
          S.h('b', { text: 'Lookup Prompt Ready on Your Clipboard!' }),
          S.h('span', { text: 'Paste that prompt into ChatGPT, Claude, or Gemini (with a bag photo or coffee name), copy the JSON reply it gives you, and paste that reply above.' })
        ));
        return;
      }

      var rm = pasteUi.reviewModel;
      if (!rm) {
        reviewHost.appendChild(S.h('div', { class: 'bt-ce-subwell' },
          S.h('div', { class: 'bt-ce-eyebrow', text: 'Works With 4 Formats Automatically' }),
          S.h('span', { style: 'font-size:12.5px;color:var(--ink-secondary);line-height:1.4', text: '1) AI JSON reply (from ChatGPT, Claude, Gemini, or Perplexity) · 2) Legacy AI JSON · 3) Copied roaster webpage or bag label text · 4) Friend BT share codes.' })
        ));
        return;
      }

      if (rm.unparsed || !rm.items.length) {
        reviewHost.appendChild(S.h('div', { class: 'bt-ce-unclear-box' },
          S.h('b', { text: 'No structured coffee fields detected yet' }),
          S.h('span', { text: 'Paste the full JSON block from ChatGPT / Claude / Gemini (starting with "{" and ending with "}"), or include origin, roast, or process words.' })
        ));
        return;
      }

      /* Top summary & Select All / Uncheck All controls */
      var checkedCount = rm.items.filter(function (x) { return x.checked; }).length;
      reviewHost.appendChild(S.h('div', { class: 'bt-ce-card-hd' },
        S.h('div', { style: 'display:flex;align-items:center;gap:6px;flex-wrap:wrap' },
          S.iconEl('check-seal', { size: 16 }),
          S.h('b', { style: 'font-size:13.5px', text: 'Review Extracted Fields (' + checkedCount + ' of ' + rm.items.length + ' selected)' })
        ),
        S.h('div', { style: 'display:flex;gap:6px' },
          S.h('button', {
            type: 'button',
            class: 'bt-ce-link-btn',
            text: checkedCount === rm.items.length ? 'Uncheck All' : 'Check All',
            onclick: function () {
              var nextVal = checkedCount !== rm.items.length;
              rm.items.forEach(function (it) { it.checked = nextVal; });
              paintReviewOnly();
            }
          })
        )
      ));

      /* Unclear[] Warning Banner */
      if (rm.unclear && rm.unclear.length) {
        reviewHost.appendChild(S.h('div', { class: 'bt-ce-unclear-box' },
          S.h('div', { style: 'display:flex;align-items:center;gap:6px;font-weight:800' },
            S.iconEl('alert-triangle', { size: 15 }),
            S.h('span', { text: 'Not Listed on Bag or Official Web (Left Unfilled — Never Guessed):' })
          ),
          S.h('span', { text: rm.unclear.join(', ') })
        ));
      }

      /* Per-Field Checkbox List */
      var listEl = S.h('div', { class: 'bt-ce-review-list', role: 'group', 'aria-label': 'Extracted coffee fields' });
      rm.items.forEach(function (it) {
        var cb = S.h('input', {
          type: 'checkbox',
          checked: !!it.checked,
          'aria-label': 'Include ' + it.label,
          onchange: function (e) {
            it.checked = !!e.target.checked;
            paintReviewOnly();
          }
        });
        var row = S.h('label', { class: 'bt-ce-review-row' + (it.checked ? ' is-checked' : '') },
          cb,
          S.h('div', { class: 'bt-ce-review-main' },
            S.h('div', { class: 'bt-ce-review-lbl' },
              S.h('span', { text: it.label }),
              provBadgeEl(it.provenance)
            ),
            S.h('div', { class: 'bt-ce-review-val', text: it.display }),
            it.replaces ? S.h('div', { class: 'bt-ce-review-diff', text: 'Replaces current: ' + it.replaces }) : null,
            it.warn ? S.h('div', { class: 'bt-ce-review-diff', text: it.warn }) : null
          )
        );
        listEl.appendChild(row);
      });
      reviewHost.appendChild(listEl);

      /* Official Source URLs if returned */
      if (rm.sourceUrls && rm.sourceUrls.length) {
        reviewHost.appendChild(S.h('div', { class: 'bt-ce-subwell' },
          S.h('div', { class: 'bt-ce-eyebrow', text: 'Verified Official Sources' }),
          S.h('div', { style: 'display:flex;flex-direction:column;gap:4px;font-size:12px' },
            rm.sourceUrls.map(function (u) {
              return S.h('a', {
                href: u,
                target: '_blank',
                rel: 'noopener noreferrer',
                style: 'color:var(--science);word-break:break-all;font-weight:600',
                text: u
              });
            })
          )
        ));
      }

      /* Primary Apply CTA */
      reviewHost.appendChild(S.h('button', {
        type: 'button',
        class: 'bt-ce-cta-primary',
        onclick: applyCheckedFields
      },
        S.h('span', null,
          S.h('span', { text: 'Apply to Coffee →' }),
          S.h('span', { class: 'bt-ce-cta-sub', text: checkedCount + ' verified field' + (checkedCount === 1 ? '' : 's') + ' selected' })
        ),
        S.iconEl('check-seal', { size: 19 })
      ));
    }

    root.appendChild(S.h('div', { class: 'bt-ce-sheet-topbar' },
      S.h('button', {
        type: 'button',
        class: 'bt-ce-back-btn',
        onclick: closeOrBackFromCoffeeModal
      }, S.iconEl('chevron-left', { size: 15 }), S.h('span', { text: '← Back' })),
      S.h('div', { style: 'display:flex;gap:6px;flex-wrap:wrap' },
        S.h('button', {
          type: 'button',
          class: 'bt-ce-chip is-compact',
          onclick: function () {
            var q = pasteUi.prefillQuery || [a.coffee.roaster, a.coffee.name].filter(Boolean).join(' — ');
            copyTextRobust(buildScanPromptV6Safe(q), function (ok) {
              S.toastSafe(ok ? 'AI Lookup Prompt copied! Paste into ChatGPT, Claude, or Gemini.' : 'Could not access clipboard automatically.');
            });
          }
        }, S.iconEl('copy', { size: 14 }), S.h('span', { text: 'Copy Prompt' })),
        S.h('button', {
          type: 'button',
          class: 'bt-ce-chip is-compact is-active',
          onclick: function () {
            if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.readText === 'function') {
              navigator.clipboard.readText().then(function (clip) {
                if (clip) {
                  if (isPromptEchoText(clip)) {
                    pasteUi.promptEchoNotice = true;
                    paintReviewOnly();
                  } else {
                    taEl.value = clip;
                    runParseOnRaw(clip);
                  }
                } else {
                  taEl.focus();
                }
              }).catch(function () {
                taEl.focus();
                S.toastSafe('Tap inside the box and choose Paste.');
              });
            } else {
              taEl.focus();
            }
          }
        }, S.iconEl('paste-card', { size: 15 }), S.h('span', { text: 'Read Clipboard' }))
      )
    ));

    root.appendChild(S.h('div', null,
      S.h('div', { class: 'bt-ce-kicker', text: 'Step 2 of 2 · Universal Smart Paste' }),
      S.h('p', { class: 'bt-ce-sub', text: 'Paste the AI reply below — review & uncheck any field before applying.' })
    ));

    root.appendChild(taEl);
    root.appendChild(reviewHost);
    paintReviewOnly();

    if (payload.autoTryClipboard && !pasteUi.rawText && typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.readText === 'function') {
      try {
        navigator.clipboard.readText().then(function (clip) {
          if (!taEl.isConnected || pasteUi.rawText || taEl.value) return;
          var clipTrim = String(clip || '').trim();
          if (!clipTrim) return;
          if (isPromptEchoText(clipTrim)) {
            pasteUi.promptEchoNotice = true;
            paintReviewOnly();
          } else {
            taEl.value = clipTrim;
            runParseOnRaw(clipTrim);
          }
        }).catch(function () {});
      } catch (_) {}
    }

    setTimeout(function () {
      if (!pasteUi.reviewModel && taEl && typeof taEl.focus === 'function') {
        try { taEl.focus({ preventScroll: true }); } catch (_) {}
      }
    }, 60);

    return root;
  }

  function openPasteModal(prefillQuery) {
    if (prefillQuery != null) pasteUi.prefillQuery = String(prefillQuery);
    S.openSheetSafe('ai-paste', { prefillQuery: prefillQuery, autoTryClipboard: true }, { title: 'Paste & Review AI Reply', detent: 'full' });
  }

  /* -------------------- 7. Step 1 (`1. Coffee`) Inline Capture Studio -------------------- */
  var ceUi = {
    mode: 'quick', /* 'quick' (default) | 'guided' */
    guidedIdx: 0,  /* 0..4 across 5 Beanjamin cards */
    aiQuery: '',
    showPromptDisclosure: false,
    freshRolloverKey: '',
    freshRolloverIso: '',
    freshRolloverFreeze: false,
    freshDaysBack: 2,
    selectedArchetype: '',
    showRoastAliases: false,
    showRoastMeter: false,
    showExactElev: false,
    showDatePicker: false,
    datePickerTarget: 'roast', /* 'roast' | 'frozen' */
    calViewYear: 0,
    calViewMonth: -1,
    originSearch: '',
    varietalSearch: '',
    customNoteDraft: '',
    justLockedNotes: Object.create(null),
    validationPromptOpen: false,
    pulseFieldKey: ''
  };

  var REQUIRED_FIELDS_7 = [
    { key: 'name',      num: 1, shortLabel: 'Coffee & Roaster', label: '1. Coffee & Roaster', cardId: 'bt-step1-card-1', anchorId: 'bt-field-name',      guidedIdx: 0 },
    { key: 'roast',     num: 2, shortLabel: 'Roast Level',      label: '2. Roast Level',      cardId: 'bt-step1-card-1', anchorId: 'bt-field-roast',     guidedIdx: 1 },
    { key: 'process',   num: 3, shortLabel: 'Process',          label: '3. Process',          cardId: 'bt-step1-card-2', anchorId: 'bt-field-process',   guidedIdx: 2 },
    { key: 'origin',    num: 4, shortLabel: 'Origin',           label: '4. Origin',           cardId: 'bt-step1-card-2', anchorId: 'bt-field-origin',    guidedIdx: 3 },
    { key: 'date',      num: 5, shortLabel: 'Roast Date',       label: '5. Roast Date',       cardId: 'bt-step1-card-3', anchorId: 'bt-field-date',      guidedIdx: 4 },
    { key: 'elevation', num: 6, shortLabel: 'Elevation',        label: '6. Elevation',        cardId: 'bt-step1-card-2', anchorId: 'bt-field-elevation', guidedIdx: 3 },
    { key: 'notes',     num: 7, shortLabel: 'Bag Flavors',      label: '7. Bag Flavors',      cardId: 'bt-step1-card-4', anchorId: 'bt-field-notes',     guidedIdx: 4 }
  ];

  var COFFEE_FIELD_HELP_DB = {
    name: {
      key: 'name',
      pill: 'Name',
      title: 'Coffee & Roaster Name',
      subtitle: 'Identifies your bag & links repeat Gold Recipes in your Vault.',
      icon: 'fresh-bag',
      dontKnowLabel: 'Don\'t Know / Unlabeled',
      what: 'Look at the front label: the Roaster is the company that roasted the beans (e.g. Onyx, Sey, La Cabra, Local Cafe), and the Coffee Name is the lot, farm, washing station, or blend title (e.g. Worka Chelbesa, Tropical Weather).',
      bullets: [
        ['Single-Origin Bags', 'Usually named after the farm, producer, or washing station.'],
        ['Blend / Espresso Bags', 'Usually carry a house title (e.g. Monarch, Hair Bender, Breakfast Blend).'],
        ['Unlabeled / Gift Jar?', 'Tap "Don\'t Know / Unlabeled" to log cleanly as Unlabeled Coffee.']
      ],
      brew: 'Links every brew of this bag together in your Living Bean Vault. Once you lock a winning Gold Recipe on Step 5, picking this coffee name again automatically restores your exact dialed-in grind, water temp, and ratio.',
      prefs: 'Groups cups by roaster and lot in your Preferences hub so you can see which roasters you rate highest. Tapping "Don\'t Know / Unlabeled" keeps mystery bags from creating fake roaster entries.'
    },
    roast: {
      key: 'roast',
      pill: 'Roast',
      title: 'Roast Level (Very Light → Dark)',
      subtitle: 'Controls bean porosity, solubility & target water temperature.',
      icon: 'flame-wave',
      dontKnowLabel: 'Don\'t Know',
      what: 'Describes how long and hot the green coffee seeds were roasted. Check the bag for words like Light, Filter, Nordic, Medium-Light, Omni, City+, Medium, Espresso, or Dark — or compare bean color from cinnamon tan to deep dark chocolate.',
      bullets: [
        ['Very Light / Light', 'Dense cell walls, zero oil on surface · Sparkling fruit, citrus & florals.'],
        ['Med-Light / Medium', 'Balanced caramelization · Ripe berry, stone fruit, milk chocolate & round body.'],
        ['Med-Dark / Dark', 'Porous, brittle structure · Bittersweet cocoa, roasted nuts & smoky richness.']
      ],
      brew: 'Major recipe driver! Dense Light roasts need hotter water (94–98 °C / 201–208 °F) and longer ratios (1:16.5–1:17) to unlock sweetness. Porous Dark roasts extract fast and burn easily, so Step 3 lowers water temp (84–89 °C / 183–192 °F) and tightens ratio (1:14.5–1:15.5) for syrupy cocoa without bitterness.',
      prefs: 'Roast Level is the #1 driver in Preferences & "Will I Love This Bag?". If your bag omits roast level, tapping "Don\'t Know" brews safely at a balanced middle temp while marking roast as Unknown so it NEVER pollutes your Light vs Dark preference score!'
    },
    process: {
      key: 'process',
      pill: 'Process',
      title: 'Post-Harvest Process',
      subtitle: 'How the coffee cherry fruit was removed before drying.',
      icon: 'cherry-washed',
      dontKnowLabel: 'Don\'t Know',
      what: 'Every coffee bean starts as a seed inside a sweet red cherry. "Process" tells you how much fruit stayed on the seed while it dried in the sun:',
      bullets: [
        ['Washed (Wet)', 'All fruit pulp washed off cleanly before drying → crisp, tea-clean clarity.'],
        ['Natural (Dry)', 'Dried inside the whole ripe berry → jammy blueberry, strawberry & plush body.'],
        ['Honey', 'Skin removed, sticky fruit mucilage left on (White → Red → Black Honey) → sweet stone fruit.'],
        ['Wet-Hulled', 'Traditional Sumatra style (Giling Basah) → deep cocoa, warm spice & heavy body.'],
        ['Anaerobic / Co-Ferment', 'Fermented in sealed oxygen-free tanks → vivid tropical fruit & winey aromatics.']
      ],
      brew: 'Natural, Honey, and Anaerobic processes create micro-porous cell walls that dissolve faster than Washed beans. Step 3 lowers water temperature by 1.0–2.5 °C (2–4.5 °F) and softens pour agitation so fruit sweetness stays silky instead of harsh or boozy.',
      prefs: 'Many coffee lovers strongly prefer either crisp Washed lots or fruity Natural/Anaerobic lots. Tapping "Don\'t Know" uses neutral physics today and protects your Process preference ranking from guesswork!'
    },
    origin: {
      key: 'origin',
      pill: 'Origin',
      title: 'Origin Country & Region',
      subtitle: 'Terroir, soil minerals, genetics & regional flavor signature.',
      icon: 'origin-globe',
      dontKnowLabel: 'Don\'t Know / Blend',
      what: 'Look for a country (Ethiopia, Colombia, Kenya, Guatemala, Brazil...) and region (Yirgacheffe, Huila, Nyeri, Antigua, Boquete) — or "Blend" when roasters combine multiple countries for balance.',
      bullets: [
        ['East Africa (Ethiopia, Kenya, Rwanda)', 'Floral jasmine, peach, bergamot & vibrant berry brightness.'],
        ['Andes & Central America (Colombia, Guatemala, Costa Rica, Panama)', 'Sweet orange, cane sugar, stone fruit, honey & cocoa balance.'],
        ['Brazil & Indonesia', 'Creamy hazelnut, milk/dark chocolate, low sharpness & full body.']
      ],
      brew: 'Certain origins (especially dense high-grown Ethiopian landraces) shatter into more microscopic fines inside your grinder. Step 3 applies a subtle coarser grind guard so your paper filter drains cleanly without stalling!',
      prefs: 'Powers your Origin Map and regional match % inside "Will I Love This Bag?". Brewing a mystery blend or unlisted country? Tap "Don\'t Know / Blend" so no guessed country skews your Taste DNA.'
    },
    elevation: {
      key: 'elevation',
      pill: 'Elevation',
      title: 'Growing Elevation / Altitude',
      subtitle: 'Mountain night coolness shapes bean hardness & sugar density.',
      icon: 'refract-prism',
      dontKnowLabel: 'Don\'t Know',
      what: 'Printed on specialty bags in meters ("masl" = meters above sea level, e.g. 1,850 masl) or feet (e.g. 6,000 ft). Cooler mountain nights slow down cherry ripening, packing more complex sugars and organic acids into a harder, denser seed:',
      bullets: [
        ['Low (<1,200 m / <3,900 ft)', 'Softer, more open bean structure · Smooth chocolate, nut & low acidity.'],
        ['Medium (1,200–1,600 m / 3,900–5,250 ft)', 'Classic sweet caramel, almond & gentle fruit balance.'],
        ['High (1,600–1,950 m / 5,250–6,400 ft)', 'Hard, dense highland beans · Juicy citrus, stone fruit & high sweetness.'],
        ['Ultra-High (2,000 m+ / 6,550+ ft)', 'Ultra-dense mountain lots · Sparkling florals & layered fruit complexity.']
      ],
      brew: 'Higher-elevation dense beans resist water penetration, so Step 3 nudges water temp +0.5 to +1.0 °C higher for full sweetness; lower-elevation softer beans brew sweeter a touch cooler.',
      prefs: 'Tracks your favorite Altitude Band (Low Smooth vs Mid Balanced vs High-Altitude Bright) in Preferences & "Will I Love This Bag?". Tap "Don\'t Know" when unlisted on the bag!'
    },
    varietal: {
      key: 'varietal',
      pill: 'Varietal',
      title: 'Plant Varietal / Cultivar (Optional)',
      subtitle: 'Botanical coffee tree genetics — just like wine grape varieties.',
      icon: 'spark-star',
      dontKnowLabel: 'Don\'t Know / Not on Bag',
      what: 'Just like Honeycrisp vs Granny Smith apples or Pinot Noir vs Cabernet grapes, Arabica coffee has distinct plant varieties printed on specialty bags (optional — many bags omit this):',
      bullets: [
        ['Gesha / Pink Bourbon / Sidra', 'Prized aromatic varieties famed for jasmine, bergamot & tropical peach.'],
        ['SL28 / SL34 / Ethiopian Heirloom', 'Vibrant blackcurrant, citrus & floral tea complexity.'],
        ['Bourbon / Typica / Caturra / Catuai / Castillo', 'Classic sweet caramel, red apple & chocolate backbone.'],
        ['Pacamara / Maragogipe', 'Giant "elephant" beans with lush texture and stone-fruit aromatics.']
      ],
      brew: 'Delicate florals like Gesha shine at slightly longer filter ratios (1:16.8–1:17.2), while tiny dense landraces vs giant Pacamara beans fracture differently in your grinder.',
      prefs: 'Optional bonus insight — helps surface favorite cultivars in your Vault & Taste Profile without penalizing bags that don\'t list varietals.'
    },
    date: {
      key: 'date',
      pill: 'Roast Date',
      title: 'Printed Roast Date & -18 °C Cryo-Freeze',
      subtitle: 'Tracks CO2 rest gas so Step 3 sets the exact right bloom time.',
      icon: 'calendar-date',
      dontKnowLabel: 'Don\'t Know / Not on Bag',
      what: 'Check the back, bottom gusset, or bag clip for "Roasted On" (ignore "Best By" dates, which are 6–12 months later!). Freshly roasted coffee traps CO2 gas inside its pores that gradually escapes over 1–4 weeks.',
      bullets: [
        ['Resting (Days 0–4 post-roast)', 'High trapped CO2 gas pushes water away if brewed too fast.'],
        ['Peak Window (Days 5–26)', 'Sweet spot where excess gas has settled and aromatics shine brightest.'],
        ['Frozen at -18 °C (0 °F)', 'Sealing rested beans in the freezer slows aging ~12x — grind straight from frozen!']
      ],
      brew: 'Directly sets your Step 3 Bloom Time & Grind! Very fresh beans (Days 0–4) get an extended 42–50s bloom pour so CO2 bubbles escape cleanly; older beans get a crisp 25s bloom and slightly finer grind to boost body.',
      prefs: 'Helps reveal your ideal post-roast rest day for light vs medium roasts. Grocery or gift bag with no "Roasted On" stamp? Tap "Don\'t Know / Not on Bag" for a safe 35s bloom baseline!'
    },
    notes: {
      key: 'notes',
      pill: 'Bag Flavors',
      title: 'Printed Bag Flavor Notes',
      subtitle: 'Roaster tasting cues — kept blind on Step 5, matched in Preferences!',
      icon: 'palate',
      dontKnowLabel: 'Don\'t Know / None Listed',
      what: 'The 2–4 flavor words printed on the front of the bag (e.g. "Jasmine, White Peach, Honey" or "Dark Cocoa, Roasted Almond"). Specialty coffee has zero added flavoring — these describe natural aroma compounds inside the roasted bean!',
      bullets: [
        ['Floral & Bright Notes', 'Jasmine, Bergamot, Lemon Tea, White Peach, Berry → high clarity & sparkle.'],
        ['Sweet & Nutty Notes', 'Caramel, Honey, Brown Sugar, Milk Chocolate, Almond → round comfort.'],
        ['Deep Roast Notes', 'Dark Cocoa, Molasses, Baker\'s Spice → plush body & low acidity.']
      ],
      brew: 'Kept hidden under a tap-to-reveal blind foil during Step 5 Tasting so you judge your cup with zero bias first — then revealed to compare what you tasted vs what the bag promised!',
      prefs: 'Directly trains your Flavor Note DNA in Preferences and powers flavor matching in "Will I Love This Bag?"! If your bag lists no tasting notes, tap "Don\'t Know / None Listed" so your flavor profile stays 100% clean.'
    }
  };

  function makeInlineCheckSvg(sizePx) {
    var sz = sizePx || 13;
    var sp = S.h('span', { class: 'bt-ce-inline-chk', 'aria-hidden': 'true' });
    sp.innerHTML = '<svg viewBox="0 0 16 16" width="' + sz + '" height="' + sz + '" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.8 8.4L6.3 11.9L13.2 4.5"/></svg>';
    return sp;
  }

  function makeFieldHelpBtn(fieldKey, compactLabel) {
    var meta = COFFEE_FIELD_HELP_DB[fieldKey] || COFFEE_FIELD_HELP_DB.name;
    return S.h('button', {
      type: 'button',
      class: 'bt-ce-help-btn',
      'data-field-help': fieldKey,
      'aria-label': 'What does ' + meta.title + ' mean?',
      title: 'What this field means & how it affects your brew and preferences',
      onclick: function (ev) {
        if (ev && ev.stopPropagation) ev.stopPropagation();
        S.haptic('tick');
        openCoffeeFieldHelp(fieldKey);
      }
    },
      S.h('span', { class: 'bt-ce-help-q', text: '?' }),
      S.h('span', { text: compactLabel || 'What\'s this?' })
    );
  }

  function getFieldStatus(c, key) {
    c = c || {};
    if (key === 'name') {
      if (c.nameUnsure === 'yes') return { state: 'unsure', valueText: 'Don\'t Know' };
      var rStr = String(c.roaster || '').trim();
      var nStr = String(c.name || '').trim();
      if (rStr || nStr) {
        return { state: 'answered', valueText: [rStr, nStr].filter(Boolean).join(' · ') };
      }
      return { state: 'needed', valueText: 'Needed' };
    }
    if (key === 'roast') {
      if (c.roastUnsure === 'yes' || c.roast_unknown === 'yes' || c.roast === 'unknown') {
        return { state: 'unsure', valueText: 'Don\'t Know' };
      }
      var rStop = S.ROAST_STOPS.find(function (x) { return x.key === c.roast; });
      if (rStop) {
        return { state: 'answered', valueText: rStop.label, colorHex: rStop.hex };
      }
      return { state: 'needed', valueText: 'Needed' };
    }
    if (key === 'process') {
      if (c.processUnsure === 'yes' || c.process_unknown === 'yes' || c.process === 'unknown') {
        return { state: 'unsure', valueText: 'Don\'t Know' };
      }
      if (c.process && String(c.process).trim() && c.process !== 'unknown') {
        return { state: 'answered', valueText: formatProcessDisplay(c.process) };
      }
      return { state: 'needed', valueText: 'Needed' };
    }
    if (key === 'origin') {
      if (c.originUnsure === 'yes' || c.origin_unknown === 'yes' || String(c.origin || '').trim().toLowerCase() === 'unknown') {
        return { state: 'unsure', valueText: c.blend === 'blend' ? 'Don\'t Know / Blend' : 'Don\'t Know' };
      }
      if (String(c.origin || '').trim()) {
        return { state: 'answered', valueText: String(c.origin).trim() };
      }
      return { state: 'needed', valueText: 'Needed' };
    }
    if (key === 'date') {
      if (c.dateUnsure === 'yes' || c.date_unknown === 'yes') {
        return { state: 'unsure', valueText: 'Don\'t Know' };
      }
      if (c.is_frozen === 'yes' || parseIsoParts(c.roast_date)) {
        var dAgo = parseIsoParts(c.roast_date) ? S.daysSinceIso(c.roast_date) : null;
        var dtTxt = c.is_frozen === 'yes'
          ? ('Frozen -18 °C' + (parseIsoParts(c.roast_date) ? ' · ' + formatHumanIsoDate(c.roast_date) : ''))
          : (formatHumanIsoDate(c.roast_date) + (dAgo != null ? ' (' + (dAgo === 0 ? 'Today' : dAgo + 'd') + ')' : ''));
        return { state: 'answered', valueText: dtTxt };
      }
      return { state: 'needed', valueText: 'Needed' };
    }
    if (key === 'elevation') {
      if (c.elevUnsure === 'yes' || c.elev_unknown === 'yes' || c.density === 'unknown') {
        return { state: 'unsure', valueText: 'Don\'t Know' };
      }
      var hasM = isFinite(+c.elevation_m) && +c.elevation_m > 0;
      var hasBand = ['low', 'mid', 'high', 'very-high'].indexOf(c.density) >= 0;
      if (hasM || hasBand) {
        var em = hasM ? Math.round(+c.elevation_m) : null;
        var bName = c.density === 'very-high' ? 'Ultra-High' : c.density === 'high' ? 'High' : c.density === 'mid' ? 'Medium' : c.density === 'low' ? 'Low' : '';
        return { state: 'answered', valueText: em ? (em.toLocaleString('en-US') + ' m' + (bName ? ' · ' + bName : '')) : bName };
      }
      return { state: 'needed', valueText: 'Needed' };
    }
    if (key === 'notes') {
      if (c.notesUnsure === 'yes' || c.notes_unknown === 'yes') {
        return { state: 'unsure', valueText: 'Don\'t Know' };
      }
      var nList = parseBagNotesList(c.bag_notes);
      if (nList.length > 0) {
        var nTxt = nList.slice(0, 3).join(', ') + (nList.length > 3 ? ' +' + (nList.length - 3) : '');
        return { state: 'answered', valueText: nTxt };
      }
      return { state: 'needed', valueText: 'Needed' };
    }
    if (key === 'varietal') {
      if (c.varietalUnsure === 'yes') {
        return { state: 'unsure', valueText: 'Don\'t Know' };
      }
      if (String(c.varietal || '').trim()) {
        return { state: 'answered', valueText: String(c.varietal).trim() };
      }
      return { state: 'optional', valueText: 'Optional · Add' };
    }
    return { state: 'needed', valueText: 'Needed' };
  }

  function isFieldAnswered(c, key) {
    var st = getFieldStatus(c, key);
    return st.state === 'answered' || st.state === 'unsure';
  }

  function getMissingRequiredFields(c) {
    return REQUIRED_FIELDS_7.filter(function (f) { return !isFieldAnswered(c, f.key); });
  }

  function setFieldDontKnow(c, key, turnOn) {
    if (!c) return;
    c._v64Touched = 'yes';
    var on = turnOn !== false;
    if (key === 'name') {
      c.nameUnsure = on ? 'yes' : '';
      c.roasterUnsure = on ? 'yes' : '';
      if (on) {
        c.name = 'Unlabeled Coffee';
        c.roaster = '';
      } else if (c.name === 'Unlabeled Coffee') {
        c.name = '';
      }
    } else if (key === 'roast') {
      c.roastUnsure = on ? 'yes' : '';
      c.roast_unknown = on ? 'yes' : '';
      if (on) {
        c.roast = 'unknown';
        c.ground_agtron = '';
        c.bean_agtron = '';
      } else if (c.roast === 'unknown') {
        c.roast = '';
      }
    } else if (key === 'process') {
      c.processUnsure = on ? 'yes' : '';
      c.process_unknown = on ? 'yes' : '';
      if (on) {
        c.process = 'unknown';
        c.process_sub = '';
      } else if (c.process === 'unknown') {
        c.process = '';
      }
    } else if (key === 'origin') {
      c.originUnsure = on ? 'yes' : '';
      c.origin_unknown = on ? 'yes' : '';
      if (on) {
        c.origin = '';
        ceUi.originSearch = '';
      }
    } else if (key === 'date') {
      c.dateUnsure = on ? 'yes' : '';
      c.date_unknown = on ? 'yes' : '';
      if (on) {
        c.roast_date = '';
        c.is_frozen = '';
        c.frozen_date = '';
        ceUi.datePickerTarget = 'roast';
      }
    } else if (key === 'elevation') {
      c.elevUnsure = on ? 'yes' : '';
      c.elev_unknown = on ? 'yes' : '';
      if (on) {
        c.elevation_m = '';
        c.elevText = '';
        c.density = 'unknown';
      } else if (c.density === 'unknown') {
        c.density = '';
      }
    } else if (key === 'notes') {
      c.notesUnsure = on ? 'yes' : '';
      c.notes_unknown = on ? 'yes' : '';
      if (on) {
        c.bag_notes = '';
        ceUi.customNoteDraft = '';
      }
    } else if (key === 'varietal') {
      c.varietalUnsure = on ? 'yes' : '';
      if (on) {
        c.varietal = '';
        ceUi.varietalSearch = '';
      }
    }
  }

  function fillRemainingAsDontKnow(c) {
    if (!c) return 0;
    var missing = getMissingRequiredFields(c);
    missing.forEach(function (f) {
      setFieldDontKnow(c, f.key, true);
    });
    ceUi.validationPromptOpen = false;
    ceUi.pulseFieldKey = '';
    return missing.length;
  }

  function buildCoffeeFieldHelpSheet(payload) {
    payload = payload || {};
    var a = S.getApp();
    a.coffee = a.coffee || {};
    var c = a.coffee;
    var activeKey = String(payload.field || 'roast').toLowerCase();
    if (!COFFEE_FIELD_HELP_DB[activeKey]) activeKey = 'roast';

    var root = S.h('div', { class: 'bt-ce-help-sheet', id: 'bt-coffee-field-help-sheet' });
    var FIELD_ORDER_8 = ['name', 'roast', 'process', 'origin', 'elevation', 'date', 'notes', 'varietal'];

    function paint() {
      root.textContent = '';
      var meta = COFFEE_FIELD_HELP_DB[activeKey] || COFFEE_FIELD_HELP_DB.roast;
      var curSt = getFieldStatus(c, activeKey);

      root.appendChild(S.h('div', { class: 'bt-ce-sheet-topbar' },
        S.h('button', {
          type: 'button',
          class: 'bt-ce-back-btn',
          onclick: closeOrBackFromCoffeeModal
        }, S.iconEl('chevron-left', { size: 15 }), S.h('span', { text: 'Back to Coffee' })),
        S.epistemicBadgeEl('verified_physics')
      ));

      /* 8-Field Quick Switcher Pills */
      root.appendChild(S.h('div', { class: 'bt-ce-chips-scroll', role: 'tablist', 'aria-label': 'Coffee Field Guides' },
        FIELD_ORDER_8.map(function (fk) {
          var fm = COFFEE_FIELD_HELP_DB[fk];
          var on = fk === activeKey;
          return S.h('button', {
            type: 'button',
            role: 'tab',
            class: 'bt-ce-chip is-compact' + (on ? ' is-active' : ''),
            'aria-selected': String(on),
            'aria-pressed': String(on),
            text: fm.pill,
            onclick: function () {
              activeKey = fk;
              S.haptic('tick');
              try {
                if (typeof BTSheet !== 'undefined' && BTSheet && typeof BTSheet.setTitle === 'function') {
                  BTSheet.setTitle(fm.title);
                }
              } catch (_) {}
              paint();
            }
          });
        })
      ));

      /* Compact Subtitle & Live Field Status Strip */
      root.appendChild(S.h('div', { class: 'bt-ce-help-hero' },
        S.h('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap' },
          S.h('div', { style: 'display:inline-flex;align-items:center;gap:7px;flex:1;min-width:180px' },
            S.iconEl(meta.icon, { size: 18 }),
            S.h('span', { style: 'font-size:12.5px;font-weight:600;color:var(--ink-secondary);line-height:1.35', text: meta.subtitle })
          ),
          S.h('span', {
            class: 'bt-ce-field-state is-' + curSt.state,
            text: curSt.state === 'answered' ? ('Current: ' + curSt.valueText) : (curSt.state === 'unsure' ? 'Marked Don\'t Know' : (curSt.state === 'optional' ? 'Optional' : 'Needed'))
          })
        )
      ));

      /* 1. Where to Find It & What It Means */
      var ulEl = null;
      if (Array.isArray(meta.bullets) && meta.bullets.length) {
        ulEl = S.h('ul', { class: 'bt-ce-help-bullets' },
          meta.bullets.map(function (b) {
            return S.h('li', null, S.h('b', { text: b[0] + ': ' }), S.h('span', { text: b[1] }));
          })
        );
      }
      root.appendChild(S.h('section', { class: 'bt-ce-help-sec' },
        S.h('span', { class: 'bt-ce-help-sec-kicker', text: '1. Where to Find It & What It Means' }),
        S.h('p', { class: 'bt-ce-help-sec-body', text: meta.what }),
        ulEl
      ));

      /* 2. How It Changes Your Brew Recipe */
      root.appendChild(S.h('section', { class: 'bt-ce-help-sec is-brew' },
        S.h('span', { class: 'bt-ce-help-sec-kicker', text: '2. How It Changes Your Step 3 Brew Recipe' }),
        S.h('p', { class: 'bt-ce-help-sec-body', text: meta.brew })
      ));

      /* 3. How It Sharpens Preferences & "Will I Love This Bag?" */
      root.appendChild(S.h('section', { class: 'bt-ce-help-sec is-prefs' },
        S.h('span', { class: 'bt-ce-help-sec-kicker', text: '3. Preferences & "Will I Love This Bag?" (Why "Don\'t Know" Matters)' }),
        S.h('p', { class: 'bt-ce-help-sec-body', text: meta.prefs })
      ));

      /* Bottom Quick Actions */
      var isCurUnsure = curSt.state === 'unsure';
      root.appendChild(S.h('div', { style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;padding-top:2px' },
        S.h('button', {
          type: 'button',
          class: 'bt-ce-dontknow-pill' + (isCurUnsure ? ' is-active' : ''),
          style: 'min-height:44px;width:100%',
          'aria-pressed': String(isCurUnsure),
          onclick: function () {
            setFieldDontKnow(c, activeKey, !isCurUnsure);
            S.haptic('snap');
            S.saveDraftSafe();
            S.notifyChromeSafe();
            S.closeSheetSafe();
            S.rerenderSafe();
          }
        },
          isCurUnsure ? makeInlineCheckSvg(13) : null,
          S.h('span', { text: isCurUnsure ? 'Marked as Don\'t Know (Tap to Undo)' : ('Set "' + meta.pill + '" to Don\'t Know') })
        ),
        S.h('button', {
          type: 'button',
          class: 'bt-ce-cta-primary',
          style: 'min-height:44px;padding:8px 14px;justify-content:center',
          onclick: closeOrBackFromCoffeeModal
        }, S.h('span', { text: 'Got It' }))
      ));
    }

    paint();
    return root;
  }

  function openCoffeeFieldHelp(fieldKey) {
    var k = String(fieldKey || 'roast').toLowerCase();
    var meta = COFFEE_FIELD_HELP_DB[k] || COFFEE_FIELD_HELP_DB.roast;
    S.openSheetSafe('coffee-field-help', { field: k }, { title: meta.title, detent: 'half' });
  }

  /* ---------- Shared Bag Flavor Notes Parser, Locker & Tray Widget ---------- */
  function parseBagNotesList(rawStr) {
    var seen = Object.create(null);
    var out = [];
    String(rawStr || '')
      .split(/[,;]+/)
      .forEach(function (part) {
        var clean = S.stripEmojis(String(part || '').trim()).replace(/\s{2,}/g, ' ');
        if (!clean) return;
        var low = clean.toLowerCase();
        if (seen[low]) return;
        seen[low] = true;
        out.push(clean);
      });
    return out;
  }

  function formatFlavorNoteToken(tok) {
    var clean = S.stripEmojis(String(tok || '').trim()).replace(/\s{2,}/g, ' ');
    if (!clean) return '';
    var low = clean.toLowerCase();
    for (var i = 0; i < WCR_FLAVOR_CHIPS.length; i++) {
      if (WCR_FLAVOR_CHIPS[i].toLowerCase() === low) return WCR_FLAVOR_CHIPS[i];
    }
    if (clean === low) {
      return clean.replace(/\b([a-z])/g, function (_, ch) { return ch.toUpperCase(); });
    }
    return clean;
  }

  function lockNotesIntoCoffee(c, rawInputStr) {
    if (!c) return { added: [], all: [] };
    var cur = parseBagNotesList(c.bag_notes);
    var seen = Object.create(null);
    cur.forEach(function (n) { seen[n.toLowerCase()] = true; });
    var added = [];
    String(rawInputStr || '')
      .split(/[,;/•|]+/)
      .forEach(function (piece) {
        var formatted = formatFlavorNoteToken(piece);
        if (!formatted) return;
        var low = formatted.toLowerCase();
        if (!seen[low]) {
          seen[low] = true;
          cur.push(formatted);
          added.push(formatted);
          ceUi.justLockedNotes[low] = Date.now();
        } else {
          ceUi.justLockedNotes[low] = Date.now();
        }
      });
    c.bag_notes = cur.join(', ');
    if (cur.length > 0) {
      c.notesUnsure = '';
      c.notes_unknown = '';
      c._v64Touched = 'yes';
    }
    return { added: added, all: cur };
  }

  function flushPendingStep1Drafts(c) {
    if (!c) return false;
    var domVal = '';
    if (typeof document !== 'undefined') {
      var activeInp = document.querySelector('input[data-bt-bag-note-input="1"]');
      if (activeInp && activeInp.value) domVal = String(activeInp.value).trim();
    }
    var pending = domVal || String(ceUi.customNoteDraft || '').trim();
    if (!pending) return false;
    lockNotesIntoCoffee(c, pending);
    ceUi.customNoteDraft = '';
    if (typeof document !== 'undefined') {
      var inps = document.querySelectorAll('input[data-bt-bag-note-input="1"]');
      for (var i = 0; i < inps.length; i++) inps[i].value = '';
    }
    S.saveDraftSafe();
    return true;
  }

  function buildBagFlavorNotesWidget(c, opts) {
    opts = opts || {};
    var onSync = typeof opts.onSync === 'function' ? opts.onSync : function () { S.saveDraftSafe(); };
    var maxQuickChips = opts.maxQuickChips || WCR_FLAVOR_CHIPS.length;

    var wrap = S.h('div', { class: 'bt-ce-notes-widget', style: 'display:flex;flex-direction:column;gap:8px;width:100%;min-width:0' });
    var trayHost = S.h('div');
    var quickChipsHost = S.h('div', { class: 'bt-ce-chips', role: 'group', 'aria-label': 'Quick Bag Flavor Suggestions' });

    function makeCheckSvgSpan() {
      var sp = S.h('span', { class: 'bt-ce-locked-check', 'aria-hidden': 'true' });
      sp.innerHTML = '<svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5L6.4 11.8L13 4.6"/></svg>';
      return sp;
    }

    function removeLockedNote(noteName) {
      var low = String(noteName || '').toLowerCase();
      var next = parseBagNotesList(c.bag_notes).filter(function (x) { return x.toLowerCase() !== low; });
      c.bag_notes = next.join(', ');
      delete ceUi.justLockedNotes[low];
      S.haptic('tick');
      paintTrayAndChips();
      onSync();
    }

    function paintTrayAndChips() {
      var curList = parseBagNotesList(c.bag_notes);
      var nowTs = Date.now();
      trayHost.textContent = '';

      var trayEl = S.h('div', {
        class: 'bt-ce-locked-tray' + (curList.length ? '' : ' is-empty'),
        'data-bt-locked-flavors-tray': '1'
      },
        S.h('div', { class: 'bt-ce-locked-hd' },
          S.h('span', { class: 'bt-ce-locked-title' },
            S.iconEl('check-seal', { size: 14 }),
            S.h('span', { text: 'Locked Bag Flavors (' + curList.length + ')' })
          ),
          curList.length >= 2 ? S.h('button', {
            type: 'button',
            class: 'bt-ce-link-btn',
            text: 'Clear All',
            onclick: function () {
              c.bag_notes = '';
              ceUi.justLockedNotes = Object.create(null);
              S.haptic('tick');
              paintTrayAndChips();
              onSync();
            }
          }) : null
        )
      );

      if (curList.length) {
        var listEl = S.h('div', { class: 'bt-ce-locked-list', role: 'list', 'aria-label': 'Locked bag flavor notes' });
        curList.forEach(function (noteTxt) {
          var low = noteTxt.toLowerCase();
          var isRecent = !!(ceUi.justLockedNotes[low] && (nowTs - ceUi.justLockedNotes[low]) < 1500);
          var rmBtn = S.h('button', {
            type: 'button',
            class: 'bt-ce-locked-rm',
            'data-remove-note': noteTxt,
            'aria-label': 'Remove ' + noteTxt,
            text: '\u00D7',
            onclick: function (ev) {
              if (ev && ev.stopPropagation) ev.stopPropagation();
              removeLockedNote(noteTxt);
            }
          });
          listEl.appendChild(S.h('span', {
            class: 'bt-ce-locked-pill' + (isRecent ? ' is-just-locked' : ''),
            'data-locked-note': noteTxt,
            role: 'listitem',
            title: 'Locked on bag: ' + noteTxt + ' (tap \u00D7 to remove)',
            onclick: function () { removeLockedNote(noteTxt); }
          },
            makeCheckSvgSpan(),
            S.h('span', { class: 'bt-ce-locked-txt', text: noteTxt }),
            rmBtn
          ));
        });
        trayEl.appendChild(listEl);
      } else {
        trayEl.appendChild(S.h('div', {
          class: 'bt-ce-locked-empty',
          text: c.notesUnsure === 'yes'
            ? 'Marked as Don\'t Know / None Listed — neutral palate match (type or tap a note below anytime to replace)'
            : 'No bag notes locked yet — type below, tap quick notes, or tap "Don\'t Know / None Listed"'
        }));
      }
      trayHost.appendChild(trayEl);

      quickChipsHost.textContent = '';
      WCR_FLAVOR_CHIPS.slice(0, maxQuickChips).forEach(function (fn) {
        var isPicked = curList.some(function (x) { return x.toLowerCase() === fn.toLowerCase(); });
        quickChipsHost.appendChild(S.h('button', {
          type: 'button',
          class: 'bt-ce-chip is-compact' + (isPicked ? ' is-active' : ''),
          'aria-pressed': String(isPicked),
          text: fn,
          onclick: function () {
            if (isPicked) {
              removeLockedNote(fn);
            } else {
              lockNotesIntoCoffee(c, fn);
              S.haptic('tick');
              paintTrayAndChips();
              onSync();
            }
          }
        }));
      });
    }

    var customNoteInp = S.h('input', {
      type: 'text',
      'data-bt-bag-note-input': '1',
      value: ceUi.customNoteDraft || '',
      placeholder: 'e.g. Papaya, Jasmine (Enter to lock)',
      'aria-label': 'Type printed bag flavor notes',
      oninput: function (e) {
        ceUi.customNoteDraft = e.target.value;
      },
      onkeydown: function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          commitDraftFromInput(true);
        }
      },
      onblur: function () {
        commitDraftFromInput(false);
      }
    });

    function commitDraftFromInput(keepFocus) {
      var raw = (customNoteInp && customNoteInp.value != null ? String(customNoteInp.value) : String(ceUi.customNoteDraft || '')).trim();
      if (!raw) return false;
      lockNotesIntoCoffee(c, raw);
      ceUi.customNoteDraft = '';
      if (customNoteInp) customNoteInp.value = '';
      S.haptic('snap');
      paintTrayAndChips();
      onSync();
      if (keepFocus && customNoteInp && typeof customNoteInp.focus === 'function') {
        try { customNoteInp.focus({ preventScroll: true }); } catch (_) {}
      }
      return true;
    }

    var lockBtn = S.h('button', {
      type: 'button',
      class: 'bt-ce-lock-btn',
      'data-bt-lock-note-btn': '1',
      onclick: function () {
        if (!commitDraftFromInput(true) && customNoteInp) {
          try { customNoteInp.focus({ preventScroll: true }); } catch (_) {}
        }
      }
    }, S.h('span', { text: '+ Lock Note' }));

    paintTrayAndChips();
    wrap.appendChild(trayHost);
    wrap.appendChild(S.h('div', { class: 'bt-ce-note-entry' },
      S.h('div', { class: 'bt-ce-spotlight', style: 'flex:1;min-width:0' }, customNoteInp),
      lockBtn
    ));
    wrap.appendChild(quickChipsHost);
    return wrap;
  }

  /* ---------- Sleek Interactive Month Calendar Roast Date & Cryo Picker ---------- */
  function buildRoastCalendarControl(cfg) {
    cfg = cfg || {};
    var c = cfg.coffee || {};
    var ui = cfg.uiState || ceUi;
    var onSync = typeof cfg.onSync === 'function' ? cfg.onSync : function () { S.saveDraftSafe(); };
    var showDetailLine = cfg.showDetailLine !== false;
    var showHeaderBadge = cfg.showHeaderBadge !== false;
    var headerTitle = cfg.headerTitle || 'Printed Roast Date & -18 °C Cryo-Freeze';
    var kickerOverride = cfg.kickerText || '';

    if (cfg.defaultOpen && !ui._calInitOpened) {
      ui.showDatePicker = true;
      ui._calInitOpened = true;
    }

    var todayIso = S.isoDaysAgo(0);
    var todayParts = parseIsoParts(todayIso) || { y: new Date().getFullYear(), m: new Date().getMonth(), d: new Date().getDate() };

    function ensureMonthInitialized(focusIso) {
      var ref = parseIsoParts(focusIso || c.roast_date || todayIso) || todayParts;
      if (!ui.calViewYear || ui.calViewMonth == null || ui.calViewMonth < 0) {
        ui.calViewYear = ref.y;
        ui.calViewMonth = ref.m;
      }
    }
    ensureMonthInitialized(c.roast_date || todayIso);

    var wrap = S.h('div', { class: 'bt-ce-date-wrap' });
    var hdSlot = S.h('div');
    var barSlot = S.h('div', { class: 'bt-ce-date-bar' });
    var popoverSlot = S.h('div');
    var detailSlot = S.h('div');

    function stepMonth(delta) {
      var m = ui.calViewMonth + delta;
      var y = ui.calViewYear;
      while (m < 0) { m += 12; y -= 1; }
      while (m > 11) { m -= 12; y += 1; }
      if (y > todayParts.y || (y === todayParts.y && m > todayParts.m)) {
        y = todayParts.y;
        m = todayParts.m;
      }
      ui.calViewYear = y;
      ui.calViewMonth = m;
      S.haptic('tick');
      paintCalendarOnly();
    }

    function selectDateIso(isoVal, targetMode) {
      var mode = targetMode || ui.datePickerTarget || 'roast';
      c._v64Touched = 'yes';
      if (mode === 'frozen') {
        c.frozen_date = isoVal;
        c.is_frozen = 'yes';
        c.dateUnsure = '';
        c.date_unknown = '';
        if (!c.roast_date || c.roast_date > isoVal) {
          c.roast_date = isoVal;
        }
      } else {
        c.roast_date = isoVal;
        c.dateUnsure = '';
        c.date_unknown = '';
        if (c.is_frozen === 'yes' && c.frozen_date && c.frozen_date < isoVal) {
          c.frozen_date = todayIso;
        }
      }
      var p = parseIsoParts(isoVal);
      if (p) {
        ui.calViewYear = p.y;
        ui.calViewMonth = p.m;
      }
      S.haptic('tick');
      paintAllInPlace();
      onSync(isoVal);
    }

    function markDateUnsure(toggleMode) {
      var nextUnsure = toggleMode ? !c.dateUnsure : true;
      c._v64Touched = 'yes';
      c.dateUnsure = nextUnsure ? 'yes' : '';
      c.date_unknown = c.dateUnsure;
      if (c.dateUnsure) {
        c.roast_date = '';
        c.is_frozen = '';
        c.frozen_date = '';
        ui.datePickerTarget = 'roast';
      }
      S.haptic('tick');
      paintAllInPlace();
      onSync('');
    }

    function paintHeaderAndTrigger() {
      var freshObj = computeSmrkeFreshnessStatus(c);
      hdSlot.textContent = '';
      if (showHeaderBadge) {
        hdSlot.appendChild(S.h('div', { class: 'bt-ce-card-hd' },
          S.h('span', { class: 'bt-ce-eyebrow', text: headerTitle }),
          S.h('span', { class: 'bt-ce-badge ' + freshObj.tone, text: freshObj.label })
        ));
      }

      barSlot.textContent = '';
      var hasRoastDate = !c.dateUnsure && !!parseIsoParts(c.roast_date);
      var dAgo = hasRoastDate ? S.daysSinceIso(c.roast_date) : null;
      var mainTxt = c.dateUnsure
        ? 'Not Printed on Bag'
        : (hasRoastDate ? formatHumanIsoDate(c.roast_date) : 'Pick Printed Roast Date');
      var subTxt = c.dateUnsure
        ? 'Safe 35s bloom baseline · Tap to pick a date'
        : (hasRoastDate
          ? ((dAgo === 0 ? 'Roasted Today' : (dAgo === 1 ? '1d ago' : dAgo + 'd ago')) + ' · ' + (freshObj.shortState || 'Peak Window'))
          : 'Tap to open month calendar');

      var isRoastOpen = !!ui.showDatePicker && (ui.datePickerTarget || 'roast') === 'roast';
      var triggerBtn = S.h('button', {
        type: 'button',
        class: 'bt-ce-date-trigger',
        'data-roast-date-trigger': '1',
        'data-bt-roast-picker-trigger': '1',
        'aria-expanded': String(!!ui.showDatePicker),
        'aria-label': 'Printed Roast Date: ' + mainTxt + ' (' + subTxt + ')',
        onclick: function () {
          if (ui.showDatePicker && (ui.datePickerTarget || 'roast') === 'roast') {
            ui.showDatePicker = false;
          } else {
            ui.showDatePicker = true;
            ui.datePickerTarget = 'roast';
            var p = parseIsoParts(c.roast_date || todayIso) || todayParts;
            ui.calViewYear = p.y;
            ui.calViewMonth = p.m;
          }
          S.haptic('tick');
          paintAllInPlace();
        }
      },
        S.h('span', { class: 'bt-ce-date-ico' }, S.iconEl('calendar-date', { size: 17 })),
        S.h('span', { class: 'bt-ce-date-copy' },
          S.h('span', { class: 'bt-ce-date-kicker', text: kickerOverride || 'Printed Roast Date' }),
          S.h('span', { class: 'bt-ce-date-main', text: mainTxt }),
          S.h('span', { class: 'bt-ce-date-sub', text: subTxt })
        ),
        S.h('span', { class: 'bt-ce-date-chev' }, S.iconEl('chevron-down', { size: 16 }))
      );
      barSlot.appendChild(triggerBtn);

      var pillsWrap = S.h('div', { class: 'bt-ce-date-pills' },
        S.h('button', {
          type: 'button',
          class: 'bt-ce-dontknow-pill' + (c.dateUnsure ? ' is-active' : ''),
          'data-dont-know': 'date',
          'aria-pressed': String(!!c.dateUnsure),
          onclick: function () { markDateUnsure(true); }
        }, c.dateUnsure ? makeInlineCheckSvg(12) : null, S.h('span', { text: 'Don\'t Know / Not on Bag' })),
        S.h('button', {
          type: 'button',
          class: 'bt-ce-chip is-compact' + (c.is_frozen === 'yes' ? ' is-active' : ''),
          'aria-pressed': String(c.is_frozen === 'yes'),
          onclick: function () {
            c._v64Touched = 'yes';
            c.is_frozen = c.is_frozen === 'yes' ? '' : 'yes';
            if (c.is_frozen === 'yes') {
              c.dateUnsure = '';
              c.date_unknown = '';
              if (!c.roast_date) c.roast_date = S.isoDaysAgo(7);
              if (!c.frozen_date) c.frozen_date = todayIso;
            } else {
              c.frozen_date = '';
              if (ui.datePickerTarget === 'frozen') ui.datePickerTarget = 'roast';
            }
            S.haptic('tick');
            paintAllInPlace();
            onSync(c.roast_date || '');
          }
        }, S.iconEl('cryo-snowflake', { size: 14 }), S.h('span', { text: 'Frozen at -18 °C' }))
      );

      if (c.is_frozen === 'yes') {
        var fzHuman = formatHumanIsoDate(c.frozen_date || todayIso) || 'Today';
        var isFzOpen = !!ui.showDatePicker && ui.datePickerTarget === 'frozen';
        pillsWrap.appendChild(S.h('button', {
          type: 'button',
          class: 'bt-ce-chip is-compact' + (isFzOpen ? ' is-active' : ''),
          'data-bt-frozen-picker-trigger': '1',
          'aria-expanded': String(isFzOpen),
          onclick: function () {
            if (ui.showDatePicker && ui.datePickerTarget === 'frozen') {
              ui.showDatePicker = false;
            } else {
              ui.showDatePicker = true;
              ui.datePickerTarget = 'frozen';
              var pf = parseIsoParts(c.frozen_date || todayIso) || todayParts;
              ui.calViewYear = pf.y;
              ui.calViewMonth = pf.m;
            }
            S.haptic('tick');
            paintAllInPlace();
          }
        }, S.iconEl('calendar-date', { size: 13 }), S.h('span', { text: 'Frozen On: ' + fzHuman }), S.iconEl('chevron-down', { size: 13 })));
      }
      barSlot.appendChild(pillsWrap);

      detailSlot.textContent = '';
      if (showDetailLine) {
        detailSlot.appendChild(S.h('span', {
          style: 'font-size:11.5px;color:var(--ink-secondary);line-height:1.35',
          text: freshObj.detail
        }));
      }
    }

    function paintCalendarOnly() {
      popoverSlot.textContent = '';
      if (!ui.showDatePicker) return;

      var freshObj = computeSmrkeFreshnessStatus(c);
      var w = freshObj.window || { ready: 5, peakEnd: 26 };
      var target = (c.is_frozen === 'yes' && ui.datePickerTarget === 'frozen') ? 'frozen' : 'roast';
      var activeIso = target === 'frozen' ? (c.frozen_date || todayIso) : (c.dateUnsure ? '' : (c.roast_date || ''));

      var vy = ui.calViewYear || todayParts.y;
      var vm = (ui.calViewMonth != null && ui.calViewMonth >= 0) ? ui.calViewMonth : todayParts.m;
      var firstDow = new Date(vy, vm, 1).getDay();
      var daysInMo = new Date(vy, vm + 1, 0).getDate();
      var atCurrentMonth = (vy === todayParts.y && vm === todayParts.m);

      var calEl = S.h('div', {
        class: 'bt-ce-cal-popover',
        'data-bt-roast-calendar': '1',
        role: 'region',
        'aria-label': target === 'frozen' ? 'Select Frozen On Date' : 'Select Printed Roast Date'
      });

      if (c.is_frozen === 'yes') {
        calEl.appendChild(S.h('div', { class: 'bt-ce-cal-mode-tabs', role: 'tablist', 'aria-label': 'Calendar target date' },
          S.h('button', {
            type: 'button',
            'aria-pressed': String(target === 'roast'),
            text: '1. Printed Roast Date' + (c.roast_date ? ' (' + formatHumanIsoDate(c.roast_date) + ')' : ''),
            onclick: function () {
              ui.datePickerTarget = 'roast';
              var pr = parseIsoParts(c.roast_date || todayIso) || todayParts;
              ui.calViewYear = pr.y; ui.calViewMonth = pr.m;
              S.haptic('tick');
              paintAllInPlace();
            }
          }),
          S.h('button', {
            type: 'button',
            'aria-pressed': String(target === 'frozen'),
            text: '2. Frozen On (' + (formatHumanIsoDate(c.frozen_date || todayIso) || 'Today') + ')',
            onclick: function () {
              ui.datePickerTarget = 'frozen';
              var pf = parseIsoParts(c.frozen_date || todayIso) || todayParts;
              ui.calViewYear = pf.y; ui.calViewMonth = pf.m;
              S.haptic('tick');
              paintAllInPlace();
            }
          })
        ));
      }

      calEl.appendChild(S.h('div', { class: 'bt-ce-cal-hd' },
        S.h('button', {
          type: 'button',
          class: 'bt-ce-cal-nav',
          'data-cal-nav': 'prev',
          'aria-label': 'Previous month',
          onclick: function () { stepMonth(-1); }
        }, S.iconEl('chevron-left', { size: 16 })),
        S.h('div', { class: 'bt-ce-cal-title-wrap' },
          S.h('div', { class: 'bt-ce-cal-title', text: _MONTHS_FULL[vm] + ' ' + vy }),
          S.h('div', {
            class: 'bt-ce-cal-subtitle',
            text: target === 'frozen'
              ? 'Tap the day this bag entered your -18 °C freezer'
              : 'Tap printed roast date · Future dates disabled'
          })
        ),
        S.h('div', { style: 'display:flex;align-items:center;gap:4px' },
          S.h('button', {
            type: 'button',
            class: 'bt-ce-cal-nav',
            'data-cal-nav': 'next',
            'aria-label': 'Next month',
            disabled: atCurrentMonth,
            onclick: function () { if (!atCurrentMonth) stepMonth(1); }
          }, S.iconEl('chevron-right', { size: 16 })),
          !cfg.hideDoneBtn ? S.h('button', {
            type: 'button',
            class: 'bt-ce-link-btn',
            text: 'Done',
            onclick: function () {
              ui.showDatePicker = false;
              S.haptic('tick');
              paintAllInPlace();
            }
          }) : null
        )
      ));

      calEl.appendChild(S.h('div', { class: 'bt-ce-cal-legend' },
        S.h('span', { class: 'bt-ce-cal-leg-item' },
          S.h('span', { class: 'bt-ce-cal-leg-swatch is-peak' }),
          S.h('span', {
            text: target === 'frozen'
              ? ('Ideal Freeze Window (Day ' + w.ready + '–' + w.peakEnd + ' post-roast)')
              : ('Peak Window Now (' + w.ready + '–' + w.peakEnd + 'd ago)')
          })
        ),
        target === 'roast' ? S.h('span', { class: 'bt-ce-cal-leg-item' },
          S.h('span', { class: 'bt-ce-cal-leg-swatch is-resting' }),
          S.h('span', { text: 'Resting (0–' + Math.max(0, w.ready - 1) + 'd ago)' })
        ) : null
      ));

      calEl.appendChild(S.h('div', { class: 'bt-ce-cal-weekdays', 'aria-hidden': 'true' },
        _WEEKDAYS_7.map(function (wd) { return S.h('span', { text: wd }); })
      ));

      var gridEl = S.h('div', { class: 'bt-ce-cal-grid', role: 'grid', 'aria-label': _MONTHS_FULL[vm] + ' ' + vy });
      for (var blank = 0; blank < firstDow; blank++) {
        gridEl.appendChild(S.h('span', { class: 'bt-ce-cal-empty', 'aria-hidden': 'true' }));
      }

      for (var dayNum = 1; dayNum <= daysInMo; dayNum++) {
        (function (d) {
          var cellIso = makeIsoFromParts(vy, vm, d);
          var isFuture = cellIso > todayIso;
          var beforeRoast = (target === 'frozen' && c.roast_date && cellIso < c.roast_date);
          var isDisabled = isFuture || beforeRoast;
          var isSelected = !isDisabled && activeIso === cellIso;
          var isToday = cellIso === todayIso;
          var isPeak = false;
          var isResting = false;

          if (!isDisabled) {
            if (target === 'roast') {
              var dAgoCell = daysBetweenIso(cellIso, todayIso);
              if (dAgoCell != null) {
                if (dAgoCell >= w.ready && dAgoCell <= w.peakEnd) isPeak = true;
                else if (dAgoCell >= 0 && dAgoCell < w.ready) isResting = true;
              }
            } else if (c.roast_date) {
              var dPostRoast = daysBetweenIso(c.roast_date, cellIso);
              if (dPostRoast != null && dPostRoast >= w.ready && dPostRoast <= w.peakEnd) isPeak = true;
            }
          }

          var cls = 'bt-ce-cal-day' +
            (isPeak ? ' is-peak' : '') +
            (isResting ? ' is-resting' : '') +
            (isToday ? ' is-today' : '') +
            (isSelected ? ' is-selected' : '');

          var ariaNote = isPeak ? ' (Peak Window)' : (isResting ? ' (Resting)' : '');
          gridEl.appendChild(S.h('button', {
            type: 'button',
            class: cls,
            'data-cal-day': String(d),
            'data-iso': cellIso,
            disabled: isDisabled,
            'aria-pressed': String(isSelected),
            'aria-label': formatHumanIsoDate(cellIso) + ariaNote,
            text: String(d),
            onclick: function () {
              if (!isDisabled) selectDateIso(cellIso, target);
            }
          }));
        })(dayNum);
      }
      calEl.appendChild(gridEl);

      var nativeDateInp = S.h('input', {
        type: 'date',
        class: 'bt-ce-cal-native',
        max: todayIso,
        min: (target === 'frozen' && c.roast_date) ? c.roast_date : '',
        value: activeIso,
        'aria-label': target === 'frozen' ? 'Type or pick frozen date' : 'Type or pick printed roast date',
        onchange: function (e) {
          var v = String(e.target.value || '').trim();
          if (v && v <= todayIso) selectDateIso(v, target);
        }
      });

      calEl.appendChild(S.h('div', { class: 'bt-ce-cal-foot' },
        S.h('div', { class: 'bt-ce-cal-shortcuts' },
          S.h('button', {
            type: 'button',
            class: 'bt-ce-chip is-compact' + (activeIso === todayIso ? ' is-active' : ''),
            'data-cal-shortcut': 'today',
            text: 'Today',
            onclick: function () { selectDateIso(todayIso, target); }
          }),
          S.h('button', {
            type: 'button',
            class: 'bt-ce-chip is-compact' + (activeIso === S.isoDaysAgo(1) ? ' is-active' : ''),
            'data-cal-shortcut': 'yesterday',
            text: 'Yesterday',
            onclick: function () { selectDateIso(S.isoDaysAgo(1), target); }
          }),
          target === 'roast' ? S.h('button', {
            type: 'button',
            class: 'bt-ce-chip is-compact' + (c.dateUnsure ? ' is-active' : ''),
            'data-cal-shortcut': 'unsure',
            text: 'Not Printed on Bag',
            onclick: function () { markDateUnsure(false); }
          }) : null
        ),
        S.h('label', { class: 'bt-ce-cal-native-wrap' },
          S.h('span', { text: 'Type year:' }),
          nativeDateInp
        )
      ));

      popoverSlot.appendChild(calEl);
    }

    function paintAllInPlace() {
      paintHeaderAndTrigger();
      paintCalendarOnly();
    }

    paintAllInPlace();
    wrap.appendChild(hdSlot);
    wrap.appendChild(barSlot);
    wrap.appendChild(popoverSlot);
    wrap.appendChild(detailSlot);
    return wrap;
  }

  function getAgtronToolMode() {
    try {
      if (typeof btToolMode === 'function') {
        var m = btToolMode('agtron');
        if (m) return m;
      }
      var a = S.getApp();
      var tm = a && a.prefs && a.prefs.toolModes;
      if (tm && (tm.agtron || tm.omni)) return tm.agtron || tm.omni;
    } catch (_) {}
    return 'optional';
  }

  function formatProcessDisplay(proc) {
    if (!proc || proc === 'unknown') return '';
    var map = {
      washed: 'Washed',
      natural: 'Natural',
      honey: 'Honey',
      'wet-hulled': 'Wet-Hulled',
      anaerobic: 'Anaerobic / Co-Ferment'
    };
    var k = String(proc).toLowerCase();
    if (map[k]) return map[k];
    return String(proc).replace(/-/g, ' ').replace(/\b\w/g, function (ch) { return ch.toUpperCase(); });
  }

  function formatActiveCoffeeSublabel(c) {
    c = c || {};
    var missing = getMissingRequiredFields(c);
    var parts = [];
    if (c.nameUnsure === 'yes') parts.push('Unlabeled Bag');
    else {
      if (c.roaster && String(c.roaster).trim()) parts.push(String(c.roaster).trim());
      if (c.name && String(c.name).trim()) parts.push(String(c.name).trim());
    }
    if (!parts.length && c.origin && String(c.origin).trim()) parts.push(String(c.origin).trim());
    var rObj = S.ROAST_STOPS.find(function (x) { return x.key === c.roast; });
    if (rObj) parts.push(rObj.label);
    else if (c.roastUnsure === 'yes' || c.roast === 'unknown') parts.push('Roast: Don\'t Know');
    if (c.process && c.process !== 'unknown') parts.push(formatProcessDisplay(c.process));
    else if (c.processUnsure === 'yes' || c.process === 'unknown') parts.push('Process: Don\'t Know');
    if (missing.length > 0) {
      return (7 - missing.length) + ' of 7 brew fields set · ' + missing.length + ' needed (or tap Don\'t Know)';
    }
    if (!parts.length) return 'All 7 brew & preference fields ready';
    return parts.join(' · ');
  }

  function buildTopCoffeeGuideCard(c, handlers) {
    c = c || {};
    handlers = handlers || {};
    var onJump = typeof handlers.onJump === 'function' ? handlers.onJump : function () {};
    var onFillRemaining = typeof handlers.onFillRemaining === 'function' ? handlers.onFillRemaining : null;
    var onFillAndContinue = typeof handlers.onFillAndContinue === 'function' ? handlers.onFillAndContinue : null;

    var missing = getMissingRequiredFields(c);
    var answeredCount = 7 - missing.length;
    var isAllReady = missing.length === 0;
    var pct = Math.round((answeredCount / 7) * 100);

    var TILES_8 = [
      { key: 'name',      lbl: '1. Coffee & Roaster' },
      { key: 'roast',     lbl: '2. Roast Level' },
      { key: 'process',   lbl: '3. Process' },
      { key: 'origin',    lbl: '4. Origin' },
      { key: 'date',      lbl: '5. Roast Date' },
      { key: 'elevation', lbl: '6. Elevation' },
      { key: 'notes',     lbl: '7. Bag Flavors' },
      { key: 'varietal',  lbl: '8. Varietal' }
    ];

    var gridEl = S.h('div', { class: 'bt-ce-guide-grid', role: 'group', 'aria-label': 'Your Coffee Guide live summary' });
    TILES_8.forEach(function (t) {
      var st = getFieldStatus(c, t.key);
      var valChildren = [];
      if (st.state === 'answered') {
        valChildren.push(makeInlineCheckSvg(12));
        if (st.colorHex) {
          valChildren.push(S.h('span', { class: 'bt-ce-roast-dot', style: 'background:' + st.colorHex }));
        }
        valChildren.push(S.h('span', { class: 'bt-ce-guide-tile-val-txt', text: st.valueText }));
      } else if (st.state === 'unsure') {
        valChildren.push(makeInlineCheckSvg(12));
        valChildren.push(S.h('span', { class: 'bt-ce-guide-tile-val-txt', text: st.valueText }));
      } else if (st.state === 'optional') {
        valChildren.push(S.h('span', { class: 'bt-ce-guide-tile-val-txt', text: st.valueText }));
      } else {
        valChildren.push(S.h('span', { class: 'bt-ce-guide-tile-val-txt', text: 'Needed →' }));
      }

      gridEl.appendChild(S.h('button', {
        type: 'button',
        class: 'bt-ce-guide-tile is-' + st.state,
        'data-guide-jump': t.key,
        'aria-label': t.lbl + ': ' + st.valueText + ' (tap to jump to input)',
        onclick: function () {
          S.haptic('tick');
          onJump(t.key);
        }
      },
        S.h('span', { class: 'bt-ce-guide-tile-lbl', text: t.lbl }),
        S.h('span', { class: 'bt-ce-guide-tile-val' }, valChildren)
      ));
    });

    var footEl = S.h('div', { class: 'bt-ce-guide-foot' },
      S.h('span', {
        class: 'bt-ce-guide-hint',
        text: isAllReady
          ? 'All 7 brew & preference fields answered — tap any tile to edit.'
          : 'Tap any tile to jump straight to that field, or set unknown items in 1 tap:'
      }),
      !isAllReady && onFillRemaining ? S.h('button', {
        type: 'button',
        id: 'bt-step1-fill-remaining-btn',
        class: 'bt-ce-fill-dontknow-btn',
        onclick: function () {
          S.haptic('snap');
          onFillRemaining();
        }
      }, S.h('span', { text: 'Set Remaining (' + missing.length + ') to "Don\'t Know"' })) : S.h('button', {
        type: 'button',
        class: 'bt-ce-link-btn',
        text: 'Bag X-Ray →',
        onclick: function () { flushPendingStep1Drafts(c); openCoffeeFactsSheet(); }
      })
    );

    var bannerInline = null;
    if (!isAllReady && ceUi.validationPromptOpen) {
      var missingNames = missing.map(function (m) { return m.shortLabel; }).join(', ');
      bannerInline = S.h('div', { class: 'bt-ce-req-banner', id: 'bt-step1-req-banner', role: 'alert' },
        S.h('div', { class: 'bt-ce-req-banner-title' },
          S.iconEl('alert-triangle', { size: 17 }),
          S.h('span', { text: 'Please pick a value or tap "Don\'t Know" for: ' + missingNames + ' — or tap below to continue now:' })
        ),
        onFillAndContinue ? S.h('button', {
          type: 'button',
          id: 'bt-step1-fill-unknown-continue-btn',
          class: 'bt-ce-req-escape-btn',
          onclick: function () {
            S.haptic('snap');
            onFillAndContinue();
          }
        }, S.h('span', { text: 'Fill Remaining as Don\'t Know & Continue →' })) : null
      );
    }

    var countChildren = [];
    if (isAllReady) countChildren.push(makeInlineCheckSvg(12));
    countChildren.push(S.h('span', { text: answeredCount + ' of 7 Answered' }));

    return S.h('section', {
      class: 'bt-ce-top-guide',
      id: 'bt-step1-top-guide',
      'aria-label': 'Your Coffee Passport Guide'
    },
      S.h('div', { class: 'bt-ce-guide-hd' },
        S.h('div', { class: 'bt-ce-guide-hd-row' },
          S.h('div', { class: 'bt-ce-guide-title-wrap' },
            S.h('span', { class: 'bt-ce-guide-kicker', text: 'Your Coffee Passport · Live Summary' }),
            S.h('h2', { class: 'bt-ce-guide-title', text: (c.name && c.nameUnsure !== 'yes') ? ([c.roaster, c.name].filter(Boolean).join(' · ')) : 'Your Coffee Guide' })
          ),
          S.h('span', { class: 'bt-ce-guide-count' + (isAllReady ? ' is-ready' : '') }, countChildren)
        ),
        S.h('div', { class: 'bt-ce-guide-prog', 'aria-hidden': 'true' },
          S.h('i', { class: 'bt-ce-guide-prog-fill', style: 'width:' + pct + '%' })
        )
      ),
      S.h('div', { class: 'bt-ce-guide-body' },
        gridEl,
        footEl,
        bannerInline
      )
    );
  }

  function renderStep1(containerEl, opts) {
    opts = opts || {};
    var inSheet = !!opts.inSheet;
    var a = S.getApp();
    a.coffee = a.coffee || {};
    var c = a.coffee;

    /* Guard: On a fresh untouched coffee (!c.answered && !c.scanned && !c._v64Touched),
       ensure zero silent fake defaults ('washed' / 'medium-light' / dateUnsure) pretend to be answered */
    if (!c.answered && !c.scanned && !c._v64Touched && a.freshCoffeeMode &&
        !String(c.name || '').trim() && !String(c.roaster || '').trim() &&
        !String(c.origin || '').trim() && !String(c.bag_notes || '').trim() &&
        !c.roast_date && !c.elevation_m) {
      c.roast = '';
      c.process = '';
      c.dateUnsure = '';
      c.roastUnsure = '';
      c.processUnsure = '';
      c.originUnsure = '';
      c.elevUnsure = '';
      c.notesUnsure = '';
      c.nameUnsure = '';
    }

    var initialCoffeeSig = [String(c.roaster || '').trim().toLowerCase(), String(c.name || '').trim().toLowerCase()].join('::');

    function resetToFreshBlankCoffee() {
      ceUi.customNoteDraft = '';
      ceUi.aiQuery = '';
      ceUi.freshRolloverKey = '';
      ceUi.selectedArchetype = '';
      ceUi.validationPromptOpen = false;
      ceUi.pulseFieldKey = '';
      var freshC = {
        id: 'cf_' + Date.now(),
        name: '',
        roaster: '',
        nameUnsure: '',
        roasterUnsure: '',
        origin: '',
        originUnsure: '',
        origin_unknown: '',
        process: '',
        processUnsure: '',
        process_unknown: '',
        roast: '',
        roastUnsure: '',
        roast_unknown: '',
        roast_date: '',
        dateUnsure: '',
        date_unknown: '',
        elevation_m: '',
        elevText: '',
        density: '',
        elevUnsure: '',
        elev_unknown: '',
        varietal: '',
        varietalUnsure: '',
        species: 'arabica',
        decaf: '',
        decaf_process: '',
        bag_notes: '',
        notesUnsure: '',
        notes_unknown: '',
        is_frozen: '',
        frozen_date: '',
        answered: ''
      };
      a.coffee = freshC;
      c = a.coffee;
      initialCoffeeSig = '::';
      a.attempt = 0;
      a.recipeLocked = false;
      a.dialNote = null;
      a.cupBrew = null;
      a.freshCoffeeMode = true;
      if (a.brew) {
        a.brew.actualSecs = null;
        a.brew.actualFromTimer = false;
      }
      try {
        if (typeof window !== 'undefined' && window.BTBrewStudio && typeof window.BTBrewStudio.resetTimerSession === 'function') {
          window.BTBrewStudio.resetTimerSession();
        }
        if (typeof window !== 'undefined' && window.BTTasteStep && typeof window.BTTasteStep.resetSession === 'function') {
          window.BTTasteStep.resetSession();
        }
      } catch (_) {}
      S.haptic('snap');
      S.saveDraftSafe();
      S.notifyChromeSafe();
      repaintAll();
      S.toastSafe('Cleared coffee fields — select values or tap Don\'t Know for each!');
    }

    var root = S.h('div', { class: 'bt-ce-root', id: inSheet ? 'bt-step1-sheet-studio' : 'bt-step1-coffee-studio' });
    if (containerEl && containerEl.nodeType === 1) {
      containerEl.textContent = '';
      containerEl.appendChild(root);
    }

    var topGuideSlot = S.h('div');
    var bottomReqBannerSlot = S.h('div');
    var ctaSubEl = S.h('span', { class: 'bt-ce-cta-sub', text: formatActiveCoffeeSublabel(c) });
    var liveCardSyncFns = [];

    function jumpToCoffeeField(fieldKey) {
      var reqDef = REQUIRED_FIELDS_7.find(function (f) { return f.key === fieldKey; }) ||
        { key: 'varietal', anchorId: 'bt-field-varietal', cardId: 'bt-step1-card-2', guidedIdx: 3 };
      ceUi.pulseFieldKey = fieldKey;
      if (ceUi.mode === 'guided') {
        flushPendingStep1Drafts(c);
        ceUi.guidedIdx = reqDef.guidedIdx != null ? reqDef.guidedIdx : 0;
        repaintAll();
        setTimeout(function () {
          var gCard = root.querySelector('.bt-ce-card-hero');
          if (gCard && typeof gCard.scrollIntoView === 'function') {
            gCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 30);
        return;
      }
      var targetEl = root.querySelector('#' + reqDef.anchorId) || root.querySelector('#' + reqDef.cardId);
      if (targetEl) {
        targetEl.classList.add('is-needs-answer');
        if (typeof targetEl.scrollIntoView === 'function') {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        var inp = targetEl.querySelector('input[type="text"]');
        if (inp && !isFieldAnswered(c, fieldKey) && typeof inp.focus === 'function') {
          setTimeout(function () {
            try { inp.focus({ preventScroll: true }); } catch (_) {}
          }, 220);
        }
        setTimeout(function () {
          if (targetEl && targetEl.classList) targetEl.classList.remove('is-needs-answer');
        }, 2000);
      }
    }

    function handleFillRemainingOnly() {
      flushPendingStep1Drafts(c);
      var cnt = fillRemainingAsDontKnow(c);
      S.saveDraftSafe();
      S.notifyChromeSafe();
      repaintAll();
      if (cnt > 0) {
        S.toastSafe('Set ' + cnt + ' unchecked field' + (cnt === 1 ? '' : 's') + ' to "Don\'t Know" — ready to choose your brewer!');
      }
    }

    function handleFillRemainingAndContinue() {
      flushPendingStep1Drafts(c);
      fillRemainingAsDontKnow(c);
      advanceToBrewer();
    }

    function paintValidationBannersOnly() {
      bottomReqBannerSlot.textContent = '';
      var missing = getMissingRequiredFields(c);
      if (missing.length === 0) {
        ceUi.validationPromptOpen = false;
        ceUi.pulseFieldKey = '';
        return;
      }
      if (!ceUi.validationPromptOpen) return;
      var missingNames = missing.map(function (m) { return m.shortLabel; }).join(', ');
      bottomReqBannerSlot.appendChild(S.h('div', { class: 'bt-ce-req-banner', role: 'alert' },
        S.h('div', { class: 'bt-ce-req-banner-title' },
          S.iconEl('alert-triangle', { size: 17 }),
          S.h('span', { text: 'Please pick a value or tap "Don\'t Know" for ' + missingNames + ' — or tap "Fill Remaining as Don\'t Know & Continue →"' })
        ),
        S.h('button', {
          type: 'button',
          class: 'bt-ce-req-escape-btn',
          onclick: handleFillRemainingAndContinue
        }, S.h('span', { text: 'Fill Remaining as Don\'t Know & Continue →' }))
      ));
    }

    function paintTopGuideOnly() {
      topGuideSlot.textContent = '';
      topGuideSlot.appendChild(buildTopCoffeeGuideCard(c, {
        onJump: jumpToCoffeeField,
        onFillRemaining: handleFillRemainingOnly,
        onFillAndContinue: handleFillRemainingAndContinue
      }));
    }

    function syncLiveSummariesOnly() {
      paintTopGuideOnly();
      paintValidationBannersOnly();
      liveCardSyncFns.forEach(function (fn) {
        try { fn(); } catch (_) {}
      });
      ctaSubEl.textContent = formatActiveCoffeeSublabel(c);
      S.saveDraftSafe();
      S.notifyChromeSafe();
    }

    function advanceToBrewer() {
      flushPendingStep1Drafts(c);
      var missing = getMissingRequiredFields(c);
      if (missing.length > 0) {
        ceUi.validationPromptOpen = true;
        ceUi.pulseFieldKey = missing[0].key;
        S.haptic('tick');
        S.saveDraftSafe();
        repaintAll();
        setTimeout(function () {
          jumpToCoffeeField(missing[0].key);
        }, 35);
        S.toastSafe('Please answer or tap "Don\'t Know" for ' + missing.map(function (m) { return m.shortLabel; }).join(', ') + '.');
        return;
      }

      ceUi.validationPromptOpen = false;
      ceUi.pulseFieldKey = '';
      c.answered = 'yes';
      c._v64Touched = 'yes';
      if (c.nameUnsure === 'yes' && !String(c.name || '').trim()) {
        c.name = 'Unlabeled Coffee';
      } else if (!String(c.name || '').trim() && String(c.roaster || '').trim()) {
        var rLbl0 = (S.ROAST_STOPS.find(function (r) { return r.key === c.roast; }) || {}).label || '';
        c.name = [String(c.roaster).trim(), c.origin ? c.origin.split(',')[0].trim() : 'Coffee', rLbl0].filter(Boolean).join(' · ');
      }
      if (c.roastUnsure === 'yes' || c.roast === 'unknown') {
        c.roast = 'unknown';
        c.roastUnsure = 'yes';
        c.roast_unknown = 'yes';
      }
      if (c.processUnsure === 'yes' || c.process === 'unknown') {
        c.process = 'unknown';
        c.processUnsure = 'yes';
        c.process_unknown = 'yes';
      }
      if (c.originUnsure === 'yes') {
        c.origin_unknown = 'yes';
      }
      if (c.elevUnsure === 'yes') {
        c.elev_unknown = 'yes';
      }
      if (c.notesUnsure === 'yes') {
        c.notes_unknown = 'yes';
      }
      var nextCoffeeSig = [String(c.roaster || '').trim().toLowerCase(), String(c.name || '').trim().toLowerCase()].join('::');
      if (a.freshCoffeeMode || (nextCoffeeSig !== initialCoffeeSig)) {
        c.id = 'cf_' + Date.now();
        a.attempt = 0;
        a.recipeLocked = false;
        a.dialNote = null;
      }
      a.freshCoffeeMode = false;
      a.cupBrew = null;
      if (a.brew) {
        a.brew.actualSecs = null;
        a.brew.actualFromTimer = false;
      }
      try {
        if (typeof window !== 'undefined' && window.BTBrewStudio) {
          if (typeof window.BTBrewStudio.resetTimerSession === 'function') window.BTBrewStudio.resetTimerSession();
          if (!a.recipeLocked && typeof window.BTBrewStudio.synthesizeForApp === 'function') {
            window.BTBrewStudio.synthesizeForApp(a, (a.brew && a.brew.method) || 'v60', { force: true });
          }
        }
        if (typeof window !== 'undefined' && window.BTTasteStep && typeof window.BTTasteStep.resetSession === 'function') {
          window.BTTasteStep.resetSession();
        }
      } catch (_) {}
      if ((isFinite(+c.price) && +c.price > 0) || (isFinite(+c.bag_weight_g) && +c.bag_weight_g > 0)) {
        syncBagPriceToLedger(c);
      }
      S.haptic('snap');
      S.saveDraftSafe();
      if (inSheet) S.closeSheetSafe();
      S.navGo('method');
      S.rerenderSafe();
    }

    function repaintAll() {
      root.textContent = '';
      liveCardSyncFns = [];
      var unifiedRecs = S.buildUnifiedCoffeesSafe();
      var openAndRecent = unifiedRecs.filter(function (r) { return !!r.openBag; })
        .concat(unifiedRecs.filter(function (r) { return !r.openBag; }))
        .slice(0, 12);
      var hasFilledCoffee = (7 - getMissingRequiredFields(c).length) > 0 || !!String(c.varietal || '').trim();

      /* Optional Brew Trail Bar ONLY if standalone and not already rendered by 05-tab-brew-studio.js */
      if (!inSheet && typeof document !== 'undefined' && !document.querySelector('.bt-trail-bar')) {
        var sh = S.getShell();
        if (sh && typeof sh.buildBrewTrailBar === 'function') {
          try {
            var tb = sh.buildBrewTrailBar('coffee');
            if (tb && tb.nodeType === 1) root.appendChild(tb);
          } catch (_) {}
        }
      }

      /* ==================== ABOVE-THE-FOLD BLOCK 1: COMPACT HEADER ==================== */
      root.appendChild(S.h('div', { class: 'bt-ce-head' },
        S.h('div', { style: 'min-width:0;flex:1' },
          S.h('div', { class: 'bt-ce-kicker', text: 'Step 1 of 5 · Coffee Studio' }),
          S.h('h1', { class: 'bt-ce-title', text: 'What are we brewing?' }),
          S.h('p', { class: 'bt-ce-sub', text: 'Answer the 7 brew fields below — or tap "Don\'t Know" when unlisted.' })
        ),
        S.h('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end' },
          hasFilledCoffee ? S.h('button', {
            type: 'button',
            id: 'bt-step1-new-blank-btn',
            class: 'bt-ce-vault-pill',
            title: 'Clear current fields and enter a brand-new coffee from scratch',
            onclick: function () { resetToFreshBlankCoffee(); }
          },
            S.iconEl('fresh-bag', { size: 15 }),
            S.h('span', { text: '+ New Coffee' })
          ) : null,
          S.h('button', {
            type: 'button',
            class: 'bt-ce-vault-pill',
            onclick: function () { flushPendingStep1Drafts(c); openMyCoffeesSheet(); }
          },
            S.iconEl('cellar', { size: 15 }),
            S.h('span', { text: 'My Coffees' + (unifiedRecs.length ? ' (' + unifiedRecs.length + ')' : '') })
          )
        )
      ));

      /* ==================== STANDOUT TOP COFFEE GUIDE (`#bt-step1-top-guide`) ==================== */
      paintTopGuideOnly();
      root.appendChild(topGuideSlot);

      /* ==================== ABOVE-THE-FOLD BLOCK 2: YOUR OPEN BAGS (~144px CARDS) ==================== */
      var bagsCard = S.h('section', { class: 'bt-ce-card bt-ce-card-compact', 'aria-label': 'Your Open Bags and Recent Coffees' },
        S.h('div', { class: 'bt-ce-card-hd' },
          S.h('span', { class: 'bt-ce-eyebrow', text: 'Your Open Bags & Recent Coffees' }),
          S.h('button', {
            type: 'button',
            class: 'bt-ce-link-btn',
            text: unifiedRecs.length ? ('All Vault (' + unifiedRecs.length + ') →') : 'Open Vault →',
            onclick: function () { flushPendingStep1Drafts(c); openMyCoffeesSheet(); }
          })
        )
      );

      if (openAndRecent.length) {
        var track = S.h('div', { class: 'bt-ce-bags-track' });
        var activeFreshRec = null;

        openAndRecent.forEach(function (rec, idx) {
          var rKey = rec.key || rec.coffee_id || ('bag_' + idx);
          var isSelected = !!(c.name && rec.name && c.name === rec.name && (c.roaster || '') === (rec.roaster || ''));
          var bag = rec.openBag;
          var ageDays = S.daysSinceIso(rec.roast_date || (bag && (bag.roast || bag.rdate)));
          var isFrozen = rec.is_frozen === 'yes' || rec.is_frozen === true;
          var badgeTxt = isFrozen ? 'Frozen -18 °C'
            : (ageDays != null ? ('Day ' + ageDays + (ageDays >= 4 && ageDays <= 24 ? ' · Peak' : '')) : (rec.lockedBrew ? 'Gold Locked' : 'Saved'));
          var badgeCls = isFrozen ? 'is-sci' : (ageDays != null && ageDays >= 4 && ageDays <= 24 ? 'is-good' : 'is-gold');
          var remTxt = (bag && bag.rem_g != null) ? (Math.round(+bag.rem_g) + 'g') : (rec.bestStars > 0 ? ((Math.round(rec.bestStars * 10) / 10) + '/5') : '');
          var rCol = S.roastColorFor(rec.roast || rec.ground_agtron);

          if (ceUi.freshRolloverKey === rKey) activeFreshRec = rec;

          track.appendChild(S.h('div', {
            class: 'bt-ce-bag-card' + (isSelected ? ' is-selected' : ''),
            style: '--bag-roast-col:' + rCol
          },
            S.h('div', { class: 'bt-ce-bag-top' },
              S.h('span', { class: 'bt-ce-badge ' + badgeCls, text: badgeTxt }),
              remTxt ? S.h('span', { class: 'bt-ce-bag-rem', text: remTxt }) : null
            ),
            S.h('div', { style: 'min-width:0' },
              S.h('div', { class: 'bt-ce-bag-roaster', text: rec.roaster || 'Specialty Roaster' }),
              S.h('div', { class: 'bt-ce-bag-name', text: rec.name || 'Unnamed Coffee' })
            ),
            S.h('div', { class: 'bt-ce-bag-meta' },
              S.h('span', { class: 'bt-ce-roast-dot', style: 'background:' + rCol }),
              S.h('span', { text: [rec.origin ? String(rec.origin).split(',')[0] : '', rec.process ? rec.process.replace(/-/g, ' ') : ''].filter(Boolean).join(' · ') || 'Ready to brew' })
            ),
            S.h('div', { class: 'bt-ce-bag-actions' },
              S.h('button', {
                type: 'button',
                class: 'bt-ce-bag-brew',
                text: 'Brew →',
                onclick: function () { flushPendingStep1Drafts(c); applySavedCoffeeSelection(rec, { targetRoute: 'method' }); }
              }),
              S.h('button', {
                type: 'button',
                class: 'bt-ce-bag-fresh',
                'aria-expanded': String(ceUi.freshRolloverKey === rKey),
                title: 'Opened a new bag of this same coffee? Pick new printed roast date while keeping your locked recipe!',
                text: 'Fresh Bag',
                onclick: function () {
                  if (ceUi.freshRolloverKey === rKey) {
                    ceUi.freshRolloverKey = '';
                  } else {
                    ceUi.freshRolloverKey = rKey;
                    ceUi.freshRolloverIso = S.isoDaysAgo(5);
                    ceUi.freshRolloverFreeze = false;
                  }
                  S.haptic('tick');
                  repaintAll();
                }
              })
            )
          ));
        });
        bagsCard.appendChild(track);

        if (activeFreshRec) {
          var freshDraftObj = {
            roast: activeFreshRec.roast || 'light',
            roast_date: ceUi.freshRolloverIso || S.isoDaysAgo(5),
            dateUnsure: '',
            is_frozen: ceUi.freshRolloverFreeze ? 'yes' : '',
            frozen_date: ceUi.freshRolloverFreeze ? S.isoDaysAgo(0) : ''
          };
          var freshCalState = {
            showDatePicker: true,
            datePickerTarget: 'roast',
            calViewYear: 0,
            calViewMonth: -1
          };
          var freshApplyBtn = S.h('button', {
            type: 'button',
            class: 'bt-ce-bag-brew',
            style: 'min-height:42px;padding:0 14px;width:100%',
            text: 'Use ' + (formatHumanIsoDate(freshDraftObj.roast_date) || 'Selected Date') + ' & Brew →',
            onclick: function () {
              var rollRec = activeFreshRec;
              var chosen = freshDraftObj.dateUnsure ? 'unsure' : (freshDraftObj.roast_date || S.isoDaysAgo(0));
              var isFz = freshDraftObj.is_frozen === 'yes';
              var fzDt = freshDraftObj.frozen_date || S.isoDaysAgo(0);
              ceUi.freshRolloverKey = '';
              applyFreshBagRollover(rollRec, chosen, 250, isFz, false, fzDt);
            }
          });
          bagsCard.appendChild(S.h('div', { class: 'bt-ce-fresh-inline' },
            S.h('div', { class: 'bt-ce-card-hd' },
              S.h('b', { style: 'font-size:12.5px', text: 'Fresh Bag Rollover · ' + activeFreshRec.name + ' (Keeps Locked Recipe!)' }),
              S.h('button', { type: 'button', class: 'bt-ce-link-btn', text: 'Cancel', onclick: function () { ceUi.freshRolloverKey = ''; repaintAll(); } })
            ),
            buildRoastCalendarControl({
              coffee: freshDraftObj,
              uiState: freshCalState,
              defaultOpen: true,
              hideDoneBtn: true,
              showHeaderBadge: false,
              kickerText: 'New Bag Printed Roast Date',
              onSync: function () {
                ceUi.freshRolloverIso = freshDraftObj.roast_date || '';
                ceUi.freshRolloverFreeze = freshDraftObj.is_frozen === 'yes';
                freshApplyBtn.textContent = freshDraftObj.dateUnsure
                  ? 'Use Unstamped Bag & Brew →'
                  : ('Use ' + (formatHumanIsoDate(freshDraftObj.roast_date) || 'Selected Date') + (freshDraftObj.is_frozen === 'yes' ? ' (-18 °C)' : '') + ' & Brew →');
              }
            }),
            freshApplyBtn
          ));
        }
      } else {
        /* Honest empty-shelf compact bar (0 fake pre-filled coffees, fits cleanly in ~76px!) */
        bagsCard.appendChild(S.h('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;padding:2px 0' },
          S.h('span', { style: 'font-size:12px;color:var(--ink-secondary);flex:1;min-width:180px', text: 'Your open bags appear here for 1-tap Brew → & Fresh Bag rollover.' }),
          S.h('button', {
            type: 'button',
            class: 'bt-ce-chip is-compact',
            onclick: function () { flushPendingStep1Drafts(c); openPasteModal(''); }
          }, S.iconEl('paste-card', { size: 14 }), S.h('span', { text: 'Import / Paste Code' }))
        ));
      }
      root.appendChild(bagsCard);

      /* ==================== ABOVE-THE-FOLD BLOCK 3: HERO MAGIC AI BAG LOOKUP & PASTE ==================== */
      var promptDisclosureSlot = S.h('div');
      function refreshPromptDisclosure() {
        promptDisclosureSlot.textContent = '';
        if (!ceUi.showPromptDisclosure) return;
        var activeQuery = (ceUi.aiQuery || '').trim() || [c.roaster, c.name].filter(Boolean).join(' — ');
        var fullPrompt = buildScanPromptV6Safe(activeQuery);
        var promptTa = S.h('textarea', {
          class: 'bt-ce-prompt-ta',
          readOnly: true,
          value: fullPrompt,
          'aria-label': 'AI bag lookup prompt text',
          onclick: function () { this.select(); }
        });
        promptDisclosureSlot.appendChild(S.h('div', { class: 'bt-ce-prompt-box' },
          S.h('div', { class: 'bt-ce-card-hd' },
            S.h('span', { class: 'bt-ce-eyebrow', text: 'AI Bag Lookup Prompt (Tap to Select All & Copy)' }),
            S.h('button', {
              type: 'button',
              class: 'bt-ce-link-btn',
              text: 'Hide',
              onclick: function () { ceUi.showPromptDisclosure = false; refreshPromptDisclosure(); }
            })
          ),
          promptTa
        ));
      }

      var clearAiBtn = S.h('button', {
        type: 'button',
        class: 'bt-ce-clear-x',
        hidden: !ceUi.aiQuery,
        'aria-label': 'Clear AI lookup query',
        onclick: function () {
          ceUi.aiQuery = '';
          aiSpotlightInput.value = '';
          clearAiBtn.hidden = true;
          if (ceUi.showPromptDisclosure) refreshPromptDisclosure();
          aiSpotlightInput.focus();
        }
      }, S.iconEl('close-x', { size: 14 }));

      var aiSpotlightInput = S.h('input', {
        type: 'text',
        value: ceUi.aiQuery,
        placeholder: 'Optional: Roaster & coffee name (e.g. Onyx Tropical Weather)',
        'aria-label': 'Optional roaster and coffee name for AI lookup prompt',
        oninput: function (e) {
          ceUi.aiQuery = e.target.value;
          clearAiBtn.hidden = !ceUi.aiQuery;
          if (ceUi.showPromptDisclosure) refreshPromptDisclosure();
        }
      });

      var heroAiCard = S.h('section', { class: 'bt-ce-card bt-ce-card-hero', 'aria-label': 'Magic AI Bag Lookup and Paste' },
        S.h('div', { class: 'bt-ce-card-hd' },
          S.h('h2', { class: 'bt-ce-card-title' },
            S.iconEl('spark-star', { size: 17 }),
            S.h('span', { text: 'Magic AI Bag Lookup & Paste' })
          ),
          S.h('span', { class: 'bt-ce-badge is-gold', text: 'Works on 100% of Bags' })
        ),
        S.h('p', { class: 'bt-ce-ai-helper', text: 'Snap bag or type name → Copy Prompt → Paste AI Reply.' }),
        S.h('div', { class: 'bt-ce-spotlight' },
          S.iconEl('search-filter', { size: 16 }),
          aiSpotlightInput,
          clearAiBtn
        ),
        S.h('div', { class: 'bt-ce-ai-btns' },
          S.h('button', {
            type: 'button',
            class: 'bt-ce-ai-btn is-copy',
            onclick: function () {
              var q = (aiSpotlightInput.value || '').trim() || [c.roaster, c.name].filter(Boolean).join(' — ');
              var promptTxt = buildScanPromptV6Safe(q);
              S.haptic('snap');
              copyTextRobust(promptTxt, function (copiedOk) {
                if (copiedOk) {
                  S.toastSafe('AI Lookup Prompt copied! Paste into ChatGPT, Claude, or Gemini with a bag photo or name, then tap 2. Paste AI Reply.');
                } else {
                  ceUi.showPromptDisclosure = true;
                  refreshPromptDisclosure();
                  S.toastSafe('Clipboard blocked by browser — copy the prompt from the box below!');
                }
              });
            }
          }, S.iconEl('copy', { size: 15 }), S.h('span', { text: '1. Copy AI Lookup Prompt' })),
          S.h('button', {
            type: 'button',
            class: 'bt-ce-ai-btn is-paste',
            onclick: function () {
              flushPendingStep1Drafts(c);
              S.haptic('tick');
              openPasteModal((aiSpotlightInput.value || '').trim());
            }
          }, S.iconEl('paste-card', { size: 15 }), S.h('span', { text: '2. Paste AI Reply' }))
        ),
        S.h('div', { class: 'bt-ce-ai-foot' },
          S.h('button', {
            type: 'button',
            class: 'bt-ce-link-btn',
            'aria-expanded': String(ceUi.showPromptDisclosure),
            text: ceUi.showPromptDisclosure ? 'Hide Prompt Text' : 'View / Copy Prompt Text',
            onclick: function () {
              ceUi.showPromptDisclosure = !ceUi.showPromptDisclosure;
              refreshPromptDisclosure();
            }
          }),
          S.h('span', { style: 'font-size:11px;color:var(--ink-muted)', text: 'Reviews every field with checkboxes first' })
        ),
        promptDisclosureSlot
      );
      refreshPromptDisclosure();
      root.appendChild(heroAiCard);

      /* ==================== 1-ROW HORIZONTAL 12 QUICK ARCHETYPES STRIP ==================== */
      var archSection = S.h('section', { class: 'bt-ce-card bt-ce-card-compact', 'aria-label': '12 Quick Specialty Archetypes' },
        S.h('div', { class: 'bt-ce-card-hd' },
          S.h('span', { class: 'bt-ce-eyebrow', text: '12 Quick Archetypes · 1-Tap Zero-Typing Start' }),
          S.h('span', { style: 'font-size:11px;color:var(--ink-muted)', text: 'Swipe →' })
        ),
        S.h('div', { class: 'bt-ce-arch-strip', role: 'group', 'aria-label': 'Quick coffee archetypes' },
          QUICK_ARCHETYPES_12.map(function (ar) {
            var isPressed = ceUi.selectedArchetype === ar.id;
            return S.h('button', {
              type: 'button',
              class: 'bt-ce-arch-pill',
              'aria-pressed': String(isPressed),
              onclick: function () {
                ceUi.selectedArchetype = ar.id;
                ceUi.customNoteDraft = '';
                ceUi.validationPromptOpen = false;
                ceUi.pulseFieldKey = '';
                c.id = 'cf_' + Date.now();
                c.roaster = ar.data.roaster || '';
                c.roasterGuide = null;
                c.nameUnsure = '';
                c.roasterUnsure = '';
                c.roastUnsure = '';
                c.roast_unknown = '';
                c.processUnsure = '';
                c.process_unknown = '';
                c.originUnsure = '';
                c.origin_unknown = '';
                c.elevUnsure = '';
                c.elev_unknown = '';
                c.notesUnsure = '';
                c.notes_unknown = '';
                c.dateUnsure = '';
                c.date_unknown = '';
                c.varietalUnsure = '';
                Object.keys(ar.data).forEach(function (k) { c[k] = ar.data[k]; });
                if (ar.data.dateUnsure === 'yes') {
                  c.dateUnsure = 'yes';
                  c.date_unknown = 'yes';
                  c.roast_date = '';
                } else if (!c.roast_date) {
                  c.roast_date = S.isoDaysAgo(6);
                }
                c._v64Touched = 'yes';
                c.answered = 'yes';
                a.attempt = 0;
                a.recipeLocked = false;
                a.dialNote = null;
                a.cupBrew = null;
                a.freshCoffeeMode = false;
                if (a.brew) {
                  a.brew.actualSecs = null;
                  a.brew.actualFromTimer = false;
                }
                try {
                  if (typeof window !== 'undefined' && window.BTBrewStudio && typeof window.BTBrewStudio.resetTimerSession === 'function') {
                    window.BTBrewStudio.resetTimerSession();
                  }
                  if (typeof window !== 'undefined' && window.BTTasteStep && typeof window.BTTasteStep.resetSession === 'function') {
                    window.BTTasteStep.resetSession();
                  }
                } catch (_) {}
                S.haptic('snap');
                S.saveDraftSafe();
                S.notifyChromeSafe();
                repaintAll();
              }
            },
              S.h('b', null,
                S.h('span', { class: 'bt-ce-roast-dot', style: 'background:' + ar.roastColor }),
                S.h('span', { text: ar.title })
              ),
              S.h('small', { text: ar.sub })
            );
          })
        )
      );
      root.appendChild(archSection);

      /* ==================== DUAL ENTRY MODE SWITCHER ==================== */
      root.appendChild(S.h('div', { class: 'bt-ce-mode-seg', role: 'tablist', 'aria-label': 'Coffee Entry Mode' },
        S.h('button', {
          type: 'button',
          role: 'tab',
          'aria-selected': String(ceUi.mode === 'quick'),
          'aria-pressed': String(ceUi.mode === 'quick'),
          onclick: function () { flushPendingStep1Drafts(c); ceUi.mode = 'quick'; S.haptic('tick'); repaintAll(); }
        }, S.iconEl('fresh-bag', { size: 15 }), S.h('span', { text: 'All-in-1 Studio Cards' })),
        S.h('button', {
          type: 'button',
          role: 'tab',
          'aria-selected': String(ceUi.mode === 'guided'),
          'aria-pressed': String(ceUi.mode === 'guided'),
          onclick: function () { flushPendingStep1Drafts(c); ceUi.mode = 'guided'; S.haptic('tick'); repaintAll(); }
        }, S.iconEl('spark-star', { size: 15 }), S.h('span', { text: '1-Card Guided Mode' }))
      ));

      /* ==================== ACTIVE ENTRY MODE BODY ==================== */
      if (ceUi.mode === 'guided') {
        mountGuidedCardsView(root, c, unifiedRecs, repaintAll, syncLiveSummariesOnly, advanceToBrewer);
      } else {
        mountQuickCardsView(root, c, unifiedRecs, repaintAll, syncLiveSummariesOnly, liveCardSyncFns);
      }

      /* ==================== INLINE VALIDATION ALERT ABOVE STICKY CTA ==================== */
      paintValidationBannersOnly();
      root.appendChild(bottomReqBannerSlot);

      /* ==================== STICKY THUMB-ZONE PRIMARY CTA ==================== */
      ctaSubEl.textContent = formatActiveCoffeeSublabel(c);
      root.appendChild(S.h('div', { class: 'bt-ce-sticky-cta', id: 'bt-ce-sticky-cta' },
        S.h('button', {
          type: 'button',
          class: 'bt-ce-cta-primary',
          onclick: advanceToBrewer
        },
          S.h('span', { style: 'min-width:0;text-align:left' },
            S.h('span', { text: inSheet ? 'Save & Choose Brewer →' : 'Choose Brewer →' }),
            ctaSubEl
          ),
          S.iconEl('chevron-right', { size: 20 })
        )
      ));
    }

    repaintAll();
    return root;
  }

  /* -------------------- 8. Standout Step 1.1 – 1.4 Studio Cards -------------------- */
  function mountQuickCardsView(root, c, unifiedRecs, repaintAll, syncLiveSummariesOnly, liveCardSyncFns) {
    var lens = getActiveLensLevel();
    var agMode = getAgtronToolMode();
    liveCardSyncFns = Array.isArray(liveCardSyncFns) ? liveCardSyncFns : [];

    function registerFieldStateBadge(badgeNode, fieldKey) {
      function paintBadge() {
        var st = getFieldStatus(c, fieldKey);
        badgeNode.className = 'bt-ce-field-state is-' + st.state;
        badgeNode.textContent = '';
        if (st.state === 'answered') {
          badgeNode.appendChild(makeInlineCheckSvg(10));
          badgeNode.appendChild(S.h('span', { text: 'Answered' }));
        } else if (st.state === 'unsure') {
          badgeNode.appendChild(makeInlineCheckSvg(10));
          badgeNode.appendChild(S.h('span', { text: 'Don\'t Know' }));
        } else if (st.state === 'optional') {
          badgeNode.textContent = 'Optional';
        } else {
          badgeNode.textContent = 'Required';
        }
      }
      paintBadge();
      liveCardSyncFns.push(paintBadge);
      return badgeNode;
    }

    function registerStepCardStatus(cardNode, statusBadgeNode, reqKeys) {
      function paintCard() {
        var ans = reqKeys.filter(function (k) { return isFieldAnswered(c, k); }).length;
        var allDone = ans === reqKeys.length;
        var isPulse = reqKeys.indexOf(ceUi.pulseFieldKey) >= 0;
        cardNode.className = 'bt-ce-step-card ' + (allDone ? 'is-card-answered' : 'is-card-needed') + (!allDone && isPulse ? ' is-needs-answer' : '');
        statusBadgeNode.className = 'bt-ce-step-status ' + (allDone ? 'is-answered' : 'is-needed');
        statusBadgeNode.textContent = '';
        if (allDone) {
          statusBadgeNode.appendChild(makeInlineCheckSvg(12));
          statusBadgeNode.appendChild(S.h('span', { text: reqKeys.length > 1 ? (ans + '/' + reqKeys.length + ' Answered') : 'Answered' }));
        } else {
          statusBadgeNode.textContent = reqKeys.length > 1 ? ((reqKeys.length - ans) + ' Needed') : 'Needed';
        }
      }
      paintCard();
      liveCardSyncFns.push(paintCard);
    }

    function makeDontKnowPill(fieldKey, labelText) {
      var isUnsure = getFieldStatus(c, fieldKey).state === 'unsure';
      var btn = S.h('button', {
        type: 'button',
        class: 'bt-ce-dontknow-pill' + (isUnsure ? ' is-active' : ''),
        'data-dont-know': fieldKey,
        'aria-pressed': String(isUnsure),
        onclick: function () {
          var curUnsure = getFieldStatus(c, fieldKey).state === 'unsure';
          setFieldDontKnow(c, fieldKey, !curUnsure);
          S.haptic('tick');
          S.saveDraftSafe();
          S.notifyChromeSafe();
          repaintAll();
        }
      }, isUnsure ? makeInlineCheckSvg(12) : null, S.h('span', { text: labelText || 'Don\'t Know' }));
      liveCardSyncFns.push(function () {
        var nowUnsure = getFieldStatus(c, fieldKey).state === 'unsure';
        btn.setAttribute('aria-pressed', String(nowUnsure));
        btn.className = 'bt-ce-dontknow-pill' + (nowUnsure ? ' is-active' : '');
        btn.textContent = '';
        if (nowUnsure) btn.appendChild(makeInlineCheckSvg(12));
        btn.appendChild(S.h('span', { text: labelText || 'Don\'t Know' }));
      });
      return btn;
    }

    /* ==================== STEP 1.1 · COFFEE & ROAST ==================== */
    var roasterSugHost = S.h('div', { class: 'bt-ce-sug-row' });
    var nameSugHost = S.h('div', { class: 'bt-ce-sug-row' });
    var dymHost = S.h('div');

    function updateIdentitySuggestions() {
      roasterSugHost.textContent = '';
      nameSugHost.textContent = '';
      dymHost.textContent = '';

      var rTyped = String(c.roaster || '').trim().toLowerCase();
      if (rTyped.length >= 1) {
        var rPool = [];
        unifiedRecs.forEach(function (u) { if (u.roaster && rPool.indexOf(u.roaster) < 0) rPool.push(u.roaster); });
        if (typeof ROASTER_DIRECTORY !== 'undefined' && Array.isArray(ROASTER_DIRECTORY)) {
          ROASTER_DIRECTORY.forEach(function (rd) { if (rd && rd.name && rPool.indexOf(rd.name) < 0) rPool.push(rd.name); });
        }
        rPool.filter(function (rn) {
          return rn.toLowerCase() !== rTyped && rn.toLowerCase().indexOf(rTyped) >= 0;
        }).slice(0, 6).forEach(function (rn) {
          roasterSugHost.appendChild(S.h('button', {
            type: 'button',
            class: 'bt-ce-chip is-compact',
            text: rn,
            onclick: function () {
              c._v64Touched = 'yes';
              c.roaster = rn;
              c.roasterUnsure = '';
              if (c.nameUnsure === 'yes') {
                c.nameUnsure = '';
                if (c.name === 'Unlabeled Coffee') { c.name = ''; nameInp.value = ''; }
              }
              roasterInp.value = rn;
              S.haptic('tick');
              updateIdentitySuggestions();
              syncLiveSummariesOnly();
            }
          }));
        });
      }

      var nTyped = String(c.name || '').trim().toLowerCase();
      if (nTyped.length >= 2 && nTyped !== 'unlabeled coffee') {
        unifiedRecs.filter(function (u) {
          return u.name && u.name.toLowerCase() !== nTyped && u.name.toLowerCase().indexOf(nTyped) >= 0;
        }).slice(0, 5).forEach(function (u) {
          nameSugHost.appendChild(S.h('button', {
            type: 'button',
            class: 'bt-ce-chip is-compact',
            text: 'Load saved: ' + u.name + (u.roaster ? ' (' + u.roaster + ')' : ''),
            onclick: function () { applySavedCoffeeSelection(u, { stayOnCoffee: true }); }
          }));
        });
      }

      if (c.nameUnsure !== 'yes') {
        var dym = checkIdentityDidYouMean(c, unifiedRecs);
        if (dym && (dym.roaster || dym.coffee)) {
          var fixText = dym.fixCoffee && dym.coffee ? ('Did you mean "' + dym.coffee + '"' + (dym.roaster ? ' by ' + dym.roaster : '') + '?')
            : ('Did you mean roaster "' + dym.roaster + '"?');
          dymHost.appendChild(S.h('button', {
            type: 'button',
            class: 'bt-ce-chip is-compact is-active',
            style: 'margin-top:2px',
            text: fixText + ' Tap to apply',
            onclick: function () {
              c._v64Touched = 'yes';
              c.nameUnsure = '';
              if (dym.fixCoffee && dym.coffee) { c.name = dym.coffee; nameInp.value = dym.coffee; }
              if (dym.fixRoaster && dym.roaster) { c.roaster = dym.roaster; c.roasterUnsure = ''; roasterInp.value = dym.roaster; }
              S.haptic('tick');
              updateIdentitySuggestions();
              syncLiveSummariesOnly();
            }
          }));
        }
      }
    }

    var roasterInp = S.h('input', {
      type: 'text',
      value: c.roaster || '',
      placeholder: 'e.g. Onyx, Sey, La Cabra, Counter Culture',
      'aria-label': 'Roaster name',
      oninput: function (e) {
        c._v64Touched = 'yes';
        c.roaster = e.target.value;
        if (String(c.roaster || '').trim()) {
          c.roasterUnsure = '';
          if (c.nameUnsure === 'yes') {
            c.nameUnsure = '';
            if (c.name === 'Unlabeled Coffee') { c.name = ''; nameInp.value = ''; }
          }
        }
        updateIdentitySuggestions();
        syncLiveSummariesOnly();
      }
    });

    var nameInp = S.h('input', {
      type: 'text',
      value: c.nameUnsure === 'yes' ? '' : (c.name || ''),
      placeholder: c.nameUnsure === 'yes' ? 'Marked Unlabeled Coffee (type to set name)' : 'e.g. Worka Chelbesa, Tropical Weather',
      'aria-label': 'Coffee name',
      oninput: function (e) {
        c._v64Touched = 'yes';
        c.name = e.target.value;
        if (String(c.name || '').trim()) {
          c.nameUnsure = '';
        }
        updateIdentitySuggestions();
        syncLiveSummariesOnly();
      }
    });
    updateIdentitySuggestions();

    var card1StatusBadge = S.h('span', { class: 'bt-ce-step-status is-needed' });
    var nameStateBadge = registerFieldStateBadge(S.h('span'), 'name');
    var roastStateBadge = registerFieldStateBadge(S.h('span'), 'roast');

    var roastMeterPanel = null;
    if (agMode !== 'off' && (agMode === 'always' || lens === 'scientist' || ceUi.showRoastMeter)) {
      var curScale = c.agtron_scale || 'gourmet';
      var deltaVal = (isFinite(+c.ground_agtron) && isFinite(+c.bean_agtron) && +c.ground_agtron > 0 && +c.bean_agtron > 0)
        ? Math.round((+c.ground_agtron - +c.bean_agtron) * 10) / 10
        : null;
      roastMeterPanel = S.h('div', { class: 'bt-ce-sensor-panel' },
        S.h('div', { class: 'bt-ce-card-hd' },
          S.h('span', { class: 'bt-ce-eyebrow', style: 'color:var(--science)', text: 'Roast Color Meter (Agtron · Lightells · DiFluid Omni)' }),
          deltaVal != null ? S.h('span', { class: 'bt-ce-badge is-sci', text: 'Delta ' + (deltaVal >= 0 ? '+' : '') + deltaVal + (Math.abs(deltaVal) <= 9 ? ' · Even Core' : ' · High Contrast') }) : null
        ),
        S.h('div', { class: 'bt-ce-chips' },
          [
            ['gourmet', 'Agtron Gourmet'],
            ['lightells', 'Lightells NIR'],
            ['omni', 'DiFluid Omni'],
            ['tonino', 'Tonino'],
            ['commercial', 'Commercial']
          ].map(function (sc) {
            return S.h('button', {
              type: 'button',
              class: 'bt-ce-chip is-compact',
              'aria-pressed': String(curScale === sc[0]),
              text: sc[1],
              onclick: function () { c.agtron_scale = sc[0]; repaintAll(); }
            });
          })
        ),
        S.h('div', { style: 'display:flex;align-items:center;gap:8px;flex-wrap:wrap' },
          S.h('label', { style: 'display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:700' },
            S.h('span', { text: 'Whole:' }),
            S.h('input', {
              type: 'text',
              inputmode: 'decimal',
              class: 'bt-ce-num-input',
              placeholder: '72',
              value: c.bean_agtron || '',
              oninput: function (e) {
                c._v64Touched = 'yes';
                c.bean_agtron = e.target.value;
                syncLiveSummariesOnly();
              }
            })
          ),
          S.h('label', { style: 'display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:700' },
            S.h('span', { text: 'Ground:' }),
            S.h('input', {
              type: 'text',
              inputmode: 'decimal',
              class: 'bt-ce-num-input',
              placeholder: '80',
              value: c.ground_agtron || '',
              oninput: function (e) {
                c._v64Touched = 'yes';
                c.ground_agtron = e.target.value;
                var gEq = roastMeterToGourmet(e.target.value, c.agtron_scale);
                var mappedR = normRoastKey('', gEq);
                if (mappedR) { c.roast = mappedR; c.roastUnsure = ''; c.roast_unknown = ''; }
                syncLiveSummariesOnly();
              }
            })
          ),
          S.h('button', {
            type: 'button',
            class: 'bt-ce-chip is-compact',
            onclick: function () {
              var ble = (typeof window !== 'undefined' && window.BTBle) ? window.BTBle : null;
              if (ble && typeof ble.connectOmni === 'function') {
                Promise.resolve(ble.connectOmni()).catch(function () {});
              } else {
                S.openSheetSafe('ble-devices', null, { detent: 'full' });
              }
            }
          }, S.iconEl('ble-wave', { size: 14 }), S.h('span', { text: 'BLE Omni' }))
        )
      );
    }

    var activeRoastStop = S.ROAST_STOPS.find(function (r) { return r.key === c.roast; });
    var roastCueTxt = (c.roastUnsure === 'yes' || c.roast === 'unknown')
      ? 'Marked Don\'t Know — uses neutral balanced temp today & protects your Roast Preferences.'
      : (activeRoastStop ? activeRoastStop.cue : 'Pick a roast swatch above — or tap "Don\'t Know" if your bag omits roast level.');

    var cardStep11 = S.h('section', { class: 'bt-ce-step-card is-card-needed', id: 'bt-step1-card-1' },
      S.h('div', { class: 'bt-ce-step-card-hd' },
        S.h('span', { class: 'bt-ce-step-num-badge', text: 'Step 1.1 · Coffee & Roast' }),
        card1StatusBadge
      ),
      /* Field 1: Coffee & Roaster Name */
      S.h('div', { class: 'bt-ce-field-block' + (ceUi.pulseFieldKey === 'name' ? ' is-needs-answer' : ''), id: 'bt-field-name' },
        S.h('div', { class: 'bt-ce-field-hd' },
          S.h('div', { class: 'bt-ce-field-title-grp' },
            S.h('span', { class: 'bt-ce-field-lbl', text: '1. Coffee & Roaster Name' }),
            nameStateBadge,
            makeFieldHelpBtn('name')
          ),
          makeDontKnowPill('name', 'Don\'t Know / Unlabeled')
        ),
        S.h('div', { class: 'bt-ce-id-grid' },
          S.h('div', { style: 'display:flex;flex-direction:column;gap:4px;min-width:0' },
            S.h('span', { class: 'bt-ce-input-sublbl', text: 'Roaster' }),
            S.h('div', { class: 'bt-ce-spotlight' }, S.iconEl('spark-star', { size: 15 }), roasterInp),
            roasterSugHost
          ),
          S.h('div', { style: 'display:flex;flex-direction:column;gap:4px;min-width:0' },
            S.h('span', { class: 'bt-ce-input-sublbl', text: 'Coffee / Bag Name' }),
            S.h('div', { class: 'bt-ce-spotlight' }, S.iconEl('fresh-bag', { size: 15 }), nameInp),
            nameSugHost
          )
        ),
        dymHost
      ),
      /* Field 2: Roast Level */
      S.h('div', { class: 'bt-ce-field-block' + (ceUi.pulseFieldKey === 'roast' ? ' is-needs-answer' : ''), id: 'bt-field-roast' },
        S.h('div', { class: 'bt-ce-field-hd' },
          S.h('div', { class: 'bt-ce-field-title-grp' },
            S.h('span', { class: 'bt-ce-field-lbl', text: '2. Roast Level' }),
            roastStateBadge,
            makeFieldHelpBtn('roast')
          ),
          makeDontKnowPill('roast', 'Don\'t Know')
        ),
        S.h('div', { class: 'bt-ce-roast-grid', role: 'radiogroup', 'aria-label': 'Roast Spectrum' },
          S.ROAST_STOPS.map(function (st) {
            var isOn = !c.roastUnsure && c.roast === st.key;
            return S.h('button', {
              type: 'button',
              class: 'bt-ce-roast-swatch',
              role: 'radio',
              'aria-checked': String(isOn),
              'aria-pressed': String(isOn),
              onclick: function () {
                c._v64Touched = 'yes';
                c.roast = st.key;
                c.roastUnsure = '';
                c.roast_unknown = '';
                if (!c.ground_agtron) {
                  c.ground_agtron = st.agtron;
                  c.bean_agtron = st.agtron - 6;
                }
                S.haptic('tick');
                S.saveDraftSafe();
                S.notifyChromeSafe();
                repaintAll();
              }
            },
              S.h('span', { class: 'bt-ce-roast-disc', style: 'background:' + st.hex }),
              S.h('span', { text: st.label })
            );
          })
        ),
        ceUi.showRoastAliases ? S.h('div', { class: 'bt-ce-subwell' },
          S.h('span', { class: 'bt-ce-eyebrow', text: 'Tap Your Bag\'s Roast Word' }),
          S.h('div', { class: 'bt-ce-chips' },
            ROASTER_WORD_ALIASES.map(function (al) {
              return S.h('button', {
                type: 'button',
                class: 'bt-ce-chip is-compact',
                'aria-pressed': String(!c.roastUnsure && c.roast === al.roast),
                text: al.lbl,
                onclick: function () {
                  c._v64Touched = 'yes';
                  c.roast = al.roast;
                  c.roastUnsure = '';
                  c.roast_unknown = '';
                  ceUi.showRoastAliases = false;
                  S.haptic('tick');
                  S.saveDraftSafe();
                  repaintAll();
                }
              });
            })
          )
        ) : null,
        S.h('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap' },
          S.h('span', { style: 'font-size:11.5px;color:var(--ink-secondary);flex:1;min-width:170px', text: roastCueTxt }),
          S.h('div', { style: 'display:flex;gap:6px;flex-wrap:wrap' },
            S.h('button', {
              type: 'button',
              class: 'bt-ce-link-btn',
              'aria-expanded': String(ceUi.showRoastAliases),
              text: ceUi.showRoastAliases ? 'Hide Bag Terms' : 'Bag says Nordic / City+ / Omni?',
              onclick: function () { ceUi.showRoastAliases = !ceUi.showRoastAliases; repaintAll(); }
            }),
            agMode !== 'off' ? S.h('button', {
              type: 'button',
              class: 'bt-ce-chip is-compact',
              'aria-pressed': String(agMode === 'always' || lens === 'scientist' || ceUi.showRoastMeter),
              onclick: function () { ceUi.showRoastMeter = !ceUi.showRoastMeter; repaintAll(); }
            }, S.iconEl('omni-nir', { size: 14 }), S.h('span', { text: 'Roast Meter' })) : null
          )
        ),
        roastMeterPanel
      )
    );
    registerStepCardStatus(cardStep11, card1StatusBadge, ['name', 'roast']);
    root.appendChild(cardStep11);

    /* ==================== STEP 1.2 · ORIGIN, PROCESS & ELEVATION ==================== */
    var all52 = getAllOriginNames52();
    var all72 = getAllVarietalNames72();
    var originFeedbackHost = S.h('div', { style: 'display:flex;flex-direction:column;gap:5px' });
    var varietalFeedbackHost = S.h('div', { style: 'display:flex;flex-direction:column;gap:5px' });

    function refreshOriginFeedback() {
      originFeedbackHost.textContent = '';
      var q = String(ceUi.originSearch || c.origin || '').trim();
      if (ceUi.originSearch && ceUi.originSearch.trim().length >= 1) {
        var lowQ = ceUi.originSearch.trim().toLowerCase();
        var matches = all52.filter(function (n) { return n.toLowerCase().indexOf(lowQ) >= 0; }).slice(0, 8);
        if (matches.length) {
          originFeedbackHost.appendChild(S.h('div', { class: 'bt-ce-chips' },
            matches.map(function (mn) {
              return S.h('button', {
                type: 'button',
                class: 'bt-ce-chip is-compact',
                'aria-pressed': String(String(c.origin || '').toLowerCase().indexOf(mn.toLowerCase()) >= 0),
                text: mn,
                onclick: function () {
                  c._v64Touched = 'yes';
                  c.origin = mn;
                  c.originUnsure = '';
                  c.origin_unknown = '';
                  ceUi.originSearch = '';
                  S.haptic('tick');
                  S.saveDraftSafe();
                  repaintAll();
                }
              });
            })
          ));
        }
      }
      var corr = suggestOriginCorrection(q, c.name);
      if (corr.suggestions && corr.suggestions.length) {
        originFeedbackHost.appendChild(S.h('div', { class: 'bt-ce-chips' },
          corr.suggestions.map(function (sug) {
            return S.h('button', {
              type: 'button',
              class: 'bt-ce-chip is-compact is-active',
              text: 'Did you mean ' + sug + '?',
              onclick: function () {
                c._v64Touched = 'yes';
                c.origin = sug;
                c.originUnsure = '';
                c.origin_unknown = '';
                ceUi.originSearch = '';
                S.haptic('tick');
                S.saveDraftSafe();
                repaintAll();
              }
            });
          })
        ));
      }
      if (corr.mismatch) {
        originFeedbackHost.appendChild(S.h('span', {
          class: 'bt-ce-badge is-warn',
          text: 'Check bag: coffee name mentions ' + corr.mismatch.country + ' while origin is ' + c.origin
        }));
      }
    }

    function applyPickedVarietalSuggestion(vn) {
      var curArr = String(c.varietal || '').split(/[,;]/).map(function (s) { return s.trim(); }).filter(Boolean);
      if (curArr.length) {
        var lastPart = curArr[curArr.length - 1];
        var isExactCanon = all72.some(function (canon) { return canon.toLowerCase() === lastPart.toLowerCase(); });
        if (!isExactCanon && vn.toLowerCase().indexOf(lastPart.toLowerCase()) >= 0) {
          curArr.pop();
        }
      }
      if (!curArr.some(function (x) { return x.toLowerCase() === vn.toLowerCase(); })) {
        curArr.push(vn);
      }
      c._v64Touched = 'yes';
      c.varietal = curArr.join(', ');
      c.varietalUnsure = '';
      ceUi.varietalSearch = '';
      S.haptic('tick');
      S.saveDraftSafe();
      S.notifyChromeSafe();
    }

    function refreshVarietalFeedback() {
      varietalFeedbackHost.textContent = '';
      var qv = String(ceUi.varietalSearch || '').trim();
      var qvParts = qv.split(/[,;]/).map(function (s) { return s.trim(); }).filter(Boolean);
      var lastTok = qvParts.length ? qvParts[qvParts.length - 1] : '';
      if (lastTok.length >= 1) {
        var lowV = lastTok.toLowerCase();
        var vMatches = all72.filter(function (vn) { return vn.toLowerCase().indexOf(lowV) >= 0 && vn.toLowerCase() !== lowV; }).slice(0, 8);
        if (vMatches.length) {
          varietalFeedbackHost.appendChild(S.h('div', { class: 'bt-ce-chips' },
            vMatches.map(function (vn) {
              return S.h('button', {
                type: 'button',
                class: 'bt-ce-chip is-compact',
                text: '+ ' + vn,
                onclick: function () {
                  applyPickedVarietalSuggestion(vn);
                  repaintAll();
                }
              });
            })
          ));
        }
      }
      var vSug = suggestVarietalCorrection(qv || c.varietal);
      if (vSug.length) {
        varietalFeedbackHost.appendChild(S.h('div', { class: 'bt-ce-chips' },
          vSug.map(function (vs) {
            return S.h('button', {
              type: 'button',
              class: 'bt-ce-chip is-compact is-active',
              text: 'Did you mean ' + vs + '?',
              onclick: function () {
                applyPickedVarietalSuggestion(vs);
                repaintAll();
              }
            });
          })
        ));
      }
    }

    function toggleVarietalTag(vName) {
      var curArr = String(c.varietal || '').split(/[,;]/).map(function (s) { return s.trim(); }).filter(Boolean);
      var idx = -1;
      for (var i = 0; i < curArr.length; i++) {
        if (curArr[i].toLowerCase() === vName.toLowerCase()) { idx = i; break; }
      }
      if (idx >= 0) curArr.splice(idx, 1);
      else curArr.push(vName);
      c._v64Touched = 'yes';
      c.varietal = curArr.join(', ');
      c.varietalUnsure = '';
      S.haptic('tick');
      S.saveDraftSafe();
      S.notifyChromeSafe();
    }

    var matchedCountryForSubs = Object.keys(SUBREGIONS_BY_COUNTRY).find(function (cn) {
      return String(c.origin || '').toLowerCase().indexOf(cn.toLowerCase()) >= 0;
    });
    var subRegions = matchedCountryForSubs ? SUBREGIONS_BY_COUNTRY[matchedCountryForSubs] : [];

    var originInp = S.h('input', {
      type: 'text',
      value: ceUi.originSearch || c.origin || '',
      placeholder: c.originUnsure === 'yes' ? 'Marked Don\'t Know / Blend (type country to set)' : 'Search 52 countries or region (e.g. Huila, Ethiopia)...',
      'aria-label': 'Origin country and region',
      oninput: function (e) {
        c._v64Touched = 'yes';
        ceUi.originSearch = e.target.value;
        c.origin = e.target.value;
        if (String(c.origin || '').trim()) {
          c.originUnsure = '';
          c.origin_unknown = '';
        }
        refreshOriginFeedback();
        syncLiveSummariesOnly();
      }
    });

    var varietalInp = S.h('input', {
      type: 'text',
      value: ceUi.varietalSearch || c.varietal || '',
      placeholder: 'Optional: Gesha, Pink Bourbon, SL28, Bourbon...',
      'aria-label': 'Coffee varietals',
      oninput: function (e) {
        c._v64Touched = 'yes';
        ceUi.varietalSearch = e.target.value;
        c.varietal = e.target.value;
        if (String(c.varietal || '').trim()) c.varietalUnsure = '';
        refreshVarietalFeedback();
        syncLiveSummariesOnly();
      }
    });

    refreshOriginFeedback();
    refreshVarietalFeedback();

    var curProc = c.process || '';
    var isProcUnsure = c.processUnsure === 'yes' || c.process_unknown === 'yes' || curProc === 'unknown';
    var isHoneyGroup = !isProcUnsure && (curProc === 'honey' || curProc.indexOf('-honey') > 0);
    var isWildGroup = !isProcUnsure && (['anaerobic', 'carbonic', 'thermal-shock', 'yeast-koji', 'co-ferment'].indexOf(curProc) >= 0);

    var elevReadoutSpan = S.h('span', {
      style: 'font-size:12px;color:var(--ink-secondary)',
      text: (isFinite(+c.elevation_m) && +c.elevation_m > 0) ? ('≈ ' + Math.round(+c.elevation_m * 3.28084) + ' ft · Local boil ' + S.boilingPointAtM(+c.elevation_m) + ' °C') : ''
    });

    var exactElevMetersInp = S.h('input', {
      type: 'text',
      inputmode: 'numeric',
      class: 'bt-ce-num-input',
      placeholder: '1850',
      'aria-label': 'Growing elevation in meters',
      value: c.elevation_m || '',
      oninput: function (e) {
        c._v64Touched = 'yes';
        var rawE = String(e.target.value || '').replace(/[^\d]/g, '');
        var mVal = parseInt(rawE, 10);
        if (isFinite(mVal) && mVal > 0) {
          c.elevation_m = mVal;
          c.elevText = mVal + ' masl';
          c.density = mVal >= 1950 ? 'very-high' : mVal >= 1600 ? 'high' : mVal >= 1200 ? 'mid' : 'low';
          c.elevUnsure = '';
          c.elev_unknown = '';
          if (exactElevFeetInp) exactElevFeetInp.value = String(Math.round(mVal * 3.28084));
          elevReadoutSpan.textContent = '≈ ' + Math.round(mVal * 3.28084) + ' ft · Local boil ' + S.boilingPointAtM(mVal) + ' °C';
        } else if (!rawE) {
          c.elevation_m = '';
          c.elevText = '';
          if (!c.elevUnsure) c.density = '';
          if (exactElevFeetInp) exactElevFeetInp.value = '';
          elevReadoutSpan.textContent = '';
        }
        syncLiveSummariesOnly();
      }
    });

    var exactElevFeetInp = S.h('input', {
      type: 'text',
      inputmode: 'numeric',
      class: 'bt-ce-num-input',
      placeholder: '6070',
      'aria-label': 'Growing elevation in feet',
      value: (isFinite(+c.elevation_m) && +c.elevation_m > 0) ? String(Math.round(+c.elevation_m * 3.28084)) : '',
      oninput: function (e) {
        c._v64Touched = 'yes';
        var rawFt = String(e.target.value || '').replace(/[^\d]/g, '');
        var ftVal = parseInt(rawFt, 10);
        if (isFinite(ftVal) && ftVal > 0) {
          var mCalc = Math.round(ftVal / 3.28084);
          c.elevation_m = mCalc;
          c.elevText = mCalc + ' masl';
          c.density = mCalc >= 1950 ? 'very-high' : mCalc >= 1600 ? 'high' : mCalc >= 1200 ? 'mid' : 'low';
          c.elevUnsure = '';
          c.elev_unknown = '';
          exactElevMetersInp.value = String(mCalc);
          elevReadoutSpan.textContent = mCalc + ' m · Local boil ' + S.boilingPointAtM(mCalc) + ' °C';
        } else if (!rawFt) {
          c.elevation_m = '';
          c.elevText = '';
          if (!c.elevUnsure) c.density = '';
          exactElevMetersInp.value = '';
          elevReadoutSpan.textContent = '';
        }
        syncLiveSummariesOnly();
      }
    });

    var card2StatusBadge = S.h('span', { class: 'bt-ce-step-status is-needed' });
    var originStateBadge = registerFieldStateBadge(S.h('span'), 'origin');
    var processStateBadge = registerFieldStateBadge(S.h('span'), 'process');
    var elevStateBadge = registerFieldStateBadge(S.h('span'), 'elevation');
    var varStateBadge = registerFieldStateBadge(S.h('span'), 'varietal');

    var ELEV_PRESETS_4 = [
      { k: 'low',       m: 1050, minM: 0,    maxM: 1199, lbl: 'Low <1,200m' },
      { k: 'mid',       m: 1450, minM: 1200, maxM: 1599, lbl: 'Medium 1,200–1,600m' },
      { k: 'high',      m: 1800, minM: 1600, maxM: 1999, lbl: 'High 1,600–1,950m' },
      { k: 'very-high', m: 2050, minM: 2000, maxM: 9999, lbl: 'Ultra-High 2,000m+' }
    ];

    var cardStep12 = S.h('section', { class: 'bt-ce-step-card is-card-needed', id: 'bt-step1-card-2' },
      S.h('div', { class: 'bt-ce-step-card-hd' },
        S.h('span', { class: 'bt-ce-step-num-badge', text: 'Step 1.2 · Origin, Process & Elevation' }),
        card2StatusBadge
      ),

      /* Field 3: Origin */
      S.h('div', { class: 'bt-ce-field-block' + (ceUi.pulseFieldKey === 'origin' ? ' is-needs-answer' : ''), id: 'bt-field-origin' },
        S.h('div', { class: 'bt-ce-field-hd' },
          S.h('div', { class: 'bt-ce-field-title-grp' },
            S.h('span', { class: 'bt-ce-field-lbl', text: '3. Origin (Country / Region)' }),
            originStateBadge,
            makeFieldHelpBtn('origin')
          ),
          makeDontKnowPill('origin', 'Don\'t Know / Blend')
        ),
        S.h('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap' },
          S.h('span', { class: 'bt-ce-input-sublbl', style: 'margin:0', text: 'Country or Growing Region' }),
          S.h('div', { style: 'display:inline-flex;gap:5px' },
            S.h('button', {
              type: 'button',
              class: 'bt-ce-chip is-compact',
              'aria-pressed': String(c.blend !== 'blend'),
              text: 'Single Origin',
              onclick: function () { c._v64Touched = 'yes'; c.blend = 'single'; S.saveDraftSafe(); repaintAll(); }
            }),
            S.h('button', {
              type: 'button',
              class: 'bt-ce-chip is-compact',
              'aria-pressed': String(c.blend === 'blend'),
              text: 'Blend',
              onclick: function () { c._v64Touched = 'yes'; c.blend = 'blend'; S.saveDraftSafe(); repaintAll(); }
            })
          )
        ),
        S.h('div', { class: 'bt-ce-spotlight' }, S.iconEl('origin-globe', { size: 15 }), originInp),
        originFeedbackHost,
        S.h('div', { class: 'bt-ce-chips-scroll', role: 'group', 'aria-label': 'Popular Origins' },
          POPULAR_ORIGINS_12.map(function (cn) {
            var on = !c.originUnsure && String(c.origin || '').toLowerCase().indexOf(cn.toLowerCase()) >= 0;
            return S.h('button', {
              type: 'button',
              class: 'bt-ce-chip is-compact',
              'aria-pressed': String(on),
              text: cn,
              onclick: function () {
                c._v64Touched = 'yes';
                ceUi.originSearch = '';
                c.originUnsure = '';
                c.origin_unknown = '';
                c.origin = (c.blend === 'blend' && c.origin && !on) ? (c.origin + ', ' + cn) : cn;
                S.haptic('tick');
                S.saveDraftSafe();
                S.notifyChromeSafe();
                repaintAll();
              }
            });
          })
        ),
        subRegions.length ? S.h('div', { class: 'bt-ce-chips-scroll', role: 'group', 'aria-label': 'Sub-regions' },
          subRegions.map(function (sr) {
            var hasSub = String(c.origin || '').toLowerCase().indexOf(sr.toLowerCase()) >= 0;
            return S.h('button', {
              type: 'button',
              class: 'bt-ce-chip is-compact',
              'aria-pressed': String(hasSub),
              text: sr,
              onclick: function () {
                c._v64Touched = 'yes';
                c.region = sr;
                c.originUnsure = '';
                c.origin_unknown = '';
                c.origin = sr + ', ' + matchedCountryForSubs;
                S.haptic('tick');
                S.saveDraftSafe();
                repaintAll();
              }
            });
          })
        ) : null
      ),

      /* Field 4: Process & Caffeine */
      S.h('div', { class: 'bt-ce-field-block' + (ceUi.pulseFieldKey === 'process' ? ' is-needs-answer' : ''), id: 'bt-field-process' },
        S.h('div', { class: 'bt-ce-field-hd' },
          S.h('div', { class: 'bt-ce-field-title-grp' },
            S.h('span', { class: 'bt-ce-field-lbl', text: '4. Process & Caffeine' }),
            processStateBadge,
            makeFieldHelpBtn('process')
          ),
          makeDontKnowPill('process', 'Don\'t Know')
        ),
        S.h('div', { class: 'bt-ce-chips', role: 'group', 'aria-label': 'Processing Method' },
          [
            { k: 'washed',     ico: 'cherry-washed',  lbl: 'Washed',                 on: !isProcUnsure && curProc === 'washed' },
            { k: 'natural',    ico: 'cherry-natural', lbl: 'Natural',                on: !isProcUnsure && curProc === 'natural' },
            { k: 'honey',      ico: 'cherry-honey',   lbl: 'Honey',                  on: isHoneyGroup },
            { k: 'wet-hulled', ico: 'origin-globe',   lbl: 'Wet-Hulled',             on: !isProcUnsure && curProc === 'wet-hulled' },
            { k: 'anaerobic',  ico: 'anaerobic-tank', lbl: 'Anaerobic / Co-Ferment', on: isWildGroup }
          ].map(function (p) {
            return S.h('button', {
              type: 'button',
              class: 'bt-ce-chip',
              'aria-pressed': String(p.on),
              onclick: function () {
                c._v64Touched = 'yes';
                c.process = p.k;
                c.processUnsure = '';
                c.process_unknown = '';
                if (p.k === 'honey' && !c.process_sub) c.process_sub = 'red-honey';
                S.haptic('tick');
                S.saveDraftSafe();
                S.notifyChromeSafe();
                repaintAll();
              }
            }, p.ico ? S.iconEl(p.ico, { size: 15 }) : null, S.h('span', { text: p.lbl }));
          })
        ),
        isHoneyGroup ? S.h('div', { class: 'bt-ce-subwell' },
          S.h('span', { class: 'bt-ce-eyebrow', text: 'Honey Mucilage Tier' }),
          S.h('div', { class: 'bt-ce-chips' },
            [
              ['white-honey', 'White Honey'],
              ['yellow-honey', 'Yellow Honey'],
              ['red-honey', 'Red Honey'],
              ['black-honey', 'Black Honey']
            ].map(function (ht) {
              return S.h('button', {
                type: 'button',
                class: 'bt-ce-chip is-compact',
                'aria-pressed': String(curProc === ht[0] || c.process_sub === ht[0]),
                text: ht[1],
                onclick: function () {
                  c._v64Touched = 'yes';
                  c.process = ht[0];
                  c.process_sub = ht[0];
                  c.processUnsure = '';
                  c.process_unknown = '';
                  S.haptic('tick');
                  S.saveDraftSafe();
                  repaintAll();
                }
              });
            })
          )
        ) : null,
        isWildGroup ? S.h('div', { class: 'bt-ce-subwell' },
          S.h('span', { class: 'bt-ce-eyebrow', text: 'Experimental Fermentation Style (Brewed 2–2.5 °C Cooler)' }),
          S.h('div', { class: 'bt-ce-chips' },
            [
              ['anaerobic', 'Anaerobic'],
              ['carbonic', 'Carbonic Maceration'],
              ['thermal-shock', 'Thermal Shock'],
              ['yeast-koji', 'Yeast / Koji'],
              ['co-ferment', 'Fruit Co-Ferment']
            ].map(function (wt) {
              return S.h('button', {
                type: 'button',
                class: 'bt-ce-chip is-compact',
                'aria-pressed': String(curProc === wt[0]),
                text: wt[1],
                onclick: function () {
                  c._v64Touched = 'yes';
                  c.process = wt[0];
                  c.processUnsure = '';
                  c.process_unknown = '';
                  S.haptic('tick');
                  S.saveDraftSafe();
                  repaintAll();
                }
              });
            })
          )
        ) : null,
        S.h('div', { class: 'bt-ce-chips', role: 'group', 'aria-label': 'Caffeine Level' },
          [
            { k: '',         lbl: 'Regular Caffeine', on: !c.decaf },
            { k: 'half-caf', lbl: 'Half-Caf',         on: c.decaf === 'half-caf' || c.decaf_process === 'half-caf' },
            { k: 'yes',      lbl: 'Decaf',            on: c.decaf === 'yes' && c.decaf_process !== 'half-caf' }
          ].map(function (dc) {
            return S.h('button', {
              type: 'button',
              class: 'bt-ce-chip is-compact',
              'aria-pressed': String(dc.on),
              onclick: function () {
                c._v64Touched = 'yes';
                if (!dc.k) { c.decaf = ''; c.decaf_process = ''; }
                else if (dc.k === 'half-caf') { c.decaf = 'half-caf'; c.decaf_process = 'half-caf'; }
                else { c.decaf = 'yes'; if (!c.decaf_process || c.decaf_process === 'half-caf') c.decaf_process = 'ea'; }
                S.haptic('tick');
                S.saveDraftSafe();
                repaintAll();
              }
            }, dc.k ? S.iconEl('decaf-leaf', { size: 14 }) : null, S.h('span', { text: dc.lbl }));
          })
        ),
        (c.decaf === 'yes' && c.decaf_process !== 'half-caf') ? S.h('div', { class: 'bt-ce-subwell' },
          S.h('span', { class: 'bt-ce-eyebrow', text: 'Decaf Method (Filter +8% Coarser · Espresso -5.5% Finer)' }),
          S.h('div', { class: 'bt-ce-chips' },
            [
              ['ea', 'EA Sugarcane'],
              ['swiss', 'Swiss Water'],
              ['mountain', 'Mountain Water'],
              ['co2', 'Supercritical CO2'],
              ['unknown', 'Don\'t Know']
            ].map(function (dm) {
              return S.h('button', {
                type: 'button',
                class: 'bt-ce-chip is-compact',
                'aria-pressed': String((c.decaf_process || 'ea') === dm[0]),
                text: dm[1],
                onclick: function () { c.decaf_process = dm[0]; S.haptic('tick'); S.saveDraftSafe(); repaintAll(); }
              });
            })
          )
        ) : null
      ),

      /* Field 5: Elevation / Altitude */
      S.h('div', { class: 'bt-ce-field-block' + (ceUi.pulseFieldKey === 'elevation' ? ' is-needs-answer' : ''), id: 'bt-field-elevation' },
        S.h('div', { class: 'bt-ce-field-hd' },
          S.h('div', { class: 'bt-ce-field-title-grp' },
            S.h('span', { class: 'bt-ce-field-lbl', text: '5. Elevation / Altitude' }),
            elevStateBadge,
            makeFieldHelpBtn('elevation')
          ),
          makeDontKnowPill('elevation', 'Don\'t Know')
        ),
        S.h('div', { class: 'bt-ce-chips', role: 'group', 'aria-label': 'Growing Elevation Presets' },
          ELEV_PRESETS_4.map(function (elOpt) {
            var curM = isFinite(+c.elevation_m) && +c.elevation_m > 0 ? +c.elevation_m : -1;
            var isElOn = !c.elevUnsure && (c.density === elOpt.k || (curM >= elOpt.minM && curM <= elOpt.maxM));
            return S.h('button', {
              type: 'button',
              class: 'bt-ce-chip is-compact',
              'aria-pressed': String(isElOn),
              text: elOpt.lbl,
              onclick: function () {
                c._v64Touched = 'yes';
                c.density = elOpt.k;
                c.elevation_m = elOpt.m;
                c.elevText = elOpt.m + ' masl';
                c.elevUnsure = '';
                c.elev_unknown = '';
                S.haptic('tick');
                S.saveDraftSafe();
                S.notifyChromeSafe();
                repaintAll();
              }
            });
          }),
          S.h('button', {
            type: 'button',
            class: 'bt-ce-chip is-compact',
            'aria-pressed': String(ceUi.showExactElev),
            text: (isFinite(+c.elevation_m) && +c.elevation_m > 0) ? ('Exact: ' + c.elevation_m + ' m') : 'Exact m / ft',
            onclick: function () { ceUi.showExactElev = !ceUi.showExactElev; repaintAll(); }
          })
        ),
        ceUi.showExactElev ? S.h('div', { class: 'bt-ce-subwell', style: 'flex-direction:row;align-items:center;flex-wrap:wrap;gap:10px' },
          S.h('label', { style: 'display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:700' },
            S.h('span', { text: 'Meters (masl):' }),
            exactElevMetersInp
          ),
          S.h('label', { style: 'display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:700' },
            S.h('span', { text: 'or Feet (ft):' }),
            exactElevFeetInp
          ),
          elevReadoutSpan
        ) : null
      ),

      /* Optional Field: Varietal */
      S.h('div', { class: 'bt-ce-field-block', id: 'bt-field-varietal' },
        S.h('div', { class: 'bt-ce-field-hd' },
          S.h('div', { class: 'bt-ce-field-title-grp' },
            S.h('span', { class: 'bt-ce-field-lbl', text: 'Plant Varietal (Optional · 70+)' }),
            varStateBadge,
            makeFieldHelpBtn('varietal')
          ),
          makeDontKnowPill('varietal', 'Don\'t Know / Not on Bag')
        ),
        S.h('div', { class: 'bt-ce-spotlight' }, S.iconEl('spark-star', { size: 15 }), varietalInp),
        varietalFeedbackHost,
        S.h('div', { class: 'bt-ce-chips-scroll', role: 'group', 'aria-label': 'Popular Varietals' },
          POPULAR_VARIETALS_12.map(function (vn) {
            var onV = String(c.varietal || '').toLowerCase().indexOf(vn.toLowerCase()) >= 0;
            return S.h('button', {
              type: 'button',
              class: 'bt-ce-chip is-compact',
              'aria-pressed': String(onV),
              text: vn,
              onclick: function () {
                ceUi.varietalSearch = '';
                toggleVarietalTag(vn);
                repaintAll();
              }
            });
          })
        )
      )
    );
    registerStepCardStatus(cardStep12, card2StatusBadge, ['origin', 'process', 'elevation']);
    root.appendChild(cardStep12);

    /* ==================== STEP 1.3 · ROAST DATE ==================== */
    var card3StatusBadge = S.h('span', { class: 'bt-ce-step-status is-needed' });
    var dateStateBadge = registerFieldStateBadge(S.h('span'), 'date');
    var freshInfo = computeSmrkeFreshnessStatus(c);

    var cardStep13 = S.h('section', { class: 'bt-ce-step-card is-card-needed', id: 'bt-step1-card-3' },
      S.h('div', { class: 'bt-ce-step-card-hd' },
        S.h('span', { class: 'bt-ce-step-num-badge', text: 'Step 1.3 · Roast Date' }),
        card3StatusBadge
      ),
      S.h('div', { class: 'bt-ce-field-block' + (ceUi.pulseFieldKey === 'date' ? ' is-needs-answer' : ''), id: 'bt-field-date' },
        S.h('div', { class: 'bt-ce-field-hd' },
          S.h('div', { class: 'bt-ce-field-title-grp' },
            S.h('span', { class: 'bt-ce-field-lbl', text: '6. Printed Roast Date & Cryo-Freeze' }),
            dateStateBadge,
            makeFieldHelpBtn('date')
          ),
          S.h('span', { class: 'bt-ce-badge ' + freshInfo.tone, text: freshInfo.label })
        ),
        buildRoastCalendarControl({
          coffee: c,
          uiState: ceUi,
          showHeaderBadge: false,
          onSync: function () { syncLiveSummariesOnly(); }
        })
      )
    );
    registerStepCardStatus(cardStep13, card3StatusBadge, ['date']);
    root.appendChild(cardStep13);

    /* ==================== STEP 1.4 · BAG FLAVOR NOTES ==================== */
    var historyRows = S.getHistoryObjs();
    var palateGuide = null;
    if (historyRows.length >= 3 && typeof computeSmartBagGuide === 'function') {
      try {
        palateGuide = computeSmartBagGuide(historyRows, c);
      } catch (_) { palateGuide = null; }
    }

    var card4StatusBadge = S.h('span', { class: 'bt-ce-step-status is-needed' });
    var notesStateBadge = registerFieldStateBadge(S.h('span'), 'notes');

    var cardStep14 = S.h('section', { class: 'bt-ce-step-card is-card-needed', id: 'bt-step1-card-4' },
      S.h('div', { class: 'bt-ce-step-card-hd' },
        S.h('span', { class: 'bt-ce-step-num-badge', text: 'Step 1.4 · Bag Flavor Notes' }),
        card4StatusBadge
      ),
      S.h('div', { class: 'bt-ce-field-block' + (ceUi.pulseFieldKey === 'notes' ? ' is-needs-answer' : ''), id: 'bt-field-notes' },
        S.h('div', { class: 'bt-ce-field-hd' },
          S.h('div', { class: 'bt-ce-field-title-grp' },
            S.h('span', { class: 'bt-ce-field-lbl', text: '7. Printed Bag Flavor Notes' }),
            notesStateBadge,
            makeFieldHelpBtn('notes')
          ),
          makeDontKnowPill('notes', 'Don\'t Know / None Listed')
        ),
        S.h('span', { style: 'font-size:11.5px;color:var(--ink-muted)', text: 'Kept blind under foil during Step 5 Tasting, then matched in Preferences!' }),
        buildBagFlavorNotesWidget(c, {
          onSync: function () { syncLiveSummariesOnly(); }
        })
      ),

      /* `Will I Love This Bag?` Personal Palate Match Badge (>= 3 logged tastings) */
      palateGuide ? S.h('div', { class: 'bt-ce-palate-card' },
        S.h('div', { style: 'min-width:0;flex:1' },
          S.h('div', { style: 'display:flex;align-items:center;gap:6px;flex-wrap:wrap' },
            S.iconEl('palate', { size: 16 }),
            S.h('b', { style: 'font-size:13px', text: 'Will I Love This Bag? · ' + S.stripEmojis(palateGuide.badge || 'Palate Fit') }),
            S.h('span', { class: 'bt-ce-badge is-good', text: Math.round(palateGuide.matchPct || 50) + '% Match' })
          ),
          S.h('div', { style: 'font-size:12px;color:var(--ink-secondary);margin-top:2px', text: S.stripEmojis(palateGuide.summary || 'Matched against your personal tasting history.') })
        )
      ) : (historyRows.length > 0 ? S.h('div', { style: 'font-size:11.5px;color:var(--ink-muted)', text: 'Log ' + Math.max(1, 3 - historyRows.length) + ' more cup(s) to unlock your personal "Will I Love This Bag?" Palate Match predictor.' }) : null),

      /* `Facts in Four Parts` Deep-Dive Launcher (`screenCoffee`) */
      S.h('button', {
        type: 'button',
        class: 'bt-ce-facts-btn',
        onclick: function () { flushPendingStep1Drafts(c); openCoffeeFactsSheet(); }
      },
        S.h('div', { style: 'display:flex;align-items:center;gap:10px;min-width:0' },
          S.iconEl('xray-loupe', { size: 20 }),
          S.h('div', { style: 'min-width:0' },
            S.h('b', { style: 'display:block;font-size:13.5px;color:var(--ink)', text: 'Facts in Four Parts · Bag X-Ray →' }),
            S.h('span', { style: 'display:block;font-size:11.5px;color:var(--ink-secondary)', text: '1. Origin Terroir · 2. Botany & Genetics · 3. Post-Harvest · 4. Brew Strategy' })
          )
        ),
        S.iconEl('chevron-right', { size: 18 })
      )
    );
    registerStepCardStatus(cardStep14, card4StatusBadge, ['notes']);
    root.appendChild(cardStep14);
  }

  /* -------------------- 9. `1-Card Guided Mode` (Beanjamin 5-Card Conversational Flow) -------------------- */
  function mountGuidedCardsView(root, c, unifiedRecs, repaintAll, syncLiveSummariesOnly, advanceToBrewer) {
    var GUIDED_CARDS_5 = [
      { idx: 0, pill: '1. Name',    helpKey: 'name',    title: 'Card 1 of 5 · Name & Roaster',             tip: 'Look for the biggest title on the front label. Unlabeled bag? Tap "Don\'t Know — Skip →"!' },
      { idx: 1, pill: '2. Roast',   helpKey: 'roast',   title: 'Card 2 of 5 · Roast Color',                tip: 'Check for Light, Filter, Omni, Medium, or Dark. Lighter roasts love hotter water; darker roasts love cooler water.' },
      { idx: 2, pill: '3. Process', helpKey: 'process', title: 'Card 3 of 5 · Process & Decaf',            tip: 'Washed = crisp & tea-clean; Natural = jammy fruit; Honey = golden sweetness; Decaf = gentler cell walls.' },
      { idx: 3, pill: '4. Origin',  helpKey: 'origin',  title: 'Card 4 of 5 · Origin, Elevation & Plant',  tip: 'Pick the country, altitude band, and optional varietal if printed on the bag.' },
      { idx: 4, pill: '5. Date',    helpKey: 'date',    title: 'Card 5 of 5 · Roast Date & Flavor Notes',  tip: 'Tap your bag\'s printed roast date on the calendar and lock in any tasting notes!' }
    ];

    var curIdx = Math.max(0, Math.min(4, ceUi.guidedIdx || 0));
    var cardMeta = GUIDED_CARDS_5[curIdx];

    /* Mobile-only Beanjamin Coach Strip (CSS hides >=1024px where #studio-aside already shows Beanjamin) */
    var bjAvatar = S.h('div', { class: 'bt-ce-bj-avatar' });
    if (typeof window !== 'undefined' && window.Beanjamin && typeof window.Beanjamin.svg === 'function') {
      try { bjAvatar.innerHTML = window.Beanjamin.svg('curious', { view: 'avatar' }); } catch (_) {}
    } else {
      bjAvatar.appendChild(S.iconEl('spark-star', { size: 22 }));
    }
    root.appendChild(S.h('div', { class: 'bt-ce-bj-guide' },
      bjAvatar,
      S.h('div', { style: 'font-size:12.5px;line-height:1.38;color:var(--ink)' },
        S.h('b', { style: 'display:block;color:var(--accent);font-size:11.5px', text: 'Beanjamin 1-Card Guide' }),
        S.h('span', { text: cardMeta.tip })
      )
    ));

    /* Tappable 1..5 Progress Pill Strip */
    root.appendChild(S.h('div', { class: 'bt-ce-guided-steps', role: 'tablist', 'aria-label': 'Guided Coffee Questions' },
      GUIDED_CARDS_5.map(function (gc) {
        return S.h('button', {
          type: 'button',
          class: 'bt-ce-chip is-compact' + (gc.idx === curIdx ? ' is-active' : ''),
          'aria-pressed': String(gc.idx === curIdx),
          text: gc.pill,
          onclick: function () { flushPendingStep1Drafts(c); ceUi.guidedIdx = gc.idx; S.haptic('tick'); repaintAll(); }
        });
      })
    ));

    var bodySlot = S.h('div', { style: 'display:flex;flex-direction:column;gap:10px' });

    function nextCardOrFinish() {
      flushPendingStep1Drafts(c);
      S.haptic('tick');
      if (curIdx < 4) {
        ceUi.guidedIdx = curIdx + 1;
        repaintAll();
      } else {
        advanceToBrewer();
      }
    }

    if (curIdx === 0) {
      bodySlot.append(
        S.h('div', { style: 'display:flex;flex-direction:column;gap:4px' },
          S.h('span', { class: 'bt-ce-input-sublbl', text: 'Roaster' }),
          S.h('div', { class: 'bt-ce-spotlight' },
            S.iconEl('spark-star', { size: 15 }),
            S.h('input', {
              type: 'text',
              value: c.roaster || '',
              placeholder: 'Roaster (e.g. Onyx Coffee Lab)',
              'aria-label': 'Roaster name',
              oninput: function (e) { c._v64Touched = 'yes'; c.roaster = e.target.value; if (c.roaster) { c.roasterUnsure = ''; c.nameUnsure = ''; } syncLiveSummariesOnly(); }
            })
          )
        ),
        S.h('div', { style: 'display:flex;flex-direction:column;gap:4px' },
          S.h('span', { class: 'bt-ce-input-sublbl', text: 'Coffee Name' }),
          S.h('div', { class: 'bt-ce-spotlight' },
            S.iconEl('fresh-bag', { size: 15 }),
            S.h('input', {
              type: 'text',
              value: c.nameUnsure === 'yes' ? '' : (c.name || ''),
              placeholder: 'Coffee Name (e.g. Worka Chelbesa)',
              'aria-label': 'Coffee name',
              oninput: function (e) { c._v64Touched = 'yes'; c.name = e.target.value; if (c.name) c.nameUnsure = ''; syncLiveSummariesOnly(); }
            })
          )
        ),
        S.h('button', {
          type: 'button',
          class: 'bt-ce-chip is-active',
          text: 'Next: Roast Color →',
          onclick: nextCardOrFinish
        })
      );
    } else if (curIdx === 1) {
      bodySlot.appendChild(S.h('div', { class: 'bt-ce-roast-grid' },
        S.ROAST_STOPS.map(function (st) {
          return S.h('button', {
            type: 'button',
            class: 'bt-ce-roast-swatch',
            'aria-pressed': String(!c.roastUnsure && c.roast === st.key),
            onclick: function () {
              c._v64Touched = 'yes';
              c.roast = st.key;
              c.roastUnsure = '';
              c.roast_unknown = '';
              S.saveDraftSafe();
              nextCardOrFinish();
            }
          },
            S.h('span', { class: 'bt-ce-roast-disc', style: 'background:' + st.hex }),
            S.h('span', { text: st.label })
          );
        })
      ));
    } else if (curIdx === 2) {
      bodySlot.append(
        S.h('div', { class: 'bt-ce-chips' },
          [
            ['washed', 'Washed (Crisp & Clean)'],
            ['natural', 'Natural (Jammy Fruit)'],
            ['red-honey', 'Honey (Sweet Stone Fruit)'],
            ['wet-hulled', 'Wet-Hulled (Rich & Earthy)'],
            ['anaerobic', 'Anaerobic / Thermal Shock']
          ].map(function (p) {
            return S.h('button', {
              type: 'button',
              class: 'bt-ce-chip',
              'aria-pressed': String(!c.processUnsure && c.process === p[0]),
              text: p[1],
              onclick: function () { c._v64Touched = 'yes'; c.process = p[0]; c.processUnsure = ''; c.process_unknown = ''; S.saveDraftSafe(); nextCardOrFinish(); }
            });
          })
        ),
        S.h('div', { class: 'bt-ce-chips' },
          [
            ['', 'Regular Caffeine'],
            ['half-caf', 'Half-Caf'],
            ['yes', 'Decaf (EA / Swiss Water)']
          ].map(function (dc) {
            var on = dc[0] === '' ? !c.decaf : c.decaf === dc[0];
            return S.h('button', {
              type: 'button',
              class: 'bt-ce-chip is-compact',
              'aria-pressed': String(on),
              text: dc[1],
              onclick: function () {
                c.decaf = dc[0];
                c.decaf_process = dc[0] === 'yes' ? 'ea' : (dc[0] === 'half-caf' ? 'half-caf' : '');
                S.saveDraftSafe();
                repaintAll();
              }
            });
          })
        )
      );
    } else if (curIdx === 3) {
      bodySlot.append(
        S.h('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap' },
          S.h('span', { class: 'bt-ce-input-sublbl', text: 'Origin Country' }),
          S.h('button', {
            type: 'button',
            class: 'bt-ce-dontknow-pill' + (c.originUnsure === 'yes' ? ' is-active' : ''),
            'aria-pressed': String(c.originUnsure === 'yes'),
            onclick: function () { setFieldDontKnow(c, 'origin', c.originUnsure !== 'yes'); S.saveDraftSafe(); repaintAll(); }
          }, S.h('span', { text: 'Don\'t Know / Blend' }))
        ),
        S.h('div', { class: 'bt-ce-chips' },
          POPULAR_ORIGINS_12.slice(0, 8).map(function (cn) {
            return S.h('button', {
              type: 'button',
              class: 'bt-ce-chip',
              'aria-pressed': String(!c.originUnsure && String(c.origin || '').indexOf(cn) >= 0),
              text: cn,
              onclick: function () { c._v64Touched = 'yes'; c.origin = cn; c.originUnsure = ''; c.origin_unknown = ''; S.saveDraftSafe(); repaintAll(); }
            });
          })
        ),
        S.h('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap;padding-top:4px;border-top:1px solid var(--line-soft)' },
          S.h('div', { style: 'display:inline-flex;align-items:center;gap:6px' },
            S.h('span', { class: 'bt-ce-input-sublbl', text: 'Elevation' }),
            makeFieldHelpBtn('elevation')
          ),
          S.h('button', {
            type: 'button',
            class: 'bt-ce-dontknow-pill' + (c.elevUnsure === 'yes' ? ' is-active' : ''),
            'aria-pressed': String(c.elevUnsure === 'yes'),
            onclick: function () { setFieldDontKnow(c, 'elevation', c.elevUnsure !== 'yes'); S.saveDraftSafe(); repaintAll(); }
          }, S.h('span', { text: 'Don\'t Know' }))
        ),
        S.h('div', { class: 'bt-ce-chips' },
          [
            { k: 'low',       m: 1050, lbl: 'Low <1,200m' },
            { k: 'mid',       m: 1450, lbl: 'Medium 1,200–1,600m' },
            { k: 'high',      m: 1800, lbl: 'High 1,600–1,950m' },
            { k: 'very-high', m: 2050, lbl: 'Ultra-High 2,000m+' }
          ].map(function (elB) {
            return S.h('button', {
              type: 'button',
              class: 'bt-ce-chip is-compact',
              'aria-pressed': String(!c.elevUnsure && c.density === elB.k),
              text: elB.lbl,
              onclick: function () { c._v64Touched = 'yes'; c.density = elB.k; c.elevation_m = elB.m; c.elevText = elB.m + ' masl'; c.elevUnsure = ''; c.elev_unknown = ''; S.saveDraftSafe(); repaintAll(); }
            });
          })
        ),
        S.h('div', { class: 'bt-ce-chips' },
          POPULAR_VARIETALS_12.slice(0, 6).map(function (vn) {
            return S.h('button', {
              type: 'button',
              class: 'bt-ce-chip is-compact',
              'aria-pressed': String(String(c.varietal || '').indexOf(vn) >= 0),
              text: vn,
              onclick: function () { c._v64Touched = 'yes'; c.varietal = vn; c.varietalUnsure = ''; S.saveDraftSafe(); nextCardOrFinish(); }
            });
          })
        ),
        S.h('button', {
          type: 'button',
          class: 'bt-ce-chip is-active',
          text: 'Next: Date & Flavors →',
          onclick: nextCardOrFinish
        })
      );
    } else {
      bodySlot.append(
        buildRoastCalendarControl({
          coffee: c,
          uiState: ceUi,
          onSync: function () { syncLiveSummariesOnly(); }
        }),
        S.h('div', { style: 'padding-top:6px;border-top:1px solid var(--line-soft);display:flex;flex-direction:column;gap:6px' },
          S.h('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap' },
            S.h('div', { style: 'display:inline-flex;align-items:center;gap:6px' },
              S.h('span', { class: 'bt-ce-input-sublbl', text: 'Printed Bag Flavor Notes' }),
              makeFieldHelpBtn('notes')
            ),
            S.h('button', {
              type: 'button',
              class: 'bt-ce-dontknow-pill' + (c.notesUnsure === 'yes' ? ' is-active' : ''),
              'aria-pressed': String(c.notesUnsure === 'yes'),
              onclick: function () { setFieldDontKnow(c, 'notes', c.notesUnsure !== 'yes'); S.saveDraftSafe(); repaintAll(); }
            }, S.h('span', { text: 'Don\'t Know / None Listed' }))
          ),
          buildBagFlavorNotesWidget(c, {
            maxQuickChips: 12,
            onSync: function () { syncLiveSummariesOnly(); }
          })
        )
      );
    }

    var guidedCard = S.h('section', { class: 'bt-ce-card bt-ce-card-hero' },
      S.h('div', { class: 'bt-ce-card-hd' },
        S.h('div', { style: 'display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap' },
          S.h('h2', { class: 'bt-ce-card-title', text: cardMeta.title }),
          makeFieldHelpBtn(cardMeta.helpKey)
        ),
        S.h('span', { class: 'bt-ce-bag-rem', text: (curIdx + 1) + ' / 5' })
      ),
      bodySlot,
      S.h('div', { class: 'bt-ce-guided-foot' },
        S.h('button', {
          type: 'button',
          class: 'bt-ce-chip is-compact',
          disabled: curIdx === 0,
          text: '← Back',
          onclick: function () { if (curIdx > 0) { flushPendingStep1Drafts(c); ceUi.guidedIdx = curIdx - 1; S.haptic('tick'); repaintAll(); } }
        }),
        S.h('button', {
          type: 'button',
          class: 'bt-ce-skip-btn',
          text: 'Don\'t Know — Skip →',
          onclick: function () {
            flushPendingStep1Drafts(c);
            if (curIdx === 0 && !isFieldAnswered(c, 'name')) setFieldDontKnow(c, 'name', true);
            if (curIdx === 1 && !isFieldAnswered(c, 'roast')) setFieldDontKnow(c, 'roast', true);
            if (curIdx === 2 && !isFieldAnswered(c, 'process')) setFieldDontKnow(c, 'process', true);
            if (curIdx === 3) {
              if (!isFieldAnswered(c, 'origin')) setFieldDontKnow(c, 'origin', true);
              if (!isFieldAnswered(c, 'elevation')) setFieldDontKnow(c, 'elevation', true);
            }
            if (curIdx === 4) {
              if (!isFieldAnswered(c, 'date')) setFieldDontKnow(c, 'date', true);
              if (!isFieldAnswered(c, 'notes')) setFieldDontKnow(c, 'notes', true);
            }
            S.saveDraftSafe();
            nextCardOrFinish();
          }
        })
      )
    );

    /* Horizontal Touch Swipe Support on Guided Card (ignores inputs & calendar popover) */
    var touchX0 = null;
    guidedCard.addEventListener('pointerdown', function (ev) {
      var tg = ev && ev.target;
      if (tg && tg.closest && (tg.closest('input,textarea,select,[data-bt-roast-calendar]'))) {
        touchX0 = null;
        return;
      }
      touchX0 = ev.clientX;
    });
    guidedCard.addEventListener('pointerup', function (ev) {
      if (touchX0 == null) return;
      var dx = ev.clientX - touchX0;
      touchX0 = null;
      if (Math.abs(dx) >= 58) {
        flushPendingStep1Drafts(c);
        if (dx < 0 && curIdx < 4) { ceUi.guidedIdx = curIdx + 1; S.haptic('tick'); repaintAll(); }
        else if (dx > 0 && curIdx > 0) { ceUi.guidedIdx = curIdx - 1; S.haptic('tick'); repaintAll(); }
      }
    });

    root.appendChild(guidedCard);
  }

  /* -------------------- 10. `My Coffees` Vault Sheet (`BTMyCoffeesVault`) -------------------- */
  var vaultUi = {
    facet: 'all',
    originFilter: '',
    query: '',
    freshOpenKey: '',
    freshIso: '',
    freshFreeze: false,
    freshDaysBack: 2,
    visibleLimit: 60
  };

  function buildMyCoffeesVault() {
    var root = S.h('div', { class: 'bt-ce-sheet', id: 'bt-my-coffees-vault' });

    function repaint() {
      root.textContent = '';
      var allRecs = S.buildUnifiedCoffeesSafe();

      root.appendChild(S.h('div', { class: 'bt-ce-sheet-topbar' },
        S.h('button', {
          type: 'button',
          class: 'bt-ce-back-btn',
          onclick: closeOrBackFromCoffeeModal
        }, S.iconEl('chevron-left', { size: 15 }), S.h('span', { text: '← Back' })),
        S.h('button', {
          type: 'button',
          class: 'bt-ce-chip is-compact is-active',
          onclick: function () { openPasteModal(''); }
        }, S.iconEl('spark-star', { size: 14 }), S.h('span', { text: '+ Magic AI Paste' }))
      ));

      root.appendChild(S.h('div', null,
        S.h('div', { class: 'bt-ce-kicker', text: 'Living Bean Vault' }),
        S.h('p', { class: 'bt-ce-sub', text: allRecs.length + ' saved coffee(s) · 1 tap restores bean & winning recipe.' })
      ));

      var searchInp = S.h('input', {
        type: 'search',
        placeholder: 'Search coffee, roaster, origin, varietal, or notes...',
        value: vaultUi.query,
        'aria-label': 'Search saved coffees',
        oninput: function (e) {
          vaultUi.query = e.target.value;
          vaultUi.visibleLimit = 60;
          paintRowsOnly();
        }
      });
      root.appendChild(S.h('div', { class: 'bt-ce-spotlight' }, S.iconEl('search-filter', { size: 16 }), searchInp));

      var facets = [
        { k: 'all',      lbl: 'All (' + allRecs.length + ')' },
        { k: 'open',     lbl: 'Open Bags' },
        { k: 'dialed',   lbl: 'Dialed In' },
        { k: 'light',    lbl: 'Light' },
        { k: 'medium',   lbl: 'Medium' },
        { k: 'dark',     lbl: 'Dark' },
        { k: 'decaf',    lbl: 'Decaf' }
      ];
      root.appendChild(S.h('div', { class: 'bt-ce-chips-scroll', role: 'tablist', 'aria-label': 'Filter Vault' },
        facets.map(function (f) {
          return S.h('button', {
            type: 'button',
            class: 'bt-ce-chip is-compact',
            'aria-pressed': String(vaultUi.facet === f.k),
            text: f.lbl,
            onclick: function () { vaultUi.facet = f.k; S.haptic('tick'); repaint(); }
          });
        })
      ));

      var listHost = S.h('div', { style: 'display:flex;flex-direction:column;gap:8px' });
      root.appendChild(listHost);

      function paintRowsOnly() {
        listHost.textContent = '';
        var qLow = String(vaultUi.query || '').trim().toLowerCase();
        var filtered = allRecs.filter(function (r) {
          if (qLow) {
            var hay = [r.name, r.roaster, r.origin, r.process, r.varietal, r.bag_notes].join(' ').toLowerCase();
            if (hay.indexOf(qLow) < 0) return false;
          }
          var rl = String(r.roast || '').toLowerCase();
          if (vaultUi.facet === 'open') return !!r.openBag;
          if (vaultUi.facet === 'dialed') return !!(r.lockedBrew || (r.bestStars && r.bestStars >= 4.25));
          if (vaultUi.facet === 'light') return rl.indexOf('light') >= 0;
          if (vaultUi.facet === 'medium') return rl === 'medium' || rl.indexOf('med') === 0;
          if (vaultUi.facet === 'dark') return rl.indexOf('dark') >= 0;
          if (vaultUi.facet === 'decaf') return !!r.decaf;
          return true;
        });

        if (!filtered.length) {
          listHost.appendChild(S.h('div', { class: 'bt-ce-subwell', style: 'text-align:center;padding:20px' },
            S.h('p', { class: 'bt-ce-sub', text: allRecs.length ? 'No saved coffees matched that search.' : 'Your Coffee Vault is ready — capture a bag on Step 1 or import your CSV backup.' })
          ));
          return;
        }

        filtered.slice(0, vaultUi.visibleLimit).forEach(function (rec, idx) {
          var rKey = 'vrow_' + (rec.key || rec.coffee_id || idx);
          var anchor = rec.lockedBrew || rec.bestBrew || rec.latestBrew;
          var rCol = S.roastColorFor(rec.roast || rec.ground_agtron);

          var freshInlineNode = null;
          if (vaultUi.freshOpenKey === rKey) {
            var vFreshDraft = {
              roast: rec.roast || 'light',
              roast_date: vaultUi.freshIso || S.isoDaysAgo(5),
              dateUnsure: '',
              is_frozen: vaultUi.freshFreeze ? 'yes' : '',
              frozen_date: vaultUi.freshFreeze ? S.isoDaysAgo(0) : ''
            };
            var vCalState = {
              showDatePicker: true,
              datePickerTarget: 'roast',
              calViewYear: 0,
              calViewMonth: -1
            };
            var vApplyBtn = S.h('button', {
              type: 'button',
              class: 'bt-ce-bag-brew',
              style: 'min-height:42px;padding:0 14px;width:100%',
              text: 'Use ' + (formatHumanIsoDate(vFreshDraft.roast_date) || 'Selected Date') + ' & Brew →',
              onclick: function () {
                var chosen = vFreshDraft.dateUnsure ? 'unsure' : (vFreshDraft.roast_date || S.isoDaysAgo(0));
                var isFz = vFreshDraft.is_frozen === 'yes';
                var fzDt = vFreshDraft.frozen_date || S.isoDaysAgo(0);
                vaultUi.freshOpenKey = '';
                applyFreshBagRollover(rec, chosen, 250, isFz, false, fzDt);
              }
            });
            freshInlineNode = S.h('div', { class: 'bt-ce-fresh-inline' },
              S.h('div', { class: 'bt-ce-card-hd' },
                S.h('span', { class: 'bt-ce-eyebrow', text: 'New Bag Printed Roast Date (Keeps Locked Recipe)' }),
                S.h('button', { type: 'button', class: 'bt-ce-link-btn', text: 'Cancel', onclick: function () { vaultUi.freshOpenKey = ''; paintRowsOnly(); } })
              ),
              buildRoastCalendarControl({
                coffee: vFreshDraft,
                uiState: vCalState,
                defaultOpen: true,
                hideDoneBtn: true,
                showHeaderBadge: false,
                kickerText: 'New Bag Printed Roast Date',
                onSync: function () {
                  vaultUi.freshIso = vFreshDraft.roast_date || '';
                  vaultUi.freshFreeze = vFreshDraft.is_frozen === 'yes';
                  vApplyBtn.textContent = vFreshDraft.dateUnsure
                    ? 'Use Unstamped Bag & Brew →'
                    : ('Use ' + (formatHumanIsoDate(vFreshDraft.roast_date) || 'Selected Date') + (vFreshDraft.is_frozen === 'yes' ? ' (-18 °C)' : '') + ' & Brew →');
                }
              }),
              vApplyBtn
            );
          }

          listHost.appendChild(S.h('div', {
            class: 'bt-vault-row-v62',
            style: '--bag-roast-col:' + rCol
          },
            S.h('div', { style: 'display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap' },
              S.h('div', { style: 'min-width:0;flex:1' },
                S.h('div', { class: 'bt-ce-bag-roaster', text: [rec.roaster, rec.origin, rec.process].filter(Boolean).join(' · ') || 'Saved Coffee' }),
                S.h('div', { class: 'bt-ce-bag-name', style: 'font-size:15px', text: rec.name || 'Unnamed Coffee' }),
                S.h('div', { style: 'font-size:12px;color:var(--ink-secondary);margin-top:2px', text: formatProvenanceBadge(anchor) })
              ),
              S.h('div', { style: 'display:flex;gap:6px' },
                S.h('button', {
                  type: 'button',
                  class: 'bt-ce-bag-brew',
                  style: 'padding:0 12px',
                  text: 'Brew →',
                  onclick: function () { applySavedCoffeeSelection(rec, { targetRoute: 'method' }); }
                }),
                S.h('button', {
                  type: 'button',
                  class: 'bt-ce-bag-fresh',
                  'aria-expanded': String(vaultUi.freshOpenKey === rKey),
                  text: 'Fresh Bag',
                  onclick: function () {
                    if (vaultUi.freshOpenKey === rKey) {
                      vaultUi.freshOpenKey = '';
                    } else {
                      vaultUi.freshOpenKey = rKey;
                      vaultUi.freshIso = S.isoDaysAgo(5);
                      vaultUi.freshFreeze = false;
                    }
                    S.haptic('tick');
                    paintRowsOnly();
                  }
                })
              )
            ),
            freshInlineNode
          ));
        });
      }

      paintRowsOnly();
    }

    repaint();
    return root;
  }

  function openMyCoffeesSheet() {
    var a = S.getApp();
    if (a && a.coffee) flushPendingStep1Drafts(a.coffee);
    S.openSheetSafe('my-coffees', {}, { title: 'My Coffees Vault', detent: 'full' });
  }

  /* -------------------- 11. `Facts in Four Parts` (`screenCoffee` Deep-Dive Sheet) -------------------- */
  function buildCoffeeFactsSheet(payload) {
    var a = S.getApp();
    var c = (payload && payload.coffee) || a.coffee || {};
    var lens = getActiveLensLevel();
    var now = new Date();

    var gObj = null, exObj = null;
    if (typeof guideFor === 'function') {
      try { gObj = guideFor(c, now); } catch (_) {}
    }
    if (typeof expectFor === 'function') {
      try { exObj = expectFor(c, now); } catch (_) {}
    }

    var origEntry = (gObj && gObj.origin) || (typeof ORIGINS !== 'undefined' && Array.isArray(ORIGINS)
      ? ORIGINS.find(function (o) { return c.origin && String(c.origin).toLowerCase().indexOf(o.name.toLowerCase()) >= 0; })
      : null);
    var varEntries = (gObj && Array.isArray(gObj.varieties) && gObj.varieties.length) ? gObj.varieties
      : (typeof varietiesFor === 'function' ? varietiesFor(c.varietal || '') : []);
    var procKey = c.process || 'washed';
    var procGuide = (typeof PROCESS_GUIDE === 'object' && PROCESS_GUIDE && (PROCESS_GUIDE[procKey] || PROCESS_GUIDE[procKey.replace(/^(white|yellow|red|black)-/, '')])) || {
      name: procKey || 'Washed',
      what: 'Post-harvest fruit removal and drying shape fruit brightness, sweetness, and bean porosity.',
      cup: 'Washed yields crisp clarity; Natural & Honey boost berry/stone-fruit sweetness and body.',
      brew: 'More fermented or porous lots extract faster — Step 3 lowers water temp 1.2–2.5 °C to prevent harshness.'
    };
    var roastKey = c.roast || 'light';
    var roastGuide = (typeof ROAST_GUIDE === 'object' && ROAST_GUIDE && ROAST_GUIDE[roastKey]) || {
      what: 'Roast development controls bean density, CO2 rest gas, and natural sugar browning.',
      cup: 'Lighter roasts highlight origin florals & fruit; medium-to-dark roasts emphasize caramel & cocoa.',
      brew: 'Lighter dense beans love hotter water (94–98 °C); darker porous beans brew sweeter cooler (84–90 °C).'
    };
    var fresh = computeSmrkeFreshnessStatus(c);

    var root = S.h('div', { class: 'bt-ce-sheet', id: 'bt-coffee-facts-sheet' });

    function scrollToPart(secId) {
      var target = root.querySelector('#' + secId);
      if (target && typeof target.scrollIntoView === 'function') {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    /* Sticky Top Back + 4-Part Jump Navigation */
    root.appendChild(S.h('nav', { class: 'bt-facts-nav', 'aria-label': 'Facts in Four Parts navigation' },
      S.h('button', {
        type: 'button',
        class: 'bt-ce-back-btn',
        onclick: closeOrBackFromCoffeeModal
      }, S.iconEl('chevron-left', { size: 15 }), S.h('span', { text: '← Back' })),
      [
        ['bt-fpart-1', '1. Origin Terroir'],
        ['bt-fpart-2', '2. Botany & Genetics'],
        ['bt-fpart-3', '3. Post-Harvest'],
        ['bt-fpart-4', '4. Brew Strategy']
      ].map(function (item) {
        return S.h('button', {
          type: 'button',
          class: 'bt-ce-chip is-compact',
          text: item[1],
          onclick: function () { S.haptic('tick'); scrollToPart(item[0]); }
        });
      })
    ));

    /* Bag Hero Header */
    root.appendChild(S.h('div', { class: 'bt-ce-passport' },
      S.h('div', { class: 'bt-ce-bag-roaster', text: c.roaster || 'Coffee Bag Deep-Dive' }),
      S.h('h2', { class: 'bt-ce-title', text: c.name || c.origin || 'Your Coffee, Explained in Four Parts' }),
      S.h('p', { class: 'bt-ce-sub', text: [c.origin, c.varietal, c.process ? c.process.replace(/-/g, ' ') : '', c.elevation_m ? c.elevation_m + ' masl' : ''].filter(Boolean).join(' · ') || 'Plain-English terroir, genetics, processing, and how they shape your Step 3 recipe.' })
    ));

    /* PART 1: Origin Terroir & Seed-to-Cup */
    var cmpHost = S.h('div');
    if (origEntry && typeof ORIGINS !== 'undefined' && Array.isArray(ORIGINS) && typeof compareOrigins === 'function') {
      var altKey = origEntry.key === 'ethiopia' ? 'colombia' : 'ethiopia';
      var cmpSel = S.h('select', {
        style: 'padding:6px 10px;border-radius:10px;border:1px solid var(--line);background:var(--surface);font-size:16px',
        'aria-label': 'Compare origin with another coffee country'
      }, ORIGINS.filter(function (o) { return o.key !== origEntry.key && o.key !== 'africa'; }).map(function (o) {
        return S.h('option', { value: o.key, selected: o.key === altKey, text: o.name });
      }));
      var cmpBody = S.h('div', { style: 'font-size:12.5px;color:var(--ink-secondary);line-height:1.42;margin-top:6px' });
      function paintCmp() {
        cmpBody.textContent = '';
        try {
          var cmp = compareOrigins(origEntry.key, cmpSel.value);
          if (cmp && Array.isArray(cmp.rows)) {
            cmp.rows.slice(0, 3).forEach(function (r) {
              cmpBody.appendChild(S.h('div', { style: 'margin-bottom:5px' },
                S.h('b', { style: 'color:var(--ink)', text: r[0] + ': ' }),
                S.h('span', { text: cmp.a.name + ' (' + r[1] + ') vs ' + cmp.b.name + ' (' + r[2] + ')' })
              ));
            });
          }
        } catch (_) {}
      }
      cmpSel.addEventListener('change', paintCmp);
      paintCmp();
      cmpHost.appendChild(S.h('div', { class: 'bt-ce-subwell' },
        S.h('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap' },
          S.h('span', { class: 'bt-ce-eyebrow', text: 'Compare ' + origEntry.name + ' With:' }),
          cmpSel
        ),
        cmpBody
      ));
    }

    var part1 = S.h('section', { class: 'bt-ce-card bt-facts-sec', id: 'bt-fpart-1' },
      S.h('div', { class: 'bt-ce-card-hd' },
        S.h('h3', { class: 'bt-ce-card-title' }, S.iconEl('origin-globe', { size: 18 }), S.h('span', { text: 'Part 1 · Origin Terroir & Elevation' })),
        S.epistemicBadgeEl('verified_physics')
      ),
      origEntry ? S.h('div', { style: 'display:flex;flex-direction:column;gap:6px;font-size:13px;line-height:1.45;color:var(--ink-secondary)' },
        S.h('div', null, S.h('b', { style: 'color:var(--ink)', text: origEntry.name + ' Cup Signature: ' }), S.h('span', { text: origEntry.feel || origEntry.short })),
        S.h('div', null, S.h('b', { style: 'color:var(--ink)', text: 'Terroir & Altitude: ' }), S.h('span', { text: origEntry.grown })),
        S.h('div', null, S.h('b', { style: 'color:var(--ink)', text: 'Brewing Tip: ' }), S.h('span', { text: origEntry.tip }))
      ) : S.h('p', { class: 'bt-ce-sub', text: c.blend === 'blend' ? 'Multi-origin blend: balances complementary regional sweetness, body, and seasonal brightness.' : 'Add an origin country on Step 1 to see specific regional elevation, harvest, and flavor tendencies.' }),
      c.elevation_m ? S.h('div', { class: 'bt-ce-subwell' },
        S.h('b', { style: 'font-size:12.5px', text: 'Growing Altitude: ' + c.elevation_m + ' masl (' + Math.round(+c.elevation_m * 3.28084) + ' ft)' }),
        S.h('span', { style: 'font-size:12px;color:var(--ink-secondary)', text: +c.elevation_m >= 1650 ? 'Cool mountain nights slow cherry ripening, building dense high-altitude beans rich in natural sugars and lively fruit.' : 'Warm moderate-elevation ripening builds round nutty-chocolate body and smooth, mellow acidity.' })
      ) : null,
      cmpHost
    );
    root.appendChild(part1);

    /* PART 2: Botany, Cultivar Genetics & Caffeine */
    var speciesLow = String(c.species || 'arabica').toLowerCase();
    var isDecaf = c.decaf === 'yes' && c.decaf_process !== 'half-caf';
    var isHalf = c.decaf === 'half-caf' || c.decaf_process === 'half-caf';
    var doseRef = (a.brew && +a.brew.dose > 0) ? +a.brew.dose : 15;
    var mgPerGram = isDecaf ? 0.4 : isHalf ? 5.8 : (speciesLow === 'robusta' ? 19.5 : speciesLow === 'laurina' ? 5.0 : speciesLow === 'eugenioides' ? 2.0 : 11.2);
    var estCupMg = Math.round(doseRef * mgPerGram);
    var fdaPct = Math.min(100, Math.round((estCupMg / 400) * 100));

    var part2 = S.h('section', { class: 'bt-ce-card bt-facts-sec', id: 'bt-fpart-2' },
      S.h('div', { class: 'bt-ce-card-hd' },
        S.h('h3', { class: 'bt-ce-card-title' }, S.iconEl('spark-star', { size: 18 }), S.h('span', { text: 'Part 2 · Botany, Genetics & Caffeine' })),
        S.h('span', { class: 'bt-ce-badge is-sci', text: (c.species || 'Arabica').toUpperCase() })
      ),
      varEntries.length ? S.h('div', { style: 'display:flex;flex-direction:column;gap:7px' },
        varEntries.map(function (ve) {
          return S.h('div', { class: 'bt-ce-subwell' },
            S.h('b', { style: 'font-size:13px;color:var(--ink)', text: ve.name }),
            S.h('span', { style: 'font-size:12.5px;color:var(--ink-secondary);line-height:1.42', text: ve.text })
          );
        })
      ) : S.h('p', { class: 'bt-ce-sub', text: c.varietal ? ('Cultivar: ' + c.varietal + ' — shapes floral/fruit aromatics, bean size, and how cleanly beans grind.') : 'Add varietals (e.g. Gesha, Pink Bourbon, SL28, Heirloom) on Step 1 to see genetic lineage & grinding tips.' }),
      S.h('div', { class: 'bt-ce-subwell' },
        S.h('div', { class: 'bt-ce-card-hd' },
          S.h('b', { style: 'font-size:12.5px', text: 'Estimated Caffeine (~' + doseRef + 'g dose): ~' + estCupMg + ' mg' }),
          S.h('span', { style: 'font-size:11px;color:var(--ink-muted)', text: fdaPct + '% of 400 mg daily adult guideline' })
        ),
        S.h('div', { class: 'bt-facts-exp-track' },
          S.h('i', { class: 'bt-facts-exp-fill', style: 'width:' + fdaPct + '%;background:var(--primary)' })
        )
      )
    );
    root.appendChild(part2);

    /* PART 3: Post-Harvest Chemistry, Roast Porosity & Degassing Clock */
    var pinPct = Math.max(3, Math.min(97, Math.round((fresh.effectiveDays / 40) * 100)));
    var part3 = S.h('section', { class: 'bt-ce-card bt-facts-sec', id: 'bt-fpart-3' },
      S.h('div', { class: 'bt-ce-card-hd' },
        S.h('h3', { class: 'bt-ce-card-title' }, S.iconEl('cherry-washed', { size: 18 }), S.h('span', { text: 'Part 3 · Processing, Roast & Rest Window' })),
        S.h('span', { class: 'bt-ce-badge ' + fresh.tone, text: fresh.label })
      ),
      S.h('div', { style: 'display:flex;flex-direction:column;gap:6px;font-size:12.5px;line-height:1.45;color:var(--ink-secondary)' },
        S.h('div', null, S.h('b', { style: 'color:var(--ink)', text: 'Process (' + (procGuide.name || procKey) + '): ' }), S.h('span', { text: procGuide.what + ' ' + procGuide.cup })),
        S.h('div', null, S.h('b', { style: 'color:var(--ink)', text: 'Roast Style: ' }), S.h('span', { text: roastGuide.what + ' ' + roastGuide.cup })),
        isDecaf && typeof DECAF_GUIDE === 'object' ? S.h('div', null, S.h('b', { style: 'color:var(--ink)', text: 'Decaf Cell Walls: ' }), S.h('span', { text: DECAF_GUIDE.brew })) : null
      ),
      S.h('div', { class: 'bt-ce-subwell' },
        S.h('span', { class: 'bt-ce-eyebrow', text: lens === 'scientist' ? 'Smrke Weibull CO2 Freshness Clock (Days 0 → 40)' : 'Bean Freshness & Rest Timeline (Days 0 → 40)' }),
        S.h('div', { class: 'bt-facts-clock-bar' },
          S.h('i', { style: 'width:16%;background:var(--warn)' }),
          S.h('i', { style: 'width:52%;background:var(--good)' }),
          S.h('i', { style: 'width:32%;background:var(--track)' }),
          S.h('span', { class: 'bt-facts-clock-pin', style: 'left:' + pinPct + '%' })
        ),
        S.h('div', { style: 'display:flex;justify-content:space-between;font-size:10.5px;color:var(--ink-muted)' },
          S.h('span', { text: 'Rest (0–' + fresh.window.ready + 'd)' }),
          S.h('span', { text: 'Peak Window (' + fresh.window.ready + '–' + fresh.window.peakEnd + 'd)' }),
          S.h('span', { text: 'Gentle Fade' })
        ),
        S.h('span', { style: 'font-size:12px;color:var(--ink-secondary)', text: fresh.detail })
      )
    );
    root.appendChild(part3);

    /* PART 4: Brew Physics Strategy & Cup Expectations */
    var expBars = (exObj && Array.isArray(exObj.bars) && exObj.bars.length) ? exObj.bars : [
      { label: 'Acidity',   level: roastKey.indexOf('light') >= 0 ? 4 : roastKey.indexOf('dark') >= 0 ? 2 : 3, text: roastKey.indexOf('light') >= 0 ? 'Vibrant citrus & orchard sparkle' : 'Smooth, low-sharpness balance' },
      { label: 'Sweetness', level: 4, text: 'Ripe caramel, cane sugar & fruit sweetness around 60 °C (140 °F)' },
      { label: 'Body',      level: procKey === 'natural' || procKey === 'wet-hulled' || roastKey.indexOf('dark') >= 0 ? 4 : 3, text: procKey === 'washed' ? 'Silky tea-clean clarity' : 'Plush, syrupy mouthfeel' }
    ];

    var simPreview = null;
    try {
      var core = (typeof window !== 'undefined' && window.BTCoreV6) ? window.BTCoreV6 : null;
      if (core && typeof core.synthesizeRecipe === 'function') {
        simPreview = core.synthesizeRecipe({ coffee: c, methodKey: (a.brew && a.brew.method) || 'v60', prefs: a.prefs });
      }
    } catch (_) {}

    var part4 = S.h('section', { class: 'bt-ce-card bt-facts-sec', id: 'bt-fpart-4' },
      S.h('div', { class: 'bt-ce-card-hd' },
        S.h('h3', { class: 'bt-ce-card-title' }, S.iconEl('refract-prism', { size: 18 }), S.h('span', { text: 'Part 4 · Brew Strategy & Cup Expectations' }))
      ),
      S.h('div', { style: 'display:flex;flex-direction:column;gap:6px' },
        expBars.map(function (b) {
          var pct = Math.max(20, Math.min(100, Math.round(((+b.level || 3) / 5) * 100)));
          return S.h('div', { class: 'bt-facts-exp-row' },
            S.h('b', { style: 'font-size:12.5px', text: b.label }),
            S.h('div', { style: 'display:flex;flex-direction:column;gap:3px' },
              S.h('div', { class: 'bt-facts-exp-track' }, S.h('i', { class: 'bt-facts-exp-fill', style: 'width:' + pct + '%' })),
              S.h('span', { style: 'font-size:11px;color:var(--ink-secondary)', text: (lens === 'scientist' && b.rule) ? b.rule : (b.text || b.line || '') })
            ),
            S.h('span', { class: 'bt-ce-bag-rem', text: (b.level || 3) + '/5' })
          );
        })
      ),
      S.h('div', { class: 'bt-ce-subwell' },
        S.h('span', { class: 'bt-ce-eyebrow', text: 'How Your Bag Shapes Step 3 Recipe' }),
        S.h('span', { style: 'font-size:12.5px;color:var(--ink-secondary);line-height:1.42', text: simPreview && simPreview.tempC
          ? (lens === 'scientist'
            ? ('Target Slurry: ' + Math.round(simPreview.tempC * 10) / 10 + ' °C · Target D50: ' + Math.round(simPreview.d50Um || 540) + ' µm · Ratio 1:' + (simPreview.ratio || 16.5))
            : ('Water Temp: ' + Math.round(simPreview.tempC * 10) / 10 + ' °C (' + Math.round(simPreview.tempC * 9 / 5 + 32) + ' °F) · Grind ~' + Math.round(simPreview.d50Um || 540) + ' µm · Brew Ratio 1:' + (simPreview.ratio || 16.5)))
          : (procGuide.brew + ' ' + roastGuide.brew) })
      ),
      S.h('div', { class: 'bt-facts-journey' },
        [
          ['1. Seed', c.varietal || 'Arabica'],
          ['2. Terroir', c.origin ? c.origin.split(',')[0] : 'Highland'],
          ['3. Mill', (c.process || 'washed').replace(/-/g, ' ')],
          ['4. Roast', (S.ROAST_STOPS.find(function (r) { return r.key === roastKey; }) || S.ROAST_STOPS[1]).label],
          ['5. Rest', fresh.label.split('·')[0].trim()],
          ['6. Cup', (a.brew && a.brew.method ? a.brew.method.toUpperCase() : 'Step 2 →')]
        ].map(function (st) {
          return S.h('div', { class: 'bt-ce-passport-cell' },
            S.h('span', { text: st[0] }),
            S.h('b', { text: st[1] })
          );
        })
      ),
      S.h('button', {
        type: 'button',
        class: 'bt-ce-cta-primary',
        onclick: function () {
          S.closeSheetSafe();
          S.navGo('method');
          S.rerenderSafe();
        }
      },
        S.h('span', { text: 'Continue to Choose Brewer →' }),
        S.iconEl('chevron-right', { size: 19 })
      )
    );
    root.appendChild(part4);

    return root;
  }

  function openCoffeeFactsSheet(coffeeOverride) {
    var a = S.getApp();
    if (a && a.coffee) flushPendingStep1Drafts(a.coffee);
    S.openSheetSafe('coffee-facts', coffeeOverride ? { coffee: coffeeOverride } : {}, { title: 'Facts in Four Parts · Bag X-Ray', detent: 'full' });
  }

  /* -------------------- 12. Sheet & Route Registrations + Public Exports -------------------- */
  S.registerSheetSafe('bag-capture', function (payload, host) {
    if (payload && payload.door === 'paste') {
      return buildAiPasteSheet(payload);
    }
    return renderStep1(host, { inSheet: true, payload: payload });
  }, { title: 'Add or Scan Coffee Bag', detent: 'full' });

  /* Alias `'capture-bag'` so existing callers in 02 & 07 open seamlessly */
  S.registerSheetSafe('capture-bag', function (payload, host) {
    if (payload && payload.door === 'paste') {
      return buildAiPasteSheet(payload);
    }
    return renderStep1(host, { inSheet: true, payload: payload });
  }, { title: 'Add or Scan Coffee Bag', detent: 'full' });

  S.registerSheetSafe('my-coffees', function () {
    return buildMyCoffeesVault();
  }, { title: 'My Coffees Vault', detent: 'full' });

  S.registerSheetSafe('ai-paste', function (payload) {
    return buildAiPasteSheet(payload);
  }, { title: 'Paste & Review AI Reply', detent: 'full' });

  S.registerSheetSafe('coffee-facts', function (payload) {
    return buildCoffeeFactsSheet(payload);
  }, { title: 'Facts in Four Parts · Bag X-Ray', detent: 'full' });

  S.registerSheetSafe('coffee-field-help', function (payload) {
    return buildCoffeeFieldHelpSheet(payload);
  }, { title: 'Coffee Field Guide', detent: 'half' });

  S.registerRouteSafe('coffee_facts', function (payload, ctx) {
    if (ctx && ctx.mount) {
      ctx.mount.textContent = '';
      ctx.mount.appendChild(buildCoffeeFactsSheet(payload));
      return;
    }
    openCoffeeFactsSheet();
  });

  S.registerRouteSafe('bean', function () {
    openMyCoffeesSheet();
  });

  var BTCoffeeEntry = {
    renderStep1: renderStep1,
    openPasteModal: openPasteModal,
    openMyCoffeesSheet: openMyCoffeesSheet,
    openCoffeeFactsSheet: openCoffeeFactsSheet,
    openCoffeeFieldHelp: openCoffeeFieldHelp,
    isFieldAnswered: isFieldAnswered,
    getFieldStatus: getFieldStatus,
    getMissingRequiredFields: getMissingRequiredFields,
    setFieldDontKnow: setFieldDontKnow,
    fillRemainingAsDontKnow: fillRemainingAsDontKnow,
    REQUIRED_FIELDS_7: REQUIRED_FIELDS_7,
    COFFEE_FIELD_HELP_DB: COFFEE_FIELD_HELP_DB,
    buildScanPromptV6: buildScanPromptV6Safe,
    parseScanReplyV6: parseScanReplyV6Safe,
    mapScanToReviewItemsV6: mapScanToReviewItemsV6,
    syncBagPriceToLedger: syncBagPriceToLedger,
    applySavedCoffee: applySavedCoffeeSelection,
    computeSmrkeFreshnessStatus: computeSmrkeFreshnessStatus,
    buildRoastCalendarControl: buildRoastCalendarControl,
    buildBagFlavorNotesWidget: buildBagFlavorNotesWidget,
    flushPendingStep1Drafts: flushPendingStep1Drafts,
    QUICK_ARCHETYPES_12: QUICK_ARCHETYPES_12
  };

  var BTMyCoffeesVault = {
    open: openMyCoffeesSheet,
    build: buildMyCoffeesVault,
    getUnifiedCoffees: S.buildUnifiedCoffeesSafe,
    applySavedCoffee: applySavedCoffeeSelection,
    applyFreshBagRollover: applyFreshBagRollover
  };

  if (typeof window !== 'undefined') {
    window.BTCoffeeEntry = BTCoffeeEntry;
    window.BTMyCoffeesVault = BTMyCoffeesVault;
  }
})();
