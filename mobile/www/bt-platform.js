/* ============================================================================
 * BeanTelligence v6.0 — OS & Hardware Platform Bridge (01-bt-platform.js)
 * Web-First Standalone / PWA Today -> Zero-Rewrite Capacitor 6+ Native Ready
 * Exports: window.BTPlatform, window.BTHaptics
 * ============================================================================ */
(function(global){
  'use strict';

  const MIN_HAPTIC_INTERVAL_MS = 28;
  const LIGHT_THEME_COLOR = '#FAF6F0';
  const DARK_THEME_COLOR = '#130E0B';
  const VAULT_FALLBACK_PREFIX = 'bt-native-vault-mirror:';

  let audioCtx = null;
  let userGestureSeen = false;
  let lastHapticMs = -1000;
  let wakeSentinel = null;
  let wakeWanted = false;
  let wakeReason = '';
  let nativeKeepAwakeActive = false;
  let swRegistration = null;
  let swUpdateAvailable = false;
  const swUpdateListeners = new Set();

  function nowMs(){
    return (typeof performance !== 'undefined' && typeof performance.now === 'function')
      ? performance.now()
      : Date.now();
  }

  function isNative(){
    try {
      return !!(global.Capacitor && typeof global.Capacitor.isNativePlatform === 'function' && global.Capacitor.isNativePlatform());
    } catch(e){
      return false;
    }
  }

  function getPlatform(){
    try {
      if (isNative() && typeof global.Capacitor.getPlatform === 'function'){
        return String(global.Capacitor.getPlatform() || 'web').toLowerCase();
      }
    } catch(e){}
    return 'web';
  }

  function capPlugins(){
    try {
      return (isNative() && global.Capacitor && global.Capacitor.Plugins) ? global.Capacitor.Plugins : null;
    } catch(e){
      return null;
    }
  }

  function prefersReducedMotion(){
    try {
      return !!(typeof global.matchMedia === 'function' && global.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch(e){
      return false;
    }
  }

  function getAppPrefs(){
    try {
      return (global.app && global.app.prefs && typeof global.app.prefs === 'object') ? global.app.prefs : null;
    } catch(e){
      return null;
    }
  }

  function isSoundMuted(){
    if (prefersReducedMotion()) return true;
    const p = getAppPrefs();
    if (!p) return false;
    if (p.soundOff === true || p.muted === true || p.sound === false) return true;
    const s = typeof p.sound === 'string' ? p.sound.trim().toLowerCase() : '';
    if (s === 'off' || s === 'silent' || s === 'mute' || s === 'muted' || s === 'none') return true;
    return false;
  }

  function isHapticsDisabled(){
    if (prefersReducedMotion()) return true;
    const p = getAppPrefs();
    if (!p) return false;
    if (p.haptics === false || p.hapticsOff === true) return true;
    const h = typeof p.haptics === 'string' ? p.haptics.trim().toLowerCase() : '';
    if (h === 'off' || h === 'disabled' || h === 'none') return true;
    return false;
  }

  function isBrewOrCuppingActive(){
    try {
      if (global.timer && global.timer.running) return true;
      const sh = global.BTShell;
      if (sh && typeof sh.isBrewActive === 'function' && sh.isBrewActive()) return true;
      const a = (sh && sh.app) ? sh.app : global.app;
      if (a){
        if (a.timerSave && a.timerSave.running) return true;
        if (a.screen === 'timer' || a.screen === 'sca' || a.screen === 'cupping' ||
            a.activeSheet === 'live-cockpit' || a.activeSheet === 'sca-cupping') return true;
        if (a.activeTab === 'brew' && (a.brewStep === 'timer' || a.brewStep === 'taste')) return true;
        if (a.activeTab === 'academy' && a.tabSegments && (a.tabSegments.academy === 'sca' || a.tabSegments.academy === 'gym')) return true;
      }
      if (sh && sh.BTSheet && typeof sh.BTSheet.isOpen === 'function' && sh.BTSheet.isOpen()){
        const sk = typeof sh.BTSheet.currentKey === 'function' ? sh.BTSheet.currentKey() : '';
        if (sk === 'live-cockpit' || sk === 'sca-cupping') return true;
      }
      if (global.BTBrewStudio && global.BTBrewStudio.timerSession && global.BTBrewStudio.timerSession.running) return true;
    } catch(e){}
    return false;
  }

  /* ---------- Lazy User-Gesture AudioContext & <3ms Watch-Crown Synthesis ---------- */
  function ensureAudioContext(fromGesture){
    if (fromGesture) userGestureSeen = true;
    if (!userGestureSeen) return null;
    if (isSoundMuted()) return null;
    try {
      const Ctor = global.AudioContext || global.webkitAudioContext;
      if (!Ctor) return null;
      if (!audioCtx || audioCtx.state === 'closed'){
        audioCtx = new Ctor();
      }
      if (audioCtx.state === 'suspended' && typeof audioCtx.resume === 'function'){
        audioCtx.resume().catch(function(){});
      }
      return audioCtx.state === 'running' ? audioCtx : null;
    } catch(e){
      return null;
    }
  }

  function primeAudio(){
    userGestureSeen = true;
    if (isSoundMuted()) return false;
    try {
      const Ctor = global.AudioContext || global.webkitAudioContext;
      if (!Ctor) return false;
      if (!audioCtx || audioCtx.state === 'closed'){
        audioCtx = new Ctor();
      }
      if (audioCtx.state === 'suspended' && typeof audioCtx.resume === 'function'){
        audioCtx.resume().catch(function(){});
      }
      if (typeof audioCtx.createBuffer === 'function' && typeof audioCtx.createBufferSource === 'function'){
        const buf = audioCtx.createBuffer(1, 1, 22050);
        const src = audioCtx.createBufferSource();
        src.buffer = buf;
        src.connect(audioCtx.destination);
        if (typeof src.start === 'function') src.start(0);
      }
      return audioCtx.state !== 'closed';
    } catch(e){
      return false;
    }
  }

  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function'){
    const markGesture = function(){
      userGestureSeen = true;
      if (audioCtx && audioCtx.state === 'suspended' && !isSoundMuted()){
        try { audioCtx.resume().catch(function(){}); } catch(e){}
      }
    };
    ['pointerdown', 'touchstart', 'keydown', 'click'].forEach(function(evt){
      try { document.addEventListener(evt, markGesture, { passive:true, capture:true }); } catch(e){}
    });
  }

  /**
   * Synthesizes an ultra-subtle (< 3ms) mechanical watch-crown detent transient.
   * Duration is strictly <= 0.0028s (2.8ms) for tactile detents and self-disconnects cleanly.
   */
  function playMicroDetent(startHz, endHz, durationSec, peakGain, waveType){
    if (isSoundMuted()) return false;
    const ctx = ensureAudioContext(false);
    if (!ctx) return false;
    try {
      const dur = Math.max(0.0012, Math.min(0.0029, +durationSec || 0.0024));
      const t0 = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = waveType || 'triangle';
      osc.frequency.setValueAtTime(Math.max(120, +startHz || 1680), t0);
      osc.frequency.exponentialRampToValueAtTime(Math.max(80, +endHz || 420), t0 + dur);

      const gMax = Math.max(0.001, Math.min(0.04, +peakGain || 0.018));
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(gMax, t0 + 0.00035);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.onended = function(){
        try { osc.disconnect(); gain.disconnect(); } catch(e){}
      };
      osc.start(t0);
      osc.stop(t0 + dur + 0.0002);
      return true;
    } catch(e){
      return false;
    }
  }

  function playHarmonicCue(notesHz, noteDurSec, peakGain){
    if (isSoundMuted()) return false;
    const ctx = ensureAudioContext(false);
    if (!ctx || !Array.isArray(notesHz) || !notesHz.length) return false;
    try {
      const tBase = ctx.currentTime;
      const stepDur = Math.max(0.018, Math.min(0.14, +noteDurSec || 0.055));
      const gMax = Math.max(0.002, Math.min(0.045, +peakGain || 0.022));
      for (let i = 0; i < notesHz.length; i++){
        const t0 = tBase + i * (stepDur * 0.72);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(notesHz[i], t0);
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.linearRampToValueAtTime(gMax, t0 + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + stepDur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.onended = function(){
          try { osc.disconnect(); gain.disconnect(); } catch(e){}
        };
        osc.start(t0);
        osc.stop(t0 + stepDur + 0.002);
      }
      return true;
    } catch(e){
      return false;
    }
  }

  function vibrateWeb(pattern){
    if (isHapticsDisabled()) return false;
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'){
        return !!navigator.vibrate(pattern);
      }
    } catch(e){}
    return false;
  }

  function tryGateRateLimit(opts){
    if (isHapticsDisabled()) return false;
    const t = nowMs();
    const minGap = Math.max(MIN_HAPTIC_INTERVAL_MS, (opts && +opts.minIntervalMs > 0) ? +opts.minIntervalMs : MIN_HAPTIC_INTERVAL_MS);
    if ((t - lastHapticMs) < minGap) return false;
    lastHapticMs = t;
    if (opts && opts.fromGesture) userGestureSeen = true;
    return true;
  }

  /* ---------- Tactile Feedback Suite (`window.BTHaptics`) ---------- */
  const BTHaptics = {
    MIN_INTERVAL_MS: MIN_HAPTIC_INTERVAL_MS,

    isMuted: function(){
      return isSoundMuted();
    },

    isDisabled: function(){
      return isHapticsDisabled();
    },

    lastFiredAt: function(){
      return lastHapticMs;
    },

    resetRateLimitForTest: function(){
      lastHapticMs = -1000;
    },

    primeAudio: primeAudio,

    tick: function(opts){
      if (!tryGateRateLimit(opts)) return false;
      const plugins = capPlugins();
      if (plugins && plugins.Haptics && typeof plugins.Haptics.selectionChanged === 'function'){
        try { plugins.Haptics.selectionChanged(); return true; } catch(e){}
      }
      const vib = vibrateWeb(3);
      const aud = playMicroDetent(1760, 460, 0.0022, 0.015, 'triangle');
      return !!(vib || aud || true);
    },

    snap: function(opts){
      if (!tryGateRateLimit(opts)) return false;
      const plugins = capPlugins();
      if (plugins && plugins.Haptics && typeof plugins.Haptics.impact === 'function'){
        try { plugins.Haptics.impact({ style:'LIGHT' }); return true; } catch(e){}
      }
      const vib = vibrateWeb(8);
      const aud = playMicroDetent(1320, 310, 0.0027, 0.022, 'triangle');
      return !!(vib || aud || true);
    },

    sweetSpotLock: function(opts){
      if (!tryGateRateLimit(opts)) return false;
      const plugins = capPlugins();
      if (plugins && plugins.Haptics && typeof plugins.Haptics.impact === 'function'){
        try { plugins.Haptics.impact({ style:'MEDIUM' }); return true; } catch(e){}
      }
      const vib = vibrateWeb([8, 26, 12]);
      const aud = playMicroDetent(1980, 660, 0.0028, 0.024, 'sine');
      return !!(vib || aud || true);
    },

    foilScratch: function(opts){
      if (!tryGateRateLimit(opts)) return false;
      const plugins = capPlugins();
      if (plugins && plugins.Haptics && typeof plugins.Haptics.selectionChanged === 'function'){
        try { plugins.Haptics.selectionChanged(); return true; } catch(e){}
      }
      const vib = vibrateWeb(2);
      const aud = playMicroDetent(2450, 920, 0.0018, 0.010, 'sawtooth');
      return !!(vib || aud || true);
    },

    celebrate: function(opts){
      if (!tryGateRateLimit(opts)) return false;
      const plugins = capPlugins();
      if (plugins && plugins.Haptics && typeof plugins.Haptics.notification === 'function'){
        try { plugins.Haptics.notification({ type:'SUCCESS' }); } catch(e){}
      } else {
        vibrateWeb([12, 34, 16, 38, 22]);
      }
      playHarmonicCue([523.25, 659.25, 783.99, 1046.50], 0.065, 0.024);
      return true;
    },

    milestoneChime: function(opts){
      if (!tryGateRateLimit(opts)) return false;
      const plugins = capPlugins();
      if (plugins && plugins.Haptics && typeof plugins.Haptics.impact === 'function'){
        try { plugins.Haptics.impact({ style:'MEDIUM' }); } catch(e){}
      } else {
        vibrateWeb([14, 28, 10]);
      }
      playHarmonicCue([587.33, 880.00], 0.055, 0.022);
      return true;
    },

    selection: function(opts){
      return BTHaptics.tick(opts);
    },

    impact: function(style, opts){
      const s = String(style || 'light').toUpperCase();
      if (s === 'HEAVY' || s === 'MEDIUM') return BTHaptics.sweetSpotLock(opts);
      return BTHaptics.snap(opts);
    }
  };

  /* ---------- Screen Wake Lock (`BTPlatform.keepAwake`) ---------- */
  async function acquireWakeLock(reason){
    wakeWanted = true;
    if (reason) wakeReason = String(reason);

    const plugins = capPlugins();
    if (plugins && plugins.KeepAwake && typeof plugins.KeepAwake.keepAwake === 'function'){
      try {
        await plugins.KeepAwake.keepAwake();
        nativeKeepAwakeActive = true;
        return { ok:true, active:true, mode:'capacitor-keep-awake', reason:wakeReason };
      } catch(e){}
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.wakeLock && typeof navigator.wakeLock.request === 'function'){
        if (wakeSentinel && !wakeSentinel.released){
          return { ok:true, active:true, mode:'web-wakelock', reason:wakeReason };
        }
        const sentinel = await navigator.wakeLock.request('screen');
        wakeSentinel = sentinel;
        if (sentinel && typeof sentinel.addEventListener === 'function'){
          sentinel.addEventListener('release', function(){
            if (wakeSentinel === sentinel) wakeSentinel = null;
          });
        }
        return { ok:true, active:true, mode:'web-wakelock', reason:wakeReason };
      }
    } catch(e){
      wakeSentinel = null;
      return { ok:false, active:false, mode:'denied-or-unsupported', reason:wakeReason };
    }
    return { ok:false, active:false, mode:'unsupported', reason:wakeReason };
  }

  async function releaseWakeLock(){
    wakeWanted = false;
    wakeReason = '';
    const plugins = capPlugins();
    if (plugins && plugins.KeepAwake && typeof plugins.KeepAwake.allowSleep === 'function'){
      try { await plugins.KeepAwake.allowSleep(); } catch(e){}
    }
    nativeKeepAwakeActive = false;
    if (wakeSentinel){
      const cur = wakeSentinel;
      wakeSentinel = null;
      try {
        if (typeof cur.release === 'function') await cur.release();
      } catch(e){}
    }
    return { ok:true, active:false };
  }

  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function'){
    document.addEventListener('visibilitychange', function(){
      if (document.visibilityState === 'visible' && (wakeWanted || isBrewOrCuppingActive()) && !wakeSentinel){
        acquireWakeLock(wakeReason || 'visibility-reacquire').catch(function(){});
      }
    });
  }

  const keepAwake = {
    isSupported: function(){
      const plugins = capPlugins();
      if (plugins && plugins.KeepAwake) return true;
      return !!(typeof navigator !== 'undefined' && navigator.wakeLock && typeof navigator.wakeLock.request === 'function');
    },
    isActive: function(){
      return !!(nativeKeepAwakeActive || (wakeSentinel && !wakeSentinel.released));
    },
    isWanted: function(){
      return !!wakeWanted;
    },
    request: acquireWakeLock,
    acquire: acquireWakeLock,
    on: acquireWakeLock,
    release: releaseWakeLock,
    allowSleep: releaseWakeLock,
    off: releaseWakeLock
  };

  /* ---------- Clipboard, Blob Download, File Picker & Native Vault Mirror (`files` & `share`) ---------- */
  async function copyText(text){
    const str = String(text == null ? '' : text);
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function'){
        await navigator.clipboard.writeText(str);
        return true;
      }
    } catch(e){}
    try {
      if (typeof document !== 'undefined' && document.body){
        const ta = document.createElement('textarea');
        ta.value = str;
        ta.setAttribute('readonly', 'readonly');
        ta.style.position = 'fixed';
        ta.style.top = '-9999px';
        ta.style.left = '-9999px';
        ta.style.fontSize = '16px';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        try { ta.focus({ preventScroll:true }); } catch(e){}
        ta.select();
        try { ta.setSelectionRange(0, str.length); } catch(e){}
        const ok = !!(typeof document.execCommand === 'function' && document.execCommand('copy'));
        document.body.removeChild(ta);
        return ok;
      }
    } catch(e){}
    return false;
  }

  function downloadBlob(filename, contentOrBlob, mimeType){
    try {
      if (typeof document === 'undefined' || !document.body || typeof Blob === 'undefined' || typeof URL === 'undefined') return false;
      const safeName = String(filename || 'beantelligence-export.txt').replace(/[\\/:*?"<>|]+/g, '-');
      const mime = mimeType || 'text/plain;charset=utf-8';
      const blob = (contentOrBlob instanceof Blob)
        ? contentOrBlob
        : new Blob([contentOrBlob == null ? '' : contentOrBlob], { type:mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = safeName;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(function(){
        try {
          if (a.parentNode) a.parentNode.removeChild(a);
          URL.revokeObjectURL(url);
        } catch(e){}
      }, 250);
      return true;
    } catch(e){
      return false;
    }
  }

  function canUseFileSystemAccess(){
    try {
      return !!(typeof global.showOpenFilePicker === 'function' &&
        typeof global.showSaveFilePicker === 'function' &&
        global.isSecureContext !== false);
    } catch(e){
      return false;
    }
  }

  async function openTextFile(opts){
    const o = opts || {};
    if (o.preferHandle && canUseFileSystemAccess()){
      try {
        const pickerOpts = { multiple:!!o.multiple };
        if (Array.isArray(o.types) && o.types.length) pickerOpts.types = o.types;
        const handles = await global.showOpenFilePicker(pickerOpts);
        if (!handles || !handles.length) return { ok:false, cancelled:true };
        const handle = handles[0];
        const file = await handle.getFile();
        const text = await file.text();
        return {
          ok:true,
          method:'file-handle',
          name:file.name || handle.name || '',
          text:text,
          file:file,
          handle:handle,
          lastModified:file.lastModified || 0
        };
      } catch(e){
        if (e && e.name === 'AbortError') return { ok:false, cancelled:true };
      }
    }

    if (typeof document === 'undefined' || !document.body){
      return { ok:false, error:'Document unavailable' };
    }

    return new Promise(function(resolve){
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = o.accept || '.csv,.txt,.json,.btbackup,text/csv,application/json,text/plain';
      if (o.multiple) input.multiple = true;
      input.style.position = 'fixed';
      input.style.top = '-9999px';
      input.style.opacity = '0';
      document.body.appendChild(input);

      let settled = false;
      const finish = function(res){
        if (settled) return;
        settled = true;
        try { if (input.parentNode) input.parentNode.removeChild(input); } catch(e){}
        resolve(res);
      };

      input.addEventListener('change', function(){
        const f = input.files && input.files[0];
        if (!f){
          finish({ ok:false, cancelled:true });
          return;
        }
        if (typeof f.text === 'function'){
          f.text().then(function(txt){
            finish({ ok:true, method:'input-file', name:f.name, text:txt, file:f, lastModified:f.lastModified || 0 });
          }).catch(function(err){
            finish({ ok:false, error:err && err.message ? err.message : 'Read failed' });
          });
        } else {
          const reader = new FileReader();
          reader.onload = function(){
            finish({ ok:true, method:'input-file', name:f.name, text:String(reader.result || ''), file:f, lastModified:f.lastModified || 0 });
          };
          reader.onerror = function(){
            finish({ ok:false, error:'FileReader failed' });
          };
          reader.readAsText(f, 'UTF-8');
        }
      });

      input.addEventListener('cancel', function(){
        finish({ ok:false, cancelled:true });
      });

      input.click();
    });
  }

  async function saveTextFile(opts){
    const o = opts || {};
    const filename = String(o.filename || 'BeanTelligence-Backup.txt');
    const content = String(o.content == null ? '' : o.content);
    const mimeType = o.mimeType || 'text/plain;charset=utf-8';

    if (o.handle && typeof o.handle.createWritable === 'function'){
      try {
        const writable = await o.handle.createWritable();
        await writable.write(content);
        await writable.close();
        return { ok:true, method:'file-handle', handle:o.handle, name:o.handle.name || filename };
      } catch(e){
        if (e && e.name === 'AbortError') return { ok:false, cancelled:true };
      }
    }

    if (o.preferPicker && canUseFileSystemAccess()){
      try {
        const saveOpts = { suggestedName:filename };
        if (Array.isArray(o.types) && o.types.length) saveOpts.types = o.types;
        const handle = await global.showSaveFilePicker(saveOpts);
        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();
        return { ok:true, method:'file-handle', handle:handle, name:handle.name || filename };
      } catch(e){
        if (e && e.name === 'AbortError') return { ok:false, cancelled:true };
      }
    }

    const plugins = capPlugins();
    if (plugins && plugins.Filesystem && typeof plugins.Filesystem.writeFile === 'function'){
      try {
        const wr = await plugins.Filesystem.writeFile({
          path:filename,
          data:content,
          directory:o.directory || 'DOCUMENTS',
          encoding:'utf8',
          recursive:true
        });
        return { ok:true, method:'capacitor-fs', name:filename, uri:(wr && wr.uri) || '' };
      } catch(e){}
    }

    const dlOk = downloadBlob(filename, content, mimeType);
    return { ok:dlOk, method:'blob-download', name:filename };
  }

  /**
   * Horizon-2 Native `Directory.Data` Immortal Vault Mirror
   * Automatically persists `#BEANTELLIGENCE-PARTS 1` bundles to native app-private `DATA` directory
   * when running under Capacitor iOS/Android, with clean local fallback in test/web contexts.
   */
  async function writeVaultMirror(relPath, content){
    const cleanPath = 'vault/' + String(relPath || 'live-vault.btbackup').replace(/^\/+|vault\//g, '');
    const text = String(content == null ? '' : content);
    const plugins = capPlugins();
    if (plugins && plugins.Filesystem && typeof plugins.Filesystem.writeFile === 'function'){
      const res = await plugins.Filesystem.writeFile({
        path:cleanPath,
        data:text,
        directory:'DATA',
        encoding:'utf8',
        recursive:true
      });
      return { ok:true, mode:'capacitor-data-dir', directory:'DATA', path:cleanPath, uri:(res && res.uri) || ('capacitor://data/' + cleanPath), bytes:text.length };
    }
    try {
      if (typeof sessionStorage !== 'undefined'){
        sessionStorage.setItem(VAULT_FALLBACK_PREFIX + cleanPath, text);
      }
    } catch(e){}
    return { ok:true, mode:'web-noop-mirror', directory:'MEMORY', path:cleanPath, bytes:text.length };
  }

  async function readVaultMirror(relPath){
    const cleanPath = 'vault/' + String(relPath || 'live-vault.btbackup').replace(/^\/+|vault\//g, '');
    const plugins = capPlugins();
    if (plugins && plugins.Filesystem && typeof plugins.Filesystem.readFile === 'function'){
      try {
        const res = await plugins.Filesystem.readFile({
          path:cleanPath,
          directory:'DATA',
          encoding:'utf8'
        });
        const data = res && typeof res.data === 'string' ? res.data : '';
        return { ok:data.length > 0, mode:'capacitor-data-dir', directory:'DATA', path:cleanPath, data:data };
      } catch(e){
        return { ok:false, mode:'capacitor-data-dir', directory:'DATA', path:cleanPath, data:'' };
      }
    }
    try {
      if (typeof sessionStorage !== 'undefined'){
        const cached = sessionStorage.getItem(VAULT_FALLBACK_PREFIX + cleanPath);
        if (typeof cached === 'string' && cached.length > 0){
          return { ok:true, mode:'web-noop-mirror', directory:'MEMORY', path:cleanPath, data:cached };
        }
      }
    } catch(e){}
    return { ok:false, mode:'web-noop-mirror', directory:'MEMORY', path:cleanPath, data:'' };
  }

  const files = {
    canUseFileSystemAccess: canUseFileSystemAccess,
    openText: openTextFile,
    saveText: saveTextFile,
    downloadBlob: downloadBlob,
    copyText: copyText,
    writeVaultMirror: writeVaultMirror,
    readVaultMirror: readVaultMirror
  };

  /* ---------- Web Share API Level 2 (`navigator.share({ files })` -> Fallback) ---------- */
  function buildFileList(payload){
    const p = payload || {};
    if (Array.isArray(p.files) && p.files.length) return p.files;
    if (p.filename && p.content != null && typeof File === 'function'){
      try {
        const mime = p.mimeType || (/\.csv$/i.test(p.filename) ? 'text/csv' : /\.json$/i.test(p.filename) ? 'application/json' : 'text/plain');
        return [new File([p.content], p.filename, { type:mime })];
      } catch(e){}
    }
    return [];
  }

  function canShareFiles(fileList){
    try {
      if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') return false;
      if (!Array.isArray(fileList) || !fileList.length) return true;
      if (typeof navigator.canShare === 'function'){
        return !!navigator.canShare({ files:fileList });
      }
      return false;
    } catch(e){
      return false;
    }
  }

  async function sharePayload(payload){
    const p = payload || {};
    const title = p.title ? String(p.title) : 'BeanTelligence';
    const text = p.text != null ? String(p.text) : '';
    const url = p.url ? String(p.url) : undefined;
    const fileList = buildFileList(p);

    const plugins = capPlugins();
    if (plugins && plugins.Share && typeof plugins.Share.share === 'function'){
      try {
        let fileUri = undefined;
        if (fileList.length && plugins.Filesystem && typeof plugins.Filesystem.writeFile === 'function'){
          const f0 = fileList[0];
          const bodyTxt = p.content != null ? String(p.content) : (typeof f0.text === 'function' ? await f0.text() : '');
          const cached = await plugins.Filesystem.writeFile({
            path:f0.name || p.filename || 'BeanTelligence-Share.txt',
            data:bodyTxt,
            directory:'CACHE',
            encoding:'utf8'
          });
          if (cached && cached.uri) fileUri = cached.uri;
        }
        await plugins.Share.share({ title:title, text:text, url:fileUri || url });
        return { ok:true, method:'capacitor-share' };
      } catch(e){
        if (e && /cancel|abort/i.test(String(e.message || e.name || ''))){
          return { ok:false, cancelled:true, method:'cancelled' };
        }
      }
    }

    if (fileList.length && canShareFiles(fileList)){
      try {
        const shareObj = { title:title, files:fileList };
        if (text) shareObj.text = text;
        await navigator.share(shareObj);
        return { ok:true, method:'web-share-files' };
      } catch(e){
        if (e && e.name === 'AbortError'){
          return { ok:false, cancelled:true, method:'cancelled' };
        }
      }
    }

    if (!fileList.length && typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (text || url)){
      try {
        const shareObj = { title:title };
        if (text) shareObj.text = text;
        if (url) shareObj.url = url;
        await navigator.share(shareObj);
        return { ok:true, method:'web-share-text' };
      } catch(e){
        if (e && e.name === 'AbortError'){
          return { ok:false, cancelled:true, method:'cancelled' };
        }
      }
    }

    if (fileList.length){
      const f0 = fileList[0];
      const dlOk = downloadBlob(f0.name || p.filename || 'BeanTelligence-Export.txt', p.content != null ? p.content : f0, f0.type || p.mimeType);
      if (dlOk) return { ok:true, method:'download-fallback' };
    }

    const fallbackCopy = text || (p.content != null ? String(p.content) : '') || url || '';
    if (fallbackCopy){
      const copied = await copyText(fallbackCopy);
      if (copied) return { ok:true, method:'clipboard-fallback' };
    }

    return { ok:false, method:'unavailable' };
  }

  const share = {
    canShareFiles: canShareFiles,
    share: sharePayload,
    copyText: copyText
  };

  /* ---------- Camera & EXIF-Stripped Downscaler (`BTPlatform.camera`) ---------- */
  function isStreamSupported(){
    return !!(typeof navigator !== 'undefined' && navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function');
  }

  async function openCameraStream(opts){
    const o = opts || {};
    if (!isStreamSupported()){
      return { ok:false, error:'Camera stream API unavailable in this browser' };
    }
    try {
      const facing = o.facingMode || 'environment';
      const stream = await navigator.mediaDevices.getUserMedia({
        audio:false,
        video:{
          facingMode:{ ideal:facing },
          width:{ ideal:o.width || 1600 },
          height:{ ideal:o.height || 1200 }
        }
      });
      return {
        ok:true,
        stream:stream,
        stop:function(){
          try {
            stream.getTracks().forEach(function(tr){ tr.stop(); });
          } catch(e){}
        }
      };
    } catch(e){
      return {
        ok:false,
        denied:!!(e && (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError')),
        error:(e && e.message) || 'Camera access declined or unavailable'
      };
    }
  }

  function downscaleDrawableToCanvas(source, srcW, srcH, maxDim){
    if (typeof document === 'undefined') return null;
    const cap = Math.max(128, +maxDim || 1600);
    const scale = Math.min(1, cap / Math.max(1, srcW, srcH));
    const w = Math.max(1, Math.round(srcW * scale));
    const h = Math.max(1, Math.round(srcH * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently:true });
    if (!ctx) return null;
    ctx.drawImage(source, 0, 0, w, h);
    let dataUrl = '';
    try { dataUrl = canvas.toDataURL('image/jpeg', 0.88); } catch(e){}
    return {
      ok:true,
      canvas:canvas,
      ctx:ctx,
      width:w,
      height:h,
      dataUrl:dataUrl,
      getImageData:function(){
        return ctx.getImageData(0, 0, w, h);
      }
    };
  }

  function captureFrameFromVideo(videoEl, maxDim){
    if (!videoEl || !(videoEl.videoWidth > 0 && videoEl.videoHeight > 0)){
      return { ok:false, error:'Video element has no active dimensions' };
    }
    const res = downscaleDrawableToCanvas(videoEl, videoEl.videoWidth, videoEl.videoHeight, maxDim || 1600);
    return res || { ok:false, error:'Canvas 2D unavailable' };
  }

  function decodeBlobOrUrlToCanvas(blobOrUrl, maxDim){
    return new Promise(function(resolve){
      if (typeof Image === 'undefined'){
        resolve({ ok:false, error:'Image constructor unavailable' });
        return;
      }
      const img = new Image();
      let revokeUrl = '';
      if (typeof blobOrUrl !== 'string' && typeof URL !== 'undefined' && blobOrUrl){
        revokeUrl = URL.createObjectURL(blobOrUrl);
      }
      img.onload = function(){
        const out = downscaleDrawableToCanvas(img, img.naturalWidth || img.width || 800, img.naturalHeight || img.height || 600, maxDim || 1600);
        if (revokeUrl){ try { URL.revokeObjectURL(revokeUrl); } catch(e){} }
        resolve(out || { ok:false, error:'Canvas decode failed' });
      };
      img.onerror = function(){
        if (revokeUrl){ try { URL.revokeObjectURL(revokeUrl); } catch(e){} }
        resolve({ ok:false, error:'Failed to decode image' });
      };
      img.src = revokeUrl || String(blobOrUrl);
    });
  }

  async function pickOrSnapImage(opts){
    const o = opts || {};
    const maxDim = o.maxDim || 1600;
    const plugins = capPlugins();
    if (plugins && plugins.Camera && typeof plugins.Camera.getPhoto === 'function'){
      try {
        const photo = await plugins.Camera.getPhoto({
          quality:88,
          allowEditing:false,
          resultType:'dataUrl',
          source:o.source || 'PROMPT',
          width:maxDim
        });
        if (photo && photo.dataUrl){
          return await decodeBlobOrUrlToCanvas(photo.dataUrl, maxDim);
        }
      } catch(e){
        if (e && /cancel/i.test(String(e.message || ''))) return { ok:false, cancelled:true };
      }
    }

    if (typeof document === 'undefined' || !document.body){
      return { ok:false, error:'Document unavailable' };
    }

    return new Promise(function(resolve){
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      if (o.capture !== false){
        input.setAttribute('capture', o.facingMode || 'environment');
      }
      input.style.position = 'fixed';
      input.style.top = '-9999px';
      input.style.opacity = '0';
      document.body.appendChild(input);

      let settled = false;
      const done = function(res){
        if (settled) return;
        settled = true;
        try { if (input.parentNode) input.parentNode.removeChild(input); } catch(e){}
        resolve(res);
      };

      input.addEventListener('change', function(){
        const f = input.files && input.files[0];
        if (!f){ done({ ok:false, cancelled:true }); return; }
        decodeBlobOrUrlToCanvas(f, maxDim).then(function(decoded){
          if (decoded && decoded.ok) decoded.name = f.name || 'capture.jpg';
          done(decoded);
        });
      });

      input.addEventListener('cancel', function(){
        done({ ok:false, cancelled:true });
      });

      input.click();
    });
  }

  const camera = {
    isStreamSupported: isStreamSupported,
    openStream: openCameraStream,
    captureFrameFromVideo: captureFrameFromVideo,
    pickOrSnapImage: pickOrSnapImage
  };

  /* ---------- Theme & Status Bar Sync (`BTPlatform.theme`) ---------- */
  function resolveThemeMode(mode){
    const m = String(mode || '').trim().toLowerCase();
    if (m === 'dark' || m === 'light') return m;
    try {
      if (typeof global.matchMedia === 'function' && global.matchMedia('(prefers-color-scheme: dark)').matches){
        return 'dark';
      }
    } catch(e){}
    return 'light';
  }

  function syncTheme(mode, customColor){
    const resolved = resolveThemeMode(mode);
    const color = customColor || (resolved === 'dark' ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);
    try {
      if (typeof document !== 'undefined' && document.documentElement){
        document.documentElement.setAttribute('data-theme', resolved);
        document.documentElement.style.colorScheme = resolved;
        if (document.head){
          let meta = document.querySelector('meta[name="theme-color"]');
          if (!meta){
            meta = document.createElement('meta');
            meta.setAttribute('name', 'theme-color');
            document.head.appendChild(meta);
          }
          meta.setAttribute('content', color);
        }
      }
    } catch(e){}

    const plugins = capPlugins();
    if (plugins && plugins.StatusBar){
      try {
        if (typeof plugins.StatusBar.setStyle === 'function'){
          plugins.StatusBar.setStyle({ style:resolved === 'dark' ? 'DARK' : 'LIGHT' });
        }
        if (typeof plugins.StatusBar.setBackgroundColor === 'function'){
          plugins.StatusBar.setBackgroundColor({ color:color });
        }
      } catch(e){}
    }
    return { theme:resolved, color:color };
  }

  const theme = {
    LIGHT_COLOR: LIGHT_THEME_COLOR,
    DARK_COLOR: DARK_THEME_COLOR,
    resolve: resolveThemeMode,
    sync: syncTheme
  };

  /* ---------- Safe Non-Intrusive PWA / Service Worker Helper (`BTPlatform.pwa`) ---------- */
  function notifySwUpdateListeners(){
    swUpdateListeners.forEach(function(fn){
      try { fn({ updateAvailable:swUpdateAvailable }); } catch(e){}
    });
  }

  async function registerServiceWorker(swPath){
    if (isNative()) return { ok:false, skipped:'capacitor-native' };
    try {
      if (typeof location === 'undefined' || location.protocol === 'file:'){
        return { ok:false, skipped:'file-protocol' };
      }
      if (typeof navigator === 'undefined' || !navigator.serviceWorker || typeof navigator.serviceWorker.register !== 'function'){
        return { ok:false, skipped:'unsupported' };
      }
      const reg = await navigator.serviceWorker.register(swPath || './sw.js', { scope:'./' });
      swRegistration = reg;
      if (reg.waiting){
        swUpdateAvailable = true;
        notifySwUpdateListeners();
      }
      reg.addEventListener('updatefound', function(){
        const nw = reg.installing;
        if (!nw) return;
        nw.addEventListener('statechange', function(){
          if (nw.state === 'installed' && navigator.serviceWorker.controller){
            swUpdateAvailable = true;
            notifySwUpdateListeners();
          }
        });
      });
      navigator.serviceWorker.addEventListener('message', function(ev){
        if (ev && ev.data && ev.data.type === 'BT_SW_UPDATE_READY'){
          swUpdateAvailable = true;
          notifySwUpdateListeners();
        }
      });
      return { ok:true, registration:reg };
    } catch(e){
      return { ok:false, error:(e && e.message) || 'SW registration failed' };
    }
  }

  function applyPendingUpdateIfSafe(){
    if (isBrewOrCuppingActive()){
      return { ok:false, deferred:true, reason:'brew-active' };
    }
    try {
      if (swRegistration && swRegistration.waiting){
        swRegistration.waiting.postMessage({ type:'BT_SKIP_WAITING', brewActive:false });
        swUpdateAvailable = false;
        return { ok:true, activated:true };
      }
    } catch(e){}
    return { ok:false, activated:false };
  }

  const pwa = {
    isStandalone: function(){
      if (isNative()) return true;
      try {
        if (typeof global.matchMedia === 'function' && global.matchMedia('(display-mode: standalone)').matches) return true;
        if (typeof navigator !== 'undefined' && navigator.standalone === true) return true;
      } catch(e){}
      return false;
    },
    isUpdateAvailable: function(){
      return !!swUpdateAvailable;
    },
    onUpdateReady: function(fn){
      if (typeof fn !== 'function') return function(){};
      swUpdateListeners.add(fn);
      return function(){ swUpdateListeners.delete(fn); };
    },
    registerServiceWorker: registerServiceWorker,
    applyPendingUpdateIfSafe: applyPendingUpdateIfSafe
  };

  const BTPlatform = {
    haptics: BTHaptics,
    keepAwake: keepAwake,
    share: share,
    files: files,
    camera: camera,
    theme: theme,
    pwa: pwa,
    copyText: copyText,
    primeAudio: primeAudio,
    clipboard: { writeText: copyText },
    isNative: isNative,
    getPlatform: getPlatform,
    isBrewActive: isBrewOrCuppingActive
  };

  global.BTHaptics = BTHaptics;
  global.BTPlatform = BTPlatform;
})(typeof window !== 'undefined' ? window : globalThis);
/* ============================================================================
 * BeanTelligence v6.0 — 15-Family Binary BLE GATT Codecs & MTU Ring-Buffers
 * Pure, Deterministic Binary Decoders, Command Builders & Magic-Byte Promotion
 * Exports: window.BTBleCodecs
 * ============================================================================ */
(function(global){
  'use strict';

  const MAX_RING_BYTES = 256;

  /* ---------- Canonical 128-Bit Normalized GATT UUID Registry ---------- */
  const UUID = {
    /* Scales (11 Families) */
    ACAIA_LEGACY_SVC:     '00001820-0000-1000-8000-00805f9b34fb',
    ACAIA_LEGACY_CHAR:    '00002a80-0000-1000-8000-00805f9b34fb',
    ACAIA_PYXIS_SVC:      '49535343-fe7d-4ae5-8fa9-9fafd205e455',
    ACAIA_PYXIS_NOTIFY:   '49535343-1e4d-4bd9-ba61-23c647249616',
    ACAIA_PYXIS_WRITE:    '49535343-8841-43f4-a8d4-ecbe34729bb3',

    DIFLUID_SCALE_SVC:    '000000ee-0000-1000-8000-00805f9b34fb',
    DIFLUID_SCALE_ALT_SVC:'000000dd-0000-1000-8000-00805f9b34fb',
    DIFLUID_CHAR:         '0000aa01-0000-1000-8000-00805f9b34fb',
    DIFLUID_WRITE_ALT:    '0000aa02-0000-1000-8000-00805f9b34fb',

    BOOKOO_SVC:           '00000ffe-0000-1000-8000-00805f9b34fb',
    BOOKOO_NOTIFY:        '0000ff11-0000-1000-8000-00805f9b34fb',
    BOOKOO_WRITE:         '0000ff12-0000-1000-8000-00805f9b34fb',

    SHARED_FFF0_SVC:      '0000fff0-0000-1000-8000-00805f9b34fb',
    DECENT_SVC:           '0000fff0-0000-1000-8000-00805f9b34fb',
    DECENT_NOTIFY:        '0000fff4-0000-1000-8000-00805f9b34fb',
    DECENT_WRITE:         '000036f5-0000-1000-8000-00805f9b34fb',

    FFF1_NOTIFY:          '0000fff1-0000-1000-8000-00805f9b34fb',
    FFF2_WRITE:           '0000fff2-0000-1000-8000-00805f9b34fb',
    TIMEMORE_OSP_NOTIFY:  '0000fff1-0000-1000-8000-00805f9b34fb',
    TIMEMORE_OSP_WRITE:   '0000fff2-0000-1000-8000-00805f9b34fb',
    TIMEMORE_CUSTOM_SVC:  '553f4e48-bf21-4468-9c6c-0e4fb5b17697',
    TIMEMORE_CUSTOM_WRITE:'553f4e49-bf21-4468-9c6c-0e4fb5b17697',

    NUS_SVC:              '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
    NUS_WRITE:            '6e400002-b5a3-f393-e0a9-e50e24dcca9e',
    NUS_NOTIFY:           '6e400003-b5a3-f393-e0a9-e50e24dcca9e',

    FELICITA_SVC:         '0000ffe0-0000-1000-8000-00805f9b34fb',
    FELICITA_CHAR:        '0000ffe1-0000-1000-8000-00805f9b34fb',

    SKALE_SVC:            '0000ff08-0000-1000-8000-00805f9b34fb',
    SKALE_WRITE:          '0000ef80-0000-1000-8000-00805f9b34fb',
    SKALE_NOTIFY:         '0000ef81-0000-1000-8000-00805f9b34fb',
    SKALE_BTN_NOTIFY:     '0000ef82-0000-1000-8000-00805f9b34fb',

    EUREKA_ALT_SVC:       '0000ffb0-0000-1000-8000-00805f9b34fb',
    EUREKA_ALT_CHAR:      '0000ffb2-0000-1000-8000-00805f9b34fb',

    HIROIA_SVC:           '06c31822-8682-4744-9211-febc93e3bece',
    HIROIA_WRITE:         '06c31823-8682-4744-9211-febc93e3bece',
    HIROIA_NOTIFY:        '06c31824-8682-4744-9211-febc93e3bece',

    WEIGHT_SIG_SVC:       '0000181d-0000-1000-8000-00805f9b34fb',
    WEIGHT_SIG_NOTIFY:    '00002a9d-0000-1000-8000-00805f9b34fb',
    TIMEMORE_SIG_WRITE:   '00002a9e-0000-1000-8000-00805f9b34fb',
    WEIGHT_SIG_CTRL:      '00002a9f-0000-1000-8000-00805f9b34fb',

    /* Espresso Pressure Sensors (ESS 0x181A + Pressensor + Bookoo EM) */
    ESS_SVC:              '0000181a-0000-1000-8000-00805f9b34fb',
    ESS_TEMP_CHAR:        '00002a6e-0000-1000-8000-00805f9b34fb',
    PRESSENSOR_SIG_SVC:   '0000185b-0000-1000-8000-00805f9b34fb',
    PRESSENSOR_SIG_CHAR:  '00002a6d-0000-1000-8000-00805f9b34fb',
    PRESSENSOR_SVC:       '873ae82a-4c5a-4342-b539-9d900bf7ebd0',
    PRESSENSOR_NOTIFY:    '873ae82b-4c5a-4342-b539-9d900bf7ebd0',
    PRESSENSOR_WRITE:     '873ae82c-4c5a-4342-b539-9d900bf7ebd0',

    BOOKOO_EM_SVC:        '00000fff-0000-1000-8000-00805f9b34fb',
    BOOKOO_EM_NOTIFY:     '0000ff01-0000-1000-8000-00805f9b34fb',
    BOOKOO_EM_WRITE:      '0000ff02-0000-1000-8000-00805f9b34fb',

    /* Refractometer & Roast/PSD Analyzer */
    DIFLUID_SVC:          '000000ff-0000-1000-8000-00805f9b34fb',
    DIFLUID_OMNI_SVC:     '000000fc-0000-1000-8000-00805f9b34fb',
    DIFLUID_V3_SVC:       '0e140001-0000-1000-8000-00805f9b34fb',
    DIFLUID_V3_NOTIFY:    '0e140002-0000-1000-8000-00805f9b34fb',
    DIFLUID_V3_WRITE:     '0e140003-0000-1000-8000-00805f9b34fb',

    /* Smart Brewer & Kettle */
    XBLOOM_SVC:           '0000e0ff-3c17-d293-8e48-14fe2e4da212',
    XBLOOM_SHORT_SVC:     '0000ffe0-0000-1000-8000-00805f9b34fb',
    XBLOOM_WRITE:         '0000ffe1-3c17-d293-8e48-14fe2e4da212',
    XBLOOM_NOTIFY:        '0000ffe2-3c17-d293-8e48-14fe2e4da212',
    XBLOOM_AUX:           '0000ffe3-3c17-d293-8e48-14fe2e4da212',
    XBLOOM_SHORT_WRITE:   '0000ffe1-0000-1000-8000-00805f9b34fb',
    XBLOOM_SHORT_NOTIFY:  '0000ffe2-0000-1000-8000-00805f9b34fb',

    STAGG_EKG_SVC:        '00001820-0000-1000-8000-00805f9b34fb',
    STAGG_EKG_CHAR:       '00002a80-0000-1000-8000-00805f9b34fb',
    STAGG_EKG_ALT_CHAR:   '2291c4b5-5d7f-4477-a88b-b266edb97142',

    /* Standard Battery & Device Information */
    BATTERY_SVC:          '0000180f-0000-1000-8000-00805f9b34fb',
    BATTERY_LEVEL:        '00002a19-0000-1000-8000-00805f9b34fb',
    DEVICE_INFO_SVC:      '0000180a-0000-1000-8000-00805f9b34fb'
  };

  /* Complete Superset of All Coffee GATT Services so Web Bluetooth Never Hides Secondary Services */
  const ALL_COFFEE_OPTIONAL_SERVICES = [
    UUID.WEIGHT_SIG_SVC,
    UUID.ACAIA_LEGACY_SVC,
    UUID.ACAIA_PYXIS_SVC,
    UUID.DIFLUID_SCALE_SVC,
    UUID.DIFLUID_SCALE_ALT_SVC,
    UUID.DIFLUID_SVC,
    UUID.DIFLUID_OMNI_SVC,
    UUID.DIFLUID_V3_SVC,
    UUID.BOOKOO_SVC,
    UUID.BOOKOO_EM_SVC,
    UUID.ESS_SVC,
    UUID.PRESSENSOR_SIG_SVC,
    UUID.SHARED_FFF0_SVC,
    UUID.FELICITA_SVC,
    UUID.SKALE_SVC,
    UUID.EUREKA_ALT_SVC,
    UUID.HIROIA_SVC,
    UUID.TIMEMORE_CUSTOM_SVC,
    UUID.PRESSENSOR_SVC,
    UUID.XBLOOM_SVC,
    UUID.NUS_SVC,
    UUID.BATTERY_SVC,
    UUID.DEVICE_INFO_SVC
  ];

  /* ---------- Binary Conversion & Checksum Primitives ---------- */
  function normUuid(u){
    if (typeof u === 'number'){
      return '0000' + (u & 0xFFFF).toString(16).padStart(4, '0') + '-0000-1000-8000-00805f9b34fb';
    }
    const s = String(u || '').trim().toLowerCase();
    if (/^[0-9a-f]{4}$/.test(s)) return '0000' + s + '-0000-1000-8000-00805f9b34fb';
    if (/^0x[0-9a-f]{1,4}$/.test(s)) return '0000' + s.slice(2).padStart(4, '0') + '-0000-1000-8000-00805f9b34fb';
    return s;
  }

  function hexToBytes(hex){
    const clean = String(hex || '').replace(/^0x/i, '').replace(/[^0-9a-f]/gi, '');
    if (!clean.length) return new Uint8Array(0);
    const len = clean.length >>> 1;
    const out = new Uint8Array(len);
    for (let i = 0; i < len; i++){
      out[i] = parseInt(clean.substr(i * 2, 2), 16) & 0xFF;
    }
    return out;
  }

  function bytesToHex(input){
    const b = toU8(input);
    let out = '';
    for (let i = 0; i < b.length; i++){
      out += (b[i] & 0xFF).toString(16).padStart(2, '0');
    }
    return out;
  }

  function toU8(input){
    if (!input) return new Uint8Array(0);
    if (input instanceof Uint8Array) return input;
    if (typeof input === 'string') return hexToBytes(input);
    if (typeof DataView !== 'undefined' && input instanceof DataView){
      return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
    }
    if (typeof ArrayBuffer !== 'undefined' && input instanceof ArrayBuffer){
      return new Uint8Array(input);
    }
    if (ArrayBuffer.isView && ArrayBuffer.isView(input)){
      return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
    }
    if (Array.isArray(input)) return Uint8Array.from(input);
    return new Uint8Array(0);
  }

  function cleanZero(n){
    return Object.is(n, -0) ? 0 : n;
  }

  function xorChecksum(bytes, end, start){
    const s = start == null ? 0 : start;
    const e = end == null ? bytes.length : end;
    let x = 0;
    for (let i = s; i < e; i++) x ^= (bytes[i] & 0xFF);
    return x & 0xFF;
  }

  function sum8Checksum(bytes, end, start){
    const s = start == null ? 0 : start;
    const e = end == null ? bytes.length : end;
    let acc = 0;
    for (let i = s; i < e; i++) acc = (acc + (bytes[i] & 0xFF)) & 0xFF;
    return acc & 0xFF;
  }

  function lrc8TwosComplement(bytes, end, start){
    return (-sum8Checksum(bytes, end, start)) & 0xFF;
  }

  function acaiaChecksum(payload){
    let ck1 = 0, ck2 = 0;
    for (let i = 0; i < payload.length; i++){
      if ((i & 1) === 0) ck1 = (ck1 + (payload[i] & 0xFF)) & 0xFF;
      else ck2 = (ck2 + (payload[i] & 0xFF)) & 0xFF;
    }
    return [ck1, ck2];
  }

  function encodeAcaia(msgType, payload){
    const p = toU8(payload);
    const cks = acaiaChecksum(p);
    const out = new Uint8Array(3 + p.length + 2);
    out[0] = 0xEF;
    out[1] = 0xDD;
    out[2] = msgType & 0xFF;
    out.set(p, 3);
    out[3 + p.length] = cks[0];
    out[4 + p.length] = cks[1];
    return out;
  }

  function crc16Modbus(bytes){
    let crc = 0xFFFF;
    for (let i = 0; i < bytes.length; i++){
      crc ^= (bytes[i] & 0xFF);
      for (let b = 0; b < 8; b++){
        crc = (crc & 0x0001) ? ((crc >>> 1) ^ 0xA001) : (crc >>> 1);
      }
    }
    return [crc & 0xFF, (crc >>> 8) & 0xFF];
  }

  function crc16Kermit(bytes){
    let crc = 0x0000;
    for (let i = 0; i < bytes.length; i++){
      crc ^= (bytes[i] & 0xFF);
      for (let b = 0; b < 8; b++){
        crc = (crc & 0x0001) ? ((crc >>> 1) ^ 0x8408) : (crc >>> 1);
      }
    }
    return [crc & 0xFF, (crc >>> 8) & 0xFF];
  }

  /* ---------- Bounded 256-Byte MTU Fragmentation Ring-Buffer ---------- */
  function createMtuRingBuffer(capacity){
    const cap = Math.max(32, Math.min(1024, +capacity || MAX_RING_BYTES));
    let buf = new Uint8Array(0);
    return {
      capacity: cap,
      length: function(){ return buf.length; },
      peek: function(){ return buf; },
      clear: function(){ buf = new Uint8Array(0); },
      append: function(chunk){
        const c = toU8(chunk);
        if (!c.length) return buf;
        const total = buf.length + c.length;
        if (total <= cap){
          const next = new Uint8Array(total);
          next.set(buf, 0);
          next.set(c, buf.length);
          buf = next;
        } else if (c.length >= cap){
          buf = c.slice(c.length - cap);
        } else {
          const keepOld = cap - c.length;
          const next = new Uint8Array(cap);
          next.set(buf.subarray(buf.length - keepOld), 0);
          next.set(c, keepOld);
          buf = next;
        }
        return buf;
      },
      consume: function(count){
        const n = Math.max(0, Math.min(buf.length, +count || 0));
        if (n === 0) return;
        if (n >= buf.length){
          buf = new Uint8Array(0);
        } else {
          buf = buf.slice(n);
        }
      }
    };
  }

  /* ---------- Command Packet Builders Across All 15+ Families ---------- */
  function encodeXBloomRecipePayload(profile, opts){
    const pr = profile || {};
    const o = opts || {};
    /* HARD SAFETY GATE: Pre-Ground / External Grinder MUST use opcode 0x44 + grindByte 0xFE + 0 RPM */
    const preGround = !!(
      o.preGround === true ||
      pr.preGround === true ||
      pr.useExternalGrinder === true ||
      pr.grindMode === 'preground' ||
      pr.grindStep === 0 ||
      pr.grindStep === 0xFE ||
      (pr.grindStep == null && o.wholeBean !== true && pr.wholeBean !== true)
    );
    const doseByte = Math.max(8, Math.min(25, Math.round(+pr.doseG || 15))) & 0xFF;
    const ratioX10 = Math.max(80, Math.min(250, Math.round((+pr.ratio || 16) * 10))) & 0xFF;
    const opcode = preGround ? 0x44 : 0x41;
    const grindByte = preGround ? 0xFE : (Math.max(1, Math.min(80, Math.round(+pr.grindStep || 45))) & 0xFF);
    const rpmByte = preGround
      ? 0x00
      : (pr.model === 'original' ? 85 : (Math.max(60, Math.min(120, Math.round((+pr.grindRpm || 90) / 10) * 10)) & 0xFF));
    const shakeLocked = !!(pr.agitationLockedOff || pr.vessel === 'third_party');

    const rawPours = Array.isArray(pr.pours) && pr.pours.length
      ? pr.pours
      : [{ volumeMl:Math.round(doseByte * (ratioX10 / 10)), temp:93, pattern:'spiral', flowRateMls:3.3, pauseS:0, agitation:'none' }];

    const segs = [];
    for (let pi = 0; pi < rawPours.length; pi++){
      const p = rawPours[pi] || {};
      let rem = Math.max(1, Math.round(+p.volumeMl || 30));
      const tVal = p.temp != null ? p.temp : p.temperature;
      const tByte = (tVal === 'RT' || tVal === 0)
        ? 0
        : (tVal === 'BP' || +tVal >= 100)
          ? 100
          : Math.max(40, Math.min(99, Math.round(+tVal || 93)));
      const patCode = p.pattern === 'center' ? 1 : p.pattern === 'circular' ? 2 : 3;
      const flowCode = Math.max(25, Math.min(40, Math.round((+p.flowRateMls || 3.3) * 10)));
      const pauseB = Math.max(0, Math.min(120, Math.round(+p.pauseS || 0)));
      const agitB = shakeLocked ? 0 : ({ none:0, before:1, after:2, both:3 }[p.agitation] || 0);

      while (rem > 127 && segs.length < 11){
        segs.push([127, tByte, patCode, flowCode, 0, 0]);
        rem -= 127;
      }
      if (segs.length < 12){
        segs.push([Math.min(127, rem), tByte, patCode, flowCode, pauseB, agitB]);
      }
    }

    const payloadLen = 5 + segs.length * 6;
    const body = [
      0x58, 0x42,
      opcode,
      payloadLen & 0xFF,
      doseByte,
      ratioX10,
      preGround ? 0xFE : grindByte,
      preGround ? 0x00 : rpmByte,
      segs.length & 0xFF
    ];
    for (let si = 0; si < segs.length; si++){
      const s = segs[si];
      for (let bi = 0; bi < 6; bi++) body.push(s[bi] & 0xFF);
    }
    const crc = crc16Modbus(body);
    const out = new Uint8Array(body.length + 2);
    out.set(body, 0);
    out[body.length] = crc[0];
    out[body.length + 1] = crc[1];
    return out;
  }

  const commands = {
    /* 1. Acaia */
    acaiaIdentify: function(){
      return encodeAcaia(0x0B, [0x30,0x31,0x32,0x33,0x34,0x35,0x36,0x37,0x38,0x39,0x30,0x31,0x32,0x33,0x34]);
    },
    acaiaHeartbeat: function(){
      return encodeAcaia(0x00, [0x02, 0x00]);
    },
    acaiaNotificationRequest: function(){
      return encodeAcaia(0x0C, [0x09, 0x00, 0x01, 0x01, 0x02, 0x02, 0x05, 0x03, 0x04]);
    },
    acaiaTare: function(){
      return encodeAcaia(0x04, [0x00]);
    },
    acaiaTimerStart: function(){
      return encodeAcaia(0x0D, [0x00, 0x00]);
    },
    acaiaTimerReset: function(){
      return encodeAcaia(0x0D, [0x00, 0x01]);
    },
    acaiaTimerStop: function(){
      return encodeAcaia(0x0D, [0x00, 0x02]);
    },

    /* 2. DiFluid Microbalance / Ti */
    difluidScaleEnableAuto: function(){
      return new Uint8Array([0xDF, 0xDF, 0x01, 0x01, 0x01, 0x01, 0xC2]);
    },
    difluidScaleSetGrams: function(){
      return new Uint8Array([0xDF, 0xDF, 0x01, 0x00, 0x01, 0x00, 0xC0]);
    },
    difluidScaleTare: function(){
      return new Uint8Array([0xDF, 0xDF, 0x03, 0x02, 0x01, 0x01, 0xC5]);
    },
    difluidScaleTimerStart: function(){
      return new Uint8Array([0xDF, 0xDF, 0x03, 0x02, 0x01, 0x02, 0xC6]);
    },
    difluidScaleTimerStop: function(){
      return new Uint8Array([0xDF, 0xDF, 0x03, 0x02, 0x01, 0x03, 0xC7]);
    },
    difluidScaleTimerReset: function(){
      return new Uint8Array([0xDF, 0xDF, 0x03, 0x02, 0x01, 0x00, 0xC4]);
    },

    /* 3. Bookoo Themis Mini / Ultra */
    bookooTare: function(){
      return new Uint8Array([0x03, 0x0A, 0x01, 0x00, 0x00, 0x08]);
    },
    bookooTareAndStart: function(){
      return new Uint8Array([0x03, 0x0A, 0x07, 0x00, 0x00, 0x0E]);
    },
    bookooTimerStart: function(){
      return new Uint8Array([0x03, 0x0A, 0x04, 0x00, 0x00, 0x0D]);
    },
    bookooTimerStop: function(){
      return new Uint8Array([0x03, 0x0A, 0x05, 0x00, 0x00, 0x0C]);
    },
    bookooTimerReset: function(){
      return new Uint8Array([0x03, 0x0A, 0x06, 0x00, 0x00, 0x0F]);
    },

    /* 4. Timemore Black Mirror Classic (0x2A9E) / OSP (0xFFF2) / Compact */
    timemoreClassicTare: function(){
      return new Uint8Array([0x00]);
    },
    timemoreClassicTimerStart: function(){
      return new Uint8Array([0x08]);
    },
    timemoreClassicTimerStop: function(){
      return new Uint8Array([0x09]);
    },
    timemoreClassicTimerReset: function(){
      return new Uint8Array([0x0A]);
    },
    timemoreOspTare: function(){
      const body = [0xA5, 0x5A, 0x03, 0x0D, 0x00, 0x01, 0x00];
      const crc = crc16Modbus(body);
      return new Uint8Array([0xA5, 0x5A, 0x03, 0x0D, 0x00, 0x01, 0x00, crc[0], crc[1]]);
    },
    timemoreTimerStart: function(){
      const body = [0xA5, 0x5A, 0x03, 0x0E, 0x00, 0x01, 0x01];
      const crc = crc16Modbus(body);
      return new Uint8Array([0xA5, 0x5A, 0x03, 0x0E, 0x00, 0x01, 0x01, crc[0], crc[1]]);
    },
    timemoreTimerStop: function(){
      const body = [0xA5, 0x5A, 0x03, 0x0E, 0x00, 0x01, 0x00];
      const crc = crc16Modbus(body);
      return new Uint8Array([0xA5, 0x5A, 0x03, 0x0E, 0x00, 0x01, 0x00, crc[0], crc[1]]);
    },
    timemoreTimerReset: function(){
      const body = [0xA5, 0x5A, 0x03, 0x0E, 0x00, 0x01, 0x02];
      const crc = crc16Modbus(body);
      return new Uint8Array([0xA5, 0x5A, 0x03, 0x0E, 0x00, 0x01, 0x02, crc[0], crc[1]]);
    },

    /* 5. Felicita Arc / Incline / Parallel */
    felicitaTare: function(){ return new Uint8Array([0x54]); },
    felicitaTimerStart: function(){ return new Uint8Array([0x52]); },
    felicitaTimerStop: function(){ return new Uint8Array([0x53]); },
    felicitaTimerReset: function(){ return new Uint8Array([0x43]); },
    felicitaToggleUnit: function(){ return new Uint8Array([0x55]); },

    /* 6. Decent Scale & Half Decent Scale (HDS) */
    decentTare: function(counter){
      const c = (counter == null ? 0 : counter) & 0xFF;
      const cmd = new Uint8Array([0x03, 0x0F, c, 0x00, 0x00, 0x01, 0x00]);
      cmd[6] = xorChecksum(cmd, 6);
      return cmd;
    },
    decentEnableGramsLed: function(){
      return new Uint8Array([0x03, 0x0A, 0x01, 0x01, 0x00, 0x00, 0x09]);
    },
    decentHeartbeat: function(){
      return new Uint8Array([0x03, 0x0A, 0x03, 0xFF, 0xFF, 0x00, 0x0A]);
    },
    decentTimerStart: function(){
      return new Uint8Array([0x03, 0x0B, 0x03, 0x00, 0x00, 0x00, 0x0B]);
    },
    decentTimerStop: function(){
      return new Uint8Array([0x03, 0x0B, 0x00, 0x00, 0x00, 0x00, 0x08]);
    },
    decentTimerReset: function(){
      return new Uint8Array([0x03, 0x0B, 0x02, 0x00, 0x00, 0x00, 0x0A]);
    },

    /* 7. Varia AKU */
    variaTare: function(){
      const cmd = new Uint8Array([0xFA, 0x82, 0x01, 0x01, 0x00]);
      cmd[4] = xorChecksum(cmd, 4);
      return cmd;
    },
    variaTimerStart: function(){
      const cmd = new Uint8Array([0xFA, 0x88, 0x01, 0x01, 0x00]);
      cmd[4] = xorChecksum(cmd, 4);
      return cmd;
    },
    variaTimerStop: function(){
      const cmd = new Uint8Array([0xFA, 0x89, 0x01, 0x01, 0x00]);
      cmd[4] = xorChecksum(cmd, 4);
      return cmd;
    },
    variaTimerReset: function(){
      const cmd = new Uint8Array([0xFA, 0x8A, 0x01, 0x01, 0x00]);
      cmd[4] = xorChecksum(cmd, 4);
      return cmd;
    },

    /* 8. Atomax Skale II */
    skaleTare: function(){ return new Uint8Array([0x10]); },
    skaleEnableGrams: function(){ return new Uint8Array([0x03]); },
    skaleDisplayWeight: function(){ return new Uint8Array([0xEC]); },
    skaleLedOn: function(){ return new Uint8Array([0xED]); },
    skaleTimerStart: function(){ return new Uint8Array([0xD1]); },
    skaleTimerStop: function(){ return new Uint8Array([0xD0]); },
    skaleTimerReset: function(){ return new Uint8Array([0xD2]); },

    /* 9. Eureka Precisa / CFS-9002 */
    eurekaTare: function(){ return new Uint8Array([0xAA, 0x02, 0x31, 0x31]); },
    eurekaTimerStart: function(){ return new Uint8Array([0xAA, 0x02, 0x33, 0x33]); },
    eurekaTimerStop: function(){ return new Uint8Array([0xAA, 0x02, 0x34, 0x34]); },
    eurekaTimerReset: function(){ return new Uint8Array([0xAA, 0x02, 0x35, 0x35]); },

    /* 10. Hiroia Jimmy */
    hiroiaTare: function(){ return new Uint8Array([0x07, 0x00]); },
    hiroiaTimerStart: function(){ return new Uint8Array([0x05, 0x00]); },
    hiroiaTimerStop: function(){ return new Uint8Array([0x06, 0x00]); },
    hiroiaTimerReset: function(){ return new Uint8Array([0x06, 0x00]); },
    hiroiaToggleUnit: function(){ return new Uint8Array([0x08, 0x00]); },

    /* 11. Bluetooth SIG Weight Scale */
    sigTare: function(){ return new Uint8Array([0x00]); },

    /* 12. Pressensor / Smart Espresso Profiler */
    pressensorZero: function(){ return new Uint8Array([0x01, 0x00]); },

    /* 13. Bookoo Espresso Monitor */
    bookooPressureZero: function(){
      const cmd = new Uint8Array([0x02, 0x0A, 0x01, 0x00, 0x00, 0x00]);
      cmd[5] = xorChecksum(cmd, 5);
      return cmd;
    },
    bookooPressureStartStream: function(){
      const cmd = new Uint8Array([0x02, 0x0A, 0x02, 0x01, 0x00, 0x00]);
      cmd[5] = xorChecksum(cmd, 5);
      return cmd;
    },

    /* 14. DiFluid R2 Extract Refractometer */
    difluidSetCelsius: function(){
      return new Uint8Array([0xDF, 0xDF, 0x01, 0x00, 0x01, 0x00, 0xC0]);
    },
    difluidR2EnableAutoNotifications: function(){
      return new Uint8Array([0xDF, 0xDF, 0x01, 0x01, 0x01, 0x01, 0xC2]);
    },
    difluidTriggerSingle: function(){
      return new Uint8Array([0xDF, 0xDF, 0x03, 0x00, 0x00, 0xC1]);
    },
    difluidTriggerMultiAverage: function(count){
      const n = Math.max(2, Math.min(10, Math.round(+count || 3))) & 0xFF;
      const pkt = new Uint8Array([0xDF, 0xDF, 0x03, 0x01, 0x01, n, 0x00]);
      pkt[6] = sum8Checksum(pkt, 6);
      return pkt;
    },
    difluidEnableAutoRead: function(enabled){
      const v = enabled === false ? 0x00 : 0x01;
      const pkt = new Uint8Array([0xDF, 0xDF, 0x01, 0x02, 0x01, v, 0x00]);
      pkt[6] = sum8Checksum(pkt, 6);
      return pkt;
    },

    /* 15. DiFluid Omni Roast & PSD Analyzer */
    difluidOmniTrigger: function(){
      return new Uint8Array([0xDF, 0xDF, 0x04, 0x00, 0x00, 0xC2]);
    },
    difluidOmniRequestHistogram: function(){
      const pkt = new Uint8Array([0xDF, 0xDF, 0x04, 0x01, 0x01, 0x10, 0x00]);
      pkt[6] = sum8Checksum(pkt, 6);
      return pkt;
    },

    /* 16. xBloom Original & Studio (with 0x41 vs 0x44/0xFE Hard Safety Gate) */
    encodeXBloomRecipePayload: encodeXBloomRecipePayload,

    /* 17. Fellow Stagg EKG+ Kettle (Magic Init EF DD 0B ... 9A 6D + 8-Byte Seq Commands) */
    staggAuth: function(){
      return encodeAcaia(0x0B, [0x30,0x31,0x32,0x33,0x34,0x35,0x36,0x37,0x38,0x39,0x30,0x31,0x32,0x33,0x34]);
    },
    staggSetTempC: function(tempC, seq){
      const s = (seq == null ? 1 : seq) & 0xFF;
      const clamped = Math.max(40, Math.min(100, Math.round(+tempC || 93))) & 0xFF;
      return new Uint8Array([0xEF, 0xDD, 0x0A, s, 0x01, clamped, (s + clamped) & 0xFF, 0x01]);
    },
    staggSetHold: function(enabled, seq){
      const s = (seq == null ? 2 : seq) & 0xFF;
      const v = enabled === false ? 0x00 : 0x01;
      return new Uint8Array([0xEF, 0xDD, 0x0A, s, 0x02, v, (s + v) & 0xFF, 0x02]);
    },
    staggPower: function(on, seq){
      const s = (seq == null ? 0 : seq) & 0xFF;
      const v = on === false ? 0x00 : 0x01;
      return new Uint8Array([0xEF, 0xDD, 0x0A, s, 0x00, v, (s + v) & 0xFF, 0x00]);
    }
  };

  /* ============================================================================
   * 15-FAMILY PURE BINARY GATT DECODERS
   * ============================================================================ */

  /* --- 1. Acaia Scale (Lunar, Lunar 2021, Pearl, Pearl S, Pyxis, Cinco) --- */
  function decodeAcaiaWeightSubEvent(b){
    if (b.length < 5) return null;
    const is6 = b.length >= 6;
    const raw = is6
      ? (((b[3] << 24) >>> 0) + (b[2] << 16) + (b[1] << 8) + b[0])
      : ((b[2] << 16) + (b[1] << 8) + b[0]);
    const exp = is6 ? b[4] : b[3];
    const flags = is6 ? b[5] : b[4];
    if (exp > 6) return null;
    const div = Math.pow(10, exp);
    const sign = (flags & 0x02) ? -1 : 1;
    const val = sign * (raw / div);
    const weightG = +(val.toFixed(Math.min(exp, 4)));
    return {
      weightG: cleanZero(weightG),
      decimals: exp,
      stable: (flags & 0x01) === 0
    };
  }

  function canParseAcaiaSubEvents(b, pos, payloadEnd){
    if (pos === payloadEnd) return true;
    if (pos > payloadEnd) return false;
    const ev = b[pos];
    if (ev === 0x05){
      const try6 = pos + 7 <= payloadEnd && b[pos + 5] <= 6 && canParseAcaiaSubEvents(b, pos + 7, payloadEnd);
      if (try6) return true;
      return pos + 6 <= payloadEnd && b[pos + 4] <= 6 && canParseAcaiaSubEvents(b, pos + 6, payloadEnd);
    }
    if (ev === 0x06 && pos + 2 <= payloadEnd) return canParseAcaiaSubEvents(b, pos + 2, payloadEnd);
    if (ev === 0x07 && pos + 4 <= payloadEnd) return canParseAcaiaSubEvents(b, pos + 4, payloadEnd);
    if (ev === 0x08 && pos + 2 <= payloadEnd) return canParseAcaiaSubEvents(b, pos + 2, payloadEnd);
    if (ev === 0x0B && pos + 3 <= payloadEnd) return canParseAcaiaSubEvents(b, pos + 3, payloadEnd);
    return false;
  }

  function decodeAcaiaFrame(frame){
    const b = toU8(frame);
    if (b.length < 6 || b[0] !== 0xEF || b[1] !== 0xDD) return null;
    const msgType = b[2];

    if (msgType === 0x08 && b.length >= 7){
      const payloadLen = b.length - 5;
      const cks = acaiaChecksum(b.subarray(3, 3 + payloadLen));
      const checksumValid = (b[3 + payloadLen] === cks[0] && b[4 + payloadLen] === cks[1]);
      if (!checksumValid) return null;
      return {
        brand: 'acaia',
        slot: 'scale',
        packetType: 'status',
        batteryPct: b[4] & 0x7F,
        checksumValid: checksumValid
      };
    }

    /* Legacy Acaia Pearl FW 1.x direct weight frame (msgType === 0x07, no 0x05 sub-event prefix) */
    if (msgType === 0x07 && b.length >= 11){
      const payloadEnd7 = b.length - 2;
      const cks7 = acaiaChecksum(b.subarray(3, payloadEnd7));
      const checksumValid7 = (b[payloadEnd7] === cks7[0] && b[payloadEnd7 + 1] === cks7[1]);
      if (!checksumValid7) return null;
      const wSlice7 = (payloadEnd7 - 4 >= 6) ? b.subarray(4, 10) : b.subarray(4, 9);
      const w7 = decodeAcaiaWeightSubEvent(wSlice7);
      if (!w7) return null;
      return Object.assign({
        brand: 'acaia',
        slot: 'scale',
        packetType: 'weight',
        checksumValid: checksumValid7
      }, w7);
    }

    if (msgType === 0x0C && b.length >= 8){
      const payloadEnd = b.length - 2;
      const cks = acaiaChecksum(b.subarray(3, payloadEnd));
      const checksumValid = (b[payloadEnd] === cks[0] && b[payloadEnd + 1] === cks[1]);
      if (!checksumValid) return null;

      const out = { brand:'acaia', slot:'scale', packetType:'event', checksumValid:checksumValid };
      if (b.length === 12 && b[4] === 0x05){
        const w5 = decodeAcaiaWeightSubEvent(b.subarray(5, 10));
        if (!w5) return null;
        return Object.assign(out, { packetType:'weight' }, w5);
      }
      let idx = 4;
      while (idx < payloadEnd){
        const ev = b[idx];
        if (ev === 0x05){
          const can6 = idx + 7 <= payloadEnd && b[idx + 5] <= 6 && canParseAcaiaSubEvents(b, idx + 7, payloadEnd);
          const can5 = idx + 6 <= payloadEnd && b[idx + 4] <= 6 && canParseAcaiaSubEvents(b, idx + 6, payloadEnd);
          const use6 = can6 && (!can5 || (b[idx + 4] === 0 && (b[idx + 6] & 0xF0) === 0));
          const use5 = !use6 && (can5 || (!can6 && idx + 6 <= payloadEnd && b[idx + 4] <= 6 && idx + 7 > payloadEnd));
          if (use6 || (!use5 && idx + 7 <= payloadEnd && b[idx + 5] <= 6 && (b[idx + 6] & 0xFC) === 0)){
            const w6 = decodeAcaiaWeightSubEvent(b.subarray(idx + 1, idx + 7));
            if (w6) Object.assign(out, { packetType:'weight' }, w6);
            idx += 7;
          } else if (idx + 6 <= payloadEnd){
            const w5b = decodeAcaiaWeightSubEvent(b.subarray(idx + 1, idx + 6));
            if (w5b) Object.assign(out, { packetType:'weight' }, w5b);
            idx += 6;
          } else {
            break;
          }
        } else if (ev === 0x06 && idx + 2 <= payloadEnd){
          out.batteryPct = b[idx + 1] & 0x7F;
          idx += 2;
        } else if (ev === 0x07 && idx + 4 <= payloadEnd){
          out.timeS = +(b[idx + 1] * 60 + b[idx + 2] + b[idx + 3] * 0.1).toFixed(1);
          idx += 4;
        } else if (ev === 0x08 && idx + 2 <= payloadEnd){
          out.keyEvent = b[idx + 1];
          const keyMap = { 0:'tare', 1:'timer_start', 2:'timer_reset', 3:'timer_stop' };
          if (keyMap[b[idx + 1]]) out.action = keyMap[b[idx + 1]];
          idx += 2;
        } else if (ev === 0x0B && idx + 3 <= payloadEnd){
          out.ackEvent = b[idx + 1];
          idx += 3;
        } else {
          break;
        }
      }
      if ('weightG' in out || 'timeS' in out || 'keyEvent' in out) return out;
      if ('batteryPct' in out){
        out.packetType = 'status';
        return out;
      }
      return null;
    }
    return null;
  }

  function createAcaiaStreamParser(){
    const ring = createMtuRingBuffer(MAX_RING_BYTES);
    return {
      reset: function(){ ring.clear(); },
      length: function(){ return ring.length(); },
      push: function(chunk){
        ring.append(chunk);
        const results = [];
        while (ring.length() >= 6){
          const buf = ring.peek();
          let start = -1;
          for (let i = 0; i <= buf.length - 2; i++){
            if (buf[i] === 0xEF && buf[i + 1] === 0xDD){ start = i; break; }
          }
          if (start < 0){
            const keepTail = buf[buf.length - 1] === 0xEF ? 1 : 0;
            ring.consume(buf.length - keepTail);
            break;
          }
          if (start > 0){
            ring.consume(start);
            if (ring.length() < 6) break;
          }
          const cur = ring.peek();
          const msgType = cur[2];
          const lenByte = cur[3];
          const rawCands = msgType === 0x08
            ? [lenByte + 4, lenByte + 5, lenByte + 6, 7, 8, 9, 10]
            : (msgType === 0x07
              ? [lenByte + 4, lenByte + 5, lenByte + 6, 11, 12, 13, 14]
              : [lenByte + 4, lenByte + 5, lenByte + 6]);
          const cands = [];
          for (let ci = 0; ci < rawCands.length; ci++){
            const cl = rawCands[ci];
            if (cl >= 6 && cl <= 64 && cands.indexOf(cl) < 0) cands.push(cl);
          }
          cands.sort(function(a, b){ return a - b; });
          if (!cands.length){
            ring.consume(2);
            continue;
          }
          if (cur.length < cands[0]) break;

          let matchedLen = 0;
          for (let mi = 0; mi < cands.length; mi++){
            const tryLen = cands[mi];
            if (cur.length < tryLen) break;
            const slice = cur.subarray(0, tryLen);
            const ck = acaiaChecksum(slice.subarray(3, tryLen - 2));
            if (slice[tryLen - 2] === ck[0] && slice[tryLen - 1] === ck[1]){
              const parsed = decodeAcaiaFrame(slice);
              if (parsed){
                results.push(parsed);
                matchedLen = tryLen;
                break;
              }
            }
          }
          if (matchedLen > 0){
            ring.consume(matchedLen);
            continue;
          }
          if (cur.length >= cands[cands.length - 1]){
            ring.consume(2);
            continue;
          }
          break;
        }
        return results;
      }
    };
  }

  function decodeAcaia(input){
    const b = toU8(input);
    const direct = decodeAcaiaFrame(b);
    if (direct && direct.checksumValid) return direct;
    const parser = createAcaiaStreamParser();
    const frames = parser.push(b);
    return frames.length ? frames[frames.length - 1] : null;
  }

  /* --- 2. DiFluid Microbalance & Microbalance Ti Scale (`0xDF 0xDF`) --- */
  function readDiFluidScaleValueBE(dv, b, off){
    const b0 = b[off], b1 = b[off + 1], b2 = b[off + 2], b3 = b[off + 3];
    if ((b0 | b1 | b2 | b3) === 0) return 0;
    const exp = ((b0 & 0x7F) << 1) | (b1 >>> 7);
    const f32 = dv.getFloat32(off, false);
    if (exp === 0 || exp === 255 || !Number.isFinite(f32) || Math.abs(f32) < 1e-6 || Math.abs(f32) > 10000){
      const i32 = dv.getInt32(off, false);
      if (Math.abs(i32) <= 100000) return i32 / 10;
      return NaN;
    }
    return f32;
  }

  function decodeDiFluidScale(input){
    const b = toU8(input);
    if (b.length < 6 || b[0] !== 0xDF || b[1] !== 0xDF) return null;
    const func = b[2], cmd = b[3], dataLen = b[4];
    if (b.length < 6 + dataLen) return null;
    const checksumValid = (b[5 + dataLen] === sum8Checksum(b, 5 + dataLen));
    if (!checksumValid) return null;
    const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);

    if (func === 0x03 && cmd === 0x00 && dataLen >= 13){
      let w = readDiFluidScaleValueBE(dv, b, 5);
      let f = readDiFluidScaleValueBE(dv, b, 9);
      if (!Number.isFinite(w) || Math.abs(w) > 10000) return null;
      if (!Number.isFinite(f) || Math.abs(f) > 500) f = 0;
      const unitCode = b[16];
      if (unitCode === 1){ w *= 28.3495231; f *= 28.3495231; }
      const weightG = +(w.toFixed(1));
      const flowRateGs = +(f.toFixed(2));
      const timeS = +(b[13] * 60 + b[14] + b[15] * 0.1).toFixed(1);
      const flags = b[17];
      return {
        brand: 'difluid',
        slot: 'scale',
        packetType: 'weight',
        weightG: cleanZero(weightG),
        flowRateGs: cleanZero(flowRateGs),
        timeS: timeS,
        unit: unitCode === 1 ? 'oz' : (unitCode === 2 ? 'ml' : 'g'),
        stable: (flags & 0x01) !== 0,
        timerRunning: (flags & 0x02) !== 0,
        checksumValid: checksumValid
      };
    }

    if (func === 0x03 && cmd === 0x00 && dataLen >= 4 && dataLen < 13){
      let wShort = readDiFluidScaleValueBE(dv, b, 5);
      if (!Number.isFinite(wShort) || Math.abs(wShort) > 10000) return null;
      let fShort = 0;
      if (dataLen >= 8){
        const candF = readDiFluidScaleValueBE(dv, b, 9);
        if (Number.isFinite(candF) && Math.abs(candF) <= 500) fShort = candF;
      } else if (dataLen >= 6){
        fShort = dv.getInt16(9, false) / 10;
      }
      const shortUnit = dataLen >= 12 ? b[16] : 0;
      if (shortUnit === 1){ wShort *= 28.3495231; fShort *= 28.3495231; }
      const shortTimeS = dataLen >= 11 ? +(b[13] * 60 + b[14] + b[15] * 0.1).toFixed(1) : null;
      return {
        brand: 'difluid',
        slot: 'scale',
        packetType: 'weight',
        weightG: cleanZero(+(wShort.toFixed(1))),
        flowRateGs: cleanZero(+(fShort.toFixed(2))),
        timeS: shortTimeS,
        unit: shortUnit === 1 ? 'oz' : (shortUnit === 2 ? 'ml' : 'g'),
        stable: Math.abs(fShort) < 0.08,
        checksumValid: checksumValid
      };
    }

    if (func === 0x03 && cmd === 0x01 && dataLen >= 4){
      const rawW = dv.getInt32(5, false);
      const weightG = +(rawW / 10).toFixed(1);
      const flowRateGs = dataLen >= 6 ? +(dv.getInt16(9, false) / 10).toFixed(1) : 0;
      const timeS = dataLen >= 8 ? +(dv.getUint16(11, false) / 10).toFixed(1) : null;
      const flags = dataLen >= 10 ? b[14] : 0;
      return {
        brand: 'difluid',
        slot: 'scale',
        packetType: 'weight',
        weightG: cleanZero(weightG),
        flowRateGs: cleanZero(flowRateGs),
        timeS: timeS,
        stable: (flags & 0x01) !== 0,
        timerRunning: (flags & 0x02) !== 0,
        checksumValid: checksumValid
      };
    }

    if (func === 0x03 && cmd === 0x02 && dataLen >= 1){
      const act = b[5];
      const map = { 0x00:'timer_reset', 0x01:'tare', 0x02:'timer_start', 0x03:'timer_stop' };
      return { brand:'difluid', slot:'scale', packetType:'button', action:map[act] || ('btn_' + act), checksumValid:checksumValid };
    }

    if (func === 0x02 && dataLen >= 1){
      return { brand:'difluid', slot:'scale', packetType:'status', batteryPct:b[5] <= 100 ? b[5] : null, checksumValid:checksumValid };
    }

    return { brand:'difluid', slot:'scale', packetType:'ack', func:func, cmd:cmd, checksumValid:checksumValid };
  }

  /* --- 3. Bookoo Themis Mini / Ultra Scale (20-byte frame) --- */
  function decodeBookoo(input){
    const b = toU8(input);
    if (b.length < 20 || b[0] !== 0x03 || (b[1] !== 0x0B && b[1] !== 0xCE)) return null;
    const expectedXor = xorChecksum(b, 19);
    const checksumValid = (b[19] === expectedXor);
    if (!checksumValid) return null;

    const timeMs = (b[2] << 16) | (b[3] << 8) | b[4];
    const unitCode = b[5];
    const wSign = (b[6] === 0x2D || b[6] === 1) ? -1 : 1;
    const rawWeight = (b[7] << 16) | (b[8] << 8) | b[9];
    const fSign = (b[10] === 0x2D || b[10] === 1) ? -1 : 1;
    const rawFlow = (b[11] << 8) | b[12];
    let wVal = wSign * (rawWeight / 100);
    let fVal = fSign * (rawFlow / 100);
    if (unitCode === 1){
      wVal *= 28.3495231;
      fVal *= 28.3495231;
    }
    const weightG = +(wVal.toFixed(2));
    const flowRateGs = +(fVal.toFixed(2));
    const batteryPct = b[13] <= 100 ? b[13] : null;

    return {
      brand: 'bookoo',
      slot: 'scale',
      packetType: 'weight',
      weightG: cleanZero(weightG),
      flowRateGs: cleanZero(flowRateGs),
      unit: unitCode === 1 ? 'oz' : 'g',
      timeS: +(timeMs / 1000).toFixed(2),
      batteryPct: batteryPct,
      stable: Math.abs(flowRateGs) < 0.05,
      checksumValid: checksumValid
    };
  }

  /* --- 4. Timemore Black Mirror (Classic/Basic+ Float32/Int32, Basic 2/OSP Dual-Weight CRC16, 2025 Compact Int16) --- */
  function readTimemoreWeightLE(dv, b, off){
    const b0 = b[off], b1 = b[off + 1], b2 = b[off + 2], b3 = b[off + 3];
    if ((b0 | b1 | b2 | b3) === 0) return 0;
    const exp = ((b3 & 0x7F) << 1) | (b2 >>> 7);
    if (exp >= 115 && exp <= 145){
      const f32 = dv.getFloat32(off, true);
      if (Number.isFinite(f32) && Math.abs(f32) <= 10000) return f32;
    }
    const i32 = dv.getInt32(off, true);
    if (Math.abs(i32) <= 100000) return i32 / 10;
    return NaN;
  }

  function decodeTimemore(input){
    const b = toU8(input);
    if (b.length < 8) return null;
    const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);

    if (b[0] === 0xA5 && b[1] === 0x5A && b.length >= 12){
      const opcode = b[2], cmd = b[3];
      const payloadLen = (b[4] << 8) | b[5];
      if (b.length < 6 + payloadLen + 2) return null;
      const crc = crc16Modbus(b.subarray(0, 6 + payloadLen));
      const checksumValid = (b[6 + payloadLen] === crc[0] && b[7 + payloadLen] === crc[1]);
      if (!checksumValid) return null;
      if (opcode === 0x01 && cmd === 0x01 && payloadLen >= 4){
        const rawW = dv.getInt32(6, true);
        const unitCode = payloadLen >= 5 ? b[10] : 0;
        let weightG = rawW / 10;
        if (unitCode === 1) weightG = (rawW / 100) * 28.3495231;
        weightG = +(weightG.toFixed(1));
        const flowRateGs = payloadLen >= 7 ? +(dv.getInt16(11, true) / 10).toFixed(1) : null;
        const timeS = payloadLen >= 9 ? dv.getUint16(13, true) : null;
        const secondaryWeightG = payloadLen >= 13 ? +(dv.getInt32(15, true) / 10).toFixed(1) : null;
        return {
          brand: 'timemore',
          slot: 'scale',
          variant: 'osp',
          packetType: 'weight',
          weightG: cleanZero(weightG),
          secondaryWeightG: secondaryWeightG !== null ? cleanZero(secondaryWeightG) : null,
          unit: unitCode === 1 ? 'oz' : 'g',
          flowRateGs: flowRateGs !== null ? cleanZero(flowRateGs) : null,
          timeS: timeS,
          checksumValid: checksumValid
        };
      }
      return null;
    }

    if (b.length === 8 && b[0] === 0x01 && b[1] !== 0x02){
      const weightG = +(dv.getInt16(2, true) / 10).toFixed(1);
      const flowRateGs = +(dv.getInt16(4, true) / 10).toFixed(1);
      const timeS = dv.getUint16(6, true);
      return {
        brand: 'timemore',
        slot: 'scale',
        variant: 'compact_int16',
        packetType: 'weight',
        weightG: cleanZero(weightG),
        flowRateGs: cleanZero(flowRateGs),
        timeS: timeS
      };
    }

    if (b.length >= 9 && b[0] !== 0xA5 &&
        !(b[0] === 0xEF && b[1] === 0xDD) &&
        !(b[0] === 0xDF && b[1] === 0xDF) &&
        !(b[0] === 0x01 && b[1] === 0x02) &&
        !(b[0] === 0x03 && (b[1] === 0x0B || b[1] === 0xCE || b[1] === 0xCA || b[1] === 0x0A || b[1] === 0xAA)) &&
        b[0] !== 0x58 && b[0] !== 0xAA && b[0] !== 0xFA && b[0] !== 0xFB && b[0] !== 0x55 &&
        !isPrintableAsciiScaleFrame(b)){
      const w1 = readTimemoreWeightLE(dv, b, 1);
      if (!Number.isFinite(w1) || Math.abs(w1) > 10000) return null;
      const w2 = b.length >= 9 ? readTimemoreWeightLE(dv, b, 5) : NaN;
      const weightG = +(w1.toFixed(1));
      const secondaryWeightG = Number.isFinite(w2) && Math.abs(w2) <= 10000 ? +(w2.toFixed(1)) : null;
      return {
        brand: 'timemore',
        slot: 'scale',
        variant: 'classic_float32',
        packetType: 'weight',
        weightG: cleanZero(weightG),
        secondaryWeightG: secondaryWeightG !== null ? cleanZero(secondaryWeightG) : null
      };
    }
    return null;
  }

  /* --- 5. Felicita Arc / Incline / Parallel (18-byte ASCII frame) --- */
  function decodeFelicita(input){
    const b = toU8(input);
    if (b.length < 9 || b[0] !== 0x01 || b[1] !== 0x02) return null;
    let sign = (b[2] === 0x2D) ? -1 : 1;
    let digits = '';
    let seenDigit = false;
    let seenInnerMinus = false;
    for (let i = 3; i < 9; i++){
      const ch = b[i];
      if (ch === 0x20){
        digits += '0';
      } else if (ch === 0x2D && !seenDigit && !seenInnerMinus && b[2] !== 0x2D){
        sign = -1;
        seenInnerMinus = true;
        digits += '0';
      } else if (ch >= 0x30 && ch <= 0x39){
        seenDigit = true;
        digits += String.fromCharCode(ch);
      } else {
        return null;
      }
    }
    if (!seenDigit) return null;
    const raw = parseInt(digits, 10);
    if (!Number.isFinite(raw)) return null;

    const unitStr = b.length >= 11 ? String.fromCharCode(b[9], b[10]).trim().toLowerCase() : 'g';
    let weightG = sign * (raw / 100);
    if (unitStr === 'oz') weightG = sign * (raw / 10000) * 28.3495231;
    weightG = +(weightG.toFixed(2));

    let batteryPct = null;
    if (b.length >= 16 && b[15] >= 120 && b[15] <= 165){
      batteryPct = Math.max(0, Math.min(100, Math.round(((b[15] - 129) / 29) * 100)));
    }

    return {
      brand: 'felicita',
      slot: 'scale',
      packetType: 'weight',
      weightG: cleanZero(weightG),
      unit: unitStr || 'g',
      batteryPct: batteryPct
    };
  }

  /* --- 6. Decent Scale (7-byte & 10-byte XOR frames) --- */
  function decodeDecent(input, opts){
    const b = toU8(input);
    if (b.length !== 7 && b.length !== 10) return null;
    if (b[0] !== 0x03) return null;
    const strictXor = !opts || opts.strictXor !== false;
    const expectedXor = xorChecksum(b, b.length - 1);
    const checksumValid = (b[b.length - 1] === expectedXor);
    if (!checksumValid && (strictXor || b[b.length - 1] !== 0x00)) return null;

    const type = b[1];
    if (type === 0xCE || type === 0xCA || type === 0x0B){
      let raw = (b[2] << 8) | b[3];
      if (raw >= 0x8000) raw -= 0x10000;
      const weightG = Math.round(raw) / 10;
      const timeS = b.length === 10 ? +(b[4] * 60 + b[5] + b[6] * 0.1).toFixed(1) : null;
      return {
        brand: 'decent',
        slot: 'scale',
        packetType: 'weight',
        weightG: cleanZero(weightG),
        stable: type === 0xCE,
        timeS: timeS,
        checksumValid: checksumValid
      };
    }
    if (type === 0x0A){
      const bat = b[4] <= 100 ? b[4] : null;
      return { brand:'decent', slot:'scale', packetType:'status', batteryPct:bat, checksumValid:checksumValid };
    }
    if (type === 0xAA){
      const btnMap = { 1:'tare', 2:'timer_start' };
      return { brand:'decent', slot:'scale', packetType:'button', buttonId:b[2], pressType:b[3], action:btnMap[b[2]] || 'button', checksumValid:checksumValid };
    }
    return null;
  }

  /* --- 7. Varia AKU / MHW-3BOMBER Cube / Wacaco Exagram (0xFA, 0xFB & 0x55 framed XOR) --- */
  function decodeVaria(input){
    const b = toU8(input);
    if (b.length < 5 || (b[0] !== 0xFA && b[0] !== 0xFB && b[0] !== 0x55)) return null;
    const cmd = b[1];
    const len = b[2];
    const totalLen = 4 + len;
    if (len < 1 || len > 32 || b.length < totalLen) return null;
    const ckByte = b[totalLen - 1];
    const xorFull = xorChecksum(b, totalLen - 1, 0);
    const xorBody = xorChecksum(b, totalLen - 1, 1);
    const checksumValid = (ckByte === xorFull || ckByte === xorBody);
    if (!checksumValid) return null;

    if (cmd === 0x01 && len >= 3){
      let sign = 1;
      let raw = 0;
      let stable = true;
      if (len >= 4){
        const sb = b[3];
        sign = (sb === 1 || sb === 0x2D || (sb & 0x10) !== 0 || (sb & 0x80) !== 0) ? -1 : 1;
        stable = (sb & 0x02) === 0;
        raw = ((b[4] << 16) | (b[5] << 8) | b[6]) >>> 0;
      } else {
        const sb3 = b[3];
        sign = ((sb3 & 0x10) !== 0 || (sb3 & 0x80) !== 0) ? -1 : 1;
        stable = (sb3 & 0x20) === 0;
        raw = (((sb3 & 0x0F) << 16) | (b[4] << 8) | b[5]) >>> 0;
      }
      const weightG = +(sign * (raw / 100)).toFixed(2);
      return {
        brand: 'varia',
        slot: 'scale',
        packetType: 'weight',
        weightG: cleanZero(weightG),
        stable: stable,
        checksumValid: checksumValid
      };
    }

    if (cmd === 0x85 && len >= 1){
      return {
        brand: 'varia',
        slot: 'scale',
        packetType: 'status',
        batteryPct: b[3] <= 100 ? b[3] : null,
        checksumValid: checksumValid
      };
    }

    if (cmd === 0x82 || cmd === 0x88 || cmd === 0x89 || cmd === 0x8A){
      const actMap = { 0x82:'tare', 0x88:'timer_start', 0x89:'timer_stop', 0x8A:'timer_reset' };
      return {
        brand: 'varia',
        slot: 'scale',
        packetType: 'button',
        action: actMap[cmd] || 'button',
        checksumValid: checksumValid
      };
    }
    return null;
  }

  /* --- 8. Atomax Skale II (`0xFF08` / `0xEF81` 24-bit signed LE `0.1g`) --- */
  function decodeSkale(input){
    const b = toU8(input);
    if (b.length < 4) return null;
    const u24 = (b[1] | (b[2] << 8) | (b[3] << 16)) >>> 0;
    const signed = u24 >= 0x800000 ? (u24 - 0x1000000) : u24;
    if (Math.abs(signed) > 50000) return null;
    const weightG = +(signed / 10).toFixed(1);
    return {
      brand: 'skale',
      slot: 'scale',
      packetType: 'weight',
      weightG: cleanZero(weightG),
      flags: b[0]
    };
  }

  function decodeSkaleButton(input){
    const b = toU8(input);
    if (!b.length) return null;
    const code = b[0];
    return {
      brand: 'skale',
      slot: 'scale',
      packetType: 'button',
      buttonId: code,
      action: code === 1 ? 'tare' : code === 2 ? 'timer_start' : ('btn_' + code)
    };
  }

  /* --- 9. Eureka Precisa / Brewista II / Acaia-Clone OEM (`CFS-9002`, `KC200`, `0xAA 0x09 0x41`) --- */
  function decodeEureka(input){
    const b = toU8(input);
    if (b.length < 8 || b[0] !== 0xAA) return null;
    if (b[1] === 0x09 && b[2] === 0x41 && b.length >= 10){
      const timerRunning = b[3] !== 0;
      const timeS = b[4] | (b[5] << 8);
      const sign = (b[6] === 1 || b[6] === 0x2D || (b[6] & 0x80) !== 0) ? -1 : 1;
      const rawW = b[7] | (b[8] << 8);
      if (rawW > 50000) return null;
      const weightG = +(sign * (rawW / 10)).toFixed(1);
      const batteryPct = (b.length >= 11 && b[9] <= 100) ? b[9] : null;
      const lastIdx = b.length - 1;
      const ckXor = xorChecksum(b, lastIdx, 0);
      const ckBodyXor = xorChecksum(b, lastIdx, 2);
      const ckSum = sum8Checksum(b, lastIdx, 0);
      const checksumValid = (b[lastIdx] === ckXor || b[lastIdx] === ckBodyXor || b[lastIdx] === ckSum);
      if (!checksumValid) return null;
      return {
        brand: 'eureka',
        slot: 'scale',
        packetType: 'weight',
        weightG: cleanZero(weightG),
        timeS: timeS,
        timerRunning: timerRunning,
        batteryPct: batteryPct,
        checksumValid: checksumValid
      };
    }
    if (b[1] === 0x09 && b[2] === 0x41 && b.length === 9){
      const timeS9 = b[3] * 60 + b[4];
      const sign9 = (b[5] === 1 || b[5] === 0x2D || (b[5] & 0x80) !== 0) ? -1 : 1;
      const rawW9 = (b[6] << 8) | b[7];
      if (rawW9 > 50000) return null;
      const weightG9 = +(sign9 * (rawW9 / 10)).toFixed(1);
      const ckXor9 = xorChecksum(b, 8, 0);
      const ckBodyXor9 = xorChecksum(b, 8, 2);
      const ckSum9 = sum8Checksum(b, 8, 0);
      const checksumValid9 = (b[8] === ckXor9 || b[8] === ckBodyXor9 || b[8] === ckSum9);
      if (!checksumValid9) return null;
      return {
        brand: 'eureka',
        slot: 'scale',
        packetType: 'weight',
        weightG: cleanZero(weightG9),
        timeS: timeS9,
        batteryPct: null,
        checksumValid: checksumValid9
      };
    }
    /* Compact 8-byte 0xAA OEM variant: [0xAA, status, sign, wHi, wLo, min, sec, xor] */
    if (b.length >= 8 && !(b[1] === 0x09 && b[2] === 0x41)){
      const ckXor8 = xorChecksum(b, 7, 0);
      const ckBodyXor8 = xorChecksum(b, 7, 1);
      const ckSum8 = sum8Checksum(b, 7, 0);
      const checksumValid8 = (b[7] === ckXor8 || b[7] === ckBodyXor8 || b[7] === ckSum8);
      if (!checksumValid8) return null;
      const sign = (b[2] === 1 || b[2] === 0x2D || (b[2] & 0x80) !== 0) ? -1 : 1;
      const rawW = (b[3] << 8) | b[4];
      if (rawW > 50000) return null;
      const weightG = +(sign * (rawW / 10)).toFixed(1);
      return {
        brand: 'eureka',
        slot: 'scale',
        packetType: 'weight',
        weightG: cleanZero(weightG),
        stable: (b[1] & 0x01) !== 0,
        checksumValid: checksumValid8
      };
    }
    return null;
  }

  /* --- 10. Hiroia Jimmy (`>=7B`, signed 24-bit LE in `b[4..6]`, `g` & `oz`) --- */
  function decodeHiroia(input){
    const b = toU8(input);
    if (b.length < 7) return null;
    const u24 = (b[4] | (b[5] << 8) | (b[6] << 16)) >>> 0;
    const signed = u24 >= 0x800000 ? (u24 - 0x1000000) : u24;
    const isOz = b[0] >= 0x09 && b[0] <= 0x10;
    if (Math.abs(signed) > (isOz ? 200000 : 50000)) return null;
    const weightG = isOz
      ? +(((signed / 1000) * 28.3495231).toFixed(2))
      : +(signed / 10).toFixed(1);
    const rawTime = b[2] | (b[3] << 8);
    return {
      brand: 'hiroia',
      slot: 'scale',
      packetType: 'weight',
      weightG: cleanZero(weightG),
      unit: isOz ? 'oz' : 'g',
      timeS: rawTime <= 36000 ? +(rawTime / 10).toFixed(1) : null,
      mode: b[0]
    };
  }

  /* --- 11. Bluetooth SIG `0x181D` Weight Scale (`0x2A9D`) --- */
  function decodeWeightSig(input){
    const b = toU8(input);
    if (b.length < 3) return null;
    const flags = b[0];
    const raw = b[1] | (b[2] << 8);
    if (raw === 0xFFFF) return null;
    const isImperial = (flags & 0x01) === 1;
    const weightG = isImperial ? +(raw * 4.5359237).toFixed(2) : +(raw * 5.0).toFixed(1);
    return {
      brand: 'sig',
      slot: 'scale',
      packetType: 'weight',
      weightG: cleanZero(weightG),
      unit: isImperial ? 'lb' : 'g'
    };
  }

  /* --- 12. Pressensor / Smart Espresso Profiler / BLE SIG ESS (`0x181A` `0x2A6D` `0.1 Pa` + `0x2A6E` `0.01 C` + `873ae82a` `mbar`) --- */
  function decodePressensor(input, opts){
    const b = toU8(input);
    if (b.length < 2) return null;
    const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
    const chrNorm = (opts && opts.charUuid) ? normUuid(opts.charUuid) : '';
    const svcNorm = (opts && opts.serviceUuid) ? normUuid(opts.serviceUuid) : '';

    /* Official GATT ESS 0x2A6E Temperature (int16 LE, 0.01 C) */
    if (chrNorm === UUID.ESS_TEMP_CHAR){
      const rawEssTemp = dv.getInt16(0, true);
      if (rawEssTemp >= -4000 && rawEssTemp <= 15000){
        return {
          brand: 'pressensor',
          slot: 'pressure',
          packetType: 'temperature',
          tempC: +(rawEssTemp / 100).toFixed(1)
        };
      }
      return null;
    }

    let rawMbar = dv.getInt16(0, false);
    /* Official GATT ESS 0x2A6D Pressure (uint32 LE, 0.1 Pa -> / 1,000,000 = bar; up to 25 bar = 25,000,000)
       Preserves Gate 5 Pressensor 4B BE [0x23, 0x28, 0x03, 0xA2] -> 9.0 bar / 93.0C when not on ESS 0x2A6D */
    const isExplicitEss2A6D = (chrNorm === UUID.PRESSENSOR_SIG_CHAR || svcNorm === UUID.ESS_SVC || !!(opts && opts.ess2A6D));
    const looksLikeDeciPaLE = b.length === 4 && (
      isExplicitEss2A6D ||
      Math.abs(rawMbar) > 22000 ||
      (b[3] === 0x00 && (b[2] > 0x06 || dv.getInt16(2, false) > 1500 || dv.getInt16(2, false) < -200))
    );
    if (looksLikeDeciPaLE){
      const deciPa = dv.getUint32(0, true);
      if (deciPa <= 25000000){
        const barFromEss = +(deciPa / 1000000).toFixed(2);
        return {
          brand: 'pressensor',
          slot: 'pressure',
          packetType: 'pressure',
          pressureMbar: Math.round(barFromEss * 1000),
          pressureBar: cleanZero(barFromEss),
          tempC: null
        };
      }
    }
    if (rawMbar < -1500 || rawMbar > 25000) return null;
    const pressureBar = +(Math.max(-1, rawMbar / 1000)).toFixed(2);
    let tempC = null;
    if (b.length >= 4){
      const rawTemp = dv.getInt16(2, false);
      if (rawTemp >= -200 && rawTemp <= 1500){
        tempC = +(rawTemp / 10).toFixed(1);
      }
    }
    return {
      brand: 'pressensor',
      slot: 'pressure',
      packetType: 'pressure',
      pressureMbar: rawMbar,
      pressureBar: cleanZero(pressureBar),
      tempC: tempC
    };
  }

  /* --- 13. Bookoo Espresso Monitor (`0x0FFE` / `0x0FFF` / `0xFF01`, `0.01 bar` + XOR) --- */
  function decodeBookooPressure(input){
    const b = toU8(input);
    if (b.length < 6 || b.length >= 20) return null;
    if (b[0] !== 0x02 && b[0] !== 0x03) return null;
    const lastIdx = b.length - 1;
    const expectedXor = xorChecksum(b, lastIdx, 0);
    const checksumValid = (b[lastIdx] === expectedXor);
    if (!checksumValid) return null;

    let rawBarX100 = 0;
    let sign = 1;
    let batteryPct = null;

    if (b.length === 10 && (b[0] === 0x02 || b[0] === 0x03) && b[1] === 0x0C){
      sign = (b[5] === 1 || b[5] === 0x2D) ? -1 : 1;
      rawBarX100 = (b[6] << 8) | b[7];
      batteryPct = b[8] <= 100 ? b[8] : null;
      if (rawBarX100 === 0 && ((b[4] << 8) | b[5]) > 0 && ((b[4] << 8) | b[5]) <= 2500 && b[5] !== 1 && b[5] !== 0x2D){
        sign = 1;
        rawBarX100 = (b[4] << 8) | b[5];
        batteryPct = b[6] <= 100 ? b[6] : batteryPct;
      }
    } else {
      rawBarX100 = (b[2] << 8) | b[3];
      if (b.length >= 10 && rawBarX100 === 0 && ((b[4] << 8) | b[5]) > 0 && b[1] === 0x0C){
        rawBarX100 = (b[4] << 8) | b[5];
        batteryPct = b[6] <= 100 ? b[6] : null;
      } else {
        batteryPct = b[4] <= 100 ? b[4] : null;
      }
    }
    if (rawBarX100 > 2500) return null;
    const pressureBar = +(sign * (rawBarX100 / 100)).toFixed(2);
    return {
      brand: 'bookoo_pressure',
      slot: 'pressure',
      packetType: 'pressure',
      pressureBar: cleanZero(pressureBar),
      pressureMbar: Math.round(pressureBar * 1000),
      batteryPct: batteryPct,
      checksumValid: checksumValid
    };
  }

  /* --- 14. DiFluid R2 Extract Refractometer (`%TDS`, `nD20`, `tempC`, battery, auto & multi-read avg) --- */
  function estimateNd20FromTds(tdsPct){
    /* Accurate coffee aqueous refractive index relation when 4-byte RI is omitted by short firmware frame */
    return +(1.33299 + (+tdsPct || 0) * 0.001585).toFixed(5);
  }

  function decodeDiFluidR2(input){
    const b = toU8(input);
    if (b.length < 6 || b[0] !== 0xDF || b[1] !== 0xDF) return null;
    const func = b[2], cmd = b[3], dataLen = b[4];
    if (b.length < 6 + dataLen) return null;
    const expectedSum = sum8Checksum(b, 5 + dataLen);
    const checksumValid = (b[5 + dataLen] === expectedSum);
    if (!checksumValid) return null;

    if (func === 0x02 && dataLen >= 1){
      const batByte = b[5] <= 100 ? b[5] : (dataLen >= 2 && b[6] <= 100 ? b[6] : null);
      return {
        brand: 'difluid',
        slot: 'refractometer',
        packetType: 'battery',
        batteryPct: batByte,
        checksumValid: checksumValid
      };
    }

    if (func === 0x03 && cmd === 0xFE && dataLen >= 1){
      const errCode = (dataLen >= 2 && (b[5] === 0x00 || b[5] === 0xFE)) ? b[6] : b[5];
      const errMap = {
        0x01: 'error_temp_out_of_range',
        0x02: 'error_no_liquid',
        0x03: 'error_no_liquid',
        0x04: 'error_out_of_range',
        0x05: 'error_out_of_range'
      };
      return {
        brand: 'difluid',
        slot: 'refractometer',
        packetType: 'status',
        isError: true,
        statusCode: errCode,
        statusText: errMap[errCode] || ('error_' + errCode),
        checksumValid: checksumValid
      };
    }

    if (func === 0x03 && dataLen >= 2){
      const pkg = b[5];
      if (pkg === 0x00){
        const code = b[6];
        const map = {
          0x00: 'finished',
          0x0A: 'measuring',
          0x0B: 'measuring',
          0x02: 'error_no_liquid',
          0x03: 'error_no_liquid',
          0x04: 'error_out_of_range',
          0x05: 'auto_ready'
        };
        return {
          brand: 'difluid',
          slot: 'refractometer',
          packetType: 'status',
          statusCode: code,
          statusText: map[code] || ('status_' + code),
          checksumValid: checksumValid
        };
      }
      if (pkg === 0x01 && dataLen >= 3){
        if (dataLen >= 5){
          const prismRaw = (b[6] << 8) | b[7];
          const tankRaw = (b[8] << 8) | b[9];
          const tempC = (tankRaw === 0 && prismRaw > 0)
            ? +(prismRaw / 10.0).toFixed(2)
            : +((prismRaw + tankRaw) / 20.0).toFixed(2);
          return {
            brand: 'difluid',
            slot: 'refractometer',
            packetType: 'temperature',
            tempC: tempC,
            prismTempC: +(prismRaw / 10).toFixed(1),
            tankTempC: tankRaw > 0 ? +(tankRaw / 10).toFixed(1) : +(prismRaw / 10).toFixed(1),
            checksumValid: checksumValid
          };
        }
        const singleTempRaw = (b[6] << 8) | b[7];
        if (singleTempRaw <= 1000){
          const singleTempC = +(singleTempRaw / 10.0).toFixed(2);
          return {
            brand: 'difluid',
            slot: 'refractometer',
            packetType: 'temperature',
            tempC: singleTempC,
            prismTempC: +(singleTempRaw / 10).toFixed(1),
            tankTempC: +(singleTempRaw / 10).toFixed(1),
            checksumValid: checksumValid
          };
        }
      }
      if ((pkg === 0x02 || pkg === 0x03 || pkg === 0x04) && dataLen >= 3){
        /* Guard against standalone 4-byte Refractive Index packets on pkg 0x03/0x04 so RI bytes are never misread as TDS */
        if ((pkg === 0x03 || pkg === 0x04) && (dataLen === 5 || dataLen === 6)){
          const u32 = (((b[6] << 24) >>> 0) + (b[7] << 16) + (b[8] << 8) + b[9]);
          if ((u32 >= 133000 && u32 <= 155000) || (u32 >= 1330000 && u32 <= 1550000)){
            const riStandalone = u32 >= 1000000 ? +(u32 / 1000000.0).toFixed(5) : +(u32 / 100000.0).toFixed(5);
            return {
              brand: 'difluid',
              slot: 'refractometer',
              packetType: 'refractive_index',
              refractiveIndex: riStandalone,
              nD20: riStandalone,
              checksumValid: checksumValid
            };
          }
        }
        const tdsRaw = (b[6] << 8) | b[7];
        if (tdsRaw <= 3500){
          const isMultiAvg = (pkg === 0x03 || cmd === 0x01);
          const tds = +(tdsRaw / 100.0).toFixed(2);
          const brix = +(tds / 0.85).toFixed(2);
          let refractiveIndex = null;
          let readCount = 1;
          if (dataLen >= 7){
            const riRaw = (((b[8] << 24) >>> 0) + (b[9] << 16) + (b[10] << 8) + b[11]);
            if (riRaw >= 130000 && riRaw <= 155000){
              refractiveIndex = +(riRaw / 100000.0).toFixed(5);
            } else if (riRaw >= 1300000 && riRaw <= 1550000){
              refractiveIndex = +(riRaw / 1000000.0).toFixed(5);
            }
          }
          if (dataLen >= 8 && b[12] >= 1 && b[12] <= 20){
            readCount = b[12];
          } else if (dataLen === 4 && b[8] >= 1 && b[8] <= 20){
            readCount = b[8];
          } else if (dataLen === 6 && b[10] >= 1 && b[10] <= 20){
            readCount = b[10];
          }
          if (refractiveIndex === null) refractiveIndex = estimateNd20FromTds(tds);
          return {
            brand: 'difluid',
            slot: 'refractometer',
            packetType: isMultiAvg ? 'average_result' : 'result',
            isAverage: isMultiAvg,
            autoRead: cmd >= 0x02,
            cmd: cmd,
            pkg: pkg,
            readCount: readCount,
            tds: tds,
            brix: brix,
            refractiveIndex: refractiveIndex,
            nD20: refractiveIndex,
            checksumValid: checksumValid
          };
        }
      }
    }
    return { brand:'difluid', slot:'refractometer', packetType:'ack', func:func, cmd:cmd, checksumValid:checksumValid };
  }

  /* --- 15. DiFluid Omni Roast & Particle Analyzer (`Agtron`, `Roast Delta`, `D10/D50/D90`, `8-32` Histogram Bins) --- */
  function agtronToRoastSwatch(agtronVal, mode){
    const n = Number(agtronVal);
    if (!Number.isFinite(n) || n <= 0) return { roast:'medium', roastKey:'medium', label:'Medium', agtronGroundEst:60 };
    const g = mode === 'bean' ? +(n + 6.5).toFixed(1) : +n.toFixed(1);
    if (g >= 75) return { roast:'light', roastKey:g >= 86 ? 'ultra-light' : 'light', label:g >= 86 ? 'Ultra-Light / Nordic' : 'Light / Nordic', agtronGroundEst:g };
    if (g >= 65) return { roast:'light-medium', roastKey:'medium-light', label:'Light-Medium', agtronGroundEst:g };
    if (g >= 55) return { roast:'medium', roastKey:'medium', label:'Medium', agtronGroundEst:g };
    if (g >= 45) return { roast:'medium-dark', roastKey:'medium-dark', label:'Medium-Dark', agtronGroundEst:g };
    return { roast:'dark', roastKey:'dark', label:'Dark', agtronGroundEst:g };
  }

  function decodeDiFluidOmni(input){
    const b = toU8(input);
    if (b.length < 6 || b[0] !== 0xDF || b[1] !== 0xDF) return null;
    const func = b[2], cmd = b[3], dataLen = b[4];
    if (b.length < 6 + dataLen) return null;
    const checksumValid = (b[5 + dataLen] === sum8Checksum(b, 5 + dataLen));
    if (!checksumValid) return null;

    if (func === 0x02 && dataLen >= 1){
      return {
        brand: 'difluid_omni',
        slot: 'omni',
        packetType: 'battery',
        batteryPct: b[5] <= 100 ? b[5] : null,
        checksumValid: checksumValid
      };
    }

    if (func !== 0x04 || dataLen < 2) return null;

    const pkg = b[5];
    if (pkg === 0x01 && dataLen >= 5){
      const beanRaw = (b[6] << 8) | b[7];
      const groundRaw = (b[8] << 8) | b[9];
      const beanAgtron = beanRaw > 0 ? +(beanRaw / 10).toFixed(1) : null;
      const groundAgtron = groundRaw > 0 ? +(groundRaw / 10).toFixed(1) : null;
      const primary = groundAgtron !== null ? groundAgtron : beanAgtron;
      const sw = agtronToRoastSwatch(primary, groundAgtron !== null ? 'ground' : 'bean');
      return {
        brand: 'difluid_omni',
        slot: 'omni',
        packetType: 'agtron',
        beanAgtron: beanAgtron,
        groundAgtron: groundAgtron,
        agtron: primary,
        roastDelta: (beanAgtron !== null && groundAgtron !== null) ? +(groundAgtron - beanAgtron).toFixed(1) : null,
        suggestedRoast: sw.roast,
        roastKey: sw.roastKey,
        checksumValid: checksumValid
      };
    }

    if (pkg === 0x02 && dataLen >= 7){
      const d10Um = +(((b[6] << 8) | b[7]) / 10).toFixed(1);
      const d50Um = +(((b[8] << 8) | b[9]) / 10).toFixed(1);
      const d90Um = +(((b[10] << 8) | b[11]) / 10).toFixed(1);
      const span = d50Um > 0 ? +((d90Um - d10Um) / d50Um).toFixed(2) : null;
      return {
        brand: 'difluid_omni',
        slot: 'omni',
        packetType: 'psd',
        d10Um: d10Um,
        d50Um: d50Um,
        d90Um: d90Um,
        span: span,
        checksumValid: checksumValid
      };
    }

    /* pkg 0x03: 8-32 Bin Particle Size Distribution Histogram */
    if (pkg === 0x03 && dataLen >= 10){
      const binCount = b[6];
      if (binCount < 8 || binCount > 32 || dataLen < 2 + binCount) return null;
      const minUm = 50;
      const maxUm = 1600;
      const logRatio = Math.log(maxUm / minUm);
      let rawSum = 0;
      const weights = new Array(binCount);
      const isUint16Bins = dataLen >= 2 + binCount * 2;
      for (let i = 0; i < binCount; i++){
        const w = isUint16Bins ? ((b[7 + i * 2] << 8) | b[8 + i * 2]) : b[7 + i];
        weights[i] = w;
        rawSum += w;
      }
      const bins = [];
      for (let j = 0; j < binCount; j++){
        const lo = Math.round(minUm * Math.exp(logRatio * (j / binCount)));
        const hi = Math.round(minUm * Math.exp(logRatio * ((j + 1) / binCount)));
        const pct = rawSum > 0 ? +((weights[j] / rawSum) * 100).toFixed(2) : 0;
        bins.push({ index:j, lowerUm:lo, upperUm:hi, pct:pct });
      }
      return {
        brand: 'difluid_omni',
        slot: 'omni',
        packetType: 'histogram',
        binCount: binCount,
        bins: bins,
        checksumValid: checksumValid
      };
    }

    return { brand:'difluid_omni', slot:'omni', packetType:'ack', cmd:cmd, checksumValid:checksumValid };
  }

  /* --- 16. xBloom Original (`0x58 0x42`) & Studio (`0x58 0x02 0x07` + CRC16-Kermit) Telemetry --- */
  function decodeXBloom(input){
    const b = toU8(input);
    if (b.length < 6 || b[0] !== 0x58) return null;

    if (b[1] === 0x42){
      const opcode = b[2];
      const payloadLen = b[3];
      if (b.length < 4 + payloadLen + 2) return null;
      const crc = crc16Modbus(b.subarray(0, 4 + payloadLen));
      const checksumValid = (b[4 + payloadLen] === crc[0] && b[5 + payloadLen] === crc[1]);
      if (!checksumValid) return null;

      const stageMap = { 0:'idle', 1:'grinding', 2:'blooming', 3:'pouring', 4:'draining', 5:'done' };
      const stageCode = payloadLen >= 1 ? b[4] : 0;
      const tempC = payloadLen >= 2 ? b[5] : null;
      const weightG = payloadLen >= 4 ? +(((b[6] << 8) | b[7]) / 10).toFixed(1) : null;
      const stepIndex = payloadLen >= 5 ? b[8] : 0;
      return {
        brand: 'xbloom',
        slot: 'machine',
        packetType: 'telemetry',
        opcode: opcode,
        stage: stageMap[stageCode] || 'active',
        tempC: tempC,
        weightG: weightG !== null ? cleanZero(weightG) : null,
        stepIndex: stepIndex,
        preGroundSafe: opcode === 0x44,
        checksumValid: checksumValid
      };
    }

    /* xBloom Studio real-hardware telemetry / ACK frame (`58 02 07 ...` / `58 01 ...` + CRC16-Kermit) */
    if (b[1] === 0x02 || b[1] === 0x01){
      const bodyEnd = b.length - 2;
      const kCrc = crc16Kermit(b.subarray(0, bodyEnd));
      const mCrc = crc16Modbus(b.subarray(0, bodyEnd));
      const ck0 = b[bodyEnd], ck1 = b[bodyEnd + 1];
      const crcOk = (ck0 === kCrc[0] && ck1 === kCrc[1]) ||
                    (ck1 === kCrc[0] && ck0 === kCrc[1]) ||
                    (ck0 === mCrc[0] && ck1 === mCrc[1]);
      if (!crcOk) return null;

      if (b[1] === 0x01){
        return {
          brand: 'xbloom',
          slot: 'machine',
          packetType: 'ack',
          opcode: b[2],
          stage: 'active',
          checksumValid: true
        };
      }

      const studioStageMap = {
        0x00:'idle', 0x01:'idle', 0x1F:'armed', 0x23:'grinding',
        0x33:'blooming', 0x3B:'pouring', 0x43:'pouring', 0x41:'done',
        0x02:'grinding', 0x03:'pouring', 0x04:'draining', 0x05:'done'
      };
      const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
      let c1Idx = -1;
      for (let i = 3; i < bodyEnd; i++){
        if (b[i] === 0xC1){ c1Idx = i; break; }
      }

      let stageCode = 0x01;
      let tempC = null;
      let weightG = null;
      if (c1Idx >= 3){
        stageCode = (c1Idx + 1 < bodyEnd) ? b[c1Idx + 1] : 0x01;
        if (c1Idx + 6 <= bodyEnd){
          const fExp = ((b[c1Idx + 5] & 0x7F) << 1) | (b[c1Idx + 4] >>> 7);
          if (fExp >= 115 && fExp <= 142){
            const fw = dv.getFloat32(c1Idx + 2, true);
            if (Number.isFinite(fw) && Math.abs(fw) <= 5000) weightG = +(fw.toFixed(1));
          }
        }
        if (weightG === null && c1Idx + 4 <= bodyEnd){
          const iw = dv.getInt16(c1Idx + 2, true);
          if (Math.abs(iw) <= 30000) weightG = +(iw / 10).toFixed(1);
        }
      } else {
        stageCode = bodyEnd > 4 ? b[4] : b[3];
        if (bodyEnd > 5 && b[5] >= 20 && b[5] <= 105) tempC = b[5];
        if (bodyEnd >= 8){
          const iw2 = dv.getInt16(6, true);
          if (Math.abs(iw2) <= 30000) weightG = +(iw2 / 10).toFixed(1);
        }
      }

      return {
        brand: 'xbloom',
        slot: 'machine',
        variant: 'studio',
        packetType: 'telemetry',
        opcode: b[2],
        subType: b[3],
        stage: studioStageMap[stageCode] || 'active',
        tempC: tempC,
        weightG: weightG !== null ? cleanZero(weightG) : null,
        checksumValid: true
      };
    }
    return null;
  }

  /* --- 17. Fellow Stagg EKG+ Kettle (`0x1820` / `0x2A80` / `2291c4b5-...` Live Temp, Target, Hold & Power) --- */
  function convertStaggRawTempToC(rawVal, unitByte){
    const isF = unitByte === 1 || (unitByte !== 0 && rawVal > 105);
    if (isF){
      return { tempC: +(((rawVal - 32) * 5 / 9).toFixed(1)), unit: 'F' };
    }
    /* Handle 0.5C half-degree tick firmwares (106..208 ticks = 53.0..104.0C when unit === 0) */
    if (unitByte === 0 && rawVal > 105 && rawVal <= 212){
      return { tempC: +((rawVal / 2).toFixed(1)), unit: 'C' };
    }
    return { tempC: +(rawVal.toFixed(1)), unit: 'C' };
  }

  function decodeStaggKettle(input){
    const b = toU8(input);
    if (b.length < 2) return null;

    /* Legacy back-compat framed 0xEF 0xDD 0x0A Stagg EKG+ telemetry packet */
    if (b[0] === 0xEF && b[1] === 0xDD && b.length >= 8 && b[2] === 0x0A){
      const payloadEnd = b.length - 2;
      const cks = acaiaChecksum(b.subarray(3, payloadEnd));
      const checksumValid = (b[payloadEnd] === cks[0] && b[payloadEnd + 1] === cks[1]);
      if (checksumValid){
        const curX10 = (b[3] << 8) | b[4];
        const tgtX10 = (b[5] << 8) | b[6];
        const flags = b.length >= 10 ? b[7] : 0;
        const tempC = +(curX10 / 10).toFixed(1);
        const targetTempC = +(tgtX10 / 10).toFixed(1);
        return {
          brand: 'stagg_ekg_plus',
          slot: 'machine',
          packetType: 'kettle',
          tempC: tempC,
          targetTempC: targetTempC,
          hold: (flags & 0x01) !== 0,
          heating: (flags & 0x02) !== 0,
          power: (flags & 0x02) !== 0 || (flags & 0x01) !== 0,
          lifted: (flags & 0x04) !== 0,
          unit: (flags & 0x08) ? 'F' : 'C',
          checksumValid: checksumValid
        };
      }
    }

    /* Real Fellow Stagg EKG+ RX notifications: EF DD [type 0x00..0x03] ... */
    if (b[0] === 0xEF && b[1] === 0xDD && b.length >= 4 && b[2] <= 0x03){
      const rType = b[2];
      const hasSeqPrefix = b.length >= 6;
      if (hasSeqPrefix && (((b[3] + b[4]) & 0xFF) !== b[5])) return null;
      const valByte = hasSeqPrefix ? b[4] : b[3];
      const unitOrAux = hasSeqPrefix ? (b.length >= 7 ? b[6] : 0xFF) : (b.length >= 5 ? b[4] : 0xFF);

      if (rType === 0x00){
        const lifted0 = valByte === 2 || valByte === 0xFF || unitOrAux === 2;
        const powerOn = valByte === 1 || (valByte > 0 && !lifted0);
        return {
          brand: 'stagg_ekg_plus',
          slot: 'machine',
          packetType: 'kettle',
          subType: 'power',
          tempC: null,
          targetTempC: null,
          power: powerOn,
          heating: powerOn && !lifted0,
          lifted: lifted0
        };
      }
      if (rType === 0x01){
        return {
          brand: 'stagg_ekg_plus',
          slot: 'machine',
          packetType: 'kettle',
          subType: 'hold',
          tempC: null,
          targetTempC: null,
          hold: valByte !== 0
        };
      }
      if (rType === 0x02){
        const convTgt = convertStaggRawTempToC(valByte, unitOrAux <= 1 ? unitOrAux : 0xFF);
        if (convTgt.tempC < 35 || convTgt.tempC > 105) return null;
        return {
          brand: 'stagg_ekg_plus',
          slot: 'machine',
          packetType: 'kettle',
          subType: 'target_temp',
          tempC: null,
          targetTempC: convTgt.tempC,
          unit: convTgt.unit
        };
      }
      if (rType === 0x03){
        if (valByte === 0xFF || valByte === 0x00){
          return {
            brand: 'stagg_ekg_plus',
            slot: 'machine',
            packetType: 'kettle',
            subType: 'lifted',
            tempC: null,
            targetTempC: null,
            lifted: true,
            heating: false
          };
        }
        const convCur = convertStaggRawTempToC(valByte, unitOrAux <= 1 ? unitOrAux : 0xFF);
        if (convCur.tempC < 5 || convCur.tempC > 108) return null;
        return {
          brand: 'stagg_ekg_plus',
          slot: 'machine',
          packetType: 'kettle',
          subType: 'current_temp',
          tempC: convCur.tempC,
          targetTempC: null,
          lifted: false,
          unit: convCur.unit
        };
      }
    }

    /* Direct 2-byte / 4-byte 0x2A80 Stagg EKG+ notification: [modeFlags, currentTemp, targetTemp?, unitFlag?] */
    if (b.length >= 2 && b.length <= 5 && b[0] <= 0x1F){
      const rawTemp = b[1];
      const isFahrenheit = (b.length >= 4 && b[3] === 1) || rawTemp > 105;
      const tempC = isFahrenheit ? +(((rawTemp - 32) * 5 / 9).toFixed(1)) : +rawTemp.toFixed(1);
      if (tempC < 10 || tempC > 106) return null;
      let targetTempC = null;
      if (b.length >= 3 && b[2] >= 40 && b[2] <= 212){
        targetTempC = (isFahrenheit || b[2] > 105) ? +(((b[2] - 32) * 5 / 9).toFixed(1)) : +b[2].toFixed(1);
      }
      return {
        brand: 'stagg_ekg_plus',
        slot: 'machine',
        packetType: 'kettle',
        tempC: tempC,
        targetTempC: targetTempC,
        hold: (b[0] & 0x01) !== 0,
        heating: (b[0] & 0x02) !== 0,
        power: (b[0] & 0x02) !== 0 || (b[0] & 0x01) !== 0,
        lifted: (b[0] & 0x04) !== 0,
        unit: isFahrenheit ? 'F' : 'C'
      };
    }
    return null;
  }

  /* --- 18. Standard UART / NUS ASCII Text Scale (`ST,GS,  18.50 g\r\n`, `-12.4g`) --- */
  function isPrintableAsciiScaleBytes(b){
    if (!b || b.length < 2 || b.length > 64) return false;
    for (let i = 0; i < b.length; i++){
      const c = b[i];
      if (!((c >= 0x20 && c <= 0x7E) || c === 0x0D || c === 0x0A || c === 0x09 || c === 0x00)){
        return false;
      }
    }
    return true;
  }

  function asciiBytesToStr(b){
    let s = '';
    for (let i = 0; i < b.length; i++){
      if (b[i] === 0x00) break;
      s += String.fromCharCode(b[i]);
    }
    return s;
  }

  function decodeAsciiScale(input){
    let rawStr = '';
    if (typeof input === 'string'){
      rawStr = input.trim();
    } else {
      const b = toU8(input);
      if (!isPrintableAsciiScaleBytes(b)) return null;
      rawStr = asciiBytesToStr(b).trim();
    }
    if (!rawStr || rawStr.length < 2 || !/[0-9]/.test(rawStr)) return null;
    const m = rawStr.match(/^(?:(ST|US|SI|S|U)\s*,\s*(?:GS|NT|TR|PT)\s*,\s*)?(?:[A-Za-z]{1,4}\s*[:=]\s*)?([+-]?\s*\d+(?:\.\d+)?)\s*(kg|g|oz|lb|ml)?$/i);
    if (!m) return null;
    const numVal = Number(m[2].replace(/\s+/g, ''));
    if (!Number.isFinite(numVal)) return null;
    const unitRaw = m[3] ? m[3].toLowerCase() : 'g';
    let weightG = numVal;
    if (unitRaw === 'kg') weightG = numVal * 1000;
    else if (unitRaw === 'oz') weightG = numVal * 28.3495231;
    else if (unitRaw === 'lb') weightG = numVal * 453.59237;
    if (Math.abs(weightG) > 50000) return null;
    const stabToken = m[1] ? m[1].toUpperCase() : '';
    const stable = (stabToken === 'ST' || stabToken === 'SI' || stabToken === 'S')
      ? true
      : ((stabToken === 'US' || stabToken === 'U') ? false : null);
    const out = {
      brand: 'ascii',
      slot: 'scale',
      packetType: 'weight',
      weightG: cleanZero(+(weightG.toFixed(2))),
      unit: unitRaw || 'g'
    };
    if (stable !== null) out.stable = stable;
    return out;
  }

  function isPrintableAsciiScaleFrame(b){
    return !!decodeAsciiScale(b);
  }

  function createAsciiStreamParser(){
    const ring = createMtuRingBuffer(MAX_RING_BYTES);
    return {
      reset: function(){ ring.clear(); },
      length: function(){ return ring.length(); },
      push: function(chunk){
        ring.append(chunk);
        const results = [];
        const buf = ring.peek();
        if (!buf.length) return results;
        let lastBreak = -1;
        for (let i = 0; i < buf.length; i++){
          if (buf[i] === 0x0A || buf[i] === 0x0D) lastBreak = i;
        }
        if (lastBreak >= 0){
          const lineBytes = buf.subarray(0, lastBreak + 1);
          const text = asciiBytesToStr(lineBytes);
          const lines = text.split(/[\r\n]+/);
          for (let li = 0; li < lines.length; li++){
            const ln = lines[li].trim();
            if (!ln) continue;
            const parsed = decodeAsciiScale(ln);
            if (parsed) results.push(parsed);
          }
          ring.consume(lastBreak + 1);
          return results;
        }
        if (isPrintableAsciiScaleBytes(buf)){
          const txt = asciiBytesToStr(buf).trim();
          if (/[a-z]$/i.test(txt)){
            const single = decodeAsciiScale(txt);
            if (single){
              results.push(single);
              ring.clear();
            }
          }
        } else {
          ring.clear();
        }
        return results;
      }
    };
  }

  /* ============================================================================
   * STREAM PARSERS & 0xFFF0 / 0x1820 MAGIC-BYTE AUTO-PROMOTION
   * ============================================================================ */
  function createDiFluidStreamParser(mode){
    const ring = createMtuRingBuffer(MAX_RING_BYTES);
    const targetMode = String(mode || 'auto').toLowerCase();
    return {
      reset: function(){ ring.clear(); },
      length: function(){ return ring.length(); },
      push: function(chunk){
        ring.append(chunk);
        const results = [];
        while (ring.length() >= 6){
          const buf = ring.peek();
          let start = -1;
          for (let i = 0; i <= buf.length - 2; i++){
            if (buf[i] === 0xDF && buf[i + 1] === 0xDF){ start = i; break; }
          }
          if (start < 0){
            const keepTail = buf[buf.length - 1] === 0xDF ? 1 : 0;
            ring.consume(buf.length - keepTail);
            break;
          }
          if (start > 0){
            ring.consume(start);
            if (ring.length() < 6) break;
          }
          const cur = ring.peek();
          const dataLen = cur[4];
          const frameLen = 6 + dataLen;
          if (frameLen > 128){
            ring.consume(2);
            continue;
          }
          if (cur.length < frameLen) break;

          const slice = cur.subarray(0, frameLen);
          const sumOk = (slice[frameLen - 1] === sum8Checksum(slice, frameLen - 1));
          if (!sumOk){
            ring.consume(2);
            continue;
          }

          let parsed = null;
          if (targetMode === 'scale'){
            parsed = decodeDiFluidScale(slice);
          } else if (targetMode === 'omni'){
            parsed = decodeDiFluidOmni(slice);
          } else if (targetMode === 'r2'){
            parsed = slice[2] === 0x04 ? decodeDiFluidOmni(slice) : decodeDiFluidR2(slice);
          } else {
            if (slice[2] === 0x04){
              parsed = decodeDiFluidOmni(slice);
            } else if (slice[2] === 0x03 && (slice[3] === 0x00 || slice[3] === 0x01) && dataLen >= 13){
              parsed = decodeDiFluidScale(slice);
            } else if (slice[2] === 0x03 && slice[3] === 0x02 && dataLen === 1){
              parsed = decodeDiFluidScale(slice);
            } else {
              const r2Cand = decodeDiFluidR2(slice);
              if (r2Cand && r2Cand.packetType !== 'ack' && !(slice[3] === 0x01 && r2Cand.packetType === 'status' && dataLen >= 4)){
                parsed = r2Cand;
              } else {
                const scCand = decodeDiFluidScale(slice);
                parsed = (scCand && scCand.packetType !== 'ack') ? scCand : (r2Cand || scCand);
              }
            }
          }
          if (parsed) results.push(parsed);
          ring.consume(frameLen);
        }
        return results;
      }
    };
  }

  function createTimemoreOspStreamParser(){
    const ring = createMtuRingBuffer(MAX_RING_BYTES);
    return {
      reset: function(){ ring.clear(); },
      length: function(){ return ring.length(); },
      push: function(chunk){
        ring.append(chunk);
        const results = [];
        while (ring.length() >= 8){
          const buf = ring.peek();
          let start = -1;
          for (let i = 0; i <= buf.length - 2; i++){
            if (buf[i] === 0xA5 && buf[i + 1] === 0x5A){ start = i; break; }
          }
          if (start < 0){
            const keepTail = buf[buf.length - 1] === 0xA5 ? 1 : 0;
            ring.consume(buf.length - keepTail);
            break;
          }
          if (start > 0){
            ring.consume(start);
            if (ring.length() < 8) break;
          }
          const cur = ring.peek();
          const payloadLen = (cur[4] << 8) | cur[5];
          const frameLen = 8 + payloadLen;
          if (payloadLen > 64){
            ring.consume(2);
            continue;
          }
          if (cur.length < frameLen) break;
          const slice = cur.subarray(0, frameLen);
          const parsed = decodeTimemore(slice);
          if (parsed){
            results.push(parsed);
            ring.consume(frameLen);
          } else {
            ring.consume(2);
          }
        }
        return results;
      }
    };
  }

  function createVariaStreamParser(){
    const ring = createMtuRingBuffer(MAX_RING_BYTES);
    return {
      reset: function(){ ring.clear(); },
      length: function(){ return ring.length(); },
      push: function(chunk){
        ring.append(chunk);
        const results = [];
        while (ring.length() >= 5){
          const buf = ring.peek();
          let start = -1;
          for (let i = 0; i < buf.length; i++){
            if (buf[i] === 0xFA || buf[i] === 0xFB || buf[i] === 0x55){ start = i; break; }
          }
          if (start < 0){
            ring.clear();
            break;
          }
          if (start > 0){
            ring.consume(start);
            if (ring.length() < 5) break;
          }
          const cur = ring.peek();
          const len = cur[2];
          const frameLen = 4 + len;
          if (len < 1 || len > 32){
            ring.consume(1);
            continue;
          }
          if (cur.length < frameLen) break;
          const slice = cur.subarray(0, frameLen);
          const parsed = decodeVaria(slice);
          if (parsed){
            results.push(parsed);
            ring.consume(frameLen);
          } else {
            ring.consume(1);
          }
        }
        return results;
      }
    };
  }

  function createBookooStreamParser(){
    const ring = createMtuRingBuffer(MAX_RING_BYTES);
    return {
      reset: function(){ ring.clear(); },
      length: function(){ return ring.length(); },
      push: function(chunk){
        ring.append(chunk);
        const results = [];
        while (ring.length() >= 20){
          const buf = ring.peek();
          let start = -1;
          for (let i = 0; i <= buf.length - 2; i++){
            if (buf[i] === 0x03 && (buf[i + 1] === 0x0B || buf[i + 1] === 0xCE)){ start = i; break; }
          }
          if (start < 0){
            const keepTail = buf[buf.length - 1] === 0x03 ? 1 : 0;
            ring.consume(buf.length - keepTail);
            break;
          }
          if (start > 0){
            ring.consume(start);
            if (ring.length() < 20) break;
          }
          const cur = ring.peek();
          const slice = cur.subarray(0, 20);
          const parsed = decodeBookoo(slice);
          if (parsed){
            results.push(parsed);
            ring.consume(20);
          } else {
            ring.consume(2);
          }
        }
        return results;
      }
    };
  }

  /**
   * Deterministic Magic-Byte Protocol Disambiguator (`0xFFF0`, `0xFFE0`, `0xFFB0`, `0x181D`, `0x1820` Collision Guard)
   */
  function detectProtocolFromBytes(input, context){
    const b = toU8(input);
    const ctx = context || {};
    const devName = String(ctx.deviceName || '');
    const svc = normUuid(ctx.serviceUuid || '');
    const chr = normUuid(ctx.charUuid || '');
    if (b.length < 2) return null;

    if (b[0] === 0xDF && b[1] === 0xDF){
      if (b.length >= 3 && b[2] === 0x04) return 'difluid_omni';
      if (ctx.slot === 'omni') return 'difluid_omni';
      if (ctx.slot === 'scale' || svc === UUID.DIFLUID_SCALE_SVC || svc === UUID.DIFLUID_SCALE_ALT_SVC || /microbalance|dft-?s|df-?s/i.test(devName)){
        return 'difluid';
      }
      if (ctx.slot === 'refractometer' || svc === UUID.DIFLUID_SVC || /^0e140001-/.test(svc) || /r2|extract|refract/i.test(devName)){
        if (ctx.slot !== 'refractometer' && b.length >= 5 && b[2] === 0x03 && b[4] >= 13) return 'difluid';
        return 'difluid_r2';
      }
      return 'difluid';
    }
    if (b[0] === 0xEF && b[1] === 0xDD){
      if (ctx.slot === 'machine' || ctx.slot === 'kettle' || chr === UUID.STAGG_EKG_ALT_CHAR || /stagg|ekg|fellow/i.test(devName) || (b.length >= 8 && b[2] === 0x0A) || (b.length >= 4 && b.length <= 6 && b[2] <= 0x03 && ctx.slot !== 'scale')){
        return 'stagg_ekg_plus';
      }
      return 'acaia';
    }
    if (b[0] === 0xA5 && b[1] === 0x5A) return 'timemore';
    if (b[0] === 0x58 && (b[1] === 0x42 || (b.length >= 3 && (b[1] === 0x02 || b[1] === 0x01) && b[2] === 0x07) || decodeXBloom(b))){
      return 'xbloom';
    }
    if (b[0] === 0x01 && b[1] === 0x02 && b.length >= 9){
      if (decodeFelicita(b)) return 'felicita';
    }
    if (b[0] === 0xFA || b[0] === 0xFB || b[0] === 0x55){
      if (decodeVaria(b)) return 'varia';
      if (b.length < 5 && !(b[0] === 0x55 && isPrintableAsciiScaleBytes(b))) return 'varia';
    }
    if (b[0] === 0xAA){
      if ((b.length >= 3 && b[1] === 0x09 && b[2] === 0x41) || decodeEureka(b)) return 'eureka';
    }
    if (b[0] === 0x03){
      if (chr === UUID.BOOKOO_EM_NOTIFY || ctx.slot === 'pressure'){
        if (decodeBookooPressure(b)) return 'bookoo_pressure';
      }
      if ((b[1] === 0x0B || b[1] === 0xCE) && b.length >= 20) return 'bookoo';
      if ((b[1] === 0xCE || b[1] === 0xCA || b[1] === 0x0A || b[1] === 0xAA || b[1] === 0x0B) && (b.length === 7 || b.length === 10)){
        /* Prevent chunk 1 of a 20B Bookoo frame (0x03 0x0B/0xCE) from falsely locking onto Decent */
        if (!(b.length === 10 && (b[1] === 0x0B || b[1] === 0xCE) && (b[6] === 0x2B || b[6] === 0x2D)) && decodeDecent(b, { strictXor: true })){
          return 'decent';
        }
      }
    }
    if (b[0] === 0x02 && (chr === UUID.BOOKOO_EM_NOTIFY || ctx.slot === 'pressure')){
      if (decodeBookooPressure(b)) return 'bookoo_pressure';
    }
    if (decodeAsciiScale(b) || (isPrintableAsciiScaleBytes(b) && /^(?:ST|US|SI)\s*,/i.test(asciiBytesToStr(b)))){
      return 'ascii';
    }
    if (svc === UUID.WEIGHT_SIG_SVC && b.length >= 8 && (b[0] & 0x02) === 0){
      if (decodeTimemore(b)) return 'timemore';
    }
    if (svc === UUID.ACAIA_LEGACY_SVC && /stagg|ekg|fellow/i.test(devName)){
      return 'stagg_ekg_plus';
    }
    return null;
  }

  /**
   * GATT Service + Characteristic + Device Name Signature Disambiguator
   */
  function detectGattProfile(services, deviceName, slotHint){
    const name = String(deviceName || '');
    const slot = String(slotHint || 'scale').toLowerCase();
    const svcMap = {};
    (services || []).forEach(function(s){
      const su = normUuid(s.uuid);
      const chars = (s.characteristics || []).map(function(c){
        return { uuid:normUuid(c.uuid), raw:c, properties:c.properties || null };
      });
      svcMap[su] = { uuid:su, raw:s, chars:chars };
    });

    function findChar(su, cu){
      const sv = svcMap[su];
      if (!sv) return null;
      for (let i = 0; i < sv.chars.length; i++){
        if (sv.chars[i].uuid === cu) return sv.chars[i];
      }
      return null;
    }

    function canNotify(c){
      return !!(c && (!c.properties || c.properties.notify || c.properties.indicate));
    }

    function canWrite(c){
      return !!(c && (!c.properties || c.properties.write || c.properties.writeWithoutResponse));
    }

    function hasExplicitWrite(c){
      return !!(c && c.properties && (c.properties.write === true || c.properties.writeWithoutResponse === true));
    }

    function pickNotifyAndWrite(svcObj, prefNotifyUuids, prefWriteUuids){
      if (!svcObj || !svcObj.chars.length) return { notify:null, write:null, altWrite:null, extraNotifyUuids:[] };
      let nChar = null;
      for (let ni = 0; ni < prefNotifyUuids.length; ni++){
        const candN = findChar(svcObj.uuid, prefNotifyUuids[ni]);
        if (candN && canNotify(candN)){ nChar = candN; break; }
      }
      if (!nChar){
        for (let ci = 0; ci < svcObj.chars.length; ci++){
          if (canNotify(svcObj.chars[ci])){ nChar = svcObj.chars[ci]; break; }
        }
      }
      if (!nChar) nChar = svcObj.chars[0] || null;

      const wList = [];
      for (let wi = 0; wi < prefWriteUuids.length; wi++){
        const candW = findChar(svcObj.uuid, prefWriteUuids[wi]);
        if (candW && canWrite(candW) && wList.indexOf(candW) < 0) wList.push(candW);
      }
      for (let cwi = 0; cwi < svcObj.chars.length; cwi++){
        const anyW = svcObj.chars[cwi];
        if (canWrite(anyW) && wList.indexOf(anyW) < 0) wList.push(anyW);
      }
      const wChar = wList[0] || (nChar && canWrite(nChar) ? nChar : null);
      const altWChar = wList[1] || null;
      const extras = svcObj.chars
        .filter(function(c){ return nChar && c.uuid !== nChar.uuid && canNotify(c); })
        .map(function(c){ return c.uuid; });
      return { notify:nChar, write:wChar, altWrite:altWChar, extraNotifyUuids:extras };
    }

    if (slot === 'pressure'){
      if (svcMap[UUID.PRESSENSOR_SVC]){
        const pn = findChar(UUID.PRESSENSOR_SVC, UUID.PRESSENSOR_NOTIFY) || svcMap[UUID.PRESSENSOR_SVC].chars[0];
        const pw = findChar(UUID.PRESSENSOR_SVC, UUID.PRESSENSOR_WRITE);
        if (pn) return { family:'pressensor', slot:'pressure', serviceUuid:UUID.PRESSENSOR_SVC, notifyUuid:pn.uuid, writeUuid:pw ? pw.uuid : null };
      }
      const bkEmSvc = svcMap[UUID.BOOKOO_EM_SVC] || (svcMap[UUID.BOOKOO_SVC] && /em|pressure|monitor/i.test(name) ? svcMap[UUID.BOOKOO_SVC] : null);
      if (bkEmSvc){
        const bn = findChar(bkEmSvc.uuid, UUID.BOOKOO_EM_NOTIFY) || bkEmSvc.chars[0];
        const bw = findChar(bkEmSvc.uuid, UUID.BOOKOO_EM_WRITE);
        const extraEss = [];
        if (svcMap[UUID.ESS_SVC] && findChar(UUID.ESS_SVC, UUID.ESS_TEMP_CHAR)){
          extraEss.push({ serviceUuid:UUID.ESS_SVC, charUuid:UUID.ESS_TEMP_CHAR });
        }
        if (bn) return { family:'bookoo_pressure', slot:'pressure', serviceUuid:bkEmSvc.uuid, notifyUuid:bn.uuid, extraNotifyTargets:extraEss, writeUuid:bw ? bw.uuid : null };
      }
      if (svcMap[UUID.ESS_SVC]){
        const essP = findChar(UUID.ESS_SVC, UUID.PRESSENSOR_SIG_CHAR) || svcMap[UUID.ESS_SVC].chars[0];
        const essT = findChar(UUID.ESS_SVC, UUID.ESS_TEMP_CHAR);
        const extraEssUuids = (essT && essP && essT.uuid !== essP.uuid) ? [essT.uuid] : [];
        if (essP) return { family:'pressensor', slot:'pressure', serviceUuid:UUID.ESS_SVC, notifyUuid:essP.uuid, extraNotifyUuids:extraEssUuids, writeUuid:null };
      }
      if (svcMap[UUID.PRESSENSOR_SIG_SVC]){
        const psn = findChar(UUID.PRESSENSOR_SIG_SVC, UUID.PRESSENSOR_SIG_CHAR) || svcMap[UUID.PRESSENSOR_SIG_SVC].chars[0];
        const pst = findChar(UUID.PRESSENSOR_SIG_SVC, UUID.ESS_TEMP_CHAR);
        if (psn) return { family:'pressensor', slot:'pressure', serviceUuid:UUID.PRESSENSOR_SIG_SVC, notifyUuid:psn.uuid, extraNotifyUuids:(pst && pst.uuid !== psn.uuid) ? [pst.uuid] : [], writeUuid:null };
      }
      if (svcMap[UUID.BOOKOO_SVC]){
        const bn2 = findChar(UUID.BOOKOO_SVC, UUID.BOOKOO_EM_NOTIFY) || svcMap[UUID.BOOKOO_SVC].chars[0];
        const bw2 = findChar(UUID.BOOKOO_SVC, UUID.BOOKOO_EM_WRITE);
        if (bn2) return { family:'bookoo_pressure', slot:'pressure', serviceUuid:UUID.BOOKOO_SVC, notifyUuid:bn2.uuid, writeUuid:bw2 ? bw2.uuid : null };
      }
    }

    if (slot === 'refractometer' || slot === 'omni'){
      const isOmniSlot = slot === 'omni';
      const v3SvcKey = Object.keys(svcMap).find(function(k){ return /^0e140001-/.test(k); }) || UUID.DIFLUID_V3_SVC;
      const dfCandidateOrder = isOmniSlot
        ? [
            UUID.DIFLUID_OMNI_SVC,
            UUID.DIFLUID_SVC,
            v3SvcKey,
            UUID.DIFLUID_SCALE_SVC,
            UUID.DIFLUID_SCALE_ALT_SVC,
            UUID.FELICITA_SVC,
            UUID.SHARED_FFF0_SVC,
            UUID.NUS_SVC
          ]
        : [
            UUID.DIFLUID_SVC,
            v3SvcKey,
            UUID.DIFLUID_SCALE_SVC,
            UUID.DIFLUID_SCALE_ALT_SVC,
            UUID.FELICITA_SVC,
            UUID.SHARED_FFF0_SVC,
            UUID.NUS_SVC,
            UUID.DIFLUID_OMNI_SVC
          ];
      const matchedDfSvcs = [];
      for (let ri = 0; ri < dfCandidateOrder.length; ri++){
        const sk = dfCandidateOrder[ri];
        if (svcMap[sk] && svcMap[sk].chars.length && matchedDfSvcs.indexOf(svcMap[sk]) < 0){
          matchedDfSvcs.push(svcMap[sk]);
        }
      }
      if (!matchedDfSvcs.length && !isOmniSlot){
        Object.keys(svcMap).forEach(function(sk){
          if (!/^0000180[01af]-/.test(sk) && svcMap[sk].chars.length){
            matchedDfSvcs.push(svcMap[sk]);
          }
        });
      }
      if (matchedDfSvcs.length){
        const rSvc = matchedDfSvcs[0];
        const pickedDf = pickNotifyAndWrite(
          rSvc,
          [UUID.DIFLUID_CHAR, UUID.DIFLUID_WRITE_ALT, UUID.DIFLUID_V3_NOTIFY, UUID.FELICITA_CHAR, UUID.XBLOOM_SHORT_NOTIFY, UUID.FFF1_NOTIFY, UUID.FFF2_WRITE, UUID.NUS_NOTIFY],
          [UUID.DIFLUID_WRITE_ALT, UUID.DIFLUID_CHAR, UUID.DIFLUID_V3_WRITE, UUID.FFF2_WRITE, UUID.FELICITA_CHAR, UUID.XBLOOM_SHORT_NOTIFY, UUID.NUS_WRITE]
        );
        const extraNotifyTargets = [];
        for (let si = 1; si < matchedDfSvcs.length; si++){
          const secSvc = matchedDfSvcs[si];
          for (let sci = 0; sci < secSvc.chars.length; sci++){
            const sc = secSvc.chars[sci];
            if (canNotify(sc)){
              extraNotifyTargets.push({ serviceUuid: secSvc.uuid, charUuid: sc.uuid });
            }
          }
        }
        if (pickedDf.notify){
          return {
            family: isOmniSlot ? 'difluid_omni' : 'difluid_r2',
            slot: isOmniSlot ? 'omni' : 'refractometer',
            serviceUuid: rSvc.uuid,
            notifyUuid: pickedDf.notify.uuid,
            extraNotifyUuids: pickedDf.extraNotifyUuids,
            extraNotifyTargets: extraNotifyTargets,
            writeUuid: pickedDf.write ? pickedDf.write.uuid : null,
            altWriteUuid: pickedDf.altWrite ? pickedDf.altWrite.uuid : null
          };
        }
      }
    }

    if (slot === 'machine' || slot === 'kettle'){
      if (slot !== 'kettle' && (svcMap[UUID.XBLOOM_SVC] || (svcMap[UUID.XBLOOM_SHORT_SVC] && /xbloom|tbdx/i.test(name)))){
        const xs = svcMap[UUID.XBLOOM_SVC] || svcMap[UUID.XBLOOM_SHORT_SVC];
        const xw = findChar(xs.uuid, UUID.XBLOOM_WRITE) || findChar(xs.uuid, UUID.XBLOOM_SHORT_WRITE) || xs.chars[0];
        const xn = findChar(xs.uuid, UUID.XBLOOM_NOTIFY) || findChar(xs.uuid, UUID.XBLOOM_SHORT_NOTIFY);
        const xAux = findChar(xs.uuid, UUID.XBLOOM_AUX);
        const xExtra = (xAux && (!xn || xAux.uuid !== xn.uuid) && canNotify(xAux)) ? [xAux.uuid] : [];
        if (xw) return { family:'xbloom', slot:'machine', serviceUuid:xs.uuid, notifyUuid:xn ? xn.uuid : (xAux ? xAux.uuid : null), extraNotifyUuids:xExtra, writeUuid:xw.uuid };
      }
      if (svcMap[UUID.STAGG_EKG_SVC] && (/stagg|ekg|fellow/i.test(name) || slot === 'kettle')){
        const pickedK = pickNotifyAndWrite(
          svcMap[UUID.STAGG_EKG_SVC],
          [UUID.STAGG_EKG_ALT_CHAR, UUID.STAGG_EKG_CHAR],
          [UUID.STAGG_EKG_ALT_CHAR, UUID.STAGG_EKG_CHAR]
        );
        if (pickedK.notify){
          return {
            family: 'stagg_ekg_plus',
            slot: 'machine',
            serviceUuid: UUID.STAGG_EKG_SVC,
            notifyUuid: pickedK.notify.uuid,
            extraNotifyUuids: pickedK.extraNotifyUuids,
            writeUuid: pickedK.write ? pickedK.write.uuid : pickedK.notify.uuid,
            altWriteUuid: pickedK.altWrite ? pickedK.altWrite.uuid : null
          };
        }
      }
      if (slot === 'machine' && svcMap[UUID.XBLOOM_SHORT_SVC]){
        const xs2 = svcMap[UUID.XBLOOM_SHORT_SVC];
        const xw2 = findChar(xs2.uuid, UUID.XBLOOM_SHORT_WRITE) || xs2.chars[0];
        const xn2 = findChar(xs2.uuid, UUID.XBLOOM_SHORT_NOTIFY) || (xs2.chars.length > 1 ? xs2.chars[1] : null);
        if (xw2) return { family:'xbloom', slot:'machine', serviceUuid:xs2.uuid, notifyUuid:xn2 ? xn2.uuid : null, writeUuid:xw2.uuid };
      }
    }

    /* Scale Disambiguation (11+ Families incl. 0x1820 vs Stagg & 0xFFF0 / 0xFFE0 / 0xFFB0 / 0x181D collisions) */
    if (svcMap[UUID.ACAIA_PYXIS_SVC]){
      const pickedPyxis = pickNotifyAndWrite(
        svcMap[UUID.ACAIA_PYXIS_SVC],
        [UUID.ACAIA_PYXIS_NOTIFY, UUID.ACAIA_PYXIS_WRITE],
        [UUID.ACAIA_PYXIS_WRITE, UUID.ACAIA_PYXIS_NOTIFY]
      );
      if (pickedPyxis.notify){
        return {
          family: 'acaia',
          slot: 'scale',
          serviceUuid: UUID.ACAIA_PYXIS_SVC,
          notifyUuid: pickedPyxis.notify.uuid,
          extraNotifyUuids: pickedPyxis.extraNotifyUuids,
          writeUuid: pickedPyxis.write ? pickedPyxis.write.uuid : null,
          altWriteUuid: pickedPyxis.altWrite ? pickedPyxis.altWrite.uuid : null
        };
      }
    }
    if (svcMap[UUID.ACAIA_LEGACY_SVC]){
      if (/stagg|ekg|fellow/i.test(name)){
        const pickedStagg = pickNotifyAndWrite(
          svcMap[UUID.ACAIA_LEGACY_SVC],
          [UUID.STAGG_EKG_ALT_CHAR, UUID.STAGG_EKG_CHAR],
          [UUID.STAGG_EKG_ALT_CHAR, UUID.STAGG_EKG_CHAR]
        );
        if (pickedStagg.notify){
          return {
            family: 'stagg_ekg_plus',
            slot: 'machine',
            serviceUuid: UUID.ACAIA_LEGACY_SVC,
            notifyUuid: pickedStagg.notify.uuid,
            extraNotifyUuids: pickedStagg.extraNotifyUuids,
            writeUuid: pickedStagg.write ? pickedStagg.write.uuid : pickedStagg.notify.uuid,
            altWriteUuid: pickedStagg.altWrite ? pickedStagg.altWrite.uuid : null
          };
        }
      }
      const alc = findChar(UUID.ACAIA_LEGACY_SVC, UUID.ACAIA_LEGACY_CHAR) || svcMap[UUID.ACAIA_LEGACY_SVC].chars[0];
      if (alc){
        return { family:'acaia', slot:'scale', serviceUuid:UUID.ACAIA_LEGACY_SVC, notifyUuid:alc.uuid, writeUuid:alc.uuid };
      }
    }
    const v3ScaleKey = Object.keys(svcMap).find(function(k){ return /^0e140001-/.test(k); });
    const dfScaleSvc = svcMap[UUID.DIFLUID_SCALE_SVC]
      || svcMap[UUID.DIFLUID_SCALE_ALT_SVC]
      || ((/microbalance|difluid|dft-?s|df-?s/i.test(name) || (!svcMap[UUID.BOOKOO_SVC] && !svcMap[UUID.SKALE_SVC] && !svcMap[UUID.FELICITA_SVC] && !svcMap[UUID.HIROIA_SVC] && !svcMap[UUID.SHARED_FFF0_SVC] && !svcMap[UUID.WEIGHT_SIG_SVC])) && (svcMap[UUID.DIFLUID_SVC] || (v3ScaleKey ? svcMap[v3ScaleKey] : null)));
    if (dfScaleSvc){
      const pickedDfs = pickNotifyAndWrite(
        dfScaleSvc,
        [UUID.DIFLUID_CHAR, UUID.DIFLUID_V3_NOTIFY, UUID.DIFLUID_WRITE_ALT],
        [UUID.DIFLUID_WRITE_ALT, UUID.DIFLUID_CHAR, UUID.DIFLUID_V3_WRITE]
      );
      if (pickedDfs.notify){
        return {
          family: 'difluid',
          slot: 'scale',
          serviceUuid: dfScaleSvc.uuid,
          notifyUuid: pickedDfs.notify.uuid,
          extraNotifyUuids: pickedDfs.extraNotifyUuids,
          writeUuid: pickedDfs.write ? pickedDfs.write.uuid : null,
          altWriteUuid: pickedDfs.altWrite ? pickedDfs.altWrite.uuid : null
        };
      }
    }
    if (svcMap[UUID.BOOKOO_SVC]){
      const pickedBk = pickNotifyAndWrite(
        svcMap[UUID.BOOKOO_SVC],
        [UUID.BOOKOO_NOTIFY],
        [UUID.BOOKOO_WRITE, UUID.BOOKOO_NOTIFY]
      );
      if (pickedBk.notify){
        return {
          family: 'bookoo',
          slot: 'scale',
          serviceUuid: UUID.BOOKOO_SVC,
          notifyUuid: pickedBk.notify.uuid,
          extraNotifyUuids: pickedBk.extraNotifyUuids,
          writeUuid: pickedBk.write ? pickedBk.write.uuid : null,
          altWriteUuid: pickedBk.altWrite ? pickedBk.altWrite.uuid : null
        };
      }
    }
    if (svcMap[UUID.SKALE_SVC]){
      const skn = findChar(UUID.SKALE_SVC, UUID.SKALE_NOTIFY) || svcMap[UUID.SKALE_SVC].chars[0];
      const skw = findChar(UUID.SKALE_SVC, UUID.SKALE_WRITE);
      const skb = findChar(UUID.SKALE_SVC, UUID.SKALE_BTN_NOTIFY);
      if (skn) return { family:'skale', slot:'scale', serviceUuid:UUID.SKALE_SVC, notifyUuid:skn.uuid, extraNotifyUuids:skb ? [skb.uuid] : [], writeUuid:skw ? skw.uuid : null };
    }
    if (svcMap[UUID.HIROIA_SVC]){
      const hn = findChar(UUID.HIROIA_SVC, UUID.HIROIA_NOTIFY) || svcMap[UUID.HIROIA_SVC].chars[0];
      const hw = findChar(UUID.HIROIA_SVC, UUID.HIROIA_WRITE);
      if (hn) return { family:'hiroia', slot:'scale', serviceUuid:UUID.HIROIA_SVC, notifyUuid:hn.uuid, writeUuid:hw ? hw.uuid : null };
    }
    if (svcMap[UUID.SHARED_FFF0_SVC]){
      const fff4 = findChar(UUID.SHARED_FFF0_SVC, UUID.DECENT_NOTIFY);
      const w36f5 = findChar(UUID.SHARED_FFF0_SVC, UUID.DECENT_WRITE);
      if (fff4 && canNotify(fff4)){
        return { family:'decent', slot:'scale', serviceUuid:UUID.SHARED_FFF0_SVC, notifyUuid:fff4.uuid, writeUuid:w36f5 ? w36f5.uuid : null, autoPromoteOnFirstFrame:true };
      }
      const pickedFff0 = pickNotifyAndWrite(
        svcMap[UUID.SHARED_FFF0_SVC],
        [UUID.FFF1_NOTIFY, UUID.FFF2_WRITE],
        [UUID.FFF2_WRITE, UUID.FFF1_NOTIFY]
      );
      if (pickedFff0.notify){
        let initFam = 'timemore';
        if (/varia|aku|cube|mhw|exagram|wacaco/i.test(name)) initFam = 'varia';
        else if (/eureka|precisa|cfs-?9002|lsj|brewista|smart\s*scale|formula|solobarista|kc200|weighmybru/i.test(name)) initFam = 'eureka';
        else if (/decent|hds/i.test(name)) initFam = 'decent';
        else if (/felicita/i.test(name)) initFam = 'felicita';
        return {
          family: initFam,
          variant: initFam === 'timemore' ? 'osp' : '',
          slot: 'scale',
          serviceUuid: UUID.SHARED_FFF0_SVC,
          notifyUuid: pickedFff0.notify.uuid,
          extraNotifyUuids: pickedFff0.extraNotifyUuids,
          writeUuid: pickedFff0.write ? pickedFff0.write.uuid : null,
          altWriteUuid: pickedFff0.altWrite ? pickedFff0.altWrite.uuid : null,
          autoPromoteOnFirstFrame: true
        };
      }
    }
    if (svcMap[UUID.EUREKA_ALT_SVC]){
      const pickedFfb0 = pickNotifyAndWrite(
        svcMap[UUID.EUREKA_ALT_SVC],
        [UUID.EUREKA_ALT_CHAR],
        [UUID.EUREKA_ALT_CHAR]
      );
      if (pickedFfb0.notify){
        const ffbFam = /varia|aku|cube|mhw|exagram|wacaco/i.test(name) ? 'varia' : 'eureka';
        return {
          family: ffbFam,
          slot: 'scale',
          serviceUuid: UUID.EUREKA_ALT_SVC,
          notifyUuid: pickedFfb0.notify.uuid,
          extraNotifyUuids: pickedFfb0.extraNotifyUuids,
          writeUuid: pickedFfb0.write ? pickedFfb0.write.uuid : null,
          altWriteUuid: pickedFfb0.altWrite ? pickedFfb0.altWrite.uuid : null,
          autoPromoteOnFirstFrame: true
        };
      }
    }
    if (svcMap[UUID.FELICITA_SVC] && !/xbloom|tbdx/i.test(name)){
      const pickedFfe0 = pickNotifyAndWrite(
        svcMap[UUID.FELICITA_SVC],
        [UUID.FELICITA_CHAR, UUID.XBLOOM_SHORT_NOTIFY],
        [UUID.FELICITA_CHAR, UUID.XBLOOM_SHORT_NOTIFY]
      );
      if (pickedFfe0.notify){
        let ffeFam = 'felicita';
        if (/varia|aku|cube|mhw|exagram|wacaco/i.test(name)) ffeFam = 'varia';
        else if (/eureka|precisa|cfs-?9002|lsj|brewista|smart\s*scale|formula|solobarista|kc200|weighmybru/i.test(name)) ffeFam = 'eureka';
        else if (/decent|hds/i.test(name)) ffeFam = 'decent';
        else if (/timemore|black\s*mirror|^tm\b/i.test(name)) ffeFam = 'timemore';
        return {
          family: ffeFam,
          slot: 'scale',
          serviceUuid: UUID.FELICITA_SVC,
          notifyUuid: pickedFfe0.notify.uuid,
          extraNotifyUuids: pickedFfe0.extraNotifyUuids,
          writeUuid: pickedFfe0.write ? pickedFfe0.write.uuid : null,
          altWriteUuid: pickedFfe0.altWrite ? pickedFfe0.altWrite.uuid : null,
          autoPromoteOnFirstFrame: true
        };
      }
    }
    if (svcMap[UUID.NUS_SVC]){
      const nn = findChar(UUID.NUS_SVC, UUID.NUS_NOTIFY) || svcMap[UUID.NUS_SVC].chars[0];
      const nw = findChar(UUID.NUS_SVC, UUID.NUS_WRITE);
      if (nn){
        let nusFam = 'timemore';
        if (/varia|aku|cube|mhw|exagram|wacaco/i.test(name)) nusFam = 'varia';
        else if (/uart|ascii|serial|ohaus|mettler/i.test(name)) nusFam = 'ascii';
        return { family:nusFam, variant:nusFam === 'timemore' ? 'osp' : '', slot:'scale', serviceUuid:UUID.NUS_SVC, notifyUuid:nn.uuid, writeUuid:nw ? nw.uuid : null, autoPromoteOnFirstFrame:true };
      }
    }
    if (svcMap[UUID.WEIGHT_SIG_SVC]){
      const sn = findChar(UUID.WEIGHT_SIG_SVC, UUID.WEIGHT_SIG_NOTIFY) || svcMap[UUID.WEIGHT_SIG_SVC].chars[0];
      const tmSigWrite = findChar(UUID.WEIGHT_SIG_SVC, UUID.TIMEMORE_SIG_WRITE);
      const tmCustomWrite = findChar(UUID.WEIGHT_SIG_SVC, UUID.TIMEMORE_CUSTOM_WRITE)
        || (svcMap[UUID.TIMEMORE_CUSTOM_SVC] ? findChar(UUID.TIMEMORE_CUSTOM_SVC, UUID.TIMEMORE_CUSTOM_WRITE) : null);
      const sigCtrlWrite = findChar(UUID.WEIGHT_SIG_SVC, UUID.WEIGHT_SIG_CTRL);
      const usableTmSigWrite = (tmSigWrite && canWrite(tmSigWrite)) ? tmSigWrite : null;
      const sw = usableTmSigWrite || tmCustomWrite || sigCtrlWrite || tmSigWrite;
      const altSw = (sw === usableTmSigWrite && (tmCustomWrite || sigCtrlWrite))
        ? (tmCustomWrite || sigCtrlWrite)
        : (usableTmSigWrite && sw !== usableTmSigWrite ? usableTmSigWrite : null);
      const isTm = /timemore|black\s*mirror|^tm\b/i.test(name) || !!svcMap[UUID.TIMEMORE_CUSTOM_SVC] || hasExplicitWrite(tmSigWrite);
      if (sn){
        return {
          family: isTm ? 'timemore' : 'sig',
          variant: isTm ? 'classic_float32' : '',
          slot: 'scale',
          serviceUuid: UUID.WEIGHT_SIG_SVC,
          notifyUuid: sn.uuid,
          writeUuid: sw ? sw.uuid : null,
          altWriteUuid: altSw ? altSw.uuid : null,
          writeServiceUuid: (svcMap[UUID.TIMEMORE_CUSTOM_SVC] && sw && sw.uuid === UUID.TIMEMORE_CUSTOM_WRITE) ? UUID.TIMEMORE_CUSTOM_SVC : UUID.WEIGHT_SIG_SVC,
          autoPromoteOnFirstFrame: true
        };
      }
    }
    if (slot === 'scale'){
      const svKeys = Object.keys(svcMap);
      for (let ki = 0; ki < svKeys.length; ki++){
        const sk = svKeys[ki];
        if (/^0000180[01af]-/.test(sk)) continue;
        const pickedGen = pickNotifyAndWrite(svcMap[sk], [], []);
        if (pickedGen.notify && canNotify(pickedGen.notify)){
          return {
            family: 'sig',
            slot: 'scale',
            serviceUuid: sk,
            notifyUuid: pickedGen.notify.uuid,
            extraNotifyUuids: pickedGen.extraNotifyUuids,
            writeUuid: pickedGen.write ? pickedGen.write.uuid : null,
            altWriteUuid: pickedGen.altWrite ? pickedGen.altWrite.uuid : null,
            autoPromoteOnFirstFrame: true
          };
        }
      }
    }
    return null;
  }

  /**
   * Unified Per-Characteristic 256-Byte MTU Fragmentation & Magic-Byte Stream Processor
   */
  function createCharacteristicStream(initialFamily, context){
    let family = String(initialFamily || 'auto').toLowerCase();
    const ctx = Object.assign({}, context || {});
    const rawRing = createMtuRingBuffer(MAX_RING_BYTES);
    const acaiaStream = createAcaiaStreamParser();
    const difluidMode = (family === 'difluid_r2' || ctx.slot === 'refractometer')
      ? 'r2'
      : ((family === 'difluid_omni' || ctx.slot === 'omni')
        ? 'omni'
        : ((family === 'difluid' || family === 'difluid_scale') ? 'scale' : 'auto'));
    const difluidStream = createDiFluidStreamParser(difluidMode);
    const timemoreOspStream = createTimemoreOspStreamParser();
    const variaStream = createVariaStreamParser();
    const bookooStream = createBookooStreamParser();
    const asciiStream = createAsciiStreamParser();
    let promoted = false;

    function decodeSingleByFamily(fam, u8){
      if (fam === 'acaia') return acaiaStream.push(u8);
      if (fam === 'difluid' || fam === 'difluid_scale'){
        const dfs = difluidStream.push(u8);
        if (dfs.length) return dfs;
        const ds = decodeDiFluidScale(u8);
        return ds ? [ds] : [];
      }
      if (fam === 'difluid_r2'){
        const dfr = difluidStream.push(u8);
        if (dfr.length) return dfr;
        const dr = decodeDiFluidR2(u8);
        return dr ? [dr] : [];
      }
      if (fam === 'difluid_omni'){
        const dfo = difluidStream.push(u8);
        if (dfo.length) return dfo;
        const dm = decodeDiFluidOmni(u8);
        return dm ? [dm] : [];
      }
      if (fam === 'bookoo'){
        const bks = bookooStream.push(u8);
        if (bks.length) return bks;
        const bk = decodeBookoo(u8);
        return bk ? [bk] : [];
      }
      if (fam === 'timemore'){
        if ((u8.length >= 2 && u8[0] === 0xA5 && u8[1] === 0x5A) || timemoreOspStream.length() > 0){
          return timemoreOspStream.push(u8);
        }
        const tm = decodeTimemore(u8);
        if (tm) return [tm];
        /* Prevent u8.length >= 8 Timemore or other non-SIG multi-chunk headers on 0xFFF0/NUS from falling through to decodeWeightSig */
        const svcNormTm = normUuid(ctx.serviceUuid);
        const canSigFallback = (!svcNormTm || svcNormTm === UUID.WEIGHT_SIG_SVC) &&
          u8.length < 8 &&
          u8[0] !== 0x03 && u8[0] !== 0xEF && u8[0] !== 0xDF && u8[0] !== 0xA5 &&
          u8[0] !== 0xAA && u8[0] !== 0xFA && u8[0] !== 0xFB && u8[0] !== 0x55 &&
          u8[0] !== 0x58 && !(u8[0] === 0x01 && u8[1] === 0x02) &&
          !isPrintableAsciiScaleBytes(u8);
        if (canSigFallback){
          const sigFallback = decodeWeightSig(u8);
          return sigFallback ? [sigFallback] : [];
        }
        return [];
      }
      if (fam === 'varia'){
        const vs = variaStream.push(u8);
        if (vs.length) return vs;
        const dv = decodeVaria(u8);
        return dv ? [dv] : [];
      }
      if (fam === 'felicita'){
        const df = decodeFelicita(u8);
        return df ? [df] : [];
      }
      if (fam === 'decent'){
        const dd = decodeDecent(u8, { strictXor:false });
        return dd ? [dd] : [];
      }
      if (fam === 'skale'){
        if (normUuid(ctx.charUuid) === UUID.SKALE_BTN_NOTIFY){
          const sb = decodeSkaleButton(u8);
          return sb ? [sb] : [];
        }
        const sk = decodeSkale(u8);
        return sk ? [sk] : [];
      }
      if (fam === 'eureka'){
        const eu = decodeEureka(u8);
        return eu ? [eu] : [];
      }
      if (fam === 'hiroia'){
        const hi = decodeHiroia(u8);
        return hi ? [hi] : [];
      }
      if (fam === 'sig'){
        if (u8.length >= 8 && (u8[0] & 0x02) === 0){
          const tmAuto = decodeTimemore(u8);
          if (tmAuto){
            family = 'timemore';
            promoted = true;
            return [tmAuto];
          }
        }
        const ws = decodeWeightSig(u8);
        return ws ? [ws] : [];
      }
      if (fam === 'pressensor'){
        const pr = decodePressensor(u8, ctx);
        return pr ? [pr] : [];
      }
      if (fam === 'bookoo_pressure'){
        const bp = decodeBookooPressure(u8);
        return bp ? [bp] : [];
      }
      if (fam === 'xbloom'){
        const xb = decodeXBloom(u8);
        return xb ? [xb] : [];
      }
      if (fam === 'stagg_ekg_plus'){
        const st = decodeStaggKettle(u8);
        return st ? [st] : [];
      }
      if (fam === 'ascii'){
        return asciiStream.push(u8);
      }
      return [];
    }

    return {
      getFamily: function(){ return family; },
      wasPromoted: function(){ return promoted; },
      ringLength: function(){ return rawRing.length(); },
      reset: function(){
        rawRing.clear();
        acaiaStream.reset();
        difluidStream.reset();
        timemoreOspStream.reset();
        variaStream.reset();
        bookooStream.reset();
        asciiStream.reset();
      },
      push: function(chunk){
        const u8 = toU8(chunk);
        if (!u8.length) return { family:family, promoted:false, frames:[] };

        /* Allow magic-byte auto-promotion across all shared GATT services (0xFFF0, 0xFFE0, 0xFFB0, 0x181D, 0x1820, NUS, auto) */
        const svcNorm = normUuid(ctx.serviceUuid);
        const canAutoPromote = (
          family === 'auto' ||
          ctx.autoPromote !== false && (
            svcNorm === UUID.SHARED_FFF0_SVC ||
            svcNorm === UUID.FELICITA_SVC ||
            svcNorm === UUID.EUREKA_ALT_SVC ||
            svcNorm === UUID.WEIGHT_SIG_SVC ||
            svcNorm === UUID.ACAIA_LEGACY_SVC ||
            svcNorm === UUID.NUS_SVC ||
            !ctx.serviceUuid
          )
        );

        if (canAutoPromote){
          rawRing.append(u8);
          const candidate = detectProtocolFromBytes(rawRing.peek(), ctx);
          if (candidate && candidate !== family){
            const prev = family;
            family = candidate;
            promoted = true;
            const buffered = rawRing.peek().slice();
            rawRing.clear();
            const promotedFrames = decodeSingleByFamily(family, buffered);
            return { family:family, promoted:true, promotedFrom:prev, frames:promotedFrames };
          }
        }

        const frames = decodeSingleByFamily(family, u8);
        if (canAutoPromote && frames.length > 0){
          rawRing.clear();
        }
        return { family:family, promoted:false, frames:frames };
      }
    };
  }

  /* ============================================================================
   * 15-FAMILY HARDWARE CATALOG & HONEST NON-GATT CAPABILITY DISCLOSURES
   * ============================================================================ */
  const DEVICE_CATALOG = [
    { id:'acaia',           slot:'scale',         name:'Acaia Lunar / Pearl / Pearl S / Pyxis', tier:'verified_gatt', protocol:'0x1820 / Pyxis 0xEF 0xDD' },
    { id:'difluid',         slot:'scale',         name:'DiFluid Microbalance & Microbalance Ti', tier:'verified_gatt', protocol:'0x00EE / 0xDF 0xDF sum8' },
    { id:'bookoo',          slot:'scale',         name:'Bookoo Themis Mini & Themis Ultra',     tier:'verified_gatt', protocol:'0x0FFE 20B XOR' },
    { id:'timemore',        slot:'scale',         name:'Timemore Black Mirror Classic / Basic 2 OSP / Compact', tier:'verified_gatt', protocol:'0x181D Float32 / 0xFFF0 CRC16' },
    { id:'felicita',        slot:'scale',         name:'Felicita Arc / Incline / Parallel',     tier:'verified_gatt', protocol:'0xFFE0 18B ASCII' },
    { id:'decent',          slot:'scale',         name:'Decent Scale & Open-Scale',             tier:'verified_gatt', protocol:'0xFFF0 7B/10B XOR' },
    { id:'varia',           slot:'scale',         name:'Varia AKU / AKU Pro / Mini',            tier:'verified_gatt', protocol:'0xFFF0 0xFA/0x55 XOR' },
    { id:'skale',           slot:'scale',         name:'Atomax Skale II',                       tier:'verified_gatt', protocol:'0xFF08 24-bit LE' },
    { id:'eureka',          slot:'scale',         name:'Eureka Precisa / CFS-9002 / KC200 / WeighMyBru', tier:'verified_gatt', protocol:'0xFFF0 0xAA 0x09 0x41' },
    { id:'hiroia',          slot:'scale',         name:'Hiroia Jimmy',                          tier:'verified_gatt', protocol:'Hiroia 24-bit LE' },
    { id:'sig',             slot:'scale',         name:'Bluetooth SIG 0x181D Weight Scale',     tier:'verified_gatt', protocol:'GATT 0x181D / 0x2A9D' },
    { id:'pressensor',      slot:'pressure',      name:'Pressensor / Smart Espresso Profiler',  tier:'verified_gatt', protocol:'0x185B / SEP mbar -> bar' },
    { id:'bookoo_pressure', slot:'pressure',      name:'Bookoo Espresso Monitor (EM)',          tier:'verified_gatt', protocol:'0x0FFF / 0x0FFE bar + XOR' },
    { id:'difluid_r2',      slot:'refractometer', name:'DiFluid R2 Extract Refractometer',      tier:'verified_gatt', protocol:'0x00FF %TDS / nD20 / tempC' },
    { id:'difluid_omni',    slot:'omni',          name:'DiFluid Omni Roast & PSD Analyzer',     tier:'verified_gatt', protocol:'0x00FC Agtron + D10/50/90 + Bins' },
    { id:'xbloom',          slot:'machine',       name:'xBloom Studio & Original',              tier:'experimental_ble', protocol:'0xFFE0 0x58 0x42 CRC16 (0x41/0x44 Gate)' },
    { id:'stagg_ekg_plus',  slot:'machine',       name:'Fellow Stagg EKG+ (Classic BLE)',       tier:'experimental_ble', protocol:'0x1820 Live Temp & Hold' }
  ];

  const NON_GATT_DISCLOSURES = {
    fellow_tally_pro: {
      id: 'fellow_tally_pro',
      name: 'Fellow Tally Pro Studio Scale',
      bleSupported: false,
      radio: 'none',
      badge: '[No Bluetooth Radio in Hardware]',
      summary: 'Fellow Tally Pro contains no Bluetooth or Wi-Fi radio (local OLED + mechanical dial only). Use Brew Studio Ratio Mirror to match Tally Brew Assist on your counter.'
    },
    fellow_stagg_ekg_pro: {
      id: 'fellow_stagg_ekg_pro',
      name: 'Fellow Stagg EKG Pro / Pro Studio',
      bleSupported: false,
      radio: 'wifi-cli-only',
      badge: '[Closed BLE / Wi-Fi Provisioning Only]',
      summary: 'Fellow Stagg EKG Pro uses BLE solely for Wi-Fi/OTA setup; open real-time GATT temperature streaming is supported on Classic Stagg EKG+. Set your PID dial directly to the altitude-compensated target in Brew Studio.'
    },
    fellow_aiden: {
      id: 'fellow_aiden',
      name: 'Fellow Aiden Precision Brewer',
      bleSupported: false,
      radio: 'cloud-wifi',
      badge: '[Closed Cloud API / Guided Staircase + Local JSON]',
      summary: 'Fellow Aiden syncs profiles through authenticated Fellow cloud (brew.link). Use BeanTelligence 1:1 Guided Pulse-Temp Staircase and local .aiden.json profile export/import.'
    }
  };

  const decoders = {
    decodeAcaia: decodeAcaia,
    decodeAcaiaFrame: decodeAcaiaFrame,
    createAcaiaStreamParser: createAcaiaStreamParser,
    decodeDiFluidScale: decodeDiFluidScale,
    decodeMicrobalance: decodeDiFluidScale,
    decodeBookoo: decodeBookoo,
    decodeTimemore: decodeTimemore,
    decodeFelicita: decodeFelicita,
    decodeDecent: decodeDecent,
    decodeVaria: decodeVaria,
    decodeSkale: decodeSkale,
    decodeSkaleButton: decodeSkaleButton,
    decodeEureka: decodeEureka,
    decodeHiroia: decodeHiroia,
    decodeWeightSig: decodeWeightSig,
    decodePressensor: decodePressensor,
    decodeBookooPressure: decodeBookooPressure,
    decodeDiFluidR2: decodeDiFluidR2,
    decodeDiFluid: decodeDiFluidR2,
    decodeDiFluidOmni: decodeDiFluidOmni,
    decodeXBloom: decodeXBloom,
    decodeStaggKettle: decodeStaggKettle,
    decodeAsciiScale: decodeAsciiScale,
    agtronToRoastSwatch: agtronToRoastSwatch
  };

  const streams = {
    MAX_RING_BYTES: MAX_RING_BYTES,
    createMtuRingBuffer: createMtuRingBuffer,
    createAcaiaStreamParser: createAcaiaStreamParser,
    createDiFluidStreamParser: createDiFluidStreamParser,
    createTimemoreOspStreamParser: createTimemoreOspStreamParser,
    createVariaStreamParser: createVariaStreamParser,
    createBookooStreamParser: createBookooStreamParser,
    createAsciiStreamParser: createAsciiStreamParser,
    createCharacteristicStream: createCharacteristicStream
  };

  const checksums = {
    xorChecksum: xorChecksum,
    sum8Checksum: sum8Checksum,
    lrc8TwosComplement: lrc8TwosComplement,
    acaiaChecksum: acaiaChecksum,
    encodeAcaia: encodeAcaia,
    crc16Modbus: crc16Modbus,
    crc16Kermit: crc16Kermit
  };

  global.BTBleCodecs = {
    UUID: UUID,
    ALL_COFFEE_OPTIONAL_SERVICES: ALL_COFFEE_OPTIONAL_SERVICES,
    normUuid: normUuid,
    toU8: toU8,
    hexToBytes: hexToBytes,
    bytesToHex: bytesToHex,
    checksums: checksums,
    commands: commands,
    decoders: decoders,
    decodeDiFluidR2: decodeDiFluidR2,
    streams: streams,
    detectProtocolFromBytes: detectProtocolFromBytes,
    detectGattProfile: detectGattProfile,
    agtronToRoastSwatch: agtronToRoastSwatch,
    DEVICE_CATALOG: DEVICE_CATALOG,
    NON_GATT_DISCLOSURES: NON_GATT_DISCLOSURES
  };
})(typeof window !== 'undefined' ? window : globalThis);
/* ============================================================================
 * BeanTelligence v6.0 — 5-Slot BLE Session, Transports & DiFluid Ecosystem
 * Exports: window.BTBleTransport, window.BTBle, window.BTDiFluidApi
 * ============================================================================ */
(function(global){
  'use strict';

  const Codecs = global.BTBleCodecs;
  const UUID = Codecs.UUID;
  const normUuid = Codecs.normUuid;
  const toU8 = Codecs.toU8;
  const bytesToHex = Codecs.bytesToHex;
  const hexToBytes = Codecs.hexToBytes;

  const ALL_COFFEE_OPTIONAL_SERVICES = (Array.isArray(Codecs.ALL_COFFEE_OPTIONAL_SERVICES) && Codecs.ALL_COFFEE_OPTIONAL_SERVICES.length)
    ? Codecs.ALL_COFFEE_OPTIONAL_SERVICES.slice()
    : [
        UUID.WEIGHT_SIG_SVC, UUID.ACAIA_LEGACY_SVC, UUID.ACAIA_PYXIS_SVC,
        UUID.DIFLUID_SCALE_SVC, UUID.DIFLUID_SCALE_ALT_SVC, UUID.DIFLUID_SVC,
        UUID.DIFLUID_OMNI_SVC, UUID.DIFLUID_V3_SVC, UUID.BOOKOO_SVC,
        UUID.BOOKOO_EM_SVC, UUID.ESS_SVC, UUID.PRESSENSOR_SIG_SVC,
        UUID.SHARED_FFF0_SVC, UUID.FELICITA_SVC, UUID.SKALE_SVC,
        UUID.EUREKA_ALT_SVC, UUID.HIROIA_SVC, UUID.TIMEMORE_CUSTOM_SVC,
        UUID.PRESSENSOR_SVC, UUID.XBLOOM_SVC, UUID.NUS_SVC,
        UUID.BATTERY_SVC, UUID.DEVICE_INFO_SVC
      ].filter(Boolean);

  function mergeOptionalServices(extra){
    const out = [];
    const seen = Object.create(null);
    const pushList = function(arr){
      if (!Array.isArray(arr)) return;
      for (let i = 0; i < arr.length; i++){
        if (!arr[i]) continue;
        const u = normUuid(arr[i]);
        if (u && !seen[u]){
          seen[u] = true;
          out.push(u);
        }
      }
    };
    pushList(extra);
    pushList(ALL_COFFEE_OPTIONAL_SERVICES);
    return out;
  }

  function dedupeDeviceFilters(rawFilters){
    if (!Array.isArray(rawFilters) || !rawFilters.length) return [];
    const out = [];
    const seen = Object.create(null);
    for (let i = 0; i < rawFilters.length; i++){
      const f = rawFilters[i];
      if (!f || typeof f !== 'object') continue;
      if (typeof f.namePrefix === 'string' && f.namePrefix.length > 0 && !f.services){
        const k = 'np:' + f.namePrefix;
        if (!seen[k]){
          seen[k] = true;
          out.push({ namePrefix:f.namePrefix });
        }
      } else if (Array.isArray(f.services) && f.services.length > 0 && !f.namePrefix){
        const svcs = f.services.filter(Boolean).map(normUuid);
        if (!svcs.length) continue;
        const sk = 'svc:' + svcs.join(',');
        if (!seen[sk]){
          seen[sk] = true;
          out.push({ services:svcs });
        }
      } else {
        const gk = JSON.stringify(f);
        if (!seen[gk]){
          seen[gk] = true;
          out.push(f);
        }
      }
    }
    return out;
  }

  function perfNow(){
    return (typeof performance !== 'undefined' && typeof performance.now === 'function')
      ? performance.now()
      : Date.now();
  }

  function cleanZero(n){
    return Object.is(n, -0) ? 0 : n;
  }

  function waitMs(ms){
    return new Promise(function(resolve){ setTimeout(resolve, Math.max(0, +ms || 0)); });
  }

  function withTimeout(promiseOrVal, timeoutMs, label){
    const ms = timeoutMs == null ? 4500 : Math.max(100, +timeoutMs);
    let timerId = null;
    return Promise.race([
      Promise.resolve(promiseOrVal),
      new Promise(function(_, reject){
        timerId = setTimeout(function(){
          reject(new Error((label || 'GATT operation') + ' timed out after ' + ms + 'ms'));
        }, ms);
      })
    ]).then(function(res){
      if (timerId) clearTimeout(timerId);
      return res;
    }, function(err){
      if (timerId) clearTimeout(timerId);
      throw err;
    });
  }

  /* ============================================================================
   * 1. SERIALIZED GATT WRITE / IO MUTEX (`BTWriteQueue`, 40ms spacing, 4500ms timeout)
   * ============================================================================ */
  function createWriteQueue(spacingMs, timeoutMs){
    const gap = spacingMs == null ? 40 : Math.max(0, +spacingMs);
    const tmo = timeoutMs == null ? 4500 : Math.max(100, +timeoutMs);
    const queue = [];
    let active = false;
    let maxConcurrent = 0;
    let inFlight = 0;
    let lastCompletedAt = -1000;

    async function drain(){
      if (active) return;
      active = true;
      while (queue.length > 0){
        const item = queue.shift();
        const itemTmo = item.timeoutMs == null ? tmo : Math.max(100, +item.timeoutMs);
        const elapsedSinceLast = perfNow() - lastCompletedAt;
        if (lastCompletedAt > 0 && elapsedSinceLast < gap){
          await waitMs(Math.ceil(gap - elapsedSinceLast));
        }
        inFlight++;
        if (inFlight > maxConcurrent) maxConcurrent = inFlight;
        let timerId = null;
        try {
          const result = await Promise.race([
            Promise.resolve().then(item.fn),
            new Promise(function(_, reject){
              timerId = setTimeout(function(){
                reject(new Error('BTWriteQueue GATT operation timed out after ' + itemTmo + 'ms'));
              }, itemTmo);
            })
          ]);
          if (timerId) clearTimeout(timerId);
          inFlight--;
          lastCompletedAt = perfNow();
          item.resolve(result);
        } catch(err){
          if (timerId) clearTimeout(timerId);
          inFlight--;
          lastCompletedAt = perfNow();
          item.reject(err);
        }
      }
      active = false;
    }

    return {
      spacingMs: gap,
      timeoutMs: tmo,
      pendingCount: function(){ return queue.length + inFlight; },
      isBusy: function(){ return active || inFlight > 0; },
      maxConcurrentObserved: function(){ return maxConcurrent; },
      clear: function(){
        while (queue.length > 0){
          const dropped = queue.shift();
          dropped.reject(new Error('BTWriteQueue cleared'));
        }
      },
      enqueue: function(fn, opTimeoutMs){
        return new Promise(function(resolve, reject){
          queue.push({ fn:fn, timeoutMs:opTimeoutMs, resolve:resolve, reject:reject });
          drain();
        });
      }
    };
  }

  /* ============================================================================
   * 2. UNIFIED DUAL-TRANSPORT ADAPTERS (`window.BTBleTransport`)
   *    - WebBluetoothTransport (Active NOW on Chrome/Edge/Android/Bluefy)
   *    - CapacitorNativeBleTransport (Drop-in iOS CoreBluetooth & Android API 35)
   *    - SimulatorBleTransport (10Hz Virtual 5-Slot Hardware Bench)
   * ============================================================================ */
  function buildBluefyUrl(rawHref){
    const href = String(rawHref || (typeof location !== 'undefined' && location.href) || 'https://mshaffe1111.github.io/Neurobrew/');
    return 'bluefy://open?url=' + encodeURIComponent(href);
  }

  function createWebBluetoothTransport(){
    function getCapabilities(){
      const ua = (typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent : '';
      const isBluefy = /Bluefy/i.test(ua);
      const isIOS = /iPhone|iPod|iPad/i.test(ua) || (typeof navigator !== 'undefined' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isSafari = /^((?!chrome|android|crios|fxios|edgios|opr|bluefy).)*safari/i.test(ua);
      const secureContext = !!(typeof global !== 'undefined' && global.isSecureContext !== false);
      const hasWebBluetooth = !!(typeof navigator !== 'undefined' && navigator.bluetooth && typeof navigator.bluetooth.requestDevice === 'function');
      const canSilentReconnect = !!(hasWebBluetooth && typeof navigator.bluetooth.getDevices === 'function');
      const supported = !!(hasWebBluetooth && secureContext);
      const iosBluefyDeepLink = (isIOS && !isBluefy) ? buildBluefyUrl() : null;

      let platformLabel = 'Web Bluetooth Ready';
      let guidance = 'Direct zero-key BLE GATT ready across all 15 supported coffee hardware families and 5 concurrent slots.';
      if (supported && isBluefy){
        platformLabel = 'Bluefy iOS Web Bluetooth Ready';
      } else if (isIOS && !isBluefy){
        platformLabel = 'iOS / iPadOS Safari - Open in Bluefy or Run 10Hz Simulator';
        guidance = 'Apple WebKit omits navigator.bluetooth in iOS Safari. Tap Open in Bluefy on iPhone/iPad for live hardware BLE, or run the 10Hz 5-Slot Physics Simulator right here.';
      } else if (hasWebBluetooth && !secureContext){
        platformLabel = 'HTTPS or Localhost Required for WebBLE';
        guidance = 'Web Bluetooth requires a secure context (https:// or http://localhost:8145). Run the 10Hz Simulator or open over HTTPS.';
      } else if (!hasWebBluetooth){
        platformLabel = 'Web Bluetooth Unavailable - Use Chrome, Edge, or Simulator';
        guidance = (isSafari ? 'macOS Safari' : 'This browser') + ' does not expose navigator.bluetooth. Open in Chrome, Edge, Brave, Opera, or Android Chrome for live BLE hardware, or use the 1-tap 10Hz Simulator.';
      }

      return {
        kind: 'web-bluetooth',
        supported: supported,
        secureContext: secureContext,
        hasWebBluetooth: hasWebBluetooth,
        canSilentReconnect: canSilentReconnect,
        canLiveRssiScan: false,
        isIOS: isIOS,
        isSafari: isSafari,
        isBluefy: isBluefy,
        iosBluefyDeepLink: iosBluefyDeepLink,
        epistemicTier: 'verified_science',
        platformLabel: platformLabel,
        guidance: guidance
      };
    }

    const FALLBACK_CHARS_BY_SVC = (function(){
      const m = Object.create(null);
      m[UUID.ACAIA_LEGACY_SVC] = [UUID.ACAIA_LEGACY_CHAR, UUID.STAGG_EKG_ALT_CHAR];
      m[UUID.ACAIA_PYXIS_SVC] = [UUID.ACAIA_PYXIS_NOTIFY, UUID.ACAIA_PYXIS_WRITE];
      m[UUID.DIFLUID_SCALE_SVC] = [UUID.DIFLUID_CHAR, UUID.DIFLUID_WRITE_ALT];
      m[UUID.DIFLUID_SCALE_ALT_SVC] = [UUID.DIFLUID_CHAR, UUID.DIFLUID_WRITE_ALT];
      m[UUID.DIFLUID_SVC] = [UUID.DIFLUID_CHAR, UUID.DIFLUID_WRITE_ALT];
      m[UUID.DIFLUID_OMNI_SVC] = [UUID.DIFLUID_CHAR, UUID.DIFLUID_WRITE_ALT];
      m[UUID.DIFLUID_V3_SVC] = [UUID.DIFLUID_V3_NOTIFY, UUID.DIFLUID_V3_WRITE];
      m[UUID.BOOKOO_SVC] = [UUID.BOOKOO_NOTIFY, UUID.BOOKOO_WRITE];
      m[UUID.BOOKOO_EM_SVC] = [UUID.BOOKOO_EM_NOTIFY, UUID.BOOKOO_EM_WRITE];
      m[UUID.ESS_SVC] = [UUID.PRESSENSOR_SIG_CHAR, UUID.ESS_TEMP_CHAR];
      m[UUID.PRESSENSOR_SIG_SVC] = [UUID.PRESSENSOR_SIG_CHAR, UUID.ESS_TEMP_CHAR];
      m[UUID.PRESSENSOR_SVC] = [UUID.PRESSENSOR_NOTIFY, UUID.PRESSENSOR_WRITE];
      m[UUID.SHARED_FFF0_SVC] = [UUID.DECENT_NOTIFY, UUID.DECENT_WRITE, UUID.FFF1_NOTIFY, UUID.FFF2_WRITE];
      m[UUID.FELICITA_SVC] = [UUID.FELICITA_CHAR, UUID.XBLOOM_SHORT_WRITE, UUID.XBLOOM_SHORT_NOTIFY];
      m[UUID.SKALE_SVC] = [UUID.SKALE_NOTIFY, UUID.SKALE_WRITE, UUID.SKALE_BTN_NOTIFY];
      m[UUID.EUREKA_ALT_SVC] = [UUID.EUREKA_ALT_CHAR];
      m[UUID.HIROIA_SVC] = [UUID.HIROIA_NOTIFY, UUID.HIROIA_WRITE];
      m[UUID.WEIGHT_SIG_SVC] = [UUID.WEIGHT_SIG_NOTIFY, UUID.TIMEMORE_SIG_WRITE, UUID.WEIGHT_SIG_CTRL];
      m[UUID.TIMEMORE_CUSTOM_SVC] = [UUID.TIMEMORE_CUSTOM_WRITE];
      m[UUID.XBLOOM_SVC] = [UUID.XBLOOM_WRITE, UUID.XBLOOM_NOTIFY, UUID.XBLOOM_AUX];
      m[UUID.NUS_SVC] = [UUID.NUS_NOTIFY, UUID.NUS_WRITE];
      m[UUID.BATTERY_SVC] = [UUID.BATTERY_LEVEL];
      return m;
    })();

    async function requestDevice(query){
      const cap = getCapabilities();
      if (!cap.supported){
        throw new Error(cap.platformLabel + ' — ' + cap.guidance);
      }
      const q = query || {};
      const opts = {};
      if (!q.acceptAll && !q.acceptAllDevices && Array.isArray(q.filters) && q.filters.length){
        opts.filters = dedupeDeviceFilters(q.filters);
      } else {
        opts.acceptAllDevices = true;
      }
      opts.optionalServices = mergeOptionalServices(q.optionalServices);

      let rawDev = null;
      try {
        rawDev = await navigator.bluetooth.requestDevice(opts);
      } catch(err){
        const errName = (err && err.name) || '';
        const errMsg = (err && err.message) || String(err || '');
        const isFilterReject = errName === 'TypeError' || errName === 'NotSupportedError' || errName === 'InvalidAccessError' ||
          /filter|optionalServices|must not be empty|acceptAllDevices/i.test(errMsg);
        if (isFilterReject && opts.filters && q.allowFallbackToAcceptAll !== false){
          try {
            rawDev = await navigator.bluetooth.requestDevice({
              acceptAllDevices: true,
              optionalServices: opts.optionalServices
            });
          } catch(err2){
            const err2Msg = (err2 && err2.message) || String(err2 || '');
            if (/optionalServices|uuid/i.test(err2Msg)){
              rawDev = await navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: Array.isArray(q.optionalServices) ? q.optionalServices : ALL_COFFEE_OPTIONAL_SERVICES.slice(0, 12)
              });
            } else {
              throw err2;
            }
          }
        } else if (errName === 'NotFoundError' || errName === 'AbortError'){
          throw new Error('No Bluetooth device selected. Make sure the device is awake, OS Bluetooth is on, and its native app is closed (or use Scan All Devices).');
        } else if (errName === 'SecurityError'){
          throw new Error('Bluetooth permission blocked. Open over HTTPS or localhost:8145 and allow Bluetooth access in your browser.');
        } else {
          throw err;
        }
      }

      return {
        deviceId: String(rawDev.id || rawDev.name || ('webble-' + Date.now())),
        name: String(rawDev.name || ''),
        rawDevice: rawDev
      };
    }

    async function getKnownDevices(){
      if (typeof navigator === 'undefined' || !navigator.bluetooth || typeof navigator.bluetooth.getDevices !== 'function'){
        return [];
      }
      try {
        const known = await navigator.bluetooth.getDevices();
        return Array.isArray(known) ? known : [];
      } catch(e){
        return [];
      }
    }

    async function reconnectKnownDevice(saved){
      if (!saved) return null;
      try {
        const known = await getKnownDevices();
        if (!known.length) return null;
        let match = null;
        const savedNameLow = saved.name ? String(saved.name).trim().toLowerCase() : '';
        for (let i = 0; i < known.length; i++){
          const d = known[i];
          if (saved.deviceId && d.id === saved.deviceId){ match = d; break; }
          if (!match && savedNameLow && d.name && String(d.name).trim().toLowerCase() === savedNameLow){ match = d; }
        }
        if (!match) return null;

        if (typeof match.watchAdvertisements === 'function' && typeof AbortController === 'function'){
          const ac = new AbortController();
          let advTimer = null;
          let settleAdv = null;
          const advPromise = new Promise(function(resolve){
            settleAdv = function(found){
              if (advTimer){ clearTimeout(advTimer); advTimer = null; }
              try { match.removeEventListener('advertisementreceived', onAdv); } catch(e){}
              try { ac.abort(); } catch(e){}
              resolve(found);
            };
            const onAdv = function(){
              settleAdv(true);
            };
            try { match.addEventListener('advertisementreceived', onAdv, { once:true }); } catch(e){}
            advTimer = setTimeout(function(){
              settleAdv(false);
            }, 1800);
          });
          let watchStarted = true;
          try {
            await match.watchAdvertisements({ signal:ac.signal });
          } catch(e){
            watchStarted = false;
            if (settleAdv) settleAdv(false);
          }
          if (watchStarted) await advPromise;
        }

        return {
          deviceId: String(match.id || saved.deviceId || ''),
          name: String(match.name || saved.name || ''),
          rawDevice: match
        };
      } catch(e){
        return null;
      }
    }

    async function connectGatt(transportDevice, onDisconnect){
      const raw = transportDevice && transportDevice.rawDevice;
      if (!raw || !raw.gatt || typeof raw.gatt.connect !== 'function'){
        throw new Error('Invalid Web Bluetooth device handle');
      }
      const writeQueue = createWriteQueue(40, 4500);
      const svcCache = {};
      const charCache = {};
      const activeNotifyCleanups = [];

      const discListener = function(){
        writeQueue.clear();
        if (typeof onDisconnect === 'function'){
          try { onDisconnect(transportDevice.deviceId); } catch(e){}
        }
      };
      let listenerAttached = false;
      if (typeof raw.addEventListener === 'function'){
        raw.addEventListener('gattserverdisconnected', discListener);
        listenerAttached = true;
      }

      let server = null;
      try {
        server = await withTimeout(raw.gatt.connect(), 6000, 'GATT connect');
      } catch(connErr){
        try {
          await waitMs(180);
          server = await withTimeout(raw.gatt.connect(), 6000, 'GATT connect retry');
        } catch(retryErr){
          if (listenerAttached && typeof raw.removeEventListener === 'function'){
            try { raw.removeEventListener('gattserverdisconnected', discListener); } catch(e){}
          }
          throw retryErr;
        }
      }

      async function ensureConnected(){
        if (raw.gatt && raw.gatt.connected === false){
          server = await withTimeout(raw.gatt.connect(), 6000, 'GATT reconnect');
        }
        return server;
      }

      async function listServicesCompat(candidateUuids){
        await ensureConnected();
        const svcs = [];
        const seenSvcs = Object.create(null);
        const addSvc = function(s){
          if (!s || !s.uuid) return;
          const su = normUuid(s.uuid);
          if (!seenSvcs[su]){
            seenSvcs[su] = s;
            svcs.push(s);
          }
        };

        if (typeof server.getPrimaryServices === 'function'){
          try {
            const all = await withTimeout(server.getPrimaryServices(), 4500, 'getPrimaryServices');
            if (Array.isArray(all)){
              for (let ai = 0; ai < all.length; ai++) addSvc(all[ai]);
            }
          } catch(e){}
        }

        const mergedCandidates = mergeOptionalServices(candidateUuids);
        const hasCoffeeSvc = svcs.some(function(s){
          const su = normUuid(s.uuid);
          return !/^0000180[01af]-/.test(su);
        });

        /* Probe candidate coffee UUIDs individually if getPrimaryServices() threw OR returned incomplete results (e.g. only 0x1800/0x180F on Bluefy) */
        if ((!svcs.length || !hasCoffeeSvc) && typeof server.getPrimaryService === 'function'){
          for (let i = 0; i < mergedCandidates.length; i++){
            const cu = mergedCandidates[i];
            if (seenSvcs[cu] || /^0000180[01]-/.test(cu)) continue;
            try {
              const s = await withTimeout(server.getPrimaryService(cu), 4500, 'getPrimaryService(' + cu + ')');
              if (s) addSvc(s);
            } catch(e){}
          }
        }

        const normalized = [];
        for (let si = 0; si < svcs.length; si++){
          const svc = svcs[si];
          const su = normUuid(svc.uuid);
          svcCache[su] = svc;
          let chars = [];
          if (typeof svc.getCharacteristics === 'function'){
            try {
              const cl = await withTimeout(svc.getCharacteristics(), 4500, 'getCharacteristics(' + su + ')');
              if (Array.isArray(cl)) chars = cl;
            } catch(e){}
          }
          if (!chars.length && typeof svc.getCharacteristic === 'function' && Array.isArray(FALLBACK_CHARS_BY_SVC[su])){
            const fbChars = FALLBACK_CHARS_BY_SVC[su];
            for (let fci = 0; fci < fbChars.length; fci++){
              try {
                const fc = await withTimeout(svc.getCharacteristic(fbChars[fci]), 4500, 'getCharacteristic(' + fbChars[fci] + ')');
                if (fc) chars.push(fc);
              } catch(e){}
            }
          }
          const normChars = [];
          for (let ci = 0; ci < chars.length; ci++){
            const ch = chars[ci];
            const cu = normUuid(ch.uuid);
            charCache[su + '|' + cu] = ch;
            const p = ch.properties || {};
            const hasExplicitProps = !!(ch.properties && (
              typeof p.notify === 'boolean' ||
              typeof p.indicate === 'boolean' ||
              typeof p.write === 'boolean' ||
              typeof p.writeWithoutResponse === 'boolean'
            ));
            normChars.push({
              uuid: cu,
              properties: {
                read: hasExplicitProps ? !!p.read : (p.read !== false),
                write: hasExplicitProps ? (!!p.write || !!p.writeWithoutResponse) : (p.write !== false),
                writeWithoutResponse: !!p.writeWithoutResponse,
                notify: hasExplicitProps ? (!!p.notify || !!p.indicate) : (p.notify !== false),
                indicate: !!p.indicate
              }
            });
          }
          normalized.push({ uuid:su, characteristics:normChars });
        }
        return normalized;
      }

      async function resolveChar(serviceUuid, charUuid){
        await ensureConnected();
        const su = normUuid(serviceUuid);
        const cu = normUuid(charUuid);
        const key = su + '|' + cu;
        if (charCache[key]) return charCache[key];
        let svc = svcCache[su];
        if (!svc && typeof server.getPrimaryService === 'function'){
          svc = await withTimeout(server.getPrimaryService(su), 4500, 'getPrimaryService(' + su + ')');
          if (svc) svcCache[su] = svc;
        }
        if (!svc) throw new Error('GATT service not found: ' + su);
        const ch = await withTimeout(svc.getCharacteristic(cu), 4500, 'getCharacteristic(' + cu + ')');
        if (ch) charCache[key] = ch;
        return ch;
      }

      return {
        deviceId: transportDevice.deviceId,
        name: String(raw.name || transportDevice.name || ''),
        writeQueue: writeQueue,
        isConnected: function(){
          return !!(raw && raw.gatt && raw.gatt.connected !== false);
        },
        discoverServices: function(candidateUuids){
          const candCount = mergeOptionalServices(candidateUuids).length;
          return writeQueue.enqueue(function(){
            return listServicesCompat(candidateUuids || []);
          }, Math.max(4500, candCount * 1000));
        },
        startNotifications: function(serviceUuid, charUuid, onBytes){
          return writeQueue.enqueue(async function(){
            const ch = await resolveChar(serviceUuid, charUuid);
            const props = ch.properties || {};
            if (typeof props.notify === 'boolean' && typeof props.indicate === 'boolean' && !props.notify && !props.indicate){
              throw new Error('GATT characteristic does not support notify or indicate: ' + normUuid(charUuid));
            }
            const handler = function(ev){
              const val = (ev && ev.target && ev.target.value) || (ev && ev.value) || ch.value;
              if (typeof onBytes === 'function') onBytes(toU8(val));
            };
            if (typeof ch.addEventListener === 'function'){
              ch.addEventListener('characteristicvaluechanged', handler);
            } else {
              ch.oncharacteristicvaluechanged = handler;
            }
            if (typeof ch.startNotifications === 'function'){
              try {
                await ch.startNotifications();
              } catch(startErr){
                if (typeof ch.removeEventListener === 'function'){
                  try { ch.removeEventListener('characteristicvaluechanged', handler); } catch(_){}
                }
                throw startErr;
              }
            } else if (props.indicate && typeof ch.startIndications === 'function'){
              await ch.startIndications();
            }
            const stopFn = async function(){
              try {
                if (typeof ch.removeEventListener === 'function') ch.removeEventListener('characteristicvaluechanged', handler);
                if (typeof ch.stopNotifications === 'function') await ch.stopNotifications();
              } catch(e){}
            };
            activeNotifyCleanups.push(stopFn);
            return stopFn;
          });
        },
        read: function(serviceUuid, charUuid){
          return writeQueue.enqueue(async function(){
            const ch = await resolveChar(serviceUuid, charUuid);
            if (!ch || typeof ch.readValue !== 'function') return new Uint8Array(0);
            const dv = await ch.readValue();
            return toU8(dv);
          });
        },
        write: function(serviceUuid, charUuid, bytes, opts){
          const u8 = toU8(bytes);
          const preferNoResp = !!(opts && opts.withoutResponse);
          return writeQueue.enqueue(async function(){
            const ch = await resolveChar(serviceUuid, charUuid);
            if (!ch) return false;
            const props = ch.properties || {};
            const hasExplicit = (typeof props.write === 'boolean' || typeof props.writeWithoutResponse === 'boolean');
            const hasWrite = !!props.write;
            const hasNoResp = !!props.writeWithoutResponse;
            let methodOrder;
            if (hasExplicit){
              if (preferNoResp && hasNoResp){
                methodOrder = hasWrite
                  ? ['writeValueWithoutResponse', 'writeValueWithResponse', 'writeValue']
                  : ['writeValueWithoutResponse', 'writeValue'];
              } else if (hasNoResp && !hasWrite){
                methodOrder = ['writeValueWithoutResponse', 'writeValue'];
              } else if (hasWrite && !hasNoResp){
                methodOrder = ['writeValueWithResponse', 'writeValue'];
              } else {
                methodOrder = preferNoResp
                  ? ['writeValueWithoutResponse', 'writeValueWithResponse', 'writeValue']
                  : ['writeValueWithResponse', 'writeValueWithoutResponse', 'writeValue'];
              }
            } else {
              methodOrder = preferNoResp
                ? ['writeValueWithoutResponse', 'writeValueWithResponse', 'writeValue']
                : ['writeValueWithResponse', 'writeValueWithoutResponse', 'writeValue'];
            }
            let lastErr = null;
            let attempted = 0;
            for (let mi = 0; mi < methodOrder.length; mi++){
              const mName = methodOrder[mi];
              if (typeof ch[mName] === 'function'){
                attempted++;
                try {
                  await ch[mName](u8);
                  return true;
                } catch(err){
                  lastErr = err;
                }
              }
            }
            if (lastErr) throw lastErr;
            return attempted > 0;
          });
        },
        disconnect: async function(){
          writeQueue.clear();
          while (activeNotifyCleanups.length > 0){
            const fn = activeNotifyCleanups.pop();
            try { await fn(); } catch(e){}
          }
          try {
            if (typeof raw.removeEventListener === 'function'){
              raw.removeEventListener('gattserverdisconnected', discListener);
            }
            if (raw.gatt && raw.gatt.connected){
              raw.gatt.disconnect();
            }
          } catch(e){}
        }
      };
    }

    return {
      kind: 'web-bluetooth',
      getCapabilities: getCapabilities,
      getKnownDevices: getKnownDevices,
      requestDevice: requestDevice,
      reconnectKnownDevice: reconnectKnownDevice,
      connectGatt: connectGatt
    };
  }

  /* ---------- Horizon-2 Native CoreBluetooth / Android BLE Adapter ---------- */
  function createCapacitorNativeBleTransport(){
    let initialized = false;

    function getNativePlugin(){
      if (global.Capacitor && global.Capacitor.Plugins && global.Capacitor.Plugins.BluetoothLe){
        return global.Capacitor.Plugins.BluetoothLe;
      }
      if (global.BleClient) return global.BleClient;
      return null;
    }

    async function ensureInit(){
      const ble = getNativePlugin();
      if (!ble) throw new Error('Capacitor BluetoothLe plugin unavailable');
      if (!initialized && typeof ble.initialize === 'function'){
        await ble.initialize({ androidNeverForLocation:true });
        initialized = true;
      }
      return ble;
    }

    function bytesToNativeValue(u8){
      /* @capacitor-community/bluetooth-le accepts hex string on bridge & DataView on BleClient */
      const plugin = getNativePlugin();
      if (plugin && plugin === global.BleClient && typeof DataView !== 'undefined'){
        return new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
      }
      return bytesToHex(u8);
    }

    function nativeValueToU8(val){
      if (!val) return new Uint8Array(0);
      if (val && val.value !== undefined) return nativeValueToU8(val.value);
      if (typeof val === 'string') return hexToBytes(val);
      return toU8(val);
    }

    return {
      kind: 'capacitor-native',
      getCapabilities: function(){
        const ble = getNativePlugin();
        const plat = (global.BTPlatform && typeof global.BTPlatform.getPlatform === 'function')
          ? global.BTPlatform.getPlatform()
          : 'native';
        return {
          kind: 'capacitor-native',
          supported: !!ble,
          secureContext: true,
          hasWebBluetooth: false,
          canSilentReconnect: !!ble,
          canLiveRssiScan: !!ble,
          isIOS: plat === 'ios',
          isSafari: false,
          isBluefy: false,
          iosBluefyDeepLink: null,
          epistemicTier: 'verified_science',
          platformLabel: plat === 'ios' ? 'Native iOS CoreBluetooth Ready' : 'Native Android BLE Ready',
          guidance: 'Native Bluetooth Low Energy active across all 15 hardware families with silent proximity auto-reconnect.'
        };
      },
      requestDevice: async function(query){
        const ble = await ensureInit();
        const q = query || {};
        /* Omit restrictive primary services array on iOS so name-only advertisers appear cleanly */
        const req = {
          optionalServices: mergeOptionalServices(q.optionalServices)
        };
        if (!q.acceptAll && !q.acceptAllDevices){
          if (q.namePrefix){
            req.namePrefix = String(q.namePrefix);
          } else if (Array.isArray(q.filters) && q.filters.length){
            const prefixes = [];
            for (let fi = 0; fi < q.filters.length; fi++){
              const np = q.filters[fi] && q.filters[fi].namePrefix;
              if (typeof np === 'string' && np.length > 0 && prefixes.indexOf(np) < 0){
                prefixes.push(np);
              }
            }
            if (prefixes.length === 1){
              req.namePrefix = prefixes[0];
            }
          }
        }
        const dev = await ble.requestDevice(req);
        const unwrapped = (dev && dev.device) ? dev.device : dev;
        return {
          deviceId: String((unwrapped && unwrapped.deviceId) || ''),
          name: String((unwrapped && unwrapped.name) || ''),
          rawDevice: unwrapped
        };
      },
      reconnectKnownDevice: async function(saved){
        if (!saved || !saved.deviceId) return null;
        try {
          const ble = await ensureInit();
          if (typeof ble.getDevices === 'function'){
            const res = await ble.getDevices({ deviceIds:[saved.deviceId] });
            const list = Array.isArray(res) ? res : (res && Array.isArray(res.devices) ? res.devices : []);
            if (list.length > 0){
              return {
                deviceId: String(list[0].deviceId || saved.deviceId),
                name: String(list[0].name || saved.name || ''),
                rawDevice: list[0]
              };
            }
          }
          return {
            deviceId: String(saved.deviceId),
            name: String(saved.name || ''),
            rawDevice: saved
          };
        } catch(e){
          return null;
        }
      },
      connectGatt: async function(transportDevice, onDisconnect){
        const ble = await ensureInit();
        const deviceId = transportDevice.deviceId;
        const writeQueue = createWriteQueue(40, 4500);

        await ble.connect({ deviceId:deviceId }, function(){
          writeQueue.clear();
          if (typeof onDisconnect === 'function'){
            try { onDisconnect(deviceId); } catch(e){}
          }
        });

        return {
          deviceId: deviceId,
          name: transportDevice.name || '',
          writeQueue: writeQueue,
          isConnected: function(){ return true; },
          discoverServices: function(){
            return writeQueue.enqueue(async function(){
              const res = await ble.getServices({ deviceId:deviceId });
              const rawSvcs = Array.isArray(res) ? res : (res && Array.isArray(res.services) ? res.services : []);
              return rawSvcs.map(function(s){
                return {
                  uuid: normUuid(s.uuid),
                  characteristics: (s.characteristics || []).map(function(c){
                    const p = c.properties || {};
                    return {
                      uuid: normUuid(c.uuid),
                      properties: {
                        read: !!p.read,
                        write: !!p.write,
                        writeWithoutResponse: !!p.writeWithoutResponse,
                        notify: !!p.notify,
                        indicate: !!p.indicate
                      }
                    };
                  })
                };
              });
            });
          },
          startNotifications: function(serviceUuid, charUuid, onBytes){
            const su = normUuid(serviceUuid);
            const cu = normUuid(charUuid);
            return writeQueue.enqueue(async function(){
              const cb = function(ev){
                if (typeof onBytes === 'function') onBytes(nativeValueToU8(ev));
              };
              await ble.startNotifications({ deviceId:deviceId, service:su, characteristic:cu }, cb);
              return async function(){
                try { await ble.stopNotifications({ deviceId:deviceId, service:su, characteristic:cu }); } catch(e){}
              };
            });
          },
          read: function(serviceUuid, charUuid){
            const su = normUuid(serviceUuid);
            const cu = normUuid(charUuid);
            return writeQueue.enqueue(async function(){
              const val = await ble.read({ deviceId:deviceId, service:su, characteristic:cu });
              return nativeValueToU8(val);
            });
          },
          write: function(serviceUuid, charUuid, bytes, opts){
            const su = normUuid(serviceUuid);
            const cu = normUuid(charUuid);
            const u8 = toU8(bytes);
            const noResp = !!(opts && opts.withoutResponse);
            return writeQueue.enqueue(async function(){
              const payload = { deviceId:deviceId, service:su, characteristic:cu, value:bytesToNativeValue(u8) };
              if (noResp && typeof ble.writeWithoutResponse === 'function'){
                try {
                  await ble.writeWithoutResponse(payload);
                  return true;
                } catch(e){
                  await ble.write(payload);
                  return true;
                }
              }
              try {
                await ble.write(payload);
                return true;
              } catch(e){
                if (typeof ble.writeWithoutResponse === 'function'){
                  await ble.writeWithoutResponse(payload);
                  return true;
                }
                throw e;
              }
            });
          },
          disconnect: async function(){
            writeQueue.clear();
            try { await ble.disconnect({ deviceId:deviceId }); } catch(e){}
          }
        };
      }
    };
  }

  function createSimulatorBleTransport(){
    return {
      kind: 'simulator',
      getCapabilities: function(){
        return {
          kind: 'simulator',
          supported: true,
          secureContext: true,
          hasWebBluetooth: false,
          canSilentReconnect: true,
          canLiveRssiScan: true,
          isIOS: false,
          isSafari: false,
          isBluefy: false,
          iosBluefyDeepLink: null,
          epistemicTier: 'verified_science',
          platformLabel: '10Hz 5-Slot Physics Simulator Active',
          guidance: 'Simulating live 10Hz Scale Pour, 9-Bar Espresso Pressure, DiFluid R2 1.42% TDS, Omni Agtron/PSD, and 93.0C Kettle.'
        };
      },
      requestDevice: async function(query){
        const slot = (query && query.slot) || 'scale';
        return { deviceId:'sim-' + slot, name:'Simulated ' + slot, rawDevice:{ simulated:true, slot:slot } };
      },
      reconnectKnownDevice: async function(saved){
        return saved ? { deviceId:saved.deviceId || 'sim', name:saved.name || 'Simulator', rawDevice:{ simulated:true } } : null;
      },
      connectGatt: async function(dev){
        const wq = createWriteQueue(40, 4500);
        return {
          deviceId: dev.deviceId,
          name: dev.name,
          writeQueue: wq,
          isConnected: function(){ return true; },
          discoverServices: async function(){ return []; },
          startNotifications: async function(){ return async function(){}; },
          read: async function(){ return new Uint8Array([100]); },
          write: async function(){ return true; },
          disconnect: async function(){}
        };
      }
    };
  }

  function selectDefaultTransport(){
    try {
      if (global.BTPlatform && typeof global.BTPlatform.isNative === 'function' && global.BTPlatform.isNative()){
        if ((global.Capacitor && global.Capacitor.Plugins && global.Capacitor.Plugins.BluetoothLe) || global.BleClient){
          return createCapacitorNativeBleTransport();
        }
      }
    } catch(e){}
    return createWebBluetoothTransport();
  }

  const BTBleTransport = {
    createWriteQueue: createWriteQueue,
    buildBluefyUrl: buildBluefyUrl,
    createWebBluetoothTransport: createWebBluetoothTransport,
    createCapacitorNativeBleTransport: createCapacitorNativeBleTransport,
    createSimulatorBleTransport: createSimulatorBleTransport,
    selectDefaultTransport: selectDefaultTransport
  };

  /* ============================================================================
   * 3. REAL-TIME DARCY PERMEABILITY & #98 DRIPPER-LIFT / SG FLOW GUARDS
   * ============================================================================ */
  function evaluateDarcyTelemetry(params){
    const p = params || {};
    const mType = p.methodType || 'flow';
    const tNow = Math.max(0, +p.tNow || 0);
    const targetSecs = Math.max(15, +p.targetSecs || 180);
    const lastPourEndS = Math.max(0, +p.lastPourEndS || 0);
    const peakWaterG = Math.max(0, +p.peakWaterG || 0);
    const maxScaleG = Math.max(10, +p.maxScaleG || 300);
    const peakFlowGs = Math.max(0, +p.peakFlowGs || 0);
    const sweetMaxGs = +p.sweetMaxGs || 6.5;
    const fin = !!p.finished;
    const simStall = !!p.simulatorStall;
    const midSlopeGs = +p.midSlopeGs || 0;
    const tailSlopeGs = +p.tailSlopeGs || 0;

    const drawdownRatio = targetSecs > 0 ? Math.round((tNow / targetSecs) * 100) / 100 : 1;
    const expectedTailS = Math.max(20, targetSecs - lastPourEndS);
    const actualTailS = Math.max(0, tNow - lastPourEndS);

    const directTailChoke = (mType === 'espresso' || p.hasDirectOutflow) && midSlopeGs > 0.4 && tailSlopeGs > 0 && tailSlopeGs < midSlopeGs * 0.38 && peakWaterG >= maxScaleG * 0.55;
    const directFastGush = (mType === 'espresso' || p.hasDirectOutflow) && midSlopeGs > 0.5 && tailSlopeGs > midSlopeGs * 2.15 && peakWaterG >= maxScaleG * 0.55;

    const timeStall = (mType === 'flow' || mType === 'hybrid' || mType === 'espresso') && (
      (simStall && tNow >= Math.max(8, lastPourEndS * 0.45)) ||
      (tNow > targetSecs * 1.22 && (tNow - targetSecs) >= 18) ||
      (lastPourEndS > 0 && tNow > lastPourEndS + 15 && actualTailS > expectedTailS * 1.42 && actualTailS >= 32)
    );

    if (directTailChoke || timeStall){
      const effTailSlope = tailSlopeGs > 0 ? tailSlopeGs : Math.round((Math.max(20, maxScaleG * 0.35) / Math.max(25, actualTailS || expectedTailS * 1.5)) * 100) / 100;
      const highAgit = peakFlowGs > sweetMaxGs + 1.2;
      return {
        status: 'fines_stall',
        slowDraw: true,
        fastBypass: false,
        sweetSpotCutRecommended: tNow > targetSecs * 1.15,
        label: 'Paper Filter Blinding (Micro-Fines Stall)',
        drawdownRatio: drawdownRatio,
        tailSlopeGs: effTailSlope,
        recommendedSymptom: 'bitter',
        epistemicTier: 'verified_physics',
        topic: 'darcy_fines_stall',
        summary: (highAgit
          ? 'Peak pour rate (' + peakFlowGs.toFixed(1) + ' g/s) exceeded sweet spot, driving <60 um micro-fines into filter pores. '
          : 'Tail bed permeability k dropped sharply in the final 35% of drawdown (~' + effTailSlope.toFixed(2) + ' g/s tail rate). ')
          + 'Pull carafe early for a Sweet-Spot Cut or shift 1 step coarser next brew.'
      };
    }

    const finishedFast = (fin || p.yieldLocked) && peakWaterG >= maxScaleG * 0.80 && tNow >= 8 && tNow <= targetSecs * 0.76 && (targetSecs - tNow) >= (mType === 'espresso' ? 6 : 22);
    if (directFastGush || finishedFast){
      const effFastSlope = tailSlopeGs > 0 ? tailSlopeGs : Math.round((Math.max(20, maxScaleG * 0.35) / Math.max(6, actualTailS || tNow * 0.35)) * 100) / 100;
      return {
        status: 'fast_channeling',
        slowDraw: false,
        fastBypass: true,
        sweetSpotCutRecommended: false,
        label: 'Fast Channeling / Low-Resistance Bypass',
        drawdownRatio: drawdownRatio,
        tailSlopeGs: effFastSlope,
        recommendedSymptom: 'sour',
        epistemicTier: 'verified_physics',
        topic: 'darcy_fast_channel',
        summary: 'Brew finished ' + Math.max(1, Math.round(targetSecs - tNow)) + 's faster than expected Darcy resistance (' + Math.round(drawdownRatio * 100) + '% of target time). Shift 1 step finer if sour or thin.'
      };
    }

    const effNormalSlope = tailSlopeGs > 0 ? tailSlopeGs : Math.round((Math.max(20, maxScaleG * 0.35) / Math.max(12, actualTailS || expectedTailS)) * 100) / 100;
    return {
      status: 'normal',
      slowDraw: false,
      fastBypass: false,
      sweetSpotCutRecommended: false,
      label: 'Healthy Darcy Bed Permeability',
      drawdownRatio: drawdownRatio,
      tailSlopeGs: effNormalSlope,
      recommendedSymptom: '',
      epistemicTier: 'verified_physics',
      topic: 'ble_gravimetric',
      summary: 'Even hydraulic resistance across the coffee bed with steady mass transfer and clean drawdown pace.'
    };
  }

  /**
   * #98 Dripper-Lift Guard:
   * Rejects single-packet `stable: true` glitches during cone removal!
   * Requires >= 3 consecutive stable frames (`minStableFrames = 3`) inside the expected carafe plateau
   * with frame-to-frame delta <= 0.45 g before locking `actualYieldG`.
   */
  function evaluateDripperLift(liftCtx, sample, opts){
    const ctx = liftCtx || { consecutiveStable:0, lastCandidateG:null, lockedYieldG:null, locked:false };
    if (ctx.locked) return ctx;

    const s = sample || {};
    const o = opts || {};
    const minFrames = Math.max(3, +o.minStableFrames || 3);
    const peakWaterG = Math.max(0, +s.peakWaterG || 0);
    const weightG = +s.weightG || 0;
    const flowGs = +s.flowRateGs || 0;
    const minDropG = +o.minDropG || 18;
    const minCarafeG = +o.minCarafeG || Math.max(15, peakWaterG * 0.42);
    const maxCarafeG = +o.maxCarafeG || Math.max(minCarafeG + 5, peakWaterG - 8);

    const dropG = peakWaterG - weightG;
    const inBand = peakWaterG >= 35 && dropG >= minDropG && weightG >= minCarafeG && weightG <= maxCarafeG;
    const frameStable = (s.stable === true) && Math.abs(flowGs) <= 0.45;

    if (!inBand || !frameStable){
      ctx.consecutiveStable = 0;
      ctx.lastCandidateG = null;
      return ctx;
    }

    if (ctx.lastCandidateG !== null && Math.abs(weightG - ctx.lastCandidateG) > 0.45){
      ctx.consecutiveStable = 1;
      ctx.lastCandidateG = weightG;
      return ctx;
    }

    ctx.consecutiveStable = (ctx.consecutiveStable || 0) + 1;
    ctx.lastCandidateG = weightG;

    if (ctx.consecutiveStable >= minFrames){
      ctx.locked = true;
      ctx.lockedYieldG = +(weightG.toFixed(1));
    }
    return ctx;
  }

  /**
   * 5-Tap Savitzky-Golay First-Derivative Filter Clamped Strictly to [-25, 25] g/s
   * Uses quadratic/cubic 5-point stencil `[-2, -1, 0, 1, 2] / (10 * dt)` when n >= 5,
   * with OLS linear slope fallback for 2 <= n < 5.
   */
  function computeSavitzkyGolayFlowGs(ring){
    const n = ring.length;
    if (n < 2) return 0;
    const totalDtSec = (ring[n - 1].t - ring[0].t) / 1000;
    if (totalDtSec < 0.06) return 0;

    let slope = 0;
    if (n >= 5){
      const s0 = ring[n - 5], s1 = ring[n - 4], s3 = ring[n - 2], s4 = ring[n - 1];
      const span4Sec = (s4.t - s0.t) / 1000;
      if (span4Sec >= 0.12){
        const dtMean = span4Sec / 4;
        slope = (-2 * s0.w - 1 * s1.w + 1 * s3.w + 2 * s4.w) / (10 * dtMean);
      }
    }
    if (n < 5 || !Number.isFinite(slope)){
      let sumT = 0, sumW = 0;
      for (let i = 0; i < n; i++){ sumT += ring[i].t; sumW += ring[i].w; }
      const meanT = sumT / n, meanW = sumW / n;
      let num = 0, den = 0;
      for (let j = 0; j < n; j++){
        const dt = (ring[j].t - meanT) / 1000;
        const dw = ring[j].w - meanW;
        num += dt * dw;
        den += dt * dt;
      }
      slope = den > 1e-6 ? (num / den) : 0;
    }
    if (!Number.isFinite(slope)) return 0;
    return Math.max(-25, Math.min(25, slope));
  }

  /* ============================================================================
   * 4. 5-SLOT CONCURRENT BLUETOOTH SESSION ENGINE (`window.BTBle`)
   * ============================================================================ */
  function createBTBleEngine(){
    let activeTransport = null;

    function getTransport(){
      if (activeTransport) return activeTransport;
      return BTBleTransport.selectDefaultTransport();
    }

    const state = {
      /* Flat backward-compatible fields + v6 multi-slot telemetry */
      scaleConnected: false,
      scaleReconnecting: false,
      scaleBrand: '',
      scaleName: '',
      weightG: 0,
      secondaryWeightG: null,
      flowRateGs: 0,
      flowGs: 0,
      stable: true,
      stableFrames: 0,
      stableConfirmed: true,
      batteryPct: null,

      pressureConnected: false,
      pressureBrand: '',
      pressureName: '',
      pressureBar: 0,
      pressureMbar: 0,
      pressureTempC: null,
      peakPressureBar: 0,
      pressureBatteryPct: null,

      refractometerConnected: false,
      refractometerName: '',
      refractometerBatteryPct: null,
      lastTds: null,
      lastTempC: null,
      lastBrix: null,
      lastRefractiveIndex: null,
      lastR2ReadCount: 1,
      lastR2AtMs: 0,

      omniConnected: false,
      omniName: '',
      omniBatteryPct: null,
      lastOmni: null,

      machineConnected: false,
      xbloomConnected: false,
      xbloomName: '',
      xbloomStage: 'idle',
      xbloomWeightG: null,
      xbloomTempC: null,
      kettleConnected: false,
      kettleName: '',
      kettleTempC: null,
      kettleTargetTempC: null,
      kettleHold: false,
      kettlePower: false,
      kettleHeating: false,

      simulatorActive: false,
      simulatorStall: false,
      fsmState: 'IDLE',
      demoAutoPilotActive: false,
      lastStatusText: '',
      rxPacketCount: 0,
      lastPacketAtMs: 0,
      lastRawHex: '',
      lastServiceUuid: '',
      lastCharUuid: '',
      slots: {
        scale:         { connected:false, deviceId:'', brand:'', name:'', batteryPct:null },
        pressure:      { connected:false, deviceId:'', brand:'', name:'', batteryPct:null },
        refractometer: { connected:false, deviceId:'', brand:'', name:'', batteryPct:null },
        omni:          { connected:false, deviceId:'', brand:'', name:'', batteryPct:null },
        machine:       { connected:false, deviceId:'', brand:'', name:'', batteryPct:null }
      }
    };

    const AUTO_PILOT_STATES = ['IDLE', 'ARMED', 'POURING', 'DRAWDOWN', 'LOCKED_YIELD', 'R2_READY'];
    const R2_ATTACH_WINDOW_MS = 20 * 60 * 1000;

    function getLiveApp(){
      return (global.BTShell && global.BTShell.app) || global.app || global.__btApp || null;
    }

    function getLiveCupState(){
      return (global.BTShell && global.BTShell.state) || global.state || global.__btState || null;
    }

    const listeners = new Set();
    const autoPilotListeners = new Set();
    let weightRing = [];
    let smoothedFlowGs = 0;
    let lastRawDeviceWeightG = 0;
    let softwareTareOffsetG = 0;
    let tarePendingZeroCheck = false;
    let decentTareCounter = 0;
    let consecutiveStableFrames = 3;
    let demoTimers = [];
    let demoActive = false;

    function createFreshAutoPilot(){
      return {
        state: 'IDLE',
        armedAtMs: 0,
        startedAtMs: 0,
        lastFlowActiveMs: 0,
        lastFlowSampleMs: 0,
        brewFinishedAtMs: 0,
        autoStarted: false,
        captureYield: true,
        doseG: 18,
        targetWaterG: 300,
        minDropG: 18,
        peakWaterG: 0,
        pendingPeakG: null,
        lockedYieldG: null,
        yieldSource: '',
        r2Reading: null,
        r2WindowExpiresAtMs: 0,
        liftCtx: { consecutiveStable:0, lastCandidateG:null, lockedYieldG:null, locked:false }
      };
    }

    let autoPilot = createFreshAutoPilot();

    /* Mid-Brew Disconnect Recovery Snapshot (`preDropNetWeightG` Tare Continuity) */
    let dropRecovery = {
      active: false,
      preDropNetWeightG: 0,
      preDropRawWeightG: 0,
      preDropSoftwareTareG: 0,
      droppedAtMs: 0
    };

    /* Independent Active GATT Slot Sessions */
    const sessions = {
      scale: null,
      pressure: null,
      refractometer: null,
      omni: null,
      machine: null
    };

    let scaleHeartbeatIv = null;
    let scaleWakeTimeout = null;
    let scaleReceivedWeightThisSession = false;
    let scaleTimemoreVariant = '';
    let staggSeq = 1;
    let simIv = null;
    let simCtx = null;

    function recordRxTelemetry(u8, serviceUuid, charUuid){
      const b = toU8(u8);
      if (!b.length) return;
      state.rxPacketCount = (state.rxPacketCount || 0) + 1;
      state.lastPacketAtMs = Date.now();
      const lim = Math.min(24, b.length);
      const hexParts = [];
      for (let i = 0; i < lim; i++){
        hexParts.push((b[i] & 0xFF).toString(16).padStart(2, '0').toUpperCase());
      }
      state.lastRawHex = hexParts.join(' ') + (b.length > 24 ? ' ...' : '');
      if (serviceUuid) state.lastServiceUuid = normUuid(serviceUuid);
      if (charUuid) state.lastCharUuid = normUuid(charUuid);
    }

    function clearDemoTimers(){
      while (demoTimers.length > 0){
        const tid = demoTimers.pop();
        clearTimeout(tid);
      }
    }

    function snapshotAutoPilot(){
      return {
        state: autoPilot.state,
        armedAtMs: autoPilot.armedAtMs,
        startedAtMs: autoPilot.startedAtMs,
        lastFlowActiveMs: autoPilot.lastFlowActiveMs,
        brewFinishedAtMs: autoPilot.brewFinishedAtMs,
        autoStarted: autoPilot.autoStarted,
        demoActive: demoActive,
        captureYield: autoPilot.captureYield,
        doseG: autoPilot.doseG,
        targetWaterG: autoPilot.targetWaterG,
        peakWaterG: autoPilot.peakWaterG,
        lockedYieldG: autoPilot.lockedYieldG,
        yieldSource: autoPilot.yieldSource,
        r2Reading: autoPilot.r2Reading ? Object.assign({}, autoPilot.r2Reading) : null,
        r2WindowExpiresAtMs: autoPilot.r2WindowExpiresAtMs,
        consecutiveStableLiftFrames: autoPilot.liftCtx ? autoPilot.liftCtx.consecutiveStable : 0
      };
    }

    function snapshotState(){
      const snap = Object.assign({}, state);
      snap.active = !!(
        state.scaleConnected ||
        state.pressureConnected ||
        state.refractometerConnected ||
        state.omniConnected ||
        state.machineConnected ||
        state.simulatorActive
      );
      snap.flowGs = snap.flowRateGs;
      snap.fsmState = autoPilot.state;
      snap.demoAutoPilotActive = demoActive;
      snap.autoPilot = snapshotAutoPilot();
      snap.slots = {
        scale: Object.assign({}, state.slots.scale),
        pressure: Object.assign({}, state.slots.pressure),
        refractometer: Object.assign({}, state.slots.refractometer),
        omni: Object.assign({}, state.slots.omni),
        machine: Object.assign({}, state.slots.machine)
      };
      snap.scale = {
        connected: !!(state.scaleConnected || state.simulatorActive),
        reconnecting: !!state.scaleReconnecting,
        brand: state.scaleBrand,
        name: state.scaleName,
        weightG: state.weightG,
        flowGs: state.flowRateGs,
        flowRateGs: state.flowRateGs,
        stable: state.stable,
        batteryPct: state.batteryPct
      };
      snap.pressure = {
        connected: !!(state.pressureConnected || state.simulatorActive),
        brand: state.pressureBrand,
        name: state.pressureName,
        bar: state.pressureBar,
        pressureBar: state.pressureBar,
        mbar: state.pressureMbar,
        tempC: state.pressureTempC,
        peakBar: state.peakPressureBar,
        batteryPct: state.pressureBatteryPct
      };
      snap.refractometer = {
        connected: !!(state.refractometerConnected || state.simulatorActive),
        hardwareConnected: !!state.refractometerConnected,
        name: state.refractometerName || (state.simulatorActive ? 'DiFluid R2 Simulator' : ''),
        tds: state.lastTds,
        tempC: state.lastTempC,
        brix: state.lastBrix,
        refractiveIndex: state.lastRefractiveIndex,
        readCount: state.lastR2ReadCount,
        updatedAtMs: state.lastR2AtMs,
        batteryPct: state.refractometerBatteryPct
      };
      snap.omni = Object.assign({
        connected: !!(state.omniConnected || state.simulatorActive),
        name: state.omniName,
        batteryPct: state.omniBatteryPct
      }, state.lastOmni || {});
      snap.machine = {
        connected: !!(state.machineConnected || state.simulatorActive),
        name: state.xbloomName || state.kettleName || (state.simulatorActive ? 'xBloom / Stagg Simulator' : ''),
        tempC: state.kettleTempC,
        targetTempC: state.kettleTargetTempC,
        hold: state.kettleHold,
        stage: state.xbloomStage
      };
      return snap;
    }

    function emit(){
      const snap = snapshotState();
      listeners.forEach(function(fn){
        try { fn(snap); } catch(e){}
      });
    }

    function subscribe(fn){
      if (typeof fn !== 'function') return function(){};
      listeners.add(fn);
      return function(){ listeners.delete(fn); };
    }

    function subscribeAutoPilot(fn){
      if (typeof fn !== 'function') return function(){};
      autoPilotListeners.add(fn);
      return function(){ autoPilotListeners.delete(fn); };
    }

    function dispatchSafeEvent(eventName, detailObj){
      try {
        if (typeof global.dispatchEvent === 'function' && typeof CustomEvent === 'function'){
          global.dispatchEvent(new CustomEvent(eventName, { detail:detailObj }));
        }
      } catch(e){}
    }

    function transitionAutoPilot(nextState, reason, extra){
      if (AUTO_PILOT_STATES.indexOf(nextState) < 0) return snapshotAutoPilot();
      const prevState = autoPilot.state;
      autoPilot.state = nextState;
      state.fsmState = nextState;
      state.demoAutoPilotActive = demoActive;
      const snapAp = snapshotAutoPilot();
      const payload = {
        prevState: prevState,
        state: nextState,
        reason: reason || '',
        autoPilot: snapAp,
        extra: extra || null
      };
      autoPilotListeners.forEach(function(fn){
        try { fn(payload); } catch(e){}
      });
      dispatchSafeEvent('bt-ble-autopilot', payload);
      return snapAp;
    }

    function resetAutoPilot(opts){
      const o = opts || {};
      if (!o.keepDemo){
        clearDemoTimers();
        demoActive = false;
        state.demoAutoPilotActive = false;
      }
      autoPilot = createFreshAutoPilot();
      state.fsmState = 'IDLE';
      emit();
      return snapshotAutoPilot();
    }

    function armAutoPilot(opts){
      const o = opts || {};
      if (!o.keepDemo){
        clearDemoTimers();
        demoActive = false;
        state.demoAutoPilotActive = false;
      }
      const appRef = getLiveApp();
      const brewRef = appRef && appRef.brew;
      const rec = resolveSimRecipe(o.recipe);
      const doseG = +o.doseG > 0
        ? +o.doseG
        : (+(rec && rec.dose) > 0 ? +rec.dose : (+(brewRef && brewRef.dose) > 0 ? +brewRef.dose : 18));
      const targetWaterG = +o.targetWaterG > 0
        ? +o.targetWaterG
        : (+(rec && (rec.hot || rec.water)) > 0 ? +(rec.hot || rec.water) : (+(brewRef && brewRef.water) > 0 ? +brewRef.water : 300));
      const captureYield = o.captureYield !== undefined
        ? !!o.captureYield
        : !(appRef && appRef.prefs && appRef.prefs.gear && appRef.prefs.gear.ble && appRef.prefs.gear.ble.captureYield === false);

      autoPilot = createFreshAutoPilot();
      autoPilot.armedAtMs = Date.now();
      autoPilot.doseG = +doseG.toFixed(1);
      autoPilot.targetWaterG = +targetWaterG.toFixed(1);
      autoPilot.minDropG = +o.minDropG > 0 ? +o.minDropG : 18;
      autoPilot.captureYield = captureYield;

      state.lastStatusText = 'BLE Auto-Pilot ARMED (waiting for pour > 0.6 g & > 0.8 g/s)';
      transitionAutoPilot('ARMED', 'armed');
      if (o.autoTare === true && (state.scaleConnected || state.simulatorActive)){
        tare();
      } else {
        emit();
      }
      return snapshotAutoPilot();
    }

    function _finalizeLockedYield(yieldG, source, finishedAtOverrideMs){
      const cleanYield = +(Math.max(0, +yieldG || 0).toFixed(1));
      const finMs = finishedAtOverrideMs != null && +finishedAtOverrideMs > 0 ? +finishedAtOverrideMs : Date.now();
      autoPilot.lockedYieldG = cleanYield;
      autoPilot.yieldSource = source || 'dripper_lift';
      autoPilot.brewFinishedAtMs = finMs;
      autoPilot.r2WindowExpiresAtMs = finMs + R2_ATTACH_WINDOW_MS;
      if (autoPilot.liftCtx){
        autoPilot.liftCtx.locked = true;
        autoPilot.liftCtx.lockedYieldG = cleanYield;
      }
      if (autoPilot.captureYield !== false){
        const appRef = getLiveApp();
        if (appRef && appRef.brew){
          appRef.brew.yieldOut = cleanYield;
        }
      }
      state.lastStatusText = 'Auto-Pilot LOCKED_YIELD: ' + cleanYield.toFixed(1) + ' g beverage (R2 window open 20 min)';
      const snapAp = transitionAutoPilot('LOCKED_YIELD', autoPilot.yieldSource, { lockedYieldG:cleanYield });
      dispatchSafeEvent('bt-ble-yield-locked', snapAp);
      return snapAp;
    }

    function lockAutoPilotYield(overrideG, reason, opts){
      const o = opts || {};
      const val = (overrideG != null && Number.isFinite(+overrideG) && +overrideG >= 0) ? +overrideG : state.weightG;
      const snapAp = _finalizeLockedYield(val, reason || 'manual_lock', o.finishedAtMs);
      emit();
      return snapAp;
    }

    function attachR2Reading(reading, opts){
      const o = opts || {};
      const r = reading || {};
      const tdsRaw = +r.tds;
      if (!Number.isFinite(tdsRaw) || tdsRaw <= 0){
        return { attached:false, reason:'invalid_tds', state:autoPilot.state };
      }
      const nowMs = (o.timestampMs != null && +o.timestampMs > 0) ? +o.timestampMs : Date.now();
      const inEligibleState = autoPilot.state === 'LOCKED_YIELD' || autoPilot.state === 'R2_READY' || o.forceAttach === true;
      const finishedAt = autoPilot.brewFinishedAtMs || 0;
      const elapsedMs = finishedAt > 0 ? Math.max(0, nowMs - finishedAt) : Infinity;
      const withinWindow = (finishedAt > 0 && elapsedMs <= R2_ATTACH_WINDOW_MS) || o.forceAttach === true;

      if (!inEligibleState || !withinWindow){
        return {
          attached: false,
          reason: !inEligibleState ? ('state_' + autoPilot.state) : 'window_expired',
          elapsedMs: elapsedMs,
          state: autoPilot.state
        };
      }

      const appRef = getLiveApp();
      const cupRef = getLiveCupState();
      const brewRef = appRef && appRef.brew;
      const bevG = autoPilot.lockedYieldG > 0
        ? autoPilot.lockedYieldG
        : (+(brewRef && brewRef.yieldOut) > 0 ? +brewRef.yieldOut : 0);
      const doseG = autoPilot.doseG > 0
        ? autoPilot.doseG
        : (+(brewRef && brewRef.dose) > 0 ? +brewRef.dose : 18);
      const tdsVal = +(Math.max(0.1, Math.min(24, tdsRaw)).toFixed(2));
      const tempVal = (r.tempC != null && Number.isFinite(+r.tempC))
        ? +(+r.tempC).toFixed(1)
        : state.lastTempC;
      const eyPct = (tdsVal > 0 && bevG > 0 && doseG > 0)
        ? +(Math.round((tdsVal * bevG / doseG) * 100) / 100).toFixed(2)
        : null;

      autoPilot.r2Reading = {
        tds: tdsVal,
        tempC: tempVal,
        brix: r.brix != null ? +r.brix : +(tdsVal / 0.85).toFixed(2),
        refractiveIndex: r.refractiveIndex != null ? +r.refractiveIndex : +(1.33299 + tdsVal * 0.001585).toFixed(5),
        eyPct: eyPct,
        beverageG: bevG || null,
        doseG: doseG || null,
        attachedAtMs: nowMs
      };

      if (cupRef && typeof cupRef === 'object'){
        cupRef.measuredTds = tdsVal;
        if (eyPct != null) cupRef.measuredEy = eyPct;
      }

      state.lastStatusText = 'Auto-Pilot R2_READY: ' + tdsVal.toFixed(2) + '% TDS' +
        (eyPct != null ? ' (' + eyPct.toFixed(2) + '% EY)' : '') +
        (tempVal != null ? ' @ ' + tempVal.toFixed(1) + 'C' : '');
      const snapAp = transitionAutoPilot('R2_READY', 'r2_attached', autoPilot.r2Reading);
      dispatchSafeEvent('bt-ble-r2-ready', snapAp);
      if (!o.suppressEmit) emit();
      return {
        attached: true,
        state: autoPilot.state,
        elapsedMs: Number.isFinite(elapsedMs) ? elapsedMs : 0,
        r2Reading: Object.assign({}, autoPilot.r2Reading),
        autoPilot: snapAp
      };
    }

    function updateSpikeGuardedPeak(netG, isStepJump){
      if (netG > autoPilot.peakWaterG){
        if (!isStepJump){
          autoPilot.peakWaterG = netG;
          autoPilot.pendingPeakG = null;
        } else if (autoPilot.pendingPeakG !== null && netG >= autoPilot.pendingPeakG - 8){
          autoPilot.peakWaterG = Math.max(autoPilot.peakWaterG, Math.min(netG, autoPilot.pendingPeakG));
          autoPilot.pendingPeakG = netG;
        } else {
          autoPilot.pendingPeakG = netG;
        }
      } else {
        autoPilot.pendingPeakG = null;
      }
    }

    function advanceAutoPilotOnWeight(netG, flowRounded, frameLooksStable, sampleTimeMs, isStepJump){
      if (autoPilot.state === 'IDLE' || autoPilot.state === 'LOCKED_YIELD' || autoPilot.state === 'R2_READY') return;
      const nowWallMs = Date.now();
      const tMs = sampleTimeMs != null ? +sampleTimeMs : perfNow();

      if (autoPilot.state === 'ARMED'){
        /* Hands-free pour auto-start threshold: w > 0.6g && dw/dt > 0.8 g/s */
        if (netG > 0.6 && flowRounded > 0.8){
          autoPilot.startedAtMs = nowWallMs;
          autoPilot.lastFlowActiveMs = nowWallMs;
          autoPilot.lastFlowSampleMs = tMs;
          autoPilot.autoStarted = true;
          autoPilot.peakWaterG = Math.max(autoPilot.peakWaterG, netG);
          autoPilot.pendingPeakG = null;
          state.lastStatusText = 'Auto-Pilot POURING (' + netG.toFixed(1) + ' g @ ' + flowRounded.toFixed(1) + ' g/s)';
          const snapStart = transitionAutoPilot('POURING', 'pour_detected', { weightG:netG, flowRateGs:flowRounded });
          dispatchSafeEvent('bt-ble-autostart', snapStart);
        }
        return;
      }

      if (autoPilot.state === 'POURING'){
        updateSpikeGuardedPeak(netG, isStepJump);
        if (flowRounded > 0.35){
          autoPilot.lastFlowActiveMs = nowWallMs;
          autoPilot.lastFlowSampleMs = tMs;
        }
        const liftStarted = autoPilot.peakWaterG >= 35 && (autoPilot.peakWaterG - netG) >= autoPilot.minDropG;
        const minDrawdownMass = Math.max(20, autoPilot.targetWaterG * 0.55);
        const quietElapsedMs = Math.max(
          nowWallMs - (autoPilot.lastFlowActiveMs || nowWallMs),
          tMs - (autoPilot.lastFlowSampleMs || tMs)
        );
        const pourSettled = autoPilot.peakWaterG >= minDrawdownMass &&
          Math.abs(flowRounded) <= 0.25 &&
          (quietElapsedMs >= 1200 || state.stableConfirmed);

        if (liftStarted || pourSettled){
          state.lastStatusText = 'Auto-Pilot DRAWDOWN (peak ' + autoPilot.peakWaterG.toFixed(1) + ' g)';
          transitionAutoPilot('DRAWDOWN', liftStarted ? 'dripper_lift_drop' : 'pour_complete');
        } else {
          return;
        }
      }

      if (autoPilot.state === 'DRAWDOWN'){
        if (flowRounded > 0.9 && netG > autoPilot.peakWaterG + 1.5){
          autoPilot.peakWaterG = netG;
          autoPilot.pendingPeakG = null;
          autoPilot.lastFlowActiveMs = nowWallMs;
          autoPilot.lastFlowSampleMs = tMs;
          autoPilot.liftCtx = { consecutiveStable:0, lastCandidateG:null, lockedYieldG:null, locked:false };
          state.lastStatusText = 'Auto-Pilot POURING pulse (' + netG.toFixed(1) + ' g)';
          transitionAutoPilot('POURING', 'pulse_pour');
          return;
        }
        if (!isStepJump && netG > autoPilot.peakWaterG && (netG - autoPilot.peakWaterG) <= 8){
          autoPilot.peakWaterG = netG;
        }
        evaluateDripperLift(autoPilot.liftCtx, {
          peakWaterG: autoPilot.peakWaterG,
          weightG: netG,
          flowRateGs: flowRounded,
          stable: frameLooksStable
        }, {
          minStableFrames: 3,
          minDropG: autoPilot.minDropG
        });
        if (autoPilot.liftCtx.locked && autoPilot.liftCtx.lockedYieldG != null){
          _finalizeLockedYield(autoPilot.liftCtx.lockedYieldG, 'dripper_lift');
        }
      }
    }

    function resetFlowFilter(){
      weightRing = [];
      smoothedFlowGs = 0;
    }

    /* ---------- Remembered Devices Registry (`app.prefs.gear.ble.rememberedDevices`) ---------- */
    function getRememberedDevices(){
      try {
        const appRef = getLiveApp();
        const list = appRef && appRef.prefs && appRef.prefs.gear &&
          appRef.prefs.gear.ble && appRef.prefs.gear.ble.rememberedDevices;
        return Array.isArray(list) ? list.slice(0, 8) : [];
      } catch(e){
        return [];
      }
    }

    function saveRememberedDevices(nextList){
      const trimmed = (Array.isArray(nextList) ? nextList : []).slice(0, 8);
      try {
        const appRef = getLiveApp();
        if (appRef && typeof appRef === 'object'){
          const prefs = appRef.prefs || (appRef.prefs = {});
          const gear = prefs.gear || (prefs.gear = {});
          const bleCfg = gear.ble || (gear.ble = {});
          bleCfg.rememberedDevices = trimmed;
          if (typeof global.scheduleDraft === 'function') global.scheduleDraft();
          else if (global.BTShell && typeof global.BTShell.scheduleDraft === 'function') global.BTShell.scheduleDraft();
        }
      } catch(e){}
      return trimmed;
    }

    function rememberDevice(entry){
      if (!entry || !entry.deviceId) return getRememberedDevices();
      const rec = {
        slot: String(entry.slot || 'scale'),
        deviceId: String(entry.deviceId),
        brand: String(entry.brand || ''),
        name: String(entry.name || '').slice(0, 64),
        transportKind: String(entry.transportKind || getTransport().kind),
        autoConnect: entry.autoConnect !== false,
        lastConnectedAt: new Date().toISOString()
      };
      const existing = getRememberedDevices().filter(function(d){
        return d.deviceId !== rec.deviceId;
      });
      existing.unshift(rec);
      return saveRememberedDevices(existing);
    }

    function forgetDevice(deviceIdOrSlot){
      const key = String(deviceIdOrSlot || '');
      const filtered = getRememberedDevices().filter(function(d){
        return d.deviceId !== key && d.slot !== key;
      });
      return saveRememberedDevices(filtered);
    }

    /* ---------- Gravimetric Weight Pipeline, Mid-Brew Recovery & #98 Guards ---------- */
    function reconcilePostReconnectWeight(newRawG){
      if (!dropRecovery.active) return;
      const preNet = dropRecovery.preDropNetWeightG;
      const preRaw = dropRecovery.preDropRawWeightG;
      const preTare = dropRecovery.preDropSoftwareTareG;
      dropRecovery.active = false;

      if (Math.abs(newRawG - preRaw) <= 15){
        /* Load cell stayed powered continuously */
        softwareTareOffsetG = preTare;
        tarePendingZeroCheck = false;
      } else if (Math.abs(newRawG) <= 2.5 && preNet >= 15){
        /* Scale power-cycled / auto-zeroed with wet brewer still on tray: restore preDropNetWeightG! */
        softwareTareOffsetG = +(newRawG - preNet).toFixed(2);
        tarePendingZeroCheck = false;
      } else if (preNet >= 15 && newRawG > 2.5 && newRawG < preRaw - 15){
        /* Scale zeroed during drop and user poured +newRawG more water */
        softwareTareOffsetG = -preNet;
        tarePendingZeroCheck = false;
      } else if (preNet >= 15){
        tarePendingZeroCheck = false;
      }
      resetFlowFilter();
    }

    function pushRawWeight(rawG, hwFlowGs, hwStable, secondaryG, sampleTimeMs){
      if (!Number.isFinite(rawG)) return;
      if (dropRecovery.active){
        reconcilePostReconnectWeight(rawG);
      }
      lastRawDeviceWeightG = rawG;

      if (tarePendingZeroCheck && Math.abs(rawG) <= 0.65){
        softwareTareOffsetG = 0;
        tarePendingZeroCheck = false;
      }

      const netG = +(rawG - softwareTareOffsetG).toFixed(2);
      const tMs = sampleTimeMs != null ? +sampleTimeMs : perfNow();
      const prevSample = weightRing.length ? weightRing[weightRing.length - 1] : null;
      const stepDeltaG = prevSample ? (netG - prevSample.w) : 0;
      const stepDtMs = prevSample ? Math.max(0, tMs - prevSample.t) : 0;

      /* #98 Tap-Spike & Dripper-Lift Step Discontinuity Reset */
      const isStepDrop = prevSample !== null && stepDeltaG <= -18;
      const isStepJump = prevSample !== null && Math.abs(stepDeltaG) > 18 &&
        (stepDtMs < 450 || (stepDtMs < 950 && Math.abs(stepDeltaG) / Math.max(0.04, stepDtMs / 1000) > 25));

      if (isStepDrop || isStepJump){
        weightRing = [];
        smoothedFlowGs = 0;
        consecutiveStableFrames = 0;
      }

      weightRing.push({ t:tMs, w:netG });
      while (weightRing.length > 5 && (tMs - weightRing[0].t) > 950){
        weightRing.shift();
      }
      if (weightRing.length > 24) weightRing.shift();

      const sgSlope = computeSavitzkyGolayFlowGs(weightRing);
      if (hwFlowGs != null && Number.isFinite(hwFlowGs) && !isStepDrop && !isStepJump){
        const clampedHw = Math.max(-25, Math.min(25, hwFlowGs));
        smoothedFlowGs = weightRing.length >= 3 ? (0.58 * clampedHw + 0.42 * sgSlope) : clampedHw;
      } else {
        smoothedFlowGs = 0.45 * sgSlope + 0.55 * smoothedFlowGs;
      }

      const n = weightRing.length;
      const winBaseIdx = Math.max(0, n - 5);
      const ringSpanMs = n >= 2 ? (tMs - weightRing[winBaseIdx].t) : 0;
      const ringDeltaG = n >= 2 ? Math.abs(netG - weightRing[winBaseIdx].w) : 0;
      if (isStepDrop){
        smoothedFlowGs = 0;
      } else if (hwStable === true && (n < 2 || (ringSpanMs >= 220 ? (ringDeltaG <= 0.22 && Math.abs(sgSlope) < 0.22) : (Math.abs(netG - weightRing[n - 2].w) <= 0.08 && (hwFlowGs == null || Math.abs(hwFlowGs) < 0.12))))){
        smoothedFlowGs = 0;
      } else if (ringSpanMs >= 300 && ringDeltaG <= 0.15 && Math.abs(sgSlope) < 0.15 && (hwFlowGs == null || Math.abs(hwFlowGs) < 0.12)){
        smoothedFlowGs = 0;
      }

      /* Hard [-25, 25] g/s Savitzky-Golay derivative clamp */
      smoothedFlowGs = Math.max(-25, Math.min(25, smoothedFlowGs));
      if (Math.abs(smoothedFlowGs) < 0.06) smoothedFlowGs = 0;
      const flowRounded = +(smoothedFlowGs.toFixed(1));

      /* #98 Consecutive Stable Frame Counter (>= 3 frames required for confirmed stability) */
      const frameLooksStable = hwStable != null
        ? (!!hwStable && Math.abs(flowRounded) <= 0.45)
        : (Math.abs(flowRounded) < 0.12 && (n < 2 || (ringSpanMs >= 220 ? ringDeltaG <= 0.35 : Math.abs(netG - weightRing[n - 2].w) <= 0.20)));

      if (frameLooksStable){
        consecutiveStableFrames = Math.min(50, consecutiveStableFrames + 1);
      } else {
        consecutiveStableFrames = 0;
      }

      state.weightG = cleanZero(netG);
      state.flowRateGs = cleanZero(flowRounded);
      state.flowGs = state.flowRateGs;
      state.stable = frameLooksStable;
      state.stableFrames = consecutiveStableFrames;
      state.stableConfirmed = consecutiveStableFrames >= 3;
      if (secondaryG !== undefined) state.secondaryWeightG = secondaryG;
      advanceAutoPilotOnWeight(state.weightG, state.flowRateGs, frameLooksStable, tMs, isStepJump);
      emit();
    }

    function pushPressureReading(barVal, mbarVal, tempC, batPct){
      if (!Number.isFinite(barVal)) return;
      const clampedBar = cleanZero(+(Math.max(-1, Math.min(25, barVal))).toFixed(2));
      state.pressureBar = clampedBar;
      state.pressureMbar = mbarVal != null ? Math.round(mbarVal) : Math.round(clampedBar * 1000);
      if (tempC != null && Number.isFinite(tempC)) state.pressureTempC = +tempC.toFixed(1);
      if (batPct != null && Number.isFinite(batPct)){
        state.pressureBatteryPct = batPct;
        state.slots.pressure.batteryPct = batPct;
      }
      if (clampedBar > state.peakPressureBar) state.peakPressureBar = clampedBar;
      emit();
      try {
        global.dispatchEvent(new CustomEvent('bt-ble-pressure', {
          detail: { pressureBar:state.pressureBar, pressureMbar:state.pressureMbar, tempC:state.pressureTempC, peakPressureBar:state.peakPressureBar }
        }));
      } catch(e){}
    }

    /* ---------- Slot 1: Scale Connection, Auto-Promotion & Mid-Brew Reconnect ---------- */
    function clearScaleTimers(){
      if (scaleHeartbeatIv){ clearInterval(scaleHeartbeatIv); scaleHeartbeatIv = null; }
      if (scaleWakeTimeout){ clearTimeout(scaleWakeTimeout); scaleWakeTimeout = null; }
    }

    function normalizeScaleBrand(raw){
      const s = String(raw || '').trim().toLowerCase();
      if (!s || s === 'auto') return 'auto';
      if (/acaia|lunar|pearl|pyxis|cinco|orion|prochbt/.test(s)) return 'acaia';
      if (/difluid|microbalance|dft-?s|df-?s/.test(s)) return 'difluid';
      if (/bookoo|themis/.test(s)) return 'bookoo';
      if (/timemore|black\s*mirror|^tm\b/.test(s)) return 'timemore';
      if (/felicita|arc|incline|parallel/.test(s)) return 'felicita';
      if (/decent|hds|half\s*decent/.test(s)) return 'decent';
      if (/varia|aku|cube|mhw|exagram|wacaco/.test(s)) return 'varia';
      if (/skale|atomax/.test(s)) return 'skale';
      if (/eureka|precisa|cfs-?9002|brewista|lsj|smart\s*scale|formula|solobarista|kc200|weighmybru/.test(s)) return 'eureka';
      if (/hiroia|jimmy/.test(s)) return 'hiroia';
      if (/ascii|uart|nus|serial/.test(s)) return 'ascii';
      if (/sig|181d/.test(s)) return 'sig';
      return 'auto';
    }

    function buildScaleQuery(brandKey, opts){
      const o = opts || {};
      const optionalServices = mergeOptionalServices([
        UUID.ACAIA_PYXIS_SVC, UUID.ACAIA_LEGACY_SVC, UUID.DIFLUID_SCALE_SVC, UUID.DIFLUID_SCALE_ALT_SVC,
        UUID.DIFLUID_SVC, UUID.DIFLUID_V3_SVC, UUID.BOOKOO_SVC, UUID.SHARED_FFF0_SVC,
        UUID.FELICITA_SVC, UUID.SKALE_SVC, UUID.EUREKA_ALT_SVC, UUID.HIROIA_SVC,
        UUID.WEIGHT_SIG_SVC, UUID.TIMEMORE_CUSTOM_SVC, UUID.NUS_SVC, UUID.BATTERY_SVC
      ]);
      if (o.acceptAll === true || o.acceptAllDevices === true){
        return { slot:'scale', acceptAll:true, filters:[], optionalServices:optionalServices };
      }
      const byBrand = {
        acaia: [
          { services:[UUID.ACAIA_PYXIS_SVC] }, { services:[UUID.ACAIA_LEGACY_SVC] },
          { namePrefix:'ACAIA' }, { namePrefix:'Acaia' }, { namePrefix:'acaia' }, { namePrefix:'PROCHBT' },
          { namePrefix:'LUNAR' }, { namePrefix:'Lunar' }, { namePrefix:'lunar' },
          { namePrefix:'PEARL' }, { namePrefix:'Pearl' }, { namePrefix:'pearl' },
          { namePrefix:'PYXIS' }, { namePrefix:'Pyxis' }, { namePrefix:'pyxis' },
          { namePrefix:'CINCO' }, { namePrefix:'Cinco' }, { namePrefix:'cinco' },
          { namePrefix:'ORION' }, { namePrefix:'Orion' }, { namePrefix:'orion' }
        ],
        difluid: [
          { services:[UUID.DIFLUID_SCALE_SVC] }, { services:[UUID.DIFLUID_SCALE_ALT_SVC] },
          { services:[UUID.DIFLUID_SVC] }, { services:[UUID.DIFLUID_V3_SVC] },
          { namePrefix:'Microbalance' }, { namePrefix:'MicroBalance' }, { namePrefix:'MICROBALANCE' }, { namePrefix:'microbalance' },
          { namePrefix:'DiFluid' }, { namePrefix:'DIFLUID' }, { namePrefix:'difluid' },
          { namePrefix:'DFT-S' }, { namePrefix:'DF-S' }, { namePrefix:'DF' }, { namePrefix:'df' }
        ],
        bookoo: [
          { services:[UUID.BOOKOO_SVC] },
          { namePrefix:'BOOKOO' }, { namePrefix:'Bookoo' }, { namePrefix:'bookoo' },
          { namePrefix:'Themis' }, { namePrefix:'THEMIS' }, { namePrefix:'themis' }
        ],
        timemore: [
          { services:[UUID.WEIGHT_SIG_SVC] }, { services:[UUID.SHARED_FFF0_SVC] }, { services:[UUID.TIMEMORE_CUSTOM_SVC] },
          { namePrefix:'Timemore' }, { namePrefix:'TIMEMORE' }, { namePrefix:'timemore' },
          { namePrefix:'Black Mirror' }, { namePrefix:'BLACK MIRROR' }, { namePrefix:'black mirror' }, { namePrefix:'TM' }
        ],
        felicita: [
          { services:[UUID.FELICITA_SVC] },
          { namePrefix:'FELICITA' }, { namePrefix:'Felicita' }, { namePrefix:'felicita' }
        ],
        decent: [
          { services:[UUID.DECENT_SVC] },
          { namePrefix:'Decent' }, { namePrefix:'DECENT' }, { namePrefix:'decent' }, { namePrefix:'Half Decent' }, { namePrefix:'half decent' }, { namePrefix:'HDS' }
        ],
        varia: [
          { services:[UUID.SHARED_FFF0_SVC] }, { services:[UUID.EUREKA_ALT_SVC] }, { services:[UUID.FELICITA_SVC] }, { services:[UUID.NUS_SVC] },
          { namePrefix:'Varia' }, { namePrefix:'VARIA' }, { namePrefix:'varia' }, { namePrefix:'AKU' }, { namePrefix:'aku' },
          { namePrefix:'Cube' }, { namePrefix:'CUBE' }, { namePrefix:'cube' }, { namePrefix:'MHW' }, { namePrefix:'mhw' },
          { namePrefix:'Exagram' }, { namePrefix:'EXAGRAM' }, { namePrefix:'Wacaco' }, { namePrefix:'WACACO' }
        ],
        skale: [
          { services:[UUID.SKALE_SVC] },
          { namePrefix:'Skale' }, { namePrefix:'SKALE' }, { namePrefix:'skale' }
        ],
        eureka: [
          { services:[UUID.SHARED_FFF0_SVC] }, { services:[UUID.EUREKA_ALT_SVC] }, { services:[UUID.FELICITA_SVC] },
          { services:[UUID.BOOKOO_SVC] }, { services:[UUID.NUS_SVC] },
          { namePrefix:'Precisa' }, { namePrefix:'PRECISA' }, { namePrefix:'precisa' },
          { namePrefix:'CFS-9002' }, { namePrefix:'cfs-9002' },
          { namePrefix:'Eureka' }, { namePrefix:'EUREKA' }, { namePrefix:'eureka' },
          { namePrefix:'LSJ' }, { namePrefix:'lsj' },
          { namePrefix:'Smart Scale' }, { namePrefix:'smart scale' },
          { namePrefix:'Brewista' }, { namePrefix:'BREWISTA' }, { namePrefix:'brewista' },
          { namePrefix:'Exagram' }, { namePrefix:'EXAGRAM' }, { namePrefix:'Wacaco' }, { namePrefix:'WACACO' },
          { namePrefix:'Cube' }, { namePrefix:'CUBE' }, { namePrefix:'cube' },
          { namePrefix:'MHW' }, { namePrefix:'mhw' },
          { namePrefix:'Formula' }, { namePrefix:'FORMULA' }, { namePrefix:'formula' },
          { namePrefix:'SoloBarista' }, { namePrefix:'SOLOBARISTA' }, { namePrefix:'solobarista' },
          { namePrefix:'KC200' }, { namePrefix:'kc200' },
          { namePrefix:'WeighMyBru' }, { namePrefix:'WEIGHMYBRU' }, { namePrefix:'weighmybru' }
        ],
        hiroia: [
          { services:[UUID.HIROIA_SVC] },
          { namePrefix:'HIROIA' }, { namePrefix:'Hiroia' }, { namePrefix:'hiroia' }, { namePrefix:'JIMMY' }, { namePrefix:'Jimmy' }, { namePrefix:'jimmy' }
        ],
        sig: [
          { services:[UUID.WEIGHT_SIG_SVC] }
        ]
      };
      const rawFilters = (brandKey !== 'auto' && byBrand[brandKey])
        ? byBrand[brandKey]
        : [].concat(
            byBrand.acaia, byBrand.difluid, byBrand.bookoo, byBrand.timemore, byBrand.felicita,
            byBrand.decent, byBrand.varia, byBrand.skale, byBrand.eureka, byBrand.hiroia, byBrand.sig
          );
      return { slot:'scale', filters:dedupeDeviceFilters(rawFilters), optionalServices:optionalServices };
    }

    async function writeScaleCommandSafe(gatt, profile, cmdBytes){
      if (!gatt || !profile || !cmdBytes) return false;
      const writeSvc = profile.writeServiceUuid || profile.serviceUuid;
      const primaryChr = profile.writeUuid;
      const altChr = profile.altWriteUuid;
      if (primaryChr){
        try {
          const ok = await gatt.write(writeSvc, primaryChr, cmdBytes);
          if (ok) return true;
        } catch(e){}
      }
      if (altChr && altChr !== primaryChr){
        try {
          const okAlt = await gatt.write(profile.serviceUuid, altChr, cmdBytes);
          if (okAlt) return true;
        } catch(e){}
      }
      return false;
    }

    function armDecentHeartbeatLoop(gatt, profile){
      if (scaleHeartbeatIv) return;
      scaleHeartbeatIv = setInterval(function(){
        if (state.scaleConnected && sessions.scale && sessions.scale.gatt === gatt){
          writeScaleCommandSafe(gatt, profile, Codecs.commands.decentHeartbeat()).catch(function(){});
        }
      }, 3500);
    }

    function processDecodedScaleFrame(fr){
      if (!fr) return;
      if (fr.brand && fr.brand !== state.scaleBrand && fr.slot === 'scale'){
        state.scaleBrand = fr.brand;
        state.slots.scale.brand = fr.brand;
      }
      if (fr.variant) scaleTimemoreVariant = fr.variant;
      if (fr.batteryPct != null){
        state.batteryPct = fr.batteryPct;
        state.slots.scale.batteryPct = fr.batteryPct;
      }
      if (fr.packetType === 'weight' && Number.isFinite(fr.weightG)){
        scaleReceivedWeightThisSession = true;
        if (scaleWakeTimeout){ clearTimeout(scaleWakeTimeout); scaleWakeTimeout = null; }
        pushRawWeight(
          fr.weightG,
          fr.flowRateGs != null ? fr.flowRateGs : null,
          fr.stable != null ? fr.stable : null,
          fr.secondaryWeightG !== undefined ? fr.secondaryWeightG : undefined
        );
      } else if (fr.packetType === 'button' || fr.action){
        if (fr.action === 'tare'){
          softwareTareOffsetG = lastRawDeviceWeightG;
          tarePendingZeroCheck = true;
          resetFlowFilter();
          state.weightG = 0;
          state.flowRateGs = 0;
          emit();
        }
        dispatchSafeEvent('bt-ble-scale-button', fr);
      } else if (fr.packetType === 'status'){
        emit();
      }
    }

    async function establishScaleSession(transportDev, preferredBrand, isReconnect){
      const transport = getTransport();
      const query = buildScaleQuery(preferredBrand || 'auto');
      let intentional = false;

      const onUnexpectedDrop = function(){
        clearScaleTimers();
        if (intentional || sessions.scale && sessions.scale.intentional) return;
        const heldNet = state.weightG;
        dropRecovery = {
          active: true,
          preDropNetWeightG: heldNet,
          preDropRawWeightG: lastRawDeviceWeightG,
          preDropSoftwareTareG: softwareTareOffsetG,
          droppedAtMs: Date.now()
        };
        state.scaleConnected = false;
        state.scaleReconnecting = true;
        state.slots.scale.connected = false;
        state.lastStatusText = (state.scaleName || 'Scale') + ' link dropped - holding ' + heldNet.toFixed(1) + ' g and reconnecting...';
        emit();

        const delays = [400, 900, 1800, 3200, 5000];
        let attempt = 0;
        const retry = function(){
          if (intentional || !state.scaleReconnecting) return;
          establishScaleSession(transportDev, preferredBrand, true).then(function(){
            state.scaleReconnecting = false;
            state.lastStatusText = 'Reconnected to ' + state.scaleName + ' (tare continuity preserved)';
            emit();
          }).catch(function(){
            attempt++;
            if (attempt < delays.length){
              setTimeout(retry, delays[attempt]);
            } else {
              state.scaleReconnecting = false;
              state.lastStatusText = 'Scale disconnected - tap Reconnect to resume.';
              emit();
            }
          });
        };
        setTimeout(retry, delays[0]);
      };

      const gatt = await transport.connectGatt(transportDev, onUnexpectedDrop);
      const services = await gatt.discoverServices(query.optionalServices);
      const profile = Codecs.detectGattProfile(services, gatt.name || transportDev.name, 'scale');
      if (!profile || !profile.notifyUuid){
        await gatt.disconnect();
        throw new Error('Selected Bluetooth device did not expose a supported coffee scale characteristic.');
      }

      /* If device on 0x1820 turned out to be Stagg EKG+ kettle, route cleanly to machine slot */
      if (profile.family === 'stagg_ekg_plus'){
        await gatt.disconnect();
        return connectKettleWithDevice(transportDev);
      }

      clearScaleTimers();
      scaleReceivedWeightThisSession = false;
      tarePendingZeroCheck = false;
      if (!isReconnect){
        resetFlowFilter();
        softwareTareOffsetG = 0;
        dropRecovery.active = false;
      }

      scaleTimemoreVariant = profile.variant || '';
      const charStream = Codecs.streams.createCharacteristicStream(profile.family, {
        slot: 'scale',
        deviceName: gatt.name || transportDev.name,
        serviceUuid: profile.serviceUuid,
        charUuid: profile.notifyUuid,
        autoPromote: true
      });

      await gatt.startNotifications(profile.serviceUuid, profile.notifyUuid, function(u8){
        recordRxTelemetry(u8, profile.serviceUuid, profile.notifyUuid);
        const res = charStream.push(u8);
        if (res.promoted && res.family){
          state.scaleBrand = res.family;
          state.slots.scale.brand = res.family;
          if (res.family === 'decent' && (profile.writeUuid || profile.altWriteUuid)){
            armDecentHeartbeatLoop(gatt, profile);
          }
        }
        for (let i = 0; i < res.frames.length; i++){
          processDecodedScaleFrame(res.frames[i]);
        }
      });

      if (Array.isArray(profile.extraNotifyUuids)){
        for (let ei = 0; ei < profile.extraNotifyUuids.length; ei++){
          const extraUuid = profile.extraNotifyUuids[ei];
          const extraStream = Codecs.streams.createCharacteristicStream(profile.family, {
            slot: 'scale',
            deviceName: gatt.name || transportDev.name,
            serviceUuid: profile.serviceUuid,
            charUuid: extraUuid,
            autoPromote: true
          });
          try {
            await gatt.startNotifications(profile.serviceUuid, extraUuid, function(u8){
              recordRxTelemetry(u8, profile.serviceUuid, extraUuid);
              const eres = extraStream.push(u8);
              if (eres.promoted && eres.family){
                state.scaleBrand = eres.family;
                state.slots.scale.brand = eres.family;
                if (eres.family === 'decent' && (profile.writeUuid || profile.altWriteUuid)){
                  armDecentHeartbeatLoop(gatt, profile);
                }
              }
              for (let k = 0; k < eres.frames.length; k++) processDecodedScaleFrame(eres.frames[k]);
            });
          } catch(e){}
        }
      }

      /* Read optional 0x180F battery level */
      try {
        const hasBat = services.some(function(s){ return s.uuid === UUID.BATTERY_SVC; });
        if (hasBat){
          const bVal = await gatt.read(UUID.BATTERY_SVC, UUID.BATTERY_LEVEL);
          if (bVal.length >= 1 && bVal[0] <= 100){
            state.batteryPct = bVal[0];
            state.slots.scale.batteryPct = bVal[0];
          }
        }
      } catch(e){}

      const writeSvc = profile.writeServiceUuid || profile.serviceUuid;
      const writeChr = profile.writeUuid;
      sessions.scale = {
        gatt: gatt,
        profile: profile,
        writeSvc: writeSvc,
        writeChr: writeChr,
        intentional: false,
        markIntentional: function(){ intentional = true; this.intentional = true; }
      };

      const labelMap = {
        acaia:'Acaia Scale', difluid:'DiFluid Microbalance', bookoo:'Bookoo Themis',
        timemore:'Timemore Black Mirror', felicita:'Felicita Scale', decent:'Decent Scale',
        varia:'Varia AKU', skale:'Atomax Skale II', eureka:'Eureka Precisa',
        hiroia:'Hiroia Jimmy', sig:'BLE Weight Scale'
      };
      state.scaleConnected = true;
      state.scaleReconnecting = false;
      state.scaleBrand = profile.family;
      state.scaleName = gatt.name || transportDev.name || labelMap[profile.family] || 'Smart Scale';
      state.slots.scale = {
        connected: true,
        deviceId: gatt.deviceId,
        brand: profile.family,
        name: state.scaleName,
        batteryPct: state.batteryPct
      };
      state.lastStatusText = (isReconnect ? 'Reconnected to ' : 'Connected to ') + state.scaleName;

      rememberDevice({
        slot: 'scale',
        deviceId: gatt.deviceId,
        brand: profile.family,
        name: state.scaleName,
        transportKind: transport.kind
      });

      /* Brand Handshakes (serialized automatically by gatt.writeQueue!) */
      if (profile.family === 'acaia' && (writeChr || profile.altWriteUuid)){
        await writeScaleCommandSafe(gatt, profile, Codecs.commands.acaiaIdentify());
        await waitMs(120);
        await writeScaleCommandSafe(gatt, profile, Codecs.commands.acaiaNotificationRequest());

        /* Arm Lunar 2021 / Pyxis wake retries at 900ms & 2000ms if weight notifications haven't started yet */
        const scheduleAcaiaWakeRetry = function(delayMs, nextDelayMs){
          scaleWakeTimeout = setTimeout(function(){
            if (!state.scaleConnected || !sessions.scale || sessions.scale.gatt !== gatt || scaleReceivedWeightThisSession) return;
            writeScaleCommandSafe(gatt, profile, Codecs.commands.acaiaIdentify())
              .then(function(){ return waitMs(120); })
              .then(function(){
                if (!state.scaleConnected || !sessions.scale || sessions.scale.gatt !== gatt || scaleReceivedWeightThisSession) return;
                return writeScaleCommandSafe(gatt, profile, Codecs.commands.acaiaNotificationRequest());
              })
              .catch(function(){});
            if (nextDelayMs > 0 && !scaleReceivedWeightThisSession){
              scheduleAcaiaWakeRetry(nextDelayMs, 0);
            }
          }, delayMs);
        };
        if (!scaleReceivedWeightThisSession){
          scheduleAcaiaWakeRetry(900, 1100);
        }

        scaleHeartbeatIv = setInterval(function(){
          if (state.scaleConnected && sessions.scale && sessions.scale.gatt === gatt){
            writeScaleCommandSafe(gatt, profile, Codecs.commands.acaiaHeartbeat()).catch(function(){});
          }
        }, 2750);
      } else if (profile.family === 'difluid' && (writeChr || profile.altWriteUuid)){
        await writeScaleCommandSafe(gatt, profile, Codecs.commands.difluidScaleEnableAuto());
        await writeScaleCommandSafe(gatt, profile, Codecs.commands.difluidScaleSetGrams());
      } else if (profile.family === 'decent' && (writeChr || profile.altWriteUuid)){
        await writeScaleCommandSafe(gatt, profile, Codecs.commands.decentEnableGramsLed());
        await waitMs(60);
        await writeScaleCommandSafe(gatt, profile, Codecs.commands.decentEnableGramsLed());
        armDecentHeartbeatLoop(gatt, profile);
      } else if (profile.family === 'skale' && (writeChr || profile.altWriteUuid)){
        await writeScaleCommandSafe(gatt, profile, Codecs.commands.skaleLedOn());
        await writeScaleCommandSafe(gatt, profile, Codecs.commands.skaleEnableGrams());
        await writeScaleCommandSafe(gatt, profile, Codecs.commands.skaleDisplayWeight());
      }

      emit();
      return snapshotState();
    }

    async function connectScale(preferredBrandOrOpts){
      if (state.simulatorActive) stopSimulator();
      if (sessions.scale) await disconnectScale();
      const isObj = !!(preferredBrandOrOpts && typeof preferredBrandOrOpts === 'object');
      const acceptAll = isObj
        ? !!(preferredBrandOrOpts.acceptAll || preferredBrandOrOpts.acceptAllDevices)
        : (preferredBrandOrOpts === 'any' || preferredBrandOrOpts === 'acceptAll');
      const brandKey = typeof preferredBrandOrOpts === 'string'
        ? normalizeScaleBrand(preferredBrandOrOpts)
        : normalizeScaleBrand(isObj ? preferredBrandOrOpts.brand : 'auto');
      const query = buildScaleQuery(brandKey, { acceptAll:acceptAll });
      const dev = await getTransport().requestDevice(query);
      return establishScaleSession(dev, brandKey, false);
    }

    async function disconnectScale(){
      clearScaleTimers();
      state.scaleReconnecting = false;
      dropRecovery.active = false;
      if (sessions.scale){
        const s = sessions.scale;
        sessions.scale = null;
        s.markIntentional();
        try { await s.gatt.disconnect(); } catch(e){}
      }
      state.scaleConnected = false;
      state.slots.scale = { connected:false, deviceId:'', brand:'', name:'', batteryPct:null };
      if (!state.simulatorActive){
        state.scaleBrand = '';
        state.scaleName = '';
        state.weightG = 0;
        state.secondaryWeightG = null;
        state.flowRateGs = 0;
        state.stable = true;
        state.batteryPct = null;
      }
      state.lastStatusText = 'Scale disconnected.';
      resetFlowFilter();
      emit();
    }

    async function tare(){
      if (state.simulatorActive && simCtx){
        simCtx.tareOffsetG = simCtx.rawG;
        simCtx.awaitingPourAfterTare = true;
        simCtx.tareAtMs = Date.now();
        resetFlowFilter();
        state.weightG = 0;
        state.flowRateGs = 0;
        state.flowGs = 0;
        state.stable = true;
        state.stableFrames = 3;
        state.stableConfirmed = true;
        state.lastStatusText = 'Simulator tared to 0.0 g';
        emit();
        return true;
      }
      if (!state.scaleConnected || !sessions.scale) return false;

      softwareTareOffsetG = lastRawDeviceWeightG;
      tarePendingZeroCheck = true;
      resetFlowFilter();
      state.weightG = 0;
      state.flowRateGs = 0;
      state.stable = true;
      state.lastStatusText = 'Tared to 0.0 g';
      emit();

      const sess = sessions.scale;
      if (!sess.writeChr && !sess.profile.altWriteUuid) return true;
      const br = state.scaleBrand;
      const cmds = Codecs.commands;
      let pkt = null;
      if (br === 'acaia') pkt = cmds.acaiaTare();
      else if (br === 'difluid') pkt = cmds.difluidScaleTare();
      else if (br === 'bookoo') pkt = cmds.bookooTare();
      else if (br === 'felicita') pkt = cmds.felicitaTare();
      else if (br === 'decent'){ decentTareCounter = (decentTareCounter + 1) & 0xFF; pkt = cmds.decentTare(decentTareCounter); }
      else if (br === 'timemore') pkt = scaleTimemoreVariant === 'osp' ? cmds.timemoreOspTare() : cmds.timemoreClassicTare();
      else if (br === 'varia') pkt = cmds.variaTare();
      else if (br === 'skale') pkt = cmds.skaleTare();
      else if (br === 'eureka') pkt = cmds.eurekaTare();
      else if (br === 'hiroia') pkt = cmds.hiroiaTare();
      else if (br === 'sig') pkt = cmds.sigTare();

      if (!pkt) return true;
      return writeScaleCommandSafe(sess.gatt, sess.profile, pkt);
    }

    async function sendScaleTimerAction(actionKind){
      if (state.simulatorActive){
        state.lastStatusText = 'Simulator timer ' + actionKind;
        emit();
        return true;
      }
      if (!state.scaleConnected || !sessions.scale) return false;
      const sess = sessions.scale;
      if (!sess.writeChr && !sess.profile.altWriteUuid) return false;
      const br = state.scaleBrand;
      const cmds = Codecs.commands;
      let pkt = null;
      if (actionKind === 'start'){
        if (br === 'acaia') pkt = cmds.acaiaTimerStart();
        else if (br === 'difluid') pkt = cmds.difluidScaleTimerStart();
        else if (br === 'bookoo') pkt = cmds.bookooTimerStart();
        else if (br === 'timemore') pkt = scaleTimemoreVariant === 'osp' ? cmds.timemoreTimerStart() : cmds.timemoreClassicTimerStart();
        else if (br === 'felicita') pkt = cmds.felicitaTimerStart();
        else if (br === 'decent') pkt = cmds.decentTimerStart();
        else if (br === 'varia') pkt = cmds.variaTimerStart();
        else if (br === 'eureka') pkt = cmds.eurekaTimerStart();
        else if (br === 'hiroia') pkt = cmds.hiroiaTimerStart();
        else if (br === 'skale') pkt = cmds.skaleTimerStart();
      } else if (actionKind === 'stop'){
        if (br === 'acaia') pkt = cmds.acaiaTimerStop();
        else if (br === 'difluid') pkt = cmds.difluidScaleTimerStop();
        else if (br === 'bookoo') pkt = cmds.bookooTimerStop();
        else if (br === 'timemore') pkt = scaleTimemoreVariant === 'osp' ? cmds.timemoreTimerStop() : cmds.timemoreClassicTimerStop();
        else if (br === 'felicita') pkt = cmds.felicitaTimerStop();
        else if (br === 'decent') pkt = cmds.decentTimerStop();
        else if (br === 'varia') pkt = cmds.variaTimerStop();
        else if (br === 'eureka') pkt = cmds.eurekaTimerStop();
        else if (br === 'hiroia') pkt = cmds.hiroiaTimerStop();
        else if (br === 'skale') pkt = cmds.skaleTimerStop();
      } else if (actionKind === 'reset'){
        if (br === 'acaia') pkt = cmds.acaiaTimerReset();
        else if (br === 'difluid') pkt = cmds.difluidScaleTimerReset();
        else if (br === 'bookoo') pkt = cmds.bookooTimerReset();
        else if (br === 'timemore') pkt = scaleTimemoreVariant === 'osp' ? cmds.timemoreTimerReset() : cmds.timemoreClassicTimerReset();
        else if (br === 'felicita') pkt = cmds.felicitaTimerReset();
        else if (br === 'decent') pkt = cmds.decentTimerReset();
        else if (br === 'varia') pkt = cmds.variaTimerReset();
        else if (br === 'eureka') pkt = cmds.eurekaTimerReset();
        else if (br === 'hiroia') pkt = cmds.hiroiaTimerReset();
        else if (br === 'skale') pkt = cmds.skaleTimerReset();
      }
      if (!pkt) return false;
      state.lastStatusText = 'Scale timer ' + actionKind;
      emit();
      return writeScaleCommandSafe(sess.gatt, sess.profile, pkt);
    }

    function startTimer(){ return sendScaleTimerAction('start'); }
    function stopTimer(){ return sendScaleTimerAction('stop'); }
    function resetTimer(){ return sendScaleTimerAction('reset'); }

    /* ---------- Slot 2: Espresso Pressure Transducer (`Pressensor`, `ESS 0x181A` & `Bookoo EM`) ---------- */
    function handleDecodedPressureFrame(fr){
      if (!fr) return;
      if (fr.packetType === 'pressure'){
        pushPressureReading(fr.pressureBar, fr.pressureMbar, fr.tempC, fr.batteryPct);
      } else if (fr.packetType === 'temperature' && fr.tempC != null && Number.isFinite(fr.tempC)){
        state.pressureTempC = +fr.tempC.toFixed(1);
        emit();
        dispatchSafeEvent('bt-ble-pressure', {
          pressureBar: state.pressureBar,
          pressureMbar: state.pressureMbar,
          tempC: state.pressureTempC,
          peakPressureBar: state.peakPressureBar
        });
      }
    }

    async function establishPressureSession(transportDev){
      const optionalServices = mergeOptionalServices([
        UUID.PRESSENSOR_SVC, UUID.ESS_SVC, UUID.PRESSENSOR_SIG_SVC, UUID.BOOKOO_EM_SVC, UUID.BOOKOO_SVC, UUID.BATTERY_SVC
      ]);
      let intentional = false;
      const gatt = await getTransport().connectGatt(transportDev, function(){
        if (intentional) return;
        state.pressureConnected = false;
        state.slots.pressure.connected = false;
        state.lastStatusText = (state.pressureName || 'Pressure sensor') + ' disconnected.';
        emit();
      });
      const services = await gatt.discoverServices(optionalServices);
      const profile = Codecs.detectGattProfile(services, gatt.name || transportDev.name, 'pressure');
      if (!profile || !profile.notifyUuid){
        await gatt.disconnect();
        throw new Error('No supported espresso pressure GATT characteristic found (Pressensor / Bookoo EM / ESS 0x181A).');
      }

      state.peakPressureBar = 0;
      const stream = Codecs.streams.createCharacteristicStream(profile.family, {
        slot: 'pressure',
        deviceName: gatt.name || transportDev.name,
        serviceUuid: profile.serviceUuid,
        charUuid: profile.notifyUuid
      });

      await gatt.startNotifications(profile.serviceUuid, profile.notifyUuid, function(u8){
        recordRxTelemetry(u8, profile.serviceUuid, profile.notifyUuid);
        const res = stream.push(u8);
        for (let i = 0; i < res.frames.length; i++) handleDecodedPressureFrame(res.frames[i]);
      });

      if (Array.isArray(profile.extraNotifyUuids)){
        for (let ei = 0; ei < profile.extraNotifyUuids.length; ei++){
          const extraChr = profile.extraNotifyUuids[ei];
          const extraStream = Codecs.streams.createCharacteristicStream('pressensor', {
            slot: 'pressure',
            deviceName: gatt.name || transportDev.name,
            serviceUuid: profile.serviceUuid,
            charUuid: extraChr
          });
          try {
            await gatt.startNotifications(profile.serviceUuid, extraChr, function(u8){
              recordRxTelemetry(u8, profile.serviceUuid, extraChr);
              const eres = extraStream.push(u8);
              for (let k = 0; k < eres.frames.length; k++) handleDecodedPressureFrame(eres.frames[k]);
            });
          } catch(e){}
        }
      }

      if (Array.isArray(profile.extraNotifyTargets)){
        for (let ti = 0; ti < profile.extraNotifyTargets.length; ti++){
          const tgt = profile.extraNotifyTargets[ti];
          const tgtStream = Codecs.streams.createCharacteristicStream('pressensor', {
            slot: 'pressure',
            deviceName: gatt.name || transportDev.name,
            serviceUuid: tgt.serviceUuid,
            charUuid: tgt.charUuid
          });
          try {
            await gatt.startNotifications(tgt.serviceUuid, tgt.charUuid, function(u8){
              recordRxTelemetry(u8, tgt.serviceUuid, tgt.charUuid);
              const tres = tgtStream.push(u8);
              for (let m = 0; m < tres.frames.length; m++) handleDecodedPressureFrame(tres.frames[m]);
            });
          } catch(e){}
        }
      }

      /* Read optional 0x180F battery level */
      try {
        const hasBat = services.some(function(s){ return s.uuid === UUID.BATTERY_SVC; });
        if (hasBat){
          const bVal = await gatt.read(UUID.BATTERY_SVC, UUID.BATTERY_LEVEL);
          if (bVal.length >= 1 && bVal[0] <= 100){
            state.pressureBatteryPct = bVal[0];
            state.slots.pressure.batteryPct = bVal[0];
          }
        }
      } catch(e){}

      if (profile.family === 'bookoo_pressure' && profile.writeUuid){
        try { await gatt.write(profile.serviceUuid, profile.writeUuid, Codecs.commands.bookooPressureStartStream()); } catch(e){}
      }

      sessions.pressure = {
        gatt: gatt,
        profile: profile,
        markIntentional: function(){ intentional = true; }
      };
      state.pressureConnected = true;
      state.pressureBrand = profile.family;
      state.pressureName = gatt.name || transportDev.name || (profile.family === 'pressensor' ? 'Pressensor Profiler' : 'Bookoo Espresso Monitor');
      state.slots.pressure = {
        connected: true,
        deviceId: gatt.deviceId,
        brand: profile.family,
        name: state.pressureName,
        batteryPct: state.pressureBatteryPct
      };
      state.lastStatusText = 'Connected to ' + state.pressureName;
      rememberDevice({ slot:'pressure', deviceId:gatt.deviceId, brand:profile.family, name:state.pressureName });
      emit();
      return snapshotState();
    }

    async function connectPressure(opts){
      const o = opts || {};
      const acceptAll = !!(o.acceptAll || o.acceptAllDevices || opts === 'any');
      if (sessions.pressure) await disconnectPressure();
      const optionalServices = mergeOptionalServices([
        UUID.PRESSENSOR_SVC, UUID.ESS_SVC, UUID.PRESSENSOR_SIG_SVC, UUID.BOOKOO_EM_SVC, UUID.BOOKOO_SVC, UUID.BATTERY_SVC
      ]);
      const dev = await getTransport().requestDevice({
        slot: 'pressure',
        acceptAll: acceptAll,
        filters: acceptAll ? [] : dedupeDeviceFilters([
          { services:[UUID.PRESSENSOR_SVC] },
          { services:[UUID.ESS_SVC] },
          { services:[UUID.PRESSENSOR_SIG_SVC] },
          { services:[UUID.BOOKOO_EM_SVC] },
          { services:[UUID.BOOKOO_SVC] },
          { namePrefix:'PRS' },
          { namePrefix:'PSE' },
          { namePrefix:'SEP' },
          { namePrefix:'Pressensor' },
          { namePrefix:'pressensor' },
          { namePrefix:'Smart Espresso' },
          { namePrefix:'BOOKOO_EM' },
          { namePrefix:'Bookoo EM' },
          { namePrefix:'BOOKOO' },
          { namePrefix:'Bookoo' },
          { namePrefix:'bookoo' }
        ]),
        optionalServices: optionalServices
      });
      return establishPressureSession(dev);
    }

    async function disconnectPressure(){
      if (sessions.pressure){
        const s = sessions.pressure;
        sessions.pressure = null;
        s.markIntentional();
        try { await s.gatt.disconnect(); } catch(e){}
      }
      state.pressureConnected = false;
      state.slots.pressure = { connected:false, deviceId:'', brand:'', name:'', batteryPct:null };
      if (!state.simulatorActive){
        state.pressureBrand = '';
        state.pressureName = '';
        state.pressureBar = 0;
        state.pressureMbar = 0;
      }
      state.lastStatusText = 'Pressure transducer disconnected.';
      emit();
    }

    async function zeroPressure(){
      state.peakPressureBar = 0;
      if (sessions.pressure && sessions.pressure.profile.writeUuid){
        const p = sessions.pressure.profile;
        const cmd = p.family === 'pressensor' ? Codecs.commands.pressensorZero() : Codecs.commands.bookooPressureZero();
        return sessions.pressure.gatt.write(p.serviceUuid, p.writeUuid, cmd);
      }
      state.pressureBar = 0;
      state.pressureMbar = 0;
      emit();
      return true;
    }

    /* ---------- Slot 3: DiFluid R2 Extract Refractometer ---------- */
    function recordR2InApiCache(tds, tempC, brix, refractiveIndex, readCount){
      try {
        if (global.BTDiFluidApi && typeof global.BTDiFluidApi._pushLiveRecord === 'function'){
          global.BTDiFluidApi._pushLiveRecord('r2', {
            kind: 'r2',
            id: 'r2-live-' + Date.now(),
            timestamp: new Date().toISOString(),
            beanName: (global.app && global.app.coffee && global.app.coffee.name) || '',
            tds: tds,
            brix: brix,
            refractiveIndex: refractiveIndex != null ? refractiveIndex : null,
            tempC: tempC != null ? tempC : null,
            readCount: readCount || 1,
            doseG: null,
            waterG: null,
            yieldG: null,
            eyPct: null
          });
        }
      } catch(e){}
    }

    const R2_OPTIONAL_SERVICES = [
      UUID.DIFLUID_SVC,
      UUID.DIFLUID_V3_SVC,
      UUID.DIFLUID_SCALE_SVC,
      UUID.DIFLUID_SCALE_ALT_SVC,
      UUID.FELICITA_SVC,
      UUID.SHARED_FFF0_SVC,
      UUID.NUS_SVC,
      UUID.DIFLUID_OMNI_SVC,
      UUID.BATTERY_SVC
    ];

    function handleRefractometerFrame(d){
      if (!d) return;
      if (d.slot === 'omni'){
        handleOmniFrame(d);
        return;
      }
      if (d.packetType === 'battery' && d.batteryPct != null){
        state.refractometerBatteryPct = d.batteryPct;
        state.slots.refractometer.batteryPct = d.batteryPct;
        emit();
      } else if (d.packetType === 'status'){
        if (d.statusText === 'measuring') state.lastStatusText = 'DiFluid R2 measuring sample...';
        else if (d.statusText === 'error_no_liquid') state.lastStatusText = 'DiFluid R2 prism dry - add 2-3 filtered drops.';
        else if (d.statusText === 'error_out_of_range') state.lastStatusText = 'DiFluid R2 sample out of optical range.';
        else if (d.statusText === 'error_temp_out_of_range') state.lastStatusText = 'DiFluid R2 sample temperature out of range.';
        else if (d.statusText === 'auto_ready') state.lastStatusText = 'DiFluid R2 Auto-Test armed - drop sample onto prism.';
        emit();
      } else if (d.packetType === 'temperature'){
        state.lastTempC = d.tempC;
        emit();
      } else if (d.packetType === 'refractive_index'){
        state.lastRefractiveIndex = d.refractiveIndex;
        emit();
      } else if (d.packetType === 'result' || d.packetType === 'average_result'){
        state.lastTds = d.tds;
        state.lastBrix = d.brix;
        state.lastRefractiveIndex = d.refractiveIndex;
        state.lastR2ReadCount = d.readCount || 1;
        state.lastR2AtMs = Date.now();
        state.lastStatusText = 'DiFluid R2' + (d.isAverage ? ' Avg(' + state.lastR2ReadCount + ')' : '') + ': ' +
          d.tds.toFixed(2) + '% TDS' + (state.lastTempC != null ? ' @ ' + state.lastTempC.toFixed(1) + 'C' : '');
        recordR2InApiCache(d.tds, state.lastTempC, d.brix, d.refractiveIndex, state.lastR2ReadCount);
        attachR2Reading({
          tds: d.tds,
          tempC: state.lastTempC,
          brix: d.brix,
          refractiveIndex: d.refractiveIndex
        }, { suppressEmit:true });
        emit();
        dispatchSafeEvent('bt-ble-refractometer', {
          tds: d.tds,
          tempC: state.lastTempC,
          brix: d.brix,
          refractiveIndex: d.refractiveIndex,
          isAverage: !!d.isAverage,
          readCount: state.lastR2ReadCount,
          autoRead: !!d.autoRead
        });
      }
    }

    async function writeR2CommandSafe(gatt, profile, cmdBytes){
      if (!gatt || !profile || !cmdBytes) return false;
      const primaryChr = profile.writeUuid;
      const altChr = profile.altWriteUuid;
      if (primaryChr){
        try {
          const ok = await gatt.write(profile.serviceUuid, primaryChr, cmdBytes);
          if (ok) return true;
        } catch(e){}
      }
      if (altChr && altChr !== primaryChr){
        try {
          const okAlt = await gatt.write(profile.serviceUuid, altChr, cmdBytes);
          if (okAlt) return true;
        } catch(e){}
      }
      return false;
    }

    async function establishRefractometerSession(transportDev){
      const optionalServices = mergeOptionalServices(R2_OPTIONAL_SERVICES);
      let intentional = false;
      const gatt = await getTransport().connectGatt(transportDev, function(){
        if (intentional) return;
        state.refractometerConnected = false;
        state.slots.refractometer.connected = false;
        state.lastStatusText = 'DiFluid R2 disconnected.';
        emit();
      });
      const services = await gatt.discoverServices(optionalServices);
      const profile = Codecs.detectGattProfile(services, gatt.name || transportDev.name, 'refractometer');
      if (!profile || !profile.notifyUuid){
        await gatt.disconnect();
        throw new Error('DiFluid R2 GATT service (0x00FF / 0x00EE / 0xFFE0 / 0xFFF0) not found on selected device.');
      }

      const stream = Codecs.streams.createCharacteristicStream('difluid_r2', {
        slot: 'refractometer',
        deviceName: gatt.name || transportDev.name,
        serviceUuid: profile.serviceUuid,
        charUuid: profile.notifyUuid
      });

      await gatt.startNotifications(profile.serviceUuid, profile.notifyUuid, function(u8){
        recordRxTelemetry(u8, profile.serviceUuid, profile.notifyUuid);
        const res = stream.push(u8);
        for (let i = 0; i < res.frames.length; i++){
          handleRefractometerFrame(res.frames[i]);
        }
      });

      /* Subscribe to all secondary notify/indicate characteristics on R2 (e.g. 0xAA02 alongside 0xAA01, or 0xFFF2/0xFFE2) */
      if (Array.isArray(profile.extraNotifyUuids)){
        for (let ei = 0; ei < profile.extraNotifyUuids.length; ei++){
          const extraUuid = profile.extraNotifyUuids[ei];
          const extraStream = Codecs.streams.createCharacteristicStream('difluid_r2', {
            slot: 'refractometer',
            deviceName: gatt.name || transportDev.name,
            serviceUuid: profile.serviceUuid,
            charUuid: extraUuid
          });
          try {
            await gatt.startNotifications(profile.serviceUuid, extraUuid, function(u8){
              recordRxTelemetry(u8, profile.serviceUuid, extraUuid);
              const eres = extraStream.push(u8);
              for (let k = 0; k < eres.frames.length; k++) handleRefractometerFrame(eres.frames[k]);
            });
          } catch(e){}
        }
      }

      if (Array.isArray(profile.extraNotifyTargets)){
        for (let ti = 0; ti < profile.extraNotifyTargets.length; ti++){
          const tgt = profile.extraNotifyTargets[ti];
          const tgtStream = Codecs.streams.createCharacteristicStream('difluid_r2', {
            slot: 'refractometer',
            deviceName: gatt.name || transportDev.name,
            serviceUuid: tgt.serviceUuid,
            charUuid: tgt.charUuid
          });
          try {
            await gatt.startNotifications(tgt.serviceUuid, tgt.charUuid, function(u8){
              recordRxTelemetry(u8, tgt.serviceUuid, tgt.charUuid);
              const tres = tgtStream.push(u8);
              for (let m = 0; m < tres.frames.length; m++) handleRefractometerFrame(tres.frames[m]);
            });
          } catch(e){}
        }
      }

      /* Read optional 0x180F battery level */
      try {
        const hasBat = services.some(function(s){ return s.uuid === UUID.BATTERY_SVC; });
        if (hasBat){
          const bVal = await gatt.read(UUID.BATTERY_SVC, UUID.BATTERY_LEVEL);
          if (bVal.length >= 1 && bVal[0] <= 100){
            state.refractometerBatteryPct = bVal[0];
            state.slots.refractometer.batteryPct = bVal[0];
          }
        }
      } catch(e){}

      sessions.refractometer = {
        gatt: gatt,
        profile: profile,
        markIntentional: function(){ intentional = true; }
      };
      state.refractometerConnected = true;
      state.refractometerName = gatt.name || transportDev.name || 'DiFluid R2 Extract';
      state.slots.refractometer = {
        connected: true,
        deviceId: gatt.deviceId,
        brand: 'difluid_r2',
        name: state.refractometerName,
        batteryPct: state.refractometerBatteryPct
      };
      state.lastStatusText = 'Connected to ' + state.refractometerName + ' (Auto-Sync Active)';

      /* Post-Connect Auto-Notification Handshake: Set Celsius + Enable Automatic Physical-Button / Auto-Test BLE Push! */
      if (profile.writeUuid || profile.altWriteUuid){
        try { await writeR2CommandSafe(gatt, profile, Codecs.commands.difluidSetCelsius()); } catch(e){}
        if (typeof Codecs.commands.difluidR2EnableAutoNotifications === 'function'){
          try { await writeR2CommandSafe(gatt, profile, Codecs.commands.difluidR2EnableAutoNotifications()); } catch(e){}
        }
      }
      rememberDevice({ slot:'refractometer', deviceId:gatt.deviceId, brand:'difluid_r2', name:state.refractometerName });
      emit();
      return snapshotState();
    }

    async function connectRefractometer(opts){
      const o = opts || {};
      const acceptAll = !!(o.acceptAll || o.acceptAllDevices || opts === 'any');
      if (sessions.refractometer) await disconnectRefractometer();
      const dev = await getTransport().requestDevice({
        slot: 'refractometer',
        acceptAll: acceptAll,
        filters: acceptAll ? [] : dedupeDeviceFilters([
          { services:[UUID.DIFLUID_SVC] },
          { services:[UUID.DIFLUID_V3_SVC] },
          { services:[UUID.DIFLUID_SCALE_SVC] },
          { services:[UUID.DIFLUID_SCALE_ALT_SVC] },
          { services:[UUID.FELICITA_SVC] },
          { services:[UUID.SHARED_FFF0_SVC] },
          { namePrefix:'DiFluid' },
          { namePrefix:'DIFLUID' },
          { namePrefix:'difluid' },
          { namePrefix:'R2' },
          { namePrefix:'Extract' },
          { namePrefix:'DFT-R' },
          { namePrefix:'DF' }
        ]),
        optionalServices: mergeOptionalServices(R2_OPTIONAL_SERVICES)
      });
      return establishRefractometerSession(dev);
    }

    async function disconnectRefractometer(){
      if (sessions.refractometer){
        const s = sessions.refractometer;
        sessions.refractometer = null;
        s.markIntentional();
        try { await s.gatt.disconnect(); } catch(e){}
      }
      state.refractometerConnected = false;
      state.refractometerName = '';
      state.slots.refractometer = { connected:false, deviceId:'', brand:'', name:'', batteryPct:null };
      state.lastStatusText = 'DiFluid R2 disconnected.';
      emit();
    }

    async function triggerRefractometerRead(opts){
      const o = opts || {};
      if (state.refractometerConnected && sessions.refractometer && (sessions.refractometer.profile.writeUuid || sessions.refractometer.profile.altWriteUuid)){
        const p = sessions.refractometer.profile;
        const cmd = o.averageCount && +o.averageCount >= 2
          ? Codecs.commands.difluidTriggerMultiAverage(+o.averageCount)
          : Codecs.commands.difluidTriggerSingle();
        state.lastStatusText = 'Requesting DiFluid R2 optical read...';
        emit();
        return writeR2CommandSafe(sessions.refractometer.gatt, p, cmd);
      }
      if (state.simulatorActive){
        simulateRefractometerRead(o);
        return true;
      }
      return false;
    }

    function simulateRefractometerRead(opts){
      const o = opts || {};
      const appRef = getLiveApp();
      const isEsp = o.espresso === true || !!(appRef && appRef.brew && (appRef.brew.method === 'espresso' || appRef.brew.method === 'lever_espresso'));
      const baseTds = (o.tds != null && +o.tds > 0) ? +o.tds : (isEsp ? 9.42 : 1.42);
      const tds = +(Math.max(0.1, Math.min(24, baseTds)).toFixed(2));
      const tempC = (o.tempC != null && Number.isFinite(+o.tempC)) ? +(+o.tempC).toFixed(1) : 24.5;
      const brix = +(tds / 0.85).toFixed(2);
      const refractiveIndex = +(1.33299 + tds * 0.001585).toFixed(5);

      state.lastTempC = tempC;
      state.lastTds = tds;
      state.lastBrix = brix;
      state.lastRefractiveIndex = refractiveIndex;
      state.lastR2ReadCount = o.readCount || 1;
      state.lastR2AtMs = Date.now();
      state.lastStatusText = 'Simulated R2 Read: ' + tds.toFixed(2) + '% TDS @ ' + tempC.toFixed(1) + 'C';
      recordR2InApiCache(tds, tempC, brix, refractiveIndex, state.lastR2ReadCount);
      const attachRes = attachR2Reading(
        { tds:tds, tempC:tempC, brix:brix, refractiveIndex:refractiveIndex },
        { suppressEmit:true, timestampMs:o.timestampMs, forceAttach:o.forceAttach }
      );
      emit();
      dispatchSafeEvent('bt-ble-refractometer', {
        tds: tds,
        tempC: tempC,
        brix: brix,
        refractiveIndex: refractiveIndex,
        simulated: true,
        autoAttached: attachRes.attached
      });
      return {
        tds: tds,
        tempC: tempC,
        brix: brix,
        refractiveIndex: refractiveIndex,
        autoAttached: attachRes.attached,
        eyPct: attachRes.r2Reading ? attachRes.r2Reading.eyPct : null
      };
    }

    /* ---------- Slot 4: DiFluid Omni Roast & Particle Analyzer ---------- */
    function handleOmniFrame(om){
      if (!om) return;
      if (om.packetType === 'battery' && om.batteryPct != null){
        state.omniBatteryPct = om.batteryPct;
        state.slots.omni.batteryPct = om.batteryPct;
        emit();
        return;
      }
      if (om.packetType === 'ack'){
        return;
      }
      const gAg = om.groundAgtron != null ? om.groundAgtron : om.agtron;
      const sw = gAg != null ? Codecs.agtronToRoastSwatch(gAg, 'ground') : null;
      const merged = Object.assign({
        kind: 'omni',
        id: 'omni-ble-' + Date.now(),
        timestamp: new Date().toISOString(),
        deviceModel: state.omniName || 'DiFluid Omni (DFT-SD101)',
        beanName: (global.app && global.app.coffee && global.app.coffee.name) || ''
      }, state.lastOmni || {}, om, sw ? { suggestedRoast:sw.roast, roastKey:sw.roastKey } : {});

      state.lastOmni = merged;
      try {
        if (global.BTDiFluidApi && typeof global.BTDiFluidApi._pushLiveRecord === 'function'){
          global.BTDiFluidApi._pushLiveRecord('omni', merged);
        }
      } catch(e){}
      dispatchSafeEvent('bt-ble-omni', merged);

      state.lastStatusText = om.packetType === 'agtron'
        ? ('Omni Agtron ' + om.agtron + (om.roastDelta != null ? ' (Delta ' + om.roastDelta + ')' : ''))
        : om.packetType === 'psd'
          ? ('Omni PSD D50 ' + om.d50Um + ' um (Span ' + om.span + ')')
          : ('Omni Histogram (' + (om.binCount || (om.bins ? om.bins.length : 0)) + ' bins)');
      emit();
    }

    async function establishOmniSession(transportDev){
      const optionalServices = mergeOptionalServices([
        UUID.DIFLUID_OMNI_SVC, UUID.DIFLUID_SVC, UUID.DIFLUID_V3_SVC,
        UUID.DIFLUID_SCALE_SVC, UUID.DIFLUID_SCALE_ALT_SVC, UUID.FELICITA_SVC,
        UUID.SHARED_FFF0_SVC, UUID.NUS_SVC, UUID.BATTERY_SVC
      ]);
      let intentional = false;
      const gatt = await getTransport().connectGatt(transportDev, function(){
        if (intentional) return;
        state.omniConnected = false;
        state.slots.omni.connected = false;
        state.lastStatusText = 'DiFluid Omni disconnected.';
        emit();
      });
      const services = await gatt.discoverServices(optionalServices);
      const profile = Codecs.detectGattProfile(services, gatt.name || transportDev.name, 'omni');
      if (!profile || !profile.notifyUuid){
        await gatt.disconnect();
        throw new Error('DiFluid Omni service (0x00FC / 0x00FF / 0e140001) not found on selected device.');
      }

      const stream = Codecs.streams.createCharacteristicStream('difluid_omni', {
        slot: 'omni',
        deviceName: gatt.name || transportDev.name,
        serviceUuid: profile.serviceUuid,
        charUuid: profile.notifyUuid
      });

      await gatt.startNotifications(profile.serviceUuid, profile.notifyUuid, function(u8){
        recordRxTelemetry(u8, profile.serviceUuid, profile.notifyUuid);
        const res = stream.push(u8);
        for (let i = 0; i < res.frames.length; i++) handleOmniFrame(res.frames[i]);
      });

      if (Array.isArray(profile.extraNotifyUuids)){
        for (let ei = 0; ei < profile.extraNotifyUuids.length; ei++){
          const extraUuid = profile.extraNotifyUuids[ei];
          const extraStream = Codecs.streams.createCharacteristicStream('difluid_omni', {
            slot: 'omni',
            deviceName: gatt.name || transportDev.name,
            serviceUuid: profile.serviceUuid,
            charUuid: extraUuid
          });
          try {
            await gatt.startNotifications(profile.serviceUuid, extraUuid, function(u8){
              recordRxTelemetry(u8, profile.serviceUuid, extraUuid);
              const eres = extraStream.push(u8);
              for (let k = 0; k < eres.frames.length; k++) handleOmniFrame(eres.frames[k]);
            });
          } catch(e){}
        }
      }

      if (Array.isArray(profile.extraNotifyTargets)){
        for (let ti = 0; ti < profile.extraNotifyTargets.length; ti++){
          const tgt = profile.extraNotifyTargets[ti];
          const tgtStream = Codecs.streams.createCharacteristicStream('difluid_omni', {
            slot: 'omni',
            deviceName: gatt.name || transportDev.name,
            serviceUuid: tgt.serviceUuid,
            charUuid: tgt.charUuid
          });
          try {
            await gatt.startNotifications(tgt.serviceUuid, tgt.charUuid, function(u8){
              recordRxTelemetry(u8, tgt.serviceUuid, tgt.charUuid);
              const tres = tgtStream.push(u8);
              for (let m = 0; m < tres.frames.length; m++) handleOmniFrame(tres.frames[m]);
            });
          } catch(e){}
        }
      }

      /* Read optional 0x180F battery level */
      try {
        const hasBat = services.some(function(s){ return s.uuid === UUID.BATTERY_SVC; });
        if (hasBat){
          const bVal = await gatt.read(UUID.BATTERY_SVC, UUID.BATTERY_LEVEL);
          if (bVal.length >= 1 && bVal[0] <= 100){
            state.omniBatteryPct = bVal[0];
            state.slots.omni.batteryPct = bVal[0];
          }
        }
      } catch(e){}

      sessions.omni = {
        gatt: gatt,
        profile: profile,
        markIntentional: function(){ intentional = true; }
      };
      state.omniConnected = true;
      state.omniName = gatt.name || transportDev.name || 'DiFluid Omni';
      state.slots.omni = {
        connected: true,
        deviceId: gatt.deviceId,
        brand: 'difluid_omni',
        name: state.omniName,
        batteryPct: state.omniBatteryPct
      };
      state.lastStatusText = 'Connected to ' + state.omniName + ' (Auto-Sync Active)';
      if (profile.writeUuid || profile.altWriteUuid){
        try { await writeR2CommandSafe(gatt, profile, Codecs.commands.difluidSetCelsius()); } catch(e){}
        try { await writeR2CommandSafe(gatt, profile, Codecs.commands.difluidR2EnableAutoNotifications()); } catch(e){}
      }
      rememberDevice({ slot:'omni', deviceId:gatt.deviceId, brand:'difluid_omni', name:state.omniName });
      emit();
      return snapshotState();
    }

    async function connectOmni(opts){
      const o = opts || {};
      const acceptAll = !!(o.acceptAll || o.acceptAllDevices || opts === 'any');
      if (sessions.omni) await disconnectOmni();
      const optionalServices = mergeOptionalServices([
        UUID.DIFLUID_OMNI_SVC, UUID.DIFLUID_SVC, UUID.DIFLUID_V3_SVC,
        UUID.DIFLUID_SCALE_SVC, UUID.DIFLUID_SCALE_ALT_SVC, UUID.FELICITA_SVC,
        UUID.SHARED_FFF0_SVC, UUID.NUS_SVC, UUID.BATTERY_SVC
      ]);
      const dev = await getTransport().requestDevice({
        slot: 'omni',
        acceptAll: acceptAll,
        filters: acceptAll ? [] : dedupeDeviceFilters([
          { services:[UUID.DIFLUID_OMNI_SVC] },
          { services:[UUID.DIFLUID_SVC] },
          { services:[UUID.DIFLUID_V3_SVC] },
          { services:[UUID.DIFLUID_SCALE_SVC] },
          { services:[UUID.DIFLUID_SCALE_ALT_SVC] },
          { namePrefix:'Omni' },
          { namePrefix:'OMNI' },
          { namePrefix:'DiFluid Omni' },
          { namePrefix:'DiFluid' },
          { namePrefix:'DIFLUID' },
          { namePrefix:'DFT-SD' },
          { namePrefix:'DF' }
        ]),
        optionalServices: optionalServices
      });
      return establishOmniSession(dev);
    }

    async function disconnectOmni(){
      if (sessions.omni){
        const s = sessions.omni;
        sessions.omni = null;
        s.markIntentional();
        try { await s.gatt.disconnect(); } catch(e){}
      }
      state.omniConnected = false;
      state.omniName = '';
      state.slots.omni = { connected:false, deviceId:'', brand:'', name:'', batteryPct:null };
      state.lastStatusText = 'DiFluid Omni disconnected.';
      emit();
    }

    async function triggerOmniRead(preset){
      const modeStr = typeof preset === 'string'
        ? preset.toLowerCase()
        : (preset && typeof preset === 'object' ? String(preset.mode || preset.preset || '').toLowerCase() : '');
      if (state.omniConnected && sessions.omni && (sessions.omni.profile.writeUuid || sessions.omni.profile.altWriteUuid)){
        const p = sessions.omni.profile;
        state.lastStatusText = modeStr === 'psd'
          ? 'Requesting DiFluid Omni Grind PSD scan...'
          : 'Requesting DiFluid Omni NIR + PSD scan...';
        emit();
        const okTrig = await writeR2CommandSafe(sessions.omni.gatt, p, Codecs.commands.difluidOmniTrigger());
        if (modeStr === 'psd' || modeStr === 'histogram'){
          try { await writeR2CommandSafe(sessions.omni.gatt, p, Codecs.commands.difluidOmniRequestHistogram()); } catch(e){}
        }
        return okTrig;
      }
      if (state.simulatorActive || preset != null){
        const simPreset = typeof preset === 'string'
          ? preset
          : (preset && typeof preset === 'object' && preset.preset ? preset.preset : 'filter_light');
        return simulateOmniRead(simPreset);
      }
      return false;
    }

    function simulateOmniRead(preset){
      if (global.BTDiFluidApi && typeof global.BTDiFluidApi.simulateOmniRead === 'function'){
        const rec = global.BTDiFluidApi.simulateOmniRead(preset);
        state.lastOmni = rec;
        state.lastStatusText = 'Simulated Omni: Agtron ' + rec.agtron + ' / D50 ' + rec.d50Um + ' um';
        emit();
        return rec;
      }
      return null;
    }

    /* ---------- Slot 5: Smart Brewer & Kettle (`xBloom` & `Fellow Stagg EKG+`) ---------- */
    async function disconnectMachineSlot(){
      if (sessions.machine){
        const s = sessions.machine;
        sessions.machine = null;
        s.markIntentional();
        try { await s.gatt.disconnect(); } catch(e){}
      }
      state.machineConnected = false;
      state.xbloomConnected = false;
      state.xbloomName = '';
      state.kettleConnected = false;
      state.kettleName = '';
      state.slots.machine = { connected:false, deviceId:'', brand:'', name:'', batteryPct:null };
      emit();
    }

    async function establishXBloomSession(transportDev){
      const optionalServices = mergeOptionalServices([UUID.XBLOOM_SVC, UUID.XBLOOM_SHORT_SVC, UUID.BATTERY_SVC]);
      let intentional = false;
      const gatt = await getTransport().connectGatt(transportDev, function(){
        if (intentional) return;
        state.machineConnected = false;
        state.xbloomConnected = false;
        state.slots.machine.connected = false;
        state.lastStatusText = 'xBloom disconnected.';
        emit();
      });
      const services = await gatt.discoverServices(optionalServices);
      const profile = Codecs.detectGattProfile(services, gatt.name || transportDev.name || 'xBloom', 'machine');
      if (!profile || !profile.writeUuid){
        await gatt.disconnect();
        throw new Error('xBloom BLE write characteristic (FFE1) not found - close official xBloom app first.');
      }

      const handleXBloomRx = function(u8, chrUuid, streamObj){
        recordRxTelemetry(u8, profile.serviceUuid, chrUuid);
        const res = streamObj.push(u8);
        for (let i = 0; i < res.frames.length; i++){
          const xf = res.frames[i];
          if (xf.stage) state.xbloomStage = xf.stage;
          if (xf.weightG != null) state.xbloomWeightG = xf.weightG;
          if (xf.tempC != null) state.xbloomTempC = xf.tempC;
          emit();
        }
        dispatchSafeEvent('bt-ble-xbloom', { bytes:Array.from(u8), frames:res.frames });
      };

      if (profile.notifyUuid){
        const xbPrimaryStream = Codecs.streams.createCharacteristicStream('xbloom', {
          slot: 'machine',
          deviceName: gatt.name || transportDev.name,
          serviceUuid: profile.serviceUuid,
          charUuid: profile.notifyUuid
        });
        try {
          await gatt.startNotifications(profile.serviceUuid, profile.notifyUuid, function(u8){
            handleXBloomRx(u8, profile.notifyUuid, xbPrimaryStream);
          });
        } catch(e){}
      }
      if (Array.isArray(profile.extraNotifyUuids)){
        for (let xi = 0; xi < profile.extraNotifyUuids.length; xi++){
          const xExtra = profile.extraNotifyUuids[xi];
          const xbExtraStream = Codecs.streams.createCharacteristicStream('xbloom', {
            slot: 'machine',
            deviceName: gatt.name || transportDev.name,
            serviceUuid: profile.serviceUuid,
            charUuid: xExtra
          });
          try {
            await gatt.startNotifications(profile.serviceUuid, xExtra, function(u8){
              handleXBloomRx(u8, xExtra, xbExtraStream);
            });
          } catch(e){}
        }
      }

      sessions.machine = {
        kind: 'xbloom',
        gatt: gatt,
        profile: profile,
        markIntentional: function(){ intentional = true; }
      };
      state.machineConnected = true;
      state.xbloomConnected = true;
      state.kettleConnected = false;
      state.xbloomName = gatt.name || transportDev.name || 'xBloom Studio';
      state.slots.machine = { connected:true, deviceId:gatt.deviceId, brand:'xbloom', name:state.xbloomName, batteryPct:null };
      state.lastStatusText = 'Connected to ' + state.xbloomName;
      rememberDevice({ slot:'machine', deviceId:gatt.deviceId, brand:'xbloom', name:state.xbloomName });
      emit();
      return snapshotState();
    }

    async function connectXBloom(opts){
      const o = opts || {};
      const acceptAll = !!(o.acceptAll || o.acceptAllDevices || opts === 'any');
      if (sessions.machine) await disconnectMachineSlot();
      const dev = await getTransport().requestDevice({
        slot: 'machine',
        acceptAll: acceptAll,
        filters: acceptAll ? [] : dedupeDeviceFilters([
          { services:[UUID.XBLOOM_SVC] },
          { services:[UUID.XBLOOM_SHORT_SVC] },
          { namePrefix:'xBloom' },
          { namePrefix:'XBloom' },
          { namePrefix:'XBLOOM' },
          { namePrefix:'xbloom' },
          { namePrefix:'TBDx' },
          { namePrefix:'tbdx' }
        ]),
        optionalServices: mergeOptionalServices([UUID.XBLOOM_SVC, UUID.XBLOOM_SHORT_SVC, UUID.BATTERY_SVC])
      });
      return establishXBloomSession(dev);
    }

    async function disconnectXBloom(){
      await disconnectMachineSlot();
      state.lastStatusText = 'xBloom disconnected.';
      emit();
    }

    async function sendXBloomRecipe(profile, opts){
      const payload = Codecs.commands.encodeXBloomRecipePayload(profile, opts);
      const isPreGround = payload[2] === 0x44;
      if (!state.xbloomConnected || !sessions.machine || sessions.machine.kind !== 'xbloom'){
        if (state.simulatorActive){
          state.lastStatusText = 'Simulated xBloom recipe upload (' + payload.length + ' B, ' + (isPreGround ? '0x44/0xFE Pre-Ground Grinder OFF' : '0x41 Whole-Bean Grinder ON') + ').';
          emit();
          return { ok:true, simulated:true, preGroundSafe:isPreGround, opcode:payload[2], grindByte:payload[6], bytes:payload.length, payload:payload };
        }
        await connectXBloom();
      }
      const sess = sessions.machine;
      const chunkMax = 180;
      let ok = true;
      for (let off = 0; off < payload.length; off += chunkMax){
        const chunk = payload.subarray(off, Math.min(payload.length, off + chunkMax));
        const chunkOk = await sess.gatt.write(sess.profile.serviceUuid, sess.profile.writeUuid, chunk, { withoutResponse:true });
        if (!chunkOk){ ok = false; break; }
      }
      state.lastStatusText = ok
        ? ('Uploaded recipe to ' + (state.xbloomName || 'xBloom') + ' (' + payload.length + ' B, ' + (isPreGround ? 'Grinder OFF 0x44' : 'Whole-Bean 0x41') + ').')
        : 'xBloom BLE recipe upload failed - close official phone app and retry.';
      emit();
      return { ok:ok, simulated:false, preGroundSafe:isPreGround, opcode:payload[2], grindByte:payload[6], bytes:payload.length, payload:payload };
    }

    async function connectKettleWithDevice(transportDev){
      const optionalServices = mergeOptionalServices([UUID.STAGG_EKG_SVC, UUID.BATTERY_SVC]);
      let intentional = false;
      const gatt = await getTransport().connectGatt(transportDev, function(){
        if (intentional) return;
        state.machineConnected = false;
        state.kettleConnected = false;
        state.slots.machine.connected = false;
        state.lastStatusText = 'Fellow Stagg EKG+ disconnected.';
        emit();
      });
      const services = await gatt.discoverServices(optionalServices);
      const profile = Codecs.detectGattProfile(services, gatt.name || transportDev.name || 'Stagg EKG+', 'kettle');
      if (!profile || !profile.notifyUuid){
        await gatt.disconnect();
        throw new Error('Fellow Stagg EKG+ service (0x1820 / 0x2A80) not found.');
      }

      const handleKettleFrames = function(frames){
        for (let i = 0; i < frames.length; i++){
          const fr = frames[i];
          if (fr.packetType === 'kettle'){
            if (fr.tempC != null && Number.isFinite(fr.tempC)) state.kettleTempC = fr.tempC;
            if (fr.targetTempC != null && Number.isFinite(fr.targetTempC)) state.kettleTargetTempC = fr.targetTempC;
            if (fr.hold !== undefined && fr.hold !== null) state.kettleHold = !!fr.hold;
            if (fr.power !== undefined && fr.power !== null) state.kettlePower = !!fr.power;
            if (fr.heating !== undefined && fr.heating !== null) state.kettleHeating = !!fr.heating;
            emit();
            dispatchSafeEvent('bt-ble-kettle', fr);
          }
        }
      };

      const stream = Codecs.streams.createCharacteristicStream('stagg_ekg_plus', {
        slot: 'machine',
        deviceName: gatt.name || transportDev.name || 'Stagg EKG+',
        serviceUuid: profile.serviceUuid,
        charUuid: profile.notifyUuid
      });

      await gatt.startNotifications(profile.serviceUuid, profile.notifyUuid, function(u8){
        recordRxTelemetry(u8, profile.serviceUuid, profile.notifyUuid);
        const res = stream.push(u8);
        handleKettleFrames(res.frames);
      });

      if (Array.isArray(profile.extraNotifyUuids)){
        for (let ki = 0; ki < profile.extraNotifyUuids.length; ki++){
          const kExtra = profile.extraNotifyUuids[ki];
          const kExtraStream = Codecs.streams.createCharacteristicStream('stagg_ekg_plus', {
            slot: 'machine',
            deviceName: gatt.name || transportDev.name || 'Stagg EKG+',
            serviceUuid: profile.serviceUuid,
            charUuid: kExtra
          });
          try {
            await gatt.startNotifications(profile.serviceUuid, kExtra, function(u8){
              recordRxTelemetry(u8, profile.serviceUuid, kExtra);
              const kres = kExtraStream.push(u8);
              handleKettleFrames(kres.frames);
            });
          } catch(e){}
        }
      }

      if (profile.writeUuid || profile.altWriteUuid){
        try { await writeR2CommandSafe(gatt, profile, Codecs.commands.staggAuth()); } catch(e){}
      }

      sessions.machine = {
        kind: 'stagg_ekg_plus',
        gatt: gatt,
        profile: profile,
        markIntentional: function(){ intentional = true; }
      };
      state.machineConnected = true;
      state.kettleConnected = true;
      state.xbloomConnected = false;
      state.kettleName = gatt.name || transportDev.name || 'Fellow Stagg EKG+';
      state.slots.machine = { connected:true, deviceId:gatt.deviceId, brand:'stagg_ekg_plus', name:state.kettleName, batteryPct:null };
      state.lastStatusText = 'Connected to ' + state.kettleName;
      rememberDevice({ slot:'machine', deviceId:gatt.deviceId, brand:'stagg_ekg_plus', name:state.kettleName });
      emit();
      return snapshotState();
    }

    async function connectKettle(opts){
      const o = opts || {};
      const acceptAll = !!(o.acceptAll || o.acceptAllDevices || opts === 'any');
      if (sessions.machine) await disconnectMachineSlot();
      const dev = await getTransport().requestDevice({
        slot: 'kettle',
        acceptAll: acceptAll,
        filters: acceptAll ? [] : dedupeDeviceFilters([
          { namePrefix:'Stagg' },
          { namePrefix:'STAGG' },
          { namePrefix:'stagg' },
          { namePrefix:'EKG' },
          { namePrefix:'ekg' },
          { namePrefix:'Fellow' },
          { namePrefix:'FELLOW' },
          { services:[UUID.STAGG_EKG_SVC] }
        ]),
        optionalServices: mergeOptionalServices([UUID.STAGG_EKG_SVC, UUID.BATTERY_SVC])
      });
      return connectKettleWithDevice(dev);
    }

    async function disconnectKettle(){
      await disconnectMachineSlot();
      state.lastStatusText = 'Kettle disconnected.';
      emit();
    }

    async function setKettleTemp(tempC, holdEnabled){
      const clamped = Math.max(40, Math.min(100, Math.round(+tempC || 93)));
      state.kettleTargetTempC = clamped;
      if (holdEnabled !== undefined) state.kettleHold = !!holdEnabled;
      if (state.kettleConnected && sessions.machine && sessions.machine.kind === 'stagg_ekg_plus' && (sessions.machine.profile.writeUuid || sessions.machine.profile.altWriteUuid)){
        const s = sessions.machine;
        staggSeq = (staggSeq + 1) & 0xFF;
        await writeR2CommandSafe(s.gatt, s.profile, Codecs.commands.staggSetTempC(clamped, staggSeq));
        if (holdEnabled !== undefined){
          staggSeq = (staggSeq + 1) & 0xFF;
          await writeR2CommandSafe(s.gatt, s.profile, Codecs.commands.staggSetHold(!!holdEnabled, staggSeq));
        }
        state.lastStatusText = 'Sent ' + clamped + 'C target to ' + (state.kettleName || 'Stagg EKG+');
        emit();
        return true;
      }
      if (state.simulatorActive){
        state.kettleTempC = clamped;
        emit();
        return true;
      }
      return false;
    }

    async function setKettlePower(on){
      const powerOn = on !== false;
      state.kettlePower = powerOn;
      if (state.kettleConnected && sessions.machine && sessions.machine.kind === 'stagg_ekg_plus' && (sessions.machine.profile.writeUuid || sessions.machine.profile.altWriteUuid)){
        const s = sessions.machine;
        staggSeq = (staggSeq + 1) & 0xFF;
        await writeR2CommandSafe(s.gatt, s.profile, Codecs.commands.staggPower(powerOn, staggSeq));
        emit();
        return true;
      }
      if (state.simulatorActive){
        emit();
        return true;
      }
      return false;
    }

    /* ---------- Zero-Prompt Silent Auto-Reconnect & Health Ping Across Remembered Gear ---------- */
    function inferSlotFromDeviceName(name){
      const s = String(name || '').toLowerCase();
      if (!s) return '';
      if (/pressensor|smart espresso|bookoo_em|bookoo em/.test(s)) return 'pressure';
      if (/\br2\b|extract|dft-r/.test(s)) return 'refractometer';
      if (/omni|dft-sd/.test(s)) return 'omni';
      if (/stagg|ekg|fellow|xbloom|tbdx/.test(s)) return 'machine';
      if (/acaia|lunar|pearl|pyxis|cinco|orion|prochbt|microbalance|difluid|dft-s|df-s|bookoo|themis|timemore|black mirror|felicita|decent|hds|varia|aku|skale|eureka|precisa|brewista|hiroia|jimmy|exagram|wacaco|kc200|weighmybru|cfs-?9002|solobarista|formula|lsj|mhw|cube|smart\s*scale/.test(s)) return 'scale';
      return '';
    }

    async function getKnownDevices(){
      const transport = getTransport();
      if (typeof transport.getKnownDevices === 'function'){
        const list = await transport.getKnownDevices();
        return (list || []).map(function(d){
          return {
            deviceId: String((d && (d.id || d.deviceId)) || ''),
            name: String((d && d.name) || ''),
            gattConnected: !!(d && d.gatt && d.gatt.connected),
            inferredSlot: inferSlotFromDeviceName(d && d.name)
          };
        });
      }
      return [];
    }

    async function autoReconnectRemembered(slotFilter){
      const transport = getTransport();
      const savedList = getRememberedDevices().filter(function(d){
        return d.autoConnect !== false && (!slotFilter || d.slot === slotFilter);
      });
      const reconnected = [];
      const triedIds = Object.create(null);

      async function reconnectSlotCandidate(slot, dev, brand){
        if (slot === 'scale') await establishScaleSession(dev, brand || 'auto', true);
        else if (slot === 'pressure') await establishPressureSession(dev);
        else if (slot === 'refractometer') await establishRefractometerSession(dev);
        else if (slot === 'omni') await establishOmniSession(dev);
        else if (slot === 'machine'){
          if (brand === 'stagg_ekg_plus' || /stagg|ekg|fellow/i.test(dev.name || '')) await connectKettleWithDevice(dev);
          else await establishXBloomSession(dev);
        }
        reconnected.push(slot);
      }

      for (let i = 0; i < savedList.length; i++){
        const saved = savedList[i];
        if (saved.deviceId) triedIds[saved.deviceId] = true;
        if (state.slots[saved.slot] && state.slots[saved.slot].connected) continue;
        const dev = await transport.reconnectKnownDevice(saved);
        if (!dev) continue;
        try {
          await reconnectSlotCandidate(saved.slot, dev, saved.brand || 'auto');
        } catch(e){}
      }

      /* Also check browser's persisted navigator.bluetooth.getDevices() permission cache when no saved slot matched */
      if (typeof transport.getKnownDevices === 'function'){
        try {
          const rawKnown = await transport.getKnownDevices();
          for (let ki = 0; ki < rawKnown.length; ki++){
            const kd = rawKnown[ki];
            if (!kd || !kd.id || triedIds[kd.id]) continue;
            const slot = inferSlotFromDeviceName(kd.name);
            if (!slot || (slotFilter && slot !== slotFilter)) continue;
            if (state.slots[slot] && state.slots[slot].connected) continue;
            const wrapped = await transport.reconnectKnownDevice({ deviceId: kd.id, name: kd.name || '' });
            if (!wrapped) continue;
            try {
              const brandHint = slot === 'scale' ? normalizeScaleBrand(kd.name || '') : (/stagg|ekg|fellow/i.test(kd.name || '') ? 'stagg_ekg_plus' : 'auto');
              await reconnectSlotCandidate(slot, wrapped, brandHint);
            } catch(e){}
          }
        } catch(e){}
      }

      return { ok:reconnected.length > 0, reconnectedSlots:reconnected };
    }

    async function pingConnectedDevices(opts){
      const o = opts || {};
      const now = Date.now();
      const slotNames = ['scale', 'pressure', 'refractometer', 'omni', 'machine'];
      const slotReport = {};
      const aliveSlots = [];
      const droppedSlots = [];

      if (state.simulatorActive){
        for (let si = 0; si < slotNames.length; si++){
          const sn = slotNames[si];
          const sl = state.slots[sn] || {};
          slotReport[sn] = { connected: !!sl.connected, alive: !!sl.connected, simulator: true, batteryPct: sl.batteryPct, name: sl.name || '' };
          if (sl.connected) aliveSlots.push(sn);
        }
        return { ok:true, simulator:true, checkedAtMs:now, connectedCount:aliveSlots.length, aliveSlots:aliveSlots, droppedSlots:droppedSlots, slots:slotReport };
      }

      for (let i = 0; i < slotNames.length; i++){
        const slot = slotNames[i];
        const sess = sessions[slot];
        const slState = state.slots[slot] || {};
        if (!sess || !sess.gatt){
          slotReport[slot] = { connected:false, alive:false, batteryPct:slState.batteryPct != null ? slState.batteryPct : null, name:slState.name || '' };
          continue;
        }
        const gatt = sess.gatt;
        let alive = typeof gatt.isConnected === 'function' ? !!gatt.isConnected() : true;
        let bat = slState.batteryPct != null ? slState.batteryPct : null;
        if (alive && o.readBattery !== false && typeof gatt.read === 'function'){
          try {
            const bVal = await gatt.read(UUID.BATTERY_SVC, UUID.BATTERY_LEVEL);
            if (bVal && bVal.length >= 1 && bVal[0] <= 100){
              bat = bVal[0];
              if (state.slots[slot]) state.slots[slot].batteryPct = bat;
              if (slot === 'scale') state.batteryPct = bat;
              else if (slot === 'pressure') state.pressureBatteryPct = bat;
              else if (slot === 'refractometer') state.refractometerBatteryPct = bat;
              else if (slot === 'omni') state.omniBatteryPct = bat;
            }
          } catch(e){
            if (typeof gatt.isConnected === 'function' && !gatt.isConnected()){
              alive = false;
            }
          }
        }
        if (alive){
          aliveSlots.push(slot);
        } else {
          droppedSlots.push(slot);
        }
        slotReport[slot] = {
          connected: !!slState.connected,
          alive: alive,
          batteryPct: bat,
          name: slState.name || gatt.name || '',
          lastPacketAgeMs: state.lastPacketAtMs ? Math.max(0, now - state.lastPacketAtMs) : null
        };
      }
      if (aliveSlots.length || droppedSlots.length) emit();
      return {
        ok: droppedSlots.length === 0,
        simulator: false,
        checkedAtMs: now,
        connectedCount: aliveSlots.length,
        aliveSlots: aliveSlots,
        droppedSlots: droppedSlots,
        slots: slotReport
      };
    }

    /* ---------- 10Hz 5-Slot Physics Simulator (`SimulatorBleTransport`) ---------- */
    function resolveSimRecipe(recipeOrOpts){
      if (recipeOrOpts && Array.isArray(recipeOrOpts.steps)) return recipeOrOpts;
      if (recipeOrOpts && recipeOrOpts.recipe && Array.isArray(recipeOrOpts.recipe.steps)) return recipeOrOpts.recipe;
      try { if (typeof global.getRecipe === 'function') return global.getRecipe(); } catch(e){}
      const appRef = getLiveApp();
      if (appRef && appRef.brew && typeof appRef.brew === 'object'){
        return {
          method: appRef.brew.method || 'v60',
          dose: +appRef.brew.dose > 0 ? +appRef.brew.dose : 18,
          water: +appRef.brew.water > 0 ? +appRef.brew.water : 288,
          totalSecs: +appRef.brew.totalSecs > 0 ? +appRef.brew.totalSecs : 170,
          steps: Array.isArray(appRef.brew.steps) ? appRef.brew.steps : null
        };
      }
      return null;
    }

    /* Normalizes any step schema (legacy {t,scale,pourSecs}, BTCoreV6 {t,pourStartS,pourEndS,fromG,toG,targetG,targetFlowGs},
       UI {t,endS,targetG}, or synthesized bloom+2-pulse+drain fallback) into clean pour & rest intervals! */
    function normalizeSimSteps(rawSteps, targetWaterG, doseG, totalSecs, isEspresso){
      const maxW = Math.max(18, +targetWaterG > 0 ? +targetWaterG : (isEspresso ? 36 : 288));
      const dG = Math.max(4, +doseG > 0 ? +doseG : 18);
      const totS = Math.max(18, +totalSecs > 0 ? +totalSecs : (isEspresso ? 28 : 170));

      if (isEspresso && (!Array.isArray(rawSteps) || !rawSteps.length)){
        const preG = +(Math.min(maxW * 0.16, dG * 0.25)).toFixed(1);
        const mainEndS = Math.max(12, totS - 4);
        const mainG = +(maxW * 0.88).toFixed(1);
        return [
          { t:0, from:0, scale:preG, pourSecs:6, tailDecayS:0, kind:'preinfuse' },
          { t:6, from:preG, scale:mainG, pourSecs:Math.max(6, mainEndS - 6), tailDecayS:0, kind:'pour' },
          { t:mainEndS, from:mainG, scale:maxW, pourSecs:Math.max(3, totS - mainEndS), tailDecayS:Math.max(3, totS - mainEndS), kind:'tail_drip' }
        ];
      }

      if (Array.isArray(rawSteps) && rawSteps.length){
        const out = [];
        let prevScale = 0;
        for (let i = 0; i < rawSteps.length; i++){
          const s = rawSteps[i];
          if (!s || typeof s !== 'object') continue;
          const t0 = +(s.pourStartS != null ? s.pourStartS : (s.t != null ? s.t : 0));
          const rawTarget = s.toG != null ? +s.toG : (s.scale != null ? +s.scale : (s.targetG != null ? +s.targetG : maxW));
          const toG = Number.isFinite(rawTarget) ? Math.max(prevScale, rawTarget) : prevScale;
          const fromG = s.fromG != null && Number.isFinite(+s.fromG) ? +s.fromG
            : (s.from != null && Number.isFinite(+s.from) ? +s.from : prevScale);
          const deltaG = Math.max(0, toG - fromG);
          const nextT = (i + 1 < rawSteps.length && rawSteps[i + 1] && rawSteps[i + 1].t != null)
            ? +rawSteps[i + 1].t
            : Math.max(t0 + 12, s.holdUntilS || s.endS || totS);
          const windowS = Math.max(3, nextT - t0);

          let pourSecs = 0;
          if (deltaG > 0.25){
            if (s.pourSecs > 0){
              pourSecs = +s.pourSecs;
            } else if (s.pourEndS != null && +s.pourEndS > t0){
              pourSecs = +(+s.pourEndS - t0);
            } else {
              const nomRate = +s.targetFlowGs > 0.4 ? +s.targetFlowGs : (i === 0 ? 4.1 : 3.5);
              pourSecs = Math.min(Math.max(3.5, windowS * 0.68), Math.max(3.5, deltaG / nomRate));
            }
          }
          out.push({
            t: t0,
            from: fromG,
            scale: toG,
            pourSecs: +(pourSecs.toFixed(2)),
            windowEndS: nextT,
            tailDecayS: deltaG > 0.25 ? Math.min(1.6, Math.max(0.6, windowS - pourSecs)) : 0,
            kind: deltaG > 0.25 ? (i === 0 ? 'bloom' : 'pour') : 'drain'
          });
          prevScale = toG;
        }
        if (out.length) return out;
      }

      /* Realistic 3-Pour Percolation Schedule: Bloom (~4.2 g/s) -> Rest (0.0 g/s) -> Pulse 1 (~3.6 g/s) -> Rest -> Pulse 2 (~3.4 g/s) -> Drain (0.0 g/s) */
      const bloomG = Math.round(Math.min(maxW * 0.22, dG * 3.0));
      const bloomPourS = Math.max(8, Math.min(14, Math.round(bloomG / 4.1)));
      const p1StartS = Math.min(38, Math.round(totS * 0.22));
      const p1G = Math.round(bloomG + (maxW - bloomG) * 0.56);
      const p1PourS = Math.max(14, Math.round((p1G - bloomG) / 3.6));
      const p2StartS = Math.min(Math.round(totS * 0.54), p1StartS + p1PourS + 14);
      const p2PourS = Math.max(12, Math.round((maxW - p1G) / 3.4));
      return [
        { t:0, from:0, scale:bloomG, pourSecs:bloomPourS, windowEndS:p1StartS, tailDecayS:1.2, kind:'bloom' },
        { t:p1StartS, from:bloomG, scale:p1G, pourSecs:p1PourS, windowEndS:p2StartS, tailDecayS:1.4, kind:'pour' },
        { t:p2StartS, from:p1G, scale:maxW, pourSecs:p2PourS, windowEndS:totS, tailDecayS:1.5, kind:'pour' },
        { t:Math.min(totS - 10, p2StartS + p2PourS + 2), from:maxW, scale:maxW, pourSecs:0, windowEndS:totS, tailDecayS:0, kind:'drain' }
      ];
    }

    function simPourTargetAt(steps, tSec, fallbackWaterG, fallbackDoseG, fallbackTotalS, isEspresso){
      const st = normalizeSimSteps(steps, fallbackWaterG, fallbackDoseG, fallbackTotalS, isEspresso);
      if (!st.length) return { has:false, exact:0, pouring:false, rate:0, phase:'idle' };
      let idx = -1;
      for (let i = 0; i < st.length; i++){ if (tSec >= st[i].t) idx = i; }
      if (idx < 0) return { has:true, exact:0, pouring:false, rate:0, phase:'ready' };
      const cur = st[idx];
      const from0 = cur.from != null ? cur.from : (idx > 0 ? st[idx - 1].scale : 0);
      const deltaG = Math.max(0, cur.scale - from0);

      if (cur.kind === 'tail_drip' && cur.pourSecs > 0 && tSec < cur.t + cur.pourSecs + 2.5){
        /* Exponential Darcy drip decay at shot/outflow tail */
        const dtTail = Math.max(0, tSec - cur.t);
        const tau = Math.max(1.2, cur.pourSecs * 0.42);
        const eTerm = Math.exp(-dtTail / tau);
        const norm = 1 - Math.exp(-cur.pourSecs / tau);
        const frac = Math.min(1, (1 - eTerm) / Math.max(0.15, norm));
        const instRate = (deltaG / Math.max(0.15, tau * norm)) * eTerm;
        return {
          has: true,
          exact: +(from0 + deltaG * frac).toFixed(2),
          pouring: instRate >= 0.12,
          rate: +(Math.max(0, instRate)).toFixed(2),
          phase: 'tail_drip'
        };
      }

      if (cur.pourSecs > 0 && deltaG > 0.2){
        const dt = tSec - cur.t;
        const tailS = cur.tailDecayS || 0;
        /* Reserve ~4% of pour mass for smooth gooseneck tip-back / drip taper over tailS */
        const mainShare = tailS > 0.2 ? 0.96 : 1.0;
        const mainDelta = deltaG * mainShare;
        const tailDelta = deltaG - mainDelta;
        if (dt < cur.pourSecs){
          const u = Math.min(1, Math.max(0, dt / cur.pourSecs));
          /* Smooth raised-ramp velocity envelope: gentle 0.7s kettle tip-in, steady ~3.2-4.3 g/s stream, smooth taper */
          const avgRate = mainDelta / cur.pourSecs;
          const rampIn = dt < 0.7 ? (0.45 + 0.55 * (dt / 0.7)) : 1.0;
          const cadence = 1.0 + 0.045 * Math.sin(tSec * 2.1);
          const instRate = Math.max(0.5, Math.min(8.5, avgRate * rampIn * cadence));
          return {
            has: true,
            exact: +(from0 + mainDelta * u).toFixed(2),
            pouring: true,
            rate: +(instRate.toFixed(2)),
            phase: cur.kind || 'pour'
          };
        }
        if (tailS > 0.2 && dt < cur.pourSecs + tailS){
          const uTail = (dt - cur.pourSecs) / tailS;
          const tauDrip = 0.42;
          const eDrip = Math.exp(-uTail / tauDrip);
          const normD = 1 - Math.exp(-1 / tauDrip);
          const dripFrac = Math.min(1, (1 - eDrip) / normD);
          const dripRate = (tailDelta / (tailS * tauDrip * normD)) * eDrip;
          return {
            has: true,
            exact: +(from0 + mainDelta + tailDelta * dripFrac).toFixed(2),
            pouring: dripRate >= 0.15,
            rate: +(Math.max(0, dripRate)).toFixed(2),
            phase: 'drip_taper'
          };
        }
      }
      return { has:true, exact:cur.scale, pouring:false, rate:0, phase:cur.kind === 'drain' ? 'drawdown' : 'rest' };
    }

    function sampleSimulatedScaleAt(tSec, recipeOrOpts){
      const o = (recipeOrOpts && typeof recipeOrOpts === 'object') ? recipeOrOpts : {};
      const r = resolveSimRecipe(recipeOrOpts) || o;
      const methodKey = String((r && (r.method || r.methodKey)) || o.method || 'v60').toLowerCase();
      const isEsp = !!o.isEspresso || methodKey === 'espresso' || methodKey === 'lever_espresso';
      const maxW = +o.targetWaterG > 0 ? +o.targetWaterG : (+(r && (r.hotPourG || r.hot || r.waterG || r.water)) > 0 ? +(r.hotPourG || r.hot || r.waterG || r.water) : (isEsp ? 36 : 288));
      const doseG = +o.doseG > 0 ? +o.doseG : (+(r && (r.doseG || r.dose)) > 0 ? +(r.doseG || r.dose) : 18);
      const totS = +o.totalSecs > 0 ? +o.totalSecs : (+(r && (r.totalSecs || r.totalTargetS)) > 0 ? +(r.totalSecs || r.totalTargetS) : (isEsp ? 28 : 170));
      const rawSteps = (o && Array.isArray(o.steps)) ? o.steps : (r && Array.isArray(r.steps) ? r.steps : null);
      const pt = simPourTargetAt(rawSteps, Math.max(0, +tSec || 0), maxW, doseG, totS, isEsp);
      return {
        tSec: +(Math.max(0, +tSec || 0).toFixed(2)),
        weightG: +(pt.exact.toFixed(1)),
        flowGs: +(pt.rate.toFixed(1)),
        flowRateGs: +(pt.rate.toFixed(1)),
        pouring: !!pt.pouring,
        stable: !pt.pouring && pt.rate < 0.1,
        phase: pt.phase || 'idle',
        targetWaterG: maxW
      };
    }

    function stepSimPhysics(overrideElapsedSec, overrideSampleTimeMs){
      if (!state.simulatorActive || !simCtx) return snapshotState();
      const now = overrideSampleTimeMs != null ? +overrideSampleTimeMs : Date.now();
      simCtx.lastTickMs = now;
      const elapsedSimSec = overrideElapsedSec != null && Number.isFinite(+overrideElapsedSec)
        ? Math.max(0, +overrideElapsedSec)
        : (((now - simCtx.startedAtMs) / 1000) * simCtx.speedMultiplier + (simCtx.startOffsetSec || 0));

      /* Simulate 9-bar espresso pressure profile concurrently in Slot 2 */
      let simBar = 0;
      const pCycle = elapsedSimSec % 34;
      if (pCycle >= 1 && pCycle < 6){
        simBar = +(2.5 * ((pCycle - 1) / 5)).toFixed(2);
      } else if (pCycle >= 6 && pCycle < 9){
        simBar = +(2.5 + 6.5 * ((pCycle - 6) / 3)).toFixed(2);
      } else if (pCycle >= 9 && pCycle < 19){
        simBar = +(9.0 + 0.08 * Math.sin(pCycle * 3.1)).toFixed(2);
      } else if (pCycle >= 19 && pCycle < 28){
        simBar = +(9.0 - 3.2 * ((pCycle - 19) / 9)).toFixed(2);
      }
      state.pressureBar = cleanZero(simBar);
      state.pressureMbar = Math.round(simBar * 1000);
      if (simBar > state.peakPressureBar) state.peakPressureBar = simBar;

      /* Maintain simulated Stagg EKG+ kettle PID hold */
      state.kettleTempC = +(93.0 + 0.1 * Math.sin(elapsedSimSec * 0.8)).toFixed(1);

      if (simCtx.manualHold){
        pushRawWeight(simCtx.rawG, simCtx.manualFlowGs, Math.abs(simCtx.manualFlowGs || 0) < 0.08, undefined, now);
        return snapshotState();
      }

      const r = resolveSimRecipe(simCtx.recipe) || simCtx.recipe || {};
      const appRef = getLiveApp();
      const onTimer = simCtx.mode === 'brew' || (appRef && (appRef.screen === 'timer' || appRef.brewStep === 'timer' || appRef.activeSheet === 'live-cockpit'));

      if (!onTimer){
        const targetDose = simCtx.targetDoseG || (r && r.dose ? +(r.dose + 0.2).toFixed(1) : 18.2);
        if (simCtx.awaitingPourAfterTare){
          pushRawWeight(simCtx.rawG, 0, true, undefined, now);
          return snapshotState();
        }
        const rem = targetDose - (simCtx.rawG - simCtx.tareOffsetG);
        if (Math.abs(rem) > 0.08){
          simCtx.rawG = +(simCtx.rawG + rem * 0.55).toFixed(1);
        } else {
          simCtx.rawG = +(simCtx.tareOffsetG + targetDose).toFixed(1);
        }
        pushRawWeight(simCtx.rawG, 0, Math.abs(rem) <= 0.15, undefined, now);
        return snapshotState();
      }

      const methodKey = String(simCtx.methodKey || r.method || r.methodKey || 'v60').toLowerCase();
      const isEsp = !!simCtx.isEspresso || methodKey === 'espresso' || methodKey === 'lever_espresso';
      const maxW = simCtx.targetWaterG > 0 ? simCtx.targetWaterG : Math.round(+(r.hotPourG || r.hot || r.waterG || r.water) || (isEsp ? 36 : 288));
      const doseG = simCtx.doseG > 0 ? simCtx.doseG : (+(r.doseG || r.dose) || 18);
      const baseTotalS = Math.max(simCtx.totalSecs > 0 ? simCtx.totalSecs : (+(r.totalSecs || r.totalTargetS) || (isEsp ? 28 : 170)), 20);
      const rawSteps = simCtx.steps || (Array.isArray(r.steps) ? r.steps : null);

      let tClock = elapsedSimSec;
      if (overrideElapsedSec == null){
        if (typeof simCtx.getElapsedSec === 'function'){
          const customEl = +simCtx.getElapsedSec();
          if (Number.isFinite(customEl) && customEl >= 0) tClock = customEl * simCtx.speedMultiplier;
        } else if (typeof global.elapsed === 'function'){
          const gEl = +global.elapsed();
          if (Number.isFinite(gEl) && gEl > 0) tClock = gEl * simCtx.speedMultiplier;
        }
      }

      const p = simPourTargetAt(rawSteps, tClock, maxW, doseG, baseTotalS, isEsp);
      const effectiveEndS = state.simulatorStall ? Math.round(baseTotalS * 1.34) : baseTotalS;

      if (!isEsp && (simCtx.lifted || (simCtx.autoLiftAtEnd === true && tClock >= effectiveEndS + 1.5 && simCtx.peakNetG >= maxW * 0.65))){
        simCtx.lifted = true;
        const targetYield = simCtx.liftYieldOverride != null
          ? simCtx.liftYieldOverride
          : +(Math.max(18, simCtx.peakNetG - 2.1 * doseG)).toFixed(1);
        const curNet = simCtx.rawG - simCtx.tareOffsetG;
        const nextNet = Math.abs(curNet - targetYield) > 0.4 ? +(curNet + (targetYield - curNet) * 0.68).toFixed(1) : targetYield;
        simCtx.rawG = +(simCtx.tareOffsetG + nextNet).toFixed(1);
        pushRawWeight(simCtx.rawG, 0, Math.abs(nextNet - targetYield) <= 0.2, undefined, now);
        return snapshotState();
      }

      const desiredNetG = p.has ? Math.min(maxW + 0.5, Math.max(0, p.exact)) : Math.min(maxW, tClock * 3.8);
      const simFlow = p.pouring ? +(Math.max(0.15, p.rate)).toFixed(2) : 0;
      const prevNet = simCtx.rawG - simCtx.tareOffsetG;
      const nextNetRaw = p.pouring
        ? (prevNet + (desiredNetG - prevNet) * 0.72)
        : (Math.abs(desiredNetG - prevNet) <= 0.25 ? desiredNetG : (prevNet + (desiredNetG - prevNet) * 0.75));
      const roundedNet = +(Math.max(0, nextNetRaw)).toFixed(2);
      simCtx.peakNetG = Math.max(simCtx.peakNetG || 0, roundedNet);
      simCtx.rawG = +(simCtx.tareOffsetG + roundedNet).toFixed(2);
      pushRawWeight(simCtx.rawG, simFlow, !p.pouring && simFlow < 0.08, undefined, now);
      return snapshotState();
    }

    function startSimulator(recipeOrOpts){
      if (simIv){ clearInterval(simIv); simIv = null; }
      const isOpts = recipeOrOpts && !Array.isArray(recipeOrOpts.steps) && typeof recipeOrOpts === 'object';
      const rec = resolveSimRecipe(recipeOrOpts);
      const appRef = getLiveApp();
      const hasBrewTargetInOpts = !!(
        (recipeOrOpts && Array.isArray(recipeOrOpts.steps)) ||
        (isOpts && (recipeOrOpts.targetWaterG > 0 || recipeOrOpts.waterG > 0 || recipeOrOpts.hotPourG > 0 || recipeOrOpts.recipe || recipeOrOpts.mode === 'brew'))
      );
      const onTimer = (isOpts && recipeOrOpts.mode)
        ? (recipeOrOpts.mode === 'brew')
        : (hasBrewTargetInOpts || !!(appRef && (appRef.screen === 'timer' || appRef.brewStep === 'timer' || appRef.activeSheet === 'live-cockpit')));
      const resolvedDose = (isOpts && +recipeOrOpts.doseG > 0) ? +recipeOrOpts.doseG : (+(rec && (rec.doseG || rec.dose)) > 0 ? +(rec.doseG || rec.dose) : 18.0);
      const resolvedWater = (isOpts && (+recipeOrOpts.targetWaterG > 0 || +recipeOrOpts.waterG > 0 || +recipeOrOpts.hotPourG > 0))
        ? (+recipeOrOpts.targetWaterG || +recipeOrOpts.waterG || +recipeOrOpts.hotPourG)
        : (+(rec && (rec.hotPourG || rec.hot || rec.waterG || rec.water)) > 0 ? +(rec.hotPourG || rec.hot || rec.waterG || rec.water) : 288);
      const resolvedTotalSecs = (isOpts && (+recipeOrOpts.totalSecs > 0 || +recipeOrOpts.totalTargetS > 0))
        ? (+recipeOrOpts.totalSecs || +recipeOrOpts.totalTargetS)
        : (+(rec && (rec.totalSecs || rec.totalTargetS)) > 0 ? +(rec.totalSecs || rec.totalTargetS) : 170);
      const initDose = (isOpts && typeof recipeOrOpts.initialWeightG === 'number')
        ? recipeOrOpts.initialWeightG
        : (!onTimer ? +(resolvedDose.toFixed(1)) : 0);

      resetFlowFilter();
      softwareTareOffsetG = 0;
      tarePendingZeroCheck = false;
      dropRecovery.active = false;

      simCtx = {
        recipe: rec,
        steps: (recipeOrOpts && Array.isArray(recipeOrOpts.steps)) ? recipeOrOpts.steps : (isOpts && Array.isArray(recipeOrOpts.pourSteps) ? recipeOrOpts.pourSteps : null),
        methodKey: (isOpts && (recipeOrOpts.method || recipeOrOpts.methodKey)) || (rec && (rec.method || rec.methodKey)) || 'v60',
        isEspresso: !!(isOpts && recipeOrOpts.isEspresso),
        mode: isOpts && recipeOrOpts.mode ? recipeOrOpts.mode : (onTimer ? 'brew' : 'dose'),
        doseG: resolvedDose,
        targetDoseG: initDose || resolvedDose,
        targetWaterG: resolvedWater,
        totalSecs: resolvedTotalSecs,
        rawG: onTimer ? 0 : initDose,
        tareOffsetG: 0,
        peakNetG: 0,
        lifted: false,
        autoLiftAtEnd: !(isOpts && recipeOrOpts.autoLiftAtEnd === false),
        liftYieldOverride: null,
        manualHold: !!(isOpts && recipeOrOpts.manualHold),
        manualFlowGs: 0,
        awaitingPourAfterTare: false,
        getElapsedSec: (isOpts && typeof recipeOrOpts.getElapsedSec === 'function') ? recipeOrOpts.getElapsedSec : null,
        startOffsetSec: (isOpts && Number.isFinite(+recipeOrOpts.startAtSec)) ? Math.max(0, +recipeOrOpts.startAtSec) : 0,
        speedMultiplier: (isOpts && +recipeOrOpts.speedMultiplier > 0) ? +recipeOrOpts.speedMultiplier : 1,
        startedAtMs: Date.now(),
        tareAtMs: onTimer ? Date.now() : 0,
        lastTickMs: Date.now()
      };

      state.simulatorActive = true;
      state.simulatorStall = !!(isOpts && recipeOrOpts.stall);
      state.scaleBrand = 'simulator';
      state.scaleName = 'Physics Scale Simulator';
      state.batteryPct = 100;
      state.weightG = onTimer ? 0 : initDose;
      state.flowRateGs = 0;
      state.flowGs = 0;
      state.stable = true;

      /* Seed all 5 virtual hardware slots simultaneously */
      state.pressureBrand = 'simulator';
      state.pressureName = 'Simulated 9-Bar Profiler';
      state.pressureBar = onTimer ? 2.4 : 9.0;
      state.pressureMbar = Math.round(state.pressureBar * 1000);
      state.peakPressureBar = 9.0;

      state.lastTds = 1.42;
      state.lastTempC = 24.5;
      state.lastBrix = +(1.42 / 0.85).toFixed(2);
      state.lastRefractiveIndex = 1.33524;

      if (global.BTDiFluidApi && typeof global.BTDiFluidApi.simulateOmniRead === 'function'){
        state.lastOmni = global.BTDiFluidApi.simulateOmniRead('filter_light');
      }

      state.kettleTempC = 93.0;
      state.kettleTargetTempC = 93.0;
      state.kettleHold = true;

      state.slots = {
        scale:         { connected:true, deviceId:'sim-scale', brand:'simulator', name:'10Hz Scale Simulator', batteryPct:100 },
        pressure:      { connected:true, deviceId:'sim-pressure', brand:'simulator', name:'9-Bar Pressure Simulator', batteryPct:98 },
        refractometer: { connected:true, deviceId:'sim-r2', brand:'simulator', name:'DiFluid R2 Simulator (1.42% TDS)', batteryPct:94 },
        omni:          { connected:true, deviceId:'sim-omni', brand:'simulator', name:'DiFluid Omni Simulator', batteryPct:96 },
        machine:       { connected:true, deviceId:'sim-machine', brand:'simulator', name:'xBloom / Stagg 93C Simulator', batteryPct:100 }
      };

      state.lastStatusText = '10Hz 5-Slot Physics Simulator active (Scale + 9-Bar Pressure + R2 1.42% TDS + Omni + Kettle).';
      if (isOpts && recipeOrOpts.autoPilot){
        armAutoPilot({ recipe:rec, keepDemo:demoActive });
      } else {
        emit();
      }
      simIv = setInterval(function(){ stepSimPhysics(); }, 100);
      return snapshotState();
    }

    function startScaleSimulation(recipeOrOpts){
      if (Array.isArray(recipeOrOpts)){
        return startSimulator({ mode:'brew', steps:recipeOrOpts });
      }
      const base = (recipeOrOpts && typeof recipeOrOpts === 'object') ? Object.assign({}, recipeOrOpts) : {};
      if (!base.mode) base.mode = 'brew';
      return startSimulator(base);
    }

    function stepScaleSimulation(tSec, sampleTimeMs){
      if (!state.simulatorActive || !simCtx){
        startScaleSimulation({ mode:'brew' });
      }
      const synMs = sampleTimeMs != null ? +sampleTimeMs : (simCtx.startedAtMs + Math.round(Math.max(0, +tSec || 0) * 1000));
      return stepSimPhysics(+tSec || 0, synMs);
    }

    function stopSimulator(){
      clearDemoTimers();
      demoActive = false;
      state.demoAutoPilotActive = false;
      if (simIv){ clearInterval(simIv); simIv = null; }
      simCtx = null;
      if (state.simulatorActive){
        state.simulatorActive = false;
        state.simulatorStall = false;
        if (!state.scaleConnected){
          state.scaleBrand = '';
          state.scaleName = '';
          state.weightG = 0;
          state.flowRateGs = 0;
          state.flowGs = 0;
          state.stable = true;
          state.batteryPct = null;
          state.slots.scale = { connected:false, deviceId:'', brand:'', name:'', batteryPct:null };
        }
        if (!state.pressureConnected){
          state.pressureBrand = '';
          state.pressureName = '';
          state.pressureBar = 0;
          state.pressureMbar = 0;
          state.slots.pressure = { connected:false, deviceId:'', brand:'', name:'', batteryPct:null };
        }
        if (!state.refractometerConnected){
          state.slots.refractometer = { connected:false, deviceId:'', brand:'', name:'', batteryPct:null };
        }
        if (!state.omniConnected){
          state.slots.omni = { connected:false, deviceId:'', brand:'', name:'', batteryPct:null };
        }
        if (!state.machineConnected){
          state.slots.machine = { connected:false, deviceId:'', brand:'', name:'', batteryPct:null };
        }
        state.lastStatusText = 'Simulator stopped.';
        resetFlowFilter();
        emit();
      }
    }

    function setSimulatorStall(enabled){
      state.simulatorStall = !!enabled;
      state.lastStatusText = state.simulatorStall
        ? 'Fines-Stall simulation enabled (Darcy tail choke active)'
        : 'Healthy Darcy bed permeability restored';
      emit();
    }

    function setSimulatorWeight(weightG, flowGs){
      if (!state.simulatorActive) startSimulator({ mode:'idle', initialWeightG:+weightG || 0 });
      if (simCtx){
        simCtx.manualHold = true;
        simCtx.manualFlowGs = flowGs != null ? +flowGs : 0;
        simCtx.tareOffsetG = 0;
        simCtx.rawG = +((+weightG || 0).toFixed(2));
        simCtx.peakNetG = Math.max(simCtx.peakNetG || 0, simCtx.rawG);
      }
      pushRawWeight(+weightG || 0, flowGs != null ? +flowGs : 0, Math.abs(+flowGs || 0) < 0.08);
    }

    function simulateDripperLift(yieldG){
      if (!state.simulatorActive) startSimulator({ mode:'brew' });
      const rec = resolveSimRecipe(simCtx && simCtx.recipe);
      const doseG = (rec && rec.dose) || 18;
      const peak = Math.max((simCtx && simCtx.peakNetG) || 0, state.weightG, (rec && (rec.hot || rec.water)) || 300);
      const targetYield = (yieldG != null && +yieldG > 0) ? +(+yieldG).toFixed(1) : +(Math.max(18, peak - 2.1 * doseG)).toFixed(1);
      if (simCtx){
        simCtx.peakNetG = peak;
        simCtx.lifted = true;
        simCtx.manualHold = false;
        simCtx.liftYieldOverride = targetYield;
        simCtx.rawG = +(simCtx.tareOffsetG + targetYield).toFixed(1);
      }
      const rawTarget = (simCtx ? simCtx.tareOffsetG : 0) + targetYield;
      /* Emit 3 consecutive stable frames so #98 >=3 consecutive-frame guard confirms cleanly */
      pushRawWeight(rawTarget, 0, true);
      pushRawWeight(rawTarget, 0, true);
      pushRawWeight(rawTarget, 0, true);
      return targetYield;
    }

    function enterTimerSimMode(recipe){
      if (!state.simulatorActive || !simCtx) return;
      simCtx.recipe = recipe || simCtx.recipe;
      simCtx.mode = 'brew';
      simCtx.manualHold = false;
      simCtx.lifted = false;
      simCtx.liftYieldOverride = null;
      simCtx.peakNetG = 0;
      simCtx.tareOffsetG = simCtx.rawG;
      simCtx.tareAtMs = Date.now();
      resetFlowFilter();
      state.weightG = 0;
      state.flowRateGs = 0;
      state.stable = true;
      armAutoPilot({ recipe:simCtx.recipe, keepDemo:demoActive });
      state.lastStatusText = 'Simulator tared and Auto-Pilot ARMED at 0.0 g';
      emit();
    }

    /* ---------- Hardware-Free 6-State BLE Auto-Pilot Demo Toggle ---------- */
    function isDemoAutoPilotActive(){
      return !!demoActive;
    }

    function startDemoAutoPilot(opts){
      const o = opts || {};
      clearDemoTimers();
      const stepMs = o.stepMs != null ? Math.max(15, +o.stepMs) : 1100;
      const appRef = getLiveApp();
      const brewRef = appRef && appRef.brew;
      const doseG = +o.doseG > 0 ? +o.doseG : (+(brewRef && brewRef.dose) > 0 ? +brewRef.dose : 18);
      const targetWaterG = +o.targetWaterG > 0 ? +o.targetWaterG : (+(brewRef && brewRef.water) > 0 ? +brewRef.water : 288);
      const targetYieldG = +o.targetYieldG > 0
        ? +(+o.targetYieldG).toFixed(1)
        : +(Math.max(18, targetWaterG - 2.1 * doseG)).toFixed(1);
      const demoTds = +o.tds > 0 ? +o.tds : 1.42;
      const demoTempC = o.tempC != null && Number.isFinite(+o.tempC) ? +o.tempC : 24.5;

      startSimulator({ mode:'idle', initialWeightG:0, manualHold:true });
      demoActive = true;
      state.demoAutoPilotActive = true;
      armAutoPilot({ doseG:doseG, targetWaterG:targetWaterG, keepDemo:true });

      /* Phase 1: ARMED -> POURING (first pour crosses w > 0.6g && dw/dt > 0.8 g/s) */
      demoTimers.push(setTimeout(function(){
        if (!demoActive) return;
        setSimulatorWeight(14.8, 5.4);
      }, stepMs));

      /* Phase 2: POURING peak water reached */
      demoTimers.push(setTimeout(function(){
        if (!demoActive) return;
        setSimulatorWeight(targetWaterG, 4.2);
      }, stepMs * 2));

      /* Phase 3: POURING -> DRAWDOWN (pour stops, coffee bed drains) */
      demoTimers.push(setTimeout(function(){
        if (!demoActive) return;
        if (simCtx){
          simCtx.manualHold = true;
          simCtx.manualFlowGs = 0;
          simCtx.tareOffsetG = 0;
          simCtx.rawG = targetWaterG;
          simCtx.peakNetG = Math.max(simCtx.peakNetG || 0, targetWaterG);
        }
        pushRawWeight(targetWaterG, 0, true);
        pushRawWeight(targetWaterG, 0, true);
        pushRawWeight(targetWaterG, 0, true);
      }, stepMs * 3));

      /* Phase 4: DRAWDOWN -> LOCKED_YIELD (dripper lift spike guard -> 3 stable carafe frames) */
      demoTimers.push(setTimeout(function(){
        if (!demoActive) return;
        /* Simulated cone-lift unload spike rejected first, then 3 stable frames lock yield */
        pushRawWeight(+(targetYieldG - 6.5).toFixed(1), -4.2, false);
        simulateDripperLift(targetYieldG);
        if (simCtx) simCtx.manualHold = true;
      }, stepMs * 4));

      /* Phase 5: LOCKED_YIELD -> R2_READY (DiFluid R2 optical sample within 20-min window) */
      demoTimers.push(setTimeout(function(){
        if (!demoActive) return;
        simulateRefractometerRead({ tds:demoTds, tempC:demoTempC });
      }, stepMs * 5));

      return snapshotState();
    }

    function stopDemoAutoPilot(){
      clearDemoTimers();
      demoActive = false;
      state.demoAutoPilotActive = false;
      stopSimulator();
      resetAutoPilot();
      return snapshotState();
    }

    function toggleDemoAutoPilot(opts){
      if (demoActive){
        const st = stopDemoAutoPilot();
        return { active:false, state:st };
      }
      const st = startDemoAutoPilot(opts);
      return { active:true, state:st };
    }

    function openInBluefy(){
      const url = buildBluefyUrl();
      try {
        if (typeof location !== 'undefined') location.href = url;
      } catch(e){}
      return url;
    }

    /* Deterministic test helpers for Gate 5 & Gate 8 verification */
    function simulateMidBrewDropForTest(){
      dropRecovery = {
        active: true,
        preDropNetWeightG: state.weightG,
        preDropRawWeightG: lastRawDeviceWeightG,
        preDropSoftwareTareG: softwareTareOffsetG,
        droppedAtMs: Date.now()
      };
      state.scaleReconnecting = true;
      emit();
      return Object.assign({}, dropRecovery);
    }

    return {
      capabilities: function(){ return getTransport().getCapabilities(); },
      getState: snapshotState,
      subscribe: subscribe,

      AUTO_PILOT_STATES: AUTO_PILOT_STATES.slice(),
      R2_ATTACH_WINDOW_MS: R2_ATTACH_WINDOW_MS,
      getAutoPilotState: snapshotAutoPilot,
      subscribeAutoPilot: subscribeAutoPilot,
      armAutoPilot: armAutoPilot,
      resetAutoPilot: resetAutoPilot,
      lockAutoPilotYield: lockAutoPilotYield,
      attachR2Reading: attachR2Reading,
      startDemoAutoPilot: startDemoAutoPilot,
      stopDemoAutoPilot: stopDemoAutoPilot,
      toggleDemoAutoPilot: toggleDemoAutoPilot,
      isDemoAutoPilotActive: isDemoAutoPilotActive,

      connectScale: connectScale,
      disconnectScale: disconnectScale,
      tare: tare,
      tareScale: tare,
      startTimer: startTimer,
      stopTimer: stopTimer,
      resetTimer: resetTimer,

      connectPressure: connectPressure,
      disconnectPressure: disconnectPressure,
      zeroPressure: zeroPressure,

      connectRefractometer: connectRefractometer,
      disconnectRefractometer: disconnectRefractometer,
      triggerRefractometerRead: triggerRefractometerRead,
      simulateRefractometerRead: simulateRefractometerRead,

      connectOmni: connectOmni,
      disconnectOmni: disconnectOmni,
      triggerOmniRead: triggerOmniRead,
      triggerOmniScan: triggerOmniRead,
      requestOmniAgtron: triggerOmniRead,
      simulateOmniRead: simulateOmniRead,

      connectXBloom: connectXBloom,
      connectMachine: connectXBloom,
      disconnectXBloom: disconnectXBloom,
      disconnectMachine: disconnectMachineSlot,
      sendXBloomRecipe: sendXBloomRecipe,
      encodeXBloomRecipePayload: Codecs.commands.encodeXBloomRecipePayload,

      connectKettle: connectKettle,
      disconnectKettle: disconnectKettle,
      setKettleTemp: setKettleTemp,
      setKettleTargetTemp: setKettleTemp,
      setKettlePower: setKettlePower,

      autoReconnectRemembered: autoReconnectRemembered,
      silentReconnectKnownDevices: autoReconnectRemembered,
      getKnownDevices: getKnownDevices,
      pingConnectedDevices: pingConnectedDevices,
      rememberDevice: rememberDevice,
      forgetDevice: forgetDevice,
      getRememberedDevices: getRememberedDevices,

      startSimulator: startSimulator,
      stopSimulator: stopSimulator,
      startScaleSimulation: startScaleSimulation,
      stopScaleSimulation: stopSimulator,
      stepScaleSimulation: stepScaleSimulation,
      sampleSimulatedScaleAt: sampleSimulatedScaleAt,
      setSimulatorStall: setSimulatorStall,
      setSimulatorWeight: setSimulatorWeight,
      simulateDripperLift: simulateDripperLift,
      openInBluefy: openInBluefy,

      analyzeDarcy: evaluateDarcyTelemetry,
      evaluateDripperLift: evaluateDripperLift,
      computeSavitzkyGolayFlowGs: computeSavitzkyGolayFlowGs,

      decoders: Codecs.decoders,
      commands: Codecs.commands,
      UUID: Codecs.UUID,
      ALL_COFFEE_OPTIONAL_SERVICES: ALL_COFFEE_OPTIONAL_SERVICES.slice(),
      DEVICE_CATALOG: Codecs.DEVICE_CATALOG,
      NON_GATT_DISCLOSURES: Codecs.NON_GATT_DISCLOSURES,

      setTransport: function(custom){ activeTransport = custom || null; },
      resetTransport: function(){ activeTransport = null; },
      _enterTimerSimMode: enterTimerSimMode,
      _pushScaleSampleForTest: function(rawG, hwFlowGs, hwStable, sampleTimeMs){
        pushRawWeight(rawG, hwFlowGs, hwStable, undefined, sampleTimeMs);
        return snapshotState();
      },
      _pushRefractometerBytesForTest: function(rawBytes){
        recordRxTelemetry(rawBytes, UUID.DIFLUID_SVC, UUID.DIFLUID_CHAR);
        const testStream = Codecs.streams.createCharacteristicStream('difluid_r2', { slot:'refractometer' });
        const res = testStream.push(rawBytes);
        for (let i = 0; i < res.frames.length; i++){
          handleRefractometerFrame(res.frames[i]);
        }
        return res.frames;
      },
      _resetScaleStateForTest: function(){
        clearDemoTimers();
        demoActive = false;
        state.demoAutoPilotActive = false;
        autoPilot = createFreshAutoPilot();
        state.fsmState = 'IDLE';
        resetFlowFilter();
        lastRawDeviceWeightG = 0;
        softwareTareOffsetG = 0;
        tarePendingZeroCheck = false;
        consecutiveStableFrames = 0;
        dropRecovery.active = false;
        state.weightG = 0;
        state.flowRateGs = 0;
        state.flowGs = 0;
        state.stable = true;
        state.stableFrames = 0;
        state.stableConfirmed = false;
      },
      _simulateMidBrewDropForTest: simulateMidBrewDropForTest
    };
  }

  /* ============================================================================
   * 5. ZERO-KEY DIFLUID CAFE PARSER & ISOLATED PARTNER CLOUD (`window.BTDiFluidApi`)
   *    Strictly isolates API credentials in local-only `'brew-and-cup-difluid-auth-v1'`
   * ============================================================================ */
  function createBTDiFluidApiEngine(){
    const STORAGE_KEY = 'brew-and-cup-difluid-auth-v1';
    const DEFAULT_BASE_URL = 'https://api.digitizefluid.com/v1';

    let memAuth = { baseUrl:DEFAULT_BASE_URL, apiKey:'' };
    const listeners = new Set();
    const synced = {
      r2: [],
      scale: [],
      omni: [],
      latestR2: null,
      latestScale: null,
      latestOmni: null,
      updatedAt: ''
    };

    function cleanUrl(u){
      const s = String(u || '').trim().replace(/\/+$/, '');
      if (!s) return DEFAULT_BASE_URL;
      if (/^https:\/\//i.test(s)) return s.slice(0, 220);
      if (/^http:\/\/(localhost|127\.0\.0\.1|192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/i.test(s)) return s.slice(0, 220);
      return DEFAULT_BASE_URL;
    }

    function getConfig(){
      try {
        if (typeof localStorage !== 'undefined'){
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw){
            const p = JSON.parse(raw);
            if (p && typeof p === 'object'){
              memAuth = {
                baseUrl: cleanUrl(p.baseUrl),
                apiKey: typeof p.apiKey === 'string' ? p.apiKey.trim().slice(0, 256) : ''
              };
            }
          }
        }
      } catch(e){}
      return {
        baseUrl: memAuth.baseUrl || DEFAULT_BASE_URL,
        apiKey: memAuth.apiKey || '',
        hasKey: !!(memAuth.apiKey && memAuth.apiKey.length > 0)
      };
    }

    function getLastSynced(){
      return {
        r2: synced.r2.slice(),
        scale: synced.scale.slice(),
        omni: synced.omni.slice(),
        latestR2: synced.latestR2 ? Object.assign({}, synced.latestR2) : null,
        latestScale: synced.latestScale ? Object.assign({}, synced.latestScale) : null,
        latestOmni: synced.latestOmni ? Object.assign({}, synced.latestOmni) : null,
        updatedAt: synced.updatedAt
      };
    }

    function emit(){
      const snap = getLastSynced();
      listeners.forEach(function(fn){
        try { fn(snap); } catch(e){}
      });
    }

    function setConfig(cfg){
      const cur = getConfig();
      const nextUrl = (cfg && cfg.baseUrl !== undefined) ? cleanUrl(cfg.baseUrl) : cur.baseUrl;
      const nextKey = (cfg && cfg.apiKey !== undefined) ? String(cfg.apiKey == null ? '' : cfg.apiKey).trim().slice(0, 256) : cur.apiKey;
      memAuth = { baseUrl:nextUrl, apiKey:nextKey };
      try {
        if (typeof localStorage !== 'undefined'){
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ baseUrl:nextUrl, apiKey:nextKey }));
        }
      } catch(e){}
      emit();
      return { baseUrl:nextUrl, apiKey:nextKey, hasKey:!!nextKey };
    }

    function clearApiKey(){
      const cur = getConfig();
      memAuth = { baseUrl:cur.baseUrl || DEFAULT_BASE_URL, apiKey:'' };
      try {
        if (typeof localStorage !== 'undefined'){
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ baseUrl:memAuth.baseUrl, apiKey:'' }));
        }
      } catch(e){}
      emit();
      return { baseUrl:memAuth.baseUrl, apiKey:'', hasKey:false };
    }

    function subscribe(fn){
      if (typeof fn !== 'function') return function(){};
      listeners.add(fn);
      return function(){ listeners.delete(fn); };
    }

    function mergeIntoCache(res){
      if (!res) return;
      if (Array.isArray(res.r2) && res.r2.length){
        synced.r2 = res.r2.concat(synced.r2).slice(0, 50);
        synced.latestR2 = synced.r2[0];
      }
      if (Array.isArray(res.scale) && res.scale.length){
        synced.scale = res.scale.concat(synced.scale).slice(0, 50);
        synced.latestScale = synced.scale[0];
      }
      if (Array.isArray(res.omni) && res.omni.length){
        synced.omni = res.omni.concat(synced.omni).slice(0, 50);
        synced.latestOmni = synced.omni[0];
      }
      synced.updatedAt = new Date().toISOString();
      emit();
    }

    function pushLiveRecord(kind, rec){
      if (!rec) return;
      if (kind === 'r2') mergeIntoCache({ r2:[rec] });
      else if (kind === 'scale') mergeIntoCache({ scale:[rec] });
      else if (kind === 'omni') mergeIntoCache({ omni:[rec] });
    }

    function parseExport(rawInput, opts){
      const empty = { ok:false, format:'empty', r2:[], scale:[], omni:[], latestR2:null, latestScale:null, latestOmni:null, totalCount:0, summary:'No DiFluid data found.' };
      if (rawInput == null) return empty;

      const r2 = [], scale = [], omni = [];
      const num = function(v){
        if (v == null || v === '') return null;
        let cleaned = String(v).replace(/[%°\u2103\u2109cbxµ\u03BCumg/s\s]+$/ig, '').trim();
        if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(cleaned)) cleaned = cleaned.replace(/,/g, '');
        else cleaned = cleaned.replace(/,/g, '.');
        const n = Number(cleaned);
        return Number.isFinite(n) ? n : null;
      };
      const normHeaderKey = function(k){
        return String(k || '')
          .trim()
          .toLowerCase()
          .replace(/[\u00B5\u03BC]m/g, 'um')
          .replace(/[\u00B5\u03BC]/g, 'u')
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_|_$/g, '');
      };
      const parseExportTsMs = function(tsVal){
        if (tsVal == null || tsVal === '') return NaN;
        if (typeof tsVal === 'number') return Number.isFinite(tsVal) ? (tsVal < 1e12 ? tsVal * 1000 : tsVal) : NaN;
        const s = String(tsVal).trim();
        if (!s) return NaN;
        if (/^\d{10,13}$/.test(s)){
          const n = Number(s);
          return n < 1e12 ? n * 1000 : n;
        }
        let ms = Date.parse(s);
        if (Number.isFinite(ms)) return ms;
        ms = Date.parse(s.replace(/\//g, '-'));
        return Number.isFinite(ms) ? ms : NaN;
      };
      const sortRowsDescByTs = function(list){
        if (!Array.isArray(list) || list.length < 2) return list;
        const hasAnyTs = list.some(function(it){ return Number.isFinite(parseExportTsMs(it && it.timestamp)); });
        if (!hasAnyTs) return list;
        return list.slice().sort(function(a, b){
          const ta = parseExportTsMs(a && a.timestamp);
          const tb = parseExportTsMs(b && b.timestamp);
          const fa = Number.isFinite(ta);
          const fb = Number.isFinite(tb);
          if (fa && fb) return tb - ta;
          if (fb && !fa) return 1;
          if (fa && !fb) return -1;
          return 0;
        });
      };
      const pick = function(obj, keys){
        for (let i = 0; i < keys.length; i++){
          const k = keys[i];
          if (obj[k] !== undefined && obj[k] !== '') return obj[k];
        }
        return undefined;
      };

      function ingestRecord(raw, idx){
        if (!raw || typeof raw !== 'object') return;
        const o = {};
        Object.keys(raw).forEach(function(k){
          const nk = normHeaderKey(k);
          o[nk] = raw[k];
          if (raw[k] && typeof raw[k] === 'object' && !Array.isArray(raw[k])){
            Object.keys(raw[k]).forEach(function(sk){
              const snk = normHeaderKey(sk);
              if (o[snk] === undefined) o[snk] = raw[k][sk];
            });
          }
        });

        const ts = pick(o, ['timestamp', 'created_at', 'date', 'time', 'measured_at', 'test_time']) || '';
        const beanName = String(pick(o, ['bean_name', 'bean', 'coffee', 'sample_name', 'name', 'title']) || '').trim();

        const beanAg = num(pick(o, ['bean_agtron', 'whole_bean_agtron', 'agtron_bean', 'whole_agtron']));
        const groundAg = num(pick(o, ['ground_agtron', 'grounds_agtron', 'agtron_ground', 'powder_agtron']));
        const anyAg = num(pick(o, ['agtron', 'roast_degree', 'roast_color', 'color_agtron', 'agtron_value']));
        const d10 = num(pick(o, ['d10_um', 'd10', 'psd_d10']));
        const d50 = num(pick(o, ['d50_um', 'd50', 'median_um', 'median_particle_size', 'particle_d50']));
        const d90 = num(pick(o, ['d90_um', 'd90', 'psd_d90']));

        if (beanAg !== null || groundAg !== null || anyAg !== null || d50 !== null){
          const primaryAg = groundAg !== null ? groundAg : (anyAg !== null ? anyAg : beanAg);
          const sw = primaryAg !== null ? Codecs.agtronToRoastSwatch(primaryAg, groundAg !== null || anyAg !== null ? 'ground' : 'bean') : null;
          omni.push({
            kind: 'omni',
            id: String(pick(o, ['id', 'record_id']) || ('omni-' + (idx + 1))),
            timestamp: String(ts),
            deviceModel: String(pick(o, ['device_model', 'device']) || 'DiFluid Omni'),
            beanName: beanName,
            grinderName: String(pick(o, ['grinder_name', 'grinder']) || '').trim(),
            dialSetting: String(pick(o, ['dial_setting', 'grind_setting', 'setting']) || '').trim(),
            beanAgtron: beanAg,
            groundAgtron: groundAg !== null ? groundAg : (beanAg === null ? anyAg : null),
            agtron: primaryAg,
            roastDelta: (beanAg !== null && groundAg !== null) ? +(groundAg - beanAg).toFixed(1) : num(pick(o, ['roast_delta', 'delta'])),
            suggestedRoast: sw ? sw.roast : '',
            roastKey: sw ? sw.roastKey : '',
            d10Um: d10,
            d50Um: d50,
            d90Um: d90,
            span: (d10 !== null && d50 !== null && d90 !== null && d50 > 0) ? +((d90 - d10) / d50).toFixed(2) : num(pick(o, ['span'])),
            meanUm: num(pick(o, ['mean_um', 'mean'])),
            modeUm: num(pick(o, ['mode_um', 'mode'])),
            stdDevUm: num(pick(o, ['standard_deviation', 'std_dev_um', 'std_dev', 'sd'])),
            finesUnder200Pct: num(pick(o, ['fines_pct', 'fines_under_200_pct'])),
            bins: Array.isArray(raw.distribution_bins || raw.bins) ? (raw.distribution_bins || raw.bins) : []
          });
        }

        const tds = num(pick(o, ['tds', 'tds_pct', 'brew_tds_pct', 'concentration']));
        const ri = num(pick(o, ['refractive_index', 'nd', 'nd20', 'ri']));
        if (tds !== null && tds > 0 && tds < 35){
          const brixRaw = num(pick(o, ['brix']));
          const brix = brixRaw !== null ? brixRaw : +(tds / 0.85).toFixed(2);
          r2.push({
            kind: 'r2',
            id: String(pick(o, ['id', 'record_id']) || ('r2-' + (idx + 1))),
            timestamp: String(ts),
            beanName: beanName,
            tds: +tds.toFixed(2),
            brix: +brix.toFixed(2),
            refractiveIndex: ri !== null ? +ri.toFixed(5) : null,
            tempC: num(pick(o, ['temp_c', 'temperature_c', 'temperature', 'temp', 'prism_temp'])),
            doseG: num(pick(o, ['dose_g', 'dose', 'coffee_weight', 'powder_weight'])),
            waterG: num(pick(o, ['water_g', 'water', 'poured_water', 'inject_water'])),
            yieldG: num(pick(o, ['yield_g', 'yield', 'liquid_weight', 'beverage_weight'])),
            eyPct: num(pick(o, ['ey_pct', 'extraction_yield', 'ey']))
          });
        }

        const doseG = num(pick(o, ['dose_g', 'dose', 'coffee_weight', 'powder_weight']));
        const waterG = num(pick(o, ['water_g', 'water', 'poured_water', 'inject_water', 'total_water']));
        const yieldG = num(pick(o, ['yield_g', 'yield', 'liquid_weight', 'beverage_weight', 'out_g']));
        const timeS = num(pick(o, ['time_s', 'brew_time_s', 'duration_s', 'duration', 'elapsed_s']));
        if ((waterG !== null || yieldG !== null) && (doseG !== null || timeS !== null)){
          scale.push({
            kind: 'scale',
            id: String(pick(o, ['id', 'record_id']) || ('mb-' + (idx + 1))),
            timestamp: String(ts),
            deviceModel: String(pick(o, ['device_model', 'scale']) || 'DiFluid Microbalance'),
            brewMethod: String(pick(o, ['brew_method', 'method', 'brewer']) || '').trim(),
            doseG: doseG,
            waterG: waterG,
            yieldG: yieldG,
            timeS: timeS,
            avgFlowGs: num(pick(o, ['avg_flow_gs', 'avg_flow', 'flow_rate'])),
            peakFlowGs: num(pick(o, ['peak_flow_gs', 'max_flow', 'peak_flow']))
          });
        }
      }

      let format = 'text';
      if (typeof rawInput === 'object'){
        format = 'json';
        if (Array.isArray(rawInput.r2) || Array.isArray(rawInput.omni) || Array.isArray(rawInput.scale)){
          [].concat(rawInput.r2 || [], rawInput.omni || [], rawInput.scale || []).forEach(function(it, idx){ ingestRecord(it, idx); });
        } else {
          const arr = Array.isArray(rawInput) ? rawInput : (rawInput.records || rawInput.data || rawInput.items || [rawInput]);
          arr.forEach(function(item, idx){ ingestRecord(item, idx); });
        }
      } else {
        const str = String(rawInput).replace(/^\uFEFF/, '').trim();
        if (!str) return empty;
        if (str[0] === '{' || str[0] === '['){
          try {
            const parsedObj = JSON.parse(str);
            return parseExport(parsedObj, opts);
          } catch(e){}
        }
        const lines = str.split(/\r?\n/).map(function(l){ return l.trim(); }).filter(Boolean);
        const hLine = lines[0] || '';
        const semiCnt = hLine.split(';').length - 1;
        const commaCnt = hLine.split(',').length - 1;
        const delim = hLine.indexOf('\t') >= 0
          ? '\t'
          : ((semiCnt > 0 && semiCnt >= commaCnt) ? ';' : (commaCnt > 0 ? ',' : ''));
        if (lines.length >= 2 && delim && /[a-zA-Z]/.test(lines[0]) && !/:\s*\d/.test(lines[0])){
          format = 'csv';
          const splitLine = function(ln){
            const cols = [];
            let cur = '', q = false;
            for (let i = 0; i < ln.length; i++){
              const c = ln[i];
              if (c === '"'){
                if (q && ln[i + 1] === '"'){ cur += '"'; i++; }
                else q = !q;
              } else if (c === delim && !q){
                cols.push(cur.trim()); cur = '';
              } else {
                cur += c;
              }
            }
            cols.push(cur.trim());
            return cols;
          };
          const headers = splitLine(lines[0]);
          for (let r = 1; r < lines.length; r++){
            const vals = splitLine(lines[r]);
            const rowObj = {};
            headers.forEach(function(hd, cIdx){ rowObj[hd] = vals[cIdx] !== undefined ? vals[cIdx] : ''; });
            ingestRecord(rowObj, r - 1);
          }
        } else {
          format = 'text';
          const obj = {};
          const mTds = str.match(/tds\s*[:=]?\s*(\d+(?:[.,]\d+)?)\s*%/i) || str.match(/(\d+(?:[.,]\d+)?)\s*%\s*tds/i);
          if (mTds) obj.tds = mTds[1];
          const mRi = str.match(/(?:nd|nd20|ri|refractive\s*index)\s*[:=]?\s*(1[.,]\d{4,6})/i);
          if (mRi) obj.refractive_index = mRi[1];
          const mTemp = str.match(/(?:temp(?:erature)?)\s*[:=]?\s*(\d+(?:[.,]\d+)?)\s*(?:°\s*c|\u2103|c\b)/i);
          if (mTemp) obj.temp_c = mTemp[1];
          const mBeanAg = str.match(/(?:whole\s*bean|bean)\s*agtron\s*[:=]?\s*(\d+(?:[.,]\d+)?)/i) || str.match(/(\d+(?:[.,]\d+)?)\s*\(\s*bean\s*\)/i);
          if (mBeanAg) obj.bean_agtron = mBeanAg[1];
          const mGroundAg = str.match(/(?:ground|grounds|powder)\s*agtron\s*[:=]?\s*(\d+(?:[.,]\d+)?)/i) || str.match(/(\d+(?:[.,]\d+)?)\s*\(\s*ground\s*\)/i);
          if (mGroundAg) obj.ground_agtron = mGroundAg[1];
          const mAg = str.match(/agtron\s*[:=]?\s*(\d+(?:[.,]\d+)?)/i);
          if (mAg && !obj.bean_agtron && !obj.ground_agtron) obj.agtron = mAg[1];
          const mD10 = str.match(/d10\s*[:=]?\s*(\d+(?:[.,]\d+)?)/i);
          if (mD10) obj.d10_um = mD10[1];
          const mD50 = str.match(/d50\s*[:=]?\s*(\d+(?:[.,]\d+)?)/i);
          if (mD50) obj.d50_um = mD50[1];
          const mD90 = str.match(/d90\s*[:=]?\s*(\d+(?:[.,]\d+)?)/i);
          if (mD90) obj.d90_um = mD90[1];
          const mDose = str.match(/dose\s*[:=]?\s*(\d+(?:[.,]\d+)?)\s*g/i);
          if (mDose) obj.dose_g = mDose[1];
          const mWater = str.match(/water\s*[:=]?\s*(\d+(?:[.,]\d+)?)\s*g/i);
          if (mWater) obj.water_g = mWater[1];
          const mYield = str.match(/(?:yield|liquid|out)\s*[:=]?\s*(\d+(?:[.,]\d+)?)\s*g/i);
          if (mYield) obj.yield_g = mYield[1];
          const mTime = str.match(/(?:time|duration)\s*[:=]?\s*(\d+)\s*s\b/i);
          if (mTime) obj.time_s = mTime[1];
          ingestRecord(obj, 0);
        }
      }

      const sortedR2 = sortRowsDescByTs(r2);
      const sortedScale = sortRowsDescByTs(scale);
      const sortedOmni = sortRowsDescByTs(omni);
      const totalCount = sortedR2.length + sortedScale.length + sortedOmni.length;
      const parts = [];
      if (sortedR2.length) parts.push(sortedR2.length + ' R2 TDS');
      if (sortedOmni.length) parts.push(sortedOmni.length + ' Omni Agtron/PSD');
      if (sortedScale.length) parts.push(sortedScale.length + ' Microbalance Brew');

      const result = {
        ok: totalCount > 0,
        format: format,
        r2: sortedR2,
        scale: sortedScale,
        omni: sortedOmni,
        latestR2: sortedR2.length ? sortedR2[0] : null,
        latestScale: sortedScale.length ? sortedScale[0] : null,
        latestOmni: sortedOmni.length ? sortedOmni[0] : null,
        totalCount: totalCount,
        summary: totalCount > 0 ? ('Imported ' + parts.join(' + ') + '.') : 'No recognized DiFluid fields found.'
      };
      if (result.ok && !(opts && opts.dryRun === true)){
        mergeIntoCache(result);
      }
      return result;
    }

    async function fetchCloudRecords(opts){
      const o = opts || {};
      const cfg = getConfig();
      const baseUrl = o.baseUrl ? cleanUrl(o.baseUrl) : cfg.baseUrl;
      const apiKey = o.apiKey !== undefined ? String(o.apiKey || '').trim() : cfg.apiKey;
      const type = String(o.type || 'all').toLowerCase();
      const isLocalBridge = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.|10\.)/i.test(baseUrl);

      if (!apiKey && !isLocalBridge){
        return {
          ok: false, source: 'cloud', r2: [], scale: [], omni: [],
          latestR2: null, latestScale: null, latestOmni: null,
          errorCode: 'missing_key',
          message: 'Enter your DiFluid Partner SDK API Key (stored locally in your browser only), or paste/drop a DiFluid Cafe CSV, JSON, or text export.'
        };
      }

      const endpoint = baseUrl.replace(/\/+$/, '') + (o.path || ('/measurements' + (type !== 'all' ? ('?type=' + encodeURIComponent(type)) : '')));
      const headers = { Accept:'application/json' };
      if (apiKey){
        headers.Authorization = 'Bearer ' + apiKey;
        headers['X-API-Key'] = apiKey;
      }

      const fetchFn = typeof o.fetchImpl === 'function' ? o.fetchImpl : (typeof global.fetch === 'function' ? global.fetch.bind(global) : null);
      if (!fetchFn){
        return {
          ok: false, source: 'cloud', r2: [], scale: [], omni: [],
          latestR2: null, latestScale: null, latestOmni: null,
          errorCode: 'cors_or_network',
          message: 'Fetch API unavailable - use Zero-Key DiFluid Cafe CSV/JSON/Clipboard Import or Direct Web Bluetooth.'
        };
      }

      let res = null;
      try {
        res = await fetchFn(endpoint, { method:'GET', headers:headers, mode:'cors' });
      } catch(netErr){
        return {
          ok: false, source: 'cloud', r2: [], scale: [], omni: [],
          latestR2: null, latestScale: null, latestOmni: null,
          errorCode: 'cors_or_network',
          message: 'Could not reach ' + baseUrl + ' from browser due to CORS/network policy. Use Zero-Key DiFluid Cafe CSV/JSON/Paste Import or Direct Web Bluetooth.'
        };
      }

      if (res.status === 401 || res.status === 403){
        return {
          ok: false, source: 'cloud', r2: [], scale: [], omni: [],
          latestR2: null, latestScale: null, latestOmni: null,
          errorCode: 'auth_failed',
          message: 'Authentication rejected (' + res.status + ') - check your DiFluid Partner API Key.'
        };
      }
      if (!res.ok){
        return {
          ok: false, source: 'cloud', r2: [], scale: [], omni: [],
          latestR2: null, latestScale: null, latestOmni: null,
          errorCode: 'http_error',
          message: 'DiFluid endpoint returned HTTP ' + res.status + '.'
        };
      }

      try {
        const text = await res.text();
        const parsed = parseExport(text);
        if (!parsed.ok){
          return {
            ok: false, source: 'cloud', r2: [], scale: [], omni: [],
            latestR2: null, latestScale: null, latestOmni: null,
            errorCode: 'parse_error',
            message: 'Endpoint responded, but contained no recognized R2, Microbalance, or Omni records.'
          };
        }
        return {
          ok: true,
          source: 'cloud',
          r2: parsed.r2,
          scale: parsed.scale,
          omni: parsed.omni,
          latestR2: parsed.latestR2,
          latestScale: parsed.latestScale,
          latestOmni: parsed.latestOmni,
          errorCode: '',
          message: 'Synced ' + parsed.summary
        };
      } catch(parseErr){
        return {
          ok: false, source: 'cloud', r2: [], scale: [], omni: [],
          latestR2: null, latestScale: null, latestOmni: null,
          errorCode: 'parse_error',
          message: 'Failed to parse DiFluid response payload.'
        };
      }
    }

    function simulateOmniRead(preset){
      const p = String(preset || 'filter_light').toLowerCase();
      const nowIso = new Date().toISOString();
      const activeBean = (global.app && global.app.coffee && global.app.coffee.name) || 'Ethiopia Worka Sakaro';
      const activeGrinder = (global.app && ((global.app.brew && global.app.brew.grinderName) || (global.app.prefs && global.app.prefs.gear && global.app.prefs.gear.grinderName))) || '1Zpresso K-Ultra';

      let rec;
      if (/espresso|medium/.test(p) && !/dark/.test(p)){
        const swEsp = Codecs.agtronToRoastSwatch(63.0, 'ground');
        rec = {
          kind: 'omni', id: 'omni-sim-' + Date.now(), timestamp: nowIso,
          deviceModel: 'DiFluid Omni (DFT-SD101)', beanName: activeBean, grinderName: activeGrinder, dialSetting: '3.2',
          beanAgtron: 56.2, groundAgtron: 63.0, agtron: 63.0, roastDelta: 6.8,
          suggestedRoast: swEsp.roast, roastKey: swEsp.roastKey,
          d10Um: 118.0, d50Um: 268.0, d90Um: 442.0, span: 1.21,
          meanUm: 276.5, modeUm: 262.0, stdDevUm: 84.2, finesUnder200Pct: 24.5,
          bins: [
            { lowerUm:50, upperUm:100, pct:6.2 }, { lowerUm:100, upperUm:150, pct:8.8 },
            { lowerUm:150, upperUm:200, pct:9.5 }, { lowerUm:200, upperUm:250, pct:19.4 },
            { lowerUm:250, upperUm:300, pct:21.8 }, { lowerUm:300, upperUm:350, pct:14.2 },
            { lowerUm:350, upperUm:420, pct:11.6 }, { lowerUm:420, upperUm:600, pct:8.5 }
          ]
        };
      } else if (/dark/.test(p)){
        const swDark = Codecs.agtronToRoastSwatch(43.8, 'ground');
        rec = {
          kind: 'omni', id: 'omni-sim-' + Date.now(), timestamp: nowIso,
          deviceModel: 'DiFluid Omni (DFT-SD101)', beanName: activeBean, grinderName: activeGrinder, dialSetting: '7.8',
          beanAgtron: 39.5, groundAgtron: 43.8, agtron: 43.8, roastDelta: 4.3,
          suggestedRoast: swDark.roast, roastKey: swDark.roastKey,
          d10Um: 240.0, d50Um: 690.0, d90Um: 1080.0, span: 1.22,
          meanUm: 705.0, modeUm: 680.0, stdDevUm: 178.0, finesUnder200Pct: 8.2,
          bins: [
            { lowerUm:80, upperUm:200, pct:8.2 }, { lowerUm:200, upperUm:350, pct:9.4 },
            { lowerUm:350, upperUm:500, pct:13.0 }, { lowerUm:500, upperUm:650, pct:21.8 },
            { lowerUm:650, upperUm:800, pct:22.8 }, { lowerUm:800, upperUm:950, pct:13.6 },
            { lowerUm:950, upperUm:1100, pct:7.4 }, { lowerUm:1100, upperUm:1350, pct:3.8 }
          ]
        };
      } else {
        const swLight = Codecs.agtronToRoastSwatch(76.2, 'ground');
        rec = {
          kind: 'omni', id: 'omni-sim-' + Date.now(), timestamp: nowIso,
          deviceModel: 'DiFluid Omni (DFT-SD101)', beanName: activeBean, grinderName: activeGrinder, dialSetting: '6.5',
          beanAgtron: 68.4, groundAgtron: 76.2, agtron: 76.2, roastDelta: 7.8,
          suggestedRoast: swLight.roast, roastKey: swLight.roastKey,
          d10Um: 198.4, d50Um: 565.0, d90Um: 862.6, span: 1.18,
          meanUm: 578.2, modeUm: 558.0, stdDevUm: 142.5, finesUnder200Pct: 10.4,
          bins: [
            { lowerUm:60, upperUm:140, pct:4.6 }, { lowerUm:140, upperUm:200, pct:5.8 },
            { lowerUm:200, upperUm:320, pct:8.9 }, { lowerUm:320, upperUm:440, pct:14.2 },
            { lowerUm:440, upperUm:560, pct:22.6 }, { lowerUm:560, upperUm:680, pct:21.4 },
            { lowerUm:680, upperUm:840, pct:15.4 }, { lowerUm:840, upperUm:1150, pct:7.1 }
          ]
        };
      }

      mergeIntoCache({ omni:[rec] });
      try { global.dispatchEvent(new CustomEvent('bt-ble-omni', { detail:rec })); } catch(e){}
      return rec;
    }

    function getDemoDataset(){
      const nowIso = new Date().toISOString();
      const activeBean = (global.app && global.app.coffee && global.app.coffee.name) || 'Ethiopia Worka Sakaro';
      const r2List = [
        {
          kind:'r2', id:'r2-demo-1', timestamp:nowIso, beanName:activeBean,
          tds:1.42, brix:1.67, refractiveIndex:1.33524, tempC:24.5,
          doseG:15.0, waterG:250.0, yieldG:218.5, eyPct:20.68
        },
        {
          kind:'r2', id:'r2-demo-2', timestamp:nowIso, beanName:'Colombia El Paraiso Espresso',
          tds:9.38, brix:11.04, refractiveIndex:1.34810, tempC:26.1,
          doseG:18.0, waterG:38.0, yieldG:36.4, eyPct:18.97
        }
      ];
      const scaleList = [
        {
          kind:'scale', id:'mb-demo-1', timestamp:nowIso, deviceModel:'DiFluid Microbalance Ti',
          brewMethod:'v60', doseG:15.0, waterG:250.2, yieldG:218.5, timeS:168, avgFlowGs:4.8, peakFlowGs:6.2
        },
        {
          kind:'scale', id:'mb-demo-2', timestamp:nowIso, deviceModel:'DiFluid Microbalance',
          brewMethod:'espresso', doseG:18.0, waterG:36.4, yieldG:36.4, timeS:28, avgFlowGs:1.3, peakFlowGs:2.1
        }
      ];
      const omniFilter = simulateOmniRead('filter_light');
      const omniEsp = Object.assign({}, simulateOmniRead('espresso_medium'), { id:'omni-demo-2' });
      synced.r2 = r2List.slice();
      synced.scale = scaleList.slice();
      synced.omni = [omniFilter, omniEsp];
      synced.latestR2 = r2List[0];
      synced.latestScale = scaleList[0];
      synced.latestOmni = omniFilter;
      synced.updatedAt = nowIso;
      emit();

      return {
        ok: true,
        source: 'demo',
        r2: r2List,
        scale: scaleList,
        omni: [omniFilter, omniEsp],
        latestR2: r2List[0],
        latestScale: scaleList[0],
        latestOmni: omniFilter,
        totalCount: r2List.length + scaleList.length + 2,
        summary: 'Loaded DiFluid Ecosystem Demo (2 R2 Extract + 2 Microbalance Ti + 2 Omni Agtron/PSD scans).'
      };
    }

    return {
      STORAGE_KEY: STORAGE_KEY,
      DEFAULT_BASE_URL: DEFAULT_BASE_URL,
      getConfig: getConfig,
      setConfig: setConfig,
      clearApiKey: clearApiKey,
      fetchCloudRecords: fetchCloudRecords,
      parseExport: parseExport,
      getDemoDataset: getDemoDataset,
      simulateOmniRead: simulateOmniRead,
      agtronToRoastSwatch: Codecs.agtronToRoastSwatch,
      getLastSynced: getLastSynced,
      subscribe: subscribe,
      _pushLiveRecord: pushLiveRecord
    };
  }

  global.BTBleTransport = BTBleTransport;
  global.BTDiFluidApi = createBTDiFluidApiEngine();
  global.BTBle = createBTBleEngine();
})(typeof window !== 'undefined' ? window : globalThis);
