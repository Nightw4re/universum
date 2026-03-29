# Universum Modpack — AI Context

Minecraft modpack for **NeoForge 1.21.1**, Stargate-themed. Managed via CurseForge.

## Repository Structure

```
modpack/
  manifest.json               # CurseForge manifest (mod list + versions)
  overrides/
    config/                   # Mod config files (selective — only tracked files)
      ftbquests/quests/       # FTB Quests data
        chapters/             # One .snbt file per quest chapter
        lang/en_us.snbt       # Quest title/description translations (legacy, NOT used in-game)
        reward_tables/        # Loot tables for quest rewards
    kubejs/
      startup_scripts/        # Runs on game startup (item/block registration)
      server_scripts/         # Runs on server start (recipes, events)
      client_scripts/         # Client-side scripts
      assets/universum/       # Custom textures, lang files
      data/                   # Custom worldgen, dimensions, recipes, structures
    resourcepacks/            # Resource packs
scripts/
  sync.mjs                    # Copies FROM game → repo (pull changes made in-game)
  deploy.mjs                  # Copies FROM repo → game (push changes to local game)
  build.mjs                   # Builds release zip
  cfg.mjs                     # Shared config (game instance path, dirs)
```

## NPM Scripts

| Command | Description |
|---|---|
| `npm run sync` | Dry-run: show what would be pulled from game |
| `npm run sync:apply` | Pull changes from local game into repo |
| `npm run deploy` | Dry-run: show what would be pushed to game |
| `npm run deploy:apply` | **Push repo changes to local game instance** |
| `npm run deploy:verbose` | Push with detailed file-by-file output |
| `npm run build` | Build release zip for CurseForge upload |

**After editing any file in `modpack/overrides/`, run `npm run deploy:apply` to apply changes to the local game.**

Game instance path: `../../curseforge/minecraft/Instances/Universum` (relative to repo root), or override via `GAME_INSTANCE` env var.

## Custom Materials (universum namespace)

Registered in [kubejs/startup_scripts/universum/materials.js](modpack/overrides/kubejs/startup_scripts/universum/materials.js).

| Item | ID | Source |
|---|---|---|
| Raw Trinium | `universum:raw_trinium` | Mined in **Niflheim** dimension |
| Trinium Ingot | `universum:trinium_ingot` | Smelted from raw trinium |
| Trinium Alloy | `universum:trinium_alloy` | Trinium + Naquadah alloy |
| Naquadria | `universum:naquadria` | Mined in **Oannes** dimension |
| Liquid Naquadria Bucket | `universum:liquid_naquadria_bucket` | Naquadria liquefied in Chemical Reactor |

Ore blocks: `universum:trinium_ore`, `universum:deepslate_trinium_ore`, `universum:naquadria_ore`, `universum:deepslate_naquadria_ore`

## Custom Dimensions (universum namespace)

| Dimension | ID | Theme | Unique resource |
|---|---|---|---|
| Netu | `universum:netu` | Volcanic / fire | Osmium |
| Niflheim | `universum:niflheim` | Frozen / ice | Trinium |
| Oannes | `universum:oannes` | Ocean / underwater | Naquadria |

Dimensions defined in `kubejs/data/universum/dimension/`.
Worldgen (biomes, noise, ores, placed features) in `kubejs/data/universum/worldgen/`.
SGJourney solar systems in `kubejs/data/sgjourney/solar_system/`.

## FTB Quests — Important Notes

- Quest descriptions use the `subtitle` field **directly in the `.snbt` chapter file** — NOT the lang file.
- The `lang/en_us.snbt` file exists but its `quest.ID.quest_desc` entries are **not displayed in-game** (legacy).
- To hide a quest until its prerequisite is done: set both `dependencies: ["QUEST_ID"]` AND `hide_until_deps_complete: true`.
- A quest with `hide_until_deps_complete: true` but **no `dependencies`** will be **permanently invisible** — always check both fields together.
- The root dependency used by most chapter-entry quests is `"6CB1A938135C55CD"` (Chapter One / welcome chapter ID).

### Quest Chapter Files

| File | Group | Description |
|---|---|---|
| `welcome.snbt` | — | Intro / Chapter One |
| `exploration.snbt` | The Journey | Overworld & dimension exploration |
| `stargate.snbt` | The Journey | SGJourney progression, custom dimensions, Trinium/Naquadria |
| `chapter_fivethe_endgame.snbt` | The Journey | Endgame |
| `armor_tools_and_weapons.snbt` | Survival & Combat | Gear progression |
| `bosses.snbt` | Survival & Combat | Boss fights (Cataclysm, vanilla) |
| `cooking.snbt` | Survival & Combat | Food |
| `pneumaticraft.snbt` | Engineering | PneumaticCraft |
| `applied_energetics_2.snbt` | Engineering | AE2 |
| `mekanism.snbt` | Industrial | Mekanism |
| `modern_industrialization.snbt` | Industrial | Modern Industrialization |
| `hostile_neural_network.snbt` | Industrial | Hostile Neural Networks |
| `industrial_foregoing.snbt` | Industrial | Industrial Foregoing |

## Key Modpack Customizations

- **AE2**: Infinite channels disabled (8 per small cable, 32 per dense).
- **Apotheosis**: Removed (towers, enchanting system, gems, affixes all deleted).
- **Stellarity**: Steel ore worldgen disabled to avoid overworld clutter.
- **SGJourney**: Custom stargates on Niflheim/Oannes via structure data in `kubejs/data/sgjourney/`.
- **Minecolonies**: Apotheosis towers and barbarian camps removed for vanilla-style overworld.
