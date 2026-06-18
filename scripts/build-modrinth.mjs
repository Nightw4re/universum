import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import archiver from 'archiver';
import { buildDir, gameInstance, manifest as manifestPath, modpackDir } from './cfg.mjs';
import packageJson from '../package.json' with { type: 'json' };

const stagingDir = join(buildDir, 'modrinth-stage');
const outputDir = join(buildDir, 'modrinth');
const outputZip = join(outputDir, `Universum-v${packageJson.version}-modrinth.mrpack`);
const instanceManifestPath = join(gameInstance, 'minecraftinstance.json');
const modrinthUserAgent = 'universum-modrinth-builder/1.0';
const modrinthFallbackProjects = {
    261251: 'bad-wither-no-cookie',
    448233: 'entityculling',
    521480: '3dskinlayers',
    522351: 'library-ferret',
    525480: 'better-village',
    883166: 'stellarity',
    961988: 'aquaculture-delight',
    1023913: 'subtle-effects',
};

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

async function readJson(path) {
    return JSON.parse(await fs.readFile(path, 'utf8'));
}

function getSha1Hash(file) {
    const sha1 = file.hashes?.find((hash) => hash.type === 1)?.value;
    if (!sha1) {
        throw new Error(`Missing SHA-1 hash for CurseForge file ${file.projectId}/${file.id}`);
    }
    return sha1;
}

async function getModrinthVersion(slug, fileName, gameVersion) {
    const params = new URLSearchParams({
        loaders: JSON.stringify(['neoforge']),
        game_versions: JSON.stringify([gameVersion]),
    });
    const response = await fetch(`https://api.modrinth.com/v2/project/${slug}/version?${params}`, {
        headers: { 'User-Agent': modrinthUserAgent },
    });

    if (!response.ok) {
        throw new Error(`Failed to retrieve Modrinth versions for ${slug}: HTTP ${response.status}`);
    }

    const versions = await response.json();
    const exactMatch = versions.find((version) =>
        version.files.some((file) => file.filename === fileName),
    );

    if (!exactMatch) {
        throw new Error(`No Modrinth NeoForge 1.21.1 version found for ${slug} with file ${fileName}`);
    }

    return exactMatch;
}

function makeModrinthFileFromVersion(version, fileName) {
    const file = version.files.find((entry) => entry.filename === fileName);
    if (!file) {
        throw new Error(`Modrinth version ${version.id} is missing file ${fileName}`);
    }

    return {
        path: `mods/${file.filename}`,
        hashes: {
            sha1: file.hashes.sha1,
            sha512: file.hashes.sha512,
        },
        env: {
            client: 'required',
            server: 'required',
        },
        downloads: [file.url],
        fileSize: file.size,
    };
}

async function getModrinthFiles(cfManifest, instanceData) {
    const addons = new Map(
        instanceData.installedAddons.map((addon) => [
            `${addon.installedFile.projectId}:${addon.installedFile.id}`,
            addon,
        ]),
    );

    const files = [];

    for (const manifestFile of cfManifest.files) {
        const key = `${manifestFile.projectID}:${manifestFile.fileID}`;
        const addon = addons.get(key);

        if (!addon) {
            throw new Error(
                `Mod ${key} is present in modpack/manifest.json but missing from ${instanceManifestPath}. ` +
                'Run `npm run manifest` after syncing the CurseForge instance.'
            );
        }

        if (addon.exportDisabledReason !== 0 || addon.allowModDistribution === false) {
            const slug = modrinthFallbackProjects[manifestFile.projectID];
            if (!slug) {
                throw new Error(
                    `Mod ${addon.name} (${key}) is blocked for CurseForge export and has no Modrinth fallback mapping.`
                );
            }

            const version = await getModrinthVersion(slug, addon.installedFile.fileName, cfManifest.minecraft.version);
            files.push(makeModrinthFileFromVersion(version, addon.installedFile.fileName));
            continue;
        }

        const file = addon.installedFile;
        if (!file.downloadUrl) {
            throw new Error(`Missing download URL for ${addon.name} (${key})`);
        }

        files.push({
            path: `mods/${file.fileName}`,
            hashes: {
                sha1: getSha1Hash(file),
            },
            env: {
                client: 'required',
                server: 'required',
            },
            downloads: [file.downloadUrl],
            fileSize: file.fileLength,
        });
    }

    if (files.length === 0) {
        throw new Error('No downloadable mod files were added to modrinth.index.json.');
    }

    return files;
}

async function makeIndex() {
    const cfManifest = await readJson(manifestPath);
    const instanceData = await readJson(instanceManifestPath);
    const neoforge = cfManifest.minecraft.modLoaders.find((loader) => loader.primary)?.id?.replace(/^neoforge-/, '');

    if (!neoforge) {
        throw new Error('Could not determine NeoForge version from modpack/manifest.json');
    }

    const index = {
        formatVersion: 1,
        game: 'minecraft',
        versionId: packageJson.version,
        name: `Universum v${packageJson.version}`,
        summary: 'Stargate-themed NeoForge modpack.',
        files: await getModrinthFiles(cfManifest, instanceData),
        dependencies: {
            minecraft: cfManifest.minecraft.version,
            neoforge,
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
    if (!existsSync(buildDir)) {
        mkdirSync(buildDir, { recursive: true });
    }

    await fs.rm(stagingDir, { recursive: true, force: true });
    await fs.rm(outputDir, { recursive: true, force: true });
    await fs.mkdir(stagingDir, { recursive: true });

    await copyDir(join(modpackDir, 'overrides'), join(stagingDir, 'overrides'));
    await makeIndex();
    await zipDir(stagingDir, outputZip);

    console.log(`Modrinth pack created: ${outputZip}`);
    await fs.rm(stagingDir, { recursive: true, force: true });
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
