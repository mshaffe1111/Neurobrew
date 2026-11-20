/* ============================================================================
 * BeanTelligence v6.2 — Tab 4: Palate DNA, Real World Coffee Belt Map (52 Origins),
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
  const clamp = CK ? CK.clamp : function (v, lo, hi, fb) {
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

  /* Complete 52-Origin Atlas Fallback (auto-enriched by global ORIGINS & ORIGIN_COORDS_V6 when loaded) */
  const ORIGIN_ATLAS_52 = [
    { key: 'colombia', name: 'Colombia', zone: 'americas', lat: 4.57, lon: -74.30, sub: ['Huila', 'Cauca', 'Narino', 'Tolima'], notes: 'Stone fruit, cane sugar, bright malic/citric' },
    { key: 'ethiopia', name: 'Ethiopia', zone: 'africa', lat: 7.55, lon: 38.76, sub: ['Yirgacheffe', 'Guji', 'Sidama', 'Gedeo'], notes: 'Bergamot, jasmine, blueberry, white peach' },
    { key: 'brazil', name: 'Brazil', zone: 'americas', lat: -19.92, lon: -45.20, sub: ['Cerrado Mineiro', 'Sul de Minas', 'Mogiana'], notes: 'Hazelnut, milk chocolate, creamy low-acid body' },
    { key: 'kenya', name: 'Kenya', zone: 'africa', lat: -0.42, lon: 37.08, sub: ['Nyeri', 'Kirinyaga', 'Kiambu', 'Embu'], notes: 'Blackcurrant, pink grapefruit, sparkling SL28' },
    { key: 'guatemala', name: 'Guatemala', zone: 'americas', lat: 14.63, lon: -90.98, sub: ['Antigua', 'Huehuetenango', 'Acatenango'], notes: 'Toffee, red apple, structured cocoa' },
    { key: 'costarica', name: 'Costa Rica', zone: 'americas', lat: 9.65, lon: -84.03, sub: ['Tarrazu', 'West Valley', 'Central Valley'], notes: 'Honey sweetness, apricot, clean citrus' },
    { key: 'panama', name: 'Panama', zone: 'americas', lat: 8.78, lon: -82.43, sub: ['Boquete', 'Volcan', 'Renacimiento'], notes: 'Jasmine, bergamot, white peach (Gesha)' },
    { key: 'honduras', name: 'Honduras', zone: 'americas', lat: 14.50, lon: -87.80, sub: ['Santa Barbara', 'Copan', 'Marcala'], notes: 'Caramel, tropical mango, juicy plum' },
    { key: 'elsalvador', name: 'El Salvador', zone: 'americas', lat: 13.85, lon: -89.55, sub: ['Santa Ana', 'Apaneca-Ilamatepec'], notes: 'Sweet mandarin, nougat, Pacamara florals' },
    { key: 'nicaragua', name: 'Nicaragua', zone: 'americas', lat: 13.08, lon: -86.00, sub: ['Jinotega', 'Matagalpa', 'Nueva Segovia'], notes: 'Poached pear, vanilla, roasted almond' },
    { key: 'peru', name: 'Peru', zone: 'americas', lat: -11.25, lon: -75.33, sub: ['Cajamarca', 'Cusco', 'Amazonas'], notes: 'Sweet panela, red plum, floral cocoa' },
    { key: 'mexico', name: 'Mexico', zone: 'americas', lat: 16.75, lon: -92.64, sub: ['Chiapas', 'Oaxaca', 'Veracruz'], notes: 'Praline, crisp pear, delicate cinnamon' },
    { key: 'ecuador', name: 'Ecuador', zone: 'americas', lat: -3.99, lon: -79.20, sub: ['Loja', 'Pichincha', 'Zamora'], notes: 'Sidra/Typica florals, raspberry, wild honey' },
    { key: 'bolivia', name: 'Bolivia', zone: 'americas', lat: -16.18, lon: -67.73, sub: ['Caranavi', 'Yungas'], notes: 'High-Andes mandarin, jasmine, cocoa' },
    { key: 'rwanda', name: 'Rwanda', zone: 'africa', lat: -2.18, lon: 29.56, sub: ['Nyamasheke', 'Huye', 'Gakenke'], notes: 'Cranberry, orange blossom, black tea' },
    { key: 'burundi', name: 'Burundi', zone: 'africa', lat: -3.15, lon: 29.74, sub: ['Kayanza', 'Ngozi', 'Muyinga'], notes: 'Red currant, spiced honey, hibiscus' },
    { key: 'uganda', name: 'Uganda', zone: 'africa', lat: 1.15, lon: 34.25, sub: ['Mount Elgon', 'Rwenzori'], notes: 'Dried fig, dark berry, cacao nib' },
    { key: 'tanzania', name: 'Tanzania', zone: 'africa', lat: -3.25, lon: 37.33, sub: ['Kilimanjaro', 'Mbeya', 'Ngorongoro'], notes: 'Blackberry, lime zest, crisp black tea' },
    { key: 'drc', name: 'DR Congo', zone: 'africa', lat: -1.65, lon: 29.05, sub: ['South Kivu', 'North Kivu', 'Lake Kivu'], notes: 'Sweet dark cherry, blood orange, cola spice' },
    { key: 'malawi', name: 'Malawi', zone: 'africa', lat: -11.45, lon: 34.02, sub: ['Misuku Hills', 'Shire Highlands'], notes: 'Sweet mandarin, honeyed tea blossom' },
    { key: 'zambia', name: 'Zambia', zone: 'africa', lat: -10.20, lon: 31.18, sub: ['Northern Province', 'Muchinga'], notes: 'Bright pomelo, caramel, black tea' },
    { key: 'indonesia', name: 'Indonesia', zone: 'asia', lat: -0.58, lon: 101.34, sub: ['Sumatra Aceh/Gayo', 'Java', 'Bali Kintamani', 'Sulawesi Toraja'], notes: 'Cedar spice, dark cocoa, tropical fruit' },
    { key: 'vietnam', name: 'Vietnam', zone: 'asia', lat: 11.94, lon: 108.44, sub: ['Da Lat', 'Lam Dong', 'Buon Ma Thuot'], notes: 'Dark chocolate, roasted hazelnut, Dalat Arabica' },
    { key: 'india', name: 'India', zone: 'asia', lat: 13.32, lon: 75.77, sub: ['Chikmagalur', 'Coorg', 'Araku Valley'], notes: 'Cardamom, baker cocoa, Monsooned velvet' },
    { key: 'png', name: 'Papua New Guinea', zone: 'asia', lat: -6.08, lon: 145.39, sub: ['Eastern Highlands', 'Wahgi Valley'], notes: 'Mango, cane sugar, crisp orchard fruit' },
    { key: 'yemen', name: 'Yemen', zone: 'africa', lat: 15.17, lon: 43.96, sub: ['Haraz', 'Bani Matar', 'Haima'], notes: 'Ancient terrace dried cherry, cardamom, winey cacao' },
    { key: 'hawaii', name: 'Hawaii (USA)', zone: 'americas', lat: 19.52, lon: -155.92, sub: ['Kona', 'Ka\'u', 'Maui'], notes: 'Volcanic trade-wind brown sugar & sweet citrus' },
    { key: 'jamaica', name: 'Jamaica', zone: 'americas', lat: 18.04, lon: -76.62, sub: ['Blue Mountains'], notes: 'Silky sweet mildness, toasted almond, cocoa' },
    { key: 'china', name: 'China (Yunnan)', zone: 'asia', lat: 22.78, lon: 100.97, sub: ['Pu\'er', 'Baoshan', 'Mengla'], notes: 'Plum, black tea, brown sugar, tropical ferment' },
    { key: 'thailand', name: 'Thailand', zone: 'asia', lat: 19.91, lon: 99.83, sub: ['Chiang Rai', 'Chiang Mai', 'Doi Chang'], notes: 'Lychee, wild honey, sweet brown spice' },
    { key: 'myanmar', name: 'Myanmar', zone: 'asia', lat: 21.15, lon: 96.48, sub: ['Ywangan', 'Pyin Oo Lwin', 'Shan State'], notes: 'Shan Hills strawberry, tamarind, honey' },
    { key: 'laos', name: 'Laos', zone: 'asia', lat: 15.12, lon: 106.25, sub: ['Bolaven Plateau'], notes: 'Herbal cocoa, roasted nut, caramel' },
    { key: 'philippines', name: 'Philippines', zone: 'asia', lat: 16.40, lon: 120.60, sub: ['Benguet', 'Mt. Apo', 'Bukidnon'], notes: 'Liberica (Barako) jackfruit, berry & spice' },
    { key: 'taiwan', name: 'Taiwan', zone: 'asia', lat: 23.51, lon: 120.69, sub: ['Alishan', 'Yunlin'], notes: 'Oolong tea delicacy, white peach, cane sugar' },
    { key: 'timorleste', name: 'Timor-Leste', zone: 'asia', lat: -8.83, lon: 125.43, sub: ['Ermera', 'Ainaro'], notes: 'Molasses, cocoa, herbal smoothness' },
    { key: 'dominican', name: 'Dominican Republic', zone: 'americas', lat: 19.05, lon: -70.66, sub: ['Jarabacoa', 'Barahona'], notes: 'Sweet brown spice, cacao, raisin' },
    { key: 'venezuela', name: 'Venezuela', zone: 'americas', lat: 9.32, lon: -70.25, sub: ['Merida', 'Lara'], notes: 'Sweet panela, almond, mild apricot' },
    { key: 'ivorycoast', name: 'Ivory Coast', zone: 'africa', lat: 7.40, lon: -7.55, sub: ['Man', 'Daloa'], notes: 'Bold cocoa, toasted grain, espresso crema' },
    { key: 'nepal', name: 'Nepal', zone: 'asia', lat: 27.90, lon: 85.15, sub: ['Nuwakot', 'Gulmi'], notes: 'Himalayan spice, honeyed tea, crisp apple' },
    { key: 'puertorico', name: 'Puerto Rico', zone: 'americas', lat: 18.18, lon: -66.75, sub: ['Yauco', 'Adjuntas'], notes: 'Malty caramel, sweet nut, round body' },
    { key: 'australia', name: 'Australia', zone: 'asia', lat: -17.26, lon: 145.48, sub: ['Atherton Tablelands', 'Byron Bay'], notes: 'Clean macadamia sweetness, soft stone fruit' },
    { key: 'malaysia', name: 'Malaysia', zone: 'asia', lat: 1.66, lon: 103.60, sub: ['Johor', 'Sabah'], notes: 'Liberica tropical berry, jackfruit, smoky cocoa' },
    { key: 'lareunion', name: 'La Reunion', zone: 'africa', lat: -21.11, lon: 55.53, sub: ['Bourbon Pointu'], notes: 'Mandarin blossom, delicate low-caffeine sweetness' },
    { key: 'cameroon', name: 'Cameroon', zone: 'africa', lat: 5.96, lon: 10.15, sub: ['Boyo', 'Western Highlands'], notes: 'Rich cocoa, warm spice, full body' },
    { key: 'madagascar', name: 'Madagascar', zone: 'africa', lat: -19.86, lon: 47.03, sub: ['Antananarivo', 'Vatovavy'], notes: 'Vanilla pod, dark cocoa, wild spice' },
    { key: 'zimbabwe', name: 'Zimbabwe', zone: 'africa', lat: -20.20, lon: 32.63, sub: ['Chipinge', 'Eastern Highlands'], notes: 'Zesty orange, dark berry, black tea' },
    { key: 'haiti', name: 'Haiti', zone: 'americas', lat: 18.24, lon: -71.88, sub: ['Thiotte', 'Nord'], notes: 'Mellow chocolate, toasted cashew, low acid' },
    { key: 'cuba', name: 'Cuba', zone: 'americas', lat: 20.03, lon: -76.78, sub: ['Sierra Maestra', 'Escambray'], notes: 'Sweet pipe tobacco, dark cocoa, cedar' },
    { key: 'sierraleone', name: 'Sierra Leone', zone: 'africa', lat: 7.88, lon: -11.19, sub: ['Kenema', 'Kailahun'], notes: 'Coffea stenophylla peach, black tea & honey' },
    { key: 'angola', name: 'Angola', zone: 'africa', lat: -10.85, lon: 14.37, sub: ['Amboim', 'Uige'], notes: 'Earthy cacao, roasted nut, heavy body' },
    { key: 'mozambique', name: 'Mozambique', zone: 'africa', lat: -18.42, lon: 34.05, sub: ['Gorongosa', 'Chimanimani'], notes: 'Rainforest citrus, caramel, sweet spice' },
    { key: 'srilanka', name: 'Sri Lanka', zone: 'asia', lat: 6.95, lon: 80.78, sub: ['Kandy', 'Nuwara Eliya'], notes: 'Ceylon spice, brown sugar, black tea' }
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
    ecuador: { elevation: '1,350–2,100 masl', varietals: 'Sidra, Typica Mejorado, Bourbon', harvest: 'Jun – Oct', terroir: 'Equatorial Andean valleys producing competition-winning Sidra & Mejorado berry-floral cups.' }
  };

  function enrichOriginEntry(base) {
    const m = ORIGIN_TERROIR_META[base.key] || {};
    const defElev = base.zone === 'africa' ? '1,450–2,000 masl' : (base.zone === 'americas' ? '1,200–1,850 masl' : '1,000–1,650 masl');
    const defVar = base.zone === 'africa' ? 'Bourbon, SL-Selections & Local Landraces' : (base.zone === 'americas' ? 'Bourbon, Typica, Caturra & Catuai' : 'Typica, Catimor, S795 & Liberica');
    const defHarv = base.lat >= 0 ? 'Nov – Mar' : 'Apr – Sep';
    return Object.assign({}, base, {
      elevation: base.elevation || m.elevation || defElev,
      varietals: base.varietals || m.varietals || defVar,
      harvest: base.harvest || m.harvest || defHarv,
      terroir: base.terroir || m.terroir || ('Specialty ' + (base.zone === 'africa' ? 'African highland' : (base.zone === 'americas' ? 'New World mountain' : 'Asia-Pacific island/highland')) + ' terroir known for ' + (base.notes || 'distinctive cup character').toLowerCase() + '.')
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
    return globOrigins.map(function (o) {
      const fb = ORIGIN_ATLAS_52.find(function (x) { return x.key === o.key; }) || {};
      const ll = globCoords[o.key] || o.coords || [fb.lat || 0, fb.lon || 0];
      const lon = Number.isFinite(ll[1]) ? ll[1] : (fb.lon || 0);
      const lat = Number.isFinite(ll[0]) ? ll[0] : (fb.lat || 0);
      const zone = fb.zone || (lon < -25 ? 'americas' : (lon < 62 ? 'africa' : 'asia'));
      return enrichOriginEntry({
        key: o.key,
        name: o.name || fb.name || o.key,
        zone: zone,
        lat: lat,
        lon: lon,
        sub: Array.isArray(o.subRegions) && o.subRegions.length ? o.subRegions : (fb.sub || []),
        notes: o.flavor || o.text || fb.notes || 'Distinctive specialty terroir.',
        elevation: o.elevation || o.alt || fb.elevation,
        varietals: Array.isArray(o.varietals) ? o.varietals.join(', ') : (o.varietals || fb.varietals),
        harvest: o.harvest || fb.harvest,
        terroir: o.terroir || o.text || fb.terroir
      });
    });
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
    'Strawberry': { mol: 'Furaneol (HDMF) & Ethyl Butyrate', formula: 'C6H8O3', threshold: '0.4 ug/L', plain: 'Sweet berry-candy aroma common in Natural & Honey lots.', origin: 'Hexose dehydration + esterification driving retronasal OISE sweetness' },
    'Pineapple': { mol: 'Ethyl Hexanoate', formula: 'C8H16O2', threshold: '1.0 ug/L', plain: 'Bright tropical pineapple tang typical of anaerobic & honey fermentations.', origin: 'Anaerobic / carbonic maceration yeast metabolism' },
    'Lemon': { mol: 'Citral (Neral + Geranial)', formula: 'C10H16O', threshold: '3.0 ug/L', plain: 'Crisp lemonade zing in bright washed high-elevation coffees.', origin: 'Terpene aldehydes paired with citric acid protonation' },
    'Caramel': { mol: '4-Hydroxy-2,5-dimethyl-3(2H)-furanone (Furaneol)', formula: 'C6H8O3', threshold: '5.0 ug/L', plain: 'Warm melted-sugar sweetness balanced across medium-light to medium roasts.', origin: 'Maillard sugar fragmentation during medium-light development' },
    'Honey': { mol: 'Phenylacetaldehyde', formula: 'C8H8O', threshold: '4.0 ug/L', plain: 'Floral wildflower honey sweetness.', origin: 'Strecker degradation of L-phenylalanine' },
    'Vanilla': { mol: 'Vanillin', formula: 'C8H8O3', threshold: '20 ug/L', plain: 'Creamy pastry smoothness.', origin: 'Thermal cleavage of ferulic acid / chlorogenic precursors' },
    'Brown Sugar': { mol: 'Sotolon & Maltol', formula: 'C6H8O3', threshold: '0.3 ug/L', plain: 'Panela / demerara cane-sugar warmth.', origin: 'Furanone caramelization imparting maple/panela warmth' },
    'Milk Chocolate': { mol: '3-Methylbutanal & Phenylacetaldehyde', formula: 'C5H10O', threshold: '0.4 ug/L', plain: 'Comforting creamy cocoa bar note.', origin: 'Leucine Strecker aldehyde creating malty cocoa sweetness' },
    'Dark Chocolate': { mol: '2,3-Diethyl-5-methylpyrazine + CGA Lactones', formula: 'C9H14N2', threshold: '0.09 ug/L', plain: '70%+ bittersweet cacao structure.', origin: 'Maillard pyrazine ring formation + Hofmann lactones' },
    'Hazelnut': { mol: 'Filbertone & 2-Ethyl-3,5-dimethylpyrazine', formula: 'C8H14O', threshold: '0.05 ug/L', plain: 'Toasted praline hazelnut classic in Brazilian & Central American lots.', origin: 'Lipid-Maillard interaction classic in Brazilian naturals' },
    'Clove': { mol: '4-Vinylguaiacol', formula: 'C9H10O2', threshold: '3.0 ug/L', plain: 'Warm baking-spice aroma.', origin: 'Decarboxylation of ferulic acid during roasting' },
    'Fresh Roast': { mol: '2-Furfurylthiol (FFT)', shortMol: '2-Furfurylthiol', formula: 'C5H6OS', threshold: '0.01 ug/L', plain: 'Classic freshly-ground coffee shop aroma.', origin: 'Signature roasted-coffee impact thiol; oxidizes fastest in unsealed bags' },
    'Smoky': { mol: 'Guaiacol & 4-Ethylguaiacol', shortMol: 'Guaiacol', formula: 'C7H8O2', threshold: '1.6 ug/L', plain: 'Campfire / dark-roast char note.', origin: 'Lignin pyrolysis past second crack (>224 °C)' }
  };

  function lookupFlavorChemistry(wordText, famName) {
    const w = String(wordText || '').trim();
    const localHit = GCO_MOLECULES[w];
    let extHit = null;
    if (typeof gcMoleculeFor === 'function') {
      try { extHit = gcMoleculeFor(w, famName || ''); } catch (_) { extHit = null; }
    } else if (typeof GC_MOLECULES !== 'undefined' && GC_MOLECULES && GC_MOLECULES[w.toLowerCase()]) {
      extHit = GC_MOLECULES[w.toLowerCase()];
    }
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
    if (extHit) {
      const molStr = extHit.molecule || extHit.mol || extHit.name || 'Aroma Impact Compound';
      return {
        mol: molStr,
        shortMol: molStr.split(' (')[0].split(' & ')[0],
        formula: extHit.formula || 'Volatile Aroma',
        threshold: extHit.threshold || '< 5 ug/L',
        plain: extHit.note || extHit.why || extHit.desc || ('Natural aroma molecule behind ' + w + ' in specialty coffee.'),
        origin: extHit.origin || extHit.source || 'Identified in coffee headspace aroma chemistry'
      };
    }
    const famFallbacks = {
      'Fruity': { mol: 'Ethyl Butyrate & Fruit Esters', shortMol: 'Ethyl butyrate', formula: 'C6H12O2', plain: 'Ripe fruit esters formed during slow cherry maturation & fermentation.' },
      'Floral': { mol: 'Linalool & Geraniol Terpenes', shortMol: 'Linalool', formula: 'C10H18O', plain: 'Delicate blossom terpenes preserved in high-elevation washed coffees.' },
      'Sweet': { mol: 'Furaneol & Maltol Caramelans', shortMol: 'Furaneol', formula: 'C6H8O3', plain: 'Caramelized sugar rings created during Maillard roast development.' },
      'Nutty & Cocoa': { mol: 'Alkylpyrazines & Strecker Aldehydes', shortMol: 'Methylpyrazine', formula: 'C6H8N2', plain: 'Toasted cocoa & nut aromatics formed during gentle drum development.' },
      'Spiced': { mol: '4-Vinylguaiacol & Cineole', shortMol: '4-Vinylguaiacol', formula: 'C9H10O2', plain: 'Warm baking-spice phenols unlocked from chlorogenic precursors.' },
      'Fermented': { mol: 'Ethyl Acetate & Isoamyl Acetate', shortMol: 'Ethyl acetate', formula: 'C7H14O2', plain: 'Juicy winey & tropical esters from extended fruit-contact fermentation.' }
    }[famName || ''] || { mol: 'Retronasal Aroma Ester / Aldehyde', shortMol: 'Aroma Ester', formula: 'GC-O Active', plain: 'Distinctive specialty coffee aroma perceived as warm vapor rises retronasally.' };
    return {
      mol: famFallbacks.mol,
      shortMol: famFallbacks.shortMol,
      formula: famFallbacks.formula,
      threshold: '< 5 ug/L',
      plain: famFallbacks.plain,
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
  const palateState = {
    subSegment: 'dna', /* 'dna' | 'matcher' | 'wheel' */
    mapZoom: 'world',  /* 'world' | 'americas' | 'africa' | 'asia' */
    selectedOriginKey: '',
    timelapsePct: 100,
    expandedBoard: 'origins', /* 'origins' | 'processes' | 'roasts' | 'varietals' | 'brewers' | 'flavors' | 'cafes' */
    drillPath: [],            /* 4-level drill-in: [ { level, key, label } ... ] */
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
      pickedWords: { 'Jasmine': true, 'White Peach': true },
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

  function classifyElevationBand(rOrVal) {
    if (!rOrVal) return '';
    if (typeof rOrVal === 'string' || typeof rOrVal === 'number') {
      if (isUnknownTrait(rOrVal)) return '';
      const s = String(rOrVal).trim().toLowerCase();
      if (s === 'low' || s === 'mid' || s === 'high') return s;
      const numMatch = s.replace(/,/g, '').match(/(\d{3,4})/);
      if (numMatch) {
        const m = parseFloat(numMatch[1]);
        if (Number.isFinite(m) && m >= 100 && m <= 3600) {
          return m < 1300 ? 'low' : (m < 1750 ? 'mid' : 'high');
        }
      }
      if (/ultra|high/i.test(s)) return 'high';
      if (/mid|med/i.test(s)) return 'mid';
      if (/low/i.test(s)) return 'low';
      return '';
    }
    if (!isUnknownTrait(rOrVal.elevation_m)) {
      const mVal = parseFloat(String(rOrVal.elevation_m).replace(/,/g, ''));
      if (Number.isFinite(mVal) && mVal >= 100 && mVal <= 3600) {
        return mVal < 1300 ? 'low' : (mVal < 1750 ? 'mid' : 'high');
      }
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

  function getHistoryRows(slicePct) {
    const stObj = window.BTStorage && typeof window.BTStorage.getHistory === 'function' ? window.BTStorage.getHistory() : null;
    const rawAll = stObj && Array.isArray(stObj.objs) ? stObj.objs : [];
    const raw = rawAll.filter(function (r) {
      if (!r) return false;
      if (r.exclude_learning === true || r.exclude_learning === '1' || r.exclude_learning === 'true') return false;
      if (r.recipe_adaptation_json && typeof r.recipe_adaptation_json === 'string' && r.recipe_adaptation_json.indexOf('"exclude_learning":true') >= 0) return false;
      return true;
    });
    if (!raw.length && palateState.demoMode) {
      return [
        { coffee_id: 'd1', coffee_name: 'Worka Chelbesa', roaster: 'Sey', origin: 'Ethiopia', region: 'Yirgacheffe', process: 'Washed', roast_level: 'light', elevation_m: '1950', varietal: 'Heirloom', brew_method: 'v60', my_rating_stars: '4.9', acidity_intensity: '4', sweetness_intensity: '5', body_intensity: '2', clarity_intensity: '5', flavors_liked: 'Jasmine, Bergamot, White Peach' },
        { coffee_id: 'd2', coffee_name: 'Kirinyaga AA', roaster: 'Tim Wendelboe', origin: 'Kenya', region: 'Kirinyaga', process: 'Washed', roast_level: 'light', elevation_m: '1850', varietal: 'SL28', brew_method: 'v60', my_rating_stars: '4.8', acidity_intensity: '5', sweetness_intensity: '4', body_intensity: '3', clarity_intensity: '5', flavors_liked: 'Blackcurrant, Pink Grapefruit' },
        { coffee_id: 'd3', coffee_name: 'El Paraiso Pink Bourbon', roaster: 'Onyx', origin: 'Colombia', region: 'Cauca', process: 'Anaerobic', roast_level: 'medium-light', elevation_m: '1700', varietal: 'Pink Bourbon', brew_method: 'switch', my_rating_stars: '4.6', acidity_intensity: '4', sweetness_intensity: '5', body_intensity: '4', clarity_intensity: '3', flavors_liked: 'Strawberry, Pineapple, Honey' },
        { coffee_id: 'd4', coffee_name: 'Cerrado Mineiro', roaster: 'Verve', origin: 'Brazil', region: 'Cerrado', process: 'Natural', roast_level: 'medium', elevation_m: '1100', varietal: 'Bourbon', brew_method: 'espresso', my_rating_stars: '4.1', acidity_intensity: '2', sweetness_intensity: '4', body_intensity: '4', clarity_intensity: '3', flavors_liked: 'Hazelnut, Milk Chocolate, Caramel' },
        { coffee_id: 'd5', coffee_name: 'Boquete Esmeralda', roaster: 'La Cabra', origin: 'Panama', region: 'Boquete', process: 'Washed', roast_level: 'ultra-light', elevation_m: '1820', varietal: 'Gesha', brew_method: 'orea', my_rating_stars: '5.0', acidity_intensity: '5', sweetness_intensity: '5', body_intensity: '2', clarity_intensity: '5', flavors_liked: 'Jasmine, Rose, Bergamot' }
      ];
    }
    if (!raw.length) return [];
    const pct = clamp(slicePct, 15, 100, 100);
    if (pct >= 99.5) return raw;
    const keepN = Math.max(1, Math.round((raw.length * pct) / 100));
    return raw.slice(0, keepN);
  }

  function normKey(s) {
    return String(s || '').trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '');
  }

  function normCompact(s) {
    return String(s || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  function rowStar(r) {
    const st = parseFloat(r.my_rating_stars);
    if (Number.isFinite(st) && st > 0) return clamp(st, 0.5, 5.0, 3.5);
    const sc = parseFloat(r.total_score);
    if (Number.isFinite(sc) && sc >= 60) return clamp(2.5 + ((sc - 70) / 22) * 2.5, 0.5, 5.0, 3.5);
    return 3.6;
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
    const nc = normCompact(rawOrigin);
    if (!nc) return '';
    for (let i = 0; i < atlas.length; i++) {
      const o = atlas[i];
      if (nc.indexOf(o.key) >= 0 || nc.indexOf(normCompact(o.name)) >= 0) return o.key;
    }
    return normKey(rawOrigin);
  }

  /* Hierarchical Empirical-Bayes Shrinkage Engine ("Don't Know"-Safe + Elevation + Flavors) */
  function computeBayesianPalate(rows) {
    rows = Array.isArray(rows) ? rows : getHistoryRows();
    const atlas = getFullOriginAtlas();
    const byCoffee = new Map();
    const brewerMap = new Map();
    const likedNotes = new Map();
    const dislikedNotes = new Map();
    const coOccur = new Map();
    const checkExcl = window.BTCoreV6 && typeof window.BTCoreV6.isRowExcludedFromLearning === 'function'
      ? window.BTCoreV6.isRowExcludedFromLearning
      : null;

    rows.forEach(function (r) {
      if (!r || (checkExcl && checkExcl(r))) return;
      const st = rowStar(r);
      const cid = r.coffee_id || (normKey(r.coffee_name) + '|' + normKey(r.roaster)) || ('row_' + Math.random());
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
          ac: [], sw: [], bd: [], cl: []
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
      rec.cups.push({
        coffee: r.coffee_name || 'Logged Brew',
        method: r.brew_method || 'v60',
        date: r.cupping_date || r.brew_date || r.date || '',
        star: st,
        notes: r.flavors_liked || r.words_flavor || r.bag_notes || ''
      });
      if (r.acidity_intensity) rec.ac.push(clamp(parseFloat(r.acidity_intensity), 1, 5, 3));
      if (r.sweetness_intensity) rec.sw.push(clamp(parseFloat(r.sweetness_intensity), 1, 5, 3.5));
      if (r.body_intensity) rec.bd.push(clamp(parseFloat(r.body_intensity), 1, 5, 3));
      if (r.clarity_intensity) rec.cl.push(clamp(parseFloat(r.clarity_intensity), 1, 5, 3.5));

      const mk = isUnknownTrait(r.brew_method) ? 'v60' : (normKey(r.brew_method) || 'v60');
      const bm = brewerMap.get(mk) || { key: mk, label: r.brew_method || mk.toUpperCase(), vals: [], cups: [] };
      bm.vals.push(st);
      bm.cups.push(rec);
      brewerMap.set(mk, bm);

      const userLiked = String(r.flavors_liked || r.words_flavor || '')
        .split(/[,;|]/)
        .map(function (s) { return s.trim(); })
        .filter(function (w) { return !!w && !isUnknownTrait(w); });
      const bagNotesFallback = (!userLiked.length && st >= 3.75 && r.bag_notes && !isUnknownTrait(r.bag_notes))
        ? String(r.bag_notes).split(/[,;|/]/).map(function (s) { return s.trim(); }).filter(function (w) { return !!w && !isUnknownTrait(w); })
        : [];
      const lk = userLiked.length ? userLiked : bagNotesFallback;

      lk.forEach(function (w) {
        const cur = likedNotes.get(w) || { word: w, n: 0, sumStar: 0 };
        cur.n++;
        cur.sumStar += st;
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

    let unknownFilteredCount = 0;
    const coffees = Array.from(byCoffee.values()).map(function (c) {
      if (!c.origin || !c.process || !c.roast || !c.elevationBand) unknownFilteredCount++;
      c.dialScore = (window.BTCoreV6 && typeof window.BTCoreV6.computeRobustBagDialScore === 'function')
        ? window.BTCoreV6.computeRobustBagDialScore(c.stars)
        : computeRobustBagDialScoreLocal(c.stars);
      return c;
    });

    const nC = coffees.length;
    const globalMean = nC
      ? coffees.reduce(function (acc, c) { return acc + c.dialScore; }, 0) / nC
      : 3.95;

    let wSum = 0, acSum = 0, swSum = 0, bdSum = 0, rstSum = 0, fnkSum = 0;
    coffees.forEach(function (c) {
      const w = Math.max(0.15, c.dialScore - 2.5);
      wSum += w;
      const ac = c.ac.length
        ? c.ac[0]
        : (!c.roast ? (c.elevationBand === 'high' ? 4.1 : 3.4) : (c.roast.indexOf('light') >= 0 ? 4.2 : 2.8));
      const sw = c.sw.length ? c.sw[0] : 4.2;
      const bd = c.bd.length
        ? c.bd[0]
        : (!c.process ? 3.2 : (c.process.indexOf('natural') >= 0 ? 3.9 : 2.8));
      const rst = !c.roast
        ? 2.8
        : (c.roast.indexOf('dark') >= 0 ? 4.5 : (c.roast === 'medium' ? 3.3 : (c.roast.indexOf('ultra') >= 0 ? 1.4 : 2.1)));
      const fnk = !c.process
        ? 2.8
        : (/anaerobic|carbonic|natural|ferment/.test(c.process) ? 4.2 : 2.1);
      acSum += w * ac;
      swSum += w * sw;
      bdSum += w * bd;
      rstSum += w * rst;
      fnkSum += w * fnk;
    });

    const shrink = nC / (nC + 3);
    const axes = [
      { key: 'acidity', label: 'Acidity', val: nC ? shrink * (acSum / wSum) + (1 - shrink) * palateState.seedAcidity : palateState.seedAcidity },
      { key: 'sweetness', label: 'Sweetness', val: nC ? shrink * (swSum / wSum) + (1 - shrink) * palateState.seedSweetness : palateState.seedSweetness },
      { key: 'body', label: 'Body Weight', val: nC ? shrink * (bdSum / wSum) + (1 - shrink) * palateState.seedBody : palateState.seedBody },
      { key: 'roast', label: 'Roast Depth', val: nC ? shrink * (rstSum / wSum) + (1 - shrink) * palateState.seedRoast : palateState.seedRoast },
      { key: 'funk', label: 'Funk vs Clarity', val: nC ? shrink * (fnkSum / wSum) + (1 - shrink) * palateState.seedFunk : palateState.seedFunk }
    ];
    const ciHalf = clamp(0.75 / Math.sqrt(Math.max(1, nC)), 0.14, 0.72, 0.45);

    /* Shrinkage Leaderboard: Raw Mean vs Shrinkage-Adjusted True Affinity (n/(n+k)) — Strictly Skips Unknown/Empty */
    function buildTraitLeaderboard(extractKeyFn, priorK) {
      const kPrior = priorK || 2.5;
      const buckets = new Map();
      coffees.forEach(function (c) {
        const k = extractKeyFn(c);
        if (!k || isUnknownTrait(k)) return;
        const b = buckets.get(k) || { key: k, vals: [], bags: [] };
        b.vals.push(c.dialScore);
        b.bags.push(c);
        buckets.set(k, b);
      });
      const items = Array.from(buckets.values()).map(function (b) {
        const n = b.vals.length;
        const sum = b.vals.reduce(function (a, v) { return a + v; }, 0);
        const rawMean = sum / Math.max(1, n);
        const confWeight = n / (n + kPrior);
        const postMean = confWeight * rawMean + (1 - confWeight) * globalMean;
        const se = 0.55 / Math.sqrt(n + kPrior);
        const lcb80 = postMean - 1.28 * se;
        return {
          key: b.key,
          n: n,
          rawMean: +rawMean.toFixed(2),
          mean: +postMean.toFixed(2),
          confPct: Math.round(confWeight * 100),
          ciLo: +Math.max(1, postMean - 1.28 * se).toFixed(2),
          ciHi: +Math.min(5, postMean + 1.28 * se).toFixed(2),
          lcb80: lcb80,
          bags: b.bags
        };
      });
      items.sort(function (a, b) { return b.mean - a.mean || b.lcb80 - a.lcb80; });
      return items;
    }

    const originBoard = buildTraitLeaderboard(function (c) { return c.origin || ''; }, 2.5);
    const processBoard = buildTraitLeaderboard(function (c) { return c.process || ''; }, 2.5);
    const roastBoard = buildTraitLeaderboard(function (c) { return c.roast || ''; }, 2.5);
    const elevationBoard = buildTraitLeaderboard(function (c) { return c.elevationBand || ''; }, 2.5);
    const varietalBoard = buildTraitLeaderboard(function (c) { return c.varietal || ''; }, 2.5);
    const brewerBoard = Array.from(brewerMap.values()).map(function (bm) {
      const n = bm.vals.length;
      const sum = bm.vals.reduce(function (a, v) { return a + v; }, 0);
      const rawMean = sum / Math.max(1, n);
      const confWeight = n / (n + 2.5);
      const post = confWeight * rawMean + (1 - confWeight) * globalMean;
      const se = 0.55 / Math.sqrt(n + 2.5);
      return {
        key: bm.label,
        n: n,
        rawMean: +rawMean.toFixed(2),
        mean: +post.toFixed(2),
        confPct: Math.round(confWeight * 100),
        ciLo: +Math.max(1, post - 1.28 * se).toFixed(2),
        ciHi: +Math.min(5, post + 1.28 * se).toFixed(2),
        bags: bm.cups
      };
    }).sort(function (a, b) { return b.mean - a.mean; });

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
      totalRows: rows.length,
      uniqueCoffees: nC,
      unknownFilteredCount: unknownFilteredCount,
      coffees: coffees,
      globalMean: +globalMean.toFixed(2),
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

  function buildPrefsMyGearCard() {
    const a = getApp();
    const rawGrinderKey = String((a.brew && a.brew.grinderKey) || (a.prefs && a.prefs.gear && (a.prefs.gear.grinderKey || a.prefs.gear.grinder)) || 'comandante-c40').trim().toLowerCase();
    const grinderCatalog = (Array.isArray(window.GRINDERS_ALL_V6) && window.GRINDERS_ALL_V6.length)
      ? window.GRINDERS_ALL_V6
      : (Array.isArray(window.GRINDERS) ? window.GRINDERS : []);
    const gHit = grinderCatalog.find(function (g) { return g && g.key === rawGrinderKey; });
    const grinderLabel = (gHit && (gHit.short || gHit.name)) || rawGrinderKey.replace(/[-_]+/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });

    const ownedArr = (a.prefs && Array.isArray(a.prefs.ownedBrewers) && a.prefs.ownedBrewers.length)
      ? a.prefs.ownedBrewers
      : (a.prefs && a.prefs.gear && Array.isArray(a.prefs.gear.ownedBrewers) && a.prefs.gear.ownedBrewers.length)
      ? a.prefs.gear.ownedBrewers
      : ['v60', 'origami', 'aeropress', 'switch', 'press', 'espresso', 'philips5500', 'aiden'];
    const activeMethodKey = String((a.brew && a.brew.method) || 'v60').trim().toLowerCase();
    const methodCatalog = Array.isArray(window.METHOD_PHYSICS_V6) ? window.METHOD_PHYSICS_V6 : [];
    const mHit = methodCatalog.find(function (m) { return m && m.key === activeMethodKey; });
    const activeMethodLabel = (mHit && (mHit.short || mHit.label)) || activeMethodKey.replace(/[-_]+/g, ' ').toUpperCase();

    const rawWater = (a.brew && a.brew.waterLabel)
      || (a.prefs && a.prefs.waterProfileKey)
      || (a.prefs && a.prefs.gear && (a.prefs.gear.waterProfileKey || a.prefs.gear.waterType))
      || 'Regular Tap';
    const waterLabel = String(rawWater).replace(/[_-]+/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });

    const bleLabels = [];
    try {
      if (window.BTBle && typeof window.BTBle.getState === 'function') {
        const bst = window.BTBle.getState() || {};
        const sl = bst.slots || {};
        if ((sl.scale && sl.scale.connected) || bst.scaleConnected) bleLabels.push('Scale');
        if ((sl.kettle && sl.kettle.connected) || bst.kettleConnected) bleLabels.push('Kettle');
        if ((sl.refractometer && sl.refractometer.connected) || bst.refractometerConnected || (sl.refract && sl.refract.connected) || bst.refractConnected) bleLabels.push('R2');
        if ((sl.pressure && sl.pressure.connected) || bst.pressureConnected) bleLabels.push('Pressure');
        if ((sl.omni && sl.omni.connected) || bst.omniConnected) bleLabels.push('Omni');
      }
    } catch (_) {}

    function openGearSheet(sheetKey, titleTxt) {
      CK.haptic('tick');
      const shell = sh();
      if (shell.BTSheet && typeof shell.BTSheet.open === 'function') {
        shell.BTSheet.open(sheetKey, {}, { detent: 'full', title: titleTxt });
      } else if (typeof shell.openSheet === 'function') {
        shell.openSheet(sheetKey, {}, { detent: 'full', title: titleTxt });
      }
    }

    return domH('section', { class: 'bt-studio-card bt-prefs-gear-card', id: 'bt-prefs-my-gear-card' },
      domH('div', { class: 'bt-lab-card-head' },
        domH('div', { class: 'bt-lab-title-group', style: 'min-width:0;flex:1 1 210px' },
          ic('sliders', { size: 22 }),
          domH('div', { style: 'min-width:0;flex:1 1 160px' },
            domH('h3', { text: 'My Gear & Active Hardware' }),
            domH('p', {
              class: 'bt-lab-sub',
              text: 'Your active grinder, saved counter brewers, brew water & Bluetooth hardware in one tap.'
            })
          )
        ),
        domH('span', {
          class: 'bt-badge-v62 ' + (bleLabels.length ? 'is-good' : 'is-muted'),
          text: bleLabels.length ? ('BLE Live: ' + bleLabels.join(', ')) : 'BLE Ready'
        })
      ),
      domH('div', { class: 'bt-prefs-gear-grid' },
        domH('div', { class: 'bt-prefs-gear-tile' },
          domH('span', { class: 'bt-pref-tile-lbl', text: 'Active Grinder' }),
          domH('strong', { class: 'bt-pref-tile-val', text: grinderLabel }),
          domH('span', { class: 'bt-pref-tile-sub', text: 'Used for Step 2 & Step 3 clicks' })
        ),
        domH('div', { class: 'bt-prefs-gear-tile' },
          domH('span', { class: 'bt-pref-tile-lbl', text: 'Counter Brewers' }),
          domH('strong', { class: 'bt-pref-tile-val', text: ownedArr.length + ' Saved · ' + activeMethodLabel }),
          domH('span', { class: 'bt-pref-tile-sub', text: 'Shown first in Brew Step 2' })
        ),
        domH('div', { class: 'bt-prefs-gear-tile' },
          domH('span', { class: 'bt-pref-tile-lbl', text: 'Kettle & Brew Water' }),
          domH('strong', { class: 'bt-pref-tile-val', text: waterLabel }),
          domH('span', { class: 'bt-pref-tile-sub', text: bleLabels.indexOf('Kettle') >= 0 ? 'Stagg EKG BLE active' : 'Tap Edit to tune GH/KH' })
        ),
        domH('div', { class: 'bt-prefs-gear-tile' },
          domH('span', { class: 'bt-pref-tile-lbl', text: 'Bluetooth Hardware' }),
          domH('strong', { class: 'bt-pref-tile-val', text: bleLabels.length ? bleLabels.join(' · ') : 'Ready to Pair' }),
          domH('span', { class: 'bt-pref-tile-sub', text: 'Scales, R2, Stagg EKG, Omni, xBloom' })
        )
      ),
      domH('div', { class: 'bt-prefs-gear-actions' },
        domH('button', {
          type: 'button',
          id: 'bt-prefs-edit-gear-btn',
          class: 'bt-lab-btn is-primary is-sm',
          onclick: function () { openGearSheet('workflow-tools', 'My Gear & Setup'); }
        }, ic('sliders', { size: 15 }), domH('span', { text: 'Edit Grinder, Brewers, Kettle & Water' })),
        domH('button', {
          type: 'button',
          id: 'bt-prefs-pair-ble-btn',
          class: 'bt-lab-btn is-sm',
          onclick: function () { openGearSheet('ble-devices', 'Bluetooth Scales, R2, Omni & Smart Gear'); }
        }, ic('ble-wave', { size: 15 }), domH('span', { text: 'Pair Bluetooth Gear' }))
      )
    );
  }

  /* ==========================================================================
   * SEGMENT 1: Coffee Belt World Map (52 Origins) + Radar + 4-Level EB Drill-In
   * ========================================================================== */
  function buildPalateGoldenShowcase(allRows) {
    if (!Array.isArray(allRows) || allRows.length === 0 || palateState.demoMode) return null;
    const un = function (v) { return typeof unneutralize === 'function' ? unneutralize(v || '') : String(v || ''); };
    const candidates = [];
    allRows.forEach(function (r, idx) {
      if (!r || !r.coffee_name) return;
      const isGold = r.dial_locked === 'yes' || r.dial_locked === '1';
      const stars = parseFloat(r.my_rating_stars) || 0;
      if (!isGold && stars < 4.5) return;
      candidates.push({ r: r, idx: idx, isGold: isGold, stars: stars, sca: parseFloat(r.total_score) || 0 });
    });
    if (!candidates.length) return null;
    candidates.sort(function (a, b) {
      if (a.isGold !== b.isGold) return a.isGold ? -1 : 1;
      if (Math.abs(b.stars - a.stars) > 0.01) return b.stars - a.stars;
      if (Math.abs(b.sca - a.sca) > 0.1) return b.sca - a.sca;
      return b.idx - a.idx;
    });
    const seen = Object.create(null);
    const top3 = [];
    for (let i = 0; i < candidates.length && top3.length < 3; i++) {
      const r = candidates[i].r;
      const k = (un(r.coffee_name) + '|' + un(r.roaster || '') + '|' + String(r.brew_method || '')).toLowerCase();
      if (seen[k]) continue;
      seen[k] = true;
      top3.push(r);
    }
    if (!top3.length) return null;

    function quickBrewFromPalate(r) {
      if (window.BTCellarTab && typeof window.BTCellarTab.hydrateAndBrewRow === 'function') {
        window.BTCellarTab.hydrateAndBrewRow(r);
        return;
      }
      const applyFn = function (a) {
        a.coffee = Object.assign(a.coffee || {}, {
          coffee_id: r.coffee_id || (a.coffee && a.coffee.coffee_id) || '',
          name: un(r.coffee_name) || 'Golden Brew',
          roaster: un(r.roaster),
          origin: un(r.origin),
          process: un(r.process),
          roast: un(r.roast_level) || 'light',
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

    return domH('section', { class: 'bt-studio-card bt-golden-showcase', id: 'bt-palate-golden-showcase', 'aria-label': 'Best and Golden Recipes' },
      domH('div', { class: 'bt-lab-card-head' },
        domH('div', { class: 'bt-lab-title-group', style: 'min-width:0;flex:1 1 200px' },
          ic('spark-star', { size: 22 }),
          domH('div', { style: 'min-width:0;flex:1 1 160px' },
            domH('h3', { text: 'Best & Golden Recipes' }),
            domH('p', { class: 'bt-lab-sub', text: 'Your top 4.5+ and Golden-locked brews — launch any champion recipe in 1 tap.' })
          )
        ),
        domH('span', { class: 'bt-tc-badge is-gold', text: top3.length + ' Top Brew' + (top3.length === 1 ? '' : 's') })
      ),
      domH('div', {
        class: 'bt-golden-showcase-grid',
        style: 'display:grid;grid-template-columns:repeat(auto-fit,minmax(205px,1fr));gap:9px;margin-top:8px;min-width:0'
      },
        top3.map(function (r) {
          const isGold = r.dial_locked === 'yes' || r.dial_locked === '1';
          const stars = parseFloat(r.my_rating_stars) || 0;
          const cName = un(r.coffee_name) || 'Golden Brew';
          const rName = un(r.roaster);
          const tempC = +r.brew_temp_c > 0 ? Math.round(+r.brew_temp_c) : (+r.brew_temp_f > 0 ? Math.round((+r.brew_temp_f - 32) * 5 / 9) : 0);
          const specs = [
            String(r.brew_method || 'v60').toUpperCase(),
            (r.brew_dose_g && r.brew_water_g) ? (r.brew_dose_g + 'g:' + r.brew_water_g + 'g') : '',
            un(r.brew_grind_setting) || (r.brew_grind_target_um ? (r.brew_grind_target_um + ' \u00B5m') : ''),
            tempC > 0 ? (tempC + '\u00B0C') : ''
          ].filter(Boolean).join(' \u00B7 ');
          return domH('article', {
            class: 'bt-lab-subcard bt-golden-showcase-item',
            style: 'display:flex;flex-direction:column;justify-content:space-between;gap:8px;min-width:0'
          },
            domH('div', { style: 'display:flex;align-items:flex-start;justify-content:space-between;gap:6px;flex-wrap:wrap' },
              domH('div', { style: 'min-width:0;flex:1' },
                rName ? domH('span', { class: 'bt-pref-tile-lbl', style: 'display:block', text: rName }) : null,
                domH('strong', { style: 'display:block;font-size:0.92rem;overflow-wrap:anywhere', text: cName })
              ),
              domH('span', {
                class: 'bt-tc-badge num-tab ' + (isGold ? 'is-gold' : 'is-good'),
                text: (isGold ? 'Golden' : '') + (isGold && stars > 0 ? ' \u00B7 ' : '') + (stars > 0 ? (stars.toFixed(2) + ' / 5') : '')
              })
            ),
            domH('span', { class: 'bt-lab-hint num-tab', text: specs }),
            domH('button', {
              type: 'button',
              class: 'bt-lab-btn is-sm is-primary',
              text: 'Brew \u2192',
              onclick: function () { quickBrewFromPalate(r); }
            })
          );
        })
      )
    );
  }

  function renderPalateDnaSegment() {
    const wrap = domH('div', { class: 'bt-palate-seg' });
    wrap.appendChild(buildPrefsMyGearCard());
    const atlas = getFullOriginAtlas();
    const allRows = getHistoryRows(100);
    const slicedRows = getHistoryRows(palateState.timelapsePct);
    const bayes = computeBayesianPalate(slicedRows);

    /* Cold-Start Seed Banner if 0 tastings */
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
          onclick: function () { palateState.demoMode = false; rerenderPalateTab(); }
        }, 'Viewing Sample Palate Lens — Tap to Return to Live History')
      ));
    }

    /* 0. Your Top Coffee Preferences Summary Cards (Roast, Process, Origin, Elevation, Flavor Notes, Brewer) */
    const topRoastHit = bayes.roastBoard[0] || null;
    const topProcHit = bayes.processBoard[0] || null;
    const topOrigHit = bayes.originBoard[0] || null;
    const topOrigMeta = topOrigHit ? (atlas.find(function (o) { return o.key === topOrigHit.key; }) || { name: topOrigHit.key }) : null;
    const topElevHit = bayes.elevationBoard[0] || null;
    const topElevDef = topElevHit ? (ELEVATION_BAND_DEFS[topElevHit.key] || { label: topElevHit.key }) : null;
    const topFlavors3 = bayes.topFlavorNotes.slice(0, 3).map(function (f) { return f.word; });
    const topBrewerHit = bayes.brewerBoard[0] || null;

    const prefTiles = [
      {
        lbl: 'Favorite Roast',
        val: topRoastHit ? formatRoastHuman(topRoastHit.key) : 'Awaiting Known Roast',
        sub: topRoastHit ? (topRoastHit.mean.toFixed(2) + '/5.0 · ' + topRoastHit.n + ' bag' + (topRoastHit.n === 1 ? '' : 's')) : 'Pick roast on Step 1',
        board: 'roasts'
      },
      {
        lbl: 'Favorite Process',
        val: topProcHit ? formatProcessHuman(topProcHit.key) : 'Awaiting Known Process',
        sub: topProcHit ? (topProcHit.mean.toFixed(2) + '/5.0 · ' + topProcHit.n + ' bag' + (topProcHit.n === 1 ? '' : 's')) : 'Washed, Natural, Honey...',
        board: 'processes'
      },
      {
        lbl: 'Top Origin',
        val: topOrigMeta ? topOrigMeta.name : 'Explore 52 Origins',
        sub: topOrigHit ? (topOrigHit.mean.toFixed(2) + '/5.0 · ' + topOrigHit.n + ' bag' + (topOrigHit.n === 1 ? '' : 's')) : 'Tap World Belt map below',
        board: 'origins'
      },
      {
        lbl: 'Sweet-Spot Elevation',
        val: topElevDef ? topElevDef.label : 'Awaiting Elevation',
        sub: topElevHit ? (topElevHit.mean.toFixed(2) + '/5.0 · ' + topElevHit.n + ' bag' + (topElevHit.n === 1 ? '' : 's')) : '<1,300m · 1,300\u20131,750m · 1,750m+',
        board: 'elevations'
      },
      {
        lbl: 'Top Flavor Notes',
        val: topFlavors3.length ? topFlavors3.join(', ') : 'Awaiting Flavor Tags',
        sub: topFlavors3.length ? (bayes.topFlavorNotes[0].mean.toFixed(2) + '/5.0 top note match') : 'Tag notes on Step 1 or Step 5',
        board: 'flavors'
      },
      {
        lbl: 'Favorite Brewer',
        val: topBrewerHit ? String(topBrewerHit.key).toUpperCase() : 'Ready on Counter',
        sub: topBrewerHit ? (topBrewerHit.mean.toFixed(2) + '/5.0 · ' + topBrewerHit.n + ' cup' + (topBrewerHit.n === 1 ? '' : 's')) : 'Log your first brew',
        board: 'brewers'
      }
    ];

    const prefsCard = domH('section', { class: 'bt-studio-card bt-prefs-summary-card', id: 'bt-top-preferences-card' },
      domH('div', { class: 'bt-lab-card-head' },
        domH('div', { class: 'bt-lab-title-group', style: 'min-width:0;flex:1 1 210px' },
          ic('palate', { size: 22 }),
          domH('div', { style: 'min-width:0;flex:1 1 160px' },
            domH('h3', { text: 'Your Top Coffee Preferences' }),
            domH('p', {
              class: 'bt-lab-sub',
              text: 'Learned from your rated cups — any field marked "Don\'t Know" is automatically filtered out so unknown bags never skew your scores.'
            })
          )
        ),
        domH('button', {
          type: 'button',
          class: 'bt-lab-btn is-sm is-primary',
          onclick: function () {
            jumpToPalate('matcher');
          }
        }, 'Will I Love This Bag? \u2192')
      ),
      domH('div', { class: 'bt-prefs-summary-grid' },
        prefTiles.map(function (pt) {
          return domH('button', {
            type: 'button',
            class: 'bt-pref-summary-tile',
            onclick: function () {
              palateState.expandedBoard = pt.board;
              palateState.drillPath = [];
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
            domH('span', { class: 'bt-pref-tile-sub num-tab', text: pt.sub })
          );
        })
      ),
      bayes.unknownFilteredCount > 0 ? domH('div', { class: 'bt-prefs-hygiene-note' },
        ic('check-seal', { size: 15 }),
        domH('span', {
          text: '"Don\'t Know" Preference Shield Active: ' + bayes.unknownFilteredCount + ' bag(s) with unlisted origin, roast, process, or elevation kept your cup rating while skipping unknown fields cleanly.'
        })
      ) : null
    );
    wrap.appendChild(prefsCard);
    const palateGolden = buildPalateGoldenShowcase(allRows);
    if (palateGolden) wrap.appendChild(palateGolden);

    /* 1. Real Cartographic Coffee Belt World Map (52 Origins + 4 Regional Zoom Pills) */
    const mapCard = domH('section', { class: 'bt-studio-card', id: 'bt-palate-world-map' });
    const byOriginScore = new Map();
    bayes.originBoard.forEach(function (b) { byOriginScore.set(b.key, b); });
    const tastedCount = byOriginScore.size;

    const activeZoom = MAP_ZOOM_REGIONS.find(function (z) { return z.key === palateState.mapZoom; }) || MAP_ZOOM_REGIONS[0];
    const isZoomed = activeZoom.key !== 'world';

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
      lblCan.textContent = '23.5°N Tropic of Cancer';
      mapSvg.appendChild(lblCan);
      const lblEq = CK.svgEl('text', { x: '10', y: (yEquator - 3).toFixed(1), class: 'bt-map-lat-lbl' });
      lblEq.textContent = '0° Equator';
      mapSvg.appendChild(lblEq);
      const lblCap = CK.svgEl('text', { x: '10', y: (yCapricorn + 9).toFixed(1), class: 'bt-map-lat-lbl' });
      lblCap.textContent = '23.5°S Tropic of Capricorn';
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
        ? (eb.rawMean.toFixed(2) + ' / 5.0 avg (' + eb.n + ' bag' + (eb.n === 1 ? '' : 's') + ' · Weighted ' + eb.mean.toFixed(2) + ')')
        : 'Unexplored — brew 1 bag to earn this stamp!';

      mapInfoBox.appendChild(domH('article', { class: 'bt-origin-passport-card', id: 'bt-origin-passport-card' },
        domH('div', { class: 'bt-passport-head' },
          domH('div', { class: 'bt-passport-title-wrap' },
            domH('span', { class: 'bt-forecast-kicker', text: 'ORIGIN PASSPORT · ' + origObj.zone.toUpperCase() }),
            domH('h4', { class: 'bt-passport-country', text: origObj.name }),
            domH('p', { class: 'bt-passport-terroir', text: origObj.terroir })
          ),
          domH('button', {
            type: 'button',
            class: 'bt-lab-btn is-sm bt-passport-back-btn',
            onclick: resetMapAndSelection
          }, 'Close Passport \u00D7')
        ),
        domH('div', { class: 'bt-passport-grid' },
          domH('div', { class: 'bt-passport-tile' },
            domH('span', { class: 'bt-passport-lbl', text: 'Famed Regions & Cup Notes' }),
            domH('strong', { text: regionsTxt }),
            domH('span', { class: 'bt-passport-note', text: origObj.notes })
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

    /* Plot all 52 Origins Colored by Empirical-Bayes Affinity */
    const pinsG = CK.svgEl('g', { class: 'bt-map-pins' });
    atlas.forEach(function (orig) {
      const eb = byOriginScore.get(orig.key);
      const earned = !!eb;
      const isFavorite = eb && eb.mean >= bayes.globalMean + 0.12;
      const cx = projLonX(orig.lon);
      const cy = projLatY(orig.lat);
      const rVis = isZoomed ? (earned ? 3.8 : 2.5) : (earned ? 5.6 : 3.3);
      const rHit = isZoomed ? 7.5 : 11.5;

      const pinG = CK.svgEl('g', {
        transform: 'translate(' + cx.toFixed(1) + ',' + cy.toFixed(1) + ')',
        class: 'bt-map-pin-g',
        tabindex: '0',
        role: 'button',
        'aria-label': orig.name + (eb ? (' (' + eb.mean.toFixed(2) + '/5.0 affinity)') : ' (Unexplored)')
      });
      pinG.appendChild(CK.svgEl('circle', { r: rHit.toFixed(1), fill: 'transparent' }));
      pinG.appendChild(CK.svgEl('circle', {
        r: rVis.toFixed(1),
        class: 'bt-map-pin' + (isFavorite ? ' is-fav' : (earned ? ' is-stamped' : '')) +
          (palateState.selectedOriginKey === orig.key ? ' is-selected' : '')
      }));
      if (isZoomed && (earned || orig.key === palateState.selectedOriginKey)) {
        const plbl = CK.svgEl('text', { x: '0', y: (-rVis - 2.5).toFixed(1), 'text-anchor': 'middle', class: 'bt-map-pin-lbl' });
        plbl.textContent = orig.name;
        pinG.appendChild(plbl);
      }
      pinG.addEventListener('click', function () {
        palateState.selectedOriginKey = orig.key;
        if (eb) {
          palateState.expandedBoard = 'origins';
          palateState.drillPath = [{ level: 'origin', key: orig.key, label: orig.name }];
        }
        CK.haptic('tick');
        rerenderPalateTab();
      });
      pinsG.appendChild(pinG);
    });
    mapSvg.appendChild(pinsG);

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
          palateState.selectedOriginKey = qk;
          if (byOriginScore.has(qk)) {
            palateState.expandedBoard = 'origins';
            palateState.drillPath = [{ level: 'origin', key: qk, label: meta.name }];
          }
          CK.haptic('snap');
          rerenderPalateTab();
        }
      }, meta.name);
    });

    const all52Select = domH('select', {
      class: 'bt-lab-select bt-map-origin-select',
      'aria-label': 'Jump to any of the 52 coffee-producing countries',
      onchange: function () {
        const val = all52Select.value;
        palateState.selectedOriginKey = val;
        const picked = atlas.find(function (o) { return o.key === val; });
        if (picked && byOriginScore.has(val)) {
          palateState.expandedBoard = 'origins';
          palateState.drillPath = [{ level: 'origin', key: val, label: picked.name }];
        }
        CK.haptic('tick');
        rerenderPalateTab();
      }
    },
      domH('option', { value: '', text: 'All 52 Countries A–Z...' }),
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
              ? '23.5°N to 23.5°S Bean Belt colored by Empirical-Bayes preference — zoom any continent or tap a pin'
              : '23.5°N to 23.5°S Coffee Belt colored by your personal ratings — tap any pin or country pill for its Passport Card'
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

    /* 2. Confidence-Weighted Affinity & 4-Level Interactive Drill-In */
    const boardsCard = domH('section', { class: 'bt-studio-card', id: 'bt-palate-eb-boards' });
    const boardTabs = [
      { k: 'origins', lbl: 'Origin (' + atlas.length + ')' },
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

    /* 4-Level Drill-In: Level 0 (Trait Board) -> Level 1 (Region/Sub-group) -> Level 2 (Process) -> Level 3 (Logged Cups) */
    function paintDrillDownView() {
      const path = palateState.drillPath;
      const rootType = palateState.expandedBoard;
      let matchingBags = bayes.coffees.slice();

      /* Filter bags down the drill path */
      path.forEach(function (step) {
        if (step.level === 'origin') matchingBags = matchingBags.filter(function (c) { return c.origin === step.key; });
        else if (step.level === 'region') matchingBags = matchingBags.filter(function (c) { return c.region === step.key; });
        else if (step.level === 'process') matchingBags = matchingBags.filter(function (c) { return c.process === step.key; });
        else if (step.level === 'roast') matchingBags = matchingBags.filter(function (c) { return c.roast === step.key; });
        else if (step.level === 'elevation') matchingBags = matchingBags.filter(function (c) { return c.elevationBand === step.key; });
        else if (step.level === 'varietal') matchingBags = matchingBags.filter(function (c) { return c.varietal === step.key; });
        else if (step.level === 'brewer') {
          matchingBags = matchingBags.filter(function (c) {
            return c.cups.some(function (cp) { return (cp.method || '').toLowerCase() === step.key.toLowerCase(); });
          });
        }
      });

      if (!matchingBags.length) {
        boardHost.appendChild(domH('p', { class: 'bt-lab-hint', text: 'No logged brews in this slice yet — brew a bag from this terroir to populate all 4 drill-down levels!' }));
        return;
      }

      /* Level 1 -> Group by Sub-Region (if started from Origin) or Origin (if started from Process/Roast/Varietal/Brewer) */
      if (path.length === 1) {
        const nextField = rootType === 'origins' ? 'region' : 'origin';
        const groups = new Map();
        matchingBags.forEach(function (b) {
          const gk = b[nextField] || 'General';
          const cur = groups.get(gk) || { key: gk, label: gk.charAt(0).toUpperCase() + gk.slice(1), vals: [] };
          cur.vals.push(b.dialScore);
          groups.set(gk, cur);
        });
        Array.from(groups.values()).forEach(function (g) {
          const n = g.vals.length;
          const rawM = g.vals.reduce(function (a, v) { return a + v; }, 0) / n;
          const postM = (n * rawM + 2.0 * bayes.globalMean) / (n + 2.0);
          boardHost.appendChild(domH('button', {
            type: 'button',
            class: 'bt-trait-row is-drillable',
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
        return;
      }

      /* Level 2 -> Group by Process */
      if (path.length === 2) {
        const pGroups = new Map();
        matchingBags.forEach(function (b) {
          const pk = b.process || 'washed';
          const cur = pGroups.get(pk) || { key: pk, label: pk.charAt(0).toUpperCase() + pk.slice(1), vals: [] };
          cur.vals.push(b.dialScore);
          pGroups.set(pk, cur);
        });
        Array.from(pGroups.values()).forEach(function (pg) {
          const n = pg.vals.length;
          const rawM = pg.vals.reduce(function (a, v) { return a + v; }, 0) / n;
          boardHost.appendChild(domH('button', {
            type: 'button',
            class: 'bt-trait-row is-drillable',
            onclick: function () {
              palateState.drillPath.push({ level: 'process', key: pg.key, label: pg.label });
              CK.haptic('tick');
              paintActiveBoard();
            }
          },
            domH('span', { class: 'bt-trait-name', text: pg.label + ' Process — View Cups \u2192' }),
            domH('span', { class: 'bt-trait-stat num-tab', text: rawM.toFixed(2) + '/5.0 (' + n + ' bag(s))' })
          ));
        });
        return;
      }

      /* Level 3 (4th Tier) -> Individual Logged Cups */
      matchingBags.forEach(function (bag) {
        bag.cups.forEach(function (cp) {
          boardHost.appendChild(domH('div', { class: 'bt-trait-row' },
            domH('div', null,
              domH('strong', { text: bag.name + (bag.roaster ? (' · ' + bag.roaster) : '') }),
              domH('p', { class: 'bt-lab-hint', text: (cp.method || 'Brew').toUpperCase() + (cp.date ? (' · ' + cp.date) : '') + (cp.notes ? (' · ' + cp.notes) : '') })
            ),
            domH('span', { class: 'bt-trait-stat num-tab', text: cp.star.toFixed(2) + ' / 5.0' })
          ));
        });
      });
    }

    function paintActiveBoard() {
      boardHost.textContent = '';
      renderBreadcrumbs();
      if (palateState.drillPath.length > 0) {
        paintDrillDownView();
        return;
      }

      const bk = palateState.expandedBoard;
      if (bk === 'flavors') {
        const likedArr = Array.from(bayes.likedNotes.values()).sort(function (a, b) { return b.n - a.n; });
        if (!likedArr.length) {
          boardHost.appendChild(domH('p', { class: 'bt-lab-hint', text: 'Tag tasting notes after your brews to reveal your Mix & Match flavor polarization.' }));
          return;
        }
        likedArr.slice(0, 16).forEach(function (item) {
          const dis = bayes.dislikedNotes.get(item.word) || 0;
          const rawMean = item.sumStar / item.n;
          const conf = Math.round((item.n / (item.n + 2.5)) * 100);
          const shrMean = (item.n * rawMean + 2.5 * bayes.globalMean) / (item.n + 2.5);
          boardHost.appendChild(domH('div', { class: 'bt-trait-row' },
            domH('span', { class: 'bt-trait-name', text: item.word }),
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
            domH('strong', { class: 'num-tab', text: bayes.totalRows + ' cups · ' + bayes.globalMean + '/5.0' })
          ),
          domH('div', { class: 'bt-lab-kpi' },
            domH('span', { text: 'Coffee Street Visits' }),
            domH('strong', { class: 'num-tab', text: drinks.length + ' cafes · ' + shopMean + '/5.0' })
          )
        ));
        return;
      }

      let list = [];
      let drillLevelName = 'origin';
      if (bk === 'origins') {
        drillLevelName = 'origin';
        list = atlas.map(function (o) {
          const hit = bayes.originBoard.find(function (b) { return b.key === o.key; });
          return hit
            ? { key: o.key, label: o.name, n: hit.n, rawMean: hit.rawMean, mean: hit.mean, confPct: hit.confPct, ciLo: hit.ciLo, ciHi: hit.ciHi }
            : { key: o.key, label: o.name, n: 0, rawMean: bayes.globalMean, mean: bayes.globalMean, confPct: 0, ciLo: 0, ciHi: 0, unexplored: true };
        }).sort(function (a, b) { return (b.n > 0 ? 1 : 0) - (a.n > 0 ? 1 : 0) || b.mean - a.mean; });
      } else if (bk === 'processes') {
        drillLevelName = 'process';
        list = bayes.processBoard.map(function (b) { return Object.assign({ label: formatProcessHuman(b.key) }, b); });
      } else if (bk === 'roasts') {
        drillLevelName = 'roast';
        list = bayes.roastBoard.map(function (b) { return Object.assign({ label: formatRoastHuman(b.key) }, b); });
      } else if (bk === 'elevations') {
        drillLevelName = 'elevation';
        list = ['high', 'mid', 'low'].map(function (ek) {
          const def = ELEVATION_BAND_DEFS[ek];
          const hit = bayes.elevationBoard.find(function (b) { return b.key === ek; });
          return hit
            ? Object.assign({ label: def.label }, hit)
            : { key: ek, label: def.label, n: 0, rawMean: bayes.globalMean, mean: bayes.globalMean, confPct: 0, ciLo: 0, ciHi: 0, unexplored: true };
        }).sort(function (a, b) { return (b.n > 0 ? 1 : 0) - (a.n > 0 ? 1 : 0) || b.mean - a.mean; });
      } else if (bk === 'varietals') {
        drillLevelName = 'varietal';
        list = bayes.varietalBoard.map(function (b) { return Object.assign({ label: b.key.charAt(0).toUpperCase() + b.key.slice(1) }, b); });
      } else if (bk === 'brewers') {
        drillLevelName = 'brewer';
        list = bayes.brewerBoard.map(function (b) { return Object.assign({ label: b.key }, b); });
      }

      if (!list.length) {
        boardHost.appendChild(domH('p', { class: 'bt-lab-hint', text: 'Log brews across origins, processes, roasts, varietals, and brewers to unlock confidence-weighted personal rankings.' }));
        return;
      }

      const pctPersonalMean = clamp(((bayes.globalMean - 1) / 4) * 100, 5, 95, 73);

      list.slice(0, 52).forEach(function (row) {
        const pctMean = clamp(((row.mean - 1) / 4) * 100, 4, 98, 70);
        const pctRaw = clamp(((row.rawMean - 1) / 4) * 100, 4, 98, 70);
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

        boardHost.appendChild(domH(rowTag, rowProps,
          domH('div', { class: 'bt-trait-meta' },
            domH('span', { class: 'bt-trait-name', text: row.label + (row.n > 0 ? ' \u2192' : '') }),
            row.n > 0 ? domH('span', { class: 'bt-trait-conf num-tab', text: 'n=' + row.n + ' · ' + row.confPct + '% conf' }) : null
          ),
          domH('div', { class: 'bt-trait-bar-track' },
            domH('div', { class: 'bt-trait-mean-line', style: 'left:' + pctPersonalMean.toFixed(1) + '%' }),
            row.n > 0 ? domH('div', { class: 'bt-trait-conf-fill', style: 'width:' + row.confPct + '%' }) : null,
            row.n > 0 ? domH('div', { class: 'bt-trait-raw-tick', style: 'left:' + pctRaw.toFixed(1) + '%', title: 'Raw Mean ' + row.rawMean }) : null,
            domH('div', { class: 'bt-trait-dot', style: 'left:' + pctMean.toFixed(1) + '%' })
          ),
          domH('span', {
            class: 'bt-trait-stat num-tab',
            text: row.n > 0 ? ('True ' + row.mean.toFixed(2) + ' (Raw ' + row.rawMean.toFixed(2) + ')') : 'Unexplored'
          })
        ));
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

    boardsCard.appendChild(domH('div', { class: 'bt-lab-card-head' },
      domH('div', { class: 'bt-lab-title-group' },
        ic('search-filter', { size: 20 }),
        domH('div', null,
          domH('h3', {
            text: isScienceXray()
              ? 'Empirical-Bayes True Affinity & 4-Level Drill-In'
              : 'Your Favorite Coffee Traits & 4-Level Explorer'
          }),
          domH('p', {
            class: 'bt-lab-sub',
            text: isScienceXray()
              ? 'Raw Mean vs Shrinkage-Adjusted True Affinity (n/(n+k) confidence) — tap any row to drill Origin \u2192 Region \u2192 Process \u2192 Cups'
              : 'Confidence-Weighted Score vs. Raw Average — tap any row to explore Origin \u2192 Region \u2192 Process \u2192 Cups'
          })
        )
      ),
      palateState.drillPath.length > 0 ? domH('button', {
        type: 'button',
        class: 'bt-lab-btn is-sm bt-back-escape-btn',
        onclick: function () {
          palateState.drillPath.pop();
          CK.haptic('tick');
          paintActiveBoard();
        }
      }, '\u2190 Back One Level') : null
    ));
    boardsCard.appendChild(domH('div', { class: 'bt-lab-chip-row' }, tabBtns));
    boardsCard.appendChild(breadcrumbRow);
    boardsCard.appendChild(boardHost);
    paintActiveBoard();
    wrap.appendChild(boardsCard);

    /* 3. 5-Axis Bayesian Radar + Time-Lapse Scrubber */
    const radarCard = domH('section', { class: 'bt-studio-card' });
    const radarSvg = CK.svgEl('svg', {
      viewBox: '0 0 360 288',
      class: 'bt-chart-svg bt-radar-svg',
      'aria-label': '5-Axis Bayesian Palate DNA Radar with Confidence Band'
    });
    const CX = 180, CY = 148, RMAX = 100;

    function polarPt(axisIdx, val1to5) {
      const ang = (-90 + axisIdx * 72) * (Math.PI / 180);
      const r = (clamp(val1to5, 0.5, 5.0, 3.0) / 5.0) * RMAX;
      return [CX + r * Math.cos(ang), CY + r * Math.sin(ang)];
    }

    [1, 2, 3, 4, 5].forEach(function (ring) {
      const pts = [0, 1, 2, 3, 4].map(function (i) { return polarPt(i, ring).map(function (v) { return v.toFixed(1); }).join(','); }).join(' ');
      radarSvg.appendChild(CK.svgEl('polygon', { points: pts, class: 'bt-radar-ring' }));
    });

    bayes.axes.forEach(function (ax, idx) {
      const tip = polarPt(idx, 5.0);
      const lblPt = polarPt(idx, 5.82);
      radarSvg.appendChild(CK.svgEl('line', { x1: CX, y1: CY, x2: tip[0].toFixed(1), y2: tip[1].toFixed(1), class: 'bt-radar-spoke' }));
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

    const outerPts = bayes.axes.map(function (ax, i) { return polarPt(i, Math.min(5, ax.val + bayes.ciHalf)); });
    const innerPts = bayes.axes.map(function (ax, i) { return polarPt(i, Math.max(0.8, ax.val - bayes.ciHalf)); }).reverse();
    const bandD = 'M ' + outerPts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L ') + ' Z ' +
      'M ' + innerPts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L ') + ' Z';
    radarSvg.appendChild(CK.svgEl('path', { d: bandD, 'fill-rule': 'evenodd', class: 'bt-radar-ci-band' }));

    const polyPts = bayes.axes.map(function (ax, i) { return polarPt(i, ax.val); });
    radarSvg.appendChild(CK.svgEl('polygon', {
      points: polyPts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '),
      class: 'bt-radar-poly'
    }));
    polyPts.forEach(function (p) {
      radarSvg.appendChild(CK.svgEl('circle', { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: '4.8', class: 'bt-radar-dot' }));
    });

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
        rerenderPalateTab();
      }
    });

    radarCard.appendChild(domH('div', { class: 'bt-lab-card-head' },
      domH('div', { class: 'bt-lab-title-group' },
        ic('palate', { size: 22 }),
        domH('div', null,
          domH('h3', { text: isScienceXray() ? '5-Axis Bayesian Palate DNA Radar' : '5-Axis Personal Taste Profile' }),
          domH('p', {
            class: 'bt-lab-sub',
            text: bayes.uniqueCoffees + ' unique coffee(s) across ' + bayes.totalRows + ' cup(s) · Personal Average ' + bayes.globalMean + '/5.0'
          })
        )
      )
    ));
    radarCard.appendChild(domH('div', { class: 'bt-chart-stage' }, radarSvg));
    radarCard.appendChild(domH('div', { class: 'bt-lab-chip-row' },
      timelapsePill,
      isScienceXray() ? domH('span', {
        class: 'bt-studio-xray-line num-tab',
        text: 'Empirical Bayes shrinkage = ' + (bayes.uniqueCoffees / (bayes.uniqueCoffees + 3)).toFixed(2) + ' · 80% CI = ±' + bayes.ciHalf.toFixed(2)
      }) : null
    ));
    wrap.appendChild(radarCard);

    return wrap;
  }

  /* ==========================================================================
   * SEGMENT 2: "Will I Love This Bag?" Smart Bag Buyer's Guide & Store Scanner
   *   - 3 Archetypes: Bullseye Bet | Bridge Pick | Uncharted Horizon
   *   - Canonical PRICES_KEY schema fix on Buy & Add to Cellar!
   * ========================================================================== */
  function renderStoreBagScannerSegment() {
    const sc = palateState.scanner;
    const atlas = getFullOriginAtlas();
    const bayes = computeBayesianPalate(getHistoryRows(100));
    const wrap = domH('div', { class: 'bt-palate-seg' });

    /* 1. Smart Bag Buyer's Guide: 3 Personalized Archetype Cards (Origin + Process + Roast + Elevation + Flavors) */
    const topOrigin = (bayes.originBoard[0] && bayes.originBoard[0].key) || 'ethiopia';
    const topOriginMeta = atlas.find(function (o) { return o.key === topOrigin; }) || atlas[1];
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
    }) || atlas[25];

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
        why: 'Keeps your favorite roast solubility while bridging into neighboring ' + bridgeOrigin.name + ' terroir (' + bridgeOrigin.notes.split(',')[0] + ').',
        preset: { origin: bridgeOrigin.key, process: 'honey', roast: topRoast, elevation: 'mid', notes: bridgeOrigin.notes.split(',').slice(0, 2).map(function (s) { return s.trim(); }), notesUnsure: false }
      },
      {
        tier: 'Uncharted Horizon',
        kicker: 'NEW PASSPORT STAMP',
        icon: 'origin-globe',
        cls: 'is-horizon',
        title: unexploredOrigin.name + ' · Specialty Lot (1,750m+)',
        why: 'Zero cups logged from ' + unexploredOrigin.name + ' yet! Expect: ' + unexploredOrigin.notes + '.',
        preset: { origin: unexploredOrigin.key, process: 'natural', roast: 'light', elevation: 'high', notes: unexploredOrigin.notes.split(',').slice(0, 2).map(function (s) { return s.trim(); }), notesUnsure: false }
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
              rerenderPalateTab();
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

    /* 2. Interactive Zero-Spam In-Store Bag Evaluator ("Don't Know"-Aware + Elevation + Flavor Notes) */
    const card = domH('section', {
      class: 'bt-studio-card',
      id: 'bt-bag-love-evaluator',
      style: 'min-width:0;max-width:100%;box-sizing:border-box'
    });

    function matchFlavorNoteAffinity(noteWord) {
      const low = String(noteWord || '').trim().toLowerCase();
      if (!low) return { exactHit: null, familyHit: false, disliked: false, familyKind: 'neutral' };
      let exactHit = null;
      let disliked = false;
      bayes.likedNotes.forEach(function (val, k) {
        const kl = k.toLowerCase();
        if (kl === low || kl.indexOf(low) >= 0 || low.indexOf(kl) >= 0) {
          if (!exactHit || val.n > exactHit.n) exactHit = val;
        }
      });
      bayes.dislikedNotes.forEach(function (cnt, k) {
        const kl = k.toLowerCase();
        if (cnt > 0 && (kl === low || kl.indexOf(low) >= 0 || low.indexOf(kl) >= 0)) disliked = true;
      });
      let familyKind = 'sweet';
      if (/jasmine|bergamot|rose|blossom|hibiscus|floral|tea|earl|peach|berry|currant|lemon|lime|grapefruit|orange|pineapple|mango|apple|cherry|plum/i.test(low)) {
        familyKind = 'bright';
      } else if (/choc|cocoa|cacao|hazel|almond|nut|walnut|pecan|smok|roast|tobacco|cedar/i.test(low)) {
        familyKind = 'comfort';
      }
      return { exactHit: exactHit, disliked: disliked, familyKind: familyKind };
    }

    function computeBagMatchScore() {
      let rawDelta = 0;
      let knownSignals = 0;
      const totalSignals = 5;
      const reasons = [];

      /* 1. Origin */
      const origUnknown = !sc.origin || sc.origin === 'unknown' || isUnknownTrait(sc.origin);
      let origHit = null;
      if (origUnknown) {
        reasons.push('Origin (Don\'t Know / Blend): Unlisted on bag — skipped cleanly without guessing an origin.');
      } else {
        knownSignals++;
        origHit = bayes.originBoard.find(function (b) { return b.key === sc.origin; });
        const origMeta = atlas.find(function (o) { return o.key === sc.origin; }) || { name: sc.origin };
        if (origHit && origHit.n > 0) {
          rawDelta += (origHit.mean - bayes.globalMean) * 16;
          reasons.push('Origin (' + origMeta.name + '): Personal affinity ' + origHit.mean.toFixed(2) + '/5.0 across ' + origHit.n + ' bag' + (origHit.n === 1 ? '' : 's'));
        } else {
          rawDelta += 1.5;
          reasons.push('Origin (' + origMeta.name + '): Uncharted Horizon Stamp (unlocks a new World Belt country!)');
        }
      }

      /* 2. Process */
      const procUnknown = !sc.process || sc.process === 'unknown' || isUnknownTrait(sc.process);
      if (procUnknown) {
        reasons.push('Process (Don\'t Know): Not listed on bag — neutral weight used so score stays honest.');
      } else {
        knownSignals++;
        const procHit = bayes.processBoard.find(function (b) { return b.key.indexOf(sc.process) >= 0 || sc.process.indexOf(b.key) >= 0; });
        if (procHit && procHit.n > 0) {
          rawDelta += (procHit.mean - bayes.globalMean) * 13;
          reasons.push('Process (' + formatProcessHuman(sc.process) + '): ' + procHit.mean.toFixed(2) + '/5.0 ' + (isScienceXray() ? 'Empirical-Bayes affinity' : 'personal rating match'));
        } else {
          const funkAxis = bayes.axes[4].val;
          const isWild = /anaerobic|natural|honey|wet-hulled/.test(sc.process);
          rawDelta += isWild ? (funkAxis - 3.0) * 5.5 : (3.6 - funkAxis) * 4.5;
          reasons.push('Process (' + formatProcessHuman(sc.process) + '): Aligned against your ' + (isWild ? 'fruit-ferment' : 'clean-washed') + ' taste profile');
        }
      }

      /* 3. Roast Level */
      const roastUnknown = !sc.roast || sc.roast === 'unknown' || isUnknownTrait(sc.roast);
      if (roastUnknown) {
        reasons.push('Roast Level (Don\'t Know): Unlisted on bag — skipped without assuming Light or Dark.');
      } else {
        knownSignals++;
        const roastHit = bayes.roastBoard.find(function (b) { return b.key === sc.roast; });
        const roastAxis = bayes.axes[3].val;
        const bagRoastNum = sc.roast === 'ultra-light' ? 1.4
          : sc.roast === 'light' ? 2.0
          : sc.roast === 'medium-light' ? 2.6
          : sc.roast === 'medium' ? 3.3
          : 4.5;
        const roastGap = Math.abs(roastAxis - bagRoastNum);
        if (roastHit && roastHit.n > 0) {
          rawDelta += (roastHit.mean - bayes.globalMean) * 12 + (1.1 - roastGap) * 5;
          reasons.push('Roast (' + formatRoastHuman(sc.roast) + '): ' + roastHit.mean.toFixed(2) + '/5.0 personal roast score (' + roastHit.n + ' bag' + (roastHit.n === 1 ? '' : 's') + ')');
        } else {
          rawDelta += (1.25 - roastGap) * 9;
          reasons.push('Roast (' + formatRoastHuman(sc.roast) + '): ' + (roastGap < 0.85 ? 'Bullseye match with your preferred roast depth' : 'Contrast stretch from your usual roast depth'));
        }
      }

      /* 4. Elevation / Altitude Band */
      const elevUnknown = !sc.elevation || sc.elevation === 'unknown' || isUnknownTrait(sc.elevation);
      if (elevUnknown) {
        reasons.push('Elevation (Don\'t Know): Altitude not on bag — excluded cleanly from prediction.');
      } else {
        knownSignals++;
        const elevDef = ELEVATION_BAND_DEFS[sc.elevation] || ELEVATION_BAND_DEFS.mid;
        const elevHit = bayes.elevationBoard.find(function (b) { return b.key === sc.elevation; });
        if (elevHit && elevHit.n > 0) {
          rawDelta += (elevHit.mean - bayes.globalMean) * 11;
          reasons.push('Elevation (' + elevDef.label + '): ' + elevHit.mean.toFixed(2) + '/5.0 across ' + elevHit.n + ' bag' + (elevHit.n === 1 ? '' : 's'));
        } else {
          const acAxis = bayes.axes[0].val;
          const bdAxis = bayes.axes[2].val;
          const elevFit = sc.elevation === 'high' ? (acAxis - 3.0) * 4.5
            : sc.elevation === 'low' ? (bdAxis - 3.0) * 4.0
            : 2.5;
          rawDelta += elevFit;
          reasons.push('Elevation (' + elevDef.label + '): ' + elevDef.cue);
        }
      }

      /* 5. Flavor Notes */
      const activeNotes = sc.notesUnsure ? [] : sc.notes.filter(function (n) { return !isUnknownTrait(n); });
      if (sc.notesUnsure || activeNotes.length === 0) {
        reasons.push('Flavor Notes (Don\'t Know / Unlisted): No printed flavor notes — scored from known roast, process, origin & elevation.');
      } else {
        knownSignals++;
        let noteBonus = 0;
        const matchedFavs = [];
        const matchedDislikes = [];
        const acAxis = bayes.axes[0].val;
        const bdAxis = bayes.axes[2].val;
        activeNotes.forEach(function (n) {
          const nf = matchFlavorNoteAffinity(n);
          if (nf.disliked) {
            noteBonus -= 9.0;
            matchedDislikes.push(n);
          } else if (nf.exactHit) {
            const favLift = 4.5 + Math.max(0, ((nf.exactHit.sumStar / Math.max(1, nf.exactHit.n)) - 3.8) * 3.0);
            noteBonus += favLift;
            matchedFavs.push(n);
          } else if (nf.familyKind === 'bright') {
            noteBonus += (acAxis - 3.0) * 2.2;
          } else if (nf.familyKind === 'comfort') {
            noteBonus += (bdAxis - 3.0) * 2.0;
          } else {
            noteBonus += 1.8;
          }
        });
        rawDelta += clamp(noteBonus, -18, 16, 0);
        if (matchedDislikes.length) {
          reasons.push('Flavor Warning (' + matchedDislikes.join(', ') + '): Includes note(s) you previously disliked.');
        } else if (matchedFavs.length) {
          reasons.push('Flavor Notes (' + matchedFavs.join(', ') + '): Direct match with your favorite tasted notes!');
        } else {
          reasons.push('Flavor Notes (' + activeNotes.slice(0, 3).join(', ') + '): Evaluated against your 5-axis taste profile.');
        }
      }

      /* Honest Confidence Shrinkage when traits are "Don't Know":
         fewer known bag traits gently tempers extreme scores toward neutral 73% */
      const coverage = knownSignals / totalSignals;
      const confScale = 0.35 + 0.65 * coverage;
      const baseAnchor = 74;
      const finalScore = baseAnchor + rawDelta * confScale;
      const pct = Math.round(clamp(finalScore, 24, 99, 74));
      const historyFactor = bayes.uniqueCoffees > 0
        ? clamp(0.60 + 0.40 * (bayes.uniqueCoffees / (bayes.uniqueCoffees + 2)), 0.60, 1.0, 0.75)
        : 0.68;
      const confPct = Math.round(clamp((0.28 + 0.72 * coverage) * historyFactor * 100, 25, 98, 70));
      const isUnexplored = !origUnknown && (!origHit || origHit.n === 0);
      const tier = knownSignals <= 1
        ? 'Partial-Info Estimate'
        : pct >= 84
        ? 'Bullseye Bet'
        : (isUnexplored && pct < 80 ? 'Uncharted Horizon' : 'Bridge Pick');
      return {
        pct: pct,
        tier: tier,
        knownSignals: knownSignals,
        totalSignals: totalSignals,
        confPct: confPct,
        reasons: reasons
      };
    }

    const matchOut = computeBagMatchScore();

    const originChoices = ['ethiopia', 'colombia', 'kenya', 'panama', 'costarica', 'guatemala', 'brazil', 'rwanda', 'peru', 'indonesia', 'yemen', 'china'];
    const procChoices = ['washed', 'natural', 'honey', 'anaerobic', 'wet-hulled'];
    const roastChoices = ['ultra-light', 'light', 'medium-light', 'medium', 'dark'];
    const elevChoices = ['low', 'mid', 'high'];
    const noteChoices = ['Jasmine', 'Bergamot', 'White Peach', 'Blueberry', 'Blackcurrant', 'Strawberry', 'Lemon', 'Caramel', 'Brown Sugar', 'Milk Chocolate', 'Dark Chocolate', 'Hazelnut', 'Pineapple', 'Black Tea'];

    const pasteIn = domH('input', {
      type: 'text',
      class: 'bt-lab-text-in',
      placeholder: 'Paste shelf tag text or AI Scan JSON to auto-evaluate (0 rows saved until you buy)...',
      value: sc.rawLabel,
      oninput: function () {
        sc.rawLabel = pasteIn.value;
        const scanParser = typeof parseScanReplyV6 === 'function'
          ? parseScanReplyV6
          : (window.BTCoffeeEntry && typeof window.BTCoffeeEntry.parseScanReplyV6 === 'function' ? window.BTCoffeeEntry.parseScanReplyV6 : null);
        if (sc.rawLabel.indexOf('{') >= 0 && scanParser) {
          try {
            const parsed = scanParser(sc.rawLabel);
            if (parsed && parsed.ok !== false) {
              const f = parsed.fields || parsed.data || parsed;
              if (f.origin) sc.origin = isUnknownTrait(f.origin) ? 'unknown' : (matchOriginKey(f.origin, atlas) || sc.origin);
              if (f.process) sc.process = isUnknownTrait(f.process) ? 'unknown' : normKey(f.process);
              if (f.roast_level || f.roast) sc.roast = isUnknownTrait(f.roast_level || f.roast) ? 'unknown' : normKey(f.roast_level || f.roast);
              if (f.elevation_m || f.elevation) sc.elevation = classifyElevationBand(f.elevation_m || f.elevation) || sc.elevation;
              if (f.roaster) sc.roaster = f.roaster;
            }
          } catch (_) {}
        }
        const low = sc.rawLabel.toLowerCase();
        atlas.forEach(function (o) {
          if (low.indexOf(o.name.toLowerCase()) >= 0 || low.indexOf(o.key) >= 0) sc.origin = o.key;
        });
        procChoices.forEach(function (p) { if (low.indexOf(p) >= 0) sc.process = p; });
        if (low.indexOf('ultra-light') >= 0 || low.indexOf('nordic') >= 0) sc.roast = 'ultra-light';
        else if (low.indexOf('medium-light') >= 0 || low.indexOf('med-light') >= 0) sc.roast = 'medium-light';
        else if (low.indexOf('dark') >= 0) sc.roast = 'dark';
        else if (low.indexOf('medium') >= 0) sc.roast = 'medium';
        else if (low.indexOf('light') >= 0) sc.roast = 'light';
        const autoElev = classifyElevationBand(low);
        if (autoElev) sc.elevation = autoElev;
        rerenderPalateTab();
      }
    });

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

    /* Origin + Don't Know */
    card.appendChild(domH('div', { class: 'bt-scanner-group' },
      domH('span', { class: 'bt-lab-inline-lbl', text: '1. Origin (or Don\'t Know / Blend):' }),
      domH('div', { class: 'bt-lab-chip-row' },
        domH('button', {
          type: 'button',
          class: 'bt-lab-chip bt-dontknow-pill' + (sc.origin === 'unknown' ? ' is-active' : ''),
          'aria-pressed': String(sc.origin === 'unknown'),
          onclick: function () { sc.origin = 'unknown'; CK.haptic('tick'); rerenderPalateTab(); }
        }, 'Don\'t Know / Blend'),
        originChoices.map(function (ok) {
          const meta = atlas.find(function (x) { return x.key === ok; }) || { name: ok };
          return domH('button', {
            type: 'button',
            class: 'bt-lab-chip' + (sc.origin === ok ? ' is-active' : ''),
            'aria-pressed': String(sc.origin === ok),
            onclick: function () { sc.origin = ok; CK.haptic('tick'); rerenderPalateTab(); }
          }, meta.name);
        })
      )
    ));

    /* Roast Level + Don't Know */
    card.appendChild(domH('div', { class: 'bt-scanner-group' },
      domH('span', { class: 'bt-lab-inline-lbl', text: '2. Roast Level:' }),
      domH('div', { class: 'bt-lab-chip-row' },
        domH('button', {
          type: 'button',
          class: 'bt-lab-chip bt-dontknow-pill' + (sc.roast === 'unknown' ? ' is-active' : ''),
          'aria-pressed': String(sc.roast === 'unknown'),
          onclick: function () { sc.roast = 'unknown'; CK.haptic('tick'); rerenderPalateTab(); }
        }, 'Don\'t Know'),
        roastChoices.map(function (rk) {
          return domH('button', {
            type: 'button',
            class: 'bt-lab-chip' + (sc.roast === rk ? ' is-active' : ''),
            'aria-pressed': String(sc.roast === rk),
            onclick: function () { sc.roast = rk; CK.haptic('tick'); rerenderPalateTab(); }
          }, formatRoastHuman(rk));
        })
      )
    ));

    /* Process + Don't Know */
    card.appendChild(domH('div', { class: 'bt-scanner-group' },
      domH('span', { class: 'bt-lab-inline-lbl', text: '3. Processing Style:' }),
      domH('div', { class: 'bt-lab-chip-row' },
        domH('button', {
          type: 'button',
          class: 'bt-lab-chip bt-dontknow-pill' + (sc.process === 'unknown' ? ' is-active' : ''),
          'aria-pressed': String(sc.process === 'unknown'),
          onclick: function () { sc.process = 'unknown'; CK.haptic('tick'); rerenderPalateTab(); }
        }, 'Don\'t Know'),
        procChoices.map(function (pk) {
          return domH('button', {
            type: 'button',
            class: 'bt-lab-chip' + (sc.process === pk ? ' is-active' : ''),
            'aria-pressed': String(sc.process === pk),
            onclick: function () { sc.process = pk; CK.haptic('tick'); rerenderPalateTab(); }
          }, formatProcessHuman(pk));
        })
      )
    ));

    /* Elevation Band + Don't Know */
    card.appendChild(domH('div', { class: 'bt-scanner-group' },
      domH('span', { class: 'bt-lab-inline-lbl', text: '4. Elevation / Altitude:' }),
      domH('div', { class: 'bt-lab-chip-row' },
        domH('button', {
          type: 'button',
          class: 'bt-lab-chip bt-dontknow-pill' + (sc.elevation === 'unknown' ? ' is-active' : ''),
          'aria-pressed': String(sc.elevation === 'unknown'),
          onclick: function () { sc.elevation = 'unknown'; CK.haptic('tick'); rerenderPalateTab(); }
        }, 'Don\'t Know'),
        elevChoices.map(function (ek) {
          const def = ELEVATION_BAND_DEFS[ek];
          return domH('button', {
            type: 'button',
            class: 'bt-lab-chip' + (sc.elevation === ek ? ' is-active' : ''),
            'aria-pressed': String(sc.elevation === ek),
            onclick: function () { sc.elevation = ek; CK.haptic('tick'); rerenderPalateTab(); }
          }, def.label);
        })
      )
    ));

    /* Printed Bag Flavor Notes + Don't Know + Custom Note Input */
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
          rerenderPalateTab();
        }
      },
      oninput: function () {
        sc.customNote = customNoteIn.value;
      }
    });

    const allDisplayNotes = noteChoices.slice();
    sc.notes.forEach(function (un) {
      if (allDisplayNotes.indexOf(un) < 0) allDisplayNotes.unshift(un);
    });

    card.appendChild(domH('div', { class: 'bt-scanner-group' },
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
            rerenderPalateTab();
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
              rerenderPalateTab();
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
            rerenderPalateTab();
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

    card.appendChild(domH('div', { class: 'bt-scanner-verdict', id: 'bt-bag-match-verdict' },
      domH('div', { class: 'bt-scanner-score-ring num-tab' },
        domH('strong', { text: matchOut.pct + '%' }),
        domH('span', { text: matchOut.tier })
      ),
      domH('div', { class: 'bt-scanner-reasons' },
        domH('div', { class: 'bt-scanner-conf-row' },
          domH('span', {
            class: 'bt-epistemic-pill ' + (matchOut.knownSignals >= 4 ? 'is-verified' : (matchOut.knownSignals >= 2 ? 'is-research' : 'is-craft')),
            text: matchOut.knownSignals + '/' + matchOut.totalSignals + ' Bag Traits Known · ' + matchOut.confPct + '% Prediction Confidence'
          })
        ),
        matchOut.reasons.map(function (rLine) { return domH('p', { text: rLine }); }),
        domH('button', {
          type: 'button',
          class: 'bt-lab-btn is-primary',
          onclick: function () {
            const a = getApp();
            const isOrigUnk = sc.origin === 'unknown' || isUnknownTrait(sc.origin);
            const isProcUnk = sc.process === 'unknown' || isUnknownTrait(sc.process);
            const isRoastUnk = sc.roast === 'unknown' || isUnknownTrait(sc.roast);
            const isElevUnk = sc.elevation === 'unknown' || isUnknownTrait(sc.elevation);
            const origMeta = isOrigUnk ? { name: 'unknown' } : (atlas.find(function (x) { return x.key === sc.origin; }) || { name: sc.origin });
            const bagName = sc.rawLabel.trim() || ((isOrigUnk ? 'Specialty' : origMeta.name) + ' ' + (isProcUnk ? 'Coffee Bag' : formatProcessHuman(sc.process)));
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
              bag_weight_g: 250,
              remaining_g: 250,
              price: sc.price || 21,
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
            /* Canonical PRICES_KEY schema ({ id, coffee_id, coffee, roaster, size, price, currency, rlevel, date, notes }) */
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
                    size: 250,
                    unit: 'g',
                    rem_g: 250,
                    price: sc.price || 21,
                    currency: 'USD',
                    sym: '$',
                    rlevel: isRoastUnk ? 'medium-light' : sc.roast,
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
          }
        }, ic('fresh-bag', { size: 16 }), domH('span', { text: 'Buy & Add to My Beans \u2192' }))
      )
    ));

    wrap.appendChild(card);
    return wrap;
  }

  /* ==========================================================================
   * SEGMENT 3: 85-Descriptor Sunburst Flavor Wheel + 36-Vial Aroma Kit Tracker
   * ========================================================================== */
  function renderElasticSunburstSegment() {
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

    const springAnim = CK.createSpringAnimator(function (dt) {
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
      drawWheelOrConstellation();
      return moving;
    });

    function setFocusFamily(idx) {
      ws.focusFam = idx;
      CK.haptic('tick');
      springAnim.wake();
    }

    function paintGcoCard() {
      gcoCard.textContent = '';
      const word = ws.selectedWord || 'Jasmine';
      let wordFam = '';
      wheelData.fams.forEach(function (f) {
        f.groups.forEach(function (g) {
          if (g.words.indexOf(word) >= 0) wordFam = f.name;
        });
      });
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
              ws.pickedWords[word] = !picked;
              const a = getApp();
              a.coffee = a.coffee || {};
              const activeList = Object.keys(ws.pickedWords).filter(function (k) { return ws.pickedWords[k]; });
              a.coffee.flavors_liked = activeList.join(', ');
              saveDraftSoon();
              CK.haptic('snap');
              drawWheelOrConstellation();
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
              setFocusFamily(pick.fi);
              paintGcoCard();
            }
          }, 'Surprise My Nose')
        )
      ));
    }

    function drawWheelOrConstellation() {
      svg.textContent = '';
      if (ws.mode === 'constellation') {
        const cDefs = CK.svgEl('defs');
        const cGrad = CK.svgEl('radialGradient', { id: 'bt_constellation_stage', cx: '0.5', cy: '0.45', r: '0.55' });
        cGrad.appendChild(CK.svgEl('stop', { offset: '0%', 'stop-color': '#221914' }));
        cGrad.appendChild(CK.svgEl('stop', { offset: '100%', 'stop-color': '#0E0A08' }));
        cDefs.appendChild(cGrad);
        svg.appendChild(cDefs);
        svg.appendChild(CK.svgEl('circle', { cx: C, cy: C, r: '208', fill: 'url(#bt_constellation_stage)', stroke: '#4A3628', 'stroke-width': '2' }));
        const bayes = computeBayesianPalate(getHistoryRows(100));
        const starCoords = {};
        let aDeg = 0;
        wheelData.fams.forEach(function (fam) {
          const span = 360 / nFams;
          let gIdx = 0;
          fam.groups.forEach(function (gr) {
            gr.words.forEach(function (wStr, wIdx) {
              const deg = aDeg + ((gIdx * 5 + wIdx + 1) / (fam.groups.length * 6 + 1)) * span;
              const r = 68 + ((wIdx % 4) * 36);
              const xy = polarXY(r, deg);
              starCoords[wStr] = { x: xy[0], y: xy[1], color: fam.color };
            });
            gIdx++;
          });
          aDeg += span;
        });

        bayes.coOccur.forEach(function (cnt, key) {
          const parts = key.split('||');
          const pA = starCoords[parts[0]];
          const pB = starCoords[parts[1]];
          if (pA && pB) {
            svg.appendChild(CK.svgEl('path', {
              d: 'M ' + pA.x.toFixed(1) + ' ' + pA.y.toFixed(1) + ' Q ' + C + ' ' + C + ' ' + pB.x.toFixed(1) + ' ' + pB.y.toFixed(1),
              fill: 'none',
              stroke: '#FAD67D',
              'stroke-width': '1.4',
              'stroke-opacity': String(clamp(0.22 + cnt * 0.15, 0.2, 0.75, 0.35))
            }));
          }
        });

        Object.keys(starCoords).forEach(function (wStr) {
          const sc = starCoords[wStr];
          const rec = bayes.likedNotes.get(wStr);
          const count = rec ? rec.n : (ws.pickedWords[wStr] ? 1 : 0);
          const rad = count > 0 ? 4.5 + 2.0 * Math.sqrt(Math.min(12, count)) : 2.1;
          const star = CK.svgEl('circle', {
            cx: sc.x.toFixed(1),
            cy: sc.y.toFixed(1),
            r: rad.toFixed(1),
            fill: count > 0 ? '#FAD67D' : sc.color,
            'fill-opacity': count > 0 ? '0.96' : '0.42',
            class: 'bt-constellation-star'
          });
          star.addEventListener('click', function () {
            ws.selectedWord = wStr;
            CK.haptic('tick');
            paintGcoCard();
          });
          svg.appendChild(star);
          if (count > 0 || wStr === ws.selectedWord) {
            const lbl = CK.svgEl('text', {
              x: sc.x.toFixed(1),
              y: (sc.y - rad - 4).toFixed(1),
              'text-anchor': 'middle',
              fill: '#F7F0E8',
              'font-size': '10',
              'font-weight': '600'
            });
            lbl.textContent = wStr;
            svg.appendChild(lbl);
          }
        });
        return;
      }

      /* Elastic 140-Degree 3-Ring Sunburst across 85+ Descriptors */
      let a0 = 0;
      let lastOuterLabelDeg = -999;
      let firstOuterLabelDeg = -999;
      for (let fi = 0; fi < nFams; fi++) {
        const fam = wheelData.fams[fi];
        const span = ws.shares[fi];
        const a1 = a0 + span;
        const isFocused = ws.focusFam === fi;

        const pFam = CK.svgEl('path', {
          d: sectorPath(42, 92, a0 + 0.5, a1 - 0.5),
          fill: fam.color,
          'fill-opacity': isFocused ? '0.96' : '0.78',
          class: 'bt-wheel-wedge',
          tabindex: '0',
          role: 'button',
          'aria-label': fam.name + ' family'
        });
        (function (fIndex) {
          pFam.addEventListener('click', function () { setFocusFamily(fIndex); });
        })(fi);
        svg.appendChild(pFam);

        const famMid = (a0 + a1) * 0.5;
        const famXY = polarXY(67, famMid);
        const fTxt = CK.svgEl('text', {
          x: famXY[0].toFixed(1),
          y: famXY[1].toFixed(1),
          'text-anchor': 'middle',
          'dominant-baseline': 'central',
          fill: '#FFFDF9',
          'font-size': isFocused ? '11' : '9',
          'font-weight': '700',
          style: 'pointer-events:none'
        });
        fTxt.textContent = fam.short;
        svg.appendChild(fTxt);

        const gSpan = span / fam.groups.length;
        const gMinSpan = isFocused ? 15 : 18;
        const wMinSpan = isFocused ? 4.8 : 6.8;
        const minSepDeg = isFocused ? 5.2 : 7.2;
        for (let gi = 0; gi < fam.groups.length; gi++) {
          const gr = fam.groups[gi];
          const b0 = a0 + gi * gSpan;
          const b1 = b0 + gSpan;
          const pGr = CK.svgEl('path', {
            d: sectorPath(94, 148, b0 + 0.4, b1 - 0.4),
            fill: fam.color,
            'fill-opacity': isFocused ? '0.76' : '0.52',
            class: 'bt-wheel-wedge'
          });
          (function (fIndex) {
            pGr.addEventListener('click', function () { setFocusFamily(fIndex); });
          })(fi);
          svg.appendChild(pGr);

          if (gSpan >= gMinSpan) {
            const gMid = (b0 + b1) * 0.5;
            const gXY = polarXY(121, gMid);
            let rot = gMid - 90;
            if (gMid > 180) rot += 180;
            const gTxt = CK.svgEl('text', {
              x: gXY[0].toFixed(1),
              y: gXY[1].toFixed(1),
              transform: 'rotate(' + rot.toFixed(1) + ' ' + gXY[0].toFixed(1) + ' ' + gXY[1].toFixed(1) + ')',
              'text-anchor': 'middle',
              'dominant-baseline': 'central',
              fill: '#FFFDF9',
              'font-size': isFocused ? '10' : '8.5',
              'font-weight': '600',
              style: 'pointer-events:none'
            });
            gTxt.textContent = gr.name;
            svg.appendChild(gTxt);
          }

          const wSpan = gSpan / gr.words.length;
          for (let wi = 0; wi < gr.words.length; wi++) {
            const wStr = gr.words[wi];
            const c0 = b0 + wi * wSpan;
            const c1 = c0 + wSpan;
            const onWord = ws.selectedWord === wStr || !!ws.pickedWords[wStr];
            const pW = CK.svgEl('path', {
              d: sectorPath(150, 212, c0 + 0.25, c1 - 0.25),
              fill: fam.color,
              'fill-opacity': onWord ? '1.0' : (isFocused ? '0.62' : '0.34'),
              class: 'bt-wheel-wedge' + (onWord ? ' is-picked' : ''),
              tabindex: isFocused ? '0' : '-1',
              role: 'button',
              'aria-label': wStr
            });
            (function (fIndex, wordName) {
              pW.addEventListener('click', function () {
                ws.selectedWord = wordName;
                if (ws.focusFam !== fIndex) setFocusFamily(fIndex);
                else {
                  CK.haptic('tick');
                  drawWheelOrConstellation();
                }
                paintGcoCard();
              });
            })(fi, wStr);
            svg.appendChild(pW);

            const wMid = (c0 + c1) * 0.5;
            const sepPrev = wMid - lastOuterLabelDeg;
            const sepWrap = firstOuterLabelDeg >= 0 ? (firstOuterLabelDeg + 360 - wMid) : 999;
            if (wSpan >= wMinSpan && sepPrev >= minSepDeg && sepWrap >= minSepDeg) {
              lastOuterLabelDeg = wMid;
              if (firstOuterLabelDeg < 0) firstOuterLabelDeg = wMid;
              const wXY = polarXY(isFocused ? 181 : 183, wMid);
              let wRot = wMid - 90;
              if (wMid > 180) wRot += 180;
              const wTxt = CK.svgEl('text', {
                x: wXY[0].toFixed(1),
                y: wXY[1].toFixed(1),
                transform: 'rotate(' + wRot.toFixed(1) + ' ' + wXY[0].toFixed(1) + ' ' + wXY[1].toFixed(1) + ')',
                'text-anchor': 'middle',
                'dominant-baseline': 'central',
                fill: '#FFFDF9',
                'font-size': isFocused ? '9' : '7.2',
                'font-weight': onWord ? '700' : '600',
                style: 'pointer-events:none'
              });
              wTxt.textContent = wStr.length > 11 ? wStr.slice(0, 10) + '.' : wStr;
              svg.appendChild(wTxt);
            }
          }
        }
        a0 = a1;
      }

      const hub = CK.svgEl('circle', {
        cx: C, cy: C, r: '39',
        class: 'bt-wheel-hub',
        tabindex: '0',
        role: 'button',
        'aria-label': 'Reset equal wheel angles'
      });
      hub.addEventListener('click', function () { setFocusFamily(-1); });
      svg.appendChild(hub);
      const hLbl = CK.svgEl('text', {
        x: C, y: C,
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        class: 'bt-wheel-hub-txt',
        style: 'pointer-events:none'
      });
      hLbl.textContent = ws.focusFam >= 0 ? '140° Lens' : '85 Notes';
      svg.appendChild(hLbl);
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
          domH('p', { class: 'bt-lab-sub', text: 'Tap any inner family to bloom a roomy 140° arc — tap outer petals to tag your cup' })
        )
      ),
      domH('div', { class: 'bt-lab-chip-row' },
        domH('button', {
          type: 'button',
          class: 'bt-lab-chip' + (ws.mode === 'sunburst' ? ' is-active' : ''),
          onclick: function () { ws.mode = 'sunburst'; rerenderPalateTab(); }
        }, '140° Sunburst'),
        domH('button', {
          type: 'button',
          class: 'bt-lab-chip' + (ws.mode === 'constellation' ? ' is-active' : ''),
          onclick: function () { ws.mode = 'constellation'; rerenderPalateTab(); }
        }, 'Palate Constellation')
      )
    ));
    card.appendChild(searchIn);
    card.appendChild(searchResultsRow);
    card.appendChild(domH('div', { class: 'bt-chart-stage' }, svg));
    card.appendChild(gcoCard);
    wrap.appendChild(card);

    /* 2. 36-Vial Aroma Kit (KIT_NAMES) Olfactory Mastery Tracker */
    const kitCard = domH('section', { class: 'bt-studio-card', id: 'bt-aroma-kit-36' });
    const globKit = (typeof KIT_NAMES !== 'undefined' && KIT_NAMES) ? KIT_NAMES : (window.KIT_NAMES || null);
    const vials = FALLBACK_KIT_36.map(function (row) {
      const n = row[0];
      return { n: n, name: (globKit && globKit[n]) ? globKit[n] : row[1], fam: row[2] };
    });
    const masteredCount = vials.filter(function (v) { return !!palateState.aromaKit[v.n]; }).length;

    kitCard.appendChild(domH('div', { class: 'bt-lab-card-head' },
      domH('div', { class: 'bt-lab-title-group' },
        ic('check-seal', { size: 20 }),
        domH('div', null,
          domH('h3', { text: '36-Vial Aroma Kit Olfactory Mastery (' + masteredCount + ' / 36 Mastered)' }),
          domH('p', { class: 'bt-lab-sub', text: 'Train blind smell recall across all 36 numbered reference vials — tap any vial you can identify blind' })
        )
      )
    ));
    kitCard.appendChild(domH('div', { class: 'bt-aroma-kit-grid' },
      vials.map(function (v) {
        const on = !!palateState.aromaKit[v.n];
        return domH('button', {
          type: 'button',
          class: 'bt-aroma-vial-btn' + (on ? ' is-mastered' : ''),
          'aria-pressed': String(on),
          onclick: function () {
            palateState.aromaKit[v.n] = !on;
            saveAromaKitTicked(palateState.aromaKit);
            CK.haptic('tick');
            rerenderPalateTab();
          }
        },
          domH('span', { class: 'bt-vial-num num-tab', text: '#' + v.n }),
          domH('span', { class: 'bt-vial-name', text: v.name })
        );
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
   * TAB 4 ('palate') MASTER CONTAINER & ROUTE REGISTRATION
   * ========================================================================== */
  let lastPalateMount = null;

  function rerenderPalateTab() {
    if (lastPalateMount) renderPalateTab(lastPalateMount);
  }

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
          if (typeof window !== 'undefined' && window.BTBackupCenter && typeof window.BTBackupCenter.open === 'function') {
            window.BTBackupCenter.open({ source: 'palate' });
          } else if (sh().openSheet) {
            sh().openSheet('save-backup-center', { source: 'palate' }, { title: 'Backup & Load Saves', detent: 'full' });
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
    ELEVATION_BAND_DEFS: ELEVATION_BAND_DEFS,
    isUnknownTrait: isUnknownTrait,
    ORIGIN_ATLAS_52: ORIGIN_ATLAS_52,
    ORIGIN_ATLAS_36: ORIGIN_ATLAS_52,
    GCO_MOLECULES: GCO_MOLECULES,
    state: palateState
  };
})();
