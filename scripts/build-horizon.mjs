import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import archiver from 'archiver';
import { buildDir, rootDir } from './cfg.mjs';

const readJson = async (path) => JSON.parse(await readFile(join(rootDir, path), 'utf8'));
const [pack, profile] = await Promise.all([
    readJson('content/pack.json'),
    readJson('targets/horizon-26.3/profile.json'),
]);

const idPattern = /^[a-z0-9_]{1,64}$/;
const versionPattern = /^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/;
const revisionPattern = /^[a-f0-9]{40}$/;
const checksumPattern = /^[a-f0-9]{64}$/;
const modIds = new Set(profile.mods.map(({ id }) => id));

if (!idPattern.test(profile.id) || !versionPattern.test(profile.version) || profile.game !== '26.3'
    || !revisionPattern.test(profile.runtime.horizon) || !revisionPattern.test(profile.runtime.mixins)
    || modIds.size !== profile.mods.length || profile.mods.length === 0) {
    throw new Error('Invalid Horizon profile, runtime pin or duplicate mod IDs.');
}

for (const mod of profile.mods) {
    if (!idPattern.test(mod.id) || !versionPattern.test(mod.version) || !checksumPattern.test(mod.sha256)) {
        throw new Error(`Invalid mod pin: ${mod.id}`);
    }
}

// Check the reviewed registry before emitting dependency references for the launcher.
const registryUrl = 'https://horizon-rust.github.io/horizon-mods/index.json';
const response = await fetch(registryUrl, { signal: AbortSignal.timeout(30_000) });
if (!response.ok) {
    throw new Error(`Horizon registry returned HTTP ${response.status}.`);
}

const registry = await response.json();
if (registry.schema !== 1) {
    throw new Error('Unsupported Horizon registry schema.');
}

const expectedApi = `native-1/${profile.runtime.horizon}/${profile.runtime.mixins}`;
for (const mod of profile.mods) {
    const project = registry.projects.find((entry) => entry.id === mod.id);
    const version = project?.versions.find((entry) => entry.version === mod.version);
    const revoked = registry.revoked?.some((entry) =>
        entry.id === mod.id && (!entry.sha256 || entry.sha256 === mod.sha256));
    if (project?.kind !== 'native-mod' || version?.game !== profile.game || version.api !== expectedApi
        || version.file?.sha256 !== mod.sha256 || revoked) {
        throw new Error(`Registry entry for ${mod.id} ${mod.version} does not match its locked build.`);
    }
}

const quoted = JSON.stringify;
const manifest = [
    'format = 1',
    `id = ${quoted(profile.id)}`,
    `name = ${quoted(`${pack.name} Horizon Dev`)}`,
    `version = ${quoted(profile.version)}`,
    `description = ${quoted(profile.description)}`,
    `authors = ${quoted(pack.authors)}`,
    `game = ${quoted(profile.game)}`,
];
for (const mod of profile.mods) {
    manifest.push('', '[[mods]]', `id = ${quoted(mod.id)}`, `version = ${quoted(mod.version)}`,
        `sha256 = ${quoted(mod.sha256)}`);
}

const archive = archiver('zip', { forceLocalTime: false });
archive.on('warning', (error) => archive.destroy(error));
archive.append(`${manifest.join('\n')}\n`, {
    name: 'horizon-modpack.toml',
    date: new Date('2000-01-01T00:00:00Z'),
});
const chunks = [];
await Promise.all([
    archive.finalize(),
    (async () => {
        for await (const chunk of archive) chunks.push(chunk);
    })(),
]);

const output = join(buildDir, 'horizon-26.3', `universum-horizon-${profile.version}.hpack`);
const bytes = Buffer.concat(chunks);
await mkdir(join(buildDir, 'horizon-26.3'), { recursive: true });
await writeFile(output, bytes);
console.log(`Built ${relative(rootDir, output)} for ${profile.runtime.horizon}`);
console.log(`SHA-256 ${createHash('sha256').update(bytes).digest('hex')}`);
