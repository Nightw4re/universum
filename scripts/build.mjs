import { createWriteStream, existsSync, mkdirSync } from 'fs';
import archiver from 'archiver';
import { buildDir, modpackDir, outputZip } from './cfg.mjs';

async function makeZip() {

	if (!existsSync(buildDir)) {
		mkdirSync(buildDir, { recursive: true });
		console.log(`Dir ${buildDir} created.`);
	}

	// make ZIP arch
	const output = createWriteStream(outputZip);
	const archive = archiver('zip', { zlib: { level: 9 } });

	output.on('close', async () => {
		console.log('ZIP made:', archive.pointer() + ' bytes');
	});

	archive.on('error', (err) => {
		console.error('compression error for ZIP file:', err);
		process.exit(1);
	});

	archive.pipe(output);
	archive.directory(modpackDir, false);
	archive.finalize();
}

makeZip();