/* ==========================================================================
   BeanTelligence v6.2 — 02-shell-router-state.js
   DOM & SVG Hyperscript, Dual Independent Drafts + 3h Stale Reset,
   Experience Lens (Starter / Comfy / Scientist), Workflow & Tools Sheet,
   BTTimerAudio (Web Audio + SpeechSynthesis), 5-Step Brew Trail & Studio Aside
   ========================================================================== */

const SVG_NS = 'http://www.w3.org/2000/svg';
const SVG_TAGS = new Set([
  'svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'g',
  'defs', 'linearGradient', 'radialGradient', 'stop', 'text', 'tspan',
  'ellipse', 'symbol', 'use', 'mask', 'pattern', 'foreignObject'
]);

function escHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
  });
}

function $(id) {
  return typeof document !== 'undefined' ? document.getElementById(id) : null;
}

const kept = function() {
  const out = [];
  for (let i = 0; i < arguments.length; i++) {
    const v = arguments[i];
    if (v != null && v !== false) out.push(v);
  }
  return out;
};

function _appendKids(parent, item) {
  if (item == null || item === false || item === true) return;
  if (Array.isArray(item)) {
    for (let i = 0; i < item.length; i++) _appendKids(parent, item[i]);
    return;
  }
  if (typeof item === 'object') {
    if (item.nodeType) {
      parent.appendChild(item);
    }
    return;
  }
  if (typeof item === 'number') {
    if (!isFinite(item)) return;
    parent.appendChild(document.createTextNode(String(item)));
    return;
  }
  parent.appendChild(document.createTextNode(String(item)));
}

function h(tag, props) {
  const t = String(tag || 'div');
  const isSvg = SVG_TAGS.has(t);
  const el = isSvg ? document.createElementNS(SVG_NS, t) : document.createElement(t);

  if (props && typeof props === 'object') {
    for (const k in props) {
      if (!Object.prototype.hasOwnProperty.call(props, k)) continue;
      const v = props[k];
      if (v === false || v == null) continue;
      if (k === 'class' || k === 'className') {
        if (isSvg) el.setAttribute('class', String(v));
        else el.className = String(v);
      } else if (k === 'text') {
        el.textContent = (typeof v === 'number' && !isFinite(v)) ? '' : String(v);
      } else if (k === 'html' || k === 'innerHTML') {
        el.innerHTML = String(v);
      } else if (k === 'value' && !isSvg) {
        el.value = String(v);
      } else if (k === 'style' && typeof v === 'object') {
        for (const sk in v) {
          if (v[sk] != null) el.style.setProperty(sk.replace(/[A-Z]/g, function(m) { return '-' + m.toLowerCase(); }), String(v[sk]));
        }
      } else if (k === 'dataset' && typeof v === 'object') {
        for (const dk in v) {
          if (v[dk] != null && v[dk] !== false) el.dataset[dk] = String(v[dk]);
        }
      } else if (k.slice(0, 2) === 'on' && typeof v === 'function') {
        el.addEventListener(k.slice(2).toLowerCase(), v);
      } else if (v === true) {
        if (!isSvg && (k === 'disabled' || k === 'checked' || k === 'hidden' || k === 'selected' || k === 'readOnly')) {
          el[k] = true;
        } else {
          el.setAttribute(k, '');
        }
      } else {
        if (typeof v === 'number' && !isFinite(v)) continue;
        el.setAttribute(k, String(v));
      }
    }
  }

  for (let i = 2; i < arguments.length; i++) {
    _appendKids(el, arguments[i]);
  }
  return el;
}

function today() {
  const d = new Date();
  const p = function(n) { return String(n).padStart(2, '0'); };
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

function newId() {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  } catch (e) {}
  return 'c-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

const fmt2 = function(n) {
  const v = +n;
  return isFinite(v) ? (Math.round(v * 100) / 100).toFixed(2) : '0.00';
};

const fmtScore = function(v, kind) {
  const n = +v;
  if (!isFinite(n)) return '0.0';
  return (kind === 'sca_5cup' || kind === 'cva_affective' || kind == null) ? fmt2(n) : (Math.round(n * 10) / 10).toFixed(1);
};

const qualityLabel = function(v) {
  return v >= 9 ? 'Outstanding' : v >= 8 ? 'Excellent' : v >= 7 ? 'Very good' : 'Good';
};

/* ==================== DUAL INDEPENDENT DRAFTS & 3-HOUR STALE RESET ==================== */
const _SHELL_DRAFT_KEY = 'brew-and-cup-draft-v1';
const _SHELL_SHOP_DRAFT_KEY = 'brew-and-cup-shopdraft-v1';
const _SHELL_PREFS_MIRROR_KEY = 'brew-and-cup-prefs-mirror-v1';
const DRAFT_STALE_MS = 3 * 3600 * 1000;

const VALID_BREW_STEPS = ['door', 'coffee', 'method', 'brew', 'timer', 'taste'];

function normalizeBrewStep(step) {
  const s = String(step || '').trim().toLowerCase();
  if (s === 'start') return 'coffee';
  if (s === 'brewer') return 'method';
  if (s === 'recipe' || s === 'ready') return 'brew';
  if (s === 'tasting' || s === 'perfect' || s === 'cup' || s === 'cupping' || s === 'dial' || s === 'fix') return 'taste';
  return VALID_BREW_STEPS.indexOf(s) >= 0 ? s : 'door';
}

function _blankShopDraft() {
  return {
    on: false,
    step: 'shop',
    mode: 'pick',
    pickKey: '',
    name: '',
    shop: '',
    country: 'United States',
    region: '',
    city: '',
    from: '',
    kind: '',
    drink: '',
    menu: '',
    temp: '',
    size: '',
    amount: '',
    unit: 'oz',
    price: '',
    sym: '$',
    face: '',
    beans: 0,
    rating: 0,
    again: '',
    worth: '',
    notes: '',
    date: '',
    saved: '',
    at: 0,
    milk: '',
    shots: 0,
    flavor: '',
    how: '',
    strength: '',
    sweet: ''
  };
}

function _defaultToolModes() {
  if (typeof setupToolModesDefaults === 'function') return setupToolModesDefaults();
  return { scale: 'optional', refractometer: 'optional', agtron: 'optional', psd: 'optional', water: 'always', brewersFilter: 'all' };
}

function _defaultGear() {
  if (typeof setupDefaults === 'function') {
    try { return setupDefaults().gear; } catch (e) {}
  }
  return {
    grinderKey: '', grinderName: '', grinderType: '', waterType: '', waterAlk: '', waterGH: '',
    filter: '', altitudeFt: '', waterProfileKey: '', kettle: '', scale: '', ownedBrewers: ['v60', 'aeropress', 'switch', 'espresso'],
    ble: { preferredBrand: 'auto', autoStart: true, autoTare: true, captureYield: true, difluidEnabled: true, omniD10Um: null, omniD50Um: null, omniD90Um: null, omniSpan: null, omniDial: '', rememberedDevices: [] }
  };
}

function _defaultCva() {
  if (typeof cvaFresh === 'function') {
    try { return cvaFresh(); } catch (e) {}
  }
  return {
    score: { fragrance: null, aroma: null, flavor: null, aftertaste: null, acidity: null, sweetness: null, mouthfeel: null, overall: null },
    intensity: { fr: 0, ar: 0, fl: 0, af: 0, ac: 0, sw: 0, mf: 0 },
    cata: [], nonUniform: 0, defective: 0, defectKind: '', sym: '', retasted: false
  };
}

function _defaultCaffeine() {
  if (typeof caffeineClean === 'function') {
    try { return caffeineClean(null); } catch (e) {}
  }
  return { wake: '07:00', bed: '23:00', sensitivity: 'typical', weightKg: 70, drinks: [] };
}

function syncCoffeeAliases(c) {
  if (!c || typeof c !== 'object') return c;
  if (c.bag_notes == null || c.bag_notes === '') {
    const fallbackNotes = c.notes || c.bagNotes || (Array.isArray(c.flavors) ? c.flavors.join(', ') : c.flavors) || '';
    if (fallbackNotes && c.bag_notes == null) c.bag_notes = String(fallbackNotes);
  }
  c.notes = c.bag_notes != null ? String(c.bag_notes) : '';
  if (c.id && !c.coffee_id) c.coffee_id = c.id;
  else if (c.coffee_id && !c.id) c.id = c.coffee_id;
  if (c.farm_or_station && !c.farm) c.farm = c.farm_or_station;
  else if (c.farm && !c.farm_or_station) c.farm_or_station = c.farm;
  if (c.bag_weight_g !== '' && c.bag_weight_g != null) c.bagWeightG = c.bag_weight_g;
  else if (c.bagWeightG !== '' && c.bagWeightG != null) c.bag_weight_g = c.bagWeightG;
  if (c.price !== '' && c.price != null) c.bagPrice = c.price;
  else if (c.bagPrice !== '' && c.bagPrice != null) c.price = c.bagPrice;
  if (c.bag_notes && !/^(unknown|unsure|not sure|don't know|dont know)$/i.test(String(c.bag_notes).trim())) {
    c.notesUnsure = '';
  }
  return c;
}

function newCoffee() {
  return {
    id: newId(), coffee_id: '', name: '', roaster: '', roaster_location: '',
    origin: '', region: '', farm: '', farm_or_station: '', producer: '', harvest_year: '',
    varietal: '', species: 'arabica', blend: '',
    roast: '', agtron: '', bean_agtron: '', ground_agtron: '', agtron_scale: 'gourmet', roast_delta: '',
    psd_d10_um: '', psd_d50_um: '', psd_d90_um: '', psd_span: '',
    process: '', process_sub: '', process_details: '', decaf: '', decaf_process: '',
    density: '', elevText: '', elevation_m: '',
    roast_date: '', is_frozen: '', frozen_date: '', freeze_days_offset: '', recommended_rest_days: '',
    bag_notes: '', notes: '', personal_note: '',
    scanned: '', scannedFrom: '', nameUnsure: '', roastUnsure: '', processUnsure: '', originUnsure: '',
    dateUnsure: '', roasterUnsure: '', elevUnsure: '', notesUnsure: '',
    roast_unknown: '', process_unknown: '', origin_unknown: '', elev_unknown: '',
    answered: '', varietalUnsure: '', provenanceLabel: '',
    roasterGuide: null,
    bag_weight_g: '', bagWeightG: '', remaining_g: '',
    price: '', bagPrice: '', currency: 'USD'
  };
}

function newApp() {
  const a = {
    screen: 'door',
    activeTab: 'brew',
    brewStep: 'door',
    focusFix: false,
    recipeLocked: false,
    staleResetNotice: false,
    justSavedTasting: null,
    tabSegments: { brew: 'studio', cellar: 'shelf', lab: 'ey', palate: 'dna', academy: 'curriculum' },
    routeSub: '',
    resume: '',
    cupFor: '',
    tastingMode: 'quick',
    timerSave: null,
    coffee: newCoffee(),
    shopDraft: _blankShopDraft(),
    brew: {
      method: 'v60', style: '', subMode: '', water: 250, dose: 15, yieldOut: 0, bypass: 0,
      grind_setting: '', tempF: 200, tempC: 93, tempComp: false, preheated: true, brewerMaterial: 'plastic',
      altitudeFt: null, ratio: 16.7, agitation: 'standard', technique: 'standard',
      pulseTaste: 'balanced', pulseStrength: '', ice: 0.4, paragonSphere: false,
      waterType: '', filter: '', filterType: '', coldStyle: '', coldWhere: '',
      grinderType: '', grinderKey: '', grindEdited: false, grindMethod: '', grinderName: '',
      xbloomRpm: 80, waterAlk: '', waterGH: '', pourNotes: '', actualSecs: 0, actualFromTimer: false,
      machine: { drink: 'cappuccino', milk: 'whole', strength: 3, coffeeBar: 3, milkBar: 3, extraShot: false, preGround: false, cups: 1, profile: 'guest', temp: 'high', iceG: 150, ceramicStep: 5, sasShotsLeft: 0 },
      machineProfile: null
    },
    prefs: {
      waterUnit: 'g', coffeeUnit: 'g', tempUnit: 'F', elevUnit: 'm', theme: 'light',
      scienceLens: 'hybrid', experienceLens: 'comfy', immersionBasis: 'liang',
      cupMode: '', coachTips: true, palateSeed: null, toolModes: _defaultToolModes(),
      waterProfileKey: '', kettle: '', scale: '', ownedBrewers: ['v60', 'aeropress', 'switch', 'espresso'],
      seenCupHelp: false, seenTermHint: false, cupView: '', taste: '',
      timerAudioMode: 'voice', sound: 'voice', soundOff: false, coach: 'guide', level: 'comfortable',
      calib: {}, yieldCal: {}, caffeine: _defaultCaffeine(), roasterSites: {},
      brewerMaterials: {}, cryoTubes: [], pocketMicronCalib: null, philipsProfiles: {},
      gear: _defaultGear()
    },
    adjust: { grind: 0, ratio: 0, agit: '', tempC: 0 },
    gearOk: false,
    attempt: 0,
    dialMethod: '',
    dialNote: null,
    cupBrew: null,
    proto: { bowl: 150 },
    lastTotal: null,
    lastSymptom: '',
    lastReasons: []
  };
  if (typeof window !== 'undefined') window.__btPrefs = a.prefs;
  return a;
}

function newCup() {
  return {
    id: newId(),
    way: 'quick',
    mode: '',
    cupping_date: today(),
    otherNo: false,
    blindNotes: true,
    foilRevealed: false,
    goldenBellOn: false,
    excludeFromBayes: false,
    cooling: '',
    vesselType: 'ceramic',
    pad_xy: [0, 0],
    measuredTds: null,
    measuredEy: null,
    cva: _defaultCva(),
    desc: { fragrance: 0, aroma: 0, flavor: 0, aftertaste: 0, acidity: 3, sweetness: 4, body: 3, bitterness: 2, astringency: 1, clarity: 4 },
    vials: [],
    words: { fragrance_aroma: [], flavor: [], aftertaste: [], acidity: [], body: [] },
    kit: [],
    general_notes: '',
    stars: 0,
    quick: { make: '', sym: '', areas: {}, liked: [], notLiked: [] },
    vs: { acidity: '', body: '', sweetness: '' }
  };
}

let app = newApp();
let state = newCup();
const refreshers = [];
let draftAt = Date.now();
let _draftTimer = null;

/* In-App Navigation History Stack (max 30 entries) + Pre-Mutation Committed Snapshot */
const _NAV_HISTORY_MAX = 30;
const _navHistoryStack = [];
let _lastCommittedNav = null;
let _suppressHistoryPush = false;

function normalizeTheme(t) {
  return (t === 'light' || t === 'dark' || t === 'system') ? t : 'light';
}

function resolvedTheme(t) {
  const m = normalizeTheme(t);
  if (m === 'system') {
    try {
      return (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    } catch (e) {
      return 'light';
    }
  }
  return m;
}

function applyTheme(t) {
  const pref = normalizeTheme(t);
  const actual = resolvedTheme(pref);
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.setAttribute('data-theme', actual);
  }
  const ml = $('metaThemeLight');
  const md = $('metaThemeDark');
  if (ml && md) {
    if (pref === 'light') {
      ml.removeAttribute('media'); ml.setAttribute('content', '#FAF6F0');
      md.setAttribute('media', 'not all'); md.setAttribute('content', '#FAF6F0');
    } else if (pref === 'dark') {
      md.removeAttribute('media'); md.setAttribute('content', '#13100E');
      ml.setAttribute('media', 'not all'); ml.setAttribute('content', '#13100E');
    } else {
      ml.setAttribute('media', '(prefers-color-scheme: light)'); ml.setAttribute('content', '#FAF6F0');
      md.setAttribute('media', '(prefers-color-scheme: dark)'); md.setAttribute('content', '#13100E');
    }
  }
  try {
    if (typeof window !== 'undefined' && window.BTPlatform && window.BTPlatform.theme && typeof window.BTPlatform.theme.sync === 'function') {
      window.BTPlatform.theme.sync(actual);
    }
  } catch (e) {}
}

/* ==================== EXPERIENCE LENS NORMALIZATION (ROUND-TRIP SAFE) ==================== */
function normalizeExperienceLevel(m) {
  if (m === 'scientist' || m === 'xray' || m === 'expert' || m === 'on' || m === true) return 'scientist';
  if (m === 'starter' || m === 'surface' || m === 'new') return 'starter';
  if (m === 'comfy' || m === 'hybrid' || m === 'comfortable') return 'comfy';
  return 'comfy';
}

function normalizeScienceLens(m) {
  const lvl = normalizeExperienceLevel(m);
  if (lvl === 'scientist') return 'xray';
  if (lvl === 'starter') return 'surface';
  return 'hybrid';
}

function normalizeTimerAudioMode(m) {
  const s = String(m == null ? '' : m).trim().toLowerCase();
  if (s === 'silent' || s === 'off' || s === 'mute' || s === 'muted') return 'silent';
  if (s === 'chimes' || s === 'chime' || s === 'beep' || s === 'pips') return 'chimes';
  return 'voice';
}

function hydratePrefsInto(dst, sp) {
  if (!sp || typeof sp !== 'object') return;
  if (typeof sp.waterUnit === 'string' && sp.waterUnit.length <= 10) dst.waterUnit = sp.waterUnit;
  if (typeof sp.coffeeUnit === 'string' && sp.coffeeUnit.length <= 10) dst.coffeeUnit = sp.coffeeUnit;
  if (sp.tempUnit === 'C' || sp.tempUnit === 'F') dst.tempUnit = sp.tempUnit;
  if (sp.elevUnit === 'm' || sp.elevUnit === 'ft') dst.elevUnit = sp.elevUnit;
  if (sp.theme) dst.theme = normalizeTheme(sp.theme);

  /* Round-trip safe Experience Lens hydration across scienceLens, experienceLens & level */
  let resolvedLvl = '';
  if (sp.experienceLens === 'starter' || sp.experienceLens === 'comfy' || sp.experienceLens === 'scientist') {
    resolvedLvl = sp.experienceLens;
  } else if (typeof sp.scienceLens === 'string' && sp.scienceLens.trim() !== '') {
    resolvedLvl = normalizeExperienceLevel(sp.scienceLens);
  } else if (sp.scienceLens === true) {
    resolvedLvl = 'scientist';
  } else if (sp.level === 'new') {
    resolvedLvl = 'starter';
  } else if (sp.level === 'expert') {
    resolvedLvl = 'scientist';
  } else if (sp.level === 'comfortable') {
    resolvedLvl = 'comfy';
  }
  if (resolvedLvl) {
    dst.experienceLens = resolvedLvl;
    dst.scienceLens = normalizeScienceLens(resolvedLvl);
    dst.level = resolvedLvl === 'scientist' ? 'expert' : (resolvedLvl === 'starter' ? 'new' : 'comfortable');
  }

  if (sp.immersionBasis === 'liang' || sp.immersionBasis === 'gagne') dst.immersionBasis = sp.immersionBasis;
  if (['', 'quick', 'guided', 'cva'].indexOf(sp.cupMode) >= 0) dst.cupMode = sp.cupMode;
  if (typeof sp.coachTips === 'boolean') dst.coachTips = sp.coachTips;
  if (sp.palateSeed && typeof sp.palateSeed === 'object' && !Array.isArray(sp.palateSeed)) dst.palateSeed = sp.palateSeed;
  if (typeof sp.waterProfileKey === 'string') dst.waterProfileKey = sp.waterProfileKey.slice(0, 40);
  if (typeof sp.kettle === 'string') dst.kettle = sp.kettle.slice(0, 80);
  if (typeof sp.scale === 'string') dst.scale = sp.scale.slice(0, 80);
  if (Array.isArray(sp.ownedBrewers)) dst.ownedBrewers = sp.ownedBrewers.filter(function(x) { return typeof x === 'string'; }).slice(0, 24);
  if (typeof sp.seenCupHelp === 'boolean') dst.seenCupHelp = sp.seenCupHelp;
  if (typeof sp.seenTermHint === 'boolean') dst.seenTermHint = sp.seenTermHint;
  if (sp.cupView === 'compact' || sp.cupView === 'full') dst.cupView = sp.cupView;
  if (sp.taste === 'quickonly' || sp.taste === 'cuppingfirst') dst.taste = sp.taste;

  /* Round-trip safe Timer Audio Mode hydration */
  if (typeof sp.timerAudioMode === 'string' && sp.timerAudioMode.trim()) {
    dst.timerAudioMode = normalizeTimerAudioMode(sp.timerAudioMode);
  } else if (sp.soundOff === true || sp.sound === 'off') {
    dst.timerAudioMode = 'silent';
  } else if (sp.sound === 'chime' || sp.sound === 'chimes') {
    dst.timerAudioMode = 'chimes';
  } else if (sp.sound === 'voice') {
    dst.timerAudioMode = 'voice';
  }
  dst.sound = dst.timerAudioMode === 'silent' ? 'off' : (dst.timerAudioMode === 'chimes' ? 'chime' : 'voice');
  dst.soundOff = dst.timerAudioMode === 'silent';

  if (['guide', 'steps'].indexOf(sp.coach) >= 0) dst.coach = sp.coach;
  if (sp.calib && typeof sp.calib === 'object') dst.calib = typeof calibClean === 'function' ? calibClean(sp.calib) : sp.calib;
  if (sp.yieldCal && typeof sp.yieldCal === 'object') dst.yieldCal = typeof yieldClean === 'function' ? yieldClean(sp.yieldCal) : sp.yieldCal;
  if (sp.caffeine && typeof sp.caffeine === 'object') dst.caffeine = typeof caffeineClean === 'function' ? caffeineClean(sp.caffeine) : Object.assign(_defaultCaffeine(), sp.caffeine);
  if (sp.toolModes && typeof sp.toolModes === 'object') {
    dst.toolModes = typeof cleanToolModes === 'function' ? cleanToolModes(sp.toolModes) : Object.assign(_defaultToolModes(), sp.toolModes);
  }
  if (sp.gear && typeof sp.gear === 'object') {
    if (typeof setupClean === 'function') {
      try {
        const cleaned = setupClean({ gear: sp.gear }, typeof setupCtx === 'function' ? setupCtx() : {});
        if (cleaned && cleaned.gear) dst.gear = cleaned.gear;
      } catch (e) {
        dst.gear = Object.assign(_defaultGear(), sp.gear);
      }
    } else {
      dst.gear = Object.assign(_defaultGear(), sp.gear);
    }
  }
  if (sp.roasterSites && typeof sp.roasterSites === 'object' && !Array.isArray(sp.roasterSites)) dst.roasterSites = Object.assign({}, sp.roasterSites);
  if (sp.brewerMaterials && typeof sp.brewerMaterials === 'object') dst.brewerMaterials = Object.assign({}, sp.brewerMaterials);
  if (Array.isArray(sp.cryoTubes)) dst.cryoTubes = sp.cryoTubes.slice(0, 64);
  if (sp.pocketMicronCalib && typeof sp.pocketMicronCalib === 'object') dst.pocketMicronCalib = sp.pocketMicronCalib;
  if (sp.philipsProfiles && typeof sp.philipsProfiles === 'object') dst.philipsProfiles = Object.assign({}, sp.philipsProfiles);
}

/* ==================== ISOLATED CAFE SHOP DRAFT HELPERS ==================== */
function _shellLoadShopDraft() {
  let sd = _blankShopDraft();
  try {
    if (typeof window !== 'undefined' && window.BTStorage && typeof window.BTStorage.loadShopDraft === 'function') {
      const vaultSd = window.BTStorage.loadShopDraft();
      if (vaultSd && typeof vaultSd === 'object' && vaultSd.on) {
        sd = Object.assign(sd, vaultSd, { on: true });
      }
    } else if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(_SHELL_SHOP_DRAFT_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && typeof parsed === 'object' && parsed.on !== false) {
        sd = Object.assign(sd, parsed, { on: true });
      }
    }
  } catch (e) {}
  if (sd.shop && !sd.name) sd.name = sd.shop;
  if (sd.name && !sd.shop) sd.shop = sd.name;
  if (sd.drink && !sd.kind) sd.kind = sd.drink;
  if (sd.kind && !sd.drink) sd.drink = sd.kind;
  if (app) app.shopDraft = sd;
  return sd;
}

function saveShopDraft(nextDraft) {
  const base = (app && app.shopDraft && typeof app.shopDraft === 'object') ? app.shopDraft : _blankShopDraft();
  const merged = Object.assign(_blankShopDraft(), base, (nextDraft && typeof nextDraft === 'object') ? nextDraft : {});
  if (merged.shop && !merged.name) merged.name = merged.shop;
  if (merged.name && !merged.shop) merged.shop = merged.name;
  if (merged.drink && !merged.kind) merged.kind = merged.drink;
  if (merged.kind && !merged.drink) merged.drink = merged.kind;
  merged.on = (nextDraft && nextDraft.on === false) ? false : true;
  merged.at = Date.now();

  if (app) app.shopDraft = merged;
  try {
    if (typeof window !== 'undefined' && window.BTStorage && typeof window.BTStorage.saveShopDraft === 'function') {
      window.BTStorage.saveShopDraft(merged);
    } else if (typeof localStorage !== 'undefined') {
      if (merged.on) localStorage.setItem(_SHELL_SHOP_DRAFT_KEY, JSON.stringify(merged));
      else localStorage.removeItem(_SHELL_SHOP_DRAFT_KEY);
    }
  } catch (e) {}
  paintStudioAside();
  return merged;
}

function resetShopDraft() {
  const blank = _blankShopDraft();
  blank.on = false;
  if (app) app.shopDraft = blank;
  try {
    if (typeof window !== 'undefined' && window.BTStorage && typeof window.BTStorage.saveShopDraft === 'function') {
      window.BTStorage.saveShopDraft(blank);
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(_SHELL_SHOP_DRAFT_KEY);
    }
  } catch (e) {}
  paintStudioAside();
  return blank;
}

/* ==================== HOME BREW DRAFT + 3-HOUR STALE RESET ==================== */
function loadDraft() {
  let restored = false;
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(_SHELL_DRAFT_KEY) : null;
    const d = raw ? JSON.parse(raw) : null;
    if (d && d.app && typeof d.app === 'object') {
      const a = newApp();
      const src = d.app;
      if (src.coffee && typeof src.coffee === 'object') {
        Object.keys(src.coffee).forEach(function(k) {
          const val = src.coffee[k];
          if (val == null) return;
          if (k === 'roasterGuide' && typeof val === 'object') {
            try { a.coffee.roasterGuide = JSON.parse(JSON.stringify(val)); } catch (e) { a.coffee.roasterGuide = Object.assign({}, val); }
          } else if (Array.isArray(val)) {
            a.coffee[k] = val.slice();
          } else if (typeof val === 'object') {
            try { a.coffee[k] = JSON.parse(JSON.stringify(val)); } catch (e) { a.coffee[k] = Object.assign({}, val); }
          } else if (typeof val === 'number') {
            if (isFinite(val)) a.coffee[k] = val;
          } else if (typeof val === 'boolean') {
            a.coffee[k] = val;
          } else if (typeof val === 'string') {
            a.coffee[k] = val.slice(0, 2000);
          }
        });
        if (!a.coffee.bag_notes && (a.coffee.notes || a.coffee.bagNotes || (Array.isArray(a.coffee.flavors) && a.coffee.flavors.length))) {
          a.coffee.bag_notes = Array.isArray(a.coffee.flavors) ? a.coffee.flavors.join(', ') : String(a.coffee.notes || a.coffee.bagNotes || '');
        }
        syncCoffeeAliases(a.coffee);
      }
      if (src.brew && typeof src.brew === 'object') {
        Object.assign(a.brew, src.brew);
        if (src.brew.machine && typeof src.brew.machine === 'object') {
          a.brew.machine = Object.assign(newApp().brew.machine, src.brew.machine);
        }
        a.brew.water = +src.brew.water > 0 ? +src.brew.water : a.brew.water;
        a.brew.dose = +src.brew.dose > 0 ? +src.brew.dose : a.brew.dose;
        if (+a.brew.grind_um > 0 && !(+a.brew.grindUm > 0)) a.brew.grindUm = +a.brew.grind_um;
        if (+a.brew.grindUm > 0 && !(+a.brew.grind_um > 0)) a.brew.grind_um = +a.brew.grindUm;
        if (!(+a.brew.tempC > 0) && +a.brew.tempF > 0) a.brew.tempC = Math.round(((+a.brew.tempF - 32) * 5 / 9) * 2) / 2;
        if (!a.brew.method) a.brew.method = 'v60';
      }
      if (src.prefs) hydratePrefsInto(a.prefs, src.prefs);
      if (src.adjust && typeof src.adjust === 'object') {
        a.adjust = {
          grind: +src.adjust.grind || 0,
          ratio: +src.adjust.ratio || 0,
          agit: ['gentle', 'active'].indexOf(src.adjust.agit) >= 0 ? src.adjust.agit : '',
          tempC: +src.adjust.tempC || 0
        };
      }
      a.attempt = +src.attempt || 0;
      a.freshCoffeeMode = src.freshCoffeeMode === true;
      a.gearOk = src.gearOk === true;
      a.recipeLocked = src.recipeLocked === true;
      a.lockedMethod = typeof src.lockedMethod === 'string' ? src.lockedMethod : '';
      a.provenanceLabel = typeof src.provenanceLabel === 'string' ? src.provenanceLabel : '';
      a.focusFix = src.focusFix === true;
      a.dialMethod = typeof src.dialMethod === 'string' ? src.dialMethod : '';
      a.dialNote = (src.dialNote && typeof src.dialNote === 'object') ? src.dialNote : null;
      a.cupBrew = (src.cupBrew && typeof src.cupBrew === 'object') ? src.cupBrew : null;
      if (src.proto && +src.proto.bowl > 0) a.proto = { bowl: +src.proto.bowl };
      if (typeof src.cupFor === 'string') a.cupFor = src.cupFor.slice(0, 80);
      if (typeof src.tastingMode === 'string') a.tastingMode = src.tastingMode;
      if (typeof src.activeTab === 'string' && TAB_DEFS[src.activeTab]) a.activeTab = src.activeTab;
      if (src.tabSegments && typeof src.tabSegments === 'object') {
        Object.assign(a.tabSegments, src.tabSegments);
      }
      if (typeof src.screen === 'string' && src.screen) a.screen = src.screen;
      if (typeof src.brewStep === 'string' && src.brewStep) {
        a.brewStep = normalizeBrewStep(src.brewStep);
      } else if (a.activeTab === 'brew' && a.screen) {
        a.brewStep = normalizeBrewStep(a.screen);
      }
      if (typeof src.lastTotal === 'number' && isFinite(src.lastTotal)) a.lastTotal = src.lastTotal;
      if (typeof src.lastSymptom === 'string') a.lastSymptom = src.lastSymptom;
      if (Array.isArray(src.lastReasons)) a.lastReasons = src.lastReasons.slice(0, 6);

      const savedAt = (isFinite(+d.at) && +d.at > 0) ? +d.at : Date.now();
      draftAt = savedAt;

      /* 3-Hour Stale Draft Auto-Reset: return to 'door' while keeping saved bag & gear 100% intact */
      if ((Date.now() - savedAt) > DRAFT_STALE_MS) {
        if (a.brewStep !== 'door' || (a.activeTab === 'brew' && a.screen !== 'door')) {
          a.brewStep = 'door';
          a.screen = 'door';
          a.activeTab = 'brew';
          a.focusFix = false;
          a.timerSave = null;
          a.staleResetNotice = true;
        }
      }

      app = a;
      restored = true;

      const cupSrc = (d.cup && typeof d.cup === 'object') ? d.cup : ((d.state && typeof d.state === 'object') ? d.state : null);
      if (cupSrc) {
        const c = newCup();
        ['id', 'cupping_date', 'general_notes', 'mode', 'cooling', 'vesselType'].forEach(function(k) {
          if (typeof cupSrc[k] === 'string') c[k] = cupSrc[k];
        });
        if (typeof cupSrc.blindNotes === 'boolean') c.blindNotes = cupSrc.blindNotes;
        if (typeof cupSrc.foilRevealed === 'boolean') c.foilRevealed = cupSrc.foilRevealed;
        if (typeof cupSrc.goldenBellOn === 'boolean') c.goldenBellOn = cupSrc.goldenBellOn;
        if (typeof cupSrc.excludeFromBayes === 'boolean') c.excludeFromBayes = cupSrc.excludeFromBayes;
        c.way = cupSrc.way === 'cup' ? 'cup' : cupSrc.way === 'guided' ? 'guided' : 'quick';
        c.stars = isFinite(+cupSrc.stars) ? Math.max(0, Math.min(5, Math.round(+cupSrc.stars * 4) / 4)) : 0;
        if (Array.isArray(cupSrc.pad_xy) && cupSrc.pad_xy.length === 2 && isFinite(+cupSrc.pad_xy[0]) && isFinite(+cupSrc.pad_xy[1])) {
          c.pad_xy = [Math.max(-1, Math.min(1, +cupSrc.pad_xy[0])), Math.max(-1, Math.min(1, +cupSrc.pad_xy[1]))];
        }
        if (isFinite(+cupSrc.measuredTds) && +cupSrc.measuredTds > 0) c.measuredTds = +cupSrc.measuredTds;
        if (isFinite(+cupSrc.measuredEy) && +cupSrc.measuredEy > 0) c.measuredEy = +cupSrc.measuredEy;
        if (cupSrc.desc && typeof cupSrc.desc === 'object') {
          Object.keys(c.desc).forEach(function(k) {
            const v = +cupSrc.desc[k];
            if (isFinite(v) && v >= 0 && v <= 15) c.desc[k] = v;
          });
        }
        if (cupSrc.vs && typeof cupSrc.vs === 'object') Object.assign(c.vs, cupSrc.vs);
        if (cupSrc.quick && typeof cupSrc.quick === 'object') {
          c.quick.make = typeof cupSrc.quick.make === 'string' ? cupSrc.quick.make : '';
          c.quick.sym = typeof cupSrc.quick.sym === 'string' ? cupSrc.quick.sym : '';
          if (cupSrc.quick.areas && typeof cupSrc.quick.areas === 'object') Object.assign(c.quick.areas, cupSrc.quick.areas);
          if (Array.isArray(cupSrc.quick.liked)) c.quick.liked = cupSrc.quick.liked.filter(function(x) { return typeof x === 'string'; });
          if (Array.isArray(cupSrc.quick.notLiked)) c.quick.notLiked = cupSrc.quick.notLiked.filter(function(x) { return typeof x === 'string'; });
        }
        if (Array.isArray(cupSrc.vials)) c.vials = cupSrc.vials.filter(function(x) { return typeof x === 'string'; });
        if (cupSrc.words && typeof cupSrc.words === 'object') {
          ['fragrance_aroma', 'flavor', 'aftertaste', 'acidity', 'body'].forEach(function(k) {
            if (Array.isArray(cupSrc.words[k])) c.words[k] = cupSrc.words[k].filter(function(x) { return typeof x === 'string'; }).slice(0, 30);
          });
        }
        if (Array.isArray(cupSrc.kit)) c.kit = cupSrc.kit.filter(function(n) { return Number.isInteger(n) && n >= 1 && n <= 36; });
        if (cupSrc.cva && typeof cupSrc.cva === 'object') {
          c.cva = typeof cvaClean === 'function' ? cvaClean(cupSrc.cva) : Object.assign(_defaultCva(), cupSrc.cva);
        }
        state = c;
      }
    }
  } catch (e) {}

  /* Always overlay PREFS_MIRROR_KEY if present so explicit lens/audio prefs survive across fresh drafts */
  try {
    const mRaw = typeof localStorage !== 'undefined' ? localStorage.getItem(_SHELL_PREFS_MIRROR_KEY) : null;
    if (mRaw) {
      const parsedMirror = JSON.parse(mRaw);
      if (!restored) {
        hydratePrefsInto(app.prefs, parsedMirror);
      } else if (parsedMirror && typeof parsedMirror === 'object') {
        if (parsedMirror.experienceLens || parsedMirror.scienceLens || parsedMirror.level) {
          hydratePrefsInto(app.prefs, {
            experienceLens: parsedMirror.experienceLens,
            scienceLens: parsedMirror.scienceLens,
            level: parsedMirror.level,
            timerAudioMode: parsedMirror.timerAudioMode,
            sound: parsedMirror.sound,
            soundOff: parsedMirror.soundOff
          });
        }
      }
    }
  } catch (e) {}

  /* Hydrate Cafe Shop Draft 100% independently */
  _shellLoadShopDraft();
  _navHistoryStack.length = 0;
  _lastCommittedNav = null;

  if (typeof window !== 'undefined') {
    window.__btPrefs = app.prefs;
    window.__btApp = app;
    window.__btState = state;
  }
  applyTheme(app.prefs.theme);
  BTScienceLens.applyDom(app.prefs.scienceLens);
  _syncToolModeDom();
}

function writePrefsMirror() {
  if (!app || !app.prefs) return;
  try {
    let payload = Object.assign({}, app.prefs);
    if (typeof window !== 'undefined' && window.BTStorage && typeof window.BTStorage.cleanFullPrefs === 'function') {
      payload = Object.assign(
        {},
        window.BTStorage.cleanFullPrefs(app.prefs),
        {
          scienceLens: normalizeScienceLens(app.prefs.experienceLens || app.prefs.scienceLens),
          experienceLens: normalizeExperienceLevel(app.prefs.experienceLens || app.prefs.scienceLens),
          level: app.prefs.level,
          timerAudioMode: normalizeTimerAudioMode(app.prefs.timerAudioMode)
        }
      );
    }
    localStorage.setItem(_SHELL_PREFS_MIRROR_KEY, JSON.stringify(payload));
  } catch (e) {}
}

function writeDraftStores() {
  try {
    if (app && app.coffee) syncCoffeeAliases(app.coffee);
    /* Exclude shopDraft & ephemeral justSavedTasting from Home Draft JSON so drafts stay isolated */
    const homeAppCopy = Object.assign({}, app);
    delete homeAppCopy.shopDraft;
    delete homeAppCopy.justSavedTasting;
    localStorage.setItem(_SHELL_DRAFT_KEY, JSON.stringify({ app: homeAppCopy, cup: state, state: state, at: draftAt }));
  } catch (e) {}
  writePrefsMirror();
  if (typeof window !== 'undefined') {
    window.__btPrefs = app.prefs;
    window.__btApp = app;
    window.__btState = state;
  }
}

function scheduleDraft() {
  if (app && app.coffee) syncCoffeeAliases(app.coffee);
  draftAt = Date.now();
  clearTimeout(_draftTimer);
  _draftTimer = setTimeout(writeDraftStores, 200);
}

function flushDraft() {
  clearTimeout(_draftTimer);
  writeDraftStores();
}

function refreshAll() {
  for (let i = 0; i < refreshers.length; i++) {
    try { refreshers[i](); } catch (e) {}
  }
  paintChrome();
  paintStudioAside();
}

function changed() {
  if (app && app.coffee) syncCoffeeAliases(app.coffee);
  refreshAll();
  scheduleDraft();
}

function resetAll(opts) {
  opts = opts || {};
  const prefs = app.prefs;
  const preservedShop = app.shopDraft;
  _navHistoryStack.length = 0;
  _lastCommittedNav = null;
  try {
    if (typeof window !== 'undefined' && window.BTBrewStudio && typeof window.BTBrewStudio.resetTimerSession === 'function') {
      window.BTBrewStudio.resetTimerSession();
    }
    if (typeof window !== 'undefined' && window.BTTasteStep && typeof window.BTTasteStep.resetSession === 'function') {
      window.BTTasteStep.resetSession();
    }
  } catch (e) {}
  app = newApp();
  app.prefs = prefs;
  app.freshCoffeeMode = opts.freshCoffeeMode !== false;
  if (opts.targetBrewStep) {
    app.brewStep = opts.targetBrewStep;
    app.screen = opts.targetBrewStep;
  }
  app.shopDraft = preservedShop || _blankShopDraft();
  state = newCup();
  applyTheme(app.prefs.theme);
  BTScienceLens.applyDom(app.prefs.scienceLens);
  _syncToolModeDom();
  render();
}

function freshAll(opts) {
  draftAt = Date.now();
  resetAll(opts);
  flushDraft();
}

/* ==================== WORKFLOW SENSOR & TOOL MODES ==================== */
function btEnsureToolModes() {
  if (!app || !app.prefs) return _defaultToolModes();
  app.prefs.toolModes = typeof cleanToolModes === 'function'
    ? cleanToolModes(app.prefs.toolModes)
    : Object.assign(_defaultToolModes(), app.prefs.toolModes || {});
  return app.prefs.toolModes;
}

function _syncToolModeDom() {
  if (typeof document === 'undefined' || !document.documentElement) return;
  const tm = btEnsureToolModes();
  document.documentElement.setAttribute('data-brewers-filter', tm.brewersFilter === 'owned' ? 'owned' : 'all');
  ['scale', 'refractometer', 'agtron', 'psd', 'water'].forEach(function(k) {
    document.documentElement.setAttribute('data-tool-' + k, tm[k] || 'optional');
  });
}

function btToolMode(key) {
  const tm = btEnsureToolModes();
  const k = String(key || '').trim();
  if (k === 'brewersFilter') return tm.brewersFilter === 'owned' ? 'owned' : 'all';
  if (k in tm) return tm[k];
  return 'optional';
}

function btSetToolMode(key, mode) {
  const tm = btEnsureToolModes();
  const k = String(key || '').trim();
  if (k === 'brewersFilter') {
    tm.brewersFilter = mode === 'owned' ? 'owned' : 'all';
  } else if (['scale', 'refractometer', 'agtron', 'psd', 'water'].indexOf(k) >= 0) {
    if (mode === 'always' || mode === 'optional' || mode === 'off') tm[k] = mode;
    if (k === 'refractometer' && app.prefs.gear && app.prefs.gear.ble) {
      app.prefs.gear.ble.difluidEnabled = tm.refractometer !== 'off';
    }
  }
  _syncToolModeDom();
  writePrefsMirror();
  scheduleDraft();
  paintChrome();
  paintStudioAside();
  return btToolMode(k);
}

/* ==================== EXPERIENCE LENS (STARTER | COMFY | SCIENTIST) & LOUPE ==================== */
const BTScienceLens = (function() {
  const listeners = new Set();
  let loupeOpen = false;

  const TIER_META = {
    verified_physics:      { label: 'Verified Science',    cls: 'bt-ep-verified', icon: 'epistemic-verified' },
    calibrated_biophysics: { label: 'Active Research',     cls: 'bt-ep-research', icon: 'epistemic-research' },
    nuanced_research:      { label: 'Active Research',     cls: 'bt-ep-research', icon: 'epistemic-research' },
    active_research:       { label: 'Active Research',     cls: 'bt-ep-research', icon: 'epistemic-research' },
    craft_convention:      { label: 'Craft Best Practice', cls: 'bt-ep-craft',    icon: 'epistemic-craft' },
    myth_debunked:         { label: 'Myth Debunked',       cls: 'bt-ep-myth',     icon: 'epistemic-myth' }
  };

  function level() {
    if (!app || !app.prefs) return 'comfy';
    return normalizeExperienceLevel(app.prefs.experienceLens || app.prefs.scienceLens || app.prefs.level || 'comfy');
  }

  function mode() {
    return normalizeScienceLens(level());
  }

  function label() {
    const lv = level();
    return lv === 'scientist' ? 'Bean Scientist' : (lv === 'starter' ? 'Just Starting' : 'Comfy Brewer');
  }

  function applyDom(m) {
    const lv = normalizeExperienceLevel(m != null ? m : level());
    const sci = normalizeScienceLens(lv);
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.setAttribute('data-science-lens', sci);
      document.documentElement.setAttribute('data-lens', lv);
    }
  }

  function setMode(m, opts) {
    opts = opts || {};
    const lv = normalizeExperienceLevel(m);
    const sci = normalizeScienceLens(lv);
    if (app && app.prefs) {
      app.prefs.experienceLens = lv;
      app.prefs.scienceLens = sci;
      app.prefs.level = lv === 'scientist' ? 'expert' : (lv === 'starter' ? 'new' : 'comfortable');
    }
    applyDom(lv);
    try {
      if (!opts.silent && typeof window !== 'undefined' && window.BTHaptics && typeof window.BTHaptics.tick === 'function') {
        window.BTHaptics.tick();
      }
    } catch (e) {}
    writePrefsMirror();
    scheduleDraft();
    listeners.forEach(function(fn) {
      try { fn(sci, lv); } catch (e) {}
    });
    if (opts.silent || opts.noRender) {
      paintChrome();
      paintStudioAside();
    } else {
      render();
    }
    return sci;
  }

  function setLevel(m, opts) {
    setMode(m, opts);
    return level();
  }

  function cycle() {
    const lv = level();
    return setMode(lv === 'starter' ? 'comfy' : (lv === 'comfy' ? 'scientist' : 'starter'));
  }

  function toggle() {
    return setMode(level() === 'scientist' ? 'comfy' : 'scientist');
  }

  function subscribe(fn) {
    if (typeof fn !== 'function') return function() {};
    listeners.add(fn);
    return function() { listeners.delete(fn); };
  }

  function epistemicBadge(tierKey, citations) {
    const info = TIER_META[tierKey] || TIER_META.craft_convention;
    const citeStr = Array.isArray(citations) && citations.length ? citations.join('; ') : (typeof citations === 'string' ? citations : '');
    return h('span', { class: 'bt-ep-badge ' + info.cls, title: citeStr || info.label },
      BTIcons.el(info.icon, { size: 13 }),
      h('span', { text: info.label })
    );
  }

  function showLoupe(rect, xrayContent, meta) {
    const host = $('xray-loupe');
    if (!host) return;
    meta = meta || {};
    host.textContent = '';

    const head = h('div', { class: 'bt-loupe-head' },
      h('span', null, BTIcons.el('xray-loupe', { size: 14 }), ' ', meta.title || 'Bean Scientist Peek'),
      meta.epistemicTier ? epistemicBadge(meta.epistemicTier, meta.citations) : null
    );
    const body = h('div', { class: 'bt-loupe-body' });
    const resolved = typeof xrayContent === 'function' ? xrayContent() : xrayContent;
    if (resolved && resolved.nodeType) body.appendChild(resolved.cloneNode(true));
    else body.textContent = String(resolved == null ? '' : resolved);

    host.appendChild(head);
    host.appendChild(body);
    if (meta.citations) {
      const citeTxt = Array.isArray(meta.citations) ? meta.citations.join(' · ') : String(meta.citations);
      if (citeTxt) host.appendChild(h('div', { class: 'bt-loupe-cite', text: citeTxt }));
    }

    host.hidden = false;
    const vw = window.innerWidth || 390;
    const vh = window.innerHeight || 844;
    const w = Math.min(340, vw - 24);
    const cx = rect ? (rect.left + rect.width / 2) : (vw / 2);
    const left = Math.max(12, Math.min(vw - w - 12, cx - w / 2));
    const preferredTop = rect ? (rect.top - 12) : (vh * 0.35);
    host.style.width = w + 'px';
    host.style.left = left + 'px';

    const measuredH = host.offsetHeight || 110;
    const top = preferredTop - measuredH > 12 ? (preferredTop - measuredH) : Math.min(vh - measuredH - 16, (rect ? rect.bottom + 12 : 80));
    host.style.top = Math.max(12, top) + 'px';
    host.classList.add('is-open');
    loupeOpen = true;
    try {
      if (window.BTHaptics && window.BTHaptics.tick) window.BTHaptics.tick();
    } catch (e) {}
  }

  function hideLoupe() {
    if (!loupeOpen) return;
    loupeOpen = false;
    const host = $('xray-loupe');
    if (!host) return;
    host.classList.remove('is-open');
    host.hidden = true;
  }

  function bindHoldPeek(el, xrayContentOrFn, meta) {
    if (!el || !el.addEventListener) return el;
    el.setAttribute('data-hold-peek', '1');
    let holdTimer = null;
    let startX = 0;
    let startY = 0;
    let pinchStartDist = 0;

    function clearHold() {
      if (holdTimer) {
        clearTimeout(holdTimer);
        holdTimer = null;
      }
    }

    el.addEventListener('pointerdown', function(e) {
      if (e.button && e.button !== 0) return;
      startX = e.clientX;
      startY = e.clientY;
      clearHold();
      holdTimer = setTimeout(function() {
        holdTimer = null;
        showLoupe(el.getBoundingClientRect(), xrayContentOrFn, meta);
      }, 350);
    });

    el.addEventListener('pointermove', function(e) {
      if (!holdTimer) return;
      if (Math.hypot(e.clientX - startX, e.clientY - startY) > 8) {
        clearHold();
      }
    });

    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function(ev) {
      el.addEventListener(ev, function() {
        clearHold();
        hideLoupe();
      });
    });

    el.addEventListener('touchstart', function(e) {
      if (e.touches && e.touches.length === 2) {
        clearHold();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchStartDist = Math.hypot(dx, dy);
      }
    }, { passive: true });

    el.addEventListener('touchmove', function(e) {
      if (pinchStartDist > 0 && e.touches && e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        if (dist - pinchStartDist > 28) {
          pinchStartDist = 0;
          showLoupe(el.getBoundingClientRect(), xrayContentOrFn, meta);
        }
      }
    }, { passive: true });

    el.addEventListener('touchend', function() {
      pinchStartDist = 0;
      hideLoupe();
    }, { passive: true });

    return el;
  }

  function wrap(surfaceEl, xrayEl, meta) {
    meta = meta || {};
    const surfNode = (surfaceEl && surfaceEl.nodeType) ? surfaceEl : h('span', { text: String(surfaceEl == null ? '' : surfaceEl) });
    const xrayInner = (xrayEl && xrayEl.nodeType) ? xrayEl : h('span', { class: 'mono', text: String(xrayEl == null ? '' : xrayEl) });
    const xrayBox = h('div', { class: 'bt-lens-xray' + (meta.showInHybrid ? ' bt-lens-hybrid-show' : '') },
      meta.epistemicTier ? h('div', { style: 'margin-bottom:4px' }, epistemicBadge(meta.epistemicTier, meta.citations)) : null,
      xrayInner
    );
    const box = h('div', { class: 'bt-lens-wrap' + (meta.cls ? ' ' + meta.cls : '') },
      h('div', { class: 'bt-lens-surface' }, surfNode),
      xrayBox
    );
    bindHoldPeek(box, function() { return xrayInner; }, meta);
    return box;
  }

  function atom(pairObj, opts) {
    pairObj = pairObj || {};
    opts = opts || {};
    return wrap(pairObj.human || '', pairObj.scientist || '', {
      epistemicTier: pairObj.epistemicTier,
      citations: pairObj.citations,
      title: opts.title,
      showInHybrid: opts.showInHybrid !== false
    });
  }

  return { level, setLevel, label, mode, setMode, cycle, toggle, applyDom, subscribe, epistemicBadge, wrap, atom, bindHoldPeek, showLoupe, hideLoupe };
})();

/* ==================== REAL WEB AUDIO + SPEECHSYNTHESIS KITCHEN COACH (BTTimerAudio) ==================== */
const BTTimerAudio = (function() {
  let audioCtx = null;
  let unlocked = false;
  let lastSpokenText = '';
  const listeners = new Set();

  function mode() {
    if (!app || !app.prefs) return 'voice';
    return normalizeTimerAudioMode(app.prefs.timerAudioMode || app.prefs.sound || 'voice');
  }

  function setMode(m) {
    const clean = normalizeTimerAudioMode(m);
    if (app && app.prefs) {
      app.prefs.timerAudioMode = clean;
      app.prefs.sound = clean === 'silent' ? 'off' : (clean === 'chimes' ? 'chime' : 'voice');
      app.prefs.soundOff = clean === 'silent';
    }
    if (clean !== 'voice') {
      stopSpeech();
    } else {
      unlock();
    }
    writePrefsMirror();
    scheduleDraft();
    listeners.forEach(function(fn) {
      try { fn(clean); } catch (e) {}
    });
    return clean;
  }

  function subscribe(fn) {
    if (typeof fn !== 'function') return function() {};
    listeners.add(fn);
    return function() { listeners.delete(fn); };
  }

  function unlock() {
    try {
      if (typeof window === 'undefined') return false;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      if (!audioCtx) {
        audioCtx = new AC();
      }
      if (audioCtx.state === 'suspended' && typeof audioCtx.resume === 'function') {
        audioCtx.resume().catch(function() {});
      }
      if (!unlocked && audioCtx && typeof audioCtx.createBuffer === 'function') {
        const silentBuf = audioCtx.createBuffer(1, 1, 22050);
        const src = audioCtx.createBufferSource();
        src.buffer = silentBuf;
        src.connect(audioCtx.destination);
        if (typeof src.start === 'function') src.start(0);
        unlocked = true;
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  function _playTone(freqHz, durationSec, peakGain, delaySec, oscType) {
    try {
      if (!unlock() || !audioCtx) return false;
      const now = audioCtx.currentTime + Math.max(0, +delaySec || 0);
      const dur = Math.max(0.05, +durationSec || 0.25);
      const gainVal = Math.max(0.01, Math.min(0.5, +peakGain || 0.20));
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = oscType || 'sine';
      osc.frequency.setValueAtTime(freqHz, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(gainVal, now + Math.min(0.016, dur * 0.2));
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + dur + 0.03);
      return true;
    } catch (e) {
      return false;
    }
  }

  function playCountdownPip(secLeft, opts) {
    if (mode() === 'silent' && !(opts && opts.force)) return false;
    const s = Math.round(+secLeft || 1);
    const freq = s <= 1 ? 698 : 587; /* 587 Hz (D5) at 3, 2 -> 698 Hz (F5) at 1 */
    return _playTone(freq, s <= 1 ? 0.13 : 0.11, 0.18, 0, 'sine');
  }

  function playStepChime(opts) {
    if (mode() === 'silent' && !(opts && opts.force)) return false;
    /* Warm harmonic fifth: 880 Hz (A5) + 1318.5 Hz (E6) */
    const ok1 = _playTone(880, 0.42, 0.23, 0, 'sine');
    _playTone(1318.5, 0.36, 0.11, 0.018, 'triangle');
    return ok1;
  }

  function playTargetWeightPip(opts) {
    if (mode() === 'silent' && !(opts && opts.force)) return false;
    return _playTone(1046.50, 0.095, 0.17, 0, 'sine');
  }

  function playFinishChord(opts) {
    if (mode() === 'silent' && !(opts && opts.force)) return false;
    /* C5 - E5 - G5 - C6 warm ascending arpeggio */
    const notes = [523.25, 659.25, 783.99, 1046.50];
    let ok = false;
    for (let i = 0; i < notes.length; i++) {
      if (_playTone(notes[i], 0.46, 0.20, i * 0.11, 'sine')) ok = true;
    }
    return ok;
  }

  function playGoldenSipBell(opts) {
    if (mode() === 'silent' && !(opts && opts.force)) return false;
    /* 1046.5 Hz + 1568 Hz soft porcelain bell for 60 C Golden Sip */
    const ok = _playTone(1046.5, 0.62, 0.18, 0, 'sine');
    _playTone(1568, 0.52, 0.09, 0.03, 'sine');
    return ok;
  }

  function stopSpeech() {
    try {
      if (typeof window !== 'undefined' && window.speechSynthesis && typeof window.speechSynthesis.cancel === 'function') {
        window.speechSynthesis.cancel();
      }
    } catch (e) {}
  }

  function speak(text, opts) {
    opts = opts || {};
    const curMode = mode();
    if (curMode === 'silent' && !opts.force) return false;
    const clean = String(text == null ? '' : text).replace(/\s+/g, ' ').trim();
    if (!clean) return false;
    lastSpokenText = clean;

    if (curMode === 'chimes' && !opts.forceVoice) {
      if (opts.chimeFallback !== false) playStepChime({ force: !!opts.force });
      return false;
    }

    try {
      if (typeof window !== 'undefined' && window.speechSynthesis && typeof window.SpeechSynthesisUtterance === 'function') {
        window.speechSynthesis.cancel();
        const utt = new window.SpeechSynthesisUtterance(clean);
        utt.lang = opts.lang || 'en-US';
        utt.rate = typeof opts.rate === 'number' ? opts.rate : 1.02;
        utt.pitch = typeof opts.pitch === 'number' ? opts.pitch : 1.0;
        utt.volume = typeof opts.volume === 'number' ? opts.volume : 1.0;
        const voices = typeof window.speechSynthesis.getVoices === 'function' ? (window.speechSynthesis.getVoices() || []) : [];
        const enVoice = voices.find(function(v) { return /^en[-_]US/i.test(v.lang); }) || voices.find(function(v) { return /^en/i.test(v.lang); });
        if (enVoice) utt.voice = enVoice;
        window.speechSynthesis.speak(utt);
        return true;
      }
    } catch (e) {}

    /* Clean fallback to harmonic step chime when speechSynthesis is unavailable */
    if (opts.chimeFallback !== false) {
      playStepChime({ force: !!opts.force });
    }
    return false;
  }

  function testSound() {
    unlock();
    const cur = mode();
    playStepChime({ force: true });
    if (cur === 'voice') {
      speak('BeanTelligence voice timer ready', { force: true, forceVoice: true, chimeFallback: false });
      toast('Audio unlocked: Voice + 880 Hz Chimes ready.');
    } else if (cur === 'chimes') {
      toast('Audio unlocked: 880 Hz Harmonic Chimes + 3-2-1 pips ready.');
    } else {
      toast('Played test chime (Timer mode is currently Silent).');
    }
    return true;
  }

  function buildAudioBar(opts) {
    opts = opts || {};
    const bar = h('div', { class: 'bt-audio-bar' });
    const modes = [
      { key: 'voice',  label: 'Voice + Chimes', icon: 'volume-up' },
      { key: 'chimes', label: 'Chimes + 3-2-1', icon: 'bell' },
      { key: 'silent', label: 'Silent',         icon: 'volume-mute' }
    ];
    const seg = h('div', { class: 'bt-audio-seg', role: 'group', 'aria-label': 'Kitchen Timer Audio Mode' });

    function syncBtns() {
      const cur = mode();
      const btns = seg.querySelectorAll('button[data-audio-mode]');
      for (let i = 0; i < btns.length; i++) {
        const on = btns[i].getAttribute('data-audio-mode') === cur;
        btns[i].setAttribute('aria-pressed', String(on));
        btns[i].classList.toggle('is-active', on);
      }
    }

    modes.forEach(function(m) {
      seg.appendChild(h('button', {
        type: 'button',
        'data-audio-mode': m.key,
        'aria-pressed': String(mode() === m.key),
        onclick: function() {
          unlock();
          setMode(m.key);
          syncBtns();
          if (typeof opts.onChange === 'function') opts.onChange(m.key);
        }
      }, BTIcons.el(m.icon, { size: 14 }), h('span', { text: m.label })));
    });

    const testBtn = h('button', {
      type: 'button',
      class: 'bt-audio-test-btn',
      onclick: function() {
        testSound();
        syncBtns();
      }
    }, BTIcons.el('volume-up', { size: 14 }), h('span', { text: 'Test Sound' }));

    bar.append(seg, testBtn);
    return bar;
  }

  return {
    unlock: unlock,
    mode: mode,
    setMode: setMode,
    subscribe: subscribe,
    playCountdownPip: playCountdownPip,
    pip321: playCountdownPip,
    playStepChime: playStepChime,
    stepBell: playStepChime,
    playTargetWeightPip: playTargetWeightPip,
    playFinishChord: playFinishChord,
    finishChord: playFinishChord,
    playGoldenSipBell: playGoldenSipBell,
    goldenSipBell: playGoldenSipBell,
    speak: speak,
    speakCue: function(text, o) { playStepChime(o); return speak(text, Object.assign({ chimeFallback: false }, o || {})); },
    stopSpeech: stopSpeech,
    cancel: stopSpeech,
    testSound: testSound,
    testAudio: testSound,
    buildAudioBar: buildAudioBar,
    lastSpoken: function() { return lastSpokenText; }
  };
})();

/* ==================== TOAST & UNDO PILL HOST ==================== */
function toast(message, opts) {
  opts = opts || {};
  const host = $('toast-host');
  if (!host) return null;
  const dur = typeof opts.duration === 'number' ? opts.duration : (typeof opts.durationMs === 'number' ? opts.durationMs : (opts.onAction ? 10000 : 4000));

  const pill = h('div', { class: 'bt-toast' },
    h('span', { class: 'bt-toast-msg', text: String(message == null ? '' : message) })
  );

  let timer = null;
  function dismiss() {
    clearTimeout(timer);
    if (pill.parentNode) pill.parentNode.removeChild(pill);
  }

  if (opts.actionLabel && typeof opts.onAction === 'function') {
    const actBtn = h('button', {
      type: 'button',
      class: 'bt-toast-act',
      text: opts.actionLabel,
      onclick: function() {
        dismiss();
        opts.onAction();
      }
    });
    pill.appendChild(actBtn);
  }

  while (host.children.length >= 2) {
    host.removeChild(host.firstElementChild);
  }
  host.appendChild(pill);
  if (dur > 0) timer = setTimeout(dismiss, dur);
  return { dismiss: dismiss, el: pill };
}

/* ==================== 3-DETENT SPRING BOTTOM SHEET (BTSheet) ==================== */
const _sheetRegistry = new Map();
const _sheetTitles = {
  'workflow-tools':  'My Gear & Setup',
  'bench-gear':      'My Gear & Setup',
  'my-coffees':      'My Coffees Vault',
  'bag-capture':     'Add or Scan Coffee Bag',
  'capture-bag':     'Add or Scan Coffee Bag',
  'ai-paste':        'Magic AI Reply Paste',
  'coffee-facts':    'Coffee Facts in Four Parts',
  'post-brew-taste': 'Post-Brew Sensory Studio',
  'tasting-flow':    'Post-Brew Sensory Studio',
  'brew-twin':       'Brew Twin Translator',
  'live-cockpit':    'Live Brew Cockpit',
  'ble-devices':     'Bluetooth Instruments',
  'data-vault':         'Data Vault & Backup',
  'onboarding-tour':    'Welcome to BeanTelligence',
  'about-charter':      'Science & Epistemic Charter',
  'share-qr-passport':  'Share QR Recipe Passport',
  'recipe-science-why': 'Why These Numbers?'
};

const BTSheet = (function() {
  let activeSheetKey = '';
  let lastFocusEl = null;
  let activeOnClose = null;

  function isOpen() {
    const s = $('sheet');
    return !!(s && s.classList.contains('is-open') && !s.hidden);
  }

  function currentKey() {
    return activeSheetKey;
  }

  function setDetent(detent) {
    const s = $('sheet');
    if (!s) return;
    const d = (detent === 'peek' || detent === 'half' || detent === 'full' || detent === 'cockpit') ? detent : 'half';
    s.setAttribute('data-detent', d);
  }

  function setTitle(title) {
    const t = $('sheet-title');
    if (t && title != null) t.textContent = String(title);
  }

  function register(sheetKey, renderFn, meta) {
    const k = String(sheetKey || '').trim().toLowerCase();
    if (k && typeof renderFn === 'function') {
      _sheetRegistry.set(k, Object.assign({ render: renderFn }, meta || {}));
    }
    return BTSheet;
  }

  function open(keyOrCfg, payload, opts) {
    const sheetEl = $('sheet');
    const backdropEl = $('sheet-backdrop');
    const bodyEl = $('sheet-body');
    if (!sheetEl || !bodyEl) return;

    opts = opts || {};
    let key = '';
    let title = '';
    let detent = opts.detent || 'half';
    let renderFn = null;
    let onClose = opts.onClose || null;

    if (typeof keyOrCfg === 'string') {
      key = keyOrCfg.trim().toLowerCase();
      const reg = _sheetRegistry.get(key) || (key === 'capture-bag' ? _sheetRegistry.get('bag-capture') : null) || (key === 'tasting-flow' ? _sheetRegistry.get('post-brew-taste') : null);
      title = opts.title || (reg && reg.title) || _sheetTitles[key] || 'Studio';
      detent = opts.detent || (reg && reg.detent) || (key === 'live-cockpit' || key === 'tasting-flow' || key === 'post-brew-taste' ? 'cockpit' : 'half');
      renderFn = reg ? reg.render : null;
    } else if (keyOrCfg && typeof keyOrCfg === 'object') {
      key = String(keyOrCfg.id || keyOrCfg.key || 'custom');
      title = keyOrCfg.title || _sheetTitles[key] || 'Studio';
      detent = keyOrCfg.detent || opts.detent || 'half';
      renderFn = keyOrCfg.render || null;
      onClose = keyOrCfg.onClose || onClose;
      if (payload === undefined) payload = keyOrCfg.payload;
    }

    if (!isOpen() && typeof document !== 'undefined') {
      lastFocusEl = document.activeElement;
    }

    activeSheetKey = key;
    activeOnClose = onClose;
    sheetEl.setAttribute('data-sheet', key);
    setDetent(detent);
    setTitle(title);
    bodyEl.textContent = '';

    const api = {
      key: key,
      payload: payload,
      opts: opts,
      close: close,
      setDetent: setDetent,
      setTitle: setTitle,
      body: bodyEl
    };

    if (typeof renderFn === 'function') {
      const res = renderFn(bodyEl, payload, api);
      if (res && res.nodeType && !bodyEl.contains(res)) {
        bodyEl.appendChild(res);
      }
    } else {
      bodyEl.appendChild(h('div', { class: 'bt-card' },
        h('p', { text: title + ' is ready.' })
      ));
    }

    if (backdropEl) {
      backdropEl.hidden = false;
      backdropEl.classList.add('is-open');
    }
    sheetEl.hidden = false;
    sheetEl.classList.add('is-open');
    paintChrome();

    try {
      if (window.BTHaptics && window.BTHaptics.snap) window.BTHaptics.snap();
    } catch (e) {}
  }

  function close() {
    const sheetEl = $('sheet');
    const backdropEl = $('sheet-backdrop');
    if (!sheetEl || sheetEl.hidden) return;

    sheetEl.classList.remove('is-open');
    sheetEl.hidden = true;
    sheetEl.removeAttribute('data-sheet');
    if (backdropEl) {
      backdropEl.classList.remove('is-open');
      backdropEl.hidden = true;
    }
    const bodyEl = $('sheet-body');
    if (bodyEl) bodyEl.textContent = '';

    const cb = activeOnClose;
    activeSheetKey = '';
    activeOnClose = null;
    paintChrome();
    if (typeof cb === 'function') {
      try { cb(); } catch (e) {}
    }
    if (lastFocusEl && typeof lastFocusEl.focus === 'function') {
      try { lastFocusEl.focus({ preventScroll: true }); } catch (e) {}
      lastFocusEl = null;
    }
  }

  function bindGestures() {
    const closeBtn = $('sheet-close-btn');
    if (closeBtn) {
      closeBtn.textContent = '';
      closeBtn.appendChild(BTIcons.el('close-x', { size: 20 }));
      closeBtn.onclick = close;
    }
    const backdropEl = $('sheet-backdrop');
    if (backdropEl) {
      backdropEl.onclick = close;
    }
    const grab = $('sheet-grab-zone');
    const sheetEl = $('sheet');
    if (grab && sheetEl) {
      let startY = 0;
      let dragging = false;
      grab.addEventListener('pointerdown', function(e) {
        dragging = true;
        startY = e.clientY;
        try { grab.setPointerCapture(e.pointerId); } catch (err) {}
      });
      grab.addEventListener('pointermove', function(e) {
        if (!dragging) return;
        const dy = Math.max(-60, e.clientY - startY);
        if (dy > 0) sheetEl.style.transform = 'translateY(' + dy + 'px)';
      });
      function finishDrag(e) {
        if (!dragging) return;
        dragging = false;
        sheetEl.style.transform = '';
        const dy = e.clientY - startY;
        const cur = sheetEl.getAttribute('data-detent') || 'half';
        if (dy > 110) {
          close();
        } else if (dy < -55) {
          setDetent(cur === 'peek' ? 'half' : 'full');
        } else if (dy > 50 && cur === 'full') {
          setDetent('half');
        }
      }
      grab.addEventListener('pointerup', finishDrag);
      grab.addEventListener('pointercancel', finishDrag);
    }
  }

  return { register, open, close, isOpen, currentKey, setDetent, setTitle, bindGestures };
})();

/* ==================== MY GEAR & SETUP SHEET ('workflow-tools' & 'bench-gear') ==================== */
const _SENSOR_TOOL_ROWS = [
  { key: 'scale',         label: 'Smart Scale',                sub: 'Bluetooth live weight, g/s pour speed & auto-start',               icon: 'scale-deck' },
  { key: 'refractometer', label: 'Refractometer (DiFluid R2)', sub: 'Measures strength (%TDS) & extraction (%EY) alongside your taste', icon: 'refract-prism' },
  { key: 'agtron',        label: 'Roast Meter (Agtron)',       sub: 'Whole-bean & ground roast color + Roast Delta',                    icon: 'omni-nir' },
  { key: 'psd',           label: 'Particle Analyzer (PSD)',    sub: 'Fine / median / boulder micron grind spread',                      icon: 'grinder-burr' },
  { key: 'water',         label: 'Water Chemistry',            sub: 'Tap, filtered & bottled water + hardness (GH) & acid buffer (KH)', icon: 'droplet' }
];

const _POPULAR_OWNED_BREWERS = [
  ['v60', 'Hario V60'],
  ['origami', 'Origami'],
  ['kalita', 'Kalita Wave'],
  ['orea', 'Orea'],
  ['chemex', 'Chemex'],
  ['switch', 'Hario Switch'],
  ['clever', 'Clever'],
  ['aeropress', 'AeroPress'],
  ['press', 'French Press'],
  ['espresso', 'Espresso'],
  ['lever_espresso', 'Lever'],
  ['moka', 'Moka Pot'],
  ['aiden', 'Fellow Aiden'],
  ['xbloom', 'xBloom'],
  ['philips5500', 'Philips 5500'],
  ['drip', 'Auto Drip'],
  ['cold', 'Cold Brew']
];

const _QUICK_WATER_KEYS = [
  ['sca-ideal',    'SCA Balanced'],
  ['lotus-bright', 'Lotus Bright'],
  ['tww-classic',  'TWW Classic'],
  ['soft-tap',     'Soft Tap'],
  ['medium-tap',   'Medium Tap'],
  ['ro-distilled', 'RO / Distilled']
];

function _resolveActiveGrinderShort() {
  const gKey = (app && app.prefs && app.prefs.gear && app.prefs.gear.grinderKey) || (app && app.brew && app.brew.grinderKey) || '';
  const gName = (app && app.prefs && app.prefs.gear && app.prefs.gear.grinderName) || (app && app.brew && app.brew.grinderName) || '';
  const grinders = (typeof window !== 'undefined' && window.BTCoreV6 && Array.isArray(window.BTCoreV6.GRINDERS_48))
    ? window.BTCoreV6.GRINDERS_48
    : (typeof GRINDERS !== 'undefined' && Array.isArray(GRINDERS) ? GRINDERS : []);
  if (gKey && grinders.length) {
    const found = grinders.find(function(x) { return x.key === gKey; });
    if (found) return found.short || found.name || gName || gKey;
  }
  return gName || '';
}

function _renderWorkflowToolsSheet(bodyEl, payload, api) {
  bodyEl.textContent = '';

  function rebuild() {
    _renderWorkflowToolsSheet(bodyEl, payload, api);
  }

  function openBleBench() {
    if (_sheetRegistry.has('ble-devices')) {
      BTSheet.open('ble-devices', null, { detent: 'full', title: 'Bluetooth Scales, R2, Omni & Smart Gear' });
    } else {
      api.close();
      go('devices');
    }
  }

  /* 0. Quick-Jump Studio & Hardware Actions */
  const quickActionsCard = h('div', { class: 'bt-card', style: 'margin-bottom:12px;display:flex;flex-wrap:wrap;gap:8px' },
    h('button', {
      type: 'button',
      class: 'bt-btn is-primary',
      style: 'flex:1 1 200px',
      onclick: function() {
        api.close();
        go('method');
      }
    }, BTIcons.el('brew', { size: 16 }), h('span', { text: 'Jump to Step 2 Brewer Studio' })),
    h('button', {
      type: 'button',
      class: 'bt-btn',
      style: 'flex:1 1 200px',
      onclick: openBleBench
    }, BTIcons.el('ble-wave', { size: 16 }), h('span', { text: 'Open Bluetooth Hardware Bench' }))
  );

  /* 1. Experience Lens Quick Selector */
  const curLens = BTScienceLens.level();
  const lensCard = h('div', { class: 'bt-card', style: 'margin-bottom:12px;display:flex;flex-direction:column;gap:8px' },
    h('div', { style: 'font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--ink-muted)' }, 'Experience Lens'),
    h('div', { class: 'bt-seg-bar', role: 'group', 'aria-label': 'Experience Lens' },
      [
        ['starter',   'Just Starting'],
        ['comfy',     'Comfy Brewer'],
        ['scientist', 'Bean Scientist']
      ].map(function(item) {
        return h('button', {
          type: 'button',
          'aria-pressed': String(curLens === item[0]),
          text: item[1],
          onclick: function() {
            BTScienceLens.setMode(item[0]);
            rebuild();
          }
        });
      })
    )
  );

  /* 2. Grinder & Burrs + Units */
  const grinders = (typeof window !== 'undefined' && window.BTCoreV6 && Array.isArray(window.BTCoreV6.GRINDERS_48))
    ? window.BTCoreV6.GRINDERS_48
    : (typeof GRINDERS !== 'undefined' && Array.isArray(GRINDERS) ? GRINDERS : []);
  const curGrinderKey = (app.prefs.gear && app.prefs.gear.grinderKey) || app.brew.grinderKey || '';

  const grinderCard = h('div', { class: 'bt-card', style: 'margin-bottom:12px;display:flex;flex-direction:column;gap:10px' },
    h('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:8px' },
      h('span', { style: 'display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--ink-muted)' },
        BTIcons.el('grinder-burr', { size: 14 }),
        h('span', { text: 'Grinder & Burrs' })
      ),
      _resolveActiveGrinderShort() ? h('span', { class: 'bt-badge', text: _resolveActiveGrinderShort() }) : null
    ),
    grinders.length ? h('select', {
      class: 'bt-input',
      'aria-label': 'Primary coffee grinder and burrs',
      onchange: function(e) {
        const gk = e.target.value;
        const found = grinders.find(function(x) { return x.key === gk; });
        app.brew.grinderKey = gk;
        app.brew.grinderName = found ? (found.name || found.short || gk) : '';
        if (app.prefs.gear) {
          app.prefs.gear.grinderKey = gk;
          app.prefs.gear.grinderName = app.brew.grinderName;
        }
        try {
          if (typeof window !== 'undefined' && window.BTBrewStudio && typeof window.BTBrewStudio.synthesizeForApp === 'function') {
            window.BTBrewStudio.synthesizeForApp(app, (app.brew && app.brew.method) || 'v60', { keepFilter: true, preserveBatch: true });
          }
        } catch (_) {}
        changed();
        render();
        paintChrome();
        paintStudioAside();
        rebuild();
      }
    },
      h('option', { value: '', selected: !curGrinderKey, text: 'Select primary grinder (calibrated models)...' }),
      grinders.map(function(g) {
        return h('option', { value: g.key, selected: g.key === curGrinderKey, text: g.name || g.short || g.key });
      })
    ) : null,
    h('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap' },
      h('div', { class: 'bt-seg-bar', style: 'min-width:160px' },
        ['F', 'C'].map(function(u) {
          return h('button', {
            type: 'button',
            'aria-pressed': String(app.prefs.tempUnit === u),
            text: 'Temp °' + u,
            onclick: function() {
              app.prefs.tempUnit = u;
              changed();
              render();
              rebuild();
            }
          });
        })
      ),
      h('button', {
        type: 'button',
        class: 'bt-chip',
        style: 'min-height:36px;font-size:12px',
        onclick: function() {
          api.close();
          go('method');
        }
      }, BTIcons.el('brew', { size: 14 }), h('span', { text: 'Step 2 Brewer Studio →' }))
    )
  );

  /* 3. My Brewers & Kettle */
  const bf = btToolMode('brewersFilter');
  const ownedSet = new Set(Array.isArray(app.prefs.ownedBrewers) ? app.prefs.ownedBrewers : []);
  const brewersCard = h('div', { class: 'bt-card', style: 'margin-bottom:12px;display:flex;flex-direction:column;gap:10px' },
    h('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:8px' },
      h('span', { style: 'font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--ink-muted)' }, 'My Brewers & Kettle'),
      h('span', { class: 'bt-badge', text: ownedSet.size + ' Owned' })
    ),
    h('div', { class: 'bt-seg-bar', role: 'group', 'aria-label': 'Brewer list filter' },
      [
        ['all',   'Show All 23 Brewers'],
        ['owned', 'Only Owned Brewers']
      ].map(function(opt) {
        return h('button', {
          type: 'button',
          'aria-pressed': String(bf === opt[0]),
          text: opt[1],
          onclick: function() {
            btSetToolMode('brewersFilter', opt[0]);
            render();
            rebuild();
          }
        });
      })
    ),
    h('div', { class: 'bt-pill-row', role: 'group', 'aria-label': 'Toggle owned brewers' },
      _POPULAR_OWNED_BREWERS.map(function(br) {
        const isOwned = ownedSet.has(br[0]);
        return h('button', {
          type: 'button',
          class: 'bt-chip',
          style: 'min-height:36px;padding:4px 11px;font-size:12px',
          'aria-pressed': String(isOwned),
          onclick: function() {
            if (ownedSet.has(br[0])) ownedSet.delete(br[0]);
            else ownedSet.add(br[0]);
            const arr = Array.from(ownedSet);
            app.prefs.ownedBrewers = arr;
            if (app.prefs.gear) app.prefs.gear.ownedBrewers = arr.slice();
            changed();
            render();
            paintChrome();
            rebuild();
          }
        }, BTIcons.forBrewer(br[0], { size: 15 }), h('span', { text: br[1] }));
      })
    ),
    h('div', { style: 'display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding-top:4px;border-top:1px solid var(--line-hairline)' },
      BTIcons.el('kettle-gooseneck', { size: 16 }),
      h('input', {
        type: 'text',
        class: 'bt-input',
        style: 'flex:1 1 180px',
        placeholder: 'Kettle (e.g. Fellow Stagg EKG+, Brewista)...',
        'aria-label': 'Primary brewing kettle',
        value: (app.prefs.gear && app.prefs.gear.kettle) || app.prefs.kettle || '',
        onchange: function(e) {
          const val = String(e.target.value || '').trim().slice(0, 80);
          app.prefs.kettle = val;
          if (app.prefs.gear) app.prefs.gear.kettle = val;
          changed();
        }
      })
    )
  );

  /* 4. Brew Water Profile */
  const waterPresets = (typeof window !== 'undefined' && window.BTCoreV6 && Array.isArray(window.BTCoreV6.WATER_PRESETS_UNIFIED))
    ? window.BTCoreV6.WATER_PRESETS_UNIFIED
    : [];
  const curWaterKey = (app.prefs.gear && app.prefs.gear.waterProfileKey) || app.prefs.waterProfileKey || '';
  const setWaterProfile = function(wk) {
    app.prefs.waterProfileKey = wk;
    if (app.prefs.gear) app.prefs.gear.waterProfileKey = wk;
    const wp = waterPresets.find(function(w) { return w.key === wk || w.id === wk; });
    if (wp) {
      app.prefs.waterType = wp.waterType || app.prefs.waterType;
      if (app.prefs.gear) {
        app.prefs.gear.waterType = wp.waterType || app.prefs.gear.waterType;
        app.prefs.gear.waterGH = String(wp.gh);
        app.prefs.gear.waterAlk = String(wp.kh);
      }
    }
    changed();
    render();
    paintStudioAside();
    rebuild();
  };

  const waterCard = h('div', { class: 'bt-card', style: 'margin-bottom:12px;display:flex;flex-direction:column;gap:10px' },
    h('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:8px' },
      h('span', { style: 'display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--ink-muted)' },
        BTIcons.el('droplet', { size: 14 }),
        h('span', { text: 'Brew Water Profile' })
      ),
      h('button', {
        type: 'button',
        class: 'bt-chip',
        style: 'min-height:30px;padding:2px 9px;font-size:11.5px',
        onclick: function() {
          api.close();
          go('water');
        }
      }, h('span', { text: 'Water Lab →' }))
    ),
    h('div', { class: 'bt-pill-row', role: 'group', 'aria-label': 'Quick brew water presets' },
      _QUICK_WATER_KEYS.map(function(wq) {
        return h('button', {
          type: 'button',
          class: 'bt-chip',
          style: 'min-height:34px;padding:4px 10px;font-size:12px',
          'aria-pressed': String(curWaterKey === wq[0]),
          text: wq[1],
          onclick: function() { setWaterProfile(wq[0]); }
        });
      })
    ),
    waterPresets.length ? h('select', {
      class: 'bt-input',
      'aria-label': 'All brew water profiles',
      onchange: function(e) { setWaterProfile(e.target.value); }
    },
      h('option', { value: '', selected: !curWaterKey, text: 'Select water profile (' + waterPresets.length + ' presets)...' }),
      waterPresets.map(function(wp) {
        return h('option', { value: wp.key, selected: wp.key === curWaterKey || wp.id === curWaterKey, text: wp.label + ' (' + wp.gh + ' GH / ' + wp.kh + ' KH)' });
      })
    ) : null
  );

  /* 5. Smart Bluetooth Sensors & Hardware Bench */
  const sensorsCard = h('div', { class: 'bt-card', style: 'display:flex;flex-direction:column;gap:10px' },
    h('div', null,
      h('div', { style: 'font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--ink-muted)' }, 'Smart Bluetooth Sensors'),
      h('p', { style: 'font-size:12px;color:var(--ink-secondary);margin-top:2px', text: 'Set Off to hide hardware clutter completely, Optional for 1-tap pills, or Always Use for inline telemetry.' })
    ),
    _SENSOR_TOOL_ROWS.map(function(row) {
      const curMode = btToolMode(row.key);
      return h('div', { style: 'display:flex;flex-direction:column;gap:6px;padding-top:8px;border-top:1px solid var(--line-hairline)' },
        h('div', { style: 'display:flex;align-items:center;gap:8px' },
          BTIcons.el(row.icon, { size: 17 }),
          h('div', { style: 'min-width:0;flex:1' },
            h('div', { style: 'font-weight:700;font-size:13.5px', text: row.label }),
            h('div', { style: 'font-size:11.5px;color:var(--ink-secondary)', text: row.sub })
          )
        ),
        h('div', { class: 'bt-seg-bar', role: 'group', 'aria-label': row.label + ' visibility mode' },
          [
            ['always',   'Always Use'],
            ['optional', 'Optional'],
            ['off',      'Off']
          ].map(function(m) {
            return h('button', {
              type: 'button',
              'aria-pressed': String(curMode === m[0]),
              text: m[1],
              onclick: function() {
                btSetToolMode(row.key, m[0]);
                render();
                rebuild();
              }
            });
          })
        )
      );
    }),
    h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap;padding-top:8px;border-top:1px solid var(--line-hairline)' },
      h('button', {
        type: 'button',
        class: 'bt-btn is-primary',
        style: 'flex:1 1 200px',
        onclick: openBleBench
      }, BTIcons.el('ble-wave', { size: 16 }), h('span', { text: 'Open Bluetooth Hardware Bench' })),
      (typeof window !== 'undefined' && window.BTBle && typeof window.BTBle.toggleDemoAutoPilot === 'function') ? h('button', {
        type: 'button',
        class: 'bt-btn',
        'aria-pressed': String(!!(window.BTBle.isDemoAutoPilotActive && window.BTBle.isDemoAutoPilotActive())),
        onclick: function() {
          const res = window.BTBle.toggleDemoAutoPilot();
          toast(res && res.active ? 'Bluetooth Scale Demo started (Ready \u2192 Pouring \u2192 Draining \u2192 Cup Done \u2192 Sample Ready).' : 'Bluetooth Scale Demo stopped.');
          paintChrome();
          paintStudioAside();
          rebuild();
        }
      }, BTIcons.el('play', { size: 15 }), h('span', { text: (window.BTBle.isDemoAutoPilotActive && window.BTBle.isDemoAutoPilotActive()) ? 'Stop BLE Demo' : 'Demo Auto-Pilot' })) : null
    )
  );

  bodyEl.append(quickActionsCard, lensCard, grinderCard, brewersCard, waterCard, sensorsCard);
}

BTSheet.register('workflow-tools', _renderWorkflowToolsSheet, { title: 'My Gear & Setup', detent: 'full' });
BTSheet.register('bench-gear', _renderWorkflowToolsSheet, { title: 'My Gear & Setup', detent: 'full' });

/* ==================== 5-TAB REGISTRY, GUIDED 5-STEP TRAIL & 55+ LEGACY ROUTES ==================== */
const TAB_ORDER = ['brew', 'cellar', 'lab', 'palate', 'academy'];
const TAB_DEFS = {
  brew:    { key: 'brew',    label: 'Brew',        railLabel: 'Brew',          icon: 'brew',    title: 'Brew Studio' },
  cellar:  { key: 'cellar',  label: 'Cellar',      railLabel: 'Cellar',        icon: 'cellar',  title: 'Cellar & Journal' },
  lab:     { key: 'lab',     label: 'Lab & Tools', railLabel: 'Lab & Tools',   icon: 'lab',     title: 'Lab & Tools' },
  palate:  { key: 'palate',  label: 'Prefs',       railLabel: 'Preferences',   icon: 'palate',  title: 'Preferences & Palate' },
  academy: { key: 'academy', label: 'Learn',       railLabel: 'Learn & Vault', icon: 'academy', title: 'Learn & Data Vault' }
};

const PARENT = {
  taste:      'timer',
  tasting:    'timer',
  perfect:    'timer',
  cup:        'timer',
  dial:       'timer',
  fix:        'timer',
  timer:      'brew',
  brew:       'method',
  recipe:     'method',
  ready:      'method',
  change:     'brew',
  method:     'coffee',
  gear:       'method',
  coffee:     'door',
  start:      'door',
  loadshared: 'door',
  sperfect:   'staste',
  staste:     'sdrink',
  sdrink:     'shop',
  shop:       'door',
  detail:     'history',
  tastedit:   'detail',
  compare:    'history'
};

const _tabRegistry = new Map();
const _routeRegistry = new Map();

/* Complete mapping for Guided 5-Step Flow + all 55 Legacy Route Keys + camelCase screen* aliases */
const ROUTE_MAP = {
  /* Guided 5-Step Home Flow */
  door:         { tab: 'brew',    segment: 'studio', brewStep: 'door',   focusFix: false },
  start:        { tab: 'brew',    segment: 'studio', brewStep: 'coffee', focusFix: false },
  coffee:       { tab: 'brew',    segment: 'studio', brewStep: 'coffee', focusFix: false },
  method:       { tab: 'brew',    segment: 'studio', brewStep: 'method', focusFix: false },
  brewer:       { tab: 'brew',    segment: 'studio', brewStep: 'method', focusFix: false },
  brew:         { tab: 'brew',    segment: 'studio', brewStep: 'brew',   focusFix: false },
  recipe:       { tab: 'brew',    segment: 'studio', brewStep: 'brew',   focusFix: false },
  ready:        { tab: 'brew',    segment: 'studio', brewStep: 'brew',   focusFix: false },
  change:       { tab: 'brew',    segment: 'studio', brewStep: 'brew',   sub: 'units' },
  timer:        { tab: 'brew',    segment: 'studio', brewStep: 'timer',  focusFix: false },
  taste:        { tab: 'brew',    segment: 'studio', brewStep: 'taste',  focusFix: false },
  tasting:      { tab: 'brew',    segment: 'studio', brewStep: 'taste',  focusFix: false },
  cup:          { tab: 'brew',    segment: 'studio', brewStep: 'taste',  focusFix: false },
  cupping:      { tab: 'brew',    segment: 'studio', brewStep: 'taste',  focusFix: false },
  perfect:      { tab: 'brew',    segment: 'studio', brewStep: 'taste',  focusFix: true },
  dial:         { tab: 'brew',    segment: 'studio', brewStep: 'taste',  focusFix: true },
  fix:          { tab: 'brew',    segment: 'studio', brewStep: 'taste',  focusFix: true },
  flavor:       { tab: 'brew',    segment: 'studio', brewStep: 'taste',  focusFix: false },

  /* Facts in Four Parts & Gear Sheets */
  coffee_facts: { tab: 'brew',    segment: 'studio', sheet: 'coffee-facts', detent: 'full' },
  gear:         { tab: 'brew',    segment: 'studio', sheet: 'workflow-tools', detent: 'full' },
  bean:         { tab: 'brew',    segment: 'studio', sheet: 'my-coffees', detent: 'full' },

  /* Independent 4-Step Cafe Shop Trail */
  shop:         { tab: 'cellar',  segment: 'cafes',  sub: 'shop',     shopStep: 'shop' },
  sdrink:       { tab: 'cellar',  segment: 'cafes',  sub: 'sdrink',   shopStep: 'sdrink' },
  staste:       { tab: 'cellar',  segment: 'cafes',  sub: 'staste',   shopStep: 'staste' },
  sperfect:     { tab: 'cellar',  segment: 'cafes',  sub: 'sperfect', shopStep: 'sperfect' },
  shops:        { tab: 'cellar',  segment: 'cafes' },

  /* Cellar, Journal & Prices */
  loadshared:   { tab: 'brew',    segment: 'studio', brewStep: 'door', sub: 'loadshared' },
  history:      { tab: 'cellar',  segment: 'journal' },
  perfecting:   { tab: 'cellar',  segment: 'shelf',  sub: 'trails' },
  detail:       { tab: 'cellar',  segment: 'journal', sub: 'detail' },
  tastedit:     { tab: 'cellar',  segment: 'journal', sub: 'edit' },
  compare:      { tab: 'cellar',  segment: 'journal', sub: 'compare' },
  prices:       { tab: 'cellar',  segment: 'prices' },
  share:        { tab: 'cellar',  segment: 'journal', sub: 'share' },

  /* Lab & Tools (All 14 Studios & BLE) */
  chart:        { tab: 'lab',     segment: 'ey' },
  tools:        { tab: 'lab',     segment: 'ey' },
  calculators:  { tab: 'lab',     segment: 'ey' },
  ey:           { tab: 'lab',     segment: 'ey' },
  yield:        { tab: 'lab',     segment: 'vessel', sub: 'yield' },
  ratio:        { tab: 'lab',     segment: 'vessel', sub: 'ratio' },
  water:        { tab: 'lab',     segment: 'water' },
  iced:         { tab: 'lab',     segment: 'vessel', sub: 'iced' },
  milk:         { tab: 'lab',     segment: 'vessel', sub: 'milk' },
  agtron:       { tab: 'lab',     segment: 'agtron' },
  devices:      { tab: 'lab',     segment: 'devices', sheet: 'ble-devices', detent: 'full' },
  cost:         { tab: 'lab',     segment: 'agtron', sub: 'cost' },
  bagcmp:       { tab: 'lab',     segment: 'agtron', sub: 'bagcmp' },
  fresh:        { tab: 'lab',     segment: 'agtron', sub: 'freshness' },
  freshness:    { tab: 'lab',     segment: 'agtron', sub: 'freshness' },
  caffeine:     { tab: 'lab',     segment: 'caffeine' },
  cafdrink:     { tab: 'lab',     segment: 'caffeine', sub: 'add' },
  cafresult:    { tab: 'lab',     segment: 'caffeine', sub: 'sleep' },
  cafcup:       { tab: 'lab',     segment: 'caffeine', sub: 'cup' },

  /* Palate, Preferences & Smart Bag Buyer */
  wheels:       { tab: 'palate',  segment: 'wheels' },
  wheel:        { tab: 'palate',  segment: 'wheels' },
  flavorwheel:  { tab: 'palate',  segment: 'wheels' },
  tend:         { tab: 'palate',  segment: 'dna' },
  preferences:  { tab: 'palate',  segment: 'dna' },
  prefs:        { tab: 'palate',  segment: 'dna' },
  buy:          { tab: 'palate',  segment: 'scanner' },
  explore:      { tab: 'palate',  segment: 'scanner' },
  tpboard:      { tab: 'palate',  segment: 'dna', sub: 'origins' },
  tpshops:      { tab: 'palate',  segment: 'dna', sub: 'shops' },
  tpbrewers:    { tab: 'palate',  segment: 'dna', sub: 'brewers' },
  tpmix:        { tab: 'palate',  segment: 'dna', sub: 'flavors' },

  /* Learn, 5-Bowl SCA Cupping, Glossary & Vault */
  tastes:       { tab: 'academy', segment: 'gym' },
  blind:        { tab: 'academy', segment: 'gym', sub: 'blind' },
  sca:          { tab: 'academy', segment: 'sca' },
  learn:        { tab: 'academy', segment: 'curriculum' },
  guide:        { tab: 'academy', segment: 'curriculum', sheet: 'onboarding-tour', detent: 'full' },
  tour:         { tab: 'academy', segment: 'curriculum', sheet: 'onboarding-tour', detent: 'full' },
  folk:         { tab: 'academy', segment: 'folk' },
  about:        { tab: 'academy', segment: 'vault', sheet: 'about-charter', detent: 'half' },
  glossary:     { tab: 'academy', segment: 'glossary' },
  files:        { tab: 'academy', segment: 'vault' },
  every:        { tab: 'academy', segment: 'vault' },
  backup:       { tab: 'academy', segment: 'vault' },

  /* Primary Tabs & Direct Machine Shortcuts */
  home:         { tab: 'brew',    segment: 'studio', brewStep: 'door', focusFix: false },
  cellar:       { tab: 'cellar',  segment: 'shelf' },
  palate:       { tab: 'palate',  segment: 'dna' },
  lab:          { tab: 'lab',     segment: 'ey' },
  academy:      { tab: 'academy', segment: 'curriculum' },
  philips5500:  { tab: 'brew',    segment: 'studio', brewStep: 'brew', brewMethod: 'philips5500' },
  aiden:        { tab: 'brew',    segment: 'studio', brewStep: 'brew', brewMethod: 'aiden' },
  xbloom:       { tab: 'brew',    segment: 'studio', brewStep: 'brew', brewMethod: 'xbloom' },
  espresso:     { tab: 'brew',    segment: 'studio', brewStep: 'brew', brewMethod: 'espresso' }
};

/* Register camelCase & lowercase screen* aliases (screenSca, screenDetail, screenCompare, screenCoffee, etc.) */
const _SCREEN_FN_ALIASES = {
  screenDoor:        'door',
  screenLoadShared:  'loadshared',
  screenShop:        'shop',
  screenShops:       'shops',
  screenHistory:     'history',
  screenPerfecting:  'perfecting',
  screenDetail:      'detail',
  screenTastingEdit: 'tastedit',
  screenCompare:     'compare',
  screenStart:       'coffee',
  screenCoffee:      'coffee_facts',
  screenMethod:      'method',
  screenBrew:        'brew',
  screenGear:        'gear',
  screenRecipe:      'brew',
  screenChange:      'change',
  screenTimer:       'timer',
  screenCup:         'taste',
  screenDial:        'perfect',
  screenTastes:      'tastes',
  screenSca:         'sca',
  screenWheels:      'wheels',
  screenChart:       'chart',
  screenEy:          'ey',
  screenWater:       'water',
  screenIced:        'iced',
  screenRatio:       'ratio',
  screenYield:       'yield',
  screenCaffeine:    'caffeine',
  screenCafCup:      'cafcup',
  screenFresh:       'fresh',
  screenPrices:      'prices',
  screenCost:        'cost',
  screenBagCmp:      'bagcmp',
  screenBuy:         'buy',
  screenTend:        'tend',
  screenTpBoard:     'tpboard',
  screenTpBrewers:   'tpbrewers',
  screenTpMix:       'tpmix',
  screenLearn:       'learn',
  screenFolk:        'folk',
  screenGlossary:    'glossary',
  screenGuide:       'guide',
  screenAbout:       'about',
  screenFiles:       'files'
};

Object.keys(_SCREEN_FN_ALIASES).forEach(function(camel) {
  const target = _SCREEN_FN_ALIASES[camel];
  if (ROUTE_MAP[target]) {
    ROUTE_MAP[camel.toLowerCase()] = ROUTE_MAP[target];
  }
});

const LEGACY_55_KEYS = [
  'door', 'loadshared', 'shop', 'sdrink', 'staste', 'sperfect', 'shops',
  'history', 'perfecting', 'detail', 'tastedit', 'start', 'coffee', 'brew',
  'gear', 'recipe', 'change', 'ready', 'timer', 'cup', 'tastes', 'sca',
  'wheels', 'wheel', 'chart', 'dial', 'learn', 'tend', 'buy', 'tpboard',
  'tpshops', 'tpbrewers', 'tpmix', 'guide', 'tools', 'yield', 'ratio', 'ey',
  'water', 'iced', 'agtron', 'devices', 'cost', 'bagcmp', 'fresh', 'caffeine',
  'cafdrink', 'cafresult', 'cafcup', 'prices', 'folk', 'compare', 'about',
  'glossary', 'files'
];

const SCREENS = {};
LEGACY_55_KEYS.concat(['method', 'taste', 'tasting', 'perfect', 'coffee_facts']).forEach(function(k) {
  SCREENS[k] = function(mountEl) {
    const info = ROUTE_MAP[k] || ROUTE_MAP.door;
    if (info.brewStep) app.brewStep = info.brewStep;
    if (typeof info.focusFix === 'boolean') app.focusFix = info.focusFix;
    _renderTabInto(info.tab, mountEl || $('mount'), k);
  };
});
Object.keys(_SCREEN_FN_ALIASES).forEach(function(camel) {
  const target = _SCREEN_FN_ALIASES[camel];
  SCREENS[camel] = function(mountEl) {
    if (mountEl && mountEl.nodeType) {
      return SCREENS[target](mountEl);
    }
    go(target, mountEl);
  };
});

/* ==================== 5-STEP BREW TRAIL BAR HELPER ==================== */
const _BREW_TRAIL_DEFS = [
  { key: 'coffee', num: '1', label: 'Coffee' },
  { key: 'method', num: '2', label: 'Brewer' },
  { key: 'brew',   num: '3', label: 'Recipe' },
  { key: 'timer',  num: '4', label: 'Timer' },
  { key: 'taste',  num: '5', label: 'Taste' }
];

function _humanNavLabel(snap) {
  if (!snap) return 'Previous View';
  const tab = snap.tab || 'brew';
  const step = normalizeBrewStep(snap.brewStep || 'door');
  const scr = String(snap.screen || '').toLowerCase();
  const seg = String(snap.segment || '').toLowerCase();
  const sub = String(snap.sub || '').toLowerCase();

  if (tab === 'brew') {
    if (step === 'coffee') return 'Coffee Bag';
    if (step === 'method') return 'Brewer & Gear';
    if (step === 'brew') return 'Recipe';
    if (step === 'timer') return 'Brew Timer';
    if (step === 'taste') return 'Taste & Perfect';
    return 'Command Center';
  }
  if (tab === 'cellar') {
    if (scr === 'shop' || scr === 'sdrink' || scr === 'staste' || scr === 'sperfect' || seg === 'cafes') return 'Coffee Shop';
    if (scr === 'detail' || sub === 'detail') return 'Tasting Detail';
    if (scr === 'tastedit' || sub === 'edit') return 'Edit Tasting';
    if (scr === 'compare' || sub === 'compare') return 'Compare Brews';
    if (seg === 'journal' || scr === 'history') return 'Brew Journal';
    if (seg === 'prices' || scr === 'prices') return 'Price Tracker';
    return 'Cellar';
  }
  if (tab === 'lab') {
    if (seg === 'water' || scr === 'water') return 'Water Lab';
    if (seg === 'caffeine' || scr === 'caffeine') return 'Caffeine Curve';
    if (seg === 'agtron' || scr === 'agtron' || scr === 'fresh') return 'Roast & Freshness Lab';
    if (seg === 'vessel' || scr === 'iced' || scr === 'milk' || scr === 'ratio' || scr === 'yield') return 'Vessel & Ratio Lab';
    if (seg === 'devices' || scr === 'devices') return 'Bluetooth Gear';
    return 'Lab & Tools';
  }
  if (tab === 'palate') {
    if (seg === 'wheels' || seg === 'wheel' || scr === 'wheels') return 'Flavor Wheel';
    if (seg === 'scanner' || seg === 'matcher' || scr === 'buy') return 'Will I Love This Bag?';
    return 'Preferences & Palate';
  }
  if (tab === 'academy') {
    if (seg === 'sca' || scr === 'sca') return 'Cupping Table';
    if (seg === 'gym' || scr === 'tastes' || scr === 'blind') return 'Taste Calibrator';
    if (seg === 'glossary' || scr === 'glossary') return 'Coffee Glossary';
    if (seg === 'folk' || scr === 'folk') return 'World Coffee Culture';
    if (seg === 'vault' || scr === 'files') return 'Data Vault';
    return 'Learn & Vault';
  }
  return (TAB_DEFS[tab] && TAB_DEFS[tab].title) || 'Previous View';
}

function _captureNavSnapshot() {
  const tabKey = (app && TAB_DEFS[app.activeTab]) ? app.activeTab : 'brew';
  const snap = {
    tab: tabKey,
    brewStep: normalizeBrewStep((app && app.brewStep) || 'door'),
    screen: (app && app.screen) ? String(app.screen) : (tabKey === 'brew' ? normalizeBrewStep((app && app.brewStep) || 'door') : tabKey),
    segment: (app && app.tabSegments && app.tabSegments[tabKey]) ? String(app.tabSegments[tabKey]) : '',
    sub: (app && app.routeSub) ? String(app.routeSub) : '',
    focusFix: !!(app && app.focusFix),
    shopStep: (app && app.shopDraft && app.shopDraft.on && app.shopDraft.step) ? String(app.shopDraft.step) : ''
  };
  snap.label = _humanNavLabel(snap);
  return snap;
}

function _sameNavLocation(a, b) {
  if (!a || !b) return false;
  if (a.tab !== b.tab) return false;
  if (a.tab === 'brew') {
    return a.brewStep === b.brewStep && (a.sub || '') === (b.sub || '');
  }
  return (a.screen || '') === (b.screen || '') &&
    (a.segment || '') === (b.segment || '') &&
    (a.sub || '') === (b.sub || '') &&
    (a.shopStep || '') === (b.shopStep || '');
}

function _pushNavSnapshot(snap) {
  if (!snap) return;
  const top = _navHistoryStack.length ? _navHistoryStack[_navHistoryStack.length - 1] : null;
  if (top && _sameNavLocation(top, snap)) return;
  _navHistoryStack.push(Object.assign({}, snap));
  while (_navHistoryStack.length > _NAV_HISTORY_MAX) {
    _navHistoryStack.shift();
  }
}

function _commitRenderedNav() {
  const cur = _captureNavSnapshot();
  if (_lastCommittedNav && !_suppressHistoryPush && !_sameNavLocation(_lastCommittedNav, cur)) {
    _pushNavSnapshot(_lastCommittedNav);
  }
  _lastCommittedNav = cur;
}

function _peekValidHistoryEntry() {
  const cur = _captureNavSnapshot();
  for (let i = _navHistoryStack.length - 1; i >= 0; i--) {
    if (!_sameNavLocation(_navHistoryStack[i], cur)) {
      return _navHistoryStack[i];
    }
  }
  return null;
}

function canGoBack() {
  try {
    if (typeof BTPrecisionKeypad !== 'undefined' && BTPrecisionKeypad && typeof BTPrecisionKeypad.isOpen === 'function' && BTPrecisionKeypad.isOpen()) {
      return true;
    }
  } catch (e) {}
  if (BTSheet.isOpen()) return true;
  if (_peekValidHistoryEntry()) return true;
  if (app && app.activeTab === 'brew') {
    const curStep = normalizeBrewStep(app.brewStep || app.screen || 'door');
    return curStep !== 'door';
  }
  if (app && app.screen && PARENT[app.screen]) return true;
  if (app && app.activeTab && app.activeTab !== 'brew') return true;
  return false;
}

function backLabel() {
  if (BTSheet.isOpen()) return 'Previous View';
  const prev = _peekValidHistoryEntry();
  if (prev) return prev.label || _humanNavLabel(prev);
  if (app && app.activeTab === 'brew') {
    const curStep = normalizeBrewStep(app.brewStep || app.screen || 'door');
    const pStep = PARENT[curStep] || 'door';
    return _humanNavLabel({ tab: 'brew', brewStep: pStep, screen: pStep, segment: 'studio' });
  }
  if (app && app.screen && PARENT[app.screen]) {
    const pKey = PARENT[app.screen];
    const pInfo = ROUTE_MAP[pKey] || ROUTE_MAP.door;
    return _humanNavLabel({ tab: pInfo.tab || 'brew', brewStep: pInfo.brewStep || 'door', screen: pKey, segment: pInfo.segment || '' });
  }
  return 'Command Center';
}

function pushNavState(customSnap) {
  const snap = (customSnap && typeof customSnap === 'object')
    ? Object.assign(_captureNavSnapshot(), customSnap)
    : (_lastCommittedNav || _captureNavSnapshot());
  snap.label = snap.label || _humanNavLabel(snap);
  _pushNavSnapshot(snap);
  _lastCommittedNav = _captureNavSnapshot();
  paintChrome();
  return snap;
}

function setTabSegment(tabKey, segmentKey, subKey) {
  const t = TAB_DEFS[tabKey] ? tabKey : (app.activeTab || 'brew');
  _checkExpireJustSaved(t, app.brewStep || 'door', String(segmentKey || ''));
  const prev = _lastCommittedNav || _captureNavSnapshot();
  if (!app.tabSegments) app.tabSegments = {};
  app.tabSegments[t] = String(segmentKey || '');
  if (subKey !== undefined) app.routeSub = String(subKey || '');
  const next = _captureNavSnapshot();
  if (!_sameNavLocation(prev, next)) {
    _pushNavSnapshot(prev);
    _lastCommittedNav = next;
    navNote(true);
    paintChrome();
    scheduleDraft();
  }
  return next;
}

function buildBackPill(opts) {
  if (typeof opts === 'string') opts = { label: opts };
  opts = opts || {};
  const dest = opts.destLabel || backLabel();
  const visibleText = opts.label || (opts.short ? 'Back' : ('Back to ' + dest));
  const tipText = opts.title || ('Back to ' + dest);
  const shouldHide = opts.hideWhenRoot && !canGoBack() && !opts.fallbackRoute && typeof opts.onClick !== 'function';

  return h('button', {
    type: 'button',
    id: opts.id || false,
    class: 'bt-back-pill' + (opts.cls ? ' ' + opts.cls : ''),
    'data-bt-back-pill': '1',
    hidden: shouldHide ? true : false,
    'aria-label': opts.ariaLabel || tipText,
    title: tipText,
    onclick: function() {
      if (typeof opts.onClick === 'function') {
        opts.onClick();
      } else if (_peekValidHistoryEntry() || BTSheet.isOpen()) {
        goBack();
      } else if (opts.fallbackRoute) {
        go(opts.fallbackRoute, { fromBack: true });
      } else {
        goBack();
      }
    }
  },
    BTIcons.el('arrow-left', { size: 15 }),
    h('span', { text: visibleText })
  );
}

function buildBrewTrailBar(activeStep, opts) {
  opts = opts || {};
  const stepKey = normalizeBrewStep(activeStep || app.brewStep || 'coffee');
  const activeIdx = Math.max(0, _BREW_TRAIL_DEFS.findIndex(function(s) { return s.key === stepKey; }));
  const destLbl = backLabel();

  const homeBtn = h('button', {
    type: 'button',
    class: 'bt-trail-home',
    'aria-label': 'Morning Command Center Home',
    title: 'Back to Command Center',
    onclick: function() { go('door'); }
  }, BTIcons.el('home', { size: 15 }));

  const backBtn = opts.hideBack ? null : h('button', {
    type: 'button',
    id: 'backBtn',
    class: 'bt-trail-back',
    'aria-label': 'Back to ' + destLbl,
    title: 'Back to ' + destLbl,
    onclick: function() { goBack(); }
  }, BTIcons.el('arrow-left', { size: 15 }));

  const stepBtns = _BREW_TRAIL_DEFS.map(function(st, idx) {
    const isCurrent = idx === activeIdx;
    const isDone = idx < activeIdx;
    return h('button', {
      type: 'button',
      class: 'bt-trail-step' + (isCurrent ? ' is-active' : (isDone ? ' is-done' : '')),
      'data-brew-step': st.key,
      'aria-current': isCurrent ? 'step' : false,
      onclick: function() {
        if (st.key === 'timer') BTTimerAudio.unlock();
        go(st.key);
      }
    },
      h('span', { class: 'bt-trail-num', text: st.num }),
      h('span', { text: st.label })
    );
  });

  return h('nav', {
    class: 'bt-trail-bar',
    'data-bt-trail': stepKey,
    'aria-label': '5-Step Guided Brew Trail'
  }, homeBtn, backBtn, stepBtns);
}

function setPrimaryCta(cfg) {
  const shelf = $('cta-shelf');
  if (!shelf) return;
  shelf.textContent = '';
  if (!cfg) {
    shelf.hidden = true;
    return;
  }
  shelf.hidden = false;
  const inner = h('div', { class: 'bt-sticky-cta-inner' });
  if (cfg.secondaryText && typeof cfg.onSecondary === 'function') {
    inner.appendChild(h('button', {
      type: 'button',
      class: 'bt-btn',
      style: 'min-height:50px',
      onclick: cfg.onSecondary,
      text: cfg.secondaryText
    }));
  }
  inner.appendChild(h('button', {
    type: 'button',
    class: 'bt-hero-cta',
    onclick: cfg.onClick
  },
    h('span', { class: 'bt-hero-cta-copy' },
      h('span', { text: cfg.label || 'Continue →' }),
      cfg.sub ? h('span', { class: 'bt-hero-cta-sub', text: cfg.sub }) : null
    ),
    BTIcons.el('arrow-right', { size: 18 })
  ));
  shelf.appendChild(inner);
}

/* ==================== RENDER, NAVIGATION & BACK ==================== */
function _renderFallbackTab(tabKey, mountEl) {
  const meta = TAB_DEFS[tabKey] || TAB_DEFS.brew;
  const seg = (app.tabSegments && app.tabSegments[tabKey]) || 'studio';
  const card = h('section', { class: 'bt-card', 'data-tab-fallback': tabKey },
    h('div', { style: 'display:flex;align-items:center;gap:12px;margin-bottom:8px' },
      BTIcons.el(meta.icon, { size: 24 }),
      h('h1', { text: meta.title })
    ),
    h('p', { style: 'color:var(--ink-secondary)', text: 'Active view: ' + seg + (app.routeSub ? ' (' + app.routeSub + ')' : '') })
  );
  mountEl.appendChild(card);
}

function _renderTabInto(tabKey, mountEl, routeKey) {
  if (!mountEl) return;
  const detailPane = $('detail-pane');
  if (detailPane) detailPane.textContent = '';
  setPrimaryCta(null);

  const fn = _tabRegistry.get(tabKey);
  const ctx = {
    tab: tabKey,
    brewStep: app.brewStep || 'door',
    focusFix: !!app.focusFix,
    segment: (app.tabSegments && app.tabSegments[tabKey]) || '',
    sub: app.routeSub || '',
    route: routeKey || app.screen || tabKey,
    detailPane: detailPane,
    studioAside: $('studio-aside'),
    isSplit: typeof window !== 'undefined' && window.innerWidth >= 1024,
    shell: BTShell
  };

  if (typeof fn === 'function') {
    const res = fn(mountEl, ctx);
    if (res && res.nodeType && !mountEl.contains(res)) {
      mountEl.appendChild(res);
    }
  } else {
    _renderFallbackTab(tabKey, mountEl);
  }

  /* Top chrome (#top-back-btn on <1024px) & desktop left rail (#rail-back-btn on >=1024px)
     provide persistent app-level <- Back without stacking a duplicate bar inside #mount. */
  Beanjamin.enforceSinglePerViewport(mountEl);
}

let _renderSeq = 0;
let _dispatchingRoute = '';

function render() {
  _renderSeq++;
  refreshers.length = 0;
  BTScienceLens.hideLoupe();

  const mountEl = $('mount');
  if (!mountEl) return;
  mountEl.textContent = '';

  const tabKey = TAB_DEFS[app.activeTab] ? app.activeTab : 'brew';
  app.activeTab = tabKey;
  if (!app.brewStep) app.brewStep = 'door';

  /* Commit navigation transition BEFORE _renderTabInto so canGoBack() / buildBackPill() see the exact prior view */
  _commitRenderedNav();

  if (typeof document !== 'undefined' && document.body) {
    document.body.setAttribute('data-screen', app.screen || tabKey);
    document.body.setAttribute('data-tab', tabKey);
    document.body.setAttribute('data-brew-step', app.brewStep);
  }

  _renderTabInto(tabKey, mountEl, app.screen);
  paintChrome();
  paintStudioAside();
}

let _navNoteSeq = 0;

function navNote(push) {
  _navNoteSeq++;
  try {
    if (typeof window === 'undefined' || !window.history) return;
    const snap = _captureNavSnapshot();
    const st = {
      btV6: 1,
      navIdx: _navHistoryStack.length,
      screen: snap.screen,
      tab: snap.tab,
      brewStep: snap.brewStep,
      segment: snap.segment,
      sub: snap.sub,
      focusFix: snap.focusFix,
      shopStep: snap.shopStep
    };
    if (push) window.history.pushState(st, '');
    else window.history.replaceState(st, '');
  } catch (e) {}
}

function _checkExpireJustSaved(nextTab, nextStep, nextSeg) {
  if (!app || !app.justSavedTasting) return;
  const jst = app.justSavedTasting;
  const ageMs = Date.now() - (+jst.at || 0);
  if (ageMs >= 30000 || jst.dismissed) {
    app.justSavedTasting = null;
    return;
  }
  if (jst._shownOnPalate && (nextTab !== 'palate' || (nextSeg && nextSeg !== 'dna'))) {
    app.justSavedTasting = null;
    return;
  }
  if (jst._shownOnDoor && (nextTab !== 'brew' || normalizeBrewStep(nextStep || 'door') !== 'door')) {
    app.justSavedTasting = null;
  }
}

function _restoreNavSnapshot(snap, opts) {
  if (!snap) return false;
  opts = opts || {};
  const prevSuppress = _suppressHistoryPush;
  _suppressHistoryPush = true;
  try {
    const t = TAB_DEFS[snap.tab] ? snap.tab : 'brew';
    const nextSt = normalizeBrewStep(snap.brewStep || 'door');
    _checkExpireJustSaved(t, nextSt, snap.segment || '');
    app.activeTab = t;
    app.brewStep = nextSt;
    app.screen = snap.screen || (t === 'brew' ? app.brewStep : t);
    if (!app.tabSegments) app.tabSegments = {};
    if (snap.segment) app.tabSegments[t] = snap.segment;
    app.routeSub = snap.sub || '';
    app.focusFix = !!snap.focusFix;
    if (snap.shopStep && app.shopDraft) {
      app.shopDraft.step = snap.shopStep;
    }
    draftAt = Date.now();
    render();
    if (!opts.fromPopState) {
      navNote(false);
    }
    if (typeof window !== 'undefined' && window.scrollTo && !BTSheet.isOpen()) {
      try { window.scrollTo({ top: 0 }); } catch (e) {}
    }
    scheduleDraft();
  } finally {
    _suppressHistoryPush = prevSuppress;
  }
  return true;
}

function switchTab(tabKey, opts) {
  opts = opts || {};
  const k = String(tabKey || 'brew').trim().toLowerCase();
  const target = k === 'learn' ? 'academy' : ((k === 'prefs' || k === 'preferences') ? 'palate' : (TAB_DEFS[k] ? k : 'brew'));
  if (BTSheet.isOpen()) BTSheet.close();

  const prevSuppress = _suppressHistoryPush;
  if (opts.fromBack) _suppressHistoryPush = true;

  try {
    const nextSeg = opts.segment ? String(opts.segment) : ((app.tabSegments && app.tabSegments[target]) || '');
    const nextStep = target === 'brew' ? ((app.activeTab === 'brew' && app.brewStep !== 'door') ? 'door' : (app.brewStep || 'door')) : (app.brewStep || 'door');
    _checkExpireJustSaved(target, nextStep, nextSeg);

    if (target === 'brew') {
      if (app.activeTab === 'brew' && app.brewStep !== 'door') {
        app.brewStep = 'door';
        app.screen = 'door';
        app.focusFix = false;
      } else {
        app.activeTab = 'brew';
        app.screen = app.brewStep || 'door';
      }
    } else {
      app.activeTab = target;
      app.screen = target;
      app.routeSub = '';
      if (opts.segment) {
        app.tabSegments = app.tabSegments || {};
        app.tabSegments[target] = String(opts.segment);
      }
    }

    draftAt = Date.now();
    render();
    if (app.justSavedTasting && app.activeTab === 'brew' && app.brewStep === 'door' && !app.justSavedTasting._shownOnPalate) {
      app.justSavedTasting._shownOnDoor = true;
    }
    navNote(!opts.fromBack);
    if (typeof window !== 'undefined' && window.scrollTo) {
      try { window.scrollTo({ top: 0 }); } catch (e) {}
    }
    scheduleDraft();
  } finally {
    _suppressHistoryPush = prevSuppress;
  }
}

function go(routeOrTabKey, payload) {
  const raw = String(routeOrTabKey || 'brew').trim();
  const key = raw.toLowerCase();
  const fromBack = !!(payload && typeof payload === 'object' && (payload.fromBack || payload._skipHistoryPush));

  /* Direct registered sheet shortcut if called via go('workflow-tools') / go('my-coffees') */
  if (_sheetRegistry.has(key) && !ROUTE_MAP[key] && !TAB_DEFS[key]) {
    BTSheet.open(key, payload);
    return;
  }

  const prevSuppress = _suppressHistoryPush;
  if (fromBack) _suppressHistoryPush = true;

  try {
    const info = ROUTE_MAP[key] || (TAB_DEFS[key] ? { tab: key, segment: app.tabSegments[key] || '' } : ROUTE_MAP.door);
    const targetTab = info.tab || 'brew';
    _checkExpireJustSaved(targetTab, info.brewStep || app.brewStep || 'door', info.segment || '');

    app.screen = ROUTE_MAP[key] ? key : (TAB_DEFS[key] ? key : 'door');
    app.activeTab = targetTab;
    if (info.segment) app.tabSegments[targetTab] = info.segment;
    app.routeSub = (payload && typeof payload === 'object' && typeof payload.sub === 'string') ? payload.sub : (info.sub || '');

    if (info.brewStep) {
      app.brewStep = info.brewStep;
    }
    if (typeof info.focusFix === 'boolean') {
      app.focusFix = info.focusFix;
    } else if (payload && typeof payload === 'object' && typeof payload.focusFix === 'boolean') {
      app.focusFix = payload.focusFix;
    }
    if (info.brewMethod) {
      app.brew.method = info.brewMethod;
    }
    if (info.shopStep) {
      saveShopDraft({ step: info.shopStep, on: true });
    }
    draftAt = Date.now();

    if (!info.sheet && BTSheet.isOpen() && !(payload && payload.keepSheet)) {
      BTSheet.close();
    }

    const customHandler = _routeRegistry.get(key);
    const effPayload = payload !== undefined ? payload : info.payload;

    if (customHandler && _dispatchingRoute !== key) {
      const beforeSeq = _renderSeq;
      const beforeNoteSeq = _navNoteSeq;
      _dispatchingRoute = key;
      try {
        customHandler(effPayload, {
          route: key,
          tab: targetTab,
          brewStep: app.brewStep,
          segment: app.tabSegments[targetTab],
          sub: app.routeSub,
          mount: $('mount'),
          detailPane: $('detail-pane'),
          shell: BTShell
        });
      } finally {
        _dispatchingRoute = '';
      }
      if (ROUTE_MAP[key] && app.activeTab === targetTab && !info.sheet) {
        app.screen = key;
        if (typeof document !== 'undefined' && document.body) {
          document.body.setAttribute('data-screen', key);
        }
      }
      if (_renderSeq === beforeSeq) {
        render();
      }
      if (info.sheet) {
        BTSheet.open(info.sheet, effPayload, { detent: info.detent || 'half', title: _sheetTitles[info.sheet] });
      }
      navNote(_navNoteSeq === beforeNoteSeq ? !fromBack : false);
    } else {
      render();
      if (info.sheet) {
        BTSheet.open(info.sheet, effPayload, { detent: info.detent || 'half', title: _sheetTitles[info.sheet] });
      }
      navNote(!fromBack);
    }

    if (app.justSavedTasting && app.activeTab === 'brew' && app.brewStep === 'door' && !app.justSavedTasting._shownOnPalate) {
      app.justSavedTasting._shownOnDoor = true;
    }
    if (typeof window !== 'undefined' && window.scrollTo && !BTSheet.isOpen()) {
      try { window.scrollTo({ top: 0 }); } catch (e) {}
    }
    scheduleDraft();
  } finally {
    _suppressHistoryPush = prevSuppress;
  }
}

function goBack(opts) {
  opts = opts || {};
  try {
    if (typeof BTPrecisionKeypad !== 'undefined' && BTPrecisionKeypad && typeof BTPrecisionKeypad.isOpen === 'function' && BTPrecisionKeypad.isOpen()) {
      BTPrecisionKeypad.close();
      return true;
    }
  } catch (e) {}
  if (BTSheet.isOpen()) {
    BTSheet.close();
    return true;
  }

  /* Pop any duplicate entries matching current state, then restore the latest genuine previous snapshot */
  const cur = _captureNavSnapshot();
  while (_navHistoryStack.length > 0 && _sameNavLocation(_navHistoryStack[_navHistoryStack.length - 1], cur)) {
    _navHistoryStack.pop();
  }
  if (_navHistoryStack.length > 0) {
    const prev = _navHistoryStack.pop();
    return _restoreNavSnapshot(prev, opts);
  }

  /* Cold-reload fallback along PARENT hierarchy without pushing a ping-pong loop */
  if (app.activeTab === 'brew') {
    const curStep = normalizeBrewStep(app.brewStep || app.screen || 'door');
    if (curStep === 'door') return false;
    const parentStep = PARENT[curStep] || 'door';
    go(parentStep, { fromBack: true });
    return true;
  }
  const parentRoute = PARENT[app.screen];
  if (parentRoute) {
    go(parentRoute, { fromBack: true });
    return true;
  }
  go('door', { fromBack: true });
  return true;
}

/* ==================== CHROME, RAIL & RIGHT STUDIO ASIDE PAINTING ==================== */
function _roastColorFor(roast) {
  const r = String(roast || '').toLowerCase();
  if (r.indexOf('ultra') >= 0 || r.indexOf('very') >= 0 || r === '1') return 'var(--roast-1)';
  if (r === 'light' || r === '2') return 'var(--roast-2)';
  if (r.indexOf('med-light') >= 0 || r.indexOf('medium-light') >= 0 || r === 'omni' || r === '3') return 'var(--roast-3)';
  if (r.indexOf('med-dark') >= 0 || r.indexOf('medium-dark') >= 0 || r === '5') return 'var(--roast-5)';
  if (r.indexOf('dark') >= 0 || r === '6') return 'var(--roast-6)';
  return 'var(--roast-4)';
}

function _humanFsmLabel(rawFsm) {
  const f = String(rawFsm || 'IDLE').toUpperCase();
  if (f === 'ARMED') return 'Ready to Pour';
  if (f === 'POURING') return 'Pouring';
  if (f === 'DRAWDOWN') return 'Draining';
  if (f === 'LOCKED_YIELD') return 'Cup Done';
  if (f === 'R2_READY') return 'Sample Ready';
  return 'Standby';
}

function _readBleSummary() {
  try {
    if (typeof window !== 'undefined' && window.BTBle && typeof window.BTBle.getState === 'function') {
      const st = window.BTBle.getState() || {};
      const slots = st.slots || {};
      const fsm = st.fsmState || (st.autoPilot && st.autoPilot.state) || 'IDLE';
      const fsmHuman = _humanFsmLabel(fsm);
      const scaleOn = !!((slots.scale && slots.scale.connected) || st.scaleConnected);
      const pressOn = !!((slots.pressure && slots.pressure.connected) || st.pressureConnected);
      const r2On = !!((slots.refractometer && slots.refractometer.connected) || st.refractometerConnected);
      const omniOn = !!((slots.omni && slots.omni.connected) || st.omniConnected);
      const machOn = !!((slots.machine && slots.machine.connected) || st.xbloomConnected || st.kettleConnected || st.machineConnected);

      const pNum = typeof st.pressureBar === 'number' && isFinite(st.pressureBar)
        ? st.pressureBar
        : (st.pressure && typeof st.pressure.bar === 'number' && isFinite(st.pressure.bar) ? st.pressure.bar : 0);

      if (scaleOn) {
        const sc = st.scale || slots.scale || st;
        const w = typeof st.weightG === 'number' && isFinite(st.weightG)
          ? st.weightG
          : (sc && typeof sc.weightG === 'number' && isFinite(sc.weightG) ? sc.weightG : 0);
        const wTxt = w.toFixed(1) + 'g';
        const fl = typeof st.flowRateGs === 'number' && isFinite(st.flowRateGs) ? st.flowRateGs : 0;
        if (pressOn && pNum > 0.1 && Math.abs(w) < 0.2 && Math.abs(fl) < 0.1) {
          const pIdleTxt = pNum.toFixed(1) + ' bar';
          return {
            active: true,
            sim: !!(st.simulatorActive || (sc && sc.simulator)),
            label: pIdleTxt,
            fsm: fsm,
            fsmHuman: fsmHuman,
            title: 'Live Scale: ' + wTxt + ' \u00B7 ' + pIdleTxt + ' (' + fsmHuman + ')'
          };
        }
        const pressSuffix = (pressOn && pNum > 0.1) ? (' \u00B7 ' + pNum.toFixed(1) + ' bar') : '';
        return {
          active: true,
          sim: !!(st.simulatorActive || (sc && sc.simulator)),
          label: wTxt,
          fsm: fsm,
          fsmHuman: fsmHuman,
          title: 'Live Scale: ' + wTxt + pressSuffix + ' (' + fsmHuman + ')'
        };
      }
      if (pressOn) {
        const pTxt = pNum.toFixed(1) + ' bar';
        return { active: true, sim: !!st.simulatorActive, label: pTxt, fsm: fsm, fsmHuman: fsmHuman, title: 'Espresso Pressure: ' + pTxt };
      }
      if (r2On) {
        const r2Lbl = st.lastTds > 0 ? ((+st.lastTds).toFixed(2) + '% TDS') : 'R2 Ready';
        return { active: true, sim: !!st.simulatorActive, label: r2Lbl, fsm: fsm, fsmHuman: fsmHuman, title: 'DiFluid R2: ' + r2Lbl };
      }
      if (omniOn) {
        const om = st.lastOmni || st.omni || null;
        const agNum = (om && om.beanAgtron > 0)
          ? om.beanAgtron
          : (om && om.groundAgtron > 0 ? om.groundAgtron : (om && om.agtron > 0 ? om.agtron : 0));
        const omLbl = agNum > 0 ? ('Ag ' + Math.round(agNum)) : 'Omni';
        return { active: true, sim: !!st.simulatorActive, label: omLbl, fsm: fsm, fsmHuman: fsmHuman, title: 'DiFluid Omni: ' + omLbl };
      }
      if (machOn) {
        const mLbl = st.kettleTempC > 0 ? (Math.round(st.kettleTempC) + '\u00B0C') : (st.xbloomConnected ? 'xBloom' : 'Gear');
        const mTitle = st.kettleTempC > 0
          ? ('Stagg Kettle: ' + mLbl)
          : (st.xbloomConnected ? ('xBloom Studio' + (st.xbloomStage && st.xbloomStage !== 'idle' ? ' (' + st.xbloomStage + ')' : '')) : 'Smart Brewer / Kettle Connected');
        return { active: true, sim: !!st.simulatorActive, label: mLbl, fsm: fsm, fsmHuman: fsmHuman, title: mTitle };
      }
      if (st.simulatorActive) {
        const simWTxt = (typeof st.weightG === 'number' && isFinite(st.weightG)) ? (st.weightG.toFixed(1) + 'g') : 'Sim';
        return { active: true, sim: true, label: simWTxt, fsm: fsm, fsmHuman: fsmHuman, title: 'Scale Simulator: ' + simWTxt + ' (' + fsmHuman + ')' };
      }
    }
  } catch (e) {}
  return { active: false, sim: false, label: '', fsm: 'IDLE', fsmHuman: 'Standby', title: 'Bluetooth Scales, R2, Omni & Smart Gear' };
}

function _buildNavItems(isDock) {
  return TAB_ORDER.map(function(k) {
    const def = TAB_DEFS[k];
    const isCurrent = app.activeTab === k;
    return h('button', {
      type: 'button',
      class: isDock ? 'bt-dock-tab' : 'bt-rail-tab',
      'data-tab-btn': k,
      'aria-current': isCurrent ? 'page' : false,
      'aria-label': def.title,
      onclick: function() { switchTab(k); }
    },
    BTIcons.el(def.icon, { size: isDock ? 21 : 20 }),
    h('span', { text: isDock ? def.label : def.railLabel }));
  });
}

let _navBuilt = false;

function buildStaticChrome() {
  if (_navBuilt) return;

  /* Mobile 52px Top Back Button + Brand Mark + Wordmark */
  const topBrand = $('top-brand-btn');
  if (topBrand) {
    if (!$('top-back-btn') && topBrand.parentNode) {
      const topBackBtn = h('button', {
        type: 'button',
        id: 'top-back-btn',
        class: 'bt-top-back-btn',
        hidden: true,
        'aria-label': 'Back',
        title: 'Back',
        onclick: function() { goBack(); }
      },
        BTIcons.el('arrow-left', { size: 14 }),
        h('span', { id: 'top-back-label', text: 'Back' })
      );
      topBrand.parentNode.insertBefore(topBackBtn, topBrand);
    }
    topBrand.textContent = '';
    topBrand.append(
      h('span', { class: 'bt-top-brand-mark', html: BTBrand.logoSvg({ size: 28, optical: 'micro' }) }),
      h('span', { class: 'bt-top-brand-name', html: 'Bean<span>Telligence</span>' })
    );
    topBrand.onclick = function() { go('door'); };
  }

  /* Desktop Left Rail Brand + Contextual Back Button */
  const railWm = $('rail-wordmark-btn');
  if (railWm) {
    railWm.textContent = '';
    railWm.append(
      h('span', { style: 'width:32px;height:32px;flex:none', html: BTBrand.logoSvg({ optical: 'standard' }) }),
      h('div', { style: 'min-width:0' },
        h('div', { class: 'bt-rail-brand-title', html: 'Bean<span>Telligence</span>' }),
        h('div', { class: 'bt-rail-brand-sub', text: 'Specialty Studio' })
      )
    );
    railWm.onclick = function() { go('door'); };
    if (!$('rail-back-btn') && railWm.parentNode) {
      const railBackBtn = h('button', {
        type: 'button',
        id: 'rail-back-btn',
        class: 'bt-rail-back-btn',
        hidden: true,
        'aria-label': 'Back',
        title: 'Back',
        onclick: function() { goBack(); }
      },
        BTIcons.el('arrow-left', { size: 15 }),
        h('span', { id: 'rail-back-label', text: 'Back' })
      );
      railWm.parentNode.insertBefore(railBackBtn, railWm.nextSibling);
    }
  }

  /* Top My Gear Pill (ALWAYS opens 'workflow-tools' -> 'My Gear & Setup') */
  const gearPill = $('top-gear-pill');
  if (gearPill) {
    gearPill.onclick = function() {
      BTSheet.open('workflow-tools', {}, { detent: 'full', title: 'My Gear & Setup' });
    };
  }

  /* Top BLE / Smart Gear Button (ALWAYS opens 'ble-devices' whether active or unpaired) */
  const blePill = $('top-ble-pill');
  if (blePill) {
    blePill.onclick = function() {
      if (_sheetRegistry.has('ble-devices')) {
        BTSheet.open('ble-devices', null, { detent: 'full', title: 'Bluetooth Scales, R2, Omni & Smart Gear' });
      } else {
        BTSheet.open('workflow-tools', null, { detent: 'full' });
      }
    };
  }

  /* Top Compact Start | Comfy | Sci Experience Lens Pill */
  const lensSeg = $('top-lens-seg');
  if (lensSeg) {
    const segBtns = lensSeg.querySelectorAll('button[data-lens-mode]');
    for (let i = 0; i < segBtns.length; i++) {
      segBtns[i].onclick = function() {
        BTScienceLens.setMode(this.getAttribute('data-lens-mode'));
      };
    }
  }

  /* Top Light / Dark Theme Button */
  const themeBtn = $('top-theme-btn');
  if (themeBtn) {
    themeBtn.onclick = function() {
      const next = resolvedTheme(app.prefs.theme) === 'dark' ? 'light' : 'dark';
      app.prefs.theme = next;
      applyTheme(next);
      try { if (window.BTHaptics && window.BTHaptics.tick) window.BTHaptics.tick(); } catch (e) {}
      writePrefsMirror();
      scheduleDraft();
      paintChrome();
      paintStudioAside();
    };
  }

  /* Mobile Keyboard Viewport Guard */
  if (typeof document !== 'undefined') {
    let kbBlurTimer = null;
    document.addEventListener('focusin', function(e) {
      const t = e && e.target;
      if (!t || !t.tagName) return;
      const tag = t.tagName.toUpperCase();
      if (tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable || (tag === 'INPUT' && !/^(checkbox|radio|button|submit|range|file|color)$/i.test(t.type || 'text'))) {
        clearTimeout(kbBlurTimer);
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
          document.documentElement.classList.add('bt-kb-open');
        }
      }
    });
    document.addEventListener('focusout', function() {
      clearTimeout(kbBlurTimer);
      kbBlurTimer = setTimeout(function() {
        if (document.documentElement) document.documentElement.classList.remove('bt-kb-open');
      }, 90);
    });
  }

  BTSheet.bindGestures();
  _navBuilt = true;
}

function paintGearPill() {
  const pill = $('top-gear-pill');
  if (!pill) return;
  const grinderShort = _resolveActiveGrinderShort();
  const ownedN = Array.isArray(app && app.prefs && app.prefs.ownedBrewers) ? app.prefs.ownedBrewers.length : 0;
  const configured = !!(grinderShort || ownedN > 0);
  const tip = grinderShort
    ? ('My Gear & Setup · ' + grinderShort + (ownedN ? ' · ' + ownedN + ' brewers' : ''))
    : (ownedN ? ('My Gear & Setup · ' + ownedN + ' brewers') : 'My Gear and Brewers Setup');

  pill.textContent = '';
  pill.setAttribute('data-configured', configured ? 'true' : 'false');
  pill.setAttribute('aria-label', tip);
  pill.title = tip;
  _appendKids(pill, [
    BTIcons.el('grinder-burr', { size: 15 }),
    h('span', { class: 'bt-gear-label bt-gear-label-full', text: 'My Gear' }),
    h('span', { class: 'bt-gear-label bt-gear-label-short', text: 'Gear' }),
    grinderShort ? h('span', { class: 'bt-gear-dot', 'aria-hidden': 'true' }) : null,
    grinderShort ? h('span', { class: 'bt-gear-grinder-badge', text: grinderShort }) : null
  ]);
}

function paintBlePill() {
  const ble = _readBleSummary();
  const pill = $('top-ble-pill');
  if (pill) {
    pill.textContent = '';
    pill.setAttribute('data-active', (ble.active && !ble.sim) ? 'true' : 'false');
    pill.setAttribute('data-sim', ble.sim ? 'true' : 'false');
    pill.setAttribute('aria-label', ble.title);
    pill.title = ble.title;
    _appendKids(pill, [
      h('span', { class: 'bt-status-dot' + (ble.active ? (ble.sim ? ' is-sim' : ' is-live') : '') }),
      BTIcons.el('ble-wave', { size: 15 }),
      ble.label ? h('span', { class: 'mono', text: ble.label }) : null
    ]);
  }
  const railFooter = $('rail-footer');
  if (railFooter) {
    const bleRow = railFooter.querySelector('[data-rail-ble="1"]');
    if (bleRow) {
      const dot = bleRow.querySelector('.bt-status-dot');
      if (dot) dot.className = 'bt-status-dot' + (ble.active ? (ble.sim ? ' is-sim' : ' is-live') : '');
      const txt = bleRow.querySelector('.bt-rail-ble-txt');
      if (txt) txt.textContent = ble.active ? ble.title : 'Bluetooth Gear';
    }
  }
  const aside = $('studio-aside');
  if (aside) {
    const fsmEl = aside.querySelector('[data-aside-fsm="1"]');
    if (fsmEl) fsmEl.textContent = 'Smart Scale: ' + (ble.fsmHuman || _humanFsmLabel(ble.fsm));
  }
}

let _bleShellSubSource = null;
let _bleShellSubUnsub = null;
let _blePillLastPaintMs = 0;
let _blePillThrottleTimer = null;
let _blePrevConnSig = '';

function _scheduleBlePillPaint(st) {
  const now = Date.now();
  let connSig = '';
  if (st && typeof st === 'object') {
    const sl = st.slots || {};
    connSig = [
      (sl.scale && sl.scale.connected) || st.scaleConnected ? 1 : 0,
      (sl.pressure && sl.pressure.connected) || st.pressureConnected ? 1 : 0,
      (sl.refractometer && sl.refractometer.connected) || st.refractometerConnected ? 1 : 0,
      (sl.omni && sl.omni.connected) || st.omniConnected ? 1 : 0,
      (sl.machine && sl.machine.connected) || st.kettleConnected || st.xbloomConnected || st.machineConnected ? 1 : 0,
      st.simulatorActive ? 1 : 0,
      st.lastTds > 0 ? (+st.lastTds).toFixed(2) : '',
      st.lastOmni && (st.lastOmni.beanAgtron || st.lastOmni.groundAgtron || st.lastOmni.agtron) ? Math.round(st.lastOmni.beanAgtron || st.lastOmni.groundAgtron || st.lastOmni.agtron) : ''
    ].join('|');
  }
  const sigChanged = connSig !== _blePrevConnSig;
  _blePrevConnSig = connSig;

  if (sigChanged || (now - _blePillLastPaintMs >= 250)) {
    if (_blePillThrottleTimer) {
      clearTimeout(_blePillThrottleTimer);
      _blePillThrottleTimer = null;
    }
    _blePillLastPaintMs = now;
    paintBlePill();
    return;
  }
  if (!_blePillThrottleTimer) {
    const waitMs = Math.max(40, 250 - (now - _blePillLastPaintMs));
    _blePillThrottleTimer = setTimeout(function() {
      _blePillThrottleTimer = null;
      _blePillLastPaintMs = Date.now();
      paintBlePill();
    }, waitMs);
  }
}

function _bindShellBleSubscription() {
  if (typeof window === 'undefined' || !window.BTBle || typeof window.BTBle.subscribe !== 'function') return;
  if (_bleShellSubSource === window.BTBle) return;
  if (_bleShellSubUnsub) {
    try { _bleShellSubUnsub(); } catch (e) {}
    _bleShellSubUnsub = null;
  }
  _bleShellSubSource = window.BTBle;
  try {
    _bleShellSubUnsub = window.BTBle.subscribe(function(st) {
      _scheduleBlePillPaint(st);
    });
  } catch (e) {}
}
_bindShellBleSubscription();

let _popStateBound = false;
function _bindShellPopState() {
  if (_popStateBound || typeof window === 'undefined' || !window.addEventListener) return;
  _popStateBound = true;
  window.addEventListener('popstate', function(e) {
    try {
      if (typeof BTPrecisionKeypad !== 'undefined' && BTPrecisionKeypad && typeof BTPrecisionKeypad.isOpen === 'function' && BTPrecisionKeypad.isOpen()) {
        BTPrecisionKeypad.close();
        if (e && e.stopImmediatePropagation) e.stopImmediatePropagation();
        return;
      }
    } catch (err) {}
    if (BTSheet.isOpen()) {
      BTSheet.close();
      if (e && e.stopImmediatePropagation) e.stopImmediatePropagation();
      return;
    }
    const st = e && e.state;
    if (st && st.btV6) {
      if (typeof st.navIdx === 'number' && st.navIdx >= 0 && st.navIdx <= _navHistoryStack.length) {
        _navHistoryStack.length = st.navIdx;
      } else if (_navHistoryStack.length > 0 && _sameNavLocation(_navHistoryStack[_navHistoryStack.length - 1], st)) {
        _navHistoryStack.pop();
      }
      _restoreNavSnapshot(st, { fromPopState: true });
      if (e && e.stopImmediatePropagation) e.stopImmediatePropagation();
      return;
    }
    if (_navHistoryStack.length > 0) {
      goBack({ fromPopState: true });
      if (e && e.stopImmediatePropagation) e.stopImmediatePropagation();
    }
  });
}
_bindShellPopState();

function paintChrome() {
  buildStaticChrome();
  _bindShellPopState();
  _bindShellBleSubscription();

  /* 0. Universal Top-Chrome & Desktop Rail Back Buttons */
  const hasBack = canGoBack();
  const destLabel = backLabel();
  const topBackBtn = $('top-back-btn');
  if (topBackBtn) {
    topBackBtn.hidden = !hasBack;
    const tip = 'Back to ' + destLabel;
    topBackBtn.setAttribute('aria-label', tip);
    topBackBtn.title = tip;
    if (topBackBtn.parentNode && topBackBtn.parentNode.classList) {
      topBackBtn.parentNode.classList.toggle('has-back', hasBack);
    }
  }
  const railBackBtn = $('rail-back-btn');
  if (railBackBtn) {
    railBackBtn.hidden = !hasBack;
    const rTip = 'Back to ' + destLabel;
    railBackBtn.setAttribute('aria-label', rTip);
    railBackBtn.title = rTip;
    const rLbl = $('rail-back-label');
    if (rLbl) rLbl.textContent = rTip;
  }

  /* 1. Gear & BLE Pills */
  paintGearPill();
  paintBlePill();

  /* 2. Experience Lens Pill (Mobile Start | Comfy | Sci + Desktop Left Rail) */
  const lv = BTScienceLens.level();
  const lensSeg = $('top-lens-seg');
  if (lensSeg) {
    const btns = lensSeg.querySelectorAll('button[data-lens-mode]');
    for (let i = 0; i < btns.length; i++) {
      const bm = normalizeExperienceLevel(btns[i].getAttribute('data-lens-mode'));
      btns[i].setAttribute('aria-pressed', String(bm === lv));
    }
  }

  const railLensBox = $('rail-lens-box');
  if (railLensBox) {
    railLensBox.textContent = '';
    _appendKids(railLensBox, [
      h('div', { class: 'bt-rail-box-label', text: 'Experience Lens' }),
      [
        ['starter',   'Just Starting'],
        ['comfy',     'Comfy Brewer'],
        ['scientist', 'Bean Scientist']
      ].map(function(item) {
        const on = lv === item[0];
        return h('button', {
          type: 'button',
          class: 'bt-rail-lens-btn',
          'data-lens-mode': item[0],
          'aria-pressed': String(on),
          onclick: function() { BTScienceLens.setMode(item[0]); }
        },
          h('span', { text: item[1] }),
          on ? BTIcons.el('check-seal', { size: 15 }) : null
        );
      })
    ]);
  }

  /* 3. Theme Toggle */
  const actualTheme = resolvedTheme(app.prefs.theme);
  const themeBtn = $('top-theme-btn');
  if (themeBtn) {
    themeBtn.textContent = '';
    themeBtn.appendChild(BTIcons.el(actualTheme === 'dark' ? 'sun-light' : 'moon-dark', { size: 17 }));
    const thLbl = actualTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    themeBtn.setAttribute('aria-label', thLbl);
    themeBtn.title = thLbl;
  }

  /* 4. Bottom Dock & Desktop Left Rail Tabs */
  const dock = $('bottom-dock');
  if (dock) {
    dock.textContent = '';
    _appendKids(dock, _buildNavItems(true));
  }
  const railTabs = $('rail-tabs');
  if (railTabs) {
    railTabs.textContent = '';
    _appendKids(railTabs, _buildNavItems(false));
  }

  /* 5. Desktop Left Rail My Gear, Cupping Table, BLE & Theme Box */
  const railFooter = $('rail-footer');
  if (railFooter) {
    railFooter.textContent = '';
    const ble = _readBleSummary();
    const grinderShort = _resolveActiveGrinderShort();
    _appendKids(railFooter, [
      h('div', { class: 'bt-rail-box-label', text: 'My Gear & Cupping' }),
      h('button', {
        type: 'button',
        class: 'bt-rail-tool-btn',
        'data-rail-gear': '1',
        onclick: function() { BTSheet.open('workflow-tools', {}, { detent: 'full', title: 'My Gear & Setup' }); }
      },
        h('span', { style: 'display:inline-flex;align-items:center;gap:7px;min-width:0' },
          BTIcons.el('grinder-burr', { size: 15 }),
          h('span', { style: 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap', text: grinderShort ? ('My Gear · ' + grinderShort) : 'My Gear' })
        ),
        BTIcons.el('chevron-right', { size: 14 })
      ),
      h('button', {
        type: 'button',
        class: 'bt-rail-tool-btn',
        'data-rail-cupping': '1',
        onclick: function() { go('sca'); }
      },
        h('span', { style: 'display:inline-flex;align-items:center;gap:7px' },
          BTIcons.el('salami-cups', { size: 15 }),
          h('span', { text: 'Cupping Table' })
        ),
        BTIcons.el('chevron-right', { size: 14 })
      ),
      h('button', {
        type: 'button',
        class: 'bt-rail-tool-btn',
        'data-rail-ble': '1',
        onclick: function() {
          if (_sheetRegistry.has('ble-devices')) {
            BTSheet.open('ble-devices', null, { detent: 'full', title: 'Bluetooth Scales, R2, Omni & Smart Gear' });
          } else {
            BTSheet.open('workflow-tools', {}, { detent: 'full', title: 'My Gear & Setup' });
          }
        }
      },
        h('span', { style: 'display:inline-flex;align-items:center;gap:7px;min-width:0' },
          h('span', { class: 'bt-status-dot' + (ble.active ? (ble.sim ? ' is-sim' : ' is-live') : '') }),
          h('span', { class: 'bt-rail-ble-txt', style: 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap', text: ble.active ? ble.title : 'Bluetooth Gear' })
        ),
        BTIcons.el('ble-wave', { size: 15 })
      ),
      h('button', {
        type: 'button',
        class: 'bt-rail-tool-btn',
        onclick: function() {
          const next = resolvedTheme(app.prefs.theme) === 'dark' ? 'light' : 'dark';
          app.prefs.theme = next;
          applyTheme(next);
          writePrefsMirror();
          scheduleDraft();
          paintChrome();
          paintStudioAside();
        }
      },
        h('span', { style: 'display:inline-flex;align-items:center;gap:7px' },
          BTIcons.el(actualTheme === 'dark' ? 'sun-light' : 'moon-dark', { size: 15 }),
          h('span', { text: actualTheme === 'dark' ? 'Light Alabaster Theme' : 'Dark Espresso Theme' })
        )
      )
    ]);
  }
}

/* ==================== DESKTOP RIGHT LIVE TELEMETRY & STUDIO COACH (#studio-aside) ==================== */
function _formatFreshnessBadge(c) {
  if (!c) return 'Ready to Brew';
  if (c.is_frozen === 'yes' || c.is_frozen === true) return 'Frozen -18 °C · Peak Locked';
  if (c.roast_date && /^\d{4}-\d{2}-\d{2}$/.test(c.roast_date)) {
    const a = Date.UTC(+c.roast_date.slice(0, 4), +c.roast_date.slice(5, 7) - 1, +c.roast_date.slice(8, 10));
    const now = new Date();
    const b = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const days = Math.max(0, Math.round((b - a) / 86400000));
    return 'Day ' + days + (days >= 4 && days <= 21 ? ' · Peak Window' : (days < 4 ? ' · Degassing' : ' · Rested'));
  }
  return '30s Baseline Bloom';
}

function paintStudioAside() {
  const aside = $('studio-aside');
  if (!aside) return;
  aside.textContent = '';

  const lv = BTScienceLens.level();
  const c = (app && app.coffee) || {};
  const b = (app && app.brew) || {};
  const ble = _readBleSummary();
  const bleState = (typeof window !== 'undefined' && window.BTBle && typeof window.BTBle.getState === 'function') ? (window.BTBle.getState() || {}) : {};

  /* Respect <= 1 Beanjamin per viewport: only render Beanjamin in aside if #mount doesn't already show one */
  const mountEl = $('mount');
  const mountHasBj = !!(mountEl && mountEl.querySelector && mountEl.querySelector('.bj-svg'));
  const bjMood = app.brewStep === 'taste' ? 'zen' : (app.brewStep === 'timer' ? 'focused' : (lv === 'scientist' ? 'eureka' : 'welcome'));
  const coachCopy = lv === 'starter'
    ? 'Plain-English guidance active. Every physics adjustment is translated into simple kitchen steps.'
    : lv === 'scientist'
    ? 'Bean Scientist telemetry active: Darcy permeability, Smrke CO2 kinetics, and Empirical Bayes priors visible.'
    : 'Comfy Brewer active: clean countertop numbers up front, tactile tuners one tap away.';

  const avatarBox = h('div', { class: 'bt-aside-avatar' });
  if (!mountHasBj && typeof Beanjamin !== 'undefined' && Beanjamin && typeof Beanjamin.svg === 'function') {
    avatarBox.innerHTML = Beanjamin.svg(bjMood, { view: 'avatar', anim: true, label: 'Beanjamin Studio Coach' });
  } else {
    avatarBox.innerHTML = BTBrand.logoSvg({ optical: 'micro' });
  }

  const coachCard = h('div', { class: 'bt-aside-coach' },
    avatarBox,
    h('div', { class: 'bt-aside-copy' },
      h('b', { text: 'Beanjamin Studio Coach' }),
      h('span', { text: coachCopy })
    )
  );

  /* Live Coffee Passport Card */
  const cname = (c.name || '').trim();
  const croaster = (c.roaster || '').trim();
  const isUnkAside = function(v, flag) {
    if (flag === 'yes' || flag === true) return true;
    const s = String(v == null ? '' : v).trim().toLowerCase();
    return s === 'unknown' || s === 'unsure' || s === 'not sure' || s === "don't know" || s === 'dont know';
  };
  const roastLbl = isUnkAside(c.roast, c.roastUnsure || c.roast_unknown) ? 'Don\'t Know' : (c.roast || 'Light-Medium').replace(/_/g, '-');
  const procLbl = isUnkAside(c.process, c.processUnsure || c.process_unknown) ? 'Don\'t Know' : (c.process || 'Washed').replace(/_/g, ' ');
  const origLbl = isUnkAside(c.origin, c.originUnsure || c.origin_unknown) ? 'Don\'t Know' : (c.origin || 'Not set');
  const regionDisp = (c.region && origLbl !== 'Not set' && origLbl !== 'Don\'t Know' && String(origLbl).toLowerCase().indexOf(String(c.region).toLowerCase()) < 0)
    ? (origLbl + ' · ' + c.region)
    : origLbl;
  const asideNotes = String(c.bag_notes || c.notes || '').trim();
  const passportCard = h('div', { class: 'bt-passport-card' },
    h('div', { style: 'display:flex;align-items:flex-start;justify-content:space-between;gap:8px' },
      h('div', { style: 'min-width:0' },
        h('div', { style: 'font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--ink-muted)', text: croaster || 'Active Coffee Bag' }),
        h('div', { class: 'bt-serif', style: 'font-size:16px;font-weight:700;line-height:1.25;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere', text: cname || 'Add a Coffee Bag' })
      ),
      h('span', { class: 'bt-badge good', text: _formatFreshnessBadge(c) })
    ),
    h('div', { class: 'bt-passport-grid' },
      h('div', { class: 'bt-passport-cell' },
        h('span', { text: 'Origin' }),
        h('b', { style: 'white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.25;overflow-wrap:anywhere', text: regionDisp })
      ),
      h('div', { class: 'bt-passport-cell' },
        h('span', { text: 'Roast' }),
        h('b', null,
          h('span', { style: 'display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:5px;background:' + _roastColorFor(c.roast) }),
          roastLbl + (lv === 'scientist' && c.agtron ? ' · Ag ' + c.agtron : '')
        )
      ),
      h('div', { class: 'bt-passport-cell' },
        h('span', { text: 'Process' }),
        h('b', { text: procLbl })
      ),
      h('div', { class: 'bt-passport-cell' },
        h('span', { text: 'Varietal' }),
        h('b', { text: c.varietal || 'Specialty Lot' })
      )
    ),
    (asideNotes && !isUnkAside(asideNotes, '')) ? h('div', { style: 'font-size:11.5px;color:var(--ink-secondary);line-height:1.35', text: 'Notes: ' + asideNotes }) : null,
    h('div', { style: 'display:flex;gap:6px' },
      h('button', {
        type: 'button',
        class: 'bt-chip',
        style: 'flex:1;min-height:34px;font-size:12px',
        onclick: function() { go('coffee'); }
      }, BTIcons.el('edit-pen', { size: 13 }), h('span', { text: cname ? 'Edit Bag' : 'Enter Coffee' })),
      _sheetRegistry.has('my-coffees') ? h('button', {
        type: 'button',
        class: 'bt-chip',
        style: 'min-height:34px;font-size:12px',
        onclick: function() { BTSheet.open('my-coffees', null, { detent: 'full' }); }
      }, BTIcons.el('cellar', { size: 13 }), h('span', { text: 'Vault' })) : null
    )
  );

  /* Live Recipe & Physics / BLE Telemetry Card */
  const doseG = +b.dose > 0 ? +b.dose : 15;
  const waterG = +b.water > 0 ? +b.water : 250;
  const ratio = +b.ratio > 0 ? +b.ratio : +(waterG / Math.max(1, doseG)).toFixed(1);
  const tempF = +b.tempF > 0 ? Math.round(+b.tempF) : 200;
  const tempC = Math.round((tempF - 32) * 5 / 9);
  const tempDisp = app.prefs.tempUnit === 'C' ? (tempC + ' °C (' + tempF + ' °F)') : (tempF + ' °F (' + tempC + ' °C)');

  let predTxt = '~1.38% · ~20.2% Extraction (%EY)';
  try {
    if (typeof window !== 'undefined' && window.BTCoreV6 && typeof window.BTCoreV6.simulateBrew === 'function') {
      const sim = window.BTCoreV6.simulateBrew({
        method: b.method || 'v60',
        doseG: doseG,
        waterG: waterG,
        tempC: tempC
      });
      const tds = sim && (sim.tdsPct != null ? sim.tdsPct : sim.tds);
      const ey = sim && (sim.eyPct != null ? sim.eyPct : sim.ey);
      if (isFinite(+tds) && isFinite(+ey) && +tds > 0) {
        predTxt = (+tds).toFixed(2) + '% · ' + (+ey).toFixed(1) + '% Extraction (%EY)';
      }
    }
  } catch (e) {}

  const shopActive = !!(app.shopDraft && app.shopDraft.on && (app.shopDraft.name || app.shopDraft.shop || app.shopDraft.drink));
  const telemetryCard = h('div', { class: 'bt-passport-card' },
    h('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:8px' },
      h('span', { style: 'font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--ink-muted)', text: 'Live Recipe & Telemetry' }),
      h('span', { class: 'bt-badge sci mono', text: String(b.method || 'v60').toUpperCase() })
    ),
    h('div', { class: 'bt-passport-grid' },
      h('div', { class: 'bt-passport-cell' },
        h('span', { text: 'Dose : Water' }),
        h('b', { class: 'mono', text: doseG.toFixed(1) + 'g : ' + Math.round(waterG) + 'g' })
      ),
      h('div', { class: 'bt-passport-cell' },
        h('span', { text: 'Ratio & Temp' }),
        h('b', { class: 'mono', text: '1:' + ratio.toFixed(1) + ' · ' + (app.prefs.tempUnit === 'C' ? tempC + '°C' : tempF + '°F') })
      ),
      h('div', { class: 'bt-passport-cell' },
        h('span', { text: 'Grind Setting' }),
        h('b', { class: 'mono', text: b.grind_setting || b.grinderName || 'Auto-calibrated' })
      ),
      h('div', { class: 'bt-passport-cell' },
        h('span', { text: lv === 'starter' ? 'Strength Aim' : 'Est. Extraction' }),
        h('b', { class: 'mono', text: lv === 'starter' ? 'Balanced Sweet' : predTxt })
      )
    ),
    h('div', { style: 'display:flex;align-items:center;justify-content:space-between;gap:8px;padding:7px 9px;border-radius:var(--r-xs);background:var(--bg-subtle);font-size:11.5px' },
      h('span', { style: 'display:inline-flex;align-items:center;gap:6px;font-weight:600' },
        h('span', { class: 'bt-status-dot' + (ble.active ? (ble.sim ? ' is-sim' : ' is-live') : '') }),
        h('span', { 'data-aside-fsm': '1', text: 'Smart Scale: ' + (ble.fsmHuman || _humanFsmLabel(ble.fsm)) })
      ),
      bleState.lastTds ? h('b', { class: 'mono', style: 'color:var(--science)', text: (+bleState.lastTds).toFixed(2) + '% TDS' }) : h('span', { class: 'mono', style: 'color:var(--ink-muted)', text: tempDisp.split(' ')[0] })
    ),
    shopActive ? h('div', { style: 'font-size:11px;color:var(--ink-secondary);line-height:1.35' },
      'Dual Drafts Isolated: Cafe visit (' + (app.shopDraft.name || app.shopDraft.shop || 'Cafe') + ') saved separately.'
    ) : null
  );

  aside.append(coachCard, passportCard, telemetryCard);
}

/* ==================== PUBLIC BTShell OBJECT ==================== */
const BTShell = {
  h: h,
  kept: kept,
  escHtml: escHtml,
  $: $,
  today: today,
  newId: newId,
  fmt2: fmt2,
  fmtScore: fmtScore,
  qualityLabel: qualityLabel,
  DRAFT_STALE_MS: DRAFT_STALE_MS,
  PARENT: PARENT,
  get app() { return app; },
  set app(v) { app = v; },
  get state() { return state; },
  set state(v) { state = v; },
  newCoffee: newCoffee,
  syncCoffeeAliases: syncCoffeeAliases,
  newApp: newApp,
  newCup: newCup,
  normalizeBrewStep: normalizeBrewStep,
  buildBrewTrailBar: buildBrewTrailBar,
  buildBackPill: buildBackPill,
  canGoBack: canGoBack,
  backLabel: backLabel,
  peekBack: _peekValidHistoryEntry,
  pushNavState: pushNavState,
  recordNav: pushNavState,
  setTabSegment: setTabSegment,
  getNavHistory: function() { return _navHistoryStack.slice(); },
  clearNavHistory: function() { _navHistoryStack.length = 0; paintChrome(); },
  setPrimaryCta: setPrimaryCta,
  switchTab: switchTab,
  go: go,
  navGo: go,
  goBack: goBack,
  isBrewActive: function() {
    return !!(app && app.timerSave && app.timerSave.running) ||
      (BTSheet.isOpen() && BTSheet.currentKey() === 'live-cockpit') ||
      (app && app.activeTab === 'brew' && app.brewStep === 'timer');
  },
  render: render,
  refreshAll: refreshAll,
  changed: changed,
  scheduleDraft: scheduleDraft,
  flushDraft: flushDraft,
  loadDraft: loadDraft,
  loadShopDraft: _shellLoadShopDraft,
  saveShopDraft: saveShopDraft,
  resetShopDraft: resetShopDraft,
  resetAll: resetAll,
  freshAll: freshAll,
  toast: toast,
  applyTheme: applyTheme,
  resolvedTheme: resolvedTheme,
  paintChrome: paintChrome,
  paintBlePill: paintBlePill,
  paintStudioAside: paintStudioAside,
  BTSheet: BTSheet,
  BTScienceLens: BTScienceLens,
  BTTimerAudio: BTTimerAudio,
  btToolMode: btToolMode,
  btSetToolMode: btSetToolMode,
  SCREENS: SCREENS,
  ROUTE_MAP: ROUTE_MAP,
  TAB_DEFS: TAB_DEFS,

  registerTab: function(tabKey, renderFn) {
    const k = String(tabKey || '').trim().toLowerCase();
    if (k && typeof renderFn === 'function') {
      _tabRegistry.set(k, renderFn);
    }
    return BTShell;
  },

  registerSheet: function(sheetKey, renderFn, meta) {
    return BTSheet.register(sheetKey, renderFn, meta);
  },

  openSheet: function(sheetKeyOrCfg, payload, opts) {
    return BTSheet.open(sheetKeyOrCfg, payload, opts);
  },

  closeSheet: function() {
    return BTSheet.close();
  },

  registerRoute: function(routeKey, handlerFn) {
    const rawKey = String(routeKey || '').trim();
    const k = rawKey.toLowerCase();
    if (k && typeof handlerFn === 'function') {
      _routeRegistry.set(k, handlerFn);
      const screenWrapper = function(mountEl) {
        const prev = app.screen;
        app.screen = k;
        handlerFn(undefined, { route: k, tab: app.activeTab, brewStep: app.brewStep, mount: mountEl || $('mount'), shell: BTShell });
        app.screen = prev || k;
      };
      SCREENS[k] = screenWrapper;
      if (rawKey !== k) SCREENS[rawKey] = screenWrapper;
    }
    return BTShell;
  }
};

if (typeof window !== 'undefined') {
  window.BTShell = BTShell;
  window.BTSheet = BTSheet;
  window.BTScienceLens = BTScienceLens;
  window.BTTimerAudio = BTTimerAudio;
  window.btToolMode = btToolMode;
  window.btSetToolMode = btSetToolMode;
  window.PARENT = PARENT;
  window.navGo = go;
  window.goBack = goBack;
  window.loadShopDraft = _shellLoadShopDraft;
  window.saveShopDraft = saveShopDraft;
  window.resetShopDraft = resetShopDraft;
}
