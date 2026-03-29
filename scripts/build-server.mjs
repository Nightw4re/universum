/**
 * build-server.mjs
 *
 * Assembles a runnable Minecraft server package and zips it into build/.
 *
 * Sources (layered into build/server/, then zipped):
 *   - server-files/        → run scripts, eula, server.properties, install.sh/bat
 *   - gameInstance/mods/   → base client+server mods (client-only excluded)
 *   - serverInstance/mods/ → server-only extra mods on top
 *   - overrides/config/    → modpack config
 *   - overrides/kubejs/    → KubeJS scripts
 *
 * NeoForge (libraries/) is NOT included — run install.sh / install.bat on the server.
 *
 * Output:
 *   build/server/                        assembled server (unzipped)
 *   build/universum-server-v{ver}.zip    final archive
 *
 * Usage:
 *   node scripts/build-server.mjs
 *
 * Optional env vars (see .env.example):
 *   GAME_INSTANCE   — path to the base Minecraft instance
 *   SERVER_INSTANCE — path to the server-only mods instance (default: Universum-server)
 */

import { join, basename } from 'path';
import { createWriteStream } from 'fs';
import { promises as fs } from 'fs';
import archiver from 'archiver';
import { exists, transferFull } from './lib/transfer.mjs';
import { gameInstance, serverInstance, overridesDir, rootDir, buildDir } from './cfg.mjs';
import packageJson from '../package.json' with { type: 'json' };

const serverFilesDir = join(rootDir, 'server-files');
const outputDir = join(buildDir, 'server');
const outputZip = join(buildDir, `universum-server-v${packageJson.version}.zip`);

const CLIENT_ONLY_MODS = [
    /^Pretty Rain.*\.jar/,
    /^Rainbows.*\.jar/,
    /fancymenu/,
    /drippyloadingscreen/,
    /watermedia/,
    /^cwb-neoforge-/,
];

const opts = { dryRun: false, verbose: false, exclude: CLIENT_ONLY_MODS };

async function zipDir(sourceDir, zipPath) {
    await fs.mkdir(join(zipPath, '..'), { recursive: true });
    const output = createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 1 } }); // level 1 = fast, server JARs don't compress well

    archive.pipe(output);
    archive.directory(sourceDir, false);

    await new Promise((resolve, reject) => {
        output.on('close', resolve);
        archive.on('error', reject);
        archive.finalize();
    });

    const { size } = await fs.stat(zipPath);
    console.log(`ZIP created: ${basename(zipPath)} (${(size / 1024 / 1024).toFixed(0)} MB)`);
}

async function main() {
    for (const [label, path] of [['Game instance', gameInstance], ['Server instance', serverInstance]]) {
        if (!(await exists(path))) {
            console.error(`ERROR: ${label} not found at:\n  ${path}`);
            process.exit(1);
        }
    }

    console.log(`Game instance:   ${gameInstance}`);
    console.log(`Server instance: ${serverInstance}`);
    console.log(`Output dir:      ${outputDir}\n`);

    await transferFull(serverFilesDir, outputDir, 'server-files (NeoForge base)', opts);
    await transferFull(join(gameInstance, 'mods'), join(outputDir, 'mods'), 'mods (base)', opts);
    await transferFull(join(serverInstance, 'mods'), join(outputDir, 'mods'), 'mods (server-only)', opts);
    await transferFull(join(overridesDir, 'config'), join(outputDir, 'config'), 'config', opts);
    await transferFull(join(overridesDir, 'kubejs'), join(outputDir, 'kubejs'), 'kubejs', opts);

    console.log('\nZipping...');
    await zipDir(outputDir, outputZip);

    console.log('=== Build complete. ===');
}

main().catch(err => { console.error(err); process.exit(1); });
