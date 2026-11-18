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

  /* ============================================================================
   * 1. SERIALIZED GATT WRITE / IO MUTEX (`BTWriteQueue`, 40ms spacing)
   * ============================================================================ */
  function createWriteQueue(spacingMs, timeoutMs){
    const gap = spacingMs == null ? 40 : Math.max(0, +spacingMs);
    const tmo = timeoutMs == null ? 2500 : Math.max(100, +timeoutMs);
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
                reject(new Error('BTWriteQueue GATT operation timed out after ' + tmo + 'ms'));
              }, tmo);
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
      enqueue: function(fn){
        return new Promise(function(resolve, reject){
          queue.push({ fn:fn, resolve:resolve, reject:reject });
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

    async function requestDevice(query){
      const cap = getCapabilities();
      if (!cap.supported){
        throw new Error(cap.platformLabel);
      }
      const q = query || {};
      const opts = {};
      if (!q.acceptAll && !q.acceptAllDevices && Array.isArray(q.filters) && q.filters.length){
        opts.filters = q.filters;
      } else {
        opts.acceptAllDevices = true;
      }
      opts.optionalServices = mergeOptionalServices(q.optionalServices);
      const rawDev = await navigator.bluetooth.requestDevice(opts);
      return {
        deviceId: String(rawDev.id || rawDev.name || ('webble-' + Date.now())),
        name: String(rawDev.name || ''),
        rawDevice: rawDev
      };
    }

    async function reconnectKnownDevice(saved){
      if (!saved || typeof navigator === 'undefined' || !navigator.bluetooth || typeof navigator.bluetooth.getDevices !== 'function'){
        return null;
      }
      try {
        const known = await navigator.bluetooth.getDevices();
        if (!Array.isArray(known) || !known.length) return null;
        let match = null;
        for (let i = 0; i < known.length; i++){
          const d = known[i];
          if (saved.deviceId && d.id === saved.deviceId){ match = d; break; }
          if (!match && saved.name && d.name && d.name === saved.name){ match = d; }
        }
        if (!match) return null;

        if (typeof match.watchAdvertisements === 'function' && typeof AbortController === 'function'){
          const ac = new AbortController();
          const advPromise = new Promise(function(resolve){
            const onAdv = function(){
              try { match.removeEventListener('advertisementreceived', onAdv); } catch(e){}
              try { ac.abort(); } catch(e){}
              resolve(true);
            };
            try { match.addEventListener('advertisementreceived', onAdv, { once:true }); } catch(e){}
            setTimeout(function(){
              try { match.removeEventListener('advertisementreceived', onAdv); } catch(e){}
              try { ac.abort(); } catch(e){}
              resolve(false);
            }, 1800);
          });
          try { await match.watchAdvertisements({ signal:ac.signal }); } catch(e){}
          await advPromise;
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
      const writeQueue = createWriteQueue(40, 2500);
      const svcCache = {};
      const charCache = {};
      const activeNotifyCleanups = [];

      const discListener = function(){
        writeQueue.clear();
        if (typeof onDisconnect === 'function'){
          try { onDisconnect(transportDevice.deviceId); } catch(e){}
        }
      };
      if (typeof raw.addEventListener === 'function'){
        raw.addEventListener('gattserverdisconnected', discListener);
      }

      const server = await raw.gatt.connect();

      async function listServicesCompat(candidateUuids){
        let svcs = [];
        if (typeof server.getPrimaryServices === 'function'){
          try {
            const all = await server.getPrimaryServices();
            if (Array.isArray(all) && all.length) svcs = all;
          } catch(e){}
        }
        if (!svcs.length && typeof server.getPrimaryService === 'function' && Array.isArray(candidateUuids)){
          for (let i = 0; i < candidateUuids.length; i++){
            try {
              const s = await server.getPrimaryService(candidateUuids[i]);
              if (s) svcs.push(s);
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
              const cl = await svc.getCharacteristics();
              if (Array.isArray(cl)) chars = cl;
            } catch(e){}
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
        const su = normUuid(serviceUuid);
        const cu = normUuid(charUuid);
        const key = su + '|' + cu;
        if (charCache[key]) return charCache[key];
        let svc = svcCache[su];
        if (!svc && typeof server.getPrimaryService === 'function'){
          svc = await server.getPrimaryService(su);
          if (svc) svcCache[su] = svc;
        }
        if (!svc) throw new Error('GATT service not found: ' + su);
        const ch = await svc.getCharacteristic(cu);
        if (ch) charCache[key] = ch;
        return ch;
      }

      return {
        deviceId: transportDevice.deviceId,
        name: String(raw.name || transportDevice.name || ''),
        writeQueue: writeQueue,
        discoverServices: function(candidateUuids){
          return writeQueue.enqueue(function(){
            return listServicesCompat(candidateUuids || []);
          });
        },
        startNotifications: function(serviceUuid, charUuid, onBytes){
          return writeQueue.enqueue(async function(){
            const ch = await resolveChar(serviceUuid, charUuid);
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
            const tryNoRespFirst = preferNoResp || (!!props.writeWithoutResponse && props.write === false);
            const methodOrder = tryNoRespFirst
              ? ['writeValueWithoutResponse', 'writeValueWithResponse', 'writeValue']
              : ['writeValueWithResponse', 'writeValueWithoutResponse', 'writeValue'];
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
        const writeQueue = createWriteQueue(40, 2500);

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
        const wq = createWriteQueue(40, 2500);
        return {
          deviceId: dev.deviceId,
          name: dev.name,
          writeQueue: wq,
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
      } else if (Math.abs(newRawG) <= 2.5 && preNet >= 15){
        /* Scale power-cycled / auto-zeroed with wet brewer still on tray: restore preDropNetWeightG! */
        softwareTareOffsetG = +(newRawG - preNet).toFixed(2);
      } else if (preNet >= 15 && newRawG > 2.5 && newRawG < preNet - 15){
        /* Scale zeroed during drop and user poured +newRawG more water */
        softwareTareOffsetG = -preNet;
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
      if (/acaia|lunar|pearl|pyxis|cinco|prochbt/.test(s)) return 'acaia';
      if (/difluid|microbalance|dft-?s|df-?s/.test(s)) return 'difluid';
      if (/bookoo|themis/.test(s)) return 'bookoo';
      if (/timemore|black\s*mirror|^tm\b/.test(s)) return 'timemore';
      if (/felicita|arc|incline|parallel/.test(s)) return 'felicita';
      if (/decent|hds|half\s*decent/.test(s)) return 'decent';
      if (/varia|aku|cube|mhw|exagram|wacaco/.test(s)) return 'varia';
      if (/skale|atomax/.test(s)) return 'skale';
      if (/eureka|precisa|cfs-?9002|brewista|lsj|smart\s*scale|formula|solobarista|kc200|weighmybru/.test(s)) return 'eureka';
      if (/hiroia|jimmy/.test(s)) return 'hiroia';
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
          { namePrefix:'ACAIA' }, { namePrefix:'Acaia' }, { namePrefix:'PROCHBT' },
          { namePrefix:'LUNAR' }, { namePrefix:'Lunar' },
          { namePrefix:'PEARL' }, { namePrefix:'Pearl' },
          { namePrefix:'PYXIS' }, { namePrefix:'Pyxis' },
          { namePrefix:'CINCO' }, { namePrefix:'Cinco' }
        ],
        difluid: [
          { services:[UUID.DIFLUID_SCALE_SVC] }, { services:[UUID.DIFLUID_SCALE_ALT_SVC] },
          { services:[UUID.DIFLUID_SVC] }, { services:[UUID.DIFLUID_V3_SVC] },
          { namePrefix:'Microbalance' }, { namePrefix:'MicroBalance' }, { namePrefix:'MICROBALANCE' },
          { namePrefix:'DiFluid' }, { namePrefix:'DIFLUID' },
          { namePrefix:'DFT-S' }, { namePrefix:'DF-S' }, { namePrefix:'DF' }
        ],
        bookoo: [
          { services:[UUID.BOOKOO_SVC] },
          { namePrefix:'BOOKOO' }, { namePrefix:'Bookoo' }, { namePrefix:'bookoo' },
          { namePrefix:'Themis' }, { namePrefix:'THEMIS' }
        ],
        timemore: [
          { services:[UUID.WEIGHT_SIG_SVC] }, { services:[UUID.SHARED_FFF0_SVC] }, { services:[UUID.TIMEMORE_CUSTOM_SVC] },
          { namePrefix:'Timemore' }, { namePrefix:'TIMEMORE' },
          { namePrefix:'Black Mirror' }, { namePrefix:'BLACK MIRROR' }, { namePrefix:'TM' }
        ],
        felicita: [
          { services:[UUID.FELICITA_SVC] },
          { namePrefix:'FELICITA' }, { namePrefix:'Felicita' }
        ],
        decent: [
          { services:[UUID.DECENT_SVC] },
          { namePrefix:'Decent' }, { namePrefix:'DECENT' }, { namePrefix:'Half Decent' }, { namePrefix:'HDS' }
        ],
        varia: [
          { services:[UUID.SHARED_FFF0_SVC] }, { services:[UUID.FELICITA_SVC] }, { services:[UUID.NUS_SVC] },
          { namePrefix:'Varia' }, { namePrefix:'VARIA' }, { namePrefix:'AKU' }, { namePrefix:'aku' },
          { namePrefix:'Cube' }, { namePrefix:'CUBE' }, { namePrefix:'MHW' },
          { namePrefix:'Exagram' }, { namePrefix:'EXAGRAM' }, { namePrefix:'Wacaco' }, { namePrefix:'WACACO' }
        ],
        skale: [
          { services:[UUID.SKALE_SVC] },
          { namePrefix:'Skale' }, { namePrefix:'SKALE' }
        ],
        eureka: [
          { services:[UUID.SHARED_FFF0_SVC] }, { services:[UUID.EUREKA_ALT_SVC] }, { services:[UUID.FELICITA_SVC] },
          { namePrefix:'Precisa' }, { namePrefix:'PRECISA' }, { namePrefix:'CFS-9002' },
          { namePrefix:'Eureka' }, { namePrefix:'EUREKA' }, { namePrefix:'LSJ' },
          { namePrefix:'Smart Scale' }, { namePrefix:'Brewista' }, { namePrefix:'BREWISTA' },
          { namePrefix:'Exagram' }, { namePrefix:'EXAGRAM' }, { namePrefix:'Wacaco' }, { namePrefix:'WACACO' },
          { namePrefix:'Cube' }, { namePrefix:'CUBE' }, { namePrefix:'MHW' },
          { namePrefix:'Formula' }, { namePrefix:'SoloBarista' }, { namePrefix:'KC200' }, { namePrefix:'WeighMyBru' }
        ],
        hiroia: [
          { services:[UUID.HIROIA_SVC] },
          { namePrefix:'HIROIA' }, { namePrefix:'Hiroia' }, { namePrefix:'JIMMY' }, { namePrefix:'Jimmy' }
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
      if (!isReconnect){
        resetFlowFilter();
        softwareTareOffsetG = 0;
        tarePendingZeroCheck = false;
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

    /* ---------- Zero-Prompt Silent Auto-Reconnect Across Remembered Gear ---------- */
    async function autoReconnectRemembered(slotFilter){
      const transport = getTransport();
      const savedList = getRememberedDevices().filter(function(d){
        return d.autoConnect !== false && (!slotFilter || d.slot === slotFilter);
      });
      const reconnected = [];
      for (let i = 0; i < savedList.length; i++){
        const saved = savedList[i];
        if (state.slots[saved.slot] && state.slots[saved.slot].connected) continue;
        const dev = await transport.reconnectKnownDevice(saved);
        if (!dev) continue;
        try {
          if (saved.slot === 'scale') await establishScaleSession(dev, saved.brand || 'auto', true);
          else if (saved.slot === 'pressure') await establishPressureSession(dev);
          else if (saved.slot === 'refractometer') await establishRefractometerSession(dev);
          else if (saved.slot === 'omni') await establishOmniSession(dev);
          else if (saved.slot === 'machine'){
            if (saved.brand === 'stagg_ekg_plus') await connectKettleWithDevice(dev);
            else await establishXBloomSession(dev);
          }
          reconnected.push(saved.slot);
        } catch(e){}
      }
      return { ok:reconnected.length > 0, reconnectedSlots:reconnected };
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
        const cleaned = String(v).replace(/[%°cbxµumg/s\s]+$/ig, '').replace(/,/g, '.').trim();
        const n = Number(cleaned);
        return Number.isFinite(n) ? n : null;
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
          const nk = k.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
          o[nk] = raw[k];
          if (raw[k] && typeof raw[k] === 'object' && !Array.isArray(raw[k])){
            Object.keys(raw[k]).forEach(function(sk){
              const snk = sk.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
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
        const delim = lines[0].indexOf('\t') >= 0 ? '\t' : (lines[0].indexOf(',') >= 0 ? ',' : '');
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
          const mTds = str.match(/tds\s*[:=]?\s*(\d+(?:\.\d+)?)\s*%/i) || str.match(/(\d+\.\d+)\s*%\s*tds/i);
          if (mTds) obj.tds = mTds[1];
          const mRi = str.match(/(?:nd|nd20|ri|refractive\s*index)\s*[:=]?\s*(1\.\d{4,6})/i);
          if (mRi) obj.refractive_index = mRi[1];
          const mTemp = str.match(/(?:temp(?:erature)?)\s*[:=]?\s*(\d+(?:\.\d+)?)\s*°?\s*c/i);
          if (mTemp) obj.temp_c = mTemp[1];
          const mBeanAg = str.match(/(?:whole\s*bean|bean)\s*agtron\s*[:=]?\s*(\d+(?:\.\d+)?)/i) || str.match(/(\d+(?:\.\d+)?)\s*\(\s*bean\s*\)/i);
          if (mBeanAg) obj.bean_agtron = mBeanAg[1];
          const mGroundAg = str.match(/(?:ground|grounds|powder)\s*agtron\s*[:=]?\s*(\d+(?:\.\d+)?)/i) || str.match(/(\d+(?:\.\d+)?)\s*\(\s*ground\s*\)/i);
          if (mGroundAg) obj.ground_agtron = mGroundAg[1];
          const mAg = str.match(/agtron\s*[:=]?\s*(\d+(?:\.\d+)?)/i);
          if (mAg && !obj.bean_agtron && !obj.ground_agtron) obj.agtron = mAg[1];
          const mD10 = str.match(/d10\s*[:=]?\s*(\d+(?:\.\d+)?)/i);
          if (mD10) obj.d10_um = mD10[1];
          const mD50 = str.match(/d50\s*[:=]?\s*(\d+(?:\.\d+)?)/i);
          if (mD50) obj.d50_um = mD50[1];
          const mD90 = str.match(/d90\s*[:=]?\s*(\d+(?:\.\d+)?)/i);
          if (mD90) obj.d90_um = mD90[1];
          const mDose = str.match(/dose\s*[:=]?\s*(\d+(?:\.\d+)?)\s*g/i);
          if (mDose) obj.dose_g = mDose[1];
          const mWater = str.match(/water\s*[:=]?\s*(\d+(?:\.\d+)?)\s*g/i);
          if (mWater) obj.water_g = mWater[1];
          const mYield = str.match(/(?:yield|liquid|out)\s*[:=]?\s*(\d+(?:\.\d+)?)\s*g/i);
          if (mYield) obj.yield_g = mYield[1];
          const mTime = str.match(/(?:time|duration)\s*[:=]?\s*(\d+)\s*s\b/i);
          if (mTime) obj.time_s = mTime[1];
          ingestRecord(obj, 0);
        }
      }

      const totalCount = r2.length + scale.length + omni.length;
      const parts = [];
      if (r2.length) parts.push(r2.length + ' R2 TDS');
      if (omni.length) parts.push(omni.length + ' Omni Agtron/PSD');
      if (scale.length) parts.push(scale.length + ' Microbalance Brew');

      const result = {
        ok: totalCount > 0,
        format: format,
        r2: r2,
        scale: scale,
        omni: omni,
        latestR2: r2.length ? r2[0] : null,
        latestScale: scale.length ? scale[0] : null,
        latestOmni: omni.length ? omni[0] : null,
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
