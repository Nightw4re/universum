/**
 * transfer.mjs — shared file-copy utilities for sync and deploy scripts.
 */

import { join, dirname, relative } from 'path';
import { promises as fs } from 'fs';

export async function exists(p) {
    return fs.access(p).then(() => true).catch(() => false);
}

export async function readDirRecursive(dir, base = dir) {
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

export async function copyFile(src, dst, label, { dryRun, verbose, exclude = [] }) {
    const filename = label.split(/[\\/]/).pop();
    if (exclude.some(pattern => pattern.test(filename))) {
        if (verbose) console.log(`  SKIP (excluded): ${label}`);
        return;
    }

    if (!(await exists(src))) {
        if (verbose) console.log(`  SKIP (missing): ${label}`);
        return;
    }

    if (await exists(dst)) {
        const [srcStat, dstStat] = await Promise.all([fs.stat(src), fs.stat(dst)]);
        if (srcStat.size === dstStat.size && srcStat.mtimeMs <= dstStat.mtimeMs) {
            if (verbose) console.log(`  up-to-date: ${label}`);
            return;
        }
    }

    console.log(`  COPY: ${label}`);
    if (!dryRun) {
        await fs.mkdir(dirname(dst), { recursive: true });
        await fs.copyFile(src, dst);
    }
}

/**
 * Full transfer: copies every file from srcDir to dstDir.
 */
export async function transferFull(srcDir, dstDir, label, opts) {
    if (!(await exists(srcDir))) {
        console.warn(`WARNING: directory not found — ${srcDir}`);
        return;
    }
    console.log(`\n[${label}] full`);
    const files = await readDirRecursive(srcDir);
    for (const rel of files) {
        await copyFile(join(srcDir, rel), join(dstDir, rel), rel, opts);
    }
}

/**
 * Selective transfer: only copies files that already exist in trackedDir.
 * trackedDir defaults to srcDir (correct for deploy: overrides → game).
 * For sync (game → overrides), pass trackedDir = dstDir so only repo-tracked files are pulled.
 */
export async function transferSelective(srcDir, dstDir, label, opts, trackedDir = srcDir) {
    if (!(await exists(srcDir))) {
        console.warn(`WARNING: directory not found — ${srcDir}`);
        return;
    }
    console.log(`\n[${label}] selective (tracked files only)`);
    const trackedFiles = await readDirRecursive(trackedDir);
    for (const rel of trackedFiles) {
        await copyFile(join(srcDir, rel), join(dstDir, rel), rel, opts);
    }
}
