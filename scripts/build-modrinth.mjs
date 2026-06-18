import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import archiver from 'archiver';
import {
    buildDir,
    externalMods as externalModsPath,
    gameInstance,
    manifest as manifestPath,
    modpackDir,
    modrinthFiles as modrinthFilesPath,
    modrinthProjects as modrinthProjectsPath,
} from './cfg.mjs';
import packageJson from '../package.json' with { type: 'json' };

const stagingDir = join(buildDir, 'modrinth-stage');
const outputDir = join(buildDir, 'modrinth');
const outputZip = join(outputDir, `Universum-v${packageJson.version}-modrinth.mrpack`);
const instanceManifestPath = join(gameInstance, 'minecraftinstance.json');
const modrinthUserAgent = 'universum-modrinth-builder/1.0';
const allowedDownloadHosts = new Set([
    'cdn.modrinth.com',
    'github.com',
    'raw.githubusercontent.com',
    'gitlab.com',
]);

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

async function readExternalMods() {
    if (!existsSync(externalModsPath)) {
        return { replacements: [], exclusions: [] };
    }

    return await readJson(externalModsPath);
}

function getSha1Hash(modFile) {
    const sha1 = modFile.hashes?.find((hash) => hash.type === 1)?.value;
    if (!sha1) {
        throw new Error(`Missing SHA-1 hash for CurseForge file ${modFile.projectID}/${modFile.fileID}`);
    }
    return sha1;
}

async function ensureParentDir(path) {
    await fs.mkdir(dirname(path), { recursive: true });
}

async function copyOrDownloadBundledMod(modFile, destinationPath) {
    const localPath = join(gameInstance, 'mods', modFile.fileName);
    if (existsSync(localPath)) {
        await ensureParentDir(destinationPath);
        await fs.copyFile(localPath, destinationPath);
        return 'local';
    }

    if (!modFile.downloadUrl) {
        throw new Error(`Missing download URL for bundled mod ${modFile.name} (${modFile.projectID}:${modFile.fileID})`);
    }

    const response = await fetch(modFile.downloadUrl, {
        headers: { 'User-Agent': modrinthUserAgent },
    });

    if (!response.ok) {
        throw new Error(`Failed to download bundled mod ${modFile.name}: HTTP ${response.status}`);
    }

    await ensureParentDir(destinationPath);
    const data = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(destinationPath, data);
    return 'download';
}

async function downloadExternalReplacement(replacement, destinationPath) {
    const response = await fetch(replacement.downloadUrl, {
        headers: { 'User-Agent': modrinthUserAgent },
    });

    if (!response.ok) {
        throw new Error(`Failed to download external replacement ${replacement.name}: HTTP ${response.status}`);
    }

    await ensureParentDir(destinationPath);
    const data = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(destinationPath, data);
}

function makeVersionQueries(fileName, gameVersion) {
    const queries = [
        { gameVersion, loaders: ['neoforge'] },
        { gameVersion: '1.21', loaders: ['neoforge'] },
    ];

    if (fileName.endsWith('.zip')) {
        queries.push(
            { gameVersion },
            { gameVersion: '1.21' },
            {},
        );
    }

    return queries;
}

async function getModrinthVersion(slug, fileName, gameVersion) {
    for (const query of makeVersionQueries(fileName, gameVersion)) {
        const params = new URLSearchParams();
        if (query.loaders) {
            params.set('loaders', JSON.stringify(query.loaders));
        }
        if (query.gameVersion) {
            params.set('game_versions', JSON.stringify([query.gameVersion]));
        }
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

        if (exactMatch) {
            return exactMatch;
        }
    }
    throw new Error(`No Modrinth version found for ${slug} with file ${fileName}`);
}

async function getModrinthProjectMap() {
    if (!existsSync(modrinthProjectsPath)) {
        return {};
    }

    return await readJson(modrinthProjectsPath);
}

function getProjectMapping(projects, projectID) {
    const entry = projects[String(projectID)];
    if (!entry) {
        return null;
    }

    if (typeof entry === 'string') {
        return { slug: entry };
    }

    if (typeof entry.slug !== 'string' || entry.slug.length === 0) {
        throw new Error(`Invalid Modrinth mapping for project ${projectID}`);
    }

    return entry;
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

async function getRepoSourceFiles() {
    if (!existsSync(modrinthFilesPath)) {
        return null;
    }

    const metadata = await readJson(modrinthFilesPath);
    return new Map(Object.entries(metadata));
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

async function getSourceFiles() {
    const repoFiles = await getRepoSourceFiles();
    if (repoFiles) {
        return repoFiles;
    }

    const localFiles = await getLocalInstanceFiles();
    if (localFiles) {
        return localFiles;
    }

    throw new Error(
        `Missing ${modrinthFilesPath} and ${instanceManifestPath}. ` +
        'Run `npm run manifest` locally and commit modpack/modrinth-files.json.'
    );
}

async function getModrinthBuildPlan(cfManifest, sourceFiles) {
    const modrinthProjects = await getModrinthProjectMap();
    const files = [];
    const bundled = [];

    for (const manifestFile of cfManifest.files) {
        const key = `${manifestFile.projectID}:${manifestFile.fileID}`;
        const modFile = sourceFiles.get(key);

        if (!modFile) {
            throw new Error(
                `Mod ${key} is present in modpack/manifest.json but missing from resolved CurseForge metadata.`
            );
        }

        const mapping = getProjectMapping(modrinthProjects, manifestFile.projectID);
        if (mapping) {
            const targetFileName = mapping.fileName ?? modFile.fileName;
            const version = await getModrinthVersion(mapping.slug, targetFileName, cfManifest.minecraft.version);
            files.push(makeModrinthFileFromVersion(version, targetFileName));
            continue;
        }

        if (!modFile.downloadUrl) {
            throw new Error(`Missing download URL for ${modFile.name} (${key})`);
        }

        const host = new URL(modFile.downloadUrl).host;
        if (!allowedDownloadHosts.has(host)) {
            bundled.push(modFile);
            continue;
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

    return { files, bundled };
}

async function makeIndex() {
    const cfManifest = await readJson(manifestPath);
    const sourceFiles = await getSourceFiles();
    const neoforge = cfManifest.minecraft.modLoaders.find((loader) => loader.primary)?.id?.replace(/^neoforge-/, '');

    if (!neoforge) {
        throw new Error('Could not determine NeoForge version from modpack/manifest.json');
    }

    const plan = await getModrinthBuildPlan(cfManifest, sourceFiles);
    const externalMods = await readExternalMods();
    const bundledReport = [];

    for (const modFile of plan.bundled) {
        const source = await copyOrDownloadBundledMod(
            modFile,
            join(stagingDir, 'overrides', 'mods', modFile.fileName),
        );
        bundledReport.push({
            name: modFile.name,
            fileName: modFile.fileName,
            source,
        });
    }

    for (const replacement of externalMods.replacements) {
        await downloadExternalReplacement(
            replacement,
            join(stagingDir, 'overrides', replacement.targetPath),
        );
        bundledReport.push({
            name: replacement.name,
            fileName: replacement.fileName,
            source: 'external',
        });
    }

    const index = {
        formatVersion: 1,
        game: 'minecraft',
        versionId: packageJson.version,
        name: `Universum v${packageJson.version}`,
        summary: 'Stargate-themed NeoForge modpack.',
        files: plan.files,
        dependencies: {
            minecraft: cfManifest.minecraft.version,
            neoforge,
        },
    };

    await fs.writeFile(join(stagingDir, 'modrinth.index.json'), JSON.stringify(index, null, 2), 'utf8');
    return bundledReport;
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
    const bundledReport = await makeIndex();
    await zipDir(stagingDir, outputZip);

    console.log(`Modrinth pack created: ${outputZip}`);
    if (bundledReport.length > 0) {
        console.log(`Bundled CurseForge-only mods: ${bundledReport.length}`);
        for (const entry of bundledReport) {
            console.log(`- ${entry.name} | ${entry.fileName} | ${entry.source}`);
        }
    }
    await fs.rm(stagingDir, { recursive: true, force: true });
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
