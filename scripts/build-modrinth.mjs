import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import archiver from 'archiver';
import { buildDir, modpackDir, rootDir } from './cfg.mjs';
import packageJson from '../package.json' with { type: 'json' };

const stagingDir = join(buildDir, 'modrinth-stage');
const outputDir = join(buildDir, 'modrinth');
const outputZip = join(outputDir, `Universum-v${packageJson.version}-modrinth.zip`);

async function copyDir(src, dst) {
    await fs.mkdir(dst, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });
    for (const entry of entries) {
        const from = join(src, entry.name);
        const to = join(dst, entry.name);
        if (entry.isDirectory()) {
            await copyDir(from, to);
        } else {
            await fs.copyFile(from, to);
        }
    }
}

async function makeIndex() {
    const index = {
        format_version: 1,
        game: 'minecraft',
        versionId: packageJson.version,
        name: `Universum v${packageJson.version}`,
        summary: 'Stargate-themed NeoForge modpack.',
        files: [],
        dependencies: {
            minecraft: '1.21.1',
            neoforge: '21.1.218',
        },
    };

    await fs.writeFile(join(stagingDir, 'modrinth.index.json'), JSON.stringify(index, null, 2), 'utf8');
}

async function zipDir(sourceDir, zipPath) {
    await fs.mkdir(dirname(zipPath), { recursive: true });
    const output = createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);
    archive.directory(sourceDir, false);

    await new Promise((resolve, reject) => {
        output.on('close', resolve);
        archive.on('error', reject);
        archive.finalize();
    });
}

async function main() {
    if (!existsSync(buildDir)) mkdirSync(buildDir, { recursive: true });
    await fs.rm(stagingDir, { recursive: true, force: true });
    await fs.rm(outputDir, { recursive: true, force: true });
    await fs.mkdir(stagingDir, { recursive: true });
    await copyDir(join(modpackDir, 'overrides'), join(stagingDir, 'overrides'));
    await makeIndex();
    await zipDir(stagingDir, outputZip);
    console.log(`Modrinth pack created: ${outputZip}`);
    await fs.rm(stagingDir, { recursive: true, force: true });
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
