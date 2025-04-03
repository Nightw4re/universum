import { readFileSync, createReadStream, existsSync } from 'fs';
import fetch from 'node-fetch';
import FormData from 'form-data';
import axios from 'axios';
import { buildDir, changelog, outputZip } from './cfg.mjs';
import packageJson from '../package.json' with { type: 'json' };

const apiToken = process.env.CURSEFORGE_API_TOKEN;
const projectId = process.env.CURSEFORGE_PROJECT_ID;

const baseURI = 'https://minecraft.curseforge.com/';
const uploadURL = `${baseURI}api/projects/${projectId}/upload-file`
const versionURL = `${baseURI}api/game/versions`;

const changelogContext = readFileSync(changelog, 'utf8');

if (!existsSync(buildDir)) {
    throw new Error(`Dir ${buildDir} not found.`);
}

async function uploadToCurseForge() {
    console.info('Retrieving versions.');
    const response = await fetch(
        versionURL,
        {
            method: 'GET',
			headers: {
				'X-Api-Token': apiToken,
			},
        });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const gameVersions = [data.find(val => val.name === '1.21.1')?.id];
    console.log('version id:', gameVersions);

    const formData = new FormData();
    const readStream = createReadStream(outputZip);

    formData.append('file', readStream);
    formData.append('metadata', JSON.stringify({
        'changelog': changelogContext,
        'changelogType': 'markdown',
        'releaseType': 'release',
        'displayName': `universum-${packageJson.version}.zip`,
        gameVersions,
    }));

    console.info('Sending file to API.');

    try {
        const response = await axios.post(
            uploadURL,
            formData,
            {
                headers: {
					'X-Api-Token': apiToken,
                    ...formData.getHeaders(),
                },
            }
        );

        console.info('Upload success:', response.data);

    } catch (error) {
        console.error('Upload failure:', error);
        if (error.response) {
            console.error('response:', error.response.data);
        }
        process.exit(1);
    }
}

uploadToCurseForge();