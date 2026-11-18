# BeanTelligence — 60-Second Launch Trailer Director's Script & Cinematography Bible

- **Title**: *"Banish Morning Guesswork"* — Official BeanTelligence Launch Film (`v6.4`)
- **Format & Delivery Spec**: `1920 × 1080` Progressive (`16:9` widescreen with `2.39:1` anamorphic letterbox cold-open in Act I), `30.000 fps` (`1,800` exact frames = `60.000s`), H.264 High Profile (`~2.4 Mbps`) + `48 kHz` 16-bit Stereo AAC (`192 kbps`), **target file size `15–22 MB` (`< 30 MB` hard cap)** for instant native playback across X, Instagram, Reddit, YouTube, Product Hunt, and Discord.
- **Creative North Star**: *Sandwich Video* (deadpan human coffee humor + zero-fluff product clarity) × *Apple Design Award Reel* (tactile specular 3D hardware, macro depth-of-field, horological precision) × *Linear / Arc Launch Trailers* (spring-physics motion, high-contrast editorial serif/sans pairing, sound-synced micro-cuts).
- **Sound-Off & Sound-On Dual Mastery**: Over 80% of social feeds start muted — kinetic headlines and punchy lower-third captions carry the full comedic and scientific arc silently, while the `114 BPM` specialty-cafe nu-jazz/funk score and frame-accurate foley reward sound-on viewers.

---

## 1. Visual System, Color-Grade Evolution & Anti-Clipping Layout Grid

### A. Emotional Color-Grade Progression (`0:00 → 1:00`)
The background lighting, volumetric bokeh, and coffee meniscus literally warm up as BeanTelligence dials the cup from tragic sludge to golden perfection:

| Phase | Timecode | Aspect | Studio Grade Name | Background Gradient | Key / Rim Light | Cup Meniscus |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Act I** | `0:00.0 – 0:07.0` | `2.39:1` (`132px` bars) | `cold-slate-crime-scene` | `#0B111A → #182433` | Desaturated fluorescent `#6C85A3` + sour toxic `#7A9E4B` fumes | Murky grey-brown `#2E2A24` |
| **Act II** | `0:07.0 – 0:14.0` | `16:9` (Blast Open!) | `warm-espresso-hero` | `#160C08 → #2E170D` | Burnished Copper `#D98B26` + Refracting Prism Gold `#FAD665` | Rich crema `#B85D24` |
| **Act III-A** | `0:14.0 – 0:23.2` | `16:9` | `roasted-amber-lab` | `#1C110B → #382013` | Warm Alabaster `#FAF6F0` key + Botanical Pine `#2A7B56` accent | Bright amber `#C87528` |
| **Act III-B** | `0:23.2 – 0:33.0` | `16:9` | `sunlit-golden-euphoria` | `#241409 → #4A2711` | Radiant Honey-Gold `#F6BE58` volumetric rays + rose-copper shimmer | Luminous gold `#E5982A` |
| **Act IV** | `0:33.0 – 0:48.0` | `16:9` | `dual-studio-alabaster-oled` | Split `#FAF6F0` / `#140C08` → `#1E120C` | Crisp Teal Science `#2786AB` + Copper `#D98B26` + Emerald `#28B576` | Sweet-spot ruby-gold `#C96A22` |
| **Act V** | `0:48.0 – 0:56.5` | `16:9` | `velvet-library-spotlight` | `#120A06 → #29150B` | Overhead museum gold spotlight `#FCE59B` on leather & parchment | Embossed gold foil `#FAD665` |
| **Act VI** | `0:56.5 – 1:00.0` | `16:9` | `signature-crest-finale` | `#160D08 → #331A0D` | Full Prism 3-Wave Halo (`#FAD665` / `#E8752B` / `#52D99B`) | Steaming golden cup `#F2A93B` |

### B. Typography & Non-Overlapping `1920×1080` Safe-Zone Rules
- **Display Headlines**: `Lora, Georgia, serif` (`700` Bold, `-0.025em` tracking, `46px–64px`, `#FFFDF9` with **power words** accented in `#FAD665` Gold or `#52D99B` Sweet-Spot Mint).
- **Punchline Captions & UI Callouts**: `Plus Jakarta Sans, Segoe UI, system-ui, sans-serif` (`600`–`700`, `24px–30px`, `#F6EDE0` inside a high-contrast `rgba(18, 10, 7, 0.86)` pill scrim with `1.5px` `#D98B26` border — guaranteed `>= 9.5:1` contrast!).
- **Telemetry Numbers**: `JetBrains Mono, Consolas, monospace` (`700`, `tabular-nums`).
- **Strict Non-Overlap Zones**:
  - **Outer Action Safe Box**: `x: [96, 1824]`, `y: [64, 1016]` (`y: [158, 922]` inside Act I's `132px` letterbox bars).
  - **2-Column Stage Scenes (Acts II-B, III, IV)**: Editorial copy occupies `x: [110, 880], y: [170, 760]`; 3D Titanium Phone occupies `x: [1010, 1730], y: [96, 865]`; Beanjamin 2.0 performs in his dedicated stage pocket (`x: [760, 1060], y: [560, 875]` or flanking rail) with his glowing copper touch-beam extending cleanly onto the phone screen; Lower-Third Punchline Bar sits cleanly at `x: [160, 1760], y: [896, 1004]` — **zero text ever collides with UI chrome or mascot silhouettes**.

---

## 2. Authentic `2x` Retina App Plate Manifest (`promo/ui_plates/`)

For `@promo-motion-engine`'s `capture_real_ui_plates.ps1` — capture real BeanTelligence DOM states at `2x` HiDPI so every screen inside the 3D phone, studio split, and 3D compendium book is razor-sharp real software:

| `appScreenId` | Viewport | Real App Route / State to Capture | Featured In |
| :--- | :--- | :--- | :--- |
| `none_crime_scene` | Cinema Canvas | Custom cold-open kitchen spotlight + `$24` Guji bag + steaming sludge mug | Act I (`0:00–0:07`) |
| `none_hero_drop` | Cinema Canvas | Refracting Prism Drop hero crest + Beanjamin 2.0 superhero shockwave | Act II (`0:07–0:10.4`) |
| `ui_door_home` | `390×844 @ 2x` | Brew Studio Door (`brew` / `'door'`) — clean welcome hero + 5-tab thumb dock | Act II (`0:10.4–0:14`) |
| `ui_step1_capture` | `390×844 @ 2x` | Brew Step 1 — Top Coffee Guide (`Ethiopia Guji · Light · Washed · Day 11 Peak`), Locked Bag Flavors shield, standout **`Don't Know`** pill on Elevation | Act III (`0:14–0:16.6`) |
| `ui_step2_water_brewer` | `390×844 @ 2x` | Brew Step 2 — V60 / 23 Brewers + **Everyday Filtered Pitcher Water** (`45 GH · 25 KH`) | Act III (`0:16.6–0:18.5`) |
| `ui_step3_recipe_science` | `390×844 @ 2x` | Brew Step 3 — `201 °F / 94 °C · 19 Clicks · 1:16.7` + open **`? Why These Numbers? (Show the Science)`** sheet (`'recipe-science-why'`) | Act III (`0:18.5–0:23.2`) |
| `ui_step4_giant_timer_waves` | `390×844 @ 2x` | Brew Step 4 — **GIANT `#bt-timer-giant-clock` (`02:44.8`)**, `BTChronoDial`, expanded **3-Wave Live Extraction** (`Acids → Sugars → Bitters`), prominent **`■ Stop Brew (Done)`** | Act III (`0:23.2–0:28.0`) |
| `ui_step5_bullseye_gold` | `390×844 @ 2x` | Brew Step 5 — **4-Ring Archery Bullseye**, peeled **Rose-Copper Scratch Foil** (`94% Match`), **Sweet Spot Gold Recipe Seal** | Act III (`0:28.0–0:33.0`) |
| `ui_casual_rescue_philips` | `390×844 @ 2x` (pair) | Post-Brew **In-Mug Emergency Rescue** sheet + **Philips 5500 LatteGo** 1:1 touchscreen console | Act IV (`0:33.0–0:36.8`) |
| `ui_lab_sweetspot_ble` | `1440×900 @ 2x` | Tab 4 Lab — **`BrewControlCanvas` (`TDS × %EY` Sweet-Spot Islands)** + **15-Family Web Bluetooth Live Scale/R2** bench | Act IV (`0:36.8–0:40.6`) |
| `ui_lab_caffeine_water` | `1440×900 @ 2x` | Tab 4 Lab — **24-Hr `CircadianCaffeineTimeline`** (`Last Safe Sip` cutoff) + `WaterMineralPad` | Act IV (`0:40.6–0:44.2`) |
| `ui_palate_map_sunburst` | `1440×900 @ 2x` | Tab 3 Palate — **52-Origin World Coffee Belt Map**, **85-Note Sunburst Wheel**, **`"Will I Love This Bag?"`** Store Predictor | Act IV (`0:44.2–0:48.0`) |
| `ui_academy_cupping_glossary` | `1440×900 @ 2x` | Tab 5 Academy — **5-Bowl SCA Cupping**, **Cafe Logger**, **774-Term Visual Encyclopedia** (used on Book Spread 6) | Act V (`0:55.0–0:56.5`) |
| `book_compendium_6spreads` | Cinema 3D Rig | 3D Hardcover Espresso-Leather & Gold-Foil Book compositing all 6 flagship Retina spreads | Act V (`0:48.0–0:56.5`) |
| `none_endcard_crest` | Cinema Canvas | Closed Compendium morphing into gleaming Refracting Prism Drop crest + Beanjamin golden-cup wink + CTA | Act VI (`0:56.5–1:00.0`) |

---

## 3. Beat-by-Beat Commercial Script (`0:00.00 – 1:00.00` · `17` Precision Beats)

### ACT I (`0:00.0 – 0:07.0`) — Low-Vibes Bad Coffee Crime Scene
*Aspect: `2.39:1` Cinema Letterbox (`132px` matte bars) · Grade: Cold Slate-Blue Kitchen Fluorescents · Music: Sparse `60 BPM` kitchen clock tick-tock + detuned warbly Rhodes chord.*

- **Beat 01 (`0:00.00 – 0:02.20` | Frames `0–66`) — The $24 Promise (2-Second Scroll-Stopper Hook)**
  - **Action**: Hard cut into a cold, gloomy 7:02 AM kitchen counter. Spotlight hits an ultra-fancy `$24` craft bag labeled *"ETHIOPIA GUJI — Jasmine, Bergamot & White Peach"* beside a sad chipped mug oozing greenish-grey steam. **Beanjamin 2.0** (`sympathetic` recoil) peeks nervously from behind the bag.
  - **Headline**: `Spent $24 on "Jasmine & White Peach."`
  - **Punchline Caption**: `Why does your 7 AM mug taste like a 9-volt battery?`
  - **SFX**: Crisp clock ticks (`0.00s, 0.50s, 1.00s, 1.50s, 2.00s`) + warbly detuned minor-2nd Rhodes swell (`0.15s`).

- **Beat 02 (`0:02.20 – 0:04.70` | Frames `66–141`) — Simultaneous Battery Acid & Burnt Tires**
  - **Action**: Quick punch-in (`1.12x` snap zoom) on the murky cup. A tragic slurp ripples the surface — dual toxic green (*sour acid*) and charcoal (*burnt rubber*) fume icons curl up. Beanjamin recoils in comedic horror, clapping a paw to his cheek as his monocle pops sideways!
  - **Headline**: `Brewed Notes of Battery Acid & Burnt Tires.`
  - **Punchline Caption**: `Somehow sour AND bitter in the exact same sip. Science is crying.`
  - **SFX**: Tragic hollow coffee slurp (`2.35s`) → comedic sour-brass/Rhodes *blech* dissonance (`3.10s`).

- **Beat 03 (`0:04.70 – 0:07.00` | Frames `141–210`) — Wasted by Morning Guesswork → Record Scratch!**
  - **Action**: Dutch-angle pan across a crime scene of guesswork: random heaping scoop, mystery tap water, `$24` beans rolling off the counter. At `0:06.70`, a giant red stamp *`GUESSWORK DETECTED`* freezes the frame — **record scratch** — `0.20s` dead silence!
  - **Headline**: `Expensive Beans. Murdered by Guesswork.`
  - **Punchline Caption**: `"Medium-ish grind? Boiling-ish water? Pray?" — Stop guessing.`
  - **SFX**: Tense rising strings/noise (`4.80s`) → sharp **vinyl record scratch (`6.70s`)** → dramatic **dead silence (`6.85s – 7.05s`)**.

---

### ACT II (`0:07.0 – 0:14.0`) — Explosive Entrance of Beanjamin 2.0 & BeanTelligence
*Aspect: Letterbox bars BLAST OPEN to full `16:9` (`1920×1080`) at `0:07.05`! · Grade: Warm Roasted-Espresso & Burnished-Copper Volumetric Studio · Music: Infectious `114 BPM` Specialty-Cafe Nu-Jazz / Funk Groove (`Fmaj9 – Em7 – Dm9 – Cmaj9/G13`) drops!*

- **Beat 04 (`0:07.00 – 0:10.40` | Frames `210–312`) — Superhero Drop & Brass Monocle Gleam**
  - **Action**: `0:07.05` — black letterbox bars blow off-screen as golden bokeh explodes across the stage! **Beanjamin 2.0** (`eureka` hero pose) drops into hero rim-lighting, sending a warm crema shockwave across the floor. He adjusts his **gleaming brass monocle** (*ting!* specular star flare at `7.45s`) beneath the faceted **Refracting Prism Drop** mark.
  - **Headline**: `Meet BeanTelligence.`
  - **Punchline Caption**: `Beanjamin 2.0 just banished coffee guesswork forever. (Brass monocle standard.)`
  - **SFX**: `7.10s` deep sub-drop + punchy nu-jazz brass/Rhodes stab + `114 BPM` pocket drums kick in + crisp monocle *ting!* (`7.45s`).

- **Beat 05 (`0:10.40 – 0:14.00` | Frames `312–420`) — 3D Titanium Studio Phone Glide-In**
  - **Action**: Camera orbits smoothly as a photorealistic 3D-tilted Titanium smartphone glides in displaying the real BeanTelligence **Brew Studio** (`ui_door_home`). Beanjamin hops onto the active stage rail (`welcome` wave → `focused` ready stance), summoning a glowing copper touch-cursor.
  - **Headline**: `A Little Science. A Lot of Delicious.`
  - **Punchline Caption**: `Zero spreadsheets. Zero barista snobbery. Watch a tragic bag turn pure gold.`
  - **SFX**: Silky stereo whip-whoosh (`10.42s`) + warm wooden marimba UI chime (`10.85s`).

---

### ACT III (`0:14.0 – 0:33.0`) — Bad Coffee Getting Better & Better → Golden Perfection
*Beanjamin 2.0 physically taps, scrubs, and operates the 3D-tilted BeanTelligence app from Step 1 through Step 5 while the room & cup visibly warm from muted slate-amber → glowing caramel → sunlit gold euphoria!*

- **Beat 06 (`0:14.00 – 0:18.50` | Frames `420–555`) — Step 1 & 2: Smart Capture, `"Don't Know"` Honesty & Everyday Water**
  - **Action**: Beanjamin (`curious` → `eureka`) taps through `ui_step1_capture` and `ui_step2_water_brewer`:
    1. **AI Bag Scan & Peak Calendar**: *Ethiopia Guji · Day 11 Peak Window* lights up green; **Bag Flavors Locked** behind a blind-tasting shield so labels don't bias your tongue.
    2. **Zero Fake Guesses**: Elevation unknown? Beanjamin taps **`Don't Know`** — instant green check!
    3. **Everyday Water**: Taps **`Filtered Fridge Pitcher`** (`45 GH · 25 KH` — no chemistry degree needed).
  - **Headline**: `1. Scan Your Bag. Missing Info? Just Tap "Don't Know."`
  - **Punchline Caption**: `Peak-freshness calendar, blind-locked flavors & your real tap, pitcher, or bottled water.`
  - **SFX**: Camera shutter click (`14.30s`), crisp tactile tap clicks (`15.40s`, `16.70s`), refreshing water-droplet plink (`17.20s`).

- **Beat 07 (`0:18.50 – 0:23.20` | Frames `555–696`) — Step 3: Custom Grinder Clicks + `"Show the Science"` Popup**
  - **Action**: Phone tilts dynamically into `ui_step3_recipe_science`: **`201 °F (94 °C) · 19 Clicks · 15g : 250g`**. Beanjamin (`eureka` pointing with brass monocle gleam) taps **`? Why These Numbers? (Show the Science)`** — a sleek glass sheet springs open showing *why* dense washed Guji + pitcher water shines at `201 °F` and `19 clicks` (`580 µm`) on YOUR exact grinder!
  - **Headline**: `2. Exact Clicks on YOUR Grinder — Plus "? Why" Science.`
  - **Punchline Caption**: `52 grinders & 23 brewers calibrated. Tap "Show the Science" whenever curiosity strikes.`
  - **SFX**: Mechanical stepped grinder dial ticks (`18.75s`), spring sheet pop (`20.10s`), warm chord lift.

- **Beat 08 (`0:23.20 – 0:28.00` | Frames `696–840`) — Step 4: GIANT Chronograph + Live 3-Wave Sweet-Spot Cut!**
  - **Action**: Dramatic macro push onto `ui_step4_giant_timer_waves`! The **GIANT `#bt-timer-giant-clock` (`02:44.8`)** counts up beside the dual-comet chronograph while the **Live 3-Wave Extraction Graph** animates in real time:
    - **Wave 1 (`#D98B26` Bright Fruit Acids)** crests first →
    - **Wave 2 (`#B84A14` / `#28B576` Sweet Caramel Sugars)** surges right into the glowing **`SWEET-SPOT CUT GATE`** →
    - **Wave 3 (`#9E211D` Late Bitters)** starts creeping up on the right — Beanjamin (`focused` action leap!) dives across and **slams `■ Stop Brew (Done)`** at `0:27.10` before bitterness touches the cup!
  - **Headline**: `3. Ride the Caramel Sugars. Slam STOP Before Bitters.`
  - **Punchline Caption**: `Giant across-the-kitchen clock & live 3-Wave curve: Bright Acids → Sweet Sugars → CUT!`
  - **SFX**: Gentle pour stream foley (`23.40s–26.90s`), rising harmonic synth sweep tracking Wave 2, **decisive tactile STOP slam + crisp cut gating (`27.10s`)**!

- **Beat 09 (`0:28.00 – 0:33.00` | Frames `840–990`) — Step 5: 4-Ring Bullseye, Scratch Foil & Gold Recipe Euphoria!**
  - **Action**: Phone sweeps to `ui_step5_bullseye_gold`. Quick 2-beat dial-in arc: Cup #1 slightly bright → smart **`2 Clicks Finer`** tweak → Cup #2 hits dead-center of the **4-Ring Archery Bullseye**! Beanjamin (`zen` sip → ecstatic `celebrating` hop!) scrubs off the **Rose-Copper Scratch Foil** (`29.60s` metallic shimmer particles!) revealing **`94% Flavor Match: Jasmine & White Peach!`**, locking the **16-Point Gold Recipe Seal** (`31.20s` porcelain bell!). The entire studio & steaming cup erupt in radiant sunlit golden light!
  - **Headline**: `4. Hit the Bullseye. Scratch the Foil. Lock Gold.`
  - **Punchline Caption**: `One smart tweak → 94% Jasmine & Peach match unlocked. Goodbye sludge, hello euphoria!`
  - **SFX**: Metallic **rose-copper foil scratch shimmer (`29.60s`)** → **warm `1046 Hz + 1568 Hz` porcelain bell (`31.20s`)** → celebratory brass swell!

---

### ACT IV (`0:33.0 – 0:48.0`) — Casual-to-Scientist Power Showcase (Why EVERYONE Wants It)
*Fast, hyper-kinetic Sandwich-meets-Linear showcase proving how BeanTelligence is effortlessly simple at 7 AM yet unmatched for deep coffee nerds.*

- **Beat 10 (`0:33.00 – 0:36.80` | Frames `990–1104`) — Casual 7 AM Mode vs. Scientist Mode + 10s In-Mug Rescue**
  - **Action**: Crisp diagonal split-flip (`ui_casual_rescue_philips`):
    - **Left (Warm Alabaster — Casual Drinker)**: **In-Mug Emergency Rescue** (*"Already brewed it bitter? Add 18 mL hot water + micro-pinch salt — cup saved in 10 seconds!"*) + 1:1 **Philips 5500 LatteGo** touchscreen mirror (`Low/Med/High` menu temp & bean dial coach).
    - **Right (OLED Copper — Coffee Scientist)**: **Fellow Aiden** pulse-temp staircase, **xBloom** `RPM` shear, and 1-tap `Lab X-Ray` Darcy equations. Beanjamin flips playfully between cozy mug (`zen`) and brass monocle (`eureka`).
  - **Headline**: `Built for Sleepy 7 AM Humans AND Espresso Scientists.`
  - **Punchline Caption**: `Save a bitter mug in 10 seconds or mirror your Philips 5500, Fellow Aiden & xBloom.`
  - **SFX**: Snappy split-card flip whoosh (`33.05s`) + espresso steam hiss (`34.40s`) + UI toggle click (`35.50s`).

- **Beat 11 (`0:36.80 – 0:40.60` | Frames `1104–1218`) — `"The Chart IS The Input"` Sweet-Spot Graph & Live Bluetooth**
  - **Action**: Widescreen Studio showcase (`ui_lab_sweetspot_ble`): Beanjamin (`focused`) grabs the glowing puck on the **Touch-to-Brew Sweet-Spot Control Graph (`TDS × %EY`)** and drags it directly into his green **Personal Sweet-Spot Island** — live recipe numbers update at 60fps while **Web Bluetooth** streams live `g/s` weight & `%TDS` from **15 smart scale & DiFluid families** with zero API keys!
  - **Headline**: `Drag the Sweet-Spot Graph. Stream Bluetooth Scales Live.`
  - **Punchline Caption**: `The chart IS the input — plus instant browser Bluetooth for Acaia, Bookoo, Timemore & DiFluid.`
  - **SFX**: Smooth vernier scrub ticks (`37.20s–38.60s`) + dual-tone BLE pair confirmation chime (`39.10s`).

- **Beat 12 (`0:40.60 – 0:44.20` | Frames `1218–1326`) — 24-Hour Caffeine Curve & `"Last Safe Sip"` Sleep Shield**
  - **Action**: Interactive **`CircadianCaffeineTimeline`** (`ui_lab_caffeine_water`): Beanjamin (`sleepy` nightcap yawn → `eureka` grin) slides a 4:30 PM espresso token back to **`2:15 PM — Latest Safe Bedtime Cutoff`**, turning the 11:00 PM sleep zone from warning amber to calm emerald green!
  - **Headline**: `Love 3 PM Coffee? Know Your Exact "Last Safe Sip."`
  - **Punchline Caption**: `24-hour circadian caffeine modeling keeps your afternoon buzz from wrecking tonight's sleep.`
  - **SFX**: Whip-whoosh (`40.62s`) + smooth timeline scrub + gentle twilight celesta chime (`42.40s`).

- **Beat 13 (`0:44.20 – 0:48.00` | Frames `1326–1440`) — 52-Origin World Map, 85-Note Wheel & `"Will I Love This Bag?"`**
  - **Action**: Gorgeous 3-panel fan-out (`ui_palate_map_sunburst`): Collectible **52-Origin World Coffee Belt Map** lighting up equatorial terroirs, spring-blooming **85-Note Aroma Sunburst Wheel**, and the **`"Will I Love This Bag?"` Personal Preference Predictor** stamping **`96% Palate Match — Buy This Bag!`** as Beanjamin (`celebrating`) gives a double-paw cheer! Rising musical build into the grand finale!
  - **Headline**: `52-Origin Map. 85-Note Wheel. "Will I Love This Bag?"`
  - **Punchline Caption**: `Your personal Palate DNA predicts if you'll love a $24 store bag BEFORE you buy it.`
  - **SFX**: Sunburst petal bloom shimmer (`44.80s`) + stamp lock (`46.20s`) + rising orchestral/synth crescendo (`46.80s–48.00s`).

---

### ACT V (`0:48.0 – 0:56.5`) — 3D Turning-Pages Hardcover Book Finale (*The BeanTelligence Compendium*)
*Centerpiece agency showstopper: A luxurious gold-foiled roasted-espresso leather hardcover tome opens in 3D perspective. Six thick cream-parchment & obsidian-plated spreads physically curl and turn (`cos(theta)` 3D foreshortening + curved spine shadow), synced to 6 stereo left-to-right hardcover page-flip whooshes!*

- **Beat 14 (`0:48.00 – 0:50.80` | Frames `1440–1524`) — Compendium Opens: Spreads I & II**
  - **Page Turn #1 (`48.15s`)**: **Spread I — 23 Brewers · 52 Grinders · Smart Machine Twins** (*V60, Espresso, AeroPress, Philips 5500, Aiden & xBloom*).
  - **Page Turn #2 (`49.50s`)**: **Spread II — Giant 3-Wave Chronograph & 15-Family Web Bluetooth** (*Acids → Sugars → Bitters + Scales & Refractometers*).
  - **Headline**: `Every Coffee Superpower. One Complete Studio.`
  - **Punchline Caption**: `23 brewers · 52 grinders · Giant 3-Wave timer · 15-family Bluetooth bench.`
  - **SFX**: Deep leather book open (`48.02s`), **Page-Flip Foley #1 (`48.15s`)**, **Page-Flip Foley #2 (`49.50s`)**.

- **Beat 15 (`0:50.80 – 0:53.60` | Frames `1524–1608`) — Compendium Flips: Spreads III & IV**
  - **Page Turn #3 (`50.90s`)**: **Spread III — 4-Ring Bullseye, Scratch Foil & 3-Cup Gold Convergence** (*Blind-First Tasting + Instant Dial-In*).
  - **Page Turn #4 (`52.25s`)**: **Spread IV — 14 Interactive Lab Calculators & 24-Water Studio** (*Sweet-Spot KDE, Circadian Caffeine & Mineral Fixer*).
  - **Headline**: `From 30-Second Bullseye Tasting to 14 Physics Labs.`
  - **Punchline Caption**: `Scratch-off flavor reveal · In-Mug Rescue · Sweet-Spot Chart · 24-Water & Caffeine Studio.`
  - **SFX**: **Page-Flip Foley #3 (`50.90s`)**, **Page-Flip Foley #4 (`52.25s`)** over swelling warm brass & Rhodes chords.

- **Beat 16 (`0:53.60 – 0:56.50` | Frames `1608–1695`) — Compendium Flips: Spreads V & VI**
  - **Page Turn #5 (`53.65s`)**: **Spread V — 52-Origin World Map, 85-Note Wheel & Bag Predictor** (*Bayesian Palate DNA & Store Scanner*).
  - **Page Turn #6 (`55.00s`)**: **Spread VI — Cafe Logger, 5-Bowl SCA Cupping & 774-Term Encyclopedia** (*100% Local-First, Offline-Ready, Zero Accounts*).
  - **Headline**: `World Terroir Passport. 5-Bowl Cupping. 774-Term Academy.`
  - **Punchline Caption**: `52 origins · "Will I Love This Bag?" · Cafe Logger · 774 coffee terms — 100% free & offline.`
  - **SFX**: **Page-Flip Foley #5 (`53.65s`)**, **Page-Flip Foley #6 (`55.00s`)** reaching peak golden harmonic anticipation at `56.45s`!

---

### ACT VI (`0:56.5 – 1:00.0`) — Signature End Card & Beanjamin Golden-Cup Wink
*Grade: Signature Crest Finale (`#160D08 → #331A0D` + 3-Wave Spectral Halo) · Music: Crisp hardcover close + warm shimmering Major-9th BeanTelligence sonic resolve + playful wink-ding at `58.40s` + smooth master fade at `59.85s`.*

- **Beat 17 (`0:56.50 – 60.00` | Frames `1695–1800`) — Crest Lockup, Steaming Golden Toast & Wink**
  - **Action**: At `56.55s`, *The BeanTelligence Compendium* snaps shut with a satisfying leather-and-gold *thump*, seamlessly morphing into the gleaming **Refracting Prism Drop** crest & `BeanTelligence` wordmark (`A LITTLE SCIENCE, A LOT OF DELICIOUS.`). Beside the crest, **Beanjamin 2.0** (`zen` → custom hero toast) raises a steaming golden porcelain cup, and at **`58.40s`** tips his brass monocle with a confident **star-sparkle wink**! High-contrast CTA pill shines below: **`Try Free Right Now · Zero Sign-Up · mshaffe1111.github.io/Neurobrew`**.
  - **Headline**: `BeanTelligence — Life's Too Short for Battery-Acid Coffee.`
  - **Punchline Caption**: `A little science, a lot of delicious. · Free, Private & Offline-Ready · mshaffe1111.github.io/Neurobrew`
  - **SFX**: Crisp **hardcover book-close thump (`56.55s`)** + lush **Major-9th BeanTelligence sonic logo chord (`56.60s–59.85s`)** + **playful high wink-ding (`58.40s`, `1568 Hz → 2093 Hz` harmonic sparkle)** → clean `-inf` fade at `60.00s`.
