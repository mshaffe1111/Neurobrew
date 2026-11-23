/* ==========================================================================
   BeanTelligence v6.0 — 99-boot-close.js
   Deterministic Race-Free Boot Sequence, Gate #1 Vault Hydration,
   Remembered WebBLE Auto-Reconnect & Non-Intrusive PWA Service Worker
   ========================================================================== */

function _isTimerOrCockpitRunning() {
  if (app && app.timerSave && app.timerSave.running) return true;
  if (BTSheet && BTSheet.currentKey && BTSheet.currentKey() === 'live-cockpit') return true;
  if (typeof window !== 'undefined' && window.BTBrewStudio && window.BTBrewStudio.timerSession && window.BTBrewStudio.timerSession.running) return true;
  return false;
}

function _isBrewActivelyRunning() {
  if (_isTimerOrCockpitRunning()) return true;
  if (typeof window !== 'undefined' && window.BTPlatform && typeof window.BTPlatform.isBrewActive === 'function' && window.BTPlatform.isBrewActive()) return true;
  return false;
}

function _promptSwUpdateToast() {
  try {
    if (_isBrewActivelyRunning()) return;
    const pwa = (typeof window !== 'undefined' && window.BTPlatform && window.BTPlatform.pwa) ? window.BTPlatform.pwa : null;
    if (typeof document !== 'undefined' && document.body) {
      let bar = $('bt-sw-update-toast');
      if (!bar) {
        bar = h('div', {
          id: 'bt-sw-update-toast',
          role: 'status',
          'aria-live': 'polite',
          style: 'position:fixed;bottom:84px;left:50%;transform:translateX(-50%);z-index:115;display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:12px;background:var(--surface-raised,#FFFDF9);color:var(--ink,#1C130E);border:1.5px solid var(--primary,#1B4D38);box-shadow:0 8px 24px rgba(0,0,0,0.18);max-width:calc(100vw - 24px)'
        },
          h('span', { style: 'font-size:0.86rem;font-weight:700', text: 'A new BeanTelligence update is ready.' }),
          h('button', {
            type: 'button',
            id: 'bt-sw-update-apply-btn',
            class: 'bt-lab-btn is-primary',
            style: 'min-height:36px;padding:4px 12px;font-weight:800',
            onclick: function() {
              if (_isBrewActivelyRunning()) {
                toast('Finish your active brew first — update stays ready.');
                return;
              }
              if (typeof window !== 'undefined') window.__btUserRequestedSwReload = true;
              if (bar && bar.parentNode) bar.parentNode.removeChild(bar);
              if (pwa && typeof pwa.applyPendingUpdateIfSafe === 'function') {
                const res = pwa.applyPendingUpdateIfSafe();
                if (!res || !res.activated) {
                  try { if (typeof location !== 'undefined' && location.reload) location.reload(); } catch (_) {}
                }
              } else {
                try { if (typeof location !== 'undefined' && location.reload) location.reload(); } catch (_) {}
              }
            }
          }, h('span', { text: 'Update Now' })),
          h('button', {
            type: 'button',
            class: 'bt-lab-btn',
            style: 'min-height:36px;padding:4px 10px',
            onclick: function() { if (bar && bar.parentNode) bar.parentNode.removeChild(bar); }
          }, h('span', { text: 'Later' }))
        );
        document.body.appendChild(bar);
        return;
      }
    }
    toast('App update cached for your next reload.', { duration: 4000 });
  } catch (e) {}
}

function _registerServiceWorkerSafely() {
  try {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    if (typeof location === 'undefined') return;
    const isSecureWeb = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (!isSecureWeb) return;
    if (_isTimerOrCockpitRunning()) return;

    if (typeof window !== 'undefined' && !window.__btSwControllerBound) {
      window.__btSwControllerBound = true;
      navigator.serviceWorker.addEventListener('controllerchange', function() {
        if (window.__btUserRequestedSwReload && !_isBrewActivelyRunning()) {
          window.__btUserRequestedSwReload = false;
          try { if (typeof location !== 'undefined' && location.reload) location.reload(); } catch (_) {}
        }
      });
      window.addEventListener('bt-sw-update-ready', function(ev) {
        if (ev && ev.detail && ev.detail.updateAvailable) _promptSwUpdateToast();
      });
    }

    const pwa = (typeof window !== 'undefined' && window.BTPlatform && window.BTPlatform.pwa) ? window.BTPlatform.pwa : null;
    if (pwa && typeof pwa.registerServiceWorker === 'function') {
      if (typeof pwa.onUpdateReady === 'function' && (typeof window === 'undefined' || !window.__btSwUpdateListenerBound)) {
        if (typeof window !== 'undefined') window.__btSwUpdateListenerBound = true;
        pwa.onUpdateReady(function(info) {
          if (info && info.updateAvailable && !_isTimerOrCockpitRunning()) {
            _promptSwUpdateToast();
          }
        });
      }
      Promise.resolve(pwa.registerServiceWorker('./sw.js')).catch(function() {});
      return;
    }

    navigator.serviceWorker.register('./sw.js', { scope: './' }).then(function(reg) {
      if (!reg) return;
      reg.addEventListener('updatefound', function() {
        const installing = reg.installing;
        if (!installing) return;
        installing.addEventListener('statechange', function() {
          if (installing.state === 'installed' && navigator.serviceWorker.controller && !_isTimerOrCockpitRunning()) {
            _promptSwUpdateToast();
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

    window.addEventListener('hashchange', function() {
      try {
        if (typeof location !== 'undefined' && location.hash) {
          if (/[?#&](?:btsave|btsave_v6)=/i.test(location.hash)) {
            _checkAndOfferWebSaveRestore(location.hash);
          } else if (_extractSharedBrewToken(location.hash)) {
            if (_applySharedBrewAtBoot(location.hash)) {
              go('brew');
            }
          }
        }
      } catch (e) {}
    });

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

function _isLocalVaultCurrentlyEmpty(st) {
  try {
    const hist = (st && typeof st.getHistory === 'function') ? st.getHistory() : null;
    if (hist && Array.isArray(hist.objs) && hist.objs.length > 0) return false;
    const pr = (st && typeof st.getPrices === 'function') ? st.getPrices() : null;
    if (pr && Array.isArray(pr.list) && pr.list.length > 0) return false;
    const sh = (st && typeof st.getShops === 'function') ? st.getShops() : null;
    if (sh && sh.store && Array.isArray(sh.store.drinks) && sh.store.drinks.length > 0) return false;
    if (app && app.coffee && String(app.coffee.name || '').trim()) return false;
    if (typeof localStorage !== 'undefined') {
      if (localStorage.getItem('brew-and-cup-history-v1')) return false;
      if (localStorage.getItem('brew-and-cup-prices-v1')) return false;
      if (localStorage.getItem('brew-and-cup-shops-v1')) return false;
    }
  } catch (e) {}
  return true;
}

function _dismissWebSaveRestorePrompt() {
  try {
    const existing = $('bt-web-save-banner');
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
    if (typeof BTSheet !== 'undefined' && BTSheet && BTSheet.isOpen && BTSheet.isOpen() && BTSheet.currentKey && BTSheet.currentKey() === 'btsave-detected') {
      BTSheet.close();
    }
  } catch (e) {}
}

function _checkAndOfferWebSaveRestore(rawHashStr) {
  try {
    const st = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : null;
    if (!st || typeof st.decodeWebSaveUrl !== 'function' || typeof st.importFullSaveBundle !== 'function') return;
    const hashVal = String(rawHashStr || '');
    if (!/[?#&](?:btsave|btsave_v6)=/i.test(hashVal) && !/^(?:btsave|btsave_v6)=/i.test(hashVal)) return;
    if (typeof window !== 'undefined' && window.__btSelfAppliedSaveHash && window.__btSelfAppliedSaveHash === hashVal) return;

    const localIsEmpty = _isLocalVaultCurrentlyEmpty(st);
    const BOOT_AUTO_INFLATE_CAP = 2097152; /* 2 MB cap on unauthenticated boot-time auto-inflation */

    function mountLargeSavePrompt() {
      const oldBanner = $('bt-web-save-banner');
      if (oldBanner && oldBanner.parentNode) oldBanner.parentNode.removeChild(oldBanner);
      const largeBanner = h('section', {
        id: 'bt-web-save-banner',
        role: 'region',
        'aria-label': 'Large Save Link Detected',
        style: 'margin:10px 14px 4px;padding:13px 15px;border-radius:14px;border:2px solid var(--primary,#1B4D38);background:var(--good-bg,#E2F4EB);color:var(--ink,#1C130E);display:flex;flex-direction:column;gap:10px'
      },
        h('strong', { style: 'font-size:0.95rem;color:var(--good,#1B6341)', text: 'Large Save Link Detected (> 2 MB)' }),
        h('p', { style: 'margin:0;font-size:0.84rem;color:var(--ink-secondary,#534034)', text: 'For safety, large compressed save links are not unpacked automatically at boot. Confirm below if you trust this link.' }),
        h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap' },
          h('button', {
            type: 'button',
            class: 'bt-lab-btn is-primary',
            style: 'min-height:44px;font-weight:800',
            onclick: function() {
              _dismissWebSaveRestorePrompt();
              _checkAndOfferWebSaveRestore(hashVal, { allowLarge: true });
            }
          }, h('span', { text: 'Unpack Large Save Link' })),
          h('button', {
            type: 'button',
            class: 'bt-lab-btn',
            style: 'min-height:44px',
            onclick: _dismissWebSaveRestorePrompt
          }, h('span', { text: 'Dismiss' }))
        )
      );
      const centerStage = $('center-stage');
      const wsGrid = $('workspace-grid');
      const mountNode = $('mount');
      if (centerStage && wsGrid && wsGrid.parentNode === centerStage) centerStage.insertBefore(largeBanner, wsGrid);
      else if (mountNode && mountNode.parentNode) mountNode.parentNode.insertBefore(largeBanner, mountNode);
    }

    const decodeOpts = (arguments.length > 1 && arguments[1] && arguments[1].allowLarge) ? { maxBytes: 30000000 } : { maxBytes: BOOT_AUTO_INFLATE_CAP };
    Promise.resolve(st.decodeWebSaveUrl(hashVal, decodeOpts)).then(function(decodedBundle) {
      if (!decodedBundle || !decodedBundle.keys) return;
      const cCnt = decodedBundle.coffeeCount || 0;
      const bCnt = decodedBundle.brewCount || 0;
      const summaryCountsTxt = cCnt + ' ' + (cCnt === 1 ? 'Coffee' : 'Coffees') + ' \u00B7 ' +
        bCnt + ' Saved ' + (bCnt === 1 ? 'Brew' : 'Brews') + ' \u00B7 Preferences & Gear';

      function executeWebRestore(chosenMode) {
        Promise.resolve(st.importFullSaveBundle(decodedBundle, { mode: chosenMode })).then(function(res) {
          _dismissWebSaveRestorePrompt();
          if (res && res.ok) {
            try {
              render();
              refreshAll();
              paintChrome();
              paintStudioAside();
            } catch (_) {}
            toast('Save restored (' + (chosenMode === 'replace' ? 'Replaced' : 'Merged') + ')! ' + summaryCountsTxt + ' ready.', { duration: 4800 });
          } else {
            toast((res && res.error) || 'Could not restore save from web address.');
          }
        }).catch(function() {
          toast('Could not restore save from web address.');
        });
      }

      /* Mount prominent top banner right inside #center-stage above #workspace-grid */
      const oldBanner = $('bt-web-save-banner');
      if (oldBanner && oldBanner.parentNode) oldBanner.parentNode.removeChild(oldBanner);

      const bannerEl = h('section', {
        id: 'bt-web-save-banner',
        role: 'region',
        'aria-label': 'Save Link Detected in Web Address',
        style: 'margin:10px 14px 4px;padding:13px 15px;border-radius:14px;border:2px solid var(--primary,#1B4D38);background:var(--good-bg,#E2F4EB);color:var(--ink,#1C130E);display:flex;flex-direction:column;gap:10px;box-shadow:0 6px 18px rgba(27,77,56,0.12)'
      },
        h('div', { style: 'display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap' },
          h('div', { style: 'display:flex;align-items:flex-start;gap:9px;min-width:0;flex:1 1 220px' },
            BTIcons.el('vault-shield', { size: 22 }),
            h('div', { style: 'min-width:0' },
              h('strong', { style: 'display:block;font-size:0.98rem;color:var(--good,#1B6341)', text: 'Save Link Detected in Web Address!' }),
              h('span', { class: 'mono', style: 'display:block;font-size:0.82rem;font-weight:700;margin-top:2px;color:var(--ink,#1C130E)', text: summaryCountsTxt })
            )
          )
        ),
        h('div', { style: 'display:flex;flex-wrap:wrap;gap:8px;align-items:center' },
          h('button', {
            type: 'button',
            id: 'bt-boot-restore-merge-btn',
            class: 'bt-lab-btn is-primary',
            style: 'min-height:44px;font-weight:800;flex:1 1 200px',
            onclick: function() { executeWebRestore('merge'); }
          }, BTIcons.el('check-seal', { size: 16 }), h('span', { text: 'Restore My Save Now (Merge)' })),
          h('button', {
            type: 'button',
            id: 'bt-boot-restore-replace-btn',
            class: 'bt-lab-btn',
            style: 'min-height:44px;font-weight:700',
            onclick: function() { executeWebRestore('replace'); }
          }, h('span', { text: 'Replace Current Data' })),
          h('button', {
            type: 'button',
            id: 'bt-boot-restore-dismiss-btn',
            class: 'bt-lab-btn',
            style: 'min-height:44px',
            onclick: _dismissWebSaveRestorePrompt
          }, h('span', { text: 'Dismiss' }))
        )
      );

      const centerStage = $('center-stage');
      const wsGrid = $('workspace-grid');
      const mountNode = $('mount');
      if (centerStage && wsGrid && wsGrid.parentNode === centerStage) {
        centerStage.insertBefore(bannerEl, wsGrid);
      } else if (mountNode && mountNode.parentNode) {
        mountNode.parentNode.insertBefore(bannerEl, mountNode);
      }

      /* When local storage is empty (e.g. right after clearing browser history!), also open a prominent modal sheet right away */
      if (localIsEmpty && !_isBrewActivelyRunning() && typeof BTSheet !== 'undefined' && BTSheet && typeof BTSheet.open === 'function') {
        BTSheet.open({
          id: 'btsave-detected',
          title: 'Save Link Detected in Web Address!',
          detent: 'half',
          render: function(bodyEl) {
            bodyEl.textContent = '';
            bodyEl.appendChild(h('div', { style: 'display:flex;flex-direction:column;gap:12px;padding:4px 2px 12px' },
              h('div', {
                style: 'padding:14px;border-radius:14px;background:var(--good-bg,#E2F4EB);border:1.5px solid var(--good,#1B6341);display:flex;flex-direction:column;gap:6px'
              },
                h('div', { style: 'display:flex;align-items:center;gap:8px;color:var(--good,#1B6341);font-weight:800;font-size:1rem' },
                  BTIcons.el('vault-shield', { size: 22 }),
                  h('span', { text: 'Save Link Detected in Web Address!' })
                ),
                h('p', { class: 'mono', style: 'margin:0;font-size:0.88rem;font-weight:700;color:var(--ink,#1C130E)', text: summaryCountsTxt }),
                h('p', { style: 'margin:0;font-size:0.84rem;line-height:1.45;color:var(--ink-secondary,#534034)', text: 'Your browser storage on this device is currently empty, so we unpacked your bookmarked web save link automatically. Tap below to restore everything in 1 tap!' })
              ),
              h('button', {
                type: 'button',
                id: 'bt-sheet-restore-merge-btn',
                class: 'bt-lab-btn is-primary',
                style: 'width:100%;min-height:48px;font-size:0.94rem;font-weight:800',
                onclick: function() { executeWebRestore('merge'); }
              }, BTIcons.el('check-seal', { size: 17 }), h('span', { text: 'Restore My Save Now (Merge)' })),
              h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap' },
                h('button', {
                  type: 'button',
                  id: 'bt-sheet-restore-replace-btn',
                  class: 'bt-lab-btn',
                  style: 'flex:1 1 160px;min-height:44px;font-weight:700',
                  onclick: function() { executeWebRestore('replace'); }
                }, h('span', { text: 'Replace Current Data' })),
                h('button', {
                  type: 'button',
                  id: 'bt-sheet-restore-dismiss-btn',
                  class: 'bt-lab-btn',
                  style: 'flex:1 1 110px;min-height:44px',
                  onclick: _dismissWebSaveRestorePrompt
                }, h('span', { text: 'Dismiss' }))
              )
            ));
          }
        });
      }
    }).catch(function(err) {
      if (err && err.message === 'bk-too-big' && decodeOpts.maxBytes === BOOT_AUTO_INFLATE_CAP) {
        mountLargeSavePrompt();
      }
    });
  } catch (e) {}
}

function _parseBootSearchParams(rawSearch) {
  const out = {};
  const s = String(rawSearch || '').replace(/^\?/, '');
  if (!s) return out;
  try {
    if (typeof URLSearchParams === 'function') {
      const sp = new URLSearchParams(s);
      sp.forEach(function(val, key) {
        const k = String(key || '').trim().toLowerCase();
        if (k && out[k] === undefined) out[k] = String(val || '').trim();
      });
      return out;
    }
  } catch (e) {}
  s.split('&').forEach(function(pair) {
    if (!pair) return;
    const eq = pair.indexOf('=');
    const rk = eq >= 0 ? pair.slice(0, eq) : pair;
    const rv = eq >= 0 ? pair.slice(eq + 1) : '';
    try {
      const k = decodeURIComponent(rk.replace(/\+/g, ' ')).trim().toLowerCase();
      const v = decodeURIComponent(rv.replace(/\+/g, ' ')).trim();
      if (k && out[k] === undefined) out[k] = v;
    } catch (e) {}
  });
  return out;
}

function _extractSharedBrewToken(rawUrlPart) {
  let txt = String(rawUrlPart || '').trim();
  if (!txt) return '';
  try { txt = decodeURIComponent(txt); } catch (e) {}
  let m = /(?:^|[#?&])bt6=([A-Za-z0-9\-_]{8,})/i.exec(txt);
  if (m) return 'BT6:' + m[1];
  m = /(?:^|[#?&])bt1=([A-Za-z0-9\-_]{8,})/i.exec(txt);
  if (m) return 'bt1:' + m[1];
  m = /(?:^|[#?&])bp1=([A-Za-z0-9\-_]{8,})/i.exec(txt);
  if (m) return '#bp1=' + m[1];
  m = /(?:^|#)\s*(BT6:[A-Za-z0-9\-_]{8,}|bt1:[A-Za-z0-9\-_]{8,})/i.exec(txt);
  if (m) return m[1];
  return '';
}

function _extractBt6ExtraMeta(token) {
  if (!token || !/^BT6:/i.test(token)) return null;
  try {
    let clean = token.slice(4).replace(/-/g, '+').replace(/_/g, '/');
    while (clean.length % 4) clean += '=';
    if (typeof atob === 'function') {
      const json = decodeURIComponent(escape(atob(clean)));
      const obj = JSON.parse(json);
      return (obj && typeof obj === 'object') ? obj : null;
    }
  } catch (e) {}
  return null;
}

function _decodeSharedBrewForBoot(token) {
  if (!token) return null;
  const studio = (typeof window !== 'undefined' && window.BTBrewStudio) ? window.BTBrewStudio : null;
  if (studio && typeof studio.decodeSharedBrew === 'function') {
    const res = studio.decodeSharedBrew(token, app);
    if (res && res.ok) return res;
    if (/^#bp1=/i.test(token)) {
      const res2 = studio.decodeSharedBrew('bt1:' + token.slice(5), app);
      if (res2 && res2.ok) return res2;
    }
  }
  const inn = (typeof window !== 'undefined' && window.BTInnovate) ? window.BTInnovate : null;
  if (inn && typeof inn.decodeAndLocalizePassport === 'function') {
    const uri = /^#bp1=/i.test(token) ? ('bt1:' + token.slice(5)) : token;
    const dp = inn.decodeAndLocalizePassport(uri, (app && app.prefs) || {});
    if (dp && dp.ok && dp.localizedRecipe) {
      const lr = dp.localizedRecipe;
      return {
        ok: true,
        coffee: dp.bean || {},
        methodKey: lr.methodKey || 'v60',
        style: 'standard',
        doseG: +lr.doseG || 15,
        waterG: +lr.waterG || 250,
        ratio: +lr.ratio || 16.7,
        tempC: lr.tempC != null ? +lr.tempC : 93,
        localizedUm: +lr.d50Um || 560,
        rxGrindSetting: (lr.grinderSetting && (lr.grinderSetting.shortDisplay || lr.grinderSetting.label)) || ((+lr.d50Um || 560) + ' \u00B5m')
      };
    }
  }
  if (typeof window !== 'undefined' && typeof window.shareRead === 'function') {
    try {
      const sr = window.shareRead(token);
      if (sr && sr.ok && (sr.coffee || sr.brew)) {
        const b = sr.brew || {};
        const um = +b.grindUm || +b.um || 550;
        return {
          ok: true,
          coffee: sr.coffee || { name: 'Shared Coffee' },
          methodKey: b.method || 'v60',
          style: b.style || 'standard',
          doseG: +b.dose || 15,
          waterG: +b.water || 250,
          ratio: +b.ratio || 16.5,
          tempC: b.tempF ? Math.round(((+b.tempF - 32) * 5 / 9) * 2) / 2 : (+b.tempC || 94),
          localizedUm: um,
          rxGrindSetting: b.grind_setting || (um + ' \u00B5m')
        };
      }
    } catch (e) {}
  }
  return null;
}

function _applySharedBrewAtBoot(rawUrlPart) {
  const token = _extractSharedBrewToken(rawUrlPart);
  if (!token) return false;
  const dec = _decodeSharedBrewForBoot(token);
  if (!dec || !dec.ok) return false;

  const extra = _extractBt6ExtraMeta(token) || {};
  const dc = dec.coffee || {};
  const rawFlavors = dc.flavors || dc.bag_notes || dc.notes || extra.fl || extra.flavors || extra.bn || extra.notes || '';
  const bagNotesStr = Array.isArray(rawFlavors) ? rawFlavors.join(', ') : String(rawFlavors || '').trim();

  const freshCoffee = (typeof newCoffee === 'function') ? newCoffee() : {};
  app.coffee = Object.assign(freshCoffee, {
    name: dc.name || extra.n || 'Shared Coffee',
    roaster: dc.roaster || extra.r || '',
    origin: dc.origin || extra.o || '',
    region: dc.region || '',
    varietal: dc.varietal || '',
    process: dc.process || extra.p || 'washed',
    roast: dc.roast || extra.rl || 'medium-light',
    agtron: dc.ground_agtron || dc.agtron || '',
    ground_agtron: dc.ground_agtron || dc.agtron || '',
    roast_date: dc.roast_date || '',
    bag_notes: bagNotesStr,
    notes: bagNotesStr,
    nameUnsure: '',
    roastUnsure: '',
    processUnsure: '',
    originUnsure: '',
    notesUnsure: ''
  });
  if (Array.isArray(dc.flavors)) app.coffee.flavors = dc.flavors.slice();
  else if (Array.isArray(extra.fl)) app.coffee.flavors = extra.fl.slice();
  if (typeof syncCoffeeAliases === 'function') syncCoffeeAliases(app.coffee);

  app.brew = app.brew || {};
  app.brew.method = dec.methodKey || 'v60';
  app.brew.style = dec.style || 'standard';
  app.brew.dose = +dec.doseG || 15;
  app.brew.water = +dec.waterG || 250;
  app.brew.ratio = +dec.ratio || Math.round((app.brew.water / Math.max(1, app.brew.dose)) * 10) / 10;
  app.brew.tempC = dec.tempC != null ? +dec.tempC : 94;
  app.brew.tempF = Math.round((app.brew.tempC * 9 / 5) + 32);
  app.brew.grindUm = +dec.localizedUm || 550;
  app.brew.grind_um = app.brew.grindUm;
  app.brew.grind_setting = dec.rxGrindSetting || (app.brew.grindUm + ' \u00B5m');
  app.brew.customizedNote = 'Shared Brew (' + app.brew.grind_setting + ')';
  app.brew._savedDialedMethod = app.brew.method;
  app.brew.dialAdaptation = null;

  scheduleDraft();
  toast('Loaded shared recipe: ' + (app.coffee.name || 'Coffee') + ' (' + app.brew.grind_setting + ')', { duration: 4200 });
  return true;
}

function BTBoot() {
  if (typeof window !== 'undefined' && window.__btBooted) return;
  if (typeof window !== 'undefined') window.__btBooted = true;

  const initialBootHash = (typeof location !== 'undefined' && location.hash) ? String(location.hash) : '';
  const initialBootSearch = (typeof location !== 'undefined' && location.search) ? String(location.search) : '';
  const bootParams = _parseBootSearchParams(initialBootSearch);

  BTBrand.mountSprite();
  BTIcons.mountSprite();
  _bindGlobalShellEvents();

  const st = (typeof window !== 'undefined' && window.BTStorage) ? window.BTStorage : {};

  /* 0. Non-blocking Browser Persistent Storage Shield */
  try {
    if (typeof st.requestPersistentStorage === 'function') {
      Promise.resolve(st.requestPersistentStorage()).catch(function() {});
    }
  } catch (e) {}

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

  /* 4. Render Initial Route / Tab / Deep-Link / Shared Brew */
  let hashKey = '';
  try {
    if (initialBootHash && initialBootHash.length > 1) {
      hashKey = decodeURIComponent(initialBootHash.slice(1)).trim().toLowerCase();
    }
  } catch (e) {}

  const sharedBootApplied = _applySharedBrewAtBoot(initialBootHash) || _applySharedBrewAtBoot(initialBootSearch);
  const qRouteRaw = (bootParams.route || bootParams.screen || '').toLowerCase();
  const qStepRaw = (bootParams.step || '').toLowerCase();
  const qTabRaw = (bootParams.tab || '').toLowerCase();
  const qSegRaw = (bootParams.segment || '').toLowerCase();

  if (sharedBootApplied) {
    const sharedTarget = (qStepRaw && typeof normalizeBrewStep === 'function') ? normalizeBrewStep(qStepRaw) : 'brew';
    go(sharedTarget);
  } else if (qRouteRaw && (ROUTE_MAP[qRouteRaw] || TAB_DEFS[qRouteRaw])) {
    go(qRouteRaw);
  } else if (qStepRaw) {
    const stepKey = (typeof normalizeBrewStep === 'function') ? normalizeBrewStep(qStepRaw) : qStepRaw;
    go(ROUTE_MAP[stepKey] ? stepKey : 'door');
  } else if (qTabRaw) {
    const targetTab = qTabRaw === 'learn' ? 'academy' : ((qTabRaw === 'prefs' || qTabRaw === 'preferences') ? 'palate' : (TAB_DEFS[qTabRaw] ? qTabRaw : ''));
    if (targetTab) {
      switchTab(targetTab, qSegRaw ? { segment: qSegRaw } : undefined);
    } else {
      render();
      navNote(false);
    }
  } else if (hashKey && (ROUTE_MAP[hashKey] || TAB_DEFS[hashKey])) {
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

  /* 5. Boot-Time #btsave=... / ?btsave=... Web-Address Save Auto-Detection */
  if (initialBootHash && /[?#&](?:btsave|btsave_v6)=/i.test(initialBootHash)) {
    _checkAndOfferWebSaveRestore(initialBootHash);
  } else if (initialBootSearch && /[?&](?:btsave|btsave_v6)=/i.test(initialBootSearch)) {
    _checkAndOfferWebSaveRestore(initialBootSearch);
  }

  /* 6. Silent Remembered WebBLE Auto-Reconnect */
  try {
    if (typeof window !== 'undefined' && window.BTBle && typeof window.BTBle.autoReconnectRemembered === 'function') {
      Promise.resolve(window.BTBle.autoReconnectRemembered()).then(function() {
        paintBlePill();
      }).catch(function() {});
    }
  } catch (e) {}

  /* 7. Non-Intrusive PWA Service Worker Registration */
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
