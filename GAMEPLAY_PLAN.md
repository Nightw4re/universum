# Universum — Gameplay Progression Plan

## Základní myšlenka

Hráč prochází třemi velkými akty:
1. **Survival & Exploration** — vanilla+, první technika, svět si tě vyzkouší
2. **The Gate** (midgame) — SGJourney jako ústřední osa, naquadah je klíčová surovina pro pokrok vpřed
3. **Industrial Horizon** (endgame) — Modern Industrialization plně odblokovatelný až po zvládnutí SGJourney, Mekanism jako přechod

Klíčové design principy:
- **Naquadah a SGJourney suroviny jsou prerekvizita pro MI Electric Age** — SGJourney přestane být volitelný side-content
- **PneumaticCraft je most mezi Steam Age a Electric Age** — plastika z Refinery + PnC Assembly System jako prerekvizita MI Assembleru
- **Industrial Foregoing je odměna za průzkum Chulaku** — Jaffa bio-tech lore, odemkne se až po cestě skrz gate

---

## Lore Framework

| Mod | Lore identita | Kdy se odemkne |
|-----|--------------|----------------|
| Mekanism | Tau'ri základní technologie (Earth engineering) | Fáze 2 |
| PneumaticCraft | Tau'ri pneumatická mechanika, Goa'uld pressure tech | Fáze 1–3 |
| AE2 | Asgard digital storage technology | Fáze 2–4 |
| Industrial Foregoing | Jaffa bio-engineering (Chulak schematics) | Fáze 3 (po Chulaku) |
| Modern Industrialization | Tau'ri heavy industry, SGJourney-powered | Fáze 3–5 |
| Hostile Neural Networks | Goa'uld neural simulation (post-Electric Age) | Fáze 4 |

---

## Fáze 1 — Early Game: "Survival" (~0–15h)

### Cíl: zvládnout svět, jídlo, první vybavení, PneumaticCraft základy

**Milníky:**
- Postavit základnu, farmy (Serene Seasons, Farmer's Delight, Cooking for Blockheads)
- Spice of Life — různé jídlo = bonusy
- Artifacts — najít první artefakty z dungeonů
- Sophisticated Backpacks — roztřídit inventory
- Iron → Diamond gear (Armor & Weapons chapter)
- První PneumaticCraft: kompresory, základní tlak, Pneumatic Armor

**Bossi:**
- Bosses of Mass Destruction — Obsidilith, Nether dungeon bossi
- Cataclysm — první tier (Harbinger)

**Quest logika:**
- Welcome chapter odblokovává Stargate chapter a Armor/Weapons chapter
- PneumaticCraft chapter dostupný po Armor/Weapons

---

## Fáze 2 — Early-Mid: "First Machines" (~15–35h)

### Cíl: základy techniky, AE2 network, začátek SGJourney lore

**Milníky:**
- Mekanism: tier 1–2 ore processing (Crusher, Enrichment Chamber, Purification Chamber)
  - 3× ore processing → snazší sběr materiálů
  - Basic power: solární, wind generator
- AE2: ME Drive, základní autocraft, channels
  - Applied Flux + Applied Mekanistics integrace
  - AE2 použitelné od začátku, ale plný autocraft až po Electric Age
- SGJourney začátek:
  - Archeology Table — hledání cartouches a SGJ lore
  - Sbírat SGJourney fragments z ruin
  - Crystallizer — první crystals
  - Cíl fáze: postavit Milky Way Stargate + DHD

**Quest logika:**
- Mekanism chapter se odemkne po Welcome
- AE2 chapter se odemkne po Mekanism (základní krok)
- Stargate chapter pokračuje paralelně (archeologie)

---

## Fáze 3 — Midgame: "Through the Gate" (~35–65h)

### Cíl: SGJourney jako hlavní osa, naquadah mining, PnC→MI bridge, IF unlock

**Milníky:**

### SGJourney
- **Stargate operational** — Milky Way DHD + plně vybavený gate
  - Travel na Abydos → Raw Naquadah mining
  - Travel na **Chulak** → combat resources, Jaffa gear, **Jaffa Bio-Engineering Schematics** (odemkne IF)
  - Universe Stargate → Netu, Niflheim, Oannes dimenze

**Naquadah processing chain:**
- Raw Naquadah → Refined Naquadah (Crystallizer)
- Refined → Liquid Naquadah (Naquadah Liquidizer)
- Pure Naquadah → základní SGJ komponenty

### PneumaticCraft → MI Bridge (klíčová vazba)
- **PnC Refinery**: olej → kerosín → LPG → Plastic Sheets
- **PnC Assembly System**: vyrobí součástky potřebné pro MI Assembler
  - Konkrétně: `Assembly Machine` z PnC vyrobí `Machine Frame` nebo ekvivalent pro MI Electric Age
  - KubeJS recept: MI Assembler vyžaduje PnC Assembly-crafted component
- **PnC Pressure Chamber**: Bronze components efektivněji
- Tím PnC přestane být side-content — je nutný pro MI Electric Age

### Industrial Foregoing (Chulak unlock)
- Quest: "Travel to Chulak" → reward: **Jaffa Bio-Engineering Schematics** (key item nebo quest milestone)
- Odemkne IF chapter / sekci v Engineering chaptera
- Lore: Jaffa jsou warrior caste s Goa'uld bio-tech → IF stroje jsou replikované Jaffa schematics
- **Plant Sower + Plant Gatherer** = Jaffa agricultural automation → food farming bez lagů
- **Animal Rancher + Mob Crusher** = Jaffa livestock/combat systems → mob drops bez dronů
- **Laser Drill** (pozdější) = Naquadah Extraction Rig

### AE2 mid-tier
- Autocrafting plně rozjetý
- ME Requester, MEGA Cells
- Polymorphic Energistics

### MI Bronze Age (prerekvizita na Electric Age)
- Bronze Coke Oven → Bronze machines
- Large Steam Boiler → Steam Turbine
- **KubeJS receptura: Refined Naquadah + PnC Assembly component vyžadovány pro MI Electric Age přechod**

**Bossi:**
- Cataclysm — Ancient Factory, Frozen Prison
- L_Ender's Cataclysm mid bossi (Ignis, Leviathan)
- Bosses of Mass Destruction — Lich, Void Blossom

**Quest logika:**
- Stargate chapter: Milky Way Stargate → Abydos → Chulak → Universe Stargate
- IF chapter odemkne Chulak quest milestone
- MI chapter dostupný od Bronze Age, Electric Age gated za SGJourney + PnC milestone

---

## Fáze 4 — Late Midgame: "Electric Age" (~65–95h)

### Cíl: MI Electric Age, Mekanism tier 4, AE2 plně automatizovaný, IF plný

**Milníky:**
- **MI Electric Age:**
  - Electric Blast Furnace — Steel, Aluminum, Titanium
  - LV → MV → HV machines
  - Electric Quarry — automated mining
  - Fluid networks (distillation tower, chemical reactor)
- **Mekanism tier 3–4:**
  - 4× ore processing chain plně funkční
  - QIO storage + drives
  - Digital Miner
- **IF pokročilý tier:**
  - Laser Drill (Naquadah Extraction Rig lore)
  - Bioreactor → Biofuel pro power generation
- **Hostile Neural Networks** — odemkne se po MI Electric milestone
  - Leveling simulation chambers
  - Deep Learner
  - Lore: Goa'uld neural simulation tech (reverse-engineered)
- **Extended Industrialization** — MI extended recipes a machines
- **SGJourney Universe Stargate** — přístup na Netu, Oannes pro exotic ores

**Quest logika:**
- MI chapter pokračuje (Electric Age sekce)
- HNN chapter dostupný po MI electric tier milestone
- Mekanism chapter: tier 4 sekce

---

## Fáze 5 — Endgame: "Nuclear Horizon" (~95h+)

### Cíl: MI Nuclear + Fusion, Mekanism Fusion Reactor, megastructury

**Milníky:**
- **MI Nuclear Age:**
  - Electric Blast Furnace HV tier
  - Nuclear Reactor — uran z Mekanism processing
  - Fusion Reactor (MI) — deuterium + tritium
  - Singularity crafting (ultimate items)
- **Mekanism Fusion Reactor:**
  - Polonium + Antimatter chains
  - Fusion Reactor pro prakticky neomezenou energii
- **AE2 Endgame:**
  - AdvancedAE, MEGA Cells plně využité
  - Singularity autocraft chains
- **SGJourney finale:**
  - Pure Naquadah Block — symbolický milník dobytí galaxie
  - Unity Shard / Unity Cluster — endgame SGJourney crafty
- **Chapter Five — The Endgame:**
  - Závislý na dokončení Mekanism chapter
  - Závislost také na SGJourney finale quest (Pure Naquadah Block)

**Bossi:**
- Cataclysm — Ignis, Leviathan, Void Worm (endgame tier)
- Bosses of Mass Destruction — finální bossi

---

## Skupiny questů

| ID skupiny | Obsah | Název |
|------------|-------|-------|
| `78F3519E8A49FAB8` | Welcome, Stargate, Deeper & Darker, Endgame | **The Journey** |
| `22D133045023811C` | Armor/Weapons, Cooking, Bosses, Exploration | **Survival & Combat** |
| `02D94E7EA029CF01` | PneumaticCraft, Industrial Foregoing | **Engineering** |
| `244B68E119B27430` | AE2, Mekanism, MI, HNN | **Industrial** |

---

## Hráčská navigace — jak vést hráče bez čtení questů

Zkušení hráči questy nečtou. Efektivní přístupy:

### 1. KubeJS Item Tooltips (nejdůležitější)
Přidat tooltip přímo na gated item/recept:
```js
// startup_scripts/tooltips.js
ItemEvents.tooltip(event => {
  event.add('modern_industrialization:lv_machine_casing', [
    Text.of('Requires: Refined Naquadah').gold(),
    Text.of('Requires: PnC Assembly Component').gold(),
    Text.of('→ Travel through the Stargate first').gray()
  ])
})
```
Hráč vidí block přímo v JEI/crafting tabulce — nejpřímější signal.

### 2. Krátké quest názvy místo long descriptions
Místo lore textu v názvu:
- ✅ `"Chulak → Jaffa Schematics → IF Unlock"`
- ❌ `"The Jaffa warriors of Chulak have developed..."`

Popis může mít lore, ale **název musí říct co a proč**.

### 3. Quest chapter header text
FTB Quests chapter description (viditelná bez otevírání questu) — stručně:
> "Industrial Foregoing machines require Jaffa Schematics from Chulak. Travel there first."

### 4. Patchouli — Universum Codex (volitelné, long-term)
Vlastní guide book s stránkami jako:
- "Progression Gates" — přehled co blokuje co
- "Stargate Network" — kde co najdeš
- Nízká priorita, ale máš Patchouli v modpacku

---

## KubeJS implementační body

### 1. MI Electric Age gate (nejvyšší priorita)
```js
// server_scripts/universum/mi_electric_gate.js
// LV Machine Casing vyžaduje Refined Naquadah + PnC Assembly component
ServerEvents.recipes(event => {
  event.replaceInput(
    { mod: 'modern_industrialization', type: 'mi:assembler' },
    'modern_industrialization:lv_machine_casing',
    // přidat Refined Naquadah jako ingredient
  )
})
```

### 2. PnC Assembly → MI Assembler component
```js
// KubeJS recept: PnC Assembly System crafts "Tau'ri Circuit Board"
// MI Assembler recept vyžaduje tuto součástku
// Tím hráč musí mít PnC Assembly System před MI Electric Age
```

### 3. IF Chulak unlock
- Quest "Travel to Chulak" dá reward item nebo nastaví quest flag
- IF chapter locked za tímto questem
- Alternativa: KubeJS locked recipe — IF stroje vyžadují "Jaffa Schematics" item z Chulak lootu

### 4. Industrial Foregoing → HNN bridge
- IF Mob Crusher je "základní" mob farming
- HNN se odemkne až po IF milestone — upgrade path je jasný

### 5. SGJourney → Endgame chapter dependency
- Přidat Pure Naquadah Block quest ID jako dependency k prvnímu endgame questu
- Vedle stávajícího Mekanism dependency `"569A9E3D42C3AC8F"`

### 6. Item tooltips pro všechny gated recepty
- MI Electric Age → tooltip s Naquadah + PnC requirement
- IF machines → tooltip s "Jaffa Schematics from Chulak"

---

## Stav implementace

| Komponenta | Stav |
|------------|------|
| MI Electric Age gate (Naquadah) | ✅ základní verze v `mi_electric_gate.js` |
| PnC → MI Assembly bridge | ❌ chybí |
| IF Chulak unlock (quest) | ❌ chybí |
| IF chapter / sekce | ❌ chybí |
| HNN locked za IF | ❌ chybí |
| Bosses chapter | ✅ existuje |
| Exploration chapter | ✅ existuje |
| Endgame SGJourney dependency | ❌ chybí |
| Item tooltips (KubeJS) | ❌ chybí |
| Skupiny questů přejmenování | ❌ chybí |
