# BeanTelligence (v5.2)

**BeanTelligence** (formerly *NeuroBrew*) is a local-first, offline-capable specialty coffee brewing studio, direct Web Bluetooth smart hardware hub, visual Agtron roast color lab, precision brewer profile builder, guided sensory journal, Bayesian palate engine, and peer-reviewed coffee science academy — delivered in a single zero-dependency `index.html` file.

**A little science, a lot of delicious.**

**Live site:** https://mshaffe1111.github.io/Neurobrew/

---

## Key Capabilities in v5.2

### 1. Dedicated Bluetooth & Smart Devices Hub + App-Wide Workflow Modes (`v5.2.0`)
- **Top-Level `Bluetooth & Smart Devices` Hub (`screenDevices`):** Reachable in 1 tap from the **Top Header (`📡 Devices`)**, **Desktop Left Rail**, **Home Command Center**, **My Setup**, and **Calculators** — featuring a prominent **`Direct Web Bluetooth — Zero API Key Needed`** guide, honest Chromium / iOS Bluefy platform detection, 4 live hardware cards (*Smart Scales*, *DiFluid R2 Extract*, *DiFluid Omni*, and *Fellow Aiden & xBloom Studio / Original*), clean **DiFluid Café / CoffeeOS Export Paste & Upload (`No API Key Needed`)**, and a tucked-away `<details>` fold for optional commercial Partner Cloud API keys.
- **"My Workflow & Tools" Personalization (`Always Use | Optional | Off`):** Global `window.btToolMode` / `window.btSetToolMode` preferences persisted across `DRAFT_KEY`, `PREFS_MIRROR_STORAGE_KEY`, and `setup_json` (`"v": 1`) adapt every screen to your exact bench — expanding or hiding inline Agtron & Roast $\Delta$ in **Coffee Studio**, pinning `% TDS / DiFluid R2 & EY%` in **Tasting Studio**, highlighting `Omni D10/D50/D90 µm` calibration & PSD Span badges, and defaulting **Choose Brewer** to `All 16 Brewers` vs. `My Owned Brewers`.
- **Full Visual `Agtron & Roast Color Studio` (`screenAgtron`):** Interactive **Roasted Whole-Bean & Ground Color Discs SVG** (`25` Dark French → `105` Nordic Ultra-Light), **5-Scale Scientific Roast Translator** (*SCA Agtron Gourmet*, *Agtron Commercial* `[Industry Calibration Curve]`, *DiFluid Omni NIR*, *Tonino*, and *Lighttells CM-100*), **Whole-Bean vs. Ground `Roast Delta (Δ)`** core uniformity & thermal relief analyzer (`-1.0 to -2.0 °C` compensation on high-gradient $\Delta \ge 12$ roasts), direct **`Pair & Scan DiFluid Omni`**, and 1-tap **`Apply to Current Coffee`**.
- **Native `Fellow Aiden` & `xBloom Studio / Original` Brewers + 48 Grinders:** Expands to **16 canonical brewers** (`+ Philips 5500 LatteGo`) and **48 grinders** (adding `xBloom Studio 1–80` & `xBloom Original 1–30` curves plus Fellow Aiden & xBloom filters), with interactive multi-pulse declining-temperature profile builders, RPM/pour-pattern editors, full sensor persistence inside the 129-column `cuppings.csv` schema, and **Preferred Agtron & Measured TDS / EY% Sweet Spots** in **Your Preferences**.

### 2. Web Bluetooth Smart Scale & Full DiFluid Ecosystem Sync (`v5.1.0`)
- **Multi-Protocol Smart Scale, DiFluid R2, Microbalance & Omni GATT Engine (`window.BTBle`):** Connects directly in Chromium browsers (Chrome, Edge, Opera on Desktop & Android, or **Bluefy** on iOS/iPadOS) with zero mandatory cloud account — supporting **Acaia** (*Lunar, Pearl, Pearl S, Pyxis* across legacy IPSP & modern ISSC UART with MTU stream reassembly and 2.75s heartbeat), **DiFluid Microbalance & Microbalance Ti** (`0x00EE` / `0x00DD` `0xDF 0xDF` telemetry + hybrid tare), **Bookoo Themis** (*Mini / Ultra*), **Timemore** (*Black Mirror BLE Classic/Dual & Official Open Scale Protocol*), **Felicita** (*Arc, Incline, Parallel*), **Decent Scale**, **Hiroia Jimmy**, **Standard Bluetooth SIG `0x181D` Weight Scales**, the **DiFluid R2 Extract** optical refractometer (`% TDS`, prism/tank `°C`, `nD`), and the **DiFluid Omni (`DFT-SD101`)** NIR Roast Agtron & 2D Particle Size Analyzer (`D10 / D50 / D90 µm`, `Span`).
- **3-Path DiFluid Ecosystem & CoffeeOS Universal Sync (`window.BTDiFluidApi`):** Combines a **Zero-CORS Offline Importer** for CoffeeOS / DiFluid Café CSV, TSV, JSON, Artisan OmniFlux JSON, and share text, a 1-tap **Ecosystem Demo Dataset**, and optional commercial Partner/Bridge REST sync (with strictly local-only `brew-and-cup-difluid-auth-v1` storage never exported in `setup_json`, `BT-code` strings, or CSVs).
- **Omni NIR Agtron & Grinder `D50 µm` PSD Calibration:** Import Whole-Bean & Ground Agtron (`+ Roast Delta Δ`) straight into **Coffee Studio** to highlight the matching 6-swatch Roast Level, and anchor any of the 48 built-in grinder curves to your true optical **`D50` median micron** reading in **My Setup** or **Smart Devices**.
- **Built-In 10 Hz Physics Scale Simulator & Honest Platform Guidance:** Users on Apple iOS/iPadOS Safari (where WebKit restricts Web Bluetooth) or testing without hardware get clear, factual platform guidance plus a 1-tap **Physics Scale Simulator** (`0.1 g` 10 Hz weight ticks, realistic pour pulses, Darcy bed drainage, optional fines-stall simulation, and dripper-lift carafe yield).
- **Hands-Free 60fps Live Ghost Pacer & Darcy Flow Diagnostics:** Recipe Dose capture directly from beans on the scale, `Arm & Tare` + `Auto-Start on First Pour (>1.0 g)`, live **Target vs. Actual Dual-Curve SVG Ghost Pacer**, Pour Speed Zone Bar, automatic **Dripper-Lift Carafe Yield** capture, and real-time **Darcy Bed Permeability** detection separating **Paper Filter Blinding (Micro-Fines Stall)** from **Fast Channeling Bypass**.
- **1-Tap DiFluid R2 `% TDS` & Zero-Data-Loss Telemetry:** Streams optical `% TDS` and sample temperature (from WebBLE or CoffeeOS sync) directly into **EY Studio** (auto-plotting on the 9-Zone Brew Control Chart) and **Guided Tasting Studio**, displays a **Captured Scale & Flow Telemetry** banner across Quick, Guided Sensory, and Full SCA CVA / Classic modes, and persists scale/refractometer/Agtron/PSD/machine-profile metrics cleanly into the existing 129-column `cuppings.csv` schema (`setup_json` `v:1` + `recipe_adaptation_json`).

### 3. Science-Backed Brewing & Interactive Brew Coach
- **Tailored Brew Recipes:** Computes coffee dose, water weight, ratio, kettle temperature (with continuous Agtron, Roast $\Delta$, and altitude boiling-point math), target grind size in microns + grinder-specific click settings across 48 grinders, and pour structure from your exact coffee and any of 16 brewers.
- **Guided Brew Timer & Voice Cues:** Step-by-step pour, bloom, swirl, and drawdown choreography with audio/voice cues, 3-2-1 transition pips, and actual brew-time capture.
- **Calculator & Lab Suite:** Dedicated tools for Extraction Yield & TDS (separating drip beverage-weight EY from steeped water-poured/Gagné EY per Liang et al. 2021 & Gagné 2021), Water Chemistry (`GH` / `KH` IUPAC mineral formulation), Iced & Flash-Brew enthalpy math, Caffeine & `CYP1A2` Sleep Clearance, Cup Yield, and Bag Value/Freshness tracking.

### 3. 3-Mode Guided Tasting Studio (`screenCup`)
- **Sensible 3-Mode Selector:** Choose **Quick (30s)**, **Guided Sensory (90s)**, or **Full SCA CVA (2024 Standards 103+104) / Classic 100-Point Cupping** — with 100% backward compatibility across `quick`, `cva_affective`, `home_1cup`, and `sca_5cup` records.
- **Teach While Rating:** Cleanly separates neutral **Descriptive Intensity (`1–5`: Low → High)** from **Hedonic Liking (`1–9` CVA / `0.5–5★` beans)**, paired with everyday food anchors and expandable micro-guides (*juicy fruit acidity vs. under-extracted sourness; retronasal sweetness congruence; tea-like vs. syrupy body; dark-cocoa bitterness vs. saliva-binding polyphenol astringency; and `TRPV1`/`TRPM5` cooling dynamics from `70 °C → 45 °C`*).
- **Blind-First Bag-Note Shield:** Shields printed roaster notes until you record your own first impression, preventing label expectation bias (*Carvalho et al., 2026*).
- **3-Ring Sunburst Flavor Wheel & GC-O Chemistry:** Interactive 3-tier SCA/WCR wheel (*Family → Sub-group → Specific Descriptor*) with Gas Chromatography–Olfactometry impact molecule callouts (*linalool*, *furaneol*, *2-furfurylthiol*, *β-damascenone*, *3-methylbutanal*, *guaiacol*, etc.) plus the 36-vial Le Nez du Café aroma kit.
- **7-Chip Extraction Diagnostic Bar:** Captures brew balance (`Balanced & Sweet`, `Sour / Sharp`, `Bitter / Harsh`, `Dry / Astringent`, `Weak / Thin`, `Heavy / Muddy`, `Sour + Dry / Channeled`) in every mode — unlocking **Perfect the Next Brew** even from a 30-second Quick rating.

### 4. Executive Tastings Hub & Universal Dial-In Tracking
- **Your Tastings (`screenHistory`):** Top 5-KPI summary strip (*Total Cups*, *Unique Coffees*, *Avg Rating*, *Top Brewer*, *Dialed-In Gems*), instant multi-column search, interactive facet filters, and roast-striped tasting cards with BLE telemetry & `% TDS` badges.
- **Visual Dial-In Evolution & 2D Brew Compass (`screenDial`):** SVG score sparklines, try-by-try parameter deltas (`Try #1 → #2 → #3`), interactive 3×3 Extraction × Strength troubleshooting compass, and multi-part grinder-safe **Compare Cups** (`"1-5-2"`, `"4-2"`, `"15E"`).

### 5. Palate DNA Hub & Smart Bag Buyer's Guide
- **Palate Intelligence (`screenTend`):** Graceful 4-tier cold start (`0`, `1–3`, `4–9`, `10+` coffees) with a 3-tap Palate Seed Quiz, interactive **5-Axis SVG Palate DNA Radar** (*Acidity*, *Sweetness*, *Body*, *Bitterness Tolerance*, *Clarity*), Empirical Bayes $\text{LCB}_{80}$ leaderboards across **35 coffee-producing countries**, dial-adjusted bean scoring ($0.6\bar{r} + 0.4r_{\max}$ to separate 1-try brew faults from disliked beans), and signed **Liked-vs-Disliked Flavor Family Affinity Bars**.
- **Smart Bag Buyer's Guide (`screenBuy`):** Collinearity-corrected `prefFit v2` (Kish/Bretherton Jaccard effective sample size with a finite `'Unexplored Style'` guard so `NaN` never occurs), **Bullseye / Bridge / Horizon** bag cards, and a live **"Test Any Bag Label"** fit checker.

### 6. 7-Module Fact-Checked Coffee Science & Palate Academy
- **Bean-to-Body Curriculum (`screenLearn` & `screenFolk`):** Covers *Coffea* genetics (*Salojärvi et al. 2024*; *Davis et al. Aug 2025* Liberica/Excelsa split), Terroir Atlas, Processing & all 4 Decaf Chemistries (`EA`, `Swiss/Mountain Water`, `Supercritical CO2`, `MC <= 10 ppm`), Roasting Chemistry (chlorogenic lactones, phenylindanes, `N-methylpyridinium`), Extraction Physics, **Gravimetric Flow Telemetry & Darcy Bed Permeability**, & RDT (*Méndez Harper & Hendon 2023*), Human Physiology (`A1`/`A2A`, `CYP1A2`, *Gardiner 2023* sleep cutoffs, *Lawsonibacter*, cafestol/LDL, *Killer 2014* $\text{D}_2\text{O}$ hydration, *Lovallo 2005* cortisol nuance), and `TRPV1`/`TRPM5` Cooling Biophysics + 3 Home Kitchen Calibration Flights.
- **Epistemic Transparency:** Every module, lesson, and folklore claim carries clickable **Epistemic Tier Badges** (`[Verified Science]`, `[Barista Convention]`, `[Model / Active Research]`, `[Myth Debunked]`), backed by 19 Coffee School lessons, 32 evidence-graded Folklore claims, and ~700 glossary terms.

---

## Privacy & Local-First Data Ownership
Everything runs locally in your browser with **zero accounts, zero telemetry, and zero external font or script CDNs** (typography and icons are embedded inline for offline reliability):
- Your tastings, gear setup, bag ledger, and café log stay in browser storage (`localStorage` + automatic IndexedDB safety snapshots) and export cleanly as user-owned `cuppings.csv` / JSON / plain-text backup codes.
- In Chromium browsers (Chrome / Edge), File System Access lets BeanTelligence write directly back to your chosen `cuppings.csv` file; all browsers support one-click CSV/JSON download and copy-paste backup codes.
- Optional roaster-listing lookup queries public store product JSON directly from your browser when requested and never transmits your tasting history.

## Releases & Architecture
- Every tested build is recorded in [RELEASE_NOTES.md](RELEASE_NOTES.md) and inside the app under **Menu → About BeanTelligence → Release notes**.
- `index.html` is the complete self-contained production application assembled from modular source slices under `src/slices/`.
