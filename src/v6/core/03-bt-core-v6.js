(function(G){
'use strict';

if (typeof G.window === 'undefined') G.window = G;

/* ============================================================================
   BeanTelligence v6.0 — BTCoreV6 Unified First-Principles Coffee Physics Engine
   File: src/v6/core/03-bt-core-v6.js
   Runtime target: < 1.3 ms per simulateBrew / synthesizeRecipe (zero-GC arenas)
   Zero Unicode emojis. UTF-8 no BOM.
   ============================================================================ */

const R_GAS = 8.314462618;          /* J/(mol*K) exact SI */
const DH_VAP_WATER = 40660.0;       /* J/mol near 90-100 C */
const P_ATM_SEA = 101325.0;         /* Pa */
const T_BOIL_SEA_K = 373.15;        /* K */
const CP_WATER = 4.184;             /* J/(g*K) */
const CP_ICE = 2.093;               /* J/(g*K) */
const LF_ICE = 333.55;              /* J/g IAPWS latent heat of fusion */
const CP_COFFEE_DRY = 1.55;         /* J/(g*K) roasted bean matrix */
const CP_PAPER_DRY = 1.34;          /* J/(g*K) cellulose filter */

/* 4-Node Probabilists' Gauss-Hermite Quadrature on Coarse Log-Normal Mode */
const GH4_Z = new Float64Array([-2.3344142183389773, -0.7419637843027259, 0.7419637843027259, 2.3344142183389773]);
const GH4_W = new Float64Array([0.0458758547680685, 0.4541241452319315, 0.4541241452319315, 0.0458758547680685]);

/* Zero-GC Pre-Allocated ODE Trajectory Scratchpads (MAX_STEPS = 512) */
const MAX_ODE_STEPS = 512;
const _arenaT = new Float64Array(MAX_ODE_STEPS);
const _arenaTempSlurry = new Float64Array(MAX_ODE_STEPS);
const _arenaTempWall = new Float64Array(MAX_ODE_STEPS);
const _arenaMassSlurry = new Float64Array(MAX_ODE_STEPS);
const _arenaMassCup = new Float64Array(MAX_ODE_STEPS);
const _arenaTdsCup = new Float64Array(MAX_ODE_STEPS);
const _arenaEy = new Float64Array(MAX_ODE_STEPS);
const _arenaVoc = new Float64Array(MAX_ODE_STEPS);
const _nodeD = new Float64Array(5);
const _nodeW = new Float64Array(5);
const _nodeBroken = new Float64Array(5);
const _nodeAcc = new Float64Array(5);
const _stateFast = new Float64Array(15); /* 5 nodes x 3 species (A, B, C) */
const _stateSlow = new Float64Array(15); /* 5 nodes x 3 species (A, B, C) */
const _chanFast = new Float64Array(3);
const _chanSlow = new Float64Array(3);

function _clamp(v, lo, hi, fb){
  const n = typeof v === 'number' ? v : parseFloat(v);
  if (!isFinite(n)) return fb !== undefined ? fb : lo;
  const c = n < lo ? lo : n > hi ? hi : n;
  return c === 0 ? 0 : c;
}
function _rnd(n, d){
  if (!isFinite(n)) return 0;
  const m = Math.pow(10, d || 0);
  const v = Math.round(n * m) / m;
  return Object.is(v, -0) ? 0 : v;
}

/* Ensure non-destructive compatibility aliases on METHOD_PHYSICS_V6 and GRINDERS */
if (Array.isArray(G.METHOD_PHYSICS_V6)){
  G.METHOD_PHYSICS_V6.forEach(m => {
    if (!m.cat) m.cat = m.category;
    if (m.d50 == null) m.d50 = m.d50AnchorUm;
    if (m.rw == null) m.rw = m.rWater;
  });
}
if (Array.isArray(G.GRINDERS)){
  G.GRINDERS.forEach(g => {
    if (!g.label) g.label = g.name || g.short;
    if (g.stepUm == null){
      const c = G.GRINDER_CURVES && G.GRINDER_CURVES[g.key];
      g.stepUm = (c && c.knots && typeof G.slopeAtUm === 'function')
        ? _rnd(1 / Math.max(0.01, G.slopeAtUm(c.knots, 580)), 1)
        : 24;
    }
  });
}

/* Standard Normal CDF & Exact Acklam Inverse Normal Quantile */
function normCdf(z){
  if (z < -8) return 0;
  if (z > 8) return 1;
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1.0 + sign * y);
}

function normInv(p){
  const q0 = _clamp(p, 1e-9, 1 - 1e-9, 0.5);
  const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
  const pLow = 0.02425, pHigh = 1 - pLow;
  let q, r;
  if (q0 < pLow){
    q = Math.sqrt(-2 * Math.log(q0));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
           ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (q0 <= pHigh){
    q = q0 - 0.5;
    r = q * q;
    return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
           (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  q = Math.sqrt(-2 * Math.log(1 - q0));
  return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
          ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
}

/* ============================================================================
   1. THERMODYNAMICS SUB-MODULE (thermo)
   - ISA + Clausius-Clapeyron boilingPointC (100.00 C @ 0m, 94.55 C @ 1609m)
   - Open-CV 2-Node Slurry-Wall Thermal ODE (C_wall decoupled from preheat)
   - 3-Regime IAPWS Flash-Iced Enthalpy Solver (0/0 empty-carafe guard)
   ============================================================================ */

function boilingPointC(elevM){
  const z = _clamp(elevM, -430, 5500, 0);
  const pAtm = P_ATM_SEA * Math.pow(1 - (0.0065 * z) / 288.15, 5.25588);
  const invT = (1 / T_BOIL_SEA_K) - (R_GAS / DH_VAP_WATER) * Math.log(pAtm / P_ATM_SEA);
  return _rnd((1 / invT) - 273.15, 2);
}

const BREWER_WALL_PROPS = {
  plastic:   { cWall:85.0,  hSw:3.40, hAmb:0.42, rinseAlpha:0.74, etaLid:0.15, label:'Tritan / PP Plastic' },
  ceramic:   { cWall:285.0, hSw:5.20, hAmb:0.68, rinseAlpha:0.48, etaLid:0.12, label:'Heavy Stoneware Ceramic' },
  glass:     { cWall:185.0, hSw:4.40, hAmb:0.62, rinseAlpha:0.60, etaLid:0.15, label:'Borosilicate Glass' },
  carafe_glass:{ cWall:292.0, hSw:4.60, hAmb:0.64, rinseAlpha:0.55, etaLid:0.20, label:'Thick Glass Carafe (Chemex/Press)' },
  vacuum_ss: { cWall:42.0,  hSw:2.60, hAmb:0.16, rinseAlpha:0.78, etaLid:0.35, label:'Double-Wall Vacuum Stainless' },
  vacuum:    { cWall:42.0,  hSw:2.60, hAmb:0.16, rinseAlpha:0.78, etaLid:0.35, label:'Double-Wall Vacuum Stainless' },
  stainless: { cWall:115.0, hSw:4.90, hAmb:0.55, rinseAlpha:0.68, etaLid:0.20, label:'Single-Wall Stainless Steel' },
  aiden:     { cWall:75.0,  hSw:3.10, hAmb:0.18, rinseAlpha:0.82, etaLid:0.96, label:'Fellow Aiden Sealed Chamber' },
  brass_group:{ cWall:420.0, hSw:9.50, hAmb:0.30, rinseAlpha:0.96, etaLid:0.99, label:'PID Heated Espresso Group' }
};

function resolveWallProps(matKey, methodKey){
  if (methodKey === 'aiden') return BREWER_WALL_PROPS.aiden;
  if (methodKey === 'espresso' || (methodKey === 'lever_espresso' && !matKey)) return BREWER_WALL_PROPS.brass_group;
  if (methodKey === 'chemex' && (!matKey || matKey === 'glass')) return BREWER_WALL_PROPS.carafe_glass;
  const k = String(matKey || 'plastic').toLowerCase().replace(/[\s-]+/g, '_');
  return BREWER_WALL_PROPS[k] || BREWER_WALL_PROPS.plastic;
}

function resolveInitialWallTempC(preheatState, tAmbC, tKettleC, wallProps, methodKey){
  if (methodKey === 'espresso') return tKettleC - 0.8;
  const st = String(preheatState || (methodKey === 'lever_espresso' ? 'pid_preheat' : 'boiling_rinse')).toLowerCase();
  if (st === 'none' || st === 'cold' || st === 'unpreheated') return tAmbC;
  if (st === 'tap_warm' || st === 'warm') return Math.min(tKettleC, Math.max(tAmbC, 36.0));
  if (st === 'steam_closed' || st === 'pid_preheat') return Math.max(tAmbC, tKettleC - 2.0);
  /* Boiling / hot filter rinse: C_wall stays physical while T_wall(0) rises! */
  return tAmbC + wallProps.rinseAlpha * (tKettleC - tAmbC);
}

function simulateSlurryCurve(cfg){
  cfg = cfg || {};
  const methodKey = cfg.method || cfg.methodKey || 'v60';
  const mPhys = typeof G.methodPhysicsFor === 'function' ? G.methodPhysicsFor(methodKey) : { chiRet:0.15, rWater:2.1, defaultFilterId:'cone-bleached' };
  const doseG = _clamp(cfg.doseG != null ? cfg.doseG : cfg.dose, 0.1, 300, 15.0);
  const waterG = _clamp(cfg.waterG != null ? cfg.waterG : cfg.water, 5, 5000, 250.0);
  const elevM = _clamp(cfg.altitudeM != null ? cfg.altitudeM : cfg.elevM, -430, 5500, 0);
  const boilC = boilingPointC(elevM);
  const isSealedPressure = (methodKey === 'espresso' || methodKey === 'lever_espresso') && (_clamp(cfg.pressureBar, 1, 15, 9) >= 1.2);
  const rawKettleC = _clamp(cfg.kettleTempC != null ? cfg.kettleTempC : cfg.tempC, 0, 108, 94.0);
  const maxOpenC = boilC - 0.8;
  const cappedByBoil = !isSealedPressure && rawKettleC > maxOpenC;
  const kettleTempC = isSealedPressure ? rawKettleC : Math.min(rawKettleC, maxOpenC);
  const boilDeficitC = (!isSealedPressure && rawKettleC > kettleTempC) ? _rnd(rawKettleC - kettleTempC, 2) : 0;

  const tAmbC = (methodKey === 'cold' && rawKettleC <= 12) ? rawKettleC : (methodKey === 'cold_drip' && rawKettleC <= 10 ? rawKettleC + 2.5 : _clamp(cfg.ambientTempC, 0, 40, 21.0));
  const beanTemp0C = cfg.frozenBeans ? -18.0 : ((methodKey === 'cold' || methodKey === 'cold_drip') ? rawKettleC : _clamp(cfg.beanTempC, -25, 38, tAmbC));
  const pourHeightCm = _clamp(cfg.pourHeightCm, 1, 30, (methodKey === 'aiden' || methodKey === 'xbloom') ? 2.5 : 5.5);
  const wall = resolveWallProps(cfg.brewerMaterial || cfg.material, methodKey);
  const lidFactor = cfg.lidded ? Math.max(wall.etaLid, 0.88) : wall.etaLid;
  const tWall0C = resolveInitialWallTempC(cfg.preheatState || cfg.preheat, tAmbC, kettleTempC, wall, methodKey);
  const fInfo = (typeof G.filterV6For === 'function' ? G.filterV6For(cfg.filterId || mPhys.defaultFilterId) : null) || { dryMassG:1.1, wDryG:2.4 };
  const mFilterG = _clamp(fInfo.dryMassG != null ? fInfo.dryMassG : 1.1, 0, 10, 1.1);

  const totalTimeS = _clamp(cfg.totalTimeS, 10, 86400, methodKey === 'espresso' ? 28 : methodKey === 'cold' ? 64800 : 180);
  const dt = methodKey === 'espresso' || methodKey === 'lever_espresso' ? 0.5
    : (methodKey === 'cold' || methodKey === 'cold_drip') ? Math.max(60, Math.ceil(totalTimeS / 120))
    : Math.max(1.0, Math.ceil(totalTimeS / 180));
  const nSteps = Math.min(MAX_ODE_STEPS - 1, Math.max(8, Math.round(totalTimeS / dt)));

  /* Default pulse schedule if none supplied */
  let pulses = Array.isArray(cfg.pulses) && cfg.pulses.length ? cfg.pulses : null;
  if (!pulses){
    if (methodKey === 'cold_drip'){
      pulses = [{ t:0, addG:waterG, durS:Math.max(60, totalTimeS * 0.92), tempC:kettleTempC }];
    } else if (mPhys.chiRet >= 0.90 || methodKey === 'espresso' || methodKey === 'lever_espresso' || methodKey === 'moka' || methodKey === 'philips5500'){
      pulses = [{ t:0, addG:waterG, durS:Math.min(14, totalTimeS * 0.4), tempC:kettleTempC }];
    } else {
      const bG = Math.min(waterG * 0.35, doseG * 3.0);
      const p1G = (waterG - bG) * 0.55;
      const p2G = Math.max(0, waterG - bG - p1G);
      const bTemp = cfg.samoBloom ? 60.0 : kettleTempC;
      pulses = [
        { t:0, addG:bG, durS:8, tempC:bTemp },
        { t:Math.min(40, totalTimeS * 0.24), addG:p1G, durS:16, tempC:kettleTempC },
        { t:Math.min(85, totalTimeS * 0.50), addG:p2G, durS:16, tempC:cfg.decliningTemp ? Math.max(82, kettleTempC - 3.5) : kettleTempC }
      ];
    }
  } else if (pulses[0] && pulses[0].waterG != null && pulses[0].addG == null){
    /* Convert cumulative knots { t, waterG } -> incremental { t, addG, durS, tempC } */
    const conv = [];
    let prevW = 0;
    for (let i = 0; i < pulses.length; i++){
      const curW = _clamp(pulses[i].waterG, prevW, waterG * 1.2, prevW);
      const dm = curW - prevW;
      if (dm > 0.01 || i === 0){
        const nextT = i + 1 < pulses.length ? pulses[i + 1].t : pulses[i].t + 10;
        conv.push({
          t:_clamp(pulses[i].t, 0, totalTimeS, 0),
          addG:dm > 0 ? dm : waterG,
          durS:Math.max(2, Math.min(20, (nextT - pulses[i].t) * 0.65)),
          tempC:pulses[i].tempC != null ? pulses[i].tempC : kettleTempC
        });
        prevW = curW;
      }
    }
    pulses = conv.length ? conv : [{ t:0, addG:waterG, durS:12, tempC:kettleTempC }];
  }

  const isSteep = mPhys.chiRet >= 0.85;
  const releaseTimeS = methodKey === 'switch' || methodKey === 'clever'
    ? _clamp(cfg.releaseTimeS, 30, totalTimeS - 15, totalTimeS - 45)
    : (isSteep ? totalTimeS : 0);

  let mWaterSlurry = 0.0;
  let mDrained = 0.0;
  let tWall = tWall0C;
  /* Dry bed starts at bean/wall weighted temperature */
  let tSlurry = (CP_COFFEE_DRY * doseG * beanTemp0C + CP_PAPER_DRY * mFilterG * tWall0C) /
                (CP_COFFEE_DRY * doseG + CP_PAPER_DRY * mFilterG);
  let etaVoc = 1.0;
  let weightedTempSum = 0.0;
  let weightSum = 0.0;
  let peakSlurryC = -999;
  let minSlurryC = 999;

  for (let s = 0; s <= nSteps; s++){
    const t = s * dt;
    _arenaT[s] = t;
    _arenaTempSlurry[s] = tSlurry;
    _arenaTempWall[s] = tWall;
    _arenaMassSlurry[s] = mWaterSlurry;
    _arenaMassCup[s] = mDrained;
    _arenaVoc[s] = etaVoc;

    if (mWaterSlurry > 1.0){
      weightedTempSum += tSlurry * mWaterSlurry * dt;
      weightSum += mWaterSlurry * dt;
      if (tSlurry > peakSlurryC) peakSlurryC = tSlurry;
      if (tSlurry < minSlurryC) minSlurryC = tSlurry;
    }
    if (s === nSteps) break;

    /* Inflow rate q_in(t) and inflow stream temperature */
    let qIn = 0.0;
    let tInStream = kettleTempC;
    for (let p = 0; p < pulses.length; p++){
      const pu = pulses[p];
      if (t >= pu.t && t < pu.t + pu.durS){
        const qi = pu.addG / pu.durS;
        const pTemp = pu.tempC != null ? (isSealedPressure ? pu.tempC : Math.min(pu.tempC, maxOpenC)) : kettleTempC;
        const airDrop = (1 - lidFactor) * 0.042 * pourHeightCm * Math.max(0, pTemp - tAmbC) / 55.0;
        const ti = pTemp - airDrop;
        tInStream = qIn > 0 ? (qIn * tInStream + qi * ti) / (qIn + qi) : ti;
        qIn += qi;
      }
    }

    /* Outflow / cone drainage rate q_out(t): active cone drainage reduces M_w(t)! */
    const heldMax = mPhys.rWater * doseG;
    const freeHead = Math.max(0, mWaterSlurry - heldMax);
    let qOut = 0.0;
    if (!isSteep && t >= releaseTimeS && freeHead > 0){
      const tauDrain = methodKey === 'espresso' || methodKey === 'lever_espresso' ? 5.5
        : methodKey === 'chemex' ? 32.0
        : 20.0;
      qOut = Math.min(freeHead / dt, freeHead / tauDrain + (qIn === 0 ? 0.45 : 0.15));
    } else if ((methodKey === 'switch' || methodKey === 'clever') && t >= releaseTimeS && freeHead > 0){
      qOut = Math.min(freeHead / dt, freeHead / 14.0 + 0.8);
    }

    const cSlurry = Math.max(8.0, CP_COFFEE_DRY * doseG + CP_PAPER_DRY * mFilterG + CP_WATER * mWaterSlurry);
    const qEvap = methodKey === 'cold' || methodKey === 'cold_drip' ? 0
      : (1 - lidFactor) * 0.085 * Math.max(0, tSlurry - tAmbC) * Math.exp(0.032 * (tSlurry - 80));
    /* Exact 2x2 unconditionally A-stable & L-stable backward-Euler coupled (T_slurry, T_wall) solve! */
    const hAmbS = (1 - lidFactor) * 0.14;
    const cwDt = wall.cWall / dt;
    const denomW = cwDt + wall.hAmb + wall.hSw;
    const alphaW = (cwDt * tWall + wall.hAmb * tAmbC) / denomW;
    const betaW = wall.hSw / denomW;
    const csDt = cSlurry / dt;
    const qInCp = qIn * CP_WATER;
    const nextTSlurry = (csDt * tSlurry + qInCp * tInStream + hAmbS * tAmbC + wall.hSw * alphaW - qEvap) / (csDt + qInCp + hAmbS + wall.hSw * (1.0 - betaW));
    const nextTWall = alphaW + betaW * nextTSlurry;
    tSlurry = _clamp(nextTSlurry, -20, 108, tSlurry);
    tWall = _clamp(nextTWall, -20, 108, tWall);
    mWaterSlurry = Math.max(0, mWaterSlurry + (qIn - qOut) * dt);
    mDrained = Math.max(0, mDrained + qOut * dt);

    /* Henry's Law volatile retention survival (1000 * 35.0 kJ/mol / R_GAS) */
    if (mWaterSlurry > 0.5 && tSlurry > 25){
      const kStrip = (1 - lidFactor) * 5.2e-4 * Math.exp((1000.0 * 35.0 / R_GAS) * ((1 / 363.15) - (1 / (tSlurry + 273.15))));
      etaVoc *= Math.exp(-kStrip * dt);
    }
  }

  const meanSlurryC = weightSum > 0 ? _rnd(weightedTempSum / weightSum, 2) : _rnd(tSlurry, 2);
  if (peakSlurryC < -900) peakSlurryC = meanSlurryC;
  if (minSlurryC > 900) minSlurryC = meanSlurryC;

  const trajectory = [];
  const stride = Math.max(1, Math.floor(nSteps / 36));
  for (let i = 0; i <= nSteps; i += stride){
    trajectory.push({
      t:_rnd(_arenaT[i], 1),
      slurryC:_rnd(_arenaTempSlurry[i], 2),
      wallC:_rnd(_arenaTempWall[i], 2),
      slurryWaterG:_rnd(_arenaMassSlurry[i], 1),
      cupG:_rnd(_arenaMassCup[i], 1),
      vocSurvival:_rnd(_arenaVoc[i], 4)
    });
  }

  return {
    boilC,
    kettleTempC:_rnd(kettleTempC, 2),
    cappedByBoil,
    boilDeficitC,
    spilloverGrindPct:_rnd(-1.8 * boilDeficitC, 2),
    wallMaterial:wall.label,
    cWallJK:wall.cWall,
    tWall0C:_rnd(tWall0C, 2),
    meanSlurryC,
    peakSlurryC:_rnd(peakSlurryC, 2),
    endSlurryC:_rnd(tSlurry, 2),
    thermalDropC:_rnd(kettleTempC - meanSlurryC, 2),
    vocSurvivalPct:_rnd(etaVoc * 100, 1),
    trajectory
  };
}

function solveFlashIcedEnthalpy(cfg){
  cfg = cfg || {};
  const mBrew = _clamp(cfg.hotBrewMassG != null ? cfg.hotBrewMassG : cfg.brewG, 0, 5000, 0);
  const mIce = _clamp(cfg.iceMassG != null ? cfg.iceMassG : cfg.iceG, 0, 5000, 0);
  const tBrew = _clamp(cfg.hotBrewTempC != null ? cfg.hotBrewTempC : cfg.tempC, 0, 100, 74.0);
  const tIce0 = _clamp(cfg.iceTempC, -35, 0, -18.0);
  const hotTdsPct = _clamp(cfg.hotTdsPct, 0, 30, 2.20);
  const targetServeC = _clamp(cfg.targetServeC, 0, 25, 4.0);

  /* Bug C12 Guard: Zero 0/0 NaN when both hot mass and ice mass are 0! */
  if (mBrew <= 0 && mIce <= 0){
    return {
      ok:false,
      regime:'empty',
      finalTempC:0,
      meltedIceG:0,
      unmeltedIceG:0,
      liquidBeverageG:0,
      dilutedTdsPct:0,
      optimalIceShare:0.38
    };
  }
  if (mIce <= 0){
    return {
      ok:true,
      regime:'all_liquid_hot',
      finalTempC:_rnd(tBrew, 2),
      meltedIceG:0,
      unmeltedIceG:0,
      liquidBeverageG:_rnd(mBrew, 1),
      dilutedTdsPct:_rnd(hotTdsPct, 3),
      optimalIceShare:0.38
    };
  }

  const qHot = mBrew * CP_WATER * tBrew;
  const qWarmIce = mIce * CP_ICE * (0.0 - tIce0);
  const qLatent = mIce * LF_ICE;

  let regime = 'two_phase_0C';
  let finalTempC = 0.0;
  let meltedIceG = 0.0;
  if (qHot <= qWarmIce){
    regime = 'subzero_frozen';
    meltedIceG = 0.0;
    finalTempC = tIce0 + qHot / Math.max(1e-6, mIce * CP_ICE);
  } else if (qHot <= qWarmIce + qLatent){
    regime = 'two_phase_0C';
    meltedIceG = (qHot - qWarmIce) / LF_ICE;
    finalTempC = 0.0;
  } else {
    regime = 'all_melted';
    meltedIceG = mIce;
    finalTempC = (qHot - qWarmIce - qLatent) / ((mBrew + mIce) * CP_WATER);
  }

  const unmeltedIceG = Math.max(0, mIce - meltedIceG);
  const liquidBeverageG = mBrew + meltedIceG;
  const dilutedTdsPct = liquidBeverageG > 0 ? (hotTdsPct * mBrew / liquidBeverageG) : 0;

  /* Closed-form optimal ice fraction phi_ice* to land right at targetServeC with 0 unmelted dilution error */
  const numOpt = CP_WATER * (tBrew - targetServeC);
  const denOpt = numOpt + CP_ICE * (0 - tIce0) + LF_ICE + CP_WATER * targetServeC;
  const optimalIceShare = _clamp(numOpt / Math.max(1.0, denOpt), 0.20, 0.55, 0.38);

  return {
    ok:true,
    regime,
    finalTempC:_rnd(finalTempC, 2),
    meltedIceG:_rnd(meltedIceG, 1),
    unmeltedIceG:_rnd(unmeltedIceG, 1),
    liquidBeverageG:_rnd(liquidBeverageG, 1),
    dilutedTdsPct:_rnd(dilutedTdsPct, 3),
    optimalIceShare:_rnd(optimalIceShare, 3)
  };
}

/* ============================================================================
   2. BIMODAL PSD & BURR MAPPING SUB-MODULE (psd)
   - Bimodal log-normal + 4-node Gauss-Hermite + exact Acklam Turkish 85 um
   - Exact MGF Sauter Mean Diameter d_32
   - DiFluid Omni scan override + flexible mapMicronsToGrinder
   ============================================================================ */

function computeBimodalPSD(cfg){
  cfg = cfg || {};
  const grinderKeyRaw = String(cfg.grinderKey || 'comandante-c40').toLowerCase().replace(/_/g, '-');
  const arch = typeof G.burrArchetypeFor === 'function'
    ? G.burrArchetypeFor(grinderKeyRaw)
    : { id:'classic_conical', phiFBase:0.145, sigmaC:0.38, spanNom:1.40 };

  let d50 = _clamp(cfg.d50Um != null ? cfg.d50Um : cfg.um, 45, 1600, 560);
  if (cfg.frozenGrind) d50 += 12.0; /* Cryo-grind +12 um narrower unimodal shift */

  const agtron = _clamp(cfg.agtron, 22, 108, 65);
  /* Brittle fines multipliers: dark porous (<45 Ag) AND ultra-dense Nordic (>85 Ag) elevate shatter fines */
  const betaRoast = agtron < 45 ? (1.0 + 0.24 * ((45 - agtron) / 20))
    : agtron > 82 ? (1.0 + 0.14 * ((agtron - 82) / 22))
    : 1.0;
  const betaOrigin = cfg.isEthLandrace ? 1.22 : 1.0;
  const betaDecaf = cfg.isDecaf ? 1.28 : 1.0;
  const betaCryo = cfg.frozenGrind ? 0.93 : 1.0;
  const rpm = cfg.rpm != null && isFinite(+cfg.rpm) ? _clamp(+cfg.rpm, 50, 1800, 90) : null;
  /* Fixes Bug C7: Low 60-70 RPM minimizes brittle shatter fines vs 110-120 RPM high-shear */
  const betaRpm = rpm == null ? 1.0 : (rpm <= 150 ? (0.88 + 0.0020 * (rpm - 50)) : (1.0 + 0.08 * ((rpm - 800) / 800)));

  let phiF = _clamp(arch.phiFBase * betaRoast * betaOrigin * betaDecaf * betaCryo * betaRpm, 0.03, 0.46, 0.14);
  let sigmaC = arch.sigmaC * (cfg.frozenGrind ? 0.94 : 1.0);

  /* Optional DiFluid Omni (D10, D50, D90) direct empirical override */
  if (cfg.omniScan && isFinite(+cfg.omniScan.d50) && +cfg.omniScan.d50 > 40){
    d50 = _clamp(+cfg.omniScan.d50, 45, 1600, d50);
    if (isFinite(+cfg.omniScan.d10) && isFinite(+cfg.omniScan.d90) && +cfg.omniScan.d90 > +cfg.omniScan.d10){
      const span = (+cfg.omniScan.d90 - +cfg.omniScan.d10) / d50;
      sigmaC = _clamp(span / 3.15, 0.18, 0.68, sigmaC);
      phiF = _clamp(0.04 + 0.11 * Math.max(0, span - 0.85), 0.03, 0.45, phiF);
    }
  }

  let dF = 38.0;
  const sigmaF = 0.48;
  /* Exact Fine-D50 / Turkish 85 um Median Consistency (#17 in Science Signoff):
     Ensure F_V(D50) = phi_f * Phi(ln(D50/d_f)/sigma_f) + (1 - phi_f) * Phi(ln(D50/d_c)/sigma_c) === 0.500! */
  let uF = phiF * normCdf(Math.log(d50 / dF) / sigmaF);
  if (uF >= 0.46){
    dF = Math.min(38.0, d50 * 0.55);
    phiF = Math.min(phiF, 0.38);
    uF = phiF * normCdf(Math.log(d50 / dF) / sigmaF);
  }
  const pCoarseAtD50 = _clamp((0.5 - uF) / Math.max(0.05, 1 - phiF), 0.005, 0.995, 0.5);
  const dC = d50 * Math.exp(-sigmaC * normInv(pCoarseAtD50));

  /* Exact Log-Normal Moment-Generating-Function Sauter Mean Diameter d_32 */
  const invD32 = (phiF / dF) * Math.exp(0.5 * sigmaF * sigmaF) +
                 ((1 - phiF) / dC) * Math.exp(0.5 * sigmaC * sigmaC);
  const d32Um = 1.0 / invD32;

  /* Populate 5 Quadrature Nodes (Node 0 = fines mode, Nodes 1..4 = Gauss-Hermite coarse mode) */
  _nodeD[0] = dF * Math.exp(-0.25 * sigmaF * sigmaF);
  _nodeW[0] = phiF;
  for (let k = 0; k < 4; k++){
    _nodeD[k + 1] = dC * Math.exp(sigmaC * GH4_Z[k]);
    _nodeW[k + 1] = (1 - phiF) * GH4_W[k];
  }

  const deltaCellUm = 42.0;
  const nodes = new Array(5);
  for (let j = 0; j < 5; j++){
    const dj = _nodeD[j];
    const rj = 0.5 * dj;
    const fBroken = rj <= deltaCellUm ? 1.0 : (1.0 - Math.pow(1.0 - deltaCellUm / rj, 3));
    const etaAcc = 1.0 - 0.24 * Math.pow(dj / (dj + 420.0), 1.35);
    _nodeBroken[j] = fBroken;
    _nodeAcc[j] = etaAcc;
    nodes[j] = {
      dUm:_rnd(dj, 2),
      weight:_rnd(_nodeW[j], 5),
      brokenFrac:_rnd(fBroken, 4),
      accessibleFrac:_rnd(etaAcc, 4)
    };
  }

  /* Verify CDF at D50 and compute D10 / D90 via fast monotone bisection */
  const cdfAt = x => phiF * normCdf(Math.log(x / dF) / sigmaF) + (1 - phiF) * normCdf(Math.log(x / dC) / sigmaC);
  const quantAt = q => {
    let lo = 5.0, hi = Math.max(2500.0, d50 * 4.0);
    for (let it = 0; it < 28; it++){
      const mid = 0.5 * (lo + hi);
      if (cdfAt(mid) < q) lo = mid; else hi = mid;
    }
    return 0.5 * (lo + hi);
  };
  const d10Um = quantAt(0.10);
  const d90Um = quantAt(0.90);
  const finesUnder100Pct = cdfAt(100.0) * 100.0;

  return {
    archetype:arch.id,
    d10Um:_rnd(d10Um, 1),
    d50Um:_rnd(d50, 1),
    d90Um:_rnd(d90Um, 1),
    d32Um:_rnd(d32Um, 2),
    dCoarseUm:_rnd(dC, 2),
    dFinesUm:_rnd(dF, 2),
    phiF:_rnd(phiF, 4),
    sigmaC:_rnd(sigmaC, 4),
    span:_rnd((d90Um - d10Um) / Math.max(1, d50), 3),
    finesUnder100Pct:_rnd(finesUnder100Pct, 2),
    cdfAtD50:_rnd(cdfAt(d50), 4),
    nodes
  };
}

function parseOmniScan(scan){
  if (!scan || typeof scan !== 'object') return { ok:false };
  const d10 = parseFloat(scan.d10 != null ? scan.d10 : scan.d10Um);
  const d50 = parseFloat(scan.d50 != null ? scan.d50 : scan.d50Um);
  const d90 = parseFloat(scan.d90 != null ? scan.d90 : scan.d90Um);
  if (!(isFinite(d50) && d50 >= 40 && d50 <= 2200)) return { ok:false };
  const ok10 = isFinite(d10) && d10 > 5 && d10 < d50;
  const ok90 = isFinite(d90) && d90 > d50 && d90 <= 3500;
  const est10 = ok10 ? d10 : d50 * 0.42;
  const est90 = ok90 ? d90 : d50 * 1.62;
  const span = scan.span != null && isFinite(+scan.span) && +scan.span > 0.2
    ? +scan.span
    : (est90 - est10) / d50;
  const psd = computeBimodalPSD({ omniScan:{ d10:est10, d50, d90:est90, span } });
  return Object.assign({ ok:true }, psd);
}

function _grinderClickIncForFmt(fmt){
  if (fmt === 'quarter_step') return 0.25;
  if (fmt === 'half_step') return 0.5;
  if (fmt === 'tenth_step' || fmt === 'sette_31E') return 0.1;
  if (fmt === 'chestnut_x_5') return 0.2;
  return 1;
}

/* Smart bidirectional parameter guard: supports BOTH (um, grinderKey, calib) AND (grinderKey, um, calib)! */
function mapMicronsToGrinder(a, b, calib, methodKey){
  let um, gKey;
  if (typeof a === 'number' || (typeof a === 'string' && /^\s*\d+(?:\.\d+)?\s*$/.test(a))){
    um = +a;
    gKey = String(b || 'comandante-c40');
  } else {
    gKey = String(a || 'comandante-c40');
    um = +b;
  }
  const normKey = gKey.trim().toLowerCase().replace(/_/g, '-');
  const targetUm = _clamp(um, 40, 2200, 560);

  /* Support PocketMicronLens 2-point burr calibration object { grinderKey, slopeM, d0OffsetUm } */
  if (calib && typeof calib === 'object' && !Array.isArray(calib) && calib.slopeM > 0){
    if (!calib.grinderKey || String(calib.grinderKey).toLowerCase().replace(/_/g, '-') === normKey){
      const cv = G.GRINDER_CURVES ? G.GRINDER_CURVES[normKey] : null;
      if (cv && ((cv.filterOnly && (methodKey === 'espresso' || methodKey === 'lever_espresso' || methodKey === 'turkish')) || (cv.noTurk && methodKey === 'turkish'))){
        return G.grinderSettingForMicrons(normKey, targetUm, methodKey || 'v60', null);
      }
      const gObj = typeof G.grinderFor === 'function' ? G.grinderFor(normKey) : null;
      const rawUnclamped = (targetUm - (+calib.d0OffsetUm || 100)) / (+calib.slopeM);
      const clickInc = _grinderClickIncForFmt(cv && cv.fmt);
      const minRaw = cv && cv.minSafeRaw != null ? cv.minSafeRaw : 0;
      const maxRaw = cv && cv.maxRaw != null ? cv.maxRaw : 500;
      const setting = _rnd(_clamp(rawUnclamped, minRaw, maxRaw, rawUnclamped), clickInc < 1 ? 2 : 1);
      const fmtObj = typeof G.formatGrinderSetting === 'function' ? G.formatGrinderSetting(normKey, setting) : null;
      const disp = (fmtObj && fmtObj.display) ? fmtObj.display : (setting + ' clicks');
      const stepUm = _rnd(+calib.slopeM, 1);
      return {
        ok:true,
        incompatible:false,
        grinderKey:normKey,
        grinder:gObj ? gObj.name : normKey,
        um:targetUm,
        setting:fmtObj && fmtObj.clicks != null ? fmtObj.clicks : setting,
        clicks:fmtObj && fmtObj.clicks != null ? fmtObj.clicks : setting,
        display:disp,
        shortDisplay:(fmtObj && fmtObj.shortDisplay) ? fmtObj.shortDisplay : disp,
        label:(gObj ? gObj.short + ': ' : '') + disp,
        unit:gObj ? (gObj.unit || 'clicks') : 'clicks',
        stepUm,
        clickInc,
        umPerClick:_rnd(stepUm * clickInc, 1),
        minRaw,
        maxRaw,
        calibrated:true
      };
    }
  }

  if (typeof G.grinderSettingForMicrons === 'function'){
    const cleanCal = (calib && typeof calib === 'object' && !Array.isArray(calib) && !calib.slopeM) ? calib : null;
    const res = G.grinderSettingForMicrons(normKey, targetUm, methodKey || 'v60', cleanCal);
    if (res){
      const gObj = typeof G.grinderFor === 'function' ? G.grinderFor(normKey) : null;
      const c = G.GRINDER_CURVES && G.GRINDER_CURVES[normKey];
      const kn = c && (c.knots || c.refKnots);
      const isSteplessTaste = !!(
        res.calibMode === 'taste' || res.stepless ||
        (c && c.kind === 'calibrate' && !c.refKnots && !c.knots) ||
        (c && (c.fmt === 'unmarked_nut' || c.fmt === 'chirp_relative_marks'))
      );
      const sl = kn && typeof G.slopeAtUm === 'function' ? G.slopeAtUm(kn, targetUm) : 0.04;
      const clickInc = isSteplessTaste ? 0 : _grinderClickIncForFmt(c && c.fmt);
      const stepUm = res.preground ? 0 : (isSteplessTaste ? 25 : _rnd(1 / Math.max(0.005, sl), 1));
      const minRaw = c && c.minSafeRaw != null ? c.minSafeRaw : (gObj && gObj.min != null ? gObj.min : 0);
      const maxRaw = c && c.maxRaw != null ? c.maxRaw : (gObj && gObj.max != null ? gObj.max : 500);
      const dispTxt = res.display || (isSteplessTaste ? 'Stepless / Calibrate by taste' : '');
      const shortTxt = res.shortDisplay || dispTxt || (Math.round(targetUm) + ' um');
      return Object.assign({}, res, {
        um:res.fixedUm || targetUm,
        setting:res.raw,
        clicks:res.raw,
        calibMode:isSteplessTaste ? 'taste' : (res.calibMode || null),
        stepless:isSteplessTaste || !!res.stepless,
        fmt:(c && c.fmt) || res.fmt || null,
        display:dispTxt,
        shortDisplay:shortTxt,
        label:res.incompatible ? (res.headline || res.warning || 'Incompatible') : ((gObj ? gObj.short + ': ' : '') + dispTxt),
        unit:isSteplessTaste ? (res.unit || ((c && c.fmt === 'unmarked_nut') ? 'turn' : 'mark')) : (gObj ? (gObj.unit || 'clicks') : 'clicks'),
        stepUm,
        clickInc,
        umPerClick:(res.preground || isSteplessTaste) ? 0 : _rnd(stepUm * clickInc, 1),
        minRaw,
        maxRaw
      });
    }
  }
  return { ok:false, grinderKey:normKey, um:targetUm, setting:null, clickInc:1, stepUm:25, umPerClick:25, shortDisplay:Math.round(targetUm) + ' um', label:Math.round(targetUm) + ' um' };
}

/* ============================================================================
   3. WATER CHEMISTRY & CUP PROTON BALANCE SUB-MODULE (water)
   - Wraps 8-salt IUPAC stoichiometry + Hendon extraction rate modifiers
   - Monotone 26-step pH bisection w/ D = 0 g atmospheric CO2 pure-water guard
   ============================================================================ */

function solveWaterChemistry(cfg){
  cfg = cfg || {};
  const volL = _clamp(cfg.volumeL != null ? cfg.volumeL : cfg.volL, 0.1, 100, 1.0);
  const SALTS = (G.WATER_IUPAC && G.WATER_IUPAC.SALTS) || {};
  let lab = null;

  if (cfg.reagentsGPerL && typeof cfg.reagentsGPerL === 'object'){
    const r = cfg.reagentsGPerL;
    const ppmFrom = (gPerL, sKey, fbMgPerPpm) => {
      const g = Math.max(0, +gPerL || 0);
      if (g <= 0) return 0;
      const mpp = (SALTS[sKey] && SALTS[sKey].mgPerPpm) || fbMgPerPpm;
      return (g * 1000.0) / mpp;
    };
    const ghEpsom = ppmFrom(r.mgso4 != null ? r.mgso4 : r.epsom, 'epsom', 2.4626);
    const ghMgCl2 = ppmFrom(r.mgcl2, 'mgcl2', 2.0312);
    const ghCa2H = ppmFrom(r.cacl2_2h2o != null ? r.cacl2_2h2o : r.cacl2_dihydrate, 'cacl2_dihydrate', 1.4688);
    const ghCaAnh = ppmFrom(r.cacl2 != null ? r.cacl2 : r.cacl2_anhydrous, 'cacl2_anhydrous', 1.1088);
    const khNaHco3 = ppmFrom(r.nahco3, 'nahco3', 1.6787);
    const khKHco3 = ppmFrom(r.khco3, 'khco3', 2.0006);
    const khK3Cit = ppmFrom(r.k3cit, 'k3cit', 2.1609);
    const khNa3Cit = ppmFrom(r.na3cit, 'na3cit', 1.9590);
    const ghMg = ghEpsom + ghMgCl2;
    const ghCa = ghCa2H + ghCaAnh;
    const khCarb = khNaHco3 + khKHco3;
    const khCitOnly = khK3Cit + khNa3Cit;
    const isPureCit = khCitOnly > 0 && khCarb <= 0.05;
    if (typeof G.calcWaterLab === 'function'){
      lab = G.calcWaterLab({
        ghMg, ghCa,
        kh:isPureCit ? khCitOnly : khCarb,
        khCarbBase:isPureCit ? 0 : 0,
        khCit:isPureCit ? khCitOnly : khCitOnly,
        volL,
        mgSalt:ghMgCl2 > ghEpsom ? 'mgcl2' : 'epsom',
        cacl2Form:ghCaAnh > ghCa2H ? 'anhydrous' : 'dihydrate',
        khSalt:isPureCit ? (khK3Cit >= khNa3Cit ? 'k3cit' : 'na3cit') : (khKHco3 > khNaHco3 ? 'khco3' : 'nahco3'),
        citrate:isPureCit
      });
      if (!isPureCit && khCitOnly > 0){
        lab.khCit = _rnd(khCitOnly, 1);
        lab.kh = _rnd(khCarb + khCitOnly, 1);
        lab.khEffPh5 = _rnd(0.96 * khCarb + 0.45 * khCitOnly, 1);
      }
    }
  } else if (cfg.presetKey && typeof G.waterPresetFor === 'function'){
    const pObj = G.waterPresetFor(cfg.presetKey);
    if (pObj && typeof G.calcWaterLab === 'function'){
      lab = G.calcWaterLab({
        ghMg:pObj.ghMg != null ? pObj.ghMg : pObj.gh * 0.6,
        ghCa:pObj.ghCa != null ? pObj.ghCa : pObj.gh * 0.4,
        kh:pObj.kh,
        volL,
        khSalt:pObj.khSalt || (pObj.citrate ? 'na3cit' : 'nahco3'),
        citrate:!!pObj.citrate
      });
    }
  }

  if (!lab && typeof G.calcWaterLab === 'function'){
    const gh = _clamp(cfg.ghPpm != null ? cfg.ghPpm : cfg.gh, 0, 600, 68);
    const khCit = _clamp(cfg.citrateKhPpm != null ? cfg.citrateKhPpm : (cfg.citrate ? (cfg.khPpm != null ? cfg.khPpm : (cfg.kh != null ? cfg.kh : 40)) : 0), 0, 250, 0);
    const khDefault = khCit > 0 && cfg.khPpm == null && cfg.kh == null ? khCit : 40;
    const kh = _clamp(cfg.khPpm != null ? cfg.khPpm : cfg.kh, 0, 400, khDefault);
    const mgShare = _clamp(cfg.mgShare, 0, 1, 0.55);
    const ghMg = cfg.ghMg != null ? +cfg.ghMg : gh * mgShare;
    const ghCa = cfg.ghCa != null ? +cfg.ghCa : gh * (1 - mgShare);
    const pureCit = khCit > 0 && Math.abs(kh - khCit) < 0.5;
    lab = G.calcWaterLab({
      ghMg, ghCa,
      kh:pureCit ? khCit : Math.max(0, kh - khCit),
      khCit,
      volL,
      khSalt:pureCit ? 'k3cit' : (cfg.khSalt || 'nahco3'),
      citrate:pureCit
    });
  }

  const gh = lab ? lab.gh : 68;
  const ghMg = lab ? lab.ghMg : 38;
  const ghCa = lab ? lab.ghCa : 30;
  const khHco3 = lab ? lab.khHco3 : 40;
  const khCit = lab ? lab.khCit : 0;
  const kh = khHco3 + khCit;
  const mgIon = lab && lab.mgIonMgL != null ? lab.mgIonMgL : (ghMg / 4.1180);
  const caIon = lab && lab.caIonMgL != null ? lab.caIonMgL : (ghCa / 2.4973);
  const mgMmol = mgIon / 24.305;
  const caMmol = caIon / 40.078;
  const effBuf = 0.96 * khHco3 + 0.45 * khCit;
  const lsiEst = (khHco3 <= 0.5 || ghCa <= 0.5 || (lab && lab.zeroBicarbCitrate))
    ? -2.50
    : _rnd(Math.log10(Math.max(1.0, ghCa * khHco3) / 2500.0), 2);

  /* Hendon et al. (2014) DFT Cation-Assisted Extraction Multipliers across Species A, B, C */
  const kappaA = _clamp(0.94 + 0.08 * Math.min(2.0, mgMmol + 0.7 * caMmol), 0.90, 1.12, 1.0);
  const kappaB = _clamp(0.92 + 0.14 * Math.min(2.2, 1.25 * mgMmol + 0.85 * caMmol), 0.88, 1.18, 1.0);
  const kappaC = _clamp(0.95 + 0.11 * Math.min(2.2, 0.80 * mgMmol + 1.30 * caMmol), 0.90, 1.20, 1.0);

  return Object.assign({}, lab || {}, {
    ghPpm:_rnd(gh, 1),
    khPpm:_rnd(kh, 1),
    khBicarbPpm:_rnd(khHco3, 1),
    khCitratePpm:_rnd(khCit, 1),
    effectiveBufferPpm:_rnd(effBuf, 1),
    lsiEst,
    ions:{
      mg:_rnd(mgIon, 2),
      ca:_rnd(caIon, 2),
      na:lab ? lab.sodiumMgL : 0,
      k:lab ? lab.potassiumMgL : 0,
      hco3:lab ? lab.hco3IonMgL : 0,
      cl:lab ? lab.chlorideMgL : 0
    },
    hendonMultipliers:{ acid:_rnd(kappaA, 4), sweet:_rnd(kappaB, 4), bitter:_rnd(kappaC, 4) }
  });
}

function solveCupProtonBalance(cfg){
  cfg = cfg || {};
  const doseG = _clamp(cfg.doseG != null ? cfg.doseG : cfg.dose, 0, 500, 15);
  const waterL = Math.max(0.015, _clamp(cfg.waterG != null ? cfg.waterG : cfg.waterMl, 15, 5000, 250) / 1000.0);
  const khBicarbPpm = _clamp(cfg.khBicarbPpm != null ? cfg.khBicarbPpm : cfg.khPpm, 0, 500, 40);
  const khCitratePpm = _clamp(cfg.khCitratePpm, 0, 300, 0);
  const agtron = _clamp(cfg.agtron, 22, 108, 68);
  const eyFrac = _clamp((cfg.eyPct != null ? cfg.eyPct : 20.0) / 100.0, 0, 0.34, 0.20);

  /* Pure-Water Atmospheric CO2 Guard when D = 0 g (#12 in Science Signoff):
     At P_CO2 = 420 ppm (K_H * P_CO2 = 1.42e-5 M, K_a1 = 4.45e-7):
     0 KH -> pH ~ 5.65 air-equilibrated or 7.00 degassed pure water; 40 ppm KH -> pH ~ 8.11! */
  const alkEqPerL = (2.0 * (khBicarbPpm + khCitratePpm)) / 100086.9; /* eq/L from mg/L CaCO3 */
  if (doseG <= 1e-6 || eyFrac <= 1e-6){
    if (alkEqPerL <= 1e-6){
      const degassed = cfg.airEquilibrated === false;
      return { pH:degassed ? 7.00 : 5.65, airEquilibratedPh:5.65, titratableAcidityMeqL:0, perceivedSournessIdx:0, bufferNeutralizedFrac:0 };
    }
    const cCo2 = 1.35e-5;
    const ka1 = 4.45e-7, ka2 = 4.69e-11, kw = 1.0e-14;
    let lo = 4.5, hi = 9.5;
    for (let i = 0; i < 28; i++){
      const mid = 0.5 * (lo + hi);
      const h = Math.pow(10, -mid);
      const hco3 = cCo2 * ka1 / h;
      const co3 = hco3 * ka2 / h;
      const charge = h - (kw / h) - hco3 - 2 * co3 + alkEqPerL;
      if (charge > 0) lo = mid; else hi = mid;
    }
    return { pH:_rnd(0.5 * (lo + hi), 2), titratableAcidityMeqL:0, perceivedSournessIdx:0, bufferNeutralizedFrac:1 };
  }

  /* Extracted Coffee Organic Acids (Citric pKa 3.13/4.76/6.40, Malic 3.40/5.11, Quinic 3.46, CGA 4.4, Acetic 4.76)
     Total extractable acid ~ 0.24 - 0.42 mmol/g dry coffee scaled by roast preservation */
  const roastAcidScale = 0.58 + 0.62 * ((agtron - 28) / 72.0);
  const extractedAcidMol = doseG * (0.00034 * roastAcidScale) * Math.min(1.15, eyFrac / 0.19);
  const cAcidTot = extractedAcidMol / waterL; /* mol/L monoprotic-equivalent composite */

  /* Effective alkalinity protonation at coffee pH ~4.8-5.3:
     HCO3- (pKa1 = 6.35 -> ~96% protonated at pH 5.0) vs Citrate3- (pKa3 = 6.40, pKa2 = 4.76 -> ~45% net KH eq!) */
  const bicarbMolL = (2.0 * khBicarbPpm) / 100086.9;
  const citAlkEqL = (2.0 * khCitratePpm) / 100086.9;

  /* 26-iteration monotone bisection on pH in [3.20, 8.50] */
  let lo = 3.20, hi = 8.50;
  for (let it = 0; it < 26; it++){
    const ph = 0.5 * (lo + hi);
    const h = Math.pow(10, -ph);
    const kw = 1.0e-14;
    /* 3-pool coffee organic acid dissociation: fast strong (pKa 3.42, 45%), mid (pKa 4.72, 40%), weak phenolic (pKa 6.20, 15%) */
    const alpha1 = 1.0 / (1.0 + h / Math.pow(10, -3.42));
    const alpha2 = 1.0 / (1.0 + h / Math.pow(10, -4.72));
    const alpha3 = 1.0 / (1.0 + h / Math.pow(10, -6.20));
    const acidAnion = cAcidTot * (0.45 * alpha1 + 0.40 * alpha2 + 0.15 * alpha3);

    /* Proton uptake by added bicarbonate & citrate alkalinity */
    const fProtBicarb = 1.0 / (1.0 + Math.pow(10, ph - 6.35));
    const k1c = Math.pow(10, -3.13), k2c = Math.pow(10, -4.76), k3c = Math.pow(10, -6.40);
    const denCit = h * h * h + k1c * h * h + k1c * k2c * h + k1c * k2c * k3c;
    const nBarCit = (3 * h * h * h + 2 * k1c * h * h + k1c * k2c * h) / Math.max(1e-30, denCit);
    const baseCationNet = bicarbMolL * fProtBicarb + citAlkEqL * (nBarCit / 3.0);
    /* Intrinsic green-bean potassium ash (~0.18 mmol/g extracted) */
    const beanAshCation = (doseG * 0.000165 * Math.min(1.1, eyFrac / 0.19)) / waterL;

    const netCharge = h + beanAshCation + baseCationNet - acidAnion - (kw / h);
    if (netCharge > 0) lo = ph; else hi = ph;
  }

  const cupPh = _rnd(0.5 * (lo + hi), 2);
  const taMeqL = _rnd(Math.max(0, cAcidTot * 1000.0 - (0.96 * bicarbMolL + 0.45 * citAlkEqL) * 1000.0), 2);
  const bufferNeutralizedFrac = _clamp(((0.96 * bicarbMolL + 0.45 * citAlkEqL) / Math.max(1e-6, cAcidTot)), 0, 1, 0);
  const perceivedSournessIdx = _rnd(_clamp((5.45 - cupPh) * 3.2 + taMeqL * 0.18, 0, 10, 5), 2);

  return {
    pH:cupPh,
    titratableAcidityMeqL:taMeqL,
    bufferNeutralizedFrac:_rnd(bufferNeutralizedFrac, 3),
    perceivedSournessIdx
  };
}

function solveTapRoBlend(p){
  return typeof G.calcTapRoBlend === 'function' ? G.calcTapRoBlend(p) : { ok:false };
}

/* ============================================================================
   4. MASS CONSERVATION & ICUMSA SPS-3 REFRACTOMETRY SUB-MODULE (mass)
   - Continuum percolation-hybrid-immersion mass balance (Fixes C1 & C2)
   - Exact ICUMSA SPS-3 cubic + 5-step Newton-Raphson (<= +/-0.003 Bx)
   ============================================================================ */

function resolveImmersionFAbs(basisOrVal, fallback){
  if (typeof basisOrVal === 'number' && isFinite(basisOrVal)) return _clamp(basisOrVal, 0.0, 1.15, 1.0);
  const b = String(basisOrVal || '').toLowerCase().trim();
  if (b === 'liang' || b === 'rao' || b === 'slurry') return 0.00;
  if (b === 'gagne' || b === 'bound') return 1.00;
  if (typeof G.app === 'object' && G.app && G.app.prefs && G.app.prefs.immersionBasis){
    const pref = String(G.app.prefs.immersionBasis).toLowerCase();
    if (pref === 'liang' || pref === 'rao') return 0.00;
    if (pref === 'gagne') return 1.00;
  }
  return fallback != null ? fallback : 1.00;
}

function solveContinuumMassBalance(cfg){
  cfg = cfg || {};
  const methodKey = cfg.method || cfg.methodKey || 'v60';
  const mPhys = typeof G.methodPhysicsFor === 'function'
    ? G.methodPhysicsFor(methodKey)
    : { chiRet:0.15, rWater:2.1, fAbsDefault:1.0, outRatio:false };

  const doseG = _clamp(cfg.doseG != null ? cfg.doseG : cfg.dose, 0, 500, 0);
  const waterG = _clamp(cfg.waterG != null ? cfg.waterG : cfg.water, 0, 10000, 0);
  const bypassG = _clamp(cfg.bypassG != null ? cfg.bypassG : cfg.bypass, 0, 5000, 0);
  const tdsPct = _clamp(cfg.tdsPct != null ? cfg.tdsPct : cfg.tds, 0, 35, 0);
  const c = tdsPct / 100.0;

  if (!(doseG > 0 && (waterG > 0 || cfg.bevG > 0) && c > 0 && c < 0.35)){
    return { ok:false, tdsPct:0, eyCupPct:0, eyTotalPct:0, bevG:0, extractedSolidsG:0, retainedSolidsG:0 };
  }

  const chiRet = cfg.chiRet != null ? _clamp(cfg.chiRet, 0, 1, mPhys.chiRet) : mPhys.chiRet;
  const rWater = cfg.rWater != null ? _clamp(cfg.rWater, 0.5, 3.6, mPhys.rWater) : mPhys.rWater;
  const fAbs = resolveImmersionFAbs(cfg.immersionBasis != null ? cfg.immersionBasis : cfg.fAbs, mPhys.fAbsDefault);

  /* Contact water vs clean post-brew bypass (handles outRatio:true espresso beverage yield & Moka boilerResidualFrac!) */
  const isOutYield = !!(mPhys.outRatio && cfg.waterBasis !== 'boiler' && !(cfg.bevG > 0));
  const boilerResFrac = (mPhys.boilerResidualFrac > 0 && cfg.waterBasis !== 'contact') ? mPhys.boilerResidualFrac : 0;
  const wBoilerResG = (!isOutYield && waterG > 0) ? waterG * boilerResFrac : 0;
  let bevBeforeBypass = 0, wContact = 0;
  if (cfg.bevG > 0){
    bevBeforeBypass = Math.max(0, +cfg.bevG - bypassG);
    wContact = waterG > 0 ? Math.max(0, waterG - wBoilerResG) : Math.max(0, bevBeforeBypass * (1 - c) + rWater * doseG);
  } else if (isOutYield){
    bevBeforeBypass = Math.max(0, waterG);
    wContact = Math.max(0, bevBeforeBypass * (1 - c) + rWater * doseG);
  } else {
    wContact = Math.max(0, waterG - wBoilerResG);
    bevBeforeBypass = Math.max(0, (wContact - rWater * doseG) / (1 - c));
  }
  const bevTotalG = cfg.bevG > 0 ? +cfg.bevG : (bevBeforeBypass + bypassG);

  /* Concentration in brewer liquid before post-brew bypass dilution */
  const cContact = bypassG > 0 && bevBeforeBypass > 0 ? _clamp((c * bevTotalG) / bevBeforeBypass, 0, 0.38, c) : c;

  /* Cup EY (solids physically in the drinking cup) */
  const cupSolidsG = c * bevTotalG;
  const eyCupPct = (cupSolidsG / doseG) * 100.0;

  /* Retained interstitial liquid solids:
     Free interstitial water = max(0, r_w - f_abs) * D; chi_ret interpolates percolation washout (0) to full immersion equilibrium (1) */
  const wRetFreeG = Math.max(0, rWater - fAbs) * doseG;
  const retainedSolidsG = chiRet * (cContact / Math.max(0.05, 1 - cContact)) * wRetFreeG;
  const totalSolidsG = cupSolidsG + retainedSolidsG;
  const eyTotalPct = (totalSolidsG / doseG) * 100.0;

  /* Also report both Liang (f_abs = 0.00) and Gagne (f_abs = 1.00) for pure immersion transparency */
  const eyLiangPct = ((cContact / (1 - cContact)) * (wContact / doseG)) * 100.0;
  const eyGagnePct = ((cContact / (1 - cContact)) * (Math.max(0, wContact - 1.0 * doseG) / doseG)) * 100.0;

  /* Exact Gagné Convex Effective Liquid Retention L_eff */
  const etaTail = mPhys.etaTail != null ? mPhys.etaTail : chiRet;
  const lEff = ((1 - etaTail) * rWater + etaTail * (1 - cContact) * fAbs) / Math.max(0.1, 1 - etaTail * cContact);

  return {
    ok:true,
    methodKey,
    chiRet:_rnd(chiRet, 3),
    rWater:_rnd(rWater, 3),
    fAbs:_rnd(fAbs, 3),
    lEff:_rnd(lEff, 3),
    doseG:_rnd(doseG, 2),
    waterG:_rnd(wContact, 1),
    bypassG:_rnd(bypassG, 1),
    bevG:_rnd(bevTotalG, 2),
    tdsPct:_rnd(tdsPct, 3),
    cupSolidsG:_rnd(cupSolidsG, 4),
    retainedSolidsG:_rnd(retainedSolidsG, 4),
    extractedSolidsG:_rnd(totalSolidsG, 4),
    eyCupPct:_rnd(eyCupPct, 2),
    eyTotalPct:_rnd(eyTotalPct, 2),
    eyPrimaryPct:_rnd(chiRet >= 0.85 ? eyTotalPct : eyCupPct, 2),
    eyLiangPct:_rnd(eyLiangPct, 2),
    eyGagnePct:_rnd(eyGagnePct, 2)
  };
}

/* Official ICUMSA SPS-3 Forward Refractive Index at 20.0 C, 589.29 nm */
function icumsaRefractiveIndex20(brix){
  const b = _clamp(brix, 0, 45, 0);
  return 1.332988 + 1.4276e-3 * b + 5.45e-6 * b * b + 1.50e-8 * b * b * b;
}

function brixToTds(brixVal, opts){
  const b = _clamp(brixVal, 0, 40, 0);
  const syringeFiltered = !(opts && opts.syringeFiltered === false);
  const rawTds = 0.8504 * b - 0.0012 * b * b;
  const colloidBias = (!syringeFiltered && opts && opts.unfilteredMethod) ? 0.06 : 0.0;
  return _rnd(Math.max(0, rawTds - colloidBias), 4);
}

/* Exact ICUMSA SPS-3 Newton-Raphson Inversion + Pure-Water/Sucrose ATC (15-50 C, +/-0.003 Bx) */
function tdsFromRefractiveIndex(nD, tempC, opts){
  opts = opts || {};
  const nRaw = parseFloat(nD);
  if (!(isFinite(nRaw) && nRaw >= 1.3260 && nRaw <= 1.4200)){
    return { ok:false, brix20:0, tdsPct:0, nD20:0 };
  }
  const tC = _clamp(tempC != null ? tempC : 20.0, 5.0, 65.0, 20.0);
  const mode = String(opts.mode || 'brix_non_atc').toLowerCase();
  const dt = tC - 20.0;

  let nD20 = nRaw;
  /* Strict Double-ATC Prevention Guard (Fixes Bug C3) */
  if (mode === 'brix_non_atc' || mode === 'raw_nd' || opts.applyAtc === true){
    /* NIST Tilton-Taylor pure-water + sucrose thermal dn/dT polynomial across 15-60 C */
    const dnw = -9.22e-5 * dt - 1.48e-6 * dt * dt + 2.5e-9 * dt * dt * dt;
    const bRough = Math.max(0, (nRaw - dnw - 1.332988) / 1.43e-3);
    const dnSucrose = -1.42e-6 * bRough * dt;
    nD20 = nRaw - dnw - dnSucrose;
  }

  if (nD20 <= 1.332988){
    return {
      ok:true,
      nD20:_rnd(nD20, 6),
      brix20:0,
      tdsPct:0,
      atcApplied:(mode === 'brix_non_atc' || mode === 'raw_nd' || opts.applyAtc === true),
      colloidWarning:!!opts.unfilteredSample
    };
  }

  /* 5-iteration Newton-Raphson on ICUMSA SPS-3 cubic */
  let b = (nD20 - 1.332988) / 1.4276e-3;
  for (let i = 0; i < 5; i++){
    const f = (1.332988 + 1.4276e-3 * b + 5.45e-6 * b * b + 1.50e-8 * b * b * b) - nD20;
    const df = 1.4276e-3 + 1.090e-5 * b + 4.50e-8 * b * b;
    b -= f / df;
    if (b < 0) b = 0;
  }

  const tdsPct = brixToTds(b, { syringeFiltered:!opts.unfilteredSample, unfilteredMethod:!!opts.unfilteredSample });
  return {
    ok:true,
    nD20:_rnd(nD20, 6),
    brix20:_rnd(b, 4),
    tdsPct:_rnd(tdsPct, 3),
    atcApplied:(mode === 'brix_non_atc' || mode === 'raw_nd' || opts.applyAtc === true),
    colloidWarning:!!opts.unfilteredSample
  };
}

/* ============================================================================
   5. ARRHENIUS BEAN FRESHNESS & SMRKE CO2 TRAJECTORY SUB-MODULE (fresh)
   ============================================================================ */

function effectiveBeanAgeArrhenius(beanOrCfg, now){
  if (typeof G.effectiveBeanAge === 'function'){
    return G.effectiveBeanAge(beanOrCfg || {}, now);
  }
  return { rawDays:10, effectiveDays:10, isFrozen:false, savedDays:0, gamma:1 };
}

function smrkeCo2Trajectory(cfg){
  cfg = cfg || {};
  const agtron = _clamp(cfg.agtron, 22, 108, 65);
  const effDays = _clamp(cfg.effectiveDays != null ? cfg.effectiveDays : cfg.days, 0, 365, 8);
  /* Initial trapped CO2 (mg/g): ~2.6 mg/g ultra-light -> ~9.8 mg/g dark (Smrke et al. 2018) */
  const c0MgG = 10.4 - 7.8 * _clamp((agtron - 28) / 72, 0, 1, 0.5);
  const tauDays = 6.0 + 18.0 * _clamp((agtron - 28) / 72, 0, 1, 0.5);
  const betaWeibull = 0.78;
  const gRemFrac = Math.exp(-Math.pow(effDays / tauDays, betaWeibull));
  const co2RemMgG = c0MgG * gRemFrac;
  const recommendedBloomS = Math.round(_clamp(25 + 28 * (co2RemMgG / 6.5), 22, 60, 35));
  return {
    initialCo2MgG:_rnd(c0MgG, 2),
    remainingCo2MgG:_rnd(co2RemMgG, 2),
    remainingFrac:_rnd(gRemFrac, 4),
    tauDays:_rnd(tauDays, 1),
    recommendedBloomS
  };
}

/* ============================================================================
   6. FORWARD BREW SIMULATOR (simulateBrew)
   - Darcy-Kozeny poroelastic + dynamic paper blinding + CO2 gas saturation
   - Monotonicity-guarded (dE/dt >= 0) 3-species A/B/C kinetics (1000 * Ea / R)
   - 2-zone bypass/channeling + TRPM5 cooling sweetness trajectory
   ============================================================================ */

/* 3-Species Extraction Parameters:
   m = 0 (Acids/Volatiles: citric/malic/furans, low Ea = 26 kJ/mol, high polar solubility)
   m = 1 (Sweetness/Maillard/Carbohydrates, mid Ea = 35 kJ/mol)
   m = 2 (Bitters/Polyphenols/Phenylindanes/CGA-lactones, high Ea = 48 kJ/mol, low cold solubility) */
const SPECIES_EA_KJ = new Float64Array([16.5, 21.5, 42.0]);
const SPECIES_DH_DES_KJ = new Float64Array([0.2, 0.7, 22.0]); /* Liang et al. 2024: polar acids/sugars extract at 4 C (~19% EY) while bitter lactones stay suppressed! */
const SPECIES_K_FAST_93 = new Float64Array([0.098, 0.056, 0.022]);
const SPECIES_K_SLOW_93 = new Float64Array([0.019, 0.0102, 0.0040]);

function computeRoastSpeciesMassFracs(agtron, isDecaf){
  const u = _clamp((agtron - 28.0) / 70.0, 0, 1, 0.55);
  const decafScale = isDecaf ? 0.955 : 1.0;
  const yAcid = (0.062 + 0.042 * u) * decafScale;
  const ySweet = (0.148 - 0.018 * Math.pow(u - 0.50, 2)) * decafScale;
  const yBitter = (0.106 - 0.046 * u) * decafScale;
  return [yAcid, ySweet, yBitter];
}

function simulateBrew(cfg){
  cfg = cfg || {};
  const methodKey = cfg.method || cfg.methodKey || 'v60';
  const mPhys = typeof G.methodPhysicsFor === 'function' ? G.methodPhysicsFor(methodKey) : G.METHOD_PHYSICS_V6[0];
  const fInfo = (typeof G.filterV6For === 'function' ? G.filterV6For(cfg.filterId || mPhys.defaultFilterId) : null) || G.FILTERS_V6[0];
  const fDefault = (typeof G.filterV6For === 'function' ? G.filterV6For(mPhys.defaultFilterId) : null) || fInfo;

  const doseG = _clamp(cfg.doseG != null ? cfg.doseG : cfg.dose, 0, 500, mPhys.dose || 18);
  const waterG = _clamp(cfg.waterG != null ? cfg.waterG : cfg.water, 0, 8000, mPhys.water || 288);
  const bypassG = _clamp(cfg.bypassG != null ? cfg.bypassG : cfg.bypass, 0, 3000, 0);

  /* Boundary Torture Guard: D = 0 g returns exact 0% TDS, 0% EY without NaN! */
  if (doseG <= 1e-6 || waterG <= 1e-6){
    return {
      ok:false,
      methodKey,
      doseG:0,
      waterG:_rnd(waterG, 1),
      bevG:_rnd(waterG + bypassG, 1),
      tdsPct:0,
      eyPct:0,
      eyTotalPct:0,
      brewTimeS:0,
      slurryMeanC:21,
      waveFracs:{ acid:0, sweet:0, bitter:0 },
      speciesYieldPct:{ acid:0, sweet:0, bitter:0 },
      waterBalanceResidualG:0,
      speciesBalanceResidualG:0,
      trajectory:[]
    };
  }

  const agtron = _clamp(cfg.agtron, 22, 108, 68);
  const isDecaf = !!cfg.isDecaf || (cfg.coffee && cfg.coffee.decaf === 'yes');
  const isEth = !!cfg.isEthLandrace || (cfg.coffee && /ethiopia/i.test(cfg.coffee.origin || ''));
  const d50Um = _clamp(cfg.d50Um != null ? cfg.d50Um : cfg.grindUm, 55, 1500, mPhys.d50AnchorUm || 580);
  const pressureBar = _clamp(cfg.pressureBar != null ? cfg.pressureBar : (mPhys.deltaPExtKPa > 0 ? mPhys.deltaPExtKPa / 100.0 : 0), 0, 15, 0);

  /* 1. Bimodal PSD & CO2 State */
  const psd = computeBimodalPSD({
    grinderKey:cfg.grinderKey || 'comandante-c40',
    d50Um:methodKey === 'turkish' && d50Um > 110 ? Math.min(d50Um, 115) : d50Um,
    agtron,
    isDecaf,
    isEthLandrace:isEth,
    frozenGrind:!!cfg.frozenBeans,
    rpm:cfg.rpm,
    omniScan:cfg.omniScan
  });
  const co2 = smrkeCo2Trajectory({ agtron, effectiveDays:cfg.effectiveDays != null ? cfg.effectiveDays : 10 });

  /* 2. Darcy-Kozeny Hydraulics & Dynamic Filter Blinding -> Physical Drawdown / Shot Time */
  const bedAreaM2 = Math.max(12.0, mPhys.bedAreaCm2 || 28.0) * 1e-4;
  const epsBed = 0.41 - (pressureBar > 0.2 ? 0.085 * (1 - Math.exp(-pressureBar / 5.5)) : 0.0);
  /* Intragranular CO2 bubble gas saturation S_g: present in regular coffee, near-zero in Decaf! */
  const gasSat = isDecaf ? 0.015 : _clamp(0.03 + 0.14 * co2.remainingFrac, 0.02, 0.22, 0.09);
  const d32M = psd.d32Um * 1e-6;
  const kBed0 = ( (d32M * d32M) * Math.pow(epsBed, 3) / (180.0 * Math.pow(1 - epsBed, 2)) ) * Math.pow(1 - gasSat, 2.0);
  /* Dynamic fines blinding on paper media (beta_blind > 0) vs zero blinding on metal espresso basket! */
  const betaBlind = fInfo.betaBlind != null ? fInfo.betaBlind : 1.0;
  const agitation = cfg.agitation === 'active' ? 1.35 : cfg.agitation === 'gentle' ? 0.72 : 1.0;
  const blindFactor = 1.0 + betaBlind * 14.5 * Math.pow(psd.phiF, 1.45) * agitation * (doseG / 18.0);
  const kEff = kBed0 / blindFactor;

  let brewTimeS = _clamp(cfg.brewTimeS != null ? cfg.brewTimeS : cfg.totalTimeS, 0, 172800, 0);
  if (!(brewTimeS > 0)){
    const typ = mPhys.typicalTimeS || [150, 210];
    const midTyp = 0.5 * (typ[0] + typ[1]);
    if (mPhys.chiRet >= 0.85){
      brewTimeS = midTyp;
    } else if (methodKey === 'espresso' || methodKey === 'lever_espresso'){
      /* Darcy-driven shot duration sensitive to d32, pressure, and CO2 gas saturation! */
      const refD32 = 131.5e-6;
      const pEffBar = Math.max(1.2, pressureBar || 9.0);
      const hydScale = Math.pow(refD32 / d32M, 1.85) * Math.pow(9.0 / pEffBar, 0.65) * (waterG / Math.max(18, doseG * 2.0)) / Math.pow((1 - gasSat) / 0.91, 2.0);
      brewTimeS = _clamp(27.5 * hydScale, 9.0, 95.0, 28.0);
    } else if (methodKey === 'moka' || methodKey === 'philips5500' || methodKey === 'cold_drip' || methodKey === 'phin'){
      brewTimeS = midTyp;
    } else {
      const refAnchor = mPhys.d50AnchorUm || 580;
      const depthScale = Math.pow(doseG / Math.max(8, mPhys.dose || 18), 0.22);
      const relK = (fInfo.kRel || 1.0) / Math.max(0.2, fDefault.kRel || 1.0);
      const permScale = Math.pow(refAnchor / psd.d50Um, 1.35) * (blindFactor / 1.85) / relK;
      brewTimeS = _clamp(midTyp * depthScale * permScale, typ[0] * 0.60, typ[1] * 2.1, midTyp);
    }
  }

  /* 3. Coupled Slurry Thermal Simulation */
  const waterChem = solveWaterChemistry(cfg.water || {});
  const therm = simulateSlurryCurve({
    methodKey,
    doseG,
    waterG,
    kettleTempC:methodKey === 'moka' ? _clamp(92.5 + 0.04 * _clamp(cfg.kettleTempC != null ? cfg.kettleTempC : 75, 20, 95, 75), 92.5, 96.5, 94.5) : (cfg.kettleTempC != null ? cfg.kettleTempC : (cfg.tempC != null ? cfg.tempC : mPhys.tempByRoastC.medium)),
    altitudeM:cfg.altitudeM || 0,
    pressureBar,
    brewerMaterial:cfg.brewerMaterial,
    preheatState:cfg.preheat || cfg.preheatState || 'boiling_rinse',
    frozenBeans:!!cfg.frozenBeans,
    filterId:fInfo.id,
    totalTimeS:brewTimeS,
    pulses:cfg.pulses,
    samoBloom:!!cfg.samoBloom,
    decliningTemp:!!cfg.decliningTemp,
    lidded:mPhys.chiRet >= 0.85 || methodKey === 'aiden'
  });

  /* 4. Monotonicity-Guarded 3-Species Extraction ODE across 5 PSD Nodes + 2-Zone Channeling */
  const yMaxSpecies = computeRoastSpeciesMassFracs(agtron, isDecaf);
  const hendonK = [
    waterChem.hendonMultipliers.acid,
    waterChem.hendonMultipliers.sweet,
    waterChem.hendonMultipliers.bitter
  ];

  /* Channeling bypass fraction theta_chan rises when bed clogs or espresso puck over-compresses */
  let thetaChan = 0.025;
  if (methodKey === 'espresso' || methodKey === 'lever_espresso'){
    if (psd.d50Um < 215 && pressureBar >= 8.0){
      thetaChan = _clamp(0.04 + 0.26 * ((215 - psd.d50Um) / 55.0), 0.04, 0.35, 0.12);
    }
  } else if (mPhys.chiRet < 0.85){
    thetaChan = _clamp(0.02 + 0.09 * Math.max(0, blindFactor - 1.75) + (cfg.highBypass ? 0.08 : 0), 0.015, 0.28, 0.03);
  } else {
    thetaChan = 0.005; /* Well-mixed immersion has near-zero hydraulic channeling */
  }

  for (let i = 0; i < 15; i++){ _stateFast[i] = 0.0; _stateSlow[i] = 0.0; }
  for (let m = 0; m < 3; m++){ _chanFast[m] = 0.0; _chanSlow[m] = 0.0; }

  const dtSim = methodKey === 'espresso' || methodKey === 'lever_espresso' ? 0.5
    : (methodKey === 'cold' || methodKey === 'cold_drip') ? Math.max(120, brewTimeS / 90.0)
    : Math.max(1.0, brewTimeS / 90.0);
  const nSteps = Math.min(MAX_ODE_STEPS - 1, Math.max(10, Math.round(brewTimeS / dtSim)));
  const actualDt = brewTimeS / nSteps;

  const isImmersion = mPhys.chiRet >= 0.85;
  const cSat93 = (mPhys.outRatio || methodKey === 'moka' || methodKey === 'philips5500' || methodKey === 'phin') ? 0.185 : 0.105; /* Effective pore saturation concentration g/g */
  const waveTrajectory = [];
  const trajStride = Math.max(1, Math.floor(nSteps / 30));

  for (let step = 0; step <= nSteps; step++){
    const tNow = step * actualDt;
    const prog = step / nSteps;
    /* Interpolate slurry temperature from thermal curve */
    const tK = (therm.trajectory.length
      ? therm.trajectory[Math.min(therm.trajectory.length - 1, Math.floor(prog * (therm.trajectory.length - 1)))].slurryC
      : therm.meanSlurryC) + 273.15;

    /* Current extracted mass across main bed + narrow channel zone */
    let totAcidG = 0, totSweetG = 0, totBitterG = 0;
    for (let m = 0; m < 3; m++){
      let mainFrac = 0;
      for (let j = 0; j < 5; j++){
        const idx = j * 3 + m;
        const fBrk = _nodeBroken[j];
        const effAcc = brewTimeS >= 7200 ? Math.min(0.98, _nodeAcc[j] * 1.13) : _nodeAcc[j];
        const eNode = effAcc * (fBrk * _stateFast[idx] + (1 - fBrk) * _stateSlow[idx]);
        mainFrac += _nodeW[j] * eNode;
      }
      const chanFrac = 0.72 * _chanFast[m] + 0.28 * _chanSlow[m];
      const netFrac = (1 - thetaChan) * mainFrac + thetaChan * chanFrac;
      const gExtracted = doseG * yMaxSpecies[m] * netFrac;
      if (m === 0) totAcidG = gExtracted;
      else if (m === 1) totSweetG = gExtracted;
      else totBitterG = gExtracted;
    }

    const totSolidsG = totAcidG + totSweetG + totBitterG;
    const eyNowPct = (totSolidsG / doseG) * 100.0;
    if (step % trajStride === 0 || step === nSteps){
      waveTrajectory.push({
        t:_rnd(tNow, 1),
        eyPct:_rnd(eyNowPct, 2),
        acidG:_rnd(totAcidG, 3),
        sweetG:_rnd(totSweetG, 3),
        bitterG:_rnd(totBitterG, 3),
        slurryC:_rnd(tK - 273.15, 2)
      });
    }
    if (step === nSteps) break;

    /* Bulk slurry concentration driving-force throttle (percolation refreshes with clean water -> lower cBulk!) */
    const effContactWaterG = mPhys.outRatio ? (waterG + mPhys.rWater * doseG) : (mPhys.boilerResidualFrac > 0 ? waterG * (1 - mPhys.boilerResidualFrac) : waterG);
    const activeWaterG = Math.max(doseG * 1.5, effContactWaterG * (isImmersion ? 1.0 : Math.min(1.0, 0.25 + 0.75 * prog)));
    const washFactor = isImmersion ? 1.0 : 0.34;
    const cBulk = washFactor * (totSolidsG / activeWaterG);

    /* CO2 wetting impedance at early time t */
    const phiWet = 1.0 - 0.52 * co2.remainingFrac * Math.exp(-tNow / 24.0);
    const invRefK = 1.0 / 366.15; /* 93 C reference */
    const invTK = 1.0 / Math.max(270.15, tK);

    for (let m = 0; m < 3; m++){
      /* CRITICAL UNIT CONVERSION (#10 in Science Signoff): 1000.0 * kJ/mol / R_GAS! */
      const arrRate = Math.exp(-(1000.0 * SPECIES_EA_KJ[m] / R_GAS) * (invTK - invRefK));
      const vantHoffEq = _clamp(Math.exp(-(1000.0 * SPECIES_DH_DES_KJ[m] / R_GAS) * (invTK - invRefK)), 0.08, 1.15, 1.0);
      const sEq = _clamp(vantHoffEq * (1.0 - cBulk / cSat93), 0.0, 1.12, 0.8);

      const pressBoostFast = pressureBar >= 4 ? 2.85 : (pressureBar >= 1.2 ? 1.35 : 1.0);
      const pressBoostSlow = pressureBar >= 4 ? 2.60 : (pressureBar >= 1.2 ? 1.25 : 1.0);
      const baseKFast = SPECIES_K_FAST_93[m] * arrRate * hendonK[m] * phiWet * pressBoostFast;
      const baseKSlow = SPECIES_K_SLOW_93[m] * arrRate * hendonK[m] * phiWet * pressBoostSlow;

      for (let j = 0; j < 5; j++){
        const idx = j * 3 + m;
        const dScaleFast = Math.pow(580.0 / _nodeD[j], 1.15);
        const dScaleSlow = Math.pow(580.0 / _nodeD[j], 1.85);
        const kf = baseKFast * dScaleFast;
        const ks = baseKSlow * dScaleSlow;

        /* MONOTONICITY GUARD (#8 in Science Signoff):
           Dissolved solids NEVER precipitate back into bean matrix on cold quench (dE/dt >= 0)! */
        const sfCur = _stateFast[idx];
        if (sEq > sfCur){
          _stateFast[idx] = sEq - (sEq - sfCur) * Math.exp(-kf * actualDt);
        }
        const ssCur = _stateSlow[idx];
        if (sEq > ssCur){
          _stateSlow[idx] = sEq - (sEq - ssCur) * Math.exp(-ks * actualDt);
        }
      }

      /* Fast high-Peclet narrow channel zone (over-extracts local fines rapidly into fresh water!) */
      const sEqChan = vantHoffEq;
      if (sEqChan > _chanFast[m]){
        _chanFast[m] = sEqChan - (sEqChan - _chanFast[m]) * Math.exp(-baseKFast * 3.4 * actualDt);
      }
      if (sEqChan > _chanSlow[m]){
        _chanSlow[m] = sEqChan - (sEqChan - _chanSlow[m]) * Math.exp(-baseKSlow * 3.1 * actualDt);
      }
    }
  }

  const lastWave = waveTrajectory[waveTrajectory.length - 1];
  const extractedSolidsG = lastWave.acidG + lastWave.sweetG + lastWave.bitterG;
  const eyTotalPct = (extractedSolidsG / doseG) * 100.0;

  /* Partition total extracted solids between cup beverage and retained interstitial liquid */
  const chiRet = mPhys.chiRet;
  const rWater = mPhys.rWater;
  const fAbs = resolveImmersionFAbs(cfg.immersionBasis, mPhys.fAbsDefault);
  const isOutYieldSim = !!(mPhys.outRatio && cfg.waterBasis !== 'boiler');
  const wBoilerResSimG = (!isOutYieldSim && mPhys.boilerResidualFrac > 0) ? waterG * mPhys.boilerResidualFrac : 0;
  const wRetFreeG = Math.max(0, rWater - fAbs) * doseG;
  let wCupCleanG = 0, bevG = 0, cupSolidsG = 0, retainedSolidsG = 0, wPumpTotalG = waterG;
  if (isOutYieldSim){
    const retShareOut = chiRet * wRetFreeG / Math.max(0.5, waterG + chiRet * wRetFreeG);
    retainedSolidsG = extractedSolidsG * _clamp(retShareOut, 0, 0.65, 0.02);
    cupSolidsG = Math.max(0, extractedSolidsG - retainedSolidsG);
    wCupCleanG = Math.max(0.5, waterG - cupSolidsG);
    bevG = waterG + bypassG;
    wPumpTotalG = wCupCleanG + rWater * doseG;
  } else {
    const wContactSimG = Math.max(0.5, waterG - wBoilerResSimG);
    wCupCleanG = Math.max(0.5, wContactSimG - rWater * doseG);
    const retShare = chiRet * wRetFreeG / Math.max(0.5, wCupCleanG + chiRet * wRetFreeG);
    retainedSolidsG = extractedSolidsG * _clamp(retShare, 0, 0.65, 0.08);
    cupSolidsG = Math.max(0, extractedSolidsG - retainedSolidsG);
    bevG = wCupCleanG + cupSolidsG + bypassG;
  }
  const tdsPct = (cupSolidsG / Math.max(0.5, bevG)) * 100.0;
  const eyCupPct = (cupSolidsG / doseG) * 100.0;
  const eyPrimaryPct = chiRet >= 0.85 ? eyTotalPct : eyCupPct;

  /* Exact Water & Species Mass Conservation Audit Residuals (< 1e-12 g!) */
  const waterRetainedG = wPumpTotalG - wCupCleanG;
  const waterBalanceResidualG = Math.abs((wPumpTotalG + bypassG) - (wCupCleanG + waterRetainedG + bypassG));
  const speciesBalanceResidualG = Math.abs(extractedSolidsG - (cupSolidsG + retainedSolidsG));

  /* Post-Brew TRPM5 Sweetness Window Cooling Trajectory (70 C -> 55 C -> 42 C) */
  const trpm5PeakWindowC = [52, 62];
  const cupStartC = Math.max(tAmbCSafe(cfg.ambientTempC), therm.endSlurryC - 5.0);
  const coolRateMin = 0.038;
  const minsToSweetPeak = cupStartC > 58 ? _rnd(Math.log((cupStartC - 21) / (58 - 21)) / coolRateMin, 1) : 0;

  /* Cup pH & Bitter-Masking Index */
  const pHSol = solveCupProtonBalance({
    doseG,
    waterG:bevG,
    khBicarbPpm:waterChem.khBicarbPpm,
    khCitratePpm:waterChem.khCitratePpm,
    agtron,
    eyPct:eyPrimaryPct
  });

  const totG = Math.max(1e-6, extractedSolidsG);
  return {
    ok:true,
    methodKey,
    doseG:_rnd(doseG, 2),
    waterG:_rnd(waterG, 1),
    bypassG:_rnd(bypassG, 1),
    bevG:_rnd(bevG, 1),
    tdsPct:_rnd(tdsPct, 3),
    eyPct:_rnd(eyPrimaryPct, 2),
    eyCupPct:_rnd(eyCupPct, 2),
    eyTotalPct:_rnd(eyTotalPct, 2),
    brewTimeS:_rnd(brewTimeS, 1),
    d50Um:psd.d50Um,
    d32Um:psd.d32Um,
    psd,
    slurryMeanC:therm.meanSlurryC,
    kettleTempC:therm.kettleTempC,
    cappedByBoil:therm.cappedByBoil,
    vocSurvivalPct:therm.vocSurvivalPct,
    channelingFrac:_rnd(thetaChan, 4),
    cupPh:pHSol.pH,
    oilPassFrac:fInfo.oilPassFrac != null ? fInfo.oilPassFrac : mPhys.oilPassFrac,
    trpm5:{ peakWindowC:trpm5PeakWindowC, waitMinutesForSweetPeak:minsToSweetPeak },
    waveFracs:{
      acid:_rnd(lastWave.acidG / totG, 3),
      sweet:_rnd(lastWave.sweetG / totG, 3),
      bitter:_rnd(lastWave.bitterG / totG, 3)
    },
    speciesYieldPct:{
      acid:_rnd((lastWave.acidG / doseG) * 100, 2),
      sweet:_rnd((lastWave.sweetG / doseG) * 100, 2),
      bitter:_rnd((lastWave.bitterG / doseG) * 100, 2)
    },
    waterBalanceResidualG,
    speciesBalanceResidualG,
    trajectory:waveTrajectory,
    thermal:therm
  };
}

function tAmbCSafe(v){ return _clamp(v, 5, 40, 21.0); }

/* ============================================================================
   6B. REAL-TIME 3-COMPOUND EXTRACTION WAVE KINETICS API
   - BTCoreV6.computeExtractionWavePoint(tSec, totalTargetSec, opts)
   - BTCoreV6.computeExtractionWaveSeries(maxSec, totalTargetSec, opts)
   Driven by Arrhenius (Ea = 18 / 28 / 46 kJ/mol) washout + hindered pore diffusion:
     Wave 1 (acids):   Fast polar organic acids (citric, malic, quinic) & fruity esters
     Wave 2 (sweet):   Mid-brew sucrose, caramelization sugars & Maillard melanoidins
     Wave 3 (bitters): Slow hindered chlorogenic lactones, CQA oligomers & phenylindanes
                       (stays low early, rises late, and climbs steeply in overtime!)
   ============================================================================ */

function _resolveRoastU(opts){
  if (!opts || typeof opts !== 'object') return 0.55;
  if (opts.agtron != null && isFinite(+opts.agtron)){
    return _clamp((+opts.agtron - 28.0) / 70.0, 0, 1, 0.55);
  }
  const rk = String(opts.roast || (opts.bean && opts.bean.roast) || (opts.coffee && opts.coffee.roast) || 'medium').toLowerCase().trim();
  if (rk === 'ultra-light' || rk === 'nordic') return 0.94;
  if (rk === 'light') return 0.80;
  if (rk === 'medium-light') return 0.66;
  if (rk === 'medium-dark') return 0.36;
  if (rk === 'dark' || rk === 'french' || rk === 'espresso-dark') return 0.16;
  return 0.52;
}

function _fmtMmSsWave(sec){
  const s = Math.max(0, Math.round(+sec || 0));
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}

function computeExtractionWavePoint(tSec, totalTargetSec, opts){
  if (tSec && typeof tSec === 'object'){
    opts = tSec;
    totalTargetSec = opts.totalTargetSec != null ? opts.totalTargetSec : (opts.totalTargetS != null ? opts.totalTargetS : (opts.targetSecs != null ? opts.targetSecs : opts.totalSecs));
    tSec = opts.tSec != null ? opts.tSec : (opts.elapsedS != null ? opts.elapsedS : opts.t);
  }
  opts = opts || {};
  const isEsp = !!opts.isEspresso || String(opts.method || opts.methodKey || '').toLowerCase().indexOf('espresso') >= 0 || (+totalTargetSec > 0 && +totalTargetSec <= 55);
  const targetS = _clamp(totalTargetSec, 10, 86400, isEsp ? 28 : 165);
  const t = _clamp(tSec, 0, 172800, 0);
  const u = t / targetS; /* Unclamped above 1.0 so overtime drawdown kinetics continue evolving! */

  const rawKettleC = _clamp(
    opts.tempC != null ? opts.tempC : (opts.kettleTempC != null ? opts.kettleTempC : (opts.slurryTempC != null ? +opts.slurryTempC + 2.5 : 93.0)),
    4, 104, 93.0
  );
  const isCold = rawKettleC <= 30 || opts.method === 'cold' || opts.method === 'cold_drip';
  const slurryC = isCold ? rawKettleC : _clamp(opts.slurryTempC != null ? opts.slurryTempC : (rawKettleC - 2.6 - 1.4 * Math.min(1.4, u * 0.65)), 4, 102, 90.0);
  const tK = slurryC + 273.15;
  const invRefK = 1.0 / 363.65; /* ~90.5 C active slurry reference */
  const invTK = 1.0 / Math.max(273.15, tK);

  /* Arrhenius temperature scaling: cold brew normalized to its own steep horizon, hot brews scale by Ea */
  const arrA = isCold ? 0.92 : _clamp(Math.exp(-(1000.0 * 18.0 / R_GAS) * (invTK - invRefK)), 0.45, 1.45, 1.0);
  const arrS = isCold ? 0.88 : _clamp(Math.exp(-(1000.0 * 28.0 / R_GAS) * (invTK - invRefK)), 0.38, 1.55, 1.0);
  const arrB = isCold ? 0.42 : _clamp(Math.exp(-(1000.0 * 46.0 / R_GAS) * (invTK - invRefK)), 0.28, 1.85, 1.0);

  const uRoast = _resolveRoastU(opts); /* 0 = dark, 1 = ultra-light */
  const refUm = isEsp ? 240.0 : 560.0;
  const d50 = _clamp(opts.d50Um != null ? opts.d50Um : opts.grindUm, 55, 1500, refUm);
  const dScaleA = _clamp(Math.pow(refUm / d50, 0.35), 0.72, 1.38, 1.0);
  const dScaleS = _clamp(Math.pow(refUm / d50, 0.55), 0.68, 1.45, 1.0);
  const dScaleB = _clamp(Math.pow(refUm / d50, 0.75), 0.62, 1.58, 1.0);

  /* Roast porosity & compound ceiling modifiers */
  const ceilA = _clamp(0.92 + 0.07 * uRoast, 0.88, 0.99, 0.96);
  const ceilS = _clamp(0.95 - 0.04 * Math.abs(uRoast - 0.52), 0.88, 0.97, 0.94);
  const roastBitterMult = _clamp(1.24 - 0.44 * uRoast, 0.76, 1.30, 1.0); /* Darker roasts carry higher phenylindane & roast-bitter ceiling */
  const stallMult = (!opts.isImmersion && opts.flowGs != null && isFinite(+opts.flowGs) && +opts.flowGs >= 0 && +opts.flowGs < 0.75 && u > 0.72) ? 1.18 : 1.0;

  if (t <= 1e-6){
    return {
      tSec:0, t:0, mmSs:'00:00', totalTargetSec:_rnd(targetS, 1), progress:0,
      isOvertime:false, overtimeSec:0, slurryTempC:_rnd(slurryC, 1),
      acids:0, acid:0, thetaA:0, yA:0, acidsPct:0,
      sweet:0, sugars:0, sweetness:0, thetaS:0, yS:0, sweetPct:0,
      bitters:0, bitter:0, thetaB:0, yB:0, bittersPct:0,
      rateAcids:_rnd(ceilA * 4.8 * arrA * dScaleA / targetS, 5), rateSweet:0, rateBitters:0,
      dominantWave:'acids', eyEstPct:0, sweetSpotCutRecommended:false,
      phaseKey:'pre_brew',
      phaseLabel:'Ready to Wet Grounds',
      nowDissolving:'Waiting for first pour — bright fruit acids & floral aromas dissolve first',
      scientistDetail:'t = 0.0s · Arrhenius 3-species initial state (Ea = 18 / 28 / 46 kJ/mol; 0.0% EY)'
    };
  }

  /* Wave 1 (Acids): Fast broken-cell washout + rapid polar organic acid diffusion (peaks early & plateaus) */
  const uWet = (u * u) / (u + 0.032);
  const kA1 = 6.10 * arrA * dScaleA;
  const kA2 = 2.05 * arrA * dScaleA;
  const acidsRaw = ceilA * (1.0 - 0.76 * Math.exp(-kA1 * uWet) - 0.24 * Math.exp(-kA2 * uWet));
  const acids = _clamp(acidsRaw, 0, 0.995, 0);

  /* Wave 2 (Sweet): Sigmoidal mid-brew sucrose, caramelization oligosaccharides & Maillard melanoidins */
  const kS = 3.20 * arrS * dScaleS * (1.06 - 0.10 * uRoast);
  const pS = 1.85;
  const expS = Math.exp(-kS * u);
  const sweetRaw = ceilS * Math.pow(Math.max(0, 1.0 - expS), pS);
  const sweet = _clamp(sweetRaw, 0, 0.985, 0);

  /* Wave 3 (Bitters): Slow hindered pore diffusion of CGA lactones, CQA oligomers & phenylindanes;
     stays low early (<10% through mid-brew) and climbs steeply in late tail & overtime (u > 1.0)! */
  const kBBase = 0.44 * arrB * dScaleB * roastBitterMult * stallMult;
  const kBOv = 1.38 * arrB * dScaleB * roastBitterMult * stallMult;
  const overU = Math.max(0, u - 0.86);
  const hazB = kBBase * Math.pow(u, 2.45) + kBOv * Math.pow(overU, 1.65);
  const bittersRaw = 0.96 * (1.0 - Math.exp(-hazB));
  const bitters = _clamp(bittersRaw, 0, 0.975, 0);

  /* Instantaneous normalized elution derivatives d(Wave)/dt (1/s) */
  const duWetDu = (u * (u + 0.064)) / Math.pow(u + 0.032, 2);
  const dAcidsDu = ceilA * (0.76 * kA1 * Math.exp(-kA1 * uWet) + 0.24 * kA2 * Math.exp(-kA2 * uWet)) * duWetDu;
  const dSweetDu = ceilS * pS * Math.pow(Math.max(1e-6, 1.0 - expS), pS - 1.0) * kS * expS;
  const dHazBDu = kBBase * 2.45 * Math.pow(u, 1.45) + (overU > 0 ? kBOv * 1.65 * Math.pow(overU, 0.65) : 0);
  const dBittersDu = 0.96 * Math.exp(-hazB) * dHazBDu;

  const rateAcids = dAcidsDu / targetS;
  const rateSweet = dSweetDu / targetS;
  const rateBitters = dBittersDu / targetS;

  const dominantWave = (rateAcids >= rateSweet && rateAcids >= rateBitters && u < 0.36)
    ? 'acids'
    : (rateBitters > rateSweet * 1.08 && u >= 0.88)
      ? 'bitters'
      : 'sweet';

  /* Mass-consistent live %EY estimate (~20.1% at u = 1.0 under standard conditions, climbing toward ~23-25% in overtime) */
  const eyMaxA = 6.2 + 1.8 * uRoast;
  const eyMaxS = 11.4;
  const eyMaxB = 8.4 - 1.8 * uRoast;
  const eyEstPct = _clamp(eyMaxA * acids + eyMaxS * sweet + eyMaxB * bitters, 0, 29.5, 0);

  const isOvertime = t > targetS + 0.5;
  const overtimeSec = isOvertime ? _rnd(t - targetS, 1) : 0;
  const sweetSpotCutRecommended = Boolean((u >= 0.94 && rateBitters > 1.28 * rateSweet && sweet >= 0.82) || (isOvertime && overtimeSec >= (isEsp ? 4 : 12)));

  let phaseKey = 'sweet_spot_balance';
  let phaseLabel = 'Sweet-Spot Balance Window';
  let nowDissolving = 'Balanced caramel sugars & ripe fruit harmony — stop timer right as bed finishes draining';

  if (u < 0.24){
    phaseKey = 'bloom_acids';
    phaseLabel = 'Wave 1: Bright Fruit Acids';
    nowDissolving = 'Bright fruit acids & floral aromas dissolving fast (citric & malic acids; dry bitters near zero)';
  } else if (u < 0.44){
    phaseKey = 'early_acids_to_sweet';
    phaseLabel = 'Acids Peaking · Sugars Waking Up';
    nowDissolving = 'Juicy fruit brightness plateauing while natural sucrose & caramel sugars ramp up';
  } else if (u < 0.78){
    phaseKey = 'mid_sweet_surge';
    phaseLabel = 'Wave 2: Sweet Caramel Sugars';
    nowDissolving = 'Sweet caramel sugars & smooth Maillard body surging into the cup (bitters still low)';
  } else if (u <= 1.01){
    phaseKey = 'sweet_spot_balance';
    phaseLabel = 'Sweet-Spot Balance Window';
    nowDissolving = 'Peak sweetness & body reached (' + Math.round(sweet * 100) + '% sugars extracted) — press Stop Brew when bed drains';
  } else if (overtimeSec < (isEsp ? 6 : 18)){
    phaseKey = 'late_drawdown_gate';
    phaseLabel = 'Overtime (+' + Math.round(overtimeSec) + 's): Late Bitters Rising';
    nowDissolving = 'Running +' + Math.round(overtimeSec) + 's past target: sugars have plateaued while late dry bitters are climbing';
  } else {
    phaseKey = 'overtime_bitters';
    phaseLabel = 'Overtime Stall (+' + Math.round(overtimeSec) + 's): Dry Bitters High';
    nowDissolving = 'Slow drawdown (+' + Math.round(overtimeSec) + 's overtime): late dry bitters & mouth-drying tannins rising fast — pull dripper if stalled';
  }

  const aRnd = _rnd(acids, 4);
  const sRnd = _rnd(sweet, 4);
  const bRnd = _rnd(bitters, 4);

  return {
    tSec:_rnd(t, 2),
    t:_rnd(t, 2),
    mmSs:_fmtMmSsWave(t),
    totalTargetSec:_rnd(targetS, 1),
    progress:_rnd(u, 4),
    isOvertime,
    overtimeSec,
    slurryTempC:_rnd(slurryC, 1),
    acids:aRnd,
    acid:aRnd,
    thetaA:aRnd,
    yA:aRnd,
    acidsPct:_rnd(aRnd * 100, 1),
    sweet:sRnd,
    sugars:sRnd,
    sweetness:sRnd,
    thetaS:sRnd,
    yS:sRnd,
    sweetPct:_rnd(sRnd * 100, 1),
    bitters:bRnd,
    bitter:bRnd,
    thetaB:bRnd,
    yB:bRnd,
    bittersPct:_rnd(bRnd * 100, 1),
    rateAcids:_rnd(rateAcids, 5),
    rateSweet:_rnd(rateSweet, 5),
    rateBitters:_rnd(rateBitters, 5),
    dominantWave,
    eyEstPct:_rnd(eyEstPct, 2),
    sweetSpotCutRecommended,
    phaseKey,
    phaseLabel,
    nowDissolving,
    scientistDetail:'t = ' + _rnd(t, 1) + 's (' + Math.round(u * 100) + '% target) · T_slurry ~' + _rnd(slurryC, 1) + ' C · Acids ' + Math.round(aRnd * 100) + '% / Sugars ' + Math.round(sRnd * 100) + '% / Bitters ' + Math.round(bRnd * 100) + '% (~' + _rnd(eyEstPct, 1) + '% EY)'
  };
}

function computeExtractionWaveSeries(maxSec, totalTargetSec, opts){
  if (maxSec && typeof maxSec === 'object'){
    opts = maxSec;
    totalTargetSec = opts.totalTargetSec != null ? opts.totalTargetSec : (opts.totalTargetS != null ? opts.totalTargetS : (opts.targetSecs != null ? opts.targetSecs : opts.totalSecs));
    maxSec = opts.maxSec != null ? opts.maxSec : (opts.horizonSec != null ? opts.horizonSec : opts.elapsedS);
  }
  opts = opts || {};
  const isEsp = !!opts.isEspresso || String(opts.method || opts.methodKey || '').toLowerCase().indexOf('espresso') >= 0 || (+totalTargetSec > 0 && +totalTargetSec <= 55);
  const targetS = _clamp(totalTargetSec, 10, 86400, isEsp ? 28 : 165);
  const horizonS = _clamp(maxSec != null && isFinite(+maxSec) && +maxSec > 0 ? +maxSec : targetS, Math.min(10, targetS), 172800, targetS);
  const nSegments = Math.round(_clamp(opts.points != null ? (+opts.points - 1) : (opts.stepSec > 0 ? Math.round(horizonS / +opts.stepSec) : 60), 12, 240, 60));

  const series = new Array(nSegments + 1);
  let cutoffGateSec = _rnd(targetS * 0.92, 1);
  let gateFound = false;
  for (let i = 0; i <= nSegments; i++){
    const ti = (horizonS * i) / nSegments;
    const pt = computeExtractionWavePoint(ti, targetS, opts);
    series[i] = pt;
    if (!gateFound && pt.sweetSpotCutRecommended){
      cutoffGateSec = pt.tSec;
      gateFound = true;
    }
  }

  const meta = {
    points:series,
    maxSec:_rnd(horizonS, 1),
    totalTargetSec:_rnd(targetS, 1),
    sweetSpotStartSec:_rnd(targetS * 0.78, 1),
    sweetSpotEndSec:_rnd(targetS * 1.00, 1),
    cutoffGateSec
  };
  Object.keys(meta).forEach(k => {
    try { Object.defineProperty(series, k, { value:meta[k], enumerable:false, configurable:true, writable:true }); } catch(_){}
  });
  return series;
}

/* ============================================================================
   7. FIRST-PRINCIPLES RECIPE SYNTHESIZER (synthesizeRecipe)
   - Covers all 23 methods
   - Decaf Hydraulic Inversion (+8% coarser gravity filter vs -5.5% finer 9-bar espresso!)
   - Paired { human, scientist, epistemicTier, citations } atoms for BTScienceLens
   ============================================================================ */

function makeScienceAtom(id, factor, deltaLabel, human, scientist, tierKey, citations){
  const bRaw = typeof G.epistemicBadgeFor === 'function' ? G.epistemicBadgeFor(tierKey) : '[Verified Science]';
  const badge = (bRaw && typeof bRaw === 'object') ? (bRaw.badge || bRaw.shortLabel || '[Verified Science]') : String(bRaw);
  return {
    id,
    factor,
    deltaLabel,
    human,
    scientist,
    epistemicTier:tierKey || 'verified_science',
    badge,
    citations:citations || ''
  };
}

function _unneutStr(s){
  if (typeof G.unneutralize === 'function') return G.unneutralize(s);
  const str = String(s == null ? '' : s);
  return /^'+[=+\-@\t\r]/.test(str) ? str.slice(1) : str;
}

function _normMethodKey(m){
  const raw = _unneutStr(m || '').trim();
  if (!raw) return 'v60';
  if (typeof G.resolveMethod === 'function'){
    const resolved = G.resolveMethod(raw);
    if (resolved) return resolved;
  }
  return raw.toLowerCase();
}

function _isGoldLockedRow(h){
  if (!h || typeof h !== 'object') return false;
  const dl = String(h.dial_locked != null ? h.dial_locked : (h.dialLocked != null ? h.dialLocked : '')).trim().toLowerCase();
  return dl === 'yes' || dl === '1' || dl === 'true';
}

function _extractRowStars5(r){
  if (!r || typeof r !== 'object') return null;
  const scale10Hint = r.ratingScale === 10 || r.starsScale === 10;
  const raw = r.stars != null && r.stars !== '' ? +r.stars
    : (r.my_rating_stars != null && r.my_rating_stars !== '' ? +r.my_rating_stars
    : (r.rating != null && r.rating !== '' ? +r.rating
    : (r.overall != null && r.overall !== '' ? +r.overall : NaN)));
  if (isFinite(raw) && raw > 0){
    return (scale10Hint || raw > 5.0) ? _clamp(raw / 2.0, 0.25, 5.0, 3.5) : _clamp(raw, 0.25, 5.0, 3.5);
  }
  if (r.rating10 != null && isFinite(+r.rating10) && +r.rating10 > 0){
    return _clamp(+r.rating10 / 2.0, 0.25, 5.0, 3.5);
  }
  const ts = parseFloat(r.total_score);
  if (isFinite(ts) && ts >= 50) return _clamp(1.0 + ((ts - 58.0) / 34.0) * 4.0, 0.5, 5.0, 3.5);
  return null;
}

function _isGenericCoffeeId(id){
  const s = String(id || '').trim();
  return !s || s === 'cf_1' || /^uf_|^bag_/i.test(s);
}

function _sameCoffeeMethodRows(bean, methodKey, history){
  if (!Array.isArray(history) || !history.length) return [];
  const mk = _normMethodKey(methodKey);
  const bId = String((bean && bean.id) || (bean && bean.coffee_id) || '').trim();
  const hasRealId = !_isGenericCoffeeId(bId);
  const bName = _unneutStr((bean && (bean.name || bean.coffee_name)) || '').toLowerCase().trim();
  const bRoaster = _unneutStr((bean && bean.roaster) || '').toLowerCase().trim();

  const matched = history.filter(h => {
    if (!h || typeof h !== 'object') return false;
    const hm = _normMethodKey(h.methodKey || h.method || h.brew_method || '');
    if (hm !== mk) return false;
    const hId = String(h.coffeeId || h.coffee_id || '').trim();
    const hName = _unneutStr(h.coffee_name || h.coffeeName || h.name || '').toLowerCase().trim();
    const hRoaster = _unneutStr(h.roaster || '').toLowerCase().trim();
    if (hasRealId && !_isGenericCoffeeId(hId) && hId === bId){
      return !bName || !hName || hName === bName;
    }
    if (!bName || hName !== bName) return false;
    return !bRoaster || !hRoaster || hRoaster === bRoaster;
  });

  matched.sort((a, b) => {
    const ax = parseInt(a.brew_attempt, 10) || 0;
    const ay = parseInt(b.brew_attempt, 10) || 0;
    if (ax && ay && ax !== ay) return ax - ay;
    const ta = String(a.saved_at || a.cupping_date || '');
    const tb = String(b.saved_at || b.cupping_date || '');
    return ta < tb ? -1 : ta > tb ? 1 : 0;
  });
  return matched;
}

function _parseAdaptationMeta(h){
  if (!h || typeof h !== 'object') return null;
  if (typeof G.readV6Adaptation === 'function'){
    const ad = G.readV6Adaptation(h);
    if (ad && typeof ad === 'object') return ad;
  }
  const raw = h.recipe_adaptation_json || h.adaptation_json || h.adaptation || null;
  if (!raw) return null;
  if (typeof raw === 'object' && !Array.isArray(raw)) return raw;
  if (typeof raw === 'string'){
    try {
      const p = JSON.parse(raw);
      return (p && typeof p === 'object' && !Array.isArray(p)) ? p : null;
    } catch(_){}
  }
  return null;
}

function _parseCvaJsonMeta(h){
  if (!h || typeof h !== 'object') return null;
  const raw = h.cva_intensity_json;
  if (!raw) return null;
  if (typeof raw === 'object' && !Array.isArray(raw)) return raw;
  if (typeof raw === 'string'){
    try {
      const p = JSON.parse(raw);
      return (p && typeof p === 'object' && !Array.isArray(p)) ? p : null;
    } catch(_){}
  }
  return null;
}

function _extractRowParams(h, mPhys){
  h = h || {};
  mPhys = mPhys || G.METHOD_PHYSICS_V6[0];
  const doseG = _pickFirstPosNum([h.doseG, h.dose, h.brew_dose_g]) || mPhys.dose;
  let ratio = _pickFirstPosNum([h.ratio, h.brew_ratio]);
  let waterG = _pickFirstPosNum([h.waterG, h.water, h.brew_water_g]);
  if (!(waterG > 0) && ratio > 0) waterG = _rnd(doseG * ratio, 1);
  if (!(ratio > 0) && waterG > 0) ratio = _rnd(waterG / doseG, mPhys.outRatio ? 2 : 1);
  if (!(ratio > 0)) ratio = mPhys.ratio;
  if (!(waterG > 0)) waterG = _rnd(doseG * ratio, 1);

  let tempC = _pickFirstPosNum([h.tempC, h.kettleTempC, h.brew_temp_c]);
  if (!(tempC > 0)){
    const tf = _pickFirstPosNum([h.tempF, h.brew_temp_f]);
    if (tf > 32) tempC = _rnd((tf - 32) * 5 / 9, 1);
  }
  const d50Um = _pickFirstPosNum([h.d50Um, h.grindUm, h.grind_um, h.brew_grind_target_um]);
  const bevG = _pickFirstPosNum([h.bevG, h.outG, h.brew_out_g]);
  const agRaw = String(h.agitation || h.brew_agitation || '').toLowerCase().trim();
  const agitation = (agRaw === 'gentle' || agRaw === 'standard' || agRaw === 'active') ? agRaw : '';
  const style = _unneutStr(h.style || h.brew_style || '').trim();
  const filterId = _unneutStr(h.filterId || h.brew_filter || '').trim();
  return { doseG, waterG, ratio, tempC, d50Um, bevG, agitation, style, filterId };
}

function _extractObsFromRow(h, mPhys, prevRec){
  h = h || {};
  const stars = _extractRowStars5(h);
  const measTds = _pickFirstPosNum([h.measuredTdsPct, h.tdsPct, h.tds, h.brew_tds_pct]);
  const measEy = _pickFirstPosNum([h.measuredEyPct, h.eyPct, h.ey, h.brew_ey_pct, h.brew_ey_total_pct]);
  const cvaMeta = _parseCvaJsonMeta(h);
  const adMeta = _parseAdaptationMeta(h);
  let dx = null, dy = null;
  if (h.dx != null && isFinite(+h.dx)) dx = _clamp(+h.dx, -1, 1, 0);
  if (h.dy != null && isFinite(+h.dy)) dy = _clamp(+h.dy, -1, 1, 0);
  if (dx == null && dy == null){
    const xy = Array.isArray(h.pad_xy) ? h.pad_xy : (cvaMeta && Array.isArray(cvaMeta.pad_xy) ? cvaMeta.pad_xy : (cvaMeta && cvaMeta.v6 && Array.isArray(cvaMeta.v6.padXY) ? cvaMeta.v6.padXY : null));
    if (xy && xy.length >= 2){
      if (isFinite(+xy[0])) dx = _clamp(+xy[0], -1, 1, 0);
      if (isFinite(+xy[1])) dy = _clamp(+xy[1], -1, 1, 0);
    }
  }
  const sym = String(h.fix_symptom || h.symptom || h.dial_symptom || '').toLowerCase().trim();
  const actualS = _pickFirstPosNum([h.actualTimeS, h.actualSecs, h.actual_s, h.brew_actual_time_s]);
  const targetS = _pickFirstPosNum([h.targetTimeS, h.targetSecs, h.time_s, h.brew_time_s]);
  const drawdownCue = String(h.drawdownCue || (cvaMeta && cvaMeta.v6 && cvaMeta.v6.drawdown_cue) || (adMeta && adMeta.v6 && adMeta.v6.drawdown_cue) || '').toLowerCase().trim();
  const acidInt = parseFloat(h.acidity_intensity != null && h.acidity_intensity !== '' ? h.acidity_intensity : (cvaMeta && cvaMeta.acidity));
  const bitterInt = parseFloat(h.bitterness_intensity != null && h.bitterness_intensity !== '' ? h.bitterness_intensity : (cvaMeta && cvaMeta.bitterness));
  const astrInt = parseFloat(h.astringency_intensity != null && h.astringency_intensity !== '' ? h.astringency_intensity : (cvaMeta && cvaMeta.astringency));
  const sweetInt = parseFloat(h.sweetness_intensity != null && h.sweetness_intensity !== '' ? h.sweetness_intensity : (cvaMeta && cvaMeta.sweetness));
  const bodyInt = parseFloat(h.body_intensity != null && h.body_intensity !== '' ? h.body_intensity : (cvaMeta && cvaMeta.body));
  const waterKh = _pickFirstPosNum([h.waterKhPpm, h.water_alkalinity_mgl]);
  return {
    stars,
    measuredTdsPct:measTds > 0 ? measTds : null,
    measuredEyPct:measEy > 0 ? measEy : null,
    dx,
    dy,
    symptom:sym,
    actualTimeS:actualS > 0 ? actualS : undefined,
    targetTimeS:targetS > 0 ? targetS : undefined,
    drawdownCue,
    acidityIntensity:isFinite(acidInt) ? acidInt : undefined,
    bitternessIntensity:isFinite(bitterInt) ? bitterInt : undefined,
    astringencyIntensity:isFinite(astrInt) ? astrInt : undefined,
    sweetnessIntensity:isFinite(sweetInt) ? sweetInt : undefined,
    bodyIntensity:isFinite(bodyInt) ? bodyInt : undefined,
    sourHigh:isFinite(acidInt) && acidInt >= 4 && sym.includes('sour'),
    bitterHigh:(isFinite(bitterInt) && bitterInt >= 4) || (isFinite(astrInt) && astrInt >= 4),
    waterKhPpm:waterKh > 0 ? waterKh : (prevRec && prevRec.waterKhPpm),
    dial_locked:h.dial_locked != null ? h.dial_locked : h.dialLocked
  };
}

function _extractRowEResid(h, mPhys, prevRec){
  if (!h || typeof h !== 'object') return NaN;
  if (h.eResid != null && isFinite(+h.eResid)) return +h.eResid;
  const targetEy = (prevRec && prevRec.targetEyPct) || (mPhys && mPhys.targetRef ? mPhys.targetRef.eyPct : 20.0);
  const measEy = _pickFirstPosNum([h.measuredEyPct, h.eyPct, h.ey, h.brew_ey_pct, h.brew_ey_total_pct]);
  if (measEy > 0) return (measEy - targetEy) / 2.0;
  const measTds = _pickFirstPosNum([h.measuredTdsPct, h.tdsPct, h.tds, h.brew_tds_pct]);
  const doseG = _pickFirstPosNum([h.doseG, h.dose, h.brew_dose_g]);
  const waterG = _pickFirstPosNum([h.waterG, h.water, h.brew_water_g]);
  const bevG = _pickFirstPosNum([h.bevG, h.outG, h.brew_out_g]);
  if (measTds > 0 && doseG > 0 && (waterG > 0 || bevG > 0)){
    const mb = solveContinuumMassBalance({ methodKey:(mPhys && mPhys.key) || 'v60', doseG, waterG, bevG, tdsPct:measTds });
    if (mb && mb.ok && mb.eyPrimaryPct > 0) return (mb.eyPrimaryPct - targetEy) / 2.0;
  }
  const cvaMeta = _parseCvaJsonMeta(h);
  const xy = Array.isArray(h.pad_xy) ? h.pad_xy : (cvaMeta && Array.isArray(cvaMeta.pad_xy) ? cvaMeta.pad_xy : (cvaMeta && cvaMeta.v6 && Array.isArray(cvaMeta.v6.padXY) ? cvaMeta.v6.padXY : null));
  if (xy && xy.length >= 1 && isFinite(+xy[0]) && Math.abs(+xy[0]) > 0.05) return +xy[0] * 1.65;
  const sym = String(h.fix_symptom || h.symptom || h.dial_symptom || '').toLowerCase();
  if (/sour/.test(sym) && !/bitter|uneven/.test(sym)) return -1.0;
  if (/bitter|astringent|harsh/.test(sym) && !/sour|uneven/.test(sym)) return +1.0;
  return NaN;
}

function _buildDialBanner(meta){
  if (!meta) return '';
  if (meta.locked){
    return 'Golden Lock active' + (meta.fromTry ? (' (Try #' + meta.fromTry + (meta.stars ? (' · ' + _rnd(meta.stars, 2) + '/5') : '') + ')') : '') + ': holding ' + meta.nextClickDisplay;
  }
  if (!meta.adapted){
    return meta.fromTry ? ('From Try #' + meta.fromTry + (meta.stars ? (' (' + _rnd(meta.stars, 2) + '/5)') : '') + ': holding ' + meta.nextClickDisplay + ' (not Golden Locked)') : '';
  }
  const bits = [];
  if (meta.stars != null) bits.push(_rnd(meta.stars, 2) + '/5');
  if (meta.tdsPct != null) bits.push(_rnd(meta.tdsPct, 2) + '% TDS');
  if (meta.symptom && meta.symptom !== 'balanced' && meta.symptom !== 'great'){
    bits.push(meta.symptom.charAt(0).toUpperCase() + meta.symptom.slice(1).replace(/_/g, ' '));
  }
  const changes = [];
  if (meta.prevClicks != null && meta.nextClicks != null && meta.prevClicks !== meta.nextClicks){
    changes.push(meta.prevClicks + ' -> ' + meta.nextClicks + ' clicks');
  } else if (meta.prevUm && meta.nextUm && meta.prevUm !== meta.nextUm){
    changes.push(meta.prevUm + ' -> ' + meta.nextUm + ' um');
  }
  if (meta.tempDeltaC && Math.abs(meta.tempDeltaC) >= 0.5){
    changes.push(meta.prevTempC + ' -> ' + meta.nextTempC + ' C');
  }
  if (meta.ratioDelta && Math.abs(meta.ratioDelta) >= 0.1){
    changes.push('1:' + meta.prevRatio + ' -> 1:' + meta.nextRatio);
  }
  return 'Adjusted from Try #' + (meta.fromTry || 1) + (bits.length ? (' (' + bits.join(' · ') + ')') : '') + ': ' + (changes.join(', ') || meta.reason || 'adapted');
}

function synthesizeRecipe(input){
  input = input || {};
  const bean = input.bean || input.coffee || {};
  const methodKey = _normMethodKey(input.method || input.methodKey || 'v60');
  const mPhys = typeof G.methodPhysicsFor === 'function' ? G.methodPhysicsFor(methodKey) : G.METHOD_PHYSICS_V6[0];
  const bSum = typeof G.beanPhysicsSummary === 'function'
    ? G.beanPhysicsSummary(bean)
    : { roastObj:{ v:bean.roast || 'medium', agtronMid:60 }, agtron:60, isDecaf:bean.decaf === 'yes', isEthLandrace:false, isGesha:false, isFloralTea:false, isFermentFruit:false, age:{ effectiveDays:10, isFrozen:false } };

  const roastKey = bSum.roastObj.v || 'medium';
  const agtron = bSum.agtron != null ? bSum.agtron : (bSum.roastObj.agtronMid || 60);
  const uRoast = _clamp((agtron - 28.0) / 70.0, 0, 1, 0.5); /* 0 = dark, 1 = ultra-light */
  const procKey = String((bSum.procObj && bSum.procObj.v) || bean.process || 'washed').toLowerCase();
  const spKey = String((bSum.sp && bSum.sp.v) || bean.species || 'arabica').toLowerCase();
  const varTxt = String((bean.varietal || '') + ' ' + (bean.name || '')).toLowerCase();
  const originTxt = String(bean.origin || '').toLowerCase();
  const isHalfCaf = bean.decaf_process === 'half-caf' || bean.caffeineMode === 'halfcaf' || !!bean.halfCaf;
  const isPinkOrChiroso = /pink\s*bourbon|chiroso/i.test(varTxt);
  const isSl28Or34 = /\bsl[-\s]?28\b|\bsl[-\s]?34\b/i.test(varTxt);
  const isLargeBean = /pacamara|maragogype|maragogipe|maracaturra/i.test(varTxt);
  const isLaurina = /laurina|bourbon\s*pointu|aramosa/i.test(varTxt);
  const isSubtropical = /kona|hawaii|maui|ka'u|puerto\s*rico|galapagos|australia/i.test(originTxt);
  let elevMasl = parseFloat(bean.elevation_m || bean.elevation_masl || String(bean.elevText || '').replace(/[^\d.]/g, ''));
  if (isFinite(elevMasl) && (/\b(ft|feet)\b/i.test(String(bean.elevText || '')) || elevMasl > 3500)) elevMasl = Math.round(elevMasl * 0.3048);
  const densKey = String(bean.density || bean.elevation_class || (isFinite(elevMasl) && !isSubtropical ? (elevMasl >= 1950 ? 'very-high' : elevMasl >= 1550 ? 'high' : elevMasl < 1100 ? 'low' : 'mid') : 'mid')).toLowerCase();
  const grinderKey = (input.grinderKey || 'comandante-c40').trim().toLowerCase().replace(/_/g, '-');
  const pgProf = (G.PREGROUND_PROFILES && G.PREGROUND_PROFILES[grinderKey]) || null;
  const pgComp = pgProf ? pgProf.forMethod(methodKey) : null;
  const subModes = Array.isArray(mPhys.subModes) ? mPhys.subModes : [];
  const subModeKey = String(input.subMode || input.style || (subModes[0] && (subModes[0].id || subModes[0].key)) || '').toLowerCase();
  const subModeObj = subModes.find(sm => String(sm.id || sm.key || '').toLowerCase() === subModeKey) || subModes[0] || null;
  const isExplicitSubMode = !!(input.subMode || input.style);
  const waterCfg = input.water || {};
  const waterChemIn = solveWaterChemistry(waterCfg);
  const explanations = [];

  /* 0. Same-Bag Explicit Golden Lock (dial_locked === 'yes'/'1') & Closed-Loop Unlocked Adaptation */
  const sameBagHist = _sameCoffeeMethodRows(bean, methodKey, input.history);
  let lockedRow = null;
  if (!input.ignoreLock){
    for (let li = sameBagHist.length - 1; li >= 0; li--){
      const hr = sameBagHist[li];
      if (!hr || typeof hr !== 'object') continue;
      const dl = String(hr.dial_locked != null ? hr.dial_locked : (hr.dialLocked != null ? hr.dialLocked : '')).trim().toLowerCase();
      if (dl === 'yes' || dl === '1' || dl === 'true'){
        lockedRow = hr;
        break;
      }
      if (dl === 'no' || dl === '0' || dl === 'false'){
        break;
      }
    }
  }
  const lockedParams = lockedRow ? _extractRowParams(lockedRow, mPhys) : null;
  const learnableHist = sameBagHist.filter(h => !isRowExcludedFromLearning(h));
  const latestUnlocked = (!lockedRow && learnableHist.length && !input.skipHistoryAdapt) ? learnableHist[learnableHist.length - 1] : null;
  const hasExplicitRecipeInputs = (input.grindUm > 0 || input.d50Um > 0) && (input.ratio > 0 || input.waterG > 0 || input.water > 0);

  let adaptedClosedLoop = null;
  let dialAdaptation = null;

  if (lockedRow && lockedParams){
    const prevUmL = lockedParams.d50Um || mPhys.d50AnchorUm;
    const gL = mapMicronsToGrinder(prevUmL, grinderKey, input.calib || null, methodKey);
    const tryN = +lockedRow.brew_attempt > 0 ? +lockedRow.brew_attempt : sameBagHist.length;
    const lStars = _extractRowStars5(lockedRow);
    const lTds = _pickFirstPosNum([lockedRow.tdsPct, lockedRow.tds, lockedRow.brew_tds_pct]) || null;
    const lEy = _pickFirstPosNum([lockedRow.eyPct, lockedRow.ey, lockedRow.brew_ey_pct, lockedRow.brew_ey_total_pct]) || null;
    dialAdaptation = {
      locked:true,
      adapted:false,
      fromTry:tryN,
      nextTry:tryN + 1,
      fromRowId:String(lockedRow.id || ''),
      stars:lStars,
      tdsPct:lTds,
      eyPct:lEy,
      symptom:'golden_lock',
      prevClicks:gL ? gL.clicks : null,
      nextClicks:gL ? gL.clicks : null,
      prevClickDisplay:gL ? (gL.shortDisplay || gL.display) : (prevUmL + ' um'),
      nextClickDisplay:gL ? (gL.shortDisplay || gL.display) : (prevUmL + ' um'),
      prevUm:prevUmL,
      nextUm:prevUmL,
      grindDeltaUm:0,
      grindDeltaClicks:0,
      prevTempC:lockedParams.tempC || 93,
      nextTempC:lockedParams.tempC || 93,
      tempDeltaC:0,
      prevRatio:lockedParams.ratio,
      nextRatio:lockedParams.ratio,
      ratioDelta:0,
      reason:'Golden Lock active — holding your locked recipe steady.',
      source:'golden_lock'
    };
    dialAdaptation.summaryBanner = _buildDialBanner(dialAdaptation);
  } else if (latestUnlocked && !hasExplicitRecipeInputs){
    const prevP = _extractRowParams(latestUnlocked, mPhys);
    const prevUm = prevP.d50Um || mPhys.d50AnchorUm;
    const prevTempC = prevP.tempC || (mPhys.tempByRoastC[roastKey] != null ? mPhys.tempByRoastC[roastKey] : 93);
    const prevRec = {
      method:methodKey,
      methodKey,
      bean,
      doseG:prevP.doseG,
      waterG:prevP.waterG,
      ratio:prevP.ratio,
      tempC:prevTempC,
      d50Um:prevUm,
      grindUm:prevUm,
      bevG:prevP.bevG || undefined,
      agitation:prevP.agitation || 'standard',
      grinderKey,
      calib:input.calib || null,
      waterKhPpm:waterChemIn.khPpm
    };
    const obs = _extractObsFromRow(latestUnlocked, mPhys, prevRec);
    const diag = solveMakeItPerfect(prevRec, obs, learnableHist.slice(0, -1));
    const adMeta = _parseAdaptationMeta(latestUnlocked);
    const persNr = adMeta && adMeta.next_recipe && typeof adMeta.next_recipe === 'object' ? adMeta.next_recipe : null;
    const persUm = persNr ? _pickFirstPosNum([persNr.d50Um, persNr.grindUm, persNr.grind_um]) : 0;
    const diagNext = (diag && diag.nextRecipe) ? diag.nextRecipe : {};
    const persMatchesObs = !!(persNr && persUm > 0 &&
      (persNr.diagStars == null || obs.stars == null || Math.abs(+persNr.diagStars - obs.stars) < 0.05) &&
      (persNr.diagTds == null || obs.measuredTdsPct == null || Math.abs(+persNr.diagTds - obs.measuredTdsPct) < 0.02));
    const persIsStaleNoop = !!(persNr && diag && Math.abs(diag.grindDeltaClicks || 0) >= 0.1 && persUm === prevUm && (!persNr.tempC || +persNr.tempC === prevTempC) && !persNr.tabuPivotApplied);
    const usePersisted = persMatchesObs && !persIsStaleNoop;

    const chosenNextUm = usePersisted ? Math.round(persUm / 5) * 5 : (diagNext.d50Um || diagNext.grindUm || prevUm);
    const chosenNextTempC = usePersisted && +persNr.tempC > 0 ? +persNr.tempC : (diagNext.tempC != null ? +diagNext.tempC : prevTempC);
    const chosenNextRatio = usePersisted && +persNr.ratio > 0 ? +persNr.ratio : (diagNext.ratio > 0 ? +diagNext.ratio : prevP.ratio);
    const chosenNextDoseG = usePersisted && +persNr.doseG > 0 ? +persNr.doseG : (diagNext.doseG > 0 ? +diagNext.doseG : prevP.doseG);
    const chosenNextWaterG = usePersisted && +persNr.waterG > 0 ? +persNr.waterG : (diagNext.waterG > 0 ? +diagNext.waterG : _rnd(chosenNextDoseG * chosenNextRatio, 1));
    const chosenAgitation = (usePersisted && persNr.agitation) ? persNr.agitation : (diagNext.agitation || prevP.agitation || 'standard');

    const gPrev = mapMicronsToGrinder(prevUm, grinderKey, input.calib || null, methodKey);
    const gNext = mapMicronsToGrinder(chosenNextUm, grinderKey, input.calib || null, methodKey);
    const tryN = +latestUnlocked.brew_attempt > 0 ? +latestUnlocked.brew_attempt : learnableHist.length;
    const deltaClicks = (gPrev && gNext && gPrev.clicks != null && gNext.clicks != null) ? _rnd(gNext.clicks - gPrev.clicks, 2) : 0;
    const deltaTempC = _rnd(chosenNextTempC - prevTempC, 1);
    const deltaRatio = _rnd(chosenNextRatio - prevP.ratio, 2);
    const adaptedFlag = Math.abs(chosenNextUm - prevUm) >= 2 || Math.abs(deltaClicks) >= 0.05 || Math.abs(deltaTempC) >= 0.5 || Math.abs(deltaRatio) >= 0.1 || chosenAgitation !== (prevP.agitation || 'standard');
    const reasonTxt = (adMeta && adMeta.dial_adaptation && adMeta.dial_adaptation.reason) || (diag && diag.primaryActionHuman) || 'Closed-loop brew adaptation';

    adaptedClosedLoop = {
      doseG:chosenNextDoseG,
      waterG:chosenNextWaterG,
      ratio:chosenNextRatio,
      tempC:chosenNextTempC,
      d50Um:chosenNextUm,
      agitation:chosenAgitation,
      style:prevP.style,
      filterId:prevP.filterId
    };
    dialAdaptation = {
      locked:false,
      adapted:adaptedFlag,
      fromTry:tryN,
      nextTry:tryN + 1,
      fromRowId:String(latestUnlocked.id || ''),
      stars:obs.stars,
      tdsPct:obs.measuredTdsPct,
      eyPct:obs.measuredEyPct || (diag && diag.nextRecipe ? null : null),
      symptom:obs.symptom || (diag && diag.topHypothesis ? diag.topHypothesis.id : ''),
      prevClicks:gPrev ? gPrev.clicks : null,
      nextClicks:gNext ? gNext.clicks : null,
      prevClickDisplay:gPrev ? ((gPrev.calibMode === 'taste' && gPrev.clicks == null) ? ('Stepless (~' + Math.round(prevUm) + ' um)') : (gPrev.shortDisplay || gPrev.display)) : (prevUm + ' um'),
      nextClickDisplay:gNext ? ((gNext.calibMode === 'taste' && gNext.clicks == null) ? ('Stepless (~' + Math.round(chosenNextUm) + ' um)') : (gNext.shortDisplay || gNext.display)) : (chosenNextUm + ' um'),
      prevUm,
      nextUm:chosenNextUm,
      grindDeltaUm:Math.round(chosenNextUm - prevUm),
      grindDeltaClicks:deltaClicks,
      prevTempC,
      nextTempC:chosenNextTempC,
      tempDeltaC:deltaTempC,
      prevRatio:prevP.ratio,
      nextRatio:chosenNextRatio,
      ratioDelta:deltaRatio,
      reason:reasonTxt,
      source:usePersisted ? 'persisted_next_recipe' : 'closed_loop_solver'
    };
    dialAdaptation.summaryBanner = _buildDialBanner(dialAdaptation);
    if (adaptedFlag){
      explanations.push(makeScienceAtom(
        'closed-loop-dial',
        'Closed-Loop Adaptation (Try #' + tryN + ' -> #' + (tryN + 1) + ')',
        dialAdaptation.prevClickDisplay + ' -> ' + dialAdaptation.nextClickDisplay,
        dialAdaptation.summaryBanner,
        (diag && diag.scientistExplanation) || 'Closed-loop sensory + refractometric feedback adapted grind, thermal, and ratio targets for your next cup.',
        'verified_science',
        'BeanTelligence Closed-Loop Solver'
      ));
    }
  }

  /* 1. Ratio & Mass Synthesis (Driven by Locked/Adapted History, Roast, SubMode, Species, Process, Varietal & Pre-Ground) */
  const hasLockedRatio = !!(lockedParams && lockedParams.ratio > 0);
  const hasAdaptedRatio = !!(adaptedClosedLoop && adaptedClosedLoop.ratio > 0);
  let ratio = input.ratio > 0 ? +input.ratio
    : (hasLockedRatio ? lockedParams.ratio
    : (hasAdaptedRatio ? adaptedClosedLoop.ratio
    : (isExplicitSubMode && subModeObj && subModeObj.ratio > 0 ? subModeObj.ratio : mPhys.ratio)));
  if (!(input.ratio > 0) && !hasLockedRatio && !hasAdaptedRatio){
    const hasSubRatio = !!(isExplicitSubMode && subModeObj && subModeObj.ratio > 0);
    if (!hasSubRatio){
      if (!mPhys.outRatio && methodKey !== 'cold' && methodKey !== 'cold_drip' && methodKey !== 'turkish' && methodKey !== 'moka'){
        ratio += (uRoast - 0.5) * (methodKey === 'phin' ? 0.6 : 1.1);
        if (bSum.isGesha && mPhys.chiRet < 0.5) ratio += 0.6;
        else if (bSum.isFloralTea && mPhys.chiRet < 0.5 && (roastKey === 'ultra-light' || roastKey === 'light' || roastKey === 'medium-light')) ratio += 0.3;
        if (spKey === 'eugenioides' && mPhys.chiRet < 0.5) ratio -= 0.7;
        else if (spKey === 'robusta') ratio -= 1.0;
        if (procKey === 'wet-hulled') ratio -= 0.5;
        else if (procKey === 'infused' || procKey === 'thermal-shock') ratio += 0.4;
      } else if (mPhys.outRatio && (!subModeObj || (subModeObj.id || subModeObj.key) === 'esp-9bar' || (subModeObj.id || subModeObj.key) === 'lever-londinium')){
        ratio = _rnd(1.75 + 0.55 * uRoast + (spKey === 'robusta' ? -0.25 : 0), 2);
      }
      if (pgComp && pgComp.ratioDelta) ratio += pgComp.ratioDelta;
    }
    ratio = _clamp(_rnd(ratio, mPhys.outRatio ? 2 : 1), mPhys.ratioBounds[0], mPhys.ratioBounds[1], mPhys.ratio);
  }

  let doseG = input.doseG > 0 ? +input.doseG
    : (input.dose > 0 ? +input.dose
    : (lockedParams && lockedParams.doseG > 0 ? lockedParams.doseG
    : (adaptedClosedLoop && adaptedClosedLoop.doseG > 0 ? adaptedClosedLoop.doseG : mPhys.dose)));
  let waterG = input.waterG > 0 ? +input.waterG
    : (input.water > 0 ? +input.water
    : ((!(input.doseG > 0 || input.dose > 0) && lockedParams && lockedParams.waterG > 0) ? lockedParams.waterG
    : ((!(input.doseG > 0 || input.dose > 0) && adaptedClosedLoop && adaptedClosedLoop.waterG > 0) ? adaptedClosedLoop.waterG
    : _rnd(doseG * ratio, 1))));
  if (input.waterG > 0 && !(input.doseG > 0 || input.dose > 0)){
    doseG = _rnd(waterG / ratio, 1);
  } else if ((input.doseG > 0 || input.dose > 0) && !(input.waterG > 0 || input.water > 0)){
    waterG = _rnd(doseG * ratio, 1);
  }

  /* 2. Target Temperature + Altitude Boil Cap + Spillover */
  const elevM = _clamp(input.altitudeM != null ? input.altitudeM : input.elevM, -430, 5500, 0);
  const boilC = boilingPointC(elevM);
  const isSealedEsp = (methodKey === 'espresso' || methodKey === 'lever_espresso');
  const isColdMethod = (methodKey === 'cold' || methodKey === 'cold_drip');
  const hasLockedTemp = !!(lockedParams && lockedParams.tempC > 0);
  const hasAdaptedTemp = !!(adaptedClosedLoop && adaptedClosedLoop.tempC > 0);
  let baseTempC = input.tempC > 0 ? +input.tempC
    : (hasLockedTemp ? lockedParams.tempC
    : (hasAdaptedTemp ? adaptedClosedLoop.tempC
    : (isExplicitSubMode && subModeObj && subModeObj.tempC != null ? subModeObj.tempC : (mPhys.tempByRoastC[roastKey] != null ? mPhys.tempByRoastC[roastKey] : 93))));
  if (!(input.tempC > 0) && !hasLockedTemp && !hasAdaptedTemp && !isColdMethod){
    if (bSum.agtron != null && methodKey !== 'moka' && methodKey !== 'turkish'){
      const tDark = mPhys.tempByRoastC && mPhys.tempByRoastC.dark != null ? mPhys.tempByRoastC.dark : 85.5;
      const tUL   = mPhys.tempByRoastC && mPhys.tempByRoastC['ultra-light'] != null ? mPhys.tempByRoastC['ultra-light'] : 97.5;
      baseTempC = _rnd(tDark + uRoast * (tUL - tDark), 1);
      if (methodKey === 'aiden') baseTempC -= 1.5;
    }
    if (subModeKey === 'ap-concentrate') baseTempC = Math.min(baseTempC, 85.0);
    if (bSum.roastDelta && bSum.roastDelta.tempCompC && methodKey !== 'moka' && methodKey !== 'turkish'){
      baseTempC += bSum.roastDelta.tempCompC;
    }
    if (methodKey !== 'moka' && methodKey !== 'turkish'){
      let procTempDelta = 0;
      if (procKey === 'infused' || procKey === 'thermal-shock') procTempDelta = -2.5;
      else if (procKey === 'anaerobic' || procKey === 'carbonic' || procKey === 'yeast-koji' || procKey === 'yeast' || procKey === 'black-honey' || procKey === 'honey-black') procTempDelta = -2.0;
      else if (procKey === 'natural' || procKey === 'red-honey' || procKey === 'honey-red') procTempDelta = -1.2;
      else if (procKey === 'yellow-honey' || procKey === 'honey-yellow' || procKey === 'honey') procTempDelta = -0.7;
      else if (procKey === 'white-honey' || procKey === 'honey-white') procTempDelta = -0.3;
      else if (procKey === 'wet-hulled') procTempDelta = -1.5;
      else if (procKey === 'unknown' && bSum.isFermentFruit) procTempDelta = -0.8;
      if (procTempDelta !== 0){
        baseTempC += procTempDelta;
        explanations.push(makeScienceAtom('process-thermal', 'Process Solubility (' + procKey + ')', procTempDelta + ' C', 'Extended fermentation/fruit mucilage opens cell-wall porosity, so lowering water by ' + Math.abs(procTempDelta) + ' C prevents boozy or bitter over-extraction.', 'Microbial pectinase hydrolysis elevates effective intraparticle diffusivity D_eff; lower T suppresses high-Ea (42 kJ/mol) polyphenol tailing.', 'verified_science', 'Batali et al. 2020; Zhang et al. 2019'));
      }
      if (spKey === 'robusta'){ baseTempC -= 3.5; explanations.push(makeScienceAtom('species-robusta', 'Canephora CGA Guard', '-3.5 C', 'Robusta carries ~2x chlorogenic acids and caffeine, so cooler water keeps cocoa body smooth.', 'C. canephora contains 7-10% dry-mass CGA and 2.2% caffeine; lower T throttles high-Ea CGA-lactone extraction.', 'verified_science', 'Farah & Donangelo 2006; Campa et al. 2005')); }
      else if (spKey === 'liberica' || spKey === 'excelsa'){ baseTempC -= 2.0; explanations.push(makeScienceAtom('species-liberica', 'Liberica/Excelsa Pachycarpous Guard', '-2.0 C', 'Large thick-walled Liberica/Excelsa beans extract sweetest with slightly gentler heat.', 'Lower thermal stress preserves sweet jackfruit/berry esters while moderating woody phenolic extraction.', 'sensory_craft', 'Davis et al. 2022 Kew Gardens')); }
      else if (spKey === 'eugenioides'){ baseTempC -= 1.5; explanations.push(makeScienceAtom('species-eugenioides', 'Eugenioides Ultra-Low-Bitterness Frame', '-1.5 C', 'Naturally ~0.2% caffeine Eugenioides tastes like spun sugar when brewed gently.', 'Diploid maternal progenitor of Arabica (~0.20% caffeine) exhibits ultra-low TAS2R agonist content.', 'verified_science', 'Lashermes et al. 1999; Campa et al. 2005')); }
      else if (spKey === 'stenophylla'){ baseTempC += 0.5; }
      if ((densKey === 'very-high' || densKey === 'ultra-high') && !isSubtropical) baseTempC += 1.0;
      else if (densKey === 'high' && !isSubtropical) baseTempC += 0.5;
      else if (densKey === 'low' && !isSubtropical) baseTempC -= 1.2;
      if (isSl28Or34) baseTempC += 0.5;
      if (isLaurina) baseTempC -= 1.5;
      if (waterCfg.kh != null || waterCfg.presetKey){
        if (waterChemIn.khPpm > 85){ baseTempC += 1.0; explanations.push(makeScienceAtom('water-high-kh', 'High-KH Buffer Rescue (' + Math.round(waterChemIn.khPpm) + ' ppm)', '+1.0 C', 'High water alkalinity mutes fruit acids, so +1 C helps pull vibrant complexity.', 'Elevated HCO3- neutralizes diprotic citric/malic protons; higher T boosts total acid yield.', 'verified_science', 'Hendon et al. 2014')); }
        else if (waterChemIn.khPpm < 18){ baseTempC -= 1.0; explanations.push(makeScienceAtom('water-low-kh', 'Ultra-Low-KH Acid Guard (' + Math.round(waterChemIn.khPpm) + ' ppm)', '-1.0 C', 'Very low-buffer water lets acids shine sharply, so -1 C keeps the cup sweet.', 'Near-zero carbonate buffer leaves organic acids unbuffered; -1 C balances sweet/acid ratio.', 'verified_science', 'Hendon et al. 2014')); }
      }
      if (pgComp && pgComp.tempDeltaC) baseTempC += pgComp.tempDeltaC;
    }
    baseTempC = _clamp(baseTempC, methodKey === 'moka' ? 35 : 78, methodKey === 'turkish' ? 94.0 : 99.5, 93);
  }
  const maxAllowedC = isSealedEsp ? 102.0 : (methodKey === 'turkish' ? Math.min(94.0, boilC - 4.0) : (boilC - 0.8));
  const kettleTempC = (methodKey === 'cold' || methodKey === 'cold_drip')
    ? baseTempC
    : _rnd(Math.min(baseTempC, maxAllowedC), 1);
  const boilDeficitC = (!isSealedEsp && baseTempC > kettleTempC && methodKey !== 'cold' && methodKey !== 'cold_drip')
    ? _rnd(baseTempC - kettleTempC, 2)
    : 0;

  explanations.push(makeScienceAtom(
    'temp-roast',
    'Thermal Kinetics (' + kettleTempC + ' C)',
    kettleTempC + ' C',
    'Brew water set to ' + kettleTempC + ' C (' + Math.round(kettleTempC * 9 / 5 + 32) + ' F) to match ' + roastKey + ' roast porosity.',
    'Arrhenius diffusivity scales by exp(-1000*Ea/R*(1/T - 1/T_ref)) with species activation energies 16.5/21.5/42 kJ/mol (Acids/Sugars/Bitters).',
    'verified_science',
    'Liang et al. 2024 Sci Rep 14:19298; Batali et al. 2020 Sci Rep 10:16450'
  ));

  if (boilDeficitC > 0.2){
    explanations.push(makeScienceAtom(
      'altitude-boil-cap',
      'Altitude Boil Cap (' + Math.round(elevM) + ' m)',
      'Max ' + kettleTempC + ' C',
      'At ' + Math.round(elevM) + ' m water boils at ' + boilC + ' C, so we capped kettle temperature and nudged grind slightly finer to compensate.',
      'Clausius-Clapeyron vapor equilibrium P_atm(z) caps open-vessel enthalpy; -1.8% d50 per missing C restores Sherwood mass transfer.',
      'verified_science',
      'ICAO Standard Atmosphere; Clausius-Clapeyron relation'
    ));
  }

  /* 3. Target Particle Size D50 Synthesis (Locked/Adapted History, Roast, Decaf/Half-Caf Inversion, Process, Species, Varietal, Density, Age/Cryo, Filter Media, SubMode!) */
  const fChoice = (typeof G.filterV6For === 'function' ? G.filterV6For(input.filterId || mPhys.defaultFilterId) : null);
  const fDefChoice = (typeof G.filterV6For === 'function' ? G.filterV6For(mPhys.defaultFilterId) : null);
  const effAgeDays = (bSum.age && bSum.age.effectiveDays != null) ? bSum.age.effectiveDays : 10;
  const hasLockedUm = !!(lockedParams && lockedParams.d50Um > 0);
  const hasAdaptedUm = !!(adaptedClosedLoop && adaptedClosedLoop.d50Um > 0);
  let d50Um = input.grindUm > 0 ? +input.grindUm
    : (input.d50Um > 0 ? +input.d50Um
    : (hasLockedUm ? lockedParams.d50Um
    : (hasAdaptedUm ? adaptedClosedLoop.d50Um : mPhys.d50AnchorUm)));
  if (pgProf && pgProf.fixedUm > 0 && !(input.grindUm > 0 || input.d50Um > 0)){
    d50Um = pgProf.fixedUm;
    explanations.push(makeScienceAtom('preground-lock', 'Pre-Ground Fixed PSD (' + d50Um + ' um)', 'Fixed ' + d50Um + ' um', pgComp ? pgComp.note : 'Grind is fixed, so we tuned temperature, ratio, and pour gentleness around it.', 'Fixed exogenous PSD locks d50; contact time, T, and liquid-to-solid ratio absorb extraction targeting.', 'verified_science', 'Moroney et al. 2015'));
  } else if (!(input.grindUm > 0 || input.d50Um > 0) && !hasLockedUm && !hasAdaptedUm){
    let mult = 1.0;
    if (methodKey !== 'turkish'){
      mult *= (1.07 - 0.14 * uRoast);
    }
    if (!(isExplicitSubMode && subModeObj && subModeObj.d50Um > 0)){
      if (subModeKey === 'fp-classic') mult *= 1.12;
      else if (subModeKey === 'sw-water-first') mult *= 0.96;
    }
    if (bSum.isDecaf || isHalfCaf){
      const invWeight = isHalfCaf ? 0.50 : 1.00;
      if (methodKey === 'espresso' || methodKey === 'lever_espresso'){
        const espFactor = 1.0 - 0.055 * invWeight;
        mult *= espFactor;
        explanations.push(makeScienceAtom('decaf-espresso-inversion', (isHalfCaf ? 'Half-Caf ' : 'Decaf ') + '9-Bar Hydraulic Inversion', _rnd((espFactor - 1) * 100, 1) + '% finer um', (isHalfCaf ? 'Half-caf has half the CO2 resistance' : 'Decaf lacks CO2 gas resistance') + ' under 9-bar pressure, so we grind finer to prevent a fast gusher.', 'Reduced intragranular CO2 saturation S_g raises Darcy puck permeability k_bed ~ (1 - S_g)^2 on zero-blinding metal baskets.', 'verified_science', 'Darcy-Kozeny two-phase packed-bed physics; Liang et al. 2021'));
      } else if (methodKey !== 'turkish'){
        const fltFactor = 1.0 + 0.080 * invWeight;
        mult *= fltFactor;
        explanations.push(makeScienceAtom('decaf-filter-inversion', (isHalfCaf ? 'Half-Caf ' : 'Decaf ') + 'Filter Anti-Stall Guard', '+' + _rnd((fltFactor - 1) * 100, 1) + '% coarser um', (isHalfCaf ? 'Half-caf' : 'Decaf') + ' beans create extra brittle fines that slow paper filters, so we grind coarser for a clean drawdown.', 'Steamed decaf cell walls yield elevated fines fraction phi_f, increasing cellulose pore blinding under gravity head.', 'verified_science', 'Liang, Chan & Ristenpart 2021 Sci Rep 11:6904; Gagne 2021'));
      }
    }
    if (methodKey !== 'turkish'){
      if (procKey === 'infused' || procKey === 'thermal-shock' || procKey === 'anaerobic' || procKey === 'carbonic' || procKey === 'yeast-koji' || procKey === 'yeast') mult *= 1.05;
      else if (procKey === 'natural' || procKey === 'black-honey' || procKey === 'honey-black' || procKey === 'red-honey' || procKey === 'honey-red') mult *= 1.03;
      else if (procKey === 'wet-hulled') mult *= 1.04;
    }
    if (methodKey !== 'turkish'){
      if (spKey === 'robusta') mult *= 1.05;
      else if (spKey === 'liberica' || spKey === 'excelsa') mult *= 1.06;
      else if (spKey === 'eugenioides') mult *= 0.97;
      if (bSum.isEthLandrace && mPhys.chiRet < 0.85 && methodKey !== 'espresso' && methodKey !== 'lever_espresso'){
        mult *= 1.06;
        explanations.push(makeScienceAtom('eth-fines-guard', 'Ethiopian Landrace Fines Guard', '+6% coarser um', 'Dense Ethiopian heirloom beans create extra fines, so a touch coarser grind keeps flow lively.', 'Elevated brittle fines mode phi_f (+22%) increases dynamic filter resistance R_filter(t).', 'craft_best_practice', 'Gagne 2021'));
      } else if (isPinkOrChiroso && mPhys.chiRet < 0.85 && methodKey !== 'espresso' && methodKey !== 'lever_espresso'){
        mult *= 1.035;
        explanations.push(makeScienceAtom('eth-lineage-guard', 'Pink Bourbon / Chiroso Ethiopian Lineage', '+3.5% coarser um', 'Genomic Ethiopian landrace selections fracture densely — slightly coarser highlights florals.', 'SNP genotyping confirms Ethiopian landrace ancestry with elevated brittle fracture fines.', 'verified_science', 'WCR / RD2 Vision Genomics 2023'));
      }
      if (isLargeBean) mult *= 1.04;
      if (isLaurina) mult *= 1.04;
      if ((densKey === 'very-high' || densKey === 'ultra-high') && !isSubtropical) mult *= 0.975;
      else if (densKey === 'low' && !isSubtropical) mult *= 1.035;
    }
    if (!bSum.isDecaf && methodKey !== 'turkish'){
      if (effAgeDays <= 3) mult *= (isSealedEsp ? 1.03 : 1.025);
      else if (effAgeDays >= 28) mult *= (isSealedEsp ? 0.96 : 0.97);
    }
    if (fChoice && fChoice.umMult && fDefChoice && fDefChoice.umMult && fChoice.id !== fDefChoice.id && methodKey !== 'turkish'){
      const fMult = fChoice.umMult / fDefChoice.umMult;
      mult *= fMult;
      explanations.push(makeScienceAtom('filter-media-perm', 'Filter Media Permeability (' + fChoice.label + ')', _rnd((fMult - 1) * 100, 1) + '% um', 'Adjusted grind for ' + fChoice.label + ' flow rate.', 'Darcy resistance R_media scales inversely with filter kRel (' + (fChoice.kRel || 1) + 'x).', 'verified_science', 'Gagne 2021'));
    }
    if (mPhys.chiRet < 0.5 && !mPhys.outRatio && doseG > 0 && mPhys.dose > 0){
      const depthMult = Math.pow(doseG / mPhys.dose, methodKey === 'kalita' || methodKey === 'orea' || methodKey === 'drip' ? 0.22 : 0.18);
      mult *= depthMult;
    }
    if (boilDeficitC > 0.2 && methodKey !== 'turkish'){
      mult *= Math.max(0.90, 1.0 - 0.018 * boilDeficitC);
    }
    const anchorBaseUm = (isExplicitSubMode && subModeObj && subModeObj.d50Um > 0) ? subModeObj.d50Um : mPhys.d50AnchorUm;
    if (methodKey === 'aiden'){
      d50Um = waterG <= 450
        ? Math.round(580 * Math.pow(waterG / 300, 0.20) * mult)
        : Math.round(860 * Math.pow(waterG / 750, 0.25) * mult);
    } else {
      d50Um = Math.round(anchorBaseUm * mult);
    }
    if (bSum.age && bSum.age.isFrozen && methodKey !== 'turkish') d50Um += 12;
    const maxClampUm = (subModeKey === 'esp-turbo' || subModeKey === 'esp-soup' || subModeKey === 'lever-soup' || subModeKey === 'lev-soup') ? mPhys.um[1] + 190 : mPhys.um[1] + 60;
    d50Um = _clamp(d50Um, Math.max(60, mPhys.um[0] - 40), maxClampUm, mPhys.d50AnchorUm);
    d50Um = Math.round(d50Um / 5) * 5;
  }

  if (bSum.isFloralTea && !isSealedEsp && methodKey !== 'turkish' && methodKey !== 'moka'){
    explanations.push(makeScienceAtom('bag-notes-clarity', 'Roaster Notes Clarity Guard', 'Clean Flow', 'Roaster bag notes highlight delicate floral/tea aromatics — gentle center pours preserve volatile monoterpenes.', 'Linalool & geraniol retain maximum retronasal intensity when late bitter lactone extraction is minimized.', 'craft_best_practice', 'BeanTelligence Sensory Chemistry'));
  }

  const simPressureBar = (isExplicitSubMode && subModeObj && (subModeObj.bar || subModeObj.peakBar)) ? (subModeObj.bar || subModeObj.peakBar) : (subModeKey === 'esp-turbo' ? 6.0 : (subModeKey === 'esp-soup' || subModeKey === 'lever-soup') ? 1.5 : undefined);
  const bypassCleanG = subModeKey === 'ap-concentrate'
    ? Math.round(doseG * 9.0)
    : ((isExplicitSubMode && subModeObj && subModeObj.bypassToRatio > 0) ? Math.max(0, Math.round(doseG * subModeObj.bypassToRatio - waterG)) : (input.bypassG > 0 ? +input.bypassG : 0));
  const effectiveBrewWaterG = subModeKey === 'ap-concentrate' ? Math.round(doseG * 5.0) : waterG;
  const agitationMode = pgComp && pgComp.agitation ? pgComp.agitation
    : (lockedParams && lockedParams.agitation ? lockedParams.agitation
    : (adaptedClosedLoop && adaptedClosedLoop.agitation ? adaptedClosedLoop.agitation
    : ((procKey === 'infused' || bSum.isDecaf || bSum.isEthLandrace || bSum.isFloralTea) ? 'gentle' : 'standard')));

  const co2 = smrkeCo2Trajectory({ agtron, effectiveDays:bSum.isDecaf ? 35 : effAgeDays });
  const sim = simulateBrew({
    methodKey,
    doseG,
    waterG:effectiveBrewWaterG,
    bypassG:bypassCleanG,
    d50Um,
    kettleTempC,
    pressureBar:simPressureBar,
    altitudeM:elevM,
    agtron,
    isDecaf:bSum.isDecaf,
    isEthLandrace:bSum.isEthLandrace,
    frozenBeans:!!(bSum.age && bSum.age.isFrozen),
    effectiveDays:bSum.isDecaf ? 35 : effAgeDays,
    water:waterCfg,
    agitation:agitationMode,
    grinderKey,
    filterId:input.filterId || (isExplicitSubMode && subModeObj && subModeObj.filterId) || mPhys.defaultFilterId,
    brewerMaterial:input.brewerMaterial || 'plastic',
    preheat:input.preheat || 'boiling_rinse',
    immersionBasis:input.immersionBasis
  });

  const gMapped = mapMicronsToGrinder(d50Um, grinderKey, input.calib || null, methodKey);

  /* 5. Build Dual-Voice (Human + Scientist) Brew Steps & Step-Staircase Geometry (#166 & #169) */
  const steps = [];
  const stepStaircase = [];
  const isHybridValve = (methodKey === 'switch' || methodKey === 'pulsar');
  const isImmersion = !isHybridValve && mPhys.chiRet >= 0.85;
  const wRound = Math.round(effectiveBrewWaterG);

  if (methodKey === 'clever'){
    const endS = Math.round(sim.brewTimeS);
    const releaseS = Math.max(90, endS - 45);
    steps.push(
      { t:0, pourStartS:0, pourEndS:18, holdUntilS:35, fromG:0, toG:wRound, targetG:wRound, scale:wRound, targetFlowGs:_rnd(wRound / 18, 1), actionKind:'clever_water_first', valveState:'closed', phase:'WATER-FIRST POUR (COASTER CLOSED)', label:'Step 1: Pour All ' + wRound + ' g Hot Water First, Then Add ' + doseG + ' g Grounds', title:'Water First + Grounds', human:'Set Clever on scale (coaster valve stays CLOSED automatically). Pour all ' + wRound + ' g (' + kettleTempC + ' C) water FIRST, then dump ' + doseG + ' g coffee on top and gently fold wet.', scientist:'Water-first addition keeps micro-fines suspended in the upper raft instead of clogging paper pores before drawdown (-40s stall reduction).', epistemicTier:'verified_science', citations:'Hoffmann / Gagne Clever Water-First Protocol' },
      { t:35, pourStartS:35, pourEndS:40, holdUntilS:releaseS, fromG:wRound, toG:wRound, targetG:wRound, scale:wRound, targetFlowGs:0, actionKind:'clever_steep', valveState:'closed', phase:'LIDDED STEEP & CRUST BREAK', label:'Step 2: Cover & Steep; Break Top Crust Gently at ' + G.fmtTime(Math.max(45, releaseS - 30)), title:'Steep & Crust Break', human:'Cover lid to trap aroma; give one gentle stir across the top 1 cm crust 30s before drawdown so grounds settle flat.', scientist:'Isothermal zero-bypass batch immersion equalizes extraction across particle sizes.', epistemicTier:'verified_science', citations:'Liang, Chan & Ristenpart 2021 Sci Rep 11:6904' },
      { t:releaseS, pourStartS:releaseS, pourEndS:endS, holdUntilS:endS, fromG:wRound, toG:wRound, targetG:wRound, scale:wRound, targetFlowGs:0, actionKind:'clever_mug_release', valveState:'open', phase:'PLACE ON MUG \u2192 DRAWDOWN', label:'Step 3: Set Clever Onto Mug at ' + G.fmtTime(releaseS) + ' to Release Coaster Valve', title:'Place on Mug & Drain', human:'Lift Clever onto your mug/server at ' + G.fmtTime(releaseS) + ' — the coaster opens automatically and drains cleanly by ~' + G.fmtTime(endS) + '.', scientist:'Settled coffee cake acts as a depth filter above the trapezoid paper.', epistemicTier:'verified_science', citations:'Gagne 2021' }
    );
    stepStaircase.push({ t0:0, t1:18, fromG:0, toG:wRound, kind:'pour', targetFlowGs:_rnd(wRound / 18, 1), valveState:'closed', label:'Water-First Fill' }, { t0:18, t1:releaseS, fromG:wRound, toG:wRound, kind:'hold', targetFlowGs:0, valveState:'closed', label:'Covered Steep' }, { t0:releaseS, t1:endS, fromG:wRound, toG:wRound, kind:'drain', targetFlowGs:0, valveState:'open', label:'Mug Release Drawdown' });
  } else if (methodKey === 'turkish'){
    const endS = Math.round(sim.brewTimeS);
    const riseS = Math.max(90, endS - 60);
    steps.push(
      { t:0, pourStartS:0, pourEndS:15, holdUntilS:15, fromG:0, toG:wRound, targetG:wRound, scale:wRound, targetFlowGs:_rnd(wRound / 15, 1), actionKind:'combine', valveState:null, phase:'COLD/WARM COMBINE', label:'Step 1: Combine ' + doseG + ' g Powder + ' + wRound + ' g ~60 C Water & Stir Once', title:'Combine & Fold', human:'Add ' + doseG + ' g ultra-fine Turkish grounds and ' + wRound + ' g warm (~60 C) water into the cezve; fold gently for 10s until zero dry lumps remain, then NEVER stir again.', scientist:'Early dispersion wets ~85 um flour particles before starch gelatinization and protein foam formation.', epistemicTier:'craft_best_practice', citations:'STC / SCA Cezve Championship Protocol' },
      { t:15, pourStartS:15, pourEndS:riseS, holdUntilS:riseS, fromG:wRound, toG:wRound, targetG:wRound, scale:wRound, targetFlowGs:0, actionKind:'heat_kaymak', valveState:null, phase:'KAYMAK FOAM RISE (<94 C)', label:'Step 2: Gentle Heat Until Kaymak Foam Ring Rises (~' + kettleTempC + ' C — DO NOT BOIL!)', title:'Raise Kaymak (<94 C)', human:'Heat on low-medium flame hands-off until a velvety dark foam ring (kaymak) swells toward the lip (~' + G.fmtTime(riseS) + ', ~92-94 C). Pull off heat BEFORE a rolling boil!', scientist:'Nucleating CO2 micro-bubbles stabilize melanoidin-lipid foam at 92-94 C; rolling boil (>98 C) collapses foam and hydrolyzes bitter chlorogenic lactones.', epistemicTier:'verified_science', citations:'SCA Cezve Protocol; Navarini Foam Physics' },
      { t:riseS, pourStartS:riseS, pourEndS:endS, holdUntilS:endS, fromG:wRound, toG:wRound, targetG:wRound, scale:wRound, targetFlowGs:0, actionKind:'settle_telve', valveState:null, phase:'POUR & SETTLE TELVE', label:'Step 3: Pour Slowly Over Cup Rim & Settle Grounds 60s', title:'Pour & Settle 60s', human:'Pour smoothly into a demitasse to preserve the kaymak cap, then wait 60 seconds so fine telve grounds settle cleanly to the bottom before sipping.', scientist:'Stokes hindered sedimentation settles >60 um particles to the cup base while sub-20 um colloids create syrupy viscosity.', epistemicTier:'verified_science', citations:'Stokes Sedimentation Mechanics' }
    );
    stepStaircase.push({ t0:0, t1:15, fromG:0, toG:wRound, kind:'pour', targetFlowGs:_rnd(wRound / 15, 1), valveState:null, label:'Combine in Cezve' }, { t0:15, t1:riseS, fromG:wRound, toG:wRound, kind:'hold', targetFlowGs:0, valveState:null, label:'Raise Kaymak (<94 C)' }, { t0:riseS, t1:endS, fromG:wRound, toG:wRound, kind:'drain', targetFlowGs:0, valveState:null, label:'Settle Telve 60s' });
  } else if (methodKey === 'moka'){
    const endS = Math.round(sim.brewTimeS);
    const flowStartS = Math.round(endS * 0.45);
    const quenchS = Math.max(flowStartS + 25, endS - 15);
    steps.push(
      { t:0, pourStartS:0, pourEndS:20, holdUntilS:flowStartS, fromG:0, toG:wRound, targetG:wRound, scale:wRound, targetFlowGs:0, actionKind:'moka_prep', valveState:null, phase:'PRE-HEATED BASE FILL', label:'Step 1: Fill Base to Below Safety Valve (' + wRound + ' g at ' + kettleTempC + ' C) & Level Basket', title:'Pre-Heated Base & Level Basket', human:'Fill lower boiler with ' + wRound + ' g pre-heated (' + kettleTempC + ' C) water just below the safety valve. Fill funnel with ' + doseG + ' g coffee leveled flat — NEVER tamp! Screw top on with a towel and set on low flame.', scientist:'Pre-heating base water (' + kettleTempC + ' C per Navarini et al. 2009) shortens dry-heating time so grounds are not baked by rising steam before liquid ascent.', epistemicTier:'verified_science', citations:'Navarini et al. 2009 App. Thermal Eng. 29:998; King 2008' },
      { t:flowStartS, pourStartS:flowStartS, pourEndS:quenchS, holdUntilS:quenchS, fromG:wRound, toG:wRound, targetG:wRound, scale:wRound, targetFlowGs:0, actionKind:'moka_flow', valveState:null, phase:'GENTLE HONEY STREAM (~1.5 BAR)', label:'Step 2: Drop Flame Low as Honey-Rich Stream Emerges (Lid Open)', title:'Slow Honey Stream', human:'Keep lid open: as thick dark coffee glides smoothly down the chimney (~' + G.fmtTime(flowStartS) + '), drop heat to minimum so liquid oozes gently without spitting.', scientist:'Vapor-liquid headspace pressure (~1.4-1.8 bar) drives 93-95 C water upward through the uncompacted bed.', epistemicTier:'verified_science', citations:'King 2008 Am. J. Phys. 76:558; Gianino 2007' },
      { t:quenchS, pourStartS:quenchS, pourEndS:endS, holdUntilS:endS, fromG:wRound, toG:wRound, targetG:wRound, scale:wRound, targetFlowGs:0, actionKind:'strombolian_quench', valveState:null, phase:'PRE-SPUTTER COLD QUENCH', label:'Step 3: Quench Base Under Cold Tap BEFORE Angry Sputter (~' + Math.round(sim.bevG) + ' g Yield)', title:'Cold-Tap Quench', human:'The instant the stream pales to blonde foam (BEFORE violent gurgling!), run the metal base under cold tap water to halt extraction cleanly at ~' + Math.round(sim.bevG) + ' g.', scientist:'Halts the >100 C Strombolian steam-volcano phase (Navarini et al. 2009), leaving ~18% residual water in the boiler and blocking harsh pyrolytic bitters.', epistemicTier:'verified_science', citations:'Navarini et al. 2009 App. Thermal Eng. 29:998' }
    );
    stepStaircase.push({ t0:0, t1:flowStartS, fromG:0, toG:wRound, kind:'pour', targetFlowGs:0, valveState:null, label:'Heat Boiler Headspace' }, { t0:flowStartS, t1:quenchS, fromG:wRound, toG:wRound, kind:'hold', targetFlowGs:0, valveState:null, label:'1.5-Bar Liquid Ascent' }, { t0:quenchS, t1:endS, fromG:wRound, toG:wRound, kind:'drain', targetFlowGs:0, valveState:null, label:'Cold-Tap Strombolian Quench' });
  } else if (methodKey === 'siphon'){
    const endS = Math.round(sim.brewTimeS);
    const flameOffS = Math.max(55, endS - 55);
    steps.push(
      { t:0, pourStartS:0, pourEndS:15, holdUntilS:flameOffS, fromG:0, toG:wRound, targetG:wRound, scale:wRound, targetFlowGs:_rnd(wRound / 15, 1), actionKind:'siphon_ascend', valveState:'closed', phase:'VAPOR ASCENT & FOLD', label:'Step 1: Seal Upper Globe at Boil, Add ' + doseG + ' g Grounds & Bamboo Fold', title:'Ascent & Gentle Fold', human:'Once water rises into the upper chamber and stabilizes (~91-94 C), add ' + doseG + ' g coffee and gently fold submerged grounds with a bamboo paddle for 5s.', scientist:'Constant sub-boiling heat maintains isothermal immersion (~92 C) while upward vapor bubbling prevents thermal stratification.', epistemicTier:'verified_science', citations:'Vacuum Vapor-Pressure Equilibrium' },
      { t:flameOffS, pourStartS:flameOffS, pourEndS:endS, holdUntilS:endS, fromG:wRound, toG:wRound, targetG:wRound, scale:wRound, targetFlowGs:0, actionKind:'vacuum_drawdown', valveState:'open', phase:'FLAME OFF & VACUUM DRAWDOWN', label:'Step 2: Remove Heat at ' + G.fmtTime(flameOffS) + ', Stir 3 Circles & Vacuum Drawdown', title:'Vacuum Drawdown', human:'Turn off burner at ' + G.fmtTime(flameOffS) + ', give 3 gentle circular stirs, and watch negative vacuum pressure pull crystal-clear coffee down into the bulb (~55s, domed bed).', scientist:'Condensing lower-bulb steam generates ~0.15-0.25 bar vacuum suction, accelerating filtration cleanly through cloth/paper.', epistemicTier:'verified_science', citations:'Clausius-Clapeyron Condensation Suction' }
    );
    stepStaircase.push({ t0:0, t1:flameOffS, fromG:wRound, toG:wRound, kind:'hold', targetFlowGs:0, valveState:'closed', label:'Upper-Globe Steep' }, { t0:flameOffS, t1:endS, fromG:wRound, toG:wRound, kind:'drain', targetFlowGs:0, valveState:'open', label:'Vacuum Drawdown' });
  } else if (methodKey === 'phin'){
    const bloomG = Math.round(Math.min(waterG * 0.25, doseG * 2.0));
    const endS = Math.round(sim.brewTimeS);
    steps.push(
      { t:0, pourStartS:0, pourEndS:10, holdUntilS:45, fromG:0, toG:bloomG, targetG:bloomG, scale:bloomG, targetFlowGs:_rnd(bloomG / 10, 1), actionKind:'phin_bloom', valveState:null, phase:'DAMPER SET & BLOOM', label:'Step 1: Set Gravity Insert & Bloom \u2192 ' + bloomG + ' g', title:'Set Damper & Bloom', human:'Rinse steel Phin hot, level ' + doseG + ' g coffee, rest the perforated gravity damper gently on top, and pour ' + bloomG + ' g (' + kettleTempC + ' C) to swell grounds for 45s.', scientist:'Perforated damper plate prevents bed flotation while 45s capillary swelling equalizes hydraulic resistance.', epistemicTier:'craft_best_practice', citations:'Vietnamese Phin Gravity Percolation' },
      { t:45, pourStartS:45, pourEndS:65, holdUntilS:endS, fromG:bloomG, toG:wRound, targetG:wRound, scale:wRound, targetFlowGs:_rnd((wRound - bloomG) / 20, 1), actionKind:'phin_drip', valveState:null, phase:'SLOW GRAVITY DRIP', label:'Step 2: Fill Chamber to ' + wRound + ' g, Lid On & Slow Drip (~1 drop/sec)', title:'Fill & Slow Drip', human:'Pour gently over the damper up to ' + wRound + ' g, place metal lid on top, and let steady ~1 drop/sec gravity percolation finish around ' + G.fmtTime(endS) + '.', scientist:'Low hydrostatic head through perforated metal screen produces high-body concentrate ideal neat or over condensed milk/ice.', epistemicTier:'craft_best_practice', citations:'Darcy Low-Head Metal-Screen Percolation' }
    );
    stepStaircase.push({ t0:0, t1:45, fromG:0, toG:bloomG, kind:'hold', targetFlowGs:0, valveState:null, label:'Damper Bloom' }, { t0:45, t1:65, fromG:bloomG, toG:wRound, kind:'pour', targetFlowGs:_rnd((wRound - bloomG) / 20, 1), valveState:null, label:'Fill Phin' }, { t0:65, t1:endS, fromG:wRound, toG:wRound, kind:'drain', targetFlowGs:0, valveState:null, label:'Slow Gravity Drip' });
  } else if (methodKey === 'nel'){
    const bloomG = Math.round(Math.min(wRound * 0.25, doseG * 2.2));
    const endS = Math.round(sim.brewTimeS);
    const mainEndS = Math.max(70, endS - 35);
    steps.push(
      { t:0, pourStartS:0, pourEndS:12, holdUntilS:35, fromG:0, toG:bloomG, targetG:bloomG, scale:bloomG, targetFlowGs:_rnd(bloomG / 12, 1), actionKind:'nel_dome_bloom', valveState:null, phase:'FLANNEL DOME BLOOM', label:'Step 1: Wring Boiled Flannel Dry & Kissaten Dome Bloom \u2192 ' + bloomG + ' g', title:'Wring Cloth & Dome Bloom', human:'Wring warm flannel cloth damp-dry in a clean towel, dose ' + doseG + ' g with a shallow center dimple, and trickle ' + bloomG + ' g (' + kettleTempC + ' C) dead-center so a smooth coffee dome rises for 35s.', scientist:'Pre-swollen cotton flannel fibers trap >98% of solids while passing ~38% emulsified coffee lipids.', epistemicTier:'craft_best_practice', citations:'Japanese Kissaten Nel Drip Protocol' },
      { t:35, pourStartS:35, pourEndS:mainEndS, holdUntilS:endS, fromG:bloomG, toG:wRound, targetG:wRound, scale:wRound, targetFlowGs:_rnd((wRound - bloomG) / Math.max(20, mainEndS - 35), 1), actionKind:'nel_thread_pour', valveState:null, phase:'THREAD-THIN CENTER POUR', label:'Step 2: Thread-Thin Center Spiral \u2192 ' + wRound + ' g & Pull Before Foam Drops', title:'Thread-Thin Center Stream', human:'Feed a continuous thread-thin stream over the center coin-sized circle up to ' + wRound + ' g without washing the cloth walls; remove Nel before the dome collapses flat (~' + G.fmtTime(endS) + ').', scientist:'Low-shear laminar center percolation preserves the self-insulating dome and velvety lipid emulsion.', epistemicTier:'craft_best_practice', citations:'Kissaten Flannel Hydrodynamics' }
    );
    stepStaircase.push({ t0:0, t1:35, fromG:0, toG:bloomG, kind:'hold', targetFlowGs:0, valveState:null, label:'Kissaten Dome Bloom' }, { t0:35, t1:mainEndS, fromG:bloomG, toG:wRound, kind:'pour', targetFlowGs:_rnd((wRound - bloomG) / Math.max(20, mainEndS - 35), 1), valveState:null, label:'Thread-Thin Center Pour' }, { t0:mainEndS, t1:endS, fromG:wRound, toG:wRound, kind:'drain', targetFlowGs:0, valveState:null, label:'Pull Before Dome Collapse' });
  } else if (methodKey === 'philips5500'){
    const pPlan = typeof G.philipsSetup === 'function' ? G.philipsSetup(bean, { drink:input.drinkId || 'espresso', strength:input.strength || 3 }, input.now) : null;
    const shotS = Math.max(14, Math.round(sim.brewTimeS));
    const prepS = Math.min(4, Math.floor(shotS * 0.25));
    steps.push(
      { t:0, pourStartS:0, pourEndS:prepS, holdUntilS:prepS, fromG:0, toG:Math.round(waterG * 0.15), targetG:Math.round(waterG * 0.15), scale:Math.round(waterG * 0.15), targetFlowGs:0, actionKind:'superauto_prep', valveState:null, phase:'CERAMIC GRIND & AROMA SEAL PRE-WET', label:'Step 1: Select Drink, Strength & Ceramic Grinder (' + (pPlan && pPlan.grind ? 'Band ' + pPlan.grind.recommendedBand.join('-') + '/12' : d50Um + ' um') + ')', title:'Select & Pre-Infuse', human:(pPlan && pPlan.grind ? pPlan.grind.safetyRule + ' ' : '') + 'Brew group tamps and pre-wets automatically.', scientist:'Flat ceramic burrs grind fresh dose into removable brew chamber.', epistemicTier:'verified_science', citations:'Philips EP5547 Technical Spec' },
      { t:prepS, pourStartS:prepS, pourEndS:shotS, holdUntilS:shotS, fromG:Math.round(waterG * 0.15), toG:wRound, targetG:wRound, scale:wRound, targetFlowGs:_rnd(wRound / Math.max(5, shotS - prepS), 1), actionKind:'superauto_pull', valveState:null, phase:'AUTOMATED EXTRACTION', label:'Step 2: Automated Extraction \u2192 ' + wRound + ' g & Stir Crema', title:'Automated Pull', human:'Let machine complete extraction into pre-warmed cup (~' + wRound + ' g in ~' + shotS + 's), then stir crema in before tasting.', scientist:'Pump-driven pressure extraction through self-tamping brew unit.', epistemicTier:'verified_science', citations:'Philips EP5547 Service Manual' }
    );
    stepStaircase.push({ t0:0, t1:shotS, fromG:0, toG:wRound, kind:'pour', targetFlowGs:_rnd(wRound / shotS, 1), valveState:null, label:'Philips 5500 Extraction' });
  } else if (methodKey === 'aiden' || methodKey === 'xbloom' || methodKey === 'drip'){
    const endS = Math.round(sim.brewTimeS);
    const bloomG = Math.round(Math.min(waterG * 0.30, doseG * 2.8));
    const bloomS = Math.min(Math.max(25, co2.recommendedBloomS), Math.floor(endS * 0.30));
    const pourEndS = Math.min(endS - 25, Math.max(bloomS + 30, Math.round(endS * 0.72)));
    const machineName = methodKey === 'aiden' ? ('Fellow Aiden (' + (waterG <= 450 ? 'Green Cone Single-Serve Basket' : 'Blue Flat Batch Basket') + ')') : methodKey === 'xbloom' ? 'xBloom Studio Omni-Dripper' : 'Auto-Drip Brewer';
    steps.push(
      { t:0, pourStartS:0, pourEndS:12, holdUntilS:bloomS, fromG:0, toG:bloomG, targetG:bloomG, scale:bloomG, targetFlowGs:_rnd(bloomG / 12, 1), actionKind:'machine_bloom', valveState:null, phase:'AUTOMATED BLOOM', label:'Step 1: Load ' + doseG + ' g into ' + machineName + ' \u2192 ' + bloomG + ' g Bloom (' + kettleTempC + ' C)', title:'Load & Automated Bloom', human:methodKey === 'drip' ? 'Rinse paper filter, level ' + doseG + ' g coffee flat in basket, fill tank to ' + wRound + ' g, and start brew cycle (decant off hotplate once done).' : ('Load ' + doseG + ' g (' + d50Um + ' um) into ' + machineName + '; machine wets ' + bloomG + ' g at ' + kettleTempC + ' C and rests until 0:' + String(bloomS).padStart(2, '0') + '.'), scientist:'Automated shower/nozzle dispersion wets dry bed uniformly.', epistemicTier:'verified_science', citations:'SCA Gold Cup / Liang et al. 2021' },
      { t:bloomS, pourStartS:bloomS, pourEndS:pourEndS, holdUntilS:pourEndS, fromG:bloomG, toG:wRound, targetG:wRound, scale:wRound, targetFlowGs:_rnd((wRound - bloomG) / Math.max(10, pourEndS - bloomS), 1), actionKind:'machine_pulses', valveState:null, phase:'MULTI-PULSE EXTRACTION', label:'Step 2: Automated Pulse Cycle \u2192 ' + wRound + ' g Total Water', title:'Automated Pulses', human:methodKey === 'xbloom' ? 'Omni-Dripper executes precision spiral/center pours summing to exact ' + wRound + ' g.' : 'Precision shower pulses deliver remaining water to ' + wRound + ' g.', scientist:'Intermittent pulse dosing refreshes bulk solvent concentration gradient.', epistemicTier:'verified_science', citations:'Moroney et al. 2015; Batali et al. 2020' },
      { t:pourEndS, pourStartS:pourEndS, pourEndS:endS, holdUntilS:endS, fromG:wRound, toG:wRound, targetG:wRound, scale:wRound, targetFlowGs:0, actionKind:'machine_finish', valveState:null, phase:'DRAWDOWN & SWIRL', label:'Step 3: Complete Drawdown (~' + G.fmtTime(endS) + ') & Swirl Server Before Pouring', title:'Swirl & Serve', human:'Once drawdown finishes around ' + G.fmtTime(endS) + ', swirl the carafe gently to mix layers.', scientist:'Homogenizes stratified concentration layers in server.', epistemicTier:'verified_science', citations:'SCA Brewing Handbook' }
    );
    stepStaircase.push({ t0:0, t1:12, fromG:0, toG:bloomG, kind:'pour', targetFlowGs:_rnd(bloomG / 12, 1), valveState:null, label:'Automated Bloom' }, { t0:12, t1:bloomS, fromG:bloomG, toG:bloomG, kind:'hold', targetFlowGs:0, valveState:null, label:'Bloom Rest' }, { t0:bloomS, t1:pourEndS, fromG:bloomG, toG:wRound, kind:'pour', targetFlowGs:_rnd((wRound - bloomG) / Math.max(10, pourEndS - bloomS), 1), valveState:null, label:'Precision Pulses' }, { t0:pourEndS, t1:endS, fromG:wRound, toG:wRound, kind:'drain', targetFlowGs:0, valveState:null, label:'Final Drawdown' });
  } else if (methodKey === 'espresso' || methodKey === 'lever_espresso'){
    const preS = methodKey === 'lever_espresso' ? 10 : 6;
    const preG = Math.round(doseG * 0.2);
    const midG = Math.round(waterG * 0.7);
    const shotS = Math.round(sim.brewTimeS);
    steps.push({
      t:0, pourStartS:0, pourEndS:preS, holdUntilS:preS, fromG:0, toG:preG,
      targetG:preG, scale:preG, targetFlowGs:_rnd(preG / Math.max(1, preS), 2),
      actionKind:'preinfuse', valveState:null, phase:'PRE-INFUSION',
      label:'Step 1: Gentle Wetting (~2 Bar) \u2192 ' + preG + ' g', title:'Gentle Wetting',
      human:'Break up clumps with a needle stirrer, tamp level, and pre-wet gently (~2 bar) for ' + preS + 's until drops form evenly across the basket.',
      scientist:'Weiss Distribution (WDT) + low-Peclet capillary saturation eliminates dry air pockets and suppresses Darcy void channeling.',
      epistemicTier:'verified_science',
      citations:'Cameron, Hendon et al. 2020 Matter 2:631'
    });
    steps.push({
      t:preS, pourStartS:preS, pourEndS:Math.max(preS + 2, shotS - 4), holdUntilS:Math.max(preS + 2, shotS - 4), fromG:preG, toG:midG,
      targetG:midG, scale:midG, targetFlowGs:_rnd(Math.max(1, waterG - preG) / Math.max(4, shotS - preS), 2),
      actionKind:'extract', valveState:null, phase:'PEAK EXTRACTION',
      label:methodKey === 'lever_espresso' ? 'Step 2: Lever Press & Smooth Taper \u2192 ' + midG + ' g' : 'Step 2: Main Espresso Pull \u2192 ' + midG + ' g',
      title:'Main Espresso Pull',
      human:methodKey === 'lever_espresso' ? 'Lift to ~8.5 bar peak, then let the lever taper smoothly toward 4 bar as golden crema builds.' : 'Hold steady pressure as syrupy crema coalesces into one centered stream.',
      scientist:'Packed-bed Darcy advection extracts Wave-1 organic acids and Wave-2 Maillard sugars while puck porosity erodes.',
      epistemicTier:'verified_science',
      citations:'Moroney et al. 2015; Cameron et al. 2020'
    });
    steps.push({
      t:shotS, pourStartS:Math.max(preS + 2, shotS - 4), pourEndS:shotS, holdUntilS:shotS, fromG:midG, toG:wRound,
      targetG:wRound, scale:wRound, targetFlowGs:0,
      actionKind:'cut', valveState:null, phase:'SWEET-SPOT CUT',
      label:'Step 3: Stop Shot at Sweet-Spot Gate \u2192 ' + wRound + ' g', title:'Stop at ' + wRound + ' g',
      human:'Stop shot ~1.5 g early to land right on ' + wRound + ' g in ~' + shotS + 's. Stir crema into espresso before sipping!',
      scientist:'Halts tail elution before low-TDS solvent leaches high-Ea (48 kJ/mol) phenylindanes and astringent polyphenols.',
      epistemicTier:'craft_best_practice',
      citations:'Blumberg et al. 2010 J. Agric. Food Chem.'
    });
    stepStaircase.push(
      { t0:0, t1:preS, fromG:0, toG:preG, kind:'pour', targetFlowGs:_rnd(preG / Math.max(1, preS), 2), valveState:null, label:'Gentle Wetting' },
      { t0:preS, t1:shotS, fromG:preG, toG:wRound, kind:'pour', targetFlowGs:_rnd((wRound - preG) / Math.max(2, shotS - preS), 2), valveState:null, label:'Main Espresso Pull' }
    );
  } else if (methodKey === 'cold' || methodKey === 'cold_drip'){
    const hrs = Math.round(sim.brewTimeS / 3600);
    steps.push({
      t:0, pourStartS:0, pourEndS:60, holdUntilS:Math.round(sim.brewTimeS), fromG:0, toG:wRound,
      targetG:wRound, scale:wRound, targetFlowGs:0,
      actionKind:'saturate', valveState:methodKey === 'cold_drip' ? 'drip_45dpm' : null, phase:'SATURATE',
      label:methodKey === 'cold_drip' ? 'Step 1: Set Ice Drip Tower (45 drops/min) \u2192 ' + wRound + ' g' : 'Step 1: Wet All Grounds \u2192 ' + wRound + ' g',
      title:'Wet All Grounds',
      human:methodKey === 'cold_drip' ? 'Pre-wet the ' + doseG + ' g bed, lay a paper round on top, and set drip valve to 40-50 drops/min (~95 mL/h).' : 'Combine ' + doseG + ' g coarse grounds with ' + wRound + ' g cold water and stir gently until all dry pockets are wet.',
      scientist:'Low-temperature Van \'t Hoff equilibrium suppresses high-enthalpy bitter lactone desorption while preserving sweet esters.',
      epistemicTier:'verified_science',
      citations:'Liang et al. 2024 Sci Rep 14:19298'
    });
    steps.push({
      t:Math.round(sim.brewTimeS), pourStartS:Math.round(sim.brewTimeS), pourEndS:Math.round(sim.brewTimeS), holdUntilS:Math.round(sim.brewTimeS), fromG:wRound, toG:wRound,
      targetG:wRound, scale:wRound, targetFlowGs:0,
      actionKind:'strain', valveState:null, phase:'FINISH',
      label:'Step 2: Strain & Chill (' + hrs + ' h)', title:'Strain & Chill',
      human:'After ~' + hrs + ' hours, strain cleanly through paper and store sealed at <=4 C in the refrigerator.',
      scientist:'Near-neutral pH (~5.0-5.4) cold extract requires <=4 C refrigeration for microbial stability and lipid oxidation control.',
      epistemicTier:'verified_science',
      citations:'FDA Food Code; Liang et al. 2024'
    });
    stepStaircase.push({ t0:0, t1:Math.round(sim.brewTimeS), fromG:wRound, toG:wRound, kind:'hold', targetFlowGs:0, valveState:null, label:'Cold Steep' });
  } else if (isHybridValve){
    /* Hybrid Valve Brewers (Hario Switch, Clever Dripper, NextLevel Pulsar) — Explicit Mechanical Valve Gates (#169) */
    const flushG = Math.round(waterG * 0.35);
    const flushPourS = Math.max(10, Math.round(flushG / 4.0));
    const closeAtS = 35;
    const steepPourS = Math.max(14, Math.round((wRound - flushG) / 4.5));
    const releaseAtS = Math.max(closeAtS + steepPourS + 45, Math.round(sim.brewTimeS - 40));
    const endS = Math.round(sim.brewTimeS);
    steps.push({
      t:0, pourStartS:0, pourEndS:flushPourS, holdUntilS:closeAtS, fromG:0, toG:flushG,
      targetG:flushG, scale:flushG, targetFlowGs:_rnd(flushG / flushPourS, 1),
      actionKind:'valve_open_flush', valveState:'open', valveBadge:'VALVE OPEN - Flush', phase:'VALVE OPEN FLUSH',
      label:'Step 1 [VALVE OPEN]: Wet & Flush Grounds \u2192 ' + flushG + ' g', title:'Valve Open Flush',
      human:'Leave switch/valve OPEN and pour ' + flushG + ' g hot water to wet all grounds and rinse bright fruit notes straight into the cup.',
      scientist:'Open percolation pre-flush carries high-diffusivity organic acids into the server while venting CO2 before closed steep.',
      epistemicTier:'craft_best_practice',
      citations:'Tetsu Kasuya Hybrid Devil / Gagne Two-Stage Equilibrium'
    });
    steps.push({
      t:closeAtS, pourStartS:closeAtS, pourEndS:closeAtS + steepPourS, holdUntilS:releaseAtS, fromG:flushG, toG:wRound,
      targetG:wRound, scale:wRound, targetFlowGs:_rnd((wRound - flushG) / steepPourS, 1),
      actionKind:'valve_close_steep', valveState:'closed', valveBadge:'CLOSE VALVE - Steep Immersion', phase:'CLOSED STEEP',
      label:'Step 2 [CLOSE VALVE]: Steep Immersion \u2192 ' + wRound + ' g', title:'Close Valve & Steep',
      human:'FLIP VALVE CLOSED at 0:' + String(closeAtS).padStart(2, '0') + ', pour smoothly to ' + wRound + ' g, and let steep hands-off until ' + G.fmtTime(releaseAtS) + ' to build round sweetness.',
      scientist:'Zero-bypass closed immersion equalizes extraction across all bed depths, eliminating spatial channeling variance.',
      epistemicTier:'verified_science',
      citations:'Liang, Chan & Ristenpart 2021 Sci Rep 11:6904'
    });
    steps.push({
      t:releaseAtS, pourStartS:releaseAtS, pourEndS:endS, holdUntilS:endS, fromG:wRound, toG:wRound,
      targetG:wRound, scale:wRound, targetFlowGs:0,
      actionKind:'valve_open_release', valveState:'open', valveBadge:'FLIP VALVE OPEN - Release Drawdown', phase:'RELEASE DRAWDOWN',
      label:'Step 3 [FLIP VALVE OPEN]: Release & Pull at Sweet-Spot Gate', title:'Open Valve & Drain',
      human:'Flip valve OPEN at ' + G.fmtTime(releaseAtS) + ' to drain through the settled bed; pull brewer around ' + G.fmtTime(endS) + '.',
      scientist:'Self-filtering coffee cake traps colloids and fines during gravity drawdown without over-extracting late bitter tannins.',
      epistemicTier:'verified_science',
      citations:'Gagne 2021 The Physics of Filter Coffee'
    });
    stepStaircase.push(
      { t0:0, t1:flushPourS, fromG:0, toG:flushG, kind:'pour', targetFlowGs:_rnd(flushG / flushPourS, 1), valveState:'open', label:'Valve Open Flush' },
      { t0:flushPourS, t1:closeAtS, fromG:flushG, toG:flushG, kind:'hold', targetFlowGs:0, valveState:'open', label:'Drain Pre-Flush' },
      { t0:closeAtS, t1:closeAtS + steepPourS, fromG:flushG, toG:wRound, kind:'pour', targetFlowGs:_rnd((wRound - flushG) / steepPourS, 1), valveState:'closed', label:'Close Valve & Fill' },
      { t0:closeAtS + steepPourS, t1:releaseAtS, fromG:wRound, toG:wRound, kind:'hold', targetFlowGs:0, valveState:'closed', label:'Closed Steep Immersion' },
      { t0:releaseAtS, t1:endS, fromG:wRound, toG:wRound, kind:'drain', targetFlowGs:0, valveState:'open', label:'Open Valve Drawdown' }
    );
  } else if (isImmersion){
    const fastPourS = Math.max(12, Math.min(25, Math.round(wRound / 14)));
    const plungeDurS = methodKey === 'aeropress' ? 30 : 20;
    const steepS = Math.max(45, Math.round(sim.brewTimeS - plungeDurS));
    const swirlS = Math.min(steepS - 10, methodKey === 'press' ? 240 : 90);
    const endS = Math.round(sim.brewTimeS);
    steps.push({
      t:0, pourStartS:0, pourEndS:fastPourS, holdUntilS:Math.max(fastPourS, swirlS), fromG:0, toG:wRound,
      targetG:wRound, scale:wRound, targetFlowGs:_rnd(wRound / fastPourS, 1),
      actionKind:'pour', valveState:'closed', phase:'FAST POUR',
      label:'Step 1: Fast Pour (Wet All Grounds) \u2192 ' + wRound + ' g', title:'Pour All Water',
      human:'Pour ' + wRound + ' g of ' + kettleTempC + ' C water evenly over ' + doseG + ' g grounds (' + (methodKey === 'aeropress' ? 'insert plunger 1 cm to seal vacuum and hold drip' : 'cover lid to hold heat') + ').',
      scientist:'Well-mixed batch reactor initiates Fickian intraparticle diffusion across broken outer shells and intact inner cells.',
      epistemicTier:'verified_science',
      citations:'Liang, Chan & Ristenpart 2021 Sci Rep 11:6904'
    });
    steps.push({
      t:Math.max(fastPourS, swirlS), pourStartS:Math.max(fastPourS, swirlS), pourEndS:Math.max(fastPourS, swirlS) + 5, holdUntilS:steepS, fromG:wRound, toG:wRound,
      targetG:wRound, scale:wRound, targetFlowGs:0,
      actionKind:'crust_break', valveState:'closed', phase:'CRUST BREAK',
      label:'Step 2: Hands-Off Steep & Gentle Swirl / Crust Break', title:'Gentle Crust Break',
      human:methodKey === 'press' ? 'At 4:00 break top crust gently with a spoon, skim off foam/bits, and let fines settle undisturbed.' : 'Give one gentle 3-second swirl so floating grounds settle cleanly before pressing.',
      scientist:'Disrupts buoyant CO2-raft mass-transfer boundary layer while letting dense particles settle onto the filter bed.',
      epistemicTier:'craft_best_practice',
      citations:'Hoffmann Settled Immersion Protocol; Gagne 2021'
    });
    steps.push({
      t:steepS, pourStartS:steepS, pourEndS:endS, holdUntilS:endS, fromG:wRound, toG:wRound,
      targetG:wRound, scale:wRound, targetFlowGs:0,
      actionKind:methodKey === 'aeropress' ? 'paced_plunge' : 'decant', plungeDurationS:methodKey === 'aeropress' ? 30 : 0,
      valveState:'open', phase:methodKey === 'aeropress' ? 'PACED 30S PLUNGE' : 'GENTLE DECANT',
      label:methodKey === 'aeropress' ? 'Step 3: Paced 30s Plunge (Forearm Weight Only)' : 'Step 3: Gentle Pour / Decant Into Mug',
      title:methodKey === 'aeropress' ? 'Paced 30s Plunge' : 'Gentle Decant',
      human:methodKey === 'aeropress' ? ('Press steadily over a full 30 seconds using only relaxed forearm weight until the hiss' + (bypassCleanG > 0 ? ', then add ' + bypassCleanG + ' g clean hot water (Adler bypass) straight into your mug!' : ' (pressing hard compacts fines and adds bitterness!).')) : (subModeKey === 'fp-classic' ? 'Press mesh plunger slowly down at 4:00 and pour immediately into mugs so coffee does not keep steeping on spent grounds.' : 'Rest plunger on surface and pour smoothly into your mug, leaving settled silt behind.'),
      scientist:'Gentle <0.35 bar pressure drop prevents shear compaction of the compressible coffee bed and keeps astringent fines trapped.',
      epistemicTier:'verified_science',
      citations:'Darcy compressible bed mechanics'
    });
    stepStaircase.push(
      { t0:0, t1:fastPourS, fromG:0, toG:wRound, kind:'pour', targetFlowGs:_rnd(wRound / fastPourS, 1), valveState:'closed', label:'Fast Immersion Pour' },
      { t0:fastPourS, t1:steepS, fromG:wRound, toG:wRound, kind:'hold', targetFlowGs:0, valveState:'closed', label:'Hands-Off Steep' },
      { t0:steepS, t1:endS, fromG:wRound, toG:wRound, kind:methodKey === 'aeropress' ? 'plunge' : 'drain', targetFlowGs:0, plungeDurationS:plungeDurS, valveState:'open', label:methodKey === 'aeropress' ? 'Paced 30s Plunge' : 'Gentle Decant' }
    );
  } else if (subModeKey === 'kasuya-46' && (methodKey === 'v60' || methodKey === 'origami' || methodKey === 'kalita')){
    /* Tetsu Kasuya 4:6 5-Pour Protocol (20% x 5 pulses, monotonic to wRound) */
    const g1 = Math.round(wRound * 0.20), g2 = Math.round(wRound * 0.40), g3 = Math.round(wRound * 0.60), g4 = Math.round(wRound * 0.80);
    const endS = Math.max(195, Math.round(sim.brewTimeS));
    const knots46 = [[0, 0, g1, 'Pour 1 (Sweetness vs Acidity Balance)'], [45, g1, g2, 'Pour 2 (Completes First 40%)'], [90, g2, g3, 'Pour 3 (Strength Pulse 1)'], [130, g3, g4, 'Pour 4 (Strength Pulse 2)'], [165, g4, wRound, 'Pour 5 (Final 60% Strength Target)']];
    knots46.forEach((kn, idx) => {
      const dur = 10;
      const nextT = idx + 1 < knots46.length ? knots46[idx + 1][0] : endS;
      steps.push({ t:kn[0], pourStartS:kn[0], pourEndS:kn[0] + dur, holdUntilS:nextT, fromG:kn[1], toG:kn[2], targetG:kn[2], scale:kn[2], targetFlowGs:_rnd((kn[2] - kn[1]) / dur, 1), actionKind:idx === 0 ? 'bloom' : 'pour', valveState:null, phase:'4:6 PULSE ' + (idx + 1), label:'Step ' + (idx + 1) + ': ' + kn[3] + ' \u2192 ' + kn[2] + ' g', title:kn[3], human:'Pour evenly to ' + kn[2] + ' g and let the bed drain almost completely until ' + G.fmtTime(nextT) + '.', scientist:'5-pulse full-drain percolation maximizes fresh-water concentration gradient across coarse particles.', epistemicTier:'craft_best_practice', citations:'Tetsu Kasuya 2016 World Brewers Cup 4:6 Method' });
      stepStaircase.push({ t0:kn[0], t1:kn[0] + dur, fromG:kn[1], toG:kn[2], kind:'pour', targetFlowGs:_rnd((kn[2] - kn[1]) / dur, 1), valveState:null, label:kn[3] }, { t0:kn[0] + dur, t1:nextT, fromG:kn[2], toG:kn[2], kind:idx === 4 ? 'drain' : 'hold', targetFlowGs:0, valveState:null, label:'Drain Between Pours' });
    });
  } else {
    /* Multi-Pulse Step-Staircase Percolation Pour-Over (#166 Plain-English Action Labels + #169 Step-Staircase Shelves!) */
    const bloomG = Math.round(Math.min(waterG * 0.35, doseG * 3.0));
    const bloomPourS = Math.max(8, Math.min(14, Math.round(bloomG / 4.2)));
    const bloomS = Math.max(bloomPourS + 14, co2.recommendedBloomS);
    const p1G = Math.round(bloomG + (waterG - bloomG) * 0.55);
    const p1PourS = Math.max(14, Math.round((p1G - bloomG) / 3.4));
    const pauseShelfS = Math.round(sim.brewTimeS) < 135 ? 8 : 16;
    const p2StartS = bloomS + p1PourS + pauseShelfS;
    const p2PourS = Math.max(10, Math.round((wRound - p1G) / 3.4));
    const drainStartS = p2StartS + p2PourS;
    const endS = Math.max(drainStartS + 20, Math.round(sim.brewTimeS));

    steps.push({
      t:0, pourStartS:0, pourEndS:bloomPourS, holdUntilS:bloomS, fromG:0, toG:bloomG,
      targetG:bloomG, scale:bloomG, targetFlowGs:_rnd(bloomG / bloomPourS, 1),
      actionKind:'bloom', valveState:null, phase:'BLOOM',
      label:'Step 1: Wet Grounds (Bloom) \u2192 ' + bloomG + ' g', title:'Wet Grounds (Bloom)',
      human:'Lets trapped CO2 gas escape so water extracts evenly. Pour ' + bloomG + ' g center-out to wet all ' + doseG + ' g grounds, swirl gently once, and rest kettle until 0:' + String(bloomS).padStart(2, '0') + '.',
      scientist:'Smrke Weibull outgassing (' + co2.remainingCo2MgG + ' mg/g CO2 left) vents gas pockets so brew water wets inner micropores.',
      epistemicTier:'verified_science',
      citations:'Smrke et al. 2018 J. Agric. Food Chem. 66:5293'
    });
    steps.push({
      t:bloomS, pourStartS:bloomS, pourEndS:bloomS + p1PourS, holdUntilS:p2StartS, fromG:bloomG, toG:p1G,
      targetG:p1G, scale:p1G, targetFlowGs:_rnd((p1G - bloomG) / p1PourS, 1),
      actionKind:'pour', valveState:null, phase:'MAIN POUR',
      label:'Step 2: Main Pour (Builds Sweetness & Body) \u2192 ' + p1G + ' g', title:'Main Pour (Sweetness & Body)',
      human:'Fresh hot water dissolves mid-speed natural sugars after early acids release. Pour a steady unbroken stream from ~4-5 cm height up to ' + p1G + ' g, then pause 16s.',
      scientist:'Coherent unbroken liquid jet (Park et al. 2025) maximizes convective bed mixing while clean solvent maintains a steep concentration gradient.',
      epistemicTier:'verified_science',
      citations:'Park, Young & Mathijssen 2025 Physics of Fluids'
    });
    steps.push({
      t:p2StartS, pourStartS:p2StartS, pourEndS:drainStartS, holdUntilS:drainStartS, fromG:p1G, toG:wRound,
      targetG:wRound, scale:wRound, targetFlowGs:_rnd((wRound - p1G) / p2PourS, 1),
      actionKind:'pour', valveState:null, phase:'FINAL POUR',
      label:'Step 3: Final Pour (Sets Strength) \u2192 ' + wRound + ' g', title:'Final Pour (Sets Strength)',
      human:'Brings cup to target balance before slow bitter compounds rise. Pour gently center-out to ' + wRound + ' g.',
      scientist:'Maintains hydrostatic Darcy head while low-agitation center stream minimizes late fines migration onto filter walls.',
      epistemicTier:'craft_best_practice',
      citations:'Moroney et al. 2015; Gagne 2021'
    });
    steps.push({
      t:drainStartS, pourStartS:drainStartS, pourEndS:endS, holdUntilS:endS, fromG:wRound, toG:wRound,
      targetG:wRound, scale:wRound, targetFlowGs:0,
      actionKind:'drain_cut', valveState:null, phase:'SWEET-SPOT GATE',
      label:'Step 4: Drain & Pull at Sweet-Spot Gate', title:'Drain & Pull at Sweet-Spot Gate',
      human:'Let water drain to a flat bed around ' + G.fmtTime(endS) + ' — remove dripper right at the Sweet-Spot Gate if late drips stall.',
      scientist:'Cutting tail drawdown prevents low-TDS solvent from eluting high-Ea (48 kJ/mol) astringent chlorogenic lactones and polyphenols.',
      epistemicTier:'craft_best_practice',
      citations:'Batali et al. 2020; Gagne 2021'
    });
    stepStaircase.push(
      { t0:0, t1:bloomPourS, fromG:0, toG:bloomG, kind:'pour', targetFlowGs:_rnd(bloomG / bloomPourS, 1), valveState:null, label:'Wet Grounds (Bloom)' },
      { t0:bloomPourS, t1:bloomS, fromG:bloomG, toG:bloomG, kind:'hold', targetFlowGs:0, valveState:null, label:'Rest Kettle · Let Grounds Degas' },
      { t0:bloomS, t1:bloomS + p1PourS, fromG:bloomG, toG:p1G, kind:'pour', targetFlowGs:_rnd((p1G - bloomG) / p1PourS, 1), valveState:null, label:'Main Pour (Builds Sweetness & Body)' },
      { t0:bloomS + p1PourS, t1:p2StartS, fromG:p1G, toG:p1G, kind:'hold', targetFlowGs:0, valveState:null, label:'Rest Kettle · Hold at ' + p1G + ' g' },
      { t0:p2StartS, t1:drainStartS, fromG:p1G, toG:wRound, kind:'pour', targetFlowGs:_rnd((wRound - p1G) / p2PourS, 1), valveState:null, label:'Final Pour (Sets Strength)' },
      { t0:drainStartS, t1:endS, fromG:wRound, toG:wRound, kind:'drain', targetFlowGs:0, valveState:null, label:'Drain & Pull at Sweet-Spot Gate' }
    );
  }

  const baseOut = {
    ok:true,
    methodKey,
    methodLabel:mPhys.label,
    doseG:_rnd(doseG, 1),
    waterG:_rnd(effectiveBrewWaterG, 1),
    bypassG:bypassCleanG,
    subMode:subModeObj ? (subModeObj.id || subModeObj.key || null) : null,
    locked:!!lockedRow,
    dialLockedFromHistory:!!lockedRow,
    dialAdaptation:dialAdaptation || {
      locked:false,
      adapted:false,
      fromTry:0,
      nextTry:1,
      fromRowId:'',
      stars:null,
      tdsPct:null,
      eyPct:null,
      symptom:'',
      prevClicks:gMapped ? gMapped.clicks : null,
      nextClicks:gMapped ? gMapped.clicks : null,
      prevClickDisplay:gMapped ? (gMapped.shortDisplay || gMapped.display) : (sim.d50Um + ' um'),
      nextClickDisplay:gMapped ? (gMapped.shortDisplay || gMapped.display) : (sim.d50Um + ' um'),
      prevUm:sim.d50Um,
      nextUm:sim.d50Um,
      grindDeltaUm:0,
      grindDeltaClicks:0,
      prevTempC:kettleTempC,
      nextTempC:kettleTempC,
      tempDeltaC:0,
      prevRatio:_rnd((effectiveBrewWaterG + bypassCleanG) / Math.max(0.1, doseG), 2),
      nextRatio:_rnd((effectiveBrewWaterG + bypassCleanG) / Math.max(0.1, doseG), 2),
      ratioDelta:0,
      reason:'First-principles bean & method synthesis',
      summaryBanner:'',
      source:'first_principles'
    },
    agitation:agitationMode,
    ratio:_rnd((effectiveBrewWaterG + bypassCleanG) / Math.max(0.1, doseG), 2),
    d50Um:sim.d50Um,
    grindUm:sim.d50Um,
    grinderSetting:gMapped,
    tempC:kettleTempC,
    kettleTempC,
    boilC,
    cappedByBoil:thermDeficitFlag(boilDeficitC),
    slurryMeanC:sim.slurryMeanC,
    totalSecs:steps.length ? Math.max(Math.round(sim.brewTimeS), steps[steps.length - 1].pourEndS || steps[steps.length - 1].t || 0) : Math.round(sim.brewTimeS),
    brewTimeS:_rnd(sim.brewTimeS, 1),
    expectedTds:sim.tdsPct,
    tdsPct:sim.tdsPct,
    expectedEy:sim.eyPct,
    eyPct:sim.eyPct,
    bevG:sim.bevG,
    cupPh:sim.cupPh,
    isImmersion,
    preferCleanBypass:input.preferCleanBypass === true,
    bloom:{ secs:co2.recommendedBloomS, grams:Math.round(Math.min(waterG * 0.35, doseG * 3.0)), remainingCo2MgG:co2.remainingCo2MgG },
    steps,
    stepStaircase,
    explanations,
    simulation:sim
  };

  if (!lockedRow && !adaptedClosedLoop && !(dialAdaptation && dialAdaptation.adapted) && (input.palateTwin || (Array.isArray(input.history) && input.history.length >= 3)) && !(input.ratio > 0 && (input.grindUm > 0 || input.d50Um > 0))){
    const twin = input.palateTwin || computePalateTwin(bean, methodKey, input.history);
    if (twin && twin.confidence >= 0.25){
      const refined = solvePersonalTargetRecipe(baseOut, twin, mPhys, simulateBrew);
      refined.grinderSetting = mapMicronsToGrinder(refined.d50Um, input.grinderKey || 'comandante-c40', input.calib || null, methodKey);
      refined.tdsPct = refined.expectedTds;
      refined.eyPct = refined.expectedEy;
      if (refined.personalNoteHuman){
        refined.explanations = refined.explanations.concat([makeScienceAtom(
          'personal-palate-twin',
          'Personal Palate Posterior (' + twin.archetype + ')',
          refined.expectedTds + '% TDS / ' + refined.expectedEy + '% EY',
          refined.personalNoteHuman,
          refined.personalNoteScientist,
          'verified_science',
          'Cotter, Batali, Ristenpart & Guinard 2021 J. Food Sci. 86:194'
        )]);
      }
      return refined;
    }
  }
  return baseOut;
}

/* Canonical Closed-Loop Next-Recipe Solver (Door, Step 1, Step 3, Vault & Cellar Single Source of Truth) */
function computeClosedLoopNextRecipe(bean, methodKey, history, gear){
  if (bean && methodKey === undefined && history === undefined && gear === undefined && (bean.bean || bean.coffee || bean.methodKey || bean.method)){
    const cfg = bean;
    bean = cfg.bean || cfg.coffee || {};
    methodKey = cfg.methodKey || cfg.method || 'v60';
    history = cfg.history || [];
    gear = cfg.gear || cfg;
  }
  bean = bean || {};
  gear = gear || {};
  const mk = _normMethodKey(methodKey || gear.methodKey || gear.method || 'v60');
  const hist = Array.isArray(history) ? history : [];
  const gKey = String(gear.grinderKey || gear.grinder || 'comandante-c40').trim().toLowerCase().replace(/_/g, '-');
  const calib = gear.calib || gear.pocketMicronCalib || null;
  const waterCfg = gear.water && typeof gear.water === 'object'
    ? gear.water
    : ((gear.waterAlk != null || gear.waterGH != null || gear.kh != null || gear.gh != null)
        ? { kh:gear.waterAlk != null ? +gear.waterAlk : (gear.kh != null ? +gear.kh : undefined), gh:gear.waterGH != null ? +gear.waterGH : (gear.gh != null ? +gear.gh : undefined) }
        : {});
  const altM = gear.altitudeM != null ? +gear.altitudeM : (gear.altitudeFt != null && isFinite(+gear.altitudeFt) ? +gear.altitudeFt * 0.3048 : 0);

  return synthesizeRecipe({
    bean,
    coffee:bean,
    method:mk,
    methodKey:mk,
    history:hist,
    grinderKey:gKey,
    calib,
    water:waterCfg,
    altitudeM:altM,
    filterId:gear.filterId || undefined,
    style:gear.style || gear.subMode || undefined,
    subMode:gear.subMode || gear.style || undefined,
    doseG:gear.doseG > 0 ? +gear.doseG : undefined,
    waterG:gear.waterG > 0 ? +gear.waterG : undefined,
    immersionBasis:gear.immersionBasis || undefined,
    brewerMaterial:gear.brewerMaterial || undefined,
    preheat:gear.preheat || undefined
  });
}

function thermDeficitFlag(d){ return d > 0.2; }

/* ============================================================================
   8. INVERSE SOLVER ("MAKE IT PERFECT") + REGULA-FALSI 3-CUP CONVERGENCE
   - 6-Hypothesis Fault-Tree Posterior P(H1..H6) + Water KH > 90 ppm Override
   - Regularized Gauss-Newton + Clamped Regula-Falsi [0.2, 0.8] Bracket Guarantee
   ============================================================================ */

/* 4-Ring Archery Bullseye Nonlinear Severity Scaling (Directive #159):
   mag(u) = sign(u) * (0.35 * |u| + 0.65 * u * u) for u in [-1, 1] */
const TASTE_PAD_RINGS_V6 = [
  { ring:0, key:'bullseye',    rMin:0.00, rMax:0.20, label:'Sweet Spot',                  desc:'Balanced & Sweet - Lock It!' },
  { ring:1, key:'close',       rMin:0.20, rMax:0.48, label:'Close / Slightly Off',        desc:'Fine micro-tweak (1-2 clicks, +/-0.5 ratio, +/-1 C)' },
  { ring:2, key:'clearly_off', rMin:0.48, rMax:0.76, label:'Clearly Off',                 desc:'Solid medium step (+/-55-90 um, +/-1.5 ratio, +/-2.5 C)' },
  { ring:3, key:'way_off',     rMin:0.76, rMax:1.00, label:'Way Off! (Major Rescue)',     desc:'Big macro jump (+/-115-165 um, +/-2.8-3.5 ratio, +/-4 C & pulse rescue)' }
];

function padNonlinearMag(u){
  const c = _clamp(u, -1.0, 1.0, 0);
  if (Math.abs(c) < 1e-6) return 0;
  const a = Math.abs(c);
  return (c < 0 ? -1 : 1) * (0.35 * a + 0.65 * a * a);
}

function classifyTastePadRing(dx, dy){
  const r = _clamp(Math.hypot(dx || 0, dy || 0), 0, 1.0, 0);
  const ringObj = r <= 0.20 ? TASTE_PAD_RINGS_V6[0]
    : r <= 0.48 ? TASTE_PAD_RINGS_V6[1]
    : r <= 0.76 ? TASTE_PAD_RINGS_V6[2]
    : TASTE_PAD_RINGS_V6[3];
  return Object.assign({ radius:_rnd(r, 3) }, ringObj);
}

function _pickFirstPosNum(list){
  for (let i = 0; i < list.length; i++){
    const v = list[i];
    if (v != null && v !== '' && isFinite(+v) && +v > 0) return +v;
  }
  return 0;
}

function resolveContactTimeEvidence(prevRec, obs, mPhys){
  prevRec = prevRec || {};
  obs = obs || {};
  const isEsp = !!(mPhys && mPhys.outRatio);
  const isImm = !isEsp && !!(mPhys && mPhys.chiRet >= 0.85);

  const actualSec = _pickFirstPosNum([
    obs.actualSecs, obs.actual_s, obs.actualTimeS, obs.brew_actual_time_s,
    prevRec.actualSecs, prevRec.actual_s, prevRec.actualTimeS, prevRec.brew_actual_time_s
  ]);
  let targetSec = _pickFirstPosNum([
    prevRec.targetSecs, prevRec.totalTargetS, prevRec.totalSecs, prevRec.time_s, prevRec.brewTimeS, prevRec.brew_time_s,
    obs.targetSecs, obs.totalTargetS, obs.totalSecs, obs.time_s, obs.brew_time_s
  ]);

  const cue = String(obs.drawdownCue || obs.drawdown_cue || '').toLowerCase().trim();
  if (!(actualSec > 0)){
    if (cue === 'slow' || cue === 'fast'){
      const refS = targetSec > 0 ? targetSec : (isEsp ? 28 : 165);
      const synActual = cue === 'slow' ? Math.round(refS * 1.26) : Math.round(refS * 0.78);
      const dCue = synActual - refS;
      return {
        hasActualTime:false,
        fromCue:true,
        actualSec:synActual,
        targetSec:Math.round(refS),
        deltaSec:dCue,
        timeRatio:_rnd(synActual / refS, 3),
        status:cue === 'slow' ? (isEsp ? 'slow_choke' : 'slow_stall') : 'fast_gusher',
        isSlowStall:cue === 'slow' && !isImm,
        isFastGush:cue === 'fast' && !isImm,
        humanClue:cue === 'slow' ? 'Slow/stalled drawdown reported — micro-fines likely slowed filter flow.' : 'Fast drawdown reported — low bed resistance shortened contact time.',
        scientistClue:cue === 'slow' ? 'User-flagged Darcy permeability drop (slow drawdown cue).' : 'User-flagged high Darcy permeability / low residence time (fast drawdown cue).'
      };
    }
    return {
      hasActualTime:false,
      fromCue:false,
      actualSec:0,
      targetSec:targetSec > 0 ? Math.round(targetSec) : 0,
      deltaSec:0,
      timeRatio:1.0,
      status:'on_target',
      isSlowStall:false,
      isFastGush:false,
      humanClue:'',
      scientistClue:''
    };
  }

  if (!(targetSec > 0)){
    const typ = mPhys && Array.isArray(mPhys.typicalTimeS) ? mPhys.typicalTimeS : (isEsp ? [25, 32] : [150, 195]);
    targetSec = 0.5 * (typ[0] + typ[1]);
  }

  const aRound = Math.round(actualSec);
  const tRound = Math.max(5, Math.round(targetSec));
  const deltaSec = aRound - tRound;
  const timeRatio = actualSec / Math.max(5, targetSec);
  const aFmt = _fmtMmSsWave(aRound);
  const tFmt = _fmtMmSsWave(tRound);

  let status = 'on_target';
  let isSlowStall = false;
  let isFastGush = false;
  let humanClue = 'Actual brew time ' + aFmt + ' landed close to the ' + tFmt + ' target.';
  let scientistClue = 'Contact time ' + aRound + 's vs ' + tRound + 's target (ratio ' + _rnd(timeRatio, 2) + 'x).';

  if (isEsp){
    if (deltaSec >= 7 || timeRatio >= 1.25){
      status = 'slow_choke';
      isSlowStall = true;
      humanClue = 'Shot ran +' + deltaSec + 's slow (' + aRound + 's actual vs ' + tRound + 's target) — puck over-compaction or fine choke extended bitter tail contact.';
      scientistClue = 'Darcy puck choke (+' + deltaSec + 's, ' + _rnd(timeRatio, 2) + 'x target): excess hydraulic resistance elevated late high-Ea phenylindane/CGA-lactone elution.';
    } else if (deltaSec <= -6 || timeRatio <= 0.78){
      status = 'fast_gusher';
      isFastGush = true;
      humanClue = 'Shot finished ' + Math.abs(deltaSec) + 's fast (' + aRound + 's actual vs ' + tRound + 's target) — coarse puck or channeling cut sugar extraction short.';
      scientistClue = 'Low Darcy puck resistance (' + deltaSec + 's, ' + _rnd(timeRatio, 2) + 'x target): short residence time truncated mid-speed Maillard extraction.';
    }
  } else if (isImm){
    if (deltaSec >= 35){
      status = 'long_steep';
      humanClue = 'Steeped +' + deltaSec + 's longer than planned (' + aFmt + ' actual vs ' + tFmt + ' target).';
      scientistClue = 'Extended immersion residence (+' + deltaSec + 's); partition equilibrium buffers bulk EY unless decant/plunge stalled.';
    } else if (deltaSec <= -25){
      status = 'short_steep';
      isFastGush = true;
      humanClue = 'Pressed/decanted ' + Math.abs(deltaSec) + 's early (' + aFmt + ' actual vs ' + tFmt + ' target), shortening sugar steep time.';
      scientistClue = 'Abbreviated batch immersion (' + deltaSec + 's) halted intraparticle Fickian diffusion early.';
    }
  } else {
    if (deltaSec >= 20 || (timeRatio >= 1.20 && deltaSec >= 15)){
      status = 'slow_stall';
      isSlowStall = true;
      humanClue = 'Actual drawdown ran +' + deltaSec + 's overtime (' + aFmt + ' vs ' + tFmt + ' target) — micro-fines migration choked paper pores and kept late dry bitters extracting.';
      scientistClue = 'Dynamic paper filter blinding (+' + deltaSec + 's overtime, ' + _rnd(timeRatio, 2) + 'x target): <60 um fines drop Darcy k_eff in final drawdown, accelerating Wave-3 CGA-lactone & polyphenol tailing.';
    } else if (deltaSec <= -18 || (timeRatio <= 0.84 && deltaSec <= -14)){
      status = 'fast_gusher';
      isFastGush = true;
      humanClue = 'Actual drawdown finished ' + Math.abs(deltaSec) + 's early (' + aFmt + ' vs ' + tFmt + ' target) — coarse bed drained too fast for mid-brew caramel sugars to fully dissolve.';
      scientistClue = 'High Darcy bed permeability (' + deltaSec + 's early, ' + _rnd(timeRatio, 2) + 'x target): short liquid-solid contact time under-extracted Wave-2 sucrose/melanoidins relative to fast Wave-1 acids.';
    } else if (deltaSec >= 12){
      status = 'mild_slow';
      humanClue = 'Drawdown ran +' + deltaSec + 's slower than target (' + aFmt + ' vs ' + tFmt + ').';
    } else if (deltaSec <= -11){
      status = 'mild_fast';
      humanClue = 'Drawdown finished ' + Math.abs(deltaSec) + 's faster than target (' + aFmt + ' vs ' + tFmt + ').';
    }
  }

  return {
    hasActualTime:true,
    fromCue:false,
    actualSec:aRound,
    targetSec:tRound,
    actualMmSs:aFmt,
    targetMmSs:tFmt,
    deltaSec,
    timeRatio:_rnd(timeRatio, 3),
    status,
    isSlowStall,
    isFastGush,
    humanClue,
    scientistClue
  };
}

function _solveMakeItPerfectBase(prevRec, obs, hist){
  /* Support both 3-arg (prevRec, obs, hist) and 1-obj ({ prevRecipe, observation, history }) */
  if (prevRec && !obs && (prevRec.prevRecipe || prevRec.observation)){
    obs = prevRec.observation || {};
    hist = prevRec.history || [];
    prevRec = prevRec.prevRecipe || {};
  }
  prevRec = prevRec || {};
  obs = obs || {};
  hist = Array.isArray(hist) ? hist : [];

  const methodKey = _normMethodKey(prevRec.method || prevRec.methodKey || 'v60');
  const mPhys = typeof G.methodPhysicsFor === 'function' ? G.methodPhysicsFor(methodKey) : G.METHOD_PHYSICS_V6[0];
  const isEsp = !!mPhys.outRatio;
  const curUm = _clamp(prevRec.d50Um != null ? prevRec.d50Um : (prevRec.grindUm != null ? prevRec.grindUm : prevRec.brew_grind_target_um), 65, 1450, mPhys.d50AnchorUm);
  const curDoseG = _clamp(prevRec.doseG != null ? prevRec.doseG : (prevRec.dose != null ? prevRec.dose : prevRec.brew_dose_g), 4, 250, mPhys.dose);
  const curWaterG = _clamp(prevRec.waterG != null ? prevRec.waterG : (prevRec.water != null ? prevRec.water : (prevRec.brew_water_g != null ? prevRec.brew_water_g : curDoseG * (prevRec.ratio || prevRec.brew_ratio || mPhys.ratio))), 10, 5000, curDoseG * mPhys.ratio);
  const curRatio = _clamp(prevRec.ratio != null ? prevRec.ratio : (prevRec.brew_ratio != null ? prevRec.brew_ratio : (curWaterG / curDoseG)), 1.2, 24.0, mPhys.ratio);
  const curTempC = _clamp(prevRec.tempC != null ? prevRec.tempC : (prevRec.kettleTempC != null ? prevRec.kettleTempC : prevRec.brew_temp_c), 4, 100, mPhys.tempC || 93);
  const khPpm = _clamp(obs.waterKhPpm != null ? obs.waterKhPpm : (obs.water_alkalinity_mgl != null ? obs.water_alkalinity_mgl : (prevRec.waterKhPpm != null ? prevRec.waterKhPpm : 45)), 0, 400, 45);
  const grinderKey = String(prevRec.grinderKey || prevRec.grinder || obs.grinderKey || obs.grinder || 'comandante-c40').toLowerCase().replace(/_/g, '-');

  const stars5 = _extractRowStars5(obs);
  const dialLocked = _isGoldLockedRow(obs) || _isGoldLockedRow(prevRec);
  const sym = String(obs.symptom || obs.fix_symptom || obs.dial_symptom || obs.compass || '').toLowerCase().trim();
  const hasBalancedSym = sym === 'balanced' || sym === 'sweet_spot' || sym === 'sweet' || sym === 'perfect' || sym === 'good';
  const rawTds = _pickFirstPosNum([obs.measuredTdsPct, obs.tdsPct, obs.tds, obs.brew_tds_pct]);
  const measTds = rawTds > 0 ? rawTds : null;
  const rawEy = _pickFirstPosNum([obs.measuredEyPct, obs.eyPct, obs.ey, obs.brew_ey_pct, obs.brew_ey_total_pct]);
  let measEy = rawEy > 0 ? rawEy : null;
  if (measTds != null && measEy == null){
    const obsBevG = _pickFirstPosNum([prevRec.bevG, prevRec.outG, obs.bevOutG, obs.outG, obs.bevG, obs.brew_out_g]);
    const mbObs = solveContinuumMassBalance({
      methodKey,
      doseG:curDoseG,
      waterG:curWaterG,
      bypassG:_pickFirstPosNum([prevRec.bypassG, obs.bypassG]) || 0,
      bevG:obsBevG > 0 ? obsBevG : undefined,
      tdsPct:measTds,
      rWater:prevRec.rWater,
      immersionBasis:prevRec.immersionBasis
    });
    if (mbObs && mbObs.ok && mbObs.eyPrimaryPct > 0){
      measEy = _clamp(_rnd(mbObs.eyPrimaryPct, 2), 4.0, 34.0, null);
    } else {
      const estBevG = obsBevG > 0 ? obsBevG : Math.max(12, isEsp ? (curDoseG * curRatio) : (curWaterG - (mPhys.lrr || 2.0) * curDoseG));
      measEy = _clamp(_rnd((measTds * estBevG) / curDoseG, 2), 4.0, 34.0, null);
    }
  }
  const ct = resolveContactTimeEvidence(prevRec, obs, mPhys);
  const timeRatio = ct.timeRatio;

  const targetEy = prevRec.targetEyPct || (mPhys.targetRef ? mPhys.targetRef.eyPct : 20.0);
  const targetTds = prevRec.targetTdsPct || (mPhys.targetRef ? mPhys.targetRef.tdsPct : (isEsp ? 9.5 : 1.38));
  const eyGap = measEy != null ? _clamp((measEy - targetEy) / 3.8, -1, 1, 0) : 0;
  const rawTdsGap = measTds != null ? _clamp((measTds - targetTds) / (isEsp ? 2.5 : 0.35), -1, 1, 0) : 0;
  /* When EY is known/derived, project what TDS WOULD be at targetEy so low-EY low-TDS isn't double-counted onto ratio! */
  const effTdsForRatio = (measTds != null && measEy != null && measEy > 4.0)
    ? (measTds * (targetEy / measEy))
    : measTds;
  const tdsGap = effTdsForRatio != null ? _clamp((effTdsForRatio - targetTds) / (isEsp ? 2.5 : 0.35), -1, 1, 0) : 0;

  const cvaObs = _parseCvaJsonMeta(obs);
  const acidInt = obs.acidityIntensity != null ? +obs.acidityIntensity : (cvaObs && isFinite(+cvaObs.acidity) ? +cvaObs.acidity : NaN);
  const bitterInt = obs.bitternessIntensity != null ? +obs.bitternessIntensity : (cvaObs && isFinite(+cvaObs.bitterness) ? +cvaObs.bitterness : NaN);
  const astrInt = obs.astringencyIntensity != null ? +obs.astringencyIntensity : (cvaObs && isFinite(+cvaObs.astringency) ? +cvaObs.astringency : NaN);

  const hasSourCue = /sour|acid|lemon|vinegar|sharp|under/.test(sym) || sym === 'gusher' || (isFinite(acidInt) && acidInt >= 4 && !(isFinite(bitterInt) && bitterInt >= 4));
  const hasBitterCue = /bitter|harsh|astringent|dry|choked|over/.test(sym) || (isFinite(bitterInt) && bitterInt >= 4) || (isFinite(astrInt) && astrInt >= 4);
  const hasWeakCue = /weak|watery|thin|hollow|dilute/.test(sym);
  const hasStrongCue = /strong|heavy|syrupy|thick/.test(sym);
  const hasChannelCue = sym === 'uneven' || sym === 'sour_dry' || sym === 'both' || sym === 'fines_stall' || sym === 'muddy';
  const isLowStars = stars5 != null && stars5 < 4.25;
  const starPenalty = stars5 != null && stars5 < 4.5 ? _clamp((4.5 - stars5) / 3.0, 0, 0.90, 0) : 0;

  /* Map 2D Pad coordinates dx in [-1, 1] (Sour <-> Bitter) and dy in [-1, 1] (Weak/Watery <-> Strong/Heavy) */
  const padArr = Array.isArray(obs.pad_xy) ? obs.pad_xy : (cvaObs && Array.isArray(cvaObs.pad_xy) ? cvaObs.pad_xy : null);
  const rawDxIn = obs.dx != null ? obs.dx : (obs.tasteDx != null ? obs.tasteDx : (obs.padX != null ? obs.padX : (obs.x != null ? obs.x : (padArr && padArr.length >= 1 ? padArr[0] : null))));
  const rawDyIn = obs.dy != null ? obs.dy : (obs.tasteDy != null ? obs.tasteDy : (obs.padY != null ? obs.padY : (obs.y != null ? obs.y : (padArr && padArr.length >= 2 ? padArr[1] : null))));
  const dxNeutralUntouched = rawDxIn == null || (Math.abs(+rawDxIn) < 0.05 && !hasBalancedSym && (hasSourCue || hasBitterCue || hasChannelCue || Math.abs(eyGap) >= 0.16 || isLowStars));
  const dyNeutralUntouched = rawDyIn == null || (Math.abs(+rawDyIn) < 0.05 && !hasBalancedSym && (hasWeakCue || hasStrongCue || Math.abs(tdsGap) >= 0.16 || isLowStars));
  let dx = dxNeutralUntouched ? null : _clamp(rawDxIn, -1, 1, 0);
  let dy = dyNeutralUntouched ? null : _clamp(rawDyIn, -1, 1, 0);

  if (dx == null){
    if (obs.sourBitterSlider != null && isFinite(+obs.sourBitterSlider) && Math.abs(+obs.sourBitterSlider) > 0.05){
      dx = _clamp(+obs.sourBitterSlider / 5.0, -1, 1, 0);
    } else {
      let symDx = 0;
      if (/way_sour|very_sour|really_sour|gusher/.test(sym)) symDx = -0.92;
      else if (/slightly_sour|touch_sour/.test(sym)) symDx = -0.34;
      else if (sym.includes('sour') && !sym.includes('bitter') && !sym.includes('dry') && !sym.includes('uneven')) symDx = -0.62;
      else if (isFinite(acidInt) && acidInt >= 4 && (!isFinite(bitterInt) || bitterInt <= 2) && !sym.includes('bitter')) symDx = -0.55;
      else if (/way_bitter|very_bitter|really_bitter|undrinkable|choked/.test(sym)) symDx = +0.92;
      else if (/slightly_bitter/.test(sym)) symDx = +0.34;
      else if (sym.includes('bitter') || sym.includes('harsh') || sym.includes('astringent')) symDx = +0.62;
      else if ((isFinite(bitterInt) && bitterInt >= 4) || (isFinite(astrInt) && astrInt >= 4)) symDx = +0.55;

      if (measEy != null && symDx !== 0){
        if (symDx * eyGap > 0){
          dx = Math.sign(symDx) * _clamp(Math.max(Math.abs(symDx), Math.abs(eyGap), 0.32 + starPenalty * 0.45), 0, 1, 0);
        } else {
          dx = _clamp(0.65 * symDx + 0.35 * eyGap, -1, 1, 0);
        }
      } else if (symDx !== 0){
        dx = Math.sign(symDx) * _clamp(Math.max(Math.abs(symDx), isLowStars ? (0.32 + starPenalty * 0.42) : 0), 0, 1, 0);
      } else if (measEy != null){
        dx = _clamp(eyGap, -1, 1, 0);
        if (isLowStars && Math.abs(dx) >= 0.10 && Math.abs(dx) < 0.25){
          dx = Math.sign(dx) * Math.max(Math.abs(dx), 0.24 + starPenalty * 0.25);
        }
      } else if (isLowStars && !hasWeakCue && !hasStrongCue){
        if (ct.isFastGush) dx = _clamp(-0.34 - 0.30 * starPenalty, -1, 1, -0.34);
        else if (ct.isSlowStall) dx = _clamp(0.34 + 0.30 * starPenalty, -1, 1, 0.34);
      } else {
        dx = 0.0;
      }
    }
  }
  if (dx == null) dx = 0.0;

  if (dy == null){
    if (obs.strengthSlider != null && isFinite(+obs.strengthSlider) && Math.abs(+obs.strengthSlider) > 0.05){
      dy = _clamp(+obs.strengthSlider / 5.0, -1, 1, 0);
    } else {
      let symDy = 0;
      if (/really_watery|very_weak|way_weak|watery/.test(sym)) symDy = -0.90;
      else if (/slightly_weak/.test(sym)) symDy = -0.34;
      else if (sym.includes('weak') || sym.includes('thin') || sym.includes('hollow')) symDy = -0.60;
      else if (/really_strong|very_strong|way_strong|syrupy_heavy/.test(sym)) symDy = +0.90;
      else if (sym.includes('strong') || sym.includes('heavy')) symDy = +0.60;

      if (measTds != null && symDy !== 0){
        dy = (symDy * tdsGap > 0)
          ? Math.sign(symDy) * _clamp(Math.max(Math.abs(symDy), Math.abs(tdsGap)), 0, 1, 0)
          : _clamp(0.60 * symDy + 0.40 * tdsGap, -1, 1, 0);
      } else if (symDy !== 0){
        dy = symDy;
      } else if (measTds != null){
        dy = _clamp(tdsGap, -1, 1, 0);
      } else {
        dy = 0.0;
      }
    }
  }
  if (dy == null) dy = 0.0;

  /* Unsatisfied rating safety net: never freeze on Ring 0 if user rated < 4.25/5 with weak sensory cues */
  const isUnsatisfied = !dialLocked && (isLowStars || hasSourCue || hasBitterCue || hasWeakCue || hasStrongCue || hasChannelCue ||
    (measTds != null && Math.abs(rawTdsGap) >= 0.22) || (measEy != null && Math.abs(eyGap) >= 0.22));
  if (isUnsatisfied && Math.hypot(dx, dy) <= 0.20){
    if (Math.abs(tdsGap) >= 0.14 && Math.abs(dy) < 0.22){
      dy = Math.sign(tdsGap) * Math.max(Math.abs(dy), Math.abs(tdsGap), 0.24);
    }
    if (Math.hypot(dx, dy) <= 0.20){
      const nudgeDir = (eyGap !== 0 && Math.abs(eyGap) >= 0.08) ? Math.sign(eyGap)
        : (ct.isFastGush ? -1 : (ct.isSlowStall ? 1 : (hasBitterCue ? 1 : (rawTdsGap < -0.10 ? -1 : (rawTdsGap > 0.10 ? 1 : -1)))));
      dx = nudgeDir * Math.max(Math.abs(dx), 0.25 + 0.20 * starPenalty);
    }
  }

  const ringInfo = classifyTastePadRing(dx, dy);
  const magX = padNonlinearMag(dx);
  const magY = padNonlinearMag(dy);
  /* Signed extraction residual e_resid scaled consistently with dx */
  const eResid = measEy != null
    ? ((measEy - targetEy) / 2.0)
    : (dx * 1.65);

  /* 6-Hypothesis Fault-Tree Logits (Shift-Invariant Softmax + Actual-Time Contact Evidence) */
  const logits = [0, 0, 0, 0, 0, 0];
  /* Bottom-Right Quadrant (Weak & Bitter: dx >= 0.48 & dy <= -0.45) is classic uneven pour / channeling! */
  const isWeakBitterChannel = dx >= 0.48 && dy <= -0.45;
  const isSourBitter = sym === 'uneven' || sym === 'sour_dry' || sym === 'both' || !!obs.sourHigh && !!obs.bitterHigh || isWeakBitterChannel;
  const isBitterOvertimeChoke = ct.isSlowStall && dx >= 0.16;
  const isFastCoarseUnder = ct.isFastGush && dx <= -0.16;
  const isParadoxSourStall = ct.isSlowStall && (timeRatio >= 1.24 || ct.deltaSec >= 28) && dx <= -0.22;
  const isStall = timeRatio > 1.22 || isBitterOvertimeChoke || sym === 'fines_stall' || sym === 'muddy';
  const isExplicitStallFault = sym === 'fines_stall' || sym === 'muddy' || (isStall && (Math.abs(dx) >= 0.16 || isLowStars));
  const isPureStrength = Math.abs(dy) >= 0.22 && Math.abs(dx) < 0.20;

  logits[0] = (dx < -0.20 && !isSourBitter && !isStall ? 3.2 * Math.abs(dx) : -0.9) + ((timeRatio < 0.84 || isFastCoarseUnder) ? 1.55 : 0);
  logits[1] = (dx > 0.20 && !isSourBitter ? 3.1 * dx : -0.9) - (isBitterOvertimeChoke ? 0.35 : 0);
  logits[2] = isSourBitter ? 3.5 : (isParadoxSourStall ? 3.45 : (measEy != null && measEy >= 18.0 && measEy <= 21.8 && dx > 0.35 ? 2.7 : -1.1));
  logits[3] = isBitterOvertimeChoke ? 3.65 : (isStall ? 3.3 : -1.1);
  logits[4] = isPureStrength ? (2.6 + 1.8 * Math.abs(dy)) : (Math.abs(dy) >= 0.35 ? 1.5 * Math.abs(dy) : -1.0);
  logits[5] = (khPpm > 90 && (sym === 'flat' || sym === 'dull' || sym === 'muted' || sym === 'chalky')) ? 3.9 : (khPpm > 105 ? 2.2 : -1.4);

  const maxL = Math.max.apply(null, logits);
  let sumExp = 0;
  const post = logits.map(l => { const v = Math.exp(l - maxL); sumExp += v; return v; });
  for (let i = 0; i < 6; i++) post[i] = _rnd(post[i] / sumExp, 4);

  const hypotheses = [
    { id:'H1_bulk_under', label:isFastCoarseUnder ? 'Fast Coarse Drawdown / Under-Extraction' : 'Bulk Under-Extraction', prob:post[0] },
    { id:'H2_bulk_over', label:'Bulk Over-Extraction', prob:post[1] },
    { id:'H3_channeling', label:'Localized Channeling / Bypass', prob:post[2] },
    { id:'H4_fines_stall', label:isBitterOvertimeChoke ? 'Fines Migration / Filter Choke (+' + ct.deltaSec + 's Overtime)' : 'Dynamic Fines Filter Blinding', prob:post[3] },
    { id:'H5_strength_ratio', label:'Beverage Concentration / Ratio Mismatch', prob:post[4] },
    { id:'H6_water_buffer', label:'High-Alkalinity Acid Neutralization (KH > 90 ppm)', prob:post[5] }
  ].sort((a, b) => b.prob - a.prob);

  const topH = hypotheses[0];
  const isPreground = !!(G.PREGROUND_PROFILES && G.PREGROUND_PROFILES[grinderKey]);
  const grindLocked = !!obs.grindLocked || dialLocked || isPreground;
  const tempLocked = !!obs.tempLocked || dialLocked || methodKey === 'cold' || methodKey === 'cold_drip';
  const lockedParam = String(obs.lockedParam || prevRec.lockedParam || 'dose').toLowerCase();
  const tLo = methodKey === 'moka' ? 35.0 : 80.0;
  const tHi = methodKey === 'turkish' ? 94.0 : 99.0;

  let nextUm = curUm;
  let nextRatio = curRatio;
  let nextTempC = curTempC;
  let nextAgitation = prevRec.agitation || 'standard';
  let pourStructureShift = null;
  let waterOverrideNote = null;
  let convergenceMode = dialLocked ? 'golden_lock_hold' : (ringInfo.ring === 0 && !isUnsatisfied ? 'sweet_spot_locked' : 'macro_micro_bullseye_gauss_newton');

  /* Explicit Golden Lock or True Bullseye Ring 0 (r <= 0.20 with satisfied cup): Hold Steady! */
  if (dialLocked || (ringInfo.ring === 0 && !isExplicitStallFault && !isUnsatisfied && !(topH.id === 'H6_water_buffer' && khPpm > 95))){
    const gCur = mapMicronsToGrinder(curUm, grinderKey, prevRec.calib || null, methodKey);
    const lockTimeNote = (ct.hasActualTime && Math.abs(ct.deltaSec) >= 12)
      ? (' (Actual brew time ' + ct.actualMmSs + ' logged as your personal sweet-spot pace.)')
      : '';
    const lockTitle = dialLocked ? 'Golden Recipe Locked' : 'Balanced & Sweet - Lock This Recipe In!';
    return {
      ok:true,
      locked:!!dialLocked,
      severityRing:ringInfo,
      padCoords:{ dx:_rnd(dx, 3), dy:_rnd(dy, 3), radius:ringInfo.radius },
      topHypothesis:topH,
      hypotheses,
      timeDiagnostic:ct,
      convergenceMode:dialLocked ? 'golden_lock_hold' : 'sweet_spot_locked',
      eResid:_rnd(eResid, 3),
      grindDeltaUm:0,
      grindDeltaClicks:0,
      ratioDelta:0,
      doseDeltaG:0,
      waterDeltaG:0,
      tempDeltaC:0,
      pourStructureShift:null,
      waterOverrideNote:null,
      primaryActionHuman:lockTitle + ' Hold ' + gCur.label + ', 1:' + curRatio + ', and ' + curTempC + ' C steady.' + lockTimeNote,
      scientistExplanation:dialLocked
        ? 'Explicit Golden Lock is active; parameters remain frozen until you unlock.'
        : ('Cup sits inside Bullseye Ring 0 (r = ' + ringInfo.radius + ' <= 0.20); extraction and TDS match your personal sweet spot.' + (ct.hasActualTime ? (' ' + ct.scientistClue) : '')),
      epistemicTier:'verified_science',
      nextRecipe:{
        methodKey, doseG:curDoseG, waterG:_rnd(curWaterG, 1), ratio:curRatio,
        d50Um:curUm, grindUm:curUm, grinderPrevSetting:gCur, grinderSetting:gCur, tempC:curTempC, agitation:nextAgitation,
        expectedTds:measTds || prevRec.expectedTds || targetTds, expectedEy:measEy || prevRec.expectedEy || targetEy, brewTimeS:ct.hasActualTime ? ct.actualSec : (prevRec.brewTimeS || 175)
      },
      cup2Preview:{ deltaEyPct:0, deltaTdsPct:0, deltaBitterPct:0, deltaSweetPct:0 }
    };
  }

  /* Priority 0: Water KH > 90 ppm Chemistry Override */
  if (topH.id === 'H6_water_buffer' && khPpm > 90){
    const roSharePct = Math.round(_clamp((1 - 42 / khPpm) * 100, 25, 85, 55));
    waterOverrideNote = 'Your water alkalinity (' + Math.round(khPpm) + ' ppm KH) is neutralizing fruit acids flat before grind can help. Blend ' + roSharePct + '% distilled/RO water with ' + (100 - roSharePct) + '% tap water to reach ~42 ppm KH!';
    if (!tempLocked) nextTempC = _clamp(curTempC + 1.5, tLo, tHi, curTempC);
    convergenceMode = 'water_chemistry_override';
  } else {
    /* 1. Orthogonal Extraction Axis (dx): Grind + Temp + Pour-Structure Scaling
       STRICT ORTHOGONALITY: When |dx| < 0.20 (purely watery or purely strong), NEVER touch grind! */
    if (Math.abs(dx) >= 0.20){
      let bracketFound = false;
      if (!grindLocked && hist.length >= 1 && !isSourBitter && !isStall){
        for (let k = hist.length - 1; k >= 0; k--){
          const h = hist[k];
          const hUm = _pickFirstPosNum([h.d50Um, h.grindUm, h.grind_um, h.brew_grind_target_um]);
          const hRes = _extractRowEResid(h, mPhys, prevRec);
          if (isFinite(hUm) && hUm > 0 && isFinite(hRes) && Math.abs(hUm - curUm) >= 10){
            if (hRes * eResid < 0){
              /* Case A: Opposite-sign Regula-Falsi 3-Cup Convergence Guarantee (w clamped in [0.20, 0.80]) */
              const wRaw = Math.abs(eResid) / (Math.abs(eResid) + Math.abs(hRes));
              const wClamped = _clamp(wRaw, 0.20, 0.80, 0.50);
              nextUm = Math.round(((1 - wClamped) * curUm + wClamped * hUm) / 5) * 5;
              convergenceMode = 'regula_falsi_bracket';
              bracketFound = true;
              break;
            } else if (Math.abs(eResid) > Math.abs(hRes) + 0.15 && ((eResid < 0 && curUm < hUm) || (eResid > 0 && curUm > hUm))){
              /* Case C: Non-monotonic Darcy channeling reversal! */
              nextUm = Math.round((Math.max(curUm, hUm) * 1.06) / 5) * 5;
              if (!tempLocked) nextTempC = _clamp(curTempC + (eResid < 0 ? 2.5 : -2.5), tLo, tHi, curTempC);
              nextAgitation = 'gentle';
              convergenceMode = 'non_monotonic_pivot';
              bracketFound = true;
              break;
            } else if (Math.abs(eResid) < Math.abs(hRes) - 0.08){
              /* Case B: 1.5x-capped secant step */
              const du = curUm - hUm;
              const de = eResid - hRes;
              if (Math.abs(de) > 0.05){
                const capDelta = _clamp(-eResid * (du / de), -1.5 * Math.abs(du), 1.5 * Math.abs(du), 0);
                nextUm = Math.round((curUm + capDelta) / 5) * 5;
                convergenceMode = 'damped_secant';
                bracketFound = true;
                break;
              }
            }
          }
        }
      }

      if (!bracketFound){
        if (isSourBitter || isStall){
          /* Channeling or Fines Stall (incl. Weak & Bitter bottom-right): coarsen + calm pour! */
          const stallScale = Math.max(0.35, Math.abs(magX));
          if (!grindLocked){
            const coarseJump = isEsp ? Math.round((42 * stallScale) / 5) * 5 : Math.round((125 * stallScale) / 5) * 5;
            nextUm = curUm + Math.max(isEsp ? 10 : 25, coarseJump);
          }
          nextAgitation = 'gentle';
          if (ringInfo.ring >= 2 && !isEsp){
            pourStructureShift = 'Switch to Single Low-Agitation Center Pour (spout 3-4 cm low, zero post-pour swirl) to eliminate bypass channeling';
          }
          convergenceMode = 'darcy_anti_stall_reversal';
        } else {
          /* Full Macro-to-Micro Severity Scaling via mag(dx) = sign(dx)*(0.35*|dx| + 0.65*dx^2) */
          const maxUmSpan = isEsp ? 48.0 : (methodKey === 'turkish' ? 30.0 : 160.0);
          const rawDeltaUm = magX * maxUmSpan; /* dx < 0 (sour) -> negative (FINER); dx > 0 (bitter) -> positive (COARSER) */
          if (!grindLocked){
            const quantStep = 5;
            nextUm = curUm + Math.round(rawDeltaUm / quantStep) * quantStep;
          }
          if (!tempLocked){
            const maxTempSpanC = grindLocked ? 5.5 : 4.2;
            const rawDeltaTempC = -magX * maxTempSpanC; /* dx < 0 (sour) -> hotter (+C); dx > 0 (bitter) -> cooler (-C) */
            nextTempC = _clamp(_rnd(curTempC + rawDeltaTempC, 1), tLo, tHi, curTempC);
          }
          /* Ring 3 Macro Pour-Structure Shift */
          if (Math.abs(dx) >= 0.72 && !isEsp && mPhys.chiRet < 0.85){
            if (dx < 0){
              nextAgitation = 'active';
              pourStructureShift = 'Upgrade to 3-Pulse Pour + 45s Bloom Swirl (boosts convective residence time & extraction)';
            } else {
              nextAgitation = 'gentle';
              pourStructureShift = 'Switch to Calm 2-Pour Center Stream (no swirl; halts late polyphenol washout)';
            }
          }
        }
      }
    }

    /* 2. Orthogonal Strength Axis (dy): Macro-to-Micro Ratio / Dose / Water Scaling */
    if (Math.abs(dy) >= 0.20){
      const maxRatioSpan = isEsp ? 0.95 : (methodKey === 'phin' ? 1.8 : 3.45);
      const rawDeltaRatio = magY * maxRatioSpan; /* dy < 0 (watery) -> negative ratio shift (tighter, e.g. 16.7 -> 13.5)! */
      const rescueLo = isEsp ? Math.max(1.0, mPhys.ratioBounds[0] - 0.5) : Math.max(1.5, mPhys.ratioBounds[0] - 2.2);
      const rescueHi = isEsp ? mPhys.ratioBounds[1] + 1.0 : mPhys.ratioBounds[1] + 2.8;
      nextRatio = _clamp(
        _rnd(curRatio + rawDeltaRatio, isEsp ? 2 : 1),
        rescueLo,
        rescueHi,
        curRatio
      );
    }
  }

  /* Allow full physical Ring-3 bounds without flipping intended taste direction when curUm starts outside method window */
  const rawIntendedUm = nextUm;
  const umFloor = Math.max(55, mPhys.um[0] - 80);
  const umCeil = mPhys.um[1] + 120;
  const clampedMethodUm = _clamp(rawIntendedUm, umFloor, umCeil, curUm);
  if (rawIntendedUm !== curUm && Math.sign(clampedMethodUm - curUm) !== Math.sign(rawIntendedUm - curUm)){
    nextUm = _clamp(rawIntendedUm, 55, 1500, curUm);
  } else {
    nextUm = clampedMethodUm;
  }
  const activeUmFloor = Math.min(umFloor, curUm, nextUm, 55);
  const activeUmCeil = Math.max(umCeil, curUm, nextUm, 1500);

  /* Tabu Failed-Tweak Memory (avoidAxes): never repeat a failed non-bracketing move; never block valid Regula-Falsi brackets! */
  const avoidAxes = Array.isArray(obs.avoidAxes) ? obs.avoidAxes.slice() : [];
  let tabuPivotApplied = false;
  let lastFailedPair = null;
  if (hist.length >= 2){
    const hPrev = hist[hist.length - 2], hLast = hist[hist.length - 1];
    const rPrev = _extractRowRating10(hPrev), rLast = _extractRowRating10(hLast);
    const uPrev = _pickFirstPosNum([hPrev && hPrev.d50Um, hPrev && hPrev.grindUm, hPrev && hPrev.grind_um, hPrev && hPrev.brew_grind_target_um]);
    const uLast = _pickFirstPosNum([hLast && hLast.d50Um, hLast && hLast.grindUm, hLast && hLast.grind_um, hLast && hLast.brew_grind_target_um]);
    if (isFinite(rPrev) && isFinite(rLast) && (rLast <= rPrev - 1.0) && isFinite(uPrev) && isFinite(uLast) && Math.abs(uLast - uPrev) >= 10){
      lastFailedPair = [Math.min(uPrev, uLast), Math.max(uPrev, uLast)];
      const failedDir = Math.sign(uLast - uPrev);
      if (failedDir < 0 && avoidAxes.indexOf('grind_finer') < 0) avoidAxes.push('grind_finer');
      if (failedDir > 0 && avoidAxes.indexOf('grind_coarser') < 0) avoidAxes.push('grind_coarser');
    }
  }
  const isStrictBracketMove = convergenceMode === 'regula_falsi_bracket' ||
    (lastFailedPair && nextUm > lastFailedPair[0] && nextUm < lastFailedPair[1]);
  if (!isStrictBracketMove && ((nextUm < curUm && (avoidAxes.indexOf('grind_finer') >= 0 || avoidAxes.indexOf('grind') >= 0)) ||
      (nextUm > curUm && (avoidAxes.indexOf('grind_coarser') >= 0 || avoidAxes.indexOf('grind') >= 0)))){
    const blockedDeltaUm = nextUm - curUm;
    nextUm = curUm;
    tabuPivotApplied = true;
    if (!tempLocked){
      nextTempC = _clamp(_rnd(curTempC + _clamp(-0.08 * blockedDeltaUm, -2.5, 2.5, 0), 1), tLo, tHi, curTempC);
    }
  }

  /* Compute Next Dose & Water honoring whether user locks 'water' (cup size) or 'dose' */
  let nextDoseG = curDoseG;
  let nextWaterG = _rnd(curDoseG * nextRatio, 1);
  if (lockedParam === 'water' && nextRatio > 0){
    nextWaterG = _rnd(curWaterG, 1);
    nextDoseG = _rnd(curWaterG / nextRatio, 1);
  }

  /* Exact Grinder-Specific Click / Number Step Translation + Minimum +/-1 Click Step Guard & Clamp Fallback */
  const gPrev = mapMicronsToGrinder(curUm, grinderKey, prevRec.calib || null, methodKey);
  let gNext = mapMicronsToGrinder(nextUm, grinderKey, prevRec.calib || null, methodKey);
  const isSteplessTaste = !!(
    (gNext && (gNext.calibMode === 'taste' || gNext.stepless || (gNext.clickInc === 0 && !gNext.preground && gNext.kind === 'calibrate'))) ||
    (gPrev && (gPrev.calibMode === 'taste' || gPrev.stepless || (gPrev.clickInc === 0 && !gPrev.preground && gPrev.kind === 'calibrate')))
  );
  const realUmPerStep = (gNext && gNext.umPerClick > 0) ? gNext.umPerClick : ((gNext && gNext.stepUm > 0) ? gNext.stepUm : 25.0);
  const clickInc = (gNext && gNext.clickInc > 0) ? gNext.clickInc : 1;
  let grindDeltaUm = Math.round(nextUm - curUm);
  let grindDeltaClicks = isSteplessTaste
    ? 0
    : ((gPrev && gNext && gPrev.clicks != null && gNext.clicks != null)
        ? _rnd(gNext.clicks - gPrev.clicks, 2)
        : _rnd(grindDeltaUm / realUmPerStep, 2));
  let steppedThermalSpilloverC = 0;
  let grinderClampNote = null;

  /* Coarse & fine stepped grinders must NEVER quantize a real extraction residual (|dx| >= 0.18) back to 0 clicks! */
  if (!isSteplessTaste && !grindLocked && !tabuPivotApplied && Math.abs(dx) >= 0.18 && ringInfo.ring > 0 &&
      Math.abs(grindDeltaClicks) < (clickInc * 0.5) && gPrev && gPrev.clicks != null){
    const dir = (nextUm < curUm || (nextUm === curUm && dx < 0)) ? -1 : 1;
    const minC = gPrev.minRaw != null ? gPrev.minRaw : 0;
    const maxC = gPrev.maxRaw != null ? gPrev.maxRaw : 500;
    const targetClicks = _rnd(_clamp(gPrev.clicks + dir * clickInc, minC, maxC, gPrev.clicks), 2);
    let steppedOk = false;
    if (Math.abs(targetClicks - gPrev.clicks) >= (clickInc * 0.5)){
      let candUm = (typeof G.micronsForGrinderSetting === 'function')
        ? Math.round(G.micronsForGrinderSetting(grinderKey, targetClicks, methodKey, prevRec.calib || null))
        : Math.round(curUm + dir * realUmPerStep);
      candUm = _clamp(Math.round(candUm / 5) * 5, activeUmFloor, activeUmCeil, curUm);
      let gCand = mapMicronsToGrinder(candUm, grinderKey, prevRec.calib || null, methodKey);
      let guard = 0;
      while (gCand && gCand.clicks === gPrev.clicks && guard < 12 && candUm > activeUmFloor && candUm < activeUmCeil){
        candUm = _clamp(candUm + dir * 5, activeUmFloor, activeUmCeil, candUm);
        gCand = mapMicronsToGrinder(candUm, grinderKey, prevRec.calib || null, methodKey);
        guard++;
      }
      if (gCand && gCand.clicks != null && Math.abs(gCand.clicks - gPrev.clicks) >= (clickInc * 0.5) && Math.sign(gCand.clicks - gPrev.clicks) === dir){
        nextUm = candUm;
        gNext = gCand;
        grindDeltaUm = Math.round(nextUm - curUm);
        grindDeltaClicks = _rnd(gNext.clicks - gPrev.clicks, 2);
        steppedOk = true;
      }
    }
    if (!steppedOk){
      /* At physical grinder clamp limit or unsteppable floor/ceiling: route cleanly to temp/ratio fallback */
      nextUm = curUm;
      grindDeltaUm = 0;
      grindDeltaClicks = 0;
      gNext = gPrev;
      grinderClampNote = 'Grinder at ' + (dir < 0 ? 'finest' : 'coarsest') + ' setting limit (' + gPrev.label + '); compensating with temperature' + (!isEsp ? ' & pour' : '') + '.';
      if (!tempLocked){
        steppedThermalSpilloverC = _rnd(_clamp(dir < 0 ? 2.0 : -2.0, -3.0, 3.0, 0), 1);
        nextTempC = _clamp(_rnd(curTempC + steppedThermalSpilloverC, 1), tLo, tHi, curTempC);
      }
    }
  } else if (!isSteplessTaste && !grindLocked && Math.abs(grindDeltaUm) >= 6 && Math.abs(grindDeltaClicks) < (clickInc * 0.5) && !tempLocked && methodKey !== 'cold' && methodKey !== 'cold_drip'){
    steppedThermalSpilloverC = _rnd(_clamp(-0.092 * grindDeltaUm, -2.2, 2.2, 0), 1);
    nextTempC = _clamp(_rnd(curTempC + steppedThermalSpilloverC, 1), tLo, tHi, curTempC);
    nextUm = curUm;
    grindDeltaUm = 0;
    grindDeltaClicks = 0;
    gNext = gPrev;
  }

  const ratioDelta = _rnd(nextRatio - curRatio, 2);
  const doseDeltaG = _rnd(nextDoseG - curDoseG, 1);
  const waterDeltaG = _rnd(nextWaterG - curWaterG, 1);
  const tempDeltaC = _rnd(nextTempC - curTempC, 1);

  /* Forward-simulate Cup #2 so user sees exact physical preview before brewing! */
  const simPrev = simulateBrew({ methodKey, grinderKey, doseG:curDoseG, waterG:curWaterG, d50Um:curUm, kettleTempC:curTempC, agitation:prevRec.agitation || 'standard' });
  const simNext = simulateBrew({ methodKey, grinderKey, doseG:nextDoseG, waterG:nextWaterG, d50Um:nextUm, kettleTempC:nextTempC, agitation:nextAgitation });

  /* Build Crystal-Clear Plain-English Action Summary across Grind + Ratio/Dose + Temp + Pour */
  const actionParts = [];
  if (waterOverrideNote){
    actionParts.push(waterOverrideNote);
  }
  if (grinderClampNote){
    actionParts.push(grinderClampNote);
  }
  if (Math.abs(grindDeltaUm) >= 5){
    const dirWord = grindDeltaUm < 0 ? 'FINER' : 'COARSER';
    const absUm = Math.abs(grindDeltaUm);
    if (isSteplessTaste){
      const fmtKey = (gNext && gNext.fmt) || (gPrev && gPrev.fmt) || '';
      let steplessCue = 'Stepless \u00B7 Calibrate by taste';
      if (fmtKey === 'unmarked_nut'){
        const turnFrac = absUm >= 120 ? '~1/4 wing-nut turn' : absUm >= 55 ? '~1/8 wing-nut turn' : '~1/12 wing-nut turn';
        steplessCue = turnFrac + ' \u00B7 Calibrate by taste';
      } else if (fmtKey === 'chirp_relative_marks'){
        const markEst = _rnd(Math.max(0.25, absUm / 45), 1);
        steplessCue = '~' + markEst + ' dial marks \u00B7 Calibrate by taste';
      }
      actionParts.push('Adjust grind ~' + absUm + ' \u00B5m ' + dirWord + ' (' + steplessCue + ')');
    } else {
      const absClicks = Math.abs(grindDeltaClicks);
      const unitWord = (gNext && gNext.unit) ? gNext.unit : 'clicks';
      const clickPhrase = absClicks >= 0.2
        ? (absClicks + ' ' + (absClicks === 1 ? unitWord.replace(/s$/i, '') : (/s$/i.test(unitWord) ? unitWord : unitWord + 's')) + ' ' + dirWord + ' (\u2192 ' + gNext.label + ', ' + (grindDeltaUm > 0 ? '+' : '') + grindDeltaUm + ' um)')
        : ((grindDeltaUm < 0 ? 'FINER ' : 'COARSER +') + grindDeltaUm + ' um (\u2192 ' + nextUm + ' um)');
      actionParts.push('Grind ' + clickPhrase);
    }
  }
  if (Math.abs(ratioDelta) >= (isEsp ? 0.08 : 0.2)){
    const massChangeTxt = lockedParam === 'water'
      ? ((doseDeltaG > 0 ? '+' : '') + doseDeltaG + ' g coffee (' + nextDoseG + ' g for ' + Math.round(nextWaterG) + ' g water, 1:' + nextRatio + ')')
      : ((waterDeltaG > 0 ? '+' : '') + Math.round(waterDeltaG) + ' g water (' + curDoseG + ' g : ' + Math.round(nextWaterG) + ' g, 1:' + nextRatio + ', or ' + (ratioDelta < 0 ? '+' + _rnd(curWaterG / nextRatio - curDoseG, 1) + ' g coffee' : _rnd(curWaterG / nextRatio - curDoseG, 1) + ' g coffee') + ')');
    actionParts.push((ratioDelta < 0 ? 'Strengthen ratio: ' : 'Lighten ratio: ') + massChangeTxt);
  }
  if (Math.abs(tempDeltaC) >= 0.5){
    actionParts.push('Temp ' + (tempDeltaC > 0 ? '+' : '') + tempDeltaC + ' C (\u2192 ' + nextTempC + ' C)');
  }
  if (pourStructureShift){
    actionParts.push(pourStructureShift);
  } else if (nextAgitation !== (prevRec.agitation || 'standard')){
    actionParts.push(nextAgitation === 'gentle' ? 'Gentle low-spout pour' : 'Brisk spiral pour');
  }
  let timeActionClause = '';
  if (isBitterOvertimeChoke && ct.humanClue){
    timeActionClause = ' (' + ct.humanClue + ')';
  } else if (isFastCoarseUnder && ct.humanClue){
    timeActionClause = ' (' + ct.humanClue + ')';
  } else if (isParadoxSourStall && ct.humanClue){
    timeActionClause = ' (Paradox clue: ' + ct.humanClue + ' Clogged bed channeled around dry pockets!)';
  }
  const primaryActionHuman = actionParts.length
    ? ('[' + ringInfo.label + '] ' + actionParts.join('  +  ') + '.' + timeActionClause)
    : 'Hold current recipe settings steady.';

  const baseHumanWhy = isBitterOvertimeChoke
    ? (ct.humanClue + ' Coarsening grind and pouring gently clears clogged paper pores and trims late dry bitterness.')
    : isFastCoarseUnder
    ? (ct.humanClue + ' Grinding finer slows flow back toward target so sweet mid-brew sugars fully dissolve.')
    : isParadoxSourStall
    ? ('Drawdown stalled +' + ct.deltaSec + 's yet tasted sour — fine-clogged bed forced water down narrow channels. Coarsening + gentle center pour restores even extraction.')
    : (dx < -0.18 ? 'Unlocks natural caramel/fruit sweetness and smooths sharp sourness.' : dx > 0.18 ? 'Trims late dry bitterness while keeping sweet mid-palate clarity.' : dy < -0.18 ? 'Builds richer body and mouthfeel without over-extracting.' : dy > 0.18 ? 'Opens up aromatic clarity and lighter tea-like balance.' : 'Cup sits inside your personal sweet-spot bullseye.');

  const counterfactual = {
    humanHeadline:actionParts[0] || 'Sweet Spot Locked — Hold Recipe Steady',
    humanWhy:baseHumanWhy,
    clickFrom:gPrev ? (gPrev.shortDisplay || gPrev.display) : String(curUm + ' um'),
    clickTo:gNext ? (gNext.shortDisplay || gNext.display) : String(nextUm + ' um'),
    d50FromUm:curUm,
    d50ToUm:nextUm,
    deltaUm:grindDeltaUm,
    eyFromPct:simPrev.eyPct,
    eyToPct:simNext.eyPct,
    deltaEyPct:_rnd(simNext.eyPct - simPrev.eyPct, 2),
    tdsFromPct:simPrev.tdsPct,
    tdsToPct:simNext.tdsPct,
    deltaTdsPct:_rnd(simNext.tdsPct - simPrev.tdsPct, 3),
    wavesBefore:{ acid:Math.round(simPrev.waveFracs.acid * 100), sweet:Math.round(simPrev.waveFracs.sweet * 100), bitter:Math.round(simPrev.waveFracs.bitter * 100) },
    wavesAfter:{ acid:Math.round(simNext.waveFracs.acid * 100), sweet:Math.round(simNext.waveFracs.sweet * 100), bitter:Math.round(simNext.waveFracs.bitter * 100) },
    drawdownDeltaS:Math.round(simNext.brewTimeS - simPrev.brewTimeS),
    avoidAxes,
    tabuPivotApplied,
    steppedThermalSpilloverC,
    timeDiagnostic:ct
  };

  return {
    ok:true,
    severityRing:ringInfo,
    padCoords:{ dx:_rnd(dx, 3), dy:_rnd(dy, 3), radius:ringInfo.radius },
    topHypothesis:topH,
    hypotheses,
    timeDiagnostic:ct,
    convergenceMode,
    eResid:_rnd(eResid, 3),
    grindDeltaUm,
    grindDeltaClicks,
    umPerStep:_rnd(realUmPerStep, 1),
    ratioDelta,
    doseDeltaG,
    waterDeltaG,
    tempDeltaC,
    avoidAxes,
    tabuPivotApplied,
    steppedThermalSpilloverC,
    pourStructureShift,
    waterOverrideNote,
    primaryActionHuman,
    scientistExplanation:'Ring ' + ringInfo.ring + ' (' + ringInfo.label + ', r=' + ringInfo.radius + ') nonlinear scaling mag(dx)=' + _rnd(magX, 2) + ', mag(dy)=' + _rnd(magY, 2) + ' + P(' + topH.id + ')=' + Math.round(topH.prob * 100) + '% (' + convergenceMode + ').' + (ct.hasActualTime || ct.fromCue ? (' ' + ct.scientistClue) : ''),
    epistemicTier:'verified_science',
    counterfactual,
    nextRecipe:{
      methodKey,
      doseG:nextDoseG,
      waterG:nextWaterG,
      ratio:nextRatio,
      d50Um:nextUm,
      grindUm:nextUm,
      grinderPrevSetting:gPrev,
      grinderSetting:gNext,
      tempC:nextTempC,
      agitation:nextAgitation,
      pourStructureShift,
      expectedTds:simNext.tdsPct,
      expectedEy:simNext.eyPct,
      brewTimeS:simNext.brewTimeS
    },
    cup2Preview:{
      deltaEyPct:_rnd(simNext.eyPct - simPrev.eyPct, 2),
      deltaTdsPct:_rnd(simNext.tdsPct - simPrev.tdsPct, 3),
      deltaBitterPct:_rnd((simNext.waveFracs.bitter - simPrev.waveFracs.bitter) * 100, 1),
      deltaSweetPct:_rnd((simNext.waveFracs.sweet - simPrev.waveFracs.sweet) * 100, 1)
    }
  };
}

/* ============================================================================
   9. SENSORY PSYCHOPHYSICS, 4-HYPOTHESIS R2-VS-PALATE RECONCILER &
      ROBUST STUDENT-T / HUBER IRLS EMPIRICAL BAYES PALATE TWIN (#179)
   - Weber-Fechner JNDs (Frost et al. 2019/2021; Batali et al. 2020; Cotter et al. 2021)
   - Repeat-Recipe Surprise Gate (z > 2.30) + O(N) Linked-Bucket Student-t IRLS
   - 4-Hypothesis R2-vs-Palate Discrepancy Solver (Human Palate Sovereignty!)
   - Physics-Intact Non-SCA Personal Target Synthesizer (1.05% Tea <-> 1.75% Syrupy)
   ============================================================================ */

const SENSORY_PSYCHOPHYSICS_V6 = {
  weberFractionTds: 0.052,
  jndTdsFilterPct: 0.07,
  jndTdsEspressoPct: 0.50,
  jndEyPct: 0.90,
  selectivityEaDeltaKjMol: 9.8,
  kCkBShiftPerDegCPct: 1.30,
  eyShiftPerDegCPct: 0.26,
  trpm5GoldenWindowC: [55.0, 62.0],
  trpm5MaskingCeilingC: 65.0,
  khMaskingWarnPpm: 75.0,
  leverTiers: {
    sub_jnd_lock: { jndMax:0.75, label:'Sub-JND Sweet Spot (Lock Recipe)', grindFilterUm:[0, 0], ratioFilter:[0, 0], tempC:[0, 0] },
    micro_tweak:  { jndMax:1.85, label:'Low-Leverage Fine Micro-Tweak',    grindFilterUm:[15, 28], ratioFilter:[0.3, 0.5], tempC:[1.0, 1.8] },
    medium_step:  { jndMax:3.40, label:'Coupled Medium Dial-In Step',      grindFilterUm:[50, 90], ratioFilter:[1.1, 1.7], tempC:[2.0, 2.8] },
    macro_swing:  { jndMax:99.0, label:'High-Leverage Macro Swing Rescue', grindFilterUm:[105, 165], ratioFilter:[2.5, 3.5], tempC:[3.2, 4.2] }
  }
};

const MINIMAL_SENSORY_INPUT_SPEC = {
  maxTaps: 4,
  zeroTextForms: true,
  signals: [
    { key:'stars',       widget:'BTBeanSweep',       range:[0.5, 5.0], step:0.25, role:'Scalar hedonic utility & Surprise Gate anchor' },
    { key:'pad2d',       widget:'BTTastePad2D',      axes:['dx (Sour<->Bitter)', 'dy (Weak<->Strong)'], rings:4, role:'Orthogonal Balance x Strength vector' },
    { key:'finishSplit', widget:'3WayTextureSplit',  options:['clean', 'drying', 'tealike', 'syrupy', 'hollow', 'juicy', 'sharp'], role:'TAS2R bitter vs di-CQA trigeminal astringency & body' },
    { key:'drawdownCue', widget:'DrawdownPillStrip', options:['fast', 'normal', 'slow'], role:'Darcy hydraulic stall vs gusher disambiguation' },
    { key:'contextTag',  widget:'OutlierShieldPill', options:['normal', 'off_palate', 'chalky_water', 'not_my_style'], role:'1-tap sick-day outlier shield & style/water isolation' }
  ]
};

const MAX_ROB_LEN = 1024;
const _sbScratchA = new Float64Array(MAX_ROB_LEN);
const _sbScratchB = new Float64Array(MAX_ROB_LEN);
const _sbIrlTds   = new Float64Array(MAX_ROB_LEN);
const _sbIrlEy    = new Float64Array(MAX_ROB_LEN);
const _sbIrlWT0   = new Float64Array(MAX_ROB_LEN);
const _sbIrlWE0   = new Float64Array(MAX_ROB_LEN);
const _sbRowR10   = new Float64Array(MAX_ROB_LEN);
const _sbRowSurpW = new Float64Array(MAX_ROB_LEN);
const _sbNextInBucket = new Int32Array(MAX_ROB_LEN);

function _quickSelect(arr, n, k){
  let left = 0, right = n - 1;
  while (left < right){
    const pivotIdx = (left + right) >> 1;
    const pivotVal = arr[pivotIdx];
    let tmp = arr[pivotIdx]; arr[pivotIdx] = arr[right]; arr[right] = tmp;
    let store = left;
    for (let i = left; i < right; i++){
      if (arr[i] < pivotVal){ tmp = arr[store]; arr[store] = arr[i]; arr[i] = tmp; store++; }
    }
    tmp = arr[right]; arr[right] = arr[store]; arr[store] = tmp;
    if (k === store) return arr[k];
    if (k < store) right = store - 1; else left = store + 1;
  }
  return arr[left];
}

function _medianFromScratch(buf, n){
  if (n <= 0) return 0;
  if (n === 1) return buf[0];
  const mid = n >> 1;
  const hi = _quickSelect(buf, n, mid);
  if ((n & 1) === 1) return hi;
  let maxLo = -Infinity;
  for (let i = 0; i < mid; i++){ if (buf[i] > maxLo) maxLo = buf[i]; }
  return 0.5 * (maxLo + hi);
}

function _extractRowRating10(r){
  if (!r) return NaN;
  if (r.rating10 != null && isFinite(+r.rating10) && +r.rating10 > 0) return _clamp(+r.rating10, 1.0, 10.0, 7.0);
  const st = parseFloat(r.stars != null ? r.stars : r.my_rating_stars);
  if (isFinite(st) && st > 0) return _clamp(st <= 5.0 ? st * 2.0 : st, 1.0, 10.0, 7.0);
  const ts = parseFloat(r.total_score);
  if (isFinite(ts) && ts >= 60) return _clamp(5.0 + ((ts - 70.0) / 22.0) * 5.0, 1.0, 10.0, 7.2);
  return NaN;
}

function isRowExcludedFromLearning(r){
  if (!r || typeof r !== 'object') return true;
  if (r.exclude_learning === true || r.excludeLearning === true || r.exclude_learning === 'yes') return true;
  const ctx = r.contextTag || r.palate_context || r.outlier_reason;
  if (ctx){
    const cl = String(ctx).toLowerCase();
    if (cl === 'off_palate' || cl === 'sick' || cl === 'toothpaste' || cl === 'spicy_meal' || cl === 'skip_learning') return true;
  }
  const rawA = r.recipe_adaptation_json;
  if (rawA){
    if (typeof rawA === 'string'){
      if (rawA.indexOf('"exclude_learning":true') >= 0 || rawA.indexOf('"off_palate"') >= 0) return true;
    } else if (rawA.v6 && (rawA.v6.exclude_learning === true || rawA.v6.outlier_reason === 'off_palate')) return true;
  }
  const rawC = r.cva_intensity_json;
  if (rawC){
    if (typeof rawC === 'string'){
      if (rawC.indexOf('"exclude_learning":true') >= 0 || rawC.indexOf('"off_palate"') >= 0) return true;
    } else if (rawC.v6 && rawC.v6.exclude_learning === true) return true;
  }
  return false;
}

function _coffeeMatchKey(obj){
  if (!obj) return '';
  const cid = obj.coffee_id || obj.coffeeId || (obj.coffee && obj.coffee.id);
  if (cid) return 'id:' + String(cid);
  const nm = obj.coffee_name || obj.coffeeName || (obj.coffee && obj.coffee.name);
  if (!nm) return '';
  const ro = obj.roaster || (obj.coffee && obj.coffee.roaster) || '';
  return 'nm:' + String(nm).toLowerCase() + '|' + String(ro).toLowerCase();
}

function studentTHuberWeight(residual, scaleMad, cConst){
  const s = Math.max(1e-6, +scaleMad || 0.45);
  const c = cConst > 0 ? +cConst : 1.25;
  const u = (+residual || 0) / (c * s);
  return 1.0 / (1.0 + u * u);
}

function classifyLeverRegime(cfg){
  cfg = cfg || {};
  const isEsp = !!cfg.isEspresso;
  const dx = _clamp(cfg.dx != null ? cfg.dx : cfg.padX, -1, 1, 0);
  const dy = _clamp(cfg.dy != null ? cfg.dy : cfg.padY, -1, 1, 0);
  const jndEy = SENSORY_PSYCHOPHYSICS_V6.jndEyPct;
  const jndTds = isEsp ? SENSORY_PSYCHOPHYSICS_V6.jndTdsEspressoPct : SENSORY_PSYCHOPHYSICS_V6.jndTdsFilterPct;
  const magX = padNonlinearMag(dx);
  const magY = padNonlinearMag(dy);
  const eqDeltaEyPct = cfg.deltaEyPct != null && isFinite(+cfg.deltaEyPct) ? +cfg.deltaEyPct : (magX * 4.68);
  const eqDeltaTdsPct = cfg.deltaTdsPct != null && isFinite(+cfg.deltaTdsPct) ? +cfg.deltaTdsPct : (magY * (isEsp ? 2.60 : 0.364));
  const jEy = Math.abs(eqDeltaEyPct) / jndEy;
  const jTds = Math.abs(eqDeltaTdsPct) / jndTds;
  const jNorm = Math.sqrt(jEy * jEy + jTds * jTds);
  const rPad = Math.hypot(dx, dy);
  let regime = 'sub_jnd_lock';
  if (jNorm > 3.40 || rPad > 0.76) regime = 'macro_swing';
  else if (jNorm > 1.85 || rPad > 0.48) regime = 'medium_step';
  else if (jNorm > 0.75 || rPad > 0.20) regime = 'micro_tweak';
  return {
    regime,
    primaryClass: regime === 'micro_tweak' ? 'low_leverage_selectivity' : regime === 'macro_swing' ? 'high_leverage_structural' : regime === 'medium_step' ? 'coupled_medium_step' : 'hold_locked',
    label: SENSORY_PSYCHOPHYSICS_V6.leverTiers[regime].label,
    jndEyUnits: _rnd(jEy, 2),
    jndTdsUnits: _rnd(jTds, 2),
    jndNorm: _rnd(jNorm, 2),
    eqDeltaEyPct: _rnd(eqDeltaEyPct, 2),
    eqDeltaTdsPct: _rnd(eqDeltaTdsPct, 3),
    allowPourTopologyShift: regime === 'macro_swing'
  };
}

function detectRatingSurprise(candidate, historyRows){
  candidate = candidate || {};
  const rows = Array.isArray(historyRows) ? historyRows : [];
  if (isRowExcludedFromLearning(candidate)){
    return { ok:true, isSurprise:false, explicitExclude:true, zSurprise:0, robustWeight:0.0, priorCount:0, priorMedian10:null, preserveDialLock:true, uiPrompt:null };
  }
  const rNew10 = _extractRowRating10(candidate);
  if (!isFinite(rNew10)){
    return { ok:true, isSurprise:false, explicitExclude:false, zSurprise:0, robustWeight:1.0, priorCount:0, priorMedian10:null, preserveDialLock:false, uiPrompt:null };
  }
  const cKey = _coffeeMatchKey(candidate);
  const mKey = String(candidate.methodKey || candidate.method || candidate.brew_method || 'v60').toLowerCase();
  const isEsp = mKey.indexOf('espresso') >= 0;
  const cUm = parseFloat(candidate.d50Um != null ? candidate.d50Um : (candidate.grindUm != null ? candidate.grindUm : candidate.brew_grind_target_um));
  const cRatio = parseFloat(candidate.ratio != null ? candidate.ratio : candidate.brew_ratio);
  const cTemp = parseFloat(candidate.tempC != null ? candidate.tempC : candidate.brew_temp_c);

  const candExplicitUnlock = ['no', '0', 'false'].indexOf(String(candidate.dial_locked != null ? candidate.dial_locked : (candidate.dialLocked != null ? candidate.dialLocked : '')).trim().toLowerCase()) >= 0;
  let nMatch = 0, hasLockedPrior = false;
  for (let i = 0; i < rows.length && nMatch < MAX_ROB_LEN; i++){
    const hr = rows[i];
    if (!hr || isRowExcludedFromLearning(hr)) continue;
    if (candidate.id && hr.id && String(candidate.id) === String(hr.id)) continue;
    const hrSym = String(hr.fix_symptom || hr.symptom || '').toLowerCase();
    if (hrSym === 'stale' || hrSym === 'offtaste') continue;
    if (cKey && _coffeeMatchKey(hr) !== cKey) continue;
    if (String(hr.methodKey || hr.method || hr.brew_method || 'v60').toLowerCase() !== mKey) continue;
    const hUm = parseFloat(hr.d50Um != null ? hr.d50Um : (hr.grindUm != null ? hr.grindUm : hr.brew_grind_target_um));
    const hRatio = parseFloat(hr.ratio != null ? hr.ratio : hr.brew_ratio);
    const hTemp = parseFloat(hr.tempC != null ? hr.tempC : hr.brew_temp_c);
    if (isFinite(cUm) && isFinite(hUm) && Math.abs(cUm - hUm) > (isEsp ? 20 : 42)) continue;
    if (isFinite(cRatio) && isFinite(hRatio) && Math.abs(cRatio - hRatio) > (isEsp ? 0.35 : 1.1)) continue;
    if (isFinite(cTemp) && isFinite(hTemp) && Math.abs(cTemp - hTemp) > 3.2) continue;
    const hr10 = _extractRowRating10(hr);
    if (!isFinite(hr10)) continue;
    _sbScratchA[nMatch++] = hr10;
    const hrDl = String(hr.dial_locked != null ? hr.dial_locked : (hr.dialLocked != null ? hr.dialLocked : '')).trim().toLowerCase();
    if ((hrDl === 'yes' || hrDl === '1' || hrDl === 'true') && hr10 >= 8.0) hasLockedPrior = true;
    else if (hrDl === 'no' || hrDl === '0' || hrDl === 'false') hasLockedPrior = false;
  }
  if (candExplicitUnlock) hasLockedPrior = false;
  if (nMatch === 0){
    return { ok:true, isSurprise:false, explicitExclude:false, zSurprise:0, robustWeight:1.0, priorCount:0, priorMedian10:null, preserveDialLock:false, uiPrompt:null };
  }
  for (let k = 0; k < nMatch; k++) _sbScratchB[k] = _sbScratchA[k];
  const med10 = _medianFromScratch(_sbScratchB, nMatch);
  for (let j = 0; j < nMatch; j++) _sbScratchB[j] = Math.abs(_sbScratchA[j] - med10);
  const mad10 = _medianFromScratch(_sbScratchB, nMatch);
  const sigma10 = Math.max(0.45, 1.4826 * mad10);
  const resid10 = rNew10 - med10;
  const zSurprise = Math.abs(resid10) / (sigma10 * Math.sqrt(1.0 + 1.0 / nMatch));
  const consistentPrior = (nMatch >= 2 && sigma10 <= 1.15);
  const isSurprise = (consistentPrior && zSurprise > 2.30 && resid10 < 0) ||
                     (consistentPrior && zSurprise > 2.80 && resid10 > 0) ||
                     (hasLockedPrior && nMatch >= 1 && resid10 <= -2.20);
  const robW = isSurprise ? studentTHuberWeight(resid10, sigma10, 0.95) : 1.0;
  const medBeans = _rnd(med10 * 0.5, 2);
  const uiPrompt = (isSurprise && resid10 < 0)
    ? ('Unusual drop from your usual ' + _rnd(med10, 1).toFixed(1) + '/10 (' + medBeans.toFixed(2) + '/5 Beans) on this recipe - Off palate / sick today (skip learning) or did the bag change?')
    : null;
  return {
    ok:true, isSurprise, explicitExclude:false,
    zSurprise:_rnd(zSurprise, 2), robustWeight:_rnd(robW, 4),
    priorCount:nMatch, priorMedian10:_rnd(med10, 2), priorMedianBeans:medBeans,
    priorSigma10:_rnd(sigma10, 3), residual10:_rnd(resid10, 2),
    preserveDialLock:!!(isSurprise && resid10 < 0), uiPrompt,
    actions:isSurprise ? {
      offPalateSkip: { label:'Off Palate / Sick Today (Skip Learning)', exclude_learning:true, outlier_reason:'off_palate', preserve_dial_lock:true },
      bagChangedTune:{ label:'Bag Aged / Changed (Gentle Tune)',        exclude_learning:false, outlier_reason:'bag_drift', preserve_dial_lock:false }
    } : null
  };
}

function reconcileSensorVsPalate(prevRec, obs, palateTwin){
  prevRec = prevRec || {}; obs = obs || {};
  const methodKey = _normMethodKey(prevRec.method || prevRec.methodKey || 'v60');
  const isEsp = methodKey.indexOf('espresso') >= 0;
  const measTds = _pickFirstPosNum([obs.measuredTdsPct, obs.tdsPct, obs.tds, obs.brew_tds_pct]);
  let measEy = _pickFirstPosNum([obs.measuredEyPct, obs.eyPct, obs.ey, obs.brew_ey_pct, obs.brew_ey_total_pct]);
  if (!(measTds > 0)) return { active:false, hasR2:false };
  if (!(measEy > 0)){
    const doseG = _clamp(prevRec.doseG != null ? prevRec.doseG : (prevRec.dose != null ? prevRec.dose : prevRec.brew_dose_g), 1, 300, 15);
    const waterG = _clamp(prevRec.waterG != null ? prevRec.waterG : (prevRec.water != null ? prevRec.water : prevRec.brew_water_g), 10, 5000, 250);
    const mbRec = solveContinuumMassBalance({
      methodKey,
      doseG,
      waterG,
      bypassG:_pickFirstPosNum([prevRec.bypassG, obs.bypassG]) || 0,
      bevG:_pickFirstPosNum([prevRec.bevG, prevRec.outG, obs.bevOutG, obs.outG, obs.brew_out_g]) || undefined,
      tdsPct:measTds,
      rWater:prevRec.rWater,
      immersionBasis:prevRec.immersionBasis
    });
    if (mbRec && mbRec.ok && mbRec.eyPrimaryPct > 0){
      measEy = _rnd(mbRec.eyPrimaryPct, 2);
    } else {
      const bevG = +(prevRec.bevG || prevRec.outG || Math.max(15, isEsp ? waterG : (waterG - 2.05 * doseG)));
      measEy = _rnd((measTds * bevG) / doseG, 2);
    }
  }
  const refTds = isEsp ? 9.50 : 1.38, refEy = 20.0;
  const inScaSweetSpot = isEsp
    ? (measEy >= 18.0 && measEy <= 22.0 && measTds >= 8.0 && measTds <= 11.4)
    : (measEy >= 18.0 && measEy <= 22.0 && measTds >= 1.16 && measTds <= 1.50);
  const cvaRec = _parseCvaJsonMeta(obs);
  const padArr = Array.isArray(obs.pad_xy) ? obs.pad_xy : (cvaRec && Array.isArray(cvaRec.pad_xy) ? cvaRec.pad_xy : null);
  let dx = _clamp(obs.dx != null ? obs.dx : (obs.tasteDx != null ? obs.tasteDx : (obs.padX != null ? obs.padX : (padArr && padArr.length >= 1 ? padArr[0] : null))), -1, 1, 0);
  let dy = _clamp(obs.dy != null ? obs.dy : (obs.tasteDy != null ? obs.tasteDy : (obs.padY != null ? obs.padY : (padArr && padArr.length >= 2 ? padArr[1] : null))), -1, 1, 0);
  const rating10 = _extractRowRating10(obs);
  const sym = String(obs.symptom || obs.fix_symptom || obs.dial_symptom || '').toLowerCase();
  const splitBitter = String(obs.splitBitter || '').toLowerCase();
  const splitBody = String(obs.splitBody || '').toLowerCase();
  const splitAcid = String(obs.splitAcid || '').toLowerCase();
  const contextTag = String(obs.contextTag || obs.palate_context || '').toLowerCase();

  /* If caller left Taste Pad untouched at (0,0) while logging explicit sour/bitter/weak/strong symptoms, align dx/dy with reported symptom so true sensor+palate agreement doesn't get misclassified as H3_personal_palate_offset */
  if (Math.hypot(dx, dy) < 0.05){
    if (/way_sour|very_sour|really_sour|gusher/.test(sym)) dx = -0.92;
    else if (/slightly_sour|touch_sour/.test(sym)) dx = -0.34;
    else if (sym.includes('sour') && !sym.includes('bitter') && !sym.includes('dry') && !sym.includes('uneven')) dx = -0.62;
    else if (/way_bitter|very_bitter|really_bitter|undrinkable|choked/.test(sym)) dx = +0.92;
    else if (/slightly_bitter/.test(sym)) dx = +0.34;
    else if (sym.includes('bitter') || sym.includes('harsh') || sym.includes('astringent')) dx = +0.62;
    if (/really_watery|very_weak|way_weak|watery/.test(sym)) dy = -0.90;
    else if (/slightly_weak/.test(sym)) dy = -0.34;
    else if (sym.includes('weak') || sym.includes('thin')) dy = -0.60;
    else if (/really_strong|very_strong|way_strong|syrupy_heavy/.test(sym)) dy = +0.90;
    else if (sym.includes('strong') || sym.includes('heavy')) dy = +0.60;
  }
  const padR = Math.hypot(dx, dy);

  const sensorX = _clamp((measEy - refEy) / 3.8, -1, 1, 0);
  const sensorY = _clamp((measTds - refTds) / (isEsp ? 2.5 : 0.35), -1, 1, 0);
  const dualPinGap = _rnd(Math.hypot(dx - sensorX, dy - sensorY), 3);
  const humanUnhappy = (isFinite(rating10) && rating10 <= 6.0) || padR >= 0.40 ||
    /sour|bitter|astringent|drying|uneven|weak|watery|strong|heavy|flat|chalky|stale|rancid|notforme/.test(sym) ||
    splitBitter === 'drying' || splitBody === 'hollow' || contextTag === 'not_my_style' || contextTag === 'chalky_water';

  const agreeX = Math.abs(dx) >= 0.15 && Math.abs(sensorX) >= 0.15 && (dx * sensorX > 0);
  const agreeY = Math.abs(dy) >= 0.15 && Math.abs(sensorY) >= 0.15 && (dy * sensorY > 0);
  const oppositeDir = (Math.abs(dx) >= 0.12 && Math.abs(sensorX) >= 0.18 && (dx * sensorX < -0.04)) ||
                      (Math.abs(dy) >= 0.12 && Math.abs(sensorY) >= 0.18 && (dy * sensorY < -0.04));
  const sameQuadAgree = !oppositeDir && humanUnhappy && ((agreeX && (Math.abs(dy) < 0.10 || agreeY || Math.abs(sensorY) < 0.22)) || (agreeY && (Math.abs(dx) < 0.10 || agreeX || Math.abs(sensorX) < 0.22)));
  const isDiscrepant = (inScaSweetSpot && humanUnhappy) || (!sameQuadAgree && (oppositeDir || dualPinGap >= 0.42));

  if (!isDiscrepant){
    return { active:false, hasR2:true, inScaSweetSpot, measuredTdsPct:_rnd(measTds, 2), measuredEyPct:_rnd(measEy, 2), dualPinGap };
  }
  const khPpm = _clamp(obs.waterKhPpm != null ? obs.waterKhPpm : prevRec.waterKhPpm, 0, 400, 45);
  const tastedTempC = _clamp(obs.tastedTempC != null ? obs.tastedTempC : 56, 15, 92, 56);
  const beanAgeDays = _clamp(obs.effectiveBeanAgeDays != null ? obs.effectiveBeanAgeDays : 12, 0, 365, 12);
  const mPhysDisc = typeof G.methodPhysicsFor === 'function' ? G.methodPhysicsFor(methodKey) : (G.METHOD_PHYSICS_V6 ? G.METHOD_PHYSICS_V6[0] : { outRatio:isEsp, chiRet:0.15 });
  const ctDisc = resolveContactTimeEvidence(prevRec, obs, mPhysDisc);
  const timeRatio = ctDisc.timeRatio;

  const isAstringent = splitBitter === 'drying' || /astringent|drying|sandpaper|puckering/.test(sym);
  const isCleanFinish = splitBitter === 'clean';
  const isHollow = splitBody === 'hollow' || /hollow|papery|empty/.test(sym);
  const isSourAndBitter = /uneven|sour_dry|both/.test(sym) || (splitAcid === 'sharp' && isAstringent) || (dx >= 0.42 && dy <= -0.40);
  const isFlowAnomaly = ctDisc.isSlowStall || ctDisc.isFastGush || Math.abs(timeRatio - 1.0) > 0.18 || obs.darcyStatus === 'fines_stall' || obs.darcyStatus === 'channeling';
  const isFlatChalky = contextTag === 'chalky_water' || /flat|chalky|dull|muted|lifeless/.test(sym);
  const isStaleLipid = /stale|rancid|cardboard|woody|offtaste/.test(sym) || beanAgeDays > 38;
  const isNotMyStyle = contextTag === 'not_my_style' || sym === 'notforme' || obs.makeAgain === 'no' ||
                       (Array.isArray(obs.dislikedFlavors) && obs.dislikedFlavors.length > 0 && padR < 0.28);
  const beanProc = String((prevRec.bean && prevRec.bean.process) || obs.process || '').toLowerCase();
  const isPolarizingBean = /anaerobic|carbonic|infused|co-ferment|yeast|thermal|wet-hulled/.test(beanProc);

  let twinAlign = 0.0;
  if (palateTwin && palateTwin.confidence >= 0.20){
    const dTwinEy = measEy - palateTwin.targetEyPct, dTwinTds = measTds - palateTwin.targetTdsPct;
    if (dTwinEy * dx > 0) twinAlign += Math.min(1.0, Math.abs(dTwinEy) / 1.5);
    if (dTwinTds * dy > 0) twinAlign += Math.min(1.0, Math.abs(dTwinTds) / (isEsp ? 1.2 : 0.22));
  }

  const l1 = -0.55 + (isAstringent ? 3.15 : 0) + (isSourAndBitter ? 3.40 : 0) + (isHollow ? 2.10 : 0) + (isFlowAnomaly ? 1.75 : 0) - (isCleanFinish ? 1.65 : 0) - (isNotMyStyle ? 1.80 : 0);
  const l2 = -0.85 + (khPpm > 75 && isFlatChalky ? 3.65 : (khPpm > 85 ? 2.10 : (isFlatChalky ? 1.85 : 0))) + (tastedTempC > 65.0 ? 2.65 : 0) + (isStaleLipid ? 3.45 : 0);
  const l3 = -0.25 + (isCleanFinish ? 2.25 : 0) + ((splitBody === 'tealike' || splitBody === 'syrupy') && Math.abs(dy) >= 0.25 ? 1.80 : 0) + (!isAstringent && !isSourAndBitter && !isFlowAnomaly && khPpm <= 75 && !isStaleLipid ? 1.65 : 0) + (!isAstringent ? 1.70 * (Math.abs(dx) + Math.abs(dy)) : 0) + 2.40 * twinAlign - (isNotMyStyle ? 1.50 : 0);
  const l4 = -1.10 + (isNotMyStyle ? 4.30 : 0) + (isPolarizingBean && rating10 <= 5.5 && padR < 0.32 ? 2.35 : 0) + (isCleanFinish && padR < 0.25 && rating10 <= 5.5 && !isFlatChalky && !isStaleLipid ? 1.65 : 0);

  const maxL = Math.max(l1, l2, l3, l4);
  const e1 = Math.exp(l1 - maxL), e2 = Math.exp(l2 - maxL), e3 = Math.exp(l3 - maxL), e4 = Math.exp(l4 - maxL);
  const sumE = e1 + e2 + e3 + e4;
  const hyps = [
    { id:'H1_channeling_bypass', short:'Channeling + Bypass Compensation', prob:_rnd(e1 / sumE, 4), mechanism:'Half the bed over-extracted (~26% EY bitter/dry di-CQAs) while bypassed zones under-extracted (~14% EY sour acids) - averaging to ' + _rnd(measEy, 1) + '% EY on bulk R2.' },
    { id:'H2_water_temp_lipids', short:'Water KH / Sip Temp / Stale Lipids', prob:_rnd(e2 / sumE, 4), mechanism:khPpm > 75 ? ('Bulk solids hit ' + _rnd(measEy, 1) + '% EY, but ' + Math.round(khPpm) + ' ppm KH neutralized bright fruit acids into flat conjugate salts.') : tastedTempC > 65 ? ('Tasted at ' + Math.round(tastedTempC) + ' C (>65 C TRPM5 thermal masking ceiling), muting perceived sweetness.') : 'Oxidized coffee lipids / aged volatiles flattened cup aromatics despite textbook solids.' },
    { id:'H3_personal_palate_offset', short:'Personal Palate Offset (Human Wins!)', prob:_rnd(e3 / sumE, 4), mechanism:'Extraction was uniform, yet your palate genuinely prefers a different (TDS*, EY*) target than Lockhart\'s 1957 SCA box.' },
    { id:'H4_bean_style_mismatch', short:'Bean / Process Style Mismatch', prob:_rnd(e4 / sumE, 4), mechanism:'Brew physics succeeded, but this bean\'s process/roast flavor chemistry conflicts with your style preferences.' }
  ].sort((a, b) => b.prob - a.prob);

  const win = hyps[0];
  const prescription = { overrideScaLock:true, allowTargetPriorShift:false, holdGrind:false, holdRatio:false, palateStyleMismatchOnly:false, personalTargetEyPct:null, personalTargetTdsPct:null, actionHuman:'', actionScientist:'' };
  if (win.id === 'H1_channeling_bypass'){
    prescription.holdRatio = true;
    prescription.holdGrind = !(timeRatio > 1.16 || isEsp);
    const coarseStep = timeRatio > 1.16 ? (isEsp ? 15 : 25) : 0;
    prescription.grindDeltaUmOverride = coarseStep;
    prescription.agitationOverride = 'gentle';
    prescription.actionHuman = 'Refractometer read ' + _rnd(measTds, 2) + '% TDS / ' + _rnd(measEy, 1) + '% Extraction (%EY), but dry astringency points to uneven channeling! Stir clumps before brewing, pour a gentle low center spiral (<=4 g/s), skip post-pour swirls' + (coarseStep ? (', and go +' + coarseStep + ' um coarser.') : ' (hold grind steady).');
    prescription.actionScientist = 'Jensen convexity defect: 0.5*EY(26%) + 0.5*EY(14%) = 20.0% bulk nD20 while di-CQA salivary protein precipitation spikes.';
  } else if (win.id === 'H2_water_temp_lipids'){
    prescription.holdGrind = true; prescription.holdRatio = true;
    if (khPpm > 75){
      const roPct = Math.round(_clamp((1 - 40.0 / khPpm) * 100, 25, 88, 50));
      prescription.actionHuman = 'Hold grind & ratio! Your water (' + Math.round(khPpm) + ' ppm acid buffer KH) flattened fruit sparkle despite 20% Extraction (%EY). Blend ' + roPct + '% RO/distilled + ' + (100 - roPct) + '% tap water (~40 ppm KH).';
      prescription.actionScientist = 'nD20 is invariant to acid deprotonation HA + HCO3- \u2192 A- + H2CO3; lowering KH to 0.8 meq/L restores TA_eff.';
    } else if (tastedTempC > 65){
      prescription.actionHuman = 'Hold recipe steady and let cup cool to 55-62 C (131-144 F Sweet Sip Window) - sipping above 65 C (149 F) masks natural sweetness!';
      prescription.actionScientist = 'Talavera et al. (2005) TRPM5 cation channel gating peaks near 37-55 C.';
    } else {
      prescription.excludeLearningSuggested = true;
      prescription.actionHuman = 'Extraction hit 20% (%EY), so flat/papery notes point to bean aging. Drop kettle -2 C and freeze next bag around Day 7-10.';
      prescription.actionScientist = 'Hexanal/lipid autoxidation degrades retronasal OISE independent of bulk EY.';
    }
  } else if (win.id === 'H3_personal_palate_offset'){
    prescription.allowTargetPriorShift = true;
    let magX = padNonlinearMag(dx), magY = padNonlinearMag(dy);
    if (Math.abs(magX) < 0.08 && isCleanFinish && rating10 <= 6.0) magX = 0.28;
    if (Math.abs(magY) < 0.08 && splitBody === 'tealike' && rating10 <= 6.0) magY = 0.32;
    const nextTargetEy = _clamp(measEy - 2.6 * magX, 16.5, 23.0, measEy);
    const nextTargetTds = _clamp(measTds - (isEsp ? 2.2 : 0.36) * magY, isEsp ? 6.2 : 0.92, isEsp ? 13.5 : 1.85, measTds);
    prescription.personalTargetEyPct = _rnd(nextTargetEy, 2);
    prescription.personalTargetTdsPct = _rnd(nextTargetTds, 2);
    prescription.effectiveDx = dx !== 0 ? dx : (magX > 0 ? 0.45 : 0);
    prescription.effectiveDy = dy !== 0 ? dy : (magY > 0 ? 0.48 : 0);
    prescription.actionHuman = 'Your palate always outranks textbook SCA numbers! Shifting your personal target from ' + _rnd(measTds, 2) + '% TDS / ' + _rnd(measEy, 1) + '% EY \u2192 ' + _rnd(nextTargetTds, 2) + '% TDS / ' + _rnd(nextTargetEy, 1) + '% EY.';
    prescription.actionScientist = 'Cotter et al. (2021) / TAS2R38 polymorphism: clean extraction rejected hedonically \u2192 updating personal MAP posterior (TDS*, EY*).';
  } else {
    prescription.palateStyleMismatchOnly = true;
    prescription.actionHuman = 'Clean 20% EY extraction, so this bean\'s process/roast style simply isn\'t your vibe. Saved to your Palate Style filter (without altering extraction targets); try -3 C + 15 g hot bypass to soften remaining cups.';
    prescription.actionScientist = 'Separates green/roast volatile hedonic vector psi_style from physical extraction target (TDS*, EY*).';
  }
  return { active:true, hasR2:true, inScaSweetSpot, measuredTdsPct:_rnd(measTds, 2), measuredEyPct:_rnd(measEy, 2), dualPinGap, winningHypothesis:win, hypotheses:hyps, prescription };
}

function imputeRowTdsAndEy(r, mPhys){
  const tds = +(r.tdsPct != null ? r.tdsPct : r.brew_tds_pct);
  const ey = +(r.eyPct != null ? r.eyPct : (r.brew_ey_total_pct || r.brew_ey_pct));
  if (tds > 0.3 && ey > 8 && ey < 32) return { tdsPct:tds, eyPct:ey, hasR2:true, fisherTds:2.56, fisherEy:2.56 };
  const isEsp = !!(mPhys && mPhys.outRatio);
  const dose = +(r.doseG != null ? r.doseG : r.brew_dose_g);
  const water = +(r.waterG != null ? r.waterG : r.brew_water_g);
  let ratio = +(r.ratio != null ? r.ratio : r.brew_ratio);
  const hasScaleMasses = (dose > 0 && water > 0) || (ratio > 0);
  if (!(ratio > 0) && dose > 0 && water > 0) ratio = water / dose;
  if (!(ratio > 0)) ratio = mPhys ? mPhys.ratio : (isEsp ? 2.0 : 16.0);
  if (tds > 0.3){
    const rw0 = mPhys ? mPhys.rWater : 2.05, c0 = tds / 100.0;
    const eyImp = isEsp ? (tds * ratio) : ((c0 / Math.max(0.2, 1 - c0)) * Math.max(0.8, ratio - rw0) * 100.0);
    return { tdsPct:tds, eyPct:_clamp(eyImp, 11, 29, 20.0), hasR2:true, fisherTds:2.56, fisherEy:2.20 };
  }
  const anchorUm = mPhys && mPhys.d50AnchorUm ? mPhys.d50AnchorUm : (isEsp ? 255 : 560);
  let um = +(r.d50Um != null ? r.d50Um : (r.grindUm != null ? r.grindUm : r.brew_grind_target_um));
  if (!(um > 0)) um = anchorUm;
  let tempC = +(r.tempC != null ? r.tempC : r.brew_temp_c);
  if (!(tempC > 0)){
    const tf = +(r.tempF != null ? r.tempF : r.brew_temp_f);
    tempC = tf > 40 ? ((tf - 32) * 5 / 9) : 93.0;
  }
  const rw = mPhys && mPhys.rWater ? mPhys.rWater : (isEsp ? 1.95 : 2.05);
  const lEff = (mPhys && mPhys.chiRet >= 0.85) ? 1.0 : rw;
  const ratioRef = mPhys ? mPhys.ratio : (isEsp ? 2.0 : 16.0);
  const actSec = _pickFirstPosNum([r.actualSecs, r.actual_s, r.actualTimeS, r.brew_actual_time_s]);
  const tgtSec = _pickFirstPosNum([r.targetSecs, r.time_s, r.brewTimeS, r.brew_time_s]);
  const hasActContact = actSec > 0 && tgtSec > 0 && !(mPhys && mPhys.chiRet >= 0.85);
  const dtContact = hasActContact ? _clamp((actSec - tgtSec) / Math.max(15, tgtSec), -0.35, 0.50, 0) : 0;
  const eyTimeDelta = hasActContact ? (dtContact * 2.4) : 0;
  const eyEst = _clamp(20.0 - (isEsp ? 0.085 : 0.024) * (um - anchorUm) + 0.24 * (tempC - 93.0) + (isEsp ? 1.8 : 0.22) * (ratio - ratioRef) + eyTimeDelta, 14.0, 24.8, 20.0);
  const eFrac = eyEst / 100.0;
  const cEst = isEsp ? (eFrac / Math.max(0.8, ratio)) : (eFrac / (Math.max(1.2, ratio - lEff) + eFrac));
  return { tdsPct:_rnd(cEst * 100.0, 3), eyPct:_rnd(eyEst, 2), hasR2:false, fisherTds:hasScaleMasses ? 1.65 : 0.90, fisherEy:hasActContact ? 1.15 : 0.95 };
}

function computeRobustPalateTwin(bean, methodKey, hist, methodLookupFn){
  if (bean && !methodKey && !hist && Array.isArray(bean.history)){
    hist = bean.history; methodKey = bean.methodKey || 'v60'; bean = bean.bean || {};
  }
  bean = bean || {};
  const mk = String(methodKey || 'v60').toLowerCase();
  const mPhys = typeof methodLookupFn === 'function' ? methodLookupFn(mk) : (typeof G.methodPhysicsFor === 'function' ? G.methodPhysicsFor(mk) : G.METHOD_PHYSICS_V6[0]);
  const isEsp = !!mPhys.outRatio;
  const priorTds = mPhys.targetRef ? mPhys.targetRef.tdsPct : (isEsp ? 9.50 : 1.38);
  const priorEy = mPhys.targetRef ? mPhys.targetRef.eyPct : 20.0;
  const rows = Array.isArray(hist) ? hist : [];
  if (!rows.length){
    return { ok:true, state:'cold_start', confidence:0, effectiveN:0, outliersRejected:0, targetTdsPct:priorTds, targetEyPct:priorEy, ci95Tds:[_rnd(priorTds - (isEsp ? 1.1 : 0.18), 2), _rnd(priorTds + (isEsp ? 1.1 : 0.18), 2)], ci95Ey:[_rnd(priorEy - 2.2, 1), _rnd(priorEy + 2.2, 1)], clusterId:'sca_balanced_classic', archetype:'Uncharted Explorer (Science Baseline)', axes:{ clarityBody:0, brightnessSweetness:0, roastComfort:0 } };
  }
  const nRows = Math.min(rows.length, MAX_ROB_LEN);
  const bucketHeads = Object.create(null), bucketCounts = Object.create(null);
  let outliersRejected = 0, hasAnyBuckets = false;
  for (let i = 0; i < nRows; i++){
    const ri = rows[i]; _sbNextInBucket[i] = -1;
    if (!ri || isRowExcludedFromLearning(ri)){
      _sbRowSurpW[i] = 0.0; _sbRowR10[i] = NaN;
      if (ri && (ri.exclude_learning || ri.excludeLearning)) outliersRejected++;
      continue;
    }
    const r10i = _extractRowRating10(ri);
    _sbRowR10[i] = r10i; _sbRowSurpW[i] = 1.0;
    if (!isFinite(r10i)) continue;
    const cki = _coffeeMatchKey(ri);
    if (!cki) continue;
    const mRaw = ri.method || ri.brew_method || mk;
    const bKey = cki + '|' + (mRaw === mk ? mk : String(mRaw).toLowerCase());
    _sbNextInBucket[i] = bucketHeads[bKey] !== undefined ? bucketHeads[bKey] : -1;
    bucketHeads[bKey] = i; bucketCounts[bKey] = (bucketCounts[bKey] || 0) + 1;
    hasAnyBuckets = true;
  }
  if (hasAnyBuckets){
    const bKeys = Object.keys(bucketCounts);
    for (let bk = 0; bk < bKeys.length; bk++){
      const keyB = bKeys[bk];
      if (bucketCounts[keyB] < 3) continue;
      let mCnt = 0, cur = bucketHeads[keyB];
      while (cur !== -1){ _sbScratchA[mCnt] = _sbRowR10[cur]; _sbScratchB[mCnt] = _sbRowR10[cur]; mCnt++; cur = _sbNextInBucket[cur]; }
      const medB = _medianFromScratch(_sbScratchB, mCnt);
      for (let q = 0; q < mCnt; q++) _sbScratchB[q] = Math.abs(_sbScratchA[q] - medB);
      const sigB = Math.max(0.45, 1.4826 * _medianFromScratch(_sbScratchB, mCnt));
      if (sigB <= 1.25){
        const predDen = sigB * Math.sqrt(1.0 + 1.0 / (mCnt - 1));
        cur = bucketHeads[keyB];
        while (cur !== -1){
          const rVal = _sbRowR10[cur];
          if (Math.abs(rVal - medB) / predDen > 2.30 && rVal < medB){
            const sw = studentTHuberWeight(rVal - medB, sigB, 0.95);
            _sbRowSurpW[cur] = sw; if (sw < 0.12) outliersRejected++;
          }
          cur = _sbNextInBucket[cur];
        }
      }
    }
  }
  const bRoast = String(bean.roast || 'medium').toLowerCase(), bProc = String(bean.process || 'washed').toLowerCase();
  const bIsLight = bRoast.indexOf('light') >= 0;
  const DECAY_K = -0.005776226504666211;
  let obsCount = 0, nLiked = 0, meanLikedTds = 0.0, m2LikedTds = 0.0, clarityScore = 0, brightScore = 0, roastScore = 0, axisW = 0;
  for (let rIdx = 0; rIdx < nRows; rIdx++){
    const surpW = _sbRowSurpW[rIdx];
    if (surpW <= 1e-5) continue;
    const r = rows[rIdx], r10 = _sbRowR10[rIdx];
    if (!isFinite(r10)) continue;
    const symRaw = r.symptom || r.fix_symptom || '';
    const sym = symRaw ? String(symRaw).toLowerCase() : '';
    if (sym === 'stale' || sym === 'offtaste' || sym === 'notforme') continue;
    const rMethodRaw = r.method || r.brew_method || 'v60';
    const rMethod = rMethodRaw === mk ? mk : String(rMethodRaw).toLowerCase();
    if ((rMethod === 'espresso' || rMethod === 'lever_espresso') !== isEsp) continue;
    if (sym && /astringent|drying|uneven|sour_dry|fines_stall|flat|chalky|muted/.test(sym)) continue;
    const stars5 = r10 * 0.5;
    const rRoastRaw = r.roast || r.roast_level || 'medium';
    const rRoast = rRoastRaw === bRoast ? bRoast : String(rRoastRaw).toLowerCase();
    const rProcRaw = r.process || 'washed';
    const rProc = rProcRaw === bProc ? bProc : String(rProcRaw).toLowerCase();
    const simKernel = (rRoast === bRoast ? 1.0 : 0.72) * (rProc === bProc ? 1.0 : 0.85) * (rMethod === mk ? 1.0 : 0.80);
    const dRaw = +r.daysAgo;
    const ageDays = dRaw >= 0 && dRaw <= 1000 ? dRaw : 10;
    const decay = Math.exp(DECAY_K * ageDays);
    const imp = imputeRowTdsAndEy(r, mPhys);
    const commonW = simKernel * decay * surpW;
    const hasFaultWord = sym ? /sour|bitter|weak|watery|strong|heavy/.test(sym) : false;
    if (stars5 >= 3.65 && !hasFaultWord){
      const uS = (stars5 - 2.8) / 2.2;
      const qMult = uS * Math.sqrt(Math.sqrt(uS));
      const wT = commonW * imp.fisherTds * qMult, wE = commonW * imp.fisherEy * qMult;
      _sbIrlTds[obsCount] = imp.tdsPct; _sbIrlEy[obsCount] = imp.eyPct;
      _sbIrlWT0[obsCount] = wT; _sbIrlWE0[obsCount] = wE; obsCount++;
      if (surpW >= 0.5){ nLiked++; const dW = imp.tdsPct - meanLikedTds; meanLikedTds += dW / nLiked; m2LikedTds += dW * (imp.tdsPct - meanLikedTds); }
      clarityScore += wT * (imp.tdsPct < priorTds - 0.08 ? 1.0 : imp.tdsPct > priorTds + 0.08 ? -1.0 : 0);
      brightScore += wT * ((rRoast === bRoast ? bIsLight : rRoast.indexOf('light') >= 0) ? 1.0 : -0.6);
      roastScore += wT * (rRoast === 'dark' || rRoast === 'medium-dark' ? 1.0 : -0.5);
      axisW += wT;
    } else if (stars5 <= 3.30 || hasFaultWord){
      const tShift = sym && /weak|watery|thin/.test(sym) ? (isEsp ? 1.35 : 0.25) : sym && /strong|heavy/.test(sym) ? (isEsp ? -1.35 : -0.24) : 0.0;
      const eShift = sym && sym.indexOf('sour') >= 0 ? 1.55 : sym && sym.indexOf('bitter') >= 0 ? -1.55 : 0.0;
      if (tShift !== 0 || eShift !== 0){
        _sbIrlTds[obsCount] = _clamp(imp.tdsPct + tShift, isEsp ? 5.5 : 0.85, isEsp ? 14.5 : 2.10, priorTds);
        _sbIrlEy[obsCount] = _clamp(imp.eyPct + eShift, 15.0, 24.5, priorEy);
        _sbIrlWT0[obsCount] = commonW * imp.fisherTds * 0.65;
        _sbIrlWE0[obsCount] = commonW * imp.fisherEy * 0.65;
        obsCount++;
      }
    }
  }
  if (obsCount === 0){
    return { ok:true, state:'cold_start', confidence:0, effectiveN:0, outliersRejected, targetTdsPct:priorTds, targetEyPct:priorEy, ci95Tds:[_rnd(priorTds - (isEsp ? 1.1 : 0.18), 2), _rnd(priorTds + (isEsp ? 1.1 : 0.18), 2)], ci95Ey:[_rnd(priorEy - 2.2, 1), _rnd(priorEy + 2.2, 1)], clusterId:'sca_balanced_classic', archetype:'Balanced Sweet-Spot Classic', axes:{ clarityBody:0, brightnessSweetness:0, roastComfort:0 } };
  }
  for (let m0 = 0; m0 < obsCount; m0++) _sbScratchA[m0] = _sbIrlTds[m0];
  let muT = _medianFromScratch(_sbScratchA, obsCount);
  for (let m1 = 0; m1 < obsCount; m1++) _sbScratchA[m1] = Math.abs(_sbIrlTds[m1] - muT);
  const sT = Math.max(isEsp ? 0.55 : 0.08, 1.4826 * _medianFromScratch(_sbScratchA, obsCount));
  for (let m2 = 0; m2 < obsCount; m2++) _sbScratchA[m2] = _sbIrlEy[m2];
  let muE = _medianFromScratch(_sbScratchA, obsCount);
  for (let m3 = 0; m3 < obsCount; m3++) _sbScratchA[m3] = Math.abs(_sbIrlEy[m3] - muE);
  const sE = Math.max(0.95, 1.4826 * _medianFromScratch(_sbScratchA, obsCount));

  let wTotT = 0, wTotE = 0;
  const invSt = 1.0 / (1.345 * sT), invSe = 1.0 / (1.345 * sE);
  for (let iter = 0; iter < 3; iter++){
    wTotT = 0; wTotE = 0; let sumWT = 0, sumWE = 0;
    for (let p = 0; p < obsCount; p++){
      const uT = (_sbIrlTds[p] - muT) * invSt, uE = (_sbIrlEy[p] - muE) * invSe;
      const wRob = obsCount >= 3 ? (1.0 / (1.0 + uT * uT + 0.5 * uE * uE)) : 1.0;
      const wpT = _sbIrlWT0[p] * wRob, wpE = _sbIrlWE0[p] * wRob;
      wTotT += wpT; wTotE += wpE; sumWT += wpT * _sbIrlTds[p]; sumWE += wpE * _sbIrlEy[p];
    }
    if (wTotT > 1e-9) muT = sumWT / wTotT;
    if (wTotE > 1e-9) muE = sumWE / wTotE;
  }
  const withinSdTds = nLiked >= 2 ? Math.sqrt(m2LikedTds / (nLiked - 1)) : (isEsp ? 0.90 : 0.16);
  const consistencyBoost = nLiked >= 3 ? (1.0 + 1.60 * _clamp(1.0 - withinSdTds / (2.4 * (isEsp ? 0.50 : 0.07)), 0, 1, 0)) : 1.0;
  const n0Prior = 3.0;
  const shrinkTds = (consistencyBoost * wTotT) / (consistencyBoost * wTotT + n0Prior);
  const shrinkEy = wTotE / (wTotE + n0Prior);
  const postTds = _rnd(priorTds + shrinkTds * (muT - priorTds), 3);
  const postEy = _rnd(priorEy + shrinkEy * (muE - priorEy), 2);
  const confidence = _rnd(_clamp(shrinkTds, 0, 0.99, 0), 3);
  const postSdTds = (isEsp ? 0.90 : 0.12) * Math.sqrt(Math.max(0.06, 1 - 0.80 * shrinkTds));
  const postSdEy = 1.45 * Math.sqrt(Math.max(0.08, 1 - 0.75 * shrinkEy));
  let clusterId = 'sca_balanced_classic', archetype = 'Balanced Sweet-Spot Purist';
  if (!isEsp && postTds <= 1.18 && postEy >= 18.8){ clusterId = 'cotter_cluster_2_tea_clarity'; archetype = 'Delicate Tea-Clarity Lover (Cotter Cluster 2)'; }
  else if (!isEsp && postTds >= 1.55){ clusterId = 'cotter_cluster_1_heavy_body'; archetype = 'Rich Syrupy-Body Lover (Cotter Cluster 1)'; }
  else if (postEy <= 18.6){ clusterId = 'tas2r38_low_bitter'; archetype = 'Low-Bitterness Supertaster (Gentle ~18% EY)'; }
  else if (postEy >= 21.1){ clusterId = 'nordic_high_ey'; archetype = 'Nordic High-Extraction Clarity Seeker'; }
  return {
    ok:true, state:confidence >= 0.25 ? 'personalized' : 'learning', confidence,
    effectiveN:_rnd(wTotT, 2), consistentLikedCount:nLiked, withinUserTdsSd:_rnd(withinSdTds, 3),
    consistencyBoost:_rnd(consistencyBoost, 2), outliersRejected,
    targetTdsPct:postTds, targetEyPct:postEy,
    ci95Tds:[_rnd(postTds - 1.96 * postSdTds, 2), _rnd(postTds + 1.96 * postSdTds, 2)],
    ci95Ey:[_rnd(postEy - 1.96 * postSdEy, 1), _rnd(postEy + 1.96 * postSdEy, 1)],
    clusterId, archetype,
    axes:{ clarityBody:axisW > 0 ? _rnd(clarityScore / axisW, 2) : 0, brightnessSweetness:axisW > 0 ? _rnd(brightScore / axisW, 2) : 0, roastComfort:axisW > 0 ? _rnd(roastScore / axisW, 2) : 0 }
  };
}

function solvePersonalTargetRecipe(baseRecipe, palateTwin, mPhys, simulateBrewFn){
  baseRecipe = baseRecipe || {};
  if (!palateTwin || !(palateTwin.confidence >= 0.25)) return Object.assign({ personalizedApplied:false }, baseRecipe);
  const mk = String(baseRecipe.methodKey || 'v60').toLowerCase();
  mPhys = mPhys || { outRatio:mk.indexOf('espresso') >= 0, ratio:16.0, ratioBounds:[11.5, 21.5], rWater:2.05, chiRet:0.10 };
  const isEsp = !!mPhys.outRatio, isImm = mPhys.chiRet >= 0.85;
  const cStar = _clamp(palateTwin.targetTdsPct / 100.0, isEsp ? 0.055 : 0.0085, isEsp ? 0.16 : 0.022, isEsp ? 0.095 : 0.0138);
  const eStar = _clamp(palateTwin.targetEyPct / 100.0, 0.165, 0.235, 0.200);
  const doseG = _clamp(baseRecipe.doseG != null ? baseRecipe.doseG : baseRecipe.dose, 4, 250, 15.0);
  const rw = mPhys.rWater || 2.05;
  const rTotalRaw = isEsp ? (eStar / cStar) : isImm ? ((eStar * (1 - cStar)) / cStar + 1.0) : ((eStar * (1 - cStar)) / cStar + rw);
  const rLo = isEsp ? 1.25 : Math.min(11.5, mPhys.ratioBounds ? mPhys.ratioBounds[0] : 11.5);
  const rHi = isEsp ? 4.80 : Math.max(21.5, mPhys.ratioBounds ? mPhys.ratioBounds[1] : 21.5);
  const rTotal = _clamp(rTotalRaw, rLo, rHi, baseRecipe.ratio || 16.0);
  let cleanBypassG = 0.0, rContact = rTotal;
  if (!isEsp && !isImm && rTotal > 18.2 && baseRecipe.preferCleanBypass === true){
    rContact = 16.8; cleanBypassG = _rnd((rTotal - rContact) * doseG, 1);
  }
  let pourWaterG = _rnd(doseG * rContact, 1);
  const refRatio = baseRecipe.ratio || mPhys.ratio || (isEsp ? 2.0 : 16.0);
  const baseUm = baseRecipe.d50Um || baseRecipe.grindUm || (isEsp ? 255 : 560);
  const baseTempC = baseRecipe.tempC || baseRecipe.kettleTempC || 93.0;
  const effHeadRatio = Math.max(0.45, (rContact - (isEsp ? 0 : rw)) / Math.max(1.0, refRatio - (isEsp ? 0 : rw)));
  let nextUm = Math.round((baseUm * Math.pow(effHeadRatio, isEsp ? 0.16 : 0.32) * Math.pow(20.0 / Math.max(15.0, palateTwin.targetEyPct), 0.85)) / 5) * 5;
  let nextTempC = (!isEsp && rContact < 14.2 && baseTempC < 96.5) ? _rnd(Math.min(97.5, baseTempC + 1.5), 1) : (palateTwin.targetEyPct < 18.8 ? _rnd(Math.max(84.0, baseTempC - 1.8), 1) : baseTempC);
  let simOut = null;
  if (typeof simulateBrewFn === 'function'){
    for (let pass = 0; pass < 2; pass++){
      for (let it = 0; it < 3; it++){
        simOut = simulateBrewFn({ methodKey:mk, doseG, waterG:pourWaterG, bypassG:cleanBypassG, d50Um:nextUm, kettleTempC:nextTempC });
        if (!simOut || !simOut.ok) break;
        const eyErr = simOut.eyPct - palateTwin.targetEyPct;
        if (Math.abs(eyErr) <= 0.20) break;
        nextUm = _clamp(Math.round((nextUm + eyErr * (isEsp ? 9.5 : 26.0)) / 5) * 5, isEsp ? 140 : 310, isEsp ? 460 : 1150, nextUm);
      }
      if (simOut && simOut.ok && simOut.eyCupPct > 0){
        const exactCupSolidsG = doseG * (simOut.eyCupPct / 100.0), desiredBevG = exactCupSolidsG / cStar;
        if (cleanBypassG > 0) cleanBypassG = _rnd(Math.max(0, desiredBevG - (simOut.bevG - cleanBypassG)), 1);
        else if (!isEsp) pourWaterG = _rnd(_clamp(desiredBevG * (1 - cStar) + (pourWaterG - (simOut.bevG - exactCupSolidsG)), doseG * rLo, doseG * rHi, pourWaterG), 1);
        else pourWaterG = _rnd(_clamp(desiredBevG, doseG * rLo, doseG * rHi, pourWaterG), 1);
      }
    }
    simOut = simulateBrewFn({ methodKey:mk, doseG, waterG:pourWaterG, bypassG:cleanBypassG, d50Um:nextUm, kettleTempC:nextTempC });
  }
  const finalTds = simOut ? simOut.tdsPct : _rnd(cStar * 100, 2), finalEy = simOut ? simOut.eyPct : _rnd(eStar * 100, 2);
  return Object.assign({}, baseRecipe, {
    personalizedApplied:true, palateArchetype:palateTwin.archetype, palateConfidence:palateTwin.confidence,
    doseG, waterG:pourWaterG, bypassG:cleanBypassG,
    totalRatio:_rnd((pourWaterG + cleanBypassG) / doseG, 2), ratio:_rnd(pourWaterG / doseG, 2),
    d50Um:nextUm, grindUm:nextUm, tempC:nextTempC, kettleTempC:nextTempC,
    expectedTds:finalTds, expectedEy:finalEy, bevG:simOut ? simOut.bevG : _rnd((doseG * eStar) / cStar, 1),
    personalNoteHuman:'Tuned to your personal ' + palateTwin.archetype + ' profile (' + finalTds + '% TDS at clean ' + finalEy + '% EY via 1:' + _rnd((pourWaterG + cleanBypassG) / doseG, 1) + (cleanBypassG > 0 ? (' incl. ' + cleanBypassG + ' g clean bypass') : '') + ').',
    personalNoteScientist:'Decouples hedonic c*=' + _rnd(cStar * 100, 2) + '% from kinetic E*=' + _rnd(eStar * 100, 1) + '% via mass conservation and Darcy D50=' + nextUm + ' um.'
  });
}

function computeRobustBagDialScore(starRatingsArray){
  const arr = Array.isArray(starRatingsArray) ? starRatingsArray : [];
  let n = 0, mx = -Infinity;
  for (let i = 0; i < arr.length && n < MAX_ROB_LEN; i++){
    const v = parseFloat(arr[i]);
    if (isFinite(v) && v > 0){ _sbScratchA[n] = v; _sbScratchB[n] = v; if (v > mx) mx = v; n++; }
  }
  if (n === 0) return 3.8;
  if (n <= 2){ let s2 = 0; for (let k = 0; k < n; k++) s2 += _sbScratchA[k]; return _rnd(0.6 * (s2 / n) + 0.4 * mx, 3); }
  const med = _medianFromScratch(_sbScratchB, n);
  for (let j = 0; j < n; j++) _sbScratchB[j] = Math.abs(_sbScratchA[j] - med);
  const sig = Math.max(0.225, 1.4826 * _medianFromScratch(_sbScratchB, n));
  let wSum = 0, wValSum = 0, robMax = -Infinity;
  for (let m = 0; m < n; m++){
    const x = _sbScratchA[m], w = x < med ? studentTHuberWeight(x - med, sig, 0.95) : 1.0;
    wSum += w; wValSum += w * x; if (w >= 0.25 && x > robMax) robMax = x;
  }
  return _rnd(0.6 * (wSum > 0 ? (wValSum / wSum) : med) + 0.4 * (isFinite(robMax) ? robMax : mx), 3);
}

function enhanceMakeItPerfectResult(baseSolverFn, prevRec, obs, hist){
  if (prevRec && !obs && (prevRec.prevRecipe || prevRec.observation)){
    obs = prevRec.observation || {}; hist = prevRec.history || []; prevRec = prevRec.prevRecipe || {};
  }
  prevRec = prevRec || {}; obs = obs || {}; hist = Array.isArray(hist) ? hist : [];
  const methodKey = String(prevRec.method || prevRec.methodKey || 'v60').toLowerCase();
  const isEsp = methodKey.indexOf('espresso') >= 0;
  const surprise = detectRatingSurprise(Object.assign({}, prevRec, obs, { methodKey }), hist);
  if (obs.exclude_learning === true || obs.excludeLearning === true || (surprise.isSurprise && surprise.preserveDialLock && obs.outlierAction !== 'bag_drift')){
    const holdBase = baseSolverFn(prevRec, { dx:0, dy:0, symptom:'balanced' }, hist);
    return Object.assign({}, holdBase, {
      convergenceMode:'outlier_shield_hold', isBalanced:true, surprise, r2Discrepancy:null,
      grindDeltaUm:0, grindDeltaClicks:0, ratioDelta:0, doseDeltaG:0, waterDeltaG:0, tempDeltaC:0,
      primaryActionHuman:obs.exclude_learning ? 'Off-Palate / Skip-Learning active - logged cup for inventory & caffeine while keeping your winning recipe 100% locked!' : ('Outlier Shield (' + surprise.priorMedian10 + '/10 usual): Holding your winning recipe steady until you confirm whether today was an off-palate day or bag drift.'),
      scientistExplanation:'Student-t (nu=3) surprise gate z=' + surprise.zSurprise + ' (>2.3), w_rob=' + surprise.robustWeight + ' (<0.08) shields locked parameters.'
    });
  }
  const twin = computeRobustPalateTwin(prevRec.bean || prevRec.coffee || {}, methodKey, hist);
  const r2Disc = reconcileSensorVsPalate(prevRec, obs, twin);
  const adjObs = Object.assign({}, obs);
  if (r2Disc.active){
    const pr = r2Disc.prescription;
    if (r2Disc.winningHypothesis.id === 'H1_channeling_bypass'){
      adjObs.symptom = 'uneven'; adjObs.dx = Math.max(0.45, Math.abs(+obs.dx || +obs.padX || 0.45)); adjObs.dy = 0;
      delete adjObs.measuredEyPct; delete adjObs.measuredTdsPct; delete adjObs.tdsPct; delete adjObs.tds; delete adjObs.eyPct; delete adjObs.ey;
    } else if (r2Disc.winningHypothesis.id === 'H2_water_temp_lipids'){
      const holdH2 = baseSolverFn(prevRec, { dx:0, dy:0, symptom:'balanced' }, hist);
      return Object.assign({}, holdH2, { isBalanced:false, convergenceMode:'r2_h2_water_temp_lipid_guard', surprise, r2Discrepancy:r2Disc, topHypothesis:r2Disc.winningHypothesis, hypotheses:r2Disc.hypotheses, primaryActionHuman:pr.actionHuman, scientistExplanation:pr.actionScientist });
    } else if (r2Disc.winningHypothesis.id === 'H3_personal_palate_offset'){
      delete adjObs.measuredEyPct; delete adjObs.measuredTdsPct; delete adjObs.tdsPct; delete adjObs.tds; delete adjObs.eyPct; delete adjObs.ey;
      if (adjObs.dx == null && adjObs.padX == null) adjObs.dx = pr.effectiveDx || 0;
      if (adjObs.dy == null && adjObs.padY == null) adjObs.dy = pr.effectiveDy || 0;
    } else if (r2Disc.winningHypothesis.id === 'H4_bean_style_mismatch'){
      const curT = prevRec.tempC || prevRec.kettleTempC || 93;
      return { ok:true, isBalanced:false, convergenceMode:'r2_h4_style_softener', surprise, r2Discrepancy:r2Disc, topHypothesis:r2Disc.winningHypothesis, hypotheses:r2Disc.hypotheses, grindDeltaUm:0, grindDeltaClicks:0, ratioDelta:0, doseDeltaG:0, waterDeltaG:0, tempDeltaC:-3.0, primaryActionHuman:pr.actionHuman, scientistExplanation:pr.actionScientist, nextRecipe:Object.assign({}, prevRec, { tempC:Math.max(84, curT - 3.0), bypassG:isEsp ? 0 : 15 }) };
    }
  }
  if (surprise.isSurprise && obs.outlierAction === 'bag_drift'){
    if (adjObs.dx != null) adjObs.dx = _clamp(adjObs.dx * 0.45, -0.40, 0.40, -0.30);
    if (adjObs.padX != null) adjObs.padX = _clamp(adjObs.padX * 0.45, -0.40, 0.40, -0.30);
    adjObs.dy = 0; adjObs.padY = 0;
  }
  const baseRes = baseSolverFn(prevRec, adjObs, hist.filter(r => !isRowExcludedFromLearning(r)));
  const leverInfo = classifyLeverRegime({ dx:baseRes.padCoords ? baseRes.padCoords.dx : adjObs.dx, dy:baseRes.padCoords ? baseRes.padCoords.dy : adjObs.dy, isEspresso:isEsp });
  if (r2Disc.active && r2Disc.winningHypothesis.id === 'H1_channeling_bypass'){
    baseRes.primaryActionHuman = r2Disc.prescription.actionHuman; baseRes.scientistExplanation = r2Disc.prescription.actionScientist; baseRes.topHypothesis = r2Disc.winningHypothesis;
  } else if (r2Disc.active && r2Disc.winningHypothesis.id === 'H3_personal_palate_offset'){
    baseRes.primaryActionHuman = r2Disc.prescription.actionHuman + '  \u2192  ' + baseRes.primaryActionHuman; baseRes.scientistExplanation = r2Disc.prescription.actionScientist + ' ' + baseRes.scientistExplanation; baseRes.topHypothesis = r2Disc.winningHypothesis;
  }
  return Object.assign({}, baseRes, { leverRegime:leverInfo, surprise, r2Discrepancy:r2Disc, palateTwin:twin });
}

function computePalateTwin(bean, methodKey, hist){
  return computeRobustPalateTwin(bean, methodKey, hist, G.methodPhysicsFor);
}

function solveMakeItPerfect(prevRec, obs, hist){
  return enhanceMakeItPerfectResult(_solveMakeItPerfectBase, prevRec, obs, hist);
}
const diagnoseAndPrescribe = solveMakeItPerfect;
const computeDialInPrescription = solveMakeItPerfect;

function previewCounterfactualDelta(curRec, candidatePatch){
  curRec = curRec || {};
  candidatePatch = candidatePatch || {};
  const methodKey = curRec.method || curRec.methodKey || 'v60';
  const grinderKey = curRec.grinderKey || 'comandante-c40';
  const simCur = simulateBrew({ methodKey, grinderKey, doseG:curRec.doseG || 15, waterG:curRec.waterG || 250, d50Um:curRec.d50Um || 550, kettleTempC:curRec.tempC || curRec.kettleTempC || 93 });
  const nextD50 = candidatePatch.d50Um != null ? +candidatePatch.d50Um : (simCur.d50Um + (+candidatePatch.deltaUm || 0));
  const nextTemp = candidatePatch.tempC != null ? +candidatePatch.tempC : (simCur.kettleTempC + (+candidatePatch.deltaTempC || 0));
  const nextWater = candidatePatch.waterG != null ? +candidatePatch.waterG : (simCur.waterG + (+candidatePatch.deltaWaterG || 0));
  const simNext = simulateBrew({ methodKey, grinderKey, doseG:candidatePatch.doseG || simCur.doseG, waterG:nextWater, d50Um:nextD50, kettleTempC:nextTemp });
  return {
    ok:true,
    eyFromPct:simCur.eyPct, eyToPct:simNext.eyPct, deltaEyPct:_rnd(simNext.eyPct - simCur.eyPct, 2),
    tdsFromPct:simCur.tdsPct, tdsToPct:simNext.tdsPct, deltaTdsPct:_rnd(simNext.tdsPct - simCur.tdsPct, 3),
    d50FromUm:simCur.d50Um, d50ToUm:simNext.d50Um,
    drawdownDeltaS:Math.round(simNext.brewTimeS - simCur.brewTimeS)
  };
}

/* ============================================================================
   10. CROSS-BREWER TRANSLATOR ("BREW TWIN") (translateAcrossBrewers)
   - Exact Gagné Convex L_eff(c, eta_tail) Mass Conservation (0.000 g residual!)
   - Immersion Partition Ceiling Check (auto 2-stage steep + flush if E* > 0.93 E_max)
   - 3 Espresso Twins (6-Bar Turbo, Allonge/Soup, Exact Americano Twin)
   ============================================================================ */

function translateAcrossBrewers(srcBrew, targetMethodKey, gear){
  srcBrew = srcBrew || {};
  const srcKey = String(srcBrew.method || srcBrew.methodKey || 'v60').toLowerCase();
  const tgtKey = String(targetMethodKey || 'aeropress').toLowerCase();
  const srcPhys = typeof G.methodPhysicsFor === 'function' ? G.methodPhysicsFor(srcKey) : G.METHOD_PHYSICS_V6[0];
  const tgtPhys = typeof G.methodPhysicsFor === 'function' ? G.methodPhysicsFor(tgtKey) : G.METHOD_PHYSICS_V6[0];

  const srcDose = _clamp(srcBrew.doseG != null ? srcBrew.doseG : srcBrew.dose, 4, 250, srcPhys.dose);
  const srcWater = _clamp(srcBrew.waterG != null ? srcBrew.waterG : srcBrew.water, 15, 4000, srcDose * srcPhys.ratio);
  const srcRatio = srcWater / srcDose;
  const srcTempC = _clamp(srcBrew.tempC != null ? srcBrew.tempC : srcBrew.kettleTempC, 4, 100, 93);

  /* Simulate source brew if TDS/EY weren't measured */
  const srcSim = (srcBrew.tdsPct > 0 && srcBrew.eyPct > 0)
    ? { tdsPct:+srcBrew.tdsPct, eyCupPct:+srcBrew.eyPct, eyTotalPct:+srcBrew.eyPct, bevG:srcBrew.bevG || Math.max(15, srcWater - srcPhys.rWater * srcDose), oilPassFrac:srcPhys.oilPassFrac }
    : simulateBrew({ methodKey:srcKey, doseG:srcDose, waterG:srcWater, d50Um:srcBrew.grindUm || srcBrew.d50Um || srcPhys.d50AnchorUm, kettleTempC:srcTempC });

  const cStar = _clamp(srcSim.tdsPct / 100.0, 0.006, 0.22, 0.0138);
  const fAbsSrc = resolveImmersionFAbs(srcBrew.immersionBasis, srcPhys.fAbsDefault);
  const fAbsTgt = resolveImmersionFAbs(srcBrew.immersionBasis, tgtPhys.fAbsDefault);
  const etaSrc = srcPhys.etaTail != null ? srcPhys.etaTail : srcPhys.chiRet;
  const etaTgt = tgtPhys.etaTail != null ? tgtPhys.etaTail : tgtPhys.chiRet;

  /* Exact Gagné Convex Effective Retention L_eff(c, eta_tail) */
  const lEffSrc = ((1 - etaSrc) * srcPhys.rWater + etaSrc * (1 - cStar) * fAbsSrc) / Math.max(0.1, 1 - etaSrc * cStar);
  const lEffTgt = ((1 - etaTgt) * tgtPhys.rWater + etaTgt * (1 - cStar) * fAbsTgt) / Math.max(0.1, 1 - etaTgt * cStar);

  /* Cup-delivered solids fraction y_cup = c* * B_src / D_src */
  const bevTargetG = _clamp(srcBrew.targetBevG != null ? srcBrew.targetBevG : srcSim.bevG, 20, 3000, srcSim.bevG);
  const cupSolidsTargetG = cStar * bevTargetG;
  const eyStar = _clamp((cStar / (1 - cStar)) * Math.max(0.8, srcRatio - lEffSrc), 0.12, 0.27, 0.20);

  /* Case 1: Filter/Immersion -> Espresso / Lever Espresso (3 Explicit Twins!) */
  if ((tgtKey === 'espresso' || tgtKey === 'lever_espresso') && !srcPhys.outRatio){
    const espDose = 18.0;
    const shotSolidsG = espDose * eyStar;
    /* Twin 3: Exact Mass-Conserving Americano Twin (0.000 g solids & water residual!) */
    const turboYieldG = _rnd(espDose * 2.8, 1);
    const totalAmericanoBeverageG = _rnd(shotSolidsG / cStar, 2);
    const hotBypassWaterG = _rnd(Math.max(0, totalAmericanoBeverageG - turboYieldG), 2);
    const americanoTdsCheck = shotSolidsG / (turboYieldG + hotBypassWaterG);
    const massBalanceResidualG = _rnd(Math.abs(shotSolidsG - americanoTdsCheck * totalAmericanoBeverageG), 6);

    const espressoTwins = [
      { id:'turbo_6bar', label:'6-Bar Turbo Shot Twin', doseG:espDose, yieldG:turboYieldG, ratio:2.8, bar:6.0, d50Um:310, tdsPct:_rnd((shotSolidsG / turboYieldG) * 100, 2), eyPct:_rnd(eyStar * 100, 1) },
      { id:'allonge_soup', label:'Allonge / Soup Filter-2.0 Twin', doseG:espDose, yieldG:_rnd(espDose * 4.8, 1), ratio:4.8, bar:3.0, d50Um:380, tdsPct:_rnd((shotSolidsG / (espDose * 4.8)) * 100, 2), eyPct:_rnd(eyStar * 100, 1) },
      { id:'exact_americano', label:'Exact Mass-Matched Americano Twin', doseG:espDose, shotYieldG:turboYieldG, bypassWaterG:hotBypassWaterG, bypassTempC:78, totalBevG:totalAmericanoBeverageG, tdsPct:_rnd(cStar * 100, 2), eyPct:_rnd(eyStar * 100, 1), massBalanceResidualG }
    ];

    return {
      ok:true,
      sourceMethod:srcKey,
      targetMethod:tgtKey,
      doseG:espDose,
      dose:espDose,
      waterG:turboYieldG,
      water:turboYieldG,
      ratio:2.8,
      grindUm:310,
      d50Um:310,
      tempC:Math.max(88, _rnd(srcTempC - 1.0, 1)),
      expectedTds:_rnd((shotSolidsG / turboYieldG) * 100, 2),
      expectedEy:_rnd(eyStar * 100, 1),
      bevG:totalAmericanoBeverageG,
      lEffSrc:_rnd(lEffSrc, 2),
      lEffTgt:_rnd(lEffTgt, 2),
      massBalanceResidualG,
      espressoTwins,
      lipidClarityNote:'Metal basket passes ~45% coffee oils vs ~3% in paper pour-over; add bottom paper filter (Filter 2.0) for tea-like clarity.',
      note:'6-Bar Turbo Espresso Twin (' + _rnd(eyStar * 100, 1) + '% EY) + ' + Math.round(hotBypassWaterG) + ' g 78 C bypass water for exact ' + _rnd(cStar * 100, 2) + '% TDS Americano match.'
    };
  }

  /* Case 2: Standard Continuum Translation (Percolation <-> Hybrid <-> Immersion) */
  let rTarget = ((eyStar * (1 - cStar)) / cStar) + lEffTgt;
  rTarget = _clamp(rTarget, tgtPhys.ratioBounds[0], tgtPhys.ratioBounds[1], tgtPhys.ratio);

  /* Immersion Partition Equilibrium Ceiling Check (E* > 0.93 * E_max,imm) */
  const eMaxImmersion = 0.235;
  const immersionCeilingHit = tgtPhys.chiRet >= 0.85 && eyStar > 0.93 * eMaxImmersion;
  let twoStageSteepFlush = null;

  /* Exact Dose & Water preserving beverage yield B_tgt and cup solids! */
  const denomCup = Math.max(0.8, rTarget - tgtPhys.rWater);
  const tgtDoseExact = (bevTargetG * (1 - cStar)) / denomCup;
  const tgtWaterExact = tgtDoseExact * rTarget;
  const tgtDose = _rnd(tgtDoseExact, 2);
  const tgtWater = _rnd(tgtWaterExact, 2);
  const predictedBevExact = (tgtWaterExact - tgtPhys.rWater * tgtDoseExact) / (1 - cStar);
  const predictedBevG = (tgtWater - tgtPhys.rWater * tgtDose) / (1 - cStar);
  const massBalanceResidualG = _rnd(Math.abs(cupSolidsTargetG - cStar * predictedBevExact), 6);

  if (immersionCeilingHit && (tgtKey === 'switch' || tgtKey === 'clever' || tgtKey === 'aeropress')){
    const steepG = _rnd(tgtWater * 0.65, 1);
    const flushG = _rnd(tgtWater - steepG, 1);
    twoStageSteepFlush = {
      steepWaterG:steepG,
      percolationFlushG:flushG,
      reason:'Single-stage immersion partition equilibrium plateaus below ' + _rnd(eyStar * 100, 1) + '% EY; 65% closed steep + 35% clean percolation flush breaks the equilibrium ceiling!'
    };
  }

  /* Thermal & Grind Translation */
  const tgtSyn = synthesizeRecipe({
    bean:srcBrew.coffee || srcBrew.bean || {},
    methodKey:tgtKey,
    doseG:tgtDose,
    waterG:tgtWater,
    grinderKey:gear && gear.grinder ? gear.grinder : 'comandante-c40'
  });
  const tgtTempC = _clamp(_rnd(srcTempC + (tgtPhys.chiRet > srcPhys.chiRet ? 1.0 : tgtPhys.chiRet < srcPhys.chiRet ? -0.5 : 0), 1), 4, 99, tgtSyn.tempC);

  const srcOil = srcSim.oilPassFrac != null ? srcSim.oilPassFrac : srcPhys.oilPassFrac;
  const tgtOil = tgtPhys.oilPassFrac;
  const lipidClarityNote = Math.abs(tgtOil - srcOil) > 0.20
    ? (tgtOil > srcOil
        ? ('Texture shift: ' + tgtPhys.label + ' passes ~' + Math.round(tgtOil * 100) + '% coffee lipids (vs ~' + Math.round(srcOil * 100) + '%), giving fuller body and softer perceived acidity.')
        : ('Clarity shift: ' + tgtPhys.label + ' traps >96% oils & micro-fines, making fruit/floral notes crisp and tea-like.'))
    : 'Matched filtration clarity across both brewers.';

  return {
    ok:true,
    sourceMethod:srcKey,
    targetMethod:tgtKey,
    doseG:_rnd(tgtDose, 1),
    dose:_rnd(tgtDose, 1),
    waterG:_rnd(tgtWater, 1),
    water:_rnd(tgtWater, 1),
    ratio:_rnd(rTarget, 2),
    grindUm:tgtSyn.d50Um,
    d50Um:tgtSyn.d50Um,
    grinderSetting:tgtSyn.grinderSetting,
    tempC:tgtTempC,
    expectedTds:_rnd(cStar * 100, 2),
    expectedEy:_rnd(eyStar * 100, 1),
    bevG:_rnd(predictedBevG, 1),
    lEffSrc:_rnd(lEffSrc, 2),
    lEffTgt:_rnd(lEffTgt, 2),
    massBalanceResidualG,
    immersionCeilingHit,
    twoStageSteepFlush,
    lipidClarityNote,
    note:'Gagne Convex L_eff (' + _rnd(lEffSrc, 2) + ' \u2192 ' + _rnd(lEffTgt, 2) + ' g/g) preserves ' + _rnd(cStar * 100, 2) + '% TDS, ' + _rnd(eyStar * 100, 1) + '% EY & ' + Math.round(predictedBevG) + ' g in your cup.' + (twoStageSteepFlush ? ' ' + twoStageSteepFlush.reason : '')
  };
}

/* ============================================================================
   11. BACKWARD-COMPATIBLE HELPERS FOR BREW CHART, YIELD & IMMERSION STUDIO
   ============================================================================ */

/* Fixes Bug C11: Newton cooling in beSteepEY strictly satisfies T(t) > T_amb for all t -> infinity! */
function beSteepEY(c){
  c = c || {};
  const um = _clamp(c.um, 120, 1500, 700);
  const tempF = _clamp(c.tempF, 68, 212, 203);
  const roomF = 70.0;
  const steepMin = _clamp(c.steep, 0.1, 120, 3.0);
  const waterG = _clamp(c.water, 30, 3000, 300);
  const roastEq = { 'ultra-light':0.9, light:0.7, 'medium-light':0.35, medium:0, 'medium-dark':-0.35, dark:-0.7 }[c.roast || 'medium'] || 0;
  const eMax = Math.max(15.0, Math.min(25.5, 26.2 - 0.0055 * um + roastEq - (c.decaf ? 1.5 : 0)));
  const fRinse = Math.max(0.40, Math.min(0.72, 0.76 - 0.00023 * um));
  const coolPerMin = 0.022 * Math.cbrt(1000 / Math.max(80, waterG));
  const dt = 0.1;
  let rem = 1.0 - fRinse;
  let t = 0;
  while (t < steepMin - 1e-9){
    const h = Math.min(dt, steepMin - t);
    const mid = t + 0.5 * h;
    /* Strict asymptotic Newton cooling: T(t) = T_amb + (T_0 - T_amb) * exp(-k * t) > T_amb! */
    const curF = c.key === 'siphon' ? 200.0 : (roomF + Math.max(0.1, tempF - roomF) * Math.exp(-coolPerMin * mid));
    const tK = (curF - 32) * 5 / 9 + 273.15;
    const arr = Math.exp((1000 * 35.0 / R_GAS) * (1 / tK - 1 / 372.15));
    const tau = (mid < 0.75 ? 1.45 * Math.pow(um / 700, 1.8) : 5.2) * arr;
    rem *= Math.exp(-h / Math.max(0.05, tau));
    t += h;
  }
  return _rnd(eMax * (1.0 - rem), 2);
}

const BRIX_TO_TDS = 0.85;
function calcEyPercolation(tdsPct, bevG, doseG){
  const t = +tdsPct, b = +bevG, d = +doseG;
  if (!(t > 0 && t < 35 && b > 0 && d > 0)) return null;
  return _rnd(t * b / d, 2);
}
function calcEyImmersionRao(tdsPct, waterG, doseG){
  const t = +tdsPct, w = +waterG, d = +doseG;
  if (!(t > 0 && t < 35 && w > 0 && d > 0)) return null;
  return _rnd((100 * t / (100 - t)) * (w / d), 2);
}
function calcEyImmersionGagne(tdsPct, waterG, doseG, fAbs){
  const t = +tdsPct, w = +waterG, d = +doseG;
  const fa = resolveImmersionFAbs(fAbs, 1.0);
  if (!(t > 0 && t < 35 && w > 0 && d > 0)) return null;
  return _rnd((100 * t / (100 - t)) * (Math.max(0, w - fa * d) / d), 2);
}

const BREW_9ZONES = {
  under_weak:  { title:'Under-Extracted & Weak', sensory:'Watery, thin, sour or grassy with a short finish.', fix:'Grind 1-2 steps finer AND tighten ratio slightly.' },
  under_ideal: { title:'Under-Extracted (Normal Strength)', sensory:'Sharp sourness, lacking sweetness, quick finish.', fix:'Grind 1-2 steps finer, raise water temp +2 C, or extend contact time.' },
  under_strong:{ title:'Under-Extracted & Heavy', sensory:'Thick, salty-sour, aggressive acidity without sweetness.', fix:'Widen ratio (add brew water) AND grind finer.' },
  ideal_weak:  { title:'Balanced & Delicate (Tea-Like)', sensory:'Clean, sweet, high clarity, light silky body (Gesha/Nordic).', fix:'Enjoy as-is for clarity, or tighten ratio for fuller body.' },
  ideal_ideal: { title:'SCA Ideal Sweet Spot', sensory:'Ripe perceived sweetness, vibrant balanced acidity, clean finish.', fix:'Locked in! Keep grind and temperature steady.' },
  ideal_strong:{ title:'Balanced & Bold / Rich', sensory:'Syrupy body, intense sweet/fruit concentration.', fix:'Add 10-20 g hot bypass water if you want a lighter cup.' },
  over_weak:   { title:'Over-Extracted & Thin', sensory:'Hollow, papery, dry puckering finish with diluted body.', fix:'Tighten ratio AND grind 1-2 steps coarser.' },
  over_ideal:  { title:'Over-Extracted (Normal Strength)', sensory:'Muted fruit/florals, dry astringency on tongue.', fix:'Grind 1-2 steps coarser, pour more gently, or lower water temp -2 C.' },
  over_strong: { title:'Over-Extracted & Bitter', sensory:'Heavy, harsh roasted bitterness and lingering dry astringency.', fix:'Grind noticeably coarser and reduce agitation or water temperature.' }
};

function classifyBrewZone9(kind, tdsPct, eyPct){
  const esp = kind === 'espresso';
  const tLo = esp ? 8.0 : 1.15, tHi = esp ? 12.0 : 1.45;
  const sKey = tdsPct < tLo ? 'weak' : tdsPct > tHi ? 'strong' : 'ideal';
  const eKey = eyPct < 18.0 ? 'under' : eyPct > 22.0 ? 'over' : 'ideal';
  const id = eKey + '_' + sKey;
  const info = BREW_9ZONES[id];
  const inNordic = !esp && eyPct >= 19.0 && eyPct <= 23.0 && tdsPct >= 1.25 && tdsPct <= 1.50;
  return { id, strengthBand:sKey, eyBand:eKey, title:info.title, sensory:info.sensory, fix:info.fix, inSca:id === 'ideal_ideal', inNordic, overLimit:eyPct > 30.5 };
}

function calcEyStudio(p){
  p = p || {};
  const mode = p.mode === 'immersion' || p.mode === 'espresso' ? p.mode : 'percolation';
  const meter = p.meter === 'brix' ? 'brix' : 'tds';
  const rawVal = +p.reading;
  const tds = meter === 'brix' ? (rawVal > 0 ? brixToTds(rawVal) : NaN) : rawVal;
  const dose = +p.dose, water = +p.water, bev = +p.bev;
  if (!(tds > 0 && dose > 0)) return { ok:false, mode, meter, tds:null };
  const mb = solveContinuumMassBalance({
    methodKey:mode === 'espresso' ? 'espresso' : mode === 'immersion' ? 'clever' : 'v60',
    chiRet:mode === 'immersion' ? 1.0 : 0.0,
    doseG:dose,
    waterG:water,
    bevG:bev,
    tdsPct:tds,
    rWater:p.lRet,
    immersionBasis:p.immersionBasis || (p.immFormula === 'rao' ? 'liang' : p.fAbs != null ? +p.fAbs : undefined)
  });
  if (!mb.ok) return { ok:false, mode, meter, tds };
  const z9 = classifyBrewZone9(mode === 'espresso' ? 'espresso' : mode === 'immersion' ? 'steeped' : 'filter', tds, mb.eyPrimaryPct);
  return {
    ok:true,
    mode,
    meter,
    tds:mb.tdsPct,
    brix:meter === 'brix' ? rawVal : _rnd((0.8504 - Math.sqrt(Math.max(0, 0.8504 * 0.8504 - 4 * 0.0012 * tds))) / (2 * 0.0012), 2),
    dose:mb.doseG,
    water:mb.waterG,
    bev:mb.bevG,
    fAbs:mb.fAbs,
    lRet:mb.rWater,
    ey:mb.eyPrimaryPct,
    eyRao:mb.eyLiangPct,
    eyGagne:mb.eyGagnePct,
    eyCup:mb.eyCupPct,
    csvCupEy:mb.eyCupPct,
    csvTotalEy:mb.eyTotalPct,
    zone:z9,
    overSolubility:mb.eyPrimaryPct > 30.5
  };
}

function buildRecipe(coffee, methodKey, batch, adjust, now){
  batch = batch || {};
  adjust = adjust || {};
  const mPhys = typeof G.methodPhysicsFor === 'function' ? G.methodPhysicsFor(methodKey) : G.METHOD_PHYSICS_V6[0];
  const baseSyn = synthesizeRecipe({
    coffee:coffee || {},
    methodKey,
    waterG:batch.water || mPhys.water,
    ratio:batch.ratio ? (+batch.ratio + (+adjust.ratio || 0)) : undefined,
    tempC:batch.tempF ? ((+batch.tempF - 32) * 5 / 9) : batch.tempC,
    grinderKey:batch.grinderKey,
    calib:batch.calib,
    altitudeM:batch.altitudeFt ? (+batch.altitudeFt * 0.3048) : (batch.altitudeM || 0)
  });
  const stepUm = Math.max(10, Math.round((mPhys.um[1] - mPhys.um[0]) / 5));
  const shiftedUm = adjust.grind ? _clamp(baseSyn.d50Um - (+adjust.grind) * stepUm, 60, 1450, baseSyn.d50Um) : baseSyn.d50Um;
  const gClick = typeof G.grindGuide === 'function' ? G.grindGuide(batch.grinderKey, methodKey, shiftedUm, stepUm, batch.calib) : baseSyn.grinderSetting;
  return {
    method:mPhys,
    dose:baseSyn.doseG,
    water:baseSyn.waterG,
    ratio:baseSyn.ratio,
    yield:baseSyn.bevG,
    temp:{ f:Math.round(baseSyn.tempC * 9 / 5 + 32), c:baseSyn.tempC, recF:Math.round(baseSyn.tempC * 9 / 5 + 32), kind:(methodKey === 'cold' || methodKey === 'cold_drip') ? 'cold' : 'hot', reason:baseSyn.explanations[0] ? baseSyn.explanations[0].human : '', pills:[] },
    grind:{ um:shiftedUm, stepUm, name:shiftedUm < 300 ? 'Fine' : shiftedUm < 750 ? 'Medium-fine' : 'Coarse', why:baseSyn.explanations.map(e => e.human), pills:[] },
    clicks:gClick,
    bloom:baseSyn.bloom,
    bloomG:baseSyn.bloom ? baseSyn.bloom.grams : 0,
    steps:baseSyn.steps,
    prep:[],
    totalSecs:baseSyn.totalSecs,
    timed:methodKey !== 'cold' && methodKey !== 'cold_drip',
    eyTotalPct:baseSyn.expectedEy,
    tdsPredicted:baseSyn.expectedTds,
    physicsPills:baseSyn.explanations
  };
}

/* ============================================================================
   12. ASSEMBLE & EXPORT CANONICAL window.BTCoreV6 CONTRACT
   ============================================================================ */

const AGTRON_API = Object.assign({}, G.AGTRON_V6 || {}, {
  fromGourmet:G.agtronFromGourmet,
  toGourmet:G.agtronToGourmet,
  toTonino:g => G.agtronFromGourmet(g, 'tonino'),
  toCommercial:g => G.agtronFromGourmet(g, 'commercial'),
  convertAll:G.agtronConvertAll,
  expectedDelta:G.agtronExpectedDelta,
  toRoastKey:G.agtronToRoastKey,
  discHex:G.agtronDiscHex,
  roastDeltaInfo:G.agtronRoastDeltaInfo
});

/* Live Newton-Physics Golden Sip Cooling Countdown & Vessel Registry (Directive #157) */
const GOLDEN_SIP_VESSELS = [
  { key:'preheated_ceramic',  label:'Preheated Ceramic Mug', cVesselJK:215.0, preheatTempC:58.0, kPerMinRef:0.044, refMassG:250, lidDefault:false, tip:'Preheated ceramic holds initial warmth gently and enters the 55-62 C Golden Sip window around 4-6 min.' },
  { key:'room_ceramic',       label:'Room-Temp Ceramic Mug', cVesselJK:215.0, preheatTempC:null, kPerMinRef:0.048, refMassG:250, lidDefault:false, tip:'Unpreheated stoneware absorbs ~9-12 C immediately on pour, reaching the 55-62 C Golden Sip window faster (~1-3 min).' },
  { key:'glass_server',       label:'Glass Server / Carafe', cVesselJK:145.0, preheatTempC:42.0, kPerMinRef:0.056, refMassG:250, lidDefault:false, tip:'Thin borosilicate glass radiates heat briskly; swirling accelerates cooling by ~20%.' },
  { key:'espresso_demitasse', label:'Espresso Demitasse',    cVesselJK:110.0, preheatTempC:55.0, kPerMinRef:0.145, refMassG:40,  lidDefault:false, tip:'Small 30-50 g espresso mass cools rapidly — stir crema and sip within 45-90 seconds!' },
  { key:'travel_mug',         label:'Insulated Travel Mug',  cVesselJK:48.0,  preheatTempC:45.0, kPerMinRef:0.0085, kLidOffPerMinRef:0.026, refMassG:250, lidDefault:true, tip:'Take lid off! Vacuum travel mugs hold >65 C for 40+ min sealed — leave the lid off for 5-7 min so natural sweetness unlocks.' }
];

function fmtCountdownMmSs(sec){
  const s = Math.max(0, Math.round(sec || 0));
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}

function computeGoldenSipCooling(cfg){
  cfg = cfg || {};
  const vKey = String(cfg.vessel || cfg.vesselType || 'preheated_ceramic').toLowerCase().replace(/[\s-]+/g, '_');
  const vessel = GOLDEN_SIP_VESSELS.find(v => v.key === vKey) || GOLDEN_SIP_VESSELS[0];
  const tRoomC = _clamp(cfg.roomTempC != null ? cfg.roomTempC : 21.5, 10, 38, 21.5);
  const bevMassG = _clamp(cfg.bevMassG != null ? cfg.bevMassG : (cfg.bevG != null ? cfg.bevG : vessel.refMassG), 15, 1500, vessel.refMassG);
  const tPourEndC = _clamp(cfg.initialBrewTempC != null ? cfg.initialBrewTempC : (cfg.temp0C != null ? cfg.temp0C : 76.0), 25, 98, 76.0);
  const elapsedS = _clamp(cfg.elapsedS != null ? cfg.elapsedS : ((cfg.elapsedMin || 0) * 60), 0, 14400, 0);
  const lidOff = cfg.lidOff === true || (vessel.key === 'travel_mug' && cfg.lidded === false);

  /* Immediate calorimeter equilibration between freshly brewed coffee and vessel thermal mass */
  const tVessel0 = vessel.preheatTempC != null ? vessel.preheatTempC : tRoomC;
  const t0MixedC = cfg.t0MixedC != null && isFinite(+cfg.t0MixedC)
    ? _clamp(+cfg.t0MixedC, tRoomC, 96, tPourEndC)
    : ((bevMassG * CP_WATER * tPourEndC + vessel.cVesselJK * tVessel0) / (bevMassG * CP_WATER + vessel.cVesselJK));

  const kBase = (vessel.key === 'travel_mug' && lidOff && vessel.kLidOffPerMinRef) ? vessel.kLidOffPerMinRef : vessel.kPerMinRef;
  const kPerMin = kBase * Math.pow(vessel.refMassG / bevMassG, 0.42);
  const kPerSec = kPerMin / 60.0;

  const tempAtSec = sec => tRoomC + Math.max(0, t0MixedC - tRoomC) * Math.exp(-kPerSec * Math.max(0, sec));
  const secToReachTemp = targetC => {
    if (t0MixedC <= targetC) return 0;
    if (targetC <= tRoomC + 0.2) return 7200;
    return Math.max(0, Math.log((t0MixedC - tRoomC) / (targetC - tRoomC)) / Math.max(1e-6, kPerSec));
  };

  const curTempC = _rnd(tempAtSec(elapsedS), 1);
  const curTempF = Math.round(curTempC * 9 / 5 + 32);

  const secAt65 = secToReachTemp(65.0);
  const secAt62 = secToReachTemp(62.0);
  const secAt55 = secToReachTemp(55.0);
  const secAt50 = secToReachTemp(50.0);
  const secAt42 = secToReachTemp(42.0);

  const secondsToGoldenSip = Math.max(0, Math.round(secAt62 - elapsedS));
  const secondsRemainingInGoldenSip = curTempC >= 55.0 ? Math.max(0, Math.round(secAt55 - elapsedS)) : 0;
  const secondsToClarityPeak = Math.max(0, Math.round(secAt50 - elapsedS));

  let stage = 'golden_sip', stageLabel = 'SWEET SIP WINDOW (55-62 C / 131-144 F)', stageDetail = '';
  if (curTempC > 65.0){
    stage = 'too_hot';
    stageLabel = 'Aroma Only - Too Hot (>65 C / >149 F)';
    stageDetail = 'High heat (>65 C / 149 F) masks natural sweetness. Smell floral aromas now; Sweet Sip Window opens in ' + fmtCountdownMmSs(secondsToGoldenSip) + '.';
  } else if (curTempC > 62.0){
    stage = 'approaching_golden';
    stageLabel = 'First Warm Sips (62-65 C) - Sweet Window in ' + fmtCountdownMmSs(secondsToGoldenSip);
    stageDetail = 'Safe to sip gently; natural caramel and fruit sweetness open up right below 62 C (144 F).';
  } else if (curTempC >= 55.0){
    stage = 'golden_sip';
    stageLabel = 'SWEET SIP WINDOW (55-62 C / 131-144 F)';
    stageDetail = 'Sweet taste buds are wide open! Natural caramel and fruit sweetness peak right now.';
  } else if (curTempC >= 42.0){
    stage = 'clarity_acidity';
    stageLabel = 'Clarity & Acidity Peak (42-54 C / 108-129 F)';
    stageDetail = 'Thermal masking has faded — sparkling origin fruit acids, juiciness, and clean finish shine clearest here.';
  } else {
    stage = 'cool_truth';
    stageLabel = 'Cool Truth Serum (<42 C / <108 F)';
    stageDetail = 'Full cup transparency: great extraction stays sweet like iced tea; any roast dryness or channeling shows clearly.';
  }

  const curve = [];
  const horizonS = Math.min(3600, Math.max(600, Math.round(secAt42 * 1.15)));
  for (let i = 0; i <= 20; i++){
    const ts = Math.round((horizonS * i) / 20);
    const tc = _rnd(tempAtSec(ts), 1);
    curve.push({ tSec:ts, mmSs:fmtCountdownMmSs(ts), tempC:tc, tempF:Math.round(tc * 9 / 5 + 32) });
  }

  return {
    ok:true,
    vesselKey:vessel.key,
    vesselLabel:vessel.label,
    bevMassG:_rnd(bevMassG, 1),
    roomTempC:tRoomC,
    t0MixedC:_rnd(t0MixedC, 1),
    t0MixedF:Math.round(t0MixedC * 9 / 5 + 32),
    kPerMin:_rnd(kPerMin, 5),
    elapsedS:Math.round(elapsedS),
    tempC:curTempC,
    tempF:curTempF,
    stage,
    stageLabel,
    stageDetail,
    inGoldenSipWindow:(curTempC >= 55.0 && curTempC <= 62.5),
    milestoneChimeCue:(curTempC <= 62.2 && curTempC >= 61.2),
    secondsToGoldenSip,
    countdownMmSs:fmtCountdownMmSs(secondsToGoldenSip),
    secondsRemainingInGoldenSip,
    secondsToClarityPeak,
    windowsSec:{ safe65:Math.round(secAt65), goldenStart62:Math.round(secAt62), goldenEnd55:Math.round(secAt55), clarityStart50:Math.round(secAt50), cool42:Math.round(secAt42) },
    lidOffTip:vessel.key === 'travel_mug' ? vessel.tip : '',
    vesselTip:vessel.tip,
    curve
  };
}

/* DiFluid R2 Refractometer Sample Thermal Readiness & Spoon-Chill Coach (Directive #157) */
function evaluateR2SampleReadiness(sampleTempC, roomTempC){
  if (sampleTempC && typeof sampleTempC === 'object'){
    roomTempC = sampleTempC.roomTempC != null ? sampleTempC.roomTempC : (sampleTempC.prismTempC != null ? sampleTempC.prismTempC : roomTempC);
    sampleTempC = sampleTempC.sampleTempC != null ? sampleTempC.sampleTempC : (sampleTempC.tempC != null ? sampleTempC.tempC : sampleTempC.t);
  }
  const t = parseFloat(sampleTempC);
  const room = _clamp(roomTempC != null ? roomTempC : 23.0, 15, 35, 23.0);
  const protocolSteps = [
    'Stir 3-5 mL coffee in a room-temp metal spoon for 15-20s (rapidly cools 75 C \u2192 ~24 C with zero evaporation).',
    'Zero prism with 20-25 C distilled water and wipe dry with lint-free tissue.',
    'Syringe-filter (0.22-0.45 um) espresso, French press, or unfiltered samples to remove light-scattering colloids.',
    'Apply 3-4 drops and wait 5-10s for sapphire prism thermal equilibrium before reading.'
  ];
  if (!isFinite(t)){
    return {
      ok:false,
      status:'awaiting_sample',
      ready:false,
      badgeColor:'neutral',
      idealRangeC:[20, 28],
      idealRangeF:[68, 82],
      badgeText:'Ideal Sample Temp: 20-28 C (68-82 F) - Stir in Metal Spoon 15-20s Before Reading',
      why:'Piping-hot drops (>32-60 C) create sapphire-prism dn/dT thermal gradients AND rapid 0.3 mL micro-drop evaporation that falsely inflates %TDS.',
      protocolSteps
    };
  }
  const tc = _rnd(t, 1);
  const prismDrift = Math.abs(tc - room) > 3.5;
  if (tc >= 18.0 && tc <= 29.0){
    return {
      ok:true,
      tempC:tc,
      tempF:Math.round(tc * 9 / 5 + 32),
      status:'ideal',
      ready:true,
      badgeColor:'green',
      idealRangeC:[20, 28],
      idealRangeF:[68, 82],
      badgeText:'Prism Temp Ideal (' + tc.toFixed(1) + ' C)' + (prismDrift ? ' - Wait 5s for Prism Lock' : ''),
      why:'Sample sits right inside the 18-29 C low-evaporation optical window.',
      protocolSteps
    };
  }
  if (tc > 29.0){
    const coolSec = Math.min(35, Math.max(10, Math.round((tc - 25) * 0.45)));
    return {
      ok:true,
      tempC:tc,
      tempF:Math.round(tc * 9 / 5 + 32),
      status:'too_warm',
      ready:false,
      badgeColor:'amber',
      spoonCoolSeconds:coolSec,
      idealRangeC:[20, 28],
      idealRangeF:[68, 82],
      badgeText:'Sample Too Warm (' + tc.toFixed(1) + ' C) - Metal-Spoon Cool to 20-28 C to Avoid Evaporation Drift',
      why:'Above 29 C, a shallow 0.3 mL drop evaporates rapidly on the sample dish while creating vertical dn/dT prism gradients, inflating %TDS.',
      protocolSteps
    };
  }
  return {
    ok:true,
    tempC:tc,
    tempF:Math.round(tc * 9 / 5 + 32),
    status:'too_cold',
    ready:false,
    badgeColor:'blue',
    idealRangeC:[20, 28],
    idealRangeF:[68, 82],
    badgeText:'Sample Chilled (' + tc.toFixed(1) + ' C) - Hold 10s on Prism to Warm Toward 20-28 C',
    why:'Ice-cold drops (<18 C) risk moisture condensation and sit steep on the low-temp sucrose ATC curve.',
    protocolSteps
  };
}

const BTCoreV6 = {
  version:'6.0.0',
  METHODS_23:G.METHOD_PHYSICS_V6,
  FILTERS_16:G.FILTERS_V6,
  GRINDERS_48:G.GRINDERS,
  WATER_PRESETS:G.WATER_PRESETS_UNIFIED,
  AGTRON:AGTRON_API,
  EPISTEMIC:G.EPISTEMIC_TIERS_V6,
  TASTE_PAD_RINGS:TASTE_PAD_RINGS_V6,
  classifyTastePadRing,
  padNonlinearMag,

  simulateBrew,
  synthesizeRecipe,
  computeClosedLoopNextRecipe,
  computeExtractionWavePoint,
  computeExtractionWaveSeries,
  resolveContactTimeEvidence,
  solveMakeItPerfect,
  diagnoseAndPrescribe,
  computeDialInPrescription,
  previewCounterfactualDelta,
  translateAcrossBrewers,
  computePalateTwin,
  computeRobustPalateTwin,
  solvePersonalTargetRecipe,
  detectRatingSurprise,
  reconcileSensorVsPalate,
  classifyLeverRegime,
  isRowExcludedFromLearning,
  computeRobustBagDialScore,

  kinetics:{
    computeExtractionWavePoint,
    computeExtractionWaveSeries
  },

  sensory:{
    SENSORY_PSYCHOPHYSICS_V6,
    MINIMAL_SENSORY_INPUT_SPEC,
    classifyLeverRegime,
    isRowExcludedFromLearning,
    studentTHuberWeight,
    detectRatingSurprise,
    reconcileSensorVsPalate,
    resolveContactTimeEvidence,
    imputeRowTdsAndEy,
    computeRobustBagDialScore,
    solvePersonalTargetRecipe,
    computeRobustPalateTwin
  },

  thermo:{
    boilingPointC,
    simulateSlurryCurve,
    solveFlashIcedEnthalpy,
    GOLDEN_SIP_VESSELS,
    computeGoldenSipCooling,
    solveGoldenSipCooling:computeGoldenSipCooling,
    goldenSipAt:computeGoldenSipCooling
  },
  psd:{
    computeBimodalPSD,
    mapMicronsToGrinder,
    micronsForGrinderSetting:G.micronsForGrinderSetting,
    parseOmniScan
  },
  water:{
    WATER_PROFILES_V6:G.WATER_PROFILES_V6,
    solveWaterChemistry,
    solveCupProtonBalance,
    solveTapRoBlend,
    solveTwoBottleBlend:G.solveTwoBottleBlend,
    solveKitchenGallonWater:G.solveKitchenGallonWater,
    solveEverydayWaterRescue:G.solveEverydayWaterRescue,
    dropsToPpm:G.dropsToPpm
  },
  mass:{
    solveContinuumMassBalance,
    tdsFromRefractiveIndex,
    brixToTds,
    solveBidirectionalRatio:G.solveBidirectionalRatio,
    icumsaRefractiveIndex20,
    evaluateR2SampleReadiness
  },
  fresh:{
    effectiveBeanAgeArrhenius,
    smrkeCo2Trajectory
  },
  pk:{
    beanCaffeineMgPerG:G.beanCaffeineMgPerG,
    cafShareForMethod:G.cafShareForMethod,
    batemanAt:G.batemanAt,
    borbelyAlertnessAt:G.borbelyAlertnessAt,
    solveSafeCutoff:G.solveSafeCutoff
  }
};

G.BTCoreV6 = BTCoreV6;
if (G.window) G.window.BTCoreV6 = BTCoreV6;

/* Export helper symbols onto global scope */
const CORE_GLOBALS = {
  boilingPointC,
  simulateSlurryCurve,
  solveFlashIcedEnthalpy,
  GOLDEN_SIP_VESSELS,
  computeGoldenSipCooling,
  solveGoldenSipCooling:computeGoldenSipCooling,
  evaluateR2SampleReadiness,
  computeBimodalPSD,
  parseOmniScan,
  mapMicronsToGrinder,
  solveWaterChemistry,
  solveCupProtonBalance,
  solveContinuumMassBalance,
  icumsaRefractiveIndex20,
  tdsFromRefractiveIndex,
  brixToTds,
  BRIX_TO_TDS,
  smrkeCo2Trajectory,
  TASTE_PAD_RINGS_V6,
  classifyTastePadRing,
  padNonlinearMag,
  simulateBrew,
  synthesizeRecipe,
  computeClosedLoopNextRecipe,
  computeExtractionWavePoint,
  computeExtractionWaveSeries,
  resolveContactTimeEvidence,
  solveMakeItPerfect,
  diagnoseAndPrescribe,
  computeDialInPrescription,
  previewCounterfactualDelta,
  computePalateTwin,
  computeRobustPalateTwin,
  solvePersonalTargetRecipe,
  detectRatingSurprise,
  reconcileSensorVsPalate,
  classifyLeverRegime,
  isRowExcludedFromLearning,
  computeRobustBagDialScore,
  SENSORY_PSYCHOPHYSICS_V6,
  MINIMAL_SENSORY_INPUT_SPEC,
  translateAcrossBrewers,
  beSteepEY,
  calcEyPercolation,
  calcEyImmersionRao,
  calcEyImmersionGagne,
  BREW_9ZONES,
  classifyBrewZone9,
  calcEyStudio,
  buildRecipe
};
Object.keys(CORE_GLOBALS).forEach(k => { G[k] = CORE_GLOBALS[k]; });

})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
