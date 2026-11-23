/* ============================================================================
 * BeanTelligence v7.6 — Offline-First Non-Intrusive Service Worker (sw.js)
 * Cache Version: bt-pwa-v7.6.0
 * Brew-Safe Guarantee: Never forces mid-session takeover or reload during brews
 * ============================================================================ */
'use strict';

const CACHE_NAME = 'bt-pwa-v7.6.0';
const CRITICAL_PRECACHE_URLS = [
  './index.html',
  './manifest.webmanifest'
];
const PRECACHE_URLS = [
  './index.html',
  './manifest.webmanifest',
  './icons/icon-64.png',
  './icons/favicon-beanjamin.png',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

/* Per-client active brew timer tracking (safe across multiple tabs) */
const activeBrewClients = new Map();

async function isAnyClientBrewing(){
  try {
    const live = await self.clients.matchAll({ type:'window', includeUncontrolled:true });
    const liveIds = new Set(live.map(function(c){ return c.id; }));
    activeBrewClients.forEach(function(_, cid){
      if (cid !== 'default' && !liveIds.has(cid)) activeBrewClients.delete(cid);
    });
  } catch(e){}
  let busy = false;
  activeBrewClients.forEach(function(v){ if (v) busy = true; });
  return busy;
}

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
    const criticalSet = new Set(CRITICAL_PRECACHE_URLS);
    for (let i = 0; i < PRECACHE_URLS.length; i++){
      const url = PRECACHE_URLS[i];
      try {
        const req = new Request(url, { cache:'reload' });
        const res = await fetch(req);
        if (res && res.ok){
          await cache.put(url, res.clone());
        } else if (criticalSet.has(url)){
          throw new Error('Critical precache failed (' + (res ? res.status : 'no-response') + '): ' + url);
        }
      } catch(e){
        if (criticalSet.has(url)) throw e;
      }
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
  const cid = (event && event.source && event.source.id) ? String(event.source.id) : 'default';
  if (data.type === 'BT_BREW_STATUS'){
    if (data.brewActive) activeBrewClients.set(cid, true);
    else activeBrewClients.delete(cid);
    return;
  }
  if (data.type === 'BT_SKIP_WAITING'){
    if (data.brewActive === true) return;
    event.waitUntil((async function(){
      if (await isAnyClientBrewing()) return;
      self.skipWaiting();
    })());
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
        const prevLm = cached ? cached.headers.get('last-modified') : null;
        const nextLm = netRes.headers.get('last-modified');
        await cache.put(isNavigation ? './index.html' : req, netRes.clone());
        const changed = (prevEtag && nextEtag && prevEtag !== nextEtag) ||
          (!prevEtag && prevLm && nextLm && prevLm !== nextLm);
        if (isNavigation && cached && changed && !(await isAnyClientBrewing())){
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
      const fallbackShell = await cache.match('./index.html') || await cache.match('./');
      if (fallbackShell) return fallbackShell;
    }
    return new Response('Offline - BeanTelligence app shell not cached yet.', {
      status: 503,
      headers: { 'Content-Type':'text/plain; charset=utf-8' }
    });
  })());
});
