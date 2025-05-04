import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const rootDir = join(dirname(__filename), '../');
const buildDir = join(rootDir, 'build');
const outputZip = join(buildDir, 'modpack.zip');
const changelog = join(rootDir, 'CHANGELOG_LATEST.md');
const modpackDir = join(rootDir, 'modpack');
const overridesDir = join(modpackDir, 'overrides');
const manifest = join(modpackDir, 'manifest.json');
const modlist = join(modpackDir, 'modlist.html');
const baseURI = 'https://minecraft.curseforge.com/';

export {
    rootDir,
    buildDir,
    outputZip,
    changelog,
    modpackDir,
    baseURI,
    modlist,
    overridesDir,
    manifest
};
