import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const rootDir = join(dirname(__filename), '../');

// Game instance path — override via GAME_INSTANCE env var if the project
// is not sitting next to the CurseForge installations folder.
// Example: GAME_INSTANCE="D:/Games/CurseForge/minecraft/Instances/Universum"
const gameInstance = process.env.GAME_INSTANCE
    || join(rootDir, '..', '..', 'curseforge', 'minecraft', 'Instances', 'Universum');

// Server instance — contains server-only mods on top of the base modpack.
// Override via SERVER_INSTANCE env var if needed.
const serverInstance = process.env.SERVER_INSTANCE
    || join(rootDir, '..', '..', 'curseforge', 'minecraft', 'Instances', 'Universum-server');

const buildDir = join(rootDir, 'build');
const outputZip = join(buildDir, 'modpack.zip');
const modpackDir = join(rootDir, 'modpack');
const overridesDir = join(modpackDir, 'overrides');
const manifest = join(modpackDir, 'manifest.json');
const modlist = join(modpackDir, 'modlist.html');
const baseURI = 'https://minecraft.curseforge.com/';

export {
    rootDir,
    gameInstance,
    serverInstance,
    buildDir,
    outputZip,
    modpackDir,
    baseURI,
    modlist,
    overridesDir,
    manifest,
};
