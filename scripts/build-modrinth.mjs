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
const curseForgeApiToken = process.env.CURSEFORGE_API_TOKEN;
const curseForgeFilesUrl = 'https://api.curseforge.com/v1/mods/files';
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

function getSha1Hash(modFile) {
    const sha1 = modFile.hashes?.find((hash) => hash.type === 1)?.value;
    if (!sha1) {
        throw new Error(`Missing SHA-1 hash for CurseForge file ${modFile.projectID}/${modFile.fileID}`);
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

function normalizeInstanceFile(addon) {
    const file = addon.installedFile;

    return {
        name: addon.name,
        projectID: file.projectId,
        fileID: file.id,
        fileName: file.fileName,
        downloadUrl: file.downloadUrl,
        fileLength: file.fileLength,
        hashes: file.hashes,
        blocked: addon.exportDisabledReason !== 0 || addon.allowModDistribution === false,
    };
}

function normalizeCurseForgeFile(manifestFile, file) {
    return {
        name: file.displayName || file.fileName,
        projectID: manifestFile.projectID,
        fileID: file.id,
        fileName: file.fileName,
        downloadUrl: file.downloadUrl,
        fileLength: file.fileLength,
        hashes: file.hashes,
        blocked: Boolean(modrinthFallbackProjects[manifestFile.projectID]),
    };
}

async function getLocalInstanceFiles() {
    if (!existsSync(instanceManifestPath)) {
        return null;
    }

    const instanceData = await readJson(instanceManifestPath);
    return new Map(
        instanceData.installedAddons.map((addon) => {
            const file = normalizeInstanceFile(addon);
            return [`${file.projectID}:${file.fileID}`, file];
        }),
    );
}

async function getCurseForgeFiles(cfManifest) {
    if (!curseForgeApiToken) {
        throw new Error(
            `Missing ${instanceManifestPath} and CURSEFORGE_API_TOKEN is not set. ` +
            'Set CURSEFORGE_API_TOKEN in CI so Modrinth builds can resolve CurseForge file metadata.'
        );
    }

    const response = await fetch(curseForgeFilesUrl, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'x-api-key': curseForgeApiToken,
        },
        body: JSON.stringify({
            fileIds: cfManifest.files.map((file) => file.fileID),
        }),
    });

    if (!response.ok) {
        throw new Error(`Failed to retrieve CurseForge file metadata: HTTP ${response.status}`);
    }

    const payload = await response.json();
    const filesById = new Map(payload.data.map((file) => [file.id, file]));

    return new Map(
        cfManifest.files.map((manifestFile) => {
            const file = filesById.get(manifestFile.fileID);
            if (!file) {
                throw new Error(`CurseForge API did not return metadata for file ${manifestFile.fileID}`);
            }

            const normalized = normalizeCurseForgeFile(manifestFile, file);
            return [`${normalized.projectID}:${normalized.fileID}`, normalized];
        }),
    );
}

async function getSourceFiles(cfManifest) {
    return await getLocalInstanceFiles() ?? await getCurseForgeFiles(cfManifest);
}

async function getModrinthFiles(cfManifest, sourceFiles) {

    const files = [];

    for (const manifestFile of cfManifest.files) {
        const key = `${manifestFile.projectID}:${manifestFile.fileID}`;
        const modFile = sourceFiles.get(key);

        if (!modFile) {
            throw new Error(
                `Mod ${key} is present in modpack/manifest.json but missing from resolved CurseForge metadata.`
            );
        }

        if (modFile.blocked) {
            const slug = modrinthFallbackProjects[manifestFile.projectID];
            if (!slug) {
                throw new Error(
                    `Mod ${modFile.name} (${key}) is blocked for CurseForge export and has no Modrinth fallback mapping.`
                );
            }

            const version = await getModrinthVersion(slug, modFile.fileName, cfManifest.minecraft.version);
            files.push(makeModrinthFileFromVersion(version, modFile.fileName));
            continue;
        }

        if (!modFile.downloadUrl) {
            throw new Error(`Missing download URL for ${modFile.name} (${key})`);
        }

        files.push({
            path: `mods/${modFile.fileName}`,
            hashes: {
                sha1: getSha1Hash(modFile),
            },
            env: {
                client: 'required',
                server: 'required',
            },
            downloads: [modFile.downloadUrl],
            fileSize: modFile.fileLength,
        });
    }

    if (files.length === 0) {
        throw new Error('No downloadable mod files were added to modrinth.index.json.');
    }

    return files;
}

async function makeIndex() {
    const cfManifest = await readJson(manifestPath);
    const sourceFiles = await getSourceFiles(cfManifest);
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
        files: await getModrinthFiles(cfManifest, sourceFiles),
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
