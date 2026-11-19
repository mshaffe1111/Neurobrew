/* ============================================================================
 * BeanTelligence v6.0 — 15-Family Binary BLE GATT Codecs & MTU Ring-Buffers
 * Pure, Deterministic Binary Decoders, Command Builders & Magic-Byte Promotion
 * Exports: window.BTBleCodecs
 * ============================================================================ */
(function(global){
  'use strict';

  const MAX_RING_BYTES = 256;

  /* ---------- Canonical 128-Bit Normalized GATT UUID Registry ---------- */
  const UUID = {
    /* Scales (11 Families) */
    ACAIA_LEGACY_SVC:     '00001820-0000-1000-8000-00805f9b34fb',
    ACAIA_LEGACY_CHAR:    '00002a80-0000-1000-8000-00805f9b34fb',
    ACAIA_PYXIS_SVC:      '49535343-fe7d-4ae5-8fa9-9fafd205e455',
    ACAIA_PYXIS_NOTIFY:   '49535343-1e4d-4bd9-ba61-23c647249616',
    ACAIA_PYXIS_WRITE:    '49535343-8841-43f4-a8d4-ecbe34729bb3',

    DIFLUID_SCALE_SVC:    '000000ee-0000-1000-8000-00805f9b34fb',
    DIFLUID_SCALE_ALT_SVC:'000000dd-0000-1000-8000-00805f9b34fb',
    DIFLUID_CHAR:         '0000aa01-0000-1000-8000-00805f9b34fb',
    DIFLUID_WRITE_ALT:    '0000aa02-0000-1000-8000-00805f9b34fb',

    BOOKOO_SVC:           '00000ffe-0000-1000-8000-00805f9b34fb',
    BOOKOO_NOTIFY:        '0000ff11-0000-1000-8000-00805f9b34fb',
    BOOKOO_WRITE:         '0000ff12-0000-1000-8000-00805f9b34fb',

    SHARED_FFF0_SVC:      '0000fff0-0000-1000-8000-00805f9b34fb',
    DECENT_SVC:           '0000fff0-0000-1000-8000-00805f9b34fb',
    DECENT_NOTIFY:        '0000fff4-0000-1000-8000-00805f9b34fb',
    DECENT_WRITE:         '000036f5-0000-1000-8000-00805f9b34fb',

    FFF1_NOTIFY:          '0000fff1-0000-1000-8000-00805f9b34fb',
    FFF2_WRITE:           '0000fff2-0000-1000-8000-00805f9b34fb',
    TIMEMORE_OSP_NOTIFY:  '0000fff1-0000-1000-8000-00805f9b34fb',
    TIMEMORE_OSP_WRITE:   '0000fff2-0000-1000-8000-00805f9b34fb',
    TIMEMORE_CUSTOM_SVC:  '553f4e48-bf21-4468-9c6c-0e4fb5b17697',
    TIMEMORE_CUSTOM_WRITE:'553f4e49-bf21-4468-9c6c-0e4fb5b17697',

    NUS_SVC:              '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
    NUS_WRITE:            '6e400002-b5a3-f393-e0a9-e50e24dcca9e',
    NUS_NOTIFY:           '6e400003-b5a3-f393-e0a9-e50e24dcca9e',

    FELICITA_SVC:         '0000ffe0-0000-1000-8000-00805f9b34fb',
    FELICITA_CHAR:        '0000ffe1-0000-1000-8000-00805f9b34fb',

    SKALE_SVC:            '0000ff08-0000-1000-8000-00805f9b34fb',
    SKALE_WRITE:          '0000ef80-0000-1000-8000-00805f9b34fb',
    SKALE_NOTIFY:         '0000ef81-0000-1000-8000-00805f9b34fb',
    SKALE_BTN_NOTIFY:     '0000ef82-0000-1000-8000-00805f9b34fb',

    EUREKA_ALT_SVC:       '0000ffb0-0000-1000-8000-00805f9b34fb',
    EUREKA_ALT_CHAR:      '0000ffb2-0000-1000-8000-00805f9b34fb',

    HIROIA_SVC:           '06c31822-8682-4744-9211-febc93e3bece',
    HIROIA_WRITE:         '06c31823-8682-4744-9211-febc93e3bece',
    HIROIA_NOTIFY:        '06c31824-8682-4744-9211-febc93e3bece',

    WEIGHT_SIG_SVC:       '0000181d-0000-1000-8000-00805f9b34fb',
    WEIGHT_SIG_NOTIFY:    '00002a9d-0000-1000-8000-00805f9b34fb',
    TIMEMORE_SIG_WRITE:   '00002a9e-0000-1000-8000-00805f9b34fb',
    WEIGHT_SIG_CTRL:      '00002a9f-0000-1000-8000-00805f9b34fb',

    /* Espresso Pressure Sensors (ESS 0x181A + Pressensor + Bookoo EM) */
    ESS_SVC:              '0000181a-0000-1000-8000-00805f9b34fb',
    ESS_TEMP_CHAR:        '00002a6e-0000-1000-8000-00805f9b34fb',
    PRESSENSOR_SIG_SVC:   '0000185b-0000-1000-8000-00805f9b34fb',
    PRESSENSOR_SIG_CHAR:  '00002a6d-0000-1000-8000-00805f9b34fb',
    PRESSENSOR_SVC:       '873ae82a-4c5a-4342-b539-9d900bf7ebd0',
    PRESSENSOR_NOTIFY:    '873ae82b-4c5a-4342-b539-9d900bf7ebd0',
    PRESSENSOR_WRITE:     '873ae82c-4c5a-4342-b539-9d900bf7ebd0',

    BOOKOO_EM_SVC:        '00000fff-0000-1000-8000-00805f9b34fb',
    BOOKOO_EM_NOTIFY:     '0000ff01-0000-1000-8000-00805f9b34fb',
    BOOKOO_EM_WRITE:      '0000ff02-0000-1000-8000-00805f9b34fb',

    /* Refractometer & Roast/PSD Analyzer */
    DIFLUID_SVC:          '000000ff-0000-1000-8000-00805f9b34fb',
    DIFLUID_OMNI_SVC:     '000000fc-0000-1000-8000-00805f9b34fb',
    DIFLUID_V3_SVC:       '0e140001-0000-1000-8000-00805f9b34fb',
    DIFLUID_V3_NOTIFY:    '0e140002-0000-1000-8000-00805f9b34fb',
    DIFLUID_V3_WRITE:     '0e140003-0000-1000-8000-00805f9b34fb',

    /* Smart Brewer & Kettle */
    XBLOOM_SVC:           '0000e0ff-3c17-d293-8e48-14fe2e4da212',
    XBLOOM_SHORT_SVC:     '0000ffe0-0000-1000-8000-00805f9b34fb',
    XBLOOM_WRITE:         '0000ffe1-3c17-d293-8e48-14fe2e4da212',
    XBLOOM_NOTIFY:        '0000ffe2-3c17-d293-8e48-14fe2e4da212',
    XBLOOM_AUX:           '0000ffe3-3c17-d293-8e48-14fe2e4da212',
    XBLOOM_SHORT_WRITE:   '0000ffe1-0000-1000-8000-00805f9b34fb',
    XBLOOM_SHORT_NOTIFY:  '0000ffe2-0000-1000-8000-00805f9b34fb',

    STAGG_EKG_SVC:        '00001820-0000-1000-8000-00805f9b34fb',
    STAGG_EKG_CHAR:       '00002a80-0000-1000-8000-00805f9b34fb',
    STAGG_EKG_ALT_CHAR:   '2291c4b5-5d7f-4477-a88b-b266edb97142',

    /* Standard Battery & Device Information */
    BATTERY_SVC:          '0000180f-0000-1000-8000-00805f9b34fb',
    BATTERY_LEVEL:        '00002a19-0000-1000-8000-00805f9b34fb',
    DEVICE_INFO_SVC:      '0000180a-0000-1000-8000-00805f9b34fb'
  };

  /* Complete Superset of All Coffee GATT Services so Web Bluetooth Never Hides Secondary Services */
  const ALL_COFFEE_OPTIONAL_SERVICES = [
    UUID.WEIGHT_SIG_SVC,
    UUID.ACAIA_LEGACY_SVC,
    UUID.ACAIA_PYXIS_SVC,
    UUID.DIFLUID_SCALE_SVC,
    UUID.DIFLUID_SCALE_ALT_SVC,
    UUID.DIFLUID_SVC,
    UUID.DIFLUID_OMNI_SVC,
    UUID.DIFLUID_V3_SVC,
    UUID.BOOKOO_SVC,
    UUID.BOOKOO_EM_SVC,
    UUID.ESS_SVC,
    UUID.PRESSENSOR_SIG_SVC,
    UUID.SHARED_FFF0_SVC,
    UUID.FELICITA_SVC,
    UUID.SKALE_SVC,
    UUID.EUREKA_ALT_SVC,
    UUID.HIROIA_SVC,
    UUID.TIMEMORE_CUSTOM_SVC,
    UUID.PRESSENSOR_SVC,
    UUID.XBLOOM_SVC,
    UUID.NUS_SVC,
    UUID.BATTERY_SVC,
    UUID.DEVICE_INFO_SVC
  ];

  /* ---------- Binary Conversion & Checksum Primitives ---------- */
  function normUuid(u){
    if (typeof u === 'number'){
      return '0000' + (u & 0xFFFF).toString(16).padStart(4, '0') + '-0000-1000-8000-00805f9b34fb';
    }
    const s = String(u || '').trim().toLowerCase();
    if (/^[0-9a-f]{4}$/.test(s)) return '0000' + s + '-0000-1000-8000-00805f9b34fb';
    if (/^0x[0-9a-f]{1,4}$/.test(s)) return '0000' + s.slice(2).padStart(4, '0') + '-0000-1000-8000-00805f9b34fb';
    return s;
  }

  function hexToBytes(hex){
    const clean = String(hex || '').replace(/^0x/i, '').replace(/[^0-9a-f]/gi, '');
    if (!clean.length) return new Uint8Array(0);
    const len = clean.length >>> 1;
    const out = new Uint8Array(len);
    for (let i = 0; i < len; i++){
      out[i] = parseInt(clean.substr(i * 2, 2), 16) & 0xFF;
    }
    return out;
  }

  function bytesToHex(input){
    const b = toU8(input);
    let out = '';
    for (let i = 0; i < b.length; i++){
      out += (b[i] & 0xFF).toString(16).padStart(2, '0');
    }
    return out;
  }

  function toU8(input){
    if (!input) return new Uint8Array(0);
    if (input instanceof Uint8Array) return input;
    if (typeof input === 'string') return hexToBytes(input);
    if (typeof DataView !== 'undefined' && input instanceof DataView){
      return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
    }
    if (typeof ArrayBuffer !== 'undefined' && input instanceof ArrayBuffer){
      return new Uint8Array(input);
    }
    if (ArrayBuffer.isView && ArrayBuffer.isView(input)){
      return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
    }
    if (Array.isArray(input)) return Uint8Array.from(input);
    return new Uint8Array(0);
  }

  function cleanZero(n){
    return Object.is(n, -0) ? 0 : n;
  }

  function xorChecksum(bytes, end, start){
    const s = start == null ? 0 : start;
    const e = end == null ? bytes.length : end;
    let x = 0;
    for (let i = s; i < e; i++) x ^= (bytes[i] & 0xFF);
    return x & 0xFF;
  }

  function sum8Checksum(bytes, end, start){
    const s = start == null ? 0 : start;
    const e = end == null ? bytes.length : end;
    let acc = 0;
    for (let i = s; i < e; i++) acc = (acc + (bytes[i] & 0xFF)) & 0xFF;
    return acc & 0xFF;
  }

  function lrc8TwosComplement(bytes, end, start){
    return (-sum8Checksum(bytes, end, start)) & 0xFF;
  }

  function acaiaChecksum(payload){
    let ck1 = 0, ck2 = 0;
    for (let i = 0; i < payload.length; i++){
      if ((i & 1) === 0) ck1 = (ck1 + (payload[i] & 0xFF)) & 0xFF;
      else ck2 = (ck2 + (payload[i] & 0xFF)) & 0xFF;
    }
    return [ck1, ck2];
  }

  function encodeAcaia(msgType, payload){
    const p = toU8(payload);
    const cks = acaiaChecksum(p);
    const out = new Uint8Array(3 + p.length + 2);
    out[0] = 0xEF;
    out[1] = 0xDD;
    out[2] = msgType & 0xFF;
    out.set(p, 3);
    out[3 + p.length] = cks[0];
    out[4 + p.length] = cks[1];
    return out;
  }

  function crc16Modbus(bytes){
    let crc = 0xFFFF;
    for (let i = 0; i < bytes.length; i++){
      crc ^= (bytes[i] & 0xFF);
      for (let b = 0; b < 8; b++){
        crc = (crc & 0x0001) ? ((crc >>> 1) ^ 0xA001) : (crc >>> 1);
      }
    }
    return [crc & 0xFF, (crc >>> 8) & 0xFF];
  }

  function crc16Kermit(bytes){
    let crc = 0x0000;
    for (let i = 0; i < bytes.length; i++){
      crc ^= (bytes[i] & 0xFF);
      for (let b = 0; b < 8; b++){
        crc = (crc & 0x0001) ? ((crc >>> 1) ^ 0x8408) : (crc >>> 1);
      }
    }
    return [crc & 0xFF, (crc >>> 8) & 0xFF];
  }

  /* ---------- Bounded 256-Byte MTU Fragmentation Ring-Buffer ---------- */
  function createMtuRingBuffer(capacity){
    const cap = Math.max(32, Math.min(1024, +capacity || MAX_RING_BYTES));
    let buf = new Uint8Array(0);
    return {
      capacity: cap,
      length: function(){ return buf.length; },
      peek: function(){ return buf; },
      clear: function(){ buf = new Uint8Array(0); },
      append: function(chunk){
        const c = toU8(chunk);
        if (!c.length) return buf;
        const total = buf.length + c.length;
        if (total <= cap){
          const next = new Uint8Array(total);
          next.set(buf, 0);
          next.set(c, buf.length);
          buf = next;
        } else if (c.length >= cap){
          buf = c.slice(c.length - cap);
        } else {
          const keepOld = cap - c.length;
          const next = new Uint8Array(cap);
          next.set(buf.subarray(buf.length - keepOld), 0);
          next.set(c, keepOld);
          buf = next;
        }
        return buf;
      },
      consume: function(count){
        const n = Math.max(0, Math.min(buf.length, +count || 0));
        if (n === 0) return;
        if (n >= buf.length){
          buf = new Uint8Array(0);
        } else {
          buf = buf.slice(n);
        }
      }
    };
  }

  /* ---------- Command Packet Builders Across All 15+ Families ---------- */
  function encodeXBloomRecipePayload(profile, opts){
    const pr = profile || {};
    const o = opts || {};
    /* HARD SAFETY GATE: Pre-Ground / External Grinder MUST use opcode 0x44 + grindByte 0xFE + 0 RPM */
    const preGround = !!(
      o.preGround === true ||
      pr.preGround === true ||
      pr.useExternalGrinder === true ||
      pr.grindMode === 'preground' ||
      pr.grindStep === 0 ||
      pr.grindStep === 0xFE ||
      (pr.grindStep == null && o.wholeBean !== true && pr.wholeBean !== true)
    );
    const doseByte = Math.max(8, Math.min(25, Math.round(+pr.doseG || 15))) & 0xFF;
    const ratioX10 = Math.max(80, Math.min(250, Math.round((+pr.ratio || 16) * 10))) & 0xFF;
    const opcode = preGround ? 0x44 : 0x41;
    const grindByte = preGround ? 0xFE : (Math.max(1, Math.min(80, Math.round(+pr.grindStep || 45))) & 0xFF);
    const rpmByte = preGround
      ? 0x00
      : (pr.model === 'original' ? 85 : (Math.max(60, Math.min(120, Math.round((+pr.grindRpm || 90) / 10) * 10)) & 0xFF));
    const shakeLocked = !!(pr.agitationLockedOff || pr.vessel === 'third_party');

    const rawPours = Array.isArray(pr.pours) && pr.pours.length
      ? pr.pours
      : [{ volumeMl:Math.round(doseByte * (ratioX10 / 10)), temp:93, pattern:'spiral', flowRateMls:3.3, pauseS:0, agitation:'none' }];

    const segs = [];
    for (let pi = 0; pi < rawPours.length; pi++){
      const p = rawPours[pi] || {};
      let rem = Math.max(1, Math.round(+p.volumeMl || 30));
      const tVal = p.temp != null ? p.temp : p.temperature;
      const tByte = (tVal === 'RT' || tVal === 0)
        ? 0
        : (tVal === 'BP' || +tVal >= 100)
          ? 100
          : Math.max(40, Math.min(99, Math.round(+tVal || 93)));
      const patCode = p.pattern === 'center' ? 1 : p.pattern === 'circular' ? 2 : 3;
      const flowCode = Math.max(25, Math.min(40, Math.round((+p.flowRateMls || 3.3) * 10)));
      const pauseB = Math.max(0, Math.min(120, Math.round(+p.pauseS || 0)));
      const agitB = shakeLocked ? 0 : ({ none:0, before:1, after:2, both:3 }[p.agitation] || 0);

      while (rem > 127 && segs.length < 11){
        segs.push([127, tByte, patCode, flowCode, 0, 0]);
        rem -= 127;
      }
      if (segs.length < 12){
        segs.push([Math.min(127, rem), tByte, patCode, flowCode, pauseB, agitB]);
      }
    }

    const payloadLen = 5 + segs.length * 6;
    const body = [
      0x58, 0x42,
      opcode,
      payloadLen & 0xFF,
      doseByte,
      ratioX10,
      preGround ? 0xFE : grindByte,
      preGround ? 0x00 : rpmByte,
      segs.length & 0xFF
    ];
    for (let si = 0; si < segs.length; si++){
      const s = segs[si];
      for (let bi = 0; bi < 6; bi++) body.push(s[bi] & 0xFF);
    }
    const crc = crc16Modbus(body);
    const out = new Uint8Array(body.length + 2);
    out.set(body, 0);
    out[body.length] = crc[0];
    out[body.length + 1] = crc[1];
    return out;
  }

  const commands = {
    /* 1. Acaia */
    acaiaIdentify: function(){
      return encodeAcaia(0x0B, [0x30,0x31,0x32,0x33,0x34,0x35,0x36,0x37,0x38,0x39,0x30,0x31,0x32,0x33,0x34]);
    },
    acaiaHeartbeat: function(){
      return encodeAcaia(0x00, [0x02, 0x00]);
    },
    acaiaNotificationRequest: function(){
      return encodeAcaia(0x0C, [0x09, 0x00, 0x01, 0x01, 0x02, 0x02, 0x05, 0x03, 0x04]);
    },
    acaiaTare: function(){
      return encodeAcaia(0x04, [0x00]);
    },
    acaiaTimerStart: function(){
      return encodeAcaia(0x0D, [0x00, 0x00]);
    },
    acaiaTimerReset: function(){
      return encodeAcaia(0x0D, [0x00, 0x01]);
    },
    acaiaTimerStop: function(){
      return encodeAcaia(0x0D, [0x00, 0x02]);
    },

    /* 2. DiFluid Microbalance / Ti */
    difluidScaleEnableAuto: function(){
      return new Uint8Array([0xDF, 0xDF, 0x01, 0x01, 0x01, 0x01, 0xC2]);
    },
    difluidScaleSetGrams: function(){
      return new Uint8Array([0xDF, 0xDF, 0x01, 0x00, 0x01, 0x00, 0xC0]);
    },
    difluidScaleTare: function(){
      return new Uint8Array([0xDF, 0xDF, 0x03, 0x02, 0x01, 0x01, 0xC5]);
    },
    difluidScaleTimerStart: function(){
      return new Uint8Array([0xDF, 0xDF, 0x03, 0x02, 0x01, 0x02, 0xC6]);
    },
    difluidScaleTimerStop: function(){
      return new Uint8Array([0xDF, 0xDF, 0x03, 0x02, 0x01, 0x03, 0xC7]);
    },
    difluidScaleTimerReset: function(){
      return new Uint8Array([0xDF, 0xDF, 0x03, 0x02, 0x01, 0x00, 0xC4]);
    },

    /* 3. Bookoo Themis Mini / Ultra */
    bookooTare: function(){
      return new Uint8Array([0x03, 0x0A, 0x01, 0x00, 0x00, 0x08]);
    },
    bookooTareAndStart: function(){
      return new Uint8Array([0x03, 0x0A, 0x07, 0x00, 0x00, 0x0E]);
    },
    bookooTimerStart: function(){
      return new Uint8Array([0x03, 0x0A, 0x04, 0x00, 0x00, 0x0D]);
    },
    bookooTimerStop: function(){
      return new Uint8Array([0x03, 0x0A, 0x05, 0x00, 0x00, 0x0C]);
    },
    bookooTimerReset: function(){
      return new Uint8Array([0x03, 0x0A, 0x06, 0x00, 0x00, 0x0F]);
    },

    /* 4. Timemore Black Mirror Classic (0x2A9E) / OSP (0xFFF2) / Compact */
    timemoreClassicTare: function(){
      return new Uint8Array([0x00]);
    },
    timemoreClassicTimerStart: function(){
      return new Uint8Array([0x08]);
    },
    timemoreClassicTimerStop: function(){
      return new Uint8Array([0x09]);
    },
    timemoreClassicTimerReset: function(){
      return new Uint8Array([0x0A]);
    },
    timemoreOspTare: function(){
      const body = [0xA5, 0x5A, 0x03, 0x0D, 0x00, 0x01, 0x00];
      const crc = crc16Modbus(body);
      return new Uint8Array([0xA5, 0x5A, 0x03, 0x0D, 0x00, 0x01, 0x00, crc[0], crc[1]]);
    },
    timemoreTimerStart: function(){
      const body = [0xA5, 0x5A, 0x03, 0x0E, 0x00, 0x01, 0x01];
      const crc = crc16Modbus(body);
      return new Uint8Array([0xA5, 0x5A, 0x03, 0x0E, 0x00, 0x01, 0x01, crc[0], crc[1]]);
    },
    timemoreTimerStop: function(){
      const body = [0xA5, 0x5A, 0x03, 0x0E, 0x00, 0x01, 0x00];
      const crc = crc16Modbus(body);
      return new Uint8Array([0xA5, 0x5A, 0x03, 0x0E, 0x00, 0x01, 0x00, crc[0], crc[1]]);
    },
    timemoreTimerReset: function(){
      const body = [0xA5, 0x5A, 0x03, 0x0E, 0x00, 0x01, 0x02];
      const crc = crc16Modbus(body);
      return new Uint8Array([0xA5, 0x5A, 0x03, 0x0E, 0x00, 0x01, 0x02, crc[0], crc[1]]);
    },

    /* 5. Felicita Arc / Incline / Parallel */
    felicitaTare: function(){ return new Uint8Array([0x54]); },
    felicitaTimerStart: function(){ return new Uint8Array([0x52]); },
    felicitaTimerStop: function(){ return new Uint8Array([0x53]); },
    felicitaTimerReset: function(){ return new Uint8Array([0x43]); },
    felicitaToggleUnit: function(){ return new Uint8Array([0x55]); },

    /* 6. Decent Scale & Half Decent Scale (HDS) */
    decentTare: function(counter){
      const c = (counter == null ? 0 : counter) & 0xFF;
      const cmd = new Uint8Array([0x03, 0x0F, c, 0x00, 0x00, 0x01, 0x00]);
      cmd[6] = xorChecksum(cmd, 6);
      return cmd;
    },
    decentEnableGramsLed: function(){
      return new Uint8Array([0x03, 0x0A, 0x01, 0x01, 0x00, 0x00, 0x09]);
    },
    decentHeartbeat: function(){
      return new Uint8Array([0x03, 0x0A, 0x03, 0xFF, 0xFF, 0x00, 0x0A]);
    },
    decentTimerStart: function(){
      return new Uint8Array([0x03, 0x0B, 0x03, 0x00, 0x00, 0x00, 0x0B]);
    },
    decentTimerStop: function(){
      return new Uint8Array([0x03, 0x0B, 0x00, 0x00, 0x00, 0x00, 0x08]);
    },
    decentTimerReset: function(){
      return new Uint8Array([0x03, 0x0B, 0x02, 0x00, 0x00, 0x00, 0x0A]);
    },

    /* 7. Varia AKU */
    variaTare: function(){
      const cmd = new Uint8Array([0xFA, 0x82, 0x01, 0x01, 0x00]);
      cmd[4] = xorChecksum(cmd, 4);
      return cmd;
    },
    variaTimerStart: function(){
      const cmd = new Uint8Array([0xFA, 0x88, 0x01, 0x01, 0x00]);
      cmd[4] = xorChecksum(cmd, 4);
      return cmd;
    },
    variaTimerStop: function(){
      const cmd = new Uint8Array([0xFA, 0x89, 0x01, 0x01, 0x00]);
      cmd[4] = xorChecksum(cmd, 4);
      return cmd;
    },
    variaTimerReset: function(){
      const cmd = new Uint8Array([0xFA, 0x8A, 0x01, 0x01, 0x00]);
      cmd[4] = xorChecksum(cmd, 4);
      return cmd;
    },

    /* 8. Atomax Skale II */
    skaleTare: function(){ return new Uint8Array([0x10]); },
    skaleEnableGrams: function(){ return new Uint8Array([0x03]); },
    skaleDisplayWeight: function(){ return new Uint8Array([0xEC]); },
    skaleLedOn: function(){ return new Uint8Array([0xED]); },
    skaleTimerStart: function(){ return new Uint8Array([0xD1]); },
    skaleTimerStop: function(){ return new Uint8Array([0xD0]); },
    skaleTimerReset: function(){ return new Uint8Array([0xD2]); },

    /* 9. Eureka Precisa / CFS-9002 */
    eurekaTare: function(){ return new Uint8Array([0xAA, 0x02, 0x31, 0x31]); },
    eurekaTimerStart: function(){ return new Uint8Array([0xAA, 0x02, 0x33, 0x33]); },
    eurekaTimerStop: function(){ return new Uint8Array([0xAA, 0x02, 0x34, 0x34]); },
    eurekaTimerReset: function(){ return new Uint8Array([0xAA, 0x02, 0x35, 0x35]); },

    /* 10. Hiroia Jimmy */
    hiroiaTare: function(){ return new Uint8Array([0x07, 0x00]); },
    hiroiaTimerStart: function(){ return new Uint8Array([0x05, 0x00]); },
    hiroiaTimerStop: function(){ return new Uint8Array([0x06, 0x00]); },
    hiroiaTimerReset: function(){ return new Uint8Array([0x06, 0x00]); },
    hiroiaToggleUnit: function(){ return new Uint8Array([0x08, 0x00]); },

    /* 11. Bluetooth SIG Weight Scale */
    sigTare: function(){ return new Uint8Array([0x00]); },

    /* 12. Pressensor / Smart Espresso Profiler */
    pressensorZero: function(){ return new Uint8Array([0x01, 0x00]); },

    /* 13. Bookoo Espresso Monitor */
    bookooPressureZero: function(){
      const cmd = new Uint8Array([0x02, 0x0A, 0x01, 0x00, 0x00, 0x00]);
      cmd[5] = xorChecksum(cmd, 5);
      return cmd;
    },
    bookooPressureStartStream: function(){
      const cmd = new Uint8Array([0x02, 0x0A, 0x02, 0x01, 0x00, 0x00]);
      cmd[5] = xorChecksum(cmd, 5);
      return cmd;
    },

    /* 14. DiFluid R2 Extract Refractometer */
    difluidSetCelsius: function(){
      return new Uint8Array([0xDF, 0xDF, 0x01, 0x00, 0x01, 0x00, 0xC0]);
    },
    difluidR2EnableAutoNotifications: function(){
      return new Uint8Array([0xDF, 0xDF, 0x01, 0x01, 0x01, 0x01, 0xC2]);
    },
    difluidTriggerSingle: function(){
      return new Uint8Array([0xDF, 0xDF, 0x03, 0x00, 0x00, 0xC1]);
    },
    difluidTriggerMultiAverage: function(count){
      const n = Math.max(2, Math.min(10, Math.round(+count || 3))) & 0xFF;
      const pkt = new Uint8Array([0xDF, 0xDF, 0x03, 0x01, 0x01, n, 0x00]);
      pkt[6] = sum8Checksum(pkt, 6);
      return pkt;
    },
    difluidEnableAutoRead: function(enabled){
      const v = enabled === false ? 0x00 : 0x01;
      const pkt = new Uint8Array([0xDF, 0xDF, 0x01, 0x02, 0x01, v, 0x00]);
      pkt[6] = sum8Checksum(pkt, 6);
      return pkt;
    },

    /* 15. DiFluid Omni Roast & PSD Analyzer */
    difluidOmniTrigger: function(){
      return new Uint8Array([0xDF, 0xDF, 0x04, 0x00, 0x00, 0xC2]);
    },
    difluidOmniRequestHistogram: function(){
      const pkt = new Uint8Array([0xDF, 0xDF, 0x04, 0x01, 0x01, 0x10, 0x00]);
      pkt[6] = sum8Checksum(pkt, 6);
      return pkt;
    },

    /* 16. xBloom Original & Studio (with 0x41 vs 0x44/0xFE Hard Safety Gate) */
    encodeXBloomRecipePayload: encodeXBloomRecipePayload,

    /* 17. Fellow Stagg EKG+ Kettle (Magic Init EF DD 0B ... 9A 6D + 8-Byte Seq Commands) */
    staggAuth: function(){
      return encodeAcaia(0x0B, [0x30,0x31,0x32,0x33,0x34,0x35,0x36,0x37,0x38,0x39,0x30,0x31,0x32,0x33,0x34]);
    },
    staggSetTempC: function(tempC, seq){
      const s = (seq == null ? 1 : seq) & 0xFF;
      const clamped = Math.max(40, Math.min(100, Math.round(+tempC || 93))) & 0xFF;
      return new Uint8Array([0xEF, 0xDD, 0x0A, s, 0x01, clamped, (s + clamped) & 0xFF, 0x01]);
    },
    staggSetHold: function(enabled, seq){
      const s = (seq == null ? 2 : seq) & 0xFF;
      const v = enabled === false ? 0x00 : 0x01;
      return new Uint8Array([0xEF, 0xDD, 0x0A, s, 0x02, v, (s + v) & 0xFF, 0x02]);
    },
    staggPower: function(on, seq){
      const s = (seq == null ? 0 : seq) & 0xFF;
      const v = on === false ? 0x00 : 0x01;
      return new Uint8Array([0xEF, 0xDD, 0x0A, s, 0x00, v, (s + v) & 0xFF, 0x00]);
    }
  };

  /* ============================================================================
   * 15-FAMILY PURE BINARY GATT DECODERS
   * ============================================================================ */

  /* --- 1. Acaia Scale (Lunar, Lunar 2021, Pearl, Pearl S, Pyxis, Cinco) --- */
  function decodeAcaiaWeightSubEvent(b){
    if (b.length < 5) return null;
    const is6 = b.length >= 6;
    const raw = is6
      ? (((b[3] << 24) >>> 0) + (b[2] << 16) + (b[1] << 8) + b[0])
      : ((b[2] << 16) + (b[1] << 8) + b[0]);
    const exp = is6 ? b[4] : b[3];
    const flags = is6 ? b[5] : b[4];
    if (exp > 6) return null;
    const div = Math.pow(10, exp);
    const sign = (flags & 0x02) ? -1 : 1;
    const val = sign * (raw / div);
    const weightG = +(val.toFixed(Math.min(exp, 4)));
    return {
      weightG: cleanZero(weightG),
      decimals: exp,
      stable: (flags & 0x01) === 0
    };
  }

  function canParseAcaiaSubEvents(b, pos, payloadEnd){
    if (pos === payloadEnd) return true;
    if (pos > payloadEnd) return false;
    const ev = b[pos];
    if (ev === 0x05){
      const try6 = pos + 7 <= payloadEnd && b[pos + 5] <= 6 && canParseAcaiaSubEvents(b, pos + 7, payloadEnd);
      if (try6) return true;
      return pos + 6 <= payloadEnd && b[pos + 4] <= 6 && canParseAcaiaSubEvents(b, pos + 6, payloadEnd);
    }
    if (ev === 0x06 && pos + 2 <= payloadEnd) return canParseAcaiaSubEvents(b, pos + 2, payloadEnd);
    if (ev === 0x07 && pos + 4 <= payloadEnd) return canParseAcaiaSubEvents(b, pos + 4, payloadEnd);
    if (ev === 0x08 && pos + 2 <= payloadEnd) return canParseAcaiaSubEvents(b, pos + 2, payloadEnd);
    if (ev === 0x0B && pos + 3 <= payloadEnd) return canParseAcaiaSubEvents(b, pos + 3, payloadEnd);
    return false;
  }

  function decodeAcaiaFrame(frame){
    const b = toU8(frame);
    if (b.length < 6 || b[0] !== 0xEF || b[1] !== 0xDD) return null;
    const msgType = b[2];

    if (msgType === 0x08 && b.length >= 7){
      const payloadLen = b.length - 5;
      const cks = acaiaChecksum(b.subarray(3, 3 + payloadLen));
      const checksumValid = (b[3 + payloadLen] === cks[0] && b[4 + payloadLen] === cks[1]);
      if (!checksumValid) return null;
      return {
        brand: 'acaia',
        slot: 'scale',
        packetType: 'status',
        batteryPct: b[4] & 0x7F,
        checksumValid: checksumValid
      };
    }

    /* Legacy Acaia Pearl FW 1.x direct weight frame (msgType === 0x07, no 0x05 sub-event prefix) */
    if (msgType === 0x07 && b.length >= 11){
      const payloadEnd7 = b.length - 2;
      const cks7 = acaiaChecksum(b.subarray(3, payloadEnd7));
      const checksumValid7 = (b[payloadEnd7] === cks7[0] && b[payloadEnd7 + 1] === cks7[1]);
      if (!checksumValid7) return null;
      const wSlice7 = (payloadEnd7 - 4 >= 6) ? b.subarray(4, 10) : b.subarray(4, 9);
      const w7 = decodeAcaiaWeightSubEvent(wSlice7);
      if (!w7) return null;
      return Object.assign({
        brand: 'acaia',
        slot: 'scale',
        packetType: 'weight',
        checksumValid: checksumValid7
      }, w7);
    }

    if (msgType === 0x0C && b.length >= 8){
      const payloadEnd = b.length - 2;
      const cks = acaiaChecksum(b.subarray(3, payloadEnd));
      const checksumValid = (b[payloadEnd] === cks[0] && b[payloadEnd + 1] === cks[1]);
      if (!checksumValid) return null;

      const out = { brand:'acaia', slot:'scale', packetType:'event', checksumValid:checksumValid };
      if (b.length === 12 && b[4] === 0x05){
        const w5 = decodeAcaiaWeightSubEvent(b.subarray(5, 10));
        if (!w5) return null;
        return Object.assign(out, { packetType:'weight' }, w5);
      }
      let idx = 4;
      while (idx < payloadEnd){
        const ev = b[idx];
        if (ev === 0x05){
          const can6 = idx + 7 <= payloadEnd && b[idx + 5] <= 6 && canParseAcaiaSubEvents(b, idx + 7, payloadEnd);
          const can5 = idx + 6 <= payloadEnd && b[idx + 4] <= 6 && canParseAcaiaSubEvents(b, idx + 6, payloadEnd);
          const use6 = can6 && (!can5 || (b[idx + 4] === 0 && (b[idx + 6] & 0xF0) === 0));
          const use5 = !use6 && (can5 || (!can6 && idx + 6 <= payloadEnd && b[idx + 4] <= 6 && idx + 7 > payloadEnd));
          if (use6 || (!use5 && idx + 7 <= payloadEnd && b[idx + 5] <= 6 && (b[idx + 6] & 0xFC) === 0)){
            const w6 = decodeAcaiaWeightSubEvent(b.subarray(idx + 1, idx + 7));
            if (w6) Object.assign(out, { packetType:'weight' }, w6);
            idx += 7;
          } else if (idx + 6 <= payloadEnd){
            const w5b = decodeAcaiaWeightSubEvent(b.subarray(idx + 1, idx + 6));
            if (w5b) Object.assign(out, { packetType:'weight' }, w5b);
            idx += 6;
          } else {
            break;
          }
        } else if (ev === 0x06 && idx + 2 <= payloadEnd){
          out.batteryPct = b[idx + 1] & 0x7F;
          idx += 2;
        } else if (ev === 0x07 && idx + 4 <= payloadEnd){
          out.timeS = +(b[idx + 1] * 60 + b[idx + 2] + b[idx + 3] * 0.1).toFixed(1);
          idx += 4;
        } else if (ev === 0x08 && idx + 2 <= payloadEnd){
          out.keyEvent = b[idx + 1];
          const keyMap = { 0:'tare', 1:'timer_start', 2:'timer_reset', 3:'timer_stop' };
          if (keyMap[b[idx + 1]]) out.action = keyMap[b[idx + 1]];
          idx += 2;
        } else if (ev === 0x0B && idx + 3 <= payloadEnd){
          out.ackEvent = b[idx + 1];
          idx += 3;
        } else {
          break;
        }
      }
      if ('weightG' in out || 'timeS' in out || 'keyEvent' in out) return out;
      if ('batteryPct' in out){
        out.packetType = 'status';
        return out;
      }
      return null;
    }
    return null;
  }

  function createAcaiaStreamParser(){
    const ring = createMtuRingBuffer(MAX_RING_BYTES);
    return {
      reset: function(){ ring.clear(); },
      length: function(){ return ring.length(); },
      push: function(chunk){
        ring.append(chunk);
        const results = [];
        while (ring.length() >= 6){
          const buf = ring.peek();
          let start = -1;
          for (let i = 0; i <= buf.length - 2; i++){
            if (buf[i] === 0xEF && buf[i + 1] === 0xDD){ start = i; break; }
          }
          if (start < 0){
            const keepTail = buf[buf.length - 1] === 0xEF ? 1 : 0;
            ring.consume(buf.length - keepTail);
            break;
          }
          if (start > 0){
            ring.consume(start);
            if (ring.length() < 6) break;
          }
          const cur = ring.peek();
          const msgType = cur[2];
          const lenByte = cur[3];
          const rawCands = msgType === 0x08
            ? [lenByte + 4, lenByte + 5, lenByte + 6, 7, 8, 9, 10]
            : (msgType === 0x07
              ? [lenByte + 4, lenByte + 5, lenByte + 6, 11, 12, 13, 14]
              : [lenByte + 4, lenByte + 5, lenByte + 6]);
          const cands = [];
          for (let ci = 0; ci < rawCands.length; ci++){
            const cl = rawCands[ci];
            if (cl >= 6 && cl <= 64 && cands.indexOf(cl) < 0) cands.push(cl);
          }
          cands.sort(function(a, b){ return a - b; });
          if (!cands.length){
            ring.consume(2);
            continue;
          }
          if (cur.length < cands[0]) break;

          let matchedLen = 0;
          for (let mi = 0; mi < cands.length; mi++){
            const tryLen = cands[mi];
            if (cur.length < tryLen) break;
            const slice = cur.subarray(0, tryLen);
            const ck = acaiaChecksum(slice.subarray(3, tryLen - 2));
            if (slice[tryLen - 2] === ck[0] && slice[tryLen - 1] === ck[1]){
              const parsed = decodeAcaiaFrame(slice);
              if (parsed){
                results.push(parsed);
                matchedLen = tryLen;
                break;
              }
            }
          }
          if (matchedLen > 0){
            ring.consume(matchedLen);
            continue;
          }
          if (cur.length >= cands[cands.length - 1]){
            ring.consume(2);
            continue;
          }
          break;
        }
        return results;
      }
    };
  }

  function decodeAcaia(input){
    const b = toU8(input);
    const direct = decodeAcaiaFrame(b);
    if (direct && direct.checksumValid) return direct;
    const parser = createAcaiaStreamParser();
    const frames = parser.push(b);
    return frames.length ? frames[frames.length - 1] : null;
  }

  /* --- 2. DiFluid Microbalance & Microbalance Ti Scale (`0xDF 0xDF`) --- */
  function readDiFluidScaleValueBE(dv, b, off){
    const b0 = b[off], b1 = b[off + 1], b2 = b[off + 2], b3 = b[off + 3];
    if ((b0 | b1 | b2 | b3) === 0) return 0;
    const exp = ((b0 & 0x7F) << 1) | (b1 >>> 7);
    const f32 = dv.getFloat32(off, false);
    if (exp === 0 || exp === 255 || !Number.isFinite(f32) || Math.abs(f32) < 1e-6 || Math.abs(f32) > 10000){
      const i32 = dv.getInt32(off, false);
      if (Math.abs(i32) <= 100000) return i32 / 10;
      return NaN;
    }
    return f32;
  }

  function decodeDiFluidScale(input){
    const b = toU8(input);
    if (b.length < 6 || b[0] !== 0xDF || b[1] !== 0xDF) return null;
    const func = b[2], cmd = b[3], dataLen = b[4];
    if (b.length < 6 + dataLen) return null;
    const checksumValid = (b[5 + dataLen] === sum8Checksum(b, 5 + dataLen));
    if (!checksumValid) return null;
    const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);

    if (func === 0x03 && cmd === 0x00 && dataLen >= 13){
      let w = readDiFluidScaleValueBE(dv, b, 5);
      let f = readDiFluidScaleValueBE(dv, b, 9);
      if (!Number.isFinite(w) || Math.abs(w) > 10000) return null;
      if (!Number.isFinite(f) || Math.abs(f) > 500) f = 0;
      const unitCode = b[16];
      if (unitCode === 1){ w *= 28.3495231; f *= 28.3495231; }
      const weightG = +(w.toFixed(1));
      const flowRateGs = +(f.toFixed(2));
      const timeS = +(b[13] * 60 + b[14] + b[15] * 0.1).toFixed(1);
      const flags = b[17];
      return {
        brand: 'difluid',
        slot: 'scale',
        packetType: 'weight',
        weightG: cleanZero(weightG),
        flowRateGs: cleanZero(flowRateGs),
        timeS: timeS,
        unit: unitCode === 1 ? 'oz' : (unitCode === 2 ? 'ml' : 'g'),
        stable: (flags & 0x01) !== 0,
        timerRunning: (flags & 0x02) !== 0,
        checksumValid: checksumValid
      };
    }

    if (func === 0x03 && cmd === 0x00 && dataLen >= 4 && dataLen < 13){
      let wShort = readDiFluidScaleValueBE(dv, b, 5);
      if (!Number.isFinite(wShort) || Math.abs(wShort) > 10000) return null;
      let fShort = 0;
      if (dataLen >= 8){
        const candF = readDiFluidScaleValueBE(dv, b, 9);
        if (Number.isFinite(candF) && Math.abs(candF) <= 500) fShort = candF;
      } else if (dataLen >= 6){
        fShort = dv.getInt16(9, false) / 10;
      }
      const shortUnit = dataLen >= 12 ? b[16] : 0;
      if (shortUnit === 1){ wShort *= 28.3495231; fShort *= 28.3495231; }
      const shortTimeS = dataLen >= 11 ? +(b[13] * 60 + b[14] + b[15] * 0.1).toFixed(1) : null;
      return {
        brand: 'difluid',
        slot: 'scale',
        packetType: 'weight',
        weightG: cleanZero(+(wShort.toFixed(1))),
        flowRateGs: cleanZero(+(fShort.toFixed(2))),
        timeS: shortTimeS,
        unit: shortUnit === 1 ? 'oz' : (shortUnit === 2 ? 'ml' : 'g'),
        stable: Math.abs(fShort) < 0.08,
        checksumValid: checksumValid
      };
    }

    if (func === 0x03 && cmd === 0x01 && dataLen >= 4){
      const rawW = dv.getInt32(5, false);
      const weightG = +(rawW / 10).toFixed(1);
      const flowRateGs = dataLen >= 6 ? +(dv.getInt16(9, false) / 10).toFixed(1) : 0;
      const timeS = dataLen >= 8 ? +(dv.getUint16(11, false) / 10).toFixed(1) : null;
      const flags = dataLen >= 10 ? b[14] : 0;
      return {
        brand: 'difluid',
        slot: 'scale',
        packetType: 'weight',
        weightG: cleanZero(weightG),
        flowRateGs: cleanZero(flowRateGs),
        timeS: timeS,
        stable: (flags & 0x01) !== 0,
        timerRunning: (flags & 0x02) !== 0,
        checksumValid: checksumValid
      };
    }

    if (func === 0x03 && cmd === 0x02 && dataLen >= 1){
      const act = b[5];
      const map = { 0x00:'timer_reset', 0x01:'tare', 0x02:'timer_start', 0x03:'timer_stop' };
      return { brand:'difluid', slot:'scale', packetType:'button', action:map[act] || ('btn_' + act), checksumValid:checksumValid };
    }

    if (func === 0x02 && dataLen >= 1){
      return { brand:'difluid', slot:'scale', packetType:'status', batteryPct:b[5] <= 100 ? b[5] : null, checksumValid:checksumValid };
    }

    return { brand:'difluid', slot:'scale', packetType:'ack', func:func, cmd:cmd, checksumValid:checksumValid };
  }

  /* --- 3. Bookoo Themis Mini / Ultra Scale (20-byte frame) --- */
  function decodeBookoo(input){
    const b = toU8(input);
    if (b.length < 20 || b[0] !== 0x03 || (b[1] !== 0x0B && b[1] !== 0xCE)) return null;
    const expectedXor = xorChecksum(b, 19);
    const checksumValid = (b[19] === expectedXor);
    if (!checksumValid) return null;

    const timeMs = (b[2] << 16) | (b[3] << 8) | b[4];
    const unitCode = b[5];
    const wSign = (b[6] === 0x2D || b[6] === 1) ? -1 : 1;
    const rawWeight = (b[7] << 16) | (b[8] << 8) | b[9];
    const fSign = (b[10] === 0x2D || b[10] === 1) ? -1 : 1;
    const rawFlow = (b[11] << 8) | b[12];
    let wVal = wSign * (rawWeight / 100);
    let fVal = fSign * (rawFlow / 100);
    if (unitCode === 1){
      wVal *= 28.3495231;
      fVal *= 28.3495231;
    }
    const weightG = +(wVal.toFixed(2));
    const flowRateGs = +(fVal.toFixed(2));
    const batteryPct = b[13] <= 100 ? b[13] : null;

    return {
      brand: 'bookoo',
      slot: 'scale',
      packetType: 'weight',
      weightG: cleanZero(weightG),
      flowRateGs: cleanZero(flowRateGs),
      unit: unitCode === 1 ? 'oz' : 'g',
      timeS: +(timeMs / 1000).toFixed(2),
      batteryPct: batteryPct,
      stable: Math.abs(flowRateGs) < 0.05,
      checksumValid: checksumValid
    };
  }

  /* --- 4. Timemore Black Mirror (Classic/Basic+ Float32/Int32, Basic 2/OSP Dual-Weight CRC16, 2025 Compact Int16) --- */
  function readTimemoreWeightLE(dv, b, off){
    const b0 = b[off], b1 = b[off + 1], b2 = b[off + 2], b3 = b[off + 3];
    if ((b0 | b1 | b2 | b3) === 0) return 0;
    const exp = ((b3 & 0x7F) << 1) | (b2 >>> 7);
    if (exp >= 115 && exp <= 145){
      const f32 = dv.getFloat32(off, true);
      if (Number.isFinite(f32) && Math.abs(f32) <= 10000) return f32;
    }
    const i32 = dv.getInt32(off, true);
    if (Math.abs(i32) <= 100000) return i32 / 10;
    return NaN;
  }

  function decodeTimemore(input){
    const b = toU8(input);
    if (b.length < 8) return null;
    const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);

    if (b[0] === 0xA5 && b[1] === 0x5A && b.length >= 12){
      const opcode = b[2], cmd = b[3];
      const payloadLen = (b[4] << 8) | b[5];
      if (b.length < 6 + payloadLen + 2) return null;
      const crc = crc16Modbus(b.subarray(0, 6 + payloadLen));
      const checksumValid = (b[6 + payloadLen] === crc[0] && b[7 + payloadLen] === crc[1]);
      if (!checksumValid) return null;
      if (opcode === 0x01 && cmd === 0x01 && payloadLen >= 4){
        const rawW = dv.getInt32(6, true);
        const unitCode = payloadLen >= 5 ? b[10] : 0;
        let weightG = rawW / 10;
        if (unitCode === 1) weightG = (rawW / 100) * 28.3495231;
        weightG = +(weightG.toFixed(1));
        const flowRateGs = payloadLen >= 7 ? +(dv.getInt16(11, true) / 10).toFixed(1) : null;
        const timeS = payloadLen >= 9 ? dv.getUint16(13, true) : null;
        const secondaryWeightG = payloadLen >= 13 ? +(dv.getInt32(15, true) / 10).toFixed(1) : null;
        return {
          brand: 'timemore',
          slot: 'scale',
          variant: 'osp',
          packetType: 'weight',
          weightG: cleanZero(weightG),
          secondaryWeightG: secondaryWeightG !== null ? cleanZero(secondaryWeightG) : null,
          unit: unitCode === 1 ? 'oz' : 'g',
          flowRateGs: flowRateGs !== null ? cleanZero(flowRateGs) : null,
          timeS: timeS,
          checksumValid: checksumValid
        };
      }
      return null;
    }

    if (b.length === 8 && b[0] === 0x01 && b[1] !== 0x02){
      const weightG = +(dv.getInt16(2, true) / 10).toFixed(1);
      const flowRateGs = +(dv.getInt16(4, true) / 10).toFixed(1);
      const timeS = dv.getUint16(6, true);
      return {
        brand: 'timemore',
        slot: 'scale',
        variant: 'compact_int16',
        packetType: 'weight',
        weightG: cleanZero(weightG),
        flowRateGs: cleanZero(flowRateGs),
        timeS: timeS
      };
    }

    if (b.length >= 9 && b[0] !== 0xA5 &&
        !(b[0] === 0xEF && b[1] === 0xDD) &&
        !(b[0] === 0xDF && b[1] === 0xDF) &&
        !(b[0] === 0x01 && b[1] === 0x02) &&
        !(b[0] === 0x03 && (b[1] === 0x0B || b[1] === 0xCE || b[1] === 0xCA || b[1] === 0x0A || b[1] === 0xAA)) &&
        b[0] !== 0x58 && b[0] !== 0xAA && b[0] !== 0xFA && b[0] !== 0xFB && b[0] !== 0x55 &&
        !isPrintableAsciiScaleFrame(b)){
      const w1 = readTimemoreWeightLE(dv, b, 1);
      if (!Number.isFinite(w1) || Math.abs(w1) > 10000) return null;
      const w2 = b.length >= 9 ? readTimemoreWeightLE(dv, b, 5) : NaN;
      const weightG = +(w1.toFixed(1));
      const secondaryWeightG = Number.isFinite(w2) && Math.abs(w2) <= 10000 ? +(w2.toFixed(1)) : null;
      return {
        brand: 'timemore',
        slot: 'scale',
        variant: 'classic_float32',
        packetType: 'weight',
        weightG: cleanZero(weightG),
        secondaryWeightG: secondaryWeightG !== null ? cleanZero(secondaryWeightG) : null
      };
    }
    return null;
  }

  /* --- 5. Felicita Arc / Incline / Parallel (18-byte ASCII frame) --- */
  function decodeFelicita(input){
    const b = toU8(input);
    if (b.length < 9 || b[0] !== 0x01 || b[1] !== 0x02) return null;
    let sign = (b[2] === 0x2D) ? -1 : 1;
    let digits = '';
    let seenDigit = false;
    let seenInnerMinus = false;
    for (let i = 3; i < 9; i++){
      const ch = b[i];
      if (ch === 0x20){
        digits += '0';
      } else if (ch === 0x2D && !seenDigit && !seenInnerMinus && b[2] !== 0x2D){
        sign = -1;
        seenInnerMinus = true;
        digits += '0';
      } else if (ch >= 0x30 && ch <= 0x39){
        seenDigit = true;
        digits += String.fromCharCode(ch);
      } else {
        return null;
      }
    }
    if (!seenDigit) return null;
    const raw = parseInt(digits, 10);
    if (!Number.isFinite(raw)) return null;

    const unitStr = b.length >= 11 ? String.fromCharCode(b[9], b[10]).trim().toLowerCase() : 'g';
    let weightG = sign * (raw / 100);
    if (unitStr === 'oz') weightG = sign * (raw / 10000) * 28.3495231;
    weightG = +(weightG.toFixed(2));

    let batteryPct = null;
    if (b.length >= 16 && b[15] >= 120 && b[15] <= 165){
      batteryPct = Math.max(0, Math.min(100, Math.round(((b[15] - 129) / 29) * 100)));
    }

    return {
      brand: 'felicita',
      slot: 'scale',
      packetType: 'weight',
      weightG: cleanZero(weightG),
      unit: unitStr || 'g',
      batteryPct: batteryPct
    };
  }

  /* --- 6. Decent Scale (7-byte & 10-byte XOR frames) --- */
  function decodeDecent(input, opts){
    const b = toU8(input);
    if (b.length !== 7 && b.length !== 10) return null;
    if (b[0] !== 0x03) return null;
    const strictXor = !opts || opts.strictXor !== false;
    const expectedXor = xorChecksum(b, b.length - 1);
    const checksumValid = (b[b.length - 1] === expectedXor);
    if (!checksumValid && (strictXor || b[b.length - 1] !== 0x00)) return null;

    const type = b[1];
    if (type === 0xCE || type === 0xCA || type === 0x0B){
      let raw = (b[2] << 8) | b[3];
      if (raw >= 0x8000) raw -= 0x10000;
      const weightG = Math.round(raw) / 10;
      const timeS = b.length === 10 ? +(b[4] * 60 + b[5] + b[6] * 0.1).toFixed(1) : null;
      return {
        brand: 'decent',
        slot: 'scale',
        packetType: 'weight',
        weightG: cleanZero(weightG),
        stable: type === 0xCE,
        timeS: timeS,
        checksumValid: checksumValid
      };
    }
    if (type === 0x0A){
      const bat = b[4] <= 100 ? b[4] : null;
      return { brand:'decent', slot:'scale', packetType:'status', batteryPct:bat, checksumValid:checksumValid };
    }
    if (type === 0xAA){
      const btnMap = { 1:'tare', 2:'timer_start' };
      return { brand:'decent', slot:'scale', packetType:'button', buttonId:b[2], pressType:b[3], action:btnMap[b[2]] || 'button', checksumValid:checksumValid };
    }
    return null;
  }

  /* --- 7. Varia AKU / MHW-3BOMBER Cube / Wacaco Exagram (0xFA, 0xFB & 0x55 framed XOR) --- */
  function decodeVaria(input){
    const b = toU8(input);
    if (b.length < 5 || (b[0] !== 0xFA && b[0] !== 0xFB && b[0] !== 0x55)) return null;
    const cmd = b[1];
    const len = b[2];
    const totalLen = 4 + len;
    if (len < 1 || len > 32 || b.length < totalLen) return null;
    const ckByte = b[totalLen - 1];
    const xorFull = xorChecksum(b, totalLen - 1, 0);
    const xorBody = xorChecksum(b, totalLen - 1, 1);
    const checksumValid = (ckByte === xorFull || ckByte === xorBody);
    if (!checksumValid) return null;

    if (cmd === 0x01 && len >= 3){
      let sign = 1;
      let raw = 0;
      let stable = true;
      if (len >= 4){
        const sb = b[3];
        sign = (sb === 1 || sb === 0x2D || (sb & 0x10) !== 0 || (sb & 0x80) !== 0) ? -1 : 1;
        stable = (sb & 0x02) === 0;
        raw = ((b[4] << 16) | (b[5] << 8) | b[6]) >>> 0;
      } else {
        const sb3 = b[3];
        sign = ((sb3 & 0x10) !== 0 || (sb3 & 0x80) !== 0) ? -1 : 1;
        stable = (sb3 & 0x20) === 0;
        raw = (((sb3 & 0x0F) << 16) | (b[4] << 8) | b[5]) >>> 0;
      }
      const weightG = +(sign * (raw / 100)).toFixed(2);
      return {
        brand: 'varia',
        slot: 'scale',
        packetType: 'weight',
        weightG: cleanZero(weightG),
        stable: stable,
        checksumValid: checksumValid
      };
    }

    if (cmd === 0x85 && len >= 1){
      return {
        brand: 'varia',
        slot: 'scale',
        packetType: 'status',
        batteryPct: b[3] <= 100 ? b[3] : null,
        checksumValid: checksumValid
      };
    }

    if (cmd === 0x82 || cmd === 0x88 || cmd === 0x89 || cmd === 0x8A){
      const actMap = { 0x82:'tare', 0x88:'timer_start', 0x89:'timer_stop', 0x8A:'timer_reset' };
      return {
        brand: 'varia',
        slot: 'scale',
        packetType: 'button',
        action: actMap[cmd] || 'button',
        checksumValid: checksumValid
      };
    }
    return null;
  }

  /* --- 8. Atomax Skale II (`0xFF08` / `0xEF81` 24-bit signed LE `0.1g`) --- */
  function decodeSkale(input){
    const b = toU8(input);
    if (b.length < 4) return null;
    const u24 = (b[1] | (b[2] << 8) | (b[3] << 16)) >>> 0;
    const signed = u24 >= 0x800000 ? (u24 - 0x1000000) : u24;
    if (Math.abs(signed) > 50000) return null;
    const weightG = +(signed / 10).toFixed(1);
    return {
      brand: 'skale',
      slot: 'scale',
      packetType: 'weight',
      weightG: cleanZero(weightG),
      flags: b[0]
    };
  }

  function decodeSkaleButton(input){
    const b = toU8(input);
    if (!b.length) return null;
    const code = b[0];
    return {
      brand: 'skale',
      slot: 'scale',
      packetType: 'button',
      buttonId: code,
      action: code === 1 ? 'tare' : code === 2 ? 'timer_start' : ('btn_' + code)
    };
  }

  /* --- 9. Eureka Precisa / Brewista II / Acaia-Clone OEM (`CFS-9002`, `KC200`, `0xAA 0x09 0x41`) --- */
  function decodeEureka(input){
    const b = toU8(input);
    if (b.length < 8 || b[0] !== 0xAA) return null;
    if (b[1] === 0x09 && b[2] === 0x41 && b.length >= 10){
      const timerRunning = b[3] !== 0;
      const timeS = b[4] | (b[5] << 8);
      const sign = (b[6] === 1 || b[6] === 0x2D || (b[6] & 0x80) !== 0) ? -1 : 1;
      const rawW = b[7] | (b[8] << 8);
      if (rawW > 50000) return null;
      const weightG = +(sign * (rawW / 10)).toFixed(1);
      const batteryPct = (b.length >= 11 && b[9] <= 100) ? b[9] : null;
      const lastIdx = b.length - 1;
      const ckXor = xorChecksum(b, lastIdx, 0);
      const ckBodyXor = xorChecksum(b, lastIdx, 2);
      const ckSum = sum8Checksum(b, lastIdx, 0);
      const checksumValid = (b[lastIdx] === ckXor || b[lastIdx] === ckBodyXor || b[lastIdx] === ckSum);
      if (!checksumValid) return null;
      return {
        brand: 'eureka',
        slot: 'scale',
        packetType: 'weight',
        weightG: cleanZero(weightG),
        timeS: timeS,
        timerRunning: timerRunning,
        batteryPct: batteryPct,
        checksumValid: checksumValid
      };
    }
    if (b[1] === 0x09 && b[2] === 0x41 && b.length === 9){
      const timeS9 = b[3] * 60 + b[4];
      const sign9 = (b[5] === 1 || b[5] === 0x2D || (b[5] & 0x80) !== 0) ? -1 : 1;
      const rawW9 = (b[6] << 8) | b[7];
      if (rawW9 > 50000) return null;
      const weightG9 = +(sign9 * (rawW9 / 10)).toFixed(1);
      const ckXor9 = xorChecksum(b, 8, 0);
      const ckBodyXor9 = xorChecksum(b, 8, 2);
      const ckSum9 = sum8Checksum(b, 8, 0);
      const checksumValid9 = (b[8] === ckXor9 || b[8] === ckBodyXor9 || b[8] === ckSum9);
      if (!checksumValid9) return null;
      return {
        brand: 'eureka',
        slot: 'scale',
        packetType: 'weight',
        weightG: cleanZero(weightG9),
        timeS: timeS9,
        batteryPct: null,
        checksumValid: checksumValid9
      };
    }
    /* Compact 8-byte 0xAA OEM variant: [0xAA, status, sign, wHi, wLo, min, sec, xor] */
    if (b.length >= 8 && !(b[1] === 0x09 && b[2] === 0x41)){
      const ckXor8 = xorChecksum(b, 7, 0);
      const ckBodyXor8 = xorChecksum(b, 7, 1);
      const ckSum8 = sum8Checksum(b, 7, 0);
      const checksumValid8 = (b[7] === ckXor8 || b[7] === ckBodyXor8 || b[7] === ckSum8);
      if (!checksumValid8) return null;
      const sign = (b[2] === 1 || b[2] === 0x2D || (b[2] & 0x80) !== 0) ? -1 : 1;
      const rawW = (b[3] << 8) | b[4];
      if (rawW > 50000) return null;
      const weightG = +(sign * (rawW / 10)).toFixed(1);
      return {
        brand: 'eureka',
        slot: 'scale',
        packetType: 'weight',
        weightG: cleanZero(weightG),
        stable: (b[1] & 0x01) !== 0,
        checksumValid: checksumValid8
      };
    }
    return null;
  }

  /* --- 10. Hiroia Jimmy (`>=7B`, signed 24-bit LE in `b[4..6]`, `g` & `oz`) --- */
  function decodeHiroia(input){
    const b = toU8(input);
    if (b.length < 7) return null;
    const u24 = (b[4] | (b[5] << 8) | (b[6] << 16)) >>> 0;
    const signed = u24 >= 0x800000 ? (u24 - 0x1000000) : u24;
    const isOz = b[0] >= 0x09 && b[0] <= 0x10;
    if (Math.abs(signed) > (isOz ? 200000 : 50000)) return null;
    const weightG = isOz
      ? +(((signed / 1000) * 28.3495231).toFixed(2))
      : +(signed / 10).toFixed(1);
    const rawTime = b[2] | (b[3] << 8);
    return {
      brand: 'hiroia',
      slot: 'scale',
      packetType: 'weight',
      weightG: cleanZero(weightG),
      unit: isOz ? 'oz' : 'g',
      timeS: rawTime <= 36000 ? +(rawTime / 10).toFixed(1) : null,
      mode: b[0]
    };
  }

  /* --- 11. Bluetooth SIG `0x181D` Weight Scale (`0x2A9D`) --- */
  function decodeWeightSig(input){
    const b = toU8(input);
    if (b.length < 3) return null;
    const flags = b[0];
    const raw = b[1] | (b[2] << 8);
    if (raw === 0xFFFF) return null;
    const isImperial = (flags & 0x01) === 1;
    const weightG = isImperial ? +(raw * 4.5359237).toFixed(2) : +(raw * 5.0).toFixed(1);
    return {
      brand: 'sig',
      slot: 'scale',
      packetType: 'weight',
      weightG: cleanZero(weightG),
      unit: isImperial ? 'lb' : 'g'
    };
  }

  /* --- 12. Pressensor / Smart Espresso Profiler / BLE SIG ESS (`0x181A` `0x2A6D` `0.1 Pa` + `0x2A6E` `0.01 C` + `873ae82a` `mbar`) --- */
  function decodePressensor(input, opts){
    const b = toU8(input);
    if (b.length < 2) return null;
    const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
    const chrNorm = (opts && opts.charUuid) ? normUuid(opts.charUuid) : '';
    const svcNorm = (opts && opts.serviceUuid) ? normUuid(opts.serviceUuid) : '';

    /* Official GATT ESS 0x2A6E Temperature (int16 LE, 0.01 C) */
    if (chrNorm === UUID.ESS_TEMP_CHAR){
      const rawEssTemp = dv.getInt16(0, true);
      if (rawEssTemp >= -4000 && rawEssTemp <= 15000){
        return {
          brand: 'pressensor',
          slot: 'pressure',
          packetType: 'temperature',
          tempC: +(rawEssTemp / 100).toFixed(1)
        };
      }
      return null;
    }

    let rawMbar = dv.getInt16(0, false);
    /* Official GATT ESS 0x2A6D Pressure (uint32 LE, 0.1 Pa -> / 1,000,000 = bar; up to 25 bar = 25,000,000)
       Preserves Gate 5 Pressensor 4B BE [0x23, 0x28, 0x03, 0xA2] -> 9.0 bar / 93.0C when not on ESS 0x2A6D */
    const isExplicitEss2A6D = (chrNorm === UUID.PRESSENSOR_SIG_CHAR || svcNorm === UUID.ESS_SVC || !!(opts && opts.ess2A6D));
    const looksLikeDeciPaLE = b.length === 4 && (
      isExplicitEss2A6D ||
      Math.abs(rawMbar) > 22000 ||
      (b[3] === 0x00 && (b[2] > 0x06 || dv.getInt16(2, false) > 1500 || dv.getInt16(2, false) < -200))
    );
    if (looksLikeDeciPaLE){
      const deciPa = dv.getUint32(0, true);
      if (deciPa <= 25000000){
        const barFromEss = +(deciPa / 1000000).toFixed(2);
        return {
          brand: 'pressensor',
          slot: 'pressure',
          packetType: 'pressure',
          pressureMbar: Math.round(barFromEss * 1000),
          pressureBar: cleanZero(barFromEss),
          tempC: null
        };
      }
    }
    if (rawMbar < -1500 || rawMbar > 25000) return null;
    const pressureBar = +(Math.max(-1, rawMbar / 1000)).toFixed(2);
    let tempC = null;
    if (b.length >= 4){
      const rawTemp = dv.getInt16(2, false);
      if (rawTemp >= -200 && rawTemp <= 1500){
        tempC = +(rawTemp / 10).toFixed(1);
      }
    }
    return {
      brand: 'pressensor',
      slot: 'pressure',
      packetType: 'pressure',
      pressureMbar: rawMbar,
      pressureBar: cleanZero(pressureBar),
      tempC: tempC
    };
  }

  /* --- 13. Bookoo Espresso Monitor (`0x0FFE` / `0x0FFF` / `0xFF01`, `0.01 bar` + XOR) --- */
  function decodeBookooPressure(input){
    const b = toU8(input);
    if (b.length < 6 || b.length >= 20) return null;
    if (b[0] !== 0x02 && b[0] !== 0x03) return null;
    const lastIdx = b.length - 1;
    const expectedXor = xorChecksum(b, lastIdx, 0);
    const checksumValid = (b[lastIdx] === expectedXor);
    if (!checksumValid) return null;

    let rawBarX100 = 0;
    let sign = 1;
    let batteryPct = null;

    if (b.length === 10 && (b[0] === 0x02 || b[0] === 0x03) && b[1] === 0x0C){
      sign = (b[5] === 1 || b[5] === 0x2D) ? -1 : 1;
      rawBarX100 = (b[6] << 8) | b[7];
      batteryPct = b[8] <= 100 ? b[8] : null;
      if (rawBarX100 === 0 && ((b[4] << 8) | b[5]) > 0 && ((b[4] << 8) | b[5]) <= 2500 && b[5] !== 1 && b[5] !== 0x2D){
        sign = 1;
        rawBarX100 = (b[4] << 8) | b[5];
        batteryPct = b[6] <= 100 ? b[6] : batteryPct;
      }
    } else {
      rawBarX100 = (b[2] << 8) | b[3];
      if (b.length >= 10 && rawBarX100 === 0 && ((b[4] << 8) | b[5]) > 0 && b[1] === 0x0C){
        rawBarX100 = (b[4] << 8) | b[5];
        batteryPct = b[6] <= 100 ? b[6] : null;
      } else {
        batteryPct = b[4] <= 100 ? b[4] : null;
      }
    }
    if (rawBarX100 > 2500) return null;
    const pressureBar = +(sign * (rawBarX100 / 100)).toFixed(2);
    return {
      brand: 'bookoo_pressure',
      slot: 'pressure',
      packetType: 'pressure',
      pressureBar: cleanZero(pressureBar),
      pressureMbar: Math.round(pressureBar * 1000),
      batteryPct: batteryPct,
      checksumValid: checksumValid
    };
  }

  /* --- 14. DiFluid R2 Extract Refractometer (`%TDS`, `nD20`, `tempC`, battery, auto & multi-read avg) --- */
  function estimateNd20FromTds(tdsPct){
    /* Accurate coffee aqueous refractive index relation when 4-byte RI is omitted by short firmware frame */
    return +(1.33299 + (+tdsPct || 0) * 0.001585).toFixed(5);
  }

  function decodeDiFluidR2(input){
    const b = toU8(input);
    if (b.length < 6 || b[0] !== 0xDF || b[1] !== 0xDF) return null;
    const func = b[2], cmd = b[3], dataLen = b[4];
    if (b.length < 6 + dataLen) return null;
    const expectedSum = sum8Checksum(b, 5 + dataLen);
    const checksumValid = (b[5 + dataLen] === expectedSum);
    if (!checksumValid) return null;

    if (func === 0x02 && dataLen >= 1){
      const batByte = b[5] <= 100 ? b[5] : (dataLen >= 2 && b[6] <= 100 ? b[6] : null);
      return {
        brand: 'difluid',
        slot: 'refractometer',
        packetType: 'battery',
        batteryPct: batByte,
        checksumValid: checksumValid
      };
    }

    if (func === 0x03 && cmd === 0xFE && dataLen >= 1){
      const errCode = (dataLen >= 2 && (b[5] === 0x00 || b[5] === 0xFE)) ? b[6] : b[5];
      const errMap = {
        0x01: 'error_temp_out_of_range',
        0x02: 'error_no_liquid',
        0x03: 'error_no_liquid',
        0x04: 'error_out_of_range',
        0x05: 'error_out_of_range'
      };
      return {
        brand: 'difluid',
        slot: 'refractometer',
        packetType: 'status',
        isError: true,
        statusCode: errCode,
        statusText: errMap[errCode] || ('error_' + errCode),
        checksumValid: checksumValid
      };
    }

    if (func === 0x03 && dataLen >= 2){
      const pkg = b[5];
      if (pkg === 0x00){
        const code = b[6];
        const map = {
          0x00: 'finished',
          0x0A: 'measuring',
          0x0B: 'measuring',
          0x02: 'error_no_liquid',
          0x03: 'error_no_liquid',
          0x04: 'error_out_of_range',
          0x05: 'auto_ready'
        };
        return {
          brand: 'difluid',
          slot: 'refractometer',
          packetType: 'status',
          statusCode: code,
          statusText: map[code] || ('status_' + code),
          checksumValid: checksumValid
        };
      }
      if (pkg === 0x01 && dataLen >= 3){
        if (dataLen >= 5){
          const prismRaw = (b[6] << 8) | b[7];
          const tankRaw = (b[8] << 8) | b[9];
          const tempC = (tankRaw === 0 && prismRaw > 0)
            ? +(prismRaw / 10.0).toFixed(2)
            : +((prismRaw + tankRaw) / 20.0).toFixed(2);
          return {
            brand: 'difluid',
            slot: 'refractometer',
            packetType: 'temperature',
            tempC: tempC,
            prismTempC: +(prismRaw / 10).toFixed(1),
            tankTempC: tankRaw > 0 ? +(tankRaw / 10).toFixed(1) : +(prismRaw / 10).toFixed(1),
            checksumValid: checksumValid
          };
        }
        const singleTempRaw = (b[6] << 8) | b[7];
        if (singleTempRaw <= 1000){
          const singleTempC = +(singleTempRaw / 10.0).toFixed(2);
          return {
            brand: 'difluid',
            slot: 'refractometer',
            packetType: 'temperature',
            tempC: singleTempC,
            prismTempC: +(singleTempRaw / 10).toFixed(1),
            tankTempC: +(singleTempRaw / 10).toFixed(1),
            checksumValid: checksumValid
          };
        }
      }
      if ((pkg === 0x02 || pkg === 0x03 || pkg === 0x04) && dataLen >= 3){
        /* Guard against standalone 4-byte Refractive Index packets on pkg 0x03/0x04 so RI bytes are never misread as TDS */
        if ((pkg === 0x03 || pkg === 0x04) && (dataLen === 5 || dataLen === 6)){
          const u32 = (((b[6] << 24) >>> 0) + (b[7] << 16) + (b[8] << 8) + b[9]);
          if ((u32 >= 133000 && u32 <= 155000) || (u32 >= 1330000 && u32 <= 1550000)){
            const riStandalone = u32 >= 1000000 ? +(u32 / 1000000.0).toFixed(5) : +(u32 / 100000.0).toFixed(5);
            return {
              brand: 'difluid',
              slot: 'refractometer',
              packetType: 'refractive_index',
              refractiveIndex: riStandalone,
              nD20: riStandalone,
              checksumValid: checksumValid
            };
          }
        }
        const tdsRaw = (b[6] << 8) | b[7];
        if (tdsRaw <= 3500){
          const isMultiAvg = (pkg === 0x03 || cmd === 0x01);
          const tds = +(tdsRaw / 100.0).toFixed(2);
          const brix = +(tds / 0.85).toFixed(2);
          let refractiveIndex = null;
          let readCount = 1;
          if (dataLen >= 7){
            const riRaw = (((b[8] << 24) >>> 0) + (b[9] << 16) + (b[10] << 8) + b[11]);
            if (riRaw >= 130000 && riRaw <= 155000){
              refractiveIndex = +(riRaw / 100000.0).toFixed(5);
            } else if (riRaw >= 1300000 && riRaw <= 1550000){
              refractiveIndex = +(riRaw / 1000000.0).toFixed(5);
            }
          }
          if (dataLen >= 8 && b[12] >= 1 && b[12] <= 20){
            readCount = b[12];
          } else if (dataLen === 4 && b[8] >= 1 && b[8] <= 20){
            readCount = b[8];
          } else if (dataLen === 6 && b[10] >= 1 && b[10] <= 20){
            readCount = b[10];
          }
          if (refractiveIndex === null) refractiveIndex = estimateNd20FromTds(tds);
          return {
            brand: 'difluid',
            slot: 'refractometer',
            packetType: isMultiAvg ? 'average_result' : 'result',
            isAverage: isMultiAvg,
            autoRead: cmd >= 0x02,
            cmd: cmd,
            pkg: pkg,
            readCount: readCount,
            tds: tds,
            brix: brix,
            refractiveIndex: refractiveIndex,
            nD20: refractiveIndex,
            checksumValid: checksumValid
          };
        }
      }
    }
    return { brand:'difluid', slot:'refractometer', packetType:'ack', func:func, cmd:cmd, checksumValid:checksumValid };
  }

  /* --- 15. DiFluid Omni Roast & Particle Analyzer (`Agtron`, `Roast Delta`, `D10/D50/D90`, `8-32` Histogram Bins) --- */
  function agtronToRoastSwatch(agtronVal, mode){
    const n = Number(agtronVal);
    if (!Number.isFinite(n) || n <= 0) return { roast:'medium', roastKey:'medium', label:'Medium', agtronGroundEst:60 };
    const g = mode === 'bean' ? +(n + 6.5).toFixed(1) : +n.toFixed(1);
    if (g >= 75) return { roast:'light', roastKey:g >= 86 ? 'ultra-light' : 'light', label:g >= 86 ? 'Ultra-Light / Nordic' : 'Light / Nordic', agtronGroundEst:g };
    if (g >= 65) return { roast:'light-medium', roastKey:'medium-light', label:'Light-Medium', agtronGroundEst:g };
    if (g >= 55) return { roast:'medium', roastKey:'medium', label:'Medium', agtronGroundEst:g };
    if (g >= 45) return { roast:'medium-dark', roastKey:'medium-dark', label:'Medium-Dark', agtronGroundEst:g };
    return { roast:'dark', roastKey:'dark', label:'Dark', agtronGroundEst:g };
  }

  function decodeDiFluidOmni(input){
    const b = toU8(input);
    if (b.length < 6 || b[0] !== 0xDF || b[1] !== 0xDF) return null;
    const func = b[2], cmd = b[3], dataLen = b[4];
    if (b.length < 6 + dataLen) return null;
    const checksumValid = (b[5 + dataLen] === sum8Checksum(b, 5 + dataLen));
    if (!checksumValid) return null;

    if (func === 0x02 && dataLen >= 1){
      return {
        brand: 'difluid_omni',
        slot: 'omni',
        packetType: 'battery',
        batteryPct: b[5] <= 100 ? b[5] : null,
        checksumValid: checksumValid
      };
    }

    if (func !== 0x04 || dataLen < 2) return null;

    const pkg = b[5];
    if (pkg === 0x01 && dataLen >= 5){
      const beanRaw = (b[6] << 8) | b[7];
      const groundRaw = (b[8] << 8) | b[9];
      const beanAgtron = beanRaw > 0 ? +(beanRaw / 10).toFixed(1) : null;
      const groundAgtron = groundRaw > 0 ? +(groundRaw / 10).toFixed(1) : null;
      const primary = groundAgtron !== null ? groundAgtron : beanAgtron;
      const sw = agtronToRoastSwatch(primary, groundAgtron !== null ? 'ground' : 'bean');
      return {
        brand: 'difluid_omni',
        slot: 'omni',
        packetType: 'agtron',
        beanAgtron: beanAgtron,
        groundAgtron: groundAgtron,
        agtron: primary,
        roastDelta: (beanAgtron !== null && groundAgtron !== null) ? +(groundAgtron - beanAgtron).toFixed(1) : null,
        suggestedRoast: sw.roast,
        roastKey: sw.roastKey,
        checksumValid: checksumValid
      };
    }

    if (pkg === 0x02 && dataLen >= 7){
      const d10Um = +(((b[6] << 8) | b[7]) / 10).toFixed(1);
      const d50Um = +(((b[8] << 8) | b[9]) / 10).toFixed(1);
      const d90Um = +(((b[10] << 8) | b[11]) / 10).toFixed(1);
      const span = d50Um > 0 ? +((d90Um - d10Um) / d50Um).toFixed(2) : null;
      return {
        brand: 'difluid_omni',
        slot: 'omni',
        packetType: 'psd',
        d10Um: d10Um,
        d50Um: d50Um,
        d90Um: d90Um,
        span: span,
        checksumValid: checksumValid
      };
    }

    /* pkg 0x03: 8-32 Bin Particle Size Distribution Histogram */
    if (pkg === 0x03 && dataLen >= 10){
      const binCount = b[6];
      if (binCount < 8 || binCount > 32 || dataLen < 2 + binCount) return null;
      const minUm = 50;
      const maxUm = 1600;
      const logRatio = Math.log(maxUm / minUm);
      let rawSum = 0;
      const weights = new Array(binCount);
      const isUint16Bins = dataLen >= 2 + binCount * 2;
      for (let i = 0; i < binCount; i++){
        const w = isUint16Bins ? ((b[7 + i * 2] << 8) | b[8 + i * 2]) : b[7 + i];
        weights[i] = w;
        rawSum += w;
      }
      const bins = [];
      for (let j = 0; j < binCount; j++){
        const lo = Math.round(minUm * Math.exp(logRatio * (j / binCount)));
        const hi = Math.round(minUm * Math.exp(logRatio * ((j + 1) / binCount)));
        const pct = rawSum > 0 ? +((weights[j] / rawSum) * 100).toFixed(2) : 0;
        bins.push({ index:j, lowerUm:lo, upperUm:hi, pct:pct });
      }
      return {
        brand: 'difluid_omni',
        slot: 'omni',
        packetType: 'histogram',
        binCount: binCount,
        bins: bins,
        checksumValid: checksumValid
      };
    }

    return { brand:'difluid_omni', slot:'omni', packetType:'ack', cmd:cmd, checksumValid:checksumValid };
  }

  /* --- 16. xBloom Original (`0x58 0x42`) & Studio (`0x58 0x02 0x07` + CRC16-Kermit) Telemetry --- */
  function decodeXBloom(input){
    const b = toU8(input);
    if (b.length < 6 || b[0] !== 0x58) return null;

    if (b[1] === 0x42){
      const opcode = b[2];
      const payloadLen = b[3];
      if (b.length < 4 + payloadLen + 2) return null;
      const crc = crc16Modbus(b.subarray(0, 4 + payloadLen));
      const checksumValid = (b[4 + payloadLen] === crc[0] && b[5 + payloadLen] === crc[1]);
      if (!checksumValid) return null;

      const stageMap = { 0:'idle', 1:'grinding', 2:'blooming', 3:'pouring', 4:'draining', 5:'done' };
      const stageCode = payloadLen >= 1 ? b[4] : 0;
      const tempC = payloadLen >= 2 ? b[5] : null;
      const weightG = payloadLen >= 4 ? +(((b[6] << 8) | b[7]) / 10).toFixed(1) : null;
      const stepIndex = payloadLen >= 5 ? b[8] : 0;
      return {
        brand: 'xbloom',
        slot: 'machine',
        packetType: 'telemetry',
        opcode: opcode,
        stage: stageMap[stageCode] || 'active',
        tempC: tempC,
        weightG: weightG !== null ? cleanZero(weightG) : null,
        stepIndex: stepIndex,
        preGroundSafe: opcode === 0x44,
        checksumValid: checksumValid
      };
    }

    /* xBloom Studio real-hardware telemetry / ACK frame (`58 02 07 ...` / `58 01 ...` + CRC16-Kermit) */
    if (b[1] === 0x02 || b[1] === 0x01){
      const bodyEnd = b.length - 2;
      const kCrc = crc16Kermit(b.subarray(0, bodyEnd));
      const mCrc = crc16Modbus(b.subarray(0, bodyEnd));
      const ck0 = b[bodyEnd], ck1 = b[bodyEnd + 1];
      const crcOk = (ck0 === kCrc[0] && ck1 === kCrc[1]) ||
                    (ck1 === kCrc[0] && ck0 === kCrc[1]) ||
                    (ck0 === mCrc[0] && ck1 === mCrc[1]);
      if (!crcOk) return null;

      if (b[1] === 0x01){
        return {
          brand: 'xbloom',
          slot: 'machine',
          packetType: 'ack',
          opcode: b[2],
          stage: 'active',
          checksumValid: true
        };
      }

      const studioStageMap = {
        0x00:'idle', 0x01:'idle', 0x1F:'armed', 0x23:'grinding',
        0x33:'blooming', 0x3B:'pouring', 0x43:'pouring', 0x41:'done',
        0x02:'grinding', 0x03:'pouring', 0x04:'draining', 0x05:'done'
      };
      const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
      let c1Idx = -1;
      for (let i = 3; i < bodyEnd; i++){
        if (b[i] === 0xC1){ c1Idx = i; break; }
      }

      let stageCode = 0x01;
      let tempC = null;
      let weightG = null;
      if (c1Idx >= 3){
        stageCode = (c1Idx + 1 < bodyEnd) ? b[c1Idx + 1] : 0x01;
        if (c1Idx + 6 <= bodyEnd){
          const fExp = ((b[c1Idx + 5] & 0x7F) << 1) | (b[c1Idx + 4] >>> 7);
          if (fExp >= 115 && fExp <= 142){
            const fw = dv.getFloat32(c1Idx + 2, true);
            if (Number.isFinite(fw) && Math.abs(fw) <= 5000) weightG = +(fw.toFixed(1));
          }
        }
        if (weightG === null && c1Idx + 4 <= bodyEnd){
          const iw = dv.getInt16(c1Idx + 2, true);
          if (Math.abs(iw) <= 30000) weightG = +(iw / 10).toFixed(1);
        }
      } else {
        stageCode = bodyEnd > 4 ? b[4] : b[3];
        if (bodyEnd > 5 && b[5] >= 20 && b[5] <= 105) tempC = b[5];
        if (bodyEnd >= 8){
          const iw2 = dv.getInt16(6, true);
          if (Math.abs(iw2) <= 30000) weightG = +(iw2 / 10).toFixed(1);
        }
      }

      return {
        brand: 'xbloom',
        slot: 'machine',
        variant: 'studio',
        packetType: 'telemetry',
        opcode: b[2],
        subType: b[3],
        stage: studioStageMap[stageCode] || 'active',
        tempC: tempC,
        weightG: weightG !== null ? cleanZero(weightG) : null,
        checksumValid: true
      };
    }
    return null;
  }

  /* --- 17. Fellow Stagg EKG+ Kettle (`0x1820` / `0x2A80` / `2291c4b5-...` Live Temp, Target, Hold & Power) --- */
  function convertStaggRawTempToC(rawVal, unitByte){
    const isF = unitByte === 1 || (unitByte !== 0 && rawVal > 105);
    if (isF){
      return { tempC: +(((rawVal - 32) * 5 / 9).toFixed(1)), unit: 'F' };
    }
    /* Handle 0.5C half-degree tick firmwares (106..208 ticks = 53.0..104.0C when unit === 0) */
    if (unitByte === 0 && rawVal > 105 && rawVal <= 212){
      return { tempC: +((rawVal / 2).toFixed(1)), unit: 'C' };
    }
    return { tempC: +(rawVal.toFixed(1)), unit: 'C' };
  }

  function decodeStaggKettle(input){
    const b = toU8(input);
    if (b.length < 2) return null;

    /* Legacy back-compat framed 0xEF 0xDD 0x0A Stagg EKG+ telemetry packet */
    if (b[0] === 0xEF && b[1] === 0xDD && b.length >= 8 && b[2] === 0x0A){
      const payloadEnd = b.length - 2;
      const cks = acaiaChecksum(b.subarray(3, payloadEnd));
      const checksumValid = (b[payloadEnd] === cks[0] && b[payloadEnd + 1] === cks[1]);
      if (checksumValid){
        const curX10 = (b[3] << 8) | b[4];
        const tgtX10 = (b[5] << 8) | b[6];
        const flags = b.length >= 10 ? b[7] : 0;
        const tempC = +(curX10 / 10).toFixed(1);
        const targetTempC = +(tgtX10 / 10).toFixed(1);
        return {
          brand: 'stagg_ekg_plus',
          slot: 'machine',
          packetType: 'kettle',
          tempC: tempC,
          targetTempC: targetTempC,
          hold: (flags & 0x01) !== 0,
          heating: (flags & 0x02) !== 0,
          power: (flags & 0x02) !== 0 || (flags & 0x01) !== 0,
          lifted: (flags & 0x04) !== 0,
          unit: (flags & 0x08) ? 'F' : 'C',
          checksumValid: checksumValid
        };
      }
    }

    /* Real Fellow Stagg EKG+ RX notifications: EF DD [type 0x00..0x03] ... */
    if (b[0] === 0xEF && b[1] === 0xDD && b.length >= 4 && b[2] <= 0x03){
      const rType = b[2];
      const hasSeqPrefix = b.length >= 6;
      if (hasSeqPrefix && (((b[3] + b[4]) & 0xFF) !== b[5])) return null;
      const valByte = hasSeqPrefix ? b[4] : b[3];
      const unitOrAux = hasSeqPrefix ? (b.length >= 7 ? b[6] : 0xFF) : (b.length >= 5 ? b[4] : 0xFF);

      if (rType === 0x00){
        const lifted0 = valByte === 2 || valByte === 0xFF || unitOrAux === 2;
        const powerOn = valByte === 1 || (valByte > 0 && !lifted0);
        return {
          brand: 'stagg_ekg_plus',
          slot: 'machine',
          packetType: 'kettle',
          subType: 'power',
          tempC: null,
          targetTempC: null,
          power: powerOn,
          heating: powerOn && !lifted0,
          lifted: lifted0
        };
      }
      if (rType === 0x01){
        return {
          brand: 'stagg_ekg_plus',
          slot: 'machine',
          packetType: 'kettle',
          subType: 'hold',
          tempC: null,
          targetTempC: null,
          hold: valByte !== 0
        };
      }
      if (rType === 0x02){
        const convTgt = convertStaggRawTempToC(valByte, unitOrAux <= 1 ? unitOrAux : 0xFF);
        if (convTgt.tempC < 35 || convTgt.tempC > 105) return null;
        return {
          brand: 'stagg_ekg_plus',
          slot: 'machine',
          packetType: 'kettle',
          subType: 'target_temp',
          tempC: null,
          targetTempC: convTgt.tempC,
          unit: convTgt.unit
        };
      }
      if (rType === 0x03){
        if (valByte === 0xFF || valByte === 0x00){
          return {
            brand: 'stagg_ekg_plus',
            slot: 'machine',
            packetType: 'kettle',
            subType: 'lifted',
            tempC: null,
            targetTempC: null,
            lifted: true,
            heating: false
          };
        }
        const convCur = convertStaggRawTempToC(valByte, unitOrAux <= 1 ? unitOrAux : 0xFF);
        if (convCur.tempC < 5 || convCur.tempC > 108) return null;
        return {
          brand: 'stagg_ekg_plus',
          slot: 'machine',
          packetType: 'kettle',
          subType: 'current_temp',
          tempC: convCur.tempC,
          targetTempC: null,
          lifted: false,
          unit: convCur.unit
        };
      }
    }

    /* Direct 2-byte / 4-byte 0x2A80 Stagg EKG+ notification: [modeFlags, currentTemp, targetTemp?, unitFlag?] */
    if (b.length >= 2 && b.length <= 5 && b[0] <= 0x1F){
      const rawTemp = b[1];
      const isFahrenheit = (b.length >= 4 && b[3] === 1) || rawTemp > 105;
      const tempC = isFahrenheit ? +(((rawTemp - 32) * 5 / 9).toFixed(1)) : +rawTemp.toFixed(1);
      if (tempC < 10 || tempC > 106) return null;
      let targetTempC = null;
      if (b.length >= 3 && b[2] >= 40 && b[2] <= 212){
        targetTempC = (isFahrenheit || b[2] > 105) ? +(((b[2] - 32) * 5 / 9).toFixed(1)) : +b[2].toFixed(1);
      }
      return {
        brand: 'stagg_ekg_plus',
        slot: 'machine',
        packetType: 'kettle',
        tempC: tempC,
        targetTempC: targetTempC,
        hold: (b[0] & 0x01) !== 0,
        heating: (b[0] & 0x02) !== 0,
        power: (b[0] & 0x02) !== 0 || (b[0] & 0x01) !== 0,
        lifted: (b[0] & 0x04) !== 0,
        unit: isFahrenheit ? 'F' : 'C'
      };
    }
    return null;
  }

  /* --- 18. Standard UART / NUS ASCII Text Scale (`ST,GS,  18.50 g\r\n`, `-12.4g`) --- */
  function isPrintableAsciiScaleBytes(b){
    if (!b || b.length < 2 || b.length > 64) return false;
    for (let i = 0; i < b.length; i++){
      const c = b[i];
      if (!((c >= 0x20 && c <= 0x7E) || c === 0x0D || c === 0x0A || c === 0x09 || c === 0x00)){
        return false;
      }
    }
    return true;
  }

  function asciiBytesToStr(b){
    let s = '';
    for (let i = 0; i < b.length; i++){
      if (b[i] === 0x00) break;
      s += String.fromCharCode(b[i]);
    }
    return s;
  }

  function decodeAsciiScale(input){
    let rawStr = '';
    if (typeof input === 'string'){
      rawStr = input.trim();
    } else {
      const b = toU8(input);
      if (!isPrintableAsciiScaleBytes(b)) return null;
      rawStr = asciiBytesToStr(b).trim();
    }
    if (!rawStr || rawStr.length < 2 || !/[0-9]/.test(rawStr)) return null;
    const m = rawStr.match(/^(?:(ST|US|SI|S|U)\s*,\s*(?:GS|NT|TR|PT)\s*,\s*)?(?:[A-Za-z]{1,4}\s*[:=]\s*)?([+-]?\s*\d+(?:\.\d+)?)\s*(kg|g|oz|lb|ml)?$/i);
    if (!m) return null;
    const numVal = Number(m[2].replace(/\s+/g, ''));
    if (!Number.isFinite(numVal)) return null;
    const unitRaw = m[3] ? m[3].toLowerCase() : 'g';
    let weightG = numVal;
    if (unitRaw === 'kg') weightG = numVal * 1000;
    else if (unitRaw === 'oz') weightG = numVal * 28.3495231;
    else if (unitRaw === 'lb') weightG = numVal * 453.59237;
    if (Math.abs(weightG) > 50000) return null;
    const stabToken = m[1] ? m[1].toUpperCase() : '';
    const stable = (stabToken === 'ST' || stabToken === 'SI' || stabToken === 'S')
      ? true
      : ((stabToken === 'US' || stabToken === 'U') ? false : null);
    const out = {
      brand: 'ascii',
      slot: 'scale',
      packetType: 'weight',
      weightG: cleanZero(+(weightG.toFixed(2))),
      unit: unitRaw || 'g'
    };
    if (stable !== null) out.stable = stable;
    return out;
  }

  function isPrintableAsciiScaleFrame(b){
    return !!decodeAsciiScale(b);
  }

  function createAsciiStreamParser(){
    const ring = createMtuRingBuffer(MAX_RING_BYTES);
    return {
      reset: function(){ ring.clear(); },
      length: function(){ return ring.length(); },
      push: function(chunk){
        ring.append(chunk);
        const results = [];
        const buf = ring.peek();
        if (!buf.length) return results;
        let lastBreak = -1;
        for (let i = 0; i < buf.length; i++){
          if (buf[i] === 0x0A || buf[i] === 0x0D) lastBreak = i;
        }
        if (lastBreak >= 0){
          const lineBytes = buf.subarray(0, lastBreak + 1);
          const text = asciiBytesToStr(lineBytes);
          const lines = text.split(/[\r\n]+/);
          for (let li = 0; li < lines.length; li++){
            const ln = lines[li].trim();
            if (!ln) continue;
            const parsed = decodeAsciiScale(ln);
            if (parsed) results.push(parsed);
          }
          ring.consume(lastBreak + 1);
          return results;
        }
        if (isPrintableAsciiScaleBytes(buf)){
          const txt = asciiBytesToStr(buf).trim();
          if (/[a-z]$/i.test(txt)){
            const single = decodeAsciiScale(txt);
            if (single){
              results.push(single);
              ring.clear();
            }
          }
        } else {
          ring.clear();
        }
        return results;
      }
    };
  }

  /* ============================================================================
   * STREAM PARSERS & 0xFFF0 / 0x1820 MAGIC-BYTE AUTO-PROMOTION
   * ============================================================================ */
  function createDiFluidStreamParser(mode){
    const ring = createMtuRingBuffer(MAX_RING_BYTES);
    const targetMode = String(mode || 'auto').toLowerCase();
    return {
      reset: function(){ ring.clear(); },
      length: function(){ return ring.length(); },
      push: function(chunk){
        ring.append(chunk);
        const results = [];
        while (ring.length() >= 6){
          const buf = ring.peek();
          let start = -1;
          for (let i = 0; i <= buf.length - 2; i++){
            if (buf[i] === 0xDF && buf[i + 1] === 0xDF){ start = i; break; }
          }
          if (start < 0){
            const keepTail = buf[buf.length - 1] === 0xDF ? 1 : 0;
            ring.consume(buf.length - keepTail);
            break;
          }
          if (start > 0){
            ring.consume(start);
            if (ring.length() < 6) break;
          }
          const cur = ring.peek();
          const dataLen = cur[4];
          const frameLen = 6 + dataLen;
          if (frameLen > 128){
            ring.consume(2);
            continue;
          }
          if (cur.length < frameLen) break;

          const slice = cur.subarray(0, frameLen);
          const sumOk = (slice[frameLen - 1] === sum8Checksum(slice, frameLen - 1));
          if (!sumOk){
            ring.consume(2);
            continue;
          }

          let parsed = null;
          if (targetMode === 'scale'){
            parsed = decodeDiFluidScale(slice);
          } else if (targetMode === 'omni'){
            parsed = decodeDiFluidOmni(slice);
          } else if (targetMode === 'r2'){
            parsed = slice[2] === 0x04 ? decodeDiFluidOmni(slice) : decodeDiFluidR2(slice);
          } else {
            if (slice[2] === 0x04){
              parsed = decodeDiFluidOmni(slice);
            } else if (slice[2] === 0x03 && (slice[3] === 0x00 || slice[3] === 0x01) && dataLen >= 13){
              parsed = decodeDiFluidScale(slice);
            } else if (slice[2] === 0x03 && slice[3] === 0x02 && dataLen === 1){
              parsed = decodeDiFluidScale(slice);
            } else {
              const r2Cand = decodeDiFluidR2(slice);
              if (r2Cand && r2Cand.packetType !== 'ack' && !(slice[3] === 0x01 && r2Cand.packetType === 'status' && dataLen >= 4)){
                parsed = r2Cand;
              } else {
                const scCand = decodeDiFluidScale(slice);
                parsed = (scCand && scCand.packetType !== 'ack') ? scCand : (r2Cand || scCand);
              }
            }
          }
          if (parsed) results.push(parsed);
          ring.consume(frameLen);
        }
        return results;
      }
    };
  }

  function createTimemoreOspStreamParser(){
    const ring = createMtuRingBuffer(MAX_RING_BYTES);
    return {
      reset: function(){ ring.clear(); },
      length: function(){ return ring.length(); },
      push: function(chunk){
        ring.append(chunk);
        const results = [];
        while (ring.length() >= 8){
          const buf = ring.peek();
          let start = -1;
          for (let i = 0; i <= buf.length - 2; i++){
            if (buf[i] === 0xA5 && buf[i + 1] === 0x5A){ start = i; break; }
          }
          if (start < 0){
            const keepTail = buf[buf.length - 1] === 0xA5 ? 1 : 0;
            ring.consume(buf.length - keepTail);
            break;
          }
          if (start > 0){
            ring.consume(start);
            if (ring.length() < 8) break;
          }
          const cur = ring.peek();
          const payloadLen = (cur[4] << 8) | cur[5];
          const frameLen = 8 + payloadLen;
          if (payloadLen > 64){
            ring.consume(2);
            continue;
          }
          if (cur.length < frameLen) break;
          const slice = cur.subarray(0, frameLen);
          const parsed = decodeTimemore(slice);
          if (parsed){
            results.push(parsed);
            ring.consume(frameLen);
          } else {
            ring.consume(2);
          }
        }
        return results;
      }
    };
  }

  function createVariaStreamParser(){
    const ring = createMtuRingBuffer(MAX_RING_BYTES);
    return {
      reset: function(){ ring.clear(); },
      length: function(){ return ring.length(); },
      push: function(chunk){
        ring.append(chunk);
        const results = [];
        while (ring.length() >= 5){
          const buf = ring.peek();
          let start = -1;
          for (let i = 0; i < buf.length; i++){
            if (buf[i] === 0xFA || buf[i] === 0xFB || buf[i] === 0x55){ start = i; break; }
          }
          if (start < 0){
            ring.clear();
            break;
          }
          if (start > 0){
            ring.consume(start);
            if (ring.length() < 5) break;
          }
          const cur = ring.peek();
          const len = cur[2];
          const frameLen = 4 + len;
          if (len < 1 || len > 32){
            ring.consume(1);
            continue;
          }
          if (cur.length < frameLen) break;
          const slice = cur.subarray(0, frameLen);
          const parsed = decodeVaria(slice);
          if (parsed){
            results.push(parsed);
            ring.consume(frameLen);
          } else {
            ring.consume(1);
          }
        }
        return results;
      }
    };
  }

  function createBookooStreamParser(){
    const ring = createMtuRingBuffer(MAX_RING_BYTES);
    return {
      reset: function(){ ring.clear(); },
      length: function(){ return ring.length(); },
      push: function(chunk){
        ring.append(chunk);
        const results = [];
        while (ring.length() >= 20){
          const buf = ring.peek();
          let start = -1;
          for (let i = 0; i <= buf.length - 2; i++){
            if (buf[i] === 0x03 && (buf[i + 1] === 0x0B || buf[i + 1] === 0xCE)){ start = i; break; }
          }
          if (start < 0){
            const keepTail = buf[buf.length - 1] === 0x03 ? 1 : 0;
            ring.consume(buf.length - keepTail);
            break;
          }
          if (start > 0){
            ring.consume(start);
            if (ring.length() < 20) break;
          }
          const cur = ring.peek();
          const slice = cur.subarray(0, 20);
          const parsed = decodeBookoo(slice);
          if (parsed){
            results.push(parsed);
            ring.consume(20);
          } else {
            ring.consume(2);
          }
        }
        return results;
      }
    };
  }

  /**
   * Deterministic Magic-Byte Protocol Disambiguator (`0xFFF0`, `0xFFE0`, `0xFFB0`, `0x181D`, `0x1820` Collision Guard)
   */
  function detectProtocolFromBytes(input, context){
    const b = toU8(input);
    const ctx = context || {};
    const devName = String(ctx.deviceName || '');
    const svc = normUuid(ctx.serviceUuid || '');
    const chr = normUuid(ctx.charUuid || '');
    if (b.length < 2) return null;

    if (b[0] === 0xDF && b[1] === 0xDF){
      if (b.length >= 3 && b[2] === 0x04) return 'difluid_omni';
      if (ctx.slot === 'omni') return 'difluid_omni';
      if (ctx.slot === 'scale' || svc === UUID.DIFLUID_SCALE_SVC || svc === UUID.DIFLUID_SCALE_ALT_SVC || /microbalance|dft-?s|df-?s/i.test(devName)){
        return 'difluid';
      }
      if (ctx.slot === 'refractometer' || svc === UUID.DIFLUID_SVC || /^0e140001-/.test(svc) || /r2|extract|refract/i.test(devName)){
        if (ctx.slot !== 'refractometer' && b.length >= 5 && b[2] === 0x03 && b[4] >= 13) return 'difluid';
        return 'difluid_r2';
      }
      return 'difluid';
    }
    if (b[0] === 0xEF && b[1] === 0xDD){
      if (ctx.slot === 'machine' || ctx.slot === 'kettle' || chr === UUID.STAGG_EKG_ALT_CHAR || /stagg|ekg|fellow/i.test(devName) || (b.length >= 8 && b[2] === 0x0A) || (b.length >= 4 && b.length <= 6 && b[2] <= 0x03 && ctx.slot !== 'scale')){
        return 'stagg_ekg_plus';
      }
      return 'acaia';
    }
    if (b[0] === 0xA5 && b[1] === 0x5A) return 'timemore';
    if (b[0] === 0x58 && (b[1] === 0x42 || (b.length >= 3 && (b[1] === 0x02 || b[1] === 0x01) && b[2] === 0x07) || decodeXBloom(b))){
      return 'xbloom';
    }
    if (b[0] === 0x01 && b[1] === 0x02 && b.length >= 9){
      if (decodeFelicita(b)) return 'felicita';
    }
    if (b[0] === 0xFA || b[0] === 0xFB || b[0] === 0x55){
      if (decodeVaria(b)) return 'varia';
      if (b.length < 5 && !(b[0] === 0x55 && isPrintableAsciiScaleBytes(b))) return 'varia';
    }
    if (b[0] === 0xAA){
      if ((b.length >= 3 && b[1] === 0x09 && b[2] === 0x41) || decodeEureka(b)) return 'eureka';
    }
    if (b[0] === 0x03){
      if (chr === UUID.BOOKOO_EM_NOTIFY || ctx.slot === 'pressure'){
        if (decodeBookooPressure(b)) return 'bookoo_pressure';
      }
      if ((b[1] === 0x0B || b[1] === 0xCE) && b.length >= 20) return 'bookoo';
      if ((b[1] === 0xCE || b[1] === 0xCA || b[1] === 0x0A || b[1] === 0xAA || b[1] === 0x0B) && (b.length === 7 || b.length === 10)){
        /* Prevent chunk 1 of a 20B Bookoo frame (0x03 0x0B/0xCE) from falsely locking onto Decent */
        if (!(b.length === 10 && (b[1] === 0x0B || b[1] === 0xCE) && (b[6] === 0x2B || b[6] === 0x2D)) && decodeDecent(b, { strictXor: true })){
          return 'decent';
        }
      }
    }
    if (b[0] === 0x02 && (chr === UUID.BOOKOO_EM_NOTIFY || ctx.slot === 'pressure')){
      if (decodeBookooPressure(b)) return 'bookoo_pressure';
    }
    if (decodeAsciiScale(b) || (isPrintableAsciiScaleBytes(b) && /^(?:ST|US|SI)\s*,/i.test(asciiBytesToStr(b)))){
      return 'ascii';
    }
    if (svc === UUID.WEIGHT_SIG_SVC && b.length >= 8 && (b[0] & 0x02) === 0){
      if (decodeTimemore(b)) return 'timemore';
    }
    if (svc === UUID.ACAIA_LEGACY_SVC && /stagg|ekg|fellow/i.test(devName)){
      return 'stagg_ekg_plus';
    }
    return null;
  }

  /**
   * GATT Service + Characteristic + Device Name Signature Disambiguator
   */
  function detectGattProfile(services, deviceName, slotHint){
    const name = String(deviceName || '');
    const slot = String(slotHint || 'scale').toLowerCase();
    const svcMap = {};
    (services || []).forEach(function(s){
      const su = normUuid(s.uuid);
      const chars = (s.characteristics || []).map(function(c){
        return { uuid:normUuid(c.uuid), raw:c, properties:c.properties || null };
      });
      svcMap[su] = { uuid:su, raw:s, chars:chars };
    });

    function findChar(su, cu){
      const sv = svcMap[su];
      if (!sv) return null;
      for (let i = 0; i < sv.chars.length; i++){
        if (sv.chars[i].uuid === cu) return sv.chars[i];
      }
      return null;
    }

    function canNotify(c){
      return !!(c && (!c.properties || c.properties.notify || c.properties.indicate));
    }

    function canWrite(c){
      return !!(c && (!c.properties || c.properties.write || c.properties.writeWithoutResponse));
    }

    function hasExplicitWrite(c){
      return !!(c && c.properties && (c.properties.write === true || c.properties.writeWithoutResponse === true));
    }

    function pickNotifyAndWrite(svcObj, prefNotifyUuids, prefWriteUuids){
      if (!svcObj || !svcObj.chars.length) return { notify:null, write:null, altWrite:null, extraNotifyUuids:[] };
      let nChar = null;
      for (let ni = 0; ni < prefNotifyUuids.length; ni++){
        const candN = findChar(svcObj.uuid, prefNotifyUuids[ni]);
        if (candN && canNotify(candN)){ nChar = candN; break; }
      }
      if (!nChar){
        for (let ci = 0; ci < svcObj.chars.length; ci++){
          if (canNotify(svcObj.chars[ci])){ nChar = svcObj.chars[ci]; break; }
        }
      }
      if (!nChar) nChar = svcObj.chars[0] || null;

      const wList = [];
      for (let wi = 0; wi < prefWriteUuids.length; wi++){
        const candW = findChar(svcObj.uuid, prefWriteUuids[wi]);
        if (candW && canWrite(candW) && wList.indexOf(candW) < 0) wList.push(candW);
      }
      for (let cwi = 0; cwi < svcObj.chars.length; cwi++){
        const anyW = svcObj.chars[cwi];
        if (canWrite(anyW) && wList.indexOf(anyW) < 0) wList.push(anyW);
      }
      const wChar = wList[0] || (nChar && canWrite(nChar) ? nChar : null);
      const altWChar = wList[1] || null;
      const extras = svcObj.chars
        .filter(function(c){ return nChar && c.uuid !== nChar.uuid && canNotify(c); })
        .map(function(c){ return c.uuid; });
      return { notify:nChar, write:wChar, altWrite:altWChar, extraNotifyUuids:extras };
    }

    if (slot === 'pressure'){
      if (svcMap[UUID.PRESSENSOR_SVC]){
        const pn = findChar(UUID.PRESSENSOR_SVC, UUID.PRESSENSOR_NOTIFY) || svcMap[UUID.PRESSENSOR_SVC].chars[0];
        const pw = findChar(UUID.PRESSENSOR_SVC, UUID.PRESSENSOR_WRITE);
        if (pn) return { family:'pressensor', slot:'pressure', serviceUuid:UUID.PRESSENSOR_SVC, notifyUuid:pn.uuid, writeUuid:pw ? pw.uuid : null };
      }
      const bkEmSvc = svcMap[UUID.BOOKOO_EM_SVC] || (svcMap[UUID.BOOKOO_SVC] && /em|pressure|monitor/i.test(name) ? svcMap[UUID.BOOKOO_SVC] : null);
      if (bkEmSvc){
        const bn = findChar(bkEmSvc.uuid, UUID.BOOKOO_EM_NOTIFY) || bkEmSvc.chars[0];
        const bw = findChar(bkEmSvc.uuid, UUID.BOOKOO_EM_WRITE);
        const extraEss = [];
        if (svcMap[UUID.ESS_SVC] && findChar(UUID.ESS_SVC, UUID.ESS_TEMP_CHAR)){
          extraEss.push({ serviceUuid:UUID.ESS_SVC, charUuid:UUID.ESS_TEMP_CHAR });
        }
        if (bn) return { family:'bookoo_pressure', slot:'pressure', serviceUuid:bkEmSvc.uuid, notifyUuid:bn.uuid, extraNotifyTargets:extraEss, writeUuid:bw ? bw.uuid : null };
      }
      if (svcMap[UUID.ESS_SVC]){
        const essP = findChar(UUID.ESS_SVC, UUID.PRESSENSOR_SIG_CHAR) || svcMap[UUID.ESS_SVC].chars[0];
        const essT = findChar(UUID.ESS_SVC, UUID.ESS_TEMP_CHAR);
        const extraEssUuids = (essT && essP && essT.uuid !== essP.uuid) ? [essT.uuid] : [];
        if (essP) return { family:'pressensor', slot:'pressure', serviceUuid:UUID.ESS_SVC, notifyUuid:essP.uuid, extraNotifyUuids:extraEssUuids, writeUuid:null };
      }
      if (svcMap[UUID.PRESSENSOR_SIG_SVC]){
        const psn = findChar(UUID.PRESSENSOR_SIG_SVC, UUID.PRESSENSOR_SIG_CHAR) || svcMap[UUID.PRESSENSOR_SIG_SVC].chars[0];
        const pst = findChar(UUID.PRESSENSOR_SIG_SVC, UUID.ESS_TEMP_CHAR);
        if (psn) return { family:'pressensor', slot:'pressure', serviceUuid:UUID.PRESSENSOR_SIG_SVC, notifyUuid:psn.uuid, extraNotifyUuids:(pst && pst.uuid !== psn.uuid) ? [pst.uuid] : [], writeUuid:null };
      }
      if (svcMap[UUID.BOOKOO_SVC]){
        const bn2 = findChar(UUID.BOOKOO_SVC, UUID.BOOKOO_EM_NOTIFY) || svcMap[UUID.BOOKOO_SVC].chars[0];
        const bw2 = findChar(UUID.BOOKOO_SVC, UUID.BOOKOO_EM_WRITE);
        if (bn2) return { family:'bookoo_pressure', slot:'pressure', serviceUuid:UUID.BOOKOO_SVC, notifyUuid:bn2.uuid, writeUuid:bw2 ? bw2.uuid : null };
      }
    }

    if (slot === 'refractometer' || slot === 'omni'){
      const isOmniSlot = slot === 'omni';
      const v3SvcKey = Object.keys(svcMap).find(function(k){ return /^0e140001-/.test(k); }) || UUID.DIFLUID_V3_SVC;
      const dfCandidateOrder = isOmniSlot
        ? [
            UUID.DIFLUID_OMNI_SVC,
            UUID.DIFLUID_SVC,
            v3SvcKey,
            UUID.DIFLUID_SCALE_SVC,
            UUID.DIFLUID_SCALE_ALT_SVC,
            UUID.FELICITA_SVC,
            UUID.SHARED_FFF0_SVC,
            UUID.NUS_SVC
          ]
        : [
            UUID.DIFLUID_SVC,
            v3SvcKey,
            UUID.DIFLUID_SCALE_SVC,
            UUID.DIFLUID_SCALE_ALT_SVC,
            UUID.FELICITA_SVC,
            UUID.SHARED_FFF0_SVC,
            UUID.NUS_SVC,
            UUID.DIFLUID_OMNI_SVC
          ];
      const matchedDfSvcs = [];
      for (let ri = 0; ri < dfCandidateOrder.length; ri++){
        const sk = dfCandidateOrder[ri];
        if (svcMap[sk] && svcMap[sk].chars.length && matchedDfSvcs.indexOf(svcMap[sk]) < 0){
          matchedDfSvcs.push(svcMap[sk]);
        }
      }
      if (!matchedDfSvcs.length && !isOmniSlot){
        Object.keys(svcMap).forEach(function(sk){
          if (!/^0000180[01af]-/.test(sk) && svcMap[sk].chars.length){
            matchedDfSvcs.push(svcMap[sk]);
          }
        });
      }
      if (matchedDfSvcs.length){
        const rSvc = matchedDfSvcs[0];
        const pickedDf = pickNotifyAndWrite(
          rSvc,
          [UUID.DIFLUID_CHAR, UUID.DIFLUID_WRITE_ALT, UUID.DIFLUID_V3_NOTIFY, UUID.FELICITA_CHAR, UUID.XBLOOM_SHORT_NOTIFY, UUID.FFF1_NOTIFY, UUID.FFF2_WRITE, UUID.NUS_NOTIFY],
          [UUID.DIFLUID_WRITE_ALT, UUID.DIFLUID_CHAR, UUID.DIFLUID_V3_WRITE, UUID.FFF2_WRITE, UUID.FELICITA_CHAR, UUID.XBLOOM_SHORT_NOTIFY, UUID.NUS_WRITE]
        );
        const extraNotifyTargets = [];
        for (let si = 1; si < matchedDfSvcs.length; si++){
          const secSvc = matchedDfSvcs[si];
          for (let sci = 0; sci < secSvc.chars.length; sci++){
            const sc = secSvc.chars[sci];
            if (canNotify(sc)){
              extraNotifyTargets.push({ serviceUuid: secSvc.uuid, charUuid: sc.uuid });
            }
          }
        }
        if (pickedDf.notify){
          return {
            family: isOmniSlot ? 'difluid_omni' : 'difluid_r2',
            slot: isOmniSlot ? 'omni' : 'refractometer',
            serviceUuid: rSvc.uuid,
            notifyUuid: pickedDf.notify.uuid,
            extraNotifyUuids: pickedDf.extraNotifyUuids,
            extraNotifyTargets: extraNotifyTargets,
            writeUuid: pickedDf.write ? pickedDf.write.uuid : null,
            altWriteUuid: pickedDf.altWrite ? pickedDf.altWrite.uuid : null
          };
        }
      }
    }

    if (slot === 'machine' || slot === 'kettle'){
      if (slot !== 'kettle' && (svcMap[UUID.XBLOOM_SVC] || (svcMap[UUID.XBLOOM_SHORT_SVC] && /xbloom|tbdx/i.test(name)))){
        const xs = svcMap[UUID.XBLOOM_SVC] || svcMap[UUID.XBLOOM_SHORT_SVC];
        const xw = findChar(xs.uuid, UUID.XBLOOM_WRITE) || findChar(xs.uuid, UUID.XBLOOM_SHORT_WRITE) || xs.chars[0];
        const xn = findChar(xs.uuid, UUID.XBLOOM_NOTIFY) || findChar(xs.uuid, UUID.XBLOOM_SHORT_NOTIFY);
        const xAux = findChar(xs.uuid, UUID.XBLOOM_AUX);
        const xExtra = (xAux && (!xn || xAux.uuid !== xn.uuid) && canNotify(xAux)) ? [xAux.uuid] : [];
        if (xw) return { family:'xbloom', slot:'machine', serviceUuid:xs.uuid, notifyUuid:xn ? xn.uuid : (xAux ? xAux.uuid : null), extraNotifyUuids:xExtra, writeUuid:xw.uuid };
      }
      if (svcMap[UUID.STAGG_EKG_SVC] && (/stagg|ekg|fellow/i.test(name) || slot === 'kettle')){
        const pickedK = pickNotifyAndWrite(
          svcMap[UUID.STAGG_EKG_SVC],
          [UUID.STAGG_EKG_ALT_CHAR, UUID.STAGG_EKG_CHAR],
          [UUID.STAGG_EKG_ALT_CHAR, UUID.STAGG_EKG_CHAR]
        );
        if (pickedK.notify){
          return {
            family: 'stagg_ekg_plus',
            slot: 'machine',
            serviceUuid: UUID.STAGG_EKG_SVC,
            notifyUuid: pickedK.notify.uuid,
            extraNotifyUuids: pickedK.extraNotifyUuids,
            writeUuid: pickedK.write ? pickedK.write.uuid : pickedK.notify.uuid,
            altWriteUuid: pickedK.altWrite ? pickedK.altWrite.uuid : null
          };
        }
      }
      if (slot === 'machine' && svcMap[UUID.XBLOOM_SHORT_SVC]){
        const xs2 = svcMap[UUID.XBLOOM_SHORT_SVC];
        const xw2 = findChar(xs2.uuid, UUID.XBLOOM_SHORT_WRITE) || xs2.chars[0];
        const xn2 = findChar(xs2.uuid, UUID.XBLOOM_SHORT_NOTIFY) || (xs2.chars.length > 1 ? xs2.chars[1] : null);
        if (xw2) return { family:'xbloom', slot:'machine', serviceUuid:xs2.uuid, notifyUuid:xn2 ? xn2.uuid : null, writeUuid:xw2.uuid };
      }
    }

    /* Scale Disambiguation (11+ Families incl. 0x1820 vs Stagg & 0xFFF0 / 0xFFE0 / 0xFFB0 / 0x181D collisions) */
    if (svcMap[UUID.ACAIA_PYXIS_SVC]){
      const pickedPyxis = pickNotifyAndWrite(
        svcMap[UUID.ACAIA_PYXIS_SVC],
        [UUID.ACAIA_PYXIS_NOTIFY, UUID.ACAIA_PYXIS_WRITE],
        [UUID.ACAIA_PYXIS_WRITE, UUID.ACAIA_PYXIS_NOTIFY]
      );
      if (pickedPyxis.notify){
        return {
          family: 'acaia',
          slot: 'scale',
          serviceUuid: UUID.ACAIA_PYXIS_SVC,
          notifyUuid: pickedPyxis.notify.uuid,
          extraNotifyUuids: pickedPyxis.extraNotifyUuids,
          writeUuid: pickedPyxis.write ? pickedPyxis.write.uuid : null,
          altWriteUuid: pickedPyxis.altWrite ? pickedPyxis.altWrite.uuid : null
        };
      }
    }
    if (svcMap[UUID.ACAIA_LEGACY_SVC]){
      if (/stagg|ekg|fellow/i.test(name)){
        const pickedStagg = pickNotifyAndWrite(
          svcMap[UUID.ACAIA_LEGACY_SVC],
          [UUID.STAGG_EKG_ALT_CHAR, UUID.STAGG_EKG_CHAR],
          [UUID.STAGG_EKG_ALT_CHAR, UUID.STAGG_EKG_CHAR]
        );
        if (pickedStagg.notify){
          return {
            family: 'stagg_ekg_plus',
            slot: 'machine',
            serviceUuid: UUID.ACAIA_LEGACY_SVC,
            notifyUuid: pickedStagg.notify.uuid,
            extraNotifyUuids: pickedStagg.extraNotifyUuids,
            writeUuid: pickedStagg.write ? pickedStagg.write.uuid : pickedStagg.notify.uuid,
            altWriteUuid: pickedStagg.altWrite ? pickedStagg.altWrite.uuid : null
          };
        }
      }
      const alc = findChar(UUID.ACAIA_LEGACY_SVC, UUID.ACAIA_LEGACY_CHAR) || svcMap[UUID.ACAIA_LEGACY_SVC].chars[0];
      if (alc){
        return { family:'acaia', slot:'scale', serviceUuid:UUID.ACAIA_LEGACY_SVC, notifyUuid:alc.uuid, writeUuid:alc.uuid };
      }
    }
    const v3ScaleKey = Object.keys(svcMap).find(function(k){ return /^0e140001-/.test(k); });
    const dfScaleSvc = svcMap[UUID.DIFLUID_SCALE_SVC]
      || svcMap[UUID.DIFLUID_SCALE_ALT_SVC]
      || ((/microbalance|difluid|dft-?s|df-?s/i.test(name) || (!svcMap[UUID.BOOKOO_SVC] && !svcMap[UUID.SKALE_SVC] && !svcMap[UUID.FELICITA_SVC] && !svcMap[UUID.HIROIA_SVC] && !svcMap[UUID.SHARED_FFF0_SVC] && !svcMap[UUID.WEIGHT_SIG_SVC])) && (svcMap[UUID.DIFLUID_SVC] || (v3ScaleKey ? svcMap[v3ScaleKey] : null)));
    if (dfScaleSvc){
      const pickedDfs = pickNotifyAndWrite(
        dfScaleSvc,
        [UUID.DIFLUID_CHAR, UUID.DIFLUID_V3_NOTIFY, UUID.DIFLUID_WRITE_ALT],
        [UUID.DIFLUID_WRITE_ALT, UUID.DIFLUID_CHAR, UUID.DIFLUID_V3_WRITE]
      );
      if (pickedDfs.notify){
        return {
          family: 'difluid',
          slot: 'scale',
          serviceUuid: dfScaleSvc.uuid,
          notifyUuid: pickedDfs.notify.uuid,
          extraNotifyUuids: pickedDfs.extraNotifyUuids,
          writeUuid: pickedDfs.write ? pickedDfs.write.uuid : null,
          altWriteUuid: pickedDfs.altWrite ? pickedDfs.altWrite.uuid : null
        };
      }
    }
    if (svcMap[UUID.BOOKOO_SVC]){
      const pickedBk = pickNotifyAndWrite(
        svcMap[UUID.BOOKOO_SVC],
        [UUID.BOOKOO_NOTIFY],
        [UUID.BOOKOO_WRITE, UUID.BOOKOO_NOTIFY]
      );
      if (pickedBk.notify){
        return {
          family: 'bookoo',
          slot: 'scale',
          serviceUuid: UUID.BOOKOO_SVC,
          notifyUuid: pickedBk.notify.uuid,
          extraNotifyUuids: pickedBk.extraNotifyUuids,
          writeUuid: pickedBk.write ? pickedBk.write.uuid : null,
          altWriteUuid: pickedBk.altWrite ? pickedBk.altWrite.uuid : null
        };
      }
    }
    if (svcMap[UUID.SKALE_SVC]){
      const skn = findChar(UUID.SKALE_SVC, UUID.SKALE_NOTIFY) || svcMap[UUID.SKALE_SVC].chars[0];
      const skw = findChar(UUID.SKALE_SVC, UUID.SKALE_WRITE);
      const skb = findChar(UUID.SKALE_SVC, UUID.SKALE_BTN_NOTIFY);
      if (skn) return { family:'skale', slot:'scale', serviceUuid:UUID.SKALE_SVC, notifyUuid:skn.uuid, extraNotifyUuids:skb ? [skb.uuid] : [], writeUuid:skw ? skw.uuid : null };
    }
    if (svcMap[UUID.HIROIA_SVC]){
      const hn = findChar(UUID.HIROIA_SVC, UUID.HIROIA_NOTIFY) || svcMap[UUID.HIROIA_SVC].chars[0];
      const hw = findChar(UUID.HIROIA_SVC, UUID.HIROIA_WRITE);
      if (hn) return { family:'hiroia', slot:'scale', serviceUuid:UUID.HIROIA_SVC, notifyUuid:hn.uuid, writeUuid:hw ? hw.uuid : null };
    }
    if (svcMap[UUID.SHARED_FFF0_SVC]){
      const fff4 = findChar(UUID.SHARED_FFF0_SVC, UUID.DECENT_NOTIFY);
      const w36f5 = findChar(UUID.SHARED_FFF0_SVC, UUID.DECENT_WRITE);
      if (fff4 && canNotify(fff4)){
        return { family:'decent', slot:'scale', serviceUuid:UUID.SHARED_FFF0_SVC, notifyUuid:fff4.uuid, writeUuid:w36f5 ? w36f5.uuid : null, autoPromoteOnFirstFrame:true };
      }
      const pickedFff0 = pickNotifyAndWrite(
        svcMap[UUID.SHARED_FFF0_SVC],
        [UUID.FFF1_NOTIFY, UUID.FFF2_WRITE],
        [UUID.FFF2_WRITE, UUID.FFF1_NOTIFY]
      );
      if (pickedFff0.notify){
        let initFam = 'timemore';
        if (/varia|aku|cube|mhw|exagram|wacaco/i.test(name)) initFam = 'varia';
        else if (/eureka|precisa|cfs-?9002|lsj|brewista|smart\s*scale|formula|solobarista|kc200|weighmybru/i.test(name)) initFam = 'eureka';
        else if (/decent|hds/i.test(name)) initFam = 'decent';
        else if (/felicita/i.test(name)) initFam = 'felicita';
        return {
          family: initFam,
          variant: initFam === 'timemore' ? 'osp' : '',
          slot: 'scale',
          serviceUuid: UUID.SHARED_FFF0_SVC,
          notifyUuid: pickedFff0.notify.uuid,
          extraNotifyUuids: pickedFff0.extraNotifyUuids,
          writeUuid: pickedFff0.write ? pickedFff0.write.uuid : null,
          altWriteUuid: pickedFff0.altWrite ? pickedFff0.altWrite.uuid : null,
          autoPromoteOnFirstFrame: true
        };
      }
    }
    if (svcMap[UUID.EUREKA_ALT_SVC]){
      const pickedFfb0 = pickNotifyAndWrite(
        svcMap[UUID.EUREKA_ALT_SVC],
        [UUID.EUREKA_ALT_CHAR],
        [UUID.EUREKA_ALT_CHAR]
      );
      if (pickedFfb0.notify){
        const ffbFam = /varia|aku|cube|mhw|exagram|wacaco/i.test(name) ? 'varia' : 'eureka';
        return {
          family: ffbFam,
          slot: 'scale',
          serviceUuid: UUID.EUREKA_ALT_SVC,
          notifyUuid: pickedFfb0.notify.uuid,
          extraNotifyUuids: pickedFfb0.extraNotifyUuids,
          writeUuid: pickedFfb0.write ? pickedFfb0.write.uuid : null,
          altWriteUuid: pickedFfb0.altWrite ? pickedFfb0.altWrite.uuid : null,
          autoPromoteOnFirstFrame: true
        };
      }
    }
    if (svcMap[UUID.FELICITA_SVC] && !/xbloom|tbdx/i.test(name)){
      const pickedFfe0 = pickNotifyAndWrite(
        svcMap[UUID.FELICITA_SVC],
        [UUID.FELICITA_CHAR, UUID.XBLOOM_SHORT_NOTIFY],
        [UUID.FELICITA_CHAR, UUID.XBLOOM_SHORT_NOTIFY]
      );
      if (pickedFfe0.notify){
        let ffeFam = 'felicita';
        if (/varia|aku|cube|mhw|exagram|wacaco/i.test(name)) ffeFam = 'varia';
        else if (/eureka|precisa|cfs-?9002|lsj|brewista|smart\s*scale|formula|solobarista|kc200|weighmybru/i.test(name)) ffeFam = 'eureka';
        else if (/decent|hds/i.test(name)) ffeFam = 'decent';
        else if (/timemore|black\s*mirror|^tm\b/i.test(name)) ffeFam = 'timemore';
        return {
          family: ffeFam,
          slot: 'scale',
          serviceUuid: UUID.FELICITA_SVC,
          notifyUuid: pickedFfe0.notify.uuid,
          extraNotifyUuids: pickedFfe0.extraNotifyUuids,
          writeUuid: pickedFfe0.write ? pickedFfe0.write.uuid : null,
          altWriteUuid: pickedFfe0.altWrite ? pickedFfe0.altWrite.uuid : null,
          autoPromoteOnFirstFrame: true
        };
      }
    }
    if (svcMap[UUID.NUS_SVC]){
      const nn = findChar(UUID.NUS_SVC, UUID.NUS_NOTIFY) || svcMap[UUID.NUS_SVC].chars[0];
      const nw = findChar(UUID.NUS_SVC, UUID.NUS_WRITE);
      if (nn){
        let nusFam = 'timemore';
        if (/varia|aku|cube|mhw|exagram|wacaco/i.test(name)) nusFam = 'varia';
        else if (/uart|ascii|serial|ohaus|mettler/i.test(name)) nusFam = 'ascii';
        return { family:nusFam, variant:nusFam === 'timemore' ? 'osp' : '', slot:'scale', serviceUuid:UUID.NUS_SVC, notifyUuid:nn.uuid, writeUuid:nw ? nw.uuid : null, autoPromoteOnFirstFrame:true };
      }
    }
    if (svcMap[UUID.WEIGHT_SIG_SVC]){
      const sn = findChar(UUID.WEIGHT_SIG_SVC, UUID.WEIGHT_SIG_NOTIFY) || svcMap[UUID.WEIGHT_SIG_SVC].chars[0];
      const tmSigWrite = findChar(UUID.WEIGHT_SIG_SVC, UUID.TIMEMORE_SIG_WRITE);
      const tmCustomWrite = findChar(UUID.WEIGHT_SIG_SVC, UUID.TIMEMORE_CUSTOM_WRITE)
        || (svcMap[UUID.TIMEMORE_CUSTOM_SVC] ? findChar(UUID.TIMEMORE_CUSTOM_SVC, UUID.TIMEMORE_CUSTOM_WRITE) : null);
      const sigCtrlWrite = findChar(UUID.WEIGHT_SIG_SVC, UUID.WEIGHT_SIG_CTRL);
      const usableTmSigWrite = (tmSigWrite && canWrite(tmSigWrite)) ? tmSigWrite : null;
      const sw = usableTmSigWrite || tmCustomWrite || sigCtrlWrite || tmSigWrite;
      const altSw = (sw === usableTmSigWrite && (tmCustomWrite || sigCtrlWrite))
        ? (tmCustomWrite || sigCtrlWrite)
        : (usableTmSigWrite && sw !== usableTmSigWrite ? usableTmSigWrite : null);
      const isTm = /timemore|black\s*mirror|^tm\b/i.test(name) || !!svcMap[UUID.TIMEMORE_CUSTOM_SVC] || hasExplicitWrite(tmSigWrite);
      if (sn){
        return {
          family: isTm ? 'timemore' : 'sig',
          variant: isTm ? 'classic_float32' : '',
          slot: 'scale',
          serviceUuid: UUID.WEIGHT_SIG_SVC,
          notifyUuid: sn.uuid,
          writeUuid: sw ? sw.uuid : null,
          altWriteUuid: altSw ? altSw.uuid : null,
          writeServiceUuid: (svcMap[UUID.TIMEMORE_CUSTOM_SVC] && sw && sw.uuid === UUID.TIMEMORE_CUSTOM_WRITE) ? UUID.TIMEMORE_CUSTOM_SVC : UUID.WEIGHT_SIG_SVC,
          autoPromoteOnFirstFrame: true
        };
      }
    }
    if (slot === 'scale'){
      const svKeys = Object.keys(svcMap);
      for (let ki = 0; ki < svKeys.length; ki++){
        const sk = svKeys[ki];
        if (/^0000180[01af]-/.test(sk)) continue;
        const pickedGen = pickNotifyAndWrite(svcMap[sk], [], []);
        if (pickedGen.notify && canNotify(pickedGen.notify)){
          return {
            family: 'sig',
            slot: 'scale',
            serviceUuid: sk,
            notifyUuid: pickedGen.notify.uuid,
            extraNotifyUuids: pickedGen.extraNotifyUuids,
            writeUuid: pickedGen.write ? pickedGen.write.uuid : null,
            altWriteUuid: pickedGen.altWrite ? pickedGen.altWrite.uuid : null,
            autoPromoteOnFirstFrame: true
          };
        }
      }
    }
    return null;
  }

  /**
   * Unified Per-Characteristic 256-Byte MTU Fragmentation & Magic-Byte Stream Processor
   */
  function createCharacteristicStream(initialFamily, context){
    let family = String(initialFamily || 'auto').toLowerCase();
    const ctx = Object.assign({}, context || {});
    const rawRing = createMtuRingBuffer(MAX_RING_BYTES);
    const acaiaStream = createAcaiaStreamParser();
    const difluidMode = (family === 'difluid_r2' || ctx.slot === 'refractometer')
      ? 'r2'
      : ((family === 'difluid_omni' || ctx.slot === 'omni')
        ? 'omni'
        : ((family === 'difluid' || family === 'difluid_scale') ? 'scale' : 'auto'));
    const difluidStream = createDiFluidStreamParser(difluidMode);
    const timemoreOspStream = createTimemoreOspStreamParser();
    const variaStream = createVariaStreamParser();
    const bookooStream = createBookooStreamParser();
    const asciiStream = createAsciiStreamParser();
    let promoted = false;

    function decodeSingleByFamily(fam, u8){
      if (fam === 'acaia') return acaiaStream.push(u8);
      if (fam === 'difluid' || fam === 'difluid_scale'){
        const dfs = difluidStream.push(u8);
        if (dfs.length) return dfs;
        const ds = decodeDiFluidScale(u8);
        return ds ? [ds] : [];
      }
      if (fam === 'difluid_r2'){
        const dfr = difluidStream.push(u8);
        if (dfr.length) return dfr;
        const dr = decodeDiFluidR2(u8);
        return dr ? [dr] : [];
      }
      if (fam === 'difluid_omni'){
        const dfo = difluidStream.push(u8);
        if (dfo.length) return dfo;
        const dm = decodeDiFluidOmni(u8);
        return dm ? [dm] : [];
      }
      if (fam === 'bookoo'){
        const bks = bookooStream.push(u8);
        if (bks.length) return bks;
        const bk = decodeBookoo(u8);
        return bk ? [bk] : [];
      }
      if (fam === 'timemore'){
        if ((u8.length >= 2 && u8[0] === 0xA5 && u8[1] === 0x5A) || timemoreOspStream.length() > 0){
          return timemoreOspStream.push(u8);
        }
        const tm = decodeTimemore(u8);
        if (tm) return [tm];
        /* Prevent u8.length >= 8 Timemore or other non-SIG multi-chunk headers on 0xFFF0/NUS from falling through to decodeWeightSig */
        const svcNormTm = normUuid(ctx.serviceUuid);
        const canSigFallback = (!svcNormTm || svcNormTm === UUID.WEIGHT_SIG_SVC) &&
          u8.length < 8 &&
          u8[0] !== 0x03 && u8[0] !== 0xEF && u8[0] !== 0xDF && u8[0] !== 0xA5 &&
          u8[0] !== 0xAA && u8[0] !== 0xFA && u8[0] !== 0xFB && u8[0] !== 0x55 &&
          u8[0] !== 0x58 && !(u8[0] === 0x01 && u8[1] === 0x02) &&
          !isPrintableAsciiScaleBytes(u8);
        if (canSigFallback){
          const sigFallback = decodeWeightSig(u8);
          return sigFallback ? [sigFallback] : [];
        }
        return [];
      }
      if (fam === 'varia'){
        const vs = variaStream.push(u8);
        if (vs.length) return vs;
        const dv = decodeVaria(u8);
        return dv ? [dv] : [];
      }
      if (fam === 'felicita'){
        const df = decodeFelicita(u8);
        return df ? [df] : [];
      }
      if (fam === 'decent'){
        const dd = decodeDecent(u8, { strictXor:false });
        return dd ? [dd] : [];
      }
      if (fam === 'skale'){
        if (normUuid(ctx.charUuid) === UUID.SKALE_BTN_NOTIFY){
          const sb = decodeSkaleButton(u8);
          return sb ? [sb] : [];
        }
        const sk = decodeSkale(u8);
        return sk ? [sk] : [];
      }
      if (fam === 'eureka'){
        const eu = decodeEureka(u8);
        return eu ? [eu] : [];
      }
      if (fam === 'hiroia'){
        const hi = decodeHiroia(u8);
        return hi ? [hi] : [];
      }
      if (fam === 'sig'){
        if (u8.length >= 8 && (u8[0] & 0x02) === 0){
          const tmAuto = decodeTimemore(u8);
          if (tmAuto){
            family = 'timemore';
            promoted = true;
            return [tmAuto];
          }
        }
        const ws = decodeWeightSig(u8);
        return ws ? [ws] : [];
      }
      if (fam === 'pressensor'){
        const pr = decodePressensor(u8, ctx);
        return pr ? [pr] : [];
      }
      if (fam === 'bookoo_pressure'){
        const bp = decodeBookooPressure(u8);
        return bp ? [bp] : [];
      }
      if (fam === 'xbloom'){
        const xb = decodeXBloom(u8);
        return xb ? [xb] : [];
      }
      if (fam === 'stagg_ekg_plus'){
        const st = decodeStaggKettle(u8);
        return st ? [st] : [];
      }
      if (fam === 'ascii'){
        return asciiStream.push(u8);
      }
      return [];
    }

    return {
      getFamily: function(){ return family; },
      wasPromoted: function(){ return promoted; },
      ringLength: function(){ return rawRing.length(); },
      reset: function(){
        rawRing.clear();
        acaiaStream.reset();
        difluidStream.reset();
        timemoreOspStream.reset();
        variaStream.reset();
        bookooStream.reset();
        asciiStream.reset();
      },
      push: function(chunk){
        const u8 = toU8(chunk);
        if (!u8.length) return { family:family, promoted:false, frames:[] };

        /* Allow magic-byte auto-promotion across all shared GATT services (0xFFF0, 0xFFE0, 0xFFB0, 0x181D, 0x1820, NUS, auto) */
        const svcNorm = normUuid(ctx.serviceUuid);
        const canAutoPromote = (
          family === 'auto' ||
          ctx.autoPromote !== false && (
            svcNorm === UUID.SHARED_FFF0_SVC ||
            svcNorm === UUID.FELICITA_SVC ||
            svcNorm === UUID.EUREKA_ALT_SVC ||
            svcNorm === UUID.WEIGHT_SIG_SVC ||
            svcNorm === UUID.ACAIA_LEGACY_SVC ||
            svcNorm === UUID.NUS_SVC ||
            !ctx.serviceUuid
          )
        );

        if (canAutoPromote){
          rawRing.append(u8);
          const candidate = detectProtocolFromBytes(rawRing.peek(), ctx);
          if (candidate && candidate !== family){
            const prev = family;
            family = candidate;
            promoted = true;
            const buffered = rawRing.peek().slice();
            rawRing.clear();
            const promotedFrames = decodeSingleByFamily(family, buffered);
            return { family:family, promoted:true, promotedFrom:prev, frames:promotedFrames };
          }
        }

        const frames = decodeSingleByFamily(family, u8);
        if (canAutoPromote && frames.length > 0){
          rawRing.clear();
        }
        return { family:family, promoted:false, frames:frames };
      }
    };
  }

  /* ============================================================================
   * 15-FAMILY HARDWARE CATALOG & HONEST NON-GATT CAPABILITY DISCLOSURES
   * ============================================================================ */
  const DEVICE_CATALOG = [
    { id:'acaia',           slot:'scale',         name:'Acaia Lunar / Pearl / Pearl S / Pyxis', tier:'verified_gatt', protocol:'0x1820 / Pyxis 0xEF 0xDD' },
    { id:'difluid',         slot:'scale',         name:'DiFluid Microbalance & Microbalance Ti', tier:'verified_gatt', protocol:'0x00EE / 0xDF 0xDF sum8' },
    { id:'bookoo',          slot:'scale',         name:'Bookoo Themis Mini & Themis Ultra',     tier:'verified_gatt', protocol:'0x0FFE 20B XOR' },
    { id:'timemore',        slot:'scale',         name:'Timemore Black Mirror Classic / Basic 2 OSP / Compact', tier:'verified_gatt', protocol:'0x181D Float32 / 0xFFF0 CRC16' },
    { id:'felicita',        slot:'scale',         name:'Felicita Arc / Incline / Parallel',     tier:'verified_gatt', protocol:'0xFFE0 18B ASCII' },
    { id:'decent',          slot:'scale',         name:'Decent Scale & Open-Scale',             tier:'verified_gatt', protocol:'0xFFF0 7B/10B XOR' },
    { id:'varia',           slot:'scale',         name:'Varia AKU / AKU Pro / Mini',            tier:'verified_gatt', protocol:'0xFFF0 0xFA/0x55 XOR' },
    { id:'skale',           slot:'scale',         name:'Atomax Skale II',                       tier:'verified_gatt', protocol:'0xFF08 24-bit LE' },
    { id:'eureka',          slot:'scale',         name:'Eureka Precisa / CFS-9002 / KC200 / WeighMyBru', tier:'verified_gatt', protocol:'0xFFF0 0xAA 0x09 0x41' },
    { id:'hiroia',          slot:'scale',         name:'Hiroia Jimmy',                          tier:'verified_gatt', protocol:'Hiroia 24-bit LE' },
    { id:'sig',             slot:'scale',         name:'Bluetooth SIG 0x181D Weight Scale',     tier:'verified_gatt', protocol:'GATT 0x181D / 0x2A9D' },
    { id:'pressensor',      slot:'pressure',      name:'Pressensor / Smart Espresso Profiler',  tier:'verified_gatt', protocol:'0x185B / SEP mbar -> bar' },
    { id:'bookoo_pressure', slot:'pressure',      name:'Bookoo Espresso Monitor (EM)',          tier:'verified_gatt', protocol:'0x0FFF / 0x0FFE bar + XOR' },
    { id:'difluid_r2',      slot:'refractometer', name:'DiFluid R2 Extract Refractometer',      tier:'verified_gatt', protocol:'0x00FF %TDS / nD20 / tempC' },
    { id:'difluid_omni',    slot:'omni',          name:'DiFluid Omni Roast & PSD Analyzer',     tier:'verified_gatt', protocol:'0x00FC Agtron + D10/50/90 + Bins' },
    { id:'xbloom',          slot:'machine',       name:'xBloom Studio & Original',              tier:'experimental_ble', protocol:'0xFFE0 0x58 0x42 CRC16 (0x41/0x44 Gate)' },
    { id:'stagg_ekg_plus',  slot:'machine',       name:'Fellow Stagg EKG+ (Classic BLE)',       tier:'experimental_ble', protocol:'0x1820 Live Temp & Hold' }
  ];

  const NON_GATT_DISCLOSURES = {
    fellow_tally_pro: {
      id: 'fellow_tally_pro',
      name: 'Fellow Tally Pro Studio Scale',
      bleSupported: false,
      radio: 'none',
      badge: '[No Bluetooth Radio in Hardware]',
      summary: 'Fellow Tally Pro contains no Bluetooth or Wi-Fi radio (local OLED + mechanical dial only). Use Brew Studio Ratio Mirror to match Tally Brew Assist on your counter.'
    },
    fellow_stagg_ekg_pro: {
      id: 'fellow_stagg_ekg_pro',
      name: 'Fellow Stagg EKG Pro / Pro Studio',
      bleSupported: false,
      radio: 'wifi-cli-only',
      badge: '[Closed BLE / Wi-Fi Provisioning Only]',
      summary: 'Fellow Stagg EKG Pro uses BLE solely for Wi-Fi/OTA setup; open real-time GATT temperature streaming is supported on Classic Stagg EKG+. Set your PID dial directly to the altitude-compensated target in Brew Studio.'
    },
    fellow_aiden: {
      id: 'fellow_aiden',
      name: 'Fellow Aiden Precision Brewer',
      bleSupported: false,
      radio: 'cloud-wifi',
      badge: '[Closed Cloud API / Guided Staircase + Local JSON]',
      summary: 'Fellow Aiden syncs profiles through authenticated Fellow cloud (brew.link). Use BeanTelligence 1:1 Guided Pulse-Temp Staircase and local .aiden.json profile export/import.'
    }
  };

  const decoders = {
    decodeAcaia: decodeAcaia,
    decodeAcaiaFrame: decodeAcaiaFrame,
    createAcaiaStreamParser: createAcaiaStreamParser,
    decodeDiFluidScale: decodeDiFluidScale,
    decodeMicrobalance: decodeDiFluidScale,
    decodeBookoo: decodeBookoo,
    decodeTimemore: decodeTimemore,
    decodeFelicita: decodeFelicita,
    decodeDecent: decodeDecent,
    decodeVaria: decodeVaria,
    decodeSkale: decodeSkale,
    decodeSkaleButton: decodeSkaleButton,
    decodeEureka: decodeEureka,
    decodeHiroia: decodeHiroia,
    decodeWeightSig: decodeWeightSig,
    decodePressensor: decodePressensor,
    decodeBookooPressure: decodeBookooPressure,
    decodeDiFluidR2: decodeDiFluidR2,
    decodeDiFluid: decodeDiFluidR2,
    decodeDiFluidOmni: decodeDiFluidOmni,
    decodeXBloom: decodeXBloom,
    decodeStaggKettle: decodeStaggKettle,
    decodeAsciiScale: decodeAsciiScale,
    agtronToRoastSwatch: agtronToRoastSwatch
  };

  const streams = {
    MAX_RING_BYTES: MAX_RING_BYTES,
    createMtuRingBuffer: createMtuRingBuffer,
    createAcaiaStreamParser: createAcaiaStreamParser,
    createDiFluidStreamParser: createDiFluidStreamParser,
    createTimemoreOspStreamParser: createTimemoreOspStreamParser,
    createVariaStreamParser: createVariaStreamParser,
    createBookooStreamParser: createBookooStreamParser,
    createAsciiStreamParser: createAsciiStreamParser,
    createCharacteristicStream: createCharacteristicStream
  };

  const checksums = {
    xorChecksum: xorChecksum,
    sum8Checksum: sum8Checksum,
    lrc8TwosComplement: lrc8TwosComplement,
    acaiaChecksum: acaiaChecksum,
    encodeAcaia: encodeAcaia,
    crc16Modbus: crc16Modbus,
    crc16Kermit: crc16Kermit
  };

  global.BTBleCodecs = {
    UUID: UUID,
    ALL_COFFEE_OPTIONAL_SERVICES: ALL_COFFEE_OPTIONAL_SERVICES,
    normUuid: normUuid,
    toU8: toU8,
    hexToBytes: hexToBytes,
    bytesToHex: bytesToHex,
    checksums: checksums,
    commands: commands,
    decoders: decoders,
    decodeDiFluidR2: decodeDiFluidR2,
    streams: streams,
    detectProtocolFromBytes: detectProtocolFromBytes,
    detectGattProfile: detectGattProfile,
    agtronToRoastSwatch: agtronToRoastSwatch,
    DEVICE_CATALOG: DEVICE_CATALOG,
    NON_GATT_DISCLOSURES: NON_GATT_DISCLOSURES
  };
})(typeof window !== 'undefined' ? window : globalThis);
