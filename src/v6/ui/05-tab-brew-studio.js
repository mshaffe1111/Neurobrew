/* ==========================================================================
   BeanTelligence v6.2 — 05-tab-brew-studio.js
   Tab 1: Brew Studio Orchestrator
   - Morning Command Center ('door', screenDoor) + Dual-Draft Isolation
   - 5-Step Guided Home Trail:
       1. Coffee ('coffee' -> window.BTCoffeeEntry.renderStep1)
       2. Brewer, Filter & Grinder ('method', screenMethod — 4 Physics Families,
          23 Brewers, Top Bean Match, 19+ Sub-Modes, 68 Filters, 52+ Grinders)
       3. Scannable Numbers-First Recipe ('brew', screenBrew — 6 Hero Tiles,
          Tap-to-Tune BTSheet Drawers, Kettle Fill, Philips 5500 22-Drink Bezel,
          Fellow Aiden 1-Dot/3-Dot, xBloom Studio 4-Pour, Brew Twin, QR Share)
       4. Audible & Spoken Kitchen Chronograph ('timer' — BTTimerAudio Voice +
          3-2-1 Pips + 880/1318 Hz Chimes, 256px BTChronoDial, Ghost Pacer,
          Above-the-Fold Transport Controls, Wake Lock, BLE Scale Auto-Pilot)
       5. Taste & Perfect ('taste' -> window.BTTasteStep.renderStep5)
   Zero Unicode Emojis · Real \u2192 Arrows · >=16px Inputs · Zero Slang
   ========================================================================== */

(function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var SVG_TAGS = {
    svg: 1, path: 1, circle: 1, rect: 1, line: 1, polyline: 1, polygon: 1,
    g: 1, defs: 1, linearGradient: 1, radialGradient: 1, stop: 1, text: 1, tspan: 1
  };

  /* ==================== 0. SAFE DOM, SHELL, ICON & HAPTIC BRIDGES ==================== */
  function getShell() {
    return (typeof BTShell !== 'undefined' && BTShell) ? BTShell
      : (typeof window !== 'undefined' && window.BTShell ? window.BTShell : null);
  }

  function dom(tag, props) {
    var sh = getShell();
    if (sh && typeof sh.h === 'function') {
      return sh.h.apply(sh, arguments);
    }
    var isSvg = !!SVG_TAGS[tag];
    var el = isSvg ? document.createElementNS(SVG_NS, tag) : document.createElement(tag || 'div');
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
        } else if (k.slice(0, 2) === 'on' && typeof v === 'function') {
          el.addEventListener(k.slice(2).toLowerCase(), v);
        } else if (v === true) {
          if (!isSvg && (k === 'disabled' || k === 'checked' || k === 'hidden' || k === 'selected')) el[k] = true;
          else el.setAttribute(k, '');
        } else {
          el.setAttribute(k, String(v));
        }
      });
    }
    function appendChildSafe(c) {
      if (c == null || c === false || c === true) return;
      if (Array.isArray(c)) { c.forEach(appendChildSafe); return; }
      if (c.nodeType) el.appendChild(c);
      else el.appendChild(document.createTextNode(String(c)));
    }
    for (var i = 2; i < arguments.length; i++) appendChildSafe(arguments[i]);
    return el;
  }

  function getApp() {
    var sh = getShell();
    if (sh && sh.app) return sh.app;
    if (typeof window !== 'undefined' && window.__btApp) return window.__btApp;
    if (typeof app !== 'undefined' && app) return app;
    var fb = { coffee: {}, brew: { method: 'v60', dose: 15, water: 250, ratio: 16.7, tempC: 95 }, prefs: { tempUnit: 'F', waterUnit: 'g', coffeeUnit: 'g', gear: {}, toolModes: {} } };
    if (typeof window !== 'undefined') window.__btApp = fb;
    return fb;
  }

  function getCupState() {
    var sh = getShell();
    if (sh && sh.state) return sh.state;
    if (typeof window !== 'undefined' && window.__btState) return window.__btState;
    if (typeof state !== 'undefined' && state) return state;
    return { quick: {}, words: {}, cva: {} };
  }

  function saveDraft() {
    try {
      var sh = getShell();
      if (sh && typeof sh.scheduleDraft === 'function') sh.scheduleDraft();
    } catch (_) {}
  }

  function rerender() {
    try {
      var sh = getShell();
      if (sh && typeof sh.render === 'function') sh.render();
    } catch (_) {}
  }

  function showToast(msg, opts) {
    try {
      var sh = getShell();
      if (sh && typeof sh.toast === 'function') return sh.toast(msg, opts);
    } catch (_) {}
    return null;
  }

  function haptic(kind) {
    try {
      var bh = (typeof window !== 'undefined' && window.BTHaptics) ? window.BTHaptics : null;
      if (bh && typeof bh[kind || 'tick'] === 'function') bh[kind || 'tick']();
      else if (bh && typeof bh.tick === 'function') bh.tick();
    } catch (_) {}
  }

  function ico(name, size) {
    try {
      var bti = (typeof BTIcons !== 'undefined' && BTIcons) ? BTIcons : (typeof window !== 'undefined' ? window.BTIcons : null);
      if (bti && typeof bti.el === 'function') return bti.el(name || 'brew', { size: size || 18 });
    } catch (_) {}
    return dom('span', { class: 'bt-ico', 'aria-hidden': 'true' });
  }

  function brewerIco(methodKey, size) {
    try {
      var bti = (typeof BTIcons !== 'undefined' && BTIcons) ? BTIcons : (typeof window !== 'undefined' ? window.BTIcons : null);
      if (bti && typeof bti.forBrewer === 'function') return bti.forBrewer(methodKey || 'v60', { size: size || 20 });
    } catch (_) {}
    return ico('brew', size || 20);
  }

  function getExperienceLens() {
    var sh = getShell();
    try {
      if (sh && sh.BTScienceLens) {
        if (typeof sh.BTScienceLens.level === 'function') {
          var lv = sh.BTScienceLens.level();
          if (lv === 'starter' || lv === 'new' || lv === 'surface') return 'starter';
          if (lv === 'scientist' || lv === 'expert' || lv === 'xray') return 'scientist';
          if (lv === 'comfy' || lv === 'comfortable' || lv === 'hybrid') return 'comfy';
        }
        if (typeof sh.BTScienceLens.mode === 'function') {
          var md = sh.BTScienceLens.mode();
          if (md === 'xray' || md === 'scientist') return 'scientist';
          if (md === 'hybrid' || md === 'comfy') return 'comfy';
        }
      }
    } catch (_) {}
    var a = getApp();
    var p = (a && a.prefs) || {};
    if (p.level === 'expert' || p.scienceLens === 'xray' || p.scienceLens === 'scientist') return 'scientist';
    if (p.level === 'new' || p.scienceLens === 'starter') return 'starter';
    return 'comfy';
  }

  function toolMode(key) {
    var sh = getShell();
    if (sh && typeof sh.btToolMode === 'function') return sh.btToolMode(key);
    var a = getApp();
    var tm = (a.prefs && a.prefs.toolModes) || {};
    if (key === 'brewersFilter') return tm.brewersFilter === 'owned' ? 'owned' : 'all';
    return tm[key] || 'optional';
  }

  function setToolMode(key, val) {
    var sh = getShell();
    if (sh && typeof sh.btSetToolMode === 'function') return sh.btSetToolMode(key, val);
    var a = getApp();
    a.prefs = a.prefs || {};
    a.prefs.toolModes = a.prefs.toolModes || {};
    a.prefs.toolModes[key] = val;
    saveDraft();
    return val;
  }

  function openSheet(keyOrCfg, payload, opts) {
    var sh = getShell();
    if (sh && sh.BTSheet && typeof sh.BTSheet.open === 'function') {
      return sh.BTSheet.open(keyOrCfg, payload, opts);
    }
    if (sh && typeof sh.openSheet === 'function') {
      return sh.openSheet(keyOrCfg, payload, opts);
    }
  }

  function closeSheet() {
    var sh = getShell();
    if (sh && sh.BTSheet && typeof sh.BTSheet.close === 'function') sh.BTSheet.close();
  }

  function goBrewStep(stepKey, extra) {
    var a = getApp();
    if (stepKey !== 'timer') stopActiveTimerSession(false);
    a.activeTab = 'brew';
    a.brewStep = stepKey;
    a.screen = stepKey;
    if (extra && extra.focusFix) a.focusFix = true;
    var sh = getShell();
    if (sh && typeof sh.go === 'function') {
      sh.go(stepKey, extra);
      /* Guarantee app.brewStep stays synced even if go('brew') treated 'brew' as tab key */
      if (a.activeTab === 'brew' && a.brewStep !== stepKey) {
        a.brewStep = stepKey;
        rerender();
      }
    } else {
      rerender();
    }
    saveDraft();
  }

  /* ==================== 1. AUDIO & VOICE KITCHEN COACH BRIDGE ==================== */
  var _fbAudioCtx = null;
  var AudioCoach = (function () {
    function ext() {
      return (typeof window !== 'undefined' && window.BTTimerAudio) ? window.BTTimerAudio : null;
    }

    function mode() {
      var e = ext();
      if (e && typeof e.mode === 'function') {
        var m = String(e.mode() || 'voice').toLowerCase();
        if (m === 'off' || m === 'silent' || m === 'mute') return 'silent';
        if (m === 'chime' || m === 'chimes' || m === 'beep') return 'chimes';
        return 'voice';
      }
      var a = getApp();
      var p = (a && a.prefs) || {};
      var raw = String(p.timerAudioMode || p.sound || 'voice').toLowerCase();
      if (p.soundOff === true || raw === 'off' || raw === 'silent') return 'silent';
      if (raw === 'chime' || raw === 'chimes') return 'chimes';
      return 'voice';
    }

    function setMode(m) {
      var norm = (m === 'silent' || m === 'off') ? 'silent' : (m === 'chimes' || m === 'chime') ? 'chimes' : 'voice';
      var a = getApp();
      a.prefs = a.prefs || {};
      a.prefs.timerAudioMode = norm;
      a.prefs.sound = norm === 'silent' ? 'off' : norm === 'chimes' ? 'chime' : 'voice';
      a.prefs.soundOff = norm === 'silent';
      var e = ext();
      if (e && typeof e.setMode === 'function') {
        try { e.setMode(norm); } catch (_) {}
      }
      saveDraft();
      return norm;
    }

    function ensureCtx() {
      try {
        var Ctor = (typeof window !== 'undefined') && (window.AudioContext || window.webkitAudioContext);
        if (!Ctor) return null;
        if (!_fbAudioCtx || _fbAudioCtx.state === 'closed') _fbAudioCtx = new Ctor();
        if (_fbAudioCtx.state === 'suspended' && typeof _fbAudioCtx.resume === 'function') {
          _fbAudioCtx.resume().catch(function () {});
        }
        return _fbAudioCtx;
      } catch (_) {
        return null;
      }
    }

    function unlock() {
      var e = ext();
      if (e && typeof e.unlock === 'function') {
        try { e.unlock(); } catch (_) {}
      }
      ensureCtx();
      try {
        if (typeof window !== 'undefined' && window.BTPlatform && typeof window.BTPlatform.primeAudio === 'function') {
          window.BTPlatform.primeAudio();
        }
        if (typeof window !== 'undefined' && window.speechSynthesis && typeof window.speechSynthesis.getVoices === 'function') {
          window.speechSynthesis.getVoices();
        }
      } catch (_) {}
    }

    function playToneFallback(freqs, durS, gainPeak, type, staggerS) {
      if (mode() === 'silent') return;
      var ctx = ensureCtx();
      if (!ctx) return;
      try {
        var tBase = ctx.currentTime;
        freqs.forEach(function (hz, idx) {
          var t0 = tBase + idx * (staggerS || 0);
          var osc = ctx.createOscillator();
          var g = ctx.createGain();
          osc.type = type || 'sine';
          osc.frequency.setValueAtTime(hz, t0);
          g.gain.setValueAtTime(0.0001, t0);
          g.gain.linearRampToValueAtTime(gainPeak || 0.14, t0 + 0.012);
          g.gain.exponentialRampToValueAtTime(0.0001, t0 + (durS || 0.22));
          osc.connect(g);
          g.connect(ctx.destination);
          osc.onended = function () { try { osc.disconnect(); g.disconnect(); } catch (_) {} };
          osc.start(t0);
          osc.stop(t0 + (durS || 0.22) + 0.02);
        });
      } catch (_) {}
    }

    function playCountdownPip(secLeft) {
      if (mode() === 'silent') return;
      var e = ext();
      if (e && typeof e.playCountdownPip === 'function') {
        try { e.playCountdownPip(secLeft); return; } catch (_) {}
      }
      var hz = secLeft <= 1 ? 698.46 : 587.33;
      playToneFallback([hz], 0.11, 0.12, 'triangle', 0);
    }

    function playStepChime() {
      if (mode() === 'silent') return;
      var e = ext();
      if (e && typeof e.playStepChime === 'function') {
        try { e.playStepChime(); return; } catch (_) {}
      }
      playToneFallback([880.0, 1318.51], 0.38, 0.14, 'sine', 0.04);
    }

    function playFinishChord() {
      if (mode() === 'silent') return;
      var e = ext();
      if (e && typeof e.playFinishChord === 'function') {
        try { e.playFinishChord(); return; } catch (_) {}
      }
      playToneFallback([523.25, 659.25, 783.99, 1046.50], 0.36, 0.14, 'sine', 0.085);
    }

    function speak(text, opts) {
      if (mode() !== 'voice' || !text) return;
      var e = ext();
      if (e && typeof e.speak === 'function') {
        try { e.speak(text, opts); return; } catch (_) {}
      }
      try {
        if (typeof window !== 'undefined' && window.speechSynthesis && typeof window.SpeechSynthesisUtterance === 'function') {
          window.speechSynthesis.cancel();
          var utt = new window.SpeechSynthesisUtterance(String(text));
          utt.rate = (opts && opts.rate) || 1.03;
          utt.pitch = 1.0;
          window.speechSynthesis.speak(utt);
        }
      } catch (_) {}
    }

    function testSound() {
      unlock();
      if (mode() === 'silent') setMode('voice');
      var e = ext();
      if (e && typeof e.testSound === 'function') {
        try { e.testSound(); return; } catch (_) {}
      }
      playStepChime();
      if (mode() === 'voice') {
        speak('BeanTelligence voice timer ready. Pour steadily to target grams.');
      }
    }

    return {
      mode: mode,
      setMode: setMode,
      unlock: unlock,
      playCountdownPip: playCountdownPip,
      playStepChime: playStepChime,
      playFinishChord: playFinishChord,
      speak: speak,
      testSound: testSound
    };
  })();

  /* ==================== 2. CATALOGS: 4 BREWER FAMILIES, SUB-MODES, FILTERS, GRINDERS ==================== */
  var FAMILY_DEFS_4 = [
    {
      id: 'pourover',
      title: 'Pour-Over & Drip',
      sub: 'Clean gravity percolation for bright aromatics and sparkling clarity',
      keys: ['v60', 'origami', 'kalita', 'orea', 'pulsar', 'chemex', 'nel', 'drip', 'aiden', 'xbloom']
    },
    {
      id: 'immersion',
      title: 'Immersion & Steep-Release',
      sub: 'Forgiving full-contact steeping for sweet, round, repeatable body',
      keys: ['aeropress', 'switch', 'clever', 'press', 'siphon', 'cupping']
    },
    {
      id: 'espresso',
      title: 'Espresso & Stovetop',
      sub: 'Pressurized packed-bed extraction for rich crema and milk drinks',
      keys: ['espresso', 'lever_espresso', 'moka', 'philips5500']
    },
    {
      id: 'specialty_cold',
      title: 'Specialty & Cold',
      sub: 'Traditional decoction, gravity phin, and low-enthalpy cold extraction',
      keys: ['turkish', 'phin', 'cold', 'cold_drip', 'french_cold']
    }
  ];

  var FALLBACK_METHODS_23 = [
    { key: 'v60',            label: 'Hario V60',          short: 'V60',            d50AnchorUm: 550, ratio: 16.5, rWater: 2.10, dose: 15, water: 250, blurb: '60 deg spiral cone · high floral clarity' },
    { key: 'origami',        label: 'Origami Dripper',    short: 'Origami',        d50AnchorUm: 530, ratio: 16.0, rWater: 2.08, dose: 15, water: 240, blurb: '20-flute cone or wave filter versatility' },
    { key: 'kalita',         label: 'Kalita Wave',        short: 'Kalita Wave',    d50AnchorUm: 640, ratio: 16.5, rWater: 2.15, dose: 18, water: 300, blurb: 'Flat-bed 3-hole sweet even plug flow' },
    { key: 'orea',           label: 'Orea V3 / V4',       short: 'Orea',           d50AnchorUm: 580, ratio: 16.5, rWater: 2.05, dose: 15, water: 250, blurb: 'Fast open-bottom wave or zero-bypass flat' },
    { key: 'pulsar',         label: 'NextLevel Pulsar',   short: 'Pulsar',         d50AnchorUm: 620, ratio: 17.5, rWater: 2.10, dose: 20, water: 350, blurb: 'Zero-bypass dispersion screen + steep valve' },
    { key: 'chemex',         label: 'Chemex',             short: 'Chemex',         d50AnchorUm: 760, ratio: 16.5, rWater: 2.25, dose: 30, water: 500, blurb: 'Thick bonded paper · ultra-clean tea body' },
    { key: 'nel',            label: 'Cloth Nel Drip',     short: 'Nel Drip',       d50AnchorUm: 680, ratio: 13.5, rWater: 2.20, dose: 20, water: 270, blurb: 'Cotton flannel · silky lipids, zero grit' },
    { key: 'drip',           label: 'SCA Batch Brewer',   short: 'Batch Drip',     d50AnchorUm: 700, ratio: 17.0, rWater: 2.15, dose: 60, water: 1000, blurb: 'Automated multi-cup pulse showerhead' },
    { key: 'aiden',          label: 'Fellow Aiden',       short: 'Fellow Aiden',   d50AnchorUm: 540, ratio: 16.5, rWater: 2.10, dose: 18, water: 300, blurb: '1-Dot Single Cone / 3-Dot Batch PID pulses' },
    { key: 'xbloom',         label: 'xBloom Studio',      short: 'xBloom',         d50AnchorUm: 600, ratio: 16.0, rWater: 2.10, dose: 15, water: 240, blurb: '48mm RPM grinder + kinematic 4-pour spout' },
    { key: 'aeropress',      label: 'AeroPress',          short: 'AeroPress',      d50AnchorUm: 500, ratio: 15.5, rWater: 1.65, dose: 15, water: 232, blurb: 'Immersion + gentle forearm press' },
    { key: 'switch',         label: 'Hario Switch',       short: 'Switch',         d50AnchorUm: 640, ratio: 15.5, rWater: 2.20, dose: 16, water: 250, blurb: 'Ball-valve hybrid flush & full immersion' },
    { key: 'clever',         label: 'Clever Dripper',     short: 'Clever',         d50AnchorUm: 660, ratio: 15.5, rWater: 2.20, dose: 18, water: 280, blurb: 'Water-first stall-free steep & release' },
    { key: 'press',          label: 'French Press',       short: 'French Press',   d50AnchorUm: 850, ratio: 15.0, rWater: 2.40, dose: 20, water: 300, blurb: 'Crust-break & settled full-body immersion' },
    { key: 'siphon',         label: 'Vacuum Siphon',      short: 'Siphon',         d50AnchorUm: 580, ratio: 15.5, rWater: 2.00, dose: 20, water: 310, blurb: 'Isothermal globe steep + vacuum drawdown' },
    { key: 'espresso',       label: 'Espresso',           short: 'Espresso',       d50AnchorUm: 235, ratio: 2.0,  rWater: 1.00, dose: 18, water: 36,  outRatio: true, blurb: '9-Bar Classic, 6-Bar Turbo, Soup & Blooming' },
    { key: 'lever_espresso', label: 'Lever Espresso',     short: 'Lever Espresso', d50AnchorUm: 230, ratio: 2.2,  rWater: 1.00, dose: 18, water: 40,  outRatio: true, blurb: 'Pre-infusion soak + declining lever pressure' },
    { key: 'moka',           label: 'Stovetop Moka Pot',  short: 'Moka Pot',       d50AnchorUm: 380, ratio: 7.5,  rWater: 1.35, dose: 18, water: 135, blurb: 'Preheated boiler + cool tap quench before sputter' },
    { key: 'philips5500',    label: 'Philips 5500',       short: 'Philips 5500',   d50AnchorUm: 320, ratio: 3.8,  rWater: 1.15, dose: 9.3,water: 120, machine: true, blurb: '22-drink LatteGo console · SAS ceramic burrs' },
    { key: 'turkish',        label: 'Turkish Cezve',      short: 'Turkish Cezve',  d50AnchorUm: 170, ratio: 9.5,  rWater: 1.35, dose: 8,  water: 76,  blurb: 'Fine powder <94 C kaymak foam rise' },
    { key: 'phin',           label: 'Vietnamese Phin',    short: 'Phin',           d50AnchorUm: 560, ratio: 4.5,  rWater: 1.80, dose: 20, water: 90,  blurb: 'Gravity damper · Ca Phe Sua Da or Black' },
    { key: 'cold',           label: 'Cold Brew Steep',    short: 'Cold Brew',      d50AnchorUm: 980, ratio: 11.0, rWater: 2.30, dose: 50, water: 550, blurb: '4 C 18h smooth low-bitter immersion' },
    { key: 'cold_drip',      label: 'Kyoto Cold Drip',    short: 'Kyoto Cold Drip',d50AnchorUm: 680, ratio: 10.0, rWater: 2.05, dose: 40, water: 400, blurb: 'Ice-water 45 drops/min wine-like clarity' }
  ];

  var SUBMODES_BY_METHOD = {
    v60: [
      { id: 'standard',    label: 'Classic Spiral',      ratio: 16.5 },
      { id: 'kasuya-46',   label: 'Kasuya 4:6',          ratio: 15.0, d50Mult: 1.18 },
      { id: 'single-pour', label: 'Laminar Single Pour', ratio: 16.5, d50Mult: 0.95 },
      { id: 'osmotic',     label: 'Osmotic Flow',        ratio: 15.5, d50Mult: 1.08 },
      { id: 'flash-iced',  label: 'Flash-Iced (38% Ice)',ratio: 16.0, iced: true }
    ],
    origami: [
      { id: 'origami-cone',label: 'Cone Paper (Fast Air)', ratio: 16.0, filterId: 'cone-fast-abaca' },
      { id: 'origami-wave',label: 'Wave Paper (Flat Bed)', ratio: 16.5, filterId: 'wave-bleached' },
      { id: 'flash-iced',  label: 'Flash-Iced',            ratio: 16.0, iced: true }
    ],
    kalita: [
      { id: 'wave-185',    label: 'Wave 185 (15–26 g)',  ratio: 16.5 },
      { id: 'wave-155',    label: 'Wave 155 (10–16 g)',  ratio: 16.0, d50Mult: 0.93 },
      { id: 'flash-iced',  label: 'Flash-Iced',          ratio: 16.0, iced: true }
    ],
    orea: [
      { id: 'orea-wave',       label: 'Pleated Wave',          ratio: 16.5, filterId: 'wave-bleached' },
      { id: 'orea-negotiated', label: 'Negotiated Zero-Bypass',ratio: 17.5, filterId: 'orea-flat-negotiated' },
      { id: 'flash-iced',      label: 'Flash-Iced',            ratio: 16.0, iced: true }
    ],
    pulsar: [
      { id: 'pulsar-valve',   label: 'Closed-Bloom Hybrid Valve', ratio: 17.5 },
      { id: 'tricolate-open', label: 'Open Zero-Bypass',          ratio: 18.5 }
    ],
    chemex: [
      { id: 'standard',   label: 'Classic Hourglass Pour', ratio: 16.5 },
      { id: 'flash-iced', label: 'Flash-Iced Carafe',      ratio: 16.0, iced: true }
    ],
    nel: [
      { id: 'nel-specialty', label: 'Modern Specialty (1:13.5)', ratio: 13.5 },
      { id: 'nel-kissaten',  label: 'Kissaten Demitasse (1:10.5)', ratio: 10.5 },
      { id: 'nel-clean',     label: 'Light Clarity (1:15.0)',    ratio: 15.0 }
    ],
    drip: [
      { id: 'standard',   label: 'SCA Golden Cup Batch', ratio: 17.0 },
      { id: 'flash-iced', label: 'Iced Carafe Brew',     ratio: 16.0, iced: true }
    ],
    aiden: [
      { id: 'aiden_declining',  label: 'Declining Temp Pulses', ratio: 16.5 },
      { id: 'aiden_samo_bloom', label: '60 °C Samo Cool-Bloom', ratio: 16.5 },
      { id: 'aiden_balanced',   label: 'Isothermal Sweet',      ratio: 16.0 },
      { id: 'aiden_flash_iced', label: 'Flash-Iced Over Ice',   ratio: 16.0, iced: true }
    ],
    xbloom: [
      { id: 'xb_clarity_3p',     label: '3-Pour High Clarity', ratio: 16.0 },
      { id: 'xb_hyperflow_body', label: '4-Pour Sweet Body',   ratio: 15.5 },
      { id: 'xb_iced',           label: 'Over-Ice Concentrate',ratio: 15.5, iced: true }
    ],
    aeropress: [
      { id: 'ap-standard',    label: 'Standard Upright',       ratio: 15.5 },
      { id: 'ap-concentrate', label: 'Adler 85 °C Bypass',     ratio: 5.5, tempC: 85, d50Mult: 0.78 },
      { id: 'ap-inverted',    label: 'Inverted Full Steep',    ratio: 15.0 },
      { id: 'ap-prismo',      label: 'Prismo / Fellow Valve',  ratio: 4.5, filterId: 'metal-mesh-fine', d50Mult: 0.76 },
      { id: 'ap-gagne',       label: 'Gagne 9-Min Steep',      ratio: 16.0, d50Mult: 1.06 }
    ],
    switch: [
      { id: 'standard',     label: 'Flush + Closed Steep', ratio: 15.5 },
      { id: 'switch-steep', label: 'Full Closed Steep',    ratio: 16.0 },
      { id: 'flash-iced',   label: 'Hybrid Flash-Iced',    ratio: 15.5, iced: true }
    ],
    clever: [
      { id: 'clever-water-first', label: 'Water-First Stall-Free', ratio: 15.5 },
      { id: 'clever-classic',     label: 'Coffee-First Classic',   ratio: 15.5 }
    ],
    press: [
      { id: 'standard',   label: '4:00 Crust-Break & Settle', ratio: 15.0 },
      { id: 'press-cup',  label: 'Single-Bowl Cupping Style', ratio: 18.18, d50Mult: 0.78 }
    ],
    siphon: [
      { id: 'standard', label: '92 °C Globe + Bamboo Fold', ratio: 15.5 }
    ],
    espresso: [
      { id: 'esp-9bar',      label: '9-Bar Classic (1:2.0)',  ratio: 2.0, d50Um: 235 },
      { id: 'esp-turbo',     label: '6-Bar Turbo (1:2.8)',    ratio: 2.8, d50Um: 310 },
      { id: 'esp-soup',      label: 'Soup / Filter 2.0',      ratio: 3.5, d50Um: 480 },
      { id: 'esp-bloom',     label: '30s Blooming Espresso',  ratio: 2.6, d50Um: 260 },
      { id: 'esp-ristretto', label: 'Ristretto (1:1.5)',      ratio: 1.5, d50Um: 215 }
    ],
    lever_espresso: [
      { id: 'lever-londinium', label: 'Londinium Declining', ratio: 2.2, d50Um: 230 },
      { id: 'lever-6bar',      label: 'Modern 6-Bar Light',  ratio: 2.6, d50Um: 285 },
      { id: 'lever-turbo',     label: 'Lever Turbo (17s)',   ratio: 2.8, d50Um: 310 },
      { id: 'lever-soup',      label: 'Lever Soup',          ratio: 3.5, d50Um: 460 }
    ],
    moka: [
      { id: 'standard', label: 'Preheated Base + Tap Quench', ratio: 7.5 }
    ],
    turkish: [
      { id: 'standard', label: '<94 °C Kaymak Rise + 60s Settle', ratio: 9.5 }
    ],
    phin: [
      { id: 'phin-suada', label: 'Ca Phe Sua Da (1:4.5)',  ratio: 4.5 },
      { id: 'phin-black', label: 'Specialty Black (1:6.0)',ratio: 6.0 }
    ],
    cold: [
      { id: 'cold-rtd-4c',   label: '4 °C Fridge (18h)',   ratio: 11.0, tempC: 4 },
      { id: 'cold-room-20c', label: '20 °C Counter (14h)', ratio: 11.0, tempC: 20 },
      { id: 'cold-conc',     label: '1:5.5 Concentrate',   ratio: 5.5,  tempC: 4 }
    ],
    cold_drip: [
      { id: 'standard', label: '45 Drops/Min Ice Tower', ratio: 10.0, tempC: 3 }
    ]
  };

  function getAllMethods23() {
    var mp = (typeof window !== 'undefined' && Array.isArray(window.METHOD_PHYSICS_V6) && window.METHOD_PHYSICS_V6.length)
      ? window.METHOD_PHYSICS_V6
      : FALLBACK_METHODS_23;
    return mp;
  }

  function getMethodObj(key) {
    var k = String(key || 'v60').trim().toLowerCase();
    var methodAliases = {
      'philips_5500': 'philips5500',
      'philips-5500': 'philips5500',
      'ep5500': 'philips5500',
      'ep5547': 'philips5500',
      'lattego': 'philips5500',
      'fellow_aiden': 'aiden',
      'fellow-aiden': 'aiden',
      'xbloom_studio': 'xbloom',
      'xbloom-studio': 'xbloom',
      'lever-espresso': 'lever_espresso',
      'cold-drip': 'cold_drip',
      'french-cold': 'cold',
      'french_cold': 'cold',
      'cupping': 'press'
    };
    if (methodAliases[k]) k = methodAliases[k];
    var list = getAllMethods23();
    return list.find(function (m) { return m.key === k; }) || list[0];
  }

  function getSubModesFor(methodKey) {
    var mObj = getMethodObj(methodKey);
    var builtIn = SUBMODES_BY_METHOD[mObj.key] || [];
    var fromCore = Array.isArray(mObj.subModes) ? mObj.subModes : [];
    if (!fromCore.length) return builtIn;
    var seen = {};
    var merged = [];
    fromCore.concat(builtIn).forEach(function (sm) {
      if (!sm || !sm.id || seen[sm.id]) return;
      seen[sm.id] = 1;
      merged.push(sm);
    });
    return merged;
  }

  function getAllGrindersList() {
    if (typeof window !== 'undefined' && Array.isArray(window.GRINDERS_ALL_V6) && window.GRINDERS_ALL_V6.length) {
      return window.GRINDERS_ALL_V6;
    }
    if (typeof window !== 'undefined' && Array.isArray(window.GRINDERS) && window.GRINDERS.length) {
      var ext = Array.isArray(window.FLAGSHIP_GRINDERS_EXT) ? window.FLAGSHIP_GRINDERS_EXT : [];
      return window.GRINDERS.concat(ext);
    }
    return [
      { key: 'comandante-c40', short: 'Comandante C40 MK4', name: 'Comandante C40 MK4', group: 'Hand Grinders', unit: 'click' },
      { key: '1zpresso-k-ultra', short: '1Zpresso K-Ultra', name: '1Zpresso K-Ultra', group: 'Hand Grinders', unit: 'click' },
      { key: '1zpresso-zp6', short: '1Zpresso ZP6 Special', name: '1Zpresso ZP6 Special', group: 'Hand Grinders', unit: 'click' },
      { key: 'kingrinder-k6', short: 'KINGrinder K6', name: 'KINGrinder K6', group: 'Hand Grinders', unit: 'click' },
      { key: 'fellow-ode-gen2', short: 'Fellow Ode Gen 2', name: 'Fellow Ode Gen 2', group: 'Flat-Burr Electric', unit: 'step' },
      { key: 'baratza-encore-esp', short: 'Baratza Encore ESP', name: 'Baratza Encore ESP', group: 'Conical Electric', unit: 'setting' },
      { key: 'baratza-encore', short: 'Baratza Encore', name: 'Baratza Encore', group: 'Conical Electric', unit: 'setting' },
      { key: 'df64-gen2', short: 'DF64 Gen 2', name: 'Turin DF64 Gen 2', group: 'Flat-Burr Electric', unit: 'mark' },
      { key: 'niche-zero', short: 'Niche Zero', name: 'Niche Zero', group: 'Conical Electric', unit: 'mark' },
      { key: 'preground-grocery-drip', short: 'Pre-Ground: Grocery Drip', name: 'Pre-Ground — Grocery Drip (~460 µm)', group: 'Pre-Ground Coffee', kind: 'preground' },
      { key: 'preground-grocery-espresso', short: 'Pre-Ground: Fine Brick/Moka', name: 'Pre-Ground — Fine Brick (~230 µm)', group: 'Pre-Ground Coffee', kind: 'preground' },
      { key: 'preground-cafe', short: 'Pre-Ground: Cafe EK43', name: 'Pre-Ground — Cafe Ground for My Brewer', group: 'Pre-Ground Coffee', kind: 'preground' }
    ];
  }

  function normalizeGrinderKey(raw) {
    var k = String(raw || '').trim().toLowerCase().replace(/_/g, '-');
    var aliases = {
      'c40': 'comandante-c40',
      'comandante-red': 'comandante-red-clix',
      '1zpresso-kultra': '1zpresso-k-ultra',
      '1zpresso-jultra': '1zpresso-j-ultra',
      'baratza-esp': 'baratza-encore-esp',
      'timemore-078': 'timemore-sculptor-078',
      'timemore-078s': 'timemore-sculptor-078s'
    };
    return aliases[k] || k || 'comandante-c40';
  }

  function getActiveGrinderKey(a) {
    var raw = (a.brew && a.brew.grinderKey) || (a.prefs && a.prefs.gear && (a.prefs.gear.grinderKey || a.prefs.gear.grinder)) || 'comandante-c40';
    return normalizeGrinderKey(raw);
  }

  function getActiveGrinderObj(a) {
    var key = getActiveGrinderKey(a);
    var list = getAllGrindersList();
    return list.find(function (g) { return g.key === key; }) || list[0];
  }

  function getCompatibleFilters(methodKey) {
    var m = getMethodObj(methodKey).key;
    if (typeof window !== 'undefined' && typeof window.filtersFor === 'function') {
      try {
        var res = window.filtersFor('', m);
        if (res && Array.isArray(res.fits) && res.fits.length) return res.fits;
      } catch (_) {}
    }
    if (typeof window !== 'undefined' && Array.isArray(window.FILTERS)) {
      var hits = window.FILTERS.filter(function (f) { return Array.isArray(f.fits) && f.fits.indexOf(m) >= 0; });
      if (hits.length) return hits;
    }
    return [
      { name: 'Standard Paper Filter', id: 'cone-bleached', group: 'Paper', flowClass: 'medium', material: 'paper' },
      { name: 'Fast Abaca Paper', id: 'cone-fast-abaca', group: 'Cafec', flowClass: 'fast', material: 'paper' },
      { name: 'Reusable Metal Mesh', id: 'metal-mesh-fine', group: 'Metal', flowClass: 'fast', material: 'metal' }
    ];
  }

  var EVERYDAY_WATER_GROUPS = [
    {
      groupKey: 'tap',
      label: 'Regular Tap',
      subLabel: 'Soft / Typical / Hard',
      defaultKey: 'tap_regular',
      options: [
        { key: 'tap_soft',    label: 'Soft Tap (Coastal / Mountain)', short: 'Soft Tap',    gh: 32,  kh: 20,  tds: 55,  category: 'everyday', groupKey: 'tap', waterType: 'tap_soft',    note: 'Low-buffer mountain/coastal tap — bright fruit & florals shine (-1 °C balance guard).' },
        { key: 'tap_regular', label: 'Regular Tap (Typical)',         short: 'Regular Tap', gh: 95,  kh: 65,  tds: 145, category: 'everyday', groupKey: 'tap', waterType: 'tap_regular', note: 'Balanced everyday municipal tap — gently rounds sharp acidity.' },
        { key: 'tap_hard',    label: 'Hard Tap (Mineral / Scale)',    short: 'Hard Tap',    gh: 210, kh: 145, tds: 310, category: 'everyday', groupKey: 'tap', waterType: 'tap_hard',    note: 'High carbonate buffer softens bright fruit (+1 °C boost active; filtered or spring recommended for light roasts).' }
      ]
    },
    {
      groupKey: 'filtered',
      label: 'Filtered Pitcher/Fridge',
      subLabel: 'Brita / Fridge / RO',
      defaultKey: 'filtered_pitcher',
      options: [
        { key: 'filtered_pitcher', label: 'Filtered Tap (Brita / Fridge / Carbon)', short: 'Brita / Fridge', gh: 70, kh: 45, tds: 105, category: 'everyday', groupKey: 'filtered', waterType: 'filtered_pitcher', note: 'Removes chlorine taste & softens hardness right into the specialty sweet spot.' },
        { key: 'distilled-ro',     label: 'ZeroWater / RO / Distilled',             short: 'ZeroWater / RO', gh: 0,  kh: 0,  tds: 1,   category: 'everyday', groupKey: 'filtered', waterType: 'ro_zero',          note: '0 ppm ultra-pure base — bright/tart alone (-1 °C guard); ideal for DIY mineral drops or 2-bottle blends.' }
      ]
    },
    {
      groupKey: 'bottled',
      label: 'Bottled Spring / Purified',
      subLabel: 'Spring / Purified',
      defaultKey: 'bottled_spring',
      options: [
        { key: 'bottled_spring',   label: 'Bottled Spring (Generic)',     short: 'Bottled Spring',   gh: 68, kh: 48, tds: 115, category: 'everyday', groupKey: 'bottled', waterType: 'bottled_spring',   note: 'Clean balanced spring minerals right out of the bottle.' },
        { key: 'bottled_purified', label: 'Bottled Purified / Drinking',  short: 'Bottled Purified', gh: 22, kh: 15, tds: 35,  category: 'everyday', groupKey: 'bottled', waterType: 'bottled_purified', note: 'Crisp scale-free purified water with light mineral polish.' }
      ]
    }
  ];

  var WATER_KEY_ALIASES = {
    'tap-regular': 'tap_regular',
    'local-tap-med': 'tap_regular',
    'regular-tap': 'tap_regular',
    'tap': 'tap_regular',
    'tap-soft': 'tap_soft',
    'tap-hard': 'tap_hard',
    'hard-tap': 'tap_hard',
    'filtered': 'filtered_pitcher',
    'filtered-pitcher': 'filtered_pitcher',
    'brita': 'filtered_pitcher',
    'filtered-fridge': 'filtered_pitcher',
    'filtered_fridge': 'filtered_pitcher',
    'ro-distilled': 'distilled-ro',
    'distilled_ro': 'distilled-ro',
    'zerowater': 'distilled-ro',
    'bottled': 'bottled_spring',
    'bottled-spring': 'bottled_spring',
    'bottled-purified': 'bottled_purified',
    'crystal-geyser-ca': 'crystal-geyser-shasta'
  };

  function getWaterPresets() {
    var groupByKey = Object.create(null);
    EVERYDAY_WATER_GROUPS.forEach(function (grp) {
      grp.options.forEach(function (o) { groupByKey[o.key] = grp.groupKey; });
    });
    var wList = (typeof window !== 'undefined' && Array.isArray(window.WATER_PROFILES_V6) && window.WATER_PROFILES_V6.length >= 20)
      ? window.WATER_PROFILES_V6
      : null;
    if (wList) {
      return wList.map(function (w) {
        var k = String(w.key || w.id || '').trim();
        var gk = groupByKey[k] || w.groupKey || (w.everydayGroup ? w.everydayGroup : 'brand_diy');
        return Object.assign({}, w, { key: k, groupKey: gk });
      });
    }
    var seen = Object.create(null);
    var merged = [];
    function addW(w) {
      if (!w || (!w.key && !w.id)) return;
      var k = String(w.key || w.id).trim();
      if (!k || seen[k]) return;
      seen[k] = 1;
      merged.push(w);
    }
    EVERYDAY_WATER_GROUPS.forEach(function (grp) {
      grp.options.forEach(addW);
    });
    var uni = (typeof window !== 'undefined' && window.WATER_PRESETS_UNIFIED) || null;
    if (Array.isArray(uni)) uni.forEach(addW);
    [
      { key: 'sca-target', label: 'SCA Balanced Target', short: 'SCA Balanced', gh: 68, kh: 40, kind: 'diy', note: 'Classic SCA specialty midpoint (68 Hardness / 40 Buffer ppm).' },
      { key: 'third-wave-classic', label: 'Third Wave Water Classic', short: 'Third Wave Classic', gh: 110, kh: 40, kind: 'diy', note: 'Remineralized packet in 1 US Gallon distilled water.' },
      { key: 'diy-light-gallon', label: 'DIY Gallon: Light Roast Clarity', short: 'DIY Light Gallon', gh: 70, kh: 32, kind: 'diy', note: '1 US Gal Distilled + level 1/8 tsp Epsom Salt + generous pinch Baking Soda.' },
      { key: 'diy-espresso-gallon', label: 'DIY Gallon: Zero-Scale Espresso', short: 'DIY Espresso', gh: 75, kh: 48, kind: 'diy', note: 'Pure MgSO4 + NaHCO3 in RO water — zero calcium boiler scale.' },
      { key: 'crystal-geyser-shasta', label: 'Crystal Geyser (Mt. Shasta, CA)', short: 'Crystal Geyser CA', gh: 52, kh: 45, kind: 'bottled', note: 'Ready to brew right out of the Mt. Shasta / Olancha bottle.' },
      { key: 'volvic', label: 'Volvic Natural Spring', short: 'Volvic', gh: 62, kh: 58, kind: 'bottled', note: 'Classic volcanic spring benchmark for medium roasts & espresso.' },
      { key: 'poland-spring', label: 'Poland Spring (Maine)', short: 'Poland Spring', gh: 20, kh: 16, kind: 'bottled', note: 'Soft Maine spring — vivid floral/citrus clarity.' }
    ].forEach(addW);
    return merged;
  }

  function _hasExplicitMineralNum(rawVal, allowZero) {
    if (rawVal === null || rawVal === undefined) return false;
    var s = String(rawVal).trim();
    if (s === '') return false;
    var n = +s;
    if (!isFinite(n)) return false;
    return n > 0 || !!allowZero;
  }

  function resolveActiveWaterObj(a) {
    var presets = getWaterPresets();
    var rawK = String((a && a.brew && (a.brew.waterProfileKey || a.brew.waterProfile)) || (a && a.prefs && a.prefs.waterProfileKey) || 'tap_regular').trim();
    var normK = WATER_KEY_ALIASES[rawK.toLowerCase()] || rawK;
    if (normK === 'custom_gh_kh' || normK === 'custom') {
      var rawGh = a && a.brew ? a.brew.waterGH : null;
      var rawKh = a && a.brew ? a.brew.waterAlk : null;
      var cGh = _hasExplicitMineralNum(rawGh, true) ? +rawGh : 68;
      var cKh = _hasExplicitMineralNum(rawKh, true) ? +rawKh : 40;
      return {
        key: 'custom_gh_kh',
        label: 'Custom Water (' + Math.round(cGh) + ' GH / ' + Math.round(cKh) + ' KH)',
        short: 'Custom ' + Math.round(cGh) + '/' + Math.round(cKh),
        gh: cGh,
        kh: cKh,
        groupKey: 'brand_diy',
        waterType: 'custom',
        note: 'Custom mineral hardness (' + Math.round(cGh) + ' ppm) & acid buffer (' + Math.round(cKh) + ' ppm).'
      };
    }
    var found = presets.find(function (w) { return w.key === normK || w.id === normK || w.key === rawK; })
      || presets.find(function (w) { return w.key === 'tap_regular'; })
      || presets[0];
    var grpKey = found.groupKey || '';
    if (!grpKey) {
      EVERYDAY_WATER_GROUPS.forEach(function (g) {
        if (g.options.some(function (o) { return o.key === found.key; })) grpKey = g.groupKey;
      });
    }
    if (!grpKey) grpKey = 'brand_diy';
    return Object.assign({}, found, { groupKey: grpKey });
  }

  function getActiveWaterConfig(a) {
    var w = resolveActiveWaterObj(a);
    var allowZero = (w.key === 'distilled-ro' || w.key === 'custom_gh_kh' || (a && a.brew && (a.brew.waterProfileKey === 'custom' || a.brew.waterProfileKey === 'custom_gh_kh')));
    var rawGh = a && a.brew ? a.brew.waterGH : null;
    var rawKh = a && a.brew ? a.brew.waterAlk : null;
    var gh = (w.key === 'custom_gh_kh' && _hasExplicitMineralNum(rawGh, allowZero))
      ? +rawGh
      : (w.gh != null && isFinite(+w.gh) ? +w.gh : (_hasExplicitMineralNum(rawGh, allowZero) ? +rawGh : 68));
    var kh = (w.key === 'custom_gh_kh' && _hasExplicitMineralNum(rawKh, allowZero))
      ? +rawKh
      : (w.kh != null && isFinite(+w.kh) ? +w.kh : (_hasExplicitMineralNum(rawKh, allowZero) ? +rawKh : 40));
    return {
      presetKey: w.key,
      key: w.key,
      gh: gh,
      kh: kh,
      ghPpm: gh,
      khPpm: kh,
      waterType: w.waterType || w.kind || w.groupKey || 'tap',
      label: w.label || w.short || w.key
    };
  }

  function applyBrewWaterSelection(a, wObj, opts) {
    if (!a || !wObj) return;
    opts = opts || {};
    var gh = wObj.gh != null && isFinite(+wObj.gh) ? Math.max(0, Math.round(+wObj.gh)) : 68;
    var kh = wObj.kh != null && isFinite(+wObj.kh) ? Math.max(0, Math.round(+wObj.kh)) : 40;
    var wType = wObj.waterType || wObj.kind || wObj.groupKey || 'tap';
    a.brew = a.brew || {};
    a.prefs = a.prefs || {};
    a.prefs.gear = a.prefs.gear || {};
    a.brew.waterProfileKey = wObj.key;
    a.brew.waterProfile = wObj.key;
    a.prefs.waterProfileKey = wObj.key;
    a.prefs.gear.waterType = wType;
    a.prefs.gear.waterProfileKey = wObj.key;
    a.brew.waterType = wType;
    a.brew.water_type = wType;
    a.brew.waterGH = gh;
    a.brew.water_gh = gh;
    a.brew.waterAlk = kh;
    a.brew.water_alk = kh;
    a.brew.waterLabel = wObj.label || wObj.short || wObj.key;
    if (!opts.skipSynth && !isRecipeLockedFor(a, a.brew.method)) {
      synthesizeScienceIntoApp(a, a.brew.method, { keepFilter: true, preserveBatch: true });
    }
    saveDraft();
  }

  function formatWaterChemPlain(gh, kh) {
    var g = gh != null && isFinite(+gh) ? Math.round(+gh) : 68;
    var k = kh != null && isFinite(+kh) ? Math.round(+kh) : 40;
    return 'Hardness ' + g + ' GH · Acid Buffer ' + k + ' KH';
  }

  function buildEverydayWaterPicker(a, opts) {
    opts = opts || {};
    var curWater = resolveActiveWaterObj(a);
    var curCfg = getActiveWaterConfig(a);
    var presets = getWaterPresets();
    var everydayKeys = Object.create(null);
    EVERYDAY_WATER_GROUPS.forEach(function (g) {
      g.options.forEach(function (o) { everydayKeys[o.key] = 1; });
    });
    var namedAndDiy = presets.filter(function (w) {
      var k = w.key || w.id;
      return k && !everydayKeys[k] && w.category !== 'everyday';
    });
    var activeGroupKey = curWater.groupKey || 'tap';
    var activeGroupObj = EVERYDAY_WATER_GROUPS.find(function (g) { return g.groupKey === activeGroupKey; }) || null;

    function selectWaterAndRefresh(wObj) {
      applyBrewWaterSelection(a, wObj);
      haptic('tick');
      if (typeof opts.onPicked === 'function') {
        opts.onPicked(wObj);
      } else {
        rerender();
      }
    }

    var cards4 = EVERYDAY_WATER_GROUPS.map(function (grp) {
      var isOn = activeGroupKey === grp.groupKey;
      return dom('button', {
        type: 'button',
        class: 'bt-water-choice-btn' + (isOn ? ' is-active' : ''),
        'data-water-group': grp.groupKey,
        'aria-pressed': String(isOn),
        onclick: function () {
          var alreadyInGrp = grp.options.find(function (o) { return o.key === curWater.key; });
          var pick = alreadyInGrp || grp.options.find(function (o) { return o.key === grp.defaultKey; }) || grp.options[0];
          selectWaterAndRefresh(pick);
        }
      },
        dom('span', { class: 'bt-water-choice-title', text: grp.label }),
        dom('span', { class: 'bt-water-choice-sub', text: grp.subLabel })
      );
    });

    var isBrandActive = activeGroupKey === 'brand_diy';
    cards4.push(dom('button', {
      type: 'button',
      class: 'bt-water-choice-btn' + (isBrandActive ? ' is-active' : ''),
      'data-water-group': 'brand_diy',
      'aria-pressed': String(isBrandActive),
      onclick: function () {
        if (!opts.inSheet) {
          haptic('tick');
          openSheet('water-quick-pick', {}, { title: 'Select Brew Water Profile', detent: 'full' });
        } else {
          var firstNamed = namedAndDiy[0] || presets[0];
          if (firstNamed) selectWaterAndRefresh(firstNamed);
        }
      }
    },
      dom('span', { class: 'bt-water-choice-title', text: 'Named Brands / DIY' }),
      dom('span', { class: 'bt-water-choice-sub', text: isBrandActive ? (curWater.short || curWater.label) : (namedAndDiy.length + ' Brands, Cities & DIY') })
    ));

    var subPills = null;
    if (activeGroupObj && Array.isArray(activeGroupObj.options)) {
      subPills = dom('div', { class: 'bt-pill-wrap', role: 'radiogroup', 'aria-label': activeGroupObj.label + ' Water Options' },
        activeGroupObj.options.map(function (opt) {
          var on = curWater.key === opt.key;
          return dom('button', {
            type: 'button',
            class: 'bt-chip-v6' + (on ? ' bt-chip-primary is-active' : ' bt-chip-soft'),
            style: 'min-height:38px;padding:5px 11px;font-size:0.77rem',
            'data-water-key': opt.key,
            'aria-pressed': String(on),
            onclick: function () { selectWaterAndRefresh(opt); }
          },
            ico('droplet', 13),
            dom('span', { text: (opt.short || opt.label) + ' (' + opt.gh + ' GH · ' + opt.kh + ' KH)' })
          );
        })
      );
    }

    var noteTxt = curWater.note || curWater.noteHuman || 'Balanced mineral hardness extracts sweet sugars while acid buffer keeps brightness smooth.';

    return dom('div', { class: 'bt-water-everyday-block', 'data-bt-everyday-water': '1' },
      dom('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap' },
        dom('span', { style: 'font-size:0.75rem;font-weight:800;color:var(--ink)', text: 'Brew Water (1-Tap Everyday or Brand/DIY)' }),
        !opts.inSheet ? dom('button', {
          type: 'button',
          style: 'font-size:0.73rem;font-weight:800;color:var(--accent)',
          text: 'All ' + presets.length + ' Profiles & Custom \u2192',
          onclick: function () { openSheet('water-quick-pick', {}, { title: 'Select Brew Water Profile', detent: 'full' }); }
        }) : null
      ),
      dom('div', { class: 'bt-water-everyday-grid', role: 'group', 'aria-label': 'Everyday Brew Water Categories' }, cards4),
      subPills,
      dom('div', { class: 'bt-water-chem-note' },
        dom('div', { style: 'min-width:0' },
          dom('b', { style: 'color:var(--ink)', text: (curWater.label || curCfg.label) + ' — ' }),
          dom('span', { class: 'bt-num', style: 'font-weight:700;color:var(--primary)', text: formatWaterChemPlain(curCfg.gh, curCfg.kh) }),
          dom('div', { style: 'font-size:0.72rem;color:var(--ink-secondary);margin-top:2px', text: noteTxt })
        )
      )
    );
  }

  /* ==================== 3. BEAN MATCHING, DEGASSING & SCIENCE SYNTHESIS ==================== */
  function roastColorFor(roast) {
    var r = String(roast || '').toLowerCase();
    if (r.indexOf('ultra') >= 0) return 'var(--roast-1, #C88A4B)';
    if (r === 'light') return 'var(--roast-2, #AD6D34)';
    if (r.indexOf('med-light') >= 0 || r.indexOf('medium-light') >= 0) return 'var(--roast-3, #8B5022)';
    if (r.indexOf('med-dark') >= 0 || r.indexOf('medium-dark') >= 0) return 'var(--roast-5, #47250F)';
    if (r.indexOf('dark') >= 0) return 'var(--roast-6, #2B1609)';
    return 'var(--roast-4, #693917)';
  }

  function computeDegassingBadge(coffee) {
    var c = coffee || {};
    if (c.is_frozen === 'yes' || c.is_frozen === true) {
      return { text: 'Frozen -18 °C · Peak Locked (12.3x)', cls: 'is-sci', days: 7 };
    }
    if (c.dateUnsure === 'yes' || c.dateUnsure === true || !c.roast_date) {
      return { text: 'Rested Baseline · 35s Bloom', cls: 'is-muted', days: 10 };
    }
    var ageObj = (typeof window !== 'undefined' && typeof window.effectiveBeanAge === 'function')
      ? window.effectiveBeanAge(c)
      : null;
    var d = ageObj && ageObj.effectiveDays != null ? Math.round(ageObj.effectiveDays) : null;
    if (d == null) {
      var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(c.roast_date || '').trim());
      if (m) {
        var t0 = Date.UTC(+m[1], +m[2] - 1, +m[3]);
        var now = new Date();
        var t1 = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
        d = Math.max(0, Math.round((t1 - t0) / 86400000));
      }
    }
    if (d == null) return { text: 'Rested Baseline', cls: 'is-muted', days: 10 };
    var isLight = /ultra|light/i.test(String(c.roast || ''));
    var peakStart = isLight ? 5 : 3;
    var peakEnd = isLight ? 28 : 21;
    if (d < peakStart) return { text: 'Day ' + d + ' · Degassing (+Bloom)', cls: 'is-gold', days: d };
    if (d <= peakEnd) return { text: 'Day ' + d + ' · Peak Window', cls: 'is-good', days: d };
    return { text: 'Day ' + d + ' · Gentle Bloom', cls: 'is-muted', days: d };
  }

  function scoreBrewerForBean(mObj, coffee) {
    var c = coffee || {};
    var roast = String(c.roast || 'medium-light').toLowerCase();
    var proc = String(c.process || 'washed').toLowerCase();
    var varietal = String(c.varietal || '') + ' ' + String(c.name || '');
    var isLight = roast.indexOf('ultra') >= 0 || roast === 'light';
    var isMedLight = roast.indexOf('medium-light') >= 0 || roast === 'med-light';
    var isDark = roast.indexOf('dark') >= 0;
    var isFerment = /anaerobic|thermal|carbonic|koji|infused|natural/.test(proc);
    var isFloral = /gesha|geisha|sl28|ethiopia/i.test(varietal + ' ' + String(c.origin || ''));
    var k = mObj.key;
    var score = 50;

    if (isLight || isMedLight) {
      if (k === 'v60' || k === 'origami' || k === 'orea') score += 28;
      if (k === 'aiden' || k === 'xbloom' || k === 'pulsar' || k === 'kalita') score += 22;
      if (k === 'switch' || k === 'aeropress') score += 18;
      if (isFloral && (k === 'v60' || k === 'origami' || k === 'chemex')) score += 10;
      if (k === 'moka') score -= 12;
    } else if (isDark) {
      if (k === 'espresso' || k === 'moka' || k === 'philips5500' || k === 'press') score += 28;
      if (k === 'nel' || k === 'aeropress' || k === 'cold' || k === 'clever') score += 20;
      if (k === 'chemex') score -= 10;
    } else {
      if (k === 'kalita' || k === 'aeropress' || k === 'switch' || k === 'v60' || k === 'espresso' || k === 'clever') score += 24;
      if (k === 'philips5500' || k === 'aiden') score += 18;
    }
    if (isFerment && (k === 'origami' || k === 'orea' || k === 'switch' || k === 'aeropress')) score += 8;
    return score;
  }

  function getTopBeanMatchSet(coffee) {
    var methods = getAllMethods23().slice();
    methods.sort(function (a, b) { return scoreBrewerForBean(b, coffee) - scoreBrewerForBean(a, coffee); });
    var set = {};
    for (var i = 0; i < Math.min(3, methods.length); i++) {
      set[methods[i].key] = i + 1;
    }
    return set;
  }

  function isRecipeLockedFor(a, methodKey) {
    if (a.recipeLocked && (!a.lockedMethod || a.lockedMethod === methodKey)) return true;
    return false;
  }

  function plainKitchenGrindWords(um) {
    var u = +um || 550;
    if (u <= 190) return 'Powder-fine, like flour (Turkish)';
    if (u <= 290) return 'Fine, like powdered sugar (Espresso)';
    if (u <= 430) return 'Fine-medium, like fine caster sugar';
    if (u <= 600) return 'Medium-fine, like table salt';
    if (u <= 740) return 'Medium, like kosher salt / rough sand';
    if (u <= 900) return 'Medium-coarse, like coarse sea salt';
    return 'Coarse, like cracked pepper / sea salt';
  }

  function mapGrinderClicks(um, grinderKey, methodKey, a) {
    var gKey = normalizeGrinderKey(grinderKey);
    var core = (typeof window !== 'undefined' && window.BTCoreV6) ? window.BTCoreV6 : null;
    var calib = (a && a.prefs && (a.prefs.pocketMicronCalib || a.prefs.calib)) || null;
    if (core && core.psd && typeof core.psd.mapMicronsToGrinder === 'function') {
      try {
        var res = core.psd.mapMicronsToGrinder(um, gKey, calib, methodKey);
        if (res && typeof res === 'object') {
          var shortTxt = res.shortDisplay || res.display || res.label || (res.clicks != null ? (res.clicks + ' clicks') : '');
          return {
            short: shortTxt || (Math.round(um / 28) + ' clicks'),
            full: res.display || res.label || shortTxt,
            clicks: res.clicks != null ? +res.clicks : (res.setting != null ? +res.setting : 20),
            stepUm: res.stepUm || 25,
            warning: res.warning || res.caution || '',
            incompatible: !!res.incompatible
          };
        }
      } catch (_) {}
    }
    var clicksFallback = Math.max(1, Math.round((+um || 550) / 27.5));
    return {
      short: clicksFallback + ' clicks',
      full: clicksFallback + ' clicks',
      clicks: clicksFallback,
      stepUm: 27.5,
      warning: '',
      incompatible: false
    };
  }

  function cleanStepLabelNoSlang(raw, idx) {
    var s = String(raw || '').trim();
    return s
      .replace(/^step\s*\d+\s*:\s*/i, '')
      .replace(/->/g, '\u2192')
      .replace(/degassing\s+bloom/ig, 'Wet Grounds (Bloom)')
      .replace(/sweet(?:ness)?\s*pulse\s*\d*/ig, 'Main Spiral Pour')
      .replace(/(?:final\s*)?balance\s*pulse/ig, 'Final Center-Out Pour')
      || ('Step ' + (idx + 1));
  }

  function ensureBrewState(a) {
    a.coffee = a.coffee || {};
    a.brew = a.brew || {};
    a.prefs = a.prefs || {};
    if (!a.prefs.tempUnit) a.prefs.tempUnit = 'F';
    if (!a.prefs.coffeeUnit) a.prefs.coffeeUnit = 'g';
    if (!a.prefs.waterUnit) a.prefs.waterUnit = 'g';
    if (!a.brew.method) a.brew.method = 'v60';
    var mObj = getMethodObj(a.brew.method);
    if (!(a.brew.dose > 0) || !(a.brew.water > 0) || !(a.brew.ratio > 0) || !(a.brew.tempC > 0) || !(a.brew.grindUm > 0)) {
      synthesizeScienceIntoApp(a, mObj.key, { preserveExisting: true });
    }
    return a;
  }

  /* Fixes Bug 05:1786 — Synthesizes fresh bean-adapted science recipe on brewer/bean/submode change */
  function synthesizeScienceIntoApp(a, methodKey, opts) {
    opts = opts || {};
    var mKey = String(methodKey || a.brew.method || 'v60').toLowerCase();
    var mObj = getMethodObj(mKey);
    a.brew.method = mObj.key;

    if (!opts.force && isRecipeLockedFor(a, mObj.key) && a.brew.dose > 0 && a.brew.water > 0 && a.brew.grindUm > 0) {
      return runCurrentSynthesis(a);
    }

    var subModes = getSubModesFor(mObj.key);
    var activeStyle = a.brew.style || (subModes[0] && subModes[0].id) || 'standard';
    var smObj = subModes.find(function (s) { return s.id === activeStyle; }) || subModes[0] || null;
    if (!smObj && subModes.length) {
      activeStyle = subModes[0].id;
      smObj = subModes[0];
    }
    a.brew.style = activeStyle;
    if (smObj && smObj.filterId && !opts.keepFilter) {
      a.brew.filterId = smObj.filterId;
    }

    var gKey = getActiveGrinderKey(a);
    var altM = a.brew.altitudeM != null ? +a.brew.altitudeM : ((a.prefs && a.prefs.gear && a.prefs.gear.altitudeFt) ? (+a.prefs.gear.altitudeFt * 0.3048) : 0);
    var waterCfg = getActiveWaterConfig(a);
    var keepBatch = !!(opts.preserveExisting || opts.preserveBatch);
    var core = (typeof window !== 'undefined' && window.BTCoreV6) ? window.BTCoreV6 : null;

    var syn = null;
    if (core && typeof core.synthesizeRecipe === 'function') {
      try {
        syn = core.synthesizeRecipe({
          bean: a.coffee,
          coffee: a.coffee,
          method: mObj.key,
          methodKey: mObj.key,
          style: activeStyle,
          grinderKey: gKey,
          filterId: a.brew.filterId || mObj.defaultFilterId,
          altitudeM: altM,
          water: waterCfg,
          ratio: (keepBatch && a.brew.ratio > 0) ? +a.brew.ratio : (smObj && smObj.ratio ? smObj.ratio : undefined),
          doseG: (keepBatch && a.brew.dose > 0) ? +a.brew.dose : undefined,
          waterG: (keepBatch && a.brew.water > 0) ? +a.brew.water : undefined,
          tempC: (opts.preserveExisting && a.brew.tempC > 0) ? +a.brew.tempC : (smObj && smObj.tempC != null ? smObj.tempC : undefined),
          d50Um: (opts.preserveExisting && a.brew.grindUm > 0) ? +a.brew.grindUm : (smObj && smObj.d50Um ? smObj.d50Um : undefined),
          calib: a.prefs && (a.prefs.pocketMicronCalib || a.prefs.calib),
          immersionBasis: (a.prefs && a.prefs.immersionBasis) || 'liang'
        });
      } catch (_) {}
    }

    if (syn && typeof syn === 'object') {
      var synDose = +(syn.doseG || syn.dose || mObj.dose || 15);
      var synRatio = +(syn.ratio || (smObj && smObj.ratio) || mObj.ratio || 16.5);
      var synWater = +(syn.waterG || syn.water || Math.round(synDose * synRatio));
      var synTempC = syn.kettleTempC != null ? +syn.kettleTempC : (syn.tempC != null ? +syn.tempC : 94);
      var synUm = +(syn.d50Um || syn.grindUm || mObj.d50AnchorUm || 550);
      if (smObj && smObj.d50Mult && !opts.preserveExisting) {
        synUm = Math.round((synUm * smObj.d50Mult) / 5) * 5;
      }
      if (smObj && smObj.iced && !opts.preserveExisting) {
        synUm = Math.max(200, Math.round((synUm * 0.91) / 5) * 5);
      }
      /* Apply retail filter umMult if selected */
      if (typeof window !== 'undefined' && typeof window.filterV6For === 'function' && (a.brew.filter || a.brew.filterId)) {
        try {
          var fV6 = window.filterV6For(a.brew.filter || a.brew.filterId, mObj.key);
          if (fV6 && fV6.umMult && fV6.umMult !== 1 && !opts.preserveExisting) {
            synUm = Math.round((synUm * fV6.umMult) / 5) * 5;
          }
        } catch (_) {}
      }
      a.brew.dose = Math.round(synDose * 10) / 10;
      a.brew.ratio = Math.round(synRatio * (mObj.outRatio ? 100 : 10)) / (mObj.outRatio ? 100 : 10);
      a.brew.water = mObj.outRatio ? Math.round(a.brew.dose * a.brew.ratio * 2) / 2 : Math.round(synWater);
      a.brew.tempC = Math.round(synTempC * 2) / 2;
      a.brew.tempF = Math.round(a.brew.tempC * 9 / 5 + 32);
      a.brew.baseSynthTempC = a.brew.tempC;
      a.brew.baseSynthUm = synUm;
      a.brew.grindUm = synUm;
    } else {
      var rFallback = (keepBatch && a.brew.ratio > 0) ? +a.brew.ratio : ((smObj && smObj.ratio) || mObj.ratio || 16.5);
      var dFallback = (keepBatch && a.brew.dose > 0) ? +a.brew.dose : (mObj.dose || (mObj.outRatio ? 18 : 15));
      var roastStr = String((a.coffee && a.coffee.roast) || 'medium-light').toLowerCase();
      var wKh = waterCfg.kh != null ? +waterCfg.kh : 40;
      var khTempShift = (mObj.key === 'cold' || mObj.key === 'cold_drip' || mObj.key === 'moka' || mObj.key === 'turkish') ? 0 : (wKh > 85 ? 1.0 : (wKh < 18 ? -1.0 : 0));
      var tFallback = mObj.key === 'cold' ? 4 : mObj.key === 'cold_drip' ? 3 : (roastStr.indexOf('dark') >= 0 ? 87 : roastStr.indexOf('light') >= 0 ? 95 : 92) + khTempShift;
      a.brew.dose = dFallback;
      a.brew.ratio = rFallback;
      a.brew.water = (keepBatch && a.brew.water > 0) ? +a.brew.water : (mObj.outRatio ? Math.round(dFallback * rFallback * 2) / 2 : Math.round(dFallback * rFallback));
      a.brew.tempC = (smObj && smObj.tempC != null) ? smObj.tempC : tFallback;
      a.brew.tempF = Math.round(a.brew.tempC * 9 / 5 + 32);
      a.brew.grindUm = (smObj && smObj.d50Um) || mObj.d50AnchorUm || 550;
      a.brew.baseSynthTempC = a.brew.tempC;
      a.brew.baseSynthUm = a.brew.grindUm;
    }

    var gm = mapGrinderClicks(a.brew.grindUm, gKey, mObj.key, a);
    a.brew.grind_setting = gm.short;
    if (!opts.preserveExisting && !opts.preserveBatch) a.brew.customizedNote = '';
    return runCurrentSynthesis(a);
  }

  function runCurrentSynthesis(a) {
    ensureBrewState(a);
    var mObj = getMethodObj(a.brew.method);
    var gKey = getActiveGrinderKey(a);
    var gObj = getActiveGrinderObj(a);
    var waterCfg = getActiveWaterConfig(a);
    var core = (typeof window !== 'undefined' && window.BTCoreV6) ? window.BTCoreV6 : null;
    var styleId = a.brew.style || 'standard';
    var isIced = /iced|flash/i.test(styleId);
    var totalWaterG = +a.brew.water || 250;
    var iceG = isIced && !mObj.outRatio ? Math.round(totalWaterG * 0.38) : 0;
    var hotPourG = Math.max(25, totalWaterG - iceG);
    var doseG = +a.brew.dose || 15;
    var ratio = +a.brew.ratio || Math.round((totalWaterG / Math.max(1, doseG)) * 10) / 10;
    var tempC = a.brew.tempC != null ? +a.brew.tempC : 94;
    var um = +a.brew.grindUm || mObj.d50AnchorUm || 550;

    /* Pre-Ground Rescue Compensation */
    var pregroundInfo = null;
    if (typeof window !== 'undefined' && window.PREGROUND_PROFILES && window.PREGROUND_PROFILES[gKey]) {
      var pgProf = window.PREGROUND_PROFILES[gKey];
      if (pgProf.fixedUm) um = pgProf.fixedUm;
      if (typeof pgProf.forMethod === 'function') pregroundInfo = pgProf.forMethod(mObj.key);
    }

    var syn = null;
    if (core && typeof core.synthesizeRecipe === 'function') {
      try {
        syn = core.synthesizeRecipe({
          bean: a.coffee,
          coffee: a.coffee,
          method: mObj.key,
          methodKey: mObj.key,
          style: styleId,
          doseG: doseG,
          waterG: isIced ? hotPourG : totalWaterG,
          ratio: isIced ? +(hotPourG / doseG).toFixed(2) : ratio,
          tempC: tempC,
          d50Um: um,
          grinderKey: gKey,
          filterId: a.brew.filterId || mObj.defaultFilterId,
          water: waterCfg,
          calib: a.prefs && (a.prefs.pocketMicronCalib || a.prefs.calib),
          immersionBasis: (a.prefs && a.prefs.immersionBasis) || 'liang'
        });
      } catch (_) {}
    }

    var gMapped = mapGrinderClicks(um, gKey, mObj.key, a);
    a.brew.grind_setting = gMapped.short;

    var totalSecs = (syn && (syn.totalSecs || (syn.sim && syn.sim.brewTimeS))) ? Math.round(syn.totalSecs || syn.sim.brewTimeS)
      : (mObj.outRatio ? 28 : mObj.key === 'aeropress' ? 135 : mObj.key === 'press' ? 510 : mObj.key === 'cold' ? 64800 : 165);
    var predTds = (syn && (syn.expectedTds || (syn.sim && syn.sim.tdsPct))) ? +(syn.expectedTds || syn.sim.tdsPct).toFixed(2) : (mObj.outRatio ? 9.6 : 1.38);
    var predEy = (syn && (syn.expectedEy || (syn.sim && syn.sim.eyPct))) ? +(syn.expectedEy || syn.sim.eyPct).toFixed(1) : 20.3;

    var yieldMl = mObj.outRatio ? Math.round(totalWaterG)
      : (typeof window !== 'undefined' && typeof window.expectedYield === 'function')
      ? Math.round(window.expectedYield(mObj.key, totalWaterG, doseG, { own: a.prefs && a.prefs.yieldCal }))
      : Math.max(20, Math.round(totalWaterG - doseG * (mObj.rWater || 2.1)));

    var usesPaper = (typeof window !== 'undefined' && typeof window.usesPaper === 'function')
      ? window.usesPaper(mObj.key)
      : (['v60', 'origami', 'kalita', 'orea', 'pulsar', 'chemex', 'drip', 'aiden', 'xbloom', 'switch', 'clever', 'aeropress'].indexOf(mObj.key) >= 0);
    var kettleG = (typeof window !== 'undefined' && typeof window.kettleFill === 'function')
      ? window.kettleFill(hotPourG, { rinse: usesPaper ? 50 : 0, margin: 85 })
      : Math.ceil((hotPourG + (usesPaper ? 50 : 0) + 85) / 5) * 5;

    var rawSteps = [];
    if (styleId === 'kasuya-46' && !mObj.outRatio) {
      var p1 = Math.round(hotPourG * 0.16);
      var p2 = Math.round(hotPourG * 0.40);
      var p3 = Math.round(hotPourG * 0.60);
      var p4 = Math.round(hotPourG * 0.80);
      rawSteps = [
        { t: 0,   endS: 45,  pourStartS: 0,   pourEndS: 14,  startG: 0,  endG: p1,       targetG: p1,       title: 'Pour 1: Sweetness & Acidity Balance', human: 'Pour gently to ' + p1 + ' g and let drain completely to unlock bright aromatics.', say: 'First pour gently to ' + p1 + ' grams.' },
        { t: 45,  endS: 90,  pourStartS: 45,  pourEndS: 62,  startG: p1, endG: p2,       targetG: p2,       title: 'Pour 2: Lock Sweetness (40% Mark)',   human: 'Second pour to ' + p2 + ' g cumulative to round out natural fruit sweetness.', say: 'Second pour to ' + p2 + ' grams.' },
        { t: 90,  endS: 130, pourStartS: 90,  pourEndS: 106, startG: p2, endG: p3,       targetG: p3,       title: 'Pour 3: Strength Pulse 1',            human: 'Pour steadily in spirals to ' + p3 + ' g.', say: 'Third pour in spirals to ' + p3 + ' grams.' },
        { t: 130, endS: 165, pourStartS: 130, pourEndS: 145, startG: p3, endG: p4,       targetG: p4,       title: 'Pour 4: Strength Pulse 2',            human: 'Pour gently to ' + p4 + ' g.', say: 'Fourth pour to ' + p4 + ' grams.' },
        { t: 165, endS: 210, pourStartS: 165, pourEndS: 180, startG: p4, endG: hotPourG, targetG: hotPourG, title: 'Pour 5: Final Pour & Drawdown',       human: 'Final pour to ' + hotPourG + ' g and allow bed to drain flat.', say: 'Final pour to ' + hotPourG + ' grams, then let drain.' }
      ];
      totalSecs = 210;
    } else if (syn && Array.isArray(syn.steps) && syn.steps.length) {
      rawSteps = syn.steps.map(function (st, idx) {
        var prevSt = idx > 0 ? syn.steps[idx - 1] : null;
        var nextSt = syn.steps[idx + 1];
        var t0 = st.t != null ? +st.t : 0;
        var t1 = nextSt && nextSt.t != null ? +nextSt.t : Math.max(t0 + 15, totalSecs);
        var cleanTitle = cleanStepLabelNoSlang(st.title || st.label, idx);
        var tgt = st.targetG != null ? Math.round(+st.targetG) : hotPourG;
        var sG = st.fromG != null ? Math.round(+st.fromG) : (prevSt && prevSt.targetG != null ? Math.round(+prevSt.targetG) : 0);
        var hum = String(st.human || '').replace(/->/g, '\u2192').replace(/sweet\s*pulse/ig, 'main pour');
        var spoken = tgt > 0 && idx < syn.steps.length - 1
          ? (cleanTitle.split('\u2192')[0].trim() + '. Pour steadily to ' + tgt + ' grams.')
          : (cleanTitle.split('\u2192')[0].trim() + '. ' + hum.split('.')[0] + '.');
        return {
          t: t0,
          endS: Math.max(t0 + 5, t1),
          pourStartS: st.pourStartS != null ? +st.pourStartS : t0,
          pourEndS: st.pourEndS != null ? +st.pourEndS : Math.max(t0 + 5, t1),
          startG: sG,
          endG: tgt,
          targetG: tgt,
          targetFlowGs: st.targetFlowGs != null ? +st.targetFlowGs : null,
          title: cleanTitle,
          human: hum || ('Target ' + tgt + ' g' + (isIced && idx === 0 ? ' (' + iceG + ' g ice in server below)' : '.')),
          say: spoken,
          scientist: st.scientist || '',
          epistemicTier: st.epistemicTier || 'verified_science'
        };
      });
    } else {
      var bloomG = Math.min(hotPourG, Math.round(doseG * 3));
      var midG = Math.round(hotPourG * 0.62);
      rawSteps = [
        { t: 0,   endS: 38,        pourStartS: 0,   pourEndS: 14,  startG: 0,        endG: bloomG,   targetG: bloomG,   title: 'Wet Grounds (Bloom)',   human: 'Pour center-out to ' + bloomG + ' g so all grounds wet evenly, then give 1 gentle swirl.', say: 'Wet grounds evenly to ' + bloomG + ' grams, then swirl gently.' },
        { t: 38,  endS: 80,        pourStartS: 38,  pourEndS: 72,  startG: bloomG,   endG: midG,     targetG: midG,     title: 'Main Spiral Pour',      human: 'Pour steadily in gentle spirals up to ' + midG + ' g to dissolve mid-brew caramel sugars.', say: 'Pour steadily in spirals to ' + midG + ' grams.' },
        { t: 80,  endS: 118,       pourStartS: 80,  pourEndS: 112, startG: midG,     endG: hotPourG, targetG: hotPourG, title: 'Final Center-Out Pour', human: 'Pour smoothly to ' + hotPourG + ' g' + (isIced ? ' over ' + iceG + ' g server ice.' : ' to reach target balance.'), say: 'Final pour to ' + hotPourG + ' grams.' },
        { t: 118, endS: totalSecs, pourStartS: 118, pourEndS: 118, startG: hotPourG, endG: hotPourG, targetG: hotPourG, title: 'Drawdown to Flat Bed',  human: 'Allow coffee bed to drain cleanly until flat.', say: 'Let the bed drain cleanly into your server.' }
      ];
    }

    return {
      method: mObj,
      grinder: gObj,
      grinderKey: gKey,
      grindMap: gMapped,
      plainGrind: plainKitchenGrindWords(um),
      doseG: doseG,
      waterG: totalWaterG,
      hotPourG: hotPourG,
      iceG: iceG,
      isIced: isIced,
      ratio: ratio,
      tempC: tempC,
      tempF: Math.round(tempC * 9 / 5 + 32),
      d50Um: um,
      totalSecs: totalSecs,
      predTds: predTds,
      predEy: predEy,
      yieldMl: yieldMl,
      kettleG: kettleG,
      usesPaper: usesPaper,
      pregroundInfo: pregroundInfo,
      explanations: (syn && syn.explanations) || [],
      steps: rawSteps
    };
  }

  function fmtClock(secs, withTenths) {
    var s = Math.max(0, +secs || 0);
    if (!withTenths && s >= 3600) {
      var h = Math.floor(s / 3600);
      var remM = Math.round((s % 3600) / 60);
      return remM > 0 ? (h + 'h ' + remM + 'm') : (h + 'h 00m');
    }
    var w = Math.floor(s);
    var m = Math.floor(w / 60);
    var r = w % 60;
    var base = (m < 10 ? '0' + m : String(m)) + ':' + (r < 10 ? '0' + r : String(r));
    if (!withTenths) return base;
    return base + '.' + (Math.floor((s - w) * 10) % 10);
  }

  function buildStickyCtaBar(cfg) {
    if (!cfg) return null;
    var bar = dom('div', { class: 'bt-brew-sticky-bar bt-sticky-cta-wrap' });
    if (cfg.secondaryLabel && typeof cfg.onSecondary === 'function') {
      bar.appendChild(dom('button', {
        type: 'button',
        class: 'bt-secondary-cta',
        onclick: cfg.onSecondary
      }, cfg.secondaryIcon ? ico(cfg.secondaryIcon, 16) : null, dom('span', { text: cfg.secondaryLabel })));
    }
    var cleanLbl = String(cfg.label || '').replace(/\s*(?:->|\u2192)\s*$/, '');
    bar.appendChild(dom('button', {
      type: 'button',
      class: 'bt-cta-btn' + (cfg.copper ? ' bt-cta-copper' : ''),
      id: cfg.id || '',
      onclick: cfg.onClick
    },
      dom('span', { class: 'bt-cta-copy' },
        dom('span', { text: cleanLbl }),
        cfg.sub ? dom('span', { class: 'bt-cta-sub', text: cfg.sub }) : null
      ),
      ico(cfg.icon || 'chevron-right', 19)
    ));
    return bar;
  }

  /* ==================== 4. SHARE / IMPORT BT6: & bt1: PASSPORT CODEC ==================== */
  var _B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  function _btoaSafe(bin) {
    if (typeof btoa === 'function') return btoa(bin);
    var out = '';
    for (var i = 0; i < bin.length; i += 3) {
      var b0 = bin.charCodeAt(i) & 255;
      var has1 = (i + 1) < bin.length;
      var has2 = (i + 2) < bin.length;
      var b1 = has1 ? (bin.charCodeAt(i + 1) & 255) : 0;
      var b2 = has2 ? (bin.charCodeAt(i + 2) & 255) : 0;
      var n = (b0 << 16) | (b1 << 8) | b2;
      out += _B64_CHARS.charAt((n >> 18) & 63)
           + _B64_CHARS.charAt((n >> 12) & 63)
           + (has1 ? _B64_CHARS.charAt((n >> 6) & 63) : '=')
           + (has2 ? _B64_CHARS.charAt(n & 63) : '=');
    }
    return out;
  }

  function _atobSafe(b64) {
    if (typeof atob === 'function') return atob(b64);
    var s = String(b64 || '').replace(/[^A-Za-z0-9+/]/g, '');
    var out = '';
    for (var i = 0; i < s.length; i += 4) {
      var c0 = _B64_CHARS.indexOf(s.charAt(i));
      var c1 = _B64_CHARS.indexOf(s.charAt(i + 1));
      var c2 = (i + 2) < s.length ? _B64_CHARS.indexOf(s.charAt(i + 2)) : -1;
      var c3 = (i + 3) < s.length ? _B64_CHARS.indexOf(s.charAt(i + 3)) : -1;
      var n = (c0 << 18) | (c1 << 12) | ((c2 >= 0 ? c2 : 0) << 6) | (c3 >= 0 ? c3 : 0);
      out += String.fromCharCode((n >> 16) & 255);
      if (c2 >= 0) out += String.fromCharCode((n >> 8) & 255);
      if (c3 >= 0) out += String.fromCharCode(n & 255);
    }
    return out;
  }

  function toB64Url(str) {
    var utf8 = unescape(encodeURIComponent(str));
    return _btoaSafe(utf8).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function fromB64Url(b64) {
    var clean = String(b64 || '').replace(/-/g, '+').replace(/_/g, '/');
    while (clean.length % 4) clean += '=';
    return decodeURIComponent(escape(_atobSafe(clean)));
  }

  function buildBt6ShareBundle(a, rec) {
    a = ensureBrewState(a || getApp());
    rec = rec || runCurrentSynthesis(a);
    var c = a.coffee || {};
    var payload = {
      v: 6,
      n: String(c.name || 'Specialty Coffee').slice(0, 40),
      r: String(c.roaster || '').slice(0, 32),
      o: String(c.origin || '').slice(0, 24),
      p: String(c.process || 'washed').slice(0, 18),
      rl: String(c.roast || 'medium-light').slice(0, 16),
      m: rec.method.key,
      st: a.brew.style || 'standard',
      d: rec.doseG,
      w: rec.waterG,
      ra: rec.ratio,
      tc: rec.tempC,
      um: rec.d50Um,
      gk: rec.grinderKey,
      gs: rec.grindMap.short
    };
    var b64 = '';
    try { b64 = toB64Url(JSON.stringify(payload)); } catch (_) {}
    var bt6Code = 'BT6:' + b64;
    var bt1Res = (typeof window !== 'undefined' && window.BTInnovate && typeof window.BTInnovate.encodeBrewPassport === 'function')
      ? window.BTInnovate.encodeBrewPassport({
          bean: c,
          recipe: {
            methodKey: rec.method.key,
            doseG: rec.doseG,
            waterG: rec.waterG,
            d50Um: rec.d50Um,
            tempC: rec.tempC,
            grinderKey: rec.grinderKey
          }
        })
      : null;

    var shareUrl = '';
    try {
      if (typeof location !== 'undefined' && location.origin && location.origin !== 'null') {
        shareUrl = location.origin + location.pathname + '#bt6=' + b64;
      }
    } catch (_) {}

    var qrTarget = shareUrl || bt6Code;
    var qrSvg = '';
    if (typeof window !== 'undefined' && typeof window.encodeQrSvg === 'function') {
      try { qrSvg = window.encodeQrSvg(qrTarget, { margin: 2 }); } catch (_) {}
    }

    return {
      code: bt6Code,
      bt6Code: bt6Code,
      bt1Uri: bt1Res ? bt1Res.uri : '',
      shareUrl: shareUrl,
      qrSvg: qrSvg,
      summary: (payload.r ? payload.r + ' — ' : '') + payload.n + ' · ' + rec.method.label + ' ' + rec.doseG + 'g : ' + rec.waterG + 'g (1:' + rec.ratio + ') @ ' + rec.tempC + ' °C · ' + rec.grindMap.short
    };
  }

  function decodeAnySharedBrew(rawInput, a) {
    a = ensureBrewState(a || getApp());
    var txt = String(rawInput || '').trim();
    if (!txt) return { ok: false, why: 'Paste a BT6: recipe code, bt1: passport, or shared URL.' };

    var rxGrinderKey = getActiveGrinderKey(a);
    var rxGrinderObj = getActiveGrinderObj(a);

    /* 1. BT6: or #bt6= URL hash */
    var mBt6 = /(?:BT6:|#bt6=|[?&]bt6=)([A-Za-z0-9\-_]{8,})/i.exec(txt);
    if (mBt6) {
      try {
        var obj = JSON.parse(fromB64Url(mBt6[1]));
        var senderGk = normalizeGrinderKey(obj.gk || 'comandante-c40');
        var rawUm = +obj.um || 550;
        /* Darcy-D32 Burr-Span Compensation across grinders */
        var srcArch = (typeof window !== 'undefined' && typeof window.burrArchetypeFor === 'function') ? window.burrArchetypeFor(senderGk) : { spanNom: 1.15 };
        var dstArch = (typeof window !== 'undefined' && typeof window.burrArchetypeFor === 'function') ? window.burrArchetypeFor(rxGrinderKey) : { spanNom: 1.25 };
        var spanDiff = (dstArch.spanNom || 1.25) - (srcArch.spanNom || 1.15);
        var locUm = Math.round((rawUm * (1 + 0.09 * spanDiff)) / 5) * 5;
        var mKey = getMethodObj(obj.m || 'v60').key;
        var mapped = mapGrinderClicks(locUm, rxGrinderKey, mKey, a);
        return {
          ok: true,
          coffee: { name: obj.n || 'Shared Coffee', roaster: obj.r || '', origin: obj.o || '', process: obj.p || 'washed', roast: obj.rl || 'medium-light' },
          methodKey: mKey,
          style: obj.st || 'standard',
          doseG: +obj.d || 15,
          waterG: +obj.w || 250,
          ratio: +obj.ra || Math.round(((+obj.w || 250) / Math.max(1, +obj.d || 15)) * 10) / 10,
          tempC: +obj.tc || 94,
          senderGrinder: senderGk,
          senderSetting: obj.gs || (rawUm + ' µm'),
          senderUm: rawUm,
          localizedUm: locUm,
          rxGrinderLabel: rxGrinderObj.short || rxGrinderObj.name,
          rxGrindSetting: mapped.short,
          rxGrindFull: mapped.full,
          spanNote: Math.abs(spanDiff) >= 0.08
            ? (getExperienceLens() === 'scientist'
                ? ('Darcy-D32 burr-span compensated (' + rawUm + ' \u2192 ' + locUm + ' µm) for your ' + (rxGrinderObj.short || rxGrinderObj.name) + '.')
                : ('Auto-matched to your ' + (rxGrinderObj.short || rxGrinderObj.name) + ' burr profile (' + rawUm + ' \u2192 ' + locUm + ' µm).'))
            : ('Direct micron match (' + locUm + ' µm) on your ' + (rxGrinderObj.short || rxGrinderObj.name) + '.')
        };
      } catch (_) {
        return { ok: false, why: 'Could not decode BT6: code — check that the full code was pasted.' };
      }
    }

    /* 2. bt1: / decodeAndLocalizePassport */
    if (typeof window !== 'undefined' && window.BTInnovate && typeof window.BTInnovate.decodeAndLocalizePassport === 'function') {
      var dp = window.BTInnovate.decodeAndLocalizePassport(txt, Object.assign({ grinderKey: rxGrinderKey }, a.prefs || {}));
      if (dp && dp.ok && dp.localizedRecipe) {
        var lr = dp.localizedRecipe;
        var gm = mapGrinderClicks(lr.d50Um, rxGrinderKey, lr.methodKey, a);
        return {
          ok: true,
          coffee: dp.bean || {},
          methodKey: getMethodObj(lr.methodKey).key,
          style: 'standard',
          doseG: lr.doseG,
          waterG: lr.waterG,
          ratio: lr.ratio,
          tempC: lr.tempC,
          senderGrinder: (dp.senderRecipe && dp.senderRecipe.grinderKey) || 'sender grinder',
          senderSetting: ((dp.senderRecipe && dp.senderRecipe.d50Um) || lr.d50Um) + ' µm',
          senderUm: (dp.senderRecipe && dp.senderRecipe.d50Um) || lr.d50Um,
          localizedUm: lr.d50Um,
          rxGrinderLabel: rxGrinderObj.short || rxGrinderObj.name,
          rxGrindSetting: gm.short,
          rxGrindFull: gm.full,
          spanNote: lr.boilCapNote || lr.waterNote || ('Auto-translated to ' + (rxGrinderObj.short || rxGrinderObj.name) + '.')
        };
      }
    }

    /* 3. Legacy BT-code: V1 via shareRead */
    if (typeof window !== 'undefined' && typeof window.shareRead === 'function') {
      try {
        var sr = window.shareRead(txt);
        if (sr && sr.ok && (sr.coffee || sr.brew)) {
          var b = sr.brew || {};
          var mk = getMethodObj(b.method || 'v60').key;
          var estUm = +b.grindUm || getMethodObj(mk).d50AnchorUm || 550;
          var gm2 = mapGrinderClicks(estUm, rxGrinderKey, mk, a);
          return {
            ok: true,
            coffee: sr.coffee || { name: 'Shared Coffee' },
            methodKey: mk,
            style: b.style || 'standard',
            doseG: +b.dose || 15,
            waterG: +b.water || 250,
            ratio: +b.ratio || 16.5,
            tempC: b.tempF ? Math.round(((+b.tempF - 32) * 5 / 9) * 2) / 2 : (+b.tempC || 94),
            senderGrinder: b.grinderName || 'sender grinder',
            senderSetting: b.grind_setting || (estUm + ' µm'),
            senderUm: estUm,
            localizedUm: estUm,
            rxGrinderLabel: rxGrinderObj.short || rxGrinderObj.name,
            rxGrindSetting: gm2.short,
            rxGrindFull: gm2.full,
            spanNote: 'Translated to your ' + (rxGrinderObj.short || rxGrinderObj.name) + '.'
          };
        }
      } catch (_) {}
    }

    return { ok: false, why: 'Unrecognized share code. Paste a BT6: code, bt1: passport, BT-code: V1, or shared link.' };
  }

  /* ==================== 5. FRONT DOOR MORNING COMMAND CENTER ('door') ==================== */
  var _freshConfirmTimer = null;
  var _freshArmed = false;

  function readActiveShopDraftInfo(a) {
    var sd = (a && a.shopDraft) || null;
    if (!sd || typeof sd !== 'object') {
      try {
        if (typeof window !== 'undefined' && window.BTStorage && typeof window.BTStorage.getShopDraft === 'function') {
          sd = window.BTStorage.getShopDraft();
        }
      } catch (_) {}
    }
    if (!sd || typeof sd !== 'object') return null;
    var shopName = String(sd.shopName || sd.shop || sd.place || '').trim();
    var drinkName = String(sd.drinkLabel || sd.drink || sd.kind || '').trim();
    var rawStep = String(sd.step == null ? '' : sd.step).trim().toLowerCase();
    var stepMap = { shop: 1, sdrink: 2, drink: 2, staste: 3, taste: 3, sperfect: 4, perfect: 4 };
    var parsedStep = stepMap[rawStep] || (+rawStep > 0 ? Math.round(+rawStep) : (drinkName ? 2 : 1));
    var stepNum = Math.max(1, Math.min(4, isFinite(parsedStep) ? parsedStep : 1));
    if (!shopName && !drinkName && !(stepNum > 1)) return null;
    return {
      shopName: shopName || 'Coffee Shop',
      drinkName: drinkName || 'Cafe Drink',
      step: stepNum
    };
  }

  function getSavedVaultCoffees() {
    try {
      if (typeof window !== 'undefined' && window.BTStorage && typeof window.BTStorage.buildUnifiedCoffeesIndex === 'function') {
        var list = window.BTStorage.buildUnifiedCoffeesIndex();
        if (Array.isArray(list)) return list;
      }
    } catch (_) {}
    return [];
  }

  function startFreshCoffeeFlow(a, goToStep1) {
    a = a || getApp();
    clearTimeout(_freshConfirmTimer);
    _freshArmed = false;
    stopActiveTimerSession(true);
    _timerSession.brewSig = '';
    try {
      if (typeof window !== 'undefined' && window.BTTasteStep && typeof window.BTTasteStep.resetSession === 'function') {
        window.BTTasteStep.resetSession();
      }
    } catch (_) {}
    var sh = getShell();
    if (sh && typeof sh.freshAll === 'function') {
      sh.freshAll({ freshCoffeeMode: true, targetBrewStep: goToStep1 ? 'coffee' : 'door' });
    } else if (a) {
      a.coffee = {};
      a.attempt = 0;
      a.recipeLocked = false;
      a.dialNote = null;
      a.cupBrew = null;
      a.freshCoffeeMode = true;
      if (a.brew) {
        a.brew.actualSecs = null;
        a.brew.actualFromTimer = false;
      }
      saveDraft();
      if (goToStep1) goBrewStep('coffee');
      else rerender();
    }
  }

  function renderDoorScreen(stageEl, a) {
    ensureBrewState(a);
    var lens = getExperienceLens();
    var vaultCoffees = getSavedVaultCoffees();
    var hasLiveCoffee = !!(a.coffee && String(a.coffee.name || '').trim());
    if (hasLiveCoffee) a.freshCoffeeMode = false;
    var topVaultBag = vaultCoffees.find(function (r) { return !!r.openBag; }) || vaultCoffees[0] || null;
    var heroCoffee = hasLiveCoffee ? a.coffee : (a.freshCoffeeMode ? null : topVaultBag);
    var isMidBrew = hasLiveCoffee && (_timerSession.running || _timerSession.stopped || _timerSession.elapsedS > 0 || !!a.cupBrew);
    var shopInfo = readActiveShopDraftInfo(a);
    var rec = runCurrentSynthesis(a);

    /* 1. Header + 1-Tap New Fresh Coffee Action */
    var hasAnyDraft = hasLiveCoffee || (!a.freshCoffeeMode && !!topVaultBag) || a.attempt > 0;
    var headRow = dom('div', { class: 'bt-screen-head' },
      dom('div', null,
        dom('div', { class: 'bt-screen-kicker', text: 'Morning Command Center' }),
        dom('h1', { class: 'bt-screen-title', text: 'Brew it. Cup it. Perfect it.' }),
        dom('p', {
          class: 'bt-screen-sub',
          text: lens === 'starter'
            ? 'Pick an open bag or start a 1-tap guided home brew \u2014 zero coffee jargon required.'
            : lens === 'scientist'
            ? 'First-principles Darcy percolation, Smrke CO2 degassing, and closed-loop sensory calibration.'
            : 'Science-driven recipes, audible kitchen chronograph, and 1-lever dial-in.'
        })
      ),
      hasAnyDraft ? dom('button', {
        type: 'button',
        id: 'bt-door-new-fresh-coffee-btn',
        class: 'bt-chip-v6 bt-chip-soft',
        style: 'min-height:38px;padding:4px 11px;font-size:0.76rem',
        title: 'Start a brand-new coffee without touching your saved vault or tasting history',
        onclick: function () {
          haptic('snap');
          startFreshCoffeeFlow(a, true);
          showToast('Started a fresh coffee \u2014 Vault & Tasting History untouched.');
        }
      }, ico('fresh-bag', 14), dom('span', { text: '+ New Fresh Coffee' })) : null
    );
    stageEl.appendChild(headRow);

    /* 2. Warm Beanjamin Coach Greeting (Dual-Draft Isolation + Stale-Reset Notice) */
    var coachTitle = a.staleResetNotice
      ? 'Morning Auto-Reset Ready'
      : a.freshCoffeeMode
      ? 'Fresh Coffee Studio Ready'
      : shopInfo
      ? 'Dual-Draft Isolation Active'
      : 'Beanjamin Studio Coach';
    var coachBody = a.staleResetNotice
      ? 'Parked yesterday\'s unfinished step after 3 hours idle so you start fresh \u2014 your bag and gear are ready.'
      : a.freshCoffeeMode
      ? 'Cleared previous brew session so you can enter or scan a brand-new coffee from scratch.'
      : shopInfo
      ? ('Your home brew draft and your cafe visit at ' + shopInfo.shopName + ' (Step ' + shopInfo.step + '/4) stay 100% isolated.')
      : 'Pick up your open counter bag in one tap, start a brand-new coffee, or log a cafe drink independently.';

    var bjAvatar = dom('div', { class: 'bt-bj-avatar' });
    if (typeof Beanjamin !== 'undefined' && Beanjamin && typeof Beanjamin.svg === 'function') {
      bjAvatar.innerHTML = Beanjamin.svg('welcome', { view: 'avatar', size: 46 });
    } else {
      bjAvatar.appendChild(ico('brew', 22));
    }
    stageEl.appendChild(dom('div', { class: 'bt-bj-coach-banner' },
      bjAvatar,
      dom('div', { class: 'bt-bj-copy' },
        dom('b', { text: coachTitle }),
        dom('span', { text: coachBody })
      )
    ));

    /* 3. Hero Active Home Bag Card */
    if (heroCoffee) {
      var degas = computeDegassingBadge(heroCoffee);
      var bagName = heroCoffee.name || 'Specialty Coffee';
      var bagRoaster = heroCoffee.roaster || 'Home Counter Bag';
      var lockedTag = (a.recipeLocked || heroCoffee.lockedBrew) ? dom('span', { class: 'bt-badge-v62 is-gold', text: 'Gold-Seal Locked' }) : null;
      var tryNum = Math.max(1, (a.attempt || (heroCoffee.n_cups || 0)) + 1);
      var primaryBtnText = isMidBrew
        ? (a.cupBrew ? 'Continue to Taste \u2192' : 'Continue Active Timer \u2192')
        : (hasLiveCoffee ? 'Brew This Coffee \u2192' : 'Load & Brew Bag \u2192');

      stageEl.appendChild(dom('section', {
        class: 'bt-hero-bag-card',
        style: '--bag-roast-color:' + roastColorFor(heroCoffee.roast)
      },
        dom('div', { class: 'bt-card-hd' },
          dom('div', { class: 'bt-pill-wrap' },
            dom('span', { class: 'bt-badge-v62 is-good', text: hasLiveCoffee ? ('Active Home Bag · Try #' + tryNum) : 'Recent Open Bag' }),
            dom('span', { class: 'bt-badge-v62 ' + degas.cls, text: degas.text }),
            lockedTag
          ),
          dom('span', { class: 'bt-num', style: 'font-size:0.76rem;color:var(--ink-muted);font-weight:700', text: rec.method.short + ' · 1:' + rec.ratio })
        ),
        dom('div', null,
          dom('div', { style: 'font-size:0.74rem;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;color:var(--ink-muted)', text: bagRoaster }),
          dom('h2', { class: 'bt-card-title', style: 'font-size:1.25rem;margin-top:2px', text: bagName }),
          dom('p', {
            class: 'bt-screen-sub',
            text: rec.method.label + ' · ' + rec.grindMap.short + ' on ' + (rec.grinder.short || rec.grinder.name) + ' · ' + rec.doseG + ' g : ' + rec.waterG + ' g'
          })
        ),
        dom('div', { class: 'bt-pill-wrap' },
          dom('button', {
            type: 'button',
            class: 'bt-cta-btn',
            style: 'min-height:46px;padding:8px 16px;font-size:0.88rem',
            onclick: function () {
              if (!hasLiveCoffee && topVaultBag && typeof window !== 'undefined' && window.BTStorage && typeof window.BTStorage.selectSavedCoffee === 'function') {
                try { window.BTStorage.selectSavedCoffee(topVaultBag); } catch (_) {}
              }
              a.freshCoffeeMode = false;
              haptic('snap');
              if (isMidBrew && a.cupBrew) goBrewStep('taste');
              else if (isMidBrew && (_timerSession.running || _timerSession.stopped || _timerSession.elapsedS > 0)) goBrewStep('timer');
              else goBrewStep('brew');
            }
          }, dom('span', { text: primaryBtnText }), ico('chevron-right', 17)),
          dom('button', {
            type: 'button',
            class: 'bt-secondary-cta',
            style: 'min-height:46px',
            onclick: function () {
              haptic('snap');
              startFreshCoffeeFlow(a, true);
            }
          }, ico('fresh-bag', 16), dom('span', { text: '+ Start Fresh Coffee' })),
          dom('button', {
            type: 'button',
            class: 'bt-secondary-cta',
            style: 'min-height:46px',
            onclick: function () {
              haptic('tick');
              goBrewStep('coffee');
            }
          }, ico('cellar', 16), dom('span', { text: 'Switch Open Bag' }))
        )
      ));
    } else {
      stageEl.appendChild(dom('section', { class: 'bt-hero-bag-card' },
        dom('div', { class: 'bt-card-hd' },
          dom('span', { class: 'bt-badge-v62 is-good', text: a.freshCoffeeMode ? 'Fresh Coffee Ready' : 'Ready on Counter' }),
          dom('span', { class: 'bt-badge-v62 is-sci', text: '23 Brewers · 52 Grinders' })
        ),
        dom('div', null,
          dom('h2', { class: 'bt-card-title', style: 'font-size:1.18rem', text: a.freshCoffeeMode ? 'Start a Brand-New Coffee' : 'Add Your First Bag or Pick a Style' }),
          dom('p', { class: 'bt-screen-sub', text: 'Use Magic AI Bag Lookup on any roaster worldwide, enter bag details, or pick a 1-tap specialty style.' })
        ),
        dom('div', { class: 'bt-pill-wrap' },
          dom('button', {
            type: 'button',
            class: 'bt-cta-btn',
            style: 'min-height:46px;padding:8px 16px;font-size:0.88rem',
            onclick: function () { haptic('snap'); goBrewStep('coffee'); }
          }, dom('span', { text: 'Enter / Scan New Bag \u2192' }), ico('scan-lens', 17)),
          dom('button', {
            type: 'button',
            class: 'bt-secondary-cta',
            style: 'min-height:46px',
            onclick: function () { haptic('tick'); goBrewStep('method'); }
          }, brewerIco(a.brew.method, 17), dom('span', { text: 'Pick Brewer' }))
        )
      ));
    }

    /* 4. 2-Up Action Cards: At a Coffee Shop + Import Shared Brew */
    stageEl.appendChild(dom('div', { class: 'bt-door-grid-2up' },
      dom('button', {
        type: 'button',
        class: 'bt-door-action-card',
        id: 'bt-door-cafe-btn',
        onclick: function () {
          haptic('snap');
          var sh = getShell();
          if (sh && typeof sh.go === 'function') sh.go('shop');
        }
      },
        dom('div', { class: 'bt-card-hd', style: 'width:100%' },
          ico('cafe-cup', 20),
          dom('span', {
            class: 'bt-badge-v62 ' + (shopInfo ? 'is-gold' : 'is-muted'),
            text: shopInfo ? ('Resume Step ' + shopInfo.step + '/4') : '4-Step Logger'
          })
        ),
        dom('div', null,
          dom('b', { style: 'font-size:0.95rem;display:block;color:var(--ink)', text: 'At a Coffee Shop' }),
          dom('span', {
            style: 'font-size:0.76rem;color:var(--ink-secondary);line-height:1.35;display:block;margin-top:3px',
            text: shopInfo
              ? ('Continue ' + shopInfo.drinkName + ' at ' + shopInfo.shopName + ' (home draft untouched)')
              : 'Log a cafe drink & reverse-engineer it for your home gear \u2192'
          })
        )
      ),
      dom('button', {
        type: 'button',
        class: 'bt-door-action-card',
        id: 'bt-door-import-btn',
        onclick: function () {
          haptic('snap');
          openSheet('import-shared-brew', {}, { title: 'Import Shared Brew & Translate Grinder', detent: 'half' });
        }
      },
        dom('div', { class: 'bt-card-hd', style: 'width:100%' },
          ico('paste-card', 20),
          dom('span', { class: 'bt-badge-v62 is-sci', text: lens === 'scientist' ? 'Darcy-D32 Auto' : 'Auto-Matched to Your Grinder' })
        ),
        dom('div', null,
          dom('b', { style: 'font-size:0.95rem;display:block;color:var(--ink)', text: 'Import Shared Brew' }),
          dom('span', {
            style: 'font-size:0.76rem;color:var(--ink-secondary);line-height:1.35;display:block;margin-top:3px',
            text: 'Paste a friend\'s BT6: code or link & auto-translate clicks to your grinder \u2192'
          })
        )
      )
    ));

    /* 5. Compact Quick-Access Utility Strip (Machines, Gear & Cellar) */
    stageEl.appendChild(dom('div', { class: 'bt-card-v6', style: 'padding:12px 14px;gap:8px' },
      dom('div', { class: 'bt-card-hd' },
        dom('span', { class: 'bt-kicker', text: 'Quick Counter Shortcuts' }),
        vaultCoffees.length ? dom('button', {
          type: 'button',
          style: 'font-size:0.76rem;font-weight:700;color:var(--accent)',
          text: 'Open Cellar (' + vaultCoffees.length + ') \u2192',
          onclick: function () { var sh = getShell(); if (sh && sh.go) sh.go('cellar'); }
        }) : null
      ),
      dom('div', { class: 'bt-pill-row' },
        dom('button', {
          type: 'button',
          class: 'bt-chip-v6 bt-chip-soft',
          onclick: function () { a.brew.method = 'philips5500'; haptic('tick'); goBrewStep('brew'); }
        }, brewerIco('philips5500', 16), dom('span', { text: 'Philips 5500' })),
        dom('button', {
          type: 'button',
          class: 'bt-chip-v6 bt-chip-soft',
          onclick: function () { a.brew.method = 'aiden'; synthesizeScienceIntoApp(a, 'aiden'); haptic('tick'); goBrewStep('brew'); }
        }, brewerIco('aiden', 16), dom('span', { text: 'Fellow Aiden' })),
        dom('button', {
          type: 'button',
          class: 'bt-chip-v6 bt-chip-soft',
          onclick: function () { a.brew.method = 'xbloom'; synthesizeScienceIntoApp(a, 'xbloom'); haptic('tick'); goBrewStep('brew'); }
        }, brewerIco('xbloom', 16), dom('span', { text: 'xBloom Studio' })),
        dom('button', {
          type: 'button',
          class: 'bt-chip-v6 bt-chip-soft',
          onclick: function () { openSheet('workflow-tools', {}, { title: 'My Workflow & Tools', detent: 'half' }); }
        }, ico('grinder-burr', 16), dom('span', { text: 'My Workflow & Tools' }))
      )
    ));

    /* 6. Primary Sticky Thumb-Zone CTA */
    stageEl.appendChild(buildStickyCtaBar({
      id: 'bt-door-start-guided-cta',
      label: 'Start 5-Step Guided Home Brew \u2192',
      sub: '1. Coffee · 2. Brewer · 3. Recipe · 4. Timer · 5. Taste',
      onClick: function () {
        haptic('snap');
        goBrewStep('coffee');
      }
    }));
  }

  /* ==================== 6. STEP 2: BREWER, FILTER & GRINDER STUDIO ('method') ==================== */
  function getOwnedBrewersList(a) {
    var owned = (a.prefs && Array.isArray(a.prefs.ownedBrewers) && a.prefs.ownedBrewers.length)
      ? a.prefs.ownedBrewers
      : (a.prefs && a.prefs.gear && Array.isArray(a.prefs.gear.ownedBrewers) && a.prefs.gear.ownedBrewers.length)
      ? a.prefs.gear.ownedBrewers
      : ['v60', 'origami', 'aeropress', 'switch', 'press', 'espresso', 'philips5500', 'aiden'];
    return owned;
  }

  function renderStep2Method(stageEl, a) {
    ensureBrewState(a);
    var lens = getExperienceLens();
    var allMethods = getAllMethods23();
    var filterMode = toolMode('brewersFilter'); /* 'all' | 'owned' */
    var ownedList = getOwnedBrewersList(a);
    var curMethodObj = getMethodObj(a.brew.method);
    var topMatchSet = getTopBeanMatchSet(a.coffee);
    var curGrinder = getActiveGrinderObj(a);
    var cName = (a.coffee && a.coffee.name) ? (a.coffee.roaster ? a.coffee.roaster + ' ' + a.coffee.name : a.coffee.name) : 'your active coffee';

    /* 1. Header */
    stageEl.appendChild(dom('div', { class: 'bt-screen-head' },
      dom('div', null,
        dom('div', { class: 'bt-screen-kicker', text: 'Step 2 of 5 · Brewer, Filter & Grinder' }),
        dom('h1', { class: 'bt-screen-title', text: 'Choose your brewer' }),
        dom('p', {
          class: 'bt-screen-sub',
          text: 'Selecting a brewer synthesizes a fresh science recipe tailored to ' + cName + '.'
        })
      )
    ));

    /* 2. All 23 Brewers | My Owned Brewers Segmented Toggle */
    var filterSeg = dom('div', { style: 'display:flex;align-items:center;gap:8px' },
      dom('div', { class: 'bt-seg-bar', role: 'group', 'aria-label': 'Brewers Filter' },
        dom('button', {
          type: 'button',
          'aria-pressed': String(filterMode !== 'owned'),
          text: 'All ' + allMethods.length + ' Brewers',
          onclick: function () { setToolMode('brewersFilter', 'all'); haptic('tick'); rerender(); }
        }),
        dom('button', {
          type: 'button',
          'aria-pressed': String(filterMode === 'owned'),
          text: 'My Owned Brewers (' + ownedList.length + ')',
          onclick: function () { setToolMode('brewersFilter', 'owned'); haptic('tick'); rerender(); }
        })
      ),
      filterMode === 'owned' ? dom('button', {
        type: 'button',
        class: 'bt-chip-v6 bt-chip-soft',
        style: 'min-height:42px;padding:0 11px;font-size:0.76rem',
        text: 'Edit Owned',
        onclick: function () { openSheet('edit-owned-brewers', {}, { title: 'My Kitchen Counter Brewers', detent: 'half' }); }
      }) : null
    );
    stageEl.appendChild(filterSeg);

    /* 3. Inline Sub-Mode / Technique Pill Row for Selected Brewer (Single Horizontal Scroll Row!) */
    var subModes = getSubModesFor(curMethodObj.key);
    if (subModes.length > 0) {
      var curStyle = a.brew.style || subModes[0].id;
      stageEl.appendChild(dom('div', { class: 'bt-card-v6', style: 'padding:12px 14px;gap:8px' },
        dom('div', { class: 'bt-card-hd' },
          dom('span', { class: 'bt-kicker', text: curMethodObj.label + ' Technique / Protocol' }),
          dom('span', { style: 'font-size:0.72rem;color:var(--ink-muted)', text: 'Swipe row \u2192' })
        ),
        dom('div', { class: 'bt-submode-strip', role: 'radiogroup', 'aria-label': 'Brewing technique sub-mode' },
          subModes.map(function (sm) {
            var active = curStyle === sm.id;
            return dom('button', {
              type: 'button',
              class: 'bt-chip-v6' + (active ? ' is-active' : ''),
              'aria-pressed': String(active),
              text: sm.label,
              onclick: function () {
                a.brew.style = sm.id;
                if (sm.filterId) a.brew.filterId = sm.filterId;
                synthesizeScienceIntoApp(a, curMethodObj.key, { force: !isRecipeLockedFor(a, curMethodObj.key), keepFilter: !!sm.filterId });
                haptic('snap');
                saveDraft();
                rerender();
              }
            });
          })
        )
      ));
    }

    /* 4. 4 Clear Physics Families Grid */
    var VIRTUAL_FAMILY_TILES = {
      cupping: {
        key: 'cupping', canonicalKey: 'press', defaultStyle: 'press-cup',
        label: 'SCA Cupping Bowl', short: 'Cupping Bowl', d50AnchorUm: 660, ratio: 18.2,
        blurb: '1:18.18 crust-break sensory evaluation bowl'
      },
      french_cold: {
        key: 'french_cold', canonicalKey: 'cold', defaultStyle: 'cold-room-20c',
        label: 'French Press Cold', short: 'French Cold', d50AnchorUm: 950, ratio: 11.0,
        blurb: 'Overnight plunger carafe cold immersion'
      }
    };
    var placed = {};
    FAMILY_DEFS_4.forEach(function (fam) {
      var items = [];
      fam.keys.forEach(function (k) {
        var found = allMethods.find(function (m) { return m.key === k; }) || VIRTUAL_FAMILY_TILES[k];
        if (found && !placed[found.key]) {
          placed[found.key] = 1;
          items.push(found);
        }
      });
      /* Catch any remaining custom methods matching family */
      if (fam.id === 'pourover') {
        allMethods.forEach(function (m) {
          if (!placed[m.key] && m.type === 'flow' && m.key !== 'phin' && m.key !== 'cold_drip') {
            placed[m.key] = 1; items.push(m);
          }
        });
      }

      var visible = filterMode === 'owned'
        ? items.filter(function (m) {
            var ck = m.canonicalKey || m.key;
            return ownedList.indexOf(m.key) >= 0 || ownedList.indexOf(ck) >= 0 || ck === curMethodObj.key;
          })
        : items;
      if (!visible.length) return;

      stageEl.appendChild(dom('section', { class: 'bt-card-v6' },
        dom('div', null,
          dom('div', { class: 'bt-kicker', text: fam.title }),
          lens !== 'scientist' ? dom('p', { class: 'bt-subcopy', style: 'font-size:0.78rem;margin-top:2px', text: fam.sub }) : null
        ),
        dom('div', { class: 'bt-brewer-grid-v62', role: 'radiogroup', 'aria-label': fam.title },
          visible.map(function (m) {
            var canonKey = m.canonicalKey || m.key;
            var isSelected = a.brew.methodVariant
              ? a.brew.methodVariant === m.key
              : (!m.canonicalKey && m.key === curMethodObj.key);
            var matchRank = topMatchSet[m.key] || 0;
            var subText = lens === 'scientist'
              ? ('D50 ~' + (m.d50AnchorUm || 550) + ' µm · 1:' + (m.ratio || 16))
              : (m.blurb ? m.blurb.replace(/\s*\([^)]*\)?/g, '').split(/[.;]/)[0].trim() : ('1:' + (m.ratio || 16) + ' target'));

            return dom('button', {
              type: 'button',
              class: 'bt-brewer-tile-v62' + (isSelected ? ' is-active' : ''),
              'data-brewer-key': m.key,
              'aria-pressed': String(isSelected),
              onclick: function () {
                a.brew.method = canonKey;
                a.brew.methodVariant = m.canonicalKey ? m.key : '';
                a.brew.style = m.defaultStyle || '';
                var compatF = getCompatibleFilters(canonKey);
                if (compatF.length) {
                  a.brew.filter = compatF[0].name;
                  a.brew.filterId = compatF[0].id;
                }
                /* Fix 05:1786 — synthesize fresh science recipe unless locked */
                synthesizeScienceIntoApp(a, canonKey, { force: !isRecipeLockedFor(a, canonKey) });
                haptic('snap');
                saveDraft();
                rerender();
              }
            },
              brewerIco(canonKey, 22),
              dom('div', { style: 'min-width:0;flex:1' },
                dom('span', { class: 'bt-brewer-tile-title', text: m.short || m.label }),
                dom('span', { class: 'bt-brewer-tile-sub', text: subText }),
                matchRank ? dom('span', { class: 'bt-top-match-badge', text: 'Top Bean Match' }) : null
              )
            );
          })
        )
      ));
    });

    /* 5. Clean Inline Filter (68 retail filters), Grinder (52+ grinders + Pre-Ground) & Water Profile */
    var compatFilters = getCompatibleFilters(curMethodObj.key);
    var curFilterName = a.brew.filter || (compatFilters[0] && compatFilters[0].name) || 'Standard Filter';
    var allGrinders = getAllGrindersList();

    var filterSelect = dom('select', {
      class: 'bt-select-v62',
      'aria-label': 'Paper or Metal Filter Medium',
      onchange: function (ev) {
        var pickedName = ev.target.value;
        var hit = compatFilters.find(function (f) { return f.name === pickedName; });
        a.brew.filter = pickedName;
        if (hit && hit.id) a.brew.filterId = hit.id;
        synthesizeScienceIntoApp(a, curMethodObj.key, { keepFilter: true });
        haptic('tick');
        saveDraft();
        rerender();
      }
    }, compatFilters.map(function (f) {
      return dom('option', {
        value: f.name,
        selected: f.name === curFilterName,
        text: f.name + (f.flowClass ? ' (' + f.flowClass + ')' : '')
      });
    }));

    var grinderSelect = dom('select', {
      class: 'bt-select-v62',
      'aria-label': 'Active Coffee Grinder or Pre-Ground Mode',
      onchange: function (ev) {
        var gk = normalizeGrinderKey(ev.target.value);
        a.brew.grinderKey = gk;
        a.prefs.gear = a.prefs.gear || {};
        a.prefs.gear.grinderKey = gk;
        synthesizeScienceIntoApp(a, curMethodObj.key, { keepFilter: true });
        haptic('tick');
        saveDraft();
        rerender();
      }
    }, allGrinders.map(function (g) {
      return dom('option', {
        value: g.key,
        selected: g.key === curGrinder.key,
        text: (g.short || g.name) + (g.group ? ' · ' + g.group : '')
      });
    }));

    var recNow = runCurrentSynthesis(a);

    stageEl.appendChild(dom('section', { class: 'bt-card-v6' },
      dom('div', { class: 'bt-card-hd' },
        dom('span', { class: 'bt-kicker', text: 'Filter, Grinder & Brew Water' }),
        dom('button', {
          type: 'button',
          class: 'bt-chip-v6 bt-chip-soft',
          style: 'min-height:36px;padding:4px 10px;font-size:0.76rem',
          onclick: function () { openSheet('workflow-tools', {}, { title: 'My Workflow & Tools', detent: 'half' }); }
        }, ico('grinder-burr', 14), dom('span', { text: 'My Workflow & Tools' }))
      ),
      dom('div', { class: 'bt-gear-inline-grid' },
        dom('div', { style: 'display:flex;flex-direction:column;gap:5px' },
          dom('label', { style: 'font-size:0.74rem;font-weight:700;color:var(--ink-secondary)', text: 'Filter Medium (' + compatFilters.length + ' compatible)' }),
          filterSelect
        ),
        dom('div', { style: 'display:flex;flex-direction:column;gap:5px' },
          dom('label', { style: 'font-size:0.74rem;font-weight:700;color:var(--ink-secondary)', text: 'Grinder (' + allGrinders.length + ' models + Pre-Ground Rescue)' }),
          grinderSelect
        )
      ),
      recNow.pregroundInfo ? dom('div', {
        style: 'padding:9px 11px;border-radius:12px;background:var(--accent-soft);color:var(--ink);font-size:0.78rem;line-height:1.38'
      },
        dom('b', { style: 'color:var(--accent)', text: 'Pre-Ground Rescue Active: ' }),
        dom('span', { text: recNow.pregroundInfo.note })
      ) : null,
      buildEverydayWaterPicker(a)
    ));

    /* 6. Sticky Thumb-Zone CTA */
    stageEl.appendChild(buildStickyCtaBar({
      id: 'bt-method-build-recipe-cta',
      label: 'Build Science Recipe \u2192',
      sub: curMethodObj.label + ' · ' + (curGrinder.short || curGrinder.name) + ' · ' + recNow.doseG + ' g : ' + recNow.waterG + ' g',
      onClick: function () {
        haptic('snap');
        goBrewStep('brew');
      }
    }));
  }

  /* ==================== 7. SMART MACHINE CONSOLES (PHILIPS 5500, AIDEN, XBLOOM) ==================== */
  function openScienceWhySheet(whyKey) {
    var fk = String(whyKey || 'all').toLowerCase();
    var titles = {
      all:   'Why These Numbers? · Full Brew Science',
      temp:  'Why This Water Temp? · Thermal Physics',
      grind: 'Why This Grind Setting? · Burr & Bed Flow',
      ratio: 'Why This Brew Ratio? · Strength & Yield',
      dose:  'Why This Coffee Dose? · Bed Depth & Batch',
      time:  'Why This Target Time? · Degassing & Pours',
      water: 'Why This Brew Water? · Mineral Chemistry'
    };
    haptic('tick');
    openSheet('recipe-science-why', { focus: fk }, { title: titles[fk] || titles.all, detent: 'full' });
  }

  function makeWhyPill(whyKey, labelTxt, opts) {
    opts = opts || {};
    var fk = String(whyKey || 'all').toLowerCase();
    return dom('button', {
      type: 'button',
      class: 'bt-spec-why-pill' + (opts.dark ? ' is-dark-surface' : ''),
      'data-science-why': fk,
      'aria-label': 'Show brew science for ' + fk,
      onclick: function (ev) {
        if (ev && typeof ev.stopPropagation === 'function') ev.stopPropagation();
        if (ev && typeof ev.preventDefault === 'function') ev.preventDefault();
        openScienceWhySheet(fk);
      }
    }, dom('span', { text: labelTxt || '? Why' }));
  }

  var PHILIPS_FRONT_7_SET = {
    espresso: 1,
    coffee: 1,
    americano: 1,
    cappuccino: 1,
    latte: 1,
    icedcoffee: 1,
    icedlatte: 1
  };

  var PHILIPS_22_ROSTER = [
    { v: 'espresso',       label: 'Espresso',          panel: 'front', coffee: [25, 40, 70],   milk: null,            water: null,            order: 'coffee', extraOk: true,  twoXOk: true,  iced: false },
    { v: 'coffee',         label: 'Coffee',            panel: 'front', coffee: [80, 120, 200], milk: null,            water: null,            order: 'coffee', extraOk: true,  twoXOk: true,  iced: false },
    { v: 'americano',      label: 'Americano',         panel: 'front', coffee: [30, 40, 50],   milk: null,            water: [70, 110, 190],  order: 'coffee', extraOk: true,  twoXOk: false, iced: false },
    { v: 'cappuccino',     label: 'Cappuccino',        panel: 'front', coffee: [30, 40, 60],   milk: [80, 120, 160],  water: null,            order: 'milk',   extraOk: true,  twoXOk: false, iced: false },
    { v: 'latte',          label: 'Latte Macchiato',   panel: 'front', coffee: [30, 40, 60],   milk: [140, 200, 260], water: null,            order: 'milk',   extraOk: true,  twoXOk: false, iced: false },
    { v: 'icedcoffee',     label: 'Iced Coffee',       panel: 'front', coffee: [80, 120, 160], milk: null,            water: null,            order: 'coffee', extraOk: true,  twoXOk: false, iced: true, iceG: 120 },
    { v: 'icedlatte',      label: 'Iced Latte',        panel: 'front', coffee: [30, 40, 55],   milk: [100, 140, 180], water: null,            order: 'milk',   extraOk: true,  twoXOk: false, iced: true, iceG: 150 },
    { v: 'ristretto',      label: 'Ristretto',         panel: 'more',  coffee: [15, 25, 35],   milk: null,            water: null,            order: 'coffee', extraOk: false, twoXOk: true,  iced: false },
    { v: 'lungo',          label: 'Espresso Lungo',    panel: 'more',  coffee: [55, 80, 110],  milk: null,            water: null,            order: 'coffee', extraOk: true,  twoXOk: true,  iced: false },
    { v: 'crema',          label: 'Caffe Crema',       panel: 'more',  coffee: [90, 130, 190], milk: null,            water: null,            order: 'coffee', extraOk: true,  twoXOk: true,  iced: false },
    { v: 'travelmug',      label: 'Travel Mug',        panel: 'more',  coffee: [240, 240, 360],milk: null,            water: null,            order: 'coffee', extraOk: true,  twoXOk: false, iced: false },
    { v: 'caffelatte',     label: 'Caffe Latte',       panel: 'more',  coffee: [30, 45, 65],   milk: [130, 180, 240], water: null,            order: 'coffee', extraOk: true,  twoXOk: false, iced: false },
    { v: 'flatwhite',      label: 'Flat White',        panel: 'more',  coffee: [40, 55, 70],   milk: [75, 100, 135],  water: null,            order: 'milk',   extraOk: true,  twoXOk: false, iced: false },
    { v: 'aulait',         label: 'Cafe au Lait',      panel: 'more',  coffee: [80, 110, 140], milk: [80, 110, 150],  water: null,            order: 'coffee', extraOk: true,  twoXOk: false, iced: false },
    { v: 'icedespresso',   label: 'Iced Espresso',     panel: 'more',  coffee: [25, 40, 55],   milk: null,            water: null,            order: 'coffee', extraOk: true,  twoXOk: false, iced: true, iceG: 80 },
    { v: 'icedamericano',  label: 'Iced Americano',    panel: 'more',  coffee: [30, 40, 50],   milk: null,            water: [70, 100, 140],  order: 'coffee', extraOk: true,  twoXOk: false, iced: true, iceG: 130 },
    { v: 'icedcrema',      label: 'Iced Caffe Crema',  panel: 'more',  coffee: [80, 110, 150], milk: null,            water: null,            order: 'coffee', extraOk: true,  twoXOk: false, iced: true, iceG: 120 },
    { v: 'icedcappuccino', label: 'Iced Cappuccino',   panel: 'more',  coffee: [30, 40, 55],   milk: [70, 95, 130],   water: null,            order: 'milk',   extraOk: true,  twoXOk: false, iced: true, iceG: 140 },
    { v: 'icedcaffelatte', label: 'Iced Caffe Latte',  panel: 'more',  coffee: [30, 40, 55],   milk: [110, 150, 190], water: null,            order: 'coffee', extraOk: true,  twoXOk: false, iced: true, iceG: 150 },
    { v: 'icedaulait',     label: 'Iced Cafe au Lait', panel: 'more',  coffee: [75, 100, 130], milk: [75, 100, 130],  water: null,            order: 'coffee', extraOk: true,  twoXOk: false, iced: true, iceG: 150 },
    { v: 'hotwater',       label: 'Hot Water',         panel: 'more',  coffee: null,           milk: null,            water: [100, 180, 280], order: 'water',  extraOk: false, twoXOk: false, iced: false },
    { v: 'froth',          label: 'Milk Foam',         panel: 'more',  coffee: null,           milk: [80, 120, 180],  water: null,            order: 'milk',   extraOk: false, twoXOk: false, iced: false }
  ];

  var SAS_DOSE = { 1: 7.0, 2: 8.2, 3: 9.3, 4: 10.4, 5: 11.2 };
  var PHILIPS_TEMP_STEPS_3 = [
    { step: 1, label: 'Low 88 °C',  tempC: 88, tempF: 190 },
    { step: 2, label: 'Med 91 °C',  tempC: 91, tempF: 196 },
    { step: 3, label: 'High 93 °C', tempC: 93, tempF: 199 }
  ];

  function getPhilipsRoster() {
    var inn = (typeof window !== 'undefined' && window.BTInnovate) ? window.BTInnovate : null;
    if (inn && Array.isArray(inn.PHILIPS_DRINKS) && inn.PHILIPS_DRINKS.length >= 22) {
      return inn.PHILIPS_DRINKS.map(function (d) {
        var vk = d.v || d.key;
        var fb = PHILIPS_22_ROSTER.find(function (x) { return x.v === vk; }) || {};
        return Object.assign({}, fb, d, {
          v: vk,
          label: d.label || d.name || fb.label,
          panel: PHILIPS_FRONT_7_SET[vk] ? 'front' : 'more',
          extraOk: d.supportsExtra != null ? !!d.supportsExtra : !!fb.extraOk,
          twoXOk: d.twoXOk != null ? !!d.twoXOk : !!fb.twoXOk,
          iced: d.iced != null ? !!d.iced : !!fb.iced
        });
      });
    }
    return PHILIPS_22_ROSTER.slice();
  }

  function interpBarMl(arr, bar) {
    if (!Array.isArray(arr) || !arr.length) return 0;
    if (arr.length >= 5) return Math.round(+arr[Math.max(0, Math.min(4, bar - 1))] || 0);
    var lo = +arr[0] || 30, mid = +arr[1] || lo, hi = +arr[2] || mid;
    var b = Math.max(1, Math.min(5, Math.round(+bar || 3)));
    return b <= 3 ? Math.round(lo + ((b - 1) / 2) * (mid - lo)) : Math.round(mid + ((b - 3) / 2) * (hi - mid));
  }

  /* Mutates a.brew.machine IN-PLACE so captured ph references never detach across computePhilipsSnap / repaint */
  function ensurePhilipsObj(a) {
    a.brew = a.brew || {};
    a.prefs = a.prefs || {};
    a.prefs.philipsProfiles = a.prefs.philipsProfiles || {};
    if (!a.brew.machine || typeof a.brew.machine !== 'object') {
      a.brew.machine = {};
    }
    var ph = a.brew.machine;
    var rawDrink = ph.drink || ph.drinkKey || 'cappuccino';
    ph.profile = ph.profile || 'blue';
    ph.panelTab = (ph.panelTab === 'front' || ph.panelTab === 'more' || ph.panelTab === 'all') ? ph.panelTab : 'front';
    ph.drink = rawDrink;
    ph.drinkKey = rawDrink;
    ph.strength = ph.strength != null ? Math.max(1, Math.min(5, Math.round(+ph.strength))) : 4;
    ph.scoopMode = !!ph.scoopMode;
    ph.extra = !!ph.extra;
    ph.twoX = !!ph.twoX;
    ph.coffeeBar = ph.coffeeBar != null ? Math.max(1, Math.min(5, Math.round(+ph.coffeeBar))) : 3;
    ph.waterBar = ph.waterBar != null ? Math.max(1, Math.min(5, Math.round(+ph.waterBar))) : 3;
    ph.milkBar = ph.milkBar != null ? Math.max(1, Math.min(5, Math.round(+ph.milkBar))) : 3;
    ph.travelSizeMl = ph.travelSizeMl === 360 ? 360 : 240;
    ph.milkType = ph.milkType || 'whole';
    ph.globalTemp = (ph.globalTemp === 1 || ph.globalTemp === 2 || ph.globalTemp === 3) ? +ph.globalTemp : 2;
    ph.hopperStep = ph.hopperStep != null ? Math.max(1, Math.min(12, Math.round(+ph.hopperStep))) : 4;
    ph.sasRemaining = ph.sasRemaining != null ? +ph.sasRemaining : 0;
    ph.aquaCleanCupsUsed = ph.aquaCleanCupsUsed != null ? +ph.aquaCleanCupsUsed : 140;

    var roster = getPhilipsRoster();
    var d = roster.find(function (x) { return x.v === ph.drink; }) || roster[0];
    ph.drink = d.v;
    ph.drinkKey = d.v;
    if (!d.coffee) { ph.scoopMode = false; ph.extra = false; ph.twoX = false; }
    if (ph.scoopMode) { ph.extra = false; ph.twoX = false; }
    if (!d.twoXOk) ph.twoX = false;
    var extraAllowed = !!(d.extraOk && !ph.scoopMode && !ph.twoX);
    if (!extraAllowed) ph.extra = false;
    if (ph.extra) { ph.strength = 5; ph.twoX = false; }
    return { ph: ph, drink: d, extraAllowed: extraAllowed, twoXAllowed: !!(d.twoXOk && !ph.scoopMode && !ph.extra) };
  }

  function computePhilipsSnap(a) {
    var ctx = ensurePhilipsObj(a);
    var ph = ctx.ph, d = ctx.drink;
    var calMemo = (a.prefs.philipsProfiles[ph.profile] && a.prefs.philipsProfiles[ph.profile][d.v]) || {};
    var singleDose = !d.coffee ? 0 : ph.scoopMode ? 8.0 : (SAS_DOSE[ph.strength] || 9.3) + (ph.extra ? 7.4 : 0);
    var mult = ph.twoX ? 2 : 1;
    var doseG = Math.round(singleDose * mult * 10) / 10;
    var cMl = d.v === 'travelmug' ? ph.travelSizeMl : (calMemo.coffeeMl || (d.coffee ? interpBarMl(d.coffeeBarsMl || d.coffee, ph.coffeeBar) : 0)) + (ph.extra ? 25 : 0);
    var wMl = calMemo.waterMl || (d.water ? interpBarMl(d.waterBarsMl || d.water, ph.waterBar) : 0);
    var mMl = calMemo.milkMl || (d.milk ? interpBarMl(d.milkBarsMl || d.milk, ph.milkBar) : 0);
    var totalMl = (cMl + wMl + mMl) * mult;
    var tempC = d.iced ? 76 : (ph.globalTemp === 1 ? 88 : ph.globalTemp === 2 ? 91 : 93);
    var grindUm = 230 + (ph.hopperStep - 1) * 20;

    a.brew.dose = doseG > 0 ? doseG : 9.3;
    a.brew.water = totalMl || 120;
    a.brew.ratio = doseG > 0 ? Math.round(((cMl + wMl) * mult / doseG) * 10) / 10 : 3.8;
    a.brew.tempC = tempC;
    a.brew.tempF = Math.round(tempC * 9 / 5 + 32);
    a.brew.grindUm = grindUm;
    a.brew.grind_setting = 'Ceramic ' + ph.hopperStep + '/12';

    return {
      drink: d,
      doseG: doseG,
      coffeeMl: cMl * mult,
      waterMl: wMl * mult,
      milkMl: mMl * mult,
      totalMl: totalMl,
      tempC: tempC,
      tempF: Math.round(tempC * 9 / 5 + 32),
      grindUm: grindUm,
      timeS: d.iced ? 42 : 30
    };
  }

  function buildPhilips5500ConsoleCard(a, onChangeUpdate) {
    var wrap = dom('section', { class: 'bt-ph5500-console', id: 'bt-philips5500-mirror' });

    function repaint() {
      wrap.textContent = '';
      var ctx = ensurePhilipsObj(a);
      var ph = ctx.ph, d = ctx.drink;
      var roster = getPhilipsRoster();
      var snap = computePhilipsSnap(a);
      var ctx = ensurePhilipsObj(a);
      var ph = ctx.ph, d = ctx.drink;
      var profStore = (a.prefs.philipsProfiles[ph.profile] = a.prefs.philipsProfiles[ph.profile] || {});
      var drinkCal = (profStore[d.v] = profStore[d.v] || {});

      /* 1. Bezel Top: Profiles + SilentBrew · QuickStart + AquaClean Status */
      var aqPct = Math.max(0, Math.min(100, Math.round(((5000 - (ph.aquaCleanCupsUsed || 140)) / 5000) * 100)));
      wrap.appendChild(dom('div', { class: 'bt-ph-bezel-top' },
        dom('div', { class: 'bt-card-title-wrap' },
          brewerIco('philips5500', 22),
          dom('div', null,
            dom('h3', { style: 'font-size:1.05rem', text: 'Philips 5500 LatteGo Bezel Console' }),
            dom('span', { style: 'font-size:0.72rem;color:#C8B7A6', text: 'SilentBrew · QuickStart · 7 Front + 15 More Drinks · AquaClean ' + aqPct + '%' })
          )
        ),
        dom('div', { class: 'bt-ph-profile-bar', role: 'radiogroup', 'aria-label': 'Philips User Profile' },
          [
            ['blue', 'Blue', '#38BDF8'],
            ['green', 'Green', '#34D399'],
            ['yellow', 'Yellow', '#FBBF24'],
            ['pink', 'Pink', '#F472B6'],
            ['guest', 'Guest', '#D0C0B2']
          ].map(function (pf) {
            return dom('button', {
              type: 'button',
              class: 'bt-ph-profile-btn',
              'data-ph-profile': pf[0],
              style: '--ph-ring-col:' + pf[2],
              'aria-pressed': String(ph.profile === pf[0]),
              onclick: function () { ph.profile = pf[0]; haptic('tick'); saveDraft(); repaint(); if (onChangeUpdate) onChangeUpdate(); }
            }, dom('span', { class: 'bt-ph-ring-dot', style: '--ph-ring-col:' + pf[2] }), dom('span', { text: pf[1] }));
          })
        )
      ));

      /* 2. Top 3 Bean-Matched Drinks (distinct unclipped 1-line reasons) */
      var PHILIPS_DRINK_WHY = {
        espresso:       'Concentrated crema & syrupy sweetness at Aroma Bar 4.',
        coffee:         'Smooth everyday mug balance with clean aromatic finish.',
        americano:      'Hot-water bypass opens up floral & bright fruit clarity.',
        cappuccino:     'Rich espresso cuts cleanly through airy LatteGo foam.',
        latte:          'Layered steamed milk softens roast notes into caramel.',
        flatwhite:      'Velvety double-shot body under silky LatteGo microfoam.',
        caffelatte:     'Creamy milk-forward sweetness with gentle coffee snap.',
        ristretto:      'Short, sweet early cut avoids late dry bitterness.',
        lungo:          'Longer pull unlocks toasted cocoa and nutty depth.',
        crema:          'Full European cup with plush golden crema cap.',
        aulait:         'Equal coffee and warm milk for mellow morning comfort.',
        travelmug:      'Full travel-tumbler pour calibrated for steady warmth.',
        icedcoffee:     '76 °C cool pulse locks sweetness over ice without bite.',
        icedlatte:      'Chilled milk + cool-pulse shot keeps caramel notes crisp.',
        icedamericano:  'Crisp bypass over ice highlights sparkling citrus notes.',
        icedespresso:   'Concentrated chilled shot with bright aromatic lift.',
        icedcappuccino: 'Velvety foam crown over brisk iced espresso.',
        icedcaffelatte: 'Refreshing milk-forward iced cup with smooth finish.',
        icedcrema:      'Smooth chilled long coffee with soft aromatic body.',
        icedaulait:     'Balanced iced coffee & milk with zero harshness.'
      };
      var topRecs = [];
      if (typeof window !== 'undefined' && window.BTInnovate && typeof window.BTInnovate.philipsRecs === 'function') {
        try { topRecs = window.BTInnovate.philipsRecs(a.coffee, 'any').slice(0, 3); } catch (_) {}
      }
      if (!topRecs.length) {
        var isLight = /ultra|light/i.test(String((a.coffee && a.coffee.roast) || ''));
        topRecs = isLight
          ? [{ v: 'americano', label: 'Americano' }, { v: 'flatwhite', label: 'Flat White' }, { v: 'icedlatte', label: 'Iced Latte' }]
          : [{ v: 'cappuccino', label: 'Cappuccino' }, { v: 'espresso', label: 'Espresso' }, { v: 'flatwhite', label: 'Flat White' }];
      }
      var usedReasons = Object.create(null);
      wrap.appendChild(dom('div', null,
        dom('div', { style: 'font-size:0.7rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;color:#FAD398;margin-bottom:5px', text: 'Top 3 Bean-Matched Drinks' }),
        dom('div', { class: 'bt-ph-recs-row' },
          topRecs.map(function (rc) {
            var dk = rc.v || (rc.drink && rc.drink.v) || 'espresso';
            var dlbl = rc.label || (rc.drink && rc.drink.label) || dk;
            var rawWhy = String(rc.why || rc.reason || '').trim();
            var dwhy = (!rawWhy || usedReasons[rawWhy] || rawWhy.length > 68)
              ? (PHILIPS_DRINK_WHY[dk] || 'Tailored to your bean roast & solubility.')
              : rawWhy;
            usedReasons[rawWhy || dwhy] = 1;
            usedReasons[dwhy] = 1;
            return dom('button', {
              type: 'button',
              class: 'bt-ph-rec-card',
              'data-ph-rec-drink': dk,
              onclick: function () {
                ph.drink = dk;
                ph.drinkKey = dk;
                var hit = roster.find(function (x) { return x.v === dk; });
                if (hit) ph.panelTab = hit.panel;
                haptic('snap'); saveDraft(); repaint(); if (onChangeUpdate) onChangeUpdate();
              }
            },
              dom('b', { style: 'font-size:0.8rem;color:#FFFDF9', text: dlbl + ' \u2192' }),
              dom('span', { class: 'bt-ph-rec-why', text: dwhy })
            );
          })
        )
      ));

      /* 3. Panel Switcher: 7 Front Direct Drinks | More Drinks (15) | All 22 + 2x Toggle */
      wrap.appendChild(dom('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap' },
        dom('div', { class: 'bt-pill-row' },
          [
            ['front', 'Front Direct (7)'],
            ['more', 'More Drinks (15)'],
            ['all', 'All 22 Drinks']
          ].map(function (tb) {
            return dom('button', {
              type: 'button',
              class: 'bt-ph-interlock-btn',
              'data-ph-panel': tb[0],
              'aria-pressed': String(ph.panelTab === tb[0]),
              text: tb[1],
              onclick: function () { ph.panelTab = tb[0]; haptic('tick'); saveDraft(); repaint(); }
            });
          })
        ),
        dom('button', {
          type: 'button',
          class: 'bt-ph-interlock-btn',
          disabled: !ctx.twoXAllowed,
          'aria-pressed': String(ph.twoX),
          text: ph.twoX ? '2x Twin Cup ON' : '1x / 2x Cup',
          onclick: function () {
            if (!ctx.twoXAllowed) return;
            ph.twoX = !ph.twoX; haptic('tick'); saveDraft(); repaint(); if (onChangeUpdate) onChangeUpdate();
          }
        })
      ));

      var shownDrinks = roster.filter(function (dr) { return ph.panelTab === 'all' || dr.panel === ph.panelTab; });
      wrap.appendChild(dom('div', { class: 'bt-ph-drink-grid', role: 'radiogroup', 'aria-label': 'Philips 5500 Drinks' },
        shownDrinks.map(function (dr) {
          var isDrActive = ph.drink === dr.v;
          return dom('button', {
            type: 'button',
            class: 'bt-ph-drink-tile' + (isDrActive ? ' is-active' : ''),
            'data-ph-drink': dr.v,
            'aria-pressed': String(isDrActive),
            onclick: function () {
              ph.drink = dr.v;
              ph.drinkKey = dr.v;
              haptic('snap');
              saveDraft();
              repaint();
              if (onChangeUpdate) onChangeUpdate();
            }
          },
            ico(dr.iced ? 'cryo-snowflake' : dr.milk ? 'lattego-carafe' : 'cafe-cup', 18),
            dom('span', { text: dr.label })
          );
        })
      ));

      /* 3B. 3-Step Global Menu Temperature (Low 88 °C · Med 91 °C · High 93 °C, or Auto Cool Pulse ~76 °C on Iced) */
      wrap.appendChild(dom('div', { class: 'bt-ph-temp-box', 'data-ph-temp-selector': '1' },
        dom('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap' },
          dom('div', { style: 'display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap' },
            dom('b', { style: 'font-size:0.74rem;text-transform:uppercase;letter-spacing:0.05em;color:#FAD398', text: 'Menu Temp (Low 88 °C · Med 91 °C · High 93 °C)' }),
            makeWhyPill('temp', '? Why', { dark: true })
          ),
          d.iced
            ? dom('span', { class: 'bt-ph-iced-badge', text: 'Auto Cool Pulse (~76 °C / 169 °F)' })
            : dom('span', { class: 'bt-num', style: 'font-size:0.73rem;color:#E8DDD2;font-weight:700', text: 'Active: ' + snap.tempC + ' °C (' + snap.tempF + ' °F)' })
        ),
        dom('div', { class: 'bt-ph-temp-grid', role: 'radiogroup', 'aria-label': 'Philips 5500 Menu Temperature' },
          PHILIPS_TEMP_STEPS_3.map(function (ts) {
            var activeT = !d.iced && ph.globalTemp === ts.step;
            return dom('button', {
              type: 'button',
              class: 'bt-ph-interlock-btn',
              'data-ph-temp-step': String(ts.step),
              disabled: !!d.iced,
              style: d.iced ? 'opacity:0.5' : '',
              'aria-pressed': String(activeT),
              text: ts.label,
              onclick: function () {
                if (d.iced) return;
                ph.globalTemp = ts.step;
                haptic('tick');
                saveDraft();
                repaint();
                if (onChangeUpdate) onChangeUpdate();
              }
            });
          })
        )
      ));

      /* 4. Visual 5-Step LED Columns (Aroma Bean / Coffee Volume / Water / Milk) */
      function makeLedCol(title, val, isMilk, rangeArr, onPick, extraTop, extraBot) {
        var stack = dom('div', { class: 'bt-ph-led-stack' });
        for (var b = 1; b <= 5; b++) {
          (function (bn) {
            var lit = val > 0 && bn <= val;
            var rightTxt = rangeArr ? ('~' + interpBarMl(rangeArr, bn) + ' mL') : ('~' + SAS_DOSE[bn] + ' g');
            stack.appendChild(dom('button', {
              type: 'button',
              class: 'bt-ph-led-seg' + (isMilk ? ' is-milk' : '') + (lit ? ' is-lit' : ''),
              'aria-pressed': String(val === bn),
              onclick: function () { onPick(bn); }
            }, dom('span', { text: 'Bar ' + bn }), dom('span', { text: rightTxt })));
          })(b);
        }
        return dom('div', { class: 'bt-ph-slider-col' },
          dom('div', { style: 'font-size:0.72rem;font-weight:800;text-transform:uppercase;color:#D6C7B9', text: title }),
          extraTop,
          stack,
          extraBot
        );
      }

      var deck = dom('div', { class: 'bt-ph-sliders-deck' });
      if (d.coffee) {
        deck.appendChild(makeLedCol(
          'Aroma Bean (1–5)',
          ph.scoopMode ? 0 : ph.strength,
          false,
          null,
          function (b) { ph.scoopMode = false; if (b < 5) ph.extra = false; ph.strength = b; haptic('tick'); saveDraft(); repaint(); if (onChangeUpdate) onChangeUpdate(); },
          dom('button', {
            type: 'button',
            class: 'bt-ph-interlock-btn',
            disabled: !ctx.extraAllowed,
            'aria-pressed': String(ph.extra),
            text: ph.extra ? 'ExtraShot ON (+25mL)' : '+ ExtraShot (Bar 5+)',
            onclick: function () { if (!ctx.extraAllowed) return; ph.extra = !ph.extra; if (ph.extra) ph.strength = 5; haptic('snap'); saveDraft(); repaint(); if (onChangeUpdate) onChangeUpdate(); }
          }),
          dom('button', {
            type: 'button',
            class: 'bt-ph-interlock-btn',
            'aria-pressed': String(ph.scoopMode),
            text: ph.scoopMode ? 'Pre-Ground Scoop ON' : 'Pre-Ground Scoop',
            onclick: function () { ph.scoopMode = !ph.scoopMode; haptic('tick'); saveDraft(); repaint(); if (onChangeUpdate) onChangeUpdate(); }
          })
        ));
      }

      if (d.v === 'travelmug') {
        deck.appendChild(dom('div', { class: 'bt-ph-slider-col' },
          dom('div', { style: 'font-size:0.72rem;font-weight:800;text-transform:uppercase;color:#D6C7B9', text: 'Travel Mug Volume' }),
          [240, 360].map(function (sz) {
            return dom('button', {
              type: 'button',
              class: 'bt-ph-led-seg' + (ph.travelSizeMl === sz ? ' is-lit' : ''),
              'aria-pressed': String(ph.travelSizeMl === sz),
              onclick: function () { ph.travelSizeMl = sz; haptic('tick'); saveDraft(); repaint(); if (onChangeUpdate) onChangeUpdate(); }
            }, dom('span', { text: sz === 240 ? '8 oz Mug' : '12 oz Mug' }), dom('span', { text: sz + ' mL' }));
          })
        ));
      } else if (d.coffee) {
        deck.appendChild(makeLedCol(
          'Coffee Volume (1–5)',
          ph.coffeeBar,
          false,
          d.coffeeBarsMl || d.coffee,
          function (b) { ph.coffeeBar = b; delete drinkCal.coffeeMl; haptic('tick'); saveDraft(); repaint(); if (onChangeUpdate) onChangeUpdate(); },
          null,
          null
        ));
      }

      if (d.water) {
        deck.appendChild(makeLedCol(
          'Hot Water (1–5)',
          ph.waterBar,
          false,
          d.waterBarsMl || d.water,
          function (b) { ph.waterBar = b; delete drinkCal.waterMl; haptic('tick'); saveDraft(); repaint(); if (onChangeUpdate) onChangeUpdate(); },
          null,
          null
        ));
      }

      if (d.milk) {
        deck.appendChild(makeLedCol(
          'LatteGo Milk (1–5)',
          ph.milkBar,
          true,
          d.milkBarsMl || d.milk,
          function (b) { ph.milkBar = b; delete drinkCal.milkMl; haptic('tick'); saveDraft(); repaint(); if (onChangeUpdate) onChangeUpdate(); },
          null,
          null
        ));
      }
      wrap.appendChild(deck);

      /* 5. LatteGo 3.09x Lactose-Free Foam Hint & Venturi Iced Notice */
      if (d.milk) {
        wrap.appendChild(dom('div', { class: 'bt-ph-hopper-lock', style: 'background:rgba(92,212,156,0.09);border-color:rgba(92,212,156,0.34)' },
          dom('div', { style: 'font-size:0.78rem;font-weight:800;color:#8DF0C0', text: 'LatteGo Foam Science: Lactose-Free 3.09x Natural Sweetness' }),
          dom('p', {
            style: 'font-size:0.75rem;color:#E8DDD2;margin:0;line-height:1.38',
            text: 'Chilled 4 °C lactose-free dairy splits lactose into glucose + galactose for 3.09x natural sweetness with 0 g added syrup and dense LatteGo microfoam.' +
              (d.iced ? ' On Iced Milk drinks, Steam-Venturi dispenses warm froth onto ~150 g ice (or pour 4 °C milk over ice + pull Iced Espresso).' : '')
          })
        ));
      }

      /* 6. 4-Cup Size SVG Comparison + Volume Bar Calibration */
      var cupSizes4 = [
        { k: 'S', lbl: 'Espresso (80mL)', cap: 80 },
        { k: 'M', lbl: 'Mug (200mL)', cap: 200 },
        { k: 'L', lbl: 'Latte Glass (320mL)', cap: 320 },
        { k: 'XL', lbl: 'Travel (380mL)', cap: 380 }
      ];
      var bestCupIdx = cupSizes4.findIndex(function (c) { return c.cap >= snap.totalMl + (d.iced ? 90 : 15); });
      if (bestCupIdx < 0) bestCupIdx = 3;

      var calInput = dom('input', {
        type: 'number',
        class: 'bt-input-v62',
        style: 'max-width:128px;min-height:40px;background:rgba(255,255,255,0.09);color:#FFFDF9;border-color:rgba(247,240,232,0.24)',
        placeholder: String(snap.totalMl) + ' mL',
        'aria-label': 'Calibrate measured cup volume in mL'
      });

      wrap.appendChild(dom('div', { style: 'padding:11px 12px;border-radius:14px;background:rgba(255,255,255,0.05);display:flex;flex-direction:column;gap:8px' },
        dom('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap' },
          dom('b', { style: 'font-size:0.78rem;color:#FAD398', text: '4-Cup Vessel Fit & Volume Calibration (~' + snap.totalMl + ' mL)' }),
          dom('span', { class: 'bt-num', style: 'font-size:0.74rem;color:#D6C7B9', text: 'Use ' + cupSizes4[bestCupIdx].lbl })
        ),
        dom('div', { style: 'display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;align-items:end' },
          cupSizes4.map(function (cs, idx) {
            var activeCup = idx === bestCupIdx;
            var hPx = 26 + idx * 10;
            return dom('div', {
              style: 'padding:6px;border-radius:10px;text-align:center;border:1px solid ' + (activeCup ? '#FAD398' : 'rgba(255,255,255,0.12)') + ';background:' + (activeCup ? 'rgba(232,132,74,0.20)' : 'transparent')
            },
              dom('div', { style: 'width:26px;height:' + hPx + 'px;margin:0 auto 4px;border-radius:3px 3px 7px 7px;border:1.5px solid #EFE5DA;background:rgba(168,86,38,0.55)' }),
              dom('b', { style: 'display:block;font-size:0.7rem;color:#FFFDF9', text: cs.k }),
              dom('span', { style: 'font-size:0.64rem;color:#C8B7A6', text: cs.cap + 'mL' })
            );
          })
        ),
        dom('div', { style: 'display:flex;align-items:center;gap:8px;flex-wrap:wrap' },
          calInput,
          dom('button', {
            type: 'button',
            class: 'bt-ph-interlock-btn',
            text: 'Save Calibrated mL',
            onclick: function () {
              var v = parseFloat(calInput.value);
              if (v >= 15 && v <= 600) {
                if (d.coffee && !d.milk) drinkCal.coffeeMl = Math.round(v);
                else if (d.milk) drinkCal.milkMl = Math.max(30, Math.round(v - snap.coffeeMl));
                saveDraft();
                showToast('Calibrated ' + d.label + ' (' + ph.profile.toUpperCase() + ') to ' + Math.round(v) + ' mL!');
                repaint();
                if (onChangeUpdate) onChangeUpdate();
              }
            }
          })
        )
      ));

      /* 7. Ceramic Hopper 1–12 Safety Interlock + SAS 4-Shot Counter */
      var sasDots = dom('span', { class: 'bt-ph-sas-dots' });
      for (var s = 0; s < 4; s++) {
        sasDots.appendChild(dom('i', { class: 'bt-ph-sas-dot' + (s >= ph.sasRemaining ? ' is-filled' : '') }));
      }
      wrap.appendChild(dom('div', { class: 'bt-ph-hopper-lock' },
        dom('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap' },
          dom('div', { style: 'display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap' },
            dom('b', { class: 'bt-num', style: 'font-size:0.82rem;color:#FAD398', text: 'Ceramic Burr Step ' + ph.hopperStep + ' of 12 (~' + snap.grindUm + ' µm)' }),
            makeWhyPill('grind', '? Why', { dark: true })
          ),
          dom('div', { style: 'display:flex;gap:6px' },
            dom('button', {
              type: 'button', class: 'bt-ph-interlock-btn', disabled: ph.hopperStep <= 1, text: '-1 Finer',
              onclick: function () { ph.hopperStep = Math.max(1, ph.hopperStep - 1); ph.sasRemaining = 4; haptic('tick'); saveDraft(); repaint(); if (onChangeUpdate) onChangeUpdate(); }
            }),
            dom('button', {
              type: 'button', class: 'bt-ph-interlock-btn', disabled: ph.hopperStep >= 12, text: '+1 Coarser',
              onclick: function () { ph.hopperStep = Math.min(12, ph.hopperStep + 1); ph.sasRemaining = 4; haptic('tick'); saveDraft(); repaint(); if (onChangeUpdate) onChangeUpdate(); }
            })
          )
        ),
        dom('div', { class: 'bt-ph-safety-tag' },
          ico('alert-triangle', 14),
          dom('span', { text: 'ADJUST MAX 1 NOTCH ONLY WHILE CERAMIC GRINDER IS ACTIVELY SPINNING' })
        ),
        dom('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:0.74rem;color:#E8DDD2' },
          dom('span', { text: ph.sasRemaining > 0 ? ('SAS Adapting: ' + ph.sasRemaining + ' shot(s) left to settle dose') : 'SAS Torque Sensor Settled (4/4)' }),
          sasDots
        )
      ));
    }

    repaint();
    return wrap;
  }

  function buildFellowAidenConsoleCard(a, rec, onChangeUpdate) {
    var inn = (typeof window !== 'undefined' && window.BTInnovate) ? window.BTInnovate : null;
    var card = dom('section', { class: 'bt-card-v6', id: 'bt-aiden-console' });

    function repaint() {
      card.textContent = '';
      var synAiden = (inn && typeof inn.synthesizeAidenProfile === 'function')
        ? inn.synthesizeAidenProfile(a.coffee, { ratio: a.brew.ratio, waterG: a.brew.water, tempC: a.brew.tempC }, null, { style: a.brew.style })
        : null;

      a.brew.aidenCustom = a.brew.aidenCustom || {};
      var ac = a.brew.aidenCustom;
      var waterMl = +a.brew.water || 300;
      var isSingle = waterMl <= 450;
      /* Exact Round-2 Hardware Truth: 1-Dot Green (Single-Serve) vs 3-Dot Blue (Batch) */
      var basketBadgeText = isSingle
        ? '1-Dot Green · Single-Serve Cone (<=450 mL)'
        : '3-Dot Blue · Batch Flat Basket (>450 mL · 62 cm2)';

      var bloomRatio = ac.bloomRatio || (synAiden ? synAiden.bloomRatio : 2.5);
      var bloomTempC = ac.bloomTempC || (synAiden ? synAiden.bloomTemperature : (a.brew.style === 'aiden_samo_bloom' ? 60 : a.brew.tempC));
      var bloomSecs = ac.bloomSecs || (synAiden ? synAiden.bloomDuration : 38);
      var pulseIntervalS = ac.pulseIntervalS || (synAiden ? synAiden.activePulsesInterval : (isSingle ? 22 : 30));
      var pulseTemps = Array.isArray(ac.pulseTemps) && ac.pulseTemps.length
        ? ac.pulseTemps
        : (synAiden && Array.isArray(synAiden.activePulseTemperatures) ? synAiden.activePulseTemperatures.slice() : [95.0, 93.0, 91.0]);

      var knots = [bloomTempC].concat(pulseTemps);
      var W = 380, H = 160, L = 34, R = 358, T = 24, B = 136;
      var stepW = (R - L) / knots.length;
      function yTemp(tc) { return B - ((Math.max(58, Math.min(99, tc)) - 58) / 41) * (B - T); }

      var pathD = '';
      var circleNodes = [];
      knots.forEach(function (tc, idx) {
        var x0 = L + idx * stepW, x1 = x0 + stepW, cx = (x0 + x1) * 0.5, y = yTemp(tc);
        pathD += (idx === 0 ? 'M ' + x0.toFixed(1) + ' ' + y.toFixed(1) : ' L ' + x0.toFixed(1) + ' ' + y.toFixed(1)) + ' L ' + x1.toFixed(1) + ' ' + y.toFixed(1);
        circleNodes.push(
          dom('circle', { cx: cx.toFixed(1), cy: y.toFixed(1), r: '9', fill: '#E8844A', stroke: '#FFFDF9', 'stroke-width': '2.2' }),
          dom('text', { x: cx.toFixed(1), y: (y - 13).toFixed(1), 'text-anchor': 'middle', 'font-size': '9.5', 'font-weight': '800', fill: '#F6EFE6', text: (idx === 0 ? 'Bloom ' : 'P' + idx + ' ') + tc.toFixed(1) + '°C' })
        );
      });

      var svgEl = dom('svg', {
        class: 'bt-staircase-svg',
        viewBox: '0 0 ' + W + ' ' + H,
        role: 'img',
        'aria-label': 'Fellow Aiden Per-Pulse Temperature Staircase'
      },
        dom('path', { d: pathD, fill: 'none', stroke: '#F0A35E', 'stroke-width': '3', 'stroke-linecap': 'round' }),
        circleNodes
      );

      svgEl.addEventListener('pointerdown', function (ev) {
        var rect = svgEl.getBoundingClientRect ? svgEl.getBoundingClientRect() : null;
        if (!rect || !rect.width || !rect.height) return;
        var idx = Math.min(knots.length - 1, Math.max(0, Math.floor(((ev.clientX - rect.left) / rect.width) * knots.length)));
        var uY = 1 - Math.max(0, Math.min(1, (ev.clientY - rect.top) / rect.height));
        var qT = Math.round((58 + uY * 41) * 2) / 2;
        if (idx === 0) ac.bloomTempC = qT;
        else {
          ac.pulseTemps = pulseTemps.slice();
          ac.pulseTemps[idx - 1] = qT;
          if (idx === 1) {
            a.brew.tempC = qT;
            a.brew.tempF = Math.round(qT * 9 / 5 + 32);
          }
        }
        a.brew.customizedNote = 'Aiden Pulse Staircase';
        haptic('tick'); saveDraft(); repaint(); if (onChangeUpdate) onChangeUpdate();
      });

      card.appendChild(dom('div', { class: 'bt-card-hd' },
        dom('div', { class: 'bt-card-title-wrap' }, brewerIco('aiden', 20), dom('h3', { class: 'bt-card-title', text: 'Fellow Aiden Native Profile' })),
        dom('div', { style: 'display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap' },
          makeWhyPill('all', '? Why Science'),
          dom('span', { class: isSingle ? 'bt-basket-badge-green' : 'bt-basket-badge-blue', text: basketBadgeText })
        )
      ));

      card.appendChild(dom('div', { class: 'bt-recipe-6grid' },
        dom('div', { class: 'bt-spec-tile-v62', style: 'min-height:72px' },
          dom('span', { class: 'bt-spec-head-row' }, dom('span', { class: 'bt-spec-lbl', text: 'Bloom Ratio & Time' }), makeWhyPill('time', '? Why')),
          dom('b', { class: 'bt-spec-primary is-compact', text: '1:' + bloomRatio + ' · ' + bloomSecs + 's' }),
          dom('span', { class: 'bt-spec-sub', text: 'Bloom @ ' + bloomTempC + ' °C (' + Math.round(bloomTempC * 9 / 5 + 32) + ' °F)' })
        ),
        dom('div', { class: 'bt-spec-tile-v62', style: 'min-height:72px' },
          dom('span', { class: 'bt-spec-head-row' }, dom('span', { class: 'bt-spec-lbl', text: 'Pulses & Interval' }), makeWhyPill('temp', '? Why')),
          dom('b', { class: 'bt-spec-primary is-compact', text: pulseTemps.length + ' Pulses · ' + pulseIntervalS + 's' }),
          dom('span', { class: 'bt-spec-sub', text: pulseTemps.map(function (t) { return t + '°C'; }).join(' \u2192 ') })
        ),
        dom('div', { class: 'bt-spec-tile-v62', style: 'min-height:72px' },
          dom('span', { class: 'bt-spec-head-row' }, dom('span', { class: 'bt-spec-lbl', text: 'Showerhead Selector' }), makeWhyPill('grind', '? Why')),
          dom('b', { class: 'bt-spec-primary is-compact', text: isSingle ? '1-Dot Green' : '3-Dot Blue' }),
          dom('span', { class: 'bt-spec-sub', text: isSingle ? '#2 Cone filter' : 'Flat batch basket paper' })
        )
      ));

      if (synAiden && synAiden.overflowWarning) {
        card.appendChild(dom('div', { style: 'padding:8px 11px;border-radius:11px;background:var(--warn-bg);color:var(--warn);font-size:0.76rem;font-weight:700', text: synAiden.overflowWarning }));
      }

      card.appendChild(dom('div', null, svgEl));
      card.appendChild(dom('div', { class: 'bt-pill-row' },
        dom('button', {
          type: 'button', class: 'bt-chip-v6 bt-chip-soft',
          'aria-pressed': String(a.brew.style === 'aiden_samo_bloom' || bloomTempC === 60),
          text: '60 °C Samo Bloom',
          onclick: function () {
            ac.bloomTempC = 60;
            a.brew.style = 'aiden_samo_bloom';
            a.brew.customizedNote = '60 °C Samo Bloom';
            haptic('tick');
            saveDraft();
            repaint();
            if (onChangeUpdate) onChangeUpdate();
          }
        }),
        dom('button', {
          type: 'button', class: 'bt-chip-v6 bt-chip-soft',
          text: 'Copy Fellow Profile JSON',
          onclick: function () {
            var jsonOut = JSON.stringify(synAiden ? synAiden.json : { title: 'BT Aiden', ratio: a.brew.ratio, bloomRatio: bloomRatio, bloomDuration: bloomSecs, bloomTemperature: bloomTempC, ssPulseTemperatures: pulseTemps }, null, 2);
            if (typeof window !== 'undefined' && window.BTPlatform && typeof window.BTPlatform.copyText === 'function') {
              window.BTPlatform.copyText(jsonOut);
            }
            showToast('Copied Fellow Aiden Profile JSON to clipboard!');
          }
        })
      ));
    }

    repaint();
    return card;
  }

  function buildXBloomConsoleCard(a, rec, onChangeUpdate) {
    var inn = (typeof window !== 'undefined' && window.BTInnovate) ? window.BTInnovate : null;
    var card = dom('section', { class: 'bt-card-v6', id: 'bt-xbloom-console' });

    function repaint() {
      card.textContent = '';
      var totalMl = Math.max(60, Math.round((+a.brew.dose || 15) * (+a.brew.ratio || 16)));
      a.brew.xbloomProfile = a.brew.xbloomProfile || {
        rpm: 70,
        vessel: 'omni2',
        grinderOn: true,
        pours: [
          { volumeMl: Math.round(totalMl * 0.20), temp: Math.round(a.brew.tempC || 94), pattern: 'spiral', pauseS: 32 },
          { volumeMl: Math.round(totalMl * 0.28), temp: Math.round(a.brew.tempC || 94), pattern: 'spiral', pauseS: 18 },
          { volumeMl: Math.round(totalMl * 0.28), temp: Math.max(85, Math.round((a.brew.tempC || 94) - 2)), pattern: 'river', pauseS: 16 },
          { volumeMl: totalMl - Math.round(totalMl * 0.20) - Math.round(totalMl * 0.28) * 2, temp: Math.max(84, Math.round((a.brew.tempC || 94) - 3)), pattern: 'center', pauseS: 0 }
        ]
      };
      var xb = a.brew.xbloomProfile;
      if (!Array.isArray(xb.pours) || xb.pours.length < 4 || typeof xb.pours[0] === 'number') {
        xb.pours = [
          { volumeMl: Math.round(totalMl * 0.20), temp: 94, pattern: 'spiral', pauseS: 32 },
          { volumeMl: Math.round(totalMl * 0.28), temp: 94, pattern: 'spiral', pauseS: 18 },
          { volumeMl: Math.round(totalMl * 0.28), temp: 92, pattern: 'river', pauseS: 16 },
          { volumeMl: Math.round(totalMl * 0.24), temp: 90, pattern: 'center', pauseS: 0 }
        ];
      }
      if (inn && typeof inn.rebalanceXBloomPours === 'function') {
        var reb = inn.rebalanceXBloomPours(xb.pours, a.brew.dose, a.brew.ratio);
        if (reb && Array.isArray(reb.pours)) xb.pours = reb.pours;
      } else {
        var s3 = xb.pours[0].volumeMl + xb.pours[1].volumeMl + xb.pours[2].volumeMl;
        xb.pours[3].volumeMl = Math.max(10, totalMl - s3);
      }

      var omniMap = mapGrinderClicks(a.brew.grindUm, 'xbloom-studio', 'xbloom', a);

      card.appendChild(dom('div', { class: 'bt-card-hd' },
        dom('div', { class: 'bt-card-title-wrap' }, brewerIco('xbloom', 20), dom('h3', { class: 'bt-card-title', text: 'xBloom Studio 4-Pour & Omni Grinder Card' })),
        dom('div', { style: 'display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap' },
          makeWhyPill('grind', '? Why Grind & RPM'),
          makeWhyPill('time', '? Why 4-Pour'),
          dom('span', { class: 'bt-badge-v62 is-sci', text: 'Omni Step ' + omniMap.clicks + '/80 · ' + xb.rpm + ' RPM' })
        )
      ));

      /* RPM & Vessel Strip */
      card.appendChild(dom('div', { class: 'bt-pill-row' },
        [60, 70, 80, 90, 100, 120].map(function (rVal) {
          return dom('button', {
            type: 'button',
            class: 'bt-chip-v6',
            'aria-pressed': String(xb.rpm === rVal),
            text: rVal + ' RPM',
            onclick: function () {
              xb.rpm = rVal;
              a.brew.customizedNote = 'xBloom ' + rVal + ' RPM';
              haptic('tick');
              saveDraft();
              repaint();
              if (onChangeUpdate) onChangeUpdate();
            }
          });
        })
      ));

      /* 4-Pour Kinematic Cards (Spiral / River / Center) */
      var patterns = ['spiral', 'river', 'center'];
      card.appendChild(dom('div', { class: 'bt-xbloom-pours-grid' },
        xb.pours.map(function (p, idx) {
          var pat = p.pattern || patterns[idx % 3];
          return dom('div', { class: 'bt-xbloom-pour-card' },
            dom('div', { style: 'display:flex;justify-content:space-between;align-items:center' },
              dom('b', { style: 'font-size:0.76rem;color:var(--accent)', text: idx === 0 ? '1. Bloom' : ('Pour ' + (idx + 1)) }),
              dom('span', { class: 'bt-num', style: 'font-size:0.84rem;font-weight:800', text: p.volumeMl + ' mL' })
            ),
            dom('span', { class: 'bt-num', style: 'font-size:0.73rem;color:var(--ink-secondary)', text: (p.temp || 93) + ' °C · Pause ' + (p.pauseS || 0) + 's' }),
            dom('button', {
              type: 'button',
              class: 'bt-chip-v6 bt-chip-soft',
              style: 'min-height:34px;padding:3px 8px;font-size:0.72rem;width:100%',
              text: 'Pattern: ' + pat.charAt(0).toUpperCase() + pat.slice(1),
              onclick: function () {
                p.pattern = patterns[(patterns.indexOf(pat) + 1) % patterns.length];
                a.brew.customizedNote = 'xBloom Pour ' + (idx + 1) + ' ' + p.pattern;
                haptic('tick');
                saveDraft();
                repaint();
                if (onChangeUpdate) onChangeUpdate();
              }
            })
          );
        })
      ));

      /* Whole-Bean 0x41 vs Pre-Ground 0x44 + Beam CTA */
      card.appendChild(dom('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap' },
        dom('div', { class: 'bt-pill-row' },
          dom('button', {
            type: 'button', class: 'bt-chip-v6', 'aria-pressed': String(xb.grinderOn),
            text: 'Whole Bean · Grinder ON',
            onclick: function () {
              xb.grinderOn = true;
              a.brew.customizedNote = 'xBloom Whole Bean';
              haptic('tick');
              saveDraft();
              repaint();
              if (onChangeUpdate) onChangeUpdate();
            }
          }),
          dom('button', {
            type: 'button', class: 'bt-chip-v6', 'aria-pressed': String(!xb.grinderOn),
            text: 'Pre-Ground · Grinder OFF',
            onclick: function () {
              xb.grinderOn = false;
              a.brew.customizedNote = 'xBloom Pre-Ground';
              haptic('tick');
              saveDraft();
              repaint();
              if (onChangeUpdate) onChangeUpdate();
            }
          })
        ),
        dom('button', {
          type: 'button',
          class: 'bt-chip-v6 bt-chip-accent is-active',
          onclick: function () {
            var ble = (typeof window !== 'undefined' && window.BTBle) ? window.BTBle : null;
            if (ble && typeof ble.sendXBloomRecipe === 'function') {
              Promise.resolve(ble.sendXBloomRecipe({
                grinderOn: xb.grinderOn,
                opcode: xb.grinderOn ? 0x41 : 0x44,
                rpm: xb.rpm,
                grindStep: omniMap.clicks,
                pours: xb.pours
              })).then(function () {
                showToast('Beamed 4-pour recipe to xBloom Studio!');
              }).catch(function () {
                showToast('xBloom profile armed (' + totalMl + ' mL · ' + xb.rpm + ' RPM). Pair xBloom via BLE to beam.');
              });
            } else {
              showToast('xBloom 4-pour profile armed (' + totalMl + ' mL · Step ' + omniMap.clicks + ' @ ' + xb.rpm + ' RPM).');
            }
          }
        }, ico('ble-wave', 15), dom('span', { text: 'Beam to xBloom' }))
      ));
    }

    repaint();
    return card;
  }

  /* ==================== 8. STEP 3: SCANNABLE NUMBERS-FIRST RECIPE ('brew') ==================== */
  function formatDosePrimary(doseG, coffeeUnit) {
    if (coffeeUnit === 'oz') return [(doseG / 28.349523125).toFixed(2), ' oz', doseG.toFixed(1) + ' g (~' + (doseG / 5.3).toFixed(1) + ' tbsp)'];
    if (coffeeUnit === 'tbsp') return [(doseG / 5.3).toFixed(1), ' tbsp', doseG.toFixed(1) + ' g dry beans'];
    return [doseG.toFixed(1), ' g', '~' + (doseG / 5.3).toFixed(1) + ' level tbsp'];
  }

  function formatWaterPrimary(rec, waterUnit) {
    if (rec.isIced) {
      return [rec.hotPourG + '+' + rec.iceG, ' g', rec.hotPourG + ' g hot pour over ' + rec.iceG + ' g ice'];
    }
    var w = rec.waterG;
    var subYield = rec.method.outRatio ? ('~' + Math.round(rec.doseG * 2.1 + w) + ' g group water') : ('~' + rec.yieldMl + ' mL in mug');
    if (waterUnit === 'floz' || waterUnit === 'fl oz') return [(w / 29.57352956).toFixed(1), ' fl oz', w + ' g · ' + subYield];
    if (waterUnit === 'cups') return [(w / 236.588).toFixed(2), ' cups', w + ' g · ' + subYield];
    return [String(Math.round(w)), ' g', subYield];
  }

  function renderStep3Recipe(stageEl, a) {
    ensureBrewState(a);
    var lens = getExperienceLens();
    var rec = runCurrentSynthesis(a);
    var isPhilips = rec.method.key === 'philips5500';
    var phSnap = isPhilips ? computePhilipsSnap(a) : null;
    var tempUnit = (a.prefs && a.prefs.tempUnit === 'C') ? 'C' : 'F';
    var roasterGuide = (a.coffee && (a.coffee.roasterGuide || a.coffee.roasterBrewGuide || a.coffee.roaster_brew_guide)) || null;
    var cTitle = (a.coffee && a.coffee.name)
      ? ((a.coffee.roaster ? a.coffee.roaster + ' · ' : '') + a.coffee.name)
      : 'Science-Synthesized Baseline';

    /* 1. Screen Header + 1-Tap °F / °C Toggle */
    stageEl.appendChild(dom('div', { class: 'bt-screen-head' },
      dom('div', null,
        dom('div', { class: 'bt-screen-kicker', text: 'Step 3 of 5 · Scannable Recipe' }),
        dom('h1', { class: 'bt-screen-title', text: rec.method.label + ' Recipe' }),
        dom('p', { class: 'bt-screen-sub', text: cTitle + ' · Tap any tile to tune.' })
      ),
      dom('button', {
        type: 'button',
        class: 'bt-chip-v6 bt-num',
        style: 'min-height:40px;padding:0 12px;font-weight:800',
        title: 'Toggle Fahrenheit / Celsius',
        onclick: function () {
          a.prefs.tempUnit = tempUnit === 'F' ? 'C' : 'F';
          haptic('tick');
          saveDraft();
          rerender();
        }
      }, dom('span', { text: tempUnit === 'F' ? '°F / °C' : '°C / °F' }))
    ));

    /* Customized / Locked Banner */
    if (a.brew.customizedNote || a.recipeLocked) {
      stageEl.appendChild(dom('div', {
        style: 'padding:8px 12px;border-radius:12px;background:var(--gold-soft, var(--warn-bg));border:1px solid rgba(217,139,38,0.35);display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:0.78rem;font-weight:700'
      },
        dom('span', { text: a.recipeLocked ? 'Gold-Seal Locked Recipe Active' : ('Tuned: ' + a.brew.customizedNote) }),
        dom('button', {
          type: 'button',
          style: 'color:var(--accent);font-weight:800;font-size:0.76rem',
          text: a.recipeLocked ? 'Unlock' : 'Reset Baseline',
          onclick: function () {
            a.recipeLocked = false;
            a.brew.tempComp = false;
            synthesizeScienceIntoApp(a, rec.method.key, { force: true });
            haptic('tick');
            saveDraft();
            rerender();
          }
        })
      ));
    }

    /* 2. THE 6 BIG SCANNABLE BREW TILES FIRST (2x3 mobile, 3x2 desktop) */
    var doseDisp = formatDosePrimary(isPhilips ? phSnap.doseG : rec.doseG, a.prefs.coffeeUnit);
    var waterDisp = isPhilips
      ? [String(phSnap.totalMl), ' mL', phSnap.drink.label + (phSnap.milkMl ? ' (' + phSnap.milkMl + 'mL milk)' : '')]
      : formatWaterPrimary(rec, a.prefs.waterUnit);

    var tempValShown = isPhilips
      ? (tempUnit === 'F' ? phSnap.tempF : phSnap.tempC)
      : (tempUnit === 'F' ? rec.tempF : rec.tempC);
    var tempAltShown = isPhilips
      ? (tempUnit === 'F' ? phSnap.tempC + ' °C' : phSnap.tempF + ' °F')
      : (tempUnit === 'F' ? rec.tempC + ' °C' : rec.tempF + ' °F');

    var grindPrimary = isPhilips
      ? ('Notch ' + a.brew.machine.hopperStep + '/12')
      : lens === 'starter'
      ? rec.grindMap.short
      : rec.grindMap.short;
    var grindSecondary = isPhilips
      ? ('Ceramic Burr · ~' + phSnap.grindUm + ' µm')
      : lens === 'starter'
      ? rec.plainGrind
      : lens === 'scientist'
      ? ((rec.grinder.short || rec.grinder.name) + ' · D50 ' + rec.d50Um + ' µm')
      : ((rec.grinder.short || rec.grinder.name) + ' · ' + rec.plainGrind.split(',')[0]);

    var timePrimary = fmtClock(isPhilips ? phSnap.timeS : rec.totalSecs, false);
    var timeSecondary = lens === 'starter'
      ? 'Sweet, balanced extraction'
      : ('Est. ' + rec.predTds + '% TDS · ' + rec.predEy + '% Extraction (%EY)');

    var strengthGl = Math.round(1000 / Math.max(1, rec.ratio));

    function makeHeroRecipeTile(lbl, whyKey, primaryNode, subTxt, onTune, hideTuneBadge) {
      function fireTune(ev) {
        if (ev && ev.target && ev.target.closest && ev.target.closest('[data-science-why]')) return;
        onTune();
      }
      return dom('div', {
        class: 'bt-spec-tile-v62 bt-recipe-tile',
        role: 'button',
        tabindex: '0',
        onclick: fireTune,
        onkeydown: function (ev) {
          if (ev && (ev.key === 'Enter' || ev.key === ' ')) {
            if (ev.target && ev.target.closest && ev.target.closest('[data-science-why]')) return;
            ev.preventDefault();
            onTune();
          }
        }
      },
        dom('span', { class: 'bt-spec-head-row' },
          dom('span', { class: 'bt-spec-lbl', text: lbl }),
          dom('span', { class: 'bt-spec-actions-grp' },
            makeWhyPill(whyKey, '? Why'),
            hideTuneBadge ? null : dom('span', { class: 'bt-spec-tune', text: 'Tune' })
          )
        ),
        primaryNode,
        dom('span', { class: 'bt-spec-sub', text: subTxt })
      );
    }

    var tiles6 = dom('div', { class: 'bt-recipe-6grid', id: 'bt-recipe-6tiles' },
      /* Tile 1: COFFEE DOSE */
      makeHeroRecipeTile(
        'Coffee Dose',
        'dose',
        dom('b', { class: 'bt-spec-primary' }, doseDisp[0], dom('small', { text: doseDisp[1] })),
        doseDisp[2],
        function () { openSheet('tune-recipe', { tab: 'batch' }, { title: 'Tune Dose, Water, Ratio & Units', detent: 'full' }); }
      ),

      /* Tile 2: BREW WATER */
      makeHeroRecipeTile(
        rec.method.outRatio ? 'Shot Yield' : (rec.isIced ? 'Hot + Ice' : 'Brew Water'),
        'water',
        dom('b', { class: 'bt-spec-primary' }, waterDisp[0], dom('small', { text: waterDisp[1] })),
        waterDisp[2],
        function () { openSheet('tune-recipe', { tab: 'batch' }, { title: 'Tune Dose, Water, Ratio & Units', detent: 'full' }); }
      ),

      /* Tile 3: BREW RATIO */
      makeHeroRecipeTile(
        'Brew Ratio',
        'ratio',
        dom('b', { class: 'bt-spec-primary', text: '1:' + rec.ratio }),
        rec.method.outRatio ? 'Espresso yield ratio' : (strengthGl + ' g/L strength'),
        function () { openSheet('tune-recipe', { tab: 'batch' }, { title: 'Tune Dose, Water, Ratio & Units', detent: 'full' }); }
      ),

      /* Tile 4: GRIND SETTING */
      makeHeroRecipeTile(
        'Grind Setting',
        'grind',
        dom('b', { class: 'bt-spec-primary is-compact', text: grindPrimary }),
        grindSecondary,
        function () { openSheet('tune-recipe', { tab: 'grind' }, { title: 'Tune Grinder Clicks & 2-Pt Calibration', detent: 'full' }); }
      ),

      /* Tile 5: WATER TEMP */
      makeHeroRecipeTile(
        'Water Temp',
        'temp',
        dom('b', { class: 'bt-spec-primary' }, String(tempValShown), dom('small', { text: ' °' + tempUnit })),
        isPhilips && phSnap.drink.iced ? (tempAltShown + ' · Auto Cool Pulse') : (tempAltShown + (a.brew.tempComp ? ' · Keep Extraction Steady' : '')),
        function () { openSheet('tune-recipe', { tab: 'temp' }, { title: 'Water Temp & Keep Extraction Steady', detent: 'half' }); }
      ),

      /* Tile 6: TARGET TIME */
      makeHeroRecipeTile(
        'Target Time',
        'time',
        dom('b', { class: 'bt-spec-primary', text: timePrimary }),
        timeSecondary,
        function () { openScienceWhySheet('time'); },
        true
      )
    );

    var heroScienceBtn = dom('button', {
      type: 'button',
      class: 'bt-recipe-science-hero-btn',
      id: 'bt-recipe-science-why-btn',
      'data-science-why': 'all',
      onclick: function () { openScienceWhySheet('all'); }
    },
      dom('span', { class: 'bt-recipe-science-hero-lhs' },
        ico('xray-loupe', 17),
        dom('span', { class: 'bt-recipe-science-hero-copy' },
          dom('b', { text: 'Why These Numbers? (Show the Science)' }),
          dom('span', { text: 'Step-by-step physics for your temp, grind, ratio, roast age & water' })
        )
      ),
      dom('span', { class: 'bt-recipe-science-hero-cta', text: '6 Breakdowns \u2192' })
    );

    /* 3. Single-Row Action Pills (NO multi-line wrapping!) */
    var stylePills = getSubModesFor(rec.method.key).slice(0, 3);
    var actionStrip = dom('div', { class: 'bt-action-row-1line', role: 'toolbar', 'aria-label': 'Recipe Quick Actions' },
      roasterGuide ? dom('button', {
        type: 'button',
        class: 'bt-chip-v6 bt-chip-accent is-active',
        onclick: function () {
          if (roasterGuide.dose_g > 0) a.brew.dose = +roasterGuide.dose_g;
          if (roasterGuide.water_g > 0) a.brew.water = +roasterGuide.water_g;
          if (roasterGuide.ratio > 0) a.brew.ratio = +roasterGuide.ratio;
          else if (a.brew.dose > 0 && a.brew.water > 0) a.brew.ratio = +(a.brew.water / a.brew.dose).toFixed(1);
          if (roasterGuide.temp_c > 0) a.brew.tempC = +roasterGuide.temp_c;
          else if (roasterGuide.temp_f > 0) a.brew.tempC = Math.round(((+roasterGuide.temp_f - 32) * 5 / 9) * 2) / 2;
          a.brew.customizedNote = 'Roaster Guide (' + a.brew.dose + 'g : ' + a.brew.water + 'g @ ' + a.brew.tempC + ' °C)';
          haptic('celebrate');
          saveDraft();
          showToast('Applied Published Roaster Brew Guide!');
          rerender();
        }
      }, ico('spark-star', 15), dom('span', { text: 'Use Roaster Guide' })) : null,
      stylePills.map(function (sp) {
        var on = (a.brew.style || stylePills[0].id) === sp.id;
        return dom('button', {
          type: 'button',
          class: 'bt-chip-v6' + (on ? ' is-active' : ''),
          'aria-pressed': String(on),
          text: sp.label,
          onclick: function () {
            a.brew.style = sp.id;
            synthesizeScienceIntoApp(a, rec.method.key, { force: true });
            haptic('tick');
            saveDraft();
            rerender();
          }
        });
      }),
      dom('button', {
        type: 'button',
        class: 'bt-chip-v6 bt-chip-soft',
        'data-bt-step3-water-btn': '1',
        onclick: function () { openSheet('water-quick-pick', {}, { title: 'Select Brew Water Profile', detent: 'full' }); }
      }, ico('droplet', 15), dom('span', {
        text: (function () {
          var wCur = resolveActiveWaterObj(a);
          var wCfg = getActiveWaterConfig(a);
          return 'Water: ' + (wCur.short || wCur.label) + ' (' + wCfg.gh + ' GH · ' + wCfg.kh + ' KH)';
        })()
      })),
      dom('button', {
        type: 'button',
        class: 'bt-chip-v6 bt-chip-soft',
        onclick: function () { openSheet('brew-twin', {}, { title: 'Brew Twin Cross-Brewer Translator', detent: 'half' }); }
      }, ico('brew-twin', 15), dom('span', { text: 'Brew Twin (Switch Brewer)' })),
      dom('button', {
        type: 'button',
        class: 'bt-chip-v6 bt-chip-soft',
        onclick: function () { openSheet('share-qr-passport', {}, { title: 'Share QR Recipe Passport', detent: 'full' }); }
      }, ico('qr-passport', 15), dom('span', { text: 'Share QR Passport' }))
    );

    /* 4. Kettle Fill Banner */
    var kettleBanner = (!isPhilips && rec.method.key !== 'cold' && rec.method.key !== 'cold_drip')
      ? dom('div', { class: 'bt-kettle-banner' },
          dom('span', null,
            ico('kettle-gooseneck', 16), ' Heat in kettle: ',
            dom('b', { class: 'bt-num', text: rec.kettleG + ' g' }),
            ' (includes ' + (rec.usesPaper ? 'paper rinse + ' : '') + 'thermal stability margin)'
          ),
          lens === 'scientist' ? dom('span', { class: 'bt-badge-v62 is-sci', text: 'Smrke CO2 · Darcy' }) : null
        )
      : null;

    stageEl.appendChild(dom('section', { class: 'bt-card-v6 bt-card-hero' },
      tiles6,
      heroScienceBtn,
      actionStrip,
      kettleBanner
    ));

    /* 5. Smart Machine Native Consoles when selected */
    if (isPhilips) {
      stageEl.appendChild(buildPhilips5500ConsoleCard(a, function () { saveDraft(); rerender(); }));
      stageEl.appendChild(buildStickyCtaBar({
        id: 'bt-philips-finish-cta',
        copper: true,
        label: 'Log Philips Brew & Rate This Cup \u2192',
        sub: phSnap.drink.label + ' · ' + phSnap.doseG + ' g · ' + phSnap.totalMl + ' mL · ' + (tempUnit === 'F' ? phSnap.tempF + ' °F' : phSnap.tempC + ' °C'),
        secondaryLabel: 'Timer',
        secondaryIcon: 'clock',
        onSecondary: function () { AudioCoach.unlock(); goBrewStep('timer'); },
        onClick: function () {
          var finalSnap = computePhilipsSnap(a);
          a.attempt = (a.attempt || 0) + 1;
          a.cupBrew = {
            method: 'Philips 5500 LatteGo',
            key: 'philips5500',
            machine: true,
            style: finalSnap.drink.v,
            dose: finalSnap.doseG,
            water: finalSnap.totalMl,
            ratio: a.brew.ratio,
            temp_c: finalSnap.tempC,
            temp_f: finalSnap.tempF,
            grind_um: finalSnap.grindUm,
            grind_setting: a.brew.grind_setting,
            time_s: finalSnap.timeS,
            actual_s: finalSnap.timeS,
            actualSecs: finalSnap.timeS,
            out_g: finalSnap.totalMl,
            yield_g: finalSnap.totalMl,
            attempt: a.attempt
          };
          getCupState().brewFinishedAtMs = Date.now();
          if (a.brew.machine && a.brew.machine.sasRemaining > 0) a.brew.machine.sasRemaining--;
          saveDraft();
          haptic('celebrate');
          goBrewStep('taste');
        }
      }));
      return;
    }

    if (rec.method.key === 'aiden') {
      stageEl.appendChild(buildFellowAidenConsoleCard(a, rec, function () { saveDraft(); rerender(); }));
    } else if (rec.method.key === 'xbloom') {
      stageEl.appendChild(buildXBloomConsoleCard(a, rec, function () { saveDraft(); rerender(); }));
    }

    /* 6. Plain-English Pour Schedule List */
    stageEl.appendChild(dom('section', { class: 'bt-card-v6' },
      dom('div', { class: 'bt-card-hd' },
        dom('span', { class: 'bt-kicker', text: 'Plain-English Pour Schedule' }),
        dom('span', { style: 'font-size:0.74rem;color:var(--ink-muted)', text: rec.steps.length + ' guided steps' })
      ),
      dom('div', { class: 'bt-pour-schedule' },
        rec.steps.map(function (s) {
          return dom('div', { class: 'bt-pour-row' },
            dom('span', { class: 'bt-pour-time', text: fmtClock(s.t, false) }),
            dom('div', { style: 'min-width:0' },
              dom('b', { style: 'font-size:0.86rem;display:block;color:var(--ink)', text: s.title }),
              dom('span', { style: 'font-size:0.78rem;color:var(--ink-secondary);line-height:1.36;display:block', text: s.human }),
              lens === 'scientist' && s.scientist ? dom('span', { style: 'font-size:0.71rem;color:var(--science);display:block;margin-top:2px', text: s.scientist }) : null
            ),
            dom('span', { class: 'bt-pour-gram', text: s.targetG + ' g' })
          );
        })
      )
    ));

    /* 7. Sticky Thumb-Zone CTA -> Unlock BTTimerAudio synchronously & go to Step 4 Timer */
    stageEl.appendChild(buildStickyCtaBar({
      id: 'bt-recipe-start-timer-cta',
      label: 'Start Guided Brew Timer \u2192',
      sub: fmtClock(rec.totalSecs, false) + ' · Audible Voice & 3-2-1 Chimes',
      secondaryLabel: 'Skip \u2192 Taste',
      onSecondary: function () {
        recordFinishedCupBrew(a, rec, rec.totalSecs, rec.yieldMl, false);
        goBrewStep('taste');
      },
      onClick: function () {
        AudioCoach.unlock();
        haptic('snap');
        goBrewStep('timer');
      }
    }));
  }

  /* ==================== 9. STEP 4: AUDIBLE & SPOKEN KITCHEN CHRONOGRAPH ('timer') ==================== */
  var _timerSession = {
    brewSig: '',
    running: false,
    stopped: false,
    actualStoppedS: null,
    elapsedS: 0,
    lastTs: 0,
    rafId: 0,
    bleUnsub: null,
    scaleConnected: false,
    realScaleConnected: false,
    simOn: false,
    armedZero: false,
    zeroFrames: 0,
    liveWeightG: 0,
    prevSimG: 0,
    prevBleG: 0,
    prevBleTs: 0,
    emaFlowGs: 0,
    maxPourWeightG: 0,
    lockedYieldG: null,
    flowGs: 0,
    pressureBar: 0,
    waves: { thetaA: 0, thetaS: 0, thetaB: 0 },
    lastStepIdx: -1,
    lastPipKey: '',
    midSpoken: {},
    finishFired: false,
    lastAudioNote: 'Voice + 880 Hz Chimes ready \u2014 tap Test Sound or Start'
  };

  function requestTimerWakeLock(on) {
    try {
      var plat = (typeof window !== 'undefined' && window.BTPlatform) ? window.BTPlatform : null;
      if (!plat || !plat.keepAwake) return;
      if (on && typeof plat.keepAwake.request === 'function') plat.keepAwake.request('brew-timer');
      else if (!on && typeof plat.keepAwake.release === 'function') plat.keepAwake.release();
    } catch (_) {}
  }

  function isWakeLockActive() {
    try {
      var plat = (typeof window !== 'undefined' && window.BTPlatform) ? window.BTPlatform : null;
      if (plat && plat.keepAwake && typeof plat.keepAwake.isActive === 'function') return !!plat.keepAwake.isActive();
    } catch (_) {}
    return _timerSession.running;
  }

  var _rafSeq = 1;
  var _rafMap = {};

  function _raf(fn) {
    var id = ++_rafSeq;
    var fired = false;
    var entry = { rId: 0, tId: 0 };
    _rafMap[id] = entry;
    function runOnce(ts) {
      if (fired || !_rafMap[id]) return;
      fired = true;
      delete _rafMap[id];
      if (entry.rId && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(entry.rId);
      if (entry.tId && typeof clearTimeout === 'function') clearTimeout(entry.tId);
      var nowVal = (typeof ts === 'number' && isFinite(ts))
        ? ts
        : ((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now());
      fn(nowVal);
    }
    if (typeof requestAnimationFrame === 'function') {
      entry.rId = requestAnimationFrame(runOnce);
    }
    if (typeof setTimeout === 'function') {
      entry.tId = setTimeout(function () {
        runOnce((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now());
      }, 65);
    }
    return id;
  }

  function _caf(id) {
    var entry = _rafMap[id];
    if (entry) {
      delete _rafMap[id];
      if (entry.rId && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(entry.rId);
      if (entry.tId && typeof clearTimeout === 'function') clearTimeout(entry.tId);
      return;
    }
    if (typeof cancelAnimationFrame === 'function') { cancelAnimationFrame(id); return; }
    if (typeof clearTimeout === 'function') clearTimeout(id);
  }

  function stopActiveTimerSession(resetClock) {
    _timerSession.running = false;
    if (_timerSession.rafId) {
      _caf(_timerSession.rafId);
      _timerSession.rafId = 0;
    }
    if (_timerSession.bleUnsub) {
      try { _timerSession.bleUnsub(); } catch (_) {}
      _timerSession.bleUnsub = null;
    }
    requestTimerWakeLock(false);
    if (resetClock) {
      _timerSession.stopped = false;
      _timerSession.actualStoppedS = null;
      _timerSession.elapsedS = 0;
      _timerSession.lastStepIdx = -1;
      _timerSession.lastPipKey = '';
      _timerSession.midSpoken = {};
      _timerSession.finishFired = false;
      _timerSession.liveWeightG = 0;
      _timerSession.prevSimG = 0;
      _timerSession.prevBleG = 0;
      _timerSession.prevBleTs = 0;
      _timerSession.emaFlowGs = 0;
      _timerSession.flowGs = 0;
      _timerSession.maxPourWeightG = 0;
      _timerSession.lockedYieldG = null;
      _timerSession.waves = { thetaA: 0, thetaS: 0, thetaB: 0 };
      if (_timerSession.simOn) {
        try {
          var ble = (typeof window !== 'undefined' && window.BTBle) ? window.BTBle : null;
          if (ble && typeof ble.stopScaleSimulation === 'function') ble.stopScaleSimulation();
          else if (ble && typeof ble.stopSimulator === 'function') ble.stopSimulator();
        } catch (_) {}
        _timerSession.simOn = false;
      }
    }
  }

  function computeGhostTargetAt(elapsedS, rec, bestLockedBrew) {
    var steps = rec.steps || [];
    if (!steps.length) return 0;
    var timeScale = 1.0;
    if (bestLockedBrew && +bestLockedBrew.time_s > 15 && rec.totalSecs > 15) {
      timeScale = Math.max(0.75, Math.min(1.3, (+bestLockedBrew.time_s) / rec.totalSecs));
    }
    var adjEl = elapsedS / timeScale;
    var prevG = 0;
    for (var i = 0; i < steps.length; i++) {
      var st = steps[i];
      var s0 = st.t || 0;
      var s1 = Math.max(s0 + 4, st.endS || (s0 + 30));
      var tgt = st.targetG != null ? +st.targetG : rec.hotPourG;
      if (adjEl <= s0) return prevG;
      if (adjEl < s1) {
        var pourWindow = (st.pourEndS != null && st.pourEndS > s0 + 2 && st.pourEndS < s1)
          ? (st.pourEndS - s0)
          : Math.max(4, (s1 - s0) * 0.65);
        var frac = Math.min(1, (adjEl - s0) / pourWindow);
        return +(prevG + (tgt - prevG) * frac).toFixed(1);
      }
      prevG = tgt;
    }
    return rec.hotPourG;
  }

  function computeTargetStepFlow(elS, curSt, curIdx, steps, rec, totalTargetS) {
    if (!curSt) return { rate: 0, label: '0.0 g/s · Draining' };
    if (elS >= totalTargetS) {
      return { rate: 0, label: '0.0 g/s · Overtime Draining' };
    }
    if (rec.method && rec.method.outRatio) {
      var espGs = Math.max(0.6, Math.min(3.5, rec.waterG / Math.max(12, totalTargetS)));
      return { rate: +espGs.toFixed(1), label: 'Aim ~' + espGs.toFixed(1) + ' g/s' };
    }
    var s0 = curSt.t || 0;
    var s1 = Math.max(s0 + 4, curSt.endS || totalTargetS);
    var prevG = curSt.startG != null
      ? +curSt.startG
      : (curIdx > 0 && steps[curIdx - 1] ? (+steps[curIdx - 1].targetG || 0) : 0);
    var tgtG = curSt.targetG != null ? +curSt.targetG : rec.hotPourG;
    var deltaG = Math.max(0, tgtG - prevG);
    if (deltaG <= 0.5) {
      var waitTag = /bloom/i.test(curSt.title || '') ? 'Bloom Rest' : (/steep|wait/i.test(curSt.title || '') ? 'Steeping' : 'Draining');
      return { rate: 0, label: '0.0 g/s · ' + waitTag };
    }
    var pourWin = (curSt.pourEndS != null && curSt.pourEndS > s0 + 2 && curSt.pourEndS < s1)
      ? (curSt.pourEndS - s0)
      : Math.max(5, (s1 - s0) * 0.65);
    if (elS <= s0 + pourWin) {
      var aim = curSt.targetFlowGs > 0 ? +curSt.targetFlowGs : Math.min(6.5, Math.max(1.8, deltaG / Math.max(4, pourWin)));
      return { rate: +aim.toFixed(1), label: 'Aim ~' + aim.toFixed(1) + ' g/s' };
    }
    return {
      rate: 0,
      label: curIdx === 0 ? '0.0 g/s · Bloom Rest' : '0.0 g/s · Draining'
    };
  }

  function recordFinishedCupBrew(a, rec, actualSecs, yieldOutG, fromTimer) {
    var secs = Math.max(1, Math.round(+actualSecs || rec.totalSecs));
    var pouredW = _timerSession.maxPourWeightG > 25 ? Math.round(_timerSession.maxPourWeightG * 10) / 10 : rec.waterG;
    var finalYield = yieldOutG > 10 ? Math.round(yieldOutG * 10) / 10 : rec.yieldMl;
    a.brew.actualSecs = secs;
    a.brew.actualFromTimer = !!fromTimer;
    a.brew.yieldOut = finalYield;
    a.attempt = (a.attempt || 0) + 1;
    a.cupBrew = {
      method: rec.method.label,
      key: rec.method.key,
      style: a.brew.style || 'standard',
      brew_style: a.brew.style || 'standard',
      dose: rec.doseG,
      water: pouredW,
      ratio: rec.ratio,
      temp_c: rec.tempC,
      temp_f: rec.tempF,
      grind_um: rec.d50Um,
      grind_setting: rec.grindMap.short,
      time_s: rec.totalSecs,
      actual_s: secs,
      actualSecs: secs,
      out_g: finalYield,
      yield_g: finalYield,
      attempt: a.attempt,
      waves3: Object.assign({}, _timerSession.waves)
    };
    getCupState().brewFinishedAtMs = Date.now();
    try {
      if (typeof window !== 'undefined' && window.BTStorage && typeof window.BTStorage.deductBagGrams === 'function' && rec.doseG > 0 && a.coffee && a.coffee.name) {
        var undoFn = window.BTStorage.deductBagGrams(a.coffee, rec.doseG, { silent: true });
        if (undoFn) {
          a.cupBrew._bagDeducted = true;
          showToast('Logged brew (' + fmtClock(secs, false) + ') & deducted ' + rec.doseG + ' g', { actionLabel: 'Undo', onAction: function () { a.cupBrew._bagDeducted = false; return undoFn(); } });
        }
      }
    } catch (_) {}
    saveDraft();
  }

  function renderStep4Timer(stageEl, a) {
    ensureBrewState(a);
    var rec = runCurrentSynthesis(a);
    var curBrewSig = [
      (a.coffee && a.coffee.id) || '',
      (a.coffee && a.coffee.roaster) || '',
      (a.coffee && a.coffee.name) || '',
      rec.method.key || '',
      rec.doseG || '',
      rec.waterG || '',
      a.attempt || 0
    ].join('::');
    /* Never carry over a stopped/paused 'Resume' state into a fresh coffee, different brewer, or new attempt! */
    if (!_timerSession.running && _timerSession.brewSig && _timerSession.brewSig !== curBrewSig) {
      stopActiveTimerSession(true);
    }
    _timerSession.brewSig = curBrewSig;
    var totalTargetS = Math.max(15, rec.totalSecs > 3600 ? 180 : rec.totalSecs);
    var steps = rec.steps || [];
    var simRecipeOpts = {
      mode: 'brew',
      method: rec.method.key,
      isEspresso: !!rec.method.outRatio,
      doseG: rec.doseG,
      targetWaterG: rec.hotPourG,
      totalSecs: totalTargetS,
      steps: steps
    };

    /* Look up Ghost Pacer from best locked brew of this bag */
    var vaultList = getSavedVaultCoffees();
    var bagHit = (a.coffee && a.coffee.name)
      ? vaultList.find(function (v) { return String(v.name || '').toLowerCase() === String(a.coffee.name || '').toLowerCase(); })
      : null;
    var bestLockedBrew = bagHit ? (bagHit.lockedBrew || bagHit.bestBrew || null) : null;

    var container = dom('div', { class: 'bt-timer-stage-v62', id: 'bt-step4-timer' });
    var tac = (typeof window !== 'undefined' && window.BTTactile) ? window.BTTactile : null;
    var winW = (typeof window !== 'undefined' && window.innerWidth) ? window.innerWidth : 390;
    var winH = (typeof window !== 'undefined' && window.innerHeight) ? window.innerHeight : 844;

    a.prefs = a.prefs || {};
    if (!a.prefs.timerCollapsed || typeof a.prefs.timerCollapsed !== 'object') {
      a.prefs.timerCollapsed = {};
    }
    var tcPref = a.prefs.timerCollapsed;
    var isAudioCollapsed = tcPref.audio !== undefined ? !!tcPref.audio : true;
    var isWavesCollapsed = tcPref.waves !== undefined ? !!tcPref.waves : false;
    var isActiveStepCollapsed = tcPref.activeStep !== undefined ? !!tcPref.activeStep : false;
    var isAllStepsCollapsed = tcPref.allSteps !== undefined ? !!tcPref.allSteps : (winW < 640);

    function persistTimerCollapse(key, nextVal) {
      a.prefs.timerCollapsed = a.prefs.timerCollapsed || {};
      a.prefs.timerCollapsed[key] = !!nextVal;
      saveDraft();
    }

    /* 1. Collapsible Sound, Voice & Scale Card (#bt-timer-audio-card — compact 1-line summary by default) */
    var curAudioMode = AudioCoach.mode();
    var audioMetaMap = {
      voice:  { full: 'Voice + Chimes', short: 'Voice',  ico: 'voice-sound' },
      chimes: { full: 'Chimes + 3-2-1', short: 'Chimes', ico: 'bell' },
      silent: { full: 'Silent',         short: 'Silent', ico: 'volume-mute' }
    };
    var curAudioMeta = audioMetaMap[curAudioMode] || audioMetaMap.voice;
    var wakeBadgeTxt = dom('span', { text: isWakeLockActive() ? 'Wake ON' : 'Wake' });
    var flowPillTxt = dom('span', { text: 'Aim ~3.2 g/s' });
    var flowPillEl = dom('span', { class: 'bt-flow-rate-pill is-idle', id: 'bt-timer-flow-pill' }, ico('droplet', 12), flowPillTxt);
    var demoScaleTxt = dom('span', { text: _timerSession.simOn ? 'Demo Scale ON' : 'Demo Scale' });
    var demoScaleBtn = dom('button', {
      type: 'button',
      class: 'bt-demo-scale-btn' + (_timerSession.simOn ? ' is-active' : ''),
      id: 'bt-timer-demo-scale-btn',
      'aria-pressed': String(!!_timerSession.simOn),
      title: 'Simulate live Bluetooth scale pour rate (g/s)',
      onclick: function (ev) {
        if (ev && typeof ev.stopPropagation === 'function') ev.stopPropagation();
        AudioCoach.unlock();
        var bleRef = (typeof window !== 'undefined' && window.BTBle) ? window.BTBle : null;
        _timerSession.simOn = !_timerSession.simOn;
        _timerSession.prevSimG = _timerSession.liveWeightG || 0;
        _timerSession.emaFlowGs = 0;
        if (_timerSession.simOn) {
          if (bleRef && typeof bleRef.startScaleSimulation === 'function') {
            bleRef.startScaleSimulation(simRecipeOpts);
          } else if (bleRef && typeof bleRef.startSimulator === 'function') {
            bleRef.startSimulator({ targetWaterG: rec.hotPourG });
          }
          if (!_timerSession.running && !_timerSession.stopped && _timerSession.elapsedS === 0) {
            toggleStartPause();
            return;
          }
        } else {
          _timerSession.flowGs = 0;
          if (bleRef && typeof bleRef.stopScaleSimulation === 'function') bleRef.stopScaleSimulation();
          else if (bleRef && typeof bleRef.stopSimulator === 'function') bleRef.stopSimulator();
        }
        haptic('tick');
        syncTimerDom();
      }
    }, ico('ble-wave', 12), demoScaleTxt);

    var audioChevronEl = dom('span', { class: 'bt-collapse-chev', text: isAudioCollapsed ? '\u25BE' : '\u25B4' });
    var audioToggleLblEl = dom('span', {
      class: 'bt-timer-audio-sum-txt',
      text: (winW < 540 ? curAudioMeta.short : curAudioMeta.full) + ' · Sound'
    });
    var audioToggleBtn = dom('button', {
      type: 'button',
      class: 'bt-timer-audio-toggle',
      id: 'bt-timer-audio-toggle',
      'data-timer-collapse': 'audio',
      'aria-expanded': String(!isAudioCollapsed),
      'aria-controls': 'bt-timer-audio-body',
      onclick: function () {
        isAudioCollapsed = !isAudioCollapsed;
        persistTimerCollapse('audio', isAudioCollapsed);
        audioBar.classList.toggle('is-collapsed', isAudioCollapsed);
        audioBodyEl.hidden = isAudioCollapsed;
        audioToggleBtn.setAttribute('aria-expanded', String(!isAudioCollapsed));
        audioChevronEl.textContent = isAudioCollapsed ? '\u25BE' : '\u25B4';
        haptic('tick');
      }
    }, ico(curAudioMeta.ico, 14), audioToggleLblEl, audioChevronEl);

    var audioNoteEl = dom('span', { class: 'bt-timer-audio-note', text: _timerSession.lastAudioNote || 'Ready' });
    var audioBodyEl = dom('div', {
      class: 'bt-timer-audio-body',
      id: 'bt-timer-audio-body',
      hidden: isAudioCollapsed
    },
      dom('div', { class: 'bt-seg-bar', role: 'group', 'aria-label': 'Kitchen Timer Audio Mode' },
        [
          ['voice',  'Voice + Chimes', 'voice-sound'],
          ['chimes', 'Chimes + 3-2-1', 'bell'],
          ['silent', 'Silent',         'volume-mute']
        ].map(function (m) {
          var active = curAudioMode === m[0];
          return dom('button', {
            type: 'button',
            'aria-pressed': String(active),
            onclick: function () {
              AudioCoach.unlock();
              AudioCoach.setMode(m[0]);
              if (m[0] !== 'silent') AudioCoach.playStepChime();
              _timerSession.lastAudioNote = m[1] + ' active';
              rerender();
            }
          }, ico(m[2], 14), dom('span', { text: m[1] }));
        })
      ),
      dom('div', { class: 'bt-timer-status-row' },
        dom('div', { class: 'bt-timer-status-lhs' },
          dom('span', { class: 'bt-badge-v62 ' + (_timerSession.running ? 'is-good' : 'is-muted') }, ico('sun-light', 11), wakeBadgeTxt),
          audioNoteEl
        ),
        dom('button', {
          type: 'button',
          class: 'bt-test-sound-btn',
          id: 'bt-timer-test-sound-btn',
          title: 'Test Sound',
          onclick: function () {
            AudioCoach.testSound();
            _timerSession.lastAudioNote = 'Sound verified (880+1318 Hz chime' + (AudioCoach.mode() === 'voice' ? ' + speech' : '') + ')';
            audioNoteEl.textContent = _timerSession.lastAudioNote;
            showToast('Timer audio verified \u2014 ready to pour!');
            syncTimerDom();
          }
        }, ico('voice-sound', 13), dom('span', { text: 'Test Sound' }))
      )
    );

    var audioBar = dom('div', {
      class: 'bt-timer-audio-card bt-audio-bar' + (isAudioCollapsed ? ' is-collapsed' : ''),
      id: 'bt-timer-audio-card'
    },
      dom('div', { class: 'bt-timer-audio-head' },
        audioToggleBtn,
        dom('div', { class: 'bt-timer-audio-pills' },
          flowPillEl,
          demoScaleBtn
        )
      ),
      audioBodyEl
    );
    container.appendChild(audioBar);

    /* 2. GIANT Kitchen-Counter Clock Readout (#bt-timer-giant-clock) + Enlarged BTChronoDial (168px mobile / 204px desktop) */
    var initElapsedS = _timerSession.stopped && _timerSession.actualStoppedS != null ? _timerSession.actualStoppedS : _timerSession.elapsedS;
    var giantClockEl = dom('div', {
      class: 'bt-timer-giant-clock bt-num',
      id: 'bt-timer-giant-clock',
      text: fmtClock(initElapsedS, true)
    });
    var giantPhaseEl = dom('div', {
      class: 'bt-timer-giant-phase',
      id: 'bt-timer-giant-phase',
      text: (steps[0] && steps[0].title) || 'Ready to Pour'
    });
    var giantWeightEl = dom('div', {
      class: 'bt-timer-giant-weight bt-num',
      id: 'bt-timer-giant-weight',
      text: '0 / ' + rec.hotPourG + ' g · ' + fmtClock(totalTargetS, false)
    });
    var giantFlowEl = dom('span', {
      class: 'bt-timer-giant-flow bt-num',
      id: 'bt-timer-giant-flow',
      text: 'Aim ~3.2 g/s'
    });
    var giantHeroEl = dom('div', { class: 'bt-timer-giant-hero', id: 'bt-timer-giant-hero' },
      giantClockEl,
      dom('div', { class: 'bt-timer-giant-meta' },
        giantPhaseEl,
        giantWeightEl,
        giantFlowEl
      )
    );

    var dialPhases = steps.map(function (s) {
      return { label: s.title, startS: s.t, endS: s.endS, waterG: s.targetG };
    });
    var dialSizePx = winW < 640 ? 168 : 204;
    var chronoNode = (tac && typeof tac.BTChronoDial === 'function')
      ? tac.BTChronoDial({
          size: dialSizePx,
          compact: true,
          hideLegend: (winW < 640 || winH <= 920),
          mode: 'brew',
          isEspresso: !!rec.method.outRatio,
          elapsedS: initElapsedS,
          totalTargetS: totalTargetS,
          targetWaterG: rec.hotPourG,
          phases: dialPhases,
          waves: _timerSession.waves
        })
      : dom('div', { class: 'bt-num', style: 'font-size:2.85rem;font-weight:800;padding:16px 0', text: fmtClock(initElapsedS, true) });

    var overtimeBadgeEl = dom('div', {
      class: 'bt-timer-overtime-badge',
      id: 'bt-timer-overtime-badge',
      hidden: true
    });

    /* 2B. Collapsible Live 3-Line Extraction Wave Graph (#bt-timer-waves-card) */
    var wavesNode = (tac && typeof tac.BTExtractionWavesLive === 'function')
      ? tac.BTExtractionWavesLive({
          title: '3-Wave Live Extraction',
          elapsedS: initElapsedS,
          totalTargetS: totalTargetS,
          tempC: rec.tempC,
          roast: (a.coffee && a.coffee.roast) || 'medium-light',
          isPaused: !_timerSession.running,
          stopped: !!_timerSession.stopped
        })
      : null;
    if (wavesNode && wavesNode.querySelectorAll) {
      var legSpans = wavesNode.querySelectorAll('.bt-ext-waves-leg-pill > span');
      if (legSpans[0]) legSpans[0].textContent = '1. Bright Acids';
      if (legSpans[1]) legSpans[1].textContent = '2. Sweet Sugars & Body';
      if (legSpans[2]) legSpans[2].textContent = '3. Late Bitters';
    }
    var wavesCard = wavesNode
      ? dom('div', { class: 'bt-timer-waves-card' + (isWavesCollapsed ? ' is-collapsed' : ''), id: 'bt-timer-waves-card' }, wavesNode)
      : null;
    if (wavesNode && wavesCard) {
      var waveHeadEl = wavesNode.querySelector ? wavesNode.querySelector('.bt-ext-waves-head') : null;
      var waveSvgNode = wavesNode.querySelector ? wavesNode.querySelector('.bt-ext-waves-svg') : null;
      var waveLegNode = wavesNode.querySelector ? wavesNode.querySelector('.bt-ext-waves-legend') : null;
      var wavesToggleBtn = dom('button', {
        type: 'button',
        class: 'bt-card-collapse-btn',
        id: 'bt-timer-waves-toggle',
        'data-timer-collapse': 'waves',
        'aria-expanded': String(!isWavesCollapsed),
        text: isWavesCollapsed ? '\u25B8 Show' : '\u25BE Hide',
        onclick: function (ev) {
          if (ev && typeof ev.stopPropagation === 'function') ev.stopPropagation();
          toggleWavesCard();
        }
      });
      function syncWavesCollapseUi() {
        wavesCard.classList.toggle('is-collapsed', isWavesCollapsed);
        wavesToggleBtn.setAttribute('aria-expanded', String(!isWavesCollapsed));
        wavesToggleBtn.textContent = isWavesCollapsed ? '\u25B8 Show' : '\u25BE Hide';
        if (waveSvgNode && waveSvgNode.style) waveSvgNode.style.display = isWavesCollapsed ? 'none' : '';
        if (waveLegNode) waveLegNode.hidden = isWavesCollapsed;
      }
      function toggleWavesCard() {
        isWavesCollapsed = !isWavesCollapsed;
        persistTimerCollapse('waves', isWavesCollapsed);
        syncWavesCollapseUi();
        haptic('tick');
      }
      if (waveHeadEl) {
        waveHeadEl.style.cursor = 'pointer';
        waveHeadEl.addEventListener('click', function () { toggleWavesCard(); });
        waveHeadEl.appendChild(wavesToggleBtn);
      }
      syncWavesCollapseUi();
    }

    /* 3. Collapsible High-Contrast Current Step Guide (#bt-timer-active-step) */
    var stepKickerEl = dom('span', { style: 'font-size:0.68rem;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;color:var(--primary)' });
    var stepCollapsedSumEl = dom('span', { class: 'bt-active-step-collapsed-sum', hidden: !isActiveStepCollapsed });
    var stepTargetEl = dom('span', { class: 'bt-active-step-target' });
    var stepTitleEl = dom('div', { class: 'bt-active-step-title' });
    var stepSayEl = dom('div', { class: 'bt-active-step-say' });
    var stepNextNameEl = dom('span', null);
    var stepCountdownEl = dom('span', { class: 'bt-num', style: 'color:var(--accent)' });

    var activeStepBodyEl = dom('div', {
      class: 'bt-active-step-body',
      id: 'bt-timer-active-step-body',
      hidden: isActiveStepCollapsed
    },
      stepTitleEl,
      stepSayEl,
      dom('div', { class: 'bt-active-step-upnext' }, stepNextNameEl, stepCountdownEl)
    );

    var activeStepToggleBtn = dom('button', {
      type: 'button',
      class: 'bt-card-collapse-btn',
      id: 'bt-timer-active-step-toggle',
      'data-timer-collapse': 'activeStep',
      'aria-expanded': String(!isActiveStepCollapsed),
      'aria-controls': 'bt-timer-active-step-body',
      text: isActiveStepCollapsed ? '\u25B8 Show' : '\u25BE Hide',
      onclick: function (ev) {
        if (ev && typeof ev.stopPropagation === 'function') ev.stopPropagation();
        toggleActiveStepCard();
      }
    });

    function toggleActiveStepCard() {
      isActiveStepCollapsed = !isActiveStepCollapsed;
      persistTimerCollapse('activeStep', isActiveStepCollapsed);
      activeStepCard.classList.toggle('is-collapsed', isActiveStepCollapsed);
      activeStepBodyEl.hidden = isActiveStepCollapsed;
      stepCollapsedSumEl.hidden = !isActiveStepCollapsed;
      activeStepToggleBtn.setAttribute('aria-expanded', String(!isActiveStepCollapsed));
      activeStepToggleBtn.textContent = isActiveStepCollapsed ? '\u25B8 Show' : '\u25BE Hide';
      haptic('tick');
    }

    var activeStepCard = dom('div', {
      class: 'bt-active-step-card' + (isActiveStepCollapsed ? ' is-collapsed' : ''),
      id: 'bt-timer-active-step'
    },
      dom('div', {
        class: 'bt-active-step-top',
        style: 'cursor:pointer',
        onclick: function () { toggleActiveStepCard(); }
      },
        dom('span', { style: 'display:inline-flex;align-items:center;gap:5px;min-width:0;overflow:hidden' }, stepKickerEl, stepCollapsedSumEl),
        dom('span', { style: 'display:inline-flex;align-items:center;gap:6px;flex-shrink:0' }, stepTargetEl, activeStepToggleBtn)
      ),
      activeStepBodyEl
    );

    /* 3B. Post-Stop Actual Brew Time Locked Bar (-5s / -1s / +1s / +5s + Resume) */
    var lockedTitleEl = dom('span', { class: 'bt-timer-locked-title', id: 'bt-timer-locked-readout' });
    var lockedDeltaEl = dom('span', { class: 'bt-badge-v62 is-good', id: 'bt-timer-locked-delta' });
    function nudgeStoppedTime(deltaSec) {
      if (!_timerSession.stopped) return;
      var curA = _timerSession.actualStoppedS != null ? _timerSession.actualStoppedS : Math.max(1, Math.round(_timerSession.elapsedS));
      var nextA = Math.max(1, curA + deltaSec);
      _timerSession.actualStoppedS = nextA;
      _timerSession.elapsedS = nextA;
      a.brew.actualSecs = nextA;
      a.brew.actualFromTimer = true;
      saveDraft();
      haptic('tick');
      paintDynamicStickyBar();
      syncTimerDom();
    }
    var lockedBannerEl = dom('div', {
      class: 'bt-timer-locked-banner',
      id: 'bt-timer-locked-bar',
      hidden: !_timerSession.stopped
    },
      dom('div', { class: 'bt-timer-locked-top' },
        dom('div', null,
          dom('div', { style: 'font-size:0.67rem;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;color:var(--good)', text: 'Actual Brew Time Locked' }),
          lockedTitleEl
        ),
        lockedDeltaEl
      ),
      dom('div', { class: 'bt-timer-nudge-row', role: 'group', 'aria-label': 'Trim Locked Brew Time' },
        dom('div', { style: 'display:inline-flex;gap:5px;flex-wrap:wrap' },
          [-5, -1, 1, 5].map(function (dSec) {
            var lbl = (dSec > 0 ? '+' : '') + dSec + 's';
            return dom('button', {
              type: 'button',
              class: 'bt-timer-nudge-pill',
              'data-timer-trim': String(dSec),
              onclick: function () { nudgeStoppedTime(dSec); }
            }, dom('span', { text: lbl }));
          })
        ),
        dom('button', {
          type: 'button',
          class: 'bt-timer-nudge-pill',
          id: 'bt-timer-resume-from-stop-btn',
          style: 'color:var(--accent);border-color:var(--accent)',
          onclick: function () {
            _timerSession.stopped = false;
            _timerSession.actualStoppedS = null;
            toggleStartPause();
          }
        }, ico('play', 12), dom('span', { text: 'Resume' }))
      )
    );

    /* 4. Unmistakable Above-the-Fold Transport Controls (Start/Pause, ■ Stop Brew (Done), Next Step ->, +10s, Reset) */
    var runBtnIcoWrap = dom('span', { style: 'display:inline-flex;align-items:center' }, ico(_timerSession.running ? 'pause' : 'play', 16));
    var runBtnText = dom('span', { text: _timerSession.running ? 'Pause' : (_timerSession.elapsedS > 0 ? 'Resume' : 'Start') });
    var runBtn = dom('button', {
      type: 'button',
      class: 'bt-tctrl-btn ' + (_timerSession.running ? 'is-paused' : 'is-run'),
      id: 'bt-timer-start-pause-btn',
      onclick: function () { toggleStartPause(); }
    }, runBtnIcoWrap, runBtnText);

    var stopBtn = dom('button', {
      type: 'button',
      class: 'bt-tctrl-btn is-stop-brew',
      id: 'bt-timer-stop-btn',
      onclick: function () { stopBrewDone(); }
    }, ico('stop-square', 16), dom('span', { text: 'Stop Brew (Done)' }));

    var transportWrap = dom('div', { class: 'bt-timer-transport-wrap' },
      dom('div', { class: 'bt-timer-transport-grid' },
        runBtn,
        stopBtn
      ),
      dom('div', { class: 'bt-timer-transport-subrow' },
        dom('button', {
          type: 'button',
          class: 'bt-tctrl-btn',
          id: 'bt-timer-next-step-btn',
          onclick: function () {
            AudioCoach.unlock();
            var curI = currentStepIndex(_timerSession.elapsedS);
            if (curI + 1 < steps.length) {
              _timerSession.stopped = false;
              _timerSession.actualStoppedS = null;
              _timerSession.elapsedS = steps[curI + 1].t;
              _timerSession.lastStepIdx = curI;
              triggerStepCuesIfNeeded(curI + 1);
              if (!_timerSession.running) toggleStartPause();
              else syncTimerDom();
            } else {
              stopBrewDone();
            }
          }
        }, dom('span', { text: 'Next Step \u2192' })),
        dom('button', {
          type: 'button',
          class: 'bt-tctrl-btn bt-num',
          id: 'bt-timer-plus10-btn',
          title: 'Add 10 seconds to drawdown target',
          onclick: function () {
            AudioCoach.unlock();
            totalTargetS += 10;
            if (steps.length) steps[steps.length - 1].endS = totalTargetS;
            showToast('+10s added to drawdown target');
            syncTimerDom();
          }
        }, dom('span', { text: '+10s' })),
        dom('button', {
          type: 'button',
          class: 'bt-tctrl-btn',
          id: 'bt-timer-reset-btn',
          onclick: function () {
            stopActiveTimerSession(true);
            haptic('tick');
            rerender();
          }
        }, dom('span', { text: 'Reset' }))
      )
    );

    /* Above-the-fold order: Giant Clock + Dial + Pause/Stop Brew first, then 3-Wave & Active Step */
    var isMobileStage = winW < 640;
    container.appendChild(dom('section', { class: 'bt-timer-dial-card' },
      giantHeroEl,
      dom('div', { class: 'bt-timer-dial-wrap' }, chronoNode, overtimeBadgeEl),
      dom('div', { class: 'bt-timer-dial-rhs' },
        lockedBannerEl,
        transportWrap,
        isMobileStage ? wavesCard : null,
        activeStepCard
      )
    ));
    if (!isMobileStage && wavesCard) {
      container.appendChild(wavesCard);
    }

    /* 5. Dynamic Sticky Bottom Bar */
    var stickyHost = dom('div', { style: 'display:contents' });
    container.appendChild(stickyHost);

    /* 6. Collapsible All Pour Steps Jump Card (#bt-timer-steps-card — collapsed by default on <640px mobile) */
    var allStepsBodyEl = dom('div', {
      class: 'bt-pour-schedule',
      id: 'bt-timer-steps-body',
      hidden: isAllStepsCollapsed
    },
      steps.map(function (st, idx) {
        return dom('button', {
          type: 'button',
          class: 'bt-pour-row',
          style: 'text-align:left;width:100%',
          onclick: function () {
            AudioCoach.unlock();
            _timerSession.stopped = false;
            _timerSession.actualStoppedS = null;
            _timerSession.elapsedS = st.t;
            _timerSession.lastStepIdx = idx - 1;
            triggerStepCuesIfNeeded(idx);
            syncTimerDom();
          }
        },
          dom('span', { class: 'bt-pour-time', text: fmtClock(st.t, false) }),
          dom('span', { style: 'font-size:0.82rem;font-weight:700;color:var(--ink)', text: st.title }),
          dom('span', { class: 'bt-pour-gram', text: st.targetG + ' g' })
        );
      })
    );
    var allStepsToggleBtn = dom('button', {
      type: 'button',
      class: 'bt-card-collapse-btn',
      id: 'bt-timer-steps-toggle',
      'data-timer-collapse': 'allSteps',
      'aria-expanded': String(!isAllStepsCollapsed),
      'aria-controls': 'bt-timer-steps-body',
      text: isAllStepsCollapsed ? ('\u25B8 Show ' + steps.length + ' Steps') : '\u25BE Hide',
      onclick: function (ev) {
        if (ev && typeof ev.stopPropagation === 'function') ev.stopPropagation();
        toggleAllStepsCard();
      }
    });
    function toggleAllStepsCard() {
      isAllStepsCollapsed = !isAllStepsCollapsed;
      persistTimerCollapse('allSteps', isAllStepsCollapsed);
      allStepsCardEl.classList.toggle('is-collapsed', isAllStepsCollapsed);
      allStepsBodyEl.hidden = isAllStepsCollapsed;
      allStepsToggleBtn.setAttribute('aria-expanded', String(!isAllStepsCollapsed));
      allStepsToggleBtn.textContent = isAllStepsCollapsed ? ('\u25B8 Show ' + steps.length + ' Steps') : '\u25BE Hide';
      haptic('tick');
    }
    var allStepsCardEl = dom('section', {
      class: 'bt-card-v6 bt-timer-steps-card' + (isAllStepsCollapsed ? ' is-collapsed' : ''),
      id: 'bt-timer-steps-card',
      style: 'padding:10px 12px'
    },
      dom('div', {
        class: 'bt-card-hd',
        style: 'cursor:pointer;margin:0',
        onclick: function () { toggleAllStepsCard(); }
      },
        dom('span', { class: 'bt-kicker', text: 'All Pour Steps (' + steps.length + ') · Tap Phase to Jump' }),
        dom('span', { style: 'display:inline-flex;align-items:center;gap:6px;flex-shrink:0' },
          bestLockedBrew ? dom('span', { class: 'bt-badge-v62 is-sci', text: 'Ghost Pacer' }) : null,
          allStepsToggleBtn
        )
      ),
      allStepsBodyEl
    );
    container.appendChild(allStepsCardEl);

    stageEl.appendChild(container);

    /* --- Step & Physics Tick Helpers --- */
    function currentStepIndex(elS) {
      var idx = 0;
      for (var i = 0; i < steps.length; i++) {
        if (elS >= (steps[i].t || 0)) idx = i;
      }
      return idx;
    }

    function stepWavesKinetic(dt) {
      var core = (typeof window !== 'undefined' && window.BTCoreV6) ? window.BTCoreV6 : null;
      if (core && typeof core.computeExtractionWavePoint === 'function') {
        try {
          var wp = core.computeExtractionWavePoint(_timerSession.elapsedS, totalTargetS, {
            tempC: rec.tempC,
            roast: (a.coffee && a.coffee.roast) || 'medium-light',
            d50Um: rec.d50Um
          });
          if (wp) {
            _timerSession.waves = {
              thetaA: wp.thetaA != null ? wp.thetaA : wp.acids,
              thetaS: wp.thetaS != null ? wp.thetaS : wp.sweet,
              thetaB: wp.thetaB != null ? wp.thetaB : wp.bitters
            };
            return;
          }
        } catch (_) {}
      }
      var inn = (typeof window !== 'undefined' && window.BTInnovate) ? window.BTInnovate : null;
      if (inn && typeof inn.stepExtractionWaves === 'function') {
        try {
          var nw = inn.stepExtractionWaves({
            state: _timerSession.waves,
            dtS: dt,
            slurryTempC: rec.tempC - 2.0,
            d50Um: rec.d50Um,
            waterG: Math.max(15, _timerSession.liveWeightG || computeGhostTargetAt(_timerSession.elapsedS, rec, bestLockedBrew)),
            flowGs: _timerSession.flowGs,
            isSteep: false
          });
          if (nw) { _timerSession.waves = nw; return; }
        } catch (_) {}
      }
      var d50 = Math.max(120, rec.d50Um);
      var kA = 0.025 * Math.pow(580 / d50, 1.15);
      var kS = 0.012 * Math.pow(580 / d50, 1.55);
      var kB = 0.004 * Math.pow(580 / d50, 1.80);
      _timerSession.waves.thetaA = 1 - (1 - (_timerSession.waves.thetaA || 0)) * Math.exp(-kA * dt);
      _timerSession.waves.thetaS = 1 - (1 - (_timerSession.waves.thetaS || 0)) * Math.exp(-kS * dt);
      _timerSession.waves.thetaB = 1 - (1 - (_timerSession.waves.thetaB || 0)) * Math.exp(-kB * dt);
    }

    function triggerStepCuesIfNeeded(idx) {
      if (_timerSession.lastStepIdx === idx || !steps[idx]) return;
      _timerSession.lastStepIdx = idx;
      AudioCoach.playStepChime();
      AudioCoach.speak(steps[idx].say || ('Pour steadily to ' + steps[idx].targetG + ' grams.'));
      haptic('snap');
    }

    function paintDynamicStickyBar() {
      stickyHost.textContent = '';
      if (_timerSession.elapsedS === 0 && !_timerSession.running && !_timerSession.stopped) {
        stickyHost.appendChild(buildStickyCtaBar({
          id: 'bt-timer-sticky-start',
          label: 'Start Pour & Audio Timer \u2192',
          sub: 'Voice + 3-2-1 Pips · Screen Wake Lock',
          secondaryLabel: 'Skip \u2192 Taste',
          onSecondary: function () {
            recordFinishedCupBrew(a, rec, totalTargetS, rec.yieldMl, false);
            goBrewStep('taste');
          },
          onClick: function () { toggleStartPause(); }
        }));
      } else {
        var shownSecs = _timerSession.stopped && _timerSession.actualStoppedS != null
          ? _timerSession.actualStoppedS
          : Math.max(0, Math.round(_timerSession.elapsedS));
        stickyHost.appendChild(buildStickyCtaBar({
          id: 'bt-timer-finish-rate-cta',
          label: 'Finish & Rate This Cup \u2192',
          sub: (_timerSession.stopped ? ('Actual ' + fmtClock(shownSecs, false) + ' locked') : ('Live ' + fmtClock(shownSecs, false))) +
            ' (vs ' + fmtClock(totalTargetS, false) + ' target)' +
            (_timerSession.lockedYieldG ? (' · Yield ' + _timerSession.lockedYieldG.toFixed(1) + ' g') : ''),
          onClick: finishBrewAndNavigate
        }));
      }
    }

    function syncTimerDom() {
      var elS = _timerSession.stopped && _timerSession.actualStoppedS != null
        ? _timerSession.actualStoppedS
        : _timerSession.elapsedS;
      var isOvertime = elS > totalTargetS + 0.5;
      var overSec = isOvertime ? Math.round(elS - totalTargetS) : 0;
      var curIdx = currentStepIndex(elS);
      var curSt = steps[curIdx] || { title: 'Brewing', human: 'Pour steadily.', targetG: rec.hotPourG, t: 0, endS: totalTargetS };
      var nextSt = steps[curIdx + 1] || null;
      var ghostG = computeGhostTargetAt(elS, rec, bestLockedBrew);
      var hasScale = _timerSession.realScaleConnected || _timerSession.simOn;
      var shownWeight = hasScale ? _timerSession.liveWeightG : ghostG;
      var stepFlowInfo = computeTargetStepFlow(elS, curSt, curIdx, steps, rec, totalTargetS);
      var shownFlowGs = 0;
      var shownFlowLbl = '';

      if (_timerSession.stopped) {
        shownFlowGs = 0;
        shownFlowLbl = '0.0 g/s · Brew Stopped';
      } else if (hasScale) {
        shownFlowGs = +Math.max(0, _timerSession.flowGs || 0).toFixed(1);
        var modeTag = (_timerSession.simOn && !_timerSession.realScaleConnected) ? 'Sim ' : '';
        if (shownFlowGs >= 0.15) {
          shownFlowLbl = modeTag + shownFlowGs.toFixed(1) + ' g/s' + (_timerSession.liveWeightG > 0 ? (' · ' + _timerSession.liveWeightG.toFixed(0) + ' g') : '');
        } else {
          shownFlowLbl = modeTag + '0.0 g/s · ' + (isOvertime ? 'Overtime Drain' : (elS > 1 ? 'Bloom Rest / Draining' : 'Ready'));
        }
      } else {
        shownFlowGs = stepFlowInfo.rate;
        shownFlowLbl = stepFlowInfo.label;
      }

      /* Giant Kitchen-Counter Clock + Live Weight & Flow Readout */
      giantClockEl.textContent = fmtClock(elS, !_timerSession.stopped);
      giantClockEl.classList.toggle('is-overtime', isOvertime && !_timerSession.stopped);
      giantClockEl.classList.toggle('is-stopped', !!_timerSession.stopped);
      giantPhaseEl.textContent = _timerSession.stopped
        ? ('Brew Stopped · Target ' + fmtClock(totalTargetS, false))
        : (isOvertime ? ('Overtime +' + fmtClock(overSec, false) + ' · Tap Stop When Drained') : ('Step ' + (curIdx + 1) + '/' + Math.max(1, steps.length) + ' · ' + curSt.title));
      giantPhaseEl.classList.toggle('is-overtime', isOvertime && !_timerSession.stopped);
      giantWeightEl.textContent = Math.round(shownWeight) + ' / ' + rec.hotPourG + ' g · ' + fmtClock(totalTargetS, false);
      giantFlowEl.textContent = shownFlowLbl;
      giantFlowEl.className = 'bt-timer-giant-flow bt-num' + (shownFlowGs >= 0.15 ? ' is-flowing' : '');

      if (chronoNode && typeof chronoNode.update === 'function') {
        chronoNode.update({
          elapsedS: elS,
          totalTargetS: totalTargetS,
          liveWeightG: shownWeight,
          targetWaterG: rec.hotPourG,
          ghostWeightG: ghostG,
          flowGs: shownFlowGs,
          flowRateGs: shownFlowGs,
          flowLabel: shownFlowLbl,
          tachLabel: shownFlowLbl,
          pressureBar: _timerSession.pressureBar,
          phaseLabel: isOvertime ? ('Overtime +' + fmtClock(overSec, false)) : curSt.title,
          waves: _timerSession.waves
        });
      } else if (chronoNode) {
        chronoNode.textContent = fmtClock(elS, true);
      }

      if (wavesNode && typeof wavesNode.update === 'function') {
        wavesNode.update({
          elapsedS: elS,
          totalTargetS: totalTargetS,
          tempC: rec.tempC,
          roast: (a.coffee && a.coffee.roast) || 'medium-light',
          isPaused: !_timerSession.running,
          stopped: !!_timerSession.stopped
        });
      }
      if (wavesCard) {
        wavesCard.classList.toggle('is-overtime', isOvertime);
      }
      activeStepCard.classList.toggle('is-overtime', isOvertime);

      if (overSec > 0) {
        overtimeBadgeEl.hidden = false;
        overtimeBadgeEl.textContent = '+' + fmtClock(overSec, false) + ' slower than target';
      } else {
        overtimeBadgeEl.hidden = true;
      }

      lockedBannerEl.hidden = !_timerSession.stopped;
      if (_timerSession.stopped) {
        var lockedS = _timerSession.actualStoppedS != null ? _timerSession.actualStoppedS : Math.max(1, Math.round(elS));
        lockedTitleEl.textContent = 'Actual: ' + fmtClock(lockedS, false) + ' vs ' + fmtClock(totalTargetS, false) + ' target';
        var diffTarget = lockedS - totalTargetS;
        lockedDeltaEl.className = 'bt-badge-v62 ' + (Math.abs(diffTarget) <= 8 ? 'is-good' : 'is-gold');
        lockedDeltaEl.textContent = diffTarget === 0
          ? 'Exact Target'
          : (diffTarget > 0 ? ('+' + diffTarget + 's slower') : (diffTarget + 's faster'));
      }

      stepKickerEl.textContent = 'STEP ' + (curIdx + 1) + ' OF ' + Math.max(1, steps.length) +
        (_timerSession.stopped ? ' · STOPPED' : (isOvertime ? ' · OVERTIME DRAWDOWN' : ''));
      stepCollapsedSumEl.textContent = '· ' + (isOvertime && !_timerSession.stopped ? ('Overtime +' + fmtClock(overSec, false)) : curSt.title);
      stepTargetEl.textContent = 'Target ' + (curSt.targetG || rec.hotPourG) + ' g';
      stepTitleEl.textContent = isOvertime && !_timerSession.stopped
        ? 'Overtime Drawdown (+' + fmtClock(overSec, false) + ')'
        : curSt.title;
      stepSayEl.textContent = isOvertime && !_timerSession.stopped
        ? 'Past target time — tap Stop Brew (Done) the moment your bed finishes draining.'
        : (curSt.human || curSt.say || '');
      stepNextNameEl.textContent = nextSt ? ('Up next: ' + nextSt.title + ' (' + nextSt.targetG + ' g)') : 'When bed is flat: tap Stop Brew (Done)';
      var remToNext = nextSt ? Math.max(0, Math.ceil(nextSt.t - elS)) : Math.max(0, Math.ceil(totalTargetS - elS));
      stepCountdownEl.textContent = _timerSession.stopped
        ? ('Locked at ' + fmtClock(elS, false))
        : (isOvertime ? ('+' + fmtClock(overSec, false) + ' overtime') : ((nextSt ? 'Next in ' : 'Target in ') + fmtClock(remToNext, false)));

      runBtnText.textContent = _timerSession.running ? 'Pause' : (elS > 0 ? 'Resume' : 'Start');
      runBtn.className = 'bt-tctrl-btn ' + (_timerSession.running ? 'is-paused' : 'is-run');
      runBtnIcoWrap.textContent = '';
      runBtnIcoWrap.appendChild(ico(_timerSession.running ? 'pause' : 'play', 16));

      flowPillTxt.textContent = shownFlowLbl;
      flowPillEl.className = 'bt-flow-rate-pill' + (shownFlowGs >= 0.15 ? '' : ' is-idle');
      demoScaleBtn.className = 'bt-demo-scale-btn' + (_timerSession.simOn ? ' is-active' : '');
      demoScaleBtn.setAttribute('aria-pressed', String(!!_timerSession.simOn));
      demoScaleTxt.textContent = _timerSession.realScaleConnected
        ? (_timerSession.liveWeightG.toFixed(1) + ' g BLE')
        : (_timerSession.simOn ? ('Demo ' + shownWeight.toFixed(0) + ' g') : 'Demo Scale');
      wakeBadgeTxt.textContent = isWakeLockActive() ? 'Wake ON' : 'Wake';

      if ((_timerSession.running || _timerSession.stopped || elS > 0) && stickyHost && !stickyHost.querySelector('#bt-timer-finish-rate-cta')) {
        paintDynamicStickyBar();
      }
      var finishSubEl = stickyHost && stickyHost.querySelector ? stickyHost.querySelector('#bt-timer-finish-rate-cta .bt-cta-sub') : null;
      if (finishSubEl) {
        var liveRoundS = _timerSession.stopped && _timerSession.actualStoppedS != null
          ? _timerSession.actualStoppedS
          : Math.max(0, Math.round(elS));
        finishSubEl.textContent = (_timerSession.stopped ? ('Actual ' + fmtClock(liveRoundS, false) + ' locked') : ('Live ' + fmtClock(liveRoundS, false))) +
          ' (vs ' + fmtClock(totalTargetS, false) + ' target)' +
          (_timerSession.lockedYieldG ? (' · Yield ' + _timerSession.lockedYieldG.toFixed(1) + ' g') : '');
      }
    }

    function tickRaf(now) {
      if (!_timerSession.running) return;
      if (!container.isConnected) {
        stopActiveTimerSession(false);
        return;
      }
      var dt = _timerSession.lastTs ? Math.min(0.25, Math.max(0.008, (now - _timerSession.lastTs) / 1000)) : 0.016;
      _timerSession.lastTs = now;
      _timerSession.elapsedS += dt;

      if (_timerSession.simOn && !_timerSession.realScaleConnected) {
        var bleTick = (typeof window !== 'undefined' && window.BTBle) ? window.BTBle : null;
        var gNow = 0;
        var simHintRate = null;
        if (bleTick && typeof bleTick.sampleSimulatedScaleAt === 'function') {
          try {
            var sp = bleTick.sampleSimulatedScaleAt(_timerSession.elapsedS, simRecipeOpts);
            if (sp && isFinite(sp.weightG)) {
              gNow = sp.weightG;
              if (isFinite(sp.flowRateGs)) simHintRate = sp.flowRateGs;
            }
          } catch (_) {}
        }
        if (bleTick && typeof bleTick.stepScaleSimulation === 'function') {
          try { bleTick.stepScaleSimulation(_timerSession.elapsedS); } catch (_) {}
        }
        if (!(gNow > 0)) {
          gNow = computeGhostTargetAt(_timerSession.elapsedS, rec, bestLockedBrew);
        }
        var rawRate = Math.max(0, (gNow - _timerSession.prevSimG) / Math.max(0.008, dt));
        var targetRate = simHintRate != null ? (0.5 * rawRate + 0.5 * simHintRate) : rawRate;
        _timerSession.emaFlowGs = _timerSession.emaFlowGs + 0.18 * (targetRate - _timerSession.emaFlowGs);
        _timerSession.flowGs = _timerSession.emaFlowGs < 0.06 ? 0 : Math.min(8.5, +_timerSession.emaFlowGs.toFixed(2));
        _timerSession.prevSimG = gNow;
        _timerSession.liveWeightG = gNow;
        if (gNow > _timerSession.maxPourWeightG) _timerSession.maxPourWeightG = gNow;
      }

      /* 1. 3-2-1 Countdown Pips before every step transition */
      for (var i = 1; i < steps.length; i++) {
        var stNext = steps[i];
        if (_timerSession.elapsedS < stNext.t) {
          var secRem = Math.ceil(stNext.t - _timerSession.elapsedS);
          if (secRem >= 1 && secRem <= 3) {
            var pKey = i + ':' + secRem;
            if (_timerSession.lastPipKey !== pKey) {
              _timerSession.lastPipKey = pKey;
              AudioCoach.playCountdownPip(secRem);
            }
          }
        }
      }

      /* 2. Step Start Harmonic Chime + Spoken Voice Instruction */
      var activeIdx = currentStepIndex(_timerSession.elapsedS);
      triggerStepCuesIfNeeded(activeIdx);

      /* 3. Mid-Step Half-Way Voice Prompt when step duration > 25s */
      var activeSt = steps[activeIdx];
      if (activeSt) {
        var dur = (activeSt.endS || totalTargetS) - (activeSt.t || 0);
        var midAt = (activeSt.t || 0) + dur * 0.5;
        if (dur > 25 && _timerSession.elapsedS >= midAt && !_timerSession.midSpoken[activeIdx]) {
          _timerSession.midSpoken[activeIdx] = 1;
          var remMid = Math.max(5, Math.round((activeSt.endS || totalTargetS) - _timerSession.elapsedS));
          AudioCoach.speak(activeIdx === steps.length - 1
            ? ('Halfway through drawdown. ' + remMid + ' seconds remaining.')
            : ('Steady pace toward ' + activeSt.targetG + ' grams. Next step in ' + remMid + ' seconds.'));
        }
      }

      stepWavesKinetic(dt);

      /* 4. Gentle Target Cue at totalTargetS — NEVER auto-stop or clamp! Keep counting up into overtime */
      if (_timerSession.elapsedS >= totalTargetS && !_timerSession.finishFired) {
        _timerSession.finishFired = true;
        AudioCoach.playFinishChord();
        AudioCoach.speak('Target time reached. Tap Stop Brew as soon as your coffee bed finishes draining.');
        haptic('celebrate');
        paintDynamicStickyBar();
      }

      syncTimerDom();
      _timerSession.rafId = _raf(tickRaf);
    }

    function stopBrewDone() {
      AudioCoach.unlock();
      if (_timerSession.rafId) {
        _caf(_timerSession.rafId);
        _timerSession.rafId = 0;
      }
      var rawS = _timerSession.elapsedS > 0 ? _timerSession.elapsedS : (_timerSession.actualStoppedS || 1);
      var actualStoppedS = Math.max(1, Math.round(rawS));
      _timerSession.running = false;
      _timerSession.stopped = true;
      _timerSession.actualStoppedS = actualStoppedS;
      _timerSession.elapsedS = actualStoppedS;
      _timerSession.flowGs = 0;
      _timerSession.emaFlowGs = 0;
      requestTimerWakeLock(false);
      a.brew.actualSecs = actualStoppedS;
      a.brew.actualFromTimer = true;
      saveDraft();
      AudioCoach.playFinishChord();
      haptic('celebrate');
      paintDynamicStickyBar();
      syncTimerDom();
    }

    function toggleStartPause() {
      AudioCoach.unlock();
      if (_timerSession.stopped) {
        _timerSession.stopped = false;
        _timerSession.actualStoppedS = null;
      }
      _timerSession.running = !_timerSession.running;
      requestTimerWakeLock(_timerSession.running);
      if (_timerSession.running) {
        if (_timerSession.elapsedS === 0) {
          _timerSession.prevSimG = 0;
          _timerSession.emaFlowGs = 0;
          triggerStepCuesIfNeeded(0);
        }
        _timerSession.lastTs = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        _timerSession.rafId = _raf(tickRaf);
      } else {
        _timerSession.flowGs = 0;
        if (_timerSession.rafId) {
          _caf(_timerSession.rafId);
          _timerSession.rafId = 0;
        }
      }
      paintDynamicStickyBar();
      syncTimerDom();
    }

    function finishBrewAndNavigate() {
      var usedS = _timerSession.stopped
        ? _timerSession.actualStoppedS
        : (_timerSession.elapsedS > 0 ? Math.max(1, Math.round(_timerSession.elapsedS)) : rec.totalSecs);
      var lockedY = _timerSession.lockedYieldG || null;
      stopActiveTimerSession(false);
      recordFinishedCupBrew(a, rec, usedS, lockedY, _timerSession.stopped || _timerSession.elapsedS > 0);
      stopActiveTimerSession(true);
      haptic('celebrate');
      goBrewStep('taste');
    }

    /* Wire WebBLE Scale Live Weight / Post-Tare Auto-Start / Dripper-Lift Yield Lock */
    if (_timerSession.bleUnsub) {
      try { _timerSession.bleUnsub(); } catch (_) {}
      _timerSession.bleUnsub = null;
    }
    var ble = (typeof window !== 'undefined' && window.BTBle) ? window.BTBle : null;
    if (ble && typeof ble.subscribe === 'function') {
      try {
        _timerSession.bleUnsub = ble.subscribe(function (st) {
          if (!st || !container.isConnected) return;
          var isSimPacket = !!st.simulatorActive;
          /* When Demo Live Scale is driven synchronously by tickRaf, ignore background simulator ticks while paused/stopped */
          if (isSimPacket && (_timerSession.stopped || !_timerSession.running)) return;
          var sc = (st.slots && st.slots.scale) || st;
          var w = typeof sc.weightG === 'number' ? sc.weightG : (typeof st.weightG === 'number' ? st.weightG : null);
          if (w != null && isFinite(w)) {
            var isRealHw = !isSimPacket && !!(sc.connected || st.scaleConnected);
            _timerSession.realScaleConnected = isRealHw;
            _timerSession.scaleConnected = isRealHw || isSimPacket;
            var cleanW = Math.max(0, w);
            if (isRealHw) {
              var nowMs = Date.now();
              var dtBle = _timerSession.prevBleTs ? Math.max(0.04, Math.min(1.0, (nowMs - _timerSession.prevBleTs) / 1000)) : 0.1;
              var hwFl = typeof st.flowRateGs === 'number' ? st.flowRateGs : (typeof sc.flowGs === 'number' ? sc.flowGs : (typeof st.flowGs === 'number' ? st.flowGs : null));
              var derivFl = Math.max(0, (cleanW - _timerSession.prevBleG) / dtBle);
              var chosenFl = (hwFl != null && hwFl > 0.05) ? hwFl : derivFl;
              _timerSession.emaFlowGs = _timerSession.emaFlowGs + 0.18 * (chosenFl - _timerSession.emaFlowGs);
              _timerSession.flowGs = _timerSession.emaFlowGs < 0.06 ? 0 : +_timerSession.emaFlowGs.toFixed(2);
              _timerSession.prevBleG = cleanW;
              _timerSession.prevBleTs = nowMs;
              _timerSession.liveWeightG = cleanW;
            }

            /* Post-tare zero arming guard on real BLE scale */
            if (isRealHw && !_timerSession.running && !_timerSession.stopped && _timerSession.elapsedS === 0) {
              if (Math.abs(cleanW) <= 0.5) {
                _timerSession.zeroFrames++;
                if (_timerSession.zeroFrames >= 2) _timerSession.armedZero = true;
              } else if (_timerSession.armedZero && cleanW >= (rec.method.outRatio ? 0.5 : 1.5) && _timerSession.flowGs >= (rec.method.outRatio ? 0.3 : 0.7)) {
                toggleStartPause();
              }
            }
            if (_timerSession.running) {
              if (cleanW > _timerSession.maxPourWeightG) _timerSession.maxPourWeightG = cleanW;
              /* Dripper-Lift Yield Lock when cone is lifted off carafe */
              if (!rec.method.outRatio && _timerSession.maxPourWeightG >= rec.hotPourG * 0.8 && cleanW >= rec.hotPourG * 0.42 && cleanW <= _timerSession.maxPourWeightG - Math.max(18, rec.doseG * 1.4) && Math.abs(_timerSession.flowGs) <= 0.25) {
                _timerSession.lockedYieldG = cleanW;
              }
            }
            if (st.lockedYieldG > 10) _timerSession.lockedYieldG = +st.lockedYieldG;
          }
          var pr = typeof st.pressureBar === 'number' ? st.pressureBar : (st.slots && st.slots.pressure && st.slots.pressure.bar);
          if (pr != null && isFinite(pr)) _timerSession.pressureBar = +pr;
          if (!isSimPacket) syncTimerDom();
        });
      } catch (_) {}
    }

    paintDynamicStickyBar();
    syncTimerDom();
    if (_timerSession.running && !_timerSession.rafId) {
      _timerSession.lastTs = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      _timerSession.rafId = _raf(tickRaf);
    }
  }

  /* ==================== 10. TAP-TO-TUNE & PASSPORT BTSHEETS ==================== */
  function registerBrewSheets() {
    var sh = getShell();
    if (!sh || typeof sh.registerSheet !== 'function') return;

    /* A. Tap-to-Tune Drawer ('tune-recipe': Batch & Units | Grind & Calibrate | Temp & Keep Extraction) */
    sh.registerSheet('tune-recipe', function (host, payload) {
      var a = ensureBrewState(getApp());
      var activeTab = (payload && payload.tab) || 'batch';
      var tac = (typeof window !== 'undefined' && window.BTTactile) ? window.BTTactile : null;

      function paintSheet() {
        host.textContent = '';
        var rec = runCurrentSynthesis(a);
        var isEsp = !!rec.method.outRatio;

        host.appendChild(dom('div', { class: 'bt-seg-bar', style: 'margin-bottom:12px' },
          [
            ['batch', 'Dose, Ratio & Units'],
            ['grind', 'Grind & 2-Pt Cal'],
            ['temp',  'Temp & Keep Extraction']
          ].map(function (tb) {
            return dom('button', {
              type: 'button',
              'aria-pressed': String(activeTab === tb[0]),
              text: tb[1],
              onclick: function () { activeTab = tb[0]; haptic('tick'); paintSheet(); }
            });
          })
        ));

        if (activeTab === 'batch') {
          var presets = isEsp
            ? [[18, 27, 'Ristretto 1:1.5'], [18, 36, 'Classic 1:2.0'], [18, 50, 'Turbo 1:2.8']]
            : [[15, 250, '1 Mug · 250g'], [19, 320, 'Large · 320g'], [30, 500, '2 Mugs · 500g'], [45, 750, 'Carafe · 750g']];

          host.appendChild(dom('div', { style: 'display:flex;flex-direction:column;gap:12px' },
            dom('div', { class: 'bt-pill-row' },
              presets.map(function (p) {
                return dom('button', {
                  type: 'button',
                  class: 'bt-chip-v6' + (Math.round(a.brew.water) === p[1] ? ' is-active' : ''),
                  text: p[2],
                  onclick: function () {
                    a.brew.dose = p[0];
                    a.brew.water = p[1];
                    a.brew.ratio = +(p[1] / p[0]).toFixed(isEsp ? 2 : 1);
                    a.brew.customizedNote = p[0] + 'g : ' + p[1] + 'g (1:' + a.brew.ratio + ')';
                    haptic('snap'); saveDraft(); rerender(); paintSheet();
                  }
                });
              })
            ),
            /* Unit Converter Pills: g | oz | tbsp & g/mL | fl oz | cups */
            dom('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:8px' },
              dom('div', { class: 'bt-seg-bar' },
                [['g', 'g'], ['oz', 'oz'], ['tbsp', 'tbsp']].map(function (u) {
                  return dom('button', {
                    type: 'button', 'aria-pressed': String((a.prefs.coffeeUnit || 'g') === u[0]), text: u[1],
                    onclick: function () { a.prefs.coffeeUnit = u[0]; haptic('tick'); saveDraft(); rerender(); paintSheet(); }
                  });
                })
              ),
              dom('div', { class: 'bt-seg-bar' },
                [['g', 'g/mL'], ['floz', 'fl oz'], ['cups', 'cups']].map(function (u) {
                  return dom('button', {
                    type: 'button', 'aria-pressed': String((a.prefs.waterUnit || 'g') === u[0]), text: u[1],
                    onclick: function () { a.prefs.waterUnit = u[0]; haptic('tick'); saveDraft(); rerender(); paintSheet(); }
                  });
                })
              )
            ),
            /* Mount BTLinkedDrumTrio if available */
            (tac && typeof tac.BTLinkedDrumTrio === 'function') ? (function () {
              try {
                return tac.BTLinkedDrumTrio({
                  dose: a.brew.dose,
                  water: a.brew.water,
                  ratio: a.brew.ratio,
                  lockedKey: a.brew.lockedParam || 'ratio',
                  isEspresso: isEsp,
                  onChange: function (chg) {
                    if (!chg) return;
                    if (chg.dose != null) a.brew.dose = +chg.dose;
                    if (chg.water != null) a.brew.water = +chg.water;
                    if (chg.ratio != null) a.brew.ratio = +chg.ratio;
                    if (chg.lockedKey) a.brew.lockedParam = chg.lockedKey;
                    a.brew.customizedNote = a.brew.dose + 'g : ' + a.brew.water + 'g (1:' + a.brew.ratio + ')';
                    saveDraft();
                    rerender();
                  }
                });
              } catch (_) { return null; }
            })() : null,
            /* Ratio Slider + Exact Stepper Row */
            dom('div', { class: 'bt-tune-stepper-row' },
              dom('button', {
                type: 'button', class: 'bt-nudge-btn', text: '-',
                onclick: function () {
                  var step = isEsp ? 0.1 : 0.5;
                  a.brew.ratio = Math.max(isEsp ? 1.2 : 4.0, +(a.brew.ratio - step).toFixed(2));
                  a.brew.water = Math.round(a.brew.dose * a.brew.ratio * (isEsp ? 2 : 1)) / (isEsp ? 2 : 1);
                  a.brew.customizedNote = 'Ratio 1:' + a.brew.ratio;
                  haptic('tick'); saveDraft(); rerender(); paintSheet();
                }
              }),
              dom('div', { style: 'text-align:center' },
                dom('span', { class: 'bt-kicker', text: 'Brew Ratio · Tap for Keypad' }),
                dom('button', {
                  type: 'button',
                  class: 'bt-num',
                  style: 'display:block;font-size:1.25rem;font-weight:800;margin:2px auto 0;color:var(--accent)',
                  text: '1:' + a.brew.ratio + ' (' + a.brew.dose + 'g : ' + a.brew.water + 'g)',
                  onclick: function () {
                    if (tac && tac.BTPrecisionKeypad && typeof tac.BTPrecisionKeypad.open === 'function') {
                      tac.BTPrecisionKeypad.open({
                        label: 'Coffee Dose',
                        value: a.brew.dose,
                        min: 5,
                        max: 120,
                        step: 0.5,
                        unit: 'g',
                        units: ['g', 'oz', 'tbsp'],
                        onCommit: function (val) {
                          a.brew.dose = val;
                          a.brew.water = Math.round(val * a.brew.ratio * (isEsp ? 2 : 1)) / (isEsp ? 2 : 1);
                          a.brew.customizedNote = val + 'g : ' + a.brew.water + 'g';
                          saveDraft(); rerender(); paintSheet();
                        }
                      });
                    }
                  }
                })
              ),
              dom('button', {
                type: 'button', class: 'bt-nudge-btn', text: '+',
                onclick: function () {
                  var step = isEsp ? 0.1 : 0.5;
                  a.brew.ratio = Math.min(isEsp ? 5.5 : 22.0, +(a.brew.ratio + step).toFixed(2));
                  a.brew.water = Math.round(a.brew.dose * a.brew.ratio * (isEsp ? 2 : 1)) / (isEsp ? 2 : 1);
                  a.brew.customizedNote = 'Ratio 1:' + a.brew.ratio;
                  haptic('tick'); saveDraft(); rerender(); paintSheet();
                }
              })
            )
          ));
        } else if (activeTab === 'grind') {
          var stepUm = Math.max(8, rec.grindMap.stepUm || 24);
          var calS1 = dom('input', { type: 'number', class: 'bt-input-v62', placeholder: 'Dial 1 (e.g. 15)' });
          var calU1 = dom('input', { type: 'number', class: 'bt-input-v62', placeholder: 'D50 µm (e.g. 420)' });
          var calS2 = dom('input', { type: 'number', class: 'bt-input-v62', placeholder: 'Dial 2 (e.g. 25)' });
          var calU2 = dom('input', { type: 'number', class: 'bt-input-v62', placeholder: 'D50 µm (e.g. 700)' });

          host.appendChild(dom('div', { style: 'display:flex;flex-direction:column;gap:12px' },
            dom('div', { class: 'bt-tune-stepper-row' },
              dom('button', {
                type: 'button', class: 'bt-nudge-btn', text: '-1',
                title: '1 click finer',
                onclick: function () {
                  a.brew.grindUm = Math.max(80, Math.round(rec.d50Um - stepUm));
                  a.brew.customizedNote = 'Grind finer (' + mapGrinderClicks(a.brew.grindUm, rec.grinderKey, rec.method.key, a).short + ')';
                  haptic('tick'); saveDraft(); rerender(); paintSheet();
                }
              }),
              dom('div', { style: 'text-align:center' },
                dom('span', { class: 'bt-kicker', text: rec.grinder.short || rec.grinder.name }),
                dom('b', { class: 'bt-num', style: 'display:block;font-size:1.22rem;margin-top:2px', text: rec.grindMap.short + ' (~' + rec.d50Um + ' µm)' }),
                dom('span', { style: 'font-size:0.75rem;color:var(--ink-secondary)', text: rec.plainGrind })
              ),
              dom('button', {
                type: 'button', class: 'bt-nudge-btn', text: '+1',
                title: '1 click coarser',
                onclick: function () {
                  a.brew.grindUm = Math.min(1250, Math.round(rec.d50Um + stepUm));
                  a.brew.customizedNote = 'Grind coarser (' + mapGrinderClicks(a.brew.grindUm, rec.grinderKey, rec.method.key, a).short + ')';
                  haptic('tick'); saveDraft(); rerender(); paintSheet();
                }
              })
            ),
            /* Cross-Grinder Quick Equivalents */
            dom('div', { class: 'bt-card-v6 bt-card-well', style: 'padding:11px 13px;gap:5px' },
              dom('span', { class: 'bt-kicker', text: 'Cross-Grinder Equivalents (~' + rec.d50Um + ' µm)' }),
              ['comandante-c40', '1zpresso-k-ultra', '1zpresso-zp6', 'fellow-ode-gen2', 'baratza-encore-esp', 'df64-gen2'].map(function (gk) {
                var eq = mapGrinderClicks(rec.d50Um, gk, rec.method.key, a);
                var gMeta = getAllGrindersList().find(function (x) { return x.key === gk; });
                return dom('div', { style: 'display:flex;justify-content:space-between;font-size:0.78rem;padding:2px 0' },
                  dom('span', { text: (gMeta && gMeta.short) || gk }),
                  dom('b', { class: 'bt-num', text: eq.short })
                );
              })
            ),
            /* 2-Point Burr Calibration Collapsible */
            dom('details', { class: 'bt-card-v6', style: 'padding:11px 13px' },
              dom('summary', { style: 'cursor:pointer;font-size:0.82rem;font-weight:700;color:var(--accent)', text: '2-Point Burr Calibration (Omni / Micron Lens)' }),
              dom('div', { style: 'display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px' }, calS1, calU1, calS2, calU2),
              dom('button', {
                type: 'button',
                class: 'bt-chip-v6 is-active',
                style: 'margin-top:8px;width:100%',
                text: 'Save 2-Point Burr Calibration',
                onclick: function () {
                  var inn = (typeof window !== 'undefined' && window.BTInnovate) ? window.BTInnovate : null;
                  if (inn && typeof inn.fitTwoPointBurrCalibration === 'function') {
                    var fit = inn.fitTwoPointBurrCalibration(rec.grinderKey, calS1.value, calU1.value, calS2.value, calU2.value);
                    if (fit && fit.ok) {
                      a.prefs.pocketMicronCalib = fit;
                      saveDraft();
                      showToast('Saved 2-Point Calibration (' + fit.slopeM + ' µm/step)!');
                      rerender(); paintSheet();
                    } else {
                      showToast((fit && fit.why) || 'Enter two valid dial settings & D50 microns.');
                    }
                  }
                }
              })
            )
          ));
        } else {
          var tUnit = a.prefs.tempUnit === 'C' ? 'C' : 'F';
          host.appendChild(dom('div', { style: 'display:flex;flex-direction:column;gap:12px' },
            dom('div', { class: 'bt-seg-bar' },
              dom('button', {
                type: 'button', 'aria-pressed': String(tUnit === 'F'), text: 'Fahrenheit (°F)',
                onclick: function () { a.prefs.tempUnit = 'F'; haptic('tick'); saveDraft(); rerender(); paintSheet(); }
              }),
              dom('button', {
                type: 'button', 'aria-pressed': String(tUnit === 'C'), text: 'Celsius (°C)',
                onclick: function () { a.prefs.tempUnit = 'C'; haptic('tick'); saveDraft(); rerender(); paintSheet(); }
              })
            ),
            dom('div', { class: 'bt-tune-stepper-row' },
              dom('button', {
                type: 'button', class: 'bt-nudge-btn', text: '-1°',
                onclick: function () {
                  var prevT = +a.brew.tempC || 94;
                  var nextT = Math.max(75, prevT - 1);
                  a.brew.tempC = nextT;
                  if (a.brew.tempComp) {
                    /* Keep Extraction Steady: -1°C cooler water -> -8 um finer grind */
                    a.brew.grindUm = Math.max(120, Math.round((+a.brew.grindUm || 550) - 8));
                  }
                  a.brew.customizedNote = nextT + ' °C (' + Math.round(nextT * 9 / 5 + 32) + ' °F)' + (a.brew.tempComp ? ' · Keep Extraction Steady' : '');
                  haptic('tick'); saveDraft(); rerender(); paintSheet();
                }
              }),
              dom('div', { style: 'text-align:center' },
                dom('span', { class: 'bt-kicker', text: 'Kettle Setpoint' }),
                dom('b', { class: 'bt-num', style: 'display:block;font-size:1.3rem;margin-top:2px', text: rec.tempF + ' °F · ' + rec.tempC + ' °C' })
              ),
              dom('button', {
                type: 'button', class: 'bt-nudge-btn', text: '+1°',
                onclick: function () {
                  var prevT = +a.brew.tempC || 94;
                  var nextT = Math.min(100, prevT + 1);
                  a.brew.tempC = nextT;
                  if (a.brew.tempComp) {
                    a.brew.grindUm = Math.min(1200, Math.round((+a.brew.grindUm || 550) + 8));
                  }
                  a.brew.customizedNote = nextT + ' °C (' + Math.round(nextT * 9 / 5 + 32) + ' °F)' + (a.brew.tempComp ? ' · Keep Extraction Steady' : '');
                  haptic('tick'); saveDraft(); rerender(); paintSheet();
                }
              })
            ),
            dom('button', {
              type: 'button',
              class: 'bt-chip-v6' + (a.brew.tempComp ? ' is-active' : ''),
              style: 'justify-content:space-between;width:100%',
              onclick: function () {
                a.brew.tempComp = !a.brew.tempComp;
                haptic('snap'); saveDraft(); rerender(); paintSheet();
              }
            },
              dom('span', { text: 'Keep Extraction Steady (auto-adjusts grind when changing temp)' }),
              dom('b', { text: a.brew.tempComp ? 'ON' : 'OFF' })
            )
          ));
        }

        host.appendChild(dom('button', {
          type: 'button',
          class: 'bt-cta-btn is-centered',
          style: 'margin-top:12px;width:100%',
          onclick: closeSheet
        }, dom('span', { text: 'Done' })));
      }

      paintSheet();
    });

    /* B. Import Shared Brew Sheet ('import-shared-brew') */
    sh.registerSheet('import-shared-brew', function (host, payload) {
      var a = ensureBrewState(getApp());
      var prefill = (payload && payload.raw) || '';
      try {
        if (!prefill && typeof location !== 'undefined' && /bt6=|bp1=|bt1:/i.test(location.hash)) {
          prefill = decodeURIComponent(location.hash);
        }
      } catch (_) {}

      var ta = dom('textarea', {
        class: 'bt-textarea-v62',
        placeholder: 'Paste a friend\'s BT6:... recipe code, bt1:... passport, or shared link here...',
        value: prefill,
        'aria-label': 'Shared brew recipe code'
      });
      var previewHost = dom('div');

      function updatePreview() {
        previewHost.textContent = '';
        var raw = ta.value.trim();
        if (!raw) return;
        var dec = decodeAnySharedBrew(raw, a);
        if (!dec.ok) {
          previewHost.appendChild(dom('div', {
            style: 'padding:10px 12px;border-radius:12px;background:var(--bad-bg);color:var(--bad);font-size:0.8rem;font-weight:600',
            text: dec.why
          }));
          return;
        }
        var mObj = getMethodObj(dec.methodKey);
        previewHost.appendChild(dom('div', { class: 'bt-card-v6 bt-card-well', style: 'gap:8px' },
          dom('div', { class: 'bt-card-hd' },
            dom('span', { class: 'bt-badge-v62 is-good', text: 'Ready to Import' }),
            dom('span', { class: 'bt-badge-v62 is-sci', text: getExperienceLens() === 'scientist' ? 'Darcy-D32 Translated' : 'Auto-Matched to Your Grinder' })
          ),
          dom('b', { style: 'font-size:1rem', text: (dec.coffee.roaster ? dec.coffee.roaster + ' — ' : '') + (dec.coffee.name || 'Shared Coffee') }),
          dom('div', { class: 'bt-num', style: 'font-size:0.86rem;font-weight:700', text: mObj.label + ' · ' + dec.doseG + ' g : ' + dec.waterG + ' g (1:' + dec.ratio + ') · ' + dec.tempC + ' °C' }),
          dom('div', { style: 'padding:8px 10px;border-radius:10px;background:var(--surface);border:1px solid var(--line);font-size:0.8rem' },
            dom('div', null, 'Friend\'s Grind: ', dom('b', { class: 'bt-num', text: dec.senderSetting + ' (' + dec.senderGrinder + ')' })),
            dom('div', { style: 'color:var(--primary);font-weight:800;margin-top:3px' },
              'Your ' + dec.rxGrinderLabel + ': ' + dec.rxGrindSetting + ' (~' + dec.localizedUm + ' µm)'
            ),
            dom('div', { style: 'font-size:0.73rem;color:var(--ink-secondary);margin-top:2px', text: dec.spanNote })
          ),
          dom('button', {
            type: 'button',
            class: 'bt-cta-btn is-centered',
            onclick: function () {
              a.coffee = Object.assign(a.coffee || {}, {
                name: dec.coffee.name || 'Shared Coffee',
                roaster: dec.coffee.roaster || '',
                origin: dec.coffee.origin || '',
                process: dec.coffee.process || 'washed',
                roast: dec.coffee.roast || 'medium-light'
              });
              a.brew.method = dec.methodKey;
              a.brew.style = dec.style || 'standard';
              a.brew.dose = dec.doseG;
              a.brew.water = dec.waterG;
              a.brew.ratio = dec.ratio;
              a.brew.tempC = dec.tempC;
              a.brew.grindUm = dec.localizedUm;
              a.brew.grind_setting = dec.rxGrindSetting;
              a.brew.customizedNote = 'Shared Brew (' + dec.rxGrindSetting + ')';
              haptic('celebrate');
              saveDraft();
              closeSheet();
              showToast('Imported recipe & translated grind to ' + dec.rxGrindSetting + '!');
              goBrewStep('brew');
            }
          }, dom('span', { text: 'Apply & Open Recipe \u2192' }))
        ));
      }

      ta.addEventListener('input', updatePreview);

      host.appendChild(dom('div', { style: 'display:flex;flex-direction:column;gap:11px' },
        dom('p', { class: 'bt-subcopy', text: 'Paste a friend\'s BT6: code, bt1: passport, or URL. Grind clicks are automatically translated to your active grinder (' + (getActiveGrinderObj(a).short || 'Comandante C40') + ').' }),
        ta,
        dom('div', { class: 'bt-pill-row' },
          dom('button', {
            type: 'button',
            class: 'bt-chip-v6 bt-chip-soft',
            onclick: function () {
              if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.readText === 'function') {
                navigator.clipboard.readText().then(function (clip) {
                  if (clip) { ta.value = clip; updatePreview(); }
                }).catch(function () {});
              }
            }
          }, ico('paste-card', 15), dom('span', { text: 'Paste from Clipboard' })),
          dom('button', {
            type: 'button',
            class: 'bt-chip-v6 bt-chip-soft',
            onclick: function () {
              var demoObj = { v: 6, n: 'Worka Chelbesa Washed', r: 'Sey Coffee', o: 'Ethiopia', p: 'washed', rl: 'ultra-light', m: 'origami', st: 'origami-cone', d: 15, w: 250, ra: 16.7, tc: 96, um: 535, gk: '1zpresso-zp6', gs: 'Dial 3.9 (39c)' };
              ta.value = 'BT6:' + toB64Url(JSON.stringify(demoObj));
              updatePreview();
            }
          }, dom('span', { text: 'Try Sample BT6: Code' }))
        ),
        previewHost
      ));
      updatePreview();
    });

    /* C. Share QR Passport Sheet ('share-qr-passport') */
    sh.registerSheet('share-qr-passport', function (host) {
      var a = ensureBrewState(getApp());
      var rec = runCurrentSynthesis(a);
      var bundle = buildBt6ShareBundle(a, rec);

      var qrBox = dom('div', { class: 'bt-qr-svg-box' });
      if (bundle.qrSvg) qrBox.innerHTML = bundle.qrSvg;
      else qrBox.appendChild(ico('qr-passport', 64));

      host.appendChild(dom('div', { class: 'bt-qr-card-frame' },
        dom('span', { class: 'bt-badge-v62 is-sci', text: getExperienceLens() === 'scientist' ? 'ISO Reed-Solomon QR · Darcy-D32 Ready' : 'Instant Recipe QR · Auto-Matches Any Grinder' }),
        qrBox,
        dom('b', { style: 'font-size:0.95rem', text: bundle.summary }),
        dom('input', {
          type: 'text',
          class: 'bt-input-v62 bt-num',
          readOnly: true,
          value: bundle.bt6Code,
          'aria-label': 'BT6 shareable recipe code'
        }),
        dom('div', { class: 'bt-pill-wrap', style: 'justify-content:center;width:100%' },
          dom('button', {
            type: 'button',
            class: 'bt-cta-btn is-centered',
            onclick: function () {
              if (typeof window !== 'undefined' && window.BTPlatform && typeof window.BTPlatform.copyText === 'function') {
                window.BTPlatform.copyText(bundle.bt6Code);
              }
              haptic('snap');
              showToast('Copied BT6: Recipe Code to clipboard!');
            }
          }, ico('paste-card', 17), dom('span', { text: 'Copy BT6: Recipe Code' }))
        )
      ));
    });

    /* D. Brew Twin Translator Sheet ('brew-twin') */
    sh.registerSheet('brew-twin', function (host) {
      var a = ensureBrewState(getApp());
      var methods = getAllMethods23();
      var targetKey = a.brew.method === 'v60' ? 'aeropress' : 'v60';

      function paintTwin() {
        host.textContent = '';
        var core = (typeof window !== 'undefined' && window.BTCoreV6) ? window.BTCoreV6 : null;
        var tr = null;
        if (core && typeof core.translateAcrossBrewers === 'function') {
          try {
            tr = core.translateAcrossBrewers({
              method: a.brew.method,
              methodKey: a.brew.method,
              doseG: a.brew.dose,
              waterG: a.brew.water,
              ratio: a.brew.ratio,
              tempC: a.brew.tempC,
              grindUm: a.brew.grindUm,
              coffee: a.coffee
            }, targetKey, a.prefs && a.prefs.gear);
          } catch (_) {}
        }
        var tgtObj = getMethodObj(targetKey);
        var tgtDose = (tr && (tr.doseG || tr.dose)) || (tgtObj.outRatio ? 18 : a.brew.dose);
        var tgtRatio = (tr && tr.ratio) || tgtObj.ratio || 16;
        var tgtWater = (tr && (tr.waterG || tr.water)) || Math.round(tgtDose * tgtRatio);
        var tgtUm = (tr && (tr.grindUm || tr.d50Um)) || tgtObj.d50AnchorUm || 550;
        var tgtTemp = (tr && tr.tempC) || a.brew.tempC || 93;
        var gDisp = mapGrinderClicks(tgtUm, getActiveGrinderKey(a), targetKey, a);

        host.appendChild(dom('div', { style: 'display:flex;flex-direction:column;gap:12px' },
          dom('p', { class: 'bt-subcopy', text: 'Switch brewers while preserving your cup strength and extraction balance:' }),
          dom('div', { class: 'bt-pill-wrap' },
            methods.filter(function (m) { return m.key !== a.brew.method; }).map(function (m) {
              return dom('button', {
                type: 'button',
                class: 'bt-chip-v6' + (targetKey === m.key ? ' is-active' : ''),
                'aria-pressed': String(targetKey === m.key),
                onclick: function () { targetKey = m.key; haptic('tick'); paintTwin(); }
              }, brewerIco(m.key, 16), dom('span', { text: m.short || m.label }));
            })
          ),
          dom('div', { class: 'bt-card-v6 bt-card-well', style: 'gap:6px' },
            dom('span', { class: 'bt-kicker', text: 'Translated ' + tgtObj.label + ' Recipe' }),
            dom('b', { class: 'bt-num', style: 'font-size:1.22rem', text: tgtDose + ' g : ' + tgtWater + ' g (1:' + tgtRatio + ') · ' + tgtTemp + ' °C' }),
            dom('span', { class: 'bt-num', style: 'font-size:0.82rem;color:var(--ink-secondary)', text: gDisp.short + ' (~' + tgtUm + ' µm)' }),
            tr && tr.note ? dom('span', { style: 'font-size:0.76rem;color:var(--ink-secondary)', text: String(tr.note).replace(/->/g, '\u2192') }) : null
          ),
          dom('button', {
            type: 'button',
            class: 'bt-cta-btn is-centered',
            onclick: function () {
              a.brew.method = targetKey;
              a.brew.style = '';
              a.brew.dose = tgtDose;
              a.brew.water = tgtWater;
              a.brew.ratio = tgtRatio;
              a.brew.grindUm = tgtUm;
              a.brew.tempC = tgtTemp;
              a.brew.customizedNote = 'Brew Twin \u2192 ' + tgtObj.short;
              haptic('celebrate');
              saveDraft();
              closeSheet();
              rerender();
            }
          }, dom('span', { text: 'Switch to ' + tgtObj.label + ' \u2192' }))
        ));
      }

      paintTwin();
    });

    /* E. Water Quick Picker ('water-quick-pick') */
    sh.registerSheet('water-quick-pick', function (host) {
      var a = ensureBrewState(getApp());
      function paintWaterSheet() {
        host.textContent = '';
        var presets = getWaterPresets();
        var curW = resolveActiveWaterObj(a);
        var curCfg = getActiveWaterConfig(a);
        var everydaySeen = Object.create(null);
        EVERYDAY_WATER_GROUPS.forEach(function (g) {
          g.options.forEach(function (o) { everydaySeen[o.key] = 1; });
        });
        var namedBrandsAndDiy = presets.filter(function (w) {
          var k = w.key || w.id;
          return k && !everydaySeen[k] && w.category !== 'everyday';
        });

        var ghIn = dom('input', {
          type: 'number',
          class: 'bt-input-v62 bt-num',
          value: String(Math.round(curCfg.gh)),
          min: '0',
          max: '500',
          'aria-label': 'Custom Water Hardness GH in ppm'
        });
        var khIn = dom('input', {
          type: 'number',
          class: 'bt-input-v62 bt-num',
          value: String(Math.round(curCfg.kh)),
          min: '0',
          max: '400',
          'aria-label': 'Custom Water Acid Buffer KH in ppm'
        });

        host.appendChild(dom('div', { style: 'display:flex;flex-direction:column;gap:12px' },
          buildEverydayWaterPicker(a, {
            inSheet: true,
            onPicked: function () {
              closeSheet();
              rerender();
            }
          }),
          dom('div', { style: 'display:flex;flex-direction:column;gap:6px' },
            dom('span', { class: 'bt-kicker', text: 'Named Bottled Brands, Cities & DIY (' + namedBrandsAndDiy.length + ')' }),
            namedBrandsAndDiy.map(function (w) {
              var wk = w.key || w.id;
              var on = curW.key === wk;
              return dom('button', {
                type: 'button',
                class: 'bt-chip-v6' + (on ? ' is-active' : ''),
                'data-water-key': wk,
                'aria-pressed': String(on),
                style: 'justify-content:space-between;width:100%;flex-wrap:wrap;text-align:left',
                onclick: function () {
                  applyBrewWaterSelection(a, w);
                  haptic('tick');
                  closeSheet();
                  rerender();
                }
              },
                dom('span', { style: 'font-weight:700', text: w.label || w.name || wk }),
                dom('span', { class: 'bt-num', style: 'font-size:0.73rem;color:var(--ink-secondary)', text: formatWaterChemPlain(w.gh, w.kh) })
              );
            })
          ),
          dom('div', { class: 'bt-card-v6 bt-card-well', style: 'padding:11px 12px;gap:7px' },
            dom('span', { class: 'bt-kicker', text: 'Custom Mineral Profile (Hardness GH · Acid Buffer KH)' }),
            dom('div', { class: 'bt-water-custom-grid' },
              dom('label', { style: 'display:flex;flex-direction:column;gap:3px;font-size:0.72rem;font-weight:700;color:var(--ink-secondary)' },
                dom('span', { text: 'Hardness (GH ppm)' }),
                ghIn
              ),
              dom('label', { style: 'display:flex;flex-direction:column;gap:3px;font-size:0.72rem;font-weight:700;color:var(--ink-secondary)' },
                dom('span', { text: 'Acid Buffer (KH ppm)' }),
                khIn
              ),
              dom('button', {
                type: 'button',
                class: 'bt-chip-v6 bt-chip-primary is-active',
                onclick: function () {
                  var cGh = Math.max(0, Math.min(500, Math.round(+ghIn.value || 68)));
                  var cKh = Math.max(0, Math.min(400, Math.round(+khIn.value || 40)));
                  applyBrewWaterSelection(a, {
                    key: 'custom_gh_kh',
                    label: 'Custom Water (' + cGh + ' GH · ' + cKh + ' KH)',
                    short: 'Custom ' + cGh + '/' + cKh,
                    gh: cGh,
                    kh: cKh,
                    waterType: 'custom'
                  });
                  haptic('snap');
                  closeSheet();
                  rerender();
                }
              }, dom('span', { text: 'Apply Custom' }))
            )
          )
        ));
      }
      paintWaterSheet();
    });

    /* F. Edit Owned Brewers ('edit-owned-brewers') */
    sh.registerSheet('edit-owned-brewers', function (host) {
      var a = ensureBrewState(getApp());
      function paintOwned() {
        host.textContent = '';
        var owned = getOwnedBrewersList(a).slice();
        host.appendChild(dom('div', { style: 'display:flex;flex-direction:column;gap:10px' },
          dom('p', { class: 'bt-subcopy', text: 'Tap the brewers on your kitchen counter:' }),
          dom('div', { class: 'bt-pill-wrap' },
            getAllMethods23().map(function (m) {
              var on = owned.indexOf(m.key) >= 0;
              return dom('button', {
                type: 'button',
                class: 'bt-chip-v6' + (on ? ' is-active' : ''),
                'aria-pressed': String(on),
                onclick: function () {
                  var idx = owned.indexOf(m.key);
                  if (idx >= 0 && owned.length > 1) owned.splice(idx, 1);
                  else if (idx < 0) owned.push(m.key);
                  a.prefs.ownedBrewers = owned;
                  if (a.prefs.gear) a.prefs.gear.ownedBrewers = owned.slice();
                  haptic('tick'); saveDraft(); rerender(); paintOwned();
                }
              }, brewerIco(m.key, 16), dom('span', { text: m.short || m.label }));
            })
          ),
          dom('button', { type: 'button', class: 'bt-cta-btn is-centered', onclick: closeSheet }, dom('span', { text: 'Done' }))
        ));
      }
      paintOwned();
    });

    /* G. Interactive Recipe Science Explainability Popup ('recipe-science-why' & 'why-recipe') */
    function renderRecipeScienceWhySheet(host, payload) {
      var a = ensureBrewState(getApp());
      var activeFocus = String((payload && (payload.focus || payload.param || payload.key)) || 'all').toLowerCase();
      var validKeys = { all: 1, temp: 1, grind: 1, ratio: 1, dose: 1, time: 1, water: 1 };
      if (!validKeys[activeFocus]) activeFocus = 'all';

      function safeNum(v, fb, dec) {
        var n = (v != null && v !== '' && isFinite(+v)) ? +v : fb;
        return typeof dec === 'number' ? +n.toFixed(dec) : n;
      }
      function fmtDelta(val, unit, dec) {
        var d = dec != null ? dec : 1;
        var v = safeNum(val, 0, d);
        if (Math.abs(v) < 0.04) return '+0.' + (d === 0 ? '' : '0') + (unit || '');
        return (v > 0 ? '+' : '\u2212') + Math.abs(v).toFixed(d) + (unit || '');
      }

      function paintScience() {
        host.textContent = '';
        var rec = runCurrentSynthesis(a);
        var isPhilips = rec.method.key === 'philips5500';
        var phSnap = isPhilips ? computePhilipsSnap(a) : null;
        var c = a.coffee || {};
        var waterCfg = getActiveWaterConfig(a);
        var ghPpm = Math.round(safeNum(waterCfg.gh, 68, 0));
        var khPpm = Math.round(safeNum(waterCfg.kh, 40, 0));
        var ghKhRatio = (ghPpm / Math.max(1, khPpm)).toFixed(1);

        var roastUnsure = (c.roastUnsure === 'yes' || c.roast_unknown === 'yes' || String(c.roast || '').toLowerCase() === 'unknown');
        var procUnsure = (c.processUnsure === 'yes' || c.process_unknown === 'yes' || String(c.process || '').toLowerCase() === 'unknown');
        var elevUnsure = (c.elevUnsure === 'yes' || c.elev_unknown === 'yes');
        var rawRoast = roastUnsure ? 'medium-light' : String(c.roast || 'medium-light').toLowerCase();
        var roastLabel = roastUnsure
          ? "Don't Know (Safe Medium-Light Baseline)"
          : (rawRoast.charAt(0).toUpperCase() + rawRoast.slice(1));
        var rawProc = procUnsure ? 'washed' : String(c.process || 'washed').toLowerCase();
        var procLabel = procUnsure
          ? "Don't Know (Clean Washed Baseline)"
          : (rawProc.charAt(0).toUpperCase() + rawProc.slice(1));

        var elevParsed = parseFloat(c.elevation_m || c.elevation_masl || String(c.elevText || '').replace(/[^\d.]/g, ''));
        var hasElev = !elevUnsure && isFinite(elevParsed) && elevParsed > 100;
        var elevLabel = elevUnsure
          ? "Don't Know (Mid-Altitude Baseline)"
          : (hasElev ? (Math.round(elevParsed) + ' m (' + (elevParsed >= 1900 ? 'Ultra-High Dense' : elevParsed >= 1550 ? 'High-Grown Dense' : elevParsed < 1150 ? 'Low-Grown Soft' : 'Mid-Altitude') + ')') : 'Mid-Altitude Standard (~1,450 m)');

        var localAltM = safeNum(a.brew.altitudeM != null ? a.brew.altitudeM : ((a.prefs && a.prefs.gear && a.prefs.gear.altitudeFt) ? (+a.prefs.gear.altitudeFt * 0.3048) : 0), 0, 0);
        var boilCapC = safeNum(100 - (localAltM / 295), 100, 1);

        var tempC = safeNum(isPhilips ? phSnap.tempC : rec.tempC, 93, 1);
        var tempF = Math.round(tempC * 9 / 5 + 32);
        var isCold = rec.method.key === 'cold' || rec.method.key === 'cold_drip';
        var baseAnchorC = isCold ? 4.0 : (isPhilips ? 91.0 : (rec.method.outRatio ? 92.5 : 92.0));
        var roastShiftC = (isCold || isPhilips) ? 0 : (rawRoast.indexOf('ultra') >= 0 ? 3.5 : rawRoast === 'light' ? 2.0 : rawRoast.indexOf('med-light') >= 0 || rawRoast.indexOf('medium-light') >= 0 ? 1.0 : rawRoast.indexOf('med-dark') >= 0 || rawRoast.indexOf('medium-dark') >= 0 ? -2.5 : rawRoast.indexOf('dark') >= 0 ? -4.5 : 0.0);
        var elevShiftC = (isCold || isPhilips || !hasElev) ? 0 : (elevParsed >= 1950 ? 1.0 : elevParsed >= 1550 ? 0.5 : elevParsed < 1100 ? -1.2 : 0.0);
        var procShiftC = (isCold || isPhilips) ? 0 : (/infused|thermal/.test(rawProc) ? -2.5 : /anaerobic|carbonic|koji|yeast|black/.test(rawProc) ? -2.0 : /natural|red/.test(rawProc) ? -1.2 : /honey/.test(rawProc) ? -0.7 : /wet/.test(rawProc) ? -1.5 : 0.0);
        var residualShiftC = safeNum(tempC - (baseAnchorC + roastShiftC + elevShiftC + procShiftC), 0, 1);
        var hotterC = Math.min(100, +(tempC + 3).toFixed(1));
        var hotterF = Math.round(hotterC * 9 / 5 + 32);
        var coolerC = Math.max(4, +(tempC - 3).toFixed(1));
        var coolerF = Math.round(coolerC * 9 / 5 + 32);

        var d50Um = Math.round(safeNum(isPhilips ? phSnap.grindUm : rec.d50Um, 550, 0));
        var anchorUm = Math.round(safeNum(isPhilips ? 290 : (rec.method.d50AnchorUm || 550), 550, 0));
        var isDecaf = c.decaf === 'yes' || c.decaf === true || /decaf/i.test(String(c.name || ''));
        var roastUmDelta = isPhilips ? 0 : Math.round(anchorUm * (rawRoast.indexOf('dark') >= 0 ? 0.06 : rawRoast.indexOf('light') >= 0 ? -0.04 : 0) + (isDecaf ? (rec.method.outRatio ? -16 : 42) : 0));
        var degasInfo = computeDegassingBadge(c);
        var procAgeFrac = (/anaerobic|natural|infused/.test(rawProc) ? 0.035 : 0) + (degasInfo.days <= 3 ? 0.025 : degasInfo.days >= 28 ? -0.03 : 0);
        var beanAgeUmDelta = isPhilips ? 0 : Math.round(anchorUm * procAgeFrac);
        var filterBedUmDelta = d50Um - (anchorUm + roastUmDelta + beanAgeUmDelta);
        var grinderLabel = isPhilips ? 'Philips 12-Step Flat Ceramic Burr' : (rec.grinder.name || rec.grinder.short || 'Active Grinder');
        var grindHeadline = isPhilips ? ('Notch ' + a.brew.machine.hopperStep + '/12') : (rec.grindMap.full || rec.grindMap.short);
        var stepPitchUm = Math.round(safeNum(isPhilips ? 20 : rec.grindMap.stepUm, 25, 0));
        var compatFltList = getCompatibleFilters(rec.method.key);
        var activeFilterObj = compatFltList.find(function (f) {
          return (a.brew.filter && f.name === a.brew.filter) || (a.brew.filterId && (f.id === a.brew.filterId || f.v === a.brew.filterId));
        }) || compatFltList[0] || null;
        var activeFilterLabel = a.brew.filter || (activeFilterObj && (activeFilterObj.name || activeFilterObj.label)) || (rec.usesPaper ? 'Standard Paper Filter' : 'Metal / Immersion Mesh');

        var doseG = safeNum(isPhilips ? phSnap.doseG : rec.doseG, 15, 1);
        var waterG = Math.round(safeNum(isPhilips ? phSnap.totalMl : rec.waterG, 250, 0));
        var ratioVal = safeNum(rec.ratio, +(waterG / Math.max(1, doseG)).toFixed(1), rec.method.outRatio ? 2 : 1);
        var yieldMl = Math.round(safeNum(isPhilips ? phSnap.totalMl : rec.yieldMl, Math.round(waterG * 0.88), 0));
        var retainedG = Math.max(0, Math.round(waterG - yieldMl));
        var predTds = safeNum(rec.predTds, rec.method.outRatio ? 9.4 : 1.38, 2);
        var predEy = safeNum(rec.predEy, 20.1, 1);
        var strengthGl = Math.round(1000 / Math.max(1, ratioVal));
        var estBedCm = rec.method.outRatio ? safeNum(doseG / 11.5, 1.5, 1) : safeNum(1.2 + (doseG / 16) * 0.85, 2.0, 1);
        var estCaffMg = Math.round(doseG * (isDecaf ? 0.4 : 8.2));

        var targetSecs = Math.round(safeNum(isPhilips ? phSnap.timeS : rec.totalSecs, 165, 0));
        var firstStep = (rec.steps && rec.steps[0]) || { endS: 35, targetG: Math.round(doseG * 3) };
        var bloomSecs = Math.max(8, Math.round(safeNum((firstStep.endS || 35) - (firstStep.t || 0), 35, 0)));
        var bloomG = Math.round(safeNum(firstStep.targetG, Math.round(doseG * 3), 0));
        var pourWindowS = Math.max(15, Math.round(targetSecs * 0.62));
        var avgPourGs = safeNum(rec.hotPourG / pourWindowS, 3.2, 1);

        var waterBalanceVerdict = khPpm > 80
          ? 'High buffer softens sharp acidity into smooth chocolate comfort (can mute delicate florals).'
          : khPpm < 20
          ? 'Ultra-low buffer lets bright fruit & floral acids sparkle vividly.'
          : 'Balanced SCA sweet-spot mineral profile: lively fruit clarity + round caramel sweetness.';

        function makeLedgerRows(rows) {
          return dom('div', { class: 'bt-sci-ledger' },
            rows.map(function (r) {
              return dom('div', { class: 'bt-sci-ledger-row' + (r.total ? ' is-total' : '') },
                dom('div', { class: 'bt-sci-ledger-lhs' },
                  dom('span', { class: 'bt-sci-ledger-lbl', text: r.label }),
                  r.sub ? dom('span', { class: 'bt-sci-ledger-sub', text: r.sub }) : null
                ),
                dom('b', { class: 'bt-sci-ledger-val bt-num', text: r.val })
              );
            })
          );
        }

        function makeScienceCard(cfg) {
          return dom('section', { class: 'bt-sci-why-card', 'data-science-section': cfg.key },
            dom('div', { class: 'bt-sci-why-hd' },
              dom('div', { style: 'display:flex;align-items:center;gap:7px;min-width:0' },
                ico(cfg.icon, 18),
                dom('div', { style: 'min-width:0' },
                  dom('div', { class: 'bt-kicker', text: cfg.kicker }),
                  dom('h3', { class: 'bt-sci-why-title', text: cfg.title })
                )
              ),
              dom('span', { class: 'bt-sci-why-hero-pill bt-num', text: cfg.badge })
            ),
            dom('p', { class: 'bt-sci-why-plain', text: cfg.plain }),
            cfg.ledger,
            cfg.whatIf ? dom('div', { class: 'bt-sci-whatif-grid' },
              cfg.whatIf.map(function (w) {
                return dom('div', { class: 'bt-sci-whatif-box' },
                  dom('b', { text: w.head }),
                  dom('span', { text: w.body })
                );
              })
            ) : null,
            dom('div', { class: 'bt-sci-why-foot' },
              cfg.cite ? dom('span', { class: 'bt-sci-cite', text: cfg.cite }) : dom('span'),
              cfg.ctaLabel ? dom('button', {
                type: 'button',
                class: 'bt-sci-tune-jump-btn',
                onclick: cfg.onCta
              }, dom('span', { text: cfg.ctaLabel }), ico('chevron-right', 14)) : null
            )
          );
        }

        var cardsByKey = {
          temp: makeScienceCard({
            key: 'temp',
            icon: 'thermometer',
            kicker: 'Thermal Extraction Physics',
            title: 'Water Temperature',
            badge: tempC.toFixed(1) + ' °C / ' + tempF + ' °F',
            plain: isCold
              ? ('Cold immersion at ' + tempC.toFixed(0) + ' °C (' + tempF + ' °F) uses time instead of heat, dissolving sweet aromatics while leaving high-activation-energy bitter compounds locked inside the bean.')
              : ('We chose ' + tempC.toFixed(1) + ' °C (' + tempF + ' °F) for your ' + roastLabel + ' coffee on ' + rec.method.label + ' because fruit acids dissolve easily at any hot temp, sweet sugars need moderate heat, and dry bitter compounds spike sharply only at higher heat.'),
            ledger: makeLedgerRows(isPhilips ? [
              { label: 'Philips 5500 Thermoblock Step', sub: phSnap.drink.iced ? 'Iced Auto Cool Pulse active' : ('Menu Step ' + a.brew.machine.globalTemp + ' of 3 (Low 88 / Med 91 / High 93 °C)'), val: tempC.toFixed(1) + ' °C' },
              { label: 'Bean Roast & Process Match', sub: roastLabel + ' · ' + procLabel, val: rawRoast.indexOf('dark') >= 0 ? 'Low 88 °C ideal' : (rawRoast.indexOf('light') >= 0 ? 'High 93 °C ideal' : 'Med 91 °C ideal') },
              { label: 'Final Brew Group Target', sub: 'Converted to Fahrenheit & Celsius', val: tempC.toFixed(1) + ' °C (' + tempF + ' °F)', total: true }
            ] : [
              { label: rec.method.label + ' Medium-Roast Base', sub: 'Standard slurry thermal baseline', val: baseAnchorC.toFixed(1) + ' °C' },
              { label: 'Roast Activation Energy Shift', sub: roastLabel + ' · Arrhenius Ea (16.5 / 21.5 / 42 kJ/mol)', val: fmtDelta(roastShiftC, ' °C', 1) },
              { label: 'Bean Density & Elevation Shift', sub: elevLabel, val: fmtDelta(elevShiftC, ' °C', 1) },
              { label: 'Process Cell-Wall Porosity Shift', sub: procLabel + ' cell-wall diffusivity', val: fmtDelta(procShiftC, ' °C', 1) },
              { label: 'Water KH Buffer / Tune Adjustment', sub: khPpm + ' ppm KH alkalinity & brewer profile', val: fmtDelta(residualShiftC, ' °C', 1) },
              { label: 'Local Boiling-Point Guard', sub: 'Clausius-Clapeyron boil cap at ' + Math.round(localAltM) + ' m', val: 'Max ' + boilCapC.toFixed(1) + ' °C' },
              { label: 'Final Target Water Temp', sub: 'Exact synthesized kettle target', val: tempC.toFixed(1) + ' °C (' + tempF + ' °F)', total: true }
            ]),
            whatIf: isCold ? null : [
              { head: 'If +3 °C Hotter (' + hotterC.toFixed(1) + ' °C / ' + hotterF + ' °F)', body: 'Speeds molecular diffusion ~9%. Pulls deeper sweetness from dense light roasts, but risks dry astringent bitters on darker or fermented beans.' },
              { head: 'If -3 °C Cooler (' + coolerC.toFixed(1) + ' °C / ' + coolerF + ' °F)', body: 'Softens roast bite and boozy ferment notes for a rounder finish, but can taste tart or hollow if dense sugars under-extract.' }
            ],
            cite: 'Arrhenius Kinetics · Liang et al. 2024; Batali et al. 2020',
            ctaLabel: 'Tune This Setting \u2192',
            onCta: function () { openSheet('tune-recipe', { tab: 'temp' }, { title: 'Water Temp & Keep Extraction Steady', detent: 'half' }); }
          }),

          grind: makeScienceCard({
            key: 'grind',
            icon: 'grinder-burr',
            kicker: 'Darcy Permeability & Burr Geometry',
            title: 'Grind Setting',
            badge: grindHeadline + ' · ' + d50Um + ' µm',
            plain: 'We set ' + grinderLabel + ' to ' + grindHeadline + ' (~' + d50Um + ' µm, ' + rec.plainGrind.toLowerCase() + ') so water flows evenly through your ' + doseG + ' g coffee bed without rushing sour or clogging bitter.',
            ledger: makeLedgerRows([
              { label: rec.method.label + ' Permeability Anchor', sub: 'Darcy-Weisbach packed-bed target (k_bed ~ d50^2)', val: anchorUm + ' µm' },
              { label: 'Roast Brittleness & Fines Guard', sub: roastLabel + (isDecaf ? ' · Decaf fines compensation' : ' fracture profile'), val: fmtDelta(roastUmDelta, ' µm', 0) },
              { label: 'Process Porosity & Roast Age', sub: procLabel + ' · ' + degasInfo.text, val: fmtDelta(beanAgeUmDelta, ' µm', 0) },
              { label: 'Filter Media & ' + doseG + ' g Bed Depth', sub: activeFilterLabel, val: fmtDelta(filterBedUmDelta, ' µm', 0) },
              { label: 'Target Median Particle Size (D50)', sub: rec.plainGrind, val: d50Um + ' µm', total: true },
              { label: 'Mapped to ' + grinderLabel, sub: 'Burr pitch ~' + stepPitchUm + ' µm per step', val: grindHeadline, total: true }
            ]),
            whatIf: [
              { head: '2 Steps Finer (~' + Math.max(80, d50Um - stepPitchUm * 2) + ' µm)', body: 'Increases surface area & slows drawdown for richer sweetness — go finer if your cup tastes sour, watery, or drains too fast.' },
              { head: '2 Steps Coarser (~' + (d50Um + stepPitchUm * 2) + ' µm)', body: 'Opens bed channels & speeds flow for cleaner clarity — go coarser if your cup tastes dry, bitter, or stalls.' }
            ],
            cite: 'Darcy-Kozeny Packed-Bed Physics · Moroney et al. 2015; Gagne 2021',
            ctaLabel: 'Tune This Setting \u2192',
            onCta: function () { openSheet('tune-recipe', { tab: 'grind' }, { title: 'Tune Grinder Clicks & 2-Pt Calibration', detent: 'full' }); }
          }),

          ratio: makeScienceCard({
            key: 'ratio',
            icon: 'scale-deck',
            kicker: 'Conservation of Mass · Strength vs Yield',
            title: 'Brew Ratio',
            badge: '1:' + ratioVal + ' (' + strengthGl + ' g/L)',
            plain: 'A 1:' + ratioVal + ' ratio (' + doseG + ' g coffee to ' + waterG + ' g water) hits the sweet spot where beverage body (' + predTds + '% TDS) and flavor extraction (' + predEy + '% EY) balance cleanly.',
            ledger: makeLedgerRows([
              { label: 'Brewer & Roast Ratio Target', sub: rec.method.label + ' · ' + roastLabel + ' solubility', val: '1:' + ratioVal },
              { label: 'Liquid Absorbed by Grounds', sub: '~2.1 g water retained per gram of dry coffee', val: '\u2212' + retainedG + ' g \u2192 ~' + yieldMl + ' mL cup' },
              { label: 'Estimated Cup Strength (%TDS)', sub: strengthGl + ' g/L brewing concentration', val: predTds + '% TDS' },
              { label: 'Extraction Yield (%EY = TDS × Cup / Dose)', sub: 'Target sweet spot: 18.5% – 21.5% EY', val: predEy + '% EY', total: true }
            ]),
            whatIf: [
              { head: 'Tighter Ratio (e.g. 1:' + Math.max(1.5, +(ratioVal - (rec.method.outRatio ? 0.3 : 1.5)).toFixed(1)) + ')', body: 'Heavier, syrupy mouthfeel (higher %TDS) with slightly lower total extraction — great for milk drinks or dark roasts.' },
              { head: 'Longer Ratio (e.g. 1:' + (+(ratioVal + (rec.method.outRatio ? 0.4 : 1.5)).toFixed(1)) + ')', body: 'Tea-like clarity with more clean solvent water to pull delicate florals & fruit sugars from light roasts.' }
            ],
            cite: 'SCA Brewing Control Chart · Lockhart 1957; Ristenpart & Kuhl 2020',
            ctaLabel: 'Tune This Setting \u2192',
            onCta: function () { openSheet('tune-recipe', { tab: 'batch' }, { title: 'Tune Dose, Water, Ratio & Units', detent: 'full' }); }
          }),

          dose: makeScienceCard({
            key: 'dose',
            icon: 'fresh-bag',
            kicker: 'Percolation Cake Depth & Batch Geometry',
            title: 'Coffee Dose',
            badge: doseG + ' g (~' + (doseG / 5.3).toFixed(1) + ' tbsp)',
            plain: 'Using ' + doseG + ' g dry coffee creates an even ~' + estBedCm + ' cm coffee bed inside ' + rec.method.label + ' — deep enough to filter cleanly without channeling, shallow enough not to stall.',
            ledger: makeLedgerRows([
              { label: 'Dry Bean Mass', sub: (doseG / 28.3495).toFixed(2) + ' oz · ~' + (doseG / 5.3).toFixed(1) + ' level tablespoons', val: doseG + ' g' },
              { label: 'Estimated Wet Coffee Bed Depth', sub: 'Optimal percolation cake zone: 1.5 – 2.5 cm', val: '~' + estBedCm + ' cm' },
              { label: 'Finished Beverage in Cup', sub: 'After ground retention from ' + waterG + ' g brew water', val: '~' + yieldMl + ' mL', total: true },
              { label: 'Estimated Cup Caffeine', sub: isDecaf ? 'Swiss/EA Decaf (~97% caffeine removed)' : 'Arabica ~1.2% soluble caffeine', val: '~' + estCaffMg + ' mg' }
            ]),
            cite: 'Hydraulic Bed Geometry · Gagne 2021; Frost, Ristenpart & Guinard 2020',
            ctaLabel: 'Tune This Setting \u2192',
            onCta: function () { openSheet('tune-recipe', { tab: 'batch' }, { title: 'Tune Dose, Water, Ratio & Units', detent: 'full' }); }
          }),

          time: makeScienceCard({
            key: 'time',
            icon: 'caffeine-clock',
            kicker: 'Smrke CO2 Degassing & 3-Wave Kinetics',
            title: 'Target Time & Pour Schedule',
            badge: fmtClock(targetSecs, false) + ' · ' + rec.steps.length + ' Steps',
            plain: 'Your ' + fmtClock(targetSecs, false) + ' target is a physics guidepost, not a rigid alarm: real drawdowns naturally vary by 10–20s with humidity, pour height, and bean fines. Always watch the bed and tap Stop Brew when it drains flat!',
            ledger: makeLedgerRows([
              { label: 'Bean Degassing State (Smrke Weibull)', sub: 'Trapped roasting CO2 gas pockets repel water', val: degasInfo.text },
              { label: 'Step 1 Wet Grounds (Bloom)', sub: 'Lets CO2 bubble out so inner pores open evenly', val: bloomSecs + 's · ' + bloomG + ' g' },
              { label: 'Pulse Pours & Flow Speed', sub: 'Fresh kettle water keeps concentration gradient steep', val: rec.steps.length + ' steps · ~' + avgPourGs + ' g/s' },
              { label: '3-Wave Sweet-Spot Cutoff', sub: '1. Bright Acids \u2192 2. Sweet Sugars \u2192 Cut before 3. Bitters', val: fmtClock(targetSecs, false), total: true }
            ]),
            cite: 'Smrke et al. 2018 J. Agric. Food Chem. (CO2 Weibull Kinetics)',
            ctaLabel: 'Open Guided Brew Timer \u2192',
            onCta: function () { closeSheet(); AudioCoach.unlock(); goBrewStep('timer'); }
          }),

          water: makeScienceCard({
            key: 'water',
            icon: 'droplet',
            kicker: 'Ion-Flavor Binding & Carbonate Buffer',
            title: 'Brew Water & Chemistry',
            badge: ghPpm + ' GH · ' + khPpm + ' KH',
            plain: 'Water is 98.6% of your brewed cup! Your active profile (' + waterCfg.label + ') supplies dissolved minerals that grab sweet & fruity flavor molecules while buffering sharp sourness.',
            ledger: makeLedgerRows([
              { label: 'Active Brew Water Profile', sub: waterBalanceVerdict, val: waterCfg.label },
              { label: 'General Hardness (Mg2+ & Ca2+)', sub: 'Binds fruit acids & caramel sugars (ideal 50–90 ppm)', val: ghPpm + ' ppm GH' },
              { label: 'Carbonate Alkalinity (HCO3- Buffer)', sub: 'Smooths pH acidity without flattening (ideal 30–55 ppm)', val: khPpm + ' ppm KH' },
              { label: 'Hardness : Alkalinity Balance', sub: 'Kettle fill target: ' + rec.kettleG + ' g (incl. rinse & margin)', val: ghKhRatio + ' : 1', total: true }
            ]),
            cite: 'Hendon, Colonna-Dashwood & Walsh 2014 J. Agric. Food Chem. 62:4947',
            ctaLabel: 'Tune Water Profile \u2192',
            onCta: function () { openSheet('water-quick-pick', {}, { title: 'Select Brew Water Profile', detent: 'full' }); }
          })
        };

        var filterTabs = [
          ['all',   'All 6'],
          ['temp',  'Temp'],
          ['grind', 'Grind'],
          ['ratio', 'Ratio'],
          ['dose',  'Dose'],
          ['time',  'Time'],
          ['water', 'Water']
        ];

        var orderKeys = activeFocus === 'all'
          ? ['temp', 'grind', 'ratio', 'dose', 'time', 'water']
          : [activeFocus];

        var beanSummaryName = (c.name && c.nameUnsure !== 'yes')
          ? ((c.roaster ? c.roaster + ' · ' : '') + c.name)
          : 'Active Coffee Profile';

        host.appendChild(dom('div', { class: 'bt-sci-why-sheet', id: 'bt-recipe-science-sheet' },
          dom('div', { class: 'bt-sci-context-bar' },
            dom('div', { style: 'min-width:0' },
              dom('b', { style: 'font-size:0.84rem;color:var(--ink);display:block', text: beanSummaryName + ' \u2192 ' + rec.method.label }),
              dom('span', { style: 'font-size:0.74rem;color:var(--ink-secondary)', text: roastLabel + ' · ' + procLabel + ' · ' + ghPpm + ' GH / ' + khPpm + ' KH' })
            ),
            dom('span', { class: 'bt-badge-v62 is-sci', text: 'Live Physics' })
          ),
          dom('div', { class: 'bt-pill-row', role: 'tablist', 'aria-label': 'Recipe Science Parameters' },
            filterTabs.map(function (ft) {
              var isOn = activeFocus === ft[0];
              return dom('button', {
                type: 'button',
                role: 'tab',
                class: 'bt-chip-v6' + (isOn ? ' bt-chip-primary is-active' : ' bt-chip-soft'),
                'aria-selected': String(isOn),
                'data-science-tab': ft[0],
                text: ft[1],
                onclick: function () {
                  activeFocus = ft[0];
                  haptic('tick');
                  paintScience();
                }
              });
            })
          ),
          orderKeys.map(function (k) { return cardsByKey[k]; }),
          activeFocus !== 'all' ? dom('button', {
            type: 'button',
            class: 'bt-chip-v6 bt-chip-soft',
            style: 'width:100%;justify-content:center;min-height:42px;font-weight:800',
            text: 'Show All 6 Recipe Science Breakdowns \u2192',
            onclick: function () { activeFocus = 'all'; haptic('tick'); paintScience(); }
          }) : dom('div', { class: 'bt-card-v6 bt-card-well', style: 'gap:6px' },
            dom('span', { class: 'bt-kicker', text: 'Pre-Brew Kitchen Checklist' }),
            dom('div', { style: 'font-size:0.8rem;line-height:1.48;color:var(--ink)' },
              dom('div', null, '1. Heat at least ', dom('b', { class: 'bt-num', text: rec.kettleG + ' g' }), ' water to ', dom('b', { class: 'bt-num', text: tempF + ' °F (' + tempC.toFixed(1) + ' °C)' }), '.'),
              rec.usesPaper ? dom('div', null, '2. Rinse paper filter with ~50 g hot water to warm brewer & discard rinse water.') : null,
              dom('div', null, '3. Weigh ', dom('b', { class: 'bt-num', text: doseG + ' g' }), ' beans, grind at ', dom('b', { class: 'bt-num', text: grindHeadline }), ', level bed, and tare scale to 0.0 g.')
            )
          )
        ));
      }

      paintScience();
    }

    sh.registerSheet('recipe-science-why', renderRecipeScienceWhySheet, { title: 'Why These Numbers? · Brew Science', detent: 'full' });
    sh.registerSheet('why-recipe', renderRecipeScienceWhySheet, { title: 'Why These Numbers? · Brew Science', detent: 'full' });

    /* H. Legacy 'live-cockpit' sheet alias -> routes cleanly to Step 4 Timer */
    sh.registerSheet('live-cockpit', function (host) {
      closeSheet();
      goBrewStep('timer');
      return dom('div');
    });
  }

  /* ==================== 11. TRAIL BAR & MASTER TAB ORCHESTRATOR ==================== */
  var TRAIL_STEPS_5 = [
    { key: 'coffee', num: '1', label: 'Coffee' },
    { key: 'method', num: '2', label: 'Brewer' },
    { key: 'brew',   num: '3', label: 'Recipe' },
    { key: 'timer',  num: '4', label: 'Timer' },
    { key: 'taste',  num: '5', label: 'Taste' }
  ];

  function buildTrailBarSafe(step) {
    var sh = getShell();
    if (sh && typeof sh.buildBrewTrailBar === 'function') {
      try {
        var el = sh.buildBrewTrailBar(step);
        if (el && el.nodeType) return el;
      } catch (_) {}
    }
    var activeIdx = TRAIL_STEPS_5.findIndex(function (s) { return s.key === step; });
    return dom('nav', { class: 'bt-trail-bar bt-trail-bar-fallback', 'aria-label': '5-Step Home Brew Trail' },
      dom('button', {
        type: 'button',
        class: 'bt-trail-home-btn',
        'aria-label': 'Morning Command Center',
        title: 'Morning Command Center',
        onclick: function () { haptic('tick'); goBrewStep('door'); }
      }, ico('home', 16)),
      TRAIL_STEPS_5.map(function (st, idx) {
        var cls = 'bt-trail-step-pill' + (idx === activeIdx ? ' is-active' : (idx < activeIdx ? ' is-done' : ''));
        return dom('button', {
          type: 'button',
          class: cls,
          'aria-current': idx === activeIdx ? 'step' : false,
          onclick: function () { haptic('tick'); goBrewStep(st.key); }
        },
          dom('span', { class: 'bt-trail-step-num', text: st.num }),
          dom('span', { text: st.label })
        );
      })
    );
  }

  function resolveBrewStep(a, ctx) {
    var valid = { door: 1, coffee: 1, method: 1, brew: 1, timer: 1, taste: 1 };
    var rt = String((ctx && ctx.route) || a.screen || '').toLowerCase();
    if (rt === 'door') return 'door';
    if (rt === 'coffee' || rt === 'start') return 'coffee';
    if (rt === 'method' || (ctx && ctx.sub === 'methods')) return 'method';
    if (rt === 'recipe' || rt === 'change' || rt === 'ready' || rt === 'philips5500' || rt === 'aiden' || rt === 'xbloom' || rt === 'espresso') return 'brew';
    if (rt === 'timer') return 'timer';
    if (rt === 'taste' || rt === 'tasting' || rt === 'cup' || rt === 'perfect' || rt === 'dial' || rt === 'fix') return 'taste';
    if (a.brewStep && valid[a.brewStep]) return a.brewStep;
    return 'door';
  }

  function renderBrewTab(mountEl, ctx) {
    var a = ensureBrewState(getApp());
    var step = resolveBrewStep(a, ctx);
    a.brewStep = step;

    if (step !== 'timer' && _timerSession.running) {
      stopActiveTimerSession(false);
    }

    var shellWrap = dom('div', { class: 'bt-brew-shell', 'data-brew-step': step });

    /* Always mount 5-Step Trail Bar at top whenever step !== 'door' */
    if (step !== 'door') {
      shellWrap.appendChild(buildTrailBarSafe(step));
    }

    var stageEl = dom('div', { class: 'bt-brew-stage' });
    shellWrap.appendChild(stageEl);
    mountEl.appendChild(shellWrap);

    if (step === 'door') {
      renderDoorScreen(stageEl, a);
    } else if (step === 'coffee') {
      if (typeof window !== 'undefined' && window.BTCoffeeEntry && typeof window.BTCoffeeEntry.renderStep1 === 'function') {
        window.BTCoffeeEntry.renderStep1(stageEl);
      } else {
        /* Safe graceful fallback if 04 called early */
        stageEl.appendChild(dom('section', { class: 'bt-card-v6' },
          dom('div', { class: 'bt-kicker', text: 'Step 1 of 5 · Coffee Capture' }),
          dom('h1', { class: 'bt-screen-title', text: 'What coffee are we brewing?' }),
          dom('input', {
            type: 'text',
            class: 'bt-input-v62',
            placeholder: 'Coffee name (e.g. Ethiopia Worka)',
            value: (a.coffee && a.coffee.name) || '',
            oninput: function (e) { a.coffee.name = e.target.value; saveDraft(); }
          }),
          buildStickyCtaBar({
            label: 'Choose Brewer \u2192',
            sub: 'Continue to Step 2',
            onClick: function () { goBrewStep('method'); }
          })
        ));
      }
    } else if (step === 'method') {
      renderStep2Method(stageEl, a);
    } else if (step === 'brew') {
      renderStep3Recipe(stageEl, a);
    } else if (step === 'timer') {
      renderStep4Timer(stageEl, a);
    } else if (step === 'taste') {
      var focusFix = !!a.focusFix;
      a.focusFix = false;
      if (typeof window !== 'undefined' && window.BTTasteStep && typeof window.BTTasteStep.renderStep5 === 'function') {
        window.BTTasteStep.renderStep5(stageEl, { focusFix: focusFix });
      } else {
        /* Safe graceful fallback if 06 called early */
        stageEl.appendChild(dom('section', { class: 'bt-card-v6' },
          dom('div', { class: 'bt-kicker', text: 'Step 5 of 5 · Taste & Perfect' }),
          dom('h1', { class: 'bt-screen-title', text: 'Rate & perfect your cup' }),
          dom('p', { class: 'bt-subcopy', text: 'Sensory tasting studio ready.' }),
          buildStickyCtaBar({
            label: 'Back to Recipe \u2192',
            onClick: function () { goBrewStep('brew'); }
          })
        ));
      }
    }

    /* Deduplicate trail bar if any child step also mounted one */
    var trails = shellWrap.querySelectorAll('.bt-trail-bar');
    for (var t = 1; t < trails.length; t++) {
      if (trails[t].parentNode) trails[t].parentNode.removeChild(trails[t]);
    }

    return shellWrap;
  }

  /* ==================== 12. REGISTER TAB, ROUTES & PUBLIC EXPORTS ==================== */
  var shInit = getShell();
  if (shInit) {
    if (typeof shInit.registerTab === 'function') {
      shInit.registerTab('brew', renderBrewTab);
    }
    registerBrewSheets();
    if (typeof shInit.registerRoute === 'function') {
      ['door', 'coffee', 'method', 'brew', 'recipe', 'timer', 'taste', 'tasting', 'perfect'].forEach(function (rk) {
        shInit.registerRoute(rk, function () {
          var a = getApp();
          a.activeTab = 'brew';
          if (rk === 'perfect') a.focusFix = true;
          a.brewStep = rk === 'recipe' ? 'brew' : (rk === 'tasting' || rk === 'perfect' ? 'taste' : rk);
          rerender();
        });
      });
      shInit.registerRoute('loadshared', function () {
        var a = getApp();
        a.activeTab = 'brew';
        a.brewStep = 'door';
        rerender();
        openSheet('import-shared-brew', {}, { title: 'Import Shared Brew & Translate Grind', detent: 'half' });
      });
      ['philips5500', 'aiden', 'xbloom', 'espresso'].forEach(function (mk) {
        shInit.registerRoute(mk, function () {
          var a = ensureBrewState(getApp());
          a.activeTab = 'brew';
          a.brew.method = mk;
          if (mk !== 'philips5500') synthesizeScienceIntoApp(a, mk, { force: true });
          a.brewStep = 'brew';
          saveDraft();
          rerender();
        });
      });
    }
    /* Repaint Brew Studio live whenever Science Lens changes */
    if (shInit.BTScienceLens && typeof shInit.BTScienceLens.subscribe === 'function') {
      shInit.BTScienceLens.subscribe(function () {
        var a = getApp();
        if (a && a.activeTab === 'brew') rerender();
      });
    }
  }

  if (typeof window !== 'undefined') {
    window.BTPhilips5500Mirror = {
      render: buildPhilips5500ConsoleCard,
      computeSnapshot: computePhilipsSnap,
      getRoster22: getPhilipsRoster
    };
    window.BTBrewStudio = {
      renderTab: renderBrewTab,
      goStep: goBrewStep,
      synthesizeForApp: synthesizeScienceIntoApp,
      applyWaterSelection: applyBrewWaterSelection,
      decodeSharedBrew: decodeAnySharedBrew,
      buildShareBundle: buildBt6ShareBundle,
      resetTimerSession: function () { stopActiveTimerSession(true); _timerSession.brewSig = ''; },
      startFreshCoffee: function (goToStep1) { startFreshCoffeeFlow(getApp(), goToStep1 !== false); },
      timerSession: _timerSession,
      audio: AudioCoach
    };
  }
})();

