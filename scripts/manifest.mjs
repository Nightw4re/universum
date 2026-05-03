/**
 * manifest.mjs
 *
 * Reads the CurseForge game instance (minecraftinstance.json) and generates:
 *   - modpack/manifest.json   (CurseForge modpack manifest)
 *   - modpack/modlist.html    (human-readable mod list)
 *
 * Requires the game to have been launched at least once via CurseForge so that
 * minecraftinstance.json exists inside the instance folder.
 *
 * Usage:
 *   node scripts/manifest.mjs
 *
 * Optional env vars (see .env.example):
 *   GAME_INSTANCE   — absolute path to the Minecraft instance folder
 */

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { gameInstance, manifest, modlist } from './cfg.mjs';
import packageJson from '../package.json' with { type: 'json' };

const instanceFile = join(gameInstance, 'minecraftinstance.json');

async function generateManifest() {
    let mcdata;
    try {
        mcdata = JSON.parse(await readFile(instanceFile, 'utf8'));
    } catch {
        console.error(`ERROR: Could not read instance file:\n  ${instanceFile}`);
        console.error('Make sure the game has been launched once via CurseForge, or set GAME_INSTANCE env var.');
        process.exit(1);
    }

    const modloader = mcdata.baseModLoader;

    const output = {
        minecraft: {
            version: mcdata.gameVersion,
            modLoaders: [{ id: modloader.name, primary: true }],
            recommendedRam: 8192,
        },
        manifestType: 'minecraftModpack',
        manifestVersion: 1,
        name: 'Universum',
        version: packageJson.version,
        author: 'Nightw4re',
        overrides: 'overrides',
        files: [],
    };

    let html = '<ul>';

    const addons = [...mcdata.installedAddons].sort((a, b) =>
        a.installedFile.projectId > b.installedFile.projectId ? 1 : -1
    );

    for (const addon of addons) {
        const file = addon.installedFile;
        html += `\n<li><a href="${addon.webSiteURL}">${addon.name} (by ${addon.primaryAuthor})</a></li>`;
        output.files.push({ projectID: file.projectId, fileID: file.id, required: true });
    }

    html += '\n</ul>';

    await writeFile(manifest, JSON.stringify(output, null, 2));
    console.log(`manifest.json written (${output.files.length} mods, v${output.version})`);

    await writeFile(modlist, html);
    console.log('modlist.html written');
}

generateManifest().catch(err => { console.error(err); process.exit(1); });
