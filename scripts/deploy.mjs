/**
 * deploy.mjs
 *
 * Pushes files FROM modpack/overrides/ INTO the local game instance.
 * Opposite direction of sync.mjs.
 *
 * Strategy:
 *   - kubejs/        → full deploy (everything is custom)
 *   - config/        → selective deploy (only files tracked in overrides/config)
 *   - resourcepacks/ → full deploy
 *
 * Usage:
 *   node scripts/deploy.mjs              # dry-run (shows what would change)
 *   node scripts/deploy.mjs --apply      # actually copies files
 *   node scripts/deploy.mjs --apply --verbose
 */

import { join } from 'path';
import { exists, transferFull, transferSelective } from './lib/transfer.mjs';
import { gameInstance, overridesDir } from './cfg.mjs';

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

    await transferFull(join(overridesDir, 'kubejs'), join(gameInstance, 'kubejs'), 'kubejs', opts);
    await transferSelective(join(overridesDir, 'config'), join(gameInstance, 'config'), 'config', opts);
    await transferFull(join(overridesDir, 'resourcepacks'), join(gameInstance, 'resourcepacks'), 'resourcepacks', opts);

    console.log(opts.dryRun ? '\n=== DRY RUN complete. Re-run with --apply to copy. ===' : '\n=== Deploy complete. ===');
}

main().catch(err => { console.error(err); process.exit(1); });
