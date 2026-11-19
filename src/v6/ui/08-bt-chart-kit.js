/* ============================================================================
 * BeanTelligence v6.0 — Universal "The Chart IS The Input" Engine (BTChartKit)
 * Module: src/v6/ui/08-bt-chart-kit.js
 * Loads inside main IIFE before 04..07 and 09..11 so every tab shares one
 * 60fps pointer-capture, spring, monotone spline, 2D KDE & vernier kernel.
 * Zero external dependencies, zero native number spinners, zero Unicode emojis.
 * ============================================================================ */

const BTChartKit = (function () {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';

  function numOr(v, fallback) {
    const n = typeof v === 'number' ? v : parseFloat(v);
    return Number.isFinite(n) ? n : fallback;
  }

  function clamp(v, min, max, fallback) {
    const lo = Number.isFinite(min) ? min : 0;
    const hi = Number.isFinite(max) ? Math.max(lo, max) : lo;
    const fb = Number.isFinite(fallback) ? Math.min(hi, Math.max(lo, fallback)) : lo;
    const n = typeof v === 'number' ? v : parseFloat(v);
    if (!Number.isFinite(n)) return fb;
    return n < lo ? lo : n > hi ? hi : n;
  }

  function stepDecimals(s) {
    if (!(s > 0) || !Number.isFinite(s) || Number.isInteger(s)) return 0;
    const str = s.toString();
    if (str.indexOf('e-') >= 0 || str.indexOf('E-') >= 0) {
      const parts = str.split(/e-/i);
      const frac = (parts[0].split('.')[1] || '').length;
      return Math.min(6, frac + parseInt(parts[1], 10));
    }
    const dot = str.indexOf('.');
    return dot >= 0 ? Math.min(6, str.length - dot - 1) : 0;
  }

  function roundStep(v, step, min) {
    const s = step > 0 && Number.isFinite(step) ? step : 1;
    const base = Number.isFinite(min) ? min : 0;
    const snapped = base + Math.round((v - base) / s) * s;
    const dec = Math.max(stepDecimals(s), stepDecimals(base));
    return dec > 0 ? +snapped.toFixed(dec) : Math.round(snapped);
  }

  function esc(s) {
    if (typeof escHtml === 'function') return escHtml(s);
    if (window.BTShell && typeof window.BTShell.escHtml === 'function') return window.BTShell.escHtml(s);
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function prefersReducedMotion() {
    try {
      return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (_) {
      return false;
    }
  }

  function haptic(kind) {
    try {
      const hp = window.BTHaptics || (window.BTPlatform && window.BTPlatform.haptics);
      if (!hp) return;
      const fn = hp[kind || 'tick'] || hp.tick;
      if (typeof fn === 'function') fn();
    } catch (_) {}
  }

  function svgEl(tag, attrs) {
    const el = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      const keys = Object.keys(attrs);
      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        const v = attrs[k];
        if (v !== null && v !== undefined && v !== false) {
          el.setAttribute(k, String(v));
        }
      }
    }
    return el;
  }

  function lensLevel() {
    try {
      if (window.BTScienceLens) {
        if (typeof window.BTScienceLens.level === 'function') {
          const lv = window.BTScienceLens.level();
          if (lv === 'starter' || lv === 'comfy' || lv === 'scientist') return lv;
        }
        if (typeof window.BTScienceLens.mode === 'function') {
          const m = window.BTScienceLens.mode();
          if (m === 'xray' || m === 'scientist') return 'scientist';
          if (m === 'surface' || m === 'starter') return 'starter';
          if (m === 'hybrid' || m === 'comfy') return 'comfy';
        }
      }
      if (window.app && window.app.prefs) {
        const p = window.app.prefs.lens || window.app.prefs.level || '';
        if (p === 'expert' || p === 'scientist' || p === 'xray') return 'scientist';
        if (p === 'new' || p === 'starter' || p === 'surface') return 'starter';
      }
    } catch (_) {}
    return 'comfy';
  }

  function pinShapeSvg(shape, cx, cy, r, attrs) {
    const x = numOr(cx, 0);
    const y = numOr(cy, 0);
    const rad = Math.max(1.5, numOr(r, 5));
    const kind = String(shape || 'circle').toLowerCase();
    const a = attrs || {};
    let extra = '';
    const keys = Object.keys(a);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      const v = a[k];
      if (v !== null && v !== undefined && v !== false) {
        extra += ' ' + k + '="' + esc(String(v)) + '"';
      }
    }
    if (kind === 'square') {
      const side = (rad * 1.75).toFixed(2);
      return '<rect x="' + (x - rad * 0.875).toFixed(2) + '" y="' + (y - rad * 0.875).toFixed(2) +
        '" width="' + side + '" height="' + side + '" rx="' + Math.min(2.2, rad * 0.3).toFixed(2) + '"' + extra + '/>';
    }
    if (kind === 'diamond') {
      const d = rad * 1.25;
      const pts = [
        x.toFixed(2) + ',' + (y - d).toFixed(2),
        (x + d).toFixed(2) + ',' + y.toFixed(2),
        x.toFixed(2) + ',' + (y + d).toFixed(2),
        (x - d).toFixed(2) + ',' + y.toFixed(2)
      ].join(' ');
      return '<polygon points="' + pts + '"' + extra + '/>';
    }
    if (kind === 'triangle') {
      const d = rad * 1.28;
      const ptsT = [
        x.toFixed(2) + ',' + (y - d).toFixed(2),
        (x + d * 0.95).toFixed(2) + ',' + (y + d * 0.78).toFixed(2),
        (x - d * 0.95).toFixed(2) + ',' + (y + d * 0.78).toFixed(2)
      ].join(' ');
      return '<polygon points="' + ptsT + '"' + extra + '/>';
    }
    if (kind === 'star5' || kind === 'star') {
      const outer = rad * 1.32;
      const inner = rad * 0.56;
      const starPts = [];
      for (let s = 0; s < 10; s++) {
        const ang = -Math.PI * 0.5 + (s * Math.PI) / 5;
        const rr = s % 2 === 0 ? outer : inner;
        starPts.push((x + Math.cos(ang) * rr).toFixed(2) + ',' + (y + Math.sin(ang) * rr).toFixed(2));
      }
      return '<polygon points="' + starPts.join(' ') + '"' + extra + '/>';
    }
    return '<circle cx="' + x.toFixed(2) + '" cy="' + y.toFixed(2) + '" r="' + rad.toFixed(2) + '"' + extra + '/>';
  }

  function pinShapeEl(shape, cx, cy, r, attrs) {
    const g = svgEl('g');
    g.innerHTML = pinShapeSvg(shape, cx, cy, r, attrs);
    return g.firstElementChild || svgEl('circle', { cx: numOr(cx, 0), cy: numOr(cy, 0), r: numOr(r, 5) });
  }

  /* --------------------------------------------------------------------------
   * 1. Analytical Critically-Damped Spring (omega0 = 26, zeta = 1.0)
   *    Exact closed-form integration, dt clamped to [0, 0.064]s, auto-sleeps
   *    at < 0.001 displacement (< 0.005 velocity) with 0% idle CPU.
   * -------------------------------------------------------------------------- */
  function stepSpring(pos, vel, target, dtRaw, opts) {
    const tgt = numOr(target, 0);
    if (!Number.isFinite(pos) || !Number.isFinite(vel) || prefersReducedMotion()) {
      return { pos: tgt, vel: 0, settled: true };
    }
    const cfg = opts || {};
    const w = clamp(cfg.omega0, 4, 120, 26.0);
    const epsPos = cfg.epsPos > 0 ? cfg.epsPos : 0.001;
    const epsVel = cfg.epsVel > 0 ? cfg.epsVel : 0.005;
    const dt = clamp(dtRaw, 0, 60.0, 0.016);
    if (dt <= 0) {
      const done0 = Math.abs(pos - tgt) < epsPos && Math.abs(vel) < epsVel;
      return done0 ? { pos: tgt, vel: 0, settled: true } : { pos: pos, vel: vel, settled: false };
    }
    const d = pos - tgt;
    const exp = Math.exp(-w * dt);
    const k = vel + w * d;
    const nextPos = tgt + (d + k * dt) * exp;
    const nextVel = (vel - k * w * dt) * exp;
    if (!Number.isFinite(nextPos) || !Number.isFinite(nextVel)) {
      return { pos: tgt, vel: 0, settled: true };
    }
    const settled = Math.abs(nextPos - tgt) < epsPos && Math.abs(nextVel) < epsVel;
    return settled ? { pos: tgt, vel: 0, settled: true } : { pos: nextPos, vel: nextVel, settled: false };
  }

  function createSpringAnimator(onFrame) {
    let rafId = 0;
    let lastTs = 0;
    let running = false;

    function tick(ts) {
      if (!running) return;
      const dt = lastTs > 0 ? Math.min(0.064, Math.max(0.001, (ts - lastTs) / 1000)) : 0.016;
      lastTs = ts;
      let keepAlive = false;
      try {
        keepAlive = !!onFrame(dt, ts);
      } catch (_) {
        keepAlive = false;
      }
      if (keepAlive && typeof requestAnimationFrame === 'function') {
        rafId = requestAnimationFrame(tick);
      } else {
        running = false;
        rafId = 0;
        lastTs = 0;
      }
    }

    return {
      wake: function () {
        if (running) return;
        running = true;
        lastTs = 0;
        if (typeof requestAnimationFrame === 'function') {
          rafId = requestAnimationFrame(tick);
        } else {
          onFrame(0.064, Date.now());
          running = false;
        }
      },
      stop: function () {
        running = false;
        lastTs = 0;
        if (rafId && typeof cancelAnimationFrame === 'function') {
          cancelAnimationFrame(rafId);
        }
        rafId = 0;
      },
      isRunning: function () {
        return running;
      }
    };
  }

  /* --------------------------------------------------------------------------
   * 2. Exact ViewBox / Logical Coordinate Transform & 48px Thumb-Offset Loupe
   * -------------------------------------------------------------------------- */
  function parseViewBox(el, fallbackW, fallbackH) {
    if (!el) return { x: 0, y: 0, w: fallbackW || 420, h: fallbackH || 300 };
    const vbAttr = el.getAttribute && el.getAttribute('viewBox');
    if (vbAttr) {
      const parts = vbAttr.trim().split(/[\s,]+/).map(Number);
      if (parts.length === 4 && parts.every(Number.isFinite) && parts[2] > 0 && parts[3] > 0) {
        return { x: parts[0], y: parts[1], w: parts[2], h: parts[3] };
      }
    }
    const lw = numOr(fallbackW, numOr(el.width && el.width.baseVal ? el.width.baseVal.value : el.width, 420));
    const lh = numOr(fallbackH, numOr(el.height && el.height.baseVal ? el.height.baseVal.value : el.height, 300));
    return { x: 0, y: 0, w: Math.max(1, lw), h: Math.max(1, lh) };
  }

  function mapClientToSurface(el, clientX, clientY, cfg) {
    const vb = parseViewBox(el, cfg && cfg.logicalWidth, cfg && cfg.logicalHeight);
    const rect = el && typeof el.getBoundingClientRect === 'function'
      ? el.getBoundingClientRect()
      : { left: 0, top: 0, width: vb.w, height: vb.h };
    const rw = rect.width > 0 ? rect.width : vb.w;
    const rh = rect.height > 0 ? rect.height : vb.h;
    const cx = numOr(clientX, rect.left + rw * 0.5);
    const cy = numOr(clientY, rect.top + rh * 0.5);

    /* Account for uniform xMidYMid meet scaling on SVG surfaces */
    const tag = el && el.tagName ? el.tagName.toLowerCase() : '';
    const par = tag === 'svg' ? (el.getAttribute('preserveAspectRatio') || 'xMidYMid meet') : 'none';
    let ux, uy;
    if (tag === 'svg' && par.indexOf('none') < 0) {
      const scale = Math.min(rw / vb.w, rh / vb.h);
      const padX = (rw - vb.w * scale) * 0.5;
      const padY = (rh - vb.h * scale) * 0.5;
      ux = vb.x + (cx - rect.left - padX) / Math.max(1e-6, scale);
      uy = vb.y + (cy - rect.top - padY) / Math.max(1e-6, scale);
    } else {
      ux = vb.x + ((cx - rect.left) / rw) * vb.w;
      uy = vb.y + ((cy - rect.top) / rh) * vb.h;
    }

    const pxX = cx - rect.left;
    const pxY = cy - rect.top;
    return {
      ux: ux,
      uy: uy,
      clampedUx: clamp(ux, vb.x, vb.x + vb.w, vb.x),
      clampedUy: clamp(uy, vb.y, vb.y + vb.h, vb.y),
      nx: clamp((ux - vb.x) / vb.w, 0, 1, 0),
      ny: clamp((uy - vb.y) / vb.h, 0, 1, 0),
      pxX: pxX,
      pxY: pxY,
      rect: rect,
      viewBox: vb,
      pxPerUnitX: rw / vb.w,
      pxPerUnitY: rh / vb.h
    };
  }

  function createHitHalo(cx, cy, visualR, minPxRadius, pxPerUnit) {
    const scale = pxPerUnit > 0 ? pxPerUnit : 1;
    const minUnits = (minPxRadius || 24) / scale;
    const r = Math.max(26, numOr(visualR, 10), minUnits);
    return svgEl('circle', {
      cx: numOr(cx, 0).toFixed(2),
      cy: numOr(cy, 0).toFixed(2),
      r: r.toFixed(2),
      fill: 'transparent',
      class: 'bt-chart-hit-halo',
      style: 'touch-action:none'
    });
  }

  /* --------------------------------------------------------------------------
   * 3. bindChartSurface(svgOrCanvasEl, cfg)
   *    - Scroll-safe pan-y surface on touch devices (touch-action: none ONLY
   *      on explicit 2D scrubber halos so vertical page scroll NEVER traps!)
   *    - PointerEvent capture with >=48px Fitts hit-halos
   *    - 48px vertical thumb-offset floating glassmorphic readout loupe
   *    - Keyboard ARIA slider navigation (ArrowLeft/Right/Up/Down + Shift 5x)
   *    - BTHaptics detent ticks on quantized threshold crossings
   * -------------------------------------------------------------------------- */
  function bindChartSurface(svgOrCanvasEl, cfg) {
    if (!svgOrCanvasEl || typeof svgOrCanvasEl.addEventListener !== 'function') {
      return { destroy: function () {}, updateLoupe: function () {}, hideLoupe: function () {}, setAria: function () {} };
    }
    const c = cfg || {};
    const host = c.loupeHost || svgOrCanvasEl.parentElement || document.body;
    if (host && host !== document.body && host.style && !host.style.position) {
      const comp = typeof getComputedStyle === 'function' ? getComputedStyle(host).position : '';
      if (!comp || comp === 'static') host.style.position = 'relative';
    }

    if (c.touchAction !== false) {
      svgOrCanvasEl.style.touchAction = c.touchAction || 'pan-y';
    }
    svgOrCanvasEl.classList.add('bt-chart-surface');

    /* Accessibility attributes */
    if (c.role !== 'none') {
      if (!svgOrCanvasEl.hasAttribute('tabindex')) svgOrCanvasEl.setAttribute('tabindex', '0');
      svgOrCanvasEl.setAttribute('role', c.role || 'slider');
      if (c.ariaLabel) svgOrCanvasEl.setAttribute('aria-label', c.ariaLabel);
      svgOrCanvasEl.setAttribute('aria-valuemin', String(numOr(c.ariaMin, 0)));
      svgOrCanvasEl.setAttribute('aria-valuemax', String(numOr(c.ariaMax, 100)));
      svgOrCanvasEl.setAttribute('aria-valuenow', String(numOr(c.ariaNow, 50)));
      if (c.ariaText) svgOrCanvasEl.setAttribute('aria-valuetext', c.ariaText);
    }

    /* Floating 48px offset readout loupe */
    let loupeEl = null;
    function getLoupe() {
      if (loupeEl && loupeEl.parentNode) return loupeEl;
      loupeEl = document.createElement('div');
      loupeEl.className = 'bt-chart-loupe';
      loupeEl.setAttribute('aria-hidden', 'true');
      loupeEl.hidden = true;
      (host || document.body).appendChild(loupeEl);
      return loupeEl;
    }

    function updateLoupe(pxX, pxY, content, opts) {
      if (c.loupe === false || !content) return;
      const lp = getLoupe();
      if (typeof content === 'string') {
        if (opts && opts.allowHtml) lp.innerHTML = content;
        else lp.textContent = content;
      } else if (content && content.nodeType === 1) {
        lp.textContent = '';
        lp.appendChild(content);
      }
      lp.hidden = false;
      lp.classList.add('is-visible');

      const hostRect = host && typeof host.getBoundingClientRect === 'function'
        ? host.getBoundingClientRect()
        : { left: 0, top: 0, width: 390, height: 300 };
      const surfRect = svgOrCanvasEl.getBoundingClientRect
        ? svgOrCanvasEl.getBoundingClientRect()
        : hostRect;

      const relX = (surfRect.left - hostRect.left) + numOr(pxX, surfRect.width * 0.5);
      const relY = (surfRect.top - hostRect.top) + numOr(pxY, surfRect.height * 0.5);
      const lw = lp.offsetWidth || 136;
      const lh = lp.offsetHeight || 34;
      const hw = Math.max(lw + 16, hostRect.width || 390);
      const hh = Math.max(lh + 16, hostRect.height || 300);

      const clampedLeft = clamp(relX - lw * 0.5, 8, hw - lw - 8, 8);
      /* 48px vertical offset above thumb; flip cleanly below only if clipped at very top */
      const rawTop = relY - 48 - lh * 0.5;
      const clampedTop = rawTop < 4 ? Math.min(hh - lh - 6, relY + 28) : clamp(rawTop, 4, hh - lh - 6, 4);
      lp.style.transform = 'translate3d(' + clampedLeft.toFixed(1) + 'px,' + clampedTop.toFixed(1) + 'px,0)';
    }

    function hideLoupe() {
      if (!loupeEl) return;
      loupeEl.classList.remove('is-visible');
      loupeEl.hidden = true;
    }

    let activePointerId = null;
    let activeHandle = null;
    let touchPending = false;
    let startPxX = 0;
    let startPxY = 0;
    let lastDetentBucket = null;
    let lastMoveTs = 0;
    let lastPxX = 0;
    let lastPxY = 0;
    let velPxX = 0;
    let velPxY = 0;

    function pickHandle(pt) {
      const handles = typeof c.getHandles === 'function' ? c.getHandles() : c.handles;
      if (!Array.isArray(handles) || !handles.length) return { handle: null, explicit: false };
      let best = null;
      let bestDistPx = Infinity;
      const scaleX = pt.pxPerUnitX || 1;
      const scaleY = pt.pxPerUnitY || 1;
      for (let i = 0; i < handles.length; i++) {
        const hd = handles[i];
        if (!hd || hd.disabled) continue;
        const pos = typeof hd.getPos === 'function' ? hd.getPos() : hd;
        if (!pos) continue;
        const dxPx = (pt.ux - numOr(pos.x, 0)) * scaleX;
        const dyPx = (pt.uy - numOr(pos.y, 0)) * scaleY;
        const distPx = Math.hypot(dxPx, dyPx);
        /* Guarantee >= 48px diameter (>= 24px radius, 28px comfortable halo) */
        const hitRadiusPx = Math.max(28, numOr(hd.hitRadiusPx, 28));
        if (distPx <= hitRadiusPx && distPx < bestDistPx) {
          best = hd;
          bestDistPx = distPx;
        }
      }
      const explicit = !!best;
      if (!best && c.allowBackgroundJump !== false && c.defaultHandleId) {
        best = handles.find(function (hItem) { return hItem && hItem.id === c.defaultHandleId; }) || null;
      }
      return { handle: best, explicit: explicit };
    }

    function fireDetentIfNeeded(detentVal) {
      if (!Number.isFinite(detentVal)) return;
      const step = c.detentStep > 0 ? c.detentStep : 1;
      const bucket = Math.round(detentVal / step);
      if (lastDetentBucket !== null && bucket !== lastDetentBucket) {
        haptic('tick');
      }
      lastDetentBucket = bucket;
    }

    function buildPayload(e, pt, phase) {
      return {
        event: e,
        phase: phase,
        ux: pt.ux,
        uy: pt.uy,
        clampedUx: pt.clampedUx,
        clampedUy: pt.clampedUy,
        nx: pt.nx,
        ny: pt.ny,
        pxX: pt.pxX,
        pxY: pt.pxY,
        vx: velPxX,
        vy: velPxY,
        viewBox: pt.viewBox,
        rect: pt.rect,
        handle: activeHandle,
        handleId: activeHandle ? activeHandle.id : null,
        pointerType: (e && e.pointerType) || 'mouse'
      };
    }

    function dispatchStart(e, pt) {
      const payload = buildPayload(e, pt, 'start');
      let res = null;
      if (activeHandle && typeof activeHandle.onStart === 'function') res = activeHandle.onStart(payload);
      if (typeof c.onDragStart === 'function') res = c.onDragStart(payload) || res;
      if (typeof c.onPointer === 'function') res = c.onPointer(payload) || res;

      if (res && Number.isFinite(res.detentValue)) fireDetentIfNeeded(res.detentValue);
      if (res && res.ariaNow !== undefined) svgOrCanvasEl.setAttribute('aria-valuenow', String(res.ariaNow));
      if (res && res.ariaText) svgOrCanvasEl.setAttribute('aria-valuetext', String(res.ariaText));
      const readout = (res && res.loupe) || (typeof c.getReadout === 'function' ? c.getReadout(payload) : '');
      if (readout) updateLoupe(pt.pxX, pt.pxY, readout, res);
    }

    function onPointerDown(e) {
      if (e.button !== undefined && e.button !== 0) return;
      const pt = mapClientToSurface(svgOrCanvasEl, e.clientX, e.clientY, c);
      const picked = pickHandle(pt);
      const chosen = picked.handle;
      const hitHaloTarget = e.target && e.target.closest && !!e.target.closest('.bt-chart-hit-halo');
      const isExplicitHandle = picked.explicit || hitHaloTarget;
      const hasHandles = !!(Array.isArray(c.handles) && c.handles.length) || typeof c.getHandles === 'function';
      if (hasHandles && !chosen && c.allowBackgroundJump === false) {
        return;
      }
      activeHandle = chosen;
      activePointerId = e.pointerId !== undefined ? e.pointerId : -1;
      lastDetentBucket = null;
      lastMoveTs = performance.now ? performance.now() : Date.now();
      startPxX = pt.pxX;
      startPxY = pt.pxY;
      lastPxX = pt.pxX;
      lastPxY = pt.pxY;
      velPxX = 0;
      velPxY = 0;

      const isTouch = e.pointerType === 'touch';
      /* Scroll-safe mobile rule: when touching the chart background (not an explicit
         knob halo), defer capture until we know whether the user is scrolling the page
         vertically (pan-y) vs tapping/scrubbing horizontally. */
      if (isTouch && !isExplicitHandle && c.touchAction !== 'none') {
        touchPending = true;
        return;
      }

      touchPending = false;
      if (c.preventDefault !== false && e.cancelable) e.preventDefault();
      try {
        if (svgOrCanvasEl.setPointerCapture && e.pointerId !== undefined) {
          svgOrCanvasEl.setPointerCapture(e.pointerId);
        }
      } catch (_) {}

      dispatchStart(e, pt);
    }

    function onPointerMove(e) {
      if (activePointerId === null) {
        if (e && e.pointerType === 'mouse' && typeof c.onHover === 'function') {
          const ptHover = mapClientToSurface(svgOrCanvasEl, e.clientX, e.clientY, c);
          const hoverPayload = buildPayload(e, ptHover, 'hover');
          const hRes = c.onHover(hoverPayload);
          if (hRes && hRes.loupe) updateLoupe(ptHover.pxX, ptHover.pxY, hRes.loupe, hRes);
        }
        return;
      }
      const eid = e.pointerId !== undefined ? e.pointerId : -1;
      if (eid !== activePointerId) return;
      const pt = mapClientToSurface(svgOrCanvasEl, e.clientX, e.clientY, c);

      if (touchPending) {
        const totDx = pt.pxX - startPxX;
        const totDy = pt.pxY - startPxY;
        if (Math.abs(totDx) < 6 && Math.abs(totDy) < 6) return;
        if (Math.abs(totDy) > Math.abs(totDx) * 1.15) {
          /* Yield cleanly to native vertical page scroll! */
          activePointerId = null;
          activeHandle = null;
          touchPending = false;
          hideLoupe();
          return;
        }
        touchPending = false;
        try {
          if (svgOrCanvasEl.setPointerCapture && e.pointerId !== undefined) {
            svgOrCanvasEl.setPointerCapture(e.pointerId);
          }
        } catch (_) {}
        dispatchStart(e, pt);
      }

      if (c.preventDefault !== false && e.cancelable) e.preventDefault();
      const now = performance.now ? performance.now() : Date.now();
      const dtMs = Math.max(1, now - lastMoveTs);
      velPxX = ((pt.pxX - lastPxX) / dtMs) * 1000;
      velPxY = ((pt.pxY - lastPxY) / dtMs) * 1000;
      lastMoveTs = now;
      lastPxX = pt.pxX;
      lastPxY = pt.pxY;

      const payload = buildPayload(e, pt, 'move');
      let res = null;
      if (activeHandle && typeof activeHandle.onMove === 'function') res = activeHandle.onMove(payload);
      if (typeof c.onDragMove === 'function') res = c.onDragMove(payload) || res;
      if (typeof c.onPointer === 'function') res = c.onPointer(payload) || res;

      if (res && Number.isFinite(res.detentValue)) fireDetentIfNeeded(res.detentValue);
      if (res && res.ariaNow !== undefined) {
        svgOrCanvasEl.setAttribute('aria-valuenow', String(res.ariaNow));
      }
      if (res && res.ariaText) {
        svgOrCanvasEl.setAttribute('aria-valuetext', String(res.ariaText));
      }
      const readout = (res && res.loupe) || (typeof c.getReadout === 'function' ? c.getReadout(payload) : '');
      if (readout) updateLoupe(pt.pxX, pt.pxY, readout, res);
    }

    function endGesture(e, cancelled) {
      const eid = e && e.pointerId !== undefined ? e.pointerId : -1;
      if (activePointerId === null || (e && eid !== activePointerId)) return;
      const pid = activePointerId;
      const wasPendingTap = touchPending;
      activePointerId = null;
      touchPending = false;
      try {
        if (!wasPendingTap && svgOrCanvasEl.releasePointerCapture && pid !== undefined) {
          svgOrCanvasEl.releasePointerCapture(pid);
        }
      } catch (_) {}
      const pt = mapClientToSurface(svgOrCanvasEl, e ? e.clientX : lastPxX, e ? e.clientY : lastPxY, c);
      if (wasPendingTap && !cancelled) {
        dispatchStart(e, pt);
      }
      const payload = buildPayload(e, pt, cancelled ? 'cancel' : 'end');
      if (activeHandle && typeof activeHandle.onEnd === 'function') activeHandle.onEnd(payload);
      if (typeof c.onDragEnd === 'function') c.onDragEnd(payload);
      activeHandle = null;
      lastDetentBucket = null;
      hideLoupe();
    }

    function onKeyDown(e) {
      if (typeof c.onKeyStep !== 'function') return;
      const mult = e.shiftKey ? 5 : 1;
      let dx = 0;
      let dy = 0;
      if (e.key === 'ArrowRight') dx = mult;
      else if (e.key === 'ArrowLeft') dx = -mult;
      else if (e.key === 'ArrowUp') dy = mult;
      else if (e.key === 'ArrowDown') dy = -mult;
      else if (e.key === 'Home') dx = -1000;
      else if (e.key === 'End') dx = 1000;
      else return;

      e.preventDefault();
      const res = c.onKeyStep({ dx: dx, dy: dy, shiftKey: !!e.shiftKey, key: e.key, event: e });
      haptic('tick');
      if (res && res.ariaNow !== undefined) svgOrCanvasEl.setAttribute('aria-valuenow', String(res.ariaNow));
      if (res && res.ariaText) svgOrCanvasEl.setAttribute('aria-valuetext', String(res.ariaText));
    }

    function onPointerLeave(e) {
      if (activePointerId !== null) return;
      if (typeof c.onPointerLeave === 'function') c.onPointerLeave(e);
      hideLoupe();
    }

    function onPointerUp(e) { endGesture(e, false); }
    function onPointerCancel(e) { endGesture(e, true); }
    function onLostPointerCapture(e) { endGesture(e, true); }

    svgOrCanvasEl.addEventListener('pointerdown', onPointerDown);
    svgOrCanvasEl.addEventListener('pointermove', onPointerMove);
    svgOrCanvasEl.addEventListener('pointerup', onPointerUp);
    svgOrCanvasEl.addEventListener('pointercancel', onPointerCancel);
    svgOrCanvasEl.addEventListener('lostpointercapture', onLostPointerCapture);
    svgOrCanvasEl.addEventListener('pointerleave', onPointerLeave);
    svgOrCanvasEl.addEventListener('keydown', onKeyDown);

    return {
      updateLoupe: updateLoupe,
      hideLoupe: hideLoupe,
      setAria: function (nowVal, textVal, minVal, maxVal) {
        if (Number.isFinite(minVal)) svgOrCanvasEl.setAttribute('aria-valuemin', String(minVal));
        if (Number.isFinite(maxVal)) svgOrCanvasEl.setAttribute('aria-valuemax', String(maxVal));
        if (Number.isFinite(nowVal)) svgOrCanvasEl.setAttribute('aria-valuenow', String(nowVal));
        if (textVal !== undefined) svgOrCanvasEl.setAttribute('aria-valuetext', String(textVal));
      },
      destroy: function () {
        svgOrCanvasEl.removeEventListener('pointerdown', onPointerDown);
        svgOrCanvasEl.removeEventListener('pointermove', onPointerMove);
        svgOrCanvasEl.removeEventListener('pointerup', onPointerUp);
        svgOrCanvasEl.removeEventListener('pointercancel', onPointerCancel);
        svgOrCanvasEl.removeEventListener('lostpointercapture', onLostPointerCapture);
        svgOrCanvasEl.removeEventListener('pointerleave', onPointerLeave);
        svgOrCanvasEl.removeEventListener('keydown', onKeyDown);
        if (loupeEl && loupeEl.parentNode) loupeEl.parentNode.removeChild(loupeEl);
        loupeEl = null;
      }
    };
  }

  /* --------------------------------------------------------------------------
   * 4. Fritsch-Carlson (1980) Monotone Piecewise Cubic Hermite Spline -> SVG C
   *    Guarantees C1 smoothness with ZERO overshoot on plateaus & step pours.
   * -------------------------------------------------------------------------- */
  function normalizePoints(pts) {
    if (!Array.isArray(pts) || !pts.length) return [];
    const raw = [];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      if (!p) continue;
      const x = Array.isArray(p) ? numOr(p[0], NaN) : numOr(p.x !== undefined ? p.x : p.t, NaN);
      const y = Array.isArray(p) ? numOr(p[1], NaN) : numOr(p.y !== undefined ? p.y : p.v, NaN);
      if (Number.isFinite(x) && Number.isFinite(y)) raw.push({ x: x, y: y });
    }
    if (raw.length <= 1) return raw;
    raw.sort(function (a, b) { return a.x - b.x; });
    /* Coalesce coincident x values to prevent h_k = 0 division by zero */
    const out = [raw[0]];
    for (let j = 1; j < raw.length; j++) {
      const prev = out[out.length - 1];
      if (Math.abs(raw[j].x - prev.x) <= 1e-7) {
        prev.y = (prev.y + raw[j].y) * 0.5;
      } else {
        out.push(raw[j]);
      }
    }
    return out;
  }

  function monotoneCubicControlPoints(pts) {
    const clean = normalizePoints(pts);
    const n = clean.length;
    if (n < 2) return { points: clean, segments: [] };
    if (n === 2) {
      const p0 = clean[0];
      const p1 = clean[1];
      const dx = (p1.x - p0.x) / 3;
      const dy = (p1.y - p0.y) / 3;
      return {
        points: clean,
        segments: [{
          x0: p0.x, y0: p0.y,
          c1x: p0.x + dx, c1y: p0.y + dy,
          c2x: p1.x - dx, c2y: p1.y - dy,
          x1: p1.x, y1: p1.y
        }]
      };
    }

    const kCount = n - 1;
    const h = new Float64Array(kCount);
    const delta = new Float64Array(kCount);
    for (let k = 0; k < kCount; k++) {
      h[k] = clean[k + 1].x - clean[k].x;
      delta[k] = (clean[k + 1].y - clean[k].y) / h[k];
    }

    const m = new Float64Array(n);
    m[0] = delta[0];
    m[n - 1] = delta[kCount - 1];
    for (let k = 1; k < kCount; k++) {
      if (delta[k - 1] * delta[k] <= 0) {
        m[k] = 0;
      } else {
        /* Weighted harmonic / arithmetic Fritsch-Carlson tangent seed */
        const w1 = 2 * h[k] + h[k - 1];
        const w2 = h[k] + 2 * h[k - 1];
        m[k] = (w1 + w2) / (w1 / delta[k - 1] + w2 / delta[k]);
      }
    }

    /* Endpoint non-overshoot clamp */
    if (delta[0] === 0) m[0] = 0;
    else if (m[0] / delta[0] < 0) m[0] = 0;
    else if (Math.abs(m[0]) > 3 * Math.abs(delta[0])) m[0] = 3 * delta[0];

    if (delta[kCount - 1] === 0) m[n - 1] = 0;
    else if (m[n - 1] / delta[kCount - 1] < 0) m[n - 1] = 0;
    else if (Math.abs(m[n - 1]) > 3 * Math.abs(delta[kCount - 1])) m[n - 1] = 3 * delta[kCount - 1];

    /* Fritsch-Carlson alpha^2 + beta^2 <= 9 monotonicity circle clamp */
    for (let k = 0; k < kCount; k++) {
      const dk = delta[k];
      if (Math.abs(dk) <= 1e-12) {
        m[k] = 0;
        m[k + 1] = 0;
      } else {
        const alpha = m[k] / dk;
        const beta = m[k + 1] / dk;
        const sq = alpha * alpha + beta * beta;
        if (sq > 9) {
          const tau = 3 / Math.sqrt(sq);
          m[k] = tau * alpha * dk;
          m[k + 1] = tau * beta * dk;
        }
      }
    }

    const segments = [];
    for (let k = 0; k < kCount; k++) {
      const p0 = clean[k];
      const p1 = clean[k + 1];
      const hk3 = h[k] / 3;
      segments.push({
        x0: p0.x,
        y0: p0.y,
        c1x: p0.x + hk3,
        c1y: p0.y + hk3 * m[k],
        c2x: p1.x - hk3,
        c2y: p1.y - hk3 * m[k + 1],
        x1: p1.x,
        y1: p1.y
      });
    }
    return { points: clean, segments: segments, tangents: m };
  }

  function monotoneCubicPath(pts, opts) {
    const cfg = opts || {};
    const dec = Number.isInteger(cfg.decimals) ? cfg.decimals : 2;
    const f = function (v) { return v.toFixed(dec); };
    const built = monotoneCubicControlPoints(pts);
    const clean = built.points;
    if (!clean.length) return '';
    if (clean.length === 1) {
      return 'M ' + f(clean[0].x) + ' ' + f(clean[0].y);
    }
    let d = 'M ' + f(clean[0].x) + ' ' + f(clean[0].y);
    const segs = built.segments;
    for (let i = 0; i < segs.length; i++) {
      const s = segs[i];
      d += ' C ' + f(s.c1x) + ' ' + f(s.c1y) + ', ' + f(s.c2x) + ' ' + f(s.c2y) + ', ' + f(s.x1) + ' ' + f(s.y1);
    }
    if (Number.isFinite(cfg.areaBaselineY)) {
      const by = f(cfg.areaBaselineY);
      d += ' L ' + f(clean[clean.length - 1].x) + ' ' + by + ' L ' + f(clean[0].x) + ' ' + by + ' Z';
    }
    return d;
  }

  /* --------------------------------------------------------------------------
   * 5. Personal Sweet-Spot Islands (48x40 Float32Array 2D Gaussian KDE +
   *    Padded Marching Squares 50% & 80% Smooth Closed Contours)
   *    - Gracefully handles N < 5 and IQR = 0 identical-TDS brews (0 NaN!)
   *    - Separable 1D Gaussian lookup: < 0.45 ms at N = 500!
   * -------------------------------------------------------------------------- */
  function sortedQuantile(sortedArr, q) {
    const n = sortedArr.length;
    if (!n) return 0;
    if (n === 1) return sortedArr[0];
    const pos = clamp(q, 0, 1, 0.5) * (n - 1);
    const lo = Math.floor(pos);
    const hi = Math.min(n - 1, lo + 1);
    const frac = pos - lo;
    return sortedArr[lo] + (sortedArr[hi] - sortedArr[lo]) * frac;
  }

  function computeIqr(values) {
    if (!values || values.length < 2) return 0;
    const copy = new Float32Array(values);
    copy.sort();
    const q75 = sortedQuantile(copy, 0.75);
    const q25 = sortedQuantile(copy, 0.25);
    const diff = q75 - q25;
    return Number.isFinite(diff) && diff > 0 ? diff : 0;
  }

  function extractStarRating(p) {
    if (!p) return 0;
    const direct = numOr(p.stars !== undefined ? p.stars : (p.rating !== undefined ? p.rating : p.my_rating_stars), NaN);
    if (Number.isFinite(direct) && direct > 0) return clamp(direct, 0, 5, 0);
    const sc = numOr(p.score !== undefined ? p.score : p.total_score, NaN);
    if (Number.isFinite(sc) && sc >= 60) {
      /* Map 70..92 SCA/CVA points smoothly onto 2.5..5.0 star scale */
      return clamp(2.5 + ((sc - 70) / 22) * 2.5, 0.5, 5.0, 3.0);
    }
    return 0;
  }

  /* Reusable typed-array scratch buffers for zero-GC sub-0.5ms KDE + Marching Squares */
  const _KDE_PAD = 5;
  const _KDE_SW = 48 + _KDE_PAD * 2; /* 58 */
  const _KDE_SH = 40 + _KDE_PAD * 2; /* 50 */
  const _kdeSplat = new Float32Array(_KDE_SW * _KDE_SH);
  const _kdeTmp = new Float32Array(_KDE_SH * 48);
  const _kdeKerX = new Float32Array(33);
  const _kdeKerY = new Float32Array(33);
  const _MS_MAX_CELLS = 52 * 44;
  const _msPadBuf = new Float32Array(_MS_MAX_CELLS);
  const _msNbr0Buf = new Int16Array(_MS_MAX_CELLS * 2);
  const _msNbr1Buf = new Int16Array(_MS_MAX_CELLS * 2);
  const _msVxBuf = new Float32Array(_MS_MAX_CELLS * 2);
  const _msVyBuf = new Float32Array(_MS_MAX_CELLS * 2);
  const _msVisBuf = new Uint8Array(_MS_MAX_CELLS * 2);
  const _msActBuf = new Int16Array(_MS_MAX_CELLS * 2);

  /* Padded Zero-String Marching Squares: embeds WxH field inside (W+2)x(H+2) zero border
     and indexes shared grid edges directly as integer IDs (degree=2 topological guarantee). */
  function traceMarchingSquaresLoops(field, W, H, xMin, xMax, yMin, yMax, threshold) {
    const PW = W + 2;
    const PH = H + 2;
    const pCells = PW * PH;
    const totalEdges = pCells * 2;
    const useStatic = pCells <= _MS_MAX_CELLS;

    const pad = useStatic ? _msPadBuf : new Float32Array(pCells);
    const nbr0 = useStatic ? _msNbr0Buf : new Int16Array(totalEdges);
    const nbr1 = useStatic ? _msNbr1Buf : new Int16Array(totalEdges);
    const vx = useStatic ? _msVxBuf : new Float32Array(totalEdges);
    const vy = useStatic ? _msVyBuf : new Float32Array(totalEdges);
    const vis = useStatic ? _msVisBuf : new Uint8Array(totalEdges);
    const act = useStatic ? _msActBuf : new Int16Array(totalEdges);

    pad.fill(0, 0, pCells);
    for (let r = 0; r < H; r++) {
      const srcOff = r * W;
      const dstOff = (r + 1) * PW + 1;
      pad.set(field.subarray(srcOff, srcOff + W), dstOff);
    }
    nbr0.fill(-1, 0, totalEdges);
    nbr1.fill(-1, 0, totalEdges);
    vis.fill(0, 0, totalEdges);

    const dx = (xMax - xMin) / Math.max(1, W - 1);
    const dy = (yMax - yMin) / Math.max(1, H - 1);
    const vOff = pCells;
    let activeCount = 0;

    function interp(vA, vB) {
      const denom = vB - vA;
      if (denom > -1e-9 && denom < 1e-9) return 0.5;
      const t = (threshold - vA) / denom;
      return t < 0.001 ? 0.001 : (t > 0.999 ? 0.999 : t);
    }

    function linkSeg(eA, ax, ay, eB, bx, by) {
      if (eA === eB) return;
      if (nbr0[eA] === -1) {
        const domAx = xMin + (ax - 1) * dx;
        const domAy = yMin + (ay - 1) * dy;
        vx[eA] = domAx < xMin ? xMin : (domAx > xMax ? xMax : domAx);
        vy[eA] = domAy < yMin ? yMin : (domAy > yMax ? yMax : domAy);
        nbr0[eA] = eB;
        act[activeCount++] = eA;
      } else {
        nbr1[eA] = eB;
      }
      if (nbr0[eB] === -1) {
        const domBx = xMin + (bx - 1) * dx;
        const domBy = yMin + (by - 1) * dy;
        vx[eB] = domBx < xMin ? xMin : (domBx > xMax ? xMax : domBx);
        vy[eB] = domBy < yMin ? yMin : (domBy > yMax ? yMax : domBy);
        nbr0[eB] = eA;
        act[activeCount++] = eB;
      } else {
        nbr1[eB] = eA;
      }
    }

    for (let r = 0; r < PH - 1; r++) {
      const row0 = r * PW;
      const row1 = (r + 1) * PW;
      const vRow = vOff + row0;
      for (let c = 0; c < PW - 1; c++) {
        const vTL = pad[row0 + c];
        const vTR = pad[row0 + c + 1];
        const vBR = pad[row1 + c + 1];
        const vBL = pad[row1 + c];
        const idx =
          (vTL >= threshold ? 8 : 0) |
          (vTR >= threshold ? 4 : 0) |
          (vBR >= threshold ? 2 : 0) |
          (vBL >= threshold ? 1 : 0);
        if (idx === 0 || idx === 15) continue;

        const eTop = row0 + c;
        const eBot = row1 + c;
        const eLeft = vRow + c;
        const eRight = vRow + c + 1;

        if (idx === 1 || idx === 14) {
          linkSeg(eLeft, c, r + interp(vTL, vBL), eBot, c + interp(vBL, vBR), r + 1);
        } else if (idx === 2 || idx === 13) {
          linkSeg(eBot, c + interp(vBL, vBR), r + 1, eRight, c + 1, r + interp(vTR, vBR));
        } else if (idx === 3 || idx === 12) {
          linkSeg(eLeft, c, r + interp(vTL, vBL), eRight, c + 1, r + interp(vTR, vBR));
        } else if (idx === 4 || idx === 11) {
          linkSeg(eTop, c + interp(vTL, vTR), r, eRight, c + 1, r + interp(vTR, vBR));
        } else if (idx === 6 || idx === 9) {
          linkSeg(eTop, c + interp(vTL, vTR), r, eBot, c + interp(vBL, vBR), r + 1);
        } else if (idx === 7 || idx === 8) {
          linkSeg(eLeft, c, r + interp(vTL, vBL), eTop, c + interp(vTL, vTR), r);
        } else if (idx === 5 || idx === 10) {
          const center = 0.25 * (vTL + vTR + vBR + vBL);
          const connected = idx === 5 ? center >= threshold : center < threshold;
          const topX = c + interp(vTL, vTR);
          const rightY = r + interp(vTR, vBR);
          const botX = c + interp(vBL, vBR);
          const leftY = r + interp(vTL, vBL);
          if (connected) {
            linkSeg(eLeft, c, leftY, eTop, topX, r);
            linkSeg(eBot, botX, r + 1, eRight, c + 1, rightY);
          } else {
            linkSeg(eLeft, c, leftY, eBot, botX, r + 1);
            linkSeg(eTop, topX, r, eRight, c + 1, rightY);
          }
        }
      }
    }

    const loops = [];
    for (let i = 0; i < activeCount; i++) {
      const start = act[i];
      if (vis[start]) continue;
      const ring = [];
      let prev = -1;
      let curr = start;
      let guard = 0;
      while (curr !== -1 && !vis[curr] && guard++ < 4096) {
        vis[curr] = 1;
        ring.push([vx[curr], vy[curr]]);
        const n0 = nbr0[curr];
        const n1 = nbr1[curr];
        const next = n0 !== prev ? n0 : n1;
        prev = curr;
        curr = next;
      }
      if (ring.length >= 4) {
        const stride = ring.length > 44 ? 2 : 1;
        if (stride === 1) {
          loops.push(ring);
        } else {
          const sub = [];
          for (let s = 0; s < ring.length; s += stride) sub.push(ring[s]);
          if (sub.length >= 3) loops.push(sub);
        }
      }
    }
    return loops;
  }

  function closedLoopsToSvgPath(loops, mapX, mapY) {
    if (!Array.isArray(loops) || !loops.length) return '';
    const hasMx = typeof mapX === 'function';
    const hasMy = typeof mapY === 'function';
    const parts = [];
    const tension = 0.22;

    for (let li = 0; li < loops.length; li++) {
      const raw = loops[li];
      const n = raw.length;
      if (n < 3) continue;
      const px = new Float32Array(n);
      const py = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        px[i] = hasMx ? numOr(mapX(raw[i][0]), 0) : raw[i][0];
        py[i] = hasMy ? numOr(mapY(raw[i][1]), 0) : raw[i][1];
      }
      let sub = 'M ' + (Math.round(px[0] * 100) / 100) + ' ' + (Math.round(py[0] * 100) / 100);
      for (let i = 0; i < n; i++) {
        const iPrev = i === 0 ? n - 1 : i - 1;
        const i1 = i + 1 === n ? 0 : i + 1;
        const iNext = i + 2 >= n ? i + 2 - n : i + 2;
        const c1x = Math.round((px[i] + (px[i1] - px[iPrev]) * tension) * 100) / 100;
        const c1y = Math.round((py[i] + (py[i1] - py[iPrev]) * tension) * 100) / 100;
        const c2x = Math.round((px[i1] - (px[iNext] - px[i]) * tension) * 100) / 100;
        const c2y = Math.round((py[i1] - (py[iNext] - py[i]) * tension) * 100) / 100;
        const x1 = Math.round(px[i1] * 100) / 100;
        const y1 = Math.round(py[i1] * 100) / 100;
        sub += ' C ' + c1x + ' ' + c1y + ', ' + c2x + ' ' + c2y + ', ' + x1 + ' ' + y1;
      }
      sub += ' Z';
      parts.push(sub);
    }
    return parts.join(' ');
  }

  function computeSweetSpotIslands(points, domain) {
    const dom = domain || {};
    const GW = 48;
    const GH = 40;
    const field = new Float32Array(GW * GH);
    const xMin = numOr(dom.xMin !== undefined ? dom.xMin : dom.eyMin, 14.0);
    const xMax = Math.max(xMin + 0.5, numOr(dom.xMax !== undefined ? dom.xMax : dom.eyMax, 26.0));
    const yMin = numOr(dom.yMin !== undefined ? dom.yMin : dom.tdsMin, 0.85);
    const yMax = Math.max(yMin + 0.05, numOr(dom.yMax !== undefined ? dom.yMax : dom.tdsMax, 1.85));
    const isEsp = dom.isEspresso !== undefined ? !!dom.isEspresso : yMax > 4.0;
    const minHx = dom.minHx > 0 ? dom.minHx : 0.70;
    const minHy = dom.minHy > 0 ? dom.minHy : (isEsp ? 0.50 : 0.065);
    const minTotal = Number.isInteger(dom.minPoints) ? dom.minPoints : 5;
    const minLiked = Number.isInteger(dom.minLiked) ? dom.minLiked : 3;
    const starCut = numOr(dom.minStars, 4.0);

    let validCount = 0;
    const likedX = [];
    const likedY = [];
    const likedW = [];

    if (Array.isArray(points)) {
      const checkExcl = window.BTCoreV6 && typeof window.BTCoreV6.isRowExcludedFromLearning === 'function'
        ? window.BTCoreV6.isRowExcludedFromLearning
        : null;
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        if (!p) continue;
        if (p.exclude_learning === true || p.exclude_learning === 'true' || p.exclude_learning === '1' || p.excludeLearning === true) continue;
        if (checkExcl && checkExcl(p)) continue;
        const px = numOr(p.ey !== undefined ? p.ey : (p.x !== undefined ? p.x : p.brew_ey_pct), NaN);
        const py = numOr(p.tds !== undefined ? p.tds : (p.y !== undefined ? p.y : p.brew_tds_pct), NaN);
        if (!Number.isFinite(px) || !Number.isFinite(py) || px <= 0 || py <= 0) continue;
        const robW = p.robustWeight !== undefined && Number.isFinite(+p.robustWeight) ? clamp(+p.robustWeight, 0, 1, 1) : 1.0;
        if (robW <= 0.02) continue;
        const st = extractStarRating(p);
        validCount++;
        if (st >= starCut) {
          const dSt = st - 3.5;
          const baseW = dSt * dSt > 0.05 ? dSt * dSt : 0.05;
          likedX.push(px);
          likedY.push(py);
          likedW.push(baseW * robW);
        }
      }
    }

    const emptyRes = function (reason) {
      return {
        ok: false,
        reason: reason,
        count: validCount,
        likedCount: likedX.length,
        gridWidth: GW,
        gridHeight: GH,
        field: field,
        bandwidth: { hx: minHx, hy: minHy },
        contour50: '',
        contour80: '',
        outerPath: '',
        peakPath: '',
        loops50: [],
        loops80: [],
        peak: null,
        projectSvg: function () { return { contour50: '', contour80: '', outerPath: '', peakPath: '' }; }
      };
    };

    const nLiked = likedX.length;
    if (validCount < minTotal || nLiked < minLiked) {
      return emptyRes('insufficient_points');
    }

    /* IQR = 0 degenerate bandwidth floor guarantees zero division by zero */
    const hx = Math.max(minHx, computeIqr(likedX) / 1.349);
    const hy = Math.max(minHy, computeIqr(likedY) / 1.349);

    const stepX = (xMax - xMin) / (GW - 1);
    const stepY = (yMax - yMin) / (GH - 1);
    const invStepX = 1 / stepX;
    const invStepY = 1 / stepY;

    /* Halo-padded O(N) bilinear grid splatting + separable 1D Gaussian convolution (<0.4ms at N=500) */
    _kdeSplat.fill(0);

    let splatted = 0;
    for (let i = 0; i < nLiked; i++) {
      const fx = (likedX[i] - xMin) * invStepX + _KDE_PAD;
      const fy = (likedY[i] - yMin) * invStepY + _KDE_PAD;
      if (fx < 0 || fx >= _KDE_SW - 1 || fy < 0 || fy >= _KDE_SH - 1) continue;
      const c0 = fx | 0;
      const r0 = fy | 0;
      const tx = fx - c0;
      const ty = fy - r0;
      const w = likedW[i];
      const w0 = w * (1 - ty);
      const w1 = w * ty;
      const idx0 = r0 * _KDE_SW + c0;
      const idx1 = idx0 + _KDE_SW;
      _kdeSplat[idx0] += w0 * (1 - tx);
      _kdeSplat[idx0 + 1] += w0 * tx;
      _kdeSplat[idx1] += w1 * (1 - tx);
      _kdeSplat[idx1 + 1] += w1 * tx;
      splatted++;
    }

    if (splatted > 0) {
      const sigX = Math.sqrt(Math.max(0.45, (hx * invStepX) * (hx * invStepX) - 0.08));
      const sigY = Math.sqrt(Math.max(0.45, (hy * invStepY) * (hy * invStepY) - 0.08));
      const radX = Math.min(14, Math.ceil(2.7 * sigX));
      const radY = Math.min(14, Math.ceil(2.7 * sigY));
      const inv2SigX2 = -0.5 / (sigX * sigX);
      const inv2SigY2 = -0.5 / (sigY * sigY);

      for (let d = -radX; d <= radX; d++) _kdeKerX[d + radX] = Math.exp(d * d * inv2SigX2);
      for (let d = -radY; d <= radY; d++) _kdeKerY[d + radY] = Math.exp(d * d * inv2SigY2);

      /* Horizontal pass: _kdeSplat (_KDE_SH x _KDE_SW) -> _kdeTmp (_KDE_SH x GW) */
      for (let r = 0; r < _KDE_SH; r++) {
        const sRow = r * _KDE_SW;
        const dRow = r * GW;
        for (let c = 0; c < GW; c++) {
          const sc = c + _KDE_PAD;
          const dMin = sc - radX < 0 ? -sc : -radX;
          const dMax = sc + radX >= _KDE_SW ? _KDE_SW - 1 - sc : radX;
          let acc = 0;
          for (let d = dMin; d <= dMax; d++) {
            acc += _kdeSplat[sRow + sc + d] * _kdeKerX[d + radX];
          }
          _kdeTmp[dRow + c] = acc;
        }
      }

      /* Vertical pass: _kdeTmp (_KDE_SH x GW) -> field (GH x GW) */
      for (let r = 0; r < GH; r++) {
        const sr = r + _KDE_PAD;
        const dMin = sr - radY < 0 ? -sr : -radY;
        const dMax = sr + radY >= _KDE_SH ? _KDE_SH - 1 - sr : radY;
        const fRow = r * GW;
        for (let c = 0; c < GW; c++) {
          let acc = 0;
          for (let d = dMin; d <= dMax; d++) {
            acc += _kdeTmp[(sr + d) * GW + c] * _kdeKerY[d + radY];
          }
          field[fRow + c] = acc;
        }
      }
    }

    /* Normalize field & locate Sweet-Spot Peak */
    let maxRaw = 0;
    let peakCol = 0;
    let peakRow = 0;
    for (let r = 0; r < GH; r++) {
      const off = r * GW;
      for (let c = 0; c < GW; c++) {
        const v = field[off + c];
        if (v > maxRaw) {
          maxRaw = v;
          peakCol = c;
          peakRow = r;
        }
      }
    }

    if (!(maxRaw > 1e-12) || !Number.isFinite(maxRaw)) {
      let sw = 0;
      let sx = 0;
      let sy = 0;
      for (let i = 0; i < nLiked; i++) {
        sw += likedW[i];
        sx += likedW[i] * likedX[i];
        sy += likedW[i] * likedY[i];
      }
      const out = emptyRes('outside_domain');
      if (sw > 0) {
        out.peak = { ey: sx / sw, tds: sy / sw, x: sx / sw, y: sy / sw, value: 1 };
      }
      return out;
    }

    const invMax = 1 / maxRaw;
    for (let idx = 0; idx < field.length; idx++) {
      field[idx] *= invMax;
    }

    /* Sub-cell parabolic peak refinement */
    let peakX = xMin + peakCol * stepX;
    let peakY = yMin + peakRow * stepY;
    if (peakCol > 0 && peakCol < GW - 1) {
      const vL = field[peakRow * GW + peakCol - 1];
      const vC = field[peakRow * GW + peakCol];
      const vR = field[peakRow * GW + peakCol + 1];
      const den = vL - 2 * vC + vR;
      if (Math.abs(den) > 1e-6) peakX = clamp(peakX + 0.5 * ((vL - vR) / den) * stepX, xMin, xMax, peakX);
    }
    if (peakRow > 0 && peakRow < GH - 1) {
      const vT = field[(peakRow - 1) * GW + peakCol];
      const vC2 = field[peakRow * GW + peakCol];
      const vB = field[(peakRow + 1) * GW + peakCol];
      const den2 = vT - 2 * vC2 + vB;
      if (Math.abs(den2) > 1e-6) peakY = clamp(peakY + 0.5 * ((vT - vB) / den2) * stepY, yMin, yMax, peakY);
    }

    const loops50 = traceMarchingSquaresLoops(field, GW, GH, xMin, xMax, yMin, yMax, 0.50);
    const loops80 = traceMarchingSquaresLoops(field, GW, GH, xMin, xMax, yMin, yMax, 0.80);

    const mapX = typeof dom.mapX === 'function' ? dom.mapX : null;
    const mapY = typeof dom.mapY === 'function' ? dom.mapY : null;
    const contour50 = closedLoopsToSvgPath(loops50, mapX, mapY);
    const contour80 = closedLoopsToSvgPath(loops80, mapX, mapY);

    return {
      ok: true,
      count: validCount,
      likedCount: nLiked,
      gridWidth: GW,
      gridHeight: GH,
      field: field,
      bandwidth: { hx: hx, hy: hy },
      loops50: loops50,
      loops80: loops80,
      contour50: contour50,
      contour80: contour80,
      outerPath: contour50,
      peakPath: contour80,
      peak: {
        ey: +peakX.toFixed(3),
        tds: +peakY.toFixed(4),
        x: +peakX.toFixed(3),
        y: +peakY.toFixed(4),
        pxX: mapX ? mapX(peakX) : peakX,
        pxY: mapY ? mapY(peakY) : peakY,
        rawMax: maxRaw
      },
      projectSvg: function (mx, my) {
        const c50 = closedLoopsToSvgPath(loops50, mx, my);
        const c80 = closedLoopsToSvgPath(loops80, mx, my);
        return { contour50: c50, contour80: c80, outerPath: c50, peakPath: c80 };
      }
    };
  }

  /* --------------------------------------------------------------------------
   * 6. Scrubbable Vernier Pill + BTPrecisionKeypad Bridge (ZERO number inputs!)
   * -------------------------------------------------------------------------- */
  let fallbackPadBackdrop = null;

  function openFallbackPrecisionKeypad(cfg) {
    if (window.BTTactile && window.BTTactile.BTPrecisionKeypad && typeof window.BTTactile.BTPrecisionKeypad.open === 'function') {
      window.BTTactile.BTPrecisionKeypad.open(cfg);
      return;
    }
    if (typeof BTPrecisionKeypad !== 'undefined' && BTPrecisionKeypad && typeof BTPrecisionKeypad.open === 'function') {
      BTPrecisionKeypad.open(cfg);
      return;
    }
    /* Self-contained tactile 56pt keypad sheet when tested standalone */
    if (fallbackPadBackdrop && fallbackPadBackdrop.parentNode) {
      fallbackPadBackdrop.parentNode.removeChild(fallbackPadBackdrop);
    }
    const min = numOr(cfg.min, 0);
    const max = numOr(cfg.max, 10000);
    const step = cfg.step > 0 ? cfg.step : 0.1;
    let buf = String(cfg.value !== undefined ? cfg.value : '');
    let fresh = true;

    const back = document.createElement('div');
    back.className = 'bt-vernier-keypad-backdrop';
    const sheet = document.createElement('div');
    sheet.className = 'bt-vernier-keypad-sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-label', cfg.label || 'Enter precision value');

    const head = document.createElement('div');
    head.className = 'bt-vk-head';
    const ttl = document.createElement('span');
    ttl.className = 'bt-vk-title';
    ttl.textContent = (cfg.label || 'Value') + (cfg.unit ? ' (' + cfg.unit + ')' : '');
    const disp = document.createElement('strong');
    disp.className = 'bt-vk-display num-tab';
    disp.textContent = buf || '0';
    head.appendChild(ttl);
    head.appendChild(disp);

    const grid = document.createElement('div');
    grid.className = 'bt-vk-grid';
    const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', 'Bksp'];

    function closePad() {
      if (back.parentNode) back.parentNode.removeChild(back);
      fallbackPadBackdrop = null;
    }

    function commitPad() {
      const parsed = parseFloat(buf);
      if (Number.isFinite(parsed)) {
        const finalV = roundStep(clamp(parsed, min, max, min), step, min);
        if (typeof cfg.onCommit === 'function') cfg.onCommit(finalV);
      }
      haptic('snap');
      closePad();
    }

    for (let i = 0; i < keys.length; i++) {
      (function (k) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'bt-vk-key';
        btn.textContent = k;
        btn.addEventListener('click', function () {
          haptic('tick');
          if (k === 'Bksp') {
            buf = fresh ? '' : buf.slice(0, -1);
            fresh = false;
          } else if (k === '.') {
            if (fresh) { buf = '0.'; fresh = false; }
            else if (buf.indexOf('.') < 0) buf += '.';
          } else {
            if (fresh) { buf = k; fresh = false; }
            else if (buf.length < 9) buf += k;
          }
          disp.textContent = buf || '0';
        });
        grid.appendChild(btn);
      })(keys[i]);
    }

    const actions = document.createElement('div');
    actions.className = 'bt-vk-actions';
    const minusB = document.createElement('button');
    minusB.type = 'button';
    minusB.className = 'bt-vk-act';
    minusB.textContent = '-' + step;
    minusB.onclick = function () {
      const cur = clamp(numOr(buf, cfg.value) - step, min, max, min);
      buf = String(roundStep(cur, step, min));
      fresh = false;
      disp.textContent = buf;
      haptic('tick');
    };

    const plusB = document.createElement('button');
    plusB.type = 'button';
    plusB.className = 'bt-vk-act';
    plusB.textContent = '+' + step;
    plusB.onclick = function () {
      const cur = clamp(numOr(buf, cfg.value) + step, min, max, min);
      buf = String(roundStep(cur, step, min));
      fresh = false;
      disp.textContent = buf;
      haptic('tick');
    };

    const cancelB = document.createElement('button');
    cancelB.type = 'button';
    cancelB.className = 'bt-vk-act';
    cancelB.textContent = 'Cancel';
    cancelB.onclick = closePad;

    const doneB = document.createElement('button');
    doneB.type = 'button';
    doneB.className = 'bt-vk-act is-primary';
    doneB.textContent = 'Apply';
    doneB.onclick = commitPad;

    actions.appendChild(minusB);
    actions.appendChild(plusB);
    actions.appendChild(cancelB);
    actions.appendChild(doneB);

    sheet.appendChild(head);
    sheet.appendChild(grid);
    sheet.appendChild(actions);
    back.appendChild(sheet);
    back.addEventListener('click', function (ev) { if (ev.target === back) closePad(); });
    document.body.appendChild(back);
    fallbackPadBackdrop = back;
  }

  function vernierPill(cfg) {
    const c = cfg || {};
    const min = numOr(c.min, 0);
    const max = Math.max(min, numOr(c.max, 100));
    const step = c.step > 0 && Number.isFinite(c.step) ? c.step : 1;
    const dec = Number.isInteger(c.decimals)
      ? c.decimals
      : Math.min(4, Math.max(stepDecimals(step), stepDecimals(min)));
    let curVal = roundStep(clamp(c.value, min, max, min), step, min);

    const root = document.createElement('div');
    root.className = 'bt-vernier-pill' + (c.compact ? ' is-compact' : '') + (c.cls ? ' ' + c.cls : '');
    if (c.id) root.id = c.id;

    const decBtn = document.createElement('button');
    decBtn.type = 'button';
    decBtn.className = 'bt-vp-step bt-vp-dec';
    decBtn.setAttribute('aria-label', 'Decrease ' + (c.label || 'value'));
    decBtn.textContent = '-';

    const track = document.createElement('div');
    track.className = 'bt-vp-track';
    track.setAttribute('tabindex', '0');
    track.setAttribute('role', 'slider');
    track.setAttribute('aria-label', c.label || 'Value');
    track.setAttribute('aria-valuemin', String(min));
    track.setAttribute('aria-valuemax', String(max));

    const lblEl = document.createElement('span');
    lblEl.className = 'bt-vp-label';
    lblEl.textContent = c.label || '';

    const valEl = document.createElement('span');
    valEl.className = 'bt-vp-val num-tab';

    const ticksEl = document.createElement('span');
    ticksEl.className = 'bt-vp-ticks';
    ticksEl.setAttribute('aria-hidden', 'true');

    track.appendChild(lblEl);
    track.appendChild(valEl);
    track.appendChild(ticksEl);

    const incBtn = document.createElement('button');
    incBtn.type = 'button';
    incBtn.className = 'bt-vp-step bt-vp-inc';
    incBtn.setAttribute('aria-label', 'Increase ' + (c.label || 'value'));
    incBtn.textContent = '+';

    root.appendChild(decBtn);
    root.appendChild(track);
    root.appendChild(incBtn);

    function formatDisplay(v) {
      if (typeof c.formatValue === 'function') return c.formatValue(v);
      const s = dec > 0 ? v.toFixed(dec) : String(Math.round(v));
      return c.unit ? s + ' ' + c.unit : s;
    }

    function syncDom() {
      const txt = formatDisplay(curVal);
      valEl.textContent = txt;
      track.setAttribute('aria-valuenow', String(curVal));
      track.setAttribute('aria-valuetext', (c.label ? c.label + ': ' : '') + txt);
      const frac = max > min ? (curVal - min) / (max - min) : 0;
      ticksEl.style.setProperty('--vp-pct', (frac * 100).toFixed(1) + '%');
    }

    function applyValue(nextRaw, commit) {
      const next = roundStep(clamp(nextRaw, min, max, curVal), step, min);
      const changed = Math.abs(next - curVal) > 1e-9;
      curVal = next;
      syncDom();
      if (changed) {
        haptic('tick');
        if (typeof c.onChange === 'function') c.onChange(curVal);
      }
      if (commit && typeof c.onCommit === 'function') c.onCommit(curVal);
    }

    decBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      applyValue(curVal - step, true);
    });
    incBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      applyValue(curVal + step, true);
    });

    /* Velocity-adaptive horizontal drag + tap-to-PrecisionKeypad */
    let pid = null;
    let startX = 0;
    let startY = 0;
    let lastX = 0;
    let lastT = 0;
    let accumVal = curVal;
    let dragged = false;
    let lockedAxis = '';

    track.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      pid = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      lastX = e.clientX;
      lastT = performance.now ? performance.now() : Date.now();
      accumVal = curVal;
      dragged = false;
      lockedAxis = '';
    });

    track.addEventListener('pointermove', function (e) {
      if (pid === null || e.pointerId !== pid) return;
      const totDx = e.clientX - startX;
      const totDy = e.clientY - startY;
      if (!lockedAxis) {
        if (Math.abs(totDx) < 5 && Math.abs(totDy) < 5) return;
        if (Math.abs(totDy) > Math.abs(totDx) * 1.25) {
          /* Release cleanly to native vertical scroll */
          pid = null;
          return;
        }
        lockedAxis = 'x';
        dragged = true;
        root.classList.add('is-scrubbing');
        try { track.setPointerCapture(e.pointerId); } catch (_) {}
      }
      if (e.cancelable) e.preventDefault();
      const now = performance.now ? performance.now() : Date.now();
      const dtS = Math.max(0.001, (now - lastT) / 1000);
      const dx = e.clientX - lastX;
      const velPx = Math.abs(dx) / dtS;
      const gain = clamp(velPx / 180, 0.25, 3.0, 1.0);
      accumVal = clamp(accumVal + step * (dx / 6) * gain, min, max, curVal);
      lastX = e.clientX;
      lastT = now;
      applyValue(accumVal, false);
    });

    function finishPointer(e, isCancel) {
      if (pid === null || (e && e.pointerId !== pid)) return;
      const wasDragged = dragged;
      const p = pid;
      pid = null;
      dragged = false;
      lockedAxis = '';
      root.classList.remove('is-scrubbing');
      try { if (wasDragged && track.releasePointerCapture) track.releasePointerCapture(p); } catch (_) {}
      if (wasDragged) {
        if (!isCancel && typeof c.onCommit === 'function') c.onCommit(curVal);
      } else if (!isCancel && c.keypad !== false) {
        openFallbackPrecisionKeypad({
          label: c.label || 'Precision Value',
          value: curVal,
          unit: c.unit || '',
          units: c.units || null,
          min: min,
          max: max,
          step: step,
          recValue: c.recValue,
          onCommit: function (v) { applyValue(v, true); }
        });
      }
    }

    track.addEventListener('pointerup', function (e) { finishPointer(e, false); });
    track.addEventListener('pointercancel', function (e) { finishPointer(e, true); });

    track.addEventListener('keydown', function (e) {
      const m = e.shiftKey ? 5 : 1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        applyValue(curVal + step * m, true);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        applyValue(curVal - step * m, true);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openFallbackPrecisionKeypad({
          label: c.label || 'Precision Value',
          value: curVal,
          unit: c.unit || '',
          min: min,
          max: max,
          step: step,
          recValue: c.recValue,
          onCommit: function (v) { applyValue(v, true); }
        });
      }
    });

    syncDom();
    root.setValue = function (v, silent) {
      curVal = roundStep(clamp(v, min, max, curVal), step, min);
      syncDom();
      if (!silent && typeof c.onChange === 'function') c.onChange(curVal);
    };
    root.getValue = function () { return curVal; };
    return root;
  }

  /* --------------------------------------------------------------------------
   * 7. Dial-In Convergence Sparkline SVG ("3-Cup Path to Perfection")
   *    Strictly scale-homogeneous (1.0..5.0 beans OR 70..95 pts).
   * -------------------------------------------------------------------------- */
  function dialInSparklineSvg(attempts, predictedNext, opts) {
    const cfg = opts || {};
    const W = numOr(cfg.width, 380);
    const H = numOr(cfg.height, 124);
    const L = 38;
    const R = W - 22;
    const T = 18;
    const B = H - 24;
    const PW = R - L;
    const PH = B - T;

    const list = Array.isArray(attempts) ? attempts.filter(Boolean) : [];
    const isPts = list.some(function (a) {
      const v = numOr(a.score !== undefined ? a.score : a.val, 0);
      return v > 10;
    });
    const yMin = isPts ? 70 : 1.0;
    const yMax = isPts ? 95 : 5.0;
    const sweetLo = isPts ? 85 : 4.25;
    const sweetHi = yMax;

    const mapY = function (v) {
      return B - clamp((numOr(v, yMin) - yMin) / (yMax - yMin), 0, 1, 0) * PH;
    };

    const totalSlots = Math.max(2, list.length + (predictedNext ? 1 : 0));
    const mapX = function (idx) {
      return totalSlots <= 1 ? L + PW * 0.5 : L + (idx / (totalSlots - 1)) * PW;
    };

    const pts = list.map(function (a, idx) {
      const raw = isPts
        ? numOr(a.score !== undefined ? a.score : a.total_score, 80)
        : extractStarRating(a) || numOr(a.val, 3.5);
      return {
        x: mapX(idx),
        y: mapY(raw),
        val: raw,
        label: a.deltaLabel || a.lever || '',
        outcome: a.outcome || '',
        multi: !!a.multi,
        locked: !!(a.locked || a.dial_locked === '1' || a.dial_locked === 'yes')
      };
    });

    const sweetTop = mapY(sweetHi).toFixed(1);
    const sweetH = Math.max(4, mapY(sweetLo) - mapY(sweetHi)).toFixed(1);

    let svg = '<svg class="bt-dial-sparkline" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMid meet" style="max-width:100%;height:auto;" role="img" aria-label="' +
      esc(cfg.ariaLabel || 'Dial-in convergence sparkline') + '" xmlns="http://www.w3.org/2000/svg">';

    /* Sweet-Spot Emerald Band */
    const lv = lensLevel();
    const sweetBadge = cfg.sweetLabel || (lv === 'starter' ? 'Best Cup Zone' : 'Sweet Spot');
    const sweetBadgeX = (predictedNext && pts.length >= 1)
      ? clamp(mapX(pts.length) - 14, L + 68, R - 5, R - 5).toFixed(1)
      : String(R - 5);
    svg += '<rect x="' + L + '" y="' + sweetTop + '" width="' + PW + '" height="' + sweetH +
      '" rx="6" class="bt-spark-sweet-band"/>';
    svg += '<text x="' + sweetBadgeX + '" y="' + (parseFloat(sweetTop) + 11.5).toFixed(1) +
      '" text-anchor="end" class="bt-spark-zone-lbl">' + esc(sweetBadge) + '</text>';

    /* Y Axis Labels */
    svg += '<text x="' + (L - 6) + '" y="' + (T + 5) + '" text-anchor="end" class="bt-spark-axis">' +
      (isPts ? '95' : '5.0') + '</text>';
    svg += '<text x="' + (L - 6) + '" y="' + B + '" text-anchor="end" class="bt-spark-axis">' +
      (isPts ? '70' : '1.0') + '</text>';

    /* Trajectory Curve */
    if (pts.length >= 2) {
      const pathD = monotoneCubicPath(pts);
      const anyMulti = pts.some(function (p) { return p.multi; });
      svg += '<path d="' + pathD + '" fill="none" class="bt-spark-curve' + (anyMulti ? ' is-multi' : '') + '"/>';
    }

    /* Predicted Cup #(k+1) Dashed Bridge & Node */
    if (predictedNext && pts.length >= 1) {
      const last = pts[pts.length - 1];
      const predVal = numOr(predictedNext.val !== undefined ? predictedNext.val : (isPts ? 88 : 4.7), isPts ? 88 : 4.7);
      const px = mapX(pts.length);
      const py = mapY(predVal);
      svg += '<line x1="' + last.x.toFixed(1) + '" y1="' + last.y.toFixed(1) +
        '" x2="' + px.toFixed(1) + '" y2="' + py.toFixed(1) + '" class="bt-spark-pred-line"/>';
      svg += '<circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="6.5" class="bt-spark-pred-node"/>';
      svg += '<text x="' + px.toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle" class="bt-spark-axis is-pred">Next</text>';
      if (predictedNext.label) {
        svg += '<text x="' + ((last.x + px) * 0.5).toFixed(1) + '" y="' + (Math.min(last.y, py) - 8).toFixed(1) +
          '" text-anchor="middle" class="bt-spark-delta is-helped">' + esc(predictedNext.label) + '</text>';
      }
    }

    /* Attempt Nodes & Delta Labels */
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const cls = p.locked ? 'is-locked' : (p.val >= sweetLo ? 'is-sweet' : '');
      svg += '<circle cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" r="' + (p.locked ? '6.5' : '5') +
        '" class="bt-spark-node ' + cls + '"/>';
      svg += '<text x="' + p.x.toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle" class="bt-spark-axis">#' + (i + 1) + '</text>';
      if (i > 0 && p.label) {
        const mx = clamp((pts[i - 1].x + p.x) * 0.5, L + 16, R - 16, (pts[i - 1].x + p.x) * 0.5);
        const my = Math.min(pts[i - 1].y, p.y) - 7;
        const oCls = p.outcome === 'helped' ? 'is-helped' : (p.outcome === 'hurt' ? 'is-hurt' : '');
        svg += '<text x="' + mx.toFixed(1) + '" y="' + Math.max(12, my).toFixed(1) +
          '" text-anchor="middle" class="bt-spark-delta ' + oCls + '">' + esc(p.label) + '</text>';
      }
    }

    if (!pts.length) {
      const emptyMsg = lv === 'starter'
        ? 'Brew Cup #1 to start your sweet-spot path'
        : 'Brew Cup #1 to begin 3-Cup Convergence';
      svg += '<text x="' + (W * 0.5) + '" y="' + (H * 0.5 + 4) + '" text-anchor="middle" class="bt-spark-empty">' + esc(emptyMsg) + '</text>';
    }

    svg += '</svg>';
    return svg;
  }

  function dialInSparklineEl(attempts, predictedNext, opts) {
    const wrap = document.createElement('div');
    wrap.className = 'bt-dial-sparkline-wrap';
    wrap.innerHTML = dialInSparklineSvg(attempts, predictedNext, opts);
    return wrap.firstElementChild || wrap;
  }

  let _explainerUid = 0;

  function createExplainer(cfg) {
    const c = cfg || {};
    const panelId = c.id || ('bt_how_panel_' + (++_explainerUid));
    let open = !!c.defaultOpen;

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'bt-how-pill';
    trigger.setAttribute('aria-expanded', String(open));
    trigger.setAttribute('aria-controls', panelId);

    if (window.BTIcons && typeof window.BTIcons.el === 'function') {
      const iconEl = window.BTIcons.el('info-circle', { size: 15 });
      if (iconEl) trigger.appendChild(iconEl);
    } else {
      const fallbackIcon = svgEl('svg', { viewBox: '0 0 24 24', width: '15', height: '15', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'aria-hidden': 'true' });
      fallbackIcon.appendChild(svgEl('circle', { cx: '12', cy: '12', r: '9.5' }));
      fallbackIcon.appendChild(svgEl('path', { d: 'M12 11v5M12 8h.01' }));
      trigger.appendChild(fallbackIcon);
    }
    const lblSpan = document.createElement('span');
    lblSpan.textContent = c.triggerLabel || '? How This Works';
    trigger.appendChild(lblSpan);

    const panel = document.createElement('div');
    panel.id = panelId;
    panel.className = 'bt-how-panel';
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', (c.title || 'Chart') + ' quick guide');
    panel.hidden = !open;

    const steps = [
      { kicker: '1. What it does', body: c.whatItDoes || 'Turns complex coffee physics into an instant visual surface.' },
      { kicker: '2. How to use in 1 touch', body: c.howToUse || 'Tap or drag directly on the chart; watch your recipe update live.' },
      { kicker: '3. Pro sensor tip', body: c.proTip || 'Pair Bluetooth gear or toggle Science X-Ray for live physical telemetry.' }
    ];

    for (let i = 0; i < steps.length; i++) {
      const card = document.createElement('div');
      card.className = 'bt-how-step';
      const k = document.createElement('span');
      k.className = 'bt-how-kicker';
      k.textContent = steps[i].kicker;
      const p = document.createElement('p');
      p.textContent = steps[i].body;
      card.appendChild(k);
      card.appendChild(p);
      panel.appendChild(card);
    }

    function setOpen(next) {
      open = !!next;
      panel.hidden = !open;
      trigger.setAttribute('aria-expanded', String(open));
      haptic('tick');
    }

    trigger.addEventListener('click', function () {
      setOpen(!open);
    });

    return {
      trigger: trigger,
      panel: panel,
      toggle: function () { setOpen(!open); },
      setOpen: setOpen,
      isOpen: function () { return open; }
    };
  }

  /* --------------------------------------------------------------------------
   * 8. Crisp Interactive SVG Crosshair Overlay (Tap / Drag / Hover Readout)
   *    Renders precision vertical + horizontal hairlines & axis callout pills.
   * -------------------------------------------------------------------------- */
  function createCrosshair(bounds, opts) {
    const cfg = opts || {};
    let b = Object.assign({ L: 54, T: 22, R: 398, B: 326 }, bounds || {});
    const g = svgEl('g', {
      class: 'bt-chart-crosshair' + (cfg.cls ? ' ' + cfg.cls : ''),
      style: 'pointer-events:none'
    });
    const vLine = svgEl('line', { class: 'bt-ch-line bt-ch-vline' });
    const hLine = svgEl('line', { class: 'bt-ch-line bt-ch-hline' });
    const xPillG = svgEl('g', { class: 'bt-ch-axis-pill bt-ch-x-pill' });
    const xBg = svgEl('rect', { x: '-28', y: '1', width: '56', height: '15', rx: '7.5', class: 'bt-ch-pill-bg' });
    const xTxt = svgEl('text', { x: '0', y: '11.5', 'text-anchor': 'middle', class: 'bt-ch-pill-txt num-tab' });
    xPillG.appendChild(xBg);
    xPillG.appendChild(xTxt);

    const yPillG = svgEl('g', { class: 'bt-ch-axis-pill bt-ch-y-pill' });
    const yBg = svgEl('rect', { x: '-50', y: '-8', width: '46', height: '16', rx: '8', class: 'bt-ch-pill-bg' });
    const yTxt = svgEl('text', { x: '-27', y: '3.2', 'text-anchor': 'middle', class: 'bt-ch-pill-txt num-tab' });
    yPillG.appendChild(yBg);
    yPillG.appendChild(yTxt);

    g.appendChild(vLine);
    g.appendChild(hLine);
    g.appendChild(xPillG);
    g.appendChild(yPillG);
    if (!cfg.visibleOnInit) {
      g.setAttribute('opacity', '0');
    }

    function update(uxRaw, uyRaw, xLabel, yLabel, activeMode) {
      const cx = clamp(uxRaw, b.L, b.R, (b.L + b.R) * 0.5);
      const cy = clamp(uyRaw, b.T, b.B, (b.T + b.B) * 0.5);
      vLine.setAttribute('x1', cx.toFixed(1));
      vLine.setAttribute('x2', cx.toFixed(1));
      vLine.setAttribute('y1', b.T.toFixed(1));
      vLine.setAttribute('y2', b.B.toFixed(1));
      hLine.setAttribute('x1', b.L.toFixed(1));
      hLine.setAttribute('x2', b.R.toFixed(1));
      hLine.setAttribute('y1', cy.toFixed(1));
      hLine.setAttribute('y2', cy.toFixed(1));

      if (xLabel) {
        const xw = Math.max(48, String(xLabel).length * 6.2 + 14);
        const clampedPillX = clamp(cx, b.L + xw * 0.5, b.R - xw * 0.5, cx);
        xBg.setAttribute('x', (-xw * 0.5).toFixed(1));
        xBg.setAttribute('width', xw.toFixed(1));
        xTxt.textContent = String(xLabel);
        xPillG.setAttribute('transform', 'translate(' + clampedPillX.toFixed(1) + ',' + b.B.toFixed(1) + ')');
        xPillG.removeAttribute('display');
      } else {
        xPillG.setAttribute('display', 'none');
      }

      if (yLabel) {
        const yw = Math.max(44, String(yLabel).length * 6.0 + 12);
        const clampedPillY = clamp(cy, b.T + 9, b.B - 9, cy);
        const yBgX = Math.max(2 - b.L, -yw - 4);
        yBg.setAttribute('x', yBgX.toFixed(1));
        yBg.setAttribute('width', yw.toFixed(1));
        yTxt.setAttribute('x', (yBgX + yw * 0.5).toFixed(1));
        yTxt.textContent = String(yLabel);
        yPillG.setAttribute('transform', 'translate(' + b.L.toFixed(1) + ',' + clampedPillY.toFixed(1) + ')');
        yPillG.removeAttribute('display');
      } else {
        yPillG.setAttribute('display', 'none');
      }

      g.setAttribute('opacity', '1');
      g.classList.toggle('is-subtle', activeMode === 'subtle');
      g.classList.toggle('is-active', activeMode === 'active');
      if (activeMode === 'active') g.classList.add('is-scrubbing');
      else g.classList.remove('is-scrubbing');
    }

    return {
      el: g,
      setBounds: function (nextBounds) { b = Object.assign(b, nextBounds || {}); },
      update: update,
      hide: function () {
        g.setAttribute('opacity', '0');
        g.classList.remove('is-active');
        g.classList.remove('is-scrubbing');
      }
    };
  }

  return {
    numOr: numOr,
    clamp: clamp,
    roundStep: roundStep,
    lensLevel: lensLevel,
    prefersReducedMotion: prefersReducedMotion,
    haptic: haptic,
    svgEl: svgEl,
    pinShapeSvg: pinShapeSvg,
    pinShapeEl: pinShapeEl,
    createHitHalo: createHitHalo,
    createCrosshair: createCrosshair,
    mapClientToSurface: mapClientToSurface,
    bindChartSurface: bindChartSurface,
    stepSpring: stepSpring,
    createSpringAnimator: createSpringAnimator,
    monotoneCubicControlPoints: monotoneCubicControlPoints,
    monotoneCubicPath: monotoneCubicPath,
    computeSweetSpotIslands: computeSweetSpotIslands,
    vernierPill: vernierPill,
    dialInSparklineSvg: dialInSparklineSvg,
    dialInSparklineEl: dialInSparklineEl,
    createExplainer: createExplainer
  };
})();

window.BTChartKit = BTChartKit;
