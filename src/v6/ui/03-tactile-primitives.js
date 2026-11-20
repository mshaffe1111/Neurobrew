/* ==========================================================================
   BeanTelligence v6.0 — 03-tactile-primitives.js
   Zero-Form Direct-Manipulation Tactile Coffee Instruments:
   - BTPrecisionKeypad (56pt Bottom-Anchored Keypad, Zero OS Keyboard/Spinners)
   - BTDrumWheel & BTLinkedDrumTrio (Dose <-> Water <-> Ratio w/ Padlock Anchor)
   - BTRoastArc (240 deg Roast Wheel + X-Ray Continuous Agtron & Roast Delta)
   - BTGrinderDial (48-Grinder Collar Dial + Particle Texture + Micron X-Ray)
   - BTThermalBar (Slurry-Compensated Kettle Scrubber + Altitude Boil Cap)
   - BTTastePad2D (2D Sensory Field + Sweet-Spot Halo + Dual-Pin R2/BLE Fusion)
   - BTBeanSweep (0.25-Step 5-Bean Rating Sweep, Gradient-Stop Fractional Fill)
   ========================================================================== */

let _tactileUidSeq = 0;
function _tUid(prefix) {
  return (prefix || 'btt') + '_' + (++_tactileUidSeq);
}

function _prefersReducedMotion() {
  try {
    return !!(typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  } catch (e) {
    return false;
  }
}

function _hapticTick() {
  try { if (window.BTHaptics && window.BTHaptics.tick) window.BTHaptics.tick(); } catch (e) {}
}

function _hapticSnap() {
  try { if (window.BTHaptics && window.BTHaptics.snap) window.BTHaptics.snap(); } catch (e) {}
}

function _hapticSweetSpot() {
  try {
    if (window.BTHaptics && window.BTHaptics.sweetSpotLock) window.BTHaptics.sweetSpotLock();
    else _hapticSnap();
  } catch (e) {}
}

function _clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function _quantize(v, step, lo, hi) {
  const s = step > 0 ? step : 1;
  const q = Math.round(v / s) * s;
  const dec = (String(s).split('.')[1] || '').length;
  const rounded = dec > 0 ? +q.toFixed(Math.min(4, dec)) : Math.round(q);
  return _clamp(rounded, lo, hi);
}

/* ==================== 0. 1-TAP "? HOW THIS WORKS" EXPLAINER & R2 TEMP COACH (#157) ==================== */
function BTExplainerPill(cfg) {
  cfg = cfg || {};
  let openState = false;
  const panelId = _tUid('bt_exp');

  const card = h('div', {
    class: 'bt-explainer-card',
    id: panelId,
    role: 'region',
    'aria-label': (cfg.title || 'Control') + ' guide',
    hidden: true
  },
    cfg.title ? h('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:8px;font-weight:700;font-size:0.84rem' },
      h('span', null, BTIcons.el('info-circle', { size: 15 }), ' ', cfg.title),
      h('button', {
        type: 'button',
        class: 'bt-chip',
        style: 'min-height:44px;padding:4px 10px;font-size:0.72rem',
        text: 'Got it',
        onclick: function() { setOpen(false); }
      })
    ) : null,
    h('div', { class: 'bt-explainer-row' }, h('b', { text: 'What it does: ' }), h('span', { text: cfg.what || '' })),
    h('div', { class: 'bt-explainer-row' }, h('b', { text: 'How to use in 1 touch: ' }), h('span', { text: cfg.how || '' })),
    h('div', { class: 'bt-explainer-row' }, h('b', { text: 'Pro sensor tip: ' }), h('span', { text: cfg.tip || '' }))
  );

  const btn = h('button', {
    type: 'button',
    class: 'bt-explainer-btn',
    'aria-expanded': 'false',
    'aria-controls': panelId,
    'aria-label': 'How ' + (cfg.title || 'this control') + ' works',
    onclick: function() {
      _hapticTick();
      setOpen(!openState);
    }
  },
    BTIcons.el('info-circle', { size: 15 }),
    h('span', { text: cfg.label || '? How This Works' })
  );

  function setOpen(next) {
    openState = !!next;
    card.hidden = !openState;
    btn.setAttribute('aria-expanded', String(openState));
  }

  return { btn: btn, panel: card, setOpen: setOpen };
}

function BTR2ReadinessBadge(cfg) {
  cfg = cfg || {};
  let tempC = isFinite(+cfg.sampleTempC) ? +cfg.sampleTempC : null;
  if (tempC == null) {
    try {
      if (typeof window !== 'undefined' && window.BTBle && typeof window.BTBle.getState === 'function') {
        const st = window.BTBle.getState() || {};
        const r2 = (st.slots && st.slots.refractometer) || st;
        if (isFinite(+r2.tempC) && +r2.tempC > 0) tempC = +r2.tempC;
      }
    } catch (e) {}
  }

  const guide = BTExplainerPill({
    label: 'Meter Best-Reading Guide',
    title: 'Refractometer Spoon-Chill & Sample Guide',
    what: 'Ideal sample temperature is 20–28 °C (68–82 °F), close to room temperature. Piping-hot drops (>32–60 °C) evaporate fast and drift high on %TDS.',
    how: 'Stir 3–5 mL in a room-temp metal spoon for 15–20s (cools 75 °C \u2192 ~24 °C cleanly), zero the meter with distilled water, place 3–4 drops, and wait 5–10s.',
    tip: 'For espresso or French press, pass the sample through a syringe filter first so natural coffee oils and fine particles do not scatter the reading.'
  });

  const isIdeal = tempC != null && tempC >= 18 && tempC <= 29;
  const isWarm = tempC != null && tempC > 29;
  const statusText = tempC == null
    ? 'Refractometer Target: Cool sample in metal spoon to 20–28 °C (68–82 °F)'
    : isIdeal
    ? ('Sample Temp Ideal (' + tempC.toFixed(1) + ' °C)')
    : isWarm
    ? ('Sample Too Warm (' + tempC.toFixed(1) + ' °C) — Cool in Metal Spoon to 20–28 °C First')
    : ('Sample Cool (' + tempC.toFixed(1) + ' °C) — Let warm 5–10s toward 20–28 °C');

  const bar = h('div', { class: 'bt-r2-temp-bar' + (isIdeal ? ' is-ideal' : (isWarm ? ' is-warm' : '')) },
    h('span', { style: 'display:inline-flex;align-items:center;gap:6px' },
      BTIcons.el('refract-prism', { size: 15 }),
      h('span', { text: statusText })
    ),
    guide.btn
  );

  return h('div', { class: 'bt-explainer-wrap' }, bar, guide.panel);
}

/* ==================== 1. BTPrecisionKeypad (56pt Zero-OS-Keyboard Sheet) ==================== */
const BTPrecisionKeypad = (function() {
  let keyHandler = null;
  let activeClose = null;

  const BUILTIN_UNITS = {
    'g':      { label: 'g',      toDisplay: function(v) { return v; },                  fromDisplay: function(v) { return v; },                  dec: 1 },
    'oz':     { label: 'oz',     toDisplay: function(v) { return v / 28.349523125; },   fromDisplay: function(v) { return v * 28.349523125; },   dec: 2 },
    'tbsp':   { label: 'tbsp',   toDisplay: function(v) { return v / 5.3; },            fromDisplay: function(v) { return v * 5.3; },            dec: 1 },
    'mL':     { label: 'mL',     toDisplay: function(v) { return v; },                  fromDisplay: function(v) { return v; },                  dec: 0 },
    'fl oz':  { label: 'fl oz',  toDisplay: function(v) { return v / 29.57352956; },    fromDisplay: function(v) { return v * 29.57352956; },    dec: 1 },
    'cups':   { label: 'cups',   toDisplay: function(v) { return v / 236.588; },        fromDisplay: function(v) { return v * 236.588; },        dec: 2 },
    'C':      { label: '°C',     toDisplay: function(v) { return v; },                  fromDisplay: function(v) { return v; },                  dec: 1 },
    '°C':     { label: '°C',     toDisplay: function(v) { return v; },                  fromDisplay: function(v) { return v; },                  dec: 1 },
    'F':      { label: '°F',     toDisplay: function(v) { return v * 9 / 5 + 32; },     fromDisplay: function(v) { return (v - 32) * 5 / 9; },   dec: 0 },
    '°F':     { label: '°F',     toDisplay: function(v) { return v * 9 / 5 + 32; },     fromDisplay: function(v) { return (v - 32) * 5 / 9; },   dec: 0 },
    'm':      { label: 'm',      toDisplay: function(v) { return v; },                  fromDisplay: function(v) { return v; },                  dec: 0 },
    'masl':   { label: 'masl',   toDisplay: function(v) { return v; },                  fromDisplay: function(v) { return v; },                  dec: 0 },
    'ft':     { label: 'ft',     toDisplay: function(v) { return v * 3.28084; },        fromDisplay: function(v) { return v / 3.28084; },        dec: 0 },
    '% TDS':  { label: '% TDS',  toDisplay: function(v) { return v; },                  fromDisplay: function(v) { return v; },                  dec: 2 },
    'Brix':   { label: '°Bx',    toDisplay: function(v) { return v / 0.85; },           fromDisplay: function(v) { return v * 0.85; },           dec: 2 }
  };

  function normalizeUnits(unitStr, unitsList, decimals) {
    const baseKey = unitStr || '';
    if (!Array.isArray(unitsList) || !unitsList.length) {
      return [{
        key: baseKey,
        label: baseKey,
        toDisplay: function(v) { return v; },
        fromDisplay: function(v) { return v; },
        dec: typeof decimals === 'number' ? decimals : 1
      }];
    }
    return unitsList.map(function(u) {
      if (typeof u === 'string') {
        const b = BUILTIN_UNITS[u];
        if (b) return { key: u, label: b.label, toDisplay: b.toDisplay, fromDisplay: b.fromDisplay, dec: b.dec };
        return { key: u, label: u, toDisplay: function(v) { return v; }, fromDisplay: function(v) { return v; }, dec: decimals || 1 };
      }
      return {
        key: u.key || u.label || '',
        label: u.label || u.key || '',
        toDisplay: u.toDisplay || function(v) { return v; },
        fromDisplay: u.fromDisplay || function(v) { return v; },
        dec: typeof u.dec === 'number' ? u.dec : (decimals || 1)
      };
    });
  }

  function isOpen() {
    const host = $('keypad-host');
    return !!(host && host.classList.contains('is-open') && !host.hidden);
  }

  function close() {
    if (keyHandler && typeof window !== 'undefined') {
      window.removeEventListener('keydown', keyHandler, true);
      keyHandler = null;
    }
    const host = $('keypad-host');
    if (host) {
      host.classList.remove('is-open');
      host.hidden = true;
      host.textContent = '';
    }
    if (typeof activeClose === 'function') {
      const fn = activeClose;
      activeClose = null;
      try { fn(); } catch (e) {}
    }
  }

  function open(cfg) {
    cfg = cfg || {};
    close();
    const host = $('keypad-host');
    if (!host) return;

    const min = typeof cfg.min === 'number' ? cfg.min : 0;
    const max = typeof cfg.max === 'number' ? cfg.max : 9999;
    const step = typeof cfg.step === 'number' && cfg.step > 0 ? cfg.step : 1;
    const defaultDec = typeof cfg.decimals === 'number' ? cfg.decimals : (String(step).split('.')[1] || '').length;
    const unitDefs = normalizeUnits(cfg.unit || '', cfg.units, defaultDec);
    let unitIdx = 0;
    let baseVal = _clamp(isFinite(+cfg.value) ? +cfg.value : min, min, max);
    let buffer = '';
    let freshBuffer = true;
    activeClose = cfg.onClose || null;

    function fmtCurrent() {
      if (!freshBuffer && buffer !== '') return buffer;
      const u = unitDefs[unitIdx];
      const dv = u.toDisplay(baseVal);
      return dv.toFixed(u.dec);
    }

    function syncBufferToBase() {
      if (freshBuffer || buffer === '' || buffer === '.') return;
      const parsed = parseFloat(buffer);
      if (isFinite(parsed)) {
        baseVal = _clamp(unitDefs[unitIdx].fromDisplay(parsed), min, max);
      }
    }

    const valSpan = h('span', { class: 'bt-keypad-val', text: fmtCurrent() });
    const unitSpan = h('span', { class: 'mono', style: 'font-size:1rem;color:var(--ink-muted);font-weight:700', text: unitDefs[unitIdx].label });
    const rangeHint = h('span', { class: 'mono', style: 'font-size:0.75rem;color:var(--ink-muted)' });

    function paintDisplay() {
      const u = unitDefs[unitIdx];
      valSpan.textContent = fmtCurrent();
      unitSpan.textContent = u.label;
      rangeHint.textContent = u.toDisplay(min).toFixed(u.dec) + ' – ' + u.toDisplay(max).toFixed(u.dec) + ' ' + u.label;
    }

    function pushDigit(ch) {
      _hapticTick();
      if (freshBuffer) {
        buffer = ch === '.' ? '0.' : ch;
        freshBuffer = false;
      } else {
        if (ch === '.' && buffer.indexOf('.') >= 0) return;
        if (buffer.length >= 8) return;
        buffer = (buffer === '0' && ch !== '.') ? ch : (buffer + ch);
      }
      syncBufferToBase();
      paintDisplay();
    }

    function backspace() {
      _hapticTick();
      if (freshBuffer) {
        buffer = fmtCurrent();
        freshBuffer = false;
      }
      buffer = buffer.slice(0, -1);
      if (!buffer) {
        freshBuffer = true;
      } else {
        syncBufferToBase();
      }
      paintDisplay();
    }

    function stepBy(delta) {
      syncBufferToBase();
      freshBuffer = true;
      buffer = '';
      baseVal = _quantize(baseVal + delta * step, step, min, max);
      _hapticTick();
      paintDisplay();
      if (typeof cfg.onInput === 'function') cfg.onInput(baseVal);
    }

    function commit() {
      syncBufferToBase();
      const finalVal = _quantize(baseVal, step, min, max);
      _hapticSnap();
      if (typeof cfg.onCommit === 'function') cfg.onCommit(finalVal, unitDefs[unitIdx].key);
      close();
    }

    const unitsBar = unitDefs.length > 1
      ? h('div', { class: 'bt-keypad-units', role: 'group', 'aria-label': 'Unit selector' },
          unitDefs.map(function(u, idx) {
            return h('button', {
              type: 'button',
              class: 'bt-chip',
              'aria-pressed': String(idx === unitIdx),
              text: u.label,
              onclick: function() {
                syncBufferToBase();
                unitIdx = idx;
                freshBuffer = true;
                buffer = '';
                _hapticTick();
                const all = unitsBar.querySelectorAll('button');
                for (let k = 0; k < all.length; k++) all[k].setAttribute('aria-pressed', String(k === unitIdx));
                paintDisplay();
              }
            });
          })
        )
      : null;

    function keyBtn(label, cls, onClick, ariaLbl) {
      return h('button', {
        type: 'button',
        class: 'bt-keypad-key' + (cls ? ' ' + cls : ''),
        'aria-label': ariaLbl || String(label),
        onclick: onClick
      }, label);
    }

    const stepTxt = (step < 1 ? step.toFixed(defaultDec) : String(step));
    const grid = h('div', { class: 'bt-keypad-grid' },
      keyBtn('7', '', function() { pushDigit('7'); }),
      keyBtn('8', '', function() { pushDigit('8'); }),
      keyBtn('9', '', function() { pushDigit('9'); }),
      keyBtn('−' + stepTxt, 'is-step', function() { stepBy(-1); }, 'Decrease by ' + stepTxt),

      keyBtn('4', '', function() { pushDigit('4'); }),
      keyBtn('5', '', function() { pushDigit('5'); }),
      keyBtn('6', '', function() { pushDigit('6'); }),
      keyBtn('+' + stepTxt, 'is-step', function() { stepBy(1); }, 'Increase by ' + stepTxt),

      keyBtn('1', '', function() { pushDigit('1'); }),
      keyBtn('2', '', function() { pushDigit('2'); }),
      keyBtn('3', '', function() { pushDigit('3'); }),
      keyBtn(cfg.recValue != null ? 'Reset' : 'Clear', 'is-step', function() {
        _hapticTick();
        freshBuffer = true;
        buffer = '';
        if (cfg.recValue != null && isFinite(+cfg.recValue)) baseVal = _clamp(+cfg.recValue, min, max);
        paintDisplay();
      }, cfg.recValue != null ? 'Reset to recommended value' : 'Clear input'),

      keyBtn('.', '', function() { pushDigit('.'); }, 'Decimal point'),
      keyBtn('0', '', function() { pushDigit('0'); }),
      keyBtn(BTIcons.el('backspace', { size: 20 }), '', backspace, 'Backspace'),
      keyBtn('Done', 'is-commit', commit, 'Apply value')
    );

    const sheet = h('div', {
      class: 'bt-keypad-sheet',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': (cfg.label || 'Value') + ' numeric keypad'
    },
      h('div', { class: 'bt-keypad-top' },
        h('strong', { text: cfg.label || 'Set Value' }),
        rangeHint,
        h('button', {
          type: 'button',
          class: 'bt-icon-btn',
          'aria-label': 'Close keypad',
          onclick: close
        }, BTIcons.el('close-x', { size: 18 }))
      ),
      h('div', { class: 'bt-keypad-display' }, valSpan, unitSpan),
      unitsBar,
      grid
    );

    paintDisplay();
    host.appendChild(h('div', { class: 'bt-keypad-backdrop', onclick: close }));
    host.appendChild(sheet);
    host.hidden = false;
    host.classList.add('is-open');

    if (typeof window !== 'undefined') {
      keyHandler = function(e) {
        if (e.key >= '0' && e.key <= '9') { e.preventDefault(); pushDigit(e.key); }
        else if (e.key === '.') { e.preventDefault(); pushDigit('.'); }
        else if (e.key === 'Backspace') { e.preventDefault(); backspace(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); stepBy(1); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); stepBy(-1); }
        else if (e.key === 'Enter') { e.preventDefault(); commit(); }
        else if (e.key === 'Escape') { e.preventDefault(); close(); }
      };
      window.addEventListener('keydown', keyHandler, true);
    }
  }

  return { open, close, isOpen };
})();

/* ==================== 2. BTDrumWheel (Inertial Tick-Mark Scrubber) ==================== */
function BTDrumWheel(cfg) {
  cfg = cfg || {};
  const min = typeof cfg.min === 'number' ? cfg.min : 0;
  const max = typeof cfg.max === 'number' ? cfg.max : 1000;
  const step = typeof cfg.step === 'number' && cfg.step > 0 ? cfg.step : 1;
  const decimals = typeof cfg.decimals === 'number' ? cfg.decimals : (String(step).split('.')[1] || '').length;
  const pxPerStep = typeof cfg.pxPerStep === 'number' ? cfg.pxPerStep : 14;

  let curVal = _quantize(isFinite(+cfg.value) ? +cfg.value : min, step, min, max);
  let isLocked = !!cfg.locked;
  let rafId = 0;

  function fmtVal(v) {
    if (typeof cfg.format === 'function') return cfg.format(v);
    return v.toFixed(decimals);
  }

  const valNode = h('span', { text: fmtVal(curVal) });
  const unitNode = cfg.unit ? h('span', { class: 'bt-drum-unit', text: cfg.unit }) : null;

  const readoutBtn = h('button', {
    type: 'button',
    class: 'bt-drum-readout',
    'aria-label': (cfg.label || 'Value') + ': ' + fmtVal(curVal) + (cfg.unit ? ' ' + cfg.unit : '') + '. Tap for precision keypad.',
    onclick: function() {
      if (typeof cfg.onTapKeypad === 'function') {
        cfg.onTapKeypad(curVal);
        return;
      }
      BTPrecisionKeypad.open({
        label: cfg.label || 'Set Value',
        value: curVal,
        min: min,
        max: max,
        step: step,
        decimals: decimals,
        unit: cfg.unit || '',
        units: cfg.units,
        recValue: cfg.recValue,
        onCommit: function(nextV) {
          setValue(nextV, false);
          if (typeof cfg.onCommit === 'function') cfg.onCommit(curVal);
        }
      });
    }
  }, valNode, unitNode);

  let lockBtn = null;
  if (cfg.showLock || typeof cfg.onToggleLock === 'function') {
    lockBtn = h('button', {
      type: 'button',
      class: 'bt-drum-lock',
      'aria-pressed': String(isLocked),
      'aria-label': (isLocked ? 'Unlock ' : 'Lock ') + (cfg.label || 'parameter'),
      onclick: function() {
        isLocked = !isLocked;
        _hapticSnap();
        syncLockUi();
        if (typeof cfg.onToggleLock === 'function') cfg.onToggleLock(isLocked);
      }
    });
  }

  const ticksGroup = h('g', { class: 'bt-drum-ticks' });
  for (let t = -14; t <= 14; t++) {
    const x = 140 + t * 12;
    const major = (t % 5) === 0;
    ticksGroup.appendChild(h('line', {
      x1: x,
      y1: major ? 8 : 14,
      x2: x,
      y2: major ? 36 : 30,
      stroke: major ? 'var(--line-strong)' : 'var(--line)',
      'stroke-width': major ? 1.8 : 1.2,
      'stroke-linecap': 'round'
    }));
  }

  const trackSvg = h('svg', { class: 'bt-drum-track-svg', viewBox: '0 0 280 44', preserveAspectRatio: 'none', 'aria-hidden': 'true' }, ticksGroup);
  const track = h('div', {
    class: 'bt-drum-track',
    role: 'slider',
    tabindex: '0',
    'aria-label': cfg.label || 'Drum scrubber',
    'aria-valuemin': min,
    'aria-valuemax': max,
    'aria-valuenow': curVal,
    'aria-valuetext': fmtVal(curVal) + (cfg.unit ? ' ' + cfg.unit : '')
  }, trackSvg, h('span', { class: 'bt-drum-hairline', 'aria-hidden': 'true' }));

  const root = h('div', { class: 'bt-drum' + (isLocked ? ' is-locked' : '') },
    h('div', { class: 'bt-drum-head' },
      h('span', { class: 'bt-drum-lbl', text: cfg.label || '' }),
      lockBtn
    ),
    h('div', { class: 'bt-drum-mid' },
      h('button', {
        type: 'button',
        class: 'bt-drum-nudge',
        'aria-label': 'Decrease ' + (cfg.label || 'value'),
        onclick: function() {
          setValue(_quantize(curVal - step, step, min, max), false);
          _hapticTick();
        }
      }, '−'),
      readoutBtn,
      h('button', {
        type: 'button',
        class: 'bt-drum-nudge',
        'aria-label': 'Increase ' + (cfg.label || 'value'),
        onclick: function() {
          setValue(_quantize(curVal + step, step, min, max), false);
          _hapticTick();
        }
      }, '+')
    ),
    track
  );

  function syncLockUi() {
    root.classList.toggle('is-locked', isLocked);
    if (lockBtn) {
      lockBtn.setAttribute('aria-pressed', String(isLocked));
      lockBtn.setAttribute('aria-label', (isLocked ? 'Unlock ' : 'Lock ') + (cfg.label || 'parameter'));
      lockBtn.textContent = '';
      lockBtn.append(
        BTIcons.el(isLocked ? 'lock-pin' : 'unlock', { size: 14 }),
        h('span', { text: isLocked ? 'Locked' : 'Lock' })
      );
    }
  }
  syncLockUi();

  function paintTrackOffset(val) {
    const stepsFromMin = (val - min) / step;
    const shift = -((stepsFromMin % 5) * 12);
    ticksGroup.setAttribute('transform', 'translate(' + shift.toFixed(1) + ' 0)');
  }
  paintTrackOffset(curVal);

  function setValue(nextVal, silent) {
    const q = _quantize(nextVal, step, min, max);
    const changedVal = q !== curVal;
    curVal = q;
    valNode.textContent = fmtVal(curVal);
    readoutBtn.setAttribute('aria-label', (cfg.label || 'Value') + ': ' + fmtVal(curVal) + (cfg.unit ? ' ' + cfg.unit : '') + '. Tap for precision keypad.');
    track.setAttribute('aria-valuenow', String(curVal));
    track.setAttribute('aria-valuetext', fmtVal(curVal) + (cfg.unit ? ' ' + cfg.unit : ''));
    paintTrackOffset(curVal);
    if (changedVal && !silent && typeof cfg.onChange === 'function') {
      cfg.onChange(curVal);
    }
    return curVal;
  }

  /* Directional Pointer Lock + Inertial Momentum Decay */
  let pActive = false;
  let lockedHorizontal = false;
  let startX = 0;
  let startY = 0;
  let startVal = curVal;
  let samples = [];

  track.addEventListener('pointerdown', function(e) {
    if (e.button && e.button !== 0) return;
    cancelAnimationFrame(rafId);
    pActive = true;
    lockedHorizontal = false;
    startX = e.clientX;
    startY = e.clientY;
    startVal = curVal;
    samples = [{ x: e.clientX, t: performance.now() }];
  });

  track.addEventListener('pointermove', function(e) {
    if (!pActive) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (!lockedHorizontal) {
      if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) {
        pActive = false;
        return;
      }
      if (Math.abs(dx) > 6 && Math.abs(dx) >= Math.abs(dy)) {
        lockedHorizontal = true;
        root.classList.add('is-dragging');
        try { track.setPointerCapture(e.pointerId); } catch (err) {}
      } else {
        return;
      }
    }
    const now = performance.now();
    samples.push({ x: e.clientX, t: now });
    while (samples.length > 6 && now - samples[0].t > 70) samples.shift();

    /* Dragging right increases value naturally (or wheel-pull intuitive delta) */
    const rawNext = startVal + (dx / pxPerStep) * step;
    const prev = curVal;
    setValue(rawNext, false);
    if (curVal !== prev) _hapticTick();
  });

  function endPointer() {
    if (!pActive) return;
    const wasHoriz = lockedHorizontal;
    pActive = false;
    lockedHorizontal = false;
    root.classList.remove('is-dragging');

    if (wasHoriz && samples.length >= 2 && !_prefersReducedMotion()) {
      const first = samples[0];
      const last = samples[samples.length - 1];
      const dt = Math.max(1, last.t - first.t);
      let vx = (last.x - first.x) / dt; /* px/ms */
      if (Math.abs(vx) > 0.28) {
        let floatVal = curVal;
        let lastFrame = performance.now();
        const t0 = lastFrame;
        function coast(now) {
          const frameDt = Math.min(32, now - lastFrame);
          lastFrame = now;
          const vNow = vx * Math.exp(-(now - t0) / 180);
          if (Math.abs(vNow) < 0.03) {
            if (typeof cfg.onCommit === 'function') cfg.onCommit(curVal);
            return;
          }
          floatVal = _clamp(floatVal + ((vNow * frameDt) / pxPerStep) * step, min, max);
          const prev = curVal;
          setValue(floatVal, false);
          if (curVal !== prev) _hapticTick();
          rafId = requestAnimationFrame(coast);
        }
        rafId = requestAnimationFrame(coast);
        return;
      }
    }
    if (wasHoriz && typeof cfg.onCommit === 'function') cfg.onCommit(curVal);
  }

  track.addEventListener('pointerup', endPointer);
  track.addEventListener('pointercancel', endPointer);

  track.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      setValue(curVal + step, false);
      _hapticTick();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      setValue(curVal - step, false);
      _hapticTick();
    }
  });

  root.setValue = setValue;
  root.getValue = function() { return curVal; };
  root.setLocked = function(b) { isLocked = !!b; syncLockUi(); };
  root.isLocked = function() { return isLocked; };
  return root;
}

/* ==================== 3. BTLinkedDrumTrio (Dose <-> Water <-> Ratio) ==================== */
function BTLinkedDrumTrio(cfg) {
  cfg = cfg || {};
  const isEsp = !!(cfg.isEspresso || cfg.methodKey === 'espresso' || cfg.methodKey === 'lever_espresso');
  let dose = isFinite(+cfg.dose) && +cfg.dose > 0 ? +cfg.dose : (isEsp ? 18.0 : 15.0);
  let water = isFinite(+cfg.water) && +cfg.water > 0 ? +cfg.water : (isEsp ? 36.0 : 250);
  let ratio = isFinite(+cfg.ratio) && +cfg.ratio > 0 ? +cfg.ratio : +(water / Math.max(1, dose)).toFixed(1);
  let anchor = cfg.lockedKey === 'dose' || cfg.lockedKey === 'water' || cfg.lockedKey === 'ratio' ? cfg.lockedKey : 'ratio';
  let prewet = cfg.prewet !== false;

  const doseRange = isEsp ? { min: 7, max: 26, step: 0.1 } : { min: 6, max: 95, step: 0.1 };
  const waterRange = isEsp ? { min: 14, max: 120, step: 0.5 } : { min: 80, max: 1500, step: 1 };
  const ratioRange = isEsp ? { min: 1.0, max: 5.0, step: 0.1 } : { min: 8.0, max: 22.0, step: 0.1 };

  const presets = Array.isArray(cfg.presets) ? cfg.presets : (
    isEsp
      ? [
          { label: 'Ristretto 1:1.5', dose: 18, water: 27, ratio: 1.5 },
          { label: 'Classic 1:2',     dose: 18, water: 36, ratio: 2.0 },
          { label: 'Turbo 1:2.7',     dose: 18, water: 49, ratio: 2.7 }
        ]
      : [
          { label: '1 Cup · 250g',   dose: 15,   water: 250, ratio: 16.7 },
          { label: 'Mug · 300g',     dose: 18,   water: 300, ratio: 16.7 },
          { label: '2 Cups · 500g',  dose: 30,   water: 500, ratio: 16.7 }
        ]
  );

  let doseDrum = null;
  let waterDrum = null;
  let ratioDrum = null;
  const footerText = h('span', { class: 'mono' });

  function updateFooter() {
    if (isEsp) {
      footerText.textContent = 'Beverage Yield: ' + water.toFixed(1) + ' g  ·  Strength Ratio 1:' + ratio.toFixed(1);
    } else {
      const retention = 2.1;
      const inMug = Math.max(0, Math.round(water - dose * retention));
      const kettleFill = Math.round(water + (prewet ? 80 : 30));
      footerText.textContent = 'In Mug: ~' + inMug + ' g (' + (inMug / 29.5735).toFixed(1) + ' fl oz)  ·  Kettle Fill: ' + kettleFill + ' g';
    }
  }

  function syncLocks() {
    if (doseDrum) doseDrum.setLocked(anchor === 'dose');
    if (waterDrum) waterDrum.setLocked(anchor === 'water');
    if (ratioDrum) ratioDrum.setLocked(anchor === 'ratio');
  }

  function emitChange() {
    updateFooter();
    if (typeof cfg.onChange === 'function') {
      cfg.onChange({ dose: dose, water: water, ratio: ratio, lockedKey: anchor, prewet: prewet });
    }
  }

  doseDrum = BTDrumWheel({
    label: 'Dose',
    value: dose,
    min: doseRange.min,
    max: doseRange.max,
    step: doseRange.step,
    decimals: 1,
    unit: 'g',
    units: ['g', 'oz', 'tbsp'],
    locked: anchor === 'dose',
    showLock: true,
    onToggleLock: function() { anchor = 'dose'; syncLocks(); emitChange(); },
    onChange: function(nextDose) {
      dose = nextDose;
      if (anchor === 'water') {
        ratio = _quantize(water / Math.max(0.5, dose), ratioRange.step, ratioRange.min, ratioRange.max);
        ratioDrum.setValue(ratio, true);
      } else {
        water = _quantize(dose * ratio, waterRange.step, waterRange.min, waterRange.max);
        waterDrum.setValue(water, true);
      }
      emitChange();
    }
  });

  waterDrum = BTDrumWheel({
    label: isEsp ? 'Shot Yield' : 'Brew Water',
    value: water,
    min: waterRange.min,
    max: waterRange.max,
    step: waterRange.step,
    decimals: isEsp ? 1 : 0,
    unit: 'g',
    units: ['g', 'mL', 'fl oz', 'cups'],
    locked: anchor === 'water',
    showLock: true,
    onToggleLock: function() { anchor = 'water'; syncLocks(); emitChange(); },
    onChange: function(nextWater) {
      water = nextWater;
      if (anchor === 'dose') {
        ratio = _quantize(water / Math.max(0.5, dose), ratioRange.step, ratioRange.min, ratioRange.max);
        ratioDrum.setValue(ratio, true);
      } else {
        dose = _quantize(water / Math.max(0.5, ratio), doseRange.step, doseRange.min, doseRange.max);
        doseDrum.setValue(dose, true);
      }
      emitChange();
    }
  });

  ratioDrum = BTDrumWheel({
    label: 'Ratio',
    value: ratio,
    min: ratioRange.min,
    max: ratioRange.max,
    step: ratioRange.step,
    decimals: 1,
    format: function(v) { return '1:' + v.toFixed(1); },
    locked: anchor === 'ratio',
    showLock: true,
    onToggleLock: function() { anchor = 'ratio'; syncLocks(); emitChange(); },
    onChange: function(nextRatio) {
      ratio = nextRatio;
      if (anchor === 'water') {
        dose = _quantize(water / Math.max(0.5, ratio), doseRange.step, doseRange.min, doseRange.max);
        doseDrum.setValue(dose, true);
      } else {
        water = _quantize(dose * ratio, waterRange.step, waterRange.min, waterRange.max);
        waterDrum.setValue(water, true);
      }
      emitChange();
    }
  });

  const presetBar = h('div', { class: 'bt-drum-presets', role: 'group', 'aria-label': 'Quick serving presets' },
    presets.map(function(p) {
      return h('button', {
        type: 'button',
        class: 'bt-chip',
        text: p.label,
        onclick: function() {
          dose = p.dose;
          water = p.water;
          ratio = p.ratio;
          doseDrum.setValue(dose, true);
          waterDrum.setValue(water, true);
          ratioDrum.setValue(ratio, true);
          _hapticSnap();
          emitChange();
        }
      });
    })
  );

  const prewetBtn = !isEsp ? h('button', {
    type: 'button',
    class: 'bt-chip',
    'aria-pressed': String(prewet),
    onclick: function() {
      prewet = !prewet;
      prewetBtn.setAttribute('aria-pressed', String(prewet));
      _hapticTick();
      emitChange();
    }
  }, BTIcons.el('water-drop', { size: 14 }), h('span', { text: 'Rinse paper' })) : null;

  updateFooter();

  const trioExplainer = BTExplainerPill({
    title: 'Dose, Water & Ratio Drums',
    what: 'Couples coffee weight, water weight, and brew strength so scaling from 1 cup to a carafe never breaks flavor balance.',
    how: 'Swipe any tick-wheel left/right (or tap any number for the 56pt keypad). Tap Lock on whichever value you want anchored.',
    tip: 'With a Bluetooth scale connected, weigh whatever beans land in your cup, lock Dose, and Brew Water re-scales automatically.'
  });

  let activeMobileKey = cfg.activeKey || 'dose';
  const summaryTiles = [
    { key: 'dose',  lbl: 'Dose',  valNode: h('b', { class: 'mono' }) },
    { key: 'water', lbl: isEsp ? 'Yield' : 'Water', valNode: h('b', { class: 'mono' }) },
    { key: 'ratio', lbl: 'Ratio', valNode: h('b', { class: 'mono' }) }
  ];

  function syncSummaryTiles() {
    summaryTiles[0].valNode.textContent = dose.toFixed(1) + 'g';
    summaryTiles[1].valNode.textContent = (isEsp ? water.toFixed(1) : Math.round(water)) + 'g';
    summaryTiles[2].valNode.textContent = '1:' + ratio.toFixed(1);
    if (cfg.compact) {
      doseDrum.hidden = activeMobileKey !== 'dose';
      waterDrum.hidden = activeMobileKey !== 'water';
      ratioDrum.hidden = activeMobileKey !== 'ratio';
    }
  }

  const origEmitChange = emitChange;
  emitChange = function() {
    syncSummaryTiles();
    origEmitChange();
  };

  const compactTabs = cfg.compact ? h('div', { class: 'bt-drum-compact-tabs', role: 'tablist', 'aria-label': 'Select brew parameter to tune' },
    summaryTiles.map(function(t) {
      const btn = h('button', {
        type: 'button',
        class: 'bt-drum-tab-btn' + (t.key === activeMobileKey ? ' is-active' : ''),
        'aria-selected': String(t.key === activeMobileKey),
        onclick: function() {
          activeMobileKey = t.key;
          const allBtns = compactTabs.querySelectorAll('.bt-drum-tab-btn');
          for (let k = 0; k < allBtns.length; k++) {
            const on = summaryTiles[k].key === activeMobileKey;
            allBtns[k].classList.toggle('is-active', on);
            allBtns[k].setAttribute('aria-selected', String(on));
          }
          syncSummaryTiles();
          _hapticTick();
        }
      }, h('span', { class: 'bt-drum-lbl', text: t.lbl }), t.valNode);
      return btn;
    })
  ) : null;

  syncSummaryTiles();

  const container = h('div', { class: 'bt-drum-trio' + (cfg.compact ? ' is-compact' : '') },
    h('div', { class: 'bt-control-topbar' }, presetBar, trioExplainer.btn),
    trioExplainer.panel,
    compactTabs,
    h('div', { class: 'bt-drum-grid' }, doseDrum, waterDrum, ratioDrum),
    h('div', { class: 'bt-drum-footer' }, footerText, prewetBtn)
  );

  container.setValues = function(next) {
    if (!next) return;
    if (isFinite(+next.dose) && +next.dose > 0) { dose = +next.dose; doseDrum.setValue(dose, true); }
    if (isFinite(+next.water) && +next.water > 0) { water = +next.water; waterDrum.setValue(water, true); }
    if (isFinite(+next.ratio) && +next.ratio > 0) { ratio = +next.ratio; ratioDrum.setValue(ratio, true); }
    syncSummaryTiles();
    updateFooter();
  };
  return container;
}

/* ==================== 4. BTRoastArc (240 deg Roast Dial + Agtron X-Ray) ==================== */
const ROAST_STOPS_6 = [
  { key: 'ultra-light',  label: 'Very-Light',   agtron: 92, color: '#C88A4B', swatchBg: '#DFB07C', ink: '#1F1712', cue: 'Delicate floral tea & citrus · Loves boiling water' },
  { key: 'light',        label: 'Light',        agtron: 79, color: '#AD6D34', swatchBg: '#CB925A', ink: '#1F1712', cue: 'Crisp fruit & honey · High terroir clarity' },
  { key: 'medium-light', label: 'Medium-Light', agtron: 68, color: '#8B5022', swatchBg: '#B57842', ink: '#1F1712', cue: 'Ripe stone fruit & milk chocolate · Balanced' },
  { key: 'medium',       label: 'Medium',       agtron: 57, color: '#693917', swatchBg: '#6E3D1B', ink: '#FFFDF9', cue: 'Caramel, toasted almond & syrupy body' },
  { key: 'medium-dark',  label: 'Medium-Dark',  agtron: 46, color: '#47250F', swatchBg: '#4A2610', ink: '#FFFDF9', cue: 'Rich dark cocoa & warm spice · Gentler heat' },
  { key: 'dark',         label: 'Dark',         agtron: 34, color: '#2B1609', swatchBg: '#2B1609', ink: '#FFFDF9', cue: 'Bold smoky bittersweet · Short, cool brew' }
];

function _roastSwatchInk(roastOrAgtron) {
  if (typeof roastOrAgtron === 'number' && isFinite(roastOrAgtron)) {
    return roastOrAgtron >= 63 ? '#1F1712' : '#FFFDF9';
  }
  const s = String(roastOrAgtron || '').trim().toLowerCase();
  if (s === 'ultra-light' || s === 'very-light' || s === 'very_light' || s === 'light' || s === 'medium-light' || s === 'med-light' || s === 'omni') {
    return '#1F1712';
  }
  return '#FFFDF9';
}

function _agtronToColor(g) {
  const u = _clamp((96 - g) / (96 - 30), 0, 1);
  const stops = [
    [0.00, [200, 138, 75]],
    [0.24, [173, 109, 52]],
    [0.45, [139, 80, 34]],
    [0.66, [105, 57, 23]],
    [0.84, [71, 37, 15]],
    [1.00, [43, 22, 9]]
  ];
  for (let i = 0; i < stops.length - 1; i++) {
    if (u <= stops[i + 1][0]) {
      const t = (u - stops[i][0]) / (stops[i + 1][0] - stops[i][0]);
      const a = stops[i][1], b = stops[i + 1][1];
      const r = Math.round(a[0] + (b[0] - a[0]) * t);
      const gr = Math.round(a[1] + (b[1] - a[1]) * t);
      const bl = Math.round(a[2] + (b[2] - a[2]) * t);
      return 'rgb(' + r + ',' + gr + ',' + bl + ')';
    }
  }
  return '#2B1609';
}

function _convertAgtronScale(gourmetVal, scaleKey) {
  if (typeof window !== 'undefined' && window.BTCoreV6 && window.BTCoreV6.AGTRON && typeof window.BTCoreV6.AGTRON.fromGourmet === 'function') {
    try { return window.BTCoreV6.AGTRON.fromGourmet(gourmetVal, scaleKey); } catch (e) {}
  }
  const g = _clamp(+gourmetVal || 68, 20, 110);
  if (scaleKey === 'commercial') return +(0.7429 * (g + 1.528)).toFixed(1);
  if (scaleKey === 'tonino') {
    /* Monotone C1 curve pinned strictly to T(63.0) = 105.0 */
    return +(105.0 + (g - 63.0) * 1.48).toFixed(1);
  }
  return +g.toFixed(1); /* gourmet, omni, cm100 */
}

function _nearestRoastStop(gourmetVal) {
  let best = ROAST_STOPS_6[2];
  let bestDist = Infinity;
  for (let i = 0; i < ROAST_STOPS_6.length; i++) {
    const d = Math.abs(ROAST_STOPS_6[i].agtron - gourmetVal);
    if (d < bestDist) { bestDist = d; best = ROAST_STOPS_6[i]; }
  }
  return best;
}

function BTRoastArc(cfg) {
  cfg = cfg || {};
  const uid = _tUid('bt_ra');
  const normKey = String(cfg.roastKey || cfg.roast || '').toLowerCase() === 'very-light' ? 'ultra-light' : (cfg.roastKey || cfg.roast);
  const initStop = ROAST_STOPS_6.find(function(s) { return s.key === normKey; }) || ROAST_STOPS_6[2];
  let beanG = isFinite(+cfg.beanAgtron) && +cfg.beanAgtron > 0 ? _clamp(+cfg.beanAgtron, 25, 105)
    : (isFinite(+cfg.agtron) && +cfg.agtron > 0 ? _clamp(+cfg.agtron, 25, 105) : initStop.agtron);
  const expDelta = _clamp(0.18 * beanG - 3.2, 1.0, 12.5);
  let groundG = isFinite(+cfg.groundAgtron) && +cfg.groundAgtron > 0 ? _clamp(+cfg.groundAgtron, 25, 110) : +(beanG + expDelta).toFixed(1);
  let scaleKey = cfg.scale || 'gourmet';
  let comparatorOn = false;

  const cx = 140, cy = 134, rOuter = 98;
  const startDeg = -210, spanDeg = 240; /* -210 deg (left-bottom) -> +30 deg (right-bottom) */

  function polar(rad, deg) {
    const a = (deg * Math.PI) / 180;
    return [+(cx + rad * Math.cos(a)).toFixed(2), +(cy + rad * Math.sin(a)).toFixed(2)];
  }

  function arcPath(rad, d0, d1) {
    const p0 = polar(rad, d0);
    const p1 = polar(rad, d1);
    const large = Math.abs(d1 - d0) > 180 ? 1 : 0;
    return 'M ' + p0[0] + ' ' + p0[1] + ' A ' + rad + ' ' + rad + ' 0 ' + large + ' 1 ' + p1[0] + ' ' + p1[1];
  }

  /* 6 Colored Arc Segments along the 240-deg track */
  const segPaths = ROAST_STOPS_6.map(function(s, idx) {
    const a0 = startDeg + (idx / 6) * spanDeg + 1.5;
    const a1 = startDeg + ((idx + 1) / 6) * spanDeg - 1.5;
    return h('path', {
      d: arcPath(rOuter, a0, a1),
      fill: 'none',
      stroke: s.color,
      'stroke-width': 18,
      'stroke-linecap': 'round'
    });
  });

  const beanOuterDisc = h('circle', { cx: cx, cy: cy, r: 50, fill: _agtronToColor(beanG), stroke: 'var(--line-strong)', 'stroke-width': 2 });
  const beanInnerCore = h('circle', { cx: cx, cy: cy, r: 30, fill: _agtronToColor(groundG), stroke: 'rgba(255,253,249,0.35)', 'stroke-width': 1.5 });
  const beanCrease = h('path', {
    d: 'M ' + cx + ' ' + (cy - 34) + ' C ' + (cx - 14) + ' ' + (cy - 10) + ' ' + (cx + 14) + ' ' + (cy + 10) + ' ' + cx + ' ' + (cy + 34),
    fill: 'none',
    stroke: '#F5D6B0',
    'stroke-width': 3.2,
    'stroke-linecap': 'round'
  });
  const oilDrops = h('g', { opacity: '0' },
    h('circle', { cx: cx + 22, cy: cy - 16, r: 2.6, fill: '#FFFDF9', opacity: '0.55' }),
    h('circle', { cx: cx + 28, cy: cy + 8, r: 1.9, fill: '#FFFDF9', opacity: '0.48' })
  );

  const thumbGroup = h('g', { class: 'bt-roast-thumb' },
    h('circle', { r: 14, fill: 'var(--surface)', stroke: 'var(--accent)', 'stroke-width': 3.5 }),
    h('circle', { r: 4.5, fill: 'var(--accent)' })
  );

  const titleTxt = h('div', { class: 'bt-serif bt-roast-title', style: 'font-size:1.2rem;font-weight:700;text-align:center' });
  const subCueTxt = h('div', { class: 'bt-roast-cue', style: 'font-size:0.82rem;text-align:center' });
  const xrayTelemetry = h('div', { class: 'bt-hybrid-up mono', style: 'font-size:0.78rem;text-align:center;padding:6px 10px;border-radius:var(--r-sm);background:var(--science-bg);color:var(--science)' });
  let swatchButtons = [];

  const svgEl = h('svg', {
    class: 'bt-roast-svg',
    viewBox: '0 0 280 232',
    role: 'slider',
    tabindex: '0',
    'aria-label': 'Roast level and Agtron color wheel',
    'aria-valuemin': 25,
    'aria-valuemax': 105
  },
    h('defs', { id: uid + '_defs' }),
    segPaths,
    beanOuterDisc,
    beanInnerCore,
    beanCrease,
    oilDrops,
    thumbGroup
  );

  function isXrayActive() {
    return cfg.scienceLens === true || BTScienceLens.mode() !== 'surface';
  }

  function paint() {
    const stop = _nearestRoastStop(beanG);
    const u = _clamp((98 - beanG) / (98 - 30), 0, 1);
    const deg = startDeg + u * spanDeg;
    const pt = polar(rOuter, deg);
    thumbGroup.setAttribute('transform', 'translate(' + pt[0] + ' ' + pt[1] + ')');

    beanOuterDisc.setAttribute('fill', _agtronToColor(beanG));
    beanInnerCore.setAttribute('fill', _agtronToColor(groundG));
    beanInnerCore.setAttribute('opacity', isXrayActive() ? '1' : '0.35');
    beanCrease.setAttribute('stroke', beanG > 65 ? '#EAD0AE' : '#F5DFC2');
    oilDrops.setAttribute('opacity', beanG < 45 ? '1' : '0');

    titleTxt.textContent = stop.label;
    subCueTxt.textContent = stop.cue;

    for (let i = 0; i < swatchButtons.length; i++) {
      const on = ROAST_STOPS_6[i].key === stop.key;
      swatchButtons[i].setAttribute('aria-pressed', String(on));
      swatchButtons[i].classList.toggle('is-active', on);
    }

    const delta = +(groundG - beanG).toFixed(1);
    const scaledBean = _convertAgtronScale(beanG, scaleKey);
    const scaledGround = _convertAgtronScale(groundG, scaleKey);
    const scorched = delta >= 12 ? ' · High Surface-Core Gradient (-1.5°C late pulse)' : '';
    xrayTelemetry.textContent = scaleKey.toUpperCase() + ' Bean ' + scaledBean + ' / Ground ' + scaledGround + ' · Roast Delta ' + (delta >= 0 ? '+' : '') + delta + scorched;

    svgEl.setAttribute('aria-valuenow', String(Math.round(beanG)));
    svgEl.setAttribute('aria-valuetext', stop.label + ', Agtron ' + beanG.toFixed(1));
  }

  function hitRingOrCore(e) {
    const rect = svgEl.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 280;
    const y = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 232;
    const dist = Math.hypot(x - cx, y - cy);
    return (dist >= 54 && dist <= 126) || (isXrayActive() && dist < 44);
  }

  function updateFromPointer(e) {
    const rect = svgEl.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 280;
    const y = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 232;
    const dx = x - cx, dy = y - cy;
    const dist = Math.hypot(dx, dy);

    /* Dragging inner core in X-Ray adjusts Ground Agtron (Roast Delta) */
    if (isXrayActive() && dist < 44) {
      let ang = (Math.atan2(dy, dx) * 180) / Math.PI;
      if (ang > 90) ang -= 360;
      const uCore = _clamp((ang - startDeg) / spanDeg, 0, 1);
      groundG = _quantize(98 - uCore * 68, 0.5, 25, 108);
      _hapticTick();
      paint();
      emit();
      return;
    }

    let deg = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (deg > 90) deg -= 360;
    const u = _clamp((deg - startDeg) / spanDeg, 0, 1);
    const rawG = 98 - u * 68;
    const prevStop = _nearestRoastStop(beanG).key;

    if (isXrayActive()) {
      beanG = _quantize(rawG, 0.5, 25, 105);
    } else {
      const snapped = _nearestRoastStop(rawG);
      beanG = snapped.agtron;
    }
    const curDelta = _clamp(0.18 * beanG - 3.2, 1.0, 12.5);
    if (!isXrayActive()) groundG = +(beanG + curDelta).toFixed(1);

    if (_nearestRoastStop(beanG).key !== prevStop || isXrayActive()) _hapticTick();
    paint();
    emit();
  }

  function emit() {
    const stop = _nearestRoastStop(beanG);
    if (typeof cfg.onChange === 'function') {
      cfg.onChange({
        roastKey: stop.key,
        roast: stop.key,
        beanAgtron: beanG,
        groundAgtron: groundG,
        roastDelta: +(groundG - beanG).toFixed(1),
        scale: scaleKey
      });
    }
  }

  let dragging = false;
  svgEl.addEventListener('pointerdown', function(e) {
    if (!hitRingOrCore(e)) return;
    dragging = true;
    try { svgEl.setPointerCapture(e.pointerId); } catch (err) {}
    updateFromPointer(e);
  });
  svgEl.addEventListener('pointermove', function(e) {
    if (dragging) updateFromPointer(e);
  });
  ['pointerup', 'pointercancel'].forEach(function(ev) {
    svgEl.addEventListener(ev, function() { dragging = false; });
  });

  svgEl.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      beanG = _clamp(beanG - (isXrayActive() ? 1 : 11), 25, 105);
      _hapticTick(); paint(); emit();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      beanG = _clamp(beanG + (isXrayActive() ? 1 : 11), 25, 105);
      _hapticTick(); paint(); emit();
    }
  });

  swatchButtons = ROAST_STOPS_6.map(function(s) {
    return h('button', {
      type: 'button',
      class: 'bt-roast-swatch',
      'data-roast': s.key,
      'aria-pressed': 'false',
      style: {
        backgroundColor: s.swatchBg,
        color: s.ink
      },
      onclick: function() {
        beanG = s.agtron;
        groundG = +(beanG + _clamp(0.18 * beanG - 3.2, 1.0, 12.5)).toFixed(1);
        _hapticSnap();
        paint();
        emit();
      }
    }, s.label);
  });

  const lingoRow = h('div', { class: 'bt-roast-lingo', role: 'group', 'aria-label': 'Roast quick stops' }, swatchButtons);

  const scaleRow = h('div', { class: 'bt-roast-scales bt-xray-only', role: 'group', 'aria-label': 'Agtron color scale' },
    ['gourmet', 'commercial', 'omni', 'tonino', 'cm100'].map(function(sk) {
      return h('button', {
        type: 'button',
        class: 'bt-chip',
        'aria-pressed': String(sk === scaleKey),
        text: sk === 'cm100' ? 'CM-100' : sk.charAt(0).toUpperCase() + sk.slice(1),
        onclick: function() {
          scaleKey = sk;
          const btns = scaleRow.querySelectorAll('button');
          for (let i = 0; i < btns.length; i++) btns[i].setAttribute('aria-pressed', String(i === ['gourmet', 'commercial', 'omni', 'tonino', 'cm100'].indexOf(sk)));
          _hapticTick();
          paint();
          emit();
        }
      });
    })
  );

  const compBtn = h('button', {
    type: 'button',
    class: 'bt-chip',
    'aria-pressed': 'false',
    onclick: function() {
      comparatorOn = !comparatorOn;
      compBtn.setAttribute('aria-pressed', String(comparatorOn));
      wrap.classList.toggle('is-comparator', comparatorOn);
      _hapticTick();
    }
  }, BTIcons.el('scan-lens', { size: 15 }), h('span', { text: 'Neutral Gray Bean Comparator' }));

  paint();

  const roastExplainer = BTExplainerPill({
    title: '240° Roast & Agtron Color Wheel',
    what: 'Sets your bean roast level so BeanTelligence tunes water temperature, bloom degassing time, and extraction solubility.',
    how: 'Spin the color arc or tap a roast chip below. Tap Neutral Gray Comparator to hold real beans next to your screen.',
    tip: 'Switch Science Lens to Lab X-Ray (or scan with DiFluid Omni) to scrub continuous Agtron and Whole-vs-Ground Roast Delta.'
  });

  const wrap = h('div', { class: 'bt-roast-arc' },
    h('div', { class: 'bt-control-topbar' }, h('span', { class: 'bt-drum-lbl', text: 'Roast & Color' }), roastExplainer.btn),
    roastExplainer.panel,
    h('div', { class: 'bt-roast-stage' }, svgEl),
    titleTxt,
    subCueTxt,
    xrayTelemetry,
    lingoRow,
    scaleRow,
    compBtn
  );
  return wrap;
}

/* ==================== 5. BTGrinderDial (48-Grinder Burr Collar) ==================== */
function _resolveGrinderList() {
  if (typeof window !== 'undefined' && window.BTCoreV6 && Array.isArray(window.BTCoreV6.GRINDERS_48)) {
    return window.BTCoreV6.GRINDERS_48;
  }
  if (typeof GRINDERS !== 'undefined' && Array.isArray(GRINDERS)) {
    return GRINDERS;
  }
  return [
    { key: 'comandante-c40', short: 'Comandante C40 MK4', name: 'Comandante C40 MK4', min: 2, max: 45, unit: 'clicks' },
    { key: 'fellow-ode-gen2', short: 'Fellow Ode Gen 2', name: 'Fellow Ode Gen 2', min: 1, max: 11, unit: 'dial' },
    { key: '1zpresso-k-ultra', short: '1Zpresso K-Ultra', name: '1Zpresso K-Ultra', min: 15, max: 130, unit: 'clicks' },
    { key: 'baratza-encore-esp', short: 'Baratza Encore ESP', name: 'Baratza Encore ESP', min: 1, max: 40, unit: 'setting' },
    { key: 'niche-zero', short: 'Niche Zero', name: 'Niche Zero', min: 1, max: 70, unit: 'mark' },
    { key: 'xbloom-studio', short: 'xBloom Studio', name: 'xBloom Studio (1-80)', min: 1, max: 80, unit: 'step' }
  ];
}

function _textureLabelForUm(um) {
  if (um <= 160) return 'Extra-Fine Powder (Turkish)';
  if (um <= 310) return 'Fine Espresso Sugar';
  if (um <= 460) return 'Fine Table Salt (Moka / AeroPress)';
  if (um <= 640) return 'Medium-Fine Sea Salt (Cone Pour-Over)';
  if (um <= 800) return 'Medium Sand (Flat-Bottom / Chemex)';
  return 'Coarse Kosher Salt (French Press / Cold)';
}

function _formatGrinderReadout(grinder, um) {
  if (typeof window !== 'undefined' && window.BTCoreV6 && window.BTCoreV6.psd && typeof window.BTCoreV6.psd.mapMicronsToGrinder === 'function') {
    try {
      const mapped = window.BTCoreV6.psd.mapMicronsToGrinder(um, grinder ? grinder.key : '');
      if (mapped && mapped.label) return mapped.label;
    } catch (e) {}
  }
  if (!grinder) return Math.round(um) + ' µm target';
  if (grinder.kind === 'preground') return grinder.short || 'Pre-Ground';
  const lo = typeof grinder.min === 'number' ? grinder.min : 1;
  const hi = typeof grinder.max === 'number' ? grinder.max : 40;
  const frac = _clamp((um - 180) / (1100 - 180), 0, 1);
  const raw = lo + frac * (hi - lo);
  if (grinder.key && grinder.key.indexOf('fellow-ode') === 0) {
    const dial = 1 + Math.round(frac * 30) / 3;
    const whole = Math.floor(dial);
    const sub = Math.round((dial - whole) * 3);
    return 'Dial ' + (sub === 0 ? whole + '.0' : whole + '.' + sub);
  }
  return Math.round(raw) + ' ' + (grinder.unit || 'clicks');
}

function BTGrinderDial(cfg) {
  cfg = cfg || {};
  const list = _resolveGrinderList();
  let grinderKey = cfg.grinderKey || (app && app.brew && app.brew.grinderKey) || (app && app.prefs && app.prefs.gear && app.prefs.gear.grinderKey) || 'comandante-c40';
  let um = isFinite(+cfg.um) && +cfg.um > 0 ? _clamp(+cfg.um, 80, 1300) : 550;
  const stepUm = isFinite(+cfg.stepUm) && +cfg.stepUm > 0 ? +cfg.stepUm : 25;
  let rpm = isFinite(+cfg.rpm) ? +cfg.rpm : 80;

  function activeGrinder() {
    return list.find(function(g) { return g.key === grinderKey; }) || list[0];
  }

  const ringGroup = h('g');
  for (let i = 0; i < 24; i++) {
    const a = (i * 15 * Math.PI) / 180;
    const r0 = i % 3 === 0 ? 35 : 39;
    const r1 = 46;
    ringGroup.appendChild(h('line', {
      x1: +(54 + r0 * Math.cos(a)).toFixed(1),
      y1: +(54 + r0 * Math.sin(a)).toFixed(1),
      x2: +(54 + r1 * Math.cos(a)).toFixed(1),
      y2: +(54 + r1 * Math.sin(a)).toFixed(1),
      stroke: i % 3 === 0 ? 'var(--accent)' : 'var(--line-strong)',
      'stroke-width': i % 3 === 0 ? 2.2 : 1.3,
      'stroke-linecap': 'round'
    }));
  }

  const collarSvg = h('svg', {
    class: 'bt-grinder-collar',
    viewBox: '0 0 108 108',
    role: 'slider',
    tabindex: '0',
    'aria-label': 'Grinder burr collar dial',
    'aria-valuemin': 80,
    'aria-valuemax': 1300
  },
    h('circle', { cx: 54, cy: 54, r: 49, fill: 'var(--well)', stroke: 'var(--line)', 'stroke-width': 2 }),
    ringGroup,
    h('polygon', { points: '54,3 49,12 59,12', fill: 'var(--accent)' }),
    h('circle', { cx: 54, cy: 54, r: 22, fill: 'var(--surface)', stroke: 'var(--line)', 'stroke-width': 1.5 })
  );

  const nameBtn = h('button', {
    type: 'button',
    class: 'bt-chip',
    onclick: function() {
      if (typeof cfg.onOpenBench === 'function') cfg.onOpenBench();
      else BTSheet.open('bench-gear');
    }
  });
  const settingReadout = h('button', {
    type: 'button',
    class: 'bt-drum-readout',
    style: 'justify-content:flex-start;padding:4px 8px',
    onclick: function() {
      BTPrecisionKeypad.open({
        label: 'Target Grind Size (D50)',
        value: um,
        min: 80,
        max: 1300,
        step: 10,
        decimals: 0,
        unit: 'µm',
        onCommit: function(nextUm) {
          um = nextUm;
          paint();
          emit();
        }
      });
    }
  });
  const textureNode = h('div', { class: 'bt-grinder-texture' });
  const xrayNode = h('div', { class: 'bt-hybrid-up mono', style: 'font-size:0.76rem;color:var(--science)' });

  function paint() {
    const g = activeGrinder();
    const rot = ((um - 550) / 25) * 9;
    ringGroup.setAttribute('transform', 'rotate(' + rot.toFixed(1) + ' 54 54)');

    nameBtn.textContent = '';
    nameBtn.append(BTIcons.el('grinder-burr', { size: 15 }), h('span', { text: g ? (g.short || g.name) : 'Select Grinder' }));

    const label = _formatGrinderReadout(g, um) + (grinderKey === 'xbloom-studio' ? (' · ' + rpm + ' RPM') : '');
    settingReadout.textContent = label;
    textureNode.textContent = _textureLabelForUm(um);

    const finesPct = Math.round(_clamp(18 - (um - 200) * 0.011, 7, 22) * 10) / 10;
    xrayNode.textContent = 'Target D50 = ' + Math.round(um) + ' µm · Est. <200µm Fines ~' + finesPct + '%';

    collarSvg.setAttribute('aria-valuenow', String(Math.round(um)));
    collarSvg.setAttribute('aria-valuetext', label + ', ' + Math.round(um) + ' microns');
  }

  function emit() {
    const g = activeGrinder();
    if (typeof cfg.onChange === 'function') {
      cfg.onChange({
        grinderKey: grinderKey,
        um: Math.round(um),
        setting: _formatGrinderReadout(g, um),
        rpm: rpm
      });
    }
  }

  let dragStartAngle = 0;
  let dragStartUm = um;
  let dragging = false;

  collarSvg.addEventListener('pointerdown', function(e) {
    dragging = true;
    const r = collarSvg.getBoundingClientRect();
    dragStartAngle = Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2));
    dragStartUm = um;
    try { collarSvg.setPointerCapture(e.pointerId); } catch (err) {}
  });
  collarSvg.addEventListener('pointermove', function(e) {
    if (!dragging) return;
    const r = collarSvg.getBoundingClientRect();
    const ang = Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2));
    let delta = ang - dragStartAngle;
    if (delta > Math.PI) delta -= 2 * Math.PI;
    if (delta < -Math.PI) delta += 2 * Math.PI;
    const next = _quantize(dragStartUm + (delta * 180 / Math.PI) * 3.5, stepUm, 80, 1300);
    if (next !== um) {
      um = next;
      _hapticTick();
      paint();
      emit();
    }
  });
  ['pointerup', 'pointercancel'].forEach(function(ev) {
    collarSvg.addEventListener(ev, function() { dragging = false; });
  });

  collarSvg.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      um = _quantize(um + stepUm, stepUm, 80, 1300);
      _hapticTick(); paint(); emit();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      um = _quantize(um - stepUm, stepUm, 80, 1300);
      _hapticTick(); paint(); emit();
    }
  });

  paint();

  const grinderExplainer = BTExplainerPill({
    title: 'Calibrated Grinder Burr Collar',
    what: 'Translates target particle size (µm) into exact clicks, turns, or dial numbers on your own grinder.',
    how: 'Rotate the burr ring or tap − / + to step finer or coarser. Tap your grinder name to switch models or calibrate.',
    tip: 'Pair a DiFluid Omni scan or PocketMicronLens camera check to calibrate your exact D10 / D50 / D90 micron curve.'
  });

  const root = h('div', { class: 'bt-grinder-dial' },
    h('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap' },
      nameBtn,
      h('div', { style: 'display:flex;gap:6px;align-items:center;flex-wrap:wrap' },
        grinderExplainer.btn,
        h('button', {
          type: 'button',
          class: 'bt-drum-nudge',
          'aria-label': 'Grind 1 step finer',
          onclick: function() { um = _quantize(um - stepUm, stepUm, 80, 1300); _hapticTick(); paint(); emit(); }
        }, '−'),
        h('button', {
          type: 'button',
          class: 'bt-drum-nudge',
          'aria-label': 'Grind 1 step coarser',
          onclick: function() { um = _quantize(um + stepUm, stepUm, 80, 1300); _hapticTick(); paint(); emit(); }
        }, '+')
      )
    ),
    grinderExplainer.panel,
    h('div', { class: 'bt-grinder-main' },
      collarSvg,
      h('div', { class: 'bt-grinder-info' }, settingReadout, textureNode, xrayNode)
    )
  );
  root.setMicrons = function(nextUm) { um = _clamp(+nextUm || 550, 80, 1300); paint(); };
  return root;
}

/* ==================== 6. BTThermalBar (Altitude Boil Cap + Slurry Drop) ==================== */
function _boilPointAtElevM(elevM) {
  if (typeof window !== 'undefined' && window.BTCoreV6 && window.BTCoreV6.thermo && typeof window.BTCoreV6.thermo.boilingPointC === 'function') {
    try { return window.BTCoreV6.thermo.boilingPointC(elevM); } catch (e) {}
  }
  const z = _clamp(+elevM || 0, -200, 5500);
  return +(100 - 0.00335 * z).toFixed(1);
}

function BTThermalBar(cfg) {
  cfg = cfg || {};
  const minC = typeof cfg.minC === 'number' ? cfg.minC : 80;
  const maxTrackC = 100;
  const elevM = isFinite(+cfg.elevationM) ? +cfg.elevationM : (isFinite(+cfg.altitudeFt) ? (+cfg.altitudeFt * 0.3048) : 0);
  const boilCapC = _clamp(_boilPointAtElevM(elevM), minC + 2, 100);

  let unit = (cfg.unit === 'F' || (cfg.unit == null && app && app.prefs && app.prefs.tempUnit === 'F')) ? 'F' : 'C';
  let tempC = isFinite(+cfg.tempC) ? +cfg.tempC : (isFinite(+cfg.tempF) ? ((+cfg.tempF - 32) * 5 / 9) : 93);
  tempC = _clamp(tempC, minC, boilCapC);
  let preheated = cfg.preheated !== false;

  function fmtTemp(c) {
    return unit === 'F' ? (Math.round(c * 9 / 5 + 32) + ' °F') : (c.toFixed(1).replace(/\.0$/, '') + ' °C');
  }

  const readoutBtn = h('button', {
    type: 'button',
    class: 'bt-drum-readout',
    style: 'flex:0 0 auto',
    onclick: function() {
      BTPrecisionKeypad.open({
        label: 'Kettle Temperature',
        value: tempC,
        min: minC,
        max: boilCapC,
        step: 0.5,
        decimals: 1,
        unit: '°C',
        units: ['°C', '°F'],
        onCommit: function(nextC) {
          tempC = _clamp(nextC, minC, boilCapC);
          paint();
          emit();
        }
      });
    }
  });

  const unitBtn = h('button', {
    type: 'button',
    class: 'bt-chip',
    onclick: function() {
      unit = unit === 'C' ? 'F' : 'C';
      if (app && app.prefs) app.prefs.tempUnit = unit;
      _hapticTick();
      paint();
      emit();
    }
  });

  const preheatBtn = h('button', {
    type: 'button',
    class: 'bt-chip',
    'aria-pressed': String(preheated),
    onclick: function() {
      preheated = !preheated;
      preheatBtn.setAttribute('aria-pressed', String(preheated));
      _hapticTick();
      paint();
      emit();
    }
  });

  const thumb = h('span', { class: 'bt-thermal-thumb' });
  const boilMarker = h('span', { class: 'bt-thermal-boilcap', title: 'Local Boiling Cap: ' + boilCapC.toFixed(1) + ' °C' });
  const trackWrap = h('div', {
    class: 'bt-thermal-track-wrap',
    role: 'slider',
    tabindex: '0',
    'aria-label': 'Kettle water temperature',
    'aria-valuemin': minC,
    'aria-valuemax': boilCapC
  },
    h('div', { class: 'bt-thermal-gradient' }, boilMarker, thumb)
  );

  const metaLineEl = h('div', { style: 'display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;font-size:0.78rem;color:var(--ink-secondary)' });

  function paint() {
    tempC = _clamp(tempC, minC, boilCapC);
    const pct = ((tempC - minC) / (maxTrackC - minC)) * 100;
    const capPct = ((boilCapC - minC) / (maxTrackC - minC)) * 100;
    thumb.style.left = pct.toFixed(1) + '%';
    boilMarker.style.left = capPct.toFixed(1) + '%';
    boilMarker.hidden = boilCapC >= 99.8;

    readoutBtn.textContent = fmtTemp(tempC);
    unitBtn.textContent = unit === 'C' ? '°C / °F' : '°F / °C';

    preheatBtn.textContent = '';
    preheatBtn.append(
      BTIcons.el(preheated ? 'roast-flame' : 'cryo-snowflake', { size: 14 }),
      h('span', { text: preheated ? 'Preheated Brewer' : 'Cold Ceramic/Glass' })
    );

    const dropC = preheated ? 2.2 : 4.8;
    const slurryC = +(tempC - dropC).toFixed(1);
    metaLineEl.textContent = '';
    metaLineEl.append(
      h('span', { text: 'Peak Slurry: ~' + fmtTemp(slurryC) }),
      boilCapC < 99.8 ? h('span', { class: 'mono', style: 'color:var(--warn)', text: 'Boil cap ' + fmtTemp(boilCapC) + ' @ ' + Math.round(elevM) + 'm' }) : h('span', { text: 'Sea-level boil 100 °C' })
    );

    trackWrap.setAttribute('aria-valuenow', String(tempC));
    trackWrap.setAttribute('aria-valuetext', fmtTemp(tempC));
  }

  function emit() {
    if (typeof cfg.onChange === 'function') {
      cfg.onChange({
        tempC: +tempC.toFixed(1),
        tempF: Math.round(tempC * 9 / 5 + 32),
        unit: unit,
        preheated: preheated,
        boilCapC: boilCapC
      });
    }
  }

  function scrubAt(clientX) {
    const rect = trackWrap.getBoundingClientRect();
    const u = _clamp((clientX - (rect.left + 14)) / Math.max(1, rect.width - 28), 0, 1);
    const next = _quantize(minC + u * (maxTrackC - minC), 0.5, minC, boilCapC);
    if (next !== tempC) {
      tempC = next;
      _hapticTick();
      paint();
      emit();
    }
  }

  let dragging = false;
  trackWrap.addEventListener('pointerdown', function(e) {
    dragging = true;
    try { trackWrap.setPointerCapture(e.pointerId); } catch (err) {}
    scrubAt(e.clientX);
  });
  trackWrap.addEventListener('pointermove', function(e) {
    if (dragging) scrubAt(e.clientX);
  });
  ['pointerup', 'pointercancel'].forEach(function(ev) {
    trackWrap.addEventListener(ev, function() { dragging = false; });
  });

  trackWrap.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault(); tempC = _clamp(tempC + 0.5, minC, boilCapC); _hapticTick(); paint(); emit();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault(); tempC = _clamp(tempC - 0.5, minC, boilCapC); _hapticTick(); paint(); emit();
    }
  });

  paint();

  const thermalExplainer = BTExplainerPill({
    title: 'Slurry-Compensated Thermal Scrubber',
    what: 'Models real heat absorbed by your brewer walls and caps kettle setpoint at your elevation boiling point.',
    how: 'Drag the temperature slider (or tap the °C/°F readout) and toggle Preheated vs. Cold Ceramic/Glass.',
    tip: 'Pair a Fellow Stagg EKG+ over Bluetooth to stream live kettle temperature straight into the brew model.'
  });

  return h('div', { class: 'bt-thermal' },
    h('div', { class: 'bt-thermal-head' },
      h('span', { class: 'bt-drum-lbl', text: cfg.label || 'Water Temperature' }),
      readoutBtn,
      h('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;align-items:center' }, preheatBtn, unitBtn, thermalExplainer.btn)
    ),
    thermalExplainer.panel,
    trackWrap,
    metaLineEl
  );
}

/* ==================== 7. BTTastePad2D (4-Ring Bullseye + Macro-to-Micro Scaling) ==================== */
function _grinderStepProfile(grinderKey) {
  const k = String(grinderKey || '').toLowerCase();
  if (k.indexOf('j-ultra') >= 0 || k.indexOf('j-max') >= 0) return { umPerUnit: 9, unitSingular: 'click', unitPlural: 'clicks', isNumbered: false };
  if (k.indexOf('kinu') >= 0) return { umPerUnit: 10, unitSingular: 'div', unitPlural: 'divs', isNumbered: false };
  if (k.indexOf('jx-pro') >= 0 || k.indexOf('x-ultra') >= 0 || k.indexOf('red-clix') >= 0 || k.indexOf('c3esp') >= 0) return { umPerUnit: 13.5, unitSingular: 'click', unitPlural: 'clicks', isNumbered: false };
  if (k.indexOf('kingrinder') >= 0 || k.indexOf('s3') >= 0 || k.indexOf('xbloom-studio') >= 0) return { umPerUnit: 16.5, unitSingular: 'click', unitPlural: 'clicks', isNumbered: false };
  if (k.indexOf('k-ultra') >= 0 || k.indexOf('zp6') >= 0) return { umPerUnit: 20, unitSingular: 'click', unitPlural: 'clicks', isNumbered: false };
  if (k.indexOf('ode') >= 0 || k.indexOf('sculptor') >= 0 || k.indexOf('opus') >= 0 || k.indexOf('lagom-p64') >= 0) return { umPerUnit: 60, unitSingular: 'full number', unitPlural: 'full numbers', isNumbered: true };
  if (k.indexOf('encore') >= 0 || k.indexOf('virtuoso') >= 0 || k.indexOf('uniform') >= 0 || k.indexOf('svart') >= 0) return { umPerUnit: 28, unitSingular: 'step', unitPlural: 'steps', isNumbered: false };
  if (k.indexOf('df64') >= 0 || k.indexOf('df54') >= 0 || k.indexOf('niche') >= 0) return { umPerUnit: 14, unitSingular: 'mark', unitPlural: 'marks', isNumbered: false };
  /* Default ~28 µm/click (Comandante C40 / standard conical hand grinder) */
  return { umPerUnit: 28, unitSingular: 'click', unitPlural: 'clicks', isNumbered: false };
}

function _nonlinearMag(u) {
  if (!isFinite(u) || u === 0) return 0;
  const a = Math.min(1, Math.abs(u));
  return (u < 0 ? -1 : 1) * (0.35 * a + 0.65 * a * a);
}

function _ringIndexForRadius(r) {
  if (r <= 0.20) return 0;
  if (r <= 0.48) return 1;
  if (r <= 0.76) return 2;
  return 3;
}

const PAD_RINGS_4 = [
  { idx: 0, maxR: 0.20, key: 'sweet_spot',  label: 'Sweet Spot',              sub: 'Balanced — Lock It!' },
  { idx: 1, maxR: 0.48, key: 'close',       label: 'Close / Slightly Off',    sub: 'Fine micro-tweak' },
  { idx: 2, maxR: 0.76, key: 'clearly_off', label: 'Clearly Off',             sub: 'Solid medium step' },
  { idx: 3, maxR: 1.00, key: 'way_off',     label: 'Way Off! (Major Rescue)', sub: 'Big macro jump' }
];

function _solvePadColumns(x, y, ctx) {
  ctx = ctx || {};
  const r = Math.min(1, Math.hypot(x, y));
  const ringIdx = _ringIndexForRadius(r);
  const ringMeta = PAD_RINGS_4[ringIdx];

  const acid = _clamp(Math.round(3.2 - 1.8 * x + 0.3 * y), 1, 5);
  const sweet = _clamp(Math.round(4.8 - 2.6 * Math.sqrt(x * x + 0.5 * y * y)), 1, 5);
  const bitter = _clamp(Math.round(2.4 + 2.2 * Math.max(0, x) + 0.4 * y), 1, 5);
  const body = _clamp(Math.round(3.0 + 2.0 * y), 1, 5);

  const isEsp = typeof ctx.isEspresso === 'boolean'
    ? ctx.isEspresso
    : !!(app && app.brew && (app.brew.method === 'espresso' || app.brew.method === 'lever_espresso'));
  const gKey = ctx.grinderKey || (app && app.brew && app.brew.grinderKey) || (app && app.prefs && app.prefs.gear && app.prefs.gear.grinderKey) || 'comandante-c40';
  const gProf = _grinderStepProfile(gKey);
  const baseDose = (app && app.brew && +app.brew.dose > 0) ? +app.brew.dose : (isEsp ? 18 : 15);
  const baseWater = (app && app.brew && +app.brew.water > 0) ? +app.brew.water : (isEsp ? 36 : 250);

  /* Strict orthogonal axis deadzones (|dx| < 0.20 holds grind; |dy| < 0.20 holds ratio) */
  const effX = Math.abs(x) < 0.20 ? 0 : x;
  const effY = Math.abs(y) < 0.20 ? 0 : y;
  const mx = _nonlinearMag(effX);
  const my = _nonlinearMag(effY);

  const maxUmScale = isEsp ? 48 : 162;
  const deltaUm = ringIdx === 0 ? 0 : Math.round(mx * maxUmScale);
  const absUm = Math.abs(deltaUm);

  let grindStepLabel = '';
  if (absUm > 0) {
    const dirWord = deltaUm < 0 ? 'finer' : 'coarser';
    if (gProf.isNumbered) {
      const nums = Math.max(0.3, Math.round((absUm / gProf.umPerUnit) * 2) / 2);
      grindStepLabel = (nums < 0.75 ? '1–2 sub-clicks ' : (nums + ' ' + (nums === 1 ? gProf.unitSingular : gProf.unitPlural) + ' ')) + dirWord + ' (' + (deltaUm > 0 ? '+' : '') + deltaUm + ' µm)';
    } else {
      const steps = Math.max(1, Math.round(absUm / gProf.umPerUnit));
      grindStepLabel = steps + ' ' + (steps === 1 ? gProf.unitSingular : gProf.unitPlural) + ' ' + dirWord + ' (' + (deltaUm > 0 ? '+' : '') + deltaUm + ' µm)';
    }
  }

  const deltaRatio = ringIdx === 0 ? 0 : +(my * (isEsp ? 0.85 : 3.4)).toFixed(1);
  const deltaDoseG = ringIdx === 0 || effY === 0 ? 0 : +(-my * (baseDose * 0.27)).toFixed(1);
  const deltaWaterG = ringIdx === 0 || effY === 0 ? 0 : Math.round(my * (baseWater * 0.22));
  const deltaTempC = ringIdx === 0 || effX === 0 ? 0 : +(Math.round((-mx * 4.0) * 2) / 2).toFixed(1);
  const pourShift = (ringIdx === 3 && x < -0.45 && !isEsp) ? 'switch to 3-pulse pour + gentle bloom swirl' : ((ringIdx === 3 && x > 0.45 && !isEsp) ? 'switch to low-agitation center pour' : '');

  let sym = 'balanced';
  let zoneLabel = 'Balanced & Sweet — Nailed It!';
  let tastedText = 'Sweet Spot — Balanced & Sweet!';
  let fixText = 'Keep exact recipe & lock as Best Brew';

  if (ringIdx === 0) {
    sym = 'balanced';
  } else {
    const sevPrefix = ringIdx === 3 ? 'Really ' : (ringIdx === 2 ? 'Clearly ' : 'Slightly ');
    const extPhrase = effX < 0 ? (sevPrefix + 'Sour') : (effX > 0 ? (sevPrefix + 'Bitter') : 'Balanced Extraction');
    const strPhrase = effY < 0 ? (sevPrefix + 'Weak / Watery') : (effY > 0 ? (sevPrefix + 'Strong / Heavy') : 'Good Strength');

    /* Special Bottom-Right Channeling / Bypass Trap */
    if (x > 0.30 && y < -0.30) {
      sym = 'astringent';
      zoneLabel = ringMeta.label + ' · Weak & Bitter';
      tastedText = sevPrefix + 'Weak & Bitter (Thin & Dry — Uneven Channeling)';
      fixText = (ringIdx >= 2 ? 'Level bed, stir/swirl bloom & pour gentler in center' : 'Calm pour stream') +
        (effY < -0.45 ? (' + tighten ratio (+' + Math.abs(deltaDoseG).toFixed(1) + 'g coffee)') : '') + ' — do not coarsen grind blindly';
    } else {
      if (effX < 0) sym = 'sour';
      else if (effX > 0) sym = 'bitter';
      else if (effY < 0) sym = 'weak';
      else sym = 'strong';

      zoneLabel = ringMeta.label;
      tastedText = extPhrase + ' & ' + strPhrase + ' [' + ringMeta.label + ']';

      const parts = [];
      if (grindStepLabel) parts.push(grindStepLabel);
      if (Math.abs(deltaTempC) >= 1.0) parts.push((deltaTempC > 0 ? '+' : '') + deltaTempC + ' °C water');
      if (effY < 0) {
        parts.push('tighten ratio (' + (deltaDoseG >= 0 ? '+' : '') + deltaDoseG.toFixed(1) + 'g coffee or ' + deltaWaterG + 'g water)');
      } else if (effY > 0) {
        parts.push('widen ratio (+' + Math.abs(deltaWaterG) + 'g water or ' + deltaDoseG.toFixed(1) + 'g coffee)');
      }
      if (pourShift) parts.push(pourShift);
      fixText = (ringIdx === 3 ? 'Major Rescue: ' : '') + parts.join(' + ');
    }
  }

  const predDeltaEy = +(-mx * 3.1).toFixed(2);
  const predDeltaTds = +(-my * 0.28).toFixed(2);

  return {
    ringIndex: ringIdx,
    severityKey: ringMeta.key,
    ringLabel: ringMeta.label,
    acidity_intensity: acid,
    sweetness_intensity: sweet,
    bitterness_intensity: bitter,
    body_intensity: body,
    fix_symptom: sym,
    zoneLabel: zoneLabel,
    tastedText: tastedText,
    fixText: fixText,
    mx: +mx.toFixed(3),
    my: +my.toFixed(3),
    deltaUm: deltaUm,
    grindStepLabel: grindStepLabel,
    deltaRatio: deltaRatio,
    deltaDoseG: deltaDoseG,
    deltaWaterG: deltaWaterG,
    deltaTempC: deltaTempC,
    pourShift: pourShift,
    predDeltaEy: predDeltaEy,
    predDeltaTds: predDeltaTds,
    inSweetSpot: ringIdx === 0
  };
}

function BTTastePad2D(cfg) {
  cfg = cfg || {};
  const uid = _tUid('bt_tp');
  let px = isFinite(+cfg.x) ? _clamp(+cfg.x, -1, 1) : 0;
  let py = isFinite(+cfg.y) ? _clamp(+cfg.y, -1, 1) : 0;
  let lastRingIdx = _ringIndexForRadius(Math.hypot(px, py));

  const measTds = isFinite(+cfg.measuredTds) && +cfg.measuredTds > 0 ? +cfg.measuredTds : null;
  const measEy = isFinite(+cfg.measuredEy) && +cfg.measuredEy > 0 ? +cfg.measuredEy : null;
  const tgtTds = isFinite(+cfg.targetTds) && +cfg.targetTds > 0 ? +cfg.targetTds : 1.38;
  const tgtEy = isFinite(+cfg.targetEy) && +cfg.targetEy > 0 ? +cfg.targetEy : 20.0;

  const VB = 300;
  const MID = 150;
  const SPAN = 126;

  function normToSvg(nx, ny) {
    return [+(MID + nx * SPAN).toFixed(1), +(MID - ny * SPAN).toFixed(1)];
  }

  const defs = h('defs', null,
    h('radialGradient', { id: uid + '_sweet', cx: '0.5', cy: '0.5', r: '0.5' },
      h('stop', { offset: '0%', 'stop-color': '#F6B94D', 'stop-opacity': '0.50' }),
      h('stop', { offset: '75%', 'stop-color': '#DF862C', 'stop-opacity': '0.20' }),
      h('stop', { offset: '100%', 'stop-color': '#DF862C', 'stop-opacity': '0.06' })
    ),
    h('linearGradient', { id: uid + '_horiz', x1: '0', y1: '0.5', x2: '1', y2: '0.5' },
      h('stop', { offset: '0%', 'stop-color': '#D9C63B', 'stop-opacity': '0.15' }),
      h('stop', { offset: '50%', 'stop-color': '#FFFFFF', 'stop-opacity': '0' }),
      h('stop', { offset: '100%', 'stop-color': '#5C2B16', 'stop-opacity': '0.20' })
    ),
    h('linearGradient', { id: uid + '_vert', x1: '0.5', y1: '0', x2: '0.5', y2: '1' },
      h('stop', { offset: '0%', 'stop-color': '#381C0D', 'stop-opacity': '0.11' }),
      h('stop', { offset: '50%', 'stop-color': '#FFFFFF', 'stop-opacity': '0' }),
      h('stop', { offset: '100%', 'stop-color': '#6EC6E6', 'stop-opacity': '0.10' })
    )
  );

  /* 4 Concentric Archery Severity Rings + 5 Self-Explanatory Zones (#155 + #159) */
  const rBull = +(0.20 * SPAN).toFixed(1); /* 25.2 */
  const r1    = +(0.48 * SPAN).toFixed(1); /* 60.5 */
  const r2    = +(0.76 * SPAN).toFixed(1); /* 95.8 */
  const r3    = +(1.00 * SPAN).toFixed(1); /* 126.0 */

  const zonesLayer = h('g', { 'aria-hidden': 'true' },
    /* Outer Ring 3 (r = 0.76..1.00): Major Rescue */
    h('circle', { cx: MID, cy: MID, r: r3, fill: 'rgba(158,33,29,0.04)', stroke: 'var(--line-strong)', 'stroke-width': 1.2, 'stroke-dasharray': '5 3' }),
    h('text', { x: MID, y: 38, 'text-anchor': 'middle', fill: 'var(--bad)', 'font-size': 8.4, 'font-weight': 700, text: 'Major Rescue' }),

    /* Middle Ring 2 (r = 0.48..0.76): Clearly Off */
    h('circle', { cx: MID, cy: MID, r: r2, fill: 'rgba(154,66,18,0.03)', stroke: 'var(--line)', 'stroke-width': 1.2, 'stroke-dasharray': '4 3' }),
    h('text', { x: MID, y: +(MID - r2 + 11).toFixed(1), 'text-anchor': 'middle', fill: 'var(--ink-muted)', 'font-size': 8.4, 'font-weight': 700, text: 'Clearly Off' }),

    /* Inner Ring 1 (r = 0.20..0.48): Close / Slightly Off */
    h('circle', { cx: MID, cy: MID, r: r1, fill: 'rgba(217,139,38,0.04)', stroke: 'var(--line)', 'stroke-width': 1.2 }),
    h('text', { x: MID, y: +(MID - r1 + 11).toFixed(1), 'text-anchor': 'middle', fill: 'var(--ink-muted)', 'font-size': 8.4, 'font-weight': 700, text: 'Close / Slightly Off' }),

    /* 4 Corner Quadrant Labels positioned cleanly in outer corner pockets */
    h('text', { x: 44, y: 20, 'text-anchor': 'middle', fill: 'var(--ink)', 'font-size': 9.6, 'font-weight': 700, text: 'Strong & Sour' }),
    h('text', { x: 44, y: 30, 'text-anchor': 'middle', fill: 'var(--ink-muted)', 'font-size': 7.8, 'font-weight': 600, text: 'Heavy / tart' }),

    h('text', { x: 256, y: 20, 'text-anchor': 'middle', fill: 'var(--ink)', 'font-size': 9.6, 'font-weight': 700, text: 'Strong & Bitter' }),
    h('text', { x: 256, y: 30, 'text-anchor': 'middle', fill: 'var(--ink-muted)', 'font-size': 7.8, 'font-weight': 600, text: 'Heavy / harsh' }),

    h('text', { x: 44, y: 285, 'text-anchor': 'middle', fill: 'var(--ink)', 'font-size': 9.6, 'font-weight': 700, text: 'Weak & Sour' }),
    h('text', { x: 44, y: 295, 'text-anchor': 'middle', fill: 'var(--ink-muted)', 'font-size': 7.8, 'font-weight': 600, text: 'Watery & tart' }),

    h('text', { x: 256, y: 285, 'text-anchor': 'middle', fill: 'var(--ink)', 'font-size': 9.6, 'font-weight': 700, text: 'Weak & Bitter' }),
    h('text', { x: 256, y: 295, 'text-anchor': 'middle', fill: 'var(--ink-muted)', 'font-size': 7.8, 'font-weight': 600, text: 'Thin · dry' }),

    /* Bullseye Ring 0 (r = 0.00..0.20): Sweet Spot! */
    h('circle', { cx: MID, cy: MID, r: rBull, fill: 'url(#' + uid + '_sweet)', stroke: 'var(--gold)', 'stroke-width': 2.2 }),
    h('text', { x: MID, y: MID + 3.5, 'text-anchor': 'middle', fill: 'var(--ink)', 'font-size': 9.8, 'font-weight': 700, text: 'Sweet Spot!' })
  );

  /* Dual-Pin Sensor-to-Tongue Vector Line (X-Ray / R2 Connected) */
  const dualVectorLine = h('line', {
    x1: MID, y1: MID, x2: MID, y2: MID,
    stroke: 'var(--science)',
    'stroke-width': 2,
    'stroke-dasharray': '4 3',
    hidden: measEy == null
  });

  const measuredPinGroup = h('g', { hidden: measEy == null },
    h('polygon', { points: '0,-10 9,0 0,10 -9,0', fill: 'var(--science)', stroke: '#FFFDF9', 'stroke-width': 2 }),
    h('text', { x: 0, y: -14, 'text-anchor': 'middle', fill: 'var(--science)', 'font-size': 9.5, 'font-weight': 700, text: 'Meter Pin' })
  );

  /* Sculpted Draggable Coffee Cup Puck */
  const puckGroup = h('g', { class: 'bt-tastepad-puck' },
    h('circle', { r: 24, fill: 'var(--accent)', opacity: '0.18' }),
    h('circle', { r: 16, fill: 'var(--accent)', stroke: '#FFFDF9', 'stroke-width': 2.8 }),
    h('path', { d: 'M -6 -4 H 5 V 2 A 5.5 5.5 0 0 1 -0.5 7.5 A 5.5 5.5 0 0 1 -6 2 Z M 5 -2.5 H 7.2 A 2 2 0 0 1 7.2 1.5 H 5', fill: 'none', stroke: '#FFFDF9', 'stroke-width': 1.7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })
  );

  const svgEl = h('svg', {
    class: 'bt-tastepad-svg',
    viewBox: '0 0 300 300',
    role: 'slider',
    tabindex: '0',
    'aria-label': 'How did this cup taste? 4-Ring 2D Cup Balance Pad: Left-Right Extraction, Bottom-Top Strength',
    'aria-valuemin': -100,
    'aria-valuemax': 100
  },
    defs,
    h('rect', { width: VB, height: VB, fill: 'var(--well)' }),
    h('rect', { width: VB, height: VB, fill: 'url(#' + uid + '_horiz)' }),
    h('rect', { width: VB, height: VB, fill: 'url(#' + uid + '_vert)' }),
    h('line', { x1: MID, y1: 8, x2: MID, y2: 292, stroke: 'var(--line)', 'stroke-dasharray': '4 4' }),
    h('line', { x1: 8, y1: MID, x2: 292, y2: MID, stroke: 'var(--line)', 'stroke-dasharray': '4 4' }),
    zonesLayer,
    dualVectorLine,
    measuredPinGroup,
    puckGroup
  );

  const promptHeader = h('div', { class: 'bt-tastepad-prompt' },
    BTIcons.el('cafe-cup', { size: 18 }),
    h('span', { text: cfg.prompt || 'How did this cup taste? Tap a zone or drag the cup:' })
  );

  const axisGuideBar = h('div', { class: 'bt-tastepad-axis-guide' },
    h('span', null, BTIcons.el('grinder-burr', { size: 14 }), ' Left-Right: Extraction (Fix: Grind & Temp)'),
    h('span', null, BTIcons.el('water-drop', { size: 14 }), ' Down-Up: Strength (Fix: Coffee-to-Water Ratio)')
  );

  const loupeEl = h('div', { class: 'bt-tastepad-loupe', hidden: true });
  const tastedLine = h('div', { class: 'bt-tastepad-tasted' });
  const fixLine = h('div', { class: 'bt-tastepad-fix' });
  const readoutBar = h('div', { class: 'bt-tastepad-readout-bar', 'aria-live': 'polite' }, tastedLine, fixLine);

  const xrayBox = h('div', { class: 'bt-tastepad-xray' + (measEy == null ? ' bt-xray-only' : '') });
  const channelAlert = h('div', { class: 'bt-tastepad-channel-alert', hidden: true });

  const stage = h('div', { class: 'bt-tastepad-stage' }, svgEl, loupeEl);

  function solveNow() {
    return _solvePadColumns(px, py, { grinderKey: cfg.grinderKey, isEspresso: cfg.isEspresso });
  }

  function paint(showDragLoupe) {
    const pt = normToSvg(px, py);
    puckGroup.setAttribute('transform', 'translate(' + pt[0] + ' ' + pt[1] + ')');

    const solved = solveNow();
    readoutBar.classList.toggle('is-sweet', solved.inSweetSpot);
    tastedLine.textContent = 'Tasted: ' + solved.tastedText;
    fixLine.textContent = '';
    fixLine.append(
      BTIcons.el(solved.inSweetSpot ? 'check-seal' : 'spark-star', { size: 15 }),
      h('span', { text: (solved.inSweetSpot ? 'Result: ' : 'Next Brew Fix: ') + solved.fixText })
    );

    svgEl.setAttribute('aria-valuenow', String(Math.round(px * 100)));
    svgEl.setAttribute('aria-valuetext', solved.tastedText + '. Next Brew Fix: ' + solved.fixText);

    if (showDragLoupe) {
      loupeEl.hidden = false;
      loupeEl.textContent = solved.ringLabel;
      loupeEl.style.left = ((pt[0] / VB) * 100).toFixed(1) + '%';
      loupeEl.style.top = Math.max(16, (pt[1] / VB) * 100 - 12).toFixed(1) + '%';
    } else {
      loupeEl.hidden = true;
    }

    const isSciLens = (typeof BTScienceLens !== 'undefined' && BTScienceLens && typeof BTScienceLens.level === 'function')
      ? (BTScienceLens.level() === 'scientist')
      : false;

    const gnSummary = solved.ringLabel + ' · Pad (' + (px >= 0 ? '+' : '') + px.toFixed(2) + ', ' + (py >= 0 ? '+' : '') + py.toFixed(2) + ')' +
      ' \u2192 Grind shift ' + (solved.deltaUm >= 0 ? '+' : '') + solved.deltaUm + ' µm, Ratio shift ' + (solved.deltaRatio >= 0 ? '+' : '') + solved.deltaRatio +
      ', Est. Extraction (%EY) shift ' + (solved.predDeltaEy >= 0 ? '+' : '') + solved.predDeltaEy + '%';

    if (measEy != null) {
      const mxSvg = _clamp((measEy - tgtEy) / 3.5, -0.92, 0.92);
      const mySvg = measTds != null ? _clamp((measTds - tgtTds) / 0.35, -0.92, 0.92) : 0;
      const mpt = normToSvg(mxSvg, mySvg);
      measuredPinGroup.hidden = false;
      measuredPinGroup.setAttribute('transform', 'translate(' + mpt[0] + ' ' + mpt[1] + ')');
      dualVectorLine.hidden = false;
      dualVectorLine.setAttribute('x1', String(mpt[0]));
      dualVectorLine.setAttribute('y1', String(mpt[1]));
      dualVectorLine.setAttribute('x2', String(pt[0]));
      dualVectorLine.setAttribute('y2', String(pt[1]));

      const sensorGap = +(px - mxSvg).toFixed(2);
      xrayBox.textContent = 'Meter + Taste Check: Measured ' + (measTds != null ? measTds.toFixed(2) + '% TDS · ' : '') + measEy.toFixed(1) + '% Extraction (%EY)' +
        (isSciLens ? (' · Tongue-Meter Gap ' + (sensorGap >= 0 ? '+' : '') + sensorGap + ' · ' + gnSummary) : '');

      const isChanneling = measEy < 19.0 && px > 0.32;
      channelAlert.hidden = !isChanneling;
      if (isChanneling) {
        channelAlert.textContent = '';
        channelAlert.append(
          BTScienceLens.epistemicBadge('verified_physics'),
          h('div', { style: 'margin-top:4px', text: 'Uneven Channeling Detected: Measured overall extraction is low (' + measEy.toFixed(1) + '% Extraction), yet your tongue tastes bitterness/dryness. Water carved fast channels — level the bed and pour gentler instead of grinding coarser!' })
        );
      }
    } else {
      xrayBox.textContent = gnSummary;
    }
  }

  function emit() {
    const solved = solveNow();
    if (typeof cfg.onChange === 'function') {
      cfg.onChange(Object.assign({
        x: +px.toFixed(3),
        y: +py.toFixed(3),
        pad_xy: [+px.toFixed(3), +py.toFixed(3)]
      }, solved));
    }
  }

  function coordsFromClient(e) {
    const rect = svgEl.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / Math.max(1, rect.width)) * VB;
    const sy = ((e.clientY - rect.top) / Math.max(1, rect.height)) * VB;
    const nx = _clamp((sx - MID) / SPAN, -1, 1);
    const ny = _clamp((MID - sy) / SPAN, -1, 1);
    return [nx, ny];
  }

  function fireRingCrossingHaptic(nextR) {
    const nextRing = _ringIndexForRadius(nextR);
    if (nextRing !== lastRingIdx) {
      if (nextRing === 0) _hapticSweetSpot();
      else if (nextRing === 3) _hapticSnap();
      else _hapticTick();
      lastRingIdx = nextRing;
    }
  }

  let pDown = false;
  let dragged = false;
  let downX = 0;
  let downY = 0;

  svgEl.addEventListener('pointerdown', function(e) {
    if (e.button && e.button !== 0) return;
    pDown = true;
    dragged = false;
    downX = e.clientX;
    downY = e.clientY;
    try { svgEl.setPointerCapture(e.pointerId); } catch (err) {}
  });

  svgEl.addEventListener('pointermove', function(e) {
    if (!pDown) return;
    if (!dragged && Math.hypot(e.clientX - downX, e.clientY - downY) > 5) {
      dragged = true;
    }
    if (!dragged) return;
    const c = coordsFromClient(e);
    let nx = c[0], ny = c[1];
    if (Math.hypot(nx, ny) <= 0.11) { nx = 0; ny = 0; }
    px = nx;
    py = ny;
    fireRingCrossingHaptic(Math.hypot(px, py));
    paint(true);
    emit();
  });

  svgEl.addEventListener('pointerup', function(e) {
    if (!pDown) return;
    pDown = false;
    if (!dragged) {
      /* 1-Tap Zone Snap: Bullseye centers & locks; anywhere else places puck at exact ring severity */
      const c = coordsFromClient(e);
      const nx = c[0], ny = c[1];
      if (Math.hypot(nx, ny) <= 0.22) {
        px = 0;
        py = 0;
        _hapticSweetSpot();
      } else {
        px = nx;
        py = ny;
        _hapticSnap();
      }
      lastRingIdx = _ringIndexForRadius(Math.hypot(px, py));
      paint(false);
      emit();
    } else {
      paint(false);
    }
  });

  svgEl.addEventListener('pointercancel', function() {
    pDown = false;
    dragged = false;
    paint(false);
  });

  svgEl.addEventListener('keydown', function(e) {
    const step = 0.12;
    if (e.key === 'ArrowLeft') { e.preventDefault(); px = _clamp(px - step, -1, 1); fireRingCrossingHaptic(Math.hypot(px, py)); paint(false); emit(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); px = _clamp(px + step, -1, 1); fireRingCrossingHaptic(Math.hypot(px, py)); paint(false); emit(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); py = _clamp(py + step, -1, 1); fireRingCrossingHaptic(Math.hypot(px, py)); paint(false); emit(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); py = _clamp(py - step, -1, 1); fireRingCrossingHaptic(Math.hypot(px, py)); paint(false); emit(); }
  });

  /* 5 Accessible 1-Tap Zone Pills (>=44px touch & keyboard targets matching the 5 visual zones) */
  const quickRow = h('div', { style: 'display:flex;flex-wrap:wrap;justify-content:center;gap:6px', role: 'group', 'aria-label': 'Quick taste zones' },
    [
      { lbl: 'Balanced & Sweet — Nailed It!', x: 0,     y: 0 },
      { lbl: 'Strong & Sour',                 x: -0.52, y: 0.48 },
      { lbl: 'Strong & Bitter',               x: 0.52,  y: 0.48 },
      { lbl: 'Weak & Sour',                   x: -0.52, y: -0.48 },
      { lbl: 'Weak & Bitter',                 x: 0.52,  y: -0.48 }
    ].map(function(q) {
      return h('button', {
        type: 'button',
        class: 'bt-chip',
        text: q.lbl,
        onclick: function() {
          px = q.x;
          py = q.y;
          lastRingIdx = _ringIndexForRadius(Math.hypot(px, py));
          if (lastRingIdx === 0) _hapticSweetSpot(); else _hapticSnap();
          paint(false);
          emit();
        }
      });
    })
  );

  paint(false);

  const padExplainer = BTExplainerPill({
    title: '4-Ring 2D Cup Balance & Dual-Pin Pad',
    what: 'Separates Extraction (Sour \u2194 Bitter, fixed by Grind & Temp) from Strength (Weak \u2194 Strong, fixed by Coffee-to-Water Ratio), while 4 concentric rings scale fix size from a tiny 1-click micro-tweak (Ring 1) to a full macro rescue (Outer Ring 3).',
    how: 'Tap Sweet Spot if you nailed it, or drag the coffee cup outward: Close = gentle tweak, Clearly Off = medium step, Way Off (outer edge) = major grind/ratio/temp rescue.',
    tip: 'With DiFluid R2, stir 3–5 mL in a room-temp metal spoon for 15–20s (cools to 20–28 °C with zero evaporation) before reading %TDS.'
  });

  const showR2Bar = !!(cfg.r2Connected || cfg.sampleTempC != null || measTds != null || measEy != null);
  const r2TempWidget = showR2Bar ? BTR2ReadinessBadge({ sampleTempC: cfg.sampleTempC }) : null;

  const root = h('div', { class: 'bt-tastepad' },
    cfg.compactChrome ? null : h('div', { class: 'bt-control-topbar' }, promptHeader, padExplainer.btn),
    cfg.compactChrome ? null : padExplainer.panel,
    cfg.compactChrome ? null : axisGuideBar,
    stage,
    cfg.compactChrome ? null : readoutBar,
    cfg.compactChrome ? null : r2TempWidget,
    xrayBox,
    channelAlert,
    cfg.compactChrome ? null : quickRow
  );
  root.setXY = function(nx, ny) { px = _clamp(+nx || 0, -1, 1); py = _clamp(+ny || 0, -1, 1); lastRingIdx = _ringIndexForRadius(Math.hypot(px, py)); paint(false); };
  root.getState = function() { return Object.assign({ x: px, y: py }, solveNow()); };
  return root;
}

/* ==================== 8. BTBeanSweep (0.25-Step 5-Bean Rating, Gradient Fill) ==================== */
function BTBeanSweep(cfg) {
  cfg = cfg || {};
  const uid = _tUid('bt_bs');
  const step = typeof cfg.step === 'number' && cfg.step > 0 ? cfg.step : 0.25;
  let val = _quantize(isFinite(+cfg.value) ? +cfg.value : 0, step, 0, 5);

  const beanButtons = [];
  const gradStops = [];

  for (let i = 1; i <= 5; i++) {
    const gid = uid + '_g' + i;
    const s1 = h('stop', { offset: '0%', 'stop-color': 'var(--accent)' });
    const s2 = h('stop', { offset: '0%', 'stop-color': 'var(--track)' });
    gradStops.push({ s1: s1, s2: s2 });

    const beanSvg = h('svg', { class: 'bt-bean-svg', viewBox: '0 0 24 24', 'aria-hidden': 'true' },
      h('defs', null,
        h('linearGradient', { id: gid, x1: '0', y1: '0', x2: '1', y2: '0' }, s1, s2)
      ),
      h('path', {
        d: 'M 12 3 C 16.8 3 19 7.2 19 12 C 19 16.8 16.8 21 12 21 C 7.2 21 5 16.8 5 12 C 5 7.2 7.2 3 12 3 Z',
        fill: 'url(#' + gid + ')',
        stroke: 'var(--ink)',
        'stroke-width': 1.6
      }),
      h('path', {
        d: 'M 12 4.2 C 9.4 8.5 14.6 11.5 12 15.8 C 10.6 17.8 11.3 19.1 12 19.8',
        fill: 'none',
        stroke: 'var(--surface)',
        'stroke-width': 1.5,
        'stroke-linecap': 'round'
      })
    );

    const btn = h('button', {
      type: 'button',
      class: 'bt-bean-btn',
      'aria-label': 'Rate ' + i + ' of 5 beans',
      onclick: function(e) {
        const rect = btn.getBoundingClientRect();
        const localFrac = _clamp((e.clientX - rect.left) / Math.max(1, rect.width), 0.25, 1);
        const qLocal = Math.ceil(localFrac / step) * step;
        setValue(_quantize((i - 1) + qLocal, step, step, 5), false);
      }
    }, beanSvg);

    beanButtons.push(btn);
  }

  const readout = h('span', { class: 'mono', style: 'font-weight:700;font-size:1.05rem;min-width:68px;text-align:center' });

  const track = h('div', {
    class: 'bt-bean-track',
    role: 'slider',
    tabindex: '0',
    'aria-label': cfg.label || 'Coffee bean rating (0 to 5 in 0.25 steps)',
    'aria-valuemin': 0,
    'aria-valuemax': 5
  }, beanButtons);

  function paint() {
    for (let i = 0; i < 5; i++) {
      const fillFrac = _clamp(val - i, 0, 1);
      const pct = Math.round(fillFrac * 100) + '%';
      gradStops[i].s1.setAttribute('offset', pct);
      gradStops[i].s2.setAttribute('offset', pct);
    }
    readout.textContent = val > 0 ? (val.toFixed(2).replace(/\.00$/, '.0') + ' / 5') : 'Unrated';
    track.setAttribute('aria-valuenow', String(val));
    track.setAttribute('aria-valuetext', val > 0 ? (val.toFixed(2) + ' out of 5 beans') : 'Unrated');
  }

  function setValue(nextVal, silent) {
    const q = _quantize(nextVal, step, 0, 5);
    if (q === val && !silent) return;
    val = q;
    paint();
    if (!silent) {
      if (val >= 4.5 && window.BTHaptics && window.BTHaptics.celebrate) {
        try { window.BTHaptics.celebrate(); } catch (e) {}
      } else {
        _hapticTick();
      }
      if (typeof cfg.onChange === 'function') cfg.onChange(val);
    }
  }

  function scrubTrack(clientX) {
    const rect = track.getBoundingClientRect();
    const u = _clamp((clientX - (rect.left + 8)) / Math.max(1, rect.width - 16), 0, 1);
    setValue(_quantize(u * 5, step, step, 5), false);
  }

  let sweeping = false;
  track.addEventListener('pointerdown', function(e) {
    sweeping = true;
  });
  track.addEventListener('pointermove', function(e) {
    if (!sweeping) return;
    scrubTrack(e.clientX);
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function(ev) {
    track.addEventListener(ev, function() { sweeping = false; });
  });

  track.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); setValue(val + step, false); }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); setValue(val - step, false); }
  });

  paint();

  const sweepExplainer = BTExplainerPill({
    label: '?',
    title: 'Quarter-Bean Rating Sweep',
    what: 'Scores your personal enjoyment from 0.25 to 5.00 beans to build your personal taste profile.',
    how: 'Slide your thumb across the 5 sculpted beans or tap − / + for 0.25-step precision.',
    tip: 'Brews rated 4.5+ beans unlock 1-tap Gold Recipe Lock and anchor your personal Sweet Spot.'
  });

  const root = h('div', { class: 'bt-bean-sweep' },
    h('div', { class: 'bt-bean-sweep-row' },
      h('button', {
        type: 'button',
        class: 'bt-drum-nudge',
        'aria-label': 'Decrease rating by 0.25',
        onclick: function() { setValue(val - step, false); }
      }, '−'),
      track,
      h('button', {
        type: 'button',
        class: 'bt-drum-nudge',
        'aria-label': 'Increase rating by 0.25',
        onclick: function() { setValue(val + step, false); }
      }, '+'),
      sweepExplainer.btn
    ),
    readout,
    sweepExplainer.panel
  );
  root.setValue = function(v) { setValue(v, true); };
  root.getValue = function() { return val; };
  return root;
}

/* ==================== 9. BTGoldenSipClock (270 deg Horological Thermal Chronograph) ==================== */
function _horoPolar(cx, cy, rad, deg) {
  const a = (deg * Math.PI) / 180;
  return [+(cx + rad * Math.cos(a)).toFixed(2), +(cy + rad * Math.sin(a)).toFixed(2)];
}

function _horoArc(cx, cy, rad, d0, d1) {
  if (Math.abs(d1 - d0) < 0.05) return '';
  const p0 = _horoPolar(cx, cy, rad, d0);
  const p1 = _horoPolar(cx, cy, rad, d1);
  const large = Math.abs(d1 - d0) > 180 ? 1 : 0;
  const sweep = d1 >= d0 ? 1 : 0;
  return 'M ' + p0[0] + ' ' + p0[1] + ' A ' + rad + ' ' + rad + ' 0 ' + large + ' ' + sweep + ' ' + p1[0] + ' ' + p1[1];
}

function _fmtMmSs(sec) {
  const s = Math.max(0, Math.round(+sec || 0));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return (mm < 10 ? '0' + mm : String(mm)) + ':' + (ss < 10 ? '0' + ss : String(ss));
}

function _evalGoldenSipForTemp(tempC, secsHint) {
  const tc = _clamp(isFinite(+tempC) ? +tempC : 74.0, 36.0, 88.0);
  const tf = Math.round((tc * 9) / 5 + 32);
  const isSci = (typeof BTScienceLens !== 'undefined' && BTScienceLens && typeof BTScienceLens.level === 'function')
    ? (BTScienceLens.level() === 'scientist')
    : false;

  let zone = 'clarity';
  let kicker = 'CLARITY & FRUIT PEAK';
  let title = 'Clarity & Fruit Peak (42–54 °C) — Bright Fruit & Florals Open';
  let sub = 'Crisp fruit brightness and delicate floral notes shine clearly as the cup cools toward warm tea temperature.';
  let liquidColor = '#A85626';

  if (tc > 62.5) {
    zone = 'hot';
    kicker = tc >= 66 ? 'TOO HOT · COOLING DOWN' : 'ALMOST AT 60 °C SWEET SIP';
    title = tc >= 66
      ? 'Hot Cup (>65 °C) — Heat Masks Natural Sweetness'
      : 'Almost Ready (63–65 °C) — Sweet Sip Opening Soon';
    sub = isSci
      ? 'Above 65 °C thermal TRPV1 nociceptors mute sweet perception. Let cool into 62–55 °C while enjoying rising aroma.'
      : 'Above 65 °C heat masks sweetness and emphasizes bitterness — let cool to 62–55 °C (144–131 °F) for peak flavor.';
    liquidColor = '#7D2818';
  } else if (tc >= 54.5) {
    zone = 'golden';
    kicker = '60 °C SWEET SIP READY!';
    title = '60 °C Sweet Sip Window (55–62 °C · 131–144 °F)';
    sub = isSci
      ? 'TRPM5 sweet-taste channels unlock peak caramel & retronasal sweetness right now!'
      : 'Natural caramel & fruit sweetness peak right now — take a slow, full sip!';
    liquidColor = '#B86220';
  } else if (tc < 42.0) {
    zone = 'cool';
    kicker = 'COOL FINISH CHECK';
    title = 'Room-Warm Finish Check (<42 °C)';
    sub = 'Any hidden roast harshness or dryness shows clearly as the cup finishes cooling.';
    liquidColor = '#8F4C24';
  }

  const estSecs = secsHint != null && isFinite(+secsHint)
    ? Math.max(0, Math.round(+secsHint))
    : (tc > 60.5 ? Math.round((tc - 60.5) * 14) : 0);

  return {
    tempC: +tc.toFixed(1),
    tempF: tf,
    zone: zone,
    inGoldenSip: zone === 'golden',
    kicker: kicker,
    title: title,
    sub: sub,
    liquidColor: liquidColor,
    secsToGolden: estSecs
  };
}

function BTGoldenSipClock(cfg) {
  cfg = cfg || {};
  const uid = _tUid('bt_gsc');
  const CX = 160, CY = 146;
  const START_DEG = 135, SPAN_DEG = 270; /* 135 deg (84 C) -> 405 deg (38 C) */
  const T_MAX = 84.0, T_MIN = 38.0;
  const T_AMB = 22.5;
  const K_COOL = 0.0022; /* Newton cooling constant (~2.5 min from 78 C to 60 C) */

  const startTempDefault = isFinite(+cfg.tempC) ? +cfg.tempC : 76.0;
  let liveState = {
    tempC: startTempDefault,
    secsToGolden: cfg.secsToGolden != null ? +cfg.secsToGolden : (cfg.etaSec != null ? +cfg.etaSec : null),
    countdownMmSs: cfg.countdownMmSs || '',
    zoneLabel: cfg.zoneLabel || '',
    stageDetail: cfg.stageDetail || '',
    lidTip: cfg.lidTip || '',
    vesselLabel: cfg.vesselLabel || ''
  };
  let scrubTempC = null;
  let clockRunning = cfg.autoStart !== false;
  let internalOriginMs = Date.now();
  let internalStartTempC = startTempDefault;
  let manualOverrideUntilMs = 0;
  let lastExternalUpdateMs = 0;

  function degForTemp(tC) {
    const u = _clamp((T_MAX - tC) / (T_MAX - T_MIN), 0, 1);
    return START_DEG + u * SPAN_DEG;
  }

  function tempForDeg(degNorm) {
    const u = _clamp((degNorm - START_DEG) / SPAN_DEG, 0, 1);
    return +(T_MAX - u * (T_MAX - T_MIN)).toFixed(1);
  }

  const defs = h('defs', null,
    h('linearGradient', { id: uid + '_hot', x1: '0', y1: '1', x2: '1', y2: '0' },
      h('stop', { offset: '0%', 'stop-color': '#C63527' }),
      h('stop', { offset: '100%', 'stop-color': '#E5892E' })
    ),
    h('linearGradient', { id: uid + '_gold', x1: '0', y1: '0', x2: '1', y2: '0' },
      h('stop', { offset: '0%', 'stop-color': '#F0B436' }),
      h('stop', { offset: '55%', 'stop-color': '#32B679' }),
      h('stop', { offset: '100%', 'stop-color': '#1F9E65' })
    ),
    h('linearGradient', { id: uid + '_clar', x1: '0', y1: '0', x2: '1', y2: '1' },
      h('stop', { offset: '0%', 'stop-color': '#26A669' }),
      h('stop', { offset: '100%', 'stop-color': '#2B83B8' })
    ),
    h('radialGradient', { id: uid + '_plate', cx: '0.5', cy: '0.46', r: '0.54' },
      h('stop', { offset: '0%', 'stop-color': 'var(--surface)' }),
      h('stop', { offset: '100%', 'stop-color': 'var(--well)' })
    )
  );

  /* 60 Precision Bezel Ticks + 12 Major Copper Intervals */
  const bezelTicks = h('g', { 'aria-hidden': 'true' });
  for (let i = 0; i <= 60; i++) {
    const deg = START_DEG + (i / 60) * SPAN_DEG;
    const isMajor = i % 5 === 0;
    const p1 = _horoPolar(CX, CY, isMajor ? 120 : 125.5, deg);
    const p2 = _horoPolar(CX, CY, 131.5, deg);
    bezelTicks.appendChild(h('line', {
      x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1],
      stroke: isMajor ? 'var(--accent)' : 'var(--edge)',
      'stroke-width': isMajor ? 2.2 : 1.05,
      'stroke-linecap': 'round',
      opacity: isMajor ? '0.95' : '0.52'
    }));
  }

  /* Perimeter Calibration Numerals (°C) */
  [84, 74, 65, 62, 55, 48, 40].forEach(function(tMark) {
    const pt = _horoPolar(CX, CY, 142.5, degForTemp(tMark));
    const isGoldMark = tMark === 62 || tMark === 55;
    bezelTicks.appendChild(h('text', {
      x: pt[0],
      y: +(pt[1] + 3).toFixed(1),
      'text-anchor': 'middle',
      fill: isGoldMark ? 'var(--good)' : 'var(--ink-muted)',
      'font-size': isGoldMark ? 9.2 : 8.4,
      'font-weight': isGoldMark ? 800 : 600,
      text: tMark + '°'
    }));
  });

  /* Sculpted Multi-Stop Thermal Arcs (r = 109) */
  const R_ARC = 109;
  const d84 = degForTemp(84), d65 = degForTemp(65), d62 = degForTemp(62), d55 = degForTemp(55), d42 = degForTemp(42), d38 = degForTemp(38);
  const zoneArcs = h('g', { 'aria-hidden': 'true' },
    h('path', { d: _horoArc(CX, CY, R_ARC, d84, d38), fill: 'none', stroke: 'var(--track)', 'stroke-width': 10, 'stroke-linecap': 'round' }),
    /* 84 -> 65 C: Amber-Ruby Aroma Only */
    h('path', { d: _horoArc(CX, CY, R_ARC, d84, d65), fill: 'none', stroke: 'url(#' + uid + '_hot)', 'stroke-width': 9.5, 'stroke-linecap': 'round' }),
    /* 65 -> 62 C: Warm Gold Bridge */
    h('path', { d: _horoArc(CX, CY, R_ARC, d65, d62), fill: 'none', stroke: '#E8A338', 'stroke-width': 9.5 }),
    /* 62 -> 55 C: Highlighted Glowing Emerald-Gold GOLDEN SIP Sweet Zone */
    h('path', { class: 'bt-gs-sweet-halo', d: _horoArc(CX, CY, R_ARC, d62, d55), fill: 'none', stroke: '#26A669', 'stroke-width': 20, 'stroke-linecap': 'round' }),
    h('path', { d: _horoArc(CX, CY, R_ARC, d62, d55), fill: 'none', stroke: 'url(#' + uid + '_gold)', 'stroke-width': 13, 'stroke-linecap': 'round' }),
    /* 55 -> 42 C: Teal Clarity Peak */
    h('path', { d: _horoArc(CX, CY, R_ARC, d55, d42), fill: 'none', stroke: 'url(#' + uid + '_clar)', 'stroke-width': 9.5 }),
    /* 42 -> 38 C: Cool Tail */
    h('path', { d: _horoArc(CX, CY, R_ARC, d42, d38), fill: 'none', stroke: '#4A7B9D', 'stroke-width': 9.5, 'stroke-linecap': 'round' }),
    /* Crown Label for 60 C Sweet Sip Window */
    h('text', {
      x: _horoPolar(CX, CY, 91, (d62 + d55) / 2)[0],
      y: _horoPolar(CX, CY, 91, (d62 + d55) / 2)[1],
      'text-anchor': 'middle',
      fill: 'var(--good)',
      'font-size': 7.5,
      'font-weight': 800,
      'letter-spacing': '0.05em',
      text: '60°C SWEET SIP'
    })
  );

  /* Gliding Comet Trail + Counterweighted Horological Needle */
  const cometWake = h('path', {
    d: '',
    fill: 'none',
    stroke: 'var(--accent)',
    'stroke-width': 5,
    'stroke-linecap': 'round',
    opacity: '0.45'
  });

  const needleGroup = h('g', { transform: 'rotate(200 ' + CX + ' ' + CY + ')' },
    h('line', { x1: CX - 16, y1: CY, x2: CX + 105, y2: CY, stroke: 'var(--accent)', 'stroke-width': 2.5, 'stroke-linecap': 'round' }),
    h('circle', { cx: CX - 14, cy: CY, r: 3.5, fill: 'var(--accent)' }),
    h('circle', { cx: CX + 109, cy: CY, r: 7.5, fill: 'var(--accent)', opacity: '0.24' }),
    h('circle', { cx: CX + 109, cy: CY, r: 4.5, fill: '#FFFDF9', stroke: 'var(--accent)', 'stroke-width': 2.4 })
  );

  /* Center Medallion & Animated Steaming Porcelain Cup Cutaway */
  const liquidPath = h('path', {
    d: 'M 139 140 Q 160 143.5 181 140 L 178.5 159 C 177.2 164.5 169.5 168 160 168 C 150.5 168 142.8 164.5 141.5 159 Z',
    fill: '#9C451C'
  });

  const wisp1 = h('path', {
    class: 'bt-gs-steam-anim is-w1',
    d: 'M 150 130 C 147 122 153 116 150 107',
    fill: 'none',
    stroke: 'var(--accent)',
    'stroke-width': 2,
    'stroke-linecap': 'round'
  });
  const wisp2 = h('path', {
    class: 'bt-gs-steam-anim is-w2',
    d: 'M 160 128 C 157 118 164 112 160 101',
    fill: 'none',
    stroke: 'var(--gold)',
    'stroke-width': 2.2,
    'stroke-linecap': 'round'
  });
  const wisp3 = h('path', {
    class: 'bt-gs-steam-anim is-w3',
    d: 'M 170 130 C 167 122 173 116 170 107',
    fill: 'none',
    stroke: 'var(--accent)',
    'stroke-width': 2,
    'stroke-linecap': 'round'
  });

  const centerCupCutaway = h('g', { 'aria-hidden': 'true' },
    h('circle', { cx: CX, cy: CY, r: 66, fill: 'url(#' + uid + '_plate)', stroke: 'var(--line)', 'stroke-width': 1.2 }),
    h('circle', { cx: CX, cy: CY, r: 60, fill: 'none', stroke: 'var(--line-soft)', 'stroke-width': 1, 'stroke-dasharray': '2 3' }),
    wisp1, wisp2, wisp3,
    /* Porcelain Cup Handle & Cutaway Body */
    h('path', { d: 'M 183 139 C 194 139 194 156 182 156', fill: 'none', stroke: 'var(--ink)', 'stroke-width': 2.4, 'stroke-linecap': 'round' }),
    h('path', {
      d: 'M 135 133 L 139 161 C 140.5 167.5 148.5 171.5 160 171.5 C 171.5 171.5 179.5 167.5 181 161 L 185 133 Z',
      fill: 'var(--surface)',
      stroke: 'var(--ink)',
      'stroke-width': 2.1,
      'stroke-linejoin': 'round'
    }),
    liquidPath,
    /* Crema Meniscus Highlight */
    h('path', { d: 'M 140 140 Q 160 143 180 140', fill: 'none', stroke: '#FAD398', 'stroke-width': 1.6, 'stroke-linecap': 'round' }),
    /* Saucer */
    h('line', { x1: 130, y1: 175.5, x2: 190, y2: 175.5, stroke: 'var(--edge)', 'stroke-width': 2.2, 'stroke-linecap': 'round' }),
    /* Center Pin Cap */
    h('circle', { cx: CX, cy: CY, r: 4.5, fill: 'var(--surface)', stroke: 'var(--accent)', 'stroke-width': 2 })
  );

  /* Tabular Sub-Register Window (6 o'clock Live Cooling Countdown Aperture) */
  const regMicroHeader = h('text', {
    x: CX, y: 202.5,
    'text-anchor': 'middle',
    fill: 'var(--ink-muted)',
    'font-size': 6.9,
    'font-weight': 800,
    'letter-spacing': '0.08em',
    text: 'COOLING TIMER'
  });
  const regCountdown = h('text', {
    x: CX, y: 219.5,
    'text-anchor': 'middle',
    fill: 'var(--ink)',
    'font-family': 'var(--font-mono)',
    'font-size': 17.5,
    'font-weight': 800,
    text: '02:00'
  });
  const regTempText = h('text', {
    x: CX, y: 235.5,
    'text-anchor': 'middle',
    fill: 'var(--ink-secondary)',
    'font-family': 'var(--font-mono)',
    'font-size': 10.6,
    'font-weight': 700,
    text: '76.0 °C · 169 °F'
  });
  const regZoneKicker = h('text', {
    x: CX, y: 260,
    'text-anchor': 'middle',
    fill: 'var(--accent)',
    'font-size': 9.0,
    'font-weight': 800,
    'letter-spacing': '0.06em',
    text: 'TOO HOT · COOLING DOWN'
  });

  const subRegister = h('g', null,
    h('rect', { x: 86, y: 192, width: 148, height: 50, rx: 10, fill: 'var(--surface)', stroke: 'var(--line)', 'stroke-width': 1.3 }),
    regMicroHeader,
    regCountdown,
    regTempText,
    regZoneKicker
  );

  const svgEl = h('svg', {
    class: 'bt-gs-svg',
    viewBox: '0 0 320 274',
    role: 'slider',
    tabindex: '0',
    'aria-label': 'Cup Cooling Countdown Timer: counts down live toward 60 degrees Celsius Peak Sweetness; drag bezel to preview temperatures',
    'aria-valuemin': T_MIN,
    'aria-valuemax': T_MAX
  },
    defs,
    bezelTicks,
    zoneArcs,
    cometWake,
    centerCupCutaway,
    needleGroup,
    subRegister
  );

  const stageTitleEl = h('div', { class: 'bt-gs-stage-title' });
  const stageSubEl = h('div', { class: 'bt-gs-stage-sub' });
  const lidAlertEl = h('div', { class: 'bt-r2-temp-bar is-warm', hidden: true });

  /* Live ~78 C Hot -> 60 C Sweet Sip Thermometer Readout Strip */
  const thermoNowEl = h('span', { class: 'mono', style: 'color:var(--ink);font-weight:800', text: '~76 °C Hot' });
  const thermoDotEl = h('span', { class: 'bt-gs-thermo-dot', style: 'left:18%' });
  const thermoGoalEl = h('span', { class: 'mono', style: 'color:var(--good);font-weight:800', text: '\u2192 60 °C Sweet Sip' });
  const thermoStripEl = h('div', { class: 'bt-gs-thermo-bar', 'aria-label': 'Cup cooling thermometer progress' },
    thermoNowEl,
    h('span', { class: 'bt-gs-thermo-track', 'aria-hidden': 'true' }, thermoDotEl),
    thermoGoalEl
  );

  /* Subtle Sweet Sip Badge (respects <= 1 Beanjamin per viewport rule!) */
  const zenBadge = h('span', { class: 'bt-gs-zen-badge', hidden: true, title: '60 °C Sweet Sip Ready!' });
  if (!cfg.hideZenMascot && typeof Beanjamin !== 'undefined' && Beanjamin && typeof Beanjamin.svg === 'function') {
    zenBadge.innerHTML = Beanjamin.svg('zen', { view: 'avatar', anim: true, label: 'Beanjamin Zen Sweet Sip' });
  } else {
    zenBadge.appendChild(BTIcons.el('spark-star', { size: 22 }));
  }

  const resetScrubBtn = h('button', {
    type: 'button',
    class: 'bt-chip',
    hidden: true,
    text: 'Back to Live Countdown',
    onclick: function() {
      scrubTempC = null;
      _hapticSnap();
      paint();
    }
  });

  const pauseCoolingBtnText = h('span', { text: clockRunning ? 'Pause' : 'Start' });
  const pauseCoolingBtn = h('button', {
    type: 'button',
    class: 'bt-chip',
    style: 'min-height:36px;padding:4px 11px;font-size:12px',
    onclick: function() {
      clockRunning = !clockRunning;
      if (clockRunning) {
        internalOriginMs = Date.now();
        internalStartTempC = liveState.tempC > 40 ? liveState.tempC : 78.0;
        manualOverrideUntilMs = Date.now() + 600000;
      }
      pauseCoolingBtnText.textContent = clockRunning ? 'Pause' : 'Resume';
      _hapticTick();
      paint();
    }
  }, BTIcons.el(clockRunning ? 'pause' : 'play', { size: 13 }), pauseCoolingBtnText);

  const startResetBtn = h('button', {
    type: 'button',
    class: 'bt-chip is-on',
    style: 'min-height:36px;padding:4px 12px;font-size:12px',
    onclick: function() {
      scrubTempC = null;
      clockRunning = true;
      internalStartTempC = isFinite(+cfg.resetTempC) ? +cfg.resetTempC : 78.0;
      internalOriginMs = Date.now();
      manualOverrideUntilMs = Date.now() + 600000;
      liveState.tempC = internalStartTempC;
      liveState.secsToGolden = Math.max(10, Math.round(Math.log((internalStartTempC - T_AMB) / (60.5 - T_AMB)) / K_COOL));
      liveState.countdownMmSs = _fmtMmSs(liveState.secsToGolden);
      liveState.zoneLabel = '';
      liveState.stageDetail = '';
      pauseCoolingBtnText.textContent = 'Pause';
      _hapticSnap();
      if (typeof cfg.onReset === 'function') {
        try { cfg.onReset(); } catch (e) {}
      }
      ensureInternalTicker();
      paint();
    }
  }, BTIcons.el('rotate-ccw', { size: 13 }), h('span', { text: 'Start / Reset Cooling Clock' }));

  const gsExplainer = BTExplainerPill({
    title: 'Cup Cooling Countdown Timer (60 °C Sweet Sip)',
    what: 'Counts down in real time from freshly brewed (~78 °C / 172 °F) into the 62–55 °C (144–131 °F) Sweet Sip window where natural sweetness opens up.',
    how: 'Tap Start / Reset Cooling Clock right after pouring, or drag around the dial ring to preview how flavor changes as your coffee cools.',
    tip: 'Insulated travel mugs trap >65 °C heat for 20+ min — pop the lid off right after brewing to reach 60 °C 3× faster!'
  });

  const root = h('div', { class: 'bt-gs-clock', 'data-bt-cooling-clock': '1' },
    h('div', { class: 'bt-control-topbar' },
      h('div', { style: 'display:flex;align-items:center;gap:8px;font-weight:700;font-size:0.92rem' },
        BTIcons.el('thermometer', { size: 18 }),
        h('span', { text: cfg.title || 'Cup Cooling Timer · Sweetest at 60 °C (140 °F)' })
      ),
      h('div', { style: 'display:flex;align-items:center;gap:6px;flex-wrap:wrap' }, resetScrubBtn, gsExplainer.btn)
    ),
    gsExplainer.panel,
    thermoStripEl,
    h('div', { class: 'bt-gs-dial-stage' }, svgEl),
    h('div', { class: 'bt-gs-ctrl-row' }, startResetBtn, pauseCoolingBtn),
    h('div', { class: 'bt-gs-subdeck' },
      zenBadge,
      h('div', { class: 'bt-gs-stage-copy' }, stageTitleEl, stageSubEl)
    ),
    lidAlertEl
  );

  /* Self-disposing 1-second live Newton cooling ticker when standalone or manually reset */
  let internalTickId = 0;
  function stepInternalNewton() {
    if (typeof document === 'undefined') return;
    if (root.parentNode == null && root.isConnected === false) {
      if (internalTickId) { clearInterval(internalTickId); internalTickId = 0; }
      return;
    }
    if (!clockRunning || scrubTempC != null) return;
    const now = Date.now();
    if (now > manualOverrideUntilMs && (now - lastExternalUpdateMs) < 1600) return;

    const dtSec = Math.max(0, (now - internalOriginMs) / 1000);
    const nextT = T_AMB + (internalStartTempC - T_AMB) * Math.exp(-K_COOL * dtSec);
    liveState.tempC = +_clamp(nextT, T_MIN, T_MAX).toFixed(1);
    if (liveState.tempC > 60.5) {
      liveState.secsToGolden = Math.max(0, Math.round(Math.log((liveState.tempC - T_AMB) / (60.5 - T_AMB)) / K_COOL));
    } else {
      liveState.secsToGolden = 0;
    }
    liveState.countdownMmSs = _fmtMmSs(liveState.secsToGolden);
    paint();
  }

  function ensureInternalTicker() {
    if (internalTickId || typeof setInterval !== 'function') return;
    /* Guard headless/unit environments where document.body isn't ticking forever */
    internalTickId = setInterval(stepInternalNewton, 1000);
  }
  if (typeof window !== 'undefined' && typeof document !== 'undefined' && document.body) {
    ensureInternalTicker();
  }

  /* Cache last painted strings to ensure zero DOM thrash on 60fps/1Hz updates */
  let lastCountdownStr = '';
  let lastTempStr = '';
  let lastKickerStr = '';

  function paint() {
    const isScrub = scrubTempC != null;
    const effTemp = isScrub ? scrubTempC : liveState.tempC;
    const ev = _evalGoldenSipForTemp(effTemp, isScrub ? null : liveState.secsToGolden);
    const deg = degForTemp(ev.tempC);

    root.classList.toggle('is-golden', ev.inGoldenSip);
    root.classList.toggle('is-scrubbing', isScrub);
    resetScrubBtn.hidden = !isScrub;
    zenBadge.hidden = !ev.inGoldenSip;

    needleGroup.setAttribute('transform', 'rotate(' + deg.toFixed(2) + ' ' + CX + ' ' + CY + ')');
    cometWake.setAttribute('d', _horoArc(CX, CY, R_ARC, Math.max(START_DEG, deg - 24), deg));
    cometWake.setAttribute('stroke', ev.inGoldenSip ? 'var(--good)' : 'var(--accent)');
    liquidPath.setAttribute('fill', ev.liquidColor);

    /* Update ~78 C Hot -> 60 C Sweet Sip thermometer strip */
    const progPct = Math.round(_clamp((82 - ev.tempC) / (82 - 44), 0.03, 0.97) * 100);
    thermoDotEl.style.left = progPct + '%';
    thermoNowEl.textContent = '~' + Math.round(ev.tempC) + ' °C (' + ev.tempF + ' °F) ' + (ev.zone === 'hot' ? 'Hot' : (ev.inGoldenSip ? 'Sweet!' : 'Warm'));
    thermoGoalEl.textContent = ev.inGoldenSip ? 'At 60 °C Peak!' : '\u2192 60 °C Sweet Sip';

    /* Physically calm steam wisps as cup cools (84 C -> vigorous 0.92, 42 C -> gentle 0.10) */
    const steamAmt = _clamp((ev.tempC - 39) / 39, 0.08, 0.94);
    const sw = (1.1 + steamAmt * 1.25).toFixed(2);
    [wisp1, wisp2, wisp3].forEach(function(w, idx) {
      const factor = idx === 1 ? 1.0 : 0.82;
      w.setAttribute('opacity', (steamAmt * factor).toFixed(2));
      w.setAttribute('stroke-width', sw);
    });

    const mmSs = (!isScrub && liveState.countdownMmSs)
      ? liveState.countdownMmSs
      : _fmtMmSs(ev.secsToGolden);
    const nextCd = isScrub
      ? ('PREVIEW ' + ev.tempC.toFixed(1) + '°')
      : (ev.inGoldenSip ? '00:00 · SIP!' : (ev.secsToGolden > 0 ? mmSs : '60°C READY'));
    if (nextCd !== lastCountdownStr) {
      lastCountdownStr = nextCd;
      regCountdown.textContent = nextCd;
      regCountdown.setAttribute('fill', ev.inGoldenSip ? 'var(--good)' : 'var(--ink)');
    }

    const nextTmp = ev.tempC.toFixed(1) + ' °C · ' + ev.tempF + ' °F';
    if (nextTmp !== lastTempStr) {
      lastTempStr = nextTmp;
      regTempText.textContent = nextTmp;
    }

    const nextKick = isScrub ? ('PREVIEW · ' + ev.kicker) : (!clockRunning ? ('PAUSED · ' + ev.kicker) : ev.kicker);
    if (nextKick !== lastKickerStr) {
      lastKickerStr = nextKick;
      regZoneKicker.textContent = nextKick;
      regZoneKicker.setAttribute('fill', ev.inGoldenSip ? 'var(--good)' : (ev.zone === 'hot' ? 'var(--accent)' : 'var(--science)'));
    }

    stageTitleEl.textContent = (!isScrub && liveState.zoneLabel) ? liveState.zoneLabel : ev.title;
    stageSubEl.textContent = (!isScrub && liveState.stageDetail) ? liveState.stageDetail : ev.sub;

    if (liveState.lidTip) {
      lidAlertEl.hidden = false;
      lidAlertEl.textContent = liveState.lidTip;
    } else {
      lidAlertEl.hidden = true;
    }

    svgEl.setAttribute('aria-valuenow', String(ev.tempC));
    svgEl.setAttribute('aria-valuetext', ev.tempC.toFixed(1) + ' °C (' + ev.tempF + ' °F) — ' + ev.title);
  }

  function scrubAtClient(e) {
    const rect = svgEl.getBoundingClientRect();
    const sx = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 320;
    const sy = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 274;
    let rawDeg = (Math.atan2(sy - CY, sx - CX) * 180) / Math.PI;
    if (rawDeg < 90) rawDeg += 360; /* Map [-180..90) into [180..450) continuous with [135..405] */
    if (rawDeg < 115 || rawDeg > 425) return;
    const clampedDeg = _clamp(rawDeg, START_DEG, START_DEG + SPAN_DEG);
    const nextT = tempForDeg(clampedDeg);
    const prevZone = _evalGoldenSipForTemp(scrubTempC != null ? scrubTempC : liveState.tempC).zone;
    const nextZone = _evalGoldenSipForTemp(nextT).zone;
    scrubTempC = nextT;
    if (prevZone !== nextZone) {
      if (nextZone === 'golden') _hapticSweetSpot(); else _hapticTick();
    }
    paint();
    if (typeof cfg.onScrub === 'function') cfg.onScrub(scrubTempC);
  }

  let scrubbing = false;
  svgEl.addEventListener('pointerdown', function(e) {
    if (e.button && e.button !== 0) return;
    scrubbing = true;
    try { svgEl.setPointerCapture(e.pointerId); } catch (err) {}
    scrubAtClient(e);
  });
  svgEl.addEventListener('pointermove', function(e) {
    if (scrubbing) scrubAtClient(e);
  });
  ['pointerup', 'pointercancel'].forEach(function(evName) {
    svgEl.addEventListener(evName, function() { scrubbing = false; });
  });

  svgEl.addEventListener('keydown', function(e) {
    const cur = scrubTempC != null ? scrubTempC : liveState.tempC;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault(); scrubTempC = _clamp(+(cur - 1.0).toFixed(1), T_MIN, T_MAX); _hapticTick(); paint();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault(); scrubTempC = _clamp(+(cur + 1.0).toFixed(1), T_MIN, T_MAX); _hapticTick(); paint();
    } else if (e.key === 'Escape') {
      scrubTempC = null; paint();
    }
  });

  root.update = function(next) {
    if (!next || typeof next !== 'object') return;
    lastExternalUpdateMs = Date.now();
    if (Date.now() < manualOverrideUntilMs && !next.force) {
      if (typeof next.lidTip === 'string') liveState.lidTip = next.lidTip;
      paint();
      return;
    }
    if (next.tempC != null && isFinite(+next.tempC)) liveState.tempC = +next.tempC;
    if (next.secsToGolden != null && isFinite(+next.secsToGolden)) liveState.secsToGolden = +next.secsToGolden;
    else if (next.secondsToGoldenSip != null && isFinite(+next.secondsToGoldenSip)) liveState.secsToGolden = +next.secondsToGoldenSip;
    else if (next.etaSec != null && isFinite(+next.etaSec)) liveState.secsToGolden = +next.etaSec;
    if (typeof next.countdownMmSs === 'string') liveState.countdownMmSs = next.countdownMmSs;
    if (typeof next.zoneLabel === 'string') liveState.zoneLabel = next.zoneLabel;
    else if (typeof next.stageLabel === 'string') liveState.zoneLabel = next.stageLabel;
    if (typeof next.stageDetail === 'string') liveState.stageDetail = next.stageDetail;
    if (typeof next.lidTip === 'string') liveState.lidTip = next.lidTip;
    paint();
  };
  root.resetClock = function(startTC) {
    scrubTempC = null;
    clockRunning = true;
    internalStartTempC = isFinite(+startTC) ? +startTC : 78.0;
    internalOriginMs = Date.now();
    manualOverrideUntilMs = Date.now() + 600000;
    liveState.tempC = internalStartTempC;
    liveState.secsToGolden = Math.max(10, Math.round(Math.log((internalStartTempC - T_AMB) / (60.5 - T_AMB)) / K_COOL));
    liveState.countdownMmSs = _fmtMmSs(liveState.secsToGolden);
    pauseCoolingBtnText.textContent = 'Pause';
    ensureInternalTicker();
    paint();
  };
  root.clearScrub = function() { scrubTempC = null; paint(); };
  root.dispose = root.destroy = function() {
    clockRunning = false;
    if (internalTickId) {
      clearInterval(internalTickId);
      internalTickId = 0;
    }
  };
  root.getState = function() {
    const effT = scrubTempC != null ? scrubTempC : liveState.tempC;
    return Object.assign({ scrubbing: scrubTempC != null, running: clockRunning }, _evalGoldenSipForTemp(effT, liveState.secsToGolden));
  };

  paint();
  return root;
}

/* ==================== 10. BTChronoDial (Clean 60-Tick Dual-Comet Horological Chronograph — #173) ==================== */
function _cleanChronoLabel(raw, idx) {
  const s = String(raw || '').trim();
  const low = s.toLowerCase();
  if (!s || /sw[e]{2}t[\s-]+p[u]lse/i.test(s) || low === 'pulse 1') return 'Main Pour';
  if (low === 'pulse 2') return 'Final Pour';
  if (low === 'bloom') return 'Wet Grounds (Bloom)';
  return s || ('Step ' + (idx + 1));
}

function _normalizeChronoPhases(rawPhases, totalS, mode) {
  const tot = Math.max(5, +totalS || 180);
  const palette = ['#F5B041', '#E8844A', '#26A669', '#4BA3C7', '#B67856'];

  if (Array.isArray(rawPhases) && rawPhases.length > 0) {
    const out = [];
    for (let i = 0; i < rawPhases.length; i++) {
      const p = rawPhases[i] || {};
      const s0 = p.startS != null ? +p.startS : (p.t != null ? +p.t : (i / rawPhases.length) * tot);
      const nextP = rawPhases[i + 1];
      const s1 = p.endS != null ? +p.endS : (nextP && nextP.t != null ? +nextP.t : tot);
      out.push({
        label: _cleanChronoLabel(p.label || p.title, i),
        startS: Math.max(0, s0),
        endS: Math.max(s0 + 1, s1),
        waterG: p.waterG != null ? +p.waterG : null,
        color: p.color || palette[i % palette.length]
      });
    }
    return out;
  }

  if (mode === 'salami') {
    const third = tot / 3;
    return [
      { label: 'Glass #1 · Early Acids', startS: 0,         endS: third,     color: '#F5B041' },
      { label: 'Glass #2 · Mid Sugars',  startS: third,     endS: third * 2, color: '#E8844A' },
      { label: 'Glass #3 · Late Finish', startS: third * 2, endS: tot,       color: '#9C5C3E' }
    ];
  }
  if (mode === 'cupping') {
    return [
      { label: 'Fragrance & Steep',  startS: 0,   endS: Math.min(240, tot * 0.25), color: '#F5B041' },
      { label: '4:00 Break Crust',   startS: Math.min(240, tot * 0.25), endS: Math.min(480, tot * 0.5), color: '#E8844A' },
      { label: 'Round 1 · 70 °C',    startS: Math.min(480, tot * 0.5),  endS: Math.min(720, tot * 0.75), color: '#26A669' },
      { label: 'Golden Sip · 55 °C', startS: Math.min(720, tot * 0.75), endS: tot, color: '#4BA3C7' }
    ];
  }
  return [
    { label: 'Wet Grounds (Bloom)', startS: 0,          endS: tot * 0.24, color: '#F5B041' },
    { label: 'Main Pour',           startS: tot * 0.24, endS: tot * 0.54, color: '#E8844A' },
    { label: 'Final Pour',          startS: tot * 0.54, endS: tot * 0.78, color: '#26A669' },
    { label: 'Drawdown',            startS: tot * 0.78, endS: tot,        color: '#4BA3C7' }
  ];
}

function _compactChronoFlowLabel(raw) {
  const s = String(raw || '').trim();
  if (!s || s.length <= 15) return s;
  if (s.indexOf('·') >= 0) {
    const parts = s.split('·');
    const left = parts[0].trim();
    const right = (parts[1] || '').trim();
    if (/^(?:sim\s+)?0(?:\.0)?\s*g\/s$/i.test(left) && right) {
      if (/overtime/i.test(right) || /drain/i.test(right)) return '0.0 g/s · Drain';
      if (/stop/i.test(right) || /done/i.test(right)) return '0.0 g/s · Done';
      if (/bloom/i.test(right) || /rest/i.test(right)) return '0.0 g/s · Rest';
      return right.length <= 15 ? right : right.slice(0, 14).trim();
    }
    if (left.length <= 15) return left;
  }
  return s.slice(0, 15).trim();
}

function BTChronoDial(cfg) {
  cfg = cfg || {};
  const uid = _tUid('bt_chr');
  const CX = 160, CY = 160;
  const isCockpit = cfg.skin === 'cockpit' || cfg.theme === 'cockpit' || !!cfg.cockpit;
  const customSize = (typeof cfg.size === 'number' && cfg.size >= 128 && cfg.size <= 460) ? Math.round(cfg.size) : 0;
  const isCompact = !!cfg.compact || (customSize > 0 && customSize <= 264);
  const mode = String(cfg.mode || 'brew').toLowerCase(); /* 'brew' | 'salami' | 'cupping' */
  const showTenths = cfg.showTenths !== false;

  const initFlow = cfg.flowRateGs != null ? +cfg.flowRateGs : (cfg.flowGs != null ? +cfg.flowGs : 0);
  const initFlowLbl = typeof cfg.flowLabel === 'string' && cfg.flowLabel
    ? cfg.flowLabel
    : (typeof cfg.tachLabel === 'string' ? cfg.tachLabel : '');

  let st = {
    elapsedS: Math.max(0, +cfg.elapsedS || 0),
    totalTargetS: Math.max(5, +cfg.totalTargetS || +cfg.targetS || (mode === 'salami' ? 165 : (mode === 'cupping' ? 960 : 180))),
    liveWeightG: cfg.liveWeightG != null ? +cfg.liveWeightG : null,
    targetWaterG: Math.max(10, +cfg.targetWaterG || +cfg.waterG || 250),
    ghostWeightG: cfg.ghostWeightG != null ? +cfg.ghostWeightG : null,
    flowGs: Math.max(0, isFinite(initFlow) ? initFlow : 0),
    flowExplicit: cfg.flowRateGs != null || cfg.flowGs != null,
    maxFlowGs: Math.max(2, +cfg.maxFlowGs || (cfg.isEspresso ? 4.0 : 8.0)),
    pressureBar: Math.max(0, +cfg.pressureBar || 0),
    phaseLabel: cfg.phaseLabel || '',
    subLabel: cfg.subLabel || '',
    tachLabel: initFlowLbl,
    waves: Object.assign({ thetaA: 0, thetaS: 0, thetaB: 0 }, cfg.waves || cfg.waveState || {})
  };

  const phases = _normalizeChronoPhases(cfg.phases || cfg.steps, st.totalTargetS, mode);

  const inkMain = isCockpit ? '#F5EDE4' : 'var(--ink)';
  const inkSub = isCockpit ? '#C8B6A6' : 'var(--ink-secondary)';
  const trackStroke = isCockpit ? 'rgba(255,255,255,0.10)' : 'var(--track)';
  const tickMinor = isCockpit ? 'rgba(245,237,228,0.34)' : 'var(--edge)';
  const tickMajor = isCockpit ? '#F0A35E' : 'var(--accent)';
  const ghostCol = isCockpit ? '#7CE8FF' : 'var(--science)';
  const overtimeCol = isCockpit ? '#FBBF24' : 'var(--chrono-overtime, #D98B26)';
  const timeStopA = isCockpit ? '#FAD398' : 'var(--chrono-time-a, #D67A38)';
  const timeStopB = isCockpit ? '#E8844A' : 'var(--accent)';
  const weightStopA = isCockpit ? '#7CF2BE' : 'var(--chrono-weight-a, #2A7B56)';
  const weightStopB = isCockpit ? '#21A166' : 'var(--primary)';

  const defs = h('defs', null,
    h('radialGradient', { id: uid + '_face', cx: '0.5', cy: '0.45', r: '0.55' },
      h('stop', { offset: '0%', 'stop-color': isCockpit ? '#241C18' : 'var(--surface)' }),
      h('stop', { offset: '100%', 'stop-color': isCockpit ? '#120E0C' : 'var(--well)' })
    ),
    h('linearGradient', { id: uid + '_tcomet', x1: '0', y1: '0', x2: '1', y2: '1' },
      h('stop', { offset: '0%', 'stop-color': timeStopA }),
      h('stop', { offset: '100%', 'stop-color': timeStopB })
    ),
    h('linearGradient', { id: uid + '_wcomet', x1: '0', y1: '0', x2: '1', y2: '1' },
      h('stop', { offset: '0%', 'stop-color': weightStopA }),
      h('stop', { offset: '100%', 'stop-color': weightStopB })
    )
  );

  /* 1. Outer 60-Tick Horological Seconds / Tachymeter Bezel */
  const bezelGroup = h('g', { 'aria-hidden': 'true' },
    h('circle', { cx: CX, cy: CY, r: 154, fill: 'url(#' + uid + '_face)', stroke: isCockpit ? 'rgba(240,163,94,0.28)' : 'var(--line)', 'stroke-width': 1.5 })
  );
  for (let i = 0; i < 60; i++) {
    const deg = -90 + i * 6;
    const isMaj = i % 5 === 0;
    const p1 = _horoPolar(CX, CY, isMaj ? 141 : 146, deg);
    const p2 = _horoPolar(CX, CY, 151.5, deg);
    bezelGroup.appendChild(h('line', {
      x1: p1[0], y1: p1[1], x2: p2[0], y2: p2[1],
      stroke: isMaj ? tickMajor : tickMinor,
      'stroke-width': isMaj ? 2.1 : 1.0,
      'stroke-linecap': 'round'
    }));
  }

  /* 2. Perimeter Phase-Arc Sectors (r = 133) */
  const R_SECTOR = 133;
  const sectorNodes = [];
  const sectorGroup = h('g', { 'aria-hidden': 'true' });
  phases.forEach(function(ph) {
    const d0 = -90 + (ph.startS / st.totalTargetS) * 360 + 1.4;
    const d1 = -90 + (ph.endS / st.totalTargetS) * 360 - 1.4;
    if (d1 > d0) {
      const pathNode = h('path', {
        d: _horoArc(CX, CY, R_SECTOR, d0, d1),
        fill: 'none',
        stroke: ph.color,
        'stroke-width': 5,
        'stroke-linecap': 'round',
        opacity: '0.36'
      });
      sectorGroup.appendChild(pathNode);
      sectorNodes.push({ meta: ph, node: pathNode, active: false });
    }
  });

  /* 3. Outer Time Comet Sweep + Amber Overtime Ring (r = 120) */
  const R_TIME = 120;
  const C_TIME = +(2 * Math.PI * R_TIME).toFixed(2);
  const timeArc = h('circle', {
    cx: CX, cy: CY, r: R_TIME,
    fill: 'none',
    stroke: 'url(#' + uid + '_tcomet)',
    'stroke-width': 7.5,
    'stroke-linecap': 'round',
    'stroke-dasharray': String(C_TIME),
    'stroke-dashoffset': String(C_TIME),
    transform: 'rotate(-90 ' + CX + ' ' + CY + ')'
  });
  const overtimeArc = h('circle', {
    cx: CX, cy: CY, r: R_TIME,
    fill: 'none',
    stroke: overtimeCol,
    'stroke-width': 8.2,
    'stroke-linecap': 'round',
    'stroke-dasharray': String(C_TIME),
    'stroke-dashoffset': String(C_TIME),
    transform: 'rotate(-90 ' + CX + ' ' + CY + ')',
    hidden: true
  });
  const timeCometOrb = h('g', { transform: 'rotate(0 ' + CX + ' ' + CY + ')' },
    h('circle', { cx: CX, cy: CY - R_TIME, r: 8.5, fill: timeStopB, opacity: '0.26' }),
    h('circle', { cx: CX, cy: CY - R_TIME, r: 4.5, fill: '#FFFDF9', stroke: timeStopB, 'stroke-width': 2.2 })
  );

  /* 4. Inner Live Weight / Stage Comet + Glowing Ghost-Pacer Target Dot (r = 104) */
  const R_WEIGHT = 104;
  const C_WEIGHT = +(2 * Math.PI * R_WEIGHT).toFixed(2);
  const weightArc = h('circle', {
    cx: CX, cy: CY, r: R_WEIGHT,
    fill: 'none',
    stroke: 'url(#' + uid + '_wcomet)',
    'stroke-width': 7,
    'stroke-linecap': 'round',
    'stroke-dasharray': String(C_WEIGHT),
    'stroke-dashoffset': String(C_WEIGHT),
    transform: 'rotate(-90 ' + CX + ' ' + CY + ')'
  });
  const ghostPacerOrb = h('g', { transform: 'rotate(0 ' + CX + ' ' + CY + ')' },
    h('circle', { cx: CX, cy: CY - R_WEIGHT, r: 7.5, fill: 'none', stroke: ghostCol, 'stroke-width': 1.7, 'stroke-dasharray': '2 2' }),
    h('polygon', { points: CX + ',' + (CY - R_WEIGHT - 4.8) + ' ' + (CX + 4.8) + ',' + (CY - R_WEIGHT) + ' ' + CX + ',' + (CY - R_WEIGHT + 4.8) + ' ' + (CX - 4.8) + ',' + (CY - R_WEIGHT), fill: ghostCol })
  );
  const weightCometOrb = h('g', { transform: 'rotate(0 ' + CX + ' ' + CY + ')' },
    h('circle', { cx: CX, cy: CY - R_WEIGHT, r: 8, fill: weightStopB, opacity: '0.26' }),
    h('circle', { cx: CX, cy: CY - R_WEIGHT, r: 4.3, fill: '#FFFDF9', stroke: weightStopB, 'stroke-width': 2.2 })
  );

  /* 5. Animated 3-Wave Liquid Crema Ring (Acids / Sugars / Bitters, r = 89) */
  const R_WAVE = 89;
  const WAVE_SPAN_DEG = 108;
  const WAVE_ARC_LEN = +((WAVE_SPAN_DEG / 360) * 2 * Math.PI * R_WAVE).toFixed(2);
  function makeWaveSector(startD, color) {
    const bg = h('path', { d: _horoArc(CX, CY, R_WAVE, startD, startD + WAVE_SPAN_DEG), fill: 'none', stroke: trackStroke, 'stroke-width': 4.2, 'stroke-linecap': 'round' });
    const fg = h('path', {
      d: _horoArc(CX, CY, R_WAVE, startD, startD + WAVE_SPAN_DEG),
      fill: 'none',
      stroke: color,
      'stroke-width': 4.4,
      'stroke-linecap': 'round',
      'stroke-dasharray': WAVE_ARC_LEN + ' ' + (WAVE_ARC_LEN + 20),
      'stroke-dashoffset': String(WAVE_ARC_LEN)
    });
    return { bg: bg, fg: fg };
  }
  const waveA = makeWaveSector(-84, isCockpit ? '#F5B041' : 'var(--wave-acid, #D98B26)');
  const waveS = makeWaveSector(36, isCockpit ? '#E8844A' : 'var(--wave-sweet, #B84A14)');
  const waveB = makeWaveSector(156, isCockpit ? '#F07167' : 'var(--wave-bitter, #9E211D)');

  /* 6. 6 o'clock Sub-Dial Flow Rate (g/s) Tachometer (cx = 160, cy = 208, r = 26) */
  const TCX = 160, TCY = 208, TR = 26;
  const tachSweet = h('path', {
    d: _horoArc(TCX, TCY, TR, -145, -35),
    fill: 'none',
    stroke: isCockpit ? '#26A669' : 'var(--good)',
    'stroke-width': 4,
    'stroke-linecap': 'round',
    opacity: '0.45'
  });
  const tachTrack = h('path', {
    d: _horoArc(TCX, TCY, TR, -195, 15),
    fill: 'none',
    stroke: trackStroke,
    'stroke-width': 3.5,
    'stroke-linecap': 'round'
  });
  const tachLiveArc = h('path', {
    d: '',
    fill: 'none',
    stroke: ghostCol,
    'stroke-width': 4.2,
    'stroke-linecap': 'round'
  });
  const tachNeedle = h('g', { transform: 'rotate(-195 ' + TCX + ' ' + TCY + ')' },
    h('line', { x1: TCX, y1: TCY, x2: TCX + TR - 3, y2: TCY, stroke: ghostCol, 'stroke-width': 2.1, 'stroke-linecap': 'round' }),
    h('circle', { cx: TCX, cy: TCY, r: 2.8, fill: ghostCol })
  );
  const tachText = h('text', {
    x: TCX, y: TCY + 16,
    'text-anchor': 'middle',
    fill: inkSub,
    'font-family': 'var(--font-mono)',
    'font-size': 11.8,
    'font-weight': 800,
    text: '0.0 g/s'
  });

  /* 7. Mechanical 60s Sweep Second Hand */
  const sweepSecHand = h('g', { transform: 'rotate(0 ' + CX + ' ' + CY + ')', opacity: '0.55' },
    h('line', { x1: CX, y1: CY + 14, x2: CX, y2: CY - 137, stroke: tickMajor, 'stroke-width': 1.1, 'stroke-linecap': 'round' }),
    h('circle', { cx: CX, cy: CY, r: 2.8, fill: tickMajor })
  );

  /* 8. Center Chronograph Typography Register (00:00.0 — Enlarged High-Contrast Readout) */
  const phaseKickerEl = h('text', {
    x: CX, y: 100,
    'text-anchor': 'middle',
    fill: tickMajor,
    'font-size': 11.2,
    'font-weight': 800,
    'letter-spacing': '0.05em',
    text: 'READY'
  });
  const digitsMainEl = h('text', {
    x: CX, y: 139,
    'text-anchor': 'middle',
    fill: inkMain,
    'font-family': 'var(--font-mono)',
    'font-size': 37,
    'font-weight': 800,
    'letter-spacing': '-0.02em',
    text: showTenths ? '00:00.0' : '00:00'
  });
  const subReadoutEl = h('text', {
    x: CX, y: 163,
    'text-anchor': 'middle',
    fill: inkSub,
    'font-family': 'var(--font-mono)',
    'font-size': 14.0,
    'font-weight': 700,
    text: '0.0 / ' + st.targetWaterG + ' g'
  });

  const svgEl = h('svg', {
    class: 'bt-chrono-svg',
    viewBox: '0 0 320 320',
    role: 'img',
    'aria-label': 'BeanTelligence 60-Tick Dual-Comet Horological Brew Chronograph'
  },
    defs,
    bezelGroup,
    sectorGroup,
    h('circle', { cx: CX, cy: CY, r: R_TIME, fill: 'none', stroke: trackStroke, 'stroke-width': 7.5 }),
    timeArc,
    overtimeArc,
    h('circle', { cx: CX, cy: CY, r: R_WEIGHT, fill: 'none', stroke: trackStroke, 'stroke-width': 7 }),
    weightArc,
    ghostPacerOrb,
    weightCometOrb,
    timeCometOrb,
    waveA.bg, waveA.fg,
    waveS.bg, waveS.fg,
    waveB.bg, waveB.fg,
    tachTrack, tachSweet, tachLiveArc, tachNeedle, tachText,
    sweepSecHand,
    phaseKickerEl,
    digitsMainEl,
    subReadoutEl
  );

  const legendEl = h('div', { class: 'bt-chrono-legend' },
    h('span', { class: 'bt-chrono-leg-item' }, h('i', { class: 'bt-chrono-swatch', style: 'background:var(--accent)' }), 'Time'),
    h('span', { class: 'bt-chrono-leg-item' }, h('i', { class: 'bt-chrono-swatch', style: 'background:var(--primary)' }), mode === 'brew' ? 'Weight' : 'Stage'),
    h('span', { class: 'bt-chrono-leg-item' }, h('i', { class: 'bt-chrono-swatch is-ghost' }), 'Pacer'),
    h('span', { class: 'bt-chrono-leg-item' }, h('i', { class: 'bt-chrono-swatch', style: 'background:var(--wave-acid, #D98B26)' }), '3-Wave')
  );

  const stageProps = { class: 'bt-chrono-stage' };
  const effStagePx = customSize > 0 ? customSize : (isCompact ? 250 : 0);
  if (effStagePx > 0) {
    stageProps.style = { width: 'min(' + effStagePx + 'px, 100%)', maxWidth: effStagePx + 'px', height: effStagePx + 'px' };
  }

  const root = h('div', {
    class: 'bt-chrono' + (isCockpit ? ' is-cockpit' : '') + (isCompact ? ' is-compact' : '')
  },
    h('div', stageProps, svgEl),
    cfg.hideLegend ? null : legendEl
  );

  /* Cached primitive strings for zero-DOM-thrash 60fps updates */
  let cDigits = '';
  let cPhase = '';
  let cSub = '';
  let cTach = '';

  function formatChronoTime(sec) {
    const s = Math.max(0, +sec || 0);
    const whole = Math.floor(s);
    const mm = Math.floor(whole / 60);
    const ss = whole % 60;
    const base = (mm < 10 ? '0' + mm : String(mm)) + ':' + (ss < 10 ? '0' + ss : String(ss));
    if (!showTenths) return base;
    const tenth = Math.floor((s - whole) * 10) % 10;
    return base + '.' + tenth;
  }

  function computeGhostFrac(elS) {
    if (st.ghostWeightG != null && isFinite(st.ghostWeightG) && st.targetWaterG > 0) {
      return _clamp(st.ghostWeightG / st.targetWaterG, 0, 1);
    }
    if (mode !== 'brew') {
      for (let i = 0; i < phases.length; i++) {
        const p = phases[i];
        if (elS >= p.startS && elS <= p.endS) {
          return _clamp((elS - p.startS) / Math.max(1, p.endS - p.startS), 0, 1);
        }
      }
      return _clamp(elS / st.totalTargetS, 0, 1);
    }
    const pourEndS = Math.max(10, st.totalTargetS * 0.74);
    return _clamp(elS / pourEndS, 0, 1);
  }

  /* Derive target flow rate from active pour phase when no live scale rate or label was supplied */
  function deriveAutoFlow(elS) {
    if (mode !== 'brew' || elS <= 0) return { gs: 0, label: '0.0 g/s' };
    if (elS > st.totalTargetS) return { gs: 0, label: 'Draining' };
    let prevW = 0;
    for (let i = 0; i < phases.length; i++) {
      const p = phases[i];
      const endW = p.waterG != null && isFinite(p.waterG) ? +p.waterG : ((i + 1) / phases.length) * st.targetWaterG;
      if (elS >= p.startS && (elS < p.endS || i === phases.length - 1)) {
        const dW = Math.max(0, endW - prevW);
        const dur = Math.max(1, p.endS - p.startS);
        const lowLbl = String(p.label || '').toLowerCase();
        if (lowLbl.indexOf('drawdown') >= 0 || lowLbl.indexOf('drain') >= 0 || lowLbl.indexOf('swirl') >= 0 || lowLbl.indexOf('steep') >= 0 || lowLbl.indexOf('wait') >= 0) {
          return { gs: 0, label: lowLbl.indexOf('bloom') >= 0 ? 'Bloom Rest' : 'Draining' };
        }
        if (dW > 2) {
          /* Active pouring portion of step (~first 70% of step window if bloom, else full step) */
          const isBloom = i === 0 && dur >= 25;
          const pourWin = isBloom ? Math.min(15, dur * 0.45) : dur;
          if (isBloom && (elS - p.startS) > pourWin) {
            return { gs: 0, label: 'Bloom Rest' };
          }
          const rate = _clamp(dW / Math.max(4, pourWin), 0.5, st.maxFlowGs);
          return { gs: rate, label: rate.toFixed(1) + ' g/s target' };
        }
        return { gs: 0, label: i === 0 ? 'Bloom Rest' : 'Draining' };
      }
      prevW = Math.max(prevW, endW);
    }
    return { gs: 0, label: 'Draining' };
  }

  function paint() {
    const tot = Math.max(1, st.totalTargetS);
    const isOvertime = st.elapsedS > (tot + 0.05);
    const overSec = isOvertime ? (st.elapsedS - tot) : 0;
    const tFrac = _clamp(st.elapsedS / tot, 0, 1);
    const ghostFrac = computeGhostFrac(st.elapsedS);
    const hasLiveW = st.liveWeightG != null && isFinite(st.liveWeightG);
    const wVal = hasLiveW ? Math.max(0, st.liveWeightG) : (mode === 'brew' ? ghostFrac * st.targetWaterG : 0);
    const wFrac = mode === 'brew'
      ? _clamp(wVal / Math.max(1, st.targetWaterG), 0, 1)
      : ghostFrac;

    root.classList.toggle('is-overtime', isOvertime);
    timeArc.setAttribute('stroke-dashoffset', (C_TIME * (1 - tFrac)).toFixed(2));

    if (isOvertime) {
      overtimeArc.hidden = false;
      const overLapFrac = _clamp((overSec % 60) / 60, 0.04, 1);
      overtimeArc.setAttribute('stroke-dashoffset', (C_TIME * (1 - overLapFrac)).toFixed(2));
      timeCometOrb.setAttribute('transform', 'rotate(' + (overLapFrac * 360).toFixed(2) + ' ' + CX + ' ' + CY + ')');
    } else {
      overtimeArc.hidden = true;
      timeCometOrb.setAttribute('transform', 'rotate(' + (tFrac * 360).toFixed(2) + ' ' + CX + ' ' + CY + ')');
    }

    sweepSecHand.setAttribute('transform', 'rotate(' + (((st.elapsedS % 60) / 60) * 360).toFixed(2) + ' ' + CX + ' ' + CY + ')');

    weightArc.setAttribute('stroke-dashoffset', (C_WEIGHT * (1 - wFrac)).toFixed(2));
    weightCometOrb.setAttribute('transform', 'rotate(' + (wFrac * 360).toFixed(2) + ' ' + CX + ' ' + CY + ')');
    ghostPacerOrb.setAttribute('transform', 'rotate(' + (ghostFrac * 360).toFixed(2) + ' ' + CX + ' ' + CY + ')');

    let activePhaseTitle = st.phaseLabel ? _cleanChronoLabel(st.phaseLabel, 0) : '';
    for (let i = 0; i < sectorNodes.length; i++) {
      const sn = sectorNodes[i];
      const isNow = st.elapsedS >= sn.meta.startS && (st.elapsedS < sn.meta.endS || (i === sectorNodes.length - 1 && st.elapsedS >= sn.meta.startS));
      if (isNow && !activePhaseTitle) activePhaseTitle = sn.meta.label;
      if (sn.active !== isNow) {
        sn.active = isNow;
        sn.node.setAttribute('opacity', isNow ? '1' : '0.28');
        sn.node.setAttribute('stroke-width', isNow ? '6.5' : '4.5');
      }
    }

    const thA = _clamp(+(st.waves.thetaA || 0), 0, 1);
    const thS = _clamp(+(st.waves.thetaS || 0), 0, 1);
    const thB = _clamp(+(st.waves.thetaB || 0), 0, 1);
    waveA.fg.setAttribute('stroke-dashoffset', (WAVE_ARC_LEN * (1 - thA)).toFixed(2));
    waveS.fg.setAttribute('stroke-dashoffset', (WAVE_ARC_LEN * (1 - thS)).toFixed(2));
    waveB.fg.setAttribute('stroke-dashoffset', (WAVE_ARC_LEN * (1 - thB)).toFixed(2));

    /* Resolve flow rate & tachometer readout (never stuck at dead 0.0 g/s mid-pour!) */
    let effFlowGs = st.flowGs;
    let effFlowLabel = st.tachLabel;
    if (effFlowGs <= 0 && !effFlowLabel && st.elapsedS > 0 && mode === 'brew') {
      const autoF = deriveAutoFlow(st.elapsedS);
      effFlowGs = autoF.gs;
      effFlowLabel = autoF.label;
    }

    const flowFrac = _clamp(effFlowGs / st.maxFlowGs, 0, 1);
    const tachDeg = -195 + flowFrac * 210;
    tachNeedle.setAttribute('transform', 'rotate(' + tachDeg.toFixed(1) + ' ' + TCX + ' ' + TCY + ')');
    tachLiveArc.setAttribute('d', flowFrac > 0.015 ? _horoArc(TCX, TCY, TR, -195, tachDeg) : '');

    /* Never clamp elapsedS to totalTargetS — allow full overtime count-up! */
    const nextDigits = formatChronoTime(st.elapsedS);
    if (nextDigits !== cDigits) {
      cDigits = nextDigits;
      digitsMainEl.textContent = nextDigits;
      digitsMainEl.setAttribute('font-size', nextDigits.length >= 8 ? '30' : '37');
    }

    let rawPhaseTxt = activePhaseTitle || 'CHRONOGRAPH';
    if (isOvertime && !/\+|overtime/i.test(rawPhaseTxt)) {
      rawPhaseTxt = 'OVERTIME +' + _fmtMmSs(overSec);
    }
    const nextPhase = String(rawPhaseTxt).replace(/\s*\([^)]*\)/g, '').trim().slice(0, 18).toUpperCase();
    if (nextPhase !== cPhase) {
      cPhase = nextPhase;
      phaseKickerEl.textContent = nextPhase;
      phaseKickerEl.setAttribute('fill', isOvertime ? overtimeCol : tickMajor);
    }

    const nextSub = st.subLabel || (mode === 'brew'
      ? (wVal.toFixed(1) + ' / ' + st.targetWaterG + ' g')
      : ('Stage ' + Math.round(wFrac * 100) + '% · Target ' + _fmtMmSs(tot)));
    if (nextSub !== cSub) {
      cSub = nextSub;
      subReadoutEl.textContent = nextSub;
    }

    const rawTach = effFlowLabel || (st.pressureBar > 0
      ? (effFlowGs.toFixed(1) + ' g/s · ' + st.pressureBar.toFixed(1) + 'b')
      : (mode === 'brew' ? (effFlowGs.toFixed(1) + ' g/s') : ('Pace ' + Math.round(tFrac * 100) + '%')));
    const nextTach = _compactChronoFlowLabel(rawTach);
    if (nextTach !== cTach) {
      cTach = nextTach;
      tachText.textContent = nextTach;
      tachText.setAttribute('font-size', nextTach.length > 13 ? '9.6' : (nextTach.length > 9 ? '10.6' : '11.8'));
    }
  }

  root.update = function(live) {
    if (!live || typeof live !== 'object') return;
    if (live.elapsedS != null && isFinite(+live.elapsedS)) st.elapsedS = Math.max(0, +live.elapsedS);
    const nextTot = live.totalTargetS != null ? +live.totalTargetS : (live.targetS != null ? +live.targetS : null);
    if (nextTot != null && nextTot > 0) st.totalTargetS = nextTot;
    if (live.liveWeightG !== undefined) st.liveWeightG = live.liveWeightG != null ? +live.liveWeightG : null;
    if (live.targetWaterG != null && +live.targetWaterG > 0) st.targetWaterG = +live.targetWaterG;
    if (live.ghostWeightG !== undefined) st.ghostWeightG = live.ghostWeightG != null ? +live.ghostWeightG : null;
    const nextFlow = live.flowRateGs != null ? +live.flowRateGs : (live.flowGs != null ? +live.flowGs : (live.pourRateGs != null ? +live.pourRateGs : null));
    if (nextFlow != null && isFinite(nextFlow)) {
      st.flowGs = Math.max(0, nextFlow);
      st.flowExplicit = true;
    }
    if (live.pressureBar != null && isFinite(+live.pressureBar)) st.pressureBar = Math.max(0, +live.pressureBar);
    if (typeof live.phaseLabel === 'string') st.phaseLabel = live.phaseLabel;
    if (typeof live.subLabel === 'string') st.subLabel = live.subLabel;
    if (typeof live.flowLabel === 'string') st.tachLabel = live.flowLabel;
    else if (typeof live.tachLabel === 'string') st.tachLabel = live.tachLabel;
    const wObj = live.waves || live.waveState;
    if (wObj && typeof wObj === 'object') {
      if (wObj.thetaA != null) st.waves.thetaA = +wObj.thetaA;
      if (wObj.thetaS != null) st.waves.thetaS = +wObj.thetaS;
      if (wObj.thetaB != null) st.waves.thetaB = +wObj.thetaB;
    }
    paint();
  };
  root.getState = function() {
    return Object.assign({ isOvertime: st.elapsedS > (st.totalTargetS + 0.05) }, st);
  };

  paint();
  return root;
}

/* ==================== 11. BTExtractionWavesLive (Real-Time 3-Curve Extraction Kinetics SVG) ==================== */
function _evalExtractionWaveProfile(tSec, targetSec, tempC, roastStr) {
  const tot = Math.max(15, +targetSec || 150);
  const u = Math.max(0, (+tSec || 0) / tot); /* normalized time: 0..1 = planned brew, >1 = overtime */
  const tc = _clamp(isFinite(+tempC) ? +tempC : 93, 75, 100);
  const rLow = String(roastStr || '').toLowerCase();
  const roastDarkBias = rLow.indexOf('dark') >= 0 ? 0.16 : (rLow.indexOf('light') >= 0 ? -0.10 : 0);
  const tempBias = (tc - 92) * 0.018;

  /* Wave 1: Bright Fruit Acids (fast early rise in Bloom & Pour 1, warm citrus gold #D98B26) */
  const w1Rise = 1 - Math.exp(-u / 0.105);
  const w1Tail = 0.24 + 0.76 * Math.exp(-Math.max(0, u - 0.17) / 0.44);
  const acid = _clamp(w1Rise * w1Tail * (1.0 - roastDarkBias * 0.35), 0.02, 0.98);

  /* Wave 2: Sweet Sugars & Body (mid-brew bell/plateau across 0.28..0.85, rich caramel copper #B84A14 / #1C4A36) */
  const w2Sig = 1 / (1 + Math.exp(-(u - 0.26) / 0.085));
  const w2Tail = u <= 0.68 ? 1.0 : Math.exp(-Math.pow((u - 0.68) / 0.56, 1.55));
  const sugar = _clamp(w2Sig * w2Tail * 0.94, 0.02, 0.96);

  /* Wave 3: Late Dry Bitters (stays low early, rises steeply near drawdown end & overtime, deep crimson #9E211D) */
  const onset = Math.max(0.52, 0.84 - roastDarkBias - tempBias);
  const w3Sig = 1 / (1 + Math.exp(-(u - onset) / 0.145));
  const bitter = _clamp(0.03 + 0.94 * w3Sig, 0.03, 0.98);

  return { acid: acid, sugar: sugar, bitter: bitter, u: u };
}

function BTExtractionWavesLive(cfg) {
  cfg = cfg || {};
  const uid = _tUid('bt_ewl');
  const W = 420, H = 152;
  const PAD_L = 10, PAD_R = 10, PAD_T = 14, PAD_B = 22;
  const PLOT_W = W - PAD_L - PAD_R;
  const PLOT_H = H - PAD_T - PAD_B;

  let st = {
    elapsedS: Math.max(0, +cfg.elapsedS || 0),
    totalTargetS: Math.max(15, +cfg.totalTargetS || +cfg.targetS || 150),
    tempC: isFinite(+cfg.tempC) ? +cfg.tempC : 93,
    roast: cfg.roast || 'light-medium',
    isPaused: !!cfg.isPaused,
    stopped: !!cfg.stopped,
    cutoffS: cfg.cutoffS != null && +cfg.cutoffS > 0 ? +cfg.cutoffS : null,
    phases: Array.isArray(cfg.phases) ? cfg.phases.slice() : [],
    scrubPreviewS: null
  };

  const COL_ACID   = 'var(--wave-acid, #D98B26)';
  const COL_SUGAR  = 'var(--wave-sweet, #B84A14)';
  const COL_BITTER = 'var(--wave-bitter, #9E211D)';

  const clipRect = h('rect', { x: PAD_L, y: PAD_T, width: 0, height: PLOT_H });
  const defs = h('defs', null,
    h('clipPath', { id: uid + '_plot' },
      h('rect', { x: PAD_L, y: PAD_T, width: PLOT_W, height: PLOT_H, rx: 10 })
    ),
    h('clipPath', { id: uid + '_past' }, clipRect),
    h('linearGradient', { id: uid + '_ga', x1: '0', y1: '0', x2: '0', y2: '1' },
      h('stop', { offset: '0%', 'stop-color': '#D98B26', 'stop-opacity': '0.34' }),
      h('stop', { offset: '65%', 'stop-color': '#D98B26', 'stop-opacity': '0.10' }),
      h('stop', { offset: '100%', 'stop-color': '#D98B26', 'stop-opacity': '0.01' })
    ),
    h('linearGradient', { id: uid + '_gs', x1: '0', y1: '0', x2: '0', y2: '1' },
      h('stop', { offset: '0%', 'stop-color': '#B84A14', 'stop-opacity': '0.32' }),
      h('stop', { offset: '65%', 'stop-color': '#B84A14', 'stop-opacity': '0.10' }),
      h('stop', { offset: '100%', 'stop-color': '#B84A14', 'stop-opacity': '0.02' })
    ),
    h('linearGradient', { id: uid + '_gb', x1: '0', y1: '0', x2: '0', y2: '1' },
      h('stop', { offset: '0%', 'stop-color': '#9E211D', 'stop-opacity': '0.32' }),
      h('stop', { offset: '65%', 'stop-color': '#9E211D', 'stop-opacity': '0.10' }),
      h('stop', { offset: '100%', 'stop-color': '#9E211D', 'stop-opacity': '0.01' })
    )
  );

  /* Background plot, Sweet-Spot Window band (~27%-80%), crisp horizontal gridlines & overtime zone */
  const sweetBand = h('rect', {
    class: 'bt-ext-waves-sweet-band',
    x: +(PAD_L + PLOT_W * 0.27).toFixed(1),
    y: PAD_T,
    width: +(PLOT_W * 0.53).toFixed(1),
    height: PLOT_H,
    fill: 'var(--wave-sweet-band, rgba(28, 74, 54, 0.11))',
    stroke: 'var(--wave-sweet-band-stroke, rgba(28, 74, 54, 0.28))',
    'stroke-width': 1,
    'stroke-dasharray': '3 3'
  });
  const sweetBandLbl = h('text', {
    class: 'bt-ext-waves-sweet-lbl',
    x: +(PAD_L + PLOT_W * 0.535).toFixed(1),
    y: PAD_T + 12,
    'text-anchor': 'middle',
    fill: 'var(--wave-sweet-band-ink, var(--good, #1C4A36))',
    'font-size': 8.8,
    'font-weight': 800,
    'letter-spacing': '0.03em',
    text: 'Sweet-Spot Window'
  });
  const overtimeBand = h('rect', {
    x: PAD_L + PLOT_W, y: PAD_T, width: 0, height: PLOT_H,
    fill: 'rgba(217, 139, 38, 0.15)',
    hidden: true
  });
  const gridY25 = +(PAD_T + PLOT_H * 0.25).toFixed(1);
  const gridY50 = +(PAD_T + PLOT_H * 0.50).toFixed(1);
  const gridY75 = +(PAD_T + PLOT_H * 0.75).toFixed(1);
  const gridLayer = h('g', { 'aria-hidden': 'true' },
    h('rect', { x: PAD_L, y: PAD_T, width: PLOT_W, height: PLOT_H, rx: 10, fill: 'var(--well)', stroke: 'var(--line-soft)', 'stroke-width': 1 }),
    h('g', { 'clip-path': 'url(#' + uid + '_plot)' },
      sweetBand,
      overtimeBand,
      h('line', { class: 'bt-ext-waves-gridline', x1: PAD_L, y1: gridY25, x2: PAD_L + PLOT_W, y2: gridY25, stroke: 'var(--wave-gridline, var(--line-hairline))', 'stroke-width': 0.9, 'stroke-dasharray': '3 3' }),
      h('line', { class: 'bt-ext-waves-gridline', x1: PAD_L, y1: gridY50, x2: PAD_L + PLOT_W, y2: gridY50, stroke: 'var(--wave-gridline, var(--line-hairline))', 'stroke-width': 1, 'stroke-dasharray': '3 3' }),
      h('line', { class: 'bt-ext-waves-gridline', x1: PAD_L, y1: gridY75, x2: PAD_L + PLOT_W, y2: gridY75, stroke: 'var(--wave-gridline, var(--line-hairline))', 'stroke-width': 0.9, 'stroke-dasharray': '3 3' }),
      sweetBandLbl,
      h('text', { class: 'bt-ext-waves-axis-lbl', x: PAD_L + 6, y: PAD_T + 11, fill: 'var(--ink-muted)', 'font-size': 7.6, 'font-weight': 700, opacity: '0.78', text: 'Peak' }),
      h('text', { class: 'bt-ext-waves-axis-lbl', x: PAD_L + 6, y: PAD_T + PLOT_H - 4, fill: 'var(--ink-muted)', 'font-size': 7.6, 'font-weight': 700, opacity: '0.72', text: 'Low' })
    )
  );

  /* Preview (ahead of playhead) dashed curves */
  const prevAcidPath   = h('path', { d: '', fill: 'none', stroke: COL_ACID,   'stroke-width': 1.75, 'stroke-dasharray': '4 3', opacity: '0.46' });
  const prevSugarPath  = h('path', { d: '', fill: 'none', stroke: COL_SUGAR,  'stroke-width': 1.85, 'stroke-dasharray': '4 3', opacity: '0.46' });
  const prevBitterPath = h('path', { d: '', fill: 'none', stroke: COL_BITTER, 'stroke-width': 1.75, 'stroke-dasharray': '4 3', opacity: '0.46' });

  /* Active illuminated curves + rich gradient area fills clipped up to live playhead */
  const areaAcidPath   = h('path', { d: '', fill: 'url(#' + uid + '_ga)' });
  const areaSugarPath  = h('path', { d: '', fill: 'url(#' + uid + '_gs)' });
  const areaBitterPath = h('path', { d: '', fill: 'url(#' + uid + '_gb)' });

  const liveAcidPath   = h('path', { 'data-wave': 'acids',   d: '', fill: 'none', stroke: COL_ACID,   'stroke-width': 2.75, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const liveSugarPath  = h('path', { 'data-wave': 'sugars',  d: '', fill: 'none', stroke: COL_SUGAR,  'stroke-width': 3.0,  'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  const liveBitterPath = h('path', { 'data-wave': 'bitters', d: '', fill: 'none', stroke: COL_BITTER, 'stroke-width': 2.65, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });

  const activeGroup = h('g', { 'clip-path': 'url(#' + uid + '_plot)' },
    h('g', { 'clip-path': 'url(#' + uid + '_past)' },
      areaAcidPath, areaSugarPath, areaBitterPath,
      liveAcidPath, liveSugarPath, liveBitterPath
    )
  );

  /* Target time vertical reference line (visible especially in overtime!) */
  const phasePinsLayer = h('g', { class: 'bt-ext-phase-pins', 'clip-path': 'url(#' + uid + '_plot)', 'aria-hidden': 'true' });
  const targetMarkerLine = h('line', {
    x1: PAD_L + PLOT_W, y1: PAD_T, x2: PAD_L + PLOT_W, y2: PAD_T + PLOT_H,
    stroke: 'var(--gold, #D98B26)',
    'stroke-width': 1.5,
    'stroke-dasharray': '4 2.5',
    opacity: '0.82'
  });
  const axisTickY0 = PAD_T + PLOT_H;
  const axisTickY1 = PAD_T + PLOT_H + 4;
  const axisTicks = h('g', { 'aria-hidden': 'true' },
    h('line', { x1: PAD_L, y1: axisTickY0, x2: PAD_L, y2: axisTickY1, stroke: 'var(--line-soft)', 'stroke-width': 1 }),
    h('line', { x1: +(PAD_L + PLOT_W * 0.5).toFixed(1), y1: axisTickY0, x2: +(PAD_L + PLOT_W * 0.5).toFixed(1), y2: axisTickY1, stroke: 'var(--line-soft)', 'stroke-width': 1 }),
    h('line', { x1: PAD_L + PLOT_W, y1: axisTickY0, x2: PAD_L + PLOT_W, y2: axisTickY1, stroke: 'var(--line-soft)', 'stroke-width': 1 })
  );
  const axisStartTxt  = h('text', { class: 'bt-ext-waves-axis-lbl', x: PAD_L + 2, y: H - 5, fill: 'var(--ink-muted)', 'font-family': 'var(--font-mono)', 'font-size': 9.4, 'font-weight': 700, text: '00:00' });
  const axisMidTxt    = h('text', { class: 'bt-ext-waves-axis-lbl', x: PAD_L + PLOT_W * 0.5, y: H - 5, 'text-anchor': 'middle', fill: 'var(--ink-muted)', 'font-family': 'var(--font-mono)', 'font-size': 9.4, 'font-weight': 600, text: '01:15' });
  const axisTargetTxt = h('text', { class: 'bt-ext-waves-axis-lbl', x: PAD_L + PLOT_W - 2, y: H - 5, 'text-anchor': 'end', fill: 'var(--ink-secondary)', 'font-family': 'var(--font-mono)', 'font-size': 9.4, 'font-weight': 700, text: 'Target 02:30' });

  /* Moving Playhead Line + 3 Glowing Curve Dots */
  const playheadLine = h('line', {
    class: 'bt-ext-playhead',
    'data-wave-playhead': '1',
    x1: PAD_L, y1: PAD_T - 3, x2: PAD_L, y2: PAD_T + PLOT_H + 3,
    stroke: 'var(--ink)',
    'stroke-width': 1.9
  });
  const dotAcidGlow   = h('circle', { cx: PAD_L, cy: PAD_T + PLOT_H, r: 7.5, fill: '#D98B26', opacity: '0.26' });
  const dotAcid       = h('circle', { 'data-wave-dot': 'acids',   cx: PAD_L, cy: PAD_T + PLOT_H, r: 4.0, fill: '#D98B26', stroke: '#FFFDF9', 'stroke-width': 1.6 });
  const dotSugarGlow  = h('circle', { cx: PAD_L, cy: PAD_T + PLOT_H, r: 8.0, fill: '#B84A14', opacity: '0.28' });
  const dotSugar      = h('circle', { 'data-wave-dot': 'sugars',  cx: PAD_L, cy: PAD_T + PLOT_H, r: 4.2, fill: '#B84A14', stroke: '#FFFDF9', 'stroke-width': 1.6 });
  const dotBitterGlow = h('circle', { cx: PAD_L, cy: PAD_T + PLOT_H, r: 7.5, fill: '#9E211D', opacity: '0.26' });
  const dotBitter     = h('circle', { 'data-wave-dot': 'bitters', cx: PAD_L, cy: PAD_T + PLOT_H, r: 4.0, fill: '#9E211D', stroke: '#FFFDF9', 'stroke-width': 1.6 });

  const svgEl = h('svg', {
    class: 'bt-ext-waves-svg bt-chart-svg',
    style: { touchAction: 'pan-y' },
    viewBox: '0 0 ' + W + ' ' + H,
    role: 'img',
    'aria-label': 'Live 3-Wave Extraction Kinetics: Bright Fruit Acids, Sweet Sugars & Body, and Late Dry Bitters with shaded Sweet-Spot Window'
  },
    defs,
    gridLayer,
    h('g', { 'clip-path': 'url(#' + uid + '_plot)' }, prevAcidPath, prevSugarPath, prevBitterPath),
    activeGroup,
    phasePinsLayer,
    targetMarkerLine,
    axisTicks,
    axisStartTxt, axisMidTxt, axisTargetTxt,
    playheadLine,
    dotAcidGlow, dotSugarGlow, dotBitterGlow,
    dotAcid, dotSugar, dotBitter
  );

  const scrubPillEl = cfg.scrubbable ? h('div', {
    class: 'bt-ext-scrub-pill is-hint',
    'data-wave-scrub-pill': '1',
    'aria-live': 'polite',
    text: 'Scrub curve when paused to preview any second'
  }) : null;

  const phaseBadgeEl = h('span', {
    class: 'bt-ext-waves-phase-pill',
    'data-wave-phase': '1',
    style: 'display:inline-flex;align-items:center;padding:2px 7px;border-radius:999px;font-size:0.66rem;font-weight:800;letter-spacing:0.02em;background:var(--surface);border:1px solid var(--line-soft);color:var(--ink);white-space:nowrap',
    text: 'Ready'
  });
  const balanceReadoutEl = h('span', {
    class: 'bt-ext-waves-balance-pill bt-num',
    'data-wave-balance': '1',
    style: 'font-size:0.67rem;font-weight:700;color:var(--ink-secondary);line-height:1.25',
    text: ''
  });
  const balanceRow = h('div', {
    class: 'bt-ext-waves-balance-row',
    style: 'display:flex;align-items:center;justify-content:space-between;gap:6px 10px;flex-wrap:wrap;min-width:0'
  }, phaseBadgeEl, balanceReadoutEl);

  const statusTextEl = h('span', { text: '' });
  const statusPill = h('div', {
    class: 'bt-ext-waves-status',
    'data-wave-status': '1',
    'aria-live': 'polite'
  },
    BTIcons.el('flame-wave', { size: 15 }),
    statusTextEl
  );

  const legendRow = h('div', { class: 'bt-ext-waves-legend' },
    h('span', { class: 'bt-ext-waves-leg-pill', title: 'Fast-dissolving fruit & floral acids extract first during bloom and early pours' },
      h('i', { class: 'bt-ext-waves-dot', style: 'background:var(--wave-acid, #D98B26)' }),
      h('span', { text: '1. Bright Acids' })
    ),
    h('span', { class: 'bt-ext-waves-leg-pill', title: 'Caramel sugars & syrupy body build through the Sweet-Spot Window (27%-80% of brew)' },
      h('i', { class: 'bt-ext-waves-dot', style: 'background:var(--wave-sweet, #B84A14)' }),
      h('span', { text: '2. Sweet Sugars & Body' })
    ),
    h('span', { class: 'bt-ext-waves-leg-pill', title: 'Heavy bitter & drying compounds climb late in drawdown and during overtime' },
      h('i', { class: 'bt-ext-waves-dot', style: 'background:var(--wave-bitter, #9E211D)' }),
      h('span', { text: '3. Late Bitters' })
    )
  );

  const subCopy = (typeof cfg.subtitle === 'string')
    ? cfg.subtitle
    : 'Bright Acids dissolve first \u2192 Sweet Sugars peak in the shaded Sweet-Spot Window \u2192 Late Bitters rise if drawdown runs long.';
  const subEl = subCopy ? h('div', {
    class: 'bt-ext-waves-sub',
    style: 'font-size:0.69rem;line-height:1.3;color:var(--ink-secondary);font-weight:600',
    text: subCopy
  }) : null;

  const root = h('div', {
    class: 'bt-ext-waves-live',
    'data-bt-waves-live': '1'
  },
    h('div', { class: 'bt-ext-waves-head' },
      h('span', { class: 'bt-ext-waves-title' },
        BTIcons.el('flame-wave', { size: 14 }),
        h('span', { text: cfg.title || '3-Wave Live Extraction' })
      ),
      legendRow
    ),
    subEl,
    svgEl,
    scrubPillEl,
    balanceRow,
    statusPill
  );

  let cachedHorizonKey = '';
  let cachedStatus = '';
  let cachedBalanceKey = '';
  let cachedScrubTxt = '';

  function xForTime(t, horizonS) {
    return +(PAD_L + _clamp(t / Math.max(1, horizonS), 0, 1) * PLOT_W).toFixed(1);
  }
  function yForVal(v) {
    /* Leave comfortable headroom (14px) for Sweet-Spot Window label & top peaks */
    return +(PAD_T + 14 + (1 - _clamp(v, 0, 1)) * (PLOT_H - 18)).toFixed(1);
  }

  function rebuildCurves(horizonS) {
    const N = 64;
    const pA = [], pS = [], pB = [];
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * horizonS;
      const ev = _evalExtractionWaveProfile(t, st.totalTargetS, st.tempC, st.roast);
      const x = xForTime(t, horizonS);
      pA.push((i === 0 ? 'M ' : 'L ') + x + ' ' + yForVal(ev.acid));
      pS.push((i === 0 ? 'M ' : 'L ') + x + ' ' + yForVal(ev.sugar));
      pB.push((i === 0 ? 'M ' : 'L ') + x + ' ' + yForVal(ev.bitter));
    }
    const dA = pA.join(' ');
    const dS = pS.join(' ');
    const dB = pB.join(' ');
    const baseY = +(PAD_T + PLOT_H).toFixed(1);
    const closeTail = ' L ' + (PAD_L + PLOT_W) + ' ' + baseY + ' L ' + PAD_L + ' ' + baseY + ' Z';

    prevAcidPath.setAttribute('d', dA);
    prevSugarPath.setAttribute('d', dS);
    prevBitterPath.setAttribute('d', dB);
    liveAcidPath.setAttribute('d', dA);
    liveSugarPath.setAttribute('d', dS);
    liveBitterPath.setAttribute('d', dB);
    areaAcidPath.setAttribute('d', dA + closeTail);
    areaSugarPath.setAttribute('d', dS + closeTail);
    areaBitterPath.setAttribute('d', dB + closeTail);

    const swX0 = xForTime(st.totalTargetS * 0.27, horizonS);
    const swX1 = xForTime(st.totalTargetS * 0.80, horizonS);
    const swW = Math.max(12, +(swX1 - swX0).toFixed(1));
    sweetBand.setAttribute('x', String(swX0));
    sweetBand.setAttribute('width', String(swW));
    sweetBandLbl.setAttribute('x', String(+(swX0 + swW * 0.5).toFixed(1)));
    sweetBandLbl.textContent = swW < 88 ? 'Sweet Spot' : 'Sweet-Spot Window';

    /* Render subtle vertical dashed pour-phase cue pins inside the plot */
    phasePinsLayer.textContent = '';
    if (Array.isArray(st.phases) && st.phases.length) {
      let lastPinX = -99;
      st.phases.forEach(function(ph) {
        const tPin = ph && ph.t != null ? +ph.t : (ph && ph.startS != null ? +ph.startS : NaN);
        if (!isFinite(tPin) || tPin <= 2 || tPin >= horizonS - 3) return;
        const pinX = xForTime(tPin, horizonS);
        if (pinX - lastPinX < 40) return;
        lastPinX = pinX;
        const rawLbl = String((ph && ph.label) || '').trim();
        const shortLbl = rawLbl.length > 11 ? (rawLbl.slice(0, 10) + '\u2026') : rawLbl;
        const nearRight = (PAD_L + PLOT_W - pinX) < 52;
        phasePinsLayer.appendChild(h('line', {
          class: 'bt-ext-phase-pin',
          x1: String(pinX), y1: String(PAD_T + 15),
          x2: String(pinX), y2: String(PAD_T + PLOT_H),
          stroke: 'var(--ink-muted)',
          'stroke-width': 1,
          'stroke-dasharray': '2.5 3',
          opacity: '0.58'
        }));
        if (shortLbl) {
          phasePinsLayer.appendChild(h('text', {
            class: 'bt-ext-phase-pin-lbl',
            x: String(nearRight ? +(pinX - 3).toFixed(1) : +(pinX + 3).toFixed(1)),
            y: String(PAD_T + PLOT_H - 13),
            'text-anchor': nearRight ? 'end' : 'start',
            fill: 'var(--ink-muted)',
            'font-size': 7.6,
            'font-weight': 700,
            text: shortLbl
          }));
        }
      });
    }

    const tgtX = xForTime(st.totalTargetS, horizonS);
    targetMarkerLine.setAttribute('x1', String(tgtX));
    targetMarkerLine.setAttribute('x2', String(tgtX));
    if (horizonS > st.totalTargetS + 0.5) {
      overtimeBand.hidden = false;
      overtimeBand.setAttribute('x', String(tgtX));
      overtimeBand.setAttribute('width', String(Math.max(0, PAD_L + PLOT_W - tgtX)));
      axisTargetTxt.textContent = 'Target ' + _fmtMmSs(st.totalTargetS) + ' \u2192 ' + _fmtMmSs(horizonS);
    } else {
      overtimeBand.hidden = true;
      axisTargetTxt.textContent = 'Target ' + _fmtMmSs(st.totalTargetS);
    }
    axisMidTxt.textContent = _fmtMmSs(horizonS * 0.5);
  }

  function buildStatusString(evNow, isOver) {
    const clockTxt = _fmtMmSs(st.elapsedS);
    const suffix = st.stopped ? ' (Stopped)' : (st.isPaused && st.elapsedS > 0 ? ' (Paused)' : '');
    if (st.elapsedS <= 0.05 && !st.stopped) {
      return clockTxt + ' · Ready: Bright Fruit Acids Dissolve First in Bloom';
    }
    if (isOver) {
      const overMmSs = _fmtMmSs(st.elapsedS - st.totalTargetS);
      return clockTxt + ' · Overtime (+' + overMmSs + '): Late Dry Bitters Rising — Stop When Bed Drains!' + suffix;
    }
    if (evNow.u < 0.27) {
      return clockTxt + ' · Dissolving Now: Bright Fruit Acids & Lively Florals (Bloom / Early Pour)' + suffix;
    }
    if (evNow.u <= 0.80) {
      return clockTxt + ' · Dissolving Now: Sweet Caramel Sugars & Body (Sweet-Spot Window)' + suffix;
    }
    return clockTxt + ' · Final Drawdown: Rounding Out Body — Stop Timer When Dripper Finishes!' + suffix;
  }

  function canScrubNow() {
    return !!cfg.scrubbable && (st.isPaused || st.stopped || st.elapsedS <= 0.05);
  }

  function scrubZoneShort(ev, isOver, tSec) {
    if (tSec <= 0.05) return 'Bloom Start';
    if (isOver) return 'Overtime · Bitters Rising';
    if (ev.u < 0.27) return 'Bright Acids';
    if (ev.u <= 0.80) return 'Sweet Core';
    return 'Final Drawdown';
  }

  function paint() {
    if (!canScrubNow() && st.scrubPreviewS != null) {
      st.scrubPreviewS = null;
    }
    const isScrubbing = st.scrubPreviewS != null && isFinite(st.scrubPreviewS);
    const activeS = isScrubbing ? st.scrubPreviewS : st.elapsedS;
    const isOver = activeS > (st.totalTargetS + 0.2);
    /* Smoothly quantize overtime horizon in 5s steps so curves don't jitter every 100ms */
    const maxS = Math.max(st.elapsedS, activeS);
    const horizonS = maxS > (st.totalTargetS + 0.2)
      ? Math.max(st.totalTargetS + 5, Math.ceil(maxS / 5) * 5)
      : st.totalTargetS;
    const phaseKey = Array.isArray(st.phases)
      ? st.phases.map(function(p) { return Math.round((p && (p.t != null ? p.t : p.startS)) || 0) + String((p && p.label) || '').slice(0, 4); }).join(',')
      : '';
    const hKey = horizonS + ':' + st.totalTargetS + ':' + Math.round(st.tempC) + ':' + st.roast + ':' + phaseKey;
    if (hKey !== cachedHorizonKey) {
      cachedHorizonKey = hKey;
      rebuildCurves(horizonS);
    }

    root.classList.toggle('is-overtime', isOver);
    root.classList.toggle('is-scrubbing', isScrubbing);
    if (cfg.scrubbable) {
      svgEl.style.cursor = canScrubNow() ? 'ew-resize' : 'default';
    }
    const px = xForTime(activeS, horizonS);
    clipRect.setAttribute('width', String(Math.max(2, px - PAD_L + 1)));
    playheadLine.setAttribute('x1', String(px));
    playheadLine.setAttribute('x2', String(px));

    const evNow = _evalExtractionWaveProfile(activeS, st.totalTargetS, st.tempC, st.roast);
    const ya = yForVal(evNow.acid);
    const ys = yForVal(evNow.sugar);
    const yb = yForVal(evNow.bitter);

    dotAcid.setAttribute('cx', String(px));       dotAcid.setAttribute('cy', String(ya));
    dotAcidGlow.setAttribute('cx', String(px));   dotAcidGlow.setAttribute('cy', String(ya));
    dotSugar.setAttribute('cx', String(px));      dotSugar.setAttribute('cy', String(ys));
    dotSugarGlow.setAttribute('cx', String(px));  dotSugarGlow.setAttribute('cy', String(ys));
    dotBitter.setAttribute('cx', String(px));     dotBitter.setAttribute('cy', String(yb));
    dotBitterGlow.setAttribute('cx', String(px)); dotBitterGlow.setAttribute('cy', String(yb));

    const sumWaves = Math.max(0.001, evNow.acid + evNow.sugar + evNow.bitter);
    const pctA = Math.round((evNow.acid / sumWaves) * 100);
    const pctS = Math.round((evNow.sugar / sumWaves) * 100);
    const pctB = Math.max(0, 100 - pctA - pctS);
    const phaseTxt = (activeS <= 0.05 && !st.stopped && !isScrubbing)
      ? 'Ready · Bloom Next'
      : isOver
      ? 'Overtime · Bitters Rising'
      : evNow.u < 0.27
      ? 'Phase 1 · Bright Acids'
      : evNow.u <= 0.80
      ? 'Phase 2 · Sweet-Spot Window'
      : 'Phase 3 · Final Drawdown';
    const balTxt = (activeS <= 0.05 && !st.stopped && !isScrubbing)
      ? ('Sweet Spot ' + _fmtMmSs(st.totalTargetS * 0.27) + '\u2013' + _fmtMmSs(st.totalTargetS * 0.80) + ' · Target ' + _fmtMmSs(st.totalTargetS))
      : ((isScrubbing ? 'Preview Mix: ' : 'Live Mix: ') + 'Acids ' + pctA + '% · Sugars ' + pctS + '% · Bitters ' + pctB + '%');
    const balKey = phaseTxt + '|' + balTxt + '|' + (isOver ? '1' : '0');
    if (balKey !== cachedBalanceKey) {
      cachedBalanceKey = balKey;
      phaseBadgeEl.textContent = phaseTxt;
      balanceReadoutEl.textContent = balTxt;
      if (isOver) {
        phaseBadgeEl.style.background = 'var(--warn-bg)';
        phaseBadgeEl.style.borderColor = 'var(--warn)';
        phaseBadgeEl.style.color = 'var(--warn)';
      } else if (activeS > 0.05 && evNow.u >= 0.27 && evNow.u <= 0.80) {
        phaseBadgeEl.style.background = 'var(--good-bg)';
        phaseBadgeEl.style.borderColor = 'rgba(24, 96, 62, 0.34)';
        phaseBadgeEl.style.color = 'var(--good)';
      } else {
        phaseBadgeEl.style.background = 'var(--surface)';
        phaseBadgeEl.style.borderColor = 'var(--line-soft)';
        phaseBadgeEl.style.color = 'var(--ink)';
      }
    }

    if (scrubPillEl) {
      let nextScrubTxt = '';
      let nextScrubCls = 'bt-ext-scrub-pill is-hint';
      if (isScrubbing) {
        nextScrubTxt = 'Preview at ' + _fmtMmSs(activeS) + ' \u00B7 ' + scrubZoneShort(evNow, isOver, activeS) + ' (Acids ' + pctA + '% \u00B7 Sugars ' + pctS + '% \u00B7 Bitters ' + pctB + '%)';
        nextScrubCls = 'bt-ext-scrub-pill is-active' + (isOver ? ' is-overtime' : '');
      } else if (!canScrubNow()) {
        nextScrubTxt = 'Live playback \u00B7 Pause timer to scrub & preview any second';
        nextScrubCls = 'bt-ext-scrub-pill is-live';
      } else {
        nextScrubTxt = 'Scrub curve when paused to preview any second';
        nextScrubCls = 'bt-ext-scrub-pill is-hint';
      }
      const sKey = nextScrubCls + '|' + nextScrubTxt;
      if (sKey !== cachedScrubTxt) {
        cachedScrubTxt = sKey;
        scrubPillEl.className = nextScrubCls;
        scrubPillEl.textContent = nextScrubTxt;
      }
    }

    const evLive = isScrubbing ? _evalExtractionWaveProfile(st.elapsedS, st.totalTargetS, st.tempC, st.roast) : evNow;
    const isLiveOver = st.elapsedS > (st.totalTargetS + 0.2);
    const nextStatus = buildStatusString(evLive, isLiveOver);
    if (nextStatus !== cachedStatus) {
      cachedStatus = nextStatus;
      statusTextEl.textContent = nextStatus;
      statusPill.classList.toggle('is-overtime', isLiveOver);
      statusPill.classList.toggle('is-sweet', !isLiveOver && evLive.u >= 0.27 && evLive.u <= 0.82 && st.elapsedS > 0);
    }
  }

  /* Optional interactive scrub if cfg.scrubbable === true (active when paused/ready, guarded during live timer tick) */
  if (cfg.scrubbable) {
    let dragging = false;
    function scrubClient(e, persistPreview) {
      if (!canScrubNow()) return;
      const rect = svgEl.getBoundingClientRect();
      if (!rect || !rect.width) return;
      const frac = _clamp(((e.clientX - rect.left) / Math.max(1, rect.width) * W - PAD_L) / PLOT_W, 0, 1);
      const horizonS = Math.max(st.totalTargetS, st.elapsedS);
      st.scrubPreviewS = +(frac * horizonS).toFixed(1);
      paint();
      if (persistPreview && typeof cfg.onScrub === 'function') cfg.onScrub(st.scrubPreviewS);
    }
    svgEl.style.cursor = canScrubNow() ? 'ew-resize' : 'default';
    svgEl.addEventListener('pointerdown', function(e) {
      if (e.button && e.button !== 0) return;
      if (!canScrubNow()) return;
      dragging = true;
      try { svgEl.setPointerCapture(e.pointerId); } catch (err) {}
      scrubClient(e, true);
    });
    svgEl.addEventListener('pointermove', function(e) {
      if (!canScrubNow()) return;
      if (dragging) {
        scrubClient(e, true);
      } else if (e.pointerType === 'mouse') {
        scrubClient(e, false);
      }
    });
    ['pointerup', 'pointercancel'].forEach(function(ev) {
      svgEl.addEventListener(ev, function() { dragging = false; });
    });
    svgEl.addEventListener('pointerleave', function(e) {
      if (!dragging && e.pointerType === 'mouse' && st.scrubPreviewS != null) {
        st.scrubPreviewS = null;
        paint();
      }
    });
  }

  root.update = function(next) {
    if (!next || typeof next !== 'object') return;
    if (next.elapsedS != null && isFinite(+next.elapsedS)) st.elapsedS = Math.max(0, +next.elapsedS);
    const totNext = next.totalTargetS != null ? +next.totalTargetS : (next.targetS != null ? +next.targetS : null);
    if (totNext != null && totNext > 0) st.totalTargetS = totNext;
    if (next.tempC != null && isFinite(+next.tempC)) st.tempC = +next.tempC;
    if (typeof next.roast === 'string' && next.roast) st.roast = next.roast;
    if (typeof next.isPaused === 'boolean') {
      st.isPaused = next.isPaused;
      if (!next.isPaused && !st.stopped && st.elapsedS > 0.05) st.scrubPreviewS = null;
    }
    if (typeof next.stopped === 'boolean') st.stopped = next.stopped;
    if (next.cutoffS !== undefined) st.cutoffS = next.cutoffS != null ? +next.cutoffS : null;
    if (Array.isArray(next.phases)) st.phases = next.phases.slice();
    paint();
  };

  root.getState = function() {
    const activeS = st.scrubPreviewS != null ? st.scrubPreviewS : st.elapsedS;
    const ev = _evalExtractionWaveProfile(activeS, st.totalTargetS, st.tempC, st.roast);
    const dom = ev.acid >= ev.sugar && ev.acid >= ev.bitter ? 'acids' : (ev.sugar >= ev.bitter ? 'sugars' : 'bitters');
    return {
      elapsedS: st.elapsedS,
      scrubPreviewS: st.scrubPreviewS,
      totalTargetS: st.totalTargetS,
      acidVal: +ev.acid.toFixed(3),
      sugarVal: +ev.sugar.toFixed(3),
      bitterVal: +ev.bitter.toFixed(3),
      dominantWave: dom,
      isOvertime: activeS > (st.totalTargetS + 0.2),
      statusText: cachedStatus
    };
  };

  paint();
  return root;
}

const BTLivingPrismCockpit = BTChronoDial;

BTRoastArc.swatchInk = _roastSwatchInk;
BTRoastArc.create = function(c) { const el = BTRoastArc(c); return { el: el }; };
BTLinkedDrumTrio.create = function(c) { const el = BTLinkedDrumTrio(c); return { el: el, setValues: el.setValues }; };
BTChronoDial.create = function(c) { const el = BTChronoDial(c); return { el: el, update: el.update, getState: el.getState }; };
BTExtractionWavesLive.create = function(c) { const el = BTExtractionWavesLive(c); return { el: el, update: el.update, getState: el.getState }; };

const BTTactile = {
  BTDrumWheel: BTDrumWheel,
  BTLinkedDrumTrio: BTLinkedDrumTrio,
  BTRoastArc: BTRoastArc,
  roastSwatchInk: _roastSwatchInk,
  BTGrinderDial: BTGrinderDial,
  BTThermalBar: BTThermalBar,
  BTTastePad2D: BTTastePad2D,
  BTBeanSweep: BTBeanSweep,
  BTPrecisionKeypad: BTPrecisionKeypad,
  BTGoldenSipClock: BTGoldenSipClock,
  BTChronoDial: BTChronoDial,
  BTLivingPrismCockpit: BTChronoDial,
  BTExtractionWavesLive: BTExtractionWavesLive,
  BTExplainerPill: BTExplainerPill,
  explainerPill: BTExplainerPill,
  BTR2ReadinessBadge: BTR2ReadinessBadge,
  r2ReadinessBadge: BTR2ReadinessBadge,
  bindHoldPeek: BTScienceLens.bindHoldPeek
};

if (typeof BTShell !== 'undefined' && BTShell) {
  BTShell.explainerPill = BTExplainerPill;
  BTShell.r2ReadinessBadge = BTR2ReadinessBadge;
  BTShell.BTGoldenSipClock = BTGoldenSipClock;
  BTShell.BTChronoDial = BTChronoDial;
  BTShell.BTLivingPrismCockpit = BTChronoDial;
  BTShell.BTExtractionWavesLive = BTExtractionWavesLive;
  BTShell.BTRoastArc = BTRoastArc;
  BTShell.BTLinkedDrumTrio = BTLinkedDrumTrio;
}

if (typeof window !== 'undefined') {
  window.BTTactile = BTTactile;
  window.BTDrumWheel = BTDrumWheel;
  window.BTLinkedDrumTrio = BTLinkedDrumTrio;
  window.BTRoastArc = BTRoastArc;
  window.BTGrinderDial = BTGrinderDial;
  window.BTThermalBar = BTThermalBar;
  window.BTTastePad2D = BTTastePad2D;
  window.BTBeanSweep = BTBeanSweep;
  window.BTPrecisionKeypad = BTPrecisionKeypad;
  window.BTGoldenSipClock = BTGoldenSipClock;
  window.BTChronoDial = BTChronoDial;
  window.BTLivingPrismCockpit = BTChronoDial;
  window.BTExtractionWavesLive = BTExtractionWavesLive;
}
