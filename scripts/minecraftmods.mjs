import mcdata from '../../../curseforge/minecraft/Instances/Universum/minecraftinstance.json' with { type: 'json' };
import packageJson from '../package.json' with { type: 'json' };
import { writeFile, promises as fs } from 'fs';
import { manifest, modlist, overridesDir } from './cfg.mjs';
import { join } from 'path';

const modpakDir = '../../../curseforge/minecraft/Instances/Universum/';
const folders = ['config', 'kubejs'];

const modloader = mcdata.baseModLoader;

const output = {};
output.minecraft = {
    version: mcdata.gameVersion,
    modLoaders: [
        {
            id: modloader.name,
            primary: true
        }
    ],
    recommendedRam: 8192
};
output.manifestType = "minecraftModpack";
output.manifestVersion = 1;
output.name = "Universum";
output.version = packageJson.version;
output.author = 'Nightw4re';
let files = [];
output.overrides = "overrides";

const installedAddons = mcdata.installedAddons;
for (let i in installedAddons) {
    const addon = mcdata.installedAddons[i];
    const file = addon.installedFile;

    files.push({
        name: addon.name,
        author: addon.primaryAuthor,
        webSiteURL: addon.webSiteURL,
        projectID: file.projectId,
        fileID: file.id
    });
}
files.sort(function(a,b) {
    return a.projectID > b.projectID ? 1 : -1;
});

let html = '<ul>';

files = files.map(function(val) {
    const { projectID, fileID, webSiteURL, name, author } = val;
    html += '\n' + `<li><a href="${webSiteURL}">${name} (by ${author})</a></li>`;
    return {
        projectID,
        fileID,
        "required": true
    };
});
output.files = files;

html += '\n</ul>';

writeFile(manifest, JSON.stringify(output, null, 2), (err) => {
    if (err) {
        console.error("Error writing file:", err);
        return;
    }
    console.log("ManifestFile has been written successfully!");
});

writeFile(modlist, html, (err) => {
    if (err) {
        console.error("Error writing file:", err);
        return;
    }
    console.log("Modlist has been written successfully!");
});

async function copyFilesFromFoldersWithExclusions(sourceDirs, destinationDir, exclusionsRegex = []) {
    try {
        await fs.mkdir(destinationDir, { recursive: true });

        for (const sourceDir of sourceDirs) {
            const sourceDirExists = await fs.access(sourceDir).then(() => true).catch(() => false);
            if (!sourceDirExists) {
                console.warn(`A source dir doesn't exist: ${sourceDir}`);
                continue;
            }

            const items = await fs.readdir(sourceDir, { withFileTypes: true });

            for (const item of items) {
                const sourcePath = join(sourceDir, item.name);
                const destinationPath = join(destinationDir, item.name);

                const shouldExclude = exclusionsRegex.some(regex => new RegExp(regex).test(item.name));

                if (shouldExclude) {
                    console.log(`Excluded ${item.name} in folder ${sourceDir}`);
                    continue;
                }

                if (item.isDirectory()) {
                    const destSubDir = join(destinationDir, item.name);
                    await fs.mkdir(destSubDir, { recursive: true });
                    await copyFilesFromFoldersWithExclusions([sourcePath], destSubDir, exclusionsRegex);
                } else if (item.isFile()) {
                    const destinationDirExists = await fs.access(destinationPath).then(() => true).catch(() => false);
                    if (destinationDirExists) {
                        await fs.copyFile(sourcePath, destinationPath);
                    }
                }
            }
        }

    } catch (error) {
        console.error('Unknown error:', error);
    }
}


function main() {
    folders.forEach(async val => {
        const dest = join(overridesDir, val);
        // const dirExists = await fs.access(dest).then(() => true).catch(() => false);
        // if (dirExists) {
        //     await fs.rm(dest, { recursive: true });
        // }
        await fs.mkdir(dest, { recursive: true });
        await copyFilesFromFoldersWithExclusions([join(modpakDir, val)], dest);
    });
}

main();