# BeanTelligence (v5.0)

**BeanTelligence** (formerly *NeuroBrew*) is a local-first, offline-capable specialty coffee brewing studio, guided sensory journal, Bayesian palate engine, and peer-reviewed coffee science academy — delivered in a single zero-dependency `index.html` file.

**A little science, a lot of delicious.**

**Live site:** https://mshaffe1111.github.io/Neurobrew/

---

## Key Capabilities in v5.0

### 1. Science-Backed Brewing & Interactive Brew Coach
- **Tailored Brew Recipes:** Computes coffee dose, water weight, ratio, kettle temperature (with altitude boiling-point safety), target grind size in microns + grinder-specific click settings, and pour structure from your exact coffee (origin, process, roast level, decaf chemistry, roast age, and freezer storage) and brewer.
- **Guided Brew Timer & Voice Cues:** Step-by-step pour, bloom, swirl, and drawdown choreography with audio/voice cues and actual brew-time capture.
- **Calculator & Lab Suite:** Dedicated tools for Extraction Yield & TDS (separating drip beverage-weight EY from steeped water-poured EY per Liang et al. 2021), Water Chemistry (`GH` / `KH` mineral formulation), Iced & Flash-Brew math, Caffeine & `CYP1A2` Sleep Clearance, Cup Yield, and Bag Value/Freshness tracking.

### 2. 3-Mode Guided Tasting Studio (`screenCup`)
- **Sensible 3-Mode Selector:** Choose **Quick (30s)**, **Guided Sensory (90s)**, or **Full SCA CVA (2024 Standards 103+104) / Classic 100-Point Cupping** — with 100% backward compatibility across `quick`, `cva_affective`, `home_1cup`, and `sca_5cup` records.
- **Teach While Rating:** Cleanly separates neutral **Descriptive Intensity (`1–5`: Low → High)** from **Hedonic Liking (`1–9` CVA / `0.5–5★` beans)**, paired with everyday food anchors and expandable micro-guides (*juicy fruit acidity vs. under-extracted sourness; retronasal sweetness congruence; tea-like vs. syrupy body; dark-cocoa bitterness vs. saliva-binding polyphenol astringency; and `TRPV1`/`TRPM5` cooling dynamics from `70 °C → 45 °C`*).
- **Blind-First Bag-Note Shield:** Shields printed roaster notes until you record your own first impression, preventing label expectation bias (*Carvalho et al., 2026*).
- **3-Ring Sunburst Flavor Wheel & GC-O Chemistry:** Interactive 3-tier SCA/WCR wheel (*Family → Sub-group → Specific Descriptor*) with Gas Chromatography–Olfactometry impact molecule callouts (*linalool*, *furaneol*, *2-furfurylthiol*, *β-damascenone*, *3-methylbutanal*, *guaiacol*, etc.) plus the 36-vial Le Nez du Café aroma kit.
- **7-Chip Extraction Diagnostic Bar:** Captures brew balance (`Balanced & Sweet`, `Sour / Sharp`, `Bitter / Harsh`, `Dry / Astringent`, `Weak / Thin`, `Heavy / Muddy`, `Sour + Dry / Channeled`) in every mode — unlocking **Perfect the Next Brew** even from a 30-second Quick rating.

### 3. Executive Tastings Hub & Universal Dial-In Tracking
- **Your Tastings (`screenHistory`):** Top 5-KPI summary strip (*Total Cups*, *Unique Coffees*, *Avg Rating*, *Top Brewer*, *Dialed-In Gems*), instant multi-column search, interactive facet filters, and roast-striped tasting cards.
- **Visual Dial-In Evolution & 2D Brew Compass (`screenDial`):** SVG score sparklines, try-by-try parameter deltas (`Try #1 → #2 → #3`), interactive 3×3 Extraction × Strength troubleshooting compass, and multi-part grinder-safe **Compare Cups** (`"1-5-2"`, `"4-2"`, `"15E"`).

### 4. Palate DNA Hub & Smart Bag Buyer's Guide
- **Palate Intelligence (`screenTend`):** Graceful 4-tier cold start (`0`, `1–3`, `4–9`, `10+` coffees) with a 3-tap Palate Seed Quiz, interactive **5-Axis SVG Palate DNA Radar** (*Acidity*, *Sweetness*, *Body*, *Bitterness Tolerance*, *Clarity*), Empirical Bayes $\text{LCB}_{80}$ leaderboards across **35 coffee-producing countries**, dial-adjusted bean scoring ($0.6\bar{r} + 0.4r_{\max}$ to separate 1-try brew faults from disliked beans), and signed **Liked-vs-Disliked Flavor Family Affinity Bars**.
- **Smart Bag Buyer's Guide (`screenBuy`):** Collinearity-corrected `prefFit v2` (Kish/Bretherton Jaccard effective sample size with a finite `'Unexplored Style'` guard so `NaN` never occurs), **Bullseye / Bridge / Horizon** bag cards, and a live **"Test Any Bag Label"** fit checker.

### 5. 7-Module Fact-Checked Coffee Science & Palate Academy
- **Bean-to-Body Curriculum (`screenLearn` & `screenFolk`):** Covers *Coffea* genetics (*Salojärvi et al. 2024*; *Davis et al. Aug 2025* Liberica/Excelsa split), Terroir Atlas, Processing & all 4 Decaf Chemistries (`EA`, `Swiss/Mountain Water`, `Supercritical CO2`, `MC <= 10 ppm`), Roasting Chemistry (chlorogenic lactones, phenylindanes, `N-methylpyridinium`), Extraction Physics & RDT (*Méndez Harper & Hendon 2023*), Human Physiology (`A1`/`A2A`, `CYP1A2`, *Gardiner 2023* sleep cutoffs, *Lawsonibacter*, cafestol/LDL, *Killer 2014* $\text{D}_2\text{O}$ hydration, *Lovallo 2005* cortisol nuance), and `TRPV1`/`TRPM5` Cooling Biophysics + 3 Home Kitchen Calibration Flights.
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
