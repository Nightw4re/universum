/**
 * deploy.mjs
 *
 * Pushes files FROM modpack/overrides/ INTO the local game instance.
 * Opposite direction of sync.mjs.
 *
 * Strategy:
 *   - kubejs/        → full deploy (everything is custom)
 *   - config/        → selective deploy (only files tracked in overrides/config)
 *
 * Usage:
 *   node scripts/deploy.mjs              # dry-run (shows what would change)
 *   node scripts/deploy.mjs --apply      # actually copies files
 *   node scripts/deploy.mjs --apply --verbose
 */

import { join, dirname } from 'path';
import { mkdir, readFile, rm, writeFile } from 'fs/promises';
import { exists, transferFull, transferSelective } from './lib/transfer.mjs';
import { gameInstance, overridesDir, externalMods as externalModsPath } from './cfg.mjs';

const args = process.argv.slice(2);
const opts = { dryRun: !args.includes('--apply'), verbose: args.includes('--verbose') };

if (opts.dryRun) console.log('=== DRY RUN — pass --apply to actually copy files ===\n');

async function readExternalMods() {
    try {
        return JSON.parse(await readFile(externalModsPath, 'utf8'));
    } catch {
        return { replacements: [], exclusions: [] };
    }
}

async function ensureDownloadedFile(url, destinationPath) {
    const response = await fetch(url, {
        headers: { 'User-Agent': 'universum-deploy/1.0' },
    });

    if (!response.ok) {
        throw new Error(`Failed to download ${url}: HTTP ${response.status}`);
    }

    const data = Buffer.from(await response.arrayBuffer());
    await mkdir(dirname(destinationPath), { recursive: true });
    await writeFile(destinationPath, data);
}

async function main() {
    if (!(await exists(gameInstance))) {
        console.error(`ERROR: Game instance not found at:\n  ${gameInstance}`);
        process.exit(1);
    }
    console.log(`Game instance: ${gameInstance}`);
    console.log(`Overrides dir: ${overridesDir}`);

    const externalMods = await readExternalMods();

    await transferFull(join(overridesDir, 'kubejs'), join(gameInstance, 'kubejs'), 'kubejs', opts);
    await transferSelective(join(overridesDir, 'config'), join(gameInstance, 'config'), 'config', opts);
    await transferFull(join(overridesDir, 'mods'), join(gameInstance, 'mods'), 'mods', opts);

    if (externalMods.replacements.length > 0) {
        console.log('\n[mods] ensure external replacements');
        for (const replacement of externalMods.replacements) {
            const target = join(gameInstance, replacement.targetPath);
            if (await exists(target)) {
                if (opts.verbose) console.log(`  present: ${replacement.fileName}`);
                continue;
            }
            console.log(`  FETCH: ${replacement.fileName}`);
            if (!opts.dryRun) {
                await ensureDownloadedFile(replacement.downloadUrl, target);
            }
        }
    }

    if (externalMods.replacements.length > 0) {
        console.log('\n[mods] cleanup replaced CurseForge files');
        for (const replacement of externalMods.replacements) {
            for (const fileName of replacement.removeFileNames ?? []) {
                const target = join(gameInstance, 'mods', fileName);
                if (!(await exists(target))) {
                    if (opts.verbose) console.log(`  missing: ${fileName}`);
                    continue;
                }
                console.log(`  REMOVE: ${fileName}`);
                if (!opts.dryRun) {
                    await rm(target, { force: true });
                }
            }
        }
    }

    if (externalMods.exclusions.length > 0) {
        console.log('\n[mods] cleanup excluded CurseForge files');
        for (const exclusion of externalMods.exclusions) {
            for (const fileName of exclusion.removeFileNames ?? []) {
                const target = join(gameInstance, 'mods', fileName);
                if (!(await exists(target))) {
                    if (opts.verbose) console.log(`  missing: ${fileName}`);
                    continue;
                }
                console.log(`  REMOVE: ${fileName}`);
                if (!opts.dryRun) {
                    await rm(target, { force: true });
                }
            }
        }
    }

    console.log(opts.dryRun ? '\n=== DRY RUN complete. Re-run with --apply to copy. ===' : '\n=== Deploy complete. ===');
}

main().catch(err => { console.error(err); process.exit(1); });
