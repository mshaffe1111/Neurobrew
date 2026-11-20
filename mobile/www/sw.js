/* ============================================================================
 * BeanTelligence v7.3 — Offline-First Non-Intrusive Service Worker (sw.js)
 * Cache Version: bt-pwa-v7.3.0
 * Brew-Safe Guarantee: Never forces mid-session takeover or reload during brews
 * ============================================================================ */
'use strict';

const CACHE_NAME = 'bt-pwa-v7.3.0';
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-64.png',
  './icons/favicon-beanjamin.png',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/icon-1024.png',
  './icons/og-beanjamin.png'
];

let clientBrewTimerActive = false;

async function notifyControlledClients(payload){
  try {
    const list = await self.clients.matchAll({ type:'window', includeUncontrolled:false });
    for (let i = 0; i < list.length; i++){
      try { list[i].postMessage(payload); } catch(e){}
    }
  } catch(e){}
}

self.addEventListener('install', function(event){
  event.waitUntil((async function(){
    const cache = await caches.open(CACHE_NAME);
    for (let i = 0; i < PRECACHE_URLS.length; i++){
      try {
        const req = new Request(PRECACHE_URLS[i], { cache:'reload' });
        const res = await fetch(req);
        if (res && res.ok){
          await cache.put(PRECACHE_URLS[i], res.clone());
        }
      } catch(e){}
    }
    /* Deliberately wait rather than forcing skipWaiting while any window is open */
  })());
});

self.addEventListener('activate', function(event){
  event.waitUntil((async function(){
    try {
      const keys = await caches.keys();
      for (let i = 0; i < keys.length; i++){
        const k = keys[i];
        if (k !== CACHE_NAME && (/^bt-pwa-|^beantelligence-/i.test(k))){
          await caches.delete(k);
        }
      }
    } catch(e){}
    /* Never force-takeover active brew sessions; notify idle windows gently */
    await notifyControlledClients({ type:'BT_SW_ACTIVATED', version:CACHE_NAME });
  })());
});

self.addEventListener('message', function(event){
  const data = (event && event.data) || {};
  if (data.type === 'BT_BREW_STATUS'){
    clientBrewTimerActive = !!data.brewActive;
    return;
  }
  if (data.type === 'BT_SKIP_WAITING'){
    if (data.brewActive === true || clientBrewTimerActive){
      return;
    }
    self.skipWaiting();
  }
});

self.addEventListener('fetch', function(event){
  const req = event.request;
  if (!req || req.method !== 'GET') return;

  let url;
  try {
    url = new URL(req.url);
  } catch(e){
    return;
  }

  /* Never intercept cross-origin API calls (e.g. local bridge or DiFluid Cloud) */
  if (url.origin !== self.location.origin) return;

  const isNavigation = req.mode === 'navigate' ||
    (req.headers.get('accept') || '').indexOf('text/html') >= 0;

  event.respondWith((async function(){
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req, { ignoreSearch:isNavigation }) ||
      (isNavigation ? await cache.match('./index.html') : null);

    const networkRefresh = fetch(req).then(async function(netRes){
      if (netRes && netRes.ok && netRes.type === 'basic'){
        const prevEtag = cached ? cached.headers.get('etag') : null;
        const nextEtag = netRes.headers.get('etag');
        await cache.put(req, netRes.clone());
        if (isNavigation && cached && prevEtag && nextEtag && prevEtag !== nextEtag && !clientBrewTimerActive){
          await notifyControlledClients({ type:'BT_SW_UPDATE_READY', version:CACHE_NAME });
        }
      }
      return netRes;
    }).catch(function(){
      return null;
    });

    if (cached){
      event.waitUntil(networkRefresh);
      return cached;
    }

    const fresh = await networkRefresh;
    if (fresh) return fresh;

    if (isNavigation){
      const fallbackShell = await cache.match('./') || await cache.match('./index.html');
      if (fallbackShell) return fallbackShell;
    }
    return new Response('Offline - BeanTelligence app shell not cached yet.', {
      status: 503,
      headers: { 'Content-Type':'text/plain; charset=utf-8' }
    });
  })());
});
