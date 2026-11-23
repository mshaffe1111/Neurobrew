/* ============================================================================
 * BeanTelligence v7.5 — Tab 4: Palate DNA, Real World Coffee Belt Map (52 Origins),
 * Empirical-Bayes 4-Level Drill-In, Smart Bag Buyer's Guide,
 * 85-Descriptor Sunburst Flavor Wheel & 36-Vial Aroma Kit Tracker
 * Module: src/v6/ui/10-tab-palate-insights.js
 * Registers:
 *   - Tab 4: 'palate'
 *   - Legacy Routes: 'palate', 'flavorwheel', 'explore', 'tend', 'tpboard',
 *     'tpbrewers', 'tpmix', 'tpshops', 'buy', 'wheels', 'wheel'
 * Zero raw Unicode emojis, real arrows, accessible >=16px inputs.
 * ============================================================================ */

(function () {
  'use strict';

  const CK = window.BTChartKit;
  const clamp = (CK && typeof CK.clamp === 'function') ? CK.clamp : function (v, lo, hi, fb) {
    const n = typeof v === 'number' ? v : parseFloat(v);
    if (!Number.isFinite(n)) return fb !== undefined ? fb : lo;
    return n < lo ? lo : n > hi ? hi : n;
  };
  const SVG_NS = 'http://www.w3.org/2000/svg';

  function sh() { return window.BTShell || {}; }

  function domH(tag, props) {
    const fn = typeof h === 'function' ? h : sh().h;
    const kids = Array.prototype.slice.call(arguments, 2);
    if (typeof fn === 'function') return fn.apply(null, [tag, props].concat(kids));
    const isSvg = /^(svg|path|circle|rect|line|polyline|polygon|g|defs|linearGradient|radialGradient|stop|text|ellipse)$/i.test(tag);
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
    if (window.BTIcons && typeof window.BTIcons.el === 'function') return window.BTIcons.el(name, opts);
    if (typeof BTIcons !== 'undefined' && BTIcons && typeof BTIcons.el === 'function') return BTIcons.el(name, opts);
    const s = document.createElementNS(SVG_NS, 'svg');
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('class', 'bt-ico bti-' + name);
    s.setAttribute('aria-hidden', 'true');
    const c = document.createElementNS(SVG_NS, 'circle');
    c.setAttribute('cx', '12'); c.setAttribute('cy', '12'); c.setAttribute('r', '7');
    c.setAttribute('fill', 'none'); c.setAttribute('stroke', 'currentColor'); c.setAttribute('stroke-width', '1.75');
    s.appendChild(c);
    return s;
  }

  function getApp() {
    if (sh().app) return sh().app;
    if (typeof app !== 'undefined' && app) return app;
    window.__btFallbackApp = window.__btFallbackApp || { coffee: {}, brew: {}, prefs: {}, gear: {} };
    return window.__btFallbackApp;
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

  function getLensLevel() {
    if (CK && typeof CK.lensLevel === 'function') return CK.lensLevel();
    if (window.BTScienceLens && typeof window.BTScienceLens.level === 'function') return window.BTScienceLens.level();
    const a = getApp();
    const m2 = (a.prefs && (a.prefs.lens || a.prefs.scienceLens)) || document.documentElement.getAttribute('data-science-lens') || 'comfy';
    if (m2 === 'xray' || m2 === 'scientist' || m2 === 'expert') return 'scientist';
    if (m2 === 'surface' || m2 === 'starter' || m2 === 'new') return 'starter';
    return 'comfy';
  }

  function isScienceXray() {
    return getLensLevel() === 'scientist';
  }

  /* ==========================================================================
   * 52 COFFEE-PRODUCING ORIGINS ATLAS & EQUIRECTANGULAR WORLD BELT PROJECTION
   *   Map Space: W = 664 (lon -168..+164 @ 2.0 px/deg), H = 256 (lat +42..-38 @ 3.2 px/deg)
   * ========================================================================== */
  function projLonX(lon) { return (clamp(lon, -168, 164, 0) + 168) * 2.0; }
  function projLatY(lat) { return (42 - clamp(lat, -38, 42, 0)) * 3.2; }

  function polyLonLatToPath(coords, closed) {
    if (!Array.isArray(coords) || !coords.length) return '';
    let d = '';
    for (let i = 0; i < coords.length; i++) {
      const x = projLonX(coords[i][0]).toFixed(1);
      const y = projLatY(coords[i][1]).toFixed(1);
      d += (i === 0 ? 'M ' : ' L ') + x + ' ' + y;
    }
    return closed !== false ? (d + ' Z') : d;
  }

  /* Recognizable Multi-Point Continental & Island Coastlines across [-168..164, -38..+42] */
  const WORLD_COASTLINES_LONLAT = [
    /* North & Central America */
    [
      [-125, 42], [-124, 38], [-120, 34], [-115, 28], [-110, 23.5], [-113, 29], [-109, 29],
      [-105, 20], [-97, 16], [-92.5, 14.5], [-89, 13.5], [-86, 11.5], [-83.5, 9.2], [-79.5, 8.8],
      [-77.5, 8.2], [-79, 9.6], [-83, 10.5], [-83.3, 14.8], [-88, 15.8], [-87.5, 21.4], [-90.5, 21.2],
      [-91, 18.6], [-96, 19.5], [-97, 26], [-93, 29.5], [-89, 29.2], [-84, 30], [-81, 25.2],
      [-80.1, 27], [-81, 31], [-76, 35], [-74, 40.5], [-70, 42]
    ],
    /* Cuba, Hispaniola, Jamaica, Puerto Rico & Hawaii */
    [[-84.9, 21.8], [-80, 23.1], [-74.2, 20.1], [-77.5, 19.9], [-82, 21.6]],
    [[-74.4, 18.4], [-71.8, 19.8], [-68.4, 18.5], [-71.6, 17.7]],
    [[-78.3, 18.3], [-76.2, 18.0], [-77.3, 17.8]],
    [[-67.3, 18.5], [-65.6, 18.3], [-66.8, 17.9]],
    [[-160.2, 22.1], [-157.8, 21.4], [-156.2, 20.7], [-155.0, 19.5], [-155.9, 19.0], [-158.2, 20.8]],
    /* South America */
    [
      [-77.5, 8.2], [-75.5, 10.8], [-71.5, 11.8], [-66, 10.6], [-61, 10.2], [-56, 6.0], [-51, 2.0],
      [-48, -1.5], [-41, -3.0], [-35.0, -5.8], [-34.8, -8.2], [-38.5, -13.0], [-39.5, -18.5],
      [-41, -22.8], [-48.5, -26.5], [-53.5, -33.8], [-58, -36.5], [-62, -38], [-73, -38],
      [-71.6, -33], [-70.5, -24], [-70.2, -18.4], [-75.5, -14.5], [-79, -8], [-81.2, -4.8],
      [-79.8, -1.5], [-78.8, 1.5], [-77.3, 4.5]
    ],
    /* Southern Europe & Mediterranean Rim */
    [[-9.4, 42], [-9.2, 37], [-5.5, 36.1], [0, 38.8], [3.2, 42]],
    [[8, 42], [13.5, 41.2], [16.2, 38.2], [18.4, 40.2], [15, 42]],
    [[20, 42], [22.5, 37], [26, 38.5], [27.5, 36.5], [35.8, 36.2], [36, 42]],
    /* Africa */
    [
      [-5.8, 35.8], [3, 36.8], [10.2, 37.1], [11, 33.5], [20, 32.5], [32.3, 31.3], [33.8, 28],
      [37.2, 21], [41, 15], [43.3, 12.6], [49, 11.5], [51.3, 10.4], [45.3, 2.0], [40.9, -2.5],
      [39.6, -6.8], [40.5, -11], [40.6, -15.5], [35.2, -19.8], [35.4, -24], [32.8, -26.8],
      [28, -32.8], [20.0, -34.8], [18.4, -33.9], [16.5, -28.6], [14.5, -22.9], [12.0, -17],
      [13.2, -8.8], [11.8, -4.8], [9.4, 0.5], [9.6, 4.0], [5.5, 4.4], [1.2, 6.1], [-4.0, 5.2],
      [-7.7, 4.4], [-11.5, 6.9], [-13.7, 9.6], [-16.7, 13.4], [-17.5, 14.7], [-16.5, 19.5],
      [-17.0, 21.0], [-13.2, 27.8], [-9.8, 31.5]
    ],
    /* Madagascar */
    [[49.3, -12.0], [50.4, -15.4], [49.5, -19.5], [47.0, -25.0], [44.0, -24.8], [43.3, -21.5], [44.5, -16.2], [47.8, -13.4]],
    /* Arabian Peninsula & Levant */
    [
      [34.5, 31.5], [35.8, 36.2], [44, 37], [48.5, 30.2], [50.2, 26.5], [51.5, 25.8], [55.5, 25.5],
      [56.4, 26.2], [59.8, 22.5], [57.8, 19.5], [53.2, 16.8], [48.0, 14.0], [43.5, 12.7],
      [42.6, 16.8], [39.1, 21.5], [36.8, 25.5], [34.8, 29.5]
    ],
    /* South & Mainland East/Southeast Asia */
    [
      [48.5, 30.2], [56.5, 27.1], [61.5, 25.2], [67.0, 24.8], [69.0, 22.4], [72.8, 21.2],
      [72.8, 19.0], [74.8, 13.0], [77.5, 8.1], [80.3, 13.1], [85.0, 19.5], [88.5, 21.8],
      [91.8, 22.3], [92.3, 20.0], [94.3, 16.0], [97.6, 16.5], [98.5, 10.0], [100.3, 5.4],
      [103.8, 1.3], [104.2, 3.8], [102.2, 6.2], [100.6, 13.5], [102.8, 11.8], [104.8, 10.4],
      [106.8, 8.6], [109.2, 12.2], [108.2, 16.1], [105.8, 19.8], [106.8, 20.8], [109.8, 21.5],
      [114.2, 22.3], [118.2, 24.5], [121.5, 28.5], [122.0, 31.2], [120.5, 36.0], [122, 42],
      [60, 42]
    ],
    /* Sri Lanka & Taiwan */
    [[79.8, 9.5], [81.8, 7.4], [80.6, 5.9], [79.8, 7.2]],
    [[120.1, 23.1], [121.0, 25.2], [121.9, 24.8], [120.8, 21.9]],
    /* Sumatra, Java, Borneo, Sulawesi, Philippines & New Guinea */
    [[95.3, 5.6], [99.8, 3.2], [104.5, -1.8], [105.9, -5.9], [102.2, -3.8], [98.5, 1.2]],
    [[105.4, -6.1], [110.5, -6.9], [114.5, -7.8], [114.2, -8.7], [108.5, -7.8], [105.8, -6.8]],
    [[115.0, -8.5], [124.5, -8.3], [127.2, -8.5], [124.0, -10.2], [116.0, -9.0]], /* Lesser Sundas & Timor */
    [[109.2, 1.8], [111.8, 4.5], [117.5, 6.8], [118.8, 4.2], [117.5, 1.0], [116.2, -3.5], [111.5, -3.2], [109.5, -0.5]],
    [[119.5, 1.2], [125.0, 1.5], [122.5, -0.8], [123.0, -4.5], [120.4, -5.5], [118.9, -2.8]],
    [[120.0, 18.4], [122.4, 17.5], [124.2, 12.8], [126.2, 9.5], [125.5, 6.0], [122.0, 6.8], [121.0, 13.8], [119.8, 16.2]],
    [[131.0, -1.2], [136.0, -2.2], [141.0, -2.6], [145.8, -5.2], [148.0, -8.2], [150.6, -10.5], [147.0, -9.8], [143.2, -8.4], [138.5, -8.2], [134.5, -4.2]],
    /* Australia */
    [
      [142.5, -10.8], [145.5, -15.5], [149.2, -21.0], [153.6, -28.2], [151.2, -33.9], [149.8, -37.5],
      [144.8, -38.0], [138.5, -35.2], [135.5, -34.8], [129.0, -31.8], [121.8, -33.9], [115.0, -34.2],
      [114.1, -25.8], [114.2, -21.8], [122.2, -18.0], [126.8, -13.8], [130.8, -12.4], [136.8, -12.2],
      [136.0, -15.5], [141.4, -16.8]
    ]
  ];

  /* Complete 52-Origin Atlas Fallback (unified keys matching ORIGINS + Ivory Coast restored + rich aliases) */
  const ORIGIN_KEY_CANON = {
    drc: 'drcongo',
    png: 'papuanewguinea',
    dominican: 'dominicanrepublic'
  };

  const ORIGIN_ATLAS_52 = [
    { key: 'colombia', name: 'Colombia', zone: 'americas', lat: 4.57, lon: -74.30, sub: ['Huila', 'Cauca', 'Narino', 'Tolima'], aliases: ['colombia', 'colombian', 'huila', 'cauca', 'narino', 'tolima', 'antioquia', 'quindio'], notes: 'Stone fruit, cane sugar, bright malic/citric' },
    { key: 'ethiopia', name: 'Ethiopia', zone: 'africa', lat: 7.55, lon: 38.76, sub: ['Yirgacheffe', 'Guji', 'Sidama', 'Gedeo'], aliases: ['ethiopia', 'ethiopian', 'yirgacheffe', 'yirgachefe', 'guji', 'sidama', 'sidamo', 'gedeo', 'gedeb', 'harrar', 'harar', 'limu', 'worka', 'chelbesa'], notes: 'Bergamot, jasmine, blueberry, white peach' },
    { key: 'brazil', name: 'Brazil', zone: 'americas', lat: -19.92, lon: -45.20, sub: ['Cerrado Mineiro', 'Sul de Minas', 'Mogiana'], aliases: ['brazil', 'brazilian', 'brasil', 'cerrado', 'cerrado mineiro', 'sul de minas', 'mogiana', 'minas gerais', 'bahia'], notes: 'Hazelnut, milk chocolate, creamy low-acid body' },
    { key: 'kenya', name: 'Kenya', zone: 'africa', lat: -0.42, lon: 37.08, sub: ['Nyeri', 'Kirinyaga', 'Kiambu', 'Embu'], aliases: ['kenya', 'kenyan', 'nyeri', 'kirinyaga', 'kiambu', 'embu', 'muranga', 'mt kenya', 'mount kenya'], notes: 'Blackcurrant, pink grapefruit, sparkling SL28' },
    { key: 'guatemala', name: 'Guatemala', zone: 'americas', lat: 14.63, lon: -90.98, sub: ['Antigua', 'Huehuetenango', 'Acatenango'], aliases: ['guatemala', 'guatemalan', 'antigua', 'huehuetenango', 'acatenango', 'atitlan', 'coban'], notes: 'Toffee, red apple, structured cocoa' },
    { key: 'costarica', name: 'Costa Rica', zone: 'americas', lat: 9.65, lon: -84.03, sub: ['Tarrazu', 'West Valley', 'Central Valley'], aliases: ['costa rica', 'costa rican', 'tarrazu', 'tarazu', 'west valley', 'central valley', 'tres rios'], notes: 'Honey sweetness, apricot, clean citrus' },
    { key: 'panama', name: 'Panama', zone: 'americas', lat: 8.78, lon: -82.43, sub: ['Boquete', 'Volcan', 'Renacimiento'], aliases: ['panama', 'panamanian', 'boquete', 'chiriqui', 'volcan', 'renacimiento'], notes: 'Jasmine, bergamot, white peach (Gesha)' },
    { key: 'honduras', name: 'Honduras', zone: 'americas', lat: 14.50, lon: -87.80, sub: ['Santa Barbara', 'Copan', 'Marcala'], aliases: ['honduras', 'honduran', 'santa barbara', 'copan', 'marcala', 'opalaca', 'comayagua'], notes: 'Caramel, tropical mango, juicy plum' },
    { key: 'elsalvador', name: 'El Salvador', zone: 'americas', lat: 13.85, lon: -89.55, sub: ['Santa Ana', 'Apaneca-Ilamatepec'], aliases: ['el salvador', 'salvadoran', 'salvadorian', 'santa ana', 'apaneca', 'ilamatepec', 'chalatenango'], notes: 'Sweet mandarin, nougat, Pacamara florals' },
    { key: 'nicaragua', name: 'Nicaragua', zone: 'americas', lat: 13.08, lon: -86.00, sub: ['Jinotega', 'Matagalpa', 'Nueva Segovia'], aliases: ['nicaragua', 'nicaraguan', 'jinotega', 'matagalpa', 'nueva segovia'], notes: 'Poached pear, vanilla, roasted almond' },
    { key: 'peru', name: 'Peru', zone: 'americas', lat: -11.25, lon: -75.33, sub: ['Cajamarca', 'Cusco', 'Amazonas'], aliases: ['peru', 'peruvian', 'cajamarca', 'cusco', 'amazonas', 'junin', 'puno'], notes: 'Sweet panela, red plum, floral cocoa' },
    { key: 'mexico', name: 'Mexico', zone: 'americas', lat: 16.75, lon: -92.64, sub: ['Chiapas', 'Oaxaca', 'Veracruz'], aliases: ['mexico', 'mexican', 'chiapas', 'oaxaca', 'veracruz'], notes: 'Praline, crisp pear, delicate cinnamon' },
    { key: 'ecuador', name: 'Ecuador', zone: 'americas', lat: -3.99, lon: -79.20, sub: ['Loja', 'Pichincha', 'Zamora'], aliases: ['ecuador', 'ecuadorian', 'ecuadorean', 'loja', 'pichincha', 'zamora', 'galapagos'], notes: 'Sidra/Typica florals, raspberry, wild honey' },
    { key: 'bolivia', name: 'Bolivia', zone: 'americas', lat: -16.18, lon: -67.73, sub: ['Caranavi', 'Yungas'], aliases: ['bolivia', 'bolivian', 'caranavi', 'yungas', 'coroico'], notes: 'High-Andes mandarin, jasmine, cocoa' },
    { key: 'rwanda', name: 'Rwanda', zone: 'africa', lat: -2.18, lon: 29.56, sub: ['Nyamasheke', 'Huye', 'Gakenke'], aliases: ['rwanda', 'rwandan', 'nyamasheke', 'huye', 'gakenke', 'rulindo'], notes: 'Cranberry, orange blossom, black tea' },
    { key: 'burundi', name: 'Burundi', zone: 'africa', lat: -3.15, lon: 29.74, sub: ['Kayanza', 'Ngozi', 'Muyinga'], aliases: ['burundi', 'burundian', 'kayanza', 'ngozi', 'muyinga', 'kirundo'], notes: 'Red currant, spiced honey, hibiscus' },
    { key: 'uganda', name: 'Uganda', zone: 'africa', lat: 1.15, lon: 34.25, sub: ['Mount Elgon', 'Rwenzori'], aliases: ['uganda', 'ugandan', 'mount elgon', 'mt elgon', 'rwenzori', 'bugisu', 'sipi falls'], notes: 'Dried fig, dark berry, cacao nib' },
    { key: 'tanzania', name: 'Tanzania', zone: 'africa', lat: -3.25, lon: 37.33, sub: ['Kilimanjaro', 'Mbeya', 'Ngorongoro'], aliases: ['tanzania', 'tanzanian', 'kilimanjaro', 'mbeya', 'ngorongoro', 'ruvuma'], notes: 'Blackberry, lime zest, crisp black tea' },
    { key: 'drcongo', name: 'DR Congo', zone: 'africa', lat: -1.65, lon: 29.05, sub: ['South Kivu', 'North Kivu', 'Lake Kivu'], aliases: ['dr congo', 'drc', 'congo', 'congolese', 'democratic republic of the congo', 'democratic republic of congo', 'south kivu', 'north kivu', 'nord kivu', 'sud kivu', 'lake kivu', 'ituri'], notes: 'Sweet dark cherry, blood orange, cola spice' },
    { key: 'malawi', name: 'Malawi', zone: 'africa', lat: -11.45, lon: 34.02, sub: ['Misuku Hills', 'Shire Highlands'], aliases: ['malawi', 'malawian', 'misuku', 'misuku hills', 'mzuzu', 'phoka hills'], notes: 'Sweet mandarin, honeyed tea blossom' },
    { key: 'zambia', name: 'Zambia', zone: 'africa', lat: -10.20, lon: 31.18, sub: ['Northern Province', 'Muchinga'], aliases: ['zambia', 'zambian', 'kasama', 'muchinga', 'mafinga hills', 'kateshi'], notes: 'Bright pomelo, caramel, black tea' },
    { key: 'indonesia', name: 'Indonesia', zone: 'asia', lat: -0.58, lon: 101.34, sub: ['Sumatra Aceh/Gayo', 'Java', 'Bali Kintamani', 'Sulawesi Toraja'], aliases: ['indonesia', 'indonesian', 'sumatra', 'sumatran', 'java', 'javanese', 'west java', 'east java', 'central java', 'jawa', 'bali', 'kintamani', 'sulawesi', 'toraja', 'gayo', 'aceh', 'mandheling', 'lintong', 'flores island'], notes: 'Cedar spice, dark cocoa, tropical fruit' },
    { key: 'vietnam', name: 'Vietnam', zone: 'asia', lat: 11.94, lon: 108.44, sub: ['Da Lat', 'Lam Dong', 'Buon Ma Thuot'], aliases: ['vietnam', 'vietnamese', 'viet nam', 'da lat', 'dalat', 'lam dong', 'dak lak', 'buon ma thuot'], notes: 'Dark chocolate, roasted hazelnut, Dalat Arabica' },
    { key: 'india', name: 'India', zone: 'asia', lat: 13.32, lon: 75.77, sub: ['Chikmagalur', 'Coorg', 'Araku Valley'], aliases: ['india', 'indian', 'chikmagalur', 'coorg', 'kodagu', 'araku', 'araku valley', 'malabar', 'monsooned malabar', 'mysore', 'karnataka', 'kerala', 'nilgiris'], notes: 'Cardamom, baker cocoa, Monsooned velvet' },
    { key: 'papuanewguinea', name: 'Papua New Guinea', zone: 'asia', lat: -6.08, lon: 145.39, sub: ['Eastern Highlands', 'Wahgi Valley'], aliases: ['papua new guinea', 'png', 'papua new guinean', 'wahgi', 'wahgi valley', 'sigri', 'goroka', 'mount hagen', 'mt hagen', 'kainantu'], notes: 'Mango, cane sugar, crisp orchard fruit' },
    { key: 'yemen', name: 'Yemen', zone: 'africa', lat: 15.17, lon: 43.96, sub: ['Haraz', 'Bani Matar', 'Haima'], aliases: ['yemen', 'yemeni', 'mokha', 'haraz', 'bani matar', 'matari', 'hayma', 'haima', 'sanani'], notes: 'Ancient terrace dried cherry, cardamom, winey cacao' },
    { key: 'hawaii', name: 'Hawaii (USA)', zone: 'americas', lat: 19.52, lon: -155.92, sub: ['Kona', 'Ka\'u', 'Maui'], aliases: ['hawaii', 'hawaiian', 'kona', 'kau', 'ka u', 'maui', 'kauai', 'molokai', 'big island'], notes: 'Volcanic trade-wind brown sugar & sweet citrus' },
    { key: 'jamaica', name: 'Jamaica', zone: 'americas', lat: 18.04, lon: -76.62, sub: ['Blue Mountains'], aliases: ['jamaica', 'jamaican', 'blue mountain', 'blue mountains'], notes: 'Silky sweet mildness, toasted almond, cocoa' },
    { key: 'china', name: 'China (Yunnan)', zone: 'asia', lat: 22.78, lon: 100.97, sub: ['Pu\'er', 'Baoshan', 'Mengla'], aliases: ['china', 'chinese', 'yunnan', 'yunnan province', 'puer', 'pu er', 'baoshan', 'mengla', 'dehong', 'xishuangbanna'], notes: 'Plum, black tea, brown sugar, tropical ferment' },
    { key: 'thailand', name: 'Thailand', zone: 'asia', lat: 19.91, lon: 99.83, sub: ['Chiang Rai', 'Chiang Mai', 'Doi Chang'], aliases: ['thailand', 'thai', 'chiang rai', 'chiang mai', 'doi chang', 'doi tung', 'mae hong son'], notes: 'Lychee, wild honey, sweet brown spice' },
    { key: 'myanmar', name: 'Myanmar', zone: 'asia', lat: 21.15, lon: 96.48, sub: ['Ywangan', 'Pyin Oo Lwin', 'Shan State'], aliases: ['myanmar', 'burma', 'burmese', 'ywangan', 'pyin oo lwin', 'shan state'], notes: 'Shan Hills strawberry, tamarind, honey' },
    { key: 'laos', name: 'Laos', zone: 'asia', lat: 15.12, lon: 106.25, sub: ['Bolaven Plateau'], aliases: ['laos', 'lao', 'bolaven', 'bolaven plateau', 'paksong'], notes: 'Herbal cocoa, roasted nut, caramel' },
    { key: 'philippines', name: 'Philippines', zone: 'asia', lat: 16.40, lon: 120.60, sub: ['Benguet', 'Mt. Apo', 'Bukidnon'], aliases: ['philippines', 'philippine', 'filipino', 'benguet', 'sagada', 'mt apo', 'mount apo', 'bukidnon', 'mindanao', 'barako'], notes: 'Liberica (Barako) jackfruit, berry & spice' },
    { key: 'taiwan', name: 'Taiwan', zone: 'asia', lat: 23.51, lon: 120.69, sub: ['Alishan', 'Yunlin'], aliases: ['taiwan', 'taiwanese', 'alishan', 'yunlin', 'nantou', 'chiayi'], notes: 'Oolong tea delicacy, white peach, cane sugar' },
    { key: 'timorleste', name: 'Timor-Leste', zone: 'asia', lat: -8.83, lon: 125.43, sub: ['Ermera', 'Ainaro'], aliases: ['timor-leste', 'timor leste', 'east timor', 'timor', 'timorese', 'ermera', 'ainaro', 'maubisse'], notes: 'Molasses, cocoa, herbal smoothness' },
    { key: 'dominicanrepublic', name: 'Dominican Republic', zone: 'americas', lat: 19.05, lon: -70.66, sub: ['Jarabacoa', 'Barahona'], aliases: ['dominican republic', 'dominican', 'republica dominicana', 'jarabacoa', 'barahona', 'cibao', 'ocoa'], notes: 'Sweet brown spice, cacao, raisin' },
    { key: 'venezuela', name: 'Venezuela', zone: 'americas', lat: 9.32, lon: -70.25, sub: ['Merida', 'Lara'], aliases: ['venezuela', 'venezuelan', 'merida', 'tachira', 'lara', 'caripe'], notes: 'Sweet panela, almond, mild apricot' },
    { key: 'ivorycoast', name: 'Ivory Coast', zone: 'africa', lat: 7.40, lon: -7.55, sub: ['Man', 'Daloa'], aliases: ['ivory coast', 'cote d ivoire', 'cote divoire', 'ivorian', 'daloa'], notes: 'Bold cocoa, toasted grain, espresso crema' },
    { key: 'nepal', name: 'Nepal', zone: 'asia', lat: 27.90, lon: 85.15, sub: ['Nuwakot', 'Gulmi'], aliases: ['nepal', 'nepali', 'nuwakot', 'gulmi', 'palpa', 'sindhupalchok'], notes: 'Himalayan spice, honeyed tea, crisp apple' },
    { key: 'puertorico', name: 'Puerto Rico', zone: 'americas', lat: 18.18, lon: -66.75, sub: ['Yauco', 'Adjuntas'], aliases: ['puerto rico', 'puerto rican', 'yauco', 'adjuntas', 'lares'], notes: 'Malty caramel, sweet nut, round body' },
    { key: 'australia', name: 'Australia', zone: 'asia', lat: -17.26, lon: 145.48, sub: ['Atherton Tablelands', 'Byron Bay'], aliases: ['australia', 'australian', 'atherton', 'atherton tablelands', 'byron bay'], notes: 'Clean macadamia sweetness, soft stone fruit' },
    { key: 'malaysia', name: 'Malaysia', zone: 'asia', lat: 1.66, lon: 103.60, sub: ['Johor', 'Sabah'], aliases: ['malaysia', 'malaysian', 'johor', 'sabah', 'sarawak', 'borneo'], notes: 'Liberica tropical berry, jackfruit, smoky cocoa' },
    { key: 'lareunion', name: 'La Reunion', zone: 'africa', lat: -21.11, lon: 55.53, sub: ['Bourbon Pointu'], aliases: ['la reunion', 'reunion', 'reunion island', 'bourbon island'], notes: 'Mandarin blossom, delicate low-caffeine sweetness' },
    { key: 'cameroon', name: 'Cameroon', zone: 'africa', lat: 5.96, lon: 10.15, sub: ['Boyo', 'Western Highlands'], aliases: ['cameroon', 'cameroonian', 'boyo', 'bamenda', 'bafoussam'], notes: 'Rich cocoa, warm spice, full body' },
    { key: 'madagascar', name: 'Madagascar', zone: 'africa', lat: -19.86, lon: 47.03, sub: ['Antananarivo', 'Vatovavy'], aliases: ['madagascar', 'malagasy', 'mananjary', 'antsirabe', 'itasy'], notes: 'Vanilla pod, dark cocoa, wild spice' },
    { key: 'zimbabwe', name: 'Zimbabwe', zone: 'africa', lat: -20.20, lon: 32.63, sub: ['Chipinge', 'Eastern Highlands'], aliases: ['zimbabwe', 'zimbabwean', 'chipinge', 'honde valley', 'vumba'], notes: 'Zesty orange, dark berry, black tea' },
    { key: 'haiti', name: 'Haiti', zone: 'americas', lat: 18.24, lon: -71.88, sub: ['Thiotte', 'Nord'], aliases: ['haiti', 'haitian', 'haitian bleu', 'thiotte', 'baptiste'], notes: 'Mellow chocolate, toasted cashew, low acid' },
    { key: 'cuba', name: 'Cuba', zone: 'americas', lat: 20.03, lon: -76.78, sub: ['Sierra Maestra', 'Escambray'], aliases: ['cuba', 'cuban', 'sierra maestra', 'turquino', 'escambray'], notes: 'Sweet pipe tobacco, dark cocoa, cedar' },
    { key: 'sierraleone', name: 'Sierra Leone', zone: 'africa', lat: 7.88, lon: -11.19, sub: ['Kenema', 'Kailahun'], aliases: ['sierra leone', 'kenema', 'kono', 'kailahun'], notes: 'Coffea stenophylla peach, black tea & honey' },
    { key: 'angola', name: 'Angola', zone: 'africa', lat: -10.85, lon: 14.37, sub: ['Amboim', 'Uige'], aliases: ['angola', 'angolan', 'amboim', 'cazengo', 'uige', 'kwanza sul'], notes: 'Earthy cacao, roasted nut, heavy body' },
    { key: 'mozambique', name: 'Mozambique', zone: 'africa', lat: -18.42, lon: 34.05, sub: ['Gorongosa', 'Chimanimani'], aliases: ['mozambique', 'gorongosa', 'chimanimani', 'inhambane'], notes: 'Rainforest citrus, caramel, sweet spice' },
    { key: 'srilanka', name: 'Sri Lanka', zone: 'asia', lat: 6.95, lon: 80.78, sub: ['Kandy', 'Nuwara Eliya'], aliases: ['sri lanka', 'ceylon', 'kandy', 'nuwara eliya', 'badulla'], notes: 'Ceylon spice, brown sugar, black tea' }
  ];

  const ORIGIN_TERROIR_META = {
    ethiopia: { elevation: '1,750–2,300 masl', varietals: 'Ethiopian Heirloom, JARC 74110 / 74112', harvest: 'Oct – Feb', terroir: 'Birthplace of Arabica; red volcanic highland soils yield unmistakable floral & stone-fruit clarity.' },
    colombia: { elevation: '1,450–2,150 masl', varietals: 'Caturra, Castillo, Pink Bourbon, Tabi', harvest: 'Mar – Jun & Sep – Dec', terroir: 'Three Andean cordilleras create year-round micro-climates with bright cane-sugar & orchard fruit.' },
    brazil: { elevation: '850–1,350 masl', varietals: 'Bourbon, Mundo Novo, Catuai, Arara', harvest: 'May – Sep', terroir: 'Rolling sun-drenched plateaus ideal for Natural & Pulped-Natural hazelnut-chocolate sweetness.' },
    kenya: { elevation: '1,600–2,050 masl', varietals: 'SL28, SL34, Ruiru 11, Batian', harvest: 'Oct – Dec & Jun – Aug', terroir: 'Phosphoric-rich red volcanic soils around Mt. Kenya deliver electric blackcurrant & citrus.' },
    guatemala: { elevation: '1,400–2,000 masl', varietals: 'Bourbon, Caturra, Pache, Maragogipe', harvest: 'Dec – Apr', terroir: 'Pumice-rich volcanic valleys & high limestone ridges balance cocoa structure with crisp apple.' },
    costarica: { elevation: '1,300–1,950 masl', varietals: 'Caturra, Catuai, Villa Sarchi, Gesha', harvest: 'Nov – Mar', terroir: 'Pioneers of Honey micro-mill processing; clean volcanic sweetness & stone fruit.' },
    panama: { elevation: '1,500–2,000 masl', varietals: 'Gesha (Geisha), Catuai, Typica, Pacamara', harvest: 'Dec – Mar', terroir: 'Misty Baru volcano bajareque cloud-forests slow cherry ripening for intense jasmine perfume.' },
    honduras: { elevation: '1,300–1,850 masl', varietals: 'Pacas, Parainema, Catuai, Bourbon', harvest: 'Nov – Apr', terroir: 'Humid mountain slopes producing syrupy tropical mango, plum, and caramel lots.' },
    elsalvador: { elevation: '1,250–1,800 masl', varietals: 'Bourbon, Pacas, Pacamara', harvest: 'Nov – Mar', terroir: 'Shade-grown volcanic estates renowned for creamy nougat & giant-bean Pacamara aromatics.' },
    rwanda: { elevation: '1,550–2,000 masl', varietals: 'Red Bourbon', harvest: 'Mar – Jul', terroir: 'Land of a Thousand Hills; high-lake breezes nurture silky black tea, cranberry & orange blossom.' },
    burundi: { elevation: '1,600–1,950 masl', varietals: 'Red Bourbon', harvest: 'Mar – Jul', terroir: 'Double-fermented mountain washing stations yielding spiced honey & hibiscus sparkle.' },
    peru: { elevation: '1,400–2,050 masl', varietals: 'Typica, Caturra, Bourbon, Gesha', harvest: 'May – Sep', terroir: 'Organic smallholder high-Andes farms with sweet panela, red plum & floral cocoa.' },
    indonesia: { elevation: '1,100–1,750 masl', varietals: 'TimTim, Ateng, Typica, Kartika', harvest: 'May – Oct', terroir: 'Tropical volcanic islands famous for Giling Basah wet-hulled body & washed Gayo spice.' },
    yemen: { elevation: '1,700–2,400 masl', varietals: 'Yemenia, Udaini, Jaadi, Tuffahi', harvest: 'Oct – Jan', terroir: 'Ancient dry-stone mountain terraces where cherries tree-dry into deep cherry-cacao complexity.' },
    hawaii: { elevation: '450–1,100 masl', varietals: 'Kona Typica, Red/Yellow Catuai', harvest: 'Aug – Jan', terroir: 'Mauna Loa lava slopes cooled by daily afternoon trade-wind clouds (oceanic island equivalent of 1,600m).' },
    china: { elevation: '1,200–1,850 masl', varietals: 'Catimor, Typica, Bourbon', harvest: 'Nov – Mar', terroir: 'Subtropical Yunnan tea mountains producing sweet plum, black tea & clean anaerobic lots.' },
    mexico: { elevation: '1,100–1,750 masl', varietals: 'Typica, Bourbon, Mundo Novo, Marsellesa', harvest: 'Nov – Mar', terroir: 'Southern Sierra Madre cloud-forests yielding delicate praline, pear & cinnamon warmth.' },
    ecuador: { elevation: '1,350–2,100 masl', varietals: 'Sidra, Typica Mejorado, Bourbon', harvest: 'Jun – Oct', terroir: 'Equatorial Andean valleys producing competition-winning Sidra & Mejorado berry-floral cups.' },
    drcongo: { elevation: '1,500–2,000 masl', varietals: 'Bourbon, Typica, Jackson, Mibirizi', harvest: 'Mar – Jul & Sep – Jan', terroir: 'Volcanic Lake Kivu & Ituri highlands yielding plush dark cherry, citrus & spice.' },
    papuanewguinea: { elevation: '1,400–2,050 masl', varietals: 'Typica, Arusha, Bourbon, Blue Mountain', harvest: 'Apr – Sep', terroir: 'Lush central highland valleys (Wahgi, Goroka) known for juicy orchard fruit & clean sweetness.' },
    dominicanrepublic: { elevation: '1,000–1,600 masl', varietals: 'Typica, Caturra, Catuai, Bourbon', harvest: 'Sep – Apr', terroir: 'Shade-grown mountain estates from Barahona to Jarabacoa delivering warm cocoa & spice.' },
    ivorycoast: { elevation: '300–900 masl', varietals: 'Canephora (Robusta) & Highland Arabusta', harvest: 'Oct – Mar', terroir: 'Western forest hills around Man & Daloa producing bold cocoa body & dense espresso crema.' }
  };

  function canonicalizeOriginKey(rawKey) {
    const k = String(rawKey || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    return ORIGIN_KEY_CANON[k] || k;
  }

  function extractElevationSnippet(grownStr) {
    if (!grownStr) return '';
    const m = String(grownStr).match(/(\d[\d,]*\s*(?:[\u2013\-]|to)\s*\d[\d,]*\s*(?:masl|m\b))/i);
    return m ? m[1].replace(/\s+to\s+/i, '\u2013').replace(/\s+m\b/i, ' masl') : '';
  }

  function enrichOriginEntry(base) {
    const key = canonicalizeOriginKey(base.key);
    const m = ORIGIN_TERROIR_META[key] || {};
    const defElev = base.zone === 'africa' ? '1,450–2,000 masl' : (base.zone === 'americas' ? '1,200–1,850 masl' : '1,000–1,650 masl');
    const defVar = base.zone === 'africa' ? 'Bourbon, SL-Selections & Local Landraces' : (base.zone === 'americas' ? 'Bourbon, Typica, Caturra & Catuai' : 'Typica, Catimor, S795 & Liberica');
    const defHarv = base.lat >= 0 ? 'Nov – Mar' : 'Apr – Sep';
    const aliasSet = new Set();
    const pushAlias = function (a) {
      const s = String(a || '').trim().toLowerCase();
      if (s && s.length >= 2) aliasSet.add(s);
    };
    pushAlias(base.name);
    (Array.isArray(base.aliases) ? base.aliases : []).forEach(pushAlias);
    (Array.isArray(base.sub) ? base.sub : []).forEach(pushAlias);
    return Object.assign({}, base, {
      key: key,
      aliases: Array.from(aliasSet),
      short: base.short || base.notes || '',
      feel: base.feel || base.notes || '',
      grown: base.grown || base.terroir || m.terroir || '',
      elevation: base.elevation || extractElevationSnippet(base.grown) || m.elevation || defElev,
      varietals: base.varietals || m.varietals || defVar,
      harvest: base.harvest || m.harvest || defHarv,
      terroir: base.terroir || base.grown || m.terroir || ('Specialty ' + (base.zone === 'africa' ? 'African highland' : (base.zone === 'americas' ? 'New World mountain' : 'Asia-Pacific island/highland')) + ' terroir known for ' + (base.short || base.notes || 'distinctive cup character').toLowerCase() + '.')
    });
  }

  function getFullOriginAtlas() {
    const globOrigins = (typeof ORIGINS !== 'undefined' && Array.isArray(ORIGINS) && ORIGINS.length)
      ? ORIGINS
      : (window.ORIGINS && Array.isArray(window.ORIGINS) ? window.ORIGINS : null);
    const globCoords = (typeof ORIGIN_COORDS_V6 !== 'undefined' && ORIGIN_COORDS_V6)
      ? ORIGIN_COORDS_V6
      : (window.ORIGIN_COORDS_V6 || {});
    if (!globOrigins || globOrigins.length < 36) return ORIGIN_ATLAS_52.map(enrichOriginEntry);

    const byKey = new Map();
    globOrigins.forEach(function (o) {
      if (!o || !o.key) return;
      const canonKey = canonicalizeOriginKey(o.key);
      /* Skip generic non-country placeholder 'africa' ("East Africa (general)") so all 52 pins are real countries */
      if (canonKey === 'africa') return;
      const fb = ORIGIN_ATLAS_52.find(function (x) { return canonicalizeOriginKey(x.key) === canonKey; }) || {};
      const ll = globCoords[canonKey] || globCoords[o.key] || o.coords || [fb.lat || 0, fb.lon || 0];
      const lon = Number.isFinite(ll[1]) ? ll[1] : (fb.lon || 0);
      const lat = Number.isFinite(ll[0]) ? ll[0] : (fb.lat || 0);
      const zone = fb.zone || (lon < -25 ? 'americas' : (lon < 62 ? 'africa' : 'asia'));
      const mergedAliases = [].concat(
        Array.isArray(o.aliases) ? o.aliases : [],
        Array.isArray(fb.aliases) ? fb.aliases : []
      );
      const subArr = (Array.isArray(o.subRegions) && o.subRegions.length) ? o.subRegions : (fb.sub || []);
      const varietalsStr = o.varieties || o.varShort || (Array.isArray(o.varietals) ? o.varietals.join(', ') : o.varietals) || fb.varietals;
      const notesShort = o.short || fb.notes || o.feel || 'Distinctive specialty terroir.';
      const feelLong = o.feel || o.short || fb.notes || 'Distinctive specialty terroir.';
      const grownTxt = o.grown || o.placeShort || o.terroir || fb.terroir || '';
      const entry = enrichOriginEntry({
        key: canonKey,
        name: fb.name && canonKey === 'drcongo' ? 'DR Congo' : (o.name || fb.name || canonKey),
        zone: zone,
        lat: lat,
        lon: lon,
        sub: subArr,
        aliases: mergedAliases,
        short: notesShort,
        feel: feelLong,
        grown: grownTxt,
        notes: fb.notes || notesShort,
        elevation: o.elevation || o.alt || extractElevationSnippet(grownTxt) || fb.elevation,
        varietals: varietalsStr,
        harvest: o.harvest || fb.harvest,
        terroir: grownTxt || feelLong || fb.terroir
      });
      byKey.set(canonKey, entry);
    });

    /* Restore any country in ORIGIN_ATLAS_52 missing from ORIGINS (e.g., Ivory Coast) */
    ORIGIN_ATLAS_52.forEach(function (fb) {
      const ck = canonicalizeOriginKey(fb.key);
      if (!byKey.has(ck)) byKey.set(ck, enrichOriginEntry(fb));
    });

    return Array.from(byKey.values());
  }

  const MAP_ZOOM_REGIONS = [
    { key: 'world', label: 'World Belt (52)', vb: '0 0 664 256' },
    { key: 'americas', label: 'Americas', vb: '16 48 250 192' },
    { key: 'africa', label: 'Africa & Yemen', vb: '296 58 164 186' },
    { key: 'asia', label: 'Asia-Pacific', vb: '466 40 196 202' }
  ];

  const GCO_MOLECULES = {
    'Jasmine': { mol: '(R)-(-)-Linalool & Indole', formula: 'C10H18O', threshold: '0.08 ug/L', plain: 'Silky white-blossom perfume classic in washed Ethiopian & Panama Gesha.', origin: 'Terpene glycoside hydrolysis in washed high-altitude Arabica / Gesha' },
    'Bergamot': { mol: 'Linalyl Acetate & Limonene', formula: 'C12H20O2', threshold: '1.2 ug/L', plain: 'Earl Grey citrus-blossom lift common in Yirgacheffe & Kenyan lots.', origin: 'Monoterpene esters abundant in Ethiopian landraces' },
    'Rose': { mol: 'beta-Damascenone & Geraniol', formula: 'C13H18O', threshold: '0.002 ug/L', plain: 'Lush rosewater & sweet red-apple jam note.', origin: 'Carotenoid cleavage yielding intense honeyed rose/apple impact' },
    'Blueberry': { mol: 'Ethyl 2-Methylbutyrate & Ethyl Isovalerate', formula: 'C7H14O2', threshold: '0.06 ug/L', plain: 'Ripe blueberry jam signature of sun-dried Natural Ethiopian coffees.', origin: 'Pulp-contact microbial esterification during Natural drying' },
    'Blackcurrant': { mol: '4-Mercapto-4-methylpentan-2-one (4MMP)', formula: 'C6H12OS', threshold: '0.0008 ug/L', plain: 'Ribena / cassis sparkle beloved in washed Kenyan SL28/SL34.', origin: 'Polyfunctional thiol characteristic of Kenyan SL28/SL34' },
    'White Peach': { mol: 'gamma-Decalactone', formula: 'C10H18O2', threshold: '1.1 ug/L', plain: 'Juicy ripe orchard peach sweetness that blooms as the cup cools.', origin: 'Hydroxy-fatty-acid lactonization in ripe stone-fruit lots' },
    'Apricot': { mol: 'gamma-Octalactone & Linalool', formula: 'C8H14O2', threshold: '7.0 ug/L', plain: 'Velvety orchard stone-fruit sweetness in honey & washed lots.', origin: 'Lactone synthesis during slow mountain cherry maturation' },
    'Cherry': { mol: 'Benzaldehyde & Ethyl Benzoate', formula: 'C7H6O', threshold: '3.5 ug/L', plain: 'Ripe red-to-black cherry sweetness common in East African & Andean lots.', origin: 'Aromatic aldehyde & ester formation in ripe cherry pulp' },
    'Strawberry': { mol: 'Furaneol (HDMF) & Ethyl Butyrate', formula: 'C6H8O3', threshold: '0.4 ug/L', plain: 'Sweet berry-candy aroma common in Natural & Honey lots.', origin: 'Hexose dehydration + esterification driving retronasal OISE sweetness' },
    'Pineapple': { mol: 'Ethyl Hexanoate', formula: 'C8H16O2', threshold: '1.0 ug/L', plain: 'Bright tropical pineapple tang typical of anaerobic & honey fermentations.', origin: 'Anaerobic / carbonic maceration yeast metabolism' },
    'Mango': { mol: 'delta-3-Carene & Ethyl Butyrate', formula: 'C10H16', threshold: '1.5 ug/L', plain: 'Lush tropical mango nectar note common in honey & anaerobic lots.', origin: 'Monoterpene & fruit ester synergy from pulp-contact drying' },
    'Red Apple': { mol: 'Ethyl 2-Methylbutyrate & beta-Damascenone', formula: 'C7H14O2', threshold: '0.1 ug/L', plain: 'Crisp orchard-apple sweetness paired with bright malic acidity.', origin: 'Branched fruit ester + malic acid balance in washed highlands' },
    'Lemon': { mol: 'Citral (Neral + Geranial)', formula: 'C10H16O', threshold: '3.0 ug/L', plain: 'Crisp lemonade zing in bright washed high-elevation coffees.', origin: 'Terpene aldehydes paired with citric acid protonation' },
    'Black Tea': { mol: 'Linalool Oxide & (E)-2-Hexenal', formula: 'C10H18O2', threshold: '6.0 ug/L', plain: 'Clean Ceylon/Assam tea-like delicacy typical of washed Rwandan & Ethiopian cups.', origin: 'Glycoside-bound monoterpenes & brisk polyphenol clarity' },
    'Caramel': { mol: '4-Hydroxy-2,5-dimethyl-3(2H)-furanone (Furaneol)', formula: 'C6H8O3', threshold: '5.0 ug/L', plain: 'Warm melted-sugar sweetness balanced across medium-light to medium roasts.', origin: 'Maillard sugar fragmentation during medium-light development' },
    'Honey': { mol: 'Phenylacetaldehyde', formula: 'C8H8O', threshold: '4.0 ug/L', plain: 'Floral wildflower honey sweetness.', origin: 'Strecker degradation of L-phenylalanine' },
    'Vanilla': { mol: 'Vanillin', formula: 'C8H8O3', threshold: '20 ug/L', plain: 'Creamy pastry smoothness.', origin: 'Thermal cleavage of ferulic acid / chlorogenic precursors' },
    'Brown Sugar': { mol: 'Sotolon & Maltol', formula: 'C6H8O3', threshold: '0.3 ug/L', plain: 'Panela / demerara cane-sugar warmth.', origin: 'Furanone caramelization imparting maple/panela warmth' },
    'Milk Chocolate': { mol: '3-Methylbutanal & Phenylacetaldehyde', formula: 'C5H10O', threshold: '0.4 ug/L', plain: 'Comforting creamy cocoa bar note.', origin: 'Leucine Strecker aldehyde creating malty cocoa sweetness' },
    'Dark Chocolate': { mol: '2,3-Diethyl-5-methylpyrazine + CGA Lactones', formula: 'C9H14N2', threshold: '0.09 ug/L', plain: '70%+ bittersweet cacao structure.', origin: 'Maillard pyrazine ring formation + Hofmann lactones' },
    'Hazelnut': { mol: 'Filbertone & 2-Ethyl-3,5-dimethylpyrazine', formula: 'C8H14O', threshold: '0.05 ug/L', plain: 'Toasted praline hazelnut classic in Brazilian & Central American lots.', origin: 'Lipid-Maillard interaction classic in Brazilian naturals' },
    'Toasted Almond': { mol: 'Benzaldehyde & 2-Methylpyrazine', shortMol: 'Benzaldehyde', formula: 'C7H6O', threshold: '3.0 ug/L', plain: 'Sweet marzipan & roasted almond warmth.', origin: 'Aromatic aldehyde & alkylpyrazine Maillard pairing' },
    'Cinnamon': { mol: 'Cinnamaldehyde & Eugenol', formula: 'C9H8O', threshold: '5.0 ug/L', plain: 'Warm sweet cinnamon-bark spice in washed Central American & anaerobic lots.', origin: 'Phenylpropanoid volatiles from thermal precursor breakdown' },
    'Cardamom': { mol: '1,8-Cineole & alpha-Terpinyl Acetate', shortMol: '1,8-Cineole', formula: 'C10H18O', threshold: '1.1 ug/L', plain: 'Aromatic green-spice lift classic in Yemeni & Indian highland lots.', origin: 'Monoterpene ether & ester volatiles' },
    'Clove': { mol: '4-Vinylguaiacol', formula: 'C9H10O2', threshold: '3.0 ug/L', plain: 'Warm baking-spice aroma.', origin: 'Decarboxylation of ferulic acid during roasting' },
    'Red Wine': { mol: 'Ethyl Acetate & Isoamyl Acetate', shortMol: 'Ethyl acetate', formula: 'C4H8O2', threshold: '5.0 ug/L', plain: 'Structured cabernet/sangria fruit complexity in natural & anaerobic lots.', origin: 'Yeast esterification during extended pulp fermentation' },
    'Green Pea': { mol: '3-Isobutyl-2-methoxypyrazine', shortMol: 'Methoxypyrazine', formula: 'C9H14N2O', threshold: '0.002 ug/L', plain: 'Snappy garden-pea vegetal aroma when roasting is very light or cherries under-ripe.', origin: 'Seed methoxypyrazine preserved at minimal roast development' },
    'Lemongrass': { mol: 'Citral & Geraniol', shortMol: 'Citral', formula: 'C10H16O', threshold: '2.0 ug/L', plain: 'Fresh herbal citrus-leaf lift seen in Honduran Parainema & washed lots.', origin: 'Acyclic monoterpene aldehydes' },
    'Mint': { mol: 'Menthol & Carvone', shortMol: 'Menthol', formula: 'C10H20O', threshold: '1.5 ug/L', plain: 'Cooling herbal freshness in high-altitude washed & wet-hulled coffees.', origin: 'Oxygenated monoterpenes' },
    'Cedar': { mol: 'Cedrol & Guaiacol', shortMol: 'Cedrol', formula: 'C15H26O', threshold: '2.5 ug/L', plain: 'Warm aromatic cedarwood signature of Sumatran Giling Basah & aged lots.', origin: 'Sesquiterpene & woody phenolic compounds in wet-hulled beans' },
    'Forest Floor': { mol: 'Geosmin & 1-Octen-3-ol', shortMol: 'Geosmin', formula: 'C12H22O', threshold: '0.004 ug/L', plain: 'Damp mossy-earth aroma typical of traditional wet-hulled Indonesian coffees.', origin: 'Terpenoid soil/drying-bed microflora volatiles' },
    'Leather': { mol: 'p-Cresol & 4-Ethylphenol', shortMol: '4-Ethylphenol', formula: 'C8H10O', threshold: '4.0 ug/L', plain: 'Savory warm-leather depth in dark roasts & aged/monsooned lots.', origin: 'Pyrolytic alkylphenols formed at high roast temperatures' },
    'Malt': { mol: '2-Methylbutanal & 3-Methylbutanal', shortMol: '3-Methylbutanal', formula: 'C5H10O', threshold: '0.4 ug/L', plain: 'Toasted malted-barley cereal sweetness in medium-roast Arabica.', origin: 'Strecker degradation of isoleucine & leucine' },
    'Toasted Bread': { mol: '2-Acetyl-1-pyrroline & 2-Acetylpyrazine', shortMol: '2-Acetylpyrazine', formula: 'C6H6N2O', threshold: '0.1 ug/L', plain: 'Warm bakery-crust aroma formed early in Maillard browning.', origin: 'Proline-sugar Maillard reaction around 165–190 °C' },
    'Pipe Tobacco': { mol: 'beta-Damascenone & 2-Ethyl-3-methylpyrazine', shortMol: 'Alkylpyrazine', formula: 'C7H10N2', threshold: '0.8 ug/L', plain: 'Sweet cured-leaf & cocoa warmth in Cuban & Indonesian dark-medium lots.', origin: 'Late-Maillard pyrazines paired with carotenoid lactones' },
    'Fresh Roast': { mol: '2-Furfurylthiol (FFT)', shortMol: '2-Furfurylthiol', formula: 'C5H6OS', threshold: '0.01 ug/L', plain: 'Classic freshly-ground coffee shop aroma.', origin: 'Signature roasted-coffee impact thiol; oxidizes fastest in unsealed bags' },
    'Roasted Coffee': { mol: '2-Furfurylthiol (FFT)', shortMol: '2-Furfurylthiol', formula: 'C5H6OS', threshold: '0.01 ug/L', plain: 'Deep unmistakable freshly-roasted coffee backbone.', origin: 'Primary sulfur-furan coffee impact odorant formed during roasting' },
    'Smoky': { mol: 'Guaiacol & 4-Ethylguaiacol', shortMol: 'Guaiacol', formula: 'C7H8O2', threshold: '1.6 ug/L', plain: 'Campfire / dark-roast char note.', origin: 'Lignin pyrolysis past second crack (>224 °C)' }
  };

  const GCO_MOLECULES_LOW = Object.create(null);
  Object.keys(GCO_MOLECULES).forEach(function (k) {
    GCO_MOLECULES_LOW[k.toLowerCase()] = GCO_MOLECULES[k];
  });

  function lookupFlavorChemistry(wordText, famName) {
    const w = String(wordText || '').trim();
    const wLow = w.toLowerCase();
    const localHit = GCO_MOLECULES[w] || GCO_MOLECULES_LOW[wLow] || null;
    if (localHit) {
      const shortName = localHit.shortMol || localHit.mol.split(' & ')[0].replace(/^\([^)]+\)-\([^)]+\)-/, '');
      return {
        mol: localHit.mol,
        shortMol: shortName,
        formula: localHit.formula,
        threshold: localHit.threshold,
        plain: localHit.plain,
        origin: localHit.origin
      };
    }
    let extHit = null;
    if (typeof gcMoleculeFor === 'function') {
      try { extHit = gcMoleculeFor(w, famName || ''); } catch (_) { extHit = null; }
    } else if (typeof GC_MOLECULES !== 'undefined' && GC_MOLECULES && GC_MOLECULES[wLow]) {
      extHit = GC_MOLECULES[wLow];
    }
    const famFallbacksMap = {
      'fruity': { mol: 'Ethyl Butyrate & Fruit Esters', shortMol: 'Ethyl butyrate', formula: 'C6H12O2', plain: 'Ripe fruit esters formed during slow cherry maturation & fermentation.' },
      'floral': { mol: 'Linalool & Geraniol Terpenes', shortMol: 'Linalool', formula: 'C10H18O', plain: 'Delicate blossom terpenes preserved in high-elevation washed coffees.' },
      'sweet': { mol: 'Furaneol & Maltol Furanones', shortMol: 'Furaneol', formula: 'C6H8O3', plain: 'Caramelized sugar furanones created during Maillard roast development.' },
      'nutty & cocoa': { mol: '2-Methylpyrazine & Strecker Aldehydes', shortMol: 'Methylpyrazine', formula: 'C5H6N2', plain: 'Toasted cocoa & nut aromatics formed during gentle drum development.' },
      'spiced': { mol: '4-Vinylguaiacol & Cineole', shortMol: '4-Vinylguaiacol', formula: 'C9H10O2', plain: 'Warm baking-spice phenols unlocked from chlorogenic precursors.' },
      'fermented': { mol: 'Ethyl Acetate & Isoamyl Acetate', shortMol: 'Ethyl acetate', formula: 'C4H8O2', plain: 'Juicy winey & tropical esters from extended fruit-contact fermentation.' },
      'green & earthy': { mol: '3-Isobutyl-2-methoxypyrazine & Geosmin', shortMol: 'Methoxypyrazine', formula: 'C9H14N2O', plain: 'Fresh herbal, vegetal & woody-earth volatiles from seed lipids or wet-hulled terroir.' },
      'roasted & grain': { mol: '2-Furfurylthiol (FFT) & 2-Acetylpyrazine', shortMol: '2-Furfurylthiol', formula: 'C5H6OS', plain: 'Toasted cereal, biscuit & roasted-coffee sulfur-furan and pyrazine aromatics.' }
    };
    const famKeyLow = String(famName || '').trim().toLowerCase();
    const famFb = famFallbacksMap[famKeyLow] || null;
    if (extHit && extHit.mol) {
      const molStr = extHit.molecule || extHit.mol || extHit.name || 'Aroma Impact Compound';
      return {
        mol: molStr,
        shortMol: molStr.split(' (')[0].split(' & ')[0],
        formula: extHit.formula || (famFb ? famFb.formula : 'GC-O Active'),
        threshold: extHit.threshold || '< 5 ug/L',
        plain: extHit.note || extHit.why || extHit.desc || ('Natural aroma molecule behind ' + w + ' in specialty coffee.'),
        origin: extHit.origin || extHit.source || 'Identified in coffee headspace aroma chemistry'
      };
    }
    const chosenFb = famFb || { mol: 'Retronasal Aroma Ester / Aldehyde', shortMol: 'Aroma Ester', formula: 'GC-O Active', plain: 'Distinctive specialty coffee aroma perceived as warm vapor rises retronasally.' };
    return {
      mol: chosenFb.mol,
      shortMol: chosenFb.shortMol,
      formula: chosenFb.formula,
      threshold: '< 5 ug/L',
      plain: chosenFb.plain,
      origin: 'Identified in WCR Sensory Lexicon & coffee headspace GC-O'
    };
  }

  /* 85+ Descriptor 9-Family Sunburst Wheel */
  const BUILTIN_FLAVOR_WHEEL_85 = {
    title: 'BeanTelligence 85-Descriptor 3-Ring Sensory Wheel',
    center: 'Flavor',
    fams: [
      {
        name: 'Fruity', short: 'Fruity', color: '#D94F4F',
        groups: [
          { name: 'Berry', words: ['Blueberry', 'Blackcurrant', 'Raspberry', 'Strawberry', 'Blackberry', 'Cranberry'] },
          { name: 'Stone Fruit', words: ['White Peach', 'Apricot', 'Cherry', 'Plum', 'Nectarine'] },
          { name: 'Citrus', words: ['Bergamot', 'Lemon', 'Pink Grapefruit', 'Mandarin', 'Lime', 'Blood Orange'] },
          { name: 'Tropical & Orchard', words: ['Pineapple', 'Mango', 'Passionfruit', 'Lychee', 'Papaya', 'Red Apple', 'Pear', 'Fig', 'Raisin'] }
        ]
      },
      {
        name: 'Floral', short: 'Floral', color: '#C85A8E',
        groups: [
          { name: 'Blossom', words: ['Jasmine', 'Rose', 'Orange Blossom', 'Hibiscus', 'Honeysuckle', 'Lavender'] },
          { name: 'Tea-Like', words: ['Earl Grey', 'Black Tea', 'Oolong', 'Green Tea', 'Chamomile'] }
        ]
      },
      {
        name: 'Sweet', short: 'Sweet', color: '#D8832B',
        groups: [
          { name: 'Caramelized', words: ['Caramel', 'Brown Sugar', 'Maple Syrup', 'Butterscotch', 'Toffee', 'Molasses', 'Panela'] },
          { name: 'Honey & Vanilla', words: ['Honey', 'Vanilla', 'Custard', 'Cream', 'Marshmallow'] }
        ]
      },
      {
        name: 'Nutty & Cocoa', short: 'Cocoa/Nut', color: '#8A5029',
        groups: [
          { name: 'Chocolate', words: ['Milk Chocolate', 'Dark Chocolate', 'Cacao Nib', 'Cocoa Powder', 'Fudge'] },
          { name: 'Nutty', words: ['Hazelnut', 'Toasted Almond', 'Praline', 'Walnut', 'Pecan', 'Peanut'] }
        ]
      },
      {
        name: 'Spiced', short: 'Spiced', color: '#B5482A',
        groups: [
          { name: 'Warm Spice', words: ['Cinnamon', 'Cardamom', 'Clove', 'Nutmeg', 'Star Anise'] },
          { name: 'Peppery', words: ['Pink Pepper', 'Black Pepper', 'Ginger', 'Coriander'] }
        ]
      },
      {
        name: 'Fermented', short: 'Winey/Funk', color: '#7D4282',
        groups: [
          { name: 'Winey', words: ['Red Wine', 'Sangria', 'Port', 'Rum Raisin'] },
          { name: 'Tropical Funk', words: ['Cider', 'Kombucha', 'Cacao Pulp'] }
        ]
      },
      {
        name: 'Green & Earthy', short: 'Herbal', color: '#4A7C59',
        groups: [
          { name: 'Herbal', words: ['Lemongrass', 'Mint', 'Sage', 'Green Pea'] },
          { name: 'Woody', words: ['Cedar', 'Forest Floor', 'Leather'] }
        ]
      },
      {
        name: 'Roasted & Grain', short: 'Roasted', color: '#593A27',
        groups: [
          { name: 'Cereal & Malt', words: ['Malt', 'Graham Cracker', 'Toasted Bread', 'Biscuit'] },
          { name: 'Deep Roast', words: ['Fresh Roast', 'Smoky', 'Pipe Tobacco', 'Roasted Coffee'] }
        ]
      }
    ]
  };

  /* 36-Vial Aroma Kit Fallback (enriched by global KIT_NAMES when present) */
  const FALLBACK_KIT_36 = [
    [1, 'Earth', 'Earthy'], [2, 'Potato', 'Earthy'], [3, 'Garden peas', 'Herbal'], [4, 'Cucumber', 'Herbal'],
    [5, 'Straw', 'Herbal'], [6, 'Cedar', 'Earthy'], [7, 'Clove-like', 'Spice'], [8, 'Pepper', 'Spice'],
    [9, 'Coriander seeds', 'Spice'], [10, 'Vanilla', 'Sweet'], [11, 'Tea-roses / Redcurrant jelly', 'Floral'], [12, 'Coffee blossom', 'Floral'],
    [13, 'Coffee pulp', 'Fruit'], [14, 'Blackcurrant-like', 'Fruit'], [15, 'Lemon', 'Fruit'], [16, 'Apricot', 'Fruit'],
    [17, 'Apple', 'Fruit'], [18, 'Butter', 'Sweet'], [19, 'Honeyed', 'Sweet'], [20, 'Leather', 'Earthy'],
    [21, 'Basmati rice', 'Roasted'], [22, 'Toast', 'Roasted'], [23, 'Malt', 'Roasted'], [24, 'Maple syrup', 'Sweet'],
    [25, 'Caramel', 'Sweet'], [26, 'Dark chocolate', 'Cocoa'], [27, 'Roasted almonds', 'Nut'], [28, 'Roasted peanuts', 'Nut'],
    [29, 'Roasted hazelnuts', 'Nut'], [30, 'Walnuts', 'Nut'], [31, 'Cooked beef', 'Roasted'], [32, 'Smoke', 'Roasted'],
    [33, 'Pipe tobacco', 'Roasted'], [34, 'Roasted coffee', 'Roasted'], [35, 'Medicinal', 'Defect'], [36, 'Rubber', 'Defect']
  ];

  const AROMA_KIT_LS_KEY = 'brew-and-cup-aroma-kit-v1';
  function loadAromaKitTicked() {
    try {
      const raw = localStorage.getItem(AROMA_KIT_LS_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) {
      return {};
    }
  }
  function saveAromaKitTicked(mapObj) {
    try { localStorage.setItem(AROMA_KIT_LS_KEY, JSON.stringify(mapObj || {})); } catch (_) {}
  }

  /* ==========================================================================
   * BAYESIAN PALATE DNA ENGINE & 4-LEVEL DRILL-IN STATE
   * ========================================================================== */
  let activeWheelSpring = null;
  let scannerPasteTimer = null;

  function stopActiveWheelSpring() {
    if (activeWheelSpring && typeof activeWheelSpring.stop === 'function') {
      try { activeWheelSpring.stop(); } catch (_) {}
    }
    activeWheelSpring = null;
  }

  function clearScannerPasteTimer() {
    if (scannerPasteTimer) {
      clearTimeout(scannerPasteTimer);
      scannerPasteTimer = null;
    }
  }

  function bindActivateKey(el, fn) {
    if (!el || typeof el.addEventListener !== 'function') return;
    el.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        fn(ev);
      }
    });
  }

  const palateState = {
    subSegment: 'dna', /* 'dna' | 'matcher' | 'wheel' */
    mapZoom: 'world',  /* 'world' | 'americas' | 'africa' | 'asia' */
    selectedOriginKey: '',
    timelapsePct: 100,
    expandedBoard: 'origins', /* 'origins' | 'processes' | 'roasts' | 'elevations' | 'varietals' | 'brewers' | 'flavors' | 'cafes' */
    showUnexploredOrigins: false,
    drillPath: [],            /* 4-level drill-in: [ { level, key, label } ... ] */
    selectedRoastZone: '',
    selectedRatingTier: '',
    selectedRadarAxis: '',    /* interactive 5-Axis taste drill-down */
    selectedBeanCid: '',      /* interactive Per-Coffee Scorecard Leaderboard drill-down */
    prefTargetDraft: null,    /* { brightness, strength, texture } interactive recipe bias targets */
    wheelMatchScope: 'auto',  /* 'auto' | 'word' | 'family' in Flavor Wheel drill-down */
    demoMode: false,
    seedAcidity: 3.8,
    seedSweetness: 4.5,
    seedBody: 3.4,
    seedRoast: 2.4,
    seedFunk: 3.2,

    /* Smart Bag Buyer's Guide & StoreBagScanner */
    scanner: {
      origin: 'ethiopia',
      process: 'washed',
      roast: 'light',
      elevation: 'high',
      roaster: '',
      price: 21,
      weightG: 250,
      notes: ['Jasmine', 'White Peach', 'Bergamot'],
      notesUnsure: false,
      customNote: '',
      rawLabel: ''
    },

    /* 85-Descriptor Sunburst + 36-Vial Aroma Kit */
    wheel: {
      mode: 'sunburst', /* 'sunburst' | 'constellation' */
      focusFam: 0,
      selectedWord: 'Jasmine',
      searchQuery: '',
      pickedWords: {},
      pickedSyncKey: '',
      shares: [140, 31.4, 31.4, 31.4, 31.4, 31.4, 31.5, 31.5],
      vels: [0, 0, 0, 0, 0, 0, 0, 0]
    },
    aromaKit: loadAromaKitTicked()
  };

  const ELEVATION_BAND_DEFS = {
    low:  { key: 'low',  label: '<1,300m Low/Sweet',            short: '<1,300m Low/Sweet',            midMeters: 1150, cue: 'Low-acid chocolate, hazelnut & cozy sweetness' },
    mid:  { key: 'mid',  label: '1,300\u20131,750m Mid',        short: '1,300\u20131,750m Mid',        midMeters: 1525, cue: 'Balanced cane sugar, orchard fruit & smooth body' },
    high: { key: 'high', label: '1,750m+ High-Altitude Bright', short: '1,750m+ High-Altitude Bright', midMeters: 1900, cue: 'Dense highland bean, sparkling citrus, berry & florals' }
  };

  function isUnknownTrait(raw) {
    if (raw == null) return true;
    const s = String(raw).trim().toLowerCase();
    if (!s) return true;
    const c = s.replace(/[^a-z0-9]/g, '');
    if (!c) return true;
    if (
      c === 'unknown' || c === 'unsure' || c === 'notsure' ||
      c === 'dontknow' || c === 'idontknow' || c === 'idk' ||
      c === 'unlisted' || c === 'unlabeled' || c === 'unlabelled' ||
      c === 'none' || c === 'nonelisted' || c === 'notonbag' ||
      c === 'notlisted' || c === 'na' || c === 'tbd' || c === 'dontknowblend'
    ) {
      return true;
    }
    return /^(unknown|unsure|not\s*sure|don'?t\s*know|not\s*on\s*bag|none\s*listed|unlabeled|unlisted)/i.test(s);
  }

  function metersToElevationBand(m) {
    if (!Number.isFinite(m) || m < 100 || m > 3600) return '';
    return m < 1300 ? 'low' : (m < 1750 ? 'mid' : 'high');
  }

  function classifyElevationBand(rOrVal, opts) {
    if (!rOrVal) return '';
    const strictUnits = !!(opts && opts.strictUnits);
    if (typeof rOrVal === 'string' || typeof rOrVal === 'number') {
      if (isUnknownTrait(rOrVal)) return '';
      if (typeof rOrVal === 'number') {
        return strictUnits ? '' : metersToElevationBand(rOrVal);
      }
      const s = String(rOrVal).trim().toLowerCase();
      if (s === 'low' || s === 'mid' || s === 'high') return s;
      const clean = s.replace(/,/g, '');

      /* 1. Explicit meter units (e.g. 1950m, 1800-2100 masl, 1650 meters) — never matches 250g or 2025! */
      const mUnitMatch = clean.match(/\b(\d{3,4})(?:\s*[\u2013\-]\s*(\d{3,4}))?\s*(?:m\.?a\.?s\.?l\.?|meters?|metres?|m)\b(?!\s*(?:l|g|m|in)\b)/i);
      if (mUnitMatch) {
        const aM = parseFloat(mUnitMatch[1]);
        const bM = mUnitMatch[2] ? parseFloat(mUnitMatch[2]) : aM;
        const avgM = (aM + bM) * 0.5;
        const bandM = metersToElevationBand(avgM);
        if (bandM) return bandM;
      }

      /* 2. Explicit feet units (e.g. 5500 ft, 4500-6000 feet) */
      const ftUnitMatch = clean.match(/\b(\d{3,5})(?:\s*[\u2013\-]\s*(\d{3,5}))?\s*(?:ft\.?|feet|fasl)\b/i);
      if (ftUnitMatch) {
        const aF = parseFloat(ftUnitMatch[1]);
        const bF = ftUnitMatch[2] ? parseFloat(ftUnitMatch[2]) : aF;
        const avgM = ((aF + bF) * 0.5) * 0.3048;
        const bandF = metersToElevationBand(avgM);
        if (bandF) return bandF;
      }

      /* 3. Pure bare numeric elevation (only when the entire value is a number/range, e.g. row.elevation_m = '1950') */
      if (!strictUnits) {
        const bareNum = clean.match(/^\s*(\d{3,4})(?:\s*[\u2013\-]\s*(\d{3,4}))?\s*$/);
        if (bareNum) {
          const aB = parseFloat(bareNum[1]);
          const bB = bareNum[2] ? parseFloat(bareNum[2]) : aB;
          const bandB = metersToElevationBand((aB + bB) * 0.5);
          if (bandB) return bandB;
        }
      }

      /* 4. Explicit altitude-context keywords (prevents "Highland" / "low acid" false positives in strict mode) */
      if (/\b(?:shb|shg|high[\s-]*(?:altitude|elevation|grown)|ultra[\s-]*high)\b/i.test(clean)) return 'high';
      if (/\b(?:hb|hg|mid[\s-]*(?:altitude|elevation|grown)|medium[\s-]*(?:altitude|elevation|grown))\b/i.test(clean)) return 'mid';
      if (/\b(?:low[\s-]*(?:altitude|elevation|grown))\b/i.test(clean)) return 'low';
      if (!strictUnits) {
        if (/^(?:ultra|high)\b/i.test(clean)) return 'high';
        if (/^(?:mid|med)\b/i.test(clean)) return 'mid';
        if (/^low\b/i.test(clean)) return 'low';
      }
      return '';
    }
    if (!isUnknownTrait(rOrVal.elevation_m)) {
      const bandFromM = classifyElevationBand(String(rOrVal.elevation_m));
      if (bandFromM) return bandFromM;
    }
    const clsRaw = rOrVal.elevation_class || rOrVal.density || '';
    if (!isUnknownTrait(clsRaw)) {
      const cl = String(clsRaw).toLowerCase();
      if (cl.indexOf('high') >= 0 || cl.indexOf('ultra') >= 0) return 'high';
      if (cl.indexOf('mid') >= 0 || cl.indexOf('med') >= 0) return 'mid';
      if (cl.indexOf('low') >= 0) return 'low';
    }
    return '';
  }

  function formatRoastHuman(rk) {
    const s = String(rk || '').toLowerCase();
    if (!s || isUnknownTrait(s)) return 'Don\'t Know';
    if (s === 'ultra-light' || s === 'ultralight') return 'Ultra-Light';
    if (s === 'medium-light' || s === 'med-light') return 'Med-Light';
    if (s === 'medium-dark' || s === 'med-dark') return 'Med-Dark';
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function formatProcessHuman(pk) {
    const s = String(pk || '').toLowerCase();
    if (!s || isUnknownTrait(s)) return 'Don\'t Know';
    return s.split(/[\s-]+/).map(function (w) { return w ? (w.charAt(0).toUpperCase() + w.slice(1)) : ''; }).join(' ');
  }

  function formatMethodHuman(mk) {
    const raw = String(mk || '').trim();
    if (!raw || isUnknownTrait(raw)) return 'Brew';
    const low = raw.toLowerCase();
    const map = {
      v60: 'V60 Pour-Over',
      chemex: 'Chemex',
      kalita: 'Kalita Wave',
      origami: 'Origami',
      orea: 'Orea V3',
      switch: 'Hario Switch',
      aeropress: 'AeroPress',
      espresso: 'Espresso',
      press: 'French Press',
      frenchpress: 'French Press',
      moka: 'Moka Pot',
      cold: 'Cold Brew',
      cupping: 'Cupping Table',
      aiden: 'Fellow Aiden',
      philips5500: 'Philips 5500',
      drip: 'Auto Drip',
      clever: 'Clever Dripper'
    };
    if (map[low]) return map[low];
    return raw.replace(/[-_]+/g, ' ').replace(/\b[a-z]/g, function (c) { return c.toUpperCase(); });
  }

  function isRowExcludedFromPalate(r) {
    if (!r || typeof r !== 'object') return true;
    if (window.BTCoreV6 && typeof window.BTCoreV6.isRowExcludedFromLearning === 'function') {
      try {
        if (window.BTCoreV6.isRowExcludedFromLearning(r)) return true;
      } catch (_) {}
    }
    if (
      r.exclude_learning === true || r.excludeLearning === true ||
      r.exclude_learning === '1' || r.exclude_learning === 'true' || r.exclude_learning === 'yes'
    ) return true;
    const ctx = r.contextTag || r.palate_context || r.outlier_reason;
    if (ctx) {
      const cl = String(ctx).toLowerCase();
      if (cl === 'off_palate' || cl === 'sick' || cl === 'toothpaste' || cl === 'spicy_meal' || cl === 'skip_learning') return true;
    }
    const rawA = r.recipe_adaptation_json;
    if (rawA) {
      if (typeof rawA === 'string') {
        if (rawA.indexOf('"exclude_learning":true') >= 0 || rawA.indexOf('"off_palate"') >= 0) return true;
      } else if (rawA.v6 && (rawA.v6.exclude_learning === true || rawA.v6.outlier_reason === 'off_palate')) return true;
    }
    const rawC = r.cva_intensity_json;
    if (rawC) {
      if (typeof rawC === 'string') {
        if (rawC.indexOf('"exclude_learning":true') >= 0 || rawC.indexOf('"off_palate"') >= 0) return true;
      } else if (rawC.v6 && rawC.v6.exclude_learning === true) return true;
    }
    return false;
  }

  function rowChronoKey(r) {
    if (!r || typeof r !== 'object') return '';
    return String(r.saved_at || r.cupping_date || r.brew_date || r.date || '').trim();
  }

  function rowChronoMs(r) {
    const raw = rowChronoKey(r);
    if (!raw) return 0;
    if (/^\d{10,13}$/.test(raw)) {
      const num = parseInt(raw, 10);
      return raw.length === 10 ? num * 1000 : num;
    }
    const isoDateOnly = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoDateOnly) {
      return Date.UTC(parseInt(isoDateOnly[1], 10), parseInt(isoDateOnly[2], 10) - 1, parseInt(isoDateOnly[3], 10));
    }
    const parsed = Date.parse(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function formatShortRowDate(r) {
    const raw = rowChronoKey(r);
    if (!raw) return '';
    const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return m[1] + '-' + m[2] + '-' + m[3];
    const ms = rowChronoMs(r);
    if (ms > 0) {
      try { return new Date(ms).toISOString().slice(0, 10); } catch (_) {}
    }
    return raw.slice(0, 10);
  }

  function formatTimelapseRangeLabel(slicedRows, totalRows) {
    const k = Array.isArray(slicedRows) ? slicedRows.length : 0;
    const n = Array.isArray(totalRows) ? totalRows.length : k;
    if (!n) return 'No cups logged yet';
    const d0 = k > 0 ? formatShortRowDate(slicedRows[0]) : '';
    const d1 = k > 0 ? formatShortRowDate(slicedRows[k - 1]) : '';
    const rangeStr = (d0 && d1) ? (d0 === d1 ? d0 : (d0 + ' \u2013 ' + d1)) : '';
    return 'First ' + k + ' of ' + n + ' cup' + (n === 1 ? '' : 's') + (rangeStr ? (' (' + rangeStr + ')') : '');
  }

  function getDemoHistoryRows() {
    return [
      { coffee_id: 'd1', coffee_name: 'Worka Chelbesa', roaster: 'Sey', origin: 'Ethiopia', region: 'Yirgacheffe', process: 'Washed', roast_level: 'light', elevation_m: '1950', varietal: 'Heirloom', brew_method: 'v60', brew_date: '2026-01-12', saved_at: '2026-01-12T08:15:00Z', my_rating_stars: '4.9', acidity_intensity: '4', sweetness_intensity: '5', body_intensity: '2', flavors_liked: 'Jasmine, Bergamot, White Peach' },
      { coffee_id: 'd2', coffee_name: 'Kirinyaga AA', roaster: 'Tim Wendelboe', origin: 'Kenya', region: 'Kirinyaga', process: 'Washed', roast_level: 'light', elevation_m: '1850', varietal: 'SL28', brew_method: 'v60', brew_date: '2026-01-24', saved_at: '2026-01-24T09:05:00Z', my_rating_stars: '4.8', acidity_intensity: '5', sweetness_intensity: '4', body_intensity: '3', flavors_liked: 'Blackcurrant, Pink Grapefruit' },
      { coffee_id: 'd3', coffee_name: 'El Paraiso Pink Bourbon', roaster: 'Onyx', origin: 'Colombia', region: 'Cauca', process: 'Anaerobic', roast_level: 'medium-light', elevation_m: '1700', varietal: 'Pink Bourbon', brew_method: 'switch', brew_date: '2026-02-05', saved_at: '2026-02-05T08:40:00Z', my_rating_stars: '4.6', acidity_intensity: '4', sweetness_intensity: '5', body_intensity: '4', flavors_liked: 'Strawberry, Pineapple, Honey' },
      { coffee_id: 'd4', coffee_name: 'Cerrado Mineiro', roaster: 'Verve', origin: 'Brazil', region: 'Cerrado', process: 'Natural', roast_level: 'medium', elevation_m: '1100', varietal: 'Bourbon', brew_method: 'espresso', brew_date: '2026-02-19', saved_at: '2026-02-19T14:20:00Z', my_rating_stars: '4.1', acidity_intensity: '2', sweetness_intensity: '4', body_intensity: '4', flavors_liked: 'Hazelnut, Milk Chocolate, Caramel' },
      { coffee_id: 'd5', coffee_name: 'Boquete Esmeralda', roaster: 'La Cabra', origin: 'Panama', region: 'Boquete', process: 'Washed', roast_level: 'ultra-light', elevation_m: '1820', varietal: 'Gesha', brew_method: 'orea', brew_date: '2026-03-04', saved_at: '2026-03-04T08:30:00Z', my_rating_stars: '5.0', acidity_intensity: '5', sweetness_intensity: '5', body_intensity: '2', flavors_liked: 'Jasmine, Rose, Bergamot' }
    ];
  }

  function getHistoryRows(slicePct) {
    const stObj = window.BTStorage && typeof window.BTStorage.getHistory === 'function' ? window.BTStorage.getHistory() : null;
    const rawAll = stObj && Array.isArray(stObj.objs) ? stObj.objs : [];
    const filteredLive = rawAll.filter(function (r) { return !isRowExcludedFromPalate(r); });
    const source = (!filteredLive.length && palateState.demoMode) ? getDemoHistoryRows() : filteredLive;
    if (!source.length) return [];

    /* Sort chronologically (oldest -> newest) by saved_at || cupping_date || brew_date */
    const chron = source.map(function (r, idx) {
      return { r: r, ts: rowChronoMs(r), key: rowChronoKey(r), idx: idx };
    }).sort(function (a, b) {
      if (a.ts !== b.ts) return a.ts - b.ts;
      if (a.key !== b.key) return a.key.localeCompare(b.key);
      return a.idx - b.idx;
    }).map(function (item) { return item.r; });

    const pct = clamp(slicePct, 15, 100, 100);
    if (pct >= 99.5) return chron;
    const keepN = Math.max(1, Math.round((chron.length * pct) / 100));
    return chron.slice(0, keepN);
  }

  function normKey(s) {
    return String(s || '').trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '');
  }

  function normCompact(s) {
    return String(s || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  function stripAccentsLower(s) {
    const str = String(s || '');
    const nfd = typeof str.normalize === 'function' ? str.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : str;
    return nfd.toLowerCase();
  }

  function escapeRegexStr(s) {
    return String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function wordBoundaryHas(haystack, needle) {
    const h = stripAccentsLower(haystack).trim();
    const n = stripAccentsLower(needle).trim();
    if (!h || !n) return false;
    const pat = escapeRegexStr(n).replace(/[\s\-']+/g, '[\\s\\-\']+');
    return new RegExp('(?:^|[^a-z0-9])' + pat + '(?:[^a-z0-9]|$)', 'i').test(h);
  }

  function rowStar(r) {
    const st = parseFloat(r.my_rating_stars);
    if (Number.isFinite(st) && st > 0) return clamp(st, 0.5, 5.0, 3.5);
    const sc = parseFloat(r.total_score);
    if (Number.isFinite(sc) && sc >= 60) return clamp(2.5 + ((sc - 70) / 22) * 2.5, 0.5, 5.0, 3.5);
    return 3.6;
  }

  function extractTrait1to5(r, intensityField, cvaField) {
    if (!r || typeof r !== 'object') return null;
    if (r[intensityField] != null && r[intensityField] !== '') {
      const iv = parseFloat(r[intensityField]);
      if (Number.isFinite(iv) && iv > 0) {
        return iv > 5.05 ? clamp(1 + (iv - 1) * 0.5, 1, 5, 3) : clamp(iv, 1, 5, 3);
      }
    }
    if (cvaField && r[cvaField] != null && r[cvaField] !== '') {
      const cv = parseFloat(r[cvaField]);
      if (Number.isFinite(cv) && cv > 0) {
        /* Rescale CVA 1–9 -> 1–5 via 1 + (v - 1) * 0.5 */
        return clamp(1 + (cv - 1) * 0.5, 1, 5, 3);
      }
    }
    return null;
  }

  function roastNumericValue(roastRaw) {
    if (!roastRaw || isUnknownTrait(roastRaw)) return null;
    const rk = normKey(roastRaw);
    if (rk === 'ultra-light' || rk === 'ultralight' || rk.indexOf('ultra') >= 0) return 1.4;
    if (rk === 'medium-light' || rk === 'med-light') return 2.6;
    if (rk === 'medium-dark' || rk === 'med-dark') return 3.9;
    if (rk.indexOf('dark') >= 0) return 4.5;
    if (rk === 'medium' || rk === 'med') return 3.3;
    if (rk.indexOf('light') >= 0) return 2.0;
    return 2.8;
  }

  function processFunkValue(procRaw) {
    if (!procRaw || isUnknownTrait(procRaw)) return null;
    const pk = normKey(procRaw);
    if (/anaerobic|carbonic|infused|co-?ferment|koji|thermal/.test(pk)) return 4.5;
    if (/natural/.test(pk)) return 3.9;
    if (/honey|pulped|wet-?hull|giling/.test(pk)) return 3.2;
    if (/washed|wet/.test(pk)) return 1.9;
    return 2.8;
  }

  function computeRobustBagDialScoreLocal(starRatingsArray) {
    const clean = [];
    let mx = -Infinity;
    if (Array.isArray(starRatingsArray)) {
      for (let i = 0; i < starRatingsArray.length; i++) {
        const v = parseFloat(starRatingsArray[i]);
        if (Number.isFinite(v) && v > 0) {
          clean.push(v);
          if (v > mx) mx = v;
        }
      }
    }
    const n = clean.length;
    if (n === 0) return 3.8;
    if (n <= 2) {
      const s2 = clean.reduce(function (a, b) { return a + b; }, 0);
      return +(0.6 * (s2 / n) + 0.4 * mx).toFixed(3);
    }
    const sorted = clean.slice().sort(function (a, b) { return a - b; });
    const mid = Math.floor(n / 2);
    const med = n % 2 ? sorted[mid] : 0.5 * (sorted[mid - 1] + sorted[mid]);
    const absDevs = clean.map(function (x) { return Math.abs(x - med); }).sort(function (a, b) { return a - b; });
    const mad = n % 2 ? absDevs[mid] : 0.5 * (absDevs[mid - 1] + absDevs[mid]);
    const sig = Math.max(0.225, 1.4826 * mad);
    let wSum = 0;
    let wValSum = 0;
    let robMax = -Infinity;
    for (let m = 0; m < n; m++) {
      const x = clean[m];
      let w = 1.0;
      if (x < med) {
        const u = (x - med) / (0.95 * sig);
        w = 1.0 / (1.0 + (u * u) / 3.0);
        if (Math.abs(u) > 2.2) w = 1.0 / (1.0 + u * u * 3.2);
      }
      wSum += w;
      wValSum += w * x;
      if (w >= 0.25 && x > robMax) robMax = x;
    }
    return +(0.6 * (wSum > 0 ? (wValSum / wSum) : med) + 0.4 * (Number.isFinite(robMax) ? robMax : mx)).toFixed(3);
  }

  function matchOriginKey(rawOrigin, atlas) {
    if (isUnknownTrait(rawOrigin)) return '';
    const list = Array.isArray(atlas) && atlas.length ? atlas : getFullOriginAtlas();
    const text = stripAccentsLower(rawOrigin).trim();
    if (!text) return '';
    const nc = canonicalizeOriginKey(text);
    /* 1. Direct canonical key or exact name match */
    for (let i = 0; i < list.length; i++) {
      const o = list[i];
      if (nc === o.key || nc === normCompact(o.name)) return o.key;
    }

    /* 2. Word-boundary matching across names & o.aliases with span subsumption */
    const hits = [];
    const hasSouthAfrica = /\bsouth\s+africa\b/i.test(text);
    const hasJavaVarietal = /\bjava\s+variet(?:y|al)\b/i.test(text);

    for (let i = 0; i < list.length; i++) {
      const o = list[i];
      if (!o || !o.key) continue;
      if (o.key === 'africa' && hasSouthAfrica) continue;
      const terms = [];
      const seenT = Object.create(null);
      const addTerm = function (t, isPrimary) {
        const clean = stripAccentsLower(t).trim().replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim();
        if (!clean || clean.length < 2 || seenT[clean]) return;
        seenT[clean] = true;
        terms.push({ term: clean, isPrimary: !!isPrimary });
      };
      addTerm(o.name, true);
      if (o.key.length >= 3) addTerm(o.key, true);
      (Array.isArray(o.aliases) ? o.aliases : []).forEach(function (al) { addTerm(al, false); });

      for (let ti = 0; ti < terms.length; ti++) {
        const tm = terms[ti];
        if (o.key === 'indonesia' && tm.term === 'java' && hasJavaVarietal) continue;
        const pat = escapeRegexStr(tm.term).replace(/[\s\-']+/g, '[\\s\\-\']+');
        const re = new RegExp('(?:^|[^a-z0-9])(' + pat + ')(?=[^a-z0-9]|$)', 'gi');
        let m;
        while ((m = re.exec(text)) !== null) {
          const fullStart = m.index;
          const cap = m[1];
          const relOffset = m[0].indexOf(cap);
          const start = fullStart + (relOffset >= 0 ? relOffset : 0);
          const end = start + cap.length;
          hits.push({ key: o.key, start: start, end: end, len: cap.length, term: tm.term, isPrimary: tm.isPrimary });
        }
      }
    }

    if (!hits.length) return '';

    /* Discard matches strictly subsumed inside a longer match span (e.g. 'nord' inside 'nord kivu') */
    const kept = hits.filter(function (h) {
      return !hits.some(function (other) {
        return other !== h && other.start <= h.start && other.end >= h.end && other.len > h.len;
      });
    });

    /* If another primary country matched alongside ambiguous bare 'java', prefer the primary country */
    const nonBareJava = kept.filter(function (h) { return !(h.key === 'indonesia' && h.term === 'java'); });
    const finalHits = (nonBareJava.length > 0 && nonBareJava.some(function (h) { return h.isPrimary && h.key !== 'indonesia'; }))
      ? nonBareJava
      : kept;

    const matchedKeys = new Set();
    finalHits.forEach(function (h) { matchedKeys.add(h.key); });

    if (matchedKeys.size === 0) return '';
    if (matchedKeys.size >= 2) return 'blend';
    return Array.from(matchedKeys)[0];
  }

  function extractPalateRowBlendInfo(r) {
    if (!r || typeof r !== 'object') return { isBlend: false, pillText: '', components: [] };
    function parseObj(raw) {
      if (!raw) return null;
      if (typeof raw === 'object' && !Array.isArray(raw)) return raw;
      if (typeof raw !== 'string') return null;
      try {
        const p = JSON.parse(raw);
        return (p && typeof p === 'object' && !Array.isArray(p)) ? p : null;
      } catch (_) { return null; }
    }
    const ad = parseObj(r.recipe_adaptation_json) || {};
    const ej = parseObj(r.extra_json) || {};
    const adCe = parseObj(ad.coffee_extra) || {};
    const ejCe = parseObj(ej.coffee_extra) || {};
    const directCe = parseObj(r.coffee_extra) || {};
    const comps = (Array.isArray(adCe.blendComponents) && adCe.blendComponents.length >= 2) ? adCe.blendComponents
      : (Array.isArray(ejCe.blendComponents) && ejCe.blendComponents.length >= 2) ? ejCe.blendComponents
      : (Array.isArray(ej.blendComponents) && ej.blendComponents.length >= 2) ? ej.blendComponents
      : (Array.isArray(directCe.blendComponents) && directCe.blendComponents.length >= 2) ? directCe.blendComponents
      : (Array.isArray(r.blendComponents) && r.blendComponents.length >= 2) ? r.blendComponents
      : null;
    const isBlend = !!(adCe.isBlend || ejCe.isBlend || ej.isBlend || directCe.isBlend || ad.isBlend || r.isBlend || (comps && comps.length >= 2));
    if (!isBlend || !comps) return { isBlend: false, pillText: '', components: [] };
    const wA = parseFloat(comps[0] && comps[0].weightG);
    const wB = parseFloat(comps[1] && comps[1].weightG);
    let pA = parseFloat(comps[0] && comps[0].ratioPct);
    let pB = parseFloat(comps[1] && comps[1].ratioPct);
    if (Number.isFinite(wA) && wA > 0 && Number.isFinite(wB) && wB > 0) {
      pA = Math.round((wA / (wA + wB)) * 100);
      pB = 100 - pA;
    } else if (Number.isFinite(pA) && pA > 0) {
      pA = Math.round(clamp(pA, 1, 99, 50));
      pB = 100 - pA;
    } else {
      pA = 50; pB = 50;
    }
    const fmtG = function (v) { return (Number.isFinite(v) && v > 0) ? (String(Math.round(v * 10) / 10).replace(/\.0$/, '') + 'g') : ''; };
    const wTxt = (Number.isFinite(wA) && wA > 0 && Number.isFinite(wB) && wB > 0) ? (fmtG(wA) + ' + ' + fmtG(wB) + ' \u00B7 ') : '';
    return {
      isBlend: true,
      pillText: '2-Coffee Blend (' + wTxt + pA + '%/' + pB + '%)',
      components: comps.slice(0, 2)
    };
  }

  /* Hierarchical Empirical-Bayes Shrinkage Engine ("Don't Know"-Safe + Elevation + Flavors) */
  function computeBayesianPalate(rows, opts) {
    opts = opts || {};
    rows = Array.isArray(rows) ? rows : getHistoryRows();
    const atlas = getFullOriginAtlas();
    const byCoffee = new Map();
    const brewerBagMap = new Map(); /* mk -> Map(cid -> { bagRef, stars: [] }) */
    const likedNotes = new Map();
    const dislikedNotes = new Map();
    const coOccur = new Map();
    let includedRowCount = 0;

    rows.forEach(function (r) {
      if (isRowExcludedFromPalate(r)) return;
      includedRowCount++;
      const st = rowStar(r);
      const cid = r.coffee_id || (normKey(r.coffee_name) + '|' + normKey(r.roaster)) || ('row_' + includedRowCount);
      const origKey = matchOriginKey(r.origin || r.country, atlas);
      const procKey = isUnknownTrait(r.process) ? '' : normKey(r.process);
      const roastKey = isUnknownTrait(r.roast_level || r.roast) ? '' : normKey(r.roast_level || r.roast);
      const varKey = isUnknownTrait(r.varietal) ? '' : normKey(r.varietal);
      const elevBand = classifyElevationBand(r);

      let rec = byCoffee.get(cid);
      if (!rec) {
        const regRaw = String(r.region || r.subregion || r.farm || '').trim();
        rec = {
          cid: cid,
          name: r.coffee_name || 'Unnamed Coffee',
          roaster: r.roaster || '',
          origin: origKey,
          region: (!regRaw || isUnknownTrait(regRaw)) ? 'General Region' : regRaw,
          process: procKey,
          roast: roastKey,
          varietal: varKey,
          elevationBand: elevBand,
          stars: [],
          cups: [],
          ac: [], sw: [], bd: []
        };
        byCoffee.set(cid, rec);
      } else {
        if (!rec.origin && origKey) rec.origin = origKey;
        if (!rec.process && procKey) rec.process = procKey;
        if (!rec.roast && roastKey) rec.roast = roastKey;
        if (!rec.varietal && varKey) rec.varietal = varKey;
        if (!rec.elevationBand && elevBand) rec.elevationBand = elevBand;
      }
      rec.stars.push(st);
      const tempCVal = +r.brew_temp_c > 0 ? Math.round(+r.brew_temp_c) : (+r.brew_temp_f > 0 ? Math.round((+r.brew_temp_f - 32) * 5 / 9) : 0);
      const ratioVal = +r.brew_ratio > 0 ? +r.brew_ratio : ((+r.brew_dose_g > 0 && +r.brew_water_g > 0) ? Math.round((+r.brew_water_g / +r.brew_dose_g) * 10) / 10 : 0);
      rec.cups.push({
        coffee: r.coffee_name || 'Logged Brew',
        roaster: r.roaster || '',
        method: r.brew_method || 'v60',
        date: r.cupping_date || r.brew_date || r.date || '',
        star: st,
        sca: parseFloat(r.total_score) || 0,
        tds: parseFloat(r.brew_tds_pct) || 0,
        ey: parseFloat(r.brew_ey_pct) || 0,
        tempC: tempCVal,
        ratio: ratioVal,
        grind: r.brew_grind_setting || (r.brew_grind_target_um ? (r.brew_grind_target_um + ' \u00B5m') : ''),
        locked: r.dial_locked === 'yes' || r.dial_locked === '1',
        notes: r.flavors_liked || r.words_flavor || r.bag_notes || '',
        rawRow: r
      });
      const acVal = extractTrait1to5(r, 'acidity_intensity', 'acidity');
      const swVal = extractTrait1to5(r, 'sweetness_intensity', 'sweetness');
      const bdVal = extractTrait1to5(r, 'body_intensity', 'body');
      if (acVal != null) rec.ac.push(acVal);
      if (swVal != null) rec.sw.push(swVal);
      if (bdVal != null) rec.bd.push(bdVal);

      /* Group brewer ratings per unique bag (matching all other EB boards) */
      const mk = isUnknownTrait(r.brew_method) ? 'v60' : (normKey(r.brew_method) || 'v60');
      let bm = brewerBagMap.get(mk);
      if (!bm) {
        bm = { key: mk, label: formatMethodHuman(mk), byBag: new Map(), cupCount: 0 };
        brewerBagMap.set(mk, bm);
      }
      bm.cupCount++;
      let bEntry = bm.byBag.get(cid);
      if (!bEntry) {
        bEntry = { bag: rec, stars: [] };
        bm.byBag.set(cid, bEntry);
      }
      bEntry.stars.push(st);

      const userLiked = String(r.flavors_liked || r.words_flavor || '')
        .split(/[,;|]/)
        .map(function (s) { return s.trim(); })
        .filter(function (w) { return !!w && !isUnknownTrait(w); });
      const bagNotesFallback = (!userLiked.length && st >= 3.75 && r.bag_notes && !isUnknownTrait(r.bag_notes))
        ? String(r.bag_notes).split(/[,;|/]/).map(function (s) { return s.trim(); }).filter(function (w) { return !!w && !isUnknownTrait(w); })
        : [];
      const lk = userLiked.length ? userLiked : bagNotesFallback;

      lk.forEach(function (w) {
        const cur = likedNotes.get(w) || { word: w, n: 0, sumStar: 0, rows: [] };
        cur.n++;
        cur.sumStar += st;
        cur.rows.push(r);
        likedNotes.set(w, cur);
      });
      for (let i = 0; i < lk.length; i++) {
        for (let j = i + 1; j < lk.length; j++) {
          const pair = lk[i] < lk[j] ? lk[i] + '||' + lk[j] : lk[j] + '||' + lk[i];
          coOccur.set(pair, (coOccur.get(pair) || 0) + 1);
        }
      }

      String(r.flavors_not_liked || '')
        .split(/[,;|]/)
        .map(function (s) { return s.trim(); })
        .filter(function (w) { return !!w && !isUnknownTrait(w); })
        .forEach(function (w) {
          dislikedNotes.set(w, (dislikedNotes.get(w) || 0) + 1);
        });
    });

    function computeBagDialScore(starsArr) {
      const rawDial = (window.BTCoreV6 && typeof window.BTCoreV6.computeRobustBagDialScore === 'function')
        ? window.BTCoreV6.computeRobustBagDialScore(starsArr)
        : computeRobustBagDialScoreLocal(starsArr);
      return Number.isFinite(+rawDial) ? clamp(+rawDial, 0.5, 5.0, 3.8) : 3.8;
    }

    let unknownFilteredCount = 0;
    const coffees = Array.from(byCoffee.values()).map(function (c) {
      if (!c.origin || c.origin === 'blend' || !c.process || !c.roast || !c.elevationBand) unknownFilteredCount++;
      c.dialScore = computeBagDialScore(c.stars);
      return c;
    });

    const nC = coffees.length;
    const rawGlobalMean = nC
      ? coffees.reduce(function (acc, c) { return acc + (Number.isFinite(c.dialScore) ? c.dialScore : 3.8); }, 0) / nC
      : 3.95;
    const globalMean = Number.isFinite(rawGlobalMean) ? rawGlobalMean : 3.95;

    let wSum = 0, acSum = 0, swSum = 0, bdSum = 0, rstSum = 0, fnkSum = 0;
    function meanOfFinite(arr) {
      if (!Array.isArray(arr) || !arr.length) return null;
      let s = 0, cnt = 0;
      for (let i = 0; i < arr.length; i++) {
        if (Number.isFinite(arr[i])) { s += arr[i]; cnt++; }
      }
      return cnt ? (s / cnt) : null;
    }
    coffees.forEach(function (c) {
      const w = Math.max(0.15, (Number.isFinite(c.dialScore) ? c.dialScore : 3.8) - 2.5);
      wSum += w;
      const acMean = meanOfFinite(c.ac);
      const swMean = meanOfFinite(c.sw);
      const bdMean = meanOfFinite(c.bd);
      const rNum = roastNumericValue(c.roast);
      const fNum = processFunkValue(c.process);
      const ac = acMean != null
        ? acMean
        : (rNum == null ? (c.elevationBand === 'high' ? 4.1 : 3.3) : clamp(5.2 - rNum * 0.65, 1.5, 4.6, 3.3));
      const sw = swMean != null
        ? swMean
        : clamp(3.0 + (c.dialScore - 3.5) * 0.45 + (/natural|honey/.test(c.process) ? 0.35 : 0) + (c.roast === 'medium-light' || c.roast === 'medium' ? 0.2 : 0), 1.8, 4.6, 3.4);
      const bd = bdMean != null
        ? bdMean
        : (!c.process ? 3.1 : (/wet-?hull|natural/.test(c.process) ? 3.9 : (/honey/.test(c.process) ? 3.4 : 2.7)));
      const rst = rNum != null ? rNum : 2.8;
      const fnk = fNum != null ? fNum : 2.8;
      acSum += w * ac;
      swSum += w * sw;
      bdSum += w * bd;
      rstSum += w * rst;
      fnkSum += w * fnk;
    });

    const isScopedCalc = !!opts.scoped;
    const shrink = isScopedCalc ? (nC ? 1.0 : 0) : (nC / (nC + 3));
    const safeW = wSum > 0 ? wSum : 1;
    const axes = [
      { key: 'acidity', label: 'Acidity', val: nC ? shrink * (acSum / safeW) + (1 - shrink) * palateState.seedAcidity : palateState.seedAcidity },
      { key: 'sweetness', label: 'Sweetness', val: nC ? shrink * (swSum / safeW) + (1 - shrink) * palateState.seedSweetness : palateState.seedSweetness },
      { key: 'body', label: 'Body Weight', val: nC ? shrink * (bdSum / safeW) + (1 - shrink) * palateState.seedBody : palateState.seedBody },
      { key: 'roast', label: 'Roast Depth', val: nC ? shrink * (rstSum / safeW) + (1 - shrink) * palateState.seedRoast : palateState.seedRoast },
      { key: 'funk', label: 'Funk vs Clarity', val: nC ? shrink * (fnkSum / safeW) + (1 - shrink) * palateState.seedFunk : palateState.seedFunk }
    ];
    const ciHalf = clamp(0.75 / Math.sqrt(Math.max(1, nC)), 0.14, 0.72, 0.45);

    /* Empirical-Bayes posterior summary with empirical sample variance & LCB80 ranking */
    function computeEbBucketStats(vals, kPrior) {
      const n = vals.length;
      const sum = vals.reduce(function (a, v) { return a + v; }, 0);
      const rawMean = sum / Math.max(1, n);
      const confWeight = n / (n + kPrior);
      const postMean = confWeight * rawMean + (1 - confWeight) * globalMean;
      const priorVar = 0.55 * 0.55;
      let sampleVar = priorVar;
      if (n >= 2) {
        let sq = 0;
        for (let i = 0; i < n; i++) {
          const d = vals[i] - rawMean;
          sq += d * d;
        }
        sampleVar = sq / (n - 1);
      }
      const postVar = (kPrior * priorVar + Math.max(0, n - 1) * sampleVar) / (kPrior + Math.max(0, n - 1));
      const se = Math.sqrt(Math.max(0.01, postVar) / (n + kPrior));
      const lcb80 = postMean - 1.28 * se;
      return {
        n: n,
        rawMean: +rawMean.toFixed(2),
        mean: +postMean.toFixed(2),
        confPct: Math.round(confWeight * 100),
        ciLo: +Math.max(1, postMean - 1.28 * se).toFixed(2),
        ciHi: +Math.min(5, postMean + 1.28 * se).toFixed(2),
        lcb80: +lcb80.toFixed(4)
      };
    }

    /* Shrinkage Leaderboard: Ranked by LCB80 (80% Lower Credible Bound) — Strictly Skips Unknown/Empty */
    function buildTraitLeaderboard(extractKeyFn, priorK) {
      const kPrior = priorK || 2.5;
      const buckets = new Map();
      coffees.forEach(function (c) {
        const k = extractKeyFn(c);
        if (!k || k === 'blend' || isUnknownTrait(k)) return;
        const b = buckets.get(k) || { key: k, vals: [], bags: [] };
        b.vals.push(c.dialScore);
        b.bags.push(c);
        buckets.set(k, b);
      });
      const items = Array.from(buckets.values()).map(function (b) {
        const st = computeEbBucketStats(b.vals, kPrior);
        return Object.assign({ key: b.key, bags: b.bags }, st);
      });
      items.sort(function (a, b) { return b.lcb80 - a.lcb80 || b.mean - a.mean; });
      return items;
    }

    const originBoard = buildTraitLeaderboard(function (c) { return c.origin || ''; }, 2.5);
    const processBoard = buildTraitLeaderboard(function (c) { return c.process || ''; }, 2.5);
    const roastBoard = buildTraitLeaderboard(function (c) { return c.roast || ''; }, 2.5);
    const elevationBoard = buildTraitLeaderboard(function (c) { return c.elevationBand || ''; }, 2.5);
    const varietalBoard = buildTraitLeaderboard(function (c) { return c.varietal || ''; }, 2.5);

    /* Brewer Board: aggregated per unique bag (robust bag score) with full LCB80 sorting */
    const brewerBoard = Array.from(brewerBagMap.values()).map(function (bm) {
      const bagVals = [];
      const bagRefs = [];
      bm.byBag.forEach(function (bEntry) {
        bagVals.push(computeBagDialScore(bEntry.stars));
        bagRefs.push(bEntry.bag);
      });
      const st = computeEbBucketStats(bagVals, 2.5);
      return Object.assign({
        key: bm.key,
        label: bm.label,
        cupCount: bm.cupCount,
        bags: bagRefs
      }, st);
    }).sort(function (a, b) { return b.lcb80 - a.lcb80 || b.mean - a.mean; });

    const topFlavorNotes = Array.from(likedNotes.values()).map(function (it) {
      const rawM = it.sumStar / Math.max(1, it.n);
      const shrM = (it.n * rawM + 2.0 * globalMean) / (it.n + 2.0);
      return {
        word: it.word,
        n: it.n,
        rawMean: +rawM.toFixed(2),
        mean: +shrM.toFixed(2)
      };
    }).filter(function (it) { return it.rawMean >= 3.2; }).sort(function (a, b) {
      return b.mean - a.mean || b.n - a.n;
    });

    return {
      totalRows: includedRowCount,
      uniqueCoffees: nC,
      unknownFilteredCount: unknownFilteredCount,
      coffees: coffees,
      globalMean: +globalMean.toFixed(2),
      shrink: shrink,
      isScoped: isScopedCalc,
      axes: axes,
      ciHalf: ciHalf,
      originBoard: originBoard,
      processBoard: processBoard,
      roastBoard: roastBoard,
      elevationBoard: elevationBoard,
      varietalBoard: varietalBoard,
      brewerBoard: brewerBoard,
      topFlavorNotes: topFlavorNotes,
      likedNotes: likedNotes,
      dislikedNotes: dislikedNotes,
      coOccur: coOccur
    };
  }

  /* ==========================================================================
   * SEGMENT 1: Coffee Belt World Map (52 Origins) + Radar + 4-Level EB Drill-In
   * ========================================================================== */
  function unneutPalate(v) {
    return typeof unneutralize === 'function' ? unneutralize(v || '') : String(v || '');
  }

  function quickBrewFromPalate(r) {
    if (!r) return;
    if (window.BTCellarTab && typeof window.BTCellarTab.hydrateAndBrewRow === 'function') {
      window.BTCellarTab.hydrateAndBrewRow(r);
      return;
    }
    const un = unneutPalate;
    const applyFn = function (a) {
      const bInfo = extractPalateRowBlendInfo(r);
      a.coffee = Object.assign(a.coffee || {}, {
        coffee_id: r.coffee_id || (a.coffee && a.coffee.coffee_id) || '',
        name: un(r.coffee_name) || 'Golden Brew',
        roaster: un(r.roaster),
        origin: un(r.origin),
        process: un(r.process),
        roast: un(r.roast_level) || 'light',
        isBlend: !!bInfo.isBlend,
        _blendSummaryOn: !!bInfo.isBlend,
        blendComponents: bInfo.isBlend ? bInfo.components.map(function (c) { return Object.assign({}, c); }) : [],
        answered: 'yes'
      });
      a.brew = a.brew || {};
      if (r.brew_method) a.brew.method = r.brew_method;
      if (+r.brew_dose_g > 0) a.brew.dose = +r.brew_dose_g;
      if (+r.brew_water_g > 0) a.brew.water = +r.brew_water_g;
      if (+r.brew_ratio > 0) a.brew.ratio = +r.brew_ratio;
      if (+r.brew_temp_c > 0) {
        a.brew.tempC = +r.brew_temp_c;
        a.brew.tempF = Math.round(+r.brew_temp_c * 9 / 5 + 32);
      }
      if (+r.brew_grind_target_um > 0) {
        a.brew.grindUm = +r.brew_grind_target_um;
        a.brew.grind_um = +r.brew_grind_target_um;
      }
      if (r.brew_grind_setting) a.brew.grind_setting = un(r.brew_grind_setting);
      a.recipeLocked = (r.dial_locked === 'yes' || r.dial_locked === '1');
    };
    if (typeof window.__btApplyAndNavigateWithBack === 'function') {
      window.__btApplyAndNavigateWithBack(applyFn, {
        targetStep: 'brew',
        returnRoute: 'palate',
        toast: 'Loaded "' + (un(r.coffee_name) || 'Golden Recipe') + '" into Brew Studio!'
      });
    } else {
      applyFn(getApp());
      saveDraftSoon();
      if (typeof sh().go === 'function') sh().go('recipe');
    }
  }

  function inspectCupFromPalate(r) {
    if (!r) return;
    if (window.BTCellarTab && typeof window.BTCellarTab.openDetail === 'function') {
      window.BTCellarTab.openDetail(r);
      return;
    }
    if (typeof sh().go === 'function') sh().go('history');
    notify('Opened Brew Journal for ' + (unneutPalate(r.coffee_name) || 'this cup'));
  }

  function jumpToJournalWithFilter(filterKey, query) {
    if (window.BTCellarTab && typeof window.BTCellarTab.openJournalFilter === 'function') {
      window.BTCellarTab.openJournalFilter(filterKey || 'all', query || '');
      return;
    }
    if (typeof sh().go === 'function') sh().go('history');
  }

  function summarizeCupsStats(rows) {
    const list = Array.isArray(rows) ? rows.filter(Boolean) : [];
    let starSum = 0, starN = 0, scaSum = 0, scaN = 0;
    let tdsSum = 0, tdsN = 0, eySum = 0, eyN = 0;
    let tempSum = 0, tempN = 0, ratioSum = 0, ratioN = 0;
    const noteFreq = new Map();
    const methodFreq = new Map();
    const originFreq = new Map();
    let lockedN = 0;

    list.forEach(function (r) {
      const st = rowStar(r);
      if (st > 0) { starSum += st; starN++; }
      const sc = parseFloat(r.total_score);
      if (Number.isFinite(sc) && sc > 0) { scaSum += sc; scaN++; }
      const tds = parseFloat(r.brew_tds_pct);
      if (Number.isFinite(tds) && tds > 0) { tdsSum += tds; tdsN++; }
      const ey = parseFloat(r.brew_ey_pct);
      if (Number.isFinite(ey) && ey > 0) { eySum += ey; eyN++; }
      const tc = +r.brew_temp_c > 0 ? +r.brew_temp_c : (+r.brew_temp_f > 0 ? (+r.brew_temp_f - 32) * 5 / 9 : 0);
      if (tc > 40 && tc <= 100) { tempSum += tc; tempN++; }
      const rat = +r.brew_ratio > 0 ? +r.brew_ratio : ((+r.brew_dose_g > 0 && +r.brew_water_g > 0) ? (+r.brew_water_g / +r.brew_dose_g) : 0);
      if (rat >= 1 && rat <= 30) { ratioSum += rat; ratioN++; }
      if (r.dial_locked === 'yes' || r.dial_locked === '1') lockedN++;

      const mk = String(r.brew_method || '').trim();
      if (mk && !isUnknownTrait(mk)) methodFreq.set(mk, (methodFreq.get(mk) || 0) + 1);
      const og = unneutPalate(r.origin || '').trim();
      if (og && !isUnknownTrait(og)) originFreq.set(og, (originFreq.get(og) || 0) + 1);
      String(unneutPalate(r.flavors_liked || r.words_flavor || r.bag_notes || ''))
        .split(/[,;|/]+/).map(function (s) { return s.trim(); })
        .filter(function (w) { return !!w && !isUnknownTrait(w); })
        .forEach(function (w) { noteFreq.set(w, (noteFreq.get(w) || 0) + 1); });
    });

    const topOf = function (m) {
      let best = '', bestN = 0;
      m.forEach(function (cnt, k) { if (cnt > bestN) { best = k; bestN = cnt; } });
      return best;
    };
    const topNotes = Array.from(noteFreq.entries())
      .sort(function (a, b) { return b[1] - a[1]; })
      .slice(0, 4).map(function (e) { return e[0]; });

    return {
      count: list.length,
      lockedN: lockedN,
      avgStar: starN ? +(starSum / starN).toFixed(2) : 0,
      avgSca: scaN ? +(scaSum / scaN).toFixed(1) : 0,
      avgTds: tdsN ? +(tdsSum / tdsN).toFixed(2) : 0,
      tdsN: tdsN,
      avgEy: eyN ? +(eySum / eyN).toFixed(1) : 0,
      eyN: eyN,
      avgTempC: tempN ? Math.round(tempSum / tempN) : 0,
      avgRatio: ratioN ? +(ratioSum / ratioN).toFixed(1) : 0,
      topMethod: topOf(methodFreq),
      topOrigin: topOf(originFreq),
      topNotes: topNotes
    };
  }

  function buildDrillCupCard(r, opts) {
    opts = opts || {};
    const un = unneutPalate;
    const cName = un(r.coffee_name) || 'Logged Brew';
    const rName = un(r.roaster);
    const isGold = r.dial_locked === 'yes' || r.dial_locked === '1';
    const isCup = String(r.brew_method || '').toLowerCase() === 'cupping' || String(r.score_kind || '').toLowerCase() === 'cva_affective';
    const bInfo = extractPalateRowBlendInfo(r);
    const stRaw = parseFloat(r.my_rating_stars);
    const st = (Number.isFinite(stRaw) && stRaw > 0) ? stRaw : rowStar(r);
    const scRaw = parseFloat(r.total_score);
    const sc = (Number.isFinite(scRaw) && scRaw > 0) ? scRaw : 0;
    const tempC = +r.brew_temp_c > 0 ? Math.round(+r.brew_temp_c) : (+r.brew_temp_f > 0 ? Math.round((+r.brew_temp_f - 32) * 5 / 9) : 0);
    const ratioStr = +r.brew_ratio > 0 ? ('1:' + (+r.brew_ratio).toFixed(1).replace(/\.0$/, '')) : ((+r.brew_dose_g > 0 && +r.brew_water_g > 0) ? (r.brew_dose_g + 'g:' + r.brew_water_g + 'g') : '');
    const grindStr = un(r.brew_grind_setting) || (+r.brew_grind_target_um > 0 ? (r.brew_grind_target_um + ' \u00B5m') : '');
    const tdsEy = (+r.brew_tds_pct > 0)
      ? (r.brew_tds_pct + '% TDS' + (+r.brew_ey_pct > 0 ? (' / ' + r.brew_ey_pct + '% EY') : ''))
      : '';
    const notesStr = un(r.flavors_liked || r.words_flavor || r.bag_notes || '').trim();
    const specLine = [
      String(r.brew_method || 'v60').toUpperCase(),
      r.cupping_date || r.brew_date || '',
      ratioStr,
      grindStr,
      tempC > 0 ? (tempC + '\u00B0C') : '',
      tdsEy
    ].filter(Boolean).join(' \u00B7 ');

    return domH('article', { class: 'bt-drill-cup-card' },
      domH('div', { class: 'bt-drill-cup-head' },
        domH('div', { style: 'min-width:0;flex:1 1 170px' },
          rName ? domH('div', { class: 'bt-drill-cup-sub', text: rName + (r.origin && !isUnknownTrait(r.origin) ? (' \u00B7 ' + un(r.origin)) : '') }) : null,
          domH('strong', { class: 'bt-drill-cup-title', text: cName })
        ),
        domH('div', { style: 'display:flex;gap:5px;flex-wrap:wrap;align-items:center' },
          bInfo.isBlend ? domH('span', { class: 'bt-tc-badge bt-journal-blend-badge is-copper', text: bInfo.pillText }) : null,
          isGold ? domH('span', { class: 'bt-tc-badge is-gold', text: 'Golden' }) : null,
          isCup ? domH('span', { class: 'bt-tc-badge is-sci', text: 'Cupping' }) : null,
          sc > 0 ? domH('span', { class: 'bt-tc-badge is-sci num-tab', text: sc.toFixed(1) + ' SCA' }) : null,
          st > 0 ? domH('span', { class: 'bt-tc-badge num-tab ' + (st >= 4.5 ? 'is-gold' : 'is-good'), text: st.toFixed(2) + '/5' }) : null
        )
      ),
      specLine ? domH('div', { class: 'bt-drill-cup-meta num-tab', text: specLine }) : null,
      notesStr ? domH('div', { class: 'bt-drill-cup-sub', text: 'Notes: ' + notesStr }) : null,
      domH('div', { class: 'bt-drill-cup-actions' },
        !palateState.demoMode ? domH('button', {
          type: 'button',
          class: 'bt-drill-action-pill bt-lab-btn is-sm',
          onclick: function () {
            CK.haptic('tick');
            inspectCupFromPalate(r);
          }
        }, 'Inspect Cup \u2192') : null,
        domH('button', {
          type: 'button',
          class: 'bt-drill-action-pill bt-lab-btn is-sm is-primary',
          onclick: function () {
            CK.haptic('snap');
            quickBrewFromPalate(r);
          }
        }, 'Brew \u2192')
      )
    );
  }

  function buildPalatePreferenceTargetsCard(rows) {
    const a = getApp();
    a.prefs = a.prefs || {};
    const saved = (a.prefs.palateTargets && typeof a.prefs.palateTargets === 'object') ? a.prefs.palateTargets : {};
    const normSavedStrength = (saved.strength === 'medium') ? 'balanced' : (saved.strength || 'balanced');
    if (!palateState.prefTargetDraft) {
      palateState.prefTargetDraft = {
        brightness: saved.brightness || 'balanced',
        strength: normSavedStrength,
        texture: saved.texture || 'balanced'
      };
    }
    const tgt = palateState.prefTargetDraft;
    const list = Array.isArray(rows) ? rows.filter(Boolean) : [];
    const eliteCrossBagN = list.filter(function (r) { return rowStar(r) >= 4.5; }).length;

    function persistPalateTargetsNow() {
      const appNow = getApp();
      appNow.prefs = appNow.prefs || {};
      appNow.prefs.palateTargets = {
        brightness: tgt.brightness,
        strength: tgt.strength,
        texture: tgt.texture
      };
      appNow.prefs.flavorBias = tgt.brightness;
      if (window.BTStorage && typeof window.BTStorage.savePrefs === 'function') {
        try { window.BTStorage.savePrefs(appNow.prefs); } catch (_) {}
      }
      saveDraftSoon();
      return appNow;
    }

    const axesDefs = [
      {
        key: 'brightness',
        title: 'Brightness vs Smoothness',
        opts: [
          { k: 'bright', lbl: 'Bright & Juicy', steer: '+1\u20132\u00B0C hotter water & lighter-roast extraction to highlight citrus/berry acidity' },
          { k: 'balanced', lbl: 'Balanced Sweet', steer: 'Standard balanced temperature & ratio for clean caramel-fruit harmony' },
          { k: 'smooth', lbl: 'Smooth & Cozy', steer: '\u22122\u00B0C cooler water & slightly coarser grind to round off sharp acidity' }
        ]
      },
      {
        key: 'strength',
        title: 'Cup Strength (%TDS)',
        opts: [
          { k: 'light', lbl: 'Light / Tea-Like (~1.25%)', steer: 'Longer ratio (~1:17\u20131:18) for delicate aromatics and floral transparency' },
          { k: 'balanced', lbl: 'Balanced (~1.35%)', steer: 'Classic specialty filter ratio (~1:16) with sweet, structured weight' },
          { k: 'strong', lbl: 'Rich & Strong (1.48%+)', steer: 'Tighter ratio (~1:14.5\u20131:15) for dense concentration and chocolate depth' }
        ]
      },
      {
        key: 'texture',
        title: 'Texture (Clarity vs Body)',
        opts: [
          { k: 'clarity', lbl: 'High Clarity', steer: 'Gentle laminar pours & clean paper filtration to separate crisp flavor layers' },
          { k: 'balanced', lbl: 'Silky Balanced', steer: 'Controlled swirl & steady drawdown for sweet, velvety balance' },
          { k: 'body', lbl: 'Syrupy Full Body', steer: 'Higher immersion/agitation or fuller-body brew style for creamy mouthfeel' }
        ]
      }
    ];

    const steerLines = axesDefs.map(function (ax) {
      const hit = ax.opts.find(function (o) { return o.k === tgt[ax.key]; }) || ax.opts[1];
      return ax.title.split(' ')[0] + ': ' + hit.steer;
    });

    /* Filter logged cups that match the active target bias (high-rated first) */
    const matchedCups = list.filter(function (r) {
      const st = rowStar(r);
      if (st < 3.5) return false;
      const rk = String(r.roast_level || r.roast || '').toLowerCase();
      const pr = String(r.process || '').toLowerCase();
      const tds = parseFloat(r.brew_tds_pct) || 0;
      const rat = +r.brew_ratio > 0 ? +r.brew_ratio : ((+r.brew_dose_g > 0 && +r.brew_water_g > 0) ? (+r.brew_water_g / +r.brew_dose_g) : 0);
      let ok = true;
      if (tgt.brightness === 'bright') {
        const ac = extractTrait1to5(r, 'acidity_intensity', 'acidity') || 0;
        if (!(ac >= 3.5 || rk.indexOf('light') >= 0 || pr.indexOf('washed') >= 0)) ok = false;
      } else if (tgt.brightness === 'smooth') {
        const ac = extractTrait1to5(r, 'acidity_intensity', 'acidity') || 0;
        if (!(rk === 'medium' || rk.indexOf('dark') >= 0 || (ac > 0 && ac <= 3) || pr.indexOf('natural') >= 0)) ok = false;
      }
      if (ok && tgt.strength === 'light') {
        if (!((tds > 0 && tds <= 1.36) || rat >= 16.5)) ok = false;
      } else if (ok && tgt.strength === 'strong') {
        if (!((tds >= 1.42) || (rat > 0 && rat <= 15.5))) ok = false;
      }
      if (ok && tgt.texture === 'clarity') {
        if (!(pr.indexOf('washed') >= 0 || /v60|chemex|orea|kalita|origami/.test(String(r.brew_method || '').toLowerCase()))) ok = false;
      } else if (ok && tgt.texture === 'body') {
        if (!(/natural|honey|anaerobic|wet/.test(pr) || /espresso|press|aeropress|switch|moka/.test(String(r.brew_method || '').toLowerCase()))) ok = false;
      }
      return ok;
    }).sort(function (a, b) { return rowStar(b) - rowStar(a); });

    const isDirty = (saved.brightness || 'balanced') !== tgt.brightness ||
      normSavedStrength !== tgt.strength ||
      (saved.texture || 'balanced') !== tgt.texture;
    const hasCustomBias = tgt.brightness !== 'balanced' || tgt.strength !== 'balanced' || tgt.texture !== 'balanced';
    const activeBagName = (a.coffee && a.coffee.name) ? unneutPalate(a.coffee.name) : '';

    return domH('section', { class: 'bt-studio-card', id: 'bt-palate-pref-targets' },
      domH('div', { class: 'bt-lab-card-head' },
        domH('div', { class: 'bt-lab-title-group', style: 'min-width:0;flex:1 1 200px' },
          ic('sliders', { size: 22 }),
          domH('div', { style: 'min-width:0;flex:1' },
            domH('h3', { text: 'Interactive Palate Targets & Recipe Bias' }),
            domH('p', { class: 'bt-lab-sub', text: 'Dial in your ideal brightness, strength (%TDS), and texture — actively steers Cup #1 recipes in Brew Studio & filters matching cups.' })
          )
        ),
        domH('button', {
          type: 'button',
          id: 'bt-save-pref-bias-btn',
          class: 'bt-lab-btn is-sm ' + (isDirty ? 'is-primary' : ''),
          onclick: function () {
            persistPalateTargetsNow();
            CK.haptic('celebrate');
            notify('Saved Palate Target Bias (' + tgt.brightness + ' \u00B7 ' + tgt.strength + ' \u00B7 ' + tgt.texture + ') — active for Cup #1 recipes!');
            rerenderPalateTab();
          }
        }, ic('check-seal', { size: 14 }), domH('span', { text: isDirty ? 'Save Preference Bias' : 'Preference Bias Saved' }))
      ),
      domH('div', { class: 'bt-palate-steer-banner', id: 'bt-palate-active-steer-banner' },
        domH('div', { style: 'display:flex;flex-direction:column;gap:4px;min-width:0;flex:1 1 220px' },
          domH('div', { style: 'display:flex;align-items:center;gap:6px;flex-wrap:wrap' },
            domH('span', {
              id: 'bt-palate-active-steer-badge',
              class: 'bt-tc-badge ' + (isDirty ? 'is-warn' : 'is-good'),
              text: isDirty ? 'Draft Unsaved \u00B7 Tap Save or Test' : 'Active Cup #1 Steering ON'
            }),
            eliteCrossBagN > 0 ? domH('span', {
              class: 'bt-tc-badge is-gold num-tab',
              text: eliteCrossBagN + ' Cross-Bag 4.5+/5 Cup' + (eliteCrossBagN === 1 ? '' : 's')
            }) : null
          ),
          domH('p', {
            class: 'bt-lab-hint',
            style: 'margin:0',
            text: 'Saved Palate Targets (' + tgt.brightness + ' \u00B7 ' + tgt.strength + ' \u00B7 ' + tgt.texture + ')' +
              (eliteCrossBagN > 0
                ? (' + ' + eliteCrossBagN + ' proven 4.5+/5 cross-bag brew' + (eliteCrossBagN === 1 ? '' : 's') + ' now actively steer Cup #1 grind, temp, %TDS & agitation in Brew Studio.')
                : (hasCustomBias
                  ? ' now actively steer Cup #1 grind, temp, %TDS & agitation in Brew Studio (and 4.5+/5 brews add cross-bag transfer).'
                  : ' + 4.5+/5 cross-bag history now actively steer Cup #1 recipes in Brew Studio.'))
          })
        ),
        domH('button', {
          type: 'button',
          id: 'bt-test-palate-bias-brew-btn',
          class: 'bt-lab-btn is-sm is-primary bt-palate-steer-cta',
          onclick: function () {
            const appNow = persistPalateTargetsNow();
            CK.haptic('snap');
            notify(activeBagName
              ? ('Applied Palate Bias to ' + activeBagName + ' in Brew Studio!')
              : 'Saved Palate Bias — opening Brew Studio to test on your active bag!');
            if (typeof sh().go === 'function') {
              sh().go(appNow.coffee && appNow.coffee.name ? 'recipe' : 'door');
            } else if (typeof sh().switchTab === 'function') {
              sh().switchTab('brew', { step: appNow.coffee && appNow.coffee.name ? 'brew' : 'door' });
            }
          }
        }, 'Test on Active Bag in Brew Studio \u2192')
      ),
      domH('div', { class: 'bt-pref-target-grid' },
        axesDefs.map(function (ax) {
          return domH('div', { class: 'bt-lab-subcard', style: 'display:flex;flex-direction:column;gap:7px;min-width:0' },
            domH('span', { class: 'bt-pref-tile-lbl', text: ax.title }),
            domH('div', { class: 'bt-rating-tier-bar', role: 'radiogroup', 'aria-label': ax.title },
              ax.opts.map(function (opt) {
                const on = tgt[ax.key] === opt.k;
                return domH('button', {
                  type: 'button',
                  class: 'bt-pref-target-chip bt-lab-chip bt-drillable' + (on ? ' is-active' : ''),
                  'aria-pressed': String(on),
                  'data-pref-axis': ax.key,
                  'data-pref-val': opt.k,
                  onclick: function () {
                    tgt[ax.key] = opt.k;
                    CK.haptic('tick');
                    rerenderPalateTab();
                  }
                }, opt.lbl);
              })
            )
          );
        })
      ),
      domH('div', { class: 'bt-drill-drawer', id: 'bt-pref-targets-drawer' },
        domH('div', { class: 'bt-drill-drawer-head' },
          domH('div', { style: 'min-width:0;flex:1' },
            domH('div', { class: 'bt-pref-tile-lbl', text: 'HOW THIS STEERS NEW RECIPES & MATCHING CUPS' }),
            domH('strong', { class: 'bt-drill-drawer-title', text: matchedCups.length + ' High-Rated Cup' + (matchedCups.length === 1 ? '' : 's') + ' Match Your Active Target' })
          )
        ),
        domH('div', { style: 'display:flex;flex-direction:column;gap:4px' },
          steerLines.map(function (sl) {
            return domH('p', { class: 'bt-lab-hint', style: 'margin:0', text: '\u2022 ' + sl });
          })
        ),
        matchedCups.length > 0 ? domH('div', { class: 'bt-drill-cup-list' },
          matchedCups.slice(0, 4).map(function (r) { return buildDrillCupCard(r); })
        ) : domH('p', { class: 'bt-lab-hint', style: 'margin:0', text: 'No logged 3.5+ cups match this exact target combo yet — save your bias and brew a new cup to test it!' })
      )
    );
  }

  function buildPerCoffeeScorecardLeaderboard(bayes) {
    const beans = (bayes && Array.isArray(bayes.coffees)) ? bayes.coffees.slice() : [];
    const scoredBeans = beans.map(function (c) {
      const cups = (c.cups || []).filter(function (cp) { return !!cp && !!cp.rawRow; });
      const bestCup = cups.slice().sort(function (a, b) { return b.star - a.star; })[0] || null;
      const latestCup = cups.length ? cups[cups.length - 1] : null;
      const isGold = cups.some(function (cp) { return cp.locked; });
      const bestStar = bestCup ? bestCup.star : c.dialScore;
      const stats = summarizeCupsStats(cups.map(function (cp) { return cp.rawRow; }));
      return { c: c, cups: cups, bestCup: bestCup, latestCup: latestCup, isGold: isGold, bestStar: bestStar, stats: stats };
    }).sort(function (a, b) {
      if (a.isGold !== b.isGold) return a.isGold ? -1 : 1;
      if (Math.abs(b.bestStar - a.bestStar) > 0.01) return b.bestStar - a.bestStar;
      return b.cups.length - a.cups.length;
    });

    const card = domH('section', { class: 'bt-studio-card', id: 'bt-palate-bean-scorecards' },
      domH('div', { class: 'bt-lab-card-head' },
        domH('div', { class: 'bt-lab-title-group', style: 'min-width:0;flex:1' },
          ic('fresh-bag', { size: 22 }),
          domH('div', { style: 'min-width:0;flex:1' },
            domH('h3', { text: 'Per-Coffee Scorecard Leaderboard (' + scoredBeans.length + ' Logged Bean' + (scoredBeans.length === 1 ? '' : 's') + ')' }),
            domH('p', { class: 'bt-lab-sub', text: 'Sorted by Golden seal & best rating — tap any coffee to expand all tries #1..#N, %TDS/%EY progression & 1-tap Brew Next.' })
          )
        )
      )
    );

    if (!scoredBeans.length) {
      card.appendChild(domH('p', { class: 'bt-lab-hint', text: 'Log your first coffee in Brew Studio to build your Per-Coffee Scorecard Leaderboard!' }));
      return card;
    }

    const listWrap = domH('div', { class: 'bt-drill-cup-list' });
    scoredBeans.slice(0, 18).forEach(function (sb) {
      const isOpen = palateState.selectedBeanCid === sb.c.cid;
      const metaBits = [
        sb.c.roaster || '',
        sb.c.origin ? (sb.c.origin.charAt(0).toUpperCase() + sb.c.origin.slice(1)) : '',
        sb.cups.length + (sb.cups.length === 1 ? ' try' : ' tries'),
        sb.stats.tdsN > 0 ? ('Avg ' + sb.stats.avgTds + '% TDS') : '',
        sb.stats.eyN > 0 ? (sb.stats.avgEy + '% EY') : ''
      ].filter(Boolean).join(' \u00B7 ');

      listWrap.appendChild(domH('button', {
        type: 'button',
        class: 'bt-bean-scorecard-row bt-drillable' + (isOpen ? ' is-active' : ''),
        'aria-expanded': String(isOpen),
        'data-bean-cid': sb.c.cid,
        onclick: function () {
          palateState.selectedBeanCid = isOpen ? '' : sb.c.cid;
          CK.haptic('tick');
          rerenderPalateTab();
        }
      },
        domH('div', { style: 'min-width:0;flex:1;text-align:left' },
          domH('strong', { class: 'bt-drill-cup-title', text: sb.c.name }),
          domH('div', { class: 'bt-drill-cup-sub num-tab', text: metaBits })
        ),
        domH('div', { style: 'display:flex;gap:5px;flex-wrap:wrap;align-items:center' },
          sb.isGold ? domH('span', { class: 'bt-tc-badge is-gold', text: 'Golden Locked' }) : null,
          domH('span', { class: 'bt-tc-badge num-tab ' + (sb.bestStar >= 4.5 ? 'is-gold' : (sb.bestStar >= 3.5 ? 'is-good' : 'is-warn')), text: 'Best ' + sb.bestStar.toFixed(2) + '/5' })
        )
      ));

      if (isOpen) {
        const chron = sb.cups.slice().sort(function (a, b) {
          const da = String((a.rawRow && (a.rawRow.saved_at || a.rawRow.cupping_date)) || '');
          const db = String((b.rawRow && (b.rawRow.saved_at || b.rawRow.cupping_date)) || '');
          return da.localeCompare(db);
        });
        listWrap.appendChild(domH('div', { class: 'bt-drill-drawer', id: 'bt-bean-scorecard-drawer' },
          domH('div', { class: 'bt-drill-drawer-head' },
            domH('div', { style: 'min-width:0;flex:1' },
              domH('div', { class: 'bt-pref-tile-lbl', text: 'TRY PROGRESSION (#1 \u2192 #' + chron.length + ')' }),
              domH('strong', { class: 'bt-drill-drawer-title', text: sb.c.name + (sb.c.roaster ? (' \u00B7 ' + sb.c.roaster) : '') })
            ),
            domH('div', { style: 'display:flex;gap:6px;flex-wrap:wrap' },
              sb.bestCup && !palateState.demoMode ? domH('button', {
                type: 'button',
                class: 'bt-lab-btn is-sm',
                onclick: function () { inspectCupFromPalate(sb.bestCup.rawRow); }
              }, 'Inspect Best \u2192') : null,
              (sb.latestCup || sb.bestCup) ? domH('button', {
                type: 'button',
                class: 'bt-lab-btn is-sm is-primary',
                onclick: function () { quickBrewFromPalate((sb.bestCup && sb.bestCup.locked ? sb.bestCup : (sb.latestCup || sb.bestCup)).rawRow); }
              }, 'Brew Next \u2192') : null
            )
          ),
          domH('div', { class: 'bt-drill-cup-list' },
            chron.map(function (cp, idx) {
              const specs = [
                'Try #' + (idx + 1),
                formatMethodHuman(cp.method),
                cp.grind || '',
                cp.tempC > 0 ? (cp.tempC + '\u00B0C') : '',
                cp.ratio > 0 ? ('1:' + cp.ratio) : '',
                cp.tds > 0 ? (cp.tds + '% TDS' + (cp.ey > 0 ? (' / ' + cp.ey + '% EY') : '')) : ''
              ].filter(Boolean).join(' \u00B7 ');
              return domH('div', { class: 'bt-drill-cup-card' },
                domH('div', { class: 'bt-drill-cup-head' },
                  domH('div', { style: 'min-width:0;flex:1' },
                    domH('strong', { class: 'bt-drill-cup-meta num-tab', text: specs }),
                    cp.notes ? domH('div', { class: 'bt-drill-cup-sub', text: 'Notes: ' + cp.notes }) : null
                  ),
                  domH('div', { style: 'display:flex;gap:5px;flex-wrap:wrap;align-items:center' },
                    cp.locked ? domH('span', { class: 'bt-tc-badge is-gold', text: 'Golden' }) : null,
                    domH('span', { class: 'bt-tc-badge num-tab ' + (cp.star >= 4.5 ? 'is-gold' : (cp.star >= 3.5 ? 'is-good' : 'is-warn')), text: cp.star.toFixed(2) + '/5' }),
                    !palateState.demoMode ? domH('button', {
                      type: 'button',
                      class: 'bt-drill-action-pill bt-lab-btn is-sm',
                      onclick: function () { inspectCupFromPalate(cp.rawRow); }
                    }, 'Inspect') : null
                  )
                )
              );
            })
          )
        ));
      }
    });
    card.appendChild(listWrap);
    return card;
  }

  const RADAR_CX = 190;
  const RADAR_CY = 152;
  const RADAR_RMAX = 94;

  function radarPolarPt(axisIdx, val1to5, unclamped) {
    const ang = (-90 + axisIdx * 72) * (Math.PI / 180);
    const v = unclamped
      ? (Number.isFinite(val1to5) ? val1to5 : 3.0)
      : clamp(val1to5, 0.5, 5.0, 3.0);
    const r = (v / 5.0) * RADAR_RMAX;
    return [RADAR_CX + r * Math.cos(ang), RADAR_CY + r * Math.sin(ang)];
  }

  function renderPalateDnaSegment() {
    const wrap = domH('div', { class: 'bt-palate-seg' });
    const atlas = getFullOriginAtlas();
    const allRows = getHistoryRows(100);
    let curSlicedRows = getHistoryRows(palateState.timelapsePct);
    let curBayes = computeBayesianPalate(curSlicedRows);

    /* Cold-Start Seed Banner if 0 tastings (or Demo Lens Return Pill) */
    if (allRows.length === 0) {
      wrap.appendChild(domH('div', { class: 'bt-lab-subcard bt-coldstart-card' },
        domH('div', { class: 'bt-lab-card-head' },
          domH('div', { class: 'bt-lab-title-group' },
            ic('spark-star', { size: 20 }),
            domH('div', null,
              domH('strong', { text: 'Day-1 Palate Seed — Zero Brews Logged Yet' }),
              domH('p', { class: 'bt-lab-sub', text: 'Pick a starting taste vibe below or preview our sample sensory dataset (never adds junk CSV rows).' })
            )
          ),
          domH('button', {
            type: 'button',
            class: 'bt-lab-btn is-sm is-primary',
            onclick: function () {
              palateState.demoMode = !palateState.demoMode;
              CK.haptic('snap');
              rerenderPalateTab();
            }
          }, palateState.demoMode ? 'Exit Demo Lens' : 'Preview Sample Palate')
        ),
        domH('div', { class: 'bt-lab-chip-row' },
          [
            { lbl: 'Juicy Fruit & Florals', ac: 4.5, sw: 4.6, bd: 2.4, rs: 1.8, fn: 2.3 },
            { lbl: 'Caramel, Chocolate & Nut', ac: 2.6, sw: 4.6, bd: 4.1, rs: 3.4, fn: 1.9 },
            { lbl: 'Exotic Ferments & Jam', ac: 4.1, sw: 4.8, bd: 3.8, rs: 2.2, fn: 4.6 }
          ].map(function (seed) {
            return domH('button', {
              type: 'button',
              class: 'bt-lab-chip',
              onclick: function () {
                palateState.seedAcidity = seed.ac;
                palateState.seedSweetness = seed.sw;
                palateState.seedBody = seed.bd;
                palateState.seedRoast = seed.rs;
                palateState.seedFunk = seed.fn;
                CK.haptic('tick');
                rerenderPalateTab();
              }
            }, seed.lbl);
          })
        )
      ));
    } else if (palateState.demoMode) {
      wrap.appendChild(domH('div', { class: 'bt-lab-chip-row' },
        domH('button', {
          type: 'button',
          class: 'bt-lab-chip is-active',
          onclick: function () { palateState.demoMode = false; palateState.timelapsePct = 100; rerenderPalateTab(); }
        }, 'Viewing Sample Palate Lens — Tap to Return to Live History')
      ));
    }

    /* 1. HOISTED ABOVE THE FOLD: Scoped 5-Axis Taste Radar + Persistent Time-Lapse Bar */
    function resolveScopedRadarRows(sourceRows, atlasList) {
      let cur = Array.isArray(sourceRows) ? sourceRows.filter(Boolean) : [];
      const labels = [];

      const path = Array.isArray(palateState.drillPath) ? palateState.drillPath : [];
      let hasOriginInPath = false;
      path.forEach(function (step) {
        if (!step || !step.level) return;
        if (step.label) labels.push(step.label);
        if (step.level === 'origin') {
          hasOriginInPath = true;
          cur = cur.filter(function (r) { return matchOriginKey(r.origin || r.country, atlasList) === step.key; });
        } else if (step.level === 'region') {
          const wantReg = String(step.key || '').toLowerCase();
          cur = cur.filter(function (r) {
            const rawR = String(r.region || r.subregion || r.farm || '').trim();
            const regName = (!rawR || isUnknownTrait(rawR)) ? 'General Region' : rawR;
            return regName.toLowerCase() === wantReg;
          });
        } else if (step.level === 'process') {
          cur = cur.filter(function (r) {
            if (step.key === 'unknown') return isUnknownTrait(r.process);
            return !isUnknownTrait(r.process) && normKey(r.process) === step.key;
          });
        } else if (step.level === 'roast') {
          cur = cur.filter(function (r) {
            if (step.key === 'unknown') return isUnknownTrait(r.roast_level || r.roast);
            return !isUnknownTrait(r.roast_level || r.roast) && normKey(r.roast_level || r.roast) === step.key;
          });
        } else if (step.level === 'elevation') {
          cur = cur.filter(function (r) { return classifyElevationBand(r) === step.key; });
        } else if (step.level === 'varietal') {
          cur = cur.filter(function (r) { return !isUnknownTrait(r.varietal) && normKey(r.varietal) === step.key; });
        } else if (step.level === 'brewer') {
          const wantB = normKey(step.key || 'v60');
          cur = cur.filter(function (r) {
            const rMk = isUnknownTrait(r.brew_method) ? 'v60' : (normKey(r.brew_method) || 'v60');
            return rMk === wantB;
          });
        } else if (step.level === 'flavor') {
          const wantF = String(step.key || '').toLowerCase();
          cur = cur.filter(function (r) {
            const hay = [r.flavors_liked, r.words_flavor, r.bag_notes, r.general_notes].map(unneutPalate).join(' ');
            return wantF && wordBoundaryHas(hay, wantF);
          });
        }
      });

      if (palateState.selectedOriginKey && !hasOriginInPath) {
        const oMeta = (atlasList || []).find(function (o) { return o.key === palateState.selectedOriginKey; });
        labels.push(oMeta ? oMeta.name : palateState.selectedOriginKey);
        cur = cur.filter(function (r) { return matchOriginKey(r.origin || r.country, atlasList) === palateState.selectedOriginKey; });
      }

      if (palateState.selectedBeanCid) {
        const beanObj = (curBayes.coffees || []).find(function (c) { return c.cid === palateState.selectedBeanCid; });
        labels.push(beanObj ? (unneutPalate(beanObj.name) || 'Selected Bean') : 'Selected Bean');
        cur = cur.filter(function (r) {
          const rCid = r.coffee_id || (normKey(r.coffee_name) + '|' + normKey(r.roaster));
          return rCid === palateState.selectedBeanCid;
        });
      }

      return {
        rows: cur,
        isScoped: labels.length > 0,
        scopeLabel: labels.join(' \u00B7 ')
      };
    }

    const radarCard = domH('section', { class: 'bt-studio-card', id: 'bt-palate-radar-card' });
    const radarContentHost = domH('div', { class: 'bt-radar-content-host' });
    const timelapseFooterRow = domH('div', { class: 'bt-lab-chip-row', style: 'margin-top:8px;align-items:center' });
    const timelapseRangeSpan = domH('span', {
      class: 'bt-tc-badge is-soft num-tab',
      id: 'bt-timelapse-range-label',
      text: formatTimelapseRangeLabel(curSlicedRows, allRows)
    });
    const radarXraySpan = domH('span', { class: 'bt-studio-xray-line num-tab', id: 'bt-radar-xray-line' });

    const axisDescs = {
      acidity: 'Top high-brightness & sparkling-acidity cups from this view:',
      sweetness: 'Your sweetest, richest-finish cups in this view:',
      body: 'Fullest-bodied, syrupy & creamy mouthfeel cups in this view:',
      roast: 'Cups aligned with your preferred roast depth in this view:',
      funk: 'Wild/fermented vs. clean washed clarity cups driving this axis:'
    };

    function paintRadarCard() {
      radarContentHost.textContent = '';
      const scope = resolveScopedRadarRows(curSlicedRows, atlas);
      const hasScopedMatch = scope.isScoped && scope.rows.length > 0;
      const activeRows = hasScopedMatch ? scope.rows : curSlicedRows;
      const activeBayes = hasScopedMatch ? computeBayesianPalate(scope.rows, { scoped: true }) : curBayes;

      const radarSvg = CK.svgEl('svg', {
        viewBox: '0 0 380 296',
        class: 'bt-chart-svg bt-radar-svg',
        'aria-label': hasScopedMatch
          ? ('5-Axis Personal Taste Profile filtered by ' + scope.scopeLabel)
          : '5-Axis Bayesian Palate DNA Radar with Confidence Band'
      });

      [1, 2, 3, 4, 5].forEach(function (ring) {
        const pts = [0, 1, 2, 3, 4].map(function (i) { return radarPolarPt(i, ring, false).map(function (v) { return v.toFixed(1); }).join(','); }).join(' ');
        radarSvg.appendChild(CK.svgEl('polygon', { points: pts, class: 'bt-radar-ring' }));
      });

      activeBayes.axes.forEach(function (ax, idx) {
        const tip = radarPolarPt(idx, 5.0, false);
        /* Unclamped label radius (5.82) sits cleanly outside the outer 5.0 pentagon vertices */
        const lblPt = radarPolarPt(idx, 5.82, true);
        radarSvg.appendChild(CK.svgEl('line', { x1: RADAR_CX, y1: RADAR_CY, x2: tip[0].toFixed(1), y2: tip[1].toFixed(1), class: 'bt-radar-spoke' }));
        const t = CK.svgEl('text', {
          x: lblPt[0].toFixed(1),
          y: lblPt[1].toFixed(1),
          'text-anchor': 'middle',
          'dominant-baseline': 'central',
          class: 'bt-radar-lbl'
        });
        t.textContent = ax.label + ' (' + ax.val.toFixed(1) + ')';
        radarSvg.appendChild(t);
      });

      /* When scoped, render subtle dashed All-Time Baseline silhouette behind active scoped polygon */
      if (hasScopedMatch) {
        const basePts = curBayes.axes.map(function (ax, i) { return radarPolarPt(i, ax.val, false); });
        radarSvg.appendChild(CK.svgEl('polygon', {
          points: basePts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '),
          class: 'bt-radar-baseline-poly'
        }));
      }

      const outerPts = activeBayes.axes.map(function (ax, i) { return radarPolarPt(i, Math.min(5, ax.val + activeBayes.ciHalf), false); });
      const innerPts = activeBayes.axes.map(function (ax, i) { return radarPolarPt(i, Math.max(0.8, ax.val - activeBayes.ciHalf), false); }).reverse();
      const bandD = 'M ' + outerPts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L ') + ' Z ' +
        'M ' + innerPts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L ') + ' Z';
      radarSvg.appendChild(CK.svgEl('path', { d: bandD, 'fill-rule': 'evenodd', class: 'bt-radar-ci-band' }));

      const polyPts = activeBayes.axes.map(function (ax, i) { return radarPolarPt(i, ax.val, false); });
      radarSvg.appendChild(CK.svgEl('polygon', {
        points: polyPts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '),
        class: 'bt-radar-poly'
      }));
      polyPts.forEach(function (p) {
        radarSvg.appendChild(CK.svgEl('circle', { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: '4.8', class: 'bt-radar-dot' }));
      });

      const subLine = hasScopedMatch
        ? ('Filtered: ' + scope.scopeLabel + ' \u00B7 ' + activeBayes.totalRows + ' cup' + (activeBayes.totalRows === 1 ? '' : 's') + ' \u00B7 Avg ' + activeBayes.globalMean + '/5.0')
        : (scope.isScoped
          ? ('No logged cups in "' + scope.scopeLabel + '" yet \u2014 showing All-Time baseline (' + curBayes.totalRows + ' cups)')
          : (curBayes.uniqueCoffees + ' unique coffee(s) across ' + curBayes.totalRows + ' cup(s) \u00B7 Personal Average ' + curBayes.globalMean + '/5.0'));

      radarContentHost.appendChild(domH('div', { class: 'bt-lab-card-head' },
        domH('div', { class: 'bt-lab-title-group', style: 'min-width:0;flex:1' },
          ic('palate', { size: 22 }),
          domH('div', { style: 'min-width:0;flex:1' },
            domH('h3', { text: isScienceXray() ? '5-Axis Bayesian Palate DNA Radar' : '5-Axis Personal Taste Profile' }),
            domH('p', { class: 'bt-lab-sub', id: 'bt-radar-subtitle', text: subLine })
          )
        ),
        domH('button', {
          type: 'button',
          class: 'bt-lab-btn is-sm is-primary',
          onclick: function () { jumpToPalate('matcher'); }
        }, 'Will I Love This Bag? \u2192')
      ));

      if (scope.isScoped) {
        radarContentHost.appendChild(domH('div', { class: 'bt-radar-scope-bar', id: 'bt-radar-scope-bar' },
          domH('span', {
            class: 'bt-radar-scope-pill',
            text: 'Showing: ' + scope.scopeLabel + ' (' + scope.rows.length + ' cup' + (scope.rows.length === 1 ? '' : 's') + ')'
          }),
          domH('button', {
            type: 'button',
            id: 'bt-radar-clear-scope-btn',
            class: 'bt-radar-scope-clear',
            onclick: function () {
              palateState.drillPath = [];
              palateState.selectedOriginKey = '';
              palateState.selectedRoastZone = '';
              palateState.selectedRatingTier = '';
              palateState.selectedBeanCid = '';
              CK.haptic('tick');
              rerenderPalateTab();
            }
          }, 'Clear Scope \u00D7')
        ));
      }

      radarContentHost.appendChild(domH('div', { class: 'bt-chart-stage' }, radarSvg));

      if (hasScopedMatch) {
        radarContentHost.appendChild(domH('div', { class: 'bt-radar-legend', 'aria-label': 'Radar polygon legend' },
          domH('span', { style: 'display:inline-flex;align-items:center;gap:5px' },
            domH('span', { class: 'bt-radar-leg-swatch is-scoped', 'aria-hidden': 'true' }),
            domH('span', { text: 'Filtered: ' + scope.scopeLabel })
          ),
          domH('span', { style: 'display:inline-flex;align-items:center;gap:5px' },
            domH('span', { class: 'bt-radar-leg-swatch is-baseline', 'aria-hidden': 'true' }),
            domH('span', { text: 'All-Time Baseline' })
          )
        ));
      }

      const axisDrillHost = domH('div', { id: 'bt-radar-axis-drawer-host' });
      function getAxisTopRows(axKey) {
        return activeRows.slice().sort(function (a, b) {
          const scoreFor = function (r) {
            const base = rowStar(r);
            if (axKey === 'acidity') {
              const acV = extractTrait1to5(r, 'acidity_intensity', 'acidity');
              const rNumA = roastNumericValue(r.roast_level || r.roast);
              return (acV != null ? acV : (rNumA != null ? clamp(5.2 - rNumA * 0.65, 1.5, 4.6, 3.0) : 3.0)) * 2 + base;
            }
            if (axKey === 'sweetness') {
              const swV = extractTrait1to5(r, 'sweetness_intensity', 'sweetness');
              return (swV != null ? swV : 3.4) * 2 + base;
            }
            if (axKey === 'body') {
              const bdV = extractTrait1to5(r, 'body_intensity', 'body');
              return (bdV != null ? bdV : (/natural|espresso|press|wet-?hull/.test(String((r.process || '') + ' ' + (r.brew_method || '')).toLowerCase()) ? 3.9 : 2.7)) * 2 + base;
            }
            if (axKey === 'roast') {
              const rNum = roastNumericValue(r.roast_level || r.roast);
              const useR = rNum != null ? rNum : 2.8;
              return (5 - Math.abs(useR - activeBayes.axes[3].val)) * 2 + base;
            }
            const fNum = processFunkValue(r.process);
            const useF = fNum != null ? fNum : 2.8;
            return (5 - Math.abs(useF - activeBayes.axes[4].val)) * 2 + base;
          };
          return scoreFor(b) - scoreFor(a);
        });
      }
      function paintAxisDrawer() {
        axisDrillHost.textContent = '';
        const k = palateState.selectedRadarAxis;
        if (!k) return;
        const axObj = activeBayes.axes.find(function (x) { return x.key === k; });
        if (!axObj) return;
        const matched = getAxisTopRows(k).slice(0, 5);
        axisDrillHost.appendChild(domH('div', { class: 'bt-drill-drawer', id: 'bt-radar-axis-drawer' },
          domH('div', { class: 'bt-drill-drawer-head' },
            domH('div', { style: 'min-width:0;flex:1' },
              domH('div', { class: 'bt-pref-tile-lbl', text: 'TASTE AXIS DRILL-DOWN' + (hasScopedMatch ? (' \u00B7 ' + scope.scopeLabel.toUpperCase()) : '') }),
              domH('strong', { class: 'bt-drill-drawer-title', text: axObj.label + ' (' + axObj.val.toFixed(1) + ' / 5.0)' })
            ),
            domH('button', {
              type: 'button',
              class: 'bt-drill-close-btn bt-lab-btn is-sm',
              onclick: function () { palateState.selectedRadarAxis = ''; CK.haptic('tick'); paintRadarCard(); }
            }, 'Close \u00D7')
          ),
          domH('p', { class: 'bt-lab-hint', style: 'margin:0', text: axisDescs[k] || '' }),
          matched.length > 0 ? domH('div', { class: 'bt-drill-cup-list' },
            matched.map(function (r) { return buildDrillCupCard(r); })
          ) : domH('p', { class: 'bt-lab-hint', style: 'margin:0', text: 'Log cups with ratings to explore your top ' + axObj.label + ' matches.' })
        ));
      }

      radarContentHost.appendChild(domH('div', { class: 'bt-rating-tier-bar', role: 'group', 'aria-label': 'Drill into any taste axis' },
        activeBayes.axes.map(function (ax) {
          const active = palateState.selectedRadarAxis === ax.key;
          return domH('button', {
            type: 'button',
            class: 'bt-rating-tier-btn bt-lab-chip bt-drillable' + (active ? ' is-active' : ''),
            'aria-pressed': String(active),
            'data-radar-axis': ax.key,
            onclick: function () {
              palateState.selectedRadarAxis = active ? '' : ax.key;
              CK.haptic('tick');
              paintRadarCard();
            }
          }, ax.label + ' (' + ax.val.toFixed(1) + ')');
        })
      ));
      paintAxisDrawer();
      radarContentHost.appendChild(axisDrillHost);

      timelapseRangeSpan.textContent = formatTimelapseRangeLabel(curSlicedRows, allRows);
      if (isScienceXray()) {
        radarXraySpan.hidden = false;
        radarXraySpan.textContent = hasScopedMatch
          ? ('Scoped n=' + activeBayes.totalRows + ' \u00B7 Shrinkage = 1.00 (raw scoped) \u00B7 80% CI = \u00B1' + activeBayes.ciHalf.toFixed(2))
          : ('Empirical Bayes shrinkage = ' + activeBayes.shrink.toFixed(2) + ' \u00B7 80% CI = \u00B1' + activeBayes.ciHalf.toFixed(2));
      } else {
        radarXraySpan.hidden = true;
      }
    }

    /* Persistent Time-Lapse Footer: never destroyed during drag; hidden/disabled when N < 2 */
    if (allRows.length >= 2) {
      const timelapsePill = CK.vernierPill({
        label: 'Palate Evolution Time-Lapse',
        value: palateState.timelapsePct,
        min: 20,
        max: 100,
        step: 5,
        unit: '% history',
        compact: true,
        onChange: function (v) {
          palateState.timelapsePct = v;
          curSlicedRows = getHistoryRows(v);
          curBayes = computeBayesianPalate(curSlicedRows);
          paintRadarCard();
        },
        onCommit: function (v) {
          palateState.timelapsePct = v;
          rerenderPalateTab();
        }
      });
      timelapseFooterRow.appendChild(timelapsePill);
      timelapseFooterRow.appendChild(timelapseRangeSpan);
    } else if (allRows.length === 1) {
      timelapseFooterRow.appendChild(domH('span', {
        class: 'bt-lab-hint',
        style: 'margin:0',
        text: 'First 1 of 1 cup — log 2+ cups to unlock Palate Evolution Time-Lapse.'
      }));
    }
    timelapseFooterRow.appendChild(radarXraySpan);

    radarCard.appendChild(radarContentHost);
    radarCard.appendChild(timelapseFooterRow);
    wrap.appendChild(radarCard);

    /* 2. Compact Top Coffee Preferences Summary Grid */
    const topRoastHit = curBayes.roastBoard[0] || null;
    const topProcHit = curBayes.processBoard[0] || null;
    const topOrigHit = curBayes.originBoard[0] || null;
    const topOrigMeta = topOrigHit ? (atlas.find(function (o) { return o.key === topOrigHit.key; }) || { name: topOrigHit.key }) : null;
    const topElevHit = curBayes.elevationBoard[0] || null;
    const topElevDef = topElevHit ? (ELEVATION_BAND_DEFS[topElevHit.key] || { label: topElevHit.key }) : null;
    const topFlavors3 = curBayes.topFlavorNotes.slice(0, 3).map(function (f) { return f.word; });
    const topBrewerHit = curBayes.brewerBoard[0] || null;

    const prefTiles = [
      {
        lbl: 'Favorite Roast',
        val: topRoastHit ? formatRoastHuman(topRoastHit.key) : 'Awaiting Known Roast',
        sub: topRoastHit ? (topRoastHit.mean.toFixed(2) + '/5.0 · ' + topRoastHit.n + ' bag' + (topRoastHit.n === 1 ? '' : 's')) : 'Pick roast on Step 1',
        board: 'roasts',
        drillStep: topRoastHit ? { level: 'roast', key: topRoastHit.key, label: formatRoastHuman(topRoastHit.key) } : null
      },
      {
        lbl: 'Favorite Process',
        val: topProcHit ? formatProcessHuman(topProcHit.key) : 'Awaiting Known Process',
        sub: topProcHit ? (topProcHit.mean.toFixed(2) + '/5.0 · ' + topProcHit.n + ' bag' + (topProcHit.n === 1 ? '' : 's')) : 'Washed, Natural, Honey...',
        board: 'processes',
        drillStep: topProcHit ? { level: 'process', key: topProcHit.key, label: formatProcessHuman(topProcHit.key) } : null
      },
      {
        lbl: 'Top Origin',
        val: topOrigMeta ? topOrigMeta.name : 'Explore 52 Origins',
        sub: topOrigHit ? (topOrigHit.mean.toFixed(2) + '/5.0 · ' + topOrigHit.n + ' bag' + (topOrigHit.n === 1 ? '' : 's')) : 'Tap World Belt map below',
        board: 'origins',
        drillStep: topOrigHit ? { level: 'origin', key: topOrigHit.key, label: topOrigMeta ? topOrigMeta.name : topOrigHit.key } : null
      },
      {
        lbl: 'Sweet-Spot Elevation',
        val: topElevDef ? topElevDef.label : 'Awaiting Elevation',
        sub: topElevHit ? (topElevHit.mean.toFixed(2) + '/5.0 · ' + topElevHit.n + ' bag' + (topElevHit.n === 1 ? '' : 's')) : '<1,300m · 1,300\u20131,750m · 1,750m+',
        board: 'elevations',
        drillStep: topElevHit ? { level: 'elevation', key: topElevHit.key, label: topElevDef ? topElevDef.label : topElevHit.key } : null
      },
      {
        lbl: 'Top Flavor Notes',
        val: topFlavors3.length ? topFlavors3.join(', ') : 'Awaiting Flavor Tags',
        sub: topFlavors3.length ? (curBayes.topFlavorNotes[0].mean.toFixed(2) + '/5.0 top note match') : 'Tag notes on Step 1 or Step 5',
        board: 'flavors',
        drillStep: topFlavors3.length ? { level: 'flavor', key: topFlavors3[0], label: topFlavors3[0] } : null
      },
      {
        lbl: 'Favorite Brewer',
        val: topBrewerHit ? formatMethodHuman(topBrewerHit.key) : 'Ready on Counter',
        sub: topBrewerHit ? (topBrewerHit.mean.toFixed(2) + '/5.0 · ' + topBrewerHit.n + ' bag' + (topBrewerHit.n === 1 ? '' : 's')) : 'Log your first brew',
        board: 'brewers',
        drillStep: topBrewerHit ? { level: 'brewer', key: topBrewerHit.key, label: formatMethodHuman(topBrewerHit.key) } : null
      }
    ];

    const prefsCard = domH('section', { class: 'bt-studio-card bt-prefs-summary-card', id: 'bt-top-preferences-card' },
      domH('div', { class: 'bt-lab-card-head' },
        domH('div', { class: 'bt-lab-title-group', style: 'min-width:0;flex:1 1 210px' },
          ic('spark-star', { size: 22 }),
          domH('div', { style: 'min-width:0;flex:1 1 160px' },
            domH('h3', { text: 'Your Top Coffee Preferences' }),
            domH('p', {
              class: 'bt-lab-sub',
              text: 'Tap any tile to drill straight into matching logged cups — "Don\'t Know" fields are skipped automatically.'
            })
          )
        )
      ),
      domH('div', { class: 'bt-prefs-summary-grid' },
        prefTiles.map(function (pt) {
          return domH('button', {
            type: 'button',
            class: 'bt-pref-summary-tile bt-drillable',
            onclick: function () {
              palateState.expandedBoard = pt.board;
              if (pt.board !== 'origins') palateState.selectedOriginKey = '';
              palateState.drillPath = pt.drillStep ? [pt.drillStep] : [];
              CK.haptic('tick');
              rerenderPalateTab();
              setTimeout(function () {
                const bdEl = document.getElementById('bt-palate-eb-boards');
                if (bdEl && typeof bdEl.scrollIntoView === 'function') {
                  try { bdEl.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (_) {}
                }
              }, 30);
            }
          },
            domH('span', { class: 'bt-pref-tile-lbl', text: pt.lbl }),
            domH('strong', { class: 'bt-pref-tile-val', text: pt.val }),
            domH('span', { class: 'bt-pref-tile-sub num-tab', text: pt.sub }),
            domH('span', { class: 'bt-drill-cue', text: 'Drill \u2192' })
          );
        })
      ),
      curBayes.unknownFilteredCount > 0 ? domH('div', { class: 'bt-prefs-hygiene-note' },
        ic('check-seal', { size: 15 }),
        domH('span', {
          text: '"Don\'t Know" Preference Shield Active: ' + curBayes.unknownFilteredCount + ' bag(s) with unlisted origin, roast, process, or elevation kept your cup rating while skipping unknown fields cleanly.'
        })
      ) : null
    );
    wrap.appendChild(prefsCard);

    /* 3. Real Cartographic Coffee Belt World Map (52 Origins + Closest-Pin Hit-Testing + Collision-Safe Labels) */
    const mapCard = domH('section', { class: 'bt-studio-card', id: 'bt-palate-world-map' });
    const byOriginScore = new Map();
    curBayes.originBoard.forEach(function (b) { byOriginScore.set(b.key, b); });
    const tastedCount = byOriginScore.size;

    const activeZoom = MAP_ZOOM_REGIONS.find(function (z) { return z.key === palateState.mapZoom; }) || MAP_ZOOM_REGIONS[0];
    const isZoomed = activeZoom.key !== 'world';
    const vbParts = activeZoom.vb.split(/\s+/).map(Number);
    const vbX = vbParts[0] || 0, vbY = vbParts[1] || 0, vbW = vbParts[2] || 664, vbH = vbParts[3] || 256;

    const mapSvg = CK.svgEl('svg', {
      viewBox: activeZoom.vb,
      class: 'bt-chart-svg bt-world-map-svg',
      'aria-label': 'Equatorial Coffee Belt World Map across ' + atlas.length + ' Coffee Origins'
    });

    /* Ocean Backdrop */
    mapSvg.appendChild(CK.svgEl('rect', { x: '0', y: '0', width: '664', height: '256', rx: '14', class: 'bt-map-ocean' }));

    /* Tropic of Cancer (+23.5 N), Equator (0), Tropic of Capricorn (-23.5 S) Coffee Belt Band */
    const yCancer = projLatY(23.5);
    const yEquator = projLatY(0);
    const yCapricorn = projLatY(-23.5);
    mapSvg.appendChild(CK.svgEl('rect', {
      x: '0',
      y: yCancer.toFixed(1),
      width: '664',
      height: (yCapricorn - yCancer).toFixed(1),
      class: 'bt-map-belt-band'
    }));
    mapSvg.appendChild(CK.svgEl('line', { x1: '0', y1: yCancer.toFixed(1), x2: '664', y2: yCancer.toFixed(1), class: 'bt-map-tropic' }));
    mapSvg.appendChild(CK.svgEl('line', { x1: '0', y1: yEquator.toFixed(1), x2: '664', y2: yEquator.toFixed(1), class: 'bt-map-equator' }));
    mapSvg.appendChild(CK.svgEl('line', { x1: '0', y1: yCapricorn.toFixed(1), x2: '664', y2: yCapricorn.toFixed(1), class: 'bt-map-tropic' }));

    if (!isZoomed) {
      const lblCan = CK.svgEl('text', { x: '10', y: (yCancer - 3).toFixed(1), class: 'bt-map-lat-lbl' });
      lblCan.textContent = '23.5\u00B0N Tropic of Cancer';
      mapSvg.appendChild(lblCan);
      const lblEq = CK.svgEl('text', { x: '10', y: (yEquator - 3).toFixed(1), class: 'bt-map-lat-lbl' });
      lblEq.textContent = '0\u00B0 Equator';
      mapSvg.appendChild(lblEq);
      const lblCap = CK.svgEl('text', { x: '10', y: (yCapricorn + 9).toFixed(1), class: 'bt-map-lat-lbl' });
      lblCap.textContent = '23.5\u00B0S Tropic of Capricorn';
      mapSvg.appendChild(lblCap);
    }

    /* Multi-Point Recognizable Continental & Island Coastlines */
    const landG = CK.svgEl('g', { class: 'bt-map-continents' });
    WORLD_COASTLINES_LONLAT.forEach(function (poly) {
      landG.appendChild(CK.svgEl('path', { d: polyLonLatToPath(poly, true), class: 'bt-map-land' }));
    });
    mapSvg.appendChild(landG);

    const mapInfoBox = domH('div', { class: 'bt-map-inspector-bar', id: 'bt-origin-passport-host' });
    function resetMapAndSelection() {
      palateState.mapZoom = 'world';
      palateState.selectedOriginKey = '';
      palateState.drillPath = [];
      CK.haptic('tick');
      rerenderPalateTab();
    }

    function selectOriginPin(orig, eb) {
      if (!orig) return;
      palateState.selectedOriginKey = orig.key;
      if (eb) {
        palateState.expandedBoard = 'origins';
        palateState.drillPath = [{ level: 'origin', key: orig.key, label: orig.name }];
      } else {
        palateState.drillPath = [];
      }
      CK.haptic('tick');
      rerenderPalateTab();
    }

    function paintSelectedOriginInfo(origObj) {
      mapInfoBox.textContent = '';
      if (!origObj) {
        mapInfoBox.appendChild(domH('div', { class: 'bt-passport-empty-prompt' },
          domH('p', {
            class: 'bt-lab-hint',
            text: 'Stamped ' + tastedCount + ' of ' + atlas.length + ' coffee origins on the Bean Belt. Tap any map pin or Quick Country Pill above to open its Origin Passport Card!'
          })
        ));
        return;
      }
      const eb = byOriginScore.get(origObj.key);
      const regionsTxt = origObj.sub && origObj.sub.length ? origObj.sub.slice(0, 4).join(' · ') : 'Highland Micro-Lots';
      const personalTxt = eb
        ? (eb.rawMean.toFixed(2) + ' / 5.0 avg (' + eb.n + ' bag' + (eb.n === 1 ? '' : 's') + ' · True ' + eb.mean.toFixed(2) + ')')
        : 'Unexplored — brew 1 bag to earn this stamp!';
      const origRawRows = [];
      if (eb && Array.isArray(eb.bags)) {
        eb.bags.forEach(function (bg) {
          (bg.cups || []).forEach(function (cp) { if (cp && cp.rawRow) origRawRows.push(cp.rawRow); });
        });
      }
      origRawRows.sort(function (a, b) { return rowStar(b) - rowStar(a); });
      const origStats = summarizeCupsStats(origRawRows);

      mapInfoBox.appendChild(domH('article', { class: 'bt-origin-passport-card', id: 'bt-origin-passport-card' },
        domH('div', { class: 'bt-passport-head' },
          domH('div', { class: 'bt-passport-title-wrap' },
            domH('span', { class: 'bt-forecast-kicker', text: 'ORIGIN PASSPORT · ' + origObj.zone.toUpperCase() }),
            domH('h4', { class: 'bt-passport-country', text: origObj.name }),
            domH('p', { class: 'bt-passport-terroir', text: origObj.grown || origObj.terroir })
          ),
          domH('button', {
            type: 'button',
            class: 'bt-lab-btn is-sm bt-passport-back-btn',
            onclick: resetMapAndSelection
          }, 'Close Passport \u00D7')
        ),
        domH('div', { class: 'bt-passport-grid' },
          domH('div', { class: 'bt-passport-tile' },
            domH('span', { class: 'bt-passport-lbl', text: 'Famed Regions & Cup Profile' }),
            domH('strong', { text: regionsTxt }),
            domH('span', { class: 'bt-passport-note', text: origObj.feel || origObj.short || origObj.notes })
          ),
          domH('div', { class: 'bt-passport-tile' },
            domH('span', { class: 'bt-passport-lbl', text: 'Typical Varietals' }),
            domH('strong', { text: origObj.varietals })
          ),
          domH('div', { class: 'bt-passport-tile' },
            domH('span', { class: 'bt-passport-lbl', text: 'Elevation & Harvest' }),
            domH('strong', { class: 'num-tab', text: origObj.elevation }),
            domH('span', { class: 'bt-passport-note', text: 'Main Harvest: ' + origObj.harvest })
          ),
          domH('div', { class: 'bt-passport-tile' },
            domH('span', { class: 'bt-passport-lbl', text: 'Your Personal Logged Average' }),
            domH('strong', { class: 'num-tab', text: personalTxt })
          )
        ),
        origRawRows.length > 0 ? domH('div', { class: 'bt-drill-drawer' },
          domH('div', { class: 'bt-drill-drawer-head' },
            domH('strong', { class: 'bt-drill-drawer-title', text: 'Your ' + origObj.name + ' Tasting Breakdown (' + origRawRows.length + ' cup' + (origRawRows.length === 1 ? '' : 's') + ')' })
          ),
          domH('div', { class: 'bt-drill-meta-row' },
            domH('span', { class: 'bt-tc-badge is-good num-tab', text: 'Avg ' + origStats.avgStar.toFixed(2) + '/5' }),
            origStats.avgSca > 0 ? domH('span', { class: 'bt-tc-badge is-sci num-tab', text: 'Avg ' + origStats.avgSca + ' SCA' }) : null,
            origStats.tdsN > 0 ? domH('span', { class: 'bt-tc-badge is-sci num-tab', text: 'Avg ' + origStats.avgTds + '% TDS' }) : null,
            origStats.eyN > 0 ? domH('span', { class: 'bt-tc-badge is-sci num-tab', text: 'Avg ' + origStats.avgEy + '% EY' }) : null,
            origStats.topNotes.length ? domH('span', { class: 'bt-tc-badge is-soft', text: 'Top Notes: ' + origStats.topNotes.slice(0, 3).join(', ') }) : null
          ),
          domH('div', { class: 'bt-drill-cup-list' },
            origRawRows.slice(0, 4).map(function (rr) { return buildDrillCupCard(rr); })
          )
        ) : null,
        domH('div', { class: 'bt-passport-actions' },
          domH('button', {
            type: 'button',
            class: 'bt-lab-btn is-sm is-primary',
            onclick: function () {
              palateState.scanner.origin = origObj.key;
              palateState.subSegment = 'matcher';
              const a = getApp();
              a.tabSegments = a.tabSegments || {};
              a.tabSegments.palate = 'scanner';
              if (typeof sh().setTabSegment === 'function') sh().setTabSegment('palate', 'scanner');
              else saveDraftSoon();
              CK.haptic('snap');
              rerenderPalateTab();
            }
          }, 'Test Bag Match \u2192'),
          domH('button', {
            type: 'button',
            class: 'bt-lab-btn is-sm',
            onclick: function () {
              if (typeof window.__btApplyAndNavigateWithBack === 'function') {
                window.__btApplyAndNavigateWithBack(function (a) {
                  a.coffee.origin = origObj.name;
                  if (!a.coffee.name || a.coffee.name === 'Shared Coffee') {
                    a.coffee.name = origObj.name + ' Specialty Lot';
                  }
                  a.tabSegments = a.tabSegments || {};
                  a.tabSegments.palate = 'dna';
                }, {
                  targetStep: 'brew',
                  returnRoute: 'palate',
                  toast: 'Loaded ' + origObj.name + ' into your active coffee & recipe!'
                });
              } else {
                const a = getApp();
                a.coffee = a.coffee || {};
                a.coffee.origin = origObj.name;
                saveDraftSoon();
                if (typeof sh().go === 'function') sh().go('brew');
              }
            }
          }, 'Use Origin in My Brew \u2192')
        )
      ));
    }

    /* Plot all 52 Origins with Closest-Pin SVG Hit-Testing + Zoomed Label Collision Avoidance + Keyboard Access */
    const pinsG = CK.svgEl('g', { class: 'bt-map-pins' });
    const labelsG = CK.svgEl('g', { class: 'bt-map-labels', style: 'pointer-events:none' });
    const pinRecords = [];
    const zoomLabelCandidates = [];

    atlas.forEach(function (orig) {
      const eb = byOriginScore.get(orig.key);
      const earned = !!eb;
      const isFavorite = eb && eb.mean >= curBayes.globalMean + 0.12;
      const cx = projLonX(orig.lon);
      const cy = projLatY(orig.lat);
      const rVis = isZoomed ? (earned ? 3.8 : 2.5) : (earned ? 5.6 : 3.3);
      const isSelected = palateState.selectedOriginKey === orig.key;

      pinRecords.push({ orig: orig, eb: eb, cx: cx, cy: cy, rVis: rVis });

      const pinG = CK.svgEl('g', {
        transform: 'translate(' + cx.toFixed(1) + ',' + cy.toFixed(1) + ')',
        class: 'bt-map-pin-g',
        'data-origin-key': orig.key,
        tabindex: '0',
        role: 'button',
        'aria-label': orig.name + (eb ? (' (' + eb.mean.toFixed(2) + '/5.0 affinity)') : ' (Unexplored)')
      });
      pinG.appendChild(CK.svgEl('circle', {
        r: rVis.toFixed(1),
        class: 'bt-map-pin' + (isFavorite ? ' is-fav' : (earned ? ' is-stamped' : '')) +
          (isSelected ? ' is-selected' : '')
      }));

      /* Synthetic zero-coordinate clicks & keyboard Enter/Space activate the focused pin directly */
      pinG.addEventListener('click', function (ev) {
        if (!ev || (!ev.clientX && !ev.clientY)) {
          if (ev && ev.stopPropagation) ev.stopPropagation();
          selectOriginPin(orig, eb);
        }
      });
      bindActivateKey(pinG, function () { selectOriginPin(orig, eb); });
      pinsG.appendChild(pinG);

      if (isZoomed && (earned || isSelected)) {
        if (cx >= vbX - 6 && cx <= vbX + vbW + 6 && cy >= vbY - 6 && cy <= vbY + vbH + 6) {
          zoomLabelCandidates.push({ orig: orig, cx: cx, cy: cy, rVis: rVis, priority: isSelected ? 2 : 1 });
        }
      }
    });

    /* Voronoi-style closest-pin pointer hit-testing on <svg> so dense neighbors never swallow each other's taps */
    mapSvg.style.cursor = 'pointer';
    mapSvg.addEventListener('click', function (ev) {
      if (!ev || (!ev.clientX && !ev.clientY)) return;
      const pt = CK && typeof CK.mapClientToSurface === 'function'
        ? CK.mapClientToSurface(mapSvg, ev.clientX, ev.clientY)
        : null;
      if (!pt) return;
      const rect = pt.rect || { width: vbW, height: vbH };
      const uniScale = Math.min((rect.width || vbW) / vbW, (rect.height || vbH) / vbH);
      const maxDistSvg = Math.max(isZoomed ? 12 : 18, 28 / Math.max(0.25, uniScale));
      let best = null;
      let bestDist = Infinity;
      for (let i = 0; i < pinRecords.length; i++) {
        const pr = pinRecords[i];
        if (pr.cx < vbX - 10 || pr.cx > vbX + vbW + 10 || pr.cy < vbY - 10 || pr.cy > vbY + vbH + 10) continue;
        const d = Math.hypot(pt.ux - pr.cx, pt.uy - pr.cy);
        if (d <= maxDistSvg && d < bestDist) {
          bestDist = d;
          best = pr;
        }
      }
      if (best) selectOriginPin(best.orig, best.eb);
    });

    /* Zoomed label collision avoidance across 12 candidate offsets per pin */
    if (zoomLabelCandidates.length) {
      zoomLabelCandidates.sort(function (a, b) { return b.priority - a.priority || a.cy - b.cy; });
      const placedBoxes = [];
      const overlapsAny = function (box) {
        for (let i = 0; i < placedBoxes.length; i++) {
          const b = placedBoxes[i];
          if (!(box.x1 < b.x0 || box.x0 > b.x1 || box.y1 < b.y0 || box.y0 > b.y1)) return true;
        }
        return false;
      };
      const offsetCandidates = [
        [0, -8.5, 'middle'],
        [0, 10.5, 'middle'],
        [7.5, 2.5, 'start'],
        [-7.5, 2.5, 'end'],
        [6.5, -7.5, 'start'],
        [-6.5, -7.5, 'end'],
        [6.5, 11.5, 'start'],
        [-6.5, 11.5, 'end'],
        [0, -17.5, 'middle'],
        [0, 19.5, 'middle'],
        [14, -12, 'start'],
        [-14, 15, 'end']
      ];
      zoomLabelCandidates.forEach(function (cand) {
        const txt = cand.orig.name;
        const estW = Math.max(18, txt.length * 3.8 + 4);
        const estH = 8.2;
        let chosen = null;
        for (let ci = 0; ci < offsetCandidates.length; ci++) {
          const off = offsetCandidates[ci];
          const lx = cand.cx + off[0];
          const ly = cand.cy + off[1];
          const anchor = off[2];
          const x0 = anchor === 'start' ? lx : (anchor === 'end' ? lx - estW : lx - estW * 0.5);
          const x1 = x0 + estW;
          const y0 = ly - estH + 1.5;
          const y1 = ly + 1.5;
          const inside = x0 >= vbX + 1.5 && x1 <= vbX + vbW - 1.5 && y0 >= vbY + 1.5 && y1 <= vbY + vbH - 1.5;
          const box = { x0: x0 - 1, y0: y0 - 0.8, x1: x1 + 1, y1: y1 + 0.8 };
          if (inside && !overlapsAny(box)) {
            chosen = { lx: lx, ly: ly, anchor: anchor, box: box, dist: Math.hypot(off[0], off[1]) };
            break;
          }
        }
        if (!chosen) {
          const lx = clamp(cand.cx, vbX + estW * 0.5 + 2, vbX + vbW - estW * 0.5 - 2, cand.cx);
          const ly = clamp(cand.cy - cand.rVis - 3.5, vbY + estH + 2, vbY + vbH - 2, cand.cy - 6);
          chosen = {
            lx: lx,
            ly: ly,
            anchor: 'middle',
            box: { x0: lx - estW * 0.5, y0: ly - estH, x1: lx + estW * 0.5, y1: ly + 1.5 },
            dist: Math.hypot(lx - cand.cx, ly - cand.cy)
          };
        }
        placedBoxes.push(chosen.box);
        if (chosen.dist > 11.5) {
          labelsG.appendChild(CK.svgEl('line', {
            x1: cand.cx.toFixed(1),
            y1: cand.cy.toFixed(1),
            x2: chosen.lx.toFixed(1),
            y2: (chosen.ly - 2).toFixed(1),
            stroke: 'var(--ink-muted, #6E5849)',
            'stroke-width': '0.6',
            'stroke-opacity': '0.55'
          }));
        }
        const plbl = CK.svgEl('text', {
          x: chosen.lx.toFixed(1),
          y: chosen.ly.toFixed(1),
          'text-anchor': chosen.anchor,
          class: 'bt-map-pin-lbl'
        });
        plbl.textContent = txt;
        labelsG.appendChild(plbl);
      });
    }

    mapSvg.appendChild(pinsG);
    mapSvg.appendChild(labelsG);

    const selOriginObj = atlas.find(function (o) { return o.key === palateState.selectedOriginKey; }) || null;
    paintSelectedOriginInfo(selOriginObj);

    const zoomBtns = MAP_ZOOM_REGIONS.map(function (zr) {
      return domH('button', {
        type: 'button',
        class: 'bt-lab-chip' + (palateState.mapZoom === zr.key ? ' is-active' : ''),
        'aria-pressed': String(palateState.mapZoom === zr.key),
        onclick: function () {
          palateState.mapZoom = zr.key;
          CK.haptic('tick');
          rerenderPalateTab();
        }
      }, zr.label);
    });

    const quickCountryKeys = ['ethiopia', 'colombia', 'kenya', 'brazil', 'panama', 'guatemala', 'costarica', 'rwanda', 'peru', 'indonesia', 'yemen', 'hawaii'];
    const quickCountryPills = quickCountryKeys.map(function (qk) {
      const meta = atlas.find(function (o) { return o.key === qk; });
      if (!meta) return null;
      const isSel = palateState.selectedOriginKey === qk;
      return domH('button', {
        type: 'button',
        class: 'bt-lab-chip bt-quick-country-pill' + (isSel ? ' is-active' : ''),
        'aria-pressed': String(isSel),
        onclick: function () {
          selectOriginPin(meta, byOriginScore.get(qk));
        }
      }, meta.name);
    });

    const all52Select = domH('select', {
      class: 'bt-lab-select bt-map-origin-select',
      'aria-label': 'Jump to any of the 52 coffee-producing countries',
      onchange: function () {
        const val = all52Select.value;
        if (!val) {
          palateState.selectedOriginKey = '';
          palateState.drillPath = [];
          CK.haptic('tick');
          rerenderPalateTab();
          return;
        }
        const picked = atlas.find(function (o) { return o.key === val; });
        selectOriginPin(picked, byOriginScore.get(val));
      }
    },
      domH('option', { value: '', text: 'All ' + atlas.length + ' Countries A\u2013Z...' }),
      atlas.slice().sort(function (a, b) { return a.name.localeCompare(b.name); }).map(function (o) {
        const opt = domH('option', { value: o.key, text: o.name });
        if (palateState.selectedOriginKey === o.key) opt.selected = true;
        return opt;
      })
    );

    const showResetZoomBtn = palateState.mapZoom !== 'world';

    mapCard.appendChild(domH('div', { class: 'bt-lab-card-head' },
      domH('div', { class: 'bt-lab-title-group' },
        ic('origin-globe', { size: 22 }),
        domH('div', null,
          domH('h3', { text: 'World Coffee Belt Terroir Passport (' + tastedCount + ' / ' + atlas.length + ' Origins)' }),
          domH('p', {
            class: 'bt-lab-sub',
            text: isScienceXray()
              ? '23.5\u00B0N to 23.5\u00B0S Bean Belt colored by Empirical-Bayes preference — zoom any continent or tap a pin'
              : '23.5\u00B0N to 23.5\u00B0S Coffee Belt colored by your personal ratings — tap any pin or country pill for its Passport Card'
          })
        )
      ),
      showResetZoomBtn ? domH('button', {
        type: 'button',
        class: 'bt-lab-btn is-sm bt-back-escape-btn',
        onclick: resetMapAndSelection
      }, '\u2190 Reset Zoom') : null
    ));
    mapCard.appendChild(domH('div', { class: 'bt-lab-chip-row' }, zoomBtns, all52Select));
    mapCard.appendChild(domH('div', { class: 'bt-lab-chip-row bt-quick-origins-row' },
      domH('span', { class: 'bt-lab-inline-lbl', text: 'Quick Passport:' }),
      quickCountryPills
    ));
    mapCard.appendChild(domH('div', { class: 'bt-chart-stage' }, mapSvg));
    mapCard.appendChild(mapInfoBox);
    wrap.appendChild(mapCard);

    /* 4. Empirical-Bayes LCB80 True Affinity & 4-Level Interactive Drill-In */
    const boardsCard = domH('section', { class: 'bt-studio-card', id: 'bt-palate-eb-boards', style: 'scroll-margin-top:76px' });
    const boardTabs = [
      { k: 'origins', lbl: 'Origin (' + tastedCount + '/' + atlas.length + ')' },
      { k: 'processes', lbl: 'Process' },
      { k: 'roasts', lbl: 'Roast' },
      { k: 'elevations', lbl: 'Elevation' },
      { k: 'varietals', lbl: 'Varietal' },
      { k: 'brewers', lbl: 'Brewer' },
      { k: 'flavors', lbl: 'Mix & Flavors' },
      { k: 'cafes', lbl: 'Coffee Street (Cafe vs Home)' }
    ];

    const breadcrumbRow = domH('div', { class: 'bt-drill-breadcrumbs' });
    const boardHost = domH('div', { class: 'bt-trait-board-body' });

    function renderBreadcrumbs() {
      breadcrumbRow.textContent = '';
      if (!palateState.drillPath.length) {
        breadcrumbRow.hidden = true;
        return;
      }
      breadcrumbRow.hidden = false;
      breadcrumbRow.appendChild(domH('button', {
        type: 'button',
        class: 'bt-lab-chip',
        onclick: function () {
          palateState.drillPath = [];
          CK.haptic('tick');
          paintActiveBoard();
        }
      }, '\u2190 All ' + palateState.expandedBoard.charAt(0).toUpperCase() + palateState.expandedBoard.slice(1)));

      palateState.drillPath.forEach(function (crumb, idx) {
        breadcrumbRow.appendChild(domH('span', { class: 'bt-crumb-sep', text: '/' }));
        breadcrumbRow.appendChild(domH('button', {
          type: 'button',
          class: 'bt-lab-chip' + (idx === palateState.drillPath.length - 1 ? ' is-active' : ''),
          onclick: function () {
            palateState.drillPath = palateState.drillPath.slice(0, idx + 1);
            CK.haptic('tick');
            paintActiveBoard();
          }
        }, crumb.label));
      });
    }

    function appendConcreteCupsDrawer(hostEl, titleTxt, cupRows) {
      const cleanRows = (cupRows || []).filter(Boolean).sort(function (a, b) { return rowStar(b) - rowStar(a); });
      if (!cleanRows.length) return;
      const st = summarizeCupsStats(cleanRows);
      hostEl.appendChild(domH('div', { class: 'bt-drill-drawer', id: 'bt-board-drill-drawer' },
        domH('div', { class: 'bt-drill-drawer-head' },
          domH('div', { style: 'min-width:0;flex:1' },
            domH('div', { class: 'bt-pref-tile-lbl', text: 'MATCHING LOGGED CUPS & TASTING BREAKDOWN' }),
            domH('strong', { class: 'bt-drill-drawer-title', text: titleTxt + ' (' + cleanRows.length + ' cup' + (cleanRows.length === 1 ? '' : 's') + ')' })
          )
        ),
        domH('div', { class: 'bt-drill-meta-row' },
          domH('span', { class: 'bt-tc-badge is-good num-tab', text: 'Avg ' + st.avgStar.toFixed(2) + '/5' }),
          st.avgSca > 0 ? domH('span', { class: 'bt-tc-badge is-sci num-tab', text: 'Avg ' + st.avgSca + ' SCA' }) : null,
          st.tdsN > 0 ? domH('span', { class: 'bt-tc-badge is-sci num-tab', text: 'Avg ' + st.avgTds + '% TDS' }) : null,
          st.eyN > 0 ? domH('span', { class: 'bt-tc-badge is-sci num-tab', text: 'Avg ' + st.avgEy + '% EY' }) : null,
          st.avgTempC > 0 ? domH('span', { class: 'bt-tc-badge is-soft num-tab', text: 'Avg ' + st.avgTempC + '\u00B0C' }) : null,
          st.topNotes.length ? domH('span', { class: 'bt-tc-badge is-soft', text: 'Notes: ' + st.topNotes.slice(0, 3).join(', ') }) : null
        ),
        domH('div', { class: 'bt-drill-cup-list' },
          cleanRows.slice(0, 12).map(function (rr) { return buildDrillCupCard(rr); })
        )
      ));
    }

    function paintDrillDownView() {
      const path = palateState.drillPath;
      const rootType = palateState.expandedBoard;
      const crumbTitle = path.map(function (p) { return p.label; }).join(' / ');

      /* Special Flavor-Note Direct Drill-In */
      if (path.length === 1 && path[0].level === 'flavor') {
        const targetWord = String(path[0].key || '').toLowerCase();
        const noteRows = curSlicedRows.filter(function (r) {
          const hay = [r.flavors_liked, r.words_flavor, r.bag_notes, r.general_notes].map(unneutPalate).join(' ');
          return targetWord && wordBoundaryHas(hay, targetWord);
        });
        if (!noteRows.length) {
          boardHost.appendChild(domH('p', { class: 'bt-lab-hint', text: 'No logged cups matched "' + path[0].label + '" in this history slice.' }));
          return;
        }
        appendConcreteCupsDrawer(boardHost, 'Cups Tasting of "' + path[0].label + '"', noteRows);
        return;
      }

      let matchingBags = curBayes.coffees.slice();

      /* Filter bags down the drill path */
      path.forEach(function (step) {
        if (step.level === 'origin') matchingBags = matchingBags.filter(function (c) { return c.origin === step.key; });
        else if (step.level === 'region') matchingBags = matchingBags.filter(function (c) { return c.region === step.key; });
        else if (step.level === 'process') {
          matchingBags = matchingBags.filter(function (c) {
            return step.key === 'unknown' ? !c.process : c.process === step.key;
          });
        } else if (step.level === 'roast') {
          matchingBags = matchingBags.filter(function (c) {
            return step.key === 'unknown' ? !c.roast : c.roast === step.key;
          });
        } else if (step.level === 'elevation') matchingBags = matchingBags.filter(function (c) { return c.elevationBand === step.key; });
        else if (step.level === 'varietal') matchingBags = matchingBags.filter(function (c) { return c.varietal === step.key; });
        else if (step.level === 'brewer') {
          const wantB = normKey(step.key || 'v60');
          matchingBags = matchingBags.filter(function (c) {
            return c.cups.some(function (cp) {
              const cpMk = isUnknownTrait(cp.method) ? 'v60' : (normKey(cp.method) || 'v60');
              return cpMk === wantB;
            });
          });
        }
      });

      if (!matchingBags.length) {
        boardHost.appendChild(domH('p', { class: 'bt-lab-hint', text: 'No logged brews in this slice yet — brew a bag from this terroir to populate all 4 drill-down levels!' }));
        return;
      }

      /* Collect concrete logged raw rows for this exact slice (respecting brewer filter if present) */
      const brewerStep = path.find(function (s) { return s.level === 'brewer'; });
      const matchingRawRows = [];
      matchingBags.forEach(function (bag) {
        (bag.cups || []).forEach(function (cp) {
          if (!cp || !cp.rawRow) return;
          if (brewerStep) {
            const cpMk = isUnknownTrait(cp.method) ? 'v60' : (normKey(cp.method) || 'v60');
            if (cpMk !== normKey(brewerStep.key || 'v60')) return;
          }
          matchingRawRows.push(cp.rawRow);
        });
      });

      /* Level 1 -> Group by Sub-Region (if started from Origin) or Origin (if started from Process/Roast/Varietal/Brewer) */
      if (path.length === 1) {
        const nextField = rootType === 'origins' ? 'region' : 'origin';
        const groups = new Map();
        matchingBags.forEach(function (b) {
          const gk = b[nextField] || 'General';
          const origMeta = nextField === 'origin' ? atlas.find(function (o) { return o.key === gk; }) : null;
          const lbl = origMeta ? origMeta.name : (gk === 'blend' ? 'Multi-Origin Blend' : (gk.charAt(0).toUpperCase() + gk.slice(1)));
          const cur = groups.get(gk) || { key: gk, label: lbl, vals: [] };
          cur.vals.push(b.dialScore);
          groups.set(gk, cur);
        });
        Array.from(groups.values()).forEach(function (g) {
          const n = g.vals.length;
          const rawM = g.vals.reduce(function (a, v) { return a + v; }, 0) / n;
          const postM = (n * rawM + 2.0 * curBayes.globalMean) / (n + 2.0);
          boardHost.appendChild(domH('button', {
            type: 'button',
            class: 'bt-trait-row is-drillable bt-drillable',
            onclick: function () {
              palateState.drillPath.push({ level: nextField, key: g.key, label: g.label });
              CK.haptic('tick');
              paintActiveBoard();
            }
          },
            domH('span', { class: 'bt-trait-name', text: g.label + ' \u2192' }),
            domH('span', { class: 'bt-trait-stat num-tab', text: 'True ' + postM.toFixed(2) + ' · Raw ' + rawM.toFixed(2) + ' (n=' + n + ')' })
          ));
        });
        appendConcreteCupsDrawer(boardHost, crumbTitle, matchingRawRows);
        return;
      }

      /* Level 2 -> Skip process when rootType === 'processes' (drill into roast instead to avoid Process->Process loop!) */
      if (path.length === 2) {
        const alreadyHasProcess = rootType === 'processes' || path.some(function (s) { return s.level === 'process'; });
        const alreadyHasRoast = rootType === 'roasts' || path.some(function (s) { return s.level === 'roast'; });
        const lvl2Field = alreadyHasProcess ? (alreadyHasRoast ? '' : 'roast') : 'process';

        if (lvl2Field) {
          const pGroups = new Map();
          matchingBags.forEach(function (b) {
            const pk = b[lvl2Field] || 'unknown';
            const lbl = lvl2Field === 'roast' ? formatRoastHuman(pk) : formatProcessHuman(pk);
            const cur = pGroups.get(pk) || { key: pk, label: lbl, vals: [] };
            cur.vals.push(b.dialScore);
            pGroups.set(pk, cur);
          });
          Array.from(pGroups.values()).forEach(function (pg) {
            const n = pg.vals.length;
            const rawM = pg.vals.reduce(function (a, v) { return a + v; }, 0) / n;
            boardHost.appendChild(domH('button', {
              type: 'button',
              class: 'bt-trait-row is-drillable bt-drillable',
              onclick: function () {
                palateState.drillPath.push({ level: lvl2Field, key: pg.key, label: pg.label });
                CK.haptic('tick');
                paintActiveBoard();
              }
            },
              domH('span', { class: 'bt-trait-name', text: pg.label + (lvl2Field === 'roast' ? ' Roast' : ' Process') + ' — View Cups \u2192' }),
              domH('span', { class: 'bt-trait-stat num-tab', text: rawM.toFixed(2) + '/5.0 (' + n + ' bag' + (n === 1 ? '' : 's') + ')' })
            ));
          });
        }
        appendConcreteCupsDrawer(boardHost, crumbTitle, matchingRawRows);
        return;
      }

      /* Level 3 (4th Tier) -> Full Concrete Logged Cups Drawer with 1-Tap Inspect & Brew */
      appendConcreteCupsDrawer(boardHost, crumbTitle, matchingRawRows);
    }

    function appendTraitRowEl(row, drillLevelName, pctPersonalMean) {
      const pctMean = clamp(((row.mean - 1) / 4) * 100, 4, 98, 70);
      const pctRaw = clamp(((row.rawMean - 1) / 4) * 100, 4, 98, 70);
      const pctCiLo = clamp(((row.ciLo - 1) / 4) * 100, 2, 98, pctMean);
      const pctCiHi = clamp(((row.ciHi - 1) / 4) * 100, pctCiLo, 99, pctMean);
      const ciWidth = Math.max(2, pctCiHi - pctCiLo);
      const rowTag = row.n > 0 ? 'button' : 'div';
      const rowProps = {
        class: 'bt-trait-row' + (row.unexplored ? ' is-muted' : ' is-drillable')
      };
      if (row.n > 0) {
        rowProps.type = 'button';
        rowProps.onclick = function () {
          palateState.drillPath = [{ level: drillLevelName, key: row.key, label: row.label }];
          CK.haptic('tick');
          paintActiveBoard();
        };
      }

      const lcbDisp = Number.isFinite(row.lcb80) ? row.lcb80.toFixed(2) : row.ciLo.toFixed(2);
      const statTxt = row.n > 0
        ? (isScienceXray()
          ? ('LCB80 ' + lcbDisp + ' · True ' + row.mean.toFixed(2) + ' (Raw ' + row.rawMean.toFixed(2) + ')')
          : ('True ' + row.mean.toFixed(2) + ' (Raw ' + row.rawMean.toFixed(2) + ')'))
        : 'Unexplored';

      boardHost.appendChild(domH(rowTag, rowProps,
        domH('div', { class: 'bt-trait-meta' },
          domH('span', { class: 'bt-trait-name', text: row.label + (row.n > 0 ? ' \u2192' : '') }),
          row.n > 0 ? domH('span', { class: 'bt-trait-conf num-tab', text: 'n=' + row.n + ' bag' + (row.n === 1 ? '' : 's') + ' · ' + row.confPct + '% conf' }) : null
        ),
        domH('div', { class: 'bt-trait-bar-track' },
          domH('div', { class: 'bt-trait-mean-line', style: 'left:' + pctPersonalMean.toFixed(1) + '%' }),
          row.n > 0 ? domH('div', {
            class: 'bt-trait-ci-band',
            style: 'left:' + pctCiLo.toFixed(1) + '%;width:' + ciWidth.toFixed(1) + '%',
            title: '80% Credible Interval: ' + row.ciLo.toFixed(2) + '\u2013' + row.ciHi.toFixed(2) + ' (LCB80 ' + lcbDisp + ')'
          }) : null,
          row.n > 0 ? domH('div', { class: 'bt-trait-raw-tick', style: 'left:' + pctRaw.toFixed(1) + '%', title: 'Raw Mean ' + row.rawMean }) : null,
          domH('div', { class: 'bt-trait-dot', style: 'left:' + pctMean.toFixed(1) + '%' })
        ),
        domH('span', { class: 'bt-trait-stat num-tab', text: statTxt })
      ));
    }

    function paintActiveBoard() {
      boardHost.textContent = '';
      renderBreadcrumbs();
      if (typeof syncBackLevelBtn === 'function') syncBackLevelBtn();
      paintRadarCard();
      if (palateState.drillPath.length > 0) {
        paintDrillDownView();
        return;
      }

      const bk = palateState.expandedBoard;
      if (bk === 'flavors') {
        const likedArr = Array.from(curBayes.likedNotes.values()).sort(function (a, b) { return b.n - a.n; });
        if (!likedArr.length) {
          boardHost.appendChild(domH('p', { class: 'bt-lab-hint', text: 'Tag tasting notes after your brews to reveal your Mix & Match flavor polarization.' }));
          return;
        }
        likedArr.slice(0, 16).forEach(function (item) {
          const dis = curBayes.dislikedNotes.get(item.word) || 0;
          const rawMean = item.sumStar / item.n;
          const conf = Math.round((item.n / (item.n + 2.5)) * 100);
          const shrMean = (item.n * rawMean + 2.5 * curBayes.globalMean) / (item.n + 2.5);
          boardHost.appendChild(domH('button', {
            type: 'button',
            class: 'bt-trait-row is-drillable bt-drillable',
            onclick: function () {
              palateState.drillPath = [{ level: 'flavor', key: item.word, label: item.word }];
              CK.haptic('tick');
              paintActiveBoard();
            }
          },
            domH('span', { class: 'bt-trait-name', text: item.word + ' \u2192' }),
            domH('span', { class: 'bt-trait-stat num-tab', text: 'True ' + shrMean.toFixed(2) + ' (Raw ' + rawMean.toFixed(2) + ', +' + item.n + (dis ? '/-' + dis : '') + ', ' + conf + '% conf)' })
          ));
        });
        return;
      }
      if (bk === 'cafes') {
        const shopsObj = window.BTStorage && typeof window.BTStorage.getShops === 'function' ? window.BTStorage.getShops() : null;
        const drinks = shopsObj && shopsObj.store && Array.isArray(shopsObj.store.drinks) ? shopsObj.store.drinks : [];
        const shopMean = drinks.length
          ? (drinks.reduce(function (s, d) { return s + (parseFloat(d.stars || d.rating) || 4.0); }, 0) / drinks.length).toFixed(2)
          : '--';
        boardHost.appendChild(domH('div', { class: 'bt-lab-metric-strip' },
          domH('div', { class: 'bt-lab-kpi' },
            domH('span', { text: 'Home Brews' }),
            domH('strong', { class: 'num-tab', text: curBayes.totalRows + ' cups · ' + curBayes.globalMean + '/5.0' })
          ),
          domH('div', { class: 'bt-lab-kpi' },
            domH('span', { text: 'Coffee Street Visits' }),
            domH('strong', { class: 'num-tab', text: drinks.length + ' cafes · ' + shopMean + '/5.0' })
          )
        ));
        if (drinks.length > 0) {
          boardHost.appendChild(domH('div', { class: 'bt-drill-cup-list', style: 'margin-top:8px' },
            drinks.slice(0, 6).map(function (dr) {
              const stVal = parseFloat(dr.stars || dr.rating) || 0;
              return domH('article', { class: 'bt-drill-cup-card' },
                domH('div', { class: 'bt-drill-cup-head' },
                  domH('div', { style: 'min-width:0;flex:1' },
                    domH('div', { class: 'bt-drill-cup-sub', text: [dr.shopName || dr.shop || 'Coffee Shop', dr.date || ''].filter(Boolean).join(' \u00B7 ') }),
                    domH('strong', { class: 'bt-drill-cup-title', text: dr.drinkLabel || dr.kind || 'Cafe Drink' })
                  ),
                  stVal > 0 ? domH('span', { class: 'bt-tc-badge is-good num-tab', text: stVal.toFixed(1) + '/5' }) : null
                ),
                dr.notes ? domH('div', { class: 'bt-drill-cup-sub', text: dr.notes }) : null
              );
            })
          ));
        } else {
          boardHost.appendChild(domH('p', { class: 'bt-lab-hint', style: 'margin-top:8px', text: 'Log cafe drinks in Cellar \u2192 Coffee Shop to compare your home brews side-by-side against local cafes!' }));
        }
        return;
      }

      let list = [];
      let drillLevelName = 'origin';
      if (bk === 'origins') {
        drillLevelName = 'origin';
        list = atlas.map(function (o) {
          const hit = curBayes.originBoard.find(function (b) { return b.key === o.key; });
          return hit
            ? { key: o.key, label: o.name, n: hit.n, rawMean: hit.rawMean, mean: hit.mean, confPct: hit.confPct, ciLo: hit.ciLo, ciHi: hit.ciHi, lcb80: hit.lcb80 }
            : { key: o.key, label: o.name, n: 0, rawMean: curBayes.globalMean, mean: curBayes.globalMean, confPct: 0, ciLo: 0, ciHi: 0, lcb80: -99, unexplored: true };
        }).sort(function (a, b) {
          return (b.n > 0 ? 1 : 0) - (a.n > 0 ? 1 : 0) || (b.lcb80 - a.lcb80) || (b.mean - a.mean) || a.label.localeCompare(b.label);
        });
      } else if (bk === 'processes') {
        drillLevelName = 'process';
        list = curBayes.processBoard.map(function (b) { return Object.assign({ label: formatProcessHuman(b.key) }, b); });
      } else if (bk === 'roasts') {
        drillLevelName = 'roast';
        list = curBayes.roastBoard.map(function (b) { return Object.assign({ label: formatRoastHuman(b.key) }, b); });
      } else if (bk === 'elevations') {
        drillLevelName = 'elevation';
        list = ['high', 'mid', 'low'].map(function (ek) {
          const def = ELEVATION_BAND_DEFS[ek];
          const hit = curBayes.elevationBoard.find(function (b) { return b.key === ek; });
          return hit
            ? Object.assign({ label: def.label }, hit)
            : { key: ek, label: def.label, n: 0, rawMean: curBayes.globalMean, mean: curBayes.globalMean, confPct: 0, ciLo: 0, ciHi: 0, lcb80: -99, unexplored: true };
        }).sort(function (a, b) { return (b.n > 0 ? 1 : 0) - (a.n > 0 ? 1 : 0) || (b.lcb80 - a.lcb80) || (b.mean - a.mean); });
      } else if (bk === 'varietals') {
        drillLevelName = 'varietal';
        list = curBayes.varietalBoard.map(function (b) { return Object.assign({ label: b.key.charAt(0).toUpperCase() + b.key.slice(1) }, b); });
      } else if (bk === 'brewers') {
        drillLevelName = 'brewer';
        list = curBayes.brewerBoard.map(function (b) { return Object.assign({ label: b.label || formatMethodHuman(b.key) }, b); });
      }

      if (!list.length) {
        boardHost.appendChild(domH('p', { class: 'bt-lab-hint', text: 'Log brews across origins, processes, roasts, varietals, and brewers to unlock confidence-weighted personal rankings.' }));
        return;
      }

      const pctPersonalMean = clamp(((curBayes.globalMean - 1) / 4) * 100, 5, 95, 73);

      /* Collapse unexplored origins behind a clean toggle to prevent 52-row vertical bloat */
      if (bk === 'origins') {
        const explored = list.filter(function (r) { return r.n > 0; });
        const unexplored = list.filter(function (r) { return r.n === 0; });
        explored.forEach(function (row) { appendTraitRowEl(row, drillLevelName, pctPersonalMean); });
        if (!explored.length) {
          boardHost.appendChild(domH('p', { class: 'bt-lab-hint', text: 'No origins stamped yet — brew your first coffee or expand all ' + unexplored.length + ' origins below.' }));
        }
        if (unexplored.length > 0) {
          boardHost.appendChild(domH('button', {
            type: 'button',
            id: 'bt-toggle-unexplored-origins-btn',
            class: 'bt-lab-btn is-sm',
            style: 'align-self:flex-start;margin-top:4px',
            'aria-expanded': String(!!palateState.showUnexploredOrigins),
            onclick: function () {
              palateState.showUnexploredOrigins = !palateState.showUnexploredOrigins;
              CK.haptic('tick');
              paintActiveBoard();
            }
          }, palateState.showUnexploredOrigins
            ? ('Hide ' + unexplored.length + ' Unexplored Origins')
            : ('Show ' + unexplored.length + ' Unexplored Origins')));
          if (palateState.showUnexploredOrigins) {
            unexplored.forEach(function (row) { appendTraitRowEl(row, drillLevelName, pctPersonalMean); });
          }
        }
        return;
      }

      list.slice(0, 52).forEach(function (row) {
        appendTraitRowEl(row, drillLevelName, pctPersonalMean);
      });
    }

    const tabBtns = boardTabs.map(function (bt) {
      return domH('button', {
        type: 'button',
        class: 'bt-lab-chip' + (palateState.expandedBoard === bt.k ? ' is-active' : ''),
        'aria-pressed': String(palateState.expandedBoard === bt.k),
        onclick: function () {
          palateState.expandedBoard = bt.k;
          palateState.drillPath = [];
          /* Clear stale country scope when switching to a non-origin Trait Board */
          if (bt.k !== 'origins') palateState.selectedOriginKey = '';
          tabBtns.forEach(function (b, bi) {
            const on = boardTabs[bi].k === bt.k;
            b.classList.toggle('is-active', on);
            b.setAttribute('aria-pressed', String(on));
          });
          CK.haptic('tick');
          paintActiveBoard();
        }
      }, bt.lbl);
    });

    const backLevelBtn = domH('button', {
      type: 'button',
      class: 'bt-lab-btn is-sm bt-back-escape-btn',
      hidden: !(palateState.drillPath.length > 0),
      onclick: function () {
        palateState.drillPath.pop();
        CK.haptic('tick');
        paintActiveBoard();
      }
    }, '\u2190 Back One Level');
    function syncBackLevelBtn() {
      backLevelBtn.hidden = !(palateState.drillPath.length > 0);
    }

    boardsCard.appendChild(domH('div', { class: 'bt-lab-card-head' },
      domH('div', { class: 'bt-lab-title-group' },
        ic('search-filter', { size: 20 }),
        domH('div', null,
          domH('h3', {
            text: isScienceXray()
              ? 'Empirical-Bayes LCB80 Affinity & 4-Level Drill-In'
              : 'Your Favorite Coffee Traits & 4-Level Explorer'
          }),
          domH('p', {
            class: 'bt-lab-sub',
            text: isScienceXray()
              ? 'Ranked by 80% Lower Credible Bound (LCB80) with [ciLo, ciHi] credible bands — tap any row to drill down'
              : 'Confidence-weighted rankings with credible score bands — tap any row to explore matching coffees & cups'
          })
        )
      ),
      backLevelBtn
    ));
    boardsCard.appendChild(domH('div', { class: 'bt-lab-chip-row' }, tabBtns));
    boardsCard.appendChild(breadcrumbRow);
    boardsCard.appendChild(boardHost);

    paintActiveBoard();
    wrap.appendChild(boardsCard);

    /* 5. Interactive Palate Targets & Recipe Bias + Per-Coffee Scorecard Leaderboard */
    wrap.appendChild(buildPalatePreferenceTargetsCard(curSlicedRows));
    wrap.appendChild(buildPerCoffeeScorecardLeaderboard(curBayes));

    /* Compact Quick-Links Footer replacing redundant full-card Gear / Rating / Roast duplicates */
    function openPalateSheet(sheetKey, titleTxt) {
      CK.haptic('tick');
      const shell = sh();
      if (shell.BTSheet && typeof shell.BTSheet.open === 'function') {
        shell.BTSheet.open(sheetKey, {}, { detent: 'full', title: titleTxt });
      } else if (typeof shell.openSheet === 'function') {
        shell.openSheet(sheetKey, {}, { detent: 'full', title: titleTxt });
      }
    }
    wrap.appendChild(domH('div', { class: 'bt-lab-chip-row', style: 'padding:4px 0 6px' },
      domH('button', {
        type: 'button',
        class: 'bt-lab-btn is-sm',
        onclick: function () { openPalateSheet('workflow-tools', 'My Gear & Setup'); }
      }, ic('sliders', { size: 14 }), domH('span', { text: 'My Gear & Setup' })),
      domH('button', {
        type: 'button',
        class: 'bt-lab-btn is-sm',
        onclick: function () { openPalateSheet('ble-devices', 'Bluetooth Scales, R2, Omni & Smart Gear'); }
      }, ic('ble-wave', { size: 14 }), domH('span', { text: 'Pair Bluetooth Gear' })),
      domH('button', {
        type: 'button',
        class: 'bt-lab-btn is-sm',
        onclick: function () { jumpToJournalWithFilter('all'); }
      }, ic('spark-star', { size: 14 }), domH('span', { text: 'Rating Filters & Golden Recipes in Cellar \u2192' }))
    ));

    return wrap;
  }

  /* ==========================================================================
   * SEGMENT 2: "Will I Love This Bag?" Smart Bag Buyer's Guide & Store Scanner
   *   - Absolute 3.8/5 neutral anchor, N=0 confidence cap <=30%, knownSignals=0 guard
   *   - Unit-qualified elevation, context-aware roast/process, debounced in-place updates
   *   - Canonical PRICES_KEY schema + Brew Studio navigation on Buy CTA
   * ========================================================================== */
  function parseScannerBagText(rawText, atlas) {
    const out = { isJson: false };
    const text = String(rawText || '').trim();
    if (!text) return out;
    const list = Array.isArray(atlas) && atlas.length ? atlas : getFullOriginAtlas();

    /* 1. Guard & parse JSON (AI scan output or product JSON) without letting raw JSON become coffee_name */
    const looksJson = /^\s*[\{\[]/.test(text) || (text.indexOf('{') >= 0 && text.indexOf('}') > text.indexOf('{') && /"\w+"\s*:/.test(text));
    if (looksJson) {
      out.isJson = true;
      let parsedObj = null;
      const scanParser = typeof parseScanReplyV6 === 'function'
        ? parseScanReplyV6
        : (window.BTCoffeeEntry && typeof window.BTCoffeeEntry.parseScanReplyV6 === 'function' ? window.BTCoffeeEntry.parseScanReplyV6 : null);
      if (scanParser) {
        try {
          const parsed = scanParser(text);
          if (parsed && parsed.ok !== false) parsedObj = parsed.fields || parsed.data || parsed;
        } catch (_) {}
      }
      if (!parsedObj) {
        try {
          const rawJson = JSON.parse(text);
          if (rawJson && typeof rawJson === 'object' && !Array.isArray(rawJson)) {
            parsedObj = rawJson.fields || rawJson.data || rawJson.coffee || rawJson;
          }
        } catch (_) {}
      }
      if (parsedObj && typeof parsedObj === 'object') {
        if (parsedObj.coffee_name || parsedObj.name) out.coffeeName = String(parsedObj.coffee_name || parsedObj.name).trim();
        if (parsedObj.roaster) out.roaster = String(parsedObj.roaster).trim();
        if (parsedObj.origin) {
          if (isUnknownTrait(parsedObj.origin)) out.origin = 'unknown';
          else {
            const mo = matchOriginKey(parsedObj.origin, list);
            if (mo) out.origin = mo === 'blend' ? 'unknown' : mo;
          }
        }
        if (parsedObj.process) out.process = isUnknownTrait(parsedObj.process) ? 'unknown' : normKey(parsedObj.process);
        if (parsedObj.roast_level || parsedObj.roast) {
          const rRaw = parsedObj.roast_level || parsedObj.roast;
          out.roast = isUnknownTrait(rRaw) ? 'unknown' : normKey(rRaw);
        }
        if (parsedObj.elevation_m || parsedObj.elevation) {
          const eb = classifyElevationBand(parsedObj.elevation_m || parsedObj.elevation);
          if (eb) out.elevation = eb;
        }
        if (parsedObj.bag_notes || parsedObj.notes || parsedObj.tasting_notes) {
          const nRaw = parsedObj.bag_notes || parsedObj.notes || parsedObj.tasting_notes;
          const nArr = Array.isArray(nRaw)
            ? nRaw.map(function (x) { return String(x || '').trim(); }).filter(Boolean)
            : String(nRaw).split(/[,;|/]+/).map(function (s) { return s.trim(); }).filter(Boolean);
          if (nArr.length) out.notes = nArr;
        }
        if (Number.isFinite(parseFloat(parsedObj.price)) && parseFloat(parsedObj.price) > 0) out.price = parseFloat(parsedObj.price);
        if (Number.isFinite(parseFloat(parsedObj.bag_weight_g || parsedObj.weight_g)) && parseFloat(parsedObj.bag_weight_g || parsedObj.weight_g) > 0) {
          out.weightG = parseFloat(parsedObj.bag_weight_g || parsedObj.weight_g);
        }
      }
      return out;
    }

    /* 2. Free-text shelf label parsing */
    const matchedOrig = matchOriginKey(text, list);
    if (matchedOrig) {
      out.origin = matchedOrig === 'blend' ? 'unknown' : matchedOrig;
    }

    /* Context-aware Process parsing (avoids "Honeycrisp Apple" or bare note "Honey" false positives) */
    const low = stripAccentsLower(text);
    if (/\b(?:wet[\s-]?hulled|giling\s+basah|semi[\s-]?washed)\b/i.test(low)) {
      out.process = 'wet-hulled';
    } else if (/\b(?:anaerobic|carbonic(?:\s+maceration)?|co[\s-]?ferment(?:ed)?|thermal\s+shock|koji)\b/i.test(low)) {
      out.process = 'anaerobic';
    } else if (/\b(?:(?:white|yellow|red|black|gold)\s+honey|honey\s+process(?:ed)?|process(?:ed)?\s*[:\-]\s*honey|pulped\s+natural|pulp\s+natural|miel\s+(?:blanca|amarilla|roja|negra))\b/i.test(low)) {
      out.process = 'honey';
    } else if (
      /\b(?:natural\s+process(?:ed)?|dry\s+process(?:ed)?|process(?:ed)?\s*[:\-]\s*natural|unwashed)\b/i.test(low) ||
      (/\bnatural\b/i.test(low) && !/\bnatural\s+(?:flavor|flavour|aroma|sweetness|sugars?|oils?|acids?|notes?)\b/i.test(low))
    ) {
      out.process = 'natural';
    } else if (/\b(?:fully\s+washed|double\s+washed|wet\s+process(?:ed)?|washed)\b/i.test(low)) {
      out.process = 'washed';
    }

    /* Context-aware Roast parsing: strip flavor-note adjectives so "Dark Chocolate" never triggers Dark Roast */
    const roastScanTxt = low
      .replace(/\b(?:dark|milk|white|bittersweet)\s+(?:choc(?:olate)?|cocoa|cacao|berry|berries|cherry|fruit|plum|sugar|caramel|rum|raisin|fig)\b/gi, ' ')
      .replace(/\b(?:light|medium|full|heavy)\s+(?:body|bodied|acidity|citrus|tea|floral|sweetness|mouthfeel)\b/gi, ' ');
    if (/\b(?:ultra[\s-]?light|nordic(?:\s+roast)?|cinnamon\s+roast)\b/i.test(roastScanTxt)) {
      out.roast = 'ultra-light';
    } else if (/\b(?:medium[\s-]?light|med[\s-]?light|light[\s-]?medium|city\s+roast)\b/i.test(roastScanTxt)) {
      out.roast = 'medium-light';
    } else if (/\b(?:medium[\s-]?dark|med[\s-]?dark|full\s+city\+?|vienna\s+roast)\b/i.test(roastScanTxt)) {
      out.roast = 'medium-dark';
    } else if (/\b(?:dark\s+roast|roast(?:\s*level)?\s*[:\-]\s*dark|french\s+roast|italian\s+roast|espresso\s+roast)\b/i.test(roastScanTxt)) {
      out.roast = 'dark';
    } else if (/\b(?:medium\s+roast|roast(?:\s*level)?\s*[:\-]\s*medium|omni\s+roast)\b/i.test(roastScanTxt)) {
      out.roast = 'medium';
    } else if (/\b(?:light\s+roast|roast(?:\s*level)?\s*[:\-]\s*light|filter\s+roast)\b/i.test(roastScanTxt)) {
      out.roast = 'light';
    }

    /* Explicit unit-qualified elevation only (so "250g" and "2025" never trigger elevation) */
    const autoElev = classifyElevationBand(text, { strictUnits: true });
    if (autoElev) out.elevation = autoElev;

    /* Optional weight / price extraction from label text */
    const wtMatch = text.match(/\b(\d{2,4})\s*(?:g|grams?)\b/i);
    if (wtMatch) {
      const wg = parseFloat(wtMatch[1]);
      if (Number.isFinite(wg) && wg >= 50 && wg <= 5000) out.weightG = wg;
    }
    const prMatch = text.match(/\$\s*(\d+(?:\.\d{1,2})?)/);
    if (prMatch) {
      const pr = parseFloat(prMatch[1]);
      if (Number.isFinite(pr) && pr > 0 && pr <= 500) out.price = pr;
    }

    return out;
  }

  function matchFlavorNoteAffinityFor(noteWord, bayes) {
    const low = String(noteWord || '').trim().toLowerCase();
    if (!low) return { exactHit: null, disliked: false, familyKind: 'neutral' };
    let exactHit = null;
    let disliked = false;
    if (bayes && bayes.likedNotes && typeof bayes.likedNotes.forEach === 'function') {
      bayes.likedNotes.forEach(function (val, k) {
        const kl = String(k || '').toLowerCase();
        if (kl === low || wordBoundaryHas(kl, low) || wordBoundaryHas(low, kl)) {
          if (!exactHit || val.n > exactHit.n) exactHit = val;
        }
      });
    }
    if (bayes && bayes.dislikedNotes && typeof bayes.dislikedNotes.forEach === 'function') {
      bayes.dislikedNotes.forEach(function (cnt, k) {
        const kl = String(k || '').toLowerCase();
        if (cnt > 0 && (kl === low || wordBoundaryHas(kl, low) || wordBoundaryHas(low, kl))) disliked = true;
      });
    }
    let familyKind = 'sweet';
    if (/jasmine|bergamot|rose|blossom|hibiscus|floral|tea|earl|peach|berry|currant|lemon|lime|grapefruit|orange|pineapple|mango|apple|cherry|plum/i.test(low)) {
      familyKind = 'bright';
    } else if (/choc|cocoa|cacao|hazel|almond|nut|walnut|pecan|smok|roast|tobacco|cedar/i.test(low)) {
      familyKind = 'comfort';
    }
    return { exactHit: exactHit, disliked: disliked, familyKind: familyKind };
  }

  function computeBagMatchScoreFor(sc, bayes, atlas) {
    sc = sc || {};
    bayes = bayes || { uniqueCoffees: 0, globalMean: 3.95, axes: [], originBoard: [], processBoard: [], roastBoard: [], elevationBoard: [], likedNotes: new Map(), dislikedNotes: new Map() };
    atlas = Array.isArray(atlas) && atlas.length ? atlas : getFullOriginAtlas();

    const ABS_NEUTRAL = 3.8;
    const totalSignals = 5;
    let rawDelta = 0;
    let knownSignals = 0;
    const reasons = [];
    const uniqueCoffeesN = Number.isFinite(bayes.uniqueCoffees) ? bayes.uniqueCoffees : 0;
    const safeAxisVal = function (idx, fb) {
      const ax = Array.isArray(bayes.axes) ? bayes.axes[idx] : null;
      return (ax && Number.isFinite(ax.val)) ? ax.val : fb;
    };
    const absTraitPosterior = function (hit) {
      const n = hit && hit.n > 0 ? hit.n : 0;
      const raw = hit && Number.isFinite(hit.rawMean) ? hit.rawMean : (hit && Number.isFinite(hit.mean) ? hit.mean : ABS_NEUTRAL);
      return (n * raw + 1.25 * ABS_NEUTRAL) / (n + 1.25);
    };

    /* 1. Origin */
    const origKeyCanon = canonicalizeOriginKey(sc.origin);
    const origUnknown = !sc.origin || sc.origin === 'unknown' || origKeyCanon === 'blend' || isUnknownTrait(sc.origin);
    let origHit = null;
    if (origUnknown) {
      reasons.push('Origin (Don\'t Know / Blend): Unlisted on bag — skipped cleanly without guessing an origin.');
    } else {
      knownSignals++;
      origHit = (bayes.originBoard || []).find(function (b) { return b.key === origKeyCanon; });
      const origMeta = atlas.find(function (o) { return o.key === origKeyCanon; }) || { name: sc.origin || 'Origin' };
      if (origHit && origHit.n > 0) {
        const absPost = absTraitPosterior(origHit);
        rawDelta += (absPost - ABS_NEUTRAL) * 16;
        reasons.push('Origin (' + origMeta.name + '): ' + origHit.rawMean.toFixed(2) + '/5.0 across ' + origHit.n + ' bag' + (origHit.n === 1 ? '' : 's') + ' (vs. 3.80 neutral)');
      } else {
        rawDelta += 1.0;
        reasons.push('Origin (' + origMeta.name + '): Uncharted Horizon Stamp (unlocks a new World Belt country!)');
      }
    }

    /* 2. Process */
    const procUnknown = !sc.process || sc.process === 'unknown' || isUnknownTrait(sc.process);
    if (procUnknown) {
      reasons.push('Process (Don\'t Know): Not listed on bag — neutral weight used so score stays honest.');
    } else {
      knownSignals++;
      const procLow = normKey(sc.process);
      const procHit = (bayes.processBoard || []).find(function (b) { return b && b.key && (b.key === procLow || wordBoundaryHas(b.key, procLow) || wordBoundaryHas(procLow, b.key)); });
      if (procHit && procHit.n > 0) {
        const absPost = absTraitPosterior(procHit);
        rawDelta += (absPost - ABS_NEUTRAL) * 13;
        reasons.push('Process (' + formatProcessHuman(sc.process) + '): ' + procHit.rawMean.toFixed(2) + '/5.0 across ' + procHit.n + ' bag' + (procHit.n === 1 ? '' : 's') + ' (vs. 3.80 neutral)');
      } else {
        const funkAxis = safeAxisVal(4, 3.0);
        const bagFunk = processFunkValue(sc.process) || 2.8;
        const funkGap = Math.abs(funkAxis - bagFunk);
        rawDelta += (1.15 - funkGap) * 4.5;
        reasons.push('Process (' + formatProcessHuman(sc.process) + '): Aligned against your ' + (bagFunk >= 3.2 ? 'fruit-ferment' : 'clean-washed') + ' taste profile');
      }
    }

    /* 3. Roast Level */
    const roastUnknown = !sc.roast || sc.roast === 'unknown' || isUnknownTrait(sc.roast);
    if (roastUnknown) {
      reasons.push('Roast Level (Don\'t Know): Unlisted on bag — skipped without assuming Light or Dark.');
    } else {
      knownSignals++;
      const roastLow = normKey(sc.roast);
      const roastHit = (bayes.roastBoard || []).find(function (b) { return b && b.key === roastLow; });
      const roastAxis = safeAxisVal(3, 2.6);
      const bagRoastNum = roastNumericValue(sc.roast) || 2.8;
      const roastGap = Math.abs(roastAxis - bagRoastNum);
      if (roastHit && roastHit.n > 0) {
        const absPost = absTraitPosterior(roastHit);
        rawDelta += (absPost - ABS_NEUTRAL) * 12 + (absPost >= 3.6 ? (1.1 - roastGap) * 4 : 0);
        reasons.push('Roast (' + formatRoastHuman(sc.roast) + '): ' + roastHit.rawMean.toFixed(2) + '/5.0 personal roast score (' + roastHit.n + ' bag' + (roastHit.n === 1 ? '' : 's') + ')');
      } else {
        rawDelta += (1.15 - roastGap) * 7.5;
        reasons.push('Roast (' + formatRoastHuman(sc.roast) + '): ' + (roastGap < 0.85 ? 'Close match with your preferred roast depth' : 'Contrast stretch from your usual roast depth'));
      }
    }

    /* 4. Elevation / Altitude Band */
    const elevUnknown = !sc.elevation || sc.elevation === 'unknown' || isUnknownTrait(sc.elevation);
    if (elevUnknown) {
      reasons.push('Elevation (Don\'t Know): Altitude not on bag — excluded cleanly from prediction.');
    } else {
      knownSignals++;
      const elevDef = ELEVATION_BAND_DEFS[sc.elevation] || ELEVATION_BAND_DEFS.mid;
      const elevHit = (bayes.elevationBoard || []).find(function (b) { return b && b.key === sc.elevation; });
      if (elevHit && elevHit.n > 0) {
        const absPost = absTraitPosterior(elevHit);
        rawDelta += (absPost - ABS_NEUTRAL) * 11;
        reasons.push('Elevation (' + elevDef.label + '): ' + elevHit.rawMean.toFixed(2) + '/5.0 across ' + elevHit.n + ' bag' + (elevHit.n === 1 ? '' : 's'));
      } else {
        const acAxis = safeAxisVal(0, 3.5);
        const bdAxis = safeAxisVal(2, 3.3);
        const elevFit = sc.elevation === 'high' ? (acAxis - 3.2) * 3.5
          : sc.elevation === 'low' ? (bdAxis - 3.2) * 3.5
          : 1.5;
        rawDelta += elevFit;
        reasons.push('Elevation (' + elevDef.label + '): ' + elevDef.cue);
      }
    }

    /* 5. Flavor Notes */
    const rawNotesArr = Array.isArray(sc.notes)
      ? sc.notes
      : (typeof sc.notes === 'string' ? sc.notes.split(/[,;|/]+/).map(function (s) { return s.trim(); }).filter(Boolean) : []);
    const activeNotes = sc.notesUnsure ? [] : rawNotesArr.filter(function (n) { return !isUnknownTrait(n); });
    if (sc.notesUnsure || activeNotes.length === 0) {
      reasons.push('Flavor Notes (Don\'t Know / Unlisted): No printed flavor notes — scored from known roast, process, origin & elevation.');
    } else {
      knownSignals++;
      let noteBonus = 0;
      const matchedFavs = [];
      const matchedLowNotes = [];
      const matchedDislikes = [];
      const acAxis = safeAxisVal(0, 3.5);
      const bdAxis = safeAxisVal(2, 3.3);
      activeNotes.forEach(function (n) {
        const nf = matchFlavorNoteAffinityFor(n, bayes);
        if (nf.disliked) {
          noteBonus -= 10.0;
          matchedDislikes.push(n);
        } else if (nf.exactHit) {
          const avgN = nf.exactHit.sumStar / Math.max(1, nf.exactHit.n);
          const lift = (avgN - ABS_NEUTRAL) * 8.0;
          noteBonus += Number.isFinite(lift) ? clamp(lift, -12, 9, 0) : 0;
          if (avgN < 3.2) matchedLowNotes.push(n);
          else matchedFavs.push(n);
        } else if (nf.familyKind === 'bright') {
          noteBonus += (acAxis - 3.2) * 1.8;
        } else if (nf.familyKind === 'comfort') {
          noteBonus += (bdAxis - 3.2) * 1.8;
        } else {
          noteBonus += 1.0;
        }
      });
      rawDelta += clamp(noteBonus, -18, 15, 0);
      if (matchedDislikes.length) {
        reasons.push('Flavor Warning (' + matchedDislikes.join(', ') + '): Includes note(s) you previously disliked.');
      } else if (matchedLowNotes.length) {
        reasons.push('Flavor Caution (' + matchedLowNotes.join(', ') + '): Appeared in lower-rated cups in your log.');
      } else if (matchedFavs.length) {
        reasons.push('Flavor Notes (' + matchedFavs.join(', ') + '): Direct match with your favorite tasted notes!');
      } else {
        reasons.push('Flavor Notes (' + activeNotes.slice(0, 3).join(', ') + '): Evaluated against your 5-axis taste profile.');
      }
    }

    /* Guard knownSignals === 0 explicitly (never fabricate a 74% score from 0 traits) */
    if (knownSignals === 0) {
      return {
        pct: null,
        displayPct: '--',
        needsInput: true,
        tier: 'Need \u22651 Trait',
        knownSignals: 0,
        totalSignals: totalSignals,
        confPct: 0,
        reasons: ['Select at least 1 known bag trait (origin, roast, process, elevation, or flavor note) to calculate an honest match score.']
      };
    }

    const coverage = knownSignals / totalSignals;
    const confScale = 0.35 + 0.65 * coverage;
    const historyDeltaScale = uniqueCoffeesN > 0 ? 1.0 : 0.28;
    const baseAnchor = 68;
    const finalScore = baseAnchor + (Number.isFinite(rawDelta) ? rawDelta : 0) * confScale * historyDeltaScale;
    const pct = Math.round(clamp(finalScore, 12, 98, 68));

    /* Cap confidence <= 30% when N=0 (no logged history yet) */
    let confPct;
    if (uniqueCoffeesN === 0) {
      confPct = Math.round(clamp(10 + coverage * 20, 10, 30, 20));
    } else {
      const historyFactor = clamp(0.45 + 0.55 * (uniqueCoffeesN / (uniqueCoffeesN + 3)), 0.45, 1.0, 0.65);
      confPct = Math.round(clamp((0.28 + 0.72 * coverage) * historyFactor * 100, 22, 96, 65));
    }

    const isUnexplored = !origUnknown && (!origHit || origHit.n === 0);
    const tier = uniqueCoffeesN === 0
      ? 'Day-1 Seed Estimate'
      : knownSignals <= 1
      ? 'Partial-Info Estimate'
      : pct < 45
      ? 'Low Match / Caution'
      : pct >= 82
      ? 'Bullseye Bet'
      : (isUnexplored && pct < 80 ? 'Uncharted Horizon' : 'Bridge Pick');

    return {
      pct: pct,
      displayPct: pct + '%',
      needsInput: false,
      tier: tier,
      knownSignals: knownSignals,
      totalSignals: totalSignals,
      confPct: confPct,
      reasons: reasons
    };
  }

  function renderStoreBagScannerSegment() {
    const sc = palateState.scanner;
    sc.origin = sc.origin === 'unknown' ? 'unknown' : (canonicalizeOriginKey(sc.origin) || 'unknown');
    if (!Number.isFinite(parseFloat(sc.weightG)) || parseFloat(sc.weightG) <= 0) sc.weightG = 250;
    const atlas = getFullOriginAtlas();
    const bayes = computeBayesianPalate(getHistoryRows(100));
    const wrap = domH('div', { class: 'bt-palate-seg' });

    /* 1. Smart Bag Buyer's Guide: 3 Personalized Archetype Cards */
    const topOrigin = (bayes.originBoard[0] && bayes.originBoard[0].key) || 'ethiopia';
    const topOriginMeta = atlas.find(function (o) { return o.key === topOrigin; }) || atlas[1] || atlas[0];
    const topProcess = (bayes.processBoard[0] && bayes.processBoard[0].key) || 'washed';
    const topRoast = (bayes.roastBoard[0] && bayes.roastBoard[0].key) || 'light';
    const topElevKey = (bayes.elevationBoard[0] && bayes.elevationBoard[0].key) || 'high';
    const topElevMeta = ELEVATION_BAND_DEFS[topElevKey] || ELEVATION_BAND_DEFS.high;
    const topNotesPreset = bayes.topFlavorNotes.length
      ? bayes.topFlavorNotes.slice(0, 3).map(function (it) { return it.word; })
      : ['Jasmine', 'White Peach', 'Bergamot'];
    const bridgeOrigin = atlas.find(function (o) { return o.zone === topOriginMeta.zone && o.key !== topOrigin; }) || atlas[0];
    const unexploredOrigin = atlas.find(function (o) {
      return !bayes.originBoard.some(function (b) { return b.key === o.key; });
    }) || atlas[25] || atlas[0];

    const buyerCards = [
      {
        tier: 'Bullseye Bet',
        kicker: 'PROVEN PERSONAL SWEET SPOT',
        icon: 'check-seal',
        cls: 'is-bullseye',
        title: topOriginMeta.name + ' · ' + formatProcessHuman(topProcess) + ' · ' + formatRoastHuman(topRoast) + ' (' + topElevMeta.short + ')',
        why: isScienceXray()
          ? ('Matches your #1 Empirical-Bayes origin, process, elevation (' + topElevMeta.short + ') & flavor profile (' + topNotesPreset.slice(0, 2).join(', ') + ').')
          : ('Matches your #1 favorite origin, process, elevation (' + topElevMeta.short + ') & tasted notes (' + topNotesPreset.slice(0, 2).join(', ') + ') — safest bet for a 4.6+ star bag.'),
        preset: { origin: topOriginMeta.key, process: topProcess, roast: topRoast, elevation: topElevKey, notes: topNotesPreset.slice(), notesUnsure: false }
      },
      {
        tier: 'Bridge Pick',
        kicker: 'SAFE PALATE STRETCH',
        icon: 'spark-star',
        cls: 'is-bridge',
        title: bridgeOrigin.name + ' · Honey / Washed (' + formatRoastHuman(topRoast) + ' · 1,300\u20131,750m Mid)',
        why: 'Keeps your favorite roast solubility while bridging into neighboring ' + bridgeOrigin.name + ' terroir (' + String(bridgeOrigin.notes || '').split(',')[0] + ').',
        preset: { origin: bridgeOrigin.key, process: 'honey', roast: topRoast, elevation: 'mid', notes: String(bridgeOrigin.notes || '').split(',').slice(0, 2).map(function (s) { return s.trim(); }).filter(Boolean), notesUnsure: false }
      },
      {
        tier: 'Uncharted Horizon',
        kicker: 'NEW PASSPORT STAMP',
        icon: 'origin-globe',
        cls: 'is-horizon',
        title: unexploredOrigin.name + ' · Specialty Lot (1,750m+)',
        why: 'Zero cups logged from ' + unexploredOrigin.name + ' yet! Expect: ' + unexploredOrigin.notes + '.',
        preset: { origin: unexploredOrigin.key, process: 'natural', roast: 'light', elevation: 'high', notes: String(unexploredOrigin.notes || '').split(',').slice(0, 2).map(function (s) { return s.trim(); }).filter(Boolean), notesUnsure: false }
      }
    ];

    const guideCard = domH('section', { class: 'bt-studio-card' },
      domH('div', { class: 'bt-lab-card-head' },
        domH('div', { class: 'bt-lab-title-group' },
          ic('fresh-bag', { size: 22 }),
          domH('div', null,
            domH('h3', { text: '"Will I Love This Bag?" — Smart Bag Buyer\'s Guide' }),
            domH('p', { class: 'bt-lab-sub', text: 'Tap Bullseye Bet, Bridge Pick, or Uncharted Horizon — or enter any shelf bag below (tap "Don\'t Know" for anything unlisted on the bag!)' })
          )
        ),
        domH('button', {
          type: 'button',
          class: 'bt-lab-btn is-sm',
          onclick: function () {
            if (typeof sh().go === 'function') sh().go('bagcmp');
          }
        }, 'Compare 2 Bags \u2192')
      ),
      domH('div', { class: 'bt-buyer-trio-grid' },
        buyerCards.map(function (bc) {
          return domH('button', {
            type: 'button',
            class: 'bt-buyer-card ' + bc.cls,
            onclick: function () {
              sc.origin = bc.preset.origin;
              sc.process = bc.preset.process;
              sc.roast = bc.preset.roast;
              sc.elevation = bc.preset.elevation;
              sc.notes = bc.preset.notes.slice();
              sc.notesUnsure = false;
              CK.haptic('snap');
              paintScannerBody();
            }
          },
            domH('div', { class: 'bt-buyer-head' },
              ic(bc.icon, { size: 16 }),
              domH('span', { class: 'bt-buyer-kicker', text: bc.tier })
            ),
            domH('strong', { text: bc.title }),
            domH('p', { text: bc.why })
          );
        })
      )
    );
    wrap.appendChild(guideCard);

    /* 2. Interactive Zero-Spam In-Store Bag Evaluator (persistent paste input — zero focus loss on typing!) */
    const card = domH('section', {
      class: 'bt-studio-card',
      id: 'bt-bag-love-evaluator',
      style: 'min-width:0;max-width:100%;box-sizing:border-box'
    });

    const originChoices = ['ethiopia', 'colombia', 'kenya', 'panama', 'costarica', 'guatemala', 'brazil', 'rwanda', 'peru', 'indonesia', 'yemen', 'china'];
    const procChoices = ['washed', 'natural', 'honey', 'anaerobic', 'wet-hulled'];
    const roastChoices = ['ultra-light', 'light', 'medium-light', 'medium', 'medium-dark', 'dark'];
    const elevChoices = ['low', 'mid', 'high'];
    const noteChoices = ['Jasmine', 'Bergamot', 'White Peach', 'Blueberry', 'Blackcurrant', 'Strawberry', 'Lemon', 'Caramel', 'Brown Sugar', 'Milk Chocolate', 'Dark Chocolate', 'Hazelnut', 'Pineapple', 'Black Tea'];

    const scannerBodyHost = domH('div', { id: 'bt-scanner-body-host', style: 'display:flex;flex-direction:column;gap:12px' });

    const pasteIn = domH('input', {
      type: 'text',
      id: 'bt-scanner-paste-in',
      class: 'bt-lab-text-in',
      placeholder: 'Paste shelf tag text or AI Scan JSON to auto-evaluate (0 rows saved until you buy)...',
      value: sc.rawLabel,
      oninput: function () {
        sc.rawLabel = pasteIn.value;
        clearScannerPasteTimer();
        scannerPasteTimer = setTimeout(function () {
          scannerPasteTimer = null;
          const parsed = parseScannerBagText(sc.rawLabel, atlas);
          if (parsed.origin) sc.origin = parsed.origin;
          if (parsed.process) sc.process = parsed.process;
          if (parsed.roast) sc.roast = parsed.roast;
          if (parsed.elevation) sc.elevation = parsed.elevation;
          if (parsed.roaster) sc.roaster = parsed.roaster;
          if (Array.isArray(parsed.notes) && parsed.notes.length) {
            sc.notes = parsed.notes.slice();
            sc.notesUnsure = false;
          }
          if (Number.isFinite(parsed.price)) sc.price = parsed.price;
          if (Number.isFinite(parsed.weightG)) sc.weightG = parsed.weightG;
          paintScannerBody();
        }, 120);
      }
    });

    function paintScannerBody() {
      scannerBodyHost.textContent = '';
      const matchOut = computeBagMatchScoreFor(sc, bayes, atlas);

      /* Full 52-Origin Dropdown synced with chips & Map Passport handoff */
      const originSelect52 = domH('select', {
        id: 'bt-scanner-origin-select',
        class: 'bt-lab-select bt-map-origin-select',
        'aria-label': 'Choose any of the 52 coffee origins',
        onchange: function () {
          sc.origin = originSelect52.value || 'unknown';
          CK.haptic('tick');
          paintScannerBody();
        }
      },
        domH('option', { value: 'unknown', text: 'Don\'t Know / Blend' }),
        atlas.slice().sort(function (a, b) { return a.name.localeCompare(b.name); }).map(function (o) {
          const opt = domH('option', { value: o.key, text: o.name });
          if (sc.origin === o.key) opt.selected = true;
          return opt;
        })
      );
      if (sc.origin === 'unknown') originSelect52.value = 'unknown';

      /* 1. Origin + Full 52-Origin Selector + Don't Know */
      scannerBodyHost.appendChild(domH('div', { class: 'bt-scanner-group' },
        domH('span', { class: 'bt-lab-inline-lbl', text: '1. Origin (All ' + atlas.length + ' Countries or Don\'t Know / Blend):' }),
        domH('div', { class: 'bt-lab-chip-row' },
          originSelect52,
          domH('button', {
            type: 'button',
            class: 'bt-lab-chip bt-dontknow-pill' + (sc.origin === 'unknown' ? ' is-active' : ''),
            'aria-pressed': String(sc.origin === 'unknown'),
            onclick: function () { sc.origin = 'unknown'; CK.haptic('tick'); paintScannerBody(); }
          }, 'Don\'t Know / Blend'),
          originChoices.map(function (ok) {
            const meta = atlas.find(function (x) { return x.key === ok; }) || { name: ok };
            return domH('button', {
              type: 'button',
              class: 'bt-lab-chip' + (sc.origin === ok ? ' is-active' : ''),
              'aria-pressed': String(sc.origin === ok),
              onclick: function () { sc.origin = ok; CK.haptic('tick'); paintScannerBody(); }
            }, meta.name);
          })
        )
      ));

      /* 2. Roast Level + Don't Know */
      scannerBodyHost.appendChild(domH('div', { class: 'bt-scanner-group' },
        domH('span', { class: 'bt-lab-inline-lbl', text: '2. Roast Level:' }),
        domH('div', { class: 'bt-lab-chip-row' },
          domH('button', {
            type: 'button',
            class: 'bt-lab-chip bt-dontknow-pill' + (sc.roast === 'unknown' ? ' is-active' : ''),
            'aria-pressed': String(sc.roast === 'unknown'),
            onclick: function () { sc.roast = 'unknown'; CK.haptic('tick'); paintScannerBody(); }
          }, 'Don\'t Know'),
          roastChoices.map(function (rk) {
            return domH('button', {
              type: 'button',
              class: 'bt-lab-chip' + (sc.roast === rk ? ' is-active' : ''),
              'aria-pressed': String(sc.roast === rk),
              onclick: function () { sc.roast = rk; CK.haptic('tick'); paintScannerBody(); }
            }, formatRoastHuman(rk));
          })
        )
      ));

      /* 3. Process + Don't Know */
      scannerBodyHost.appendChild(domH('div', { class: 'bt-scanner-group' },
        domH('span', { class: 'bt-lab-inline-lbl', text: '3. Processing Style:' }),
        domH('div', { class: 'bt-lab-chip-row' },
          domH('button', {
            type: 'button',
            class: 'bt-lab-chip bt-dontknow-pill' + (sc.process === 'unknown' ? ' is-active' : ''),
            'aria-pressed': String(sc.process === 'unknown'),
            onclick: function () { sc.process = 'unknown'; CK.haptic('tick'); paintScannerBody(); }
          }, 'Don\'t Know'),
          procChoices.map(function (pk) {
            return domH('button', {
              type: 'button',
              class: 'bt-lab-chip' + (sc.process === pk ? ' is-active' : ''),
              'aria-pressed': String(sc.process === pk),
              onclick: function () { sc.process = pk; CK.haptic('tick'); paintScannerBody(); }
            }, formatProcessHuman(pk));
          })
        )
      ));

      /* 4. Elevation Band + Don't Know */
      scannerBodyHost.appendChild(domH('div', { class: 'bt-scanner-group' },
        domH('span', { class: 'bt-lab-inline-lbl', text: '4. Elevation / Altitude:' }),
        domH('div', { class: 'bt-lab-chip-row' },
          domH('button', {
            type: 'button',
            class: 'bt-lab-chip bt-dontknow-pill' + (sc.elevation === 'unknown' ? ' is-active' : ''),
            'aria-pressed': String(sc.elevation === 'unknown'),
            onclick: function () { sc.elevation = 'unknown'; CK.haptic('tick'); paintScannerBody(); }
          }, 'Don\'t Know'),
          elevChoices.map(function (ek) {
            const def = ELEVATION_BAND_DEFS[ek];
            return domH('button', {
              type: 'button',
              class: 'bt-lab-chip' + (sc.elevation === ek ? ' is-active' : ''),
              'aria-pressed': String(sc.elevation === ek),
              onclick: function () { sc.elevation = ek; CK.haptic('tick'); paintScannerBody(); }
            }, def.label);
          })
        )
      ));

      /* 5. Printed Bag Flavor Notes + Custom Note Input */
      const customNoteIn = domH('input', {
        type: 'text',
        class: 'bt-lab-text-in',
        style: 'flex:1 1 180px;min-width:0',
        placeholder: 'Add any custom note on the bag (e.g. Apricot, Panela)...',
        value: sc.customNote || '',
        onkeydown: function (ev) {
          if (ev.key === 'Enter' && customNoteIn.value.trim()) {
            ev.preventDefault();
            customNoteIn.value.split(/[,;]+/).map(function (s) { return s.trim(); }).filter(Boolean).forEach(function (v) {
              if (!isUnknownTrait(v) && sc.notes.indexOf(v) < 0) sc.notes.push(v);
            });
            sc.notesUnsure = false;
            sc.customNote = '';
            CK.haptic('snap');
            paintScannerBody();
          }
        },
        oninput: function () { sc.customNote = customNoteIn.value; }
      });

      const allDisplayNotes = noteChoices.slice();
      sc.notes.forEach(function (un) {
        if (allDisplayNotes.indexOf(un) < 0) allDisplayNotes.unshift(un);
      });

      scannerBodyHost.appendChild(domH('div', { class: 'bt-scanner-group' },
        domH('span', { class: 'bt-lab-inline-lbl', text: '5. Printed Bag Flavor Notes (tap to test + see live Flavor Chemistry):' }),
        domH('div', { class: 'bt-lab-chip-row' },
          domH('button', {
            type: 'button',
            class: 'bt-lab-chip bt-dontknow-pill' + (sc.notesUnsure ? ' is-active' : ''),
            'aria-pressed': String(!!sc.notesUnsure),
            onclick: function () {
              sc.notesUnsure = !sc.notesUnsure;
              if (sc.notesUnsure) sc.notes = [];
              CK.haptic('tick');
              paintScannerBody();
            }
          }, 'Don\'t Know / None Listed'),
          allDisplayNotes.map(function (nw) {
            const on = !sc.notesUnsure && sc.notes.indexOf(nw) >= 0;
            return domH('button', {
              type: 'button',
              class: 'bt-lab-chip' + (on ? ' is-active' : ''),
              'aria-pressed': String(on),
              onclick: function () {
                sc.notesUnsure = false;
                if (on) sc.notes = sc.notes.filter(function (x) { return x !== nw; });
                else sc.notes.push(nw);
                CK.haptic('tick');
                paintScannerBody();
              }
            }, nw);
          })
        ),
        domH('div', { style: 'display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:6px' },
          customNoteIn,
          domH('button', {
            type: 'button',
            class: 'bt-lab-btn is-sm',
            onclick: function () {
              const raw = (customNoteIn.value || '').trim();
              if (!raw) return;
              raw.split(/[,;]+/).map(function (s) { return s.trim(); }).filter(Boolean).forEach(function (v) {
                if (!isUnknownTrait(v) && sc.notes.indexOf(v) < 0) sc.notes.push(v);
              });
              sc.notesUnsure = false;
              sc.customNote = '';
              CK.haptic('snap');
              paintScannerBody();
            }
          }, '+ Add Bag Note')
        ),
        (!sc.notesUnsure && sc.notes.length > 0) ? domH('div', { class: 'bt-bag-chem-strip' },
          sc.notes.map(function (nw) {
            const chem = lookupFlavorChemistry(nw, '');
            return domH('span', { class: 'bt-chem-pill' },
              domH('strong', { text: nw + ' \u2192 ' + chem.shortMol }),
              domH('span', { text: ' · ' + chem.plain })
            );
          })
        ) : null
      ));

      /* 6. Bag Weight (g) & Price ($) inputs for accurate Buy & Add to My Beans logging */
      const weightIn = domH('input', {
        type: 'number',
        id: 'bt-scanner-weight-in',
        class: 'bt-lab-text-in num-tab',
        style: 'width:110px;min-height:44px',
        min: '50',
        max: '5000',
        step: '10',
        'aria-label': 'Bag weight in grams',
        value: String(sc.weightG || 250),
        oninput: function () {
          const v = parseFloat(weightIn.value);
          if (Number.isFinite(v) && v > 0) sc.weightG = v;
        }
      });
      const priceIn = domH('input', {
        type: 'number',
        id: 'bt-scanner-price-in',
        class: 'bt-lab-text-in num-tab',
        style: 'width:110px;min-height:44px',
        min: '0',
        max: '500',
        step: '0.5',
        'aria-label': 'Bag price in USD',
        value: sc.price != null ? String(sc.price) : '',
        oninput: function () {
          const v = parseFloat(priceIn.value);
          sc.price = (Number.isFinite(v) && v >= 0) ? v : 0;
        }
      });
      scannerBodyHost.appendChild(domH('div', { class: 'bt-scanner-group' },
        domH('span', { class: 'bt-lab-inline-lbl', text: '6. Bag Size & Shelf Price (saved only if you tap Buy):' }),
        domH('div', { style: 'display:flex;gap:12px;flex-wrap:wrap;align-items:center' },
          domH('label', { style: 'display:inline-flex;align-items:center;gap:6px;font-size:0.85rem' },
            domH('span', { text: 'Weight (g):' }),
            weightIn
          ),
          domH('label', { style: 'display:inline-flex;align-items:center;gap:6px;font-size:0.85rem' },
            domH('span', { text: 'Price ($):' }),
            priceIn
          )
        )
      ));

      /* Live Verdict Ring & Buy CTA */
      scannerBodyHost.appendChild(domH('div', { class: 'bt-scanner-verdict', id: 'bt-bag-match-verdict' },
        domH('div', { class: 'bt-scanner-score-ring num-tab' },
          domH('strong', { text: matchOut.displayPct }),
          domH('span', { text: matchOut.tier })
        ),
        domH('div', { class: 'bt-scanner-reasons' },
          domH('div', { class: 'bt-scanner-conf-row' },
            domH('span', {
              class: 'bt-epistemic-pill ' + (matchOut.confPct >= 65 ? 'is-verified' : (matchOut.confPct >= 35 ? 'is-research' : 'is-craft')),
              text: matchOut.knownSignals + '/' + matchOut.totalSignals + ' Bag Traits Known · ' + matchOut.confPct + '% Prediction Confidence'
            })
          ),
          matchOut.reasons.map(function (rLine) { return domH('p', { text: rLine }); }),
          domH('button', {
            type: 'button',
            id: 'bt-scanner-buy-cta',
            class: 'bt-lab-btn is-primary',
            onclick: function () {
              const a = getApp();
              const isOrigUnk = sc.origin === 'unknown' || isUnknownTrait(sc.origin);
              const isProcUnk = sc.process === 'unknown' || isUnknownTrait(sc.process);
              const isRoastUnk = sc.roast === 'unknown' || isUnknownTrait(sc.roast);
              const isElevUnk = sc.elevation === 'unknown' || isUnknownTrait(sc.elevation);
              const origMeta = isOrigUnk ? { name: 'unknown' } : (atlas.find(function (x) { return x.key === sc.origin; }) || { name: sc.origin });

              /* Guard raw JSON paste from becoming coffee_name */
              const parsedRaw = parseScannerBagText(sc.rawLabel, atlas);
              const synthesizedName = (isOrigUnk ? 'Specialty' : origMeta.name) + ' ' + (isProcUnk ? 'Coffee Bag' : formatProcessHuman(sc.process));
              let bagName = synthesizedName;
              if (parsedRaw.isJson) {
                if (parsedRaw.coffeeName && !/^\s*[\{\[]/.test(parsedRaw.coffeeName)) bagName = parsedRaw.coffeeName;
              } else {
                const rawTrim = String(sc.rawLabel || '').trim().split(/\r?\n/)[0].trim();
                if (rawTrim && !/^\s*[\{\[]/.test(rawTrim)) bagName = rawTrim.slice(0, 80);
              }

              const bagWeightG = clamp(parseFloat(sc.weightG), 50, 5000, 250);
              const bagPrice = (Number.isFinite(parseFloat(sc.price)) && parseFloat(sc.price) >= 0) ? parseFloat(sc.price) : 0;
              const todayIso = new Date().toISOString().slice(0, 10);
              const elevMetersStr = isElevUnk ? '' : String((ELEVATION_BAND_DEFS[sc.elevation] && ELEVATION_BAND_DEFS[sc.elevation].midMeters) || 1600);
              const cleanNotesStr = sc.notesUnsure ? '' : sc.notes.join(', ');
              const cleanFlavorsArr = sc.notesUnsure ? [] : sc.notes.slice();
              const freshId = 'cf_buy_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
              a.coffee = {
                id: freshId,
                coffee_id: freshId,
                name: bagName,
                roaster: sc.roaster || '',
                roaster_location: '',
                origin: isOrigUnk ? 'unknown' : origMeta.name,
                originUnsure: isOrigUnk ? 'yes' : '',
                origin_unknown: isOrigUnk ? 'yes' : '',
                region: '',
                farm: '',
                farm_or_station: '',
                producer: '',
                harvest_year: '',
                varietal: '',
                species: 'arabica',
                blend: '',
                process: isProcUnk ? 'unknown' : sc.process,
                processUnsure: isProcUnk ? 'yes' : '',
                process_unknown: isProcUnk ? 'yes' : '',
                process_sub: '',
                process_details: '',
                decaf: '',
                decaf_process: '',
                roast: isRoastUnk ? 'unknown' : sc.roast,
                roastUnsure: isRoastUnk ? 'yes' : '',
                roast_unknown: isRoastUnk ? 'yes' : '',
                elevation_m: elevMetersStr,
                elevText: elevMetersStr ? (elevMetersStr + ' masl') : '',
                elevUnsure: isElevUnk ? 'yes' : '',
                elev_unknown: isElevUnk ? 'yes' : '',
                density: '',
                bag_notes: cleanNotesStr,
                notes: cleanNotesStr,
                flavors: cleanFlavorsArr,
                notesUnsure: sc.notesUnsure ? 'yes' : '',
                personal_note: '',
                roast_date: todayIso,
                is_frozen: '',
                frozen_date: '',
                freeze_days_offset: '',
                bag_weight_g: bagWeightG,
                remaining_g: bagWeightG,
                price: bagPrice,
                currency: 'USD',
                agtron: '',
                bean_agtron: '',
                ground_agtron: '',
                roast_delta: '',
                agtron_scale: 'gourmet',
                dial_locked: '',
                pendingNextRecipe: null,
                dialAdaptation: null,
                roasterGuide: null,
                answered: 'yes'
              };
              a.attempt = 0;
              a.recipeLocked = false;
              a.dialNote = null;
              a.cupBrew = null;
              if (a.brew && typeof a.brew === 'object') {
                delete a.brew.dialAdaptation;
                delete a.brew.pendingNextRecipe;
                a.brew._savedDialedMethod = '';
                a.brew.actualSecs = null;
                a.brew.actualFromTimer = false;
              }
              if (window.BTStorage && typeof window.BTStorage.upsertCoffeeVaultRecord === 'function') {
                try { window.BTStorage.upsertCoffeeVaultRecord(a.coffee, null, { allowClear: true, allowUnlock: true }); } catch (_) {}
              }
              if (window.BTStorage && typeof window.BTStorage.getPrices === 'function' && typeof window.BTStorage.savePrices === 'function') {
                try {
                  const prObj = window.BTStorage.getPrices();
                  if (prObj && Array.isArray(prObj.list)) {
                    const canonicalBag = {
                      id: 'bag_' + Date.now(),
                      coffee_id: freshId,
                      coffee: bagName,
                      roaster: sc.roaster || '',
                      origin: isOrigUnk ? '' : origMeta.name,
                      process: isProcUnk ? 'unknown' : sc.process,
                      size: bagWeightG,
                      unit: 'g',
                      rem_g: bagWeightG,
                      price: bagPrice,
                      currency: 'USD',
                      sym: '$',
                      rlevel: isRoastUnk ? 'unknown' : sc.roast,
                      roast: todayIso,
                      date: todayIso,
                      notes: cleanNotesStr
                    };
                    prObj.list.unshift(typeof priceEntry === 'function' ? priceEntry(canonicalBag) : canonicalBag);
                    window.BTStorage.savePrices(prObj.list);
                  }
                } catch (_) {}
              }
              saveDraftSoon();
              if (typeof sh().flushDraft === 'function') { try { sh().flushDraft(); } catch (_) {} }
              CK.haptic('celebrate');
              notify('Added "' + bagName + '" to My Beans & loaded into Brew Studio!');
              if (typeof sh().go === 'function') sh().go('recipe');
              else if (typeof sh().switchTab === 'function') sh().switchTab('brew', { step: 'brew' });
            }
          }, ic('fresh-bag', { size: 16 }), domH('span', { text: 'Buy & Add to My Beans \u2192' }))
        )
      ));
    }

    card.appendChild(domH('div', { class: 'bt-lab-card-head' },
      domH('div', { class: 'bt-lab-title-group' },
        ic('scan-lens', { size: 22 }),
        domH('div', null,
          domH('h3', { text: 'Will I Love This Bag? — Shelf Bag Predictor' }),
          domH('p', { class: 'bt-lab-sub', text: 'Tap what\'s printed on the bag (or tap "Don\'t Know" for anything missing!) for an honest confidence-adjusted match %' })
        )
      )
    ));
    card.appendChild(pasteIn);
    paintScannerBody();
    card.appendChild(scannerBodyHost);

    wrap.appendChild(card);
    return wrap;
  }

  /* ==========================================================================
   * SEGMENT 3: 85-Descriptor Sunburst Flavor Wheel + 36-Vial Aroma Kit Tracker
   *   - Module-level RAF cancellation + in-place SVG geometry updates (0 rebuilds/frame)
   *   - Word-count-weighted group spans (all 9 Tropical & Orchard petals labeled!)
   *   - Clipped/abbreviated Ring 2 labels + Constellation hit halos + keyboard handlers
   * ========================================================================== */
  const RING2_SHORT_LABELS = {
    'Tropical & Orchard': 'Tropical',
    'Honey & Vanilla': 'Honey/Van',
    'Stone Fruit': 'Stone Frt',
    'Cereal & Malt': 'Cereal',
    'Tropical Funk': 'Trop Funk',
    'Warm Spice': 'Warm Spc',
    'Deep Roast': 'Deep Rst',
    'Caramelized': 'Caramel',
    'Chocolate': 'Choc.',
    'Tea-Like': 'Tea-Like'
  };

  const RING1_COMPACT_LABELS = {
    'Fruity': 'Fruity',
    'Floral': 'Floral',
    'Sweet': 'Sweet',
    'Nutty & Cocoa': 'Cocoa',
    'Spiced': 'Spiced',
    'Fermented': 'Funk',
    'Green & Earthy': 'Herbal',
    'Roasted & Grain': 'Roast'
  };

  function abbreviateRing2Label(name) {
    const s = String(name || '').trim();
    if (RING2_SHORT_LABELS[s]) return RING2_SHORT_LABELS[s];
    return s.length > 9 ? (s.slice(0, 8).trim() + '.') : s;
  }

  function computeSunburstGroupSpans(fam, famSpan) {
    const groups = (fam && Array.isArray(fam.groups)) ? fam.groups : [];
    const totalWords = groups.reduce(function (acc, gr) {
      return acc + Math.max(1, Array.isArray(gr.words) ? gr.words.length : 1);
    }, 0) || 1;
    return groups.map(function (gr) {
      const wCount = Math.max(1, Array.isArray(gr.words) ? gr.words.length : 1);
      const span = famSpan * (wCount / totalWords);
      return {
        group: gr,
        wordCount: wCount,
        span: span,
        wordSpan: span / wCount
      };
    });
  }

  function syncPickedWordsFromActiveCoffee() {
    const ws = palateState.wheel;
    const a = getApp();
    const c = (a && a.coffee && typeof a.coffee === 'object') ? a.coffee : {};
    const activeKey = String(c.id || c.coffee_id || c.name || '');
    if (ws.pickedSyncKey === activeKey) return;
    ws.pickedWords = {};
    ws.pickedSyncKey = activeKey;
    const rawList = [];
    if (Array.isArray(c.flavors) && c.flavors.length) {
      c.flavors.forEach(function (w) { rawList.push(String(w || '').trim()); });
    } else if (typeof c.flavors_liked === 'string' && c.flavors_liked.trim()) {
      c.flavors_liked.split(/[,;|]+/).forEach(function (w) { rawList.push(w.trim()); });
    }
    rawList.filter(function (w) { return !!w && !isUnknownTrait(w); }).forEach(function (w) {
      ws.pickedWords[w] = true;
    });
  }

  function renderElasticSunburstSegment() {
    stopActiveWheelSpring();
    syncPickedWordsFromActiveCoffee();

    const ws = palateState.wheel;
    const wheelData = BUILTIN_FLAVOR_WHEEL_85;
    const nFams = wheelData.fams.length;
    const wrap = domH('div', { class: 'bt-palate-seg' });
    const card = domH('section', { class: 'bt-studio-card' });

    while (ws.shares.length < nFams) { ws.shares.push(360 / nFams); ws.vels.push(0); }

    const svg = CK.svgEl('svg', {
      viewBox: '0 0 440 440',
      class: 'bt-chart-svg bt-sunburst-svg',
      'aria-label': '85-Descriptor Elastic 140-Degree Sunburst Flavor Wheel'
    });
    const gcoCard = domH('div', { class: 'bt-lab-subcard bt-gco-card' });
    const searchResultsRow = domH('div', { class: 'bt-lab-chip-row' });

    const C = 220;
    function polarXY(r, deg) {
      const rad = ((deg - 90) * Math.PI) / 180;
      return [C + r * Math.cos(rad), C + r * Math.sin(rad)];
    }
    function sectorPath(rIn, rOut, a0, a1) {
      const span = Math.max(0.5, a1 - a0);
      const large = span > 180 ? 1 : 0;
      const p0 = polarXY(rOut, a0);
      const p1 = polarXY(rOut, a1);
      const p2 = polarXY(rIn, a1);
      const p3 = polarXY(rIn, a0);
      return 'M ' + p0[0].toFixed(2) + ' ' + p0[1].toFixed(2) +
        ' A ' + rOut + ' ' + rOut + ' 0 ' + large + ' 1 ' + p1[0].toFixed(2) + ' ' + p1[1].toFixed(2) +
        ' L ' + p2[0].toFixed(2) + ' ' + p2[1].toFixed(2) +
        ' A ' + rIn + ' ' + rIn + ' 0 ' + large + ' 0 ' + p3[0].toFixed(2) + ' ' + p3[1].toFixed(2) + ' Z';
    }

    let sunburstRefs = null;

    function updateSunburstGeometry() {
      if (!sunburstRefs || ws.mode !== 'sunburst') return;
      let a0 = 0;
      let lastOuterLabelDeg = -999;
      let firstOuterLabelDeg = -999;
      for (let fi = 0; fi < nFams; fi++) {
        const fam = wheelData.fams[fi];
        const fRef = sunburstRefs.fams[fi];
        const span = ws.shares[fi];
        const a1 = a0 + span;
        const isFocused = ws.focusFam === fi;

        fRef.pFam.setAttribute('d', sectorPath(42, 92, a0 + 0.5, a1 - 0.5));
        fRef.pFam.setAttribute('fill-opacity', isFocused ? '0.96' : '0.78');

        const famMid = (a0 + a1) * 0.5;
        const famXY = polarXY(67, famMid);
        fRef.fTxt.setAttribute('x', famXY[0].toFixed(1));
        fRef.fTxt.setAttribute('y', famXY[1].toFixed(1));
        fRef.fTxt.setAttribute('font-size', isFocused ? '11' : '8.2');
        fRef.fTxt.textContent = isFocused ? fam.short : (RING1_COMPACT_LABELS[fam.name] || fam.short);
        if (!isFocused && span < 42) {
          let fRot = famMid - 90;
          if (famMid > 180) fRot += 180;
          fRef.fTxt.setAttribute('transform', 'rotate(' + fRot.toFixed(1) + ' ' + famXY[0].toFixed(1) + ' ' + famXY[1].toFixed(1) + ')');
        } else {
          fRef.fTxt.removeAttribute('transform');
        }

        /* Weight group spans proportionally by word count so all 9 Tropical & Orchard petals stay labeled! */
        const gSpans = computeSunburstGroupSpans(fam, span);
        const gMinSpan = isFocused ? 14 : 18;
        const wMinSpan = isFocused ? 4.6 : 7.0;
        const minSepDeg = isFocused ? 5.0 : 7.4;
        let bCursor = a0;

        for (let gi = 0; gi < fam.groups.length; gi++) {
          const gr = fam.groups[gi];
          const gRef = fRef.groups[gi];
          const gSpan = gSpans[gi].span;
          const b0 = bCursor;
          const b1 = b0 + gSpan;
          bCursor = b1;

          gRef.pGr.setAttribute('d', sectorPath(94, 148, b0 + 0.4, b1 - 0.4));
          gRef.pGr.setAttribute('fill-opacity', isFocused ? '0.76' : '0.52');

          if (gSpan >= gMinSpan) {
            const gMid = (b0 + b1) * 0.5;
            const gXY = polarXY(121, gMid);
            let rot = gMid - 90;
            if (gMid > 180) rot += 180;
            gRef.gTxt.style.display = '';
            gRef.gTxt.setAttribute('x', gXY[0].toFixed(1));
            gRef.gTxt.setAttribute('y', gXY[1].toFixed(1));
            gRef.gTxt.setAttribute('transform', 'rotate(' + rot.toFixed(1) + ' ' + gXY[0].toFixed(1) + ' ' + gXY[1].toFixed(1) + ')');
            gRef.gTxt.setAttribute('font-size', isFocused ? '9.2' : '8');
          } else {
            gRef.gTxt.style.display = 'none';
          }

          const wSpan = gSpans[gi].wordSpan;
          for (let wi = 0; wi < gr.words.length; wi++) {
            const wStr = gr.words[wi];
            const wRef = gRef.words[wi];
            const c0 = b0 + wi * wSpan;
            const c1 = c0 + wSpan;
            const onWord = ws.selectedWord === wStr || !!ws.pickedWords[wStr];

            wRef.pW.setAttribute('d', sectorPath(150, 212, c0 + 0.25, c1 - 0.25));
            wRef.pW.setAttribute('fill-opacity', onWord ? '1.0' : (isFocused ? '0.62' : '0.34'));
            wRef.pW.setAttribute('class', 'bt-wheel-wedge' + (onWord ? ' is-picked' : ''));
            wRef.pW.setAttribute('tabindex', isFocused ? '0' : '-1');

            const wMid = (c0 + c1) * 0.5;
            const sepPrev = wMid - lastOuterLabelDeg;
            const sepWrap = firstOuterLabelDeg >= 0 ? (firstOuterLabelDeg + 360 - wMid) : 999;
            if (wSpan >= wMinSpan && sepPrev >= minSepDeg && sepWrap >= minSepDeg) {
              lastOuterLabelDeg = wMid;
              if (firstOuterLabelDeg < 0) firstOuterLabelDeg = wMid;
              const wXY = polarXY(isFocused ? 181 : 183, wMid);
              let wRot = wMid - 90;
              if (wMid > 180) wRot += 180;
              wRef.wTxt.style.display = '';
              wRef.wTxt.setAttribute('x', wXY[0].toFixed(1));
              wRef.wTxt.setAttribute('y', wXY[1].toFixed(1));
              wRef.wTxt.setAttribute('transform', 'rotate(' + wRot.toFixed(1) + ' ' + wXY[0].toFixed(1) + ' ' + wXY[1].toFixed(1) + ')');
              wRef.wTxt.setAttribute('font-size', isFocused ? '8.8' : '7.2');
              wRef.wTxt.setAttribute('font-weight', onWord ? '700' : '600');
            } else {
              wRef.wTxt.style.display = 'none';
            }
          }
        }
        a0 = a1;
      }
      sunburstRefs.hLbl.textContent = ws.focusFam >= 0 ? '140\u00B0 Lens' : '85 Notes';
    }

    function buildSunburstScene() {
      svg.textContent = '';
      const refs = { fams: [], hub: null, hLbl: null };
      const wedgeLayer = CK.svgEl('g', { class: 'bt-wheel-wedges' });
      const textLayer = CK.svgEl('g', { class: 'bt-wheel-labels', style: 'pointer-events:none' });

      for (let fi = 0; fi < nFams; fi++) {
        const fam = wheelData.fams[fi];
        const pFam = CK.svgEl('path', {
          fill: fam.color,
          class: 'bt-wheel-wedge',
          tabindex: '0',
          role: 'button',
          'aria-label': fam.name + ' family'
        });
        (function (fIndex) {
          const act = function () { setFocusFamily(fIndex); };
          pFam.addEventListener('click', act);
          bindActivateKey(pFam, act);
        })(fi);
        wedgeLayer.appendChild(pFam);

        const fTxt = CK.svgEl('text', {
          'text-anchor': 'middle',
          'dominant-baseline': 'central',
          fill: '#FFFDF9',
          'font-weight': '700'
        });
        fTxt.textContent = fam.short;
        textLayer.appendChild(fTxt);

        const groupRefs = [];
        for (let gi = 0; gi < fam.groups.length; gi++) {
          const gr = fam.groups[gi];
          const pGr = CK.svgEl('path', {
            fill: fam.color,
            class: 'bt-wheel-wedge',
            tabindex: '0',
            role: 'button',
            'aria-label': gr.name + ' (' + fam.name + ')'
          });
          (function (fIndex) {
            const act = function () { setFocusFamily(fIndex); };
            pGr.addEventListener('click', act);
            bindActivateKey(pGr, act);
          })(fi);
          wedgeLayer.appendChild(pGr);

          const gTxt = CK.svgEl('text', {
            'text-anchor': 'middle',
            'dominant-baseline': 'central',
            fill: '#FFFDF9',
            'font-weight': '600'
          });
          gTxt.textContent = abbreviateRing2Label(gr.name);
          textLayer.appendChild(gTxt);

          const wordRefs = [];
          for (let wi = 0; wi < gr.words.length; wi++) {
            const wStr = gr.words[wi];
            const pW = CK.svgEl('path', {
              fill: fam.color,
              class: 'bt-wheel-wedge',
              tabindex: '-1',
              role: 'button',
              'aria-label': wStr
            });
            (function (fIndex, wordName) {
              const act = function () {
                ws.selectedWord = wordName;
                palateState.wheelMatchScope = 'auto';
                if (ws.focusFam !== fIndex) setFocusFamily(fIndex);
                else {
                  CK.haptic('tick');
                  updateSunburstGeometry();
                }
                paintGcoCard();
              };
              pW.addEventListener('click', act);
              bindActivateKey(pW, act);
            })(fi, wStr);
            wedgeLayer.appendChild(pW);

            const wTxt = CK.svgEl('text', {
              'text-anchor': 'middle',
              'dominant-baseline': 'central',
              fill: '#FFFDF9',
              'font-weight': '600'
            });
            wTxt.textContent = wStr.length > 11 ? wStr.slice(0, 10) + '.' : wStr;
            textLayer.appendChild(wTxt);
            wordRefs.push({ pW: pW, wTxt: wTxt, wordName: wStr });
          }
          groupRefs.push({ pGr: pGr, gTxt: gTxt, words: wordRefs });
        }
        refs.fams.push({ pFam: pFam, fTxt: fTxt, groups: groupRefs });
      }

      const hub = CK.svgEl('circle', {
        cx: C, cy: C, r: '39',
        class: 'bt-wheel-hub',
        tabindex: '0',
        role: 'button',
        'aria-label': 'Reset equal wheel angles'
      });
      const resetHub = function () { setFocusFamily(-1); };
      hub.addEventListener('click', resetHub);
      bindActivateKey(hub, resetHub);

      const hLbl = CK.svgEl('text', {
        x: C, y: C,
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        class: 'bt-wheel-hub-txt',
        style: 'pointer-events:none'
      });
      refs.hub = hub;
      refs.hLbl = hLbl;

      svg.appendChild(wedgeLayer);
      svg.appendChild(textLayer);
      svg.appendChild(hub);
      svg.appendChild(hLbl);
      sunburstRefs = refs;
      updateSunburstGeometry();
    }

    const springAnim = CK.createSpringAnimator(function (dt) {
      /* Auto-cancel RAF if SVG unmounted, switched away from Sunburst, or switched away from Wheel segment */
      if (!svg.isConnected || ws.mode !== 'sunburst' || palateState.subSegment !== 'wheel') {
        stopActiveWheelSpring();
        return false;
      }
      let moving = false;
      const focus = ws.focusFam;
      const restSpan = focus >= 0 ? (360 - 140) / Math.max(1, nFams - 1) : 360 / nFams;
      let sum = 0;
      for (let i = 0; i < nFams; i++) {
        const tgt = i === focus ? 140.0 : restSpan;
        const st = CK.stepSpring(ws.shares[i], ws.vels[i], tgt, dt);
        ws.shares[i] = st.pos;
        ws.vels[i] = st.vel;
        sum += ws.shares[i];
        if (!st.settled) moving = true;
      }
      if (sum > 0) {
        const norm = 360 / sum;
        for (let j = 0; j < nFams; j++) ws.shares[j] *= norm;
      }
      /* In-place attribute mutation ONLY: 0 DOM rebuilds, 0 listener allocations, 0 Bayesian recomputes */
      updateSunburstGeometry();
      return moving;
    }, { el: svg });
    activeWheelSpring = springAnim;

    function setFocusFamily(idx) {
      ws.focusFam = idx;
      CK.haptic('tick');
      if (ws.mode === 'sunburst') springAnim.wake();
    }

    function paintGcoCard() {
      gcoCard.textContent = '';
      const word = ws.selectedWord || 'Jasmine';
      let wordFam = '';
      let famObj = null;
      wheelData.fams.forEach(function (f) {
        f.groups.forEach(function (g) {
          if (g.words.indexOf(word) >= 0) { wordFam = f.name; famObj = f; }
        });
      });
      if (!famObj && ws.focusFam >= 0 && wheelData.fams[ws.focusFam]) {
        famObj = wheelData.fams[ws.focusFam];
        wordFam = famObj.name;
      }
      const mol = lookupFlavorChemistry(word, wordFam);
      const picked = !!ws.pickedWords[word];
      const sci = isScienceXray();

      gcoCard.appendChild(domH('div', { class: 'bt-lab-card-head' },
        domH('div', { class: 'bt-lab-title-group' },
          ic('xray-loupe', { size: 18 }),
          domH('div', null,
            domH('strong', {
              text: sci
                ? (word + ' \u2192 ' + mol.mol + ' (' + mol.formula + ')')
                : (word + ' \u2192 ' + mol.shortMol + ' (Aroma Chemistry)')
            }),
            domH('p', {
              class: 'bt-lab-sub' + (sci ? ' num-tab' : ''),
              text: sci
                ? ('Threshold: ' + mol.threshold + '  ·  ' + mol.origin + '  ·  ' + mol.plain)
                : (mol.plain + ' (Natural coffee aroma compound: ' + mol.mol + ')')
            })
          )
        ),
        domH('div', { class: 'bt-lab-chip-row' },
          domH('button', {
            type: 'button',
            class: 'bt-lab-btn is-sm' + (picked ? ' is-primary' : ''),
            onclick: function () {
              if (picked) delete ws.pickedWords[word];
              else ws.pickedWords[word] = true;
              const a = getApp();
              a.coffee = a.coffee || {};
              const activeList = Object.keys(ws.pickedWords).filter(function (k) { return ws.pickedWords[k]; });
              a.coffee.flavors = activeList.slice();
              a.coffee.flavors_liked = activeList.join(', ');
              saveDraftSoon();
              CK.haptic('snap');
              if (ws.mode === 'sunburst') updateSunburstGeometry();
              else drawConstellation();
              paintGcoCard();
            }
          }, ic('check-seal', { size: 14 }), domH('span', { text: picked ? 'Tagged on Active Cup' : 'Tag on Active Cup' })),
          domH('button', {
            type: 'button',
            class: 'bt-lab-btn is-sm',
            onclick: function () {
              const allNotes = [];
              wheelData.fams.forEach(function (f, fi) {
                f.groups.forEach(function (g) {
                  g.words.forEach(function (w) { allNotes.push({ w: w, fi: fi }); });
                });
              });
              const pick = allNotes[Math.floor(Math.random() * allNotes.length)] || { w: 'Blueberry', fi: 0 };
              ws.selectedWord = pick.w;
              palateState.wheelMatchScope = 'auto';
              setFocusFamily(pick.fi);
              paintGcoCard();
            }
          }, 'Surprise My Nose')
        )
      ));

      /* Flavor Note & Aroma Family -> Logged Cups & Top Beans Drill-Down */
      const histRows = getHistoryRows(100);
      const wordLow = word.toLowerCase();
      const famWords = [];
      if (famObj) {
        famObj.groups.forEach(function (gr) {
          gr.words.forEach(function (w) { famWords.push(w.toLowerCase()); });
        });
      }
      const rowHay = function (r) {
        return [r.flavors_liked, r.words_flavor, r.bag_notes, r.general_notes].map(unneutPalate).join(' ');
      };
      const exactRows = histRows.filter(function (r) { return wordBoundaryHas(rowHay(r), wordLow); });
      const famRows = famWords.length ? histRows.filter(function (r) {
        const h = rowHay(r);
        return famWords.some(function (fw) { return wordBoundaryHas(h, fw); });
      }) : [];

      /* Honor explicit 'word' or 'family' selection; auto-fallback only when wheelMatchScope === 'auto' */
      const activeScope = palateState.wheelMatchScope === 'word'
        ? 'word'
        : palateState.wheelMatchScope === 'family'
        ? 'family'
        : (!exactRows.length && famRows.length > 0 ? 'family' : 'word');
      const shownRows = (activeScope === 'family' ? famRows : exactRows).slice().sort(function (a, b) { return rowStar(b) - rowStar(a); });

      const beanMap = new Map();
      shownRows.forEach(function (r) {
        const bk = (unneutPalate(r.coffee_name) || 'Coffee') + (r.roaster ? (' \u00B7 ' + unneutPalate(r.roaster)) : '');
        const cur = beanMap.get(bk) || { label: bk, n: 0, sum: 0, bestRow: r };
        const st = rowStar(r);
        cur.n++;
        cur.sum += st;
        if (st > rowStar(cur.bestRow)) cur.bestRow = r;
        beanMap.set(bk, cur);
      });
      const topBeans = Array.from(beanMap.values()).sort(function (a, b) { return (b.sum / b.n) - (a.sum / a.n) || b.n - a.n; }).slice(0, 4);

      gcoCard.appendChild(domH('div', { class: 'bt-drill-drawer', id: 'bt-wheel-cup-drill' },
        domH('div', { class: 'bt-drill-drawer-head' },
          domH('div', { style: 'min-width:0;flex:1' },
            domH('div', { class: 'bt-pref-tile-lbl', text: 'FLAVOR \u2192 LOGGED CUPS & TOP BEANS' }),
            domH('strong', { class: 'bt-drill-drawer-title', text: activeScope === 'family' ? ((wordFam || 'Aroma') + ' Family Cups (' + famRows.length + ')') : ('Cups with "' + word + '" (' + exactRows.length + ')') })
          ),
          domH('div', { class: 'bt-rating-tier-bar' },
            domH('button', {
              type: 'button',
              class: 'bt-rating-tier-btn bt-lab-chip' + (activeScope === 'word' ? ' is-active' : ''),
              'aria-pressed': String(activeScope === 'word'),
              onclick: function () { palateState.wheelMatchScope = 'word'; CK.haptic('tick'); paintGcoCard(); }
            }, '"' + word + '" (' + exactRows.length + ')'),
            wordFam ? domH('button', {
              type: 'button',
              class: 'bt-rating-tier-btn bt-lab-chip' + (activeScope === 'family' ? ' is-active' : ''),
              'aria-pressed': String(activeScope === 'family'),
              onclick: function () { palateState.wheelMatchScope = 'family'; CK.haptic('tick'); paintGcoCard(); }
            }, wordFam + ' Family (' + famRows.length + ')') : null
          )
        ),
        topBeans.length > 0 ? domH('div', { class: 'bt-drill-meta-row' },
          domH('span', { class: 'bt-lab-inline-lbl', text: 'Top Beans:' }),
          topBeans.map(function (tb) {
            return domH('button', {
              type: 'button',
              class: 'bt-lab-chip bt-drillable',
              onclick: function () { inspectCupFromPalate(tb.bestRow); }
            }, tb.label + ' (' + (tb.sum / tb.n).toFixed(1) + '/5)');
          })
        ) : null,
        shownRows.length > 0 ? domH('div', { class: 'bt-drill-cup-list' },
          shownRows.slice(0, 5).map(function (r) { return buildDrillCupCard(r); })
        ) : domH('p', {
          class: 'bt-lab-hint',
          style: 'margin:0',
          text: histRows.length
            ? ('No logged cups mention "' + word + '" yet — tap "Tag on Active Cup" above or switch to ' + (wordFam || 'Family') + ' to inspect related brews!')
            : 'Log a tasting with flavor notes in Step 5 to link wheel descriptors directly to your favorite coffees & cups!'
        })
      ));
    }

    function drawConstellation() {
      stopActiveWheelSpring();
      sunburstRefs = null;
      svg.textContent = '';

      const cDefs = CK.svgEl('defs');
      const cGrad = CK.svgEl('radialGradient', { id: 'bt_constellation_stage', cx: '0.5', cy: '0.45', r: '0.55' });
      cGrad.appendChild(CK.svgEl('stop', { offset: '0%', 'stop-color': '#221914' }));
      cGrad.appendChild(CK.svgEl('stop', { offset: '100%', 'stop-color': '#0E0A08' }));
      cDefs.appendChild(cGrad);
      svg.appendChild(cDefs);
      svg.appendChild(CK.svgEl('circle', { cx: C, cy: C, r: '208', fill: 'url(#bt_constellation_stage)', stroke: '#4A3628', 'stroke-width': '2' }));

      /* Computed ONCE per Constellation render — NEVER in a 60fps loop */
      const bayes = computeBayesianPalate(getHistoryRows(100));
      const starCoords = {};
      const starCoordsLow = Object.create(null);
      const likedLowMap = Object.create(null);
      bayes.likedNotes.forEach(function (rec, k) {
        const kl = String(k || '').trim().toLowerCase();
        if (!kl) return;
        if (!likedLowMap[kl] || rec.n > likedLowMap[kl].n) likedLowMap[kl] = rec;
      });
      const pickedLowSet = Object.create(null);
      Object.keys(ws.pickedWords).forEach(function (k) {
        if (ws.pickedWords[k]) pickedLowSet[k.toLowerCase()] = true;
      });

      let aDeg = 0;
      wheelData.fams.forEach(function (fam) {
        const span = 360 / nFams;
        let gIdx = 0;
        fam.groups.forEach(function (gr) {
          gr.words.forEach(function (wStr, wIdx) {
            const deg = aDeg + ((gIdx * 5 + wIdx + 1) / (fam.groups.length * 6 + 1)) * span;
            const r = 68 + ((wIdx % 4) * 36);
            const xy = polarXY(r, deg);
            const entry = { x: xy[0], y: xy[1], color: fam.color, word: wStr };
            starCoords[wStr] = entry;
            starCoordsLow[wStr.toLowerCase()] = entry;
          });
          gIdx++;
        });
        aDeg += span;
      });

      bayes.coOccur.forEach(function (cnt, key) {
        const parts = key.split('||');
        const pA = starCoords[parts[0]] || starCoordsLow[String(parts[0] || '').trim().toLowerCase()];
        const pB = starCoords[parts[1]] || starCoordsLow[String(parts[1] || '').trim().toLowerCase()];
        if (pA && pB && pA !== pB) {
          svg.appendChild(CK.svgEl('path', {
            d: 'M ' + pA.x.toFixed(1) + ' ' + pA.y.toFixed(1) + ' Q ' + C + ' ' + C + ' ' + pB.x.toFixed(1) + ' ' + pB.y.toFixed(1),
            fill: 'none',
            stroke: '#FAD67D',
            'stroke-width': '1.4',
            'stroke-opacity': String(clamp(0.22 + cnt * 0.15, 0.2, 0.75, 0.35))
          }));
        }
      });

      const placedLabelBoxes = [];
      const overlapsLabel = function (b) {
        for (let i = 0; i < placedLabelBoxes.length; i++) {
          const p = placedLabelBoxes[i];
          if (!(b.x1 < p.x0 || b.x0 > p.x1 || b.y1 < p.y0 || b.y0 > p.y1)) return true;
        }
        return false;
      };
      const labelNodes = [];

      Object.keys(starCoords).forEach(function (wStr) {
        const sc = starCoords[wStr];
        const wLow = wStr.toLowerCase();
        const rec = bayes.likedNotes.get(wStr) || likedLowMap[wLow];
        const count = rec ? rec.n : (ws.pickedWords[wStr] || pickedLowSet[wLow] ? 1 : 0);
        const rad = count > 0 ? 4.5 + 2.0 * Math.sqrt(Math.min(12, count)) : 2.5;

        const starG = CK.svgEl('g', {
          class: 'bt-constellation-star-g',
          tabindex: '0',
          role: 'button',
          'aria-label': wStr + (count > 0 ? (' (' + count + ' logged)') : ''),
          style: 'cursor:pointer'
        });
        /* Generous 14-unit radius (28-unit diameter) touch hit halo */
        starG.appendChild(CK.svgEl('circle', {
          cx: sc.x.toFixed(1),
          cy: sc.y.toFixed(1),
          r: '14',
          fill: 'transparent'
        }));
        starG.appendChild(CK.svgEl('circle', {
          cx: sc.x.toFixed(1),
          cy: sc.y.toFixed(1),
          r: rad.toFixed(1),
          fill: count > 0 ? '#FAD67D' : sc.color,
          'fill-opacity': count > 0 ? '0.96' : '0.52',
          class: 'bt-constellation-star'
        }));
        const activateStar = function () {
          ws.selectedWord = wStr;
          palateState.wheelMatchScope = 'auto';
          CK.haptic('tick');
          paintGcoCard();
        };
        starG.addEventListener('click', activateStar);
        bindActivateKey(starG, activateStar);
        svg.appendChild(starG);

        if (count > 0 || wLow === String(ws.selectedWord || '').toLowerCase()) {
          const estW = Math.max(26, wStr.length * 5.6 + 6);
          const estH = 12;
          const tries = [
            [0, -rad - 5],
            [0, rad + 12],
            [estW * 0.55, 3],
            [-estW * 0.55, 3],
            [0, -rad - 17],
            [0, rad + 24]
          ];
          let lx = sc.x, ly = sc.y - rad - 5;
          for (let ti = 0; ti < tries.length; ti++) {
            const tx = clamp(sc.x + tries[ti][0], 24 + estW * 0.5, 416 - estW * 0.5, sc.x);
            const ty = clamp(sc.y + tries[ti][1], 28, 418, sc.y);
            const box = { x0: tx - estW * 0.5, y0: ty - estH, x1: tx + estW * 0.5, y1: ty + 2 };
            if (!overlapsLabel(box)) {
              lx = tx; ly = ty;
              placedLabelBoxes.push(box);
              break;
            }
          }
          const lbl = CK.svgEl('text', {
            x: lx.toFixed(1),
            y: ly.toFixed(1),
            'text-anchor': 'middle',
            fill: '#F7F0E8',
            'font-size': '10',
            'font-weight': '600',
            style: 'pointer-events:none'
          });
          lbl.textContent = wStr;
          labelNodes.push(lbl);
        }
      });
      labelNodes.forEach(function (ln) { svg.appendChild(ln); });
    }

    function drawWheelOrConstellation() {
      if (ws.mode === 'constellation') drawConstellation();
      else buildSunburstScene();
    }

    const searchIn = domH('input', {
      type: 'search',
      class: 'bt-lab-text-in',
      placeholder: 'Search all 85+ flavor descriptors (e.g. bergamot, peach, cacao, cedar)...',
      value: ws.searchQuery,
      oninput: function () {
        ws.searchQuery = searchIn.value;
        paintSearchChips();
      }
    });

    function paintSearchChips() {
      searchResultsRow.textContent = '';
      const q = ws.searchQuery.trim().toLowerCase();
      if (!q) return;
      wheelData.fams.forEach(function (fam, fi) {
        fam.groups.forEach(function (gr) {
          gr.words.forEach(function (wStr) {
            if (wStr.toLowerCase().indexOf(q) >= 0) {
              searchResultsRow.appendChild(domH('button', {
                type: 'button',
                class: 'bt-lab-chip' + (ws.selectedWord === wStr ? ' is-active' : ''),
                onclick: function () {
                  ws.selectedWord = wStr;
                  palateState.wheelMatchScope = 'auto';
                  setFocusFamily(fi);
                  paintGcoCard();
                }
              }, wStr));
            }
          });
        });
      });
    }

    card.appendChild(domH('div', { class: 'bt-lab-card-head' },
      domH('div', { class: 'bt-lab-title-group' },
        ic('spark-star', { size: 22 }),
        domH('div', null,
          domH('h3', { text: '85-Descriptor Elastic Sunburst Flavor Wheel' }),
          domH('p', { class: 'bt-lab-sub', text: 'Tap any inner family to bloom a roomy 140\u00B0 arc — tap outer petals to tag your cup' })
        )
      ),
      domH('div', { class: 'bt-lab-chip-row' },
        domH('button', {
          type: 'button',
          class: 'bt-lab-chip' + (ws.mode === 'sunburst' ? ' is-active' : ''),
          onclick: function () {
            stopActiveWheelSpring();
            ws.mode = 'sunburst';
            rerenderPalateTab();
          }
        }, '140\u00B0 Sunburst'),
        domH('button', {
          type: 'button',
          class: 'bt-lab-chip' + (ws.mode === 'constellation' ? ' is-active' : ''),
          onclick: function () {
            stopActiveWheelSpring();
            ws.mode = 'constellation';
            rerenderPalateTab();
          }
        }, 'Palate Constellation')
      )
    ));
    const famQuickRow = domH('div', { class: 'bt-lab-chip-row', role: 'group', 'aria-label': 'Aroma family quick drill-down' },
      wheelData.fams.map(function (fam, fi) {
        return domH('button', {
          type: 'button',
          class: 'bt-lab-chip bt-drillable' + (ws.focusFam === fi ? ' is-active' : ''),
          'aria-pressed': String(ws.focusFam === fi),
          onclick: function () {
            const firstWord = (fam.groups[0] && fam.groups[0].words[0]) || ws.selectedWord;
            ws.selectedWord = firstWord;
            palateState.wheelMatchScope = 'family';
            setFocusFamily(fi);
            paintGcoCard();
            Array.prototype.forEach.call(famQuickRow.children, function (btn, bIdx) {
              btn.classList.toggle('is-active', bIdx === fi);
              btn.setAttribute('aria-pressed', String(bIdx === fi));
            });
          }
        }, fam.name);
      })
    );

    card.appendChild(searchIn);
    card.appendChild(searchResultsRow);
    card.appendChild(famQuickRow);
    card.appendChild(domH('div', { class: 'bt-chart-stage' }, svg));
    card.appendChild(gcoCard);
    wrap.appendChild(card);

    /* 2. 36-Vial Aroma Kit (KIT_NAMES) Olfactory Mastery Tracker (in-place updates without tearing down wheel!) */
    const kitCard = domH('section', { class: 'bt-studio-card', id: 'bt-aroma-kit-36' });
    const globKit = (typeof KIT_NAMES !== 'undefined' && KIT_NAMES) ? KIT_NAMES : (window.KIT_NAMES || null);
    const vials = FALLBACK_KIT_36.map(function (row) {
      const n = row[0];
      return { n: n, name: (globKit && globKit[n]) ? globKit[n] : row[1], fam: row[2] };
    });
    const countMastered = function () {
      return vials.filter(function (v) { return !!palateState.aromaKit[v.n]; }).length;
    };
    const kitTitleEl = domH('h3', { text: '36-Vial Aroma Kit Olfactory Mastery (' + countMastered() + ' / 36 Mastered)' });

    kitCard.appendChild(domH('div', { class: 'bt-lab-card-head' },
      domH('div', { class: 'bt-lab-title-group' },
        ic('check-seal', { size: 20 }),
        domH('div', null,
          kitTitleEl,
          domH('p', { class: 'bt-lab-sub', text: 'Train blind smell recall across all 36 numbered reference vials — tap any vial you can identify blind' })
        )
      )
    ));
    kitCard.appendChild(domH('div', { class: 'bt-aroma-kit-grid' },
      vials.map(function (v) {
        const initOn = !!palateState.aromaKit[v.n];
        const vialBtn = domH('button', {
          type: 'button',
          class: 'bt-aroma-vial-btn' + (initOn ? ' is-mastered' : ''),
          'aria-pressed': String(initOn)
        },
          domH('span', { class: 'bt-vial-num num-tab', text: '#' + v.n }),
          domH('span', { class: 'bt-vial-name', text: v.name })
        );
        vialBtn.addEventListener('click', function () {
          const nextOn = !palateState.aromaKit[v.n];
          if (nextOn) palateState.aromaKit[v.n] = true;
          else delete palateState.aromaKit[v.n];
          saveAromaKitTicked(palateState.aromaKit);
          vialBtn.classList.toggle('is-mastered', nextOn);
          vialBtn.setAttribute('aria-pressed', String(nextOn));
          kitTitleEl.textContent = '36-Vial Aroma Kit Olfactory Mastery (' + countMastered() + ' / 36 Mastered)';
          CK.haptic('tick');
        });
        return vialBtn;
      })
    ));
    kitCard.appendChild(domH('p', {
      class: 'bt-lab-hint',
      text: 'Le Nez du Cafe is a trademark of Editions Jean Lenoir; BeanTelligence is independent and lists only vial numbers and aroma names for personal study.'
    }));
    wrap.appendChild(kitCard);

    drawWheelOrConstellation();
    paintGcoCard();
    paintSearchChips();
    return wrap;
  }

  /* ==========================================================================
   * TAB 4 ('palate') MASTER CONTAINER, CLEAR-MEMORY HOOK & ROUTE REGISTRATION
   * ========================================================================== */
  let lastPalateMount = null;

  function rerenderPalateTab() {
    if (lastPalateMount) renderPalateTab(lastPalateMount);
  }

  function resetPalateMemoryState() {
    stopActiveWheelSpring();
    clearScannerPasteTimer();
    palateState.mapZoom = 'world';
    palateState.selectedOriginKey = '';
    palateState.timelapsePct = 100;
    palateState.expandedBoard = 'origins';
    palateState.showUnexploredOrigins = false;
    palateState.drillPath = [];
    palateState.selectedRoastZone = '';
    palateState.selectedRatingTier = '';
    palateState.selectedRadarAxis = '';
    palateState.selectedBeanCid = '';
    palateState.prefTargetDraft = null;
    palateState.wheelMatchScope = 'auto';
    palateState.demoMode = false;
    palateState.scanner.rawLabel = '';
    palateState.scanner.customNote = '';
    palateState.scanner.roaster = '';
    palateState.wheel.pickedWords = {};
    palateState.wheel.pickedSyncKey = '';
    palateState.wheel.searchQuery = '';
    palateState.aromaKit = loadAromaKitTicked();
    if (lastPalateMount && lastPalateMount.isConnected) {
      rerenderPalateTab();
    }
  }
  window.__btResetPalateState = resetPalateMemoryState;

  function normalizePalateSeg(raw) {
    if (raw === 'scanner' || raw === 'matcher' || raw === 'explore' || raw === 'buy') return 'matcher';
    if (raw === 'wheels' || raw === 'wheel' || raw === 'flavorwheel') return 'wheel';
    return 'dna';
  }

  function toShellPalateSeg(seg) {
    if (seg === 'matcher') return 'scanner';
    if (seg === 'wheel') return 'wheels';
    return 'dna';
  }

  function renderJustSavedBanner(a, jst) {
    const bjHost = domH('div', { class: 'bt-saved-palate-mascot' });
    const bjGlobal = (typeof Beanjamin !== 'undefined' && Beanjamin) ? Beanjamin : window.Beanjamin;
    if (bjGlobal && typeof bjGlobal.el === 'function') {
      bjHost.appendChild(bjGlobal.el('celebrating', {
        view: 'avatar',
        size: 54,
        label: 'Beanjamin celebrating your saved cup and updated preferences'
      }));
    } else {
      bjHost.appendChild(ic('spark-star', { size: 28 }));
    }

    const starsTxt = (Number(jst.stars) || 4.25).toFixed(2);
    const cupName = String(jst.coffeeName || 'Your Cup').trim() || 'Your Cup';
    const rxLine = String(jst.rxHeadline || 'Dialed-in recipe saved for your next cup').trim();

    return domH('section', {
      class: 'bt-saved-palate-banner' + (jst.goldLocked ? ' is-gold' : ''),
      id: 'bt-just-saved-tasting-banner',
      role: 'status',
      'aria-live': 'polite'
    },
      domH('div', { class: 'bt-saved-palate-top' },
        domH('span', {
          class: 'bt-saved-palate-kicker',
          text: jst.goldLocked ? 'GOLD RECIPE LOCKED \u00B7 TASTE PROFILE UPDATED' : 'CUP SAVED \u00B7 TASTE PROFILE UPDATED'
        }),
        domH('button', {
          type: 'button',
          class: 'bt-saved-palate-dismiss',
          id: 'bt-saved-banner-dismiss-btn',
          'aria-label': 'Dismiss Cup Saved banner',
          onclick: function () {
            a.justSavedTasting = null;
            CK.haptic('tick');
            rerenderPalateTab();
          }
        }, 'Dismiss \u00D7')
      ),
      domH('div', { class: 'bt-saved-palate-body' },
        bjHost,
        domH('div', { class: 'bt-saved-palate-copy' },
          domH('h2', { class: 'bt-saved-palate-title', text: 'Cup Saved & Preferences Updated!' }),
          domH('p', {
            class: 'bt-saved-palate-meta num-tab',
            text: cupName + ' \u00B7 Rated ' + starsTxt + ' / 5.00 Beans' + (jst.goldLocked ? ' \u00B7 Gold Recipe Locked' : '')
          }),
          domH('p', {
            class: 'bt-saved-palate-tweak',
            text: (jst.isCafe ? 'Logged to Coffee Street & Taste DNA: ' : 'Next-cup tweak saved on your bag: ') + rxLine
          })
        )
      ),
      domH('div', { class: 'bt-saved-palate-actions' },
        domH('button', {
          type: 'button',
          class: 'bt-lab-btn is-sm bt-saved-palate-home-btn',
          id: 'bt-saved-banner-home-btn',
          onclick: function () {
            a.justSavedTasting = null;
            a.brewStep = 'door';
            CK.haptic('tick');
            const shell = sh();
            if (typeof shell.go === 'function') shell.go('door');
            else if (typeof shell.switchTab === 'function') shell.switchTab('brew', { step: 'door' });
          }
        }, '\u2190 Back to Home'),
        domH('button', {
          type: 'button',
          class: 'bt-lab-btn is-primary is-sm bt-saved-palate-matcher-btn',
          id: 'bt-saved-banner-matcher-btn',
          onclick: function () {
            a.justSavedTasting = null;
            CK.haptic('snap');
            jumpToPalate('matcher');
          }
        }, 'Test "Will I Love This Bag?" \u2192')
      )
    );
  }

  function renderPalateTab(mountEl, ctx) {
    /* Cancel any active Elastic Sunburst RAF & pending scanner timers on every rerender/segment switch */
    stopActiveWheelSpring();
    clearScannerPasteTimer();

    if (mountEl && mountEl.nodeType === 1) lastPalateMount = mountEl;
    const a = getApp();
    a.tabSegments = a.tabSegments || {};
    if (ctx && ctx.segment) {
      palateState.subSegment = normalizePalateSeg(ctx.segment);
    } else if (a.tabSegments.palate) {
      palateState.subSegment = normalizePalateSeg(a.tabSegments.palate);
    }
    a.tabSegments.palate = toShellPalateSeg(palateState.subSegment);

    const page = domH('div', { class: 'bt-tab-page bt-palate-page' });

    const jst = a.justSavedTasting;
    if (jst && jst.at && (Date.now() - (+jst.at || 0)) < 30000 && !jst.dismissed) {
      jst._shownOnPalate = true;
      page.appendChild(renderJustSavedBanner(a, jst));
    } else if (jst) {
      a.justSavedTasting = null;
    }

    const palateHeadRow = domH('header', {
      class: 'bt-palate-top-head',
      style: 'display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:10px;min-width:0'
    },
      domH('div', { style: 'flex:1 1 200px;min-width:0' },
        domH('span', {
          style: 'display:block;font-size:0.74rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;color:var(--accent)',
          text: 'Tab 4 \u00B7 Preferences & Palate'
        }),
        domH('h1', {
          style: 'margin:2px 0 0;font-family:var(--font-display);font-size:1.22rem;line-height:1.22;color:var(--ink)',
          text: 'Your Taste DNA, Origins & Bag Guide'
        })
      ),
      domH('button', {
        type: 'button',
        id: 'bt-prefs-backup-saves-btn',
        class: 'bt-lab-btn is-accent no-print',
        style: 'min-height:44px;font-weight:700;flex-shrink:0',
        onclick: function () {
          if (CK && typeof CK.haptic === 'function') CK.haptic('snap');
          const bc = (typeof window !== 'undefined' && window.BTBackupCenter)
            || (typeof BTBackupCenter !== 'undefined' ? BTBackupCenter : null)
            || sh().BTBackupCenter;
          if (bc && typeof bc.open === 'function') {
            bc.open({ source: 'palate' });
          } else if (typeof sh().go === 'function') {
            sh().go('vault');
          } else if (typeof sh().switchTab === 'function') {
            sh().switchTab('academy', { segment: 'vault' });
          }
        }
      }, ic('vault-shield', { size: 16 }), domH('span', { text: 'Backup / Load Saves' }))
    );
    page.appendChild(palateHeadRow);

    const segNav = domH('nav', { class: 'bt-studio-pill-nav no-print', 'aria-label': 'Preferences & Palate Views' },
      [
        { id: 'dna', lbl: 'Preferences & Palate DNA', icon: 'origin-globe' },
        { id: 'matcher', lbl: 'Will I Love This Bag?', icon: 'fresh-bag' },
        { id: 'wheel', lbl: '85-Note Wheel & 36 Vials', icon: 'spark-star' }
      ].map(function (seg) {
        return domH('button', {
          type: 'button',
          class: 'bt-studio-nav-pill' + (palateState.subSegment === seg.id ? ' is-active' : ''),
          'aria-pressed': String(palateState.subSegment === seg.id),
          onclick: function () {
            if (a.justSavedTasting) a.justSavedTasting = null;
            palateState.subSegment = seg.id;
            const shellSeg = toShellPalateSeg(seg.id);
            const appNow = getApp();
            appNow.tabSegments = appNow.tabSegments || {};
            appNow.tabSegments.palate = shellSeg;
            if (typeof sh().setTabSegment === 'function') {
              sh().setTabSegment('palate', shellSeg);
            } else {
              saveDraftSoon();
            }
            CK.haptic('tick');
            rerenderPalateTab();
          }
        }, ic(seg.icon, { size: 16 }), domH('span', { text: seg.lbl }));
      })
    );
    page.appendChild(segNav);

    if (palateState.subSegment === 'matcher') page.appendChild(renderStoreBagScannerSegment());
    else if (palateState.subSegment === 'wheel') page.appendChild(renderElasticSunburstSegment());
    else page.appendChild(renderPalateDnaSegment());

    const bjGlobal = (typeof Beanjamin !== 'undefined' && Beanjamin) ? Beanjamin : window.Beanjamin;
    if (bjGlobal && typeof bjGlobal.enforceSinglePerViewport === 'function') {
      bjGlobal.enforceSinglePerViewport(page);
    }

    if (mountEl && mountEl.nodeType === 1) {
      mountEl.textContent = '';
      mountEl.appendChild(page);
    }
    return page;
  }

  function jumpToPalate(seg, boardKey) {
    const normSeg = normalizePalateSeg(seg || 'dna');
    palateState.subSegment = normSeg;
    if (boardKey) {
      palateState.expandedBoard = boardKey;
      palateState.drillPath = [];
      if (boardKey !== 'origins') palateState.selectedOriginKey = '';
    }
    const shell = sh();
    if (shell.app) {
      shell.app.tabSegments = shell.app.tabSegments || {};
      shell.app.tabSegments.palate = toShellPalateSeg(normSeg);
      if (typeof shell.switchTab === 'function') {
        shell.switchTab('palate', { segment: toShellPalateSeg(normSeg) });
        return;
      }
      shell.app.activeTab = 'palate';
    }
    if (typeof shell.render === 'function') shell.render();
    else rerenderPalateTab();
  }

  function registerPalateBindings() {
    const shell = sh();
    if (typeof shell.registerTab === 'function') shell.registerTab('palate', renderPalateTab);
    if (typeof shell.registerRoute === 'function') {
      shell.registerRoute('palate', function () { jumpToPalate('dna'); });
      shell.registerRoute('preferences', function () { jumpToPalate('dna'); });
      shell.registerRoute('prefs', function () { jumpToPalate('dna'); });
      shell.registerRoute('tend', function () { jumpToPalate('dna', 'origins'); });
      shell.registerRoute('tpboard', function () { jumpToPalate('dna', 'origins'); });
      shell.registerRoute('tpbrewers', function () { jumpToPalate('dna', 'brewers'); });
      shell.registerRoute('tpmix', function () { jumpToPalate('dna', 'flavors'); });
      shell.registerRoute('tpshops', function () { jumpToPalate('dna', 'cafes'); });
      shell.registerRoute('explore', function () { jumpToPalate('matcher'); });
      shell.registerRoute('buy', function () { jumpToPalate('matcher'); });
      shell.registerRoute('flavorwheel', function () { jumpToPalate('wheel'); });
      shell.registerRoute('wheels', function () { jumpToPalate('wheel'); });
      shell.registerRoute('wheel', function () { jumpToPalate('wheel'); });
    }
  }

  registerPalateBindings();

  window.BTPalateInsights = {
    renderPalateTab: renderPalateTab,
    computeBayesianPalate: computeBayesianPalate,
    computeRobustBagDialScore: computeRobustBagDialScoreLocal,
    getHistoryRows: getHistoryRows,
    formatTimelapseRangeLabel: formatTimelapseRangeLabel,
    getFullOriginAtlas: getFullOriginAtlas,
    matchOriginKey: matchOriginKey,
    classifyElevationBand: classifyElevationBand,
    extractTrait1to5: extractTrait1to5,
    roastNumericValue: roastNumericValue,
    processFunkValue: processFunkValue,
    radarPolarPt: radarPolarPt,
    parseScannerBagText: parseScannerBagText,
    computeBagMatchScoreFor: computeBagMatchScoreFor,
    lookupFlavorChemistry: lookupFlavorChemistry,
    computeSunburstGroupSpans: computeSunburstGroupSpans,
    abbreviateRing2Label: abbreviateRing2Label,
    BUILTIN_FLAVOR_WHEEL_85: BUILTIN_FLAVOR_WHEEL_85,
    resetState: resetPalateMemoryState,
    ELEVATION_BAND_DEFS: ELEVATION_BAND_DEFS,
    isUnknownTrait: isUnknownTrait,
    ORIGIN_ATLAS_52: ORIGIN_ATLAS_52,
    ORIGIN_ATLAS_36: ORIGIN_ATLAS_52,
    GCO_MOLECULES: GCO_MOLECULES,
    state: palateState
  };
})();
