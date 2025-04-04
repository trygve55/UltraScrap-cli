import { setLoginCookie } from './utils/login.js';
import { downloadSong } from './songs/downloadSong.js';
import promptInit from 'prompt-sync';
import minimist from 'minimist';

await setLoginCookie();
export const prompt = promptInit({ sigint: true })

const options = {
	alias: {
		o: 'downloadDir',
	},
	default: {
		downloadDir: 'songs'
	}
};

var argv = minimist(process.argv.slice(2), options);

let songIds: string[] =  argv._;

console.log('Downloading songs to directory: \"' + argv.downloadDir + '"');

if (songIds.length === 0) {
    await interactiveMode();
} else {
    await batchMode();
}

async function batchMode() {
    console.log('Running batch mode for song ids: ' + songIds);
    for (let songIdIndex = 0; songIdIndex < songIds.length; songIdIndex++) {
        await downloadSong(songIds[songIdIndex], argv.downloadDir);
    }
}

async function interactiveMode() {
    while (true) {
        console.log(''); // Creates gap between downloaded songs. Do not use \n in prompt, it will cause visual glitches
        const songId = prompt('Input song id: ');
        await downloadSong(songId, argv.downloadDir);
    }
}