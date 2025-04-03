import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const rootDir = join(dirname(__filename), '../');
const buildDir = join(rootDir, 'build');
const outputZip = join(buildDir, 'modpack.zip');
const changelog = join(rootDir, 'CHANGELOG_LATEST.md');
const modpackDir = join(rootDir, 'modpack');
const baseURI = 'https://minecraft.curseforge.com/';

export {
    rootDir,
    buildDir,
    outputZip,
    changelog,
    modpackDir,
    baseURI,
};
