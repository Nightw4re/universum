# NPM Scripts

This repository uses npm scripts to manage the modpack lifecycle: generating manifests, building releases, syncing files between the repo and the local CurseForge instance, and uploading releases.

## Quick Reference

| Script | What it does | When to use it |
|---|---|---|
| `npm run manifest` | Generates `modpack/manifest.json` and `modpack/modlist.html` from the local CurseForge instance | After changing the installed mod set in the game instance |
| `npm run build` | Creates the standard CurseForge release zip from `modpack/` | Before publishing a normal CurseForge build |
| `npm run build:modrinth` | Creates a Modrinth-compatible zip with `modrinth.index.json` | Before publishing a Modrinth release |
| `npm run build:server` | Builds the standalone server package zip | When preparing a server distribution |
| `npm run release:notes` | Prints release notes generated from Git commit messages | Before uploading or drafting a release |
| `npm run upload` | Uploads the built CurseForge zip to the CurseForge API | After building a release and setting API credentials |
| `npm run sync` | Dry-run that shows what would be copied from the local game instance into the repo | To inspect in-game changes before importing them |
| `npm run sync:apply` | Copies selected files from the local game instance into the repo and refreshes `manifest.json` plus `modlist.html` | After confirming you want to bring game-side changes into source control |
| `npm run sync:verbose` | Same as `sync:apply`, but with file-by-file output | When you need to audit exactly what changed |
| `npm run deploy` | Dry-run that shows what would be copied from the repo into the local game instance | To inspect repo changes before pushing them into the game |
| `npm run deploy:apply` | Copies repo changes into the local game instance | After editing tracked files in `modpack/overrides/` |
| `npm run deploy:verbose` | Same as `deploy:apply`, but with file-by-file output | When you want detailed deployment logs |

## Script Details

### `npm run manifest`

Reads the local CurseForge instance metadata and regenerates:

- `modpack/manifest.json`
- `modpack/modlist.html`

This script requires the game instance to have been launched at least once through CurseForge so that `minecraftinstance.json` exists.

### `npm run build`

Packages the `modpack/` directory into a standard release ZIP for CurseForge.

### `npm run build:modrinth`

Creates a Modrinth release archive from `modpack/overrides/` and adds a generated `modrinth.index.json`.

The archive is versioned using the `package.json` version string.

### `npm run build:server`

Assembles a minimal dedicated server package:

- copies server-specific files from `server-files/`
- includes `modpack/overrides/config/`
- includes `modpack/overrides/kubejs/`
- generates installer scripts
- zips the result into `build/universum-server-v<version>.zip`

NeoForge and mod jars are not bundled into this archive.

### `npm run release:notes`

Builds release notes from commit subjects in the current Git range.

It groups commits by conventional type prefixes:

- `feat`
- `fix`
- `update`
- `remove`

If no release tag is present, it falls back to a recent commit range.

### `npm run upload`

Uploads the built CurseForge ZIP to the CurseForge API.

Required environment variables:

- `CURSEFORGE_API_TOKEN`
- `CURSEFORGE_PROJECT_ID`

Optional environment variable:

- `RELEASE_CHANNEL` with values `release` or `alpha`

### `npm run sync`

Copies files from the local game instance into the repository.

Sync strategy:

- `kubejs/` is copied fully
- `config/` is copied selectively, preserving only tracked files

After a successful apply, the script also refreshes:

- `modpack/manifest.json`
- `modpack/modlist.html`

Use `--apply` to actually write changes. Without it, the script runs in dry-run mode.

### `npm run deploy`

Copies files from the repository into the local game instance.

Deploy strategy:

- `kubejs/` is copied fully
- `config/` is copied selectively

Use `--apply` to actually write changes. Without it, the script runs in dry-run mode.

## Common Workflow

1. Edit files in `modpack/overrides/`.
2. Run `npm run deploy:apply` to push those changes into the local game instance.
3. If you changed the installed mod set in-game, run `npm run manifest`.
4. Run `npm run build` or `npm run build:modrinth` for a release archive.
5. Run `npm run release:notes` if you need changelog text.
6. Run `npm run upload` after the release archive is ready and API credentials are set.

## Environment Variables

Some scripts read optional values from `.env` if it exists.

- `GAME_INSTANCE`
- `SERVER_INSTANCE`
- `CURSEFORGE_API_TOKEN`
- `CURSEFORGE_PROJECT_ID`
- `RELEASE_CHANNEL`
- `SERVER_NEOFORGE_VERSION`
- `SERVER_PAYLOAD_URL`
