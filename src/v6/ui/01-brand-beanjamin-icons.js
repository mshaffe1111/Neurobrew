/* ==========================================================================
   BeanTelligence v6.0 — 01-brand-beanjamin-icons.js
   1. BTBrand ("The Refracting Prism Drop" Faceted Optical Mark & Wordmark)
   2. Beanjamin 2.0 (Costume-Free Sculpted Arabica Mascot — 8 Zero-Clip States)
   3. BTIcons (100% Proprietary 24x24 Duotone Vector System — 90+ Custom Icons)
   Zero Unicode Emojis · Zero External CDNs · Zero Third-Party Icon Packs
   ========================================================================== */

const BRAND_NAME = 'BeanTelligence';
const BRAND_SLOGAN = 'A little science, a lot of delicious.';

function _btEsc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
  });
}

/* ==================== 1. BTBrand ("THE REFRACTING PRISM DROP") ==================== */
const BTBrand = (function() {
  let logoSeq = 0;

  /* Master 1024x1024 Faceted Crystal Extraction Drop + Snell Refraction + 3 Flavor Waves */
  const PRISM_LEFT    = 'M 444 136 L 274 422 L 236 548 L 324 712 L 444 776 L 382 536 L 444 308 Z';
  const PRISM_RIGHT   = 'M 444 136 L 614 422 L 652 548 L 564 712 L 444 776 L 506 536 L 444 308 Z';
  const PRISM_CROWN   = 'M 444 136 L 382 356 L 444 308 L 506 356 Z';
  const PRISM_HEART_L = 'M 444 308 L 444 684 L 358 514 Z';
  const PRISM_HEART_R = 'M 444 308 L 530 514 L 444 684 Z';
  const PRISM_KEEL    = 'M 324 712 L 444 684 L 564 712 L 444 776 Z';
  const BEAM_IN       = 'M 118 392 L 266 456 L 444 504 L 444 522 L 258 476 L 110 412 Z';
  const WAVE_1_ACID   = 'M 452 500 C 552 480 652 424 756 358 C 814 322 864 306 908 304 C 872 334 820 362 762 398 C 664 458 564 500 452 514 Z';
  const WAVE_2_SUGAR  = 'M 456 510 C 572 508 688 488 798 468 C 846 460 888 460 924 468 C 886 488 842 498 792 506 C 684 522 572 528 456 524 Z';
  const WAVE_3_SWEET  = 'M 450 522 C 558 540 664 580 762 612 C 814 628 862 632 902 622 C 864 650 810 656 752 638 C 654 608 554 560 450 536 Z';
  const MENISCUS_ARC  = 'M 256 826 C 334 868 554 868 632 826 C 552 848 336 848 256 826 Z';

  /* Razor-Sharp 64x64 Micro Optical Cut (16px-24px Tabs & Browser Favicon) */
  const MICRO_DROP_L  = 'M 27 6 L 12 33 L 17 48 L 27 54 L 23 34 Z';
  const MICRO_DROP_R  = 'M 27 6 L 42 33 L 37 48 L 27 54 L 31 34 Z';
  const MICRO_HEART   = 'M 27 19 L 33 34 L 27 46 L 21 34 Z';
  const MICRO_BEAM    = 'M 3 23 L 15 28.5 L 27 32 L 27 35 L 13.5 31.5 L 2 26.5 Z';
  const MICRO_W1      = 'M 29 31.5 C 38 29 47 23 60 17 L 61.5 20.5 C 49 26.5 39 31.5 29 34 Z';
  const MICRO_W2      = 'M 30 33.5 C 40 33 50 31.5 62 30 L 62 33.8 C 50 35 40 36 30 36 Z';
  const MICRO_W3      = 'M 29 35.5 C 39 37.5 48 41.5 60 45 L 58.5 48.5 C 47 44.5 38 40 29 38 Z';
  const MICRO_RIPPLE  = 'M 15 58.5 Q 27 62.5 39 58.5 Q 27 60.5 15 58.5 Z';

  function resolveOptical(opts) {
    if (opts.optical === 'micro' || opts.optical === 'standard' || opts.optical === 'hero') return opts.optical;
    if (opts.scale === 'micro' || opts.scale === 'standard' || opts.scale === 'hero') return opts.scale;
    const px = typeof opts.size === 'number' ? opts.size : 0;
    if (px > 0 && px <= 24) return 'micro';
    if (px >= 128) return 'hero';
    return 'standard';
  }

  function masterIconSvg(variant) {
    const u = 'bt_ic_' + (++logoSeq);
    const v = String(variant || 'light').toLowerCase();

    if (v === 'androidadaptive' || v === 'android-fg' || v === 'androidforeground') {
      return '<svg xmlns="http://www.w3.org/2000/svg" class="bt-logo-svg bt-logo-android" viewBox="0 0 108 108" role="img" aria-label="BeanTelligence Refracting Prism Drop">' +
        '<defs>' +
        '<linearGradient id="' + u + '_pl" x1="0.15" y1="0.08" x2="0.85" y2="0.95"><stop offset="0%" stop-color="#F6CE9F"/><stop offset="52%" stop-color="#BE7236"/><stop offset="100%" stop-color="#6B3312"/></linearGradient>' +
        '<linearGradient id="' + u + '_pr" x1="0.20" y1="0.10" x2="0.88" y2="0.94"><stop offset="0%" stop-color="#F8B54C"/><stop offset="55%" stop-color="#DC6B22"/><stop offset="100%" stop-color="#85300B"/></linearGradient>' +
        '</defs>' +
        '<g transform="translate(54 54) scale(0.068) translate(-516 -500)">' +
        '<path d="' + PRISM_LEFT + '" fill="url(#' + u + '_pl)"/>' +
        '<path d="' + PRISM_RIGHT + '" fill="url(#' + u + '_pr)"/>' +
        '<path d="' + PRISM_CROWN + '" fill="#FFF3D4" fill-opacity="0.86"/>' +
        '<path d="' + PRISM_HEART_L + '" fill="#FAD67D"/>' +
        '<path d="' + PRISM_HEART_R + '" fill="#F29842"/>' +
        '<path d="' + PRISM_KEEL + '" fill="#5A230B"/>' +
        '<path d="' + BEAM_IN + '" fill="#FFF8EA"/>' +
        '<path d="' + WAVE_1_ACID + '" fill="#FAD665"/>' +
        '<path d="' + WAVE_2_SUGAR + '" fill="#F28A3E"/>' +
        '<path d="' + WAVE_3_SWEET + '" fill="#52D99B"/>' +
        '<path d="' + MENISCUS_ARC + '" fill="#F6BE58"/>' +
        '</g></svg>';
    }

    if (v === 'android-bg' || v === 'androidbackground') {
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" width="108" height="108">' +
        '<defs><linearGradient id="' + u + '_abg" x1="0.15" y1="0.05" x2="0.85" y2="0.95"><stop offset="0%" stop-color="#261811"/><stop offset="55%" stop-color="#140D09"/><stop offset="100%" stop-color="#090604"/></linearGradient></defs>' +
        '<rect width="108" height="108" fill="url(#' + u + '_abg)"/></svg>';
    }

    if (v === 'android-mono' || v === 'androidmonochrome') {
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" width="108" height="108">' +
        '<g transform="translate(54 54) scale(0.068) translate(-516 -500)" fill="#000000">' +
        '<path d="' + PRISM_LEFT + '"/><path d="' + PRISM_RIGHT + '" fill-opacity="0.78"/>' +
        '<path d="' + BEAM_IN + '"/><path d="' + WAVE_1_ACID + '"/><path d="' + WAVE_2_SUGAR + '"/><path d="' + WAVE_3_SWEET + '"/>' +
        '<path d="' + MENISCUS_ARC + '"/></g></svg>';
    }

    if (v === 'tinted' || v === 'ios-tinted') {
      return '<svg xmlns="http://www.w3.org/2000/svg" class="bt-logo-svg bt-logo-tinted" viewBox="0 0 1024 1024" role="img" aria-label="BeanTelligence Refracting Prism Drop (Tinted)">' +
        '<defs><linearGradient id="' + u + '_tl" x1="0.2" y1="0.05" x2="0.8" y2="0.95"><stop offset="0%" stop-color="#FFFFFF"/><stop offset="100%" stop-color="#D2D2D2"/></linearGradient></defs>' +
        '<path d="' + PRISM_LEFT + '" fill="url(#' + u + '_tl)" fill-opacity="0.82"/>' +
        '<path d="' + PRISM_RIGHT + '" fill="#FFFFFF" fill-opacity="0.62"/>' +
        '<path d="' + PRISM_CROWN + '" fill="#FFFFFF"/>' +
        '<path d="' + PRISM_HEART_L + '" fill="#FFFFFF"/>' +
        '<path d="' + PRISM_HEART_R + '" fill="#FFFFFF" fill-opacity="0.86"/>' +
        '<path d="' + BEAM_IN + '" fill="#FFFFFF"/>' +
        '<path d="' + WAVE_1_ACID + '" fill="#FFFFFF" fill-opacity="0.95"/>' +
        '<path d="' + WAVE_2_SUGAR + '" fill="#FFFFFF" fill-opacity="0.80"/>' +
        '<path d="' + WAVE_3_SWEET + '" fill="#FFFFFF" fill-opacity="0.68"/>' +
        '<path d="' + MENISCUS_ARC + '" fill="#FFFFFF" fill-opacity="0.74"/></svg>';
    }

    if (v === 'dark' || v === 'ios-dark') {
      return '<svg xmlns="http://www.w3.org/2000/svg" class="bt-logo-svg bt-logo-hero-dark" viewBox="0 0 1024 1024" role="img" aria-label="BeanTelligence Refracting Prism Drop (Dark)">' +
        '<defs>' +
        '<linearGradient id="' + u + '_bg" x1="0.16" y1="0.04" x2="0.84" y2="0.96"><stop offset="0%" stop-color="#241710"/><stop offset="54%" stop-color="#130C09"/><stop offset="100%" stop-color="#090604"/></linearGradient>' +
        '<radialGradient id="' + u + '_gl" cx="0.48" cy="0.48" r="0.52"><stop offset="0%" stop-color="#E8844A" stop-opacity="0.28"/><stop offset="100%" stop-color="#130C09" stop-opacity="0"/></radialGradient>' +
        '<linearGradient id="' + u + '_pl" x1="0.18" y1="0.08" x2="0.82" y2="0.94"><stop offset="0%" stop-color="#ECC090"/><stop offset="50%" stop-color="#A8602B"/><stop offset="100%" stop-color="#4A210B"/></linearGradient>' +
        '<linearGradient id="' + u + '_pr" x1="0.20" y1="0.10" x2="0.86" y2="0.94"><stop offset="0%" stop-color="#FAC364"/><stop offset="52%" stop-color="#E47328"/><stop offset="100%" stop-color="#7D2B09"/></linearGradient>' +
        '<linearGradient id="' + u + '_w1" x1="0" y1="0.8" x2="1" y2="0.1"><stop offset="0%" stop-color="#FFF2B8"/><stop offset="100%" stop-color="#F5B832"/></linearGradient>' +
        '<linearGradient id="' + u + '_w2" x1="0" y1="0.5" x2="1" y2="0.5"><stop offset="0%" stop-color="#FAD48B"/><stop offset="100%" stop-color="#E8752B"/></linearGradient>' +
        '<linearGradient id="' + u + '_w3" x1="0" y1="0.2" x2="1" y2="0.8"><stop offset="0%" stop-color="#A5F7CF"/><stop offset="100%" stop-color="#28B576"/></linearGradient>' +
        '</defs>' +
        '<rect width="1024" height="1024" fill="url(#' + u + '_bg)"/>' +
        '<rect width="1024" height="1024" fill="url(#' + u + '_gl)"/>' +
        '<path d="' + PRISM_LEFT + '" fill="url(#' + u + '_pl)"/>' +
        '<path d="' + PRISM_RIGHT + '" fill="url(#' + u + '_pr)"/>' +
        '<path d="' + PRISM_CROWN + '" fill="#FFF6DF" fill-opacity="0.88"/>' +
        '<path d="' + PRISM_HEART_L + '" fill="#FFF2CA"/>' +
        '<path d="' + PRISM_HEART_R + '" fill="#F5A446"/>' +
        '<path d="' + PRISM_KEEL + '" fill="#3D1807"/>' +
        '<path d="' + BEAM_IN + '" fill="#FFF9EE"/>' +
        '<path d="' + WAVE_1_ACID + '" fill="url(#' + u + '_w1)"/>' +
        '<path d="' + WAVE_2_SUGAR + '" fill="url(#' + u + '_w2)"/>' +
        '<path d="' + WAVE_3_SWEET + '" fill="url(#' + u + '_w3)"/>' +
        '<circle cx="912" cy="303" r="12" fill="#FAD665"/>' +
        '<circle cx="928" cy="468" r="11" fill="#F08A43"/>' +
        '<circle cx="906" cy="621" r="11" fill="#52D99B"/>' +
        '<path d="' + MENISCUS_ARC + '" fill="#F4B350"/></svg>';
    }

    return '<svg xmlns="http://www.w3.org/2000/svg" class="bt-logo-svg bt-logo-hero-light" viewBox="0 0 1024 1024" role="img" aria-label="BeanTelligence Refracting Prism Drop (Light)">' +
      '<defs>' +
      '<linearGradient id="' + u + '_bg" x1="0.15" y1="0.05" x2="0.85" y2="0.95"><stop offset="0%" stop-color="#FFFDF9"/><stop offset="55%" stop-color="#F6EDE0"/><stop offset="100%" stop-color="#E5D3BC"/></linearGradient>' +
      '<radialGradient id="' + u + '_gl" cx="0.48" cy="0.42" r="0.56"><stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.90"/><stop offset="100%" stop-color="#E5D3BC" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="' + u + '_pl" x1="0.18" y1="0.08" x2="0.82" y2="0.94"><stop offset="0%" stop-color="#582D16"/><stop offset="52%" stop-color="#32170A"/><stop offset="100%" stop-color="#1A0B04"/></linearGradient>' +
      '<linearGradient id="' + u + '_pr" x1="0.22" y1="0.10" x2="0.86" y2="0.92"><stop offset="0%" stop-color="#E88435"/><stop offset="55%" stop-color="#9A4212"/><stop offset="100%" stop-color="#692607"/></linearGradient>' +
      '<linearGradient id="' + u + '_w1" x1="0" y1="0.8" x2="1" y2="0.1"><stop offset="0%" stop-color="#FAD665"/><stop offset="100%" stop-color="#D98B1E"/></linearGradient>' +
      '<linearGradient id="' + u + '_w2" x1="0" y1="0.5" x2="1" y2="0.5"><stop offset="0%" stop-color="#F0943E"/><stop offset="100%" stop-color="#9A4212"/></linearGradient>' +
      '<linearGradient id="' + u + '_w3" x1="0" y1="0.2" x2="1" y2="0.8"><stop offset="0%" stop-color="#3CC283"/><stop offset="100%" stop-color="#18603E"/></linearGradient>' +
      '</defs>' +
      '<rect width="1024" height="1024" fill="url(#' + u + '_bg)"/>' +
      '<rect width="1024" height="1024" fill="url(#' + u + '_gl)"/>' +
      '<path d="' + PRISM_LEFT + '" fill="url(#' + u + '_pl)"/>' +
      '<path d="' + PRISM_RIGHT + '" fill="url(#' + u + '_pr)"/>' +
      '<path d="' + PRISM_CROWN + '" fill="#FAD98E" fill-opacity="0.88"/>' +
      '<path d="' + PRISM_HEART_L + '" fill="#FCE19C"/>' +
      '<path d="' + PRISM_HEART_R + '" fill="#E88D34"/>' +
      '<path d="' + PRISM_KEEL + '" fill="#240F06"/>' +
      '<path d="' + BEAM_IN + '" fill="#381C0D"/>' +
      '<path d="' + WAVE_1_ACID + '" fill="url(#' + u + '_w1)"/>' +
      '<path d="' + WAVE_2_SUGAR + '" fill="url(#' + u + '_w2)"/>' +
      '<path d="' + WAVE_3_SWEET + '" fill="url(#' + u + '_w3)"/>' +
      '<circle cx="912" cy="303" r="12" fill="#DF8F1F"/>' +
      '<circle cx="928" cy="468" r="11" fill="#9A4212"/>' +
      '<circle cx="906" cy="621" r="11" fill="#18603E"/>' +
      '<path d="' + MENISCUS_ARC + '" fill="#D98B26"/></svg>';
  }

  function logoSvg(opts) {
    opts = opts || {};
    const theme = String(opts.theme || opts.variant || opts.mode || '').toLowerCase();
    const optical = resolveOptical(opts);
    const szStyle = typeof opts.size === 'number' ? ' style="width:' + opts.size + 'px;height:' + opts.size + 'px"' : '';
    const aria = opts.label ? 'role="img" aria-label="' + _btEsc(opts.label) + '"' : 'aria-hidden="true"';

    if (theme === 'androidadaptive') {
      return masterIconSvg('androidAdaptive');
    }
    if (theme === 'tinted') {
      return masterIconSvg('tinted');
    }
    if (optical === 'hero') {
      return masterIconSvg(theme === 'dark' ? 'dark' : 'light');
    }

    const pal = theme === 'dark'
      ? {
          pl: '#C98B56', pr: '#EB8842', cr: '#FAD67D', hl: '#FFF3D1', hr: '#F29B45',
          bm: '#FFF6E5', w1: '#FAD45B', w2: '#F08A43', w3: '#52D99B'
        }
      : theme === 'light'
      ? {
          pl: '#2E160B', pr: '#9A4212', cr: '#D98B26', hl: '#FCE19C', hr: '#E58832',
          bm: '#381C0D', w1: '#E09224', w2: '#B84A14', w3: '#1B7A52'
        }
      : {
          pl: 'var(--bt-prism-left,#2E160B)',
          pr: 'var(--bt-prism-right,#9A4212)',
          cr: 'var(--bt-prism-crown,#D98B26)',
          hl: 'var(--bt-prism-heart,#F6BE58)',
          hr: 'var(--bt-prism-right,#9A4212)',
          bm: 'var(--bt-prism-beam,#381C0D)',
          w1: 'var(--bt-prism-wave1,#E09224)',
          w2: 'var(--bt-prism-wave2,#B84A14)',
          w3: 'var(--bt-prism-wave3,#1B7A52)'
        };

    if (optical === 'micro') {
      return '<svg xmlns="http://www.w3.org/2000/svg" class="bt-logo-svg bt-logo-micro" viewBox="0 0 64 64"' + szStyle + ' ' + aria + ' focusable="false">' +
        '<path d="' + MICRO_DROP_L + '" fill="' + pal.pl + '"/>' +
        '<path d="' + MICRO_DROP_R + '" fill="' + pal.pr + '"/>' +
        '<path d="' + MICRO_HEART + '" fill="' + pal.hl + '"/>' +
        '<path d="' + MICRO_BEAM + '" fill="' + pal.bm + '"/>' +
        '<path d="' + MICRO_W1 + '" fill="' + pal.w1 + '"/>' +
        '<path d="' + MICRO_W2 + '" fill="' + pal.w2 + '"/>' +
        '<path d="' + MICRO_W3 + '" fill="' + pal.w3 + '"/>' +
        '<path d="' + MICRO_RIPPLE + '" fill="' + pal.cr + '"/></svg>';
    }

    return '<svg xmlns="http://www.w3.org/2000/svg" class="bt-logo-svg bt-logo-standard" viewBox="96 116 850 770"' + szStyle + ' ' + aria + ' focusable="false">' +
      '<path d="' + PRISM_LEFT + '" fill="' + pal.pl + '"/>' +
      '<path d="' + PRISM_RIGHT + '" fill="' + pal.pr + '"/>' +
      '<path d="' + PRISM_CROWN + '" fill="' + pal.cr + '"/>' +
      '<path d="' + PRISM_HEART_L + '" fill="' + pal.hl + '"/>' +
      '<path d="' + PRISM_HEART_R + '" fill="' + pal.hr + '" fill-opacity="0.88"/>' +
      '<path d="' + BEAM_IN + '" fill="' + pal.bm + '"/>' +
      '<path d="' + WAVE_1_ACID + '" fill="' + pal.w1 + '"/>' +
      '<path d="' + WAVE_2_SUGAR + '" fill="' + pal.w2 + '"/>' +
      '<path d="' + WAVE_3_SWEET + '" fill="' + pal.w3 + '"/>' +
      '<circle cx="912" cy="303" r="12" fill="' + pal.w1 + '"/>' +
      '<circle cx="928" cy="468" r="11" fill="' + pal.w2 + '"/>' +
      '<circle cx="906" cy="621" r="11" fill="' + pal.w3 + '"/>' +
      '<path d="' + MENISCUS_ARC + '" fill="' + pal.cr + '"/></svg>';
  }

  function wordmarkSvg(opts) {
    opts = opts || {};
    const label = opts.label || (BRAND_NAME + ' — ' + BRAND_SLOGAN);
    if (opts.compact) {
      return '<svg xmlns="http://www.w3.org/2000/svg" class="bt-wordmark-svg bt-wordmark-compact" viewBox="0 0 326 52" role="img" aria-label="' + _btEsc(BRAND_NAME) + '" focusable="false">' +
        '<g transform="translate(2 2) scale(0.062) translate(-96 -110)">' +
        '<path d="' + PRISM_LEFT + '" fill="var(--bt-prism-left,#2E160B)"/>' +
        '<path d="' + PRISM_RIGHT + '" fill="var(--bt-prism-right,#9A4A1E)"/>' +
        '<path d="' + PRISM_CROWN + '" fill="var(--bt-prism-crown,#D98B26)"/>' +
        '<path d="' + PRISM_HEART_L + '" fill="var(--bt-prism-heart,#F6BE58)"/>' +
        '<path d="' + BEAM_IN + '" fill="var(--bt-prism-beam,#381C0D)"/>' +
        '<path d="' + WAVE_1_ACID + '" fill="var(--bt-prism-wave1,#E09224)"/>' +
        '<path d="' + WAVE_2_SUGAR + '" fill="var(--bt-prism-wave2,#9A4A1E)"/>' +
        '<path d="' + WAVE_3_SWEET + '" fill="var(--bt-prism-wave3,#1C4A36)"/>' +
        '<path d="' + MENISCUS_ARC + '" fill="var(--bt-prism-crown,#D98B26)"/></g>' +
        '<text x="64" y="36" font-family="Lora,Georgia,serif" font-weight="700" font-size="30" letter-spacing="-0.6" fill="var(--bt-wordmark-bean,#1F1712)">Bean<tspan fill="var(--bt-wordmark-accent,#9A4A1E)">Telligence</tspan></text></svg>';
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" class="bt-wordmark-svg" viewBox="0 0 432 76" role="img" aria-label="' + _btEsc(label) + '" focusable="false">' +
      '<g transform="translate(2 4) scale(0.076) translate(-96 -110)">' +
      '<path d="' + PRISM_LEFT + '" fill="var(--bt-prism-left,#2E160B)"/>' +
      '<path d="' + PRISM_RIGHT + '" fill="var(--bt-prism-right,#9A4A1E)"/>' +
      '<path d="' + PRISM_CROWN + '" fill="var(--bt-prism-crown,#D98B26)"/>' +
      '<path d="' + PRISM_HEART_L + '" fill="var(--bt-prism-heart,#F6BE58)"/>' +
      '<path d="' + BEAM_IN + '" fill="var(--bt-prism-beam,#381C0D)"/>' +
      '<path d="' + WAVE_1_ACID + '" fill="var(--bt-prism-wave1,#E09224)"/>' +
      '<path d="' + WAVE_2_SUGAR + '" fill="var(--bt-prism-wave2,#9A4A1E)"/>' +
      '<path d="' + WAVE_3_SWEET + '" fill="var(--bt-prism-wave3,#1C4A36)"/>' +
      '<path d="' + MENISCUS_ARC + '" fill="var(--bt-prism-crown,#D98B26)"/></g>' +
      '<text x="78" y="42" font-family="Lora,Georgia,serif" font-weight="700" font-size="31" letter-spacing="-0.6" fill="var(--bt-wordmark-bean,#1F1712)">Bean<tspan fill="var(--bt-wordmark-accent,#9A4A1E)">Telligence</tspan></text>' +
      '<text x="79" y="61" font-family="Plus Jakarta Sans,-apple-system,sans-serif" font-weight="600" font-size="11.5" letter-spacing="0.9" fill="var(--bt-wordmark-sub,#685244)">A LITTLE SCIENCE, A LOT OF DELICIOUS</text></svg>';
  }

  function spriteSymbolsMarkup() {
    return '<symbol id="bt-mark" viewBox="0 0 200 200"><g transform="translate(100 100) scale(0.215) translate(-518 -500)">' +
      '<path d="' + PRISM_LEFT + '" fill="var(--bt-prism-left,#2E160B)"/>' +
      '<path d="' + PRISM_RIGHT + '" fill="var(--bt-prism-right,#9A4212)"/>' +
      '<path d="' + PRISM_CROWN + '" fill="var(--bt-prism-crown,#D98B26)"/>' +
      '<path d="' + PRISM_HEART_L + '" fill="var(--bt-prism-heart,#F6BE58)"/>' +
      '<path d="' + PRISM_HEART_R + '" fill="var(--bt-prism-right,#9A4212)" fill-opacity="0.88"/>' +
      '<path d="' + BEAM_IN + '" fill="var(--bt-prism-beam,#381C0D)"/>' +
      '<path d="' + WAVE_1_ACID + '" fill="var(--bt-prism-wave1,#E09224)"/>' +
      '<path d="' + WAVE_2_SUGAR + '" fill="var(--bt-prism-wave2,#B84A14)"/>' +
      '<path d="' + WAVE_3_SWEET + '" fill="var(--bt-prism-wave3,#1B7A52)"/>' +
      '<circle cx="912" cy="303" r="12" fill="var(--bt-prism-wave1,#E09224)"/>' +
      '<circle cx="928" cy="468" r="11" fill="var(--bt-prism-wave2,#B84A14)"/>' +
      '<circle cx="906" cy="621" r="11" fill="var(--bt-prism-wave3,#1B7A52)"/>' +
      '<path d="' + MENISCUS_ARC + '" fill="var(--bt-prism-crown,#D98B26)"/></g></symbol>' +
      '<symbol id="bt-medal" viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" fill="var(--bj-stage-bg,#F4EBDD)" stroke="var(--bt-prism-crown,#D98B26)" stroke-width="3"/><circle cx="60" cy="60" r="46" fill="none" stroke="var(--bt-prism-crown,#D98B26)" stroke-width="1.4" stroke-dasharray="2 4" opacity="0.65"/><use href="#bt-mark" x="18" y="18" width="84" height="84"/></symbol>' +
      '<symbol id="bt-badge" viewBox="0 0 400 356"><rect x="24" y="18" width="352" height="320" rx="36" fill="var(--card,#FFFFFF)" stroke="var(--line,#D8C8B6)" stroke-width="2"/><circle cx="200" cy="142" r="82" fill="var(--bj-stage-bg,#F4EBDD)" stroke="var(--bj-stage-border,#DCC9B0)" stroke-width="1.5"/><use href="#bt-mark" x="122" y="64" width="156" height="156"/><text x="200" y="268" text-anchor="middle" font-family="Lora,Georgia,serif" font-weight="700" font-size="30" letter-spacing="-0.5" fill="var(--bt-wordmark-bean,#1A1412)">Bean<tspan fill="var(--bt-wordmark-accent,#9A4212)">Telligence</tspan></text><text x="200" y="296" text-anchor="middle" font-family="Plus Jakarta Sans,-apple-system,sans-serif" font-weight="600" font-size="12.5" letter-spacing="1.2" fill="var(--bt-wordmark-sub,#665142)">A LITTLE SCIENCE, A LOT OF DELICIOUS.</text></symbol>';
  }

  function spriteSvg() {
    return '<svg id="bt-brand-sprite" width="0" height="0" style="position:fixed;width:0;height:0;pointer-events:none;overflow:hidden" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">' + spriteSymbolsMarkup() + '</svg>';
  }

  function mountSprite() {
    if (typeof document === 'undefined' || !document.body) return;
    if (document.getElementById('bt-mark')) return;
    const defs = document.getElementById('bt-svg-defs');
    if (defs) defs.insertAdjacentHTML('beforeend', spriteSymbolsMarkup());
    else document.body.insertAdjacentHTML('afterbegin', spriteSvg());
  }

  function celebrationSealSvg(opts) {
    opts = opts || {};
    const u = 'bt_seal_' + (++logoSeq);
    const sz = typeof opts.size === 'number' && opts.size > 0 ? opts.size : 0;
    const szStyle = sz ? ' style="width:' + sz + 'px;height:' + sz + 'px"' : '';
    const aria = opts.label
      ? 'role="img" aria-label="' + _btEsc(opts.label) + '"'
      : (opts.title ? 'role="img" aria-label="' + _btEsc(opts.title) + '"' : 'aria-hidden="true"');
    const animCls = opts.animate === false ? '' : ' is-animated';

    /* 16-point precision horological gold rosette seal path around (80, 80) */
    const pts = [];
    for (let i = 0; i < 32; i++) {
      const ang = (i * Math.PI) / 16 - Math.PI / 2;
      const rad = (i % 2 === 0) ? 73 : 66.5;
      const px = +(80 + rad * Math.cos(ang)).toFixed(2);
      const py = +(80 + rad * Math.sin(ang)).toFixed(2);
      pts.push((i === 0 ? 'M ' : 'L ') + px + ' ' + py);
    }
    const rosettePath = pts.join(' ') + ' Z';

    const innerMascot = (typeof Beanjamin !== 'undefined' && Beanjamin && typeof Beanjamin.svg === 'function')
      ? Beanjamin.svg('celebrating', { view: 'avatar', animate: opts.animate !== false })
          .replace('<svg ', '<svg x="28" y="26" width="104" height="104" ')
      : '<use href="#bt-mark" x="34" y="34" width="92" height="92"/>';

    return '<svg xmlns="http://www.w3.org/2000/svg" class="bt-celebration-seal' + animCls + '" viewBox="0 0 160 160"' + szStyle + ' ' + aria + ' focusable="false">' +
      '<defs>' +
      '<radialGradient id="' + u + '_aura" cx="0.5" cy="0.5" r="0.5">' +
      '<stop offset="0%" stop-color="#FAD665" stop-opacity="0.46"/>' +
      '<stop offset="68%" stop-color="#D98B26" stop-opacity="0.18"/>' +
      '<stop offset="100%" stop-color="#D98B26" stop-opacity="0"/>' +
      '</radialGradient>' +
      '<linearGradient id="' + u + '_rim" x1="0.15" y1="0.08" x2="0.85" y2="0.92">' +
      '<stop offset="0%" stop-color="#FCE59B"/>' +
      '<stop offset="48%" stop-color="#DF9228"/>' +
      '<stop offset="100%" stop-color="#9A4A1E"/>' +
      '</linearGradient>' +
      '</defs>' +
      '<circle class="bt-seal-aura" cx="80" cy="80" r="78" fill="url(#' + u + '_aura)"/>' +
      '<path class="bt-seal-rosette" d="' + rosettePath + '" fill="var(--bj-stage-bg,#F4EBDD)" stroke="url(#' + u + '_rim)" stroke-width="2.6" stroke-linejoin="round"/>' +
      '<circle cx="80" cy="80" r="59" fill="none" stroke="var(--gold,#D98B26)" stroke-width="1.3" stroke-dasharray="3 3.5" opacity="0.72"/>' +
      innerMascot +
      '<path d="M 80 8 Q 81.8 13.2 87 15 Q 81.8 16.8 80 22 Q 78.2 16.8 73 15 Q 78.2 13.2 80 8 Z" fill="#F2B24C"/>' +
      '<path d="M 21 44 Q 22.2 47.8 26 49 Q 22.2 50.2 21 54 Q 19.8 50.2 16 49 Q 19.8 47.8 21 44 Z" fill="#FAD67D"/>' +
      '<path d="M 139 44 Q 140.2 47.8 144 49 Q 140.2 50.2 139 54 Q 137.8 50.2 134 49 Q 137.8 47.8 139 44 Z" fill="#FAD67D"/>' +
      '</svg>';
  }

  function celebrationSealEl(opts) {
    opts = opts || {};
    const wrap = document.createElement('span');
    wrap.className = 'bt-celebration-seal-wrap' + (opts.cls ? ' ' + opts.cls : '');
    wrap.setAttribute('data-beanjamin', '1');
    if (typeof opts.size === 'number' && opts.size > 0) {
      wrap.style.width = opts.size + 'px';
      wrap.style.height = opts.size + 'px';
    }
    wrap.innerHTML = celebrationSealSvg(opts);
    return wrap;
  }

  return {
    PRISM_LEFT: PRISM_LEFT,
    PRISM_RIGHT: PRISM_RIGHT,
    PRISM_CROWN: PRISM_CROWN,
    BEAM_IN: BEAM_IN,
    WAVE_1_ACID: WAVE_1_ACID,
    WAVE_2_SUGAR: WAVE_2_SUGAR,
    WAVE_3_SWEET: WAVE_3_SWEET,
    MENISCUS_ARC: MENISCUS_ARC,
    logoSvg: logoSvg,
    wordmarkSvg: wordmarkSvg,
    masterIconSvg: masterIconSvg,
    celebrationSealSvg: celebrationSealSvg,
    celebrationSealEl: celebrationSealEl,
    spriteSvg: spriteSvg,
    mountSprite: mountSprite
  };
})();

/* ==================== 2. Beanjamin 2.0 (8 COSTUME-FREE ARABICA STATES) ==================== */
const Beanjamin = (function() {
  let seq = 0;
  const BEAN_PATH = 'M 120 52 C 132 47 162 52 179 84 C 190 105 190 144 179 169 C 167 192 144 200 120 198 C 96 200 73 192 61 169 C 50 144 50 105 61 84 C 78 52 108 47 120 52 Z';

  const STATES = {
    welcome:     { title: 'Welcome',     vbAvatar: '36 28 168 168', rig: 'welcome' },
    curious:     { title: 'Curious',     vbAvatar: '36 28 168 168', rig: 'curious' },
    eureka:      { title: 'Eureka',      vbAvatar: '36 28 168 168', rig: 'eureka' },
    focused:     { title: 'Focused',     vbAvatar: '48 38 168 168', rig: 'focused' },
    zen:         { title: 'Zen',         vbAvatar: '36 28 168 168', rig: 'zen' },
    celebrating: { title: 'Celebrating', vbAvatar: '36 20 168 168', rig: 'celebrating' },
    sympathetic: { title: 'Sympathetic', vbAvatar: '44 36 168 168', rig: 'sympathetic' },
    sleepy:      { title: 'Sleepy',      vbAvatar: '36 28 168 168', rig: 'sleepy' }
  };

  const ALIASES = {
    brewing: 'focused',
    pouring: 'focused',
    tasting: 'zen',
    savoring: 'zen',
    detective: 'sympathetic',
    diagnose: 'sympathetic',
    thinking: 'curious',
    wave: 'welcome',
    cheer: 'celebrating',
    rest: 'sleepy'
  };

  const CANONICAL_8 = ['welcome', 'curious', 'eureka', 'focused', 'zen', 'celebrating', 'sympathetic', 'sleepy'];

  function normalizeState(raw) {
    const k = String(raw || 'welcome').toLowerCase().trim();
    if (STATES[k]) return k;
    if (ALIASES[k]) return ALIASES[k];
    return 'welcome';
  }

  function star4(x, y, r, fill) {
    const k = +(r * 0.28).toFixed(2);
    return '<path d="M ' + x + ' ' + (y - r) + ' Q ' + (x + k) + ' ' + (y - k) + ' ' + (x + r) + ' ' + y + ' Q ' + (x + k) + ' ' + (y + k) + ' ' + x + ' ' + (y + r) + ' Q ' + (x - k) + ' ' + (y + k) + ' ' + (x - r) + ' ' + y + ' Q ' + (x - k) + ' ' + (y - k) + ' ' + x + ' ' + (y - r) + ' Z" fill="' + fill + '"/>';
  }

  function openEye(cx, cy, lx, ly, star) {
    lx = lx || 0;
    ly = ly || 0;
    const sp = star
      ? '<path d="M ' + (cx - 3 + lx) + ' ' + (cy - 9 + ly) + ' L ' + (cx - 1.3 + lx) + ' ' + (cy - 5.3 + ly) + ' L ' + (cx + 2.4 + lx) + ' ' + (cy - 3.8 + ly) + ' L ' + (cx - 1.3 + lx) + ' ' + (cy - 2.3 + ly) + ' L ' + (cx - 3 + lx) + ' ' + (cy + 1.4 + ly) + ' L ' + (cx - 4.7 + lx) + ' ' + (cy - 2.3 + ly) + ' L ' + (cx - 8.4 + lx) + ' ' + (cy - 3.8 + ly) + ' L ' + (cx - 4.7 + lx) + ' ' + (cy - 5.3 + ly) + ' Z" fill="#FFFDF9"/>'
      : '<circle cx="' + (cx - 3.4 + lx).toFixed(1) + '" cy="' + (cy - 4.2 + ly).toFixed(1) + '" r="4.3" fill="#FFFDF9"/>';
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="12" ry="13.5" fill="#1B0C05"/>' +
      '<path d="M ' + (cx - 8) + ' ' + (cy + 5) + ' Q ' + cx + ' ' + (cy + 12) + ' ' + (cx + 8) + ' ' + (cy + 5) + '" fill="none" stroke="#8C4F27" stroke-width="3" stroke-linecap="round" opacity="0.78"/>' +
      sp + '<circle cx="' + (cx + 4.2 + lx * 0.6).toFixed(1) + '" cy="' + (cy + 4.5 + ly * 0.6).toFixed(1) + '" r="2.1" fill="#FFFDF9" opacity="0.92"/>';
  }

  function coreBody(u, blushOp) {
    const ink = 'var(--bj-ink,#261209)';
    return '<path d="' + BEAN_PATH + '" fill="none" stroke="var(--bj-rim-glow,transparent)" stroke-width="5.2"/>' +
      '<path d="' + BEAN_PATH + '" fill="url(#' + u + '_b)" stroke="' + ink + '" stroke-width="3.2" stroke-linejoin="round"/>' +
      '<ellipse cx="125" cy="128" rx="48" ry="41" fill="url(#' + u + '_f)"/>' +
      '<path d="M 116 52 C 88 74 92 116 74 154 C 68 167 74 182 88 193" fill="none" stroke="#F6CE9D" stroke-width="5.2" stroke-linecap="round" opacity="0.45"/>' +
      '<path d="M 114 52 C 85 74 89 116 71 154 C 65 167 71 182 85 193" fill="none" stroke="#3B1A08" stroke-width="4.2" stroke-linecap="round" opacity="0.82"/>' +
      '<path d="M 65 104 C 68 82 81 64 101 56" fill="none" stroke="#FCE3C0" stroke-width="4" stroke-linecap="round" opacity="0.42"/>' +
      '<path d="M 176 114 C 181 148 166 179 138 190" fill="none" stroke="#2D1306" stroke-width="6" stroke-linecap="round" opacity="0.32"/>' +
      '<ellipse cx="82" cy="135" rx="10.5" ry="6.2" fill="#EA735B" opacity="' + blushOp + '"/>' +
      '<ellipse cx="168" cy="135" rx="10.5" ry="6.2" fill="#EA735B" opacity="' + blushOp + '"/>';
  }

  function svg(stateKey, opts) {
    opts = opts || {};
    const requested = String(stateKey || 'welcome').toLowerCase().trim();
    const key = normalizeState(requested);
    const meta = STATES[key];
    const u = 'bj_' + (++seq);
    const ink = 'var(--bj-ink,#261209)';
    const isAvatar = opts.view === 'avatar' || opts.view === 'bust' || opts.compact === true;
    const animCls = opts.animate === false ? '' : ' bj-anim';
    const vb = isAvatar ? meta.vbAvatar : '8 4 224 220';
    const szStyle = typeof opts.size === 'number' ? ' style="width:' + opts.size + 'px;height:' + opts.size + 'px"' : '';

    let defs = '<defs>' +
      '<radialGradient id="' + u + '_b" cx="0.34" cy="0.24" r="0.76"><stop offset="0%" stop-color="#D9904E"/><stop offset="46%" stop-color="#9A5425"/><stop offset="84%" stop-color="#623012"/><stop offset="100%" stop-color="#441E0A"/></radialGradient>' +
      '<radialGradient id="' + u + '_f" cx="0.52" cy="0.48" r="0.50"><stop offset="0%" stop-color="#F7CFA2" stop-opacity="0.42"/><stop offset="70%" stop-color="#DF9E63" stop-opacity="0.14"/><stop offset="100%" stop-color="#9A5425" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="' + u + '_p" x1="0.2" y1="0.1" x2="0.85" y2="0.9"><stop offset="0%" stop-color="#A85E2B"/><stop offset="100%" stop-color="#58290E"/></linearGradient>' +
      '<linearGradient id="' + u + '_g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FCE69E"/><stop offset="52%" stop-color="#F0A83A"/><stop offset="100%" stop-color="#C86419"/></linearGradient>';
    if (key === 'focused') {
      defs += '<linearGradient id="' + u + '_k" x1="0.15" y1="0" x2="0.85" y2="1"><stop offset="0%" stop-color="#685D56"/><stop offset="55%" stop-color="#3B3430"/><stop offset="100%" stop-color="#221D1A"/></linearGradient>';
    }
    if (key === 'eureka' || key === 'sympathetic') {
      defs += '<linearGradient id="' + u + '_gl" x1="0.15" y1="0.1" x2="0.85" y2="0.9"><stop offset="0%" stop-color="#EEFAFF" stop-opacity="0.90"/><stop offset="100%" stop-color="#9BD4E8" stop-opacity="0.52"/></linearGradient>';
    }
    defs += '</defs>';

    const baseFeet = '<ellipse cx="97" cy="197" rx="13.5" ry="7" fill="#4A220B" stroke="' + ink + '" stroke-width="2.8"/>' +
      '<ellipse cx="143" cy="197" rx="13.5" ry="7" fill="#4A220B" stroke="' + ink + '" stroke-width="2.8"/>';

    let content = '';

    if (key === 'welcome') {
      content = '<ellipse cx="120" cy="206" rx="52" ry="7.5" fill="var(--bj-shadow,rgba(26,20,18,0.16))"/>' +
        '<g class="bj-actor bj-breathe">' + baseFeet +
        '<g transform="rotate(-2.5 120 135)">' +
        '<ellipse cx="52" cy="146" rx="11" ry="16" transform="rotate(24 52 146)" fill="url(#' + u + '_p)" stroke="' + ink + '" stroke-width="2.8"/>' +
        '<g class="bj-wave-paw"><ellipse cx="190" cy="99" rx="11.5" ry="18" transform="rotate(34 190 99)" fill="url(#' + u + '_p)" stroke="' + ink + '" stroke-width="2.8"/>' +
        '<path d="M 205 82 Q 213 90 209 101 M 213 77 Q 223 88 217 104" fill="none" stroke="#F0A83A" stroke-width="2.8" stroke-linecap="round"/></g>' +
        coreBody(u, 0.56) +
        '<g class="bj-eye-blink">' + openEye(100, 119, 1, -0.5, false) + openEye(149, 119, 1, -0.5, false) + '</g>' +
        '<path d="M 90 100 Q 100 94 110 99 M 139 99 Q 149 94 159 100" fill="none" stroke="#361809" stroke-width="3.2" stroke-linecap="round"/>' +
        '<path d="M 113 134 Q 125 150 137 134 Z" fill="#591E17" stroke="' + ink + '" stroke-width="2.8" stroke-linejoin="round"/>' +
        '<path d="M 118 141 Q 125 137 132 141 Q 125 146 118 141 Z" fill="#EE8578"/></g></g>';
    } else if (key === 'focused') {
      content = '<ellipse cx="120" cy="206" rx="52" ry="7.5" fill="var(--bj-shadow,rgba(26,20,18,0.16))"/>' +
        '<g class="bj-actor bj-breathe">' + baseFeet +
        '<ellipse cx="52" cy="146" rx="10.5" ry="15" transform="rotate(22 52 146)" fill="url(#' + u + '_p)" stroke="' + ink + '" stroke-width="2.8"/>' +
        coreBody(u, 0.40) +
        '<g class="bj-eye-blink">' + openEye(100, 120, 2.5, 2, false) + openEye(149, 120, 2.5, 2, false) + '</g>' +
        '<path d="M 89 102 Q 100 99 111 103 M 138 103 Q 149 99 160 102" fill="none" stroke="#361809" stroke-width="3.4" stroke-linecap="round"/>' +
        '<path d="M 117 136 Q 125 142 133 136" fill="none" stroke="' + ink + '" stroke-width="3" stroke-linecap="round"/>' +
        '<g transform="translate(8 2)"><path d="M 204 132 C 207 154 206 178 205 200" fill="none" stroke="url(#' + u + '_g)" stroke-width="5" stroke-linecap="round"/>' +
        '<ellipse cx="205" cy="202" rx="14" ry="4" fill="none" stroke="#F0A83A" stroke-width="2.4" opacity="0.90"/>' +
        '<path d="M 131 148 C 118 148 117 172 132 172" fill="none" stroke="#B86D35" stroke-width="5.5" stroke-linecap="round"/>' +
        '<path d="M 132 141 H 166 L 172 176 Q 172 181 166 181 H 137 Q 131 181 131 176 Z" fill="url(#' + u + '_k)" stroke="#E6A150" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<rect x="137" y="135.5" width="24" height="5.5" rx="2.2" fill="#4B423D" stroke="#E6A150" stroke-width="1.8"/>' +
        '<circle cx="149" cy="132" r="3.4" fill="#F4B24A"/>' +
        '<path d="M 169 167 C 183 167 184 131 204 131" fill="none" stroke="#E6A150" stroke-width="5.8" stroke-linecap="round"/>' +
        '<path d="M 169 167 C 183 167 184 131 204 131" fill="none" stroke="#4B423D" stroke-width="3" stroke-linecap="round"/>' +
        '<path class="bj-steam" d="M 195 119 Q 191 111 196 104 Q 201 97 196 89" fill="none" stroke="#F4B24A" stroke-width="2.5" stroke-linecap="round" opacity="0.82"/>' +
        '<ellipse cx="126" cy="160" rx="11" ry="9.5" fill="url(#' + u + '_p)" stroke="' + ink + '" stroke-width="2.6"/></g></g>';
    } else if (key === 'eureka') {
      content = '<ellipse cx="120" cy="206" rx="52" ry="7.5" fill="var(--bj-shadow,rgba(26,20,18,0.16))"/>' +
        '<g class="bj-actor bj-breathe">' + baseFeet +
        '<ellipse cx="189" cy="108" rx="10.5" ry="16" transform="rotate(25 189 108)" fill="url(#' + u + '_p)" stroke="' + ink + '" stroke-width="2.8"/>' +
        coreBody(u, 0.46) + openEye(100, 119, 0, -1, true) + openEye(149, 119, 0, -1, true) +
        '<circle cx="100" cy="119" r="18.5" fill="rgba(255,253,248,0.12)" stroke="#F2B24C" stroke-width="3.1"/>' +
        '<circle cx="149" cy="119" r="18.5" fill="rgba(255,253,248,0.12)" stroke="#F2B24C" stroke-width="3.1"/>' +
        '<path d="M 118.5 117 Q 124.5 112 130.5 117" fill="none" stroke="#F2B24C" stroke-width="3.1" stroke-linecap="round"/>' +
        '<path d="M 81.5 117 L 66 114 M 167.5 117 L 180 114" fill="none" stroke="#CA7F22" stroke-width="2.6" stroke-linecap="round"/>' +
        '<path d="M 88 109 A 13 13 0 0 1 98 104 M 137 109 A 13 13 0 0 1 147 104" fill="none" stroke="#FFFDF9" stroke-width="2.2" stroke-linecap="round" opacity="0.82"/>' +
        '<path d="M 88 95 Q 100 88 112 94 M 137 94 Q 149 88 161 95" fill="none" stroke="#361809" stroke-width="3.2" stroke-linecap="round"/>' +
        '<path d="M 115 136 Q 125 148 135 136 Z" fill="#591E17" stroke="' + ink + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<g transform="translate(50 146) rotate(-8)"><path d="M -7 -18 H 7 V -6 L 19 16 Q 22 22 15 22 H -15 Q -22 22 -19 16 L -7 -6 Z" fill="url(#' + u + '_gl)" stroke="' + ink + '" stroke-width="2.6" stroke-linejoin="round"/>' +
        '<path d="M -13 6 H 13 L 18 16 Q 20 20 14 20 H -14 Q -20 20 -18 16 Z" fill="url(#' + u + '_g)"/>' +
        '<path d="M -10 -18 H 10" stroke="#F2B24C" stroke-width="3" stroke-linecap="round"/>' +
        '<circle cx="-3" cy="13" r="2.2" fill="#FFFDF9" opacity="0.90"/><circle cx="5" cy="9" r="1.6" fill="#FFFDF9" opacity="0.90"/></g>' +
        '<ellipse cx="64" cy="156" rx="10" ry="8.5" fill="url(#' + u + '_p)" stroke="' + ink + '" stroke-width="2.6"/>' +
        '<g class="bj-sparkle">' + star4(196, 62, 15, 'url(#' + u + '_g)') + star4(212, 83, 8.5, '#FCE69E') + '</g></g>';
    } else if (key === 'zen') {
      content = '<ellipse cx="120" cy="206" rx="52" ry="7.5" fill="var(--bj-shadow,rgba(26,20,18,0.16))"/>' +
        '<g class="bj-actor bj-breathe">' + baseFeet + coreBody(u, 0.68) +
        '<path d="M 88 121 C 92 108 107 108 111 121 M 138 121 C 142 108 157 108 161 121" fill="none" stroke="#1B0C05" stroke-width="4.2" stroke-linecap="round"/>' +
        '<path d="M 89 101 Q 100 96 110 100 M 139 100 Q 149 96 160 101" fill="none" stroke="#361809" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M 116 133 Q 125 140 134 133" fill="none" stroke="' + ink + '" stroke-width="3" stroke-linecap="round"/>' +
        '<g class="bj-steam"><path d="M 115 150 C 110 142 119 136 114 128 M 134 150 C 129 142 138 136 133 128" fill="none" stroke="#FAD39C" stroke-width="2.6" stroke-linecap="round" opacity="0.88"/></g>' +
        '<g transform="translate(124 169)"><path d="M -26 -10 H 26 V 4 C 26 17 15 24 0 24 C -15 24 -26 17 -26 4 Z" fill="#FFF9EE" stroke="' + ink + '" stroke-width="2.8" stroke-linejoin="round"/>' +
        '<ellipse cx="0" cy="-10" rx="26" ry="5.5" fill="#F2E6D2" stroke="' + ink + '" stroke-width="2.6"/>' +
        '<ellipse cx="0" cy="-9.5" rx="21" ry="3.8" fill="#8C471C"/>' +
        '<path d="M -15 4 C -15 12 -8 16 -1 17" fill="none" stroke="#E5D5BC" stroke-width="2.6" stroke-linecap="round"/></g>' +
        '<ellipse cx="95" cy="173" rx="11" ry="9" transform="rotate(18 95 173)" fill="url(#' + u + '_p)" stroke="' + ink + '" stroke-width="2.8"/>' +
        '<ellipse cx="153" cy="173" rx="11" ry="9" transform="rotate(-18 153 173)" fill="url(#' + u + '_p)" stroke="' + ink + '" stroke-width="2.8"/></g>';
    } else if (key === 'sympathetic') {
      content = '<ellipse cx="120" cy="206" rx="52" ry="7.5" fill="var(--bj-shadow,rgba(26,20,18,0.16))"/>' +
        '<g class="bj-actor bj-breathe">' + baseFeet +
        '<ellipse cx="53" cy="148" rx="10.5" ry="15" transform="rotate(20 53 148)" fill="url(#' + u + '_p)" stroke="' + ink + '" stroke-width="2.8"/>' +
        coreBody(u, 0.42) +
        '<g class="bj-eye-blink">' + openEye(100, 120, 2.5, 0, false) + openEye(149, 120, 2.5, 0, false) + '</g>' +
        '<path d="M 88 103 Q 100 97 112 103 M 137 101 Q 149 94 161 101" fill="none" stroke="#361809" stroke-width="3.4" stroke-linecap="round"/>' +
        '<path d="M 117 137 Q 125 141 133 137" fill="none" stroke="' + ink + '" stroke-width="3" stroke-linecap="round"/>' +
        '<g transform="translate(182 132)"><path d="M -14 18 L -28 38" stroke="#E6A150" stroke-width="7.5" stroke-linecap="round"/>' +
        '<path d="M -14 18 L -28 38" stroke="#7A411D" stroke-width="4.2" stroke-linecap="round"/>' +
        '<circle cx="0" cy="0" r="24" fill="url(#' + u + '_gl)" stroke="#E58B34" stroke-width="5"/>' +
        '<path d="M 2 -11 C 7 -3 9 2 9 6 A 7 7 0 1 1 -5 6 C -5 2 -3 -3 2 -11 Z" fill="url(#' + u + '_g)" stroke="' + ink + '" stroke-width="1.8" stroke-linejoin="round"/>' +
        '<path d="M -15 -10 A 16 16 0 0 1 -3 -17" fill="none" stroke="#FFFDF9" stroke-width="2.8" stroke-linecap="round" opacity="0.90"/></g>' +
        '<ellipse cx="157" cy="166" rx="10.5" ry="9" fill="url(#' + u + '_p)" stroke="' + ink + '" stroke-width="2.8"/></g>';
    } else if (key === 'celebrating') {
      content = '<ellipse cx="120" cy="210" rx="42" ry="6.5" fill="var(--bj-shadow,rgba(26,20,18,0.16))"/>' +
        '<g class="bj-actor bj-hop" transform="translate(0 -7)">' + baseFeet +
        '<ellipse cx="55" cy="96" rx="11" ry="17" transform="rotate(-34 55 96)" fill="url(#' + u + '_p)" stroke="' + ink + '" stroke-width="2.8"/>' +
        '<ellipse cx="185" cy="96" rx="11" ry="17" transform="rotate(34 185 96)" fill="url(#' + u + '_p)" stroke="' + ink + '" stroke-width="2.8"/>' +
        coreBody(u, 0.72) + openEye(100, 118, 0, -1, true) + openEye(149, 118, 0, -1, true) +
        '<path d="M 88 95 Q 100 88 112 94 M 137 94 Q 149 88 161 95" fill="none" stroke="#361809" stroke-width="3.2" stroke-linecap="round"/>' +
        '<path d="M 109 132 Q 125 136 141 132 Q 139 153 125 153 Q 111 153 109 132 Z" fill="#591E17" stroke="' + ink + '" stroke-width="2.8" stroke-linejoin="round"/>' +
        '<path d="M 116 144 Q 125 139 134 144 Q 125 151 116 144 Z" fill="#EE8578"/></g>' +
        '<g class="bj-sparkle">' +
        star4(46, 54, 10.5, 'url(#' + u + '_g)') + star4(80, 27, 10, '#FCE69E') + star4(120, 17, 12.5, 'url(#' + u + '_g)') +
        star4(160, 27, 10, '#FCE69E') + star4(194, 54, 10.5, 'url(#' + u + '_g)') +
        '<circle cx="38" cy="128" r="4" fill="#E58032"/><circle cx="202" cy="134" r="4" fill="#5CD19A"/></g>';
    } else if (key === 'sleepy') {
      content = '<ellipse cx="120" cy="206" rx="52" ry="7.5" fill="var(--bj-shadow,rgba(26,20,18,0.16))"/>' +
        '<g class="bj-actor bj-breathe">' + baseFeet +
        '<g transform="rotate(6 120 140)">' + coreBody(u, 0.58) +
        '<path d="M 89 121 C 94 130 106 130 111 121 M 138 121 C 143 130 155 130 160 121" fill="none" stroke="#1B0C05" stroke-width="3.8" stroke-linecap="round"/>' +
        '<path d="M 90 106 Q 100 103 110 106 M 139 106 Q 149 103 159 106" fill="none" stroke="#361809" stroke-width="2.8" stroke-linecap="round" opacity="0.75"/>' +
        '<ellipse cx="125" cy="138" rx="5" ry="6.2" fill="#591E17" stroke="' + ink + '" stroke-width="2.6"/>' +
        '<ellipse cx="168" cy="144" rx="13" ry="8.5" transform="rotate(-22 168 144)" fill="url(#' + u + '_p)" stroke="' + ink + '" stroke-width="2.6"/>' +
        '<ellipse cx="173" cy="154" rx="12.5" ry="8" transform="rotate(-14 173 154)" fill="url(#' + u + '_p)" stroke="' + ink + '" stroke-width="2.6"/></g>' +
        '<g class="bj-float"><path d="M 42 42 A 18 18 0 1 0 62 66 A 14 14 0 1 1 42 42 Z" fill="url(#' + u + '_g)"/>' +
        '<path d="M 178 72 H 194 L 178 90 H 194" fill="none" stroke="#F0A83A" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M 198 48 H 209 L 198 60 H 209" fill="none" stroke="#FCE69E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g></g>';
    } else {
      /* curious */
      content = '<ellipse cx="120" cy="206" rx="52" ry="7.5" fill="var(--bj-shadow,rgba(26,20,18,0.16))"/>' +
        '<g class="bj-actor bj-breathe">' + baseFeet +
        '<g transform="rotate(3.5 120 140)">' +
        '<ellipse cx="53" cy="148" rx="10.5" ry="15" transform="rotate(20 53 148)" fill="url(#' + u + '_p)" stroke="' + ink + '" stroke-width="2.8"/>' +
        coreBody(u, 0.44) +
        '<g class="bj-eye-blink">' + openEye(100, 119, 3.2, -3.2, false) + openEye(149, 119, 3.2, -3.2, false) + '</g>' +
        '<path d="M 89 103 Q 100 100 111 103" fill="none" stroke="#361809" stroke-width="3.2" stroke-linecap="round"/>' +
        '<path d="M 138 96 Q 149 88 160 95" fill="none" stroke="#361809" stroke-width="3.4" stroke-linecap="round"/>' +
        '<path d="M 116 136 Q 125 139 133 133" fill="none" stroke="' + ink + '" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M 178 152 C 170 166 150 164 141 146 C 138 140 146 135 152 141 C 158 147 168 148 176 140 Z" fill="url(#' + u + '_p)" stroke="' + ink + '" stroke-width="2.8" stroke-linejoin="round"/></g>' +
        '<g class="bj-float" transform="translate(194 66)"><path d="M -8 -10 C -8 -19 9 -19 9 -9 C 9 -2 0 -1 0 6" fill="none" stroke="url(#' + u + '_g)" stroke-width="5" stroke-linecap="round"/>' +
        '<circle cx="0" cy="15" r="3.6" fill="#F0A83A"/></g></g>';
    }

    const extraCls = requested !== key ? (' bj-state-' + _btEsc(requested)) : '';
    const aria = opts.label ? 'role="img" aria-label="' + _btEsc(opts.label) + '"' : 'aria-hidden="true"';
    return '<svg xmlns="http://www.w3.org/2000/svg" class="mk-svg bj-svg bj-state-' + key + extraCls + animCls + '" data-beanjamin-state="' + key + '" viewBox="' + vb + '"' + szStyle + ' ' + aria + ' focusable="false">' + defs + content + '</svg>';
  }

  function el(stateKey, opts) {
    opts = opts || {};
    const wrap = document.createElement('span');
    wrap.className = 'bj-host' + (opts.medallion ? ' bj-medallion' : '') + (opts.cls ? ' ' + opts.cls : '');
    wrap.setAttribute('data-beanjamin', '1');
    if (typeof opts.size === 'number') {
      wrap.style.width = opts.size + 'px';
      wrap.style.height = opts.size + 'px';
    }
    wrap.innerHTML = svg(stateKey, opts);
    return wrap;
  }

  function enforceSinglePerViewport(root) {
    const scope = root || (typeof document !== 'undefined' ? document : null);
    if (!scope || !scope.querySelectorAll) return;
    const nodes = scope.querySelectorAll('[data-beanjamin="1"]');
    let seenVisible = false;
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (!seenVisible) {
        n.hidden = false;
        seenVisible = true;
      } else {
        n.hidden = true;
      }
    }
  }

  function resolveLegacyState(o) {
    o = o || {};
    if (o.state) return normalizeState(o.state);
    const f = o.face || '', p = o.pose || '', out = o.outfit || '';
    if (f === 'sleepy') return 'sleepy';
    if (f === 'excited' || f === 'surprised' || p === 'cheer') return 'celebrating';
    if (p === 'wave') return 'welcome';
    if (p === 'mug' || f === 'laughing') return 'zen';
    if (f === 'unimpressed' || f === 'worried' || f === 'sad' || f === 'grumpy' || p === 'crossed') return 'sympathetic';
    if (f === 'thinking' || p === 'think' || p === 'shrug') return 'curious';
    if (out === 'lab' || f === 'informing') return 'eureka';
    if (out === 'vest') return 'focused';
    return 'welcome';
  }

  return {
    STATES, ALIASES, CANONICAL_8, normalizeState, svg, el, enforceSinglePerViewport, resolveLegacyState,
    celebrationSealSvg: function(opts) { return BTBrand.celebrationSealSvg(opts); },
    celebrationSealEl: function(opts) { return BTBrand.celebrationSealEl(opts); }
  };
})();

function mascotSvg(o) {
  o = o || {};
  if (o.view === 'logo') return BTBrand.logoSvg(o);
  const st = Beanjamin.resolveLegacyState(o);
  return Beanjamin.svg(st, { view: o.view === 'full' ? 'full' : 'avatar', animate: o.animate !== false, label: o.label });
}

function brandHero() {
  const wrap = document.createElement('div');
  wrap.className = 'brand brandwrap';
  wrap.innerHTML = BTBrand.wordmarkSvg();
  return wrap;
}

function brandBadge() {
  const box = document.createElement('div');
  box.className = 'badgebox';
  box.innerHTML = '<svg class="badge" viewBox="0 0 400 356" role="img" aria-label="' + _btEsc(BRAND_NAME + '. ' + BRAND_SLOGAN) + '" focusable="false"><use href="#bt-badge"/></svg>';
  return box;
}

function medalSvg(cls) {
  const box = document.createElement('span');
  box.className = 'cmd-medal-ico' + (cls ? ' ' + cls : '');
  box.setAttribute('aria-hidden', 'true');
  box.innerHTML = '<svg viewBox="0 0 120 120" focusable="false"><use href="#bt-medal"/></svg>';
  return box;
}

/* ==================== 3. BTIcons (90+ CUSTOM 24x24 DUOTONE VECTOR ICONS) ==================== */
const BTIcons = (function() {
  const T  = function(d) { return '<path class="bti-t" d="' + d + '"/>'; };
  const S  = function(d) { return '<path class="bti-s" d="' + d + '"/>'; };
  const A  = function(d) { return '<path class="bti-a" d="' + d + '"/>'; };
  const AF = function(d) { return '<path class="bti-af" d="' + d + '"/>'; };

  const DEFS = {
    /* ==================== A. 5 PRIMARY NAVIGATION TABS ==================== */
    'brew':
      T('M 5 5 H 17 L 13 13 H 9 Z M 7 15 H 15 L 16 20 C 16 21 15 21.5 14 21.5 H 8 C 7 21.5 6 21 6 20 Z') +
      S('M 4.5 5 H 17.5 L 13.2 13 H 8.8 Z M 7 13 H 15 M 7.2 15 H 14.8 L 16 20 A 1.5 1.5 0 0 1 14.5 21.5 H 7.5 A 1.5 1.5 0 0 1 6 20 Z M 17.5 7.5 H 19.5 A 2 2 0 0 1 19.5 11.5 H 15.5') +
      A('M 11 2.2 V 3.6 M 11 16.8 C 12.2 18.2 12.2 19.5 11 20.2 C 9.8 19.5 9.8 18.2 11 16.8 Z'),
    'cellar':
      T('M 6 8.5 H 18 L 19 19.5 A 1.5 1.5 0 0 1 17.5 21 H 6.5 A 1.5 1.5 0 0 1 5 19.5 Z') +
      S('M 6 8.5 H 18 L 19 19.5 A 1.5 1.5 0 0 1 17.5 21 H 6.5 A 1.5 1.5 0 0 1 5 19.5 Z M 6 8.5 L 7.5 4 H 16.5 L 18 8.5 M 8.5 12 H 15.5 V 17.5 H 8.5 Z') +
      AF('M 12 6.2 A 1 1 0 1 1 11.99 6.2 Z') + A('M 12 13.4 C 11 14.5 13 15.2 12 16.3'),
    'palate':
      T('M 12 3 A 9 9 0 1 1 3 12 A 9 9 0 0 1 12 3 Z') +
      S('M 12 3 A 9 9 0 1 1 3 12 A 9 9 0 0 1 12 3 Z M 12 3 V 7 M 12 17 V 21 M 3 12 H 7 M 17 12 H 21') +
      A('M 12 7 L 16.2 10.5 L 14.5 16 H 9.5 L 7.8 10.5 Z') + AF('M 12 11 A 1.2 1.2 0 1 1 11.99 11 Z'),
    'lab':
      T('M 8.2 13.5 H 15.8 L 18.5 18.5 A 1.8 1.8 0 0 1 16.9 21 H 7.1 A 1.8 1.8 0 0 1 5.5 18.5 Z') +
      S('M 9.5 3.5 H 14.5 M 10.5 3.5 V 9 L 5.5 18.2 A 1.9 1.9 0 0 0 7.2 21 H 16.8 A 1.9 1.9 0 0 0 18.5 18.2 L 13.5 9 V 3.5') +
      A('M 7.8 14 H 16.2') + AF('M 10.5 17.5 A 1 1 0 1 1 10.49 17.5 Z M 13.8 16.5 A 0.9 0.9 0 1 1 13.79 16.5 Z'),
    'academy':
      T('M 3.5 6.5 C 6.5 5.5 9.5 6 12 7.5 C 14.5 6 17.5 5.5 20.5 6.5 V 18.5 C 17.5 17.5 14.5 18 12 19.5 C 9.5 18 6.5 17.5 3.5 18.5 Z') +
      S('M 12 7.5 V 19.5 M 3.5 6.5 C 6.5 5.5 9.5 6 12 7.5 C 14.5 6 17.5 5.5 20.5 6.5 V 18.5 C 17.5 17.5 14.5 18 12 19.5 C 9.5 18 6.5 17.5 3.5 18.5 Z') +
      A('M 6.5 10.2 H 9.5 M 6.5 13.2 H 9.5 M 14.5 10.2 H 17.5 M 14.5 13.2 H 17.5'),

    /* ==================== B. 23 DISTINCT SPECIALTY BREWER SILHOUETTES ==================== */
    'brewer-v60':
      T('M 4 5.5 H 18 L 12.8 16.5 H 9.2 Z') +
      S('M 4 5.5 H 18 L 12.8 16.5 H 9.2 Z M 5.5 16.5 H 16.5 M 18 7.5 H 20 A 2 2 0 0 1 20 11.5 H 15.2 M 7.5 19.5 H 14.5') +
      A('M 7.5 8 C 9.5 10.5 10.2 13 10.8 15.5 M 11 7.5 C 12 10.5 12 13 11.5 15.5 M 14.5 8 C 13.8 10.8 13 13 12.2 15.5'),
    'brewer-origami':
      T('M 4 5 H 20 L 13 16.5 H 11 Z') +
      S('M 4 5 L 7 6.2 L 9.5 5 L 12 6.2 L 14.5 5 L 17 6.2 L 20 5 L 13.2 16.5 H 10.8 Z M 8 5.8 L 11.4 16.5 M 12 6.2 V 16.5 M 16 5.8 L 12.6 16.5') +
      A('M 6.5 16.5 H 17.5 V 19 H 6.5 Z'),
    'brewer-kalita':
      T('M 3.5 6 H 18.5 L 15.5 16.5 H 6.5 Z') +
      S('M 3.5 6 H 18.5 L 15.5 16.5 H 6.5 Z M 5 16.5 H 17 M 18.2 8 H 20.2 A 1.8 1.8 0 0 1 20.2 11.6 H 17') +
      A('M 6.5 8.5 H 15.5 M 7.2 11.2 H 14.8 M 7.8 13.8 H 14.2') +
      AF('M 8.5 19 A 0.9 0.9 0 1 1 8.49 19 Z M 11 19 A 0.9 0.9 0 1 1 10.99 19 Z M 13.5 19 A 0.9 0.9 0 1 1 13.49 19 Z'),
    'brewer-orea':
      T('M 5.5 5.5 H 18.5 L 16.5 16.5 H 7.5 Z') +
      S('M 5.5 5.5 H 18.5 L 16.5 16.5 H 7.5 Z M 4 16.5 H 20 V 18.8 H 4 Z') +
      A('M 8.5 9.5 H 15.5 M 9.5 21 H 14.5'),
    'brewer-pulsar':
      T('M 7.5 4 H 16.5 V 16.5 H 7.5 Z') +
      S('M 7.5 4 H 16.5 V 16.5 H 7.5 Z M 5.5 16.5 H 18.5 M 9 16.5 V 20.5 H 15 V 16.5') +
      A('M 16.5 14.5 H 20 M 7.8 9.5 H 16.2'),
    'brewer-chemex':
      T('M 6 4 H 18 L 14 11.5 L 18.5 19 A 1.5 1.5 0 0 1 17.2 21 H 6.8 A 1.5 1.5 0 0 1 5.5 19 L 10 11.5 Z') +
      S('M 6 4 H 18 L 14 11.5 L 18.5 19 A 1.5 1.5 0 0 1 17.2 21 H 6.8 A 1.5 1.5 0 0 1 5.5 19 L 10 11.5 Z') +
      A('M 9.3 10 H 14.7 L 14.2 13 H 9.8 Z M 12 11.5 V 15.5') + AF('M 12 15.8 A 1.2 1.2 0 1 1 11.99 15.8 Z'),
    'brewer-nel':
      T('M 5.5 7 H 15.5 C 15.5 13.5 13.5 18 10.5 18 C 7.5 18 5.5 13.5 5.5 7 Z') +
      S('M 4.5 7 H 16.5 M 5.5 7 C 5.5 13.5 7.5 18 10.5 18 C 13.5 18 15.5 13.5 15.5 7') +
      A('M 16.5 7 L 21 5.5 M 10.5 19.5 V 21'),
    'brewer-drip':
      T('M 5 4 H 19 V 8.5 H 11 V 19.5 H 5 Z') +
      S('M 5 4 H 19 V 8.5 H 11 V 20.5 H 5 Z M 5 20.5 H 19 M 12.5 12 H 18 L 18.8 18.5 A 1.5 1.5 0 0 1 17.3 20.5 H 13.2 A 1.5 1.5 0 0 1 11.7 18.5 Z') +
      A('M 12.5 8.5 L 14 11.5 H 16.5 L 18 8.5 M 12.3 16.2 H 18.2'),
    'brewer-aiden':
      T('M 4.5 4 H 19.5 A 1.5 1.5 0 0 1 21 5.5 V 19.5 A 1.5 1.5 0 0 1 19.5 21 H 4.5 A 1.5 1.5 0 0 1 3 19.5 V 5.5 A 1.5 1.5 0 0 1 4.5 4 Z') +
      S('M 4.5 4 H 19.5 A 1.5 1.5 0 0 1 21 5.5 V 19.5 A 1.5 1.5 0 0 1 19.5 21 H 4.5 A 1.5 1.5 0 0 1 3 19.5 V 5.5 A 1.5 1.5 0 0 1 4.5 4 Z M 11.5 4 V 21 M 11.5 11.5 H 21 M 14 14.5 H 19 V 21 H 14 Z') +
      A('M 16.5 6 A 2 2 0 1 1 16.49 6 Z'),
    'brewer-xbloom':
      T('M 5 3.5 H 18 V 8 H 9.5 V 20.5 H 5 Z') +
      S('M 5 3.5 H 18 V 8 H 9.5 V 20.5 H 19 M 5 3.5 V 20.5 H 9.5') +
      A('M 12 9.5 H 17.5 L 15.8 14 H 13.7 Z M 12.5 16 H 17 V 20.5 H 12.5 Z'),
    'brewer-switch':
      T('M 4.5 4.5 H 17.5 L 12.8 14.5 H 9.2 Z') +
      S('M 4.5 4.5 H 17.5 L 12.8 14.5 H 9.2 Z M 7.5 14.5 H 14.5 V 18.5 H 7.5 Z M 5.5 20.5 H 16.5') +
      A('M 14.5 16.5 L 19.5 14.8') + AF('M 11 16.5 A 1.3 1.3 0 1 1 10.99 16.5 Z M 19.8 14.7 A 1.2 1.2 0 1 1 19.79 14.7 Z'),
    'brewer-clever':
      T('M 4 5 H 17.5 L 15 16 H 6.5 Z') +
      S('M 4 5 H 17.5 L 15 16 H 6.5 Z M 17.2 7 H 19.8 A 2 2 0 0 1 19.8 12.5 H 16 M 5 18.5 H 16.5') +
      A('M 7.5 16 V 18.5 H 14 V 16 M 6 10.5 H 15.5'),
    'brewer-aeropress':
      T('M 8 8.5 H 16 V 18.5 H 8 Z') +
      S('M 7 3.5 H 17 M 9.5 3.5 V 8.5 H 14.5 V 3.5 M 8 8.5 H 16 V 18.5 H 8 Z M 6 18.5 H 18 M 7.5 18.5 V 20.8 H 16.5 V 18.5') +
      A('M 9.5 11.5 H 14.5 M 9.5 14.5 H 14.5'),
    'brewer-siphon':
      T('M 12 3.5 A 4.2 4.2 0 1 1 11.99 3.5 Z M 12 12.5 A 4.5 4.5 0 1 1 11.99 12.5 Z') +
      S('M 12 3.5 A 4.2 4.2 0 1 1 11.99 3.5 Z M 12 12.2 A 4.4 4.4 0 1 1 11.99 12.2 Z M 7 21 H 17 M 8.5 21 V 16.5 M 15.5 21 V 16.5') +
      A('M 12 7.8 V 15.5'),
    'brewer-press':
      T('M 6.5 8 H 16.5 V 19.5 A 1.5 1.5 0 0 1 15 21 H 8 A 1.5 1.5 0 0 1 6.5 19.5 Z') +
      S('M 5.5 6.5 H 16.5 V 19.5 A 1.5 1.5 0 0 1 15 21 H 8 A 1.5 1.5 0 0 1 6.5 19.5 V 6.5 M 11.5 3 V 14 M 9.5 3 H 13.5 M 16.5 9.5 H 19 A 2 2 0 0 1 19 16.5 H 16.5') +
      A('M 6.8 14 H 16.2'),
    'brewer-turkish':
      T('M 6.5 8.5 H 14.5 L 16.5 19.5 H 4.5 Z') +
      S('M 5.5 8.5 H 15 L 16.5 19.5 H 4.5 L 6.5 8.5 M 14.8 10.5 L 21 6.5') +
      A('M 7.5 5.5 Q 9 4 8 2.8 M 11.5 5.5 Q 13 4 12 2.8 M 5.8 14 H 15.2'),
    'brewer-phin':
      T('M 7 6.5 H 17 V 13.5 H 7 Z') +
      S('M 6.5 5.5 H 17.5 M 12 3.5 V 5.5 M 7 6.5 H 17 V 13.5 H 7 Z M 4.5 13.5 H 19.5 M 7.5 13.5 V 19.5 A 1.5 1.5 0 0 0 9 21 H 15 A 1.5 1.5 0 0 0 16.5 19.5 V 13.5') +
      A('M 9.5 16.8 V 18.5 M 12 16.8 V 19.2 M 14.5 16.8 V 18.5'),
    'brewer-cold':
      T('M 7 4.5 H 17 L 18 19 A 2 2 0 0 1 16 21 H 8 A 2 2 0 0 1 6 19 Z') +
      S('M 7 4.5 H 17 L 18 19 A 2 2 0 0 1 16 21 H 8 A 2 2 0 0 1 6 19 Z M 9.5 4.5 V 15 H 14.5 V 4.5') +
      A('M 6.8 12.5 H 17.2 M 12 17.2 V 19.5 M 10.8 18.3 H 13.2'),
    'brewer-cold-drip':
      T('M 8.5 3 H 15.5 V 7.5 H 8.5 Z M 9 10 H 15 V 14.5 H 9 Z M 8 17 H 16 L 16.8 21 H 7.2 Z') +
      S('M 6 3 V 21 M 18 3 V 21 M 5 21 H 19 M 8.5 3 H 15.5 V 7.5 H 8.5 Z M 9 10 H 15 V 14.5 H 9 Z M 8 17 H 16 L 16.8 21 H 7.2 Z') +
      A('M 12 7.5 V 9.8 M 10.5 8.6 H 13.5') + AF('M 12 15.8 A 0.95 0.95 0 1 1 11.99 15.8 Z'),
    'brewer-espresso':
      T('M 5 8 H 15 V 12.5 A 4.5 4.5 0 0 1 10.5 17 H 9.5 A 4.5 4.5 0 0 1 5 12.5 Z') +
      S('M 5 8 H 15 V 12.5 A 4.5 4.5 0 0 1 10.5 17 H 9.5 A 4.5 4.5 0 0 1 5 12.5 Z M 15 9.8 L 21 9.8 M 8.5 17 V 19 L 7 20.5 M 11.5 17 V 19 L 13 20.5') +
      A('M 7 5 H 13') + AF('M 10 21 A 1.1 1.1 0 1 1 9.99 21 Z'),
    'brewer-lever-espresso':
      T('M 8.5 9 H 15.5 V 14.5 H 8.5 Z') +
      S('M 5 20.5 H 19 M 7.5 20.5 V 7.5 H 16.5 V 20.5 M 9 14.5 H 15') +
      A('M 12 7.5 L 20.5 3.5 M 12 5.2 A 1.8 1.8 0 1 1 11.99 5.2 Z') + AF('M 12 17.8 A 1.2 1.2 0 1 1 11.99 17.8 Z'),
    'brewer-moka':
      T('M 7 5.5 H 16 L 14.5 12.5 H 8.5 Z M 8.5 12.5 H 14.5 L 16.5 20.5 H 6.5 Z') +
      S('M 6 5.5 H 16 L 14.5 12.5 H 8.5 L 7 5.5 M 8.5 12.5 H 14.5 L 16.5 20.5 H 6.5 Z M 11.5 5.5 V 3.5 M 16 7 H 19 L 19.5 11.5 L 15.2 12') +
      A('M 8.2 12.5 H 14.8 M 11.5 6 V 20'),
    'brewer-philips5500':
      T('M 4 3.5 H 20 V 9 H 4 Z M 15 11.5 H 19.5 V 18.5 H 15 Z') +
      S('M 4 3.5 H 20 V 20.5 H 4 Z M 4 9 H 20 M 8.5 9 V 12.5 M 11.5 9 V 12.5 M 7.5 15 H 12.5 V 20.5 H 7.5 Z') +
      A('M 6.5 6.2 H 13.5 M 15.2 11.5 H 19.2 V 18.2 H 15.2 Z') + AF('M 16.8 6.2 A 1 1 0 1 1 16.79 6.2 Z'),

    /* ==================== C. 18 SENSORY, BEAN, PROCESS & AFFECT ICONS ==================== */
    'cherry-washed':
      T('M 11.5 7.5 A 6.5 6.5 0 1 1 11.49 7.5 Z') +
      S('M 11.5 7.5 A 6.5 6.5 0 1 1 11.49 7.5 Z M 11.5 7.5 C 11.5 4.5 14 3 16.5 3') +
      A('M 18.5 13.5 C 20.5 16 21 17.5 21 19 A 2.5 2.5 0 1 1 16 19 C 16 17.5 16.5 16 18.5 13.5 Z'),
    'cherry-honey':
      T('M 12 7 A 6.8 6.8 0 1 1 11.99 7 Z') +
      S('M 12 7 A 6.8 6.8 0 1 1 11.99 7 Z M 12 7 C 12 4.5 14.5 3 17 3') +
      A('M 8 12.5 Q 10 15.5 12 12.5 Q 14 15.5 16 12.5 M 12 15.5 V 17.8'),
    'cherry-natural':
      T('M 10 9.5 A 5.8 5.8 0 1 1 9.99 9.5 Z') +
      S('M 10 9.5 A 5.8 5.8 0 1 1 9.99 9.5 Z M 10 9.5 C 10 7 12 5.5 14 5.5') +
      A('M 17.5 4 A 2.5 2.5 0 1 1 17.49 4 Z M 17.5 2 V 3 M 17.5 10 V 11 M 13.5 6.5 H 14.5 M 20.5 6.5 H 21.5'),
    'anaerobic-tank':
      T('M 6.5 6.5 H 17.5 V 18 A 2 2 0 0 1 15.5 20 H 8.5 A 2 2 0 0 1 6.5 18 Z') +
      S('M 6.5 6.5 H 17.5 V 18 A 2 2 0 0 1 15.5 20 H 8.5 A 2 2 0 0 1 6.5 18 Z M 5.5 6.5 H 18.5 M 8.5 20 V 21.5 M 15.5 20 V 21.5') +
      A('M 12 6.5 V 3.5 H 16.5 V 5.5 M 10 15 A 1 1 0 1 1 9.99 15 Z M 13.5 12.5 A 1.2 1.2 0 1 1 13.49 12.5 Z'),
    'decaf-leaf':
      T('M 19.5 4.5 C 11 4.5 5 9.5 5 17.5 C 13 17.5 19.5 12.5 19.5 4.5 Z') +
      S('M 19.5 4.5 C 11 4.5 5 9.5 5 17.5 C 13 17.5 19.5 12.5 19.5 4.5 Z M 4 19.5 C 8 15.5 12.5 11.5 16.5 8') +
      A('M 16.5 15.5 A 3.5 3.5 0 1 1 13.5 20'),
    'cryo-snowflake':
      T('M 12 6.5 L 16.8 9.2 V 14.8 L 12 17.5 L 7.2 14.8 V 9.2 Z') +
      S('M 12 2.5 V 21.5 M 3.8 7.2 L 20.2 16.8 M 20.2 7.2 L 3.8 16.8') +
      A('M 9.5 4.5 L 12 6.5 L 14.5 4.5 M 9.5 19.5 L 12 17.5 L 14.5 19.5'),
    'roast-flame':
      T('M 12 3 C 15.5 7.5 19 10 19 14.5 A 7 7 0 0 1 5 14.5 C 5 10.8 7.5 8.5 8.8 6.5 C 9.2 8.5 10.5 9.2 10.8 9.2 C 10.8 6.5 11.2 4.8 12 3 Z') +
      S('M 12 3 C 15.5 7.5 19 10 19 14.5 A 7 7 0 0 1 5 14.5 C 5 10.8 7.5 8.5 8.8 6.5 C 9.2 8.5 10.5 9.2 10.8 9.2 C 10.8 6.5 11.2 4.8 12 3 Z') +
      A('M 12 12 C 13.8 14 14.5 15.2 14.5 16.8 A 2.5 2.5 0 0 1 9.5 16.8 C 9.5 15.2 10.2 14 12 12 Z'),
    'altitude-peaks':
      T('M 2.5 19.5 L 9.5 6.5 L 14 14.5 L 17.2 9.5 L 21.5 19.5 Z') +
      S('M 2.5 19.5 L 9.5 6.5 L 14 14.5 L 17.2 9.5 L 21.5 19.5 Z') +
      A('M 7 11.2 L 9.5 12.5 L 11.8 10.8 M 9.5 6.5 V 3.5 L 13 4.8 L 9.5 6'),
    'origin-globe':
      T('M 12 3 A 9 9 0 1 1 11.99 3 Z') +
      S('M 12 3 A 9 9 0 1 1 11.99 3 Z M 12 3 C 15.2 6 15.2 18 12 21 C 8.8 18 8.8 6 12 3 Z') +
      A('M 3.2 12 H 20.8 M 4.8 8.2 H 19.2 M 4.8 15.8 H 19.2'),
    'bean-rating':
      T('M 12 3.5 C 16.5 3.5 18.5 7.5 18.5 12 C 18.5 16.5 16.5 20.5 12 20.5 C 7.5 20.5 5.5 16.5 5.5 12 C 5.5 7.5 7.5 3.5 12 3.5 Z') +
      S('M 12 3.5 C 16.5 3.5 18.5 7.5 18.5 12 C 18.5 16.5 16.5 20.5 12 20.5 C 7.5 20.5 5.5 16.5 5.5 12 C 5.5 7.5 7.5 3.5 12 3.5 Z') +
      A('M 12 4.2 C 9.5 8.5 14.5 11.5 12 15.5 C 10.5 17.5 11.2 19 12 19.8'),
    'aroma-steam':
      T('M 5 15 H 19 A 5 5 0 0 1 14 20 H 10 A 5 5 0 0 1 5 15 Z') +
      S('M 5 15 H 19 A 5 5 0 0 1 14 20 H 10 A 5 5 0 0 1 5 15 Z') +
      A('M 8.5 12 C 7 9.5 10 8 8.5 5.5 M 12 12 C 10.5 9.5 13.5 8 12 5.5 M 15.5 12 C 14 9.5 17 8 15.5 5.5'),
    'flavor-floral':
      T('M 12 8 A 4 4 0 1 1 11.99 8 Z') +
      S('M 12 3.5 A 3 3 0 0 1 14.6 8 A 3 3 0 0 1 18.5 12.5 A 3 3 0 0 1 14.5 17.5 A 3 3 0 0 1 9.5 17.5 A 3 3 0 0 1 5.5 12.5 A 3 3 0 0 1 9.4 8 A 3 3 0 0 1 12 3.5 Z') +
      AF('M 12 10.2 A 1.8 1.8 0 1 1 11.99 10.2 Z'),
    'flavor-citrus':
      T('M 12 3.5 A 8.5 8.5 0 1 1 11.99 3.5 Z') +
      S('M 12 3.5 A 8.5 8.5 0 1 1 11.99 3.5 Z') +
      A('M 12 5.5 V 18.5 M 5.5 12 H 18.5 M 7.4 7.4 L 16.6 16.6 M 16.6 7.4 L 7.4 16.6'),
    'flavor-cocoa':
      T('M 12 3.5 C 16.8 6.5 17.5 12.5 12 20.5 C 6.5 12.5 7.2 6.5 12 3.5 Z') +
      S('M 12 3.5 C 16.8 6.5 17.5 12.5 12 20.5 C 6.5 12.5 7.2 6.5 12 3.5 Z') +
      A('M 12 5.5 V 18.5 M 8.8 10.5 H 15.2 M 9 14.2 H 15'),
    'affect-love':
      T('M 12 3 A 9 9 0 1 1 11.99 3 Z') +
      S('M 12 3 A 9 9 0 1 1 11.99 3 Z M 8 14.2 Q 12 18.2 16 14.2') +
      AF('M 9 9.5 A 1.2 1.2 0 1 1 8.99 9.5 Z M 15 9.5 A 1.2 1.2 0 1 1 14.99 9.5 Z'),
    'affect-good':
      T('M 12 3 A 9 9 0 1 1 11.99 3 Z') +
      S('M 12 3 A 9 9 0 1 1 11.99 3 Z M 8.8 14.5 Q 12 16.8 15.2 14.5') +
      AF('M 9.2 10 A 1.1 1.1 0 1 1 9.19 10 Z M 14.8 10 A 1.1 1.1 0 1 1 14.79 10 Z'),
    'affect-neutral':
      T('M 12 3 A 9 9 0 1 1 11.99 3 Z') +
      S('M 12 3 A 9 9 0 1 1 11.99 3 Z M 9 15 H 15') +
      AF('M 9.2 10 A 1.1 1.1 0 1 1 9.19 10 Z M 14.8 10 A 1.1 1.1 0 1 1 14.79 10 Z'),
    'affect-miss':
      T('M 12 3 A 9 9 0 1 1 11.99 3 Z') +
      S('M 12 3 A 9 9 0 1 1 11.99 3 Z M 8.8 16.2 Q 12 13.5 15.2 16.2') +
      AF('M 9.2 10.2 A 1.1 1.1 0 1 1 9.19 10.2 Z M 14.8 10.2 A 1.1 1.1 0 1 1 14.79 10.2 Z'),

    /* ==================== D. 8 HARDWARE & BLE INSTRUMENT ICONS ==================== */
    'ble-wave':
      T('M 11.5 4.5 L 16 8.5 L 11.5 12 L 16 15.5 L 11.5 19.5 Z') +
      S('M 7 8.5 L 15.5 15.5 L 11.5 19.5 V 4.5 L 15.5 8.5 L 7 15.5') +
      A('M 18 8.5 A 5 5 0 0 1 18 15.5 M 20.5 6.2 A 8.2 8.2 0 0 1 20.5 17.8'),
    'scale-deck':
      T('M 4 11 H 20 A 1.5 1.5 0 0 1 21.5 12.5 V 18.5 A 1.5 1.5 0 0 1 20 20 H 4 A 1.5 1.5 0 0 1 2.5 18.5 V 12.5 A 1.5 1.5 0 0 1 4 11 Z') +
      S('M 4 11 H 20 A 1.5 1.5 0 0 1 21.5 12.5 V 18.5 A 1.5 1.5 0 0 1 20 20 H 4 A 1.5 1.5 0 0 1 2.5 18.5 V 12.5 A 1.5 1.5 0 0 1 4 11 Z M 6 7.5 H 18 M 12 7.5 V 11') +
      A('M 6.5 14.5 H 13.5 V 17 H 6.5 Z') + AF('M 17.5 15.8 A 1.1 1.1 0 1 1 17.49 15.8 Z'),
    'refract-prism':
      T('M 11.5 4.5 L 19.5 19 H 3.5 Z') +
      S('M 11.5 4.5 L 19.5 19 H 3.5 Z') +
      A('M 2.5 13.5 L 8.5 11.5 L 15 12.5 L 21.5 9.5 M 15 12.5 L 21.5 15'),
    'omni-nir':
      T('M 5 4.5 H 19 A 1.5 1.5 0 0 1 20.5 6 V 9.5 H 3.5 V 6 A 1.5 1.5 0 0 1 5 4.5 Z') +
      S('M 5 4.5 H 19 A 1.5 1.5 0 0 1 20.5 6 V 9.5 H 3.5 V 6 A 1.5 1.5 0 0 1 5 4.5 Z M 6 19.5 H 18') +
      A('M 8.5 9.5 L 6.5 17 M 12 9.5 V 17 M 15.5 9.5 L 17.5 17') + AF('M 12 19.5 A 1.3 1.3 0 1 1 11.99 19.5 Z'),
    'grinder-burr':
      T('M 12 5 A 7 7 0 1 1 11.99 5 Z') +
      S('M 12 3.5 A 8.5 8.5 0 1 1 11.99 3.5 Z M 12 8.5 A 3.5 3.5 0 1 1 11.99 8.5 Z') +
      A('M 12 3.5 V 8.5 M 12 15.5 V 20.5 M 3.5 12 H 8.5 M 15.5 12 H 20.5 M 6 6 L 9.5 9.5 M 14.5 14.5 L 18 18'),
    'pressure-gauge':
      T('M 12 4 A 8 8 0 1 1 11.99 4 Z') +
      S('M 12 4 A 8 8 0 1 1 11.99 4 Z M 10 20 V 21.5 H 14 V 20') +
      A('M 12 12 L 16.2 8.2 M 7.5 14.5 A 5.2 5.2 0 0 1 16.5 14.5') + AF('M 12 12 A 1.4 1.4 0 1 1 11.99 12 Z'),
    'kettle-gooseneck':
      T('M 6 9 H 14 L 15 19 H 5 Z') +
      S('M 6 9 H 14 L 15 19 H 5 Z M 7 6.5 H 13 M 10 5 V 6.5 M 6 11 H 3.5 V 16.5 H 5.2') +
      A('M 14.8 16.5 C 18 16.5 18 10 21 9.5'),
    'lattego-carafe':
      T('M 7 5.5 H 16.5 V 18.5 A 2 2 0 0 1 14.5 20.5 H 9 A 2 2 0 0 1 7 18.5 Z') +
      S('M 7 5.5 H 16.5 V 18.5 A 2 2 0 0 1 14.5 20.5 H 9 A 2 2 0 0 1 7 18.5 Z M 6 5.5 H 17.5 M 16.5 7.5 L 19.5 6.5') +
      A('M 7.3 11.5 Q 11.8 9.5 16.2 11.5 M 11.8 5.5 V 19'),

    /* ==================== E. 22 ACTION & EPISTEMIC ICONS ==================== */
    'xray-loupe':
      T('M 10.5 4 A 6.8 6.8 0 1 1 10.49 4 Z') +
      S('M 10.5 4 A 6.8 6.8 0 1 1 10.49 4 Z M 15.5 15.8 L 20.5 20.8') +
      A('M 6.5 11 C 8.5 7.5 10 14.5 12 10.5 C 13 8.5 13.8 11 14.5 11'),
    'brew-twin':
      T('M 4 5.5 H 11 L 8.5 12 H 6.5 Z M 13.5 12 H 19.5 V 18.5 A 1.5 1.5 0 0 1 18 20 H 15 A 1.5 1.5 0 0 1 13.5 18.5 Z') +
      S('M 4 5.5 H 11 L 8.5 12 H 6.5 Z M 13.5 12 H 19.5 V 18.5 A 1.5 1.5 0 0 1 18 20 H 15 A 1.5 1.5 0 0 1 13.5 18.5 Z') +
      A('M 13.5 6.5 H 19.5 M 17.5 4.5 L 19.5 6.5 L 17.5 8.5 M 10.5 17.5 H 4.5 M 6.5 15.5 L 4.5 17.5 L 6.5 19.5'),
    'lock-pin':
      T('M 6 10.5 H 18 A 1.5 1.5 0 0 1 19.5 12 V 19 A 1.5 1.5 0 0 1 18 20.5 H 6 A 1.5 1.5 0 0 1 4.5 19 V 12 A 1.5 1.5 0 0 1 6 10.5 Z') +
      S('M 6 10.5 H 18 A 1.5 1.5 0 0 1 19.5 12 V 19 A 1.5 1.5 0 0 1 18 20.5 H 6 A 1.5 1.5 0 0 1 4.5 19 V 12 A 1.5 1.5 0 0 1 6 10.5 Z M 8 10.5 V 7.5 A 4 4 0 0 1 16 7.5 V 10.5') +
      A('M 12 14 V 17') + AF('M 12 14 A 1.2 1.2 0 1 1 11.99 14 Z'),
    'unlock':
      T('M 6 10.5 H 18 A 1.5 1.5 0 0 1 19.5 12 V 19 A 1.5 1.5 0 0 1 18 20.5 H 6 A 1.5 1.5 0 0 1 4.5 19 V 12 A 1.5 1.5 0 0 1 6 10.5 Z') +
      S('M 6 10.5 H 18 A 1.5 1.5 0 0 1 19.5 12 V 19 A 1.5 1.5 0 0 1 18 20.5 H 6 A 1.5 1.5 0 0 1 4.5 19 V 12 A 1.5 1.5 0 0 1 6 10.5 Z M 8 10.5 V 7 A 4 4 0 0 1 15.5 5.2') +
      A('M 12 14 V 17'),
    'scan-lens':
      T('M 12 7.2 C 14.8 7.2 16 9.4 16 12 C 16 14.6 14.8 16.8 12 16.8 C 9.2 16.8 8 14.6 8 12 C 8 9.4 9.2 7.2 12 7.2 Z') +
      S('M 4 8.5 V 5.5 A 1.5 1.5 0 0 1 5.5 4 H 8.5 M 15.5 4 H 18.5 A 1.5 1.5 0 0 1 20 5.5 V 8.5 M 20 15.5 V 18.5 A 1.5 1.5 0 0 1 18.5 20 H 15.5 M 8.5 20 H 5.5 A 1.5 1.5 0 0 1 4 18.5 V 15.5 M 12 7.2 C 14.8 7.2 16 9.4 16 12 C 16 14.6 14.8 16.8 12 16.8 C 9.2 16.8 8 14.6 8 12 C 8 9.4 9.2 7.2 12 7.2 Z') +
      A('M 5.5 12 H 18.5'),
    'paste-card':
      T('M 6 5.5 H 18 A 1.5 1.5 0 0 1 19.5 7 V 19.5 A 1.5 1.5 0 0 1 18 21 H 6 A 1.5 1.5 0 0 1 4.5 19.5 V 7 A 1.5 1.5 0 0 1 6 5.5 Z') +
      S('M 8.5 5.5 H 6 A 1.5 1.5 0 0 0 4.5 7 V 19.5 A 1.5 1.5 0 0 0 6 21 H 18 A 1.5 1.5 0 0 0 19.5 19.5 V 7 A 1.5 1.5 0 0 0 18 5.5 H 15.5 M 9 3.5 H 15 V 7 H 9 Z') +
      A('M 8.5 11.5 H 15.5 M 8.5 15 H 13.5'),
    'qr-passport':
      T('M 4 4 H 10 V 10 H 4 Z M 14 4 H 20 V 10 H 14 Z M 4 14 H 10 V 20 H 4 Z') +
      S('M 4 4 H 10 V 10 H 4 Z M 14 4 H 20 V 10 H 14 Z M 4 14 H 10 V 20 H 4 Z M 14 14 H 16.5 V 16.5 H 14 Z M 17.5 17.5 H 20 V 20 H 17.5 Z') +
      AF('M 6.2 6.2 H 7.8 V 7.8 H 6.2 Z M 16.2 6.2 H 17.8 V 7.8 H 16.2 Z M 6.2 16.2 H 7.8 V 17.8 H 6.2 Z M 18 14 H 20 V 15.8 H 18 Z'),
    'salami-cups':
      T('M 3 9 H 8 L 7.3 18 H 3.7 Z M 9.5 9 H 14.5 L 13.8 18 H 10.2 Z M 16 9 H 21 L 20.3 18 H 16.7 Z') +
      S('M 3 9 H 8 L 7.3 18 H 3.7 Z M 9.5 9 H 14.5 L 13.8 18 H 10.2 Z M 16 9 H 21 L 20.3 18 H 16.7 Z') +
      A('M 3.4 12.5 H 7.6 M 9.9 14 H 14.1 M 16.4 15.5 H 20.6'),
    'water-drop':
      T('M 12 3.2 C 16.5 9.2 19 12.5 19 15.5 A 7 7 0 1 1 5 15.5 C 5 12.5 7.5 9.2 12 3.2 Z') +
      S('M 12 3.2 C 16.5 9.2 19 12.5 19 15.5 A 7 7 0 1 1 5 15.5 C 5 12.5 7.5 9.2 12 3.2 Z') +
      A('M 8.5 15.5 A 3.8 3.8 0 0 0 12 18.8'),
    'sun-light':
      T('M 12 7.2 A 4.8 4.8 0 1 1 11.99 7.2 Z') +
      S('M 12 7.2 A 4.8 4.8 0 1 1 11.99 7.2 Z') +
      A('M 12 2.5 V 4.5 M 12 19.5 V 21.5 M 2.5 12 H 4.5 M 19.5 12 H 21.5 M 5.3 5.3 L 6.7 6.7 M 17.3 17.3 L 18.7 18.7 M 18.7 5.3 L 17.3 6.7 M 6.7 17.3 L 5.3 18.7'),
    'moon-dark':
      T('M 19.5 14.8 A 8 8 0 1 1 9.2 4.5 A 6.2 6.2 0 0 0 19.5 14.8 Z') +
      S('M 19.5 14.8 A 8 8 0 1 1 9.2 4.5 A 6.2 6.2 0 0 0 19.5 14.8 Z') +
      AF('M 16.5 5 L 17.1 6.4 L 18.5 7 L 17.1 7.6 L 16.5 9 L 15.9 7.6 L 14.5 7 L 15.9 6.4 Z'),
    'check-seal':
      T('M 12 3 A 9 9 0 1 1 11.99 3 Z') +
      S('M 12 3 A 9 9 0 1 1 11.99 3 Z') +
      A('M 8.2 12.3 L 10.8 14.9 L 16 9.5'),
    'spark-star':
      T('M 12 2.8 Q 13.8 10.2 21.2 12 Q 13.8 13.8 12 21.2 Q 10.2 13.8 2.8 12 Q 10.2 10.2 12 2.8 Z') +
      S('M 12 2.8 Q 13.8 10.2 21.2 12 Q 13.8 13.8 12 21.2 Q 10.2 13.8 2.8 12 Q 10.2 10.2 12 2.8 Z') +
      AF('M 18.5 4.2 A 1.2 1.2 0 1 1 18.49 4.2 Z'),
    'cafe-cup':
      T('M 5 8.5 H 16.5 V 13.5 A 5.5 5.5 0 0 1 11 19 H 10.5 A 5.5 5.5 0 0 1 5 13.5 Z') +
      S('M 5 8.5 H 16.5 V 13.5 A 5.5 5.5 0 0 1 11 19 H 10.5 A 5.5 5.5 0 0 1 5 13.5 Z M 16.5 10 H 19 A 2.2 2.2 0 0 1 19 14.5 H 16.2 M 3.5 21 H 18') +
      A('M 8.5 5.5 Q 9.5 4 8.5 3 M 12.5 5.5 Q 13.5 4 12.5 3'),
    'calendar-date':
      T('M 4 5.5 H 20 V 9.5 H 4 Z') +
      S('M 5.5 5.5 H 18.5 A 1.5 1.5 0 0 1 20 7 V 19 A 1.5 1.5 0 0 1 18.5 20.5 H 5.5 A 1.5 1.5 0 0 1 4 19 V 7 A 1.5 1.5 0 0 1 5.5 5.5 Z M 4 9.5 H 20 M 8 3.5 V 6.5 M 16 3.5 V 6.5') +
      AF('M 12 13.5 A 1.6 1.6 0 1 1 11.99 13.5 Z'),
    'scoop-preground':
      T('M 5 10.5 H 13.5 A 4.2 4.2 0 0 1 9.2 17.5 A 4.2 4.2 0 0 1 5 10.5 Z') +
      S('M 5 10.5 H 13.5 A 4.2 4.2 0 0 1 9.2 17.5 A 4.2 4.2 0 0 1 5 10.5 Z M 13.5 11.2 L 20.5 7.5') +
      A('M 6.5 10.5 C 7.5 8 11 8 12 10.5'),
    'extrashot-bolt':
      T('M 13 3 L 6.5 13 H 12 L 10.5 21 L 17.5 11 H 12 Z') +
      S('M 13 3 L 6.5 13 H 12 L 10.5 21 L 17.5 11 H 12 Z') +
      A('M 18.5 4.5 V 8.5 M 16.5 6.5 H 20.5'),
    'search-filter':
      T('M 10.5 4.5 A 6 6 0 1 1 10.49 4.5 Z') +
      S('M 10.5 4.5 A 6 6 0 1 1 10.49 4.5 Z M 15 15 L 20 20') +
      A('M 8 10.5 H 13 M 9.2 12.8 H 11.8'),
    'epistemic-verified':
      T('M 12 3 L 19 6 V 12 C 19 16.5 16 19.8 12 21.2 C 8 19.8 5 16.5 5 12 V 6 Z') +
      S('M 12 3 L 19 6 V 12 C 19 16.5 16 19.8 12 21.2 C 8 19.8 5 16.5 5 12 V 6 Z') +
      A('M 8.8 12.2 L 11 14.5 L 15.5 9.8'),
    'epistemic-research':
      T('M 12 4 A 8 8 0 1 1 11.99 4 Z') +
      S('M 6 9 C 9 5.5 15 5.5 18 9 C 15 12.5 9 12.5 6 9 Z M 6 15 C 9 11.5 15 11.5 18 15 C 15 18.5 9 18.5 6 15 Z') +
      AF('M 12 12 A 1.5 1.5 0 1 1 11.99 12 Z'),
    'epistemic-craft':
      T('M 12 4.5 L 19.5 12 L 12 19.5 L 4.5 12 Z') +
      S('M 12 4.5 L 19.5 12 L 12 19.5 L 4.5 12 Z') +
      A('M 9.5 12 H 14.5 M 12 9.5 V 14.5'),
    'epistemic-myth':
      T('M 12 3 A 9 9 0 1 1 11.99 3 Z') +
      S('M 12 3 A 9 9 0 1 1 11.99 3 Z') +
      A('M 9 9 L 15 15 M 15 9 L 9 15'),

    /* ==================== F. 12 REQUIRED UI / ALCHEMIST ICONS + COMPANIONS ==================== */
    'play':
      T('M 7.5 5.2 L 19 12 L 7.5 18.8 Z') +
      S('M 7.5 5.2 L 19 12 L 7.5 18.8 Z') +
      A('M 10.2 9.2 L 15 12 L 10.2 14.8'),
    'pause':
      T('M 6.5 5 H 10.5 V 19 H 6.5 Z M 13.5 5 H 17.5 V 19 H 13.5 Z') +
      S('M 6.5 5 H 10.5 V 19 H 6.5 Z M 13.5 5 H 17.5 V 19 H 13.5 Z') +
      A('M 8.5 8.5 V 15.5 M 15.5 8.5 V 15.5'),
    'tare-zero':
      T('M 5 7 H 19 A 2 2 0 0 1 21 9 V 17 A 2 2 0 0 1 19 19 H 5 A 2 2 0 0 1 3 17 V 9 A 2 2 0 0 1 5 7 Z') +
      S('M 5 7 H 19 A 2 2 0 0 1 21 9 V 17 A 2 2 0 0 1 19 19 H 5 A 2 2 0 0 1 3 17 V 9 A 2 2 0 0 1 5 7 Z M 8 4.5 H 16') +
      A('M 12 10 A 2.5 3 0 1 1 11.99 10 Z M 6.5 13 H 8.2 M 15.8 13 H 17.5'),
    'voice-sound':
      T('M 4.5 9.5 H 8.5 L 13.5 5.5 V 18.5 L 8.5 14.5 H 4.5 Z') +
      S('M 4.5 9.5 H 8.5 L 13.5 5.5 V 18.5 L 8.5 14.5 H 4.5 Z') +
      A('M 16.5 9 A 4.2 4.2 0 0 1 16.5 15 M 19 6.8 A 7.2 7.2 0 0 1 19 17.2'),
    'close-x':
      S('M 6.5 6.5 L 17.5 17.5 M 17.5 6.5 L 6.5 17.5'),
    'chevron-right':
      S('M 9 5.5 L 15.5 12 L 9 18.5'),
    'trash-bin':
      T('M 6.5 7.5 H 17.5 L 16.6 19.5 A 1.5 1.5 0 0 1 15.1 20.8 H 8.9 A 1.5 1.5 0 0 1 7.4 19.5 Z') +
      S('M 4.5 7.5 H 19.5 M 9.5 4.2 H 14.5 M 6.8 7.5 L 7.6 19.5 A 1.5 1.5 0 0 0 9.1 20.8 H 14.9 A 1.5 1.5 0 0 0 16.4 19.5 L 17.2 7.5') +
      A('M 10.2 11 V 17 M 13.8 11 V 17'),
    'share-card':
      T('M 5.5 10.5 H 18.5 A 1.5 1.5 0 0 1 20 12 V 19 A 1.5 1.5 0 0 1 18.5 20.5 H 5.5 A 1.5 1.5 0 0 1 4 19 V 12 A 1.5 1.5 0 0 1 5.5 10.5 Z') +
      S('M 8 10.5 H 5.5 A 1.5 1.5 0 0 0 4 12 V 19 A 1.5 1.5 0 0 0 5.5 20.5 H 18.5 A 1.5 1.5 0 0 0 20 19 V 12 A 1.5 1.5 0 0 0 18.5 10.5 H 16') +
      A('M 12 14.5 V 3.8 M 8.5 7.2 L 12 3.8 L 15.5 7.2'),
    'milk-pitcher':
      T('M 6.5 6.5 H 15.5 L 16.8 18.5 A 2 2 0 0 1 14.8 20.5 H 8.2 A 2 2 0 0 1 6.2 18.5 Z') +
      S('M 5 6.5 L 7 5.2 H 15.5 L 16.8 18.5 A 2 2 0 0 1 14.8 20.5 H 8.2 A 2 2 0 0 1 6.2 18.5 L 6.8 6.5 M 16 8.5 H 18.8 A 2.2 2.2 0 0 1 18.8 14.5 H 16.5') +
      A('M 8.2 13.5 Q 11.5 11.5 14.8 13.5'),
    'ice-cube':
      T('M 5.5 7.5 L 12 4 L 18.5 7.5 V 16.5 L 12 20 L 5.5 16.5 Z') +
      S('M 5.5 7.5 L 12 4 L 18.5 7.5 V 16.5 L 12 20 L 5.5 16.5 Z M 5.5 7.5 L 12 11 L 18.5 7.5 M 12 11 V 20') +
      A('M 8.8 7.5 L 12 9.2 L 15.2 7.5'),
    'vault-shield':
      T('M 12 3 L 19.5 6.2 V 12.2 C 19.5 16.8 16.2 20 12 21.3 C 7.8 20 4.5 16.8 4.5 12.2 V 6.2 Z') +
      S('M 12 3 L 19.5 6.2 V 12.2 C 19.5 16.8 16.2 20 12 21.3 C 7.8 20 4.5 16.8 4.5 12.2 V 6.2 Z') +
      A('M 12 9 A 2.5 2.5 0 1 1 11.99 9 Z M 12 14 V 16.8'),
    'fresh-bag':
      T('M 5.5 8 H 17.5 L 18.5 19.5 A 1.5 1.5 0 0 1 17 21 H 6 A 1.5 1.5 0 0 1 4.5 19.5 Z') +
      S('M 5.5 8 H 17.5 L 18.5 19.5 A 1.5 1.5 0 0 1 17 21 H 6 A 1.5 1.5 0 0 1 4.5 19.5 Z M 5.5 8 L 7 4 H 16 L 17.5 8') +
      A('M 19 3.5 L 19.8 5.7 L 22 6.5 L 19.8 7.3 L 19 9.5 L 18.2 7.3 L 16 6.5 L 18.2 5.7 Z M 11.5 11.5 C 10 13.5 13 15 11.5 17'),
    'chevron-left':
      S('M 15 5.5 L 8.5 12 L 15 18.5'),
    'chevron-down':
      S('M 5.5 9.2 L 12 15.5 L 18.5 9.2'),
    'plus-add':
      S('M 12 5.5 V 18.5 M 5.5 12 H 18.5'),
    'minus-step':
      S('M 6 12 H 18'),
    'undo-arc':
      T('M 12 5.5 A 7 7 0 1 1 5.5 14') +
      S('M 5 9.5 H 9.5 V 5 M 5.5 9.2 A 7 7 0 1 1 6.8 17.2') +
      A('M 12 9.5 V 12.5 L 14.2 13.8'),
    'edit-pen':
      T('M 14.5 5.5 L 18.5 9.5 L 9 19 H 5 V 15 Z') +
      S('M 14.5 5.5 L 18.5 9.5 L 9 19 H 5 V 15 Z M 12.5 7.5 L 16.5 11.5') +
      A('M 5 20.8 H 19'),
    'info-circle':
      T('M 12 3.5 A 8.5 8.5 0 1 1 11.99 3.5 Z') +
      S('M 12 3.5 A 8.5 8.5 0 1 1 11.99 3.5 Z M 12 11 V 16.5') +
      AF('M 12 7.8 A 1.2 1.2 0 1 1 11.99 7.8 Z'),
    'alert-triangle':
      T('M 12 4 L 20.5 19.5 H 3.5 Z') +
      S('M 12 4 L 20.5 19.5 H 3.5 Z M 12 9.5 V 14') +
      AF('M 12 16.8 A 1.1 1.1 0 1 1 11.99 16.8 Z'),
    'paragon-sphere':
      T('M 12 5 A 6.5 6.5 0 1 1 11.99 5 Z') +
      S('M 12 5 A 6.5 6.5 0 1 1 11.99 5 Z M 4 19.5 H 20') +
      A('M 9.2 8.5 A 3.8 3.8 0 0 1 14.2 7.5'),
    'caffeine-clock':
      T('M 12 3.5 A 8.5 8.5 0 1 1 11.99 3.5 Z') +
      S('M 12 3.5 A 8.5 8.5 0 1 1 11.99 3.5 Z M 12 7.2 V 12 L 15.5 14') +
      A('M 18.5 4.2 L 20.5 6.2'),

    /* ==================== G. v6.2 SHELL, KITCHEN AUDIO & WORKFLOW STROKE ICONS ==================== */
    'thermometer':
      T('M 10 5.5 A 2 2 0 0 1 14 5.5 V 13.8 A 3.8 3.8 0 1 1 10 13.8 Z') +
      S('M 10 5.5 A 2 2 0 0 1 14 5.5 V 13.8 A 3.8 3.8 0 1 1 10 13.8 Z M 15.8 6.5 H 18 M 15.8 9.5 H 17.4 M 15.8 12.5 H 18') +
      A('M 12 9.5 V 15.2') + AF('M 12 15.4 A 1.9 1.9 0 1 1 11.99 15.4 Z'),
    'backspace':
      T('M 8.8 6 H 19 A 1.5 1.5 0 0 1 20.5 7.5 V 16.5 A 1.5 1.5 0 0 1 19 18 H 8.8 L 3.5 12 Z') +
      S('M 8.8 6 H 19 A 1.5 1.5 0 0 1 20.5 7.5 V 16.5 A 1.5 1.5 0 0 1 19 18 H 8.8 L 3.5 12 Z') +
      A('M 11.5 9.5 L 16.5 14.5 M 16.5 9.5 L 11.5 14.5'),
    'volume-up':
      T('M 4.5 9.5 H 8.5 L 13.5 5.5 V 18.5 L 8.5 14.5 H 4.5 Z') +
      S('M 4.5 9.5 H 8.5 L 13.5 5.5 V 18.5 L 8.5 14.5 H 4.5 Z') +
      A('M 16.5 9 A 4.2 4.2 0 0 1 16.5 15 M 19 6.8 A 7.2 7.2 0 0 1 19 17.2'),
    'volume-mute':
      T('M 4.5 9.5 H 8.5 L 13.5 5.5 V 18.5 L 8.5 14.5 H 4.5 Z') +
      S('M 4.5 9.5 H 8.5 L 13.5 5.5 V 18.5 L 8.5 14.5 H 4.5 Z') +
      A('M 16.5 9.5 L 20.5 14.5 M 20.5 9.5 L 16.5 14.5'),
    'bell':
      T('M 12 4.2 A 5.2 5.2 0 0 1 17.2 9.4 V 14.2 L 19 16.5 H 5 L 6.8 14.2 V 9.4 A 5.2 5.2 0 0 1 12 4.2 Z') +
      S('M 12 3 V 4.2 M 12 4.2 A 5.2 5.2 0 0 1 17.2 9.4 V 14.2 L 19 16.5 H 5 L 6.8 14.2 V 9.4 A 5.2 5.2 0 0 1 12 4.2 Z M 9.8 18.2 A 2.3 2.3 0 0 0 14.2 18.2') +
      A('M 18.2 5.2 A 3.8 3.8 0 0 1 20.2 8.2'),
    'skip-forward':
      T('M 5.5 5.8 L 14.8 12 L 5.5 18.2 Z') +
      S('M 5.5 5.8 L 14.8 12 L 5.5 18.2 Z') +
      A('M 18 5.8 V 18.2'),
    'rotate-ccw':
      S('M 4.5 5 V 9.8 H 9.3 M 5.2 9.6 A 7.4 7.4 0 1 1 6.4 16.8') +
      A('M 12 8.5 V 12.2 L 14.6 13.8'),
    'home':
      T('M 5.5 10.2 L 12 4.5 L 18.5 10.2 V 19.5 A 1 1 0 0 1 17.5 20.5 H 6.5 A 1 1 0 0 1 5.5 19.5 Z') +
      S('M 3.5 11 L 12 3.8 L 20.5 11 M 5.5 9.8 V 19.5 A 1 1 0 0 0 6.5 20.5 H 17.5 A 1 1 0 0 0 18.5 19.5 V 9.8') +
      A('M 9.8 20.5 V 14 H 14.2 V 20.5'),
    'storefront':
      T('M 4.5 9.5 H 19.5 V 19.5 A 1 1 0 0 1 18.5 20.5 H 5.5 A 1 1 0 0 1 4.5 19.5 Z') +
      S('M 3.5 9.5 L 5.2 4.2 H 18.8 L 20.5 9.5 Z M 5 9.5 V 19.5 A 1 1 0 0 0 6 20.5 H 18 A 1 1 0 0 0 19 19.5 V 9.5 M 9.5 20.5 V 14.2 H 14.5 V 20.5') +
      A('M 3.5 9.5 Q 5.6 11.6 7.8 9.5 Q 9.9 11.6 12 9.5 Q 14.1 11.6 16.2 9.5 Q 18.4 11.6 20.5 9.5'),
    'copy':
      T('M 9 8.5 H 19 A 1.5 1.5 0 0 1 20.5 10 V 19 A 1.5 1.5 0 0 1 19 20.5 H 9 A 1.5 1.5 0 0 1 7.5 19 V 10 A 1.5 1.5 0 0 1 9 8.5 Z') +
      S('M 9 8.5 H 19 A 1.5 1.5 0 0 1 20.5 10 V 19 A 1.5 1.5 0 0 1 19 20.5 H 9 A 1.5 1.5 0 0 1 7.5 19 V 10 A 1.5 1.5 0 0 1 9 8.5 Z M 15.5 8.5 V 5.5 A 1.5 1.5 0 0 0 14 4 H 5.5 A 1.5 1.5 0 0 0 4 5.5 V 15 A 1.5 1.5 0 0 0 5.5 16.5 H 7.5') +
      A('M 11 12.8 H 17 M 11 16.2 H 15.2'),
    'clipboard-paste':
      T('M 6 5.5 H 18 A 1.5 1.5 0 0 1 19.5 7 V 19.5 A 1.5 1.5 0 0 1 18 21 H 6 A 1.5 1.5 0 0 1 4.5 19.5 V 7 A 1.5 1.5 0 0 1 6 5.5 Z') +
      S('M 8.5 5.5 H 6 A 1.5 1.5 0 0 0 4.5 7 V 19.5 A 1.5 1.5 0 0 0 6 21 H 18 A 1.5 1.5 0 0 0 19.5 19.5 V 7 A 1.5 1.5 0 0 0 18 5.5 H 15.5 M 9 3.5 H 15 V 6.8 H 9 Z') +
      A('M 12 9.5 V 15.5 M 9.5 13 L 12 15.5 L 14.5 13 M 8.5 18 H 15.5'),
    'sliders':
      S('M 4 7 H 20 M 4 12 H 20 M 4 17 H 20') +
      AF('M 9 7 A 2.1 2.1 0 1 1 8.99 7 Z M 15.5 12 A 2.1 2.1 0 1 1 15.49 12 Z M 10.5 17 A 2.1 2.1 0 1 1 10.49 17 Z'),
    'arrow-right':
      S('M 4.5 12 H 19 M 13.5 6.5 L 19.5 12 L 13.5 17.5'),

    /* ==================== H. v6.3 NAVIGATION, TIMER STOP, CALENDAR, DROPLET & FLAVOR TAG ICONS ==================== */
    'arrow-left':
      T('M 10.5 6.5 L 4.5 12 L 10.5 17.5 Z') +
      S('M 19.5 12 H 5 M 10.5 6.5 L 4.5 12 L 10.5 17.5'),
    'stop-square':
      T('M 6.5 6.5 H 17.5 A 1.5 1.5 0 0 1 19 8 V 16 A 1.5 1.5 0 0 1 17.5 17.5 H 6.5 A 1.5 1.5 0 0 1 5 16 V 8 A 1.5 1.5 0 0 1 6.5 6.5 Z') +
      S('M 7 5.5 H 17 A 1.5 1.5 0 0 1 18.5 7 V 17 A 1.5 1.5 0 0 1 17 18.5 H 7 A 1.5 1.5 0 0 1 5.5 17 V 7 A 1.5 1.5 0 0 1 7 5.5 Z') +
      AF('M 9.2 9.2 H 14.8 V 14.8 H 9.2 Z'),
    'calendar-grid':
      T('M 4 5.5 H 20 V 9.5 H 4 Z M 13.2 12.2 H 16.8 V 15.8 H 13.2 Z') +
      S('M 5.5 5.5 H 18.5 A 1.5 1.5 0 0 1 20 7 V 19 A 1.5 1.5 0 0 1 18.5 20.5 H 5.5 A 1.5 1.5 0 0 1 4 19 V 7 A 1.5 1.5 0 0 1 5.5 5.5 Z M 4 9.5 H 20 M 8 3.5 V 6.5 M 16 3.5 V 6.5') +
      A('M 7.5 13 H 9.5 M 11.2 13 H 13.2 M 7.5 16.5 H 9.5 M 11.2 16.5 H 13.2 M 14.8 16.5 H 16.8') +
      AF('M 15.8 13 A 1.3 1.3 0 1 1 15.79 13 Z'),
    'droplet':
      T('M 12 3.2 C 16.4 9.0 18.8 12.4 18.8 15.4 A 6.8 6.8 0 1 1 5.2 15.4 C 5.2 12.4 7.6 9.0 12 3.2 Z') +
      S('M 12 3.2 C 16.4 9.0 18.8 12.4 18.8 15.4 A 6.8 6.8 0 1 1 5.2 15.4 C 5.2 12.4 7.6 9.0 12 3.2 Z') +
      A('M 8.6 15.2 A 3.6 3.6 0 0 0 12.2 18.6') +
      AF('M 14.5 11.2 A 1.0 1.0 0 1 1 14.49 11.2 Z'),
    'tag-check':
      T('M 4.5 5.5 H 12.2 L 19.5 12.8 L 13.3 19 L 6 11.7 L 4.5 10.2 Z') +
      S('M 4.5 5.5 H 12.2 L 19.5 12.8 A 1.2 1.2 0 0 1 19.5 14.5 L 14.5 19.5 A 1.2 1.2 0 0 1 12.8 19.5 L 4.5 11.2 Z') +
      A('M 10.2 13.2 L 12.3 15.3 L 16.2 11.4') +
      AF('M 7.8 8.2 A 1.15 1.15 0 1 1 7.79 8.2 Z'),
    'flame-wave':
      T('M 11.2 3.2 C 14.6 7.2 17.5 9.6 17.5 13.8 A 6.2 6.2 0 0 1 5.2 13.8 C 5.2 10.4 7.3 8.2 8.5 6.4 C 8.9 8.2 10.1 8.8 10.4 8.8 C 10.4 6.4 10.6 4.8 11.2 3.2 Z') +
      S('M 11.2 3.2 C 14.6 7.2 17.5 9.6 17.5 13.8 A 6.2 6.2 0 0 1 5.2 13.8 C 5.2 10.4 7.3 8.2 8.5 6.4 C 8.9 8.2 10.1 8.8 10.4 8.8 C 10.4 6.4 10.6 4.8 11.2 3.2 Z') +
      A('M 4 20.2 Q 7.8 18.4 11.8 20.2 T 20 20.2 M 19.2 7.2 Q 21 9.8 19.2 12.4')
  };

  const BREWER_MAP = {
    v60: 'brewer-v60', hario_v60: 'brewer-v60', pour_over: 'brewer-v60', pourover: 'brewer-v60',
    origami: 'brewer-origami',
    kalita: 'brewer-kalita', kalita_wave: 'brewer-kalita', flat_bottom: 'brewer-kalita',
    orea: 'brewer-orea', orea_v3: 'brewer-orea', orea_v4: 'brewer-orea',
    pulsar: 'brewer-pulsar', tricolate: 'brewer-pulsar', zero_bypass: 'brewer-pulsar',
    chemex: 'brewer-chemex',
    nel: 'brewer-nel', woodneck: 'brewer-nel', cloth: 'brewer-nel',
    drip: 'brewer-drip', auto_drip: 'brewer-drip', batch: 'brewer-drip',
    aiden: 'brewer-aiden', fellow_aiden: 'brewer-aiden',
    xbloom: 'brewer-xbloom', xbloom_studio: 'brewer-xbloom',
    switch: 'brewer-switch', hario_switch: 'brewer-switch',
    clever: 'brewer-clever', clever_dripper: 'brewer-clever',
    aeropress: 'brewer-aeropress',
    siphon: 'brewer-siphon', syphon: 'brewer-siphon',
    press: 'brewer-press', french_press: 'brewer-press', french_cold: 'brewer-cold',
    cupping: 'salami-cups',
    turkish: 'brewer-turkish', cezve: 'brewer-turkish', ibrik: 'brewer-turkish',
    phin: 'brewer-phin', vietnamese_phin: 'brewer-phin',
    cold: 'brewer-cold', cold_brew: 'brewer-cold', immersion_cold: 'brewer-cold',
    cold_drip: 'brewer-cold-drip', kyoto: 'brewer-cold-drip', slow_drip: 'brewer-cold-drip',
    espresso: 'brewer-espresso',
    lever: 'brewer-lever-espresso', lever_espresso: 'brewer-lever-espresso', flair: 'brewer-lever-espresso', manual_lever: 'brewer-lever-espresso',
    moka: 'brewer-moka', moka_pot: 'brewer-moka',
    philips: 'brewer-philips5500', philips5500: 'brewer-philips5500', philips_5500: 'brewer-philips5500', machine: 'brewer-philips5500', travelmug: 'brewer-philips5500'
  };

  const ICON_ALIASES = {
    'nav-brew': 'brew', 'nav-cellar': 'cellar', 'nav-palate': 'palate', 'nav-lab': 'lab', 'nav-academy': 'academy', 'learn': 'academy',
    'lever': 'brewer-lever-espresso', 'brewer-lever': 'brewer-lever-espresso',
    'cold-drip': 'brewer-cold-drip', 'cold_drip': 'brewer-cold-drip',
    'lever_espresso': 'brewer-lever-espresso',
    'bluetooth': 'ble-wave', 'ble': 'ble-wave',
    'scale': 'scale-deck', 'refractometer': 'refract-prism', 'r2': 'refract-prism', 'omni': 'omni-nir',
    'grinder': 'grinder-burr', 'pressure': 'pressure-gauge', 'kettle': 'kettle-gooseneck', 'lattego': 'lattego-carafe',
    'xray': 'xray-loupe', 'science': 'xray-loupe', 'loupe': 'xray-loupe',
    'twin': 'brew-twin', 'lock': 'lock-pin', 'unlocked': 'unlock',
    'camera': 'scan-lens', 'scan': 'scan-lens',
    'paste': 'clipboard-paste', 'clipboard': 'clipboard-paste', 'duplicate': 'copy',
    'qr': 'qr-passport', 'passport': 'qr-passport',
    'water': 'water-drop', 'temp': 'thermometer', 'temperature': 'thermometer',
    'sun': 'sun-light', 'light': 'sun-light', 'moon': 'moon-dark', 'dark': 'moon-dark',
    'check': 'check-seal', 'verified': 'epistemic-verified', 'star': 'spark-star', 'sparkle': 'spark-star',
    'bean': 'bean-rating', 'cup': 'cafe-cup', 'cafe': 'storefront', 'shop': 'storefront', 'store': 'storefront',
    'door': 'home',
    'calendar': 'calendar-grid', 'date-picker': 'calendar-grid',
    'scoop': 'scoop-preground', 'bolt': 'extrashot-bolt', 'extrashot': 'extrashot-bolt',
    'search': 'search-filter', 'filter': 'search-filter',
    'tare': 'tare-zero', 'zero': 'tare-zero',
    'voice': 'volume-up', 'sound': 'volume-up', 'speaker': 'volume-up', 'volume': 'volume-up',
    'mute': 'volume-mute', 'silent': 'volume-mute', 'sound-off': 'volume-mute',
    'chime': 'bell', 'chimes': 'bell', 'notification': 'bell',
    'next': 'skip-forward', 'next-step': 'skip-forward', 'skip': 'skip-forward',
    'restart': 'rotate-ccw', 'reset': 'rotate-ccw', 'undo': 'undo-arc',
    'delete-back': 'backspace',
    'settings': 'sliders', 'tools': 'sliders', 'gear': 'sliders', 'workflow': 'sliders',
    'close': 'close-x', 'x': 'close-x',
    'chev-right': 'chevron-right', 'arrow': 'arrow-right',
    'chev-left': 'chevron-left', 'back': 'arrow-left',
    'stop': 'stop-square', 'stop-brew': 'stop-square',
    'tag': 'tag-check', 'flavor-tag': 'tag-check', 'locked-tag': 'tag-check',
    'chev-down': 'chevron-down',
    'trash': 'trash-bin', 'delete': 'trash-bin',
    'share': 'share-card', 'export': 'share-card',
    'milk': 'milk-pitcher', 'ice': 'ice-cube', 'snowflake': 'cryo-snowflake', 'frozen': 'cryo-snowflake',
    'vault': 'vault-shield', 'shield': 'vault-shield', 'backup': 'vault-shield',
    'bag': 'fresh-bag', 'flame': 'roast-flame', 'fire': 'roast-flame', 'heat': 'roast-flame',
    'altitude': 'altitude-peaks', 'mountain': 'altitude-peaks', 'globe': 'origin-globe', 'origin': 'origin-globe',
    'plus': 'plus-add', 'add': 'plus-add', 'minus': 'minus-step',
    'edit': 'edit-pen', 'info': 'info-circle', 'warn': 'alert-triangle', 'warning': 'alert-triangle',
    'clock': 'caffeine-clock', 'timer': 'caffeine-clock', 'paragon': 'paragon-sphere'
  };

  /* Graceful geometric Extraction-Drop fallback if an unknown alias is ever requested */
  const FALLBACK_BODY =
    T('M 12 3.5 C 16.2 9.2 18.5 12.2 18.5 15.2 A 6.5 6.5 0 1 1 5.5 15.2 C 5.5 12.2 7.8 9.2 12 3.5 Z') +
    S('M 12 3.5 C 16.2 9.2 18.5 12.2 18.5 15.2 A 6.5 6.5 0 1 1 5.5 15.2 C 5.5 12.2 7.8 9.2 12 3.5 Z') +
    A('M 12 7.5 C 10.2 11 13.8 13.5 12 17.5') + AF('M 19.2 9.5 A 1.2 1.2 0 1 1 19.19 9.5 Z');

  function resolve(name) {
    if (name && typeof name === 'object' && typeof name.iconName === 'string') {
      name = name.iconName;
    }
    const raw = String(name || '').trim().toLowerCase();
    if (!raw) return 'brew';
    if (DEFS[raw]) return raw;
    const hyph = raw.replace(/[\s_]+/g, '-');
    if (DEFS[hyph]) return hyph;
    if (ICON_ALIASES[raw]) return ICON_ALIASES[raw];
    if (ICON_ALIASES[hyph]) return ICON_ALIASES[hyph];
    const under = raw.replace(/[\s-]+/g, '_');
    if (BREWER_MAP[under]) return BREWER_MAP[under];
    if (DEFS['brewer-' + hyph]) return 'brewer-' + hyph;
    return raw;
  }

  function brewerKey(methodKey) {
    const k = String(methodKey || '').trim().toLowerCase().replace(/^brewer[-_]/, '').replace(/[\s-]+/g, '_');
    return BREWER_MAP[k] || 'brewer-v60';
  }

  function svg(name, opts) {
    opts = opts || {};
    const key = resolve(name);
    const body = DEFS[key] || FALLBACK_BODY;
    const safeClsKey = key.replace(/[^a-z0-9-]/g, '-');
    const cls = 'bt-ico bti-' + safeClsKey + (opts.cls ? ' ' + opts.cls : '');
    const aria = opts.label ? 'role="img" aria-label="' + _btEsc(opts.label) + '"' : 'aria-hidden="true"';
    const sz = opts.size ? ' style="width:' + opts.size + 'px;height:' + opts.size + 'px"' : '';
    return '<svg xmlns="http://www.w3.org/2000/svg" class="' + cls + '" data-bti="' + _btEsc(safeClsKey) + '" viewBox="0 0 24 24"' + sz + ' ' + aria + ' focusable="false">' + body + '</svg>';
  }

  function el(name, opts) {
    const key = resolve(name);
    const holder = document.createElement('span');
    holder.innerHTML = svg(key, opts);
    const svgNode = holder.firstElementChild;
    if (svgNode) {
      svgNode.iconName = key;
      svgNode.toString = function() { return this.outerHTML; };
    }
    return svgNode;
  }

  function forBrewer(methodKey, opts) {
    const key = brewerKey(methodKey);
    return el(key, opts);
  }

  function useSvg(name, opts) {
    opts = opts || {};
    const key = resolve(name);
    const target = DEFS[key] ? key : 'brew';
    const cls = 'bt-ico bti-' + target + (opts.cls ? ' ' + opts.cls : '');
    const aria = opts.label ? 'role="img" aria-label="' + _btEsc(opts.label) + '"' : 'aria-hidden="true"';
    const sz = opts.size ? ' style="width:' + opts.size + 'px;height:' + opts.size + 'px"' : '';
    return '<svg xmlns="http://www.w3.org/2000/svg" class="' + cls + '" viewBox="0 0 24 24"' + sz + ' ' + aria + ' focusable="false"><use href="#bti-' + target + '"/></svg>';
  }

  function symbolsMarkup() {
    return Object.keys(DEFS).map(function(k) {
      return '<symbol id="bti-' + k + '" viewBox="0 0 24 24">' + DEFS[k] + '</symbol>';
    }).join('');
  }

  function spriteSvg() {
    return '<svg id="bt-icons-sprite" width="0" height="0" style="position:fixed;width:0;height:0;pointer-events:none;overflow:hidden" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">' + symbolsMarkup() + '</svg>';
  }

  function mountSprite() {
    if (typeof document === 'undefined' || !document.body) return;
    if (document.getElementById('bti-brew')) return;
    const defs = document.getElementById('bt-svg-defs');
    if (defs) defs.insertAdjacentHTML('beforeend', symbolsMarkup());
    else if (!document.getElementById('bt-icons-sprite')) document.body.insertAdjacentHTML('afterbegin', spriteSvg());
  }

  function list() {
    return Object.keys(DEFS);
  }

  return { DEFS, BREWER_MAP, ICON_ALIASES, resolve, brewerKey, svg, el, forBrewer, useSvg, spriteSvg, mountSprite, list };
})();

if (typeof window !== 'undefined') {
  window.BTBrand = BTBrand;
  window.Beanjamin = Beanjamin;
  window.BTIcons = BTIcons;
  window.mascotSvg = mascotSvg;
}
