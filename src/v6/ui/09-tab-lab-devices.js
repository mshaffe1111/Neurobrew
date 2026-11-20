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
      prefs: { tempUnit: 'F', scienceLens: 'hybrid', immersionBasis: 'liang', toolModes: {}, water: { gh: 70, kh: 35, mgShare: 0.65 }, gear: {} },
      gear: { grinder: 'comandante-c40', ble: { rememberedDevices: [] } }
    };
    return window.__btFallbackApp;
  }

  function getPrefTempUnit() {
    const a = getApp();
    return (a && a.prefs && a.prefs.tempUnit === 'C') ? 'C' : 'F';
  }

  function cToF(c) {
    return Number(c) * 9 / 5 + 32;
  }

  function fmtTempPref(c, dec) {
    const d = dec != null ? dec : 1;
    return getPrefTempUnit() === 'F' ? (cToF(c).toFixed(d) + ' °F') : (Number(c).toFixed(d) + ' °C');
  }

  function fmtGrinderUnit(unit, val) {
    const u = String(unit || 'steps').trim();
    const isOne = Math.abs(Number(val) - 1) < 1e-6;
    if (u === 'click' || u === 'clicks') return isOne ? 'click' : 'clicks';
    if (u === 'step' || u === 'steps') return isOne ? 'step' : 'steps';
    if (u === 'mark' || u === 'marks') return isOne ? 'mark' : 'marks';
    if (u === 'setting' || u === 'settings') return isOne ? 'setting' : 'settings';
    return u;
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

  function syncBrewGrindFields(a, nextUm, opts) {
    if (!a) return;
    a.brew = a.brew || {};
    const o = opts || {};
    const um = Math.round(clamp(nextUm != null ? nextUm : a.brew.grindUm, 55, 1500, 550));
    a.brew.grindUm = um;
    a.brew.grind_um = um;
    const rawGKey = o.grinderKey
      || a.brew.grinderKey
      || (a.gear && (a.gear.grinder || a.gear.grinderKey))
      || (a.prefs && a.prefs.gear && (a.prefs.gear.grinder || a.prefs.gear.grinderKey))
      || 'comandante-c40';
    const gKey = String(rawGKey).trim().toLowerCase().replace(/_/g, '-');
    a.brew.grinderKey = gKey;
    const methodKey = String(o.methodKey || a.brew.method || 'v60').trim().toLowerCase();
    const pmc = a.prefs && a.prefs.pocketMicronCalib;
    const pmcValid = pmc && (Number.isFinite(+pmc.d0OffsetUm) || Number.isFinite(+pmc.slopeM)) &&
      (!pmc.grinderKey || String(pmc.grinderKey).trim().toLowerCase().replace(/_/g, '-') === gKey);
    const calib = pmcValid ? pmc : ((a.prefs && a.prefs.calib) || null);
    let settingTxt = o.overrideSetting ? String(o.overrideSetting).trim() : '';
    if (!settingTxt && window.BTCoreV6 && window.BTCoreV6.psd && typeof window.BTCoreV6.psd.mapMicronsToGrinder === 'function') {
      try {
        const mapped = window.BTCoreV6.psd.mapMicronsToGrinder(um, gKey, calib, methodKey);
        if (mapped && !mapped.incompatible) {
          settingTxt = mapped.shortDisplay || mapped.display || mapped.label || (mapped.clicks != null ? (mapped.clicks + ' ' + (mapped.unit || 'clicks')) : '');
        }
      } catch (_) {}
    }
    if (!settingTxt) {
      settingTxt = Math.max(1, Math.round(um / 27.5)) + ' clicks';
    }
    a.brew.grind_setting = settingTxt;
    return settingTxt;
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
    const prevUm = +a.brew.grindUm;
    const prevSetting = a.brew.grind_setting;
    if (typeof mutatorFn === 'function') mutatorFn(a);
    /* Enforce finite numeric invariants so zero NaN/undefined ever leaks into app.brew */
    if (!Number.isFinite(+a.brew.dose) || +a.brew.dose <= 0) a.brew.dose = 18;
    if (!Number.isFinite(+a.brew.water) || +a.brew.water <= 0) a.brew.water = 288;
    if (!Number.isFinite(+a.brew.ratio) || +a.brew.ratio <= 0) a.brew.ratio = +(a.brew.water / Math.max(1, a.brew.dose)).toFixed(1);
    if (Number.isFinite(+a.brew.tempC) && +a.brew.tempC > 0) {
      a.brew.tempF = Math.round(+a.brew.tempC * 9 / 5 + 32);
    }
    if (Number.isFinite(+a.brew.grindUm) && +a.brew.grindUm > 0) {
      if (+a.brew.grindUm !== prevUm || a.brew.grind_um !== +a.brew.grindUm || !a.brew.grind_setting) {
        const keepExplicit = a.brew.grind_setting && a.brew.grind_setting !== prevSetting ? a.brew.grind_setting : '';
        syncBrewGrindFields(a, +a.brew.grindUm, { overrideSetting: keepExplicit });
      }
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
      verified_physics: { txt: 'Verified Science', cls: 'is-verified', icon: 'check-seal' },
      calibrated_biophysics: { txt: 'Active Research', cls: 'is-research', icon: 'xray-loupe' },
      craft_convention: { txt: 'Craft Best Practice', cls: 'is-craft', icon: 'spark-star' },
      myth_debunked: { txt: 'Myth Debunked', cls: 'is-myth', icon: 'close-x' }
    };
    const meta = map[tierKey] || map.verified_physics;
    const cleanTxt = String(labelOverride || meta.txt).replace(/^\s*\[|\]\s*$/g, '');
    return domH('span', { class: 'bt-epistemic-pill ' + meta.cls },
      ic(meta.icon, { size: 14 }),
      domH('span', { text: cleanTxt })
    );
  }

  /* ---- v7.3 Plain-English Clarity Helpers (What Box, Dynamic Takeaway, Axis Caption, Acronym Hints) ---- */
  function labAbbr(term, meaning) {
    return domH('abbr', { class: 'bt-lab-abbr', title: String(meaning || term) }, String(term || ''));
  }

  function buildWhatBox(kickerText, children) {
    const bodyNodes = Array.isArray(children) ? children : [children];
    return domH('div', { class: 'bt-lab-what-box', role: 'note' },
      domH('span', { class: 'bt-lab-what-kicker', text: kickerText || 'What this tool does' }),
      domH('p', { class: 'bt-lab-what-body' }, bodyNodes)
    );
  }

  function createTakeawayBox(id, kickerText) {
    const bodyEl = domH('span', { class: 'bt-lab-takeaway-body', text: '' });
    const box = domH('div', {
      class: 'bt-lab-takeaway',
      id: id || undefined,
      role: 'status',
      'aria-live': 'polite'
    },
      domH('span', { class: 'bt-lab-takeaway-kicker', text: kickerText || 'What this result means \u2192 ' }),
      bodyEl
    );
    return {
      el: box,
      set: function (text, tone) {
        bodyEl.textContent = String(text || '');
        const cls = 'bt-lab-takeaway' + (tone ? (' is-' + tone) : '');
        if (box.className !== cls) box.className = cls;
      }
    };
  }

  function buildAxisCaption(items, opts) {
    if (CK && typeof CK.createAxisCaptionBar === 'function') {
      return CK.createAxisCaptionBar(items, opts);
    }
    const bar = domH('div', { class: 'bt-axis-caption' });
    (Array.isArray(items) ? items : []).forEach(function (it) {
      if (!it) return;
      if (typeof it === 'string') {
        bar.appendChild(domH('span', { class: 'bt-axis-caption-item', text: it }));
      } else {
        bar.appendChild(domH('span', { class: 'bt-axis-caption-item', title: it.title || undefined },
          it.kicker ? domH('strong', { text: it.kicker + ': ' }) : null,
          String(it.text || '')
        ));
      }
    });
    return bar;
  }

  function buildStepRibbon(steps) {
    const row = domH('div', { class: 'bt-lab-step-strip', role: 'list', 'aria-label': 'Quick workflow steps' });
    (Array.isArray(steps) ? steps : []).forEach(function (st, idx) {
      const lbl = typeof st === 'string' ? st : (st.text || st.label || '');
      const tip = (st && typeof st === 'object' && st.title) ? st.title : lbl;
      const cls = 'bt-lab-step-badge' + ((st && st.cls) ? (' ' + st.cls) : '');
      row.appendChild(domH('span', { class: cls, role: 'listitem', title: tip }, 'Step ' + (idx + 1) + ': ' + lbl));
    });
    return row;
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
    const blendedKh = fTap * khTap;
    const blendedGh = fTap * ghTap;
    const khCarb = tapBlendOn ? blendedKh : (isCitrate ? 0 : kh);
    const khCit = (!tapBlendOn && isCitrate) ? kh : 0;
    /* Exact pH 5.0 effective proton neutralization: 0.96*KH_HCO3 + 0.45*KH_cit */
    const khEffPh5 = 0.96 * khCarb + 0.45 * khCit;

    const brewTempC = clamp(cfg.brewTempC, 75, 100, 93);
    /* Temperature-coupled calcite saturation threshold (tighter at hotter boiler temps) */
    const tempScaleFactor = Math.exp(-0.022 * (brewTempC - 90));
    const scaleWarnProd = 2500 * tempScaleFactor;
    const scaleSevProd = 4500 * tempScaleFactor;
    const effGhCa = tapBlendOn ? (blendedGh * (1 - clamp(cfg.tapMgShare, 0, 1, 0.35))) : ghCa;
    const caCarbProduct = effGhCa * khCarb;

    const remGh = tapBlendOn ? Math.max(0, gh - blendedGh) : gh;
    const remKh = tapBlendOn ? Math.max(0, kh - blendedKh) : kh;
    const addGhMg = tapBlendOn ? remGh : ghMg;
    const addGhCa = tapBlendOn ? 0 : ghCa;

    const mgSaltG = (addGhMg * mgSalt.mgPerLPpm * batchL) / 1000;
    const caSaltG = (addGhCa * caSalt.mgPerLPpm * batchL) / 1000;
    const khSaltG = (remKh * khSalt.mgPerLPpm * batchL) / 1000;
    const isDiySalts = cfg.isDiyRecipe !== false;
    const clMgL = tapBlendOn
      ? (mgSalt.clPerPpm ? addGhMg * mgSalt.clPerPpm : 0)
      : (isDiySalts ? ((mgSalt.clPerPpm ? ghMg * mgSalt.clPerPpm : 0) + (caSalt.clPerPpm ? ghCa * caSalt.clPerPpm : 0)) : 0);

    const batchMl = Math.round(batchL * 1000);
    const tapMl = Math.round(fTap * batchMl);
    const roMl = Math.max(0, batchMl - tapMl);
    const tapExceedsTarget = tapBlendOn && (blendedGh > gh + 1 || khTap < kh - 1);

    return {
      gh: gh,
      kh: kh,
      ghMg: +ghMg.toFixed(1),
      ghCa: +ghCa.toFixed(1),
      addGhMg: +addGhMg.toFixed(1),
      addGhCa: +addGhCa.toFixed(1),
      remGh: +remGh.toFixed(1),
      remKh: +remKh.toFixed(1),
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
      drops10kMg: Math.round((addGhMg * batchL) / 0.5),
      drops10kCa: Math.round((addGhCa * batchL) / 0.5),
      drops10kKh: Math.round((remKh * batchL) / 0.5),
      fTap: fTap,
      tapMl: tapMl,
      roMl: roMl,
      blendedGh: +blendedGh.toFixed(1),
      blendedKh: +blendedKh.toFixed(1),
      tapExceedsTarget: tapExceedsTarget,
      epsomBoostPpm: Math.max(0, +(gh - blendedGh).toFixed(1))
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

    let iceG = cfg.flashOn ? totalWaterG * iceShare : 0;
    const minHotG = Math.min(totalWaterG, rw * doseG + 2);
    if (cfg.flashOn && totalWaterG - iceG < minHotG) {
      iceG = Math.max(0, totalWaterG - minHotG);
    }
    const hotPourG = Math.max(0, totalWaterG - iceG);
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
    const curdleFixTempC = Math.min(56, Math.max(48, steamTempC - 10));

    let guidance = '';
    if (curdleDanger) {
      guidance = 'Isoelectric Curdle Alert (pH ~' + estCupPh.toFixed(2) + ' < 5.1): Steam cooler to ' +
        curdleFixTempC + ' °C (<=56 °C) + temper 15g milk into shot first!';
    } else if (scaldDanger) {
      guidance = 'Above 68 °C irreversible beta-lactoglobulin disulfide denaturation releases cooked H2S notes and collapses gloss.';
    } else if (milkType === 'lactose_free') {
      guidance = 'Lactase-cleaved D-glucose + D-galactose delivers 3.1x natural perceived sweetness with zero added syrup.';
    } else if (milkType === 'eisbock') {
      guidance = 'WBC fractional freeze-thaw (' + Math.round(thawFrac * 100) + '% draw) concentrates milk solids ' + sweetnessMult + 'x.';
    } else if (isPlant) {
      guidance = steamTempC > 64
        ? 'Above 64 °C plant proteins risk separation and papery off-notes — keep <=56–60 °C.'
        : (milkType === 'oat'
          ? 'Barista Oat sweet spot (<=56–60 °C): silky microfoam with natural maltose sweetness and zero acid curdling.'
          : 'Plant milk sweet spot (<=56–60 °C): gentle steaming preserves clean emulsion & smooth texture.');
    } else if (inBetaLgWindow) {
      guidance = 'Silky microfoam & peak natural lactose sweetness (55–65 °C beta-Lg window).';
    } else if (steamTempC < 55) {
      guidance = 'Below 55 °C: mild warmth — steam into 55–65 °C for peak natural lactose sweetness (beta-Lg window) & silky microfoam.';
    } else {
      guidance = 'Approaching 68 °C scald limit — finish steaming inside 55–65 °C for optimal gloss & sweetness.';
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
   *   - Ideal Sample Temp: 20-25 C (68-77 F), within +-2 C of room/prism temp
   *   - Live BLE tempC Guard:
   *       18-29 C -> Green "Prism Temp Ideal (23.4 C / 74.1 F)"
   *       >29 C   -> Amber "Sample Too Warm (...) - Metal-Spoon Cool to 20-25 C"
   * -------------------------------------------------------------------------- */
  function evaluateR2SampleTemp(tempC) {
    const t = clamp(Number.isFinite(+tempC) ? +tempC : 23.4, 2, 95, 23.4);
    const tf = +(t * 9 / 5 + 32).toFixed(1);
    const isF = getPrefTempUnit() === 'F';
    const dispT = isF ? (tf.toFixed(1) + ' °F') : (t.toFixed(1) + ' °C');
    const idealRng = isF ? '68–77 °F (20–25 °C)' : '20–25 °C';
    if (t >= 18.0 && t <= 29.0) {
      return {
        state: 'ideal',
        tempC: +t.toFixed(1),
        tempF: tf,
        badgeText: 'Prism Temp Ideal (' + dispT + ')',
        detail: 'Ideal 20–25 °C (68–77 °F) window locked — zero dn/dT prism gradient or micro-drop evaporation drift.'
      };
    }
    if (t > 29.0) {
      return {
        state: 'warm',
        tempC: +t.toFixed(1),
        tempF: tf,
        badgeText: 'Sample Too Warm (' + dispT + ') — Metal-Spoon Cool to ' + idealRng + ' to Avoid Evaporation Drift',
        detail: 'Piping-hot drops (>32–60 °C) create sapphire-prism dn/dT thermal-gradient drift AND rapid 0.3 mL micro-drop evaporation that falsely inflates %TDS!'
      };
    }
    return {
      state: 'cool',
      tempC: +t.toFixed(1),
      tempF: tf,
      badgeText: 'Sample Chilled (' + dispT + ') — Equilibrate Toward ' + idealRng + ' Prism Temp',
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
    const mugG = clamp(o.mugG, 5, 900, 220);
    const symptom = o.symptom || 'bitter';
    const tds0 = clamp(o.tdsPct, 0.5, 16.0, symptom === 'weak' ? 1.05 : 1.52);
    const isEspTds = tds0 > 4.0;
    const defaultTarget = isEspTds ? 9.0 : 1.28;
    const rawTarget = (isEspTds && (!o.targetTdsPct || o.targetTdsPct < 4.0)) ? 9.0 : o.targetTdsPct;
    const tdsTarget = clamp(rawTarget, 0.7, 14.0, defaultTarget);
    const milkOk = !!o.milkAllowed;

    const naclMg = Math.max(2, Math.round(mugG * 0.20)); /* 0.020% w/v = 44 mg per 220 g mug */
    const saline20Drops = Math.max(1, Math.round(naclMg / 12)); /* 1 drop (~0.05 mL) of 20% w/v NaCl ~= 10-12 mg NaCl */
    const rawBypassG = tds0 > tdsTarget ? mugG * (tds0 / Math.max(0.4, tdsTarget) - 1) : 0;
    const bypass80CG = symptom === 'weak' ? 0 : Math.round(clamp(rawBypassG || mugG * 0.11, 0, mugG * 0.65, Math.max(2, Math.round(mugG * 0.11))));
    const warmMilk60CG = Math.round(clamp(mugG * 0.16, mugG < 40 ? 2 : 15, 90, 35));
    const bicarb5PctDrops = (symptom === 'sour' || symptom === 'sour_bitter') ? Math.max(1, Math.min(3, Math.round(mugG / 110))) : 0;
    const minBypass = mugG < 40 ? Math.max(2, Math.round(mugG * 0.12)) : 15;

    let actualBypassG = 0;
    let actualDrops = 0;
    let actualNaclMg = 0;
    let headline = '';
    let why = '';
    let nextBrewFix = '';
    if (symptom === 'bitter') {
      actualBypassG = Math.max(minBypass, bypass80CG || Math.max(minBypass, 22));
      actualDrops = saline20Drops;
      actualNaclMg = naclMg;
      headline = 'Add ' + actualBypassG + ' g hot water (80 °C) + ' + actualDrops + ' drops 20% saline (~' + actualNaclMg + ' mg salt)';
      why = isScienceXray()
        ? ('80 °C bypass lowers polyphenol concentration immediately without scalding aromatics, while ~' + actualNaclMg + ' mg Na+ selectively blocks TAS2R bitter receptors (Breslin & Beauchamp, Nature 1997) so natural sweetness pops.')
        : ('A warm splash of 80 °C water opens up heavy bitterness without cooking delicate aromas, while a tiny pinch of salt (~' + actualNaclMg + ' mg) naturally mutes bitter taste buds so caramel sweetness comes forward.');
      nextBrewFix = 'Next cup: grind 1–2 clicks coarser, drop kettle -2 °C, or pull dripper 15s earlier.';
    } else if (symptom === 'sour') {
      actualBypassG = 0;
      actualDrops = Math.max(1, saline20Drops - 1);
      actualNaclMg = Math.max(2, Math.round(naclMg * 0.7));
      headline = 'Cool cup to 55–58 °C + add ' + actualDrops + ' drops 20% saline (~' + actualNaclMg + ' mg salt)' + (milkOk ? (' or ' + warmMilk60CG + ' g 60 °C milk') : '');
      why = 'Letting the cup cool to 55–58 °C unlocks your tongue\'s natural sweetness, and a tiny touch of salt softens sharp lemony edges.' + (isScienceXray() && bicarb5PctDrops ? (' Scientist option: ' + bicarb5PctDrops + ' micro-drop(s) 5% baking soda solution neutralizes ~0.15 pH units (never exceed 3 drops or soapy sodium forms).') : '');
      nextBrewFix = 'Next cup: grind 1–2 clicks finer, raise kettle +2 °C, or extend bloom to 45s.';
    } else if (symptom === 'strong') {
      actualBypassG = Math.max(minBypass, bypass80CG || Math.round(mugG * 0.14));
      actualDrops = 0;
      actualNaclMg = 0;
      const newTds = +(tds0 * mugG / (mugG + actualBypassG)).toFixed(2);
      headline = 'Stir in ' + actualBypassG + ' g hot water at 80 °C (' + tds0.toFixed(2) + '% \u2192 ' + newTds + '% TDS)';
      why = isScienceXray()
        ? 'Pure barista bypass (M_add = M_mug * (TDS_0 / TDS_target - 1)): opens crowded flavor clarity into the sweet spot with zero extra bitterness.'
        : 'Adding clean hot water directly into your mug (barista bypass) opens up crowded flavors into the sweet spot with zero extra bitterness.';
      nextBrewFix = 'Next cup: widen brew ratio (e.g. 1:15 \u2192 1:16.5) while keeping extraction even.';
    } else if (symptom === 'sour_bitter') {
      actualBypassG = Math.max(minBypass, Math.round(mugG * 0.09));
      actualDrops = saline20Drops;
      actualNaclMg = naclMg;
      headline = 'Add ' + actualBypassG + ' g 80 °C water + ' + actualDrops + ' drops 20% saline (~' + actualNaclMg + ' mg salt)';
      why = isScienceXray()
        ? 'Sour + Bitter together means uneven channeling (fast sour channels + bitter over-extracted fines). Warm bypass + TAS2R Na+ blockade softens both edges right in the mug.'
        : 'Tasting sour and bitter together means water ran unevenly through the bed. A splash of warm water plus a tiny drop of saline softens both harsh edges right away.';
      nextBrewFix = 'Next cup: WDT/level dry bed, pour gently in center circles (<=4 g/s), and avoid high-wall agitation.';
    } else {
      actualBypassG = 0;
      actualDrops = 0;
      actualNaclMg = 0;
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
      bypass80CG: actualBypassG,
      naclMg: actualNaclMg,
      saline20Drops: actualDrops,
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
      tapMgShare: 0.40,
      isDiyRecipe: false,
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
      dialInWasteG: 18.0,
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
      fromKey: 'comandante-c40',
      toKey: 'fellow-ode-gen2',
      fromSetting: 22,
      targetUm: 580,
      calPt1Click: 15,
      calPt1Um: 420,
      calPt2Click: 28,
      calPt2Um: 760,
      calPt1Locked: false,
      calPt2Locked: false,
      calGrinderKey: '',
      useOmniOverride: false
    },

    /* PocketMicronLens state */
    micron: {
      refType: 'card', /* 'card' | 'quarter' | 'euro' */
      clickVal: 22,
      result: null
    },

    /* 5-Slot Bluetooth Bench UI & Live Omni Telemetry State */
    bleBench: {
      scaleBrand: 'auto',
      xbloomPreGround: true,
      diagOpen: false,
      lastScaleBtn: '',
      lastScaleBtnAtMs: 0,
      localRxCount: 0,
      localLastHex: '',
      localLastPacketAtMs: 0
    },
    omniLive: {
      beanAgtron: null,
      groundAgtron: null,
      agtron: null,
      roastDelta: null,
      suggestedRoast: '',
      d10Um: null,
      d50Um: null,
      d90Um: null,
      span: null,
      finesUnder200Pct: null,
      bins: [],
      updatedAtMs: 0
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

  function setTextIfChanged(el, nextStr) {
    if (!el) return;
    const s = String(nextStr == null ? '' : nextStr);
    if (el.textContent !== s) el.textContent = s;
  }

  function setClassIfChanged(el, nextCls) {
    if (!el) return;
    if (el.className !== nextCls) el.className = nextCls;
  }

  function formatBytesHex(arr, maxLen) {
    if (!arr || !arr.length) return '';
    const lim = Math.min(arr.length, maxLen || 24);
    const out = [];
    for (let i = 0; i < lim; i++) {
      out.push((arr[i] & 0xFF).toString(16).toUpperCase().padStart(2, '0'));
    }
    return out.join(' ') + (arr.length > lim ? ' ...' : '');
  }

  function shortGattUuid(u) {
    if (!u) return '';
    const s = String(u).toLowerCase();
    const m = s.match(/^0000([0-9a-f]{4})-0000-1000-8000-00805f9b34fb$/);
    if (m) return '0x' + m[1].toUpperCase();
    return s.length > 14 ? (s.slice(0, 8) + '..') : s;
  }

  let _labBleEventsBound = false;
  let _labBleSubscribed = false;
  let _labLastR2ToastAt = 0;
  let _labLastR2ToastTds = -1;
  let _labLastOmniToastAt = 0;
  let _labLastOmniSig = '';
  const _labBenchHooks = [];
  const _labLiveHooks = {
    hwBar: null,
    studioEy: null,
    ratioYield: null,
    grinderLab: null,
    studioAgtron: null
  };

  function registerLabBenchHook(rootEl, refreshFn) {
    if (!rootEl || typeof refreshFn !== 'function') return;
    for (let i = _labBenchHooks.length - 1; i >= 0; i--) {
      if (!_labBenchHooks[i].root || (!_labBenchHooks[i].root.isConnected && _labBenchHooks[i].root !== rootEl)) {
        _labBenchHooks.splice(i, 1);
      }
    }
    _labBenchHooks.push({ root: rootEl, fn: refreshFn });
  }

  function notifyLabBenchHooks() {
    let anyMounted = false;
    for (let i = _labBenchHooks.length - 1; i >= 0; i--) {
      const item = _labBenchHooks[i];
      if (!item || !item.root || !item.root.isConnected) {
        _labBenchHooks.splice(i, 1);
        continue;
      }
      anyMounted = true;
      try { item.fn(); } catch (_) {}
    }
    return anyMounted;
  }

  function applyLabLiveR2Reading(detail, opts) {
    if (!detail) return false;
    const rawTds = +detail.tds;
    if (!Number.isFinite(rawTds) || rawTds <= 0 || rawTds > 35) return false;
    const tds = Math.round(rawTds * 100) / 100;
    const hasTemp = detail.tempC != null && Number.isFinite(+detail.tempC) && +detail.tempC > 0;
    const tempVal = hasTemp ? Math.round(+detail.tempC * 10) / 10 : null;
    const bxVal = (detail.brix != null && Number.isFinite(+detail.brix) && +detail.brix > 0)
      ? +detail.brix
      : brixFromTds(tds);
    const ndVal = (detail.refractiveIndex != null && Number.isFinite(+detail.refractiveIndex) && +detail.refractiveIndex > 1.3)
      ? +(+detail.refractiveIndex).toFixed(5)
      : +nd20FromBrix(bxVal).toFixed(5);

    if (tds >= 4.5 && labState.bc.mode !== 'espresso') {
      labState.bc.mode = 'espresso';
      if (labState.bc.targetTds < 6.0 || labState.bc.targetTds > 14.0) {
        labState.bc.targetTds = 9.6;
      }
    }
    labState.bc.measTds = tds;
    if (tempVal != null) labState.bc.measTempC = tempVal;
    labState.bc.measNd = ndVal;

    if (labState.ratio4) {
      labState.ratio4.tdsPct = tds;
      labState.ratio4.eyPct = +clamp((tds * labState.ratio4.mugG) / Math.max(0.5, labState.ratio4.doseG), 2, 36, labState.ratio4.eyPct).toFixed(2);
    }
    if (labState.mugRescue) {
      labState.mugRescue.tdsPct = tds;
    }

    let anyLabMounted = false;
    if (typeof _labLiveHooks.hwBar === 'function') {
      try { if (_labLiveHooks.hwBar()) anyLabMounted = true; } catch (_) {}
    }
    if (typeof _labLiveHooks.studioEy === 'function') {
      try { if (_labLiveHooks.studioEy({ fromLive: true })) anyLabMounted = true; } catch (_) {}
    }
    if (typeof _labLiveHooks.ratioYield === 'function') {
      try { if (_labLiveHooks.ratioYield({ fromLive: true })) anyLabMounted = true; } catch (_) {}
    }
    if (notifyLabBenchHooks()) anyLabMounted = true;

    const nowMs = Date.now();
    const isDup = (nowMs - _labLastR2ToastAt < 220) && Math.abs(tds - _labLastR2ToastTds) < 0.005;
    if (!isDup && !(opts && opts.silent)) {
      _labLastR2ToastAt = nowMs;
      _labLastR2ToastTds = tds;
      const a = getApp();
      const step5HandlingToast = !!(a && a.activeTab === 'brew' && a.brewStep === 'taste');
      if (anyLabMounted && !step5HandlingToast) {
        CK.haptic('snap');
        notify('DiFluid R2 Auto-Synced: ' + tds.toFixed(2) + '% TDS');
      }
    }
    return true;
  }

  function applyLabLiveOmniReading(detail, opts) {
    if (!detail || typeof detail !== 'object') return false;
    const om = labState.omniLive;
    let changedAny = false;

    const beanAg = (detail.beanAgtron != null && Number.isFinite(+detail.beanAgtron) && +detail.beanAgtron > 0) ? +(+detail.beanAgtron).toFixed(1) : null;
    const groundAg = (detail.groundAgtron != null && Number.isFinite(+detail.groundAgtron) && +detail.groundAgtron > 0) ? +(+detail.groundAgtron).toFixed(1) : null;
    const singleAg = (detail.agtron != null && Number.isFinite(+detail.agtron) && +detail.agtron > 0) ? +(+detail.agtron).toFixed(1) : null;
    const d10 = (detail.d10Um != null && Number.isFinite(+detail.d10Um) && +detail.d10Um > 0) ? +(+detail.d10Um).toFixed(1) : null;
    const d50 = (detail.d50Um != null && Number.isFinite(+detail.d50Um) && +detail.d50Um > 0) ? +(+detail.d50Um).toFixed(1) : null;
    const d90 = (detail.d90Um != null && Number.isFinite(+detail.d90Um) && +detail.d90Um > 0) ? +(+detail.d90Um).toFixed(1) : null;
    const spanVal = (detail.span != null && Number.isFinite(+detail.span) && +detail.span > 0)
      ? +(+detail.span).toFixed(2)
      : (d10 != null && d50 != null && d90 != null && d50 > 0 ? +((d90 - d10) / d50).toFixed(2) : null);
    const hasBins = Array.isArray(detail.bins) && detail.bins.length > 0;

    if (beanAg != null) {
      om.beanAgtron = beanAg;
      labState.roastFresh.beanG = clamp(beanAg, 20, 110, labState.roastFresh.beanG);
      changedAny = true;
    }
    if (groundAg != null) {
      om.groundAgtron = groundAg;
      labState.roastFresh.groundG = clamp(groundAg, 20, 110, labState.roastFresh.groundG);
      labState.wave.agtron = Math.round(labState.roastFresh.groundG);
      changedAny = true;
    } else if (singleAg != null && beanAg == null) {
      om.agtron = singleAg;
      om.groundAgtron = singleAg;
      labState.roastFresh.groundG = clamp(singleAg, 20, 110, labState.roastFresh.groundG);
      labState.wave.agtron = Math.round(labState.roastFresh.groundG);
      changedAny = true;
    }
    if (singleAg != null) om.agtron = singleAg;
    if (om.beanAgtron != null && om.groundAgtron != null) {
      om.roastDelta = +(om.groundAgtron - om.beanAgtron).toFixed(1);
    } else if (detail.roastDelta != null && Number.isFinite(+detail.roastDelta)) {
      om.roastDelta = +(+detail.roastDelta).toFixed(1);
    }
    if (detail.suggestedRoast) om.suggestedRoast = String(detail.suggestedRoast);

    if (d10 != null) { om.d10Um = d10; changedAny = true; }
    if (d50 != null) {
      om.d50Um = d50;
      labState.wave.d50Um = Math.round(clamp(d50, 120, 1400, labState.wave.d50Um));
      labState.grinderLab.targetUm = Math.round(clamp(d50, 120, 1400, labState.grinderLab.targetUm));
      changedAny = true;
    }
    if (d90 != null) { om.d90Um = d90; changedAny = true; }
    if (spanVal != null) om.span = spanVal;
    if (detail.finesUnder200Pct != null && Number.isFinite(+detail.finesUnder200Pct)) {
      om.finesUnder200Pct = +(+detail.finesUnder200Pct).toFixed(1);
    }
    if (hasBins) {
      om.bins = detail.bins.map(function (b) {
        return {
          lowerUm: Number(b.lowerUm) || 50,
          upperUm: Number(b.upperUm) || 100,
          pct: Number.isFinite(+b.pct) ? +(+b.pct).toFixed(2) : 0
        };
      });
      changedAny = true;
    }
    if (!changedAny) return false;
    om.updatedAtMs = Date.now();

    let anyLabMounted = false;
    if (typeof _labLiveHooks.hwBar === 'function') {
      try { if (_labLiveHooks.hwBar()) anyLabMounted = true; } catch (_) {}
    }
    if (typeof _labLiveHooks.grinderLab === 'function') {
      try { if (_labLiveHooks.grinderLab({ fromLive: true, d50Changed: d50 != null })) anyLabMounted = true; } catch (_) {}
    }
    if (typeof _labLiveHooks.studioAgtron === 'function') {
      try { if (_labLiveHooks.studioAgtron({ fromLive: true })) anyLabMounted = true; } catch (_) {}
    }
    if (notifyLabBenchHooks()) anyLabMounted = true;

    const sig = [om.beanAgtron || '', om.groundAgtron || '', om.d50Um || '', om.bins.length].join('|');
    const nowMs = Date.now();
    const isDup = (nowMs - _labLastOmniToastAt < 260) && sig === _labLastOmniSig;
    _labLastOmniSig = sig;
    if (!isDup && !(opts && opts.silent) && anyLabMounted) {
      _labLastOmniToastAt = nowMs;
      const a = getApp();
      const step1Handling = !!(a && a.activeTab === 'brew' && (a.brewStep === 'coffee' || a.screen === 'coffee'));
      if (!step1Handling) {
        const msgParts = [];
        if (om.groundAgtron || om.beanAgtron) {
          msgParts.push('Agtron ' + (om.beanAgtron != null ? (om.beanAgtron + '/') : '') + (om.groundAgtron != null ? om.groundAgtron : om.beanAgtron));
        }
        if (om.d50Um) msgParts.push('D50 ' + Math.round(om.d50Um) + ' \u00B5m');
        if (msgParts.length) {
          CK.haptic('snap');
          notify('DiFluid Omni Auto-Synced: ' + msgParts.join(' \u00B7 '));
        }
      }
    }
    return true;
  }

  function ensureLabBleListeners() {
    if (typeof window === 'undefined') return;
    if (!_labBleEventsBound && typeof window.addEventListener === 'function') {
      _labBleEventsBound = true;
      window.addEventListener('bt-ble-refractometer', function (ev) {
        const d = (ev && ev.detail) || {};
        labState.bleBench.localRxCount++;
        labState.bleBench.localLastPacketAtMs = Date.now();
        applyLabLiveR2Reading(d, { fromEvent: true });
      });
      window.addEventListener('bt-ble-omni', function (ev) {
        const d = (ev && ev.detail) || {};
        labState.bleBench.localRxCount++;
        labState.bleBench.localLastPacketAtMs = Date.now();
        applyLabLiveOmniReading(d, { fromEvent: true });
      });
      window.addEventListener('bt-ble-scale-button', function (ev) {
        const d = (ev && ev.detail) || {};
        labState.bleBench.localRxCount++;
        labState.bleBench.localLastPacketAtMs = Date.now();
        labState.bleBench.lastScaleBtn = String(d.action || d.button || 'pressed');
        labState.bleBench.lastScaleBtnAtMs = Date.now();
        if (typeof _labLiveHooks.hwBar === 'function') {
          try { _labLiveHooks.hwBar(); } catch (_) {}
        }
        notifyLabBenchHooks();
      });
      window.addEventListener('bt-ble-xbloom', function (ev) {
        const d = (ev && ev.detail) || {};
        labState.bleBench.localRxCount++;
        labState.bleBench.localLastPacketAtMs = Date.now();
        if (Array.isArray(d.bytes) && d.bytes.length) {
          labState.bleBench.localLastHex = formatBytesHex(d.bytes, 24);
        }
        notifyLabBenchHooks();
      });
    }
    const ble = window.BTBle;
    if (!_labBleSubscribed && ble && typeof ble.subscribe === 'function') {
      _labBleSubscribed = true;
      try {
        ble.subscribe(function (bst) {
          if (!bst) return;
          labState.bleBench.localRxCount++;
          labState.bleBench.localLastPacketAtMs = Date.now();

          const conn = !!bst.refractometerConnected;
          const liveTds = (bst.lastTds != null && +bst.lastTds > 0 && (conn || +bst.lastR2AtMs > 0))
            ? Math.round(+bst.lastTds * 100) / 100
            : 0;
          if (liveTds > 0 && Math.abs(liveTds - (+labState.bc.measTds || 0)) >= 0.005) {
            applyLabLiveR2Reading({
              tds: liveTds,
              tempC: bst.lastTempC,
              brix: bst.lastBrix,
              refractiveIndex: bst.lastRefractiveIndex
            }, { fromSubscribe: true });
            return;
          }
          if (conn && bst.lastTempC != null && Number.isFinite(+bst.lastTempC) && +bst.lastTempC > 0) {
            labState.bc.measTempC = Math.round(+bst.lastTempC * 10) / 10;
          }

          /* Sync Omni state if snapshot carries new Omni payload */
          const omSnap = bst.lastOmni || bst.omni;
          if (omSnap && (omSnap.beanAgtron > 0 || omSnap.groundAgtron > 0 || omSnap.agtron > 0 || omSnap.d50Um > 0 || (Array.isArray(omSnap.bins) && omSnap.bins.length))) {
            const nextSig = [omSnap.beanAgtron || '', omSnap.groundAgtron || omSnap.agtron || '', omSnap.d50Um || '', Array.isArray(omSnap.bins) ? omSnap.bins.length : 0].join('|');
            if (nextSig !== _labLastOmniSig) {
              applyLabLiveOmniReading(omSnap, { fromSubscribe: true });
              return;
            }
          }

          if (typeof _labLiveHooks.hwBar === 'function') {
            try { _labLiveHooks.hwBar(); } catch (_) {}
          }
          if (typeof _labLiveHooks.studioEy === 'function') {
            try { _labLiveHooks.studioEy({ metaOnly: true }); } catch (_) {}
          }
          if (typeof _labLiveHooks.ratioYield === 'function') {
            try { _labLiveHooks.ratioYield({ metaOnly: true }); } catch (_) {}
          }
          if (typeof _labLiveHooks.grinderLab === 'function') {
            try { _labLiveHooks.grinderLab({ metaOnly: true }); } catch (_) {}
          }
          if (typeof _labLiveHooks.studioAgtron === 'function') {
            try { _labLiveHooks.studioAgtron({ metaOnly: true }); } catch (_) {}
          }
          notifyLabBenchHooks();
        });
      } catch (_) {}
    }
    const initBle = getBleStateSafe();
    if (+initBle.lastTds > 0 && (!!initBle.refractometerConnected || +initBle.lastR2AtMs > 0) && !(+labState.bc.measTds > 0)) {
      applyLabLiveR2Reading({
        tds: +initBle.lastTds,
        tempC: initBle.lastTempC,
        brix: initBle.lastBrix,
        refractiveIndex: initBle.lastRefractiveIndex
      }, { silent: true });
    }
    if (initBle.lastOmni && !labState.omniLive.updatedAtMs) {
      applyLabLiveOmniReading(initBle.lastOmni, { silent: true });
    }
  }

  ensureLabBleListeners();

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
      domH('strong', { text: 'DiFluid R2 Optical Precision & Spoon-Chill Protocol (20\u201325 \u00B0C / 68\u201377 \u00B0F)' }),
      domH('ul', { class: 'bt-r2-guide-list' },
        domH('li', { text: 'Ideal Sample Temp (20\u201325 \u00B0C / 68\u201377 \u00B0F, within \u00B12 \u00B0C of room/prism): Piping-hot drops (>32\u201360 \u00B0C) cause sapphire-prism dn/dT thermal-gradient drift AND rapid 0.3 mL micro-drop flash evaporation that falsely inflates %TDS!' }),
        domH('li', { text: '15\u201320s Metal-Spoon Chill: Stir 3\u20135 mL in a room-temp metal spoon for 15\u201320s (cools 75 \u00B0C \u2192 ~24 \u00B0C with zero evaporation), zero prism with 20\u201325 \u00B0C distilled water, apply 3\u20134 drops, and wait 5\u201310s for prism lock.' }),
        domH('li', { text: 'Espresso & Immersion Syringe Filter: Pass espresso or French press/AeroPress samples through a 0.22\u20130.45 um syringe filter so suspended fines and lipids do not scatter the CCD shadowline.' })
      ),
      o.onCoolSim ? domH('div', { class: 'bt-lab-btn-row' },
        domH('button', {
          type: 'button',
          class: 'bt-lab-btn is-sm is-primary',
          onclick: function () {
            o.onCoolSim(23.4);
          }
        }, 'Simulate 15s Metal-Spoon Chill (' + fmtTempPref(23.4, 1) + ')')
      ) : null
    );

    function syncTemp(customTempC) {
      const tVal = Number.isFinite(+customTempC) ? +customTempC : getActiveR2TempC();
      const ev = evaluateR2SampleTemp(tVal);
      setClassIfChanged(badge, 'bt-r2-temp-badge is-' + ev.state);
      setTextIfChanged(badgeTxt, ev.badgeText);
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
    const micronTakeaway = createTakeawayBox('bt-micron-takeaway');

    function drawMicronCanvas(res) {
      const ctx = canvas.getContext && canvas.getContext('2d');
      if (!ctx) return;
      const W = 360;
      const H = 164;
      const isDark = typeof document !== 'undefined' && document.documentElement && document.documentElement.getAttribute('data-theme') === 'dark';
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = isDark ? '#1F1712' : '#F7F2EA';
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
        micronTakeaway.set(
          'Pick your Reference Card/Coin size, set your grinder Dial Step (' + labState.micron.clickVal + ' clicks), then snap a grounds photo or run a test scan to see your median grind size (D50 in microns) and brew-method band.',
          'info'
        );
        return;
      }
      const d50Val = Math.round(r.d50MainUm);
      const d90Val = Math.round(r.d90BoulderUm || r.d50MainUm * 1.46);
      const bandName = d50Val < 350 ? 'Fine (Espresso / Moka)' : (d50Val < 500 ? 'Medium-Fine (AeroPress / Fine Filter)' : (d50Val <= 760 ? 'Medium (V60 / Pour-Over)' : 'Medium-Coarse to Coarse (Chemex / French Press)'));
      readoutBox.appendChild(domH('div', { class: 'bt-lab-metric-strip' },
        domH('div', { class: 'bt-lab-kpi', title: 'Median particle width — half of your grounds are finer and half are coarser than this micron size' },
          domH('span', null, 'Median ', labAbbr('D50', 'Particle size median in microns (µm) — the middle grind size')),
          domH('strong', { class: 'num-tab', text: d50Val + ' \u00B5m' })
        ),
        domH('div', { class: 'bt-lab-kpi', title: 'Largest 10% of coffee chunks — high boulders can leave cups sour or hollow' },
          domH('span', null, 'Boulders ', labAbbr('D90', '90th-percentile particle width — the coarsest 10% of grounds')),
          domH('strong', { class: 'num-tab', text: d90Val + ' \u00B5m' })
        ),
        domH('div', { class: 'bt-lab-kpi', title: 'Smallest particle width a phone camera can honestly resolve without guessing' },
          domH('span', { text: 'Camera Detail Floor' }),
          domH('strong', { class: 'num-tab', text: '>=' + Math.round(r.nyquistFloorUm || 79) + ' \u00B5m' })
        )
      ));
      readoutBox.appendChild(domH('p', {
        class: 'bt-lab-hint',
        text: r.subFloorNote || 'Sub-pixel <85 um espresso fines are never faked optically; use 2 filter-range snaps to lock burr offset & slope.'
      }));
      const hasRealPhoto = !!(r.particleCount && r.particleCount > 0);
      micronTakeaway.set(
        'Step ' + labState.micron.clickVal + ' reads ~' + d50Val + ' \u00B5m D50 (' + bandName + ') with boulders up to ' + d90Val + ' \u00B5m. ' +
        (hasRealPhoto ? 'Real photo verified — tap Save Anchor to lock this exact size onto your grinder!' : 'Reference preview active — upload a real photo on white paper next to your card/coin to lock your grinder calibration.'),
        hasRealPhoto ? 'good' : 'info'
      );
      readoutBox.appendChild(domH('button', {
        type: 'button',
        class: 'bt-lab-btn is-primary',
        onclick: function () {
          if (!hasRealPhoto) {
            notify('Upload or snap a real grounds photo (>=5 particles) before saving a burr anchor.');
            return;
          }
          const a = getApp();
          a.prefs = a.prefs || {};
          const gKey = String((a.gear && a.gear.grinder) || 'comandante-c40').toLowerCase().replace(/_/g, '-');
          const d50Round = Math.round(r.d50MainUm);
          const mKey = d50Round < 320 ? 'espresso' : (d50Round > 820 ? 'french_press' : 'v60');
          if (typeof calibAdd === 'function') {
            try {
              const resCal = calibAdd(a.prefs.calib || {}, gKey, mKey, d50Round, String(labState.micron.clickVal));
              if (resCal && resCal.calib) {
                a.prefs.calib = resCal.calib;
              }
            } catch (_) {}
          }
          saveDraftSoon();
          CK.haptic('celebrate');
          notify('Saved Pocket Micron calibration (' + d50Round + ' um at step ' + labState.micron.clickVal + ').');
        }
      }, ic('check-seal', { size: 16 }), domH('span', { text: hasRealPhoto ? 'Save Anchor to My Grinder' : 'Snap Grounds Photo to Unlock Anchor Save' })));
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
      { k: 'card', lbl: 'ISO Card (85.6mm)', tip: 'Use any standard credit/debit/ID card (85.6 mm wide) next to your grounds for millimeter calibration' },
      { k: 'quarter', lbl: 'US Quarter (24.3mm)', tip: 'Use a US Quarter coin (24.26 mm diameter) beside your coffee grounds as the size reference' },
      { k: 'euro', lbl: '1 Euro (23.3mm)', tip: 'Use a 1 Euro coin (23.25 mm diameter) beside your coffee grounds as the size reference' }
    ].map(function (it) {
      return domH('button', {
        type: 'button',
        class: 'bt-lab-chip' + (labState.micron.refType === it.k ? ' is-active' : ''),
        title: it.tip,
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
      title: 'The click or dial number you ground this coffee sample at',
      value: labState.micron.clickVal,
      min: 1,
      max: 90,
      step: 1,
      unit: 'clicks',
      compact: true,
      onChange: function (v) {
        labState.micron.clickVal = v;
        if (labState.micron.result) runSyntheticOrRealAnalysis(null);
        else paintMicronReadout();
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
          domH('h3', { text: 'Pocket Micron Lens \u2014 Camera PSD & Burr-Zero Calibrator' }),
          domH('p', { class: 'bt-lab-sub', text: 'Zero-cost smartphone reference-card Sauvola PSD analyzer' })
        )
      ),
      domH('div', { class: 'bt-head-actions' }, micronHow.trigger, epistemicBadge('verified_physics'))
    ));
    wrap.appendChild(buildWhatBox('What this tool does', [
      'No laser grind analyzer? Scatter a pinch of dry grounds on white paper next to a standard wallet card or coin (',
      labAbbr('Reference Card', 'Known physical size — ISO ID-1 card 85.6 mm or coin — so the camera converts pixels into real microns'),
      ' calibration) to measure your ',
      labAbbr('D50', 'Median particle width in microns (µm) — half of grounds are finer, half are coarser'),
      ' grind size and ',
      labAbbr('PSD', 'Particle Size Distribution — the spread between fine dust and coarse boulders'),
      ' for your grinder.'
    ]));
    wrap.appendChild(buildStepRibbon([
      { text: 'Scatter grounds beside a card or coin', title: 'Spread a single non-overlapping layer of dry coffee on white paper next to your chosen reference object' },
      { text: 'Set Dial Step & snap photo', title: 'Match the click number you ground at, then tap Snap / Upload Grounds Photo' },
      { text: 'Save Anchor to your grinder', title: 'Lock the optical micron anchor into your personal grinder calibration curve' }
    ]));
    wrap.appendChild(micronHow.panel);
    wrap.appendChild(domH('div', { class: 'bt-lab-chip-row' },
      domH('span', { class: 'bt-lab-inline-lbl', text: 'Reference Object:' }),
      refPills,
      clickVernier
    ));
    wrap.appendChild(canvas);
    wrap.appendChild(buildAxisCaption([
      { kicker: 'Left Box', text: 'Known card/coin scale reference' },
      { kicker: 'Right Field', text: 'Segmented coffee particles (µm width)' }
    ]));
    wrap.appendChild(domH('div', { class: 'bt-lab-btn-row' },
      fileIn,
      domH('button', {
        type: 'button',
        class: 'bt-lab-btn is-primary',
        title: 'Take or upload a top-down photo of dry coffee grounds beside your card or coin to measure real micron size',
        onclick: function () { fileIn.click(); }
      }, ic('scan-lens', { size: 16 }), domH('span', { text: 'Snap / Upload Grounds Photo' })),
      domH('button', {
        type: 'button',
        class: 'bt-lab-btn',
        title: 'Preview how the optical particle analyzer segments grounds at your selected Dial Step (demo only; real photo required to save anchor)',
        onclick: function () { runSyntheticOrRealAnalysis(null); }
      }, ic('spark-star', { size: 16 }), domH('span', { text: 'Run Reference Calibration Scan' }))
    ));
    wrap.appendChild(readoutBox);
    wrap.appendChild(micronTakeaway.el);

    drawMicronCanvas(labState.micron.result);
    paintMicronReadout();
    return wrap;
  }

  function runBleAsync(promiseOrVal, errPrefix) {
    Promise.resolve(promiseOrVal).catch(function (err) {
      const msg = err && err.message ? String(err.message) : '';
      if (/User cancelled|NotFoundError|chooser/i.test(msg)) return;
      if (msg) notify((errPrefix ? (errPrefix + ': ') : '') + msg);
    });
  }

  function buildActiveXBloomProfileFromApp(preGroundFlag) {
    const a = getApp();
    const cf = (a && a.coffee) || {};
    const br = (a && a.brew) || {};
    const doseG = clamp(+br.dose || 15, 8, 25, 15);
    const ratioVal = clamp(+br.ratio || ((+br.water || 240) / Math.max(1, doseG)), 8, 22, 16);
    const tempC = clamp(+br.tempC || (br.tempF ? Math.round((+br.tempF - 32) * 5 / 9) : 93), 40, 99, 93);
    if (window.BTInnovate && typeof window.BTInnovate.synthesizeXBloomProfile === 'function') {
      try {
        const syn = window.BTInnovate.synthesizeXBloomProfile(
          { agtron: +cf.agtron || labState.roastFresh.groundG || 78, process: cf.process || 'washed' },
          { doseG: doseG, ratio: ratioVal, tempC: tempC, preGround: !!preGroundFlag }
        );
        if (syn && typeof syn === 'object') {
          syn.preGround = !!preGroundFlag;
          syn.wholeBean = !preGroundFlag;
          return syn;
        }
      } catch (_) {}
    }
    const totMl = Math.round(doseG * ratioVal);
    const bMl = Math.max(30, Math.round(doseG * 3));
    const p1Ml = Math.max(40, Math.round((totMl - bMl) * 0.55));
    const p2Ml = Math.max(20, totMl - bMl - p1Ml);
    return {
      doseG: doseG,
      ratio: ratioVal,
      preGround: !!preGroundFlag,
      wholeBean: !preGroundFlag,
      grindStep: preGroundFlag ? 0xFE : 48,
      pours: [
        { volumeMl: bMl, temp: tempC, pattern: 'spiral', flowRateMls: 3.5, pauseS: 30, agitation: 'none' },
        { volumeMl: p1Ml, temp: tempC, pattern: 'spiral', flowRateMls: 3.3, pauseS: 12, agitation: 'none' },
        { volumeMl: p2Ml, temp: Math.max(84, tempC - 1), pattern: 'circular', flowRateMls: 3.1, pauseS: 0, agitation: 'none' }
      ]
    };
  }

  function renderHardwareBench(fullMode, hostContext) {
    ensureLabBleListeners();
    const idPfx = hostContext === 'sheet' ? 'bt-sheet-ble-' : 'bt-bench-';
    const ble = window.BTBle || {};
    const caps = typeof ble.capabilities === 'function'
      ? ble.capabilities()
      : { webBluetooth: typeof navigator !== 'undefined' && !!navigator.bluetooth };
    const stInit = getBleStateSafe();
    const root = domH('div', {
      class: 'bt-ble-bench' + (fullMode ? ' is-full' : ''),
      'data-ble-bench-host': hostContext || 'studio',
      style: 'min-width:0;max-width:100%;box-sizing:border-box;'
    });

    const bluefyHref = 'bluefy://open?url=' + encodeURIComponent(typeof location !== 'undefined' ? location.href : 'https://mshaffe1111.github.io/Neurobrew/');

    /* 1. Zero API Key Required Banner + Platform Detection */
    const simToggleLbl = domH('span', {
      text: stInit.simulatorActive ? 'Stop 10Hz Bench Simulator' : '1-Tap 10Hz Full Bench Simulator'
    });
    const banner = domH('div', { class: 'bt-ble-zero-key-banner', style: 'min-width:0;max-width:100%;box-sizing:border-box;' },
      domH('div', { class: 'bt-ble-banner-main', style: 'min-width:0;' },
        ic('ble-wave', { size: 22 }),
        domH('div', { style: 'min-width:0;' },
          domH('strong', { text: 'Direct Web Bluetooth \u2014 Zero API Key Required' }),
          domH('p', {
            text: caps.webBluetooth
              ? '1. Power on gear  \u00B7  2. Close vendor phone app so GATT is unlocked  \u00B7  3. Tap Pair or Scan Any BLE on any slot below.'
              : 'WebKit hides Web Bluetooth here: tap Open in Bluefy on iPhone/iPad for live BLE, or launch our 10Hz Full Bench Simulator right now!'
          })
        )
      ),
      domH('div', { class: 'bt-lab-btn-row' },
        !caps.webBluetooth ? domH('a', {
          class: 'bt-lab-btn',
          href: bluefyHref
        }, ic('ble-wave', { size: 15 }), domH('span', { text: 'Open in Bluefy (iOS BLE)' })) : null,
        domH('button', {
          type: 'button',
          class: 'bt-lab-btn is-accent',
          'data-ble-action': 'toggle-simulator',
          onclick: function () {
            const curNow = getBleStateSafe();
            if (curNow.simulatorActive && typeof ble.stopSimulator === 'function') {
              ble.stopSimulator();
              notify('Stopped 10Hz BLE Bench Simulator.');
            } else if (typeof ble.startSimulator === 'function') {
              ble.startSimulator();
              notify('10Hz Full Bench Simulator active across all 5 slots!');
            } else {
              labState.bc.measTds = 1.42;
              labState.bc.measTempC = 23.4;
              labState.roastFresh.beanG = 74.2;
              labState.roastFresh.groundG = 82.0;
              notify('Simulated 1.42% TDS (R2) + 74.2/82.0 Agtron (Omni) + 10Hz Scale!');
            }
            CK.haptic('snap');
            refreshBenchLive();
          }
        }, ic('play', { size: 15 }), simToggleLbl)
      )
    );
    root.appendChild(banner);
    root.appendChild(buildWhatBox('What these 5 Bluetooth slots do', [
      'Connect real coffee sensors directly over ',
      labAbbr('BLE', 'Bluetooth Low Energy — connects straight from Chrome, Edge, or Bluefy on iOS with zero cloud login'),
      ': Slot 1 streams live pour weight & flow rate, Slot 2 logs espresso puck bar pressure, Slot 3 reads cup strength (',
      labAbbr('%TDS', 'Total Dissolved Solids — optical cup strength'),
      '), Slot 4 scans roast color (',
      labAbbr('Agtron #', 'Roast lightness number: higher = lighter roast, lower = darker'),
      ') & grind spread (',
      labAbbr('D50 / PSD', 'Median particle size in microns and Particle Size Distribution'),
      '), and Slot 5 sends target brew temps or recipes to your kettle/xBloom.'
    ]));
    root.appendChild(buildStepRibbon([
      { text: 'Turn on Bluetooth gear', title: 'Close vendor phone apps first so your scale, R2, Omni, or kettle advertises over BLE' },
      { text: 'Tap Pair on its slot', title: 'Pick your device slot below (or tap Scan Any BLE if your gear was renamed)' },
      { text: 'Live data streams to Timer & Lab', title: 'Weight, flow rate, %TDS, Agtron, and D50 auto-sync across every tab' }
    ]));

    /* Helper to construct a slot header with live dot, icon, title, device name & battery % */
    function createSlotHeader(iconName, titleText) {
      const dotEl = domH('span', { class: 'bt-hw-dot', 'data-slot-dot': '1' });
      const devBadgeEl = domH('span', {
        class: 'bt-epistemic-pill is-craft',
        'data-slot-device': '1',
        style: 'font-size:0.72rem;padding:2px 8px;max-width:100%;overflow:hidden;text-overflow:ellipsis;',
        text: 'Standby'
      });
      const batBadgeEl = domH('span', {
        class: 'bt-epistemic-pill is-verified num-tab',
        'data-slot-battery': '1',
        style: 'font-size:0.72rem;padding:2px 7px;',
        hidden: true,
        text: ''
      });
      const headEl = domH('div', {
        class: 'bt-ble-slot-top',
        style: 'justify-content:space-between;flex-wrap:wrap;gap:6px;min-width:0;'
      },
        domH('div', { style: 'display:flex;align-items:center;gap:7px;min-width:0;' },
          dotEl,
          ic(iconName, { size: 19 }),
          domH('strong', { style: 'min-width:0;', text: titleText })
        ),
        domH('div', { style: 'display:flex;align-items:center;gap:5px;flex-wrap:wrap;min-width:0;' },
          devBadgeEl,
          batBadgeEl
        )
      );
      return {
        el: headEl,
        sync: function (isLive, deviceName, batteryPct, isSim) {
          setClassIfChanged(dotEl, 'bt-hw-dot' + (isLive ? ' is-live' : ''));
          setClassIfChanged(devBadgeEl, 'bt-epistemic-pill ' + (isLive ? (isSim ? 'is-research' : 'is-verified') : 'is-craft'));
          setTextIfChanged(devBadgeEl, isLive ? (deviceName || 'Connected') : 'Standby');
          const hasBat = batteryPct != null && Number.isFinite(+batteryPct) && +batteryPct >= 0 && +batteryPct <= 100;
          batBadgeEl.hidden = !hasBat;
          if (hasBat) setTextIfChanged(batBadgeEl, Math.round(+batteryPct) + '%');
        }
      };
    }

    function createRecessedReadout(attrName) {
      const txtSpan = domH('span', {
        style: 'min-width:0;max-width:100%;overflow-wrap:anywhere;word-break:break-word;',
        text: ''
      });
      const box = domH('div', {
        class: 'bt-ble-slot-readout num-tab',
        'data-slot-readout': attrName,
        style: 'min-width:0;max-width:100%;box-sizing:border-box;'
      }, txtSpan);
      return { el: box, txt: txtSpan };
    }

    const slotsGrid = domH('div', { class: 'bt-ble-slots-grid', style: 'min-width:0;max-width:100%;' });

    /* ---- SLOT 1: Smart Scale (11+ Families + Auto-Detect All Scales) ---- */
    const scaleHead = createSlotHeader('scale-deck', '1. Smart Scale');
    const scaleReadout = createRecessedReadout('scale');
    const scaleFamilies = [
      { key: 'auto', lbl: 'Auto-Detect All Scales (15+ Models)' },
      { key: 'acaia', lbl: 'Acaia (Lunar / Pearl / Pyxis / Cinco)' },
      { key: 'difluid', lbl: 'DiFluid (Microbalance / Ti)' },
      { key: 'bookoo', lbl: 'Bookoo (Themis Mini / Ultra)' },
      { key: 'timemore', lbl: 'Timemore (Black Mirror / Nano / OSP)' },
      { key: 'decent', lbl: 'Decent Scale / Half Decent' },
      { key: 'felicita', lbl: 'Felicita (Arc / Incline / Parallel)' },
      { key: 'varia', lbl: 'Varia AKU / MHW Cube / Exagram' },
      { key: 'skale', lbl: 'Atomax Skale II' },
      { key: 'eureka', lbl: 'Eureka Precisa / Brewista / CFS-9002' },
      { key: 'hiroia', lbl: 'Hiroia Jimmy' },
      { key: 'sig', lbl: 'Standard BLE Weight Scale (0x181D)' }
    ];
    const scaleBrandSel = domH('select', {
      class: 'bt-lab-select',
      'data-ble-select': 'scale-brand',
      'aria-label': 'Smart scale family filter',
      style: 'width:100%;max-width:100%;font-size:16px;',
      onchange: function () {
        labState.bleBench.scaleBrand = scaleBrandSel.value || 'auto';
      }
    });
    scaleFamilies.forEach(function (sf) {
      const opt = domH('option', { value: sf.key, text: sf.lbl });
      if (sf.key === (labState.bleBench.scaleBrand || 'auto')) opt.selected = true;
      scaleBrandSel.appendChild(opt);
    });
    const scaleSelectWrap = domH('label', { class: 'bt-lab-field-lbl', style: 'min-width:0;max-width:100%;' },
      domH('span', { text: 'Scale Family Filter' }),
      scaleBrandSel
    );

    const scaleUnpairedRow = domH('div', { class: 'bt-lab-btn-row' },
      domH('button', {
        type: 'button',
        id: idPfx + 'scale-pair-btn',
        'data-ble-action': 'scale-pair',
        class: 'bt-lab-btn is-sm is-primary',
        onclick: function () {
          const b = window.BTBle || ble;
          if (typeof b.connectScale === 'function') {
            runBleAsync(b.connectScale({ brand: labState.bleBench.scaleBrand || 'auto' }), 'Scale pair');
          } else {
            notify('Scale pairing requires a WebBLE browser or 10Hz Simulator.');
          }
        }
      }, ic('ble-wave', { size: 14 }), domH('span', { text: 'Pair Smart Scale' })),
      domH('button', {
        type: 'button',
        id: idPfx + 'scale-scan-any-btn',
        'data-ble-action': 'scale-scan-any',
        class: 'bt-lab-btn is-sm',
        title: 'List every nearby BLE device in case your scale has a custom name',
        onclick: function () {
          const b = window.BTBle || ble;
          if (typeof b.connectScale === 'function') {
            runBleAsync(b.connectScale({ acceptAll: true, brand: labState.bleBench.scaleBrand || 'auto' }), 'Scale scan');
          } else {
            notify('Scale scanning requires a WebBLE browser.');
          }
        }
      }, 'Scan Any BLE Scale')
    );

    const scaleConnectedRow = domH('div', { class: 'bt-lab-btn-row', hidden: true },
      domH('button', {
        type: 'button',
        id: idPfx + 'scale-tare-btn',
        'data-ble-action': 'scale-tare',
        class: 'bt-lab-btn is-sm is-primary',
        onclick: function () {
          const b = window.BTBle || ble;
          if (typeof b.tare === 'function') runBleAsync(b.tare(), 'Tare');
          CK.haptic('tick');
        }
      }, 'Tare (0.0 g)'),
      domH('button', {
        type: 'button',
        id: idPfx + 'scale-timer-start-btn',
        'data-ble-action': 'scale-timer-start',
        class: 'bt-lab-btn is-sm',
        onclick: function () {
          const b = window.BTBle || ble;
          if (typeof b.startTimer === 'function') {
            runBleAsync(b.startTimer(), 'Scale timer');
          }
          try {
            window.dispatchEvent(new CustomEvent('bt-ble-scale-button', {
              detail: { slot: 'scale', packetType: 'button', action: 'timer_start', source: 'bench_ui' }
            }));
          } catch (_) {}
          CK.haptic('tick');
          notify('Scale timer started.');
        }
      }, 'Start Timer'),
      domH('button', {
        type: 'button',
        id: idPfx + 'scale-timer-reset-btn',
        'data-ble-action': 'scale-timer-reset',
        class: 'bt-lab-btn is-sm',
        onclick: function () {
          const b = window.BTBle || ble;
          if (typeof b.resetTimer === 'function') {
            runBleAsync(b.resetTimer(), 'Scale timer reset');
          }
          try {
            window.dispatchEvent(new CustomEvent('bt-ble-scale-button', {
              detail: { slot: 'scale', packetType: 'button', action: 'timer_reset', source: 'bench_ui' }
            }));
          } catch (_) {}
          CK.haptic('tick');
          notify('Scale timer reset.');
        }
      }, 'Reset Timer'),
      domH('button', {
        type: 'button',
        id: idPfx + 'scale-disconnect-btn',
        'data-ble-action': 'scale-disconnect',
        class: 'bt-lab-btn is-sm is-danger',
        onclick: function () {
          const b = window.BTBle || ble;
          const curS = getBleStateSafe();
          if (curS.scaleConnected && typeof b.disconnectScale === 'function') {
            runBleAsync(b.disconnectScale(), 'Disconnect scale');
          } else if (curS.simulatorActive && typeof b.stopSimulator === 'function') {
            b.stopSimulator();
          }
          CK.haptic('tick');
        }
      }, 'Disconnect')
    );

    const scaleCard = domH('div', {
      class: 'bt-ble-slot-card',
      'data-slot': 'scale',
      style: 'min-width:0;max-width:100%;box-sizing:border-box;'
    },
      scaleHead.el,
      domH('p', { class: 'bt-lab-sub', style: 'margin:0;font-size:0.78rem;', text: 'Streams live pour weight (g) & flow rate (g/s) straight into Step 4 Brew Timer.' }),
      scaleReadout.el,
      domH('p', {
        class: 'bt-ble-slot-fams',
        text: 'Acaia \u00B7 DiFluid Microbalance/Ti \u00B7 Bookoo Themis \u00B7 Timemore \u00B7 Felicita \u00B7 Decent \u00B7 Varia AKU \u00B7 Skale II \u00B7 Eureka/Brewista \u00B7 Hiroia \u00B7 SIG 0x181D'
      }),
      scaleSelectWrap,
      scaleUnpairedRow,
      scaleConnectedRow
    );
    slotsGrid.appendChild(scaleCard);

    /* ---- SLOT 2: Espresso Pressure (Bookoo EM / Pressensor / ESS 0x181A) ---- */
    const pressureHead = createSlotHeader('pressure-gauge', '2. Espresso Pressure');
    const pressureReadout = createRecessedReadout('pressure');
    const pressureUnpairedRow = domH('div', { class: 'bt-lab-btn-row' },
      domH('button', {
        type: 'button',
        id: idPfx + 'pressure-pair-btn',
        'data-ble-action': 'pressure-pair',
        class: 'bt-lab-btn is-sm is-primary',
        onclick: function () {
          const b = window.BTBle || ble;
          if (typeof b.connectPressure === 'function') {
            runBleAsync(b.connectPressure(), 'Pressure pair');
          } else {
            notify('Pressure pairing requires WebBLE or 10Hz Simulator.');
          }
        }
      }, ic('ble-wave', { size: 14 }), domH('span', { text: 'Pair Pressure Sensor' })),
      domH('button', {
        type: 'button',
        id: idPfx + 'pressure-scan-any-btn',
        'data-ble-action': 'pressure-scan-any',
        class: 'bt-lab-btn is-sm',
        onclick: function () {
          const b = window.BTBle || ble;
          if (typeof b.connectPressure === 'function') {
            runBleAsync(b.connectPressure({ acceptAll: true }), 'Pressure scan');
          }
        }
      }, 'Scan Any BLE')
    );
    const pressureConnectedRow = domH('div', { class: 'bt-lab-btn-row', hidden: true },
      domH('button', {
        type: 'button',
        id: idPfx + 'pressure-zero-btn',
        'data-ble-action': 'pressure-zero',
        class: 'bt-lab-btn is-sm is-primary',
        onclick: function () {
          const b = window.BTBle || ble;
          if (typeof b.zeroPressure === 'function') runBleAsync(b.zeroPressure(), 'Zero pressure');
          CK.haptic('tick');
          notify('Zeroed pressure sensor to 0.0 bar.');
        }
      }, 'Zero Sensor (0.0 bar)'),
      domH('button', {
        type: 'button',
        id: idPfx + 'pressure-disconnect-btn',
        'data-ble-action': 'pressure-disconnect',
        class: 'bt-lab-btn is-sm is-danger',
        onclick: function () {
          const b = window.BTBle || ble;
          const curS = getBleStateSafe();
          if (curS.pressureConnected && typeof b.disconnectPressure === 'function') {
            runBleAsync(b.disconnectPressure(), 'Disconnect pressure');
          } else if (curS.simulatorActive && typeof b.stopSimulator === 'function') {
            b.stopSimulator();
          }
          CK.haptic('tick');
        }
      }, 'Disconnect')
    );
    const pressureCard = domH('div', {
      class: 'bt-ble-slot-card',
      'data-slot': 'pressure',
      style: 'min-width:0;max-width:100%;box-sizing:border-box;'
    },
      pressureHead.el,
      domH('p', { class: 'bt-lab-sub', style: 'margin:0;font-size:0.78rem;', text: 'Tracks live espresso grouphead pressure (bar) during pre-infusion & pull.' }),
      pressureReadout.el,
      domH('p', {
        class: 'bt-ble-slot-fams',
        text: 'Bookoo Espresso Monitor (0x0FFF) \u00B7 Pressensor / Smart Espresso Profiler \u00B7 BLE SIG ESS (0x181A / 0x2A6D)'
      }),
      pressureUnpairedRow,
      pressureConnectedRow
    );
    slotsGrid.appendChild(pressureCard);

    /* ---- SLOT 3: Refractometer (DiFluid R2 Extract) ---- */
    const r2Head = createSlotHeader('refract-prism', '3. DiFluid R2 Extract');
    const r2Readout = createRecessedReadout('refractometer');
    const r2UnpairedRow = domH('div', { class: 'bt-lab-btn-row' },
      domH('button', {
        type: 'button',
        id: idPfx + 'r2-pair-btn',
        'data-ble-action': 'r2-pair',
        class: 'bt-lab-btn is-sm is-primary',
        onclick: function () {
          const b = window.BTBle || ble;
          if (typeof b.connectRefractometer === 'function') {
            runBleAsync(b.connectRefractometer(), 'DiFluid R2 pair');
          }
        }
      }, ic('ble-wave', { size: 14 }), domH('span', { text: 'Pair DiFluid R2' })),
      domH('button', {
        type: 'button',
        id: idPfx + 'r2-scan-any-btn',
        'data-ble-action': 'r2-scan-any',
        class: 'bt-lab-btn is-sm',
        onclick: function () {
          const b = window.BTBle || ble;
          if (typeof b.connectRefractometer === 'function') {
            runBleAsync(b.connectRefractometer({ acceptAll: true }), 'DiFluid R2 scan');
          }
        }
      }, 'Scan Any BLE'),
      domH('button', {
        type: 'button',
        'data-ble-action': 'r2-sim',
        class: 'bt-lab-btn is-sm',
        onclick: function () {
          const b = window.BTBle || ble;
          if (typeof b.simulateRefractometerRead === 'function') {
            b.simulateRefractometerRead();
          } else {
            applyLabLiveR2Reading({ tds: 1.42, tempC: 23.4, brix: brixFromTds(1.42), refractiveIndex: +nd20FromBrix(brixFromTds(1.42)).toFixed(5) });
          }
          CK.haptic('sweetSpotLock');
          refreshBenchLive();
        }
      }, 'Sim R2 (23.4 \u00B0C)')
    );
    const r2ConnectedRow = domH('div', { class: 'bt-lab-btn-row', hidden: true },
      domH('button', {
        type: 'button',
        id: idPfx + 'r2-read-btn',
        'data-ble-action': 'r2-read',
        class: 'bt-lab-btn is-sm is-primary',
        onclick: function () {
          const b = window.BTBle || ble;
          if (typeof b.triggerRefractometerRead === 'function') {
            runBleAsync(b.triggerRefractometerRead(), 'R2 read');
          }
        }
      }, 'Read R2 Now'),
      domH('button', {
        type: 'button',
        id: idPfx + 'r2-avg3-btn',
        'data-ble-action': 'r2-avg3',
        class: 'bt-lab-btn is-sm',
        onclick: function () {
          const b = window.BTBle || ble;
          if (typeof b.triggerRefractometerRead === 'function') {
            runBleAsync(b.triggerRefractometerRead({ averageCount: 3 }), 'R2 Avg x3');
          }
        }
      }, 'Avg x3'),
      domH('button', {
        type: 'button',
        id: idPfx + 'r2-disconnect-btn',
        'data-ble-action': 'r2-disconnect',
        class: 'bt-lab-btn is-sm is-danger',
        onclick: function () {
          const b = window.BTBle || ble;
          const curS = getBleStateSafe();
          if (curS.refractometerConnected && typeof b.disconnectRefractometer === 'function') {
            runBleAsync(b.disconnectRefractometer(), 'Disconnect R2');
          } else if (curS.simulatorActive && typeof b.stopSimulator === 'function') {
            b.stopSimulator();
          }
          CK.haptic('tick');
        }
      }, 'Disconnect')
    );
    const r2Card = domH('div', {
      class: 'bt-ble-slot-card',
      'data-slot': 'refractometer',
      style: 'min-width:0;max-width:100%;box-sizing:border-box;'
    },
      r2Head.el,
      domH('p', { class: 'bt-lab-sub', style: 'margin:0;font-size:0.78rem;' },
        'Reads optical cup strength (',
        labAbbr('%TDS', 'Total Dissolved Solids — percentage of dissolved coffee in your cup'),
        '), ',
        labAbbr('Brix', 'Sugar-scale optical reading from the prism'),
        ' & ',
        labAbbr('nD20', 'Refractive Index at 20 °C — raw light bending reading'),
        ' and auto-fills Studio 1 & Step 5.'
      ),
      r2Readout.el,
      domH('p', {
        class: 'bt-ble-slot-fams',
        text: 'Optical %TDS \u00B7 Refractive Index nD20 \u00B7 Prism Temp ATC \u00B7 Live Zero-Typing Auto-Sync across Lab & Tasting'
      }),
      r2UnpairedRow,
      r2ConnectedRow
    );
    slotsGrid.appendChild(r2Card);

    /* ---- SLOT 4: Roast & Particle Analyzer (DiFluid Omni) ---- */
    const omniHead = createSlotHeader('omni-nir', '4. DiFluid Omni');
    const omniReadout = createRecessedReadout('omni');
    const omniUnpairedRow = domH('div', { class: 'bt-lab-btn-row' },
      domH('button', {
        type: 'button',
        id: idPfx + 'omni-pair-btn',
        'data-ble-action': 'omni-pair',
        class: 'bt-lab-btn is-sm is-primary',
        onclick: function () {
          const b = window.BTBle || ble;
          if (typeof b.connectOmni === 'function') {
            runBleAsync(b.connectOmni(), 'DiFluid Omni pair');
          }
        }
      }, ic('ble-wave', { size: 14 }), domH('span', { text: 'Pair DiFluid Omni' })),
      domH('button', {
        type: 'button',
        id: idPfx + 'omni-scan-any-btn',
        'data-ble-action': 'omni-scan-any',
        class: 'bt-lab-btn is-sm',
        onclick: function () {
          const b = window.BTBle || ble;
          if (typeof b.connectOmni === 'function') {
            runBleAsync(b.connectOmni({ acceptAll: true }), 'DiFluid Omni scan');
          }
        }
      }, 'Scan Any BLE'),
      domH('button', {
        type: 'button',
        'data-ble-action': 'omni-sim',
        class: 'bt-lab-btn is-sm',
        onclick: function () {
          const b = window.BTBle || ble;
          if (typeof b.simulateOmniRead === 'function') {
            b.simulateOmniRead('filter_light');
          } else {
            applyLabLiveOmniReading({ beanAgtron: 68.4, groundAgtron: 76.2, agtron: 76.2, roastDelta: 7.8, d10Um: 198.4, d50Um: 565.0, d90Um: 862.6, span: 1.18 });
          }
          CK.haptic('snap');
          refreshBenchLive();
        }
      }, 'Sim Omni')
    );
    const omniConnectedRow = domH('div', { class: 'bt-lab-btn-row', hidden: true },
      domH('button', {
        type: 'button',
        id: idPfx + 'omni-agtron-btn',
        'data-ble-action': 'omni-scan-agtron',
        class: 'bt-lab-btn is-sm is-primary',
        onclick: function () {
          const b = window.BTBle || ble;
          if (typeof b.triggerOmniRead === 'function') {
            runBleAsync(b.triggerOmniRead({ mode: 'agtron' }), 'Omni roast scan');
          }
          CK.haptic('tick');
        }
      }, 'Scan Roast / Agtron'),
      domH('button', {
        type: 'button',
        id: idPfx + 'omni-psd-btn',
        'data-ble-action': 'omni-scan-psd',
        class: 'bt-lab-btn is-sm',
        onclick: function () {
          const b = window.BTBle || ble;
          if (typeof b.triggerOmniRead === 'function') {
            runBleAsync(b.triggerOmniRead({ mode: 'psd' }), 'Omni PSD scan');
          }
          CK.haptic('tick');
        }
      }, 'Scan Grind PSD'),
      domH('button', {
        type: 'button',
        id: idPfx + 'omni-disconnect-btn',
        'data-ble-action': 'omni-disconnect',
        class: 'bt-lab-btn is-sm is-danger',
        onclick: function () {
          const b = window.BTBle || ble;
          const curS = getBleStateSafe();
          if (curS.omniConnected && typeof b.disconnectOmni === 'function') {
            runBleAsync(b.disconnectOmni(), 'Disconnect Omni');
          } else if (curS.simulatorActive && typeof b.stopSimulator === 'function') {
            b.stopSimulator();
          }
          CK.haptic('tick');
        }
      }, 'Disconnect')
    );
    const omniCard = domH('div', {
      class: 'bt-ble-slot-card',
      'data-slot': 'omni',
      style: 'min-width:0;max-width:100%;box-sizing:border-box;'
    },
      omniHead.el,
      domH('p', { class: 'bt-lab-sub', style: 'margin:0;font-size:0.78rem;' },
        'Scans whole-bean & ground roast color (',
        labAbbr('Agtron #', 'Higher = lighter roast, lower = darker roast'),
        ') plus grind spread (',
        labAbbr('D50 / PSD', 'Median particle microns & Particle Size Distribution'),
        ').'
      ),
      omniReadout.el,
      domH('p', {
        class: 'bt-ble-slot-fams',
        text: 'NIR Whole-Bean & Ground Agtron \u00B7 Roast Delta \u00B7 2D Optical D10 / D50 / D90 \u00B5m & PSD Histogram'
      }),
      omniUnpairedRow,
      omniConnectedRow
    );
    slotsGrid.appendChild(omniCard);

    /* ---- SLOT 5: Smart Gooseneck Kettle (Stagg EKG+) & Smart Brewer (xBloom) ---- */
    const machineHead = createSlotHeader('kettle-gooseneck', '5. Kettle & xBloom');
    const machineReadout = createRecessedReadout('machine');

    /* 5A. Fellow Stagg EKG+ Kettle Sub-Controls */
    const kettleStatusLine = domH('div', {
      class: 'bt-lab-hint num-tab',
      'data-ble-readout': 'kettle',
      style: 'font-weight:700;color:var(--ink);min-width:0;overflow-wrap:anywhere;',
      text: ''
    });
    const kettlePushLbl = domH('span', { text: 'Push Recipe Temp' });
    const kettleUnpairedRow = domH('div', { class: 'bt-lab-btn-row' },
      domH('button', {
        type: 'button',
        id: idPfx + 'kettle-pair-btn',
        'data-ble-action': 'kettle-pair',
        class: 'bt-lab-btn is-sm is-primary',
        onclick: function () {
          const b = window.BTBle || ble;
          if (typeof b.connectKettle === 'function') {
            runBleAsync(b.connectKettle(), 'Stagg EKG+ pair');
          }
        }
      }, ic('kettle-gooseneck', { size: 14 }), domH('span', { text: 'Pair Stagg EKG+ Kettle' })),
      domH('button', {
        type: 'button',
        id: idPfx + 'kettle-scan-any-btn',
        'data-ble-action': 'kettle-scan-any',
        class: 'bt-lab-btn is-sm',
        onclick: function () {
          const b = window.BTBle || ble;
          if (typeof b.connectKettle === 'function') {
            runBleAsync(b.connectKettle({ acceptAll: true }), 'Kettle scan');
          }
        }
      }, 'Scan Any BLE')
    );
    const kettleConnectedRow = domH('div', { class: 'bt-lab-btn-row', hidden: true },
      domH('button', {
        type: 'button',
        id: idPfx + 'kettle-push-btn',
        'data-ble-action': 'kettle-push-temp',
        class: 'bt-lab-btn is-sm is-primary',
        onclick: function () {
          const b = window.BTBle || ble;
          const a = getApp();
          const br = (a && a.brew) || {};
          const targetC = Math.round(clamp(+br.tempC || (br.tempF ? ((+br.tempF - 32) * 5 / 9) : labState.wave.kettleC || 93), 40, 100, 93));
          const targetF = Math.round(targetC * 9 / 5 + 32);
          if (typeof b.setKettleTemp === 'function') {
            runBleAsync(b.setKettleTemp(targetC, true), 'Kettle target');
          }
          CK.haptic('snap');
          notify('Pushed ' + targetC + ' \u00B0C (' + targetF + ' \u00B0F) target to Stagg EKG+ Kettle.');
        }
      }, ic('kettle-gooseneck', { size: 14 }), kettlePushLbl),
      domH('button', {
        type: 'button',
        id: idPfx + 'kettle-disconnect-btn',
        'data-ble-action': 'kettle-disconnect',
        class: 'bt-lab-btn is-sm is-danger',
        onclick: function () {
          const b = window.BTBle || ble;
          const curS = getBleStateSafe();
          if (curS.kettleConnected && typeof b.disconnectKettle === 'function') {
            runBleAsync(b.disconnectKettle(), 'Disconnect kettle');
          } else if (curS.simulatorActive && typeof b.stopSimulator === 'function') {
            b.stopSimulator();
          }
          CK.haptic('tick');
        }
      }, 'Disconnect Kettle')
    );

    /* 5B. xBloom Studio / Original Sub-Controls */
    const xbloomStatusLine = domH('div', {
      class: 'bt-lab-hint num-tab',
      'data-ble-readout': 'xbloom',
      style: 'font-weight:700;color:var(--ink);min-width:0;overflow-wrap:anywhere;',
      text: ''
    });
    const xbloomSafetyLbl = domH('span', {
      text: labState.bleBench.xbloomPreGround ? 'Safety: Pre-Ground (0x44 OFF)' : 'Mode: Whole-Bean (0x41 ON)'
    });
    const xbloomSafetyChip = domH('button', {
      type: 'button',
      class: 'bt-lab-chip' + (labState.bleBench.xbloomPreGround ? ' is-active' : ''),
      'data-ble-action': 'xbloom-toggle-safety',
      'aria-pressed': String(!!labState.bleBench.xbloomPreGround),
      onclick: function () {
        labState.bleBench.xbloomPreGround = !labState.bleBench.xbloomPreGround;
        CK.haptic('tick');
        refreshBenchLive();
      }
    }, xbloomSafetyLbl);

    const xbloomUnpairedRow = domH('div', { class: 'bt-lab-btn-row' },
      domH('button', {
        type: 'button',
        id: idPfx + 'xbloom-pair-btn',
        'data-ble-action': 'xbloom-pair',
        class: 'bt-lab-btn is-sm is-primary',
        onclick: function () {
          const b = window.BTBle || ble;
          if (typeof b.connectXBloom === 'function') {
            runBleAsync(b.connectXBloom(), 'xBloom pair');
          }
        }
      }, ic('brewer-xbloom', { size: 14 }), domH('span', { text: 'Pair xBloom' })),
      domH('button', {
        type: 'button',
        id: idPfx + 'xbloom-scan-any-btn',
        'data-ble-action': 'xbloom-scan-any',
        class: 'bt-lab-btn is-sm',
        onclick: function () {
          const b = window.BTBle || ble;
          if (typeof b.connectXBloom === 'function') {
            runBleAsync(b.connectXBloom({ acceptAll: true }), 'xBloom scan');
          }
        }
      }, 'Scan Any BLE')
    );
    const xbloomConnectedRow = domH('div', { class: 'bt-lab-btn-row', hidden: true },
      domH('button', {
        type: 'button',
        id: idPfx + 'xbloom-send-btn',
        'data-ble-action': 'xbloom-send-recipe',
        class: 'bt-lab-btn is-sm is-primary',
        onclick: function () {
          const b = window.BTBle || ble;
          const isPg = !!labState.bleBench.xbloomPreGround;
          const prof = buildActiveXBloomProfileFromApp(isPg);
          if (typeof b.sendXBloomRecipe === 'function') {
            Promise.resolve(b.sendXBloomRecipe(prof, { preGround: isPg, wholeBean: !isPg })).then(function (res) {
              if (res && res.ok) {
                CK.haptic('celebrate');
                notify('Sent recipe to xBloom (' + (isPg ? 'Pre-Ground Grinder OFF' : 'Whole-Bean Grinder ON') + ').');
              }
            }).catch(function (err) {
              if (err && err.message) notify('xBloom send: ' + err.message);
            });
          }
        }
      }, ic('brewer-xbloom', { size: 14 }), domH('span', { text: 'Send Recipe to xBloom' })),
      domH('button', {
        type: 'button',
        id: idPfx + 'xbloom-disconnect-btn',
        'data-ble-action': 'xbloom-disconnect',
        class: 'bt-lab-btn is-sm is-danger',
        onclick: function () {
          const b = window.BTBle || ble;
          const curS = getBleStateSafe();
          if (curS.xbloomConnected && typeof b.disconnectXBloom === 'function') {
            runBleAsync(b.disconnectXBloom(), 'Disconnect xBloom');
          } else if (curS.simulatorActive && typeof b.stopSimulator === 'function') {
            b.stopSimulator();
          }
          CK.haptic('tick');
        }
      }, 'Disconnect xBloom')
    );

    const machineCard = domH('div', {
      class: 'bt-ble-slot-card bt-lab-ble-wide',
      'data-slot': 'machine',
      style: 'min-width:0;max-width:100%;box-sizing:border-box;'
    },
      machineHead.el,
      domH('p', { class: 'bt-lab-sub', style: 'margin:0;font-size:0.78rem;', text: 'Pushes your active recipe target water temp to Fellow Stagg EKG+ or sends the full pour profile to xBloom.' }),
      machineReadout.el,
      domH('div', {
        style: 'display:flex;flex-direction:column;gap:6px;padding:8px 10px;border-radius:10px;background:var(--bg-subtle, #F2EAE0);min-width:0;max-width:100%;box-sizing:border-box;'
      },
        kettleStatusLine,
        kettleUnpairedRow,
        kettleConnectedRow
      ),
      domH('div', {
        style: 'display:flex;flex-direction:column;gap:6px;padding:8px 10px;border-radius:10px;background:var(--bg-subtle, #F2EAE0);min-width:0;max-width:100%;box-sizing:border-box;'
      },
        xbloomStatusLine,
        domH('div', { class: 'bt-lab-chip-row' }, xbloomSafetyChip),
        xbloomUnpairedRow,
        xbloomConnectedRow
      )
    );
    slotsGrid.appendChild(machineCard);
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

    if (fullMode) {
      /* 3. Remembered Gear Auto-Reconnect & Workflow Tool-Mode Pills */
      const remList = (getApp().gear && getApp().gear.ble && getApp().gear.ble.rememberedDevices) ||
        (getApp().prefs && getApp().prefs.gear && getApp().prefs.gear.ble && getApp().prefs.gear.ble.rememberedDevices) || [];

      const remHintEl = domH('p', {
        class: 'bt-lab-hint',
        text: remList.length
          ? ('Remembered devices (' + remList.length + '): ' + remList.map(function (d) { return d.name || d.id; }).join(', '))
          : 'Paired scales, refractometers, and analyzers appear here for silent 0-popup getDevices() reconnection.'
      });

      const remCard = domH('div', { class: 'bt-lab-subcard', style: 'min-width:0;max-width:100%;box-sizing:border-box;' },
        domH('div', { class: 'bt-lab-card-head' },
          domH('div', { class: 'bt-lab-title-group' },
            ic('check-seal', { size: 18 }),
            domH('strong', { text: 'Remembered Bluetooth Gear & Workflow Modes' })
          ),
          domH('button', {
            type: 'button',
            class: 'bt-lab-btn is-sm',
            onclick: function () {
              const b = window.BTBle || ble;
              if (typeof b.autoReconnectRemembered === 'function') runBleAsync(b.autoReconnectRemembered(), 'Auto-reconnect');
              notify('Scanning remembered WebBLE permissions via getDevices()...');
            }
          }, 'Auto-Reconnect Remembered')
        ),
        remHintEl
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
          if (rec.tds) applyLabLiveR2Reading({ tds: +rec.tds, tempC: rec.tempC || 23.4 }, { silent: true });
          if (rec.beanAgtron || rec.groundAgtron || rec.d50Um) applyLabLiveOmniReading(rec, { silent: true });
          dfMsg.textContent = 'Imported ' + parsed.records.length + ' DiFluid record(s) into Lab Studios!';
        } else if (parsed && (parsed.latestR2 || parsed.latestOmni || (parsed.totalCount && parsed.totalCount > 0))) {
          if (parsed.latestR2 && parsed.latestR2.tds) {
            applyLabLiveR2Reading(parsed.latestR2, { silent: true });
          } else if (Array.isArray(parsed.r2) && parsed.r2.length && parsed.r2[0].tds) {
            applyLabLiveR2Reading(parsed.r2[0], { silent: true });
          }
          if (parsed.latestOmni) {
            applyLabLiveOmniReading(parsed.latestOmni, { silent: true });
          } else if (Array.isArray(parsed.omni) && parsed.omni.length) {
            applyLabLiveOmniReading(parsed.omni[0], { silent: true });
          }
          dfMsg.textContent = 'Imported ' + (parsed.totalCount || 1) + ' DiFluid record(s) into Lab Studios!';
        } else {
          const tdsMatch = txt.match(/\bTDS\s*[:=]?\s*([0-9]{1,2}(?:\.[0-9]{1,3})?)\s*%?/i)
            || txt.match(/([0-9]{1,2}\.[0-9]{1,3})\s*(?:%\s*(?:TDS)?|TDS\b)/i);
          const parsedTds = tdsMatch ? parseFloat(tdsMatch[1]) : NaN;
          if (Number.isFinite(parsedTds) && parsedTds >= 0.4 && parsedTds <= 22) {
            applyLabLiveR2Reading({ tds: clamp(parsedTds, 0.4, 22, 1.40), tempC: 23.4 }, { silent: true });
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
        domH('summary', { text: 'Optional Commercial Partner Cloud API (Local-Only Key \u2014 Not Needed for Home Users)' }),
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

      const dfCard = domH('div', { class: 'bt-lab-subcard', style: 'min-width:0;max-width:100%;box-sizing:border-box;' },
        domH('div', { class: 'bt-lab-card-head' },
          domH('div', { class: 'bt-lab-title-group' },
            ic('paste-card', { size: 18 }),
            domH('strong', { text: 'DiFluid Cafe & CoffeeOS Zero-CORS Drop / Paste (No API Key)' })
          )
        ),
        buildWhatBox('What this importer does', [
          'Paste or drop a DiFluid Cafe CSV, JSON, or share note to auto-fill your measured ',
          labAbbr('%TDS', 'Total Dissolved Solids — cup strength'),
          ', ',
          labAbbr('Agtron #', 'Roast lightness score (higher = lighter)'),
          ', and ',
          labAbbr('D50', 'Median coffee grind size in microns'),
          ' across every Lab studio — no cloud login required.'
        ]),
        buildStepRibbon([
          { text: 'Copy note or export CSV from DiFluid', title: 'Export a CSV/JSON or share summary from the DiFluid Cafe app' },
          { text: 'Paste text or choose file', title: 'Paste into the box below or tap Choose CSV / JSON' },
          { text: 'Auto-fills %TDS, Agtron & D50', title: 'Measured values immediately populate Studio 1, Grinder Lab, and Agtron' }
        ]),
        pasteArea,
        domH('div', { class: 'bt-lab-btn-row' },
          dfFile,
          domH('button', { type: 'button', class: 'bt-lab-btn is-sm is-primary', title: 'Parse pasted CSV, JSON, or share text and load %TDS / Agtron / D50 into Lab', onclick: function () { importDiFluidPayload(pasteArea.value); } }, 'Apply Pasted Data'),
          domH('button', { type: 'button', class: 'bt-lab-btn is-sm', title: 'Pick a local DiFluid CSV or JSON export file from your device', onclick: function () { dfFile.click(); } }, 'Choose CSV / JSON'),
          domH('button', {
            type: 'button',
            class: 'bt-lab-btn is-sm',
            title: 'Load a sample DiFluid R2 + Omni reading so you can preview how optical readings populate the Lab',
            onclick: function () {
              if (typeof dfApi.getDemoDataset === 'function') {
                const demo = dfApi.getDemoDataset();
                pasteArea.value = typeof demo === 'string' ? demo : JSON.stringify(demo);
                importDiFluidPayload(pasteArea.value);
              } else {
                applyLabLiveR2Reading({ tds: 1.39, tempC: 23.4 }, { silent: true });
                applyLabLiveOmniReading({ beanAgtron: 78.0, groundAgtron: 85.2, d50Um: 540 }, { silent: true });
                dfMsg.textContent = 'Loaded DiFluid Ecosystem Demo Dataset (1.39% TDS, Agtron 78.0/85.2)!';
              }
            }
          }, 'Load Demo Dataset')
        ),
        dfMsg,
        partnerDetails
      );
      root.appendChild(dfCard);

      /* 5. PocketMicronLens Camera Grind Calibrator */
      root.appendChild(buildPocketMicronLensCard());
    }

    /* 6. Collapsible "Live BLE Diagnostics & Compatibility Guide" Card at Bottom of Bench */
    const diagCapTxt = domH('span', { text: '' });
    const diagRxCountEl = domH('strong', { class: 'num-tab', 'data-ble-diag-field': 'rxPacketCount', text: '0' });
    const diagUuidsEl = domH('strong', { class: 'num-tab', 'data-ble-diag-field': 'gattUuids', style: 'overflow-wrap:anywhere;', text: '--' });
    const diagSlotsEl = domH('strong', { class: 'num-tab', 'data-ble-diag-field': 'activeSlots', text: '0 / 5' });
    const diagStatusEl = domH('span', {
      'data-ble-diag-field': 'lastStatusText',
      style: 'min-width:0;max-width:100%;overflow-wrap:anywhere;word-break:break-word;',
      text: 'Ready'
    });
    const diagHexEl = domH('span', {
      'data-ble-diag-field': 'lastRawHex',
      style: 'min-width:0;max-width:100%;overflow-wrap:anywhere;word-break:break-word;',
      text: '--'
    });

    const diagDetails = domH('details', {
      class: 'bt-lab-details bt-ble-diag-card',
      id: idPfx + 'diagnostics-card',
      'data-ble-diag': '1',
      style: 'min-width:0;max-width:100%;box-sizing:border-box;'
    },
      domH('summary', {
        style: 'display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;'
      },
        domH('span', { style: 'font-weight:700;', text: 'Live BLE Diagnostics & Compatibility Guide' }),
        diagCapTxt
      ),
      domH('div', { style: 'display:flex;flex-direction:column;gap:10px;margin-top:10px;min-width:0;max-width:100%;' },
        domH('div', { class: 'bt-lab-btn-row' },
          domH('a', {
            class: 'bt-lab-btn is-sm' + (!caps.webBluetooth ? ' is-primary' : ''),
            href: bluefyHref,
            'data-ble-action': 'open-bluefy'
          }, ic('ble-wave', { size: 14 }), domH('span', { text: 'Open in Bluefy (iPhone / iPad BLE)' })),
          domH('button', {
            type: 'button',
            class: 'bt-lab-btn is-sm',
            'data-ble-action': 'copy-ble-diag',
            onclick: function () {
              const cur = getBleStateSafe();
              const snapLine = [
                'WebBLE=' + Boolean(caps.webBluetooth),
                'rxPacketCount=' + (cur.rxPacketCount != null ? cur.rxPacketCount : labState.bleBench.localRxCount),
                'service=' + (cur.lastServiceUuid || '--'),
                'char=' + (cur.lastCharUuid || '--'),
                'status=' + (cur.lastStatusText || 'Idle'),
                'rawHex=' + (cur.lastRawHex || labState.bleBench.localLastHex || '--')
              ].join(' | ');
              if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                navigator.clipboard.writeText(snapLine).catch(function () {});
              }
              CK.haptic('tick');
              notify('Copied live BLE diagnostic snapshot.');
            }
          }, 'Copy Packet Snapshot')
        ),
        domH('div', { class: 'bt-lab-metric-strip' },
          domH('div', { class: 'bt-lab-kpi' },
            domH('span', { text: 'RX Packets' }),
            diagRxCountEl
          ),
          domH('div', { class: 'bt-lab-kpi' },
            domH('span', { text: 'Active GATT UUID' }),
            diagUuidsEl
          ),
          domH('div', { class: 'bt-lab-kpi' },
            domH('span', { text: 'Active Slots' }),
            diagSlotsEl
          )
        ),
        domH('div', { class: 'bt-ble-slot-readout num-tab', style: 'min-width:0;max-width:100%;box-sizing:border-box;' }, diagStatusEl),
        domH('div', { class: 'bt-ble-slot-readout num-tab', style: 'min-width:0;max-width:100%;box-sizing:border-box;' }, diagHexEl),
        domH('ul', { class: 'bt-lab-list' },
          domH('li', { text: 'Browser Readiness: Chrome, Edge, Opera, Android Chrome, and Bluefy (iOS) support direct Web Bluetooth GATT across all 5 concurrent slots; iOS Safari blocks WebBLE (use Open in Bluefy above).' }),
          domH('li', { text: 'Custom-Renamed Hardware: If you renamed your scale or sensor in its vendor app, tap Scan Any BLE on that slot to unlock all 23 coffee GATT service UUIDs without name filtering.' }),
          domH('li', { text: 'Honest Radio Notes: Close vendor phone apps before pairing so GATT advertising resumes. Fellow Tally Pro has no BLE radio; Fellow Stagg EKG+ (0x1820) pairs in Slot 5 while newer EKG Pro uses Wi-Fi only.' })
        )
      )
    );
    if (labState.bleBench.diagOpen) diagDetails.setAttribute('open', '');
    diagDetails.addEventListener('toggle', function () {
      labState.bleBench.diagOpen = !!diagDetails.open;
    });
    root.appendChild(diagDetails);

    /* Non-destructive in-place live updater across all 5 slots + Diagnostics */
    function refreshBenchLive() {
      const cur = getBleStateSafe();
      const curCaps = typeof ble.capabilities === 'function'
        ? ble.capabilities()
        : { webBluetooth: typeof navigator !== 'undefined' && !!navigator.bluetooth };
      const simOn = !!cur.simulatorActive;
      setTextIfChanged(simToggleLbl, simOn ? 'Stop 10Hz Bench Simulator' : '1-Tap 10Hz Full Bench Simulator');

      /* 1. Smart Scale */
      const scObj = cur.scale || {};
      const scHw = !!cur.scaleConnected;
      const scOn = !!(scHw || scObj.connected || simOn);
      const scName = cur.scaleName || scObj.name || (simOn ? '10Hz Scale Simulator' : 'Smart Scale');
      const scBat = cur.batteryPct != null ? cur.batteryPct : scObj.batteryPct;
      scaleHead.sync(scOn, scName, scBat, simOn && !scHw);
      scaleSelectWrap.hidden = scOn;
      scaleUnpairedRow.hidden = scOn;
      scaleConnectedRow.hidden = !scOn;
      if (scaleBrandSel.value !== (labState.bleBench.scaleBrand || 'auto') && (typeof document === 'undefined' || document.activeElement !== scaleBrandSel)) {
        scaleBrandSel.value = labState.bleBench.scaleBrand || 'auto';
      }
      const wG = Number((scObj.weightG != null ? scObj.weightG : cur.weightG) || 0).toFixed(1);
      const fGs = Number((scObj.flowGs != null ? scObj.flowGs : cur.flowRateGs) || 0).toFixed(1);
      const btnAgeMs = Date.now() - (labState.bleBench.lastScaleBtnAtMs || 0);
      const btnSuffix = (labState.bleBench.lastScaleBtn && btnAgeMs < 8000) ? (' \u00B7 Btn: ' + labState.bleBench.lastScaleBtn) : '';
      setTextIfChanged(
        scaleReadout.txt,
        cur.scaleReconnecting
          ? ('Reconnecting \u00B7 Holding ' + wG + ' g')
          : (scOn ? (wG + ' g \u00B7 ' + fGs + ' g/s' + btnSuffix) : 'Standby \u00B7 0.0 g \u00B7 0.0 g/s')
      );

      /* 2. Espresso Pressure */
      const prObj = cur.pressure || {};
      const prHw = !!cur.pressureConnected;
      const prOn = !!(prHw || prObj.connected || simOn);
      const prName = cur.pressureName || prObj.name || (simOn ? '9-Bar Profiler Sim' : 'Pressure Sensor');
      const prBat = cur.pressureBatteryPct != null ? cur.pressureBatteryPct : prObj.batteryPct;
      pressureHead.sync(prOn, prName, prBat, simOn && !prHw);
      pressureUnpairedRow.hidden = prOn;
      pressureConnectedRow.hidden = !prOn;
      const barVal = Number((prObj.bar != null ? prObj.bar : cur.pressureBar) || 0).toFixed(1);
      const prTempRaw = prObj.tempC != null ? prObj.tempC : cur.pressureTempC;
      const prTempPart = (prTempRaw != null && Number.isFinite(+prTempRaw)) ? (' \u00B7 ' + (+prTempRaw).toFixed(1) + ' \u00B0C') : '';
      const pkRaw = prObj.peakBar != null ? prObj.peakBar : cur.peakPressureBar;
      const pkPart = (pkRaw != null && +pkRaw > 0.2) ? (' \u00B7 Peak ' + (+pkRaw).toFixed(1) + ' bar') : '';
      setTextIfChanged(pressureReadout.txt, prOn ? (barVal + ' bar' + prTempPart + pkPart) : 'Standby \u00B7 0.0 bar');

      /* 3. DiFluid R2 Extract */
      const r2Obj = cur.refractometer || {};
      const r2Hw = !!cur.refractometerConnected;
      const r2On = !!(r2Hw || r2Obj.connected || simOn);
      const r2Name = cur.refractometerName || r2Obj.name || (simOn ? 'DiFluid R2 Sim' : 'DiFluid R2');
      const r2Bat = cur.refractometerBatteryPct != null ? cur.refractometerBatteryPct : r2Obj.batteryPct;
      r2Head.sync(r2On, r2Name, r2Bat, simOn && !r2Hw);
      r2UnpairedRow.hidden = r2On;
      r2ConnectedRow.hidden = !r2On;
      const tdsVal = +(r2Obj.tds || cur.lastTds || labState.bc.measTds || 0);
      const r2TempStr = Number(r2Obj.tempC || cur.lastTempC || labState.bc.measTempC || 23.4).toFixed(1) + ' \u00B0C';
      setTextIfChanged(
        r2Readout.txt,
        r2On
          ? ((tdsVal > 0 ? (tdsVal.toFixed(2) + '% TDS \u00B7 ' + r2TempStr) : ('R2 Ready \u00B7 ' + r2TempStr)) + ' \u00B7 Auto-Sync')
          : (tdsVal > 0 ? (tdsVal.toFixed(2) + '% TDS \u00B7 ' + r2TempStr) : 'Standby \u00B7 Ready to Read')
      );

      /* 4. DiFluid Omni */
      const omObj = cur.omni || cur.lastOmni || {};
      const omHw = !!cur.omniConnected;
      const omOn = !!(omHw || omObj.connected || simOn);
      const omName = cur.omniName || omObj.name || (simOn ? 'DiFluid Omni Sim' : 'DiFluid Omni');
      const omBat = cur.omniBatteryPct != null ? cur.omniBatteryPct : omObj.batteryPct;
      omniHead.sync(omOn, omName, omBat, simOn && !omHw);
      omniUnpairedRow.hidden = omOn;
      omniConnectedRow.hidden = !omOn;
      const liveBeanAg = omObj.beanAgtron || labState.omniLive.beanAgtron;
      const liveGroundAg = omObj.groundAgtron || omObj.agtron || labState.omniLive.groundAgtron;
      const liveD50 = omObj.d50Um || labState.omniLive.d50Um;
      let omniLine = 'Bean ' + labState.roastFresh.beanG.toFixed(1) + ' / Ground ' + labState.roastFresh.groundG.toFixed(1) + ' Ag';
      if (liveBeanAg || liveGroundAg || liveD50) {
        const agPart = (liveBeanAg && liveGroundAg)
          ? ('Agtron ' + Number(liveGroundAg).toFixed(1) + ' (Bean ' + Number(liveBeanAg).toFixed(1) + ')')
          : (liveGroundAg ? ('Agtron ' + Number(liveGroundAg).toFixed(1)) : (liveBeanAg ? ('Bean Agtron ' + Number(liveBeanAg).toFixed(1)) : 'Agtron --'));
        const psdPart = liveD50 ? ('D50 ' + Math.round(+liveD50) + ' \u00B5m') : 'PSD Ready';
        omniLine = agPart + ' \u00B7 ' + psdPart;
      }
      setTextIfChanged(omniReadout.txt, omniLine);

      /* 5. Kettle & xBloom */
      const ktHw = !!cur.kettleConnected;
      const xbHw = !!cur.xbloomConnected;
      const ktOn = !!(ktHw || simOn);
      const xbOn = !!(xbHw || simOn);
      const mcOn = !!(ktOn || xbOn || cur.machineConnected);
      const mcBat = cur.slots && cur.slots.machine ? cur.slots.machine.batteryPct : null;
      const mcDevLabel = ktHw && xbHw
        ? 'Kettle + xBloom'
        : (ktHw ? (cur.kettleName || 'Stagg EKG+') : (xbHw ? (cur.xbloomName || 'xBloom Studio') : (simOn ? 'Kettle & xBloom Sim' : 'Standby')));
      machineHead.sync(mcOn, mcDevLabel, mcBat, simOn && !ktHw && !xbHw);

      kettleUnpairedRow.hidden = ktOn;
      kettleConnectedRow.hidden = !ktOn;
      xbloomUnpairedRow.hidden = xbOn;
      xbloomConnectedRow.hidden = !xbOn;

      const aBrew = (getApp() && getApp().brew) || {};
      const recTargetC = Math.round(clamp(+aBrew.tempC || (aBrew.tempF ? ((+aBrew.tempF - 32) * 5 / 9) : labState.wave.kettleC || 93), 40, 100, 93));
      setTextIfChanged(kettlePushLbl, 'Push Recipe Temp (' + recTargetC + ' \u00B0C)');

      const ktTempC = cur.kettleTempC != null && Number.isFinite(+cur.kettleTempC) ? +cur.kettleTempC : null;
      const ktTargetC = cur.kettleTargetTempC != null && Number.isFinite(+cur.kettleTargetTempC) ? +cur.kettleTargetTempC : recTargetC;
      const ktF = ktTempC != null ? Math.round(ktTempC * 9 / 5 + 32) : Math.round(recTargetC * 9 / 5 + 32);
      setTextIfChanged(
        kettleStatusLine,
        ktOn
          ? ('Stagg EKG+ Kettle: ' + (ktTempC != null ? (ktTempC.toFixed(1) + ' \u00B0C (' + ktF + ' \u00B0F)') : 'Connected') + ' \u00B7 Target ' + Math.round(ktTargetC) + ' \u00B0C' + (cur.kettleHold ? ' \u00B7 Hold ON' : ''))
          : ('Stagg EKG+ Kettle: Standby \u00B7 Recipe Target ' + recTargetC + ' \u00B0C (' + Math.round(recTargetC * 9 / 5 + 32) + ' \u00B0F)')
      );

      const rawStage = String(cur.xbloomStage || (cur.machine && cur.machine.stage) || 'idle');
      const stageCap = rawStage.charAt(0).toUpperCase() + rawStage.slice(1);
      setTextIfChanged(
        xbloomStatusLine,
        xbOn
          ? ((cur.xbloomName || 'xBloom Studio') + ' \u00B7 Stage: ' + stageCap)
          : 'xBloom Studio / Original: Standby \u00B7 Safety Gate Armed'
      );
      setClassIfChanged(xbloomSafetyChip, 'bt-lab-chip' + (labState.bleBench.xbloomPreGround ? ' is-active' : ''));
      xbloomSafetyChip.setAttribute('aria-pressed', String(!!labState.bleBench.xbloomPreGround));
      setTextIfChanged(
        xbloomSafetyLbl,
        labState.bleBench.xbloomPreGround ? 'Safety: Pre-Ground (0x44 OFF)' : 'Mode: Whole-Bean (0x41 ON)'
      );

      const ktShort = ktOn ? ('Kettle ' + (ktTempC != null ? (Math.round(ktTempC) + ' \u00B0C') : 'Ready')) : 'Kettle Idle';
      const xbShort = xbOn ? ('xBloom ' + stageCap) : 'xBloom Idle';
      setTextIfChanged(machineReadout.txt, ktShort + ' / ' + xbShort);

      if (benchR2Widget && benchR2Widget._syncTemp) benchR2Widget._syncTemp();

      /* 6. Live BLE Diagnostics Inspector */
      const rxTotal = cur.rxPacketCount != null ? +cur.rxPacketCount : labState.bleBench.localRxCount;
      const activeSlotNames = [];
      if (scOn) activeSlotNames.push('Scale');
      if (prOn) activeSlotNames.push('Pressure');
      if (r2On) activeSlotNames.push('R2');
      if (omOn) activeSlotNames.push('Omni');
      if (mcOn) activeSlotNames.push(ktHw ? 'Kettle' : (xbHw ? 'xBloom' : 'Gear'));

      setClassIfChanged(diagCapTxt, 'bt-epistemic-pill num-tab ' + (curCaps.webBluetooth ? 'is-verified' : 'is-craft'));
      setTextIfChanged(
        diagCapTxt,
        (curCaps.webBluetooth ? 'WebBLE Ready' : 'Use Bluefy on iOS') + ' \u00B7 ' + rxTotal + ' pkts'
      );
      setTextIfChanged(diagRxCountEl, String(rxTotal));
      const svcShort = shortGattUuid(cur.lastServiceUuid);
      const chrShort = shortGattUuid(cur.lastCharUuid);
      setTextIfChanged(diagUuidsEl, (svcShort || chrShort) ? ((svcShort || '--') + ' / ' + (chrShort || '--')) : 'Awaiting GATT');
      setTextIfChanged(diagSlotsEl, activeSlotNames.length ? (activeSlotNames.length + '/5 (' + activeSlotNames.join(', ') + ')') : '0 / 5 Paired');
      setTextIfChanged(diagStatusEl, 'Status: ' + (cur.lastStatusText || (curCaps.webBluetooth ? 'WebBLE Ready \u2014 select any slot above to pair' : 'WebBluetooth unavailable in this WebView \u2014 tap Open in Bluefy')));
      setTextIfChanged(diagHexEl, 'Raw Hex: ' + (cur.lastRawHex || labState.bleBench.localLastHex || '-- (incoming BLE notification bytes appear here live)'));
    }

    refreshBenchLive();
    registerLabBenchHook(root, refreshBenchLive);
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
    const bcTakeaway = createTakeawayBox('bt-bc-takeaway');
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
        const t = CK.svgEl('text', { x: x.toFixed(1), y: P.B + 27, 'text-anchor': 'middle', class: 'bt-chart-tick' });
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

      const yAxisLbl = CK.svgEl('text', { x: '10', y: '16', 'text-anchor': 'start', class: 'bt-chart-axis-title' });
      yAxisLbl.textContent = 'Strength (%TDS) \u2191';
      gridG.appendChild(yAxisLbl);

      const xAxisLbl = CK.svgEl('text', { x: (P.L + P.PW * 0.5).toFixed(1), y: 378, 'text-anchor': 'middle', class: 'bt-chart-axis-title' });
      xAxisLbl.textContent = 'Extraction Yield (%EY) \u00B7 Sour \u2190 \u2192 Bitter';
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
      const zl = CK.svgEl('text', { x: (mapX(18) + 6).toFixed(1), y: (mapY(scaLoTds) - 6).toFixed(1), class: 'bt-bc-zone-lbl bt-chart-zone-lbl' });
      zl.textContent = d.isEsp ? 'Espresso Gold Zone (18\u201322% EY \u00B7 8.5\u201311.5% TDS)' : 'SCA Gold Zone (18\u201322% EY \u00B7 1.15\u20131.45% TDS)';
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
        const nl = CK.svgEl('text', { x: (mapX(19.6) + 6).toFixed(1), y: (mapY(1.50) + 12).toFixed(1), class: 'bt-bc-zone-lbl bt-chart-zone-lbl' });
        nl.textContent = 'Nordic / High-Clarity Zone';
        zonesG.appendChild(nl);
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
      const bagNotesRaw = String(cf.bag_notes || cf.notes || cf.flavors_liked || '').split(/[,;|]/).map(function (x) { return x.trim(); }).filter(Boolean);
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
        mEyCalc = clamp((mTdsFrac * sol.bevG * 100) / Math.max(0.5, s.doseG), 1, 36, 20);
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
        const aKh = getApp() || {};
        const rawKhCandidates = [
          aKh.brew && aKh.brew.waterKhPpm,
          aKh.brew && aKh.brew.waterAlk,
          aKh.prefs && aKh.prefs.waterKhPpm,
          aKh.prefs && aKh.prefs.water && aKh.prefs.water.kh,
          aKh.prefs && aKh.prefs.gear && aKh.prefs.gear.waterAlk,
          labState.water && labState.water.kh
        ];
        let khNow = 45;
        for (let ki = 0; ki < rawKhCandidates.length; ki++) {
          const kv = rawKhCandidates[ki];
          if (kv !== undefined && kv !== null && kv !== '' && Number.isFinite(+kv)) {
            khNow = +kv;
            break;
          }
        }
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
        if (s.sensoryTag === 'flat_chalky' && disc && disc.winningHypothesis && disc.winningHypothesis.id !== 'H2_water_temp_lipids') {
          disc = null;
        }
        if (s.sensoryTag === 'sour_bitter' && disc && disc.winningHypothesis && disc.winningHypothesis.id === 'H1_channeling_bypass' && disc.prescription) {
          disc.prescription.actionHuman = 'Sour + Bitter at ' + s.measTds.toFixed(2) + '% TDS / ' + mEyCalc.toFixed(1) + '% EY confirms fast bypass channels alongside over-extracted fines! Stir/level dry bed, pour gently in center spiral (<=4 g/s), and hold grind steady.';
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
              human: 'Bulk extraction succeeded, so flat/chalky notes point to water buffer (' + Math.round(khNow) + ' ppm KH), >65 °C sip masking, or aged lipids. Blend RO water toward ~40 ppm KH and sip at 55–62 °C.',
              sci: 'nD20 is blind to bicarbonate acid neutralization (HA + HCO3- -> A- + H2CO3) and TRPM5 thermal gating.'
            },
            not_my_style: {
              short: 'H4: Bean / Process Style Mismatch',
              prob: 0.98,
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
          const pctConf = Math.min(99, Math.max(1, Math.round((disc.winningHypothesis.prob || 0.9) * 100)));
          r2ReconcileBox.appendChild(domH('strong', {
            class: 'num-tab',
            text: 'Taste vs. Refractometer Check — ' + cleanShort + ' (' + pctConf + '%)'
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
        if (s.measTds > 0 && s.measTempC > 29) {
          const idealWin = getPrefTempUnit() === 'F' ? '68–77 °F (20–25 °C)' : '20–25 °C';
          diagExtra = '  ·  Thermal Guard: Sample ' + fmtTempPref(s.measTempC, 1) + ' (>29 °C; cool to ' + idealWin + ' for ±0.02% ATC)';
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
      if (eyLiveReadoutEl) {
        eyLiveReadoutEl.textContent = s.measTds > 0
          ? (s.measTds.toFixed(2) + '% TDS · ' + mEyCalc.toFixed(2) + '% Extraction (%EY)')
          : ('Target: ' + s.targetTds.toFixed(2) + '% TDS · ' + s.targetEy.toFixed(1) + '% Extraction (%EY)');
      }
      if (eyTdsInput && (typeof document === 'undefined' || document.activeElement !== eyTdsInput)) {
        eyTdsInput.value = s.measTds > 0 ? s.measTds.toFixed(2) : '';
      }

      const dNow = getDomains();
      let bcMsg = '';
      let bcTone = 'good';
      if (s.targetEy < 18.0) {
        bcTone = 'warn';
        bcMsg = 'At ' + s.targetEy.toFixed(1) + '% EY, water only pulls fast fruit acids — expect a sharp, sour, short-finish cup. Slide the dot right toward 19–21% EY (or grind finer) to unlock caramel sweetness.';
      } else if (s.targetEy > 22.8) {
        bcTone = 'bad';
        bcMsg = 'Past 22.8% EY (' + s.targetEy.toFixed(1) + '%), late-extracting bitter & drying compounds take over. Slide left into the green Balanced Zone (18–22% EY) or grind coarser for a sweeter finish.';
      } else if (s.targetTds < (dNow.isEsp ? 8.4 : 1.29)) {
        bcTone = 'good';
        bcMsg = 'Delicate & Tea-Like (' + s.targetTds.toFixed(2) + '% TDS · 1:' + rec.ratio.toFixed(1) + '): lighter body lets floral & citrus aromatics shine. Weigh ' + rec.doseG.toFixed(1) + ' g coffee and ' + (s.mode === 'espresso' ? ('pull ' + rec.bevG.toFixed(1) + ' g shot.') : ('pour ' + rec.pourG.toFixed(0) + ' g water.'));
      } else if (s.targetTds > (dNow.isEsp ? 10.9 : 1.46)) {
        bcTone = 'good';
        bcMsg = 'Rich & Syrupy (' + s.targetTds.toFixed(2) + '% TDS · 1:' + rec.ratio.toFixed(1) + '): concentrated, velvety mouthfeel while staying cleanly extracted (' + s.targetEy.toFixed(1) + '% EY). Weigh ' + rec.doseG.toFixed(1) + ' g coffee and ' + (s.mode === 'espresso' ? ('pull ' + rec.bevG.toFixed(1) + ' g shot.') : ('pour ' + rec.pourG.toFixed(0) + ' g water.'));
      } else {
        bcTone = 'good';
        bcMsg = 'Right inside the Sweet Spot (' + s.targetEy.toFixed(1) + '% EY · ' + s.targetTds.toFixed(2) + '% TDS · 1:' + rec.ratio.toFixed(1) + '): balanced sweetness, acidity, and body. Weigh ' + rec.doseG.toFixed(1) + ' g coffee and ' + (s.mode === 'espresso' ? ('pull ' + rec.bevG.toFixed(1) + ' g shot.') : ('pour ' + rec.pourG.toFixed(0) + ' g water for ~' + rec.bevG.toFixed(0) + ' g in mug.'));
      }
      if (s.measTds > 0) {
        bcMsg += ' Your measured cup (' + s.measTds.toFixed(2) + '% TDS -> ' + mEyCalc.toFixed(1) + '% EY) is plotted as the diamond pin.';
      }
      bcTakeaway.set(bcMsg, bcTone);
    }

    let aimCtaSpan = domH('span', { text: 'Brew Aiming Here \u2192' });
    let aimSubSpan = domH('span', { class: 'bt-cta-sub num-tab', text: '' });
    let eyTdsInput = null;
    let eyLiveReadoutEl = null;

    const surfCtrl = CK.bindChartSurface(svg, {
      ariaLabel: '2D TDS and Extraction Yield Target Puck',
      ariaMin: 14,
      ariaMax: 26,
      ariaNow: s.targetEy,
      ariaText: s.targetEy.toFixed(1) + '% EY at ' + s.targetTds.toFixed(2) + '% TDS',
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
      { k: 'floral', lbl: 'Tea-Like & Floral', ey: 19.6, tds: 1.24, espEy: 20.8, espTds: 8.0, tip: 'Lighter, delicate body with high aroma clarity (1.24% TDS filter / 8.0% TDS turbo espresso)' },
      { k: 'juicy', lbl: 'Juicy & Sweet', ey: 20.4, tds: 1.38, espEy: 20.2, espTds: 9.6, tip: 'Balanced everyday sweet spot inside the SCA Gold Zone (1.38% TDS filter / 9.6% TDS espresso)' },
      { k: 'syrupy', lbl: 'Rich & Syrupy', ey: 21.0, tds: 1.52, espEy: 19.4, espTds: 11.6, tip: 'Stronger, fuller-bodied cup with heavy cocoa/toffee texture (1.52% TDS filter / 11.6% TDS ristretto)' }
    ];
    const styleBtns = STYLE_PRESETS.map(function (sp) {
      return domH('button', {
        type: 'button',
        class: 'bt-lab-chip' + (s.stylePreset === sp.k ? ' is-active' : ''),
        title: sp.tip,
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
      { k: 'percolation', lbl: 'Filter Percolation', tip: 'Pour-over & drip brewers where hot water flows through a coffee bed (V60, Kalita, Chemex, batch drip)' },
      { k: 'immersion', lbl: 'Steeped / Immersion', tip: 'Full-steep brewers where grounds sit in water before filtering (French Press, AeroPress, Clever, Switch)' },
      { k: 'espresso', lbl: 'Espresso & Moka', tip: 'Concentrated high-strength shots (8–12% TDS) brewed under pressure' }
    ].map(function (m) {
      return domH('button', {
        type: 'button',
        class: 'bt-lab-chip' + (s.mode === m.k ? ' is-active' : ''),
        title: m.tip,
        'aria-pressed': String(s.mode === m.k),
        onclick: function () {
          const prevEsp = s.mode === 'espresso';
          s.mode = m.k;
          s.stylePreset = 'custom';
          styleBtns.forEach(function (b) { b.classList.remove('is-active'); b.setAttribute('aria-pressed', 'false'); });
          if (m.k === 'espresso' && !prevEsp) {
            s.targetTds = 9.5;
            if (s.measTds > 0 && s.measTds < 4.5) {
              s.measTds = 9.5;
            }
          } else if (m.k !== 'espresso' && prevEsp) {
            s.targetTds = 1.38;
            if (s.measTds >= 4.5) {
              s.measTds = 1.38;
            }
          }
          const pillTds = s.measTds > 0 ? s.measTds : s.targetTds;
          s.measNd = +nd20FromBrix(brixFromTds(pillTds)).toFixed(5);
          if (typeof tdsPill !== 'undefined' && tdsPill) tdsPill.setValue(pillTds, true);
          if (typeof brixPill !== 'undefined' && brixPill) brixPill.setValue(brixFromTds(pillTds), true);
          if (typeof ndPill !== 'undefined' && ndPill) ndPill.setValue(s.measNd, true);
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
        { k: 'liang', lbl: 'Liang f_abs = 0.00', badge: 'Verified Science', badgeCls: 'is-verified', tip: 'Standard immersion math: assumes liquid trapped in grounds has the same strength as your cup' },
        { k: 'gagne', lbl: 'Gagne f_abs = 1.00', badge: 'Active Research', badgeCls: 'is-research', tip: 'Slurry-absorption model: accounts for slightly stronger liquid trapped inside coffee cells' }
      ].forEach(function (opt) {
        immersionBasisRow.appendChild(domH('button', {
          type: 'button',
          class: 'bt-lab-chip' + (curBasis === opt.k ? ' is-active' : ''),
          title: opt.tip,
          'aria-pressed': String(curBasis === opt.k),
          onclick: function () {
            a.prefs = a.prefs || {};
            a.prefs.immersionBasis = opt.k;
            saveDraftSoon();
            buildImmersionBasisButtons();
            redrawStaticBackdrop();
            updatePuckAndReadouts();
          }
        },
          domH('span', { text: opt.lbl }),
          domH('span', { class: 'bt-epistemic-pill ' + opt.badgeCls, style: 'padding:1px 6px;font-size:0.68rem', text: opt.badge })
        ));
      });
    }
    buildImmersionBasisButtons();

    /* ICUMSA nD20 / Brix / %TDS Scrubbable Vernier Row */
    const dosePill = CK.vernierPill({
      label: 'Dose',
      title: 'Dry coffee beans weighed in grams before grinding',
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
      title: 'Total Dissolved Solids (%) — optical cup strength (higher = heavier/stronger)',
      value: s.measTds || s.targetTds,
      min: 0.50,
      max: 18.0,
      step: 0.01,
      decimals: 2,
      unit: '%',
      compact: true,
      onChange: function (v) {
        s.measTds = v;
        s.measNd = +nd20FromBrix(brixFromTds(v)).toFixed(5);
        ndPill.setValue(s.measNd, true);
        brixPill.setValue(brixFromTds(v), true);
        updatePuckAndReadouts();
      }
    });

    const brixPill = CK.vernierPill({
      label: 'ICUMSA Brix',
      title: 'Refractometer sugar scale (°Bx) — coffee %TDS is ~0.85 × Brix',
      value: brixFromTds(s.targetTds),
      min: 0.50,
      max: 22.0,
      step: 0.01,
      decimals: 2,
      unit: 'Bx',
      compact: true,
      onChange: function (bx) {
        const tds = tdsFromBrix(bx);
        s.measTds = tds;
        s.measNd = +nd20FromBrix(bx).toFixed(5);
        tdsPill.setValue(tds, true);
        ndPill.setValue(s.measNd, true);
        updatePuckAndReadouts();
      }
    });

    const ndPill = CK.vernierPill({
      label: 'nD20',
      title: 'Refractive Index at 20 °C — raw optical light-bending reading (pure water = 1.3330)',
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
      title: 'Coffee drop temperature on your refractometer prism — cool to 20–25 °C (68–77 °F) before reading',
      value: s.measTempC,
      min: 10.0,
      max: 65.0,
      step: 0.1,
      decimals: 1,
      unit: 'C',
      formatValue: function (v) { return fmtTempPref(v, 1); },
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
      proTip: 'Stir 3–5 mL in a room-temp metal spoon for 15–20s (20–25 °C / 68–77 °F) before reading DiFluid R2 to prevent evaporation drift!'
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
          const prevMethod = String(a.brew.method || '').toLowerCase();
          const wasEspLike = prevMethod === 'espresso' || prevMethod === 'lever_espresso' || prevMethod === 'moka' || prevMethod === 'turkish';
          if (s.mode === 'espresso') {
            if (prevMethod !== 'espresso' && prevMethod !== 'lever_espresso') {
              a.brew.method = 'espresso';
            }
            const curUm = +a.brew.grindUm;
            const switchedToEsp = prevMethod !== 'espresso' && prevMethod !== 'lever_espresso';
            if (switchedToEsp || !Number.isFinite(curUm) || curUm < 120 || curUm > 360) {
              const espUm = Math.round(clamp(245 + (s.targetEy - 20.0) * 3, 235, 260, 245));
              syncBrewGrindFields(a, espUm, { methodKey: a.brew.method });
            }
          } else {
            if (wasEspLike) {
              a.brew.method = s.mode === 'immersion' ? 'press' : 'v60';
            }
            const curUm = +a.brew.grindUm;
            if (wasEspLike || !Number.isFinite(curUm) || curUm < 360) {
              const baseUm = s.mode === 'immersion' ? 680 : 560;
              const filterUm = Math.round(clamp(baseUm - (s.targetEy - 20.0) * 15, 420, 920, baseUm));
              syncBrewGrindFields(a, filterUm, { methodKey: a.brew.method });
            }
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

    const bleForEy = window.BTBle || {};
    const r2LiveStatusBadge = domH('span', {
      class: 'bt-epistemic-pill is-research',
      id: 'bt-lab-r2-status-badge',
      text: 'Refractometer & %EY Calculator'
    });
    eyTdsInput = domH('input', {
      type: 'number',
      id: 'bt-lab-ey-tds-input',
      inputmode: 'decimal',
      class: 'bt-lab-text-in bt-lab-num-in',
      style: 'font-size:1rem;max-width:118px',
      step: '0.01',
      min: '0',
      max: '25',
      placeholder: s.mode === 'espresso' ? '9.40' : '1.38',
      value: s.measTds > 0 ? s.measTds.toFixed(2) : '',
      'aria-label': 'Measured coffee strength percent TDS',
      oninput: function () {
        const v = parseFloat(eyTdsInput.value);
        if (Number.isFinite(v) && v > 0) {
          s.measTds = clamp(v, 0.05, 25, v);
          s.measNd = +nd20FromBrix(brixFromTds(s.measTds)).toFixed(5);
          tdsPill.setValue(s.measTds, true);
          brixPill.setValue(brixFromTds(s.measTds), true);
          ndPill.setValue(s.measNd, true);
        } else {
          s.measTds = 0;
        }
        updatePuckAndReadouts();
      }
    });
    eyLiveReadoutEl = domH('strong', {
      class: 'num-tab',
      id: 'bt-lab-ey-live-readout',
      style: 'font-size:0.9rem;color:var(--ink)',
      text: ''
    });
    const r2ActionBtnsWrap = domH('div', { class: 'bt-lab-btn-row', id: 'bt-lab-r2-actions' });
    let _prevEyR2Mode = '';

    function syncStudioR2Meta() {
      const stNow = getBleStateSafe();
      const conn = !!stNow.refractometerConnected;
      const canTrigger = !!(conn || stNow.simulatorActive);
      if (conn) {
        const metaParts = ['DiFluid R2 Connected \u00B7 Auto-Sync Active'];
        if (stNow.lastTempC != null && Number.isFinite(+stNow.lastTempC) && +stNow.lastTempC > 0) {
          metaParts.push((+stNow.lastTempC).toFixed(1) + ' \u00B0C');
        }
        if (stNow.refractometerBatteryPct != null && Number.isFinite(+stNow.refractometerBatteryPct) && +stNow.refractometerBatteryPct >= 0) {
          metaParts.push(Math.round(+stNow.refractometerBatteryPct) + '%');
        }
        setClassIfChanged(r2LiveStatusBadge, 'bt-epistemic-pill is-verified');
        setTextIfChanged(r2LiveStatusBadge, metaParts.join(' \u00B7 '));
      } else {
        setClassIfChanged(r2LiveStatusBadge, 'bt-epistemic-pill is-research');
        setTextIfChanged(r2LiveStatusBadge, 'Refractometer & %EY Calculator');
      }
      const nextMode = canTrigger ? 'connected' : 'unpaired';
      if (_prevEyR2Mode !== nextMode) {
        _prevEyR2Mode = nextMode;
        r2ActionBtnsWrap.textContent = '';
        if (canTrigger) {
          r2ActionBtnsWrap.appendChild(domH('button', {
            type: 'button',
            id: 'bt-lab-r2-read-btn',
            class: 'bt-lab-btn is-sm is-primary',
            onclick: function () {
              const b = window.BTBle || bleForEy;
              if (typeof b.triggerRefractometerRead === 'function') {
                Promise.resolve(b.triggerRefractometerRead()).catch(function () {});
              }
            }
          }, ic('ble-wave', { size: 14 }), domH('span', { text: 'Read R2 Now' })));
          r2ActionBtnsWrap.appendChild(domH('button', {
            type: 'button',
            id: 'bt-lab-r2-avg3-btn',
            class: 'bt-lab-btn is-sm',
            onclick: function () {
              const b = window.BTBle || bleForEy;
              if (typeof b.triggerRefractometerRead === 'function') {
                Promise.resolve(b.triggerRefractometerRead({ averageCount: 3 })).catch(function () {});
              }
            }
          }, 'Avg x3'));
        } else {
          r2ActionBtnsWrap.appendChild(domH('button', {
            type: 'button',
            id: 'bt-lab-r2-pair-btn',
            class: 'bt-lab-btn is-sm',
            onclick: function () {
              const b = window.BTBle || bleForEy;
              if (typeof b.connectRefractometer === 'function') {
                Promise.resolve(b.connectRefractometer()).then(function (res) {
                  if (res && (res.refractometerConnected || res.ok) && typeof b.triggerRefractometerRead === 'function') {
                    return b.triggerRefractometerRead();
                  }
                }).catch(function () {});
              }
            }
          }, ic('ble-wave', { size: 14 }), domH('span', { text: 'Pair DiFluid R2' })));
          r2ActionBtnsWrap.appendChild(domH('button', {
            type: 'button',
            id: 'bt-lab-r2-scan-any-btn',
            class: 'bt-lab-btn is-sm',
            onclick: function () {
              const b = window.BTBle || bleForEy;
              if (typeof b.connectRefractometer === 'function') {
                Promise.resolve(b.connectRefractometer({ acceptAll: true })).catch(function () {});
              }
            }
          }, 'Scan Any BLE'));
        }
      }
    }
    syncStudioR2Meta();

    const r2LiveBar = domH('div', { class: 'bt-studio-subcard', id: 'bt-lab-r2-live-bar' },
      domH('div', { class: 'bt-lab-card-head' },
        r2LiveStatusBadge,
        r2ActionBtnsWrap
      ),
      buildWhatBox('What this refractometer converter does', [
        'Optional optical check: enter a ',
        labAbbr('%TDS', 'Total Dissolved Solids — coffee strength measured by a refractometer'),
        ', ',
        labAbbr('Brix', 'Sugar-scale reading (°Bx) from standard handheld refractometers; coffee %TDS ≈ 0.85 × Brix'),
        ', or raw ',
        labAbbr('nD20', 'Refractive Index at 20 °C — exact light-bending value on the prism'),
        ' reading to plot your actual cup on the chart and diagnose channeling if the number disagrees with taste.'
      ]),
      domH('div', { class: 'bt-lab-inline-inputs' },
        domH('label', { class: 'bt-lab-field-lbl', title: 'Measured Total Dissolved Solids (%) from your refractometer' },
          domH('span', null, 'Measured ', labAbbr('%TDS', 'Total Dissolved Solids — coffee strength')),
          eyTdsInput
        ),
        eyLiveReadoutEl
      )
    );

    const r2Enabled = getToolModeSafe('refractometer') !== 'off' || !!getBleStateSafe().refractometerConnected || s.measTds > 0;
    const r2Section = domH('div', { class: 'bt-bc-r2-section', hidden: !r2Enabled },
      r2LiveBar,
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

    _labLiveHooks.studioEy = function (opts) {
      if (!card.isConnected) return false;
      const stNow = getBleStateSafe();
      if (stNow.refractometerConnected || s.measTds > 0) {
        r2Section.hidden = false;
        if (r2ToggleHint) r2ToggleHint.hidden = true;
      }
      syncStudioR2Meta();
      if (!(opts && opts.metaOnly) && s.measTds > 0) {
        eyTdsInput.placeholder = s.mode === 'espresso' ? '9.40' : '1.38';
        modeBtns.forEach(function (b, idx) {
          const on = ['percolation', 'immersion', 'espresso'][idx] === s.mode;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', String(on));
        });
        redrawStaticBackdrop();
        tdsPill.setValue(s.measTds, true);
        brixPill.setValue(brixFromTds(s.measTds), true);
        ndPill.setValue(s.measNd, true);
        tempSamplePill.setValue(s.measTempC, true);
      }
      updatePuckAndReadouts();
      return true;
    };

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
    card.appendChild(buildWhatBox('What this tool does', [
      'Drag the target dot to balance ',
      labAbbr('Strength (%TDS)', 'Total Dissolved Solids — how light/tea-like or heavy/syrupy the coffee feels in your mouth'),
      ' vs ',
      labAbbr('Extraction (%EY)', 'Extraction Yield — what percent of dry coffee grounds dissolved into the cup'),
      ' — find why your cup tastes sour, hollow, rich, or bitter, and compute the exact coffee & water weights to hit it.'
    ]));
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
    card.appendChild(buildAxisCaption([
      { kicker: 'X-Axis (%EY)', text: 'Left: Under-Extracted / Sour \u2194 Right: Over-Extracted / Bitter', title: 'Extraction Yield (%EY): how much flavor was pulled from the coffee grounds' },
      { kicker: 'Y-Axis (%TDS)', text: 'Down: Lighter / Tea-Like \u2194 Up: Stronger / Syrupy', title: 'Total Dissolved Solids (%TDS): cup concentration / body' }
    ], { ariaLabel: 'Brew Control Chart Axis Guide' }));
    card.appendChild(forecastBadgeEl);
    card.appendChild(summaryEl);
    card.appendChild(bcTakeaway.el);
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
    const waveTakeaway = createTakeawayBox('bt-wave-takeaway');

    const L = 42, R = 426, PW = 384;
    const T1 = 16, B1 = 162, PH1 = 146;
    const T2 = 172, B2 = 224, PH2 = 52;

    const fmtMmSs = function (sec) {
      const m = Math.floor(sec / 60);
      const sRem = Math.round(sec % 60);
      return m + ':' + String(sRem).padStart(2, '0');
    };

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
        ctx.strokeStyle = isDark ? '#63C4E8' : '#195A73';
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.setLineDash([]);

        /* Lower Band: Laminar Sweet-Spot Flow Ribbon + dM/dt */
        ctx.fillStyle = isDark ? 'rgba(66, 184, 128, 0.16)' : 'rgba(46, 125, 79, 0.16)';
        ctx.fillRect(L, fy(6.5), PW, fy(3.0) - fy(6.5));
        ctx.beginPath();
        for (let i = 0; i < sim.samples.length; i++) {
          const sx = tx(sim.samples[i].t);
          const sy = fy(sim.samples[i].flow);
          if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
        }
        ctx.strokeStyle = isDark ? '#F09148' : '#C46824';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        /* Axis Captions & Time X-Axis Ticks */
        ctx.fillStyle = isDark ? '#CEBDA1' : '#534034';
        ctx.font = '600 9.5px ui-monospace, monospace';
        ctx.fillText(Math.round(sim.maxM) + 'g', 4, T1 + 9);
        ctx.fillText('0g', 16, B1);
        ctx.fillText('98\u00B0C', R - 28, T1 + 9);
        ctx.fillText('g/s', 12, T2 + 11);
        const tickStep = sim.maxT > 200 ? 60 : 45;
        ctx.textAlign = 'center';
        for (let tTick = 0; tTick <= sim.maxT; tTick += tickStep) {
          const tickX = clamp(tx(tTick), L + 12, R - 12, tx(tTick));
          ctx.fillText(fmtMmSs(tTick), tickX, B2 + 14);
        }
        ctx.textAlign = 'left';
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
      const cutSec = clamp(Math.round(w.cutoffSec || (endDrainSec - 15)), 60, Math.round(endDrainSec), Math.max(60, Math.round(endDrainSec) - 15));
      const spEnd = sim.samples[clamp(Math.round(endDrainSec), 0, sim.samples.length - 1, sim.samples.length - 1)];
      const spCut = sim.samples[cutSec];
      const pullCarafeG = Math.round(spCut.carafeG || 210);
      const bittersBlockedPct = spEnd.yB > 0.005 ? Math.max(0, Math.round((1 - spCut.yB / spEnd.yB) * 100)) : 0;
      const sugarsKeptPct = spEnd.yS > 0.005 ? Math.min(100, Math.round((spCut.yS / spEnd.yS) * 100)) : 100;
      const earlyDeltaSec = Math.max(0, Math.round(endDrainSec - cutSec));

      /* Tactile Draggable Emerald Cutoff Gate Handle right on the chart (shifted 14px lower & clamped clear of axis labels) */
      const sweetZoneLbl = CK.svgEl('text', {
        x: (L + PW * 0.48).toFixed(1),
        y: (T1 + 14).toFixed(1),
        'text-anchor': 'middle',
        class: 'bt-chart-zone-lbl is-good'
      });
      sweetZoneLbl.textContent = 'Sweet Spot Band (Wave 2 Sugars)';
      cutoffHandleG.appendChild(sweetZoneLbl);

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
        cutoffRangeEl.max = String(Math.round(endDrainSec));
        cutoffRangeEl.value = String(cutSec);
      }
      if (cutoffRangeEl) {
        cutoffRangeEl.setAttribute('aria-valuetext', fmtMmSs(cutSec) + ' (~' + pullCarafeG + ' g in carafe)');
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
          text: 'Polarity Kinetics & First-Law Open-CV Calorimetry \u00B7 Wave 1 Bright Acids ' + Math.round(sp.yA * 100) + '% · Wave 2 Sweet Sugars ' + Math.round(sp.yS * 100) + '% · Wave 3 Dry Bitters ' + Math.round(sp.yB * 100) + '% — drag Cutoff Gate pill or diamond pour knots.'
        }));
      }
      if (earlyDeltaSec > 0) {
        waveTakeaway.set(
          'Lifting the dripper ' + earlyDeltaSec + 's early at ' + fmtMmSs(cutSec) + ' (~' + pullCarafeG + ' g in carafe) skips the bitter late tail — blocking ' +
          bittersBlockedPct + '% of Wave 3 dry bitters while preserving ' + sugarsKeptPct + '% of sweet sugars (slurry ' + fmtTempPref(sp.tempC, 1) + ').',
          bittersBlockedPct >= 15 ? 'good' : 'info'
        );
      } else {
        waveTakeaway.set(
          'Full drain to ' + fmtMmSs(cutSec) + ' (~' + pullCarafeG + ' g in carafe) extracts maximum strength, including late Wave 3 bitters — slide the green Cutoff Gate 10–20s left if your cup finishes dry or astringent.',
          'warn'
        );
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
      'aria-valuetext': fmtMmSs(w.cutoffSec || 150) + ' pull cutoff',
      oninput: function () {
        w.cutoffSec = parseInt(cutoffRangeEl.value, 10) || 150;
        w.scrubT = w.cutoffSec;
        CK.haptic('tick');
        renderWaveCanvasAndOverlay();
      }
    });

    CK.bindChartSurface(svg, {
      ariaLabel: 'Extraction Wave Pour Knots, Cutoff Gate and Replay Scrubber',
      ariaMin: 65,
      ariaMax: 260,
      ariaNow: w.cutoffSec || 150,
      ariaText: fmtMmSs(w.cutoffSec || 150) + ' pull cutoff',
      detentStep: 5,
      getHandles: function () {
        if (!cachedSim) return [];
        const list = [{
          id: 'cutoff_gate',
          hitRadiusPx: 30,
          getPos: function () {
            const endSec = Math.round(w.knots[w.knots.length - 1].t);
            const cSec = clamp(Math.round(w.cutoffSec || 150), 60, endSec, 150);
            const rawX = L + (cSec / cachedSim.maxT) * PW;
            return { x: clamp(rawX, L + 46, R - 48, rawX), y: T1 + 42 };
          },
          onMove: function (p) {
            const endSec = Math.round(w.knots[w.knots.length - 1].t);
            const nextSec = Math.round(clamp(((p.ux - L) / PW) * cachedSim.maxT, 65, endSec, w.cutoffSec) / 5) * 5;
            w.cutoffSec = nextSec;
            w.scrubT = nextSec;
            renderWaveCanvasAndOverlay();
            const spC = cachedSim.samples[clamp(nextSec, 0, cachedSim.samples.length - 1, nextSec)];
            const spE = cachedSim.samples[clamp(Math.round(w.knots[w.knots.length - 1].t), 0, cachedSim.samples.length - 1, cachedSim.samples.length - 1)];
            const blk = spE.yB > 0.005 ? Math.max(0, Math.round((1 - spC.yB / spE.yB) * 100)) : 0;
            const mm = Math.floor(nextSec / 60) + ':' + String(Math.round(nextSec % 60)).padStart(2, '0');
            return {
              detentValue: nextSec,
              ariaNow: nextSec,
              ariaText: mm + ' (' + Math.round(spC.carafeG || 200) + ' g, ' + blk + '% bitters blocked)',
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
        return { ariaNow: w.scrubT, ariaText: 'Replay ' + fmtMmSs(w.scrubT) };
      }
    });

    const matPills = [
      { k: 'plastic', lbl: 'Plastic V60 (51 J/K)', tip: 'Low thermal mass — absorbs very little heat from your brew slurry' },
      { k: 'glass', lbl: 'Glass (100 J/K)', tip: 'Medium thermal mass — give a quick hot rinse before brewing' },
      { k: 'ceramic', lbl: 'Ceramic (177 J/K)', tip: 'High thermal mass — steals 4–6 °C if not preheated with hot water' },
      { k: 'vacuum', lbl: 'Vacuum SS (14 J/K)', tip: 'Insulated steel — holds slurry heat steady throughout drawdown' }
    ].map(function (m) {
      return domH('button', {
        type: 'button',
        class: 'bt-lab-chip' + (w.material === m.k ? ' is-active' : ''),
        title: m.tip,
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
      { k: 'cold', lbl: 'Cold Dripper', tip: 'Room-temp unheated dripper — steals heat from the bloom' },
      { k: 'warm', lbl: 'Tap Warm', tip: 'Rinsed with warm tap water (~35 °C) — halves heat loss' },
      { k: 'boiling', lbl: 'Boiling Rinse', tip: 'Preheated with boiling kettle water — preserves maximum slurry heat' }
    ].map(function (pr) {
      return domH('button', {
        type: 'button',
        class: 'bt-lab-chip' + (w.preheat === pr.k ? ' is-active' : ''),
        title: pr.tip,
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
    card.appendChild(buildWhatBox('What this tool does', [
      'Coffee compounds dissolve in 3 waves: ',
      domH('strong', { text: '1. Bright Acids' }),
      ' extract first, ',
      domH('strong', { text: '2. Sweet Sugars' }),
      ' peak in the middle, and ',
      domH('strong', { text: '3. Dry Bitters' }),
      ' creep in during the final seconds of drawdown. Adjust kettle temp, ',
      labAbbr('Grind D50', 'Median particle size in microns (µm) — finer slows drawdown and extracts faster'),
      ', or drag the green Cutoff Gate to stop the brew before bitters take over.'
    ]));
    card.appendChild(waveHow.panel);
    card.appendChild(domH('div', { class: 'bt-lab-chip-row' },
      domH('span', { class: 'bt-lab-inline-lbl', text: 'Dripper Body:' }),
      matPills
    ));
    card.appendChild(domH('div', { class: 'bt-lab-chip-row' },
      domH('span', { class: 'bt-lab-inline-lbl', text: 'Preheat:' }),
      prePills,
      CK.vernierPill({
        label: 'Kettle',
        title: 'Water temperature leaving your kettle — hotter water extracts faster and pulls late bitters sooner',
        value: w.kettleC,
        min: 80,
        max: 100,
        step: 0.5,
        decimals: 1,
        unit: 'C',
        formatValue: function (v) { return fmtTempPref(v, 1); },
        compact: true,
        onChange: function (v) { w.kettleC = v; renderWaveCanvasAndOverlay(); }
      }),
      CK.vernierPill({
        label: 'Grind D50',
        title: 'Median coffee particle width in microns (µm) — finer (<500 µm) slows flow and boosts extraction; coarser (>700 µm) drains faster',
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
    card.appendChild(buildAxisCaption([
      { kicker: 'X-Axis (Brew Time)', text: 'Left: 0:00 Bloom (Acids) \u2192 Mid: Main Pour (Sugars) \u2192 Right: Final Drain (Bitters)' },
      { kicker: 'Y-Axis', text: 'Top: Pour Weight (g) & Slurry Temp (°C) · Bottom Band: Pour Flow Rate (g/s)' }
    ], { ariaLabel: '3-Wave Chart Axis Guide' }));
    card.appendChild(domH('div', { class: 'bt-cutoff-scrubber-box' },
      domH('div', { class: 'bt-cutoff-head' },
        cutoffLblEl,
        domH('div', { class: 'bt-lab-chip-row' },
          domH('button', {
            type: 'button',
            class: 'bt-lab-chip',
            title: 'Lift the dripper 15 seconds before the final drain to skip Wave 3 bitter/astringent tail',
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
            title: 'Let every drop finish draining into the carafe for maximum body and strength',
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
    card.appendChild(waveTakeaway.el);
    function resolveWaveTargetGrindUm(a, waveUm) {
      const mLow = String((a && a.brew && a.brew.method) || '').toLowerCase();
      const isEspLike = mLow === 'espresso' || mLow === 'lever_espresso' || mLow === 'turkish';
      if (isEspLike) {
        if (Number.isFinite(+waveUm) && +waveUm >= 120 && +waveUm <= 420) return Math.round(+waveUm);
        const curUm = a && a.brew ? +a.brew.grindUm : NaN;
        return (Number.isFinite(curUm) && curUm >= 120 && curUm <= 420) ? Math.round(curUm) : 235;
      }
      return waveUm;
    }

    card.appendChild(domH('div', { class: 'bt-chart-cta-bar' },
      domH('button', {
        type: 'button',
        class: 'bt-lab-btn is-primary bt-chart-cta-btn',
        id: 'bt-set-cutoff-timer-btn',
        onclick: function () {
          const curA = getApp();
          const curM = String((curA && curA.brew && curA.brew.method) || '').toLowerCase();
          if (curM === 'espresso' || curM === 'lever_espresso') {
            CK.haptic('tick');
            notify('3-Wave Dripper Cutoff is for filter pour-overs; keeping your active Espresso recipe unchanged.');
            return;
          }
          const endSec = Math.round(w.knots[w.knots.length - 1].t);
          const cutSec = clamp(Math.round(w.cutoffSec || 150), 60, endSec, 150);
          const mm = Math.floor(cutSec / 60) + ':' + String(Math.round(cutSec % 60)).padStart(2, '0');
          const spC = cachedSim && cachedSim.samples[clamp(cutSec, 0, cachedSim.samples.length - 1, cutSec)];
          const spE = cachedSim && cachedSim.samples[clamp(endSec, 0, cachedSim.samples.length - 1, cachedSim.samples.length - 1)];
          const carafeG = spC ? Math.round(spC.carafeG || 210) : 210;
          const blkPct = (spC && spE && spE.yB > 0.005) ? Math.max(0, Math.round((1 - spC.yB / spE.yB) * 100)) : 28;
          applyLabToBrewAndGo(function (a) {
            a.brew.pullCarafeAtSec = cutSec;
            a.brew.tempC = w.kettleC;
            syncBrewGrindFields(a, resolveWaveTargetGrindUm(a, w.d50Um));
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
        class: 'bt-lab-btn is-accent',
        onclick: function () {
          const curA = getApp();
          const curM = String((curA && curA.brew && curA.brew.method) || '').toLowerCase();
          if (curM === 'espresso' || curM === 'lever_espresso') {
            CK.haptic('tick');
            notify('3-Wave Filter Waves do not apply to Espresso; keeping your active Espresso recipe unchanged.');
            return;
          }
          const endSec = Math.round(w.knots[w.knots.length - 1].t);
          const cutSec = clamp(Math.round(w.cutoffSec || 150), 60, endSec, 150);
          const mm = Math.floor(cutSec / 60) + ':' + String(Math.round(cutSec % 60)).padStart(2, '0');
          applyLabToBrewAndGo(function (a) {
            a.brew.pullCarafeAtSec = cutSec;
            a.brew.tempC = w.kettleC;
            syncBrewGrindFields(a, resolveWaveTargetGrindUm(a, w.d50Um));
            a.brew.customizedNote = '3-Wave Tuned (' + w.kettleC + ' °C · Pull @ ' + mm + ')';
          }, {
            targetStep: 'brew',
            returnRoute: 'tools',
            toast: 'Applied 3-Wave temp, grind & ' + mm + ' Cutoff Gate to your recipe!'
          });
        }
      }, ic('brew', { size: 15 }), domH('span', { text: 'Apply to Active Recipe \u2192' }))
    ));

    if (typeof MutationObserver === 'function' && typeof document !== 'undefined' && document.documentElement) {
      try {
        const waveThemeObs = new MutationObserver(function () {
          if (!card.isConnected) { waveThemeObs.disconnect(); return; }
          renderWaveCanvasAndOverlay();
        });
        waveThemeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      } catch (_) {}
    }

    renderWaveCanvasAndOverlay();
    return card;
  }

  /* ---- In-Mug Emergency Rescue Calculator (Fix the Cup Sitting in Front of You!) ---- */
  function buildInMugRescueCard() {
    const mr = labState.mugRescue;
    const card = domH('section', { class: 'bt-studio-card', id: 'bt-studio-mug-rescue' });
    const verdictBox = domH('div', { class: 'bt-mug-rescue-verdict' });
    const mugTakeaway = createTakeawayBox('bt-mug-takeaway');
    const mugSvg = CK.svgEl('svg', {
      viewBox: '0 0 460 148',
      class: 'bt-chart-svg bt-mug-rescue-svg',
      'aria-label': 'In-Mug Emergency Rescue Cross-Section Gauge'
    });
    const mugG = CK.svgEl('g');
    mugSvg.appendChild(mugG);

    const symptoms = [
      { k: 'bitter', lbl: 'Too Bitter / Harsh', tip: 'Cup tastes dry, roasty, or harsh — calculates exact hot bypass water & saline drops to calm bitterness' },
      { k: 'sour', lbl: 'Too Sour / Sharp', tip: 'Cup tastes sharp, lemony, or under-extracted — calculates gentle cooling/saline & next-brew finer grind' },
      { k: 'strong', lbl: 'Too Strong / Heavy', tip: 'Cup tastes syrupy or overly intense — calculates exact 80 °C hot water dilution to hit balanced %TDS' },
      { k: 'sour_bitter', lbl: 'Sour + Bitter (Channeled)', tip: 'Both sharp and drying at once from uneven water channeling — balances the mug now and fixes pour agitation' },
      { k: 'weak', lbl: 'Too Weak / Watery', tip: 'Cup tastes thin or hollow — avoids adding water and guides cooling + tighter ratio next brew' }
    ];

    let tdsRescuePill = null;
    const symBtns = symptoms.map(function (sy) {
      return domH('button', {
        type: 'button',
        class: 'bt-lab-chip' + (mr.symptom === sy.k ? ' is-active' : ''),
        title: sy.tip,
        'aria-pressed': String(mr.symptom === sy.k),
        onclick: function () {
          mr.symptom = sy.k;
          if (!(mr.tdsPct > 4.0)) {
            if (sy.k === 'weak') mr.tdsPct = 1.05;
            else if (sy.k === 'strong') mr.tdsPct = 1.62;
            else mr.tdsPct = 1.48;
          }
          if (tdsRescuePill) tdsRescuePill.setValue(mr.tdsPct, true);
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
      min: '5',
      max: '900',
      step: '5',
      value: String(mr.mugG),
      'aria-label': 'Beverage weight in mug in grams',
      oninput: function () {
        const v = parseFloat(mugWeightIn.value);
        if (Number.isFinite(v) && v >= 5) {
          mr.mugG = clamp(v, 5, 900, mr.mugG);
          if (v > 900) mugWeightIn.value = String(mr.mugG);
          paintMugRescue();
        }
      }
    });

    const milkToggle = domH('button', {
      type: 'button',
      class: 'bt-lab-chip' + (mr.milkAllowed ? ' is-active' : ''),
      title: 'Include a splash of warm milk or oat milk to bind bitter tannins and soften sharp acidity',
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
      if (tdsRescuePill && Math.abs(tdsRescuePill.getValue() - mr.tdsPct) > 0.005) {
        tdsRescuePill.setValue(mr.tdsPct, true);
      }
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
      c2.textContent = res.saline20Drops > 0
        ? ('2. Saline Blocker: ' + res.saline20Drops + ' drops 20% NaCl (~' + res.naclMg + ' mg)')
        : '2. Saline Blocker: 0 drops (none needed)';
      mugG.appendChild(c2);

      const c3 = CK.svgEl('text', { x: '158', y: '104', class: 'bt-ag-ruler-name' });
      c3.textContent = mr.milkAllowed ? ('3. Optional 60 °C Milk/Oat: +' + res.warmMilk60CG + ' g') : '3. Sip at 55–58 °C Peak Sweetness Window';
      mugG.appendChild(c3);

      verdictBox.textContent = '';
      const rescueSteps = [];
      if (res.bypass80CG > 0) rescueSteps.push('stir in +' + res.bypass80CG + ' g hot water (~80 °C) to soften concentration');
      if (res.saline20Drops > 0) rescueSteps.push('add ' + res.saline20Drops + ' drops 20% saline (or a tiny pinch of salt) to mute bitter receptors');
      if (mr.milkAllowed && res.warmMilk60CG > 0) rescueSteps.push('fold in +' + res.warmMilk60CG + ' g warm milk/oat to bind harsh tannins');
      if (!rescueSteps.length) rescueSteps.push('let the mug cool 2–3 minutes toward 55–58 °C (131–136 °F) so your tongue tastes sweetness instead of heat');
      mugTakeaway.set(
        'Right now in your ' + Math.round(res.mugG) + ' g mug: ' + rescueSteps.join(', then ') + '. Next brew: ' + res.nextBrewFix,
        mr.symptom === 'weak' ? 'info' : 'good'
      );
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
                const mLow = String((a.brew && a.brew.method) || '').toLowerCase();
                const isEspLike = mLow === 'espresso' || mLow === 'lever_espresso' || mLow === 'turkish';
                const isConcLike = isEspLike || mLow === 'moka' || mLow === 'cold_brew' || mLow === 'coldbrew' || mLow === 'cold-brew';
                const umLo = isEspLike ? 120 : 200;
                const umHi = isEspLike ? 420 : 1150;
                const umStep = isEspLike ? 12 : 26;
                const curUm = clamp(+a.brew.grindUm || (isEspLike ? 235 : 550), umLo, umHi, isEspLike ? 235 : 550);
                const curT = clamp(+a.brew.tempC || 93, 80, 100, 93);
                const curR = clamp(+a.brew.ratio || (isEspLike ? 2.0 : 16), 1.2, 22, isEspLike ? 2.0 : 16);
                const curD = clamp(+a.brew.dose || 18, 5, 120, 18);
                if (mr.symptom === 'bitter') {
                  syncBrewGrindFields(a, Math.min(umHi, curUm + umStep));
                  a.brew.tempC = Math.max(84, curT - 2);
                  a.brew.customizedNote = 'Bitter Fix: Coarser (' + a.brew.grind_setting + ') + ' + a.brew.tempC + ' °C';
                } else if (mr.symptom === 'sour') {
                  syncBrewGrindFields(a, Math.max(umLo, curUm - umStep));
                  a.brew.tempC = Math.min(99, curT + 2);
                  a.brew.customizedNote = 'Sour Fix: Finer (' + a.brew.grind_setting + ') + ' + a.brew.tempC + ' °C';
                } else if (mr.symptom === 'strong') {
                  const rInc = isEspLike ? 0.3 : (isConcLike ? 0.6 : 1.0);
                  a.brew.ratio = +(curR + rInc).toFixed(1);
                  a.brew.water = Math.round(curD * a.brew.ratio);
                  a.brew.customizedNote = 'Strength Fix: Wider 1:' + a.brew.ratio;
                } else if (mr.symptom === 'weak') {
                  const rMin = isEspLike ? 1.2 : (mLow === 'moka' ? 5.0 : (isConcLike ? 4.0 : 11.0));
                  const rDec = isEspLike ? 0.3 : (isConcLike ? 0.6 : 1.2);
                  a.brew.ratio = Math.max(rMin, +(curR - rDec).toFixed(1));
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
    card.appendChild(buildWhatBox('What this tool does', [
      'Already poured a sour, weak, or bitter mug? Pick what it tastes like below for an instant at-table fix (hot bypass water, a drop of saline to quiet bitterness, warm milk, or cooling time) — without tossing the cup.'
    ]));
    card.appendChild(buildStepRibbon([
      { text: 'Pick how your mug tastes', title: 'Tap the taste symptom that matches your cup right now' },
      { text: 'Enter mug weight (g)', title: 'Estimate or weigh the coffee currently sitting in your mug' },
      { text: 'Follow the instant fix', title: 'Apply hot bypass water, saline drops, or save the next-brew adjustment' }
    ]));
    card.appendChild(domH('div', { class: 'bt-lab-chip-row' }, symBtns));
    tdsRescuePill = CK.vernierPill({
      label: 'Est. %TDS',
      title: 'Estimated coffee strength (% Total Dissolved Solids) — auto-adjusted for your chosen taste symptom',
      value: mr.tdsPct,
      min: 0.70,
      max: 12.0,
      step: 0.04,
      decimals: 2,
      unit: '%',
      compact: true,
      onChange: function (v) { mr.tdsPct = v; paintMugRescue(); }
    });
    card.appendChild(domH('div', { class: 'bt-lab-inline-inputs' },
      domH('label', { class: 'bt-lab-field-lbl', title: 'How much brewed coffee is currently sitting in your mug (typical mug ≈ 220–250 g)' },
        domH('span', { text: 'Cup in Mug (g)' }),
        mugWeightIn
      ),
      tdsRescuePill,
      milkToggle
    ));
    card.appendChild(domH('div', { class: 'bt-chart-stage' }, mugSvg));
    card.appendChild(verdictBox);
    card.appendChild(mugTakeaway.el);
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
    const pkTakeaway = createTakeawayBox('bt-pk-takeaway');
    const safeSipHero = domH('div', { class: 'bt-pk-safesip-hero', id: 'bt-pk-safesip-hero' });
      const scheduleSummaryPill = domH('div', {
        class: 'bt-pk-daily-schedule-pill num-tab',
        id: 'bt-pk-daily-schedule-pill',
        role: 'region',
        'aria-label': 'Daily Coffee Budget and Cutoff Schedule',
        style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(128px,1fr));gap:8px;padding:10px 12px;border-radius:14px;background:var(--bg-subtle, #F2EAE0);border:1px solid var(--line, #DCCDBE);box-sizing:border-box;min-width:0;max-width:100%;'
      });
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

    function fmtSafeSip(hOpt) {
      return hOpt == null ? 'No safe time today' : fmtClock(hOpt);
    }

    /* 25-Step Bisection for Latest Safe Single-Cup Cutoff */
    function solveLatestSafeHourForCup(cupMg) {
      const bed = getBedAdj();
      const hl = getCyp().halfLifeH;
      const ke = Math.LN2 / hl;
      const ka = pk.fedMode ? 2.2 : 4.0;
      const remWake = pk.steadyState
        ? batemanPeriodicImpulse(cupMg, bed, pk.wakeHour, ka, ke)
        : batemanSingleImpulse(cupMg, bed - pk.wakeHour, ka, ke);
      if (remWake > pk.swsGateMg) return null;
      let lo = pk.wakeHour;
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
      let bestBedMg = Infinity;
      for (let stepH = 0; stepH <= 16; stepH += 1 / 12) {
        const testCups = pk.cups.map(function (c) {
          return { mg: c.mg, hour: Math.max(pk.wakeHour, c.hour - stepH) };
        });
        const bedMg = activeCaffeineMgAt(testCups, bed, hl, pk.steadyState, pk.fedMode);
        bestBedMg = bedMg;
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
      if (bestBedMg > pk.swsGateMg) {
        notify('Shifted cups as early as wake, but ' + Math.round(bestBedMg) + ' mg still remains at bed (limit ' + pk.swsGateMg + ' mg) — consider Half-Caf or removing a cup.');
      }
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
      const pkYLbl = CK.svgEl('text', { x: '6', y: (P.T + 8).toFixed(1), 'text-anchor': 'start', class: 'bt-chart-tick' });
      pkYLbl.textContent = 'mg \u2191';
      bgG.appendChild(pkYLbl);
      const pkYMaxLbl = CK.svgEl('text', { x: (P.L - 5).toFixed(1), y: (P.T + 18).toFixed(1), 'text-anchor': 'end', class: 'bt-chart-tick' });
      pkYMaxLbl.textContent = Math.round(maxMgY);
      bgG.appendChild(pkYMaxLbl);
      const pkYZeroLbl = CK.svgEl('text', { x: (P.L - 5).toFixed(1), y: P.B.toFixed(1), 'text-anchor': 'end', class: 'bt-chart-tick' });
      pkYZeroLbl.textContent = '0';
      bgG.appendChild(pkYZeroLbl);

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
      const flagX = cutoffRefFlag == null
        ? Math.max(P.L + 36, wakeX)
        : clamp(mapHourX(cutoffRefFlag), P.L + 28, Math.max(P.L + 36, bedX - 18), P.L + 160);

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
        class: 'bt-pk-thresh-lbl bt-chart-zone-lbl num-tab'
      });
      threshLbl.textContent = 'Peak Daily Tolerance \u00B7 Bedtime Gate (' + pk.swsGateMg + ' mg)';
      gateG.appendChild(threshLbl);

      /* Last Safe Sip Flagpole */
      const flagW = cutoffRefFlag == null ? 136 : 116;
      gateG.appendChild(CK.svgEl('line', {
        x1: flagX.toFixed(1),
        y1: (P.T + 16).toFixed(1),
        x2: flagX.toFixed(1),
        y2: P.B,
        class: 'bt-pk-flagpole'
      }));
      const flagBannerX = clamp(flagX - flagW * 0.5, P.L + 2, P.R - flagW - 2, P.L + 2);
      const flagBanner = CK.svgEl('rect', {
        x: flagBannerX.toFixed(1),
        y: (P.T + 16).toFixed(1),
        width: String(flagW),
        height: '16',
        rx: '8',
        class: 'bt-pk-flag-badge'
      });
      gateG.appendChild(flagBanner);
      const flagTxt = CK.svgEl('text', {
        x: (flagBannerX + flagW * 0.5).toFixed(1),
        y: (P.T + 27).toFixed(1),
        'text-anchor': 'middle',
        class: 'bt-pk-flag-txt num-tab'
      });
      flagTxt.textContent = cutoffRefFlag == null ? 'No safe time today' : ('Last Safe Sip ' + fmtClock(cutoffRefFlag));
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
      const glY = (gateY + 13 <= P.B - 4) ? (gateY + 13) : Math.max(P.T + 12, gateY - 17);
      const gl = CK.svgEl('text', {
        x: Math.max(P.L + 165, bedX - 5).toFixed(1),
        y: glY.toFixed(1),
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
          text: cutoffRefFlag == null
            ? ('No safe time today (exceeds ' + pk.swsGateMg + ' mg at ' + fmtClock(bed) + ')')
            : (fmtClock(cutoffRefFlag) + ' for ' + fmtClock(bed) + ' sleep')
        }),
        domH('span', {
          class: 'bt-pk-safesip-sub num-tab',
          text: 'Full Cup (~150 mg): ' + fmtSafeSip(cutoffRefFlag) + '  ·  Half-Caf / Single Shot (~75 mg): ' + fmtSafeSip(cutoffEspFlag) +
            '  ·  Peak Focus Zone: ' + fmtClock(pfStartH) + '–' + fmtClock(pfEndH)
        })
      ));

      /* Readout Banner & Daily Coffee Budget & Cutoff Summary Pill */
      const totalDailyMg = pk.cups.reduce(function (acc, c) { return acc + c.mg; }, 0);
      const budgetRemainingMg = Math.max(0, cyp.dailyCapMg - totalDailyMg);
      const gateHeadroomMg = Math.round(pk.swsGateMg - bedMg);
      const wakeShort = fmtClock(pk.wakeHour).replace(':00 ', '').toLowerCase();
      const peakWinText = fmtClock(pfStartH) + '\u2013' + fmtClock(pfEndH);
      const cutoffText = cutoffRefFlag == null ? 'Over Limit Today' : fmtClock(cutoffRefFlag);
      const gateRemainingText = gatePass
        ? (gateHeadroomMg + ' mg under ' + pk.swsGateMg + ' mg')
        : ('+' + Math.abs(gateHeadroomMg) + ' mg vs ' + pk.swsGateMg + ' mg');

      scheduleSummaryPill.textContent = '';
      scheduleSummaryPill.appendChild(domH('div', {
        class: 'bt-pk-sched-item',
        style: 'display:flex;flex-direction:column;gap:2px;padding:6px 9px;border-radius:10px;background:var(--surface, #FFFFFF);border:1px solid var(--line-hairline, rgba(28,19,14,0.09));min-width:0;'
      },
        domH('span', { style: 'font-size:0.68rem;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;color:var(--ink-muted, #6E5849);', text: 'Wake & Budget' }),
        domH('strong', { style: 'font-size:0.84rem;line-height:1.25;color:var(--ink, #1C130E);', text: 'Wake ' + wakeShort + ' · ' + budgetRemainingMg + ' mg left' })
      ));
      scheduleSummaryPill.appendChild(domH('div', {
        class: 'bt-pk-sched-item',
        style: 'display:flex;flex-direction:column;gap:2px;padding:6px 9px;border-radius:10px;background:var(--surface, #FFFFFF);border:1px solid var(--line-hairline, rgba(28,19,14,0.09));min-width:0;'
      },
        domH('span', { style: 'font-size:0.68rem;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;color:var(--ink-muted, #6E5849);', text: 'Peak Window' }),
        domH('strong', { style: 'font-size:0.84rem;line-height:1.25;color:var(--good, #1B6341);', text: peakWinText })
      ));
      scheduleSummaryPill.appendChild(domH('div', {
        class: 'bt-pk-sched-item',
        style: 'display:flex;flex-direction:column;gap:2px;padding:6px 9px;border-radius:10px;background:var(--surface, #FFFFFF);border:1px solid var(--line-hairline, rgba(28,19,14,0.09));min-width:0;'
      },
        domH('span', { style: 'font-size:0.68rem;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;color:var(--ink-muted, #6E5849);', text: 'Cutoff Time' }),
        domH('strong', {
          style: 'font-size:0.84rem;line-height:1.25;color:' + (cutoffRefFlag == null ? 'var(--bad, #A1231F)' : 'var(--primary, #1B4D38)') + ';',
          text: cutoffText
        })
      ));
      scheduleSummaryPill.appendChild(domH('div', {
        class: 'bt-pk-sched-item',
        style: 'display:flex;flex-direction:column;gap:2px;padding:6px 9px;border-radius:10px;background:var(--surface, #FFFFFF);border:1px solid var(--line-hairline, rgba(28,19,14,0.09));min-width:0;'
      },
        domH('span', { style: 'font-size:0.68rem;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;color:var(--ink-muted, #6E5849);', text: 'Bedtime Gate (' + fmtClock(bed) + ')' }),
        domH('strong', {
          style: 'font-size:0.84rem;line-height:1.25;color:' + (gatePass ? 'var(--good, #1B6341)' : 'var(--bad, #A1231F)') + ';',
          text: gateRemainingText
        })
      ));

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
      if (gatePass) {
        pkTakeaway.set(
          'At your ' + cyp.label + ' metabolism speed (' + cyp.halfLifeH.toFixed(1) + 'h half-life), only ~' + Math.round(bedMg) +
          ' mg remains at ' + fmtClock(bed) + ' bedtime (under your ' + pk.swsGateMg + ' mg deep-sleep gate). Finish any extra full cup by ' +
          fmtSafeSip(cutoffRefFlag) + ' (or half-caf by ' + fmtSafeSip(cutoffEspFlag) + ').',
          'good'
        );
      } else {
        pkTakeaway.set(
          'Sleep Alert: ~' + Math.round(bedMg) + ' mg caffeine will still be active at ' + fmtClock(bed) +
          ' (' + Math.abs(gateHeadroomMg) + ' mg above your ' + pk.swsGateMg + ' mg deep-sleep limit with a ' + cyp.halfLifeH.toFixed(1) +
          'h half-life). Tap Auto-Slide below to move cups earlier, or switch your afternoon cup to Half-Caf / Decaf.',
          'warn'
        );
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
              persistCaffeinePrefs();
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
            persistCaffeinePrefs();
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
          onChange: function (v) { sel.doseG = v; recomputeCupMg(sel); persistCaffeinePrefs(); redrawPk(); }
        }),
        domH('button', {
          type: 'button',
          class: 'bt-lab-btn is-sm',
          onclick: function () {
            pk.deletedCup = pk.cups.splice(pk.selectedCupIdx, 1)[0];
            pk.selectedCupIdx = Math.max(0, pk.cups.length - 1);
            persistCaffeinePrefs();
            redrawPk();
          }
        }, ic('trash-bin', { size: 14 }), domH('span', { text: 'Remove Cup' }))
      ));
      inspectorRow.appendChild(domH('div', { class: 'bt-lab-chip-row' }, speciesChips));
    }

    CK.bindChartSurface(svg, {
      ariaLabel: '24-Hour Caffeine Cup Tokens and Wake/Bed Curtains',
      ariaMin: 0,
      ariaMax: 24,
      ariaNow: pk.cups[pk.selectedCupIdx] ? pk.cups[pk.selectedCupIdx].hour : pk.wakeHour,
      ariaText: pk.cups[pk.selectedCupIdx] ? (pk.cups[pk.selectedCupIdx].label + ' at ' + fmtClock(pk.cups[pk.selectedCupIdx].hour)) : ('Wake ' + fmtClock(pk.wakeHour)),
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
                persistCaffeinePrefs();
                redrawPk();
                return { loupe: 'Removed cup (Tap Undo below)' };
              }
              const rawH = invHourX(p.ux);
              cup.hour = Math.round(clamp(rawH, pk.wakeHour, getBedAdj(), cup.hour) * 12) / 12;
              persistCaffeinePrefs();
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
            persistCaffeinePrefs();
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
            persistCaffeinePrefs();
            redrawPk();
            return { detentValue: pk.wakeHour, loupe: 'Wake: ' + fmtClock(pk.wakeHour) };
          }
        });
        return list;
      },
      onDragEnd: function () {
        persistCaffeinePrefs();
      },
      onKeyStep: function (k) {
        const sel = pk.cups[pk.selectedCupIdx];
        if (!sel) return {};
        sel.hour = Math.round(clamp(sel.hour + k.dx * (1 / 12), pk.wakeHour, getBedAdj(), sel.hour) * 12) / 12;
        persistCaffeinePrefs();
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
      const tipTxt = cp.label + ': caffeine half-life ~' + cp.halfLifeH + ' hours (time for your liver to clear half of a dose; daily cap ' + cp.dailyCapMg + ' mg)';
      return domH('button', {
        type: 'button',
        class: 'bt-lab-chip' + (pk.cypKey === cp.key ? ' is-active' : ''),
        title: tipTxt,
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
      style: 'min-width:0;width:100%;max-width:100%;box-sizing:border-box;',
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
          domH('strong', { class: 'num-tab', text: fmtSafeSip(latestHr) })
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
    cafCupCard.appendChild(buildWhatBox('What this lookup does', [
      'Pick any cafe or home drink to see its caffeine mg and exact cutoff time, or toggle ',
      domH('strong', { text: 'Scoop vs Scale Trap' }),
      ' to see why 2 scoops of dense light-roast beans pack +41% more caffeine than dark roast.'
    ]));
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
    card.appendChild(buildWhatBox('What this tool does', [
      'Models how long caffeine stays active in your bloodstream to find your exact ',
      domH('strong', { text: 'Last Safe Sip' }),
      ' cutoff before bed. Choose your ',
      labAbbr('CYP1A2', 'The liver enzyme gene that sets your caffeine half-life: Fast ~3h, Normal/Typical ~5h, Slow ~6.8h, Oral Contraceptives ~9h, Pregnancy ~13h'),
      ' metabolism speed (how many hours it takes to clear half a dose), then drag cup pills left/right along the bottom track.'
    ]));
    card.appendChild(pkHow.panel);
    card.appendChild(safeSipHero);
    card.appendChild(scheduleSummaryPill);
    card.appendChild(domH('div', { class: 'bt-lab-chip-row' },
      domH('span', { class: 'bt-lab-inline-lbl', title: 'CYP1A2 liver gene speed — sets your caffeine half-life (hours to drop by 50%)' }, 'Metabolism Speed (', labAbbr('CYP1A2', 'Fast / Normal / Slow caffeine gene metabolism'), '):'),
      cypBtns,
      steadyBtn
    ));
    card.appendChild(domH('div', { class: 'bt-chart-stage' }, svg));
    card.appendChild(buildAxisCaption([
      { kicker: 'X-Axis (24h Clock)', text: 'Wake \u2192 Daytime Peak Focus \u2192 Shaded Sleep Curtain (drag cup pills on bottom bar)' },
      { kicker: 'Curves', text: 'Green = Alertness · Amber = Active Caffeine (mg) · Dashed Line = Deep-Sleep Bedtime Limit' }
    ], { ariaLabel: 'Caffeine Timeline Axis Guide' }));
    card.appendChild(readoutBanner);
    card.appendChild(pkTakeaway.el);
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
    const waterTakeaway = createTakeawayBox('bt-water-takeaway');
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
      zonesG.appendChild(CK.svgZoneLabel(mapX(15) + 4, mapY(100) + 12, 'Ideal 40\u201380 GH \u00B7 20\u201340 KH', { cls: 'is-good' }));
      /* 3. SCA 102-2024 Sweet Spot (KH 40-75, GH 50-175) */
      zonesG.appendChild(CK.svgEl('rect', {
        x: mapX(40).toFixed(1), y: mapY(175).toFixed(1),
        width: (mapX(75) - mapX(40)).toFixed(1), height: (mapY(50) - mapY(175)).toFixed(1),
        rx: '8', class: 'bt-wt-zone-sca'
      }));
      zonesG.appendChild(CK.svgZoneLabel((mapX(40) + mapX(75)) * 0.5, mapY(175) + 13, 'SCA Sweet Spot', { anchor: 'middle' }));
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
      const yl = CK.svgEl('text', { x: '10', y: '16', 'text-anchor': 'start', class: 'bt-chart-axis-title' });
      yl.textContent = wt.unitDh ? 'Hardness (dGH) \u2191' : 'Total Hardness GH (ppm) \u2191';
      zonesG.appendChild(yl);

      const xl = CK.svgEl('text', { x: (P.L + P.PW * 0.5).toFixed(1), y: 300, 'text-anchor': 'middle', class: 'bt-chart-axis-title' });
      xl.textContent = wt.unitDh ? 'Alkalinity Buffer (dKH) \u00B7 Bright \u2190 \u2192 Flat' : 'Alkalinity Buffer KH (ppm) \u00B7 Bright \u2190 \u2192 Flat';
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
      const blendWarnStr = spec.tapExceedsTarget
        ? ('Warning: Tap (' + Math.round(wt.ghTap) + ' GH / ' + Math.round(wt.khTap) + ' KH) cannot dilute to ' +
          Math.round(wt.gh) + ' GH / ' + Math.round(wt.kh) + ' KH — actual mix is ' +
          Math.round(spec.blendedGh) + ' GH / ' + Math.round(spec.blendedKh) + ' KH!')
        : '';
      readoutBanner.appendChild(domH('div', { class: 'bt-studio-human-line' },
        domH('strong', {
          text: wt.tapBlendOn
            ? ('Blend ' + spec.tapMl + ' mL Tap + ' + spec.roMl + ' mL RO/ZeroWater' +
              (spec.epsomBoostPpm > 2 && !spec.tapExceedsTarget ? (' (+ ' + spec.epsomBoostPpm + ' ppm Epsom Mg boost)') : '') +
              (blendWarnStr ? ('  ·  ' + blendWarnStr) : ''))
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
      const tapPct = Math.round(spec.fTap * 100);
      const roPct = Math.max(0, 100 - tapPct);
      if (wt.tapBlendOn) {
        waterTakeaway.set(
          spec.tapExceedsTarget
            ? ('Tap water (' + Math.round(wt.ghTap) + ' GH / ' + Math.round(wt.khTap) + ' KH) cannot reach your target by dilution alone — blending ' + tapPct + '% Tap (' + spec.tapMl + ' mL) + ' + roPct + '% RO (' + spec.roMl + ' mL) lands at ' + Math.round(spec.blendedGh) + ' GH / ' + Math.round(spec.blendedKh) + ' KH.')
            : ('Mix ' + tapPct + '% Tap (' + spec.tapMl + ' mL) + ' + roPct + '% RO/ZeroWater (' + spec.roMl + ' mL) to hit ' + Math.round(wt.kh) + ' ppm KH buffer' + (spec.epsomBoostPpm > 2 ? (' and add +' + spec.epsomBoostPpm + ' ppm Epsom Mg²⁺ for fruit sweetness') : '') + ' — boiler scale risk: ' + spec.scaleRisk.toUpperCase() + '.'),
          spec.tapExceedsTarget || spec.scaleRisk === 'severe' ? 'warn' : 'good'
        );
      } else if (wt.gh === 0 && wt.kh === 0) {
        waterTakeaway.set(
          'Pure 0 ppm RO/Distilled water has no flavor-binding minerals (GH) or acid buffer (KH) — use the mineral drops/salts below or blend 30–50% tap water so your cup does not taste sharp and hollow.',
          'warn'
        );
      } else {
        const khTone = wt.kh > 75 ? 'high KH will flatten bright fruit notes into a chalky finish' : (wt.kh < 20 ? 'low KH lets bright, sparkling fruit acidity shine' : 'balanced KH smooths sharp sourness without muting flavor');
        const ghTone = wt.gh < 30 ? 'very soft GH produces a light, delicate cup' : (wt.gh > 150 ? 'heavy GH risks chalkiness & kettle scale' : ('moderate GH (' + Math.round(wt.mgShare * 100) + '% Mg²⁺) grips sweet & fruity aromatics'));
        waterTakeaway.set(
          'At ' + Math.round(wt.gh) + ' ppm GH and ' + Math.round(wt.kh) + ' ppm KH: ' + ghTone + '; ' + khTone + '. Kettle scale risk: ' + spec.scaleRisk.toUpperCase() + '.',
          spec.scaleRisk === 'severe' || wt.kh > 85 ? 'warn' : 'good'
        );
      }

      recipeDeck.textContent = '';
      const lotusDiv = wt.lotusTip === 'round' ? 10 : 5;
      recipeDeck.appendChild(domH('div', { class: 'bt-wt-bottle-card' },
        domH('span', { class: 'bt-wt-bottle-kicker', text: 'Lotus / 10,000 ppm Drops (' + wt.batchL.toFixed(2) + ' L)' }),
        domH('strong', {
          class: 'num-tab',
          text: Math.max(0, Math.round((spec.addGhMg * wt.batchL) / lotusDiv)) + ' Mg  ·  ' +
            Math.max(0, Math.round((spec.addGhCa * wt.batchL) / lotusDiv)) + ' Ca  ·  ' +
            Math.max(0, Math.round((spec.remKh * wt.batchL) / (lotusDiv * 0.5))) + ' Buffer drops'
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

    let mgSharePill = null;
    function syncWaterControlPills() {
      if (mgSharePill) mgSharePill.setValue(Math.round(wt.mgShare * 100), true);
      if (typeof khSaltPills !== 'undefined' && Array.isArray(khSaltPills)) {
        khSaltPills.forEach(function (b, bi) {
          const on = ['khco3', 'nahco3', 'k3cit', 'na3cit'][bi] === wt.khSaltKey;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', String(on));
        });
      }
      if (typeof tapToggle !== 'undefined' && tapToggle) {
        tapToggle.classList.toggle('is-active', !!wt.tapBlendOn);
      }
    }

    CK.bindChartSurface(svg, {
      ariaLabel: '2D Water GH and KH Droplet Pad',
      ariaMin: 0,
      ariaMax: 320,
      ariaNow: wt.kh,
      ariaText: wt.gh + ' GH, ' + wt.kh + ' KH ppm',
      detentStep: 1,
      getHandles: function () {
        const list = [{
          id: 'droplet',
          hitRadiusPx: 30,
          getPos: function () { return { x: mapX(wt.kh), y: mapY(wt.gh) }; },
            onMove: function (p) {
              wt.kh = Math.round(invX(p.ux));
              wt.gh = Math.round(invY(p.uy));
              if (!wt.tapBlendOn) wt.isDiyRecipe = true;
              syncWaterStateToAppLive({ markCustom: true, throttleSave: true });
              redrawWater();
              paint4WayAndImpact();
              return { detentValue: wt.kh + wt.gh, loupe: wt.gh + ' GH · ' + wt.kh + ' KH ppm' };
            }
          }];
          if (wt.tapBlendOn) {
            list.push({
              id: 'tap_pin',
              hitRadiusPx: 26,
              getPos: function () { return { x: mapX(wt.khTap), y: mapY(wt.ghTap) }; },
              onMove: function (p) {
                wt.khTap = Math.max(5, Math.round(invX(p.ux)));
                wt.ghTap = Math.max(5, Math.round(invY(p.uy)));
                syncWaterStateToAppLive({ markCustom: true, throttleSave: true });
                redrawWater();
                paint4WayAndImpact();
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
          if (!wt.tapBlendOn) wt.isDiyRecipe = true;
          syncWaterStateToAppLive({ markCustom: true });
          redrawWater();
          paint4WayAndImpact();
          return { detentValue: wt.kh, loupe: wt.gh + ' GH · ' + wt.kh + ' KH ppm' };
        },
        onKeyStep: function (k) {
          wt.kh = clamp(wt.kh + k.dx * 2, 0, 320, wt.kh);
          wt.gh = clamp(wt.gh + k.dy * 2, 0, 340, wt.gh);
          if (!wt.tapBlendOn) wt.isDiyRecipe = true;
          syncWaterStateToAppLive({ markCustom: true });
          redrawWater();
          paint4WayAndImpact();
          return { ariaNow: wt.kh, ariaText: wt.gh + ' GH, ' + wt.kh + ' KH ppm' };
        }
      });

      /* 1-Tap WaterQuickFixer Presets */
      const vibePresets = [
        { lbl: 'Nordic Clarity (55/20)', gh: 55, kh: 20, mg: 0.75, khSalt: 'khco3', tip: 'Light-roast pour-over favorite: low 20 ppm buffer preserves sparkling fruit acidity with 75% Magnesium' },
        { lbl: 'SCA Sweet Spot (70/35)', gh: 70, kh: 35, mg: 0.65, khSalt: 'khco3', tip: 'Official Specialty Coffee Association balanced all-rounder for pour-over & espresso' },
        { lbl: 'RPavlis Boiler-Safe (0/45)', gh: 0, kh: 45, mg: 1.0, khSalt: 'khco3', tip: 'Zero-calcium espresso machine water — 100% scale-free protection for home boilers' },
        { lbl: 'Citrate Clarity (65/45 Cit)', gh: 65, kh: 45, mg: 0.70, khSalt: 'k3cit', tip: 'Scale-free Potassium Citrate buffer that softens sharp acids without chalky flatness' },
        { lbl: 'Evian 2-Bottle Mix', gh: 307, kh: 295, tap: true, tip: 'Simulates blending mineral-rich Evian (307 GH / 295 KH) with Distilled/RO water for instant travel brew water' }
      ].map(function (vp) {
        return domH('button', {
          type: 'button',
          class: 'bt-lab-chip',
          title: vp.tip,
          onclick: function () {
            if (vp.tap) {
              wt.tapBlendOn = true;
              wt.ghTap = 307;
              wt.khTap = 295;
              wt.gh = 72;
              wt.kh = 38;
              wt.isDiyRecipe = false;
            } else {
              wt.tapBlendOn = false;
              wt.gh = vp.gh;
              wt.kh = vp.kh;
              wt.mgShare = vp.mg;
              wt.khSaltKey = vp.khSalt;
              wt.isDiyRecipe = true;
            }
            syncWaterControlPills();
            syncWaterStateToAppLive({ markCustom: true, customLabel: vp.lbl.split(' (')[0] + ' (' + Math.round(wt.gh) + ' GH / ' + Math.round(wt.kh) + ' KH)' });
            CK.haptic('snap');
            redrawWater();
            paintEverydayWater();
            paint4WayAndImpact();
          }
        }, vp.lbl);
      });

      const khSaltPills = [
        { k: 'khco3', lbl: 'KHCO3', tip: 'Potassium Bicarbonate — clean acid buffer with zero salty sodium' },
        { k: 'nahco3', lbl: 'NaHCO3', tip: 'Baking Soda (Sodium Bicarbonate) — easy kitchen buffer; adds trace sodium' },
        { k: 'k3cit', lbl: 'K3Citrate (pH 5.0 0.45x)', tip: 'Potassium Citrate — buffers acid gently without causing boiler limescale' },
        { k: 'na3cit', lbl: 'Na3Citrate', tip: 'Sodium Citrate — scale-free gentle buffer for espresso & filter water' }
      ].map(function (sp) {
        return domH('button', {
          type: 'button',
          class: 'bt-lab-chip' + (wt.khSaltKey === sp.k ? ' is-active' : ''),
          title: sp.tip,
          onclick: function () {
            wt.khSaltKey = sp.k;
            wt.isDiyRecipe = true;
            syncWaterControlPills();
            syncWaterStateToAppLive({ markCustom: true });
            redrawWater();
            paint4WayAndImpact();
          }
        }, sp.lbl);
      });

      const tapToggle = domH('button', {
        type: 'button',
        class: 'bt-lab-chip' + (wt.tapBlendOn ? ' is-active' : ''),
        title: 'Show Tap vs RO/ZeroWater dilution ray to calculate exact % Tap + % RO water mix',
        onclick: function () {
          wt.tapBlendOn = !wt.tapBlendOn;
          tapToggle.classList.toggle('is-active', wt.tapBlendOn);
          syncWaterStateToAppLive({ markCustom: true });
          redrawWater();
          paint4WayAndImpact();
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

    function syncWaterStateToAppLive(syncOpts) {
      const so = syncOpts || {};
      const a = getApp();
      const specLive = wt.tapBlendOn ? solveWaterSpeciation(wt) : null;
      const ghVal = specLive
        ? (wt.kh > wt.khTap ? Math.round(specLive.blendedGh) : Math.round(Math.max(specLive.blendedGh, wt.gh)))
        : Math.max(0, Math.round(wt.gh));
      const khVal = specLive
        ? Math.max(0, Math.round(specLive.blendedKh))
        : Math.max(0, Math.round(wt.kh));
      if (so.markCustom) {
        wt.activeProfileKey = 'custom';
        wt.activeWaterType = 'custom';
        wt.activeWaterLabel = so.customLabel || (wt.tapBlendOn
          ? ('Custom 2-Bottle Mix (' + ghVal + ' GH / ' + khVal + ' KH)')
          : ('Custom Water (' + ghVal + ' GH / ' + khVal + ' KH)'));
      }
      const pKey = wt.activeProfileKey || 'custom';
      const wType = wt.activeWaterType || (pKey === 'custom' ? 'custom' : 'tap');
      const wLbl = wt.activeWaterLabel || (pKey === 'custom' ? ('Custom Water (' + ghVal + ' GH / ' + khVal + ' KH)') : 'Regular Tap (Typical)');
      a.brew = a.brew || {};
      a.prefs = a.prefs || {};
      a.prefs.gear = a.prefs.gear || {};
      a.gear = a.gear || {};
      a.brew.waterProfileKey = pKey;
      a.brew.waterProfile = pKey;
      a.brew.waterType = wType;
      a.brew.water_type = wType;
      a.brew.waterGH = ghVal;
      a.brew.water_gh = ghVal;
      a.brew.waterGhPpm = ghVal;
      a.brew.waterAlk = khVal;
      a.brew.water_alk = khVal;
      a.brew.waterKhPpm = khVal;
      a.brew.waterLabel = wLbl;
      a.prefs.waterProfileKey = pKey;
      a.prefs.waterType = wType;
      a.prefs.waterGhPpm = ghVal;
      a.prefs.waterKhPpm = khVal;
      a.prefs.gear.waterType = wType;
      a.prefs.gear.waterProfileKey = pKey;
      a.prefs.gear.waterGH = String(ghVal);
      a.prefs.gear.waterAlk = String(khVal);
      a.prefs.gear.waterGhPpm = ghVal;
      a.prefs.gear.waterKhPpm = khVal;
      a.gear.waterProfileKey = pKey;
      a.gear.waterType = wType;
      a.gear.waterGH = ghVal;
      a.gear.waterAlk = khVal;
      a.gear.waterGhPpm = ghVal;
      a.gear.waterKhPpm = khVal;
      a.prefs.water = {
        gh: ghVal,
        kh: khVal,
        waterGhPpm: ghVal,
        waterKhPpm: khVal,
        waterType: wType,
        mgShare: wt.mgShare,
        khSaltKey: wt.khSaltKey,
        bottleKey: wt.everydayKey,
        profileKey: pKey,
        tapBlendOn: !!wt.tapBlendOn,
        ghTap: wt.ghTap,
        khTap: wt.khTap
      };
      if (so.immediate) {
        saveDraftNow();
        if (window.BTStorage && typeof window.BTStorage.mirrorPrefsNow === 'function') {
          try { window.BTStorage.mirrorPrefsNow(); } catch (_) {}
        }
      } else {
        saveDraftSoon();
        if (!so.throttleSave && window.BTStorage && typeof window.BTStorage.mirrorPrefsNow === 'function') {
          try { window.BTStorage.mirrorPrefsNow(); } catch (_) {}
        }
      }
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
      style: 'min-width:0;width:100%;max-width:100%;box-sizing:border-box;',
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
        wt.isDiyRecipe = false;
        syncWaterControlPills();
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
      wt.isDiyRecipe = false;
      wt.activeProfileKey = opt.key;
      wt.activeWaterType = opt.wType;
      wt.activeWaterLabel = opt.label;
      syncWaterControlPills();
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
            wt.isDiyRecipe = false;
            if (pickedW.kh > 80 || pickedW.gh > 150) {
              wt.tapBlendOn = true;
              wt.ghTap = pickedW.gh;
              wt.khTap = pickedW.kh;
            } else {
              wt.tapBlendOn = false;
            }
            wt.activeWaterLabel = pickedW.name;
            wt.activeProfileKey = NAMED_18_CANONICAL_MAP[pickedW.key] || 'crystal-geyser-shasta';
            wt.activeWaterType = pickedW.key === 'distilled' ? 'ro' : 'bottled';
            syncWaterControlPills();
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
          syncWaterStateToAppLive({ immediate: true });
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
    card.appendChild(buildWhatBox('What this tool does', [
      'Coffee is 98.5% water. ',
      labAbbr('GH', 'Total Hardness (Ca²⁺ + Mg²⁺ in ppm) — minerals that grip and pull sweet, fruity flavor compounds out of coffee'),
      ' (Total Hardness — Ca²⁺ / Mg²⁺) pulls sweet, fruity flavor, while ',
      labAbbr('KH', 'Carbonate Hardness / Alkalinity Buffer (ppm) — neutralizes sharp acids; too much makes coffee flat and chalky'),
      ' (Carbonate Buffer) tames sharp sourness. Pick your home water, blend ',
      labAbbr('Tap vs RO %', 'Diluting hard tap water with 0-ppm Reverse Osmosis / ZeroWater to hit the sweet spot'),
      ', or drag the droplet on the 2D pad for exact drop/salt recipes.'
    ]));
    card.appendChild(waterHow.panel);
    card.appendChild(selector4WayCard);
    card.appendChild(domH('div', { class: 'bt-lab-chip-row' }, vibePresets, tapToggle));
    mgSharePill = CK.vernierPill({
      label: 'Mg2+ Share',
      title: 'Percent of Total Hardness coming from Magnesium (Mg²⁺ highlights bright fruit/berries; Calcium Ca²⁺ adds creamy body)',
      value: Math.round(wt.mgShare * 100),
      min: 0,
      max: 100,
      step: 5,
      unit: '%',
      compact: true,
      onChange: function (v) { wt.mgShare = v / 100; if (!wt.tapBlendOn) wt.isDiyRecipe = true; syncWaterStateToAppLive({ markCustom: true }); redrawWater(); paintEverydayWater(); paint4WayAndImpact(); }
    });
    card.appendChild(domH('div', { class: 'bt-vernier-row' },
      mgSharePill,
      CK.vernierPill({
        label: 'Batch Vol',
        title: 'Total liters of brewing water you want to blend or mineralize (1.0 L ≈ 3–4 pour-overs)',
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
        title: 'Kettle or espresso boiler temperature — hotter boilers scale faster when Calcium & KH are high',
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
    card.appendChild(buildAxisCaption([
      { kicker: 'X-Axis (KH Buffer)', text: 'Left: Bright & Tart (Low Buffer) \u2194 Right: Smooth \u2192 Flat/Chalky (High Buffer)' },
      { kicker: 'Y-Axis (GH Hardness)', text: 'Down: Soft / Light \u2194 Up: Sweet & Fruity Grip (Red Curve = Kettle Scale Risk)' }
    ], { ariaLabel: 'Water Pad Axis Guide' }));
    card.appendChild(readoutBanner);
    card.appendChild(waterTakeaway.el);
    card.appendChild(recipeDeck);
    card.appendChild(domH('div', { class: 'bt-lab-btn-row' },
      domH('button', {
        type: 'button',
        class: 'bt-lab-btn',
        onclick: function () {
          syncWaterStateToAppLive({ immediate: true });
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
    const vesselTakeaway = createTakeawayBox('bt-vessel-takeaway');
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
      if (vs.flashOn) {
        const meltPct = fl.iceG > 0 ? Math.round((fl.meltedIceG / fl.iceG) * 100) : 0;
        vesselTakeaway.set(
          'Flash-Iced (' + Math.round(vs.iceShare * 100) + '% ice share = ' + fl.iceG + ' g ice + ' + fl.hotPourG + ' g hot pour): ' +
          meltPct + '% of ice melts (' + fl.meltedIceG + ' g) leaving ' + fl.remIceG + ' g solid cubes at ' + fmtTempPref(fl.finalTempC, 1) +
          ' and ' + fl.tdsCupPct + '% TDS. ' + (fl.remIceG < 5 ? 'All ice melted — serve over fresh cubes so the drink stays cold.' : 'Crisp 0 °C chill achieved without watering down flavor!'),
          fl.remIceG < 5 ? 'warn' : 'good'
        );
      } else {
        vesselTakeaway.set(
          'Hot pour of ' + Math.round(totalW) + ' g water over ' + vs.doseG.toFixed(1) + ' g dry coffee yields ' + Math.round(fl.liquidBeverageG) + ' g liquid in your mug (~' + fl.retainedG + ' g stays trapped in the wet grounds) at ~' + fl.tdsCupPct + '% TDS.' +
          (vs.paragonOn ? ' Paragon frozen sphere locks in +' + fl.esterBoostPct + '% delicate floral aromatics with zero ice dilution.' : ''),
          'good'
        );
      }
      if (typeof vesselDosePill !== 'undefined' && vesselDosePill && Math.abs(vesselDosePill.getValue() - vs.doseG) > 0.05) {
        vesselDosePill.setValue(vs.doseG, true);
      }
      if (typeof vesselRatioPill !== 'undefined' && vesselRatioPill && Math.abs(vesselRatioPill.getValue() - vs.ratio) > 0.05) {
        vesselRatioPill.setValue(vs.ratio, true);
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
        { k: 'dairy', lbl: 'Whole Dairy (55-65C)', tip: 'Peak natural lactose sweetness at 55–65 °C; proteins scald and taste cooked above 68 °C' },
        { k: 'lactose_free', lbl: 'Lactose-Free (3.1x Sweet)', tip: 'Enzymatically split into glucose + galactose — tastes ~3× sweeter with zero added sugar' },
        { k: 'eisbock', lbl: 'Freeze-Distilled Eisbock', tip: 'Freeze milk and thaw half to concentrate natural fats, protein, and lactose for competition lattes' },
        { k: 'oat', lbl: 'Barista Oat', tip: 'Creamy maltose sweetness; keep <=56 °C with bright light-roast espresso to avoid curdling' },
        { k: 'almond', lbl: 'Almond', tip: 'Nutty & light-bodied; steam gently <=56 °C and temper into espresso to prevent splitting' },
        { k: 'soy', lbl: 'Soy', tip: 'Rich plant protein foam; sensitive to high acidity above 58 °C' }
      ].map(function (m) {
        return domH('button', {
          type: 'button',
          class: 'bt-lab-chip' + (vs.milkType === m.k ? ' is-active' : ''),
          title: m.tip,
          onclick: function () { vs.milkType = m.k; CK.haptic('tick'); redrawMilkLab(); }
        }, m.lbl);
      });

      /* Compact Milk Steaming Thermal Threshold SVG (55-65C Sweet Spot vs 68C+ Protein Scald) */
      const mkSvg = CK.svgEl('svg', {
        viewBox: '0 0 420 62',
        class: 'bt-chart-svg bt-milk-thermal-svg',
        'aria-label': 'Milk Steaming Temperature Threshold Bar (45 to 78 degrees Celsius)'
      });
      const mkX = function (tC) { return 18 + (clamp((tC - 45) / (78 - 45), 0, 1, 0.5)) * 384; };
      mkSvg.appendChild(CK.svgEl('rect', { x: '18', y: '24', width: '384', height: '14', rx: '7', class: 'bt-chart-plot-bg' }));
      mkSvg.appendChild(CK.svgEl('rect', {
        x: mkX(55).toFixed(1), y: '24', width: (mkX(65) - mkX(55)).toFixed(1), height: '14', rx: '4',
        fill: 'var(--good, #1B6341)', opacity: '0.28'
      }));
      mkSvg.appendChild(CK.svgEl('rect', {
        x: mkX(68).toFixed(1), y: '24', width: (mkX(78) - mkX(68)).toFixed(1), height: '14', rx: '4',
        fill: 'var(--bad, #A1231F)', opacity: '0.24'
      }));
      const scaldX = mkX(68);
      mkSvg.appendChild(CK.svgEl('line', {
        x1: scaldX.toFixed(1), y1: '16', x2: scaldX.toFixed(1), y2: '44',
        stroke: 'var(--bad, #A1231F)', 'stroke-width': '2', 'stroke-dasharray': '3,2'
      }));
      mkSvg.appendChild(CK.svgZoneLabel(mkX(60), 15, '55\u201365 \u00B0C Sweet Spot', { anchor: 'middle', cls: 'is-good' }));
      mkSvg.appendChild(CK.svgZoneLabel(scaldX + 4, 15, '68 \u00B0C+ Protein Scald', { anchor: 'start', cls: 'is-bad' }));
      const curMkX = mkX(vs.steamTempC);
      mkSvg.appendChild(CK.svgEl('circle', {
        cx: curMkX.toFixed(1), cy: '31', r: '6.5',
        fill: vs.steamTempC >= 68 ? 'var(--bad, #A1231F)' : (vs.steamTempC >= 55 && vs.steamTempC <= 65 ? 'var(--good, #1B6341)' : 'var(--accent, #9A4212)'),
        stroke: 'var(--surface, #FFFFFF)', 'stroke-width': '2'
      }));
      [45, 55, 65, 68, 78].forEach(function (tc) {
        const tk = CK.svgEl('text', { x: mkX(tc).toFixed(1), y: '54', 'text-anchor': 'middle', class: 'bt-chart-tick' });
        tk.textContent = tc + '\u00B0C';
        mkSvg.appendChild(tk);
      });

      milkBanner.appendChild(domH('div', { class: 'bt-lab-card-head' },
        domH('div', { class: 'bt-lab-title-group' },
          ic('milk-pitcher', { size: 18 }),
          domH('strong', { text: 'Milk Steaming & Natural Sweetness Lab' })
        ),
        epistemicBadge('verified_physics')
      ));
      milkBanner.appendChild(buildWhatBox('What this milk lab does', [
        'Compare dairy vs plant milk sweetness & foaming heat. Dairy tastes sweetest at ',
        domH('strong', { text: '55–65 °C (131–149 °F)' }),
        '; steaming past ',
        labAbbr('68 °C+ Denaturation', 'Above 68 °C / 154 °F, milk whey proteins irreversibly unfold, releasing cooked/egg-like sulfur notes and collapsing silky microfoam'),
        ' scalds milk flat (and curdles oat/almond/soy in bright light-roast coffee above 58 °C).'
      ]));
      milkBanner.appendChild(domH('div', { class: 'bt-lab-chip-row' }, milkTypes));
      milkBanner.appendChild(domH('div', { class: 'bt-chart-stage' }, mkSvg));
      milkBanner.appendChild(domH('div', { class: 'bt-vernier-row' },
        CK.vernierPill({
          label: 'Milk Mass',
          title: 'Cold milk weight poured into your steaming pitcher before steaming',
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
          title: 'Stop-steaming pitcher temperature — 55–65 °C is peak sweetness; 68 °C+ denatures whey protein and scalds milk',
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
          title: 'Percent of frozen milk thawed and collected — lower draw % concentrates lactose & fat even more',
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
      const milkTakeaway = createTakeawayBox('bt-milk-takeaway');
      if (mk.scaldDanger) {
        milkTakeaway.set(
          'Denaturation Warning (' + fmtTempPref(vs.steamTempC, 0) + ' >= 68 °C): whey proteins are unfolding — expect flat sweetness, cooked sulfur notes, and coarse bubbles. Cut steam at 60–64 °C (140–147 °F).',
          'bad'
        );
      } else if (mk.curdleDanger) {
        milkTakeaway.set(
          'Plant-Milk Curdle Risk at ' + fmtTempPref(vs.steamTempC, 0) + ' in acidic coffee (pH ~' + mk.estCupPh.toFixed(2) + '): steam cooler (<=56 °C / 133 °F) and swirl 15 g milk into the espresso first to temper.',
          'warn'
        );
      } else {
        milkTakeaway.set(
          'At ' + fmtTempPref(vs.steamTempC, 0) + ', ' + vs.milkG + ' g milk steams to ' + mk.finalMilkG + ' g (+' + mk.steamDilutionG + ' g steam water) with ' + mk.sweetnessMult + '× natural sweetness — safe from 68 °C+ protein denaturation.',
          mk.inBetaLgWindow ? 'good' : 'info'
        );
      }
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
              vs.steamTempC = Math.min(56, Math.max(48, vs.steamTempC - 10));
              CK.haptic('snap');
              redrawMilkLab();
            }
          }, 'Apply Cooler Steam Fix (' + Math.min(56, Math.max(48, vs.steamTempC - 10)) + ' °C)') : null,
          domH('button', {
            type: 'button',
            class: 'bt-lab-btn is-sm is-accent',
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
      milkBanner.appendChild(milkTakeaway.el);
    }

    CK.bindChartSurface(svg, {
      ariaLabel: 'Interactive Carafe Liquid Meniscus',
      ariaMin: 2.0,
      ariaMax: 22.0,
      ariaNow: vs.ratio,
      ariaText: '1:' + vs.ratio.toFixed(1) + ' ratio, ' + Math.round(vs.doseG) + ' g dose',
      detentStep: 5,
      onPointer: function (p) {
        const frac = clamp((V_BOT - p.uy) / V_H, 0.08, 0.94, 0.42);
        const targetBev = frac * MAX_BEV;
        const eyFrac = 0.204;
        if (vs.locked === 'ratio') {
          vs.doseG = clamp(targetBev / Math.max(1.5, vs.ratio - vs.rw + eyFrac), 6, 90, vs.doseG);
        } else {
          const reqPour = targetBev + (vs.rw - eyFrac) * vs.doseG;
          vs.ratio = clamp(reqPour / Math.max(1, vs.doseG), 2.0, 22.0, vs.ratio);
        }
        waveAmp = clamp(p.vy * 0.015, -5, 5, 0);
        waveVel = 0;
        waveAnim.wake();
        redrawVessel();
        return {
          detentValue: targetBev,
          ariaNow: vs.ratio,
          ariaText: Math.round(targetBev) + ' g mug, 1:' + vs.ratio.toFixed(1),
          loupe: Math.round(targetBev) + 'g Mug · 1:' + vs.ratio.toFixed(1)
        };
      },
      onKeyStep: function (k) {
        vs.ratio = clamp(vs.ratio + k.dy * 0.5 + k.dx * 0.5, 2.0, 22.0, vs.ratio);
        redrawVessel();
        return { ariaNow: vs.ratio, ariaText: '1:' + vs.ratio.toFixed(1) + ' ratio' };
      }
    });

    const flashBtn = domH('button', {
      type: 'button',
      class: 'bt-lab-chip' + (vs.flashOn ? ' is-active' : ''),
      title: 'Japanese Flash-Iced: brew hot coffee directly over a weighed share of ice cubes so the cup chills instantly without diluting',
      onclick: function () { vs.flashOn = !vs.flashOn; flashBtn.classList.toggle('is-active', vs.flashOn); redrawVessel(); }
    }, ic('ice-cube', { size: 14 }), domH('span', { text: '3-Regime Flash-Iced' }));

    const paragonBtn = domH('button', {
      type: 'button',
      class: 'bt-lab-chip' + (vs.paragonOn ? ' is-active' : ''),
      title: 'Extract chilling over a frozen 48 g steel sphere to trap volatile floral aromatics before they evaporate',
      onclick: function () { vs.paragonOn = !vs.paragonOn; paragonBtn.classList.toggle('is-active', vs.paragonOn); redrawVessel(); }
    }, ic('cryo-snowflake', { size: 14 }), domH('span', { text: '48g Paragon Chilling Sphere' }));

    const vesselHow = CK.createExplainer({
      title: 'Vessel Meniscus, Flash-Ice & Milk Steaming Lab',
      whatItDoes: 'Calculates exact liquid in your mug, Japanese Flash-Iced ice-to-hot-water split, Paragon chilling, and milk steaming sweetness.',
      howToUse: 'Drag the liquid line up or down directly on the carafe; toggle Flash-Iced, Paragon Sphere, or Milk types.',
      proTip: 'Steaming plant milk for bright light-roast espresso? Check the curdle warning and <=56 °C cooler steam fix!'
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
    card.appendChild(buildWhatBox('What this tool does', [
      'Drag the coffee line up/down on the carafe to see exact ',
      domH('strong', { text: 'mug yield vs water trapped in wet grounds' }),
      '. Toggle ',
      domH('strong', { text: 'Flash-Iced' }),
      ' to split total brew water into hot pour + ice cubes (',
      labAbbr('% Ice Share', 'Percent of total brew water placed as solid ice in the carafe — ~35–42% chills coffee to 0 °C without watering it down'),
      ') and check how much ice melts.'
    ]));
    card.appendChild(vesselHow.panel);
    const vesselDosePill = CK.vernierPill({
      label: 'Dose',
      title: 'Dry coffee beans weighed in grams before brewing',
      value: vs.doseG,
      min: 6,
      max: 90,
      step: 0.5,
      decimals: 1,
      unit: 'g',
      compact: true,
      onChange: function (v) { vs.doseG = v; redrawVessel(); }
    });
    const vesselRatioPill = CK.vernierPill({
      label: 'Ratio 1:',
      title: 'Total water (hot pour + ice) per 1 g dry coffee',
      value: vs.ratio,
      min: 2.0,
      max: 22.0,
      step: 0.2,
      decimals: 1,
      unit: '',
      compact: true,
      onChange: function (v) { vs.ratio = v; redrawVessel(); }
    });
    card.appendChild(domH('div', { class: 'bt-lab-chip-row' },
      flashBtn,
      paragonBtn,
      vesselDosePill,
      vesselRatioPill,
      CK.vernierPill({
        label: 'Ice Share',
        title: 'Percent of total water placed as solid ice in the carafe — only melted ice dilutes cup strength',
        value: Math.round(vs.iceShare * 100),
        min: 15,
        max: 55,
        step: 1,
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
            a.brew.ice = vs.iceShare;
            a.brew.technique = 'flash';
            a.brew.style = a.brew.method === 'aiden' ? 'aiden_flash_iced' : (a.brew.method === 'xbloom' ? 'xb_iced' : 'flash-iced');
          } else {
            if (a.brew.technique === 'flash') a.brew.technique = 'standard';
            if (/iced|flash/i.test(a.brew.style || '')) {
              a.brew.style = 'standard';
            }
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
    card.appendChild(buildAxisCaption([
      { kicker: 'Left Carafe', text: 'Drag liquid line up/down to scale drink volume' },
      { kicker: 'Right Column', text: 'Bed = water retained in grounds · Cup = drinkable liquid' }
    ], { ariaLabel: 'Carafe Visualizer Guide' }));
    card.appendChild(readoutBanner);
    card.appendChild(vesselTakeaway.el);
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
    const r4Takeaway = createTakeawayBox('bt-ratio4-takeaway');

    function solveFromAnchor(changedKey, val) {
      const eyFrac = clamp(r4.eyPct, 2, 36, 20.4) / 100;
      if (changedKey === 'dose') {
        r4.doseG = clamp(val, 4, 400, r4.doseG);
        r4.waterG = clamp(Math.round(r4.doseG * r4.ratio), 20, 6000, r4.waterG);
        r4.ratio = +clamp(r4.waterG / Math.max(0.5, r4.doseG), 1.2, 24.0, r4.ratio).toFixed(2);
      } else if (changedKey === 'water') {
        r4.waterG = clamp(val, 20, 6000, r4.waterG);
        if (r4.anchor === 'ratio') {
          r4.doseG = clamp(+(r4.waterG / Math.max(1.2, r4.ratio)).toFixed(1), 4, 400, r4.doseG);
        } else {
          r4.ratio = +clamp(r4.waterG / Math.max(0.5, r4.doseG), 1.2, 24.0, r4.ratio).toFixed(2);
          r4.waterG = clamp(Math.round(r4.doseG * r4.ratio), 20, 6000, r4.waterG);
        }
      } else if (changedKey === 'mug') {
        const targetMug = clamp(val, 15, 3600, r4.mugG);
        r4.mugG = targetMug;
        if (r4.anchor === 'ratio') {
          r4.doseG = clamp(+(targetMug / Math.max(0.8, r4.ratio - r4.rw + eyFrac)).toFixed(1), 4, 400, r4.doseG);
          r4.waterG = clamp(Math.round(r4.doseG * r4.ratio), 20, 6000, r4.waterG);
        } else {
          const rawW = Math.round(targetMug + (r4.rw - eyFrac) * r4.doseG);
          r4.waterG = clamp(rawW, 20, 6000, r4.waterG);
          r4.ratio = +clamp(r4.waterG / Math.max(0.5, r4.doseG), 1.2, 24.0, r4.ratio).toFixed(2);
          if (Math.abs(r4.waterG - r4.doseG * r4.ratio) > 2) {
            r4.doseG = clamp(+(targetMug / Math.max(0.8, r4.ratio - r4.rw + eyFrac)).toFixed(1), 4, 400, r4.doseG);
            r4.waterG = clamp(Math.round(r4.doseG * r4.ratio), 20, 6000, r4.waterG);
          }
        }
      } else if (changedKey === 'ratio') {
        r4.ratio = clamp(val, 1.2, 24.0, r4.ratio);
        if (r4.anchor === 'water') {
          r4.doseG = clamp(+(r4.waterG / r4.ratio).toFixed(1), 4, 400, r4.doseG);
        } else {
          r4.waterG = clamp(Math.round(r4.doseG * r4.ratio), 20, 6000, r4.waterG);
        }
      }
      const dissG = r4.doseG * eyFrac;
      r4.mugG = Math.max(10, Math.round(r4.waterG - r4.rw * r4.doseG + dissG));
      r4.tdsPct = +((100 * dissG) / Math.max(1, r4.mugG)).toFixed(2);
    }

    const doseIn = domH('input', {
      type: 'number', inputmode: 'decimal', class: 'bt-lab-text-in bt-lab-num-in', min: '4', max: '400', step: '0.5', value: String(r4.doseG),
      'aria-label': 'Dry coffee dose in grams',
      oninput: function () { const v = parseFloat(doseIn.value); if (v > 0) { solveFromAnchor('dose', v); if (v > 400) doseIn.value = String(r4.doseG); syncInputs('dose'); } },
      onchange: function () { const v = parseFloat(doseIn.value); solveFromAnchor('dose', Number.isFinite(v) ? v : r4.doseG); doseIn.value = String(r4.doseG); syncInputs(''); }
    });
    const waterIn = domH('input', {
      type: 'number', inputmode: 'decimal', class: 'bt-lab-text-in bt-lab-num-in', min: '20', max: '6000', step: '5', value: String(r4.waterG),
      'aria-label': 'Total brew water in grams',
      oninput: function () { const v = parseFloat(waterIn.value); if (v > 0) { solveFromAnchor('water', v); if (v > 6000) waterIn.value = String(r4.waterG); syncInputs('water'); } },
      onchange: function () { const v = parseFloat(waterIn.value); solveFromAnchor('water', Number.isFinite(v) ? v : r4.waterG); waterIn.value = String(r4.waterG); syncInputs(''); }
    });
    const mugIn = domH('input', {
      type: 'number', inputmode: 'decimal', class: 'bt-lab-text-in bt-lab-num-in', min: '15', max: '3600', step: '5', value: String(r4.mugG),
      'aria-label': 'Beverage yield in mug in grams',
      oninput: function () { const v = parseFloat(mugIn.value); if (v > 0) { solveFromAnchor('mug', v); if (v > 3600) mugIn.value = '3600'; syncInputs('mug'); } },
      onchange: function () { const v = parseFloat(mugIn.value); solveFromAnchor('mug', Number.isFinite(v) ? v : r4.mugG); mugIn.value = String(r4.mugG); syncInputs(''); }
    });
    const ratioIn = domH('input', {
      type: 'number', inputmode: 'decimal', class: 'bt-lab-text-in bt-lab-num-in', min: '1.2', max: '24', step: '0.2', value: String(r4.ratio),
      'aria-label': 'Brew ratio 1 to X',
      oninput: function () { const v = parseFloat(ratioIn.value); if (v > 0) { solveFromAnchor('ratio', v); if (v > 24) ratioIn.value = String(r4.ratio); syncInputs('ratio'); } },
      onchange: function () { const v = parseFloat(ratioIn.value); solveFromAnchor('ratio', Number.isFinite(v) ? v : r4.ratio); ratioIn.value = String(r4.ratio); syncInputs(''); }
    });

    const batchBtns = [1, 2, 3, 4].map(function (nCups) {
      return domH('button', {
        type: 'button',
        class: 'bt-lab-chip' + (r4.cupsBatch === nCups ? ' is-active' : ''),
        title: nCups === 1
          ? 'Scale recipe for 1 single mug'
          : ('Scale coffee & water for ' + nCups + ' cups and coarsen grind ~' + Math.round((Math.pow(nCups, 0.2) - 1) * 100) + '% to keep drawdown time balanced'),
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
    const tdsIn = domH('input', {
      type: 'number',
      id: 'bt-lab-ratio4-tds-input',
      inputmode: 'decimal',
      class: 'bt-lab-text-in bt-lab-num-in',
      style: 'font-size:1rem',
      step: '0.01',
      min: '0.1',
      max: '25',
      value: Number(r4.tdsPct).toFixed(2),
      'aria-label': 'Measured strength percent TDS',
      oninput: function () {
        const v = parseFloat(tdsIn.value);
        if (Number.isFinite(v) && v > 0) {
          r4.tdsPct = +clamp(v, 0.05, 25, r4.tdsPct).toFixed(2);
          r4.eyPct = +clamp((r4.tdsPct * r4.mugG) / Math.max(0.5, r4.doseG), 2, 36, r4.eyPct).toFixed(2);
          syncInputs('tds');
        }
      }
    });

    let _prevR4CanRead = null;
    function syncInputs(skipKey) {
      const actEl = typeof document !== 'undefined' ? document.activeElement : null;
      if (skipKey !== 'dose' && actEl !== doseIn) doseIn.value = String(r4.doseG);
      if (skipKey !== 'water' && actEl !== waterIn) waterIn.value = String(r4.waterG);
      if (skipKey !== 'mug' && actEl !== mugIn) mugIn.value = String(r4.mugG);
      if (skipKey !== 'ratio' && actEl !== ratioIn) ratioIn.value = String(r4.ratio);
      if (skipKey !== 'tds' && actEl !== tdsIn) {
        tdsIn.value = Number(r4.tdsPct).toFixed(2);
      }
      const stR4 = getBleStateSafe();
      const canReadR2 = !!(stR4.refractometerConnected || stR4.simulatorActive);
      _prevR4CanRead = canReadR2;
      const bleR4 = window.BTBle || {};
      const cbConcMl = Math.round(r4.coldBrewServeG / (1 + r4.coldBrewDiluteRatio));
      const cbWaterOrMilkMl = Math.max(0, r4.coldBrewServeG - cbConcMl);
      const darcyShiftClicks = Math.round((Math.pow(r4.doseG / 18.0, 0.20) - 1) * 20);
      outBox.textContent = '';
      outBox.appendChild(domH('div', { class: 'bt-studio-readout-banner' },
        domH('div', { class: 'bt-studio-human-line num-tab', id: 'bt-lab-ratio4-live-readout' },
          domH('strong', {
            text: r4.doseG.toFixed(1) + ' g Dose  \u2194  ' + r4.waterG + ' g Pour Water  \u2194  ' +
              r4.mugG + ' g in Mug  \u2194  1:' + r4.ratio.toFixed(1) + ' (' + r4.tdsPct.toFixed(2) + '% TDS · ' + r4.eyPct.toFixed(1) + '% EY)'
          })
        ),
        domH('p', {
          class: 'bt-lab-hint num-tab',
          text: (isScienceXray()
            ? ('Dripper Sponge Retention r_w = ' + r4.rw.toFixed(2) + ' g/g (' + (r4.rw * r4.doseG).toFixed(1) + ' g held in bed)  ·  Batch Darcy Grind Shift: ')
            : ('Water Held in Grounds: ' + (r4.rw * r4.doseG).toFixed(1) + ' g (' + r4.rw.toFixed(2) + ' g per g coffee)  ·  Large-Batch Grind Guide: ')) +
            (darcyShiftClicks === 0 ? 'Standard 18g grind' : ((darcyShiftClicks > 0 ? '+' : '') + darcyShiftClicks + ' clicks coarser vs 18g')) +
            '  ·  Cold Brew 1:' + r4.coldBrewDiluteRatio + ' Dilution (' + r4.coldBrewServeG + ' g glass): ' + cbConcMl + ' g concentrate + ' + cbWaterOrMilkMl + ' g water/milk'
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
          canReadR2 ? domH('button', {
            type: 'button',
            id: 'bt-lab-ratio4-r2-read-btn',
            class: 'bt-lab-btn is-sm is-accent',
            onclick: function () {
              if (typeof bleR4.triggerRefractometerRead === 'function') {
                Promise.resolve(bleR4.triggerRefractometerRead()).catch(function () {});
              }
            }
          }, ic('ble-wave', { size: 14 }), domH('span', { text: 'Read R2 Now' })) : null,
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
      const r4StrengthWord = r4.ratio <= 4 ? 'concentrated espresso-style' : (r4.ratio < 15 ? 'rich & strong' : (r4.ratio <= 17 ? 'balanced filter' : 'light & tea-like'));
      r4Takeaway.set(
        'Using ' + r4.doseG.toFixed(1) + ' g dry coffee and pouring ' + r4.waterG + ' g water (1:' + r4.ratio.toFixed(1) + ', ' + r4StrengthWord + ') puts ' +
        r4.mugG + ' g drinkable coffee in your mug while ' + (r4.rw * r4.doseG).toFixed(1) + ' g stays soaked in the wet bed. For Cold Brew (1:' +
        r4.coldBrewDiluteRatio + '), pour ' + cbConcMl + ' g concentrate + ' + cbWaterOrMilkMl + ' g water/milk per ' + r4.coldBrewServeG + ' g glass.',
        'good'
      );
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
    card.appendChild(buildWhatBox('What this tool does', [
      'Type any one number — ',
      domH('strong', { text: 'Dry Dose' }),
      ', ',
      domH('strong', { text: 'Pour Water' }),
      ', ',
      labAbbr('Mug Yield', 'Actual drinkable coffee in your mug = Pour Water minus water absorbed by the wet coffee grounds (~2.1 g per 1 g coffee)'),
      ', or ',
      labAbbr('Brew Ratio (1:X)', 'Grams of brew water per 1 g of dry coffee — 1:15 is stronger, 1:17 is lighter'),
      ' — and the other 3 solve automatically. Also calculates exact ',
      domH('strong', { text: 'Cold Brew Concentrate' }),
      ' dilution per glass.'
    ]));
    card.appendChild(buildStepRibbon([
      { text: 'Pick Batch Scale (1\u20134 cups)', title: 'Choose how many mugs you are brewing so dose & water scale together' },
      { text: 'Type any 1 of the 4 anchors', title: 'Edit Dose, Pour Water, Mug Yield, or Ratio — whichever number you know' },
      { text: 'Other 3 solve automatically', title: 'Apply the solved weights straight to your recipe or calibrate wet-grounds retention' }
    ]));
    card.appendChild(domH('div', { class: 'bt-lab-chip-row' },
      domH('span', { class: 'bt-lab-inline-lbl', text: 'Batch Scale:' }),
      batchBtns
    ));
    card.appendChild(domH('div', { class: 'bt-ratio4-grid' },
      domH('label', { class: 'bt-lab-field-lbl', title: 'Dry whole-bean coffee weighed in grams before grinding' }, domH('span', { text: '1. Dry Dose (g)' }), doseIn),
      domH('label', { class: 'bt-lab-field-lbl', title: 'Total hot water poured from your kettle into the brewer' }, domH('span', { text: '2. Pour Water (g)' }), waterIn),
      domH('label', { class: 'bt-lab-field-lbl', title: 'Drinkable liquid coffee in your mug after wet grounds absorb ~2× their weight' }, domH('span', { text: '3. Beverage Mug Yield (g)' }), mugIn),
      domH('label', { class: 'bt-lab-field-lbl', title: 'Water-to-coffee ratio (e.g. 1:16 means 16 g water per 1 g coffee)' }, domH('span', { text: '4. Ratio (1:X)' }), ratioIn)
    ));
    card.appendChild(domH('div', { class: 'bt-lab-inline-inputs' },
      domH('label', { class: 'bt-lab-field-lbl', title: 'Optional refractometer strength reading to back-calculate Extraction Yield (%EY)' },
        domH('span', null, '5. Measured ', labAbbr('%TDS', 'Total Dissolved Solids — cup strength')),
        tdsIn
      ),
      domH('label', { class: 'bt-lab-field-lbl', title: 'Weigh your drained wet coffee bed once after brewing to measure exact water absorption (g/g)' },
        domH('span', { text: '1-Brew Sponge Check: Wet Grounds Wt (g)' }),
        wetBedIn
      ),
      CK.vernierPill({
        label: 'Cold Brew Cut 1:',
        title: 'Parts water or milk added per 1 part cold brew concentrate (e.g. 1:2.5 = 1 part concentrate + 2.5 parts water/milk)',
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
    card.appendChild(r4Takeaway.el);
    syncInputs('');
    _labLiveHooks.ratioYield = function (opts) {
      if (!card.isConnected) return false;
      if (opts && opts.metaOnly) {
        const stNow = getBleStateSafe();
        const nextCan = !!(stNow.refractometerConnected || stNow.simulatorActive);
        if (nextCan === _prevR4CanRead) return true;
      }
      syncInputs('');
      return true;
    };
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
    const agtronTakeaway = createTakeawayBox('bt-agtron-takeaway', 'What this result means \u2192');

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
      stageG.appendChild(CK.svgZoneLabel((AX_L + AX_R) * 0.5, 150, 'Roast Color Map (25 Dark \u2194 65 Medium \u2194 105 Nordic)', { anchor: 'middle' }));
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

      const deltaStr = (delta > 0 ? '+' : '') + delta;
      const scorchMsg = delta >= 12
        ? ('High Radial Gradient (Delta ' + deltaStr + ' >= 12): Outer bean shell roasted darker than dense core \u2192 drop late-pulse temp -1.5 °C to avoid phenylindane bitterness!')
        : (delta < 0
          ? ('Inverted Core Gradient (Delta ' + deltaStr + '): Ground interior reads darker than bean surface.')
          : (delta <= 6 ? ('Uniform Convective Core (Delta ' + deltaStr + ' <= 6): Even cellular solubility from rim to center.') : ('Balanced Drum Development (Delta ' + deltaStr + ').')));

      agReadout.textContent = '';
      agReadout.appendChild(domH('div', { class: 'bt-studio-human-line' },
        domH('strong', {
          text: 'Gourmet ' + rf.groundG.toFixed(1) + '  ·  Commercial ' +
            commercialFromGourmet(rf.groundG).toFixed(1) + '  ·  Tonino ' + toninoFromGourmet(rf.groundG).toFixed(1) +
            '  ·  Colorette ' + coloretteFromGourmet(rf.groundG).toFixed(1)
        })
      ));
      agReadout.appendChild(domH('p', { class: 'bt-studio-xray-line', text: scorchMsg }));

      const roastBandName = rf.groundG >= 80
        ? 'Nordic / Ultra-Light Roast'
        : (rf.groundG >= 65 ? 'Light-Medium Filter Roast' : (rf.groundG >= 52 ? 'Medium Omni / Espresso Roast' : 'Dark / Classic Roast'));
      const recBrewTemp = rf.groundG >= 80 ? 95 : (rf.groundG >= 65 ? 93 : (rf.groundG >= 52 ? 90 : 87));
      if (delta >= 12) {
        agtronTakeaway.set(
          roastBandName + ' (Ground ' + rf.groundG.toFixed(1) + ') with a large +' + delta + ' shell-to-core gap: the bean exterior roasted much darker than the inside. Brew gentler (~' + (recBrewTemp - 2) + ' \u00B0C) to keep roasty bitterness out of your cup.',
          'warn'
        );
      } else if (delta < 0) {
        agtronTakeaway.set(
          roastBandName + ' (Ground ' + rf.groundG.toFixed(1) + ') reads darker inside than outside (Delta ' + deltaStr + ') — re-check your whole-bean vs ground scan or start around ' + recBrewTemp + ' \u00B0C kettle temp.',
          'warn'
        );
      } else {
        agtronTakeaway.set(
          roastBandName + ' (Ground ' + rf.groundG.toFixed(1) + ', even Delta ' + deltaStr + '): start your kettle near ' + recBrewTemp + ' \u00B0C' +
            (rf.groundG >= 75 ? ' and grind slightly finer for full sweetness.' : (rf.groundG <= 52 ? ' and coarsen a touch so it stays chocolaty, not ashy.' : ' for balanced sweetness and clarity.')),
          'good'
        );
      }
    }

    CK.bindChartSurface(agSvg, {
      ariaLabel: '5-Scale Agtron Whole-Bean and Ground Pucks',
      ariaMin: 25,
      ariaMax: 105,
      ariaNow: rf.groundG,
      ariaText: 'Whole bean ' + rf.beanG.toFixed(1) + ', Ground ' + rf.groundG.toFixed(1) + ' Gourmet Agtron',
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
              return { detentValue: rf.beanG, ariaNow: rf.beanG, ariaText: 'Whole Bean ' + rf.beanG.toFixed(1) + ' Gourmet', loupe: 'Whole Bean: ' + rf.beanG.toFixed(1) + ' Gourmet' };
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
              return { detentValue: rf.groundG, ariaNow: rf.groundG, ariaText: 'Ground Core ' + rf.groundG.toFixed(1) + ' Gourmet', loupe: 'Ground Core: ' + rf.groundG.toFixed(1) + ' (Tonino ' + toninoFromGourmet(rf.groundG).toFixed(0) + ')' };
            }
          }
        ];
      },
      onKeyStep: function (k) {
        rf.groundG = clamp(rf.groundG + k.dx * 0.5, 25, 105, rf.groundG);
        redrawAgtron();
        redrawFreshness();
        return { ariaNow: rf.groundG, ariaText: 'Ground Core ' + rf.groundG.toFixed(1) + ' Gourmet' };
      }
    });

    /* ---- Part B: FreshnessFreezerCurve (-18C 12.3x Arrhenius) & 2-Bag Bulk-Trap Silos ---- */
    const frSvg = CK.svgEl('svg', {
      viewBox: '0 0 440 258',
      class: 'bt-chart-svg bt-fresh-svg',
      'aria-label': 'Arrhenius -18C Cryo-Vault Freshness Curve and Freeze Split'
    });
    const frG = CK.svgEl('g');
    frSvg.appendChild(frG);
    const siloBox = domH('div', { class: 'bt-silo-race-box' });
    const freshTakeaway = createTakeawayBox('bt-freshness-takeaway', 'What this result means \u2192');

    const FP = { L: 44, T: 20, PW: 378, PH: 184, R: 422, B: 204 };
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

      /* Y-Axis (Freshness %) & X-Axis (Days Off Roast) Ticks */
      [100, 50, 0].forEach(function (pct) {
        const yt = CK.svgEl('text', { x: (FP.L - 6).toFixed(1), y: (fy(pct) + 3.5).toFixed(1), 'text-anchor': 'end', class: 'bt-chart-tick' });
        yt.textContent = pct + '%';
        frG.appendChild(yt);
      });
      const yUnitLbl = CK.svgEl('text', { x: (FP.L + 4).toFixed(1), y: (FP.T - 6).toFixed(1), class: 'bt-chart-tick' });
      yUnitLbl.textContent = 'Aroma Freshness (%) \u2191';
      frG.appendChild(yUnitLbl);

      [0, 15, 30, 45, 60].forEach(function (dayTick) {
        const xt = CK.svgEl('text', {
          x: fx(dayTick).toFixed(1),
          y: (FP.B + 13).toFixed(1),
          'text-anchor': dayTick === 0 ? 'start' : (dayTick === 60 ? 'end' : 'middle'),
          class: 'bt-chart-tick'
        });
        xt.textContent = dayTick + 'd';
        frG.appendChild(xt);
      });

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

      const flbl = CK.svgEl('text', { x: (FP.L + 2).toFixed(1), y: (FP.B + 32).toFixed(1), class: 'bt-chart-tick' });
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
          title: 'Toggle whether you freeze the extra portion of a 1 kg bulk bag airtight at -18 °C',
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

      const curVitality = Math.round(vitalityAt(tEffToday, rf.groundG));
      const bulkWins = bagB.costPerPeakCup < bagA.costPerPeakCup;
      const bulkMsg = bulkWins
        ? ('Bulk bag wins at $' + bagB.costPerPeakCup.toFixed(2) + '/peak cup vs $' + bagA.costPerPeakCup.toFixed(2) + ' retail' + (rf.freezeBulk ? ' (with freezer protection ON).' : '.'))
        : ('Bulk trap alert: without freezing, ' + bagB.staleCups + ' cups go stale so the 1 kg bag costs $' + bagB.costPerPeakCup.toFixed(2) + '/peak cup vs $' + bagA.costPerPeakCup.toFixed(2) + ' retail — toggle Freeze Bulk Excess ON to save.');
      freshTakeaway.set(
        'On Day ' + Math.round(rf.daysToday) + ', your beans are at ~' + curVitality + '% peak aroma' +
          (rf.freezeOn && rf.daysToday > rf.freezeDay ? (' (frozen since Day ' + rf.freezeDay + ', aging 12\u00D7 slower)') : '') +
          '. ' + bulkMsg,
        (curVitality >= 80 && bulkWins) ? 'good' : (curVitality < 60 || !bulkWins ? 'warn' : 'info')
      );
    }

    CK.bindChartSurface(frSvg, {
      ariaLabel: 'Freshness Curve Freeze Day and Today Handles',
      ariaMin: 0,
      ariaMax: MAX_DAYS,
      ariaNow: rf.daysToday,
      ariaText: 'Day ' + rf.daysToday + (rf.freezeOn ? (', frozen day ' + rf.freezeDay) : ''),
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
              return { detentValue: rf.freezeDay, ariaNow: rf.freezeDay, ariaText: 'Freeze on Day ' + rf.freezeDay, loupe: 'Freeze on Day ' + rf.freezeDay + ' (-18C 12.3x slower)' };
            }
          },
          {
            id: 'today_pin',
            hitRadiusPx: 28,
            getPos: function () {
              const tEff = rf.freezeOn && rf.daysToday > rf.freezeDay
                ? rf.freezeDay + (rf.daysToday - rf.freezeDay) / 12.3
                : rf.daysToday;
              return { x: fx(rf.daysToday), y: fy(vitalityAt(tEff, rf.groundG)) };
            },
            onMove: function (p) {
              rf.daysToday = Math.round(clamp(((p.ux - FP.L) / FP.PW) * MAX_DAYS, 0, MAX_DAYS, rf.daysToday));
              redrawFreshness();
              return { detentValue: rf.daysToday, ariaNow: rf.daysToday, ariaText: 'Calendar Day ' + rf.daysToday, loupe: 'Calendar Day ' + rf.daysToday };
            }
          }
        ];
      },
      onKeyStep: function (k) {
        rf.daysToday = clamp(rf.daysToday + k.dx, 0, MAX_DAYS, rf.daysToday);
        redrawFreshness();
        return { ariaNow: rf.daysToday, ariaText: 'Calendar Day ' + rf.daysToday };
      }
    });

    const agtronHow = CK.createExplainer({
      title: 'Cutaway 5-Scale Roast Color & Freezer Freshness',
      whatItDoes: 'Synchronizes Gourmet, M-Basic II Commercial, Tonino, Omni, and CM-100 roast color scales with -18 °C freezer storage.',
      howToUse: 'Drag Whole-Bean (B) and Ground (G) pucks on the color bar, and slide the Freeze Day pin on the freshness curve.',
      proTip: 'Freezing beans airtight at -18 °C slows aging ~12× — grind straight from frozen (+1 step coarser for ultra-uniform grounds)!'
    });

    /* Live DiFluid Omni Roast Colorimeter Sync Strip */
    const omniAgBadge = domH('span', {
      class: 'bt-epistemic-pill is-research num-tab',
      id: 'bt-agtron-omni-live-badge',
      text: 'DiFluid Omni NIR Standby'
    });
    const omniAgPairRow = domH('div', { class: 'bt-lab-btn-row' },
      domH('button', {
        type: 'button',
        class: 'bt-lab-btn is-sm',
        'data-ble-action': 'agtron-omni-pair',
        onclick: function () {
          const b = window.BTBle || {};
          if (typeof b.connectOmni === 'function') runBleAsync(b.connectOmni(), 'Omni pair');
        }
      }, ic('omni-nir', { size: 14 }), domH('span', { text: 'Pair DiFluid Omni' })),
      domH('button', {
        type: 'button',
        class: 'bt-lab-btn is-sm',
        'data-ble-action': 'agtron-omni-scan-any',
        onclick: function () {
          const b = window.BTBle || {};
          if (typeof b.connectOmni === 'function') runBleAsync(b.connectOmni({ acceptAll: true }), 'Omni scan');
        }
      }, 'Scan Any BLE')
    );
    const omniAgConnRow = domH('div', { class: 'bt-lab-btn-row', hidden: true },
      domH('button', {
        type: 'button',
        class: 'bt-lab-btn is-sm is-primary',
        'data-ble-action': 'agtron-omni-trigger',
        onclick: function () {
          const b = window.BTBle || {};
          if (typeof b.triggerOmniRead === 'function') {
            runBleAsync(b.triggerOmniRead({ mode: 'agtron' }), 'Omni roast scan');
          }
          CK.haptic('tick');
        }
      }, ic('omni-nir', { size: 14 }), domH('span', { text: 'Scan Roast / Agtron' }))
    );

    function syncOmniAgtronBar() {
      const stO = getBleStateSafe();
      const isOmOn = !!(stO.omniConnected || (stO.omni && stO.omni.connected) || stO.simulatorActive);
      omniAgPairRow.hidden = isOmOn;
      omniAgConnRow.hidden = !isOmOn;
      const omL = labState.omniLive;
      const hasLiveAg = omL.beanAgtron != null || omL.groundAgtron != null;
      setClassIfChanged(omniAgBadge, 'bt-epistemic-pill num-tab ' + (isOmOn || hasLiveAg ? 'is-verified' : 'is-research'));
      if (hasLiveAg) {
        const bTxt = omL.beanAgtron != null ? omL.beanAgtron.toFixed(1) : rf.beanG.toFixed(1);
        const gTxt = omL.groundAgtron != null ? omL.groundAgtron.toFixed(1) : rf.groundG.toFixed(1);
        const dVal = +(parseFloat(gTxt) - parseFloat(bTxt)).toFixed(1);
        setTextIfChanged(omniAgBadge, 'Omni Live: Bean ' + bTxt + ' \u00B7 Ground ' + gTxt + ' (Delta ' + (dVal >= 0 ? '+' : '') + dVal + ')');
      } else {
        setTextIfChanged(omniAgBadge, isOmOn ? 'DiFluid Omni Connected \u00B7 Ready to Scan Roast' : 'DiFluid Omni NIR Colorimeter');
      }
    }
    syncOmniAgtronBar();

    const omniAgBar = domH('div', {
      class: 'bt-lab-subcard',
      'data-omni-agtron-bar': '1',
      style: 'flex-direction:row;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;'
    }, omniAgBadge, omniAgPairRow, omniAgConnRow);

    card.appendChild(domH('div', { class: 'bt-lab-card-head' },
      domH('div', { class: 'bt-lab-title-group' },
        ic('omni-nir', { size: 22 }),
        domH('div', null,
          domH('h3', {
            text: isScienceXray()
              ? 'Cutaway 5-Scale Agtron Ribbon & -18 \u00B0C Arrhenius Freezer Curve'
              : 'Cutaway 5-Scale Roast Color & Freezer Storage (-18 \u00B0C \u00B7 12\u00D7 Slower Aging)'
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
    card.appendChild(buildWhatBox('What this tool does', [
      'Converts ',
      labAbbr('Agtron #', 'Infrared roast color score from 25 to 105 — higher numbers mean lighter roasts, lower numbers mean darker roasts'),
      ' across 5 meters, compares ',
      domH('strong', { text: 'Whole Bean (B)' }),
      ' vs ',
      domH('strong', { text: 'Ground Core (G)' }),
      ' roast evenness, and models ',
      domH('strong', { text: '-18 \u00B0C freezer storage (~12\u00D7 slower staling)' }),
      ' against buying a 1 kg bulk bag.'
    ]));
    card.appendChild(omniAgBar);
    card.appendChild(domH('div', { class: 'bt-chart-stage' }, agSvg));
    card.appendChild(buildAxisCaption([
      { label: 'Color Bar (Agtron #)', text: 'Left (25): Very Dark / French \u2194 Center (65): Medium \u2194 Right (105): Nordic Ultra-Light' },
      { label: 'Draggers', text: '(B) = Whole Bean exterior \u00B7 (G) = Ground interior core' }
    ]));
    card.appendChild(agReadout);
    card.appendChild(agtronTakeaway.el);
    const freezeCurveBtn = domH('button', {
      type: 'button',
      class: 'bt-lab-chip' + (rf.freezeOn ? ' is-active' : ''),
      'aria-pressed': String(!!rf.freezeOn),
      title: 'Show or hide the -18 °C airtight freezer curve (12× slower staling)',
      onclick: function () {
        rf.freezeOn = !rf.freezeOn;
        freezeCurveBtn.classList.toggle('is-active', !!rf.freezeOn);
        freezeCurveBtn.setAttribute('aria-pressed', String(!!rf.freezeOn));
        freezeCurveBtn.lastChild.textContent = rf.freezeOn ? 'Freeze Curve ON (-18 °C)' : 'Freeze Curve OFF';
        CK.haptic('tick');
        redrawFreshness();
      }
    }, ic('cryo-snowflake', { size: 14 }), domH('span', { text: rf.freezeOn ? 'Freeze Curve ON (-18 °C)' : 'Freeze Curve OFF' }));

    card.appendChild(domH('div', { class: 'bt-lab-btn-row' },
      freezeCurveBtn,
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
            a.brew.customizedNote = 'Agtron ' + rf.groundG.toFixed(0) + ' (' + recTemp + ' \u00B0C kettle)';
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
        title: 'Grams of whole beans you brew per day (e.g. 18 g = 1 cup/day, 36 g = 2 cups/day)',
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
        title: 'Price of a 1 kg bulk bag to compare fresh cups per dollar against a 250 g retail bag',
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
    card.appendChild(buildAxisCaption([
      { label: 'X-Axis', text: 'Days Off Roast (0d = roast day \u2192 60d)' },
      { label: 'Y-Axis', text: 'Peak Aroma Vitality (0\u2013100%)' },
      { label: 'Pins', text: 'Drag Freeze Day & Today pins to simulate -18 \u00B0C storage' }
    ]));
    card.appendChild(siloBox);
    card.appendChild(freshTakeaway.el);

    redrawAgtron();
    redrawFreshness();
    _labLiveHooks.studioAgtron = function (opts) {
      if (!card.isConnected) return false;
      syncOmniAgtronBar();
      if (!(opts && opts.metaOnly)) {
        redrawAgtron();
        redrawFreshness();
      }
      return true;
    };
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
    const cmpTakeaway = createTakeawayBox('bt-bagcmp-takeaway');

    const aNameIn = domH('input', { type: 'text', class: 'bt-lab-text-in', value: bc.aName, 'aria-label': 'Bag A name', oninput: function () { bc.aName = aNameIn.value; paintCmp(); } });
    const aPriceIn = domH('input', { type: 'number', inputmode: 'decimal', class: 'bt-lab-text-in bt-lab-num-in', step: '0.5', value: String(bc.aPrice), 'aria-label': 'Bag A price', oninput: function () { const v = parseFloat(aPriceIn.value); if (Number.isFinite(v)) { bc.aPrice = Math.max(0, v); paintCmp(); } } });
    const aGramsIn = domH('input', { type: 'number', inputmode: 'decimal', class: 'bt-lab-text-in bt-lab-num-in', step: '10', value: String(bc.aGrams), 'aria-label': 'Bag A weight grams', oninput: function () { const v = parseFloat(aGramsIn.value); if (Number.isFinite(v) && v >= 1) { bc.aGrams = Math.max(10, v); paintCmp(); } } });

    const bNameIn = domH('input', { type: 'text', class: 'bt-lab-text-in', value: bc.bName, 'aria-label': 'Bag B name', oninput: function () { bc.bName = bNameIn.value; paintCmp(); } });
    const bPriceIn = domH('input', { type: 'number', inputmode: 'decimal', class: 'bt-lab-text-in bt-lab-num-in', step: '0.5', value: String(bc.bPrice), 'aria-label': 'Bag B price', oninput: function () { const v = parseFloat(bPriceIn.value); if (Number.isFinite(v)) { bc.bPrice = Math.max(0, v); paintCmp(); } } });
    const bGramsIn = domH('input', { type: 'number', inputmode: 'decimal', class: 'bt-lab-text-in bt-lab-num-in', step: '10', value: String(bc.bGrams), 'aria-label': 'Bag B weight grams', oninput: function () { const v = parseFloat(bGramsIn.value); if (Number.isFinite(v) && v >= 1) { bc.bGrams = Math.max(10, v); paintCmp(); } } });

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
      const diffPeak = Math.abs(effPeakA - effPeakB);
      const staleNoteA = bc.aGrams > freshWinG ? (' (' + Math.round(bc.aGrams - freshWinG) + ' g risks staling past 26d unless frozen)') : '';
      const staleNoteB = bc.bGrams > freshWinG ? (' (' + Math.round(bc.bGrams - freshWinG) + ' g risks staling past 26d unless frozen)') : '';
      cmpTakeaway.set(
        winner + ' is the better fresh-cup value by $' + diffPeak.toFixed(2) + '/cup at ' + pace + ' g/day (' + dose + ' g dose)' +
        (effPeakA <= effPeakB ? staleNoteA : staleNoteB) + '.',
        'good'
      );
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
    cmpCard.appendChild(buildWhatBox('What this tool does', [
      'Roasters sell different bag weights (200 g, 250 g, 12 oz / 340 g, 1 kg). Enter two bags to compare both raw ',
      domH('strong', { text: '$/cup' }),
      ' and ',
      domH('strong', { text: 'fresh $/cup' }),
      ' — catching when a big bulk bag goes stale before you can finish it.'
    ]));
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
    cmpCard.appendChild(cmpTakeaway.el);
    paintCmp();

    /* 2. True Cup Cost, Cafe Savings & Gear Break-Even ROI */
    const roiCard = domH('section', { class: 'bt-studio-card', id: 'bt-studio-cost-roi' });
    const roiOut = domH('div', { class: 'bt-roi-out' });
    const roiTakeaway = createTakeawayBox('bt-roi-takeaway');

    const rBagPriceIn = domH('input', { type: 'number', inputmode: 'decimal', class: 'bt-lab-text-in bt-lab-num-in', step: '0.5', value: String(roi.bagPrice), 'aria-label': 'Bag price USD', oninput: function () { const v = parseFloat(rBagPriceIn.value); if (Number.isFinite(v)) { roi.bagPrice = Math.max(0, v); paintRoi(); } } });
    const rCafePriceIn = domH('input', { type: 'number', inputmode: 'decimal', class: 'bt-lab-text-in bt-lab-num-in', step: '0.25', value: String(roi.cafeDrinkPrice), 'aria-label': 'Cafe drink price USD', oninput: function () { const v = parseFloat(rCafePriceIn.value); if (Number.isFinite(v)) { roi.cafeDrinkPrice = Math.max(0, v); paintRoi(); } } });
    const rGearIn = domH('input', { type: 'number', inputmode: 'decimal', class: 'bt-lab-text-in bt-lab-num-in', step: '10', value: String(roi.gearInvestment), 'aria-label': 'Gear investment USD', oninput: function () { const v = parseFloat(rGearIn.value); if (Number.isFinite(v)) { roi.gearInvestment = Math.max(0, v); paintRoi(); } } });

    function paintRoi() {
      const wasteG = clamp(roi.dialInWasteG != null ? roi.dialInWasteG : 18, 0, Math.max(0, roi.bagGrams - roi.doseG), 18);
      const usableBagG = Math.max(roi.doseG, roi.bagGrams - wasteG);
      const rawBeanCost = (roi.bagPrice / Math.max(50, roi.bagGrams)) * roi.doseG;
      const beanCost = (roi.bagPrice / usableBagG) * roi.doseG;
      const wastePerCup = Math.max(0, beanCost - rawBeanCost);
      const waterCost = (roi.doseG * 16 / 1000) * roi.waterCostPerL;
      const trueCup = beanCost + roi.filterCost + waterCost + roi.milkCostPerCup;
      const netPerCup = roi.cafeDrinkPrice - trueCup;
      const annualSavings = netPerCup * roi.cupsPerDay * 365;
      const isSaving = netPerCup > 0.005;
      const breakEvenCups = isSaving ? Math.ceil(roi.gearInvestment / netPerCup) : 0;
      const breakEvenDays = isSaving ? Math.ceil(breakEvenCups / Math.max(0.25, roi.cupsPerDay)) : 0;
      const annualText = annualSavings >= 0.5
        ? ('+$' + Math.round(annualSavings) + ' / yr')
        : (annualSavings <= -0.5 ? ('-$' + Math.round(Math.abs(annualSavings)) + ' / yr') : '$0 / yr');
      const breakEvenText = isSaving
        ? (roi.gearInvestment <= 0 ? '0 cups ($0 gear)' : (breakEvenCups + ' cups (~' + breakEvenDays + ' days)'))
        : ('Costs $' + Math.abs(netPerCup).toFixed(2) + ' more/cup than cafe · No break-even');

      roiOut.textContent = '';
      roiOut.appendChild(domH('div', { class: 'bt-lab-metric-strip' },
        domH('div', { class: 'bt-lab-kpi' },
          domH('span', { text: 'True Home Cup Cost' }),
          domH('strong', { class: 'num-tab', text: '$' + trueCup.toFixed(2) + ' / cup' })
        ),
        domH('div', { class: 'bt-lab-kpi' },
          domH('span', { text: (isSaving ? 'Saved vs $' : 'Net vs $') + roi.cafeDrinkPrice.toFixed(2) + ' Cafe' }),
          domH('strong', { class: 'num-tab', text: annualText })
        ),
        domH('div', { class: 'bt-lab-kpi' },
          domH('span', { text: '$' + Math.round(roi.gearInvestment) + ' Gear Break-Even' }),
          domH('strong', { class: 'num-tab', text: breakEvenText })
        )
      ));
      roiOut.appendChild(domH('p', {
        class: 'bt-lab-hint num-tab',
        text: 'Breakdown: $' + rawBeanCost.toFixed(2) + ' beans (' + roi.doseG + 'g) + $' + wastePerCup.toFixed(2) + ' dial-in waste (' + Math.round(wasteG) + 'g/bag) + $' + roi.filterCost.toFixed(2) + ' filter + $' + waterCost.toFixed(2) + ' water' + (roi.milkCostPerCup > 0 ? (' + $' + roi.milkCostPerCup.toFixed(2) + ' milk') : '') + '.'
      }));
      if (isSaving) {
        roiTakeaway.set(
          'Even after accounting for ' + Math.round(wasteG) + ' g of wasted dial-in/purge beans per bag (+$' + wastePerCup.toFixed(2) + '/cup), brewing at home costs $' +
          trueCup.toFixed(2) + '/cup — saving $' + netPerCup.toFixed(2) + ' every cup (' + annualText + ') and paying off $' + Math.round(roi.gearInvestment) +
          ' of gear in ' + (roi.gearInvestment <= 0 ? '0 days' : (breakEvenCups + ' cups / ~' + breakEvenDays + ' days')) + '.',
          'good'
        );
      } else {
        roiTakeaway.set(
          'Your home cup ($' + trueCup.toFixed(2) + ' incl. ' + Math.round(wasteG) + ' g dial-in waste) currently exceeds your $' +
          roi.cafeDrinkPrice.toFixed(2) + ' cafe price — cutting dial-in waste or choosing a better-value bag lowers $/cup immediately.',
          'warn'
        );
      }
    }

    roiCard.appendChild(domH('div', { class: 'bt-lab-card-head' },
      domH('div', { class: 'bt-lab-title-group' },
        ic('spark-star', { size: 20 }),
        domH('div', null,
          domH('h3', { text: 'True Cup Cost, Cafe Savings & Gear Break-Even ROI' }),
          domH('p', { class: 'bt-lab-sub', text: 'Exact beans + dial-in waste + filter + water + milk cost per cup vs cafe spend & grinder/brewer payback' })
        )
      )
    ));
    roiCard.appendChild(buildWhatBox('What this tool does', [
      'Calculates your honest home ',
      domH('strong', { text: '$/cup' }),
      ' — including beans, ',
      domH('strong', { text: 'wasted dial-in/purge grams' }),
      ' per bag, filters, and water — then solves your gear ',
      labAbbr('ROI', 'Return on Investment — how many home cups until your grinder/brewer savings pay back what you spent on gear'),
      ' break-even against cafe coffee.'
    ]));
    roiCard.appendChild(domH('div', { class: 'bt-ratio4-grid' },
      domH('label', { class: 'bt-lab-field-lbl', title: 'Retail price of your 250 g coffee bag' }, domH('span', { text: '250g Bag ($)' }), rBagPriceIn),
      domH('label', { class: 'bt-lab-field-lbl', title: 'What you would otherwise pay at a coffee shop for one drink' }, domH('span', { text: 'Cafe Cup ($)' }), rCafePriceIn),
      domH('label', { class: 'bt-lab-field-lbl', title: 'Total spent on your grinder, kettle, scale, and brewer' }, domH('span', { text: 'Gear Spend ($)' }), rGearIn),
      CK.vernierPill({
        label: 'Cups / Day',
        title: 'How many cups you brew at home on an average day',
        value: roi.cupsPerDay,
        min: 0.5,
        max: 6.0,
        step: 0.5,
        decimals: 1,
        unit: '',
        compact: true,
        onChange: function (v) { roi.cupsPerDay = v; paintRoi(); }
      }),
      CK.vernierPill({
        label: 'Dial-In Waste',
        title: 'Grams of coffee lost per bag to grinder purging or sink-shot dial-in tries (e.g. 18 g = 1 wasted cup per bag)',
        value: roi.dialInWasteG != null ? roi.dialInWasteG : 18,
        min: 0,
        max: 100,
        step: 2,
        decimals: 0,
        unit: 'g/bag',
        compact: true,
        onChange: function (v) { roi.dialInWasteG = v; paintRoi(); }
      })
    ));
    roiCard.appendChild(roiOut);
    roiCard.appendChild(roiTakeaway.el);
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
    const grinderTakeaway = createTakeawayBox('bt-grinder-takeaway', 'What this result means \u2192');

    const fallbackGrinders = [
      { key: 'comandante-c40', name: 'Comandante C40 MK4 (Std Axle)', unit: 'clicks', min: 5, max: 45, umZero: 40, umPerStep: 25.5 },
      { key: 'comandante-red', name: 'Comandante C40 (Red Clix)', unit: 'clicks', min: 10, max: 90, umZero: 40, umPerStep: 12.75 },
      { key: '1zpresso-zp6', name: '1Zpresso ZP6 Special', unit: 'dial', min: 1.5, max: 7.0, umZero: 120, umPerStep: 110 },
      { key: '1zpresso-k-ultra', name: '1Zpresso K-Ultra', unit: 'dial', min: 2.0, max: 9.5, umZero: 80, umPerStep: 82 },
      { key: 'kingrinder-k6', name: 'KINGrinder K6', unit: 'clicks', min: 30, max: 160, umZero: 45, umPerStep: 7.2 },
      { key: 'fellow-ode-gen2', name: 'Fellow Ode Gen 2', unit: 'dial', min: 1, max: 11, umZero: 240, umPerStep: 78 },
      { key: 'baratza-encore-esp', name: 'Baratza Encore / ESP', unit: 'steps', min: 5, max: 38, umZero: 140, umPerStep: 26 },
      { key: 'niche-zero', name: 'Niche Zero (63mm Conical)', unit: 'dial', min: 5, max: 50, umZero: 95, umPerStep: 15.5 },
      { key: 'df64-gen2', name: 'DF64 Gen 2 (64mm Flat)', unit: 'dial', min: 5, max: 85, umZero: 90, umPerStep: 10.2 },
      { key: 'ek43', name: 'Mahlkonig EK43 (98mm Flat)', unit: 'dial', min: 1.0, max: 16.0, umZero: 100, umPerStep: 62 }
    ];

    function getGrinderList() {
      const src = (Array.isArray(window.GRINDERS_ALL_V6) && window.GRINDERS_ALL_V6.length)
        ? window.GRINDERS_ALL_V6
        : ((window.BTCoreV6 && Array.isArray(window.BTCoreV6.GRINDERS_48) && window.BTCoreV6.GRINDERS_48.length)
            ? window.BTCoreV6.GRINDERS_48
            : ((typeof GRINDERS !== 'undefined' && Array.isArray(GRINDERS) && GRINDERS.length)
                ? GRINDERS
                : (window.GRINDERS && Array.isArray(window.GRINDERS) ? window.GRINDERS : null)));
      if (!src) return fallbackGrinders;
      return src.filter(function (g) { return g && g.kind !== 'preground'; }).map(function (g) {
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
      class: 'bt-lab-select',
      style: 'min-width:0;width:100%;max-width:100%;box-sizing:border-box;',
      'aria-label': 'Source grinder'
    });
    const toSel = domH('select', {
      class: 'bt-lab-select',
      style: 'min-width:0;width:100%;max-width:100%;box-sizing:border-box;',
      'aria-label': 'Target grinder',
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

    const gInitFrom = gList.find(function (x) { return x.key === gl.fromKey; }) || gList[0];
    const fromSetIn = domH('input', {
      type: 'number', inputmode: 'decimal', class: 'bt-lab-text-in bt-lab-num-in',
      min: String(gInitFrom.min), max: String(gInitFrom.max), step: '0.5',
      value: gl.fromSetting == null ? '' : String(gl.fromSetting),
      'aria-label': 'Source grinder setting',
      oninput: function () {
        const gCur = gList.find(function (x) { return x.key === gl.fromKey; }) || gList[0];
        const rawStr = String(fromSetIn.value || '').trim();
        if (!rawStr) {
          gl.fromSetting = null;
          paintGrinder();
          return;
        }
        const v = parseFloat(rawStr);
        if (Number.isFinite(v)) {
          const clamped = clamp(v, gCur.min, gCur.max, gCur.min);
          gl.fromSetting = clamped;
          if (v > gCur.max || v < 0) fromSetIn.value = String(clamped);
          paintGrinder();
        }
      },
      onchange: function () {
        const gCur = gList.find(function (x) { return x.key === gl.fromKey; }) || gList[0];
        const v = parseFloat(fromSetIn.value);
        if (Number.isFinite(v)) {
          gl.fromSetting = clamp(v, gCur.min, gCur.max, gCur.min);
          fromSetIn.value = String(gl.fromSetting);
          paintGrinder();
        }
      }
    });

    function getCustomCalibFor(gKey) {
      if (!gl.calPt1Locked || !gl.calPt2Locked) return null;
      const normReq = String(gKey || '').toLowerCase().replace(/_/g, '-');
      const normCal = String(gl.calGrinderKey || '').toLowerCase().replace(/_/g, '-');
      if (normCal && normCal !== normReq) return null;
      const dClick = gl.calPt2Click - gl.calPt1Click;
      const dUm = gl.calPt2Um - gl.calPt1Um;
      if (Math.abs(dClick) < 0.5 || dUm * dClick <= 0) return null;
      const slopeM = dUm / dClick;
      const d0OffsetUm = gl.calPt1Um - slopeM * gl.calPt1Click;
      return { grinderKey: normReq, slopeM: slopeM, d0OffsetUm: d0OffsetUm };
    }

    function resolveGrinderCalib(aNow, normGKey) {
      const pmc = aNow && aNow.prefs && aNow.prefs.pocketMicronCalib;
      const pmcValid = pmc && (Number.isFinite(+pmc.d0OffsetUm) || Number.isFinite(+pmc.slopeM)) &&
        (!pmc.grinderKey || String(pmc.grinderKey).trim().toLowerCase().replace(/_/g, '-') === normGKey);
      return pmcValid ? pmc : ((aNow && aNow.prefs && aNow.prefs.calib) || null);
    }

    function settingToUm(g, setting, opts) {
      const aNow = getApp() || {};
      const mKey = 'v60';
      const customCal = (opts && opts.ignoreCustom) ? null : getCustomCalibFor(g.key);
      if (customCal) {
        return clamp(customCal.d0OffsetUm + setting * customCal.slopeM, 120, 1400, 580);
      }
      const normGKey = String(g.key || '').toLowerCase().replace(/_/g, '-');
      const calib = resolveGrinderCalib(aNow, normGKey);
      const fnCore = window.BTCoreV6 && window.BTCoreV6.psd && typeof window.BTCoreV6.psd.micronsForGrinderSetting === 'function'
        ? window.BTCoreV6.psd.micronsForGrinderSetting
        : (typeof micronsForGrinderSetting === 'function' ? micronsForGrinderSetting : null);
      if (fnCore && g.raw) {
        try {
          const u = fnCore(g.key, setting, mKey, calib);
          if (Number.isFinite(u) && u > 50) return u;
        } catch (_) {}
      }
      return clamp(g.umZero + setting * g.umPerStep, 120, 1400, 580);
    }

    function umToSettingInfo(g, um) {
      const aNow = getApp() || {};
      const mKey = um < 320 ? 'espresso' : (um > 820 ? 'french_press' : 'v60');
      const customCal = getCustomCalibFor(g.key);
      const normGKey = String(g.key || '').toLowerCase().replace(/_/g, '-');
      const calib = customCal || resolveGrinderCalib(aNow, normGKey);
      if (window.BTCoreV6 && window.BTCoreV6.psd && typeof window.BTCoreV6.psd.mapMicronsToGrinder === 'function' && g.raw) {
        try {
          const res = window.BTCoreV6.psd.mapMicronsToGrinder(um, g.key, calib, mKey);
          if (res) {
            if (res.incompatible) {
              return { num: null, display: res.display || res.shortDisplay || 'Incompatible', incompatible: true };
            }
            const num = res.clicks != null ? res.clicks : res.setting;
            const uLbl = fmtGrinderUnit(g.unit, num);
            let disp = res.display || res.shortDisplay || (num != null ? (num + ' ' + uLbl) : '');
            if (disp && num != null && Math.abs(num - 1) >= 1e-6) {
              disp = disp.replace(/(\d+(?:\.\d+)?\s*)(click|step|mark|setting)\b(?!s)/i, function (_, pre, m) { return pre + m + 's'; });
            }
            if (num != null || disp) {
              return { num: num, display: disp };
            }
          }
        } catch (_) {}
      }
      const raw = (um - g.umZero) / Math.max(0.5, g.umPerStep);
      const clamped = clamp(raw, g.min, g.max, (g.min + g.max) * 0.5);
      const num = g.max <= 16 ? +clamped.toFixed(1) : Math.round(clamped * 2) / 2;
      return { num: num, display: num + ' ' + fmtGrinderUnit(g.unit, num) };
    }

    function umToSetting(g, um) {
      return umToSettingInfo(g, um).num;
    }

    let _omniOverrideUm = (gl.useOmniOverride && labState.omniLive && labState.omniLive.d50Um > 0) ? Math.round(labState.omniLive.d50Um) : 0;

    /* Live DiFluid Omni D10 / D50 / D90 & PSD Histogram Calibration Subcard */
    const omniPsdBadge = domH('span', {
      class: 'bt-epistemic-pill is-research num-tab',
      id: 'bt-grinder-omni-psd-badge',
      text: 'DiFluid Omni Optical PSD'
    });
    const omniPsdPairRow = domH('div', { class: 'bt-lab-btn-row' },
      domH('button', {
        type: 'button',
        class: 'bt-lab-btn is-sm',
        'data-ble-action': 'grinder-omni-pair',
        onclick: function () {
          const b = window.BTBle || {};
          if (typeof b.connectOmni === 'function') runBleAsync(b.connectOmni(), 'Omni pair');
        }
      }, ic('omni-nir', { size: 14 }), domH('span', { text: 'Pair DiFluid Omni' })),
      domH('button', {
        type: 'button',
        class: 'bt-lab-btn is-sm',
        'data-ble-action': 'grinder-omni-scan-any',
        onclick: function () {
          const b = window.BTBle || {};
          if (typeof b.connectOmni === 'function') runBleAsync(b.connectOmni({ acceptAll: true }), 'Omni scan');
        }
      }, 'Scan Any BLE')
    );
    const omniPsdConnRow = domH('div', { class: 'bt-lab-btn-row', hidden: true },
      domH('button', {
        type: 'button',
        class: 'bt-lab-btn is-sm is-primary',
        'data-ble-action': 'grinder-omni-scan-psd',
        onclick: function () {
          const b = window.BTBle || {};
          if (typeof b.triggerOmniRead === 'function') {
            runBleAsync(b.triggerOmniRead({ mode: 'psd' }), 'Omni PSD scan');
          }
          CK.haptic('tick');
        }
      }, ic('omni-nir', { size: 14 }), domH('span', { text: 'Scan Grind PSD' }))
    );

    const kpiD10El = domH('strong', { class: 'num-tab', id: 'bt-grinder-omni-d10', text: '--' });
    const kpiD50El = domH('strong', { class: 'num-tab', id: 'bt-grinder-omni-d50', text: '--' });
    const kpiD90El = domH('strong', { class: 'num-tab', id: 'bt-grinder-omni-d90', text: '--' });
    const kpiSpanEl = domH('strong', { class: 'num-tab', id: 'bt-grinder-omni-span', text: '--' });
    const psdSvg = CK.svgEl('svg', {
      viewBox: '0 0 380 112',
      class: 'bt-chart-svg bt-omni-psd-svg',
      'aria-label': 'DiFluid Omni Particle Size Distribution Histogram'
    });

    function synthesizeFallbackBins(d10, d50, d90) {
      const edges = [60, 140, 220, 340, 460, 580, 720, 900, 1250];
      const mu = Math.log(Math.max(80, d50 || 540));
      const sig = Math.max(0.24, Math.min(0.75, Math.log(Math.max(1.2, (d90 || d50 * 1.55) / Math.max(40, d10 || d50 * 0.42))) / 2.56));
      const raw = [];
      let sum = 0;
      for (let i = 0; i < edges.length - 1; i++) {
        const mid = Math.sqrt(edges[i] * edges[i + 1]);
        const z = (Math.log(mid) - mu) / sig;
        const w = Math.exp(-0.5 * z * z);
        raw.push({ lowerUm: edges[i], upperUm: edges[i + 1], w: w });
        sum += w;
      }
      return raw.map(function (b) {
        return { lowerUm: b.lowerUm, upperUm: b.upperUm, pct: sum > 0 ? +((b.w / sum) * 100).toFixed(1) : 0 };
      });
    }

    function renderOmniPsdHistogram() {
      const stO = getBleStateSafe();
      const isOmOn = !!(stO.omniConnected || (stO.omni && stO.omni.connected) || stO.simulatorActive);
      omniPsdPairRow.hidden = isOmOn;
      omniPsdConnRow.hidden = !isOmOn;

      const omL = labState.omniLive;
      const hasPsd = !!(omL.d50Um > 0 || (Array.isArray(omL.bins) && omL.bins.length));
      setClassIfChanged(omniPsdBadge, 'bt-epistemic-pill num-tab ' + (isOmOn || hasPsd ? 'is-verified' : 'is-research'));
      setTextIfChanged(
        omniPsdBadge,
        hasPsd
          ? ('DiFluid Omni Live PSD \u00B7 D50 ' + Math.round(omL.d50Um || gl.targetUm) + ' \u00B5m')
          : (isOmOn ? 'DiFluid Omni Connected \u00B7 Ready to Scan PSD' : 'DiFluid Omni 2D Optical PSD')
      );

      const d50Show = omL.d50Um || null;
      const d10Show = omL.d10Um || (d50Show ? +(d50Show * 0.36).toFixed(0) : null);
      const d90Show = omL.d90Um || (d50Show ? +(d50Show * 1.52).toFixed(0) : null);
      const spanShow = omL.span || (d50Show && d10Show && d90Show ? +((d90Show - d10Show) / d50Show).toFixed(2) : null);

      setTextIfChanged(kpiD10El, d10Show != null ? (Math.round(d10Show) + ' \u00B5m') : '--');
      setTextIfChanged(kpiD50El, d50Show != null ? (Math.round(d50Show) + ' \u00B5m') : '--');
      setTextIfChanged(kpiD90El, d90Show != null ? (Math.round(d90Show) + ' \u00B5m') : '--');
      setTextIfChanged(kpiSpanEl, spanShow != null ? String(spanShow) : '--');

      psdSvg.textContent = '';
      psdSvg.appendChild(CK.svgEl('rect', { x: '12', y: '8', width: '356', height: '82', rx: '8', class: 'bt-chart-plot-bg' }));
      const bins = (Array.isArray(omL.bins) && omL.bins.length)
        ? omL.bins
        : synthesizeFallbackBins(d10Show || 200, d50Show || settingToUm(gList.find(function (x) { return x.key === gl.fromKey; }) || gList[0], gl.fromSetting != null ? gl.fromSetting : 22), d90Show || 820);
      let maxPct = 5;
      for (let i = 0; i < bins.length; i++) {
        if (+bins[i].pct > maxPct) maxPct = +bins[i].pct;
      }
      const nB = Math.max(1, bins.length);
      const slotW = 336 / nB;
      const barW = Math.max(4, slotW - 3);
      for (let j = 0; j < nB; j++) {
        const b = bins[j];
        const hPx = Math.max(2, ((+b.pct || 0) / maxPct) * 68);
        const bx = 22 + j * slotW;
        const by = 86 - hPx;
        psdSvg.appendChild(CK.svgEl('rect', {
          x: bx.toFixed(1),
          y: by.toFixed(1),
          width: barW.toFixed(1),
          height: hPx.toFixed(1),
          rx: '2.5',
          fill: hasPsd ? 'var(--primary, #1B4D38)' : 'var(--accent, #9A4212)',
          opacity: hasPsd ? '0.88' : '0.45'
        }));
      }
      const axisTxt = CK.svgEl('text', { x: '190', y: '104', 'text-anchor': 'middle', class: 'bt-chart-tick' });
      axisTxt.textContent = hasPsd
        ? ('Live Omni Histogram (' + bins.length + ' bins \u00B7 50\u20131600 \u00B5m)')
        : 'Estimated Burr Distribution (Pair DiFluid Omni for live optical PSD)';
      psdSvg.appendChild(axisTxt);
    }

    const omniPsdCard = domH('div', {
      class: 'bt-lab-subcard',
      id: 'bt-grinder-omni-psd-card',
      'data-omni-psd-card': '1',
      style: 'min-width:0;max-width:100%;box-sizing:border-box;'
    },
      domH('div', { class: 'bt-lab-card-head' }, omniPsdBadge, omniPsdPairRow, omniPsdConnRow),
      buildWhatBox('What this chart shows', [
        'Plots your grinder\u2019s ',
        labAbbr('PSD', 'Particle Size Distribution — how evenly your grinder chops coffee into dust (fines), target grounds, and large chunks (boulders)'),
        '. Narrower ',
        labAbbr('Span', '(D90 minus D10) / D50 — lower Span means cleaner, sweeter cups with fewer muddy fines'),
        ' means higher clarity. Lock 2 points on your grinder to calibrate its exact \u00B5m/click slope.'
      ]),
      domH('div', { class: 'bt-lab-metric-strip' },
        domH('div', { class: 'bt-lab-kpi' }, domH('span', null, labAbbr('Fines D10', 'Smallest 10% of coffee dust — too many fines clog filters and add bitterness')), kpiD10El),
        domH('div', { class: 'bt-lab-kpi' }, domH('span', null, labAbbr('Median D50', 'Middle particle size — the main number used to match grind settings across grinders')), kpiD50El),
        domH('div', { class: 'bt-lab-kpi' }, domH('span', null, labAbbr('Boulders D90', 'Largest 10% of chunks — too many boulders under-extract and taste thin or sour')), kpiD90El),
        domH('div', { class: 'bt-lab-kpi' }, domH('span', null, labAbbr('PSD Span', 'Spread width (D90 - D10) / D50 — lower is more uniform')), kpiSpanEl)
      ),
      domH('div', { class: 'bt-chart-stage' }, psdSvg),
      buildAxisCaption([
        { label: 'X-Axis (Microns \u00B5m)', text: 'Left: Fines (<200 \u00B5m) \u2194 Center: Median D50 \u2194 Right: Boulders (>900 \u00B5m)' },
        { label: 'Y-Axis', text: 'Share of Grounds (%) in each size bin' }
      ]),
      domH('div', { class: 'bt-lab-btn-row' },
        domH('button', {
          type: 'button',
          class: 'bt-lab-btn is-sm',
          onclick: function () {
            if (gl.fromSetting == null || !Number.isFinite(+gl.fromSetting)) {
              notify('Enter a valid grinder setting first.');
              return;
            }
            const gFromCur = gList.find(function (x) { return x.key === gl.fromKey; }) || gList[0];
            const omniUm = _omniOverrideUm > 0 ? _omniOverrideUm : (labState.omniLive && labState.omniLive.d50Um > 0 ? labState.omniLive.d50Um : 0);
            const curUm = Math.round(omniUm > 0 ? omniUm : settingToUm(gFromCur, gl.fromSetting, { ignoreCustom: true }));
            gl.calPt1Click = +gl.fromSetting;
            gl.calPt1Um = curUm;
            gl.calPt1Locked = true;
            if (gl.calGrinderKey && gl.calGrinderKey !== gFromCur.key) {
              gl.calPt2Locked = false;
            }
            gl.calGrinderKey = gFromCur.key;
            CK.haptic('snap');
            paintGrinder();
            notify('Locked Burr Calibration Point 1 (' + gFromCur.name + '): ' + gl.calPt1Click + ' \u2192 ' + gl.calPt1Um + ' \u00B5m.');
          }
        }, 'Lock as Burr Point 1'),
        domH('button', {
          type: 'button',
          class: 'bt-lab-btn is-sm',
          onclick: function () {
            if (gl.fromSetting == null || !Number.isFinite(+gl.fromSetting)) {
              notify('Enter a valid grinder setting first.');
              return;
            }
            const gFromCur = gList.find(function (x) { return x.key === gl.fromKey; }) || gList[0];
            if (gl.calPt1Locked && gl.calGrinderKey && gl.calGrinderKey !== gFromCur.key) {
              notify('Point 1 was locked on ' + gl.calGrinderKey + ' — switch back to lock Point 2 on the same grinder, or re-lock Point 1 first.');
              return;
            }
            const omniUm = _omniOverrideUm > 0 ? _omniOverrideUm : (labState.omniLive && labState.omniLive.d50Um > 0 ? labState.omniLive.d50Um : 0);
            const curUm = Math.round(omniUm > 0 ? omniUm : settingToUm(gFromCur, gl.fromSetting, { ignoreCustom: true }));
            gl.calPt2Click = +gl.fromSetting;
            gl.calPt2Um = curUm;
            gl.calPt2Locked = true;
            gl.calGrinderKey = gFromCur.key;
            CK.haptic('snap');
            paintGrinder();
            if (Math.abs(gl.calPt2Click - gl.calPt1Click) < 0.5) {
              notify('Point 2 matches Point 1 — choose a different setting for a 2-point slope.');
            } else {
              notify('Locked Burr Calibration Point 2 (' + gFromCur.name + '): ' + gl.calPt2Click + ' \u2192 ' + gl.calPt2Um + ' \u00B5m.');
            }
          }
        }, 'Lock as Burr Point 2')
      )
    );

    fromSel.addEventListener('change', function () {
      gl.fromKey = fromSel.value;
      _omniOverrideUm = 0;
      gl.useOmniOverride = false;
      const gCur = gList.find(function (x) { return x.key === gl.fromKey; }) || gList[0];
      fromSetIn.min = String(gCur.min);
      fromSetIn.max = String(gCur.max);
      if (gl.fromSetting != null && Number.isFinite(+gl.fromSetting)) {
        gl.fromSetting = clamp(gl.fromSetting, gCur.min, gCur.max, gCur.min);
        fromSetIn.value = String(gl.fromSetting);
      }
      paintGrinder();
    });
    fromSetIn.addEventListener('input', function () {
      _omniOverrideUm = 0;
      gl.useOmniOverride = false;
    });

    function describeGrindReferenceBand(d50Um) {
      const u = Math.round(clamp(d50Um, 80, 1600, 580));
      if (u < 200) return { band: 'Ultra-Fine · Turkish / Ibrik', hint: 'Turkish <200 \u00B5m · Espresso 220–320 \u00B5m · V60 500–760 \u00B5m · French Press 850–1150 \u00B5m' };
      if (u < 350) return { band: 'Fine · Espresso / Moka', hint: 'Espresso 220–320 \u00B5m · V60 / Filter 500–760 \u00B5m · French Press 850–1150 \u00B5m' };
      if (u < 500) return { band: 'Medium-Fine · AeroPress / Fine Filter', hint: 'Fine Filter 380–500 \u00B5m · V60 500–760 \u00B5m · French Press 850–1150 \u00B5m' };
      if (u <= 760) return { band: 'Medium · V60 / Pour-Over / Filter', hint: 'Espresso 220–320 \u00B5m · V60 / Filter 500–760 \u00B5m · French Press 850–1150 \u00B5m' };
      if (u <= 1020) return { band: 'Medium-Coarse · Chemex / French Press', hint: 'Espresso 220–320 \u00B5m · V60 / Filter 500–760 \u00B5m · French Press 850–1150 \u00B5m' };
      return { band: 'Coarse · French Press / Cold Brew', hint: 'Espresso 220–320 \u00B5m · V60 / Filter 500–760 \u00B5m · Coarse / Cold Brew >1020 \u00B5m' };
    }

    const swapGrindersBtn = domH('button', {
      type: 'button',
      id: 'bt-grinder-swap-btn',
      class: 'bt-lab-btn is-sm bt-grinder-swap-btn',
      style: 'min-height:44px;width:100%;justify-content:center;',
      title: 'Flip From and To grinders and automatically convert the current grind size into the new source grinder’s setting',
      'aria-label': 'Swap From and To grinders',
      onclick: function () {
        if (gl.fromKey === gl.toKey) {
          CK.haptic('tick');
          notify('Same Grinder selected — pick a different target grinder to swap.');
          return;
        }
        const prevFrom = gList.find(function (x) { return x.key === gl.fromKey; }) || gList[0];
        const prevTo = gList.find(function (x) { return x.key === gl.toKey; }) || gList[1] || gList[0];
        const hasVal = gl.fromSetting != null && Number.isFinite(+gl.fromSetting);
        let revSetting = null;
        if (hasVal || _omniOverrideUm > 0) {
          const curUm = _omniOverrideUm > 0 ? _omniOverrideUm : Math.round(settingToUm(prevFrom, gl.fromSetting));
          const revInfo = umToSettingInfo(prevTo, curUm);
          if (revInfo && revInfo.num != null && !revInfo.incompatible) {
            revSetting = clamp(revInfo.num, prevTo.min, prevTo.max, prevTo.min);
          }
        }
        const tmpKey = gl.fromKey;
        gl.fromKey = gl.toKey;
        gl.toKey = tmpKey;
        fromSel.value = gl.fromKey;
        toSel.value = gl.toKey;
        const nextFrom = gList.find(function (x) { return x.key === gl.fromKey; }) || gList[0];
        fromSetIn.min = String(nextFrom.min);
        fromSetIn.max = String(nextFrom.max);
        if (revSetting != null && Number.isFinite(revSetting)) {
          gl.fromSetting = revSetting;
          fromSetIn.value = String(revSetting);
          _omniOverrideUm = 0;
          gl.useOmniOverride = false;
        } else if (gl.fromSetting != null && Number.isFinite(+gl.fromSetting)) {
          gl.fromSetting = clamp(gl.fromSetting, nextFrom.min, nextFrom.max, nextFrom.min);
          fromSetIn.value = String(gl.fromSetting);
        }
        CK.haptic('snap');
        paintGrinder();
        notify('Swapped: ' + prevTo.name + ' <-> ' + prevFrom.name);
      }
    }, 'Swap Grinders (<->)');

    function paintGrinder() {
      const gFrom = gList.find(function (x) { return x.key === gl.fromKey; }) || gList[0];
      const gTo = gList.find(function (x) { return x.key === gl.toKey; }) || gList[1] || gList[0];
      const sameGrinder = gFrom.key === gTo.key;
      const hasInput = gl.fromSetting != null && Number.isFinite(+gl.fromSetting);
      const dClick = gl.calPt2Click - gl.calPt1Click;
      const dUm = gl.calPt2Um - gl.calPt1Um;
      const customCal = getCustomCalibFor(gFrom.key) || getCustomCalibFor(gTo.key);
      const anyLocked = gl.calPt1Locked && gl.calPt2Locked;
      const calHintText = (!anyLocked || Math.abs(dClick) < 0.5 || dUm * dClick <= 0)
        ? '2-Point Burr Calibration: Lock 2 distinct settings on the same grinder (Point 1 \u2260 Point 2).'
        : ('2-Point Burr Calibration (' + (gl.calGrinderKey || gFrom.key) + '): ' + (dUm / dClick).toFixed(1) + ' \u00B5m/step (' +
            gl.calPt1Click + '\u2192' + gl.calPt1Um + ' \u00B5m, ' + gl.calPt2Click + '\u2192' + gl.calPt2Um + ' \u00B5m)' +
            (customCal ? ' · Active' : ' · Other grinder'));

      outBox.textContent = '';
      if (!hasInput && !(_omniOverrideUm > 0)) {
        outBox.appendChild(domH('div', { class: 'bt-studio-readout-banner' },
          sameGrinder ? domH('div', { class: 'bt-lab-chip-row', style: 'margin-bottom:6px' },
            domH('span', { class: 'bt-epistemic-pill is-craft', id: 'bt-grinder-same-guard', text: 'Same Grinder' })
          ) : null,
          domH('div', { class: 'bt-studio-human-line num-tab', id: 'bt-grinder-live-readout' },
            domH('strong', {
              text: sameGrinder
                ? ('Same Grinder selected (' + gFrom.name + '). Pick a different target grinder to translate.')
                : ('Enter a setting for ' + gFrom.name + ' to translate to ' + gTo.name + '.')
            })
          ),
          domH('p', { class: 'bt-lab-hint num-tab', text: calHintText })
        ));
        grinderTakeaway.set(
          sameGrinder
            ? ('Both dropdowns are set to ' + gFrom.name + '. Pick a different grinder in "Translate To" to convert clicks across burrs.')
            : ('Type a click/dial number for ' + gFrom.name + ' above to calculate its median particle size (D50 in \u00B5m) and matching setting on ' + gTo.name + '.'),
          'info'
        );
        renderOmniPsdHistogram();
        return;
      }

      const d50Um = _omniOverrideUm > 0 ? _omniOverrideUm : Math.round(settingToUm(gFrom, gl.fromSetting));
      const bandMeta = describeGrindReferenceBand(d50Um);
      const targetInfo = umToSettingInfo(gTo, d50Um);
      const targetDisp = targetInfo.display || (targetInfo.num + ' ' + fmtGrinderUnit(gTo.unit, targetInfo.num));

      if (sameGrinder) {
        grinderTakeaway.set(
          gFrom.name + ' at this setting produces ~' + d50Um + ' \u00B5m (' + bandMeta.band + '). Choose a different "Translate To" grinder to find its equivalent setting.',
          'warn'
        );
      } else if (targetInfo.incompatible) {
        grinderTakeaway.set(
          '~' + d50Um + ' \u00B5m (' + bandMeta.band + ') is outside ' + gTo.name + '\u2019s safe burr range (' + targetDisp + '). Try a slightly coarser or finer grind band for this grinder.',
          'warn'
        );
      } else {
        grinderTakeaway.set(
          'Set ' + gTo.name + ' to ' + targetDisp + ' to match ~' + d50Um + ' \u00B5m (' + bandMeta.band + '). Because burr geometry differs, dial \u00B11\u20132 clicks by taste on your first cup.',
          'good'
        );
      }

      outBox.appendChild(domH('div', { class: 'bt-studio-readout-banner' },
        domH('div', { class: 'bt-lab-chip-row', style: 'margin-bottom:6px' },
          domH('span', {
            class: 'bt-epistemic-pill is-verified num-tab bt-grinder-band-pill',
            id: 'bt-grinder-ref-band',
            text: bandMeta.band + ' (~' + d50Um + ' \u00B5m)'
          }),
          sameGrinder ? domH('span', {
            class: 'bt-epistemic-pill is-craft',
            id: 'bt-grinder-same-guard',
            text: 'Same Grinder'
          }) : null
        ),
        domH('div', { class: 'bt-studio-human-line num-tab', id: 'bt-grinder-live-readout' },
          domH('strong', {
            text: sameGrinder
              ? ('Same Grinder (' + gFrom.name + ' @ ' + (hasInput ? (gl.fromSetting + ' ' + fmtGrinderUnit(gFrom.unit, gl.fromSetting)) : 'Omni D50') + ' · ~' + d50Um + ' \u00B5m) — select a different grinder to translate.')
              : (gFrom.name + ' @ ' + (hasInput ? (gl.fromSetting + ' ' + fmtGrinderUnit(gFrom.unit, gl.fromSetting)) : 'Omni D50') + ' (~' + d50Um + ' \u00B5m D50)  \u2192  ' +
                  gTo.name + ' @ ' + targetDisp)
          })
        ),
        domH('p', {
          class: 'bt-lab-hint num-tab',
          text: 'Reference Bands: ' + bandMeta.hint
        }),
        domH('p', {
          class: 'bt-lab-hint num-tab',
          text: calHintText
        }),
        domH('div', { class: 'bt-chart-cta-bar', style: 'margin-top:8px' },
          domH('button', {
            type: 'button',
            class: 'bt-lab-btn is-primary bt-chart-cta-btn',
            onclick: function () {
              applyLabToBrewAndGo(function (a) {
                a.gear = a.gear || {};
                a.gear.grinder = gTo.key;
                a.gear.grinderKey = gTo.key;
                a.gear.grinderName = gTo.name;
                a.prefs.gear.grinder = gTo.key;
                a.prefs.gear.grinderKey = gTo.key;
                a.prefs.gear.grinderName = gTo.name;
                a.brew.grinderKey = gTo.key;
                a.brew.grinderName = gTo.name;
                const mappedSettingTxt = syncBrewGrindFields(a, d50Um, { grinderKey: gTo.key, overrideSetting: targetDisp });
                a.brew.customizedNote = gTo.name + ' @ ' + (mappedSettingTxt || targetDisp) + ' (~' + d50Um + ' \u00B5m)';
              }, {
                targetStep: 'brew',
                returnRoute: 'devices',
                toast: 'Applied ' + gTo.name + ' @ ' + targetDisp + ' (~' + d50Um + ' \u00B5m) to your recipe!'
              });
            }
          }, ic('grinder-burr', { size: 15 }), domH('span', { text: 'Apply Translated Setting to Active Recipe \u2192' }))
        )
      ));
      renderOmniPsdHistogram();
    }

    card.appendChild(domH('div', { class: 'bt-lab-card-head' },
      domH('div', { class: 'bt-lab-title-group' },
        ic('grinder-burr', { size: 22 }),
        domH('div', null,
          domH('h3', { text: 'Cross-Grinder Click Translator & DiFluid Omni D50 Calibration' }),
          domH('p', { class: 'bt-lab-sub', text: 'Translate any recipe click/dial or live Omni D50 micron scan across ' + gList.length + ' grinders' })
        )
      ),
      epistemicBadge('calibrated_biophysics')
    ));
    card.appendChild(buildWhatBox('What this tool does', [
      'Converts a grind setting from one grinder into the matching ',
      labAbbr('D50 (\u00B5m)', 'Median coffee particle diameter in microns — 250 \u00B5m is espresso-fine, 600 \u00B5m is pour-over, 1000 \u00B5m is French Press'),
      ' on another grinder. Click ',
      domH('strong', { text: 'Swap Grinders (<->)' }),
      ' to reverse the direction and carry the converted grind size over automatically.'
    ]));
    card.appendChild(domH('div', {
      class: 'bt-lab-inline-inputs bt-grinder-translator-grid',
      style: 'grid-template-columns:repeat(auto-fit,minmax(160px,1fr));align-items:end;'
    },
      domH('label', { class: 'bt-lab-field-lbl', title: 'The grinder that your recipe or current click number came from' }, domH('span', { text: 'From Grinder' }), fromSel),
      domH('label', { class: 'bt-lab-field-lbl', title: 'Current click, dial, or step number on the From Grinder' }, domH('span', { text: 'Setting' }), fromSetIn),
      domH('div', { class: 'bt-lab-field-lbl', title: 'Flip source and target grinders while preserving particle size' }, domH('span', { text: 'Direction' }), swapGrindersBtn),
      domH('label', { class: 'bt-lab-field-lbl', title: 'The grinder on your counter that you want the equivalent setting for' }, domH('span', { text: 'Translate To' }), toSel)
    ));
    card.appendChild(outBox);
    card.appendChild(grinderTakeaway.el);
    card.appendChild(omniPsdCard);
    paintGrinder();

    _labLiveHooks.grinderLab = function (opts) {
      if (!card.isConnected) return false;
      if (opts && opts.d50Changed && labState.omniLive.d50Um > 0) {
        const measuredUm = Math.round(labState.omniLive.d50Um);
        _omniOverrideUm = measuredUm;
        gl.useOmniOverride = true;
        const gFrom = gList.find(function (x) { return x.key === gl.fromKey; }) || gList[0];
        const solvedSet = umToSetting(gFrom, measuredUm);
        if (Number.isFinite(+solvedSet)) {
          gl.fromSetting = +solvedSet;
          if (typeof document === 'undefined' || document.activeElement !== fromSetIn) {
            fromSetIn.value = String(gl.fromSetting);
          }
        }
        paintGrinder();
        return true;
      }
      renderOmniPsdHistogram();
      return true;
    };
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
    wrap.appendChild(renderHardwareBench(true, 'studio'));
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
    {
      id: 'ey',
      label: '1. Touch-to-Brew Chart',
      icon: 'refract-prism',
      kicker: 'Studio 1 of 5 · Extraction & Strength',
      intro: 'Tap or drag your target %EY x %TDS sweet spot, read DiFluid R2 %TDS, and load the exact dose & water straight to Step 3.',
      jumps: [{ id: 'bt-studio-ey', label: 'Sweet-Spot Chart' }, { id: 'bt-lab-r2-live-bar', label: 'R2 %TDS & %EY' }],
      build: buildStudioBrewControl
    },
    {
      id: 'rescue',
      label: '2. Rescue & Mug Fix',
      icon: 'spark-star',
      kicker: 'Studio 2 of 5 · Cup Rescue & Pour Waves',
      intro: 'Fix a bitter, sour, or watery mug right now — or tune 3-Wave extraction timing & carafe cutoff gate for your next pour.',
      jumps: [{ id: 'bt-studio-mug-rescue', label: 'In-Mug Rescue' }, { id: 'bt-studio-waves', label: '3-Wave Cutoff' }],
      build: buildStudioRescueHub
    },
    {
      id: 'water',
      label: '3. Water & Ratio',
      icon: 'water-drop',
      kicker: 'Studio 3 of 5 · Water, Ratio & Vessel',
      intro: 'Dial in GH/KH water chemistry, solve 4-anchor dose/water/yield ratios, and plan Flash-Iced or steamed milk drinks.',
      jumps: [{ id: 'bt-studio-water', label: 'Water & Minerals' }, { id: 'bt-studio-ratio-yield', label: '4-Anchor Ratio' }, { id: 'bt-studio-vessel', label: 'Carafe & Milk' }],
      build: buildStudioWaterAndRatioHub
    },
    {
      id: 'caffeine',
      label: '4. Caffeine & Cost',
      icon: 'moon-dark',
      kicker: 'Studio 4 of 5 · Circadian PK & Cost ROI',
      intro: 'Protect deep sleep with your daily caffeine budget & cutoff time, compare bag freshness/value, and track gear payback.',
      jumps: [{ id: 'bt-studio-caffeine', label: 'Caffeine & Cutoff' }, { id: 'bt-studio-bagcmp', label: 'Compare 2 Bags' }, { id: 'bt-studio-cost-roi', label: 'True Cup ROI' }],
      build: buildStudioCaffeineAndCostHub
    },
    {
      id: 'devices',
      label: '5. Bluetooth & Grinder Lab',
      icon: 'ble-wave',
      kicker: 'Studio 5 of 5 · BLE Gear, Grinder & Agtron',
      intro: 'Connect 15+ WebBLE scales, refractometers & kettles, swap & translate clicks across grinders, and check Agtron roast freshness.',
      jumps: [{ id: 'bt-studio-grinder-lab', label: 'Grinder Translator' }, { id: 'bt-studio-agtron', label: 'Agtron & Freshness' }],
      build: buildStudioBluetoothAndGrinderHub
    }
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
    const quickReadR2Btn = domH('button', {
      type: 'button',
      id: 'bt-hw-bar-r2-read-btn',
      class: 'bt-hw-sim-pill',
      hidden: true,
      title: 'Trigger DiFluid R2 Refractometer Reading',
      onclick: function () {
        const b = window.BTBle || ble;
        if (typeof b.triggerRefractometerRead === 'function') {
          Promise.resolve(b.triggerRefractometerRead()).catch(function () {});
        }
      }
    }, 'Read R2 Now');

    function syncHwStatus() {
      const st = getBleStateSafe();
      const simOn = !!st.simulatorActive;
      const scOn = !!(st.scaleConnected || (st.scale && st.scale.connected));
      const prOn = !!(st.pressureConnected || (st.pressure && st.pressure.connected));
      const r2On = !!(st.refractometerConnected || (st.refractometer && st.refractometer.connected));
      const omOn = !!(st.omniConnected || (st.omni && st.omni.connected));
      const ktOn = !!st.kettleConnected;
      const xbOn = !!st.xbloomConnected;
      const r2Tds = (st.refractometer && st.refractometer.tds) || st.lastTds || labState.bc.measTds;
      const anyLive = scOn || prOn || r2On || omOn || ktOn || xbOn || simOn || r2Tds > 0;
      setClassIfChanged(statusDot, 'bt-hw-dot' + (anyLive ? ' is-live' : ''));
      const parts = [];
      if (scOn) parts.push(Number((st.scale && st.scale.weightG != null ? st.scale.weightG : st.weightG) || 0).toFixed(1) + ' g');
      if (prOn && (st.pressureConnected || +st.pressureBar > 0.1)) parts.push(Number((st.pressure && st.pressure.bar != null ? st.pressure.bar : st.pressureBar) || 0).toFixed(1) + ' bar');
      if (r2Tds > 0) parts.push(Number(r2Tds).toFixed(2) + '% TDS');
      else if (r2On) parts.push('R2 Ready');
      if (omOn || labState.omniLive.d50Um) {
        parts.push(labState.omniLive.d50Um ? ('D50 ' + Math.round(labState.omniLive.d50Um) + ' \u00B5m') : 'Omni Live');
      }
      if (ktOn) parts.push('Kettle ' + (st.kettleTempC != null ? (Math.round(+st.kettleTempC) + ' \u00B0C') : 'On'));
      if (xbOn) parts.push('xBloom ' + (st.xbloomStage || 'Ready'));
      const vwNow = (typeof window !== 'undefined' && window.innerWidth > 0) ? window.innerWidth : 1024;
      const idleStatusTxt = vwNow < 580
        ? 'BLE Standby'
        : (vwNow < 780 ? 'Scale / R2 / Omni Standby' : 'Scale / Pressure / R2 / Omni / Kettle Standby');
      setTextIfChanged(statusTxt, parts.length ? ('Live: ' + parts.join(' \u00B7 ')) : idleStatusTxt);
      quickReadR2Btn.hidden = !(r2On || simOn);
      return barRoot && barRoot.isConnected;
    }

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
        const b = window.BTBle || ble;
        const st = getBleStateSafe();
        if (st.simulatorActive && typeof b.stopSimulator === 'function') {
          b.stopSimulator();
          notify('Stopped 10Hz BLE Simulator.');
        } else if (typeof b.startSimulator === 'function') {
          b.startSimulator();
          notify('10Hz Scale + R2 + Omni Simulator active!');
        } else {
          labState.bc.measTds = 1.42;
          labState.bc.measTempC = 23.4;
          notify('Simulated 1.42% TDS (23.4 \u00B0C) & 10Hz Scale!');
        }
        CK.haptic('snap');
        syncHwStatus();
      }
    }, '10Hz Sim');

    const barRoot = domH('div', { class: 'bt-lab-hw-bar', role: 'region', 'aria-label': 'Compact Bluetooth Hardware Bar' },
      domH('div', { class: 'bt-hw-bar-left' }, statusDot, statusTxt),
      domH('div', { class: 'bt-hw-bar-right' }, quickReadR2Btn, connectBtn, simBtn)
    );
    syncHwStatus();
    _labLiveHooks.hwBar = syncHwStatus;
    return barRoot;
  }

  function renderLabTab(mountEl, ctx) {
    ensureLabBleListeners();
    const page = domH('div', {
      class: 'bt-tab-page bt-lab-page',
      style: 'min-width:0;max-width:100%;box-sizing:border-box;'
    });
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

    const studioIntroBanner = domH('div', {
      class: 'bt-lab-studio-intro',
      id: 'bt-lab-studio-intro',
      role: 'region',
      'aria-label': 'Active Lab Studio Summary',
      style: 'display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 12px;padding:10px 14px;border-radius:16px;background:var(--surface, #FFFFFF);border:1px solid var(--line, #DCCDBE);border-left:3.5px solid var(--primary, #1B4D38);min-width:0;max-width:100%;box-sizing:border-box;'
    });
    const studioStage = domH('div', { class: 'bt-lab-studios-stage', style: 'min-width:0;max-width:100%;' });
    const navBar = domH('nav', {
      class: 'bt-studio-pill-nav',
      'aria-label': 'Lab & Rescue Studios',
      style: 'max-width:100%;box-sizing:border-box;'
    });
    let pillBtns = [];

    function paintStudioIntro(activeId) {
      const st = STUDIO_TABS.find(function (t) { return t.id === activeId; }) || STUDIO_TABS[0];
      studioIntroBanner.textContent = '';
      const copyWrap = domH('div', { style: 'flex:1 1 230px;min-width:0;' },
        domH('span', {
          class: 'bt-kicker',
          style: 'display:block;font-size:0.7rem;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;color:var(--accent, #9A4212);margin-bottom:2px;',
          text: st.kicker || st.label
        }),
        domH('p', {
          class: 'bt-lab-sub',
          style: 'margin:0;font-size:0.82rem;line-height:1.4;color:var(--ink-secondary, #534034);',
          text: st.intro || ''
        })
      );
      studioIntroBanner.appendChild(copyWrap);
      if (Array.isArray(st.jumps) && st.jumps.length > 1) {
        const jumpRow = domH('div', {
          class: 'bt-lab-chip-row',
          style: 'gap:6px;flex:0 1 auto;'
        });
        st.jumps.forEach(function (jp) {
          jumpRow.appendChild(domH('button', {
            type: 'button',
            class: 'bt-lab-chip',
            style: 'min-height:36px;padding:5px 11px;font-size:0.78rem;',
            onclick: function () {
              const target = document.getElementById(jp.id);
              if (target && typeof target.scrollIntoView === 'function') {
                try { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (_) {}
              }
            }
          }, jp.label));
        });
        studioIntroBanner.appendChild(jumpRow);
      }
    }

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
      paintStudioIntro(id);
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
    paintStudioIntro(labState.activeStudio);
    page.appendChild(studioIntroBanner);
    page.appendChild(studioStage);
    mountActiveStudio();

    page.appendChild(domH('div', {
      class: 'bt-lab-bottom-actions no-print',
      style: 'display:flex;justify-content:center;padding:8px 0 4px;'
    },
      domH('button', {
        type: 'button',
        id: 'bt-lab-back-to-top-btn',
        class: 'bt-lab-btn is-sm',
        'aria-label': 'Back to top of Lab & Tools',
        onclick: function () {
          CK.haptic('tick');
          if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
            try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (_) { window.scrollTo(0, 0); }
          }
          if (navBar && typeof navBar.scrollIntoView === 'function') {
            try { navBar.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (_) {}
          }
        }
      }, 'Back to Top \u2191')
    ));

    if (mountEl && mountEl.nodeType === 1) {
      mountEl.textContent = '';
      mountEl.appendChild(page);
    }
    return page;
  }

  function renderBleDevicesSheet(arg0) {
    const hostEl = arg0 && arg0.nodeType === 1 ? arg0 : null;
    const box = domH('div', {
      class: 'bt-sheet-content bt-ble-sheet-content',
      style: 'min-width:0;max-width:100%;box-sizing:border-box;'
    },
      domH('div', { class: 'bt-sheet-head-sub' },
        ic('ble-wave', { size: 22 }),
        domH('div', { style: 'min-width:0;' },
          domH('h2', { text: '5-Slot Bluetooth Bench & Pocket Micron Lens' }),
          domH('p', { class: 'bt-lab-sub', text: 'Concurrent WebBLE GATT across 15+ hardware families + Live Packet Inspector' })
        )
      ),
      renderHardwareBench(true, 'sheet')
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
