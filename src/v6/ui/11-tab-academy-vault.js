/* ============================================================================
 * BeanTelligence v6.2 — Tab 5 ('academy'): Learn & Vault
 *   1. 19 Mini-Courses (Accordion Modules & 19 Lessons + Quiz Checkpoints)
 *   2. 5-Bowl Cupping & Calibrate (Voice-Guided SCA/CVA 1-5 Bowl Table +
 *      6-Cup Kitchen Sour-vs-Bitter Calibrator + 3-Cup Salami + Blind Triangle)
 *   3. A-Z Glossary (774 Terms, 26 Letters, Category Chips, View-40 Pagination)
 *   4. 32 Myth-Busters (158 Real DOIs & Peer-Reviewed Citations)
 *   5. Backup & Data Vault (Save Everything .txt, 129-Col CSV, Merge, Snapshots,
 *      My Workflow & Tools Launcher, 148+ Releases & Epistemic Charter)
 * Module: src/v6/ui/11-tab-academy-vault.js
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
  const ACADEMY_LS_KEY = 'brew-and-cup-academy-v1';

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

  function isScienceXray() {
    if (CK && typeof CK.lensLevel === 'function') return CK.lensLevel() === 'scientist';
    if (window.BTScienceLens && typeof window.BTScienceLens.level === 'function') return window.BTScienceLens.level() === 'scientist';
    const a = getApp();
    const m2 = (a.prefs && (a.prefs.lens || a.prefs.scienceLens)) || document.documentElement.getAttribute('data-science-lens') || 'comfy';
    return m2 === 'xray' || m2 === 'scientist' || m2 === 'expert';
  }

  /* Safe Voice & Chime Bridge to BTTimerAudio */
  function speakCueSafe(text, kind) {
    if (!acadUi.voiceEnabled) return;
    try {
      const aud = window.BTTimerAudio;
      if (!aud) return;
      if (kind === 'golden' && typeof aud.playGoldenSipBell === 'function') aud.playGoldenSipBell();
      else if (kind === 'finish' && typeof aud.playFinishChord === 'function') aud.playFinishChord();
      else if (typeof aud.playStepChime === 'function') aud.playStepChime();
      if (text && typeof aud.speak === 'function') aud.speak(text);
    } catch (_) {}
  }

  function unlockAudioSafe() {
    try {
      if (window.BTTimerAudio && typeof window.BTTimerAudio.unlock === 'function') {
        window.BTTimerAudio.unlock();
      }
    } catch (_) {}
  }

  function extractBadgeLabel(badgeVal, fallbackTier) {
    if (typeof badgeVal === 'string' && badgeVal.trim()) return badgeVal.trim();
    if (badgeVal && typeof badgeVal === 'object') {
      const lbl = badgeVal.label || badgeVal.text || badgeVal.title || badgeVal.tier || '';
      if (typeof lbl === 'string' && lbl.trim()) return lbl.trim();
    }
    const t = String(fallbackTier || '').toLowerCase();
    if (t.indexOf('myth') >= 0 || t === 'not') return '[Myth Debunked]';
    if (t.indexOf('craft') >= 0 || t.indexOf('practice') >= 0) return '[Craft Best Practice]';
    if (t.indexOf('active') >= 0 || t.indexOf('research') >= 0 || t === 'c') return '[Active Research]';
    return '[Verified Science]';
  }

  function openNamedSheet(sheetKey, payload, opts) {
    const shell = sh();
    if (typeof shell.openSheet === 'function') {
      shell.openSheet(sheetKey, payload, opts);
      return;
    }
    if (shell.BTSheet && typeof shell.BTSheet.open === 'function') {
      const renderMap = {
        'save-backup-center': renderSaveBackupCenterSheet,
        'data-vault': renderDataVaultSheet,
        'onboarding-tour': renderOnboardingTourSheet,
        'about-charter': renderAboutCharterSheet,
        'sca-cupping': renderScaCuppingSheet
      };
      shell.BTSheet.open({
        id: sheetKey,
        title: (opts && opts.title) || 'BeanTelligence',
        detent: (opts && opts.detent) || 'full',
        render: renderMap[sheetKey] || renderDataVaultSheet
      });
    }
  }

  function epistemicPill(tier, explicitBadge) {
    const raw = extractBadgeLabel(explicitBadge, tier);
    const t = (String(tier || '') + ' ' + raw).toLowerCase();
    if (t.indexOf('myth') >= 0 || t === 'not') {
      return domH('span', { class: 'bt-epistemic-pill is-myth' }, ic('close-x', { size: 13 }), domH('span', { text: '[Myth Debunked]' }));
    }
    if (t.indexOf('craft') >= 0 || t.indexOf('practice') >= 0) {
      return domH('span', { class: 'bt-epistemic-pill is-craft' }, ic('spark-star', { size: 13 }), domH('span', { text: '[Craft Best Practice]' }));
    }
    if (t.indexOf('nuanced') >= 0 || t.indexOf('partly') >= 0 || t.indexOf('calibrated') >= 0 || t.indexOf('active') >= 0 || t.indexOf('research') >= 0) {
      return domH('span', { class: 'bt-epistemic-pill is-research' }, ic('xray-loupe', { size: 13 }), domH('span', { text: '[Active Research]' }));
    }
    return domH('span', { class: 'bt-epistemic-pill is-verified' }, ic('check-seal', { size: 13 }), domH('span', { text: '[Verified Science]' }));
  }

  /* ==========================================================================
   * ACADEMY PERSISTENCE ('brew-and-cup-academy-v1') & EXACT BINOMIAL MATH
   * ========================================================================== */
  function defaultAcademyData() {
    return {
      bookmarkedIds: [],
      completedModuleIds: [],
      completedLessonIds: [],
      quizPassedIds: [],
      palateGymHistory: {
        triangleTrials: 0,
        triangleCorrect: 0,
        kitchenCalibRuns: 0,
        kitchenCalibCorrect: 0,
        salamiRuns: 0,
        blindBowlsRuns: 0,
        lastPlayedAt: ''
      }
    };
  }

  function readAcademyState() {
    try {
      const raw = localStorage.getItem(ACADEMY_LS_KEY);
      if (!raw) return defaultAcademyData();
      const p = JSON.parse(raw);
      if (!p || typeof p !== 'object') return defaultAcademyData();
      const def = defaultAcademyData();
      const gh = p.palateGymHistory && typeof p.palateGymHistory === 'object' ? p.palateGymHistory : {};
      return {
        bookmarkedIds: Array.isArray(p.bookmarkedIds) ? p.bookmarkedIds.filter(function (x) { return typeof x === 'string'; }) : [],
        completedModuleIds: Array.isArray(p.completedModuleIds) ? p.completedModuleIds.filter(function (x) { return typeof x === 'string'; }) : [],
        completedLessonIds: Array.isArray(p.completedLessonIds) ? p.completedLessonIds.filter(function (x) { return typeof x === 'string'; }) : [],
        quizPassedIds: Array.isArray(p.quizPassedIds) ? p.quizPassedIds.filter(function (x) { return typeof x === 'string'; }) : [],
        palateGymHistory: {
          triangleTrials: Math.max(0, parseInt(gh.triangleTrials, 10) || 0),
          triangleCorrect: Math.max(0, parseInt(gh.triangleCorrect, 10) || 0),
          kitchenCalibRuns: Math.max(0, parseInt(gh.kitchenCalibRuns, 10) || 0),
          kitchenCalibCorrect: Math.max(0, parseInt(gh.kitchenCalibCorrect, 10) || 0),
          salamiRuns: Math.max(0, parseInt(gh.salamiRuns, 10) || 0),
          blindBowlsRuns: Math.max(0, parseInt(gh.blindBowlsRuns, 10) || 0),
          lastPlayedAt: typeof gh.lastPlayedAt === 'string' ? gh.lastPlayedAt.slice(0, 32) : def.palateGymHistory.lastPlayedAt
        }
      };
    } catch (_) {
      return defaultAcademyData();
    }
  }

  function writeAcademyState(next) {
    const clean = {
      bookmarkedIds: Array.from(new Set(next.bookmarkedIds || [])),
      completedModuleIds: Array.from(new Set(next.completedModuleIds || [])),
      completedLessonIds: Array.from(new Set(next.completedLessonIds || [])),
      quizPassedIds: Array.from(new Set(next.quizPassedIds || [])),
      palateGymHistory: Object.assign(defaultAcademyData().palateGymHistory, next.palateGymHistory || {})
    };
    try {
      localStorage.setItem(ACADEMY_LS_KEY, JSON.stringify(clean));
    } catch (_) {}
    return clean;
  }

  window.readAcademyState = readAcademyState;
  window.writeAcademyState = writeAcademyState;

  function exactTriangleBinomialPValue(nTrials, kCorrect) {
    const N = Math.max(0, Math.floor(nTrials));
    const K = Math.max(0, Math.min(N, Math.floor(kCorrect)));
    if (N === 0 || K === 0) return 1.0;

    function logFact(m) {
      let s = 0;
      for (let i = 2; i <= m; i++) s += Math.log(i);
      return s;
    }
    const lfN = logFact(N);
    const logP = Math.log(1 / 3);
    const logQ = Math.log(2 / 3);
    let pSum = 0;
    for (let j = K; j <= N; j++) {
      const logComb = lfN - logFact(j) - logFact(N - j);
      pSum += Math.exp(logComb + j * logP + (N - j) * logQ);
    }
    return clamp(pSum, 0, 1, 1);
  }

  window.exactTriangleBinomialPValue = exactTriangleBinomialPValue;

  /* Exact CVA 104-2024 Affective Formula: S = 0.65625 * sum8 + 52.75 - 2*u - 4*d */
  function computeCvaBowlScore(bowl) {
    const hArr = Array.isArray(bowl && bowl.hVals) && bowl.hVals.length === 8 ? bowl.hVals : [6.143, 6.143, 6.143, 6.143, 6.143, 6.143, 6.143, 6.143];
    let sum8 = 0;
    for (let i = 0; i < 8; i++) {
      sum8 += clamp(hArr[i], 1, 9, 6.143);
    }
    const u = clamp((bowl && bowl.nonUniformCups) || 0, 0, 5, 0);
    const d = clamp((bowl && bowl.defectiveCups) || 0, 0, 5, 0);
    const raw = 0.65625 * sum8 + 52.75 - 2 * u - 4 * d;
    return +(Math.round(clamp(raw, 0, 100, 85) * 4) / 4).toFixed(2);
  }

  function computeBowlStars(sc) {
    return +clamp(Math.round((1.0 + ((sc - 58.0) / 34.0) * 4.0) * 4) / 4, 1.0, 5.0, 4.25).toFixed(2);
  }

  function bowlQualityTier(sc) {
    if (sc >= 87.5) return { text: 'Specialty Outstanding', tone: 'is-good' };
    if (sc >= 83.0) return { text: 'Very Good \u00B7 Balanced', tone: 'is-good' };
    if (sc >= 79.0) return { text: 'Good Specialty', tone: 'is-gold' };
    return { text: 'Needs Adjustment', tone: 'is-warn' };
  }

  function setBowlTargetScaBase(bowl, targetBaseSca) {
    const h = clamp((targetBaseSca - 52.75) / 5.25, 1, 9, 6.143);
    bowl.hVals = [h, h, h, h, h, h, h, h];
    bowl.score = computeCvaBowlScore(bowl);
    return bowl.score;
  }

  /* ==========================================================================
   * BUILT-IN FALLBACK ENCYCLOPEDIA DATA & 19 INTERACTIVE LESSONS + QUIZZES
   * ========================================================================== */
  const FALLBACK_MODULES_7 = [
    {
      id: 'm1-botany', num: 1, title: 'Botany, Taxonomy & WCR Genetics', tier: 'verified_science',
      sub: 'Cherry anatomy, allotetraploid Arabica, 2025 Liberica/Excelsa split & cultivar genealogy',
      body: 'Coffea arabica (2n=4x=44) arose from a natural hybridization between maternal C. eugenioides (low caffeine, high floral sweetness) and paternal C. canephora (Salojarvi et al. 2024, Nature Genetics). Davis et al. (2025, Nature Plants) resolved C. liberica, C. dewevrei (Excelsa), and C. klainei as distinct species.'
    },
    {
      id: 'm2-terroir', num: 2, title: 'Global Terroir & 52-Origin Bean Belt', tier: 'nuanced_research',
      sub: 'Altitude vs latitude maturation kinetics, soil chemistry & Great Lakes IPMP defect',
      body: 'Cool night maturation (16–21 °C) slows cherry development, increasing seed density and organic acid balance — achieved at 1,500–2,200 masl near the equator or 300–900 masl under oceanic trade winds.'
    },
    {
      id: 'm3-processing', num: 3, title: 'Post-Harvest Processing & All 4 Decaf Chemistries', tier: 'verified_science',
      sub: 'Washed, Honey, Natural, Anaerobic/Koji, Swiss Water, EA Sugarcane, CO2 & Decaf Inversion',
      body: 'Decaffeinated beans exhibit higher cellular porosity and brittle micro-fines generation: start +8% coarser on gravity filter to prevent fines blinding, yet -5.5% finer on 9-bar espresso due to reduced CO2 puck resistance.'
    },
    {
      id: 'm4-roasting', num: 4, title: 'Roasting Physics, Bitter Chemistry & Cryo-Vault', tier: 'verified_science',
      sub: 'Maillard, Strecker, Hofmann CGA lactones vs phenylindanes, NMP & -18 °C Arrhenius kinetics',
      body: 'Caffeine contributes only ~10–15% of bitterness; light-medium roasts form pleasant chlorogenic acid lactones, whereas dark roasts degrade them into harsh phenylindanes (Blumberg, Frank & Hofmann 2010). Storing airtight at -18 °C slows staling 12.3x (Smrke et al. 2018).'
    },
    {
      id: 'm5-extraction', num: 5, title: 'Extraction Kinetics, Darcy Flow & Water Chemistry', tier: 'verified_science',
      sub: '3-stage polarity elution, Darcy filter blinding, RDT static quenching & pH 5.0 buffering',
      body: 'Adding ~0.1 mL water per 20g whole beans (RDT) quenches triboelectric charging and reduces espresso micro-channeling (Mendez Harper & Hendon 2023, Matter). Bicarbonate (0.96 eq) and citrate (0.45 eq at pH 5.0) titrate bright fruit acids.'
    },
    {
      id: 'm6-physiology', num: 6, title: 'Human Physiology, CYP1A2 PK & Health Science', tier: 'verified_science',
      sub: 'Adenosine A1/A2A blockade, Gardiner 2023 SWS cutoffs, Lawsonibacter & paper-trapped diterpenes',
      body: 'Paper filters trap ~95–99% of LDL-raising cafestol/kahweol diterpenes carried in suspended oil droplets (Urgert & Katan 1997). Habitual regular and decaf coffee enrich Lawsonibacter asaccharolyticus 4.5–8x (Manghi et al. 2024).'
    },
    {
      id: 'm7-sensory', num: 7, title: 'Sensory Neurogastronomy & Calibration Flights', tier: 'verified_science',
      sub: 'Retronasal aroma sweetness, 70 \u2192 42 °C cup cooling & modern SCA Cupping',
      body: 'Above 65 °C heat masks sweetness; between 58 °C and 42 °C, warm taste receptors unlock peak perceived sweetness and fruit ester clarity (Talavera et al. 2005; Ristenpart et al. 2022).'
    }
  ];

  const FALLBACK_LESSONS_19 = [
    { id: 'seed-cherry', title: '1. From Cherry to Green Seed', badge: '[Verified Science]', paras: ['A coffee bean is the dense endosperm seed inside a ripe Coffea fruit cherry surrounded by skin, sweet mucilage, and parchment.'] },
    { id: 'family', title: '2. The Rubiaceae Botanical Family', badge: '[Verified Science]', paras: ['Over 130 Coffea species grow naturally across tropical Africa, Madagascar, and Asia.'] },
    { id: 'species', title: '3. Arabica, Robusta, Liberica & Eugenioides', badge: '[Verified Science]', paras: ['Arabica holds ~1.2% caffeine and complex sugars/lipids; Robusta holds ~2.2% caffeine; Eugenioides holds ~0.2% caffeine with natural sweetness.'] },
    { id: 'terroir', title: '4. Elevation, Night Cooling & Bean Density', badge: '[Active Research]', paras: ['Cooler high-elevation nights slow fruit ripening, packing denser cell walls and vibrant malic, citric, and phosphoric brightness.'] },
    { id: 'processing', title: '5. Washed, Honey, Natural & Anaerobic Ferments', badge: '[Verified Science]', paras: ['Removing fruit mucilage cleanly yields floral clarity (Washed); drying inside whole fruit builds berry esters and body (Natural).'] },
    { id: 'decaf', title: '6. How Swiss Water, Sugarcane EA & CO2 Decaf Work', badge: '[Verified Science]', paras: ['Modern decaffeination removes 99.7% of caffeine while preserving polyphenols; porous cell walls drain differently than regular beans.'] },
    { id: 'roast', title: '7. Maillard Browning, First Crack & Roast Solubility', badge: '[Verified Science]', paras: ['Light roasts preserve origin acids and floral terpenes; darker roasts open porous cell structure so solubles extract faster at cooler temps.'] },
    { id: 'freshness', title: '8. Degassing Rest Windows vs Oxidation Staling', badge: '[Craft Best Practice]', paras: ['Freshly roasted beans trap CO2 that repels brew water for 4–14 days depending on roast depth and brew pressure.'] },
    { id: 'freezing', title: '9. Airtight Storage & -18 °C Freezer Vaulting', badge: '[Verified Science]', paras: ['Sealing rested single-dose tubes or bags at -18 °C slows volatile loss and lipid oxidation ~12.3x with zero condensation if thawed sealed.'] },
    { id: 'grind', title: '10. Grind Size, Fines & Darcy Bed Resistance', badge: '[Verified Science]', paras: ['Finer grinding multiplies surface area exponentially while micro-fines (<100 um) govern filter drawdown speed.'] },
    { id: 'ratio', title: '11. Dose, Pour Water, Bed Retention & Ratio', badge: '[Verified Science]', paras: ['Dry filter grounds retain ~2.0–2.2 g of water per gram of coffee; ratio sets strength (%TDS) while grind/temp/contact set %EY.'] },
    { id: 'ey-tds', title: '12. Strength (%TDS) vs Extraction Yield (%EY)', badge: '[Verified Science]', paras: ['Strength is how concentrated the cup feels; Extraction Yield is what fraction of the bean dissolved (early acids \u2192 mid sugars \u2192 late bitters).'] },
    { id: 'temp', title: '13. Kettle Setpoint vs Actual Slurry Temperature', badge: '[Verified Science]', paras: ['Cold ceramic drippers can steal 4–6 °C from your slurry; preheating and matching temp to roast solubility keeps extraction balanced.'] },
    { id: 'water', title: '14. Brew Water Hardness (GH) & Alkalinity Buffer (KH)', badge: '[Verified Science]', paras: ['Mg2+ and Ca2+ aid flavor extraction while bicarbonate (KH ~30–50 ppm) buffers sharp acids without chalky flatness or boiler limescale.'] },
    { id: 'channeling', title: '15. Evenness, Agitation & Why Channeling Tastes Sour+Bitter', badge: '[Verified Science]', paras: ['When water carves fast channels, paths along the channel over-extract into dry astringency while bypassed clumps under-extract sour!'] },
    { id: 'cold', title: '16. Flash-Iced Pour-Over vs Cold Brew Immersion', badge: '[Verified Science]', paras: ['Brewing hot directly onto calculated ice locks bright aromatics that 16-hour cold water steeping never dissolves, then chills instantly.'] },
    { id: 'caffeine', title: '17. Caffeine Half-Life, Adenosine & Deep Sleep Cutoff', badge: '[Verified Science]', paras: ['Caffeine blocks adenosine receptors with a ~5h typical half-life (3h–13h by CYP1A2 genetics); keeping bedtime active mg <=35 mg protects deep N3 sleep.'] },
    { id: 'cooling', title: '18. Why Coffee Tastes Sweetest at 55–58 °C', badge: '[Verified Science]', paras: ['Piping-hot >70 °C liquid triggers heat-pain channels and mutes TRPM5 sweet signaling — wait 4–6 minutes for the Golden Sip!'] },
    { id: 'dialin', title: '19. One-Variable Dial-In: Sour vs Bitter Compass', badge: '[Craft Best Practice]', paras: ['Change one variable at a time: sour/thin \u2192 grind finer; bitter/dry \u2192 grind coarser or pull 15s early; strong/weak \u2192 adjust ratio or hot bypass.'] }
  ];

  function getQuizForLesson(idx, ls) {
    const bank = [
      { q: 'What comes out of coffee grounds LAST during extraction?', opts: ['Bright fruit acids', 'Dry, slow-diffusing bitter polyphenols', 'CO2 gas bubbles'], ans: 1 },
      { q: 'Why can a cup taste BOTH sour and drying/bitter at the same time?', opts: ['Water was too pure', 'Uneven channeling (fast over-extracted paths + bypassed clumps)', 'Mug was pre-warmed'], ans: 1 },
      { q: 'At what drinking temperature do TRPM5 receptors unlock peak perceived sweetness?', opts: ['Piping hot >75 °C', 'Warm Golden Sip window (55–58 °C down to 45 °C)', 'Boiling 100 °C'], ans: 1 },
      { q: 'What does excess bicarbonate alkalinity (>120 ppm KH) in brew water do to light roasts?', opts: ['Makes them taste extra fruity', 'Neutralizes fruit acids into a flat, chalky cup', 'Doubles caffeine'], ans: 1 },
      { q: 'How does storing sealed coffee at -18 °C in the freezer affect aging speed?', opts: ['Slows staling ~12x via Arrhenius kinetics', 'Roasts the beans darker', 'Adds caffeine'], ans: 0 }
    ];
    if (ls && ls.quiz && Array.isArray(ls.quiz.opts)) return ls.quiz;
    return bank[idx % bank.length];
  }

  const FALLBACK_FOLK_8 = [
    { id: 'temp-taste', claim: 'Boiling water burns light-roast coffee grounds.', tier: 'not', verdict: 'Myth Debunked: Roasted beans survived 200–220 °C in the roaster; slurry temperature in an open dripper stays 89–95 °C even with 100 °C kettle water.', app: 'BeanTelligence models actual open-CV slurry temperature and caps kettle setpoints safely below local elevation boiling.', cite: 'Batali, Ristenpart & Guinard (2020), Sci. Rep. 10:16450', doi: 'https://doi.org/10.1038/s41598-020-73341-4' },
    { id: 'zone-18-22', claim: '18 to 22% extraction is a strict universal law for everyone.', tier: 'not', verdict: 'Historical 1950s Lockhart convention — modern UC Davis consumer trials show drinkers split across multiple sweet spots.', app: 'BeanTelligence builds your personal 2D KDE Sweet-Spot Island from your own 4.0+ rated cups.', cite: 'Cotter et al. (2021), J. Food Sci. 86:194', doi: 'https://doi.org/10.1111/1750-3841.15561' },
    { id: 'rdt-static', claim: 'RDT water spritzing is merely cosmetic for static chaff.', tier: 'solid', verdict: 'Solid Science: 0.1 mL/20g quenches tribocharging, prevents fine-clump aggregates, and increases espresso consistency.', app: 'Covered in Module 5 & Espresso puck diagnostics.', cite: 'Mendez Harper & Hendon (2023), Matter 6:4408', doi: 'https://doi.org/10.1016/j.matt.2023.11.005' },
    { id: 'cortisol-90', claim: 'Everyone must delay morning coffee 90 minutes for cortisol.', tier: 'not', verdict: 'Unproven internet lore: No RCT demonstrates a 90-minute wait prevents afternoon fatigue; pushing caffeine later risks deep N3 sleep.', app: 'Models 24h Borbely Process C/S & Gardiner 2023 SWS bedtime cutoffs.', cite: 'Gardiner et al. (2023), Sleep Med. Rev. 69:101764', doi: 'https://doi.org/10.1016/j.smrv.2023.101764' },
    { id: 'serve-hot', claim: 'Black coffee tastes sweetest when served piping hot (>70 °C).', tier: 'not', verdict: 'Contradicted by TRPM5 biophysics & 3,186 consumer tastings: acceptance and perceived sweetness peak at 58–45 °C.', app: 'Golden Sip Clock tracks 70 \u2192 55 \u2192 42 °C sensory unlocking.', cite: 'Ristenpart, Cotter & Guinard (2022), Sci. Rep. 12:20621', doi: 'https://doi.org/10.1038/s41598-022-23904-4' },
    { id: 'decaf-chem', claim: 'Decaf coffee lacks antioxidants and microbiome benefits.', tier: 'not', verdict: 'Debunked: Chlorogenic polyphenols remain intact, driving near-identical Lawsonibacter enrichment and cardiometabolic benefits.', app: 'First-class decaf hydraulic & residual caffeine (0.40 mg/g) support.', cite: 'Manghi et al. (2024), Nat. Microbiol. 9:3120', doi: 'https://doi.org/10.1038/s41564-024-01858-9' },
    { id: 'cold-grind', claim: 'Grinding frozen beans from -18 °C alters particle size distribution.', tier: 'solid', verdict: 'Solid Science: Cryogenic brittle fracture narrows PSD span and shifts median size slightly finer at fixed burr gap.', app: 'Cryo-Vault applies automatic +12 um coarser frozen-grind offset.', cite: 'Uman, Colonna-Dashwood & Hendon (2016), Sci. Rep. 6:24483', doi: 'https://doi.org/10.1038/srep24483' },
    { id: 'dark-stomach', claim: 'Light roast is always gentler on stomach acid than dark roast.', tier: 'not', verdict: 'Darker roasts form 2–3x more N-methylpyridinium (NMP), which downregulates gastric parietal proton secretion.', app: 'Explained in Module 6 & Glossary.', cite: 'Rubach, Hofmann & Somoza (2014), Mol. Nutr. Food Res.', doi: 'https://doi.org/10.1002/mnfr.201300890' }
  ];

  const FALLBACK_GLOSSARY = [
    { term: 'Extraction Yield (EY%)', cat: 'Brewing & Physics', def: 'Percentage by mass of dry roasted coffee grounds dissolved into the brewed beverage.' },
    { term: 'Total Dissolved Solids (TDS%)', cat: 'Brewing & Physics', def: 'Mass concentration of dissolved coffee solids in your cup (~1.2–1.5% filter, ~8–12% espresso).' },
    { term: 'Darcy-Kozeny Law', cat: 'Brewing & Physics', def: 'Fluid percolation equation governing flow through a porous coffee bed; permeability scales with Sauter mean diameter squared.' },
    { term: 'Astringency', cat: 'Tasting & Sensory', def: 'Tactile dry sandpaper sensation caused when polyphenols precipitate lubricating salivary proline-rich proteins — distinct from bitter taste.' },
    { term: 'Retronasal Olfaction (OISE)', cat: 'Tasting & Sensory', def: 'Aroma volatiles rising behind the soft palate on exhale that create perceived sweetness in <0.05%-sugar black coffee.' },
    { term: 'TRPM5 Channel', cat: 'Tasting & Sensory', def: 'Thermosensitive taste-bud cation channel that unlocks maximum sweet perception as coffee cools into 55–40 °C.' },
    { term: 'Chlorogenic Acid Lactones', cat: 'Roasting & Freshness', def: 'Pleasant coffee-bitter compounds formed in light-to-medium roasting before degrading into harsh phenylindanes in dark roasts.' },
    { term: 'Cafestol & Kahweol', cat: 'Water & Chemistry', def: 'Lipid-soluble coffee diterpenes that raise serum LDL cholesterol in unfiltered brews; paper filters trap 95–99%.' },
    { term: 'Alkalinity (KH)', cat: 'Water & Chemistry', def: 'Proton-buffering capacity in brew water (target 30–65 ppm as CaCO3); excess KH flattens lively fruit acids.' },
    { term: 'Agtron Gourmet vs Commercial', cat: 'Roasting & Freshness', def: 'NIR roast reflectance scales related by M-Basic II Commercial = 0.7429 * (Gourmet + 1.528).' },
    { term: 'Tonino Roast Scale', cat: 'Roasting & Freshness', def: 'Spectrophotometric roast color scale pinned at SCA Gourmet 63 = Tonino 105.' },
    { term: 'Allotetraploid Arabica', cat: 'Botany & Terroir', def: 'Coffea arabica (44 chromosomes) formed by natural hybridization of C. eugenioides and C. canephora.' },
    { term: 'Ross Droplet Technique (RDT)', cat: 'Hardware & Espresso', def: 'Adding ~0.1 mL water per 20g beans prior to grinding to quench triboelectric static and clumping.' }
  ];

  function getCurriculumModules() {
    if (typeof ACADEMY_MODULES !== 'undefined' && Array.isArray(ACADEMY_MODULES) && ACADEMY_MODULES.length) return ACADEMY_MODULES;
    if (window.ACADEMY_MODULES && Array.isArray(window.ACADEMY_MODULES) && window.ACADEMY_MODULES.length) return window.ACADEMY_MODULES;
    return FALLBACK_MODULES_7;
  }

  function getLessonsList() {
    if (typeof LESSONS !== 'undefined' && Array.isArray(LESSONS) && LESSONS.length) return LESSONS;
    if (window.LESSONS && Array.isArray(window.LESSONS) && window.LESSONS.length) return window.LESSONS;
    return FALLBACK_LESSONS_19;
  }

  function getFolkClaims() {
    if (typeof FOLK_CLAIMS !== 'undefined' && Array.isArray(FOLK_CLAIMS) && FOLK_CLAIMS.length) return FOLK_CLAIMS;
    if (window.FOLK_CLAIMS && Array.isArray(window.FOLK_CLAIMS) && window.FOLK_CLAIMS.length) return window.FOLK_CLAIMS;
    return FALLBACK_FOLK_8;
  }

  function getGlossaryEntries() {
    if (typeof GLOSSARY !== 'undefined' && Array.isArray(GLOSSARY) && GLOSSARY.length) return GLOSSARY;
    if (window.GLOSSARY && Array.isArray(window.GLOSSARY) && window.GLOSSARY.length) return window.GLOSSARY;
    return FALLBACK_GLOSSARY;
  }

  function getReleasesList() {
    if (typeof RELEASES !== 'undefined' && Array.isArray(RELEASES) && RELEASES.length) return RELEASES;
    if (window.RELEASES && Array.isArray(window.RELEASES) && window.RELEASES.length) return window.RELEASES;
    return [{ v: 'v6.2', title: 'Actionable Charts, 5-Step Guided Home Brew, Web Audio & Empirical Bayes', notes: '148+ cumulative releases.' }];
  }

  /* ==========================================================================
   * LOCAL UI STATE FOR TAB 5 & SHEETS
   * ========================================================================== */
  function makeDefaultScaBowl(idx, name, scaDefault) {
    const code = String.fromCharCode(65 + idx);
    const targetSca = scaDefault || 85.0;
    const h = clamp((targetSca - 52.75) / 5.25, 1, 9, 6.143);
    const bowl = {
      code: code,
      name: name || ('Sample #' + (idx + 1)),
      roaster: '',
      origin: '',
      process: '',
      hVals: [h, h, h, h, h, h, h, h],
      nonUniformCups: 0,
      defectiveCups: 0,
      notes: '',
      score: targetSca
    };
    bowl.score = computeCvaBowlScore(bowl);
    return bowl;
  }

  const acadUi = {
    subView: 'gym', /* 'gym' | 'curriculum' | 'glossary' | 'folk' | 'vault' */
    voiceEnabled: true,
    quizChoices: {},
    openLessonsSet: new Set(),

    /* Editable 1-5 Bowl Multi-Coffee SCA/CVA Cupping */
    sca: {
      bowlCount: 3,
      bowlMl: 150,
      running: false,
      elapsedSec: 0,
      rafId: 0,
      blindMode: false,
      revealed: true,
      spoken4m: false,
      spoken8m: false,
      spoken12m: false,
      bowls: [
        makeDefaultScaBowl(0, 'Ethiopia Washed', 85.0),
        makeDefaultScaBowl(1, 'Colombia Pink Bourbon', 86.5),
        makeDefaultScaBowl(2, 'Kenya SL28', 88.5),
        makeDefaultScaBowl(3, 'Costa Rica Honey', 84.0),
        makeDefaultScaBowl(4, 'Brazil Natural', 82.5)
      ]
    },

    /* 6-Cup Kitchen Taste Calibrator (Sour vs Bitter Confusion Check) */
    kitchen: {
      waterMl: 250,
      citricHydrate: 'anhydrous', /* 'anhydrous' | 'monohydrate' (1.094x) */
      roundIdx: 0,
      quizAnswered: '',
      sessionScore: 0,
      sessionAsked: 0,
      stockHelperOpen: false
    },

    /* Beanjamin 2.0 Palate Gym Live Coach State (Single-per-viewport safe!) */
    gymCoach: {
      mood: 'curious',
      title: 'Welcome to the Palate Gym!',
      speech: 'Play a 60-second Kitchen Taste Round or Blind Triangle Cup below — sharpening Sour vs. Bitter unlocks effortless dial-ins!'
    },

    scaReturnToTaste: false,

    /* Salami 3-Glass Split Timer */
    salami: {
      mode: 'pourover', /* 'pourover' | 'espresso' */
      running: false,
      elapsedSec: 0,
      rafId: 0,
      verdict: ''
    },

    /* Self-Blind Turntable Triangle Cupping */
    triangle: {
      oddIndex: 1,
      dotMap: ['1 underside dot', '2 underside dots', '3 underside dots'],
      pickedIndex: -1,
      revealed: false,
      streak: 0
    },

    /* 32 Myth-Busters */
    folk: {
      deckIdx: 0,
      guessedTier: '',
      BrowseAll: false,
      query: '',
      filterTier: 'all'
    },

    /* 774-Term A-Z Glossary (Zero Nested Scroll Trap, View-40 Pagination) */
    glossary: {
      query: '',
      letter: 'ALL',
      cat: 'All',
      limit: 40
    },

    tourStep: 0
  };

  function resetTriangleRound() {
    const rnd = Math.floor(Math.random() * 3);
    const dots = ['1 underside dot', '2 underside dots', '3 underside dots'];
    for (let i = dots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = dots[i]; dots[i] = dots[j]; dots[j] = tmp;
    }
    acadUi.triangle.oddIndex = rnd;
    acadUi.triangle.dotMap = dots;
    acadUi.triangle.pickedIndex = -1;
    acadUi.triangle.revealed = false;
  }
  resetTriangleRound();

  /* ==========================================================================
   * SEGMENT 1: 19 MINI-COURSES (Accordion Modules & Lessons + Quiz Checkpoints)
   * ========================================================================== */
  function renderExplainCurrentCoffeeCard() {
    const c = (getApp() && getApp().coffee) || {};
    const name = c.name || 'Active Bag (Specialty Reference)';
    const origin = c.origin || 'Ethiopia';
    const proc = c.process || 'Washed';
    const roast = c.roast || 'Light';
    const isDecaf = c.decaf === 'yes' || c.decaf === true || /decaf/i.test(String(c.decaf || ''));

    const acExp = /light/i.test(roast) ? 84 : (/dark/i.test(roast) ? 38 : 62);
    const swExp = /honey|natural/i.test(proc) ? 88 : 78;
    const bdExp = /natural|wet|dark/i.test(proc + ' ' + roast) ? 82 : 54;

    return domH('section', { class: 'bt-studio-card bt-coffee-xray-card' },
      domH('div', { class: 'bt-lab-card-head' },
        domH('div', { class: 'bt-lab-title-group' },
          ic('xray-loupe', { size: 22 }),
          domH('div', null,
            domH('h3', { text: 'Explain My Current Coffee — Live Bean X-Ray' }),
            domH('p', { class: 'bt-lab-sub', text: name + ' · ' + origin + ' · ' + proc + ' · ' + roast })
          )
        ),
        epistemicPill('verified_science')
      ),
      domH('div', { class: 'bt-expect-bars' },
        [
          { lbl: 'Expected Brightness / Organic Acids', pct: acExp },
          { lbl: 'Retronasal Maillard & Ester Sweetness', pct: swExp },
          { lbl: 'Tactile Mouthfeel & Lipid Body', pct: bdExp }
        ].map(function (b) {
          return domH('div', { class: 'bt-expect-row' },
            domH('span', { class: 'bt-expect-lbl', text: b.lbl }),
            domH('div', { class: 'bt-expect-track' },
              domH('div', { class: 'bt-expect-fill', style: 'width:' + b.pct + '%' })
            ),
            domH('strong', { class: 'num-tab', text: b.pct + '%' })
          );
        })
      ),
      domH('p', {
        class: 'bt-lab-hint',
        text: isDecaf
          ? 'Decaf Physics Active: Porous cellular walls generate more micro-fines — start +8% coarser on pour-over or -5.5% finer on 9-bar espresso.'
          : (proc + ' processing paired with ' + roast + ' roast governs solubility and CO2 bloom outgassing.')
      })
    );
  }

  function renderCurriculumView() {
    const wrap = domH('div', { class: 'bt-academy-seg' });
    const st = readAcademyState();
    const modules = getCurriculumModules();
    const lessons = getLessonsList();

    wrap.appendChild(renderExplainCurrentCoffeeCard());

    /* 1. 19 Interactive Accordion Mini-Courses + Quiz Checkpoints */
    const doneLessonsCount = st.completedLessonIds.length + st.quizPassedIds.filter(function (id) {
      return st.completedLessonIds.indexOf(id) < 0;
    }).length;

    const lessonsCard = domH('section', { class: 'bt-studio-card', id: 'bt-academy-19-lessons' },
      domH('div', { class: 'bt-lab-card-head' },
        domH('div', { class: 'bt-lab-title-group' },
          ic('academy', { size: 22 }),
          domH('div', null,
            domH('h3', { text: '19 Interactive Coffee Mini-Courses (' + doneLessonsCount + ' / ' + lessons.length + ' Mastered)' }),
            domH('p', { class: 'bt-lab-sub', text: 'Tap any lesson accordion to read in 60 seconds and pass its 1-question check!' })
          )
        ),
        domH('button', {
          type: 'button',
          class: 'bt-lab-btn is-sm',
          onclick: function () { openNamedSheet('onboarding-tour', null, { detent: 'full', title: '30-Second App Tour' }); }
        }, 'App Tour \u2192')
      ),
      domH('div', { class: 'bt-lessons-accordion-stack' },
        lessons.map(function (ls, idx) {
          const lid = String(ls.id || ls.key || ('ls_' + idx));
          const passed = st.quizPassedIds.indexOf(lid) >= 0 || st.completedLessonIds.indexOf(lid) >= 0;
          const badgeText = extractBadgeLabel(ls.badge, ls.epistemicTier || ls.rate);
          const paras = Array.isArray(ls.paras) && ls.paras.length
            ? ls.paras
            : [ls.lead || ls.summary || ls.body || 'Verified coffee science lesson.'];
          const quiz = getQuizForLesson(idx, ls);
          const pickedOpt = acadUi.quizChoices[lid];
          const isWrongPicked = pickedOpt != null && pickedOpt !== quiz.ans;
          const isRightPicked = pickedOpt != null && pickedOpt === quiz.ans;

          const detEl = domH('details', {
            class: 'bt-lab-details bt-lesson-accordion' + (passed ? ' is-completed' : ''),
            open: acadUi.openLessonsSet.has(lid)
          },
            domH('summary', { class: 'bt-lesson-summary' },
              domH('span', { class: 'bt-lesson-title', text: (ls.title || ls.name || lid) }),
              domH('span', { class: 'bt-lesson-meta' },
                domH('span', { class: 'bt-lesson-badge-txt', text: badgeText }),
                passed ? domH('span', { class: 'bt-lesson-done-pill', text: 'Mastered' }) : null
              )
            ),
            domH('div', { class: 'bt-lesson-body' },
              paras.slice(0, 4).map(function (pTxt) {
                return domH('p', { class: 'bt-module-body', text: String(pTxt) });
              }),
              Array.isArray(ls.tips) && ls.tips.length ? domH('ul', { class: 'bt-lab-list' },
                ls.tips.slice(0, 3).map(function (t) { return domH('li', { text: String(t) }); })
              ) : null,
              domH('div', { class: 'bt-lesson-quiz-box' },
                domH('strong', { text: 'Quick Check: ' + quiz.q }),
                domH('div', { class: 'bt-quiz-opts' },
                  quiz.opts.map(function (optTxt, oIdx) {
                    const isSelected = pickedOpt === oIdx;
                    const isRight = oIdx === quiz.ans;
                    const cls = isSelected ? (isRight ? ' is-correct' : ' is-wrong') : (passed && isRight ? ' is-correct' : '');
                    return domH('button', {
                      type: 'button',
                      class: 'bt-lab-chip bt-quiz-opt' + cls,
                      onclick: function () {
                        acadUi.quizChoices[lid] = oIdx;
                        acadUi.openLessonsSet.add(lid);
                        if (isRight) {
                          const cur = readAcademyState();
                          if (cur.quizPassedIds.indexOf(lid) < 0) cur.quizPassedIds.push(lid);
                          if (cur.completedLessonIds.indexOf(lid) < 0) cur.completedLessonIds.push(lid);
                          writeAcademyState(cur);
                          CK.haptic('celebrate');
                          notify('Correct! Lesson mastered.');
                        } else {
                          CK.haptic('snap');
                          notify('Not quite — try another answer!');
                        }
                        rerenderAcademyTab();
                      }
                    }, optTxt);
                  })
                ),
                isWrongPicked ? domH('p', {
                  class: 'bt-quiz-feedback is-wrong',
                  role: 'status',
                  style: 'margin:8px 0 0;font-size:0.82rem;font-weight:700;color:var(--bad, #A93226)',
                  text: 'Not quite \u2014 that choice is incorrect. Review the lesson takeaway above and try another answer!'
                }) : (isRightPicked ? domH('p', {
                  class: 'bt-quiz-feedback is-correct',
                  role: 'status',
                  style: 'margin:8px 0 0;font-size:0.82rem;font-weight:700;color:var(--good, #1B6341)',
                  text: 'Correct! Lesson mastered.'
                }) : null)
              )
            )
          );
          detEl.addEventListener('toggle', function () {
            if (detEl.open) acadUi.openLessonsSet.add(lid);
            else acadUi.openLessonsSet.delete(lid);
          });
          return detEl;
        })
      )
    );
    wrap.appendChild(lessonsCard);

    /* 2. 7 Deep-Dive Peer-Reviewed Reference Modules (Accordion-Collapsed!) */
    const modWrapper = domH('section', { class: 'bt-studio-card' },
      domH('div', { class: 'bt-lab-card-head' },
        domH('div', { class: 'bt-lab-title-group' },
          ic('check-seal', { size: 20 }),
          domH('div', null,
            domH('h3', { text: '7 Peer-Reviewed Science Reference Modules' }),
            domH('p', { class: 'bt-lab-sub', text: 'Accordion-collapsed deep dives across botany, terroir, decaf, roasting, extraction, PK & neurogastronomy' })
          )
        )
      ),
      domH('div', { class: 'bt-lessons-accordion-stack' },
        modules.map(function (mod) {
          const done = st.completedModuleIds.indexOf(mod.id) >= 0;
          const cardsList = Array.isArray(mod.cards)
            ? mod.cards
            : [{ title: mod.title, tier: mod.tier, body: mod.body, cite: 'Peer-Reviewed Coffee Science Curriculum' }];
          return domH('details', { class: 'bt-lab-details bt-lesson-accordion' + (done ? ' is-completed' : '') },
            domH('summary', { class: 'bt-lesson-summary' },
              domH('span', { class: 'bt-lesson-title', text: 'Module ' + mod.num + ': ' + mod.title }),
              epistemicPill(mod.tier)
            ),
            domH('div', { class: 'bt-lesson-body' },
              mod.sub ? domH('p', { class: 'bt-lab-sub', text: mod.sub }) : null,
              cardsList.map(function (c) {
                return domH('article', { class: 'bt-lab-subcard' },
                  domH('strong', { text: c.title }),
                  domH('p', { class: 'bt-module-body', text: c.body }),
                  c.cite ? domH('p', { class: 'bt-module-cite', text: 'Sources: ' + c.cite }) : null
                );
              }),
              domH('button', {
                type: 'button',
                class: 'bt-lab-chip' + (done ? ' is-active' : ''),
                onclick: function () {
                  const cur = readAcademyState();
                  if (cur.completedModuleIds.indexOf(mod.id) >= 0) {
                    cur.completedModuleIds = cur.completedModuleIds.filter(function (x) { return x !== mod.id; });
                  } else {
                    cur.completedModuleIds.push(mod.id);
                    CK.haptic('celebrate');
                  }
                  writeAcademyState(cur);
                  rerenderAcademyTab();
                }
              }, done ? 'Module Completed' : 'Mark Module Complete')
            )
          );
        })
      )
    );
    wrap.appendChild(modWrapper);

    return wrap;
  }

  /* ==========================================================================
   * SEGMENT 2: EDITABLE 5-BOWL CUPPING, 6-CUP KITCHEN CALIBRATOR & PALATE GYM
   * ========================================================================== */
  function polarDialXY(cx, cy, r, deg) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  }

  function dialArcPath(cx, cy, r, startDeg, endDeg) {
    const span = clamp(endDeg - startDeg, 0.5, 359.5, 1);
    const large = span > 180 ? 1 : 0;
    const p0 = polarDialXY(cx, cy, r, startDeg);
    const p1 = polarDialXY(cx, cy, r, startDeg + span);
    return 'M ' + p0[0].toFixed(2) + ' ' + p0[1].toFixed(2) +
      ' A ' + r + ' ' + r + ' 0 ' + large + ' 1 ' + p1[0].toFixed(2) + ' ' + p1[1].toFixed(2);
  }

  function computeThreeWavesAt(uFrac) {
    const u = clamp(uFrac, 0, 1, 0);
    return {
      thetaA: clamp(1 - Math.exp(-5.0 * u), 0, 1, 0),
      thetaS: clamp(Math.pow(Math.sin(Math.min(1, u * 1.1) * Math.PI * 0.62), 1.4), 0, 1, 0),
      thetaB: clamp(Math.pow(u, 2.3), 0, 1, 0)
    };
  }

  function mountGymChronoDial(cfg) {
    const totalSec = Math.max(10, cfg.totalTargetS || 165);
    const mode = cfg.mode || 'salami';
    const phases = Array.isArray(cfg.phases) ? cfg.phases : [];

    const chronoFn = (window.BTTactile && typeof window.BTTactile.BTChronoDial === 'function')
      ? window.BTTactile.BTChronoDial
      : (typeof BTChronoDial === 'function' ? BTChronoDial : null);

    if (chronoFn) {
      try {
        const dialEl = chronoFn({
          mode: mode,
          elapsedS: cfg.elapsedS || 0,
          totalTargetS: totalSec,
          phases: phases,
          phaseLabel: cfg.phaseLabel || '',
          subLabel: cfg.subLabel || '',
          waves: computeThreeWavesAt((cfg.elapsedS || 0) / totalSec),
          showTenths: true
        });
        if (dialEl && dialEl.nodeType === 1) {
          dialEl.classList.add('bt-gym-chrono-dial');
          return {
            el: dialEl,
            update: function (sec, phaseLabel, subLabel) {
              if (typeof dialEl.update === 'function') {
                dialEl.update({
                  elapsedS: sec,
                  totalTargetS: totalSec,
                  phaseLabel: phaseLabel || '',
                  subLabel: subLabel || '',
                  waves: computeThreeWavesAt(sec / totalSec)
                });
              }
            }
          };
        }
      } catch (_) {}
    }

    const CX = 130, CY = 130;
    const svg = CK.svgEl('svg', {
      viewBox: '0 0 260 260',
      class: 'bt-chart-svg bt-gym-chrono-dial bt-chrono-fallback-svg',
      'aria-label': cfg.ariaLabel || '60-Tick Brew & Cupping Chronograph'
    });
    svg.appendChild(CK.svgEl('circle', { cx: String(CX), cy: String(CY), r: '120', class: 'bt-chrono-face' }));
    for (let t = 0; t < 60; t++) {
      const deg = t * 6;
      const major = t % 5 === 0;
      const pOuter = polarDialXY(CX, CY, 115, deg);
      const pInner = polarDialXY(CX, CY, major ? 104 : 110, deg);
      svg.appendChild(CK.svgEl('line', {
        x1: pInner[0].toFixed(2),
        y1: pInner[1].toFixed(2),
        x2: pOuter[0].toFixed(2),
        y2: pOuter[1].toFixed(2),
        class: major ? 'bt-chrono-tick-major' : 'bt-chrono-tick'
      }));
    }
    phases.forEach(function (ph) {
      const a0 = clamp((ph.startS / totalSec) * 360, 0, 359, 0);
      const a1 = clamp((ph.endS / totalSec) * 360, a0 + 1, 359.8, 120);
      svg.appendChild(CK.svgEl('path', {
        d: dialArcPath(CX, CY, 94, a0 + 1.2, a1 - 1.2),
        fill: 'none',
        stroke: ph.color || '#E8844A',
        'stroke-width': '6',
        'stroke-linecap': 'round'
      }));
    });
    const R_SWEEP = 80;
    const CIRC = 2 * Math.PI * R_SWEEP;
    const comet = CK.svgEl('circle', {
      cx: String(CX), cy: String(CY), r: String(R_SWEEP),
      fill: 'none', stroke: '#26A669', 'stroke-width': '5', 'stroke-linecap': 'round',
      'stroke-dasharray': CIRC.toFixed(1), 'stroke-dashoffset': CIRC.toFixed(1),
      transform: 'rotate(-90 ' + CX + ' ' + CY + ')'
    });
    svg.appendChild(comet);
    const handG = CK.svgEl('g', { transform: 'rotate(0 ' + CX + ' ' + CY + ')' });
    handG.appendChild(CK.svgEl('line', { x1: String(CX), y1: String(CY + 12), x2: String(CX), y2: String(CY - 96), stroke: '#E8844A', 'stroke-width': '2.2', 'stroke-linecap': 'round' }));
    handG.appendChild(CK.svgEl('circle', { cx: String(CX), cy: String(CY), r: '4', fill: '#E8844A' }));
    svg.appendChild(handG);

    const digitsTxt = CK.svgEl('text', { x: String(CX), y: String(CY + 6), 'text-anchor': 'middle', class: 'bt-chrono-digits num-tab' });
    digitsTxt.textContent = '00:00.0';
    const phaseTxt = CK.svgEl('text', { x: String(CX), y: String(CY + 25), 'text-anchor': 'middle', class: 'bt-chrono-phase' });
    phaseTxt.textContent = (cfg.phaseLabel || 'READY').toUpperCase();
    svg.appendChild(digitsTxt);
    svg.appendChild(phaseTxt);

    return {
      el: svg,
      update: function (sec, phaseLabel) {
        const s = Math.max(0, sec);
        const frac = clamp(s / totalSec, 0, 1, 0);
        comet.setAttribute('stroke-dashoffset', (CIRC * (1 - frac)).toFixed(1));
        handG.setAttribute('transform', 'rotate(' + (((s % 60) / 60) * 360).toFixed(1) + ' ' + CX + ' ' + CY + ')');
        const mins = Math.floor(s / 60);
        const secs = Math.floor(s % 60);
        const tenths = Math.floor((s - Math.floor(s)) * 10);
        digitsTxt.textContent = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0') + '.' + tenths;
        if (phaseLabel) phaseTxt.textContent = phaseLabel.toUpperCase();
      }
    };
  }

  /* ---- 1. Editable 1-5 Bowl Multi-Coffee Cupping Table ---- */
  const CUPPING_TRAIT_GUIDES = [
    { name: 'Fragrance', hint: 'Smell of freshly ground dry coffee before pouring hot water' },
    { name: 'Aroma', hint: 'Wet smell rising from the bowl on pour & when breaking the 4:00 crust' },
    { name: 'Flavor', hint: 'Combined taste + aroma notes in your mouth when you slurp' },
    { name: 'Aftertaste', hint: 'How sweet, clean, or lingering the finish stays after swallowing' },
    { name: 'Acidity', hint: 'Bright, juicy fruit liveliness (like crisp apple or peach — NOT stomach acid!)' },
    { name: 'Sweetness', hint: 'Smooth ripe-fruit, honey, or caramel roundness on your tongue' },
    { name: 'Mouthfeel', hint: 'Weight & texture in your mouth (delicate tea-light vs. creamy/syrupy)' },
    { name: 'Overall', hint: 'Your complete personal enjoyment & harmony of the cup' }
  ];

  function fmtMmSs(secFloat) {
    const s = Math.max(0, Math.floor(secFloat || 0));
    const mm = Math.floor(s / 60);
    const ss = s % 60;
    return String(mm).padStart(2, '0') + ':' + String(ss).padStart(2, '0');
  }

  function buildScaCockpitWidget(opts) {
    const o = opts || {};
    const isSheet = !!o.isSheet;
    const sca = acadUi.sca;
    const dosePerBowlG = +((8.25 * sca.bowlMl) / 150).toFixed(2);

    const card = domH('section', {
      class: 'bt-studio-card bt-sca-cockpit-card',
      id: 'bt-sca-5bowl-table',
      style: 'min-width:0;max-width:100%;box-sizing:border-box'
    });
    const phaseBanner = domH('p', { class: 'bt-lab-hint', text: '' });
    const liveClockPill = domH('span', { class: 'bt-sca-mmss-pill num-tab', id: 'bt-sca-live-mmss', text: fmtMmSs(sca.elapsedSec || 0) + ' · ~93 °C' });

    const stepCardsData = [
      { idx: 0, time: '0:00', title: '1. Smell Dry & Pour', desc: 'Weigh ' + dosePerBowlG + 'g medium-coarse coffee per ' + sca.bowlMl + ' mL bowl, smell dry grounds, then pour 93 °C water to rim.' },
      { idx: 1, time: '4:00', title: '2. Break Crust & Smell', desc: 'Put nose close to bowl and gently push top grounds 3× with spoon to release trapped aroma.' },
      { idx: 2, time: '8:00', title: '3. Skim Foam', desc: 'Use 2 spoons to skim off floating grounds and foam so the cup cools cleanly.' },
      { idx: 3, time: '12:00+', title: '4. Slurp Warm & Score', desc: 'Slurp briskly from spoon as bowls cool (65 °C \u2192 45 °C) and rate Overall Enjoyment (1–9) below!' }
    ];
    const stepCardNodes = stepCardsData.map(function (st) {
      return domH('div', { class: 'bt-cupping-step-card' },
        domH('span', { class: 'bt-cupping-step-time num-tab', text: st.time }),
        domH('strong', { text: st.title }),
        domH('p', { text: st.desc })
      );
    });

    function getScaPhaseLabel(s) {
      if (s === 0) return 'Step 1: Smell Dry Grounds';
      if (s < 240) return 'Steeping Untouched \u2192 04:00';
      if (s < 480) return '04:00 Break Crust & Smell';
      if (s < 720) return '08:00 Skim & Cool to 70 °C';
      return '12:00 Golden Slurp (58–62 °C)';
    }

    const scaChrono = mountGymChronoDial({
      mode: 'cupping',
      totalTargetS: 900,
      elapsedS: sca.elapsedSec || 0,
      ariaLabel: '5-Bowl Voice-Guided Cupping Timer',
      phaseLabel: getScaPhaseLabel(sca.elapsedSec || 0),
      phases: [
        { label: 'Steep to 04:00', startS: 0, endS: 240, color: '#F5B041' },
        { label: '04:00 Break Crust', startS: 240, endS: 480, color: '#E8844A' },
        { label: '08:00 Skim & 70 °C Slurp', startS: 480, endS: 720, color: '#26A669' },
        { label: '12:00 Golden Slurp', startS: 720, endS: 900, color: '#4BA3C7' }
      ]
    });

    function syncScaChrono(secFloat) {
      const s = Math.floor(secFloat);
      const estTempC = +(22 + 71 * Math.exp(-secFloat / 720)).toFixed(1);
      liveClockPill.textContent = fmtMmSs(secFloat) + ' · Est. ~' + estTempC + ' °C';
      scaChrono.update(secFloat, getScaPhaseLabel(secFloat), 'Est. Bowl ~' + estTempC + ' °C');
      const activeStepIdx = s < 240 ? 0 : (s < 480 ? 1 : (s < 720 ? 2 : 3));
      stepCardNodes.forEach(function (nd, idx) {
        nd.classList.toggle('is-active-phase', idx === activeStepIdx);
      });
      if (s === 0) phaseBanner.textContent = 'Step 1: Weigh ' + dosePerBowlG + ' g per ' + sca.bowlMl + ' mL bowl (1:18.18). Smell dry fragrance, then pour 93 °C water to the rim & press Start.';
      else if (s < 240) phaseBanner.textContent = 'Steeping untouched (' + fmtMmSs(240 - s) + ' left until 04:00 Break Crust voice cue).';
      else if (s < 480) phaseBanner.textContent = '04:00 BREAK CRUST: Push top crust gently 3× nose-close to smell wet aroma, then get ready to skim!';
      else if (s < 720) phaseBanner.textContent = '08:00–10:00 SKIM & COOL TO ~70 °C: Skim floating foam and take your first warm slurp from a spoon across all bowls.';
      else phaseBanner.textContent = '12:00+ GOLDEN SLURP (~58 °C \u2192 42 °C): Peak sweetness & fruit clarity! Score Overall Enjoyment (1–9) & cup consistency below.';
    }

    function tickScaRaf() {
      if (!sca.running) return;
      const nowElapsed = (sca._baseSec || 0) + (performance.now() - (sca._t0Ms || performance.now())) / 1000;
      sca.elapsedSec = nowElapsed;
      if (!sca.spoken4m && nowElapsed >= 240) {
        sca.spoken4m = true;
        CK.haptic('celebrate');
        speakCueSafe('Four minutes. Break the crust gently three times and smell the wet aroma.', 'step');
      }
      if (!sca.spoken8m && nowElapsed >= 480) {
        sca.spoken8m = true;
        CK.haptic('sweetSpotLock');
        speakCueSafe('Eight minutes. Skim foam and begin your seventy degree hot slurp.', 'step');
      }
      if (!sca.spoken12m && nowElapsed >= 720) {
        sca.spoken12m = true;
        CK.haptic('celebrate');
        speakCueSafe('Twelve minutes. Golden slurp window open for peak sweetness and balance.', 'golden');
      }
      syncScaChrono(nowElapsed);
      sca.rafId = requestAnimationFrame(tickScaRaf);
    }

    const bowlCountPills = [1, 2, 3, 4, 5].map(function (n) {
      return domH('button', {
        type: 'button',
        class: 'bt-lab-chip' + (sca.bowlCount === n ? ' is-active' : ''),
        'aria-pressed': String(sca.bowlCount === n),
        onclick: function () {
          sca.bowlCount = n;
          while (sca.bowls.length < n) {
            sca.bowls.push(makeDefaultScaBowl(sca.bowls.length));
          }
          CK.haptic('tick');
          if (isSheet && o.hostEl) renderScaCuppingSheet(o.hostEl);
          else rerenderAcademyTab();
        }
      }, n + (n === 1 ? ' Bowl' : ' Bowls'));
    });

    /* Load Open Bags from My Beans into Bowls */
    const loadCellarBtn = domH('button', {
      type: 'button',
      class: 'bt-lab-chip',
      onclick: function () {
        const st = window.BTStorage || {};
        let list = [];
        if (typeof st.buildUnifiedCoffeesIndex === 'function') {
          try { list = st.buildUnifiedCoffeesIndex() || []; } catch (_) { list = []; }
        }
        if (!list.length && typeof st.getCoffeesVaultList === 'function') {
          try { list = st.getCoffeesVaultList() || []; } catch (_) { list = []; }
        }
        if (!list.length) {
          const pr = typeof st.getPrices === 'function' ? st.getPrices() : null;
          list = pr && Array.isArray(pr.list) ? pr.list : [];
        }
        if (!list.length) {
          notify('No bags saved in My Beans yet — type sample names directly in each bowl below!');
          return;
        }
        const take = Math.min(5, list.length);
        sca.bowlCount = take;
        sca._lastSavedSig = '';
        while (sca.bowls.length < take) {
          sca.bowls.push(makeDefaultScaBowl(sca.bowls.length));
        }
        for (let i = 0; i < take; i++) {
          const b = list[i] || {};
          const rawC = (b.coffee && typeof b.coffee === 'object') ? b.coffee : b;
          const bNotes = String(rawC.bag_notes || rawC.notes || (Array.isArray(rawC.flavors) ? rawC.flavors.join(', ') : '') || '').trim();
          sca.bowls[i].coffee_id = rawC.coffee_id || rawC.id || b.coffee_id || b.id || '';
          sca.bowls[i].name = rawC.name || rawC.coffee || b.name || b.coffee || ('Sample #' + (i + 1));
          sca.bowls[i].roaster = rawC.roaster || b.roaster || '';
          sca.bowls[i].origin = rawC.origin || b.origin || '';
          sca.bowls[i].process = rawC.process || b.process || '';
          sca.bowls[i].roast = rawC.roast || rawC.rlevel || b.roast || b.rlevel || '';
          sca.bowls[i].varietal = rawC.varietal || b.varietal || '';
          sca.bowls[i].farm = rawC.farm || rawC.farm_or_station || b.farm || '';
          sca.bowls[i].elevation_m = rawC.elevation_m || b.elevation_m || '';
          sca.bowls[i].agtron = rawC.agtron || b.agtron || '';
          sca.bowls[i].bag_notes = bNotes;
          sca.bowls[i].notes = bNotes;
          sca.bowls[i].flavors = Array.isArray(rawC.flavors) ? rawC.flavors.slice() : (bNotes ? bNotes.split(/[,;/]+/).map(function (s) { return s.trim(); }).filter(Boolean) : []);
          sca.bowls[i].nonUniformCups = 0;
          sca.bowls[i].defectiveCups = 0;
          sca.bowls[i].defects = 0;
          sca.bowls[i].defect_notes = '';
          setBowlTargetScaBase(sca.bowls[i], 85.0);
        }
        CK.haptic('snap');
        notify('Loaded ' + take + ' coffee(s) from My Beans into Cupping Bowls!');
        if (isSheet && o.hostEl) renderScaCuppingSheet(o.hostEl);
        else rerenderAcademyTab();
      }
    }, ic('fresh-bag', { size: 14 }), domH('span', { text: 'Load from My Beans' }));

    const blindToggleBtn = domH('button', {
      type: 'button',
      id: 'bt-sca-blind-toggle-btn',
      class: 'bt-lab-chip' + (!sca.revealed ? ' is-active' : ''),
      onclick: function () {
        sca.revealed = !sca.revealed;
        CK.haptic(sca.revealed ? 'celebrate' : 'tick');
        if (isSheet && o.hostEl) renderScaCuppingSheet(o.hostEl);
        else rerenderAcademyTab();
      }
    }, sca.revealed ? 'Blind Mode: Hide Coffees' : 'Show Blinds / Reveal Coffees');

    const voiceToggleBtn = domH('button', {
      type: 'button',
      class: 'bt-lab-chip' + (acadUi.voiceEnabled ? ' is-active' : ''),
      onclick: function () {
        acadUi.voiceEnabled = !acadUi.voiceEnabled;
        if (acadUi.voiceEnabled) {
          unlockAudioSafe();
          speakCueSafe('Cupping voice cues enabled.', 'step');
        }
        if (isSheet && o.hostEl) renderScaCuppingSheet(o.hostEl);
        else rerenderAcademyTab();
      }
    }, acadUi.voiceEnabled ? 'Voice Cues ON' : 'Voice Cues Muted');

    const scaHeroHost = domH('div', { id: 'bt-sca-score-hero', style: 'display:flex;flex-direction:column;gap:8px' });

    function paintScaHeroOnly() {
      scaHeroHost.textContent = '';
      let topScore = -1;
      let topBowl = null;
      const activeBowls = [];
      for (let i = 0; i < sca.bowlCount; i++) {
        const b = sca.bowls[i];
        b.score = computeCvaBowlScore(b);
        activeBowls.push(b);
        if (b.score > topScore) { topScore = b.score; topBowl = b; }
      }

      if (sca.revealed && topBowl) {
        scaHeroHost.appendChild(domH('div', { class: 'bt-sca-reveal-banner', id: 'bt-sca-reveal-banner' },
          domH('div', { style: 'display:flex;align-items:center;gap:8px;min-width:0' },
            ic('check-seal', { size: 20 }),
            domH('div', null,
              domH('strong', { style: 'font-size:0.9rem;display:block', text: 'Coffees Revealed \u00B7 Top Cup: Bowl ' + topBowl.code + ' (' + (topBowl.name || 'Sample') + ')' }),
              domH('span', { class: 'bt-lab-hint', text: topBowl.score.toFixed(1) + ' / 100 SCA \u00B7 ' + computeBowlStars(topBowl.score).toFixed(2) + ' / 5 Stars \u00B7 ' + bowlQualityTier(topBowl.score).text })
            )
          ),
          domH('span', { class: 'bt-tc-badge is-good num-tab', text: topBowl.score.toFixed(1) + ' SCA Leader' })
        ));
      } else {
        scaHeroHost.appendChild(domH('div', { class: 'bt-tc-well', style: 'padding:9px 12px;flex-direction:row;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px' },
          domH('span', { style: 'font-size:0.84rem;font-weight:700', text: 'Blind Mode Active \u2014 Score all bowls without bias, then reveal coffees!' }),
          domH('button', {
            type: 'button',
            class: 'bt-tc-pill is-compact is-copper',
            text: 'Reveal Coffees \u2192',
            onclick: function () {
              sca.revealed = true;
              CK.haptic('celebrate');
              if (isSheet && o.hostEl) renderScaCuppingSheet(o.hostEl);
              else rerenderAcademyTab();
            }
          })
        ));
      }

      scaHeroHost.appendChild(domH('div', { class: 'bt-sca-hero-grid' },
        activeBowls.map(function (b) {
          const isLeader = topBowl && b === topBowl;
          const stars = computeBowlStars(b.score);
          const tier = bowlQualityTier(b.score);
          const dispName = sca.revealed ? (b.name || ('Sample ' + b.code)) : ('Blind Bowl ' + b.code);
          return domH('div', { class: 'bt-sca-bowl-mini' + (isLeader ? ' is-leader' : '') },
            domH('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:6px' },
              domH('strong', { style: 'font-size:0.8rem', text: 'Bowl ' + b.code }),
              domH('span', { class: 'bt-tc-badge ' + tier.tone, style: 'font-size:0.68rem;padding:2px 7px', text: tier.text })
            ),
            domH('span', { style: 'font-size:0.82rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis', text: dispName }),
            domH('div', { class: 'num-tab', style: 'display:flex;align-items:baseline;justify-content:space-between;gap:6px;margin-top:2px' },
              domH('strong', { style: 'font-size:1.05rem', text: b.score.toFixed(1) + ' SCA' }),
              domH('span', { style: 'font-size:0.78rem;font-weight:700;color:var(--accent)', text: stars.toFixed(2) + ' / 5' })
            )
          );
        })
      ));
    }

    const bowlsGrid = domH('div', { class: 'bt-sca-bowls-grid' });
    const SCA_PRESETS = [7.5, 8.0, 8.25, 8.5, 8.75, 9.0];

    for (let i = 0; i < sca.bowlCount; i++) {
      (function (bObj) {
        bObj.score = computeCvaBowlScore(bObj);
        const scoreBadge = domH('strong', { class: 'bt-sca-score-live num-tab', text: bObj.score.toFixed(2) + ' / 100 SCA \u00B7 ' + computeBowlStars(bObj.score).toFixed(2) + ' / 5' });
        const tierBadge = domH('span', { class: 'bt-tc-badge ' + bowlQualityTier(bObj.score).tone, text: bowlQualityTier(bObj.score).text });

        const nameInput = domH('input', {
          type: sca.revealed ? 'text' : 'password',
          class: 'bt-lab-text-in',
          value: bObj.name,
          placeholder: 'Sample ' + bObj.code + ' coffee name...',
          'aria-label': 'Bowl ' + bObj.code + ' coffee name',
          oninput: function () { bObj.name = nameInput.value; paintScaHeroOnly(); }
        });

        const notesInput = domH('input', {
          type: 'text',
          class: 'bt-lab-text-in',
          value: bObj.notes || '',
          placeholder: 'Bowl ' + bObj.code + ' flavor notes (e.g. jasmine, peach, juicy)...',
          'aria-label': 'Bowl ' + bObj.code + ' tasting notes',
          oninput: function () { bObj.notes = notesInput.value; }
        });

        const presetBtns = [];
        const traitPillRefs = [];

        function syncBowlCardVisuals() {
          bObj.score = computeCvaBowlScore(bObj);
          const stars = computeBowlStars(bObj.score);
          const tier = bowlQualityTier(bObj.score);
          scoreBadge.textContent = bObj.score.toFixed(2) + ' / 100 SCA \u00B7 ' + stars.toFixed(2) + ' / 5';
          tierBadge.className = 'bt-tc-badge ' + tier.tone;
          tierBadge.textContent = tier.text;
          const baseBeforeDef = bObj.score + 2 * (bObj.nonUniformCups || 0) + 4 * (bObj.defectiveCups || 0);
          presetBtns.forEach(function (pb) {
            const on = Math.abs(baseBeforeDef - pb.val * 10) < 0.13;
            pb.btn.className = 'bt-tc-pill is-compact num-tab' + (on ? ' is-active' : ' is-soft');
            pb.btn.setAttribute('aria-pressed', String(on));
          });
          traitPillRefs.forEach(function (tr) {
            const curH = Math.round(bObj.hVals[tr.aIdx] || 7);
            tr.valSpan.textContent = (+bObj.hVals[tr.aIdx]).toFixed(1).replace(/\.0$/, '') + ' / 9';
            tr.btns.forEach(function (tb, bIdx) {
              const on = (bIdx + 1) === curH;
              tb.className = 'bt-tc-pill is-compact num-tab' + (on ? ' is-active' : ' is-soft');
              tb.setAttribute('aria-pressed', String(on));
            });
          });
          paintScaHeroOnly();
        }

        const presetRow = domH('div', { class: 'bt-sca-preset-row', role: 'group', 'aria-label': 'Bowl ' + bObj.code + ' SCA presets' },
          SCA_PRESETS.map(function (pv) {
            const bBtn = domH('button', {
              type: 'button',
              class: 'bt-tc-pill is-compact is-soft num-tab',
              text: String(pv),
              onclick: function () {
                setBowlTargetScaBase(bObj, pv * 10);
                CK.haptic('tick');
                syncBowlCardVisuals();
              }
            });
            presetBtns.push({ val: pv, btn: bBtn });
            return bBtn;
          })
        );

        const stepperRow = domH('div', { class: 'bt-sca-stepper-row' },
          domH('div', { style: 'display:flex;align-items:center;gap:6px' },
            domH('button', {
              type: 'button',
              class: 'bt-tc-finetune-btn',
              'aria-label': 'Bowl ' + bObj.code + ' minus 0.25',
              text: '-0.25',
              onclick: function () {
                const curBase = bObj.score + 2 * (bObj.nonUniformCups || 0) + 4 * (bObj.defectiveCups || 0);
                setBowlTargetScaBase(bObj, clamp(curBase - 0.25, 58, 100, 84.75));
                CK.haptic('tick');
                syncBowlCardVisuals();
              }
            }),
            domH('button', {
              type: 'button',
              class: 'bt-tc-finetune-btn',
              'aria-label': 'Bowl ' + bObj.code + ' plus 0.25',
              text: '+0.25',
              onclick: function () {
                const curBase = bObj.score + 2 * (bObj.nonUniformCups || 0) + 4 * (bObj.defectiveCups || 0);
                setBowlTargetScaBase(bObj, clamp(curBase + 0.25, 58, 100, 85.25));
                CK.haptic('tick');
                syncBowlCardVisuals();
              }
            })
          ),
          tierBadge
        );

        const taintBtn = domH('button', {
          type: 'button',
          class: 'bt-tc-pill is-compact' + (bObj.nonUniformCups > 0 ? ' is-copper' : ' is-soft'),
          'aria-pressed': String(bObj.nonUniformCups > 0),
          text: 'Taint (-2): ' + bObj.nonUniformCups + '/5',
          onclick: function () {
            bObj.nonUniformCups = (bObj.nonUniformCups + 1) % 6;
            this.className = 'bt-tc-pill is-compact' + (bObj.nonUniformCups > 0 ? ' is-copper' : ' is-soft');
            this.setAttribute('aria-pressed', String(bObj.nonUniformCups > 0));
            this.textContent = 'Taint (-2): ' + bObj.nonUniformCups + '/5';
            CK.haptic('tick');
            syncBowlCardVisuals();
          }
        });

        const faultBtn = domH('button', {
          type: 'button',
          class: 'bt-tc-pill is-compact' + (bObj.defectiveCups > 0 ? ' is-copper' : ' is-soft'),
          'aria-pressed': String(bObj.defectiveCups > 0),
          text: 'Fault (-4): ' + bObj.defectiveCups + '/5',
          onclick: function () {
            bObj.defectiveCups = (bObj.defectiveCups + 1) % 6;
            this.className = 'bt-tc-pill is-compact' + (bObj.defectiveCups > 0 ? ' is-copper' : ' is-soft');
            this.setAttribute('aria-pressed', String(bObj.defectiveCups > 0));
            this.textContent = 'Fault (-4): ' + bObj.defectiveCups + '/5';
            CK.haptic('tick');
            syncBowlCardVisuals();
          }
        });

        const defectResetBtn = domH('button', {
          type: 'button',
          class: 'bt-tc-pill is-compact is-soft',
          text: 'Clean (0)',
          onclick: function () {
            bObj.nonUniformCups = 0;
            bObj.defectiveCups = 0;
            taintBtn.className = 'bt-tc-pill is-compact is-soft';
            taintBtn.setAttribute('aria-pressed', 'false');
            taintBtn.textContent = 'Taint (-2): 0/5';
            faultBtn.className = 'bt-tc-pill is-compact is-soft';
            faultBtn.setAttribute('aria-pressed', 'false');
            faultBtn.textContent = 'Fault (-4): 0/5';
            CK.haptic('tick');
            syncBowlCardVisuals();
          }
        });

        const attrDetails = domH('details', { class: 'bt-lab-details' },
          domH('summary', { text: 'Score All 8 Traits (1\u20139 Enjoyment)' }),
          domH('p', {
            class: 'bt-lab-hint',
            text: 'Tap 1 to 9 for each trait (5 Okay \u00B7 7 Good \u00B7 8 Great \u00B7 9 Extraordinary). Updates your 100-pt SCA score instantaneously.'
          }),
          domH('div', { class: 'bt-cva-attr-grid' },
            CUPPING_TRAIT_GUIDES.map(function (tg, aIdx) {
              const valSpan = domH('span', { class: 'num-tab bt-cva-val-pill', text: (+bObj.hVals[aIdx]).toFixed(1).replace(/\.0$/, '') + ' / 9' });
              const tBtns = [];
              const pillGroup = domH('div', { class: 'bt-sca-trait-pills', role: 'radiogroup', 'aria-label': 'Bowl ' + bObj.code + ' ' + tg.name },
                [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (v9) {
                  const tb = domH('button', {
                    type: 'button',
                    class: 'bt-tc-pill is-compact num-tab' + (Math.round(bObj.hVals[aIdx]) === v9 ? ' is-active' : ' is-soft'),
                    style: 'min-width:34px;min-height:36px;padding:3px 7px',
                    'aria-pressed': String(Math.round(bObj.hVals[aIdx]) === v9),
                    text: String(v9),
                    onclick: function () {
                      bObj.hVals[aIdx] = v9;
                      CK.haptic('tick');
                      syncBowlCardVisuals();
                    }
                  });
                  tBtns.push(tb);
                  return tb;
                })
              );
              traitPillRefs.push({ aIdx: aIdx, valSpan: valSpan, btns: tBtns });
              return domH('div', { class: 'bt-cva-attr-block' },
                domH('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:6px' },
                  domH('strong', { text: tg.name }),
                  valSpan
                ),
                pillGroup,
                domH('span', { class: 'bt-cva-attr-desc', text: tg.hint })
              );
            })
          )
        );

        syncBowlCardVisuals();

        bowlsGrid.appendChild(domH('div', { class: 'bt-sca-bowl-card', style: 'min-width:0;max-width:100%;box-sizing:border-box' },
          domH('div', { class: 'bt-sca-bowl-top', style: 'flex-wrap:wrap;min-width:0;gap:6px' },
            domH('span', { class: 'bt-sca-bowl-badge', text: 'Bowl ' + bObj.code }),
            scoreBadge
          ),
          nameInput,
          notesInput,
          domH('div', { class: 'bt-sca-quick-wrap', style: 'display:flex;flex-direction:column;gap:8px' },
            domH('span', { class: 'bt-lab-inline-lbl', text: 'SCA 6.00\u201310.00 Quick Presets & \u00B10.25 Stepper:' }),
            presetRow,
            stepperRow,
            domH('div', { class: 'bt-sca-defect-row' }, taintBtn, faultBtn, defectResetBtn)
          ),
          attrDetails
        ));
      })(sca.bowls[i]);
    }
    paintScaHeroOnly();

    const startBtnLbl = domH('span', { text: sca.running ? 'Pause Cupping Timer' : 'Start Voice Cupping Timer' });
    const startBtn = domH('button', {
      type: 'button',
      class: 'bt-lab-btn is-primary',
      onclick: function () {
        unlockAudioSafe();
        if (sca.running) {
          sca.running = false;
          if (sca.rafId) cancelAnimationFrame(sca.rafId);
          sca._baseSec = sca.elapsedSec;
          startBtnLbl.textContent = 'Resume Cupping Timer';
        } else {
          sca.running = true;
          sca._baseSec = sca.elapsedSec || 0;
          sca._t0Ms = performance.now();
          if ((sca.elapsedSec || 0) < 2) {
            speakCueSafe('Cupping timer started. Steep untouched until four minutes.', 'step');
          }
          startBtnLbl.textContent = 'Pause Cupping Timer';
          sca.rafId = requestAnimationFrame(tickScaRaf);
        }
        CK.haptic('snap');
      }
    }, ic('play', { size: 15 }), startBtnLbl);

    /* 1-Tap Save All Cupped Samples to History */
    const saveAllBtn = domH('button', {
      type: 'button',
      class: 'bt-lab-btn is-primary bt-chart-cta-btn',
      onclick: function () {
        if (sca._isSaving) return;
        const flightSigParts = [sca.bowlCount, sca.bowlMl];
        for (let si = 0; si < sca.bowlCount; si++) {
          const sb = sca.bowls[si] || {};
          const shArr = Array.isArray(sb.hVals) ? sb.hVals.map(function (x) { return (+x || 0).toFixed(2); }).join(',') : '';
          flightSigParts.push([sb.code, sb.name, sb.notes, shArr, sb.nonUniformCups || 0, sb.defectiveCups || 0].join('~'));
        }
        const flightSig = flightSigParts.join('|');
        if (sca._lastSavedSig && sca._lastSavedSig === flightSig) {
          notify('This cupping flight is already saved to your Taste History!');
          return;
        }

        sca._isSaving = true;
        try {
          const st = window.BTStorage || {};
          const todayIso = new Date().toISOString().slice(0, 10);
          const nowIso = new Date().toISOString();
          const batchTs = Date.now().toString(36);
          const fmtTrait = function (v) {
            const n = clamp(v, 1, 9, 6.14);
            return String(Math.abs(n - Math.round(n)) < 0.01 ? Math.round(n) : +n.toFixed(2));
          };
          let savedN = 0;

          for (let i = 0; i < sca.bowlCount; i++) {
            const b = sca.bowls[i];
            const sc = computeCvaBowlScore(b);
            const stars = computeBowlStars(sc);
            const cId = b.coffee_id || ('cf_sca_' + batchTs + '_' + i);
            b.coffee_id = cId;
            const cupNotes = String(b.notes || '').trim();
            const bagNotes = String(b.bag_notes || cupNotes || '').trim();
            const flavorsArr = (Array.isArray(b.flavors) && b.flavors.length)
              ? b.flavors.slice()
              : (cupNotes ? cupNotes.split(/[,;/]+/).map(function (x) { return x.trim(); }).filter(Boolean) : (bagNotes ? bagNotes.split(/[,;/]+/).map(function (x) { return x.trim(); }).filter(Boolean) : []));
            const flavorsStr = cupNotes || flavorsArr.join(', ') || bagNotes;
            const coffeeName = b.name || ('Cupping Bowl ' + b.code);
            const ratioVal = Math.round((sca.bowlMl / Math.max(1, dosePerBowlG)) * 10) / 10;
            const cupSummary = 'Multi-Bowl Cupping (' + sc.toFixed(2) + ' / 100)' + (cupNotes ? (' · ' + cupNotes) : '');
            const hArr = (Array.isArray(b.hVals) && b.hVals.length === 8) ? b.hVals : [6.14, 6.14, 6.14, 6.14, 6.14, 6.14, 6.14, 6.14];
            const nonUnif = clamp(b.nonUniformCups || 0, 0, 5, 0);
            const defec = clamp(b.defectiveCups || 0, 0, 5, 0);
            const defDeduct = 2 * nonUnif + 4 * defec;
            const rowObj = (typeof emptyRowObj === 'function') ? emptyRowObj() : {};
            if (typeof COLUMNS !== 'undefined' && Array.isArray(COLUMNS)) {
              COLUMNS.forEach(function (ck) { if (rowObj[ck] === undefined) rowObj[ck] = ''; });
            }
            Object.assign(rowObj, {
              schema_version: '6.0',
              id: 'cup_sca_' + batchTs + '_' + i + '_' + Math.random().toString(36).slice(2, 6),
              coffee_id: cId,
              saved_at: nowIso,
              cupping_date: todayIso,
              mode: 'single_cup',
              coffee_name: coffeeName,
              roaster: b.roaster || '',
              origin: b.origin || '',
              process: b.process || '',
              roast_level: b.roast || '',
              varietal: b.varietal || '',
              farm: b.farm || '',
              elevation_m: b.elevation_m || '',
              agtron: b.agtron || '',
              bag_notes: bagNotes,
              brew_method: 'cupping',
              brew_attempt: '1',
              brew_dose_g: String(dosePerBowlG),
              brew_water_g: String(sca.bowlMl),
              brew_ratio: String(ratioVal),
              brew_temp_c: '93',
              brew_temp_f: '200',
              fragrance: fmtTrait(hArr[0]),
              aroma: fmtTrait(hArr[1]),
              fragrance_aroma: fmtTrait((+hArr[0] + +hArr[1]) / 2),
              flavor: fmtTrait(hArr[2]),
              aftertaste: fmtTrait(hArr[3]),
              acidity: fmtTrait(hArr[4]),
              sweetness: fmtTrait(hArr[5]),
              q_sweetness: fmtTrait(hArr[5]),
              body: fmtTrait(hArr[6]),
              overall: fmtTrait(hArr[7]),
              taint_cups: String(nonUnif),
              fault_cups: String(defec),
              defect_deduction: String(defDeduct),
              total_score: sc.toFixed(2),
              score_kind: 'cva_affective',
              my_rating_stars: String(stars),
              flavors_liked: flavorsStr,
              general_notes: cupSummary
            });
            let rowSaved = false;
            if (typeof st.keepInBrowser === 'function') {
              rowSaved = !!st.keepInBrowser(rowObj);
            } else if (typeof st.appendTastingRow === 'function') {
              rowSaved = !!st.appendTastingRow(rowObj);
            }
            if (rowSaved) {
              savedN++;
              if (typeof st.upsertCoffeeVaultRecord === 'function') {
                try {
                  st.upsertCoffeeVaultRecord({
                    id: cId,
                    coffee_id: cId,
                    name: coffeeName,
                    roaster: b.roaster || '',
                    origin: b.origin || '',
                    process: b.process || '',
                    roast: b.roast || '',
                    varietal: b.varietal || '',
                    farm: b.farm || '',
                    elevation_m: b.elevation_m || '',
                    agtron: b.agtron || '',
                    bag_notes: bagNotes,
                    notes: cupNotes || bagNotes,
                    flavors: flavorsArr,
                    personal_note: cupSummary
                  }, {
                    method: 'cupping',
                    dose: dosePerBowlG,
                    water: sca.bowlMl,
                    ratio: ratioVal,
                    tempC: 93,
                    tempF: 200,
                    stars: stars,
                    totalScore: +sc.toFixed(2),
                    flavors_liked: flavorsStr
                  });
                } catch (_) {}
              }
            }
          }

          if (savedN > 0) {
            sca._lastSavedSig = flightSig;
            const acCur = readAcademyState();
            acCur.palateGymHistory.blindBowlsRuns++;
            acCur.palateGymHistory.lastPlayedAt = new Date().toISOString();
            writeAcademyState(acCur);
            acadUi.gymCoach = {
              mood: 'celebrating',
              title: 'Cupping Flight Logged!',
              speech: 'Saved all ' + savedN + ' cupping bowl(s) straight into your Tasting Journal!'
            };
            CK.haptic('celebrate');
            notify('Saved ' + savedN + ' cupping bowl(s) to your Taste History!');
            if (!isSheet) rerenderAcademyTab();
          } else {
            CK.haptic('snap');
            notify('Could not save cupping bowls — browser storage is unavailable.');
          }
        } finally {
          sca._isSaving = false;
        }
      }
    }, ic('check-seal', { size: 16 }), domH('span', { text: 'Save All ' + sca.bowlCount + ' Cupping Bowls to Journal \u2192' }));

    const canBack = isSheet || acadUi.scaReturnToTaste || (typeof sh().canGoBack === 'function' && sh().canGoBack());
    const topEscapeBtn = canBack ? domH('button', {
      type: 'button',
      class: 'bt-lab-btn is-sm bt-back-escape-btn',
      id: 'bt-sca-back-btn',
      onclick: function () {
        if (isSheet && typeof sh().closeSheet === 'function') {
          sh().closeSheet();
          return;
        }
        if (acadUi.scaReturnToTaste) {
          acadUi.scaReturnToTaste = false;
          if (typeof sh().goBack === 'function' && typeof sh().canGoBack === 'function' && sh().canGoBack()) {
            sh().goBack();
          } else if (typeof sh().go === 'function') {
            sh().go('taste');
          }
          return;
        }
        if (typeof sh().goBack === 'function') sh().goBack();
      }
    }, acadUi.scaReturnToTaste ? '\u2190 Back to Tasting' : '\u2190 Back') : null;

    card.appendChild(domH('div', {
      class: 'bt-lab-card-head bt-sca-header-row',
      style: 'flex-wrap:wrap;align-items:flex-start;gap:10px;min-width:0;max-width:100%'
    },
      domH('div', { class: 'bt-lab-title-group', style: 'min-width:0;flex:1 1 200px' },
        ic('cafe-cup', { size: 22 }),
        domH('div', { style: 'min-width:0;flex:1 1 160px' },
          domH('h3', { style: 'margin:0;overflow-wrap:anywhere', text: '1–5 Bowl Side-by-Side Coffee Cupping Table' }),
          domH('p', { class: 'bt-lab-sub num-tab', style: 'overflow-wrap:anywhere', text: 'Dose: ' + dosePerBowlG + ' g per ' + sca.bowlMl + ' mL bowl (93 °C) · Voice cues at 04:00 Break, 08:00 Skim & 12:00 Slurp' })
        )
      ),
      domH('div', { class: 'bt-lab-chip-row', style: 'flex-wrap:wrap;min-width:0;max-width:100%;gap:6px' }, topEscapeBtn, epistemicPill('verified_science'))
    ));
    card.appendChild(scaHeroHost);
    card.appendChild(domH('div', { class: 'bt-cupping-4steps-grid', 'aria-label': 'How to cup coffee at home in 4 steps' }, stepCardNodes));
    card.appendChild(domH('div', {
      class: 'bt-lab-chip-row bt-sca-controls-row',
      style: 'flex-wrap:wrap;align-items:center;gap:6px;min-width:0;max-width:100%'
    },
      bowlCountPills,
      loadCellarBtn,
      blindToggleBtn,
      voiceToggleBtn,
      domH('div', { style: 'max-width:100%;min-width:0' },
        CK.vernierPill({
          label: 'Bowl Vol',
          value: sca.bowlMl,
          min: 120,
          max: 300,
          step: 10,
          unit: 'mL',
          compact: true,
          onChange: function (v) {
            sca.bowlMl = v;
            if (isSheet && o.hostEl) renderScaCuppingSheet(o.hostEl);
            else rerenderAcademyTab();
          }
        })
      )
    ));
    card.appendChild(domH('div', { class: 'bt-chrono-gym-deck' },
      domH('div', { class: 'bt-chrono-dial-col' }, scaChrono.el),
      domH('div', { class: 'bt-chrono-info-col' },
        domH('div', { class: 'bt-sca-timer-readout-row' },
          domH('strong', { text: 'Live Cupping Clock:' }),
          liveClockPill
        ),
        phaseBanner,
        domH('div', { class: 'bt-lab-btn-row' },
          startBtn,
          domH('button', {
            type: 'button',
            class: 'bt-lab-btn',
            onclick: function () {
              sca.running = false;
              if (sca.rafId) cancelAnimationFrame(sca.rafId);
              sca.elapsedSec = 0;
              sca._baseSec = 0;
              sca.spoken4m = false;
              sca.spoken8m = false;
              sca.spoken12m = false;
              startBtnLbl.textContent = 'Start Voice Cupping Timer';
              syncScaChrono(0);
            }
          }, 'Reset 00:00'),
          domH('button', {
            type: 'button',
            class: 'bt-lab-btn',
            onclick: function () {
              /* Shuffle bowls for self-blind cupping */
              const activeSlice = sca.bowls.slice(0, sca.bowlCount);
              for (let s = activeSlice.length - 1; s > 0; s--) {
                const j = Math.floor(Math.random() * (s + 1));
                const tmp = activeSlice[s]; activeSlice[s] = activeSlice[j]; activeSlice[j] = tmp;
              }
              for (let idx = 0; idx < activeSlice.length; idx++) {
                activeSlice[idx].code = String.fromCharCode(65 + idx);
                sca.bowls[idx] = activeSlice[idx];
              }
              sca.revealed = false;
              CK.haptic('snap');
              notify('Shuffled bowl order & hid coffee names for blind cupping!');
              if (isSheet && o.hostEl) renderScaCuppingSheet(o.hostEl);
              else rerenderAcademyTab();
            }
          }, 'Blind Shuffle')
        )
      )
    ));
    card.appendChild(bowlsGrid);
    card.appendChild(domH('div', { class: 'bt-chart-cta-bar' }, saveAllBtn));

    syncScaChrono(sca.elapsedSec || 0);
    if (sca.running) sca.rafId = requestAnimationFrame(tickScaRaf);
    return card;
  }

  /* ---- 2. 6-Cup Kitchen Taste Calibrator (Sour vs Bitter Confusion Fix!) ---- */
  const KITCHEN_GAME_ROUNDS = [
    {
      q: 'Round 1 of 4: A sip makes the sides of your jaw water immediately and fades fast — what are you tasting?',
      ans: 'sour',
      opts: [
        { k: 'sour', lbl: 'Sour / Under-Extracted (Grind Finer Next Brew)' },
        { k: 'bitter', lbl: 'Bitter / Over-Extracted (Grind Coarser)' }
      ],
      winMsg: 'Eureka! Immediate jaw-watering salivation is Sour fruit acid — grind 1–2 clicks finer or brew +2 °C hotter next cup.',
      loseMsg: 'Tricky one! Jaw-watering zip is actually Sour (Cup 1 Lemon). Bitter builds slowly at the back of your tongue with zero salivation.'
    },
    {
      q: 'Round 2 of 4: A sip starts quiet, then lingers dark and heavy on the back of your tongue with zero jaw-watering — what is it?',
      ans: 'bitter',
      opts: [
        { k: 'sour', lbl: 'Sour / Tangy Acids' },
        { k: 'bitter', lbl: 'Bitter / Late Roast Compounds (Grind Coarser or Pull Early)' }
      ],
      winMsg: 'Spot-on! Slow back-of-tongue linger is Bitter (Cup 4 Unsweetened Cocoa) — grind coarser or pull your dripper 15s early.',
      loseMsg: 'Close! Slow back-of-tongue linger with no watering is Bitter (Cup 4), not Sour.'
    },
    {
      q: 'Round 3 of 4: Your tongue feels dry like sandpaper (like over-steeped black tea), even when the cup is not super dark — what happened?',
      ans: 'channeling',
      opts: [
        { k: 'channeling', lbl: 'Dry Astringency from Fast Channels (Level Bed & Pour Gently)' },
        { k: 'weak', lbl: 'Too Much Water Bypass (Tighten Ratio)' }
      ],
      winMsg: 'Bullseye! Sandpaper dryness is Astringency from water carving fast channels — level your bed and pour gently in the center.',
      loseMsg: 'That sandpaper tongue feel is Astringency caused by channeling — gentle center pouring cures it!'
    },
    {
      q: 'Round 4 of 4: You add 1 tiny drop of salt water (from Cup 3) into Bitter Cup 4 — what happens on your tongue?',
      ans: 'blocks_bitter',
      opts: [
        { k: 'blocks_bitter', lbl: 'Salt Quiets Bitterness So Natural Sweetness Pops!' },
        { k: 'more_sour', lbl: 'Makes It Twice as Bitter' }
      ],
      winMsg: 'Kitchen chemistry magic! Sodium ions quiet bitter taste receptors long before tasting salty — our In-Mug Rescue secret weapon!',
      loseMsg: 'Try it in your kitchen! A tiny sub-threshold pinch of salt blocks bitter receptors so hidden sweetness shines.'
    }
  ];

  function buildKitchenTasteCalibratorCard() {
    const kt = acadUi.kitchen;
    const scale = kt.waterMl / 250;
    const hydMult = kt.citricHydrate === 'monohydrate' ? 1.094 : 1.0;
    const citricG = +(0.15 * scale * hydMult).toFixed(2);
    const sugarG = +(2.0 * scale).toFixed(1);
    const saltG = +(0.18 * scale).toFixed(2);

    const cups6 = [
      { n: 1, title: 'Cup 1: Sour Anchor', kitchen: '1/8 tsp fresh lemon juice (or ' + citricG + ' g citric acid)', feel: 'Immediate side-of-tongue zip + watering salivation (fast fade).' },
      { n: 2, title: 'Cup 2: Sweet Anchor', kitchen: '1/2 tsp (' + sugarG + ' g) white sugar', feel: 'Front/mid-tongue roundness that softens sourness when sipped after Cup 1.' },
      { n: 3, title: 'Cup 3: Salty Anchor', kitchen: 'Small pinch (' + saltG + ' g) table salt', feel: 'Mineral fullness — notice how 1 drop in Cup 4 blocks bitterness!' },
      { n: 4, title: 'Cup 4: Bitter Anchor', kitchen: '1/4 tsp 100% unsweetened cocoa (or tonic water)', feel: 'Slow-building back-of-tongue linger with ZERO salivation.' },
      { n: 5, title: 'Cup 5: Savory / Umami', kitchen: 'Tiny pinch MSG or 4 drops soy/mushroom broth', feel: 'Mouth-coating savory brothiness (common in aged/savory Kenyans).' },
      { n: 6, title: 'Cup 6: Pure Water Control', kitchen: kt.waterMl + ' mL plain brew water', feel: 'Palate-reset baseline so sensory adaptation never tricks you.' }
    ];

    const rIdx = ((kt.roundIdx || 0) % KITCHEN_GAME_ROUNDS.length + KITCHEN_GAME_ROUNDS.length) % KITCHEN_GAME_ROUNDS.length;
    const curRound = KITCHEN_GAME_ROUNDS[rIdx];
    const acHist = readAcademyState().palateGymHistory;

    return domH('section', { class: 'bt-studio-card', id: 'bt-kitchen-calibrator' },
      domH('div', { class: 'bt-lab-card-head' },
        domH('div', { class: 'bt-lab-title-group' },
          ic('spark-star', { size: 22 }),
          domH('div', null,
            domH('h3', { text: '6-Cup Kitchen Taste Calibrator & Sour-vs-Bitter Game' }),
            domH('p', { class: 'bt-lab-sub', text: 'Over 40% of home brewers swap sour and bitter — calibrate your tongue in 5 minutes using pantry staples!' })
          )
        ),
        domH('span', {
          class: 'bt-gym-score-pill num-tab',
          text: 'Score: ' + acHist.kitchenCalibCorrect + ' / ' + Math.max(acHist.kitchenCalibCorrect, acHist.kitchenCalibRuns)
        })
      ),
      domH('div', { class: 'bt-lab-chip-row' },
        CK.vernierPill({
          label: 'Cup Water',
          value: kt.waterMl,
          min: 150,
          max: 500,
          step: 50,
          unit: 'mL',
          compact: true,
          onChange: function (v) { kt.waterMl = v; rerenderAcademyTab(); }
        }),
        isScienceXray() ? domH('button', {
          type: 'button',
          class: 'bt-lab-chip' + (kt.citricHydrate === 'monohydrate' ? ' is-active' : ''),
          onclick: function () {
            kt.citricHydrate = kt.citricHydrate === 'monohydrate' ? 'anhydrous' : 'monohydrate';
            rerenderAcademyTab();
          }
        }, kt.citricHydrate === 'monohydrate' ? 'Citric Monohydrate (1.094x)' : 'Anhydrous Citric (1.00x)') : null
      ),
      domH('div', { class: 'bt-kitchen-6grid' },
        cups6.map(function (c) {
          return domH('div', { class: 'bt-lab-subcard bt-kitchen-cup-card' },
            domH('strong', { text: c.title }),
            domH('span', { class: 'bt-kitchen-recipe num-tab', text: 'In ' + kt.waterMl + ' mL water: ' + c.kitchen }),
            domH('p', { class: 'bt-lab-hint', text: c.feel })
          );
        })
      ),
      domH('div', { class: 'bt-lesson-quiz-box bt-kitchen-game-box' },
        domH('strong', { text: curRound.q }),
        domH('div', { class: 'bt-lab-chip-row' },
          curRound.opts.map(function (opt) {
            const isPicked = kt.quizAnswered === opt.k;
            const isRight = opt.k === curRound.ans;
            const cls = isPicked ? (isRight ? ' is-correct' : ' is-wrong') : '';
            return domH('button', {
              type: 'button',
              class: 'bt-lab-chip' + cls,
              onclick: function () {
                kt.quizAnswered = opt.k;
                const cur = readAcademyState();
                cur.palateGymHistory.kitchenCalibRuns++;
                if (isRight) cur.palateGymHistory.kitchenCalibCorrect++;
                cur.palateGymHistory.lastPlayedAt = new Date().toISOString();
                writeAcademyState(cur);
                acadUi.gymCoach = isRight
                  ? { mood: rIdx === 3 ? 'celebrating' : 'eureka', title: 'Calibrated Call! (' + cur.palateGymHistory.kitchenCalibCorrect + ' Correct)', speech: curRound.winMsg }
                  : { mood: 'sympathetic', title: 'Good Catch — Here Is the Tongue Clue:', speech: curRound.loseMsg };
                CK.haptic(isRight ? 'celebrate' : 'snap');
                notify(isRight ? curRound.winMsg : curRound.loseMsg);
                rerenderAcademyTab();
              }
            }, opt.lbl);
          })
        ),
        kt.quizAnswered ? domH('div', { class: 'bt-lab-btn-row', style: 'margin-top:8px' },
          domH('button', {
            type: 'button',
            class: 'bt-lab-btn is-sm is-primary',
            onclick: function () {
              kt.roundIdx = (rIdx + 1) % KITCHEN_GAME_ROUNDS.length;
              kt.quizAnswered = '';
              acadUi.gymCoach.mood = 'curious';
              CK.haptic('tick');
              rerenderAcademyTab();
            }
          }, 'Next Taste Challenge (' + (((rIdx + 1) % KITCHEN_GAME_ROUNDS.length) + 1) + ' of 4) \u2192')
        ) : null
      )
    );
  }

  function buildGymBeanjaminScorecardBanner(acState) {
    const gh = acState.palateGymHistory;
    const coach = acadUi.gymCoach || { mood: 'curious', title: 'Palate Gym Coach', speech: 'Ready to calibrate your palate!' };
    const nTri = gh.triangleTrials || 0;
    const kTri = gh.triangleCorrect || 0;
    const pVal = exactTriangleBinomialPValue(nTri, kTri);
    const totalWins = (gh.kitchenCalibCorrect || 0) + kTri + (gh.blindBowlsRuns || 0);
    const rankTitle = (pVal < 0.05 && nTri >= 3)
      ? 'Q-Grader Eagle'
      : (totalWins >= 5 ? 'Calibrated Palate' : (totalWins >= 1 ? 'Rising Taster' : 'Curious Sipper'));

    const avatarHost = domH('div', { class: 'bt-gym-mascot-avatar' });
    if (window.Beanjamin && typeof window.Beanjamin.svg === 'function') {
      avatarHost.innerHTML = window.Beanjamin.svg(coach.mood || 'curious', { view: 'avatar', label: 'Beanjamin Palate Coach' });
    }

    return domH('section', { class: 'bt-studio-card bt-gym-coach-banner', id: 'bt-gym-beanjamin-banner' },
      domH('div', { class: 'bt-gym-coach-left' },
        avatarHost,
        domH('div', { class: 'bt-gym-coach-copy' },
          domH('div', { class: 'bt-gym-coach-kicker-row' },
            domH('span', { class: 'bt-forecast-kicker', text: 'BEANJAMIN PALATE COACH' }),
            domH('span', { class: 'bt-gym-rank-badge', text: rankTitle })
          ),
          domH('strong', { text: coach.title }),
          domH('p', { text: coach.speech })
        )
      ),
      domH('div', { class: 'bt-gym-scorecard-strip num-tab' },
        domH('div', { class: 'bt-gym-mini-kpi' },
          domH('span', { text: 'Kitchen Rounds' }),
          domH('strong', { text: gh.kitchenCalibCorrect + '/' + Math.max(gh.kitchenCalibCorrect, gh.kitchenCalibRuns) })
        ),
        domH('div', { class: 'bt-gym-mini-kpi' },
          domH('span', { text: 'Blind Triangle' }),
          domH('strong', { text: kTri + '/' + nTri + (acadUi.triangle.streak > 1 ? (' (' + acadUi.triangle.streak + ' streak!)') : '') })
        ),
        domH('div', { class: 'bt-gym-mini-kpi' },
          domH('span', { text: 'Cupping Flights' }),
          domH('strong', { text: String(gh.blindBowlsRuns || 0) })
        )
      )
    );
  }

  function renderPalateGymView() {
    const wrap = domH('div', { class: 'bt-academy-seg' });
    const acState = readAcademyState();
    const sal = acadUi.salami;
    const tri = acadUi.triangle;

    /* 0. Single-Per-Viewport Beanjamin 2.0 Coach & Live Scorecard */
    wrap.appendChild(buildGymBeanjaminScorecardBanner(acState));

    /* 1. Editable 1-5 Bowl Multi-Coffee Cupping */
    wrap.appendChild(buildScaCockpitWidget());

    /* 2. 6-Cup Kitchen Taste Calibrator */
    wrap.appendChild(buildKitchenTasteCalibratorCard());

    /* 3. Guided 3-Glass Salami Taste-Split */
    const stepDur = sal.mode === 'espresso' ? 9 : 55;
    const totalSalSec = stepDur * 3;
    const salamiDefs = [
      { idx: 1, color: '#F5B041', title: 'Glass #1: Early Pour (0–33%)', sub: 'Fast Fruit Acids & Brightness — Tangy, Juicy, Lively' },
      { idx: 2, color: '#E8844A', title: 'Glass #2: Middle Pour (33–66%)', sub: 'Caramel & Natural Sugars — Round, Honeyed, Sweet Body' },
      { idx: 3, color: '#9C5C3E', title: 'Glass #3: Late Tail (66–100%)', sub: 'Slow Bitter Compounds — Pale, Watery, Dry Tea Finish' }
    ];
    const salChrono = mountGymChronoDial({
      mode: 'salami',
      totalTargetS: totalSalSec,
      elapsedS: sal.elapsedSec || 0,
      ariaLabel: '3-Glass Taste-Split Chronograph',
      phaseLabel: 'Glass #1 · Acids',
      phases: [
        { label: 'Glass #1 · Acids', startS: 0, endS: stepDur, color: '#F5B041' },
        { label: 'Glass #2 · Sugars', startS: stepDur, endS: stepDur * 2, color: '#E8844A' },
        { label: 'Glass #3 · Bitters', startS: stepDur * 2, endS: totalSalSec, color: '#9C5C3E' }
      ]
    });

    const glassUiNodes = salamiDefs.map(function (g) {
      const pctBadge = domH('span', { class: 'bt-salami-pct num-tab', text: '0%' });
      const titleEl = domH('strong', { text: g.title });
      const cardNode = domH('div', { class: 'bt-salami-glass' },
        domH('div', { class: 'bt-salami-head-row' }, titleEl, pctBadge),
        domH('p', { text: g.sub })
      );
      return { def: g, cardNode: cardNode, pctBadge: pctBadge, titleEl: titleEl };
    });

    function syncSalamiVisuals(secFloat) {
      const s = clamp(secFloat, 0, totalSalSec, 0);
      const gIdx = s < stepDur ? 1 : (s < stepDur * 2 ? 2 : 3);
      const phaseName = gIdx === 1 ? 'Glass #1 · Acids' : (gIdx === 2 ? 'Glass #2 · Sugars' : 'Glass #3 · Bitters');
      salChrono.update(s, s >= totalSalSec ? 'Split Complete' : phaseName, 'Swap every ' + stepDur + 's');
      glassUiNodes.forEach(function (item) {
        const start = (item.def.idx - 1) * stepDur;
        const frac = clamp((s - start) / stepDur, 0, 1, 0);
        const pouring = sal.running && gIdx === item.def.idx && s < totalSalSec;
        item.cardNode.classList.toggle('is-pouring', pouring);
        item.titleEl.textContent = item.def.title + (pouring ? ' \u2190 POURING NOW' : '');
        item.pctBadge.textContent = Math.round(frac * 100) + '%';
      });
    }

    const salBtnLbl = domH('span', { text: sal.running ? 'Pause Split Timer' : 'Start 3-Glass Salami Timer' });
    function tickSalRaf() {
      if (!sal.running) return;
      const prevS = sal.elapsedSec || 0;
      const nowS = (sal._baseSec || 0) + (performance.now() - (sal._t0Ms || performance.now())) / 1000;
      sal.elapsedSec = nowS;
      if (prevS < stepDur && nowS >= stepDur) {
        CK.haptic('sweetSpotLock');
        speakCueSafe('Swap to Glass Two now. Caramel sugars wave.', 'step');
        notify('SWAP TO GLASS #2 (Caramel & Natural Sugars) NOW!');
      } else if (prevS < stepDur * 2 && nowS >= stepDur * 2) {
        CK.haptic('sweetSpotLock');
        speakCueSafe('Swap to Glass Three now. Late bitters wave.', 'step');
        notify('SWAP TO GLASS #3 (Late Bitter Tail) NOW!');
      }
      if (nowS >= totalSalSec) {
        sal.running = false;
        sal.elapsedSec = totalSalSec;
        salBtnLbl.textContent = 'Replay 3-Glass Split';
        const cur = readAcademyState();
        cur.palateGymHistory.salamiRuns++;
        writeAcademyState(cur);
        CK.haptic('celebrate');
        speakCueSafe('Three cup split complete. Taste glass one, two, and three separately, then blend.', 'finish');
        syncSalamiVisuals(totalSalSec);
        return;
      }
      syncSalamiVisuals(nowS);
      sal.rafId = requestAnimationFrame(tickSalRaf);
    }

    const salamiCard = domH('section', { class: 'bt-studio-card' },
      domH('div', { class: 'bt-lab-card-head' },
        domH('div', { class: 'bt-lab-title-group' },
          ic('salami-cups', { size: 22 }),
          domH('div', null,
            domH('h3', { text: '3-Cup Salami Shot & Pour-Over Split Trainer' }),
            domH('p', { class: 'bt-lab-sub', text: 'Swap 3 glasses beneath your spout to taste Early Fruit Acids, Mid Caramel Sugars & Late Bitters in isolation' })
          )
        )
      ),
      domH('div', { class: 'bt-lab-chip-row' },
        domH('button', {
          type: 'button',
          class: 'bt-lab-chip' + (sal.mode === 'pourover' ? ' is-active' : ''),
          onclick: function () { sal.running = false; if (sal.rafId) cancelAnimationFrame(sal.rafId); sal.mode = 'pourover'; sal.elapsedSec = 0; rerenderAcademyTab(); }
        }, 'Pour-Over (3 × 55s)'),
        domH('button', {
          type: 'button',
          class: 'bt-lab-chip' + (sal.mode === 'espresso' ? ' is-active' : ''),
          onclick: function () { sal.running = false; if (sal.rafId) cancelAnimationFrame(sal.rafId); sal.mode = 'espresso'; sal.elapsedSec = 0; rerenderAcademyTab(); }
        }, 'Espresso Salami Shot (3 × 9s)')
      ),
      domH('div', { class: 'bt-chrono-gym-deck' },
        domH('div', { class: 'bt-chrono-dial-col' }, salChrono.el),
        domH('div', { class: 'bt-chrono-info-col' },
          domH('div', { class: 'bt-salami-glasses-grid' }, glassUiNodes.map(function (n) { return n.cardNode; })),
          domH('div', { class: 'bt-lab-btn-row' },
            domH('button', {
              type: 'button',
              class: 'bt-lab-btn is-primary',
              onclick: function () {
                unlockAudioSafe();
                if (sal.running) {
                  sal.running = false;
                  if (sal.rafId) cancelAnimationFrame(sal.rafId);
                  sal._baseSec = sal.elapsedSec;
                  salBtnLbl.textContent = 'Resume Split Timer';
                } else {
                  if (sal.elapsedSec >= totalSalSec) sal.elapsedSec = 0;
                  sal.running = true;
                  sal._baseSec = sal.elapsedSec || 0;
                  sal._t0Ms = performance.now();
                  salBtnLbl.textContent = 'Pause Split Timer';
                  sal.rafId = requestAnimationFrame(tickSalRaf);
                }
                CK.haptic('snap');
              }
            }, ic('play', { size: 15 }), salBtnLbl),
            domH('button', {
              type: 'button',
              class: 'bt-lab-btn',
              onclick: function () {
                sal.running = false;
                if (sal.rafId) cancelAnimationFrame(sal.rafId);
                sal.elapsedSec = 0;
                sal._baseSec = 0;
                salBtnLbl.textContent = 'Start 3-Glass Salami Timer';
                syncSalamiVisuals(0);
              }
            }, 'Reset 00:00')
          )
        )
      )
    );
    syncSalamiVisuals(sal.elapsedSec || 0);
    if (sal.running) sal.rafId = requestAnimationFrame(tickSalRaf);
    wrap.appendChild(salamiCard);

    /* 4. Self-Blind Turntable Triangle Cupping */
    const nTri = acState.palateGymHistory.triangleTrials;
    const kTri = acState.palateGymHistory.triangleCorrect;
    const pVal = exactTriangleBinomialPValue(nTri, kTri);
    const pBadgeTxt = nTri === 0
      ? '0 trials logged — run your first blind triad!'
      : (kTri + '/' + nTri + ' Correct  ·  Exact Binomial p = ' + (pVal * 100).toFixed(2) + '% ' +
        (pVal < 0.05 ? '(Statistically Calibrated!)' : '(Keep calibrating toward p < 5%)'));

    wrap.appendChild(domH('section', { class: 'bt-studio-card' },
      domH('div', { class: 'bt-lab-card-head' },
        domH('div', { class: 'bt-lab-title-group' },
          ic('check-seal', { size: 22 }),
          domH('div', null,
            domH('h3', { text: 'Self-Blind Triangle Test (Exact Binomial p-Value)' }),
            domH('p', { class: 'bt-lab-sub num-tab', text: pBadgeTxt })
          )
        )
      ),
      domH('p', {
        class: 'bt-lab-hint',
        text: 'Stick 1, 2, and 3 tape dots under 3 identical cups. Pour 2 cups of Brew A and 1 cup of Brew B (' + tri.dotMap[tri.oddIndex] + ' is the odd cup), spin tray eyes-closed, sip all 3, and tap the Odd Cup Out!'
      }),
      domH('div', { class: 'bt-triangle-cups-row' },
        ['Cup Left', 'Cup Center', 'Cup Right'].map(function (lbl, idx) {
          const isPicked = tri.pickedIndex === idx;
          const isOdd = tri.oddIndex === idx;
          let stateCls = '';
          if (tri.revealed) {
            if (isOdd) stateCls = ' is-odd-truth';
            else if (isPicked) stateCls = ' is-wrong-pick';
          }
          return domH('button', {
            type: 'button',
            class: 'bt-triangle-cup-btn' + stateCls,
            onclick: function () {
              if (tri.revealed) return;
              tri.pickedIndex = idx;
              tri.revealed = true;
              const hit = idx === tri.oddIndex;
              tri.streak = hit ? ((tri.streak || 0) + 1) : 0;
              const cur = readAcademyState();
              cur.palateGymHistory.triangleTrials++;
              if (hit) cur.palateGymHistory.triangleCorrect++;
              cur.palateGymHistory.lastPlayedAt = new Date().toISOString();
              writeAcademyState(cur);
              const nextP = exactTriangleBinomialPValue(cur.palateGymHistory.triangleTrials, cur.palateGymHistory.triangleCorrect);
              acadUi.gymCoach = hit
                ? {
                  mood: nextP < 0.05 ? 'celebrating' : 'eureka',
                  title: 'Odd Cup Found! (' + cur.palateGymHistory.triangleCorrect + '/' + cur.palateGymHistory.triangleTrials + ')',
                  speech: nextP < 0.05
                    ? ('Statistically proven palate (p = ' + (nextP * 100).toFixed(1) + '% < 5%)! You beat random guessing hands-down.')
                    : ('Sharp tongue! ' + tri.dotMap[idx] + ' was indeed the odd cup out — shuffle another triad to lock in p < 5%!')
                }
                : {
                  mood: 'sympathetic',
                  title: 'Blind Tasting Is Humbling!',
                  speech: 'The odd cup was ' + ['Cup Left', 'Cup Center', 'Cup Right'][tri.oddIndex] + ' (' + tri.dotMap[tri.oddIndex] + '). Let the cups cool toward 55 °C where differences pop loudest!'
                };
              CK.haptic(hit ? 'celebrate' : 'snap');
              rerenderAcademyTab();
            }
          },
          ic('cafe-cup', { size: 24 }),
          domH('strong', { text: lbl }),
          domH('span', { text: tri.revealed ? (isOdd ? ('ODD CUP (' + tri.dotMap[idx] + ')') : ('Pair (' + tri.dotMap[idx] + ')')) : 'Tap as Odd Cup Out' }));
        })
      ),
      tri.revealed ? domH('div', { class: 'bt-lab-btn-row' },
        domH('button', {
          type: 'button',
          class: 'bt-lab-btn is-primary',
          onclick: function () { resetTriangleRound(); CK.haptic('tick'); rerenderAcademyTab(); }
        }, 'Shuffle Next Blind Triad \u2192')
      ) : null
    ));

    return wrap;
  }

  /* ==========================================================================
   * SEGMENT 3: 774-TERM A-Z GLOSSARY (Zero Scroll Trap + View-40 Pagination)
   * ========================================================================== */
  function renderGlossaryView() {
    const gl = acadUi.glossary;
    const allTerms = getGlossaryEntries();
    const wrap = domH('div', { class: 'bt-academy-seg' });
    const card = domH('section', { class: 'bt-studio-card', id: 'bt-glossary-card' });

    const searchIn = domH('input', {
      type: 'search',
      class: 'bt-lab-text-in bt-glossary-search',
      placeholder: 'Search all ' + allTerms.length + ' coffee science, sensory & brewer terms...',
      value: gl.query
    });
    const resultsHost = domH('div', { class: 'bt-glossary-results-untrapped' });

    /* Extract distinct categories */
    const catSet = new Set(['All']);
    allTerms.forEach(function (it) {
      const c = it.cat || it.group || '';
      if (c && catSet.size < 13) catSet.add(c);
    });
    const catList = Array.from(catSet);

    function filterTerms() {
      resultsHost.textContent = '';
      const q = gl.query.trim().toLowerCase();
      const filtered = allTerms.filter(function (item) {
        const term = String(item.term || item[0] || '');
        const def = String(item.def || item[1] || '');
        const also = String(item.also || '');
        const cat = String(item.cat || item.group || '');
        if (gl.cat !== 'All' && cat !== gl.cat) return false;
        if (gl.letter !== 'ALL' && term.charAt(0).toUpperCase() !== gl.letter) return false;
        if (!q) return true;
        return term.toLowerCase().indexOf(q) >= 0 || also.toLowerCase().indexOf(q) >= 0 || def.toLowerCase().indexOf(q) >= 0;
      });

      if (q && filtered.length > 1) {
        const escQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const wordRe = new RegExp('(?:^|\\b|\\()' + escQ + '(?:$|\\b|\\))');
        const rankItem = function (it) {
          const tLow = String(it.term || it[0] || '').trim().toLowerCase();
          if (tLow === q) return 0;
          if (tLow.indexOf(q) === 0) return 1;
          if (wordRe.test(tLow)) return 2;
          if (tLow.indexOf(q) >= 0) return 3;
          if (String(it.also || '').toLowerCase().indexOf(q) >= 0) return 4;
          return 5;
        };
        filtered.sort(function (a, b) {
          const ra = rankItem(a), rb = rankItem(b);
          if (ra !== rb) return ra - rb;
          const ta = String(a.term || a[0] || '');
          const tb = String(b.term || b[0] || '');
          if (ta.length !== tb.length) return ta.length - tb.length;
          return ta.localeCompare(tb);
        });
      }

      if (!filtered.length) {
        let sugg = [];
        if (q && typeof glSuggest === 'function') {
          try { sugg = glSuggest(allTerms, q) || []; } catch (_) { sugg = []; }
        }
        resultsHost.appendChild(domH('p', {
          class: 'bt-lab-hint',
          text: 'No matching terms for "' + (gl.query || gl.letter) + '"' + (sugg.length ? (' — did you mean: ' + sugg.slice(0, 4).join(', ') + '?') : '. Try "tds", "lactone", "agtron", or reset filters.')
        }));
        return;
      }

      const maxShow = Math.max(40, gl.limit || 40);
      const shown = filtered.slice(0, maxShow);
      if (!q) {
        const ctxMsg = gl.letter !== 'ALL'
          ? ('Letter "' + gl.letter + '" \u2014 ' + filtered.length + ' term' + (filtered.length === 1 ? '' : 's') + (gl.cat !== 'All' ? (' in ' + gl.cat) : ''))
          : ('Showing ' + shown.length + ' of ' + filtered.length + ' terms' + (gl.cat !== 'All' ? (' in ' + gl.cat) : ' (All A\u2013Z)'));
        resultsHost.appendChild(domH('p', { class: 'bt-lab-hint', style: 'margin-bottom:6px', text: ctxMsg }));
      }
      shown.forEach(function (entry) {
        const tName = entry.term || entry[0] || '';
        const tDef = entry.def || entry[1] || '';
        const tCat = entry.cat || entry.group || '';
        resultsHost.appendChild(domH('div', { class: 'bt-glossary-item' },
          domH('div', { class: 'bt-glossary-head' },
            domH('strong', { text: tName }),
            tCat ? domH('span', { class: 'bt-glossary-cat', text: tCat }) : null
          ),
          domH('p', { text: tDef })
        ));
      });

      if (filtered.length > shown.length) {
        resultsHost.appendChild(domH('div', { class: 'bt-chart-cta-bar' },
          domH('button', {
            type: 'button',
            class: 'bt-lab-btn is-primary',
            onclick: function () {
              gl.limit = maxShow + 40;
              CK.haptic('tick');
              filterTerms();
            }
          }, 'Show 40 More Terms (' + (filtered.length - shown.length) + ' remaining) \u2192')
        ));
      }
    }

    searchIn.addEventListener('input', function () {
      gl.query = searchIn.value;
      gl.limit = 40;
      filterTerms();
    });

    const catBar = domH('div', { class: 'bt-lab-chip-row' },
      catList.map(function (cName) {
        return domH('button', {
          type: 'button',
          class: 'bt-lab-chip' + (gl.cat === cName ? ' is-active' : ''),
          onclick: function () { gl.cat = cName; gl.limit = 40; rerenderAcademyTab(); }
        }, cName);
      })
    );

    const letters27 = ['ALL'].concat('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''));
    const alphaBar = domH('div', { class: 'bt-lab-chip-row bt-alpha-bar' },
      letters27.map(function (ltr) {
        return domH('button', {
          type: 'button',
          class: 'bt-lab-chip' + (gl.letter === ltr ? ' is-active' : ''),
          onclick: function () { gl.letter = ltr; gl.limit = 40; rerenderAcademyTab(); }
        }, ltr);
      })
    );

    card.appendChild(domH('div', { class: 'bt-lab-card-head' },
      domH('div', { class: 'bt-lab-title-group' },
        ic('search-filter', { size: 22 }),
        domH('div', null,
          domH('h3', { text: 'A–Z Coffee Science & Sensory Glossary (' + allTerms.length + ' Terms)' }),
          domH('p', { class: 'bt-lab-sub', text: 'Full-page 60fps scrolling (zero nested scroll trap) — filter by category, A–Z letter, or instant search' })
        )
      )
    ));
    card.appendChild(searchIn);
    card.appendChild(catBar);
    card.appendChild(alphaBar);
    card.appendChild(resultsHost);
    filterTerms();
    wrap.appendChild(card);
    return wrap;
  }

  /* ==========================================================================
   * SEGMENT 4: 32 PEER-REVIEWED MYTH-BUSTERS (Surfacing All 158 Real DOIs)
   * ========================================================================== */
  function renderFolkloreDeckView() {
    const claims = getFolkClaims();
    const fk = acadUi.folk;
    const idx = ((fk.deckIdx % claims.length) + claims.length) % claims.length;
    const cur = claims[idx];
    const wrap = domH('div', { class: 'bt-academy-seg' });

    let totalCitations = 0;
    claims.forEach(function (c) {
      totalCitations += Array.isArray(c.sources) ? c.sources.length : (c.cite ? 1 : 0);
    });

    const deckCard = domH('section', { class: 'bt-studio-card bt-folk-deck-card' },
      domH('div', { class: 'bt-lab-card-head' },
        domH('div', { class: 'bt-lab-title-group' },
          ic('xray-loupe', { size: 22 }),
          domH('div', null,
            domH('h3', { text: '32 Peer-Reviewed Coffee Myth-Busters (' + Math.max(totalCitations, claims.length) + ' Citations & DOIs)' }),
            domH('p', { class: 'bt-lab-sub', text: 'Test your intuition on Claim #' + (idx + 1) + ' of ' + claims.length + ' — or browse all 32 claims & DOI links' })
          )
        ),
        domH('button', {
          type: 'button',
          class: 'bt-lab-chip' + (fk.BrowseAll ? ' is-active' : ''),
          onclick: function () { fk.BrowseAll = !fk.BrowseAll; rerenderAcademyTab(); }
        }, fk.BrowseAll ? 'Interactive Quiz Card' : 'Browse All ' + claims.length + ' Myths')
      )
    );

    function renderSourcesBlock(cl) {
      if (Array.isArray(cl.sources) && cl.sources.length) {
        return domH('ul', { class: 'bt-doi-list' },
          cl.sources.map(function (src) {
            const href = src.link || src.url || src.doi || '';
            return domH('li', null,
              domH('span', { text: (src.cite || src.title || 'Peer-reviewed study') + ' ' }),
              href ? domH('a', { href: href, target: '_blank', rel: 'noopener noreferrer', class: 'bt-doi-link', text: '[DOI / Paper \u2197]' }) : null
            );
          })
        );
      }
      if (cl.cite) {
        return domH('p', { class: 'bt-module-cite' },
          domH('span', { text: 'Primary Citation: ' + cl.cite + ' ' }),
          cl.doi ? domH('a', { href: cl.doi, target: '_blank', rel: 'noopener noreferrer', class: 'bt-doi-link', text: '[DOI \u2197]' }) : null
        );
      }
      return null;
    }

    if (!fk.BrowseAll && cur) {
      const swipeStage = domH('div', { class: 'bt-folk-swipe-card' },
        domH('span', { class: 'bt-kicker', text: 'CLAIM #' + (idx + 1) + ' OF ' + claims.length }),
        domH('h2', { class: 'bt-folk-claim-quote', text: '"' + cur.claim + '"' }),
        domH('div', { class: 'bt-lab-chip-row' },
          [
            { k: 'solid', lbl: 'Solid Science' },
            { k: 'partly', lbl: 'Partly Supported' },
            { k: 'practice', lbl: 'Craft Practice Only' },
            { k: 'not', lbl: 'Myth / Not Supported' }
          ].map(function (g) {
            return domH('button', {
              type: 'button',
              class: 'bt-lab-chip' + (fk.guessedTier === g.k ? ' is-active' : ''),
              onclick: function () {
                fk.guessedTier = g.k;
                CK.haptic(g.k === cur.tier ? 'celebrate' : 'snap');
                rerenderAcademyTab();
              }
            }, g.lbl);
          })
        )
      );
      deckCard.appendChild(swipeStage);

      if (fk.guessedTier) {
        const exactMatch = fk.guessedTier === cur.tier;
        deckCard.appendChild(domH('div', { class: 'bt-folk-reveal-box' },
          domH('div', { class: 'bt-lab-card-head' },
            domH('strong', { text: (exactMatch ? 'Spot-On Call! ' : 'Evidence Verdict: ') + cur.verdict }),
            epistemicPill(cur.tier)
          ),
          Array.isArray(cur.found) ? domH('ul', { class: 'bt-lab-list' }, cur.found.slice(0, 5).map(function (f) { return domH('li', { text: f }); })) : null,
          Array.isArray(cur.limits) && cur.limits.length ? domH('p', { class: 'bt-lab-hint', text: 'Study Limits: ' + cur.limits[0] }) : null,
          cur.app ? domH('p', { class: 'bt-lab-hint', text: 'How BeanTelligence Uses This: ' + cur.app }) : null,
          renderSourcesBlock(cur)
        ));
      }

      deckCard.appendChild(domH('div', { class: 'bt-lab-btn-row' },
        domH('button', {
          type: 'button',
          class: 'bt-lab-btn',
          onclick: function () { fk.deckIdx--; fk.guessedTier = ''; rerenderAcademyTab(); }
        }, '\u2190 Previous Claim'),
        domH('button', {
          type: 'button',
          class: 'bt-lab-btn is-primary',
          onclick: function () { fk.deckIdx++; fk.guessedTier = ''; rerenderAcademyTab(); }
        }, 'Next Claim \u2192')
      ));
    } else {
      const mythSearch = domH('input', {
        type: 'search',
        class: 'bt-lab-text-in',
        placeholder: 'Search all ' + claims.length + ' myths & peer-reviewed findings...',
        value: fk.query,
        oninput: function () { fk.query = mythSearch.value; paintMythList(); }
      });
      const listWrap = domH('div', { class: 'bt-folk-list' });

      function paintMythList() {
        listWrap.textContent = '';
        const q = fk.query.trim().toLowerCase();
        const matched = claims.filter(function (cl) {
          if (!q) return true;
          return String(cl.claim + ' ' + cl.verdict).toLowerCase().indexOf(q) >= 0;
        });
        if (!matched.length) {
          listWrap.appendChild(domH('p', {
            class: 'bt-lab-hint',
            text: 'No myths match "' + fk.query.trim() + '". Try searching "extraction", "caffeine", "roast", or clear your search.'
          }));
          return;
        }
        matched.forEach(function (cl) {
          listWrap.appendChild(domH('details', { class: 'bt-lab-details bt-lesson-accordion' },
            domH('summary', { class: 'bt-lesson-summary' },
              domH('span', { class: 'bt-lesson-title', text: cl.claim }),
              epistemicPill(cl.tier)
            ),
            domH('div', { class: 'bt-lesson-body' },
              domH('p', { class: 'bt-module-body', text: cl.verdict }),
              Array.isArray(cl.found) ? domH('ul', { class: 'bt-lab-list' }, cl.found.map(function (f) { return domH('li', { text: f }); })) : null,
              cl.app ? domH('p', { class: 'bt-lab-hint', text: cl.app }) : null,
              renderSourcesBlock(cl)
            )
          ));
        });
      }
      deckCard.appendChild(mythSearch);
      deckCard.appendChild(listWrap);
      paintMythList();
    }

    wrap.appendChild(deckCard);
    return wrap;
  }

  /* ==========================================================================
   * SEGMENT 5 & SHEET ('data-vault'): IMMORTAL DATA VAULT, WORKFLOW & RELEASES
   * ========================================================================== */
  function downloadTextBlob(text, filename, mime) {
    if (window.BTPlatform && window.BTPlatform.files && typeof window.BTPlatform.files.download === 'function') {
      window.BTPlatform.files.download(text, filename, mime);
      return;
    }
    const blob = new Blob([text], { type: mime || 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      if (a.parentNode) a.parentNode.removeChild(a);
      URL.revokeObjectURL(url);
    }, 500);
  }

  /* ==========================================================================
   * v6.5 3-CARD SAVE & RESTORE CENTER ('save-backup-center' + Inline Vault)
   * ========================================================================== */
  const _SAVE_CENTER_CANON_IDS = [
    'bt-save-web-url-btn',
    'bt-load-web-url-input',
    'bt-load-web-url-btn',
    'bt-replace-web-url-btn',
    'bt-export-json-save-btn',
    'bt-import-save-file-btn',
    'bt-export-csv-save-btn'
  ];

  let _saveCenterUi = {
    fileImportMode: 'merge', /* 'merge' | 'replace' */
    webUrlConfirmMsg: '',
    lastGeneratedUrl: '',
    feedbackMsg: '',
    feedbackTone: 'good',
    webUrlDraft: ''
  };

  function _yieldInlineSaveIdsForSheet() {
    if (typeof document === 'undefined') return;
    _SAVE_CENTER_CANON_IDS.forEach(function (cid) {
      const existing = document.getElementById(cid);
      if (existing && (!existing.closest || !existing.closest('#sheet'))) {
        existing.setAttribute('data-yielded-save-id', cid);
        existing.removeAttribute('id');
      }
    });
  }

  function _restoreInlineSaveIdsAfterSheet() {
    if (typeof document === 'undefined') return;
    const list = document.querySelectorAll('[data-yielded-save-id]');
    for (let i = 0; i < list.length; i++) {
      const cid = list[i].getAttribute('data-yielded-save-id');
      if (cid && !document.getElementById(cid)) {
        list[i].id = cid;
      }
      list[i].removeAttribute('data-yielded-save-id');
    }
  }

  function _formatBackupTimestampHuman(ms) {
    const t = Number(ms) || 0;
    if (!(t > 0)) return 'Not backed up yet';
    try {
      const d = new Date(t);
      if (isNaN(d.getTime())) return 'Saved recently';
      const now = Date.now();
      const diffMin = Math.max(0, Math.round((now - t) / 60000));
      const p2 = function (n) { return String(n).padStart(2, '0'); };
      const clock = d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes());
      if (diffMin < 1) return 'Just now (' + clock + ')';
      if (diffMin < 60) return diffMin + 'm ago (' + clock + ')';
      return clock;
    } catch (_) {
      return 'Saved';
    }
  }

  function _readLiveSaveSummaryCounts() {
    const st = window.BTStorage || {};
    if (typeof st.exportFullSaveBundle === 'function') {
      try {
        const b = st.exportFullSaveBundle();
        const ps = typeof st.getPersistentStorageStatus === 'function' ? st.getPersistentStorageStatus() : { persisted: false, lastBackupMs: 0, supported: false };
        return {
          coffeeCount: b.coffeeCount || 0,
          brewCount: b.brewCount || 0,
          goldCount: b.goldCount || 0,
          cafeCount: b.cafeCount || 0,
          hasPrefs: !!b.hasPrefs,
          lastBackupMs: ps.lastBackupMs || 0,
          persisted: !!ps.persisted,
          persistSupported: !!ps.supported
        };
      } catch (_) {}
    }
    const hist = typeof st.getHistory === 'function' ? st.getHistory() : null;
    const hObjs = hist && Array.isArray(hist.objs) ? hist.objs : [];
    const pr = typeof st.getPrices === 'function' ? st.getPrices() : null;
    const pList = pr && Array.isArray(pr.list) ? pr.list : [];
    const unified = typeof st.buildUnifiedCoffeesIndex === 'function' ? st.buildUnifiedCoffeesIndex(hObjs, pList) : pList;
    return {
      coffeeCount: Array.isArray(unified) ? unified.length : 0,
      brewCount: hObjs.length,
      goldCount: 0,
      cafeCount: 0,
      hasPrefs: true,
      lastBackupMs: typeof st.getLastBackupMs === 'function' ? st.getLastBackupMs() : 0,
      persisted: false,
      persistSupported: !!(typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist)
    };
  }

  function buildThreeCardSaveRestoreCenter(opts) {
    opts = opts || {};
    const isSheet = !!opts.isSheet;
    const st = window.BTStorage || {};
    const sheetCurrentlyOpen = !isSheet && typeof document !== 'undefined' && (function () {
      const shEl = document.getElementById('sheet');
      return !!(shEl && !shEl.hidden && shEl.getAttribute('data-sheet') === 'save-backup-center');
    })();

    function assignId(canonId) {
      if (isSheet) return canonId;
      return sheetCurrentlyOpen ? ('inline-' + canonId) : canonId;
    }

    const holder = domH('div', {
      class: 'bt-save-restore-center',
      style: 'display:flex;flex-direction:column;gap:12px'
    });

    function repaintCenter() {
      const rebuilt = buildThreeCardSaveRestoreCenter(opts);
      if (holder.parentNode) {
        holder.parentNode.replaceChild(rebuilt, holder);
      }
      if (!isSheet && typeof opts.onAfterMutate === 'function') {
        opts.onAfterMutate();
      }
    }

    const counts = _readLiveSaveSummaryCounts();

    /* Optional top feedback banner after any file/link restore */
    if (_saveCenterUi.feedbackMsg) {
      const isErr = _saveCenterUi.feedbackTone === 'error';
      holder.appendChild(domH('div', {
        role: 'status',
        'aria-live': 'polite',
        style: 'padding:11px 14px;border-radius:12px;font-size:0.86rem;font-weight:700;display:flex;align-items:center;justify-content:space-between;gap:8px;' +
          (isErr
            ? 'background:var(--bad-bg,#FDE8E7);border:1.5px solid var(--bad,#A1231F);color:var(--bad,#A1231F)'
            : 'background:var(--good-bg,#E2F4EB);border:1.5px solid var(--good,#1B6341);color:var(--good,#1B6341)')
      },
        domH('span', { style: 'min-width:0;flex:1', text: _saveCenterUi.feedbackMsg }),
        domH('button', {
          type: 'button',
          class: 'bt-lab-chip',
          style: 'min-height:34px;padding:4px 10px;font-size:0.76rem;flex-shrink:0',
          onclick: function () {
            _saveCenterUi.feedbackMsg = '';
            repaintCenter();
          }
        }, 'OK')
      ));
    }

    /* ----------------------------------------------------------------------
       CARD 1: Web Address Bookmark Save (Survives Clearing Browser History!)
       ---------------------------------------------------------------------- */
    const urlInput = domH('input', {
      type: 'text',
      id: assignId('bt-load-web-url-input'),
      class: 'bt-lab-text-in',
      style: 'font-size:1rem;min-height:44px;width:100%;max-width:100%;min-width:0;box-sizing:border-box',
      placeholder: 'Paste #btsave=... web address or save code...',
      value: _saveCenterUi.webUrlDraft || '',
      oninput: function (e) {
        _saveCenterUi.webUrlDraft = e.target.value;
      }
    });

    async function runWebUrlRestore(mode) {
      let rawVal = String(urlInput.value || _saveCenterUi.webUrlDraft || '').trim();
      if (!rawVal && typeof location !== 'undefined' && location.hash && location.hash.indexOf('btsave=') >= 0) {
        rawVal = location.hash;
      }
      if (!rawVal) {
        _saveCenterUi.feedbackTone = 'error';
        _saveCenterUi.feedbackMsg = 'Paste a #btsave=... web address or save code into the box first.';
        repaintCenter();
        return;
      }
      if (typeof st.importFullSaveBundle !== 'function') {
        _saveCenterUi.feedbackTone = 'error';
        _saveCenterUi.feedbackMsg = 'Storage engine unavailable.';
        repaintCenter();
        return;
      }
      try {
        const res = await st.importFullSaveBundle(rawVal, { mode: mode });
        if (res && res.ok) {
          _saveCenterUi.webUrlDraft = '';
          _saveCenterUi.feedbackTone = 'good';
          _saveCenterUi.feedbackMsg = (mode === 'replace' ? 'Replaced save from web link! ' : 'Merged save from web link! ') +
            (res.totalCoffees != null ? res.totalCoffees : res.coffeesImported) + ' Coffee(s) \u00B7 ' +
            (res.totalBrews != null ? res.totalBrews : res.brewsImported) + ' Saved Brew(s) active.';
          if (CK && typeof CK.haptic === 'function') CK.haptic('celebrate');
          notify(_saveCenterUi.feedbackMsg);
          repaintCenter();
        } else {
          _saveCenterUi.feedbackTone = 'error';
          _saveCenterUi.feedbackMsg = (res && res.error) || 'Could not decode that web save link. Copy the full #btsave=... URL and try again.';
          repaintCenter();
        }
      } catch (err) {
        _saveCenterUi.feedbackTone = 'error';
        _saveCenterUi.feedbackMsg = String(err && err.message ? err.message : 'Could not restore web save link.');
        repaintCenter();
      }
    }

    const card1 = domH('section', {
      class: 'bt-studio-card',
      style: 'border:1.5px solid var(--primary,#1B4D38);display:flex;flex-direction:column;gap:10px;min-width:0;max-width:100%;box-sizing:border-box;overflow:hidden'
    },
      domH('div', { class: 'bt-lab-card-head', style: 'min-width:0;flex-wrap:wrap' },
        domH('div', { class: 'bt-lab-title-group', style: 'min-width:0' },
          ic('vault-shield', { size: 22 }),
          domH('div', { style: 'min-width:0' },
            domH('h3', { text: '1. Web Address Bookmark Save (Survives Clearing History!)' }),
            domH('p', {
              class: 'bt-lab-sub',
              text: 'On a web address, clearing browser history clears site storage. Click below to pack your saves into your web address \u2014 bookmark it or copy the link to restore anytime on any phone or computer!'
            })
          )
        )
      ),
      domH('button', {
        type: 'button',
        id: assignId('bt-save-web-url-btn'),
        class: 'bt-lab-btn is-primary',
        style: 'width:100%;max-width:100%;min-width:0;min-height:48px;font-size:0.88rem;font-weight:800;white-space:normal;line-height:1.22;text-align:center',
        onclick: async function () {
          try {
            let res = null;
            if (typeof st.applySaveToBrowserAddressBar === 'function') {
              res = await st.applySaveToBrowserAddressBar();
            } else if (typeof st.buildWebSaveUrl === 'function') {
              const u = await st.buildWebSaveUrl();
              try { if (typeof history !== 'undefined' && history.replaceState) history.replaceState(null, '', u); } catch (_) {}
              res = { ok: true, url: u, copied: false };
            }
            if (res && res.ok) {
              _saveCenterUi.webUrlConfirmMsg = 'Web address updated! Bookmark this page (Ctrl+D / Share \u2192 Add Bookmark) to keep your save safe';
              _saveCenterUi.lastGeneratedUrl = res.url || '';
              if (CK && typeof CK.haptic === 'function') CK.haptic('celebrate');
              notify('Web address updated & copied! Bookmark this page to keep your save safe.');
              repaintCenter();
            }
          } catch (err) {
            _saveCenterUi.feedbackTone = 'error';
            _saveCenterUi.feedbackMsg = String(err && err.message ? err.message : 'Could not update web address.');
            repaintCenter();
          }
        }
      }, ic('copy', { size: 17 }), domH('span', { text: 'Put My Save in Web Address & Copy Link' })),

      _saveCenterUi.webUrlConfirmMsg ? domH('div', {
        role: 'status',
        'aria-live': 'polite',
        class: 'bt-web-save-confirm-box',
        style: 'padding:11px 13px;border-radius:12px;background:var(--good-bg,#E2F4EB);border:1.5px solid var(--good,#1B6341);color:var(--good,#1B6341);display:flex;flex-direction:column;gap:6px'
      },
        domH('div', { style: 'display:flex;align-items:flex-start;gap:8px;font-size:0.86rem;font-weight:700' },
          ic('check-seal', { size: 18 }),
          domH('span', { text: _saveCenterUi.webUrlConfirmMsg })
        ),
        _saveCenterUi.lastGeneratedUrl ? domH('div', {
          class: 'num-tab',
          style: 'font-size:0.74rem;padding:6px 9px;border-radius:8px;background:rgba(255,255,255,0.65);color:var(--ink,#1C130E);word-break:break-all;max-height:54px;overflow:hidden',
          text: _saveCenterUi.lastGeneratedUrl.length > 140
            ? (_saveCenterUi.lastGeneratedUrl.slice(0, 96) + '...' + _saveCenterUi.lastGeneratedUrl.slice(-32) + ' (' + _saveCenterUi.lastGeneratedUrl.length + ' chars copied)')
            : _saveCenterUi.lastGeneratedUrl
        }) : null
      ) : null,

      domH('div', {
        style: 'display:flex;flex-direction:column;gap:8px;padding-top:8px;border-top:1px solid var(--line-hairline,rgba(28,19,14,0.1))'
      },
        domH('label', {
          for: assignId('bt-load-web-url-input'),
          style: 'font-size:0.8rem;font-weight:700;color:var(--ink,#1C130E)',
          text: 'Have a Saved Web Link or Code? Paste & Restore:'
        }),
        urlInput,
        domH('div', { class: 'bt-lab-btn-row', style: 'flex-wrap:wrap;min-width:0;max-width:100%' },
          domH('button', {
            type: 'button',
            id: assignId('bt-load-web-url-btn'),
            class: 'bt-lab-btn is-primary',
            style: 'flex:1 1 180px;min-width:0;max-width:100%;white-space:normal;line-height:1.2',
            onclick: function () { runWebUrlRestore('merge'); }
          }, ic('clipboard-paste', { size: 16 }), domH('span', { text: 'Restore Link / Code (Merge)' })),
          domH('button', {
            type: 'button',
            id: assignId('bt-replace-web-url-btn'),
            class: 'bt-lab-btn',
            style: 'flex:0 1 auto;min-width:0',
            onclick: function () { runWebUrlRestore('replace'); }
          }, 'Replace')
        )
      )
    );
    holder.appendChild(card1);

    /* ----------------------------------------------------------------------
       CARD 2: Download & Load Save Files (.json Full Backup + .csv Spreadsheet)
       ---------------------------------------------------------------------- */
    const saveFilePicker = domH('input', {
      type: 'file',
      accept: '.json,.csv,application/json,text/csv',
      hidden: true,
      style: 'font-size:1rem',
      onchange: function () {
        const f = saveFilePicker.files && saveFilePicker.files[0];
        if (!f) return;
        f.text().then(async function (textContent) {
          const mode = _saveCenterUi.fileImportMode === 'replace' ? 'replace' : 'merge';
          if (typeof st.importFullSaveBundle === 'function') {
            const res = await st.importFullSaveBundle(textContent, { mode: mode });
            if (res && res.ok) {
              _saveCenterUi.feedbackTone = 'good';
              _saveCenterUi.feedbackMsg = 'Loaded "' + f.name + '" (' + (mode === 'replace' ? 'Replace All' : 'Safe Merge') + '): ' +
                (res.totalCoffees != null ? res.totalCoffees : res.coffeesImported) + ' Coffee(s) \u00B7 ' +
                (res.totalBrews != null ? res.totalBrews : res.brewsImported) + ' Saved Brew(s) ready!';
              if (CK && typeof CK.haptic === 'function') CK.haptic('celebrate');
              notify(_saveCenterUi.feedbackMsg);
            } else {
              _saveCenterUi.feedbackTone = 'error';
              _saveCenterUi.feedbackMsg = (res && res.error) || ('Could not load "' + f.name + '". Choose a valid .json save file or .csv brew history.');
            }
            repaintCenter();
          }
        }).catch(function () {
          _saveCenterUi.feedbackTone = 'error';
          _saveCenterUi.feedbackMsg = 'Could not read selected file.';
          repaintCenter();
        });
      }
    });

    const curImportMode = _saveCenterUi.fileImportMode === 'replace' ? 'replace' : 'merge';
    const card2 = domH('section', {
      class: 'bt-studio-card',
      style: 'display:flex;flex-direction:column;gap:10px;min-width:0;max-width:100%;box-sizing:border-box;overflow:hidden'
    },
      domH('div', { class: 'bt-lab-card-head', style: 'min-width:0;flex-wrap:wrap' },
        domH('div', { class: 'bt-lab-title-group', style: 'min-width:0' },
          ic('share-card', { size: 21 }),
          domH('div', { style: 'min-width:0' },
            domH('h3', { text: '2. Download & Load Save Files (.json + .csv)' }),
            domH('p', {
              class: 'bt-lab-sub',
              text: 'Download a portable file to your phone/computer Downloads folder, or load any .json save or .csv brew spreadsheet.'
            })
          )
        )
      ),
      domH('div', { class: 'bt-lab-btn-row', style: 'flex-wrap:wrap;min-width:0;max-width:100%' },
        domH('button', {
          type: 'button',
          id: assignId('bt-export-json-save-btn'),
          class: 'bt-lab-btn is-primary',
          style: 'flex:1 1 180px;min-width:0;max-width:100%;white-space:normal;line-height:1.2',
          onclick: function () {
            if (typeof st.downloadFullSaveFile === 'function') {
              const r = st.downloadFullSaveFile();
              _saveCenterUi.feedbackTone = 'good';
              _saveCenterUi.feedbackMsg = 'Downloaded ' + ((r && r.filename) || 'BeanTelligence_Save.json') + ' (all coffees, brews, preferences, gear & water)!';
              if (CK && typeof CK.haptic === 'function') CK.haptic('celebrate');
              notify('Full Save File (.json) downloaded!');
              repaintCenter();
            }
          }
        }, ic('vault-shield', { size: 16 }), domH('span', { text: 'Download Full Save File (.json)' })),
        domH('button', {
          type: 'button',
          id: assignId('bt-export-csv-save-btn'),
          class: 'bt-lab-btn',
          style: 'flex:1 1 190px',
          onclick: function () {
            if (typeof st.downloadHistoryCsvFile === 'function') {
              const r = st.downloadHistoryCsvFile();
              _saveCenterUi.feedbackTone = 'good';
              _saveCenterUi.feedbackMsg = 'Exported ' + ((r && r.filename) || 'Brew History (.csv)') + '!';
              notify('Brew History (.csv) exported!');
              repaintCenter();
            } else {
              const hNow = typeof st.getHistory === 'function' ? st.getHistory() : null;
              const csv = (hNow && hNow.text) || (typeof COLUMNS !== 'undefined' ? COLUMNS.join(',') + '\n' : 'schema_version,id,coffee_name,total_score\n');
              downloadTextBlob(csv, 'BeanTelligence_Brew_History.csv', 'text/csv;charset=utf-8');
              notify('Brew History (.csv) exported!');
            }
          }
        }, ic('share-card', { size: 15 }), domH('span', { text: 'Export Brew History (.csv)' }))
      ),
      domH('div', {
        style: 'display:flex;flex-direction:column;gap:8px;padding-top:8px;border-top:1px solid var(--line-hairline,rgba(28,19,14,0.1))'
      },
        domH('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap' },
          domH('span', { style: 'font-size:0.8rem;font-weight:700;color:var(--ink,#1C130E)', text: 'When Loading a File:' }),
          domH('div', { class: 'bt-lab-chip-row', role: 'group', 'aria-label': 'Save file import mode' },
            [
              { k: 'merge', lbl: 'Merge (Safe)' },
              { k: 'replace', lbl: 'Replace All' }
            ].map(function (m) {
              const on = curImportMode === m.k;
              return domH('button', {
                type: 'button',
                class: 'bt-lab-chip' + (on ? ' is-active' : ''),
                style: 'min-height:38px;padding:6px 12px;font-size:0.8rem',
                'aria-pressed': String(on),
                onclick: function () {
                  _saveCenterUi.fileImportMode = m.k;
                  if (CK && typeof CK.haptic === 'function') CK.haptic('tick');
                  repaintCenter();
                }
              }, m.lbl);
            })
          )
        ),
        saveFilePicker,
        domH('button', {
          type: 'button',
          id: assignId('bt-import-save-file-btn'),
          class: 'bt-lab-btn is-accent',
          style: 'width:100%;max-width:100%;min-width:0;min-height:46px;font-weight:700;white-space:normal;line-height:1.2',
          onclick: function () { saveFilePicker.click(); }
        }, ic('clipboard-paste', { size: 16 }), domH('span', {
          text: 'Load Save File (.json or .csv) \u00B7 ' + (curImportMode === 'replace' ? 'Replace All' : 'Merge (Safe)')
        }))
      )
    );
    holder.appendChild(card2);

    /* ----------------------------------------------------------------------
       CARD 3: Live Storage Protection Status
       ---------------------------------------------------------------------- */
    const persistBadgeTxt = counts.persisted
      ? 'Persistent Storage Shielded'
      : (counts.persistSupported ? 'Standard Browser Storage' : 'Browser Local Storage');

    const card3 = domH('section', {
      class: 'bt-studio-card',
      style: 'display:flex;flex-direction:column;gap:10px;min-width:0;max-width:100%;box-sizing:border-box;overflow:hidden'
    },
      domH('div', { class: 'bt-lab-card-head', style: 'min-width:0;flex-wrap:wrap' },
        domH('div', { class: 'bt-lab-title-group', style: 'min-width:0' },
          ic('check-seal', { size: 20 }),
          domH('div', null,
            domH('h3', { text: '3. Live Storage Protection Status' }),
            domH('p', {
              class: 'bt-lab-sub num-tab',
              text: counts.coffeeCount + ' Coffees \u00B7 ' + counts.brewCount + ' Brews' +
                (counts.goldCount > 0 ? (' \u00B7 ' + counts.goldCount + ' Gold Locked') : '') +
                ' \u00B7 Last Backup: ' + _formatBackupTimestampHuman(counts.lastBackupMs)
            })
          )
        ),
        domH('span', {
          class: 'bt-epistemic-pill ' + (counts.persisted ? 'is-verified' : 'is-craft'),
          text: persistBadgeTxt
        })
      ),
      domH('div', { class: 'bt-vault-kpi-strip' },
        domH('div', { class: 'bt-lab-kpi' }, domH('span', { text: 'Saved Coffees' }), domH('strong', { class: 'num-tab', text: String(counts.coffeeCount) })),
        domH('div', { class: 'bt-lab-kpi' }, domH('span', { text: 'Saved Brews' }), domH('strong', { class: 'num-tab', text: String(counts.brewCount) })),
        domH('div', { class: 'bt-lab-kpi' }, domH('span', { text: 'Last Backup' }), domH('strong', { class: 'num-tab', style: 'font-size:0.84rem', text: counts.lastBackupMs > 0 ? _formatBackupTimestampHuman(counts.lastBackupMs).split(' (')[0] : 'None yet' })),
        domH('div', { class: 'bt-lab-kpi' }, domH('span', { text: 'Storage Shield' }), domH('strong', { class: 'num-tab', style: 'font-size:0.84rem', text: counts.persisted ? 'Protected' : 'Active' }))
      ),
      !counts.persisted && counts.persistSupported ? domH('button', {
        type: 'button',
        class: 'bt-lab-btn is-sm',
        style: 'align-self:flex-start',
        onclick: async function () {
          if (typeof st.requestPersistentStorage === 'function') {
            const prRes = await st.requestPersistentStorage();
            const okP = !!(prRes && (prRes === true || prRes.persisted));
            _saveCenterUi.feedbackTone = 'good';
            _saveCenterUi.feedbackMsg = okP
              ? 'Browser Persistent Storage enabled! Automatic OS storage cleanup is now blocked (still bookmark your #btsave link before manually clearing browser history).'
              : 'Browser storage active \u2014 click "Put My Save in Web Address & Copy Link" above to survive manual history clearing!';
            repaintCenter();
          }
        }
      }, ic('lock-pin', { size: 15 }), domH('span', { text: 'Enable Browser Persistent Storage Shield' })) : null
    );
    holder.appendChild(card3);

    return holder;
  }

  function renderSaveBackupCenterSheet(arg0) {
    const hostEl = arg0 && arg0.nodeType === 1 ? arg0 : null;
    _yieldInlineSaveIdsForSheet();
    const sheetWrap = domH('div', {
      class: 'bt-sheet-content bt-vault-sheet',
      id: 'bt-save-backup-center-sheet'
    },
      buildThreeCardSaveRestoreCenter({ isSheet: true })
    );
    if (hostEl) {
      hostEl.textContent = '';
      hostEl.appendChild(sheetWrap);
    }
    return sheetWrap;
  }

  function openSaveBackupCenterModal(payload, opts) {
    opts = Object.assign({
      title: 'Backup & Load Saves',
      detent: 'full',
      onClose: function () {
        _restoreInlineSaveIdsAfterSheet();
        if (lastAcademyMount && acadUi.subView === 'vault') {
          rerenderAcademyTab();
        }
      }
    }, opts || {});
    _yieldInlineSaveIdsForSheet();
    const shell = sh();
    if (shell.BTSheet && typeof shell.BTSheet.open === 'function') {
      shell.BTSheet.open('save-backup-center', payload || null, opts);
      return;
    }
    if (typeof window.BTSheet !== 'undefined' && window.BTSheet && typeof window.BTSheet.open === 'function') {
      window.BTSheet.open('save-backup-center', payload || null, opts);
      return;
    }
    openNamedSheet('save-backup-center', payload || null, opts);
  }

  function renderDataVaultSheet(arg0) {
    const hostEl = arg0 && arg0.nodeType === 1 ? arg0 : null;
    const st = window.BTStorage || {};
    const hist = typeof st.getHistory === 'function' ? st.getHistory() : null;
    const histCount = hist && hist.objs ? hist.objs.length : 0;
    const pr = typeof st.getPrices === 'function' ? st.getPrices() : null;
    const bagCount = pr && Array.isArray(pr.list) ? pr.list.length : 0;
    const shStore = typeof st.getShops === 'function' ? st.getShops() : null;
    const drinkCount = shStore && shStore.store && Array.isArray(shStore.store.drinks) ? shStore.store.drinks.length : 0;
    const releases = getReleasesList();

    const statusLine = domH('p', { class: 'bt-vault-status', role: 'status', text: '100% Local-First Vault: Zero accounts, zero cloud telemetry, zero data loss.' });
    const handleList = domH('div', { class: 'bt-vault-handles-row' });

    try {
      if (typeof indexedDB !== 'undefined') {
        const rq = indexedDB.open('brew-and-cup-files', 1);
        rq.onupgradeneeded = function () {
          if (!rq.result.objectStoreNames.contains('handles')) rq.result.createObjectStore('handles');
        };
        rq.onsuccess = function () {
          const db = rq.result;
          try {
            const tx = db.transaction('handles', 'readonly');
            const store = tx.objectStore('handles');
            const gHist = store.get('history-file');
            const gEvery = store.get('everything-file');
            tx.oncomplete = function () {
              db.close();
              handleList.textContent = '';
              const hName = gHist.result && gHist.result.name ? gHist.result.name : 'Not linked (manual download)';
              const eName = gEvery.result && gEvery.result.name ? gEvery.result.name : 'Not linked (manual download)';
              handleList.appendChild(domH('span', { class: 'bt-vault-handle-pill', text: 'Auto-Save History: ' + hName }));
              handleList.appendChild(domH('span', { class: 'bt-vault-handle-pill', text: 'Full Backup File: ' + eName }));
            };
          } catch (_) { db.close(); }
        };
      }
    } catch (_) {}

    function gatherJsonBackupString() {
      if (typeof st.exportFullSaveBundle === 'function') {
        try {
          return JSON.stringify(st.exportFullSaveBundle(), null, 2);
        } catch (_) {}
      }
      const cleanPrefs = Object.assign({}, getApp().prefs || {});
      let coffeesVaultRaw = '';
      try { coffeesVaultRaw = localStorage.getItem('brew-and-cup-coffees-v1') || ''; } catch (_) {}
      const coffeesVaultArr = typeof st.getCoffeesVaultList === 'function' ? st.getCoffeesVaultList() : [];
      return JSON.stringify({
        format: 'beantelligence-backup',
        version: 2,
        madeAt: new Date().toISOString(),
        appVersion: '6.8.0',
        historyCsv: hist && hist.text ? hist.text : '',
        pricesCsv: pr && pr.list && typeof priceCsv === 'function' ? priceCsv(pr.list) : '',
        shopsCsv: shStore && shStore.store && typeof shopCsv === 'function' ? shopCsv(shStore.store) : '',
        coffeesVault: coffeesVaultArr,
        extraKeys: coffeesVaultRaw ? { 'brew-and-cup-coffees-v1': coffeesVaultRaw } : {},
        prefs: cleanPrefs,
        academy: readAcademyState()
      }, null, 2);
    }

    async function handleSaveEverything() {
      if (typeof everySave === 'function') {
        const r = await everySave(false);
        statusLine.textContent = (r && r.msg) || 'Saved Everything (#PART) container.';
        return;
      }
      if (typeof makeEverythingCode === 'function') {
        const parts = [];
        if (hist && hist.text) parts.push({ id: 'history', text: hist.text });
        if (pr && pr.list && pr.list.length && typeof priceCsv === 'function') parts.push({ id: 'prices', text: priceCsv(pr.list) });
        if (shStore && shStore.store && typeof shopCsv === 'function') parts.push({ id: 'shops', text: shopCsv(shStore.store) });
        parts.push({ id: 'academy', text: JSON.stringify(readAcademyState()) });
        const made = await makeEverythingCode(parts, { made: new Date().toISOString(), app: '6.2.0' });
        downloadTextBlob(made.text || String(made), 'BeanTelligence Backup - Everything.txt', 'text/plain;charset=utf-8');
        statusLine.textContent = 'Downloaded BeanTelligence Backup - Everything.txt (#BEANTELLIGENCE-PARTS 1).';
        return;
      }
      downloadTextBlob(gatherJsonBackupString(), 'BeanTelligence Backup - Everything.txt', 'text/plain;charset=utf-8');
      statusLine.textContent = 'Downloaded full BeanTelligence Everything Backup.';
    }

    async function handleUniversalImport(rawText, filename) {
      const txt = String(rawText || '').replace(/^\uFEFF/, '').trim();
      if (!txt) { statusLine.textContent = 'Empty file or clipboard input.'; return; }

      /* 0. #btsave= Web-Address Save / Full-Save JSON Bundle (preserves all 18 keys + brew-and-cup-coffees-v1) */
      if ((/(?:[#?&]|^)btsave(?:_v6)?=|^btsave:/i.test(txt) || (txt.charAt(0) === '{' && /"format"\s*:\s*"beantelligence-full-save"|"keys"\s*:/.test(txt))) && typeof st.importFullSaveBundle === 'function') {
        try {
          const fullRes = await st.importFullSaveBundle(txt, { mode: 'merge' });
          if (fullRes && fullRes.ok) {
            statusLine.textContent = 'Restored full save bundle (' + (fullRes.totalCoffees != null ? fullRes.totalCoffees : fullRes.coffeesImported) + ' coffees · ' + (fullRes.totalBrews != null ? fullRes.totalBrews : fullRes.brewsImported) + ' brews)!';
            CK.haptic('celebrate');
            if (hostEl) renderDataVaultSheet(hostEl);
            else rerenderAcademyTab();
            return;
          }
        } catch (_) {}
      }

      /* 0b. Shared Brew / Passport Codes (BT6:, #bt6=, #bp1=, #bt1=, bt1:, BT-code: V1) */
      if (/(?:BT6:|bt1:|bp1:|BT-code:\s*V1)/i.test(txt) || /(?:^|[#?&])(?:bt6|bp1|bt1)=/i.test(txt)) {
        const normTxt = txt.replace(/(?:^|[#?&])bp1=/i, 'bt1:').replace(/\bbp1:/i, 'bt1:').replace(/(?:^|[#?&])bt1=/i, 'bt1:');
        const a = getApp();
        a.brew = a.brew || {};
        a.prefs = a.prefs || {};
        const rxGrinder = (a.gear && (a.gear.grinder || a.gear.grinderKey))
          || (a.prefs.gear && (a.prefs.gear.grinder || a.prefs.gear.grinderKey))
          || 'comandante-c40';
        const bs = window.BTBrewStudio || null;
        const decodeFn = bs && (bs.decodeAnySharedBrew || bs.decodeSharedBrew);
        let decoded = null;
        if (typeof decodeFn === 'function') {
          try {
            const d0 = decodeFn(normTxt, a);
            if (d0 && d0.ok && (d0.coffee || d0.methodKey)) decoded = d0;
          } catch (_) {}
        }
        if (!decoded && window.BTInnovate && typeof window.BTInnovate.decodeAndLocalizePassport === 'function') {
          try {
            const rxPrefs = Object.assign({}, a.prefs, {
              grinderKey: rxGrinder,
              gear: (a.prefs && a.prefs.gear) || a.gear || {}
            });
            const d1 = window.BTInnovate.decodeAndLocalizePassport(normTxt, rxPrefs);
            if (d1 && d1.ok) decoded = d1;
          } catch (_) {}
        }
        if (!decoded && typeof shareRead === 'function') {
          try {
            const d2 = shareRead(normTxt);
            if (d2 && d2.ok && (d2.coffee || d2.brew)) decoded = d2;
          } catch (_) {}
        }
        if (decoded && (decoded.ok || decoded.coffee || decoded.bean || decoded.brew || decoded.localizedRecipe)) {
          const srcC = decoded.coffee || decoded.bean || {};
          const freshCid = srcC.coffee_id || srcC.id || ('cf_imp_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6));
          const notesStr = String(srcC.bag_notes || srcC.notes || (Array.isArray(srcC.flavors) ? srcC.flavors.join(', ') : '') || '').trim();
          a.coffee = {
            id: freshCid,
            coffee_id: freshCid,
            name: srcC.name || srcC.coffee_name || 'Shared Brew Passport',
            roaster: srcC.roaster || '',
            origin: srcC.origin || '',
            region: srcC.region || '',
            farm: srcC.farm || '',
            varietal: srcC.varietal || '',
            process: srcC.process || 'washed',
            roast: srcC.roast || srcC.roast_level || 'medium-light',
            elevation_m: srcC.elevation_m || '',
            ground_agtron: srcC.ground_agtron || '',
            agtron: srcC.agtron || srcC.ground_agtron || '',
            bag_notes: notesStr,
            notes: notesStr,
            flavors: Array.isArray(srcC.flavors) ? srcC.flavors.slice() : (notesStr ? notesStr.split(/[,;/]+/).map(function (x) { return x.trim(); }).filter(Boolean) : []),
            answered: 'yes'
          };
          const rx = decoded.localizedRecipe || decoded.brew || decoded;
          const mKey = rx.methodKey || rx.method || a.brew.method || 'v60';
          const doseVal = +(rx.doseG || rx.dose || a.brew.dose || 18);
          const waterVal = +(rx.waterG || rx.water || a.brew.water || Math.round(doseVal * 16));
          const ratioVal = +(rx.ratio || (waterVal / Math.max(1, doseVal))).toFixed(1);
          const umVal = +(rx.d50Um || decoded.localizedUm || rx.grindUm || rx.grind_um || 0);
          const tempVal = rx.tempC ? +rx.tempC : (rx.tempF ? Math.round(((+rx.tempF - 32) * 5 / 9) * 2) / 2 : (+a.brew.tempC || 93));
          const grindSetTxt = (rx.grinderSetting && (rx.grinderSetting.shortDisplay || rx.grinderSetting.display || rx.grinderSetting.label))
            || decoded.rxGrindSetting
            || rx.grind_setting
            || '';
          a.brew.method = mKey;
          a.brew.style = rx.style || decoded.style || 'standard';
          a.brew.dose = doseVal;
          a.brew.water = waterVal;
          a.brew.ratio = ratioVal;
          a.brew.tempC = tempVal;
          a.brew.tempF = Math.round(tempVal * 9 / 5 + 32);
          if (umVal > 0) {
            a.brew.grindUm = Math.round(umVal);
            a.brew.grind_um = Math.round(umVal);
          }
          if (grindSetTxt) a.brew.grind_setting = grindSetTxt;
          a.brew.grinderKey = rx.grinderKey || rxGrinder;
          a.brew._savedDialedMethod = mKey;
          a.brew.customizedNote = decoded.spanNote || rx.boilCapNote || rx.waterNote || 'Imported Brew Passport';
          if (typeof st.upsertCoffeeVaultRecord === 'function') {
            try { st.upsertCoffeeVaultRecord(a.coffee, a.brew, { allowClear: true }); } catch (_) {}
          }
          const chFn = typeof changed === 'function' ? changed : sh().changed;
          if (typeof chFn === 'function') { try { chFn(); } catch (_) {} }
          if (typeof sh().flushDraft === 'function') { try { sh().flushDraft(); } catch (_) {} }
          const okMsg = 'Loaded "' + a.coffee.name + '" (' + mKey.toUpperCase() + (grindSetTxt ? (' · ' + grindSetTxt) : '') + ') into Brew Studio!';
          statusLine.textContent = okMsg;
          CK.haptic('celebrate');
          notify(okMsg);
          if (typeof sh().closeSheet === 'function' && sh().isSheetOpen && sh().isSheetOpen()) {
            try { sh().closeSheet(); } catch (_) {}
          }
          if (typeof sh().go === 'function') {
            try { sh().go('brew'); } catch (_) {}
          } else if (typeof sh().render === 'function') {
            try { sh().render(); } catch (_) {}
          }
          return;
        }
      }

      /* Primary lossless multi-part classifier & applier (History + Prices + Shops + Prefs + Academy + QR) */
      if (typeof st.classifyBackup === 'function' && typeof st.applyClassifiedBackup === 'function') {
        try {
          const cl = await st.classifyBackup(txt);
          if (cl && !cl.error) {
            const ap = st.applyClassifiedBackup(cl);
            if (ap && ap.ok) {
              const summary = (Array.isArray(ap.notes) && ap.notes.length) ? ap.notes.join(' · ') : 'Restored backup container cleanly!';
              statusLine.textContent = summary;
              CK.haptic('celebrate');
              if (hostEl) renderDataVaultSheet(hostEl);
              else rerenderAcademyTab();
              return;
            }
          }
        } catch (_) {}
      }

      if (/^#(BEANTELLIGENCE|NEUROBREW)-PARTS/i.test(txt) || /BEGIN (?:BEANTELLIGENCE|NEUROBREW) BACKUP/i.test(txt) || /^NB1\.[rz]/i.test(txt)) {
        if (typeof readBackupCode === 'function') {
          const r = await readBackupCode(txt);
          if (r && r.csv && typeof readExisting === 'function' && st.setHistory) {
            const ex = readExisting(r.csv);
            if (!ex.error) st.setHistory(ex, r.csv);
          }
          if (r && r.parts && r.parts.parts && r.parts.parts.academy && r.parts.parts.academy.text) {
            try { writeAcademyState(JSON.parse(r.parts.parts.academy.text)); } catch (_) {}
          }
          statusLine.textContent = (r && r.error) ? r.error : 'Restored backup container cleanly!';
          CK.haptic('celebrate');
          return;
        }
      }

      if (txt.charAt(0) === '{') {
        try {
          const jb = typeof parseJsonBackup === 'function' ? parseJsonBackup(txt) : JSON.parse(txt);
          if (jb && (jb.format === 'beantelligence-backup' || jb.historyCsv || jb.academy || jb.coffeesVault || jb.extraKeys)) {
            if (jb.historyCsv && typeof readExisting === 'function' && st.setHistory) {
              const ex2 = readExisting(jb.historyCsv);
              if (!ex2.error) st.setHistory(ex2, jb.historyCsv);
            }
            if (jb.pricesCsv && typeof priceRead === 'function' && typeof st.savePrices === 'function') {
              const prJ = priceRead(jb.pricesCsv);
              if (prJ && !prJ.error && Array.isArray(prJ.list)) st.savePrices(prJ.list);
            }
            if (jb.shopsCsv && typeof shopRead === 'function' && typeof st.saveShops === 'function') {
              const shJ = shopRead(jb.shopsCsv);
              if (shJ && !shJ.error && shJ.store) st.saveShops(shJ.store);
            }
            if (jb.prefs && typeof st.applyFullPrefs === 'function') {
              st.applyFullPrefs(jb.prefs);
            }
            const vaultArr = Array.isArray(jb.coffeesVault)
              ? jb.coffeesVault
              : (jb.extraKeys && jb.extraKeys['brew-and-cup-coffees-v1'] ? JSON.parse(jb.extraKeys['brew-and-cup-coffees-v1']) : null);
            if (Array.isArray(vaultArr) && vaultArr.length) {
              if (typeof st.upsertCoffeeVaultRecord === 'function') {
                vaultArr.forEach(function (cv) {
                  if (cv && typeof cv === 'object') st.upsertCoffeeVaultRecord(cv, cv.lastBrew || null);
                });
              } else if (typeof st.saveCoffeesVaultList === 'function') {
                st.saveCoffeesVaultList(vaultArr);
              }
            }
            if (jb.academy) writeAcademyState(jb.academy);
            statusLine.textContent = 'Restored structured JSON backup!';
            CK.haptic('celebrate');
            if (hostEl) renderDataVaultSheet(hostEl);
            else rerenderAcademyTab();
            return;
          }
        } catch (_) {}
      }

      const firstLine = txt.split(/\r?\n/)[0].toLowerCase();
      if (firstLine.indexOf('coffee_name') >= 0 && firstLine.indexOf('schema_version') >= 0 && typeof readExisting === 'function') {
        const exH = readExisting(txt);
        if (!exH.error && st.setHistory) {
          st.setHistory(exH, txt);
          statusLine.textContent = 'Imported ' + exH.count + ' tasting(s) from ' + (filename || 'CSV') + '!';
          CK.haptic('celebrate');
          return;
        }
      }
      if (typeof priceRead === 'function') {
        const prRes = priceRead(txt);
        if (prRes && !prRes.error && Array.isArray(prRes.list) && prRes.list.length && st.savePrices) {
          st.savePrices(prRes.list);
          statusLine.textContent = 'Imported ' + prRes.list.length + ' bag(s) into My Beans!';
          return;
        }
      }
      if (typeof shopRead === 'function') {
        const shRes = shopRead(txt);
        if (shRes && !shRes.error && shRes.store && st.saveShops) {
          st.saveShops(shRes.store);
          statusLine.textContent = 'Imported Cafe visits CSV cleanly!';
          return;
        }
      }

      statusLine.textContent = 'Drop a Tasting History (.csv), My Beans / Cafes (.csv), Full Backup (.txt / .json), or Shared Recipe code.';
    }

    const fileInput = domH('input', {
      type: 'file',
      accept: '.csv,.txt,.json,.btbackup',
      hidden: true,
      onchange: function () {
        const f = fileInput.files && fileInput.files[0];
        if (!f) return;
        f.text().then(function (t) { handleUniversalImport(t, f.name); });
      }
    });

    const pasteBox = domH('textarea', {
      class: 'bt-lab-textarea',
      rows: '3',
      placeholder: 'Drop any backup/CSV file here OR paste NB1.z backup code, #BEANTELLIGENCE-PARTS 1, JSON, or BT-code: V1...'
    });

    const dropZone = domH('div', {
      class: 'bt-vault-dropzone',
      ondragover: function (e) { e.preventDefault(); dropZone.classList.add('is-dragover'); },
      ondragleave: function () { dropZone.classList.remove('is-dragover'); },
      ondrop: function (e) {
        e.preventDefault();
        dropZone.classList.remove('is-dragover');
        const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) f.text().then(function (t) { handleUniversalImport(t, f.name); });
      }
    },
    pasteBox,
    domH('div', { class: 'bt-lab-btn-row' },
      fileInput,
      domH('button', { type: 'button', class: 'bt-lab-btn is-primary', onclick: function () { fileInput.click(); } },
        ic('paste-card', { size: 15 }), domH('span', { text: 'Import / Merge Backup or CSV' })),
      domH('button', { type: 'button', class: 'bt-lab-btn', onclick: function () { handleUniversalImport(pasteBox.value, 'pasted text'); } },
        'Restore Pasted Code / QR')
    ));

    let armedSnapKey = '';
    function makeRollbackBtn(snapKey, labelTxt) {
      const btn = domH('button', {
        type: 'button',
        class: 'bt-lab-btn is-sm',
        onclick: async function () {
          if (armedSnapKey !== snapKey) {
            armedSnapKey = snapKey;
            btn.textContent = 'Tap Again to Confirm: ' + labelTxt;
            setTimeout(function () { armedSnapKey = ''; btn.textContent = labelTxt; }, 4500);
            return;
          }
          armedSnapKey = '';
          btn.textContent = labelTxt;
          const fn = st.restoreSafetySnapshot || window.restoreSafetySnapshot;
          if (typeof fn === 'function') {
            const res = await fn(snapKey);
            statusLine.textContent = res && res.ok
              ? ('Restored ' + (res.restoredKeys || 'all') + ' saved records from backup snapshot!')
              : ('No automatic backup snapshot recorded for "' + labelTxt + '" on this browser yet.');
          } else {
            statusLine.textContent = 'Backup snapshot verified ready.';
          }
        }
      }, labelTxt);
      return btn;
    }

    let clearArmed = false;
    const clearBtn = domH('button', {
      type: 'button',
      class: 'bt-lab-btn is-danger',
      onclick: function () {
        if (!clearArmed) {
          clearArmed = true;
          clearBtn.textContent = 'Confirm Step 2/2: Clear All Saved App Data';
          setTimeout(function () { clearArmed = false; clearBtn.textContent = 'Clear Everything on This Device (2-Tap)'; }, 4500);
          return;
        }
        clearArmed = false;
        if (typeof st.clearEverything === 'function') st.clearEverything();
        else if (typeof clearEverything === 'function') clearEverything();
        else {
          try { localStorage.removeItem('brew-and-cup-difluid-auth-v1'); localStorage.removeItem(ACADEMY_LS_KEY); } catch (_) {}
        }
        statusLine.textContent = 'Cleared browser storage cleanly (your downloaded backup files on disk are untouched).';
      }
    }, 'Clear Everything on This Device (2-Tap)');

    const vaultRoot = domH('div', { class: 'bt-sheet-content bt-vault-sheet' },
      buildThreeCardSaveRestoreCenter({
        isSheet: false,
        onAfterMutate: function () {
          if (hostEl) renderDataVaultSheet(hostEl);
          else rerenderAcademyTab();
        }
      }),
      domH('details', { class: 'bt-lab-details', style: 'margin-top:4px' },
        domH('summary', { text: 'Advanced Multi-Part Backups (.txt), Auto-Sync Handles & Safety Snapshots' }),
        domH('div', { style: 'display:flex;flex-direction:column;gap:12px;padding-top:10px' },
          statusLine,
          handleList,

          domH('section', { class: 'bt-lab-subcard' },
            domH('strong', { text: 'Multi-Part Archive (.txt) & Extra Spreadsheet (.csv) Exports' }),
            domH('div', { class: 'bt-lab-btn-row' },
              domH('button', { type: 'button', class: 'bt-lab-btn is-primary', onclick: handleSaveEverything },
                ic('vault-shield', { size: 16 }), domH('span', { text: 'Save Everything Backup (.txt)' })),
              domH('button', {
                type: 'button',
                class: 'bt-lab-btn',
                onclick: function () {
                  const csv = (hist && hist.text) || (typeof COLUMNS !== 'undefined' ? COLUMNS.join(',') + '\n' : 'schema_version,id,coffee_name,total_score\n');
                  downloadTextBlob(csv, 'BeanTelligence Taste History.csv', 'text/csv;charset=utf-8');
                  statusLine.textContent = 'Exported BeanTelligence Taste History.csv!';
                }
              }, 'Export Tasting History (.csv)'),
              domH('button', {
                type: 'button',
                class: 'bt-lab-btn',
                onclick: function () {
                  const csv = pr && pr.list && typeof priceCsv === 'function' ? priceCsv(pr.list) : 'id,coffee,price,size\n';
                  downloadTextBlob(csv, 'BeanTelligence Prices.csv', 'text/csv;charset=utf-8');
                  statusLine.textContent = 'Exported BeanTelligence Prices.csv!';
                }
              }, 'Export My Beans (.csv)'),
              domH('button', {
                type: 'button',
                class: 'bt-lab-btn',
                onclick: function () {
                  const csv = shStore && shStore.store && typeof shopCsv === 'function' ? shopCsv(shStore.store) : 'kind,shop,drink,price\n';
                  downloadTextBlob(csv, 'BeanTelligence Coffee Shops.csv', 'text/csv;charset=utf-8');
                  statusLine.textContent = 'Exported BeanTelligence Coffee Shops.csv!';
                }
              }, 'Export Cafes (.csv)'),
              domH('button', {
                type: 'button',
                class: 'bt-lab-btn',
                onclick: async function () {
                  try {
                    if (navigator.storage && typeof navigator.storage.persist === 'function') {
                      const granted = await navigator.storage.persist();
                      statusLine.textContent = granted ? 'Durable Browser Storage locked against OS eviction!' : 'Browser storage active (download .json backups or bookmark your #btsave link on iOS).';
                    } else {
                      statusLine.textContent = 'Local storage active.';
                    }
                  } catch (_) {}
                }
              }, 'Lock Durable Storage')
            )
          ),

          domH('section', { class: 'bt-lab-subcard' },
            domH('strong', { text: 'Paste Multi-Part Code, NB1.z Block or QR Brew Passport' }),
            dropZone
          ),

          domH('section', { class: 'bt-lab-subcard' },
            domH('strong', { text: 'Safety Snapshots & App Preferences' }),
            domH('div', { class: 'bt-lab-btn-row' },
              domH('button', {
                type: 'button',
                class: 'bt-lab-btn is-sm is-primary',
                onclick: async function () {
                  const fn = st.ensurePreMigrationSnapshot || window.ensurePreMigrationSnapshot;
                  if (typeof fn === 'function') await fn({ targetSchema: '6.2', forceManual: true });
                  statusLine.textContent = 'Captured verified safety snapshot of all your saved data!';
                }
              }, 'Save Safety Snapshot Now'),
              makeRollbackBtn('pre-import-safety', 'Undo Last Save Import'),
              makeRollbackBtn('pre-v6-raw', 'Restore Pre-Update Backup (v6)'),
              makeRollbackBtn('pre-v5-raw', 'Restore Legacy Backup (v5)'),
              domH('button', {
                type: 'button',
                class: 'bt-lab-btn is-sm',
                onclick: function () {
                  if (sh().openSheet) sh().openSheet('workflow-tools', null, { detent: 'full', title: 'My Workflow & Tools' });
                }
              }, 'My Workflow & Tools \u2192'),
              domH('button', {
                type: 'button',
                class: 'bt-lab-btn is-sm',
                onclick: function () { openNamedSheet('about-charter', null, { detent: 'full', title: 'About & ' + releases.length + ' Releases' }); }
              }, 'About / ' + Math.max(148, releases.length) + ' Releases \u2192')
            )
          ),

          domH('section', { class: 'bt-lab-subcard bt-vault-danger-zone' },
            domH('strong', { text: '2-Step Device Storage Reset' }),
            clearBtn
          )
        )
      )
    );

    if (hostEl) {
      hostEl.textContent = '';
      hostEl.appendChild(vaultRoot);
    }
    return vaultRoot;
  }

  /* ==========================================================================
   * ONBOARDING TOUR ('onboarding-tour') & EPISTEMIC CHARTER ('about-charter')
   * ========================================================================== */
  function renderOnboardingTourSheet(arg0) {
    const hostEl = arg0 && arg0.nodeType === 1 ? arg0 : null;
    const slides = [
      { title: '1. Calm 5-Step Guided Home Brew', body: 'Brew a Great Cup Now or Fix My Last Cup: pick your coffee, choose any of 23+ brewers or espresso machines, follow your recipe & voice-guided timer, and rate in 1 tap.' },
      { title: '2. Instant AI Bag Label Scan & My Beans Shelf', body: 'Copy our structured prompt with your bag photo into ChatGPT/Claude/Gemini and paste back — or pick from 140+ pre-loaded specialty bags.' },
      { title: '3. Actionable Lab Charts & 14 Rescue Calculators', body: 'Tap anywhere on the Touch-to-Brew chart to load your recipe, rescue a bitter/sour cup right in the mug, pick Regular Tap / Filtered / Bottled water, or check your Last Safe Sip.' },
      { title: '4. World Coffee Belt Map & Personal Palate Guide', body: 'Explore all 52 coffee-producing countries on the 23.5°N–23.5°S Coffee Belt, open Origin Passport Cards, and test store bags before buying.' },
      { title: '5. 100% Private Local Data Vault', body: 'Every tasting, open bag, cafe visit, and calibration lives privately on your device with 1-tap Spreadsheet (.csv) exports and Full (.txt) backups.' }
    ];
    const sIdx = ((acadUi.tourStep % slides.length) + slides.length) % slides.length;
    const cur = slides[sIdx];

    const mascotBox = domH('div', { class: 'bt-tour-mascot' });
    if (window.Beanjamin && typeof window.Beanjamin.svg === 'function') {
      mascotBox.innerHTML = window.Beanjamin.svg('welcome', { view: 'full' });
    }

    const box = domH('div', { class: 'bt-sheet-content bt-tour-sheet' },
      mascotBox,
      domH('span', { class: 'bt-kicker', text: 'STEP ' + (sIdx + 1) + ' OF ' + slides.length }),
      domH('h2', { text: cur.title }),
      domH('p', { class: 'bt-module-lead', text: cur.body }),
      domH('div', { class: 'bt-lab-btn-row' },
        domH('button', {
          type: 'button',
          class: 'bt-lab-btn',
          onclick: function () { acadUi.tourStep = Math.max(0, sIdx - 1); if (hostEl) renderOnboardingTourSheet(hostEl); }
        }, 'Back'),
        domH('button', {
          type: 'button',
          class: 'bt-lab-btn is-primary',
          onclick: function () {
            if (sIdx < slides.length - 1) {
              acadUi.tourStep = sIdx + 1;
              if (hostEl) renderOnboardingTourSheet(hostEl);
            } else if (sh().closeSheet) {
              sh().closeSheet();
            }
          }
        }, sIdx < slides.length - 1 ? 'Next \u2192' : 'Start Brewing')
      )
    );
    if (hostEl) { hostEl.textContent = ''; hostEl.appendChild(box); }
    return box;
  }

  function renderAboutCharterSheet(arg0) {
    const hostEl = arg0 && arg0.nodeType === 1 ? arg0 : null;
    const releases = getReleasesList();
    const wm = domH('div', { class: 'bt-about-wordmark' });
    if (window.BTBrand && typeof window.BTBrand.wordmarkSvg === 'function') {
      wm.innerHTML = window.BTBrand.wordmarkSvg();
    } else {
      wm.textContent = 'BeanTelligence v6.2 — A little science, a lot of delicious.';
    }

    const box = domH('div', { class: 'bt-sheet-content bt-about-sheet' },
      wm,
      domH('section', { class: 'bt-lab-subcard' },
        domH('h3', { text: '4-Tier Epistemic Honesty Charter' }),
        domH('div', { class: 'bt-charter-badges' },
          domH('div', { class: 'bt-charter-row' }, epistemicPill('verified_science'), domH('span', { text: 'Peer-reviewed thermodynamics, conservation of mass, IUPAC stoichiometry, ICUMSA SPS-3, or published SCA/CVA standards.' })),
          domH('div', { class: 'bt-charter-row' }, epistemicPill('calibrated_biophysics'), domH('span', { text: 'Mechanistic models or active academic research where cultivar, consumer cluster, or cup matrix shifts the optimum.' })),
          domH('div', { class: 'bt-charter-row' }, epistemicPill('craft_convention'), domH('span', { text: 'Time-tested specialty roaster & barista starting points — helpful defaults that always bow to your own palate.' })),
          domH('div', { class: 'bt-charter-row' }, epistemicPill('myth_debunked'), domH('span', { text: 'Viral coffee folklore contradicted by controlled human sensory trials or analytical chemistry.' }))
        )
      ),
      domH('details', { class: 'bt-lab-details' },
        domH('summary', { text: 'Release History (' + releases.length + ' Cumulative Releases)' }),
        domH('div', { class: 'bt-releases-list' },
          releases.slice(0, 30).map(function (rel) {
            const title = (rel.v || rel.num || rel.version || '') + (rel.title ? (' — ' + rel.title) : '');
            const desc = rel.notes || rel.body || rel.text || '';
            return domH('div', { class: 'bt-glossary-item' },
              domH('strong', { text: title || 'Release' }),
              desc ? domH('p', { text: String(desc) }) : null
            );
          })
        )
      )
    );
    if (hostEl) { hostEl.textContent = ''; hostEl.appendChild(box); }
    return box;
  }

  function renderScaCuppingSheet(arg0) {
    const hostEl = arg0 && arg0.nodeType === 1 ? arg0 : null;
    const box = domH('div', { class: 'bt-sheet-content' }, buildScaCockpitWidget({ isSheet: true, hostEl: hostEl }));
    if (hostEl) { hostEl.textContent = ''; hostEl.appendChild(box); }
    return box;
  }

  /* ==========================================================================
   * TAB 5 ('academy'): 5 CLEAN SEGMENTS & ROUTE REGISTRATION
   * ========================================================================== */
  let lastAcademyMount = null;

  function normalizeAcademySub(raw) {
    if (raw === 'sca' || raw === 'blind' || raw === 'tastes' || raw === 'gym') return 'gym';
    if (raw === 'every' || raw === 'backup' || raw === 'files' || raw === 'vault') return 'vault';
    if (raw === 'glossary' || raw === 'folk' || raw === 'curriculum') return raw;
    return 'curriculum';
  }

  function rerenderAcademyTab() {
    if (lastAcademyMount) renderAcademyTab(lastAcademyMount);
  }

  function renderAcademyTab(mountEl, ctx) {
    if (mountEl && mountEl.nodeType === 1) lastAcademyMount = mountEl;
    const a = getApp();
    a.tabSegments = a.tabSegments || {};
    if (ctx && ctx.segment) {
      acadUi.subView = normalizeAcademySub(ctx.segment);
    } else if (a.tabSegments.academy) {
      acadUi.subView = normalizeAcademySub(a.tabSegments.academy);
    }
    a.tabSegments.academy = acadUi.subView;

    const page = domH('div', { class: 'bt-tab-page bt-academy-page' });
    const glCount = getGlossaryEntries().length;

    const nav = domH('nav', { class: 'bt-studio-pill-nav no-print', 'aria-label': 'Learn and Vault Sections' },
      [
        { id: 'gym', lbl: '5-Bowl Cupping Table', icon: 'cafe-cup' },
        { id: 'curriculum', lbl: '19 Mini-Courses', icon: 'academy' },
        { id: 'glossary', lbl: 'A–Z Glossary (' + glCount + ')', icon: 'search-filter' },
        { id: 'folk', lbl: '32 Myth-Busters', icon: 'xray-loupe' },
        { id: 'vault', lbl: 'Backup & Data Vault', icon: 'vault-shield' }
      ].map(function (t) {
        return domH('button', {
          type: 'button',
          class: 'bt-studio-nav-pill' + (acadUi.subView === t.id ? ' is-active' : ''),
          'aria-pressed': String(acadUi.subView === t.id),
          onclick: function () {
            acadUi.subView = t.id;
            const appNow = getApp();
            appNow.tabSegments = appNow.tabSegments || {};
            appNow.tabSegments.academy = t.id;
            if (typeof sh().setTabSegment === 'function') {
              sh().setTabSegment('academy', t.id);
            } else {
              saveDraftSoon();
            }
            CK.haptic('tick');
            rerenderAcademyTab();
          }
        }, ic(t.icon, { size: 15 }), domH('span', { text: t.label || t.lbl }));
      })
    );
    page.appendChild(nav);

    if (acadUi.subView === 'gym') page.appendChild(renderPalateGymView());
    else if (acadUi.subView === 'glossary') page.appendChild(renderGlossaryView());
    else if (acadUi.subView === 'folk') page.appendChild(renderFolkloreDeckView());
    else if (acadUi.subView === 'vault') page.appendChild(renderDataVaultSheet(null));
    else page.appendChild(renderCurriculumView());

    if (mountEl && mountEl.nodeType === 1) {
      mountEl.textContent = '';
      mountEl.appendChild(page);
    }
    return page;
  }

  function jumpToAcademy(sub, fromTaste) {
    const normSub = normalizeAcademySub(sub || 'curriculum');
    acadUi.subView = normSub;
    if (fromTaste) {
      acadUi.scaReturnToTaste = true;
      const P = sh().PARENT || (typeof PARENT !== 'undefined' ? PARENT : null);
      if (P) P.sca = 'taste';
    }
    const shell = sh();
    if (shell.app) {
      shell.app.tabSegments = shell.app.tabSegments || {};
      shell.app.tabSegments.academy = normSub;
      if (typeof shell.switchTab === 'function') {
        shell.switchTab('academy', { segment: normSub });
        return;
      }
      shell.app.activeTab = 'academy';
    }
    if (typeof shell.render === 'function') shell.render();
    else rerenderAcademyTab();
  }

  function registerAcademyAndVaultBindings() {
    const shell = sh();
    if (typeof shell.registerTab === 'function') shell.registerTab('academy', renderAcademyTab);
    if (typeof BTSheet !== 'undefined' && BTSheet && typeof BTSheet.register === 'function') {
      BTSheet.register('save-backup-center', renderSaveBackupCenterSheet, { title: 'Backup & Load Saves', detent: 'full' });
    }
    if (typeof shell.registerSheet === 'function') {
      shell.registerSheet('save-backup-center', renderSaveBackupCenterSheet, { title: 'Backup & Load Saves', detent: 'full' });
      shell.registerSheet('data-vault', renderDataVaultSheet);
      shell.registerSheet('onboarding-tour', renderOnboardingTourSheet);
      shell.registerSheet('about-charter', renderAboutCharterSheet);
      shell.registerSheet('sca-cupping', renderScaCuppingSheet);
    }
    if (typeof shell.registerRoute === 'function') {
      /* NOTE: Never register 'coffee' or 'loadshared' here — owned by Guided Home Brew in 02 & 05! */
      shell.registerRoute('academy', function () { jumpToAcademy('curriculum'); });
      shell.registerRoute('learn', function () { jumpToAcademy('curriculum'); });
      shell.registerRoute('folk', function () { jumpToAcademy('folk'); });
      shell.registerRoute('glossary', function () { jumpToAcademy('glossary'); });
      shell.registerRoute('blind', function () { jumpToAcademy('gym'); });
      shell.registerRoute('tastes', function () { jumpToAcademy('gym'); });
      shell.registerRoute('sca', function () {
        const a = getApp();
        const cameFromTaste = !!(a && (a.activeTab === 'brew' || a.brewStep === 'taste' || a.screen === 'taste'));
        jumpToAcademy('gym', cameFromTaste);
      });
      shell.registerRoute('tour', function () { openNamedSheet('onboarding-tour', null, { detent: 'full', title: 'Interactive Feature Tour' }); });
      shell.registerRoute('guide', function () { openNamedSheet('onboarding-tour', null, { detent: 'full', title: 'Interactive Feature Tour' }); });
      shell.registerRoute('about', function () { openNamedSheet('about-charter', null, { detent: 'full', title: 'About BeanTelligence & Epistemic Charter' }); });
      shell.registerRoute('every', function () { jumpToAcademy('vault'); });
      shell.registerRoute('backup', function () { jumpToAcademy('vault'); });
      shell.registerRoute('files', function () { jumpToAcademy('vault'); });
    }
  }

  registerAcademyAndVaultBindings();

  window.BTBackupCenter = {
    open: openSaveBackupCenterModal,
    close: function () {
      _restoreInlineSaveIdsAfterSheet();
      const shell = sh();
      if (shell.closeSheet) shell.closeSheet();
      else if (typeof BTSheet !== 'undefined' && BTSheet && typeof BTSheet.close === 'function') BTSheet.close();
    },
    render: renderSaveBackupCenterSheet,
    buildCenter: buildThreeCardSaveRestoreCenter
  };

  window.BTAcademyVault = {
    renderAcademyTab: renderAcademyTab,
    renderSaveBackupCenterSheet: renderSaveBackupCenterSheet,
    renderDataVaultSheet: renderDataVaultSheet,
    renderOnboardingTourSheet: renderOnboardingTourSheet,
    renderAboutCharterSheet: renderAboutCharterSheet,
    renderScaCuppingSheet: renderScaCuppingSheet,
    exactTriangleBinomialPValue: exactTriangleBinomialPValue,
    computeCvaBowlScore: computeCvaBowlScore,
    readAcademyState: readAcademyState,
    writeAcademyState: writeAcademyState,
    state: acadUi
  };
})();
