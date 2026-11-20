/* ---------- BeanTelligence v6.0 Immortal Storage Vault, 18-Key Continuity & BTMyCoffeesVault (#132) ---------- */
var BTStorage;
{
  const _g = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : {});

  /* Exact 18 localStorage keys preserved character-for-character (13 core protected + 5 additive) */
  const DRAFT_LS_KEY = 'brew-and-cup-draft-v1';
  const HISTORY_LS_KEY = 'brew-and-cup-history-v1';
  const LASTBACKUP_LS_KEY = 'brew-and-cup-last-backup-v1';
  const HIST_REMOVED_LS_KEY = 'brew-and-cup-history-removed-v1';
  const HIST_EDITED_LS_KEY = 'brew-and-cup-history-edited-v1';
  const HIST_ADDED_LS_KEY = 'brew-and-cup-history-added-v1';
  const HIST_ADDEDIDS_LS_KEY = 'brew-and-cup-history-addedids-v1';
  const PRICES_LS_KEY = 'brew-and-cup-prices-v1';
  const PRICES_CHANGES_LS_KEY = 'brew-and-cup-prices-changes-v1';
  const SHOPS_LS_KEY = 'brew-and-cup-shops-v1';
  const SHOPS_CHANGES_LS_KEY = 'brew-and-cup-shops-changes-v1';
  const SHOP_DRAFT_LS_KEY = 'brew-and-cup-shopdraft-v1';
  const EVERY_LS_KEY = 'brew-and-cup-every-v1';

  const PREFS_MIRROR_LS_KEY = 'brew-and-cup-prefs-mirror-v1';
  const ACADEMY_LS_KEY = 'brew-and-cup-academy-v1';
  const SNAPSHOT_META_LS_KEY = 'brew-and-cup-migration-meta-v1';
  const SNAPSHOT_DATA_LS_KEY = 'brew-and-cup-safety-snapshot-v1';
  const DIFLUID_AUTH_LS_KEY = 'brew-and-cup-difluid-auth-v1';
  const EXTRA_VAULT_COFFEES_KEY = 'brew-and-cup-coffees-v1';
  const EXTRA_AROMA_KIT_KEY = 'brew-and-cup-aroma-kit-v1';

  const PROTECTED_LS_KEYS = [
    'brew-and-cup-draft-v1',
    'brew-and-cup-history-v1',
    'brew-and-cup-last-backup-v1',
    'brew-and-cup-history-removed-v1',
    'brew-and-cup-history-edited-v1',
    'brew-and-cup-history-added-v1',
    'brew-and-cup-history-addedids-v1',
    'brew-and-cup-prices-v1',
    'brew-and-cup-prices-changes-v1',
    'brew-and-cup-shops-v1',
    'brew-and-cup-shops-changes-v1',
    'brew-and-cup-shopdraft-v1',
    'brew-and-cup-every-v1'
  ];
  const ADDITIVE_LS_KEYS = [
    'brew-and-cup-prefs-mirror-v1',
    'brew-and-cup-academy-v1',
    'brew-and-cup-migration-meta-v1',
    'brew-and-cup-safety-snapshot-v1',
    'brew-and-cup-difluid-auth-v1'
  ];
  const ALL_18_LS_KEYS = PROTECTED_LS_KEYS.concat(ADDITIVE_LS_KEYS);

  /* Both IndexedDB databases preserved at exact schema version 1 */
  const PICK_DB = 'brew-and-cup-files';
  const PICK_STORE = 'handles';
  const PICK_HISTORY_KEY = 'history-file';
  const PICK_EVERY_KEY = 'everything-file';

  const SNAPSHOT_VAULT_DB = 'brew-and-cup-vault';
  const SNAPSHOT_VAULT_STORE = 'snapshots';
  const SNAPSHOT_SYNC_LIMIT = 262144; /* 256 KB synchronous localStorage threshold */

  const HISTORY_FILENAME = 'BeanTelligence Taste History.csv';
  const EVERY_FILENAME = 'BeanTelligence Backup - Everything.txt';
  const EVERY_FILES = {
    history:'BeanTelligence Taste History.csv',
    shops:'BeanTelligence Coffee Shops.csv',
    prices:'BeanTelligence Prices.csv',
    json:'BeanTelligence Full Backup.json'
  };
  const PICK_CSV_TYPES = [{ description:'History file (CSV)', accept:{ 'text/csv':['.csv'] } }];
  const EVERY_SAVE_TYPES = [{ description:'BeanTelligence backup (text)', accept:{ 'text/plain':['.txt', '.btbackup'] } }];
  const EVERY_OPEN_TYPES = [{ description:'BeanTelligence backup or CSV file', accept:{ 'text/plain':['.txt', '.btbackup'], 'text/csv':['.csv'], 'application/json':['.json'] } }];

  _g.PREFS_MIRROR_KEY = PREFS_MIRROR_LS_KEY;
  _g.ACADEMY_KEY = ACADEMY_LS_KEY;
  _g.SNAPSHOT_META_KEY = SNAPSHOT_META_LS_KEY;
  _g.SNAPSHOT_DATA_KEY = SNAPSHOT_DATA_LS_KEY;
  _g.SNAPSHOT_VAULT_DB = SNAPSHOT_VAULT_DB;
  _g.SNAPSHOT_VAULT_STORE = SNAPSHOT_VAULT_STORE;
  _g.PROTECTED_LS_KEYS = PROTECTED_LS_KEYS.slice();
  _g.ALL_18_LS_KEYS = ALL_18_LS_KEYS.slice();
  _g.__btHistoryRev = (_g.__btHistoryRev || 0);
  _g.__btPrefsRev = (_g.__btPrefsRev || 0);

  /* Safe bridges to shell globals (02-shell-router-state.js) */
  const _todayIso = () => {
    if (typeof today === 'function') return today();
    const d = new Date(), p = n => String(n).padStart(2, '0');
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  };
  const _newUid = () => {
    if (typeof newId === 'function') return newId();
    try { if (typeof crypto !== 'undefined' && crypto && crypto.randomUUID) return crypto.randomUUID(); } catch(e){}
    return 'c-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  };
  const _getApp = () => {
    if (typeof app !== 'undefined' && app && typeof app === 'object') return app;
    if (_g.BTShell && _g.BTShell.app) return _g.BTShell.app;
    if (!_g.__btFallbackApp){
      _g.__btFallbackApp = {
        screen:'door', tab:'brew', attempt:0,
        coffee:{ id:_newUid(), name:'', roaster:'', origin:'', varietal:'', species:'arabica', roast:'', process:'', decaf:'', decaf_process:'', density:'', elevText:'', elevation_m:'', roast_date:'', is_frozen:'', frozen_date:'', freeze_days_offset:'', bag_notes:'', blend:'', agtron:'', bean_agtron:'', ground_agtron:'', agtron_scale:'gourmet', roast_delta:'', psd_d10_um:'', psd_d50_um:'', psd_d90_um:'', psd_span:'', answered:'' },
        brew:{ method:'v60', style:'', water:250, dose:15, yieldOut:0, bypass:0, grind_setting:'', tempF:200, ratio:16.7, agitation:'standard', technique:'standard', ice:0.4, waterType:'', filter:'', grinderType:'', grinderKey:'', grinderName:'', waterAlk:'', waterGH:'', pourNotes:'', actualSecs:0, machine:{ drink:'cappuccino', milk:'whole', strength:3, temp:'medium' }, machineProfile:null },
        prefs:Object.assign(setupDefaults(), { yieldCal:{}, caffeine:null, switchSize:'02', seenCupHelp:false, seenTermHint:false }),
        adjust:{ grind:0, ratio:0, agit:'' },
        cupBrew:null
      };
    }
    return _g.__btFallbackApp;
  };
  const _getState = () => {
    if (typeof state !== 'undefined' && state && typeof state === 'object') return state;
    if (_g.BTShell && _g.BTShell.state) return _g.BTShell.state;
    if (!_g.__btFallbackState){
      _g.__btFallbackState = {
        id:_newUid(), way:'quick', mode:'', cupping_date:_todayIso(),
        cva:cvaFresh(), desc:{}, vials:[], words:{ fragrance_aroma:[], flavor:[], aftertaste:[], acidity:[], body:[] }, kit:[],
        general_notes:'', stars:0, quick:{ make:'', sym:'', areas:{}, liked:[], notLiked:[] }, vs:{ acidity:'', body:'', sweetness:'' }
      };
    }
    return _g.__btFallbackState;
  };
  const _resetCupState = () => {
    const st = _getState();
    const fresh = (typeof newCup === 'function') ? newCup() : {
      id:_newUid(), way:'quick', mode:'', cupping_date:_todayIso(),
      cva:cvaFresh(), desc:{}, vials:[], words:{ fragrance_aroma:[], flavor:[], aftertaste:[], acidity:[], body:[] }, kit:[],
      general_notes:'', stars:0, quick:{ make:'', sym:'', areas:{}, liked:[], notLiked:[] }, vs:{ acidity:'', body:'', sweetness:'' }
    };
    Object.keys(st).forEach(k => { if (!(k in fresh)) delete st[k]; });
    Object.assign(st, fresh);
    return st;
  };
  const _notifyToast = (msg, opts) => {
    try {
      if (typeof toast === 'function') toast(msg, opts);
      else if (_g.BTShell && typeof _g.BTShell.toast === 'function') _g.BTShell.toast(msg, opts);
    } catch(e){}
  };
  const _triggerScheduleDraft = () => {
    mirrorPrefsNow();
    try {
      if (typeof scheduleDraft === 'function') scheduleDraft();
      else if (_g.BTShell && typeof _g.BTShell.scheduleDraft === 'function') _g.BTShell.scheduleDraft();
      else saveDraftFromApp();
    } catch(e){}
  };
  const _triggerRender = () => {
    try {
      if (typeof render === 'function') render();
      else if (_g.BTShell && typeof _g.BTShell.render === 'function') _g.BTShell.render();
      else if (typeof refreshAll === 'function') refreshAll();
    } catch(e){}
  };
  const _setupCtx = () => ({
    waterTypes:['tap', 'filtered', 'bottled', 'distilled', 'remineral'],
    grinderTypes:['burr', 'blade', 'unknown']
  });
  const _bumpHistoryRev = () => {
    _g.__btHistoryRev = (_g.__btHistoryRev || 0) + 1;
    _unifiedIndexCache.key = '';
  };

  /* ---------- In-Memory Vault Stores ---------- */
  let historyState = null; /* { ex, text, objs } | null */
  let lastBackupMs = 0;
  try { lastBackupMs = parseInt(localStorage.getItem(LASTBACKUP_LS_KEY), 10) || 0; } catch(e){}
  let storagePersisted = null;
  let storageFailed = false;
  let histDirty = 0;
  let histEdited = 0;
  let histAdded = 0;
  let histAddedIds = [];
  let undoBuf = null;   /* { items:[{idx,row}], t } for 10s delete undo */
  let editUndo = null;  /* { prevHeader, prevRows, n, t, id, tasting } for 10s edit undo */
  const ratedIds = new Set();
  const lockedIds = new Set();
  const notForMeIds = new Set();
  const tastedIds = new Set();

  let prState = { list:[], changes:0, undo:null, deductUndo:null, msg:'', tone:'ok', q:'', sort:'first', show:'open' };
  let shState = { store:shopStore(), changes:0, failed:false, msg:'', q:'', tab:'drinks' };
  const _sdBlank = () => ({
    on:false, step:'shop', mode:'pick', pickKey:'', name:'', country:'United States', region:'', city:'', from:'',
    kind:'', menu:'', temp:'', size:'', amount:'', unit:'oz', price:'', sym:'$', face:'', beans:0, again:'', worth:'', notes:'', date:'', saved:'', at:0,
    milk:'', shots:0, flavor:'', how:'', strength:'', sweet:''
  });
  let sdState = _sdBlank();

  let pickedFile = null; /* { handle, name } for 'history-file' */
  let everyFile = null;  /* { handle, name } for 'everything-file' */
  const EVERY_PARTS = [];
  let everyState = { msg:'', saved:null };
  try {
    const rawEv = localStorage.getItem(EVERY_LS_KEY);
    const parsedEv = rawEv ? JSON.parse(rawEv) : null;
    if (parsedEv && typeof parsedEv === 'object' && isFinite(parsedEv.at) && parsedEv.crcs && typeof parsedEv.crcs === 'object'){
      everyState.saved = { at:+parsedEv.at, name:String(parsedEv.name || '').slice(0, 120), crcs:parsedEv.crcs };
    }
  } catch(e){}

  function _noteBackup(){
    lastBackupMs = Date.now();
    try { localStorage.setItem(LASTBACKUP_LS_KEY, String(lastBackupMs)); } catch(e){}
  }
  async function _askPersist(ask){
    try {
      if (typeof navigator === 'undefined' || !navigator.storage || !navigator.storage.persisted) return;
      storagePersisted = await navigator.storage.persisted();
      if (!storagePersisted && ask && navigator.storage.persist) storagePersisted = await navigator.storage.persist();
    } catch(e){}
  }
  function _persistDirty(){
    try {
      if (histDirty > 0) localStorage.setItem(HIST_REMOVED_LS_KEY, String(histDirty));
      else localStorage.removeItem(HIST_REMOVED_LS_KEY);
    } catch(e){ storageFailed = true; }
  }
  function _persistEdited(){
    try {
      if (histEdited > 0) localStorage.setItem(HIST_EDITED_LS_KEY, String(histEdited));
      else localStorage.removeItem(HIST_EDITED_LS_KEY);
    } catch(e){ storageFailed = true; }
  }
  function _persistAdded(){
    if (histAdded <= 0) histAddedIds = [];
    try {
      if (histAdded > 0) localStorage.setItem(HIST_ADDED_LS_KEY, String(histAdded));
      else localStorage.removeItem(HIST_ADDED_LS_KEY);
      if (histAddedIds.length) localStorage.setItem(HIST_ADDEDIDS_LS_KEY, JSON.stringify(histAddedIds));
      else localStorage.removeItem(HIST_ADDEDIDS_LS_KEY);
    } catch(e){ storageFailed = true; }
  }
  function _readAddedIds(ex){
    try {
      const a = JSON.parse(localStorage.getItem(HIST_ADDEDIDS_LS_KEY) || '[]');
      return Array.isArray(a) ? a.filter(x => typeof x === 'string' && ex.ids.has(x)).slice(0, 1000) : [];
    } catch(e){ return []; }
  }

  /* ---------- Preferences Sanitizer & Mirror ('brew-and-cup-prefs-mirror-v1') ---------- */
  function cleanFullPrefs(src){
    const baseSetup = setupDefaults();
    if (!src || typeof src !== 'object' || Array.isArray(src)){
      return Object.assign({}, baseSetup, { yieldCal:{}, caffeine:null, switchSize:'02', seenCupHelp:false, seenTermHint:false });
    }
    const st = setupClean({
      level:src.level, waterUnit:src.waterUnit, coffeeUnit:src.coffeeUnit, sound:src.sound, coach:src.coach, cupView:src.cupView, taste:src.taste,
      theme:src.theme, tempUnit:src.tempUnit, elevUnit:src.elevUnit, cupMode:src.cupMode, coachTips:src.coachTips, palateSeed:src.palateSeed,
      scienceLens:src.scienceLens, immersionBasis:src.immersionBasis, toolModes:src.toolModes,
      brewerMaterials:src.brewerMaterials, cryoTubes:src.cryoTubes, pocketMicronCalib:src.pocketMicronCalib, philipsProfiles:src.philipsProfiles,
      waterProfileKey:src.waterProfileKey, kettle:src.kettle, scale:src.scale, ownedBrewers:src.ownedBrewers,
      gear:src.gear, calib:src.calib, roasterSites:src.roasterSites
    }, _setupCtx()) || baseSetup;
    const out = Object.assign({}, baseSetup, st, {
      scienceLens:st.scienceLens || (src.scienceLens === 'surface' ? 'surface' : ''),
      immersionBasis:st.immersionBasis !== '' ? st.immersionBasis : (src.immersionBasis === 'liang' ? 'liang' : ''),
      seenCupHelp:typeof src.seenCupHelp === 'boolean' ? src.seenCupHelp : false,
      seenTermHint:typeof src.seenTermHint === 'boolean' ? src.seenTermHint : false,
      yieldCal:typeof yieldClean === 'function' ? yieldClean(src.yieldCal) : ((src.yieldCal && typeof src.yieldCal === 'object' && !Array.isArray(src.yieldCal)) ? src.yieldCal : {}),
      caffeine:typeof caffeineClean === 'function' ? caffeineClean(src.caffeine) : ((src.caffeine && typeof src.caffeine === 'object') ? src.caffeine : null),
      waterProfileKey:st.gear.waterProfileKey || '',
      kettle:st.gear.kettle || '',
      scale:st.gear.scale || '',
      ownedBrewers:Array.isArray(st.gear.ownedBrewers) ? st.gear.ownedBrewers.slice() : []
    });
    if (['new', 'comfortable', 'expert'].includes(src.cupHelp)) out.cupHelp = src.cupHelp;
    if (src.switchSize === '03' || src.switchSize === '02') out.switchSize = src.switchSize;
    if (src.experienceLens === 'starter' || src.experienceLens === 'scientist') out.experienceLens = src.experienceLens;
    if (src.timerAudioMode === 'chimes' || src.timerAudioMode === 'silent') out.timerAudioMode = src.timerAudioMode;
    /* Strip any accidental credentials */
    delete out.difluidAuth; delete out.apiKey; delete out[DIFLUID_AUTH_LS_KEY];
    return out;
  }
  function prefsIsDefault(p){
    if (!p) return true;
    return JSON.stringify(cleanFullPrefs(p)) === JSON.stringify(cleanFullPrefs(null));
  }
  function mirrorPrefsNow(){
    try {
      const a = _getApp();
      if (a && a.prefs){
        localStorage.setItem(PREFS_MIRROR_LS_KEY, JSON.stringify(cleanFullPrefs(a.prefs)));
        _g.__btPrefsRev = (_g.__btPrefsRev || 0) + 1;
      }
    } catch(e){}
  }
  function applyFullPrefs(raw){
    if (!raw || typeof raw !== 'object') return false;
    const a = _getApp();
    const cleaned = cleanFullPrefs(Object.assign({}, a.prefs || {}, raw));
    if (raw.experienceLens === 'starter' || raw.experienceLens === 'comfy' || raw.experienceLens === 'scientist'){
      cleaned.experienceLens = raw.experienceLens;
    } else if (cleaned.scienceLens === 'xray' || cleaned.level === 'expert'){
      cleaned.experienceLens = 'scientist';
    } else if (cleaned.level === 'new'){
      cleaned.experienceLens = 'starter';
    } else if (!cleaned.experienceLens){
      cleaned.experienceLens = 'comfy';
    }
    if (raw.timerAudioMode === 'voice' || raw.timerAudioMode === 'chimes' || raw.timerAudioMode === 'silent'){
      cleaned.timerAudioMode = raw.timerAudioMode;
    } else {
      cleaned.timerAudioMode = cleaned.sound === 'off' ? 'silent' : (cleaned.sound === 'chime' ? 'chimes' : 'voice');
    }
    a.prefs = cleaned;
    _g.__btPrefs = a.prefs;
    if (_g.BTShell && typeof _g.BTShell.applyTheme === 'function'){
      try { _g.BTShell.applyTheme(a.prefs.theme || 'light'); } catch(e){}
    } else if (_g.BTPlatform && _g.BTPlatform.theme && typeof _g.BTPlatform.theme.apply === 'function'){
      try { _g.BTPlatform.theme.apply(a.prefs.theme || 'light'); } catch(e){}
    }
    if (typeof BTScienceLens !== 'undefined' && BTScienceLens && typeof BTScienceLens.setMode === 'function' && (a.prefs.scienceLens || a.prefs.experienceLens)){
      try { BTScienceLens.setMode(a.prefs.scienceLens || a.prefs.experienceLens, { silent:true }); } catch(e){}
    }
    mirrorPrefsNow();
    _scheduleNativeVaultMirror();
    return true;
  }
  function saveDraftFromApp(){
    try {
      const a = _getApp(), s = _getState();
      const safeApp = Object.assign({}, a);
      if (safeApp.prefs) safeApp.prefs = cleanFullPrefs(safeApp.prefs);
      localStorage.setItem(DRAFT_LS_KEY, JSON.stringify({ app:safeApp, state:s, at:Date.now() }));
      mirrorPrefsNow();
    } catch(e){}
  }
  function loadDraftIntoApp(){
    const a = _getApp();
    let loadedPrefs = false;
    try {
      const raw = localStorage.getItem(DRAFT_LS_KEY);
      if (raw){
        const d = JSON.parse(raw);
        if (d && d.app && typeof d.app === 'object'){
          if (d.app.coffee && typeof d.app.coffee === 'object') a.coffee = Object.assign(a.coffee || {}, d.app.coffee);
          if (d.app.brew && typeof d.app.brew === 'object') a.brew = Object.assign(a.brew || {}, d.app.brew);
          if (d.app.adjust && typeof d.app.adjust === 'object') a.adjust = Object.assign(a.adjust || {}, d.app.adjust);
          if (d.app.cupBrew && typeof d.app.cupBrew === 'object') a.cupBrew = d.app.cupBrew;
          if (typeof d.app.attempt === 'number' && isFinite(d.app.attempt)) a.attempt = d.app.attempt;
          if (typeof d.app.recipeLocked === 'boolean') a.recipeLocked = d.app.recipeLocked;
          if (typeof d.app.screen === 'string' && d.app.screen) a.screen = d.app.screen;
          if (typeof d.app.tab === 'string' && d.app.tab) a.tab = d.app.tab;
          if (d.app.prefs && typeof d.app.prefs === 'object'){
            a.prefs = cleanFullPrefs(Object.assign({}, a.prefs || {}, d.app.prefs));
            loadedPrefs = true;
          }
        }
        if (d && d.state && typeof d.state === 'object'){
          const st = _getState();
          Object.assign(st, d.state);
          if (st.cva) st.cva = cvaClean(st.cva);
        }
      }
    } catch(e){}
    if (!loadedPrefs){
      try {
        const mir = localStorage.getItem(PREFS_MIRROR_LS_KEY);
        if (mir){
          const parsed = JSON.parse(mir);
          if (parsed && typeof parsed === 'object'){
            a.prefs = cleanFullPrefs(Object.assign({}, a.prefs || {}, parsed));
            loadedPrefs = true;
          }
        }
      } catch(e){}
    }
    mirrorPrefsNow();
    return loadedPrefs;
  }

  /* ---------- Academy Progress & Palate Gym Calibration ('brew-and-cup-academy-v1') ---------- */
  function readAcademyState(){
    try {
      const raw = localStorage.getItem(ACADEMY_LS_KEY);
      if (!raw) return { bookmarkedIds:[], completedModuleIds:[], completedLessonIds:[], quizPassedIds:[], palateGymHistory:[] };
      const o = JSON.parse(raw);
      const cleanIds = arr => Array.isArray(arr) ? Array.from(new Set(arr.filter(x => typeof x === 'string' && x.trim()).map(x => x.trim().slice(0, 64)))).slice(0, 200) : [];
      const cleanGym = v => {
        if (Array.isArray(v)){
          return v.filter(x => x && typeof x === 'object').slice(-200).map(x => ({
            kind:String(x.kind || 'triangle').slice(0, 24),
            correct:!!x.correct,
            at:typeof x.at === 'string' ? x.at.slice(0, 32) : (typeof x.at === 'number' && isFinite(x.at) ? Math.round(x.at) : Date.now()),
            note:typeof x.note === 'string' ? x.note.slice(0, 80) : ''
          }));
        }
        if (v && typeof v === 'object') return Object.assign({}, v);
        return [];
      };
      return {
        bookmarkedIds:cleanIds(o && o.bookmarkedIds),
        completedModuleIds:cleanIds(o && o.completedModuleIds),
        completedLessonIds:cleanIds(o && o.completedLessonIds),
        quizPassedIds:cleanIds(o && o.quizPassedIds),
        palateGymHistory:cleanGym(o && o.palateGymHistory)
      };
    } catch(e){ return { bookmarkedIds:[], completedModuleIds:[], completedLessonIds:[], quizPassedIds:[], palateGymHistory:[] }; }
  }
  function writeAcademyState(st){
    const cur = st || {};
    const ghRaw = cur.palateGymHistory;
    const ghClean = Array.isArray(ghRaw)
      ? ghRaw.filter(x => x && typeof x === 'object').slice(-200)
      : ((ghRaw && typeof ghRaw === 'object') ? Object.assign({}, ghRaw) : []);
    const hasGh = Array.isArray(ghClean) ? ghClean.length > 0 : Object.keys(ghClean).some(k => !!ghClean[k]);
    const clean = {
      bookmarkedIds:Array.isArray(cur.bookmarkedIds) ? Array.from(new Set(cur.bookmarkedIds.filter(x => typeof x === 'string' && x.trim()).map(x => x.trim().slice(0, 64)))).slice(0, 200) : [],
      completedModuleIds:Array.isArray(cur.completedModuleIds) ? Array.from(new Set(cur.completedModuleIds.filter(x => typeof x === 'string' && x.trim()).map(x => x.trim().slice(0, 64)))).slice(0, 200) : [],
      completedLessonIds:Array.isArray(cur.completedLessonIds) ? Array.from(new Set(cur.completedLessonIds.filter(x => typeof x === 'string' && x.trim()).map(x => x.trim().slice(0, 64)))).slice(0, 200) : [],
      quizPassedIds:Array.isArray(cur.quizPassedIds) ? Array.from(new Set(cur.quizPassedIds.filter(x => typeof x === 'string' && x.trim()).map(x => x.trim().slice(0, 64)))).slice(0, 200) : [],
      palateGymHistory:ghClean
    };
    try {
      if (clean.bookmarkedIds.length || clean.completedModuleIds.length || clean.completedLessonIds.length || clean.quizPassedIds.length || hasGh){
        localStorage.setItem(ACADEMY_LS_KEY, JSON.stringify(clean));
      } else {
        localStorage.removeItem(ACADEMY_LS_KEY);
      }
    } catch(e){}
    return clean;
  }
  function recordPalateGymTrial(trial){
    const cur = readAcademyState();
    if (!Array.isArray(cur.palateGymHistory)) cur.palateGymHistory = [];
    cur.palateGymHistory.push({
      kind:String((trial && trial.kind) || 'triangle').slice(0, 24),
      correct:!!(trial && trial.correct),
      at:new Date().toISOString(),
      note:typeof (trial && trial.note) === 'string' ? trial.note.slice(0, 80) : ''
    });
    return writeAcademyState(cur);
  }

  /* ---------- History CRUD & 10-Second Undo ---------- */
  function browserOnlyCups(){
    if (!historyState || !historyState.objs || histAdded <= 0) return [];
    return histAddedIds.length
      ? historyState.objs.filter(o => histAddedIds.includes(String(o.id || '').trim()))
      : historyState.objs.slice(-histAdded);
  }
  function browserOnlyMissingFrom(ex){
    if (!ex || !ex.ids) return [];
    return browserOnlyCups().filter(o => !ex.ids.has(String(o.id || '').trim()));
  }
  function _setHistoryImpl(ex, text){
    if (typeof ex === 'string' && text === undefined){ text = ex; ex = readExisting(text); }
    if (!ex || ex.error) return false;
    historyState = { ex, text, objs:rowsToObjects(ex) };
    _bumpHistoryRev();
    histDirty = 0; undoBuf = null; _persistDirty();
    histEdited = 0; editUndo = null; _persistEdited();
    histAdded = 0; _persistAdded();
    try { localStorage.setItem(HISTORY_LS_KEY, text); } catch(e){ storageFailed = true; }
    _scheduleNativeVaultMirror();
  }
  function _keepInBrowserImpl(csvOrRow){
    let csv = '';
    if (typeof csvOrRow === 'string'){
      csv = csvOrRow;
    } else if (csvOrRow && typeof csvOrRow === 'object'){
      let rowToSave = csvOrRow;
      if (rowToSave.dial_locked === 'yes' && typeof isRowExcludedFromLearning === 'function' && isRowExcludedFromLearning(rowToSave)){
        rowToSave = Object.assign({}, rowToSave, { dial_locked:'' });
      }
      csv = (historyState && historyState.ex) ? mergeCSV(historyState.ex, rowToSave) : newFileCSV(rowToSave);
    } else return false;
    const ex = readExisting(csv);
    if (ex.error) return false;
    const d = histDirty, e = histEdited;
    const carried = browserOnlyCups().map(o => String(o.id || '').trim()).filter(id => id && ex.ids.has(id));
    const last = ex.rows[ex.rows.length - 1], newIdVal = last ? String(last[ex.header.indexOf('id')] || '').trim() : '';
    try {
      localStorage.setItem(HISTORY_LS_KEY, csv);
      if (localStorage.getItem(HISTORY_LS_KEY) !== csv) return false;
    } catch(err){ storageFailed = true; return false; }
    _setHistoryImpl(ex, csv);
    _askPersist(true);
    histDirty = d; histEdited = e;
    histAdded = carried.length + 1;
    histAddedIds = newIdVal && !carried.includes(newIdVal) ? carried.concat(newIdVal) : carried;
    _persistDirty(); _persistEdited(); _persistAdded();
    _autoSyncHistoryHandle();
    try {
      const savedObj = historyState && historyState.objs && historyState.objs.length ? historyState.objs[historyState.objs.length - 1] : null;
      _upsertVaultFromRowObj(typeof csvOrRow === 'object' ? csvOrRow : savedObj);
    } catch(e){}
    return true;
  }
  function _applyHistoryRowsImpl(rows){
    if (!historyState || !historyState.ex) return;
    const ex = historyState.ex;
    ex.rows = rows; ex.count = rows.length;
    const idIdx = ex.header.indexOf('id');
    ex.ids = new Set(rows.map(r => (r[idIdx] || '').trim()).filter(Boolean));
    historyState.objs = rowsToObjects(ex);
    historyState.text = toCSV([ex.header].concat(rows));
    _bumpHistoryRev();
    try { localStorage.setItem(HISTORY_LS_KEY, historyState.text); } catch(e){ storageFailed = true; }
    _scheduleNativeVaultMirror();
    _autoSyncHistoryHandle();
  }
  function _deleteByIdxImpl(setOrIdx){
    if (!historyState || !historyState.ex) return 0;
    const set = setOrIdx instanceof Set ? setOrIdx : (Array.isArray(setOrIdx) ? new Set(setOrIdx) : new Set([+setOrIdx]));
    const removed = [], keptRows = [];
    historyState.ex.rows.forEach((r, i) => { if (set.has(i)) removed.push({ idx:i, row:r }); else keptRows.push(r); });
    if (!removed.length) return 0;
    _applyHistoryRowsImpl(keptRows);
    histDirty += removed.length; _persistDirty();
    undoBuf = { items:removed, t:Date.now() };
    return removed.length;
  }
  function _undoDeleteImpl(){
    if (!undoBuf || Date.now() - undoBuf.t >= 10000 || !historyState || !historyState.ex){ undoBuf = null; return false; }
    const rows = historyState.ex.rows.slice();
    undoBuf.items.slice().sort((a, b) => a.idx - b.idx).forEach(it => rows.splice(Math.min(it.idx, rows.length), 0, it.row));
    histDirty = Math.max(0, histDirty - undoBuf.items.length); _persistDirty();
    _applyHistoryRowsImpl(rows);
    undoBuf = null;
    return true;
  }
  function _commitCoffeeEditImpl(idxs, edit){
    if (!historyState || !historyState.ex) return { error:'No history loaded.' };
    const list = Array.isArray(idxs) ? idxs : [idxs];
    const res = applyCoffeeEdit(historyState.ex.header, historyState.ex.rows, list, edit);
    if (res.error) return res;
    if (!res.changed) return { changed:0 };
    editUndo = { prevHeader:historyState.ex.header.slice(), prevRows:historyState.ex.rows.slice(), n:res.changed, t:Date.now() };
    historyState.ex.header = res.header;
    _applyHistoryRowsImpl(res.rows);
    histEdited += res.changed; _persistEdited();
    try {
      const firstIdx = list[0];
      const updatedObj = historyState && historyState.objs && historyState.objs[firstIdx];
      if (updatedObj) _upsertVaultFromRowObj(updatedObj);
    } catch(e){}
    return { changed:res.changed };
  }
  function _commitTastingEditImpl(rowIdx, edit){
    if (!historyState || !historyState.ex) return { error:'No history loaded.' };
    const res = applyTastingEdit(historyState.ex.header, historyState.ex.rows, rowIdx, edit);
    if (res.error) return res;
    if (!res.changed) return { ok:true, changed:0 };
    const idi = historyState.ex.header.indexOf('id');
    const rowId = (historyState.ex.rows[rowIdx] && historyState.ex.rows[rowIdx][idi]) || String(rowIdx);
    const firstTime = !tastedIds.has(rowId);
    if (firstTime) tastedIds.add(rowId);
    editUndo = { prevHeader:historyState.ex.header.slice(), prevRows:historyState.ex.rows.slice(), n:firstTime ? 1 : 0, t:Date.now(), id:rowId, tasting:true, what:res.summary };
    historyState.ex.header = res.header;
    _applyHistoryRowsImpl(res.rows);
    if (firstTime){ histEdited += 1; _persistEdited(); }
    return { ok:true, changed:1, summary:res.summary, total:res.total };
  }
  function _undoEditImpl(){
    if (!editUndo || Date.now() - editUndo.t >= 10000 || !historyState || !historyState.ex){ editUndo = null; return false; }
    histEdited = Math.max(0, histEdited - editUndo.n); _persistEdited();
    if (editUndo.tasting && editUndo.n && editUndo.id) tastedIds.delete(editUndo.id);
    historyState.ex.header = editUndo.prevHeader;
    _applyHistoryRowsImpl(editUndo.prevRows);
    editUndo = null;
    return true;
  }
  function _commitNotForMeImpl(rowIdx){
    if (!historyState || !historyState.ex || !historyState.ex.rows[rowIdx]) return { changed:0 };
    const header = historyState.ex.header.slice();
    if (!header.includes('make_again')) header.push('make_again');
    const ci = header.indexOf('make_again'), idi = header.indexOf('id');
    const rows = historyState.ex.rows.map(r => { const rr = r.slice(); while (rr.length < header.length) rr.push(''); return rr; });
    if ((rows[rowIdx][ci] || '') === 'no') return { changed:0 };
    rows[rowIdx][ci] = 'no'; historyState.ex.header = header; _applyHistoryRowsImpl(rows);
    const id = rows[rowIdx][idi] || String(rowIdx);
    if (!notForMeIds.has(id)){ notForMeIds.add(id); histEdited += 1; _persistEdited(); }
    return { changed:1 };
  }
  function _commitRatingImpl(rowIdx, stars){
    if (!historyState || !historyState.ex || !historyState.ex.rows[rowIdx]) return { changed:0 };
    const v = validStars(stars), header = historyState.ex.header.slice();
    if (!header.includes('my_rating_stars')) header.push('my_rating_stars');
    const ci = header.indexOf('my_rating_stars'), idi = header.indexOf('id');
    const rows = historyState.ex.rows.map(r => { const rr = r.slice(); while (rr.length < header.length) rr.push(''); return rr; });
    const next = v ? String(v) : '';
    if ((rows[rowIdx][ci] || '') === next) return { changed:0 };
    rows[rowIdx][ci] = next; historyState.ex.header = header; _applyHistoryRowsImpl(rows);
    const id = rows[rowIdx][idi] || String(rowIdx);
    if (!ratedIds.has(id)){ ratedIds.add(id); histEdited += 1; _persistEdited(); }
    return { changed:1 };
  }
  function _computeLockEdits(objs, targetObj, on){
    if (typeof lockEdits === 'function') return lockEdits(objs, targetObj, on);
    if (!targetObj || targetObj._i == null) return [];
    const targetMethod = resolveMethod(targetObj.brew_method);
    const targetCid = targetObj.coffee_id || '';
    const nm = x => unneutralize(x || '').toLowerCase().trim();
    const sameCoffee = x => targetCid ? (x.coffee_id === targetCid) : (nm(x.coffee_name) === nm(targetObj.coffee_name) && nm(x.roaster) === nm(targetObj.roaster));
    const edits = [];
    (objs || []).forEach(x => {
      if (!x || x._i == null) return;
      if (!sameCoffee(x) || resolveMethod(x.brew_method) !== targetMethod) return;
      const curLock = String(x.dial_locked || '').trim().toLowerCase() === 'yes';
      const wantLock = on && x._i === targetObj._i;
      if (curLock !== wantLock) edits.push({ i:x._i, val:wantLock ? 'yes' : '' });
    });
    return edits;
  }
  function _syncDialLockAcrossVaultAndApp(targetObj, lockBool){
    if (!targetObj || typeof targetObj !== 'object') return;
    const idInfo = _extractCoffeeIdentity(targetObj);
    const vList = _getCoffeesVaultListImpl();
    const vIdx = _findVaultCoffeeIdx(vList, idInfo);
    if (vIdx >= 0){
      const nextV = Object.assign({}, vList[vIdx]);
      nextV.dial_locked = lockBool ? 'yes' : '';
      if (!lockBool){
        delete nextV.lockedBrew;
      }
      if (nextV.dialAdaptation && typeof nextV.dialAdaptation === 'object'){
        nextV.dialAdaptation = Object.assign({}, nextV.dialAdaptation, { locked:!!lockBool });
      }
      nextV.updatedAt = Date.now();
      vList[vIdx] = nextV;
      _saveCoffeesVaultListImpl(vList);
    }
    const a = _getApp();
    if (_matchesAppCoffee(a, idInfo)){
      a.recipeLocked = !!lockBool;
      if (a.coffee){
        a.coffee.dial_locked = lockBool ? 'yes' : '';
        if (!lockBool && a.coffee.lockedBrew) delete a.coffee.lockedBrew;
        if (a.coffee.dialAdaptation && typeof a.coffee.dialAdaptation === 'object'){
          a.coffee.dialAdaptation = Object.assign({}, a.coffee.dialAdaptation, { locked:!!lockBool });
        }
      }
      if (a.brew && a.brew.dialAdaptation && typeof a.brew.dialAdaptation === 'object'){
        if (!lockBool && a.brew.dialAdaptation.adapted === false && a.brew.dialAdaptation.locked === true && !a.brew.dialAdaptation.headline && !a.brew.dialAdaptation.summaryBanner){
          delete a.brew.dialAdaptation;
        } else {
          a.brew.dialAdaptation = Object.assign({}, a.brew.dialAdaptation, { locked:!!lockBool });
        }
      }
      saveDraftFromApp();
    }
  }
  function _commitDialLockImpl(oOrIdx, on){
    if (!historyState || !historyState.ex) return { changed:0 };
    const o = typeof oOrIdx === 'number' ? historyState.objs[oOrIdx] : oOrIdx;
    if (!o || !historyState.ex.rows[o._i]) return { changed:0 };
    const lockBool = on !== false;
    if (lockBool && typeof isRowExcludedFromLearning === 'function' && isRowExcludedFromLearning(o)) return { changed:0, shielded:true };
    const edits = _computeLockEdits(historyState.objs, o, lockBool);
    if (edits.length){
      const header = historyState.ex.header.slice();
      if (!header.includes('dial_locked')) header.push('dial_locked');
      const ci = header.indexOf('dial_locked'), idi = header.indexOf('id');
      const rows = historyState.ex.rows.map(r => { const rr = r.slice(); while (rr.length < header.length) rr.push(''); return rr; });
      edits.forEach(e => {
        rows[e.i][ci] = e.val;
        const id = rows[e.i][idi] || String(e.i), tag = id + '|lock';
        if (!lockedIds.has(tag)){ lockedIds.add(tag); histEdited += 1; }
      });
      _persistEdited();
      historyState.ex.header = header;
      _applyHistoryRowsImpl(rows);
    }
    _syncDialLockAcrossVaultAndApp(o, lockBool);
    return { changed:edits.length };
  }
  function _loadHistoryImpl(){
    try {
      const t = localStorage.getItem(HISTORY_LS_KEY);
      if (!t) return null;
      const ex = readExisting(t);
      if (!ex.error){
        historyState = { ex, text:t, objs:rowsToObjects(ex) };
        _bumpHistoryRev();
        histDirty = parseInt(localStorage.getItem(HIST_REMOVED_LS_KEY), 10) || 0;
        histEdited = parseInt(localStorage.getItem(HIST_EDITED_LS_KEY), 10) || 0;
        histAdded = parseInt(localStorage.getItem(HIST_ADDED_LS_KEY), 10) || 0;
        histAddedIds = histAdded > 0 ? _readAddedIds(ex) : [];
        return historyState;
      }
    } catch(e){}
    return null;
  }
  function _forgetHistoryImpl(){
    historyState = null;
    histDirty = 0; undoBuf = null; _persistDirty();
    histEdited = 0; editUndo = null; _persistEdited();
    histAdded = 0; _persistAdded();
    _bumpHistoryRev();
    try { localStorage.removeItem(HISTORY_LS_KEY); } catch(e){}
  }

  /* ---------- Row Serialization (baseRow & buildRow across all 129 COLUMNS) ---------- */
  const _TECH_CSV_MAP = { standard:'standard', pulse:'pulse_4_6', flash:'iced_brew_over_ice', iceafter:'iced_add_after' };
  const _ROAST_CSV_LABELS = { 'ultra-light':'Ultra-light', light:'Light', 'medium-light':'Medium-light', medium:'Medium', 'medium-dark':'Medium-dark', dark:'Dark' };
  const _PROC_CSV_LABELS = {
    washed:'Washed', natural:'Natural', honey:'Honey', 'honey-white':'White honey', 'honey-yellow':'Yellow honey', 'honey-red':'Red honey', 'honey-black':'Black honey',
    anaerobic:'Anaerobic', carbonic:'Carbonic maceration', 'thermal-shock':'Thermal shock', yeast:'Yeast / Koji', infused:'Co-fermented / infused', 'wet-hulled':'Wet-hulled', unknown:'Not sure'
  };
  const _DENS_CSV_LABELS = { low:'Lower', mid:'Mid', high:'High', 'ultra-high':'Ultra-high', unknown:'Not sure' };
  const _BLEND_CSV_LABELS = { single:'Single origin', blend:'Blend' };

  function _numOrNull(v){
    const n = typeof v === 'number' ? v : parseFloat(v);
    return isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
  }
  function _readRowAdaptationMeta(o){
    if (typeof readV6Adaptation === 'function') return readV6Adaptation(o);
    if (!o || !o.recipe_adaptation_json) return null;
    try {
      const p = typeof o.recipe_adaptation_json === 'string' ? JSON.parse(o.recipe_adaptation_json) : o.recipe_adaptation_json;
      if (p && typeof p === 'object' && !Array.isArray(p)) return p;
    } catch(e){}
    return null;
  }
  function _evaluateFreshV6Physics(coffeeObj, brewObj){
    const core = _g.BTCoreV6;
    if (!core || typeof core.simulateBrew !== 'function' || !brewObj) return null;
    try {
      const mk = resolveMethod(brewObj.method || brewObj.brew_method) || 'v60';
      const dose = +(brewObj.dose || brewObj.brew_dose_g) || 15;
      const water = +(brewObj.water || brewObj.brew_water_g) || 250;
      const tempF = +(brewObj.tempF || brewObj.brew_temp_f) || 200;
      const tempC = +(brewObj.tempC || brewObj.brew_temp_c) || ((tempF - 32) * 5 / 9);
      return core.simulateBrew({ method:mk, doseG:dose, waterG:water, tempC, coffee:coffeeObj || {} });
    } catch(e){ return null; }
  }
  function _baseRowImpl(overrides){
    const a = _getApp(), s = Object.assign({}, _getState(), overrides || {});
    const co = (overrides && overrides.coffee) || a.coffee || {};
    const b = (overrides && overrides.cupBrew) || a.cupBrew || a.brew || null;
    const r = {};
    COLUMNS.forEach(k => { r[k] = ''; });
    r.setup_json = setupJson(setupFromPrefs(a.prefs, _setupCtx()));
    const now = new Date();
    const rdIso = _btValidIsoDateRef(co.roast_date) ? co.roast_date : '';
    const days = rdIso ? _daysSinceRef(rdIso, now) : null;
    r.schema_version = '6.0';
    r.id = s.id || _newUid();
    r.coffee_id = co.id || '';
    r.saved_at = now.toISOString();
    r.cupping_date = _btValidIsoDateRef(s.cupping_date) ? s.cupping_date : _todayIso();

    const pKey = resolveProcess(co.process) || co.process || '';
    const rKey = resolveRoast(co.roast) || co.roast || '';
    const dKey = resolveDensity(co.density, co.elevation_m) || co.density || '';
    const bKey = resolveBlend(co.blend) || co.blend || '';

    r.roaster = co.roaster || '';
    r.coffee_name = co.name || '';
    r.origin = co.origin || '';
    r.process = _PROC_CSV_LABELS[pKey] || (co.process || '');
    const isDecaf = co.decaf === 'yes' || co.decaf === true || (co.decaf_process && !['none', 'regular', ''].includes(String(co.decaf_process).toLowerCase()));
    r.decaf = isDecaf ? 'yes' : '';
    r.roast_level = _ROAST_CSV_LABELS[rKey] || (co.roast || '');
    r.elevation_class = _DENS_CSV_LABELS[dKey] || '';
    const parsedElev = (+co.elevation_m >= 200 && +co.elevation_m <= 3500) ? Math.round(+co.elevation_m) : 0;
    r.elevation_m = parsedElev ? String(parsedElev) : '';
    r.roast_date = rdIso;
    r.days_since_roast = days == null ? '' : String(days);
    r.varietal = co.varietal || '';
    const rawBagNotes = String(co.bag_notes || co.notes || co.bagNotes || (Array.isArray(co.flavors) ? co.flavors.join(', ') : (co.flavors || '')) || '').replace(/\r\n?/g, '\n').trim();
    r.bag_notes = rawBagNotes;
    r.blend = _BLEND_CSV_LABELS[bKey] || '';
    r.species = cleanLine(co.species || '');
    r.decaf_process = isDecaf ? cleanLine(co.decaf_process || co.decafProcess || '') : '';
    const isFrz = co.is_frozen === 'yes' || co.is_frozen === true || co.isFrozen === true || co.frozen === 'yes' || co.frozen === true;
    r.is_frozen = isFrz ? 'yes' : '';
    const frzDate = _btValidIsoDateRef(co.frozen_date) ? co.frozen_date : (_btValidIsoDateRef(co.frozenDate) ? co.frozenDate : '');
    r.frozen_date = isFrz ? frzDate : '';
    if (isFrz){
      if (co.freeze_days_offset != null && /^\d+$/.test(String(co.freeze_days_offset).trim())) r.freeze_days_offset = String(co.freeze_days_offset).trim();
      else if (rdIso && frzDate){ const off = computeFreezeOffsetDays(rdIso, frzDate, now); r.freeze_days_offset = off != null && off > 0 ? String(off) : ''; }
    }

    let adapOut = {};
    if (b){
      const bleTel = (b.bleTelemetry && b.bleTelemetry.active) ? b.bleTelemetry : ((a.brew && a.brew.bleTelemetry && a.brew.bleTelemetry.active && !b.machine) ? a.brew.bleTelemetry : null);
      const doseVal = (b.brew_dose_g != null && b.brew_dose_g !== '') ? b.brew_dose_g : ((b.dose != null && b.dose !== '' && +b.dose > 0) ? b.dose : (bleTel && +bleTel.actualDoseG > 0 ? bleTel.actualDoseG : ''));
      const waterVal = (b.brew_water_g != null && b.brew_water_g !== '') ? b.brew_water_g : ((b.water != null && b.water !== '' && +b.water > 0) ? b.water : (bleTel && +bleTel.actualWaterG > 0 ? bleTel.actualWaterG : ''));
      const outVal = (b.out_g != null && b.out_g !== '') ? b.out_g : ((b.yield_g != null && b.yield_g !== '') ? b.yield_g : ((b.yieldOut != null && +b.yieldOut > 0) ? b.yieldOut : (bleTel && +bleTel.actualYieldG > 0 ? bleTel.actualYieldG : '')));
      const actTimeVal = (b.actual_s != null && b.actual_s !== '') ? b.actual_s : ((b.actualSecs != null && +b.actualSecs > 0) ? Math.round(+b.actualSecs) : (bleTel && +bleTel.actualSecs > 0 ? Math.round(+bleTel.actualSecs) : ''));
      const timeVal = (b.time_s !== '' && b.time_s != null) ? b.time_s : ((b.brew_time_s !== '' && b.brew_time_s != null) ? b.brew_time_s : '');
      const tdsVal = (b.tds != null && b.tds !== '') ? b.tds : ((b.brew_tds_pct != null && b.brew_tds_pct !== '') ? b.brew_tds_pct : (s.brew_tds_pct ? s.brew_tds_pct : ''));
      const ratioVal = (+doseVal > 0 && +waterVal > 0 && (b.ratio == null || b.ratio === '')) ? (Math.round((+waterVal / +doseVal) * 10) / 10) : b.ratio;
      const tempFVal = b.temp_f != null && b.temp_f !== '' ? b.temp_f : (b.tempF != null && b.tempF !== '' ? b.tempF : '');
      const tempCVal = b.temp_c != null && b.temp_c !== '' ? b.temp_c : (tempFVal !== '' && isFinite(+tempFVal) ? Math.round((+tempFVal - 32) * 5 / 9) : '');

      r.brew_method = String(b.method || b.brew_method || '');
      r.brew_attempt = String(b.attempt != null ? b.attempt : ((a.attempt || 0) + 1));
      r.brew_ey_model = b.ey_model ? String(b.ey_model) : '';
      r.brew_dose_g = doseVal === '' || doseVal == null ? '' : String(doseVal);
      r.brew_water_g = waterVal === '' || waterVal == null ? '' : String(waterVal);
      r.brew_ratio = ratioVal === '' || ratioVal == null ? '' : String(ratioVal);
      r.brew_temp_f = tempFVal === '' ? '' : String(tempFVal);
      r.brew_temp_c = tempCVal === '' ? '' : String(tempCVal);
      r.brew_temp_recommended_f = b.temp_rec_f ? String(b.temp_rec_f) : '';
      r.brew_ratio_recommended = b.ratio_rec ? String(b.ratio_rec) : '';
      r.brew_grind_target_um = b.grind_um != null && b.grind_um !== '' ? String(b.grind_um) : '';
      r.brew_grind_setting = b.grind_setting || '';
      r.brew_time_s = timeVal === '' ? '' : String(timeVal);
      r.brew_agitation = b.agit || b.agitation || '';
      const techIn = b.tech || b.technique || 'standard';
      r.brew_technique = _TECH_CSV_MAP[techIn] || resolveTechCsv(techIn) || 'standard';
      r.brew_technique_detail = b.tech_detail || '';
      r.brew_adjustment = b.adjustment || '';
      r.brew_actual_time_s = actTimeVal ? String(actTimeVal) : '';
      r.details_guessed = b.guessed || '';
      r.brew_out_g = outVal ? String(outVal) : '';
      r.brew_tds_pct = tdsVal ? String(tdsVal) : '';
      if (+tdsVal > 0 && +outVal > 0 && +doseVal > 0){
        r.brew_ey_pct = String(Math.round((+tdsVal * +outVal / +doseVal) * 100) / 100);
      }
      r.brew_style = cleanLine(b.style || b.brew_style || (a.brew && (a.brew.style || a.brew.brewStyle)) || '').slice(0, 32);
      if (b.ey_total_pct != null && b.ey_total_pct !== '' && isFinite(+b.ey_total_pct)){
        r.brew_ey_total_pct = String(Math.round(+b.ey_total_pct * 100) / 100);
      } else if (+tdsVal > 0 && +doseVal > 0 && typeof steepRead === 'function'){
        const mk = b.key || resolveMethod(r.brew_method);
        const rd = steepRead(mk, +tdsVal, +outVal, +doseVal, +waterVal);
        if (rd && rd.ey != null) r.brew_ey_total_pct = String(rd.ey);
      }
      r.brew_water_type = b.water_type || b.waterType || '';
      const alkN = _numOrNull(b.water_alk != null ? b.water_alk : b.waterAlk);
      const ghN = _numOrNull(b.water_gh != null ? b.water_gh : b.waterGH);
      r.water_alkalinity_mgl = alkN == null ? '' : String(alkN);
      r.water_hardness_mgl = ghN == null ? '' : String(ghN);
      r.brew_filter = b.filter || '';
      r.brew_grinder_type = b.grinder_type || b.grinderType || '';
      r.brew_grinder_name = b.grinder_name || b.grinderName || '';
      r.brew_pour_notes = b.pour_notes || b.pourNotes || '';
      if (b.dial && typeof b.dial === 'object'){
        if (b.dial.symptom) r.dial_symptom = String(b.dial.symptom).slice(0, 24);
        if (Array.isArray(b.dial.change)) r.dial_change = b.dial.change.join(';');
        else if (typeof b.dial.change === 'string') r.dial_change = b.dial.change;
        if (b.dial.fromId) r.dial_from_id = String(b.dial.fromId).slice(0, 64);
      }

      const rawAdap = b.recipe_adaptation_json || b.adaptation_json || b.adaptation || null;
      if (rawAdap){
        try {
          const parsed = typeof rawAdap === 'string' ? JSON.parse(rawAdap) : rawAdap;
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) adapOut = Object.assign({}, parsed);
        } catch(e){}
      }
      if (bleTel){
        const bleSum = { src:String(bleTel.source || 'ble').slice(0, 16) };
        if (bleTel.brandLabel) bleSum.brand = String(bleTel.brandLabel).slice(0, 32);
        if (+bleTel.actualDoseG > 0) bleSum.doseG = Math.round(+bleTel.actualDoseG * 10) / 10;
        if (+bleTel.actualWaterG > 0) bleSum.waterG = Math.round(+bleTel.actualWaterG * 10) / 10;
        if (+bleTel.actualYieldG > 0) bleSum.yieldG = Math.round(+bleTel.actualYieldG * 10) / 10;
        if (+bleTel.actualSecs > 0) bleSum.timeS = Math.round(+bleTel.actualSecs);
        if (isFinite(+bleTel.peakFlowGs) && +bleTel.peakFlowGs > 0) bleSum.peakGs = Math.round(+bleTel.peakFlowGs * 10) / 10;
        if (bleTel.darcy && bleTel.darcy.status) bleSum.darcy = String(bleTel.darcy.status).slice(0, 24);
        adapOut.ble_summary = bleSum;
      } else if (b.ble_summary && typeof b.ble_summary === 'object'){
        adapOut.ble_summary = b.ble_summary;
      }
      const mpRaw = b.machineProfile || b.machine_profile || (a.brew && a.brew.machineProfile ? a.brew.machineProfile : null);
      if (mpRaw && typeof mpRaw === 'object' && !Array.isArray(mpRaw)){
        try { adapOut.machine_profile = JSON.parse(JSON.stringify(mpRaw)); } catch(e){}
      }
      /* Preserve optional v6 physics/innovation envelopes inside recipe_adaptation_json & structured v6 block */
      ['v6_diag', 'slurry_thermal', 'wave_split', 'pressure_summary', 'brew_twin_from', 'drink_lab', 'drift_shield', 'next_recipe', 'dial_adaptation'].forEach(vk => {
        if (b[vk] !== undefined && b[vk] !== null) adapOut[vk] = b[vk];
        else if (s[vk] !== undefined && s[vk] !== null) adapOut[vk] = s[vk];
      });
      const v6Block = Object.assign({}, (adapOut.v6 && typeof adapOut.v6 === 'object') ? adapOut.v6 : {}, (b.v6 && typeof b.v6 === 'object') ? b.v6 : {}, (s.v6Brew && typeof s.v6Brew === 'object') ? s.v6Brew : {});
      const r2Src = b.r2 || s.r2 || ((b.r2TempC != null || b.nD20 != null || s.r2TempC != null || s.nD20 != null) ? { sampleTempC:b.r2TempC != null ? +b.r2TempC : +s.r2TempC, nD20:b.nD20 != null ? +b.nD20 : +s.nD20, prep:b.r2Prep || s.r2Prep || '' } : null);
      if (r2Src && typeof r2Src === 'object'){
        const r2Clean = {};
        if (isFinite(+r2Src.sampleTempC)) r2Clean.sampleTempC = Math.round(+r2Src.sampleTempC * 10) / 10;
        if (isFinite(+r2Src.nD20) && +r2Src.nD20 > 1.3) r2Clean.nD20 = Math.round(+r2Src.nD20 * 100000) / 100000;
        if (isFinite(+r2Src.brix) && +r2Src.brix >= 0) r2Clean.brix = Math.round(+r2Src.brix * 100) / 100;
        if (+tdsVal > 0) r2Clean.tdsPct = +tdsVal;
        if (typeof r2Src.prep === 'string' && r2Src.prep.trim()) r2Clean.prep = r2Src.prep.trim().slice(0, 48);
        if (r2Clean.sampleTempC != null && _g.BTCoreV6 && _g.BTCoreV6.mass && typeof _g.BTCoreV6.mass.evaluateR2SampleReadiness === 'function'){
          try { const rd = _g.BTCoreV6.mass.evaluateR2SampleReadiness(r2Clean.sampleTempC); if (rd && rd.status) r2Clean.readiness = rd.status; } catch(e){}
        } else if (typeof r2Src.readiness === 'string') r2Clean.readiness = r2Src.readiness.slice(0, 24);
        if (Object.keys(r2Clean).length) v6Block.r2 = r2Clean;
      }
      const waveSrc = b.waveCurve || b.wave_split || s.waveCurve || s.wave_split || null;
      if (waveSrc && typeof waveSrc === 'object') v6Block.waveCurve = waveSrc;
      const traceSrc = b.bleTrace || b.pressure_summary || s.bleTrace || (bleTel ? { peakFlowGs:bleTel.peakFlowGs, meanFlowGs:bleTel.meanFlowGs, peakBar:bleTel.peakBar, darcyStatus:bleTel.darcy && bleTel.darcy.status } : null);
      if (traceSrc && typeof traceSrc === 'object') v6Block.bleTrace = traceSrc;
      const postSrc = b.faultPosterior || s.faultPosterior || b.v6_diag || s.v6_diag || null;
      if (postSrc && typeof postSrc === 'object') v6Block.faultPosterior = postSrc;
      if (b.slurryThermal || b.slurry_thermal) v6Block.slurryThermal = b.slurryThermal || b.slurry_thermal;
      const excl = !!(b.exclude_learning || s.exclude_learning || b.excludeLearning || s.excludeLearning);
      if (excl){
        v6Block.exclude_learning = true;
        v6Block.outlier_reason = String(b.outlier_reason || s.outlier_reason || b.outlierReason || s.outlierReason || 'off_palate').slice(0, 32);
      } else if (b.outlier_reason || s.outlier_reason || b.outlierReason || s.outlierReason){
        v6Block.outlier_reason = String(b.outlier_reason || s.outlier_reason || b.outlierReason || s.outlierReason).slice(0, 32);
      }
      const surpZ = b.surprise_z != null ? b.surprise_z : s.surprise_z;
      if (surpZ != null && surpZ !== '' && isFinite(+surpZ)) v6Block.surprise_z = Math.round(+surpZ * 100) / 100;
      if (!r.brew_ey_model){
        const sim = _evaluateFreshV6Physics(co, b);
        if (sim && isFinite(+(sim.eyCupPct != null ? sim.eyCupPct : sim.eyPct))){
          r.brew_ey_model = String(Math.round(+(sim.eyCupPct != null ? sim.eyCupPct : sim.eyPct) * 100) / 100);
        }
      }
      if (Object.keys(v6Block).length) adapOut.v6 = v6Block;
    }

    const num1 = v => { const n = typeof v === 'number' ? v : parseFloat(v); return (isFinite(n) && n > 0 && n <= 2500) ? Math.round(n * 10) / 10 : null; };
    const numSigned1 = v => { const n = typeof v === 'number' ? v : parseFloat(v); return (isFinite(n) && Math.abs(n) <= 120) ? Math.round(n * 10) / 10 : null; };
    const beanAg = num1(co.bean_agtron);
    const groundAg = num1(co.ground_agtron != null && co.ground_agtron !== '' ? co.ground_agtron : co.agtron);
    const eqAg = num1(co.agtron != null && co.agtron !== '' ? co.agtron : (groundAg != null ? groundAg : beanAg));
    if (eqAg != null) adapOut.agtron = eqAg;
    if (beanAg != null) adapOut.bean_agtron = beanAg;
    if (groundAg != null) adapOut.ground_agtron = groundAg;
    if (co.agtron_scale && /^(gourmet|commercial|omni|tonino|cm100)$/.test(String(co.agtron_scale))) adapOut.agtron_scale = String(co.agtron_scale);
    const rDelta = co.roast_delta !== '' && co.roast_delta != null ? numSigned1(co.roast_delta) : (beanAg != null && groundAg != null ? numSigned1(groundAg - beanAg) : null);
    if (rDelta != null) adapOut.roast_delta = rDelta;
    const gBle = (a.prefs && a.prefs.gear && a.prefs.gear.ble) ? a.prefs.gear.ble : null;
    const d10 = num1(co.psd_d10_um || (b && b.psd_d10_um) || (gBle && gBle.omniD10Um));
    const d50 = num1(co.psd_d50_um || (b && b.psd_d50_um) || (gBle && gBle.omniD50Um));
    const d90 = num1(co.psd_d90_um || (b && b.psd_d90_um) || (gBle && gBle.omniD90Um));
    const spRaw = co.psd_span || (b && b.psd_span) || (gBle && gBle.omniSpan);
    const spVal = spRaw != null && spRaw !== '' && isFinite(+spRaw) && +spRaw > 0 && +spRaw <= 10 ? Math.round(+spRaw * 100) / 100 : null;
    if (d10 != null) adapOut.psd_d10_um = d10;
    if (d50 != null) adapOut.psd_d50_um = d50;
    if (d90 != null) adapOut.psd_d90_um = d90;
    if (spVal != null) adapOut.psd_span = spVal;
    if (d10 != null || d50 != null || d90 != null || (b && b.omniPsd)){
      adapOut.v6 = adapOut.v6 || {};
      adapOut.v6.omniPsd = Object.assign({ d10Um:d10, d50Um:d50, d90Um:d90, span:spVal }, (b && b.omniPsd && typeof b.omniPsd === 'object') ? b.omniPsd : {});
    }

    const coffeeExtra = {};
    const putExStr = (k, v, maxLen) => {
      if (v === undefined || v === null || v === '') return;
      const sVal = typeof v === 'string' ? cleanLine(v) : (typeof v === 'number' && isFinite(v) ? String(v) : '');
      if (sVal) coffeeExtra[k] = maxLen ? sVal.slice(0, maxLen) : sVal;
    };
    putExStr('region', co.region, 100);
    putExStr('roaster_location', co.roaster_location || co.roasterLocation, 100);
    putExStr('farm', co.farm, 100);
    putExStr('farm_or_station', co.farm_or_station || co.farm, 100);
    putExStr('producer', co.producer, 100);
    putExStr('harvest_year', co.harvest_year || co.harvestYear, 16);
    putExStr('process_sub', co.process_sub || co.processSub, 48);
    putExStr('process_details', co.process_details || co.processDetails, 240);
    if (co.personal_note || co.personalNote){
      const pn = String(co.personal_note || co.personalNote).trim().slice(0, 400);
      if (pn) coffeeExtra.personal_note = pn;
    }
    const bwRaw = co.bag_weight_g !== undefined && co.bag_weight_g !== '' ? co.bag_weight_g : co.bagWeightG;
    if (bwRaw !== undefined && bwRaw !== null && bwRaw !== '' && isFinite(+bwRaw) && +bwRaw > 0){
      coffeeExtra.bag_weight_g = Math.round(+bwRaw * 10) / 10;
    }
    const remRaw = co.remaining_g !== undefined && co.remaining_g !== '' ? co.remaining_g : co.rem_g;
    if (remRaw !== undefined && remRaw !== null && remRaw !== '' && isFinite(+remRaw) && +remRaw >= 0){
      coffeeExtra.remaining_g = Math.round(+remRaw * 10) / 10;
    }
    const prcRaw = co.price !== undefined && co.price !== '' ? co.price : co.bagPrice;
    if (prcRaw !== undefined && prcRaw !== null && prcRaw !== '' && isFinite(+prcRaw) && +prcRaw > 0){
      coffeeExtra.price = Math.round(+prcRaw * 100) / 100;
    }
    putExStr('currency', co.currency, 8);
    if (Array.isArray(co.flavors) && co.flavors.length) coffeeExtra.flavors = co.flavors.filter(Boolean).slice(0, 16);
    if (co.roasterGuide && typeof co.roasterGuide === 'object' && !Array.isArray(co.roasterGuide)){
      try { coffeeExtra.roasterGuide = JSON.parse(JSON.stringify(co.roasterGuide)); } catch(e){}
    }
    const restRaw = co.recommended_rest_days != null && co.recommended_rest_days !== '' ? co.recommended_rest_days : co.recommendedRestDays;
    if (restRaw != null && restRaw !== '' && isFinite(+restRaw) && +restRaw >= 0){
      coffeeExtra.recommended_rest_days = Math.round(+restRaw);
    }
    if (Object.keys(coffeeExtra).length) adapOut.coffee_extra = coffeeExtra;

    if (Object.keys(adapOut).length){
      try {
        let js = JSON.stringify(adapOut);
        if (js.length > 6000 && adapOut.machine_profile && typeof adapOut.machine_profile === 'object'){
          const mpSlim = Object.assign({}, adapOut.machine_profile);
          delete mpSlim.notes; delete mpSlim.description;
          adapOut.machine_profile = mpSlim;
          js = JSON.stringify(adapOut);
        }
        if (js && js !== '{}' && js.length <= 8000) r.recipe_adaptation_json = js;
      } catch(e){}
    }
    return r;
  }

  function _buildRowImpl(overrides){
    const s = Object.assign({}, _getState(), overrides || {});
    const r = _baseRowImpl(overrides);
    const cv = s.cva, cupped = !!(cv && cv.cur >= 10);
    const sv = s.stars ? validStars(s.stars) : 0;
    r.my_rating_stars = sv ? String(sv) : '';
    if (cupped) Object.assign(r, cvaRowPart(cv));
    else r.score_kind = 'quick';
    r.mode = cupped ? 'single_cup' : 'quick';
    r.general_notes = s.general_notes || '';
    ['fragrance_aroma', 'flavor', 'aftertaste', 'acidity', 'body'].forEach(k => {
      r['words_' + k] = ((s.words && s.words[k]) || []).join('; ');
    });
    r.aroma_vials = (s.vials || []).join('; ');
    if (Array.isArray(s.kit) && s.kit.length){
      const kn = typeof KIT_NAMES !== 'undefined' && KIT_NAMES ? KIT_NAMES : {};
      r.aroma_kit = s.kit.map(n => kn[n] ? (n + ' ' + kn[n]) : String(n)).join('; ');
    }
    if (s.quick && typeof s.quick === 'object'){
      r.make_again = quickMakeAgain(s.quick.make || s.quick.makeAgain);
      const areas = s.quick.areas || {};
      QUICK_AREAS.forEach(qa => { r[qa.col] = quickGrade(areas[qa.key]); });
      const fl = cleanFlavorLists(s.quick.liked, s.quick.notLiked);
      r.flavors_liked = fl.liked.join('; ');
      r.flavors_not_liked = fl.notLiked.join('; ');
    }
    if (!r.fix_symptom){
      const qsym = String((s.quick && s.quick.sym) || s.fix_symptom || s.sym || (cv && cv.sym) || '').trim().toLowerCase();
      if (/^[a-z_]{2,24}$/.test(qsym)) r.fix_symptom = qsym;
    }
    const isExclRow = !!(s.exclude_learning === true || s.excludeLearning === true);
    if (!isExclRow && (s.dial_locked === 'yes' || s.dial_locked === true)) r.dial_locked = 'yes';
    const descSrc = Object.assign({}, (cv && cv.desc) || {}, (cv && cv.intensity) || {}, (s.quick && s.quick.desc) || {}, s.intensity || {}, s.intensities || {}, s.desc || {});
    if (s.pad_xy) descSrc.pad_xy = s.pad_xy;
    const v6Sens = Object.assign({}, (descSrc.v6 && typeof descSrc.v6 === 'object') ? descSrc.v6 : {}, (s.v6Sensory && typeof s.v6Sensory === 'object') ? s.v6Sensory : {}, (s.v6 && typeof s.v6 === 'object') ? s.v6 : {});
    if (s.pad_xy && !v6Sens.padXY) v6Sens.padXY = s.pad_xy;
    if (s.dualPin && typeof s.dualPin === 'object') v6Sens.dualPin = s.dualPin;
    if (s.goldenSip && typeof s.goldenSip === 'object'){
      v6Sens.goldenSip = s.goldenSip;
      if (!r.cool_acidity && typeof s.goldenSip.cool === 'string') r.cool_acidity = s.goldenSip.cool.slice(0, 120);
      if (!r.cool_sweetness && typeof s.goldenSip.golden === 'string') r.cool_sweetness = s.goldenSip.golden.slice(0, 120);
      if (!r.cool_bitterness && typeof s.goldenSip.hot === 'string') r.cool_bitterness = s.goldenSip.hot.slice(0, 120);
    }
    if (s.splitCards && typeof s.splitCards === 'object') v6Sens.splitCards = s.splitCards;
    if (s.scratchReveal && typeof s.scratchReveal === 'object') v6Sens.scratchReveal = s.scratchReveal;
    if (isExclRow){
      v6Sens.exclude_learning = true;
      v6Sens.outlier_reason = String(s.outlier_reason || s.outlierReason || 'off_palate').slice(0, 32);
    } else if (typeof (s.outlier_reason || s.outlierReason) === 'string' && String(s.outlier_reason || s.outlierReason).trim()){
      v6Sens.outlier_reason = String(s.outlier_reason || s.outlierReason).trim().slice(0, 32);
    }
    if (s.surprise_z != null && s.surprise_z !== '' && isFinite(+s.surprise_z)) v6Sens.surprise_z = Math.round(+s.surprise_z * 100) / 100;
    if (typeof (s.drawdown_cue || s.drawdownCue) === 'string' && /^(fast|normal|slow)$/.test(s.drawdown_cue || s.drawdownCue)) v6Sens.drawdown_cue = (s.drawdown_cue || s.drawdownCue);
    if (typeof (s.context_tag || s.contextTag) === 'string' && /^(normal|off_palate|chalky_water|not_my_style)$/.test(s.context_tag || s.contextTag)) v6Sens.context_tag = (s.context_tag || s.contextTag);
    if ((s.r2_discrepancy || s.r2Discrepancy) && typeof (s.r2_discrepancy || s.r2Discrepancy) === 'object') v6Sens.r2_discrepancy = (s.r2_discrepancy || s.r2Discrepancy);
    if (Object.keys(v6Sens).length) descSrc.v6 = v6Sens;
    if (Object.keys(descSrc).length) syncRowIntensities(r, descSrc);
    ['acidity', 'body', 'sweetness'].forEach(dim => {
      const vv = s.vs && s.vs[dim];
      if (vv === 'less' || vv === 'same' || vv === 'more') r['vs_' + dim] = vv;
    });
    COLUMNS.forEach(k => { if (TEXT_COLUMNS.has(k)) r[k] = neutralize(r[k]); });
    return r;
  }

  function _btValidIsoDateRef(s){
    return /^\d{4}-\d{2}-\d{2}$/.test(String(s || '').trim());
  }
  function _daysSinceRef(roastIso, refDate){
    if (!_btValidIsoDateRef(roastIso)) return null;
    const ref = refDate instanceof Date && !isNaN(refDate) ? refDate : new Date();
    const a = Date.UTC(+roastIso.slice(0, 4), +roastIso.slice(5, 7) - 1, +roastIso.slice(8, 10));
    const b = Date.UTC(ref.getFullYear(), ref.getMonth(), ref.getDate());
    const d = Math.round((b - a) / 86400000);
    return d >= 0 ? d : null;
  }

  function _populateCoffeeFromRowObj(o){
    const g = k => unneutralize((o && o[k]) || '');
    const c = (typeof newCoffee === 'function') ? newCoffee() : {
      id:_newUid(), name:'', roaster:'', origin:'', region:'', farm:'', farm_or_station:'', producer:'', harvest_year:'', roaster_location:'',
      varietal:'', species:'arabica', roast:'', process:'', process_sub:'', process_details:'', decaf:'', decaf_process:'',
      density:'', elevText:'', elevation_m:'', roast_date:'', is_frozen:'', frozen_date:'', freeze_days_offset:'',
      bag_notes:'', notes:'', flavors:[], personal_note:'', bag_weight_g:'', bagWeightG:'', remaining_g:'', price:'', bagPrice:'', currency:'USD', blend:'',
      agtron:'', bean_agtron:'', ground_agtron:'', agtron_scale:'gourmet', roast_delta:'', psd_d10_um:'', psd_d50_um:'', psd_d90_um:'', psd_span:'',
      roasterGuide:null, recommended_rest_days:null,
      roastUnsure:'', dateUnsure:'', roasterUnsure:'', varietalUnsure:'', originUnsure:'', processUnsure:'', elevUnsure:'', notesUnsure:'', answered:'yes'
    };
    if (o && o.coffee_id) c.id = o.coffee_id;
    c.name = g('coffee_name');
    c.roaster = g('roaster');
    c.origin = g('origin');
    c.varietal = g('varietal');
    c.bag_notes = g('bag_notes');
    c.notes = c.bag_notes;
    c.decaf = (o && o.decaf === 'yes') ? 'yes' : '';
    c.species = g('species') || 'arabica';
    c.decaf_process = g('decaf_process') || '';
    c.is_frozen = (o && o.is_frozen === 'yes') ? 'yes' : '';
    c.frozen_date = _btValidIsoDateRef(o && o.frozen_date) ? o.frozen_date : '';
    c.freeze_days_offset = (o && o.freeze_days_offset) ? String(o.freeze_days_offset) : '';
    c.roast = resolveRoast(g('roast_level')) || '';
    c.process = resolveProcess(g('process')) || '';
    c.density = resolveDensity(g('elevation_class'), o && o.elevation_m) || '';
    c.elevation_m = (o && o.elevation_m) ? String(o.elevation_m).trim() : '';
    c.elevText = c.elevation_m ? (c.elevation_m + ' masl') : '';
    c.blend = resolveBlend(g('blend')) || '';
    c.roast_date = _btValidIsoDateRef(o && o.roast_date) ? o.roast_date : '';
    const adMeta = _readRowAdaptationMeta(o);
    if (adMeta){
      if (adMeta.agtron != null) c.agtron = String(adMeta.agtron);
      if (adMeta.bean_agtron != null) c.bean_agtron = String(adMeta.bean_agtron);
      if (adMeta.ground_agtron != null) c.ground_agtron = String(adMeta.ground_agtron);
      if (adMeta.agtron_scale) c.agtron_scale = String(adMeta.agtron_scale);
      if (adMeta.roast_delta != null) c.roast_delta = String(adMeta.roast_delta);
      if (adMeta.psd_d10_um != null) c.psd_d10_um = String(adMeta.psd_d10_um);
      if (adMeta.psd_d50_um != null) c.psd_d50_um = String(adMeta.psd_d50_um);
      if (adMeta.psd_d90_um != null) c.psd_d90_um = String(adMeta.psd_d90_um);
      if (adMeta.psd_span != null) c.psd_span = String(adMeta.psd_span);
      if (adMeta.roaster_guide && typeof adMeta.roaster_guide === 'object') c.roasterGuide = adMeta.roaster_guide;
      const ce = adMeta.coffee_extra && typeof adMeta.coffee_extra === 'object' ? adMeta.coffee_extra : null;
      if (ce){
        if (ce.region) c.region = String(ce.region);
        if (ce.roaster_location) c.roaster_location = String(ce.roaster_location);
        if (ce.farm || ce.farm_or_station){
          c.farm = String(ce.farm || ce.farm_or_station);
          c.farm_or_station = String(ce.farm_or_station || ce.farm);
        }
        if (ce.producer) c.producer = String(ce.producer);
        if (ce.harvest_year) c.harvest_year = String(ce.harvest_year);
        if (ce.process_sub) c.process_sub = String(ce.process_sub);
        if (ce.process_details) c.process_details = String(ce.process_details);
        if (ce.personal_note) c.personal_note = String(ce.personal_note);
        if (ce.bag_weight_g != null && ce.bag_weight_g !== ''){
          c.bag_weight_g = ce.bag_weight_g;
          c.bagWeightG = ce.bag_weight_g;
        }
        if (ce.remaining_g != null && ce.remaining_g !== '') c.remaining_g = ce.remaining_g;
        if (ce.price != null && ce.price !== ''){
          c.price = ce.price;
          c.bagPrice = ce.price;
        }
        if (ce.currency) c.currency = String(ce.currency);
        if (Array.isArray(ce.flavors) && ce.flavors.length) c.flavors = ce.flavors.slice();
        if (!c.bag_notes && (ce.bag_notes || ce.notes)){
          c.bag_notes = String(ce.bag_notes || ce.notes);
          c.notes = c.bag_notes;
        }
        if (ce.roasterGuide && typeof ce.roasterGuide === 'object') c.roasterGuide = ce.roasterGuide;
        if (ce.recommended_rest_days != null && isFinite(+ce.recommended_rest_days)) c.recommended_rest_days = Math.round(+ce.recommended_rest_days);
      }
    }
    c.answered = 'yes';
    c.roasterUnsure = c.roaster ? '' : 'yes';
    c.roastUnsure = (c.roast && c.roast !== 'unknown') ? '' : 'yes';
    c.dateUnsure = (c.roast_date || c.is_frozen === 'yes') ? '' : 'yes';
    c.varietalUnsure = c.varietal ? '' : 'yes';
    c.originUnsure = (c.origin && c.origin !== 'unknown') ? '' : 'yes';
    c.processUnsure = (c.process && c.process !== 'unknown') ? '' : 'yes';
    c.elevUnsure = (c.elevation_m || (c.density && c.density !== 'unknown')) ? '' : 'yes';
    c.notesUnsure = c.bag_notes ? '' : 'yes';
    c.roast_unknown = c.roastUnsure;
    c.process_unknown = c.processUnsure;
    c.origin_unknown = c.originUnsure;
    c.elev_unknown = c.elevUnsure;
    return { coffee:c, adMeta };
  }

  function _useCoffeeFromRowImpl(o, stay, withMachineProfile){
    if (!o || typeof o !== 'object') return null;
    const a = _getApp();
    const built = _populateCoffeeFromRowObj(o);
    const c = built.coffee, adMeta = built.adMeta;
    const objs = (historyState && historyState.objs) || [];
    const att = objs.filter(x => o.coffee_id && x.coffee_id === o.coffee_id).map(x => parseInt(x.brew_attempt, 10) || 0);
    a.coffee = Object.assign(a.coffee || {}, c);
    a.attempt = att.length ? Math.max.apply(null, att) : 0;
    const mKey = resolveMethod(o.brew_method);
    if (mKey && a.brew) a.brew.method = mKey;
    if (+o.brew_dose_g > 0 && a.brew) a.brew.dose = +o.brew_dose_g;
    if (+o.brew_water_g > 0 && a.brew) a.brew.water = +o.brew_water_g;
    if (+o.brew_ratio > 0 && a.brew) a.brew.ratio = +o.brew_ratio;
    if (+o.brew_temp_f > 0 && a.brew) a.brew.tempF = +o.brew_temp_f;
    if (o.brew_style && a.brew) a.brew.style = unneutralize(o.brew_style);
    if (o.brew_grind_setting && a.brew) a.brew.grind_setting = unneutralize(o.brew_grind_setting);
    if (withMachineProfile && adMeta && adMeta.machine_profile && a.brew){
      try { a.brew.machineProfile = JSON.parse(JSON.stringify(adMeta.machine_profile)); } catch(e){}
    }
    if (a.adjust){ a.adjust.grind = 0; a.adjust.ratio = 0; a.adjust.agit = ''; }
    if (a.brew){
      delete a.brew.ey_model;
      a.brew.v6FreshEval = true;
      const freshSim = _evaluateFreshV6Physics(a.coffee, a.brew);
      if (freshSim) a.brew.v6SimPreview = freshSim;
    }
    _resetCupState();
    _triggerScheduleDraft();
    if (!stay && typeof go === 'function'){
      try { go(mKey ? 'recipe' : 'brew'); } catch(e){ _triggerRender(); }
    } else {
      _triggerRender();
    }
    return a.coffee;
  }

  /* ---------- Prices & Living-Bag Cellar ('brew-and-cup-prices-v1') ---------- */
  function _persistPrices(){
    try {
      if (prState.list.length > 0) localStorage.setItem(PRICES_LS_KEY, priceCsv(prState.list));
      else localStorage.removeItem(PRICES_LS_KEY);
      if (prState.changes > 0) localStorage.setItem(PRICES_CHANGES_LS_KEY, String(prState.changes));
      else localStorage.removeItem(PRICES_CHANGES_LS_KEY);
    } catch(e){}
    _unifiedIndexCache.key = '';
    _scheduleNativeVaultMirror();
  }
  function _parsePricesAnyFormat(rawText){
    const s = String(rawText == null ? '' : rawText).trim();
    if (!s) return { list:[], error:'' };
    if (s[0] === '[' || s[0] === '{'){
      try {
        const pj = JSON.parse(s);
        const arr = Array.isArray(pj) ? pj : (pj && Array.isArray(pj.list) ? pj.list : []);
        const mapped = arr.map(item => {
          if (!item || typeof item !== 'object') return null;
          return priceEntry(Object.assign({}, item, {
            coffee: item.coffee || item.name || item.coffee_name || '',
            roaster: item.roaster || '',
            size: item.size != null ? item.size : (item.grams != null ? item.grams : 250),
            unit: item.unit || 'g',
            price: item.price != null ? item.price : 20,
            sym: item.sym || item.currency || '$',
            roast: item.roast || item.roast_date || '',
            rlevel: item.rlevel || item.roast_level || ''
          }));
        }).filter(Boolean).slice(0, PRICE_MAX_ROWS);
        return { list:mapped, error:'' };
      } catch(e){ return { list:[], error:'Invalid JSON bag list.' }; }
    }
    const r = priceRead(s);
    return r.error ? { list:[], error:r.error } : { list:r.list || [], error:'' };
  }
  function _loadPricesImpl(){
    try {
      const t = localStorage.getItem(PRICES_LS_KEY);
      if (t){
        const parsed = _parsePricesAnyFormat(t);
        if (!parsed.error) prState.list = parsed.list;
      }
      prState.changes = Math.min(prState.list.length, Math.max(0, parseInt(localStorage.getItem(PRICES_CHANGES_LS_KEY), 10) || 0));
    } catch(e){}
    _unifiedIndexCache.key = '';
    return prState;
  }
  function _savePricesImpl(nextList){
    if (Array.isArray(nextList)){
      prState.list = nextList.map(priceEntry).filter(Boolean).slice(0, PRICE_MAX_ROWS);
      prState.changes++;
    } else if (nextList && Array.isArray(nextList.list)){
      prState.list = nextList.list.map(priceEntry).filter(Boolean).slice(0, PRICE_MAX_ROWS);
      prState.changes++;
    }
    _persistPrices();
    try { _upsertVaultFromPriceList(prState.list); } catch(e){}
    return prState;
  }
  function _forgetPricesImpl(){
    prState.list = []; prState.changes = 0; prState.undo = null; prState.deductUndo = null; prState.msg = ''; prState.q = '';
    try { localStorage.removeItem(PRICES_LS_KEY); localStorage.removeItem(PRICES_CHANGES_LS_KEY); } catch(e){}
    _unifiedIndexCache.key = '';
  }
  function _prLoadText(text){
    const r = priceRead(String(text || ''));
    if (r.error){ prState.msg = r.error; prState.tone = 'warn'; return r; }
    const m = priceMerge(prState.list, r.list);
    prState.list = m.list;
    prState.changes = priceMerge(r.list, prState.list).added;
    _persistPrices();
    prState.msg = m.added ? ('Loaded ' + m.added + (m.added === 1 ? ' purchase.' : ' purchases.')) : 'Nothing new in that file.';
    prState.tone = m.added ? 'ok' : 'info';
    return { ok:true, added:m.added, list:prState.list };
  }

  function _extractCoffeeIdentity(coffeeOrRec){
    const c = (coffeeOrRec && coffeeOrRec.coffee && typeof coffeeOrRec.coffee === 'object') ? coffeeOrRec.coffee : (coffeeOrRec || (_getApp().coffee) || {});
    const cid = String(c.coffee_id || c.id || (coffeeOrRec && coffeeOrRec.coffee_id) || '').trim();
    const rawName = cleanLine(unneutralize(
      c.name || c.coffee_name || (typeof c.coffee === 'string' ? c.coffee : '') ||
      (coffeeOrRec && (coffeeOrRec.name || coffeeOrRec.coffee_name || (typeof coffeeOrRec.coffee === 'string' ? coffeeOrRec.coffee : ''))) || ''
    ));
    const rawRoaster = cleanLine(unneutralize(c.roaster || (coffeeOrRec && coffeeOrRec.roaster) || ''));
    const cName = _normKeyPart(rawName);
    const cRoast = _normKeyPart(rawRoaster);
    return { c, cid, rawName, rawRoaster, cName, cRoast, nrKey:cName ? (cName + '|' + cRoast) : '' };
  }
  function _matchesPriceEntry(e, idInfo){
    if (!e || e.kind === 'pods') return false;
    if (idInfo.cid && e.coffee_id && e.coffee_id === idInfo.cid) return true;
    return !!(idInfo.cName && _normKeyPart(e.coffee) === idInfo.cName && (!idInfo.cRoast || !_normKeyPart(e.roaster) || _normKeyPart(e.roaster) === idInfo.cRoast));
  }
  function _findPriceBagIndices(coffeeOrRec, idInfo){
    let openIdx = -1;
    let finishedIdx = -1;
    if (coffeeOrRec && coffeeOrRec.openBag && Number.isInteger(coffeeOrRec.openBag.bagIndex) && prState.list[coffeeOrRec.openBag.bagIndex]){
      const ob = prState.list[coffeeOrRec.openBag.bagIndex];
      if (ob && !ob.finished && ob.kind !== 'pods') openIdx = coffeeOrRec.openBag.bagIndex;
    }
    if (openIdx < 0){
      for (let i = 0; i < prState.list.length; i++){
        const e = prState.list[i];
        if (!e || e.finished || e.kind === 'pods') continue;
        if (_matchesPriceEntry(e, idInfo)){ openIdx = i; break; }
      }
    }
    for (let i = prState.list.length - 1; i >= 0; i--){
      const e = prState.list[i];
      if (e && e.finished && _matchesPriceEntry(e, idInfo)){ finishedIdx = i; break; }
    }
    return { openIdx, finishedIdx };
  }
  function _findVaultCoffeeIdx(vList, idInfo){
    if (!Array.isArray(vList) || !vList.length) return -1;
    if (idInfo.cid){
      for (let i = 0; i < vList.length; i++){
        const it = vList[i];
        if (!it || typeof it !== 'object') continue;
        const itCid = String(it.coffee_id || it.id || '').trim();
        if (itCid && itCid === idInfo.cid) return i;
      }
    }
    if (idInfo.cName){
      for (let i = 0; i < vList.length; i++){
        const it = vList[i];
        if (!it || typeof it !== 'object') continue;
        const itName = _normKeyPart(it.name || it.coffee_name || it.coffee || '');
        const itRoast = _normKeyPart(it.roaster || '');
        if (itName === idInfo.cName && (!idInfo.cRoast || !itRoast || itRoast === idInfo.cRoast)) return i;
      }
    }
    return -1;
  }
  function _matchesAppCoffee(a, idInfo){
    if (!a || !a.coffee) return false;
    const ac = a.coffee;
    const appCid = String(ac.coffee_id || ac.id || '').trim();
    if (idInfo.cid && appCid && idInfo.cid === appCid) return true;
    const appName = _normKeyPart(ac.name || '');
    const appRoast = _normKeyPart(ac.roaster || '');
    return !!(idInfo.cName && appName && appName === idInfo.cName && (!idInfo.cRoast || !appRoast || appRoast === idInfo.cRoast));
  }
  function _isTastingRowSnapshot(obj){
    return !!(obj && typeof obj === 'object' && (obj.cupping_date || obj.brew_dose_g || obj.saved_at || obj.coffee_name));
  }
  function _resolveBagInventoryContext(coffeeOrRec, idInfo){
    const a = _getApp();
    const pr = _findPriceBagIndices(coffeeOrRec, idInfo);
    const vList = _getCoffeesVaultListImpl();
    const vaultIdx = _findVaultCoffeeIdx(vList, idInfo);
    const appMatches = _matchesAppCoffee(a, idInfo);
    const hasOpenPrice = pr.openIdx >= 0;
    const hasFinishedPrice = !hasOpenPrice && pr.finishedIdx >= 0;
    const priceEntryRef = hasOpenPrice ? prState.list[pr.openIdx] : (hasFinishedPrice ? prState.list[pr.finishedIdx] : null);
    const vaultRec = vaultIdx >= 0 ? vList[vaultIdx] : null;
    const vaultHasWeight = !!(vaultRec && ((vaultRec.remaining_g != null && vaultRec.remaining_g !== '' && isFinite(+vaultRec.remaining_g)) || (+vaultRec.bag_weight_g > 0)));
    const appHasWeight = !!(appMatches && a.coffee && ((a.coffee.remaining_g != null && a.coffee.remaining_g !== '' && isFinite(+a.coffee.remaining_g)) || (+a.coffee.bag_weight_g > 0)));
    const recHasWeight = !!(coffeeOrRec && ((coffeeOrRec.remaining_g != null && coffeeOrRec.remaining_g !== '' && isFinite(+coffeeOrRec.remaining_g)) || (+coffeeOrRec.bag_weight_g > 0)));
    const hasTrackedBag = hasOpenPrice || hasFinishedPrice || vaultHasWeight || appHasWeight || recHasWeight;
    const priceTotalG = priceEntryRef ? costGrams(priceEntryRef.size, priceEntryRef.unit) : 0;
    const vaultTotalG = (vaultRec && +vaultRec.bag_weight_g > 0) ? +vaultRec.bag_weight_g : 0;
    const appTotalG = (appMatches && a.coffee && +a.coffee.bag_weight_g > 0) ? +a.coffee.bag_weight_g : 0;
    const recTotalG = (coffeeOrRec && +coffeeOrRec.bag_weight_g > 0) ? +coffeeOrRec.bag_weight_g : 0;
    const totalG = Math.round((priceTotalG || vaultTotalG || appTotalG || recTotalG || 0) * 10) / 10;
    let curRem = NaN;
    if (hasOpenPrice && priceEntryRef){
      curRem = (priceEntryRef.rem_g != null && priceEntryRef.rem_g !== '' && isFinite(+priceEntryRef.rem_g)) ? +priceEntryRef.rem_g : priceTotalG;
    } else if (vaultHasWeight && vaultRec){
      curRem = (vaultRec.remaining_g != null && vaultRec.remaining_g !== '' && isFinite(+vaultRec.remaining_g)) ? +vaultRec.remaining_g : vaultTotalG;
    } else if (hasFinishedPrice && priceEntryRef){
      curRem = (priceEntryRef.rem_g != null && priceEntryRef.rem_g !== '' && isFinite(+priceEntryRef.rem_g)) ? +priceEntryRef.rem_g : 0;
    } else if (appHasWeight){
      curRem = (a.coffee.remaining_g != null && a.coffee.remaining_g !== '' && isFinite(+a.coffee.remaining_g)) ? +a.coffee.remaining_g : appTotalG;
    } else if (recHasWeight){
      curRem = (coffeeOrRec.remaining_g != null && coffeeOrRec.remaining_g !== '' && isFinite(+coffeeOrRec.remaining_g)) ? +coffeeOrRec.remaining_g : recTotalG;
    }
    return { a, pr, vList, vaultIdx, vaultRec, appMatches, hasOpenPrice, hasFinishedPrice, hasTrackedBag, totalG, curRem };
  }
  function _syncVaultRemaining(vList, vaultIdx, idInfo, priceEntryRef, totalG, nextRem){
    if (vaultIdx >= 0 && vList[vaultIdx]){
      const nextV = Object.assign({}, vList[vaultIdx], {
        remaining_g:nextRem,
        updatedAt:Date.now()
      });
      if (totalG > 0 && !(+nextV.bag_weight_g > 0)) nextV.bag_weight_g = totalG;
      vList[vaultIdx] = nextV;
      _saveCoffeesVaultListImpl(vList);
      return nextV;
    }
    const baseName = idInfo.rawName || (priceEntryRef && priceEntryRef.coffee) || '';
    const baseCid = idInfo.cid || (priceEntryRef && priceEntryRef.coffee_id) || '';
    if (!baseName && !baseCid) return null;
    return _upsertCoffeeVaultRecordImpl({
      id:baseCid,
      coffee_id:baseCid,
      name:baseName,
      roaster:idInfo.rawRoaster || (priceEntryRef && priceEntryRef.roaster) || '',
      bag_weight_g:totalG > 0 ? totalG : undefined,
      remaining_g:nextRem
    }, null, { forceRemaining:true });
  }

  /* Deduct brewed dose from active open bag across Prices, Vault, and app.coffee with 0g guard & 10-second Undo */
  function _deductBagGramsImpl(coffeeOrRec, doseG, opts){
    opts = opts || {};
    const dose = +doseG;
    if (!(dose > 0 && isFinite(dose))) return () => false;
    const idInfo = _extractCoffeeIdentity(coffeeOrRec);
    const ctx = _resolveBagInventoryContext(coffeeOrRec, idInfo);
    if (!ctx.hasTrackedBag) return () => false;
    if (!isFinite(ctx.curRem) || ctx.curRem <= 0.4){
      return { ok:false, empty:true, remaining_g:0 };
    }

    const nextRem = Math.max(0, Math.round((ctx.curRem - dose) * 10) / 10);
    const targetIdx = ctx.pr.openIdx;
    const hasPrice = targetIdx >= 0;
    const prevPriceEntry = hasPrice ? Object.assign({}, prState.list[targetIdx]) : null;
    const prevVaultList = ctx.vList.map(it => _cloneObj(it) || it);
    const prevAppMatches = ctx.appMatches;
    const prevAppRem = prevAppMatches && ctx.a.coffee ? ctx.a.coffee.remaining_g : undefined;
    const prevAppOpenBag = (prevAppMatches && ctx.a.coffee && ctx.a.coffee.openBag) ? _cloneObj(ctx.a.coffee.openBag) : undefined;

    if (hasPrice){
      const patch = { rem_g:nextRem };
      if (nextRem <= 0.4 && opts.autoFinish) patch.finished = _todayIso();
      const updated = priceSet(prState.list, targetIdx, patch);
      if (!updated.ok) return () => false;
      prState.list = updated.list;
      prState.changes++;
      _persistPrices();
    }
    const priceRefAfter = hasPrice ? prState.list[targetIdx] : null;
    _syncVaultRemaining(ctx.vList, ctx.vaultIdx, idInfo, priceRefAfter, ctx.totalG, nextRem);

    if (prevAppMatches && ctx.a.coffee){
      ctx.a.coffee.remaining_g = nextRem;
      if (ctx.totalG > 0 && !(+ctx.a.coffee.bag_weight_g > 0)){
        ctx.a.coffee.bag_weight_g = ctx.totalG;
        ctx.a.coffee.bagWeightG = ctx.totalG;
      }
      if (ctx.a.coffee.openBag && typeof ctx.a.coffee.openBag === 'object'){
        ctx.a.coffee.openBag.rem_g = nextRem;
      }
      saveDraftFromApp();
    }
    if (coffeeOrRec && typeof coffeeOrRec === 'object' && coffeeOrRec !== ctx.a.coffee){
      if (Object.prototype.hasOwnProperty.call(coffeeOrRec, 'remaining_g') || coffeeOrRec.openBag !== undefined){
        coffeeOrRec.remaining_g = nextRem;
      }
      if (coffeeOrRec.openBag && typeof coffeeOrRec.openBag === 'object'){
        coffeeOrRec.openBag.rem_g = nextRem;
      }
    }
    _unifiedIndexCache.key = '';

    const coffeeLabel = (prevPriceEntry && prevPriceEntry.coffee) || (ctx.vaultRec && ctx.vaultRec.name) || idInfo.rawName || 'coffee';
    const stampedAt = Date.now();
    let undone = false;
    const undoFn = function undoBagDeduct(){
      if (undone) return false;
      if (!opts.ignoreExpiry && Date.now() - stampedAt > 10000) return false;
      if (hasPrice){
        if (!prState.list[targetIdx]) return false;
        prState.list[targetIdx] = prevPriceEntry;
        prState.changes = Math.max(0, prState.changes - 1);
        _persistPrices();
      }
      _saveCoffeesVaultListImpl(prevVaultList);
      if (prevAppMatches && ctx.a.coffee){
        if (prevAppRem === undefined) delete ctx.a.coffee.remaining_g;
        else ctx.a.coffee.remaining_g = prevAppRem;
        if (prevAppOpenBag !== undefined) ctx.a.coffee.openBag = prevAppOpenBag;
        saveDraftFromApp();
      }
      _unifiedIndexCache.key = '';
      undone = true;
      _triggerRender();
      return true;
    };
    undoFn.ok = true;
    undoFn.empty = false;
    undoFn.remaining_g = nextRem;
    undoFn.bag_weight_g = ctx.totalG;
    undoFn.deducted_g = Math.round(dose * 10) / 10;
    undoFn.undo = undoFn;

    prState.deductUndo = { fn:undoFn, at:stampedAt, coffee:coffeeLabel, doseG:dose, remG:nextRem };
    if (!opts.silent){
      _notifyToast('Deducted ' + Math.round(dose * 10) / 10 + ' g (' + nextRem + ' g left in bag)', { actionLabel:'Undo', onAction:undoFn, durationMs:10000 });
    }
    return undoFn;
  }

  /* Reconcile remaining bag grams when an existing tasting dose is edited (delta = newDose - oldDose) */
  function _reconcileBagDoseDeltaImpl(rowOrCoffee, deltaDoseG){
    const delta = +deltaDoseG;
    if (!isFinite(delta)) return { ok:false, changed:false, remaining_g:null };
    if (Math.abs(delta) < 0.01) return { ok:true, changed:false, delta:0 };
    const idInfo = _extractCoffeeIdentity(rowOrCoffee);
    const ctx = _resolveBagInventoryContext(rowOrCoffee, idInfo);
    if (!ctx.hasTrackedBag || !isFinite(ctx.curRem)){
      return { ok:false, changed:false, remaining_g:null };
    }
    const rawNext = Math.round((ctx.curRem - delta) * 10) / 10;
    const nextRem = ctx.totalG > 0 ? Math.min(ctx.totalG, Math.max(0, rawNext)) : Math.max(0, rawNext);

    const priceIdx = ctx.pr.openIdx >= 0 ? ctx.pr.openIdx : (delta < 0 ? ctx.pr.finishedIdx : -1);
    let priceRefAfter = null;
    if (priceIdx >= 0 && prState.list[priceIdx]){
      const patch = { rem_g:nextRem };
      if (nextRem > 0.4 && prState.list[priceIdx].finished) patch.finished = '';
      const updated = priceSet(prState.list, priceIdx, patch);
      if (updated.ok){
        prState.list = updated.list;
        prState.changes++;
        _persistPrices();
        priceRefAfter = prState.list[priceIdx];
      }
    }
    _syncVaultRemaining(ctx.vList, ctx.vaultIdx, idInfo, priceRefAfter, ctx.totalG, nextRem);

    if (ctx.appMatches && ctx.a.coffee){
      ctx.a.coffee.remaining_g = nextRem;
      if (ctx.a.coffee.openBag && typeof ctx.a.coffee.openBag === 'object'){
        ctx.a.coffee.openBag.rem_g = nextRem;
      }
      saveDraftFromApp();
    }
    _unifiedIndexCache.key = '';
    return {
      ok:true,
      changed:true,
      remaining_g:nextRem,
      total_g:ctx.totalG,
      delta:Math.round(delta * 10) / 10
    };
  }

  /* ---------- Coffee Shops ('brew-and-cup-shops-v1' & 'brew-and-cup-shopdraft-v1') ---------- */
  const _shEmpty = () => !shState.store.drinks.length && !shState.store.shops.length && !(shState.store.home.city || shState.store.home.region || shState.store.home.country);
  function _persistShops(){
    try {
      if (!_shEmpty()) localStorage.setItem(SHOPS_LS_KEY, shopCsv(shState.store));
      else localStorage.removeItem(SHOPS_LS_KEY);
      if (shState.changes > 0) localStorage.setItem(SHOPS_CHANGES_LS_KEY, String(shState.changes));
      else localStorage.removeItem(SHOPS_CHANGES_LS_KEY);
      shState.failed = false;
    } catch(e){ shState.failed = true; }
    _scheduleNativeVaultMirror();
  }
  function _loadShopsImpl(){
    try {
      const t = localStorage.getItem(SHOPS_LS_KEY), r = t ? shopRead(t) : null;
      if (r && !r.error) shState.store = r.store;
      shState.changes = Math.max(0, parseInt(localStorage.getItem(SHOPS_CHANGES_LS_KEY), 10) || 0);
    } catch(e){}
    return shState;
  }
  function _saveShopsImpl(nextStore){
    if (nextStore && typeof nextStore === 'object'){
      if (Array.isArray(nextStore.drinks)) shState.store = nextStore;
      else if (nextStore.store && Array.isArray(nextStore.store.drinks)) shState.store = nextStore.store;
      shState.changes++;
    }
    _persistShops();
    return shState;
  }
  function _btShopAddDrink(storeOrDrink, maybeDrink){
    if (maybeDrink !== undefined){
      const r = shopAddDrink(storeOrDrink, maybeDrink);
      if (storeOrDrink === shState.store && r.added){ shState.store = r.store; shState.changes++; _persistShops(); }
      return r;
    }
    const r = shopAddDrink(shState.store, storeOrDrink);
    if (r.added){ shState.store = r.store; shState.changes++; _persistShops(); }
    return r;
  }
  function _forgetShopsImpl(){
    shState = { store:shopStore(), changes:0, failed:false, msg:'', q:'', tab:'drinks' };
    try { localStorage.removeItem(SHOPS_LS_KEY); localStorage.removeItem(SHOPS_CHANGES_LS_KEY); } catch(e){}
  }
  function _shLoadText(text){
    const r = shopRead(String(text || ''));
    if (r.error){ shState.msg = r.error; return r; }
    const before = shState.store.drinks.length + shState.store.shops.length;
    let st = shState.store;
    r.store.shops.forEach(s => { const a = shopAddShop(st, s); if (a.added) st = a.store; });
    r.store.drinks.forEach(d => { const a = shopAddDrink(st, d); if (a.added) st = a.store; });
    const h0 = r.store.home, noHome = !(st.home.city || st.home.region || st.home.country);
    if (noHome && (h0.city || h0.region || h0.country)) st = shopSetHome(st, h0);
    const added = st.drinks.length + st.shops.length - before;
    shState.store = st; shState.changes = 0; _persistShops();
    shState.msg = added ? ('Loaded ' + added + (added === 1 ? ' item.' : ' items.')) : 'Nothing new in that file.';
    return { ok:true, added, store:shState.store };
  }
  function _persistShopDraft(){
    try {
      if (sdState && sdState.on) localStorage.setItem(SHOP_DRAFT_LS_KEY, JSON.stringify(sdState));
      else localStorage.removeItem(SHOP_DRAFT_LS_KEY);
    } catch(e){}
  }
  function _loadShopDraftImpl(){
    try {
      const raw = localStorage.getItem(SHOP_DRAFT_LS_KEY), s = raw ? JSON.parse(raw) : null;
      if (!s || typeof s !== 'object' || s.on !== true) return sdState;
      sdState = Object.assign(_sdBlank(), s, { on:true });
    } catch(e){}
    return sdState;
  }

  /* ---------- IndexedDB 'brew-and-cup-files' v1 ('handles': 'history-file' & 'everything-file') ---------- */
  const _canPickFiles = () => typeof window !== 'undefined' && typeof window.showSaveFilePicker === 'function' && typeof window.showOpenFilePicker === 'function' && window.isSecureContext !== false;
  function _fhRunImpl(mode, fn){
    return new Promise((res, rej) => {
      if (typeof indexedDB === 'undefined' || !indexedDB || typeof indexedDB.open !== 'function'){ rej(new Error('no-idb')); return; }
      let rq; try { rq = indexedDB.open(PICK_DB, 1); } catch(e){ rej(e); return; }
      rq.onupgradeneeded = () => {
        try { if (!rq.result.objectStoreNames.contains(PICK_STORE)) rq.result.createObjectStore(PICK_STORE); } catch(e){}
      };
      rq.onerror = () => rej(rq.error);
      rq.onsuccess = () => {
        const db = rq.result;
        try {
          const tx = db.transaction(PICK_STORE, mode), r = fn(tx.objectStore(PICK_STORE));
          tx.oncomplete = () => { db.close(); res(r ? r.result : undefined); };
          tx.onerror = tx.onabort = () => { db.close(); rej(tx.error); };
        } catch(e){ db.close(); rej(e); }
      };
    });
  }
  async function _loadPickedFileImpl(){
    if (!_canPickFiles()) return null;
    try {
      const hd = await _fhRunImpl('readonly', st => st.get(PICK_HISTORY_KEY));
      if (hd && typeof hd.getFile === 'function' && typeof hd.name === 'string'){
        pickedFile = { handle:hd, name:hd.name.slice(0, 120) };
        return pickedFile;
      }
    } catch(e){}
    return null;
  }
  async function _rememberPicked(handle){
    pickedFile = { handle, name:String(handle.name || 'your file').slice(0, 120) };
    try { await _fhRunImpl('readwrite', st => st.put(handle, PICK_HISTORY_KEY)); } catch(e){}
    return pickedFile;
  }
  async function _forgetPicked(){
    pickedFile = null;
    try { await _fhRunImpl('readwrite', st => st.delete(PICK_HISTORY_KEY)); } catch(e){}
  }
  async function _pickPermission(handle, ask){
    try {
      if (!handle || typeof handle.queryPermission !== 'function') return true;
      if ((await handle.queryPermission({ mode:'readwrite' })) === 'granted') return true;
      if (ask === false) return false;
      return (await handle.requestPermission({ mode:'readwrite' })) === 'granted';
    } catch(e){ return false; }
  }
  async function _pickOpen(){
    if (!_canPickFiles()) return null;
    try {
      const hs = await window.showOpenFilePicker({ types:PICK_CSV_TYPES, multiple:false });
      return hs && hs[0] ? hs[0] : null;
    } catch(e){ if (e && e.name === 'AbortError') return null; throw e; }
  }
  /* Live Chromium FileSystemFileHandle write with lastModified conflict & noDrop missing-ID guards */
  async function _pickWriteImpl(handle, text, mod, noDrop){
    if (!(await _pickPermission(handle, true))) throw { code:'denied' };
    if (mod != null){
      const f = await handle.getFile();
      if (f.lastModified !== mod) throw { code:'changed' };
    }
    if (noDrop){
      const disk = readExisting(await (await handle.getFile()).text());
      const mine = readExisting(text);
      if (!disk.error && !mine.error){
        const gone = Array.from(disk.ids).filter(id => !mine.ids.has(id)).length;
        if (gone) throw { code:'dropped', n:gone };
      }
    }
    const w = await handle.createWritable();
    try { await w.write(text); await w.close(); } catch(e){ try { await w.abort(); } catch(e2){} throw e; }
    return true;
  }
  async function _pickSaveImpl(optsOrAsNew){
    const isObj = optsOrAsNew && typeof optsOrAsNew === 'object';
    const asNew = isObj ? !!optsOrAsNew.asNew : !!optsOrAsNew;
    const csv = isObj && typeof optsOrAsNew.csv === 'string' ? optsOrAsNew.csv : (historyState ? historyState.text : '');
    if (!csv) return { ok:false, error:'No tasting history to save yet.' };
    if (!_canPickFiles()){
      _downloadText(csv, HISTORY_FILENAME, 'text/csv;charset=utf-8');
      _noteBackup();
      return { ok:true, via:'download', name:HISTORY_FILENAME };
    }
    try {
      let handle = null, mod = isObj ? optsOrAsNew.mod : null, noDrop = isObj ? (optsOrAsNew.mode !== 'export') : false;
      if (!asNew && pickedFile){ handle = pickedFile.handle; }
      else {
        try { handle = await window.showSaveFilePicker({ suggestedName:HISTORY_FILENAME, types:PICK_CSV_TYPES }); }
        catch(e){ if (e && e.name === 'AbortError') return { ok:false, aborted:true }; throw e; }
      }
      await _pickWriteImpl(handle, csv, mod, noDrop);
      await _rememberPicked(handle);
      histDirty = 0; _persistDirty();
      histEdited = 0; _persistEdited();
      histAdded = 0; _persistAdded();
      _noteBackup();
      return { ok:true, via:'handle', name:pickedFile.name };
    } catch(e){
      if (e && e.name === 'NotFoundError') await _forgetPicked();
      return { ok:false, code:e && e.code ? e.code : 'error', error:e && e.message ? e.message : 'Could not write to linked file.' };
    }
  }
  async function _autoSyncHistoryHandle(){
    if (!pickedFile || !pickedFile.handle || !historyState || !historyState.text) return;
    try {
      if (!(await _pickPermission(pickedFile.handle, false))) return;
      await _pickWriteImpl(pickedFile.handle, historyState.text, null, histDirty === 0);
      histAdded = 0; _persistAdded();
      _noteBackup();
    } catch(e){}
  }

  async function _loadEveryFileImpl(){
    if (!_canPickFiles()) return null;
    try {
      const hd = await _fhRunImpl('readonly', st => st.get(PICK_EVERY_KEY));
      if (hd && typeof hd.getFile === 'function' && typeof hd.name === 'string'){
        everyFile = { handle:hd, name:hd.name.slice(0, 120) };
        return everyFile;
      }
    } catch(e){}
    return null;
  }
  async function _rememberEvery(handle){
    everyFile = { handle, name:String(handle.name || 'your backup').slice(0, 120) };
    try { await _fhRunImpl('readwrite', st => st.put(handle, PICK_EVERY_KEY)); } catch(e){}
    return everyFile;
  }
  async function _forgetEveryFile(){
    everyFile = null;
    try { await _fhRunImpl('readwrite', st => st.delete(PICK_EVERY_KEY)); } catch(e){}
  }
  function _forgetEvery(){
    everyState = { msg:'', saved:null };
    try { localStorage.removeItem(EVERY_LS_KEY); } catch(e){}
    _forgetEveryFile();
  }

  /* ---------- Save Everything Multi-Part Registry (history, shops, prices, prefs, academy) ---------- */
  function _everyRegisterImpl(p){
    if (p && p.id && !EVERY_PARTS.some(x => x.id === p.id)) EVERY_PARTS.push(p);
  }
  function _everyPart(id){ return EVERY_PARTS.find(p => p.id === id) || null; }
  function _utf8Bytes(s){ return typeof _btUtf8Encode === 'function' ? _btUtf8Encode(s) : new TextEncoder().encode(String(s == null ? '' : s)); }
  function _everyStamp(text){ return bkCrc32(_utf8Bytes(String(text || '').replace(/^\uFEFF/, ''))); }
  function _everyGatherImpl(){ return EVERY_PARTS.filter(p => p.has()).map(p => ({ id:p.id, text:p.text() })); }
  function _everyChanged(){
    const now = {}, was = everyState.saved && everyState.saved.crcs ? everyState.saved.crcs : {};
    _everyGatherImpl().forEach(p => { now[p.id] = _everyStamp(p.text); });
    return EVERY_PARTS.filter(p => (now[p.id] || '') !== (was[p.id] || ''));
  }
  function _everyMarkSaved(parts, name, at){
    const crcs = {}; parts.forEach(p => { crcs[p.id] = _everyStamp(p.text); });
    everyState.saved = { at:at || Date.now(), name:String(name || '').slice(0, 120), crcs };
    try { localStorage.setItem(EVERY_LS_KEY, JSON.stringify(everyState.saved)); } catch(e){}
    parts.forEach(p => { const d = _everyPart(p.id); if (d && d.markSaved) d.markSaved(); });
    if (parts.some(p => p.id === 'history')) _noteBackup();
  }
  function _everySavedLine(){
    if (!EVERY_PARTS.some(p => p.has())) return 'Nothing to save yet.';
    const s = everyState.saved, ch = _everyChanged();
    if (!s) return 'Not saved yet.';
    return 'Last saved ' + backupAge(s.at, new Date()) + (s.name ? ' to ' + s.name : '') + (ch.length ? '. Changed since: ' + ch.map(p => p.name.toLowerCase()).join(', ') : '') + '.';
  }

  _everyRegisterImpl({
    id:'history', name:'Tasting history',
    has:() => !!(historyState && historyState.ex && historyState.ex.count),
    text:() => historyState.text,
    look:t => { const ex = readExisting(t); return ex.error ? { error:ex.error } : { line:ex.count + (ex.count === 1 ? ' tasting' : ' tastings') }; },
    rule:'Replaces or merges the tasting history in this browser without losing unsaved local cups.',
    keysIn:t => { const ex = readExisting(t); return ex.error ? null : Array.from(ex.ids); },
    keysHere:() => historyState && historyState.ex ? Array.from(historyState.ex.ids) : [],
    allow:() => histDirty + histEdited,
    unsaved:() => histAdded + histDirty + histEdited,
    markSaved:() => { histDirty = 0; _persistDirty(); histEdited = 0; editUndo = null; _persistEdited(); histAdded = 0; _persistAdded(); },
    apply:(t, opts) => {
      const ex = readExisting(t);
      if (ex.error) return '';
      const keepLocal = !opts || opts.keepBrowserOnly !== false;
      const missingLocal = keepLocal ? browserOnlyMissingFrom(ex) : [];
      if (missingLocal.length){
        const merged = addRowsToExisting(ex, missingLocal);
        const csvMerged = toCSV([merged.header].concat(merged.rows));
        _setHistoryImpl(merged, csvMerged);
      } else {
        _setHistoryImpl(ex, t);
      }
      const st = setupRead(historyState.ex.header, historyState.ex.rows, _setupCtx());
      if (st) applyFullPrefs(st);
      return 'Tasting history: ' + historyState.ex.count + (historyState.ex.count === 1 ? ' tasting' : ' tastings') + ' loaded.';
    }
  });
  _everyRegisterImpl({
    id:'shops', name:'Coffee shops',
    has:() => !_shEmpty(),
    text:() => shopCsv(shState.store),
    norm:t => { const r = shopRead(t); return r.error ? t : shopCsv(r.store); },
    look:t => { const r = shopRead(t); if (r.error) return { error:r.error }; const d = r.store.drinks.length, n = shopList(r.store).length; return { line:d ? d + (d === 1 ? ' drink' : ' drinks') + ' from ' + n + (n === 1 ? ' shop' : ' shops') : 'a home town' }; },
    rule:'Adds what is new. Nothing here is lost.',
    keysIn:t => { const r = shopRead(t); return r.error ? null : r.store.drinks.map(drinkKey); },
    keysHere:() => shState.store.drinks.map(drinkKey),
    allow:() => shState.changes,
    unsaved:() => shState.changes,
    markSaved:() => { shState.changes = 0; _persistShops(); },
    apply:t => { _shLoadText(t); return 'Coffee shops: ' + shState.msg; }
  });
  _everyRegisterImpl({
    id:'prices', name:'Coffee prices',
    has:() => prState.list.length > 0,
    text:() => priceCsv(prState.list),
    look:t => { const r = priceRead(t); return r.error ? { error:r.error } : { line:r.list.length + (r.list.length === 1 ? ' purchase' : ' purchases') }; },
    rule:'Adds what is new. Nothing here is lost.',
    keysIn:t => { const r = priceRead(t); return r.error ? null : r.list.map(priceKey); },
    keysHere:() => prState.list.map(priceKey),
    allow:() => prState.changes,
    unsaved:() => prState.changes,
    markSaved:() => { prState.changes = 0; _persistPrices(); },
    apply:t => { _prLoadText(t); return 'Coffee prices: ' + prState.msg; }
  });
  _everyRegisterImpl({
    id:'prefs', name:'Preferences & calibrations',
    has:() => !prefsIsDefault(_getApp().prefs),
    text:() => JSON.stringify({ format:'beantelligence-prefs', v:1, prefs:cleanFullPrefs(_getApp().prefs) }),
    look:t => {
      try {
        const o = JSON.parse(t);
        if (!o || o.format !== 'beantelligence-prefs' || !o.prefs) return { error:'Not a preferences part.' };
        return { line:'units, theme, lens, gear, grinder & caffeine calibrations' };
      } catch(e){ return { error:'Not a preferences part.' }; }
    },
    rule:'Restores your units, theme, Science Lens, gear defaults, grinder calibrations and caffeine schedule.',
    keysIn:() => [], keysHere:() => [], allow:() => 0, unsaved:() => 0, markSaved:() => {},
    apply:t => {
      try { const o = JSON.parse(t); if (o && o.prefs){ applyFullPrefs(o.prefs); _triggerScheduleDraft(); return 'Preferences & calibrations restored.'; } } catch(e){}
      return '';
    }
  });
  _everyRegisterImpl({
    id:'academy', name:'Academy progress',
    has:() => {
      const ac = readAcademyState();
      const hasGh = Array.isArray(ac.palateGymHistory)
        ? ac.palateGymHistory.length > 0
        : !!(ac.palateGymHistory && typeof ac.palateGymHistory === 'object' && Object.keys(ac.palateGymHistory).some(k => !!ac.palateGymHistory[k]));
      return !!(ac.bookmarkedIds.length || ac.completedModuleIds.length || (ac.completedLessonIds && ac.completedLessonIds.length) || (ac.quizPassedIds && ac.quizPassedIds.length) || hasGh);
    },
    text:() => JSON.stringify(Object.assign({ format:'beantelligence-academy', v:1 }, readAcademyState())),
    look:t => {
      try {
        const o = JSON.parse(t);
        if (!o || o.format !== 'beantelligence-academy') return { error:'Not an academy part.' };
        const b = Array.isArray(o.bookmarkedIds) ? o.bookmarkedIds.length : 0;
        const c = (Array.isArray(o.completedModuleIds) ? o.completedModuleIds.length : 0) + (Array.isArray(o.completedLessonIds) ? o.completedLessonIds.length : 0);
        const g = Array.isArray(o.palateGymHistory) ? o.palateGymHistory.length : (o.palateGymHistory && typeof o.palateGymHistory === 'object' ? (o.palateGymHistory.triangleTrials || o.palateGymHistory.kitchenCalibRuns || 0) : 0);
        return { line:c + ' completed, ' + b + ' bookmarked' + (g ? ', ' + g + ' gym trials' : '') };
      } catch(e){ return { error:'Not an academy part.' }; }
    },
    rule:'Merges your completed Academy modules, lessons, quizzes, bookmarked cards, and Palate Gym calibration trials.',
    keysIn:() => [], keysHere:() => [], allow:() => 0, unsaved:() => 0, markSaved:() => {},
    apply:t => {
      try {
        const o = JSON.parse(t), cur = readAcademyState();
        const mergeStrs = (a, b) => Array.from(new Set((Array.isArray(a) ? a : []).concat(Array.isArray(b) ? b.filter(x => typeof x === 'string') : [])));
        const bm = mergeStrs(cur.bookmarkedIds, o.bookmarkedIds);
        const cm = mergeStrs(cur.completedModuleIds, o.completedModuleIds);
        const cl = mergeStrs(cur.completedLessonIds, o.completedLessonIds);
        const qp = mergeStrs(cur.quizPassedIds, o.quizPassedIds);
        let gh = cur.palateGymHistory;
        if (Array.isArray(o.palateGymHistory)){
          gh = (Array.isArray(cur.palateGymHistory) ? cur.palateGymHistory : []).concat(o.palateGymHistory).slice(-200);
        } else if (o.palateGymHistory && typeof o.palateGymHistory === 'object'){
          gh = Object.assign({}, (cur.palateGymHistory && typeof cur.palateGymHistory === 'object' && !Array.isArray(cur.palateGymHistory)) ? cur.palateGymHistory : {}, o.palateGymHistory);
        }
        writeAcademyState({ bookmarkedIds:bm, completedModuleIds:cm, completedLessonIds:cl, quizPassedIds:qp, palateGymHistory:gh });
        return 'Academy progress: ' + (cm.length + cl.length) + ' completed, ' + bm.length + ' bookmarked.';
      } catch(e){ return ''; }
    }
  });

  function _everyBuild(pk, kind, raw){
    const src = pk ? pk.parts : raw, ids = pk ? pk.order : Object.keys(raw), items = [], problems = [];
    ids.forEach(id => {
      const p = _everyPart(id), x = src[id];
      if (!p){ problems.push('A part called "' + id + '" comes from a newer version of the app, so it was left out.'); return; }
      if (!x.ok){ problems.push(p.name + ': this part is ' + (x.why === 'cut' ? 'cut off' : 'damaged (it failed its check)') + ', so it was left out.'); return; }
      const lk = p.look(x.text);
      if (lk.error){ problems.push(p.name + ': ' + lk.error + ' It was left out.'); return; }
      items.push({ id, name:p.name, text:x.text, line:lk.line, rule:p.rule });
    });
    return { kind:kind || 'everything', made:pk ? pk.made : '', app:pk ? pk.app : '', items, problems };
  }
  async function _everyClassify(text){
    let t = String(text == null ? '' : text).replace(/^\uFEFF/, '');
    if (/BEGIN (?:BEANTELLIGENCE|NEUROBREW) BACKUP/i.test(t)){
      const r = await readBackupCode(t);
      if (r.error) return { error:r.error };
      if (r.parts) return _everyBuild(r.parts, 'everything');
      t = r.csv;
    }
    const rawParts = bkpUnpack(t);
    if (rawParts) return _everyBuild(rawParts, 'everything');
    const jb = parseJsonBackup(t);
    if (jb){
      const built = _everyBuild(null, jb.kind === 'everything' ? 'everything' : 'file', jb.raw);
      built.made = jb.made || ''; built.app = jb.app || '';
      return built;
    }
    const shRes = shareRead(t);
    if (shRes && shRes.ok){
      return { kind:'share', share:shRes, items:[{ id:'share', name:'Shared Brew Passport / Recipe', text:t, line:(shRes.coffee && shRes.coffee.name ? shRes.coffee.name : 'Shared recipe'), rule:'Loads bean & brew settings into Brew Studio.' }], problems:[] };
    }
    const hit = EVERY_PARTS.find(p => !p.look(t).error);
    if (!hit) return { error:'That does not look like a BeanTelligence file. Choose a backup (.txt, .btbackup, .json, or .csv) or paste a backup/share code.' };
    return _everyBuild(null, 'file', { [hit.id]:{ ok:true, text:t } });
  }
  function _applyClassifiedBackup(classified, opts){
    if (!classified || classified.error) return { ok:false, error:(classified && classified.error) || 'Invalid backup.' };
    if (classified.kind === 'share' && classified.share){
      const sh = classified.share, a = _getApp();
      if (sh.coffee) a.coffee = Object.assign(a.coffee || {}, sh.coffee, { answered:'yes' });
      if (sh.brew) a.brew = Object.assign(a.brew || {}, sh.brew);
      if (sh.adjust) a.adjust = Object.assign(a.adjust || {}, sh.adjust);
      _triggerScheduleDraft();
      _triggerRender();
      return { ok:true, notes:['Loaded shared recipe into Brew Studio.'] };
    }
    const notes = [];
    const items = classified.items || [];
    /* Apply history first, then remaining parts */
    const histItem = items.find(x => x.id === 'history');
    if (histItem){
      const hp = _everyPart('history');
      const line = hp.apply(histItem.text, opts);
      if (line) notes.push(line);
    }
    items.filter(x => x.id !== 'history').forEach(x => {
      const p = _everyPart(x.id);
      if (p && p.apply){
        const line = p.apply(x.text, opts);
        if (line) notes.push(line);
      }
    });
    _triggerScheduleDraft();
    _triggerRender();
    return { ok:true, notes, problems:classified.problems || [] };
  }

  function _downloadText(text, filename, mime){
    if (_g.BTPlatform && _g.BTPlatform.files && typeof _g.BTPlatform.files.downloadText === 'function'){
      return _g.BTPlatform.files.downloadText(filename, text, mime || 'text/plain;charset=utf-8');
    }
    if (typeof document === 'undefined') return false;
    const blob = new Blob([text], { type:mime || 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.style.display = 'none';
    document.body.appendChild(a); a.click();
    setTimeout(() => { try { a.remove(); URL.revokeObjectURL(url); } catch(e){} }, 1200);
    return true;
  }

  async function _everyGuard(handle){
    let text = '';
    try { const f = await handle.getFile(); if (!f.size) return; text = await f.text(); } catch(e){ return; }
    if (!/BEGIN (?:BEANTELLIGENCE|NEUROBREW) BACKUP/i.test(text)) return;
    const r = await readBackupCode(text); if (r.error) return;
    const theirs = r.parts ? r.parts.parts : (r.csv ? { history:{ ok:true, text:r.csv } } : {});
    let n = 0; const what = [];
    EVERY_PARTS.forEach(p => {
      const x = theirs[p.id]; if (!x || !x.ok || !p.keysIn) return;
      const keys = p.keysIn(x.text); if (!keys) return;
      const mine = new Set(p.keysHere ? p.keysHere() : []), gone = keys.filter(k => !mine.has(k)).length - (p.allow ? p.allow() : 0);
      if (gone > 0){ n += gone; what.push(gone + ' in ' + p.name.toLowerCase()); }
    });
    if (n > 0) throw { code:'dropped', n, what:what.join(', ') };
  }

  async function _makeEverythingBackup(){
    const parts = _everyGatherImpl();
    if (!parts.length) return { ok:false, empty:true, error:'Nothing to save yet. Log a brew, bag, or cafe drink first.' };
    const appVer = (typeof releaseLatest === 'function' && releaseLatest() && releaseLatest().version) ? releaseLatest().version : '6.0.0';
    const info = { made:new Date().toISOString().replace(/\.\d+Z$/, 'Z'), app:appVer };
    const made = await makeEverythingCode(parts, info);
    const day = _todayIso();
    return { ok:true, text:made.text, code:made.code, bytes:made.bytes, packed:made.packed, mode:made.mode, filename:'BeanTelligence Backup - Everything ' + day + '.txt', parts };
  }

  async function _everySaveImpl(asNew){
    const bundle = await _makeEverythingBackup();
    if (!bundle.ok) return { ok:false, empty:!!bundle.empty, msg:bundle.error };
    try {
      let handle = null, over = false, name = '';
      if (_canPickFiles()){
        if (!asNew && everyFile){
          handle = everyFile.handle; over = true;
          if (!(await _pickPermission(handle, true))) throw { code:'denied' };
        } else {
          try { handle = await window.showSaveFilePicker({ suggestedName:EVERY_FILENAME, types:EVERY_SAVE_TYPES }); }
          catch(e){ if (e && e.name === 'AbortError') return { quiet:true }; throw e; }
        }
        await _everyGuard(handle);
      }
      if (handle){
        const w = await handle.createWritable();
        try { await w.write(bundle.text); await w.close(); } catch(e){ try { await w.abort(); } catch(e2){} throw e; }
        await _rememberEvery(handle);
        name = everyFile.name;
      } else {
        name = bundle.filename;
        _downloadText(bundle.text, name, 'text/plain;charset=utf-8');
      }
      _everyMarkSaved(bundle.parts, name);
      return { ok:true, name, over, msg:handle ? ('Saved to ' + name + '.') : ('Downloaded ' + name + '.') };
    } catch(e){
      if (e && e.name === 'NotFoundError') await _forgetEveryFile();
      return { ok:false, code:e && e.code ? e.code : 'error', msg:(e && e.code === 'dropped') ? ('Backup file on disk has ' + e.n + ' newer items (' + e.what + '). Load it first or save under a new name.') : 'Could not write backup file.' };
    }
  }

  async function _exportJsonBackup(){
    const parts = _everyGatherImpl();
    if (!parts.length) return { ok:false, error:'Nothing to export yet.' };
    const appVer = (typeof releaseLatest === 'function' && releaseLatest() && releaseLatest().version) ? releaseLatest().version : '6.0.0';
    const payload = {
      format:'beantelligence-backup',
      version:1,
      madeAt:new Date().toISOString(),
      appVersion:appVer,
      historyCsv:historyState && historyState.text ? historyState.text : '',
      shopsCsv:!_shEmpty() ? shopCsv(shState.store) : '',
      pricesCsv:prState.list.length ? priceCsv(prState.list) : '',
      prefs:cleanFullPrefs(_getApp().prefs),
      academy:readAcademyState()
    };
    const text = JSON.stringify(payload, null, 2);
    const name = 'BeanTelligence Backup ' + _todayIso() + '.json';
    _downloadText(text, name, 'application/json;charset=utf-8');
    _noteBackup();
    return { ok:true, filename:name, text };
  }

  async function _shareBackupToPhone(){
    const bundle = await _makeEverythingBackup();
    if (!bundle.ok) return bundle;
    if (_g.BTPlatform && _g.BTPlatform.share && typeof _g.BTPlatform.share.shareFile === 'function'){
      try {
        const res = await _g.BTPlatform.share.shareFile({ filename:bundle.filename, text:bundle.text, mime:'text/plain', title:'BeanTelligence Save Everything Backup' });
        if (res && res.ok){ _everyMarkSaved(bundle.parts, bundle.filename); return { ok:true, via:'share', filename:bundle.filename }; }
      } catch(e){}
    }
    if (typeof navigator !== 'undefined' && navigator.share && typeof File !== 'undefined'){
      try {
        const file = new File([bundle.text], bundle.filename, { type:'text/plain' });
        if (!navigator.canShare || navigator.canShare({ files:[file] })){
          await navigator.share({ title:'BeanTelligence Backup', text:'BeanTelligence Save Everything Backup', files:[file] });
          _everyMarkSaved(bundle.parts, bundle.filename);
          return { ok:true, via:'web-share', filename:bundle.filename };
        }
      } catch(e){ if (e && e.name === 'AbortError') return { ok:false, aborted:true }; }
    }
    _downloadText(bundle.text, bundle.filename, 'text/plain;charset=utf-8');
    _everyMarkSaved(bundle.parts, bundle.filename);
    return { ok:true, via:'download', filename:bundle.filename };
  }

  /* ---------- Non-Destructive Legacy Alias Read-Fallback ---------- */
  function _readStorageWithFallbackImpl(){
    const recovered = [];
    const tryCopy = (primary, aliases, validate) => {
      try {
        const cur = localStorage.getItem(primary);
        if (cur != null && cur !== '') return;
        for (let i = 0; i < aliases.length; i++){
          const cand = localStorage.getItem(aliases[i]);
          if (cand == null || cand === '') continue;
          let ok = false; try { ok = !!validate(cand); } catch(e){ ok = false; }
          if (ok){
            localStorage.setItem(primary, cand);
            recovered.push({ from:aliases[i], to:primary });
            return;
          }
        }
      } catch(e){}
    };
    tryCopy(HISTORY_LS_KEY, ['neurobrew-history-v1', 'beantelligence-history-v1', 'neurobrew-cuppings-v1', 'cuppings-history-v1'], v => !readExisting(v).error);
    tryCopy(DRAFT_LS_KEY, ['neurobrew-draft-v1', 'beantelligence-draft-v1'], v => { const o = JSON.parse(v); return !!(o && typeof o === 'object' && o.app); });
    tryCopy(PRICES_LS_KEY, ['neurobrew-prices-v1', 'neurobrew-costs-v1', 'beantelligence-prices-v1'], v => !priceRead(v).error);
    tryCopy(SHOPS_LS_KEY, ['neurobrew-shops-v1', 'beantelligence-shops-v1'], v => !shopRead(v).error);
    return { recovered:recovered.length > 0, items:recovered };
  }

  /* ---------- IndexedDB 'brew-and-cup-vault' v1 ('snapshots': 'pre-v6-raw', 'pre-v5-raw', 'latest-manual') ---------- */
  const _idbVaultCache = {};
  function _vaultPut(key, val){
    _idbVaultCache[key] = val;
    return new Promise(resolve => {
      let settled = false, dbRef = null;
      const done = ok => {
        if (settled) return;
        settled = true;
        clearTimeout(tm);
        if (dbRef){ try { dbRef.close(); } catch(e){} dbRef = null; }
        resolve(ok);
      };
      const tm = setTimeout(() => done(false), 500);
      try {
        if (typeof indexedDB === 'undefined' || !indexedDB || typeof indexedDB.open !== 'function'){ done(false); return; }
        const rq = indexedDB.open(SNAPSHOT_VAULT_DB, 1);
        rq.onupgradeneeded = () => {
          try { if (!rq.result.objectStoreNames.contains(SNAPSHOT_VAULT_STORE)) rq.result.createObjectStore(SNAPSHOT_VAULT_STORE); } catch(e){}
        };
        rq.onerror = () => done(false);
        rq.onblocked = () => done(false);
        rq.onsuccess = () => {
          if (settled){ try { rq.result.close(); } catch(e){} return; }
          dbRef = rq.result;
          try {
            const tx = dbRef.transaction(SNAPSHOT_VAULT_STORE, 'readwrite');
            tx.objectStore(SNAPSHOT_VAULT_STORE).put(val, key);
            tx.oncomplete = () => done(true);
            tx.onerror = tx.onabort = () => done(false);
          } catch(e){ done(false); }
        };
      } catch(e){ done(false); }
    });
  }
  function _vaultGet(key){
    return new Promise(resolve => {
      let settled = false, dbRef = null;
      const fallback = () => Object.prototype.hasOwnProperty.call(_idbVaultCache, key) ? _idbVaultCache[key] : null;
      const done = val => {
        if (settled) return;
        settled = true;
        clearTimeout(tm);
        if (dbRef){ try { dbRef.close(); } catch(e){} dbRef = null; }
        resolve(val);
      };
      const tm = setTimeout(() => done(fallback()), 500);
      try {
        if (typeof indexedDB === 'undefined' || !indexedDB || typeof indexedDB.open !== 'function'){ done(fallback()); return; }
        const rq = indexedDB.open(SNAPSHOT_VAULT_DB, 1);
        rq.onupgradeneeded = () => {
          try { if (!rq.result.objectStoreNames.contains(SNAPSHOT_VAULT_STORE)) rq.result.createObjectStore(SNAPSHOT_VAULT_STORE); } catch(e){}
        };
        rq.onerror = () => done(fallback());
        rq.onblocked = () => done(fallback());
        rq.onsuccess = () => {
          if (settled){ try { rq.result.close(); } catch(e){} return; }
          dbRef = rq.result;
          try {
            const tx = dbRef.transaction(SNAPSHOT_VAULT_STORE, 'readonly');
            const g = tx.objectStore(SNAPSHOT_VAULT_STORE).get(key);
            tx.oncomplete = () => done((g && g.result) ? g.result : fallback());
            tx.onerror = tx.onabort = () => done(fallback());
          } catch(e){ done(fallback()); }
        };
      } catch(e){ done(fallback()); }
    });
  }

  /* Race-free Pre-v6 Safety Snapshot (writes 'pre-v6-raw' with CRC32 while preserving 'pre-v5-raw' untouched) */
  function _ensurePreMigrationSnapshotImpl(opts){
    opts = opts || {};
    const targetSchema = String(opts.targetSchema || '6.0');
    const vaultKey = opts.forceManual ? 'latest-manual' : (targetSchema === '5.0' ? 'pre-v5-raw' : 'pre-v6-raw');
    try {
      if (!opts.forceManual){
        const rawMeta = localStorage.getItem(SNAPSHOT_META_LS_KEY);
        if (rawMeta){
          let meta = null; try { meta = JSON.parse(rawMeta); } catch(e){ meta = null; }
          if (meta && meta.currentSchema === targetSchema){
            const hasLs = !!localStorage.getItem(SNAPSHOT_DATA_LS_KEY);
            if ((meta.empty === true && !opts.forceIfEmpty) || hasLs || meta.tier === 'idb-vault'){
              return { fastPath:true, tier:meta.tier || 'ls-raw', vaultKey, meta };
            }
          }
        }
      }
      const collected = {}, crcs = {};
      PROTECTED_LS_KEYS.forEach(k => {
        let v = null; try { v = localStorage.getItem(k); } catch(e){ v = null; }
        if (v !== null){
          collected[k] = v;
          crcs[k] = bkCrc32(_utf8Bytes(v));
        }
      });
      const keyList = Object.keys(collected);
      if (!keyList.length){
        const emptyMeta = { currentSchema:targetSchema, snapshottedFrom:'5.2', vaultKey, empty:true, snapshotAt:Date.now(), tier:'empty', crcs:{} };
        try { localStorage.setItem(SNAPSHOT_META_LS_KEY, JSON.stringify(emptyMeta)); } catch(e){}
        return { tier:'empty', vaultKey, meta:emptyMeta };
      }
      const createdAt = new Date().toISOString();
      const payloadObj = { v:1, schema:targetSchema, vaultKey, createdAt, keys:collected, crcs };
      const envelope = JSON.stringify(payloadObj);

      /* Tier-1 Synchronous Path (<= 256 KB) + background IDB 'pre-v6-raw' mirror (leaving 'pre-v5-raw' intact!) */
      if (envelope.length <= SNAPSHOT_SYNC_LIMIT && !opts.forceAsync){
        let syncOk = false;
        try {
          localStorage.setItem(SNAPSHOT_DATA_LS_KEY, envelope);
          syncOk = (localStorage.getItem(SNAPSHOT_DATA_LS_KEY) === envelope);
        } catch(e){ syncOk = false; }
        if (syncOk){
          const meta = { currentSchema:targetSchema, snapshottedFrom:'5.2', vaultKey, snapshotAt:Date.now(), tier:'ls-raw', keyCount:keyList.length, crcs };
          try { localStorage.setItem(SNAPSHOT_META_LS_KEY, JSON.stringify(meta)); } catch(e){}
          try {
            const vp = _vaultPut(vaultKey, payloadObj);
            if (vp && typeof vp.catch === 'function') vp.catch(() => {});
          } catch(e){}
          return { tier:'ls-raw', vaultKey, meta };
        }
      }

      /* Tier-2 Synchronous GZIP Fallback (> 256 KB when makeBackupCodeSync is available) */
      if (typeof makeBackupCodeSync === 'function' && !opts.forceAsync){
        try {
          const bkSync = makeBackupCodeSync(envelope);
          if (bkSync && bkSync.code){
            const gzEnvSync = JSON.stringify({ v:1, schema:targetSchema, vaultKey, createdAt, compressed:true, code:bkSync.code, crcs });
            localStorage.setItem(SNAPSHOT_DATA_LS_KEY, gzEnvSync);
            if (localStorage.getItem(SNAPSHOT_DATA_LS_KEY) === gzEnvSync){
              const meta = { currentSchema:targetSchema, snapshottedFrom:'5.2', vaultKey, snapshotAt:Date.now(), tier:'ls-nb1z', keyCount:keyList.length, crcs };
              try { localStorage.setItem(SNAPSHOT_META_LS_KEY, JSON.stringify(meta)); } catch(e){}
              try { const vp = _vaultPut(vaultKey, payloadObj); if (vp && typeof vp.catch === 'function') vp.catch(() => {}); } catch(e){}
              return { tier:'ls-nb1z', vaultKey, meta };
            }
          }
        } catch(e){}
      }

      /* Tier-3 Asynchronous Fallback (> 256 KB) */
      if (!opts.forceManual){ try { localStorage.removeItem(SNAPSHOT_META_LS_KEY); } catch(e){} }
      const stampVerifiedMeta = tier => {
        const m = { currentSchema:targetSchema, snapshottedFrom:'5.2', vaultKey, snapshotAt:Date.now(), tier, keyCount:keyList.length, crcs };
        try { localStorage.setItem(SNAPSHOT_META_LS_KEY, JSON.stringify(m)); } catch(e){}
        return m;
      };
      let stampedMeta = null;
      const gzTask = Promise.resolve().then(() => makeBackupCode(envelope)).then(bk => {
        if (!bk || !bk.code) return '';
        const gzEnv = JSON.stringify({ v:1, schema:targetSchema, vaultKey, createdAt, compressed:true, code:bk.code, crcs });
        try {
          localStorage.setItem(SNAPSHOT_DATA_LS_KEY, gzEnv);
          if (localStorage.getItem(SNAPSHOT_DATA_LS_KEY) === gzEnv){
            stampedMeta = stampVerifiedMeta('ls-nb1z');
            return 'ls-nb1z';
          }
        } catch(e){}
        return '';
      }).catch(() => '');
      const idbTask = _vaultPut(vaultKey, payloadObj).then(ok => {
        if (ok && !stampedMeta) stampedMeta = stampVerifiedMeta('idb-vault');
        return ok ? 'idb-vault' : '';
      }).catch(() => '');
      const pending = Promise.all([gzTask, idbTask]).then(res => {
        const tier = res[0] || res[1] || '';
        if (!tier) return { tier:'failed', vaultKey, meta:null };
        const meta = stampedMeta || stampVerifiedMeta(tier);
        return { tier, vaultKey, meta };
      }).catch(() => ({ tier:'failed', vaultKey, meta:null }));
      _ensurePreMigrationSnapshotImpl.lastAsync = pending;
      return { tier:'pending', vaultKey, pending };
    } catch(e){
      return { tier:'failed', vaultKey, meta:null, error:String(e && e.message ? e.message : e) };
    }
  }

  function getSafetySnapshotStatus(){
    try {
      const rawMeta = localStorage.getItem(SNAPSHOT_META_LS_KEY);
      const rawData = localStorage.getItem(SNAPSHOT_DATA_LS_KEY);
      let meta = null; try { meta = rawMeta ? JSON.parse(rawMeta) : null; } catch(e){ meta = null; }
      if (meta && !meta.empty && (rawData || meta.tier === 'idb-vault')){
        const kc = meta.keyCount || (meta.crcs ? Object.keys(meta.crcs).length : 0);
        return { available:true, tier:meta.tier || 'ls-raw', vaultKey:meta.vaultKey || 'pre-v6-raw', snapshotAt:meta.snapshotAt || 0, keyCount:kc, crcs:meta.crcs || {} };
      }
      if (rawData){
        const o = JSON.parse(rawData);
        if (o && (o.keys || o.compressed)){
          const kc = o.crcs ? Object.keys(o.crcs).length : (o.keys ? Object.keys(o.keys).length : 0);
          return { available:kc > 0, tier:o.compressed ? 'ls-nb1z' : 'ls-raw', vaultKey:o.vaultKey || 'pre-v6-raw', snapshotAt:0, keyCount:kc, crcs:o.crcs || {} };
        }
      }
    } catch(e){}
    return { available:false, tier:'none', vaultKey:'pre-v6-raw', snapshotAt:0, keyCount:0, crcs:{} };
  }

  async function listSafetySnapshots(){
    const out = [];
    const keysToCheck = ['pre-v6-raw', 'pre-v5-raw', 'latest-manual', 'rolling-auto'];
    for (let i = 0; i < keysToCheck.length; i++){
      const k = keysToCheck[i];
      const v = await _vaultGet(k);
      if (v && v.keys && typeof v.keys === 'object'){
        out.push({ key:k, createdAt:v.createdAt || '', keyCount:Object.keys(v.keys).length, schema:v.schema || '' });
      }
    }
    if (!out.length){
      const st = getSafetySnapshotStatus();
      if (st.available) out.push({ key:st.vaultKey || 'pre-v6-raw', createdAt:'', keyCount:st.keyCount, schema:'6.0' });
    }
    return out;
  }

  function readSafetySnapshotSync(requestedKey){
    if (requestedKey && Object.prototype.hasOwnProperty.call(_idbVaultCache, requestedKey)){
      const vc = _idbVaultCache[requestedKey];
      if (vc && vc.keys && typeof vc.keys === 'object') return vc;
    }
    try {
      const rawData = localStorage.getItem(SNAPSHOT_DATA_LS_KEY);
      if (rawData && (!requestedKey || requestedKey === 'pre-v6-raw' || requestedKey === 'latest-manual')){
        const o = JSON.parse(rawData);
        if (o && o.compressed && o.code && typeof readBackupCodeSync === 'function'){
          const r = readBackupCodeSync(o.code);
          if (!r.error && r.csv){
            const unpacked = JSON.parse(r.csv);
            if (unpacked && unpacked.keys) return unpacked;
          }
        } else if (o && o.keys && typeof o.keys === 'object'){
          return o;
        }
      }
    } catch(e){}
    const fb = _idbVaultCache['pre-v6-raw'] || _idbVaultCache['pre-v5-raw'] || _idbVaultCache['latest-manual'];
    return (fb && fb.keys && typeof fb.keys === 'object') ? fb : null;
  }

  async function readSafetySnapshot(requestedKey){
    if (requestedKey){
      const v = await _vaultGet(requestedKey);
      if (v && v.keys && typeof v.keys === 'object') return v;
    }
    const syncHit = readSafetySnapshotSync(requestedKey);
    if (syncHit) return syncHit;
    try {
      const rawData = localStorage.getItem(SNAPSHOT_DATA_LS_KEY);
      if (rawData && (!requestedKey || requestedKey === 'pre-v6-raw' || requestedKey === 'latest-manual')){
        const o = JSON.parse(rawData);
        if (o && o.compressed && o.code){
          const r = await readBackupCode(o.code);
          if (!r.error && r.csv){
            const unpacked = JSON.parse(r.csv);
            if (unpacked && unpacked.keys) return unpacked;
          }
        }
      }
    } catch(e){}
    const fromVault = await _vaultGet('pre-v6-raw') || await _vaultGet('pre-v5-raw') || await _vaultGet('latest-manual');
    if (fromVault && fromVault.keys && typeof fromVault.keys === 'object') return fromVault;
    return null;
  }

  async function downloadSafetySnapshot(requestedKey){
    const snap = await readSafetySnapshot(requestedKey);
    if (!snap || !snap.keys) return { ok:false, error:'No safety snapshot is stored in this browser yet.' };
    const filename = 'BeanTelligence Safety Snapshot ' + _todayIso() + '.json';
    _downloadText(JSON.stringify(snap, null, 2), filename, 'application/json;charset=utf-8');
    return { ok:true, filename };
  }

  function _applyVerifiedSafetySnapshot(snap, opts){
    if (!snap || !snap.keys || typeof snap.keys !== 'object') return { ok:false, error:'No safety snapshot found to restore.' };
    const crcs = snap.crcs || {};
    for (const k of Object.keys(snap.keys)){
      const raw = String(snap.keys[k]);
      if (crcs[k] && bkCrc32(_utf8Bytes(raw)) !== crcs[k]){
        return { ok:false, error:'Snapshot checksum mismatch on ' + k + '; live data left untouched.' };
      }
    }
    try {
      PROTECTED_LS_KEYS.forEach(k => {
        if (Object.prototype.hasOwnProperty.call(snap.keys, k)) localStorage.setItem(k, String(snap.keys[k]));
        else localStorage.removeItem(k);
      });
    } catch(e){ return { ok:false, error:'Browser storage refused the restore write.' }; }
    historyState = null;
    _loadHistoryImpl();
    _loadPricesImpl();
    _loadShopsImpl();
    _loadShopDraftImpl();
    loadDraftIntoApp();
    if (!opts.noRender) _triggerRender();
    try {
      PROTECTED_LS_KEYS.forEach(k => {
        if (Object.prototype.hasOwnProperty.call(snap.keys, k)) localStorage.setItem(k, String(snap.keys[k]));
        else localStorage.removeItem(k);
      });
    } catch(e){}
    mirrorPrefsNow();
    return { ok:true, restoredKeys:Object.keys(snap.keys).length, vaultKey:snap.vaultKey || opts.snapshotKey || 'pre-v6-raw' };
  }

  function restoreSafetySnapshotSync(opts){
    if (typeof opts === 'string') opts = { snapshotKey:opts };
    opts = opts || {};
    const snap = readSafetySnapshotSync(opts.snapshotKey || '');
    return _applyVerifiedSafetySnapshot(snap, opts);
  }

  async function _restoreSafetySnapshotImpl(opts){
    if (typeof opts === 'string') opts = { snapshotKey:opts };
    opts = opts || {};
    const snap = await readSafetySnapshot(opts.snapshotKey || '');
    return _applyVerifiedSafetySnapshot(snap, opts);
  }

  /* ---------- Horizon-2 Capacitor Native Directory.Data Vault Mirror ---------- */
  let _nativeMirrorTimer = null;
  function _isCapacitorNative(){
    return !!(_g.Capacitor && typeof _g.Capacitor.isNativePlatform === 'function' && _g.Capacitor.isNativePlatform() && _g.Capacitor.Plugins && _g.Capacitor.Plugins.Filesystem);
  }
  async function mirrorNativeVault(){
    if (!_isCapacitorNative()) return { ok:false, reason:'web' };
    try {
      const fsPlugin = _g.Capacitor.Plugins.Filesystem;
      const parts = _everyGatherImpl();
      if (!parts.length) return { ok:true, empty:true };
      const packed = bkpPack(parts, { made:new Date().toISOString().replace(/\.\d+Z$/, 'Z'), app:'6.0.0' });
      await fsPlugin.writeFile({ path:'vault/live-vault.btbackup', data:packed, directory:'DATA', encoding:'utf8', recursive:true });
      await fsPlugin.writeFile({ path:'vault/daily-' + _todayIso() + '.btbackup', data:packed, directory:'DATA', encoding:'utf8', recursive:true });
      return { ok:true, bytes:packed.length };
    } catch(e){ return { ok:false, error:String(e && e.message ? e.message : e) }; }
  }
  function _scheduleNativeVaultMirror(){
    if (!_isCapacitorNative()) return;
    clearTimeout(_nativeMirrorTimer);
    _nativeMirrorTimer = setTimeout(() => { mirrorNativeVault().catch(() => {}); }, 400);
  }
  async function hydrateNativeVaultBeforeBoot(){
    if (!_isCapacitorNative()) return { ok:false, reason:'web' };
    try {
      const hasAny = PROTECTED_LS_KEYS.some(k => { const v = localStorage.getItem(k); return v != null && v !== ''; });
      if (hasAny) return { ok:true, skipped:true };
      const fsPlugin = _g.Capacitor.Plugins.Filesystem;
      const res = await fsPlugin.readFile({ path:'vault/live-vault.btbackup', directory:'DATA', encoding:'utf8' });
      if (res && typeof res.data === 'string' && res.data.trim()){
        const cl = await _everyClassify(res.data);
        if (!cl.error){ _applyClassifiedBackup(cl, { keepBrowserOnly:true }); return { ok:true, hydrated:true }; }
      }
    } catch(e){}
    return { ok:false };
  }

  /* ---------- Clear Everything (Wipes all 18 LS keys + IDB 'handles' cleanly) ---------- */
  function _clearEverythingImpl(){
    _forgetHistoryImpl();
    _forgetPicked();
    _forgetPricesImpl();
    _forgetShopsImpl();
    _forgetEvery();
    sdState = _sdBlank();
    _persistShopDraft();
    try {
      ALL_18_LS_KEYS.forEach(k => { localStorage.removeItem(k); });
      localStorage.removeItem(EXTRA_VAULT_COFFEES_KEY);
      localStorage.removeItem(EXTRA_AROMA_KIT_KEY);
    } catch(e){}
    _coffeesVaultCache.raw = null;
    _coffeesVaultCache.list = [];
    _vaultRev++;
    _unifiedIndexCache.key = '';
    _unifiedIndexCache.vaultRaw = '';
    if (_g.BTDiFluidApi && typeof _g.BTDiFluidApi.clearApiKey === 'function'){
      try { _g.BTDiFluidApi.clearApiKey(); } catch(e){}
    }
    if (typeof _g.__btOnClearEverything === 'function'){
      try { _g.__btOnClearEverything(); } catch(e){}
    }
    lastBackupMs = 0;
    const a = _getApp();
    a.attempt = 0;
    a.cupBrew = null;
    if (a.coffee){
      Object.keys(a.coffee).forEach(k => { a.coffee[k] = ''; });
      a.coffee.id = _newUid();
      a.coffee.species = 'arabica';
      a.coffee.agtron_scale = 'gourmet';
    }
    a.prefs = cleanFullPrefs(null);
    _resetCupState();
    _triggerRender();
    return { ok:true, clearedKeys:ALL_18_LS_KEYS.length };
  }

  /* ==========================================================================
     DIRECTIVE #132: BTMyCoffeesVault Deduplicator & Fresh-Bag Engine (<2 ms for 500+ rows)
     ========================================================================== */
  function _normKeyPart(s){
    const raw = unneutralize(String(s == null ? '' : s));
    let out = '';
    let prevSpace = true;
    for (let i = 0; i < raw.length; i++){
      let code = raw.charCodeAt(i);
      if (code >= 65 && code <= 90) code += 32;
      const isAlnum = (code >= 97 && code <= 122) || (code >= 48 && code <= 57) || code > 127;
      if (isAlnum){ out += String.fromCharCode(code); prevSpace = false; }
      else if (!prevSpace){ out += ' '; prevSpace = true; }
    }
    return prevSpace && out.length ? out.slice(0, -1) : out;
  }

  const _unifiedIndexCache = { key:'', vaultRaw:'', list:[] };
  const _coffeesVaultCache = { raw:null, list:[] };
  let _vaultRev = 0;

  const _isGoldenLockedRow = row => {
    const dl = row && String(row.dial_locked == null ? '' : row.dial_locked).trim().toLowerCase();
    return dl === 'yes' || dl === '1' || dl === 'true';
  };
  const _isUnknownToken = v => {
    if (typeof v !== 'string') return false;
    const len = v.length;
    if (!len || len > 12) return false;
    const low = v.trim().toLowerCase();
    return low === 'unknown' || low === 'not sure' || low === 'unsure' || low === 'n/a' || low === 'none';
  };
  const _hasMeaningfulVal = (v, allowZero) => {
    if (v === undefined || v === null || v === '') return false;
    if (typeof v === 'string') return v.trim() !== '' && !_isUnknownToken(v);
    if (typeof v === 'number') return isFinite(v) && (allowZero ? v >= 0 : v > 0);
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === 'object') return Object.keys(v).length > 0;
    return v === true;
  };
  const _cloneObj = obj => {
    if (!obj || typeof obj !== 'object') return null;
    try { return JSON.parse(JSON.stringify(obj)); } catch(e){ return Object.assign({}, obj); }
  };

  function _getCoffeesVaultListImpl(){
    try {
      const raw = localStorage.getItem(EXTRA_VAULT_COFFEES_KEY);
      if (!raw){
        _coffeesVaultCache.raw = null;
        _coffeesVaultCache.list = [];
        return [];
      }
      if (raw === _coffeesVaultCache.raw) return _coffeesVaultCache.list.slice();
      const arr = _parseCoffeesVaultArray(raw);
      _coffeesVaultCache.raw = raw;
      _coffeesVaultCache.list = arr;
      return arr.slice();
    } catch(e){ return []; }
  }

  function _saveCoffeesVaultListImpl(arr){
    const clean = Array.isArray(arr) ? arr.filter(x => x && typeof x === 'object' && !Array.isArray(x)).slice(0, 2000) : [];
    try {
      if (clean.length){
        const json = JSON.stringify(clean);
        localStorage.setItem(EXTRA_VAULT_COFFEES_KEY, json);
        _coffeesVaultCache.raw = json;
        _coffeesVaultCache.list = clean.slice();
      } else {
        localStorage.removeItem(EXTRA_VAULT_COFFEES_KEY);
        _coffeesVaultCache.raw = null;
        _coffeesVaultCache.list = [];
      }
    } catch(e){ storageFailed = true; }
    _vaultRev++;
    _unifiedIndexCache.key = '';
    _scheduleNativeVaultMirror();
    return clean;
  }

  function _buildBrewSnapshot(b){
    if (!b || typeof b !== 'object') return null;
    const out = {};
    const mKey = resolveMethod(b.method || b.brew_method) || cleanLine(b.method || b.brew_method || '');
    if (mKey) out.method = mKey;
    const strMap = [
      ['style', b.style || b.brew_style],
      ['filter', b.filter || b.brew_filter],
      ['filterId', b.filterId || b.filter_id],
      ['grind_setting', unneutralize(b.grind_setting || b.brew_grind_setting || '')],
      ['grinderKey', b.grinderKey || b.grinder_key],
      ['grinderName', unneutralize(b.grinderName || b.grinder_name || b.brew_grinder_name || '')],
      ['agitation', b.agitation || b.agit || b.brew_agitation],
      ['technique', b.technique || b.tech || b.brew_technique],
      ['waterType', b.waterType || b.water_type || b.brew_water_type],
      ['pourNotes', unneutralize(b.pourNotes || b.pour_notes || b.brew_pour_notes || '')]
    ];
    strMap.forEach(p => {
      const sv = typeof p[1] === 'string' ? p[1].trim() : '';
      if (sv) out[p[0]] = p[0] === 'pourNotes' ? sv : cleanLine(sv);
    });
    const posNum = (v, dec) => {
      const n = typeof v === 'number' ? v : parseFloat(v);
      if (!isFinite(n) || n <= 0) return null;
      const mul = dec ? Math.pow(10, dec) : 1;
      return Math.round(n * mul) / mul;
    };
    const dose = posNum(b.dose != null && b.dose !== '' ? b.dose : b.brew_dose_g, 2);
    const water = posNum(b.water != null && b.water !== '' ? b.water : b.brew_water_g, 2);
    let ratio = posNum(b.ratio != null && b.ratio !== '' ? b.ratio : b.brew_ratio, 2);
    if (!ratio && dose && water) ratio = Math.round((water / dose) * 10) / 10;
    if (dose != null) out.dose = dose;
    if (water != null) out.water = water;
    if (ratio != null) out.ratio = ratio;

    let tempC = posNum(b.tempC != null && b.tempC !== '' ? b.tempC : (b.temp_c != null && b.temp_c !== '' ? b.temp_c : b.brew_temp_c), 1);
    let tempF = posNum(b.tempF != null && b.tempF !== '' ? b.tempF : (b.temp_f != null && b.temp_f !== '' ? b.temp_f : b.brew_temp_f), 1);
    if (tempC != null && tempF == null) tempF = Math.round((tempC * 9 / 5 + 32) * 10) / 10;
    else if (tempF != null && tempC == null) tempC = Math.round(((tempF - 32) * 5 / 9) * 10) / 10;
    if (tempC != null) out.tempC = tempC;
    if (tempF != null) out.tempF = tempF;

    const gUm = posNum(b.grindUm != null && b.grindUm !== '' ? b.grindUm : (b.grind_um != null && b.grind_um !== '' ? b.grind_um : b.brew_grind_target_um), 1);
    if (gUm != null){ out.grindUm = gUm; out.grind_um = gUm; }
    const mp = b.machineProfile || b.machine_profile;
    if (mp && typeof mp === 'object' && !Array.isArray(mp)) out.machineProfile = _cloneObj(mp);
    return Object.keys(out).length ? out : null;
  }

  function _extractVaultCandidate(coffeeIn, brewIn){
    const c = (coffeeIn && coffeeIn.coffee && typeof coffeeIn.coffee === 'object') ? coffeeIn.coffee : (coffeeIn || {});
    const b = brewIn || (coffeeIn && (coffeeIn.brew || coffeeIn.lastBrew)) || c.lastBrew || null;
    const rawName = cleanLine(unneutralize(c.name || c.coffee_name || c.coffee || ''));
    const rawRoaster = cleanLine(unneutralize(c.roaster || ''));
    const cid = String(c.coffee_id || c.id || '').trim();
    const nrKey = rawName ? (_normKeyPart(rawName) + '|' + _normKeyPart(rawRoaster)) : '';
    if (!cid && !rawName) return null;

    const cand = {
      id:cid || _newUid(),
      coffee_id:cid || ''
    };
    if (!cand.coffee_id) cand.coffee_id = cand.id;
    const setStr = (k, val, noClean) => {
      if (val === undefined || val === null) return;
      const s = noClean ? String(val).replace(/\r\n?/g, '\n').trim() : cleanLine(unneutralize(val));
      if (s && !_isUnknownToken(s)) cand[k] = s;
    };
    setStr('name', rawName);
    setStr('roaster', rawRoaster);
    const loc = c.roaster_location || c.roasterLocation || ([c.city, c.state].filter(Boolean).join(', '));
    setStr('roaster_location', loc);
    setStr('origin', c.origin);
    setStr('region', c.region);
    const farmVal = c.farm || c.farm_or_station || '';
    const farmStVal = c.farm_or_station || c.farm || '';
    setStr('farm', farmVal);
    setStr('farm_or_station', farmStVal);
    setStr('producer', c.producer);
    setStr('harvest_year', c.harvest_year || c.harvestYear);
    setStr('varietal', c.varietal);
    setStr('species', c.species);
    const bld = resolveBlend(c.blend) || (typeof c.blend === 'string' ? c.blend : '');
    if (bld && !_isUnknownToken(bld)) cand.blend = bld;
    const proc = resolveProcess(c.process) || (typeof c.process === 'string' ? cleanLine(unneutralize(c.process)) : '');
    if (proc && !_isUnknownToken(proc)) cand.process = proc;
    setStr('process_sub', c.process_sub || c.processSub);
    setStr('process_details', c.process_details || c.processDetails);
    if (c.decaf === 'yes' || c.decaf === true) cand.decaf = 'yes';
    setStr('decaf_process', c.decaf_process || c.decafProcess);
    const rst = resolveRoast(c.roast || c.roast_level || c.rlevel) || (typeof c.roast === 'string' ? cleanLine(unneutralize(c.roast)) : '');
    if (rst && !_isUnknownToken(rst)) cand.roast = rst;
    const rd = _btValidIsoDateRef(c.roast_date) ? c.roast_date : (_btValidIsoDateRef(c.roast) ? c.roast : '');
    if (rd) cand.roast_date = rd;
    if (c.is_frozen === 'yes' || c.is_frozen === true || c.isFrozen === true) cand.is_frozen = 'yes';
    const fd = _btValidIsoDateRef(c.frozen_date || c.frozenDate) ? (c.frozen_date || c.frozenDate) : '';
    if (fd) cand.frozen_date = fd;
    if (c.freeze_days_offset != null && /^\d+$/.test(String(c.freeze_days_offset).trim())){
      cand.freeze_days_offset = String(c.freeze_days_offset).trim();
    }
    const elevNum = (+c.elevation_m >= 200 && +c.elevation_m <= 3500) ? String(Math.round(+c.elevation_m)) : '';
    if (elevNum){
      cand.elevation_m = elevNum;
      cand.elevText = cleanLine(c.elevText || '') || (elevNum + ' masl');
    } else if (c.elevText && !_isUnknownToken(c.elevText)){
      cand.elevText = cleanLine(c.elevText);
      const em = _btMapElevation(cand.elevText);
      if (em && em.m) cand.elevation_m = String(em.m);
    }
    const dens = resolveDensity(c.density || c.elevation_class, cand.elevation_m) || '';
    if (dens && !_isUnknownToken(dens)) cand.density = dens;

    const rawNotes = String(c.bag_notes || c.notes || c.bagNotes || (Array.isArray(c.flavors) ? c.flavors.join(', ') : (c.flavors || '')) || '').replace(/\r\n?/g, '\n').trim();
    if (rawNotes){
      cand.bag_notes = rawNotes;
      cand.notes = rawNotes;
    }
    if (Array.isArray(c.flavors) && c.flavors.length){
      const fl = c.flavors.map(x => cleanLine(x)).filter(Boolean);
      if (fl.length) cand.flavors = fl;
    } else if (typeof c.flavors === 'string' && c.flavors.trim()){
      const fl = c.flavors.split(/[,;]+/).map(x => cleanLine(x)).filter(Boolean);
      if (fl.length) cand.flavors = fl;
    } else if (rawNotes){
      const fl = rawNotes.split(/[,;/]+/).map(x => cleanLine(x)).filter(Boolean);
      if (fl.length) cand.flavors = fl;
    }
    setStr('personal_note', c.personal_note || c.personalNote, true);

    const bwRaw = c.bag_weight_g != null && c.bag_weight_g !== '' ? c.bag_weight_g : (c.bagWeightG != null && c.bagWeightG !== '' ? c.bagWeightG : (c.size && c.unit ? costGrams(c.size, c.unit) : null));
    if (bwRaw != null && bwRaw !== '' && isFinite(+bwRaw) && +bwRaw > 0) cand.bag_weight_g = Math.round(+bwRaw * 10) / 10;
    const remRaw = c.remaining_g != null && c.remaining_g !== '' ? c.remaining_g : (c.rem_g != null && c.rem_g !== '' ? c.rem_g : c.remainingG);
    if (remRaw != null && remRaw !== '' && isFinite(+remRaw) && +remRaw >= 0) cand.remaining_g = Math.round(+remRaw * 10) / 10;
    const prcRaw = c.price != null && c.price !== '' ? c.price : c.bagPrice;
    if (prcRaw != null && prcRaw !== '' && isFinite(+prcRaw) && +prcRaw > 0) cand.price = Math.round(+prcRaw * 100) / 100;
    setStr('currency', c.currency || c.sym);

    ['agtron', 'bean_agtron', 'ground_agtron', 'roast_delta', 'psd_d10_um', 'psd_d50_um', 'psd_d90_um', 'psd_span'].forEach(nk => {
      if (c[nk] !== undefined && c[nk] !== null && c[nk] !== '' && isFinite(+c[nk])) cand[nk] = String(c[nk]);
    });
    if (c.agtron_scale && /^(gourmet|commercial|omni|tonino|cm100)$/.test(String(c.agtron_scale))) cand.agtron_scale = String(c.agtron_scale);
    if (c.roasterGuide && typeof c.roasterGuide === 'object' && !Array.isArray(c.roasterGuide)) cand.roasterGuide = _cloneObj(c.roasterGuide);
    const restRaw = c.recommended_rest_days != null && c.recommended_rest_days !== '' ? c.recommended_rest_days : c.recommendedRestDays;
    if (restRaw != null && restRaw !== '' && isFinite(+restRaw) && +restRaw >= 0) cand.recommended_rest_days = Math.round(+restRaw);

    const lb = _buildBrewSnapshot(b);
    if (lb){
      cand.lastBrew = lb;
      if (lb.method) cand.lastMethod = lb.method;
    } else if (c.lastMethod){
      const lm = resolveMethod(c.lastMethod) || cleanLine(c.lastMethod);
      if (lm) cand.lastMethod = lm;
    }
    if (c.dial_locked === 'yes' || c.dial_locked === true || c.dial_locked === '1' || (b && _isGoldenLockedRow(b))) cand.dial_locked = 'yes';
    if (c.pendingNextRecipe && typeof c.pendingNextRecipe === 'object') cand.pendingNextRecipe = _cloneObj(c.pendingNextRecipe);
    if (c.dialAdaptation && typeof c.dialAdaptation === 'object') cand.dialAdaptation = _cloneObj(c.dialAdaptation);
    if (b && typeof b === 'object'){
      const bAd = (!b.next_recipe && b.recipe_adaptation_json) ? _readRowAdaptationMeta(b) : null;
      const bNr = (b.next_recipe && typeof b.next_recipe === 'object') ? b.next_recipe : (bAd && bAd.next_recipe && typeof bAd.next_recipe === 'object' ? bAd.next_recipe : null);
      if (bNr){
        cand.pendingNextRecipe = _cloneObj(bNr);
        if (b.id && !cand.pendingNextRecipe.fromRowId) cand.pendingNextRecipe.fromRowId = String(b.id);
      }
      const da = b.dialAdaptation || b.dial_adaptation || (bAd && bAd.dial_adaptation) || null;
      if (da && typeof da === 'object'){
        cand.dialAdaptation = _cloneObj(da);
        if (b.id && !cand.dialAdaptation.fromRowId) cand.dialAdaptation.fromRowId = String(b.id);
      }
    }
    cand._nrKey = nrKey;
    return cand;
  }

  const _VAULT_COPY_KEYS = [
    'name', 'roaster', 'roaster_location', 'origin', 'region', 'farm', 'farm_or_station', 'producer', 'harvest_year',
    'varietal', 'species', 'blend', 'process', 'process_sub', 'process_details', 'decaf', 'decaf_process',
    'roast', 'roast_date', 'is_frozen', 'frozen_date', 'freeze_days_offset', 'elevation_m', 'elevText', 'density',
    'bag_notes', 'notes', 'flavors', 'personal_note', 'bag_weight_g', 'remaining_g', 'price', 'currency',
    'agtron', 'bean_agtron', 'ground_agtron', 'agtron_scale', 'roast_delta',
    'psd_d10_um', 'psd_d50_um', 'psd_d90_um', 'psd_span', 'roasterGuide', 'recommended_rest_days',
    'lastMethod', 'dial_locked', 'pendingNextRecipe', 'dialAdaptation'
  ];

  function _upsertCoffeeVaultRecordImpl(coffeeIn, brewIn, opts){
    opts = opts || {};
    const cand = _extractVaultCandidate(coffeeIn, brewIn);
    if (!cand) return null;
    const nrKey = cand._nrKey || '';
    delete cand._nrKey;

    const list = _getCoffeesVaultListImpl();
    let hitIdx = -1;
    for (let i = 0; i < list.length; i++){
      const it = list[i];
      if (!it || typeof it !== 'object') continue;
      const itCid = String(it.coffee_id || it.id || '').trim();
      if (cand.coffee_id && itCid && itCid === cand.coffee_id){ hitIdx = i; break; }
      const itNr = _normKeyPart(it.name || it.coffee_name || it.coffee || '') + '|' + _normKeyPart(it.roaster || '');
      if (nrKey && itNr === nrKey){ hitIdx = i; break; }
    }

    const allowClear = opts.allowClear === true;
    const rawIn = (coffeeIn && coffeeIn.coffee && typeof coffeeIn.coffee === 'object') ? coffeeIn.coffee : (coffeeIn || {});
    const nowTs = typeof opts.updatedAt === 'number' && isFinite(opts.updatedAt) ? opts.updatedAt : (opts.updatedAt ? (Date.parse(opts.updatedAt) || Date.now()) : Date.now());
    const fromRowSnapshot = opts.fromRowSnapshot === true || (!opts.fromPriceList && opts.forceRemaining !== true && _isTastingRowSnapshot(brewIn));

    let merged;
    if (hitIdx >= 0){
      const existing = Object.assign({}, list[hitIdx]);
      const exTs = +existing.updatedAt || 0;
      const incomingOlder = opts.mergeByTimestamp === true && exTs > 0 && nowTs > 0 && nowTs < exTs;
      if (!existing.coffee_id && cand.coffee_id) existing.coffee_id = cand.coffee_id;
      if (!existing.id) existing.id = existing.coffee_id || cand.id;
      _VAULT_COPY_KEYS.forEach(k => {
        const allowZero = (k === 'remaining_g' || k === 'recommended_rest_days' || k === 'freeze_days_offset');
        const newVal = cand[k];
        if (allowClear && Object.prototype.hasOwnProperty.call(rawIn, k)){
          if (newVal === undefined || newVal === null || newVal === ''){
            delete existing[k];
            return;
          }
        }
        if (k === 'remaining_g' && fromRowSnapshot && _hasMeaningfulVal(existing.remaining_g, true)){
          const idInfoSnap = _extractCoffeeIdentity(existing);
          const prSnap = _findPriceBagIndices(null, idInfoSnap);
          if (prSnap.openIdx >= 0 && prState.list[prSnap.openIdx] && prState.list[prSnap.openIdx].rem_g != null){
            existing.remaining_g = Math.round(+prState.list[prSnap.openIdx].rem_g * 10) / 10;
          }
          return;
        }
        if (_hasMeaningfulVal(newVal, allowZero)){
          if (incomingOlder && _hasMeaningfulVal(existing[k], allowZero)) return;
          if (k === 'pendingNextRecipe' || k === 'dialAdaptation'){
            existing[k] = _cloneObj(newVal);
          } else if (k === 'roasterGuide'){
            existing[k] = (existing[k] && typeof existing[k] === 'object' && !Array.isArray(existing[k]))
              ? Object.assign({}, existing[k], newVal)
              : _cloneObj(newVal);
          } else {
            existing[k] = newVal;
          }
        }
      });
      if (cand.bag_notes && !cand.notes) existing.notes = cand.bag_notes;
      if (existing.bag_notes && !existing.notes) existing.notes = existing.bag_notes;
      if (existing.notes && !existing.bag_notes) existing.bag_notes = existing.notes;
      if (cand.lastBrew){
        const prevLb = (existing.lastBrew && typeof existing.lastBrew === 'object') ? existing.lastBrew : {};
        existing.lastBrew = Object.assign({}, prevLb, cand.lastBrew);
        if (cand.lastBrew.method) existing.lastMethod = cand.lastBrew.method;
      }
      const rawBrewIn = (brewIn && typeof brewIn === 'object') ? brewIn : (coffeeIn && coffeeIn.brew && typeof coffeeIn.brew === 'object' ? coffeeIn.brew : null);
      const explicitUnlock = opts.allowUnlock === true || (Object.prototype.hasOwnProperty.call(rawIn, 'dial_locked') && !rawIn.dial_locked) || (rawBrewIn && Object.prototype.hasOwnProperty.call(rawBrewIn, 'dial_locked') && !rawBrewIn.dial_locked);
      if (explicitUnlock){
        delete existing.dial_locked;
      }
      if (existing.dial_locked === 'yes' && !allowClear && cand.pendingNextRecipe && !rawIn.pendingNextRecipe){
        delete existing.pendingNextRecipe;
      }
      existing.updatedAt = Math.max(+existing.updatedAt || 0, nowTs);
      list[hitIdx] = existing;
      merged = existing;
    } else {
      cand.updatedAt = nowTs;
      list.push(cand);
      merged = cand;
    }
    _saveCoffeesVaultListImpl(list);
    return merged;
  }

  function _upsertVaultFromRowObj(rowObj){
    if (!rowObj || typeof rowObj !== 'object') return null;
    const populated = _populateCoffeeFromRowObj(rowObj);
    const c = populated.coffee || {};
    const ad = populated.adMeta || {};
    const a = _getApp();
    const rCid = String(rowObj.coffee_id || c.id || '').trim();
    const rNr = _normKeyPart(c.name || rowObj.coffee_name || '') + '|' + _normKeyPart(c.roaster || rowObj.roaster || '');
    const appCoffee = (a && a.coffee) || null;
    const appNr = appCoffee && appCoffee.name ? (_normKeyPart(appCoffee.name) + '|' + _normKeyPart(appCoffee.roaster || '')) : '';
    const sameAppCoffee = !!(appCoffee && ((rCid && appCoffee.id && appCoffee.id === rCid) || (rNr && appNr && rNr === appNr)));

    const mergedCoffee = sameAppCoffee ? Object.assign({}, appCoffee, c) : Object.assign({}, c);
    if (sameAppCoffee){
      Object.keys(appCoffee).forEach(k => {
        if (!_hasMeaningfulVal(mergedCoffee[k], k === 'recommended_rest_days' || k === 'remaining_g') && _hasMeaningfulVal(appCoffee[k], k === 'recommended_rest_days' || k === 'remaining_g')){
          mergedCoffee[k] = appCoffee[k];
        }
      });
    }
    /* Never let a historical tasting row's coffee_extra.remaining_g overwrite live inventory in Prices / app.coffee / Vault */
    const rowIdInfo = _extractCoffeeIdentity(mergedCoffee);
    const prRowBags = _findPriceBagIndices(null, rowIdInfo);
    if (prRowBags.openIdx >= 0 && prState.list[prRowBags.openIdx] && prState.list[prRowBags.openIdx].rem_g != null){
      mergedCoffee.remaining_g = Math.round(+prState.list[prRowBags.openIdx].rem_g * 10) / 10;
    } else if (sameAppCoffee && _hasMeaningfulVal(appCoffee.remaining_g, true)){
      mergedCoffee.remaining_g = Math.round(+appCoffee.remaining_g * 10) / 10;
    } else {
      const curVaultList = _getCoffeesVaultListImpl();
      const curVIdx = _findVaultCoffeeIdx(curVaultList, rowIdInfo);
      if (curVIdx >= 0 && _hasMeaningfulVal(curVaultList[curVIdx].remaining_g, true)){
        mergedCoffee.remaining_g = Math.round(+curVaultList[curVIdx].remaining_g * 10) / 10;
      }
    }
    if (_isGoldenLockedRow(rowObj)) mergedCoffee.dial_locked = 'yes';
    else if (Object.prototype.hasOwnProperty.call(rowObj, 'dial_locked')) mergedCoffee.dial_locked = '';
    if (ad.next_recipe && typeof ad.next_recipe === 'object') mergedCoffee.pendingNextRecipe = ad.next_recipe;
    if (ad.dial_adaptation && typeof ad.dial_adaptation === 'object') mergedCoffee.dialAdaptation = ad.dial_adaptation;
    if (rowObj.dial_symptom || rowObj.dial_change){
      mergedCoffee.dialAdaptation = Object.assign({}, mergedCoffee.dialAdaptation || {}, {
        dial_symptom:rowObj.dial_symptom || (mergedCoffee.dialAdaptation && mergedCoffee.dialAdaptation.dial_symptom) || '',
        dial_change:rowObj.dial_change || (mergedCoffee.dialAdaptation && mergedCoffee.dialAdaptation.dial_change) || '',
        locked:_isGoldenLockedRow(rowObj)
      });
    }

    const rowBrew = _buildBrewSnapshot(rowObj) || {};
    if (ad.machine_profile) rowBrew.machineProfile = ad.machine_profile;
    const appBrew = (sameAppCoffee && a && a.brew) ? (_buildBrewSnapshot(a.brew) || {}) : {};
    const mergedBrew = Object.assign({}, appBrew, rowBrew);
    return _upsertCoffeeVaultRecordImpl(mergedCoffee, Object.keys(mergedBrew).length ? mergedBrew : null, { fromRowSnapshot:true });
  }

  function _upsertVaultFromPriceList(list){
    if (!Array.isArray(list) || !list.length) return;
    for (let i = 0; i < list.length; i++){
      const bag = list[i];
      if (!bag || bag.kind === 'pods' || !bag.coffee) continue;
      const totalG = costGrams(bag.size, bag.unit);
      const loc = [bag.city, bag.state].filter(Boolean).join(', ');
      _upsertCoffeeVaultRecordImpl({
        id:bag.coffee_id || '',
        coffee_id:bag.coffee_id || '',
        name:bag.coffee,
        roaster:bag.roaster || '',
        roaster_location:loc,
        origin:bag.origin || '',
        region:bag.region || '',
        process:bag.process || '',
        varietal:bag.varietal || '',
        elevation_m:bag.elevation_m || '',
        roast:bag.rlevel || '',
        roast_date:_btValidIsoDateRef(bag.roast) ? bag.roast : '',
        is_frozen:bag.is_frozen === 'yes' ? 'yes' : '',
        frozen_date:_btValidIsoDateRef(bag.frozen_date) ? bag.frozen_date : '',
        bag_notes:bag.bag_notes || bag.notes || '',
        notes:bag.notes || bag.bag_notes || '',
        bag_weight_g:totalG > 0 ? Math.round(totalG * 10) / 10 : '',
        remaining_g:bag.rem_g != null ? Math.round(+bag.rem_g * 10) / 10 : (totalG > 0 ? Math.round(totalG * 10) / 10 : ''),
        price:bag.price,
        currency:bag.currency || bag.sym || '$'
      }, null, { fromPriceList:true });
    }
  }

  function _buildUnifiedCoffeesIndexImpl(historyObjs, priceList, vaultList){
    const hObjs = Array.isArray(historyObjs) ? historyObjs : ((historyState && historyState.objs) || []);
    const pList = Array.isArray(priceList) ? priceList : prState.list;
    let curVaultRaw = '';
    try { curVaultRaw = Array.isArray(vaultList) ? '' : (localStorage.getItem(EXTRA_VAULT_COFFEES_KEY) || ''); } catch(e){}
    const isLiveStores = (historyObjs === undefined || (historyState && historyObjs === historyState.objs)) && (priceList === undefined || priceList === prState.list) && vaultList === undefined;
    const cacheSig = isLiveStores ? (_g.__btHistoryRev + '|' + hObjs.length + '|' + pList.length + '|' + prState.changes + '|' + _vaultRev) : '';
    if (cacheSig && _unifiedIndexCache.key === cacheSig && _unifiedIndexCache.vaultRaw === curVaultRaw) return _unifiedIndexCache.list;

    const todayStr = _todayIso();
    const byCid = new Map();
    const byNorm = new Map();
    const records = [];

    const createBlankRecord = (cid, normKey) => {
      const rec = {
        key:cid || normKey || ('cf-' + records.length),
        coffee_id:cid || '',
        normKey:normKey || '',
        name:'',
        roaster:'',
        roaster_location:'',
        origin:'',
        region:'',
        farm:'',
        farm_or_station:'',
        producer:'',
        harvest_year:'',
        varietal:'',
        process:'',
        process_sub:'',
        process_details:'',
        roast:'',
        blend:'',
        species:'arabica',
        decaf:'',
        decaf_process:'',
        elevation_m:'',
        elevation_class:'',
        density:'',
        elevText:'',
        roast_date:'',
        is_frozen:'',
        frozen_date:'',
        freeze_days_offset:'',
        bag_notes:'',
        notes:'',
        flavors:[],
        personal_note:'',
        bag_weight_g:'',
        remaining_g:'',
        price:'',
        currency:'',
        agtron:'',
        bean_agtron:'',
        ground_agtron:'',
        agtron_scale:'gourmet',
        roast_delta:'',
        psd_d10_um:'',
        psd_d50_um:'',
        psd_d90_um:'',
        psd_span:'',
        roasterGuide:null,
        recommended_rest_days:null,
        lastMethod:'',
        lastBrew:null,
        lastLikedFlavors:[],
        pendingNextRecipe:null,
        dialAdaptation:null,
        updatedAt:0,
        openBag:null,
        lockedBrew:null,
        bestBrew:null,
        latestBrew:null,
        n_cups:0,
        methods:[],
        bestStars:0,
        bestScore:0,
        last_brewed_at:'',
        daysSinceRoast:null,
        isDialedIn:false,
        isGoldenLocked:false
      };
      records.push(rec);
      if (cid) byCid.set(cid, rec);
      if (normKey) byNorm.set(normKey, rec);
      return rec;
    };

    const findOrCreate = (cid, rawName, rawRoaster) => {
      const cleanCid = cid ? String(cid).trim() : '';
      if (cleanCid){
        const fastHit = byCid.get(cleanCid);
        if (fastHit && fastHit.normKey) return fastHit;
      }
      const nName = _normKeyPart(rawName), nRoaster = _normKeyPart(rawRoaster);
      const nKey = nName ? (nName + '|' + nRoaster) : '';
      let rec = (cleanCid && byCid.get(cleanCid)) || (nKey && byNorm.get(nKey)) || null;
      if (!rec){
        rec = createBlankRecord(cleanCid, nKey);
      } else {
        if (cleanCid && !rec.coffee_id){ rec.coffee_id = cleanCid; byCid.set(cleanCid, rec); }
        else if (cleanCid && !byCid.has(cleanCid)) byCid.set(cleanCid, rec);
        if (nKey && !rec.normKey){ rec.normKey = nKey; byNorm.set(nKey, rec); }
        else if (nKey && !byNorm.has(nKey)) byNorm.set(nKey, rec);
      }
      return rec;
    };

    const isNewerOrEqRow = (rowA, rowB) => {
      const dA = rowA.cupping_date || '', dB = rowB.cupping_date || '';
      if (dA !== dB) return dA > dB;
      return (rowA.saved_at || '') >= (rowB.saved_at || '');
    };

    /* Memoize resolver lookups inside Pass 1 so 500+ rows fold in <0.8 ms */
    const procMemo = Object.create(null);
    const roastMemo = Object.create(null);
    const methodMemo = Object.create(null);
    const fastProc = v => { if (!v) return ''; return procMemo[v] !== undefined ? procMemo[v] : (procMemo[v] = resolveProcess(v)); };
    const fastRoast = v => { if (!v) return ''; return roastMemo[v] !== undefined ? roastMemo[v] : (roastMemo[v] = resolveRoast(v)); };
    const fastMeth = v => { if (!v) return ''; return methodMemo[v] !== undefined ? methodMemo[v] : (methodMemo[v] = resolveMethod(v)); };

    /* Pass 1: Fold all tasting history rows in O(N) */
    for (let i = 0; i < hObjs.length; i++){
      const row = hObjs[i];
      if (!row) continue;
      const rawCName = row.coffee_name || '';
      const cName0 = rawCName && rawCName.charCodeAt(0) === 39 ? unneutralize(rawCName) : rawCName;
      const cName = cName0 && (cName0.charCodeAt(0) <= 32 || cName0.charCodeAt(cName0.length - 1) <= 32) ? cName0.trim() : cName0;
      const rawCRoast = row.roaster || '';
      const cRoaster0 = rawCRoast && rawCRoast.charCodeAt(0) === 39 ? unneutralize(rawCRoast) : rawCRoast;
      const cRoaster = cRoaster0 && (cRoaster0.charCodeAt(0) <= 32 || cRoaster0.charCodeAt(cRoaster0.length - 1) <= 32) ? cRoaster0.trim() : cRoaster0;
      const cid = row.coffee_id || '';
      if (!cName && !cid) continue;
      let rec = cid ? byCid.get(cid) : null;
      if (!rec || !rec.normKey) rec = findOrCreate(cid, cName, cRoaster);
      rec.n_cups++;

      if (cName && cName.length > rec.name.length) rec.name = cName;
      if (cRoaster && cRoaster.length > rec.roaster.length) rec.roaster = cRoaster;
      const rawOrg = row.origin;
      if (rawOrg){
        const clOrg = (rawOrg.charCodeAt(0) === 39 ? unneutralize(rawOrg) : rawOrg).trim();
        if (clOrg && clOrg !== 'unknown' && (!rec.origin || rec.origin === 'unknown' || clOrg.length > rec.origin.length) && !_isUnknownToken(clOrg)) rec.origin = clOrg;
      }
      const rawVar = row.varietal;
      if (rawVar){
        const clVar = (rawVar.charCodeAt(0) === 39 ? unneutralize(rawVar) : rawVar).trim();
        if (clVar && (!rec.varietal || clVar.length > rec.varietal.length) && !_isUnknownToken(clVar)) rec.varietal = clVar;
      }
      if (row.process && (!rec.process || rec.process === 'unknown')){
        const proc = fastProc(row.process);
        if (proc) rec.process = proc;
      }
      if (row.roast_level && (!rec.roast || rec.roast === 'unknown')){
        const rst = fastRoast(row.roast_level);
        if (rst) rec.roast = rst;
      }
      if (row.blend && !rec.blend){
        const bld = resolveBlend(row.blend);
        if (bld) rec.blend = bld;
      }
      if (row.species && (rec.species === 'arabica' || !rec.species)){
        const sp = (row.species.charCodeAt(0) === 39 ? unneutralize(row.species) : row.species).trim();
        if (sp) rec.species = sp;
      }
      if (row.decaf === 'yes'){
        rec.decaf = 'yes';
        if (row.decaf_process) rec.decaf_process = (row.decaf_process.charCodeAt(0) === 39 ? unneutralize(row.decaf_process) : row.decaf_process).trim();
      }
      if (row.elevation_m && !rec.elevation_m){
        rec.elevation_m = String(row.elevation_m).trim();
        rec.elevText = rec.elevation_m + ' masl';
      }
      if (row.elevation_class && !rec.elevation_class){
        const eCls = (row.elevation_class.charCodeAt(0) === 39 ? unneutralize(row.elevation_class) : row.elevation_class).trim();
        if (eCls){ rec.elevation_class = eCls; rec.density = resolveDensity(eCls, rec.elevation_m) || rec.density; }
      } else if (rec.elevation_m && !rec.density) rec.density = resolveDensity('', rec.elevation_m);
      const rawBn = row.bag_notes;
      if (rawBn && rawBn.length > rec.bag_notes.length){
        const bn = (rawBn.charCodeAt(0) === 39 ? unneutralize(rawBn) : rawBn).trim();
        if (bn && bn.length > rec.bag_notes.length){ rec.bag_notes = bn; rec.notes = bn; }
      }

      const rDate = row.roast_date;
      if (rDate && rDate.length === 10 && (!rec.roast_date || rDate >= rec.roast_date) && _btValidIsoDateRef(rDate)) rec.roast_date = rDate;
      if (row.is_frozen === 'yes'){
        rec.is_frozen = 'yes';
        if (_btValidIsoDateRef(row.frozen_date)) rec.frozen_date = row.frozen_date;
        if (row.freeze_days_offset) rec.freeze_days_offset = String(row.freeze_days_offset);
      }

      const isNewerRow = !rec.latestBrew || isNewerOrEqRow(row, rec.latestBrew);

      /* Extract Agtron / Omni PSD / coffee_extra / next_recipe metadata only if row has recipe_adaptation_json */
      let ad = null;
      const rawAdap = row.recipe_adaptation_json;
      if (rawAdap && rawAdap.length > 2){
        ad = _readRowAdaptationMeta(row);
        if (ad){
          if (ad.agtron != null) rec.agtron = String(ad.agtron);
          if (ad.bean_agtron != null) rec.bean_agtron = String(ad.bean_agtron);
          if (ad.ground_agtron != null) rec.ground_agtron = String(ad.ground_agtron);
          if (ad.agtron_scale) rec.agtron_scale = String(ad.agtron_scale);
          if (ad.roast_delta != null) rec.roast_delta = String(ad.roast_delta);
          if (ad.psd_d10_um != null) rec.psd_d10_um = String(ad.psd_d10_um);
          if (ad.psd_d50_um != null) rec.psd_d50_um = String(ad.psd_d50_um);
          if (ad.psd_d90_um != null) rec.psd_d90_um = String(ad.psd_d90_um);
          if (ad.psd_span != null) rec.psd_span = String(ad.psd_span);
          if (ad.roaster_guide && typeof ad.roaster_guide === 'object' && (!rec.roasterGuide || isNewerRow)) rec.roasterGuide = ad.roaster_guide;
          if (ad.next_recipe && typeof ad.next_recipe === 'object' && isNewerRow) rec.pendingNextRecipe = ad.next_recipe;
          if (ad.dial_adaptation && typeof ad.dial_adaptation === 'object' && isNewerRow) rec.dialAdaptation = ad.dial_adaptation;
          if (ad.machine_profile && typeof ad.machine_profile === 'object' && isNewerRow){
            rec.lastBrew = Object.assign({}, rec.lastBrew || {}, { machineProfile:ad.machine_profile });
          }
          const ce = ad.coffee_extra && typeof ad.coffee_extra === 'object' ? ad.coffee_extra : null;
          if (ce){
            if (ce.region && (!rec.region || isNewerRow)) rec.region = String(ce.region);
            if (ce.roaster_location && (!rec.roaster_location || isNewerRow)) rec.roaster_location = String(ce.roaster_location);
            if (ce.farm && (!rec.farm || isNewerRow)) rec.farm = String(ce.farm);
            if (ce.farm_or_station && (!rec.farm_or_station || isNewerRow)) rec.farm_or_station = String(ce.farm_or_station);
            if (ce.producer && (!rec.producer || isNewerRow)) rec.producer = String(ce.producer);
            if (ce.harvest_year && (!rec.harvest_year || isNewerRow)) rec.harvest_year = String(ce.harvest_year);
            if (ce.process_sub && (!rec.process_sub || isNewerRow)) rec.process_sub = String(ce.process_sub);
            if (ce.process_details && (!rec.process_details || isNewerRow)) rec.process_details = String(ce.process_details);
            if (ce.personal_note && (!rec.personal_note || isNewerRow)) rec.personal_note = String(ce.personal_note);
            if (ce.bag_weight_g != null && ce.bag_weight_g !== '' && (!rec.bag_weight_g || isNewerRow)) rec.bag_weight_g = ce.bag_weight_g;
            if (ce.remaining_g != null && ce.remaining_g !== '' && (rec.remaining_g === '' || isNewerRow)) rec.remaining_g = ce.remaining_g;
            if (ce.price != null && ce.price !== '' && (!rec.price || isNewerRow)) rec.price = ce.price;
            if (ce.currency && (!rec.currency || isNewerRow)) rec.currency = String(ce.currency);
            if (Array.isArray(ce.flavors) && ce.flavors.length && (!rec.flavors.length || isNewerRow)) rec.flavors = ce.flavors.slice();
            if (ce.roasterGuide && typeof ce.roasterGuide === 'object' && (!rec.roasterGuide || isNewerRow)) rec.roasterGuide = ce.roasterGuide;
            if (ce.recommended_rest_days != null && (rec.recommended_rest_days == null || isNewerRow)) rec.recommended_rest_days = ce.recommended_rest_days;
          }
        }
      }

      if (row.flavors_liked && (!rec.lastLikedFlavors.length || isNewerRow)){
        const flList = unneutralize(row.flavors_liked).split(';').map(x => x.trim()).filter(Boolean);
        if (flList.length) rec.lastLikedFlavors = flList;
      }

      const mKey = fastMeth(row.brew_method);
      if (mKey && rec.methods.indexOf(mKey) < 0){
        rec.methods.push(mKey);
      }

      const dl = row.dial_locked;
      const isGold = dl === 'yes' || dl === '1' || (dl ? _isGoldenLockedRow(row) : false);
      if (isNewerRow){
        rec.latestBrew = row;
        if (mKey) rec.lastMethod = mKey;
        if (isGold && rec.pendingNextRecipe && !(ad && ad.next_recipe)){
          rec.pendingNextRecipe = null;
        }
      }
      if (isGold){
        if (!rec.lockedBrew || isNewerOrEqRow(row, rec.lockedBrew)){
          rec.lockedBrew = row;
        }
      }

      const excludedLearn = (row.cva_intensity_json && row.cva_intensity_json.indexOf('exclude_learning') >= 0) ? isRowExcludedFromLearning(row) : (row.exclude_learning === true);
      const rs = row.my_rating_stars;
      const st = rs === '5' ? 5 : rs === '4.5' ? 4.5 : rs === '4' ? 4 : rs === '3.5' ? 3.5 : rs === '3' ? 3 : (rs ? validStars(rs) : 0);
      const tScore = row.total_score ? +row.total_score : NaN;
      const effStars = excludedLearn ? 0 : (st > 0 ? st : (tScore > 0 ? Math.max(0.5, Math.min(5, Math.round((3.5 + (tScore - 82) * 0.2) * 100) / 100)) : 0));
      if (!excludedLearn && (effStars > rec.bestStars || (effStars === rec.bestStars && (!rec.bestBrew || isNewerOrEqRow(row, rec.bestBrew))))){
        if (effStars > 0 || !rec.bestBrew){
          rec.bestBrew = row;
          if (effStars > rec.bestStars) rec.bestStars = effStars;
        }
      } else if (!rec.bestBrew){
        rec.bestBrew = row;
      }
      if (tScore > rec.bestScore) rec.bestScore = tScore;
    }

    /* Pass 2: Fold all open & past bags from Prices ledger */
    for (let j = 0; j < pList.length; j++){
      const bag = pList[j];
      if (!bag || bag.kind === 'pods' || !bag.coffee) continue;
      const rec = findOrCreate(bag.coffee_id || '', bag.coffee, bag.roaster);
      if (!rec.name) rec.name = bag.coffee;
      if (!rec.roaster && bag.roaster) rec.roaster = bag.roaster;
      if ((!rec.roast || rec.roast === 'unknown') && bag.rlevel) rec.roast = fastRoast(bag.rlevel) || bag.rlevel;
      if (_btValidIsoDateRef(bag.roast) && (!rec.roast_date || bag.roast >= rec.roast_date)) rec.roast_date = bag.roast;
      if (bag.is_frozen === 'yes') rec.is_frozen = 'yes';
      if (_btValidIsoDateRef(bag.frozen_date)) rec.frozen_date = bag.frozen_date;
      const bagNotesTxt = String(bag.bag_notes || bag.notes || '').trim();
      if (bagNotesTxt && (!rec.bag_notes || bagNotesTxt.length > rec.bag_notes.length)){
        rec.bag_notes = bagNotesTxt;
        rec.notes = bagNotesTxt;
      }
      if (bag.origin && (!rec.origin || _isUnknownToken(rec.origin))) rec.origin = bag.origin;
      if (bag.region && !rec.region) rec.region = bag.region;
      if (bag.process && (!rec.process || rec.process === 'unknown')) rec.process = fastProc(bag.process) || bag.process;
      if (bag.varietal && !rec.varietal) rec.varietal = bag.varietal;
      if (bag.elevation_m && !rec.elevation_m){
        rec.elevation_m = String(bag.elevation_m);
        rec.elevText = rec.elevation_m + ' masl';
        if (!rec.density) rec.density = resolveDensity('', rec.elevation_m);
      }
      if (!rec.roaster_location && (bag.city || bag.state)) rec.roaster_location = [bag.city, bag.state].filter(Boolean).join(', ');
      const bagTotalG = costGrams(bag.size, bag.unit);
      if (bagTotalG > 0 && !rec.bag_weight_g) rec.bag_weight_g = Math.round(bagTotalG * 10) / 10;
      if (bag.rem_g != null){
        if (!bag.finished){
          rec.remaining_g = Math.round(+bag.rem_g * 10) / 10;
          rec._hasLivePriceRem = true;
        } else if (rec.remaining_g === '' || !rec._hasLivePriceRem){
          rec.remaining_g = Math.round(+bag.rem_g * 10) / 10;
        }
      }
      if (bag.price > 0 && !rec.price) rec.price = bag.price;
      if ((bag.currency || bag.sym) && !rec.currency) rec.currency = bag.currency || bag.sym;

      if (!bag.finished){
        const totalG = bagTotalG;
        const remG = bag.rem_g != null ? +bag.rem_g : totalG;
        const candOpen = {
          bagIndex:j,
          coffee:bag.coffee,
          roaster:bag.roaster || '',
          price:bag.price,
          sym:bag.sym || '$',
          size:bag.size,
          unit:bag.unit,
          total_g:Math.round(totalG * 10) / 10,
          rem_g:Math.round(remG * 10) / 10,
          roast:bag.roast || '',
          date:bag.date || '',
          tubes_json:bag.tubes_json || ''
        };
        if (!rec.openBag || (candOpen.roast && (!rec.openBag.roast || candOpen.roast >= rec.openBag.roast))){
          rec.openBag = candOpen;
        }
      }
    }

    /* Pass 3: Fold lossless Bean Vault records from 'brew-and-cup-coffees-v1' */
    const vList = Array.isArray(vaultList) ? vaultList : _getCoffeesVaultListImpl();
    for (let vi = 0; vi < vList.length; vi++){
      const v = vList[vi];
      if (!v || typeof v !== 'object') continue;
      const vName = cleanLine(unneutralize(v.name || v.coffee_name || v.coffee || ''));
      const vRoaster = cleanLine(unneutralize(v.roaster || ''));
      const vCid = String(v.coffee_id || v.id || '').trim();
      if (!vName && !vCid) continue;
      const rec = findOrCreate(vCid, vName, vRoaster);
      const lbRow = rec.latestBrew;
      const lbIso = lbRow ? (lbRow.saved_at || (lbRow.cupping_date ? (lbRow.cupping_date + 'T00:00:00Z') : '')) : '';
      const recTs = rec.updatedAt || (lbIso ? (Date.parse(lbIso) || 0) : 0);
      const vTs = typeof v.updatedAt === 'number' && isFinite(v.updatedAt) ? v.updatedAt : (v.updatedAt ? (Date.parse(v.updatedAt) || 0) : 0);
      const vIsNewer = vTs >= recTs;

      const mergeVaultVal = (k, val, allowZero) => {
        if (!_hasMeaningfulVal(val, allowZero)) return;
        const curEmpty = !_hasMeaningfulVal(rec[k], allowZero);
        if (curEmpty || vIsNewer) rec[k] = val;
      };
      mergeVaultVal('name', vName);
      mergeVaultVal('roaster', vRoaster);
      mergeVaultVal('roaster_location', v.roaster_location);
      mergeVaultVal('origin', v.origin);
      mergeVaultVal('region', v.region);
      mergeVaultVal('farm', v.farm || v.farm_or_station);
      mergeVaultVal('farm_or_station', v.farm_or_station || v.farm);
      mergeVaultVal('producer', v.producer);
      mergeVaultVal('harvest_year', v.harvest_year);
      mergeVaultVal('varietal', v.varietal);
      mergeVaultVal('species', v.species);
      mergeVaultVal('blend', resolveBlend(v.blend) || v.blend);
      mergeVaultVal('process', resolveProcess(v.process) || v.process);
      mergeVaultVal('process_sub', v.process_sub);
      mergeVaultVal('process_details', v.process_details);
      if (v.decaf === 'yes' || v.decaf === true) rec.decaf = 'yes';
      mergeVaultVal('decaf_process', v.decaf_process);
      mergeVaultVal('roast', fastRoast(v.roast || v.roast_level) || v.roast);
      if (_btValidIsoDateRef(v.roast_date) && (!rec.roast_date || vIsNewer)) rec.roast_date = v.roast_date;
      if (v.is_frozen === 'yes' || v.is_frozen === true) rec.is_frozen = 'yes';
      if (_btValidIsoDateRef(v.frozen_date) && (!rec.frozen_date || vIsNewer)) rec.frozen_date = v.frozen_date;
      mergeVaultVal('freeze_days_offset', v.freeze_days_offset != null ? String(v.freeze_days_offset) : '', true);
      if (v.elevation_m != null && String(v.elevation_m).trim() !== '' && (!rec.elevation_m || vIsNewer)) rec.elevation_m = String(v.elevation_m).trim();
      if (v.elevText && (!rec.elevText || vIsNewer)) rec.elevText = String(v.elevText);
      mergeVaultVal('density', resolveDensity(v.density, rec.elevation_m) || v.density);
      const vNotes = String(v.bag_notes || v.notes || '').trim();
      if (vNotes && (!rec.bag_notes || vIsNewer || vNotes.length > rec.bag_notes.length)){
        rec.bag_notes = vNotes;
        rec.notes = vNotes;
      }
      if (Array.isArray(v.flavors) && v.flavors.length && (!rec.flavors.length || vIsNewer)) rec.flavors = v.flavors.slice();
      mergeVaultVal('personal_note', v.personal_note);
      mergeVaultVal('bag_weight_g', v.bag_weight_g);
      if (_hasMeaningfulVal(v.remaining_g, true)){
        if (!rec._hasLivePriceRem || vIsNewer) rec.remaining_g = Math.round(+v.remaining_g * 10) / 10;
      }
      mergeVaultVal('price', v.price);
      mergeVaultVal('currency', v.currency);
      ['agtron', 'bean_agtron', 'ground_agtron', 'agtron_scale', 'roast_delta', 'psd_d10_um', 'psd_d50_um', 'psd_d90_um', 'psd_span'].forEach(ak => {
        if (v[ak] != null && v[ak] !== '' && (rec[ak] === '' || rec[ak] == null || vIsNewer)) rec[ak] = String(v[ak]);
      });
      if (v.roasterGuide && typeof v.roasterGuide === 'object' && (!rec.roasterGuide || vIsNewer)) rec.roasterGuide = _cloneObj(v.roasterGuide);
      if (v.recommended_rest_days != null && isFinite(+v.recommended_rest_days) && (rec.recommended_rest_days == null || vIsNewer)){
        rec.recommended_rest_days = Math.round(+v.recommended_rest_days);
      }
      if (v.lastMethod){
        const lm = fastMeth(v.lastMethod) || String(v.lastMethod);
        if (!rec.lastMethod || vIsNewer) rec.lastMethod = lm;
        if (lm && rec.methods.indexOf(lm) < 0) rec.methods.push(lm);
      }
      if (v.lastBrew && typeof v.lastBrew === 'object'){
        rec.lastBrew = vIsNewer ? Object.assign({}, rec.lastBrew || {}, v.lastBrew) : Object.assign({}, v.lastBrew, rec.lastBrew || {});
      }
      if (v.pendingNextRecipe && typeof v.pendingNextRecipe === 'object' && (!rec.pendingNextRecipe || vIsNewer)){
        rec.pendingNextRecipe = _cloneObj(v.pendingNextRecipe);
      }
      if (v.dialAdaptation && typeof v.dialAdaptation === 'object' && (!rec.dialAdaptation || vIsNewer)){
        rec.dialAdaptation = _cloneObj(v.dialAdaptation);
      }
      if (v.dial_locked === 'yes' && !rec.latestBrew) rec.dial_locked = 'yes';
      else if (Object.prototype.hasOwnProperty.call(v, 'dial_locked') && !v.dial_locked && !rec.lockedBrew) rec.dial_locked = '';
      if (vTs > rec.updatedAt) rec.updatedAt = vTs;
    }

    /* Pass 4: Finalize derived freshness & dial status + deterministic sort */
    for (let k = 0; k < records.length; k++){
      const rec = records[k];
      delete rec._hasLivePriceRem;
      if (rec.latestBrew && !rec.last_brewed_at){
        const lb = rec.latestBrew;
        rec.last_brewed_at = lb.cupping_date || (lb.saved_at ? lb.saved_at.slice(0, 10) : '');
      }
      if (rec.bag_notes && !rec.notes) rec.notes = rec.bag_notes;
      if (rec.notes && !rec.bag_notes) rec.bag_notes = rec.notes;
      if (rec.elevation_m && !rec.elevText) rec.elevText = rec.elevation_m + ' masl';
      if (rec.elevation_m && !rec.density) rec.density = resolveDensity('', rec.elevation_m);
      const activeRoast = (rec.openBag && rec.openBag.roast) ? rec.openBag.roast : rec.roast_date;
      rec.daysSinceRoast = activeRoast ? priceDaysSince(activeRoast, todayStr) : null;
      rec.isGoldenLocked = !!rec.lockedBrew;
      rec.isDialedIn = !!(rec.lockedBrew || rec.bestStars >= 4.5);
    }

    records.sort((a, b) => {
      const aOpen = a.openBag ? 1 : 0, bOpen = b.openBag ? 1 : 0;
      if (aOpen !== bOpen) return bOpen - aOpen;
      if (aOpen && bOpen){
        const ad = a.daysSinceRoast != null ? a.daysSinceRoast : -1;
        const bd = b.daysSinceRoast != null ? b.daysSinceRoast : -1;
        if (ad !== bd) return bd - ad; /* oldest open roast first ("Use first") */
      }
      if (a.last_brewed_at !== b.last_brewed_at) return a.last_brewed_at < b.last_brewed_at ? 1 : -1;
      if (b.bestStars !== a.bestStars) return b.bestStars - a.bestStars;
      const nkA = a.normKey || a.name || '', nkB = b.normKey || b.name || '';
      return nkA < nkB ? -1 : nkA > nkB ? 1 : 0;
    });

    if (cacheSig){
      _unifiedIndexCache.key = cacheSig;
      _unifiedIndexCache.vaultRaw = curVaultRaw;
      _unifiedIndexCache.list = records;
    }
    return records;
  }

  function _applyBrewSnapshotToApp(bObj, aBrew){
    if (!bObj || typeof bObj !== 'object' || !aBrew) return;
    const mk = resolveMethod(bObj.method || bObj.methodKey || bObj.brew_method);
    if (mk) aBrew.method = mk;
    const doseRaw = bObj.dose != null && bObj.dose !== '' ? bObj.dose : (bObj.doseG != null && bObj.doseG !== '' ? bObj.doseG : bObj.brew_dose_g);
    const waterRaw = bObj.water != null && bObj.water !== '' ? bObj.water : (bObj.waterG != null && bObj.waterG !== '' ? bObj.waterG : bObj.brew_water_g);
    if (+doseRaw > 0) aBrew.dose = +doseRaw;
    if (+waterRaw > 0) aBrew.water = +waterRaw;
    if (+bObj.ratio > 0) aBrew.ratio = +bObj.ratio;
    if (+bObj.tempF > 0){
      aBrew.tempF = +bObj.tempF;
      aBrew.tempC = +bObj.tempC > 0 ? +bObj.tempC : Math.round(((+bObj.tempF - 32) * 5 / 9) * 10) / 10;
    } else if (+bObj.tempC > 0){
      aBrew.tempC = +bObj.tempC;
      aBrew.tempF = Math.round((+bObj.tempC * 9 / 5 + 32) * 10) / 10;
    }
    const gUm = +(bObj.grindUm != null && bObj.grindUm !== '' ? bObj.grindUm : (bObj.grind_um != null && bObj.grind_um !== '' ? bObj.grind_um : (bObj.d50Um != null && bObj.d50Um !== '' ? bObj.d50Um : bObj.brew_grind_target_um)));
    if (gUm > 0){ aBrew.grindUm = gUm; aBrew.grind_um = gUm; }
    const gSet = bObj.grind_setting || bObj.grindSetting || (bObj.grinderSetting && typeof bObj.grinderSetting === 'object' ? (bObj.grinderSetting.shortDisplay || bObj.grinderSetting.label || bObj.grinderSetting.display || '') : (typeof bObj.grinderSetting === 'string' ? bObj.grinderSetting : '')) || bObj.brew_grind_setting || '';
    if (gSet) aBrew.grind_setting = unneutralize(gSet);
    if (bObj.style) aBrew.style = unneutralize(bObj.style);
    if (bObj.filter) aBrew.filter = unneutralize(bObj.filter);
    if (bObj.filterId) aBrew.filterId = String(bObj.filterId);
    if (bObj.grinderKey) aBrew.grinderKey = String(bObj.grinderKey);
    if (bObj.grinderName) aBrew.grinderName = unneutralize(bObj.grinderName);
    if (bObj.agitation && ['gentle', 'standard', 'active'].includes(bObj.agitation)) aBrew.agitation = bObj.agitation;
    if (bObj.technique) aBrew.technique = resolveTechCsv(bObj.technique) || bObj.technique;
    if (bObj.waterType) aBrew.waterType = String(bObj.waterType);
    if (bObj.pourNotes) aBrew.pourNotes = unneutralize(bObj.pourNotes);
    if (bObj.machineProfile && typeof bObj.machineProfile === 'object'){
      aBrew.machineProfile = _cloneObj(bObj.machineProfile);
    }
  }

  function _hydrateCoffeeIntoAppImpl(recOrCoffee, opts){
    opts = opts || {};
    let rec = recOrCoffee;
    if (typeof recOrCoffee === 'string'){
      const idx = _buildUnifiedCoffeesIndexImpl();
      rec = idx.find(r => r.coffee_id === recOrCoffee || r.key === recOrCoffee || r.name === recOrCoffee) || null;
    } else if (recOrCoffee && recOrCoffee.coffee_name !== undefined && recOrCoffee.lockedBrew === undefined){
      const idx = _buildUnifiedCoffeesIndexImpl();
      rec = idx.find(r => (recOrCoffee.coffee_id && r.coffee_id === recOrCoffee.coffee_id) || (r.name === unneutralize(recOrCoffee.coffee_name) && r.roaster === unneutralize(recOrCoffee.roaster || ''))) || {
        coffee_id:recOrCoffee.coffee_id || _newUid(),
        name:unneutralize(recOrCoffee.coffee_name || ''),
        roaster:unneutralize(recOrCoffee.roaster || ''),
        latestBrew:recOrCoffee,
        n_cups:1
      };
    }
    if (!rec) return null;

    const a = _getApp();
    const anchorRow = opts.anchorRow || rec.lockedBrew || rec.bestBrew || rec.latestBrew || null;
    const baseFromAnchor = anchorRow ? _populateCoffeeFromRowObj(anchorRow) : { coffee:(typeof newCoffee === 'function' ? newCoffee() : {}), adMeta:null };
    const c = baseFromAnchor.coffee;

    c.id = rec.coffee_id || rec.id || c.id || _newUid();
    const setIfMeaningful = (k, val, allowZero) => {
      if (_hasMeaningfulVal(val, allowZero)) c[k] = val;
    };
    setIfMeaningful('name', rec.name);
    setIfMeaningful('roaster', rec.roaster);
    setIfMeaningful('roaster_location', rec.roaster_location);
    setIfMeaningful('origin', rec.origin);
    setIfMeaningful('region', rec.region);
    if (_hasMeaningfulVal(rec.farm || rec.farm_or_station)){
      c.farm = rec.farm || rec.farm_or_station;
      c.farm_or_station = rec.farm_or_station || rec.farm;
    }
    setIfMeaningful('producer', rec.producer);
    setIfMeaningful('harvest_year', rec.harvest_year);
    setIfMeaningful('varietal', rec.varietal);
    setIfMeaningful('process', resolveProcess(rec.process) || rec.process);
    setIfMeaningful('process_sub', rec.process_sub);
    setIfMeaningful('process_details', rec.process_details);
    setIfMeaningful('roast', resolveRoast(rec.roast) || rec.roast);
    setIfMeaningful('blend', resolveBlend(rec.blend) || rec.blend);
    setIfMeaningful('species', rec.species);
    if (rec.decaf === 'yes' || rec.decaf === true) c.decaf = 'yes';
    setIfMeaningful('decaf_process', rec.decaf_process);
    setIfMeaningful('density', resolveDensity(rec.density, rec.elevation_m) || rec.density);
    if (rec.elevation_m != null && String(rec.elevation_m).trim() !== ''){
      c.elevation_m = String(rec.elevation_m).trim();
      c.elevText = rec.elevText || (c.elevation_m + ' masl');
    } else if (rec.elevText && !_isUnknownToken(rec.elevText)){
      c.elevText = String(rec.elevText);
    }
    const notesVal = String(rec.bag_notes || rec.notes || c.bag_notes || c.notes || '').trim();
    if (notesVal){
      c.bag_notes = notesVal;
      c.notes = notesVal;
    }
    if (Array.isArray(rec.flavors) && rec.flavors.length) c.flavors = rec.flavors.slice();
    setIfMeaningful('personal_note', rec.personal_note);
    if (rec.bag_weight_g != null && rec.bag_weight_g !== ''){
      c.bag_weight_g = rec.bag_weight_g;
      c.bagWeightG = rec.bag_weight_g;
    } else if (c.bag_weight_g != null && c.bag_weight_g !== ''){
      c.bagWeightG = c.bag_weight_g;
    }
    if (rec.remaining_g != null && rec.remaining_g !== '') c.remaining_g = rec.remaining_g;
    if (rec.price != null && rec.price !== ''){
      c.price = rec.price;
      c.bagPrice = rec.price;
    } else if (c.price != null && c.price !== ''){
      c.bagPrice = c.price;
    }
    setIfMeaningful('currency', rec.currency);
    if (rec.roasterGuide && typeof rec.roasterGuide === 'object') c.roasterGuide = _cloneObj(rec.roasterGuide);
    if (rec.recommended_rest_days != null && isFinite(+rec.recommended_rest_days)) c.recommended_rest_days = Math.round(+rec.recommended_rest_days);

    const bestRoastDate = (rec.openBag && _btValidIsoDateRef(rec.openBag.roast)) ? rec.openBag.roast : (rec.roast_date || c.roast_date || '');
    c.roast_date = bestRoastDate;
    c.is_frozen = rec.is_frozen || c.is_frozen || '';
    c.frozen_date = rec.frozen_date || c.frozen_date || '';
    c.freeze_days_offset = rec.freeze_days_offset || c.freeze_days_offset || '';
    if (rec.agtron !== '' && rec.agtron != null) c.agtron = String(rec.agtron);
    if (rec.bean_agtron !== '' && rec.bean_agtron != null) c.bean_agtron = String(rec.bean_agtron);
    if (rec.ground_agtron !== '' && rec.ground_agtron != null) c.ground_agtron = String(rec.ground_agtron);
    if (rec.agtron_scale) c.agtron_scale = rec.agtron_scale;
    if (rec.roast_delta !== '' && rec.roast_delta != null) c.roast_delta = String(rec.roast_delta);
    if (rec.psd_d10_um !== '' && rec.psd_d10_um != null) c.psd_d10_um = String(rec.psd_d10_um);
    if (rec.psd_d50_um !== '' && rec.psd_d50_um != null) c.psd_d50_um = String(rec.psd_d50_um);
    if (rec.psd_d90_um !== '' && rec.psd_d90_um != null) c.psd_d90_um = String(rec.psd_d90_um);
    if (rec.psd_span !== '' && rec.psd_span != null) c.psd_span = String(rec.psd_span);

    /* Clear bogus *Unsure flags whenever values exist, and mark answered */
    c.answered = 'yes';
    c.roasterUnsure = c.roaster ? '' : 'yes';
    c.roastUnsure = (c.roast && c.roast !== 'unknown') ? '' : 'yes';
    c.dateUnsure = (c.roast_date || c.is_frozen === 'yes') ? '' : 'yes';
    c.varietalUnsure = c.varietal ? '' : 'yes';
    c.originUnsure = (c.origin && c.origin !== 'unknown') ? '' : 'yes';
    c.processUnsure = (c.process && c.process !== 'unknown') ? '' : 'yes';
    c.elevUnsure = (c.elevation_m || (c.density && c.density !== 'unknown')) ? '' : 'yes';
    c.notesUnsure = c.bag_notes ? '' : 'yes';
    c.roast_unknown = c.roastUnsure;
    c.process_unknown = c.processUnsure;
    c.origin_unknown = c.originUnsure;
    c.elev_unknown = c.elevUnsure;
    c.date_unknown = c.dateUnsure;
    c.notes_unknown = c.notesUnsure;

    a.coffee = Object.assign(a.coffee || {}, c);
    a.attempt = rec.n_cups || 0;

    let methodKey = (opts.methodKey && resolveMethod(opts.methodKey)) || '';
    const isGoldenLocked = !!(anchorRow && _isGoldenLockedRow(anchorRow)) || !!(rec.dial_locked === 'yes' && !anchorRow);
    a.recipeLocked = isGoldenLocked;

    if (rec.lastBrew && typeof rec.lastBrew === 'object' && a.brew){
      if (!methodKey && rec.lastBrew.method) methodKey = resolveMethod(rec.lastBrew.method) || rec.lastBrew.method;
      _applyBrewSnapshotToApp(rec.lastBrew, a.brew);
    }
    if (anchorRow && a.brew){
      const rowMethod = resolveMethod(anchorRow.brew_method);
      if (!methodKey && rowMethod) methodKey = rowMethod;
      _applyBrewSnapshotToApp({
        method:methodKey || rowMethod,
        dose:anchorRow.brew_dose_g,
        water:anchorRow.brew_water_g,
        ratio:anchorRow.brew_ratio,
        tempF:anchorRow.brew_temp_f,
        tempC:anchorRow.brew_temp_c,
        style:anchorRow.brew_style,
        filter:anchorRow.brew_filter,
        grinderName:anchorRow.brew_grinder_name,
        agitation:anchorRow.brew_agitation,
        technique:anchorRow.brew_technique,
        waterType:anchorRow.brew_water_type,
        pourNotes:anchorRow.brew_pour_notes,
        grind_setting:anchorRow.brew_grind_setting,
        grindUm:anchorRow.brew_grind_target_um,
        machineProfile:(baseFromAnchor.adMeta && baseFromAnchor.adMeta.machine_profile) || null
      }, a.brew);
      if (rec.lastBrew && (!methodKey || !rec.lastBrew.method || resolveMethod(rec.lastBrew.method) === methodKey)){
        if (rec.lastBrew.filterId && !a.brew.filterId) a.brew.filterId = rec.lastBrew.filterId;
        if (rec.lastBrew.grinderKey && !a.brew.grinderKey) a.brew.grinderKey = rec.lastBrew.grinderKey;
        if (rec.lastBrew.pourNotes && !a.brew.pourNotes) a.brew.pourNotes = rec.lastBrew.pourNotes;
        if (rec.lastBrew.waterType && !a.brew.waterType) a.brew.waterType = rec.lastBrew.waterType;
      }
    } else if (!anchorRow && !rec.lastBrew && rec.openBag && a.brew){
      if (!methodKey && rec.lastMethod) methodKey = resolveMethod(rec.lastMethod) || rec.lastMethod;
      if (!methodKey && a.brew.method) methodKey = a.brew.method;
      if (methodKey) a.brew.method = methodKey;
      if (rec.openBag.total_g > 0 && !(a.brew.dose > 0)) a.brew.dose = 15;
    }

    /* Closed-Loop Rule: ONLY Golden-locked brews keep clicks fixed; unlocked brews apply next_recipe / BTCoreV6 solver */
    if (a.brew){
      delete a.brew.dialAdaptation;
      if (!isGoldenLocked){
        let adapted = null;
        const core = _g.BTCoreV6;
        const activeM = methodKey || a.brew.method || 'v60';
        const hAll = (historyState && Array.isArray(historyState.objs)) ? historyState.objs : (anchorRow ? [anchorRow] : []);
        const gearArg = Object.assign({}, (a.prefs && a.prefs.gear) || a.prefs || {}, {
          grinderKey:(a.brew && a.brew.grinderKey) || (a.prefs && a.prefs.gear && a.prefs.gear.grinder) || (a.prefs && a.prefs.grinder) || undefined,
          calib:(a.prefs && (a.prefs.pocketMicronCalib || a.prefs.calib)) || undefined,
          filterId:(a.brew && a.brew.filterId) || undefined,
          style:(a.brew && a.brew.style) || undefined
        });
        const adMetaNr = (baseFromAnchor.adMeta && baseFromAnchor.adMeta.next_recipe && typeof baseFromAnchor.adMeta.next_recipe === 'object') ? baseFromAnchor.adMeta.next_recipe : null;
        const recPendingNr = (rec.pendingNextRecipe && typeof rec.pendingNextRecipe === 'object') ? rec.pendingNextRecipe : null;
        const checkMatchesAnchor = (nr, da) => {
          if (!nr || typeof nr !== 'object') return false;
          const candFromId = nr.fromRowId || nr.fromId || (da && da.fromRowId) || '';
          const candFromTry = +(nr.fromTry || (da && da.fromTry) || 0);
          const anchorTry = +(anchorRow && anchorRow.brew_attempt || 0);
          const idOk = !candFromId || !anchorRow || !anchorRow.id || String(candFromId) === String(anchorRow.id);
          const tryOk = !candFromTry || !anchorTry || candFromTry >= anchorTry;
          const nextM = nr.method ? (resolveMethod(nr.method) || nr.method) : (nr.methodKey ? (resolveMethod(nr.methodKey) || nr.methodKey) : activeM);
          const methodOk = !activeM || !nextM || nextM === activeM;
          const hasTarget = (+(nr.d50Um || nr.grindUm || nr.grind_um || 0) > 0) || !!nr.grindSetting || (+nr.tempC > 0) || (+nr.ratio > 0);
          return idOk && tryOk && methodOk && hasTarget;
        };
        const persNr = checkMatchesAnchor(recPendingNr, rec.dialAdaptation) ? recPendingNr
          : (checkMatchesAnchor(adMetaNr, baseFromAnchor.adMeta && baseFromAnchor.adMeta.dial_adaptation) ? adMetaNr : null);

        let solverOut = null;
        if (core && typeof core.computeClosedLoopNextRecipe === 'function'){
          try {
            solverOut = core.computeClosedLoopNextRecipe(a.coffee, activeM, hAll, gearArg);
          } catch(e){}
        }

        if (persNr){
          adapted = persNr;
        } else if (solverOut && solverOut.dialAdaptation && (solverOut.dialAdaptation.adapted === true || solverOut.dialAdaptation.locked === true)){
          adapted = solverOut;
        }

        if (adapted && typeof adapted === 'object'){
          _applyBrewSnapshotToApp(adapted, a.brew);
          const daFromSolver = (solverOut && solverOut.dialAdaptation && (solverOut.dialAdaptation.adapted !== false || solverOut.dialAdaptation.locked === true)) ? solverOut.dialAdaptation : null;
          const daFromRec = (persNr === recPendingNr && rec.dialAdaptation && typeof rec.dialAdaptation === 'object') ? rec.dialAdaptation : null;
          const daFromMeta = (baseFromAnchor.adMeta && baseFromAnchor.adMeta.dial_adaptation && typeof baseFromAnchor.adMeta.dial_adaptation === 'object') ? baseFromAnchor.adMeta.dial_adaptation : null;
          const daSrc = adapted.dialAdaptation || daFromSolver || daFromRec || daFromMeta || null;
          if (daSrc && typeof daSrc === 'object'){
            if (daSrc.adapted !== false || daSrc.locked === true){
              const daClone = _cloneObj(daSrc);
              if (persNr){
                const pUm = +(persNr.d50Um || persNr.grindUm || persNr.grind_um || 0);
                if (pUm > 0) daClone.nextUm = pUm;
                if (persNr.grindSetting) daClone.nextClickDisplay = String(persNr.grindSetting);
                if (+persNr.tempC > 0) daClone.nextTempC = +persNr.tempC;
                if (+persNr.ratio > 0) daClone.nextRatio = +persNr.ratio;
              }
              a.brew.dialAdaptation = daClone;
            }
          } else if (adapted.adapted !== false){
            a.brew.dialAdaptation = _cloneObj(adapted);
          }
        }
      }
    }

    return { coffee:a.coffee, rec, anchorRow, baseFromAnchor, methodKey:methodKey || (a.brew && a.brew.method) || 'v60', isGoldenLocked };
  }

  function _selectSavedCoffeeImpl(recInput, opts){
    opts = opts || {};
    const hyd = _hydrateCoffeeIntoAppImpl(recInput, opts);
    if (!hyd) return null;

    const a = _getApp();
    const rec = hyd.rec;
    const anchorRow = hyd.anchorRow;
    const c = hyd.coffee;
    const methodKey = hyd.methodKey;

    let provenanceLabel = 'Loaded ' + (c.name || 'saved coffee');
    if (anchorRow){
      const mDef = _btAllMethods().find(m => m.key === methodKey);
      const mLabel = mDef ? mDef.label : (methodKey || 'Brew');
      const st = validStars(anchorRow.my_rating_stars);
      const scoreTxt = st > 0 ? (st + ' rating ') : (+anchorRow.total_score > 0 ? ((+anchorRow.total_score).toFixed(1) + ' pt ') : '');
      const tryTxt = +anchorRow.brew_attempt > 0 ? (' (Try #' + anchorRow.brew_attempt + ')') : '';
      if (hyd.isGoldenLocked || (rec.lockedBrew && anchorRow === rec.lockedBrew)){
        provenanceLabel = 'Loaded Locked ' + scoreTxt + mLabel + ' recipe' + tryTxt;
      } else if (a.brew && a.brew.dialAdaptation){
        provenanceLabel = 'Adapted ' + mLabel + ' recipe from Try #' + (anchorRow.brew_attempt || rec.n_cups || 1);
      } else if (rec.bestBrew && anchorRow === rec.bestBrew && (st > 0 || +anchorRow.total_score > 0)){
        provenanceLabel = 'Loaded Best ' + scoreTxt + mLabel + ' recipe' + tryTxt;
      } else {
        provenanceLabel = 'Loaded Latest ' + mLabel + ' recipe' + tryTxt;
      }
    } else if (rec.openBag){
      provenanceLabel = 'Loaded from Open Bag Shelf';
    }
    a.provenanceLabel = provenanceLabel;

    /* Zero Legacy Engine Handcuffs (#157): reset stale heuristic nudges and evaluate fresh through BTCoreV6 */
    if (a.adjust){ a.adjust.grind = 0; a.adjust.ratio = 0; a.adjust.agit = ''; }
    if (a.brew){
      delete a.brew.ey_model;
      a.brew.v6FreshEval = true;
      const freshSim = _evaluateFreshV6Physics(a.coffee, a.brew);
      if (freshSim) a.brew.v6SimPreview = freshSim;
    }
    if (_g.BTHaptics && typeof _g.BTHaptics.snap === 'function'){
      try { _g.BTHaptics.snap(); } catch(e){}
    }
    _resetCupState();
    _triggerScheduleDraft();
    if (!opts.silent) _triggerRender();
    return { coffee:a.coffee, anchorRow, methodKey:methodKey || (a.brew && a.brew.method) || 'v60', provenanceLabel };
  }

  function _applyFreshBagRoastDateImpl(recOrCoffee, isoRoastDate, bagOpts){
    bagOpts = bagOpts || {};
    const a = _getApp();
    let iso = String(isoRoastDate || '').trim();
    if (!iso || iso === 'today') iso = _todayIso();
    else if (/^-\d+d$/i.test(iso)){
      const daysAgo = parseInt(iso.slice(1), 10) || 0;
      const dt = new Date(Date.now() - daysAgo * 86400000);
      const p = n => String(n).padStart(2, '0');
      iso = dt.getFullYear() + '-' + p(dt.getMonth() + 1) + '-' + p(dt.getDate());
    }
    if (!_btValidIsoDateRef(iso)) return null;

    /* If passed a UnifiedCoffeeRecord that isn't currently loaded onto app.coffee, select it silently first */
    if (recOrCoffee && (recOrCoffee.lockedBrew !== undefined || recOrCoffee.latestBrew !== undefined || recOrCoffee.openBag !== undefined)){
      const curId = a.coffee && a.coffee.id;
      if (!curId || (recOrCoffee.coffee_id && curId !== recOrCoffee.coffee_id) || (recOrCoffee.name && a.coffee.name !== recOrCoffee.name)){
        _selectSavedCoffeeImpl(recOrCoffee, { silent:true });
      }
    }

    const targetCoffee = (recOrCoffee && recOrCoffee.lockedBrew === undefined && recOrCoffee.name !== undefined && recOrCoffee !== a.coffee)
      ? recOrCoffee
      : (a.coffee || {});

    /* Update ONLY fresh-bag batch roast date & freeze status; historical rows stay 100% untouched! */
    targetCoffee.roast_date = iso;
    targetCoffee.dateUnsure = '';
    if (bagOpts.freeze === true || bagOpts.is_frozen === 'yes'){
      targetCoffee.is_frozen = 'yes';
      targetCoffee.frozen_date = _btValidIsoDateRef(bagOpts.frozen_date) ? bagOpts.frozen_date : _todayIso();
      targetCoffee.freeze_days_offset = '0';
    } else {
      targetCoffee.is_frozen = '';
      targetCoffee.frozen_date = '';
      targetCoffee.freeze_days_offset = '';
    }
    if (a.coffee && targetCoffee !== a.coffee){
      Object.assign(a.coffee, {
        roast_date:targetCoffee.roast_date,
        dateUnsure:'',
        is_frozen:targetCoffee.is_frozen,
        frozen_date:targetCoffee.frozen_date,
        freeze_days_offset:targetCoffee.freeze_days_offset
      });
    }

    /* Update or create Living-Bag entry in Prices ledger if applicable (never mutating historical cuppings.csv rows) */
    const cName = targetCoffee.name || (recOrCoffee && recOrCoffee.name) || '';
    const cRoaster = targetCoffee.roaster || (recOrCoffee && recOrCoffee.roaster) || '';
    const cid = targetCoffee.id || (recOrCoffee && recOrCoffee.coffee_id) || '';
    if (cName){
      let openIdx = -1;
      for (let i = 0; i < prState.list.length; i++){
        const e = prState.list[i];
        if (!e || e.finished || e.kind === 'pods') continue;
        if ((cid && e.coffee_id === cid) || (_normKeyPart(e.coffee) === _normKeyPart(cName) && _normKeyPart(e.roaster) === _normKeyPart(cRoaster))){
          openIdx = i; break;
        }
      }
      const wantResetG = bagOpts.sizeG != null ? +bagOpts.sizeG : (bagOpts.rem_g != null ? +bagOpts.rem_g : null);
      let resetRemainingG = null;
      let resetTotalG = null;
      if (openIdx >= 0){
        const curBag = prState.list[openIdx];
        const totalG = wantResetG > 0 ? wantResetG : costGrams(curBag.size, curBag.unit);
        const patch = { roast:iso, finished:'' };
        if (bagOpts.resetBagGrams !== false && totalG > 0){
          patch.rem_g = Math.round(totalG * 10) / 10;
          resetRemainingG = patch.rem_g;
          resetTotalG = Math.round(totalG * 10) / 10;
        }
        if (wantResetG > 0 && curBag.unit === 'g') patch.size = wantResetG;
        const upd = priceSet(prState.list, openIdx, patch);
        if (upd.ok){ prState.list = upd.list; prState.changes++; _persistPrices(); targetCoffee.openBag = prState.list[openIdx]; }
      } else if (bagOpts.addToShelf || wantResetG > 0 || bagOpts.price > 0 || bagOpts.size > 0){
        /* Find most recent historical purchase for price/size defaults if user only tapped e.g. '250g' */
        const pastBags = priceHistoryOf(prState.list, { coffee:cName, roaster:cRoaster });
        const lastBag = pastBags.length ? pastBags[pastBags.length - 1] : null;
        const unit = bagOpts.unit || (wantResetG > 0 ? 'g' : (lastBag ? lastBag.unit : 'g'));
        const size = bagOpts.size > 0 ? +bagOpts.size : (wantResetG > 0 ? wantResetG : (lastBag ? lastBag.size : 250));
        const price = bagOpts.price > 0 ? +bagOpts.price : (lastBag ? lastBag.price : 20);
        const totalG = costGrams(size, unit);
        const added = priceAdd(prState.list, {
          kind:'bag',
          coffee:cName,
          roaster:cRoaster,
          coffee_id:cid,
          sym:bagOpts.sym || (lastBag && lastBag.sym) || '$',
          price,
          size,
          unit,
          rem_g:Math.round(totalG * 10) / 10,
          date:_todayIso(),
          roast:iso,
          rlevel:targetCoffee.roast || ''
        }, true);
        if (added.added){
          prState.list = added.list;
          prState.changes++;
          _persistPrices();
          targetCoffee.openBag = prState.list[prState.list.length - 1];
          resetRemainingG = Math.round(totalG * 10) / 10;
          resetTotalG = resetRemainingG;
        }
      } else if (bagOpts.resetBagGrams !== false){
        const fallbackTotal = wantResetG > 0 ? wantResetG : (+targetCoffee.bag_weight_g || (recOrCoffee && +recOrCoffee.bag_weight_g) || 0);
        if (fallbackTotal > 0){
          resetRemainingG = Math.round(fallbackTotal * 10) / 10;
          resetTotalG = resetRemainingG;
        }
      }
      if (resetRemainingG != null){
        targetCoffee.remaining_g = resetRemainingG;
        if (resetTotalG > 0){ targetCoffee.bag_weight_g = resetTotalG; targetCoffee.bagWeightG = resetTotalG; }
        if (a.coffee && targetCoffee !== a.coffee){
          a.coffee.remaining_g = resetRemainingG;
          if (resetTotalG > 0){ a.coffee.bag_weight_g = resetTotalG; a.coffee.bagWeightG = resetTotalG; }
          if (targetCoffee.openBag) a.coffee.openBag = targetCoffee.openBag;
        }
        const freshVaultPatch = {
          id:cid,
          coffee_id:cid,
          name:cName,
          roaster:cRoaster,
          roast_date:targetCoffee.roast_date,
          is_frozen:targetCoffee.is_frozen,
          frozen_date:targetCoffee.frozen_date,
          freeze_days_offset:targetCoffee.freeze_days_offset,
          remaining_g:resetRemainingG
        };
        if (resetTotalG > 0) freshVaultPatch.bag_weight_g = resetTotalG;
        _upsertCoffeeVaultRecordImpl(freshVaultPatch, null, { forceRemaining:true, allowClear:true });
      }
    }

    _unifiedIndexCache.key = '';
    saveDraftFromApp();
    _triggerScheduleDraft();
    if (!bagOpts.silent) _triggerRender();
    return targetCoffee;
  }

  /* ==========================================================================
     v6.5 PORTABLE 18-KEY FULL SAVE BUNDLE & BOOKMARKABLE WEB-ADDRESS ENGINE
     ========================================================================== */

  function _makeThenableResult(resObj){
    const plain = Object.assign({}, resObj);
    try {
      Object.defineProperty(resObj, 'then', {
        enumerable:false,
        configurable:true,
        value:function(onFulfilled, onRejected){
          return Promise.resolve(plain).then(onFulfilled, onRejected);
        }
      });
      Object.defineProperty(resObj, 'catch', {
        enumerable:false,
        configurable:true,
        value:function(onRejected){
          return Promise.resolve(plain).catch(onRejected);
        }
      });
    } catch(e){}
    return resObj;
  }

  async function _requestPersistentStorageImpl(){
    const hasApi = !!(typeof navigator !== 'undefined' && navigator && navigator.storage && typeof navigator.storage.persist === 'function');
    if (!hasApi){
      return { ok:true, persisted:false, supported:false, status:'unsupported' };
    }
    try {
      if (typeof navigator.storage.persisted === 'function'){
        storagePersisted = await navigator.storage.persisted();
      }
      if (!storagePersisted){
        storagePersisted = await navigator.storage.persist();
      }
      return {
        ok:true,
        persisted:!!storagePersisted,
        supported:true,
        status:storagePersisted ? 'persisted' : 'standard'
      };
    } catch(e){
      return { ok:false, persisted:!!storagePersisted, supported:true, status:'standard' };
    }
  }

  function _getPersistentStorageStatusImpl(){
    const hasApi = !!(typeof navigator !== 'undefined' && navigator && navigator.storage && typeof navigator.storage.persist === 'function');
    let ts = lastBackupMs || 0;
    if (!ts){
      try { ts = parseInt(localStorage.getItem(LASTBACKUP_LS_KEY), 10) || 0; } catch(e){}
    }
    return {
      persisted:storagePersisted === true,
      checked:storagePersisted !== null,
      supported:hasApi,
      lastBackupMs:ts
    };
  }

  function _parseCoffeesVaultArray(rawStr){
    if (!rawStr) return [];
    try {
      const p = typeof rawStr === 'string' ? JSON.parse(rawStr) : rawStr;
      const arr = Array.isArray(p) ? p : (p && Array.isArray(p.coffees) ? p.coffees : (p && Array.isArray(p.list) ? p.list : []));
      return arr.filter(x => x && typeof x === 'object' && !Array.isArray(x));
    } catch(e){ return []; }
  }

  function _summarizeKeysCounts(keysMap, extraMap){
    const km = keysMap || {};
    const xm = extraMap || {};
    let hObjs = [];
    if (km[HISTORY_LS_KEY]){
      const ex = readExisting(String(km[HISTORY_LS_KEY]));
      if (!ex.error) hObjs = rowsToObjects(ex);
    }
    let pList = [];
    if (km[PRICES_LS_KEY]){
      const pr = _parsePricesAnyFormat(km[PRICES_LS_KEY]);
      if (!pr.error) pList = pr.list;
    }
    const unified = _buildUnifiedCoffeesIndexImpl(hObjs, pList);
    const seenCoffeeNorm = new Set(unified.map(u => u.normKey || (_normKeyPart(u.name) + '|' + _normKeyPart(u.roaster))));
    const extraCoffees = _parseCoffeesVaultArray(xm[EXTRA_VAULT_COFFEES_KEY] || km[EXTRA_VAULT_COFFEES_KEY]);
    extraCoffees.forEach(c => {
      const nm = _normKeyPart(c.name || c.coffee || c.coffee_name || '');
      const rs = _normKeyPart(c.roaster || '');
      if (nm) seenCoffeeNorm.add(nm + '|' + rs);
    });
    let hasPrefs = false;
    if (km[DRAFT_LS_KEY]){
      try {
        const d = JSON.parse(String(km[DRAFT_LS_KEY]));
        if (d && d.app){
          if (d.app.coffee && d.app.coffee.name){
            const dnm = _normKeyPart(d.app.coffee.name);
            const drs = _normKeyPart(d.app.coffee.roaster || '');
            if (dnm) seenCoffeeNorm.add(dnm + '|' + drs);
          }
          if (d.app.prefs && !prefsIsDefault(d.app.prefs)) hasPrefs = true;
        }
      } catch(e){}
    }
    if (!hasPrefs && km[PREFS_MIRROR_LS_KEY]){
      try {
        const pm = JSON.parse(String(km[PREFS_MIRROR_LS_KEY]));
        if (pm && !prefsIsDefault(pm)) hasPrefs = true;
      } catch(e){}
    }
    let goldCount = 0;
    for (let i = 0; i < hObjs.length; i++){
      const dl = String((hObjs[i] && hObjs[i].dial_locked) || '').trim().toLowerCase();
      if (dl === 'yes' || dl === '1') goldCount++;
    }
    let cafeCount = 0;
    if (km[SHOPS_LS_KEY]){
      const sr = shopRead(String(km[SHOPS_LS_KEY]));
      if (!sr.error && sr.store && Array.isArray(sr.store.drinks)) cafeCount = sr.store.drinks.length;
    }
    return {
      coffeeCount:seenCoffeeNorm.size,
      brewCount:hObjs.length,
      goldCount,
      cafeCount,
      hasPrefs
    };
  }

  function _exportFullSaveBundleImpl(opts){
    opts = opts || {};
    const a = _getApp();
    const st = _getState();
    try {
      if (_g.BTShell && typeof _g.BTShell.flushDraft === 'function' && (
        (a && a.coffee && a.coffee.name) ||
        (a && a.prefs && !prefsIsDefault(a.prefs)) ||
        localStorage.getItem(DRAFT_LS_KEY) !== null
      )){
        _g.BTShell.flushDraft();
      }
    } catch(e){}

    const keys = {};
    ALL_18_LS_KEYS.forEach(k => {
      let val = null;
      try { val = localStorage.getItem(k); } catch(e){ val = null; }
      keys[k] = val !== null ? String(val) : null;
    });

    /* Overlay live in-memory stores if not yet flushed to localStorage */
    if (!keys[HISTORY_LS_KEY] && historyState && historyState.text){
      keys[HISTORY_LS_KEY] = historyState.text;
    }
    if (!keys[PRICES_LS_KEY] && prState.list && prState.list.length > 0){
      keys[PRICES_LS_KEY] = priceCsv(prState.list);
    }
    if (!keys[SHOPS_LS_KEY] && !_shEmpty()){
      keys[SHOPS_LS_KEY] = shopCsv(shState.store);
    }
    if (a && a.prefs && (!prefsIsDefault(a.prefs) || keys[PREFS_MIRROR_LS_KEY] !== null)){
      const cleanP = cleanFullPrefs(a.prefs);
      if (a.prefs.experienceLens) cleanP.experienceLens = a.prefs.experienceLens;
      if (a.prefs.timerAudioMode) cleanP.timerAudioMode = a.prefs.timerAudioMode;
      keys[PREFS_MIRROR_LS_KEY] = JSON.stringify(cleanP);
    }
    if ((a && a.coffee && a.coffee.name) || (a && a.prefs && !prefsIsDefault(a.prefs)) || keys[DRAFT_LS_KEY] !== null){
      try {
        const safeApp = Object.assign({}, a);
        if (safeApp.prefs){
          const cp = cleanFullPrefs(safeApp.prefs);
          if (safeApp.prefs.experienceLens) cp.experienceLens = safeApp.prefs.experienceLens;
          if (safeApp.prefs.timerAudioMode) cp.timerAudioMode = safeApp.prefs.timerAudioMode;
          safeApp.prefs = cp;
        }
        keys[DRAFT_LS_KEY] = JSON.stringify({ app:safeApp, state:st, at:Date.now() });
      } catch(e){}
    }

    const extraKeys = {};
    [EXTRA_VAULT_COFFEES_KEY, EXTRA_AROMA_KIT_KEY].forEach(xk => {
      try {
        const xv = localStorage.getItem(xk);
        if (xv !== null && xv !== '') extraKeys[xk] = String(xv);
      } catch(e){}
    });

    const counts = _summarizeKeysCounts(keys, extraKeys);
    const out = {
      schema:'beantelligence-save-v6',
      version:6,
      exportedAt:new Date().toISOString(),
      coffeeCount:counts.coffeeCount,
      brewCount:counts.brewCount,
      goldCount:counts.goldCount,
      cafeCount:counts.cafeCount,
      hasPrefs:counts.hasPrefs,
      keys
    };
    if (Object.keys(extraKeys).length) out.extraKeys = extraKeys;
    return out;
  }

  function _downloadFullSaveFileImpl(){
    const bundle = _exportFullSaveBundleImpl();
    const filename = 'BeanTelligence_Save_' + _todayIso() + '.json';
    const text = JSON.stringify(bundle, null, 2);
    _downloadText(text, filename, 'application/json;charset=utf-8');
    _noteBackup();
    return {
      ok:true,
      filename,
      bundle,
      text,
      coffeeCount:bundle.coffeeCount,
      brewCount:bundle.brewCount
    };
  }

  function _downloadHistoryCsvFileImpl(){
    let csv = (historyState && historyState.text) || '';
    if (!csv){
      try { csv = localStorage.getItem(HISTORY_LS_KEY) || ''; } catch(e){}
    }
    if (!csv){
      csv = (typeof COLUMNS !== 'undefined' && Array.isArray(COLUMNS) ? COLUMNS.join(',') : 'schema_version,id,coffee_name,brew_method,my_rating_stars') + '\n';
    }
    const filename = 'BeanTelligence_Brew_History_' + _todayIso() + '.csv';
    _downloadText(csv, filename, 'text/csv;charset=utf-8');
    _noteBackup();
    return {
      ok:true,
      filename,
      csv,
      brewCount:historyState && historyState.objs ? historyState.objs.length : 0
    };
  }

  function _resolveWebSaveBaseUrl(){
    try {
      if (typeof location !== 'undefined' && location){
        if (location.origin && location.origin !== 'null'){
          return location.origin + (location.pathname || '/');
        }
        if (location.href){
          return String(location.href).split('#')[0];
        }
      }
    } catch(e){}
    return 'https://mshaffe1111.github.io/Neurobrew/';
  }

  function _packWireFromBundle(bundleInput){
    const b = (bundleInput && typeof bundleInput === 'object' && bundleInput.keys) ? bundleInput : _exportFullSaveBundleImpl();
    const compactKeys = {};
    ALL_18_LS_KEYS.forEach(k => {
      if (k === SNAPSHOT_DATA_LS_KEY || k === SNAPSHOT_META_LS_KEY || k === DIFLUID_AUTH_LS_KEY) return;
      const v = b.keys && b.keys[k];
      if (v !== null && v !== undefined && v !== '') compactKeys[k] = String(v);
    });
    const compactExtra = {};
    if (b.extraKeys && typeof b.extraKeys === 'object'){
      Object.keys(b.extraKeys).forEach(xk => {
        if (/auth|apikey|secret|token/i.test(xk)) return;
        const xv = b.extraKeys[xk];
        if (xv !== null && xv !== undefined && xv !== '') compactExtra[xk] = String(xv);
      });
    }
    const wire = {
      s:'beantelligence-save-v6',
      t:b.exportedAt || new Date().toISOString(),
      k:compactKeys
    };
    if (Object.keys(compactExtra).length) wire.x = compactExtra;
    return wire;
  }

  function _unpackWireToBundle(parsed){
    if (!parsed || typeof parsed !== 'object') return null;
    const srcKeys = (parsed.keys && typeof parsed.keys === 'object') ? parsed.keys : ((parsed.k && typeof parsed.k === 'object') ? parsed.k : null);
    if (!srcKeys) return null;
    const fullKeys = {};
    ALL_18_LS_KEYS.forEach(k => {
      const v = srcKeys[k];
      fullKeys[k] = (v !== null && v !== undefined && v !== '') ? String(v) : null;
    });
    const extraKeys = {};
    const srcExtra = parsed.extraKeys || parsed.x || {};
    [EXTRA_VAULT_COFFEES_KEY, EXTRA_AROMA_KIT_KEY].forEach(xk => {
      const xv = srcExtra[xk] != null ? srcExtra[xk] : srcKeys[xk];
      if (xv !== null && xv !== undefined && xv !== '') extraKeys[xk] = String(xv);
    });
    const counts = _summarizeKeysCounts(fullKeys, extraKeys);
    const out = {
      schema:'beantelligence-save-v6',
      version:6,
      exportedAt:String(parsed.exportedAt || parsed.t || new Date().toISOString()),
      coffeeCount:counts.coffeeCount,
      brewCount:counts.brewCount,
      goldCount:counts.goldCount,
      cafeCount:counts.cafeCount,
      hasPrefs:counts.hasPrefs,
      keys:fullKeys
    };
    if (Object.keys(extraKeys).length) out.extraKeys = extraKeys;
    return out;
  }

  function _extractWebSaveToken(urlOrCode){
    let s = String(urlOrCode == null ? '' : urlOrCode).trim();
    if (!s) return '';
    const mHash = /(?:[#?&]|^)(?:btsave|btsave_v6)=([A-Za-z0-9._~%-]+)/i.exec(s);
    if (mHash && mHash[1]){
      s = mHash[1];
    } else if (/^btsave:/i.test(s)){
      s = s.slice(7).trim();
    }
    if (s.indexOf('%') >= 0){
      try { s = decodeURIComponent(s); } catch(e){}
    }
    s = s.replace(/[\s"'<>]+/g, '');
    if (/^[zj]\.[A-Za-z0-9+/=_-]+$/.test(s)) return s;
    return '';
  }

  function _inflateRawDeflateSync(rawDeflateBytes){
    if (typeof _btPureGzipDecompress !== 'function') throw new Error('no-sync-inflate');
    const wrapped = new Uint8Array(10 + rawDeflateBytes.length + 8);
    wrapped[0] = 0x1f; wrapped[1] = 0x8b; wrapped[2] = 0x08;
    wrapped.set(rawDeflateBytes, 10);
    return _btPureGzipDecompress(wrapped, 30000000);
  }

  function _decodeWebSaveSync(urlOrCode){
    const tok = _extractWebSaveToken(urlOrCode);
    if (!tok) return null;
    const prefix = tok.slice(0, 2);
    const b64Body = tok.slice(2);
    const rawBytes = bkB64Decode(b64Body);
    let jsonStr = '';
    if (prefix === 'j.'){
      jsonStr = _btUtf8Decode(rawBytes);
    } else if (prefix === 'z.'){
      const inflated = _inflateRawDeflateSync(rawBytes);
      jsonStr = _btUtf8Decode(inflated);
    } else {
      return null;
    }
    const parsed = JSON.parse(jsonStr);
    return _unpackWireToBundle(parsed);
  }

  function _buildWebSaveUrlSync(optionalBundle){
    const wire = _packWireFromBundle(optionalBundle);
    const jsonBytes = _utf8Bytes(JSON.stringify(wire));
    return _resolveWebSaveBaseUrl() + '#btsave=j.' + bkB64Encode(jsonBytes);
  }

  async function _buildWebSaveUrlImpl(optionalBundle){
    const wire = _packWireFromBundle(optionalBundle);
    const jsonBytes = _utf8Bytes(JSON.stringify(wire));
    let payload = '';
    if (typeof CompressionStream === 'function'){
      try {
        const deflated = await bkPipe(jsonBytes, new CompressionStream('deflate-raw'));
        if (deflated && deflated.length > 0 && deflated.length < jsonBytes.length){
          payload = 'z.' + bkB64Encode(deflated);
        }
      } catch(e){
        payload = '';
      }
    }
    if (!payload){
      payload = 'j.' + bkB64Encode(jsonBytes);
    }
    return _resolveWebSaveBaseUrl() + '#btsave=' + payload;
  }

  async function _decodeWebSaveUrlImpl(urlOrCode){
    if (urlOrCode && typeof urlOrCode === 'object' && urlOrCode.keys){
      return _unpackWireToBundle(urlOrCode);
    }
    const tok = _extractWebSaveToken(urlOrCode);
    if (!tok) throw new Error('No valid #btsave=... link or save code found.');
    const prefix = tok.slice(0, 2);
    const compBytes = bkB64Decode(tok.slice(2));
    let utf8BytesOut = null;
    if (prefix === 'j.'){
      utf8BytesOut = compBytes;
    } else if (prefix === 'z.'){
      if (typeof DecompressionStream === 'function'){
        try {
          utf8BytesOut = await bkPipeLimit(compBytes, new DecompressionStream('deflate-raw'), 30000000);
        } catch(e){
          utf8BytesOut = null;
        }
      }
      if (!utf8BytesOut){
        utf8BytesOut = _inflateRawDeflateSync(compBytes);
      }
    } else {
      throw new Error('Unsupported web save prefix.');
    }
    const parsed = JSON.parse(_btUtf8Decode(utf8BytesOut));
    const bundle = _unpackWireToBundle(parsed);
    if (!bundle) throw new Error('Save link decoded, but did not contain valid BeanTelligence data.');
    return bundle;
  }

  async function _copyTextUniversal(str){
    let syncCopied = false;
    if (typeof document !== 'undefined' && document.body){
      try {
        const ta = document.createElement('textarea');
        ta.value = str;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;font-size:16px;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        syncCopied = !!(document.execCommand && document.execCommand('copy'));
        document.body.removeChild(ta);
      } catch(e){}
    }
    const raceTimeout = (p, ms) => new Promise(resolve => {
      let done = false;
      const tm = setTimeout(() => { if (!done){ done = true; resolve(false); } }, ms || 50);
      Promise.resolve(p).then(v => {
        if (!done){ done = true; clearTimeout(tm); resolve(v !== false); }
      }).catch(() => {
        if (!done){ done = true; clearTimeout(tm); resolve(false); }
      });
    });
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function'){
      const asyncOk = await raceTimeout(navigator.clipboard.writeText(str), 50);
      if (asyncOk) return true;
    } else if (_g.BTPlatform && _g.BTPlatform.clipboard && typeof _g.BTPlatform.clipboard.writeText === 'function'){
      const platOk = await raceTimeout(_g.BTPlatform.clipboard.writeText(str), 50);
      if (platOk) return true;
    }
    return syncCopied;
  }

  async function _applySaveToBrowserAddressBarImpl(){
    const webUrl = await _buildWebSaveUrlImpl();
    const hashIdx = webUrl.indexOf('#');
    const hashPart = hashIdx >= 0 ? webUrl.slice(hashIdx) : '';
    _g.__btSelfAppliedSaveHash = hashPart;
    let updatedBar = false;
    try {
      if (typeof history !== 'undefined' && history && typeof history.replaceState === 'function'){
        history.replaceState(null, '', webUrl);
        updatedBar = true;
      } else if (typeof location !== 'undefined' && hashPart){
        location.hash = hashPart;
        updatedBar = true;
      }
    } catch(e){
      try {
        if (typeof history !== 'undefined' && history && typeof history.replaceState === 'function' && hashPart){
          history.replaceState(null, '', hashPart);
          updatedBar = true;
        } else if (typeof location !== 'undefined' && hashPart){
          location.hash = hashPart;
          updatedBar = true;
        }
      } catch(e2){}
    }
    const copied = await _copyTextUniversal(webUrl);
    _noteBackup();
    return {
      ok:true,
      url:webUrl,
      hash:hashPart,
      updatedBar,
      copied,
      length:webUrl.length
    };
  }

  function _capturePreImportVaultSnapshot(){
    try {
      const snapKeys = {}, snapCrcs = {};
      ALL_18_LS_KEYS.concat([EXTRA_VAULT_COFFEES_KEY, EXTRA_AROMA_KIT_KEY]).forEach(k => {
        let v = null;
        try { v = localStorage.getItem(k); } catch(e){ v = null; }
        if (v !== null && v !== ''){
          snapKeys[k] = v;
          snapCrcs[k] = bkCrc32(_utf8Bytes(v));
        }
      });
      if (Object.keys(snapKeys).length > 0){
        const payloadObj = {
          v:1,
          schema:'6.0',
          vaultKey:'pre-import-safety',
          createdAt:new Date().toISOString(),
          keys:snapKeys,
          crcs:snapCrcs
        };
        const vp = _vaultPut('pre-import-safety', payloadObj);
        if (vp && typeof vp.catch === 'function') vp.catch(() => {});
        _ensurePreMigrationSnapshotImpl({ targetSchema:'6.0', forceManual:true });
      }
    } catch(e){}
  }

  function _rowDedupSignature(r){
    if (!r || typeof r !== 'object') return '';
    const cn = _normKeyPart(r.coffee_name || '');
    const bm = (typeof resolveMethod === 'function' ? resolveMethod(r.brew_method) : '') || String(r.brew_method || '').trim().toLowerCase();
    const savedTs = String(r.saved_at || r.timestamp || '').trim().toLowerCase();
    if (savedTs && cn) return 'ts:' + savedTs + '|' + cn + '|' + bm;
    const cupDate = String(r.cupping_date || '').trim().toLowerCase();
    if (cupDate && cn) return 'dt:' + cupDate + '|try:' + String(r.brew_attempt || '') + '|' + cn + '|' + bm;
    return '';
  }

  function _mergePriceBagsNonDestructive(curList, incomingList){
    const merged = Array.isArray(curList) ? curList.slice() : [];
    let added = 0;
    const seenKeys = new Set(merged.map(priceKey));
    const findOpenMatchIdx = cand => {
      const cId = String(cand.coffee_id || '').trim();
      const cNorm = _normKeyPart(cand.coffee) + '|' + _normKeyPart(cand.roaster);
      for (let i = 0; i < merged.length; i++){
        const m = merged[i];
        if (!m) continue;
        if (cId && m.coffee_id && m.coffee_id === cId && (m.date || '') === (cand.date || '') && (m.roast || '') === (cand.roast || '')) return i;
        if (!m.finished && !cand.finished && (_normKeyPart(m.coffee) + '|' + _normKeyPart(m.roaster)) === cNorm && (m.roast || '') === (cand.roast || '')) return i;
      }
      return -1;
    };
    (incomingList || []).forEach(rawItem => {
      const e = priceEntry(rawItem);
      if (!e) return;
      const pk = priceKey(e);
      if (seenKeys.has(pk)) return;
      const matchIdx = findOpenMatchIdx(e);
      if (matchIdx >= 0){
        const cur = merged[matchIdx];
        merged[matchIdx] = Object.assign({}, e, cur, {
          coffee_id:cur.coffee_id || e.coffee_id || '',
          rlevel:cur.rlevel || e.rlevel || '',
          roast:cur.roast || e.roast || '',
          is_frozen:cur.is_frozen || e.is_frozen || '',
          frozen_date:cur.frozen_date || e.frozen_date || '',
          tubes_json:cur.tubes_json || e.tubes_json || ''
        });
        return;
      }
      if (merged.length < PRICE_MAX_ROWS){
        merged.push(e);
        seenKeys.add(pk);
        added++;
      }
    });
    return { list:merged, added };
  }

  function _normalizeIncomingSaveToBundleSync(inputStrOrObj){
    if (inputStrOrObj == null) return { error:'Empty save input.' };

    /* 1. Object input */
    if (typeof inputStrOrObj === 'object'){
      if (Array.isArray(inputStrOrObj)){
        const csvArr = objectsToHistoryCsv(inputStrOrObj);
        if (!csvArr) return { error:'No valid brew rows found in JSON array.' };
        return { bundle:_unpackWireToBundle({ keys:{ [HISTORY_LS_KEY]:csvArr } }) };
      }
      if (inputStrOrObj.keys && typeof inputStrOrObj.keys === 'object'){
        const b = _unpackWireToBundle(inputStrOrObj);
        if (b) return { bundle:b };
      }
      if (inputStrOrObj.k && typeof inputStrOrObj.k === 'object'){
        const b2 = _unpackWireToBundle(inputStrOrObj);
        if (b2) return { bundle:b2 };
      }
      if (inputStrOrObj.format === 'beantelligence-backup' || inputStrOrObj.historyCsv || inputStrOrObj.pricesCsv || inputStrOrObj.shopsCsv || inputStrOrObj.prefs || inputStrOrObj.academy || inputStrOrObj.coffeesVault || inputStrOrObj[EXTRA_VAULT_COFFEES_KEY]){
        const kMap = {};
        if (typeof inputStrOrObj.historyCsv === 'string' && inputStrOrObj.historyCsv.trim()) kMap[HISTORY_LS_KEY] = inputStrOrObj.historyCsv;
        else if (Array.isArray(inputStrOrObj.history)){
          const hc = objectsToHistoryCsv(inputStrOrObj.history);
          if (hc) kMap[HISTORY_LS_KEY] = hc;
        }
        if (typeof inputStrOrObj.pricesCsv === 'string' && inputStrOrObj.pricesCsv.trim()) kMap[PRICES_LS_KEY] = inputStrOrObj.pricesCsv;
        if (typeof inputStrOrObj.shopsCsv === 'string' && inputStrOrObj.shopsCsv.trim()) kMap[SHOPS_LS_KEY] = inputStrOrObj.shopsCsv;
        if (inputStrOrObj.prefs && typeof inputStrOrObj.prefs === 'object') kMap[PREFS_MIRROR_LS_KEY] = JSON.stringify(cleanFullPrefs(inputStrOrObj.prefs));
        if (inputStrOrObj.academy && typeof inputStrOrObj.academy === 'object') kMap[ACADEMY_LS_KEY] = JSON.stringify(inputStrOrObj.academy);
        const exMap = {};
        const cvRaw = inputStrOrObj[EXTRA_VAULT_COFFEES_KEY] != null ? inputStrOrObj[EXTRA_VAULT_COFFEES_KEY] : (inputStrOrObj.coffeesVault != null ? inputStrOrObj.coffeesVault : (inputStrOrObj.extraKeys && inputStrOrObj.extraKeys[EXTRA_VAULT_COFFEES_KEY]));
        if (cvRaw != null && cvRaw !== ''){
          exMap[EXTRA_VAULT_COFFEES_KEY] = typeof cvRaw === 'string' ? cvRaw : JSON.stringify(cvRaw);
        }
        if (inputStrOrObj.extraKeys && inputStrOrObj.extraKeys[EXTRA_AROMA_KIT_KEY] != null){
          exMap[EXTRA_AROMA_KIT_KEY] = String(inputStrOrObj.extraKeys[EXTRA_AROMA_KIT_KEY]);
        }
        return { bundle:_unpackWireToBundle({ exportedAt:inputStrOrObj.madeAt || '', keys:kMap, extraKeys:exMap }) };
      }
      return { error:'Unrecognized save object format.' };
    }

    /* 2. String input: #btsave URL/code, .json, .csv, or #BEANTELLIGENCE-PARTS / NB1.z */
    const txt = String(inputStrOrObj).replace(/^\uFEFF/, '').trim();
    if (!txt) return { error:'Empty save file or link.' };

    /* 2a. Web-Address #btsave=... URL or btsave: / z. / j. code */
    if (_extractWebSaveToken(txt)){
      try {
        const bUrl = _decodeWebSaveSync(txt);
        if (bUrl) return { bundle:bUrl };
      } catch(e){
        return { needsAsyncUrlDecode:true, rawText:txt };
      }
    }

    /* 2b. JSON Save Bundle / Backup File */
    if (txt[0] === '{' || txt[0] === '['){
      try {
        const obj = JSON.parse(txt);
        return _normalizeIncomingSaveToBundleSync(obj);
      } catch(e){
        return { error:'Invalid JSON file: ' + (e && e.message ? e.message : 'syntax error') };
      }
    }

    /* 2c. Multi-Part #BEANTELLIGENCE-PARTS 1 or BEGIN BEANTELLIGENCE BACKUP (NB1.z) */
    if (/^#(?:BEANTELLIGENCE|NEUROBREW)-PARTS 1/i.test(txt) || /BEGIN (?:BEANTELLIGENCE|NEUROBREW) BACKUP/i.test(txt)){
      let pk = bkpUnpack(txt);
      let singleCsv = '';
      if (!pk && typeof readBackupCodeSync === 'function'){
        const rb = readBackupCodeSync(txt);
        if (!rb.error){
          if (rb.parts) pk = rb.parts;
          else if (rb.csv) singleCsv = rb.csv;
        }
      }
      if (pk && pk.parts){
        const kMap = {};
        if (pk.parts.history && pk.parts.history.ok) kMap[HISTORY_LS_KEY] = pk.parts.history.text;
        if (pk.parts.prices && pk.parts.prices.ok) kMap[PRICES_LS_KEY] = pk.parts.prices.text;
        if (pk.parts.shops && pk.parts.shops.ok) kMap[SHOPS_LS_KEY] = pk.parts.shops.text;
        if (pk.parts.prefs && pk.parts.prefs.ok){
          try {
            const po = JSON.parse(pk.parts.prefs.text);
            if (po && po.prefs) kMap[PREFS_MIRROR_LS_KEY] = JSON.stringify(cleanFullPrefs(po.prefs));
          } catch(e){}
        }
        if (pk.parts.academy && pk.parts.academy.ok) kMap[ACADEMY_LS_KEY] = pk.parts.academy.text;
        return { bundle:_unpackWireToBundle({ exportedAt:pk.made || '', keys:kMap }) };
      }
      if (singleCsv){
        return { bundle:_unpackWireToBundle({ keys:{ [HISTORY_LS_KEY]:singleCsv } }) };
      }
    }

    /* 2d. Raw 129-Column (or multi-era) Brew History CSV */
    const exHist = readExisting(txt);
    if (!exHist.error){
      return { bundle:_unpackWireToBundle({ keys:{ [HISTORY_LS_KEY]:txt } }) };
    }

    /* 2e. Prices CSV or Shops CSV */
    const prTry = priceRead(txt);
    if (!prTry.error && Array.isArray(prTry.list)){
      return { bundle:_unpackWireToBundle({ keys:{ [PRICES_LS_KEY]:txt } }) };
    }
    const shTry = shopRead(txt);
    if (!shTry.error && shTry.store){
      return { bundle:_unpackWireToBundle({ keys:{ [SHOPS_LS_KEY]:txt } }) };
    }

    return { error:'Unrecognized file or code. Choose a BeanTelligence Save (.json), Brew History (.csv), or #btsave=... web link.' };
  }

  function _refreshLiveUiAfterImport(opts){
    opts = opts || {};
    _bumpHistoryRev();
    _unifiedIndexCache.key = '';
    try {
      if (_g.BTShell){
        if (typeof _g.BTShell.loadShopDraft === 'function') _g.BTShell.loadShopDraft();
        if (typeof _g.BTShell.applyTheme === 'function'){
          const th = (_getApp().prefs && _getApp().prefs.theme) || 'light';
          _g.BTShell.applyTheme(th);
        }
        if (typeof _g.BTShell.paintChrome === 'function') _g.BTShell.paintChrome();
        if (typeof _g.BTShell.render === 'function') _g.BTShell.render();
        if (typeof _g.BTShell.refreshAll === 'function') _g.BTShell.refreshAll();
        if (typeof _g.BTShell.paintStudioAside === 'function') _g.BTShell.paintStudioAside();
      } else {
        _triggerRender();
      }
    } catch(e){ _triggerRender(); }
    if (opts.reloadPage === true && typeof location !== 'undefined' && typeof location.reload === 'function'){
      try { location.reload(); } catch(e){}
    }
  }

  function _coffeeVaultObjToPriceCandidate(c){
    if (!c || typeof c !== 'object') return null;
    return Object.assign({}, c, {
      kind:c.kind || 'bag',
      coffee:c.coffee || c.name || c.coffee_name || '',
      roaster:c.roaster || '',
      coffee_id:c.coffee_id || c.id || '',
      sym:c.sym || c.currency || '$',
      price:(+c.price > 0) ? +c.price : 20,
      size:(+c.size > 0) ? +c.size : ((+c.grams > 0) ? +c.grams : 250),
      unit:c.unit || 'g',
      date:c.date || _todayIso(),
      roast:c.roast || c.roast_date || '',
      rlevel:c.rlevel || c.roast_level || ''
    });
  }

  function _executeBundleImportSync(bundle, opts){
    opts = opts || {};
    const mode = opts.mode === 'replace' ? 'replace' : 'merge';
    const km = (bundle && bundle.keys) || {};
    const xm = (bundle && bundle.extraKeys) || {};

    _capturePreImportVaultSnapshot();

    let brewsImported = 0;
    let coffeesImported = 0;

    if (mode === 'replace'){
      /* Cleanly replace data keys while keeping safety snapshot metadata intact */
      const preserveOnNull = new Set([SNAPSHOT_DATA_LS_KEY, SNAPSHOT_META_LS_KEY]);
      ALL_18_LS_KEYS.forEach(k => {
        const v = km[k];
        try {
          if (v !== null && v !== undefined && v !== ''){
            localStorage.setItem(k, String(v));
          } else if (!preserveOnNull.has(k)){
            localStorage.removeItem(k);
          }
        } catch(e){}
      });
      [EXTRA_VAULT_COFFEES_KEY, EXTRA_AROMA_KIT_KEY].forEach(xk => {
        const xv = xm[xk] != null ? xm[xk] : km[xk];
        try {
          if (xv !== null && xv !== undefined && xv !== '') localStorage.setItem(xk, String(xv));
          else localStorage.removeItem(xk);
        } catch(e){}
      });
      _coffeesVaultCache.raw = null;
      _coffeesVaultCache.list = [];
      _vaultRev++;

      /* Reset live in-memory state cleanly before re-hydrating */
      historyState = null;
      prState.list = []; prState.changes = 0;
      shState = { store:shopStore(), changes:0, failed:false, msg:'', q:'', tab:'drinks' };
      sdState = _sdBlank();

      const a = _getApp();
      a.prefs = cleanFullPrefs(null);
      if (a.coffee){
        Object.keys(a.coffee).forEach(ck => { a.coffee[ck] = ''; });
        a.coffee.id = _newUid();
        a.coffee.species = 'arabica';
        a.coffee.agtron_scale = 'gourmet';
      }
      _resetCupState();

      _loadHistoryImpl();
      _loadPricesImpl();
      /* Fold any extra brew-and-cup-coffees-v1 bags into prState if present */
      const extraBagsReplace = _parseCoffeesVaultArray(xm[EXTRA_VAULT_COFFEES_KEY] || km[EXTRA_VAULT_COFFEES_KEY]);
      if (extraBagsReplace.length){
        const folded = _mergePriceBagsNonDestructive(prState.list, extraBagsReplace.map(_coffeeVaultObjToPriceCandidate).filter(Boolean));
        if (folded.added > 0){ prState.list = folded.list; _persistPrices(); }
      }
      _loadShopsImpl();
      _loadShopDraftImpl();
      loadDraftIntoApp();

      /* Apply preferences from mirror, draft, or newest history row setup_json */
      let appliedP = false;
      if (km[PREFS_MIRROR_LS_KEY]){
        try { const pm = JSON.parse(km[PREFS_MIRROR_LS_KEY]); if (pm && typeof pm === 'object') appliedP = applyFullPrefs(pm); } catch(e){}
      }
      if (!appliedP && km[DRAFT_LS_KEY]){
        try { const d = JSON.parse(km[DRAFT_LS_KEY]); if (d && d.app && d.app.prefs) appliedP = applyFullPrefs(d.app.prefs); } catch(e){}
      }
      if (!appliedP && historyState && historyState.ex){
        const stRow = setupRead(historyState.ex.header, historyState.ex.rows, _setupCtx());
        if (stRow) applyFullPrefs(stRow);
      }

      const unifiedAfter = _buildUnifiedCoffeesIndexImpl(historyState ? historyState.objs : [], prState.list);
      if ((!a.coffee || !a.coffee.name) && unifiedAfter.length > 0){
        _selectSavedCoffeeImpl(unifiedAfter[0], { silent:true });
      }
      brewsImported = historyState && historyState.objs ? historyState.objs.length : 0;
      coffeesImported = unifiedAfter.length;
    } else {
      /* NON-DESTRUCTIVE MERGE MODE */
      const beforeUnified = _buildUnifiedCoffeesIndexImpl(historyState ? historyState.objs : [], prState.list);
      const beforeCoffeeKeys = new Set(beforeUnified.map(u => u.normKey || (_normKeyPart(u.name) + '|' + _normKeyPart(u.roaster))));

      /* 1. Merge CSV Brew History (deduplicating by row id OR timestamp + coffee_name + brew_method) */
      if (km[HISTORY_LS_KEY]){
        const incCsv = String(km[HISTORY_LS_KEY]);
        const incEx = readExisting(incCsv);
        if (!incEx.error){
          const incObjs = rowsToObjects(incEx);
          if (!historyState || !historyState.ex || !historyState.objs.length){
            _setHistoryImpl(incEx, incCsv);
            brewsImported = incObjs.length;
          } else {
            const curObjs = historyState.objs;
            const seenIds = new Set();
            const seenSigs = new Set();
            for (let i = 0; i < curObjs.length; i++){
              const cid = String(curObjs[i].id || '').trim();
              if (cid) seenIds.add(cid);
              const sig = _rowDedupSignature(curObjs[i]);
              if (sig) seenSigs.add(sig);
            }
            const toAdd = [];
            for (let j = 0; j < incObjs.length; j++){
              const cand = incObjs[j];
              const cid = String(cand.id || '').trim();
              const sig = _rowDedupSignature(cand);
              if ((cid && seenIds.has(cid)) || (sig && seenSigs.has(sig))) continue;
              if (cid) seenIds.add(cid);
              if (sig) seenSigs.add(sig);
              toAdd.push(cand);
            }
            if (toAdd.length > 0){
              const mergedEx = addRowsToExisting(historyState.ex, toAdd);
              const mergedCsv = toCSV([mergedEx.header].concat(mergedEx.rows));
              _setHistoryImpl(mergedEx, mergedCsv);
              brewsImported = toAdd.length;
            }
          }
        }
      }

      /* 2. Merge Vault Bags from brew-and-cup-prices-v1 & brew-and-cup-coffees-v1 */
      let bagCandidates = [];
      if (km[PRICES_LS_KEY]){
        const prInc = _parsePricesAnyFormat(km[PRICES_LS_KEY]);
        if (!prInc.error && prInc.list.length) bagCandidates = bagCandidates.concat(prInc.list);
      }
      const incCoffeesArr = _parseCoffeesVaultArray(xm[EXTRA_VAULT_COFFEES_KEY] || km[EXTRA_VAULT_COFFEES_KEY]);
      if (incCoffeesArr.length){
        /* Losslessly merge brew-and-cup-coffees-v1 entries so richer metadata / bag_notes / pendingNextRecipe enrich existing bags */
        try {
          incCoffeesArr.forEach(item => {
            if (!item || typeof item !== 'object') return;
            _upsertCoffeeVaultRecordImpl(item, item.lastBrew || null, {
              updatedAt:item.updatedAt != null ? item.updatedAt : Date.now(),
              mergeByTimestamp:true
            });
          });
        } catch(e){}
        bagCandidates = bagCandidates.concat(incCoffeesArr.map(_coffeeVaultObjToPriceCandidate).filter(Boolean));
      }
      if (bagCandidates.length){
        const pmRes = _mergePriceBagsNonDestructive(prState.list, bagCandidates);
        if (pmRes.list.length !== prState.list.length || pmRes.added > 0){
          prState.list = pmRes.list;
          prState.changes++;
          _persistPrices();
        }
      }

      /* 3. Merge Coffee Shops & Shop Draft */
      if (km[SHOPS_LS_KEY]){
        _shLoadText(String(km[SHOPS_LS_KEY]));
      }
      if (km[SHOP_DRAFT_LS_KEY] && (!sdState || !sdState.on)){
        try {
          const incSd = JSON.parse(String(km[SHOP_DRAFT_LS_KEY]));
          if (incSd && incSd.on){ sdState = Object.assign(_sdBlank(), incSd, { on:true }); _persistShopDraft(); }
        } catch(e){}
      }

      /* 4. Merge Academy Progress & 36-Vial Aroma Kit */
      if (km[ACADEMY_LS_KEY]){
        const ap = _everyPart('academy');
        if (ap && ap.apply) ap.apply(String(km[ACADEMY_LS_KEY]));
      }
      const incKitRaw = xm[EXTRA_AROMA_KIT_KEY] || km[EXTRA_AROMA_KIT_KEY];
      if (incKitRaw){
        try {
          const curKit = JSON.parse(localStorage.getItem(EXTRA_AROMA_KIT_KEY) || '{}') || {};
          const incKit = JSON.parse(String(incKitRaw)) || {};
          localStorage.setItem(EXTRA_AROMA_KIT_KEY, JSON.stringify(Object.assign({}, curKit, incKit)));
        } catch(e){}
      }

      /* 5. Restore & Merge Preferences, Owned Gear, Grinder Calibrations & Water Profile */
      let incPrefs = null;
      if (km[PREFS_MIRROR_LS_KEY]){
        try { incPrefs = JSON.parse(String(km[PREFS_MIRROR_LS_KEY])); } catch(e){ incPrefs = null; }
      }
      let incDraft = null;
      if (km[DRAFT_LS_KEY]){
        try { incDraft = JSON.parse(String(km[DRAFT_LS_KEY])); } catch(e){ incDraft = null; }
      }
      if (!incPrefs && incDraft && incDraft.app && incDraft.app.prefs){
        incPrefs = incDraft.app.prefs;
      }
      if (!incPrefs && historyState && historyState.ex){
        incPrefs = setupRead(historyState.ex.header, historyState.ex.rows, _setupCtx());
      }
      if (incPrefs && typeof incPrefs === 'object'){
        const a = _getApp();
        const curP = a.prefs || cleanFullPrefs(null);
        const extras = setupMergeExtras(curP, incPrefs);
        const curOwned = Array.isArray(curP.ownedBrewers) ? curP.ownedBrewers : [];
        const incOwned = Array.isArray(incPrefs.ownedBrewers)
          ? incPrefs.ownedBrewers
          : (incPrefs.gear && Array.isArray(incPrefs.gear.ownedBrewers) ? incPrefs.gear.ownedBrewers : []);
        const unionOwned = cleanOwnedBrewers(curOwned.concat(incOwned));
        const mergedGear = Object.assign({}, curP.gear || {}, incPrefs.gear || {});
        if (unionOwned.length) mergedGear.ownedBrewers = unionOwned;
        const mergedPrefs = Object.assign({}, curP, incPrefs, {
          calib:extras.calib,
          roasterSites:extras.roasterSites,
          yieldCal:Object.assign({}, curP.yieldCal || {}, incPrefs.yieldCal || {}),
          brewerMaterials:Object.assign({}, curP.brewerMaterials || {}, incPrefs.brewerMaterials || {}),
          ownedBrewers:unionOwned.length ? unionOwned : curOwned,
          gear:mergedGear
        });
        applyFullPrefs(mergedPrefs);
      }

      /* Hydrate active coffee/brew draft if current coffee is empty */
      const aNow = _getApp();
      if ((!aNow.coffee || !aNow.coffee.name) && incDraft && incDraft.app){
        if (incDraft.app.coffee && incDraft.app.coffee.name){
          aNow.coffee = Object.assign(aNow.coffee || {}, incDraft.app.coffee);
        }
        if (incDraft.app.brew && typeof incDraft.app.brew === 'object'){
          aNow.brew = Object.assign(aNow.brew || {}, incDraft.app.brew);
        }
      }

      const afterUnified = _buildUnifiedCoffeesIndexImpl(historyState ? historyState.objs : [], prState.list);
      let newCoffeeCount = 0;
      afterUnified.forEach(u => {
        const nk = u.normKey || (_normKeyPart(u.name) + '|' + _normKeyPart(u.roaster));
        if (!beforeCoffeeKeys.has(nk)) newCoffeeCount++;
      });
      if ((!aNow.coffee || !aNow.coffee.name) && afterUnified.length > 0){
        _selectSavedCoffeeImpl(afterUnified[0], { silent:true });
      }
      coffeesImported = newCoffeeCount;
    }

    _noteBackup();
    _triggerScheduleDraft();
    _refreshLiveUiAfterImport(opts);

    const finalUnified = _buildUnifiedCoffeesIndexImpl(historyState ? historyState.objs : [], prState.list);
    const finalBrews = historyState && historyState.objs ? historyState.objs.length : 0;
    return {
      ok:true,
      mode,
      brewsImported,
      coffeesImported,
      totalBrews:finalBrews,
      totalCoffees:finalUnified.length
    };
  }

  function _importFullSaveBundleImpl(inputStrOrObj, opts){
    opts = opts || {};
    const norm = _normalizeIncomingSaveToBundleSync(inputStrOrObj);
    if (norm && norm.needsAsyncUrlDecode){
      return _decodeWebSaveUrlImpl(norm.rawText).then(bundle => _executeBundleImportSync(bundle, opts)).catch(err => ({
        ok:false,
        mode:opts.mode === 'replace' ? 'replace' : 'merge',
        brewsImported:0,
        coffeesImported:0,
        error:String(err && err.message ? err.message : err)
      }));
    }
    if (!norm || norm.error || !norm.bundle){
      return _makeThenableResult({
        ok:false,
        mode:opts.mode === 'replace' ? 'replace' : 'merge',
        brewsImported:0,
        coffeesImported:0,
        error:(norm && norm.error) || 'Could not read save data.'
      });
    }
    const res = _executeBundleImportSync(norm.bundle, opts);
    return _makeThenableResult(res);
  }

  /* ---------- Unified Boot Hydration Helper ---------- */
  async function hydrateAll(opts){
    opts = opts || {};
    const snap = _ensurePreMigrationSnapshotImpl({ targetSchema:'6.0' });
    await hydrateNativeVaultBeforeBoot();
    const fb = _readStorageWithFallbackImpl();
    if (fb && fb.recovered) _ensurePreMigrationSnapshotImpl({ targetSchema:'6.0', forceIfEmpty:true });
    _loadHistoryImpl();
    _loadPricesImpl();
    _loadShopsImpl();
    _loadShopDraftImpl();
    loadDraftIntoApp();
    await Promise.all([_loadPickedFileImpl(), _loadEveryFileImpl()]);
    return {
      snapshot:snap,
      recovered:fb,
      historyCount:historyState && historyState.ex ? historyState.ex.count : 0,
      pricesCount:prState.list.length,
      shopsCount:shState.store.drinks.length
    };
  }

  /* Export window.BTStorage matching Blueprint Section 5.1 + full Data Vault toolkit */
  BTStorage = {
    PROTECTED_LS_KEYS:PROTECTED_LS_KEYS.slice(),
    ADDITIVE_LS_KEYS:ADDITIVE_LS_KEYS.slice(),
    ALL_18_LS_KEYS:ALL_18_LS_KEYS.slice(),
    getHistory:() => historyState,
    loadHistory:_loadHistoryImpl,
    forgetHistory:_forgetHistoryImpl,
    keepInBrowser:_keepInBrowserImpl,
    appendTastingRow:row => _keepInBrowserImpl(row),
    appendHistoryRow:row => _keepInBrowserImpl(row),
    setHistory:_setHistoryImpl,
    applyHistoryRows:_applyHistoryRowsImpl,
    deleteByIdx:_deleteByIdxImpl,
    undoDelete:_undoDeleteImpl,
    canUndoDelete:() => !!(undoBuf && Date.now() - undoBuf.t < 10000),
    commitCoffeeEdit:_commitCoffeeEditImpl,
    commitTastingEdit:_commitTastingEditImpl,
    undoEdit:_undoEditImpl,
    commitRating:_commitRatingImpl,
    commitDialLock:_commitDialLockImpl,
    commitNotForMe:_commitNotForMeImpl,
    commitExcludeLearning:(rowIdx, on, reason) => _commitTastingEditImpl(rowIdx, { intensity:{ v6:{ exclude_learning:!!on, outlier_reason:on ? String(reason || 'off_palate') : '' } } }),
    setRowExcludeLearning:(rowIdx, on, reason) => _commitTastingEditImpl(rowIdx, { intensity:{ v6:{ exclude_learning:!!on, outlier_reason:on ? String(reason || 'off_palate') : '' } } }),
    browserOnlyCups,
    browserOnlyMissingFrom,
    baseRow:_baseRowImpl,
    buildRow:_buildRowImpl,
    useCoffeeFromRow:_useCoffeeFromRowImpl,
    readV6Adaptation:row => (typeof readV6Adaptation === 'function' ? readV6Adaptation(row) : _readRowAdaptationMeta(row)),

    getPrices:() => prState,
    loadPrices:_loadPricesImpl,
    savePrices:_savePricesImpl,
    forgetPrices:_forgetPricesImpl,
    addPriceBag:(bag, again) => { const r = priceAdd(prState.list, bag, again !== false); if (r.added){ prState.list = r.list; prState.changes++; _persistPrices(); try { _upsertVaultFromPriceList([r.list[r.list.length - 1]]); } catch(e){} } return r; },
    updatePriceBag:(idx, patch) => { const r = priceSet(prState.list, idx, patch); if (r.ok){ prState.list = r.list; prState.changes++; _persistPrices(); try { _upsertVaultFromPriceList([r.list[idx]]); } catch(e){} } return r; },
    finishPriceBag:(idx, fin) => { const r = priceSet(prState.list, idx, { finished:fin ? _todayIso() : '' }); if (r.ok){ prState.list = r.list; prState.changes++; _persistPrices(); } return r; },
    deletePriceBag:idx => { const e = prState.list[idx]; if (!e) return false; prState.undo = { e, at:idx, t:Date.now() }; prState.list = prState.list.filter((_, k) => k !== idx); prState.changes++; _persistPrices(); return true; },
    undoPriceDelete:() => { if (!prState.undo) return false; const l = prState.list.slice(); l.splice(Math.min(prState.undo.at, l.length), 0, prState.undo.e); prState.list = l; prState.changes = Math.max(0, prState.changes - 1); prState.undo = null; _persistPrices(); return true; },
    deductBagGrams:_deductBagGramsImpl,
    reconcileBagDoseDelta:_reconcileBagDoseDeltaImpl,
    undoLastBagDeduct:() => (prState.deductUndo && typeof prState.deductUndo.fn === 'function') ? prState.deductUndo.fn() : false,

    getShops:() => shState,
    getShopDraft:() => sdState,
    loadShops:_loadShopsImpl,
    loadShopDraft:_loadShopDraftImpl,
    saveShops:_saveShopsImpl,
    saveShopDraft:draft => { if (draft && typeof draft === 'object') sdState = Object.assign(_sdBlank(), draft); _persistShopDraft(); return sdState; },
    shopAddDrink:_btShopAddDrink,
    addShopDrink:d => _btShopAddDrink(d),
    forgetShops:_forgetShopsImpl,

    cleanFullPrefs,
    prefsIsDefault,
    applyFullPrefs,
    mirrorPrefsNow,
    saveDraftFromApp,
    loadDraftIntoApp,
    readAcademyState,
    writeAcademyState,
    recordPalateGymTrial,

    fhRun:_fhRunImpl,
    loadPickedFile:_loadPickedFileImpl,
    getPickedFile:() => pickedFile,
    forgetPicked:_forgetPicked,
    pickOpen:_pickOpen,
    pickWrite:_pickWriteImpl,
    pickSave:_pickSaveImpl,
    loadEveryFile:_loadEveryFileImpl,
    getEveryFile:() => everyFile,
    forgetEveryFile:_forgetEveryFile,

    everyRegister:_everyRegisterImpl,
    everyGather:_everyGatherImpl,
    everyChanged:_everyChanged,
    everySavedLine:_everySavedLine,
    everySave:_everySaveImpl,
    makeEverythingBackup:_makeEverythingBackup,
    exportEverythingTxt:opts => _everySaveImpl(!!(opts && opts.asNew)),
    exportTasteHistoryCsv:opts => _pickSaveImpl(opts || false),
    exportPricesCsv:() => { if (!prState.list.length) return { ok:false }; const csv = priceCsv(prState.list); _downloadText(csv, EVERY_FILES.prices, 'text/csv;charset=utf-8'); prState.changes = 0; _persistPrices(); return { ok:true, filename:EVERY_FILES.prices, csv }; },
    exportShopsCsv:() => { if (_shEmpty()) return { ok:false }; const csv = shopCsv(shState.store); _downloadText(csv, EVERY_FILES.shops, 'text/csv;charset=utf-8'); shState.changes = 0; _persistShops(); return { ok:true, filename:EVERY_FILES.shops, csv }; },
    exportNb1Code:async () => { const b = await _makeEverythingBackup(); return b.ok ? { ok:true, code:b.code, text:b.text } : b; },
    exportJsonBackup:_exportJsonBackup,
    shareBackupToPhone:_shareBackupToPhone,
    classifyBackup:_everyClassify,
    everyClassify:_everyClassify,
    applyClassifiedBackup:_applyClassifiedBackup,

    ensurePreMigrationSnapshot:_ensurePreMigrationSnapshotImpl,
    getSafetySnapshotStatus,
    listSafetySnapshots,
    readSafetySnapshot,
    readSafetySnapshotSync,
    downloadSafetySnapshot,
    restoreSafetySnapshot:_restoreSafetySnapshotImpl,
    restoreSafetySnapshotSync,
    createManualSafetySnapshot:() => _ensurePreMigrationSnapshotImpl({ targetSchema:'6.0', forceManual:true }),
    readStorageWithFallback:_readStorageWithFallbackImpl,

    mirrorNativeVault,
    hydrateNativeVaultBeforeBoot,
    hydrateAll,
    clearEverything:_clearEverythingImpl,

    /* Directive #132 — Zero Re-Entry Past Coffee Vault (<2 ms for 500+ rows) */
    getCoffeesVaultList:_getCoffeesVaultListImpl,
    saveCoffeesVaultList:_saveCoffeesVaultListImpl,
    upsertCoffeeVaultRecord:_upsertCoffeeVaultRecordImpl,
    hydrateCoffeeIntoApp:_hydrateCoffeeIntoAppImpl,
    buildUnifiedCoffeesIndex:_buildUnifiedCoffeesIndexImpl,
    selectSavedCoffee:_selectSavedCoffeeImpl,
    applyFreshBagRoastDate:_applyFreshBagRoastDateImpl,

    /* v6.5 All-18-Key Portable Save Bundle & Bookmarkable Web-Address Save Engine */
    exportFullSaveBundle:_exportFullSaveBundleImpl,
    downloadFullSaveFile:_downloadFullSaveFileImpl,
    downloadHistoryCsvFile:_downloadHistoryCsvFileImpl,
    importFullSaveBundle:_importFullSaveBundleImpl,
    buildWebSaveUrl:_buildWebSaveUrlImpl,
    buildWebSaveUrlSync:_buildWebSaveUrlSync,
    decodeWebSaveUrl:_decodeWebSaveUrlImpl,
    decodeWebSaveUrlSync:_decodeWebSaveSync,
    applySaveToBrowserAddressBar:_applySaveToBrowserAddressBarImpl,
    requestPersistentStorage:_requestPersistentStorageImpl,
    getPersistentStorageStatus:_getPersistentStorageStatusImpl,
    getLastBackupMs:() => {
      if (lastBackupMs > 0) return lastBackupMs;
      try { return parseInt(localStorage.getItem(LASTBACKUP_LS_KEY), 10) || 0; } catch(e){ return 0; }
    }
  };

  _g.BTStorage = BTStorage;
  _g.cleanFullPrefs = cleanFullPrefs;
  _g.prefsIsDefault = prefsIsDefault;
  _g.applyFullPrefs = applyFullPrefs;
  _g.mirrorPrefsNow = mirrorPrefsNow;
  _g.readAcademyState = readAcademyState;
  _g.writeAcademyState = writeAcademyState;
  _g.readStorageWithFallback = _readStorageWithFallbackImpl;
  _g.ensurePreMigrationSnapshot = _ensurePreMigrationSnapshotImpl;
  _g.getSafetySnapshotStatus = getSafetySnapshotStatus;
  _g.readSafetySnapshot = readSafetySnapshot;
  _g.downloadSafetySnapshot = downloadSafetySnapshot;
  _g.restoreSafetySnapshot = _restoreSafetySnapshotImpl;
}

/* IIFE-shared bindings for UI modules (03..11 & 99-boot-close.js) */
function keepInBrowser(csvOrRow){ return BTStorage.keepInBrowser(csvOrRow); }
function setHistory(ex, text){ return BTStorage.setHistory(ex, text); }
function applyHistoryRows(rows){ return BTStorage.applyHistoryRows(rows); }
function deleteByIdx(setOrIdx){ return BTStorage.deleteByIdx(setOrIdx); }
function undoDelete(){ return BTStorage.undoDelete(); }
function commitCoffeeEdit(idxs, edit){ return BTStorage.commitCoffeeEdit(idxs, edit); }
function commitTastingEdit(rowIdx, edit){ return BTStorage.commitTastingEdit(rowIdx, edit); }
function commitRating(rowIdx, stars){ return BTStorage.commitRating(rowIdx, stars); }
function commitDialLock(o, on){ return BTStorage.commitDialLock(o, on); }
function commitNotForMe(rowIdx){ return BTStorage.commitNotForMe(rowIdx); }
function setRowExcludeLearning(rowIdx, on, reason){ return BTStorage.setRowExcludeLearning(rowIdx, on, reason); }
function baseRow(overrides){ return BTStorage.baseRow(overrides); }
function buildRow(overrides){ return BTStorage.buildRow(overrides); }
function useCoffeeFromRow(rowObj, stay, withMachineProfile){ return BTStorage.useCoffeeFromRow(rowObj, stay, withMachineProfile); }
function deductBagGrams(coffee, doseG, opts){ return BTStorage.deductBagGrams(coffee, doseG, opts); }
function reconcileBagDoseDelta(rowOrCoffee, deltaDoseG){ return BTStorage.reconcileBagDoseDelta(rowOrCoffee, deltaDoseG); }
function savePrices(nextList){ return BTStorage.savePrices(nextList); }
function loadPrices(){ return BTStorage.loadPrices(); }
function saveShops(nextStore){ return BTStorage.saveShops(nextStore); }
function loadShops(){ return BTStorage.loadShops(); }
function loadShopDraft(){ return BTStorage.loadShopDraft(); }
function loadHistory(){ return BTStorage.loadHistory(); }
function forgetHistory(){ return BTStorage.forgetHistory(); }
function everyRegister(part){ return BTStorage.everyRegister(part); }
function fhRun(mode, fn){ return BTStorage.fhRun(mode, fn); }
function pickWrite(handle, text, mod, noDrop){ return BTStorage.pickWrite(handle, text, mod, noDrop); }
function pickSave(optsOrAsNew){ return BTStorage.pickSave(optsOrAsNew); }
function loadPickedFile(){ return BTStorage.loadPickedFile(); }
function loadEveryFile(){ return BTStorage.loadEveryFile(); }
function ensurePreMigrationSnapshot(opts){ return BTStorage.ensurePreMigrationSnapshot(opts); }
function restoreSafetySnapshot(opts){ return BTStorage.restoreSafetySnapshot(opts); }
function readStorageWithFallback(){ return BTStorage.readStorageWithFallback(); }
function clearEverything(){ return BTStorage.clearEverything(); }
function buildUnifiedCoffeesIndex(historyObjs, priceList, vaultList){ return BTStorage.buildUnifiedCoffeesIndex(historyObjs, priceList, vaultList); }
function selectSavedCoffee(rec, opts){ return BTStorage.selectSavedCoffee(rec, opts); }
function applyFreshBagRoastDate(recOrCoffee, isoRoastDate, bagOpts){ return BTStorage.applyFreshBagRoastDate(recOrCoffee, isoRoastDate, bagOpts); }
function getCoffeesVaultList(){ return BTStorage.getCoffeesVaultList(); }
function saveCoffeesVaultList(arr){ return BTStorage.saveCoffeesVaultList(arr); }
function upsertCoffeeVaultRecord(coffeeIn, brewIn, opts){ return BTStorage.upsertCoffeeVaultRecord(coffeeIn, brewIn, opts); }
function hydrateCoffeeIntoApp(recOrCoffee, opts){ return BTStorage.hydrateCoffeeIntoApp(recOrCoffee, opts); }
