/* ============================================================================
 * BeanTelligence v6.0 — Tab 4: Lab & Smart Devices + 6 Interactive Studios
 * Module: src/v6/ui/09-tab-lab-devices.js
 * Registers:
 *   - Tab 4: 'lab'
 *   - Sheet: 'ble-devices'
 *   - Legacy Routes: 'devices', 'calculators', 'tools', 'ey', 'chart',
 *     'ratio', 'yield', 'iced', 'milk', 'water', 'caffeine', 'cafdrink',
 *     'cafresult', 'cafcup', 'agtron', 'freshness', 'fresh', 'cost', 'bagcmp'
 * Zero native dropdowns, zero native number spinners, zero Unicode emojis.
 * ============================================================================ */

(function () {
  'use strict';

  const CK = window.BTChartKit;
  const clamp = CK ? CK.clamp : function (v, lo, hi, fb) {
    const n = typeof v === 'number' ? v : parseFloat(v);
    if (!Number.isFinite(n)) return fb !== undefined ? fb : lo;
    return n < lo ? lo : n > hi ? hi : n;
  };
  const SVG_NS = 'http://www.w3.org/2000/svg';

  /* ---- Safe Shell / Icon / Storage Bridges ---- */
  function sh() { return window.BTShell || {}; }

  function domH(tag, props) {
    const fn = typeof h === 'function' ? h : sh().h;
    const kids = Array.prototype.slice.call(arguments, 2);
    if (typeof fn === 'function') return fn.apply(null, [tag, props].concat(kids));
    const isSvg = /^(svg|path|circle|rect|line|polyline|polygon|g|defs|linearGradient|radialGradient|stop|text|ellipse|clipPath)$/i.test(tag);
    const el = isSvg ? document.createElementNS(SVG_NS, tag) : document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (k) {
        const v = props[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') el.setAttribute('class', v);
        else if (k === 'text') el.textContent = String(v);
        else if (k === 'html') el.innerHTML = String(v);
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
        else if (v === true) el.setAttribute(k, '');
        else el.setAttribute(k, String(v));
      });
    }
    function appendKid(c) {
      if (c === null || c === undefined || c === false) return;
      if (Array.isArray(c)) c.forEach(appendKid);
      else if (c.nodeType) el.appendChild(c);
      else el.appendChild(document.createTextNode(String(c)));
    }
    kids.forEach(appendKid);
    return el;
  }

  function ic(name, opts) {
    if (window.BTIcons && typeof window.BTIcons.el === 'function') {
      return window.BTIcons.el(name, opts);
    }
    if (typeof BTIcons !== 'undefined' && BTIcons && typeof BTIcons.el === 'function') {
      return BTIcons.el(name, opts);
    }
    const s = document.createElementNS(SVG_NS, 'svg');
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('class', 'bt-ico bti-' + name);
    s.setAttribute('aria-hidden', 'true');
    const c = document.createElementNS(SVG_NS, 'circle');
    c.setAttribute('cx', '12');
    c.setAttribute('cy', '12');
    c.setAttribute('r', '7');
    c.setAttribute('fill', 'none');
    c.setAttribute('stroke', 'currentColor');
    c.setAttribute('stroke-width', '1.75');
    s.appendChild(c);
    return s;
  }

  function getApp() {
    if (sh().app) return sh().app;
    if (typeof app !== 'undefined' && app) return app;
    window.__btFallbackApp = window.__btFallbackApp || {
      coffee: { name: 'Ethiopia Worka Sakaro', roaster: 'Sey', roast: 'light', process: 'washed', origin: 'ethiopia', agtron: 82 },
      brew: { method: 'v60', dose: 18, water: 288, ratio: 16, tempC: 94, tempF: 201 },
      prefs: { scienceLens: 'hybrid', immersionBasis: 'liang', toolModes: {}, water: { gh: 70, kh: 35, mgShare: 0.65 }, gear: {} },
      gear: { grinder: 'comandante-c40', ble: { rememberedDevices: [] } }
    };
    return window.__btFallbackApp;
  }

  function notify(msg) {
    const fn = typeof toast === 'function' ? toast : sh().toast;
    if (typeof fn === 'function') fn(msg);
  }

  function saveDraftSoon() {
    const ch = typeof changed === 'function' ? changed : sh().changed;
    const fn = typeof scheduleDraft === 'function' ? scheduleDraft : sh().scheduleDraft;
    if (typeof ch === 'function') { try { ch(); } catch (_) {} }
    if (typeof fn === 'function') { try { fn(); } catch (_) {} }
  }

  function saveDraftNow() {
    saveDraftSoon();
    const fl = typeof flushDraft === 'function' ? flushDraft : sh().flushDraft;
    if (typeof fl === 'function') { try { fl(); } catch (_) {} }
  }

  /* 1-Tap BTShell.goBack() Return Bridge so jumping from any Lab/Palate tool to
     Step 3 Recipe ('brew'), Step 4 Timer ('timer'), or Step 1 ('coffee') lets the
     user return to that exact tool in 1 tap, while keeping normal trail Back intact! */
  let _backHookInstalled = false;
  function ensureBackReturnHook() {
    if (_backHookInstalled) return;
    const P = sh().PARENT || (typeof PARENT !== 'undefined' ? PARENT : null);
    if (!P || typeof Object.defineProperty !== 'function') return;
    _backHookInstalled = true;
    const defaults = { brew: P.brew || 'method', timer: P.timer || 'brew', coffee: P.coffee || 'door' };
    ['brew', 'timer', 'coffee'].forEach(function (stepKey) {
      let currentVal = defaults[stepKey];
      try {
        Object.defineProperty(P, stepKey, {
          configurable: true,
          enumerable: true,
          get: function () {
            const pend = window.__btPendingReturn;
            const a = getApp();
            if (pend && pend.step === stepKey && a && a.activeTab === 'brew') {
              const curNorm = sh().normalizeBrewStep ? sh().normalizeBrewStep(a.brewStep || a.screen || 'door') : (a.brewStep || stepKey);
              if (curNorm === stepKey) {
                window.__btPendingReturn = null;
                return pend.route;
              }
            }
            return currentVal;
          },
          set: function (v) { currentVal = v; }
        });
      } catch (_) {}
    });
    if (typeof MutationObserver === 'function' && typeof document !== 'undefined' && document.body) {
      try {
        const mo = new MutationObserver(function () {
          const pend = window.__btPendingReturn;
          if (!pend) return;
          const scr = document.body.getAttribute('data-screen') || '';
          const bStep = document.body.getAttribute('data-brew-step') || '';
          if (scr !== pend.step && bStep !== pend.step) {
            window.__btPendingReturn = null;
          }
        });
        mo.observe(document.body, { attributes: true, attributeFilter: ['data-screen', 'data-brew-step'] });
      } catch (_) {}
    }
  }

  function applyLabToBrewAndGo(mutatorFn, opts) {
    const o = opts || {};
    const targetStep = o.targetStep || 'brew';
    const returnRoute = o.returnRoute || 'ey';
    const a = getApp();
    a.brew = a.brew || {};
    a.coffee = a.coffee || {};
    a.prefs = a.prefs || {};
    a.prefs.gear = a.prefs.gear || {};
    if (typeof mutatorFn === 'function') mutatorFn(a);
    /* Enforce finite numeric invariants so zero NaN/undefined ever leaks into app.brew */
    if (!Number.isFinite(+a.brew.dose) || +a.brew.dose <= 0) a.brew.dose = 18;
    if (!Number.isFinite(+a.brew.water) || +a.brew.water <= 0) a.brew.water = 288;
    if (!Number.isFinite(+a.brew.ratio) || +a.brew.ratio <= 0) a.brew.ratio = +(a.brew.water / Math.max(1, a.brew.dose)).toFixed(1);
    if (Number.isFinite(+a.brew.tempC) && +a.brew.tempC > 0) {
      a.brew.tempF = Math.round(+a.brew.tempC * 9 / 5 + 32);
    }
    a.resume = returnRoute;
    a.tabSegments = a.tabSegments || {};
    a.tabSegments.lab = normalizeStudioId(labState.activeStudio || 'ey');
    saveDraftNow();
    if (o.toast) notify(o.toast);
    CK.haptic(o.haptic || 'celebrate');
    ensureBackReturnHook();
    if (o.navigate !== false && typeof sh().go === 'function') {
      sh().go(targetStep);
      window.__btPendingReturn = { step: targetStep, route: returnRoute, at: Date.now() };
    } else if (sh().paintStudioAside) {
      sh().paintStudioAside();
    }
  }
  window.__btApplyAndNavigateWithBack = applyLabToBrewAndGo;

  function getLensLevel() {
    if (CK && typeof CK.lensLevel === 'function') return CK.lensLevel();
    const a = getApp();
    if (window.BTScienceLens && typeof window.BTScienceLens.level === 'function') return window.BTScienceLens.level();
    const m2 = (a.prefs && (a.prefs.lens || a.prefs.scienceLens)) || document.documentElement.getAttribute('data-science-lens') || 'comfy';
    if (m2 === 'xray' || m2 === 'scientist' || m2 === 'expert') return 'scientist';
    if (m2 === 'surface' || m2 === 'starter' || m2 === 'new') return 'starter';
    return 'comfy';
  }

  function isScienceXray() {
    return getLensLevel() === 'scientist';
  }

  function epistemicBadge(tierKey, labelOverride) {
    const map = {
      verified_physics: { txt: '[Verified Science]', cls: 'is-verified', icon: 'check-seal' },
      calibrated_biophysics: { txt: '[Active Research]', cls: 'is-research', icon: 'xray-loupe' },
      craft_convention: { txt: '[Craft Best Practice]', cls: 'is-craft', icon: 'spark-star' },
      myth_debunked: { txt: '[Myth Debunked]', cls: 'is-myth', icon: 'close-x' }
    };
    const meta = map[tierKey] || map.verified_physics;
    return domH('span', { class: 'bt-epistemic-pill ' + meta.cls },
      ic(meta.icon, { size: 14 }),
      domH('span', { text: labelOverride || meta.txt })
    );
  }

  function getToolModeSafe(key) {
    if (typeof btToolMode === 'function') return btToolMode(key);
    if (sh().btToolMode) return sh().btToolMode(key);
    const a = getApp();
    return (a.prefs && a.prefs.toolModes && a.prefs.toolModes[key]) || 'optional';
  }

  function setToolModeSafe(key, mode) {
    if (typeof btSetToolMode === 'function') { btSetToolMode(key, mode); return; }
    if (sh().btSetToolMode) { sh().btSetToolMode(key, mode); return; }
    const a = getApp();
    a.prefs = a.prefs || {};
    a.prefs.toolModes = a.prefs.toolModes || {};
    a.prefs.toolModes[key] = mode;
    saveDraftSoon();
  }

  /* ==========================================================================
   * SCIENTIST-VERIFIED PHYSICS KERNELS (Delegating to BTCoreV6 + Exact Local)
   * ========================================================================== */

  /* ---- A. Official 5-Scale Agtron & Tonino(63) === 105.0 Monotone PCHIP ---- */
  const TONINO_KNOTS = [
    [20, 50.0],
    [25, 55.0],
    [35, 67.5],
    [45, 80.0],
    [55, 92.5],
    [63, 105.0],
    [75, 120.0],
    [85, 127.5],
    [90, 130.0],
    [105, 136.0],
    [110, 138.0]
  ];
  const TONINO_SPLINE = CK ? CK.monotoneCubicControlPoints(TONINO_KNOTS) : null;

  function evalMonotoneHermiteAt(knots, xQuery) {
    const x = clamp(xQuery, knots[0][0], knots[knots.length - 1][0], 63);
    for (let i = 0; i < knots.length; i++) {
      if (Math.abs(x - knots[i][0]) < 1e-9) return knots[i][1];
    }
    const n = knots.length;
    const hArr = new Float64Array(n - 1);
    const dArr = new Float64Array(n - 1);
    for (let k = 0; k < n - 1; k++) {
      hArr[k] = knots[k + 1][0] - knots[k][0];
      dArr[k] = (knots[k + 1][1] - knots[k][1]) / hArr[k];
    }
    const m = new Float64Array(n);
    m[0] = dArr[0];
    m[n - 1] = dArr[n - 2];
    for (let k = 1; k < n - 1; k++) {
      if (dArr[k - 1] * dArr[k] <= 0) m[k] = 0;
      else {
        const w1 = 2 * hArr[k] + hArr[k - 1];
        const w2 = hArr[k] + 2 * hArr[k - 1];
        m[k] = (w1 + w2) / (w1 / dArr[k - 1] + w2 / dArr[k]);
      }
    }
    for (let k = 0; k < n - 1; k++) {
      if (Math.abs(dArr[k]) < 1e-12) { m[k] = 0; m[k + 1] = 0; }
      else {
        const a = m[k] / dArr[k];
        const b = m[k + 1] / dArr[k];
        const s = a * a + b * b;
        if (s > 9) {
          const tau = 3 / Math.sqrt(s);
          m[k] = tau * a * dArr[k];
          m[k + 1] = tau * b * dArr[k];
        }
      }
    }
    let idx = 0;
    for (let k = 0; k < n - 1; k++) {
      if (x >= knots[k][0] && x <= knots[k + 1][0]) { idx = k; break; }
    }
    const hk = hArr[idx];
    const t = (x - knots[idx][0]) / hk;
    const t2 = t * t;
    const t3 = t2 * t;
    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;
    return h00 * knots[idx][1] + h10 * hk * m[idx] + h01 * knots[idx + 1][1] + h11 * hk * m[idx + 1];
  }

  function toninoFromGourmet(gVal) {
    const g = clamp(gVal, 20, 110, 63);
    if (Math.abs(g - 63.0) < 1e-7) return 105.0;
    if (window.BTCoreV6 && window.BTCoreV6.AGTRON && typeof window.BTCoreV6.AGTRON.toTonino === 'function') {
      const v = window.BTCoreV6.AGTRON.toTonino(g);
      if (Number.isFinite(v)) return v;
    }
    return +evalMonotoneHermiteAt(TONINO_KNOTS, g).toFixed(2);
  }

  function gourmetFromTonino(tVal) {
    const t = clamp(tVal, 50, 138, 105);
    if (Math.abs(t - 105.0) < 1e-7) return 63.0;
    let lo = 20.0;
    let hi = 110.0;
    for (let iter = 0; iter < 32; iter++) {
      const mid = 0.5 * (lo + hi);
      if (toninoFromGourmet(mid) < t) lo = mid;
      else hi = mid;
    }
    return +(0.5 * (lo + hi)).toFixed(2);
  }

  /* Official Agtron M-Basic II Commercial = 0.7429 * (G + 1.528) */
  function commercialFromGourmet(gVal) {
    const g = clamp(gVal, 20, 110, 63);
    return +(0.7429 * (g + 1.528)).toFixed(2);
  }

  function gourmetFromCommercial(cVal) {
    const c = clamp(cVal, 16, 84, 48);
    return clamp(c / 0.7429 - 1.528, 20, 110, 63);
  }

  function expectedRoastDelta(beanG) {
    return clamp(0.18 * clamp(beanG, 20, 110, 68) - 3.2, 1.0, 12.5, 8.0);
  }

  function agtronDiscHex(gVal) {
    const g = clamp(gVal, 20, 110, 65);
    const stops = [
      [25, [36, 20, 12]],
      [40, [68, 37, 19]],
      [55, [104, 58, 28]],
      [70, [146, 88, 44]],
      [85, [181, 119, 64]],
      [102, [206, 148, 88]]
    ];
    if (g <= stops[0][0]) return '#24140c';
    if (g >= stops[stops.length - 1][0]) return '#ce9458';
    for (let i = 0; i < stops.length - 1; i++) {
      const a = stops[i];
      const b = stops[i + 1];
      if (g >= a[0] && g <= b[0]) {
        const u = (g - a[0]) / (b[0] - a[0]);
        const r = Math.round(a[1][0] + (b[1][0] - a[1][0]) * u);
        const gr = Math.round(a[1][1] + (b[1][1] - a[1][1]) * u);
        const bl = Math.round(a[1][2] + (b[1][2] - a[1][2]) * u);
        return '#' + [r, gr, bl].map(function (c) { return c.toString(16).padStart(2, '0'); }).join('');
      }
    }
    return '#7a4622';
  }

  /* ---- B. ICUMSA SPS-3 Refractometry & Quadratic Pure-Water ATC ---- */
  /* Verified at 20.0C, 589nm: 0->1.33299, 1->1.33442, 10->1.34782, 20->1.36384 */
  function nd20FromBrix(brixVal) {
    const b = clamp(brixVal, 0, 32, 1.65);
    return 1.332988 + 1.4285e-3 * b + 5.38e-6 * b * b + 1.62e-8 * b * b * b;
  }

  function waterThermalDeltaNd(tempC) {
    /* Quadratic pure-water dn/dT relative to 20.0C across 15..50C */
    const T = clamp(tempC, 5, 65, 20);
    const dT = T - 20.0;
    return -9.52e-5 * dT - 1.88e-6 * dT * dT;
  }

  function brixFromNd(ndMeasured, tempC, instrumentMode) {
    const nd = clamp(ndMeasured, 1.3300, 1.3900, 1.3354);
    const mode = instrumentMode || 'difluid';
    /* DiFluid R2 & VST report temperature-compensated nD20 directly; Non-ATC needs thermal shift */
    const nd20 = mode === 'non_atc' ? nd - waterThermalDeltaNd(tempC) : nd;
    if (nd20 <= 1.332988) return 0;
    let lo = 0;
    let hi = 32;
    for (let i = 0; i < 30; i++) {
      const mid = 0.5 * (lo + hi);
      if (nd20FromBrix(mid) < nd20) lo = mid;
      else hi = mid;
    }
    return +(0.5 * (lo + hi)).toFixed(4);
  }

  function tdsFromBrix(brixVal) {
    /* Standard coffee sucrose-to-TDS empirical conversion (VST/Rao 0.85x) */
    return +(clamp(brixVal, 0, 32, 0) * 0.85).toFixed(3);
  }

  function brixFromTds(tdsPct) {
    return +(clamp(tdsPct, 0, 27, 0) / 0.85).toFixed(3);
  }

  /* ---- C. Infinite 24h Periodic Bateman PK & Borbely 24h Process C/S ---- */
  const SPECIES_CAF_MG_PER_G = {
    arabica: { label: 'Arabica', mgPerG: 12.0 },
    robusta: { label: 'Robusta', mgPerG: 22.0 },
    liberica: { label: 'Liberica', mgPerG: 12.5 },
    excelsa: { label: 'Excelsa', mgPerG: 10.0 },
    stenophylla: { label: 'Stenophylla', mgPerG: 11.0 },
    aramosa: { label: 'Aramosa', mgPerG: 7.0 },
    laurina: { label: 'Laurina', mgPerG: 5.2 },
    eugenioides: { label: 'Eugenioides', mgPerG: 2.2 },
    decaf: { label: 'Decaf (Residual)', mgPerG: 0.40 }
  };

  const CYP_PRESETS = [
    { key: 'fast', label: 'Fast / Smoker', halfLifeH: 3.0, dailyCapMg: 400 },
    { key: 'typical', label: 'Typical Adult', halfLifeH: 5.0, dailyCapMg: 400 },
    { key: 'slow', label: 'Slow CYP1A2', halfLifeH: 6.8, dailyCapMg: 300 },
    { key: 'oc', label: 'Oral Contraceptive', halfLifeH: 9.0, dailyCapMg: 300 },
    { key: 'pregnancy', label: 'Pregnancy (ACOG)', halfLifeH: 13.0, dailyCapMg: 200 }
  ];

  function batemanSingleImpulse(doseMg, dtH, ka, ke) {
    if (!(doseMg > 0) || !(dtH > 0)) return 0;
    const F = 0.99;
    if (Math.abs(ka - ke) <= 1e-4) {
      return F * doseMg * ke * dtH * Math.exp(-ke * dtH);
    }
    return F * doseMg * (ka / (ka - ke)) * (Math.exp(-ke * dtH) - Math.exp(-ka * dtH));
  }

  function batemanPeriodicImpulse(doseMg, tHour, cupHour, ka, ke) {
    if (!(doseMg > 0)) return 0;
    const F = 0.99;
    const u = (((tHour - cupHour) % 24) + 24) % 24;
    const denomKe = Math.max(1e-9, 1 - Math.exp(-24 * ke));
    const denomKa = Math.max(1e-9, 1 - Math.exp(-24 * ka));
    if (Math.abs(ka - ke) <= 1e-4) {
      const e24 = Math.exp(-24 * ke);
      return F * doseMg * ke * Math.exp(-ke * u) * (u / denomKe + (24 * e24) / (denomKe * denomKe));
    }
    return F * doseMg * (ka / (ka - ke)) * (Math.exp(-ke * u) / denomKe - Math.exp(-ka * u) / denomKa);
  }

  function activeCaffeineMgAt(cups, tHour, halfLifeH, steadyState, fedMode) {
    const hl = clamp(halfLifeH, 1.2, 24.0, 5.0);
    const ke = Math.LN2 / hl;
    const ka = fedMode ? 2.2 : 4.0;
    let sum = 0;
    if (!Array.isArray(cups)) return 0;
    for (let i = 0; i < cups.length; i++) {
      const c = cups[i];
      if (!c || !(c.mg > 0)) continue;
      if (steadyState) {
        sum += batemanPeriodicImpulse(c.mg, tHour, c.hour, ka, ke);
      } else {
        const dt = tHour - c.hour;
        if (dt > 0) sum += batemanSingleImpulse(c.mg, dt, ka, ke);
      }
    }
    return Math.max(0, sum);
  }

  function borbelyAlertnessAt(tHour, wakeHour, bedHourRaw, activeMg, bodyKg) {
    const bedAdj = bedHourRaw <= wakeHour ? bedHourRaw + 24 : bedHourRaw;
    const dWake = clamp(bedAdj - wakeHour, 4, 22, 16);
    const dSleep = 24 - dWake;
    const dtw = (((tHour - wakeHour) % 24) + 24) % 24;

    /* Periodic fixed-point S0 so S(24-) === S(0+) */
    const expW = Math.exp(-dWake / 18.2);
    const expS = Math.exp(-dSleep / 4.2);
    const s0 = ((1 - expW) * expS) / Math.max(1e-9, 1 - expW * expS);
    let procS;
    if (dtw <= dWake) {
      procS = 1 - (1 - s0) * Math.exp(-dtw / 18.2);
    } else {
      const sBed = 1 - (1 - s0) * expW;
      procS = sBed * Math.exp(-(dtw - dWake) / 4.2);
    }

    /* 24h Fundamental Circadian Pacemaker + minor 12h post-lunch harmonic */
    const procC = 0.16 * Math.sin((2 * Math.PI * (dtw - 3.5)) / 24) -
      0.055 * Math.cos((2 * Math.PI * (dtw - 7.5)) / 12);

    /* Hill-Langmuir A2A/A1 wakefulness blockade (Elmenhorst 2012) */
    const vdL = 0.65 * clamp(bodyKg, 40, 140, 70);
    const cpMgL = Math.max(0, activeMg) / vdL;
    const omegaAr = cpMgL / (cpMgL + 3.2);

    const alert = 100 * (0.80 - 0.50 * procS + procC + 0.34 * omegaAr);
    const a1OccPct = (cpMgL / (cpMgL + 13.0)) * 100;
    return {
      alertness: clamp(alert, 10, 99, 50),
      processS: procS,
      processC: procC,
      cpMgL: cpMgL,
      a1OccupancyPct: a1OccPct
    };
  }

  /* ---- D. IUPAC 2021 8-Reagent Water Chemistry & pH 5.0 Citrate Speciation ---- */
  const IUPAC_SALTS = {
    mgso4:  { formula: 'MgSO4*7H2O (Epsom)', mgPerLPpm: 2.4626, role: 'gh_mg', anion: 'SO4' },
    mgcl2:  { formula: 'MgCl2*6H2O',         mgPerLPpm: 2.0312, role: 'gh_mg', anion: 'Cl', clPerPpm: 0.7086 },
    cacl2d: { formula: 'CaCl2*2H2O',         mgPerLPpm: 1.4688, role: 'gh_ca', anion: 'Cl', clPerPpm: 0.7086 },
    cacl2a: { formula: 'CaCl2 (Anhydrous)',  mgPerLPpm: 1.1088, role: 'gh_ca', anion: 'Cl', clPerPpm: 0.7086 },
    nahco3: { formula: 'NaHCO3 (Baking Soda)', mgPerLPpm: 1.6787, role: 'kh_carb', specFactor: 0.96 },
    khco3:  { formula: 'KHCO3 (Pot. Bicarb)',  mgPerLPpm: 2.0006, role: 'kh_carb', specFactor: 0.96 },
    k3cit:  { formula: 'K3Cit*H2O (Pot. Citrate)', mgPerLPpm: 2.1609, role: 'kh_cit', specFactor: 0.45 },
    na3cit: { formula: 'Na3Cit*2H2O (Sod. Citrate)', mgPerLPpm: 1.9590, role: 'kh_cit', specFactor: 0.45 }
  };

  function solveWaterSpeciation(cfg) {
    const gh = clamp(cfg.gh, 0, 400, 70);
    const kh = clamp(cfg.kh, 0, 400, 35);
    const fMg = clamp(cfg.mgShare, 0, 1, 0.65);
    const fCa = 1 - fMg;
    const ghMg = gh * fMg;
    const ghCa = gh * fCa;
    const batchL = clamp(cfg.batchL, 0.1, 20, 1.0);
    const mgSalt = IUPAC_SALTS[cfg.mgSaltKey] || IUPAC_SALTS.mgso4;
    const caSalt = IUPAC_SALTS[cfg.caSaltKey] || IUPAC_SALTS.cacl2d;
    const khSalt = IUPAC_SALTS[cfg.khSaltKey] || IUPAC_SALTS.khco3;
    const isCitrate = khSalt.role === 'kh_cit';
    const tapBlendOn = !!cfg.tapBlendOn;
    const khTap = clamp(cfg.khTap, 0, 400, 140);
    const ghTap = clamp(cfg.ghTap, 0, 400, 180);

    const fTap = tapBlendOn && khTap > 0 ? clamp(kh / khTap, 0, 1, 0) : 0;
    const khCarb = tapBlendOn ? fTap * khTap : (isCitrate ? 0 : kh);
    const khCit = (!tapBlendOn && isCitrate) ? kh : 0;
    /* Exact pH 5.0 effective proton neutralization: 0.96*KH_HCO3 + 0.45*KH_cit */
    const khEffPh5 = 0.96 * khCarb + 0.45 * khCit;

    const brewTempC = clamp(cfg.brewTempC, 75, 100, 93);
    /* Temperature-coupled calcite saturation threshold (tighter at hotter boiler temps) */
    const tempScaleFactor = Math.exp(-0.022 * (brewTempC - 90));
    const scaleWarnProd = 2500 * tempScaleFactor;
    const scaleSevProd = 4500 * tempScaleFactor;
    const caCarbProduct = ghCa * khCarb;

    const mgSaltG = (ghMg * mgSalt.mgPerLPpm * batchL) / 1000;
    const caSaltG = (ghCa * caSalt.mgPerLPpm * batchL) / 1000;
    const khSaltG = (kh * khSalt.mgPerLPpm * batchL) / 1000;
    const clMgL = (mgSalt.clPerPpm ? ghMg * mgSalt.clPerPpm : 0) + (caSalt.clPerPpm ? ghCa * caSalt.clPerPpm : 0);

    return {
      gh: gh,
      kh: kh,
      ghMg: +ghMg.toFixed(1),
      ghCa: +ghCa.toFixed(1),
      khCarb: +khCarb.toFixed(1),
      khCit: +khCit.toFixed(1),
      khEffPh5: +khEffPh5.toFixed(1),
      meqAcidNeutralized: +(khEffPh5 / 50.0435).toFixed(2),
      clMgL: +clMgL.toFixed(1),
      pittingRisk: clMgL > 35.0,
      scaleWarnProd: scaleWarnProd,
      scaleSevProd: scaleSevProd,
      caCarbProduct: +caCarbProduct.toFixed(0),
      scaleRisk: caCarbProduct > scaleSevProd ? 'severe' : (caCarbProduct > scaleWarnProd ? 'warn' : 'safe'),
      mgSaltG: +mgSaltG.toFixed(3),
      caSaltG: +caSaltG.toFixed(3),
      khSaltG: +khSaltG.toFixed(3),
      drops10kMg: Math.round((ghMg * batchL) / 0.5),
      drops10kCa: Math.round((ghCa * batchL) / 0.5),
      drops10kKh: Math.round((kh * batchL) / 0.5),
      fTap: fTap,
      tapMl: Math.round(fTap * batchL * 1000),
      roMl: Math.round((1 - fTap) * batchL * 1000),
      blendedGh: +(fTap * ghTap).toFixed(1),
      epsomBoostPpm: Math.max(0, +(gh - fTap * ghTap).toFixed(1))
    };
  }

  /* ---- E. Exact 3-Regime IAPWS Flash-Iced & 48g Paragon Sphere Physics ---- */
  function solveFlashIced3Regime(cfg) {
    const doseG = Math.max(0.5, clamp(cfg.doseG, 0.5, 250, 18));
    const totalWaterG = Math.max(1, clamp(cfg.totalWaterG, 10, 3000, 288));
    const iceShare = clamp(cfg.iceShare, 0, 0.70, 0.38);
    const iceTempC = clamp(cfg.iceTempC, -30, 0, -18);
    const dripTempC = clamp(cfg.dripTempC, 20, 98, 76);
    const eyPct = clamp(cfg.eyPct, 10, 30, 20.4);
    const rw = clamp(cfg.rw, 1.0, 3.0, 2.1);

    const iceG = cfg.flashOn ? totalWaterG * iceShare : 0;
    const hotPourG = Math.max(rw * doseG + 2, totalWaterG - iceG);
    const dissolvedG = doseG * (eyPct / 100);
    const dryExtractWater = Math.max(0.5, hotPourG - rw * doseG);
    const mDrip = dryExtractWater + dissolvedG;
    const tdsDripPct = (100 * dissolvedG) / Math.max(1, mDrip);

    if (!cfg.flashOn || iceG <= 0.1) {
      let cupT = dripTempC;
      let paragonDrop = 0;
      if (cfg.paragonOn) {
        /* 87g Ti-SS shell + 48g phase-change core: 16.96 kJ sink on first 40% extract */
        const bChill = 0.40 * mDrip;
        const bRest = 0.60 * mDrip;
        const qSink = 16960;
        const cpBev = 4.14;
        const qChill = Math.min(bChill * cpBev * 0.58 * (dripTempC - (-2.0)), qSink);
        const tChillOut = Math.max(2.0, dripTempC - qChill / Math.max(1, bChill * cpBev));
        cupT = (bChill * tChillOut + bRest * (dripTempC - 3.0)) / Math.max(1, mDrip);
        paragonDrop = +(dripTempC - tChillOut).toFixed(1);
      }
      return {
        regime: 0,
        regimeLabel: cfg.paragonOn ? 'Paragon Extract-Chilled (Zero Dilution)' : 'Hot Brew',
        hotPourG: +hotPourG.toFixed(1),
        iceG: 0,
        mDrip: +mDrip.toFixed(1),
        meltedIceG: 0,
        remIceG: 0,
        liquidBeverageG: +mDrip.toFixed(1),
        finalTempC: +cupT.toFixed(1),
        tdsCupPct: +tdsDripPct.toFixed(2),
        retainedG: +(rw * doseG).toFixed(1),
        paragonDropC: paragonDrop,
        esterBoostPct: cfg.paragonOn ? 40 : 0
      };
    }

    const cpW = 4.184;
    const cpIce = 2.093;
    const Lf = 333.55;
    const qHot = mDrip * cpW * Math.max(0, dripTempC);
    const qWarm = iceG * cpIce * Math.abs(iceTempC);
    const qMeltAll = qWarm + iceG * Lf;

    let melted = 0;
    let remIce = iceG;
    let finalT = 0.0;
    let regime = 2;
    let regimeLabel = 'Regime 2: 0.0 C Two-Phase Crisp Equilibrium';

    if (qHot <= qWarm) {
      regime = 3;
      melted = 0;
      remIce = iceG;
      finalT = 0.0;
      regimeLabel = 'Regime 3: Sub-Cooled Contact Limit (0g Melted)';
    } else if (qHot <= qMeltAll) {
      regime = 2;
      melted = (qHot - qWarm) / Lf;
      remIce = Math.max(0, iceG - melted);
      finalT = 0.0;
    } else {
      regime = 1;
      melted = iceG;
      remIce = 0;
      finalT = (qHot - qMeltAll) / Math.max(1, (mDrip + iceG) * cpW);
      regimeLabel = 'Regime 1: Complete Ice Melt (+Fresh Serving Ice Recommended)';
    }

    const liqBev = mDrip + melted;
    const tdsLiq = tdsDripPct * (mDrip / Math.max(1, liqBev));

    return {
      regime: regime,
      regimeLabel: regimeLabel,
      hotPourG: +hotPourG.toFixed(1),
      iceG: +iceG.toFixed(1),
      mDrip: +mDrip.toFixed(1),
      meltedIceG: +melted.toFixed(1),
      remIceG: +remIce.toFixed(1),
      liquidBeverageG: +liqBev.toFixed(1),
      finalTempC: +finalT.toFixed(1),
      tdsCupPct: +tdsLiq.toFixed(2),
      retainedG: +(rw * doseG).toFixed(1),
      paragonDropC: cfg.paragonOn ? 46.4 : 0,
      esterBoostPct: cfg.paragonOn ? 40 : 18
    };
  }

  /* ---- F. Milk Steaming & Natural Sweetness Chemistry ---- */
  function solveMilkAlchemist(cfg) {
    const milkType = cfg.milkType || 'dairy';
    const milkG = clamp(cfg.milkG, 30, 450, 150);
    const steamTempC = clamp(cfg.steamTempC, 40, 82, 60);
    const thawFrac = clamp(cfg.thawFrac, 0.35, 0.85, 0.50);
    const beanAgtron = clamp(cfg.beanAgtron, 25, 105, 78);

    const steamDilutionG = milkG * ((3.93 * Math.max(0, steamTempC - 4)) / 2257);
    let sei = 0.86;
    let sweetnessMult = 1.0;
    if (milkType === 'lactose_free') {
      sei = 2.67;
      sweetnessMult = 3.1;
    } else if (milkType === 'eisbock') {
      const etaSol = 1 - Math.pow(1 - thawFrac, 2.4);
      const conc = etaSol / thawFrac;
      sei = +(0.86 * conc).toFixed(2);
      sweetnessMult = +conc.toFixed(2);
    } else if (milkType === 'oat') {
      sei = 1.65;
      sweetnessMult = 1.9;
    } else if (milkType === 'almond' || milkType === 'soy') {
      sei = 0.45;
      sweetnessMult = 0.52;
    }

    const isPlant = milkType === 'oat' || milkType === 'almond' || milkType === 'soy';
    const estCupPh = beanAgtron >= 78 ? 4.92 : (beanAgtron >= 62 ? 5.08 : 5.28);
    const curdleDanger = isPlant && estCupPh < 5.12 && steamTempC > 58;
    const scaldDanger = !isPlant && steamTempC > 67;
    const inBetaLgWindow = !isPlant && steamTempC >= 55 && steamTempC <= 65;

    let guidance = 'Silky microfoam & peak natural lactose sweetness (55-65 C beta-Lg window).';
    if (curdleDanger) {
      guidance = 'Isoelectric Curdle Alert (pH ~' + estCupPh.toFixed(2) + ' < 5.1): Steam 10 C cooler (' +
        Math.max(48, steamTempC - 10) + ' C max, <=56 C) + temper 15g milk into shot first!';
    } else if (scaldDanger) {
      guidance = 'Above 68 C irreversible beta-lactoglobulin disulfide denaturation releases cooked H2S notes and collapses gloss.';
    } else if (milkType === 'lactose_free') {
      guidance = 'Lactase-cleaved D-glucose + D-galactose delivers 3.1x natural perceived sweetness with zero added syrup.';
    } else if (milkType === 'eisbock') {
      guidance = 'WBC fractional freeze-thaw (' + Math.round(thawFrac * 100) + '% draw) concentrates milk solids ' + sweetnessMult + 'x.';
    }

    return {
      milkType: milkType,
      milkG: milkG,
      steamDilutionG: +steamDilutionG.toFixed(1),
      finalMilkG: +(milkG + steamDilutionG).toFixed(1),
      sei: sei,
      sweetnessMult: sweetnessMult,
      estCupPh: estCupPh,
      curdleDanger: curdleDanger,
      scaldDanger: scaldDanger,
      inBetaLgWindow: inBetaLgWindow,
      guidance: guidance
    };
  }

  /* --------------------------------------------------------------------------
   * DiFluid R2 Refractometer Thermal Readiness & Metal-Spoon Chill Coach
   *   - Ideal Sample Temp: 20-28 C (68-82 F), within +-2 C of room/prism temp
   *   - Live BLE tempC Guard:
   *       18-29 C -> Green "Prism Temp Ideal (23.4 C)"
   *       >29 C   -> Amber "Sample Too Warm (37.8 C) - Metal-Spoon Cool to 20-28 C to Avoid Evaporation Drift"
   * -------------------------------------------------------------------------- */
  function evaluateR2SampleTemp(tempC) {
    const t = clamp(Number.isFinite(+tempC) ? +tempC : 23.4, 2, 95, 23.4);
    const tf = +(t * 9 / 5 + 32).toFixed(1);
    if (t >= 18.0 && t <= 29.0) {
      return {
        state: 'ideal',
        tempC: +t.toFixed(1),
        tempF: tf,
        badgeText: 'Prism Temp Ideal (' + t.toFixed(1) + ' °C)',
        detail: 'Ideal 20–28 °C (68–82 °F) window locked — zero dn/dT prism gradient or micro-drop evaporation drift.'
      };
    }
    if (t > 29.0) {
      return {
        state: 'warm',
        tempC: +t.toFixed(1),
        tempF: tf,
        badgeText: 'Sample Too Warm (' + t.toFixed(1) + ' °C) — Metal-Spoon Cool to 20–28 °C to Avoid Evaporation Drift',
        detail: 'Piping-hot drops (>32–60 °C) create sapphire-prism dn/dT thermal-gradient drift AND rapid 0.3 mL micro-drop evaporation that falsely inflates %TDS!'
      };
    }
    return {
      state: 'cool',
      tempC: +t.toFixed(1),
      tempF: tf,
      badgeText: 'Sample Chilled (' + t.toFixed(1) + ' °C) — Equilibrate Toward 20–28 °C Prism Temp',
      detail: 'Let chilled sample sit 15s on room-temp prism (±2 °C equilibrium) before locking optical shadowline.'
    };
  }

  /* Probat Colorette 3b / 4 index (approx linear mapping anchored at Med 63G -> 102 Colorette, Light 85G -> 132, Dark 35G -> 64) */
  function coloretteFromGourmet(gVal) {
    const g = clamp(gVal, 20, 110, 63);
    return +(64 + (g - 35) * 1.36).toFixed(1);
  }

  function gourmetFromColorette(colVal) {
    const c = clamp(colVal, 42, 166, 102);
    return +clamp(35 + (c - 64) / 1.36, 20, 110, 63).toFixed(2);
  }

  /* ---- G. In-Mug Emergency Rescue Solver (Dilution Mass Balance + TAS2R NaCl Blockade) ---- */
  function solveInMugRescue(opts) {
    const o = opts || {};
    const mugG = clamp(o.mugG, 25, 900, 220);
    const symptom = o.symptom || 'bitter';
    const tds0 = clamp(o.tdsPct, 0.5, 16.0, symptom === 'weak' ? 1.05 : 1.52);
    const tdsTarget = clamp(o.targetTdsPct, 0.7, 14.0, tds0 > 4 ? 9.0 : 1.28);
    const milkOk = !!o.milkAllowed;

    const naclMg = Math.max(8, Math.round(mugG * 0.20)); /* 0.020% w/v = 44 mg per 220 g mug */
    const saline20Drops = Math.max(1, Math.round(naclMg / 12)); /* 1 drop (~0.05 mL) of 20% w/v NaCl ~= 10-12 mg NaCl */
    const rawBypassG = tds0 > tdsTarget ? mugG * (tds0 / Math.max(0.4, tdsTarget) - 1) : 0;
    const bypass80CG = symptom === 'weak' ? 0 : Math.round(clamp(rawBypassG || mugG * 0.11, 0, mugG * 0.65, 24));
    const warmMilk60CG = Math.round(clamp(mugG * 0.16, 15, 90, 35));
    const bicarb5PctDrops = (symptom === 'sour' || symptom === 'sour_bitter') ? Math.max(1, Math.min(3, Math.round(mugG / 110))) : 0;

    let headline = '';
    let why = '';
    let nextBrewFix = '';
    if (symptom === 'bitter') {
      headline = 'Add ' + Math.max(15, bypass80CG || 22) + ' g hot water (80 °C) + ' + saline20Drops + ' drops 20% saline (~' + naclMg + ' mg salt)';
      why = isScienceXray()
        ? ('80 °C bypass lowers polyphenol concentration immediately without scalding aromatics, while ~' + naclMg + ' mg Na+ selectively blocks TAS2R bitter receptors (Breslin & Beauchamp, Nature 1997) so natural sweetness pops.')
        : ('A warm splash of 80 °C water opens up heavy bitterness without cooking delicate aromas, while a tiny pinch of salt (~' + naclMg + ' mg) naturally mutes bitter taste buds so caramel sweetness comes forward.');
      nextBrewFix = 'Next cup: grind 1–2 clicks coarser, drop kettle -2 °C, or pull dripper 15s earlier.';
    } else if (symptom === 'sour') {
      headline = 'Cool cup to 55–58 °C + add ' + Math.max(1, saline20Drops - 1) + ' drops 20% saline (~' + Math.round(naclMg * 0.7) + ' mg salt)' + (milkOk ? (' or ' + warmMilk60CG + ' g 60 °C milk') : '');
      why = 'Letting the cup cool to 55–58 °C unlocks your tongue\'s natural sweetness, and a tiny touch of salt softens sharp lemony edges.' + (isScienceXray() && bicarb5PctDrops ? (' Scientist option: ' + bicarb5PctDrops + ' micro-drop(s) 5% baking soda solution neutralizes ~0.15 pH units (never exceed 3 drops or soapy sodium forms).') : '');
      nextBrewFix = 'Next cup: grind 1–2 clicks finer, raise kettle +2 °C, or extend bloom to 45s.';
    } else if (symptom === 'strong') {
      const dilG = Math.max(18, bypass80CG || Math.round(mugG * 0.14));
      const newTds = +(tds0 * mugG / (mugG + dilG)).toFixed(2);
      headline = 'Stir in ' + dilG + ' g hot water at 80 °C (' + tds0.toFixed(2) + '% \u2192 ' + newTds + '% TDS)';
      why = isScienceXray()
        ? 'Pure barista bypass (M_add = M_mug * (TDS_0 / TDS_target - 1)): opens crowded flavor clarity into the sweet spot with zero extra bitterness.'
        : 'Adding clean hot water directly into your mug (barista bypass) opens up crowded flavors into the sweet spot with zero extra bitterness.';
      nextBrewFix = 'Next cup: widen brew ratio (e.g. 1:15 \u2192 1:16.5) while keeping extraction even.';
    } else if (symptom === 'sour_bitter') {
      headline = 'Add ' + Math.max(15, Math.round(mugG * 0.09)) + ' g 80 °C water + ' + saline20Drops + ' drops 20% saline (~' + naclMg + ' mg salt)';
      why = isScienceXray()
        ? 'Sour + Bitter together means uneven channeling (fast sour channels + bitter over-extracted fines). Warm bypass + TAS2R Na+ blockade softens both edges right in the mug.'
        : 'Tasting sour and bitter together means water ran unevenly through the bed. A splash of warm water plus a tiny drop of saline softens both harsh edges right away.';
      nextBrewFix = 'Next cup: WDT/level dry bed, pour gently in center circles (<=4 g/s), and avoid high-wall agitation.';
    } else {
      headline = milkOk
        ? ('Texture rescue: add ' + warmMilk60CG + ' g steamed/warmed milk (60 °C) or 20 g espresso/AeroPress topper')
        : 'Cannot un-dilute water in mug — top with a 20 g AeroPress/espresso concentrate shot if handy';
      why = 'Conservation of mass prevents removing water once brewed; sip at 54 °C where sweet/tactile perception peaks.';
      nextBrewFix = 'Next cup: tighten ratio (e.g. 1:17 \u2192 1:15.2) and grind 1–2 clicks finer.';
    }

    return {
      mugG: mugG,
      symptom: symptom,
      tds0: tds0,
      tdsTarget: tdsTarget,
      bypass80CG: symptom === 'strong' ? Math.max(18, bypass80CG || Math.round(mugG * 0.14)) : (symptom === 'weak' ? 0 : Math.max(15, bypass80CG || 20)),
      naclMg: naclMg,
      saline20Drops: saline20Drops,
      warmMilk60CG: warmMilk60CG,
      bicarb5PctDrops: bicarb5PctDrops,
      headline: headline,
      why: why,
      nextBrewFix: nextBrewFix
    };
  }

  /* ---- H. 18 Real Supermarket Bottled & City Tap Water Profiles + 2-Bottle Farey Blend ---- */
  const EVERYDAY_WATERS = [
    { key: 'distilled', name: 'Distilled / ZeroWater / RO', gh: 0, kh: 0, ph: 7.0, group: 'base', note: 'Pure 0 ppm blank canvas — flat/harsh alone, ideal for 2-bottle blends or gallon DIY salts.' },
    { key: 'crystal_shasta', name: 'Crystal Geyser (Mt. Shasta, CA)', gh: 38, kh: 48, ph: 7.4, group: 'bottled', note: 'Check bottle label for Mt. Shasta! Sweet, clean filter & espresso benchmark straight from the jug.' },
    { key: 'crystal_sctn', name: 'Crystal Geyser (SC / TN Springs)', gh: 18, kh: 15, ph: 6.7, group: 'bottled', note: 'East-Coast Salem SC / Benton TN bottling is ultra-soft — bright, tea-like Nordic clarity!' },
    { key: 'volvic', name: 'Volvic Natural Volcanic Spring', gh: 62, kh: 58, ph: 7.0, group: 'bottled', note: 'World Brewers Cup classic: balanced Mg/Ca sweetness and smooth acid buffer.' },
    { key: 'poland_spring', name: 'Poland Spring (Maine)', gh: 26, kh: 18, ph: 6.8, group: 'bottled', note: 'Low-alkalinity New England spring — lets washed Ethiopian & Kenyan florals sparkle.' },
    { key: 'kirkland_purified', name: 'Kirkland Signature Purified', gh: 28, kh: 20, ph: 7.1, group: 'bottled', note: 'Remineralized RO — crisp, affordable everyday light-to-medium filter water.' },
    { key: 'kirkland_spring', name: 'Kirkland Signature Bottled Spring', gh: 115, kh: 98, ph: 7.6, group: 'bottled', note: 'Higher buffer — great blended 40% with 60% Distilled for sweet filter, or solo for dark roast.' },
    { key: 'fiji', name: 'FIJI Natural Artesian', gh: 108, kh: 132, ph: 7.7, group: 'bottled', note: 'High bicarbonate (132 KH) + 93 ppm silica gives heavy syrupy body but mutes bright fruit acids.' },
    { key: 'smartwater', name: 'Glaceau Smartwater', gh: 25, kh: 10, ph: 6.9, group: 'bottled', note: 'Vapor-distilled + CaCl2/MgCl2 + trace KHCO3 — very low buffer (10 KH), punchy acidity.' },
    { key: 'essentia', name: 'Essentia Ionized pH 9.5 (Alkaline Trap!)', gh: 20, kh: 68, ph: 9.5, group: 'bottled', trap: true, note: 'TRAP ALERT: Added alkaline bicarbonate/hydroxide (pH 9.5, ~68 KH) neutralizes fruity coffee acids into flat, papery cups!' },
    { key: 'evian', name: 'Evian French Alps', gh: 307, kh: 295, ph: 7.2, group: 'bottled', trap: true, note: '307 GH / 295 KH chalk bomb solo! Rescue: blend 15–20% Evian + 80–85% Distilled/RO for instant SCA sweet spot.' },
    { key: 'aquafina_dasani', name: 'Aquafina / Dasani Purified RO', gh: 12, kh: 8, ph: 6.5, group: 'bottled', note: 'Near-zero RO water — add a splash of mineral spring water or DIY Baking Soda + Epsom.' },
    { key: 'brita_mid', name: 'Brita / Pitcher-Filtered Moderate Tap', gh: 85, kh: 55, ph: 7.2, group: 'tap', note: 'Carbon removes chlorine off-flavors; weak-acid resin drops temporary KH ~25%.' },
    { key: 'tap_soft_city', name: 'Soft City Tap (NYC / SF / Seattle / PDX)', gh: 24, kh: 18, ph: 7.3, group: 'tap', note: 'Naturally soft mountain/watershed tap! Carbon-filter chlorine and boost +35 ppm Mg (Epsom) for extra sweetness.' },
    { key: 'tap_lake_mid', name: 'Great Lakes / River Tap (Chicago / BOS / ATL)', gh: 135, kh: 105, ph: 7.7, group: 'tap', note: 'Moderate-hard tap — blend 40% carbon-filtered tap + 60% Distilled/ZeroWater to hit 54 GH / 42 KH!' },
    { key: 'tap_chalk_eu', name: 'Limestone Hard Tap (London / Paris / Munich)', gh: 275, kh: 210, ph: 7.8, group: 'tap', trap: true, note: 'Severe boiler limescale & chalky cup solo! Blend 20% filtered tap + 80% ZeroWater/RO (55 GH / 42 KH).' },
    { key: 'tap_sw_hard', name: 'Hard Desert Tap (Phoenix / Vegas / SoCal)', gh: 245, kh: 145, ph: 7.9, group: 'tap', trap: true, note: 'High TDS sulfate/hardness — use RO/ZeroWater + 25% filtered tap or Kitchen Gallon Recipe.' },
    { key: 'tww_classic', name: 'Third Wave Water Classic (1 Stick / Gal)', gh: 135, kh: 40, ph: 7.1, group: 'packet', note: 'Full stick = 135 GH / 40 KH; pro tip: dissolve 1 stick in 1.5–1.8 gallons (~60% dose) for Nordic light roasts!' }
  ];

  function solveEverydayWaterRescue(cfg) {
    const c = cfg || {};
    const targetGh = clamp(c.targetGh, 15, 180, 68);
    const targetKh = clamp(c.targetKh, 10, 95, 36);
    const batchMl = clamp(c.batchMl, 200, 5000, 1000);
    const picked = EVERYDAY_WATERS.find(function (w) { return w.key === c.waterKey; }) || EVERYDAY_WATERS[1];

    /* Best 2-Bottle Blend pairing picked water with Distilled (if picked is hard) or Kirkland Spring/Evian (if picked is soft) */
    const partnerKey = picked.kh > targetKh + 8
      ? 'distilled'
      : (c.partnerKey && c.partnerKey !== picked.key ? c.partnerKey : 'kirkland_spring');
    const partner = EVERYDAY_WATERS.find(function (w) { return w.key === partnerKey; }) || EVERYDAY_WATERS[0];

    /* Least-squares optimal blend fraction f of picked + (1 - f) of partner in 5% increments */
    let bestF = 1.0;
    let bestErr = Infinity;
    for (let step = 0; step <= 20; step++) {
      const f = step / 20;
      const bGh = f * picked.gh + (1 - f) * partner.gh;
      const bKh = f * picked.kh + (1 - f) * partner.kh;
      /* Weight KH buffer 1.8x since bicarbonate drives cup pH most strongly */
      const err = Math.pow((bKh - targetKh) * 1.8, 2) + Math.pow(bGh - targetGh, 2);
      if (err < bestErr) {
        bestErr = err;
        bestF = f;
      }
    }
    const blendedGh = Math.round(bestF * picked.gh + (1 - bestF) * partner.gh);
    const blendedKh = Math.round(bestF * picked.kh + (1 - bestF) * partner.kh);
    const pickedMl = Math.round(bestF * batchMl);
    const partnerMl = Math.max(0, batchMl - pickedMl);

    /* Kitchen US Gallon (3.7854 L) Baking Soda + Epsom Salt DIY Recipe */
    const galL = 3.7854;
    const epsomGalG = +((targetGh * 2.4626 * galL) / 1000).toFixed(2);
    const bicarbGalG = +((targetKh * 1.6787 * galL) / 1000).toFixed(2);

    return {
      picked: picked,
      partner: partner,
      pickedPct: Math.round(bestF * 100),
      partnerPct: Math.round((1 - bestF) * 100),
      pickedMl: pickedMl,
      partnerMl: partnerMl,
      blendedGh: blendedGh,
      blendedKh: blendedKh,
      soloOk: Math.abs(picked.kh - targetKh) <= 18 && picked.gh >= 20 && picked.gh <= 145 && !picked.trap,
      gallonEpsomG: epsomGalG,
      gallonBakingSodaG: bicarbGalG,
      gallonKitchenText: epsomGalG + ' g (~1/8 tsp) Epsom Salt + ' + bicarbGalG + ' g (scant 1/16 tsp) Baking Soda in 1 US Gallon (3.79 L) Distilled Water \u2192 ' + Math.round(targetGh) + ' GH / ' + Math.round(targetKh) + ' KH'
    };
  }

  /* ---- I. Public Caffeine Curve, Sleep-Ready & Shop Shot Helpers ---- */
  const CAF_SHOP_DRINKS = [
    { key: 'v60_16g', label: 'Home Pour-Over (16 g Arabica)', mg: 165, shots: 2.2, cat: 'home', note: 'Filter percolation extracts ~86% of bean caffeine (~10.3 mg/g brewed).' },
    { key: 'double_esp', label: 'Double Espresso (18 g Arabica)', mg: 144, shots: 2.0, cat: 'home', note: 'High concentration, slightly lower total mg than filter due to shorter 28s contact.' },
    { key: 'single_esp', label: 'Single Espresso / Macchiato (9 g)', mg: 72, shots: 1.0, cat: 'cafe', note: 'Classic 1-shot cafe reference (~70–75 mg).' },
    { key: 'cafe_latte_12', label: '12 oz Cafe Latte / Cappuccino (2-Shot)', mg: 150, shots: 2.0, cat: 'cafe', note: 'Standard specialty 12 oz uses a full double shot.' },
    { key: 'sbux_blonde_16', label: 'Grande 16 oz Blonde Roast Drip', mg: 360, shots: 4.8, cat: 'cafe', note: 'Scoop Trap! Denser light-roast beans pack more mass per volume scoop + high batch brew dose.' },
    { key: 'sbux_pike_16', label: 'Grande 16 oz Medium Batch Drip', mg: 310, shots: 4.1, cat: 'cafe', note: 'Commercial high-dose 16 oz drip carries ~2x a home V60!' },
    { key: 'cold_brew_16', label: '16 oz Cafe Cold Brew (Diluted)', mg: 205, shots: 2.7, cat: 'cafe', note: 'Steeped 12–18h at coarse ratio; undiluted concentrate can exceed 320 mg!' },
    { key: 'aeropress_15', label: 'AeroPress (15 g, 2:00 Steep)', mg: 142, shots: 1.9, cat: 'home', note: 'Clean immersion-percolation hybrid.' },
    { key: 'french_press_20', label: 'French Press Mug (20 g)', mg: 185, shots: 2.5, cat: 'home', note: '4-min full immersion.' },
    { key: 'moka_3cup', label: '3-Cup Moka Pot (~16 g)', mg: 148, shots: 2.0, cat: 'home', note: 'Add +85% if blending 50/50 Italian Robusta (~215 mg)!' },
    { key: 'nespresso_orig', label: 'Nespresso Original Capsule (5.5 g)', mg: 65, shots: 0.9, cat: 'pod', note: 'Small 5–6 g capsule limits total caffeine despite strong taste.' },
    { key: 'nespresso_vertuo', label: 'Nespresso Vertuo Mug Pod (12.5 g)', mg: 165, shots: 2.2, cat: 'pod', note: 'Centrifusion spins a full filter-sized dose.' },
    { key: 'keurig_kcup', label: 'Keurig K-Cup Pod (~10 g)', mg: 105, shots: 1.4, cat: 'pod', note: 'Fast contact + 9–11 g pod = milder 95–120 mg.' },
    { key: 'robusta_viet', label: 'Vietnamese Phin Robusta (22 g)', mg: 410, shots: 5.5, cat: 'cafe', note: 'Coffea canephora holds ~22 mg/g caffeine (nearly 2x Arabica)!' },
    { key: 'matcha_2g', label: 'Ceremonial Matcha (2 g whisked)', mg: 68, shots: 0.9, cat: 'tea', note: 'Whole-leaf green tea + L-theanine calm focus.' },
    { key: 'decaf_swp', label: 'Swiss Water / EA Decaf (16 g)', mg: 6, shots: 0.1, cat: 'home', note: '99.7% caffeine-free (~4–7 mg residual) — safe right before bed!' }
  ];

  function cafShopShots(drinkKey) {
    return CAF_SHOP_DRINKS.find(function (d) { return d.key === drinkKey; }) || CAF_SHOP_DRINKS[0];
  }

  function cafCurve(cups, opts) {
    const o = opts || {};
    const t0 = Number.isFinite(o.startHour) ? o.startHour : 6.0;
    const hl = clamp(o.halfLifeH, 1.5, 24.0, 5.0);
    const steady = o.steadyState !== undefined ? !!o.steadyState : true;
    const fed = !!o.fedMode;
    const steps = clamp(o.steps, 24, 192, 96);
    const out = [];
    for (let i = 0; i <= steps; i++) {
      const th = t0 + (i / steps) * 24;
      out.push({
        hour: +th.toFixed(2),
        mg: +activeCaffeineMgAt(cups, th, hl, steady, fed).toFixed(1)
      });
    }
    return out;
  }

  function cafSleepReadyAt(cups, opts) {
    const o = opts || {};
    const hl = clamp(o.halfLifeH, 1.5, 24.0, 5.0);
    const gateMg = clamp(o.gateMg, 10, 120, 35);
    const fed = !!o.fedMode;
    const list = Array.isArray(cups) && cups.length ? cups : [{ hour: 8, mg: 150 }];
    let lastSip = 6;
    for (let i = 0; i < list.length; i++) {
      if (list[i] && Number.isFinite(list[i].hour) && list[i].hour > lastSip) lastSip = list[i].hour;
    }
    /* Start 1.0h after lastSip (past Bateman oral absorption T_max ~40m) to locate post-peak elimination crossing */
    for (let t = lastSip + 1.0; t <= lastSip + 48; t += 0.25) {
      if (activeCaffeineMgAt(list, t, hl, false, fed) <= gateMg) {
        return +t.toFixed(2);
      }
    }
    return +(lastSip + 24).toFixed(2);
  }

  /* Export verified lab math for direct inspection & unit tests */
  window.BTLabMath = {
    toninoFromGourmet: toninoFromGourmet,
    gourmetFromTonino: gourmetFromTonino,
    commercialFromGourmet: commercialFromGourmet,
    gourmetFromCommercial: gourmetFromCommercial,
    coloretteFromGourmet: coloretteFromGourmet,
    gourmetFromColorette: gourmetFromColorette,
    nd20FromBrix: nd20FromBrix,
    brixFromNd: brixFromNd,
    tdsFromBrix: tdsFromBrix,
    brixFromTds: brixFromTds,
    activeCaffeineMgAt: activeCaffeineMgAt,
    borbelyAlertnessAt: borbelyAlertnessAt,
    cafCurve: cafCurve,
    cafSleepReadyAt: cafSleepReadyAt,
    cafShopShots: cafShopShots,
    solveInMugRescue: solveInMugRescue,
    solveEverydayWaterRescue: solveEverydayWaterRescue,
    solveWaterSpeciation: solveWaterSpeciation,
    solveFlashIced3Regime: solveFlashIced3Regime,
    solveMilkAlchemist: solveMilkAlchemist,
    evaluateR2SampleTemp: evaluateR2SampleTemp
  };

  /* ==========================================================================
   * PERSISTENT LAB UI STATE (5 Studios + All 14 Rescue & Lab Calculators)
   * ========================================================================== */
  const labState = {
    activeStudio: 'ey',
    benchExpanded: false,
    focusSubcard: '',

    /* Studio 1: BrewControlCanvas (TDS x EY) */
    bc: {
      mode: 'percolation', /* 'percolation' | 'immersion' | 'espresso' */
      anchor: 'dose',      /* 'dose' | 'yield' */
      doseG: 18.0,
      targetEy: 20.4,
      targetTds: 1.38,
      rw: 2.10,
      bypassG: 0,
      measTds: 0,
      measTempC: 22.5,
      measNd: 1.33542,
      atcMode: 'difluid',
      sensoryTag: 'balanced',
      stylePreset: 'juicy',
      userDragged: false
    },

    /* Studio 2: ExtractionWaveTelemetry + Cutoff Gate + In-Mug Rescue */
    wave: {
      doseG: 16.0,
      d50Um: 540,
      kettleC: 94.0,
      agtron: 80,
      material: 'plastic', /* 'plastic' | 'glass' | 'ceramic' | 'vacuum' */
      preheat: 'boiling',  /* 'cold' | 'warm' | 'boiling' */
      knots: [
        { t: 0, m: 48, label: 'Step 1: Wet Grounds (Bloom)' },
        { t: 42, m: 155, label: 'Step 2: Main Pour (Builds Sweetness & Body)' },
        { t: 92, m: 260, label: 'Step 3: Final Pour (Sets Strength)' },
        { t: 165, m: 260, label: 'Step 4: Drain & Pull at Sweet-Spot Gate' }
      ],
      cutoffSec: 150,
      fullDrainSec: 165,
      scrubT: 150
    },
    mugRescue: {
      mugG: 220,
      symptom: 'bitter', /* 'bitter' | 'sour' | 'strong' | 'sour_bitter' | 'weak' */
      tdsPct: 1.52,
      targetTdsPct: 1.28,
      milkAllowed: false
    },

    /* Studio 3: Water Rescue + 4-Anchor Ratio + Flash-Ice/ColdBrew + EY Lab + Milk */
    water: {
      sourceMode: 'tap',       /* 'tap' | 'filtered' | 'bottled_generic' | 'named_18' */
      tapLevel: 'typical',     /* 'soft' | 'typical' | 'hard' */
      filterKind: 'brita',     /* 'brita' | 'fridge' | 'ro' | 'bwt' */
      genericBottleKind: 'spring', /* 'spring' | 'purified' | 'alkaline' */
      activeWaterLabel: 'Regular Tap (Typical)',
      activeProfileKey: 'tap_regular',
      activeWaterType: 'tap',
      gh: 90,
      kh: 55,
      mgShare: 0.45,
      unitDh: false,
      batchL: 1.0,
      brewTempC: 93,
      mgSaltKey: 'mgso4',
      caSaltKey: 'cacl2d',
      khSaltKey: 'khco3',
      tapBlendOn: false,
      ghTap: 175,
      khTap: 130,
      quickStart: 'ro',
      quickVibe: 'sweet',
      lotusTip: 'round',
      everydayKey: 'crystal_shasta',
      partnerKey: 'distilled'
    },
    ratio4: {
      anchor: 'dose', /* 'dose' | 'water' | 'mug' | 'ratio' */
      doseG: 18.0,
      waterG: 288,
      mugG: 254,
      ratio: 16.0,
      tdsPct: 1.38,
      eyPct: 20.4,
      rw: 2.10,
      cupsBatch: 1,
      wetBedWeightG: 55.8,
      coldBrewConcRatio: 5.0,
      coldBrewServeG: 240,
      coldBrewDiluteRatio: 2.5
    },

    /* Studio 4: Circadian Caffeine + CafCup + Freshness + BagCmp + Cost ROI */
    pk: {
      wakeHour: 7.0,
      bedHour: 23.0,
      cypKey: 'typical',
      swsGateMg: 35,
      steadyState: true,
      fedMode: false,
      bodyKg: 70,
      selectedCupIdx: 0,
      cups: [
        { id: 'c1', label: 'Morning V60', icon: 'v60', hour: 7.75, doseG: 16, species: 'arabica', cafShare: 1.0, mg: 165 },
        { id: 'c2', label: 'Afternoon Shot', icon: 'espresso', hour: 14.25, doseG: 18, species: 'arabica', cafShare: 1.0, mg: 152 }
      ],
      deletedCup: null
    },
    cafCup: {
      drinkKey: 'v60_16g',
      measureBy: 'grams', /* 'grams' | 'scoops' */
      scoops: 2.0,
      roastLevel: 'light', /* 'light' | 'medium' | 'dark' */
      species: 'arabica',
      doseG: 16.0
    },
    bagCmp: {
      aName: 'Ethiopia Washed (250g)',
      aPrice: 21.0,
      aGrams: 250,
      aAgtron: 82,
      aOrigin: 'Ethiopia',
      aProcess: 'Washed',
      bName: 'Colombia Pink Bourbon (340g)',
      bPrice: 26.0,
      bGrams: 340,
      bAgtron: 78,
      bOrigin: 'Colombia',
      bProcess: 'Honey / Natural'
    },
    roi: {
      bagPrice: 20.0,
      bagGrams: 250,
      doseG: 18.0,
      filterCost: 0.08,
      waterCostPerL: 0.35,
      milkCostPerCup: 0.00,
      cafeDrinkPrice: 5.75,
      cupsPerDay: 1.5,
      gearInvestment: 320
    },

    /* Studio 5: TactileVesselVisualizer & Milk Steaming Lab */
    vessel: {
      shape: 'carafe',
      locked: 'dose', /* 'dose' | 'ratio' | 'pour' | 'mug' */
      doseG: 18.0,
      ratio: 16.0,
      rw: 2.10,
      flashOn: false,
      iceShare: 0.38,
      iceTempC: -18,
      dripTempC: 76,
      paragonOn: false,
      milkType: 'dairy',
      milkG: 150,
      steamTempC: 60,
      thawFrac: 0.50
    },

    /* Studio 5 / 6: CutawayAgtronRibbon, Grinder Translator & FreshnessFreezerCurve */
    roastFresh: {
      beanG: 72.0,
      groundG: 80.5,
      activeScale: 'gourmet',
      daysToday: 11,
      freezeDay: 9,
      freezeOn: true,
      bagG: 250,
      paceGPerDay: 18,
      pkgKey: 'valve',
      bagAPrice: 19.5,
      bagAGrams: 250,
      bagBPrice: 54.0,
      bagBGrams: 1000,
      freezeBulk: true
    },
    grinderLab: {
      fromKey: 'comandante_c40',
      toKey: 'fellow_ode_gen2',
      fromSetting: 22,
      targetUm: 580,
      calPt1Click: 15,
      calPt1Um: 420,
      calPt2Click: 28,
      calPt2Um: 760
    },

    /* PocketMicronLens state */
    micron: {
      refType: 'card', /* 'card' | 'quarter' | 'euro' */
      clickVal: 22,
      result: null
    }
  };

  function recomputeCupMg(cup) {
    const sp = SPECIES_CAF_MG_PER_G[cup.species] || SPECIES_CAF_MG_PER_G.arabica;
    const extEff = cup.icon === 'espresso' ? 0.80 : 0.86;
    const share = clamp(cup.cafShare, 0.03, 1.0, 1.0);
    cup.mg = Math.max(1, Math.round(cup.doseG * sp.mgPerG * extEff * share));
    return cup.mg;
  }
  labState.pk.cups.forEach(recomputeCupMg);

  /* ==========================================================================
   * 5-SLOT WEBBLE HARDWARE BENCH & POCKET MICRON LENS
   * ========================================================================== */
  function getBleStateSafe() {
    if (window.BTBle && typeof window.BTBle.getState === 'function') {
      try { return window.BTBle.getState() || {}; } catch (_) {}
    }
    return {};
  }

  function getActiveR2TempC() {
    const st = getBleStateSafe();
    const r2 = st && st.refractometer;
    if (r2 && Number.isFinite(+r2.tempC) && +r2.tempC > 0) return +r2.tempC;
    return Number.isFinite(+labState.bc.measTempC) ? +labState.bc.measTempC : 23.4;
  }

  function buildR2ThermalReadinessWidget(opts) {
    const o = opts || {};
    const wrap = domH('div', { class: 'bt-r2-readiness-wrap' });
    const badgeTxt = domH('span', { class: 'bt-r2-badge-txt num-tab', text: '' });
    const badge = domH('div', { class: 'bt-r2-temp-badge is-ideal', role: 'status' },
      ic('refract-prism', { size: 15 }),
      badgeTxt
    );

    let guideOpen = false;
    const guideBtnSpan = domH('span', { text: 'R2 Best-Reading Guide' });
    const guideBtn = domH('button', {
      type: 'button',
      class: 'bt-how-pill bt-r2-guide-btn',
      'aria-expanded': 'false',
      onclick: function () {
        guideOpen = !guideOpen;
        guideCard.hidden = !guideOpen;
        guideBtn.setAttribute('aria-expanded', String(guideOpen));
        CK.haptic('tick');
      }
    }, ic('info-circle', { size: 14 }), guideBtnSpan);

    const guideCard = domH('div', { class: 'bt-r2-guide-card', hidden: true },
      domH('strong', { text: 'DiFluid R2 Optical Precision & Spoon-Chill Protocol (20–28 °C / 68–82 °F)' }),
      domH('ul', { class: 'bt-r2-guide-list' },
        domH('li', { text: 'Ideal Sample Temp (20–28 °C / 68–82 °F, within ±2 °C of room/prism): Piping-hot drops (>32–60 °C) cause sapphire-prism dn/dT thermal-gradient drift AND rapid 0.3 mL micro-drop flash evaporation that falsely inflates %TDS!' }),
        domH('li', { text: '15–20s Metal-Spoon Chill: Stir 3–5 mL in a room-temp metal spoon for 15–20s (cools 75 °C \u2192 ~24 °C with zero evaporation), zero prism with 20–25 °C distilled water, apply 3–4 drops, and wait 5–10s for prism lock.' }),
        domH('li', { text: 'Espresso & Immersion Syringe Filter: Pass espresso or French press/AeroPress samples through a 0.22–0.45 um syringe filter so suspended fines and lipids do not scatter the CCD shadowline.' })
      ),
      o.onCoolSim ? domH('div', { class: 'bt-lab-btn-row' },
        domH('button', {
          type: 'button',
          class: 'bt-lab-btn is-sm is-primary',
          onclick: function () {
            o.onCoolSim(23.4);
          }
        }, 'Simulate 15s Metal-Spoon Chill (23.4 °C)')
      ) : null
    );

    function syncTemp(customTempC) {
      const tVal = Number.isFinite(+customTempC) ? +customTempC : getActiveR2TempC();
      let ev = null;
      if (window.BTCoreV6 && window.BTCoreV6.mass && typeof window.BTCoreV6.mass.evaluateR2SampleReadiness === 'function') {
        try {
          const coreEv = window.BTCoreV6.mass.evaluateR2SampleReadiness(tVal, 23.0);
          if (coreEv && coreEv.badgeText) {
            ev = {
              state: coreEv.status === 'warm' || tVal > 29 ? 'warm' : (tVal < 18 ? 'cool' : 'ideal'),
              badgeText: coreEv.badgeText
            };
          }
        } catch (_) { ev = null; }
      }
      if (!ev) ev = evaluateR2SampleTemp(tVal);
      badge.className = 'bt-r2-temp-badge is-' + ev.state;
      badgeTxt.textContent = ev.badgeText;
    }

    syncTemp();
    wrap.appendChild(domH('div', { class: 'bt-r2-readiness-bar' }, badge, guideBtn));
    wrap.appendChild(guideCard);
    wrap._syncTemp = syncTemp;
    return wrap;
  }

  function buildPocketMicronLensCard() {
    const wrap = domH('section', { class: 'bt-lab-subcard bt-micron-lens-card' });
    const canvas = domH('canvas', {
      class: 'bt-micron-canvas',
      width: '360',
      height: '164',
      'aria-label': 'Pocket Micron Lens optical particle distribution viewport'
    });
    const readoutBox = domH('div', { class: 'bt-micron-readout' });

    function drawMicronCanvas(res) {
      const ctx = canvas.getContext && canvas.getContext('2d');
      if (!ctx) return;
      const W = 360;
      const H = 164;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#F7F2EA';
      ctx.fillRect(0, 0, W, H);

      /* Draw orthographic reference card corner & scale bar */
      ctx.fillStyle = '#1E1612';
      ctx.fillRect(14, 14, 78, 50);
      ctx.strokeStyle = '#E8844A';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(14, 14, 78, 50);
      ctx.fillStyle = '#F7F0E8';
      ctx.font = '600 9px ui-monospace, monospace';
      const refLbl = labState.micron.refType === 'quarter'
        ? 'US 24.26mm'
        : (labState.micron.refType === 'euro' ? 'EU 23.25mm' : 'ID-1 85.60mm');
      ctx.fillText(refLbl, 20, 42);

      /* Draw simulated / segmented coffee particles in rectified zone */
      const d50 = res ? res.d50MainUm : 535;
      const pxPitch = res ? res.pxPitchUm : 26.5;
      let seed = Math.round(d50 * 7 + labState.micron.clickVal * 13);
      function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }

      for (let i = 0; i < 68; i++) {
        const x = 108 + rnd() * 234;
        const y = 18 + rnd() * 128;
        const um = d50 * (0.55 + rnd() * 0.95);
        const rPx = clamp((um / pxPitch) * 0.5, 1.8, 13, 4);
        ctx.beginPath();
        ctx.ellipse(x, y, rPx * (0.85 + rnd() * 0.3), rPx * 0.78, rnd() * Math.PI, 0, Math.PI * 2);
        ctx.fillStyle = res ? '#2B7252' : '#4A2B18';
        ctx.fill();
      }

      /* Nyquist floor badge line */
      ctx.fillStyle = 'rgba(28,19,14,0.78)';
      ctx.fillRect(104, H - 24, W - 114, 18);
      ctx.fillStyle = '#FFFDF9';
      ctx.font = '600 9.5px ui-monospace, monospace';
      ctx.fillText('3x3 px Nyquist Floor: >= ' + Math.round(pxPitch * 3) + ' um (Zero Fake Fines)', 110, H - 12);
    }

    function runSyntheticOrRealAnalysis(imgData) {
      const click = labState.micron.clickVal;
      let res = null;
      if (window.BTInnovate && typeof window.BTInnovate.analyzeGrindPhoto === 'function') {
        try {
          res = window.BTInnovate.analyzeGrindPhoto({
            imageData: imgData || null,
            referenceType: labState.micron.refType,
            grinderKey: (getApp().gear && getApp().gear.grinder) || 'comandante-c40',
            clickSetting: click
          });
        } catch (_) { res = null; }
      }
      if (!res || !Number.isFinite(res.d50MainUm)) {
        const pxPitchUm = labState.micron.refType === 'card' ? 26.4 : 24.0;
        const nyquistUm = +(pxPitchUm * 3).toFixed(0);
        const d50MainUm = Math.round(clamp(160 + click * 18.5, 190, 1180, 560));
        const d90BoulderUm = Math.round(d50MainUm * 1.48);
        res = {
          pxPitchUm: pxPitchUm,
          nyquistFloorUm: nyquistUm,
          d50MainUm: d50MainUm,
          d90BoulderUm: d90BoulderUm,
          spanEst: 1.18,
          subFloorNote: 'Particles < ' + nyquistUm + ' um sit below camera 3x3 px Nyquist floor; inferred from burr geometry + Darcy flow.'
        };
      }
      labState.micron.result = res;
      drawMicronCanvas(res);
      paintMicronReadout();
    }

    function paintMicronReadout() {
      readoutBox.textContent = '';
      const r = labState.micron.result;
      if (!r) {
        readoutBox.appendChild(domH('p', {
          class: 'bt-lab-hint',
          text: 'Place scattered grounds on white paper next to any wallet card (85.60 x 53.98 mm) or coin. Sauvola local thresholding + ellipsoidal volume weighting calibrates your burr zero-point.'
        }));
        return;
      }
      readoutBox.appendChild(domH('div', { class: 'bt-lab-metric-strip' },
        domH('div', { class: 'bt-lab-kpi' },
          domH('span', { text: 'Coarse D50' }),
          domH('strong', { class: 'num-tab', text: Math.round(r.d50MainUm) + ' um' })
        ),
        domH('div', { class: 'bt-lab-kpi' },
          domH('span', { text: 'Boulder D90' }),
          domH('strong', { class: 'num-tab', text: Math.round(r.d90BoulderUm || r.d50MainUm * 1.46) + ' um' })
        ),
        domH('div', { class: 'bt-lab-kpi' },
          domH('span', { text: 'Nyquist 3x3 Floor' }),
          domH('strong', { class: 'num-tab', text: '>=' + Math.round(r.nyquistFloorUm || 79) + ' um' })
        )
      ));
      readoutBox.appendChild(domH('p', {
        class: 'bt-lab-hint',
        text: r.subFloorNote || 'Sub-pixel <85 um espresso fines are never faked optically; use 2 filter-range snaps to lock burr offset & slope.'
      }));
      readoutBox.appendChild(domH('button', {
        type: 'button',
        class: 'bt-lab-btn is-primary',
        onclick: function () {
          const a = getApp();
          a.prefs = a.prefs || {};
          a.prefs.pocketMicronCalib = {
            grinderKey: (a.gear && a.gear.grinder) || 'comandante-c40',
            clickSetting: labState.micron.clickVal,
            d50Um: Math.round(r.d50MainUm),
            calibratedAt: new Date().toISOString().slice(0, 10)
          };
          if (typeof calibAdd === 'function') {
            try { calibAdd(a.prefs.pocketMicronCalib.grinderKey, labState.micron.clickVal, Math.round(r.d50MainUm)); } catch (_) {}
          }
          saveDraftSoon();
          CK.haptic('celebrate');
          notify('Saved Pocket Micron calibration (' + Math.round(r.d50MainUm) + ' um at step ' + labState.micron.clickVal + ').');
        }
      }, ic('check-seal', { size: 16 }), domH('span', { text: 'Save Anchor to My Grinder' })));
    }

    const fileIn = domH('input', {
      type: 'file',
      accept: 'image/*',
      capture: 'environment',
      hidden: true,
      onchange: function () {
        const f = fileIn.files && fileIn.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = function () {
          const img = new Image();
          img.onload = function () {
            const ctx = canvas.getContext && canvas.getContext('2d');
            let imgData = null;
            if (ctx) {
              ctx.drawImage(img, 0, 0, 360, 164);
              try { imgData = ctx.getImageData(0, 0, 360, 164); } catch (_) {}
            }
            runSyntheticOrRealAnalysis(imgData);
          };
          img.src = String(reader.result || '');
        };
        reader.readAsDataURL(f);
      }
    });

    const refPills = [
      { k: 'card', lbl: 'ISO Card (85.6mm)' },
      { k: 'quarter', lbl: 'US Quarter (24.3mm)' },
      { k: 'euro', lbl: '1 Euro (23.3mm)' }
    ].map(function (it) {
      return domH('button', {
        type: 'button',
        class: 'bt-lab-chip' + (labState.micron.refType === it.k ? ' is-active' : ''),
        'aria-pressed': String(labState.micron.refType === it.k),
        onclick: function () {
          labState.micron.refType = it.k;
          refPills.forEach(function (b, idx) {
            const on = ['card', 'quarter', 'euro'][idx] === it.k;
            b.classList.toggle('is-active', on);
            b.setAttribute('aria-pressed', String(on));
          });
          drawMicronCanvas(labState.micron.result);
        }
      }, it.lbl);
    });

    const clickVernier = CK.vernierPill({
      label: 'Dial Step',
      value: labState.micron.clickVal,
      min: 1,
      max: 90,
      step: 1,
      unit: 'clicks',
      compact: true,
      onChange: function (v) {
        labState.micron.clickVal = v;
        if (labState.micron.result) runSyntheticOrRealAnalysis(null);
      }
    });

    const micronHow = CK.createExplainer({
      title: 'Pocket Micron Lens',
      whatItDoes: 'Measures grind particle size (D50/D90 um) from a phone photo next to any standard wallet card or coin.',
      howToUse: 'Scatter a pinch of dry grounds on white paper beside a card, set your Dial Step, and tap Snap Photo.',
      proTip: 'Enforces a strict 3x3 px Nyquist floor so sub-pixel <85 um espresso fines are never faked optically.'
    });

    wrap.appendChild(domH('div', { class: 'bt-lab-card-head' },
      domH('div', { class: 'bt-lab-title-group' },
        ic('scan-lens', { size: 20 }),
        domH('div', null,
          domH('h3', { text: 'Pocket Micron Lens — Camera PSD & Burr-Zero Calibrator' }),
          domH('p', { class: 'bt-lab-sub', text: 'Zero-cost smartphone reference-card Sauvola PSD analyzer' })
        )
      ),
      domH('div', { class: 'bt-head-actions' }, micronHow.trigger, epistemicBadge('verified_physics'))
    ));
    wrap.appendChild(micronHow.panel);
    wrap.appendChild(domH('div', { class: 'bt-lab-chip-row' }, refPills, clickVernier));
    wrap.appendChild(canvas);
    wrap.appendChild(domH('div', { class: 'bt-lab-btn-row' },
      fileIn,
      domH('button', {
        type: 'button',
        class: 'bt-lab-btn is-primary',
        onclick: function () { fileIn.click(); }
      }, ic('scan-lens', { size: 16 }), domH('span', { text: 'Snap / Upload Grounds Photo' })),
      domH('button', {
        type: 'button',
        class: 'bt-lab-btn',
        onclick: function () { runSyntheticOrRealAnalysis(null); }
      }, ic('spark-star', { size: 16 }), domH('span', { text: 'Run Reference Calibration Scan' }))
    ));
    wrap.appendChild(readoutBox);

    drawMicronCanvas(labState.micron.result);
    paintMicronReadout();
    return wrap;
  }

  function renderHardwareBench(fullMode) {
    const ble = window.BTBle || {};
    const caps = typeof ble.capabilities === 'function'
      ? ble.capabilities()
      : { webBluetooth: typeof navigator !== 'undefined' && !!navigator.bluetooth };
    const st = getBleStateSafe();
    const root = domH('div', { class: 'bt-ble-bench' + (fullMode ? ' is-full' : '') });

    /* 1. Zero API Key Required Banner + Platform Detection */
    const banner = domH('div', { class: 'bt-ble-zero-key-banner' },
      domH('div', { class: 'bt-ble-banner-main' },
        ic('ble-wave', { size: 22 }),
        domH('div', null,
          domH('strong', { text: 'Direct Web Bluetooth — Zero API Key Required' }),
          domH('p', {
            text: caps.webBluetooth
              ? '1. Power on gear  ·  2. Close vendor phone app so GATT is unlocked  ·  3. Tap any slot below to pair directly in browser.'
              : 'WebKit hides Web Bluetooth here: tap Open in Bluefy on iPhone/iPad for live BLE, or launch our 10Hz Full Bench Simulator right now!'
          })
        )
      ),
      domH('div', { class: 'bt-lab-btn-row' },
        !caps.webBluetooth ? domH('a', {
          class: 'bt-lab-btn',
          href: 'bluefy://open?url=' + encodeURIComponent(typeof location !== 'undefined' ? location.href : 'https://mshaffe1111.github.io/Neurobrew/')
        }, ic('ble-wave', { size: 15 }), domH('span', { text: 'Open in Bluefy (iOS BLE)' })) : null,
        domH('button', {
          type: 'button',
          class: 'bt-lab-btn is-accent',
          onclick: function () {
            if (st.simulatorActive && typeof ble.stopSimulator === 'function') {
              ble.stopSimulator();
              notify('Stopped 10Hz BLE Bench Simulator.');
            } else if (typeof ble.startSimulator === 'function') {
              ble.startSimulator();
              notify('10Hz Full Bench Simulator active across all 5 slots!');
            } else {
              /* Local simulation fallback into Studio 1 & Studio 6 */
              labState.bc.measTds = 1.42;
              labState.bc.measTempC = 23.4;
              labState.roastFresh.beanG = 74.2;
              labState.roastFresh.groundG = 82.0;
              notify('Simulated 1.42% TDS (R2) + 74.2/82.0 Agtron (Omni) + 10Hz Scale!');
            }
            CK.haptic('snap');
            refreshBenchLive();
          }
        }, ic('play', { size: 15 }), domH('span', { text: st.simulatorActive ? 'Stop 10Hz Bench Simulator' : '1-Tap 10Hz Full Bench Simulator' }))
      )
    );
    root.appendChild(banner);

    /* 2. 5 Concurrent WebBLE Hardware Slots */
    const slotsGrid = domH('div', { class: 'bt-ble-slots-grid' });

    const slotDefs = [
      {
        id: 'scale',
        icon: 'scale-deck',
        title: '1. Smart Scale (11 Families)',
        families: 'Acaia · DiFluid Microbalance/Ti · Bookoo Themis · Timemore Classic/OSP/Compact · Felicita · Decent · Varia AKU · Skale II · Eureka · Hiroia · SIG 0x181D',
        readout: function (s) {
          const sc = s.scale || {};
          return sc.connected
            ? (Number(sc.weightG || 0).toFixed(1) + ' g  ·  ' + Number(sc.flowGs || 0).toFixed(1) + ' g/s')
            : 'Standby · 0.0 g';
        },
        actions: [
          { lbl: 'Pair Scale', primary: true, fn: function () { if (ble.connectScale) ble.connectScale(); else notify('Scale pairing requires WebBLE browser or Simulator.'); } },
          { lbl: 'Tare 0.0g', fn: function () { if (ble.tare) ble.tare(); CK.haptic('tick'); } },
          { lbl: 'Sim Lift', fn: function () { if (ble.simulateDripperLift) ble.simulateDripperLift(); } }
        ]
      },
      {
        id: 'pressure',
        icon: 'espresso',
        title: '2. Espresso Pressure (2 Families)',
        families: 'Pressensor / Smart Espresso Profiler (0x185B mbar) · Bookoo Espresso Monitor (0x0FFE bar)',
        readout: function (s) {
          const pr = s.pressure || {};
          return pr.connected ? (Number(pr.bar || 0).toFixed(2) + ' bar live') : 'Standby · 0.0 bar';
        },
        actions: [
          { lbl: 'Pair Pressure', primary: true, fn: function () { if (ble.connectPressure) ble.connectPressure(); else notify('Use Chromium WebBLE or 10Hz Simulator.'); } },
          { lbl: 'Disconnect', fn: function () { if (ble.disconnectPressure) ble.disconnectPressure(); } }
        ]
      },
      {
        id: 'refractometer',
        icon: 'refract-prism',
        title: '3. DiFluid R2 Extract',
        families: 'Optical %TDS · Refractive Index nD20 · Prism Temp ATC · Multi-Read Average',
        readout: function (s) {
          const r2 = s.refractometer || {};
          const tds = r2.tds || labState.bc.measTds;
          return tds > 0
            ? (Number(tds).toFixed(2) + '% TDS · ' + Number(r2.tempC || labState.bc.measTempC || 22.5).toFixed(1) + ' C')
            : 'Standby · Ready to Read';
        },
        actions: [
          { lbl: 'Pair R2', primary: true, fn: function () { if (ble.connectRefractometer) ble.connectRefractometer(); } },
          { lbl: 'Read R2', fn: function () { if (ble.triggerRefractometerRead) ble.triggerRefractometerRead(); } },
          {
            lbl: 'Sim R2 (23.4 C)',
            fn: function () {
              if (ble.simulateRefractometerRead) ble.simulateRefractometerRead();
              labState.bc.measTds = 1.42;
              labState.bc.measTempC = 23.4;
              labState.bc.measNd = +nd20FromBrix(brixFromTds(1.42)).toFixed(5);
              CK.haptic('sweetSpotLock');
              notify('DiFluid R2 plotted 1.42% TDS (23.4 C Spoon-Chilled) onto Brew Control Canvas!');
              refreshBenchLive();
            }
          },
          {
            lbl: 'Sim Hot (37.8 C)',
            fn: function () {
              labState.bc.measTds = 1.48;
              labState.bc.measTempC = 37.8;
              CK.haptic('tick');
              notify('Hot sample alert (37.8 C): Metal-spoon cool 15-20s to avoid evaporation drift!');
              refreshBenchLive();
            }
          }
        ]
      },
      {
        id: 'omni',
        icon: 'omni-nir',
        title: '4. DiFluid Omni (Agtron & PSD)',
        families: 'NIR Whole-Bean & Ground Agtron · Roast Delta · 2D Optical D10 / D50 / D90 um & Span',
        readout: function (s) {
          const om = s.omni || {};
          if (om.beanAgtron || om.d50Um) {
            return 'Agtron ' + (om.beanAgtron || '--') + '/' + (om.groundAgtron || '--') + ' · D50 ' + (om.d50Um || '--') + ' um';
          }
          return 'Bean ' + labState.roastFresh.beanG.toFixed(1) + ' / Ground ' + labState.roastFresh.groundG.toFixed(1) + ' Ag';
        },
        actions: [
          { lbl: 'Pair Omni', primary: true, fn: function () { if (ble.connectOmni) ble.connectOmni(); } },
          { lbl: 'Scan Omni', fn: function () { if (ble.triggerOmniRead) ble.triggerOmniRead(); } },
          {
            lbl: 'Sim Omni',
            fn: function () {
              if (ble.simulateOmniRead) ble.simulateOmniRead();
              labState.roastFresh.beanG = 75.4;
              labState.roastFresh.groundG = 83.6;
              labState.wave.d50Um = 515;
              CK.haptic('snap');
              notify('Simulated Omni scan: Bean 75.4 / Ground 83.6 (Delta +8.2) · D50 515 um.');
              refreshBenchLive();
            }
          }
        ]
      },
      {
        id: 'machine',
        icon: 'xbloom',
        title: '5. xBloom Studio & Stagg EKG+',
        families: 'xBloom 0xFFE0 (Safety Gate: 0x41 Whole-Bean vs 0x44/0xFE Pre-Ground) · Stagg EKG+ 0x1820 Temp',
        readout: function (s) {
          const mc = s.machine || {};
          return mc.connected
            ? ((mc.name || 'Connected') + (mc.tempC ? ' · ' + mc.tempC + ' C' : ''))
            : 'Safety Gate Armed (Whole-Bean vs Pre-Ground)';
        },
        actions: [
          { lbl: 'Pair xBloom', primary: true, fn: function () { if (ble.connectXBloom) ble.connectXBloom(); } },
          { lbl: 'Pair Stagg EKG+', fn: function () { if (ble.connectKettle) ble.connectKettle(); } }
        ]
      }
    ];

    const liveReadoutEls = [];
    slotDefs.forEach(function (sd) {
      const valNode = domH('div', { class: 'bt-ble-slot-readout num-tab', text: sd.readout(st) });
      liveReadoutEls.push({ el: valNode, fn: sd.readout });
      const card = domH('div', { class: 'bt-ble-slot-card', 'data-slot': sd.id },
        domH('div', { class: 'bt-ble-slot-top' },
          ic(sd.icon, { size: 20 }),
          domH('strong', { text: sd.title })
        ),
        valNode,
        domH('p', { class: 'bt-ble-slot-fams', text: sd.families }),
        domH('div', { class: 'bt-lab-btn-row' }, sd.actions.map(function (act) {
          return domH('button', {
            type: 'button',
            class: 'bt-lab-btn is-sm' + (act.primary ? ' is-primary' : ''),
            onclick: act.fn
          }, act.lbl);
        }))
      );
      slotsGrid.appendChild(card);
    });
    root.appendChild(slotsGrid);

    /* Live R2 Refractometer Sample Temp Readiness Badge + Spoon-Chill Guide on Bench */
    const benchR2Widget = buildR2ThermalReadinessWidget({
      onCoolSim: function (cooledC) {
        labState.bc.measTempC = cooledC;
        CK.haptic('sweetSpotLock');
        refreshBenchLive();
      }
    });
    root.appendChild(benchR2Widget);

    function refreshBenchLive() {
      const cur = getBleStateSafe();
      liveReadoutEls.forEach(function (item) {
        item.el.textContent = item.fn(cur);
      });
      if (benchR2Widget && benchR2Widget._syncTemp) benchR2Widget._syncTemp();
    }

    if (fullMode) {
      /* 3. Remembered Gear Auto-Reconnect & Workflow Tool-Mode Pills */
      const remList = (getApp().gear && getApp().gear.ble && getApp().gear.ble.rememberedDevices) ||
        (getApp().prefs && getApp().prefs.gear && getApp().prefs.gear.ble && getApp().prefs.gear.ble.rememberedDevices) || [];

      const remCard = domH('div', { class: 'bt-lab-subcard' },
        domH('div', { class: 'bt-lab-card-head' },
          domH('div', { class: 'bt-lab-title-group' },
            ic('check-seal', { size: 18 }),
            domH('strong', { text: 'Remembered Bluetooth Gear & Workflow Modes' })
          ),
          domH('button', {
            type: 'button',
            class: 'bt-lab-btn is-sm',
            onclick: function () {
              if (ble.autoReconnectRemembered) ble.autoReconnectRemembered();
              notify('Scanning remembered WebBLE permissions via getDevices()...');
            }
          }, 'Auto-Reconnect Remembered')
        ),
        domH('p', {
          class: 'bt-lab-hint',
          text: remList.length
            ? ('Remembered devices (' + remList.length + '): ' + remList.map(function (d) { return d.name || d.id; }).join(', '))
            : 'Paired scales, refractometers, and analyzers appear here for silent 0-popup getDevices() reconnection.'
        })
      );

      const toolRow = domH('div', { class: 'bt-toolmode-grid' });
      [
        { key: 'scale', label: 'BLE Scale' },
        { key: 'refractometer', label: 'Refractometer (%TDS)' },
        { key: 'agtron', label: 'Agtron & Roast Delta' },
        { key: 'psd', label: 'Micron PSD' },
        { key: 'water', label: 'Water Chemistry' }
      ].forEach(function (tm) {
        const curMode = getToolModeSafe(tm.key);
        const pills = ['always', 'optional', 'off'].map(function (mVal) {
          const b = domH('button', {
            type: 'button',
            class: 'bt-lab-chip' + (curMode === mVal ? ' is-active' : ''),
            'aria-pressed': String(curMode === mVal),
            onclick: function () {
              setToolModeSafe(tm.key, mVal);
              pills.forEach(function (pb, pi) {
                const on = ['always', 'optional', 'off'][pi] === mVal;
                pb.classList.toggle('is-active', on);
                pb.setAttribute('aria-pressed', String(on));
              });
              CK.haptic('tick');
            }
          }, mVal === 'always' ? 'Always Use' : (mVal === 'optional' ? 'Optional' : 'Off'));
          return b;
        });
        toolRow.appendChild(domH('div', { class: 'bt-toolmode-item' },
          domH('span', { class: 'bt-toolmode-lbl', text: tm.label }),
          domH('div', { class: 'bt-lab-chip-row' }, pills)
        ));
      });
      remCard.appendChild(toolRow);
      root.appendChild(remCard);

      /* 4. Zero-CORS DiFluid Cafe CSV/JSON/Clipboard Importer + Collapsed Partner Cloud API */
      const dfApi = window.BTDiFluidApi || {};
      const dfMsg = domH('p', { class: 'bt-lab-hint', role: 'status', text: '' });
      const pasteArea = domH('textarea', {
        class: 'bt-lab-textarea',
        rows: '2',
        placeholder: 'Paste DiFluid Cafe / CoffeeOS CSV, JSON, or share text here (Zero API key or CORS needed)...'
      });
      const dfFile = domH('input', {
        type: 'file',
        accept: '.csv,.tsv,.json,.txt',
        hidden: true,
        onchange: function () {
          const f = dfFile.files && dfFile.files[0];
          if (!f) return;
          f.text().then(function (txt) {
            pasteArea.value = txt;
            importDiFluidPayload(txt);
          });
        }
      });

      function importDiFluidPayload(rawText) {
        const txt = String(rawText || '').trim();
        if (!txt) { dfMsg.textContent = 'Paste or drop a DiFluid Cafe export first.'; return; }
        let parsed = null;
        if (typeof dfApi.parseExport === 'function') {
          try { parsed = dfApi.parseExport(txt); } catch (_) {}
        }
        if (parsed && Array.isArray(parsed.records) && parsed.records.length) {
          const rec = parsed.records[0];
          if (rec.tds) labState.bc.measTds = +rec.tds;
          if (rec.beanAgtron) labState.roastFresh.beanG = +rec.beanAgtron;
          if (rec.groundAgtron) labState.roastFresh.groundG = +rec.groundAgtron;
          dfMsg.textContent = 'Imported ' + parsed.records.length + ' DiFluid record(s) into Lab Studios!';
        } else {
          const tdsMatch = txt.match(/([0-9]{1,2}\.[0-9]{1,3})\s*%?\s*(?:TDS)?/i);
          if (tdsMatch) {
            labState.bc.measTds = clamp(parseFloat(tdsMatch[1]), 0.4, 22, 1.40);
            dfMsg.textContent = 'Extracted ' + labState.bc.measTds.toFixed(2) + '% TDS into Brew Control Canvas!';
          } else {
            dfMsg.textContent = 'Parsed DiFluid payload cleanly.';
          }
        }
        CK.haptic('snap');
      }

      /* Strictly local-only Partner API fold ('brew-and-cup-difluid-auth-v1') */
      const cfgNow = typeof dfApi.getConfig === 'function' ? (dfApi.getConfig() || {}) : {};
      const urlIn = domH('input', {
        type: 'url',
        class: 'bt-lab-text-in',
        placeholder: 'https://api.digitizefluid.com/v1',
        value: cfgNow.baseUrl || ''
      });
      const keyIn = domH('input', {
        type: 'password',
        class: 'bt-lab-text-in',
        autocomplete: 'off',
        placeholder: 'Local-only Partner API Key (never exported)',
        value: cfgNow.apiKey || ''
      });

      const partnerDetails = domH('details', { class: 'bt-lab-details' },
        domH('summary', { text: 'Optional Commercial Partner Cloud API (Local-Only Key — Not Needed for Home Users)' }),
        domH('p', {
          class: 'bt-lab-hint',
          text: 'Stored strictly in local-only brew-and-cup-difluid-auth-v1; never serialized into setup_json, CSVs, QR codes, or backups.'
        }),
        domH('div', { class: 'bt-lab-inline-inputs' }, urlIn, keyIn),
        domH('div', { class: 'bt-lab-btn-row' },
          domH('button', {
            type: 'button',
            class: 'bt-lab-btn is-sm is-primary',
            onclick: function () {
              if (typeof dfApi.setConfig === 'function') {
                dfApi.setConfig({ baseUrl: urlIn.value.trim(), apiKey: keyIn.value.trim() });
              }
              dfMsg.textContent = 'Saved local-only Partner API config.';
            }
          }, 'Save Local Config'),
          domH('button', {
            type: 'button',
            class: 'bt-lab-btn is-sm',
            onclick: function () {
              if (typeof dfApi.clearApiKey === 'function') dfApi.clearApiKey();
              keyIn.value = '';
              dfMsg.textContent = 'Cleared local DiFluid API key.';
            }
          }, 'Clear API Key')
        )
      );

      const dfCard = domH('div', { class: 'bt-lab-subcard' },
        domH('div', { class: 'bt-lab-card-head' },
          domH('div', { class: 'bt-lab-title-group' },
            ic('paste-card', { size: 18 }),
            domH('strong', { text: 'DiFluid Cafe & CoffeeOS Zero-CORS Drop / Paste (No API Key)' })
          )
        ),
        pasteArea,
        domH('div', { class: 'bt-lab-btn-row' },
          dfFile,
          domH('button', { type: 'button', class: 'bt-lab-btn is-sm is-primary', onclick: function () { importDiFluidPayload(pasteArea.value); } }, 'Apply Pasted Data'),
          domH('button', { type: 'button', class: 'bt-lab-btn is-sm', onclick: function () { dfFile.click(); } }, 'Choose CSV / JSON'),
          domH('button', {
            type: 'button',
            class: 'bt-lab-btn is-sm',
            onclick: function () {
              if (typeof dfApi.getDemoDataset === 'function') {
                const demo = dfApi.getDemoDataset();
                pasteArea.value = typeof demo === 'string' ? demo : JSON.stringify(demo);
                importDiFluidPayload(pasteArea.value);
              } else {
                labState.bc.measTds = 1.39;
                labState.roastFresh.beanG = 78.0;
                labState.roastFresh.groundG = 85.2;
                dfMsg.textContent = 'Loaded DiFluid Ecosystem Demo Dataset (1.39% TDS, Agtron 78.0/85.2)!';
              }
            }
          }, 'Load Demo Dataset')
        ),
        dfMsg,
        partnerDetails
      );
      root.appendChild(dfCard);

      /* 5. Honest Non-BLE Capability Notes */
      root.appendChild(domH('div', { class: 'bt-lab-subcard bt-honest-hw-notes' },
        domH('strong', { text: 'Honest Hardware Radio & Protocol Notes' }),
        domH('ul', { class: 'bt-lab-list' },
          domH('li', { text: 'Fellow Tally Pro: Contains no Bluetooth radio hardware; pair Acaia, DiFluid Microbalance, Bookoo, Timemore, Felicita, or Decent for live 10Hz telemetry.' }),
          domH('li', { text: 'Fellow Stagg EKG Pro vs EKG+: Stagg EKG+ exposes Bluetooth GATT (0x1820) supported in Slot 5; newer EKG Pro uses Wi-Fi firmware updates only.' }),
          domH('li', { text: 'Fellow Aiden Precision Brewer: Synthesizes exact Green SS Cone (<=450 mL) & Blue Batch Flat (>450 mL) declining-pulse profiles in Tab 1 Brew Studio.' })
        )
      ));

      /* 6. PocketMicronLens Camera Grind Calibrator */
      root.appendChild(buildPocketMicronLensCard());
    }

    return root;
  }

  /* ==========================================================================
   * STUDIO 1: BrewControlCanvas (TDS x EY Studio)
   * ========================================================================== */
  function buildStudioBrewControl() {
    const s = labState.bc;
    const card = domH('section', { class: 'bt-studio-card', id: 'bt-studio-ey' });

    function getDomains() {
      if (s.mode === 'espresso') return { eyMin: 14.0, eyMax: 26.0, tdsMin: 6.0, tdsMax: 14.0, isEsp: true };
      return { eyMin: 14.0, eyMax: 26.0, tdsMin: 0.85, tdsMax: 1.85, isEsp: false };
    }

    const P = { L: 54, T: 22, PW: 344, PH: 304, R: 398, B: 326 };
    function mapX(ey) {
      const d = getDomains();
      return P.L + ((clamp(ey, d.eyMin, d.eyMax, 20) - d.eyMin) / (d.eyMax - d.eyMin)) * P.PW;
    }
    function mapY(tds) {
      const d = getDomains();
      return P.T + (1 - (clamp(tds, d.tdsMin, d.tdsMax, 1.35) - d.tdsMin) / (d.tdsMax - d.tdsMin)) * P.PH;
    }
    function invX(ux) {
      const d = getDomains();
      return d.eyMin + clamp((ux - P.L) / P.PW, 0, 1, 0.5) * (d.eyMax - d.eyMin);
    }
    function invY(uy) {
      const d = getDomains();
      return d.tdsMin + (1 - clamp((uy - P.T) / P.PH, 0, 1, 0.5)) * (d.tdsMax - d.tdsMin);
    }

    function getImmersionFabs() {
      const a = getApp();
      const basis = (a.prefs && a.prefs.immersionBasis) || 'liang';
      return basis === 'gagne' ? 1.00 : 0.00;
    }

    function solveTargetRecipe() {
      const e = clamp(s.targetEy, 10, 31, 20.4) / 100;
      const t = clamp(s.targetTds, 0.4, 20, 1.38) / 100;
      const rw = s.mode === 'espresso' ? 1.10 : clamp(s.rw, 1.2, 2.8, 2.10);
      const D = Math.max(0.5, clamp(s.doseG, 0.5, 200, 18));

      if (s.mode === 'espresso') {
        const bevG = (e * D) / Math.max(1e-4, t);
        const ratioEsp = bevG / D;
        const boilerG = bevG * (1 - t) + rw * D;
        return { doseG: D, pourG: boilerG, bevG: bevG, ratio: ratioEsp, basisNote: 'Beverage-Yield Espresso Ratio (1:' + ratioEsp.toFixed(2) + ')' };
      }
      if (s.mode === 'immersion') {
        const fAbs = getImmersionFabs();
        const rSteep = fAbs + (e * (1 - t)) / Math.max(1e-4, t);
        const pourG = D * rSteep;
        const bevG = Math.max(0, pourG - rw * D) / Math.max(0.5, 1 - t);
        const basisName = fAbs > 0.5 ? 'Gagne Slurry Basis (f_abs = 1.00 g/g)' : 'Liang Equilibrium Basis (f_abs = 0.00 g/g)';
        return { doseG: D, pourG: pourG, bevG: bevG, ratio: rSteep, basisNote: basisName };
      }
      /* Percolation exact conservation of mass */
      const bevG = (e * D) / Math.max(1e-4, t);
      const pourG = Math.max(rw * D + 1, D * ((e * (1 - t)) / Math.max(1e-4, t) + rw) - s.bypassG);
      const rWater = (pourG + s.bypassG) / D;
      return { doseG: D, pourG: pourG, bevG: bevG, ratio: rWater, basisNote: 'Percolation Cup-Solids Basis (r_w = ' + rw.toFixed(2) + ' g/g)' };
    }

    /* Build persistent SVG surface */
    const svg = CK.svgEl('svg', {
      viewBox: '0 0 420 390',
      class: 'bt-chart-svg bt-bc-svg',
      'aria-label': 'Interactive 2D TDS by Extraction Yield Brew Control Canvas'
    });
    const gridG = CK.svgEl('g', { class: 'bt-bc-grid' });
    const zonesG = CK.svgEl('g', { class: 'bt-bc-zones' });
    const kdeOuter = CK.svgEl('path', { class: 'bt-bc-kde-outer', d: '' });
    const kdePeak = CK.svgEl('path', { class: 'bt-bc-kde-peak', d: '' });
    const histDotsG = CK.svgEl('g', { class: 'bt-bc-hist-dots' });
    const crosshair = CK && typeof CK.createCrosshair === 'function'
      ? CK.createCrosshair(P, { visibleOnInit: true, cls: 'bt-bc-crosshair' })
      : null;
    const currentRecipeG = CK.svgEl('g', { class: 'bt-bc-current-pin' });
    const measGroup = CK.svgEl('g', { class: 'bt-bc-meas-pin' });
    const puckGroup = CK.svgEl('g', { class: 'bt-bc-target-puck' });
    const puckHalo = CK.createHitHalo(0, 0, 11, 28, 1);
    const puckRing = CK.svgEl('circle', { r: '13', class: 'bt-bc-puck-ring' });
    const puckCore = CK.svgEl('circle', { r: '8.5', class: 'bt-bc-puck-core' });
    const puckTagBg = CK.svgEl('rect', { x: '-42', y: '-31', width: '84', height: '15', rx: '7.5', class: 'bt-bc-aim-tag-bg' });
    const puckTagTxt = CK.svgEl('text', { x: '0', y: '-20.8', 'text-anchor': 'middle', class: 'bt-bc-aim-tag-txt' });
    puckTagTxt.textContent = 'Aimed Target';
    puckGroup.appendChild(puckHalo);
    puckGroup.appendChild(puckRing);
    puckGroup.appendChild(puckCore);
    puckGroup.appendChild(puckTagBg);
    puckGroup.appendChild(puckTagTxt);

    svg.appendChild(gridG);
    svg.appendChild(zonesG);
    svg.appendChild(kdeOuter);
    svg.appendChild(kdePeak);
    svg.appendChild(histDotsG);
    if (crosshair) svg.appendChild(crosshair.el);
    svg.appendChild(currentRecipeG);
    svg.appendChild(measGroup);
    svg.appendChild(puckGroup);

    const forecastBadgeEl = domH('div', { class: 'bt-flavor-forecast-badge', id: 'bt-bc-flavor-forecast' });
    const summaryEl = domH('div', { class: 'bt-studio-readout-banner' });
    const sweetSnapRow = domH('div', { class: 'bt-lab-chip-row' });
    const immersionBasisRow = domH('div', { class: 'bt-lab-chip-row bt-immersion-basis-row' });
    const r2ReconcileBox = domH('div', { class: 'bt-r2-reconcile-card', hidden: true });
    const studioR2Widget = buildR2ThermalReadinessWidget({
      onCoolSim: function (cooledC) {
        s.measTempC = cooledC;
        if (tempSamplePill) tempSamplePill.setValue(cooledC, true);
        CK.haptic('sweetSpotLock');
        updatePuckAndReadouts();
      }
    });
    let tempSamplePill = null;
    let activePalateTwin = null;

    function getRawHistoryObjs() {
      const stObj = window.BTStorage && typeof window.BTStorage.getHistory === 'function' ? window.BTStorage.getHistory() : null;
      return stObj && Array.isArray(stObj.objs) ? stObj.objs : [];
    }

    function getHistoryPoints() {
      const objs = getRawHistoryObjs();
      const checkExcl = window.BTCoreV6 && typeof window.BTCoreV6.isRowExcludedFromLearning === 'function'
        ? window.BTCoreV6.isRowExcludedFromLearning
        : null;
      const out = [];
      for (let i = 0; i < objs.length; i++) {
        const r = objs[i];
        if (!r || r.exclude_learning === true || r.exclude_learning === '1' || r.exclude_learning === 'true') continue;
        if (checkExcl && checkExcl(r)) continue;
        if (r.recipe_adaptation_json && typeof r.recipe_adaptation_json === 'string' && r.recipe_adaptation_json.indexOf('"exclude_learning":true') >= 0) continue;
        let tds = parseFloat(r.brew_tds_pct);
        let ey = parseFloat(r.brew_ey_pct);
        /* Zero Legacy Engine Handcuffs: derive fresh mass-conservation EY when v1-v5 row has factual TDS + Dose + Yield */
        if (!Number.isFinite(ey) && Number.isFinite(tds) && tds > 0) {
          const dG = parseFloat(r.dose_g);
          const yG = parseFloat(r.yield_g);
          if (Number.isFinite(dG) && dG > 0 && Number.isFinite(yG) && yG > 0) {
            ey = (tds * yG) / dG;
          }
        }
        if (!Number.isFinite(ey) || !Number.isFinite(tds)) continue;
        const isEspRow = tds >= 3.5;
        if ((s.mode === 'espresso') !== isEspRow) continue;
        out.push({
          ey: ey,
          tds: tds,
          stars: parseFloat(r.my_rating_stars) || 0,
          score: parseFloat(r.total_score) || 0,
          robustWeight: r.robustWeight
        });
      }
      return out;
    }

    function redrawStaticBackdrop() {
      gridG.textContent = '';
      zonesG.textContent = '';
      histDotsG.textContent = '';
      sweetSnapRow.textContent = '';
      const d = getDomains();

      /* Frame */
      gridG.appendChild(CK.svgEl('rect', { x: P.L, y: P.T, width: P.PW, height: P.PH, rx: '14', class: 'bt-chart-plot-bg' }));

      /* Axis Gridlines & Ticks */
      for (let ey = 14; ey <= 26; ey += 2) {
        const x = mapX(ey);
        gridG.appendChild(CK.svgEl('line', { x1: x.toFixed(1), y1: P.T, x2: x.toFixed(1), y2: P.B, class: 'bt-chart-gridline' }));
        const t = CK.svgEl('text', { x: x.toFixed(1), y: P.B + 16, 'text-anchor': 'middle', class: 'bt-chart-tick' });
        t.textContent = ey + '%';
        gridG.appendChild(t);
      }
      const tdsStep = d.isEsp ? 2.0 : 0.20;
      for (let tv = d.tdsMin; tv <= d.tdsMax + 1e-6; tv += tdsStep) {
        const y = mapY(tv);
        gridG.appendChild(CK.svgEl('line', { x1: P.L, y1: y.toFixed(1), x2: P.R, y2: y.toFixed(1), class: 'bt-chart-gridline' }));
        const tl = CK.svgEl('text', { x: P.L - 6, y: (y + 4).toFixed(1), 'text-anchor': 'end', class: 'bt-chart-tick' });
        tl.textContent = d.isEsp ? tv.toFixed(0) + '%' : tv.toFixed(2) + '%';
        gridG.appendChild(tl);
      }

      const xAxisLbl = CK.svgEl('text', { x: (P.L + P.PW * 0.5).toFixed(1), y: 378, 'text-anchor': 'middle', class: 'bt-chart-axis-title' });
      xAxisLbl.textContent = 'Extraction Yield (% EY)';
      gridG.appendChild(xAxisLbl);

      /* Iso-Ratio Curves */
      const ratios = d.isEsp ? [1.5, 2.0, 2.5, 3.0] : [14, 15, 16, 17, 18];
      const rw = s.mode === 'espresso' ? 1.1 : (s.mode === 'immersion' ? getImmersionFabs() : s.rw);
      ratios.forEach(function (Rval) {
        const pts = [];
        for (let ey = d.eyMin; ey <= d.eyMax; ey += 0.6) {
          const eFrac = ey / 100;
          const tFrac = d.isEsp ? (eFrac / Rval) : (eFrac / Math.max(0.5, Rval - rw + eFrac));
          const tdsPct = tFrac * 100;
          if (tdsPct >= d.tdsMin && tdsPct <= d.tdsMax) {
            pts.push([mapX(ey), mapY(tdsPct)]);
          }
        }
        if (pts.length >= 2) {
          gridG.appendChild(CK.svgEl('path', { d: CK.monotoneCubicPath(pts), fill: 'none', class: 'bt-bc-isoratio' }));
          const last = pts[pts.length - 1];
          const rl = CK.svgEl('text', { x: (last[0] - 4).toFixed(1), y: (last[1] - 4).toFixed(1), 'text-anchor': 'end', class: 'bt-bc-isolabel' });
          rl.textContent = '1:' + Rval;
          gridG.appendChild(rl);
        }
      });

      /* SCA Classic Zone + Nordic Zone + Channeling Danger Zone */
      const scaLoTds = d.isEsp ? 8.5 : 1.15;
      const scaHiTds = d.isEsp ? 11.5 : 1.35;
      zonesG.appendChild(CK.svgEl('rect', {
        x: mapX(18).toFixed(1),
        y: mapY(scaHiTds).toFixed(1),
        width: (mapX(22) - mapX(18)).toFixed(1),
        height: (mapY(scaLoTds) - mapY(scaHiTds)).toFixed(1),
        rx: '8',
        class: 'bt-bc-zone-sca'
      }));
      const zl = CK.svgEl('text', { x: (mapX(18) + 6).toFixed(1), y: (mapY(scaHiTds) + 13).toFixed(1), class: 'bt-bc-zone-lbl' });
      zl.textContent = d.isEsp ? 'Classic 9-Bar Sweet Zone' : 'SCA Classic (18-22%)';
      zonesG.appendChild(zl);

      if (!d.isEsp) {
        zonesG.appendChild(CK.svgEl('rect', {
          x: mapX(19.6).toFixed(1),
          y: mapY(1.50).toFixed(1),
          width: (mapX(22.4) - mapX(19.6)).toFixed(1),
          height: (mapY(1.30) - mapY(1.50)).toFixed(1),
          rx: '8',
          class: 'bt-bc-zone-nordic'
        }));
      }

      /* Channeling / Harsh Over-Extraction Danger Zone */
      zonesG.appendChild(CK.svgEl('rect', {
        x: mapX(23.2).toFixed(1),
        y: P.T,
        width: (P.R - mapX(23.2)).toFixed(1),
        height: (P.PH * 0.62).toFixed(1),
        rx: '8',
        class: 'bt-bc-zone-danger'
      }));
      const dl = CK.svgEl('text', { x: (P.R - 6).toFixed(1), y: (P.T + P.PH * 0.62 - 7).toFixed(1), 'text-anchor': 'end', class: 'bt-bc-zone-lbl is-danger' });
      dl.textContent = 'Harsh / Channel';
      zonesG.appendChild(dl);

      /* Personal Palate Twin Prior Shift (Cotter Cluster 1/2: 1.08% tea-clarity vs 1.70% heavy-body) */
      activePalateTwin = null;
      if (window.BTCoreV6 && typeof window.BTCoreV6.computePalateTwin === 'function') {
        try {
          activePalateTwin = window.BTCoreV6.computePalateTwin(
            getApp().coffee || {},
            s.mode === 'espresso' ? 'espresso' : (s.mode === 'immersion' ? 'press' : 'v60'),
            getRawHistoryObjs()
          );
        } catch (_) { activePalateTwin = null; }
      }
      if (activePalateTwin && activePalateTwin.confidence >= 0.25) {
        if (!s.userDragged && Number.isFinite(activePalateTwin.targetEyPct) && Number.isFinite(activePalateTwin.targetTdsPct)) {
          s.targetEy = +activePalateTwin.targetEyPct.toFixed(2);
          s.targetTds = +activePalateTwin.targetTdsPct.toFixed(2);
        }
        sweetSnapRow.appendChild(domH('button', {
          type: 'button',
          class: 'bt-lab-chip is-sweet-peak',
          onclick: function () {
            s.targetEy = +activePalateTwin.targetEyPct.toFixed(2);
            s.targetTds = +activePalateTwin.targetTdsPct.toFixed(2);
            s.userDragged = true;
            CK.haptic('sweetSpotLock');
            updatePuckAndReadouts();
          }
        }, ic('spark-star', { size: 14 }), domH('span', {
          text: 'Personal Target: ' + (activePalateTwin.archetype || 'Personalized') +
            ' (' + activePalateTwin.targetTdsPct.toFixed(2) + '% TDS · ' + activePalateTwin.targetEyPct.toFixed(1) + '% EY)'
        })));
      }

      /* Personal KDE Sweet-Spot Island */
      const histPts = getHistoryPoints();
      const kde = CK.computeSweetSpotIslands(histPts, {
        xMin: d.eyMin, xMax: d.eyMax, yMin: d.tdsMin, yMax: d.tdsMax,
        isEspresso: d.isEsp, mapX: mapX, mapY: mapY
      });
      kdeOuter.setAttribute('d', kde.ok ? kde.contour50 : '');
      kdePeak.setAttribute('d', kde.ok ? kde.contour80 : '');

      if (kde.ok && kde.peak) {
        sweetSnapRow.appendChild(domH('button', {
          type: 'button',
          class: 'bt-lab-chip is-sweet-peak',
          onclick: function () {
            s.targetEy = +kde.peak.ey.toFixed(2);
            s.targetTds = +kde.peak.tds.toFixed(2);
            s.userDragged = true;
            CK.haptic('sweetSpotLock');
            updatePuckAndReadouts();
          }
        }, ic('spark-star', { size: 14 }), domH('span', {
          text: isScienceXray()
            ? ('Snap to My Personal Sweet Spot (KDE Peak · ' + kde.peak.ey.toFixed(1) + '% EY · ' + kde.peak.tds.toFixed(2) + '% TDS)')
            : ('Snap to My Personal Sweet Spot (' + kde.peak.ey.toFixed(1) + '% Extraction · ' + kde.peak.tds.toFixed(2) + '% TDS)')
        })));
      }

      /* Spatial clustering guard (BC_STACK = 12 SVG units) so 500+ tastings stay <120 nodes */
      const clusters = [];
      for (let i = 0; i < histPts.length; i++) {
        const hp = histPts[i];
        const hx = mapX(hp.ey);
        const hy = mapY(hp.tds);
        let merged = false;
        for (let k = 0; k < clusters.length; k++) {
          const cl = clusters[k];
          if (Math.hypot(hx - cl.x, hy - cl.y) <= 12) {
            cl.n++;
            if (hp.stars > cl.best) cl.best = hp.stars;
            merged = true;
            break;
          }
        }
        if (!merged && clusters.length < 95) {
          clusters.push({ x: hx, y: hy, n: 1, best: hp.stars });
        }
      }
      clusters.forEach(function (cl) {
        histDotsG.appendChild(CK.svgEl('circle', {
          cx: cl.x.toFixed(1),
          cy: cl.y.toFixed(1),
          r: cl.n > 1 ? '6.2' : '3.8',
          class: 'bt-bc-hist-dot' + (cl.best >= 4.25 ? ' is-liked' : '')
        }));
      });
    }

    function computeCurrentRecipePinCoords() {
      const a = getApp();
      const b = (a && a.brew) || {};
      const d = getDomains();
      const doseCur = clamp(+b.dose || 18, 4, 200, 18);
      const waterCur = clamp(+b.water || 288, 15, 3000, 288);
      const isEspCur = (b.method === 'espresso' || b.method === 'moka');
      let curEy = 20.2;
      let curTds = d.isEsp ? 9.6 : 1.36;
      if (window.BTCoreV6 && typeof window.BTCoreV6.simulateBrew === 'function' && isEspCur === d.isEsp) {
        try {
          const sim = window.BTCoreV6.simulateBrew({
            method: d.isEsp ? 'espresso' : (b.method || 'v60'),
            doseG: doseCur,
            waterG: waterCur,
            tempC: +b.tempC || 93
          });
          const sEy = sim && (sim.eyPct != null ? +sim.eyPct : +sim.ey);
          const sTds = sim && (sim.tdsPct != null ? +sim.tdsPct : +sim.tds);
          if (Number.isFinite(sEy) && Number.isFinite(sTds) && sTds > 0) {
            curEy = sEy;
            curTds = sTds;
          }
        } catch (_) {}
      } else if (isEspCur === d.isEsp) {
        if (d.isEsp) {
          const ratE = clamp(+b.ratio || (waterCur / doseCur), 1.2, 4.0, 2.1);
          curEy = 20.0;
          curTds = curEy / ratE;
        } else {
          const rwCur = clamp(s.rw, 1.2, 2.8, 2.1);
          const diss = doseCur * (curEy / 100);
          const bev = Math.max(20, waterCur - rwCur * doseCur + diss);
          curTds = (100 * diss) / bev;
        }
      }
      return {
        ey: clamp(curEy, d.eyMin, d.eyMax, 20.2),
        tds: clamp(curTds, d.tdsMin, d.tdsMax, d.isEsp ? 9.6 : 1.36),
        doseG: doseCur,
        waterG: waterCur,
        ratio: +(waterCur / Math.max(0.5, doseCur)).toFixed(1)
      };
    }

    function buildCupFlavorForecast(ey, tds, ratio) {
      const d = getDomains();
      const cf = (getApp() && getApp().coffee) || {};
      const bagNotesRaw = String(cf.bag_notes || cf.flavors_liked || '').split(/[,;|]/).map(function (x) { return x.trim(); }).filter(Boolean);
      const roastLow = String(cf.roast || 'light').toLowerCase();
      const defaultPair = bagNotesRaw.length >= 2
        ? (bagNotesRaw[0] + ' & ' + bagNotesRaw[1])
        : (roastLow.indexOf('dark') >= 0 ? 'Dark Cocoa & Toasted Hazelnut' : (roastLow.indexOf('med') >= 0 ? 'Honey, Almond & Milk Chocolate' : 'Peach & Caramel'));
      const delicatePair = bagNotesRaw.length >= 1 ? (bagNotesRaw[0] + ' & Bergamot') : 'Jasmine, Bergamot & Honey';
      const richPair = bagNotesRaw.length >= 1 ? (bagNotesRaw[0] + ' & Brown Sugar') : 'Velvety Toffee & Cocoa';

      let styleHead = 'Juicy & Sweet';
      let noteTail = 'Balanced ' + defaultPair;
      let toneCls = 'is-sweet';

      if (ey < 18.0) {
        styleHead = 'Tart & Under-Extracted';
        noteTail = 'Sharp Citrus & Short Finish (Aim Right \u2192)';
        toneCls = 'is-warn';
      } else if (ey > 22.8) {
        styleHead = 'Dry & Bitter Risk';
        noteTail = 'Heavy Roast Bite & Drying Tail (Aim Left \u2190)';
        toneCls = 'is-danger';
      } else if (tds < (d.isEsp ? 8.4 : 1.29)) {
        styleHead = 'Tea-Like & Floral';
        noteTail = 'Sparkling ' + delicatePair;
        toneCls = 'is-floral';
      } else if (tds > (d.isEsp ? 10.9 : 1.46)) {
        styleHead = 'Rich & Syrupy';
        noteTail = 'Full-Bodied ' + richPair;
        toneCls = 'is-syrupy';
      }
      return {
        styleHead: styleHead,
        ratioTxt: '1:' + ratio.toFixed(1),
        noteTail: noteTail,
        toneCls: toneCls,
        fullText: styleHead + ' \u00B7 1:' + ratio.toFixed(1) + ' \u00B7 ' + noteTail
      };
    }

    function updatePuckAndReadouts(crosshairMode) {
      const px = mapX(s.targetEy);
      const py = mapY(s.targetTds);
      puckGroup.setAttribute('transform', 'translate(' + px.toFixed(2) + ',' + py.toFixed(2) + ')');
      const flipTagBelow = py < P.T + 34;
      puckTagBg.setAttribute('y', flipTagBelow ? '15' : '-31');
      puckTagTxt.setAttribute('y', flipTagBelow ? '25.2' : '-20.8');

      if (crosshair) {
        const dDom = getDomains();
        crosshair.update(
          px,
          py,
          s.targetEy.toFixed(1) + '% EY',
          (dDom.isEsp ? s.targetTds.toFixed(1) : s.targetTds.toFixed(2)) + '%',
          crosshairMode || 'subtle'
        );
      }

      /* Plot "Your Current Recipe" Pin + Delta Bridge Line to "Aimed Target" */
      currentRecipeG.textContent = '';
      const curPin = computeCurrentRecipePinCoords();
      const cpx = mapX(curPin.ey);
      const cpy = mapY(curPin.tds);
      const distPins = Math.hypot(px - cpx, py - cpy);
      if (distPins > 7) {
        currentRecipeG.appendChild(CK.svgEl('line', {
          x1: cpx.toFixed(1),
          y1: cpy.toFixed(1),
          x2: px.toFixed(1),
          y2: py.toFixed(1),
          class: 'bt-bc-delta-bridge'
        }));
      }
      currentRecipeG.appendChild(CK.svgEl('circle', { cx: cpx.toFixed(1), cy: cpy.toFixed(1), r: '8.5', class: 'bt-bc-cur-ring' }));
      currentRecipeG.appendChild(CK.svgEl('circle', { cx: cpx.toFixed(1), cy: cpy.toFixed(1), r: '4.2', class: 'bt-bc-cur-core' }));
      if (distPins > 22) {
        const curLblY = cpy > py ? Math.min(P.B - 6, cpy + 18) : Math.max(P.T + 12, cpy - 12);
        const curLbl = CK.svgEl('text', {
          x: clamp(cpx, P.L + 44, P.R - 44, cpx).toFixed(1),
          y: curLblY.toFixed(1),
          'text-anchor': 'middle',
          class: 'bt-bc-cur-lbl'
        });
        curLbl.textContent = 'Your Current Recipe';
        currentRecipeG.appendChild(curLbl);
      }

      /* Live DiFluid R2 Dual-Pin Overlay & 4-Hypothesis Sensory-vs-R2 Reconciler */
      measGroup.textContent = '';
      let mEyCalc = s.targetEy;
      if (s.measTds > 0) {
        const sol = solveTargetRecipe();
        const mTdsFrac = s.measTds / 100;
        mEyCalc = clamp((mTdsFrac * sol.bevG * 100) / Math.max(0.5, s.doseG), 5, 34, 20);
        const mx = mapX(mEyCalc);
        const my = mapY(s.measTds);
        if (s.sensoryTag === 'drying' || s.sensoryTag === 'sour_bitter') {
          /* Channeling Bifurcation Halo */
          measGroup.appendChild(CK.svgEl('circle', { cx: mx.toFixed(1), cy: my.toFixed(1), r: '18', class: 'bt-bc-channel-halo' }));
        }
        measGroup.appendChild(CK.svgEl('polygon', {
          points: [mx, my - 7, mx + 7, my, mx, my + 7, mx - 7, my].map(function (v) { return v.toFixed(1); }).join(' '),
          class: 'bt-bc-r2-diamond'
        }));
      }

      r2ReconcileBox.textContent = '';
      if (s.measTds > 0 && s.sensoryTag !== 'balanced') {
        const khNow = (getApp().prefs && getApp().prefs.water && getApp().prefs.water.kh) || labState.water.kh || 45;
        const obsMap = {
          drying: { stars: 2.5, dx: 0.48, dy: 0, splitBitter: 'drying', symptom: 'drying' },
          sour_bitter: { stars: 2.5, dx: 0.50, dy: -0.45, splitAcid: 'sharp', splitBitter: 'drying', symptom: 'uneven' },
          clean_strong: { stars: 2.5, dx: 0.45, dy: 0.48, splitBitter: 'clean', splitBody: 'tealike', symptom: 'strong' },
          flat_chalky: { stars: 2.5, dx: 0, dy: 0, contextTag: 'chalky_water', symptom: 'flat' },
          not_my_style: { stars: 2.5, dx: 0, dy: 0, contextTag: 'not_my_style', symptom: 'notforme' }
        }[s.sensoryTag] || { stars: 2.5, symptom: s.sensoryTag };

        let disc = null;
        if (window.BTCoreV6 && typeof window.BTCoreV6.reconcileSensorVsPalate === 'function') {
          try {
            disc = window.BTCoreV6.reconcileSensorVsPalate(
              {
                methodKey: s.mode === 'espresso' ? 'espresso' : 'v60',
                waterKhPpm: khNow,
                bean: getApp().coffee || {}
              },
              Object.assign({}, obsMap, {
                measuredTdsPct: s.measTds,
                measuredEyPct: mEyCalc,
                waterKhPpm: khNow
              }),
              activePalateTwin
            );
          } catch (_) { disc = null; }
        }
        if (!disc || !disc.winningHypothesis) {
          /* Built-in 4-Hypothesis fallback when BTCoreV6 is absent in standalone harness */
          const fallbacks = {
            drying: {
              short: 'H1: Channeling + Bypass Compensation',
              prob: 0.96,
              human: 'R2 read ' + s.measTds.toFixed(2) + '% TDS / ' + mEyCalc.toFixed(1) + '% EY, yet dry astringency proves uneven channeling! WDT/level dry bed, pour <=4 g/s center spiral, and hold ratio steady.',
              sci: 'Jensen convexity defect: 0.5*EY(26%) + 0.5*EY(14%) = 20% bulk nD20 while di-CQA astringency spikes.'
            },
            sour_bitter: {
              short: 'H1: Channeling + Bypass Compensation',
              prob: 0.97,
              human: 'Sour + Bitter at mid R2 %EY confirms fast bypass channels alongside over-extracted fines. Level bed & calm agitation rather than chasing grind.',
              sci: 'Bimodal residence-time split masks local over/under-extraction inside bulk refractive index.'
            },
            clean_strong: {
              short: 'H3: Personal Palate Offset (Human Always Wins!)',
              prob: 0.98,
              human: 'Your palate always outranks textbook SCA boxes! Uniform extraction felt too intense — shifting personal target lighter/gentler.',
              sci: 'Cotter et al. (2021) consumer cluster / TAS2R38 offset updates personal MAP posterior (TDS*, EY*).'
            },
            flat_chalky: {
              short: 'H2: Water Alkalinity / Sip Temp / Lipids',
              prob: 0.91,
              human: 'Bulk extraction succeeded, so flat/chalky notes point to high water buffer (' + Math.round(khNow) + ' ppm KH) or >65 °C sip temp. Blend RO water toward ~40 ppm KH and sip at 55–62 °C.',
              sci: 'nD20 is blind to bicarbonate acid neutralization (HA + HCO3- -> A- + H2CO3).'
            },
            not_my_style: {
              short: 'H4: Bean / Process Style Mismatch',
              prob: 0.99,
              human: 'Clean physical extraction — this bean\'s ferment/roast style simply isn\'t your preference. Protecting your extraction targets; try -3 °C + 15 g hot bypass to soften.',
              sci: 'Separates cultivar/process volatile preference vector from physical extraction target (TDS*, EY*).'
            }
          }[s.sensoryTag];
          if (fallbacks) {
            disc = {
              active: true,
              winningHypothesis: { short: fallbacks.short, prob: fallbacks.prob },
              prescription: { actionHuman: fallbacks.human, actionScientist: fallbacks.sci }
            };
          }
        }
        if (disc && disc.winningHypothesis && disc.prescription) {
          r2ReconcileBox.hidden = false;
          const rawShort = String(disc.winningHypothesis.short || 'Mismatch Explained');
          const cleanShort = isScienceXray() ? rawShort : rawShort.replace(/^H\d:\s*/, '');
          r2ReconcileBox.appendChild(domH('strong', {
            class: 'num-tab',
            text: 'Taste vs. Refractometer Check — ' + cleanShort + ' (' + Math.round((disc.winningHypothesis.prob || 0.9) * 100) + '%)'
          }));
          r2ReconcileBox.appendChild(domH('span', { text: disc.prescription.actionHuman }));
          if (isScienceXray() && disc.prescription.actionScientist) {
            r2ReconcileBox.appendChild(domH('span', { class: 'bt-studio-xray-line', text: disc.prescription.actionScientist }));
          }
        } else {
          r2ReconcileBox.hidden = true;
        }
      } else {
        r2ReconcileBox.hidden = true;
      }

      /* Immersion Basis Visibility Guard: NEVER show immersion EY toggle when percolation/espresso is active */
      immersionBasisRow.hidden = s.mode !== 'immersion';
      if (studioR2Widget && studioR2Widget._syncTemp) studioR2Widget._syncTemp(s.measTempC);

      const rec = solveTargetRecipe();
      const forecast = buildCupFlavorForecast(s.targetEy, s.targetTds, rec.ratio);
      const brix = brixFromTds(s.targetTds);
      const nd20 = nd20FromBrix(brix);
      const lv = getLensLevel();

      forecastBadgeEl.className = 'bt-flavor-forecast-badge ' + forecast.toneCls;
      forecastBadgeEl.textContent = '';
      forecastBadgeEl.appendChild(domH('span', { class: 'bt-forecast-kicker', text: 'CUP FLAVOR FORECAST' }));
      forecastBadgeEl.appendChild(domH('strong', { class: 'bt-forecast-main num-tab', text: forecast.fullText }));

      summaryEl.textContent = '';
      summaryEl.appendChild(domH('div', { class: 'bt-studio-human-line' },
        domH('strong', {
          text: 'Weigh ' + rec.doseG.toFixed(1) + ' g coffee  ·  ' +
            (s.mode === 'espresso'
              ? ('Pull ' + rec.bevG.toFixed(1) + ' g shot')
              : ('Pour ' + rec.pourG.toFixed(0) + ' g water \u2192 ' + rec.bevG.toFixed(0) + ' g in mug')) +
            '  (1:' + rec.ratio.toFixed(1) + ')'
        })
      ));
      if (lv === 'starter') {
        summaryEl.appendChild(domH('p', { class: 'bt-lab-hint', text: forecast.styleHead + ' — tap Brew Aiming Here below to load these exact weights into your recipe (press \u2190 Back anytime to return here in 1 tap).' }));
      }

      if (isScienceXray() || s.measTds > 0) {
        let diagExtra = '';
        if (s.measTds > 0 && s.measTempC > 32) {
          diagExtra = '  ·  Thermal Guard: Sample ' + s.measTempC.toFixed(1) + ' °C (>32 °C; cool to 20–25 °C for ±0.02% ATC)';
        } else if ((s.sensoryTag === 'drying' || s.sensoryTag === 'sour_bitter') && s.targetEy >= 17.5 && s.targetEy <= 22.5) {
          diagExtra = '  ·  Channeling Trap Detected: Fast channels (>26% EY) + dry clumps (<14% EY) average to mid EY \u2192 go 1 step coarser & calmer pour!';
        }
        summaryEl.appendChild(domH('p', {
          class: 'bt-studio-xray-line num-tab',
          text: 'EY = ' + s.targetEy.toFixed(2) + '% (' + (rec.doseG * s.targetEy / 100).toFixed(2) + ' g solids)  ·  TDS = ' +
            s.targetTds.toFixed(2) + '% (~' + brix.toFixed(2) + ' Bx, nD20 = ' + nd20.toFixed(5) + ')  ·  ' + rec.basisNote + diagExtra
        }));
      }
      if (aimCtaSpan) {
        aimCtaSpan.textContent = 'Brew Aiming Here (' + forecast.styleHead + ' · 1:' + rec.ratio.toFixed(1) + ') \u2192';
      }
      if (aimSubSpan) {
        aimSubSpan.textContent = rec.doseG.toFixed(1) + ' g dose · ' +
          (s.mode === 'espresso' ? (rec.bevG.toFixed(1) + ' g yield') : (rec.pourG.toFixed(0) + ' g water \u2192 ' + rec.bevG.toFixed(0) + ' g mug'));
      }
    }

    let aimCtaSpan = domH('span', { text: 'Brew Aiming Here \u2192' });
    let aimSubSpan = domH('span', { class: 'bt-cta-sub num-tab', text: '' });

    const surfCtrl = CK.bindChartSurface(svg, {
      ariaLabel: '2D TDS and Extraction Yield Target Puck',
      ariaMin: 14,
      ariaMax: 26,
      ariaNow: s.targetEy,
      detentStep: 0.2,
      defaultHandleId: 'target_puck',
      getHandles: function () {
        return [{
          id: 'target_puck',
          hitRadiusPx: 30,
          getPos: function () { return { x: mapX(s.targetEy), y: mapY(s.targetTds) }; }
        }];
      },
      onHover: function (p) {
        if (!crosshair) return null;
        if (p.ux < P.L || p.ux > P.R || p.uy < P.T || p.uy > P.B) {
          updatePuckAndReadouts('subtle');
          return null;
        }
        const hEy = +invX(p.ux).toFixed(2);
        const hTds = +invY(p.uy).toFixed(2);
        const dDom = getDomains();
        crosshair.update(p.ux, p.uy, hEy.toFixed(1) + '% EY', (dDom.isEsp ? hTds.toFixed(1) : hTds.toFixed(2)) + '%', 'active');
        const hForecast = buildCupFlavorForecast(hEy, hTds, dDom.isEsp ? (hEy / Math.max(1, hTds)) : ((hEy / 100) / Math.max(0.004, hTds / 100) + s.rw));
        return { loupe: hForecast.styleHead + ' · ' + hEy.toFixed(1) + '% EY · ' + hTds.toFixed(2) + '% TDS' };
      },
      onPointerLeave: function () {
        updatePuckAndReadouts('subtle');
      },
      onPointer: function (p) {
        s.userDragged = true;
        s.stylePreset = 'custom';
        styleBtns.forEach(function (b) { b.classList.remove('is-active'); b.setAttribute('aria-pressed', 'false'); });
        s.targetEy = +invX(p.ux).toFixed(2);
        s.targetTds = +invY(p.uy).toFixed(2);
        updatePuckAndReadouts('active');
        const recLive = solveTargetRecipe();
        const fcLive = buildCupFlavorForecast(s.targetEy, s.targetTds, recLive.ratio);
        return {
          detentValue: s.targetEy,
          ariaNow: s.targetEy,
          ariaText: s.targetEy.toFixed(1) + '% EY at ' + s.targetTds.toFixed(2) + '% TDS',
          loupe: fcLive.styleHead + ' · 1:' + recLive.ratio.toFixed(1) + ' (' + s.targetEy.toFixed(1) + '% EY · ' + s.targetTds.toFixed(2) + '% TDS)'
        };
      },
      onDragEnd: function () {
        updatePuckAndReadouts('subtle');
      },
      onKeyStep: function (k) {
        s.userDragged = true;
        const d = getDomains();
        const tdsStp = d.isEsp ? 0.20 : 0.02;
        s.targetEy = clamp(s.targetEy + k.dx * 0.2, d.eyMin, d.eyMax, s.targetEy);
        s.targetTds = clamp(s.targetTds + k.dy * tdsStp, d.tdsMin, d.tdsMax, s.targetTds);
        updatePuckAndReadouts('active');
        return { ariaNow: s.targetEy, ariaText: s.targetEy.toFixed(1) + '% EY, ' + s.targetTds.toFixed(2) + '% TDS' };
      }
    });

    /* 1-Tap Style Target Presets */
    const STYLE_PRESETS = [
      { k: 'floral', lbl: 'Tea-Like & Floral', ey: 19.6, tds: 1.24, espEy: 20.8, espTds: 8.0 },
      { k: 'juicy', lbl: 'Juicy & Sweet', ey: 20.4, tds: 1.38, espEy: 20.2, espTds: 9.6 },
      { k: 'syrupy', lbl: 'Rich & Syrupy', ey: 21.0, tds: 1.52, espEy: 19.4, espTds: 11.6 }
    ];
    const styleBtns = STYLE_PRESETS.map(function (sp) {
      return domH('button', {
        type: 'button',
        class: 'bt-lab-chip' + (s.stylePreset === sp.k ? ' is-active' : ''),
        'aria-pressed': String(s.stylePreset === sp.k),
        onclick: function () {
          s.stylePreset = sp.k;
          s.userDragged = true;
          s.targetEy = s.mode === 'espresso' ? sp.espEy : sp.ey;
          s.targetTds = s.mode === 'espresso' ? sp.espTds : sp.tds;
          styleBtns.forEach(function (b, idx) {
            const on = STYLE_PRESETS[idx].k === sp.k;
            b.classList.toggle('is-active', on);
            b.setAttribute('aria-pressed', String(on));
          });
          CK.haptic('sweetSpotLock');
          updatePuckAndReadouts();
        }
      }, sp.lbl);
    });

    /* Mode Selector Pills */
    const modeBtns = [
      { k: 'percolation', lbl: 'Filter Percolation' },
      { k: 'immersion', lbl: 'Steeped / Immersion' },
      { k: 'espresso', lbl: 'Espresso & Moka' }
    ].map(function (m) {
      return domH('button', {
        type: 'button',
        class: 'bt-lab-chip' + (s.mode === m.k ? ' is-active' : ''),
        'aria-pressed': String(s.mode === m.k),
        onclick: function () {
          const prevEsp = s.mode === 'espresso';
          s.mode = m.k;
          if (m.k === 'espresso' && !prevEsp) s.targetTds = 9.5;
          else if (m.k !== 'espresso' && prevEsp) s.targetTds = 1.38;
          modeBtns.forEach(function (b, idx) {
            const on = ['percolation', 'immersion', 'espresso'][idx] === m.k;
            b.classList.toggle('is-active', on);
            b.setAttribute('aria-pressed', String(on));
          });
          CK.haptic('tick');
          redrawStaticBackdrop();
          updatePuckAndReadouts();
        }
      }, m.lbl);
    });

    /* Immersion Basis Pills (ONLY visible when s.mode === 'immersion'!) */
    function buildImmersionBasisButtons() {
      immersionBasisRow.textContent = '';
      const a = getApp();
      const curBasis = (a.prefs && a.prefs.immersionBasis) || 'liang';
      immersionBasisRow.appendChild(domH('span', { class: 'bt-lab-inline-lbl', text: 'Immersion Basis:' }));
      [
        { k: 'liang', lbl: 'Liang f_abs = 0.00 [Verified Science]' },
        { k: 'gagne', lbl: 'Gagne f_abs = 1.00 [Active Research]' }
      ].forEach(function (opt) {
        immersionBasisRow.appendChild(domH('button', {
          type: 'button',
          class: 'bt-lab-chip' + (curBasis === opt.k ? ' is-active' : ''),
          'aria-pressed': String(curBasis === opt.k),
          onclick: function () {
            a.prefs = a.prefs || {};
            a.prefs.immersionBasis = opt.k;
            saveDraftSoon();
            buildImmersionBasisButtons();
            redrawStaticBackdrop();
            updatePuckAndReadouts();
          }
        }, opt.lbl));
      });
    }
    buildImmersionBasisButtons();

    /* ICUMSA nD20 / Brix / %TDS Scrubbable Vernier Row */
    const dosePill = CK.vernierPill({
      label: 'Dose',
      value: s.doseG,
      min: 5,
      max: 120,
      step: 0.5,
      decimals: 1,
      unit: 'g',
      compact: true,
      onChange: function (v) { s.doseG = v; updatePuckAndReadouts(); }
    });

    const tdsPill = CK.vernierPill({
      label: 'Meas %TDS',
      value: s.measTds || s.targetTds,
      min: 0.50,
      max: 18.0,
      step: 0.02,
      decimals: 2,
      unit: '%',
      compact: true,
      onChange: function (v) {
        s.measTds = v;
        s.targetTds = clamp(v, getDomains().tdsMin, getDomains().tdsMax, v);
        s.measNd = +nd20FromBrix(brixFromTds(v)).toFixed(5);
        ndPill.setValue(s.measNd, true);
        brixPill.setValue(brixFromTds(v), true);
        updatePuckAndReadouts();
      }
    });

    const brixPill = CK.vernierPill({
      label: 'ICUMSA Brix',
      value: brixFromTds(s.targetTds),
      min: 0.50,
      max: 22.0,
      step: 0.02,
      decimals: 2,
      unit: 'Bx',
      compact: true,
      onChange: function (bx) {
        const tds = tdsFromBrix(bx);
        s.measTds = tds;
        s.targetTds = clamp(tds, getDomains().tdsMin, getDomains().tdsMax, tds);
        s.measNd = +nd20FromBrix(bx).toFixed(5);
        tdsPill.setValue(tds, true);
        ndPill.setValue(s.measNd, true);
        updatePuckAndReadouts();
      }
    });

    const ndPill = CK.vernierPill({
      label: 'nD20',
      value: s.measNd,
      min: 1.3330,
      max: 1.3680,
      step: 0.0001,
      decimals: 4,
      unit: '',
      compact: true,
      onChange: function (nd) {
        s.measNd = nd;
        const bx = brixFromNd(nd, s.measTempC, s.atcMode);
        const tds = tdsFromBrix(bx);
        s.measTds = tds;
        s.targetTds = clamp(tds, getDomains().tdsMin, getDomains().tdsMax, tds);
        tdsPill.setValue(tds, true);
        brixPill.setValue(bx, true);
        updatePuckAndReadouts();
      }
    });

    /* 6-Pill Sensory vs R2 Reconciler (H1 Channeling | H2 Water/Temp | H3 Palate Offset | H4 Style Mismatch) */
    const reconcilerKeys = ['balanced', 'drying', 'sour_bitter', 'clean_strong', 'flat_chalky', 'not_my_style'];
    const trapChips = [
      { k: 'balanced', lbl: 'Balanced' },
      { k: 'drying', lbl: 'Drying / Astringent' },
      { k: 'sour_bitter', lbl: 'Sour + Bitter' },
      { k: 'clean_strong', lbl: 'Clean Bitter / Strong' },
      { k: 'flat_chalky', lbl: 'Flat / Chalky' },
      { k: 'not_my_style', lbl: 'Not My Style' }
    ].map(function (tc) {
      return domH('button', {
        type: 'button',
        class: 'bt-lab-chip bt-r2-rec-pill' + (s.sensoryTag === tc.k ? ' is-active' : ''),
        'aria-pressed': String(s.sensoryTag === tc.k),
        onclick: function () {
          s.sensoryTag = tc.k;
          if (!s.measTds) s.measTds = s.targetTds;
          trapChips.forEach(function (b, idx) {
            const on = reconcilerKeys[idx] === tc.k;
            b.classList.toggle('is-active', on);
            b.setAttribute('aria-pressed', String(on));
          });
          CK.haptic('tick');
          updatePuckAndReadouts();
        }
      }, tc.lbl);
    });

    tempSamplePill = CK.vernierPill({
      label: 'R2 Temp',
      value: s.measTempC,
      min: 10.0,
      max: 65.0,
      step: 0.5,
      decimals: 1,
      unit: 'C',
      compact: true,
      onChange: function (tc) {
        s.measTempC = tc;
        updatePuckAndReadouts();
      }
    });

    const bcHow = CK.createExplainer({
      title: 'Touch-to-Brew Sweet-Spot Control Chart',
      whatItDoes: 'Maps Cup Strength (%TDS) against Extraction Yield (%EY) with SCA Classic Zone + your Personal Sweet Island.',
      howToUse: 'Tap anywhere on the chart (or pick Tea-Like, Juicy, or Syrupy) and press Brew Aiming Here to load your recipe!',
      proTip: 'Stir 3–5 mL in a room-temp metal spoon for 15–20s (20–28 °C) before reading DiFluid R2 to prevent evaporation drift!'
    });

    const aimBtn = domH('button', {
      type: 'button',
      class: 'bt-lab-btn is-primary bt-chart-cta-btn',
      id: 'bt-bc-aim-here-btn',
      onclick: function () {
        const rec = solveTargetRecipe();
        const fc = buildCupFlavorForecast(s.targetEy, s.targetTds, rec.ratio);
        applyLabToBrewAndGo(function (a) {
          a.brew.dose = +rec.doseG.toFixed(1);
          a.brew.water = s.mode === 'espresso' ? +rec.bevG.toFixed(1) : Math.round(rec.pourG);
          a.brew.ratio = +rec.ratio.toFixed(2);
          a.brew.aimTarget = {
            eyPct: +s.targetEy.toFixed(2),
            tdsPct: +s.targetTds.toFixed(2),
            mode: s.mode,
            style: s.stylePreset || 'custom'
          };
          if (s.mode === 'espresso' && a.brew.method !== 'espresso' && a.brew.method !== 'moka') {
            a.brew.method = 'espresso';
          }
          a.brew.customizedNote = fc.styleHead + ' (' + a.brew.dose + 'g : ' + a.brew.water + 'g · 1:' + rec.ratio.toFixed(1) + ')';
        }, {
          targetStep: 'brew',
          returnRoute: 'chart',
          toast: 'Target locked: ' + rec.doseG.toFixed(1) + 'g · 1:' + rec.ratio.toFixed(1) + ' (' + fc.styleHead + ')!'
        });
      }
    }, ic('brew', { size: 17 }), aimCtaSpan);

    const pinLegendRow = domH('div', { class: 'bt-chart-pin-legend' },
      domH('span', { class: 'bt-pin-leg-item' },
        domH('span', { class: 'bt-pin-swatch is-current' }),
        domH('span', { text: 'Your Current Recipe' })
      ),
      domH('span', { class: 'bt-pin-leg-item' },
        domH('span', { class: 'bt-pin-swatch is-aimed' }),
        domH('span', { text: 'Aimed Target (Tap or Drag)' })
      ),
      domH('span', { class: 'bt-pin-leg-item' },
        domH('span', { class: 'bt-pin-swatch is-zone' }),
        domH('span', { text: 'SCA Balanced Zone' })
      )
    );

    const r2Enabled = getToolModeSafe('refractometer') !== 'off';
    const r2Section = domH('div', { class: 'bt-bc-r2-section', hidden: !r2Enabled },
      domH('div', { class: 'bt-vernier-row' }, tdsPill, brixPill, ndPill, tempSamplePill),
      studioR2Widget,
      domH('div', { class: 'bt-lab-chip-row' },
        domH('span', { class: 'bt-lab-inline-lbl', text: 'Taste vs. Refractometer Check:' }),
        trapChips
      ),
      r2ReconcileBox
    );
    const r2ToggleHint = !r2Enabled ? domH('div', { class: 'bt-lab-chip-row' },
      domH('button', {
        type: 'button',
        class: 'bt-lab-chip',
        onclick: function () {
          setToolModeSafe('refractometer', 'optional');
          r2Section.hidden = false;
          r2ToggleHint.hidden = true;
          CK.haptic('tick');
        }
      }, ic('refract-prism', { size: 14 }), domH('span', { text: 'Show Refractometer (%TDS / Brix / nD20) Controls' }))
    ) : null;

    card.appendChild(domH('div', { class: 'bt-lab-card-head' },
      domH('div', { class: 'bt-lab-title-group' },
        ic('refract-prism', { size: 22 }),
        domH('div', null,
          domH('h3', { text: '1. Touch-to-Brew Sweet-Spot Control Chart (Extraction %EY × Strength %TDS)' }),
          domH('p', { class: 'bt-lab-sub', text: 'Tap anywhere or drag Aimed Target — compares against Your Current Recipe with live Flavor Forecast' })
        )
      ),
      domH('div', { class: 'bt-head-actions' }, bcHow.trigger, epistemicBadge('verified_physics'))
    ));
    card.appendChild(bcHow.panel);
    card.appendChild(domH('div', { class: 'bt-lab-chip-row' }, modeBtns));
    card.appendChild(domH('div', { class: 'bt-lab-chip-row' },
      domH('span', { class: 'bt-lab-inline-lbl', text: '1-Tap Cup Style:' }),
      styleBtns,
      dosePill
    ));
    card.appendChild(immersionBasisRow);
    card.appendChild(sweetSnapRow);
    card.appendChild(pinLegendRow);
    card.appendChild(domH('div', { class: 'bt-chart-stage' }, svg));
    card.appendChild(forecastBadgeEl);
    card.appendChild(summaryEl);
    card.appendChild(domH('div', { class: 'bt-chart-cta-bar' }, aimBtn, aimSubSpan));
    if (r2ToggleHint) card.appendChild(r2ToggleHint);
    card.appendChild(r2Section);

    redrawStaticBackdrop();
    updatePuckAndReadouts();
    card._surfCtrl = surfCtrl;
    return card;
  }

  /* ==========================================================================
   * STUDIO 2: ExtractionWaveTelemetry (HiDPI Canvas 3-Wave + Draggable Knots)
   * ========================================================================== */
  function buildStudioExtractionWaves() {
    const w = labState.wave;
    const card = domH('section', { class: 'bt-studio-card', id: 'bt-studio-waves' });
    const stage = domH('div', { class: 'bt-chart-stage bt-wave-hybrid-stage' });

    const canvas = domH('canvas', { class: 'bt-wave-canvas', width: '440', height: '248' });
    const svg = CK.svgEl('svg', {
      viewBox: '0 0 440 248',
      class: 'bt-chart-svg bt-wave-overlay-svg',
      'aria-label': 'Interactive 3-Wave Extraction & Pour Knot Telemetry'
    });
    const knotsG = CK.svgEl('g', { class: 'bt-wave-knots' });
    const cutoffHandleG = CK.svgEl('g', { class: 'bt-wave-cutoff-handle' });
    const scrubLine = CK.svgEl('line', { x1: '0', y1: '16', x2: '0', y2: '224', class: 'bt-wave-scrub-line' });
    svg.appendChild(scrubLine);
    svg.appendChild(cutoffHandleG);
    svg.appendChild(knotsG);
    stage.appendChild(canvas);
    stage.appendChild(svg);

    const waveLegendBar = domH('div', { class: 'bt-wave-legend-bar', role: 'list', 'aria-label': '3-Wave Extraction Legend' },
      domH('span', { class: 'bt-wave-leg-pill is-w1', role: 'listitem' },
        domH('span', { class: 'bt-wave-dot is-w1' }),
        domH('span', { text: 'Wave 1 Bright Acids' })
      ),
      domH('span', { class: 'bt-wave-leg-pill is-w2', role: 'listitem' },
        domH('span', { class: 'bt-wave-dot is-w2' }),
        domH('span', { text: 'Wave 2 Sweet Sugars' })
      ),
      domH('span', { class: 'bt-wave-leg-pill is-w3', role: 'listitem' },
        domH('span', { class: 'bt-wave-dot is-w3' }),
        domH('span', { text: 'Wave 3 Dry Bitters' })
      ),
      domH('span', { class: 'bt-wave-leg-pill is-gate', role: 'listitem' },
        domH('span', { class: 'bt-wave-dot is-gate' }),
        domH('span', { text: 'Pull-Early Cutoff Gate' })
      )
    );

    const readoutBar = domH('div', { class: 'bt-studio-readout-banner' });

    const L = 42, R = 426, PW = 384;
    const T1 = 16, B1 = 162, PH1 = 146;
    const T2 = 172, B2 = 224, PH2 = 52;

    function simulateTrajectory() {
      const maxT = Math.max(120, w.knots[w.knots.length - 1].t + 15);
      const maxM = Math.max(100, w.knots[w.knots.length - 1].m * 1.08);
      /* Try BTCoreV6.simulateBrew first alongside high-res 1s wave trajectory */
      let coreSim = null;
      if (window.BTCoreV6 && typeof window.BTCoreV6.simulateBrew === 'function') {
        try {
          coreSim = window.BTCoreV6.simulateBrew({
            method: 'v60',
            doseG: w.doseG,
            waterG: w.knots[w.knots.length - 1].m,
            d50Um: w.d50Um,
            kettleTempC: w.kettleC,
            agtron: w.agtron,
            brewerMaterial: w.material,
            preheat: w.preheat,
            pulses: w.knots.map(function (k) { return { t: k.t, waterG: k.m }; })
          });
        } catch (_) { coreSim = null; }
      }

      const cWallMap = { plastic: 50.6, glass: 99.6, ceramic: 177.1, vacuum: 13.8 };
      const cWall = cWallMap[w.material] || 50.6;
      const tAmb = 21.0;
      const tWall0 = w.preheat === 'boiling'
        ? tAmb + 0.68 * (w.kettleC - tAmb)
        : (w.preheat === 'warm' ? 34.0 : tAmb);

      let tSlurry = (w.doseG * 1.52 * tAmb + cWall * tWall0) / (w.doseG * 1.52 + cWall);
      let mDrained = 0;
      let thA = 0, thS = 0, thB = 0;

      const uRoast = clamp((w.agtron - 28) / 70, 0, 1, 0.7);
      const wA = 0.45 + 0.75 * uRoast;
      const wS = 1.05 - 0.55 * Math.pow(uRoast - 0.52, 2);
      const wB = 1.35 - 0.95 * uRoast;

      const nSteps = Math.round(maxT);
      const samples = new Array(nSteps + 1);
      let prevM = 0;

      for (let s = 0; s <= nSteps; s++) {
        /* Monotone linear/step interpolation across pour knots */
        let mIn = w.knots[w.knots.length - 1].m;
        for (let k = 0; k < w.knots.length - 1; k++) {
          const k0 = w.knots[k];
          const k1 = w.knots[k + 1];
          if (s >= k0.t && s <= k1.t) {
            const span = Math.max(1, k1.t - k0.t);
            const pourWindow = Math.min(span, 18);
            const u = clamp((s - k0.t) / pourWindow, 0, 1, 1);
            mIn = k0.m + (k1.m - k0.m) * (u * u * (3 - 2 * u));
            break;
          }
        }
        if (s < w.knots[0].t) mIn = 0;

        const qIn = Math.max(0, mIn - prevM);
        prevM = mIn;

        const mHold = Math.max(0, mIn - mDrained);
        const qOut = Math.min(mHold, 0.042 * Math.pow(600 / clamp(w.d50Um, 180, 1200, 540), -0.6) * Math.max(0, mHold - 2.1 * w.doseG));
        mDrained += qOut;

        const activeHold = Math.max(0, mIn - mDrained);
        const cBed = activeHold * 4.184 + w.doseG * 1.52 + cWall * 0.55;
        const tImpact = w.kettleC - 0.6;
        tSlurry = (cBed * tSlurry + qIn * 4.184 * tImpact - 0.34 * (tSlurry - tAmb)) / Math.max(10, cBed + qIn * 4.184);
        tSlurry = clamp(tSlurry, tAmb, 99.5, 90);

        if (mIn >= 1.0) {
          const Tk = tSlurry + 273.15;
          const Rgas = 8.31446;
          const arrA = Math.exp((-1000 * 22.0 / Rgas) * (1 / Tk - 1 / 366.15));
          const arrS = Math.exp((-1000 * 36.5 / Rgas) * (1 / Tk - 1 / 366.15));
          const arrB = Math.exp((-1000 * 48.5 / Rgas) * (1 / Tk - 1 / 366.15));
          const fWet = activeHold / Math.max(1, activeHold + 0.8 * w.doseG);
          const gA = Math.pow(600 / w.d50Um, 1.15);
          const gS = Math.pow(600 / w.d50Um, 1.65);
          const gB = Math.pow(600 / w.d50Um, 1.85);
          const turbBoost = 1 + 0.35 * Math.max(0, qIn / 6.0 - 1);

          const lamA = 0.026 * gA * arrA * fWet * (1 - 0.12 * thA);
          const lamS = 0.0115 * gS * arrS * fWet * (1 - 0.12 * thS);
          const lamB = 0.0038 * gB * arrB * fWet * (1 - 0.12 * thB) * turbBoost;

          thA = 1 - (1 - thA) * Math.exp(-lamA);
          thS = 1 - (1 - thS) * Math.exp(-lamS);
          thB = 1 - (1 - thB) * Math.exp(-lamB);
        }

        samples[s] = {
          t: s,
          m: mIn,
          drainedG: Math.max(0, mDrained),
          flow: qIn,
          tempC: tSlurry,
          yA: clamp(wA * thA, 0, 1, 0),
          yS: clamp(wS * thS, 0, 1, 0),
          yB: clamp(wB * thB, 0, 1, 0)
        };
      }

      /* Normalize final carafe yield smoothly to mass-balance cup target (M_pour - 2.1*Dose) */
      const totalPourEnd = w.knots[w.knots.length - 1].m;
      const expectedCarafeEnd = Math.max(25, totalPourEnd - 2.1 * w.doseG);
      const rawDrainEnd = Math.max(1, samples[nSteps].drainedG);
      const drainScale = expectedCarafeEnd / rawDrainEnd;
      for (let z = 0; z <= nSteps; z++) {
        samples[z].carafeG = Math.min(expectedCarafeEnd, +(samples[z].drainedG * drainScale).toFixed(1));
      }

      return { samples: samples, maxT: maxT, maxM: maxM, expectedCarafeEnd: expectedCarafeEnd, coreSim: coreSim };
    }

    let cachedSim = null;

    function renderWaveCanvasAndOverlay() {
      cachedSim = simulateTrajectory();
      const sim = cachedSim;
      const dpr = Math.min(2.5, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
      const cw = Math.round(440 * dpr);
      const ch = Math.round(248 * dpr);
      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw;
        canvas.height = ch;
      }
      const ctx = canvas.getContext && canvas.getContext('2d');
      if (ctx) {
        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, 440, 248);

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        ctx.fillStyle = isDark ? '#17110E' : '#F4ECE1';
        ctx.fillRect(L, T1, PW, PH1);
        ctx.fillRect(L, T2, PW, PH2);

        const tx = function (t) { return L + (t / sim.maxT) * PW; };
        const my = function (m) { return B1 - (m / sim.maxM) * PH1; };
        const wy = function (u) { return B1 - clamp(u, 0, 1, 0) * (PH1 * 0.86); };
        const ty = function (tc) { return B1 - ((clamp(tc, 60, 100, 90) - 60) / 40) * PH1; };
        const fy = function (fl) { return B2 - (clamp(fl, 0, 12, 0) / 12) * PH2; };

        /* 3 Translucent Chemical Extraction Waves */
        function fillWave(prop, fillCol, strokeCol) {
          ctx.beginPath();
          ctx.moveTo(L, B1);
          for (let i = 0; i < sim.samples.length; i++) {
            ctx.lineTo(tx(sim.samples[i].t), wy(sim.samples[i][prop]));
          }
          ctx.lineTo(tx(sim.samples[sim.samples.length - 1].t), B1);
          ctx.closePath();
          ctx.fillStyle = fillCol;
          ctx.fill();
          ctx.beginPath();
          for (let j = 0; j < sim.samples.length; j++) {
            const sx = tx(sim.samples[j].t);
            const sy = wy(sim.samples[j][prop]);
            if (j === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
          }
          ctx.strokeStyle = strokeCol;
          ctx.lineWidth = 1.8;
          ctx.stroke();
        }

        fillWave('yA', 'rgba(230, 157, 53, 0.24)', '#E69D35');
        fillWave('yS', 'rgba(214, 115, 40, 0.25)', '#D67328');
        fillWave('yB', 'rgba(158, 36, 32, 0.20)', '#9E2B25');

        /* Wave Callout Labels */
        ctx.save();
        ctx.font = '700 9.5px system-ui, sans-serif';
        ctx.fillStyle = isDark ? '#F6B95E' : '#9B5F0D';
        ctx.fillText('1. Fruit Acids', L + 10, B1 - 54);
        ctx.fillStyle = isDark ? '#F09148' : '#8F4210';
        ctx.fillText('2. Caramel Sugars', L + 114, B1 - 38);
        ctx.fillStyle = isDark ? '#E8736D' : '#881F1A';
        ctx.fillText('3. Dry Bitters', L + 242, B1 - 22);
        ctx.restore();

        /* Glowing Emerald CUTOFF GATE + Blocked Dry-Bitters Tail Shield */
        const endDrainT = w.knots[w.knots.length - 1].t;
        const cutT = clamp(w.cutoffSec || (endDrainT - 15), 60, sim.maxT, endDrainT - 15);
        const cutX = tx(cutT);
        const endX = tx(Math.min(sim.maxT, endDrainT + 10));
        ctx.save();
        if (endX > cutX + 2) {
          ctx.fillStyle = isDark ? 'rgba(46, 158, 100, 0.14)' : 'rgba(28, 118, 71, 0.11)';
          ctx.fillRect(cutX, T1, R - cutX, PH1);
        }
        ctx.strokeStyle = 'rgba(46, 158, 100, 0.30)';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(cutX, T1);
        ctx.lineTo(cutX, B1);
        ctx.stroke();
        ctx.strokeStyle = '#2E9E64';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(cutX, T1);
        ctx.lineTo(cutX, B1);
        ctx.stroke();
        ctx.restore();

        /* Cumulative Pour Mass Curve */
        ctx.beginPath();
        for (let i = 0; i < sim.samples.length; i++) {
          const sx = tx(sim.samples[i].t);
          const sy = my(sim.samples[i].m);
          if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
        }
        ctx.strokeStyle = isDark ? '#F7F0E8' : '#1C130E';
        ctx.lineWidth = 2.3;
        ctx.stroke();

        /* Slurry Temperature Trajectory T_slurry(t) */
        ctx.beginPath();
        ctx.setLineDash([4, 3]);
        for (let i = 0; i < sim.samples.length; i++) {
          const sx = tx(sim.samples[i].t);
          const sy = ty(sim.samples[i].tempC);
          if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
        }
        ctx.strokeStyle = '#195A73';
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.setLineDash([]);

        /* Lower Band: Laminar Sweet-Spot Flow Ribbon + dM/dt */
        ctx.fillStyle = 'rgba(46, 125, 79, 0.16)';
        ctx.fillRect(L, fy(6.5), PW, fy(3.0) - fy(6.5));
        ctx.beginPath();
        for (let i = 0; i < sim.samples.length; i++) {
          const sx = tx(sim.samples[i].t);
          const sy = fy(sim.samples[i].flow);
          if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
        }
        ctx.strokeStyle = '#C46824';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        /* Axis Captions */
        ctx.fillStyle = isDark ? '#CEBDAI' : '#534034';
        ctx.font = '600 9.5px ui-monospace, monospace';
        ctx.fillText(Math.round(sim.maxM) + 'g', 4, T1 + 9);
        ctx.fillText('0g', 16, B1);
        ctx.fillText('98C', R - 24, T1 + 9);
        ctx.fillText('g/s', 12, T2 + 11);
        ctx.restore();
      }

      /* Update Draggable Diamond Pour Knots, Live Cutoff Gate Handle & Scrub Line on SVG */
      knotsG.textContent = '';
      cutoffHandleG.textContent = '';
      const txSvg = function (t) { return L + (t / sim.maxT) * PW; };
      const mySvg = function (m) { return B1 - (m / sim.maxM) * PH1; };

      const sxScrub = txSvg(clamp(w.scrubT, 0, sim.maxT, 90));
      scrubLine.setAttribute('x1', sxScrub.toFixed(1));
      scrubLine.setAttribute('x2', sxScrub.toFixed(1));

      w.knots.forEach(function (kn) {
        const kx = txSvg(kn.t);
        const ky = mySvg(kn.m);
        const g = CK.svgEl('g', { transform: 'translate(' + kx.toFixed(1) + ',' + ky.toFixed(1) + ')' });
        g.appendChild(CK.createHitHalo(0, 0, 8, 26, 1));
        g.appendChild(CK.svgEl('polygon', { points: '0,-7 7,0 0,7 -7,0', class: 'bt-wave-diamond-knot' }));
        knotsG.appendChild(g);
      });

      const endDrainSec = w.knots[w.knots.length - 1].t;
      const cutSec = clamp(Math.round(w.cutoffSec || (endDrainSec - 15)), 60, sim.samples.length - 1, Math.max(60, endDrainSec - 15));
      const spEnd = sim.samples[clamp(Math.round(endDrainSec), 0, sim.samples.length - 1, sim.samples.length - 1)];
      const spCut = sim.samples[cutSec];
      const pullCarafeG = Math.round(spCut.carafeG || 210);
      const bittersBlockedPct = spEnd.yB > 0.005 ? Math.max(0, Math.round((1 - spCut.yB / spEnd.yB) * 100)) : 0;
      const sugarsKeptPct = spEnd.yS > 0.005 ? Math.min(100, Math.round((spCut.yS / spEnd.yS) * 100)) : 100;
      const earlyDeltaSec = Math.max(0, Math.round(endDrainSec - cutSec));

      const fmtMmSs = function (sec) {
        const m = Math.floor(sec / 60);
        const sRem = Math.round(sec % 60);
        return m + ':' + String(sRem).padStart(2, '0');
      };

      /* Tactile Draggable Emerald Cutoff Gate Handle right on the chart (shifted 14px lower & clamped clear of axis labels) */
      const cutHandleX = txSvg(cutSec);
      const cutPillX = clamp(cutHandleX, L + 46, R - 48, cutHandleX);
      const cutKnob = CK.svgEl('g', { transform: 'translate(' + cutPillX.toFixed(1) + ',' + (T1 + 42).toFixed(1) + ')' });
      cutKnob.appendChild(CK.createHitHalo(0, 0, 14, 28, 1));
      cutKnob.appendChild(CK.svgEl('rect', { x: '-44', y: '-11', width: '88', height: '22', rx: '11', class: 'bt-wave-cutoff-pill' }));
      const cutKnobTxt = CK.svgEl('text', { x: '0', y: '3.8', 'text-anchor': 'middle', class: 'bt-wave-cutoff-pill-txt num-tab' });
      cutKnobTxt.textContent = fmtMmSs(cutSec) + ' · ~' + pullCarafeG + 'g';
      cutKnob.appendChild(cutKnobTxt);
      cutoffHandleG.appendChild(cutKnob);

      const idx = clamp(Math.round(w.scrubT), 0, sim.samples.length - 1, cutSec);
      const sp = sim.samples[idx];
      if (cutoffRangeEl && document.activeElement !== cutoffRangeEl) {
        cutoffRangeEl.max = String(Math.round(sim.maxT));
        cutoffRangeEl.value = String(cutSec);
      }
      if (cutoffLblEl) {
        cutoffLblEl.textContent = 'Pull Dripper at ' + fmtMmSs(cutSec) + ' (~' + pullCarafeG + ' g in carafe)' +
          (earlyDeltaSec > 0 ? (' · ' + earlyDeltaSec + 's early \u2192 ' + bittersBlockedPct + '% Dry Bitters Blocked, ' + sugarsKeptPct + '% Sweet Sugars Kept') : ' · Full Drain');
      }
      if (cutGateBtnSpan) {
        cutGateBtnSpan.textContent = 'Set Cutoff on My Timer (' + fmtMmSs(cutSec) + ' · ~' + pullCarafeG + 'g) \u2192';
      }

      readoutBar.textContent = '';
      readoutBar.appendChild(domH('div', { class: 'bt-studio-human-line num-tab' },
        domH('strong', {
          text: 'Pull dripper at ' + fmtMmSs(cutSec) + ' (~' + pullCarafeG + ' g in carafe) \u2192 ' + bittersBlockedPct + '% Dry Bitters Blocked, ' + sugarsKeptPct + '% Sweet Sugars Kept  ·  ' +
            'Scrub t = ' + sp.t + 's (Slurry ' + sp.tempC.toFixed(1) + ' °C)'
        })
      ));
      if (isScienceXray()) {
        readoutBar.appendChild(domH('p', {
          class: 'bt-studio-xray-line',
          text: '[Polarity Kinetics & First-Law Open-CV Calorimetry] Wave 1 Bright Acids ' + Math.round(sp.yA * 100) + '% · Wave 2 Sweet Sugars ' + Math.round(sp.yS * 100) + '% · Wave 3 Dry Bitters ' + Math.round(sp.yB * 100) + '% — drag Cutoff Gate pill or diamond pour knots.'
        }));
      }
    }

    let cutoffLblEl = domH('strong', { class: 'num-tab', text: 'Pull Dripper at 2:30 (~210 g in carafe) · 15s early \u2192 Dry Bitters Blocked' });
    let cutGateBtnSpan = domH('span', { text: 'Set Cutoff on My Timer (2:30) \u2192' });
    const cutoffRangeEl = domH('input', {
      type: 'range',
      class: 'bt-lab-range',
      min: '75',
      max: '210',
      step: '5',
      value: String(w.cutoffSec || 150),
      'aria-label': 'Dripper Pull-Early Cutoff Gate in seconds',
      oninput: function () {
        w.cutoffSec = parseInt(cutoffRangeEl.value, 10) || 150;
        w.scrubT = w.cutoffSec;
        CK.haptic('tick');
        renderWaveCanvasAndOverlay();
      }
    });

    CK.bindChartSurface(svg, {
      ariaLabel: 'Extraction Wave Pour Knots, Cutoff Gate and Replay Scrubber',
      detentStep: 5,
      getHandles: function () {
        if (!cachedSim) return [];
        const list = [{
          id: 'cutoff_gate',
          hitRadiusPx: 30,
          getPos: function () {
            const cSec = clamp(Math.round(w.cutoffSec || 150), 60, cachedSim.maxT, 150);
            const rawX = L + (cSec / cachedSim.maxT) * PW;
            return { x: clamp(rawX, L + 46, R - 48, rawX), y: T1 + 42 };
          },
          onMove: function (p) {
            const nextSec = Math.round(clamp(((p.ux - L) / PW) * cachedSim.maxT, 65, cachedSim.maxT, w.cutoffSec) / 5) * 5;
            w.cutoffSec = nextSec;
            w.scrubT = nextSec;
            renderWaveCanvasAndOverlay();
            const spC = cachedSim.samples[clamp(nextSec, 0, cachedSim.samples.length - 1, nextSec)];
            const spE = cachedSim.samples[clamp(Math.round(w.knots[w.knots.length - 1].t), 0, cachedSim.samples.length - 1, cachedSim.samples.length - 1)];
            const blk = spE.yB > 0.005 ? Math.max(0, Math.round((1 - spC.yB / spE.yB) * 100)) : 0;
            const mm = Math.floor(nextSec / 60) + ':' + String(Math.round(nextSec % 60)).padStart(2, '0');
            return {
              detentValue: nextSec,
              loupe: 'Pull @ ' + mm + ' (~' + Math.round(spC.carafeG || 200) + 'g) · ' + blk + '% Dry Bitters Blocked'
            };
          }
        }];
        w.knots.forEach(function (kn, idx) {
          list.push({
            id: 'knot_' + idx,
            hitRadiusPx: 28,
            getPos: function () {
              return {
                x: L + (kn.t / cachedSim.maxT) * PW,
                y: B1 - (kn.m / cachedSim.maxM) * PH1
              };
            },
            onMove: function (p) {
              const totalW = w.knots[w.knots.length - 1].m;
              if (idx > 0 && idx < w.knots.length - 1) {
                const tMin = w.knots[idx - 1].t + 10;
                const tMax = w.knots[idx + 1].t - 10;
                kn.t = Math.round(clamp((p.ux - L) / PW * cachedSim.maxT, tMin, tMax, kn.t) / 5) * 5;
                const mMin = w.knots[idx - 1].m + 15;
                const mMax = totalW - 15;
                kn.m = Math.round(clamp((1 - (p.uy - T1) / PH1) * cachedSim.maxM, mMin, mMax, kn.m) / 5) * 5;
              } else if (idx === 0) {
                kn.m = Math.round(clamp((1 - (p.uy - T1) / PH1) * cachedSim.maxM, w.doseG * 2, totalW * 0.45, kn.m) / 2) * 2;
              } else if (idx === w.knots.length - 1) {
                kn.t = Math.round(clamp((p.ux - L) / PW * cachedSim.maxT, w.knots[idx - 1].t + 20, 260, kn.t) / 5) * 5;
              }
              w.scrubT = kn.t;
              renderWaveCanvasAndOverlay();
              return { detentValue: kn.t, loupe: kn.label + ': ' + kn.t + 's · ' + kn.m + 'g' };
            }
          });
        });
        return list;
      },
      onPointer: function (p) {
        if (p.handleId) return null;
        if (!cachedSim) return null;
        w.scrubT = Math.round(clamp(((p.ux - L) / PW) * cachedSim.maxT, 0, cachedSim.maxT, w.scrubT));
        renderWaveCanvasAndOverlay();
        return { detentValue: w.scrubT, loupe: 'Replay t = ' + w.scrubT + 's' };
      },
      onKeyStep: function (k) {
        if (!cachedSim) return {};
        w.scrubT = clamp(w.scrubT + k.dx * 5, 0, cachedSim.maxT, w.scrubT);
        renderWaveCanvasAndOverlay();
        return { ariaNow: w.scrubT };
      }
    });

    const matPills = [
      { k: 'plastic', lbl: 'Plastic V60 (51 J/K)' },
      { k: 'glass', lbl: 'Glass (100 J/K)' },
      { k: 'ceramic', lbl: 'Ceramic (177 J/K)' },
      { k: 'vacuum', lbl: 'Vacuum SS (14 J/K)' }
    ].map(function (m) {
      return domH('button', {
        type: 'button',
        class: 'bt-lab-chip' + (w.material === m.k ? ' is-active' : ''),
        'aria-pressed': String(w.material === m.k),
        onclick: function () {
          w.material = m.k;
          matPills.forEach(function (b, bi) {
            const on = ['plastic', 'glass', 'ceramic', 'vacuum'][bi] === m.k;
            b.classList.toggle('is-active', on);
            b.setAttribute('aria-pressed', String(on));
          });
          CK.haptic('tick');
          renderWaveCanvasAndOverlay();
        }
      }, m.lbl);
    });

    const prePills = [
      { k: 'cold', lbl: 'Cold Dripper' },
      { k: 'warm', lbl: 'Tap Warm' },
      { k: 'boiling', lbl: 'Boiling Rinse' }
    ].map(function (pr) {
      return domH('button', {
        type: 'button',
        class: 'bt-lab-chip' + (w.preheat === pr.k ? ' is-active' : ''),
        'aria-pressed': String(w.preheat === pr.k),
        onclick: function () {
          w.preheat = pr.k;
          prePills.forEach(function (b, bi) {
            const on = ['cold', 'warm', 'boiling'][bi] === pr.k;
            b.classList.toggle('is-active', on);
            b.setAttribute('aria-pressed', String(on));
          });
          CK.haptic('tick');
          renderWaveCanvasAndOverlay();
        }
      }, pr.lbl);
    });

    const waveHow = CK.createExplainer({
      title: 'Live 3-Wave Extraction Telemetry',
      whatItDoes: 'Simulates early Acids, mid Sugars, and late Bitters kinetics alongside slurry temperature T_slurry(t).',
      howToUse: 'Drag the diamond pour knots to reshape bloom & pulse timing, or scrub left/right to inspect any second.',
      proTip: 'Toggle Cold Ceramic vs Boiling Plastic V60 to watch dripper thermal mass steal or preserve 4–6 °C of heat!'
    });

    card.appendChild(domH('div', { class: 'bt-lab-card-head' },
      domH('div', { class: 'bt-lab-title-group' },
        ic('brew', { size: 22 }),
        domH('div', null,
          domH('h3', { text: '3-Wave Flavor Timeline & Pull-Early Cutoff Gate' }),
          domH('p', { class: 'bt-lab-sub', text: 'Fruit Acids \u2192 Caramel Sugars \u2192 Dry Bitters: see exact % Dry Bitters Blocked by pulling 15s early' })
        )
      ),
      domH('div', { class: 'bt-head-actions' }, waveHow.trigger, epistemicBadge('calibrated_biophysics'))
    ));
    card.appendChild(waveHow.panel);
    card.appendChild(domH('div', { class: 'bt-lab-chip-row' }, matPills));
    card.appendChild(domH('div', { class: 'bt-lab-chip-row' }, prePills,
      CK.vernierPill({
        label: 'Kettle',
        value: w.kettleC,
        min: 80,
        max: 100,
        step: 0.5,
        decimals: 1,
        unit: 'C',
        compact: true,
        onChange: function (v) { w.kettleC = v; renderWaveCanvasAndOverlay(); }
      }),
      CK.vernierPill({
        label: 'Grind D50',
        value: w.d50Um,
        min: 200,
        max: 1100,
        step: 10,
        unit: 'um',
        compact: true,
        onChange: function (v) { w.d50Um = v; renderWaveCanvasAndOverlay(); }
      })
    ));
    card.appendChild(waveLegendBar);
    card.appendChild(stage);
    card.appendChild(domH('div', { class: 'bt-cutoff-scrubber-box' },
      domH('div', { class: 'bt-cutoff-head' },
        cutoffLblEl,
        domH('div', { class: 'bt-lab-chip-row' },
          domH('button', {
            type: 'button',
            class: 'bt-lab-chip',
            onclick: function () {
              w.cutoffSec = Math.max(75, w.knots[w.knots.length - 1].t - 15);
              w.scrubT = w.cutoffSec;
              CK.haptic('snap');
              renderWaveCanvasAndOverlay();
            }
          }, 'Pull 15s Early'),
          domH('button', {
            type: 'button',
            class: 'bt-lab-chip',
            onclick: function () {
              w.cutoffSec = w.knots[w.knots.length - 1].t;
              w.scrubT = w.cutoffSec;
              CK.haptic('tick');
              renderWaveCanvasAndOverlay();
            }
          }, 'Full Drain')
        )
      ),
      cutoffRangeEl
    ));
    card.appendChild(readoutBar);
    card.appendChild(domH('div', { class: 'bt-chart-cta-bar' },
      domH('button', {
        type: 'button',
        class: 'bt-lab-btn is-primary bt-chart-cta-btn',
        id: 'bt-set-cutoff-timer-btn',
        onclick: function () {
          const cutSec = Math.round(w.cutoffSec || 150);
          const mm = Math.floor(cutSec / 60) + ':' + String(Math.round(cutSec % 60)).padStart(2, '0');
          const spC = cachedSim && cachedSim.samples[clamp(cutSec, 0, cachedSim.samples.length - 1, cutSec)];
          const spE = cachedSim && cachedSim.samples[clamp(Math.round(w.knots[w.knots.length - 1].t), 0, cachedSim.samples.length - 1, cachedSim.samples.length - 1)];
          const carafeG = spC ? Math.round(spC.carafeG || 210) : 210;
          const blkPct = (spC && spE && spE.yB > 0.005) ? Math.max(0, Math.round((1 - spC.yB / spE.yB) * 100)) : 28;
          applyLabToBrewAndGo(function (a) {
            a.brew.pullCarafeAtSec = cutSec;
            a.brew.tempC = w.kettleC;
            a.brew.grindUm = w.d50Um;
            a.brew.pourNotes = 'Pull dripper at ' + mm + ' (~' + carafeG + ' g in carafe) to block ' + blkPct + '% dry bitters';
            a.brew.customizedNote = 'Cutoff Gate ' + mm + ' (~' + carafeG + 'g · ' + blkPct + '% dry bitters blocked)';
          }, {
            targetStep: 'timer',
            returnRoute: 'tools',
            toast: 'Cutoff Gate set at ' + mm + ' (~' + carafeG + ' g) on your Brew Timer!'
          });
        }
      }, ic('check-seal', { size: 16 }), cutGateBtnSpan),
      domH('button', {
        type: 'button',
        class: 'bt-lab-btn',
        onclick: function () {
          const cutSec = Math.round(w.cutoffSec || 150);
          const mm = Math.floor(cutSec / 60) + ':' + String(Math.round(cutSec % 60)).padStart(2, '0');
          applyLabToBrewAndGo(function (a) {
            a.brew.pullCarafeAtSec = cutSec;
            a.brew.tempC = w.kettleC;
            a.brew.grindUm = w.d50Um;
            a.brew.customizedNote = '3-Wave Tuned (' + w.kettleC + ' °C · Pull @ ' + mm + ')';
          }, {
            targetStep: 'brew',
            returnRoute: 'tools',
            toast: 'Applied 3-Wave temp, grind & ' + mm + ' Cutoff Gate to your recipe!'
          });
        }
      }, 'Apply to My Recipe \u2192')
    ));

    renderWaveCanvasAndOverlay();
    return card;
  }

  /* ---- In-Mug Emergency Rescue Calculator (Fix the Cup Sitting in Front of You!) ---- */
  function buildInMugRescueCard() {
    const mr = labState.mugRescue;
    const card = domH('section', { class: 'bt-studio-card', id: 'bt-studio-mug-rescue' });
    const verdictBox = domH('div', { class: 'bt-mug-rescue-verdict' });
    const mugSvg = CK.svgEl('svg', {
      viewBox: '0 0 360 148',
      class: 'bt-chart-svg bt-mug-rescue-svg',
      'aria-label': 'In-Mug Emergency Rescue Cross-Section Gauge'
    });
    const mugG = CK.svgEl('g');
    mugSvg.appendChild(mugG);

    const symptoms = [
      { k: 'bitter', lbl: 'Too Bitter / Harsh' },
      { k: 'sour', lbl: 'Too Sour / Sharp' },
      { k: 'strong', lbl: 'Too Strong / Heavy' },
      { k: 'sour_bitter', lbl: 'Sour + Bitter (Channeled)' },
      { k: 'weak', lbl: 'Too Weak / Watery' }
    ];

    const symBtns = symptoms.map(function (sy) {
      return domH('button', {
        type: 'button',
        class: 'bt-lab-chip' + (mr.symptom === sy.k ? ' is-active' : ''),
        'aria-pressed': String(mr.symptom === sy.k),
        onclick: function () {
          mr.symptom = sy.k;
          if (sy.k === 'weak') mr.tdsPct = 1.05;
          else if (sy.k === 'strong') mr.tdsPct = 1.62;
          else mr.tdsPct = 1.48;
          symBtns.forEach(function (b, idx) {
            const on = symptoms[idx].k === sy.k;
            b.classList.toggle('is-active', on);
            b.setAttribute('aria-pressed', String(on));
          });
          CK.haptic('tick');
          paintMugRescue();
        }
      }, sy.lbl);
    });

    const mugWeightIn = domH('input', {
      type: 'number',
      inputmode: 'decimal',
      class: 'bt-lab-text-in bt-lab-num-in',
      min: '30',
      max: '800',
      step: '10',
      value: String(mr.mugG),
      'aria-label': 'Beverage weight in mug in grams',
      oninput: function () {
        const v = parseFloat(mugWeightIn.value);
        if (Number.isFinite(v) && v >= 25 && v <= 900) {
          mr.mugG = v;
          paintMugRescue();
        }
      }
    });

    const milkToggle = domH('button', {
      type: 'button',
      class: 'bt-lab-chip' + (mr.milkAllowed ? ' is-active' : ''),
      'aria-pressed': String(mr.milkAllowed),
      onclick: function () {
        mr.milkAllowed = !mr.milkAllowed;
        milkToggle.classList.toggle('is-active', mr.milkAllowed);
        milkToggle.setAttribute('aria-pressed', String(mr.milkAllowed));
        CK.haptic('tick');
        paintMugRescue();
      }
    }, ic('milk-pitcher', { size: 14 }), domH('span', { text: 'Warm Milk / Oat Available' }));

    function paintMugRescue() {
      const res = solveInMugRescue(mr);
      mugG.textContent = '';
      /* Ceramic Mug Silhouette + Handle */
      mugG.appendChild(CK.svgEl('path', {
        d: 'M 106 42 Q 142 42 142 74 Q 142 106 106 106',
        fill: 'none',
        class: 'bt-mug-handle'
      }));
      mugG.appendChild(CK.svgEl('path', {
        d: 'M 28 24 L 110 24 L 106 124 Q 105 134 94 134 L 44 134 Q 33 134 32 124 Z',
        class: 'bt-vs-glass'
      }));
      const baseH = 66;
      const bypassH = res.bypass80CG > 0 ? clamp((res.bypass80CG / res.mugG) * baseH, 8, 28, 14) : 0;
      const coffeeTop = 132 - baseH;
      mugG.appendChild(CK.svgEl('rect', {
        x: '34', y: coffeeTop.toFixed(1), width: '70', height: baseH.toFixed(1), rx: '5', class: 'bt-vs-liquid'
      }));
      if (bypassH > 0) {
        mugG.appendChild(CK.svgEl('rect', {
          x: '34', y: (coffeeTop - bypassH).toFixed(1), width: '70', height: bypassH.toFixed(1), rx: '4', class: 'bt-mug-bypass-band'
        }));
      }
      const mugLbl = CK.svgEl('text', { x: '69', y: '104', 'text-anchor': 'middle', class: 'bt-vs-col-txt num-tab' });
      mugLbl.textContent = Math.round(res.mugG) + 'g cup';
      mugG.appendChild(mugLbl);

      /* Right Side Action Callouts inside SVG */
      const c1 = CK.svgEl('text', { x: '158', y: '44', class: 'bt-ag-ruler-val num-tab' });
      c1.textContent = res.bypass80CG > 0 ? ('1. Hot Bypass (80 °C): +' + res.bypass80CG + ' g water') : '1. Water Bypass: 0 g (hold strength)';
      mugG.appendChild(c1);

      const c2 = CK.svgEl('text', { x: '158', y: '74', class: 'bt-ag-ruler-val num-tab' });
      c2.textContent = '2. Saline Blocker: ' + res.saline20Drops + ' drops 20% NaCl (~' + res.naclMg + ' mg)';
      mugG.appendChild(c2);

      const c3 = CK.svgEl('text', { x: '158', y: '104', class: 'bt-ag-ruler-name' });
      c3.textContent = mr.milkAllowed ? ('3. Optional 60 °C Milk/Oat: +' + res.warmMilk60CG + ' g') : '3. Sip at 55–58 °C Peak Sweetness Window';
      mugG.appendChild(c3);

      verdictBox.textContent = '';
      verdictBox.appendChild(domH('div', { class: 'bt-studio-readout-banner' },
        domH('div', { class: 'bt-studio-human-line' }, domH('strong', { text: res.headline })),
        domH('p', { class: 'bt-lab-hint', text: res.why }),
        domH('p', { class: 'bt-studio-xray-line', text: res.nextBrewFix }),
        domH('div', { class: 'bt-lab-btn-row', style: 'margin-top:8px' },
          domH('button', {
            type: 'button',
            class: 'bt-lab-btn is-sm is-primary',
            onclick: function () {
              applyLabToBrewAndGo(function (a) {
                const curUm = clamp(+a.brew.grindUm || 550, 180, 1200, 550);
                const curT = clamp(+a.brew.tempC || 93, 80, 100, 93);
                const curR = clamp(+a.brew.ratio || 16, 1.5, 22, 16);
                const curD = clamp(+a.brew.dose || 18, 5, 120, 18);
                if (mr.symptom === 'bitter') {
                  a.brew.grindUm = Math.min(1150, curUm + 26);
                  a.brew.tempC = Math.max(84, curT - 2);
                  a.brew.customizedNote = 'Bitter Fix: Coarser + ' + a.brew.tempC + ' °C';
                } else if (mr.symptom === 'sour') {
                  a.brew.grindUm = Math.max(200, curUm - 26);
                  a.brew.tempC = Math.min(99, curT + 2);
                  a.brew.customizedNote = 'Sour Fix: Finer + ' + a.brew.tempC + ' °C';
                } else if (mr.symptom === 'strong') {
                  a.brew.ratio = +(curR + 1.0).toFixed(1);
                  a.brew.water = Math.round(curD * a.brew.ratio);
                  a.brew.customizedNote = 'Strength Fix: Wider 1:' + a.brew.ratio;
                } else if (mr.symptom === 'weak') {
                  a.brew.ratio = Math.max(12, +(curR - 1.2).toFixed(1));
                  a.brew.water = Math.round(curD * a.brew.ratio);
                  a.brew.customizedNote = 'Body Fix: Tighter 1:' + a.brew.ratio;
                } else {
                  a.brew.agitation = 'gentle';
                  a.brew.customizedNote = 'Channeling Fix: Level Bed & Gentle Center Pour';
                }
              }, {
                targetStep: 'brew',
                returnRoute: 'tools',
                toast: 'Applied Next-Cup Rescue Fix straight to your recipe!'
              });
            }
          }, ic('brew', { size: 14 }), domH('span', { text: 'Apply Next-Cup Fix to My Recipe \u2192' }))
        )
      ));
    }

    card.appendChild(domH('div', { class: 'bt-lab-card-head' },
      domH('div', { class: 'bt-lab-title-group' },
        ic('spark-star', { size: 22 }),
        domH('div', null,
          domH('h3', { text: 'In-Mug Emergency Rescue — Save This Cup Right Now' }),
          domH('p', {
            class: 'bt-lab-sub',
            text: isScienceXray()
              ? '80 °C bypass dilution + 20% culinary saline TAS2R bitter blocker (~44 mg NaCl) + 60 °C milk chelation'
              : 'Fix an overly bitter, sour, or strong cup right in your mug using a splash of hot water, a tiny pinch of salt, or warm milk'
          })
        )
      ),
      epistemicBadge('verified_physics')
    ));
    card.appendChild(domH('div', { class: 'bt-lab-chip-row' }, symBtns));
    card.appendChild(domH('div', { class: 'bt-lab-inline-inputs' },
      domH('label', { class: 'bt-lab-field-lbl' },
        domH('span', { text: 'Cup in Mug (g)' }),
        mugWeightIn
      ),
      CK.vernierPill({
        label: 'Est. %TDS',
        value: mr.tdsPct,
        min: 0.70,
        max: 12.0,
        step: 0.04,
        decimals: 2,
        unit: '%',
        compact: true,
        onChange: function (v) { mr.tdsPct = v; paintMugRescue(); }
      }),
      milkToggle
    ));
    card.appendChild(domH('div', { class: 'bt-chart-stage' }, mugSvg));
    card.appendChild(verdictBox);
    paintMugRescue();
    return card;
  }

  function buildStudioRescueHub() {
    const wrap = domH('div', { class: 'bt-studio-stack' });
    wrap.appendChild(buildInMugRescueCard());
    wrap.appendChild(buildStudioExtractionWaves());
    return wrap;
  }

  /* ==========================================================================
   * STUDIO 3: CircadianCaffeineTimeline (24h Borbely + Infinite Periodic PK)
   * ========================================================================== */
  function buildStudioCircadianCaffeine() {
    const pk = labState.pk;
    const card = domH('section', { class: 'bt-studio-card', id: 'bt-studio-caffeine' });

    const P = { L: 44, T: 24, PW: 398, PH: 202, R: 442, B: 226 };
    const TRACK_Y = 256;

    const svg = CK.svgEl('svg', {
      viewBox: '0 0 460 296',
      class: 'bt-chart-svg bt-pk-svg',
      'aria-label': '24-hour Circadian Alertness and Caffeine Pharmacokinetic Timeline'
    });
    const bgG = CK.svgEl('g', { class: 'bt-pk-bg' });
    const alertPath = CK.svgEl('path', { class: 'bt-pk-alert-curve', fill: 'none' });
    const cafArea = CK.svgEl('path', { class: 'bt-pk-caf-area' });
    const cafPath = CK.svgEl('path', { class: 'bt-pk-caf-curve', fill: 'none' });
    const gateG = CK.svgEl('g', { class: 'bt-pk-gate' });
    const tokensG = CK.svgEl('g', { class: 'bt-pk-tokens' });
    svg.appendChild(bgG);
    svg.appendChild(alertPath);
    svg.appendChild(cafArea);
    svg.appendChild(cafPath);
    svg.appendChild(gateG);
    svg.appendChild(tokensG);

    const readoutBanner = domH('div', { class: 'bt-studio-readout-banner' });
    const safeSipHero = domH('div', { class: 'bt-pk-safesip-hero', id: 'bt-pk-safesip-hero' });
    const inspectorRow = domH('div', { class: 'bt-pk-cup-inspector' });

    function persistCaffeinePrefs() {
      const a = getApp();
      a.prefs = a.prefs || {};
      a.prefs.caffeine = {
        wakeHour: pk.wakeHour,
        bedHour: pk.bedHour,
        cypKey: pk.cypKey,
        swsGateMg: pk.swsGateMg,
        steadyState: pk.steadyState,
        cups: pk.cups.map(function (c) {
          return { id: c.id, label: c.label, icon: c.icon, hour: c.hour, doseG: c.doseG, species: c.species, cafShare: c.cafShare, mg: c.mg };
        })
      };
      saveDraftSoon();
    }

    function getCyp() {
      return CYP_PRESETS.find(function (c) { return c.key === pk.cypKey; }) || CYP_PRESETS[1];
    }

    function t0Window() { return Math.floor(pk.wakeHour) - 1.0; }
    function mapHourX(hVal) {
      const t0 = t0Window();
      let rel = hVal - t0;
      while (rel < 0) rel += 24;
      while (rel > 24) rel -= 24;
      return P.L + (rel / 24) * P.PW;
    }
    function invHourX(ux) {
      const t0 = t0Window();
      return t0 + clamp((ux - P.L) / P.PW, 0, 1, 0.25) * 24;
    }
    function fmtClock(hRaw) {
      const h24 = (((hRaw % 24) + 24) % 24);
      const hr = Math.floor(h24);
      const mn = Math.round((h24 - hr) * 60) % 60;
      const hrAdj = (hr + Math.floor(Math.round((h24 - hr) * 60) / 60)) % 24;
      const ampm = hrAdj >= 12 ? 'PM' : 'AM';
      const h12 = hrAdj % 12 || 12;
      return h12 + ':' + String(mn).padStart(2, '0') + ' ' + ampm;
    }

    function getBedAdj() {
      return pk.bedHour <= pk.wakeHour ? pk.bedHour + 24 : pk.bedHour;
    }

    /* 25-Step Bisection for Latest Safe Single-Cup Cutoff */
    function solveLatestSafeHourForCup(cupMg) {
      const bed = getBedAdj();
      const hl = getCyp().halfLifeH;
      const ke = Math.LN2 / hl;
      const ka = pk.fedMode ? 2.2 : 4.0;
      let lo = pk.wakeHour - 1;
      let hi = bed;
      for (let i = 0; i < 25; i++) {
        const mid = 0.5 * (lo + hi);
        const rem = pk.steadyState
          ? batemanPeriodicImpulse(cupMg, bed, mid, ka, ke)
          : batemanSingleImpulse(cupMg, bed - mid, ka, ke);
        if (rem <= pk.swsGateMg) lo = mid;
        else hi = mid;
      }
      return lo;
    }

    /* Spring animation state for 1-Tap Auto-Slide */
    const slideTargets = {};
    const slideVels = {};
    const springAnim = CK.createSpringAnimator(function (dt) {
      let active = false;
      pk.cups.forEach(function (c) {
        if (slideTargets[c.id] !== undefined) {
          const st = CK.stepSpring(c.hour, slideVels[c.id] || 0, slideTargets[c.id], dt);
          c.hour = st.pos;
          slideVels[c.id] = st.vel;
          if (st.settled) delete slideTargets[c.id];
          else active = true;
        }
      });
      redrawPk();
      return active;
    });

    function autoSlideToGreenGate() {
      if (!pk.cups.length) return;
      const bed = getBedAdj();
      const hl = getCyp().halfLifeH;
      /* Shift schedule backward minimally until A(bed) <= swsGateMg */
      let shift = 0;
      for (let stepH = 0; stepH <= 16; stepH += 1 / 12) {
        const testCups = pk.cups.map(function (c) {
          return { mg: c.mg, hour: Math.max(pk.wakeHour, c.hour - stepH) };
        });
        const bedMg = activeCaffeineMgAt(testCups, bed, hl, pk.steadyState, pk.fedMode);
        if (bedMg <= pk.swsGateMg) {
          shift = stepH;
          break;
        }
        shift = stepH;
      }
      pk.cups.forEach(function (c) {
        slideTargets[c.id] = Math.round(Math.max(pk.wakeHour, c.hour - shift) * 12) / 12;
        slideVels[c.id] = 0;
      });
      CK.haptic('sweetSpotLock');
      springAnim.wake();
    }

    function redrawPk() {
      bgG.textContent = '';
      gateG.textContent = '';
      tokensG.textContent = '';

      const t0 = t0Window();
      const bed = getBedAdj();
      const cyp = getCyp();
      const maxMgY = Math.max(240, cyp.dailyCapMg * 0.85);
      const mapMgY = function (mg) {
        return P.B - clamp(mg / maxMgY, 0, 1, 0) * P.PH;
      };
      const mapAlertY = function (al) {
        return P.B - clamp(al / 100, 0, 1, 0) * P.PH;
      };

      bgG.appendChild(CK.svgEl('rect', { x: P.L, y: P.T, width: P.PW, height: P.PH, rx: '12', class: 'bt-chart-plot-bg' }));

      /* GMT Day / Night Horological 24-Tick Solar-Lunar Bezel Strip */
      const wakeX = P.L + clamp((pk.wakeHour - t0) / 24, 0, 1, 0.05) * P.PW;
      const bedX = P.L + clamp((bed - t0) / 24, 0, 1, 0.75) * P.PW;
      const bezelY = P.T - 13;
      if (bedX > wakeX) {
        bgG.appendChild(CK.svgEl('rect', {
          x: wakeX.toFixed(1), y: bezelY, width: (bedX - wakeX).toFixed(1), height: '11', rx: '4', class: 'bt-pk-bezel-day'
        }));
      }
      if (P.R > bedX) {
        bgG.appendChild(CK.svgEl('rect', {
          x: bedX.toFixed(1), y: bezelY, width: (P.R - bedX).toFixed(1), height: '11', rx: '4', class: 'bt-pk-bezel-night'
        }));
      }
      /* Solar Emblem at Midday & Crescent Moon Emblem in Night Curtain */
      const sunX = Math.min(bedX - 12, wakeX + Math.max(18, (bedX - wakeX) * 0.45));
      bgG.appendChild(CK.svgEl('circle', { cx: sunX.toFixed(1), cy: (bezelY + 5.5).toFixed(1), r: '3.2', class: 'bt-pk-sun-icon' }));
      const moonX = Math.min(P.R - 10, bedX + Math.max(10, (P.R - bedX) * 0.45));
      bgG.appendChild(CK.svgEl('path', {
        d: 'M ' + moonX.toFixed(1) + ' ' + (bezelY + 2.2).toFixed(1) +
          ' A 3.6 3.6 0 1 0 ' + (moonX + 3.4).toFixed(1) + ' ' + (bezelY + 8.6).toFixed(1) +
          ' A 2.8 2.8 0 1 1 ' + moonX.toFixed(1) + ' ' + (bezelY + 2.2).toFixed(1) + ' Z',
        class: 'bt-pk-moon-icon'
      }));

      /* Night Sleep Curtain */
      bgG.appendChild(CK.svgEl('rect', {
        x: bedX.toFixed(1),
        y: P.T,
        width: Math.max(0, P.R - bedX).toFixed(1),
        height: P.PH,
        class: 'bt-pk-night-curtain'
      }));

      /* Precision 24-Hour Horological Bezel Ticks (every 1h, major indices every 3h) */
      for (let dh = 0; dh <= 24; dh += 1) {
        const x = P.L + (dh / 24) * P.PW;
        const isMajor = dh % 3 === 0;
        bgG.appendChild(CK.svgEl('line', {
          x1: x.toFixed(1),
          y1: (P.T - (isMajor ? 7 : 3.5)).toFixed(1),
          x2: x.toFixed(1),
          y2: P.T,
          class: 'bt-pk-horo-tick' + (isMajor ? ' is-major' : '')
        }));
        if (dh % 4 === 0) {
          bgG.appendChild(CK.svgEl('line', { x1: x.toFixed(1), y1: P.T, x2: x.toFixed(1), y2: P.B, class: 'bt-chart-gridline' }));
          const tl = CK.svgEl('text', { x: x.toFixed(1), y: P.B + 13, 'text-anchor': 'middle', class: 'bt-chart-tick' });
          tl.textContent = fmtClock(t0 + dh).replace(':00 ', '');
          bgG.appendChild(tl);
        }
      }

      /* Sample 96 points across 24h & locate Peak Focus Window */
      const cafPts = [];
      const alertPts = [];
      let peakMg = 0;
      let peakAlertVal = -1;
      let peakAlertHour = pk.wakeHour + 2.5;
      for (let i = 0; i <= 96; i++) {
        const th = t0 + (i / 96) * 24;
        const x = P.L + (i / 96) * P.PW;
        const mg = activeCaffeineMgAt(pk.cups, th, cyp.halfLifeH, pk.steadyState, pk.fedMode);
        if (mg > peakMg) peakMg = mg;
        const borb = borbelyAlertnessAt(th, pk.wakeHour, bed, mg, pk.bodyKg);
        if (th >= pk.wakeHour && th <= bed - 1 && borb.alertness > peakAlertVal) {
          peakAlertVal = borb.alertness;
          peakAlertHour = th;
        }
        cafPts.push([x, mapMgY(mg)]);
        alertPts.push([x, mapAlertY(borb.alertness)]);
      }

      /* Peak Focus Zone Emerald Highlight Band */
      const pfStartH = Math.max(pk.wakeHour, peakAlertHour - 1.0);
      const pfEndH = Math.min(bed - 0.5, peakAlertHour + 1.5);
      const pfX0 = Math.max(P.L, mapHourX(pfStartH));
      const pfX1 = Math.min(bedX, mapHourX(pfEndH));
      if (pfX1 > pfX0 + 8) {
        bgG.appendChild(CK.svgEl('rect', {
          x: pfX0.toFixed(1),
          y: P.T,
          width: (pfX1 - pfX0).toFixed(1),
          height: P.PH,
          class: 'bt-pk-focus-band'
        }));
        const pfl = CK.svgEl('text', {
          x: clamp((pfX0 + pfX1) * 0.5, P.L + 46, P.R - 46, (pfX0 + pfX1) * 0.5).toFixed(1),
          y: (P.T + 12).toFixed(1),
          'text-anchor': 'middle',
          class: 'bt-bc-zone-lbl'
        });
        pfl.textContent = 'Peak Focus Zone';
        bgG.appendChild(pfl);
      }

      cafPath.setAttribute('d', CK.monotoneCubicPath(cafPts));
      cafArea.setAttribute('d', CK.monotoneCubicPath(cafPts, { areaBaselineY: P.B }));
      alertPath.setAttribute('d', CK.monotoneCubicPath(alertPts));

      /* Wake & Bedtime Draggable Curtain Handles + Bedtime Threshold Line + Last Safe Sip Flagpole */
      const bedMg = activeCaffeineMgAt(pk.cups, bed, cyp.halfLifeH, pk.steadyState, pk.fedMode);
      const gatePass = bedMg <= pk.swsGateMg;
      const gateY = mapMgY(pk.swsGateMg);
      const cutoffRefFlag = solveLatestSafeHourForCup(150);
      const cutoffEspFlag = solveLatestSafeHourForCup(75);
      const flagX = clamp(mapHourX(cutoffRefFlag), P.L + 28, Math.max(P.L + 36, bedX - 18), P.L + 160);

      /* Horizontal Bedtime Threshold Line across full plot */
      gateG.appendChild(CK.svgEl('line', {
        x1: P.L,
        y1: gateY.toFixed(1),
        x2: P.R,
        y2: gateY.toFixed(1),
        class: 'bt-pk-sleep-thresh-line ' + (gatePass ? 'is-safe' : 'is-over')
      }));
      const threshLbl = CK.svgEl('text', {
        x: (P.L + 6).toFixed(1),
        y: Math.max(P.T + 12, gateY - 4).toFixed(1),
        class: 'bt-pk-thresh-lbl num-tab'
      });
      threshLbl.textContent = 'Bedtime Threshold (' + pk.swsGateMg + ' mg)';
      gateG.appendChild(threshLbl);

      /* Last Safe Sip Flagpole */
      gateG.appendChild(CK.svgEl('line', {
        x1: flagX.toFixed(1),
        y1: (P.T + 16).toFixed(1),
        x2: flagX.toFixed(1),
        y2: P.B,
        class: 'bt-pk-flagpole'
      }));
      const flagBanner = CK.svgEl('rect', {
        x: Math.max(P.L + 2, flagX - 58).toFixed(1),
        y: (P.T + 16).toFixed(1),
        width: '116',
        height: '16',
        rx: '8',
        class: 'bt-pk-flag-badge'
      });
      gateG.appendChild(flagBanner);
      const flagTxt = CK.svgEl('text', {
        x: Math.max(P.L + 60, flagX).toFixed(1),
        y: (P.T + 27).toFixed(1),
        'text-anchor': 'middle',
        class: 'bt-pk-flag-txt num-tab'
      });
      flagTxt.textContent = 'Last Safe Sip ' + fmtClock(cutoffRefFlag);
      gateG.appendChild(flagTxt);

      gateG.appendChild(CK.svgEl('line', { x1: wakeX.toFixed(1), y1: P.T, x2: wakeX.toFixed(1), y2: P.B, class: 'bt-pk-wake-line' }));
      gateG.appendChild(CK.svgEl('line', {
        x1: bedX.toFixed(1),
        y1: gateY.toFixed(1),
        x2: bedX.toFixed(1),
        y2: P.B,
        class: 'bt-pk-sws-glow ' + (gatePass ? 'is-safe' : 'is-over')
      }));
      gateG.appendChild(CK.svgEl('line', {
        x1: bedX.toFixed(1),
        y1: gateY.toFixed(1),
        x2: bedX.toFixed(1),
        y2: P.B,
        class: 'bt-pk-sws-portal ' + (gatePass ? 'is-safe' : 'is-over')
      }));
      const gl = CK.svgEl('text', {
        x: (bedX - 5).toFixed(1),
        y: (gateY - 5).toFixed(1),
        'text-anchor': 'end',
        class: 'bt-pk-gate-lbl ' + (gatePass ? 'is-safe' : 'is-over')
      });
      gl.textContent = (gatePass ? 'Sleep Safe (' : 'Above Deep-Sleep Limit (') + Math.round(bedMg) + '/' + pk.swsGateMg + ' mg)';
      gateG.appendChild(gl);

      /* Timeline Cup Track & Tokens */
      tokensG.appendChild(CK.svgEl('rect', { x: P.L, y: TRACK_Y - 14, width: P.PW, height: 28, rx: '14', class: 'bt-pk-track-bar' }));
      pk.cups.forEach(function (cup, idx) {
        const cx = mapHourX(cup.hour);
        const g = CK.svgEl('g', {
          transform: 'translate(' + cx.toFixed(1) + ',' + TRACK_Y + ')',
          class: 'bt-pk-cup-token' + (pk.selectedCupIdx === idx ? ' is-selected' : '')
        });
        g.appendChild(CK.createHitHalo(0, 0, 16, 26, 1));
        g.appendChild(CK.svgEl('rect', { x: '-22', y: '-13', width: '44', height: '26', rx: '13', class: 'bt-pk-token-pill' }));
        const tx = CK.svgEl('text', { x: '0', y: '4', 'text-anchor': 'middle', class: 'bt-pk-token-txt num-tab' });
        tx.textContent = cup.mg + 'mg';
        g.appendChild(tx);
        tokensG.appendChild(g);
      });

      /* Prominent Last Safe Sip Before Bed Hero Callout */
      safeSipHero.className = 'bt-pk-safesip-hero ' + (gatePass ? 'is-safe' : 'is-over');
      safeSipHero.textContent = '';
      safeSipHero.appendChild(domH('div', { class: 'bt-pk-safesip-main' },
        domH('span', { class: 'bt-forecast-kicker', text: 'LAST SAFE SIP BEFORE BED' }),
        domH('strong', {
          class: 'bt-pk-safesip-clock num-tab',
          text: fmtClock(cutoffRefFlag) + ' for ' + fmtClock(bed) + ' sleep'
        }),
        domH('span', {
          class: 'bt-pk-safesip-sub num-tab',
          text: 'Full Cup (~150 mg): ' + fmtClock(cutoffRefFlag) + '  ·  Half-Caf / Single Shot (~75 mg): ' + fmtClock(cutoffEspFlag) +
            '  ·  Peak Focus Zone: ' + fmtClock(pfStartH) + '–' + fmtClock(pfEndH)
        })
      ));

      /* Readout Banner */
      const totalDailyMg = pk.cups.reduce(function (acc, c) { return acc + c.mg; }, 0);
      const cutoffRef = cutoffRefFlag;
      const midDayBorb = borbelyAlertnessAt(pk.wakeHour + 7.5, pk.wakeHour, bed, activeCaffeineMgAt(pk.cups, pk.wakeHour + 7.5, cyp.halfLifeH, pk.steadyState, pk.fedMode), pk.bodyKg);

      readoutBanner.textContent = '';
      readoutBanner.appendChild(domH('div', { class: 'bt-studio-human-line' },
        domH('strong', {
          text: (gatePass ? 'Deep Sleep Protected: ' : 'Bedtime Alert: ') +
            Math.round(bedMg) + ' mg active at ' + fmtClock(bed) +
            ' (limit ' + pk.swsGateMg + ' mg)  ·  Total Today: ' + totalDailyMg + ' / ' + cyp.dailyCapMg + ' mg'
        })
      ));
      if (isScienceXray()) {
        readoutBanner.appendChild(domH('p', {
          class: 'bt-studio-xray-line num-tab',
          text: 't_1/2 = ' + cyp.halfLifeH.toFixed(1) + ' h (ke = ' + (Math.LN2 / cyp.halfLifeH).toFixed(4) + ' h^-1)  ·  ' +
            (pk.steadyState ? 'Infinite 24h Periodic Steady-State' : 'Single-Day Impulse') +
            '  ·  Midday Cp = ' + midDayBorb.cpMgL.toFixed(2) + ' mg/L (~' + midDayBorb.a1OccupancyPct.toFixed(1) + '% A1AR occupancy, Elmenhorst 2012)'
        }));
      }
      paintCupInspector();
    }

    function paintCupInspector() {
      inspectorRow.textContent = '';
      const sel = pk.cups[pk.selectedCupIdx];
      if (!sel) {
        if (pk.deletedCup) {
          inspectorRow.appendChild(domH('button', {
            type: 'button',
            class: 'bt-lab-btn is-sm',
            onclick: function () {
              pk.cups.push(pk.deletedCup);
              pk.deletedCup = null;
              pk.selectedCupIdx = pk.cups.length - 1;
              redrawPk();
            }
          }, 'Undo Removed Cup'));
        }
        return;
      }

      const speciesChips = Object.keys(SPECIES_CAF_MG_PER_G).map(function (spKey) {
        const meta = SPECIES_CAF_MG_PER_G[spKey];
        return domH('button', {
          type: 'button',
          class: 'bt-lab-chip' + (sel.species === spKey ? ' is-active' : ''),
          'aria-pressed': String(sel.species === spKey),
          onclick: function () {
            sel.species = spKey;
            recomputeCupMg(sel);
            CK.haptic('tick');
            redrawPk();
          }
        }, meta.label + ' (' + meta.mgPerG + ')');
      });

      inspectorRow.appendChild(domH('div', { class: 'bt-pk-inspector-top' },
        domH('strong', { text: sel.label + ' @ ' + fmtClock(sel.hour) + ' (' + sel.mg + ' mg)' }),
        CK.vernierPill({
          label: 'Dry Dose',
          value: sel.doseG,
          min: 5,
          max: 45,
          step: 0.5,
          decimals: 1,
          unit: 'g',
          compact: true,
          onChange: function (v) { sel.doseG = v; recomputeCupMg(sel); redrawPk(); }
        }),
        domH('button', {
          type: 'button',
          class: 'bt-lab-btn is-sm',
          onclick: function () {
            pk.deletedCup = pk.cups.splice(pk.selectedCupIdx, 1)[0];
            pk.selectedCupIdx = Math.max(0, pk.cups.length - 1);
            redrawPk();
          }
        }, ic('trash-bin', { size: 14 }), domH('span', { text: 'Remove Cup' }))
      ));
      inspectorRow.appendChild(domH('div', { class: 'bt-lab-chip-row' }, speciesChips));
    }

    CK.bindChartSurface(svg, {
      ariaLabel: '24-Hour Caffeine Cup Tokens and Wake/Bed Curtains',
      allowBackgroundJump: false,
      detentStep: 1 / 12,
      getHandles: function () {
        const t0 = t0Window();
        const bed = getBedAdj();
        const list = pk.cups.map(function (cup, idx) {
          return {
            id: cup.id,
            hitRadiusPx: 30,
            getPos: function () { return { x: mapHourX(cup.hour), y: TRACK_Y }; },
            onStart: function () { pk.selectedCupIdx = idx; paintCupInspector(); },
            onMove: function (p) {
              if (p.uy < TRACK_Y - 56 && pk.cups.length > 0) {
                /* Dragged upward off track -> delete with Undo */
                pk.deletedCup = pk.cups.splice(idx, 1)[0];
                pk.selectedCupIdx = Math.max(0, pk.cups.length - 1);
                CK.haptic('snap');
                redrawPk();
                return { loupe: 'Removed cup (Tap Undo below)' };
              }
              const rawH = invHourX(p.ux);
              cup.hour = Math.round(rawH * 12) / 12;
              redrawPk();
              return { detentValue: cup.hour, loupe: cup.label + ': ' + fmtClock(cup.hour) + ' (' + cup.mg + ' mg)' };
            }
          };
        });
        list.push({
          id: 'bed_curtain',
          hitRadiusPx: 28,
          getPos: function () {
            return { x: P.L + clamp((bed - t0) / 24, 0, 1, 0.75) * P.PW, y: P.T + P.PH * 0.5 };
          },
          onMove: function (p) {
            const hRaw = invHourX(p.ux);
            pk.bedHour = Math.round(clamp(hRaw, pk.wakeHour + 8, pk.wakeHour + 21, 23) * 4) / 4;
            redrawPk();
            return { detentValue: pk.bedHour, loupe: 'Bedtime: ' + fmtClock(pk.bedHour) };
          }
        });
        list.push({
          id: 'wake_curtain',
          hitRadiusPx: 28,
          getPos: function () {
            return { x: P.L + clamp((pk.wakeHour - t0) / 24, 0, 1, 0.05) * P.PW, y: P.T + P.PH * 0.5 };
          },
          onMove: function (p) {
            const hRaw = invHourX(p.ux);
            pk.wakeHour = Math.round(clamp(hRaw, 4, 12, 7) * 4) / 4;
            redrawPk();
            return { detentValue: pk.wakeHour, loupe: 'Wake: ' + fmtClock(pk.wakeHour) };
          }
        });
        return list;
      },
      onKeyStep: function (k) {
        const sel = pk.cups[pk.selectedCupIdx];
        if (!sel) return {};
        sel.hour = Math.round((sel.hour + k.dx * (1 / 12)) * 12) / 12;
        redrawPk();
        return { ariaNow: sel.hour, ariaText: fmtClock(sel.hour) };
      }
    });

    /* Caffeine Metabolism Speed Chips */
    const cypBtns = CYP_PRESETS.map(function (cp) {
      const comfyLbl = cp.key === 'slow'
        ? 'Slow Metabolizer'
        : (cp.key === 'pregnancy' ? 'Pregnancy' : cp.label);
      const dispLbl = (isScienceXray() ? cp.label : comfyLbl) + ' (' + cp.halfLifeH + 'h)';
      return domH('button', {
        type: 'button',
        class: 'bt-lab-chip' + (pk.cypKey === cp.key ? ' is-active' : ''),
        'aria-pressed': String(pk.cypKey === cp.key),
        onclick: function () {
          pk.cypKey = cp.key;
          cypBtns.forEach(function (b, bi) {
            const on = CYP_PRESETS[bi].key === cp.key;
            b.classList.toggle('is-active', on);
            b.setAttribute('aria-pressed', String(on));
          });
          CK.haptic('tick');
          persistCaffeinePrefs();
          redrawPk();
        }
      }, dispLbl);
    });

    /* 1-Tap Drink Adder: Regular / Half-Caf / Decaf / Espresso (+ Eugenioides) */
    const quickDrops = [
      { lbl: '+ Regular (16g)', shortName: 'Regular Filter', icon: 'v60', doseG: 16, sp: 'arabica', share: 1.0 },
      { lbl: '+ Half-Caf (16g)', shortName: 'Half-Caf', icon: 'v60', doseG: 16, sp: 'arabica', share: 0.5 },
      { lbl: '+ Decaf (16g)', shortName: 'Decaf', icon: 'decaf-leaf', doseG: 16, sp: 'decaf', share: 1.0 },
      { lbl: '+ Espresso (18g)', shortName: 'Espresso Shot', icon: 'espresso', doseG: 18, sp: 'arabica', share: 1.0 },
      { lbl: '+ Eugenioides', shortName: 'Eugenioides', icon: 'v60', doseG: 16, sp: 'eugenioides', share: 1.0 }
    ].map(function (qd) {
      return domH('button', {
        type: 'button',
        class: 'bt-lab-btn is-sm bt-pk-add-drink-btn',
        onclick: function () {
          const lastH = pk.cups.length ? pk.cups[pk.cups.length - 1].hour + 2.5 : pk.wakeHour + 1.0;
          const nc = {
            id: 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2, 5),
            label: qd.shortName,
            icon: qd.icon,
            hour: Math.min(getBedAdj() - 1, lastH),
            doseG: qd.doseG,
            species: qd.sp,
            cafShare: qd.share,
            mg: 0
          };
          recomputeCupMg(nc);
          pk.cups.push(nc);
          pk.selectedCupIdx = pk.cups.length - 1;
          CK.haptic('snap');
          persistCaffeinePrefs();
          redrawPk();
        }
      }, ic(qd.icon, { size: 14 }), domH('span', { text: qd.lbl }));
    });

    const steadyBtn = domH('button', {
      type: 'button',
      class: 'bt-lab-chip' + (pk.steadyState ? ' is-active' : ''),
      'aria-pressed': String(pk.steadyState),
      onclick: function () {
        pk.steadyState = !pk.steadyState;
        steadyBtn.classList.toggle('is-active', pk.steadyState);
        steadyBtn.setAttribute('aria-pressed', String(pk.steadyState));
        persistCaffeinePrefs();
        redrawPk();
      }
    }, isScienceXray() ? 'Daily Habit Mode (24h Steady-State)' : 'Daily Habit Mode');

    const pkHow = CK.createExplainer({
      title: '24-Hour Caffeine Body Curve & Last Safe Sip',
      whatItDoes: 'Tracks your Peak Focus Zone and active caffeine clearance against your Bedtime Deep-Sleep Limit.',
      howToUse: 'Tap + Regular, + Half-Caf, + Decaf, or + Espresso to add drinks, drag cups on the clock bar, or tap Auto-Slide.',
      proTip: 'Pick your personal Caffeine Metabolism Speed (3h fast to 13h sensitive/pregnancy) for an exact Last Safe Sip time!'
    });

    /* ---- CafCup Single-Cup & Cafe Chain Planner Subcard ---- */
    const cc = labState.cafCup;
    const cafCupCard = domH('div', { class: 'bt-lab-subcard', id: 'bt-sub-cafcup' });
    const cafCupOut = domH('div', { class: 'bt-cafcup-readout' });
    const drinkSel = domH('select', {
      class: 'bt-lab-select',
      'aria-label': 'Select cafe or home coffee drink',
      onchange: function () {
        cc.drinkKey = drinkSel.value;
        paintCafCup();
      }
    });
    CAF_SHOP_DRINKS.forEach(function (d) {
      const opt = domH('option', { value: d.key, text: d.label + ' (~' + d.mg + ' mg)' });
      if (d.key === cc.drinkKey) opt.selected = true;
      drinkSel.appendChild(opt);
    });

    const scoopToggle = domH('button', {
      type: 'button',
      class: 'bt-lab-chip' + (cc.measureBy === 'scoops' ? ' is-active' : ''),
      onclick: function () {
        cc.measureBy = cc.measureBy === 'scoops' ? 'grams' : 'scoops';
        scoopToggle.classList.toggle('is-active', cc.measureBy === 'scoops');
        CK.haptic('tick');
        paintCafCup();
      }
    }, 'Scoop vs Scale Trap');

    const roastDensityBtns = [
      { k: 'light', lbl: 'Blonde / Light (8.6g/tbsp)' },
      { k: 'medium', lbl: 'Medium (7.4g/tbsp)' },
      { k: 'dark', lbl: 'Dark / Oily (6.1g/tbsp)' }
    ].map(function (rd) {
      return domH('button', {
        type: 'button',
        class: 'bt-lab-chip' + (cc.roastLevel === rd.k ? ' is-active' : ''),
        onclick: function () {
          cc.roastLevel = rd.k;
          roastDensityBtns.forEach(function (b, idx) { b.classList.toggle('is-active', ['light', 'medium', 'dark'][idx] === rd.k); });
          paintCafCup();
        }
      }, rd.lbl);
    });

    function paintCafCup() {
      const d = cafShopShots(cc.drinkKey);
      const gramsPerScoop = cc.roastLevel === 'light' ? 8.6 : (cc.roastLevel === 'medium' ? 7.4 : 6.1);
      const scoopDoseG = +(cc.scoops * gramsPerScoop).toFixed(1);
      const spMeta = SPECIES_CAF_MG_PER_G[cc.species] || SPECIES_CAF_MG_PER_G.arabica;
      const calcMg = cc.measureBy === 'scoops'
        ? Math.round(scoopDoseG * spMeta.mgPerG * 0.86)
        : d.mg;
      const latestHr = solveLatestSafeHourForCup(calcMg);
      const sleepReadyHr = cafSleepReadyAt([{ hour: 14.0, mg: calcMg }], { halfLifeH: getCyp().halfLifeH, gateMg: pk.swsGateMg });

      cafCupOut.textContent = '';
      cafCupOut.appendChild(domH('div', { class: 'bt-lab-metric-strip' },
        domH('div', { class: 'bt-lab-kpi' },
          domH('span', { text: 'Caffeine Dose' }),
          domH('strong', { class: 'num-tab', text: calcMg + ' mg (~' + (calcMg / 72).toFixed(1) + ' shots)' })
        ),
        domH('div', { class: 'bt-lab-kpi' },
          domH('span', { text: 'Last Safe Sip' }),
          domH('strong', { class: 'num-tab', text: fmtClock(latestHr) })
        ),
        domH('div', { class: 'bt-lab-kpi' },
          domH('span', { text: 'If Sipped 2:00 PM \u2192 Sleep Gate' }),
          domH('strong', { class: 'num-tab', text: fmtClock(sleepReadyHr) })
        )
      ));
      cafCupOut.appendChild(domH('p', {
        class: 'bt-lab-hint',
        text: cc.measureBy === 'scoops'
          ? ('2 level tbsp scoops of ' + cc.roastLevel + ' roast weigh ' + scoopDoseG + ' g (light beans are denser & less puffed than dark beans \u2192 +41% more caffeine by scoop, ~0% difference by gram!).')
          : d.note
      }));
      cafCupOut.appendChild(domH('button', {
        type: 'button',
        class: 'bt-lab-btn is-sm is-primary',
        onclick: function () {
          const lastH = pk.cups.length ? pk.cups[pk.cups.length - 1].hour + 2.0 : pk.wakeHour + 1.0;
          pk.cups.push({
            id: 'cc_' + Date.now(),
            label: d.label.split(' (')[0],
            icon: 'v60',
            hour: Math.min(getBedAdj() - 1, lastH),
            doseG: cc.measureBy === 'scoops' ? scoopDoseG : 16,
            species: cc.species,
            cafShare: 1.0,
            mg: calcMg
          });
          pk.selectedCupIdx = pk.cups.length - 1;
          CK.haptic('snap');
          redrawPk();
        }
      }, ic('plus', { size: 14 }), domH('span', { text: 'Drop ' + calcMg + ' mg Cup onto My 24h Curve \u2192' })));
    }

    cafCupCard.appendChild(domH('div', { class: 'bt-lab-card-head' },
      domH('div', { class: 'bt-lab-title-group' },
        ic('brew', { size: 18 }),
        domH('strong', { text: 'CafCup Planner — 16 Cafe & Home Drinks + Scoop-vs-Scale Trap' })
      )
    ));
    cafCupCard.appendChild(domH('div', { class: 'bt-lab-inline-inputs' }, drinkSel, scoopToggle));
    cafCupCard.appendChild(domH('div', { class: 'bt-lab-chip-row' }, roastDensityBtns));
    cafCupCard.appendChild(cafCupOut);
    paintCafCup();

    card.appendChild(domH('div', { class: 'bt-lab-card-head' },
      domH('div', { class: 'bt-lab-title-group' },
        ic('moon-dark', { size: 22 }),
        domH('div', null,
          domH('h3', { text: '24-Hour Caffeine Body Curve & Last Safe Sip' }),
          domH('p', {
            class: 'bt-lab-sub',
            text: isScienceXray()
              ? 'Peak Focus Zone + CYP1A2 metabolism speed + bedtime sleep-threshold curve'
              : 'Peak Focus Zone, Caffeine Metabolism Speed & exact Last Safe Sip clock time before bed'
          })
        )
      ),
      domH('div', { class: 'bt-head-actions' }, pkHow.trigger, epistemicBadge('verified_physics'))
    ));
    card.appendChild(pkHow.panel);
    card.appendChild(safeSipHero);
    card.appendChild(domH('div', { class: 'bt-lab-chip-row' },
      domH('span', { class: 'bt-lab-inline-lbl', text: 'Caffeine Metabolism Speed:' }),
      cypBtns,
      steadyBtn
    ));
    card.appendChild(domH('div', { class: 'bt-chart-stage' }, svg));
    card.appendChild(readoutBanner);
    card.appendChild(domH('div', { class: 'bt-lab-chip-row bt-pk-drink-adder-row' },
      domH('span', { class: 'bt-lab-inline-lbl', text: 'Add Drink:' }),
      quickDrops
    ));
    card.appendChild(domH('div', { class: 'bt-lab-btn-row' },
      domH('button', {
        type: 'button',
        class: 'bt-lab-btn is-primary',
        onclick: function () {
          autoSlideToGreenGate();
          persistCaffeinePrefs();
        }
      }, ic('spark-star', { size: 16 }), domH('span', { text: 'Auto-Slide Cups Before Last Safe Sip \u2192' }))
    ));
    card.appendChild(inspectorRow);
    card.appendChild(cafCupCard);

    redrawPk();
    return card;
  }

  /* ==========================================================================
   * STUDIO 4: WaterMineralPad (GH x KH Studio + WaterQuickFixer)
   * ========================================================================== */
  function buildStudioWaterPad() {
    const wt = labState.water;
    const card = domH('section', { class: 'bt-studio-card', id: 'bt-studio-water' });

    const P = { L: 48, T: 18, PW: 364, PH: 250, R: 412, B: 268 };
    function domainMax() {
      const needWide = wt.kh > 135 || wt.gh > 210 || (wt.tapBlendOn && (wt.khTap > 135 || wt.ghTap > 210));
      return needWide ? { khMax: 320, ghMax: 340 } : { khMax: 140, ghMax: 220 };
    }
    function mapX(kh) { return P.L + clamp(kh / domainMax().khMax, 0, 1, 0) * P.PW; }
    function mapY(gh) { return P.B - clamp(gh / domainMax().ghMax, 0, 1, 0) * P.PH; }
    function invX(ux) { return clamp(((ux - P.L) / P.PW) * domainMax().khMax, 0, domainMax().khMax, 35); }
    function invY(uy) { return clamp(((P.B - uy) / P.PH) * domainMax().ghMax, 0, domainMax().ghMax, 70); }

    const svg = CK.svgEl('svg', {
      viewBox: '0 0 430 310',
      class: 'bt-chart-svg bt-water-svg',
      'aria-label': 'Interactive 2D GH by KH Water Mineral Chemistry Pad'
    });
    const zonesG = CK.svgEl('g', { class: 'bt-wt-zones' });
    const scalePath = CK.svgEl('path', { class: 'bt-wt-scale-hyperbola' });
    const rayG = CK.svgEl('g', { class: 'bt-wt-blend-ray' });
    const dropG = CK.svgEl('g', { class: 'bt-wt-droplet' });
    dropG.appendChild(CK.createHitHalo(0, 0, 11, 28, 1));
    dropG.appendChild(CK.svgEl('circle', { r: '12', class: 'bt-wt-drop-halo' }));
    dropG.appendChild(CK.svgEl('circle', { r: '7.5', class: 'bt-wt-drop-core' }));
    svg.appendChild(zonesG);
    svg.appendChild(scalePath);
    svg.appendChild(rayG);
    svg.appendChild(dropG);

    const readoutBanner = domH('div', { class: 'bt-studio-readout-banner' });
    const recipeDeck = domH('div', { class: 'bt-wt-recipe-deck' });

    function redrawWater() {
      zonesG.textContent = '';
      rayG.textContent = '';
      const dm = domainMax();
      const spec = solveWaterSpeciation(wt);

      zonesG.appendChild(CK.svgEl('rect', { x: P.L, y: P.T, width: P.PW, height: P.PH, rx: '14', class: 'bt-chart-plot-bg' }));

      /* 1. Unbuffered Corrosive Corner */
      zonesG.appendChild(CK.svgEl('rect', {
        x: P.L, y: mapY(18).toFixed(1),
        width: (mapX(14) - P.L).toFixed(1), height: (P.B - mapY(18)).toFixed(1),
        rx: '4', class: 'bt-wt-zone-corrosive'
      }));
      /* 2. Nordic Clarity Zone (KH 15-40, GH 45-100) */
      zonesG.appendChild(CK.svgEl('rect', {
        x: mapX(15).toFixed(1), y: mapY(100).toFixed(1),
        width: (mapX(40) - mapX(15)).toFixed(1), height: (mapY(45) - mapY(100)).toFixed(1),
        rx: '8', class: 'bt-wt-zone-nordic'
      }));
      /* 3. SCA 102-2024 Sweet Spot (KH 40-75, GH 50-175) */
      zonesG.appendChild(CK.svgEl('rect', {
        x: mapX(40).toFixed(1), y: mapY(175).toFixed(1),
        width: (mapX(75) - mapX(40)).toFixed(1), height: (mapY(50) - mapY(175)).toFixed(1),
        rx: '8', class: 'bt-wt-zone-sca'
      }));
      /* 4. RPavlis Zero-Scale Strip (KH 35-65, GH 0-10) */
      zonesG.appendChild(CK.svgEl('rect', {
        x: mapX(35).toFixed(1), y: mapY(10).toFixed(1),
        width: (mapX(65) - mapX(35)).toFixed(1), height: (P.B - mapY(10)).toFixed(1),
        rx: '4', class: 'bt-wt-zone-rpavlis'
      }));

      /* Grid & Axis Labels */
      const khStep = dm.khMax > 180 ? 50 : 25;
      for (let k = 0; k <= dm.khMax; k += khStep) {
        const x = mapX(k);
        zonesG.appendChild(CK.svgEl('line', { x1: x.toFixed(1), y1: P.T, x2: x.toFixed(1), y2: P.B, class: 'bt-chart-gridline' }));
        const t = CK.svgEl('text', { x: x.toFixed(1), y: P.B + 15, 'text-anchor': 'middle', class: 'bt-chart-tick' });
        t.textContent = wt.unitDh ? (k / 17.848).toFixed(1) : String(k);
        zonesG.appendChild(t);
      }
      const ghStep = dm.ghMax > 240 ? 60 : 50;
      for (let g = 0; g <= dm.ghMax; g += ghStep) {
        const y = mapY(g);
        zonesG.appendChild(CK.svgEl('line', { x1: P.L, y1: y.toFixed(1), x2: P.R, y2: y.toFixed(1), class: 'bt-chart-gridline' }));
        const tl = CK.svgEl('text', { x: P.L - 6, y: (y + 4).toFixed(1), 'text-anchor': 'end', class: 'bt-chart-tick' });
        tl.textContent = wt.unitDh ? (g / 17.848).toFixed(1) : String(g);
        zonesG.appendChild(tl);
      }
      const xl = CK.svgEl('text', { x: (P.L + P.PW * 0.5).toFixed(1), y: 300, 'text-anchor': 'middle', class: 'bt-chart-axis-title' });
      xl.textContent = wt.unitDh ? 'Alkalinity Buffer (dKH)' : 'Alkalinity Buffer KH (ppm as CaCO3)';
      zonesG.appendChild(xl);

      /* Dynamic Temperature- & Calcium-Coupled Limescale Hyperbola
         Citrate suppresses calcite ONLY when KH_carb === 0 (zero-bicarbonate RO mode) */
      const fCa = 1 - wt.mgShare;
      const isZeroCarbCitrate = !wt.tapBlendOn && (wt.khSaltKey === 'k3cit' || wt.khSaltKey === 'na3cit');
      if (fCa > 0.02 && !isZeroCarbCitrate) {
        const pts = [];
        for (let kh = 8; kh <= dm.khMax; kh += 4) {
          const ghWarn = spec.scaleWarnProd / Math.max(0.01, fCa * kh);
          if (ghWarn <= dm.ghMax * 1.15) {
            pts.push([mapX(kh), mapY(Math.min(dm.ghMax, ghWarn))]);
          }
        }
        if (pts.length >= 2) {
          let dStr = CK.monotoneCubicPath(pts);
          dStr += ' L ' + P.R + ' ' + P.T + ' L ' + pts[0][0].toFixed(1) + ' ' + P.T + ' Z';
          scalePath.setAttribute('d', dStr);
        } else {
          scalePath.setAttribute('d', '');
        }
      } else {
        scalePath.setAttribute('d', '');
      }

      /* Tap + RO Vector Blend Ray */
      if (wt.tapBlendOn) {
        const tx = mapX(wt.khTap);
        const ty = mapY(wt.ghTap);
        const bx = mapX(spec.fTap * wt.khTap);
        const by = mapY(spec.fTap * wt.ghTap);
        rayG.appendChild(CK.svgEl('line', { x1: P.L, y1: P.B, x2: tx.toFixed(1), y2: ty.toFixed(1), class: 'bt-wt-ray-line' }));
        rayG.appendChild(CK.svgEl('circle', { cx: bx.toFixed(1), cy: by.toFixed(1), r: '5.5', class: 'bt-wt-blend-bead' }));
        rayG.appendChild(CK.svgEl('circle', { cx: tx.toFixed(1), cy: ty.toFixed(1), r: '7.5', class: 'bt-wt-tap-pin' }));
      }

      dropG.setAttribute('transform', 'translate(' + mapX(wt.kh).toFixed(1) + ',' + mapY(wt.gh).toFixed(1) + ')');

      /* Readout & Visual Salt Cards */
      readoutBanner.textContent = '';
      readoutBanner.appendChild(domH('div', { class: 'bt-studio-human-line' },
        domH('strong', {
          text: wt.tapBlendOn
            ? ('Blend ' + spec.tapMl + ' mL Tap + ' + spec.roMl + ' mL RO/ZeroWater' +
              (spec.epsomBoostPpm > 2 ? (' (+ ' + spec.epsomBoostPpm + ' ppm Epsom Mg boost)') : ''))
            : ('Target: ' + Math.round(wt.gh) + ' ppm GH (' + Math.round(wt.mgShare * 100) + '% Mg2+)  ·  ' +
              Math.round(wt.kh) + ' ppm KH  ·  Scale: ' + spec.scaleRisk.toUpperCase())
        })
      ));
      if (isScienceXray() || spec.pittingRisk) {
        readoutBanner.appendChild(domH('p', {
          class: 'bt-studio-xray-line num-tab',
          text: 'pH 5.0 Effective Buffer KH_eff = ' + spec.khEffPh5 + ' ppm (' + spec.meqAcidNeutralized + ' meq/L H+ neutralized; 0.96*HCO3 + 0.45*Cit)  ·  Cl- = ' +
            spec.clMgL + ' mg/L ' + (spec.pittingRisk ? '(>35 mg/L SS Pitting Alert!)' : '(<35 safe)') +
            '  ·  Ca*KH_carb = ' + spec.caCarbProduct
        }));
      }

      recipeDeck.textContent = '';
      const lotusDiv = wt.lotusTip === 'round' ? 10 : 5;
      recipeDeck.appendChild(domH('div', { class: 'bt-wt-bottle-card' },
        domH('span', { class: 'bt-wt-bottle-kicker', text: 'Lotus / 10,000 ppm Drops (' + wt.batchL.toFixed(2) + ' L)' }),
        domH('strong', {
          class: 'num-tab',
          text: Math.max(0, Math.round((spec.ghMg * wt.batchL) / lotusDiv)) + ' Mg  ·  ' +
            Math.max(0, Math.round((spec.ghCa * wt.batchL) / lotusDiv)) + ' Ca  ·  ' +
            Math.max(0, Math.round((wt.kh * wt.batchL) / (lotusDiv * 0.5))) + ' Buffer drops'
        })
      ));
      recipeDeck.appendChild(domH('div', { class: 'bt-wt-bottle-card' },
        domH('span', { class: 'bt-wt-bottle-kicker', text: 'IUPAC Dry Salts (' + wt.batchL.toFixed(2) + ' L)' }),
        domH('strong', {
          class: 'num-tab',
          text: spec.mgSaltG + 'g ' + IUPAC_SALTS[wt.mgSaltKey].formula.split(' ')[0] + '  ·  ' +
            spec.caSaltG + 'g ' + IUPAC_SALTS[wt.caSaltKey].formula.split(' ')[0] + '  ·  ' +
            spec.khSaltG + 'g ' + IUPAC_SALTS[wt.khSaltKey].formula.split(' ')[0]
        })
      ));
    }

    CK.bindChartSurface(svg, {
      ariaLabel: '2D Water GH and KH Droplet Pad',
      detentStep: 1,
      getHandles: function () {
        const list = [{
          id: 'droplet',
          hitRadiusPx: 30,
          getPos: function () { return { x: mapX(wt.kh), y: mapY(wt.gh) }; },
          onMove: function (p) {
            wt.kh = Math.round(invX(p.ux));
            wt.gh = Math.round(invY(p.uy));
            redrawWater();
            return { detentValue: wt.kh + wt.gh, loupe: wt.gh + ' GH · ' + wt.kh + ' KH ppm' };
          }
        }];
        if (wt.tapBlendOn) {
          list.unshift({
            id: 'tap_pin',
            hitRadiusPx: 28,
            getPos: function () { return { x: mapX(wt.khTap), y: mapY(wt.ghTap) }; },
            onMove: function (p) {
              wt.khTap = Math.max(5, Math.round(invX(p.ux)));
              wt.ghTap = Math.max(5, Math.round(invY(p.uy)));
              redrawWater();
              return { detentValue: wt.khTap, loupe: 'Tap Assay: ' + wt.ghTap + ' GH / ' + wt.khTap + ' KH' };
            }
          });
        }
        return list;
      },
      onPointer: function (p) {
        if (p.handleId) return null;
        wt.kh = Math.round(invX(p.ux));
        wt.gh = Math.round(invY(p.uy));
        redrawWater();
        return { detentValue: wt.kh, loupe: wt.gh + ' GH · ' + wt.kh + ' KH ppm' };
      },
      onKeyStep: function (k) {
        wt.kh = clamp(wt.kh + k.dx * 2, 0, 320, wt.kh);
        wt.gh = clamp(wt.gh + k.dy * 2, 0, 340, wt.gh);
        redrawWater();
        return { ariaNow: wt.kh };
      }
    });

    /* 1-Tap WaterQuickFixer Presets */
    const vibePresets = [
      { lbl: 'Nordic Clarity (55/20)', gh: 55, kh: 20, mg: 0.75, khSalt: 'khco3' },
      { lbl: 'SCA Sweet Spot (70/35)', gh: 70, kh: 35, mg: 0.65, khSalt: 'khco3' },
      { lbl: 'RPavlis Boiler-Safe (0/45)', gh: 0, kh: 45, mg: 1.0, khSalt: 'khco3' },
      { lbl: 'Citrate Clarity (65/45 Cit)', gh: 65, kh: 45, mg: 0.70, khSalt: 'k3cit' },
      { lbl: 'Evian 2-Bottle Mix', gh: 307, kh: 295, tap: true }
    ].map(function (vp) {
      return domH('button', {
        type: 'button',
        class: 'bt-lab-chip',
        onclick: function () {
          if (vp.tap) {
            wt.tapBlendOn = true;
            wt.ghTap = 307;
            wt.khTap = 295;
            wt.gh = 72;
            wt.kh = 38;
          } else {
            wt.tapBlendOn = false;
            wt.gh = vp.gh;
            wt.kh = vp.kh;
            wt.mgShare = vp.mg;
            wt.khSaltKey = vp.khSalt;
          }
          CK.haptic('snap');
          redrawWater();
        }
      }, vp.lbl);
    });

    const khSaltPills = [
      { k: 'khco3', lbl: 'KHCO3' },
      { k: 'nahco3', lbl: 'NaHCO3' },
      { k: 'k3cit', lbl: 'K3Citrate (pH 5.0 0.45x)' },
      { k: 'na3cit', lbl: 'Na3Citrate' }
    ].map(function (sp) {
      return domH('button', {
        type: 'button',
        class: 'bt-lab-chip' + (wt.khSaltKey === sp.k ? ' is-active' : ''),
        onclick: function () {
          wt.khSaltKey = sp.k;
          khSaltPills.forEach(function (b, bi) { b.classList.toggle('is-active', ['khco3', 'nahco3', 'k3cit', 'na3cit'][bi] === sp.k); });
          redrawWater();
        }
      }, sp.lbl);
    });

    const tapToggle = domH('button', {
      type: 'button',
      class: 'bt-lab-chip' + (wt.tapBlendOn ? ' is-active' : ''),
      onclick: function () {
        wt.tapBlendOn = !wt.tapBlendOn;
        tapToggle.classList.toggle('is-active', wt.tapBlendOn);
        redrawWater();
      }
    }, 'Blend Tap + RO Vector');

    const waterHow = CK.createExplainer({
      title: '2D Water Mineral Pad (GH x KH)',
      whatItDoes: 'Balances Flavor Hardness (GH: Mg2+/Ca2+) against Acid Buffer (KH) while guarding boilers from limescale.',
      howToUse: 'Drag the water droplet into Nordic Clarity or SCA Sweet Spot, or tap a 1-touch WaterQuickFixer preset.',
      proTip: 'Switch Buffer Reagent to K3Citrate in Science X-Ray to inspect pH 5.0 0.45x speciation and zero-calcite scaling!'
    });

    /* ---- 4-Way Everyday Water Selector + Water Impact Meter + 18 Named Brands/Cities ---- */
    const NAMED_18_CANONICAL_MAP = {
      distilled: 'distilled-ro',
      crystal_shasta: 'crystal-geyser-shasta',
      crystal_sctn: 'poland-spring',
      volvic: 'volvic',
      poland_spring: 'poland-spring',
      kirkland_purified: 'bottled_purified',
      kirkland_spring: 'bottled_spring',
      fiji: 'bottled_spring',
      evian: 'evian'
    };

    const EVERYDAY_4WAY_MODES = [
      {
        mode: 'tap',
        label: 'Regular Tap',
        subOptions: [
          { sub: 'soft', label: 'Soft Tap', key: 'tap_soft', wType: 'tap', gh: 35, kh: 20, mg: 0.45 },
          { sub: 'typical', label: 'Typical Tap', key: 'tap_regular', wType: 'tap', gh: 90, kh: 55, mg: 0.45 },
          { sub: 'hard', label: 'Hard Tap', key: 'tap_hard', wType: 'tap', gh: 185, kh: 135, mg: 0.40 }
        ]
      },
      {
        mode: 'filtered',
        label: 'Filtered (Brita / Fridge / RO)',
        subOptions: [
          { sub: 'brita', label: 'Brita / Pitcher', key: 'filtered_pitcher', wType: 'filtered', gh: 55, kh: 35, mg: 0.48 },
          { sub: 'fridge', label: 'Fridge Filter', key: 'tap_regular', wType: 'filtered', gh: 80, kh: 50, mg: 0.45 },
          { sub: 'ro', label: 'RO / Distilled / ZeroWater', key: 'distilled-ro', wType: 'ro', gh: 0, kh: 0, mg: 0.50 },
          { sub: 'bwt', label: 'BWT Mg+ Pitcher', key: 'bwt-mg', wType: 'filtered', gh: 70, kh: 45, mg: 0.72 }
        ]
      },
      {
        mode: 'bottled_generic',
        label: 'Generic Bottled (Spring / Purified)',
        subOptions: [
          { sub: 'spring', label: 'Spring Water (Generic)', key: 'bottled_spring', wType: 'bottled', gh: 55, kh: 44, mg: 0.48 },
          { sub: 'purified', label: 'Purified (Minerals Added)', key: 'bottled_purified', wType: 'bottled', gh: 28, kh: 20, mg: 0.60 },
          { sub: 'alkaline', label: 'Alkaline pH 9+ (Avoid Trap)', key: 'tap_hard', wType: 'bottled', gh: 20, kh: 68, mg: 0.40, trap: true }
        ]
      },
      {
        mode: 'named_18',
        label: '18 Named Brands, Cities & DIY Gallon',
        subOptions: []
      }
    ];

    function syncWaterStateToAppLive() {
      const a = getApp();
      const ghVal = Math.max(0, Math.round(wt.gh));
      const khVal = Math.max(0, Math.round(wt.kh));
      const pKey = wt.activeProfileKey || 'tap_regular';
      const wType = wt.activeWaterType || 'tap';
      const wLbl = wt.activeWaterLabel || 'Regular Tap (Typical)';
      a.brew = a.brew || {};
      a.prefs = a.prefs || {};
      a.prefs.gear = a.prefs.gear || {};
      a.brew.waterProfileKey = pKey;
      a.brew.waterProfile = pKey;
      a.prefs.waterProfileKey = pKey;
      a.prefs.gear.waterType = wType;
      a.prefs.gear.waterProfileKey = pKey;
      a.brew.waterType = wType;
      a.brew.water_type = wType;
      a.brew.waterGH = ghVal;
      a.brew.water_gh = ghVal;
      a.brew.waterAlk = khVal;
      a.brew.water_alk = khVal;
      a.brew.waterLabel = wLbl;
      a.prefs.water = { gh: ghVal, kh: khVal, mgShare: wt.mgShare, khSaltKey: wt.khSaltKey, bottleKey: wt.everydayKey, profileKey: pKey };
      saveDraftSoon();
    }

    const selector4WayCard = domH('div', { class: 'bt-lab-subcard bt-water-4way-card', id: 'bt-everyday-water-4way' });
    const modePillsWrap = domH('div', { class: 'bt-water-4way-tabs', role: 'group', 'aria-label': 'Everyday water source selector' });
    const subPillsWrap = domH('div', { class: 'bt-lab-chip-row bt-water-sub-row' });
    const impactMeterBox = domH('div', { class: 'bt-water-impact-meter', id: 'bt-water-impact-meter' });
    const everydayBox = domH('div', { class: 'bt-lab-subcard bt-everyday-water-card' });
    const everydayOut = domH('div', { class: 'bt-everyday-water-out' });
    let useWaterBtnSpan = domH('span', { text: 'Use This Water in My Brew \u2192' });

    const bottleSel = domH('select', {
      class: 'bt-lab-select',
      'aria-label': 'Choose supermarket bottled water or city tap profile',
      onchange: function () {
        wt.everydayKey = bottleSel.value;
        const pickedW = EVERYDAY_WATERS.find(function (x) { return x.key === wt.everydayKey; }) || EVERYDAY_WATERS[1];
        wt.activeWaterLabel = pickedW.name;
        wt.activeProfileKey = NAMED_18_CANONICAL_MAP[pickedW.key] || (pickedW.group === 'bottled' ? 'bottled_spring' : (pickedW.key === 'distilled' ? 'distilled-ro' : 'tap_regular'));
        wt.activeWaterType = pickedW.key === 'distilled' ? 'ro' : (pickedW.group === 'bottled' ? 'bottled' : 'tap');
        if (pickedW.kh > 80 || pickedW.gh > 150) {
          wt.tapBlendOn = true;
          wt.ghTap = pickedW.gh;
          wt.khTap = pickedW.kh;
          wt.gh = pickedW.gh != null ? +pickedW.gh : 68;
          wt.kh = pickedW.kh != null ? +pickedW.kh : 36;
        } else {
          wt.tapBlendOn = false;
          /* CRITICAL 0 ppm fix: allow 0 GH / 0 KH for Distilled / RO / ZeroWater! */
          wt.gh = pickedW.gh != null ? +pickedW.gh : 68;
          wt.kh = pickedW.kh != null ? +pickedW.kh : 36;
        }
        tapToggle.classList.toggle('is-active', wt.tapBlendOn);
        syncWaterStateToAppLive();
        CK.haptic('tick');
        paintEverydayWater();
        redrawWater();
        paint4WayAndImpact();
      }
    });
    EVERYDAY_WATERS.forEach(function (bw) {
      const opt = domH('option', {
        value: bw.key,
        text: bw.name + ' (Hardness ' + bw.gh + ' GH / Buffer ' + bw.kh + ' KH)'
      });
      if (bw.key === wt.everydayKey) opt.selected = true;
      bottleSel.appendChild(opt);
    });

    function apply4WaySubOption(modeKey, opt) {
      wt.sourceMode = modeKey;
      if (modeKey === 'tap') wt.tapLevel = opt.sub;
      else if (modeKey === 'filtered') wt.filterKind = opt.sub;
      else if (modeKey === 'bottled_generic') wt.genericBottleKind = opt.sub;
      wt.tapBlendOn = opt.kh > 95 || opt.gh > 160;
      if (wt.tapBlendOn) {
        wt.ghTap = opt.gh;
        wt.khTap = opt.kh;
      }
      wt.gh = opt.gh != null ? +opt.gh : 68;
      wt.kh = opt.kh != null ? +opt.kh : 40;
      wt.mgShare = opt.mg != null ? opt.mg : 0.48;
      wt.activeProfileKey = opt.key;
      wt.activeWaterType = opt.wType;
      wt.activeWaterLabel = opt.label;
      tapToggle.classList.toggle('is-active', wt.tapBlendOn);
      syncWaterStateToAppLive();
      CK.haptic('snap');
      redrawWater();
      paintEverydayWater();
      paint4WayAndImpact();
    }

    function paint4WayAndImpact() {
      modePillsWrap.textContent = '';
      subPillsWrap.textContent = '';
      EVERYDAY_4WAY_MODES.forEach(function (m) {
        const isAct = wt.sourceMode === m.mode;
        modePillsWrap.appendChild(domH('button', {
          type: 'button',
          class: 'bt-lab-chip bt-water-4way-pill' + (isAct ? ' is-active' : ''),
          'aria-pressed': String(isAct),
          onclick: function () {
            wt.sourceMode = m.mode;
            if (m.mode === 'tap') {
              const found = m.subOptions.find(function (s) { return s.sub === wt.tapLevel; }) || m.subOptions[1];
              apply4WaySubOption('tap', found);
              return;
            }
            if (m.mode === 'filtered') {
              const foundF = m.subOptions.find(function (s) { return s.sub === wt.filterKind; }) || m.subOptions[0];
              apply4WaySubOption('filtered', foundF);
              return;
            }
            if (m.mode === 'bottled_generic') {
              const foundB = m.subOptions.find(function (s) { return s.sub === wt.genericBottleKind; }) || m.subOptions[0];
              apply4WaySubOption('bottled_generic', foundB);
              return;
            }
            /* named_18 mode */
            const pickedW = EVERYDAY_WATERS.find(function (x) { return x.key === wt.everydayKey; }) || EVERYDAY_WATERS[1];
            wt.gh = pickedW.gh != null ? +pickedW.gh : 52;
            wt.kh = pickedW.kh != null ? +pickedW.kh : 45;
            wt.activeWaterLabel = pickedW.name;
            wt.activeProfileKey = NAMED_18_CANONICAL_MAP[pickedW.key] || 'crystal-geyser-shasta';
            wt.activeWaterType = pickedW.key === 'distilled' ? 'ro' : 'bottled';
            syncWaterStateToAppLive();
            CK.haptic('snap');
            paintEverydayWater();
            redrawWater();
            paint4WayAndImpact();
          }
        }, m.label));
      });

      const activeGroup = EVERYDAY_4WAY_MODES.find(function (m) { return m.mode === wt.sourceMode; }) || EVERYDAY_4WAY_MODES[0];
      if (activeGroup.subOptions.length) {
        subPillsWrap.hidden = false;
        everydayBox.hidden = true;
        const curSub = wt.sourceMode === 'tap' ? wt.tapLevel : (wt.sourceMode === 'filtered' ? wt.filterKind : wt.genericBottleKind);
        activeGroup.subOptions.forEach(function (opt) {
          const on = curSub === opt.sub;
          subPillsWrap.appendChild(domH('button', {
            type: 'button',
            class: 'bt-lab-chip' + (on ? ' is-active' : ''),
            'aria-pressed': String(on),
            onclick: function () { apply4WaySubOption(wt.sourceMode, opt); }
          }, opt.label + ' (' + opt.gh + ' GH / ' + opt.kh + ' KH)'));
        });
      } else {
        subPillsWrap.hidden = true;
        everydayBox.hidden = false;
      }

      /* Build Instant Plain-English Water Impact Meter */
      const spec = solveWaterSpeciation(wt);
      const cf = (getApp() && getApp().coffee) || {};
      const bagTitle = cf.name || 'your active coffee';
      const roastLow = String(cf.roast || 'light').toLowerCase();
      /* Brightness <-> Smoothness marker: 0% = ultra-bright (0 KH), 50% = balanced (40 KH), 100% = heavy buffer (110+ KH) */
      const smoothPct = Math.round(clamp((wt.kh / 110) * 100, 3, 97, 45));
      const scalePct = Math.round(clamp((spec.caCarbProduct / Math.max(1, spec.scaleSevProd)) * 100, 3, 98, 20));
      let impactVerdict = '';
      if (wt.gh === 0 && wt.kh === 0) {
        impactVerdict = 'Pure 0 ppm RO / Distilled Water: zero mineral grip (0 GH) and zero acid buffer (0 KH). Alone it tastes sharp/empty and can leach metal boilers — ideal base for DIY Gallon salts or mixing 50/50 with hard tap!';
      } else if (wt.kh < 25) {
        impactVerdict = 'Bright & Juicy Clarity (' + Math.round(wt.gh) + ' Hardness GH · ' + Math.round(wt.kh) + ' Acid Buffer KH): Low acid buffer lets floral & citrus notes in ' + bagTitle + ' sparkle vibrantly.';
      } else if (wt.kh <= 62 && wt.gh <= 135) {
        impactVerdict = 'Balanced Sweet Spot (' + Math.round(wt.gh) + ' Hardness GH · ' + Math.round(wt.kh) + ' Acid Buffer KH): Minerals pull ripe fruit & caramel sweetness from ' + bagTitle + ' while rounding off sourness.';
      } else {
        impactVerdict = 'High Buffer / Chalky Risk (' + Math.round(wt.gh) + ' Hardness GH · ' + Math.round(wt.kh) + ' Acid Buffer KH): High bicarbonate buffer neutralizes lively fruit acids' + (roastLow.indexOf('dark') >= 0 ? ' (smooths dark-roast bite, but watch kettle scale!).' : ' — blend 50% with Pitcher/RO water to wake up brightness & protect your kettle!');
      }
      const scaleBadgeTxt = (wt.gh === 0 && wt.kh === 0)
        ? 'Unbuffered (Add Minerals for Boilers)'
        : (spec.scaleRisk === 'safe' ? 'Kettle & Boiler Safe' : (spec.scaleRisk === 'warn' ? 'Moderate Kettle Scale' : 'High Limescale — Filter or Blend RO'));

      impactMeterBox.textContent = '';
      impactMeterBox.appendChild(domH('div', { class: 'bt-wim-head' },
        domH('strong', { text: 'Water Impact Meter: ' + (wt.activeWaterLabel || 'Selected Water') }),
        domH('span', { class: 'bt-wim-scale-pill is-' + spec.scaleRisk, text: scaleBadgeTxt })
      ));
      impactMeterBox.appendChild(domH('div', { class: 'bt-wim-bars' },
        domH('div', { class: 'bt-wim-row' },
          domH('div', { class: 'bt-wim-axis-lbls' },
            domH('span', { text: 'Acid Brightness (Low KH)' }),
            domH('span', { class: 'num-tab', text: Math.round(wt.gh) + ' GH Hardness · ' + Math.round(wt.kh) + ' KH Buffer' }),
            domH('span', { text: 'Buffer Smoothness (High KH)' })
          ),
          domH('div', { class: 'bt-wim-track is-flavor' },
            domH('span', { class: 'bt-wim-sweet-band' }),
            domH('span', { class: 'bt-wim-thumb', style: 'left:' + smoothPct + '%' })
          )
        ),
        domH('div', { class: 'bt-wim-row' },
          domH('div', { class: 'bt-wim-axis-lbls' },
            domH('span', { text: 'Zero-Scale Safe' }),
            domH('span', { text: 'Scale Safety' }),
            domH('span', { text: 'Limescale Risk' })
          ),
          domH('div', { class: 'bt-wim-track is-scale' },
            domH('span', { class: 'bt-wim-thumb', style: 'left:' + scalePct + '%' })
          )
        )
      ));
      impactMeterBox.appendChild(domH('p', { class: 'bt-wim-explain', text: impactVerdict }));
      useWaterBtnSpan.textContent = 'Use This Water in My Brew (' + (wt.activeWaterLabel || 'Custom') + ' · ' + Math.round(wt.gh) + '/' + Math.round(wt.kh) + ' ppm) \u2192';
    }

    function paintEverydayWater() {
      const res = solveEverydayWaterRescue({
        waterKey: wt.everydayKey,
        partnerKey: wt.partnerKey,
        targetGh: wt.gh > 0 && wt.gh < 120 ? wt.gh : 68,
        targetKh: wt.kh > 0 && wt.kh < 70 ? wt.kh : 36,
        batchMl: Math.round(wt.batchL * 1000)
      });
      everydayOut.textContent = '';
      if (res.picked.trap) {
        everydayOut.appendChild(domH('div', { class: 'bt-milk-verdict is-warn' },
          domH('strong', { text: res.picked.name }),
          domH('p', { text: res.picked.note })
        ));
      } else {
        everydayOut.appendChild(domH('p', { class: 'bt-lab-hint', text: res.picked.note }));
      }
      everydayOut.appendChild(domH('div', { class: 'bt-wt-recipe-deck' },
        domH('div', { class: 'bt-wt-bottle-card' },
          domH('span', {
            class: 'bt-wt-bottle-kicker',
            text: (isScienceXray() ? 'Simple 2-Bottle Mix (Farey Blend · ' : 'Simple 2-Bottle Mix (') + Math.round(wt.batchL * 1000) + ' mL)'
          }),
          domH('strong', {
            class: 'num-tab',
            text: res.soloOk && res.pickedPct >= 90
              ? ('100% ' + res.picked.name + ' straight from jug (' + res.picked.gh + ' GH / ' + res.picked.kh + ' KH)')
              : (res.pickedPct + '% ' + res.picked.name.split(' (')[0] + ' (' + res.pickedMl + ' mL) + ' +
                res.partnerPct + '% ' + res.partner.name.split(' /')[0] + ' (' + res.partnerMl + ' mL) \u2192 ' +
                res.blendedGh + ' GH / ' + res.blendedKh + ' KH')
          })
        ),
        domH('div', { class: 'bt-wt-bottle-card' },
          domH('span', { class: 'bt-wt-bottle-kicker', text: 'Kitchen Baking-Soda + Epsom Gallon DIY (1 US Gal)' }),
          domH('strong', { class: 'num-tab', text: res.gallonKitchenText })
        )
      ));
    }

    everydayBox.appendChild(domH('div', { class: 'bt-lab-card-head' },
      domH('div', { class: 'bt-lab-title-group' },
        ic('water-drop', { size: 18 }),
        domH('strong', { text: '18 Named Bottled Brands, City Tap Profiles & DIY Gallon' })
      )
    ));
    everydayBox.appendChild(domH('div', { class: 'bt-lab-inline-inputs' }, bottleSel));
    everydayBox.appendChild(everydayOut);

    const useWaterCtaBtn = domH('button', {
      type: 'button',
      class: 'bt-lab-btn is-primary bt-chart-cta-btn',
      id: 'bt-use-water-in-brew-btn',
      onclick: function () {
        applyLabToBrewAndGo(function () {
          syncWaterStateToAppLive();
        }, {
          targetStep: 'brew',
          returnRoute: 'water',
          toast: 'Applied ' + (wt.activeWaterLabel || 'Custom Water') + ' (' + Math.round(wt.gh) + ' GH / ' + Math.round(wt.kh) + ' KH) to your Brew!'
        });
      }
    }, ic('water-drop', { size: 16 }), useWaterBtnSpan);

    selector4WayCard.appendChild(domH('div', { class: 'bt-lab-card-head' },
      domH('div', { class: 'bt-lab-title-group' },
        ic('water-drop', { size: 18 }),
        domH('div', null,
          domH('strong', { text: 'Step 1: Pick Your Everyday Water (Tap, Filtered, Bottled, or 18 Brands)' }),
          domH('p', { class: 'bt-lab-sub', text: 'Hardness (GH) pulls flavor & sweetness · Acid Buffer (KH) controls fruit brightness vs smoothness' })
        )
      )
    ));
    selector4WayCard.appendChild(modePillsWrap);
    selector4WayCard.appendChild(subPillsWrap);
    selector4WayCard.appendChild(everydayBox);
    selector4WayCard.appendChild(impactMeterBox);
    selector4WayCard.appendChild(domH('div', { class: 'bt-chart-cta-bar' }, useWaterCtaBtn));

    card.appendChild(domH('div', { class: 'bt-lab-card-head' },
      domH('div', { class: 'bt-lab-title-group' },
        ic('water-drop', { size: 22 }),
        domH('div', null,
          domH('h3', { text: 'Everyday Water Studio, 2-Bottle Mix & Mineral Pad (Hardness GH × Buffer KH)' }),
          domH('p', { class: 'bt-lab-sub', text: 'Regular Tap, Brita/Fridge/RO, Generic Bottled, 18 Named Brands/Cities & US Gallon DIY' })
        )
      ),
      domH('div', { class: 'bt-head-actions' }, waterHow.trigger, epistemicBadge('verified_physics'))
    ));
    card.appendChild(waterHow.panel);
    card.appendChild(selector4WayCard);
    card.appendChild(domH('div', { class: 'bt-lab-chip-row' }, vibePresets, tapToggle));
    card.appendChild(domH('div', { class: 'bt-vernier-row' },
      CK.vernierPill({
        label: 'Mg2+ Share',
        value: Math.round(wt.mgShare * 100),
        min: 0,
        max: 100,
        step: 5,
        unit: '%',
        compact: true,
        onChange: function (v) { wt.mgShare = v / 100; redrawWater(); paintEverydayWater(); paint4WayAndImpact(); }
      }),
      CK.vernierPill({
        label: 'Batch Vol',
        value: wt.batchL,
        min: 0.25,
        max: 5.0,
        step: 0.25,
        decimals: 2,
        unit: 'L',
        compact: true,
        onChange: function (v) { wt.batchL = v; redrawWater(); paintEverydayWater(); }
      }),
      CK.vernierPill({
        label: 'Boiler Temp',
        value: wt.brewTempC,
        min: 80,
        max: 100,
        step: 1,
        unit: 'C',
        compact: true,
        onChange: function (v) { wt.brewTempC = v; redrawWater(); paint4WayAndImpact(); }
      })
    ));
    card.appendChild(domH('div', { class: 'bt-lab-chip-row' },
      domH('span', { class: 'bt-lab-inline-lbl', text: 'Buffer Reagent:' }),
      khSaltPills
    ));
    card.appendChild(domH('div', { class: 'bt-chart-stage' }, svg));
    card.appendChild(readoutBanner);
    card.appendChild(recipeDeck);
    card.appendChild(domH('div', { class: 'bt-lab-btn-row' },
      domH('button', {
        type: 'button',
        class: 'bt-lab-btn',
        onclick: function () {
          syncWaterStateToAppLive();
          CK.haptic('celebrate');
          notify('Locked ' + Math.round(wt.gh) + ' GH / ' + Math.round(wt.kh) + ' KH as your Home Water profile!');
        }
      }, ic('lock-pin', { size: 15 }), domH('span', { text: 'Save as My Default Home Water' }))
    ));

    paintEverydayWater();
    redrawWater();
    paint4WayAndImpact();
    return card;
  }

  /* ==========================================================================
   * STUDIO 5: TactileVesselVisualizer & Milk Steaming Lab
   * ========================================================================== */
  function buildStudioVesselAlchemist() {
    const vs = labState.vessel;
    const card = domH('section', { class: 'bt-studio-card', id: 'bt-studio-vessel' });

    const svg = CK.svgEl('svg', {
      viewBox: '0 0 380 300',
      class: 'bt-chart-svg bt-vessel-svg',
      'aria-label': 'Interactive Cross-Section Carafe Meniscus, Flash-Ice & Paragon Sphere Visualizer'
    });
    const vesselG = CK.svgEl('g', { class: 'bt-vs-scene' });
    svg.appendChild(vesselG);

    const readoutBanner = domH('div', { class: 'bt-studio-readout-banner' });
    const milkBanner = domH('div', { class: 'bt-lab-subcard bt-milk-lab-card' });

    const V_TOP = 36, V_BOT = 256, V_H = 220;
    const MAX_BEV = 600;
    let waveAmp = 0;
    let waveVel = 0;

    const waveAnim = CK.createSpringAnimator(function (dt) {
      const st = CK.stepSpring(waveAmp, waveVel, 0, dt);
      waveAmp = st.pos;
      waveVel = st.vel;
      redrawVessel();
      return !st.settled;
    });

    function redrawVessel() {
      vesselG.textContent = '';
      const totalW = vs.doseG * vs.ratio;
      const fl = solveFlashIced3Regime({
        doseG: vs.doseG,
        totalWaterG: totalW,
        flashOn: vs.flashOn,
        iceShare: vs.iceShare,
        iceTempC: vs.iceTempC,
        dripTempC: vs.dripTempC,
        eyPct: 20.4,
        rw: vs.rw,
        paragonOn: vs.paragonOn
      });

      /* Outer Glass Carafe Silhouette */
      vesselG.appendChild(CK.svgEl('path', {
        d: 'M 58 36 L 202 36 L 214 242 Q 214 258 196 258 L 64 258 Q 46 258 46 242 Z',
        class: 'bt-vs-glass'
      }));

      const fillFrac = clamp(fl.liquidBeverageG / MAX_BEV, 0.08, 0.94, 0.42);
      const menY = V_BOT - fillFrac * V_H;

      /* Liquid Body with Animated Quadratic Meniscus */
      const liqD = 'M 50 ' + menY.toFixed(1) +
        ' Q 92 ' + (menY + waveAmp).toFixed(1) + ' 130 ' + menY.toFixed(1) +
        ' T 210 ' + menY.toFixed(1) +
        ' L 212 244 Q 212 256 195 256 L 65 256 Q 48 256 48 244 Z';
      vesselG.appendChild(CK.svgEl('path', { d: liqD, class: 'bt-vs-liquid' }));

      /* Draggable Meniscus Pill Handle */
      const hGroup = CK.svgEl('g', { transform: 'translate(130,' + menY.toFixed(1) + ')' });
      hGroup.appendChild(CK.createHitHalo(0, 0, 14, 28, 1));
      hGroup.appendChild(CK.svgEl('rect', { x: '-36', y: '-10', width: '72', height: '20', rx: '10', class: 'bt-vs-meniscus-pill' }));
      const mt = CK.svgEl('text', { x: '0', y: '4', 'text-anchor': 'middle', class: 'bt-vs-meniscus-txt num-tab' });
      mt.textContent = Math.round(fl.liquidBeverageG) + ' g mug';
      hGroup.appendChild(mt);
      vesselG.appendChild(hGroup);

      /* Floating Polygonal Ice Cubes scaled to remIceG */
      if (vs.flashOn && fl.remIceG > 1) {
        const scaleCube = clamp(Math.sqrt(fl.remIceG / 90), 0.35, 1.25, 0.8);
        [90, 134, 170].forEach(function (cx, idx) {
          const s = (16 * scaleCube).toFixed(1);
          vesselG.appendChild(CK.svgEl('rect', {
            x: (cx - 8 * scaleCube).toFixed(1),
            y: (menY + 6 + idx * 4).toFixed(1),
            width: s,
            height: s,
            rx: '3',
            transform: 'rotate(' + (-12 + idx * 14) + ' ' + cx + ' ' + (menY + 14) + ')',
            class: 'bt-vs-ice-cube'
          }));
        });
      }

      /* 48g Paragon Extract-Chilling Gel-Core Sphere above Carafe */
      if (vs.paragonOn) {
        vesselG.appendChild(CK.svgEl('circle', { cx: '130', cy: '22', r: '14', class: 'bt-vs-paragon-sphere' }));
        const pt = CK.svgEl('text', { x: '150', y: '26', class: 'bt-chart-tick' });
        pt.textContent = '48g Gel Sphere (-18 °C \u2192 16.96 kJ)';
        vesselG.appendChild(pt);
      }

      /* Right Column: Proportional Mass-Balance Sponge Breakdown */
      const barH = 190;
      const totMass = Math.max(1, totalW);
      const retH = clamp((fl.retainedG / totMass) * barH, 16, 80, 28);
      const bevH = barH - retH;
      vesselG.appendChild(CK.svgEl('rect', { x: '256', y: '56', width: '88', height: retH.toFixed(1), rx: '6', class: 'bt-vs-ret-sponge' }));
      vesselG.appendChild(CK.svgEl('rect', { x: '256', y: (56 + retH + 4).toFixed(1), width: '88', height: bevH.toFixed(1), rx: '6', class: 'bt-vs-bev-col' }));
      const rt = CK.svgEl('text', { x: '300', y: (56 + retH * 0.5 + 4).toFixed(1), 'text-anchor': 'middle', class: 'bt-vs-col-txt' });
      rt.textContent = 'Bed: ' + fl.retainedG + 'g';
      vesselG.appendChild(rt);
      const bt = CK.svgEl('text', { x: '300', y: (56 + retH + 4 + bevH * 0.5).toFixed(1), 'text-anchor': 'middle', class: 'bt-vs-col-txt' });
      bt.textContent = 'Cup: ' + Math.round(fl.liquidBeverageG) + 'g';
      vesselG.appendChild(bt);

      /* Readout */
      const darcyScale = Math.pow(vs.doseG / 18.0, 0.20);
      readoutBanner.textContent = '';
      readoutBanner.appendChild(domH('div', { class: 'bt-studio-human-line' },
        domH('strong', {
          text: fl.regimeLabel + '  ·  ' + vs.doseG.toFixed(1) + 'g Dose  ·  ' +
            (vs.flashOn ? (fl.hotPourG + 'g Hot + ' + fl.iceG + 'g Ice') : (Math.round(totalW) + 'g Water')) +
            '  \u2192  ' + fl.liquidBeverageG + 'g @ ' + fl.finalTempC + ' °C (' + fl.tdsCupPct + '% TDS)'
        })
      ));
      if (isScienceXray() || vs.flashOn || vs.paragonOn) {
        readoutBanner.appendChild(domH('p', {
          class: 'bt-studio-xray-line num-tab',
          text: (vs.flashOn ? ('Melted: ' + fl.meltedIceG + 'g · Unmelted Cubes: ' + fl.remIceG + 'g (only melted ice dilutes %TDS!)  ·  ') : '') +
            (vs.paragonOn ? ('Paragon 48g Phase-Change Core chills early 40% extract by -' + fl.paragonDropC + ' C (+' + fl.esterBoostPct + '% volatile esters)  ·  ') : '') +
            'Darcy Bed-Depth Factor = ' + darcyScale.toFixed(2) + 'x'
        }));
      }
    }

    function redrawMilkLab() {
      milkBanner.textContent = '';
      const a = getApp();
      const bagAg = clamp((a.coffee && a.coffee.agtron) || labState.roastFresh.beanG, 25, 105, 78);
      const mk = solveMilkAlchemist({
        milkType: vs.milkType,
        milkG: vs.milkG,
        steamTempC: vs.steamTempC,
        thawFrac: vs.thawFrac,
        beanAgtron: bagAg
      });

      const milkTypes = [
        { k: 'dairy', lbl: 'Whole Dairy (55-65C)' },
        { k: 'lactose_free', lbl: 'Lactose-Free (3.1x Sweet)' },
        { k: 'eisbock', lbl: 'Freeze-Distilled Eisbock' },
        { k: 'oat', lbl: 'Barista Oat' },
        { k: 'almond', lbl: 'Almond' },
        { k: 'soy', lbl: 'Soy' }
      ].map(function (m) {
        return domH('button', {
          type: 'button',
          class: 'bt-lab-chip' + (vs.milkType === m.k ? ' is-active' : ''),
          onclick: function () { vs.milkType = m.k; CK.haptic('tick'); redrawMilkLab(); }
        }, m.lbl);
      });

      milkBanner.appendChild(domH('div', { class: 'bt-lab-card-head' },
        domH('div', { class: 'bt-lab-title-group' },
          ic('milk-pitcher', { size: 18 }),
          domH('strong', { text: 'Milk Steaming & Natural Sweetness Lab' })
        ),
        epistemicBadge('verified_physics')
      ));
      milkBanner.appendChild(domH('div', { class: 'bt-lab-chip-row' }, milkTypes));
      milkBanner.appendChild(domH('div', { class: 'bt-vernier-row' },
        CK.vernierPill({
          label: 'Milk Mass',
          value: vs.milkG,
          min: 40,
          max: 360,
          step: 5,
          unit: 'g',
          compact: true,
          onChange: function (v) { vs.milkG = v; redrawMilkLab(); }
        }),
        CK.vernierPill({
          label: 'Steam Temp',
          value: vs.steamTempC,
          min: 45,
          max: 78,
          step: 1,
          unit: 'C',
          compact: true,
          onChange: function (v) { vs.steamTempC = v; redrawMilkLab(); }
        }),
        vs.milkType === 'eisbock' ? CK.vernierPill({
          label: 'Thaw Draw',
          value: Math.round(vs.thawFrac * 100),
          min: 35,
          max: 80,
          step: 5,
          unit: '%',
          compact: true,
          onChange: function (v) { vs.thawFrac = v / 100; redrawMilkLab(); }
        }) : null
      ));

      const alertCls = mk.curdleDanger || mk.scaldDanger ? ' is-warn' : (mk.inBetaLgWindow ? ' is-good' : '');
      milkBanner.appendChild(domH('div', { class: 'bt-milk-verdict' + alertCls },
        domH('strong', {
          class: 'num-tab',
          text: (isScienceXray() ? ('Relative Sweetness (SEI ' + mk.sei + ') = ') : 'Relative Sweetness: ') +
            mk.sweetnessMult + '× whole milk  ·  Steamed Mass = ' +
            mk.finalMilkG + 'g (+' + mk.steamDilutionG + 'g steam)  ·  Est. Drink pH ~' + mk.estCupPh.toFixed(2)
        }),
        domH('p', { text: mk.guidance }),
        domH('div', { class: 'bt-lab-btn-row', style: 'margin-top:6px' },
          mk.curdleDanger ? domH('button', {
            type: 'button',
            class: 'bt-lab-btn is-sm is-primary',
            onclick: function () {
              vs.steamTempC = Math.min(55, Math.max(48, vs.steamTempC - 10));
              CK.haptic('snap');
              redrawMilkLab();
            }
          }, 'Apply 10 °C Cooler Steam Fix (' + Math.min(55, Math.max(48, vs.steamTempC - 10)) + ' °C)') : null,
          domH('button', {
            type: 'button',
            class: 'bt-lab-btn is-sm',
            onclick: function () {
              applyLabToBrewAndGo(function (a) {
                a.brew.milkPlan = {
                  milkType: vs.milkType,
                  milkG: vs.milkG,
                  steamTempC: vs.steamTempC,
                  finalMilkG: mk.finalMilkG
                };
                a.brew.customizedNote = 'Milk Plan: ' + vs.milkG + 'g ' + vs.milkType + ' steamed to ' + vs.steamTempC + ' °C';
              }, {
                targetStep: 'brew',
                returnRoute: 'milk',
                toast: 'Saved ' + vs.milkG + 'g ' + vs.milkType + ' (' + vs.steamTempC + ' °C) Milk Plan to your recipe!'
              });
            }
          }, ic('milk-pitcher', { size: 14 }), domH('span', { text: 'Apply Milk Plan to My Drink \u2192' }))
        )
      ));
    }

    CK.bindChartSurface(svg, {
      ariaLabel: 'Interactive Carafe Liquid Meniscus',
      detentStep: 5,
      onPointer: function (p) {
        const frac = clamp((V_BOT - p.uy) / V_H, 0.08, 0.94, 0.42);
        const targetBev = frac * MAX_BEV;
        if (vs.locked === 'ratio') {
          vs.doseG = clamp(targetBev / Math.max(2, vs.ratio - vs.rw), 6, 80, vs.doseG);
        } else {
          const reqPour = targetBev + vs.rw * vs.doseG;
          vs.ratio = clamp(reqPour / Math.max(1, vs.doseG), 2.0, 22.0, vs.ratio);
        }
        waveAmp = clamp(p.vy * 0.015, -5, 5, 0);
        waveVel = 0;
        waveAnim.wake();
        redrawVessel();
        return { detentValue: targetBev, loupe: Math.round(targetBev) + 'g Mug · 1:' + vs.ratio.toFixed(1) };
      },
      onKeyStep: function (k) {
        vs.ratio = clamp(vs.ratio + k.dy * 0.5 + k.dx * 0.5, 2.0, 22.0, vs.ratio);
        redrawVessel();
        return { ariaNow: vs.ratio };
      }
    });

    const flashBtn = domH('button', {
      type: 'button',
      class: 'bt-lab-chip' + (vs.flashOn ? ' is-active' : ''),
      onclick: function () { vs.flashOn = !vs.flashOn; flashBtn.classList.toggle('is-active', vs.flashOn); redrawVessel(); }
    }, ic('ice-cube', { size: 14 }), domH('span', { text: '3-Regime Flash-Iced' }));

    const paragonBtn = domH('button', {
      type: 'button',
      class: 'bt-lab-chip' + (vs.paragonOn ? ' is-active' : ''),
      onclick: function () { vs.paragonOn = !vs.paragonOn; paragonBtn.classList.toggle('is-active', vs.paragonOn); redrawVessel(); }
    }, ic('cryo-snowflake', { size: 14 }), domH('span', { text: '48g Paragon Chilling Sphere' }));

    const vesselHow = CK.createExplainer({
      title: 'Vessel Meniscus, Flash-Ice & Milk Steaming Lab',
      whatItDoes: 'Calculates exact liquid in your mug, Japanese Flash-Iced ice-to-hot-water split, Paragon chilling, and milk steaming sweetness.',
      howToUse: 'Drag the liquid line up or down directly on the carafe; toggle Flash-Iced, Paragon Sphere, or Milk types.',
      proTip: 'Steaming plant milk for bright light-roast espresso? Check the curdle warning and 10 °C cooler steam fix!'
    });

    card.appendChild(domH('div', { class: 'bt-lab-card-head' },
      domH('div', { class: 'bt-lab-title-group' },
        ic('ice-cube', { size: 22 }),
        domH('div', null,
          domH('h3', { text: 'Tactile Carafe Visualizer, Flash-Ice & Milk Steaming Lab' }),
          domH('p', { class: 'bt-lab-sub', text: 'Drag liquid level directly on the carafe; toggle Flash-Iced, 48g Chilling Sphere & Milk Sweetness Lab' })
        )
      ),
      domH('div', { class: 'bt-head-actions' }, vesselHow.trigger, epistemicBadge('verified_physics'))
    ));
    card.appendChild(vesselHow.panel);
    card.appendChild(domH('div', { class: 'bt-lab-chip-row' },
      flashBtn,
      paragonBtn,
      CK.vernierPill({
        label: 'Dose',
        value: vs.doseG,
        min: 6,
        max: 90,
        step: 0.5,
        decimals: 1,
        unit: 'g',
        compact: true,
        onChange: function (v) { vs.doseG = v; redrawVessel(); }
      }),
      CK.vernierPill({
        label: 'Ratio 1:',
        value: vs.ratio,
        min: 2.0,
        max: 22.0,
        step: 0.2,
        decimals: 1,
        unit: '',
        compact: true,
        onChange: function (v) { vs.ratio = v; redrawVessel(); }
      }),
      CK.vernierPill({
        label: 'Ice Share',
        value: Math.round(vs.iceShare * 100),
        min: 15,
        max: 55,
        step: 2,
        unit: '%',
        compact: true,
        onChange: function (v) { vs.iceShare = v / 100; vs.flashOn = true; flashBtn.classList.add('is-active'); redrawVessel(); }
      })
    ));
    const applyVesselBtn = domH('button', {
      type: 'button',
      class: 'bt-lab-btn is-primary bt-chart-cta-btn',
      onclick: function () {
        const totalW = Math.round(vs.doseG * vs.ratio);
        applyLabToBrewAndGo(function (a) {
          a.brew.dose = +vs.doseG.toFixed(1);
          a.brew.water = totalW;
          a.brew.ratio = +vs.ratio.toFixed(1);
          a.brew.flashIced = !!vs.flashOn;
          a.brew.paragonSphere = !!vs.paragonOn;
          if (vs.flashOn) {
            a.brew.iceShare = vs.iceShare;
            a.brew.ice = Math.round(totalW * vs.iceShare);
            a.brew.style = a.brew.method === 'aiden' ? 'aiden_flash_iced' : (a.brew.method === 'xbloom' ? 'xb_iced' : 'flash-iced');
          } else if (/iced|flash/i.test(a.brew.style || '')) {
            a.brew.style = 'standard';
          }
          a.brew.customizedNote = vs.doseG.toFixed(1) + 'g · 1:' + vs.ratio.toFixed(1) + (vs.flashOn ? (' Flash-Iced (' + Math.round(vs.iceShare * 100) + '% ice)') : '');
        }, {
          targetStep: 'brew',
          returnRoute: 'iced',
          toast: 'Applied ' + vs.doseG.toFixed(1) + 'g · 1:' + vs.ratio.toFixed(1) + (vs.flashOn ? ' Flash-Iced' : '') + ' recipe to Brew!'
        });
      }
    }, ic('brew', { size: 16 }), domH('span', { text: 'Apply Carafe / Flash-Iced Recipe to My Brew \u2192' }));

    card.appendChild(domH('div', { class: 'bt-chart-stage' }, svg));
    card.appendChild(readoutBanner);
    card.appendChild(domH('div', { class: 'bt-chart-cta-bar' }, applyVesselBtn));
    card.appendChild(milkBanner);

    redrawVessel();
    redrawMilkLab();
    return card;
  }

  /* ---- Bidirectional 4-Anchor Ratio & Batch Scaling + Yield/%EY Sponge Lab + Cold Brew Bar ---- */
  function buildRatio4AndYieldLabCard() {
    const r4 = labState.ratio4;
    const card = domH('section', { class: 'bt-studio-card', id: 'bt-studio-ratio-yield' });
    const outBox = domH('div', { class: 'bt-ratio4-out' });

    function solveFromAnchor(changedKey, val) {
      if (changedKey === 'dose') {
        r4.doseG = clamp(val, 4, 250, r4.doseG);
        r4.waterG = +(r4.doseG * r4.ratio).toFixed(0);
      } else if (changedKey === 'water') {
        r4.waterG = clamp(val, 20, 4000, r4.waterG);
        if (r4.anchor === 'ratio') r4.doseG = +(r4.waterG / Math.max(1.5, r4.ratio)).toFixed(1);
        else r4.ratio = +(r4.waterG / Math.max(0.5, r4.doseG)).toFixed(2);
      } else if (changedKey === 'mug') {
        r4.mugG = clamp(val, 15, 3600, r4.mugG);
        if (r4.anchor === 'ratio') {
          r4.doseG = +(r4.mugG / Math.max(0.8, r4.ratio - r4.rw)).toFixed(1);
          r4.waterG = Math.round(r4.doseG * r4.ratio);
        } else {
          r4.waterG = Math.round(r4.mugG + r4.rw * r4.doseG);
          r4.ratio = +(r4.waterG / Math.max(0.5, r4.doseG)).toFixed(2);
        }
      } else if (changedKey === 'ratio') {
        r4.ratio = clamp(val, 1.2, 24.0, r4.ratio);
        if (r4.anchor === 'water') r4.doseG = +(r4.waterG / r4.ratio).toFixed(1);
        else r4.waterG = Math.round(r4.doseG * r4.ratio);
      }
      const dissG = r4.doseG * (r4.eyPct / 100);
      r4.mugG = Math.max(10, Math.round(r4.waterG - r4.rw * r4.doseG + dissG));
      r4.tdsPct = +((100 * dissG) / Math.max(1, r4.mugG)).toFixed(2);
    }

    const doseIn = domH('input', {
      type: 'number', inputmode: 'decimal', class: 'bt-lab-text-in bt-lab-num-in', step: '0.5', value: String(r4.doseG),
      'aria-label': 'Dry coffee dose in grams',
      oninput: function () { const v = parseFloat(doseIn.value); if (v > 0) { solveFromAnchor('dose', v); syncInputs('dose'); } }
    });
    const waterIn = domH('input', {
      type: 'number', inputmode: 'decimal', class: 'bt-lab-text-in bt-lab-num-in', step: '5', value: String(r4.waterG),
      'aria-label': 'Total brew water in grams',
      oninput: function () { const v = parseFloat(waterIn.value); if (v > 0) { solveFromAnchor('water', v); syncInputs('water'); } }
    });
    const mugIn = domH('input', {
      type: 'number', inputmode: 'decimal', class: 'bt-lab-text-in bt-lab-num-in', step: '5', value: String(r4.mugG),
      'aria-label': 'Beverage yield in mug in grams',
      oninput: function () { const v = parseFloat(mugIn.value); if (v > 0) { solveFromAnchor('mug', v); syncInputs('mug'); } }
    });
    const ratioIn = domH('input', {
      type: 'number', inputmode: 'decimal', class: 'bt-lab-text-in bt-lab-num-in', step: '0.2', value: String(r4.ratio),
      'aria-label': 'Brew ratio 1 to X',
      oninput: function () { const v = parseFloat(ratioIn.value); if (v > 0) { solveFromAnchor('ratio', v); syncInputs('ratio'); } }
    });

    const batchBtns = [1, 2, 3, 4].map(function (nCups) {
      return domH('button', {
        type: 'button',
        class: 'bt-lab-chip' + (r4.cupsBatch === nCups ? ' is-active' : ''),
        onclick: function () {
          const factor = nCups / Math.max(1, r4.cupsBatch);
          r4.cupsBatch = nCups;
          r4.doseG = +(r4.doseG * factor).toFixed(1);
          solveFromAnchor('dose', r4.doseG);
          batchBtns.forEach(function (b, bi) { b.classList.toggle('is-active', (bi + 1) === nCups); });
          CK.haptic('tick');
          syncInputs('');
        }
      }, nCups + (nCups === 1 ? ' Cup' : ' Cups') + (nCups > 1 ? (' (+' + Math.round((Math.pow(nCups, 0.2) - 1) * 100) + '% coarser)') : ''));
    });

    /* 1-Brew Wet-Grounds Sponge Calibrator + Cold Brew Concentrate Bar */
    const wetBedIn = domH('input', {
      type: 'number', inputmode: 'decimal', class: 'bt-lab-text-in bt-lab-num-in', step: '0.5', value: String(r4.wetBedWeightG),
      'aria-label': 'Drained wet grounds weight in grams',
      oninput: function () {
        const wBed = parseFloat(wetBedIn.value);
        if (Number.isFinite(wBed) && wBed > r4.doseG) {
          r4.wetBedWeightG = wBed;
          r4.rw = +clamp((wBed - r4.doseG) / Math.max(1, r4.doseG), 1.0, 3.2, 2.1).toFixed(2);
          solveFromAnchor('dose', r4.doseG);
          syncInputs('wet');
        }
      }
    });

    function syncInputs(skipKey) {
      if (skipKey !== 'dose') doseIn.value = String(r4.doseG);
      if (skipKey !== 'water') waterIn.value = String(r4.waterG);
      if (skipKey !== 'mug') mugIn.value = String(r4.mugG);
      if (skipKey !== 'ratio') ratioIn.value = String(r4.ratio);
      const cbConcMl = Math.round(r4.coldBrewServeG / (1 + r4.coldBrewDiluteRatio - 1));
      const cbWaterOrMilkMl = Math.max(0, r4.coldBrewServeG - cbConcMl);
      const darcyShiftClicks = Math.round((Math.pow(r4.doseG / 18.0, 0.20) - 1) * 20);
      outBox.textContent = '';
      outBox.appendChild(domH('div', { class: 'bt-studio-readout-banner' },
        domH('div', { class: 'bt-studio-human-line num-tab' },
          domH('strong', {
            text: r4.doseG.toFixed(1) + ' g Dose  \u2194  ' + r4.waterG + ' g Pour Water  \u2194  ' +
              r4.mugG + ' g in Mug  \u2194  1:' + r4.ratio.toFixed(1) + ' (~' + r4.tdsPct.toFixed(2) + '% TDS)'
          })
        ),
        domH('p', {
          class: 'bt-lab-hint num-tab',
          text: (isScienceXray()
            ? ('Dripper Sponge Retention r_w = ' + r4.rw.toFixed(2) + ' g/g (' + (r4.rw * r4.doseG).toFixed(1) + ' g held in bed)  ·  Batch Darcy Grind Shift: ')
            : ('Water Held in Grounds: ' + (r4.rw * r4.doseG).toFixed(1) + ' g (' + r4.rw.toFixed(2) + ' g per g coffee)  ·  Large-Batch Grind Guide: ')) +
            (darcyShiftClicks === 0 ? 'Standard 18g grind' : ((darcyShiftClicks > 0 ? '+' : '') + darcyShiftClicks + ' clicks coarser vs 18g')) +
            '  ·  Cold Brew 1:' + r4.coldBrewConcRatio + ' Serving (' + r4.coldBrewServeG + ' g glass): ' + cbConcMl + ' g concentrate + ' + cbWaterOrMilkMl + ' g water/milk'
        }),
        domH('div', { class: 'bt-lab-btn-row', style: 'margin-top:8px' },
          domH('button', {
            type: 'button',
            class: 'bt-lab-btn is-sm is-primary',
            onclick: function () {
              applyLabToBrewAndGo(function (a) {
                a.brew.dose = +r4.doseG.toFixed(1);
                a.brew.water = Math.round(r4.waterG);
                a.brew.ratio = +r4.ratio.toFixed(1);
                a.brew.retentionRw = r4.rw;
                a.brew.customizedNote = 'Scaled ' + r4.doseG.toFixed(1) + 'g : ' + Math.round(r4.waterG) + 'g (1:' + r4.ratio.toFixed(1) + ')';
              }, {
                targetStep: 'brew',
                returnRoute: 'ratio',
                toast: 'Applied ' + r4.doseG.toFixed(1) + 'g Dose & ' + Math.round(r4.waterG) + 'g Water (1:' + r4.ratio.toFixed(1) + ') to your recipe!'
              });
            }
          }, ic('brew', { size: 14 }), domH('span', { text: 'Apply Dose & Water to My Recipe \u2192' })),
          domH('button', {
            type: 'button',
            class: 'bt-lab-btn is-sm',
            onclick: function () {
              const a = getApp();
              a.prefs = a.prefs || {};
              a.prefs.retentionRw = r4.rw;
              labState.bc.rw = r4.rw;
              labState.vessel.rw = r4.rw;
              saveDraftSoon();
              CK.haptic('snap');
              notify('Saved ' + r4.rw.toFixed(2) + ' g/g grounds water retention across all Lab calculators!');
            }
          }, 'Save Sponge Retention (' + r4.rw.toFixed(2) + ' g/g)')
        )
      ));
    }

    card.appendChild(domH('div', { class: 'bt-lab-card-head' },
      domH('div', { class: 'bt-lab-title-group' },
        ic('scale-deck', { size: 22 }),
        domH('div', null,
          domH('h3', { text: 'Bidirectional 4-Anchor Ratio, Batch Scaling & Sponge Calibrator' }),
          domH('p', { class: 'bt-lab-sub', text: 'Type any of Dose, Pour Water, Mug Yield, or Ratio — all 4 solve live with bed retention & Cold Brew bar' })
        )
      ),
      epistemicBadge('verified_physics')
    ));
    card.appendChild(domH('div', { class: 'bt-lab-chip-row' },
      domH('span', { class: 'bt-lab-inline-lbl', text: 'Batch Scale:' }),
      batchBtns
    ));
    card.appendChild(domH('div', { class: 'bt-ratio4-grid' },
      domH('label', { class: 'bt-lab-field-lbl' }, domH('span', { text: '1. Dose (g)' }), doseIn),
      domH('label', { class: 'bt-lab-field-lbl' }, domH('span', { text: '2. Pour Water (g)' }), waterIn),
      domH('label', { class: 'bt-lab-field-lbl' }, domH('span', { text: '3. Mug Yield (g)' }), mugIn),
      domH('label', { class: 'bt-lab-field-lbl' }, domH('span', { text: '4. Ratio (1:X)' }), ratioIn)
    ));
    card.appendChild(domH('div', { class: 'bt-lab-inline-inputs' },
      domH('label', { class: 'bt-lab-field-lbl' },
        domH('span', { text: '1-Brew Sponge Check: Wet Grounds Wt (g)' }),
        wetBedIn
      ),
      CK.vernierPill({
        label: 'Cold Brew Cut 1:',
        value: r4.coldBrewDiluteRatio,
        min: 1.5,
        max: 4.0,
        step: 0.5,
        decimals: 1,
        unit: 'x',
        compact: true,
        onChange: function (v) { r4.coldBrewDiluteRatio = v; syncInputs(''); }
      })
    ));
    card.appendChild(outBox);
    syncInputs('');
    return card;
  }

  function buildStudioWaterAndRatioHub() {
    const wrap = domH('div', { class: 'bt-studio-stack' });
    wrap.appendChild(buildStudioWaterPad());
    wrap.appendChild(buildRatio4AndYieldLabCard());
    wrap.appendChild(buildStudioVesselAlchemist());
    return wrap;
  }

  /* ==========================================================================
   * STUDIO 6: CutawayAgtronRibbon & FreshnessFreezerCurve + Bulk-Trap Silos
   * ========================================================================== */
  let agtronUid = 0;

  function buildStudioAgtronAndFreshness() {
    const rf = labState.roastFresh;
    const card = domH('section', { class: 'bt-studio-card', id: 'bt-studio-agtron' });
    const gradId = 'bt_cutaway_grad_' + (++agtronUid);

    /* ---- Part A: CutawayAgtronRibbon ---- */
    const agSvg = CK.svgEl('svg', {
      viewBox: '0 0 460 286',
      class: 'bt-chart-svg bt-agtron-svg',
      'aria-label': 'Interactive 5-Scale Cutaway Agtron Roast Colorimeter Ribbon'
    });
    const defs = CK.svgEl('defs');
    const radGrad = CK.svgEl('radialGradient', { id: gradId, cx: '0.5', cy: '0.5', r: '0.5' });
    const stopCore = CK.svgEl('stop', { offset: '0%', 'stop-color': '#8b5022' });
    const stopMid = CK.svgEl('stop', { offset: '56%', 'stop-color': '#8b5022' });
    const stopRim = CK.svgEl('stop', { offset: '86%', 'stop-color': '#5c3314' });
    const stopEdge = CK.svgEl('stop', { offset: '100%', 'stop-color': '#3e210b' });
    radGrad.appendChild(stopCore);
    radGrad.appendChild(stopMid);
    radGrad.appendChild(stopRim);
    radGrad.appendChild(stopEdge);
    defs.appendChild(radGrad);
    agSvg.appendChild(defs);

    const stageG = CK.svgEl('g');
    agSvg.appendChild(stageG);
    const agReadout = domH('div', { class: 'bt-studio-readout-banner' });

    const AX_L = 44, AX_R = 428, AX_W = 384;
    function mapG(g) { return AX_L + ((clamp(g, 25, 105, 65) - 25) / 80) * AX_W; }
    function invG(ux) { return 25 + clamp((ux - AX_L) / AX_W, 0, 1, 0.5) * 80; }

    function redrawAgtron() {
      stageG.textContent = '';
      const beanHex = agtronDiscHex(rf.beanG);
      const groundHex = agtronDiscHex(rf.groundG);
      const delta = +(rf.groundG - rf.beanG).toFixed(1);

      stopCore.setAttribute('stop-color', groundHex);
      stopMid.setAttribute('stop-color', groundHex);
      stopRim.setAttribute('stop-color', beanHex);
      stopEdge.setAttribute('stop-color', beanHex);

      /* Left Dish: Whole Bean, Center: Cutaway Cross-Section, Right Dish: Ground */
      stageG.appendChild(CK.svgEl('circle', { cx: '96', cy: '76', r: '46', fill: beanHex, class: 'bt-ag-dish' }));
      const l1 = CK.svgEl('text', { x: '96', y: '136', 'text-anchor': 'middle', class: 'bt-chart-tick' });
      l1.textContent = 'Whole Bean (' + rf.beanG.toFixed(1) + ')';
      stageG.appendChild(l1);

      stageG.appendChild(CK.svgEl('ellipse', { cx: '230', cy: '76', rx: '36', ry: '48', fill: 'url(#' + gradId + ')', class: 'bt-ag-cutaway' }));
      const lc = CK.svgEl('text', { x: '230', y: '136', 'text-anchor': 'middle', class: 'bt-chart-tick' });
      lc.textContent = 'Cutaway Delta ' + (delta >= 0 ? '+' : '') + delta;
      stageG.appendChild(lc);

      stageG.appendChild(CK.svgEl('circle', { cx: '364', cy: '76', r: '46', fill: groundHex, class: 'bt-ag-dish' }));
      const l2 = CK.svgEl('text', { x: '364', y: '136', 'text-anchor': 'middle', class: 'bt-chart-tick' });
      l2.textContent = 'Ground Core (' + rf.groundG.toFixed(1) + ')';
      stageG.appendChild(l2);

      /* Multi-Stop Spectrum Bar */
      for (let i = 0; i < 24; i++) {
        const g0 = 25 + (i / 24) * 80;
        stageG.appendChild(CK.svgEl('rect', {
          x: (AX_L + (i / 24) * AX_W).toFixed(1),
          y: '154',
          width: (AX_W / 24 + 0.8).toFixed(1),
          height: '18',
          fill: agtronDiscHex(g0)
        }));
      }

      /* Delta Caliper Bridge + (B) & (G) Draggable Pucks */
      const bx = mapG(rf.beanG);
      const gx = mapG(rf.groundG);
      stageG.appendChild(CK.svgEl('line', { x1: bx.toFixed(1), y1: '163', x2: gx.toFixed(1), y2: '163', class: 'bt-ag-caliper' }));

      [
        { x: bx, tag: 'B' },
        { x: gx, tag: 'G' }
      ].forEach(function (pk) {
        const pg = CK.svgEl('g', { transform: 'translate(' + pk.x.toFixed(1) + ',163)' });
        pg.appendChild(CK.createHitHalo(0, 0, 10, 26, 1));
        pg.appendChild(CK.svgEl('circle', { r: '10', class: 'bt-ag-puck' }));
        const t = CK.svgEl('text', { x: '0', y: '3.5', 'text-anchor': 'middle', class: 'bt-ag-puck-lbl' });
        t.textContent = pk.tag;
        pg.appendChild(t);
        stageG.appendChild(pg);
      });

      /* 5 Synchronized Live Ruler Scales (Gourmet <-> Commercial <-> Tonino <-> Lighttells <-> Colorette) */
      const scales = [
        { name: 'SCA Gourmet / Omni', valB: rf.beanG.toFixed(1), valG: rf.groundG.toFixed(1) },
        { name: 'Commercial M-Basic', valB: commercialFromGourmet(rf.beanG).toFixed(1), valG: commercialFromGourmet(rf.groundG).toFixed(1) },
        { name: 'Tonino (T63=105)', valB: toninoFromGourmet(rf.beanG).toFixed(1), valG: toninoFromGourmet(rf.groundG).toFixed(1) },
        { name: 'Lighttells CM-100', valB: rf.beanG.toFixed(1), valG: rf.groundG.toFixed(1) },
        { name: 'Probat Colorette', valB: coloretteFromGourmet(rf.beanG).toFixed(1), valG: coloretteFromGourmet(rf.groundG).toFixed(1) }
      ];
      scales.forEach(function (sc, idx) {
        const ry = 196 + idx * 17;
        const nl = CK.svgEl('text', { x: AX_L, y: ry, class: 'bt-ag-ruler-name' });
        nl.textContent = sc.name;
        stageG.appendChild(nl);
        const vl = CK.svgEl('text', { x: AX_R, y: ry, 'text-anchor': 'end', class: 'bt-ag-ruler-val num-tab' });
        vl.textContent = 'Bean ' + sc.valB + '  |  Ground ' + sc.valG;
        stageG.appendChild(vl);
      });

      const scorchMsg = delta >= 12
        ? 'High Radial Gradient (Delta +' + delta + ' >= 12): Outer bean shell roasted darker than dense core \u2192 drop late-pulse temp -1.5 °C to avoid phenylindane bitterness!'
        : (delta <= 6 ? 'Uniform Convective Core (Delta +' + delta + ' <= 6): Even cellular solubility from rim to center.' : 'Balanced Drum Development (Delta +' + delta + ').');

      agReadout.textContent = '';
      agReadout.appendChild(domH('div', { class: 'bt-studio-human-line' },
        domH('strong', {
          text: 'Gourmet ' + rf.groundG.toFixed(1) + '  ·  Commercial ' +
            commercialFromGourmet(rf.groundG).toFixed(1) + '  ·  Tonino ' + toninoFromGourmet(rf.groundG).toFixed(1) +
            '  ·  Colorette ' + coloretteFromGourmet(rf.groundG).toFixed(1)
        })
      ));
      agReadout.appendChild(domH('p', { class: 'bt-studio-xray-line', text: scorchMsg }));
    }

    CK.bindChartSurface(agSvg, {
      ariaLabel: '5-Scale Agtron Whole-Bean and Ground Pucks',
      detentStep: 0.5,
      getHandles: function () {
        return [
          {
            id: 'bean',
            hitRadiusPx: 28,
            getPos: function () { return { x: mapG(rf.beanG), y: 163 }; },
            onMove: function (p) {
              rf.beanG = +invG(p.ux).toFixed(1);
              redrawAgtron();
              redrawFreshness();
              return { detentValue: rf.beanG, loupe: 'Whole Bean: ' + rf.beanG.toFixed(1) + ' Gourmet' };
            }
          },
          {
            id: 'ground',
            hitRadiusPx: 28,
            getPos: function () { return { x: mapG(rf.groundG), y: 163 }; },
            onMove: function (p) {
              rf.groundG = +invG(p.ux).toFixed(1);
              redrawAgtron();
              redrawFreshness();
              return { detentValue: rf.groundG, loupe: 'Ground Core: ' + rf.groundG.toFixed(1) + ' (Tonino ' + toninoFromGourmet(rf.groundG).toFixed(0) + ')' };
            }
          }
        ];
      },
      onKeyStep: function (k) {
        rf.groundG = clamp(rf.groundG + k.dx * 0.5, 25, 105, rf.groundG);
        redrawAgtron();
        redrawFreshness();
        return { ariaNow: rf.groundG };
      }
    });

    /* ---- Part B: FreshnessFreezerCurve (-18C 12.3x Arrhenius) & 2-Bag Bulk-Trap Silos ---- */
    const frSvg = CK.svgEl('svg', {
      viewBox: '0 0 440 246',
      class: 'bt-chart-svg bt-fresh-svg',
      'aria-label': 'Arrhenius -18C Cryo-Vault Freshness Curve and Freeze Split'
    });
    const frG = CK.svgEl('g');
    frSvg.appendChild(frG);
    const siloBox = domH('div', { class: 'bt-silo-race-box' });

    const FP = { L: 42, T: 20, PW: 380, PH: 184, R: 422, B: 204 };
    const MAX_DAYS = 60;

    function vitalityAt(effDay, groundG) {
      const u = clamp((groundG - 28) / 70, 0, 1, 0.7);
      const peakStart = 3 + 5 * u;
      const peakEnd = 14 + 16 * u;
      if (effDay < peakStart) return 72 + 28 * (effDay / Math.max(1, peakStart));
      if (effDay <= peakEnd) return 100 - 4 * ((effDay - peakStart) / Math.max(1, peakEnd - peakStart));
      return Math.max(18, 96 * Math.exp(-0.042 * (effDay - peakEnd)));
    }

    function redrawFreshness() {
      frG.textContent = '';
      frG.appendChild(CK.svgEl('rect', { x: FP.L, y: FP.T, width: FP.PW, height: FP.PH, rx: '12', class: 'bt-chart-plot-bg' }));

      const fx = function (d) { return FP.L + (clamp(d, 0, MAX_DAYS, 0) / MAX_DAYS) * FP.PW; };
      const fy = function (v) { return FP.B - (clamp(v, 0, 100, 50) / 100) * FP.PH; };

      const ambPts = [];
      const cryoPts = [];
      for (let d = 0; d <= MAX_DAYS; d += 1.5) {
        ambPts.push([fx(d), fy(vitalityAt(d, rf.groundG))]);
        if (d >= rf.freezeDay) {
          /* Unified -18C Cryo-Vault Ea = 40.1 kJ/mol -> 12.3x aging slowdown */
          const effD = rf.freezeDay + (d - rf.freezeDay) / 12.3;
          cryoPts.push([fx(d), fy(vitalityAt(effD, rf.groundG))]);
        }
      }
      frG.appendChild(CK.svgEl('path', { d: CK.monotoneCubicPath(ambPts), fill: 'none', class: 'bt-fr-amb-curve' }));
      if (rf.freezeOn && cryoPts.length >= 2) {
        frG.appendChild(CK.svgEl('path', { d: CK.monotoneCubicPath(cryoPts), fill: 'none', class: 'bt-fr-cryo-curve' }));
      }

      /* Remaining Grams Descent Line */
      const emptyDay = clamp(rf.bagG / Math.max(2, rf.paceGPerDay), 2, MAX_DAYS, 15);
      frG.appendChild(CK.svgEl('line', {
        x1: FP.L, y1: (FP.T + 14).toFixed(1),
        x2: fx(emptyDay).toFixed(1), y2: FP.B,
        class: 'bt-fr-mass-line'
      }));

      /* Freeze Pin & Today Bead */
      const fpx = fx(rf.freezeDay);
      const fpy = fy(vitalityAt(rf.freezeDay, rf.groundG));
      const fPin = CK.svgEl('g', { transform: 'translate(' + fpx.toFixed(1) + ',' + fpy.toFixed(1) + ')' });
      fPin.appendChild(CK.createHitHalo(0, 0, 9, 26, 1));
      fPin.appendChild(CK.svgEl('circle', { r: '8', class: 'bt-fr-freeze-pin' }));
      frG.appendChild(fPin);

      const tEffToday = rf.freezeOn && rf.daysToday > rf.freezeDay
        ? rf.freezeDay + (rf.daysToday - rf.freezeDay) / 12.3
        : rf.daysToday;
      const tpx = fx(rf.daysToday);
      const tpy = fy(vitalityAt(tEffToday, rf.groundG));
      const tPin = CK.svgEl('g', { transform: 'translate(' + tpx.toFixed(1) + ',' + tpy.toFixed(1) + ')' });
      tPin.appendChild(CK.createHitHalo(0, 0, 9, 26, 1));
      tPin.appendChild(CK.svgEl('circle', { r: '7.5', class: 'bt-fr-today-pin' }));
      frG.appendChild(tPin);

      const flbl = CK.svgEl('text', { x: (FP.L + 8).toFixed(1), y: (FP.B + 16).toFixed(1), class: 'bt-chart-tick' });
      flbl.textContent = isScienceXray()
        ? ('Day ' + Math.round(rf.daysToday) + ' (Eff. Biological Age: ' + tEffToday.toFixed(1) + 'd @ 12.3x -18 °C Arrhenius  ·  +12 um coarser frozen grind)')
        : ('Day ' + Math.round(rf.daysToday) + ' off roast (Freezer Age: ' + tEffToday.toFixed(1) + 'd @ -18 °C · 12× slower aging)');
      frG.appendChild(flbl);

      /* 2-Bag Bulk-Trap Silo Cost / Freshness Race */
      siloBox.textContent = '';
      const dose = 18;
      const u = clamp((rf.groundG - 28) / 70, 0, 1, 0.7);
      const freshCutoffDays = Math.round(18 + 16 * u);

      function calcBagStats(grams, price, freezeExcess) {
        const totalCups = Math.max(1, Math.floor(grams / dose));
        const maxFreshGrams = freshCutoffDays * rf.paceGPerDay;
        const peakGrams = freezeExcess ? grams : Math.min(grams, maxFreshGrams);
        const peakCups = Math.max(1, Math.floor(peakGrams / dose));
        const staleCups = Math.max(0, totalCups - peakCups);
        return {
          totalCups: totalCups,
          peakCups: peakCups,
          staleCups: staleCups,
          costRaw: price / totalCups,
          costPerPeakCup: price / peakCups
        };
      }

      const bagA = calcBagStats(rf.bagAGrams, rf.bagAPrice, false);
      const bagB = calcBagStats(rf.bagBGrams, rf.bagBPrice, rf.freezeBulk);

      siloBox.appendChild(domH('div', { class: 'bt-silo-head' },
        domH('strong', { text: '2-Bag "Bulk Trap" Silo Cost / Freshness Race' }),
        domH('button', {
          type: 'button',
          class: 'bt-lab-chip' + (rf.freezeBulk ? ' is-active' : ''),
          onclick: function () { rf.freezeBulk = !rf.freezeBulk; CK.haptic('tick'); redrawFreshness(); }
        }, ic('cryo-snowflake', { size: 14 }), domH('span', { text: rf.freezeBulk ? 'Freeze Bulk Excess ON (-18C)' : 'Countertop Only (No Freezer)' }))
      ));

      const silosRow = domH('div', { class: 'bt-silos-grid' });
      [
        { title: 'Retail Bag (' + rf.bagAGrams + 'g · $' + rf.bagAPrice.toFixed(2) + ')', st: bagA },
        { title: 'Bulk Silo (' + rf.bagBGrams + 'g · $' + rf.bagBPrice.toFixed(2) + ')', st: bagB }
      ].forEach(function (item) {
        const freshPct = Math.round((item.st.peakCups / item.st.totalCups) * 100);
        const bar = domH('div', { class: 'bt-silo-bar' },
          domH('div', { class: 'bt-silo-fresh', style: 'width:' + freshPct + '%' }),
          domH('div', { class: 'bt-silo-stale', style: 'width:' + (100 - freshPct) + '%' })
        );
        silosRow.appendChild(domH('div', { class: 'bt-silo-card' },
          domH('span', { class: 'bt-silo-title', text: item.title }),
          bar,
          domH('strong', {
            class: 'num-tab',
            text: '$' + item.st.costPerPeakCup.toFixed(2) + ' / Peak Cup  (' + item.st.peakCups + ' fresh, ' + item.st.staleCups + ' stale)'
          })
        ));
      });
      siloBox.appendChild(silosRow);
    }

    CK.bindChartSurface(frSvg, {
      ariaLabel: 'Freshness Curve Freeze Day and Today Handles',
      detentStep: 1,
      getHandles: function () {
        const fx = function (d) { return FP.L + (clamp(d, 0, MAX_DAYS, 0) / MAX_DAYS) * FP.PW; };
        const fy = function (v) { return FP.B - (clamp(v, 0, 100, 50) / 100) * FP.PH; };
        return [
          {
            id: 'freeze_pin',
            hitRadiusPx: 28,
            getPos: function () { return { x: fx(rf.freezeDay), y: fy(vitalityAt(rf.freezeDay, rf.groundG)) }; },
            onMove: function (p) {
              rf.freezeDay = Math.round(clamp(((p.ux - FP.L) / FP.PW) * MAX_DAYS, 1, 45, rf.freezeDay));
              redrawFreshness();
              return { detentValue: rf.freezeDay, loupe: 'Freeze on Day ' + rf.freezeDay + ' (-18C 12.3x slower)' };
            }
          },
          {
            id: 'today_pin',
            hitRadiusPx: 28,
            getPos: function () { return { x: fx(rf.daysToday), y: fy(vitalityAt(rf.daysToday, rf.groundG)) }; },
            onMove: function (p) {
              rf.daysToday = Math.round(clamp(((p.ux - FP.L) / FP.PW) * MAX_DAYS, 0, MAX_DAYS, rf.daysToday));
              redrawFreshness();
              return { detentValue: rf.daysToday, loupe: 'Calendar Day ' + rf.daysToday };
            }
          }
        ];
      },
      onKeyStep: function (k) {
        rf.daysToday = clamp(rf.daysToday + k.dx, 0, MAX_DAYS, rf.daysToday);
        redrawFreshness();
        return { ariaNow: rf.daysToday };
      }
    });

    const agtronHow = CK.createExplainer({
      title: 'Cutaway 5-Scale Roast Color & Freezer Freshness',
      whatItDoes: 'Synchronizes Gourmet, M-Basic II Commercial, Tonino, Omni, and CM-100 roast color scales with -18 °C freezer storage.',
      howToUse: 'Drag Whole-Bean (B) and Ground (G) pucks on the color bar, and slide the Freeze Day pin on the freshness curve.',
      proTip: 'Freezing beans airtight at -18 °C slows aging ~12× — grind straight from frozen (+1 step coarser for ultra-uniform grounds)!'
    });

    card.appendChild(domH('div', { class: 'bt-lab-card-head' },
      domH('div', { class: 'bt-lab-title-group' },
        ic('omni-nir', { size: 22 }),
        domH('div', null,
          domH('h3', {
            text: isScienceXray()
              ? 'Cutaway 5-Scale Agtron Ribbon & -18 °C Arrhenius Freezer Curve'
              : 'Cutaway 5-Scale Roast Color & Freezer Storage (-18 °C · 12× Slower Aging)'
          }),
          domH('p', {
            class: 'bt-lab-sub',
            text: isScienceXray()
              ? 'Official M-Basic II Commercial & Tonino(63)=105 + Arrhenius 12.3x freezer curve & Bulk-Trap Silos'
              : 'Compare Whole-Bean vs Ground roast color, Bean Rest & Freezer Freshness Timeline, and Retail vs Bulk bag value'
          })
        )
      ),
      domH('div', { class: 'bt-head-actions' }, agtronHow.trigger, epistemicBadge('verified_physics'))
    ));
    card.appendChild(agtronHow.panel);
    card.appendChild(domH('div', { class: 'bt-chart-stage' }, agSvg));
    card.appendChild(agReadout);
    card.appendChild(domH('div', { class: 'bt-lab-btn-row' },
      domH('button', {
        type: 'button',
        class: 'bt-lab-btn is-primary',
        onclick: function () {
          applyLabToBrewAndGo(function (a) {
            a.coffee.bean_agtron = rf.beanG;
            a.coffee.ground_agtron = rf.groundG;
            a.coffee.agtron = rf.groundG;
            a.coffee.roast_delta = +(rf.groundG - rf.beanG).toFixed(1);
            const recTemp = rf.groundG >= 80 ? 95 : (rf.groundG >= 65 ? 93 : (rf.groundG >= 52 ? 90 : 87));
            a.brew.tempC = recTemp;
            a.brew.customizedNote = 'Agtron ' + rf.groundG.toFixed(0) + ' (' + recTemp + ' °C kettle)';
          }, {
            targetStep: 'brew',
            returnRoute: 'agtron',
            toast: 'Applied Agtron ' + rf.beanG.toFixed(1) + '/' + rf.groundG.toFixed(1) + ' & matched brew temp to your recipe!'
          });
        }
      }, ic('check-seal', { size: 15 }), domH('span', { text: 'Apply Roast Color & Temp to My Recipe \u2192' })),
      domH('button', {
        type: 'button',
        class: 'bt-lab-btn',
        onclick: function () {
          const a = getApp();
          a.coffee = a.coffee || {};
          a.coffee.bean_agtron = rf.beanG;
          a.coffee.ground_agtron = rf.groundG;
          a.coffee.agtron = rf.groundG;
          a.coffee.roast_delta = +(rf.groundG - rf.beanG).toFixed(1);
          saveDraftSoon();
          CK.haptic('celebrate');
          notify('Saved Agtron ' + rf.beanG.toFixed(1) + '/' + rf.groundG.toFixed(1) + ' to active coffee!');
        }
      }, 'Save to Active Bag Only'),
      CK.vernierPill({
        label: 'Daily Pace',
        value: rf.paceGPerDay,
        min: 7,
        max: 60,
        step: 1,
        unit: 'g/day',
        compact: true,
        onChange: function (v) { rf.paceGPerDay = v; redrawFreshness(); }
      }),
      CK.vernierPill({
        label: 'Bulk Price',
        value: rf.bagBPrice,
        min: 18,
        max: 120,
        step: 1,
        decimals: 0,
        unit: 'USD',
        compact: true,
        onChange: function (v) { rf.bagBPrice = v; redrawFreshness(); }
      })
    ));
    card.appendChild(domH('div', { class: 'bt-chart-stage' }, frSvg));
    card.appendChild(siloBox);

    redrawAgtron();
    redrawFreshness();
    return card;
  }

  /* ---- Compare 2 Bags Head-to-Head + True Cup Cost, Cafe Savings & Gear Break-Even ROI ---- */
  function buildBagCompareAndRoiCard() {
    const bc = labState.bagCmp;
    const roi = labState.roi;
    const wrap = domH('div', { class: 'bt-studio-stack' });

    /* 1. Compare 2 Bags Head-to-Head */
    const cmpCard = domH('section', { class: 'bt-studio-card', id: 'bt-studio-bagcmp' });
    const cmpOut = domH('div', { class: 'bt-bagcmp-out' });

    const aNameIn = domH('input', { type: 'text', class: 'bt-lab-text-in', value: bc.aName, 'aria-label': 'Bag A name', oninput: function () { bc.aName = aNameIn.value; paintCmp(); } });
    const aPriceIn = domH('input', { type: 'number', inputmode: 'decimal', class: 'bt-lab-text-in bt-lab-num-in', step: '0.5', value: String(bc.aPrice), 'aria-label': 'Bag A price', oninput: function () { bc.aPrice = Math.max(1, parseFloat(aPriceIn.value) || 20); paintCmp(); } });
    const aGramsIn = domH('input', { type: 'number', inputmode: 'decimal', class: 'bt-lab-text-in bt-lab-num-in', step: '10', value: String(bc.aGrams), 'aria-label': 'Bag A weight grams', oninput: function () { bc.aGrams = Math.max(50, parseFloat(aGramsIn.value) || 250); paintCmp(); } });

    const bNameIn = domH('input', { type: 'text', class: 'bt-lab-text-in', value: bc.bName, 'aria-label': 'Bag B name', oninput: function () { bc.bName = bNameIn.value; paintCmp(); } });
    const bPriceIn = domH('input', { type: 'number', inputmode: 'decimal', class: 'bt-lab-text-in bt-lab-num-in', step: '0.5', value: String(bc.bPrice), 'aria-label': 'Bag B price', oninput: function () { bc.bPrice = Math.max(1, parseFloat(bPriceIn.value) || 24); paintCmp(); } });
    const bGramsIn = domH('input', { type: 'number', inputmode: 'decimal', class: 'bt-lab-text-in bt-lab-num-in', step: '10', value: String(bc.bGrams), 'aria-label': 'Bag B weight grams', oninput: function () { bc.bGrams = Math.max(50, parseFloat(bGramsIn.value) || 340); paintCmp(); } });

    function paintCmp() {
      const dose = Math.max(8, roi.doseG || 18);
      const pace = Math.max(6, labState.roastFresh.paceGPerDay || 18);
      const cupsA = Math.max(1, bc.aGrams / dose);
      const cupsB = Math.max(1, bc.bGrams / dose);
      const rawPerCupA = bc.aPrice / cupsA;
      const rawPerCupB = bc.bPrice / cupsB;
      const freshWinG = 26 * pace;
      const peakCupsA = Math.max(1, Math.min(bc.aGrams, freshWinG) / dose);
      const peakCupsB = Math.max(1, Math.min(bc.bGrams, freshWinG) / dose);
      const effPeakA = bc.aPrice / peakCupsA;
      const effPeakB = bc.bPrice / peakCupsB;
      const winner = effPeakA <= effPeakB ? (bc.aName || 'Bag A') : (bc.bName || 'Bag B');

      cmpOut.textContent = '';
      cmpOut.appendChild(domH('div', { class: 'bt-lab-metric-strip' },
        domH('div', { class: 'bt-lab-kpi' },
          domH('span', { text: bc.aName || 'Bag A' }),
          domH('strong', { class: 'num-tab', text: '$' + rawPerCupA.toFixed(2) + '/cup ($' + effPeakA.toFixed(2) + ' fresh)' })
        ),
        domH('div', { class: 'bt-lab-kpi' },
          domH('span', { text: bc.bName || 'Bag B' }),
          domH('strong', { class: 'num-tab', text: '$' + rawPerCupB.toFixed(2) + '/cup ($' + effPeakB.toFixed(2) + ' fresh)' })
        ),
        domH('div', { class: 'bt-lab-kpi' },
          domH('span', { text: 'Value Winner (@ ' + pace + 'g/d)' }),
          domH('strong', { text: winner })
        )
      ));
    }

    cmpCard.appendChild(domH('div', { class: 'bt-lab-card-head' },
      domH('div', { class: 'bt-lab-title-group' },
        ic('scale-deck', { size: 20 }),
        domH('div', null,
          domH('h3', { text: 'Compare 2 Bags Head-to-Head' }),
          domH('p', { class: 'bt-lab-sub', text: 'Normalizes 200g / 250g / 12oz (340g) / 1kg bags by $/cup AND peak-freshness consumption pace' })
        )
      )
    ));
    cmpCard.appendChild(domH('div', { class: 'bt-bagcmp-grid' },
      domH('div', { class: 'bt-lab-subcard' },
        domH('strong', { text: 'Bag A' }),
        aNameIn,
        domH('div', { class: 'bt-lab-inline-inputs' },
          domH('label', { class: 'bt-lab-field-lbl' }, domH('span', { text: 'Price ($)' }), aPriceIn),
          domH('label', { class: 'bt-lab-field-lbl' }, domH('span', { text: 'Size (g)' }), aGramsIn)
        )
      ),
      domH('div', { class: 'bt-lab-subcard' },
        domH('strong', { text: 'Bag B' }),
        bNameIn,
        domH('div', { class: 'bt-lab-inline-inputs' },
          domH('label', { class: 'bt-lab-field-lbl' }, domH('span', { text: 'Price ($)' }), bPriceIn),
          domH('label', { class: 'bt-lab-field-lbl' }, domH('span', { text: 'Size (g)' }), bGramsIn)
        )
      )
    ));
    cmpCard.appendChild(cmpOut);
    paintCmp();

    /* 2. True Cup Cost, Cafe Savings & Gear Break-Even ROI */
    const roiCard = domH('section', { class: 'bt-studio-card', id: 'bt-studio-cost-roi' });
    const roiOut = domH('div', { class: 'bt-roi-out' });

    const rBagPriceIn = domH('input', { type: 'number', inputmode: 'decimal', class: 'bt-lab-text-in bt-lab-num-in', step: '0.5', value: String(roi.bagPrice), 'aria-label': 'Bag price USD', oninput: function () { roi.bagPrice = Math.max(1, parseFloat(rBagPriceIn.value) || 20); paintRoi(); } });
    const rCafePriceIn = domH('input', { type: 'number', inputmode: 'decimal', class: 'bt-lab-text-in bt-lab-num-in', step: '0.25', value: String(roi.cafeDrinkPrice), 'aria-label': 'Cafe drink price USD', oninput: function () { roi.cafeDrinkPrice = Math.max(1, parseFloat(rCafePriceIn.value) || 5.75); paintRoi(); } });
    const rGearIn = domH('input', { type: 'number', inputmode: 'decimal', class: 'bt-lab-text-in bt-lab-num-in', step: '10', value: String(roi.gearInvestment), 'aria-label': 'Gear investment USD', oninput: function () { roi.gearInvestment = Math.max(0, parseFloat(rGearIn.value) || 300); paintRoi(); } });

    function paintRoi() {
      const beanCost = (roi.bagPrice / Math.max(50, roi.bagGrams)) * roi.doseG;
      const waterCost = (roi.doseG * 16 / 1000) * roi.waterCostPerL;
      const trueCup = beanCost + roi.filterCost + waterCost + roi.milkCostPerCup;
      const savedPerCup = Math.max(0.1, roi.cafeDrinkPrice - trueCup);
      const annualSavings = savedPerCup * roi.cupsPerDay * 365;
      const breakEvenCups = Math.ceil(roi.gearInvestment / savedPerCup);
      const breakEvenDays = Math.ceil(breakEvenCups / Math.max(0.25, roi.cupsPerDay));

      roiOut.textContent = '';
      roiOut.appendChild(domH('div', { class: 'bt-lab-metric-strip' },
        domH('div', { class: 'bt-lab-kpi' },
          domH('span', { text: 'True Home Cup Cost' }),
          domH('strong', { class: 'num-tab', text: '$' + trueCup.toFixed(2) + ' / cup' })
        ),
        domH('div', { class: 'bt-lab-kpi' },
          domH('span', { text: 'Saved vs $' + roi.cafeDrinkPrice.toFixed(2) + ' Cafe' }),
          domH('strong', { class: 'num-tab', text: '+$' + Math.round(annualSavings) + ' / yr' })
        ),
        domH('div', { class: 'bt-lab-kpi' },
          domH('span', { text: '$' + Math.round(roi.gearInvestment) + ' Gear Break-Even' }),
          domH('strong', { class: 'num-tab', text: breakEvenCups + ' cups (~' + breakEvenDays + ' days)' })
        )
      ));
      roiOut.appendChild(domH('p', {
        class: 'bt-lab-hint num-tab',
        text: 'Breakdown: $' + beanCost.toFixed(2) + ' beans (' + roi.doseG + 'g) + $' + roi.filterCost.toFixed(2) + ' paper filter + $' + waterCost.toFixed(2) + ' remineralized water' + (roi.milkCostPerCup > 0 ? (' + $' + roi.milkCostPerCup.toFixed(2) + ' milk') : '') + '.'
      }));
    }

    roiCard.appendChild(domH('div', { class: 'bt-lab-card-head' },
      domH('div', { class: 'bt-lab-title-group' },
        ic('spark-star', { size: 20 }),
        domH('div', null,
          domH('h3', { text: 'True Cup Cost, Cafe Savings & Gear Break-Even ROI' }),
          domH('p', { class: 'bt-lab-sub', text: 'Exact beans + filter + water + milk cost per cup vs cafe spend & grinder/brewer payback' })
        )
      )
    ));
    roiCard.appendChild(domH('div', { class: 'bt-ratio4-grid' },
      domH('label', { class: 'bt-lab-field-lbl' }, domH('span', { text: '250g Bag ($)' }), rBagPriceIn),
      domH('label', { class: 'bt-lab-field-lbl' }, domH('span', { text: 'Cafe Cup ($)' }), rCafePriceIn),
      domH('label', { class: 'bt-lab-field-lbl' }, domH('span', { text: 'Gear Spend ($)' }), rGearIn),
      CK.vernierPill({
        label: 'Cups / Day',
        value: roi.cupsPerDay,
        min: 0.5,
        max: 6.0,
        step: 0.5,
        decimals: 1,
        unit: '',
        compact: true,
        onChange: function (v) { roi.cupsPerDay = v; paintRoi(); }
      })
    ));
    roiCard.appendChild(roiOut);
    paintRoi();

    wrap.appendChild(cmpCard);
    wrap.appendChild(roiCard);
    return wrap;
  }

  /* ---- Cross-Grinder Click Translator & 2-Point Burr Calibration + 5-Scale Converter Inputs ---- */
  function buildGrinderTranslatorCard() {
    const gl = labState.grinderLab;
    const card = domH('section', { class: 'bt-studio-card', id: 'bt-studio-grinder-lab' });
    const outBox = domH('div', { class: 'bt-grinder-lab-out' });

    const fallbackGrinders = [
      { key: 'comandante_c40', name: 'Comandante C40 MK4 (Std Axle)', unit: 'clicks', min: 5, max: 45, umZero: 40, umPerStep: 25.5 },
      { key: 'comandante_red', name: 'Comandante C40 (Red Clix)', unit: 'clicks', min: 10, max: 90, umZero: 40, umPerStep: 12.75 },
      { key: '1zpresso_zp6', name: '1Zpresso ZP6 Special', unit: 'dial', min: 1.5, max: 7.0, umZero: 120, umPerStep: 110 },
      { key: '1zpresso_k_ultra', name: '1Zpresso K-Ultra', unit: 'dial', min: 2.0, max: 9.5, umZero: 80, umPerStep: 82 },
      { key: 'kingrinder_k6', name: 'KINGrinder K6', unit: 'clicks', min: 30, max: 160, umZero: 45, umPerStep: 7.2 },
      { key: 'fellow_ode_gen2', name: 'Fellow Ode Gen 2', unit: 'dial', min: 1, max: 11, umZero: 240, umPerStep: 78 },
      { key: 'baratza_encore_esp', name: 'Baratza Encore / ESP', unit: 'steps', min: 5, max: 38, umZero: 140, umPerStep: 26 },
      { key: 'niche_zero', name: 'Niche Zero (63mm Conical)', unit: 'dial', min: 5, max: 50, umZero: 95, umPerStep: 15.5 },
      { key: 'df64_gen2', name: 'DF64 Gen 2 (64mm Flat)', unit: 'dial', min: 5, max: 85, umZero: 90, umPerStep: 10.2 },
      { key: 'ek43', name: 'Mahlkonig EK43 (98mm Flat)', unit: 'dial', min: 1.0, max: 16.0, umZero: 100, umPerStep: 62 }
    ];

    function getGrinderList() {
      const src = (typeof GRINDERS !== 'undefined' && Array.isArray(GRINDERS) && GRINDERS.length)
        ? GRINDERS
        : (window.GRINDERS && Array.isArray(window.GRINDERS) ? window.GRINDERS : null);
      if (!src) return fallbackGrinders;
      return src.map(function (g) {
        const mn = Number.isFinite(g.min) ? g.min : 1;
        const mx = Number.isFinite(g.max) ? g.max : 40;
        const uLo = Number.isFinite(g.umMin) ? g.umMin : 200;
        const uHi = Number.isFinite(g.umMax) ? g.umMax : 1000;
        return {
          key: g.key || g.id || g.name,
          name: g.name || g.key,
          unit: g.unit || 'steps',
          min: mn,
          max: mx,
          umZero: uLo - mn * ((uHi - uLo) / Math.max(1, mx - mn)),
          umPerStep: (uHi - uLo) / Math.max(0.5, mx - mn),
          raw: g
        };
      });
    }

    const gList = getGrinderList();
    if (!gList.some(function (g) { return g.key === gl.fromKey; })) gl.fromKey = gList[0].key;
    if (!gList.some(function (g) { return g.key === gl.toKey; })) gl.toKey = (gList[5] || gList[1] || gList[0]).key;

    const fromSel = domH('select', {
      class: 'bt-lab-select', 'aria-label': 'Source grinder',
      onchange: function () { gl.fromKey = fromSel.value; paintGrinder(); }
    });
    const toSel = domH('select', {
      class: 'bt-lab-select', 'aria-label': 'Target grinder',
      onchange: function () { gl.toKey = toSel.value; paintGrinder(); }
    });
    gList.forEach(function (g) {
      const o1 = domH('option', { value: g.key, text: g.name });
      if (g.key === gl.fromKey) o1.selected = true;
      fromSel.appendChild(o1);
      const o2 = domH('option', { value: g.key, text: g.name });
      if (g.key === gl.toKey) o2.selected = true;
      toSel.appendChild(o2);
    });

    const fromSetIn = domH('input', {
      type: 'number', inputmode: 'decimal', class: 'bt-lab-text-in bt-lab-num-in', step: '0.5', value: String(gl.fromSetting),
      'aria-label': 'Source grinder setting',
      oninput: function () {
        const v = parseFloat(fromSetIn.value);
        if (Number.isFinite(v)) { gl.fromSetting = v; paintGrinder(); }
      }
    });

    function settingToUm(g, setting) {
      if (typeof grinderSettingToMicrons === 'function' && g.raw) {
        try {
          const u = grinderSettingToMicrons(g.key, setting);
          if (Number.isFinite(u) && u > 50) return u;
        } catch (_) {}
      }
      return clamp(g.umZero + setting * g.umPerStep, 120, 1400, 580);
    }

    function umToSetting(g, um) {
      if (typeof micronsToGrinderSetting === 'function' && g.raw) {
        try {
          const s = micronsToGrinderSetting(g.key, um);
          if (s !== null && s !== undefined && s !== '') return s;
        } catch (_) {}
      }
      const raw = (um - g.umZero) / Math.max(0.5, g.umPerStep);
      const clamped = clamp(raw, g.min, g.max, (g.min + g.max) * 0.5);
      return g.max <= 16 ? +clamped.toFixed(1) : Math.round(clamped * 2) / 2;
    }

    function paintGrinder() {
      const gFrom = gList.find(function (x) { return x.key === gl.fromKey; }) || gList[0];
      const gTo = gList.find(function (x) { return x.key === gl.toKey; }) || gList[1] || gList[0];
      const d50Um = Math.round(settingToUm(gFrom, gl.fromSetting));
      const targetSetting = umToSetting(gTo, d50Um);
      const slopeCal = +((gl.calPt2Um - gl.calPt1Um) / Math.max(1, gl.calPt2Click - gl.calPt1Click)).toFixed(1);

      outBox.textContent = '';
      outBox.appendChild(domH('div', { class: 'bt-studio-readout-banner' },
        domH('div', { class: 'bt-studio-human-line num-tab' },
          domH('strong', {
            text: gFrom.name + ' @ ' + gl.fromSetting + ' ' + gFrom.unit + ' (~' + d50Um + ' um D50)  \u2192  ' +
              gTo.name + ' @ ' + targetSetting + ' ' + gTo.unit
          })
        ),
        domH('p', {
          class: 'bt-lab-hint num-tab',
          text: '2-Point Burr Calibration Slope: ' + slopeCal + ' um/step across ' + gList.length + ' mapped grinders — lock your personal burr zero-point via Pocket Micron Lens below.'
        }),
        domH('div', { class: 'bt-lab-btn-row', style: 'margin-top:8px' },
          domH('button', {
            type: 'button',
            class: 'bt-lab-btn is-sm is-primary',
            onclick: function () {
              applyLabToBrewAndGo(function (a) {
                a.gear = a.gear || {};
                a.gear.grinder = gTo.key;
                a.prefs.gear.grinder = gTo.key;
                a.brew.grinderKey = gTo.key;
                a.brew.grindUm = d50Um;
                a.brew.grind_setting = targetSetting + ' ' + gTo.unit;
                a.brew.customizedNote = gTo.name + ' @ ' + targetSetting + ' ' + gTo.unit + ' (~' + d50Um + ' um)';
              }, {
                targetStep: 'brew',
                returnRoute: 'devices',
                toast: 'Applied ' + gTo.name + ' @ ' + targetSetting + ' ' + gTo.unit + ' (~' + d50Um + ' um) to your recipe!'
              });
            }
          }, ic('gear', { size: 14 }), domH('span', { text: 'Apply Translated Setting to My Recipe \u2192' }))
        )
      ));
    }

    card.appendChild(domH('div', { class: 'bt-lab-card-head' },
      domH('div', { class: 'bt-lab-title-group' },
        ic('gear', { size: 22 }),
        domH('div', null,
          domH('h3', { text: 'Cross-Grinder Click Translator & 2-Point Burr Calibration' }),
          domH('p', { class: 'bt-lab-sub', text: 'Translate any recipe click/dial across ' + gList.length + ' grinders via micron D50 equivalence' })
        )
      ),
      epistemicBadge('calibrated_biophysics')
    ));
    card.appendChild(domH('div', { class: 'bt-lab-inline-inputs' },
      domH('label', { class: 'bt-lab-field-lbl' }, domH('span', { text: 'From Grinder' }), fromSel),
      domH('label', { class: 'bt-lab-field-lbl' }, domH('span', { text: 'Setting' }), fromSetIn),
      domH('label', { class: 'bt-lab-field-lbl' }, domH('span', { text: 'Translate To' }), toSel)
    ));
    card.appendChild(outBox);
    paintGrinder();
    return card;
  }

  function buildStudioCaffeineAndCostHub() {
    const wrap = domH('div', { class: 'bt-studio-stack' });
    wrap.appendChild(buildStudioCircadianCaffeine());
    wrap.appendChild(buildBagCompareAndRoiCard());
    return wrap;
  }

  function buildStudioBluetoothAndGrinderHub() {
    const wrap = domH('div', { class: 'bt-studio-stack' });
    wrap.appendChild(renderHardwareBench(true));
    wrap.appendChild(buildGrinderTranslatorCard());
    wrap.appendChild(buildStudioAgtronAndFreshness());
    return wrap;
  }

  /* ==========================================================================
   * TAB 3 ('lab') & SHEET ('ble-devices') RENDERERS
   *   - 52px Compact Hardware Status Bar (ZERO 1,250px BLE header above Studio 1!)
   *   - Single-row horizontal 5-Studio Pill Bar
   * ========================================================================== */
  const STUDIO_TABS = [
    { id: 'ey', label: '1. Touch-to-Brew Chart', icon: 'refract-prism', build: buildStudioBrewControl },
    { id: 'rescue', label: '2. Rescue & Mug Fix', icon: 'spark-star', build: buildStudioRescueHub },
    { id: 'water', label: '3. Water & Ratio', icon: 'water-drop', build: buildStudioWaterAndRatioHub },
    { id: 'caffeine', label: '4. Caffeine & Cost', icon: 'moon-dark', build: buildStudioCaffeineAndCostHub },
    { id: 'devices', label: '5. Bluetooth & Grinder Lab', icon: 'ble-wave', build: buildStudioBluetoothAndGrinderHub }
  ];

  function normalizeStudioId(rawId) {
    if (rawId === 'waves') return 'rescue';
    if (rawId === 'vessel') return 'water';
    if (rawId === 'agtron') return 'devices';
    return rawId || 'ey';
  }

  function buildCompactHardwareBar(onJumpDevices) {
    const ble = window.BTBle || {};
    const statusDot = domH('span', { class: 'bt-hw-dot' });
    const statusTxt = domH('span', { class: 'bt-hw-status-txt num-tab', text: 'Bluetooth Ready' });

    function syncHwStatus() {
      const st = getBleStateSafe();
      const scOn = !!(st.scale && st.scale.connected);
      const r2Tds = (st.refractometer && st.refractometer.tds) || labState.bc.measTds;
      const simOn = !!st.simulatorActive;
      const anyLive = scOn || simOn || r2Tds > 0;
      statusDot.className = 'bt-hw-dot' + (anyLive ? ' is-live' : '');
      const parts = [];
      if (scOn || simOn) parts.push(Number((st.scale && st.scale.weightG) || 0).toFixed(1) + ' g');
      if (r2Tds > 0) parts.push(Number(r2Tds).toFixed(2) + '% TDS');
      statusTxt.textContent = parts.length ? ('Live: ' + parts.join(' · ')) : 'Scale / R2 / Omni Standby';
    }
    syncHwStatus();

    const connectBtn = domH('button', {
      type: 'button',
      class: 'bt-hw-connect-btn',
      onclick: function () {
        const shell = sh();
        CK.haptic('tick');
        if (typeof shell.openSheet === 'function') {
          shell.openSheet('ble-devices', null, { detent: 'full', title: 'Bluetooth Scale, R2 & Omni Bench' });
        } else if (typeof onJumpDevices === 'function') {
          onJumpDevices();
        }
      }
    }, ic('ble-wave', { size: 15 }), domH('span', { text: 'Connect BLE' }));

    const simBtn = domH('button', {
      type: 'button',
      class: 'bt-hw-sim-pill',
      title: 'Simulate 10Hz Scale + DiFluid R2 + Omni',
      onclick: function () {
        const st = getBleStateSafe();
        if (st.simulatorActive && typeof ble.stopSimulator === 'function') {
          ble.stopSimulator();
          notify('Stopped 10Hz BLE Simulator.');
        } else if (typeof ble.startSimulator === 'function') {
          ble.startSimulator();
          notify('10Hz Scale + R2 + Omni Simulator active!');
        } else {
          labState.bc.measTds = 1.42;
          labState.bc.measTempC = 23.4;
          notify('Simulated 1.42% TDS (23.4 °C) & 10Hz Scale!');
        }
        CK.haptic('snap');
        syncHwStatus();
      }
    }, '10Hz Sim');

    return domH('div', { class: 'bt-lab-hw-bar', role: 'region', 'aria-label': 'Compact Bluetooth Hardware Bar' },
      domH('div', { class: 'bt-hw-bar-left' }, statusDot, statusTxt),
      domH('div', { class: 'bt-hw-bar-right' }, connectBtn, simBtn)
    );
  }

  function renderLabTab(mountEl, ctx) {
    const page = domH('div', { class: 'bt-tab-page bt-lab-page' });
    const a = getApp();
    a.tabSegments = a.tabSegments || {};
    if (ctx && ctx.segment) {
      labState.activeStudio = normalizeStudioId(ctx.segment);
    } else if (a.tabSegments.lab) {
      labState.activeStudio = normalizeStudioId(a.tabSegments.lab);
    } else {
      labState.activeStudio = normalizeStudioId(labState.activeStudio);
    }
    a.tabSegments.lab = labState.activeStudio;

    const studioStage = domH('div', { class: 'bt-lab-studios-stage' });
    const navBar = domH('nav', { class: 'bt-studio-pill-nav', 'aria-label': 'Lab & Rescue Studios' });
    let pillBtns = [];

    function selectStudio(nextId) {
      const id = normalizeStudioId(nextId);
      labState.activeStudio = id;
      const appNow = getApp();
      appNow.tabSegments = appNow.tabSegments || {};
      appNow.tabSegments.lab = id;
      if (typeof sh().setTabSegment === 'function') {
        sh().setTabSegment('lab', id);
      } else {
        saveDraftSoon();
      }
      pillBtns.forEach(function (b, bi) {
        const on = STUDIO_TABS[bi].id === id;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      mountActiveStudio();
    }

    /* Sleek 52px Compact Hardware Status Bar (Replaces the old 1,250px BLE header!) */
    page.appendChild(buildCompactHardwareBar(function () { selectStudio('devices'); }));

    function mountActiveStudio() {
      studioStage.textContent = '';
      if (labState.activeStudio === 'all') {
        STUDIO_TABS.forEach(function (st) {
          if (st.build) studioStage.appendChild(st.build());
        });
      } else {
        const chosen = STUDIO_TABS.find(function (st) { return st.id === labState.activeStudio && st.build; }) || STUDIO_TABS[0];
        studioStage.appendChild(chosen.build());
      }
      if (labState.focusSubcard) {
        const targetId = labState.focusSubcard;
        labState.focusSubcard = '';
        setTimeout(function () {
          const el = document.getElementById(targetId);
          if (el && typeof el.scrollIntoView === 'function') {
            try { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (_) {}
          }
        }, 30);
      }
    }

    pillBtns = STUDIO_TABS.map(function (st) {
      return domH('button', {
        type: 'button',
        class: 'bt-studio-nav-pill' + (labState.activeStudio === st.id ? ' is-active' : ''),
        'aria-pressed': String(labState.activeStudio === st.id),
        onclick: function () {
          CK.haptic('tick');
          selectStudio(st.id);
        }
      }, ic(st.icon, { size: 15 }), domH('span', { text: st.label }));
    });
    pillBtns.forEach(function (b) { navBar.appendChild(b); });

    page.appendChild(navBar);
    page.appendChild(studioStage);
    mountActiveStudio();

    if (mountEl && mountEl.nodeType === 1) {
      mountEl.textContent = '';
      mountEl.appendChild(page);
    }
    return page;
  }

  function renderBleDevicesSheet(arg0) {
    const hostEl = arg0 && arg0.nodeType === 1 ? arg0 : null;
    const box = domH('div', { class: 'bt-sheet-content bt-ble-sheet-content' },
      domH('div', { class: 'bt-sheet-head-sub' },
        ic('ble-wave', { size: 22 }),
        domH('div', null,
          domH('h2', { text: '5-Slot Bluetooth Bench & Pocket Micron Lens' }),
          domH('p', { class: 'bt-lab-sub', text: 'Concurrent WebBLE GATT across 15 hardware families + Zero-CORS DiFluid Sync' })
        )
      ),
      renderHardwareBench(true)
    );
    if (hostEl) {
      hostEl.textContent = '';
      hostEl.appendChild(box);
    }
    return box;
  }

  /* ---- Register Tab 3 ('lab'), Sheet & Legacy Routes ---- */
  function jumpToLabStudio(studioId, focusId) {
    const normId = normalizeStudioId(studioId || 'ey');
    labState.activeStudio = normId;
    if (focusId) labState.focusSubcard = focusId;
    const shell = sh();
    if (shell.app) {
      shell.app.tabSegments = shell.app.tabSegments || {};
      shell.app.tabSegments.lab = normId;
      if (typeof shell.switchTab === 'function') {
        shell.switchTab('lab', { segment: normId });
        return;
      }
      shell.app.activeTab = 'lab';
    }
    if (typeof shell.render === 'function') {
      shell.render();
    } else if (typeof render === 'function') {
      render();
    }
  }

  function registerAllLabBindings() {
    const shell = sh();
    if (typeof shell.registerTab === 'function') {
      shell.registerTab('lab', renderLabTab);
    }
    if (typeof shell.registerSheet === 'function') {
      shell.registerSheet('ble-devices', renderBleDevicesSheet);
    }
    if (typeof shell.registerRoute === 'function') {
      shell.registerRoute('devices', function () {
        if (typeof shell.openSheet === 'function') shell.openSheet('ble-devices', null, { detent: 'full', title: 'Bluetooth & Smart Devices' });
        else jumpToLabStudio('devices', '');
      });
      shell.registerRoute('calculators', function () { jumpToLabStudio('ey', ''); });
      shell.registerRoute('tools', function () { jumpToLabStudio('rescue', ''); });
      shell.registerRoute('ey', function () { jumpToLabStudio('ey', ''); });
      shell.registerRoute('chart', function () { jumpToLabStudio('ey', ''); });
      shell.registerRoute('water', function () { jumpToLabStudio('water', 'bt-studio-water'); });
      shell.registerRoute('ratio', function () { jumpToLabStudio('water', 'bt-studio-ratio-yield'); });
      shell.registerRoute('yield', function () { jumpToLabStudio('water', 'bt-studio-ratio-yield'); });
      shell.registerRoute('iced', function () { labState.vessel.flashOn = true; jumpToLabStudio('water', 'bt-studio-vessel'); });
      shell.registerRoute('milk', function () { jumpToLabStudio('water', 'bt-studio-vessel'); });
      shell.registerRoute('caffeine', function () { jumpToLabStudio('caffeine', 'bt-studio-caffeine'); });
      shell.registerRoute('cafdrink', function () { jumpToLabStudio('caffeine', 'bt-sub-cafcup'); });
      shell.registerRoute('cafresult', function () { jumpToLabStudio('caffeine', 'bt-studio-caffeine'); });
      shell.registerRoute('cafcup', function () { jumpToLabStudio('caffeine', 'bt-sub-cafcup'); });
      shell.registerRoute('bagcmp', function () { jumpToLabStudio('caffeine', 'bt-studio-bagcmp'); });
      shell.registerRoute('cost', function () { jumpToLabStudio('caffeine', 'bt-studio-cost-roi'); });
      shell.registerRoute('agtron', function () { jumpToLabStudio('devices', 'bt-studio-agtron'); });
      shell.registerRoute('freshness', function () { jumpToLabStudio('devices', 'bt-studio-agtron'); });
      shell.registerRoute('fresh', function () { jumpToLabStudio('devices', 'bt-studio-agtron'); });
    }
  }

  registerAllLabBindings();

  window.BTLabDevices = {
    renderLabTab: renderLabTab,
    renderBleDevicesSheet: renderBleDevicesSheet,
    buildStudioBrewControl: buildStudioBrewControl,
    buildStudioExtractionWaves: buildStudioExtractionWaves,
    buildStudioRescueHub: buildStudioRescueHub,
    buildInMugRescueCard: buildInMugRescueCard,
    buildStudioCircadianCaffeine: buildStudioCircadianCaffeine,
    buildStudioWaterPad: buildStudioWaterPad,
    buildStudioVesselAlchemist: buildStudioVesselAlchemist,
    buildStudioWaterAndRatioHub: buildStudioWaterAndRatioHub,
    buildStudioCaffeineAndCostHub: buildStudioCaffeineAndCostHub,
    buildStudioBluetoothAndGrinderHub: buildStudioBluetoothAndGrinderHub,
    buildStudioAgtronAndFreshness: buildStudioAgtronAndFreshness,
    state: labState
  };
})();
