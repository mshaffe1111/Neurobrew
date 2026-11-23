/* ============================================================================
 * BeanTelligence v7.5 — Tab 5 ('academy'): Learn & Vault
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
    const t = String(fallbackTier || '').trim().toLowerCase();
    if (t.indexOf('myth') >= 0 || t === 'not') return '[Myth Debunked]';
    if (t === 'b' || t.indexOf('craft') >= 0 || t.indexOf('practice') >= 0) return '[Craft Best Practice]';
    if (t === 'c' || t === 'd' || t.indexOf('active') >= 0 || t.indexOf('research') >= 0 || t.indexOf('nuanced') >= 0 || t.indexOf('partly') >= 0 || t.indexOf('calibrated') >= 0) return '[Active Research]';
    return '[Verified Science]';
  }

  function deriveLessonTier(ls) {
    if (!ls || typeof ls !== 'object') return 'verified_science';
    const rawTier = (ls.epistemicTier != null && String(ls.epistemicTier).trim())
      ? String(ls.epistemicTier).trim()
      : ((ls.rate != null && String(ls.rate).trim()) ? String(ls.rate).trim() : '');
    if (rawTier) {
      const t = rawTier.toLowerCase();
      if (t === 'a' || t === 'verified_science' || t === 'solid') return 'verified_science';
      if (t === 'b' || t.indexOf('craft') >= 0 || t.indexOf('practice') >= 0) return 'craft_best_practice';
      if (t === 'c' || t === 'd' || t.indexOf('active') >= 0 || t.indexOf('research') >= 0 || t.indexOf('nuanced') >= 0 || t.indexOf('partly') >= 0 || t.indexOf('calibrated') >= 0) return 'active_research';
      if (t.indexOf('myth') >= 0 || t === 'not') return 'myth_debunked';
      return rawTier;
    }
    const bStr = extractBadgeLabel(ls.badge, ls.epistemic || '').toLowerCase();
    if (bStr.indexOf('myth') >= 0) return 'myth_debunked';
    if (bStr.indexOf('craft') >= 0 || bStr.indexOf('practice') >= 0) return 'craft_best_practice';
    if (bStr.indexOf('active') >= 0 || bStr.indexOf('research') >= 0) return 'active_research';
    return 'verified_science';
  }

  function extractLessonFields(ls) {
    if (!ls || typeof ls !== 'object') {
      return { hook: '', plain: '', why: '', paras: [], nums: '', limits: '', sources: [], tips: [], hasRealContent: false };
    }
    const hook = typeof ls.hook === 'string' ? ls.hook.trim() : '';
    const plain = typeof ls.plain === 'string' ? ls.plain.trim() : '';
    const why = typeof ls.why === 'string' ? ls.why.trim() : '';
    const nums = typeof ls.nums === 'string' ? ls.nums.trim() : '';
    const limits = typeof ls.limits === 'string' ? ls.limits.trim() : '';
    const paras = [];
    if (plain) paras.push(plain);
    if (why) paras.push(why);
    if (!paras.length) {
      if (Array.isArray(ls.paras) && ls.paras.length) {
        ls.paras.forEach(function (p) { if (p) paras.push(String(p).trim()); });
      } else {
        const fb = ls.lead || ls.summary || ls.body || '';
        if (fb) paras.push(String(fb).trim());
      }
    }
    const sources = [];
    const rawSrc = Array.isArray(ls.src) ? ls.src : (Array.isArray(ls.sources) ? ls.sources : []);
    rawSrc.forEach(function (s) {
      if (!s) return;
      if (typeof s === 'string') {
        const cleanStr = s.trim();
        if (cleanStr) sources.push({ cite: cleanStr, short: cleanStr, link: '' });
      } else if (typeof s === 'object') {
        const rawLink = String(s.link || s.url || s.doi || '').trim();
        const safeLink = /^https?:\/\//i.test(rawLink) ? rawLink : '';
        sources.push({
          cite: String(s.cite || s.title || s.short || 'Peer-reviewed source').trim(),
          short: String(s.short || s.cite || s.title || 'Source').trim(),
          link: safeLink
        });
      }
    });
    const tips = Array.isArray(ls.tips) ? ls.tips.filter(Boolean).map(String) : [];
    const hasRealContent = !!(hook || paras.length || nums || limits || sources.length || tips.length);
    return { hook: hook, plain: plain, why: why, paras: paras, nums: nums, limits: limits, sources: sources, tips: tips, hasRealContent: hasRealContent };
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
    const tierTrim = String(tier || '').trim().toLowerCase();
    const raw = tierTrim ? extractBadgeLabel('', tierTrim) : extractBadgeLabel(explicitBadge, '');
    const t = (tierTrim + ' ' + raw).toLowerCase();
    if (tierTrim === 'not' || t.indexOf('myth') >= 0) {
      return domH('span', { class: 'bt-epistemic-pill is-myth' }, ic('close-x', { size: 13 }), domH('span', { text: '[Myth Debunked]' }));
    }
    if (tierTrim === 'b' || t.indexOf('craft') >= 0 || t.indexOf('practice') >= 0) {
      return domH('span', { class: 'bt-epistemic-pill is-craft' }, ic('spark-star', { size: 13 }), domH('span', { text: '[Craft Best Practice]' }));
    }
    if (tierTrim === 'c' || tierTrim === 'd' || t.indexOf('nuanced') >= 0 || t.indexOf('partly') >= 0 || t.indexOf('calibrated') >= 0 || t.indexOf('active') >= 0 || t.indexOf('research') >= 0) {
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
        triangleSessionTrials: 0,
        triangleSessionCorrect: 0,
        triangleSessionStreak: 0,
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
      const triTrials = clamp(parseInt(gh.triangleTrials, 10) || 0, 0, 10000, 0);
      const triCorrect = clamp(parseInt(gh.triangleCorrect, 10) || 0, 0, triTrials, 0);
      const hasSess = gh.triangleSessionTrials !== undefined && gh.triangleSessionTrials !== null;
      const triSessTrials = hasSess ? clamp(parseInt(gh.triangleSessionTrials, 10) || 0, 0, 10000, 0) : triTrials;
      const triSessCorrect = hasSess ? clamp(parseInt(gh.triangleSessionCorrect, 10) || 0, 0, triSessTrials, 0) : triCorrect;
      const triSessStreak = clamp(parseInt(gh.triangleSessionStreak != null ? gh.triangleSessionStreak : gh.triangleStreak, 10) || 0, 0, triSessCorrect, 0);
      return {
        bookmarkedIds: Array.isArray(p.bookmarkedIds) ? p.bookmarkedIds.filter(function (x) { return typeof x === 'string'; }) : [],
        completedModuleIds: Array.isArray(p.completedModuleIds) ? p.completedModuleIds.filter(function (x) { return typeof x === 'string'; }) : [],
        completedLessonIds: Array.isArray(p.completedLessonIds) ? p.completedLessonIds.filter(function (x) { return typeof x === 'string'; }) : [],
        quizPassedIds: Array.isArray(p.quizPassedIds) ? p.quizPassedIds.filter(function (x) { return typeof x === 'string'; }) : [],
        palateGymHistory: {
          triangleTrials: triTrials,
          triangleCorrect: triCorrect,
          triangleSessionTrials: triSessTrials,
          triangleSessionCorrect: triSessCorrect,
          triangleSessionStreak: triSessStreak,
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
    clean.palateGymHistory.triangleTrials = clamp(parseInt(clean.palateGymHistory.triangleTrials, 10) || 0, 0, 10000, 0);
    clean.palateGymHistory.triangleCorrect = clamp(parseInt(clean.palateGymHistory.triangleCorrect, 10) || 0, 0, clean.palateGymHistory.triangleTrials, 0);
    clean.palateGymHistory.triangleSessionTrials = clamp(parseInt(clean.palateGymHistory.triangleSessionTrials, 10) || 0, 0, 10000, 0);
    clean.palateGymHistory.triangleSessionCorrect = clamp(parseInt(clean.palateGymHistory.triangleSessionCorrect, 10) || 0, 0, clean.palateGymHistory.triangleSessionTrials, 0);
    clean.palateGymHistory.triangleSessionStreak = clamp(parseInt(clean.palateGymHistory.triangleSessionStreak, 10) || 0, 0, clean.palateGymHistory.triangleSessionCorrect, 0);
    try {
      localStorage.setItem(ACADEMY_LS_KEY, JSON.stringify(clean));
    } catch (_) {}
    return clean;
  }

  window.readAcademyState = readAcademyState;
  window.writeAcademyState = writeAcademyState;

  function exactTriangleBinomialPValue(nTrials, kCorrect) {
    if (nTrials === null || nTrials === undefined || nTrials === '' ||
        kCorrect === null || kCorrect === undefined || kCorrect === '') {
      return 1.0;
    }
    const nNum = Number(nTrials);
    const kNum = Number(kCorrect);
    if (!Number.isFinite(nNum) || !Number.isFinite(kNum)) return 1.0;
    let N = Math.max(0, Math.floor(nNum));
    let K = Math.max(0, Math.floor(kNum));
    if (N > 10000) {
      K = Math.round((K / N) * 10000);
      N = 10000;
    }
    if (N === 0 || K === 0) return 1.0;
    if (K > N) return 0.0;

    /* Exact O(N) log-space recurrence: P(X=j+1)/P(X=j) = ((N-j)/(j+1)) * ((1/3)/(2/3)) */
    const m = Math.min(K, N - K);
    let logComb = 0;
    for (let i = 1; i <= m; i++) {
      logComb += Math.log(N - m + i) - Math.log(i);
    }
    const logP = Math.log(1 / 3);
    const logQ = Math.log(2 / 3);
    const logRatio = Math.log(0.5);
    let logTerm = logComb + K * logP + (N - K) * logQ;
    let pSum = Math.exp(logTerm);
    const meanPos = N / 3;
    for (let j = K; j < N; j++) {
      logTerm += Math.log(N - j) - Math.log(j + 1) + logRatio;
      if (j > meanPos && logTerm < -745) break;
      pSum += Math.exp(logTerm);
    }
    return clamp(pSum, 0, 1, 1);
  }

  window.exactTriangleBinomialPValue = exactTriangleBinomialPValue;

  /* Exact CVA 104-2024 Affective Formula: S = 0.65625 * sum8 + 52.75 - 2*u - 4*d (u + d <= 5) */
  function clampBowlCupDefects(nonUniformRaw, defectiveRaw) {
    const u = clamp(Math.floor(Number(nonUniformRaw) || 0), 0, 5, 0);
    const d = clamp(Math.floor(Number(defectiveRaw) || 0), 0, Math.max(0, 5 - u), 0);
    return { nonUniformCups: u, defectiveCups: d };
  }

  function computeCvaBowlScore(bowl) {
    const def = clampBowlCupDefects(bowl && bowl.nonUniformCups, bowl && bowl.defectiveCups);
    if (bowl && bowl.scoringMode === 'quick_sca' && Number.isFinite(Number(bowl.quickBaseSca))) {
      const quickBase = clamp(Number(bowl.quickBaseSca), 50, 100, 85);
      const rawQ = quickBase - 2 * def.nonUniformCups - 4 * def.defectiveCups;
      return +(Math.round(clamp(rawQ, 0, 100, 85) * 4) / 4).toFixed(2);
    }
    const hArr = Array.isArray(bowl && bowl.hVals) && bowl.hVals.length === 8 ? bowl.hVals : [6, 6, 6, 6, 6, 6, 6, 6];
    let sum8 = 0;
    for (let i = 0; i < 8; i++) {
      sum8 += Math.round(clamp(hArr[i], 1, 9, 6));
    }
    const raw = 0.65625 * sum8 + 52.75 - 2 * def.nonUniformCups - 4 * def.defectiveCups;
    return +(Math.round(clamp(raw, 0, 100, 84.25) * 4) / 4).toFixed(2);
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
    const cleanTarget = +(Math.round(clamp(Number(targetBaseSca), 58, 100, 85) * 4) / 4).toFixed(2);
    bowl.scoringMode = 'quick_sca';
    bowl.quickBaseSca = cleanTarget;
    if (!Array.isArray(bowl.hVals) || bowl.hVals.length !== 8) {
      bowl.hVals = [6, 6, 6, 6, 6, 6, 6, 6];
    } else {
      bowl.hVals = bowl.hVals.map(function (v) { return Math.round(clamp(v, 1, 9, 6)); });
    }
    bowl.score = computeCvaBowlScore(bowl);
    return bowl.score;
  }

  function normalizeCvaTraitToIntensity5(val1to9) {
    const v = clamp(Number(val1to9), 1, 9, 5);
    return +(Math.round((1 + (v - 1) * 0.5) * 10) / 10).toFixed(1);
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
      body: 'Decaffeinated beans exhibit higher cellular porosity and brittle micro-fines generation: start +5% coarser on gravity filter to prevent fines blinding, yet -5.5% finer on 9-bar espresso due to reduced CO2 puck resistance.'
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
      body: 'Above 65 °C heat masks flavor; consumer hedonic liking peaks near 55–62 °C (Ristenpart et al. 2022), while cooling toward 50–35 °C sharpens TRPM5 sweet signaling and fruit ester clarity (Talavera et al. 2005).'
    }
  ];

  const FALLBACK_LESSONS_19 = [
    { id: 'seed', title: '1. From Cherry to Green Seed', rate: 'B', epistemicTier: 'craft_best_practice', paras: ['A coffee bean is the dense endosperm seed inside a ripe Coffea fruit cherry surrounded by skin, sweet mucilage, and parchment.'] },
    { id: 'family', title: '2. Where Arabica Came From', rate: 'A', epistemicTier: 'verified_science', paras: ['Coffea arabica arose from a single natural cross between maternal C. eugenioides and paternal C. canephora ~350k–610k years ago.'] },
    { id: 'species', title: '3. Arabica and Robusta', rate: 'B', epistemicTier: 'craft_best_practice', paras: ['Arabica holds ~1.0–1.5% caffeine and more sugars/lipids; Robusta holds ~1.8–2.6% caffeine with stronger bitterness.'] },
    { id: 'liberica', title: '4. Liberica, Excelsa & Stenophylla', rate: 'A', epistemicTier: 'verified_science', paras: ['Kew Gardens phylogenomics (2025) resolved C. liberica, C. dewevrei (Excelsa), and C. klainei as distinct species; C. stenophylla tolerates far hotter climates.'] },
    { id: 'altitude', title: '5. Altitude, Latitude & Bean Density', rate: 'B', epistemicTier: 'craft_best_practice', paras: ['Cooler night maturation slows fruit ripening, packing denser cell walls and vibrant brightness — modulated by latitude and trade winds.'] },
    { id: 'origin', title: '6. Does Country Matter?', rate: 'B', epistemicTier: 'craft_best_practice', paras: ['Origin is a strong statistical clue to cup character, though individual farms, cultivars, and processing still vary widely.'] },
    { id: 'roasting', title: '7. What Roasting Does', rate: 'A', epistemicTier: 'verified_science', paras: ['Light-to-medium roasts build Maillard aromatics and pleasant CGA lactones; dark roasts degrade lactones into harsher phenylindanes.'] },
    { id: 'taste', title: '8. Sour, Bitter, Sweet & Cooling', rate: 'A', epistemicTier: 'verified_science', paras: ['Black coffee (<0.05% sugar) tastes sweet via retronasal aroma (OISE); hedonic liking peaks near 55–62 °C (Ristenpart 2022) and TRPM5 sweet signaling sharpens across 50–35 °C (Talavera 2005).'] },
    { id: 'caffeine', title: '9. Caffeine: Weight vs. Scoop', rate: 'A', epistemicTier: 'verified_science', paras: ['By weight, light and dark Arabica carry nearly identical caffeine (~1.1–1.2%); by scoop, denser light beans pack ~10–15% more weight.'] },
    { id: 'decaf', title: '10. How Decaf Works (All 4 Methods)', rate: 'A', epistemicTier: 'verified_science', paras: ['Modern decaffeination removes 97–99.9% of caffeine while preserving polyphenols; porous decaf grinds +5% coarser on filter and -5.5% finer on espresso.'] },
    { id: 'grind', title: '11. Grinding, Static & Freezing', rate: 'A', epistemicTier: 'verified_science', paras: ['Finer grinding multiplies surface area while micro-fines (<100 um) govern flow; ~0.1 mL RDT water per 20g quenches static clumping.'] },
    { id: 'extraction', title: '12. Strength (TDS) and Extraction (EY)', rate: 'A', epistemicTier: 'verified_science', paras: ['Strength (%TDS) is beverage concentration; Extraction Yield (%EY) is the dry bean fraction dissolved (acids \u2192 sugars \u2192 bitters).'] },
    { id: 'temperature', title: '13. Hot, But How Hot?', rate: 'A', epistemicTier: 'verified_science', paras: ['Hotter brew water (93–96 °C) speeds extraction of dense light roasts; cooler water (86–90 °C) slows late bitter extraction in dark roasts.'] },
    { id: 'fresh', title: '14. Why Fresh Matters', rate: 'A', epistemicTier: 'verified_science', paras: ['Up to 75% of trapped CO2 vents during grinding and the first 90 seconds; darker roasts release more CO2 than light roasts.'] },
    { id: 'rest', title: '15. How Long to Rest', rate: 'C', epistemicTier: 'active_research', paras: ['Post-roast degassing rest windows vary by roast porosity and brew method and remain active sensory research plus roaster convention.'] },
    { id: 'storage', title: '16. Keeping Beans Fresh', rate: 'A', epistemicTier: 'verified_science', paras: ['Oxygen, heat, moisture, and pre-grinding accelerate staling; keep whole beans in an opaque valve bag or airtight canister and grind fresh.'] },
    { id: 'freeze', title: '17. Freezing Tips', rate: 'B', epistemicTier: 'craft_best_practice', paras: ['Freezing whole beans for 9 weeks kept aroma markedly closer to fresh in Cotter & Hopfer (2018); thawing sealed prevents condensation.'] },
    { id: 'water', title: '18. Water Is Most of It', rate: 'A', epistemicTier: 'verified_science', paras: ['Mg2+ and Ca2+ aid extraction while bicarbonate alkalinity (target ~40–70 mg/L CaCO3) buffers sharp acids without flattening fruit brightness.'] },
    { id: 'cold', title: '19. Cold Brew Is Not Iced Coffee', rate: 'A', epistemicTier: 'verified_science', paras: ['Cold steeping leaves behind high-activation-energy bitter/rubbery roast compounds that extract at 92 °C, yielding a rounder, more floral-sweet profile.'] }
  ];

  const LESSON_QUIZ_BY_ID = {
    seed: {
      q: 'What is a coffee "peaberry" inside a coffee cherry?',
      opts: ['A tiny defective husk', 'A single round seed (~5–7% of harvest) when only one ovule develops', 'A dark-roasted Robusta bean'],
      ans: 1
    },
    family: {
      q: 'How did Coffea arabica (2n = 4x = 44) originate in East African forests?',
      opts: ['A natural cross between maternal C. eugenioides and paternal C. canephora', 'Selective breeding in 19th-century Brazil', 'Mutation from tea shrubs'],
      ans: 0
    },
    species: {
      q: 'How do Arabica and Robusta typically compare in caffeine and sucrose?',
      opts: ['Arabica has twice the caffeine of Robusta', 'Robusta holds more caffeine (~1.8–2.6%) and less sugar/fat than Arabica (~1.0–1.5%)', 'Both species carry identical caffeine and sugar levels'],
      ans: 1
    },
    liberica: {
      q: 'What did the 2025 Kew Gardens phylogenomic study (Davis et al.) resolve about Liberica and Excelsa?',
      opts: ['They are identical cultivars of Arabica', 'C. liberica, C. dewevrei (Excelsa), and C. klainei are distinct species', 'Excelsa is a high-altitude Robusta'],
      ans: 1
    },
    altitude: {
      q: 'Why can coffee grown at ~600 m in Hawaii Kona ripen like 1,800 m equatorial coffee?',
      opts: ['Altitude is a proxy for cool maturation nights (16–21 °C), which latitude and oceanic trade winds shift', 'Island volcanoes double atmospheric pressure', 'Low elevation always produces sweeter beans'],
      ans: 0
    },
    origin: {
      q: 'What do Coffee Quality Institute cupping records show about a coffee\'s country of origin?',
      opts: ['Country guarantees an exact score for every lot', 'Country is a helpful statistical clue, though farm, cultivar, and process still vary widely', 'Country has no relationship to flavor'],
      ans: 1
    },
    roasting: {
      q: 'What happens to chlorogenic acid bitter compounds as beans roast past light-medium into dark second crack?',
      opts: ['All bitterness evaporates completely', 'Pleasant chlorogenic acid lactones break down into harsher, lingering phenylindanes', 'Caffeine triples during second crack'],
      ans: 1
    },
    taste: {
      q: 'How do drinking temperature and aroma shape perceived sweetness in black coffee (<0.05% sugar)?',
      opts: ['Cooling creates new sucrose in the mug', 'Hedonic liking peaks near 55–62 °C (Ristenpart) while cooling through 50–35 °C sharpens TRPM5 sweet signaling & retronasal aroma (OISE)', 'Coffee tastes sweetest piping hot above 75 °C'],
      ans: 1
    },
    caffeine: {
      q: 'Why does a level tablespoon scoop of light roast hold ~10–15% more caffeine than a scoop of dark roast?',
      opts: ['Dark roasting burns away half the caffeine', 'Denser light-roast beans pack more grams per scoop, while caffeine by weight is nearly equal', 'Light roasts contain hidden Robusta'],
      ans: 1
    },
    decaf: {
      q: 'Why does porous decaf coffee invert grind strategy between gravity filter and 9-bar espresso?',
      opts: ['Brittle fines slow paper filters (+5% coarser), while low-CO2 pucks flow fast under 9 bar (-5.5% finer)', 'Decaf must always be ground coarser on every brewer', 'Decaf cannot extract above 85 °C'],
      ans: 0
    },
    grind: {
      q: 'What does a tiny RDT water spritz (~0.1 mL per 20 g whole beans) before grinding accomplish?',
      opts: ['Pre-extracts espresso fruit acids', 'Quenches triboelectric static charging so fines stop clumping and clinging', 'Raises bean moisture to 25%'],
      ans: 1
    },
    extraction: {
      q: 'What is the difference between Strength (TDS %) and Extraction Yield (EY %)?',
      opts: ['They are two names for the same reading', 'TDS is beverage concentration; EY is the share of dry coffee mass dissolved (acids \u2192 sugars \u2192 bitters)', 'EY measures caffeine and TDS measures water hardness'],
      ans: 1
    },
    temperature: {
      q: 'In a fixed-grind home brew, how does hotter vs. cooler brew water change extraction?',
      opts: ['Boiling water burns roasted coffee grounds', 'Hotter water (93–96 °C) speeds extraction of dense light roasts; cooler water (86–90 °C) slows late bitter extraction in dark roasts', 'Water temperature never changes extraction rate'],
      ans: 1
    },
    fresh: {
      q: 'How much of roasted coffee\'s trapped CO2 gas escapes during grinding and the first 90 seconds?',
      opts: ['Less than 5%', 'Up to ~75% of trapped CO2 escapes rapidly upon grinding', 'None until hot water touches it'],
      ans: 1
    },
    rest: {
      q: 'What does current evidence say about post-roast resting windows?',
      opts: ['Every coffee peaks at day 14 by universal law', 'Very fresh coffee degasses heavily, but optimal rest windows vary by roast/method and remain active research & craft practice', 'Whole beans go stale within 48 hours of roasting'],
      ans: 1
    },
    storage: {
      q: 'What is the best everyday way to keep opened whole coffee beans tasting fresh?',
      opts: ['In an open bowl in the humid fridge', 'Grind the whole bag immediately on day 1', 'Store whole beans in an opaque one-way-valve bag or airtight canister in a cool dark cupboard and grind fresh'],
      ans: 2
    },
    freeze: {
      q: 'In Cotter & Hopfer (2018), what happened to whole beans frozen for 9 weeks vs. kept at room temperature?',
      opts: ['Freezing ruined all aroma compounds', 'Frozen beans kept aroma closer to fresh (especially dark roasts); thawing sealed prevents condensation', 'Freezing added caffeine'],
      ans: 1
    },
    water: {
      q: 'What does excess bicarbonate alkalinity (>120 mg/L KH) in brew water do to bright filter coffee?',
      opts: ['Boosts crisp citrus acidity', 'Neutralizes coffee organic acids, leaving a flat, muted, chalky cup', 'Prevents grounds from absorbing water'],
      ans: 1
    },
    cold: {
      q: 'Why does cold-steeped coffee taste less bitter and less sour than hot coffee chilled over ice at matched strength?',
      opts: ['Ice melts only bitter molecules', 'High-activation-energy bitter/rubbery roast compounds extract readily at 92 °C but poorly at 4–22 °C', 'Cold water extracts twice as much citric acid'],
      ans: 1
    },
    /* Fallback ID aliases for resilience */
    'seed-cherry': null,
    terroir: null,
    roast: null,
    freshness: null,
    freezing: null,
    'ey-tds': null,
    temp: null,
    cooling: null
  };
  LESSON_QUIZ_BY_ID['seed-cherry'] = LESSON_QUIZ_BY_ID.seed;
  LESSON_QUIZ_BY_ID.terroir = LESSON_QUIZ_BY_ID.altitude;
  LESSON_QUIZ_BY_ID.roast = LESSON_QUIZ_BY_ID.roasting;
  LESSON_QUIZ_BY_ID.freshness = LESSON_QUIZ_BY_ID.fresh;
  LESSON_QUIZ_BY_ID.freezing = LESSON_QUIZ_BY_ID.freeze;
  LESSON_QUIZ_BY_ID['ey-tds'] = LESSON_QUIZ_BY_ID.extraction;
  LESSON_QUIZ_BY_ID.temp = LESSON_QUIZ_BY_ID.temperature;
  LESSON_QUIZ_BY_ID.cooling = LESSON_QUIZ_BY_ID.taste;

  function getQuizForLesson(idx, ls) {
    if (ls && ls.quiz && Array.isArray(ls.quiz.opts)) return ls.quiz;
    const key = ls ? String(ls.id || ls.key || '').trim().toLowerCase() : '';
    if (key && LESSON_QUIZ_BY_ID[key]) return LESSON_QUIZ_BY_ID[key];
    const fallbackKeys = ['seed', 'family', 'species', 'liberica', 'altitude', 'origin', 'roasting', 'taste', 'caffeine', 'decaf', 'grind', 'extraction', 'temperature', 'fresh', 'rest', 'storage', 'freeze', 'water', 'cold'];
    const fk = fallbackKeys[((idx || 0) % fallbackKeys.length + fallbackKeys.length) % fallbackKeys.length];
    return LESSON_QUIZ_BY_ID[fk] || LESSON_QUIZ_BY_ID.extraction;
  }

  const FALLBACK_FOLK_8 = [
    { id: 'temp-taste', claim: 'Boiling water burns light-roast coffee grounds.', tier: 'not', verdict: 'Myth Debunked: Roasted beans survived 200–220 °C in the roaster; slurry temperature in an open dripper stays 89–95 °C even with 100 °C kettle water.', app: 'BeanTelligence models actual open-CV slurry temperature and caps kettle setpoints safely below local elevation boiling.', cite: 'Batali, Ristenpart & Guinard (2020), Sci. Rep. 10:16450', doi: 'https://doi.org/10.1038/s41598-020-73341-4' },
    { id: 'zone-18-22', claim: '18 to 22% extraction is a strict universal law for everyone.', tier: 'not', verdict: 'Historical 1950s Lockhart convention — modern UC Davis consumer trials show drinkers split across multiple sweet spots.', app: 'BeanTelligence builds your personal 2D KDE Sweet-Spot Island from your own 4.0+ rated cups.', cite: 'Cotter et al. (2021), J. Food Sci. 86:194', doi: 'https://doi.org/10.1111/1750-3841.15561' },
    { id: 'rdt-static', claim: 'RDT water spritzing is merely cosmetic for static chaff.', tier: 'solid', verdict: 'Solid Science: 0.1 mL/20g quenches tribocharging, prevents fine-clump aggregates, and increases espresso consistency.', app: 'Covered in Module 5 & Espresso puck diagnostics.', cite: 'Mendez Harper & Hendon (2023), Matter 6:4408', doi: 'https://doi.org/10.1016/j.matt.2023.11.005' },
    { id: 'cortisol-90', claim: 'Everyone must delay morning coffee 90 minutes for cortisol.', tier: 'not', verdict: 'Unproven internet lore: No RCT demonstrates a 90-minute wait prevents afternoon fatigue; pushing caffeine later risks deep N3 sleep.', app: 'Models 24h Borbely Process C/S & Gardiner 2023 SWS bedtime cutoffs.', cite: 'Gardiner et al. (2023), Sleep Med. Rev. 69:101764', doi: 'https://doi.org/10.1016/j.smrv.2023.101764' },
    { id: 'serve-hot', claim: 'Black coffee tastes sweetest when served piping hot (>70 °C).', tier: 'not', verdict: 'Contradicted by 3,186 consumer tastings (Ristenpart et al. 2022: hedonic optimum ~55–62 °C) and TRPM5 thermal taste biophysics (35–50 °C sweet sensitivity; Talavera et al. 2005).', app: 'Golden Sip Clock tracks 70 \u2192 58 \u2192 42 °C sensory unlocking.', cite: 'Ristenpart, Cotter & Guinard (2022), Sci. Rep. 12:20621', doi: 'https://doi.org/10.1038/s41598-022-23904-4' },
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
    { term: 'TRPM5 Channel', cat: 'Tasting & Sensory', def: 'Thermosensitive taste-bud cation channel that boosts sweet perception across warm temperatures (~35–50 °C, below the 55–62 °C hedonic optimum).' },
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
    return [{ v: 'v7.6', title: 'Full Red-Team Security, Physics, UX, Accessibility & Memory Hardening', notes: '149+ cumulative releases.' }];
  }

  /* ==========================================================================
   * LOCAL UI STATE FOR TAB 5 & SHEETS
   * ========================================================================== */
  function makeDefaultScaBowl(idx, name, scaDefault) {
    const code = String.fromCharCode(65 + idx);
    const bowl = {
      code: code,
      coffee_id: '',
      name: name || '',
      roaster: '',
      origin: '',
      process: '',
      roast: '',
      varietal: '',
      farm: '',
      elevation_m: '',
      agtron: '',
      bag_notes: '',
      flavors: [],
      hVals: [6, 6, 6, 6, 6, 6, 6, 6],
      scoringMode: 'cva_traits', /* 'cva_traits' | 'quick_sca' */
      traitsCustomized: false,
      quickBaseSca: scaDefault || 84.25,
      nonUniformCups: 0,
      defectiveCups: 0,
      defects: 0,
      defect_notes: '',
      notes: '',
      touched: false,
      includeInSave: false,
      score: 84.25
    };
    if (typeof scaDefault === 'number' && Number.isFinite(scaDefault) && Math.abs(scaDefault - 84.25) > 0.05) {
      setBowlTargetScaBase(bowl, scaDefault);
    } else {
      bowl.score = computeCvaBowlScore(bowl);
    }
    return bowl;
  }

  function makeFreshScaBowls() {
    return [
      makeDefaultScaBowl(0),
      makeDefaultScaBowl(1),
      makeDefaultScaBowl(2),
      makeDefaultScaBowl(3),
      makeDefaultScaBowl(4)
    ];
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
      _baseSec: 0,
      _t0Ms: 0,
      rafId: 0,
      blindMode: false,
      revealed: true,
      spoken4m: false,
      spoken8m: false,
      spoken12m: false,
      _lastSavedSig: '',
      _isSaving: false,
      historyCoffeeFilter: '',
      historyTraitFilter: '',
      historyScaleFilter: 'cva_9', /* 'cva_9' | 'sca_10' */
      historyCompareOpen: true,
      historyCmpA: 0,
      historyCmpB: 1,
      bowls: makeFreshScaBowls()
    },

    /* 6-Cup Kitchen Taste Calibrator (Sour vs Bitter Confusion Check) */
    kitchen: {
      waterMl: 250,
      citricHydrate: 'anhydrous', /* 'anhydrous' | 'monohydrate' (1.094x) */
      roundIdx: 0,
      quizAnswered: ''
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
      _baseSec: 0,
      _t0Ms: 0,
      rafId: 0,
      spokenG2: false,
      spokenG3: false
    },

    /* Self-Blind Turntable Triangle Cupping */
    triangle: {
      oddDots: 2, /* Secret underside dot code (1 | 2 | 3) for Brew B */
      prepCodeVisible: false,
      pickedDots: 0,
      revealed: false,
      streak: 0
    },

    /* 32 Myth-Busters */
    folk: {
      deckIdx: 0,
      guessedTier: '',
      BrowseAll: false,
      query: ''
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

  function cancelScaRaf() {
    if (acadUi.sca.rafId) {
      try { cancelAnimationFrame(acadUi.sca.rafId); } catch (_) {}
      acadUi.sca.rafId = 0;
    }
  }

  function cancelSalamiRaf() {
    if (acadUi.salami.rafId) {
      try { cancelAnimationFrame(acadUi.salami.rafId); } catch (_) {}
      acadUi.salami.rafId = 0;
    }
  }

  function resetTriangleRound() {
    acadUi.triangle.oddDots = 1 + Math.floor(Math.random() * 3);
    acadUi.triangle.prepCodeVisible = false;
    acadUi.triangle.pickedDots = 0;
    acadUi.triangle.revealed = false;
  }
  resetTriangleRound();
  try {
    acadUi.triangle.streak = readAcademyState().palateGymHistory.triangleSessionStreak || 0;
  } catch (_) {}

  function resetAcademyInMemoryState() {
    cancelScaRaf();
    cancelSalamiRaf();
    acadUi.quizChoices = {};
    acadUi.openLessonsSet = new Set();
    acadUi.sca.bowlCount = 3;
    acadUi.sca.bowlMl = 150;
    acadUi.sca.running = false;
    acadUi.sca.elapsedSec = 0;
    acadUi.sca._baseSec = 0;
    acadUi.sca._t0Ms = 0;
    acadUi.sca.blindMode = false;
    acadUi.sca.revealed = true;
    acadUi.sca.spoken4m = false;
    acadUi.sca.spoken8m = false;
    acadUi.sca.spoken12m = false;
    acadUi.sca._lastSavedSig = '';
    acadUi.sca._isSaving = false;
    acadUi.sca.historyCoffeeFilter = '';
    acadUi.sca.historyTraitFilter = '';
    acadUi.sca.historyScaleFilter = 'cva_9';
    acadUi.sca.historyCmpA = 0;
    acadUi.sca.historyCmpB = 1;
    acadUi.sca.bowls = makeFreshScaBowls();
    acadUi.kitchen.waterMl = 250;
    acadUi.kitchen.citricHydrate = 'anhydrous';
    acadUi.kitchen.roundIdx = 0;
    acadUi.kitchen.quizAnswered = '';
    acadUi.gymCoach = {
      mood: 'curious',
      title: 'Welcome to the Palate Gym!',
      speech: 'Play a 60-second Kitchen Taste Round or Blind Triangle Cup below — sharpening Sour vs. Bitter unlocks effortless dial-ins!'
    };
    acadUi.salami.mode = 'pourover';
    acadUi.salami.running = false;
    acadUi.salami.elapsedSec = 0;
    acadUi.salami._baseSec = 0;
    acadUi.salami._t0Ms = 0;
    acadUi.salami.spokenG2 = false;
    acadUi.salami.spokenG3 = false;
    acadUi.triangle.streak = 0;
    resetTriangleRound();
    acadUi.folk.deckIdx = 0;
    acadUi.folk.guessedTier = '';
    acadUi.folk.query = '';
    acadUi.glossary.query = '';
    acadUi.glossary.letter = 'ALL';
    acadUi.glossary.cat = 'All';
    acadUi.glossary.limit = 40;
    if (typeof _saveCenterUi !== 'undefined' && _saveCenterUi) {
      _saveCenterUi.webUrlConfirmMsg = '';
      _saveCenterUi.lastGeneratedUrl = '';
      _saveCenterUi.feedbackMsg = '';
      _saveCenterUi.webUrlDraft = '';
    }
  }

  /* ==========================================================================
   * SEGMENT 1: 19 MINI-COURSES (Accordion Modules & Lessons + Quiz Checkpoints)
   * ========================================================================== */
  function extractAcademyRowBlendInfo(rowOrCoffee) {
    if (!rowOrCoffee || typeof rowOrCoffee !== 'object') return { isBlend: false, pillText: '', namesLine: '', hasDecaf: false };
    function parseObj(raw) {
      if (!raw) return null;
      if (typeof raw === 'object' && !Array.isArray(raw)) return raw;
      if (typeof raw !== 'string') return null;
      try {
        const p = JSON.parse(raw);
        return (p && typeof p === 'object' && !Array.isArray(p)) ? p : null;
      } catch (_) { return null; }
    }
    const ad = parseObj(rowOrCoffee.recipe_adaptation_json) || {};
    const ej = parseObj(rowOrCoffee.extra_json) || {};
    const adCe = parseObj(ad.coffee_extra) || {};
    const ejCe = parseObj(ej.coffee_extra) || {};
    const directCe = parseObj(rowOrCoffee.coffee_extra) || {};
    const comps = (Array.isArray(adCe.blendComponents) && adCe.blendComponents.length >= 2) ? adCe.blendComponents
      : (Array.isArray(ejCe.blendComponents) && ejCe.blendComponents.length >= 2) ? ejCe.blendComponents
      : (Array.isArray(ej.blendComponents) && ej.blendComponents.length >= 2) ? ej.blendComponents
      : (Array.isArray(directCe.blendComponents) && directCe.blendComponents.length >= 2) ? directCe.blendComponents
      : (Array.isArray(rowOrCoffee.blendComponents) && rowOrCoffee.blendComponents.length >= 2) ? rowOrCoffee.blendComponents
      : null;
    const isBlend = !!(adCe.isBlend || ejCe.isBlend || ej.isBlend || directCe.isBlend || ad.isBlend || rowOrCoffee.isBlend || (comps && comps.length >= 2));
    if (!isBlend || !comps) return { isBlend: false, pillText: '', namesLine: '', hasDecaf: false };
    const cA = comps[0] || {};
    const cB = comps[1] || {};
    const nameA = String(cA.name || cA.coffee_name || 'Coffee A').trim() || 'Coffee A';
    const nameB = String(cB.name || cB.coffee_name || 'Coffee B').trim() || 'Coffee B';
    const wA = parseFloat(cA.weightG);
    const wB = parseFloat(cB.weightG);
    let pA = parseFloat(cA.ratioPct);
    let pB = parseFloat(cB.ratioPct);
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
    const wPart = (Number.isFinite(wA) && wA > 0 && Number.isFinite(wB) && wB > 0) ? (fmtG(wA) + ' + ' + fmtG(wB) + ' \u00B7 ') : '';
    const hasDecaf = !!(cA.decaf === 'yes' || cA.decaf === true || cB.decaf === 'yes' || cB.decaf === true);
    return {
      isBlend: true,
      pillText: '2-Coffee Blend (' + wPart + pA + '%/' + pB + '%)',
      namesLine: nameA + ' (' + pA + '%) + ' + nameB + ' (' + pB + '%)',
      hasDecaf: hasDecaf
    };
  }

  function renderExplainCurrentCoffeeCard() {
    const c = (getApp() && getApp().coffee) || {};
    const bInfo = extractAcademyRowBlendInfo(c);
    const name = String(c.name || '').trim() || (bInfo.isBlend ? bInfo.namesLine : 'Active Bag (Specialty Reference)');
    const origin = String(c.origin || '').trim() || (bInfo.isBlend ? '2-Coffee Blend' : 'Ethiopia');
    const proc = String(c.process || '').trim() || 'Washed';
    const roast = String(c.roast || '').trim() || 'Light';
    const isDecaf = c.decaf === 'yes' || c.decaf === true || /decaf/i.test(String(c.decaf || '')) || bInfo.hasDecaf;

    const roastLow = roast.toLowerCase();
    const acExp = /ultra[- ]?light/.test(roastLow) ? 90
      : (/medium[- ]?light/.test(roastLow) ? 74
        : (/light/.test(roastLow) ? 84
          : (/medium[- ]?dark/.test(roastLow) ? 48
            : (/dark/.test(roastLow) ? 38 : 62))));
    const swExp = /honey|natural|anaerobic/i.test(proc) ? 88 : 78;
    const bdExp = /natural|wet|dark/i.test(proc + ' ' + roast) ? 82 : (/medium[- ]?dark/i.test(roast) ? 72 : 54);
    const subText = bInfo.isBlend
      ? (bInfo.pillText + ' · ' + bInfo.namesLine)
      : (name + ' · ' + origin + ' · ' + proc + ' · ' + roast);

    return domH('section', { class: 'bt-studio-card bt-coffee-xray-card' },
      domH('div', { class: 'bt-lab-card-head' },
        domH('div', { class: 'bt-lab-title-group' },
          ic('xray-loupe', { size: 22 }),
          domH('div', null,
            domH('h3', { text: 'Explain My Current Coffee — Live Bean X-Ray' }),
            domH('p', { class: 'bt-lab-sub', text: subText })
          )
        ),
        epistemicPill('craft_best_practice')
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
          ? 'Decaf Physics Active: Porous cellular walls generate more micro-fines — start +5% coarser on pour-over or -5.5% finer on 9-bar espresso.'
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
          const lessonTier = deriveLessonTier(ls);
          const fields = extractLessonFields(ls);
          const quiz = getQuizForLesson(idx, ls);
          const pickedOpt = acadUi.quizChoices[lid];
          const isWrongPicked = pickedOpt != null && pickedOpt !== quiz.ans;
          const isRightPicked = pickedOpt != null && pickedOpt === quiz.ans;
          const lessonTitle = (ls.order ? (ls.order + '. ') : '') + (ls.title || ls.name || lid);

          const detEl = domH('details', {
            class: 'bt-lab-details bt-lesson-accordion' + (passed ? ' is-completed' : ''),
            open: acadUi.openLessonsSet.has(lid)
          },
            domH('summary', { class: 'bt-lesson-summary' },
              domH('span', { class: 'bt-lesson-title', text: lessonTitle }),
              domH('span', { class: 'bt-lesson-meta' },
                epistemicPill(lessonTier),
                passed ? domH('span', { class: 'bt-lesson-done-pill', text: 'Mastered' }) : null
              )
            ),
            domH('div', { class: 'bt-lesson-body' },
              fields.hook ? domH('p', { class: 'bt-lab-sub', style: 'margin:0 0 6px;font-weight:700', text: fields.hook }) : null,
              fields.paras.length
                ? fields.paras.slice(0, 4).map(function (pTxt) {
                  return domH('p', { class: 'bt-module-body', text: String(pTxt) });
                })
                : domH('p', { class: 'bt-module-body', text: 'Coffee science curriculum note.' }),
              fields.nums ? domH('div', { class: 'bt-lab-subcard', style: 'margin:6px 0;padding:8px 10px' },
                domH('strong', { style: 'font-size:0.8rem;display:block;margin-bottom:3px', text: 'Numbers & Evidence' }),
                domH('p', { class: 'bt-module-body num-tab', style: 'margin:0', text: fields.nums })
              ) : null,
              fields.limits ? domH('p', { class: 'bt-lab-hint', style: 'margin:4px 0 6px', text: 'Study Limits: ' + fields.limits }) : null,
              fields.tips.length ? domH('ul', { class: 'bt-lab-list' },
                fields.tips.slice(0, 3).map(function (t) { return domH('li', { text: String(t) }); })
              ) : null,
              fields.sources.length ? domH('div', { style: 'margin:6px 0' },
                domH('strong', { style: 'font-size:0.78rem;display:block;margin-bottom:3px', text: 'Citations & Sources' }),
                domH('ul', { class: 'bt-doi-list' },
                  fields.sources.map(function (src) {
                    return domH('li', null,
                      domH('span', { text: src.cite + ' ' }),
                      src.link ? domH('a', { href: src.link, target: '_blank', rel: 'noopener noreferrer', class: 'bt-doi-link', text: '[Source \u2197]' }) : null
                    );
                  })
                )
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
    { key: 'fragrance', name: 'Fragrance', hint: 'Smell of freshly ground dry coffee before pouring hot water' },
    { key: 'aroma', name: 'Aroma', hint: 'Wet smell rising from the bowl on pour & when breaking the 4:00 crust' },
    { key: 'flavor', name: 'Flavor', hint: 'Combined taste + aroma notes in your mouth when you slurp' },
    { key: 'aftertaste', name: 'Aftertaste', hint: 'How sweet, clean, or lingering the finish stays after swallowing' },
    { key: 'acidity', name: 'Acidity', hint: 'Bright, juicy fruit liveliness (like crisp apple or peach — NOT stomach acid!)' },
    { key: 'sweetness', altKey: 'q_sweetness', name: 'Sweetness', hint: 'Smooth ripe-fruit, honey, or caramel roundness on your tongue' },
    { key: 'body', name: 'Body (Mouthfeel)', hint: 'Weight & texture in your mouth (delicate tea-light vs. creamy/syrupy)' },
    { key: 'overall', name: 'Overall', hint: 'Your complete personal enjoyment & harmony of the cup' }
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
    cancelScaRaf();
    function getDosePerBowlG() {
      return +((8.25 * sca.bowlMl) / 150).toFixed(2);
    }

    const card = domH('section', {
      class: 'bt-studio-card bt-sca-cockpit-card',
      id: 'bt-sca-5bowl-table',
      style: 'min-width:0;max-width:100%;box-sizing:border-box'
    });
    const phaseBanner = domH('p', { class: 'bt-lab-hint', text: '' });
    const liveClockPill = domH('span', { class: 'bt-sca-mmss-pill num-tab', id: 'bt-sca-live-mmss', text: fmtMmSs(sca.elapsedSec || 0) + ' · ~93 °C' });
    const headerSubEl = domH('p', {
      class: 'bt-lab-sub num-tab',
      style: 'overflow-wrap:anywhere',
      text: 'Dose: ' + getDosePerBowlG() + ' g per ' + sca.bowlMl + ' mL bowl (93 °C) · Voice cues at 04:00 Break, 08:00 Skim & 12:00 Slurp'
    });

    const step1DescEl = domH('p', {
      text: 'Weigh ' + getDosePerBowlG() + 'g medium-coarse coffee per ' + sca.bowlMl + ' mL bowl, smell dry grounds, then pour 93 °C water to rim.'
    });
    const stepCardsData = [
      { idx: 0, time: '0:00', title: '1. Smell Dry & Pour', descEl: step1DescEl },
      { idx: 1, time: '4:00', title: '2. Break Crust & Smell', desc: 'Put nose close to bowl and gently push top grounds 3× with spoon to release trapped aroma.' },
      { idx: 2, time: '8:00', title: '3. Skim Foam', desc: 'Use 2 spoons to skim off floating grounds and foam so the cup cools cleanly.' },
      { idx: 3, time: '12:00+', title: '4. Slurp Warm & Score', desc: 'Slurp briskly from spoon as bowls cool (62 °C \u2192 42 °C) and rate Overall Enjoyment (1–9) below!' }
    ];
    const stepCardNodes = stepCardsData.map(function (st) {
      return domH('div', { class: 'bt-cupping-step-card' },
        domH('span', { class: 'bt-cupping-step-time num-tab', text: st.time }),
        domH('strong', { text: st.title }),
        st.descEl || domH('p', { text: st.desc })
      );
    });

    function getScaPhaseLabel(s) {
      if (s === 0) return 'Step 1: Smell Dry Grounds';
      if (s < 240) return 'Steeping Untouched \u2192 04:00';
      if (s < 480) return '04:00 Break Crust & Smell';
      if (s < 720) return '08:00 Skim & Cool to 70 °C';
      return '12:00 Golden Slurp (55–62 °C)';
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
      const doseG = getDosePerBowlG();
      const s = Math.floor(secFloat);
      const estTempC = +(22 + 71 * Math.exp(-secFloat / 720)).toFixed(1);
      liveClockPill.textContent = fmtMmSs(secFloat) + ' · Est. ~' + estTempC + ' °C';
      scaChrono.update(secFloat, getScaPhaseLabel(secFloat), 'Est. Bowl ~' + estTempC + ' °C');
      const activeStepIdx = s < 240 ? 0 : (s < 480 ? 1 : (s < 720 ? 2 : 3));
      stepCardNodes.forEach(function (nd, idx) {
        nd.classList.toggle('is-active-phase', idx === activeStepIdx);
      });
      if (s === 0) phaseBanner.textContent = 'Step 1: Weigh ' + doseG + ' g per ' + sca.bowlMl + ' mL bowl (1:18.18). Smell dry fragrance, then pour 93 °C water to the rim & press Start.';
      else if (s < 240) phaseBanner.textContent = 'Steeping untouched (' + fmtMmSs(240 - s) + ' left until 04:00 Break Crust voice cue).';
      else if (s < 480) phaseBanner.textContent = '04:00 BREAK CRUST: Push top crust gently 3× nose-close to smell wet aroma, then get ready to skim!';
      else if (s < 720) phaseBanner.textContent = '08:00–10:00 SKIM & COOL TO ~70 °C: Skim floating foam and take your first warm slurp from a spoon across all bowls.';
      else phaseBanner.textContent = '12:00+ GOLDEN SLURP (~62 °C \u2192 42 °C): Hedonic peak (55–62 °C) into TRPM5 clarity (50–35 °C)! Score Overall Enjoyment (1–9) & cup consistency below.';
    }

    function syncBowlSizeReadouts() {
      const doseG = getDosePerBowlG();
      headerSubEl.textContent = 'Dose: ' + doseG + ' g per ' + sca.bowlMl + ' mL bowl (93 °C) · Voice cues at 04:00 Break, 08:00 Skim & 12:00 Slurp';
      step1DescEl.textContent = 'Weigh ' + doseG + 'g medium-coarse coffee per ' + sca.bowlMl + ' mL bowl, smell dry grounds, then pour 93 °C water to rim.';
      syncScaChrono(sca.elapsedSec || 0);
    }

    const SCA_MAX_SEC = 1800; /* 30-minute auto-stop safety cap */
    const initStartLbl = sca.running
      ? 'Pause Cupping Timer'
      : ((sca.elapsedSec || 0) > 0 && (sca.elapsedSec || 0) < SCA_MAX_SEC ? 'Resume Cupping Timer' : 'Start Voice Cupping Timer');
    const startBtnLbl = domH('span', { text: initStartLbl });

    function tickScaRaf() {
      if (!sca.running) {
        cancelScaRaf();
        return;
      }
      if (!card.isConnected) {
        cancelScaRaf();
        sca.running = false;
        sca._baseSec = sca.elapsedSec || 0;
        return;
      }
      const nowElapsed = (sca._baseSec || 0) + (performance.now() - (sca._t0Ms || performance.now())) / 1000;
      if (nowElapsed >= SCA_MAX_SEC) {
        sca.elapsedSec = SCA_MAX_SEC;
        sca._baseSec = SCA_MAX_SEC;
        sca.running = false;
        cancelScaRaf();
        startBtnLbl.textContent = 'Start Voice Cupping Timer';
        syncScaChrono(SCA_MAX_SEC);
        notify('Cupping timer auto-stopped at 30:00.');
        return;
      }
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
          const bInfo = extractAcademyRowBlendInfo(rawC);
          const safeStr = function (v) { return (v == null || String(v) === 'undefined' || String(v) === 'NaN') ? '' : String(v).trim(); };
          const bNotes = safeStr(rawC.bag_notes || rawC.notes || (Array.isArray(rawC.flavors) ? rawC.flavors.join(', ') : ''));
          const fresh = makeDefaultScaBowl(i);
          fresh.coffee_id = safeStr(rawC.coffee_id || rawC.id || b.coffee_id || b.id);
          fresh.name = safeStr(rawC.name || rawC.coffee || b.name || b.coffee) || (bInfo.isBlend ? bInfo.namesLine : ('Sample #' + (i + 1)));
          fresh.roaster = safeStr(rawC.roaster || b.roaster);
          fresh.origin = safeStr(rawC.origin || b.origin) || (bInfo.isBlend ? '2-Coffee Blend' : '');
          fresh.process = safeStr(rawC.process || b.process);
          fresh.roast = safeStr(rawC.roast || rawC.rlevel || b.roast || b.rlevel);
          fresh.varietal = safeStr(rawC.varietal || b.varietal);
          fresh.farm = safeStr(rawC.farm || rawC.farm_or_station || b.farm);
          fresh.elevation_m = safeStr(rawC.elevation_m || b.elevation_m);
          fresh.agtron = safeStr(rawC.agtron || b.agtron);
          /* Keep roaster bag_notes separate from live blind tasting notes so blind mode never leaks bag identity */
          fresh.bag_notes = bNotes;
          fresh.notes = '';
          fresh.flavors = Array.isArray(rawC.flavors) ? rawC.flavors.filter(Boolean) : (bNotes ? bNotes.split(/[,;/]+/).map(function (s) { return s.trim(); }).filter(Boolean) : []);
          fresh.touched = true;
          fresh.includeInSave = true;
          fresh.score = computeCvaBowlScore(fresh);
          sca.bowls[i] = fresh;
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
        sca.blindMode = !sca.revealed;
        CK.haptic(sca.revealed ? 'celebrate' : 'tick');
        if (isSheet && o.hostEl) renderScaCuppingSheet(o.hostEl);
        else rerenderAcademyTab();
      }
    }, sca.revealed ? 'Blind Mode: Hide Coffees' : 'Reveal Blind Coffees');

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
    const saveAllBtnLbl = domH('span', { text: '' });

    function getSelectedBowlsForSave() {
      const out = [];
      for (let i = 0; i < sca.bowlCount; i++) {
        const b = sca.bowls[i];
        if (b && b.includeInSave) out.push(b);
      }
      return out;
    }

    function syncSaveAllBtnLabel() {
      const sel = getSelectedBowlsForSave();
      if (!sel.length) {
        saveAllBtnLbl.textContent = 'Score or Check Bowls to Save to Journal';
      } else if (sel.length === 1) {
        saveAllBtnLbl.textContent = 'Save 1 Selected Cupping Bowl to Journal \u2192';
      } else {
        saveAllBtnLbl.textContent = 'Save ' + sel.length + ' Selected Cupping Bowls to Journal \u2192';
      }
    }

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
              domH('strong', { style: 'font-size:0.9rem;display:block', text: 'Coffees Revealed \u00B7 Top Cup: Bowl ' + topBowl.code + ' (' + (topBowl.name || ('Sample ' + topBowl.code)) + ')' }),
              domH('span', { class: 'bt-lab-hint', text: topBowl.score.toFixed(1) + ' / 100 SCA \u00B7 ' + computeBowlStars(topBowl.score).toFixed(2) + ' / 5 Stars \u00B7 ' + bowlQualityTier(topBowl.score).text })
            )
          ),
          domH('span', { class: 'bt-tc-badge is-good num-tab', text: topBowl.score.toFixed(1) + ' SCA Leader' })
        ));
      } else {
        scaHeroHost.appendChild(domH('div', { class: 'bt-tc-well', style: 'padding:9px 12px;flex-direction:row;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px' },
          domH('span', { style: 'font-size:0.84rem;font-weight:700', text: 'Blind Mode Active \u2014 Coffee names & pre-loaded bag notes are hidden until reveal!' }),
          domH('button', {
            type: 'button',
            class: 'bt-tc-pill is-compact is-copper',
            text: 'Reveal Coffees \u2192',
            onclick: function () {
              sca.revealed = true;
              sca.blindMode = false;
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
              domH('strong', { style: 'font-size:0.8rem', text: 'Bowl ' + b.code + (b.includeInSave ? ' \u2713' : '') }),
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
      syncSaveAllBtnLabel();
    }

    const bowlsGrid = domH('div', { class: 'bt-sca-bowls-grid' });
    const SCA_PRESETS = [7.5, 8.0, 8.25, 8.5, 8.75, 9.0];

    for (let i = 0; i < sca.bowlCount; i++) {
      (function (bObj) {
        const clampedDef = clampBowlCupDefects(bObj.nonUniformCups, bObj.defectiveCups);
        bObj.nonUniformCups = clampedDef.nonUniformCups;
        bObj.defectiveCups = clampedDef.defectiveCups;
        bObj.score = computeCvaBowlScore(bObj);

        const scoreBadge = domH('strong', { class: 'bt-sca-score-live num-tab', text: bObj.score.toFixed(2) + ' / 100 SCA \u00B7 ' + computeBowlStars(bObj.score).toFixed(2) + ' / 5' });
        const tierBadge = domH('span', { class: 'bt-tc-badge ' + bowlQualityTier(bObj.score).tone, text: bowlQualityTier(bObj.score).text });

        const includeChk = domH('input', {
          type: 'checkbox',
          checked: !!bObj.includeInSave,
          'aria-label': 'Include Bowl ' + bObj.code + ' when saving to Journal',
          onchange: function () {
            bObj.includeInSave = !!includeChk.checked;
            if (bObj.includeInSave) bObj.touched = true;
            paintScaHeroOnly();
          }
        });
        const includeWrap = domH('label', {
          class: 'bt-sca-include-toggle',
          style: 'display:inline-flex;align-items:center;gap:5px;font-size:0.76rem;font-weight:700;cursor:pointer'
        }, includeChk, domH('span', { text: 'Save' }));

        function markTouched() {
          bObj.touched = true;
          bObj.includeInSave = true;
          includeChk.checked = true;
          sca._lastSavedSig = '';
        }

        /* In Blind Mode, render a static non-input label (NEVER type="password") and hide pre-loaded bag_notes */
        const nameFieldEl = sca.revealed
          ? domH('input', {
            type: 'text',
            class: 'bt-lab-text-in',
            value: bObj.name || '',
            placeholder: 'Sample ' + bObj.code + ' coffee name (optional)...',
            'aria-label': 'Bowl ' + bObj.code + ' coffee name',
            oninput: function (ev) {
              bObj.name = ev.target.value;
              if (bObj.name.trim()) markTouched();
              paintScaHeroOnly();
            }
          })
          : domH('div', {
            class: 'bt-lab-text-in bt-sca-blind-label',
            role: 'note',
            'aria-label': 'Blind Bowl ' + bObj.code + ' hidden coffee identity',
            style: 'display:flex;align-items:center;justify-content:space-between;font-weight:700;opacity:0.88'
          },
            domH('span', { text: 'Blind Bowl ' + bObj.code }),
            domH('span', { style: 'font-size:0.74rem;opacity:0.75', text: 'Hidden until reveal' })
          );

        const bagNotesHintEl = (bObj.bag_notes && String(bObj.bag_notes).trim())
          ? domH('p', {
            class: 'bt-lab-hint',
            style: 'margin:0;font-size:0.76rem',
            text: sca.revealed ? ('Bag notes: ' + bObj.bag_notes) : 'Pre-loaded bag notes hidden until reveal.'
          })
          : null;

        const notesInput = domH('input', {
          type: 'text',
          class: 'bt-lab-text-in',
          value: bObj.notes || '',
          placeholder: sca.revealed
            ? ('Bowl ' + bObj.code + ' tasting notes (e.g. jasmine, peach, juicy)...')
            : ('Blind Bowl ' + bObj.code + ' live tasting notes...'),
          'aria-label': 'Bowl ' + bObj.code + ' tasting notes',
          oninput: function () {
            bObj.notes = notesInput.value;
            if (bObj.notes.trim()) markTouched();
            paintScaHeroOnly();
          }
        });

        const presetBtns = [];
        const traitPillRefs = [];
        const modeNoticeEl = domH('div', {
          style: 'display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap;font-size:0.75rem'
        });

        const minusBtn = domH('button', {
          type: 'button',
          class: 'bt-tc-finetune-btn',
          'aria-label': 'Bowl ' + bObj.code + ' minus 0.25',
          text: '-0.25',
          onclick: function () {
            if (bObj.traitsCustomized) {
              notify('8-Trait CVA mode is active — adjust 1–9 traits below or switch to Quick Score.');
              return;
            }
            const curBase = bObj.score + 2 * (bObj.nonUniformCups || 0) + 4 * (bObj.defectiveCups || 0);
            setBowlTargetScaBase(bObj, clamp(curBase - 0.25, 58, 100, 84.75));
            markTouched();
            CK.haptic('tick');
            syncBowlCardVisuals();
          }
        });

        const plusBtn = domH('button', {
          type: 'button',
          class: 'bt-tc-finetune-btn',
          'aria-label': 'Bowl ' + bObj.code + ' plus 0.25',
          text: '+0.25',
          onclick: function () {
            if (bObj.traitsCustomized) {
              notify('8-Trait CVA mode is active — adjust 1–9 traits below or switch to Quick Score.');
              return;
            }
            const curBase = bObj.score + 2 * (bObj.nonUniformCups || 0) + 4 * (bObj.defectiveCups || 0);
            setBowlTargetScaBase(bObj, clamp(curBase + 0.25, 58, 100, 85.25));
            markTouched();
            CK.haptic('tick');
            syncBowlCardVisuals();
          }
        });

        const taintBtn = domH('button', {
          type: 'button',
          class: 'bt-tc-pill is-compact' + (bObj.nonUniformCups > 0 ? ' is-copper' : ' is-soft'),
          title: 'CVA 104-2024 Non-Uniform Cup (-2 pts each; non-uniform + defective <= 5 cups)',
          'aria-pressed': String(bObj.nonUniformCups > 0),
          text: 'Non-Uniform (-2): ' + bObj.nonUniformCups + '/5',
          onclick: function () {
            const maxU = Math.max(0, 5 - (bObj.defectiveCups || 0));
            bObj.nonUniformCups = maxU > 0 ? ((bObj.nonUniformCups + 1) % (maxU + 1)) : 0;
            markTouched();
            CK.haptic('tick');
            syncBowlCardVisuals();
          }
        });

        const faultBtn = domH('button', {
          type: 'button',
          class: 'bt-tc-pill is-compact' + (bObj.defectiveCups > 0 ? ' is-copper' : ' is-soft'),
          title: 'CVA 104-2024 Defective Cup (-4 pts each; non-uniform + defective <= 5 cups)',
          'aria-pressed': String(bObj.defectiveCups > 0),
          text: 'Defective (-4): ' + bObj.defectiveCups + '/5',
          onclick: function () {
            const maxD = Math.max(0, 5 - (bObj.nonUniformCups || 0));
            bObj.defectiveCups = maxD > 0 ? ((bObj.defectiveCups + 1) % (maxD + 1)) : 0;
            markTouched();
            CK.haptic('tick');
            syncBowlCardVisuals();
          }
        });

        const defectResetBtn = domH('button', {
          type: 'button',
          class: 'bt-tc-pill is-compact is-soft',
          text: 'Clean (0/5)',
          onclick: function () {
            bObj.nonUniformCups = 0;
            bObj.defectiveCups = 0;
            CK.haptic('tick');
            syncBowlCardVisuals();
          }
        });

        function syncBowlCardVisuals() {
          const defC = clampBowlCupDefects(bObj.nonUniformCups, bObj.defectiveCups);
          bObj.nonUniformCups = defC.nonUniformCups;
          bObj.defectiveCups = defC.defectiveCups;
          bObj.score = computeCvaBowlScore(bObj);
          const stars = computeBowlStars(bObj.score);
          const tier = bowlQualityTier(bObj.score);
          scoreBadge.textContent = bObj.score.toFixed(2) + ' / 100 SCA \u00B7 ' + stars.toFixed(2) + ' / 5';
          tierBadge.className = 'bt-tc-badge ' + tier.tone;
          tierBadge.textContent = tier.text;

          const baseBeforeDef = bObj.score + 2 * bObj.nonUniformCups + 4 * bObj.defectiveCups;
          const lockedByTraits = !!bObj.traitsCustomized;
          presetBtns.forEach(function (pb) {
            const on = !lockedByTraits && bObj.scoringMode === 'quick_sca' && Math.abs(baseBeforeDef - pb.val * 10) < 0.13;
            pb.btn.className = 'bt-tc-pill is-compact num-tab' + (on ? ' is-active' : ' is-soft');
            pb.btn.setAttribute('aria-pressed', String(on));
            pb.btn.disabled = lockedByTraits;
          });
          minusBtn.disabled = lockedByTraits;
          plusBtn.disabled = lockedByTraits;

          taintBtn.className = 'bt-tc-pill is-compact' + (bObj.nonUniformCups > 0 ? ' is-copper' : ' is-soft');
          taintBtn.setAttribute('aria-pressed', String(bObj.nonUniformCups > 0));
          taintBtn.textContent = 'Non-Uniform (-2): ' + bObj.nonUniformCups + '/5';
          faultBtn.className = 'bt-tc-pill is-compact' + (bObj.defectiveCups > 0 ? ' is-copper' : ' is-soft');
          faultBtn.setAttribute('aria-pressed', String(bObj.defectiveCups > 0));
          faultBtn.textContent = 'Defective (-4): ' + bObj.defectiveCups + '/5';

          modeNoticeEl.textContent = '';
          if (lockedByTraits) {
            modeNoticeEl.appendChild(domH('span', {
              class: 'bt-lab-hint',
              style: 'margin:0',
              text: '8-Trait CVA 1–9 active (\u00B10.25 locked so your integer traits stay intact).'
            }));
            modeNoticeEl.appendChild(domH('button', {
              type: 'button',
              class: 'bt-lab-chip',
              style: 'font-size:0.72rem;padding:2px 8px;min-height:28px',
              onclick: function () {
                bObj.traitsCustomized = false;
                setBowlTargetScaBase(bObj, clamp(baseBeforeDef, 58, 100, 85));
                markTouched();
                CK.haptic('tick');
                syncBowlCardVisuals();
              }
            }, 'Use Quick Score'));
          } else if (bObj.scoringMode === 'quick_sca') {
            modeNoticeEl.appendChild(domH('span', {
              class: 'bt-lab-hint',
              style: 'margin:0',
              text: 'Quick SCA mode active (tapping any 1–9 trait below switches cleanly to CVA 104-2024).'
            }));
          }

          traitPillRefs.forEach(function (tr) {
            const curH = Math.round(clamp(bObj.hVals[tr.aIdx], 1, 9, 6));
            tr.valSpan.textContent = curH + ' / 9';
            tr.btns.forEach(function (tb, bIdx) {
              const on = bObj.scoringMode === 'cva_traits' && (bIdx + 1) === curH;
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
                if (bObj.traitsCustomized) {
                  notify('8-Trait CVA mode is active — click "Use Quick Score" to switch.');
                  return;
                }
                setBowlTargetScaBase(bObj, pv * 10);
                markTouched();
                CK.haptic('tick');
                syncBowlCardVisuals();
              }
            });
            presetBtns.push({ val: pv, btn: bBtn });
            return bBtn;
          })
        );

        const stepperRow = domH('div', { class: 'bt-sca-stepper-row' },
          domH('div', { style: 'display:flex;align-items:center;gap:6px' }, minusBtn, plusBtn),
          tierBadge
        );

        const attrDetails = domH('details', { class: 'bt-lab-details' },
          domH('summary', { text: 'Score All 8 CVA Traits (Integer 1\u20139)' }),
          domH('p', {
            class: 'bt-lab-hint',
            text: 'Tap integer 1 to 9 for each CVA 104-2024 trait (5 Okay \u00B7 6 Very Good \u00B7 7 Great \u00B7 8 Excellent \u00B7 9 Extraordinary).'
          }),
          domH('div', { class: 'bt-cva-attr-grid' },
            CUPPING_TRAIT_GUIDES.map(function (tg, aIdx) {
              const initH = Math.round(clamp(bObj.hVals[aIdx], 1, 9, 6));
              const valSpan = domH('span', { class: 'num-tab bt-cva-val-pill', text: initH + ' / 9' });
              const tBtns = [];
              const pillGroup = domH('div', { class: 'bt-sca-trait-pills', role: 'radiogroup', 'aria-label': 'Bowl ' + bObj.code + ' ' + tg.name },
                [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (v9) {
                  const tb = domH('button', {
                    type: 'button',
                    class: 'bt-tc-pill is-compact num-tab' + (bObj.scoringMode === 'cva_traits' && initH === v9 ? ' is-active' : ' is-soft'),
                    style: 'min-width:34px;min-height:36px;padding:3px 7px',
                    'aria-pressed': String(bObj.scoringMode === 'cva_traits' && initH === v9),
                    text: String(v9),
                    onclick: function () {
                      bObj.hVals[aIdx] = v9;
                      bObj.scoringMode = 'cva_traits';
                      bObj.traitsCustomized = true;
                      markTouched();
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
            scoreBadge,
            includeWrap
          ),
          nameFieldEl,
          bagNotesHintEl,
          notesInput,
          domH('div', { class: 'bt-sca-quick-wrap', style: 'display:flex;flex-direction:column;gap:8px' },
            domH('span', { class: 'bt-lab-inline-lbl', text: 'Quick SCA Score (75\u201390) & \u00B10.25 Stepper:' }),
            presetRow,
            stepperRow,
            modeNoticeEl,
            domH('div', { class: 'bt-sca-defect-row' }, taintBtn, faultBtn, defectResetBtn)
          ),
          attrDetails
        ));
      })(sca.bowls[i]);
    }
    paintScaHeroOnly();

    const startBtn = domH('button', {
      type: 'button',
      class: 'bt-lab-btn is-primary',
      onclick: function () {
        unlockAudioSafe();
        if (sca.running) {
          sca.running = false;
          cancelScaRaf();
          sca._baseSec = sca.elapsedSec;
          startBtnLbl.textContent = 'Resume Cupping Timer';
        } else {
          if ((sca.elapsedSec || 0) >= SCA_MAX_SEC) {
            sca.elapsedSec = 0;
            sca._baseSec = 0;
            sca.spoken4m = false;
            sca.spoken8m = false;
            sca.spoken12m = false;
          }
          cancelScaRaf();
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

    /* 1-Tap Save Selected Cupped Samples to History (never writes untouched/unselected bowls!) */
    const saveAllBtn = domH('button', {
      type: 'button',
      class: 'bt-lab-btn is-primary bt-chart-cta-btn',
      onclick: function () {
        if (sca._isSaving) return;
        const selectedBowls = getSelectedBowlsForSave();
        if (!selectedBowls.length) {
          CK.haptic('snap');
          notify('Edit a bowl or check "Save" on at least 1 bowl first so empty bowls never pollute your Journal.');
          return;
        }
        const dosePerBowlG = getDosePerBowlG();
        const flightSigParts = [sca.bowlCount, sca.bowlMl];
        for (let si = 0; si < selectedBowls.length; si++) {
          const sb = selectedBowls[si] || {};
          const shArr = sb.scoringMode === 'cva_traits' && Array.isArray(sb.hVals)
            ? sb.hVals.map(function (x) { return String(Math.round(clamp(x, 1, 9, 6))); }).join(',')
            : ('Q:' + (+sb.quickBaseSca || sb.score || 85).toFixed(2));
          flightSigParts.push([sb.code, sb.name, sb.notes, sb.scoringMode, shArr, sb.nonUniformCups || 0, sb.defectiveCups || 0].join('~'));
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
          const fmtIntTrait = function (v) {
            return String(Math.round(clamp(v, 1, 9, 6)));
          };
          let savedN = 0;

          for (let i = 0; i < selectedBowls.length; i++) {
            const b = selectedBowls[i];
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
            const coffeeName = String(b.name || '').trim() || ('Cupping Bowl ' + b.code);
            const ratioVal = Math.round((sca.bowlMl / Math.max(1, dosePerBowlG)) * 10) / 10;
            const cupSummary = 'Multi-Bowl Cupping (' + sc.toFixed(2) + ' / 100)' + (cupNotes ? (' · ' + cupNotes) : '');
            const isCvaTraits = b.scoringMode !== 'quick_sca';
            const hArr = (Array.isArray(b.hVals) && b.hVals.length === 8)
              ? b.hVals.map(function (v) { return Math.round(clamp(v, 1, 9, 6)); })
              : [6, 6, 6, 6, 6, 6, 6, 6];
            const clampedDef = clampBowlCupDefects(b.nonUniformCups, b.defectiveCups);
            const nonUnif = clampedDef.nonUniformCups;
            const defec = clampedDef.defectiveCups;
            const defDeduct = 2 * nonUnif + 4 * defec;
            const rowObj = (typeof emptyRowObj === 'function') ? emptyRowObj() : {};
            if (typeof COLUMNS !== 'undefined' && Array.isArray(COLUMNS)) {
              COLUMNS.forEach(function (ck) { if (rowObj[ck] === undefined) rowObj[ck] = ''; });
            }
            const traitFields = isCvaTraits
              ? {
                fragrance: fmtIntTrait(hArr[0]),
                aroma: fmtIntTrait(hArr[1]),
                fragrance_aroma: String(+((hArr[0] + hArr[1]) / 2).toFixed(1)),
                flavor: fmtIntTrait(hArr[2]),
                aftertaste: fmtIntTrait(hArr[3]),
                acidity: fmtIntTrait(hArr[4]),
                sweetness: fmtIntTrait(hArr[5]),
                q_sweetness: fmtIntTrait(hArr[5]),
                body: fmtIntTrait(hArr[6]),
                overall: fmtIntTrait(hArr[7]),
                acidity_intensity: String(normalizeCvaTraitToIntensity5(hArr[4])),
                sweetness_intensity: String(normalizeCvaTraitToIntensity5(hArr[5])),
                body_intensity: String(normalizeCvaTraitToIntensity5(hArr[6])),
                score_kind: 'cva_affective'
              }
              : {
                score_kind: 'quick_sca'
              };
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
              taint_cups: String(nonUnif),
              fault_cups: String(defec),
              defect_deduction: String(defDeduct),
              total_score: sc.toFixed(2),
              my_rating_stars: String(stars),
              flavors_liked: flavorsStr,
              general_notes: cupSummary
            }, traitFields);
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
              speech: 'Saved ' + savedN + ' selected cupping bowl(s) straight into your Tasting Journal!'
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
    }, ic('check-seal', { size: 16 }), saveAllBtnLbl);

    const canBack = isSheet || acadUi.scaReturnToTaste || (typeof sh().canGoBack === 'function' && sh().canGoBack());
    const topEscapeBtn = canBack ? domH('button', {
      type: 'button',
      class: 'bt-lab-btn is-sm bt-back-escape-btn',
      id: 'bt-sca-back-btn',
      onclick: function () {
        if (isSheet && typeof sh().closeSheet === 'function') {
          cancelScaRaf();
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
          headerSubEl
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
          label: 'Bowl Size',
          value: sca.bowlMl,
          min: 120,
          max: 300,
          step: 10,
          unit: 'mL',
          compact: true,
          onChange: function (v) {
            sca.bowlMl = v;
            syncBowlSizeReadouts();
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
              cancelScaRaf();
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
              /* Shuffle bowls for self-blind cupping and hide names + bag_notes */
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
              sca.blindMode = true;
              CK.haptic('snap');
              notify('Shuffled bowl order & hid coffee identities + bag notes for blind cupping!');
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
    if (sca.running) {
      cancelScaRaf();
      sca.rafId = requestAnimationFrame(tickScaRaf);
    }
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

    function buildKitchenCupTexts() {
      const scale = kt.waterMl / 250;
      const hydMult = kt.citricHydrate === 'monohydrate' ? 1.094 : 1.0;
      const citricG = +(0.15 * scale * hydMult).toFixed(2);
      const sugarG = +(2.0 * scale).toFixed(1);
      const saltG = +(0.18 * scale).toFixed(2);
      return [
        { n: 1, title: 'Cup 1: Sour Anchor', kitchen: '1/8 tsp fresh lemon juice (or ' + citricG + ' g citric acid)', feel: 'Immediate side-of-tongue zip + watering salivation (fast fade).' },
        { n: 2, title: 'Cup 2: Sweet Anchor', kitchen: '1/2 tsp (' + sugarG + ' g) white sugar', feel: 'Front/mid-tongue roundness that softens sourness when sipped after Cup 1.' },
        { n: 3, title: 'Cup 3: Salty Anchor', kitchen: 'Small pinch (' + saltG + ' g) table salt', feel: 'Mineral fullness — notice how 1 drop in Cup 4 blocks bitterness!' },
        { n: 4, title: 'Cup 4: Bitter Anchor', kitchen: '1/4 tsp 100% unsweetened cocoa (or tonic water)', feel: 'Slow-building back-of-tongue linger with ZERO salivation.' },
        { n: 5, title: 'Cup 5: Savory / Umami', kitchen: 'Tiny pinch MSG or 4 drops soy/mushroom broth', feel: 'Mouth-coating savory brothiness (common in aged/savory Kenyans).' },
        { n: 6, title: 'Cup 6: Pure Water Control', kitchen: kt.waterMl + ' mL plain brew water', feel: 'Palate-reset baseline so sensory adaptation never tricks you.' }
      ];
    }

    const cups6 = buildKitchenCupTexts();
    const cupRecipeSpans = [];
    function syncKitchenRecipesInPlace() {
      const nextCups = buildKitchenCupTexts();
      nextCups.forEach(function (c, i) {
        if (cupRecipeSpans[i]) {
          cupRecipeSpans[i].textContent = 'In ' + kt.waterMl + ' mL water: ' + c.kitchen;
        }
      });
    }

    const rIdx = ((kt.roundIdx || 0) % KITCHEN_GAME_ROUNDS.length + KITCHEN_GAME_ROUNDS.length) % KITCHEN_GAME_ROUNDS.length;
    const curRound = KITCHEN_GAME_ROUNDS[rIdx];
    const acHist = readAcademyState().palateGymHistory;

    const hydBtn = isScienceXray() ? domH('button', {
      type: 'button',
      class: 'bt-lab-chip' + (kt.citricHydrate === 'monohydrate' ? ' is-active' : ''),
      onclick: function () {
        kt.citricHydrate = kt.citricHydrate === 'monohydrate' ? 'anhydrous' : 'monohydrate';
        hydBtn.className = 'bt-lab-chip' + (kt.citricHydrate === 'monohydrate' ? ' is-active' : '');
        hydBtn.textContent = kt.citricHydrate === 'monohydrate' ? 'Citric Monohydrate (1.094x)' : 'Anhydrous Citric (1.00x)';
        syncKitchenRecipesInPlace();
      }
    }, kt.citricHydrate === 'monohydrate' ? 'Citric Monohydrate (1.094x)' : 'Anhydrous Citric (1.00x)') : null;

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
          onChange: function (v) {
            kt.waterMl = v;
            syncKitchenRecipesInPlace();
          }
        }),
        hydBtn
      ),
      domH('div', { class: 'bt-kitchen-6grid' },
        cups6.map(function (c) {
          const recSpan = domH('span', { class: 'bt-kitchen-recipe num-tab', text: 'In ' + kt.waterMl + ' mL water: ' + c.kitchen });
          cupRecipeSpans.push(recSpan);
          return domH('div', { class: 'bt-lab-subcard bt-kitchen-cup-card' },
            domH('strong', { text: c.title }),
            recSpan,
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
    const nSess = gh.triangleSessionTrials || 0;
    const kSess = gh.triangleSessionCorrect || 0;
    const sStreak = gh.triangleSessionStreak || acadUi.triangle.streak || 0;
    const pVal = exactTriangleBinomialPValue(nSess, kSess);
    const totalWins = (gh.kitchenCalibCorrect || 0) + (gh.triangleCorrect || 0) + (gh.blindBowlsRuns || 0);
    const rankTitle = (pVal < 0.05 && nSess >= 3)
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
          domH('strong', { text: kSess + '/' + nSess + (sStreak > 1 ? (' (' + sStreak + ' streak!)') : '') })
        ),
        domH('div', { class: 'bt-gym-mini-kpi' },
          domH('span', { text: 'Cupping Flights' }),
          domH('strong', { text: String(gh.blindBowlsRuns || 0) })
        )
      )
    );
  }

  function buildLoggedCuppingsDrillDownCard() {
    const st = window.BTStorage || {};
    const histObj = typeof st.getHistory === 'function' ? st.getHistory() : null;
    const allRows = histObj && Array.isArray(histObj.objs) ? histObj.objs : [];
    const un = function (v) { return typeof unneutralize === 'function' ? unneutralize(v || '') : String(v || ''); };

    const getTraitVal = function (r, tg) {
      const raw = (r[tg.key] != null && r[tg.key] !== '') ? r[tg.key] : (tg.altKey ? r[tg.altKey] : '');
      const n = parseFloat(raw);
      return Number.isFinite(n) && n > 0 ? n : null;
    };

    const detectEntryTraitScale = function (r) {
      const sk = String((r && r.score_kind) || '').toLowerCase();
      if (sk === 'cva_affective' || sk === 'cva_104') return 'cva_9';
      if (sk === 'sca_5cup' || sk === 'sca_2004' || sk === 'classic' || sk === 'sca_classic') return 'sca_10';
      let mx = 0;
      let mn = 99;
      let hasQuarter = false;
      CUPPING_TRAIT_GUIDES.forEach(function (tg) {
        const v = getTraitVal(r, tg);
        if (v == null) return;
        if (v > mx) mx = v;
        if (v < mn) mn = v;
        if (Math.abs(v - Math.round(v)) >= 0.2) hasQuarter = true;
      });
      if (mx > 9.05 || (hasQuarter && mn >= 6 && mx <= 10)) return 'sca_10';
      return 'cva_9';
    };

    const cuppingEntries = [];
    allRows.forEach(function (r, idx) {
      if (!r || typeof r !== 'object') return;
      const mk = String(r.brew_method || '').toLowerCase();
      const sk = String(r.score_kind || '').toLowerCase();
      let traitCount = 0;
      CUPPING_TRAIT_GUIDES.forEach(function (tg) { if (getTraitVal(r, tg) != null) traitCount++; });
      if (mk === 'cupping' || sk === 'cva_affective' || sk === 'quick_sca' || traitCount >= 4) {
        const bInfo = extractAcademyRowBlendInfo(r);
        const rawSca = parseFloat(r.total_score);
        const rawStars = parseFloat(r.my_rating_stars);
        cuppingEntries.push({
          r: r,
          idx: idx,
          coffee: un(r.coffee_name) || (bInfo.isBlend ? bInfo.namesLine : 'Cupped Sample'),
          roaster: un(r.roaster),
          date: String(r.cupping_date || r.brew_date || '').trim(),
          sca: Number.isFinite(rawSca) && rawSca > 0 ? rawSca : 0,
          stars: Number.isFinite(rawStars) && rawStars > 0 ? rawStars : 0,
          notes: un(r.flavors_liked || r.bag_notes || ''),
          scale: detectEntryTraitScale(r),
          traitCount: traitCount,
          blendInfo: bInfo
        });
      }
    });

    const card = domH('section', {
      class: 'bt-studio-card bt-cupping-history-card',
      id: 'bt-academy-cupping-history',
      style: 'min-width:0;max-width:100%;box-sizing:border-box'
    });

    const openJournalCuppings = function () {
      CK.haptic('tick');
      if (window.BTCellarTab && typeof window.BTCellarTab.openJournalFilter === 'function') {
        window.BTCellarTab.openJournalFilter('cupping', '');
        return;
      }
      if (typeof sh().go === 'function') sh().go('history');
    };

    card.appendChild(domH('div', { class: 'bt-lab-card-head' },
      domH('div', { class: 'bt-lab-title-group', style: 'min-width:0;flex:1 1 200px' },
        ic('spark-star', { size: 22 }),
        domH('div', { style: 'min-width:0;flex:1' },
          domH('h3', { text: 'Logged Cuppings & 8-Trait Attribute Drill-Down (' + cuppingEntries.length + ')' }),
          domH('p', { class: 'bt-lab-sub', text: 'Inspect past cupping rounds by coffee name, compare Fragrance\u2013Overall strengths & weaknesses, and jump to full scorecards.' })
        )
      ),
      domH('button', {
        type: 'button',
        class: 'bt-lab-btn is-sm is-primary',
        onclick: openJournalCuppings
      }, 'Journal Cuppings \u2192')
    ));

    if (!cuppingEntries.length) {
      card.appendChild(domH('div', { class: 'bt-drill-drawer' },
        domH('p', {
          class: 'bt-lab-hint',
          style: 'margin:0',
          text: 'No cupping rounds logged yet. Score 1\u20135 bowls in the table above and tap "Save Selected Cupping Bowls to Journal" to unlock your 8-trait strengths, min\u2013max spread & side-by-side history!'
        })
      ));
      return card;
    }

    const sca = acadUi.sca;
    const coffeeMap = new Map();
    cuppingEntries.forEach(function (ce) {
      const k = ce.coffee.toLowerCase();
      const cur = coffeeMap.get(k) || { key: k, label: ce.coffee, n: 0, maxSca: 0 };
      cur.n++;
      if (ce.sca > cur.maxSca) cur.maxSca = ce.sca;
      coffeeMap.set(k, cur);
    });
    const coffeePills = Array.from(coffeeMap.values()).sort(function (a, b) { return b.maxSca - a.maxSca || b.n - a.n; });

    if (sca.historyCoffeeFilter && !coffeeMap.has(sca.historyCoffeeFilter)) {
      sca.historyCoffeeFilter = '';
    }

    const visibleEntries = sca.historyCoffeeFilter
      ? cuppingEntries.filter(function (ce) { return ce.coffee.toLowerCase() === sca.historyCoffeeFilter; })
      : cuppingEntries.slice();

    /* Coffee Name Filter Bar */
    card.appendChild(domH('div', { class: 'bt-rating-tier-bar', role: 'group', 'aria-label': 'Filter logged cuppings by coffee name' },
      domH('button', {
        type: 'button',
        class: 'bt-rating-tier-btn bt-lab-chip bt-drillable' + (!sca.historyCoffeeFilter ? ' is-active' : ''),
        'aria-pressed': String(!sca.historyCoffeeFilter),
        onclick: function () { sca.historyCoffeeFilter = ''; CK.haptic('tick'); rerenderAcademyTab(); }
      }, 'All Cupped Coffees (' + cuppingEntries.length + ')'),
      coffeePills.slice(0, 10).map(function (cp) {
        const on = sca.historyCoffeeFilter === cp.key;
        return domH('button', {
          type: 'button',
          class: 'bt-rating-tier-btn bt-lab-chip bt-drillable' + (on ? ' is-active' : ''),
          'aria-pressed': String(on),
          onclick: function () {
            sca.historyCoffeeFilter = on ? '' : cp.key;
            CK.haptic('tick');
            rerenderAcademyTab();
          }
        }, cp.label + ' (' + cp.n + ')');
      })
    ));

    /* Separate CVA 1–9 entries from Legacy SCA 6–10 entries so averages never mix scales */
    const cvaEntries = visibleEntries.filter(function (ce) { return ce.traitCount > 0 && ce.scale === 'cva_9'; });
    const legacyEntries = visibleEntries.filter(function (ce) { return ce.traitCount > 0 && ce.scale === 'sca_10'; });
    const hasBothScales = cvaEntries.length > 0 && legacyEntries.length > 0;
    let activeScale = sca.historyScaleFilter === 'sca_10' ? 'sca_10' : 'cva_9';
    if (activeScale === 'sca_10' && !legacyEntries.length && cvaEntries.length) activeScale = 'cva_9';
    if (activeScale === 'cva_9' && !cvaEntries.length && legacyEntries.length) activeScale = 'sca_10';
    sca.historyScaleFilter = activeScale;

    const scaleEntries = activeScale === 'sca_10' ? legacyEntries : cvaEntries;
    const maxScale = activeScale === 'sca_10' ? 10 : 9;
    const scaleLabel = activeScale === 'sca_10' ? 'Legacy SCA 6\u201310' : 'CVA 104-2024 (1\u20139)';

    /* 8-Trait Strengths & Weaknesses Grid (Fragrance..Overall) within single scale */
    const traitAgg = CUPPING_TRAIT_GUIDES.map(function (tg) {
      const vals = [];
      scaleEntries.forEach(function (ce) {
        const v = getTraitVal(ce.r, tg);
        if (v != null) vals.push({ v: v, ce: ce });
      });
      if (!vals.length) return { tg: tg, n: 0, avg: 0, min: 0, max: 0, vals: [] };
      const sum = vals.reduce(function (a, x) { return a + x.v; }, 0);
      const mn = Math.min.apply(null, vals.map(function (x) { return x.v; }));
      const mx = Math.max.apply(null, vals.map(function (x) { return x.v; }));
      return { tg: tg, n: vals.length, avg: +(sum / vals.length).toFixed(2), min: mn, max: mx, vals: vals };
    });
    const scoredTraits = traitAgg.filter(function (t) { return t.n > 0; });
    const hiAvg = scoredTraits.length ? Math.max.apply(null, scoredTraits.map(function (t) { return t.avg; })) : 0;
    const loAvg = scoredTraits.length ? Math.min.apply(null, scoredTraits.map(function (t) { return t.avg; })) : 0;
    const topTrait = scoredTraits.find(function (t) { return Math.abs(t.avg - hiAvg) < 0.01; }) || null;
    const lowTrait = scoredTraits.find(function (t) { return Math.abs(t.avg - loAvg) < 0.01; }) || null;

    const drillBox = domH('div', { class: 'bt-drill-drawer' },
      domH('div', { class: 'bt-drill-drawer-head' },
        domH('div', { style: 'min-width:0;flex:1' },
          domH('div', { class: 'bt-pref-tile-lbl', text: '8-TRAIT ATTRIBUTE COMPARISON \u00B7 ' + scaleLabel.toUpperCase() + ' (TAP TO RANK ROUNDS)' }),
          domH('strong', {
            class: 'bt-drill-drawer-title',
            text: (topTrait && lowTrait && hiAvg - loAvg >= 0.15)
              ? ('Strongest: ' + topTrait.tg.name + ' (' + topTrait.avg.toFixed(1) + '/' + maxScale + ') \u00B7 Opportunity: ' + lowTrait.tg.name + ' (' + lowTrait.avg.toFixed(1) + '/' + maxScale + ')')
              : ('Balanced Profile Across ' + (scaleEntries.length || visibleEntries.length) + ' Logged Round' + ((scaleEntries.length || visibleEntries.length) === 1 ? '' : 's'))
          })
        ),
        domH('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;align-items:center' },
          hasBothScales ? domH('div', { class: 'bt-lab-chip-row', role: 'group', 'aria-label': 'Cupping trait scale filter' },
            domH('button', {
              type: 'button',
              class: 'bt-lab-chip' + (activeScale === 'cva_9' ? ' is-active' : ''),
              'aria-pressed': String(activeScale === 'cva_9'),
              onclick: function () { sca.historyScaleFilter = 'cva_9'; CK.haptic('tick'); rerenderAcademyTab(); }
            }, 'CVA 1\u20139 (' + cvaEntries.length + ')'),
            domH('button', {
              type: 'button',
              class: 'bt-lab-chip' + (activeScale === 'sca_10' ? ' is-active' : ''),
              'aria-pressed': String(activeScale === 'sca_10'),
              onclick: function () { sca.historyScaleFilter = 'sca_10'; CK.haptic('tick'); rerenderAcademyTab(); }
            }, 'Legacy SCA 6\u201310 (' + legacyEntries.length + ')')
          ) : null,
          sca.historyTraitFilter ? domH('button', {
            type: 'button',
            class: 'bt-drill-close-btn bt-lab-btn is-sm',
            onclick: function () { sca.historyTraitFilter = ''; CK.haptic('tick'); rerenderAcademyTab(); }
          }, 'Clear Trait \u00D7') : null
        )
      ),
      domH('div', { class: 'bt-sca-attr-grid', id: 'bt-academy-cva-attr-grid' },
        traitAgg.map(function (ta) {
          const active = sca.historyTraitFilter === ta.tg.key;
          const isHi = ta.n > 0 && hiAvg - loAvg >= 0.2 && Math.abs(ta.avg - hiAvg) < 0.01;
          const isLo = ta.n > 0 && hiAvg - loAvg >= 0.2 && Math.abs(ta.avg - loAvg) < 0.01;
          const pct = ta.n > 0 ? Math.max(8, Math.min(100, Math.round((ta.avg / maxScale) * 100))) : 0;
          return domH('button', {
            type: 'button',
            class: 'bt-sca-attr-pill bt-drillable' + (active ? ' is-active' : '') + (isHi ? ' is-high' : '') + (isLo ? ' is-low' : ''),
            'aria-pressed': String(active),
            'data-academy-trait': ta.tg.key,
            onclick: function () {
              sca.historyTraitFilter = active ? '' : ta.tg.key;
              CK.haptic('tick');
              rerenderAcademyTab();
            }
          },
            domH('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:5px;width:100%' },
              domH('span', { class: 'bt-sca-attr-name', text: ta.tg.name.replace(' (Mouthfeel)', '') }),
              domH('strong', { class: 'bt-sca-attr-val num-tab', text: ta.n > 0 ? (ta.avg.toFixed(1) + '/' + maxScale) : '\u2014' })
            ),
            domH('div', { class: 'bt-rating-dist-track', style: 'width:100%' },
              domH('div', { class: 'bt-rating-dist-fill', style: 'width:' + pct + '%' })
            ),
            domH('span', { class: 'bt-drill-cup-sub num-tab', text: ta.n > 0 ? (ta.min.toFixed(1).replace(/\.0$/, '') + '\u2013' + ta.max.toFixed(1).replace(/\.0$/, '')) : 'No data' })
          );
        })
      )
    );

    const activeTraitObj = traitAgg.find(function (ta) { return ta.tg.key === sca.historyTraitFilter; }) || null;
    if (activeTraitObj) {
      drillBox.appendChild(domH('p', {
        class: 'bt-lab-hint',
        style: 'margin:0',
        text: activeTraitObj.tg.name + ': ' + activeTraitObj.tg.hint + ' \u2014 rounds below are ranked highest to lowest on ' + activeTraitObj.tg.name + ' (' + scaleLabel + ').'
      }));
    }

    const roundsPool = (activeTraitObj || hasBothScales) && scaleEntries.length ? scaleEntries : visibleEntries;
    const sortedRounds = roundsPool.slice().sort(function (a, b) {
      if (activeTraitObj) {
        const va = getTraitVal(a.r, activeTraitObj.tg) || 0;
        const vb = getTraitVal(b.r, activeTraitObj.tg) || 0;
        if (Math.abs(vb - va) > 0.01) return vb - va;
      }
      if (Math.abs(b.sca - a.sca) > 0.05) return b.sca - a.sca;
      return b.idx - a.idx;
    });

    drillBox.appendChild(domH('div', { class: 'bt-drill-cup-list' },
      sortedRounds.slice(0, 8).map(function (ce) {
        const ceScaleMax = ce.scale === 'sca_10' ? 10 : 9;
        const selVal = activeTraitObj ? getTraitVal(ce.r, activeTraitObj.tg) : null;
        /* Find this round's strongest & lowest trait */
        let bestT = null, lowT = null;
        CUPPING_TRAIT_GUIDES.forEach(function (tg) {
          const v = getTraitVal(ce.r, tg);
          if (v == null) return;
          if (!bestT || v > bestT.v) bestT = { name: tg.name.replace(' (Mouthfeel)', ''), v: v };
          if (!lowT || v < lowT.v) lowT = { name: tg.name.replace(' (Mouthfeel)', ''), v: v };
        });
        const traitSummary = (bestT && lowT && bestT.v - lowT.v >= 0.25)
          ? ('Top: ' + bestT.name + ' (' + bestT.v.toFixed(1).replace(/\.0$/, '') + '/' + ceScaleMax + ') \u00B7 Low: ' + lowT.name + ' (' + lowT.v.toFixed(1).replace(/\.0$/, '') + '/' + ceScaleMax + ')')
          : (bestT ? ('Uniform ~' + bestT.v.toFixed(1).replace(/\.0$/, '') + '/' + ceScaleMax + ' across traits') : '');

        return domH('article', { class: 'bt-drill-cup-card' },
          domH('div', { class: 'bt-drill-cup-head' },
            domH('div', { style: 'min-width:0;flex:1 1 170px' },
              domH('div', { class: 'bt-drill-cup-sub', text: [ce.roaster, ce.date, ce.scale === 'sca_10' ? 'Legacy SCA 6\u201310' : 'CVA 1\u20139'].filter(Boolean).join(' \u00B7 ') }),
              domH('strong', { class: 'bt-drill-cup-title', text: ce.coffee })
            ),
            domH('div', { style: 'display:flex;gap:5px;flex-wrap:wrap;align-items:center' },
              ce.blendInfo && ce.blendInfo.isBlend ? domH('span', { class: 'bt-tc-badge bt-journal-blend-badge is-copper', text: ce.blendInfo.pillText }) : null,
              selVal != null ? domH('span', { class: 'bt-tc-badge is-gold num-tab', text: activeTraitObj.tg.name.replace(' (Mouthfeel)', '') + ' ' + selVal.toFixed(1).replace(/\.0$/, '') + '/' + ceScaleMax }) : null,
              ce.sca > 0 ? domH('span', { class: 'bt-tc-badge is-good num-tab', text: ce.sca.toFixed(1) + ' SCA' }) : null,
              ce.stars > 0 ? domH('span', { class: 'bt-tc-badge is-sci num-tab', text: ce.stars.toFixed(2) + ' \u2605' }) : null
            )
          ),
          traitSummary ? domH('div', { class: 'bt-drill-cup-meta num-tab', text: traitSummary }) : null,
          ce.notes ? domH('div', { class: 'bt-drill-cup-sub', text: 'Notes: ' + ce.notes }) : null,
          domH('div', { class: 'bt-drill-cup-actions' },
            domH('button', {
              type: 'button',
              class: 'bt-drill-action-pill bt-lab-btn is-sm is-primary',
              onclick: function () {
                CK.haptic('tick');
                if (window.BTCellarTab && typeof window.BTCellarTab.openDetail === 'function') {
                  window.BTCellarTab.openDetail(ce.r);
                } else {
                  openJournalCuppings();
                }
              }
            }, 'Inspect Scorecard \u2192'),
            domH('button', {
              type: 'button',
              class: 'bt-drill-action-pill bt-lab-btn is-sm',
              onclick: function () {
                /* Reset ALL Bowl A fields cleanly so prior coffee traits/metadata/defects never leak */
                const freshA = makeDefaultScaBowl(0, ce.coffee);
                freshA.coffee_id = ce.r.coffee_id || '';
                freshA.name = ce.coffee;
                freshA.roaster = ce.roaster || '';
                freshA.origin = un(ce.r.origin);
                freshA.process = un(ce.r.process);
                freshA.roast = un(ce.r.roast_level || ce.r.roast || '');
                freshA.varietal = un(ce.r.varietal || '');
                freshA.farm = un(ce.r.farm || ce.r.farm_or_station || '');
                freshA.elevation_m = un(ce.r.elevation_m || '');
                freshA.agtron = un(ce.r.agtron || ce.r.ground_agtron || '');
                freshA.bag_notes = un(ce.r.bag_notes || '');
                freshA.notes = '';
                freshA.flavors = [];
                freshA.hVals = [6, 6, 6, 6, 6, 6, 6, 6];
                freshA.scoringMode = 'cva_traits';
                freshA.traitsCustomized = false;
                freshA.quickBaseSca = 84.25;
                freshA.nonUniformCups = 0;
                freshA.defectiveCups = 0;
                freshA.defects = 0;
                freshA.defect_notes = '';
                freshA.touched = true;
                freshA.includeInSave = true;
                freshA.score = computeCvaBowlScore(freshA);
                sca.bowls[0] = freshA;
                sca._lastSavedSig = '';
                CK.haptic('snap');
                notify('Loaded "' + ce.coffee + '" into Bowl A with clean traits & defects for re-cupping!');
                rerenderAcademyTab();
              }
            }, 'Re-Cup in Bowl A')
          )
        );
      })
    ));

    /* Side-by-Side 2-Round 8-Trait CVA Comparison (Academy 5-Bowl History) */
    if (cuppingEntries.length >= 2) {
      const cmpPool = cuppingEntries.slice().sort(function (a, b) {
        return (b.sca - a.sca) || (b.idx - a.idx);
      });
      const idxA = (sca.historyCmpA >= 0 && sca.historyCmpA < cmpPool.length) ? sca.historyCmpA : 0;
      const idxB = (sca.historyCmpB >= 0 && sca.historyCmpB < cmpPool.length && sca.historyCmpB !== idxA) ? sca.historyCmpB : (idxA === 0 ? 1 : 0);
      sca.historyCmpA = idxA;
      sca.historyCmpB = idxB;
      const eA = cmpPool[idxA];
      const eB = cmpPool[idxB];
      const sameScale = eA.scale === eB.scale;
      const maxA = eA.scale === 'sca_10' ? 10 : 9;
      const maxB = eB.scale === 'sca_10' ? 10 : 9;

      const cmpBox = domH('div', { id: 'bt-academy-cupping-compare', style: 'margin-top:10px;display:flex;flex-direction:column;gap:8px' },
        domH('div', { class: 'bt-drill-drawer-head' },
          domH('div', { style: 'min-width:0;flex:1' },
            domH('div', { class: 'bt-pref-tile-lbl', text: 'SIDE-BY-SIDE 8-TRAIT CVA DELTA GRID' }),
            domH('strong', { class: 'bt-drill-drawer-title', text: 'Compare 2 Cupping Rounds (A vs B)' })
          ),
          domH('button', {
            type: 'button',
            class: 'bt-lab-btn is-sm',
            'aria-expanded': String(!!sca.historyCompareOpen),
            onclick: function () { sca.historyCompareOpen = !sca.historyCompareOpen; CK.haptic('tick'); rerenderAcademyTab(); }
          }, sca.historyCompareOpen ? 'Hide Compare \u25B2' : 'Compare 2 Rounds \u25BC')
        )
      );

      if (sca.historyCompareOpen) {
        const mkSel = function (curIdx, ariaLbl, onSet) {
          return domH('select', {
            class: 'bt-lab-select',
            'aria-label': ariaLbl,
            style: 'flex:1 1 140px;min-width:0',
            onchange: function (ev) { onSet(parseInt(ev.target.value, 10) || 0); }
          },
            cmpPool.map(function (ce, ci) {
              const sTag = ce.scale === 'sca_10' ? '6\u201310' : '1\u20139';
              const opt = domH('option', { value: String(ci), text: ce.coffee + (ce.sca > 0 ? (' (' + ce.sca.toFixed(1) + ', ' + sTag + ')') : '') });
              if (ci === curIdx) opt.selected = true;
              return opt;
            })
          );
        };

        cmpBox.appendChild(domH('div', { style: 'display:flex;gap:8px;flex-wrap:wrap;align-items:center' },
          mkSel(idxA, 'Select Cupping Round A', function (v) { sca.historyCmpA = v; rerenderAcademyTab(); }),
          domH('span', { class: 'bt-pref-tile-lbl', text: 'vs' }),
          mkSel(idxB, 'Select Cupping Round B', function (v) { sca.historyCmpB = v; rerenderAcademyTab(); })
        ));
        if (!sameScale) {
          cmpBox.appendChild(domH('p', {
            class: 'bt-lab-hint',
            style: 'margin:0',
            text: 'Round A uses ' + (maxA === 10 ? 'Legacy SCA 6\u201310' : 'CVA 1\u20139') + ' traits while Round B uses ' + (maxB === 10 ? 'Legacy SCA 6\u201310' : 'CVA 1\u20139') + ' — per-trait deltas are omitted across differing scales (Total 0\u2013100 SCA remains directly comparable).'
          }));
        }

        const tbody = domH('tbody');
        CUPPING_TRAIT_GUIDES.forEach(function (tg) {
          const vA = getTraitVal(eA.r, tg);
          const vB = getTraitVal(eB.r, tg);
          const diff = (sameScale && vA != null && vB != null) ? +(vA - vB).toFixed(2) : null;
          const diffTxt = !sameScale
            ? 'Diff. scale'
            : (diff == null ? '\u2014' : (Math.abs(diff) < 0.01 ? '0.0' : ((diff > 0 ? '+' : '') + diff.toFixed(1).replace(/\.0$/, ''))));
          const txtA = vA != null ? (vA.toFixed(1).replace(/\.0$/, '') + (sameScale ? '' : ('/' + maxA))) : '\u2014';
          const txtB = vB != null ? (vB.toFixed(1).replace(/\.0$/, '') + (sameScale ? '' : ('/' + maxB))) : '\u2014';
          tbody.appendChild(domH('tr', { class: diff != null && Math.abs(diff) >= 0.25 ? 'is-diff' : '' },
            domH('td', null, domH('strong', { text: tg.name.replace(' (Mouthfeel)', '') })),
            domH('td', { class: 'num-tab' + (diff != null && diff > 0.05 ? ' bt-compare-winner-col' : ''), text: txtA }),
            domH('td', { class: 'num-tab' + (diff != null && diff < -0.05 ? ' bt-compare-winner-col' : ''), text: txtB }),
            domH('td', { class: 'num-tab' + (diff != null && diff > 0.05 ? ' is-pos' : (diff != null && diff < -0.05 ? ' is-neg' : '')), text: diffTxt })
          ));
        });
        const sDiff = (eA.sca > 0 && eB.sca > 0) ? +(eA.sca - eB.sca).toFixed(2) : null;
        tbody.appendChild(domH('tr', { class: 'is-total-row' },
          domH('td', null, domH('strong', { text: 'Total SCA' })),
          domH('td', { class: 'num-tab' + (sDiff > 0 ? ' bt-compare-winner-col' : ''), text: eA.sca > 0 ? eA.sca.toFixed(2) : '\u2014' }),
          domH('td', { class: 'num-tab' + (sDiff < 0 ? ' bt-compare-winner-col' : ''), text: eB.sca > 0 ? eB.sca.toFixed(2) : '\u2014' }),
          domH('td', { class: 'num-tab', text: sDiff == null ? '\u2014' : ((sDiff > 0 ? '+' : '') + sDiff.toFixed(2)) })
        ));

        cmpBox.appendChild(domH('div', { class: 'bt-compare-scroll' },
          domH('table', { class: 'bt-cupping-compare-table' },
            domH('thead', null,
              domH('tr', null,
                domH('th', { text: 'Trait' }),
                domH('th', { text: 'A: ' + (eA.coffee.length > 18 ? (eA.coffee.slice(0, 17) + '\u2026') : eA.coffee) }),
                domH('th', { text: 'B: ' + (eB.coffee.length > 18 ? (eB.coffee.slice(0, 17) + '\u2026') : eB.coffee) }),
                domH('th', { text: 'Delta' })
              )
            ),
            tbody
          )
        ));
      }
      drillBox.appendChild(cmpBox);
    }

    card.appendChild(drillBox);
    return card;
  }

  function renderPalateGymView() {
    cancelSalamiRaf();
    const wrap = domH('div', { class: 'bt-academy-seg' });
    const acState = readAcademyState();
    const sal = acadUi.salami;
    const tri = acadUi.triangle;

    /* 0. Single-Per-Viewport Beanjamin 2.0 Coach & Live Scorecard */
    wrap.appendChild(buildGymBeanjaminScorecardBanner(acState));

    /* 1. Editable 1-5 Bowl Multi-Coffee Cupping */
    wrap.appendChild(buildScaCockpitWidget());

    /* 1b. Logged Cuppings & 8-Trait Attribute Drill-Down Summary */
    wrap.appendChild(buildLoggedCuppingsDrillDownCard());

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

    const initSalBtnTxt = sal.running
      ? 'Pause Split Timer'
      : ((sal.elapsedSec || 0) >= totalSalSec
        ? 'Replay 3-Glass Split'
        : ((sal.elapsedSec || 0) > 0 ? 'Resume Split Timer' : 'Start 3-Glass Salami Timer'));
    const salBtnLbl = domH('span', { text: initSalBtnTxt });

    let salamiCard = null;
    function tickSalRaf() {
      if (!sal.running) {
        cancelSalamiRaf();
        return;
      }
      if (!salamiCard || !salamiCard.isConnected) {
        cancelSalamiRaf();
        sal.running = false;
        sal._baseSec = sal.elapsedSec || 0;
        return;
      }
      const nowS = (sal._baseSec || 0) + (performance.now() - (sal._t0Ms || performance.now())) / 1000;
      sal.elapsedSec = nowS;
      if (!sal.spokenG2 && nowS >= stepDur) {
        sal.spokenG2 = true;
        CK.haptic('sweetSpotLock');
        speakCueSafe('Swap to Glass Two now. Caramel sugars wave.', 'step');
        notify('SWAP TO GLASS #2 (Caramel & Natural Sugars) NOW!');
      }
      if (!sal.spokenG3 && nowS >= stepDur * 2) {
        sal.spokenG3 = true;
        CK.haptic('sweetSpotLock');
        speakCueSafe('Swap to Glass Three now. Late bitters wave.', 'step');
        notify('SWAP TO GLASS #3 (Late Bitter Tail) NOW!');
      }
      if (nowS >= totalSalSec) {
        sal.running = false;
        cancelSalamiRaf();
        sal.elapsedSec = totalSalSec;
        sal._baseSec = totalSalSec;
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

    salamiCard = domH('section', { class: 'bt-studio-card' },
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
          onclick: function () {
            sal.running = false;
            cancelSalamiRaf();
            sal.mode = 'pourover';
            sal.elapsedSec = 0;
            sal._baseSec = 0;
            sal.spokenG2 = false;
            sal.spokenG3 = false;
            rerenderAcademyTab();
          }
        }, 'Pour-Over (3 × 55s)'),
        domH('button', {
          type: 'button',
          class: 'bt-lab-chip' + (sal.mode === 'espresso' ? ' is-active' : ''),
          onclick: function () {
            sal.running = false;
            cancelSalamiRaf();
            sal.mode = 'espresso';
            sal.elapsedSec = 0;
            sal._baseSec = 0;
            sal.spokenG2 = false;
            sal.spokenG3 = false;
            rerenderAcademyTab();
          }
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
                  cancelSalamiRaf();
                  sal._baseSec = sal.elapsedSec;
                  salBtnLbl.textContent = 'Resume Split Timer';
                } else {
                  if (sal.elapsedSec >= totalSalSec) {
                    sal.elapsedSec = 0;
                    sal._baseSec = 0;
                    sal.spokenG2 = false;
                    sal.spokenG3 = false;
                  }
                  cancelSalamiRaf();
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
                cancelSalamiRaf();
                sal.elapsedSec = 0;
                sal._baseSec = 0;
                sal.spokenG2 = false;
                sal.spokenG3 = false;
                salBtnLbl.textContent = 'Start 3-Glass Salami Timer';
                syncSalamiVisuals(0);
              }
            }, 'Reset 00:00')
          )
        )
      )
    );
    syncSalamiVisuals(sal.elapsedSec || 0);
    if (sal.running) {
      cancelSalamiRaf();
      sal.rafId = requestAnimationFrame(tickSalRaf);
    }
    wrap.appendChild(salamiCard);

    /* 4. Self-Blind Turntable Triangle Cupping (Secret Odd Dot Code + Physical Cup Flip Grading!) */
    const nSess = acState.palateGymHistory.triangleSessionTrials;
    const kSess = acState.palateGymHistory.triangleSessionCorrect;
    const nAll = acState.palateGymHistory.triangleTrials;
    const kAll = acState.palateGymHistory.triangleCorrect;
    const pVal = exactTriangleBinomialPValue(nSess, kSess);
    const pBadgeTxt = nSess === 0
      ? ('Session: 0 trials logged — run your first blind triad!' + (nAll > 0 ? (' (All-time: ' + kAll + '/' + nAll + ')') : ''))
      : ('Session: ' + kSess + '/' + nSess + ' Correct \u00B7 Exact Binomial p = ' + (pVal * 100).toFixed(2) + '% ' +
        (pVal < 0.05 ? '(Statistically Calibrated!)' : '(Keep calibrating toward p < 5%)') +
        (nAll > nSess ? (' \u00B7 All-time: ' + kAll + '/' + nAll) : ''));

    const oddDotsLabel = function (d) { return d === 1 ? '1 underside dot' : (d + ' underside dots'); };

    wrap.appendChild(domH('section', { class: 'bt-studio-card', id: 'bt-triangle-test-card' },
      domH('div', { class: 'bt-lab-card-head' },
        domH('div', { class: 'bt-lab-title-group' },
          ic('check-seal', { size: 22 }),
          domH('div', null,
            domH('h3', { text: 'Self-Blind Triangle Test (ISO 4120 Exact Binomial p-Value)' }),
            domH('p', { class: 'bt-lab-sub num-tab', text: pBadgeTxt })
          )
        ),
        domH('button', {
          type: 'button',
          class: 'bt-lab-btn is-sm',
          onclick: function () {
            const cur = readAcademyState();
            cur.palateGymHistory.triangleSessionTrials = 0;
            cur.palateGymHistory.triangleSessionCorrect = 0;
            cur.palateGymHistory.triangleSessionStreak = 0;
            writeAcademyState(cur);
            tri.streak = 0;
            resetTriangleRound();
            CK.haptic('tick');
            notify('Triangle Test session reset to 0/0 for your new coffee pair!');
            rerenderAcademyTab();
          }
        }, 'Reset Session')
      ),
      domH('p', {
        class: 'bt-lab-hint',
        text: '1) Stick 1, 2, and 3 tape dots under 3 identical cups. 2) Tap "Peek Prep Code" to see which dot cup gets Brew B (odd cup), pour Brew A into the other two, then hide the code. 3) Spin the tray eyes-closed, taste all 3 cups, pick your odd cup, flip it over, and tap how many dots are underneath!'
      }),
      !tri.revealed ? domH('div', { class: 'bt-tc-well', style: 'padding:9px 12px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px' },
        tri.prepCodeVisible
          ? domH('span', { style: 'font-size:0.84rem;font-weight:700', text: 'Pour Prep Code: Pour Brew B (Odd Cup) into the cup with ' + oddDotsLabel(tri.oddDots) + ', then hide & spin!' })
          : domH('span', { style: 'font-size:0.84rem;font-weight:700', text: 'Secret Odd Dot Code: Hidden (blinded for tasting)' }),
        domH('button', {
          type: 'button',
          class: 'bt-lab-chip' + (tri.prepCodeVisible ? ' is-active' : ''),
          onclick: function () {
            tri.prepCodeVisible = !tri.prepCodeVisible;
            CK.haptic('tick');
            rerenderAcademyTab();
          }
        }, tri.prepCodeVisible ? 'Hide Code & Spin Tray' : 'Peek Prep Code (Pour Brew B)')
      ) : null,
      domH('p', {
        class: 'bt-lab-inline-lbl',
        style: 'margin:8px 0 4px',
        text: 'Flip your picked cup \u2014 how many dots are underneath? (1 / 2 / 3)'
      }),
      domH('div', { class: 'bt-triangle-cups-row' },
        [1, 2, 3].map(function (dotsNum) {
          const isPicked = tri.pickedDots === dotsNum;
          const isOdd = tri.oddDots === dotsNum;
          let stateCls = '';
          if (tri.revealed) {
            if (isOdd) stateCls = ' is-odd-truth';
            else if (isPicked) stateCls = ' is-wrong-pick';
          }
          const lbl = dotsNum === 1 ? '1 Dot Underneath' : (dotsNum + ' Dots Underneath');
          return domH('button', {
            type: 'button',
            class: 'bt-triangle-cup-btn' + stateCls,
            onclick: function () {
              if (tri.revealed) return;
              tri.pickedDots = dotsNum;
              tri.prepCodeVisible = false;
              tri.revealed = true;
              const hit = dotsNum === tri.oddDots;
              const cur = readAcademyState();
              cur.palateGymHistory.triangleTrials++;
              cur.palateGymHistory.triangleSessionTrials++;
              if (hit) {
                cur.palateGymHistory.triangleCorrect++;
                cur.palateGymHistory.triangleSessionCorrect++;
                cur.palateGymHistory.triangleSessionStreak = (cur.palateGymHistory.triangleSessionStreak || 0) + 1;
              } else {
                cur.palateGymHistory.triangleSessionStreak = 0;
              }
              tri.streak = cur.palateGymHistory.triangleSessionStreak;
              cur.palateGymHistory.lastPlayedAt = new Date().toISOString();
              writeAcademyState(cur);
              const nextP = exactTriangleBinomialPValue(cur.palateGymHistory.triangleSessionTrials, cur.palateGymHistory.triangleSessionCorrect);
              acadUi.gymCoach = hit
                ? {
                  mood: nextP < 0.05 ? 'celebrating' : 'eureka',
                  title: 'Odd Cup Found! (' + cur.palateGymHistory.triangleSessionCorrect + '/' + cur.palateGymHistory.triangleSessionTrials + ')',
                  speech: nextP < 0.05
                    ? ('Statistically proven palate (p = ' + (nextP * 100).toFixed(1) + '% < 5%)! You beat random guessing hands-down.')
                    : ('Sharp tongue! ' + oddDotsLabel(dotsNum) + ' was indeed the odd cup out — run another triad to lock in p < 5%!')
                }
                : {
                  mood: 'sympathetic',
                  title: 'Blind Tasting Is Humbling!',
                  speech: 'You picked ' + oddDotsLabel(dotsNum) + ', while Brew B was under ' + oddDotsLabel(tri.oddDots) + '. Let the cups cool toward 55–42 °C where differences pop loudest!'
                };
              CK.haptic(hit ? 'celebrate' : 'snap');
              rerenderAcademyTab();
            }
          },
          ic('cafe-cup', { size: 24 }),
          domH('strong', { text: lbl }),
          domH('span', { text: tri.revealed ? (isOdd ? ('ODD CUP (' + oddDotsLabel(dotsNum) + ')') : ('Pair (' + oddDotsLabel(dotsNum) + ')')) : 'Tap Dot Count Found' }));
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

    /* Pre-index lowercase search fields once per render O(N) */
    const indexedTerms = allTerms.map(function (item) {
      const term = String(item.term || item[0] || '');
      const def = String(item.def || item[1] || '');
      const cat = String(item.cat || item.group || '');
      const alsoStr = String(item.also || '');
      const altsStr = Array.isArray(item.alts) ? item.alts.join(' ') : String(item.alts || '');
      const hiddenStr = Array.isArray(item.hidden) ? item.hidden.join(' ') : String(item.hidden || '');
      return {
        item: item,
        term: term,
        tLow: term.trim().toLowerCase(),
        def: def,
        dLow: def.toLowerCase(),
        cat: cat,
        aLow: (alsoStr + ' ' + altsStr).trim().toLowerCase(),
        hLow: hiddenStr.trim().toLowerCase()
      };
    });

    const searchIn = domH('input', {
      type: 'search',
      class: 'bt-lab-text-in bt-glossary-search',
      placeholder: 'Search all ' + allTerms.length + ' coffee science, sensory & brewer terms...',
      value: gl.query
    });
    const resultsHost = domH('div', { class: 'bt-glossary-results-untrapped' });

    /* Extract distinct categories */
    const catSet = new Set(['All']);
    indexedTerms.forEach(function (it) {
      if (it.cat && catSet.size < 13) catSet.add(it.cat);
    });
    const catList = Array.from(catSet);
    const catBtnRefs = [];
    const letterBtnRefs = [];

    function syncFilterChipStates() {
      catBtnRefs.forEach(function (ref) {
        const on = gl.cat === ref.val;
        ref.btn.className = 'bt-lab-chip' + (on ? ' is-active' : '');
        ref.btn.setAttribute('aria-pressed', String(on));
      });
      letterBtnRefs.forEach(function (ref) {
        const on = gl.letter === ref.val;
        ref.btn.className = 'bt-lab-chip' + (on ? ' is-active' : '');
        ref.btn.setAttribute('aria-pressed', String(on));
      });
    }

    function filterTerms() {
      resultsHost.textContent = '';
      const q = gl.query.trim().toLowerCase();
      const filtered = indexedTerms.filter(function (rec) {
        if (gl.cat !== 'All' && rec.cat !== gl.cat) return false;
        if (gl.letter === '0\u20139') {
          if (!/^[0-9]/.test(rec.term)) return false;
        } else if (gl.letter !== 'ALL') {
          if (rec.term.charAt(0).toUpperCase() !== gl.letter) return false;
        }
        if (!q) return true;
        return rec.tLow.indexOf(q) >= 0 ||
          rec.aLow.indexOf(q) >= 0 ||
          rec.hLow.indexOf(q) >= 0 ||
          rec.dLow.indexOf(q) >= 0;
      });

      let ordered = filtered;
      if (q && filtered.length > 1) {
        /* Decorate-sort-undecorate: compute rank ONCE per match in O(N) */
        const escQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const wordRe = new RegExp('(?:^|\\b|\\()' + escQ + '(?:$|\\b|\\))');
        const decorated = filtered.map(function (rec) {
          let rnk = 6;
          if (rec.tLow === q) rnk = 0;
          else if (rec.tLow.indexOf(q) === 0) rnk = 1;
          else if (wordRe.test(rec.tLow)) rnk = 2;
          else if (rec.tLow.indexOf(q) >= 0) rnk = 3;
          else if (rec.aLow.indexOf(q) >= 0) rnk = 4;
          else if (rec.hLow.indexOf(q) >= 0) rnk = 5;
          return { rec: rec, rank: rnk, len: rec.term.length, term: rec.term };
        });
        decorated.sort(function (a, b) {
          if (a.rank !== b.rank) return a.rank - b.rank;
          if (a.len !== b.len) return a.len - b.len;
          return a.term.localeCompare(b.term);
        });
        ordered = decorated.map(function (d) { return d.rec; });
      }

      if (!ordered.length) {
        let suggRaw = [];
        if (q && typeof glSuggest === 'function') {
          try { suggRaw = glSuggest(allTerms, q, 5) || []; } catch (_) { suggRaw = []; }
        }
        const suggTerms = (Array.isArray(suggRaw) ? suggRaw : [])
          .map(function (s) {
            if (typeof s === 'string') return s.trim();
            if (s && typeof s === 'object') return String(s.term || s[0] || '').trim();
            return '';
          })
          .filter(Boolean)
          .slice(0, 5);

        resultsHost.appendChild(domH('p', {
          class: 'bt-lab-hint',
          text: 'No matching terms for "' + (gl.query.trim() || gl.letter) + '"' +
            (suggTerms.length ? ' \u2014 did you mean:' : '. Try "tds", "lactone", "agtron", or reset filters.')
        }));
        if (suggTerms.length) {
          resultsHost.appendChild(domH('div', { class: 'bt-lab-chip-row', role: 'group', 'aria-label': 'Glossary spelling suggestions' },
            suggTerms.map(function (sTerm) {
              return domH('button', {
                type: 'button',
                class: 'bt-lab-chip',
                onclick: function () {
                  gl.query = sTerm;
                  gl.letter = 'ALL';
                  gl.cat = 'All';
                  gl.limit = 40;
                  searchIn.value = sTerm;
                  syncFilterChipStates();
                  CK.haptic('tick');
                  filterTerms();
                }
              }, sTerm);
            })
          ));
        }
        return;
      }

      const maxShow = Math.max(40, gl.limit || 40);
      const shown = ordered.slice(0, maxShow);
      if (!q) {
        const ctxMsg = gl.letter !== 'ALL'
          ? ('Filter "' + gl.letter + '" \u2014 ' + ordered.length + ' term' + (ordered.length === 1 ? '' : 's') + (gl.cat !== 'All' ? (' in ' + gl.cat) : ''))
          : ('Showing ' + shown.length + ' of ' + ordered.length + ' terms' + (gl.cat !== 'All' ? (' in ' + gl.cat) : ' (All 0\u20139 & A\u2013Z)'));
        resultsHost.appendChild(domH('p', { class: 'bt-lab-hint', style: 'margin-bottom:6px', text: ctxMsg }));
      }
      shown.forEach(function (rec) {
        resultsHost.appendChild(domH('div', { class: 'bt-glossary-item' },
          domH('div', { class: 'bt-glossary-head' },
            domH('strong', { text: rec.term }),
            rec.cat ? domH('span', { class: 'bt-glossary-cat', text: rec.cat }) : null
          ),
          domH('p', { text: rec.def })
        ));
      });

      if (ordered.length > shown.length) {
        resultsHost.appendChild(domH('div', { class: 'bt-chart-cta-bar' },
          domH('button', {
            type: 'button',
            class: 'bt-lab-btn is-primary',
            onclick: function () {
              gl.limit = maxShow + 40;
              CK.haptic('tick');
              filterTerms();
            }
          }, 'Show 40 More Terms (' + (ordered.length - shown.length) + ' remaining) \u2192')
        ));
      }
    }

    let glSearchTimer = 0;
    searchIn.addEventListener('input', function () {
      gl.query = searchIn.value;
      gl.limit = 40;
      if (glSearchTimer) clearTimeout(glSearchTimer);
      glSearchTimer = setTimeout(function () {
        glSearchTimer = 0;
        if (!resultsHost.isConnected && !card.isConnected) return;
        filterTerms();
      }, 100);
    });

    const catBar = domH('div', { class: 'bt-lab-chip-row', role: 'group', 'aria-label': 'Glossary categories' },
      catList.map(function (cName) {
        const btn = domH('button', {
          type: 'button',
          class: 'bt-lab-chip' + (gl.cat === cName ? ' is-active' : ''),
          'aria-pressed': String(gl.cat === cName),
          onclick: function () {
            gl.cat = cName;
            gl.limit = 40;
            syncFilterChipStates();
            CK.haptic('tick');
            filterTerms();
          }
        }, cName);
        catBtnRefs.push({ val: cName, btn: btn });
        return btn;
      })
    );

    const letters28 = ['ALL', '0\u20139'].concat('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''));
    const alphaBar = domH('div', { class: 'bt-lab-chip-row bt-alpha-bar', role: 'group', 'aria-label': 'Glossary 0 to 9 and A to Z filter' },
      letters28.map(function (ltr) {
        const btn = domH('button', {
          type: 'button',
          class: 'bt-lab-chip' + (gl.letter === ltr ? ' is-active' : ''),
          'aria-pressed': String(gl.letter === ltr),
          onclick: function () {
            gl.letter = ltr;
            gl.limit = 40;
            syncFilterChipStates();
            CK.haptic('tick');
            filterTerms();
          }
        }, ltr);
        letterBtnRefs.push({ val: ltr, btn: btn });
        return btn;
      })
    );

    card.appendChild(domH('div', { class: 'bt-lab-card-head' },
      domH('div', { class: 'bt-lab-title-group' },
        ic('search-filter', { size: 22 }),
        domH('div', null,
          domH('h3', { text: 'A–Z Coffee Science & Sensory Glossary (' + allTerms.length + ' Terms)' }),
          domH('p', { class: 'bt-lab-sub', text: 'Full-page 60fps scrolling (zero nested scroll trap) — filter by category, 0–9 / A–Z letter, or instant search' })
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
   * v7.5 3-CARD SAVE & RESTORE CENTER ('save-backup-center' + Inline Vault)
   * ========================================================================== */
  let _saveCenterUi = {
    fileImportMode: 'merge', /* 'merge' | 'replace' */
    webUrlConfirmMsg: '',
    lastGeneratedUrl: '',
    feedbackMsg: '',
    feedbackTone: 'good',
    webUrlDraft: ''
  };

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

    /* Scoped IDs + semantic data-save-role eliminate duplicate-ID collisions without mutating DOM IDs */
    function assignId(canonId) {
      return isSheet ? canonId : ('bt-vault-' + String(canonId).replace(/^bt-/, ''));
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
      'data-save-role': 'load-web-url-input',
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
        'data-save-role': 'save-web-url-btn',
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
            'data-save-role': 'load-web-url-btn',
            class: 'bt-lab-btn is-primary',
            style: 'flex:1 1 180px;min-width:0;max-width:100%;white-space:normal;line-height:1.2',
            onclick: function () { runWebUrlRestore('merge'); }
          }, ic('clipboard-paste', { size: 16 }), domH('span', { text: 'Restore Link / Code (Merge)' })),
          domH('button', {
            type: 'button',
            id: assignId('bt-replace-web-url-btn'),
            'data-save-role': 'replace-web-url-btn',
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
          'data-save-role': 'export-json-save-btn',
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
          'data-save-role': 'export-csv-save-btn',
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
          'data-save-role': 'import-save-file-btn',
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
        if (lastAcademyMount && acadUi.subView === 'vault') {
          rerenderAcademyTab();
        }
      }
    }, opts || {});
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
        appVersion: '7.6.0',
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
        const made = await makeEverythingCode(parts, { made: new Date().toISOString(), app: '7.5.0' });
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
            if (res && res.ok) {
              resetAcademyInMemoryState();
              if (typeof window.__btResetPalateState === 'function') {
                try { window.__btResetPalateState(); } catch (_) {}
              }
              const okMsg = 'Restored ' + (res.restoredKeys || 'all') + ' saved records from "' + labelTxt + '"!';
              _saveCenterUi.feedbackTone = 'good';
              _saveCenterUi.feedbackMsg = okMsg;
              statusLine.textContent = okMsg;
              CK.haptic('celebrate');
              notify(okMsg);
              if (hostEl) renderDataVaultSheet(hostEl);
              else rerenderAcademyTab();
            } else {
              statusLine.textContent = 'No backup snapshot recorded for "' + labelTxt + '" on this browser yet.';
            }
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
        try { localStorage.removeItem(ACADEMY_LS_KEY); } catch (_) {}
        resetAcademyInMemoryState();
        if (typeof window.__btResetPalateState === 'function') {
          try { window.__btResetPalateState(); } catch (_) {}
        }
        const clearedMsg = 'Cleared browser storage & reset live session state cleanly (your downloaded backup files on disk are untouched).';
        _saveCenterUi.feedbackTone = 'good';
        _saveCenterUi.feedbackMsg = clearedMsg;
        statusLine.textContent = clearedMsg;
        CK.haptic('snap');
        notify('Cleared all saved browser data on this device.');
        if (hostEl) renderDataVaultSheet(hostEl);
        else rerenderAcademyTab();
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
            domH('strong', { text: 'Multi-Part Archive (.txt) & Extra Spreadsheets (.csv)' }),
            domH('div', { class: 'bt-lab-btn-row' },
              domH('button', { type: 'button', class: 'bt-lab-btn is-primary', onclick: handleSaveEverything },
                ic('vault-shield', { size: 16 }), domH('span', { text: 'Save Everything Backup (.txt)' })),
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
              }, 'Export Cafes (.csv)')
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
                  if (typeof fn === 'function') await fn({ targetSchema: '7.6', forceManual: true });
                  statusLine.textContent = 'Captured verified manual safety snapshot ("latest-manual") of all your saved data!';
                  notify('Manual safety snapshot captured!');
                }
              }, 'Save Safety Snapshot Now'),
              makeRollbackBtn('latest-manual', 'Restore Manual Snapshot'),
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
      wm.textContent = 'BeanTelligence v7.6 — A little science, a lot of delicious.';
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
              Array.isArray(desc)
                ? domH('ul', { class: 'bt-lab-list' }, desc.map(function (ln) { return domH('li', { text: String(ln) }); }))
                : (desc ? domH('p', { text: String(desc) }) : null)
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
    cancelScaRaf();
    cancelSalamiRaf();
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
      shell.registerSheet('data-vault', renderDataVaultSheet, { title: 'Backup & Data Vault', detent: 'full' });
      shell.registerSheet('onboarding-tour', renderOnboardingTourSheet, { title: 'Interactive Feature Tour', detent: 'full' });
      shell.registerSheet('about-charter', renderAboutCharterSheet, { title: 'About BeanTelligence & Epistemic Charter', detent: 'full' });
      shell.registerSheet('sca-cupping', renderScaCuppingSheet, { title: '5-Bowl SCA/CVA Cupping Table', detent: 'full' });
    }
    if (typeof shell.registerRoute === 'function') {
      /* NOTE: Never register 'coffee' or 'loadshared' here — owned by Guided Home Brew in 02 & 05!
         Also never duplicate 'tour'/'guide'/'about' here: 02-shell-router-state.js ROUTE_MAP already
         maps them to 'onboarding-tour'/'about-charter' and opens BTSheet once cleanly. */
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
      shell.registerRoute('every', function () { jumpToAcademy('vault'); });
      shell.registerRoute('backup', function () { jumpToAcademy('vault'); });
      shell.registerRoute('files', function () { jumpToAcademy('vault'); });
    }
  }

  registerAcademyAndVaultBindings();

  /* Chain onto storage clear hook so external Clear Everything calls also reset Academy in-memory state */
  const _prevOnClearEverything = typeof window.__btOnClearEverything === 'function' ? window.__btOnClearEverything : null;
  window.__btOnClearEverything = function () {
    if (_prevOnClearEverything) {
      try { _prevOnClearEverything(); } catch (_) {}
    }
    try { resetAcademyInMemoryState(); } catch (_) {}
  };

  window.BTBackupCenter = {
    open: openSaveBackupCenterModal,
    close: function () {
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
    clampBowlCupDefects: clampBowlCupDefects,
    normalizeCvaTraitToIntensity5: normalizeCvaTraitToIntensity5,
    deriveLessonTier: deriveLessonTier,
    extractLessonFields: extractLessonFields,
    getQuizForLesson: getQuizForLesson,
    resetTriangleRound: resetTriangleRound,
    resetAcademyInMemoryState: resetAcademyInMemoryState,
    readAcademyState: readAcademyState,
    writeAcademyState: writeAcademyState,
    state: acadUi
  };
})();
