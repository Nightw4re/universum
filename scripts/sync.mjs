/**
 * sync.mjs
 *
 * Synchronizes files from the local game instance INTO modpack/overrides/.
 *
 * Strategy:
 *   - kubejs/       → full sync (everything is custom)
 *   - config/       → selective sync — only files already tracked in overrides/config
 *                     (prevents pulling thousands of default mod configs)
 *   - resourcepacks/ → full sync
 *
 * Usage:
 *   node scripts/sync.mjs              # dry-run (shows what would change)
 *   node scripts/sync.mjs --apply      # actually copies files
 *   node scripts/sync.mjs --apply --verbose
 */

import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const rootDir = join(dirname(__filename), '..');
const gamePath = join(rootDir, '..', '..', 'curseforge', 'minecraft', 'Instances', 'Universum');
const overridesDir = join(rootDir, 'modpack', 'overrides');

const args = process.argv.slice(2);
const DRY_RUN = !args.includes('--apply');
const VERBOSE = args.includes('--verbose');

if (DRY_RUN) {
    console.log('=== DRY RUN — pass --apply to actually copy files ===\n');
}

// ── helpers ──────────────────────────────────────────────────────────────────

async function exists(p) {
    return fs.access(p).then(() => true).catch(() => false);
}

async function readDirRecursive(dir, base = dir) {
    const result = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) {
            result.push(...await readDirRecursive(full, base));
        } else {
            result.push(relative(base, full));
        }
    }
    return result;
}

async function syncFile(src, dst, label) {
    if (!(await exists(src))) {
        if (VERBOSE) console.log(`  SKIP (missing in game): ${label}`);
        return;
    }

    let changed = true;
    if (await exists(dst)) {
        const [srcStat, dstStat] = await Promise.all([fs.stat(src), fs.stat(dst)]);
        if (srcStat.size === dstStat.size && srcStat.mtimeMs <= dstStat.mtimeMs) {
            // quick size+mtime check — treat as unchanged
            changed = false;
        }
    }

    if (!changed) {
        if (VERBOSE) console.log(`  up-to-date: ${label}`);
        return;
    }

    console.log(`  COPY: ${label}`);
    if (!DRY_RUN) {
        await fs.mkdir(dirname(dst), { recursive: true });
        await fs.copyFile(src, dst);
    }
}

// ── sync strategies ───────────────────────────────────────────────────────────

/**
 * Full sync: copies every file from gameSrcDir to dstDir.
 * Files that exist in dst but not in src are left alone (no deletes).
 */
async function syncFull(gameSrcDir, dstDir, label) {
    if (!(await exists(gameSrcDir))) {
        console.warn(`WARNING: game dir not found — ${gameSrcDir}`);
        return;
    }
    console.log(`\n[${label}] full sync`);
    const files = await readDirRecursive(gameSrcDir);
    for (const rel of files) {
        await syncFile(join(gameSrcDir, rel), join(dstDir, rel), rel);
    }
}

/**
 * Selective sync: only copies files that already exist in dstDir (tracked files).
 * Recursively walks dstDir to build the list of tracked paths.
 */
async function syncSelective(gameSrcDir, dstDir, label) {
    if (!(await exists(gameSrcDir))) {
        console.warn(`WARNING: game dir not found — ${gameSrcDir}`);
        return;
    }
    console.log(`\n[${label}] selective sync (tracked files only)`);
    const trackedFiles = await readDirRecursive(dstDir);
    for (const rel of trackedFiles) {
        await syncFile(join(gameSrcDir, rel), join(dstDir, rel), rel);
    }
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
    const gameExists = await exists(gamePath);
    if (!gameExists) {
        console.error(`ERROR: Game instance not found at:\n  ${gamePath}`);
        process.exit(1);
    }
    console.log(`Game instance: ${gamePath}`);
    console.log(`Overrides dir: ${overridesDir}\n`);

    await syncFull(
        join(gamePath, 'kubejs'),
        join(overridesDir, 'kubejs'),
        'kubejs'
    );

    await syncSelective(
        join(gamePath, 'config'),
        join(overridesDir, 'config'),
        'config'
    );

    await syncFull(
        join(gamePath, 'resourcepacks'),
        join(overridesDir, 'resourcepacks'),
        'resourcepacks'
    );

    console.log(DRY_RUN ? '\n=== DRY RUN complete. Re-run with --apply to copy. ===' : '\n=== Sync complete. ===');
}

main().catch(err => { console.error(err); process.exit(1); });
