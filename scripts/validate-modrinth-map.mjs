import { promises as fs } from 'fs';
import { manifest as manifestPath, modrinthFiles as modrinthFilesPath, modrinthProjects as modrinthProjectsPath } from './cfg.mjs';

const modrinthUserAgent = 'universum-modrinth-validator/1.0';

async function readJson(path) {
    return JSON.parse(await fs.readFile(path, 'utf8'));
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
            throw new Error(`HTTP ${response.status}`);
        }

        const versions = await response.json();
        const exactMatch = versions.find((version) => version.files.some((file) => file.filename === fileName)) ?? null;
        if (exactMatch) {
            return exactMatch;
        }
    }

    return null;
}

async function main() {
    const manifest = await readJson(manifestPath);
    const modrinthFiles = await readJson(modrinthFilesPath);
    const modrinthProjects = await readJson(modrinthProjectsPath);

    const mapped = [];
    const missing = [];
    const invalid = [];

    for (const entry of manifest.files) {
        const source = modrinthFiles[`${entry.projectID}:${entry.fileID}`];
        if (!source) {
            invalid.push(`${entry.projectID}: missing source metadata for file ${entry.fileID}`);
            continue;
        }

        const mapping = getProjectMapping(modrinthProjects, entry.projectID);
        if (!mapping) {
            missing.push(`${entry.projectID}: ${source.name} | ${source.fileName}`);
            continue;
        }

        try {
            const targetFileName = mapping.fileName ?? source.fileName;
            const version = await getModrinthVersion(mapping.slug, targetFileName, manifest.minecraft.version);
            if (!version) {
                invalid.push(`${entry.projectID}: ${source.name} | ${mapping.slug} | missing exact file ${targetFileName}`);
                continue;
            }

            mapped.push(`${entry.projectID}: ${mapping.slug} -> ${version.version_number}`);
        } catch (error) {
            invalid.push(`${entry.projectID}: ${source.name} | ${mapping.slug} | ${error.message}`);
        }
    }

    console.log(`Mapped OK: ${mapped.length}`);
    console.log(`Missing slug: ${missing.length}`);
    console.log(`Invalid mapping: ${invalid.length}`);

    if (missing.length > 0) {
        console.log('\nMissing slug entries:');
        console.log(missing.join('\n'));
    }

    if (invalid.length > 0) {
        console.log('\nInvalid mappings:');
        console.log(invalid.join('\n'));
    }

    if (missing.length > 0 || invalid.length > 0) {
        process.exit(1);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
