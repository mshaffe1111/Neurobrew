/*PURE_START*/
const COLUMNS = [
  'schema_version','id','coffee_id','saved_at','cupping_date','mode',
  'roaster','coffee_name','origin','process','decaf','roast_level','elevation_class','elevation_m','roast_date','days_since_roast','varietal','bag_notes',
  'brew_method','brew_attempt','brew_dose_g','brew_water_g','brew_ratio','brew_ratio_recommended','brew_temp_f','brew_temp_c','brew_temp_recommended_f','brew_grind_target_um','brew_grind_setting','brew_time_s','brew_actual_time_s','brew_out_g','brew_tds_pct','brew_ey_pct','brew_agitation','brew_technique','brew_technique_detail','brew_water_type','brew_filter','brew_grinder_type','brew_grinder_name','brew_pour_notes','brew_adjustment',
  'fragrance_aroma','flavor','aftertaste','acidity','body','balance','overall',
  'acidity_intensity','body_intensity',
  'words_fragrance_aroma','words_flavor','words_aftertaste','words_acidity','words_body','aftertaste_length','aroma_kit',
  'cool_acidity','cool_sweetness','cool_bitterness',
  'uniformity','clean_cup','sweetness',
  'taint_cups','fault_cups','defect_deduction',
  'total_score','score_kind','aroma_vials',
  'note_fragrance_aroma','note_flavor','note_aftertaste','note_acidity','note_body','note_balance','note_overall',
  'defect_notes','general_notes','blend','details_guessed','water_alkalinity_mgl','water_hardness_mgl',
  'my_rating_stars',
  'dial_symptom','dial_change','dial_from_id','dial_locked',
  'make_again','q_smell','q_taste','q_aftertaste','q_acidity','q_sweetness','q_body','flavors_liked','flavors_not_liked',
  'fragrance','aroma','note_aroma','note_sweetness','first_flavor','first_aftertaste','first_acidity','first_sweetness','first_body','first_overall','cva_retasted','defect_type','fix_symptom','vs_acidity','vs_body','vs_sweetness','brew_ey_model',
  'species','decaf_process','is_frozen','frozen_date','freeze_days_offset','brew_style','brew_ey_total_pct','recipe_adaptation_json','sweetness_intensity','bitterness_intensity','astringency_intensity','clarity_intensity','cva_intensity_json',
  'setup_json'
];
const TEXT_COLUMNS = new Set([
  'roaster','coffee_name','origin','process','roast_level','elevation_class','varietal','bag_notes',
  'brew_method','brew_grind_setting','brew_adjustment','brew_filter','brew_grinder_name','brew_pour_notes','brew_technique_detail','details_guessed','aroma_vials','words_fragrance_aroma','words_flavor','words_aftertaste','words_acidity','words_body','aroma_kit',
  'note_fragrance_aroma','note_flavor','note_aftertaste','note_acidity','note_body','note_balance','note_overall',
  'defect_notes','general_notes','flavors_liked','flavors_not_liked','note_aroma','note_sweetness','defect_type',
  'species','decaf_process','brew_style'
]);
const SETUP_COLUMN = 'setup_json';
const REQUIRED_COLUMNS = ['schema_version','id','coffee_name','total_score'];

/* Pure internal fallbacks so 01-schema-codecs.js works standalone and before 02..05 load */
const _BT_V6_METHODS_23 = [
  { key:'v60', label:'Hario V60', type:'flow', ratio:16 },
  { key:'origami', label:'Origami Dripper', type:'flow', ratio:16 },
  { key:'kalita', label:'Kalita Wave', type:'flow', ratio:16 },
  { key:'orea', label:'Orea Brewer', type:'flow', ratio:16 },
  { key:'pulsar', label:'NextLevel Pulsar', type:'hybrid', ratio:17 },
  { key:'chemex', label:'Chemex', type:'flow', ratio:16.5 },
  { key:'nel', label:'Nel Woodneck Cloth', type:'flow', ratio:12 },
  { key:'drip', label:'Auto Drip Brewer', type:'flow', ratio:16.5 },
  { key:'aiden', label:'Fellow Aiden', type:'flow', ratio:16 },
  { key:'xbloom', label:'xBloom Studio', type:'flow', ratio:16 },
  { key:'switch', label:'Hario Switch', type:'hybrid', ratio:16 },
  { key:'clever', label:'Clever Dripper', type:'hybrid', ratio:16 },
  { key:'aeropress', label:'AeroPress', type:'steep', ratio:15 },
  { key:'siphon', label:'Vacuum Siphon', type:'steep', ratio:15 },
  { key:'press', label:'French Press', type:'steep', ratio:15 },
  { key:'turkish', label:'Turkish Cezve', type:'boil', ratio:10 },
  { key:'phin', label:'Vietnamese Phin', type:'flow', ratio:4 },
  { key:'cold', label:'Cold Brew', type:'cold', ratio:8 },
  { key:'cold_drip', label:'Kyoto Cold Drip', type:'cold', ratio:10 },
  { key:'espresso', label:'Espresso', type:'espresso', ratio:2 },
  { key:'lever_espresso', label:'Lever Espresso', type:'espresso', ratio:2.1 },
  { key:'moka', label:'Moka Pot', type:'moka', ratio:10 },
  { key:'philips5500', label:'Philips 5500 LatteGo', type:'machine', ratio:3 }
];
const _BT_V6_METHOD_SET = new Set(_BT_V6_METHODS_23.map(m => m.key));
function _btAllMethods(){
  const dyn = (typeof METHODS !== 'undefined' && Array.isArray(METHODS)) ? METHODS : [];
  const mac = (typeof MACHINES !== 'undefined' && Array.isArray(MACHINES)) ? MACHINES : [];
  if (!dyn.length) return _BT_V6_METHODS_23;
  const seen = new Set(dyn.map(m => m && m.key).filter(Boolean));
  const out = dyn.slice();
  mac.forEach(m => {
    const obj = typeof m === 'string' ? _BT_V6_METHODS_23.find(x => x.key === m) || { key:m, label:m, type:'machine', ratio:3 } : m;
    if (obj && obj.key && !seen.has(obj.key)){ seen.add(obj.key); out.push(obj); }
  });
  _BT_V6_METHODS_23.forEach(m => { if (!seen.has(m.key)){ seen.add(m.key); out.push(m); } });
  return out;
}
function _btValidIsoDate(s){
  if (typeof validIsoDate === 'function') return validIsoDate(s);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || '').trim());
  if (!m) return false;
  const y = +m[1], mo = +m[2], d = +m[3];
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return false;
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCFullYear() === y && (dt.getUTCMonth() + 1) === mo && dt.getUTCDate() === d;
}
function _btDaysSinceRoast(roastIso, refDate){
  if (typeof daysSinceRoast === 'function') return daysSinceRoast(roastIso, refDate);
  if (!_btValidIsoDate(roastIso)) return null;
  const ref = refDate instanceof Date && !isNaN(refDate) ? refDate : new Date();
  const a = Date.UTC(+roastIso.slice(0, 4), +roastIso.slice(5, 7) - 1, +roastIso.slice(8, 10));
  const b = Date.UTC(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const d = Math.round((b - a) / 86400000);
  return d >= 0 ? d : null;
}
function _btMapElevation(text){
  if (typeof mapElevation === 'function') return mapElevation(text);
  const s = String(text || '').trim().toLowerCase();
  if (!s) return { m:0, cls:'' };
  const nums = (s.match(/\d{3,5}/g) || []).map(x => parseInt(x, 10)).filter(x => x > 0);
  if (!nums.length) return { m:0, cls:'' };
  let avg = nums.reduce((a, b) => a + b, 0) / nums.length;
  if (/\b(?:ft|feet)\b/.test(s) || avg > 3400) avg = avg * 0.3048;
  const m = Math.round(avg);
  if (m < 200 || m > 3500) return { m:0, cls:'' };
  return { m, cls:m >= 1500 ? 'high' : m >= 1200 ? 'mid' : 'low' };
}
function _btLabelOf(list, val){
  if (typeof labelOf === 'function' && Array.isArray(list)) return labelOf(list, val);
  if (!Array.isArray(list) || !val) return '';
  const hit = list.find(x => x && (x.v === val || x.key === val));
  return hit && hit.label ? hit.label : '';
}
function _btNorm(s){
  if (typeof norm === 'function') return norm(s);
  return String(s == null ? '' : s).toLowerCase().replace(/\s+/g, ' ').trim();
}
function _btFToC(f){
  if (typeof fToC === 'function') return fToC(f);
  return (f - 32) * 5 / 9;
}
function _btExtractionYield(tds, outG, doseG){
  if (typeof extractionYield === 'function') return extractionYield(tds, outG, doseG);
  const t = +tds, o = +outG, d = +doseG;
  return (isFinite(t) && t > 0 && isFinite(o) && o > 0 && isFinite(d) && d > 0) ? Math.round((t * o / d) * 100) / 100 : null;
}
function _btCalibClean(raw){
  if (typeof calibClean === 'function') return calibClean(raw);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out = {};
  Object.keys(raw).slice(0, 48).forEach(gk => {
    const v = raw[gk];
    if (v && typeof v === 'object' && !Array.isArray(v)){
      const sub = {};
      Object.keys(v).slice(0, 24).forEach(ck => {
        const cv = v[ck];
        if (typeof cv === 'number' && isFinite(cv)) sub[ck.slice(0, 32)] = Math.round(cv * 100) / 100;
        else if (typeof cv === 'string' && cv.length <= 48) sub[ck.slice(0, 32)] = cv;
        else if (cv && typeof cv === 'object' && !Array.isArray(cv)) sub[ck.slice(0, 32)] = cv;
      });
      if (Object.keys(sub).length) out[gk.slice(0, 48)] = sub;
    }
  });
  return out;
}
function _btShopOrigin(u){
  if (typeof shopOrigin === 'function') return shopOrigin(u);
  const s = String(u || '').trim();
  const m = /^(https?:\/\/[a-z0-9.-]+(?::\d+)?)/i.exec(s);
  return m ? m[1] : '';
}
function _btShopKey(k){
  if (typeof shopKey === 'function') return shopKey(k);
  return String(k || '').toLowerCase().replace(/\s+/g, ' ').trim();
}
function _btFmtRatio(r){
  if (typeof fmtRatio === 'function') return fmtRatio(r);
  const n = Math.round((+r || 0) * 10) / 10;
  return '1:' + n;
}
function _btFmtTime(secs){
  if (typeof fmtTime === 'function') return fmtTime(secs);
  const s = Math.max(0, Math.round(+secs || 0));
  const m = Math.floor(s / 60), rem = s % 60;
  return m > 0 ? (m + ':' + String(rem).padStart(2, '0')) : (rem + ' s');
}
function _btUtf8Encode(str){
  if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(String(str == null ? '' : str));
  const s = String(str == null ? '' : str), out = [];
  for (let i = 0; i < s.length; i++){
    let c = s.charCodeAt(i);
    if (c >= 0xd800 && c < 0xdc00 && i + 1 < s.length){
      const d = s.charCodeAt(i + 1);
      if (d >= 0xdc00 && d < 0xe000){ c = 0x10000 + ((c - 0xd800) << 10) + (d - 0xdc00); i++; }
    }
    if (c < 0x80) out.push(c);
    else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
    else if (c < 0x10000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    else out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
  }
  return new Uint8Array(out);
}
function _btUtf8Decode(bytes){
  if (typeof TextDecoder !== 'undefined') return new TextDecoder('utf-8').decode(bytes);
  let s = '';
  for (let i = 0; i < bytes.length;){
    const c = bytes[i++]; let cp;
    if (c < 0x80) cp = c;
    else if (c >= 0xc0 && c < 0xe0 && i < bytes.length) cp = ((c & 31) << 6) | (bytes[i++] & 63);
    else if (c >= 0xe0 && c < 0xf0 && i + 1 < bytes.length){ cp = ((c & 15) << 12) | ((bytes[i] & 63) << 6) | (bytes[i + 1] & 63); i += 2; }
    else if (c >= 0xf0 && i + 2 < bytes.length){ cp = ((c & 7) << 18) | ((bytes[i] & 63) << 12) | ((bytes[i + 1] & 63) << 6) | (bytes[i + 2] & 63); i += 3; }
    else cp = 0xfffd;
    if (cp >= 0x10000){ cp -= 0x10000; s += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 1023)); }
    else s += String.fromCharCode(cp);
  }
  return s;
}

/* ---------- Core CSV & Formula-Safety Primitives ---------- */
function validStars(v){
  if (typeof v !== 'number' && typeof v !== 'string') return 0;
  if (typeof v === 'string' && !/^\s*\d(\.\d+)?\s*$/.test(v)) return 0;
  const x = typeof v === 'number' ? v : parseFloat(v);
  return (isFinite(x) && x >= 0.5 && x <= 5 && Math.abs(x * 2 - Math.round(x * 2)) < 1e-9) ? Math.round(x * 2) / 2 : 0;
}
function neutralize(s){
  s = String(s == null ? '' : s);
  return /^'*[=+\-@\t\r]/.test(s) ? "'" + s : s;
}
function unneutralize(s){
  s = String(s == null ? '' : s);
  return /^'+[=+\-@\t\r]/.test(s) ? s.slice(1) : s;
}
function escapeField(s){
  s = String(s == null ? '' : s);
  return (/[",\r\n]/.test(s) || /^\s|\s$/.test(s)) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
function toCSV(lines){
  return '\uFEFF' + lines.map(r => r.map(escapeField).join(',')).join('\r\n') + '\r\n';
}
function parseCSV(text){
  text = String(text == null ? '' : text);
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < text.length; i++){
    const ch = text[i];
    if (q){
      if (ch === '"'){ if (text[i + 1] === '"'){ f += '"'; i++; } else { q = false; } }
      else f += ch;
    } else if (ch === '"'){ q = true; }
    else if (ch === ','){ row.push(f); f = ''; }
    else if (ch === '\n' || ch === '\r'){
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(f); f = ''; rows.push(row); row = [];
    } else f += ch;
  }
  if (q) return { error:'The file looks damaged (a quoted note never closes).' };
  if (f !== '' || row.length){ row.push(f); rows.push(row); }
  const clean = rows.filter(r => !(r.length === 1 && r[0].trim() === ''));
  if (!clean.length) return { error:'The file is empty.' };
  return { header:clean[0].map(h => h.trim()), rows:clean.slice(1) };
}
function readExisting(text){
  const p = parseCSV(text);
  if (p.error) return p;
  const missing = REQUIRED_COLUMNS.filter(c => !p.header.includes(c));
  if (missing.length) return { error:"This doesn't look like a file saved by this app (missing: " + missing.join(', ') + '). Nothing was changed.' };
  const idIdx = p.header.indexOf('id');
  const ids = new Set(p.rows.map(r => (r[idIdx] || '').trim()).filter(Boolean));
  return { header:p.header, rows:p.rows, ids, count:p.rows.length };
}
function mergeCSV(existing, newRow){
  const header = existing.header.slice();
  COLUMNS.forEach(c => { if (!header.includes(c)) header.push(c); });
  const lines = [header];
  const si = header.indexOf(SETUP_COLUMN), fresh = !!(newRow[SETUP_COLUMN] || '');
  existing.rows.forEach(r => { const rr = r.slice(); while (rr.length < header.length) rr.push(''); if (fresh) rr[si] = ''; lines.push(rr); });
  lines.push(header.map(c => newRow[c] !== undefined ? newRow[c] : ''));
  return toCSV(lines);
}
function addRowsToExisting(ex, objs){
  const header = ex.header.slice();
  COLUMNS.forEach(c => { if (!header.includes(c)) header.push(c); });
  const list = (objs || []).filter(o => o && typeof o === 'object');
  list.forEach(o => Object.keys(o).forEach(k => { if (k !== '_i' && !header.includes(k)) header.push(k); }));
  const ids = new Set(ex.ids), rows = ex.rows.map(r => { const rr = r.slice(); while (rr.length < header.length) rr.push(''); return rr; });
  let added = 0;
  list.forEach(o => {
    const id = String(o.id == null ? '' : o.id).trim();
    if (id && ids.has(id)) return;
    if (id) ids.add(id);
    rows.push(header.map(c => c === SETUP_COLUMN || o[c] == null ? '' : String(o[c]))); added++;
  });
  return { header, rows, ids, count:rows.length, added };
}
function stampSetupColumn(header, rows, json){
  json = String(json || ''); if (!json || !rows.length) return { header, rows };
  const hd = header.slice(); if (!hd.includes(SETUP_COLUMN)) hd.push(SETUP_COLUMN);
  const si = hd.indexOf(SETUP_COLUMN);
  return { header:hd, rows:rows.map((r, i) => { const rr = r.slice(); while (rr.length < hd.length) rr.push(''); rr[si] = i === rows.length - 1 ? json : ''; return rr; }) };
}
function newFileCSV(newRow){
  return toCSV([COLUMNS, COLUMNS.map(c => newRow[c] !== undefined ? newRow[c] : '')]);
}
function rowsToObjects(ex){
  if (!ex || !Array.isArray(ex.rows) || !Array.isArray(ex.header)) return [];
  return ex.rows.map((r, i) => {
    const o = { _i:i };
    ex.header.forEach((k, j) => { o[k] = r[j] == null ? '' : r[j]; });
    return o;
  });
}
function sortHistory(list, mode){
  const a = (list || []).slice();
  const num = x => { const n = parseFloat(x.total_score); return isNaN(n) ? -1 : n; };
  const key = x => (x.cupping_date || '') + '|' + (x.saved_at || '');
  const nm = x => unneutralize(x.coffee_name || '').toLowerCase().replace(/^[^a-z0-9]+/, '');
  const rt = x => validStars(x.my_rating_stars) || -1;
  if (mode === 'score') a.sort((x, y) => (num(y) - num(x)) || key(y).localeCompare(key(x)));
  else if (mode === 'rating') a.sort((x, y) => (rt(y) - rt(x)) || key(y).localeCompare(key(x)));
  else if (mode === 'name') a.sort((x, y) => nm(x).localeCompare(nm(y)) || key(y).localeCompare(key(x)));
  else a.sort((x, y) => key(y).localeCompare(key(x)));
  return a;
}
const HIST_SEARCH_COLS = [
  'coffee_name','roaster','origin','varietal','process','roast_level','brew_method','brew_style',
  'bag_notes','general_notes','flavors_liked','flavors_not_liked',
  'words_fragrance_aroma','words_flavor','words_aftertaste','words_acidity','words_body',
  'species','decaf_process','fix_symptom','dial_symptom'
];
function filterHistory(list, q){
  q = String(q || '').trim().toLowerCase();
  if (!q) return list;
  const toks = q.split(/\s+/).filter(Boolean);
  return (list || []).filter(x => {
    const hay = HIST_SEARCH_COLS.map(k => unneutralize(x[k] || '')).join(' ').toLowerCase();
    return toks.every(t => hay.includes(t));
  });
}

/* ---------- 7 Canonical Legacy & v6 Key Resolvers ---------- */
function _canonToken(v){
  return unneutralize(v == null ? '' : v).replace(/[\u2010-\u2015\u2212_]/g, '-').replace(/\s+/g, ' ').trim().toLowerCase();
}
function _matchDynamicList(list, s){
  if (!Array.isArray(list) || !s) return '';
  const hit = list.find(i => i && (String(i.v || '').toLowerCase() === s || String(i.key || '').toLowerCase() === s || String(i.label || '').toLowerCase() === s));
  return hit ? (hit.v !== undefined ? hit.v : hit.key) : '';
}
const ROAST_ALIASES = {
  'ultra-light':'ultra-light', 'ultralight':'ultra-light', 'ultra light':'ultra-light', 'nordic':'ultra-light', 'nordic light':'ultra-light', 'cinnamon':'ultra-light',
  'light':'light', 'light roast':'light', 'filter light':'light', 'filter':'light',
  'medium-light':'medium-light', 'medium light':'medium-light', 'light-medium':'medium-light', 'light medium':'medium-light', 'med-light':'medium-light', 'city':'medium-light', 'omni-light':'medium-light', 'omni':'medium-light', 'omni-roast':'medium-light',
  'medium':'medium', 'medium roast':'medium', 'full city':'medium', 'city+':'medium',
  'medium-dark':'medium-dark', 'medium dark':'medium-dark', 'med-dark':'medium-dark', 'dark-medium':'medium-dark', 'full city+':'medium-dark', 'vienna':'medium-dark',
  'dark':'dark', 'dark roast':'dark', 'french':'dark', 'italian':'dark', 'very dark':'dark', 'espresso dark':'dark'
};
function resolveRoast(val){
  const s = _canonToken(val).replace(/\s+roast$/, '');
  if (!s) return '';
  if (typeof ROASTS !== 'undefined'){ const d = _matchDynamicList(ROASTS, s) || _matchDynamicList(ROASTS, _canonToken(val)); if (d) return d; }
  return ROAST_ALIASES[s] || ROAST_ALIASES[_canonToken(val)] || '';
}
const PROCESS_ALIASES = {
  'washed':'washed', 'fully washed':'washed', 'wet':'washed', 'wet process':'washed', 'double washed':'washed', 'kenya washed':'washed',
  'natural':'natural', 'natural / dry':'natural', 'natural/dry':'natural', 'dry':'natural', 'dry process':'natural', 'sun-dried':'natural', 'sundried':'natural',
  'honey':'honey', 'pulped natural':'honey', 'semi-washed':'honey', 'semi washed':'honey', 'miel':'honey',
  'honey-white':'white-honey', 'white-honey':'white-honey', 'white honey':'white-honey',
  'honey-yellow':'yellow-honey', 'yellow-honey':'yellow-honey', 'yellow honey':'yellow-honey',
  'honey-red':'red-honey', 'red-honey':'red-honey', 'red honey':'red-honey',
  'honey-black':'black-honey', 'black-honey':'black-honey', 'black honey':'black-honey',
  'anaerobic':'anaerobic', 'anaerobic natural':'anaerobic', 'anaerobic washed':'anaerobic', 'anaerobic honey':'anaerobic', 'sealed fermentation':'anaerobic',
  'carbonic':'carbonic', 'carbonic maceration':'carbonic', 'cm':'carbonic', 'cm natural':'carbonic', 'cm washed':'carbonic',
  'thermal-shock':'thermal-shock', 'thermal shock':'thermal-shock', 'advanced thermal shock':'thermal-shock',
  'yeast':'yeast-koji', 'yeast-koji':'yeast-koji', 'koji':'yeast-koji', 'koji fermented':'yeast-koji', 'yeast / koji':'yeast-koji', 'yeast-inoculated':'yeast-koji', 'yeast inoculated':'yeast-koji', 'lacto':'yeast-koji', 'lactic':'yeast-koji',
  'infused':'infused', 'co-fermented / infused':'infused', 'co-fermented/infused':'infused', 'co-fermented':'infused', 'co-ferment':'infused', 'coferment':'infused', 'cofermented':'infused',
  'wet-hulled':'wet-hulled', 'wet hulled':'wet-hulled', 'giling basah':'wet-hulled', 'semi-dry':'wet-hulled',
  'unknown':'unknown', 'not sure':'unknown', 'unsure':'unknown', 'unlisted':'unknown'
};
function resolveProcess(val){
  const s = _canonToken(val);
  if (!s) return '';
  if (typeof PROCESSES !== 'undefined'){ const d = _matchDynamicList(PROCESSES, s); if (d) return d; }
  return PROCESS_ALIASES[s] || '';
}
const DENSITY_ALIASES = {
  'low':'low', 'lower':'low', 'low elevation':'low', 'soft':'low',
  'mid':'mid', 'medium':'mid', 'middle':'mid', 'medium elevation':'mid',
  'high':'high', 'higher':'high', 'high elevation':'high', 'strictly hard bean':'high', 'shb':'high', 'shg':'high',
  'ultra-high':'ultra-high', 'ultra high':'ultra-high', 'very high':'ultra-high',
  'unknown':'unknown', 'not sure':'unknown', 'unsure':'unknown'
};
function resolveDensity(val, elevM){
  const s = _canonToken(val);
  let out = '';
  if (s){
    if (typeof DENSITIES !== 'undefined') out = _matchDynamicList(DENSITIES, s);
    if (!out) out = DENSITY_ALIASES[s] || '';
  }
  if ((!out || out === 'unknown') && elevM != null && String(elevM).trim() !== ''){
    const m = parseFloat(elevM);
    if (isFinite(m) && m >= 200 && m <= 3500){
      const hasUltra = typeof DENSITIES !== 'undefined' && Array.isArray(DENSITIES) && DENSITIES.some(d => d && d.v === 'ultra-high');
      out = (m > 1800 && hasUltra) ? 'ultra-high' : m >= 1500 ? 'high' : m >= 1200 ? 'mid' : 'low';
    }
  }
  return out;
}
function resolveBlend(val){
  const s = _canonToken(val);
  if (!s) return '';
  if (s === 'single' || s === 'single origin' || s === 'single-origin') return 'single';
  if (s === 'blend' || s === 'house blend' || s === 'espresso blend') return 'blend';
  if (typeof BLEND_OPTS !== 'undefined') return _matchDynamicList(BLEND_OPTS, s);
  return '';
}
/* Supports all 23 canonical v6 methods + historical labels + sca_cupping */
const METHOD_ALIASES = {
  'v60':'v60', 'hario v60':'v60', 'pour over':'v60', 'pour-over':'v60', 'pourover':'v60',
  'origami':'origami', 'origami dripper':'origami', 'origami air':'origami', 'origami cone':'origami', 'origami wave':'origami',
  'kalita':'kalita', 'kalita wave':'kalita', 'kalita 155':'kalita', 'kalita 185':'kalita', 'flat-bottom':'kalita', 'flat bottom':'kalita',
  'orea':'orea', 'orea v3':'orea', 'orea v4':'orea', 'orea brewer':'orea', 'negotiated orea':'orea',
  'pulsar':'pulsar', 'nextlevel pulsar':'pulsar', 'next level pulsar':'pulsar', 'tricolate':'pulsar', 'zero-bypass':'pulsar', 'zero bypass':'pulsar',
  'chemex':'chemex', 'chemex classic':'chemex', 'chemex 6-cup':'chemex',
  'nel':'nel', 'nel drip':'nel', 'nel flannel':'nel', 'woodneck':'nel', 'hario woodneck':'nel', 'flannel drip':'nel', 'cloth filter':'nel',
  'drip':'drip', 'drip machine':'drip', 'auto drip':'drip', 'auto drip brewer':'drip', 'batch brew':'drip', 'electric drip':'drip', 'moccamaster':'drip', 'technivorm':'drip',
  'aiden':'aiden', 'fellow aiden':'aiden', 'fellow aiden precision':'aiden', 'fellow aiden precision brewer':'aiden', 'aiden precision':'aiden',
  'xbloom':'xbloom', 'xbloom studio':'xbloom', 'xbloom studio / original':'xbloom', 'xbloom studio/original':'xbloom', 'xbloom original':'xbloom',
  'switch':'switch', 'hario switch':'switch', 'immersion switch':'switch',
  'clever':'clever', 'clever dripper':'clever', 'abid clever':'clever',
  'aeropress':'aeropress', 'aero press':'aeropress', 'aeropress go':'aeropress', 'aeropress xl':'aeropress', 'aeropress clear':'aeropress',
  'siphon':'siphon', 'syphon':'siphon', 'vacuum pot':'siphon', 'vacuum siphon':'siphon', 'hario syphon':'siphon',
  'press':'press', 'french press':'press', 'cafetiere':'press', 'plunger':'press', 'espro press':'press',
  'turkish':'turkish', 'turkish coffee':'turkish', 'turkish cezve':'turkish', 'cezve':'turkish', 'ibrik':'turkish',
  'phin':'phin', 'vietnamese phin':'phin', 'ca phe phin':'phin', 'phin filter':'phin',
  'cold':'cold', 'cold brew':'cold', 'cold-brew':'cold', 'toddy':'cold', 'immersion cold brew':'cold',
  'cold-drip':'cold_drip', 'cold drip':'cold_drip', 'kyoto drip':'cold_drip', 'kyoto cold drip':'cold_drip', 'dutch coffee':'cold_drip', 'slow drip':'cold_drip', 'ice drip':'cold_drip', 'water drip':'cold_drip',
  'espresso':'espresso', 'espresso machine':'espresso', '9-bar espresso':'espresso', 'semi-automatic':'espresso',
  'lever-espresso':'lever_espresso', 'lever espresso':'lever_espresso', 'flair':'lever_espresso', 'flair 58':'lever_espresso', 'cafelat robot':'lever_espresso', 'londinium':'lever_espresso', 'la pavoni':'lever_espresso', 'pavoni':'lever_espresso', 'spring lever':'lever_espresso', 'manual lever':'lever_espresso',
  'moka':'moka', 'moka pot':'moka', 'bialetti':'moka', 'stovetop':'moka', 'stovetop espresso':'moka',
  'philips5500':'philips5500', 'philips 5500 lattego':'philips5500', 'philips 5500':'philips5500', 'ep5500':'philips5500', 'ep5547':'philips5500', 'lattego':'philips5500', 'super-automatic':'philips5500',
  'sca-cupping':'sca_cupping', 'sca cupping':'sca_cupping', 'cupping':'sca_cupping'
};
function resolveMethod(val){
  const raw = unneutralize(val == null ? '' : val).trim();
  if (!raw) return '';
  const lowRaw = raw.toLowerCase();
  if (_BT_V6_METHOD_SET.has(lowRaw) || lowRaw === 'sca_cupping') return lowRaw;
  const s = _canonToken(raw);
  if (!s) return '';
  if (METHOD_ALIASES[s]) return METHOD_ALIASES[s];
  if (typeof METHODS !== 'undefined'){ const d = _matchDynamicList(METHODS, s) || _matchDynamicList(METHODS, lowRaw); if (d) return d; }
  if (typeof MACHINES !== 'undefined'){ const d = _matchDynamicList(MACHINES, s) || _matchDynamicList(MACHINES, lowRaw); if (d) return d; }
  return '';
}
const TECH_ALIASES = {
  'standard':'standard',
  'pulse':'pulse', 'pulse-4-6':'pulse', 'pulse_4_6':'pulse', '4:6':'pulse', '4-6':'pulse', 'pulse pours (4:6 method)':'pulse',
  'flash':'flash', 'iced-brew-over-ice':'flash', 'iced_brew_over_ice':'flash', 'iced: brew onto ice':'flash', 'iced: drain onto ice':'flash', 'iced: press onto ice':'flash', 'japanese iced':'flash',
  'iceafter':'iceafter', 'iced-add-after':'iceafter', 'iced_add_after':'iceafter', 'iced: add ice after':'iceafter'
};
function resolveTechCsv(val){
  const raw = unneutralize(val == null ? '' : val).trim().toLowerCase();
  if (!raw) return 'standard';
  return TECH_ALIASES[raw] || TECH_ALIASES[_canonToken(raw)] || 'standard';
}
function valueByLabel(list, label){
  const s = unneutralize(label == null ? '' : label).trim();
  if (!s || !Array.isArray(list)) return '';
  const l = s.toLowerCase();
  const x = list.find(i => i && ((i.label && i.label.toLowerCase() === l) || (i.v !== undefined && String(i.v).toLowerCase() === l) || (i.key !== undefined && String(i.key).toLowerCase() === l)));
  if (x) return x.v !== undefined ? x.v : x.key;
  if (typeof ROASTS !== 'undefined' && list === ROASTS){ const r = resolveRoast(s); return list.some(i => i.v === r) ? r : (r === 'ultra-light' && list.some(i => i.v === 'light') ? 'light' : r); }
  if (typeof PROCESSES !== 'undefined' && list === PROCESSES){ const p = resolveProcess(s); if (list.some(i => i.v === p)) return p; if ((/^honey-/.test(p) || /-honey$/.test(p)) && list.some(i => i.v === 'honey')) return 'honey'; if ((p === 'thermal-shock' || p === 'yeast-koji' || p === 'yeast') && list.some(i => i.v === 'anaerobic')) return 'anaerobic'; return p; }
  if (typeof DENSITIES !== 'undefined' && list === DENSITIES){ const d = resolveDensity(s); return list.some(i => i.v === d) ? d : (d === 'ultra-high' && list.some(i => i.v === 'high') ? 'high' : d); }
  if (typeof BLEND_OPTS !== 'undefined' && list === BLEND_OPTS) return resolveBlend(s);
  if (typeof METHODS !== 'undefined' && list === METHODS) return resolveMethod(s);
  return '';
}
function splitList(s){ return String(s || '').split(';').map(x => x.trim()).filter(Boolean); }

/* ---------- Descriptive 1..5 Intensity & 2D Pad Bidirectional Sync ---------- */
const CVA_INTENSITY_SCALAR_MAP = [
  ['acidity_intensity', 'ac', 'acidity'],
  ['body_intensity', 'bd', 'body'],
  ['sweetness_intensity', 'sw', 'sweetness'],
  ['bitterness_intensity', 'bt', 'bitterness'],
  ['astringency_intensity', 'as', 'astringency'],
  ['clarity_intensity', 'cl', 'clarity']
];
const CVA_INTENSITY_KEYS = ['fr', 'ar', 'fl', 'af', 'ac', 'sw', 'bd', 'bt', 'as', 'cl'];
const CVA_INTENSITY_KEY_ALIASES = {
  fr:'fr', fragrance:'fr', ar:'ar', aroma:'ar', fl:'fl', flavor:'fl', af:'af', aftertaste:'af',
  ac:'ac', acidity:'ac', acidity_intensity:'ac',
  sw:'sw', sweetness:'sw', sweetness_intensity:'sw',
  bd:'bd', body:'bd', mouthfeel:'bd', body_intensity:'bd',
  bt:'bt', bitterness:'bt', bitterness_intensity:'bt',
  as:'as', astringency:'as', astringency_intensity:'as',
  cl:'cl', clarity:'cl', clarity_intensity:'cl'
};
function cvaIntensityVal(v){
  const x = typeof v === 'number' ? v : (typeof v === 'string' && /^\s*[1-5]\s*$/.test(v) ? parseInt(v, 10) : NaN);
  return Number.isInteger(x) && x >= 1 && x <= 5 ? x : null;
}
function _cleanPadXy(raw){
  if (!Array.isArray(raw) || raw.length < 2) return null;
  const x = parseFloat(raw[0]), y = parseFloat(raw[1]);
  if (!isFinite(x) || !isFinite(y)) return null;
  return [Math.max(-1, Math.min(1, Math.round(x * 1000) / 1000)), Math.max(-1, Math.min(1, Math.round(y * 1000) / 1000))];
}
function _cleanV6SensoryEnvelope(raw){
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const out = {};
  const xy = _cleanPadXy(raw.padXY || raw.pad_xy);
  if (xy) out.padXY = xy;
  if (raw.dualPin && typeof raw.dualPin === 'object' && !Array.isArray(raw.dualPin)){
    const dp = {};
    const sxy = _cleanPadXy(raw.dualPin.sensorXY || raw.dualPin.sensor_xy);
    if (sxy) dp.sensorXY = sxy;
    if (typeof raw.dualPin.gapNorm === 'number' && isFinite(raw.dualPin.gapNorm)) dp.gapNorm = Math.round(raw.dualPin.gapNorm * 1000) / 1000;
    if (typeof raw.dualPin.channelingDetected === 'boolean') dp.channelingDetected = raw.dualPin.channelingDetected;
    if (typeof raw.dualPin.note === 'string' && raw.dualPin.note.trim()) dp.note = raw.dualPin.note.trim().slice(0, 120);
    if (Object.keys(dp).length) out.dualPin = dp;
  }
  if (raw.goldenSip && typeof raw.goldenSip === 'object' && !Array.isArray(raw.goldenSip)){
    const gs = {};
    ['vessel', 'hot', 'warm', 'golden', 'cool', 'stageAtTaste'].forEach(gk => {
      if (typeof raw.goldenSip[gk] === 'string' && raw.goldenSip[gk].trim()) gs[gk] = raw.goldenSip[gk].trim().slice(0, 160);
    });
    ['t0MixedC', 'tastedTempC', 'elapsedS'].forEach(nk => {
      if (typeof raw.goldenSip[nk] === 'number' && isFinite(raw.goldenSip[nk])) gs[nk] = Math.round(raw.goldenSip[nk] * 10) / 10;
    });
    if (typeof raw.goldenSip.lidOff === 'boolean') gs.lidOff = raw.goldenSip.lidOff;
    if (Object.keys(gs).length) out.goldenSip = gs;
  }
  if (raw.splitCards && typeof raw.splitCards === 'object' && !Array.isArray(raw.splitCards)){
    const sc = {};
    Object.keys(raw.splitCards).slice(0, 8).forEach(sk => {
      if (typeof raw.splitCards[sk] === 'string' && raw.splitCards[sk].trim()) sc[sk.slice(0, 24)] = raw.splitCards[sk].trim().slice(0, 32);
    });
    if (Object.keys(sc).length) out.splitCards = sc;
  }
  if (raw.scratchReveal && typeof raw.scratchReveal === 'object' && !Array.isArray(raw.scratchReveal)){
    const sr = {};
    if (typeof raw.scratchReveal.revealed === 'boolean') sr.revealed = raw.scratchReveal.revealed;
    if (Array.isArray(raw.scratchReveal.matchedNotes)) sr.matchedNotes = raw.scratchReveal.matchedNotes.filter(x => typeof x === 'string').slice(0, 10).map(x => x.slice(0, 32));
    if (Object.keys(sr).length) out.scratchReveal = sr;
  }
  if (raw.exclude_learning === true || raw.excludeLearning === true) out.exclude_learning = true;
  if (typeof raw.outlier_reason === 'string' && raw.outlier_reason.trim()) out.outlier_reason = raw.outlier_reason.trim().slice(0, 32);
  else if (typeof raw.outlierReason === 'string' && raw.outlierReason.trim()) out.outlier_reason = raw.outlierReason.trim().slice(0, 32);
  if (typeof raw.surprise_z === 'number' && isFinite(raw.surprise_z)) out.surprise_z = Math.round(raw.surprise_z * 100) / 100;
  if (typeof raw.drawdown_cue === 'string' && /^(fast|normal|slow)$/.test(raw.drawdown_cue)) out.drawdown_cue = raw.drawdown_cue;
  if (typeof raw.context_tag === 'string' && /^(normal|off_palate|chalky_water|not_my_style)$/.test(raw.context_tag)) out.context_tag = raw.context_tag;
  if (raw.r2_discrepancy && typeof raw.r2_discrepancy === 'object' && !Array.isArray(raw.r2_discrepancy)){
    const rd = {};
    if (typeof raw.r2_discrepancy.active === 'boolean') rd.active = raw.r2_discrepancy.active;
    if (typeof raw.r2_discrepancy.winningId === 'string') rd.winningId = raw.r2_discrepancy.winningId.slice(0, 36);
    if (typeof raw.r2_discrepancy.prob === 'number' && isFinite(raw.r2_discrepancy.prob)) rd.prob = Math.round(raw.r2_discrepancy.prob * 1000) / 1000;
    if (typeof raw.r2_discrepancy.dualPinGap === 'number' && isFinite(raw.r2_discrepancy.dualPinGap)) rd.dualPinGap = Math.round(raw.r2_discrepancy.dualPinGap * 1000) / 1000;
    if (Object.keys(rd).length) out.r2_discrepancy = rd;
  }
  return Object.keys(out).length ? out : null;
}
function isRowExcludedFromLearning(rowObj){
  if (!rowObj || typeof rowObj !== 'object') return false;
  if (rowObj.exclude_learning === true || rowObj.exclude_learning === 'yes') return true;
  const ci = readCvaIntensities(rowObj);
  if (ci && ci.v6 && ci.v6.exclude_learning === true) return true;
  const ad = readV6Adaptation(rowObj);
  if (ad && ad.v6 && ad.v6.exclude_learning === true) return true;
  return false;
}
function readCvaIntensities(o){
  o = o || {};
  const out = {};
  if (typeof o.cva_intensity_json === 'string' && o.cva_intensity_json.trim()){
    try {
      const parsed = JSON.parse(o.cva_intensity_json);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)){
        Object.keys(parsed).forEach(k => {
          if (k === 'pad_xy'){
            const xy = _cleanPadXy(parsed.pad_xy);
            if (xy) out.pad_xy = xy;
            return;
          }
          if (k === 'v6'){
            const v6Clean = _cleanV6SensoryEnvelope(parsed.v6);
            if (v6Clean){
              out.v6 = v6Clean;
              if (!out.pad_xy && v6Clean.padXY) out.pad_xy = v6Clean.padXY;
            }
            return;
          }
          const ck = CVA_INTENSITY_KEY_ALIASES[k];
          const iv = ck ? cvaIntensityVal(parsed[k]) : null;
          if (iv != null) out[ck] = iv;
        });
      }
    } catch(e){}
  }
  CVA_INTENSITY_SCALAR_MAP.forEach(m => {
    const iv = cvaIntensityVal(o[m[0]]);
    if (iv != null) out[m[1]] = iv;
  });
  return out;
}
function syncRowIntensities(row, src){
  const merged = readCvaIntensities(row);
  if (src && typeof src === 'object'){
    Object.keys(src).forEach(k => {
      if (k === 'pad_xy'){
        if (src.pad_xy === null || src.pad_xy === '') delete merged.pad_xy;
        else { const xy = _cleanPadXy(src.pad_xy); if (xy) merged.pad_xy = xy; }
        return;
      }
      if (k === 'v6'){
        if (src.v6 === null || src.v6 === '') delete merged.v6;
        else {
          const baseV6 = Object.assign({}, merged.v6 || {}, src.v6);
          if (src.v6.exclude_learning === false){ delete baseV6.exclude_learning; delete baseV6.excludeLearning; }
          if (src.v6.outlier_reason === ''){ delete baseV6.outlier_reason; delete baseV6.outlierReason; }
          const v6Merged = _cleanV6SensoryEnvelope(baseV6);
          if (v6Merged) merged.v6 = v6Merged;
          else delete merged.v6;
        }
        return;
      }
      const ck = CVA_INTENSITY_KEY_ALIASES[k];
      if (!ck) return;
      const raw = src[k];
      if (raw === '' || raw === null || raw === 0) delete merged[ck];
      else { const iv = cvaIntensityVal(raw); if (iv != null) merged[ck] = iv; }
    });
  }
  CVA_INTENSITY_SCALAR_MAP.forEach(m => {
    row[m[0]] = merged[m[1]] != null ? String(merged[m[1]]) : '';
  });
  const ordered = {};
  CVA_INTENSITY_KEYS.forEach(k => { if (merged[k] != null) ordered[k] = merged[k]; });
  if (merged.pad_xy) ordered.pad_xy = merged.pad_xy;
  if (merged.v6){
    if (merged.pad_xy && !merged.v6.padXY) merged.v6.padXY = merged.pad_xy;
    ordered.v6 = merged.v6;
  }
  row.cva_intensity_json = Object.keys(ordered).length ? JSON.stringify(ordered) : '';
  return row;
}

/* Zero-Legacy-Handcuffs Reader: extracts factual sensor & v6 telemetry while ignoring stale pre-v6 heuristic engine guesses */
function readV6Adaptation(rowObj){
  if (!rowObj || typeof rowObj !== 'object') return null;
  const isV6 = String(rowObj.schema_version || '').trim() === '6.0';
  let parsed = null;
  if (rowObj.recipe_adaptation_json){
    try {
      const p = typeof rowObj.recipe_adaptation_json === 'string' ? JSON.parse(rowObj.recipe_adaptation_json) : rowObj.recipe_adaptation_json;
      if (p && typeof p === 'object' && !Array.isArray(p)) parsed = p;
    } catch(e){}
  }
  if (!parsed) return isV6 ? { schema:'6.0', factualOnly:true } : null;
  const out = { schema:isV6 ? '6.0' : String(rowObj.schema_version || 'legacy'), factualOnly:!isV6 && !parsed.v6 };
  ['agtron', 'bean_agtron', 'ground_agtron', 'agtron_scale', 'roast_delta', 'psd_d10_um', 'psd_d50_um', 'psd_d90_um', 'psd_span', 'ble_summary', 'machine_profile'].forEach(fk => {
    if (parsed[fk] !== undefined && parsed[fk] !== null) out[fk] = parsed[fk];
  });
  if (parsed.v6 && typeof parsed.v6 === 'object' && !Array.isArray(parsed.v6)){
    out.v6 = parsed.v6;
  }
  /* Explicitly drop stale pre-v6 heuristic fields (layer1, layer2a, layer2b, be_offset, heuristic_ey) so BTCoreV6 evaluates fresh */
  return out;
}

/* ---------- Quick Cupping & Flavor Helpers ---------- */
const QUICK_AREAS = [
  { key:'smell', col:'q_smell', label:'Smell', ask:'How did it smell?', words:'fragrance_aroma' },
  { key:'taste', col:'q_taste', label:'Taste', ask:'How did it taste?', words:'flavor' },
  { key:'aftertaste', col:'q_aftertaste', label:'Aftertaste', ask:'How was the aftertaste?', words:'aftertaste' },
  { key:'acidity', col:'q_acidity', label:'Acidity', ask:'How did you like the acidity?', words:'' },
  { key:'sweetness', col:'q_sweetness', label:'Sweetness', ask:'How did you like the sweetness?', words:'' },
  { key:'body', col:'q_body', label:'Body', ask:'How did you like the body?', words:'' }
];
const QUICK_GRADES = [{ v:'good', label:'Good' }, { v:'okay', label:'Okay' }, { v:'notgood', label:'Not good' }, { v:'unsure', label:"Couldn't tell" }];
const MAKE_AGAIN = [{ v:'yes', label:'Yes' }, { v:'maybe', label:'Maybe' }, { v:'no', label:'No' }];
function quickGrade(v){ v = String(v == null ? '' : v).trim().toLowerCase(); return QUICK_GRADES.some(g => g.v === v) ? v : ''; }
function quickMakeAgain(v){ v = String(v == null ? '' : v).trim().toLowerCase(); return MAKE_AGAIN.some(g => g.v === v) ? v : ''; }
function bagFlavors(text){
  const seen = new Set(), out = [];
  String(text || '').split(/[,;\/&]|\band\b/i).map(x => x.trim().replace(/\s+/g, ' ')).filter(x => x.length >= 3 && x.length <= 24).forEach(x => {
    const k = x.toLowerCase(); if (!seen.has(k) && out.length < 10){ seen.add(k); out.push(k); }
  });
  return out;
}
function cleanFlavorLists(liked, notLiked){
  const clean = a => { const seen = new Set(), out = []; (Array.isArray(a) ? a : []).forEach(x => { const t = String(x == null ? '' : x).trim().toLowerCase().slice(0, 24); if (t.length >= 3 && !seen.has(t) && out.length < 12){ seen.add(t); out.push(t); } }); return out; };
  const l = clean(liked), n = clean(notLiked).filter(x => !l.includes(x));
  return { liked:l, notLiked:n };
}
function quickAnswers(o){
  o = o || {}; const areas = {}; QUICK_AREAS.forEach(a => { const g = quickGrade(o[a.col]); if (g) areas[a.key] = g; });
  const fl = cleanFlavorLists(String(o.flavors_liked || '').split(';'), String(o.flavors_not_liked || '').split(';'));
  return { makeAgain:quickMakeAgain(o.make_again), areas, liked:fl.liked, notLiked:fl.notLiked };
}
function hasQuick(o){ o = o || {}; if (String(o.score_kind || '') === 'quick') return true; const q = quickAnswers(o); return !!q.makeAgain || Object.keys(q.areas).length > 0 || q.liked.length > 0 || q.notLiked.length > 0; }
function hasCupping(o){ o = o || {}; const k = String(o.score_kind || ''); if (k === 'sca_5cup' || k === 'home_1cup' || k === 'cva_affective') return true; const n = parseFloat(o.total_score); return k !== 'quick' && !isNaN(n) && n > 0; }
function cupWay(o){ const q = hasQuick(o), c = hasCupping(o); return q && c ? 'both' : c ? 'cupping' : q ? 'quick' : 'cupping'; }

/* ---------- Unified Non-Pooling Hedonic Rating Resolver ---------- */
const RATING_KIND_PRIORS = { cva_affective:[82.0, 5.0], sca_5cup:[83.0, 3.0], home_1cup:[81.0, 4.5] };
function computeHistoryRatingStats(rows){
  const list = Array.isArray(rows) ? rows : [], starVals = [];
  const byKind = { cva_affective:[], sca_5cup:[], home_1cup:[] };
  list.forEach(o => {
    if (!o) return;
    const st = validStars(o.my_rating_stars);
    if (st > 0) starVals.push(st);
    const ts = parseFloat(o.total_score);
    if (hasCupping(o) && isFinite(ts) && ts > 0){
      const k = byKind[o.score_kind] ? o.score_kind : 'home_1cup';
      byKind[k].push(ts);
    }
  });
  const nStar = starVals.length, mu0 = 3.50, sig0 = 0.75, kap0 = 3.0;
  const muStar = (starVals.reduce((a, b) => a + b, 0) + kap0 * mu0) / (nStar + kap0);
  const sigStar = Math.max(0.50, Math.sqrt((starVals.reduce((a, b) => a + (b - muStar) * (b - muStar), 0) + kap0 * sig0 * sig0) / (nStar + kap0)));
  const scales = {};
  Object.keys(RATING_KIND_PRIORS).forEach(k => {
    const arr = byKind[k], p = RATING_KIND_PRIORS[k], nm = arr.length;
    const mu = (arr.reduce((a, b) => a + b, 0) + 3 * p[0]) / (nm + 3);
    const sig = Math.max(1.50, Math.sqrt((arr.reduce((a, b) => a + (b - mu) * (b - mu), 0) + 3 * p[1] * p[1]) / (nm + 3)));
    scales[k] = { mu, sigma:sig, n:nm };
  });
  return { muStar, sigmaStar:sigStar, nStar, scales };
}
function _btComputeUnifiedRatingCore(o, stats){
  if (!o || typeof o !== 'object') return { r:null, starEq:null, rEquiv:null, u:null, rho:0, wQual:0, source:'none', hasScore:false };
  const clampR = x => Math.max(0.5, Math.min(5.0, Math.round(x * 1000) / 1000));
  const pack = (r, rho, source) => {
    const u = r != null ? Math.max(0, Math.min(1, (r - 1) / 4)) : null;
    return { r, starEq:r, rEquiv:r, u, rho, wQual:rho, source, hasScore:r != null };
  };
  const st = validStars(o.my_rating_stars);
  if (st > 0) return pack(st, 1.0, 'stars');
  const ts = parseFloat(o.total_score);
  if (hasCupping(o) && isFinite(ts) && ts > 0){
    const k = RATING_KIND_PRIORS[o.score_kind] ? o.score_kind : 'home_1cup';
    const sc = stats && stats.scales && stats.scales[k] ? stats.scales[k] : { mu:RATING_KIND_PRIORS[k][0], sigma:RATING_KIND_PRIORS[k][1] };
    const muStar = stats && isFinite(stats.muStar) ? stats.muStar : 3.50;
    return pack(clampR(muStar + 0.85 * ((ts - sc.mu) / Math.max(1.50, sc.sigma))), 0.80, k);
  }
  if (hasQuick(o)){
    let nAns = 0, nGood = 0, nBad = 0;
    QUICK_AREAS.forEach(a => {
      const g = quickGrade(o[a.col]);
      if (g && g !== 'unsure'){ nAns++; if (g === 'good') nGood++; else if (g === 'notgood') nBad++; }
    });
    const mk = quickMakeAgain(o.make_again);
    if (mk || nAns > 0){
      const gRatio = (nGood - nBad) / Math.max(1, nAns);
      const mVal = mk === 'yes' ? 0.75 : mk === 'no' ? -1.0 : 0;
      return pack(clampR(3.25 + 0.90 * mVal + 0.60 * gRatio), 0.55, 'quick');
    }
  }
  return pack(null, 0, 'none');
}
function computeUnifiedRating(o, stats){ return _btComputeUnifiedRatingCore(o, stats); }

/* ---------- SCA CVA 103/104 Cupping Codec & Skip Imputation ---------- */
const CVA_KIND = 'cva_affective';
const CVA_SECTIONS = [
  { key:'fragrance', name:'Fragrance', col:'fragrance', noteCol:'note_fragrance_aroma', firstCol:'', retaste:false, skippable:true },
  { key:'aroma', name:'Aroma', col:'aroma', noteCol:'note_aroma', firstCol:'', retaste:false, skippable:true },
  { key:'flavor', name:'Flavor', col:'flavor', noteCol:'note_flavor', firstCol:'first_flavor', retaste:true, skippable:false },
  { key:'aftertaste', name:'Aftertaste', col:'aftertaste', noteCol:'note_aftertaste', firstCol:'first_aftertaste', retaste:true, skippable:false },
  { key:'acidity', name:'Acidity', col:'acidity', noteCol:'note_acidity', firstCol:'first_acidity', retaste:true, skippable:false },
  { key:'sweetness', name:'Sweetness', col:'sweetness', noteCol:'note_sweetness', firstCol:'first_sweetness', retaste:true, skippable:false },
  { key:'mouthfeel', name:'Mouthfeel', col:'body', noteCol:'note_body', firstCol:'first_body', retaste:true, skippable:false },
  { key:'overall', name:'Overall', col:'overall', noteCol:'note_overall', firstCol:'first_overall', retaste:true, skippable:false }
];
const CVA_RETASTE_FROM = 2;
const CVA_WORDS = ['Dislike extremely', 'Dislike very much', 'Dislike moderately', 'Dislike slightly', 'Neither like nor dislike', 'Like slightly', 'Like moderately', 'Like very much', 'Like extremely'];
const CVA_DEFECT_TYPES = ['potato', 'moldy', 'phenolic'];
const CVA_COLUMNS = CVA_SECTIONS.map(s => s.col).concat(CVA_SECTIONS.map(s => s.noteCol), CVA_SECTIONS.filter(s => s.firstCol).map(s => s.firstCol),
  ['cva_retasted', 'taint_cups', 'fault_cups', 'defect_deduction', 'defect_type', 'fix_symptom', 'total_score', 'score_kind']);
function cvaScore(v){
  const x = typeof v === 'number' ? v : (typeof v === 'string' && /^\s*[1-9]\s*$/.test(v) ? parseInt(v, 10) : NaN);
  return Number.isInteger(x) && x >= 1 && x <= 9 ? x : null;
}
function cvaFresh(){
  return { score:{}, fin:{}, skip:{}, notes:{}, desc:{}, cur:0, open:0, cool:{ started:false, skipped:false, done:false, i:CVA_RETASTE_FROM }, defect:false, dtype:'', sym:'' };
}
function cvaClean(x){
  const c = cvaFresh(); if (!x || typeof x !== 'object') return c;
  CVA_SECTIONS.forEach(s => {
    const v = cvaScore(x.score && x.score[s.key]); if (v) c.score[s.key] = v;
    const f = cvaScore(x.fin && x.fin[s.key]); if (f && s.retaste && v) c.fin[s.key] = f;
    if (s.skippable && !v && x.skip && x.skip[s.key] === true) c.skip[s.key] = true;
    if (x.notes && typeof x.notes[s.key] === 'string') c.notes[s.key].slice(0, 500) && (c.notes[s.key] = x.notes[s.key].slice(0, 500));
  });
  if (x.desc && typeof x.desc === 'object' && !Array.isArray(x.desc)){
    Object.keys(x.desc).forEach(k => {
      if (k === 'pad_xy'){ const xy = _cleanPadXy(x.desc.pad_xy); if (xy) c.desc.pad_xy = xy; return; }
      const ck = CVA_INTENSITY_KEY_ALIASES[k] || k;
      const iv = cvaIntensityVal(x.desc[k]);
      if (iv != null) c.desc[ck] = iv;
    });
  }
  const cool = x.cool && typeof x.cool === 'object' ? x.cool : {};
  const allFin = CVA_SECTIONS.every(s => !s.retaste || (c.fin[s.key] && c.score[s.key]));
  c.cool.skipped = cool.skipped === true; c.cool.done = c.cool.skipped || (cool.done === true && allFin);
  c.cool.started = !c.cool.skipped && (cool.started === true || c.cool.done);
  c.cool.i = Number.isInteger(cool.i) && cool.i >= CVA_RETASTE_FROM && cool.i < CVA_SECTIONS.length ? cool.i : CVA_RETASTE_FROM;
  c.defect = x.defect === true; c.dtype = CVA_DEFECT_TYPES.includes(x.dtype) && c.defect ? x.dtype : '';
  let miss = 0; while (miss < CVA_SECTIONS.length && (c.score[CVA_SECTIONS[miss].key] || c.skip[CVA_SECTIONS[miss].key])) miss++;
  let cur = Number.isInteger(x.cur) ? Math.max(0, Math.min(10, x.cur)) : 0;
  if (miss < CVA_SECTIONS.length) cur = Math.min(cur, miss);
  else if (!c.cool.done) cur = Math.min(cur, 8);
  else if (c.defect && !c.dtype) cur = Math.min(cur, 9);
  c.cur = cur; c.open = Number.isInteger(x.open) && x.open >= 0 && x.open <= cur ? x.open : cur;
  c.sym = typeof x.sym === 'string' ? x.sym.slice(0, 24) : '';
  return c;
}
function cvaFinals(c){
  return CVA_SECTIONS.map(s => {
    if (c.skip && c.skip[s.key]) return null;
    const first = cvaScore(c.score && c.score[s.key]); if (first == null) return null;
    const fin = cvaScore(c.fin && c.fin[s.key]);
    return c.cool && c.cool.done && !c.cool.skipped && s.retaste && fin != null ? fin : first;
  });
}
function cvaDefective(c){ return !!c && c.defect === true && CVA_DEFECT_TYPES.includes(c.dtype); }
function cvaTotal(c){
  if (!c) return null;
  const f = cvaFinals(c);
  for (let i = 0; i < CVA_SECTIONS.length; i++){
    const s = CVA_SECTIONS[i];
    if (f[i] == null){
      if (!s.skippable) return null;
      if (!(c.skip && c.skip[s.key])) return null;
    }
  }
  const scored = f.filter(v => v != null);
  if (scored.length < 6) return null;
  const sum8 = scored.length === CVA_SECTIONS.length ? scored.reduce((a, b) => a + b, 0) : (scored.reduce((a, b) => a + b, 0) * CVA_SECTIONS.length / scored.length);
  const uCups = Number.isInteger(c.nonUniformCups) && c.nonUniformCups > 0 ? Math.min(5, c.nonUniformCups) : 0;
  const dCups = cvaDefective(c) ? (Number.isInteger(c.faultCups) && c.faultCups > 0 ? Math.min(5, c.faultCups) : 1) : 0;
  return Math.round((0.65625 * sum8 + 52.75 - 2 * uCups - 4 * dCups) * 4) / 4;
}
function cvaRowPart(c){
  const r = {}, f = cvaFinals(c), re = !!(c.cool && c.cool.done && !c.cool.skipped), t = cvaTotal(c), bad = cvaDefective(c);
  const uCups = Number.isInteger(c.nonUniformCups) && c.nonUniformCups > 0 ? Math.min(5, c.nonUniformCups) : 0;
  const dCups = bad ? (Number.isInteger(c.faultCups) && c.faultCups > 0 ? Math.min(5, c.faultCups) : 1) : 0;
  CVA_SECTIONS.forEach((s, i) => {
    if (f[i] != null) r[s.col] = String(f[i]);
    if (re && s.retaste && f[i] != null && cvaScore(c.score[s.key]) != null) r[s.firstCol] = String(cvaScore(c.score[s.key]));
    const n = c.notes && typeof c.notes[s.key] === 'string' ? c.notes[s.key].trim() : ''; if (n) r[s.noteCol] = n;
  });
  r.cva_retasted = re ? 'yes' : 'no';
  if (uCups > 0) r.uniformity = String(Math.max(0, 10 - 2 * uCups));
  r.taint_cups = '0'; r.fault_cups = String(dCups); r.defect_deduction = String(4 * dCups); r.defect_type = bad ? c.dtype : '';
  r.fix_symptom = /^[a-z_]{2,24}$/.test(c.sym || '') ? c.sym : '';
  r.total_score = t == null ? '' : t.toFixed(2); r.score_kind = CVA_KIND;
  return r;
}
function cvaRead(o){
  o = o || {};
  const sections = CVA_SECTIONS.map(s => ({ key:s.key, name:s.name, final:cvaScore(o[s.col]), first:s.firstCol ? cvaScore(o[s.firstCol]) : null, note:String(o[s.noteCol] || '') }));
  const t = parseFloat(o.total_score), type = String(o.defect_type || '').trim().toLowerCase();
  return { sections, retasted:String(o.cva_retasted || '').trim().toLowerCase() === 'yes', defect:CVA_DEFECT_TYPES.includes(type) ? type : '', total:isNaN(t) ? null : t, intensities:readCvaIntensities(o) };
}

/* ---------- Non-Destructive Coffee & Tasting Row Editors ---------- */
const EDITABLE_COLUMNS = [
  'roaster', 'coffee_name', 'origin', 'blend', 'process', 'decaf', 'roast_level', 'elevation_class', 'elevation_m',
  'roast_date', 'days_since_roast', 'varietal', 'bag_notes',
  'species', 'decaf_process', 'is_frozen', 'frozen_date', 'freeze_days_offset'
];
const _CANON_ROAST_LABELS = { 'ultra-light':'Ultra-light', light:'Light', 'medium-light':'Medium-light', medium:'Medium', 'medium-dark':'Medium-dark', dark:'Dark' };
const _CANON_PROC_LABELS = {
  washed:'Washed', natural:'Natural', honey:'Honey', 'white-honey':'White honey', 'yellow-honey':'Yellow honey', 'red-honey':'Red honey', 'black-honey':'Black honey', 'honey-white':'White honey', 'honey-yellow':'Yellow honey', 'honey-red':'Red honey', 'honey-black':'Black honey',
  anaerobic:'Anaerobic', carbonic:'Carbonic maceration', 'thermal-shock':'Thermal shock', 'yeast-koji':'Yeast / Koji', yeast:'Yeast / Koji', infused:'Co-fermented / infused', 'wet-hulled':'Wet-hulled', unknown:'Not sure'
};
const _CANON_DENS_LABELS = { low:'Lower', mid:'Mid', high:'High', 'very-high':'Very high', 'ultra-high':'Ultra-high', unknown:'Not sure' };
const _CANON_BLEND_LABELS = { single:'Single origin', blend:'Blend' };

function cleanLine(v){ return String(v == null ? '' : v).replace(/[\r\n\t]+/g, ' ').replace(/ {2,}/g, ' ').trim(); }
function computeFreezeOffsetDays(roastDate, frozenDate, brewDate){
  if (!_btValidIsoDate(roastDate) || !_btValidIsoDate(frozenDate)) return null;
  const ref = brewDate && !isNaN(brewDate) ? brewDate : new Date();
  const totalDays = _btDaysSinceRoast(roastDate, ref);
  const sinceFreeze = _btDaysSinceRoast(frozenDate, ref);
  if (totalDays == null || sinceFreeze == null || sinceFreeze <= 0) return 0;
  const frozenSpan = Math.min(totalDays, sinceFreeze);
  return Math.max(0, Math.round(frozenSpan * (1 - 1 / 12.3)));
}
function coffeeEditCells(edit, cuppingDate, prevRow){
  const t = x => neutralize(cleanLine(x)), prev = prevRow || {};
  const rKey = resolveRoast(edit.roast) || edit.roast || '', pKey = resolveProcess(edit.process) || edit.process || '';
  const dKey = resolveDensity(edit.density) || edit.density || '', bKey = resolveBlend(edit.blend) || edit.blend || '';
  const isDecaf = edit.decaf === 'yes' || edit.decaf === true;
  const pList = typeof PROCESSES !== 'undefined' ? PROCESSES : null;
  const rList = typeof ROASTS !== 'undefined' ? ROASTS : null;
  const dList = typeof DENSITIES !== 'undefined' ? DENSITIES : null;
  const bList = typeof BLEND_OPTS !== 'undefined' ? BLEND_OPTS : null;
  const out = {
    coffee_name:t(edit.name), roaster:t(edit.roaster), origin:t(edit.origin), varietal:t(edit.varietal),
    bag_notes:neutralize(String(edit.bag_notes || '').replace(/\r\n?/g, '\n').trim()),
    process:_btLabelOf(pList, pKey) || _CANON_PROC_LABELS[pKey] || (pKey ? cleanLine(pKey) : ''),
    roast_level:_btLabelOf(rList, rKey) || _CANON_ROAST_LABELS[rKey] || (rKey ? cleanLine(rKey) : ''),
    decaf:isDecaf ? 'yes' : '',
    blend:_btLabelOf(bList, bKey) || _CANON_BLEND_LABELS[bKey] || ''
  };
  const typed = String(edit.elevText || '').trim(), em = _btMapElevation(typed);
  if (typed && em.cls){
    const ec = resolveDensity(em.cls, em.m) || em.cls;
    out.elevation_class = _btLabelOf(dList, ec) || _CANON_DENS_LABELS[ec] || '';
    out.elevation_m = String(em.m);
  } else {
    out.elevation_class = _btLabelOf(dList, dKey) || _CANON_DENS_LABELS[dKey] || '';
    out.elevation_m = '';
  }
  const rd = _btValidIsoDate(edit.roast_date) ? edit.roast_date : '';
  out.roast_date = rd;
  const cd = /^\d{4}-\d{2}-\d{2}$/.test(cuppingDate || '') ? new Date(cuppingDate + 'T12:00:00') : null;
  const days = rd && cd && !isNaN(cd) ? _btDaysSinceRoast(rd, cd) : null;
  out.days_since_roast = days == null ? '' : String(days);
  out.species = 'species' in edit ? t(edit.species) : (prev.species || '');
  out.decaf_process = 'decaf_process' in edit ? (isDecaf ? t(edit.decaf_process) : '') : (isDecaf ? (prev.decaf_process || '') : '');
  const isFrz = 'is_frozen' in edit ? (edit.is_frozen === 'yes' || edit.is_frozen === true ? 'yes' : '') : (prev.is_frozen === 'yes' ? 'yes' : '');
  out.is_frozen = isFrz;
  const fd = 'frozen_date' in edit ? (_btValidIsoDate(edit.frozen_date) ? edit.frozen_date : '') : (_btValidIsoDate(prev.frozen_date) ? prev.frozen_date : '');
  out.frozen_date = isFrz ? fd : '';
  if ('freeze_days_offset' in edit && /^\d+$/.test(String(edit.freeze_days_offset == null ? '' : edit.freeze_days_offset).trim())){
    out.freeze_days_offset = isFrz ? String(edit.freeze_days_offset).trim() : '';
  } else if (isFrz && rd && fd && cd){
    const off = computeFreezeOffsetDays(rd, fd, cd);
    out.freeze_days_offset = off != null && off > 0 ? String(off) : '';
  } else {
    out.freeze_days_offset = isFrz ? (prev.freeze_days_offset || '') : '';
  }
  return out;
}
function applyCoffeeEdit(header, rows, idxs, edit){
  const col = {}; header.forEach((k, i) => { col[k] = i; });
  if (col.coffee_name == null) return { error:'This file has no coffee_name column.' };
  if (!cleanLine(edit.name)) return { error:'A coffee needs a name.' };
  const set = new Set(idxs), cells = {};
  idxs.forEach(i => {
    const prevObj = {}; header.forEach((k, j) => { prevObj[k] = (rows[i] && rows[i][j] != null) ? rows[i][j] : ''; });
    cells[i] = coffeeEditCells(edit, col.cupping_date != null && rows[i] ? rows[i][col.cupping_date] : '', prevObj);
  });
  const hdr = header.slice();
  EDITABLE_COLUMNS.forEach(k => { if (!hdr.includes(k) && idxs.some(i => cells[i][k] !== '')) hdr.push(k); });
  const c2 = {}; hdr.forEach((k, i) => { c2[k] = i; });
  const grew = hdr.length > header.length, out = [], before = [];
  rows.forEach((r, i) => {
    const base = r.slice(); while (base.length < hdr.length) base.push('');
    if (!set.has(i)){ out.push(grew ? base : r); return; }
    const nr = base.slice(); let changed = false;
    EDITABLE_COLUMNS.forEach(k => { if (c2[k] == null) return; const nv = cells[i][k], ov = nr[c2[k]] == null ? '' : nr[c2[k]]; if (ov !== nv){ nr[c2[k]] = nv; changed = true; } });
    nr.forEach((v, j) => { if (!EDITABLE_COLUMNS.includes(hdr[j]) && v !== base[j]) throw new Error('A locked column would change: ' + hdr[j]); });
    if (changed){ before.push({ idx:i, row:r }); out.push(nr); } else out.push(grew ? base : r);
  });
  if (!before.length) return { rows, header, changed:0, before };
  return { rows:out, header:hdr, changed:before.length, before, added:hdr.slice(header.length) };
}
function sameCoffeeIdx(objs, o){
  const nm = x => _btNorm(unneutralize(x || '')).trim();
  if (o.coffee_id) return (objs || []).filter(x => x.coffee_id === o.coffee_id).map(x => x._i);
  return (objs || []).filter(x => nm(x.coffee_name) === nm(o.coffee_name) && nm(x.roaster) === nm(o.roaster)).map(x => x._i);
}
function coffeeEditFromRow(o){
  o = o || {};
  const g = k => unneutralize(o[k] || '');
  const rList = typeof ROASTS !== 'undefined' ? ROASTS : null;
  const pList = typeof PROCESSES !== 'undefined' ? PROCESSES : null;
  const bList = typeof BLEND_OPTS !== 'undefined' ? BLEND_OPTS : null;
  const dList = typeof DENSITIES !== 'undefined' ? DENSITIES : null;
  return {
    name:g('coffee_name'), roaster:g('roaster'), origin:g('origin'), varietal:g('varietal'), bag_notes:g('bag_notes'),
    roast:resolveRoast(g('roast_level')) || (rList ? valueByLabel(rList, g('roast_level')) : '') || '',
    process:resolveProcess(g('process')) || (pList ? valueByLabel(pList, g('process')) : '') || '',
    blend:resolveBlend(g('blend')) || (bList ? valueByLabel(bList, g('blend')) : '') || '',
    decaf:o.decaf === 'yes' ? 'yes' : '',
    density:resolveDensity(g('elevation_class'), o.elevation_m) || (dList ? valueByLabel(dList, g('elevation_class')) : '') || '',
    elevText:o.elevation_m ? o.elevation_m + ' m' : '',
    roast_date:_btValidIsoDate(o.roast_date) ? o.roast_date : '',
    species:cleanLine(g('species')),
    decaf_process:cleanLine(g('decaf_process')),
    is_frozen:o.is_frozen === 'yes' ? 'yes' : '',
    frozen_date:_btValidIsoDate(o.frozen_date) ? o.frozen_date : '',
    freeze_days_offset:/^\d+$/.test(String(o.freeze_days_offset || '').trim()) ? String(o.freeze_days_offset).trim() : ''
  };
}

const TASTING_EDIT_COLUMNS = [
  'brew_dose_g', 'brew_water_g', 'brew_ratio', 'brew_temp_f', 'brew_temp_c', 'brew_actual_time_s', 'brew_out_g', 'brew_tds_pct', 'brew_ey_pct',
  'brew_style', 'brew_ey_total_pct',
  'general_notes', 'my_rating_stars', 'make_again', 'fix_symptom',
  'acidity_intensity', 'body_intensity', 'sweetness_intensity', 'bitterness_intensity', 'astringency_intensity', 'clarity_intensity', 'cva_intensity_json'
].concat(QUICK_AREAS.map(a => a.col), CVA_SECTIONS.map(s => s.col), ['total_score']);
function tastingScoreState(o){
  const k = String((o && o.score_kind) || '');
  if (k === CVA_KIND) return 'ok';
  if (k === 'sca_5cup' || k === 'home_1cup') return 'older';
  return hasCupping(o) ? 'older' : 'none';
}
function tastingEditFromRow(o){
  o = o || {};
  const num = k => { const x = parseFloat(o[k]); return isFinite(x) && x > 0 ? String(x) : ''; };
  const q = quickAnswers(o), cv = cvaRead(o), scores = {};
  cv.sections.forEach(s => { scores[s.key] = s.final == null ? '' : s.final; });
  return {
    brew:{ dose:num('brew_dose_g'), water:num('brew_water_g'), temp_f:num('brew_temp_f'), actual_s:num('brew_actual_time_s'), out_g:num('brew_out_g'), tds:num('brew_tds_pct'), style:unneutralize(o.brew_style || ''), ey_total:num('brew_ey_total_pct') },
    notes:unneutralize(o.general_notes || ''),
    quick:{ stars:validStars(o.my_rating_stars) || '', makeAgain:q.makeAgain, areas:Object.assign({}, q.areas), sym:String(o.fix_symptom || '').trim() },
    intensity:readCvaIntensities(o),
    cupping:scores, scoreState:tastingScoreState(o), total:cv.total
  };
}
function tastingEstimateOut(o, dose, water){
  const mk = resolveMethod(o && o.brew_method);
  const allM = _btAllMethods();
  const m = allM.find(x => x.key === mk || x.label === String((o && o.brew_method) || ''));
  if (!m || m.type === 'cold') return null;
  if (typeof expectedYield === 'function' && typeof aboutGrams === 'function'){
    const e = expectedYield(m.type, +water, +dose, m.key);
    return e == null ? null : aboutGrams(e, m.type);
  }
  const d = +dose, w = +water;
  if (!(d > 0 && w > 0)) return null;
  if (m.type === 'espresso') return Math.round(d * 2.1);
  if (m.type === 'moka') return Math.round(w * 0.75);
  return Math.max(0, Math.round(w - 2.1 * d));
}
function tastingTotal(byKey, defectType){
  const score = {}, skip = {};
  CVA_SECTIONS.forEach(s => {
    const v = cvaScore(byKey[s.key]);
    if (v) score[s.key] = v;
    else if (s.skippable) skip[s.key] = true;
  });
  const dt = String(defectType || '').trim().toLowerCase();
  return cvaTotal({ score:score, fin:{}, skip:skip, cool:{ done:false, skipped:false }, defect:CVA_DEFECT_TYPES.includes(dt), dtype:dt });
}
const TE_LIMITS = { dose:[0.5, 500, 'The coffee weight'], water:[1, 10000, 'The water weight'], temp_f:[32, 212, 'The temperature'], actual_s:[1, 86400, 'The brew time'], out_g:[1, 10000, 'The finished weight'], tds:[0.05, 25, 'The TDS'], ey_total:[1, 38, 'The total extraction'] };
function applyTastingEdit(header, rows, idx, edit){
  const row = rows[idx]; if (!row) return { error:'That tasting is not in the file.' };
  edit = edit || {};
  const cur = {}; header.forEach((k, i) => { cur[k] = row[i] == null ? '' : String(row[i]); });
  const next = {};
  const set = (k, v) => { if ((cur[k] || '') !== v) next[k] = v; };
  const val = k => (k in next ? next[k] : (cur[k] || ''));
  if (edit.brew){
    const b = edit.brew, got = {};
    for (const k of Object.keys(TE_LIMITS)){
      if (!(k in b)) continue;
      const raw = String(b[k] == null ? '' : b[k]).trim();
      if (raw === ''){ got[k] = ''; continue; }
      const x = parseFloat(raw), L = TE_LIMITS[k];
      if (!isFinite(x) || !/^\d+(\.\d+)?$/.test(raw) || x < L[0] || x > L[1]) return { error:L[2] + ' needs a number from ' + L[0] + ' to ' + L[1] + '.' };
      got[k] = String(x);
    }
    if ('dose' in got) set('brew_dose_g', got.dose);
    if ('water' in got) set('brew_water_g', got.water);
    if ('dose' in got || 'water' in got){ const d = parseFloat(val('brew_dose_g')), w = parseFloat(val('brew_water_g')); set('brew_ratio', d > 0 && w > 0 ? String(Math.round(w / d * 10) / 10) : ''); }
    if ('temp_f' in got){ set('brew_temp_f', got.temp_f); set('brew_temp_c', got.temp_f === '' ? '' : String(Math.round(_btFToC(parseFloat(got.temp_f))))); }
    if ('actual_s' in got) set('brew_actual_time_s', got.actual_s);
    if ('out_g' in got) set('brew_out_g', got.out_g);
    if ('tds' in got) set('brew_tds_pct', got.tds);
    if ('dose' in got || 'out_g' in got || 'tds' in got){
      const ey = _btExtractionYield(parseFloat(val('brew_tds_pct')), parseFloat(val('brew_out_g')), parseFloat(val('brew_dose_g')));
      set('brew_ey_pct', ey == null ? '' : String(ey));
    }
    if ('ey_total' in got) set('brew_ey_total_pct', got.ey_total);
    else if (('dose' in got || 'water' in got || 'tds' in got || 'out_g' in got) && cur.brew_ey_total_pct){
      const mk = resolveMethod(cur.brew_method), tdsN = parseFloat(val('brew_tds_pct')), dN = parseFloat(val('brew_dose_g')), wN = parseFloat(val('brew_water_g')), oN = parseFloat(val('brew_out_g'));
      if (typeof steepRead === 'function' && mk){
        const rd = steepRead(mk, tdsN, oN, dN, wN);
        set('brew_ey_total_pct', rd && rd.ey != null ? String(rd.ey) : '');
      }
    }
    if ('style' in b) set('brew_style', neutralize(cleanLine(b.style).slice(0, 32)));
  }
  if ('notes' in edit){
    const t = String(edit.notes == null ? '' : edit.notes).replace(/\r\n?/g, '\n').trim();
    if (t.length > 5000) return { error:'The notes are too long. Keep them under 5000 characters.' };
    set('general_notes', neutralize(t));
  }
  if (edit.quick){
    const q = edit.quick;
    if ('stars' in q){ const s = q.stars === '' || q.stars == null ? 0 : validStars(q.stars); if (q.stars !== '' && q.stars != null && !s) return { error:'Stars go from half a star to five.' }; set('my_rating_stars', s ? String(s) : ''); }
    if ('makeAgain' in q) set('make_again', quickMakeAgain(q.makeAgain));
    if (q.areas) QUICK_AREAS.forEach(a => { if (a.key in q.areas) set(a.col, quickGrade(q.areas[a.key])); });
    if ('sym' in q){ const sv = String(q.sym || '').trim().toLowerCase(); set('fix_symptom', /^[a-z_]{2,24}$/.test(sv) ? sv : ''); }
  }
  if ('fix_symptom' in edit){
    const sv = String(edit.fix_symptom || '').trim().toLowerCase();
    set('fix_symptom', /^[a-z_]{2,24}$/.test(sv) ? sv : '');
  }
  if (edit.intensity && typeof edit.intensity === 'object'){
    const tmp = Object.assign({}, cur);
    syncRowIntensities(tmp, edit.intensity);
    CVA_INTENSITY_SCALAR_MAP.forEach(m => set(m[0], tmp[m[0]] || ''));
    set('cva_intensity_json', tmp.cva_intensity_json || '');
  }
  if (edit.cupping && Object.keys(edit.cupping).length){
    const st = tastingScoreState(cur);
    if (st !== 'ok') return { error:st === 'none' ? 'This tasting has no cupping scores. Use Add cupping scores on the tasting screen.' : 'This tasting used an older scoring form, so its scores stay as saved. Everything else can be edited.' };
    for (const s of CVA_SECTIONS){
      if (!(s.key in edit.cupping)) continue;
      const raw = edit.cupping[s.key], v = cvaScore(raw);
      if (v == null && !(raw === '' || raw == null)) return { error:s.name + ' needs a score from 1 to 9.' };
      if (v == null && !s.skippable) return { error:s.name + ' needs a score from 1 to 9.' };
      set(s.col, v == null ? '' : String(v));
    }
    if (CVA_SECTIONS.some(s => s.col in next)){
      const by = {}; CVA_SECTIONS.forEach(s => { by[s.key] = val(s.col); });
      const t = tastingTotal(by, val('defect_type'));
      set('total_score', t == null ? '' : t.toFixed(2));
    }
  }
  const cols = Object.keys(next);
  if (!cols.length) return { rows, header, changed:0, before:[], summary:[], added:[] };
  cols.forEach(k => { if (!TASTING_EDIT_COLUMNS.includes(k)) throw new Error('A locked column would change: ' + k); });
  const hdr = header.slice();
  cols.forEach(k => { if (!hdr.includes(k) && next[k] !== '') hdr.push(k); });
  const pos = {}; hdr.forEach((k, i) => { pos[k] = i; });
  const grew = hdr.length > header.length;
  const out = rows.map((r, i) => {
    if (i !== idx){ if (!grew) return r; const c = r.slice(); while (c.length < hdr.length) c.push(''); return c; }
    const nr = r.slice(); while (nr.length < hdr.length) nr.push('');
    cols.forEach(k => { if (pos[k] != null) nr[pos[k]] = next[k]; });
    return nr;
  });
  const has = (...a) => a.some(k => k in next);
  const summary = [];
  if (has('brew_dose_g', 'brew_water_g', 'brew_ratio', 'brew_temp_f', 'brew_actual_time_s', 'brew_style')) summary.push('brew numbers');
  if (has('brew_out_g')) summary.push('finished weight');
  if (has('brew_tds_pct', 'brew_ey_total_pct')) summary.push('TDS');
  if (has('general_notes')) summary.push('notes');
  if (has('my_rating_stars', 'make_again', 'fix_symptom') || QUICK_AREAS.some(a => a.col in next)) summary.push('quick answers');
  if (has('cva_intensity_json') || CVA_INTENSITY_SCALAR_MAP.some(m => m[0] in next)) summary.push('sensory intensity');
  if (CVA_SECTIONS.some(s => s.col in next)) summary.push('cupping scores');
  return { rows:out, header:hdr, changed:1, before:[{ idx:idx, row:row }], summary:summary, added:hdr.slice(header.length), total:'total_score' in next ? next.total_score : null };
}

/* ---------- NB1.r / NB1.z Backup Codec + Pure-JS RFC 1951/1952 Inflate Fallback ---------- */
const BK_BEGIN = '-----BEGIN BEANTELLIGENCE BACKUP-----', BK_END = '-----END BEANTELLIGENCE BACKUP-----';
const BK_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++){ let c = n; for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); t[n] = c >>> 0; }
  return t;
})();
function _bkCrc32Num(bytes){
  let c = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i++) c = BK_CRC[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function bkCrc32(bytes){ return _bkCrc32Num(bytes).toString(16); }
const _BK_B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
function bkB64Encode(bytes){
  let o = '';
  for (let i = 0; i < bytes.length; i += 3){
    const n = (bytes[i] << 16) | ((bytes[i + 1] || 0) << 8) | (bytes[i + 2] || 0), left = bytes.length - i;
    o += _BK_B64_CHARS[(n >> 18) & 63] + _BK_B64_CHARS[(n >> 12) & 63] + (left > 1 ? _BK_B64_CHARS[(n >> 6) & 63] : '') + (left > 2 ? _BK_B64_CHARS[n & 63] : '');
  }
  return o;
}
function bkB64Decode(str){
  const s = String(str || '').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  if (!/^[A-Za-z0-9_-]*$/.test(s) || s.length % 4 === 1) throw new Error('bad-b64');
  const out = new Uint8Array(Math.floor(s.length * 3 / 4));
  let p = 0;
  for (let i = 0; i < s.length; i += 4){
    const c0 = _BK_B64_CHARS.indexOf(s[i]), c1 = _BK_B64_CHARS.indexOf(s[i + 1]);
    const c2 = i + 2 < s.length ? _BK_B64_CHARS.indexOf(s[i + 2]) : -1;
    const c3 = i + 3 < s.length ? _BK_B64_CHARS.indexOf(s[i + 3]) : -1;
    const n = (c0 << 18) | ((c1 & 63) << 12) | (Math.max(c2, 0) << 6) | Math.max(c3, 0);
    out[p++] = (n >> 16) & 255;
    if (c2 >= 0) out[p++] = (n >> 8) & 255;
    if (c3 >= 0) out[p++] = n & 255;
  }
  return out.subarray(0, p);
}

/* Pure-JS RFC 1951/1952 GZIP Inflate + LZ77 Static-Huffman GZIP Deflate Fallback */
function _btPureGzipCompress(raw){
  /* Fast LZ77 + RFC 1951 Fixed Huffman inside RFC 1952 GZIP frame when CompressionStream is absent */
  const bits = [];
  let bitBuf = 0, bitCnt = 0;
  const putBits = (val, n) => {
    for (let i = 0; i < n; i++){
      bitBuf |= ((val >>> i) & 1) << bitCnt;
      if (++bitCnt === 8){ bits.push(bitBuf); bitBuf = 0; bitCnt = 0; }
    }
  };
  const putHuff = (code, n) => {
    for (let i = n - 1; i >= 0; i--){
      bitBuf |= ((code >>> i) & 1) << bitCnt;
      if (++bitCnt === 8){ bits.push(bitBuf); bitBuf = 0; bitCnt = 0; }
    }
  };
  const emitLit = b => {
    if (b <= 143) putHuff(0x30 + b, 8);
    else putHuff(0x190 + (b - 144), 9);
  };
  const lenBase = [3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258];
  const lenExtra = [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];
  const distBase = [1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577];
  const distExtra = [0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];
  const emitMatch = (len, dist) => {
    let li = lenBase.length - 1;
    while (li > 0 && len < lenBase[li]) li--;
    const sym = 257 + li;
    if (sym <= 279) putHuff(sym - 256, 7);
    else putHuff(0xC0 + (sym - 280), 8);
    if (lenExtra[li]) putBits(len - lenBase[li], lenExtra[li]);
    let di = distBase.length - 1;
    while (di > 0 && dist < distBase[di]) di--;
    putHuff(di, 5);
    if (distExtra[di]) putBits(dist - distBase[di], distExtra[di]);
  };
  putBits(1, 1); /* BFINAL = 1 */
  putBits(1, 2); /* BTYPE = 01 (fixed Huffman) */
  const head = new Int32Array(4096); head.fill(-1);
  const n = raw.length;
  let i = 0;
  while (i < n){
    let bestLen = 0, bestDist = 0;
    if (i + 3 <= n){
      const h = (((raw[i] << 10) ^ (raw[i + 1] << 5) ^ raw[i + 2]) & 4095);
      const prev = head[h];
      head[h] = i;
      if (prev >= 0 && i - prev <= 32768){
        const maxL = Math.min(258, n - i);
        let l = 0;
        while (l < maxL && raw[prev + l] === raw[i + l]) l++;
        if (l >= 4){ bestLen = l; bestDist = i - prev; }
      }
    }
    if (bestLen >= 4){
      emitMatch(bestLen, bestDist);
      for (let k = 1; k < bestLen && i + k + 2 < n; k++){
        head[((raw[i + k] << 10) ^ (raw[i + k + 1] << 5) ^ raw[i + k + 2]) & 4095] = i + k;
      }
      i += bestLen;
    } else {
      emitLit(raw[i++]);
    }
  }
  putHuff(0, 7); /* End-of-block 256 */
  if (bitCnt > 0) bits.push(bitBuf);
  const out = new Uint8Array(10 + bits.length + 8);
  out[0] = 0x1f; out[1] = 0x8b; out[2] = 0x08;
  for (let j = 0; j < bits.length; j++) out[10 + j] = bits[j];
  const crc = _bkCrc32Num(raw), sz = raw.length >>> 0, tr = 10 + bits.length;
  out[tr] = crc & 255; out[tr + 1] = (crc >>> 8) & 255; out[tr + 2] = (crc >>> 16) & 255; out[tr + 3] = (crc >>> 24) & 255;
  out[tr + 4] = sz & 255; out[tr + 5] = (sz >>> 8) & 255; out[tr + 6] = (sz >>> 16) & 255; out[tr + 7] = (sz >>> 24) & 255;
  return out;
}
function _btPureGzipDecompress(gzBytes, limit){
  if (gzBytes.length < 18 || gzBytes[0] !== 0x1f || gzBytes[1] !== 0x8b || gzBytes[2] !== 0x08) throw new Error('bad-gzip');
  const flg = gzBytes[3];
  let pos = 10;
  if (flg & 4){ const xlen = gzBytes[pos] | (gzBytes[pos + 1] << 8); pos += 2 + xlen; }
  if (flg & 8){ while (pos < gzBytes.length && gzBytes[pos++] !== 0){} }
  if (flg & 16){ while (pos < gzBytes.length && gzBytes[pos++] !== 0){} }
  if (flg & 2) pos += 2;
  let bitPos = 0;
  const getBits = n => {
    let v = 0;
    for (let i = 0; i < n; i++){
      const bp = pos + (bitPos >> 3);
      if (bp >= gzBytes.length) throw new Error('eof');
      v |= ((gzBytes[bp] >>> (bitPos & 7)) & 1) << i;
      bitPos++;
    }
    return v;
  };
  const buildTree = lengths => {
    let maxBits = 0;
    for (let i = 0; i < lengths.length; i++) if (lengths[i] > maxBits) maxBits = lengths[i];
    const count = new Int32Array(maxBits + 1), nextCode = new Int32Array(maxBits + 1);
    for (let i = 0; i < lengths.length; i++) if (lengths[i]) count[lengths[i]]++;
    let code = 0;
    for (let b = 1; b <= maxBits; b++){ code = (code + count[b - 1]) << 1; nextCode[b] = code; }
    const map = new Map();
    for (let sym = 0; sym < lengths.length; sym++){
      const len = lengths[sym];
      if (len){ map.set((len << 16) | nextCode[len]++, sym); }
    }
    return { map, maxBits };
  };
  const decodeSym = tree => {
    let code = 0;
    for (let len = 1; len <= tree.maxBits; len++){
      code = (code << 1) | getBits(1);
      const hit = tree.map.get((len << 16) | code);
      if (hit !== undefined) return hit;
    }
    throw new Error('bad-huff');
  };
  const fixedLitLens = new Uint8Array(288);
  for (let i = 0; i <= 143; i++) fixedLitLens[i] = 8;
  for (let i = 144; i <= 255; i++) fixedLitLens[i] = 9;
  for (let i = 256; i <= 279; i++) fixedLitLens[i] = 7;
  for (let i = 280; i <= 287; i++) fixedLitLens[i] = 8;
  const fixedDistLens = new Uint8Array(32); fixedDistLens.fill(5);
  let fixedLitTree = null, fixedDistTree = null;
  const lenBase = [3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258];
  const lenExtra = [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];
  const distBase = [1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577];
  const distExtra = [0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];
  const clOrder = [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];
  const out = [];
  let bfinal = 0;
  while (!bfinal){
    bfinal = getBits(1);
    const btype = getBits(2);
    if (btype === 0){
      bitPos = (bitPos + 7) & ~7;
      const bp = pos + (bitPos >> 3);
      const len = gzBytes[bp] | (gzBytes[bp + 1] << 8);
      const nlen = gzBytes[bp + 2] | (gzBytes[bp + 3] << 8);
      if ((len ^ 0xffff) !== nlen) throw new Error('bad-stored');
      bitPos += 32;
      for (let k = 0; k < len; k++){
        if (out.length >= limit) throw new Error('bk-too-big');
        out.push(gzBytes[pos + (bitPos >> 3)]); bitPos += 8;
      }
    } else if (btype === 1 || btype === 2){
      let litTree, distTree;
      if (btype === 1){
        if (!fixedLitTree){ fixedLitTree = buildTree(fixedLitLens); fixedDistTree = buildTree(fixedDistLens); }
        litTree = fixedLitTree; distTree = fixedDistTree;
      } else {
        const hlit = getBits(5) + 257, hdist = getBits(5) + 1, hclen = getBits(4) + 4;
        const clLens = new Uint8Array(19);
        for (let i = 0; i < hclen; i++) clLens[clOrder[i]] = getBits(3);
        const clTree = buildTree(clLens);
        const allLens = new Uint8Array(hlit + hdist);
        for (let i = 0; i < hlit + hdist;){
          const s = decodeSym(clTree);
          if (s < 16) allLens[i++] = s;
          else if (s === 16){ const rep = getBits(2) + 3, prev = allLens[i - 1] || 0; for (let k = 0; k < rep; k++) allLens[i++] = prev; }
          else if (s === 17){ const rep = getBits(3) + 3; for (let k = 0; k < rep; k++) allLens[i++] = 0; }
          else { const rep = getBits(7) + 11; for (let k = 0; k < rep; k++) allLens[i++] = 0; }
        }
        litTree = buildTree(allLens.subarray(0, hlit));
        distTree = buildTree(allLens.subarray(hlit));
      }
      for (;;){
        const sym = decodeSym(litTree);
        if (sym === 256) break;
        if (sym < 256){
          if (out.length >= limit) throw new Error('bk-too-big');
          out.push(sym);
        } else {
          const li = sym - 257, length = lenBase[li] + (lenExtra[li] ? getBits(lenExtra[li]) : 0);
          const di = decodeSym(distTree), dist = distBase[di] + (distExtra[di] ? getBits(distExtra[di]) : 0);
          if (dist > out.length) throw new Error('bad-dist');
          for (let k = 0; k < length; k++){
            if (out.length >= limit) throw new Error('bk-too-big');
            out.push(out[out.length - dist]);
          }
        }
      }
    } else throw new Error('bad-btype');
  }
  return new Uint8Array(out);
}

async function bkPipe(bytes, stream){
  const w = stream.writable.getWriter();
  w.write(bytes).catch(() => {}); w.close().catch(() => {});
  return new Uint8Array(await new Response(stream.readable).arrayBuffer());
}
function makeBackupCodeSync(csv, opts){
  const raw = _btUtf8Encode(String(csv || '').replace(/^\uFEFF/, ''));
  let mode = 'r', body = raw;
  if (!(opts && opts.noCompress)){
    try { body = _btPureGzipCompress(raw); mode = 'z'; } catch(e){ body = raw; mode = 'r'; }
  }
  const all = ['NB1', mode, raw.length, bkCrc32(raw)].join('.') + '.' + bkB64Encode(body) + '.';
  return { code:[BK_BEGIN].concat(all.match(/.{1,64}/g) || [all], [BK_END]).join('\n'), bytes:raw.length, packed:body.length, mode };
}
async function makeBackupCode(csv, opts){
  if (typeof CompressionStream === 'undefined' || (opts && opts.noCompress)) return makeBackupCodeSync(csv, opts);
  const raw = _btUtf8Encode(String(csv || '').replace(/^\uFEFF/, ''));
  let mode = 'r', body = raw;
  try { body = await bkPipe(raw, new CompressionStream('gzip')); mode = 'z'; }
  catch(e){ try { body = _btPureGzipCompress(raw); mode = 'z'; } catch(e2){ body = raw; mode = 'r'; } }
  const all = ['NB1', mode, raw.length, bkCrc32(raw)].join('.') + '.' + bkB64Encode(body) + '.';
  return { code:[BK_BEGIN].concat(all.match(/.{1,64}/g) || [all], [BK_END]).join('\n'), bytes:raw.length, packed:body.length, mode };
}
const BK_MAX_TEXT = 20000000, BK_MAX_BYTES = 40000000;
async function bkPipeLimit(bytes, stream, limit){
  const w = stream.writable.getWriter();
  w.write(bytes).catch(() => {}); w.close().catch(() => {});
  const r = stream.readable.getReader(), parts = []; let total = 0;
  for (;;){
    const x = await r.read(); if (x.done) break;
    total += x.value.length;
    if (total > limit){ try { await r.cancel(); } catch(e){} throw new Error('bk-too-big'); }
    parts.push(x.value);
  }
  const out = new Uint8Array(total); let o = 0; parts.forEach(p => { out.set(p, o); o += p.length; }); return out;
}
function _parseBackupEnvelope(text){
  if (String(text || '').length > BK_MAX_TEXT) return { error:'That text is far too large to be a backup. Copy only the block from BEGIN to END BEANTELLIGENCE BACKUP.' };
  const t = String(text || '').replace(/\r/g, ''), D = '[-\\u2010-\\u2015\\u2212]*';
  if (!/BEGIN (?:BEANTELLIGENCE|NEUROBREW) BACKUP/i.test(t)) return { error:'That does not look like a BeanTelligence backup. It should start with BEGIN BEANTELLIGENCE BACKUP.' };
  const mm = new RegExp('BEGIN (?:BEANTELLIGENCE|NEUROBREW) BACKUP' + D + '([\\s\\S]*?)\\.[\\s\\u00A0]*' + D + 'END (?:BEANTELLIGENCE|NEUROBREW) BACKUP', 'i').exec(t);
  if (!mm) return { error:'The backup looks cut off. Make sure you copied everything, all the way through END BEANTELLIGENCE BACKUP.' };
  const inner = mm[1].replace(/[\u2010-\u2015\u2212]/g, '-').replace(/[\s\u00A0\u200B-\u200D\uFEFF]+/g, '').replace(/^-+/, '');
  const m = /^NB1\.([zr])\.(\d+)\.([0-9a-f]+)\.([A-Za-z0-9_-]*)$/.exec(inner);
  if (!m){
    if (!/^NB1\./.test(inner)) return { error:'The first line of the backup is missing, so it cannot be read. Copy the whole block again.' };
    const bad = inner.replace(/^NB1\.[zr]\.\d+\.[0-9a-f]+\./, '').match(/[^A-Za-z0-9_-]/);
    return { error:bad ? 'A character in the backup was changed while copying (' + JSON.stringify(bad[0]) + '). Copy it again from the original.' : 'The backup is damaged. Copy it again from the original.' };
  }
  const mode = m[1], len = parseInt(m[2], 10), crc = m[3];
  if (len > BK_MAX_BYTES) return { error:'This backup says it holds more data than this app opens, so it was not opened.' };
  let bytes; try { bytes = bkB64Decode(m[4]); } catch(e){ return { error:'The backup is damaged. Copy it again from the original.' }; }
  return { mode, len, crc, bytes };
}
function _finishBackupUnpack(bytes, len, crc){
  if (bytes.length !== len) return { error:'The backup is the wrong length (' + bytes.length + ' of ' + len + ' bytes), so part of it is missing. Copy it again from the original.' };
  if (bkCrc32(bytes) !== crc) return { error:'The backup does not pass its check, so something was changed. Copy it again from the original.' };
  const body = _btUtf8Decode(bytes), pk = bkpUnpack(body);
  if (pk){ const hp = pk.parts.history; return { csv:hp && hp.ok ? hp.text : '', parts:pk }; }
  return { csv:body };
}
function readBackupCodeSync(text){
  const env = _parseBackupEnvelope(text);
  if (env.error) return env;
  let bytes = env.bytes;
  if (env.mode === 'z'){
    try { bytes = _btPureGzipDecompress(bytes, env.len); }
    catch(e){
      if (e && e.message === 'bk-too-big') return { error:'The backup holds more data than its first line says, so it was not opened. Copy it again from the original.' };
      return { error:'The backup looks incomplete or altered, so it could not be unpacked. Copy it again from the original.' };
    }
  }
  return _finishBackupUnpack(bytes, env.len, env.crc);
}
async function readBackupCode(text){
  if (typeof DecompressionStream === 'undefined') return readBackupCodeSync(text);
  const env = _parseBackupEnvelope(text);
  if (env.error) return env;
  let bytes = env.bytes;
  if (env.mode === 'z'){
    try { bytes = await bkPipeLimit(bytes, new DecompressionStream('gzip'), env.len); }
    catch(e){
      if (e && e.message === 'bk-too-big') return { error:'The backup holds more data than its first line says, so it was not opened. Copy it again from the original.' };
      try { bytes = _btPureGzipDecompress(env.bytes, env.len); }
      catch(e2){ return { error:'The backup looks incomplete or altered, so it could not be unpacked. Copy it again from the original.' }; }
    }
  }
  return _finishBackupUnpack(bytes, env.len, env.crc);
}
function csvToSheetText(csv){
  const ex = readExisting(csv); if (ex.error) return '';
  const cell = v => { v = String(v == null ? '' : v); return /[\t\n\r"]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
  return [ex.header].concat(ex.rows).map(r => r.map(cell).join('\t')).join('\n');
}
function backupAge(last, now){
  const t = Number(last) || 0; if (!(t > 0)) return 'not yet';
  const days = Math.floor(((now ? now.getTime() : Date.now()) - t) / 86400000);
  if (days < 1) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return days + ' days ago';
  return 'over a month ago';
}

/* ---------- Multi-Part Save Everything Container (#BEANTELLIGENCE-PARTS 1 & #NEUROBREW-PARTS 1) ---------- */
const BKP_MAGIC = '#BEANTELLIGENCE-PARTS 1', BKP_ID = /^[a-z][a-z0-9-]{0,24}$/;
function bkpPack(parts, info){
  const chunks = [];
  const add = s => chunks.push(typeof s === 'string' ? _btUtf8Encode(s) : s);
  const safe = s => String(s == null ? '' : s).replace(/[^0-9A-Za-z:.+\-]/g, '').slice(0, 40);
  add(BKP_MAGIC + '\n');
  if (info && safe(info.made)) add('#MADE ' + safe(info.made) + '\n');
  if (info && safe(info.app)) add('#APP ' + safe(info.app) + '\n');
  (parts || []).forEach(p => {
    if (!p || !BKP_ID.test(String(p.id))) return;
    const body = _btUtf8Encode(String(p.text == null ? '' : p.text).replace(/^\uFEFF/, ''));
    add('#PART ' + p.id + ' ' + body.length + ' ' + bkCrc32(body) + '\n'); add(body); add('\n');
  });
  let n = 0; chunks.forEach(c => { n += c.length; });
  const all = new Uint8Array(n); let o = 0; chunks.forEach(c => { all.set(c, o); o += c.length; });
  return _btUtf8Decode(all);
}
function bkpUnpack(text){
  const t = String(text == null ? '' : text).replace(/^\uFEFF/, '');
  if (!/^#(?:BEANTELLIGENCE|NEUROBREW)-PARTS 1(?:\r?\n|$)/.test(t)) return null;
  const b = _btUtf8Encode(t), out = { made:'', app:'', order:[], parts:{}, damaged:[] };
  let i = 0;
  const line = () => { let j = i; while (j < b.length && b[j] !== 10) j++; const s = _btUtf8Decode(b.subarray(i, j)).replace(/\r$/, ''); i = j < b.length ? j + 1 : j; return s; };
  line();
  while (i < b.length){
    const l = line(); let m;
    if ((m = /^#MADE (\S+)$/.exec(l))) out.made = m[1];
    else if ((m = /^#APP (\S+)$/.exec(l))) out.app = m[1];
    else if ((m = /^#PART ([a-z][a-z0-9-]{0,24}) (\d+) ([0-9a-f]{1,8})$/.exec(l))){
      const id = m[1], len = parseInt(m[2], 10), seen = !!out.parts[id];
      if (i + len > b.length){ if (!seen){ out.parts[id] = { ok:false, text:'', why:'cut' }; out.order.push(id); out.damaged.push(id); } break; }
      const body = b.subarray(i, i + len); i += len; if (b[i] === 10) i++;
      if (seen) continue;
      const good = bkCrc32(body) === m[3];
      out.parts[id] = good ? { ok:true, text:_btUtf8Decode(body), why:'' } : { ok:false, text:'', why:'check' };
      out.order.push(id); if (!good) out.damaged.push(id);
    }
  }
  return out;
}
function objectsToHistoryCsv(arr){
  if (!Array.isArray(arr) || !arr.length) return '';
  const list = arr.filter(o => o && typeof o === 'object' && !Array.isArray(o));
  if (!list.length) return '';
  const header = COLUMNS.slice();
  list.forEach(o => Object.keys(o).forEach(k => { if (k !== '_i' && !header.includes(k)) header.push(k); }));
  const lines = [header];
  list.forEach((o, idx) => {
    const schema = o.schema_version != null && String(o.schema_version).trim() ? String(o.schema_version) : '6.0';
    const id = o.id != null && String(o.id).trim() ? String(o.id).trim() : ('json-' + idx + '-' + Date.now().toString(36));
    const name = o.coffee_name != null ? String(o.coffee_name) : (o.name != null ? String(o.name) : '');
    if (!name.trim()) return;
    lines.push(header.map(c => {
      if (c === 'schema_version') return schema;
      if (c === 'id') return id;
      if (c === 'coffee_name') return TEXT_COLUMNS.has(c) ? neutralize(name) : name;
      const v = o[c] == null ? '' : String(o[c]);
      return TEXT_COLUMNS.has(c) && !/^'+[=+\-@\t\r]/.test(v) ? neutralize(v) : v;
    }));
  });
  return lines.length > 1 ? toCSV(lines) : '';
}
function parseJsonBackup(text){
  const s = String(text == null ? '' : text).replace(/^\uFEFF/, '').trim();
  if (!s || (s[0] !== '{' && s[0] !== '[')) return null;
  let obj; try { obj = JSON.parse(s); } catch(e){ return null; }
  if (Array.isArray(obj)){
    const csv = objectsToHistoryCsv(obj);
    return csv ? { kind:'json-rows', made:'', app:'', raw:{ history:{ ok:true, text:csv } }, historyCsv:csv } : null;
  }
  if (!obj || typeof obj !== 'object') return null;
  if (obj.v === 1 && obj.keys && typeof obj.keys === 'object' && ('brew-and-cup-history-v1' in obj.keys || 'brew-and-cup-shops-v1' in obj.keys || 'brew-and-cup-prices-v1' in obj.keys || 'brew-and-cup-draft-v1' in obj.keys)){
    const raw = {}, order = [];
    if (obj.keys['brew-and-cup-history-v1']){ raw.history = { ok:true, text:String(obj.keys['brew-and-cup-history-v1']) }; order.push('history'); }
    if (obj.keys['brew-and-cup-shops-v1']){ raw.shops = { ok:true, text:String(obj.keys['brew-and-cup-shops-v1']) }; order.push('shops'); }
    if (obj.keys['brew-and-cup-prices-v1']){ raw.prices = { ok:true, text:String(obj.keys['brew-and-cup-prices-v1']) }; order.push('prices'); }
    if (obj.keys['brew-and-cup-draft-v1']){
      try { const d = JSON.parse(obj.keys['brew-and-cup-draft-v1']); if (d && d.app && d.app.prefs){ raw.prefs = { ok:true, text:JSON.stringify({ format:'beantelligence-prefs', v:1, prefs:d.app.prefs }) }; order.push('prefs'); } } catch(e){}
    }
    return order.length ? { kind:'everything', made:String(obj.createdAt || ''), app:'snapshot', raw, order, historyCsv:raw.history ? raw.history.text : '' } : null;
  }
  if (obj.format !== 'beantelligence-backup' && !obj.historyCsv && !obj.shopsCsv && !obj.pricesCsv && !Array.isArray(obj.history)) return null;
  const raw = {}, order = [];
  const hCsv = typeof obj.historyCsv === 'string' && obj.historyCsv.trim() ? obj.historyCsv : (Array.isArray(obj.history) ? objectsToHistoryCsv(obj.history) : '');
  if (hCsv){ raw.history = { ok:true, text:hCsv }; order.push('history'); }
  if (typeof obj.shopsCsv === 'string' && obj.shopsCsv.trim()){ raw.shops = { ok:true, text:obj.shopsCsv }; order.push('shops'); }
  if (typeof obj.pricesCsv === 'string' && obj.pricesCsv.trim()){ raw.prices = { ok:true, text:obj.pricesCsv }; order.push('prices'); }
  if (obj.prefs && typeof obj.prefs === 'object'){
    const safePrefs = Object.assign({}, obj.prefs);
    delete safePrefs.difluidAuth; delete safePrefs.apiKey; delete safePrefs['brew-and-cup-difluid-auth-v1'];
    raw.prefs = { ok:true, text:JSON.stringify({ format:'beantelligence-prefs', v:1, prefs:safePrefs }) };
    order.push('prefs');
  }
  if (obj.academy && typeof obj.academy === 'object'){ raw.academy = { ok:true, text:JSON.stringify(Object.assign({ format:'beantelligence-academy', v:1 }, obj.academy)) }; order.push('academy'); }
  if (!order.length) return null;
  return { kind:'everything', made:String(obj.madeAt || obj.made || ''), app:String(obj.appVersion || obj.app || ''), raw, order, historyCsv:hCsv };
}
function bkpNote(info){
  const day = info && /^\d{4}-\d{2}-\d{2}/.test(String(info.made || '')) ? String(info.made).slice(0, 10) : '';
  return 'BeanTelligence backup of everything: your tasting history, coffee shops, prices, preferences and progress' + (day ? ', made ' + day : '') + '.\n'
    + 'Keep this whole file somewhere safe. To bring it back: BeanTelligence, Data Vault, Load a backup.\n'
    + 'If you paste it somewhere, copy everything from the BEGIN line to the END line.';
}
function makeEverythingCodeSync(parts, info){
  const list = Array.isArray(parts) ? parts : Object.keys(parts || {}).map(id => ({ id, text:parts[id] }));
  const r = makeBackupCodeSync(bkpPack(list, info));
  return { text:bkpNote(info) + '\n\n' + r.code + '\n', code:r.code, bytes:r.bytes, packed:r.packed, mode:r.mode };
}
async function makeEverythingCode(parts, info){
  const list = Array.isArray(parts) ? parts : Object.keys(parts || {}).map(id => ({ id, text:parts[id] }));
  const r = await makeBackupCode(bkpPack(list, info));
  return { text:bkpNote(info) + '\n\n' + r.code + '\n', code:r.code, bytes:r.bytes, packed:r.packed, mode:r.mode };
}

/* ---------- setup_json (v:1 Invariant, Zero Secret Leakage, v6 Additive Fields) ---------- */
const SETUP_MAX_CHARS = 20000;
const TASTE_CHOICES = [{ v:'quickonly', label:'Quick only' }, { v:'', label:'Quick first' }, { v:'cuppingfirst', label:'Cupping first' }];
const PREGROUND_SETUP_KEYS = ['grocery_drip', 'grocery_espresso', 'cafe_ek43'];
const BLE_SCALE_PROTOCOLS = [
  { v:'auto',     label:'Auto-Detect All Supported Scales' },
  { v:'acaia',    label:'Acaia (Lunar / Pearl / Pyxis)' },
  { v:'difluid',  label:'DiFluid Microbalance / Microbalance Ti' },
  { v:'bookoo',   label:'Bookoo Themis' },
  { v:'timemore', label:'Timemore Black Mirror BLE' },
  { v:'felicita', label:'Felicita (Arc / Incline / Parallel)' },
  { v:'decent',   label:'Decent Scale' },
  { v:'varia',    label:'Varia AKU' },
  { v:'skale',    label:'Atomax Skale II' },
  { v:'eureka',   label:'Eureka Precisa / CFS-9002' },
  { v:'hiroia',   label:'Hiroia Jimmy' },
  { v:'sig',      label:'Standard BLE Weight Scale' }
];
const _BLE_SLOTS_ALLOWED = ['scale', 'pressure', 'refractometer', 'omni', 'machine', 'kettle'];
function _cleanRememberedDevices(raw){
  if (!Array.isArray(raw)) return [];
  const out = [], seen = new Set();
  const safeStr = (v, n) => typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, n) : '';
  raw.forEach(item => {
    if (!item || typeof item !== 'object' || Array.isArray(item) || out.length >= 8) return;
    const slot = safeStr(item.slot, 20).toLowerCase();
    const deviceId = safeStr(item.deviceId || item.id, 96);
    if (!_BLE_SLOTS_ALLOWED.includes(slot) || !deviceId) return;
    const dedup = slot + '|' + deviceId;
    if (seen.has(dedup)) return;
    seen.add(dedup);
    const rec = {
      slot,
      deviceId,
      brand:safeStr(item.brand, 32),
      name:safeStr(item.name, 64),
      transportKind:['web-bluetooth', 'capacitor-native', 'simulator'].includes(item.transportKind) ? item.transportKind : 'web-bluetooth',
      autoConnect:item.autoConnect !== false
    };
    if (typeof item.lastConnectedAt === 'number' && isFinite(item.lastConnectedAt) && item.lastConnectedAt > 0){
      rec.lastConnectedAt = Math.round(item.lastConnectedAt);
    } else if (typeof item.lastConnectedAt === 'string' && item.lastConnectedAt.length <= 32){
      rec.lastConnectedAt = safeStr(item.lastConnectedAt, 32);
    }
    out.push(rec);
  });
  return out;
}
function setupBleDefaults(){
  return { preferredBrand:'auto', autoStart:true, autoTare:true, captureYield:true, difluidEnabled:true, omniD10Um:null, omniD50Um:null, omniD90Um:null, omniSpan:null, omniDial:'', rememberedDevices:[] };
}
/* Explicit allow-list: NEVER copies apiKey, token, secret, or brew-and-cup-difluid-auth-v1 into setup_json */
function cleanSetupBle(raw){
  const d = setupBleDefaults();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return d;
  const rb = String(raw.preferredBrand || raw.brand || '').trim().toLowerCase();
  const mapped = (rb === 'standard' || rb === 'weight_sig') ? 'sig' : ((rb === 'microbalance' || rb === 'difluid_scale') ? 'difluid' : rb);
  const bool = (a, b, dflt) => typeof a === 'boolean' ? a : (typeof b === 'boolean' ? b : dflt);
  const um = v => { const n = typeof v === 'number' ? v : parseFloat(v); return (isFinite(n) && n >= 20 && n <= 2500) ? Math.round(n * 10) / 10 : null; };
  const sp = v => { const n = typeof v === 'number' ? v : parseFloat(v); return (isFinite(n) && n >= 0.05 && n <= 10) ? Math.round(n * 100) / 100 : null; };
  const dial = typeof raw.omniDial === 'string' ? raw.omniDial.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 32) : '';
  return {
    preferredBrand:BLE_SCALE_PROTOCOLS.some(x => x.v === mapped) ? mapped : d.preferredBrand,
    autoStart:bool(raw.autoStart, raw.autoStartPour, d.autoStart),
    autoTare:bool(raw.autoTare, raw.autoTareOnArm, d.autoTare),
    captureYield:bool(raw.captureYield, raw.captureYieldOnLift != null ? raw.captureYieldOnLift : raw.captureLiftYield, d.captureYield),
    difluidEnabled:bool(raw.difluidEnabled, raw.difluid, d.difluidEnabled),
    omniD10Um:um(raw.omniD10Um),
    omniD50Um:um(raw.omniD50Um),
    omniD90Um:um(raw.omniD90Um),
    omniSpan:sp(raw.omniSpan),
    omniDial:dial,
    rememberedDevices:_cleanRememberedDevices(raw.rememberedDevices)
  };
}
function serializeSetupBle(b){
  const c = cleanSetupBle(b);
  const out = {
    preferredBrand:c.preferredBrand,
    autoStart:c.autoStart,
    autoTare:c.autoTare,
    captureYield:c.captureYield,
    difluidEnabled:c.difluidEnabled
  };
  if (c.omniD10Um != null) out.omniD10Um = c.omniD10Um;
  if (c.omniD50Um != null) out.omniD50Um = c.omniD50Um;
  if (c.omniD90Um != null) out.omniD90Um = c.omniD90Um;
  if (c.omniSpan != null) out.omniSpan = c.omniSpan;
  if (c.omniDial) out.omniDial = c.omniDial;
  if (c.rememberedDevices.length) out.rememberedDevices = c.rememberedDevices;
  return out;
}
function setupBleIsDefault(b){
  if (!b || typeof b !== 'object') return true;
  const c = cleanSetupBle(b), d = setupBleDefaults();
  return c.preferredBrand === d.preferredBrand && c.autoStart === d.autoStart && c.autoTare === d.autoTare && c.captureYield === d.captureYield && c.difluidEnabled === d.difluidEnabled && c.omniD10Um === null && c.omniD50Um === null && c.omniD90Um === null && c.omniSpan === null && c.omniDial === '' && c.rememberedDevices.length === 0;
}
function setupToolModesDefaults(){
  return { scale:'optional', refractometer:'optional', agtron:'optional', psd:'optional', water:'always', brewersFilter:'all' };
}
function cleanToolModes(raw){
  const d = setupToolModesDefaults();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return d;
  const tri = (v, dflt) => (v === 'always' || v === 'optional' || v === 'off') ? v : dflt;
  return {
    scale:tri(raw.scale, d.scale),
    refractometer:tri(raw.refractometer, d.refractometer),
    agtron:tri(raw.agtron, d.agtron),
    psd:tri(raw.psd, d.psd),
    water:tri(raw.water, d.water),
    brewersFilter:(raw.brewersFilter === 'owned' || raw.brewersFilter === 'all') ? raw.brewersFilter : d.brewersFilter
  };
}
function setupToolModesIsDefault(tm){
  if (!tm || typeof tm !== 'object') return true;
  const c = cleanToolModes(tm), d = setupToolModesDefaults();
  return c.scale === d.scale && c.refractometer === d.refractometer && c.agtron === d.agtron && c.psd === d.psd && c.water === d.water && c.brewersFilter === d.brewersFilter;
}
function _cleanBrewerMaterials(raw){
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const allowedMat = ['plastic', 'ceramic', 'glass', 'metal', 'stainless', 'copper', 'vacuum_ss', 'tritan', 'silicone', 'wood'];
  const out = {};
  Object.keys(raw).slice(0, 24).forEach(k => {
    const mk = resolveMethod(k) || (typeof k === 'string' && _BT_V6_METHOD_SET.has(k) ? k : '');
    const mv = String(raw[k] || '').trim().toLowerCase();
    if (mk && allowedMat.includes(mv)) out[mk] = mv;
  });
  return out;
}
function _cleanCryoTubes(raw){
  if (!Array.isArray(raw)) return [];
  const out = [];
  const txt = (v, n) => typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n) : '';
  raw.slice(0, 64).forEach(t => {
    if (!t || typeof t !== 'object' || Array.isArray(t)) return;
    const id = txt(t.id, 40);
    const doseG = parseFloat(t.doseG != null ? t.doseG : t.dose);
    if (!id && !(doseG > 0)) return;
    const entry = { id:id || ('tube-' + (out.length + 1)), doseG:isFinite(doseG) && doseG > 0 && doseG <= 200 ? Math.round(doseG * 10) / 10 : 18 };
    if (t.coffeeId) entry.coffeeId = txt(t.coffeeId, 64);
    if (t.name) entry.name = txt(t.name, 80);
    if (t.roaster) entry.roaster = txt(t.roaster, 64);
    if (_btValidIsoDate(t.roastDate)) entry.roastDate = t.roastDate;
    if (_btValidIsoDate(t.frozenDate)) entry.frozenDate = t.frozenDate;
    if (['frozen', 'thawing', 'used', 'empty'].includes(t.status)) entry.status = t.status;
    out.push(entry);
  });
  return out;
}
function _cleanPocketMicronCalib(raw){
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const cleanOne = o => {
    if (!o || typeof o !== 'object' || Array.isArray(o)) return null;
    const d0 = parseFloat(o.d0OffsetUm), sm = parseFloat(o.slopeM);
    if (!isFinite(d0) && !isFinite(sm)) return null;
    const rec = {};
    if (typeof o.grinderKey === 'string' && o.grinderKey.trim()) rec.grinderKey = o.grinderKey.trim().slice(0, 48);
    if (isFinite(d0) && Math.abs(d0) <= 300) rec.d0OffsetUm = Math.round(d0 * 10) / 10;
    if (isFinite(sm) && sm > 0.1 && sm < 10) rec.slopeM = Math.round(sm * 1000) / 1000;
    if (typeof o.calibratedAt === 'string' && o.calibratedAt.length <= 32) rec.calibratedAt = o.calibratedAt.slice(0, 32);
    else if (typeof o.calibratedAt === 'number' && isFinite(o.calibratedAt)) rec.calibratedAt = Math.round(o.calibratedAt);
    return Object.keys(rec).length ? rec : null;
  };
  if ('d0OffsetUm' in raw || 'slopeM' in raw || 'grinderKey' in raw) return cleanOne(raw);
  const map = {};
  Object.keys(raw).slice(0, 24).forEach(gk => {
    const c = cleanOne(raw[gk]);
    if (c) map[gk.slice(0, 48)] = c;
  });
  return Object.keys(map).length ? map : null;
}
function _cleanPhilipsProfiles(raw){
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const profiles = ['blue', 'green', 'yellow', 'pink', 'guest'];
  const out = {};
  if (typeof raw.activeProfile === 'string' && profiles.includes(raw.activeProfile.toLowerCase())) out.activeProfile = raw.activeProfile.toLowerCase();
  if (typeof raw.hopperStep === 'number' && Number.isInteger(raw.hopperStep) && raw.hopperStep >= 1 && raw.hopperStep <= 12) out.hopperStep = raw.hopperStep;
  if (typeof raw.sasShotsRemaining === 'number' && isFinite(raw.sasShotsRemaining) && raw.sasShotsRemaining >= 0 && raw.sasShotsRemaining <= 10) out.sasShotsRemaining = Math.round(raw.sasShotsRemaining);
  if (typeof raw.menuTemp === 'string' && ['low', 'medium', 'high'].includes(raw.menuTemp.toLowerCase())) out.menuTemp = raw.menuTemp.toLowerCase();
  profiles.forEach(pk => {
    const p = raw[pk];
    if (!p || typeof p !== 'object' || Array.isArray(p)) return;
    const sub = {};
    Object.keys(p).slice(0, 24).forEach(dk => {
      const dv = p[dk];
      if (!dv || typeof dv !== 'object' || Array.isArray(dv)) return;
      const item = {};
      ['aroma', 'coffeeBar', 'milkBar', 'coffeeMl', 'milkMl'].forEach(nk => {
        if (typeof dv[nk] === 'number' && isFinite(dv[nk]) && dv[nk] >= 0 && dv[nk] <= 1000) item[nk] = Math.round(dv[nk]);
      });
      if (typeof dv.extraShot === 'boolean') item.extraShot = dv.extraShot;
      if (Object.keys(item).length) sub[dk.slice(0, 24)] = item;
    });
    if (Object.keys(sub).length) out[pk] = sub;
  });
  return Object.keys(out).length ? out : null;
}
function _cleanImmersionBasis(v){
  if (v === 'gagne') return 'gagne';
  if (v === 'liang' || v === '' || v == null) return '';
  if (typeof v === 'number' && isFinite(v) && v >= 0 && v <= 1.05) return Math.round(v * 1000) / 1000;
  return '';
}
function setupDefaults(){
  return {
    level:'', waterUnit:'g', coffeeUnit:'g', sound:'voice', coach:'guide', cupView:'', taste:'',
    theme:'', tempUnit:'', elevUnit:'', cupMode:'', coachTips:true, palateSeed:null,
    scienceLens:'', immersionBasis:'',
    toolModes:setupToolModesDefaults(),
    brewerMaterials:{}, cryoTubes:[], pocketMicronCalib:null, philipsProfiles:null,
    gear:{ grinderKey:'', grinderName:'', grinderType:'', waterType:'', waterAlk:'', waterGH:'', filter:'', altitudeFt:'', waterProfileKey:'', kettle:'', scale:'', ownedBrewers:[], ble:setupBleDefaults() },
    calib:{}, roasterSites:{}
  };
}
function cleanPalateSeed(raw){
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  try {
    const s = JSON.stringify(raw);
    if (!s || s === '{}' || s.length > 1500) return null;
    const o = JSON.parse(s), out = {};
    Object.keys(o).slice(0, 20).forEach(k => {
      if (/apikey|secret|token|auth/i.test(k)) return;
      const v = o[k];
      if (typeof v === 'number' && isFinite(v)) out[k.slice(0, 24)] = Math.round(v * 1000) / 1000;
      else if (typeof v === 'string' && v.length <= 40) out[k.slice(0, 24)] = v;
      else if (typeof v === 'boolean') out[k.slice(0, 24)] = v;
    });
    return Object.keys(out).length ? out : null;
  } catch(e){ return null; }
}
function cleanOwnedBrewers(raw){
  if (!Array.isArray(raw)) return [];
  const valid = new Set(_btAllMethods().map(m => m.key));
  const seen = new Set(), out = [];
  raw.forEach(x => {
    const k0 = String(x == null ? '' : x).trim();
    const k = valid.has(k0) ? k0 : resolveMethod(k0);
    if (k && valid.has(k) && !seen.has(k) && out.length < 24){ seen.add(k); out.push(k); }
  });
  return out;
}
function setupAltitude(v){
  const minFt = typeof ALT_MIN_FT === 'number' ? ALT_MIN_FT : -1411;
  const maxFt = typeof ALT_MAX_FT === 'number' ? ALT_MAX_FT : 15000;
  const n = typeof v === 'number' ? v : typeof v === 'string' && /^-?\d{1,5}$/.test(v.trim()) ? +v.trim() : NaN;
  return Number.isInteger(n) && n >= minFt && n <= maxFt ? n : '';
}
function setupClean(raw, ctx){
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  if (raw.v != null && raw.v !== 1) return null;
  ctx = ctx || {};
  const d = setupDefaults(), pick = (v, list, dflt) => list.includes(v) ? v : dflt;
  const txt = (v, n) => typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n) : '';
  const lvlOpts = (typeof LEVELS !== 'undefined' && Array.isArray(LEVELS)) ? LEVELS.map(l => l.v) : ['new', 'comfortable', 'expert'];
  const wuOpts = (typeof WATER_UNITS !== 'undefined' && Array.isArray(WATER_UNITS)) ? WATER_UNITS.map(u => u.v) : ['g', 'floz', 'cups', 'ml'];
  const cuOpts = (typeof COFFEE_UNITS !== 'undefined' && Array.isArray(COFFEE_UNITS)) ? COFFEE_UNITS.map(u => u.v) : ['g', 'oz', 'tbsp'];
  const sciLens = pick(raw.scienceLens, ['surface', 'hybrid', 'xray'], '');
  const out = {
    level:pick(raw.level, lvlOpts, d.level),
    waterUnit:pick(raw.waterUnit, wuOpts, d.waterUnit),
    coffeeUnit:pick(raw.coffeeUnit, cuOpts, d.coffeeUnit),
    sound:pick(raw.sound, ['off', 'chime', 'voice'], d.sound),
    coach:pick(raw.coach, ['guide', 'steps'], d.coach),
    cupView:pick(raw.cupView, ['compact', 'full'], d.cupView),
    taste:pick(raw.taste, ['quickonly', 'cuppingfirst'], d.taste),
    theme:pick(raw.theme, ['system', 'light', 'dark'], ''),
    tempUnit:pick(raw.tempUnit, ['F', 'C'], ''),
    elevUnit:pick(raw.elevUnit, ['m', 'ft'], ''),
    cupMode:pick(raw.cupMode, ['quick', 'guided', 'cva'], ''),
    coachTips:raw.coachTips !== false,
    palateSeed:cleanPalateSeed(raw.palateSeed),
    scienceLens:sciLens === 'surface' ? '' : sciLens,
    immersionBasis:_cleanImmersionBasis(raw.immersionBasis),
    toolModes:cleanToolModes(raw.toolModes),
    brewerMaterials:_cleanBrewerMaterials(raw.brewerMaterials),
    cryoTubes:_cleanCryoTubes(raw.cryoTubes),
    pocketMicronCalib:_cleanPocketMicronCalib(raw.pocketMicronCalib),
    philipsProfiles:_cleanPhilipsProfiles(raw.philipsProfiles),
    gear:d.gear, calib:_btCalibClean(raw.calib), roasterSites:{}
  };
  const g = raw.gear && typeof raw.gear === 'object' && !Array.isArray(raw.gear) ? raw.gear : {}, key = typeof g.grinderKey === 'string' ? g.grinderKey : '';
  const hasGrinders = typeof GRINDERS !== 'undefined' && Array.isArray(GRINDERS) && GRINDERS.length > 0;
  const known = hasGrinders ? GRINDERS.find(x => x.key === key) : null;
  const keyOk = known != null || (!hasGrinders && /^[a-z0-9_-]{2,48}$/i.test(key)) || PREGROUND_SETUP_KEYS.includes(key) || key === 'other' || key === 'unsure';
  const wpk = txt(g.waterProfileKey || raw.waterProfileKey, 40);
  const ket = txt(g.kettle || raw.kettle, 80);
  const scl = txt(g.scale || raw.scale, 80);
  const owb = cleanOwnedBrewers(Array.isArray(g.ownedBrewers) ? g.ownedBrewers : raw.ownedBrewers);
  const bleCfg = cleanSetupBle(g.ble || raw.ble);
  out.gear = {
    grinderKey:keyOk ? key : '',
    grinderName:known ? known.name : (key === 'unsure' ? 'Not sure' : ((key === 'other' || PREGROUND_SETUP_KEYS.includes(key) || (!hasGrinders && keyOk)) ? txt(g.grinderName, 80) : '')),
    grinderType:keyOk ? pick(g.grinderType, ctx.grinderTypes || ['burr', 'blade', 'unknown'], '') : '',
    waterType:pick(g.waterType, ctx.waterTypes || ['tap', 'filtered', 'bottled', 'distilled', 'remineral'], ''),
    waterAlk:/^\d{1,4}(\.\d{1,2})?$/.test(txt(g.waterAlk, 8)) ? txt(g.waterAlk, 8) : '',
    waterGH:/^\d{1,4}(\.\d{1,2})?$/.test(txt(g.waterGH, 8)) ? txt(g.waterGH, 8) : '',
    filter:txt(g.filter, 80),
    altitudeFt:setupAltitude(g.altitudeFt),
    waterProfileKey:/^[a-z0-9_-]{1,40}$/i.test(wpk) ? wpk : '',
    kettle:ket, scale:scl, ownedBrewers:owb, ble:bleCfg
  };
  if (raw.roasterSites && typeof raw.roasterSites === 'object' && !Array.isArray(raw.roasterSites)){
    Object.keys(raw.roasterSites).slice(0, 60).forEach(k => { const o = _btShopOrigin(raw.roasterSites[k]), kk = _btShopKey(k); if (o && kk) out.roasterSites[kk.slice(0, 60)] = o; });
  }
  return out;
}
function setupFromPrefs(prefs, ctx){
  prefs = prefs || {};
  return setupClean({
    level:prefs.level, waterUnit:prefs.waterUnit, coffeeUnit:prefs.coffeeUnit, sound:prefs.sound, coach:prefs.coach, cupView:prefs.cupView, taste:prefs.taste,
    theme:prefs.theme, tempUnit:prefs.tempUnit, elevUnit:prefs.elevUnit, cupMode:prefs.cupMode, coachTips:prefs.coachTips, palateSeed:prefs.palateSeed,
    scienceLens:prefs.scienceLens, immersionBasis:prefs.immersionBasis, toolModes:prefs.toolModes,
    brewerMaterials:prefs.brewerMaterials, cryoTubes:prefs.cryoTubes, pocketMicronCalib:prefs.pocketMicronCalib, philipsProfiles:prefs.philipsProfiles,
    waterProfileKey:prefs.waterProfileKey, kettle:prefs.kettle, scale:prefs.scale, ownedBrewers:prefs.ownedBrewers,
    gear:prefs.gear, calib:prefs.calib, roasterSites:prefs.roasterSites
  }, ctx);
}
function setupJson(s){
  if (!s) return '';
  const g = s.gear || {}, sites = {};
  Object.keys(s.roasterSites || {}).sort().forEach(k => { sites[k] = s.roasterSites[k]; });
  const base = { v:1, level:s.level, waterUnit:s.waterUnit, coffeeUnit:s.coffeeUnit, sound:s.sound, coach:s.coach, cupView:s.cupView, taste:s.taste };
  if (s.theme) base.theme = s.theme;
  if (s.tempUnit) base.tempUnit = s.tempUnit;
  if (s.elevUnit) base.elevUnit = s.elevUnit;
  if (s.cupMode) base.cupMode = s.cupMode;
  if (s.coachTips === false) base.coachTips = false;
  if (s.palateSeed) base.palateSeed = s.palateSeed;
  if (s.scienceLens && s.scienceLens !== 'surface') base.scienceLens = s.scienceLens;
  const ib = _cleanImmersionBasis(s.immersionBasis);
  if (ib !== '') base.immersionBasis = ib;
  if (!setupToolModesIsDefault(s.toolModes)) base.toolModes = cleanToolModes(s.toolModes);
  const bm = _cleanBrewerMaterials(s.brewerMaterials);
  if (Object.keys(bm).length) base.brewerMaterials = bm;
  const ct = _cleanCryoTubes(s.cryoTubes);
  if (ct.length) base.cryoTubes = ct;
  const pmc = _cleanPocketMicronCalib(s.pocketMicronCalib);
  if (pmc) base.pocketMicronCalib = pmc;
  const php = _cleanPhilipsProfiles(s.philipsProfiles);
  if (php) base.philipsProfiles = php;
  const gearOut = {
    grinderKey:g.grinderKey || '', grinderName:g.grinderName || '', grinderType:g.grinderType || '',
    waterType:g.waterType || '', waterAlk:g.waterAlk || '', waterGH:g.waterGH || '', filter:g.filter || ''
  };
  if (g.altitudeFt !== '' && g.altitudeFt != null) gearOut.altitudeFt = g.altitudeFt;
  if (g.waterProfileKey) gearOut.waterProfileKey = g.waterProfileKey;
  if (g.kettle) gearOut.kettle = g.kettle;
  if (g.scale) gearOut.scale = g.scale;
  if (Array.isArray(g.ownedBrewers) && g.ownedBrewers.length) gearOut.ownedBrewers = g.ownedBrewers;
  if (!setupBleIsDefault(g.ble)) gearOut.ble = serializeSetupBle(g.ble);
  base.gear = gearOut;
  base.calib = s.calib || {};
  base.roasterSites = sites;
  const str = JSON.stringify(base);
  if (str.length <= SETUP_MAX_CHARS) return str;
  delete base.palateSeed;
  delete base.cryoTubes;
  return JSON.stringify(base).slice(0, SETUP_MAX_CHARS);
}
function setupSame(a, b){ return !!a && !!b && setupJson(a) === setupJson(b); }
function setupIsDefault(s){ return !s || setupSame(s, setupDefaults()); }
function setupChoicesJson(s){ if (!s) return ''; const o = JSON.parse(setupJson(s)); delete o.calib; delete o.roasterSites; return JSON.stringify(o); }
function setupSameChoices(a, b){ return !!a && !!b && setupChoicesJson(a) === setupChoicesJson(b); }
function setupChoicesDefault(s){ return !s || setupChoicesJson(s) === setupChoicesJson(setupDefaults()); }
function setupMergeExtras(mine, theirs){
  const calib = JSON.parse(JSON.stringify((mine && mine.calib) || {})), sites = Object.assign({}, (mine && mine.roasterSites) || {});
  const tc = (theirs && theirs.calib) || {}; Object.keys(tc).forEach(g => { calib[g] = calib[g] || {}; Object.keys(tc[g]).forEach(c => { if (!calib[g][c]) calib[g][c] = tc[g][c]; }); });
  const ts = (theirs && theirs.roasterSites) || {}; Object.keys(ts).forEach(k => { if (!sites[k] && Object.keys(sites).length < 60) sites[k] = ts[k]; });
  return { calib:_btCalibClean(calib), roasterSites:sites };
}
function setupRead(header, rows, ctx){
  const si = (header || []).indexOf(SETUP_COLUMN); if (si < 0) return null;
  const ti = (header || []).indexOf('saved_at'); let best = null, bestAt = '';
  for (let i = 0; i < (rows || []).length; i++){
    const t = String((rows[i] || [])[si] || '').trim(); if (!t) continue;
    if (t.length > SETUP_MAX_CHARS) continue;
    const at = ti >= 0 ? String((rows[i] || [])[ti] || '') : '';
    if (best && at && bestAt && at < bestAt) continue;
    let o; try { o = JSON.parse(t); } catch(e){ continue; }
    const c = setupClean(o, ctx); if (c){ best = c; bestAt = at; }
  }
  return best;
}
function setupSummary(s){
  if (!s) return [];
  const lvlList = typeof LEVELS !== 'undefined' && Array.isArray(LEVELS) ? LEVELS : [{ v:'new', label:'Just Starting' }, { v:'comfortable', label:'Comfy Brewer' }, { v:'expert', label:'Bean Scientist' }];
  const wuList = typeof WATER_UNITS !== 'undefined' && Array.isArray(WATER_UNITS) ? WATER_UNITS : [{ v:'g', label:'g / mL' }];
  const cuList = typeof COFFEE_UNITS !== 'undefined' && Array.isArray(COFFEE_UNITS) ? COFFEE_UNITS : [{ v:'g', label:'g' }];
  const lv = lvlList.find(l => l.v === s.level), wu = wuList.find(u => u.v === s.waterUnit), cu = cuList.find(u => u.v === s.coffeeUnit), g = s.gear || {}, out = [];
  out.push('Experience level: ' + (lv ? lv.label : 'not chosen yet'));
  const unitBits = ['water in ' + (wu ? wu.label : 'g / mL'), 'coffee in ' + (cu ? cu.label : 'g')];
  if (s.tempUnit) unitBits.push('temperature in deg ' + s.tempUnit);
  if (s.elevUnit) unitBits.push('elevation in ' + s.elevUnit);
  out.push('Units: ' + unitBits.join(', '));
  if (s.theme) out.push('Appearance: ' + s.theme);
  if (s.scienceLens) out.push('Science Lens: ' + s.scienceLens);
  if (s.immersionBasis) out.push('Immersion basis: ' + s.immersionBasis);
  out.push('Timer: ' + ({ off:'sound off', chime:'beep', voice:'voice' }[s.sound] || 'sound off') + ', ' + (s.coach === 'steps' ? 'key steps only' : 'guided'));
  if (g.grinderName) out.push('Grinder: ' + g.grinderName);
  if (g.waterType) out.push('Water: ' + g.waterType + (g.waterProfileKey ? ' (' + g.waterProfileKey + ')' : ''));
  if (g.filter) out.push('Filter: ' + g.filter);
  if (g.kettle) out.push('Kettle: ' + g.kettle);
  if (g.scale) out.push('Scale: ' + g.scale);
  if (g.ble && !setupBleIsDefault(g.ble)){
    const bp = BLE_SCALE_PROTOCOLS.find(x => x.v === g.ble.preferredBrand) || BLE_SCALE_PROTOCOLS[0];
    const remTxt = Array.isArray(g.ble.rememberedDevices) && g.ble.rememberedDevices.length ? (', ' + g.ble.rememberedDevices.length + ' remembered') : '';
    out.push('Bluetooth bench: ' + bp.label + remTxt);
  }
  if (Array.isArray(g.ownedBrewers) && g.ownedBrewers.length) out.push('Owned brewers: ' + g.ownedBrewers.length + ' selected');
  if (!setupToolModesIsDefault(s.toolModes)) out.push('Workflow tools: personalized tool preferences');
  if (g.altitudeFt !== '' && g.altitudeFt != null) out.push('Where you brew: ' + Number(g.altitudeFt).toLocaleString('en-US') + ' ft');
  const n = Object.keys(s.calib || {}).length, w = Object.keys(s.roasterSites || {}).length;
  if (n) out.push('Grinder results kept for ' + n + (n === 1 ? ' grinder' : ' grinders'));
  if (w) out.push(w + (w === 1 ? ' roaster website' : ' roaster websites') + ' remembered');
  return out;
}

/* ---------- 129-Column COLUMN_GUIDE (1-to-1 Lockstep with COLUMNS) ---------- */
const COLUMN_NOTES = [
  'One row is one tasting. A Quick tasting, a Guided Sensory tasting and a scored Cupping share the same 129 columns; a column that does not apply to a row is empty.',
  'Score kinds are never pooled directly: home_1cup, sca_5cup, quick and cva_affective are different scales and different questions. Compare raw totals only within one score_kind, or use computeUnifiedRating() for calibrated 0.5-5.0 preference utility.',
  'Extraction (brew_ey_pct, index 33) stays strictly on the cup basis: TDS % x finished coffee weight / coffee dose. Total slurry / water-poured extraction (Gagne/Rao mass balance) is stored separately in brew_ey_total_pct (index 121) so cup-basis and slurry-basis numbers are never mixed.',
  'Text columns that start with = + - or @ are saved with a leading apostrophe so a spreadsheet does not run them as formulas. Structured JSON columns (recipe_adaptation_json, cva_intensity_json, setup_json) are RFC-4180 CSV-quoted without formula-prefixing.',
  'Lists in one cell (flavors, words, changes made at the Perfect step) are separated by semicolons. Water minerals are in mg/L. Weights are in grams, temperatures in the unit named by the column, time in seconds.',
  'Older rows (89, 99, 112, 115, or 116 columns) may have empty cells for columns added later. An empty cell always means not recorded, never zero.'
];
const COLUMN_GUIDE = [
  ['schema_version', 'Row', 'Version of the file format the row was written in (1, 2, 5.x, or 6.0; all versions load losslessly).', 'Currently 6.0'],
  ['id', 'Row', 'Unique id of this row.', 'Text'],
  ['coffee_id', 'Row', 'Id shared by every tasting of the same coffee bag, so repeat brews group together.', 'Text'],
  ['saved_at', 'Row', 'When the row was saved.', 'Date and time, ISO 8601'],
  ['cupping_date', 'Row', 'The date of the tasting.', 'YYYY-MM-DD'],
  ['mode', 'Row', 'How the row was made.', 'single_cup = a scored tasting; quick = a Quick tasting'],
  ['roaster', 'Coffee', 'The roaster named on the bag.', 'Text'],
  ['coffee_name', 'Coffee', 'The coffee name on the bag.', 'Text'],
  ['origin', 'Coffee', 'Country or region of the coffee.', 'Text'],
  ['process', 'Coffee', 'Processing method (washed, natural, honey and so on).', 'Text label'],
  ['decaf', 'Coffee', 'Whether the coffee is decaffeinated.', 'yes or empty'],
  ['roast_level', 'Coffee', 'Roast level as chosen in the app.', 'Text label'],
  ['elevation_class', 'Coffee', 'Growing altitude band, used as a stand-in for bean density.', 'Text label'],
  ['elevation_m', 'Coffee', 'Growing altitude if the bag gave it.', 'Metres'],
  ['roast_date', 'Coffee', 'Roast date from the bag.', 'YYYY-MM-DD'],
  ['days_since_roast', 'Coffee', 'Days from the roast date to the brew.', 'Whole days'],
  ['varietal', 'Coffee', 'Coffee variety named on the bag.', 'Text'],
  ['bag_notes', 'Coffee', 'Tasting notes printed on the bag.', 'Text'],
  ['brew_method', 'Brew', 'The brewing method used across all 23 canonical brewers.', 'Method label or key; resolved by resolveMethod()'],
  ['brew_attempt', 'Brew', 'Which try this was for the same coffee and method.', 'Whole number'],
  ['brew_dose_g', 'Brew', 'Ground coffee used.', 'Grams'],
  ['brew_water_g', 'Brew', 'Brew water used.', 'Grams'],
  ['brew_ratio', 'Brew', 'Water per gram of coffee.', 'The number after 1: (16.7 means 1:16.7)'],
  ['brew_ratio_recommended', 'Brew', 'The ratio the app suggested for this brew.', 'The number after 1:'],
  ['brew_temp_f', 'Brew', 'Water temperature used.', 'Degrees Fahrenheit'],
  ['brew_temp_c', 'Brew', 'Water temperature used.', 'Degrees Celsius'],
  ['brew_temp_recommended_f', 'Brew', 'The temperature the app suggested.', 'Degrees Fahrenheit'],
  ['brew_grind_target_um', 'Brew', 'The grind size the app aimed for.', 'Micrometres (a target, not a measurement)'],
  ['brew_grind_setting', 'Brew', 'The setting on your grinder, as you typed or dialed it.', 'Text'],
  ['brew_time_s', 'Brew', 'The planned brew time.', 'Seconds'],
  ['brew_actual_time_s', 'Brew', 'The brew time you measured.', 'Seconds'],
  ['brew_out_g', 'Brew', 'Weight of the finished coffee in the cup.', 'Grams'],
  ['brew_tds_pct', 'Brew', 'Strength of the brew from a refractometer reading.', 'Percent TDS'],
  ['brew_ey_pct', 'Brew', 'Extraction worked out by the app from TDS, finished coffee and dose.', 'Percent, cup basis (see the notes)'],
  ['brew_agitation', 'Brew', 'How much the brew was stirred or swirled.', 'gentle, standard or active'],
  ['brew_technique', 'Brew', 'The pouring technique.', 'standard, pulse_4_6, iced_brew_over_ice or iced_add_after'],
  ['brew_technique_detail', 'Brew', 'A readable name for the technique when it is not standard.', 'Text'],
  ['brew_water_type', 'Brew', 'The kind of water used.', 'tap, filtered, bottled, distilled or remineral'],
  ['brew_filter', 'Brew', 'The filter or paper used.', 'Text'],
  ['brew_grinder_type', 'Brew', 'Kind of grinder.', 'Text label'],
  ['brew_grinder_name', 'Brew', 'Grinder model, as you selected or typed it.', 'Text'],
  ['brew_pour_notes', 'Brew', 'What you saw while brewing, if it differed from what was expected.', 'Text'],
  ['brew_adjustment', 'Brew', 'The change the app suggested at the Perfect step.', 'Text'],
  ['fragrance_aroma', 'Scores (older form)', 'Fragrance and aroma score in the form used before Release 45.', 'SCA scale, 6 to 10'],
  ['flavor', 'Scores', 'Flavor score.', 'SCA scale 6 to 10; cva_affective rows use 1 to 9'],
  ['aftertaste', 'Scores', 'Aftertaste score.', 'Same scale as flavor'],
  ['acidity', 'Scores', 'Acidity score.', 'Same scale as flavor'],
  ['body', 'Scores', 'Body score.', 'Same scale as flavor'],
  ['balance', 'Scores (older form)', 'Balance score in the form used before Release 45.', 'SCA scale, 6 to 10'],
  ['overall', 'Scores', 'Overall score.', 'Same scale as flavor'],
  ['acidity_intensity', 'Scores', 'How strong the acidity was, separate from how good it was.', '1 to 5'],
  ['body_intensity', 'Scores', 'How strong the body was, separate from how good it was.', '1 to 5'],
  ['words_fragrance_aroma', 'Scores (older form)', 'Words picked for fragrance and aroma.', 'Semicolon list'],
  ['words_flavor', 'Scores (older form)', 'Words picked for flavor.', 'Semicolon list'],
  ['words_aftertaste', 'Scores (older form)', 'Words picked for aftertaste.', 'Semicolon list'],
  ['words_acidity', 'Scores (older form)', 'Words picked for acidity.', 'Semicolon list'],
  ['words_body', 'Scores (older form)', 'Words picked for body.', 'Semicolon list'],
  ['aftertaste_length', 'Scores (older form)', 'How long the aftertaste lasted.', 'Text'],
  ['aroma_kit', 'Scores', 'Aroma kit vials you ticked on the Quick cards.', 'Semicolon list: number and name'],
  ['cool_acidity', 'Scores (older form)', 'Acidity as the cup cooled.', 'Text'],
  ['cool_sweetness', 'Scores (older form)', 'Sweetness as the cup cooled.', 'Text'],
  ['cool_bitterness', 'Scores (older form)', 'Bitterness as the cup cooled.', 'Text'],
  ['uniformity', 'Scores', 'Cup-to-cup consistency in a five-cup SCA tasting.', '0 to 10'],
  ['clean_cup', 'Scores', 'Freedom from off tastes.', '0 to 10'],
  ['sweetness', 'Scores', 'Sweetness score.', '0 to 10 on SCA rows; 1 to 9 on cva_affective rows'],
  ['taint_cups', 'Scores', 'Number of cups with a taint (a smell or taste in the cup).', 'Whole number'],
  ['fault_cups', 'Scores', 'Number of cups with a fault.', 'Whole number'],
  ['defect_deduction', 'Scores', 'Points taken off the total for one defective cup.', '0 or 4 on current rows'],
  ['total_score', 'Scores', 'The total score for the tasting.', 'Scale depends on score_kind'],
  ['score_kind', 'Scores', 'Which scoring scheme made total_score. Never pool across kinds.', 'home_1cup, sca_5cup, quick or cva_affective'],
  ['aroma_vials', 'Scores', 'Aroma vials you recognised.', 'Semicolon list'],
  ['note_fragrance_aroma', 'Notes', 'Your note on fragrance and aroma.', 'Text'],
  ['note_flavor', 'Notes', 'Your note on flavor.', 'Text'],
  ['note_aftertaste', 'Notes', 'Your note on aftertaste.', 'Text'],
  ['note_acidity', 'Notes', 'Your note on acidity.', 'Text'],
  ['note_body', 'Notes', 'Your note on body.', 'Text'],
  ['note_balance', 'Notes', 'Your note on balance.', 'Text'],
  ['note_overall', 'Notes', 'Your note on the whole cup.', 'Text'],
  ['defect_notes', 'Notes', 'What you noticed that was wrong with the cup.', 'Text'],
  ['general_notes', 'Notes', 'Anything else you wrote.', 'Text'],
  ['blend', 'Coffee', 'Whether the coffee is a blend or a single origin.', 'Single origin / single or Blend / blend'],
  ['details_guessed', 'Brew', 'Which details the app had to guess because you did not give them.', 'Semicolon list'],
  ['water_alkalinity_mgl', 'Brew', 'Alkalinity of the water if you entered it.', 'mg/L'],
  ['water_hardness_mgl', 'Brew', 'Hardness of the water if you entered it.', 'mg/L'],
  ['my_rating_stars', 'Your rating', 'How much you liked the coffee, kept apart from the scores.', 'Half-star steps from 0.5 to 5'],
  ['dial_symptom', 'Perfect step', 'What was wrong with the previous cup, as you described it.', 'sour, bitter, astringent, uneven, flat, muddy, thin, strong, great or notforme'],
  ['dial_change', 'Perfect step', 'What you changed on this brew to fix it.', 'Semicolon list'],
  ['dial_from_id', 'Perfect step', 'The id of the earlier tasting this brew was a response to.', 'Text'],
  ['dial_locked', 'Perfect step', 'Marks the one cup per coffee and method you chose as your best brew.', 'yes or empty'],
  ['make_again', 'Quick answers', 'Whether you would make this cup again.', 'yes, maybe or no'],
  ['q_smell', 'Quick answers', 'How the smell was.', 'good, okay, notgood or unsure'],
  ['q_taste', 'Quick answers', 'How the taste was.', 'good, okay, notgood or unsure'],
  ['q_aftertaste', 'Quick answers', 'How the aftertaste was.', 'good, okay, notgood or unsure'],
  ['q_acidity', 'Quick answers', 'How the acidity was.', 'good, okay, notgood or unsure'],
  ['q_sweetness', 'Quick answers', 'How the sweetness was.', 'good, okay, notgood or unsure'],
  ['q_body', 'Quick answers', 'How the body was.', 'good, okay, notgood or unsure'],
  ['flavors_liked', 'Quick answers', 'Flavors you liked.', 'Semicolon list'],
  ['flavors_not_liked', 'Quick answers', 'Flavors you did not like.', 'Semicolon list'],
  ['fragrance', 'Scores', 'Fragrance (dry grounds) hedonic score on a cva_affective row.', '1 to 9'],
  ['aroma', 'Scores', 'Aroma (wet grounds) hedonic score on a cva_affective row.', '1 to 9'],
  ['note_aroma', 'Notes', 'Your note on aroma.', 'Text'],
  ['note_sweetness', 'Notes', 'Your note on sweetness.', 'Text'],
  ['first_flavor', 'First impression', 'Flavor score before a retaste.', 'Same scale as flavor'],
  ['first_aftertaste', 'First impression', 'Aftertaste score before a retaste.', 'Same scale as flavor'],
  ['first_acidity', 'First impression', 'Acidity score before a retaste.', 'Same scale as flavor'],
  ['first_sweetness', 'First impression', 'Sweetness score before a retaste.', 'Same scale as sweetness'],
  ['first_body', 'First impression', 'Body score before a retaste.', 'Same scale as flavor'],
  ['first_overall', 'First impression', 'Overall score before a retaste.', 'Same scale as flavor'],
  ['cva_retasted', 'Scores', 'Whether you retasted and changed any score.', 'yes or no'],
  ['defect_type', 'Scores', 'The kind of defect, when the cup had one.', 'Text label'],
  ['fix_symptom', 'Perfect step', 'The extraction diagnostic or symptom tapped after tasting (in Quick, Guided or Cupping mode).', 'Same words as dial_symptom'],
  ['vs_acidity', 'Taste', 'Brightness compared with what the app expected from this coffee.', 'less, same or more'],
  ['vs_body', 'Taste', 'Body compared with what the app expected from this coffee.', 'less, same or more'],
  ['vs_sweetness', 'Taste', 'Sweetness compared with what the app expected from this coffee.', 'less, same or more'],
  ['brew_ey_model', 'Brew', 'The extraction the brew engine predicted for this brew as made, before any correction from your own measured brews.', 'Percent; water-poured basis for a steep, cup basis for a pour-over'],
  ['species', 'Coffee', 'Botanical coffee species (arabica, robusta, liberica, excelsa, stenophylla, eugenioides or blend_ar).', 'Species key or empty'],
  ['decaf_process', 'Coffee', 'Decaffeination chemistry when decaf is yes (ea, swiss, mountain, co2, mc or unknown).', 'Decaf key or empty'],
  ['is_frozen', 'Coffee', 'Whether the coffee beans were stored sealed in the freezer.', 'yes or empty'],
  ['frozen_date', 'Coffee', 'Date the bag entered freezer storage for -18 deg C Arrhenius aging calculation.', 'YYYY-MM-DD or empty'],
  ['freeze_days_offset', 'Coffee', 'Effective resting-age offset in days accounting for frozen storage.', 'Whole days or empty'],
  ['brew_style', 'Brew', 'Method sub-protocol or brewing style.', 'Style key or empty'],
  ['brew_ey_total_pct', 'Brew', 'Total slurry or water-poured mass-balance extraction yield (Gagne/Rao basis), separate from cup-basis brew_ey_pct.', 'Percent or empty'],
  ['recipe_adaptation_json', 'Brew', 'Compact JSON audit trail of physics, sensor telemetry, machine profile and Bayesian learning adjustments.', 'JSON text or empty'],
  ['sweetness_intensity', 'Scores', 'Descriptive sweetness intensity (SCA CVA 103 neutral scale), separate from hedonic liking.', '1 to 5 or empty'],
  ['bitterness_intensity', 'Scores', 'Descriptive bitterness intensity, separate from hedonic liking.', '1 to 5 or empty'],
  ['astringency_intensity', 'Scores', 'Descriptive dry/puckering tactile astringency intensity.', '1 to 5 or empty'],
  ['clarity_intensity', 'Scores', 'Descriptive flavor separation and cup clarity intensity.', '1 to 5 or empty'],
  ['cva_intensity_json', 'Scores', 'Compact JSON map of 1 to 5 descriptive sensory intensities and 2D pad coordinates, kept in bidirectional sync with scalar columns.', 'JSON text or empty'],
  ['setup_json', 'Setup', 'Your setup (units, level, theme, lens, gear, calibrations) saved with the newest row so a new device can pick it up.', 'JSON text (v:1); safe to ignore']
];
function columnGuideGaps(){
  const named = new Set(COLUMN_GUIDE.map(r => r[0])), cols = new Set(COLUMNS);
  const missing = COLUMNS.filter(c => !named.has(c)), extra = COLUMN_GUIDE.map(r => r[0]).filter(c => !cols.has(c));
  const dup = COLUMN_GUIDE.map(r => r[0]).filter((c, i, a) => a.indexOf(c) !== i);
  return { missing, extra, dup, order:COLUMN_GUIDE.every((r, i) => r[0] === COLUMNS[i]) };
}
function columnGuideCsv(){
  const lines = [['column', 'group', 'what it holds', 'units or allowed values']];
  COLUMNS.forEach(c => { const r = COLUMN_GUIDE.find(x => x[0] === c) || [c, '', '', '']; lines.push([r[0], r[1], r[2], r[3]]); });
  lines.push([], ['notes']);
  COLUMN_NOTES.forEach(n => lines.push([n]));
  return toCSV(lines.map(l => l.length ? l : ['']));
}

/* ---------- Share Codes (BT-code: V1 & bt1: Brew Passport Compatibility) ---------- */
const SHARE_TAG = 'BT-code:', SHARE_VERSION = 1;
const SH_B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
function shUtf8(s){ return Array.from(_btUtf8Encode(s)); }
function shFromUtf8(b){
  try { return _btUtf8Decode(b instanceof Uint8Array ? b : new Uint8Array(b)); } catch(e){ return null; }
}
function shB64(str){ return bkB64Encode(_btUtf8Encode(str)); }
function shUnB64(s){
  if (!/^[A-Za-z0-9_-]*$/.test(s) || s.length % 4 === 1) return null;
  try { return _btUtf8Decode(bkB64Decode(s)); } catch(e){ return null; }
}
function shSum(s){
  let a = 7, b = 13;
  for (let i = 0; i < s.length; i++){ a = (a * 31 + s.charCodeAt(i)) % 46655; b = (b * 17 + a + i) % 46653; }
  return ((a + b) % 46656).toString(36).padStart(3, '0');
}
function shText(v, n){ return String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n || 80); }
function shPack(coffee, brew, adjust){
  coffee = coffee || {}; brew = brew || {}; adjust = adjust || {};
  const c = {}, put = (k, v, n) => { v = shText(v, n || 80); if (v) c[k] = v; };
  put('n', coffee.name); put('r', coffee.roaster); put('o', coffee.origin); put('ro', coffee.roast); put('p', coffee.process); put('vr', coffee.varietal); put('b', coffee.blend);
  if (coffee.species && coffee.species !== 'arabica') put('sp', coffee.species, 24);
  if (coffee.decaf === 'yes'){ c.d = 1; if (coffee.decaf_process) put('dp', coffee.decaf_process, 24); }
  const o = { v:SHARE_VERSION, c };
  if (brew.method) o.m = String(brew.method);
  const stStyle = brew.style || brew.brew_style || brew.brewStyle || '';
  if (stStyle && stStyle !== 'standard') o.st = shText(stStyle, 32);
  if (+brew.water > 0) o.w = Math.round(+brew.water * 10) / 10;
  if (+brew.tempF > 0) o.t = Math.round(+brew.tempF);
  if (brew.tempComp) o.tc = 1;
  if (+brew.ratio > 0) o.ra = Math.round(+brew.ratio * 10) / 10;
  if (brew.agitation && brew.agitation !== 'standard') o.ag = String(brew.agitation);
  if (brew.technique && brew.technique !== 'standard') o.tq = String(brew.technique);
  if (brew.pulseTaste && brew.pulseTaste !== 'balanced') o.pt = String(brew.pulseTaste);
  if (brew.pulseStrength) o.ps = String(brew.pulseStrength);
  if (brew.ice != null && +brew.ice > 0 && +brew.ice !== 0.4 && (brew.technique === 'flash' || brew.technique === 'iceafter')) o.ic = +brew.ice;
  const g = Math.round(+adjust.grind || 0), r = Math.round(+adjust.ratio || 0), a = adjust.agit === 'gentle' || adjust.agit === 'active' ? adjust.agit : '';
  if (g || r || a) o.aj = [g, r, a];
  return o;
}
function shareCode(coffee, brew, adjust){
  if (!brew || !brew.method) return '';
  const p = shB64(JSON.stringify(shPack(coffee, brew, adjust)));
  return SHARE_TAG + ' V' + SHARE_VERSION + '.' + p + '.' + shSum(p);
}
function shareCodeOfRow(o){
  if (!o) return '';
  const g = k => unneutralize(o[k] || '');
  const mKey = resolveMethod(o.brew_method), m = _btAllMethods().find(x => x.key === mKey);
  if (!m) return '';
  const coffee = {
    name:g('coffee_name'), roaster:g('roaster'), origin:g('origin'), varietal:g('varietal'),
    roast:resolveRoast(g('roast_level')) || '', process:resolveProcess(g('process')) || '',
    blend:resolveBlend(g('blend')) || '', decaf:o.decaf === 'yes' ? 'yes' : '',
    species:g('species'), decaf_process:g('decaf_process')
  };
  const brew = {
    method:m.key, style:g('brew_style'), water:+o.brew_water_g, tempF:+o.brew_temp_f, ratio:+o.brew_ratio,
    agitation:['gentle', 'active'].includes(o.brew_agitation) ? o.brew_agitation : '',
    technique:resolveTechCsv(o.brew_technique)
  };
  return shareCode(coffee, brew, null);
}
function shCheck(o){
  if (!o || typeof o !== 'object' || Array.isArray(o)) return null;
  const c = o.c && typeof o.c === 'object' ? o.c : {}, coffee = {};
  [['n', 'name'], ['r', 'roaster'], ['o', 'origin'], ['vr', 'varietal']].forEach(p => { const t = shText(c[p[0]], 80); if (t) coffee[p[1]] = t; });
  const rKey = resolveRoast(c.ro);
  const hasRoasts = typeof ROASTS !== 'undefined' && Array.isArray(ROASTS);
  if (rKey) coffee.roast = (!hasRoasts || ROASTS.some(x => x.v === rKey)) ? rKey : (rKey === 'ultra-light' ? 'light' : rKey);
  const pKey = resolveProcess(c.p);
  const hasProcs = typeof PROCESSES !== 'undefined' && Array.isArray(PROCESSES);
  if (pKey && pKey !== 'unknown') coffee.process = (!hasProcs || PROCESSES.some(x => x.v === pKey)) ? pKey : ((/^honey-/.test(pKey) || /-honey$/.test(pKey)) ? 'honey' : pKey);
  const bKey = resolveBlend(c.b);
  if (bKey) coffee.blend = bKey;
  if (typeof c.sp === 'string' && /^[a-z_]{2,24}$/i.test(c.sp.trim())) coffee.species = c.sp.trim().toLowerCase();
  if (c.d === 1 || c.d === true){
    coffee.decaf = 'yes';
    if (typeof c.dp === 'string' && /^[a-z0-9_]{2,24}$/i.test(c.dp.trim())) coffee.decaf_process = c.dp.trim().toLowerCase();
  }
  const mKey = typeof o.m === 'string' ? resolveMethod(o.m) : '';
  const m = mKey ? _btAllMethods().find(x => x.key === mKey) : null, brew = {}, adjust = { grind:0, ratio:0, agit:'' };
  if (m){
    brew.method = m.key;
    if (typeof o.st === 'string' && /^[a-z0-9_-]{2,32}$/i.test(o.st.trim())) brew.style = o.st.trim();
    const w = +o.w; if (w >= 20 && w <= 5000) brew.water = Math.round(w * 10) / 10;
    const t = +o.t; if (t >= 165 && t <= 212) brew.tempF = Math.round(t);
    if (o.tc === 1) brew.tempComp = true;
    const rb = typeof ratioBounds === 'function' ? ratioBounds(m) : (m.type === 'espresso' ? [0.8, 5] : [1, 25]);
    const ra = +o.ra; if (ra >= rb[0] && ra <= rb[1]) brew.ratio = Math.round(ra * 10) / 10;
    if (['gentle', 'active'].includes(o.ag)) brew.agitation = o.ag;
    const techList = typeof techniquesFor === 'function' ? techniquesFor(m) : ['standard', 'pulse', 'flash', 'iceafter'];
    if (typeof o.tq === 'string' && o.tq !== 'standard' && techList.includes(o.tq)) brew.technique = o.tq;
    if (typeof o.pt === 'string' && ((typeof PULSE_TASTE !== 'undefined' && PULSE_TASTE[o.pt]) || ['sweet', 'balanced', 'bright'].includes(o.pt))) brew.pulseTaste = o.pt;
    if (typeof o.ps === 'string' && ((typeof PULSE_STRENGTH !== 'undefined' && PULSE_STRENGTH[o.ps]) || ['light', 'standard', 'strong'].includes(o.ps))) brew.pulseStrength = o.ps;
    const iceList = typeof ICE_SHARES !== 'undefined' && Array.isArray(ICE_SHARES) ? ICE_SHARES : [0.25, 0.3, 0.35, 0.4, 0.45];
    if (iceList.includes(+o.ic)) brew.ice = +o.ic;
    if (Array.isArray(o.aj)){
      const cl = v => Math.max(-6, Math.min(6, Math.round(+v || 0)));
      adjust.grind = cl(o.aj[0]); adjust.ratio = cl(o.aj[1]); adjust.agit = ['gentle', 'active'].includes(o.aj[2]) ? o.aj[2] : '';
    }
  }
  if (!coffee.name && !brew.method) return null;
  return { coffee, brew, adjust };
}
function shReadWords(text){
  const lines = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const allM = _btAllMethods();
  let mi = -1, m = null, rest = '';
  for (let i = 0; i < lines.length && mi < 0; i++){
    const ln = lines[i];
    allM.forEach(x => {
      if (mi >= 0) return;
      [x.label, x.key].forEach(nm => {
        if (mi >= 0 || !nm || ln.length < nm.length || ln.slice(0, nm.length).toLowerCase() !== nm.toLowerCase()) return;
        const after = ln.slice(nm.length);
        if (after === '' || /^\s*(?:\u00b7|:)/.test(after)){ mi = i; m = x; rest = after.replace(/^\s*(?:\u00b7|:)\s*/, ''); }
      });
    });
  }
  if (!m) return null;
  const hot = lines.join('\n');
  let coffeeLine = '';
  if (/^\s*\u00b7/.test(lines[mi].slice((m.label || '').length)) || /^\s*\u00b7/.test(lines[mi].slice(m.key.length))) coffeeLine = rest;
  else if (mi > 0) coffeeLine = lines[0];
  const o = { v:1, c:{}, m:m.key };
  if (coffeeLine){
    let cl = coffeeLine; const ro = /,?\s*(ultra-light|nordic|medium-light|medium-dark|light|medium|dark) roast$/i.exec(cl);
    if (ro){ o.c.ro = resolveRoast(ro[1]) || ro[1].toLowerCase(); cl = cl.slice(0, ro.index); }
    const nr = /^(.*?)\s*\((.*)\)$/.exec(cl.trim());
    if (nr){ o.c.n = nr[1]; o.c.r = nr[2]; } else o.c.n = cl.trim();
    if (!ro && /\bg (coffee|water)\b|\u00b0F|^Grind\b|^My (rating|score)/i.test(coffeeLine)) o.c = {};
  }
  let x;
  if ((x = /(\d+(?:\.\d+)?) g hot water over (\d+(?:\.\d+)?) g ice \(1:(\d+(?:\.\d+)?) in total\)/.exec(hot))){ o.w = Math.round((+x[1] + +x[2]) * 10) / 10; o.ra = +x[3]; o.tq = 'flash'; }
  else if ((x = /(\d+(?:\.\d+)?) g water(?: \(1:(\d+(?:\.\d+)?)\))?/.exec(hot))){ o.w = +x[1]; if (x[2]) o.ra = +x[2]; }
  if ((x = /(\d{3})\s*\u00b0?\s*F/.exec(hot))) o.t = +x[1];
  return shCheck(o);
}
function shareRead(text){
  text = String(text == null ? '' : text).slice(0, 20000);
  if (!text.trim()) return { ok:false, why:'empty' };
  /* Support bt1: / #bp1= QR Brew Passport URIs transparently */
  const bpMatch = /(?:^|\s|#)(?:bt1:|bp1=)([A-Za-z0-9_-]{8,})/.exec(text.trim());
  if (bpMatch){
    const rawJson = shUnB64(bpMatch[1].split('.')[0]);
    try {
      const bp = rawJson ? JSON.parse(rawJson) : null;
      if (bp && typeof bp === 'object' && (bp.rx || bp.b)){
        const b = bp.b || {}, rx = bp.rx || {};
        const cToF = c => Math.round(+c * 9 / 5 + 32);
        const mapped = shCheck({
          v:1,
          c:{ n:b.n || '', r:b.r || '', o:b.o || '', p:b.p || '', ro:b.ro || '' },
          m:rx.m || 'v60',
          w:rx.w || 0,
          ra:(+rx.d > 0 && +rx.w > 0) ? (+rx.w / +rx.d) : (rx.ra || 0),
          t:rx.tf ? +rx.tf : (rx.ts ? cToF(rx.ts) : 0)
        });
        if (mapped){
          if (b.ag != null) mapped.coffee.agtron = String(b.ag);
          if (b.rd != null) mapped.coffee.roast_delta = String(b.rd);
          if (_btValidIsoDate(b.dt)) mapped.coffee.roast_date = b.dt;
          if (+rx.d > 0) mapped.brew.dose = +rx.d;
          if (+rx.um > 0) mapped.brew.um = +rx.um;
          return { ok:true, via:'passport', passport:bp, coffee:mapped.coffee, brew:mapped.brew, adjust:mapped.adjust };
        }
      }
    } catch(e){}
  }
  const at = text.toLowerCase().indexOf(SHARE_TAG.toLowerCase());
  if (at >= 0){
    const rest = SHARE_TAG + text.slice(at + SHARE_TAG.length).replace(/\s+/g, ''), m = /^BT-code:V(\d{1,3})\.([A-Za-z0-9_-]+)\.([0-9a-z]{3})/.exec(rest);
    if (!m) return { ok:false, why:'damaged' };
    if (+m[1] > SHARE_VERSION) return { ok:false, why:'newer' };
    if (shSum(m[2]) !== m[3]) return { ok:false, why:'damaged' };
    const json = shUnB64(m[2]); let o = null;
    try { o = json == null ? null : JSON.parse(json); } catch(e){ o = null; }
    const r = shCheck(o);
    return r ? { ok:true, via:'code', coffee:r.coffee, brew:r.brew, adjust:r.adjust } : { ok:false, why:'damaged' };
  }
  const r = shReadWords(text);
  if (r) return { ok:true, via:'words', coffee:r.coffee, brew:r.brew, adjust:r.adjust };
  if (/Worth the price:|Order it again:/i.test(text) || (/Made with BeanTelligence/i.test(text) && /(^|\n)At [^\n]+/.test(text) && /\n\D?\d+\.\d\d\s*(\n|$)/.test(text))) return { ok:false, why:'drink' };
  return { ok:false, why:'unreadable' };
}
const SHARE_FOOT = 'Made with BeanTelligence';
const shNum = (v, d) => { const n = +v; return isFinite(n) ? String(Math.round(n * Math.pow(10, d)) / Math.pow(10, d)) : ''; };
const shLow = s => String(s == null ? '' : s).trim().toLowerCase();
function shCoffeeLine(name, roaster, roast){
  const n = unneutralize(String(name || '')).trim(), r = unneutralize(String(roaster || '')).trim(), ro = shLow(unneutralize(roast));
  const head = n ? n + (r ? ' (' + r + ')' : '') : r;
  return [head, ro ? ro + ' roast' : ''].filter(Boolean).join(', ');
}
function shareRecipeText(r, coffee, st){
  if (!r || !r.method) return '';
  coffee = coffee || {};
  const lines = [];
  const cl = shCoffeeLine(coffee.name, coffee.roaster, coffee.roast);
  lines.push([r.method.label || r.method.key, cl].filter(Boolean).join(' \u00b7 '));
  const dose = shNum(r.dose, 1), water = shNum(r.water, 1);
  if (dose && water){
    if (r.ice > 0) lines.push(dose + ' g coffee, ' + shNum(r.hot, 1) + ' g hot water over ' + shNum(r.ice, 1) + ' g ice (1:' + shNum(r.ratio, 1) + ' in total)');
    else lines.push(dose + ' g coffee, ' + water + ' g water (' + _btFmtRatio(r.ratio) + ')');
  }
  if (r.temp && r.temp.kind === 'hot' && r.temp.f) lines.push('Water ' + r.temp.f + '\u00b0F (' + r.temp.c + '\u00b0C)');
  if (r.grind && r.grind.name) lines.push('Grind ' + r.grind.name.toLowerCase() + (r.grind.um ? ', about ' + r.grind.um + ' \u00b5m' : ''));
  const t = [];
  if (r.bloom && r.bloom.secs) t.push('Bloom ' + r.bloom.secs + ' s');
  if (r.totalSecs) t.push('total time ' + _btFmtTime(r.totalSecs));
  if (t.length){ const s = t.join(', '); lines.push(s.charAt(0).toUpperCase() + s.slice(1)); }
  lines.push(SHARE_FOOT);
  const code = st ? shareCode(coffee, Object.assign({}, st.brew, { method:r.method.key }), st.adjust) : '';
  if (code) lines.push(code);
  return lines.join('\n');
}
function shareTastingText(o){
  if (!o) return '';
  const lines = [], cl = shCoffeeLine(o.coffee_name, o.roaster, o.roast_level);
  if (cl) lines.push(cl);
  const bits = [];
  if (+o.brew_dose_g > 0) bits.push(shNum(o.brew_dose_g, 1) + ' g coffee');
  if (+o.brew_water_g > 0) bits.push(shNum(o.brew_water_g, 1) + ' g water' + (+o.brew_ratio > 0 ? ' (1:' + shNum(o.brew_ratio, 1) + ')' : ''));
  if (+o.brew_temp_f > 0) bits.push(shNum(o.brew_temp_f, 0) + '\u00b0F');
  const mk = unneutralize(String(o.brew_method || '')).trim(), rk = resolveMethod(mk), mdef = _btAllMethods().find(x => x.key === rk || x.key === mk), m = mdef ? mdef.label : mk;
  if (m || bits.length) lines.push((m ? m + (bits.length ? ': ' : '') : '') + bits.join(', '));
  const g = [];
  if (+o.brew_grind_target_um > 0) g.push('Grind about ' + shNum(o.brew_grind_target_um, 0) + ' \u00b5m');
  if (+o.brew_time_s > 0) g.push(_btFmtTime(+o.brew_time_s));
  if (g.length) lines.push(g.join(', '));
  const stars = validStars(o.my_rating_stars);
  if (stars) lines.push('My rating: ' + shNum(stars, 1) + ' out of 5 stars');
  if (o.total_score !== '' && o.total_score != null && +o.total_score > 0) lines.push('My score: ' + shNum(o.total_score, 2) + ' out of 100');
  lines.push(SHARE_FOOT);
  const code = shareCodeOfRow(o);
  if (code) lines.push(code);
  return lines.join('\n');
}
function shareDrinkText(d){
  if (!d) return '';
  const kind = SHOP_KINDS.find(k => k.v === d.kind), size = SHOP_SIZES.find(s => s.v === d.size);
  const name = String(d.name || '').trim() || (kind ? kind.label : 'Drink');
  const lines = [];
  lines.push([name, shLow(d.temp), size ? shLow(size.label) : '', d.amount ? d.amount + ' ' + d.unit : ''].filter(Boolean).join(', '));
  const mk = SHOP_MILKS.find(x => x.v === d.milk), fl = SHOP_FLAVORS.find(x => x.v === d.flavor), sn = shopShots(d.shots);
  const extra = [mk ? mk.say.charAt(0).toUpperCase() + mk.say.slice(1) : '', sn ? sn + ' extra ' + (sn === 1 ? 'shot' : 'shots') : '', fl && fl.v !== 'none' ? shLow(fl.label) : ''].filter(Boolean);
  if (extra.length) lines.push(extra.join(', '));
  const place = shopPlaceText(d);
  if (d.shop || place) lines.push('At ' + [d.shop, place].filter(Boolean).join(', '));
  if (d.price > 0) lines.push((d.sym || '$') + (Math.round(d.price * 100) / 100).toFixed(2));
  const od = SHOP_ORDERS.find(x => x.v === d.how), st = SHOP_STRENGTHS.find(x => x.v === d.strength), sw = SHOP_SWEETS.find(x => x.v === d.sweet), q = [];
  if (od) q.push('Ordered: ' + shLow(od.label));
  if (st) q.push('Strength: ' + shLow(st.label));
  if (sw) q.push('Sweetness: ' + shLow(sw.label));
  if (q.length) lines.push(q.join('. ') + '.');
  const w = SHOP_WORTHS.find(x => x.v === d.worth), a = SHOP_AGAINS.find(x => x.v === d.again);
  const j = [];
  if (w) j.push('Worth the price: ' + w.label.toLowerCase());
  if (a) j.push('Order it again: ' + a.label.toLowerCase());
  if (j.length) lines.push(j.join('. ') + '.');
  lines.push(SHARE_FOOT);
  return lines.join('\n');
}

/* ---------- Coffee Prices & Living-Bag Ledger Codec (17-col + optional rem_g / tubes_json) ---------- */
const _BT_COST_UNITS = [['g', 1], ['kg', 1000], ['oz', 28.349523125], ['lb', 453.59237]];
const _BT_DAYS_PER_MONTH = 365.25 / 12;
const _BT_MAX_PODS = 1000;
function costGrams(size, unit){
  const u0 = String(unit || '').toLowerCase() === 'lbs' ? 'lb' : String(unit || '').toLowerCase();
  const u = _BT_COST_UNITS.find(x => x[0] === u0), s = parseFloat(size);
  return u && isFinite(s) && s > 0 && s <= 100000 ? s * u[1] : 0;
}
function costOne(o){
  o = o || {};
  const price = parseFloat(o.price), cups = parseFloat(o.cups);
  if (!(price > 0 && price <= 10000)) return { ok:false, why:'price' };
  let r;
  if (o.kind === 'pods'){
    const n = parseFloat(o.size);
    if (!(n >= 1 && n <= _BT_MAX_PODS)) return { ok:false, why:'size' };
    const perCup = price / n;
    r = { ok:true, kind:'pods', grams:null, perGram:null, perCup, cupsInBag:n, perDay:null, perWeek:null, perMonth:null, daysInBag:null };
  } else {
    const dose = parseFloat(o.dose), grams = costGrams(o.size, o.unit);
    if (!(grams > 0)) return { ok:false, why:'size' };
    if (!(dose > 0 && dose <= 200)) return { ok:false, why:'dose' };
    if (dose > grams) return { ok:false, why:'dose-over-bag' };
    const perGram = price / grams, perCup = perGram * dose;
    r = { ok:true, kind:'bag', grams, perGram, perCup, cupsInBag:grams / dose, perDay:null, perWeek:null, perMonth:null, daysInBag:null };
  }
  if (cups > 0 && cups <= 100){ r.perDay = r.perCup * cups; r.perWeek = r.perDay * 7; r.perMonth = r.perDay * _BT_DAYS_PER_MONTH; r.daysInBag = r.cupsInBag / cups; }
  return r;
}
function costCompare(a, b){
  if (!a || !b || !a.ok || !b.ok) return { ok:false };
  const lo = a.perCup <= b.perCup ? a : b, hi = lo === a ? b : a, gap = hi.perCup - lo.perCup;
  const same = gap < 0.005 || (lo.perCup > 0 && gap / lo.perCup < 0.01);
  return { ok:true, cheaper:same ? 'same' : (lo === a ? 'a' : 'b'), perCup:gap, perMonth:a.perMonth != null && b.perMonth != null ? Math.abs(a.perMonth - b.perMonth) : null, pct:hi.perCup > 0 ? (hi.perCup - lo.perCup) / hi.perCup * 100 : 0 };
}

const PRICE_COLUMNS = ['coffee', 'roaster', 'currency', 'bag price', 'bag size', 'size unit', 'dose (g)', 'cost per cup', 'cups per day', 'cost per month', 'date', 'kind', 'roast date', 'finished', 'city', 'state', 'roast level'];
const PRICE_MAX_ROWS = 2000;
const PRICE_MAX_TEXT = 2000000;
const PRICE_POD_COUNTS = [10, 12, 16, 24, 36, 50];
const priceNum = (v, dp) => { const x = parseFloat(v); return isFinite(x) ? Math.round(x * Math.pow(10, dp)) / Math.pow(10, dp) : null; };
const priceText = (v, n) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n);
function priceDate(v, monthOk){
  const t = String(v || '').trim(), m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(t);
  if (!m || +m[2] < 1 || +m[2] > 12) return '';
  if (m[3] === undefined) return monthOk ? t : '';
  return +m[3] >= 1 && +m[3] <= 31 ? t : '';
}
const priceMonth = e => e && e.date ? e.date.slice(0, 7) : '';
function priceEntry(o){
  o = o || {};
  const coffee = priceText(o.coffee || o.name, 80), price = priceNum(o.price, 2), size = priceNum(o.size != null ? o.size : o.grams, 2), unit0 = String(o.unit || (o.grams != null ? 'g' : '')).trim().toLowerCase();
  const pods = o.kind === 'pods' || (o.kind !== 'bag' && unit0 === 'pods');
  if (!coffee || !(price > 0 && price <= 10000)) return null;
  if (pods){ if (!(size >= 1 && size <= _BT_MAX_PODS && size === Math.round(size))) return null; }
  else if (!(costGrams(size, unit0) > 0)) return null;
  const dose = pods ? null : priceNum(o.dose, 1), cups = pods ? null : priceNum(o.cups, 1);
  const roastDateVal = priceDate(o.roast, false) || priceDate(o.roast_date, false);
  const rLvlVal = pods ? '' : (resolveRoast(o.rlevel || o.roast_level || (!roastDateVal && typeof o.roast === 'string' ? o.roast : '')) || '');
  const symRaw = String(o.sym || o.currency || '').trim();
  const symClean = symRaw === 'USD' ? '$' : symRaw === 'EUR' ? 'EUR' : symRaw === 'GBP' ? 'GBP' : (priceText(symRaw, 3) || '$');
  const entry = {
    kind:pods ? 'pods' : 'bag', coffee, roaster:priceText(o.roaster, 80), sym:symClean, currency:priceText(o.currency || (symClean === '$' ? 'USD' : symClean), 6) || 'USD', price, size, unit:pods ? 'pods' : unit0,
    date:priceDate(o.date, true), dose:dose > 0 && dose <= 200 ? dose : null, cups:cups > 0 && cups <= 100 ? cups : null,
    roast:roastDateVal, finished:priceDate(o.finished, false), city:priceText(o.city, 60), state:priceText(o.state, 60),
    rlevel:rLvlVal
  };
  if (typeof o.id === 'string' && o.id.trim()) entry.id = priceText(o.id, 64);
  if (typeof o.notes === 'string' && o.notes.trim()) entry.notes = priceText(o.notes, 200);
  if (!pods && o.rem_g !== undefined && o.rem_g !== null && String(o.rem_g).trim() !== ''){
    const rg = priceNum(o.rem_g, 1);
    const maxG = costGrams(size, unit0);
    if (rg != null && rg >= 0 && rg <= maxG + 50) entry.rem_g = rg;
  }
  if (o.tubes_json !== undefined && o.tubes_json !== null && String(o.tubes_json).trim() !== ''){
    try {
      const parsed = typeof o.tubes_json === 'string' ? JSON.parse(o.tubes_json) : o.tubes_json;
      if (Array.isArray(parsed) && parsed.length){
        const cleaned = _cleanCryoTubes(parsed);
        if (cleaned.length) entry.tubes_json = JSON.stringify(cleaned);
      }
    } catch(e){}
  } else if (Array.isArray(o.tubes) && o.tubes.length){
    const cleaned = _cleanCryoTubes(o.tubes);
    if (cleaned.length) entry.tubes_json = JSON.stringify(cleaned);
  }
  if (typeof o.coffee_id === 'string' && o.coffee_id.trim()) entry.coffee_id = priceText(o.coffee_id, 64);
  if (o.is_frozen === 'yes' || o.is_frozen === true) entry.is_frozen = 'yes';
  if (_btValidIsoDate(o.frozen_date)) entry.frozen_date = o.frozen_date;
  return entry;
}
function priceKey(e){ return [e.coffee, e.roaster].map(s => String(s).toLowerCase()).concat([e.price, e.size, e.unit, e.date]).join('|'); }
function priceAdd(list, o, again){
  const e = priceEntry(o), cur = Array.isArray(list) ? list : [];
  if (!e) return { list:cur, added:false, why:'unusable' };
  if (cur.length >= PRICE_MAX_ROWS) return { list:cur, added:false, why:'full' };
  if (!again){ const k = priceKey(e); if (cur.some(x => priceKey(x) === k)) return { list:cur, added:false, why:'same' }; }
  return { list:cur.concat([e]), added:true, why:'' };
}
function priceMerge(list, more){
  const cur = Array.isArray(list) ? list.slice() : []; let added = 0, full = 0;
  const have = {}; cur.forEach(x => { const k = priceKey(x); have[k] = (have[k] || 0) + 1; });
  (more || []).forEach(e0 => {
    const e = priceEntry(e0); if (!e) return;
    const k = priceKey(e);
    if (have[k] > 0){ have[k]--; return; }
    if (cur.length >= PRICE_MAX_ROWS){ full++; return; }
    cur.push(e); added++;
  });
  return { list:cur, added, full };
}
function priceSet(list, i, patch){
  const cur = Array.isArray(list) ? list : [];
  if (!(i >= 0 && i < cur.length)) return { list:cur, ok:false };
  const e = priceEntry(Object.assign({}, cur[i], patch || {}));
  if (!e) return { list:cur, ok:false };
  const next = cur.slice(); next[i] = e; return { list:next, ok:true };
}
function priceRead(text){
  text = String(text == null ? '' : text);
  if (text.length > PRICE_MAX_TEXT) return { error:'That file is too big to be a prices file. Nothing was changed.' };
  const p = parseCSV(text);
  if (p.error) return { error:p.error };
  const col = {}; p.header.forEach((h0, i) => { const k = String(h0).toLowerCase().replace(/\s+/g, ' ').trim(); if (!(k in col)) col[k] = i; });
  const need = ['coffee', 'bag price', 'bag size', 'size unit'].filter(k => !(k in col));
  if (need.length) return { error:"This doesn't look like a coffee prices file from this app (missing: " + need.join(', ') + '). Nothing was changed.' };
  const get = (r, k) => (k in col && r[col[k]] != null) ? r[col[k]] : '';
  const list = []; let skipped = 0;
  p.rows.forEach(r => {
    const e = priceEntry({
      kind:String(get(r, 'kind')).trim().toLowerCase(), coffee:unneutralize(get(r, 'coffee')), roaster:unneutralize(get(r, 'roaster')),
      sym:unneutralize(get(r, 'currency')), price:get(r, 'bag price'), size:get(r, 'bag size'), unit:get(r, 'size unit'),
      dose:get(r, 'dose (g)'), cups:get(r, 'cups per day'), date:get(r, 'date'), roast:get(r, 'roast date'), finished:get(r, 'finished'),
      city:unneutralize(get(r, 'city')), state:unneutralize(get(r, 'state')), rlevel:get(r, 'roast level'),
      rem_g:get(r, 'rem_g') !== '' ? get(r, 'rem_g') : get(r, 'remaining (g)'),
      tubes_json:get(r, 'tubes_json'),
      coffee_id:unneutralize(get(r, 'coffee_id')),
      is_frozen:get(r, 'is_frozen'),
      frozen_date:get(r, 'frozen_date')
    });
    if (e && list.length < PRICE_MAX_ROWS) list.push(e); else skipped++;
  });
  return { list, skipped };
}
function pricePerGram(e){ const g = e ? costGrams(e.size, e.unit) : 0; return g > 0 && e.price > 0 ? e.price / g : null; }
function pricePer100g(e){ const x = pricePerGram(e); return x == null ? null : x * 100; }
function priceUnitCost(e){
  if (!e) return null;
  if (e.kind === 'pods') return e.size > 0 && e.price > 0 ? { per:'pod', value:e.price / e.size } : null;
  const x = pricePer100g(e); return x == null ? null : { per:'100 g', value:x };
}
function priceCsv(list){
  const items = Array.isArray(list) ? list : [];
  const hasRem = items.some(e => e && e.rem_g != null);
  const hasTubes = items.some(e => e && e.tubes_json);
  const hdr = PRICE_COLUMNS.slice();
  if (hasRem) hdr.push('rem_g');
  if (hasTubes) hdr.push('tubes_json');
  const lines = [hdr];
  items.forEach(e => {
    const c = e.dose && e.kind !== 'pods' ? costOne({ price:e.price, size:e.size, unit:e.unit, dose:e.dose, cups:e.cups }) : { ok:false };
    const n = (x, dp) => x == null ? '' : String(Math.round(x * Math.pow(10, dp)) / Math.pow(10, dp));
    const row = [neutralize(e.coffee), neutralize(e.roaster), neutralize(e.sym), n(e.price, 2), n(e.size, 2), e.unit, c.ok ? n(e.dose, 1) : '', c.ok ? n(c.perCup, 2) : '', c.ok && c.perDay != null ? n(e.cups, 1) : '', c.ok && c.perMonth != null ? n(c.perMonth, 2) : '', e.date || '', e.kind || 'bag', e.roast || '', e.finished || '', neutralize(e.city || ''), neutralize(e.state || ''), e.rlevel || ''];
    if (hasRem) row.push(e.rem_g != null ? n(e.rem_g, 1) : '');
    if (hasTubes) row.push(e.tubes_json || '');
    lines.push(row);
  });
  return toCSV(lines);
}
function priceSort(list, mode){
  const a = (list || []).map((e, i) => Object.assign({ i }, e));
  const nm = e => (e.coffee + ' ' + e.roaster).toLowerCase();
  if (mode === 'name') a.sort((x, y) => nm(x).localeCompare(nm(y)) || (y.date || '').localeCompare(x.date || '') || y.i - x.i);
  else if (mode === 'cheap') a.sort((x, y) => x.sym.localeCompare(y.sym) || (x.kind === 'pods') - (y.kind === 'pods') || ((priceUnitCost(x) || { value:1e9 }).value - (priceUnitCost(y) || { value:1e9 }).value) || y.i - x.i);
  else a.sort((x, y) => (y.date || '').localeCompare(x.date || '') || y.i - x.i);
  return a;
}
function priceFilter(list, q){
  q = String(q || '').trim().toLowerCase(); if (!q) return list;
  return (list || []).filter(e => (e.coffee + ' ' + e.roaster).toLowerCase().includes(q));
}
function priceHistoryOf(list, e){
  const k = [e.coffee, e.roaster].map(s => String(s).toLowerCase()).join('|');
  return (list || []).map((x, i) => Object.assign({ i }, x)).filter(x => [x.coffee, x.roaster].map(s => String(s).toLowerCase()).join('|') === k)
    .sort((x, y) => (x.date || '').localeCompare(y.date || '') || x.i - y.i);
}
function priceChange(list, e){
  const h0 = priceHistoryOf(list, e).filter(x => x.sym === e.sym && x.kind === e.kind);
  if (h0.length < 2) return { ok:false };
  const now = h0[h0.length - 1], before = h0[h0.length - 2], u0 = priceUnitCost(before), u1 = priceUnitCost(now), a = u0 && u0.value, b = u1 && u1.value;
  if (!(a > 0) || !(b > 0)) return { ok:false };
  const pct = Math.round((b - a) / a * 1000) / 10;
  return { ok:true, now, before, pct, dir:Math.abs(pct) < 1 ? 'same' : (pct > 0 ? 'up' : 'down') };
}
function priceDaysSince(from, to){
  const f = priceDate(from, false), t = priceDate(to, false); if (!f || !t) return null;
  const a = Date.UTC(+f.slice(0, 4), +f.slice(5, 7) - 1, +f.slice(8, 10)), b = Date.UTC(+t.slice(0, 4), +t.slice(5, 7) - 1, +t.slice(8, 10));
  const d = Math.round((b - a) / 86400000); return d >= 0 ? d : null;
}
function priceOpenBags(list, todayIso){
  const a = (list || []).map((e, i) => Object.assign({ i, days:priceDaysSince(e.roast, todayIso) }, e)).filter(e => !e.finished);
  a.sort((x, y) => (x.days == null) - (y.days == null) || (y.days || 0) - (x.days || 0) || (y.date || '').localeCompare(x.date || '') || y.i - x.i);
  return a;
}

/* ---------- Coffee Shops Codec (23 SHOP_KINDS incl. legacy 'icedlatte') ---------- */
const STEP_SHOP = { shop:'Shop', drink:'Drink', taste:'Taste', perfect:'Perfect' };
const SHOP_STEPS = [['shop', STEP_SHOP.shop], ['sdrink', STEP_SHOP.drink], ['staste', STEP_SHOP.taste], ['sperfect', STEP_SHOP.perfect]];
const SHOP_KINDS = [
  { v:'pour', label:'Pour over', hot:true }, { v:'espresso', label:'Espresso', hot:true }, { v:'americano', label:'Americano', hot:true }, { v:'latte', label:'Latte', hot:true },
  { v:'cappuccino', label:'Cappuccino', hot:true }, { v:'cold', label:'Cold brew', hot:false }, { v:'icedlatte', label:'Iced latte', hot:false, old:true }, { v:'special', label:'Seasonal special', hot:true }, { v:'other', label:'Something else', hot:true },
  { v:'macchiato', label:'Macchiato', hot:true }, { v:'cortado', label:'Cortado', hot:true }, { v:'flatwhite', label:'Flat white', hot:true }, { v:'caramelmac', label:'Caramel macchiato', hot:true }, { v:'mocha', label:'Mocha', hot:true },
  { v:'brewed', label:'Brewed coffee', hot:true }, { v:'icedcoffee', label:'Iced coffee', hot:false }, { v:'nitro', label:'Nitro cold brew', hot:false },
  { v:'frappe', label:'Frappe or blended', hot:false }, { v:'affogato', label:'Affogato', hot:true },
  { v:'chai', label:'Chai latte', hot:true }, { v:'matcha', label:'Matcha latte', hot:true }, { v:'hotchoc', label:'Hot chocolate', hot:true }, { v:'tea', label:'Tea', hot:true }
];
const SHOP_KIND_GROUPS = [
  ['Espresso drinks', ['espresso', 'americano', 'macchiato', 'cortado', 'flatwhite', 'cappuccino', 'latte', 'caramelmac', 'mocha']],
  ['Brewed and cold', ['brewed', 'pour', 'icedcoffee', 'cold', 'nitro']],
  ['Sweet and blended', ['frappe', 'affogato']],
  ['Not coffee', ['chai', 'matcha', 'hotchoc', 'tea']],
  ['Something else', ['special', 'other']]
];
const SHOP_MILKS = [{ v:'none', label:'No milk', say:'no milk' }, { v:'whole', label:'Whole', say:'whole milk' }, { v:'twopct', label:'2 percent', say:'2 percent milk' }, { v:'skim', label:'Skim', say:'skim milk' },
  { v:'oat', label:'Oat', say:'oat milk' }, { v:'almond', label:'Almond', say:'almond milk' }, { v:'soy', label:'Soy', say:'soy milk' }, { v:'coconut', label:'Coconut', say:'coconut milk' }, { v:'half', label:'Half and half', say:'half and half' }];
const SHOP_MAX_SHOTS = 8;
const SHOP_FLAVORS = [{ v:'none', label:'None' }, { v:'vanilla', label:'Vanilla' }, { v:'caramel', label:'Caramel' }, { v:'hazelnut', label:'Hazelnut' }, { v:'pumpkin', label:'Pumpkin spice' }, { v:'mocha', label:'Mocha' }, { v:'other', label:'Other' }];
const SHOP_ORDERS = [{ v:'shop', label:'In the shop' }, { v:'drive', label:'Drive-through' }, { v:'mobile', label:'Mobile order' }, { v:'delivery', label:'Delivery' }];
const SHOP_STRENGTHS = [{ v:'weak', label:'Too weak' }, { v:'right', label:'Just right' }, { v:'strong', label:'Too strong' }];
const SHOP_SWEETS = [{ v:'less', label:'Not sweet enough' }, { v:'right', label:'Just right' }, { v:'more', label:'Too sweet' }];
const SHOP_SIZES = [{ v:'small', label:'Small' }, { v:'medium', label:'Medium' }, { v:'large', label:'Large' }];
const SHOP_FACES = [{ v:'good', label:'Good' }, { v:'okay', label:'Okay' }, { v:'notgood', label:'Not good' }];
const SHOP_AGAINS = [{ v:'yes', label:'Yes, again' }, { v:'maybe', label:'Maybe' }, { v:'no', label:'Never again' }];
const SHOP_WORTHS = [{ v:'worth', label:'Worth it' }, { v:'fair', label:'Fair' }, { v:'over', label:'Overpriced' }];
const US_STATES = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
const SHOP_COUNTRIES = ['United States', 'Canada', 'Mexico', 'United Kingdom', 'Ireland', 'France', 'Germany', 'Italy', 'Spain', 'Portugal', 'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Poland', 'Czechia', 'Greece', 'Turkey', 'Ethiopia', 'Kenya', 'Rwanda', 'Brazil', 'Colombia', 'Costa Rica', 'Guatemala', 'Panama', 'Peru', 'Argentina', 'Chile', 'Japan', 'South Korea', 'China', 'Taiwan', 'Thailand', 'Vietnam', 'Indonesia', 'Philippines', 'India', 'Australia', 'New Zealand', 'United Arab Emirates', 'South Africa', 'Israel'];
const SHOP_COLUMNS = ['row', 'date', 'shop', 'city', 'region', 'country', 'drink', 'menu name', 'hot or iced', 'size', 'amount', 'unit', 'currency', 'price', 'overall', 'beans', 'order again', 'worth the price', 'favorite', 'notes', 'milk', 'extra shots', 'flavor', 'how ordered', 'strength', 'sweetness'];
const SHOP_MAX_DRINKS = 5000, SHOP_MAX_TEXT = 2000000;
const shopPick = (list, v) => { v = String(v == null ? '' : v).trim().toLowerCase(); const f = list.find(x => x.v === v); return f ? f.v : ''; };
const shopTxt = (v, n) => priceText(v, n);
const shopShots = v => { const n = Math.round(parseFloat(String(v == null ? '' : v).replace(',', '.'))); return isFinite(n) && n >= 1 && n <= SHOP_MAX_SHOTS ? n : null; };
function shopPlace(o){
  o = o || {}; let country = shopTxt(o.country, 40), region = shopTxt(o.region, 40);
  const st = US_STATES.find(s => s.toLowerCase() === region.toLowerCase()); if (st) region = st;
  const known = SHOP_COUNTRIES.find(c => c.toLowerCase() === country.toLowerCase()); if (known) country = known;
  if (!country && st) country = 'United States';
  return { country, region, city:shopTxt(o.city, 60) };
}
function shopStore(){ return { home:{ country:'', region:'', city:'' }, shops:[], drinks:[] }; }
function csKey(s){ return [s.name, s.city, s.region, s.country].map(x => String(x == null ? '' : x).toLowerCase()).join('|'); }
function shopPlaceText(p){ p = p || {}; const abbr = p.country === 'United States' || (!p.country && US_STATES.includes(p.region)) ? (p.region || '') : [p.region, p.country].filter(Boolean).join(', '); return [p.city, abbr].filter(Boolean).join(', '); }
function shopEntry(o){
  o = o || {}; const name = shopTxt(o.name != null ? o.name : o.shop, 80); if (!name) return null;
  return Object.assign({ name }, shopPlace(o));
}
function drinkEntry(o){
  o = o || {}; const sh = shopEntry({ name:o.shop, country:o.country, region:o.region, city:o.city }), kind = shopPick(SHOP_KINDS, o.kind);
  if (!sh || !kind) return null;
  const price = priceNum(o.price, 2), amount = priceNum(o.amount, 1), unit = shopPick([{ v:'oz' }, { v:'ml' }], o.unit), beans = priceNum(o.beans, 1);
  const temp = shopPick([{ v:'hot' }, { v:'iced' }], o.temp);
  return { date:/^\d{4}-\d{2}-\d{2}$/.test(String(o.date || '').trim()) ? String(o.date).trim() : '', shop:sh.name, city:sh.city, region:sh.region, country:sh.country, kind, name:shopTxt(o.name, 80), temp,
    size:shopPick(SHOP_SIZES, o.size), amount:amount > 0 && amount <= 3000 && unit ? amount : null, unit:amount > 0 && amount <= 3000 ? unit : '', sym:shopTxt(o.sym, 3) || '$', price:price > 0 && price <= 1000 ? price : null,
    face:shopPick(SHOP_FACES, o.face), beans:beans != null && beans >= 0.5 && beans <= 5 ? Math.round(beans * 2) / 2 : null, again:shopPick(SHOP_AGAINS, o.again), worth:shopPick(SHOP_WORTHS, o.worth), fav:o.fav === true || String(o.fav).toLowerCase() === 'yes', notes:shopTxt(o.notes, 400),
    milk:shopPick(SHOP_MILKS, o.milk), shots:shopShots(o.shots), flavor:shopPick(SHOP_FLAVORS, o.flavor), how:shopPick(SHOP_ORDERS, o.how), strength:shopPick(SHOP_STRENGTHS, o.strength), sweet:shopPick(SHOP_SWEETS, o.sweet) };
}
function drinkKey(d){ return [d.date, d.shop, d.city, d.region, d.country, d.kind, d.name, d.size, d.price].map(x => String(x == null ? '' : x).toLowerCase()).join('|'); }
function shopAddDrink(store, o){
  const st = store || shopStore(), d = drinkEntry(o);
  if (!d) return { store:st, added:false, why:'unusable' };
  if (st.drinks.length >= SHOP_MAX_DRINKS) return { store:st, added:false, why:'full' };
  const k = drinkKey(d); if (st.drinks.some(x => drinkKey(x) === k)) return { store:st, added:false, why:'same' };
  return { store:Object.assign({}, st, { drinks:st.drinks.concat([d]) }), added:true, why:'' };
}
function shopAddShop(store, o){
  const st = store || shopStore(), s = shopEntry(o);
  if (!s) return { store:st, added:false, why:'unusable' };
  if (shopList(st).some(x => csKey(x) === csKey(s))) return { store:st, added:false, why:'same' };
  return { store:Object.assign({}, st, { shops:st.shops.concat([s]) }), added:true, why:'' };
}
function shopSetHome(store, o){ const st = store || shopStore(); return Object.assign({}, st, { home:shopPlace(o) }); }
function shopSetFavorite(store, key, on){ const st = store || shopStore(); return Object.assign({}, st, { drinks:st.drinks.map(d => drinkKey(d) === key ? Object.assign({}, d, { fav:!!on }) : d) }); }
function shopRemoveDrink(store, key){ const st = store || shopStore(); return Object.assign({}, st, { drinks:st.drinks.filter(d => drinkKey(d) !== key) }); }
function shopList(store){
  const st = store || shopStore(), map = new Map();
  const put = s => { const k = csKey(s); if (!map.has(k)) map.set(k, { name:s.name, city:s.city, region:s.region, country:s.country, visits:0, beanSum:0, beanN:0, last:'', again:0, i:map.size }); return map.get(k); };
  st.shops.forEach(put);
  st.drinks.forEach(d => { const s = put({ name:d.shop, city:d.city, region:d.region, country:d.country }); s.visits++; if (d.beans != null){ s.beanSum += d.beans; s.beanN++; } if (d.date > s.last) s.last = d.date; if (d.again === 'yes') s.again++; });
  return Array.from(map.values()).map(s => ({ name:s.name, city:s.city, region:s.region, country:s.country, visits:s.visits, avgBeans:s.beanN ? Math.round(s.beanSum / s.beanN * 10) / 10 : null, last:s.last, again:s.again, i:s.i }))
    .sort((a, b) => b.visits - a.visits || (b.last || '').localeCompare(a.last || '') || a.i - b.i);
}
function shopDrinksSorted(store, mode){
  const a = ((store && store.drinks) || []).map((d, i) => Object.assign({ i, key:drinkKey(d) }, d));
  if (mode === 'fav') return a.filter(d => d.fav).sort((x, y) => (y.date || '').localeCompare(x.date || '') || y.i - x.i);
  return a.sort((x, y) => (y.date || '').localeCompare(x.date || '') || y.i - x.i);
}
function shopFilter(list, q){
  q = String(q || '').trim().toLowerCase(); if (!q) return list;
  const toks = q.split(/\s+/).filter(Boolean);
  return (list || []).filter(d => {
    const hay = [d.name, d.shop, d.city, d.region, d.notes, (SHOP_KINDS.find(k => k.v === d.kind) || {}).label, (SHOP_MILKS.find(m => m.v === d.milk) || {}).label].join(' ').toLowerCase();
    return toks.every(t => hay.includes(t));
  });
}
function shopStats(store){
  const st = store || shopStore(), ds = st.drinks || [], shops = shopList(st);
  const favCount = ds.filter(d => d.fav).length;
  const priced = ds.filter(d => d.price != null && d.price > 0);
  const bySym = {};
  priced.forEach(d => { const sym = d.sym || '$'; bySym[sym] = (bySym[sym] || 0) + d.price; });
  const mainSym = Object.keys(bySym).sort((a, b) => bySym[b] - bySym[a])[0] || '$';
  const sameSym = priced.filter(d => (d.sym || '$') === mainSym);
  const totalSpend = sameSym.reduce((a, d) => a + d.price, 0);
  const avgPrice = sameSym.length ? Math.round((totalSpend / sameSym.length) * 100) / 100 : null;
  const answeredAgain = ds.filter(d => d.again === 'yes' || d.again === 'maybe' || d.again === 'no');
  const againRate = answeredAgain.length ? Math.round((ds.filter(d => d.again === 'yes').length / answeredAgain.length) * 100) : null;
  const rated = ds.filter(d => d.beans != null && d.beans > 0);
  const avgBeans = rated.length ? Math.round((rated.reduce((a, d) => a + d.beans, 0) / rated.length) * 10) / 10 : null;
  return { drinks:ds.length, shops:shops.length, favs:favCount, sym:mainSym, totalSpend, avgPrice, againRate, avgBeans, topShop:shops[0] ? shops[0].name : '' };
}
function shopCsv(store){
  const st = store || shopStore(), lines = [SHOP_COLUMNS], blank = n => new Array(n).fill('');
  const place = p => [neutralize(p.city), neutralize(p.region), neutralize(p.country)];
  const has = new Set(st.drinks.map(d => csKey({ name:d.shop, city:d.city, region:d.region, country:d.country })));
  if (st.home.city || st.home.region || st.home.country) lines.push(['home', '', ''].concat(place(st.home), blank(SHOP_COLUMNS.length - 6)));
  st.shops.forEach(s => { if (!has.has(csKey(s))) lines.push(['shop', '', neutralize(s.name)].concat(place(s), blank(SHOP_COLUMNS.length - 6))); });
  st.drinks.forEach(d => lines.push(['drink', d.date, neutralize(d.shop)].concat(place(d), [d.kind, neutralize(d.name), d.temp, d.size, d.amount == null ? '' : String(d.amount), d.unit, neutralize(d.sym), d.price == null ? '' : String(d.price), d.face, d.beans == null ? '' : String(d.beans), d.again, d.worth, d.fav ? 'yes' : '', neutralize(d.notes), d.milk || '', d.shots == null ? '' : String(d.shots), d.flavor || '', d.how || '', d.strength || '', d.sweet || ''])));
  return toCSV(lines);
}
function shopRead(text){
  text = String(text == null ? '' : text);
  if (text.length > SHOP_MAX_TEXT) return { error:'That file is too big to be a coffee shops file. Nothing was changed.' };
  const p = parseCSV(text); if (p.error) return { error:p.error };
  const col = {}; p.header.forEach((h0, i) => { const k = String(h0).toLowerCase().replace(/\s+/g, ' ').trim(); if (!(k in col)) col[k] = i; });
  const need = ['row', 'shop', 'drink'].filter(k => !(k in col));
  if (need.length) return { error:"This doesn't look like a coffee shops file from this app (missing: " + need.join(', ') + '). Nothing was changed.' };
  const get = (r, k) => (k in col && r[col[k]] != null) ? r[col[k]] : '', un = (r, k) => unneutralize(get(r, k));
  let st = shopStore(), skipped = 0, repeats = 0;
  p.rows.forEach(r => {
    const kind = String(get(r, 'row')).trim().toLowerCase(), pl = { city:un(r, 'city'), region:un(r, 'region'), country:un(r, 'country') };
    if (kind === 'home') st = shopSetHome(st, pl);
    else if (kind === 'shop'){ const a = shopAddShop(st, Object.assign({ name:un(r, 'shop') }, pl)); if (a.added) st = a.store; else if (a.why === 'same') repeats++; else skipped++; }
    else if (kind === 'drink'){
      const a = shopAddDrink(st, Object.assign({ date:get(r, 'date'), shop:un(r, 'shop'), kind:get(r, 'drink'), name:un(r, 'menu name'), temp:get(r, 'hot or iced'), size:get(r, 'size'), amount:get(r, 'amount'), unit:get(r, 'unit'), sym:un(r, 'currency'), price:get(r, 'price'), face:get(r, 'overall'), beans:get(r, 'beans'), again:get(r, 'order again'), worth:get(r, 'worth the price'), fav:get(r, 'favorite'), notes:un(r, 'notes'), milk:get(r, 'milk'), shots:get(r, 'extra shots'), flavor:get(r, 'flavor'), how:get(r, 'how ordered'), strength:get(r, 'strength'), sweet:get(r, 'sweetness') }, pl));
      if (a.added) st = a.store; else if (a.why === 'same') repeats++; else skipped++;
    } else skipped++;
  });
  return { store:st, skipped, repeats };
}
function shopVsHome(d, homeStars, bags){
  const st = (homeStars || []).filter(x => x > 0), sym = (d && d.sym) || '$';
  const cups = (bags || []).filter(b => b && b.dose && (b.sym || '$') === sym).map(b => costOne({ price:b.price, size:b.size, unit:b.unit, dose:b.dose })).filter(c => c.ok).map(c => c.perCup);
  const homeBeans = st.length ? Math.round(st.reduce((a, b) => a + b, 0) / st.length * 10) / 10 : null, homeCup = cups.length ? cups.reduce((a, b) => a + b, 0) / cups.length : null, shopCup = d && d.price > 0 ? d.price : null;
  return { homeBeans, homeN:st.length, homeCup, shopCup, times:homeCup && shopCup ? Math.max(1, Math.round(shopCup / homeCup)) : null };
}

/* ---------- Coffee Spending Analytics ---------- */
const SPEND_RANGES = [{ v:'month', label:'This month' }, { v:'last', label:'Last month' }, { v:'three', label:'Last 3 months' }, { v:'year', label:'This year' }];
const SPEND_MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function spendRange(v, todayIso){
  const t = priceDate(todayIso, false); if (!t) return null;
  const y = +t.slice(0, 4), m = +t.slice(5, 7);
  const ym = (yy, mm) => { while (mm < 1){ mm += 12; yy--; } while (mm > 12){ mm -= 12; yy++; } return yy + '-' + String(mm).padStart(2, '0'); };
  const nm = s => SPEND_MONTH_NAMES[+s.slice(5, 7) - 1];
  if (v === 'month'){ const a = ym(y, m); return { v, from:a, to:a, label:'This month (' + nm(a) + ')' }; }
  if (v === 'last'){ const a = ym(y, m - 1); return { v, from:a, to:a, label:'Last month (' + nm(a) + ')' }; }
  if (v === 'three'){ const a = ym(y, m - 2), b = ym(y, m); return { v, from:a, to:b, label:'Last 3 months (' + nm(a) + ' to ' + nm(b) + ')' }; }
  const yr = v === 'year' ? y : /^\d{4}$/.test(String(v)) ? +v : 0;
  if (!yr) return null;
  return { v:String(v), from:yr + '-01', to:yr + '-12', year:yr, label:(yr === y ? 'This year (' + yr + ')' : String(yr)) };
}
function spendSym(prices, drinks){
  const n = {}; (prices || []).forEach(e => { n[e.sym] = (n[e.sym] || 0) + 1; }); (drinks || []).forEach(d => { if (d.price > 0) n[d.sym] = (n[d.sym] || 0) + 1; });
  let best = '$', c = 0; Object.keys(n).forEach(k => { if (n[k] > c){ best = k; c = n[k]; } }); return best;
}
function _spendMode(a){ const n = new Map(); a.forEach(v => { if (v) n.set(v, (n.get(v) || 0) + 1); }); let best = '', c = 0; n.forEach((k, v) => { if (k > c){ best = v; c = k; } }); return best; }
function _spendIn(ym, r){ return !!ym && !!r && ym >= r.from && ym <= r.to; }
function _spendRound(x){ return Math.round(x * 100) / 100; }
function spendHome(list, range, sym){
  const all = Array.isArray(list) ? list : [], g = new Map(); let total = 0, bags = 0, boxes = 0, other = 0;
  all.forEach((e, i) => {
    if (!_spendIn(priceMonth(e), range)) return;
    if (e.sym !== sym){ other++; return; }
    total += e.price; if (e.kind === 'pods') boxes++; else bags++;
    const k = [e.coffee, e.roaster, e.kind].map(s => String(s).toLowerCase()).join('|');
    if (!g.has(k)) g.set(k, { coffee:e.coffee, roaster:e.roaster, kind:e.kind, n:0, total:0, amount:0, purchases:[] });
    const r = g.get(k); r.n++; r.total += e.price; r.amount += e.kind === 'pods' ? e.size : costGrams(e.size, e.unit); r.purchases.push(Object.assign({ i }, e));
  });
  const rows = Array.from(g.values()).map(r => {
    r.purchases.sort((x, y) => (y.date || '').localeCompare(x.date || '') || y.i - x.i);
    return Object.assign(r, { total:_spendRound(r.total), per:r.kind === 'pods' ? 'pod' : '100 g', unit:r.amount > 0 ? (r.kind === 'pods' ? r.total / r.amount : r.total / r.amount * 100) : null });
  }).sort((a, b) => b.total - a.total || a.coffee.localeCompare(b.coffee));
  return { total:_spendRound(total), bags, boxes, rows, undated:all.filter(e => !priceMonth(e)).length, otherSym:other };
}
function spendShop(drinks, range, sym){
  const all = Array.isArray(drinks) ? drinks : [], inR = [];
  let other = 0;
  all.forEach(d => { if (!_spendIn((d.date || '').slice(0, 7), range)) return; if (d.price > 0 && d.sym !== sym){ other++; return; } inR.push(d); });
  const priced = inR.filter(d => d.price > 0), total = priced.reduce((a, d) => a + d.price, 0);
  const label = k => (SHOP_KINDS.find(x => x.v === k) || { label:'Something else' }).label;
  const grp = (keyOf, make) => { const m = new Map(); inR.forEach(d => { const k = keyOf(d); if (!m.has(k)) m.set(k, []); m.get(k).push(d); }); return Array.from(m.values()).map(make); };
  const sum = a => { const p = a.filter(d => d.price > 0), t = p.reduce((s, d) => s + d.price, 0); return { n:a.length, pricedN:p.length, total:_spendRound(t), avg:p.length ? t / p.length : null, last:a.reduce((m, d) => d.date > m ? d.date : m, ''), items:a.slice().sort((x, y) => (y.date || '').localeCompare(x.date || '')) }; };
  const byDrink = grp(d => d.kind, a => Object.assign({ kind:a[0].kind, label:label(a[0].kind) }, sum(a),
    { min:a.some(d => d.price > 0) ? Math.min.apply(null, a.filter(d => d.price > 0).map(d => d.price)) : null, max:a.some(d => d.price > 0) ? Math.max.apply(null, a.filter(d => d.price > 0).map(d => d.price)) : null,
      size:_spendMode(a.map(d => d.size)), shop:_spendMode(a.map(d => d.shop)) })).sort((x, y) => y.n - x.n || y.total - x.total || x.label.localeCompare(y.label));
  const byShop = grp(d => csKey({ name:d.shop, city:d.city, region:d.region, country:d.country }), a => Object.assign({ shop:a[0].shop, city:a[0].city, region:a[0].region, country:a[0].country, label:label(_spendMode(a.map(d => d.kind))) }, sum(a)))
    .sort((x, y) => y.n - x.n || y.total - x.total || x.shop.localeCompare(y.shop));
  return { total:_spendRound(total), count:inR.length, pricedN:priced.length, avg:priced.length ? total / priced.length : null, byDrink, byShop, undated:all.filter(d => !d.date).length, otherSym:other };
}
function spendMonthly(list, drinks, year, sym){
  const out = [];
  for (let i = 1; i <= 12; i++){
    const m = year + '-' + String(i).padStart(2, '0'), r = { v:m, from:m, to:m }, h = spendHome(list, r, sym), s = spendShop(drinks, r, sym);
    out.push({ m, home:h.total, shop:s.total, drinks:s.count, purchases:h.bags + h.boxes });
  }
  return out;
}
function spendYear(list, drinks, year, sym){
  const range = spendRange(String(year), year + '-06-15'), home = spendHome(list, range, sym), shop = spendShop(drinks, range, sym);
  const seen = new Map(), put = (region, country) => {
    const p = shopPlace({ region, country }), k = p.region.toLowerCase(); if (!p.region || seen.has(k)) return; seen.set(k, p.region);
  };
  home.rows.forEach(r => r.purchases.forEach(e => put(e.state, ''))); shop.byShop.forEach(s => put(s.region, s.country));
  const places = Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
  return { year:+year, months:spendMonthly(list, drinks, year, sym), home, shop, total:_spendRound(home.total + shop.total), topCoffee:home.rows[0] || null, topDrink:shop.byDrink[0] || null, topShop:shop.byShop[0] || null, places, placeCount:places.length };
}
function spendYears(list, drinks){
  const s = new Set(); (list || []).forEach(e => { if (priceMonth(e)) s.add(+priceMonth(e).slice(0, 4)); }); (drinks || []).forEach(d => { if (d.date) s.add(+d.date.slice(0, 4)); });
  return Array.from(s).sort((a, b) => b - a);
}
function spendSwap(shopAvg, homeCup, perWeek){
  if (!(shopAvg > 0 && homeCup > 0 && perWeek > 0)) return null;
  const keepWeek = perWeek * (shopAvg - homeCup);
  return { keepWeek, keepMonth:keepWeek * _BT_DAYS_PER_MONTH / 7, keepYear:keepWeek * 365.25 / 7 };
}

/* ---------- Pure-JS Offline ISO/IEC 18004 Reed-Solomon QR SVG Generator (Versions 1-12, EC L/M) ---------- */
const _QR_ALIGN_POS = [
  [],
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
  [6, 30, 54],
  [6, 32, 58]
];
/* ISO/IEC 18004 Table 9: [ecCodewordsPerBlock, g1Blocks, g1DataCw, g2Blocks, g2DataCw] for V1..V12 */
const _QR_EC_TABLE = {
  L: [
    null,
    [7, 1, 19, 0, 0],
    [10, 1, 34, 0, 0],
    [15, 1, 55, 0, 0],
    [20, 1, 80, 0, 0],
    [26, 1, 108, 0, 0],
    [18, 2, 68, 0, 0],
    [20, 2, 78, 0, 0],
    [24, 2, 97, 0, 0],
    [30, 2, 116, 0, 0],
    [18, 2, 68, 2, 69],
    [20, 4, 81, 0, 0],
    [24, 2, 92, 2, 93]
  ],
  M: [
    null,
    [10, 1, 16, 0, 0],
    [16, 1, 28, 0, 0],
    [26, 1, 44, 0, 0],
    [18, 2, 32, 0, 0],
    [24, 2, 43, 0, 0],
    [16, 4, 27, 0, 0],
    [18, 4, 31, 0, 0],
    [22, 2, 38, 2, 39],
    [22, 3, 36, 2, 37],
    [26, 4, 43, 1, 44],
    [30, 1, 50, 4, 51],
    [22, 6, 36, 2, 37]
  ]
};
const _QR_GF_EXP = new Uint8Array(512);
const _QR_GF_LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++){
    _QR_GF_EXP[i] = x;
    _QR_GF_EXP[i + 255] = x;
    _QR_GF_LOG[x] = i;
    x = (x << 1) ^ ((x & 0x80) ? 0x11d : 0);
  }
})();
function _qrGfMul(a, b){
  return (a === 0 || b === 0) ? 0 : _QR_GF_EXP[_QR_GF_LOG[a] + _QR_GF_LOG[b]];
}
function _qrRsGenerator(degree){
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i++){
    const next = new Uint8Array(poly.length + 1);
    const root = _QR_GF_EXP[i];
    for (let j = 0; j < poly.length; j++){
      next[j] ^= poly[j];
      next[j + 1] ^= _qrGfMul(poly[j], root);
    }
    poly = next;
  }
  return poly;
}
function _qrRsEncode(data, ecLen){
  const gen = _qrRsGenerator(ecLen);
  const rem = new Uint8Array(ecLen);
  for (let i = 0; i < data.length; i++){
    const factor = data[i] ^ rem[0];
    for (let j = 0; j < ecLen - 1; j++) rem[j] = rem[j + 1];
    rem[ecLen - 1] = 0;
    if (factor !== 0){
      for (let j = 0; j < ecLen; j++) rem[j] ^= _qrGfMul(gen[j + 1], factor);
    }
  }
  return rem;
}
function _qrPenaltyScore(modules, n){
  let score = 0;
  /* Rule 1: 5+ consecutive same-color modules in rows and cols */
  for (let r = 0; r < n; r++){
    let runColor = modules[r * n], runLen = 1;
    for (let c = 1; c < n; c++){
      const v = modules[r * n + c];
      if (v === runColor){ runLen++; } else { if (runLen >= 5) score += 3 + (runLen - 5); runColor = v; runLen = 1; }
    }
    if (runLen >= 5) score += 3 + (runLen - 5);
  }
  for (let c = 0; c < n; c++){
    let runColor = modules[c], runLen = 1;
    for (let r = 1; r < n; r++){
      const v = modules[r * n + c];
      if (v === runColor){ runLen++; } else { if (runLen >= 5) score += 3 + (runLen - 5); runColor = v; runLen = 1; }
    }
    if (runLen >= 5) score += 3 + (runLen - 5);
  }
  /* Rule 2: 2x2 solid blocks */
  for (let r = 0; r < n - 1; r++){
    for (let c = 0; c < n - 1; c++){
      const v = modules[r * n + c];
      if (v === modules[r * n + c + 1] && v === modules[(r + 1) * n + c] && v === modules[(r + 1) * n + c + 1]) score += 3;
    }
  }
  /* Rule 3: Finder-like 1:1:3:1:1 patterns alongside 4 light modules */
  const hasFinderLike = (getAt) => {
    for (let i = 0; i <= n - 11; i++){
      const p1 = getAt(i) && !getAt(i + 1) && getAt(i + 2) && getAt(i + 3) && getAt(i + 4) && !getAt(i + 5) && getAt(i + 6) && !getAt(i + 7) && !getAt(i + 8) && !getAt(i + 9) && !getAt(i + 10);
      const p2 = !getAt(i) && !getAt(i + 1) && !getAt(i + 2) && !getAt(i + 3) && getAt(i + 4) && !getAt(i + 5) && getAt(i + 6) && getAt(i + 7) && getAt(i + 8) && !getAt(i + 9) && getAt(i + 10);
      if (p1 || p2) score += 40;
    }
  };
  for (let r = 0; r < n; r++) hasFinderLike(c => modules[r * n + c] === 1);
  for (let c = 0; c < n; c++) hasFinderLike(r => modules[r * n + c] === 1);
  /* Rule 4: Dark/light balance */
  let dark = 0;
  for (let i = 0; i < modules.length; i++) if (modules[i]) dark++;
  const k = Math.ceil(Math.abs(dark * 20 - modules.length * 10) / modules.length) - 1;
  if (k > 0) score += k * 10;
  return score;
}
function _qrWriteFormatBits(modules, isFunc, n, ecLevel, mask){
  const ecBits = ecLevel === 'L' ? 1 : 0; /* ISO: L=01, M=00 */
  const data = (ecBits << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ (((rem >>> 9) & 1) * 0x537);
  const bits = ((data << 10) | rem) ^ 0x5412;
  const set = (r, c, bit) => { modules[r * n + c] = bit; isFunc[r * n + c] = 1; };
  /* Top-left copy */
  for (let i = 0; i <= 5; i++) set(8, i, (bits >>> i) & 1);
  set(8, 7, (bits >>> 6) & 1);
  set(8, 8, (bits >>> 7) & 1);
  set(7, 8, (bits >>> 8) & 1);
  for (let i = 9; i < 15; i++) set(14 - i, 8, (bits >>> i) & 1);
  /* Split top-right & bottom-left copy */
  for (let i = 0; i < 8; i++) set(8, n - 1 - i, (bits >>> i) & 1);
  for (let i = 8; i < 15; i++) set(n - 15 + i, 8, (bits >>> i) & 1);
  set(n - 8, 8, 1); /* Always-dark module */
}
function encodeQrMatrix(text, opts){
  opts = opts || {};
  const bytes = _btUtf8Encode(String(text == null ? '' : text));
  const reqEc = String(opts.ecLevel || opts.ec || '').toUpperCase();
  const tryLevels = reqEc === 'L' ? ['L'] : reqEc === 'M' ? ['M', 'L'] : ['M', 'L'];
  let chosenV = 0, chosenEc = 'M', spec = null;
  for (let li = 0; li < tryLevels.length && !chosenV; li++){
    const lvl = tryLevels[li], tbl = _QR_EC_TABLE[lvl];
    for (let v = 1; v <= 12; v++){
      const s = tbl[v], dataCapCw = s[1] * s[2] + s[3] * s[4];
      const countBits = v <= 9 ? 8 : 16;
      const neededBits = 4 + countBits + bytes.length * 8;
      if (neededBits <= dataCapCw * 8){ chosenV = v; chosenEc = lvl; spec = s; break; }
    }
  }
  if (!chosenV) throw new Error('QR payload exceeds Version 12 capacity (' + bytes.length + ' bytes).');
  const totalDataCw = spec[1] * spec[2] + spec[3] * spec[4];
  const bitStream = [];
  const pushBits = (val, len) => { for (let i = len - 1; i >= 0; i--) bitStream.push((val >>> i) & 1); };
  pushBits(0x4, 4); /* Byte mode = 0100 */
  pushBits(bytes.length, chosenV <= 9 ? 8 : 16);
  for (let i = 0; i < bytes.length; i++) pushBits(bytes[i], 8);
  const capBits = totalDataCw * 8;
  const term = Math.min(4, capBits - bitStream.length);
  for (let i = 0; i < term; i++) bitStream.push(0);
  while (bitStream.length & 7) bitStream.push(0);
  const dataCw = new Uint8Array(totalDataCw);
  let cwIdx = 0;
  for (let i = 0; i < bitStream.length; i += 8){
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | bitStream[i + j];
    dataCw[cwIdx++] = b;
  }
  for (let padIdx = 0; cwIdx < totalDataCw; padIdx++) dataCw[cwIdx++] = (padIdx & 1) ? 0x11 : 0xEC;

  /* Split into Reed-Solomon blocks & interleave */
  const ecLen = spec[0], g1Blocks = spec[1], g1Len = spec[2], g2Blocks = spec[3], g2Len = spec[4];
  const dataBlocks = [], ecBlocks = [];
  let offset = 0;
  for (let b = 0; b < g1Blocks + g2Blocks; b++){
    const blen = b < g1Blocks ? g1Len : g2Len;
    const slice = dataCw.subarray(offset, offset + blen);
    offset += blen;
    dataBlocks.push(slice);
    ecBlocks.push(_qrRsEncode(slice, ecLen));
  }
  const interleaved = [];
  const maxDataLen = Math.max(g1Len, g2Len);
  for (let i = 0; i < maxDataLen; i++){
    for (let b = 0; b < dataBlocks.length; b++) if (i < dataBlocks[b].length) interleaved.push(dataBlocks[b][i]);
  }
  for (let i = 0; i < ecLen; i++){
    for (let b = 0; b < ecBlocks.length; b++) interleaved.push(ecBlocks[b][i]);
  }

  /* Construct matrix & function patterns */
  const n = 17 + 4 * chosenV;
  const baseMod = new Uint8Array(n * n);
  const isFunc = new Uint8Array(n * n);
  const setFn = (r, c, dark) => {
    if (r < 0 || r >= n || c < 0 || c >= n) return;
    baseMod[r * n + c] = dark ? 1 : 0;
    isFunc[r * n + c] = 1;
  };
  const drawFinder = (r0, c0) => {
    for (let dr = -1; dr <= 7; dr++){
      for (let dc = -1; dc <= 7; dc++){
        const inOuter = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
        const onRing = dr === 0 || dr === 6 || dc === 0 || dc === 6;
        const inCore = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        setFn(r0 + dr, c0 + dc, inOuter && (onRing || inCore));
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(0, n - 7);
  drawFinder(n - 7, 0);
  for (let i = 8; i < n - 8; i++){
    setFn(6, i, (i & 1) === 0);
    setFn(i, 6, (i & 1) === 0);
  }
  const alignCoords = _QR_ALIGN_POS[chosenV];
  for (let ai = 0; ai < alignCoords.length; ai++){
    for (let aj = 0; aj < alignCoords.length; aj++){
      if ((ai === 0 && aj === 0) || (ai === 0 && aj === alignCoords.length - 1) || (ai === alignCoords.length - 1 && aj === 0)) continue;
      const cr = alignCoords[ai], cc = alignCoords[aj];
      for (let dr = -2; dr <= 2; dr++){
        for (let dc = -2; dc <= 2; dc++){
          const dark = Math.max(Math.abs(dr), Math.abs(dc)) !== 1;
          setFn(cr + dr, cc + dc, dark);
        }
      }
    }
  }
  /* Reserve format info modules before zig-zag placement */
  _qrWriteFormatBits(baseMod, isFunc, n, chosenEc, 0);
  /* Version info blocks for Versions 7..12 (Golay 18,6 generator 0x1F25) */
  if (chosenV >= 7){
    let vrem = chosenV;
    for (let i = 0; i < 12; i++) vrem = (vrem << 1) ^ (((vrem >>> 11) & 1) * 0x1F25);
    const vbits = (chosenV << 12) | vrem;
    for (let i = 0; i < 18; i++){
      const bit = (vbits >>> i) & 1;
      const a = n - 11 + (i % 3), b = Math.floor(i / 3);
      setFn(b, a, bit === 1);
      setFn(a, b, bit === 1);
    }
  }

  /* Upward/downward 2-column zig-zag placement */
  let bitIdx = 0;
  const totalBits = interleaved.length * 8;
  for (let right = n - 1; right >= 1; right -= 2){
    if (right === 6) right = 5;
    for (let vert = 0; vert < n; vert++){
      const upward = (((right + 1) & 2) === 0);
      const r = upward ? (n - 1 - vert) : vert;
      for (let j = 0; j < 2; j++){
        const c = right - j;
        if (!isFunc[r * n + c]){
          const dark = bitIdx < totalBits ? ((interleaved[bitIdx >>> 3] >>> (7 - (bitIdx & 7))) & 1) : 0;
          baseMod[r * n + c] = dark;
          bitIdx++;
        }
      }
    }
  }

  /* Evaluate all 8 ISO masks and pick minimum penalty */
  const maskPred = [
    (r, c) => ((r + c) & 1) === 0,
    (r) => (r & 1) === 0,
    (r, c) => c % 3 === 0,
    (r, c) => (r + c) % 3 === 0,
    (r, c) => ((Math.floor(r / 2) + Math.floor(c / 3)) & 1) === 0,
    (r, c) => ((r * c) & 1) + ((r * c) % 3) === 0,
    (r, c) => ((((r * c) & 1) + ((r * c) % 3)) & 1) === 0,
    (r, c) => ((((r + c) & 1) + ((r * c) % 3)) & 1) === 0
  ];
  let bestMask = 0, bestPenalty = 1e9, bestModules = null;
  for (let m = 0; m < 8; m++){
    const cand = baseMod.slice();
    const fn = maskPred[m];
    for (let r = 0; r < n; r++){
      for (let c = 0; c < n; c++){
        if (!isFunc[r * n + c] && fn(r, c)) cand[r * n + c] ^= 1;
      }
    }
    _qrWriteFormatBits(cand, isFunc, n, chosenEc, m);
    const pen = _qrPenaltyScore(cand, n);
    if (pen < bestPenalty){ bestPenalty = pen; bestMask = m; bestModules = cand; }
  }
  return { version:chosenV, size:n, ecLevel:chosenEc, mask:bestMask, byteLength:bytes.length, modules:bestModules };
}

function encodeQrSvg(text, opts){
  opts = opts || {};
  const qr = encodeQrMatrix(text, opts);
  const n = qr.size;
  const margin = opts.margin != null && isFinite(+opts.margin) && +opts.margin >= 0 ? Math.round(+opts.margin) : 4;
  const dim = n + margin * 2;
  const pxSize = opts.size != null && isFinite(+opts.size) && +opts.size >= 48 ? Math.round(+opts.size) : 220;
  const fg = typeof opts.fg === 'string' && opts.fg.trim() ? opts.fg.trim().replace(/["<>]/g, '') : '#1A1412';
  const bg = typeof opts.bg === 'string' && opts.bg.trim() ? opts.bg.trim().replace(/["<>]/g, '') : '#FAF6F0';
  const label = typeof opts.label === 'string' && opts.label.trim() ? opts.label.trim().replace(/[<>"&]/g, '') : 'BeanTelligence Shareable Brew Passport QR Code';
  let pathD = '';
  for (let r = 0; r < n; r++){
    let c = 0;
    while (c < n){
      if (qr.modules[r * n + c]){
        let w = 1;
        while (c + w < n && qr.modules[r * n + c + w]) w++;
        pathD += 'M' + (c + margin) + ' ' + (r + margin) + 'h' + w + 'v1h-' + w + 'z';
        c += w;
      } else {
        c++;
      }
    }
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + dim + ' ' + dim + '" width="' + pxSize + '" height="' + pxSize + '" shape-rendering="crispEdges" role="img" aria-label="' + label + '" data-qr-version="' + qr.version + '" data-qr-ec="' + qr.ecLevel + '">'
    + (bg === 'transparent' || bg === 'none' ? '' : '<rect width="' + dim + '" height="' + dim + '" fill="' + bg + '"/>')
    + '<path fill="' + fg + '" d="' + pathD + '"/>'
    + '</svg>';
}
/*PURE_END*/
