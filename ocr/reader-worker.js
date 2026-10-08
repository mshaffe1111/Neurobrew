/* NeuroBrew bag reader (a web worker). Reads text out of prepared photo images, on this device only.
   Messages in:  { type:'init' }   then   { type:'read', jobs:[{ id, png:ArrayBuffer, modes:['3','11'] }] }
   Messages out: { type:'status', text } | { type:'ready' } | { type:'result', id, mode, text } | { type:'done' } | { type:'error', code, detail } */
'use strict';
const BASE = self.location.href.replace(/[^\/]*$/, '');
let M = null, api = null;
const say = (type, extra) => self.postMessage(Object.assign({ type }, extra || {}));
async function gunzip(buf){
  if (typeof DecompressionStream !== 'function') throw { code:'unsupported', detail:'no DecompressionStream' };
  const ds = new DecompressionStream('gzip'), stream = new Response(buf).body.pipeThrough(ds);
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
async function init(){
  if (typeof WebAssembly !== 'object') throw { code:'unsupported', detail:'no WebAssembly' };
  say('status', { text:'loading' });
  try { importScripts(BASE + 'tesseract-core-simd-lstm.js'); } catch(e){ throw { code:'files', detail:'core script: ' + e }; }
  // The Claude artifact page cannot serve a .gz file, so it carries the same bytes as base64 text; the website serves the .gz.
  const getData = name => fetch(BASE + name).then(r => { if (!r.ok) throw { code:'files', detail:'language data ' + r.status }; return r.arrayBuffer(); });
  const getB64 = () => fetch(BASE + 'eng.traineddata.gz.b64.txt').then(r => { if (!r.ok) throw { code:'files', detail:'language data ' + r.status }; return r.text(); })
    .then(t => { const bin = atob(t.replace(/\s+/g, '')), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u.buffer; });
  const dataReq = getData('eng.traineddata.gz').catch(() => getB64()).catch(e => { throw (e && e.code) ? e : { code:'files', detail:'language data: ' + (e && e.message || e) }; });
  dataReq.catch(() => {});   /* its failure is reported below, where it is awaited */
  try { M = await self.TesseractCore({ locateFile:f => BASE + f, TesseractProgress(){} }); }
  catch(e){ const msg = String(e && e.message || e); throw { code:/fetch|network|load|abort|404/i.test(msg) ? 'files' : 'engine', detail:'core start: ' + msg }; }
  const data = await gunzip(await dataReq);
  M.FS.writeFile('./eng.traineddata', data);
  api = new M.TessBaseAPI();
  if (api.Init(null, 'eng', 1, undefined) !== 0) throw { code:'engine', detail:'language data did not load' };
  say('ready');
}
async function read(jobs){
  for (const job of jobs){
    for (const mode of job.modes){
      M.FS.writeFile('/input', new Uint8Array(job.png));
      api.SetVariable('tessedit_pageseg_mode', String(mode));
      if (api.SetImageFile(1, 0) === 1){ say('result', { id:job.id, mode, text:'' }); continue; }
      api.Recognize(null);
      say('result', { id:job.id, mode, text:api.GetUTF8Text() || '' });
    }
  }
  say('done');
}
self.onmessage = async e => {
  const m = e.data || {};
  try {
    if (m.type === 'init') await init();
    else if (m.type === 'read') await read(m.jobs || []);
  } catch(err){
    say('error', { code:(err && err.code) || 'engine', detail:String((err && err.detail) || (err && err.message) || err).slice(0, 200) });
  }
};
