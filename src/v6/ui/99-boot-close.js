/* ==========================================================================
   BeanTelligence v6.0 — 99-boot-close.js
   Deterministic Race-Free Boot Sequence, Gate #1 Vault Hydration,
   Remembered WebBLE Auto-Reconnect & Non-Intrusive PWA Service Worker
   ========================================================================== */

function _isBrewActivelyRunning() {
  if (app && app.timerSave && app.timerSave.running) return true;
  if (BTSheet && BTSheet.currentKey && BTSheet.currentKey() === 'live-cockpit') return true;
  return false;
}

function _registerServiceWorkerSafely() {
  try {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    if (typeof location === 'undefined') return;
    const isSecureWeb = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (!isSecureWeb) return;
    if (_isBrewActivelyRunning()) return;

    navigator.serviceWorker.register('./sw.js', { scope: './' }).then(function(reg) {
      if (!reg) return;
      reg.addEventListener('updatefound', function() {
        const installing = reg.installing;
        if (!installing) return;
        installing.addEventListener('statechange', function() {
          if (installing.state === 'installed' && navigator.serviceWorker.controller && !_isBrewActivelyRunning()) {
            toast('App update cached for your next reload.', { duration: 4000 });
          }
        });
      });
    }).catch(function() {});
  } catch (e) {}
}

function _bindGlobalShellEvents() {
  const skip = $('skipLink');
  if (skip) {
    skip.addEventListener('click', function(e) {
      e.preventDefault();
      const m = $('mount');
      if (m) {
        m.focus();
        if (m.scrollIntoView) m.scrollIntoView({ block: 'start' });
      }
    });
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        if (BTPrecisionKeypad.isOpen()) {
          e.preventDefault();
          BTPrecisionKeypad.close();
        } else if (BTSheet.isOpen()) {
          e.preventDefault();
          BTSheet.close();
        } else {
          BTScienceLens.hideLoupe();
        }
      }
    });

    window.addEventListener('popstate', function(e) {
      if (BTPrecisionKeypad.isOpen()) {
        BTPrecisionKeypad.close();
        return;
      }
      if (BTSheet.isOpen()) {
        BTSheet.close();
        return;
      }
      const st = e.state;
      if (st && st.btV6) {
        if (st.tab && TAB_DEFS[st.tab]) app.activeTab = st.tab;
        if (st.screen) app.screen = st.screen;
        render();
      }
    });

    window.addEventListener('pagehide', flushDraft);

    try {
      if (window.matchMedia) {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const onScheme = function() {
          if (app && app.prefs && app.prefs.theme === 'system') {
            applyTheme('system');
            paintChrome();
          }
        };
        if (mq.addEventListener) mq.addEventListener('change', onScheme);
        else if (mq.addListener) mq.addListener(onScheme);
      }
    } catch (e) {}

    try {
      if (window.BTBle && typeof window.BTBle.subscribe === 'function') {
        window.BTBle.subscribe(function() {
          paintBlePill();
        });
      }
    } catch (e) {}
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'hidden') {
        flushDraft();
      } else if (document.visibilityState === 'visible' && _isBrewActivelyRunning()) {
        try {
          if (window.BTPlatform && window.BTPlatform.keepAwake && typeof window.BTPlatform.keepAwake.request === 'function') {
            window.BTPlatform.keepAwake.request();
          }
        } catch (e) {}
      }
    });
  }
}

function BTBoot() {
  if (typeof window !== 'undefined' && window.__btBooted) return;
  if (typeof window !== 'undefined') window.__btBooted = true;

  BTBrand.mountSprite();
  BTIcons.mountSprite();
  _bindGlobalShellEvents();

  const st = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : {};

  /* 1. Gate #1 Safety Snapshot BEFORE mutating any storage keys */
  try {
    const snapFn = st.ensurePreMigrationSnapshot || (typeof ensurePreMigrationSnapshot === 'function' ? ensurePreMigrationSnapshot : null);
    if (snapFn) {
      Promise.resolve(snapFn({ targetSchema: '6.0' })).catch(function() {});
    }
  } catch (e) {}

  /* 2. Non-destructive Legacy Alias Fallback */
  try {
    const fallbackFn = st.readStorageWithFallback || (typeof readStorageWithFallback === 'function' ? readStorageWithFallback : null);
    if (fallbackFn) fallbackFn();
  } catch (e) {}

  /* 3. Hydrate History, Prices, Shops, Academy & Active Draft */
  const callStoreHydrator = function(name) {
    try {
      if (typeof st[name] === 'function') st[name]();
      else if (typeof window !== 'undefined' && typeof window[name] === 'function') window[name]();
    } catch (e) {}
  };
  try { if (typeof loadHistory === 'function') loadHistory(); else callStoreHydrator('loadHistory'); } catch (e) {}
  try { if (typeof loadPrices === 'function') loadPrices(); else callStoreHydrator('loadPrices'); } catch (e) {}
  try { if (typeof loadShops === 'function') loadShops(); else callStoreHydrator('loadShops'); } catch (e) {}
  try { if (typeof loadShopDraft === 'function') loadShopDraft(); else callStoreHydrator('loadShopDraft'); } catch (e) {}
  try { if (typeof loadAcademy === 'function') loadAcademy(); else callStoreHydrator('loadAcademy'); } catch (e) {}

  loadDraft();

  /* Hydrate linked FileSystemFileHandles asynchronously if present */
  try {
    const pickedFn = st.loadPickedFile || (typeof loadPickedFile === 'function' ? loadPickedFile : null);
    if (pickedFn) Promise.resolve(pickedFn()).then(function() { refreshAll(); }).catch(function() {});
    const everyFn = st.loadEveryFile || (typeof loadEveryFile === 'function' ? loadEveryFile : null);
    if (everyFn) Promise.resolve(everyFn()).then(function() { refreshAll(); }).catch(function() {});
  } catch (e) {}

  /* 4. Render Initial Route / Tab */
  let hashKey = '';
  try {
    if (typeof location !== 'undefined' && location.hash && location.hash.length > 1) {
      hashKey = decodeURIComponent(location.hash.slice(1)).trim().toLowerCase();
    }
  } catch (e) {}

  if (hashKey && (ROUTE_MAP[hashKey] || TAB_DEFS[hashKey])) {
    go(hashKey);
  } else if (app.screen && app.screen !== 'door' && ROUTE_MAP[app.screen] && !ROUTE_MAP[app.screen].sheet) {
    const mapped = ROUTE_MAP[app.screen];
    app.activeTab = mapped.tab;
    if (mapped.segment) app.tabSegments[mapped.tab] = mapped.segment;
    render();
    navNote(false);
  } else {
    render();
    navNote(false);
  }

  /* 5. Silent Remembered WebBLE Auto-Reconnect */
  try {
    if (typeof window !== 'undefined' && window.BTBle && typeof window.BTBle.autoReconnectRemembered === 'function') {
      Promise.resolve(window.BTBle.autoReconnectRemembered()).then(function() {
        paintBlePill();
      }).catch(function() {});
    }
  } catch (e) {}

  /* 6. Non-Intrusive PWA Service Worker Registration */
  setTimeout(_registerServiceWorkerSafely, 350);
}

if (typeof window !== 'undefined') {
  window.BTBoot = BTBoot;
}

if (typeof document !== 'undefined' && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', BTBoot, { once: true });
} else {
  BTBoot();
}

})();
</script>
</body>
</html>
