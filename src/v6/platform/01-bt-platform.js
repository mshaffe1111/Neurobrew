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
    try {
      if (typeof global.dispatchEvent === 'function' && typeof CustomEvent === 'function'){
        global.dispatchEvent(new CustomEvent('bt-sw-update-ready', { detail:{ updateAvailable:swUpdateAvailable } }));
      }
    } catch(e){}
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
