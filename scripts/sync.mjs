/**
 * sync.mjs
 *
 * Pulls files FROM the local game instance INTO modpack/overrides/.
 *
 * Strategy:
 *   - kubejs/        → full sync (everything is custom)
 *   - config/        → selective sync (only files already tracked in overrides/config)
 *
 * Usage:
 *   node scripts/sync.mjs              # dry-run (shows what would change)
 *   node scripts/sync.mjs --apply      # actually copies files
 *   node scripts/sync.mjs --apply --verbose
 */

import { join } from 'path';
import { exists, transferFull, transferSelective } from './lib/transfer.mjs';
import { gameInstance, overridesDir } from './cfg.mjs';
import { generateManifest } from './manifest.mjs';

const args = process.argv.slice(2);
const opts = { dryRun: !args.includes('--apply'), verbose: args.includes('--verbose') };

if (opts.dryRun) console.log('=== DRY RUN — pass --apply to actually copy files ===\n');

async function main() {
    if (!(await exists(gameInstance))) {
        console.error(`ERROR: Game instance not found at:\n  ${gameInstance}`);
        process.exit(1);
    }
    console.log(`Game instance: ${gameInstance}`);
    console.log(`Overrides dir: ${overridesDir}`);

    await transferFull(join(gameInstance, 'kubejs'), join(overridesDir, 'kubejs'), 'kubejs', opts);
    await transferSelective(join(gameInstance, 'config'), join(overridesDir, 'config'), 'config', opts, join(overridesDir, 'config'));

    if (!opts.dryRun) {
        console.log('\n[manifest] refreshing manifest.json and modlist.html from the game instance');
        await generateManifest();
    }

    console.log(opts.dryRun ? '\n=== DRY RUN complete. Re-run with --apply to copy. ===' : '\n=== Sync complete. ===');
}

main().catch(err => { console.error(err); process.exit(1); });
